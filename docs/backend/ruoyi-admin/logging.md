# 日志配置

## 概述

ruoyi-admin 使用 Logback 作为日志框架，提供了完善的日志管理方案：

- **环境区分** - 开发环境仅控制台输出，生产环境完整日志体系
- **分级存储** - INFO、ERROR、SQL日志分文件存储
- **异步处理** - 使用AsyncAppender提升性能
- **滚动归档** - 按天自动滚动，自动清理过期日志
- **彩色输出** - 开发时控制台彩色日志提高可读性
- **请求追踪** - 支持RequestId链路追踪

## 日志配置文件

### 文件位置

日志配置文件位于：`src/main/resources/logback-plus.xml`

### 整体结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 属性定义 -->
    <springProperty scope="context" name="log.path" source="logging.file.path" defaultValue="./logs"/>
    <springProperty scope="context" name="LOG_LEVEL" source="logging.level.root" defaultValue="INFO"/>

    <!-- 日志格式定义 -->
    <property name="console.log.pattern" value="..."/>
    <property name="log.pattern" value="..."/>

    <!-- 控制台输出器 -->
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">...</appender>

    <!-- 开发环境配置 -->
    <springProfile name="!prod">...</springProfile>

    <!-- 生产环境配置 -->
    <springProfile name="prod">...</springProfile>
</configuration>
```

## 日志格式

### 控制台日志格式（彩色）

```properties
%cyan(%d{yyyy-MM-dd HH:mm:ss}) %yellow([%X{requestId:-}]) %green([%thread]) %highlight(%-5level) %boldMagenta(%logger{36}%n) - %msg%n
```

**格式说明：**

| 颜色 | 内容 | 说明 |
|------|------|------|
| 青色 | 时间戳 | yyyy-MM-dd HH:mm:ss 格式 |
| 黄色 | RequestId | 请求追踪ID，用于链路追踪 |
| 绿色 | 线程名 | 当前执行线程 |
| 高亮 | 日志级别 | DEBUG/INFO/WARN/ERROR |
| 洋红色 | 日志器名称 | 最多36字符 |
| 默认 | 日志消息 | 实际日志内容 |

**示例输出：**
```
2025-01-15 10:30:45 [req-123456] [http-nio-5503-exec-1] INFO  p.r.s.u.SysUserService
 - 用户登录成功: admin
```

### 文件日志格式（纯文本）

```properties
%d{yyyy-MM-dd HH:mm:ss} [%X{requestId:-}] [%thread] %-5level %logger{36} - %msg%n
```

文件日志不包含颜色信息，便于日志分析工具处理。

## 环境配置

### 开发环境

开发环境（非prod）仅输出到控制台：

```xml
<springProfile name="!prod">
    <root level="${LOG_LEVEL}">
        <appender-ref ref="console"/>
    </root>
</springProfile>
```

**特点：**
- 仅控制台输出，不产生日志文件
- 彩色日志格式，提高可读性
- 日志级别由 `logging.level.root` 配置控制

### 生产环境

生产环境配置完整的日志体系：

```xml
<springProfile name="prod">
    <!-- 多个Appender定义 -->
    <root level="${LOG_LEVEL}">
        <appender-ref ref="console"/>        <!-- 控制台输出 -->
        <appender-ref ref="async_info"/>     <!-- 异步INFO日志 -->
        <appender-ref ref="async_error"/>    <!-- 异步ERROR日志 -->
        <appender-ref ref="file_console"/>   <!-- 控制台内容备份 -->
    </root>
</springProfile>
```

## 日志文件分类

生产环境产生以下日志文件：

### sys-console.log

控制台日志的文件备份。

```xml
<appender name="file_console" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${log.path}/sys-console.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>${log.path}/sys-console.%d{yyyy-MM-dd}.log</fileNamePattern>
        <maxHistory>7</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>${log.pattern}</pattern>
        <charset>utf-8</charset>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
        <level>INFO</level>
    </filter>
</appender>
```

**配置说明：**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 文件路径 | `${log.path}/sys-console.log` | 当前日志文件 |
| 滚动策略 | TimeBasedRollingPolicy | 按天滚动 |
| 归档格式 | `sys-console.%d{yyyy-MM-dd}.log` | 归档文件名格式 |
| 保留天数 | 7天 | 自动删除超过7天的日志 |
| 日志级别 | INFO及以上 | 过滤DEBUG和TRACE |

### sys-info.log

仅包含INFO级别的日志，用于业务分析。

```xml
<appender name="file_info" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${log.path}/sys-info.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>${log.path}/sys-info.%d{yyyy-MM-dd}.log</fileNamePattern>
        <maxHistory>60</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>${log.pattern}</pattern>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.LevelFilter">
        <level>INFO</level>
        <onMatch>ACCEPT</onMatch>
        <onMismatch>DENY</onMismatch>
    </filter>
</appender>
```

**配置说明：**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 保留天数 | 60天 | 适合长期业务分析 |
| 级别过滤 | 仅INFO | 只记录INFO级别日志 |
| 匹配策略 | ACCEPT/DENY | 精确匹配INFO |

### sys-error.log

仅包含ERROR级别的日志，用于问题排查。

```xml
<appender name="file_error" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${log.path}/sys-error.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>${log.path}/sys-error.%d{yyyy-MM-dd}.log</fileNamePattern>
        <maxHistory>60</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>${log.pattern}</pattern>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.LevelFilter">
        <level>ERROR</level>
        <onMatch>ACCEPT</onMatch>
        <onMismatch>DENY</onMismatch>
    </filter>
</appender>
```

**配置说明：**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 保留天数 | 60天 | 便于历史问题追溯 |
| 级别过滤 | 仅ERROR | 只记录ERROR级别日志 |

### sys-sql.log

SQL执行日志，用于数据库性能分析。

```xml
<appender name="file_sql" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${log.path}/sys-sql.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>${log.path}/sys-sql.%d{yyyy-MM-dd}.log</fileNamePattern>
        <maxHistory>7</maxHistory>
    </rollingPolicy>
    <encoder>
        <pattern>${log.pattern}</pattern>
    </encoder>
</appender>
```

**配置说明：**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 保留天数 | 7天 | SQL日志通常短期分析即可 |

## 异步日志

为提升性能，INFO和ERROR日志使用异步输出：

```xml
<appender name="async_info" class="ch.qos.logback.classic.AsyncAppender">
    <!-- 不丢失日志 -->
    <discardingThreshold>0</discardingThreshold>
    <!-- 队列深度 -->
    <queueSize>512</queueSize>
    <!-- 引用实际的输出器 -->
    <appender-ref ref="file_info"/>
</appender>
```

### 异步配置参数

| 参数 | 值 | 说明 |
|------|-----|------|
| discardingThreshold | 0 | 不丢弃任何日志 |
| queueSize | 512 | 队列容量，超过默认值256 |

**工作原理：**

1. 日志事件首先进入内存队列
2. 后台线程异步将日志写入文件
3. 主线程不阻塞等待IO操作
4. 队列满时可能阻塞（discardingThreshold=0时）

### 异步日志的优缺点

**优点：**
- 减少IO等待时间
- 提高系统吞吐量
- 适合高并发场景

**缺点：**
- 程序异常退出时可能丢失队列中的日志
- 占用额外内存空间
- 日志时间可能略有延迟

## 日志文件汇总

### 生产环境日志目录结构

```
logs/
├── sys-console.log              # 当前控制台日志
├── sys-console.2025-01-14.log   # 昨天的控制台日志
├── sys-info.log                 # 当前INFO日志
├── sys-info.2025-01-14.log      # 昨天的INFO日志
├── sys-error.log                # 当前ERROR日志
├── sys-error.2025-01-14.log     # 昨天的ERROR日志
├── sys-sql.log                  # 当前SQL日志
└── sys-sql.2025-01-14.log       # 昨天的SQL日志
```

### 日志保留策略

| 日志类型 | 保留天数 | 说明 |
|----------|----------|------|
| sys-console | 7天 | 短期调试使用 |
| sys-info | 60天 | 业务分析需要 |
| sys-error | 60天 | 问题追溯需要 |
| sys-sql | 7天 | 性能分析使用 |

## 应用配置

### 日志路径配置

通过 `application.yml` 配置日志路径：

```yaml
logging:
  file:
    path: ./logs
```

或通过环境变量：

```bash
export LOGGING_FILE_PATH=/var/log/ruoyi
```

### 日志级别配置

**开发环境（application-dev.yml）：**

```yaml
logging:
  level:
    root: debug
    plus.ruoyi: debug
    org.springframework: warn
```

**生产环境（application-prod.yml）：**

```yaml
logging:
  level:
    root: info
    plus.ruoyi: info
    org.springframework: warn
```

### 常用日志级别

| 级别 | 说明 | 使用场景 |
|------|------|---------|
| TRACE | 最详细的跟踪信息 | 极少使用 |
| DEBUG | 调试信息 | 开发调试 |
| INFO | 一般信息 | 生产环境默认 |
| WARN | 警告信息 | 潜在问题提示 |
| ERROR | 错误信息 | 系统异常 |

### 特定包日志级别

可针对特定包设置不同级别：

```yaml
logging:
  level:
    # 框架基础日志
    plus.ruoyi: info
    # 第三方库日志
    org.springframework: warn
    org.mybatis: warn
    com.zaxxer.hikari: warn
    # SQL日志（开发时开启）
    plus.ruoyi.system.mapper: debug
```

## SkyWalking集成

ruoyi-admin 预留了 SkyWalking 分布式追踪集成配置（默认注释）：

### 控制台集成

```xml
<!-- SkyWalking控制台日志追踪 -->
<appender name="console" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
        <layout class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.TraceIdPatternLogbackLayout">
            <pattern>[%tid] ${console.log.pattern}</pattern>
        </layout>
        <charset>utf-8</charset>
    </encoder>
</appender>
```

**说明：**
- `%tid` 表示 SkyWalking TraceId
- 启用后日志会显示链路追踪ID
- 便于在SkyWalking UI中关联日志和调用链

### 日志收集集成

```xml
<!-- SkyWalking日志收集 -->
<appender name="sky_log" class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.log.GRPCLogClientAppender">
    <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
        <layout class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.TraceIdPatternLogbackLayout">
            <pattern>[%tid] ${console.log.pattern}</pattern>
        </layout>
        <charset>utf-8</charset>
    </encoder>
</appender>
```

**说明：**
- 通过gRPC将日志推送到SkyWalking后端
- 支持在SkyWalking中集中查看和分析日志
- 需要配合SkyWalking OAP服务使用

### 启用SkyWalking

1. 添加依赖（pom.xml已预留）：

```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-logback-1.x</artifactId>
</dependency>
```

2. 取消logback-plus.xml中的注释

3. 启动时添加SkyWalking Agent：

```bash
java -javaagent:/path/to/skywalking-agent.jar \
     -Dskywalking.agent.service_name=ruoyi-admin \
     -Dskywalking.collector.backend_service=127.0.0.1:11800 \
     -jar ruoyi-admin.jar
```

## 请求追踪

### RequestId机制

系统通过MDC（Mapped Diagnostic Context）实现请求追踪：

```java
// 在请求过滤器中设置
MDC.put("requestId", generateRequestId());

// 请求结束后清理
MDC.remove("requestId");
```

### 日志格式中的RequestId

```properties
[%X{requestId:-}]
```

- `%X{requestId}` 获取MDC中的requestId
- `:-` 表示如果为空则显示空字符串
- 便于追踪一次请求的完整日志链

### 使用示例

同一个请求的日志会有相同的requestId：

```
2025-01-15 10:30:45 [req-abc123] [http-nio-5503-exec-1] INFO  p.r.c.AuthController - 开始登录验证
2025-01-15 10:30:45 [req-abc123] [http-nio-5503-exec-1] DEBUG p.r.s.SysUserService - 查询用户: admin
2025-01-15 10:30:46 [req-abc123] [http-nio-5503-exec-1] INFO  p.r.c.AuthController - 登录成功
```

## 最佳实践

### 1. 日志级别使用规范

```java
// ERROR - 系统异常，需要立即处理
log.error("数据库连接失败", e);

// WARN - 潜在问题，需要关注
log.warn("用户{}连续登录失败{}次", username, count);

// INFO - 重要业务节点
log.info("用户{}登录成功", username);

// DEBUG - 调试信息
log.debug("查询参数: {}", params);
```

### 2. 日志内容规范

**好的日志：**
```java
log.info("用户[{}]执行[{}]操作，参数: {}，结果: {}",
         user, action, params, result);
```

**不好的日志：**
```java
log.info("操作成功");  // 缺少上下文信息
log.info("params: " + params);  // 字符串拼接性能差
```

### 3. 异常日志规范

```java
try {
    // 业务代码
} catch (BusinessException e) {
    // 业务异常，记录info或warn
    log.warn("业务处理失败: {}", e.getMessage());
    throw e;
} catch (Exception e) {
    // 系统异常，记录error并包含堆栈
    log.error("系统异常", e);
    throw new ServiceException("系统异常");
}
```

### 4. 敏感信息保护

```java
// 不要记录敏感信息
log.info("用户密码: {}", password);  // ❌ 错误

// 脱敏处理
log.info("用户手机: {}", desensitize(phone));  // ✅ 正确
```

### 5. 性能敏感场景

```java
// 高频调用处使用条件判断
if (log.isDebugEnabled()) {
    log.debug("复杂计算结果: {}", expensiveOperation());
}
```

## 常见问题

### 1. 日志文件未生成

**问题原因：**
- 未激活prod环境
- 日志目录无写入权限
- 配置文件路径错误

**解决方案：**
```bash
# 检查激活的Profile
java -jar ruoyi-admin.jar --spring.profiles.active=prod

# 检查日志目录权限
chmod 755 /var/log/ruoyi

# 明确指定日志路径
java -jar ruoyi-admin.jar --logging.file.path=/var/log/ruoyi
```

### 2. 日志级别不生效

**问题原因：**
- 配置覆盖顺序问题
- logback配置优先级

**解决方案：**

检查配置加载顺序：
1. `logback-plus.xml` 中的默认值
2. `application.yml` 中的 `logging.level`
3. 环境变量 `LOGGING_LEVEL_*`
4. 命令行参数 `--logging.level.*`

```yaml
# 确保配置正确
logging:
  level:
    root: debug  # 全局级别
    plus.ruoyi: debug  # 应用包级别
```

### 3. 日志输出乱码

**问题原因：**
- 系统编码与配置不匹配
- 控制台不支持UTF-8

**解决方案：**
```xml
<!-- 确保编码配置正确 -->
<encoder>
    <charset>utf-8</charset>
</encoder>
```

```bash
# Linux设置环境变量
export LANG=en_US.UTF-8

# Windows PowerShell
[Console]::OutputEncoding = [Text.Encoding]::UTF8
```

### 4. 异步日志丢失

**问题原因：**
- 程序异常终止
- 队列满且设置了丢弃策略

**解决方案：**
```xml
<!-- 配置不丢弃日志 -->
<discardingThreshold>0</discardingThreshold>

<!-- 增加队列容量 -->
<queueSize>1024</queueSize>
```

```java
// 程序关闭时刷新日志
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
    loggerContext.stop();
}));
```

### 5. 日志文件过大

**问题原因：**
- 日志级别设置过低
- 没有配置文件大小限制

**解决方案：**

使用基于大小和时间的滚动策略：

```xml
<rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
    <fileNamePattern>${log.path}/sys-info.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
    <maxFileSize>100MB</maxFileSize>
    <maxHistory>60</maxHistory>
    <totalSizeCap>10GB</totalSizeCap>
</rollingPolicy>
```

| 参数 | 说明 |
|------|------|
| maxFileSize | 单个文件最大100MB |
| maxHistory | 保留60天 |
| totalSizeCap | 总大小不超过10GB |

## 监控配置

### Actuator日志端点

Spring Boot Actuator 提供日志相关端点：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: loggers
```

**查看日志配置：**
```bash
GET /actuator/loggers
```

**动态修改日志级别：**
```bash
POST /actuator/loggers/plus.ruoyi
Content-Type: application/json

{
    "configuredLevel": "DEBUG"
}
```

### 外部日志文件访问

```yaml
management:
  endpoint:
    logfile:
      external-file: ${logging.file.path}/sys-console.log
```

访问地址：`GET /actuator/logfile`
