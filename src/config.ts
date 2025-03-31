import dotenv from 'dotenv'
import {z} from 'zod'
import env from 'env-var'
import {readFileSync} from 'fs'
import {fileURLToPath} from 'url'

export interface IConfigFlavor {
  runtime: string
  storage: string
}
const packageJson = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as {
  protocol_version: string
  version: string
}

export class Config {
  public static instance: Config

  // 节点本体相关
  public readonly clusterId = env.get('CLUSTER_ID').required().asString()
  public readonly clusterSecret = env.get('CLUSTER_SECRET').required().asString()
  public readonly clusterIp? = env.get('CLUSTER_IP').asString()
  public readonly port: number = env.get('CLUSTER_PORT').default(4000).asPortNumber()
  public readonly clusterPublicPort = env.get('CLUSTER_PUBLIC_PORT').default(this.port).asPortNumber()
  public readonly byoc = env.get('CLUSTER_BYOC').asBool()
  public readonly disableAccessLog = env.get('DISABLE_ACCESS_LOG').asBool()

  public readonly enableNginx = env.get('ENABLE_NGINX').asBool()
  public readonly enableUpnp = env.get('ENABLE_UPNP').asBool()
  public readonly storage = env.get('CLUSTER_STORAGE').default('file').asString()
  public readonly storageOpts = env.get('CLUSTER_STORAGE_OPTIONS').asJsonObject()

  public readonly restartProcess = env.get('RESTART_PROCESS').asBool()
  public readonly noENABLE = env.get('CLUSTER_NO_ENABLE').asBool()
  public readonly noConnect = env.get('NO_CONNECT').asBool()  

  // SSL
  public readonly sslKey = env.get('SSL_KEY').asString()
  public readonly sslCert = env.get('SSL_CERT').asString()

  public readonly flavor: IConfigFlavor

  // 调试选项
  public readonly allowNoSign = env.get('ALLOW_NO_SIGN').asBool()
  
  // 版本
  public readonly protocol_version = packageJson.protocol_version
  public readonly version = packageJson.version

  // 更新
  public readonly enableAutoUpdate = env.get('ENABLE_AUTO_UPDATE').asBool()

  // 同步设置项
  public readonly syncConcurrency = env.get('SYNC_CONCURRENCY').default(10).asInt()
  public readonly disableSyncFiles = env.get('DISABLE_SYNC_FILES').asBool()
  public readonly disableFirstSyncFiles = env.get('DISABLE_FIRST_SYNC_FILES').asBool()
  public readonly SyncInterval = env.get('SYNC_INTERVAL').asString()
  public readonly AlwaysCheckMissingFiles = env.get('ALWAYS_CHECK_MISSING_FILES').asBool()

  // 视觉配置项
  public readonly disableOptiLog = env.get('DISABLE_OPTI_LOG').asBool()
  public readonly disableNewSyncStatus = env.get('DISABLE_NEW_SYNC_STATUS').asBool()

  // 通知配置项
  public readonly notifyEnabled = env.get('NOTIFY_ENABLED').asBool();
  public readonly notifyType = env.get('NOTIFY_TYPE').asString();
  public readonly notifyWebhookUrl = env.get('NOTIFY_WEBHOOK_URL').asString();
  public readonly notifyWebhookJsonKey = env.get('NOTIFY_WEBHOOK_JSON_KEY').asString();
  public readonly notifyOnebotHttpApi = env.get('NOTIFY_ONEBOT_HTTP_API').asString();
  public readonly notifyOnebotSecret = env.get('NOTIFY_ONEBOT_SECRET').asString();
  public readonly notifyOnebotType = env.get('NOTIFY_ONEBOT_TYPE').asString();
  public readonly notifyOnebotTarget = env.get('NOTIFY_ONEBOT_TARGET').asString();

  // 通知消息内容
  public readonly notifyReconnect = env.get('NOTIFY_RECONNECT').asBool();
  public readonly notifyReconnectMessage = env.get('NOTIFY_RECONNECT_MESSAGE').asString();
  public readonly notifyStartup = env.get('NOTIFY_STARTUP').asBool();
  public readonly notifyStartupMessage = env.get('NOTIFY_STARTUP_MESSAGE').asString();
  public readonly notifyShutdown = env.get('NOTIFY_SHUTDOWN').asBool();
  public readonly notifyShutdownMessage = env.get('NOTIFY_SHUTDOWN_MESSAGE').asString();
  public readonly notifyError = env.get('NOTIFY_ERROR').asBool();
  public readonly notifyErrorMessage = env.get('NOTIFY_ERROR_MESSAGE').asString();
  public readonly clusterName = env.get('CLUSTER_NAME').asString()

  private constructor() {
    this.flavor = {
      runtime: `Node.js/${process.version}`,
      storage: this.storage,
    }
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config()
    }
    return Config.instance
  }
}

export const OpenbmclapiAgentConfigurationSchema = z.object({
  sync: z.object({
    source: z.string(),
    concurrency: z.number(),
  }),
})

export type OpenbmclapiAgentConfiguration = z.infer<typeof OpenbmclapiAgentConfigurationSchema>

dotenv.config()

export const config = Config.getInstance()
