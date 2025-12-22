# 后端配置文件说明文档

## 概述

本项目采用 Spring Boot 框架，使用 YAML 格式的配置文件来管理应用的各项配置。配置文件分为三个层级：

- `application.yml` - 主配置文件，包含所有通用配置
- `application-dev.yml` - 开发环境专用配置
- `application-prod.yml` - 生产环境专用配置

## 配置文件结构

### 1. 应用基础配置

```yaml
app:
  id: ryplus_uni                    # 应用唯一标识符
  title: ryplus-uni后台管理          # 应用显示名称
  version: ${revision}              # 应用版本号
  copyright-year: 2025              # 版权年份
  upload-path: /path/to/upload      # 文件上传路径
  base-api: https://api.domain.com  # API基础路径 生产环境必须配置正确的 需要做支付回调地址等
```

### 2. 服务器配置

```yaml
server:
  port: 5500                        # 服务端口
  servlet:
    context-path: /                 # 应用访问路径
  undertow: # Undertow服务器配置
    max-http-post-size: -1         # POST请求最大大小
    buffer-size: 512               # 缓冲区大小
    threads:
      io: 8                        # IO线程数
      worker: 256                  # 工作线程数
```

### 3. Spring框架配置

#### 3.1 应用配置

```yaml
spring:
  application:
    name: ${app.id}                # 应用名称
  profiles:
    active: @profiles.active@      # 激活的环境配置
  threads:
    virtual:
      enabled: true                # 启用虚拟线程(JDK17+)
```

#### 3.2 文件上传配置

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB          # 单文件最大大小
      max-request-size: 20MB       # 请求最大大小
      location: ${app.upload-path} # 临时文件目录
```

#### 3.3 JSON序列化配置

```yaml
spring:
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    serialization:
      indent_output: false         # 是否格式化输出
      fail_on_empty_beans: false   # 忽略空对象
    deserialization:
      fail_on_unknown_properties: false # 忽略未知属性
```

### 4. 数据库配置

#### 4.1 数据源配置

```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    dynamic:
      primary: master              # 默认数据源
      strict: true                 # 严格模式
      datasource:
        master: # 主库配置
          driverClassName: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://localhost:3306/ryplus_uni
          username: root
          password: root
        slave: # 从库配置
          lazy: true               # 懒加载
          # ... 其他配置同master
```

#### 4.2 连接池配置

```yaml
spring:
  datasource:
    dynamic:
      hikari:
        maxPoolSize: 20            # 最大连接数
        minIdle: 10               # 最小空闲连接数
        connectionTimeout: 30000   # 连接超时时间
        idleTimeout: 600000       # 空闲连接超时时间
        maxLifetime: 1800000      # 连接最大生命周期
```

#### 4.3 MyBatis-Plus配置

```yaml
mybatis-plus:
  enableLogicDelete: true          # 开启逻辑删除
  mapperPackage: plus.ruoyi.**.mapper
  mapperLocations: classpath*:mapper/**/*Mapper.xml
  typeAliasesPackage: plus.ruoyi.**.domain.entity
  global-config:
    dbConfig:
      idType: ASSIGN_ID            # 主键生成策略
```

### 5. Redis缓存配置

#### 5.1 Redis连接配置

```yaml
spring.data:
  redis:
    host: localhost                # Redis服务器地址
    port: 6379                    # 端口
    database: 0                   # 数据库索引
    password: your_password       # 密码
    timeout: 10s                  # 连接超时时间
```

#### 5.2 Redisson配置

```yaml
redisson:
  keyPrefix: ${app.id}            # Redis键前缀
  threads: 4                      # 线程池大小
  nettyThreads: 8                # Netty线程池大小
  singleServerConfig:
    clientName: ${app.id}         # 客户端名称
    connectionPoolSize: 32        # 连接池大小
    timeout: 3000                 # 命令超时时间
```

### 6. 安全认证配置

#### 6.1 Sa-Token配置

```yaml
sa-token:
  token-name: Authorization       # Token名称
  is-concurrent: true            # 允许并发登录
  is-share: false               # 是否共享Token
  jwt-secret-key: your_secret   # JWT密钥
```

#### 6.2 用户安全配置

```yaml
user:
  password:
    maxRetryCount: 5             # 密码最大错误次数
    lockTime: 10                 # 锁定时间(分钟)
```

#### 6.3 验证码配置

```yaml
captcha:
  type: MATH                     # 验证码类型: MATH/CHAR
  category: CIRCLE               # 干扰类型: LINE/CIRCLE/SHEAR
  numberLength: 1                # 数字验证码位数
  charLength: 4                  # 字符验证码长度
```

### 7. 第三方服务配置

#### 7.1 邮件服务配置

```yaml
mail:
  enabled: false                 # 是否启用邮件服务
  host: smtp.163.com            # SMTP服务器
  port: 465                     # SMTP端口
  auth: true                    # 是否需要认证
  from: xxx@163.com             # 发送方邮箱
  user: xxx@163.com             # 用户名
  pass: your_password           # 密码
  starttlsEnable: true          # 启用STARTTLS
  sslEnable: true               # 启用SSL
```

#### 7.2 短信服务配置

```yaml
sms:
  config-type: yaml             # 配置类型
  restricted: true              # 是否开启限制
  minute-max: 1                 # 每分钟最大发送数
  account-max: 30               # 每日最大发送数
  blends:
    config1: # 阿里云短信配置
      supplier: alibaba
      access-key-id: your_key
      access-key-secret: your_secret
      signature: your_signature
```

#### 7.3 定时任务配置

```yaml
snail-job:
  enabled: false                # 是否启用定时任务
  group: ${app.id}              # 任务组名
  token: your_token             # 验证令牌
  server:
    host: 127.0.0.1             # 调度中心地址
    port: 17888                 # 调度中心端口
  namespace: ${spring.profiles.active} # 命名空间
```

### 8. 监控和文档配置

#### 8.1 API文档配置

```yaml
springdoc:
  api-docs:
    enabled: true               # 是否开启接口文档
  info:
    title: '${app.title}_接口文档'
    description: '接口文档说明'
    version: '版本号: ${app.version}'
  group-configs: # 分组配置
    - group: business
      packages-to-scan: plus.ruoyi.business
    - group: system
      packages-to-scan: plus.ruoyi.system
```

#### 8.2 监控配置

```yaml
management:
  endpoints:
    web:
      exposure:
        include: '*'            # 暴露所有监控端点
  endpoint:
    health:
      show-details: ALWAYS      # 显示详细健康信息
    logfile:
      external-file: ./logs/sys-console.log # 日志文件路径
```

### 9. 其他重要配置

#### 9.1 多租户配置

```yaml
tenant:
  enable: true                  # 是否开启多租户
  excludes: [ ]                  # 排除的表名
```

#### 9.2 数据加密配置

```yaml
mybatis-encryptor:
  enable: false                 # 是否开启数据加密
  algorithm: BASE64             # 加密算法
  encode: BASE64                # 编码方式
  password: your_password       # 加密密钥
```

#### 9.3 API接口加密配置

```yaml
api-decrypt:
  enabled: true                 # 是否开启接口加密
  headerFlag: encrypt-key       # 加密头标识
  publicKey: your_public_key    # 公钥
  privateKey: your_private_key  # 私钥
```

## 环境差异配置

### 开发环境特点

- 开启SQL性能分析（p6spy: true）
- 使用本地文件路径
- Redis无密码
- 各种调试功能开启

### 生产环境特点

- 关闭SQL性能分析（p6spy: false）
- 使用生产环境路径
- Redis配置密码
- 连接池参数优化
- 启用监控和定时任务

## 配置最佳实践

### 1. 安全性

- 生产环境必须配置Redis密码
- 生产环境数据库不使用root用户，创建一个表绑定的专用用户

### 2. 性能优化

- 生产环境适当增大连接池大小
- 关闭不必要的调试功能
- 合理配置线程池参数

### 3. 运维友好

- 使用占位符引用其他配置项
- 为不同环境准备不同的配置文件
- 配置监控和健康检查端点

> 💡 **提示**: 在生产环境部署前，请仔细检查所有配置项，特别是数据库连接、Redis密码、各种密钥等敏感信息。
