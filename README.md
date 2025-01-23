# Node-OpenBMCLAPI-Fix
本项目为OpenBMCLAPI官方Node端的Fork版本，修改了部分内容

支持在测速时302到网盘

使用本项目的OBA端将能更好的压榨节点（笑

## 配置

| 环境变量                | 必填 | 默认值          | 说明                                                                                                     |
|---------------------|----|--------------|--------------------------------------------------------------------------------------------------------|
| CLUSTER_ID          | 是  | -            | 集群 ID                                                                                                  |
| CLUSTER_SECRET      | 是  | -            | 集群密钥                                                                                                   |
| CLUSTER_IP          | 否  | 自动获取公网出口IP   | 用户访问时使用的 IP 或域名                                                                                        |
| CLUSTER_PORT        | 否  | 4000         | 监听端口                                                                                                   |
| CLUSTER_PUBLIC_PORT | 否  | CLUSTER_PORT | 对外端口                                                                                                   |
| CLUSTER_BYOC        | 否  | false        | 是否使用自定义域名, (BYOC=Bring you own certificate),当使用国内服务器需要备案时, 需要启用这个参数来使用你自己的域名, 并且你需要自己提供ssl termination |
| ENABLE_NGINX        | 否  | false        | 使用 nginx 提供文件服务                                                                                        |
| DISABLE_ACCESS_LOG  | 否  | false        | 禁用访问日志输出                                                                                               |
| ENABLE_UPNP         | 否  | false        | 启用 UPNP 端口映射                                                                                           |
| SSL_KEY             | 否  | -            | （仅当开启BYOC时）  SSL 证书私钥。可以直接粘贴证书内容，也可以填写文件名                                                              |
| SSL_CERT            | 否  | -            | （仅当开启BYOC时）  SSL 证书公钥。可以直接粘贴证书内容，也可以填写文件名                                                              |

如果你在源码中发现了其他环境变量, 那么它们是为了方便开发而存在的, 可能会随时修改, 不要在生产环境中使用

## 安装

### 安装包

#### 所需环境

- Node.js 20 以上
- 一个支持 Node.js 的系统
- 一个支持 Node.js 的架构

#### 下载

从 [Github Release](https://github.com/bangbang93/openbmclapi/releases) 中选择对应你的系统的最新版本

### 从源码安装

#### 所需环境

- Node.js 20 以上
- 一个支持 Node.js 的系统
- 一个支持 Node.js 的架构

#### 设置环境

1. 去 <https://nodejs.org/zh-cn/> 下载LTS版本的nodejs并安装
2. Clone 并安装依赖

```bash
git clone https://github.com/Zhang12334/node-oba-fix
cd node-oba-fix
## 安装依赖
npm i
## 编译
npm run build
## 运行
node dist/index.js
```

3. 如果你看到了 `CLUSTER_ID is not set` 的报错, 说明一切正常, 该设置参数了

### 设置参数

在项目根目录创建一个文件, 名为 `.env`

写入如下内容

```env
CLUSTER_ID=你的节点ID
CLUSTER_SECRET=你的节点密钥
CLUSTER_PORT=你的开放端口
# 更多变量请看上方变量的详细解释
```

如果配置无误的话, 运行程序, 就会开始拉取文件, 拉取完成后就会开始等待服务器分发请求了！

## Alist使用方法
在.env中加上
```env
CLUSTER_STORAGE=alist
CLUSTER_STORAGE_OPTIONS={"url":"http://127.0.0.1:5244/dav","basePath":"oba","username":"admin","password":"admin" }
#                                      ↑AList地址(别忘了加/dav)         ↑文件路径          ↑账号(有webdav权限)  ↑密码
```
按照需要修改

### 温馨提示

如从 Go 端迁移至 Node 端，你Alist里面的目录应该是这样的：

```file_tree
oba/
├── download/
│   ├── 00/
│   ├── 01/
|   ├── 03/
│   └── xx(下面一堆文件夹,不一一列举)/
├── measure/
│   ├── 1
│   ├── 2
│   └── 3
```
此时你basepath的地址就应该填写"oba/download"

## 致谢

- [**bangbang93**](https://github.com/bangbang93) 本项目fork自bangbang93的OpenBMCLAPI项目