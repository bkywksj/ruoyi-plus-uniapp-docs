# 应用配置

## 配置文件结构

ruoyi-admin 采用分层配置策略，通过 Spring Profiles 实现环境隔离：

```text
resources/
├── application.yml           # 主配置（所有环境共享）
├── application-dev.yml       # 开发环境配置
└── application-prod.yml      # 生产环境配置
```

**配置加载顺序：**

1. `application.yml` - 基础配置，定义通用参数
2. `application-{profile}.yml` - 环境配置，覆盖或补充基础配置

**环境切换：**

```yaml
# application.yml
spring:
  profiles:
    active: @profiles.active@  # Maven构建时替换
```

## 应用基础配置

### 项目信息

```yaml
app:
  # 应用唯一标识（用于Redis前缀、任务调度组名等）
  id: ryplus_uni_workflow
  # 应用标题
  title: ryplus_uni_workflow后台管理
  # 授权码（前往 https://license.ruoyi.plus 生成）
  license: ${APP_LICENSE:YOUR0LICENSE0KEY0HERE}
  # 离线授权码（内网环境使用）
  offline-license: ${APP_OFFLINE_LICENSE:}
  # 应用版本
  version: ${revision}
  # 版权年份
  copyright-year: 2025
```

### 环境专属配置

```yaml
# application-dev.yml
app:
  # 本地文件上传路径
  upload-path: ${APP_UPLOAD_PATH:D:\download\ruoyi\uploadPath}
  # 应用基础URL（用于支付回调等场景）
  base-api: ${APP_BASE_API:http://127.0.0.1:5503}

# application-prod.yml
app:
  upload-path: ${APP_UPLOAD_PATH:/ruoyi/server/upload}
  base-api: ${APP_BASE_API:https://ruoyi.plus}
```

### 多租户配置

```yaml
tenant:
  # 是否开启多租户
  enable: true
  # 排除表（不进行租户过滤的业务表）
  excludes:
    # 系统核心表已硬编码排除，这里配置业务表
    # - business_config
```

**说明：**
- 开启多租户后，SQL查询会自动添加租户条件
- 系统核心表（如字典、配置等）已在代码中硬编码排除
- 业务表如需全局共享，在 `excludes` 中配置表名

## 服务器配置

### 基础配置

```yaml
server:
  # 服务端口
  port: ${SERVER_PORT:5503}
  servlet:
    # 应用访问路径
    context-path: /
```

### Undertow容器配置

ruoyi-admin 使用 Undertow 作为内嵌 Web 容器，相比 Tomcat 具有更高的性能。

```yaml
server:
  undertow:
    # HTTP POST请求体最大大小（-1表示无限制）
    max-http-post-size: -1
    # 缓冲区大小（越小空间利用率越高）
    buffer-size: 512
    # 是否使用直接内存
    direct-buffers: true
    threads:
      # IO线程数（处理非阻塞任务，默认等于CPU核心数）
      io: 8
      # 工作线程数（处理阻塞任务，如Servlet请求）
      worker: 256
```

**线程配置说明：**

| 参数 | 说明 | 建议值 |
|------|------|--------|
| io | IO线程，处理非阻塞任务 | CPU核心数 |
| worker | 工作线程，处理阻塞请求 | IO线程数 × 32 |

**性能调优建议：**
- 高并发场景可适当增大 `worker` 线程数
- 如果使用 JDK21 虚拟线程，可减少 `worker` 配置

## Spring框架配置

### 应用名称

```yaml
spring:
  application:
    name: ${app.id}  # 使用应用ID作为应用名
```

### 虚拟线程配置

```yaml
spring:
  threads:
    virtual:
      # 开启虚拟线程（仅JDK21可用）
      enabled: true
```

**注意：** JDK17 不支持虚拟线程，需设置为 `false` 或删除此配置。

### 异步任务配置

```yaml
spring:
  task:
    execution:
      # 线程名前缀
      thread-name-prefix: async-
      # 初始化模式（force: 由Spring管理线程池）
      mode: force
```

从 Spring Boot 3.5 开始，可直接注入 `TaskExecutor` 使用，无需自定义 `AsyncConfig`。

### 文件上传配置

```yaml
spring:
  servlet:
    multipart:
      # 单个文件最大大小
      max-file-size: 10MB
      # 请求总大小
      max-request-size: 20MB
      # 临时文件目录
      location: ${app.upload-path}
```

### MVC配置

```yaml
spring:
  mvc:
    # 静态资源路径（避免所有请求都查找静态资源）
    static-path-pattern: /static/**
    format:
      # 日期时间格式
      date-time: yyyy-MM-dd HH:mm:ss
```

### Jackson配置

```yaml
spring:
  jackson:
    # 日期格式化
    date-format: yyyy-MM-dd HH:mm:ss
    serialization:
      # 是否格式化输出（生产环境建议false）
      indent_output: false
      # 忽略无法转换的空对象
      fail_on_empty_beans: false
    deserialization:
      # 忽略JSON中不存在的属性
      fail_on_unknown_properties: false
```

## 数据库配置

### 数据源类型

```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
```

### 动态数据源配置

ruoyi-admin 使用 `dynamic-datasource` 实现多数据源切换。

```yaml
spring:
  datasource:
    dynamic:
      # SQL性能分析（开发环境开启，生产环境关闭）
      p6spy: ${P6SPY_ENABLED:true}
      # 默认数据源
      primary: master
      # 严格模式（找不到数据源时报错）
      strict: true
      datasource:
        # 主库
        master:
          type: ${spring.datasource.type}
          driverClassName: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://${DB_HOST:127.0.0.1}:${DB_PORT:3306}/${DB_NAME:ryplus_uni_workflow}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&autoReconnect=true&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true
          username: ${DB_USERNAME:root}
          password: ${DB_PASSWORD:root}
        # 从库（懒加载）
        slave:
          lazy: true
          type: ${spring.datasource.type}
          driverClassName: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://${DB_SLAVE_HOST:127.0.0.1}:${DB_SLAVE_PORT:3306}/${DB_SLAVE_NAME:ryplus_uni_workflow}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&autoReconnect=true&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true
          username: ${DB_SLAVE_USERNAME:root}
          password: ${DB_SLAVE_PASSWORD:root}
```

**JDBC URL参数说明：**

| 参数 | 说明 |
|------|------|
| useUnicode=true | 使用Unicode编码 |
| characterEncoding=utf8 | 字符编码UTF-8 |
| zeroDateTimeBehavior=convertToNull | 零日期转为null |
| useSSL=true | 启用SSL连接 |
| serverTimezone=GMT%2B8 | 时区东八区 |
| autoReconnect=true | 自动重连 |
| rewriteBatchedStatements=true | 批处理优化（大幅提升批量操作性能） |
| allowPublicKeyRetrieval=true | 允许公钥检索 |
| nullCatalogMeansCurrent=true | null目录表示当前数据库 |

### HikariCP连接池配置

```yaml
spring:
  datasource:
    dynamic:
      hikari:
        # 最大连接数
        maxPoolSize: 20          # 开发环境
        # maxPoolSize: 50        # 生产环境
        # 最小空闲连接
        minIdle: 10              # 开发环境
        # minIdle: 20            # 生产环境
        # 获取连接超时（毫秒）
        connectionTimeout: 30000
        # 校验超时（毫秒）
        validationTimeout: 5000
        # 空闲连接存活时间（毫秒，默认10分钟）
        idleTimeout: 600000
        # 连接最大生命周期（毫秒，默认30分钟）
        maxLifetime: 1800000
        # 连接活性检查间隔（毫秒）
        keepaliveTime: 30000
```

**连接池调优建议：**

| 场景 | maxPoolSize | minIdle |
|------|-------------|---------|
| 开发环境 | 20 | 10 |
| 生产环境（单机） | 50 | 20 |
| 生产环境（集群） | 30 | 15 |

### MyBatis-Plus配置

```yaml
mybatis-plus:
  # 是否开启全局逻辑删除
  enableLogicDelete: true
  # Mapper接口扫描包
  mapperPackage: plus.ruoyi.**.mapper
  # XML映射文件位置
  mapperLocations: classpath*:mapper/**/*Mapper.xml
  # 实体类扫描包
  typeAliasesPackage: plus.ruoyi.**.domain
  global-config:
    dbConfig:
      # 主键生成策略
      idType: ASSIGN_ID  # 雪花算法
```

**主键策略说明：**

| 策略 | 说明 |
|------|------|
| AUTO | 数据库自增 |
| NONE | 无策略 |
| INPUT | 用户输入 |
| ASSIGN_ID | 雪花算法（默认，推荐） |
| ASSIGN_UUID | UUID |

### 多数据库支持

配置文件中预留了多种数据库配置（已注释），按需启用：

```yaml
# Oracle
oracle:
  type: ${spring.datasource.type}
  driverClassName: oracle.jdbc.OracleDriver
  url: jdbc:oracle:thin:@//${ORACLE_DB_HOST}:${ORACLE_DB_PORT}/${ORACLE_DB_NAME}
  username: ${ORACLE_DB_USERNAME}
  password: ${ORACLE_DB_PASSWORD}

# PostgreSQL
postgres:
  type: ${spring.datasource.type}
  driverClassName: org.postgresql.Driver
  url: jdbc:postgresql://${POSTGRES_DB_HOST}:${POSTGRES_DB_PORT}/${POSTGRES_DB_NAME}
  username: ${POSTGRES_DB_USERNAME}
  password: ${POSTGRES_DB_PASSWORD}

# SQL Server
sqlserver:
  type: ${spring.datasource.type}
  driverClassName: com.microsoft.sqlserver.jdbc.SQLServerDriver
  url: jdbc:sqlserver://${SQLSERVER_DB_HOST}:${SQLSERVER_DB_PORT};DatabaseName=${SQLSERVER_DB_NAME}
  username: ${SQLSERVER_DB_USERNAME}
  password: ${SQLSERVER_DB_PASSWORD}
```

## Redis配置

### 基础配置

```yaml
spring:
  data:
    redis:
      # Redis服务器地址
      host: ${REDIS_HOST:127.0.0.1}
      # 端口
      port: ${REDIS_PORT:6379}
      # 数据库索引
      database: ${REDIS_DATABASE:0}
      # 密码（开发环境可为空）
      password: ${REDIS_PASSWORD:}
      # 连接超时
      timeout: 10s
      # 是否开启SSL
      ssl:
        enabled: false
```

### Redisson配置

```yaml
redisson:
  # Redis Key前缀
  keyPrefix: ${app.id}
  # 线程池数量
  threads: 4                    # 开发环境
  # threads: 16                 # 生产环境
  # Netty线程池数量
  nettyThreads: 8               # 开发环境
  # nettyThreads: 32            # 生产环境
  # 单节点配置
  singleServerConfig:
    # 客户端名称
    clientName: ${app.id}
    # 最小空闲连接数
    connectionMinimumIdleSize: 8    # 开发环境
    # connectionMinimumIdleSize: 32 # 生产环境
    # 连接池大小
    connectionPoolSize: 32          # 开发环境
    # connectionPoolSize: 64        # 生产环境
    # 空闲连接超时（毫秒）
    idleConnectionTimeout: 10000
    # 命令等待超时（毫秒）
    timeout: 3000
    # 发布订阅连接池大小
    subscriptionConnectionPoolSize: 50
```

## 线程池配置

### 全局线程池

```yaml
thread-pool:
  # 是否开启线程池（JDK21使用虚拟线程时建议关闭）
  enabled: false
  # 队列最大长度
  queueCapacity: 128
  # 线程空闲时间（秒）
  keepAliveSeconds: 300
```

**说明：**
- JDK21 环境推荐使用虚拟线程，无需开启此线程池
- JDK17 环境可开启此配置，并调整参数

### 分布式锁配置

```yaml
lock4j:
  # 获取锁超时时间（毫秒）
  acquire-timeout: 3000
  # 锁过期时间（毫秒）
  expire: 30000
```

## 消息推送配置

### SSE（服务端推送事件）

```yaml
sse:
  # 是否启用SSE
  enabled: false
  # SSE访问路径
  path: /resource/sse
```

### WebSocket

```yaml
websocket:
  # 是否启用WebSocket
  enabled: true
  # WebSocket路径
  path: /resource/websocket
  # 允许的源地址（*表示所有）
  allowedOrigins: '*'
```

**选择建议：**
- **SSE**：适合服务器向客户端单向推送，轻量级
- **WebSocket**：适合双向通信，实时性要求高的场景

## API文档配置

### SpringDoc配置

```yaml
springdoc:
  api-docs:
    # 是否开启接口文档（生产环境建议关闭）
    enabled: ${SPRINGDOC_ENABLED:true}
  info:
    title: '${app.title}_接口文档'
    description: '接口文档包括business、system、generator、workflow等模块'
    version: '版本号: ${app.version}'
    contact:
      name: 抓蛙师
      email: 770492966@qq.com
      url: https://space.bilibili.com/520725002
  # 分组配置
  group-configs:
    - group: business
      packages-to-scan: plus.ruoyi.business
    - group: system
      packages-to-scan: plus.ruoyi.system
    - group: generator
      packages-to-scan: plus.ruoyi.generator
    - group: workflow
      packages-to-scan: plus.ruoyi.workflow
```

**访问地址：**
- 全量文档：`http://localhost:5503/v3/api-docs`
- 分组文档：`http://localhost:5503/v3/api-docs/{group}`
- Swagger UI：`http://localhost:5503/swagger-ui.html`

## 系统监控配置

### Actuator端点

```yaml
management:
  endpoints:
    web:
      exposure:
        # 暴露所有端点
        include: '*'
  endpoint:
    health:
      # 显示详细健康信息
      show-details: ALWAYS
    logfile:
      # 外部日志文件路径
      external-file: ./logs/sys-console.log
```

**常用端点：**

| 端点 | 说明 |
|------|------|
| /actuator/health | 健康检查 |
| /actuator/info | 应用信息 |
| /actuator/metrics | 性能指标 |
| /actuator/loggers | 日志级别管理 |
| /actuator/startup | 启动性能分析 |

### 监控中心配置

```yaml
# application-dev.yml
spring:
  boot:
    admin:
      client:
        # 开发环境默认关闭
        enabled: ${MONITOR_ENABLED:false}
        url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
        instance:
          service-host-type: IP
          metadata:
            username: ${MONITOR_USERNAME:ruoyi}
            userpassword: ${MONITOR_PASSWORD:123456}
        username: ${MONITOR_USERNAME:ruoyi}
        password: ${MONITOR_PASSWORD:123456}

# application-prod.yml
spring:
  boot:
    admin:
      client:
        # 生产环境默认开启
        enabled: ${MONITOR_ENABLED:true}
```

## 工作流配置

### Warm-Flow配置

```yaml
warm-flow:
  # 是否开启工作流
  enabled: true
  # 是否开启设计器UI
  ui: true
  # Token名称（多个用逗号分隔）
  token-name: ${sa-token.token-name},clientId
  # 流程状态颜色（RGB）
  chart-status-color:
    # 未办理
    - 62,62,62
    # 待办理
    - 255,205,23
    # 已办理
    - 157,255,0
```

## 开放平台配置

### OpenAPI配置

```yaml
openapi:
  # 是否启用开放平台
  enabled: ${OPEN_API_ENABLED:false}
  # 时间戳过期时间（秒，防重放攻击）
  timestamp-expire-seconds: 60
  # 每个用户最大密钥数量
  max-keys: 5
  # AppSecret加密密钥（AES-256需要32字节）
  secret-encrypt-key: ${OPEN_API_SECRET_KEY:q3XA19UeJExvCqynPOnyYUcr4zwOVCyi}
  # 访问控制配置
  access-control:
    # 访问模式：all | roles | admin | super_admin
    mode: ${OPEN_API_ACCESS_MODE:all}
    # 允许访问的角色（mode=roles时生效）
    allowed-roles: ${OPEN_API_ALLOWED_ROLES:admin,pc_user}
```

**访问模式说明：**

| 模式 | 说明 |
|------|------|
| all | 所有用户可访问 |
| roles | 指定角色可访问 |
| admin | 仅管理员可访问 |
| super_admin | 仅超级管理员可访问 |

## 定时任务配置

### SnailJob配置

```yaml
snail-job:
  # 是否启用
  enabled: ${SNAIL_JOB_ENABLED:false}
  # 任务组名
  group: ${app.id}
  # 接入令牌
  token: ${SNAIL_JOB_TOKEN:SJ_cKqBTPzCsWA3VyuCfFoccmuIEGXjr5KT}
  server:
    # 调度中心地址
    host: ${SNAIL_JOB_SERVER_HOST:127.0.0.1}
    # 调度中心端口
    port: ${SNAIL_JOB_SERVER_PORT:17888}
  # 命名空间
  namespace: ${spring.profiles.active}
  # 客户端端口（随主应用端口漂移）
  port: 2${server.port}
  # RPC类型
  rpc-type: grpc
```

## 消息队列配置

### RocketMQ配置

```yaml
rocketmq:
  # 是否启用
  enabled: ${ROCKETMQ_ENABLED:false}
  # NameServer地址
  name-server: ${ROCKETMQ_NAME_SERVER:127.0.0.1:9876}
  # 集群名称
  cluster-name: ${ROCKETMQ_CLUSTER_NAME:RuoYiCluster}
  # Broker地址
  broker-addr: ${ROCKETMQ_BROKER_ADDR:127.0.0.1:10911}
  producer:
    # 生产者组名
    group: ${ROCKETMQ_PRODUCER_GROUP:ruoyi-producer-group-dev}
    # 发送超时（毫秒）
    send-message-timeout: 3000
    # 消息最大大小（4MB）
    max-message-size: 4194304
    # 失败重试次数
    retry-times-when-send-failed: 2
    # 是否自动创建Topic
    auto-create-topic: true
  consumer:
    # 消费线程数
    consume-thread-min: 20
    consume-thread-max: 64
    # 拉取批次大小
    pull-batch-size: 32
```

### MQTT配置

```yaml
mqtt:
  client:
    # 是否启用
    enabled: ${MQTT_ENABLED:false}
    # 客户端名称
    name: ${MQTT_CLIENT_NAME:Mica-Mqtt-Client}
    # Broker地址
    ip: ${MQTT_IP:192.168.168.168}
    # 端口
    port: ${MQTT_PORT:1883}
    # 认证信息
    username: ${MQTT_USERNAME:}
    password: ${MQTT_PASSWORD:}
    # 连接超时（秒）
    timeout: 5
    # 心跳保活（秒）
    keep-alive-secs: 60
    # 自动重连
    reconnect: true
    # 重连间隔（毫秒）
    re-interval: 5000
    # 协议版本
    version: MQTT_5
    # 是否清除会话
    clean-start: true
```

## 开发/生产环境差异

| 配置项 | 开发环境 | 生产环境 |
|--------|---------|---------|
| **文件上传路径** | D:\download\ruoyi\uploadPath | /ruoyi/server/upload |
| **应用基础URL** | http://127.0.0.1:5503 | https://ruoyi.plus |
| **监控客户端** | 关闭 | 开启 |
| **P6Spy SQL监控** | 开启 | 关闭 |
| **数据库连接池** | maxPoolSize: 20 | maxPoolSize: 50 |
| **Redis连接池** | connectionPoolSize: 32 | connectionPoolSize: 64 |
| **Redisson线程数** | threads: 4 | threads: 16 |
| **定时任务** | 关闭 | 开启 |
| **RocketMQ** | 关闭 | 按需开启 |
| **MQTT** | 关闭 | 按需开启 |
| **短信发送日志** | 开启 | 关闭 |
| **敏感配置** | 硬编码默认值 | 环境变量注入 |

## 配置最佳实践

### 1. 敏感配置外置

生产环境敏感配置通过环境变量注入：

```yaml
# 推荐
spring:
  datasource:
    password: ${DB_PASSWORD}

# 不推荐
spring:
  datasource:
    password: mypassword123
```

### 2. 按需开启功能

关闭不需要的模块减少资源占用：

```yaml
module:
  pay-enabled: false      # 不需要支付
  miniapp-enabled: false  # 不需要小程序

snail-job:
  enabled: false          # 不需要定时任务

rocketmq:
  enabled: false          # 不需要消息队列
```

### 3. 合理配置连接池

根据服务器配置和并发量调整连接池参数：

```yaml
# 4核8G服务器参考配置
spring:
  datasource:
    dynamic:
      hikari:
        maxPoolSize: 30
        minIdle: 10

redisson:
  singleServerConfig:
    connectionPoolSize: 32
    connectionMinimumIdleSize: 16
```

### 4. 生产环境关闭调试功能

```yaml
# 关闭SQL监控
spring:
  datasource:
    dynamic:
      p6spy: false

# 关闭API文档
springdoc:
  api-docs:
    enabled: false

# 减少日志输出
logging:
  level:
    plus.ruoyi: warn
```
