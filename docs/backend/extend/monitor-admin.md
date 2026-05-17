# Spring Boot Admin 监控中心

基于 Spring Boot Admin 的应用监控中心 - 提供集中化、可视化的服务监控与告警能力

## 模块简介

`ruoyi-monitor-admin` 是 RuoYi-Plus 框架的应用监控中心模块，基于 Spring Boot Admin 构建。该模块作为独立服务部署，提供统一的服务监控、健康检查和告警通知功能，是微服务架构中的核心运维组件。

### 核心特性

- **集中监控**: 在统一的 Web UI 界面中展示所有已注册服务的健康状态、性能指标和运行信息
- **健康检查**: 实时监控服务实例的在线状态（UP、DOWN、OFFLINE），快速发现和定位问题
- **实时告警**: 服务状态变更时自动发送通知，支持邮件和钉钉 Webhook 两种渠道
- **深度洞察**: 集成 Spring Boot Actuator，提供 JVM 指标、环境变量、日志文件、缓存等详细信息
- **安全可靠**: 内置 Spring Security 认证机制，确保监控数据的访问安全
- **自我监控**: 支持将自身注册为客户端，实现监控中心的自我监控

::: warning 重要说明
本模块是独立的监控服务端，需要单独部署。业务应用作为客户端注册到此服务端。
:::

## 模块架构

### 整体架构图

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Spring Boot Admin 监控中心架构                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Web UI 层                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │  │  应用列表   │  │  实例详情   │  │  日志查看   │  │  指标监控  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Monitor Admin Server (端口 9090)                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │                       核心组件                                   │ │  │
│  │  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │ │  │
│  │  │  │ MonitorAdmin   │  │ SecurityConfig │  │ CustomNotifier │    │ │  │
│  │  │  │ (启动入口)     │  │ (安全配置)     │  │ (事件监听)     │    │ │  │
│  │  │  └────────────────┘  └────────────────┘  └────────────────┘    │ │  │
│  │  │                                                                 │ │  │
│  │  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │ │  │
│  │  │  │ InfoNotifier   │  │ NotifyProps    │  │ NotifierEvent  │    │ │  │
│  │  │  │ (通知服务)     │  │ (配置属性)     │  │ (通知事件)     │    │ │  │
│  │  │  └────────────────┘  └────────────────┘  └────────────────┘    │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                               │                                      │  │
│  │              ┌────────────────┴────────────────┐                    │  │
│  │              │          通知渠道               │                    │  │
│  │              │  ┌──────────┐  ┌──────────┐    │                    │  │
│  │              │  │  邮件    │  │  钉钉    │    │                    │  │
│  │              │  │ (SMTP)   │  │(Webhook) │    │                    │  │
│  │              │  └──────────┘  └──────────┘    │                    │  │
│  │              └─────────────────────────────────┘                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    ▲                                        │
│              ┌─────────────────────┼─────────────────────┐                 │
│              │                     │                     │                 │
│              │                     │                     │                 │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐      │
│  │   ruoyi-admin     │  │  snailjob-server  │  │   其他服务        │      │
│  │   (主应用)        │  │  (任务调度)       │  │                   │      │
│  │                   │  │                   │  │                   │      │
│  │  ┌─────────────┐  │  │  ┌─────────────┐  │  │  ┌─────────────┐  │      │
│  │  │  Actuator   │  │  │  │  Actuator   │  │  │  │  Actuator   │  │      │
│  │  │  Endpoints  │  │  │  │  Endpoints  │  │  │  │  Endpoints  │  │      │
│  │  └─────────────┘  │  │  └─────────────┘  │  │  └─────────────┘  │      │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 核心组件说明

| 组件 | 文件 | 说明 |
|------|------|------|
| `MonitorAdmin` | MonitorAdmin.java | 服务端启动入口类，启用 Admin Server |
| `SecurityConfig` | SecurityConfig.java | Spring Security 安全配置，定义认证规则 |
| `CustomNotifier` | CustomNotifier.java | 事件监听器，捕获服务状态变更事件 |
| `InfoNotifier` | InfoNotifier.java | 通知服务，处理邮件和 Webhook 发送 |
| `NotifyProperties` | NotifyProperties.java | 通知配置属性类，绑定配置文件 |
| `NotifierEvent` | NotifierEvent.java | 通知事件对象，封装状态变更信息 |

### 端口说明

| 端口 | 用途 | 说明 |
|------|------|------|
| 9090 | Web 服务端口 | 访问监控后台 UI |

## 快速部署

### 环境要求

- **JDK**: 17+
- **Maven**: 3.8+
- **邮件服务器**: （可选）用于邮件告警
- **钉钉机器人**: （可选）用于 Webhook 告警

### 1. 修改配置文件

编辑 `application.yml` 配置认证信息：

```yaml
# 服务器基础配置
server:
  port: 9090                          # 监控中心服务端口

# Spring 应用配置
spring:
  application:
    name: Spring Boot Admin           # 应用名称
  security:
    user:
      name: ruoyi                      # 监控中心登录用户名
      password: "123456"               # 监控中心登录密码
  boot:
    admin:
      ui:
        title: Spring Boot Admin服务监控中心  # 界面标题
      context-path: /admin             # 监控中心访问路径
```

### 2. 启动服务

**方式一：IDE 启动**

运行 `plus.ruoyi.monitor.admin.MonitorAdmin` 类的 `main` 方法。

**方式二：Maven 命令启动**

```bash
# 进入模块目录
cd ruoyi-extend/ruoyi-monitor-admin

# 编译打包
mvn clean package -DskipTests

# 运行
java -jar target/ruoyi-monitor-admin.jar --spring.profiles.active=dev
```

启动成功后会显示：

```text
(✨◠‿◠)ﾉ♪♫ Spring Boot Admin 启动成功！环境: [dev] 地址: http://127.0.0.1:9090/admin
```

### 3. 访问管理后台

- **地址**: http://127.0.0.1:9090/admin
- **默认账号**: ruoyi
- **默认密码**: 123456

## Docker 部署

### Dockerfile 说明

项目提供了优化的 Dockerfile，使用 Liberica OpenJDK 17 作为基础镜像：

```dockerfile
# 使用贝尔实验室 OpenJDK 17 镜像（支持 CDS 加速启动）
FROM bellsoft/liberica-openjdk-rocky:17-cds

LABEL maintainer="抓蛙师"

# 创建目录结构
RUN mkdir -p /ruoyi/monitor/logs

WORKDIR /ruoyi/monitor

# 设置环境变量
ENV SERVER_PORT=9090 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    JAVA_OPTS="-Xms256m -Xmx512m" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=Asia/Shanghai

# 暴露端口
EXPOSE ${SERVER_PORT}

# 复制应用
COPY ./target/ruoyi-monitor-admin.jar /ruoyi/monitor/app.jar

# 启动命令
ENTRYPOINT ["sh", "-c", "cd /ruoyi/monitor && exec java \
    -Dserver.port=${SERVER_PORT} \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} \
    -Duser.timezone=${TZ} \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/ruoyi/monitor/logs/ \
    -XX:+UseZGC \
    ${JAVA_OPTS} \
    -jar /ruoyi/monitor/app.jar"]
```

### 构建 Docker 镜像

```bash
# 进入模块目录
cd ruoyi-extend/ruoyi-monitor-admin

# 编译打包
mvn clean package -DskipTests

# 构建镜像
docker build -t ruoyi-monitor-admin:latest .
```

### Docker Compose 部署

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  # Spring Boot Admin 监控中心
  monitor-admin:
    image: ruoyi-monitor-admin:latest
    container_name: monitor-admin
    environment:
      # 服务配置
      SERVER_PORT: 9090
      SPRING_PROFILES_ACTIVE: prod
      # 认证配置
      MONITOR_USERNAME: ruoyi
      MONITOR_PASSWORD: "123456"
      MONITOR_TITLE: "生产环境监控中心"
      # 自监控配置
      MONITOR_SELF_ENABLED: "true"
      MONITOR_URL: http://monitor-admin:9090/admin
      # JVM 配置
      JAVA_OPTS: "-Xms256m -Xmx512m"
      # 邮件通知配置（可选）
      NOTIFY_MAIL_ENABLED: "false"
      NOTIFY_MAIL_TO: admin@example.com
      # 钉钉通知配置（可选）
      NOTIFY_WEBHOOK_ENABLED: "false"
      DINGTALK_SECRET: ""
      DINGTALK_WEBHOOK_URL: ""
    ports:
      - "9090:9090"
    volumes:
      - monitor_logs:/ruoyi/monitor/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9090/admin/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  monitor_logs:
```

**启动服务**

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f monitor-admin

# 停止服务
docker-compose down
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SERVER_PORT` | Web 服务端口 | 9090 |
| `MONITOR_USERNAME` | 登录用户名 | ruoyi |
| `MONITOR_PASSWORD` | 登录密码 | 123456 |
| `MONITOR_TITLE` | 界面标题 | Spring Boot Admin服务监控中心 |
| `MONITOR_SELF_ENABLED` | 是否启用自监控 | true |
| `MONITOR_URL` | 监控中心地址（自监控用） | http://127.0.0.1:9090/admin |
| `SPRING_PROFILES_ACTIVE` | 激活的配置环境 | prod |
| `JAVA_OPTS` | JVM 参数 | -Xms256m -Xmx512m |
| `NOTIFY_MAIL_ENABLED` | 是否启用邮件通知 | false |
| `NOTIFY_MAIL_TO` | 邮件收件人 | - |
| `NOTIFY_WEBHOOK_ENABLED` | 是否启用 Webhook 通知 | false |
| `DINGTALK_SECRET` | 钉钉机器人密钥 | - |
| `DINGTALK_WEBHOOK_URL` | 钉钉 Webhook 地址 | - |

## 核心功能详解

### 应用实例监控

监控中心提供完整的服务实例生命周期监控：

**实例状态说明**

| 状态码 | 中文描述 | 说明 |
|--------|----------|------|
| `UP` | 服务上线 | 服务正常运行 |
| `DOWN` | 服务下线 | 服务异常停止 |
| `OFFLINE` | 服务离线 | 服务主动下线 |
| `OUT_OF_SERVICE` | 停止服务状态 | 服务被标记为停止 |
| `RESTRICTED` | 服务受限 | 服务部分功能受限 |
| `UNKNOWN` | 服务未知异常 | 无法确定服务状态 |

**状态转换逻辑**

```java
private String getStatusName(String status) {
    return switch (status) {
        case STATUS_UP -> "服务上线";
        case STATUS_OFFLINE -> "服务离线";
        case STATUS_RESTRICTED -> "服务受限";
        case STATUS_OUT_OF_SERVICE -> "停止服务状态";
        case STATUS_DOWN -> "服务下线";
        case STATUS_UNKNOWN -> "服务未知异常";
        default -> "未知状态";
    };
}
```

### Actuator 端点集成

通过可视化界面访问客户端应用的 Actuator 端点：

| 端点 | 功能 | 说明 |
|------|------|------|
| `health` | 健康检查 | 查看磁盘空间、数据库、Redis 等健康状态 |
| `metrics` | 性能指标 | JVM 内存、CPU、HTTP 请求统计、线程池状态 |
| `env` | 环境属性 | 配置文件、系统属性、JVM 参数 |
| `logfile` | 日志文件 | 在线查看和下载应用日志 |
| `beans` | Bean 列表 | Spring 容器中所有 Bean 的定义和依赖 |
| `mappings` | 请求映射 | 所有 HTTP 请求映射（@RequestMapping） |
| `caches` | 缓存管理 | 查看和管理应用缓存 |
| `heapdump` | 堆转储 | 下载 JVM 堆转储快照 |
| `threaddump` | 线程转储 | 下载 JVM 线程转储 |
| `scheduledtasks` | 定时任务 | 查看已注册的定时任务 |

### 安全认证机制

监控中心使用 Spring Security 提供企业级安全认证：

```java
@EnableWebSecurity
@Configuration
public class SecurityConfig {

    private final String adminContextPath;

    public SecurityConfig(AdminServerProperties adminServerProperties) {
        this.adminContextPath = adminServerProperties.getContextPath();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        SavedRequestAwareAuthenticationSuccessHandler successHandler =
            new SavedRequestAwareAuthenticationSuccessHandler();
        successHandler.setTargetUrlParameter("redirectTo");
        successHandler.setDefaultTargetUrl(adminContextPath + "/");

        PathPatternRequestMatcher.Builder mvc = PathPatternRequestMatcher.withDefaults();

        return httpSecurity
            // 禁用 X-Frame-Options，允许页面嵌入 iframe
            .headers((header) ->
                header.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            // 配置请求授权规则
            .authorizeHttpRequests((authorize) ->
                authorize.requestMatchers(
                        mvc.matcher(adminContextPath + "/assets/**"),
                        mvc.matcher(adminContextPath + "/login")
                    ).permitAll()
                    .anyRequest().authenticated())
            // 配置表单登录
            .formLogin((formLogin) ->
                formLogin.loginPage(adminContextPath + "/login")
                    .successHandler(successHandler))
            // 配置登出
            .logout((logout) ->
                logout.logoutUrl(adminContextPath + "/logout"))
            // 启用 HTTP Basic 认证
            .httpBasic(Customizer.withDefaults())
            // 禁用 CSRF 保护
            .csrf(AbstractHttpConfigurer::disable)
            .build();
    }
}
```

**安全策略说明**

| 策略 | 配置 | 说明 |
|------|------|------|
| 静态资源 | `/admin/assets/**` | 允许匿名访问 |
| 登录页面 | `/admin/login` | 允许匿名访问 |
| 其他请求 | `anyRequest()` | 需要认证 |
| CSRF | 禁用 | 简化 API 交互 |
| X-Frame-Options | 禁用 | 允许 iframe 嵌入 |

## 告警通知配置

### 邮件通知

配置邮件告警，当服务状态变更时发送通知邮件：

```yaml
notify:
  mail:
    enabled: true                      # 启用邮件通知
    to: admin@example.com              # 收件人邮箱
    subject: admin监控通知              # 邮件主题
    # 邮件模板（HTML格式）
    # 占位符：{0}服务名 {1}实例ID {2}状态名 {3}状态码 {4}服务URL {5}时间
    template: |
      <html>
      <body>
        <h2>服务状态变更通知</h2>
        <p><b>服务名称:</b> {}</p>
        <p><b>实例编号:</b> {}</p>
        <p><b>服务状态:</b> {}({})</p>
        <p><b>服务地址:</b> {}</p>
        <p><b>发送时间:</b> {}</p>
      </body>
      </html>
```

**邮件通知流程**

```java
public void sendMail(NotifierEvent notifier) {
    NotifyProperties.Mail mail = notifyProperties.getMail();
    if (!mail.getEnabled()) {
        return;
    }

    // 格式化邮件内容
    String message = StringUtils.format(mail.getTemplate(),
        notifier.getRegisterName(),
        notifier.getInstanceId(),
        notifier.getStatusName(),
        notifier.getStatus(),
        notifier.getServiceUrl(),
        DateUtils.getTime());

    try {
        if (StringUtils.isBlank(mail.getTo())) {
            log.error("请设置收件人");
            return;
        }

        // 发送HTML格式邮件
        MailUtils.sendHtml(mail.getTo(),
            notifier.getRegisterName() + notifier.getStatusName(),
            message);
        log.info("邮件已发送至: {}", mail.getTo());
    } catch (Exception e) {
        log.error("邮件发送失败: ", e);
    }
}
```

### 钉钉 Webhook 通知

配置钉钉机器人告警，实时推送服务状态变更：

```yaml
notify:
  web-hook:
    enabled: true                      # 启用 Webhook 通知
    type: "1"                          # 认证类型：1-签名认证
    secret: "SEC..."                   # 钉钉机器人签名密钥
    keywords: ""                       # 关键词（可选）
    url: https://oapi.dingtalk.com/robot/send?access_token=xxx
    # 消息模板（Markdown格式）
    # 占位符：{0}标题 {1}服务名 {2}实例ID {3}状态名 {4}状态码 {5}服务URL {6}时间
    template: |
      #### **{}**
      - **服务名称**: {}
      - **实例编号**: {}
      - **服务状态**: {}({})
      - **服务地址**: {}
      - **发送时间**: {}
```

**认证类型说明**

| 类型 | 值 | 说明 |
|------|---|------|
| 无认证 | 0 | 不进行任何认证 |
| 签名认证 | 1 | 钉钉机器人签名认证（推荐） |
| 密码认证 | 2 | 密码认证（待实现） |

**签名算法实现**

```java
private String generateSign(String secret) {
    Long timestamp = System.currentTimeMillis();
    String stringToSign = timestamp + "\n" + secret;
    String sign;

    try {
        // 使用 HmacSHA256 算法生成签名
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(
            secret.getBytes(StandardCharsets.UTF_8),
            "HmacSHA256"));
        byte[] signData = mac.doFinal(
            stringToSign.getBytes(StandardCharsets.UTF_8));
        sign = URLEncodeUtil.encode(
            Base64.encode(signData),
            StandardCharsets.UTF_8);
    } catch (NoSuchAlgorithmException | InvalidKeyException e) {
        throw new RuntimeException("签名生成失败", e);
    }

    return StringUtils.format("&timestamp={}&sign={}", timestamp, sign);
}
```

### 事件处理机制

监控中心使用异步事件驱动架构处理通知：

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Instance Event  │───▶│ CustomNotifier  │───▶│ NotifierEvent   │
│ (状态变更)      │    │ (事件监听)      │    │ (内部事件)      │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Spring Context  │
                                              │ publishEvent()  │
                                              └────────┬────────┘
                                                       │
                              ┌────────────────────────┼────────────────────────┐
                              │                        │                        │
                              ▼                        ▼                        ▼
                    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
                    │ infoNotification│      │ errNotification │      │ 其他监听器      │
                    │ (Webhook通知)   │      │ (邮件通知)      │      │                 │
                    │ @Async          │      │ @Async          │      │                 │
                    └─────────────────┘      └─────────────────┘      └─────────────────┘
```

**异步处理配置**

```java
@Async
@EventListener
public void infoNotification(NotifierEvent notifier) {
    sendWebHook(notifier);
}

@Async
@EventListener
public void errNotification(NotifierEvent notifier) {
    sendMail(notifier);
}
```

## 客户端接入指南

### 添加依赖

在需要被监控的服务模块 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
</dependency>
```

### 配置客户端

在客户端的 `application.yml` 中添加配置：

```yaml
spring:
  boot:
    admin:
      client:
        # 监控中心地址
        url: http://localhost:9090/admin
        instance:
          # 服务主机类型，建议使用 IP
          service-host-type: IP
          metadata:
            # 客户端认证信息
            username: ${spring.boot.admin.client.username}
            userpassword: ${spring.boot.admin.client.password}
        # 客户端认证用户名和密码
        username: ruoyi
        password: "123456"

# 暴露 Actuator 端点
management:
  endpoints:
    web:
      exposure:
        include: '*'                   # 暴露所有端点
  endpoint:
    health:
      show-details: ALWAYS             # 显示健康检查详细信息
```

### Actuator 端点安全配置

如果客户端的 Actuator 端点需要认证，需要在 metadata 中配置认证信息：

```yaml
spring:
  boot:
    admin:
      client:
        instance:
          metadata:
            # 这些信息会被监控中心用于访问客户端的 Actuator 端点
            username: actuator-user
            userpassword: actuator-password
```

## 日志配置

### Logback 配置

监控中心使用自定义的 Logback 配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration debug="false" scan="true" scanPeriod="1 seconds">

    <contextName>logback</contextName>
    <!-- 从 Spring 配置读取日志路径 -->
    <springProperty scope="context" name="log.path"
                    source="logging.file.path"
                    defaultValue="./logs/ruoyi-monitor-admin"/>

    <property name="console.log.pattern"
              value="%cyan(%d{yyyy-MM-dd HH:mm:ss}) %green([%thread])
                     %highlight(%-5level) %boldMagenta(%logger{36}%n) - %msg%n"/>
    <property name="log.pattern"
              value="%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"/>

    <!-- 控制台输出 -->
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${console.log.pattern}</pattern>
            <charset>utf-8</charset>
        </encoder>
    </appender>

    <!-- 开发环境配置 -->
    <springProfile name="dev">
        <root level="info">
            <appender-ref ref="console"/>
        </root>
    </springProfile>

    <!-- 生产环境配置 -->
    <springProfile name="prod">
        <!-- 文件输出 -->
        <appender name="file" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>${log.path}.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>${log.path}.%d{yyyy-MM-dd}.log</fileNamePattern>
                <maxHistory>60</maxHistory>
            </rollingPolicy>
            <encoder>
                <pattern>${log.pattern}</pattern>
            </encoder>
        </appender>

        <root level="info">
            <appender-ref ref="console"/>
            <appender-ref ref="file"/>
        </root>
    </springProfile>

</configuration>
```

**日志文件位置**

| 环境 | 日志输出 | 说明 |
|------|----------|------|
| 开发环境 | 控制台 | 彩色日志输出 |
| 生产环境 | 控制台 + 文件 | 日志保留 60 天 |

## 最佳实践

### 1. 认证安全配置

**使用强密码**

```yaml
spring:
  security:
    user:
      name: admin                      # 避免使用默认用户名
      password: "${MONITOR_PASSWORD}"  # 使用环境变量注入密码
```

**生产环境配置**

```yaml
# 不要在配置文件中硬编码密码
spring:
  security:
    user:
      name: ${MONITOR_USERNAME:admin}
      password: ${MONITOR_PASSWORD}    # 必须通过环境变量提供
```

### 2. 告警策略配置

**按状态过滤通知**

可以通过 `@EventListener` 的 `condition` 属性实现精细化告警：

```java
// 只在服务下线时发送邮件
@Async
@EventListener(condition = "#notifier.status == 'DOWN'")
public void onServiceDown(NotifierEvent notifier) {
    sendMail(notifier);
}

// 只在服务上线时发送 Webhook
@Async
@EventListener(condition = "#notifier.status == 'UP'")
public void onServiceUp(NotifierEvent notifier) {
    sendWebHook(notifier);
}
```

### 3. 高可用部署

**多实例部署**

```yaml
# 实例 1
server:
  port: 9090

# 实例 2
server:
  port: 9091
```

**Nginx 负载均衡**

```nginx
upstream monitor-admin {
    server 192.168.1.101:9090 weight=1;
    server 192.168.1.102:9091 weight=1;
}

server {
    listen 80;
    server_name monitor.example.com;

    location /admin {
        proxy_pass http://monitor-admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 性能优化

**JVM 参数配置**

```bash
# 监控中心资源消耗较低，可以使用较小的堆内存
JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseZGC"
```

## 故障排查

### 1. 客户端无法注册

**错误现象**

```text
Failed to register with Admin Server
Connection refused: localhost:9090
```

**排查步骤**

1. 检查监控中心是否启动
2. 检查客户端配置的监控中心地址是否正确
3. 检查网络连通性
4. 检查认证信息是否正确

**解决方案**

```bash
# 检查监控中心进程
ps aux | grep monitor-admin

# 检查端口监听
netstat -tlnp | grep 9090

# 测试连通性
curl -u ruoyi:123456 http://localhost:9090/admin/actuator/health
```

### 2. 邮件发送失败

**错误现象**

```text
邮件发送失败: Could not connect to SMTP host
```

**排查步骤**

1. 检查邮件服务器配置
2. 检查 SMTP 端口是否可达
3. 检查认证信息是否正确

**解决方案**

确保 `ruoyi-common-mail` 模块配置正确：

```yaml
spring:
  mail:
    host: smtp.example.com
    port: 465
    username: your-email@example.com
    password: your-password
    properties:
      mail:
        smtp:
          ssl:
            enable: true
```

### 3. Webhook 发送失败

**错误现象**

```text
WebHook消息发送失败: errcode=310000, errmsg=sign not match
```

**排查步骤**

1. 检查签名密钥是否正确
2. 检查服务器时间是否同步
3. 检查 Webhook URL 是否正确

**解决方案**

```bash
# 同步服务器时间
ntpdate ntp.aliyun.com

# 检查密钥配置
echo $DINGTALK_SECRET
```

## 技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.5.12 | 应用基础框架 |
| Spring Boot Admin | 3.4.x | 监控中心核心 |
| Spring Security | 6.x | 安全认证框架 |
| Hutool | 5.8.40 | 工具类库 |
| Lombok | 1.18.x | 代码简化工具 |
| Logback | 1.5.x | 日志框架 |

## 常见问题

### Q1: 如何修改监控中心的登录密码？

通过环境变量或配置文件修改：

```yaml
spring:
  security:
    user:
      password: "new-password"
```

或使用环境变量：

```bash
export MONITOR_PASSWORD="new-password"
```

### Q2: 如何配置多个邮件收件人？

在配置中使用逗号分隔多个邮箱地址：

```yaml
notify:
  mail:
    to: admin1@example.com,admin2@example.com
```

### Q3: 如何只监控特定状态的变更？

使用 `@EventListener` 的 `condition` 属性：

```java
@EventListener(condition = "#notifier.status == 'DOWN' or #notifier.status == 'OFFLINE'")
public void onServiceUnavailable(NotifierEvent notifier) {
    // 只处理服务不可用的情况
}
```

### Q4: 如何禁用自监控功能？

设置环境变量：

```yaml
spring.boot.admin.client:
  enabled: false
```

或：

```bash
export MONITOR_SELF_ENABLED=false
```

### Q5: 如何查看客户端的详细健康信息？

确保客户端配置了：

```yaml
management:
  endpoint:
    health:
      show-details: ALWAYS
```

### Q6: 监控中心占用多少内存？

监控中心资源消耗较低，推荐配置：

| 环境 | 堆内存 | 说明 |
|------|--------|------|
| 开发环境 | 256MB | 监控少量服务 |
| 生产环境 | 512MB | 监控 10-50 个服务实例 |
| 大规模 | 1GB | 监控 100+ 个服务实例 |

```bash
# 生产环境推荐配置
JAVA_OPTS="-Xms512m -Xmx512m -XX:+UseZGC -XX:+ZGenerational"
```

### Q7: 如何实现告警静默期？

可以在通知服务中添加静默期逻辑，避免频繁告警：

```java
private final Map<String, Long> lastNotifyTime = new ConcurrentHashMap<>();
private static final long SILENT_PERIOD = 5 * 60 * 1000; // 5分钟静默期

public boolean shouldNotify(String instanceId) {
    Long lastTime = lastNotifyTime.get(instanceId);
    long currentTime = System.currentTimeMillis();

    if (lastTime == null || currentTime - lastTime > SILENT_PERIOD) {
        lastNotifyTime.put(instanceId, currentTime);
        return true;
    }
    return false;
}
```

## 监控指标说明

### JVM 指标

监控中心可以展示客户端的 JVM 运行指标：

| 指标 | 说明 | 单位 |
|------|------|------|
| `jvm.memory.used` | 已使用堆内存 | bytes |
| `jvm.memory.max` | 最大堆内存 | bytes |
| `jvm.gc.pause` | GC 暂停时间 | ms |
| `jvm.threads.live` | 活跃线程数 | count |
| `jvm.classes.loaded` | 已加载类数量 | count |

### HTTP 请求指标

| 指标 | 说明 | 单位 |
|------|------|------|
| `http.server.requests.count` | 请求总数 | count |
| `http.server.requests.duration` | 请求耗时 | ms |
| `http.server.requests.error` | 错误请求数 | count |

### 系统指标

| 指标 | 说明 | 单位 |
|------|------|------|
| `system.cpu.usage` | CPU 使用率 | 0-1 |
| `system.load.average.1m` | 1分钟负载 | - |
| `disk.free` | 磁盘可用空间 | bytes |

## 自定义扩展

### 自定义通知渠道

可以扩展 `InfoNotifier` 类添加新的通知渠道：

```java
@Async
@EventListener
public void sendSlackNotification(NotifierEvent notifier) {
    // 发送 Slack 通知
    String message = buildSlackMessage(notifier);
    slackClient.send(message);
}

@Async
@EventListener
public void sendSmsNotification(NotifierEvent notifier) {
    // 发送短信通知（仅限严重告警）
    if ("DOWN".equals(notifier.getStatus())) {
        smsService.send(notifier.getRegisterName() + " 服务下线");
    }
}
```

### 自定义健康检查

可以添加自定义的健康检查指标：

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        // 自定义健康检查逻辑
        boolean isHealthy = checkExternalDependency();

        if (isHealthy) {
            return Health.up()
                .withDetail("external-service", "available")
                .build();
        }
        return Health.down()
            .withDetail("external-service", "unavailable")
            .build();
    }
}
```
