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

## 总结

系统监控是保障应用稳定运行的关键。通过本文档介绍的最佳实践:

1. **完整监控体系** - Spring Boot Admin + Actuator 全方位监控
2. **实时告警** - 邮件、钉钉等多渠道告警通知
3. **日志追踪** - 操作日志和登录日志完整记录
4. **性能分析** - JVM、HTTP、数据库等关键指标监控
5. **安全加固** - 访问控制和认证保护

建议在实际使用中:
- 建立完善的监控告警机制
- 定期检查监控数据和告警规则
- 及时处理告警信息
- 定期分析性能数据优化系统
