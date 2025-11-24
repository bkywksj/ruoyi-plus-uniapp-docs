# 系统监控最佳实践

## 概述

系统监控是保障应用稳定运行的关键环节。RuoYi-Plus-UniApp 项目集成了 Spring Boot Admin 监控中心和 Spring Boot Actuator 监控端点，提供了完整的应用监控、健康检查、指标收集和告警通知能力。通过监控系统，可以实时掌握应用运行状态，及时发现和解决问题。

**核心价值:**

- **实时监控** - 实时查看应用运行状态和性能指标
- **故障预警** - 及时发现异常并通知相关人员
- **性能分析** - 收集和分析应用性能数据
- **日志追踪** - 集中查看和管理应用日志

**监控架构:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      监控架构                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Spring Boot Admin (9090)                        │   │
│  │              监控中心                                     │   │
│  └────────────┬─────────────────────────┬───────────────────┘   │
│               │                         │                       │
│               ▼                         ▼                       │
│  ┌─────────────────────┐   ┌─────────────────────┐              │
│  │   应用实例1 (5500)   │   │   应用实例2 (5501)   │              │
│  │  /actuator/health   │   │  /actuator/health   │              │
│  │  /actuator/metrics  │   │  /actuator/metrics  │              │
│  │  /actuator/logfile  │   │  /actuator/logfile  │              │
│  └─────────────────────┘   └─────────────────────┘              │
│                                                                 │
│  告警通知:                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  邮件通知     │  │  钉钉机器人   │  │  自定义通知   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 监控中心部署

### Spring Boot Admin 监控中心

**模块位置:** `ruoyi-extend/ruoyi-monitor-admin`

**端口:** `9090`

**访问地址:** `http://localhost:9090/admin`

### 配置文件

**application.yml:**

```yaml
server:
  port: 9090

spring:
  application:
    name: ruoyi-monitor-admin
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:prod}
  security:
    user:
      name: ${MONITOR_USERNAME:ruoyi}
      password: ${MONITOR_PASSWORD:123456}

# Spring Boot Admin 监控中心配置
management:
  endpoints:
    web:
      exposure:
        include: '*'                    # 暴露所有端点
  endpoint:
    health:
      show-details: ALWAYS              # 显示详细健康信息
    logfile:
      external-file: ./logs/admin-console.log

# Spring Boot Admin 客户端配置(监控中心自监控)
spring.boot.admin:
  client:
    enabled: ${MONITOR_SELF_ENABLED:true}
    url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
    instance:
      prefer-ip: true
      metadata:
        user.name: ${MONITOR_USERNAME:ruoyi}
        user.password: ${MONITOR_PASSWORD:123456}

# 通知配置
notify:
  # 邮件通知
  mail:
    enabled: ${NOTIFY_MAIL_ENABLED:false}
    to: ${NOTIFY_MAIL_TO:}
    subject: ${NOTIFY_MAIL_SUBJECT:admin监控通知}
  # WebHook通知(钉钉)
  webhook:
    enabled: ${NOTIFY_WEBHOOK_ENABLED:false}
    dingtalk:
      webhook-url: ${DINGTALK_WEBHOOK_URL:}
      secret: ${DINGTALK_SECRET:}
      keywords: ${DINGTALK_KEYWORDS:}
```

### 启动监控中心

**方式一: 独立启动**

```bash
cd ruoyi-extend/ruoyi-monitor-admin
mvn spring-boot:run
```

**方式二: Docker启动**

```bash
# 使用 docker-compose
cd script/docker/compose
docker-compose -f MonitorAdmin-compose.yml up -d

# 或使用完整部署
docker-compose -f Complete-compose.yml up -d monitor
```

**访问监控中心:**

1. 打开浏览器访问: `http://localhost:9090/admin`
2. 输入用户名密码登录(默认: ruoyi/123456)
3. 查看已注册的应用实例

---

## 应用监控配置

### 1. 客户端配置

**application.yml (主应用):**

```yaml
# Actuator 监控端点配置
management:
  endpoints:
    web:
      exposure:
        include: '*'                    # 暴露所有监控端点
  endpoint:
    health:
      show-details: ALWAYS              # 显示详细健康信息
    logfile:
      external-file: ./logs/sys-console.log

# Spring Boot Admin 客户端配置
spring.boot.admin:
  client:
    enabled: ${MONITOR_ENABLED:true}
    url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
    instance:
      prefer-ip: true                   # 使用IP地址注册
      metadata:
        user.name: ${MONITOR_USERNAME:ruoyi}
        user.password: ${MONITOR_PASSWORD:123456}
```

### 2. 环境变量配置

**生产环境配置:**

```bash
# 启用监控
MONITOR_ENABLED=true

# 监控中心地址
MONITOR_URL=http://127.0.0.1:9090/admin

# 监控中心认证信息
MONITOR_USERNAME=ruoyi
MONITOR_PASSWORD=your-secure-password

# 日志级别
LOG_LEVEL=info
```

### 3. 安全配置

**SecurityConfig.java (监控中心):**

```java
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final AdminServerProperties adminServer;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        String adminContextPath = adminServer.getContextPath();

        SavedRequestAwareAuthenticationSuccessHandler successHandler =
            new SavedRequestAwareAuthenticationSuccessHandler();
        successHandler.setTargetUrlParameter("redirectTo");
        successHandler.setDefaultTargetUrl(adminContextPath + "/");

        http
            .authorizeHttpRequests(auth -> auth
                // 静态资源和登录页面允许访问
                .requestMatchers(adminContextPath + "/assets/**").permitAll()
                .requestMatchers(adminContextPath + "/login").permitAll()
                // 所有其他请求需要认证
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage(adminContextPath + "/login")
                .successHandler(successHandler)
            )
            .logout(logout -> logout
                .logoutUrl(adminContextPath + "/logout")
            )
            // 支持HTTP Basic认证(用于应用注册)
            .httpBasic(Customizer.withDefaults())
            // 禁用CSRF(生产环境建议启用)
            .csrf().ignoringRequestMatchers(
                adminContextPath + "/instances",
                adminContextPath + "/actuator/**"
            );

        return http.build();
    }
}
```

---

## 监控端点详解

### 健康检查端点

**`/actuator/health`**

返回应用健康状态:

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963174912,
        "free": 123456789012,
        "threshold": 10485760
      }
    },
    "ping": {
      "status": "UP"
    },
    "redis": {
      "status": "UP",
      "details": {
        "version": "7.2.8"
      }
    }
  }
}
```

**健康状态说明:**

| 状态 | 说明 |
|------|------|
| UP | 服务正常运行 |
| DOWN | 服务不可用 |
| OUT_OF_SERVICE | 服务停止 |
| UNKNOWN | 状态未知 |

### 指标端点

**`/actuator/metrics`**

查看可用指标列表:

```json
{
  "names": [
    "jvm.memory.used",
    "jvm.memory.max",
    "jvm.gc.pause",
    "http.server.requests",
    "system.cpu.usage",
    "process.uptime",
    "hikaricp.connections.active",
    ...
  ]
}
```

**查看具体指标:**

```bash
# JVM内存使用
GET /actuator/metrics/jvm.memory.used

# HTTP请求统计
GET /actuator/metrics/http.server.requests

# 数据库连接池
GET /actuator/metrics/hikaricp.connections.active
```

### 日志端点

**`/actuator/logfile`**

在线查看应用日志文件:

```bash
# 查看完整日志
curl http://localhost:5500/actuator/logfile

# 查看最后1000行
curl http://localhost:5500/actuator/logfile | tail -n 1000
```

### 其他重要端点

| 端点 | 说明 |
|------|------|
| `/actuator/info` | 应用信息 |
| `/actuator/env` | 环境变量 |
| `/actuator/beans` | Spring Bean列表 |
| `/actuator/mappings` | 请求映射列表 |
| `/actuator/threaddump` | 线程转储 |
| `/actuator/heapdump` | 堆转储(下载) |
| `/actuator/httptrace` | HTTP请求追踪 |

---

## 告警通知

### 1. 邮件通知

**配置邮件通知:**

```yaml
# 监控中心 application.yml
notify:
  mail:
    enabled: true
    to: admin@example.com,ops@example.com
    subject: 【监控告警】应用状态变更

# Spring邮件配置
spring:
  mail:
    host: smtp.example.com
    port: 465
    username: monitor@example.com
    password: your-email-password
    properties:
      mail.smtp.auth: true
      mail.smtp.ssl.enable: true
```

**邮件模板自定义:**

```java
@Component
public class CustomMailNotifier extends MailNotifier {

    @Override
    protected String getText(InstanceEvent event) {
        Instance instance = event.getInstance();
        return String.format(
            "应用: %s\n" +
            "实例: %s\n" +
            "状态: %s -> %s\n" +
            "时间: %s",
            instance.getRegistration().getName(),
            instance.getId(),
            event.getOldStatus(),
            event.getNewStatus(),
            LocalDateTime.now()
        );
    }
}
```

### 2. 钉钉机器人通知

**配置钉钉通知:**

```yaml
notify:
  webhook:
    enabled: true
    dingtalk:
      webhook-url: https://oapi.dingtalk.com/robot/send?access_token=xxx
      secret: SECxxxxxxxxxxxxx
      keywords: 监控,告警
```

**自定义通知处理器:**

```java
@Component
@RequiredArgsConstructor
public class CustomNotifier extends AbstractEventNotifier {

    private final NotifyProperties notifyProperties;

    @Override
    protected Mono<Void> doNotify(InstanceEvent event, Instance instance) {
        return Mono.fromRunnable(() -> {
            if (notifyProperties.getWebhook().isEnabled()) {
                sendDingTalkMessage(event, instance);
            }
        });
    }

    private void sendDingTalkMessage(InstanceEvent event, Instance instance) {
        String webhook = notifyProperties.getWebhook().getDingtalk().getWebhookUrl();
        String secret = notifyProperties.getWebhook().getDingtalk().getSecret();

        // 构建消息
        Map<String, Object> message = new HashMap<>();
        message.put("msgtype", "text");
        message.put("text", Map.of(
            "content", String.format(
                "【监控告警】\n" +
                "应用: %s\n" +
                "状态: %s -> %s\n" +
                "时间: %s",
                instance.getRegistration().getName(),
                event.getOldStatus(),
                event.getNewStatus(),
                LocalDateTime.now()
            )
        ));

        // 发送请求
        sendWebhookRequest(webhook, secret, message);
    }
}
```

### 3. 自定义通知渠道

**实现自定义通知:**

```java
@Component
public class WeChatNotifier extends AbstractEventNotifier {

    @Override
    protected Mono<Void> doNotify(InstanceEvent event, Instance instance) {
        return Mono.fromRunnable(() -> {
            // 发送企业微信通知
            sendWeChatMessage(event, instance);
        });
    }

    private void sendWeChatMessage(InstanceEvent event, Instance instance) {
        // 实现企业微信通知逻辑
    }
}
```

---

## 日志监控

### 操作日志

**使用 @Log 注解记录操作:**

```java
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@PostMapping
public R<Void> add(@Validated @RequestBody UserBo bo) {
    userService.insertUser(bo);
    return R.ok();
}
```

**@Log 注解参数:**

| 参数 | 说明 | 示例 |
|------|------|------|
| title | 功能模块 | "用户管理" |
| businessType | 操作类型 | INSERT/UPDATE/DELETE/EXPORT |
| operatorType | 操作人类别 | MANAGE/MOBILE |
| isSaveRequestData | 保存请求参数 | true/false |
| isSaveResponseData | 保存响应数据 | true/false |
| excludeParamNames | 排除参数 | "password", "oldPassword" |

**操作类型:**

```java
public enum BusinessType {
    OTHER,      // 其他
    INSERT,     // 新增
    UPDATE,     // 修改
    DELETE,     // 删除
    GRANT,      // 授权
    EXPORT,     // 导出
    IMPORT,     // 导入
    FORCE,      // 强退
    GENCODE,    // 生成代码
    CLEAN       // 清空数据
}
```

### 登录日志

**自动记录登录日志:**

```java
// 成功登录
LoginLogPublisher.recordLoginInfo(
    username,
    LoginStatus.SUCCESS,
    LoginType.PASSWORD,
    "登录成功"
);

// 登录失败
LoginLogPublisher.recordLoginInfo(
    username,
    LoginStatus.FAIL,
    LoginType.PASSWORD,
    "用户名或密码错误"
);
```

### 日志查询

**在监控中心查看日志:**

1. 登录监控中心
2. 选择应用实例
3. 点击"Logging"标签
4. 查看实时日志或下载日志文件

---

## 性能监控

### JVM监控

**内存使用监控:**

```bash
# 堆内存使用
GET /actuator/metrics/jvm.memory.used?tag=area:heap

# 非堆内存使用
GET /actuator/metrics/jvm.memory.used?tag=area:nonheap

# 各内存区域使用情况
GET /actuator/metrics/jvm.memory.used?tag=id:Metaspace
GET /actuator/metrics/jvm.memory.used?tag=id:CodeCache
```

**GC监控:**

```bash
# GC暂停时间
GET /actuator/metrics/jvm.gc.pause

# GC次数
GET /actuator/metrics/jvm.gc.count
```

### HTTP请求监控

**请求统计:**

```bash
# 总请求数
GET /actuator/metrics/http.server.requests

# 特定URI的请求统计
GET /actuator/metrics/http.server.requests?tag=uri:/api/user

# 错误请求统计
GET /actuator/metrics/http.server.requests?tag=status:500
```

### 数据库连接池监控

**HikariCP监控:**

```bash
# 活跃连接数
GET /actuator/metrics/hikaricp.connections.active

# 总连接数
GET /actuator/metrics/hikaricp.connections

# 等待连接线程数
GET /actuator/metrics/hikaricp.connections.pending
```

### 自定义指标

**注册自定义指标:**

```java
@Component
@RequiredArgsConstructor
public class CustomMetrics {

    private final MeterRegistry meterRegistry;

    // 计数器
    public void recordOrder() {
        Counter.builder("order.count")
            .tag("type", "online")
            .register(meterRegistry)
            .increment();
    }

    // 计时器
    public void recordProcessTime(long milliseconds) {
        Timer.builder("order.process.time")
            .register(meterRegistry)
            .record(milliseconds, TimeUnit.MILLISECONDS);
    }

    // 度量值
    public void recordQueueSize(int size) {
        Gauge.builder("queue.size", () -> size)
            .register(meterRegistry);
    }
}
```

---

## 最佳实践

### 1. 监控配置优化

```yaml
# 生产环境配置
management:
  endpoints:
    web:
      exposure:
        # 只暴露必要的端点
        include: health,metrics,logfile,info
  endpoint:
    health:
      # 显示详细信息需要认证
      show-details: when-authorized
      # 健康检查缓存(避免频繁查询)
      cache:
        time-to-live: 10s
```

### 2. 安全加固

```yaml
# 配置端点访问控制
management:
  endpoints:
    web:
      base-path: /actuator
      path-mapping:
        health: healthcheck  # 自定义路径
  endpoint:
    health:
      roles: ADMIN          # 需要ADMIN角色
```

### 3. 告警规则

**设置合理的告警阈值:**

| 指标 | 告警阈值 | 说明 |
|------|---------|------|
| CPU使用率 | > 80% | 持续5分钟 |
| 内存使用率 | > 85% | 持续5分钟 |
| 磁盘使用率 | > 90% | 立即告警 |
| JVM堆内存 | > 80% | 持续3分钟 |
| 响应时间 | > 3s | 平均值 |
| 错误率 | > 1% | 1分钟内 |

### 4. 监控数据保留

```yaml
# 配置数据保留策略
spring.boot.admin:
  monitor:
    # 状态变更历史保留时间
    status-lifetime: 7d
    # 详细信息保留时间
    info-lifetime: 1d
```

### 5. 性能优化

```java
// 异步处理监控数据
@Async("monitorExecutor")
public void processMetrics(Metrics metrics) {
    // 处理监控数据
}

// 配置线程池
@Bean("monitorExecutor")
public Executor monitorExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(5);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("monitor-");
    executor.initialize();
    return executor;
}
```

---

## 常见问题

### 1. 应用无法注册到监控中心

**问题原因:**
- 监控中心未启动
- 网络不通
- 认证信息错误

**解决方案:**

```bash
# 检查监控中心状态
curl http://localhost:9090/admin

# 检查应用配置
spring.boot.admin.client.url=http://127.0.0.1:9090/admin
spring.boot.admin.client.instance.metadata.user.name=ruoyi
spring.boot.admin.client.instance.metadata.user.password=123456

# 检查网络连通性
telnet 127.0.0.1 9090
```

### 2. Actuator端点403错误

**问题原因:** 安全配置限制访问

**解决方案:**

```java
@Configuration
public class ActuatorSecurityConfig {
    @Bean
    public SecurityFilterChain actuatorSecurityFilterChain(HttpSecurity http) {
        http.requestMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
                .anyRequest().hasRole("ADMIN")
            );
        return http.build();
    }
}
```

### 3. 监控数据不更新

**问题原因:** 缓存时间过长

**解决方案:**

```yaml
management:
  endpoint:
    health:
      cache:
        time-to-live: 5s  # 减少缓存时间
```

### 4. 通知不生效

**问题原因:**
- 通知配置错误
- 网络问题
- 密钥配置错误

**解决方案:**

```yaml
# 检查邮件配置
spring.mail.host=smtp.example.com
spring.mail.username=your-email
spring.mail.password=your-password

# 检查钉钉配置
notify.webhook.dingtalk.webhook-url=https://oapi.dingtalk.com/robot/send?access_token=xxx
notify.webhook.dingtalk.secret=SECxxx

# 测试通知
curl -X POST监控中心的通知测试接口
```

---

## 高级监控特性

### 1. 自定义健康检查

**实现自定义健康检查器:**

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    @Autowired
    private DataSource dataSource;

    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            // 检查数据库连接
            if (conn.isValid(3)) {
                // 查询数据库版本
                String version = conn.getMetaData().getDatabaseProductVersion();
                return Health.up()
                    .withDetail("database", "MySQL")
                    .withDetail("version", version)
                    .withDetail("status", "连接正常")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}
```

**Redis健康检查:**

```java
@Component
@RequiredArgsConstructor
public class RedisHealthIndicator implements HealthIndicator {

    private final RedissonClient redissonClient;

    @Override
    public Health health() {
        try {
            // 检查Redis连接
            redissonClient.getKeys().count();

            // 获取Redis信息
            String version = redissonClient.getConfig()
                .getCodec().getClass().getSimpleName();

            return Health.up()
                .withDetail("redis", "Redisson")
                .withDetail("codec", version)
                .withDetail("status", "连接正常")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withException(e)
                .build();
        }
    }
}
```

**磁盘空间健康检查:**

```java
@Component
public class DiskSpaceHealthIndicator implements HealthIndicator {

    private static final long THRESHOLD = 1024 * 1024 * 1024; // 1GB

    @Override
    public Health health() {
        File file = new File(".");
        long freeSpace = file.getFreeSpace();
        long totalSpace = file.getTotalSpace();
        long usableSpace = file.getUsableSpace();

        if (usableSpace < THRESHOLD) {
            return Health.down()
                .withDetail("free", formatSize(freeSpace))
                .withDetail("total", formatSize(totalSpace))
                .withDetail("usable", formatSize(usableSpace))
                .withDetail("threshold", formatSize(THRESHOLD))
                .withDetail("message", "磁盘空间不足")
                .build();
        }

        return Health.up()
            .withDetail("free", formatSize(freeSpace))
            .withDetail("total", formatSize(totalSpace))
            .withDetail("usable", formatSize(usableSpace))
            .build();
    }

    private String formatSize(long size) {
        return String.format("%.2f GB", size / (1024.0 * 1024.0 * 1024.0));
    }
}
```

### 2. 监控数据导出

**导出Prometheus格式指标:**

```yaml
# 添加依赖
management:
  metrics:
    export:
      prometheus:
        enabled: true
  endpoints:
    web:
      exposure:
        include: prometheus
```

**访问Prometheus端点:**

```bash
curl http://localhost:5500/actuator/prometheus
```

**输出示例:**

```
# HELP jvm_memory_used_bytes The amount of used memory
# TYPE jvm_memory_used_bytes gauge
jvm_memory_used_bytes{area="heap",id="PS Eden Space",} 1.2345678E8
jvm_memory_used_bytes{area="heap",id="PS Old Gen",} 2.3456789E8

# HELP http_server_requests_seconds
# TYPE http_server_requests_seconds summary
http_server_requests_seconds_count{method="GET",uri="/api/user",status="200",} 150
http_server_requests_seconds_sum{method="GET",uri="/api/user",status="200",} 1.234
```

### 3. 集成Grafana可视化

**Prometheus配置:**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ruoyi-plus'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:5500']
        labels:
          application: 'ruoyi-plus-app'
```

**Grafana Dashboard配置:**

```json
{
  "dashboard": {
    "title": "RuoYi-Plus 应用监控",
    "panels": [
      {
        "title": "JVM内存使用",
        "targets": [
          {
            "expr": "jvm_memory_used_bytes{application=\"ruoyi-plus-app\"}"
          }
        ]
      },
      {
        "title": "HTTP请求QPS",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count[1m])"
          }
        ]
      }
    ]
  }
}
```

### 4. 分布式追踪

**集成Micrometer Tracing:**

```yaml
# 配置追踪
management:
  tracing:
    sampling:
      probability: 1.0  # 采样率100%
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans
```

**自定义Span:**

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final Tracer tracer;

    public User getUser(Long userId) {
        Span span = tracer.nextSpan().name("getUserById");
        try (Tracer.SpanInScope ws = tracer.withSpan(span.start())) {
            span.tag("user.id", userId.toString());

            // 业务逻辑
            User user = userRepository.findById(userId);

            span.tag("user.name", user.getUsername());
            span.event("user.found");

            return user;
        } finally {
            span.end();
        }
    }
}
```

---

## 监控告警策略

### 1. 分级告警规则

**告警级别定义:**

| 级别 | 说明 | 通知方式 | 响应时间 |
|------|------|---------|---------|
| P0 | 紧急故障 | 电话+短信+钉钉 | 5分钟内 |
| P1 | 严重故障 | 短信+钉钉+邮件 | 15分钟内 |
| P2 | 重要告警 | 钉钉+邮件 | 30分钟内 |
| P3 | 一般告警 | 邮件 | 1小时内 |
| P4 | 提示信息 | 日志记录 | 无要求 |

**告警规则配置:**

```yaml
# 自定义告警配置
alerting:
  rules:
    # P0 - 服务完全不可用
    - name: service-down
      level: P0
      condition: "status == 'DOWN'"
      channels: [phone, sms, dingtalk]

    # P1 - 内存使用率过高
    - name: high-memory
      level: P1
      condition: "jvm.memory.used / jvm.memory.max > 0.9"
      duration: 5m
      channels: [sms, dingtalk, email]

    # P2 - 响应时间过长
    - name: slow-response
      level: P2
      condition: "http.server.requests.avg > 3000"
      duration: 5m
      channels: [dingtalk, email]

    # P3 - 错误率上升
    - name: error-rate
      level: P3
      condition: "error.rate > 0.01"
      duration: 10m
      channels: [email]
```

### 2. 告警收敛

**防止告警风暴:**

```java
@Component
@RequiredArgsConstructor
public class AlertManager {

    private final Map<String, AlertRecord> recentAlerts = new ConcurrentHashMap<>();

    /**
     * 发送告警,带收敛逻辑
     *
     * @param alert 告警信息
     */
    public void sendAlert(Alert alert) {
        String key = alert.getType() + ":" + alert.getInstance();
        AlertRecord record = recentAlerts.get(key);

        // 检查是否在静默期内
        if (record != null && record.isInSilencePeriod()) {
            log.info("告警被收敛: {}", alert);
            record.incrementCount();
            return;
        }

        // 发送告警
        doSendAlert(alert);

        // 记录告警
        AlertRecord newRecord = new AlertRecord(alert);
        newRecord.setSilenceUntil(
            LocalDateTime.now().plusMinutes(getSilenceMinutes(alert.getLevel()))
        );
        recentAlerts.put(key, newRecord);
    }

    /**
     * 获取静默时间
     */
    private int getSilenceMinutes(AlertLevel level) {
        return switch (level) {
            case P0 -> 5;   // P0告警5分钟内不重复
            case P1 -> 10;  // P1告警10分钟内不重复
            case P2 -> 30;  // P2告警30分钟内不重复
            case P3 -> 60;  // P3告警1小时内不重复
            default -> 120;
        };
    }
}
```

### 3. 告警通知模板

**钉钉告警模板优化:**

```java
public class DingTalkAlertTemplate {

    /**
     * 构建丰富的告警消息
     */
    public static String buildAlertMessage(Alert alert) {
        StringBuilder sb = new StringBuilder();

        // 标题 - 使用emoji增强可读性
        String emoji = getEmoji(alert.getLevel());
        sb.append("## ").append(emoji).append(" ").append(alert.getTitle()).append("\n\n");

        // 告警级别
        sb.append("**告警级别:** ").append(alert.getLevel()).append("\n\n");

        // 应用信息
        sb.append("**应用名称:** ").append(alert.getApplicationName()).append("\n\n");
        sb.append("**实例ID:** ").append(alert.getInstanceId()).append("\n\n");

        // 告警详情
        sb.append("**告警内容:** \n\n");
        sb.append("```\n");
        sb.append(alert.getDetail());
        sb.append("\n```\n\n");

        // 当前指标
        if (alert.getMetrics() != null) {
            sb.append("**当前指标:**\n\n");
            alert.getMetrics().forEach((key, value) -> {
                sb.append("- ").append(key).append(": ").append(value).append("\n");
            });
            sb.append("\n");
        }

        // 建议操作
        if (alert.getSuggestions() != null && !alert.getSuggestions().isEmpty()) {
            sb.append("**建议操作:**\n\n");
            alert.getSuggestions().forEach(suggestion -> {
                sb.append("1. ").append(suggestion).append("\n");
            });
            sb.append("\n");
        }

        // 时间戳
        sb.append("**告警时间:** ").append(DateUtils.getTime()).append("\n\n");

        // 快速操作链接
        sb.append("**快速操作:**\n\n");
        sb.append("[查看详情](").append(alert.getDetailUrl()).append(") | ");
        sb.append("[查看日志](").append(alert.getLogUrl()).append(")");

        return sb.toString();
    }

    private static String getEmoji(AlertLevel level) {
        return switch (level) {
            case P0 -> "🚨";  // 紧急
            case P1 -> "⚠️";  // 严重
            case P2 -> "⚡";  // 重要
            case P3 -> "ℹ️";  // 一般
            default -> "📝";
        };
    }
}
```

---

## 监控数据分析

### 1. 性能趋势分析

**收集历史数据:**

```java
@Service
@RequiredArgsConstructor
public class MetricsAnalyzer {

    private final MeterRegistry meterRegistry;
    private final MetricsRepository metricsRepository;

    /**
     * 定时收集性能指标
     */
    @Scheduled(fixedRate = 60000) // 每分钟执行
    public void collectMetrics() {
        MetricsSnapshot snapshot = new MetricsSnapshot();
        snapshot.setTimestamp(LocalDateTime.now());

        // JVM内存
        snapshot.setHeapUsed(getGaugeValue("jvm.memory.used", "area", "heap"));
        snapshot.setHeapMax(getGaugeValue("jvm.memory.max", "area", "heap"));

        // GC统计
        snapshot.setGcCount(getCounterValue("jvm.gc.pause"));
        snapshot.setGcTime(getTimerTotal("jvm.gc.pause"));

        // HTTP请求
        snapshot.setRequestCount(getCounterValue("http.server.requests"));
        snapshot.setAvgResponseTime(getTimerMean("http.server.requests"));

        // 数据库连接池
        snapshot.setActiveConnections(getGaugeValue("hikaricp.connections.active"));
        snapshot.setIdleConnections(getGaugeValue("hikaricp.connections.idle"));

        // 保存到数据库
        metricsRepository.save(snapshot);
    }

    /**
     * 分析性能趋势
     */
    public PerformanceTrend analyzeTrend(Duration duration) {
        LocalDateTime startTime = LocalDateTime.now().minus(duration);
        List<MetricsSnapshot> snapshots = metricsRepository
            .findByTimestampAfter(startTime);

        PerformanceTrend trend = new PerformanceTrend();

        // 计算平均值
        trend.setAvgHeapUsage(snapshots.stream()
            .mapToDouble(s -> s.getHeapUsed() * 100.0 / s.getHeapMax())
            .average()
            .orElse(0));

        // 计算峰值
        trend.setPeakHeapUsage(snapshots.stream()
            .mapToDouble(s -> s.getHeapUsed() * 100.0 / s.getHeapMax())
            .max()
            .orElse(0));

        // 响应时间趋势
        trend.setResponseTimeTrend(snapshots.stream()
            .collect(Collectors.groupingBy(
                s -> s.getTimestamp().truncatedTo(ChronoUnit.HOURS),
                Collectors.averagingDouble(MetricsSnapshot::getAvgResponseTime)
            )));

        return trend;
    }

    private double getGaugeValue(String name, String... tags) {
        Gauge gauge = meterRegistry.find(name).tags(tags).gauge();
        return gauge != null ? gauge.value() : 0;
    }

    private double getCounterValue(String name) {
        Counter counter = meterRegistry.find(name).counter();
        return counter != null ? counter.count() : 0;
    }

    private double getTimerMean(String name) {
        Timer timer = meterRegistry.find(name).timer();
        return timer != null ? timer.mean(TimeUnit.MILLISECONDS) : 0;
    }
}
```

### 2. 异常模式识别

**识别异常行为:**

```java
@Service
public class AnomalyDetector {

    /**
     * 使用移动平均和标准差检测异常
     */
    public boolean detectAnomaly(String metricName, double currentValue) {
        // 获取历史数据
        List<Double> history = getHistoricalValues(metricName, Duration.ofHours(24));

        if (history.size() < 10) {
            return false; // 数据不足
        }

        // 计算均值和标准差
        double mean = history.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0);

        double variance = history.stream()
            .mapToDouble(v -> Math.pow(v - mean, 2))
            .average()
            .orElse(0);

        double stdDev = Math.sqrt(variance);

        // 3-sigma规则: 超过3个标准差认为是异常
        double threshold = 3.0;
        boolean isAnomaly = Math.abs(currentValue - mean) > threshold * stdDev;

        if (isAnomaly) {
            log.warn("检测到异常: metric={}, current={}, mean={}, stdDev={}",
                metricName, currentValue, mean, stdDev);
        }

        return isAnomaly;
    }

    /**
     * 检测突增/突降
     */
    public boolean detectSpike(String metricName, double currentValue) {
        // 获取最近的值
        List<Double> recent = getHistoricalValues(metricName, Duration.ofMinutes(5));

        if (recent.isEmpty()) {
            return false;
        }

        double lastValue = recent.get(recent.size() - 1);
        double changeRate = Math.abs((currentValue - lastValue) / lastValue);

        // 变化率超过50%认为是突变
        return changeRate > 0.5;
    }
}
```

### 3. 容量规划

**基于监控数据的容量规划:**

```java
@Service
@RequiredArgsConstructor
public class CapacityPlanner {

    private final MetricsRepository metricsRepository;

    /**
     * 预测未来资源需求
     */
    public CapacityForecast forecast(Duration period) {
        // 获取历史数据
        LocalDateTime startTime = LocalDateTime.now().minus(Duration.ofDays(30));
        List<MetricsSnapshot> snapshots = metricsRepository
            .findByTimestampAfter(startTime);

        // 线性回归预测
        double[] time = new double[snapshots.size()];
        double[] memory = new double[snapshots.size()];

        for (int i = 0; i < snapshots.size(); i++) {
            time[i] = i;
            memory[i] = snapshots.get(i).getHeapUsed();
        }

        LinearRegression regression = new LinearRegression(time, memory);

        // 预测未来7天
        int futureDays = 7;
        double[] futureMemory = new double[futureDays];
        for (int i = 0; i < futureDays; i++) {
            futureMemory[i] = regression.predict(snapshots.size() + i * 24);
        }

        CapacityForecast forecast = new CapacityForecast();
        forecast.setCurrentUsage(snapshots.get(snapshots.size() - 1).getHeapUsed());
        forecast.setPredictedUsage(futureMemory);
        forecast.setGrowthRate(regression.slope());

        // 计算建议
        if (regression.slope() > 0) {
            long daysUntilFull = calculateDaysUntilFull(
                forecast.getCurrentUsage(),
                snapshots.get(0).getHeapMax(),
                regression.slope()
            );

            if (daysUntilFull < 30) {
                forecast.setRecommendation(
                    "建议在" + daysUntilFull + "天内扩容"
                );
            }
        }

        return forecast;
    }

    private long calculateDaysUntilFull(double current, double max, double growthRate) {
        if (growthRate <= 0) {
            return Long.MAX_VALUE;
        }
        return (long) ((max - current) / (growthRate * 24));
    }
}
```

---

## 监控集成实践

### 1. Docker容器监控

**Dockerfile健康检查:**

```dockerfile
FROM openjdk:21-jdk

# 添加应用
COPY target/ruoyi-admin.jar /app/app.jar

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:5500/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

**docker-compose监控配置:**

```yaml
services:
  app:
    image: ruoyi-plus:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5500/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### 2. Kubernetes监控

**K8s Probe配置:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ruoyi-plus
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: ruoyi-plus:latest
        ports:
        - containerPort: 5500

        # 存活探针
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 5500
          initialDelaySeconds: 60
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3

        # 就绪探针
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 5500
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3

        # 启动探针
        startupProbe:
          httpGet:
            path: /actuator/health
            port: 5500
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 30
```

**ServiceMonitor for Prometheus:**

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ruoyi-plus-monitor
spec:
  selector:
    matchLabels:
      app: ruoyi-plus
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 15s
```

### 3. 日志聚合

**Logstash集成:**

```yaml
# logback-spring.xml
<appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>localhost:5000</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <customFields>{"app_name":"ruoyi-plus"}</customFields>
    </encoder>
</appender>
```

**ELK Stack配置:**

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

---

## 故障诊断手册

### 1. 内存问题诊断

**问题: 内存持续增长**

**诊断步骤:**

```bash
# 1. 查看内存使用情况
curl http://localhost:5500/actuator/metrics/jvm.memory.used

# 2. 查看GC情况
curl http://localhost:5500/actuator/metrics/jvm.gc.pause

# 3. 下载堆转储
curl -O http://localhost:5500/actuator/heapdump

# 4. 使用MAT或JProfiler分析heapdump文件
```

**常见原因和解决方案:**

| 原因 | 症状 | 解决方案 |
|------|------|---------|
| 内存泄漏 | Old Gen持续增长 | 分析heapdump,找出泄漏对象 |
| 缓存过大 | 缓存占用大量内存 | 设置缓存过期时间和大小限制 |
| 大对象 | 频繁Full GC | 优化大对象使用,分批处理 |
| 线程泄漏 | 线程数持续增长 | 检查线程池配置,修复未关闭的线程 |

**监控脚本:**

```java
@Scheduled(fixedRate = 300000) // 每5分钟检查
public void checkMemoryLeak() {
    // 获取堆内存使用率
    double heapUsage = getHeapUsagePercentage();

    if (heapUsage > 85) {
        // 触发GC
        System.gc();

        // 等待GC完成
        Thread.sleep(5000);

        // 再次检查
        double newHeapUsage = getHeapUsagePercentage();

        if (newHeapUsage > 80) {
            // 可能存在内存泄漏
            log.error("疑似内存泄漏: GC后内存使用率仍为 {}%", newHeapUsage);

            // 生成堆转储
            generateHeapDump();

            // 发送告警
            sendAlert("内存泄漏告警", "堆内存使用率: " + newHeapUsage + "%");
        }
    }
}
```

### 2. CPU问题诊断

**问题: CPU使用率过高**

**诊断步骤:**

```bash
# 1. 查看线程转储
curl http://localhost:5500/actuator/threaddump > threaddump.txt

# 2. 找出占用CPU最高的线程
top -H -p <pid>

# 3. 转换线程ID为16进制
printf "%x\n" <thread-id>

# 4. 在线程转储中查找对应线程
grep -A 50 <hex-thread-id> threaddump.txt
```

**CPU使用率监控:**

```java
@Component
public class CpuMonitor {

    private final OperatingSystemMXBean osBean =
        ManagementFactory.getOperatingSystemMXBean();

    @Scheduled(fixedRate = 60000)
    public void monitorCpu() {
        if (osBean instanceof com.sun.management.OperatingSystemMXBean sunOsBean) {
            double cpuUsage = sunOsBean.getProcessCpuLoad() * 100;

            if (cpuUsage > 80) {
                log.warn("CPU使用率过高: {}%", cpuUsage);

                // 获取线程转储
                ThreadInfo[] threads = ManagementFactory.getThreadMXBean()
                    .dumpAllThreads(true, true);

                // 找出占用CPU最高的线程
                Arrays.stream(threads)
                    .sorted(Comparator.comparing(
                        t -> ManagementFactory.getThreadMXBean()
                            .getThreadCpuTime(t.getThreadId()))
                        .reversed())
                    .limit(5)
                    .forEach(thread -> {
                        log.warn("高CPU线程: {} - {}",
                            thread.getThreadName(),
                            thread.getThreadState());
                    });
            }
        }
    }
}
```

### 3. 数据库连接问题

**问题: 数据库连接池耗尽**

**监控连接池:**

```bash
# 查看活跃连接数
curl http://localhost:5500/actuator/metrics/hikaricp.connections.active

# 查看等待线程数
curl http://localhost:5500/actuator/metrics/hikaricp.connections.pending

# 查看连接超时次数
curl http://localhost:5500/actuator/metrics/hikaricp.connections.timeout
```

**连接池监控:**

```java
@Component
@RequiredArgsConstructor
public class ConnectionPoolMonitor {

    private final HikariDataSource dataSource;

    @Scheduled(fixedRate = 30000)
    public void monitorConnectionPool() {
        HikariPoolMXBean poolBean = dataSource.getHikariPoolMXBean();

        int activeConnections = poolBean.getActiveConnections();
        int idleConnections = poolBean.getIdleConnections();
        int totalConnections = poolBean.getTotalConnections();
        int threadsAwaitingConnection = poolBean.getThreadsAwaitingConnection();

        log.info("连接池状态: active={}, idle={}, total={}, waiting={}",
            activeConnections, idleConnections, totalConnections, threadsAwaitingConnection);

        // 检查告警条件
        if (threadsAwaitingConnection > 0) {
            log.warn("有 {} 个线程等待数据库连接", threadsAwaitingConnection);
        }

        double usage = (double) activeConnections / totalConnections * 100;
        if (usage > 90) {
            log.error("数据库连接池使用率过高: {}%", usage);
            sendAlert("连接池告警", "使用率: " + usage + "%");
        }
    }
}
```

---

## 监控最佳实践总结

### 1. 监控指标选择

**核心指标 (Golden Signals):**

1. **延迟 (Latency)** - 请求响应时间
   - P50, P95, P99分位值
   - 平均响应时间
   - 最大响应时间

2. **流量 (Traffic)** - 系统负载
   - QPS (每秒请求数)
   - 并发连接数
   - 网络带宽

3. **错误 (Errors)** - 错误率
   - HTTP 4xx/5xx错误率
   - 业务异常率
   - 系统错误数

4. **饱和度 (Saturation)** - 资源使用率
   - CPU使用率
   - 内存使用率
   - 磁盘IO
   - 网络IO

**业务指标:**

- 用户活跃数
- 订单数量
- 支付成功率
- 关键业务操作耗时

### 2. 监控告警原则

**DO (应该做的):**

- ✅ 为关键指标设置告警
- ✅ 使用多级告警机制
- ✅ 实施告警收敛避免告警风暴
- ✅ 提供告警处理手册
- ✅ 定期回顾和优化告警规则
- ✅ 告警消息包含足够的上下文信息
- ✅ 建立值班制度和升级机制

**DON'T (不应该做的):**

- ❌ 为所有指标设置告警(会产生噪音)
- ❌ 设置过于敏感的阈值(导致误报)
- ❌ 忽略告警(降低团队对告警的重视)
- ❌ 没有告警处理流程
- ❌ 告警信息不完整
- ❌ 告警通知所有人(应该分级分组)

### 3. 监控系统演进

**第一阶段: 基础监控**
- Spring Boot Admin
- Actuator健康检查
- 基本的邮件告警

**第二阶段: 完善监控**
- 集成Prometheus + Grafana
- 多渠道告警(钉钉、短信)
- 日志聚合(ELK)

**第三阶段: 智能监控**
- 分布式追踪(Zipkin/Skywalking)
- 异常检测和预测
- 自动化故障诊断
- APM性能监控

**第四阶段: 全链路可观测**
- Metrics + Logs + Traces三位一体
- 业务监控和技术监控融合
- AIOps智能运维

### 4. 监控数据保留

**数据分级保留策略:**

| 数据类型 | 采集频率 | 保留时间 | 降采样策略 |
|---------|---------|---------|-----------|
| 实时监控 | 15秒 | 24小时 | 无 |
| 小时级 | 1分钟 | 7天 | 5分钟平均值 |
| 天级 | 5分钟 | 30天 | 1小时平均值 |
| 月级 | 1小时 | 1年 | 1天平均值 |
| 年级 | 1天 | 永久 | 1周平均值 |

---

## 总结

系统监控是保障应用稳定运行的关键。通过本文档介绍的最佳实践:

1. **完整监控体系** - Spring Boot Admin + Actuator 全方位监控
2. **实时告警** - 邮件、钉钉等多渠道告警通知,支持告警分级和收敛
3. **日志追踪** - 操作日志和登录日志完整记录,集成ELK实现日志聚合
4. **性能分析** - JVM、HTTP、数据库等关键指标监控,支持趋势分析和容量规划
5. **安全加固** - 访问控制和认证保护,确保监控系统安全
6. **故障诊断** - 提供完整的故障诊断手册和自动化诊断工具
7. **容器化支持** - Docker和Kubernetes环境下的监控集成
8. **智能运维** - 异常检测、预测分析、自动化告警

建议在实际使用中:
- 建立完善的监控告警机制,做到"可观测"
- 定期检查监控数据和告警规则,持续优化
- 及时处理告警信息,建立值班和升级机制
- 定期分析性能数据优化系统,做好容量规划
- 构建监控知识库,积累故障处理经验
- 推进监控系统演进,逐步实现智能化运维
