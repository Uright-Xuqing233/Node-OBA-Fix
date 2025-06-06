# 原版配置项

## 主要配置项

| 环境变量                    | 必填 | 默认值                  | 说明                                                                                                                                          |
|----------------------------|------|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| CLUSTER_ID                 |  是  | -                      | 集群 ID                                                                                                                                       |
| CLUSTER_SECRET             |  是  | -                      | 集群密钥                                                                                                                                      |
| CLUSTER_IP                 |  否  | 自动获取公网出口IP       | 用户访问时使用的 IP 或域名                                                                                                                     |
| CLUSTER_PORT               |  否  | 4000                   | 监听端口                                                                                                                                      |
| CLUSTER_PUBLIC_PORT        |  否  | CLUSTER_PORT           | 对外端口                                                                                                                                      |
| CLUSTER_BYOC               |  否  | false                  | 是否使用自定义证书 (BYOC=Bring you own certificate, 当使用国内服务器需要备案时, 需要启用这个参数来使用你自己的带证书的域名, 需搭配下方SSL相关设置使用) |
| SSL_KEY                    |  否  | -                      | (仅当开启BYOC时) SSL 证书私钥, 可以直接粘贴证书内容，也可以填写文件名                                                                             |
| SSL_CERT                   |  否  | -                      | (仅当开启BYOC时) SSL 证书公钥, 可以直接粘贴证书内容，也可以填写文件名                                                                             |
| ENABLE_NGINX               |  否  | false                  | 使用 nginx 提供文件服务                                                                                                                       |
| ENABLE_UPNP                |  否  | false                  | 启用 UPNP 端口映射                                                                                                                            |
| LOGLEVEL                   |  否  | info                   | 切换日志等级, 常用info debug                                                                                                                   |

## 调试配置项

| 环境变量                    | 必填 | 默认值                              | 说明                                                                                                                                          |
|----------------------------|------|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| NODE_ENV                   |  否  | -                                  | 开发调试环境（development）                                                                                                                     | 
| NO_DAEMON                  |  否  | false                              | 禁用守护进程（不会启用内置重启及延迟退出功能）                                                                                                     |
| DISABLE_ACCESS_LOG         |  否  | false                              | 禁用访问日志                                                                                                                                    | 
| CLUSTER_BMCLAPI            |  否  | https://openbmclapi.bangbang93.com | 自定义主控地址                                                                                                                                  |
| NO_FAST_ENABLE             |  否  | false                              | 禁用快速启用                                                                                                                                    |


# 新增配置项

## 综合配置项

| 环境变量                    | 必填 | 默认值                  | 说明                                                                                                                                          |
|----------------------------|------|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| STARTUP_LIMIT              |  否  | 90                     | 24h启动的最多次数(以请求上线次数为准, 超过后将定时刷新，等待24h内上线次数不超限时再启动，避免被主控封禁)                                              |
| STARTUP_LIMIT_WAIT_TIMEOUT |  否  | 600                    | 上线次数超限时等待响应的超时时间, 单位为秒, 一般10分钟即可无需修改                                                                                 |
| DISABLE_OPTI_LOG           |  否  | false                  | 显示未优化的日志（请求地址会显示?后的部分，如优化后/measure/1，优化前/measure/1?s=w4Yh2cnF6Ctmo4CwUxZve2jN1UU&e=m8u973ob）                          |
| ENABLE_AUTO_UPDATE         |  否  | false                  | 是否启用自动更新功能（默认为禁用，启用后程序会自动检查更新并下载更新文件，更新完成后程序会自动重启，需本地有>10版本的NPM环境）                            |
| RESTART_PROCESS            |  否  | true                   | 在当前进程意外退出后调用自身功能自动重启进程                                                                                                      |
| ENABLE_EXIT_DELAY          |  否  | false                  | 使用自定义固定秒数而非内置退避策略的重启前等待时间                                                                                                |
| EXIT_DELAY                 |  否  | 3                      | 在重启/退出前进行自定义秒数的延迟                                                                                                                |
| DISABLE_WEBDAV_302_CACHE   |  否  | false                  | 是否禁用 webdav 302 缓存，默认不禁用，禁用后使用 webdav 存储时会每次都请求地址而不是检查缓存，会增大CPU占用（若不禁用则增大内存占用）                   |

## 文件同步配置项

| 环境变量                         | 必填 | 默认值                  | 说明                                                                                                                                          |
|---------------------------------|------|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| SYNC_DISABLE_NEW_SYNC_STATUS    |  否  | false                  | 禁用新的同步状态显示，会显示单个文件的下载进度显示并更改为原版的排版                                                                                 |
| SYNC_DISABLE_SYNC_FILES         |  否  | false                  | 禁用同步文件功能（警告：此功能为多端单节点设计，请勿在任何单端单存储的节点上使用，将会导致节点出现缺少大量文件的情况，并扣光信任值然后被ban）              |
| SYNC_DISABLE_FIRST_SYNC_FILES   |  否  | false                  | 禁用启动时的同步文件功能（警告：此功能为测试性功能，请勿在任何生产环境节点上使用，将会导致节点出现缺少大量文件的情况，并扣光信任值然后被ban）              |
| SYNC_ALWAYS_CHECK_MISSING_FILES |  否  | false                  | 是否总是检查缺失的文件（默认为禁用，启用后每次同步文件都会检查缺失的文件而不是只对比云端文件列表是否有更新）                                             |
| SYNC_INTERVAL                   |  否  | 10m                    | 每次同步文件的间隔时间，如 10m 为 10 分钟, 1h 为 1 小时, 20s 为 20 秒                                                                              |
| SYNC_CONCURRENCY                |  否  | -                      | 同步文件时并发数量，默认从主控获取（注：此配置项主要为主控不下发20并发的情况提供保底，因此设置的上限值为20，设置超过20时默认取最高值20）                  |
| SYNC_SKIP_STORAGE_CHECK         |  否  | false                  | 是否跳过存储空间检查（默认为禁用，启用后可能会导致节点出现存储爆炸的情况，并扣光信任值然后被ban）                                                      |

## 调试配置项

| 环境变量                    | 必填 | 默认值                  | 说明                                                                                                                                          |
|----------------------------|------|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| CLUSTER_ALLOW_NO_SIGN      |  否  | false                  | 是否允许未签名的请求                                                                                                                            |
| CLUSTER_NO_ENABLE          |  否  | false                  | 是否禁用节点上线（会连接主控、请求证书、同步，但不会请求上线，一般用于调试或同步文件, 不建议在生产环境中使用）                                          |
| CLUSTER_NO_CONNECT         |  否  | false                  | 是否禁用连接主控（不会请求证书、上线，但会同步、处理请求，可配合自定义证书搭建针对单节点多线的多端负载均衡, 此功能覆盖CLUSTER_NO_ENABLE）                |
| SKIP_DEV_DELAY             |  否  | false                  | 是否禁用测试构建版本的3s启动延迟（在release版本中无效）                                                                                            |

## 通知配置项

### 通知渠道及其对应地址配置

| 环境变量                        | 必填                            | 默认值                | 支持的选项               | 说明                                                                                                                   |
|--------------------------------|---------------------------------|----------------------|--------------------------|------------------------------------------------------------------------------------------------------------------------|
| NOTIFY_ENABLED                 |  否                             | false                 | true / false            | 是否启用通知功能                                                                                                        |
| NOTIFY_TYPE                    |  是（如果NOTIFY_ENABLED为true）  | -                     | webhook / onebot / workwechat / dingtalk / serverchan | 启用的通知类型                                                                           |
| NOTIFY_WEBHOOK_URL             |  是（如果通知类型为webhook）      | -                     | 一个 http/https 地址     | NOTIFY_TYPE 为 Webhook 时使用的 Webhook URL，如：NOTIFY_WEBHOOK_URL=http://127.0.0.1:8080/webhook                       |
| NOTIFY_WEBHOOK_JSON_KEY        |  否                             | content               | 一个字符串               | 未配置 NOTIFY_WEBHOOK_CUSTOM_JSON 时 Webhook 发送 JSON 的 key, 发送消息结构为 { NOTIFY_WEBHOOK_JSON_KEY: "发送的内容" }    |
| NOTIFY_WEBHOOK_CUSTOM_JSON     | 否                              | -                     | 一个 JSON 字符串         | 用于自定义 Webhook 发送的 JSON 内容，支持 `${}` 占位符，可动态替换为以下变量：<br> - `${raw_message}`：原始消息内容<br> - `${message}`：处理后的消息内容（带前缀）<br> - `${prefix}`：前缀，默认为 `CLUSTER_NAME` 环境变量的值，若未设置则使用默认值 `Cluster`<br> - `${timestamp}`：当前时间戳（毫秒）<br> - `${datetime}`：ISO 格式的日期时间<br> - `${date}`：本地日期<br> - `${time}`：本地时间<br> 示例：`NOTIFY_WEBHOOK_CUSTOM_JSON='{ "message": "${prefix}\n${raw_message}\n${datetime}" }'` |
| NOTIFY_ONEBOT_HTTP_API         |  是（如果通知类型为onebot）       | -                     | 一个 http/https 地址     | NOTIFY_TYPE 为 OneBot 时使用的 Onebot HTTP API 地址，如：NOTIFY_ONEBOT_HTTP_API=http://127.0.0.1:8080                   |
| NOTIFY_ONEBOT_TYPE             |  是（如果通知类型为onebot）       | -                     | group / private         | 发送消息的聊天类型, private 为私聊，group 为群聊                                                                          |
| NOTIFY_ONEBOT_TARGET           |  是（如果通知类型为onebot）       | -                     | 一串数字                 | 发送消息的接收目标，NOTIFY_ONEBOT_TYPE 配置为 private 时为私聊 QQ 号, 反之则为群号, 如：NOTIFY_ONEBOT_TARGET=1234567890     |
| NOTIFY_ONEBOT_SECRET           |  否（如果配置了上报密钥则必填）    | -                     | 一个字符串               | Onebot 配置的 HTTP 上报密钥，如：NOTIFY_ONEBOT_SECRET=1234567890                                                        |
| NOTIFY_WORKWECHAT_WEBHOOK_URL  |  是（如果通知类型为workwechat）   | -                     | 一个 http/https 地址     | 通知类型为 workwechat 时使用的企业微信群机器人 Webhook URL, 如 https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx-xxx|
| NOTIFY_WORKWECHAT_MENTION_LIST |  否                             | -             | 看介绍有说明 | 企业微信通知的at列表(按照手机号at) <br> 如 NOTIFY_WORKWECHAT_MENTION_LIST=18011451419,@all <br> 为at全体和单独at手机号为18011451419的用户, 也可只设置一个at的人如 <br> NOTIFY_WORKWECHAT_MENTION_LIST=@all 则只at全体       |
| NOTIFY_WORKWECHAT_MESSAGE_TITLE_COLOR| 否                        | -                     | info(绿色) / comment(灰色) / warning(橙红色)       | 企业微信通知消息标题颜色                                                                        |
| NOTIFY_DINGTALK_WEBHOOK_URL    |  是（如果通知类型为dingtalk）     | -                     | 一个 http/https 地址     | 钉钉群自定义机器人的 Webhook URL, 如 https://oapi.dingtalk.com/robot/send?access_token=xxx-xxx                           |
| NOTIFY_SERVERCHAN_SENDKEY      |  是（如果通知类型为serverchan）  | -                     | 一个字符串               | ServerChan 的 SendKey, 兼容 ServerChan3 和 ServerChanTurbo                                                              |
| NOTIFY_DEBUG_MODE              |  否                             | false                 | true / false            | 是否启用通知调试模式（很吵，为了debug会通知一些日志，不建议开）                                                              |

### 通知消息内容

| 环境变量                    | 必填 | 默认值                 | 支持的选项               | 说明                                                                                                                                        |
|----------------------------|------|-----------------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| NOTIFY_RECONNECT_MESSAGE           |  否  | false                  | true / false            | 自定义节点重连时触发的通知消息                                                                                                                  |
| NOTIFY_STARTUP_MESSAGE             |  否  | false                  | true / false            | 自定义节点上线时触发的通知消息                                                                                                                  |
| NOTIFY_SHUTDOWN_MESSAGE            |  否  | false                  | true / false            | 自定义节点下线时触发的通知消息                                                                                                                  |
| NOTIFY_ERROR_MESSAGE               |  否  | false                  | true / false            | 自定义节点工作进程异常退出时触发的通知消息                                                                                                       |
| CLUSTER_NAME               |  否  | Cluster                | 一个字符串               | 自定义节点名称, 目前会在同步、通知时应用: 同步文件显示为 [Sync-节点名称], 通知显示为 [Cluster] 节点已下线                                         |

备注：消息推送的整体结构为 `[节点名称] 消息内容`，如：`[Cluster] 节点已下线`、`[Cluster] 节点已重连`

在部分性能较低的设备上，程序内置的自动重启功能可能会导致重新连接时出现问题（例如卡死等）

为了避免这种情况，建议使用外部工具（如 MCSM 的自动重启功能）来管理程序的启动与重启

此时，您可以在配置文件中将 `RESTART_PROCESS` 设置为 `false`，以关闭程序自身的自动重启功能

当 `RESTART_PROCESS` 设置为 `false` 时，程序在意外退出后将不会自动重启，而是直接结束进程

如果启用了 `ENABLE_EXIT_DELAY`，程序在重启前会使用自定义的延迟时间。如果未设置 `EXIT_DELAY` 且 `ENABLE_EXIT_DELAY` 为 `true`，程序将默认使用 3 秒的延迟时间

如果未设置 `EXIT_DELAY` 且 `RESTART_PROCESS` 为 `false`，程序在退出前将强制使用默认的 3 秒延迟时间（此时 `ENABLE_EXIT_DELAY` 的设置将被忽略）

需要注意的是，如果您在源码中发现了其他环境变量，它们可能是为了方便开发而临时添加的，可能会随时更改，因此不建议在生产环境中使用这些变量