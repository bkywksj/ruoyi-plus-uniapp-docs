# 日志管理最佳实践

## 概述

日志是应用系统运行状态的记录者,是排查问题、监控性能、审计操作的重要依据。RuoYi-Plus-UniApp 项目采用 Logback + Spring 事件机制实现了完整的日志管理体系,包括系统日志、业务日志、操作日志和登录日志,并支持日志分级、异步处理、敏感信息过滤等企业级特性。

**核心价值:**

- **故障诊断** - 通过日志快速定位系统故障和异常
- **性能监控** - 记录慢查询、慢接口等性能问题
- **安全审计** - 追踪用户操作,满足合规要求
- **运营分析** - 分析用户行为,优化业务流程

**日志架构:**

```
┌──────────────────────────────────────────────────────────────────┐
│                         日志管理架构                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │   系统日志      │  │   业务日志      │  │   访问日志      │     │
│  │  (SLF4J/Logback)│  │ (@Log注解)     │  │  (Filter)      │     │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘     │
│           │                   │                   │              │
│           ▼                   ▼                   ▼              │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              日志处理层 (AOP + EventPublisher)           │     │
│  └────────────────────────────┬───────────────────────────┘     │
│                                │                                 │
│           ┌────────────────────┼────────────────────┐            │
│           ▼                    ▼                    ▼            │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  文件日志          │  │ 数据库存储    │  │  集中式日志平台   │   │
│  │ (RollingFile)    │  │  (Async)     │  │  (ELK/Loki)      │   │
│  └─────────────────┘  └──────────────┘  └──────────────────┘   │
│                                                                  │
│  日志输出:                                                        │
│  - sys-console.log  (控制台备份，7天)                            │
│  - sys-info.log     (INFO级别，60天)                             │
│  - sys-error.log    (ERROR级别，60天)                            │
│  - sys-sql.log      (SQL日志，7天)                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Logback 配置详解

### 1. 配置文件结构

Logback 配置文件位于 `ruoyi-admin/src/main/resources/logback-plus.xml`,采用 Spring Profile 机制区分开发和生产环境。

**核心配置项:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 从 Spring 配置读取日志路径 -->
    <springProperty scope="context" name="log.path"
                    source="logging.file.path" defaultValue="./logs"/>

    <!-- 从环境变量读取日志级别 -->
    <springProperty scope="context" name="LOG_LEVEL"
                    source="logging.level.root" defaultValue="INFO"/>

    <!-- 控制台彩色日志格式 -->
    <property name="console.log.pattern"
              value="%cyan(%d{yyyy-MM-dd HH:mm:ss}) %yellow([%X{requestId:-}]) %green([%thread]) %highlight(%-5level) %boldMagenta(%logger{36}%n) - %msg%n"/>

    <!-- 文件日志格式 -->
    <property name="log.pattern"
              value="%d{yyyy-MM-dd HH:mm:ss} [%X{requestId:-}] [%thread] %-5level %logger{36} - %msg%n"/>
</configuration>
```

**日志格式说明:**

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `%d{yyyy-MM-dd HH:mm:ss}` | 时间戳 | 2025-11-24 14:30:00 |
| `%X{requestId:-}` | MDC 请求ID | req-123456 |
| `%thread` | 线程名称 | http-nio-5500-exec-1 |
| `%-5level` | 日志级别(左对齐5字符) | INFO  |
| `%logger{36}` | Logger名称(最长36字符) | c.r.system.service.UserService |
| `%msg` | 日志消息 | 用户登录成功 |
| `%n` | 换行符 | - |

### 2. 开发环境配置

开发环境只输出到控制台,方便实时查看:

```xml
<springProfile name="!prod">
    <!-- 开发环境：只输出到控制台 -->
    <root level="${LOG_LEVEL}">
        <appender-ref ref="console"/>
    </root>
</springProfile>
```

**特点:**
- 彩色日志输出,提高可读性
- 默认 INFO 级别,可通过环境变量调整
- 不生成日志文件,减少磁盘占用

### 3. 生产环境配置

生产环境采用多文件分级存储策略:

**文件日志 Appender:**

```xml
<springProfile name="prod">
    <!-- INFO 级别日志 -->
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

    <!-- ERROR 级别日志 -->
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
</springProfile>
```

**日志文件说明:**

| 文件名 | 日志级别 | 保留时间 | 用途 |
|--------|---------|---------|------|
| `sys-console.log` | INFO+ | 7天 | 控制台输出备份 |
| `sys-info.log` | INFO | 60天 | 普通业务日志 |
| `sys-error.log` | ERROR | 60天 | 错误日志 |
| `sys-sql.log` | DEBUG | 7天 | SQL执行日志 |

### 4. 异步日志配置

使用异步 Appender 提升日志性能:

```xml
<!-- INFO 日志异步输出器 -->
<appender name="async_info" class="ch.qos.logback.classic.AsyncAppender">
    <!-- 不丢失日志 (默认队列80%满时会丢弃TRACE/DEBUG/INFO) -->
    <discardingThreshold>0</discardingThreshold>

    <!-- 队列大小 (默认256, 可根据实际情况调整) -->
    <queueSize>512</queueSize>

    <!-- 引用同步 Appender -->
    <appender-ref ref="file_info"/>
</appender>

<!-- ERROR 日志异步输出器 -->
<appender name="async_error" class="ch.qos.logback.classic.AsyncAppender">
    <discardingThreshold>0</discardingThreshold>
    <queueSize>512</queueSize>
    <appender-ref ref="file_error"/>
</appender>
```

**异步日志配置要点:**

1. **`discardingThreshold=0`**: 禁止丢弃日志
   - 默认值80: 队列80%满时丢弃TRACE/DEBUG/INFO
   - 设为0: 永不丢弃,所有日志都会记录

2. **`queueSize=512`**: 队列大小
   - 默认256,高并发场景建议调大
   - 过大会占用内存,过小可能阻塞
   - 建议范围: 256-1024

3. **性能对比:**

| 场景 | 同步日志 | 异步日志 | 性能提升 |
|------|---------|---------|---------|
| 普通日志 | 0.5ms | 0.05ms | 10倍 |
| 高并发 | 2-5ms | 0.1ms | 20-50倍 |
| 磁盘IO慢 | 10ms+ | 0.1ms | 100倍+ |

---

## 业务日志管理

### 1. @Log 注解

通过 `@Log` 注解声明式记录操作日志:

```java
@Log(title = "用户管理", operType = DictOperType.INSERT)
@PostMapping
public R<Void> add(@Validated @RequestBody UserBo bo) {
    userService.insertUser(bo);
    return R.ok();
}

@Log(title = "用户管理", operType = DictOperType.UPDATE)
@PutMapping
public R<Void> edit(@Validated @RequestBody UserBo bo) {
    userService.updateUser(bo);
    return R.ok();
}

@Log(title = "用户管理", operType = DictOperType.DELETE)
@DeleteMapping("/{userIds}")
public R<Void> remove(@PathVariable Long[] userIds) {
    userService.deleteUserByIds(userIds);
    return R.ok();
}
```

**@Log 注解属性:**

```java
public @interface Log {
    /**
     * 模块名称 (必填)
     */
    String title() default "";

    /**
     * 操作类型 (必填)
     */
    DictOperType operType() default DictOperType.OTHER;

    /**
     * 是否保存请求参数
     */
    boolean isSaveRequestData() default true;

    /**
     * 是否保存响应数据
     */
    boolean isSaveResponseData() default true;

    /**
     * 排除指定的请求参数
     */
    String[] excludeParamNames() default {};
}
```

**操作类型定义:**

```java
public enum DictOperType {
    OTHER("0", "其他"),
    INSERT("1", "新增"),
    UPDATE("2", "修改"),
    DELETE("3", "删除"),
    GRANT("4", "授权"),
    EXPORT("5", "导出"),
    IMPORT("6", "导入"),
    FORCE("7", "强退"),
    GENCODE("8", "生成代码"),
    CLEAN("9", "清空数据");
}
```

### 2. 操作日志 AOP 实现

LogAspect 通过 AOP 拦截 @Log 注解的方法:

```java
@Slf4j
@Aspect
public class LogAspect {

    /** 排除敏感属性字段 */
    public static final String[] EXCLUDE_PROPERTIES = {
        "password", "oldPassword", "newPassword", "confirmPassword"
    };

    /**
     * 环绕通知：拦截 @Log 注解方法
     */
    @Around("@annotation(controllerLog)")
    public Object doAround(ProceedingJoinPoint joinPoint, Log controllerLog) throws Throwable {
        // 开始计时
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        Object result = null;
        Exception exception = null;

        try {
            // 执行目标方法
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            // 停止计时
            stopWatch.stop();
            long costTime = stopWatch.getDuration().toMillis();

            // 记录操作日志
            handleLog(joinPoint, controllerLog, exception, result, costTime);
        }
    }
}
```

**日志记录流程:**

```
1. AOP 拦截 @Log 方法
   ↓
2. 启动计时器
   ↓
3. 执行目标方法
   ↓
4. 捕获异常 (如果有)
   ↓
5. 停止计时
   ↓
6. 收集日志信息:
   - 操作人信息 (用户名、租户、部门)
   - 请求信息 (IP、URL、方法)
   - 执行结果 (成功/失败、耗时)
   - 请求参数 (过滤敏感字段)
   - 响应结果
   ↓
7. 发布事件 (异步保存)
   ↓
8. 重新抛出异常 (保证业务流程不受影响)
```

### 3. 敏感信息过滤

自动过滤密码等敏感字段:

```java
/**
 * 获取请求参数并设置到日志对象中
 */
private void setRequestValue(ProceedingJoinPoint joinPoint, OperLogEvent operLog,
                             String[] excludeParamNames) {
    // 获取查询参数
    Map<String, String> paramsMap = ServletUtils.getParamMap(ServletUtils.getRequest());

    // 移除敏感字段
    MapUtil.removeAny(paramsMap, EXCLUDE_PROPERTIES);
    // 移除自定义排除字段
    MapUtil.removeAny(paramsMap, excludeParamNames);

    // 序列化为 JSON
    operLog.setOperParam(StringUtils.substring(
        JsonUtils.toJsonString(paramsMap), 0, 65535
    ));
}
```

**自定义排除字段:**

```java
@Log(
    title = "用户管理",
    operType = DictOperType.UPDATE,
    excludeParamNames = {"avatar", "signature"} // 排除头像、签名字段
)
@PutMapping("/profile")
public R<Void> updateProfile(@RequestBody UserProfileBo bo) {
    // ...
}
```

### 4. 登录日志

使用 LoginLogPublisher 记录登录日志:

```java
// 登录成功
LoginLogPublisher.publishLoginLog(
    username,
    DictOperResult.SUCCESS.getValue(),
    "登录成功",
    tenantId,
    userId,
    UserType.PC_USER.getDeviceType()
);

// 登录失败
LoginLogPublisher.publishLoginLog(
    username,
    DictOperResult.FAIL.getValue(),
    "用户名或密码错误",
    tenantId
);

// 登出
LoginLogPublisher.publishLoginLog(
    username,
    DictOperResult.SUCCESS.getValue(),
    "退出成功",
    tenantId,
    userId
);
```

---

## 日志级别管理

### 1. 日志级别定义

Logback 日志级别从低到高:

| 级别 | 说明 | 使用场景 |
|------|------|---------|
| TRACE | 追踪级别 | 非常详细的调试信息 |
| DEBUG | 调试级别 | 调试信息,开发阶段使用 |
| INFO | 信息级别 | 重要业务流程信息 |
| WARN | 警告级别 | 潜在问题,但不影响运行 |
| ERROR | 错误级别 | 错误信息,需要关注 |

### 2. 环境日志级别配置

**开发环境** (`application-dev.yml`):

```yaml
logging:
  level:
    root: INFO                              # 根日志级别
    plus.ruoyi: DEBUG                       # 项目代码DEBUG级别
    plus.ruoyi.common.mybatis: TRACE        # MyBatis SQL TRACE级别
```

**生产环境** (`application-prod.yml`):

```yaml
logging:
  level:
    root: INFO                              # 根日志级别
    plus.ruoyi: INFO                        # 项目代码INFO级别
    org.springframework: WARN               # Spring框架WARN级别
    com.zaxxer.hikari: WARN                 # 数据库连接池WARN级别
```

**测试环境** (`application-test.yml`):

```yaml
logging:
  level:
    root: INFO
    plus.ruoyi: DEBUG
    plus.ruoyi.system.service: TRACE       # 特定服务TRACE级别
```

### 3. 动态调整日志级别

通过 Spring Boot Actuator 动态调整:

```bash
# 查看当前日志级别
curl http://localhost:5500/actuator/loggers/plus.ruoyi.system.service.UserService

# 动态调整为 DEBUG
curl -X POST http://localhost:5500/actuator/loggers/plus.ruoyi.system.service.UserService \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel": "DEBUG"}'

# 恢复默认级别
curl -X POST http://localhost:5500/actuator/loggers/plus.ruoyi.system.service.UserService \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel": null}'
```

**使用场景:**
- 生产环境临时开启 DEBUG 排查问题
- 性能测试时临时关闭部分日志
- 不需要重启应用即可生效

### 4. 包级别日志配置

为不同包设置不同日志级别:

```xml
<configuration>
    <!-- 根日志 -->
    <root level="INFO">
        <appender-ref ref="console"/>
    </root>

    <!-- Spring 框架日志 -->
    <logger name="org.springframework" level="WARN"/>
    <logger name="org.springframework.web" level="INFO"/>

    <!-- MyBatis 日志 -->
    <logger name="plus.ruoyi.common.mybatis" level="DEBUG"/>

    <!-- 数据库连接池日志 -->
    <logger name="com.zaxxer.hikari" level="WARN"/>

    <!-- Redis 日志 -->
    <logger name="org.redisson" level="WARN"/>

    <!-- 业务日志 -->
    <logger name="plus.ruoyi.system" level="INFO"/>
    <logger name="plus.ruoyi.business" level="DEBUG"/>
</configuration>
```

---

## SQL 日志管理

### 1. MyBatis SQL 日志配置

配置 MyBatis Plus 打印 SQL:

```yaml
# MyBatis Plus 配置
mybatis-plus:
  configuration:
    # 打印 SQL
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
  global-config:
    db-config:
      # 打印 SQL 日志
      logic-delete-value: 2
      logic-not-delete-value: 0
```

**Logback 配置:**

```xml
<!-- SQL 日志文件输出器 -->
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

<!-- MyBatis SQL 日志 -->
<logger name="plus.ruoyi.system.mapper" level="DEBUG" additivity="false">
    <appender-ref ref="async_sql"/>
</logger>
```

### 2. SQL 性能监控

记录慢 SQL:

```java
@Slf4j
@Component
public class SlowSqlInterceptor implements Interceptor {

    /** 慢查询阈值(毫秒) */
    private static final long SLOW_SQL_THRESHOLD = 1000;

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        long start = System.currentTimeMillis();

        try {
            return invocation.proceed();
        } finally {
            long cost = System.currentTimeMillis() - start;

            if (cost > SLOW_SQL_THRESHOLD) {
                MappedStatement mappedStatement =
                    (MappedStatement) invocation.getArgs()[0];
                BoundSql boundSql =
                    (BoundSql) invocation.getArgs()[1];

                log.warn("慢SQL检测: 耗时{}ms, SQL: {}, 参数: {}",
                    cost,
                    boundSql.getSql(),
                    boundSql.getParameterObject()
                );
            }
        }
    }
}
```

### 3. SQL 日志分析

分析 SQL 日志示例:

```bash
# 统计慢 SQL
grep "慢SQL检测" sys-sql.log | awk '{print $NF}' | sort | uniq -c | sort -rn

# 统计 SQL 执行次数
grep "==> Preparing:" sys-sql.log | awk -F"Preparing: " '{print $2}' | sort | uniq -c | sort -rn

# 查找特定表的 SQL
grep "user" sys-sql.log | grep "SELECT"

# 统计 SQL 类型分布
grep "==> Preparing:" sys-sql.log | awk '{print $4}' | sort | uniq -c
```

---

## MDC 请求追踪

### 1. MDC 配置

使用 MDC (Mapped Diagnostic Context) 追踪请求链路:

```java
@Component
public class RequestIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        // 生成请求 ID
        String requestId = generateRequestId();

        // 放入 MDC
        MDC.put("requestId", requestId);

        // 添加到响应头
        response.setHeader("X-Request-Id", requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            // 清理 MDC
            MDC.remove("requestId");
        }
    }

    private String generateRequestId() {
        return "req-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
```

### 2. MDC 在日志中的使用

Logback 配置中使用 MDC:

```xml
<!-- 日志格式包含 requestId -->
<property name="log.pattern"
          value="%d{yyyy-MM-dd HH:mm:ss} [%X{requestId:-}] [%thread] %-5level %logger{36} - %msg%n"/>
```

**日志输出示例:**

```
2025-11-24 14:30:00 [req-a1b2c3d4] [http-nio-5500-exec-1] INFO  plus.ruoyi.system.service.UserService - 用户登录成功: admin
2025-11-24 14:30:01 [req-a1b2c3d4] [http-nio-5500-exec-1] INFO  plus.ruoyi.system.service.MenuService - 加载用户菜单: userId=1
2025-11-24 14:30:02 [req-a1b2c3d4] [http-nio-5500-exec-1] INFO  plus.ruoyi.system.service.PermissionService - 加载用户权限: userId=1
```

### 3. 分布式追踪

集成分布式追踪 ID:

```java
@Component
public class TraceIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        // 从请求头获取追踪 ID (如果是下游调用)
        String traceId = request.getHeader("X-Trace-Id");

        // 如果没有,生成新的追踪 ID
        if (StringUtils.isBlank(traceId)) {
            traceId = generateTraceId();
        }

        // 放入 MDC
        MDC.put("traceId", traceId);

        // 传递到下游服务
        response.setHeader("X-Trace-Id", traceId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("traceId");
        }
    }
}
```

---

## 日志聚合与分析

### 1. ELK Stack 集成

**Logstash 配置:**

```ruby
# logstash.conf
input {
  # 读取日志文件
  file {
    path => "/app/logs/sys-*.log"
    type => "ruoyi-plus"
    codec => multiline {
      pattern => "^\d{4}-\d{2}-\d{2}"
      negate => true
      what => "previous"
    }
  }
}

filter {
  # 解析日志格式
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{DATA:requestId}\] \[%{DATA:thread}\] %{LOGLEVEL:level} +%{DATA:logger} - %{GREEDYDATA:msg}"
    }
  }

  # 转换时间戳
  date {
    match => ["timestamp", "yyyy-MM-dd HH:mm:ss"]
    target => "@timestamp"
  }
}

output {
  # 输出到 Elasticsearch
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "ruoyi-plus-logs-%{+YYYY.MM.dd}"
  }
}
```

**Filebeat 配置:**

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /app/logs/sys-*.log
    fields:
      app: ruoyi-plus
      env: production
    multiline:
      pattern: '^\d{4}-\d{2}-\d{2}'
      negate: true
      match: after

output.elasticsearch:
  hosts: ["http://elasticsearch:9200"]
  index: "ruoyi-plus-logs-%{+yyyy.MM.dd}"

output.logstash:
  hosts: ["logstash:5044"]
```

### 2. Grafana Loki 集成

**Promtail 配置:**

```yaml
# promtail.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: ruoyi-plus
    static_configs:
      - targets:
          - localhost
        labels:
          job: ruoyi-plus
          env: production
          __path__: /app/logs/sys-*.log
```

**Loki 查询示例:**

```txt
# 查询 ERROR 日志
{job="ruoyi-plus"} |= "ERROR"

# 查询特定请求的日志
{job="ruoyi-plus"} |= "req-a1b2c3d4"

# 统计错误率
sum by (level) (rate({job="ruoyi-plus"}[5m]))

# 查询慢 SQL
{job="ruoyi-plus"} |= "慢SQL检测" | json | cost > 1000
```

### 3. 日志查询与分析

**Kibana 查询示例:**

```
# 查询 ERROR 级别日志
level: ERROR

# 查询特定用户的操作
logger: "plus.ruoyi.system.service.UserService" AND msg: "admin"

# 查询慢接口
level: WARN AND msg: "请求耗时" AND cost > 1000

# 按时间范围查询
timestamp: [2025-11-24T00:00:00 TO 2025-11-24T23:59:59]

# 查询异常堆栈
msg: "java.lang.NullPointerException"
```

**Grafana Dashboard 配置:**

```json
{
  "dashboard": {
    "title": "RuoYi-Plus 日志监控",
    "panels": [
      {
        "title": "日志级别分布",
        "targets": [
          {
            "expr": "sum by (level) (rate({job=\"ruoyi-plus\"}[5m]))"
          }
        ]
      },
      {
        "title": "错误日志趋势",
        "targets": [
          {
            "expr": "rate({job=\"ruoyi-plus\", level=\"ERROR\"}[5m])"
          }
        ]
      },
      {
        "title": "Top 10 慢接口",
        "targets": [
          {
            "expr": "topk(10, sum by (uri) (rate({job=\"ruoyi-plus\"} |~ \"慢接口\"[5m])))"
          }
        ]
      }
    ]
  }
}
```

---

## 日志最佳实践

### 1. 日志编写规范

**DO (应该做的):**

```java
// ✅ 使用占位符,避免字符串拼接
log.info("用户登录成功: userId={}, username={}", userId, username);

// ✅ 记录关键业务节点
log.info("开始处理订单: orderId={}", orderId);
processOrder(orderId);
log.info("订单处理完成: orderId={}", orderId);

// ✅ 错误日志包含完整堆栈
try {
    // 业务代码
} catch (Exception e) {
    log.error("处理订单失败: orderId={}", orderId, e);
}

// ✅ 使用合适的日志级别
log.debug("缓存命中: key={}", key);       // 调试信息
log.info("用户注册成功: userId={}", userId);  // 重要业务
log.warn("库存不足: productId={}", productId); // 潜在问题
log.error("支付失败: orderId={}", orderId);   // 错误信息
```

**DON'T (不应该做的):**

```java
// ❌ 字符串拼接(性能差)
log.info("用户登录成功: userId=" + userId + ", username=" + username);

// ❌ 日志过于详细(无用信息)
log.info("进入 UserService.getUserById 方法");
log.info("从数据库查询用户");
log.info("用户查询完成");

// ❌ 不记录异常堆栈
catch (Exception e) {
    log.error("处理订单失败: " + e.getMessage()); // ❌ 丢失堆栈信息
}

// ❌ 错误的日志级别
log.error("用户访问首页");  // ❌ 不是错误
log.debug("支付失败");     // ❌ 应该用 ERROR
```

### 2. 日志性能优化

**条件日志:**

```java
// ❌ 不推荐: 无论日志级别如何都会执行拼接
log.debug("用户数据: " + expensiveToString(user));

// ✅ 推荐: 先判断日志级别
if (log.isDebugEnabled()) {
    log.debug("用户数据: {}", expensiveToString(user));
}
```

**异步日志:**

```xml
<!-- 使用异步 Appender -->
<appender name="async" class="ch.qos.logback.classic.AsyncAppender">
    <discardingThreshold>0</discardingThreshold>
    <queueSize>512</queueSize>
    <appender-ref ref="file"/>
</appender>
```

**批量日志:**

```java
// ❌ 循环内打日志(性能差)
for (User user : users) {
    log.info("处理用户: {}", user.getId());
}

// ✅ 汇总后打日志
log.info("批量处理用户: count={}, userIds={}", users.size(),
    users.stream().map(User::getId).collect(Collectors.toList()));
```

### 3. 日志安全

**脱敏处理:**

```java
@Slf4j
public class SensitiveDataMasker {

    /**
     * 手机号脱敏
     */
    public static String maskPhone(String phone) {
        if (StringUtils.isBlank(phone) || phone.length() != 11) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }

    /**
     * 身份证脱敏
     */
    public static String maskIdCard(String idCard) {
        if (StringUtils.isBlank(idCard) || idCard.length() < 8) {
            return idCard;
        }
        return idCard.substring(0, 6) + "********" + idCard.substring(14);
    }

    /**
     * 银行卡脱敏
     */
    public static String maskBankCard(String bankCard) {
        if (StringUtils.isBlank(bankCard) || bankCard.length() < 8) {
            return bankCard;
        }
        return bankCard.substring(0, 4) + " **** **** " + bankCard.substring(bankCard.length() - 4);
    }
}

// 使用示例
log.info("用户注册: phone={}, idCard={}",
    SensitiveDataMasker.maskPhone(phone),
    SensitiveDataMasker.maskIdCard(idCard)
);
```

**SQL 参数脱敏:**

```java
@Intercepts({
    @Signature(type = StatementHandler.class, method = "prepare", args = {Connection.class, Integer.class})
})
public class SqlMaskInterceptor implements Interceptor {

    private static final String[] SENSITIVE_PARAMS = {"password", "idCard", "phone"};

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        StatementHandler statementHandler = (StatementHandler) invocation.getTarget();
        BoundSql boundSql = statementHandler.getBoundSql();

        // 获取参数对象
        Object parameterObject = boundSql.getParameterObject();

        // 脱敏处理
        if (parameterObject != null) {
            maskSensitiveData(parameterObject);
        }

        return invocation.proceed();
    }

    private void maskSensitiveData(Object obj) {
        // 实现脱敏逻辑
    }
}
```

### 4. 日志文件管理

**日志清理策略:**

```xml
<!-- 按时间和大小滚动 -->
<appender name="file" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <!-- 每天滚动 -->
        <fileNamePattern>${log.path}/sys-info.%d{yyyy-MM-dd}.%i.log</fileNamePattern>

        <!-- 单个文件最大 100MB -->
        <maxFileSize>100MB</maxFileSize>

        <!-- 保留 60 天 -->
        <maxHistory>60</maxHistory>

        <!-- 总大小不超过 10GB -->
        <totalSizeCap>10GB</totalSizeCap>
    </rollingPolicy>
</appender>
```

**定时清理脚本:**

```bash
#!/bin/bash
# clean-logs.sh

LOG_DIR="/app/logs"
RETENTION_DAYS=60

# 清理超过保留期的日志
find ${LOG_DIR} -name "*.log.*" -type f -mtime +${RETENTION_DAYS} -delete

# 压缩7天前的日志
find ${LOG_DIR} -name "*.log.*" -type f -mtime +7 ! -name "*.gz" -exec gzip {} \;

echo "日志清理完成: $(date)"
```

**Crontab 配置:**

```bash
# 每天凌晨2点执行日志清理
0 2 * * * /app/scripts/clean-logs.sh >> /app/logs/clean.log 2>&1
```

---

## 故障诊断与排查

### 1. 日志诊断流程

**问题: 应用响应缓慢**

```bash
# 1. 查看错误日志
tail -f logs/sys-error.log

# 2. 查找慢接口
grep "慢接口" logs/sys-info.log | tail -20

# 3. 查看 SQL 日志
grep "慢SQL" logs/sys-sql.log

# 4. 分析请求链路
grep "req-a1b2c3d4" logs/sys-info.log | grep -v "DEBUG"

# 5. 统计异常频率
grep "ERROR" logs/sys-error.log | awk '{print $6}' | sort | uniq -c | sort -rn
```

**问题: 内存溢出 OOM**

```bash
# 1. 查找 OOM 日志
grep -i "OutOfMemoryError" logs/sys-error.log

# 2. 查看异常前的日志
grep -B 50 "OutOfMemoryError" logs/sys-error.log

# 3. 分析堆栈信息
grep -A 20 "OutOfMemoryError" logs/sys-error.log

# 4. 查找大对象创建
grep "创建.*对象" logs/sys-info.log | grep -E "[0-9]{4,}"
```

### 2. 常见问题排查

**问题 1: 日志不输出**

**原因:**
- 日志级别配置过高
- Appender 配置错误
- 日志文件路径不存在

**解决方案:**

```bash
# 检查日志配置
cat application.yml | grep logging

# 检查日志目录权限
ls -la logs/

# 临时调整日志级别
curl -X POST http://localhost:5500/actuator/loggers/root \
  -d '{"configuredLevel": "DEBUG"}'

# 检查 Logback 配置
java -Dlogback.statusListenerClass=ch.qos.logback.core.status.OnConsoleStatusListener -jar app.jar
```

**问题 2: 日志文件过大**

**原因:**
- 日志级别设置为 DEBUG/TRACE
- 没有配置滚动策略
- 日志内容过于详细

**解决方案:**

```xml
<!-- 配置滚动策略 -->
<rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
    <fileNamePattern>${log.path}/sys-info.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
    <maxFileSize>100MB</maxFileSize>
    <maxHistory>30</maxHistory>
    <totalSizeCap>5GB</totalSizeCap>
</rollingPolicy>

<!-- 调整日志级别 -->
<root level="INFO">
    <appender-ref ref="file"/>
</root>
```

**问题 3: 日志丢失**

**原因:**
- 异步队列满,丢弃日志
- 应用异常退出,缓冲区未刷新
- 磁盘空间不足

**解决方案:**

```xml
<!-- 禁止丢弃日志 -->
<appender name="async" class="ch.qos.logback.classic.AsyncAppender">
    <discardingThreshold>0</discardingThreshold>
    <queueSize>1024</queueSize>
    <neverBlock>false</neverBlock> <!-- 队列满时阻塞,不丢弃 -->
</appender>
```

---

## 总结

日志管理是应用运维的基础设施。通过本文档介绍的最佳实践:

1. **完整日志体系** - Logback + Spring 事件机制,支持系统日志、业务日志、操作日志
2. **分级管理** - 按环境、级别、模块分级配置,灵活可控
3. **异步处理** - 异步 Appender 提升性能,不影响业务流程
4. **安全可靠** - 敏感信息脱敏,日志文件加密,防止信息泄露
5. **链路追踪** - MDC + RequestId 追踪请求链路,快速定位问题
6. **集中分析** - 集成 ELK/Loki,实现日志聚合和可视化分析
7. **故障诊断** - 提供完整的日志诊断手册和常见问题解决方案

建议在实际使用中:
- 合理设置日志级别,避免日志过多或过少
- 使用异步日志,减少对业务性能的影响
- 定期清理和归档日志文件,避免磁盘空间不足
- 集成日志聚合平台,实现集中管理和分析
- 建立日志监控告警,及时发现异常
- 制定日志规范,团队统一遵守
