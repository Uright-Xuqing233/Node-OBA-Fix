import nodeCluster from 'cluster';
import colors from 'colors/safe.js';
import { HTTPError } from 'got';
import { max } from 'lodash-es';
import ms from 'ms';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Cluster } from './cluster.js';
import { config } from './config.js';
import { logger } from './logger.js';
import { TokenManager } from './token.js';
import { IFileList } from './types.js';
import got from 'got';
import fs from 'fs-extra';

const davStorageUrl = process.env.CLUSTER_STORAGE_OPTIONS ? JSON.parse(process.env.CLUSTER_STORAGE_OPTIONS) : {};
const davBaseUrl = `${davStorageUrl.url}/${davStorageUrl.basePath}`;
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const storageType = process.env.CLUSTER_STORAGE || 'file'; // 检查存储类型
const startuplimit = parseInt(process.env.STARTUP_LIMIT || '90', 10);
const STARTUP_LIMIT_WAIT_TIMEOUT = parseInt(process.env.STARTUP_LIMIT_WAIT_TIMEOUT || '600', 10);

// 检查上线次数是否超过限制
function isExceedLimit(startupTimes: number[], limit: number): boolean {
  return startupTimes.length > limit;
}

// 删除超过 24 小时的上线记录
function filterRecentStartupTimes(startupTimes: number[]): number[] {
  const now = Date.now();
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
  return startupTimes.filter((timestamp) => now - timestamp <= twentyFourHoursInMs);
}

async function createAndUploadFileToAlist(size: number): Promise<string> {
  const content = Buffer.alloc(size * 1024 * 1024, '0066ccff', 'hex');
  const uploadUrl = `${davBaseUrl}/measure/${size}MB`;

  try {
    await got.put(uploadUrl, {
      body: content,
      headers: {
        Authorization: `Basic ${Buffer.from(`${davStorageUrl.username}:${davStorageUrl.password}`).toString('base64')}`,
        'Content-Type': 'application/octet-stream'
      },
      https: { rejectUnauthorized: false }
    });
    logger.debug(`测速文件已成功上传: ${uploadUrl}`);
  } catch (uploadError: any) {
    logger.error(`测速文件上传失败: ${uploadError}`);
    if (uploadError.response) {
      logger.error(`测速文件上传响应状态码: ${uploadError.response.statusCode}`);
      logger.error(`测速文件上传相应body: ${uploadError.response.body}`);
    }
    throw uploadError;
  }
  return uploadUrl;
}

export async function bootstrap(version: string, protocol_version: string): Promise<void> {
  logger.info(colors.green(`Booting Node-OBA-Fix`));
  logger.info(colors.green(`当前版本: ${version}`));
  logger.info(colors.green(`协议版本: ${protocol_version}`));

  const startupFilePath = join('data', 'startup.json');

  // 确保 data 目录存在
  await fs.ensureDir(dirname(startupFilePath));

  // 读取 startup.json 文件，不存在则初始化
  let startupTimes: number[] = [];
  if (await fs.pathExists(startupFilePath)) {
    const data = await fs.readFile(startupFilePath, 'utf-8');
    startupTimes = JSON.parse(data);
  }

  // 删除超过 24 小时的上线记录
  startupTimes = filterRecentStartupTimes(startupTimes);

  // 保存更新后的上线记录
  await fs.writeFile(startupFilePath, JSON.stringify(startupTimes, null, 2), 'utf-8');

  // 检查上线次数是否超过限制
  if (isExceedLimit(startupTimes, startuplimit)) {
    logger.warn(`24h 内启动次数超过 ${startuplimit} 次, 继续启动有被主控封禁的风险, 请输入 yes 进行强制启动`);
    logger.warn(`当前 24h 内启动次数为 ${startupTimes.length} 次`);
    // 创建一个 Promise，等待用户输入或超时
    const answer = await Promise.race([
      new Promise<string>((resolve) => {
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
      }),
      new Promise<string>((resolve) => {
        setTimeout(() => resolve('timeout'), STARTUP_LIMIT_WAIT_TIMEOUT*1000);
      }),
    ]);

    if (answer === 'timeout') {
      // 如果超时，则隔一段时间再检查一次是否超限
      logger.warn(`等待回复超时, ${STARTUP_LIMIT_WAIT_TIMEOUT} 秒后再次检测是否超限`);
    
      // 封装为promise
      const checkLimitPromise = new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          // 读取
          const data = await fs.readFile(startupFilePath, 'utf-8');
          startupTimes = JSON.parse(data);
          // 删除超过 24 小时的上线记录
          startupTimes = filterRecentStartupTimes(startupTimes);
          // 再次判断是否超限
          if (isExceedLimit(startupTimes, startuplimit)) {
            logger.warn(`24h 内上线次数超过 ${startuplimit} 次, 已取消启动`);
            clearInterval(interval); // 停止定时器
            reject(new Error('启动次数超限')); // 拒绝 Promise
          } else {
            resolve(); // 检查通过，启动!
          }
        }, STARTUP_LIMIT_WAIT_TIMEOUT*1000);
      });
    
      try {
        // 等待定时器的检查结果
        await checkLimitPromise;
      } catch (error) {
        // 超限，退出程序
        process.exit(1);
      }
    } else if (answer.toLowerCase() !== 'yes') {
      logger.warn(`24h 内上线次数超过 ${startuplimit} 次, 已取消启动`);
      process.exit(1);
    }
  }
  
  const tokenManager = new TokenManager(config.clusterId, config.clusterSecret, protocol_version);
  await tokenManager.getToken();
  const cluster = new Cluster(config.clusterSecret, protocol_version, tokenManager);
  await cluster.init();
  cluster.connect();

  let proto: 'http' | 'https' = 'https';
  if (config.byoc) {
    // 当 BYOC 但是没有提供证书时，使用 http
    if (!config.sslCert || !config.sslKey) {
      proto = 'http';
    } else {
      logger.info('使用自定义证书');
      await cluster.useSelfCert();
    }
  } else {
    logger.info('请求证书');
    await cluster.requestCert();
  }

  if (config.enableNginx) {
    logger.debug('正在启用Nginx');
    if (typeof cluster.port === 'number') {
      logger.debug('Nginx端口合法, 正在启动');
      await cluster.setupNginx(join(__dirname, '..'), cluster.port, proto);
    } else {
      throw new Error('Nginx端口不合法');
    }
  }
  logger.debug('正在启动Express服务');
  const server = cluster.setupExpress(proto === 'https' && !config.enableNginx);
  logger.debug('正在监听端口');
  await cluster.listen();
  logger.debug('正在检查端口');
  await cluster.portCheck();

  const storageReady = await cluster.storage.check();
  if (!storageReady) {
    throw new Error('存储异常');
  }

  // 如果是 alist 类型存储，生成 10MB 的测速文件
  if (storageType === 'alist') {
    logger.debug('准备生成测速文件');
    try {
      // 同时生成 1MB 和 10MB 测速文件
      await Promise.all([
        createAndUploadFileToAlist(1),
        createAndUploadFileToAlist(10),
      ]);
    } catch (error) {
      logger.error(error, '生成测速文件失败');
      throw new Error('测速文件生成失败');
    }
  }
  

  const configuration = await cluster.getConfiguration();
  const files = await cluster.getFileList();
  logger.info(`${files.files.length} files`);
  try {
    await cluster.syncFiles(files, configuration.sync);
  } catch (e) {
    if (e instanceof HTTPError) {
      logger.error({ url: e.response.url }, '下载失败');
    }
    throw e;
  }
  logger.info('回收文件');
  cluster.gcBackground(files);

  let checkFileInterval: NodeJS.Timeout;
  try {
    logger.info('请求上线');
    await cluster.enable();

    logger.info(colors.rainbow(`节点启动完毕, 正在提供 ${files.files.length} 个文件`));
    if (nodeCluster.isWorker && typeof process.send === 'function') {
      process.send('ready');
    }

    checkFileInterval = setTimeout(() => {
      void checkFile(files).catch((e) => {
        logger.error(e, '文件检查失败');
      });
    }, ms('10m'));
  } catch (e) {
    logger.fatal(e);
    if (process.env.NODE_ENV === 'development') {
      logger.fatal('调试模式已开启, 不进行退出');
    } else {
      cluster.exit(1);
    }
  }

  async function checkFile(lastFileList: IFileList): Promise<void> {
    logger.debug('刷新文件中');
    try {
      const lastModified = max(lastFileList.files.map((file) => file.mtime));
      const fileList = await cluster.getFileList(lastModified);
      if (fileList.files.length === 0) {
        logger.debug('没有新文件');
        return;
      }
      const configuration = await cluster.getConfiguration();
      await cluster.syncFiles(files, configuration.sync);
      lastFileList = fileList;
    } finally {
      checkFileInterval = setTimeout(() => {
        checkFile(lastFileList).catch((e) => {
          logger.error(e, '文件检查失败');
        });
      }, ms('10m'));
    }
  }

  let stopping = false;
  const onStop = async (signal: string): Promise<void> => {
    logger.info(`收到 ${signal}, 正在注销节点`);
    if (stopping) {
      process.exit(1); // eslint-disable-line n/no-process-exit
    }

    stopping = true;
    clearTimeout(checkFileInterval);
    if (cluster.interval) {
      clearInterval(cluster.interval);
    }
    await cluster.disable();

    logger.info('已成功取消注册节点, 正在等待进程结束, 再次按下 Ctrl+C 以强制停止进程');
    server.close();
    cluster.nginxProcess?.kill();
  };
  process.on('SIGTERM', (signal) => {
    void onStop(signal);
  });
  process.on('SIGINT', (signal) => {
    void onStop(signal);
  });

  if (nodeCluster.isWorker) {
    process.on('disconnect', () => {
      void onStop('disconnect');
    });
  }
}
