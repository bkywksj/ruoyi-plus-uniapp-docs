# 监控管理 (monitor-admin)

## 1. 模块概述

### 1.1. 模块定位
`monitor-admin` 是一个基于 **Spring Boot Admin** 的独立应用监控中心。它作为 `ruoyi-plus-uniapp` 微服务体系中的核心组件，专用于提供集中化、可视化的服务监控和管理功能。该模块本身也是一个独立的 Spring Boot 应用，可以独立部署和运行。

### 1.2. 核心价值
- **集中视图**: 在统一的 UI 界面中展示所有已注册微服务的健康状态、基本信息和性能指标。
- **健康检查**: 实时监控服务实例的在线状态（UP）、离线（OFFLINE）、下线（DOWN）等，帮助快速发现和定位问题。
- **实时告警**: 当服务状态发生变更（如服务宕机或恢复）时，能够通过邮件、钉钉 Webhook 等多种渠道发送实时告警通知，确保运维团队第一时间响应。
- **深度洞察**: 深度集成 Spring Boot Actuator 端点，提供对应用内部的详细信息查看，如 JVM 指标、环境变量、日志文件、缓存、Spring Beans 等。
- **安全可靠**: 内置 Spring Security 提供企业级的安全认证，确保只有授权用户才能访问监控数据。

---

## 2. 核心功能

### 2.1. 应用实例监控
- **实例列表**: 实时展示所有注册到监控中心的服务实例。
- **状态显示**: 清晰展示每个实例的健康状态（UP, DOWN, OFFLINE, UNKNOWN）、实例数量、版本号、IP 地址和端口。
- **生命周期**: 记录并展示服务实例的生命周期事件，如注册、离线、上线等，方便追踪问题。

### 2.2. Actuator 端点集成
通过可视化的 UI 界面，方便地访问和操作客户端应用的 Actuator 端点，主要包括：
- `health`: 查看应用健康状况，包括磁盘空间、数据库连接、Redis 等。
- `metrics`: 查看详细的性能指标，如 JVM 内存使用、CPU 占用率、HTTP 请求统计、线程池状态等。
- `env`: 查看和搜索应用的所有环境属性，包括配置文件、系统属性、JVM 参数等。
- `logfile`: 在线查看和下载应用的日志文件，无需登录服务器。
- `beans`: 查看 Spring 容器中所有 Bean 的定义、依赖关系和作用域。
- `mappings`: 查看应用中所有的 HTTP 请求映射（@RequestMapping），包括路径、HTTP 方法和处理的 Controller 方法。
- `caches`: 查看和管理应用中的缓存（如 Caffeine, EhCache）。
- `heapdump`: 下载 JVM 堆转储快照，用于内存泄漏分析。
- `threaddump`: 下载 JVM 线程转储，用于分析线程死锁和性能瓶颈。

### 2.3. 安全认证
模块内置了基于 **Spring Security** 的安全机制 (`SecurityConfig.java`)。
- **强制认证**: 默认情况下，访问监控中心的所有页面（除了静态资源和登录页）都需要进行身份认证。
- **登录方式**: 支持基于表单的登录 (`formLogin`) 和 HTTP Basic 认证 (`httpBasic`)。
- **安全策略**: 禁用了 CSRF (Cross-Site Request Forgery) 保护，并允许页面被 `iframe` 嵌入，以适应常见的后台管理系统集成场景。

### 2.4. 实时事件告警
这是模块的核心定制功能，能够对服务实例的状态变更进行实时通知。
- **事件监听**: 通过自定义的 `CustomNotifier` 监听所有客户端实例的状态变化事件 (`InstanceStatusChangedEvent`)。
- **异步处理**: 收到事件后，通过 `@Async` 注解进行异步处理，避免阻塞主线程，确保监控性能。
- **多渠道通知**:
  - **邮件通知**: 当服务状态变更时，若配置启用，可自动发送格式化的 HTML 告警邮件给指定收件人。
  - **Webhook 通知**: 支持将告警信息通过 Webhook 推送到 **钉钉** 或其他兼容平台（如企业微信），实现更灵活的即时通讯。钉钉机器人支持“签名”和“关键词”两种安全设置。

---

## 3. 技术栈与依赖

### 3.1. 核心框架
- **Spring Boot**: 应用基础框架。
- **Spring Boot Admin Server**: 监控中心服务端核心。
- **Spring Security**: 提供安全认证。
- **Reactor**: `CustomNotifier` 基于 Reactor 模型处理事件流。

### 3.2. 主要依赖 (`pom.xml`)
- `de.codecentric:spring-boot-admin-starter-server`: Spring Boot Admin 服务端核心依赖。
- `de.codecentric:spring-boot-admin-starter-client`: 用于将监控中心自身也作为客户端注册，实现自我监控。
- `org.springframework.boot:spring-boot-starter-web`: 提供 Web 应用基础支持。
- `org.springframework.boot:spring-boot-starter-security`: Spring Security 框架，用于安全认证。
- `plus.ruoyi:ruoyi-common-mail`: 依赖内部邮件通用模块，提供邮件发送能力。
- `org.projectlombok:lombok`: 简化 Java 代码，如 `@Data`, `@Slf4j` 等。

---

## 4. 配置指南

配置文件位于 `src/main/resources/application.yml`。

### 4.1. `application.yml` 基础配置
```yaml
# 服务器基础配置
server:
  port: 9090 # 监控中心服务端口

# Spring 应用配置
spring:
  application:
    name: Spring Boot Admin # 应用名称
  security:
    user:
      name: @monitor.username@ # 登录监控中心的用户名 (支持Maven占位符)
      password: @monitor.password@ # 登录监控中心的密码 (支持Maven占位符)
  boot:
    admin:
      ui:
        title: Spring Boot Admin服务监控中心 # 监控中心界面标题
      context-path: /admin # 监控中心的访问路径, 如 /admin
```

### 4.2. `notify` 告警通知配置
这是自定义的通知配置，通过 `NotifyProperties.java` 类进行绑定。

```yaml
# 服务状态通知配置
notify:
  # 邮件通知配置
  mail:
    enabled: false # 是否启用邮件通知, true为启用
    to: xxxxxx@qq.com # 收件人邮箱地址, 多个用逗号隔开
    subject: admin监控通知 # 邮件主题
    # 邮件模板（HTML格式）
    # 占位符: {0}服务名, {1}实例ID, {2}状态中文名, {3}状态码, {4}服务URL, {5}时间
    template: "<html><body>...</body></html>"

  # Webhook通知配置（以钉钉为例）
  web-hook:
    enabled: true # 是否启用Webhook通知, true为启用
    # 认证类型:
    # '0': 无认证
    # '1': 签名认证(钉钉常用), 需配合 secret 使用
    # '2': 密码认证 (待实现)
    type: '1'
    secret: xxxxxx # 钉钉机器人安全设置中的“加签”密钥
    keywords: # 触发关键词, 某些机器人需要
    url: https://oapi.dingtalk.com/robot/send?access_token=xxxxxx # 钉钉机器人Webhook地址
    # 消息模板（Markdown格式）
    # 占位符: {0}标题, {1}服务名, {2}实例ID, {3}状态中文名, {4}状态码, {5}服务URL, {6}时间
    template: |
      #### **{}**
      - **服务名称**: {}
      - **实例编号**: {}
      ...
```

---

## 5. 实现原理剖析

### 5.1. 事件监听与发布
1.  **`CustomNotifier`**: 该类继承自 `AbstractEventNotifier`，是事件处理的入口。它通过 `doNotify` 方法专门监听 `InstanceStatusChangedEvent`（实例状态变更事件）。
2.  当监听到事件后，它会提取服务名、实例 ID、状态码（如 `UP`, `DOWN`）等关键信息。
3.  通过内部的 `getStatusName` 方法，将状态码转换为易于理解的中文描述（如 "服务上线", "服务下线"）。
4.  最后，它将这些信息封装成一个自定义的 `NotifierEvent` 对象，并通过 `SpringUtils.context().publishEvent()` 在 Spring 应用上下文中发布此内部事件。这一步是解耦的关键，将事件的产生和处理分离开。

### 5.2. 异步通知处理
1.  **`InfoNotifier`**: 这是一个事件监听服务，使用 `@EventListener` 注解来订阅 `NotifierEvent`。
2.  为了不阻塞主流程，所有监听方法都使用 `@Async` 注解，交由 `AdminServerConfig` 中配置的线程池异步执行。
3.  **`infoNotification`** 和 **`errNotification`** 方法分别监听 `NotifierEvent` 事件。目前两者逻辑相同，都会同时尝试发送 Webhook 和邮件通知。可以通过 `@EventListener` 的 `condition` 属性实现更精细的控制，例如只在服务下线时发送邮件：`@EventListener(condition = "#notifier.status == 'DOWN'")`。
4.  **`sendMail`**: 如果邮件通知在 `application.yml` 中被启用 (`notify.mail.enabled=true`)，该方法会格式化邮件模板，并调用 `ruoyi-common-mail` 模块的 `MailUtils.sendHtml` 发送 HTML 格式的邮件。
5.  **`sendWebHook`**: 如果 Webhook 通知被启用 (`notify.web-hook.enabled=true`)，该方法会调用 `sendWebHookMessage`。

### 5.3. Webhook 签名与发送
1.  **`sendWebHookMessage`**: 此方法负责构造并发送 Webhook 请求。
2.  它首先会根据配置的 `type`（认证类型）进行处理。对于钉钉的签名认证 (`type: '1'`)，它会调用 `generateSign` 方法。
3.  **`generateSign`**: 这是钉钉机器人签名算法的实现。它将当前时间戳和密钥（secret）拼接，使用 `HmacSHA256` 算法计算签名，并进行 Base64 和 URL 编码，最后将签名和时间戳拼接到 Webhook URL 的末尾。
4.  **消息构造**: 方法会构造一个符合钉钉/企业微信格式的 Markdown 消息体（JSON 格式）。
5.  **HTTP 发送**: 使用 `Hutool` 的 `HttpRequest` 工具发送 POST 请求，并将响应结果打印到日志中，方便调试。

### 5.4. 安全控制
- **`SecurityConfig`**: 这是 Spring Security 的核心配置类。
- 它通过 `HttpSecurity` 配置了一个安全过滤器链。
- `authorizeHttpRequests` 方法定义了 URL 的访问权限：允许对静态资源 (`/assets/**`) 和登录页面 (`/login`) 的匿名访问，而其他所有请求 (`anyRequest()`) 都必须经过认证 (`authenticated()`)。
- `formLogin` 配置了自定义的表单登录页面 (`/admin/login`) 和一个成功处理器，该处理器会在登录成功后跳转到用户之前访问的页面或监控中心首页。
- `csrf(AbstractHttpConfigurer::disable)` 禁用了 CSRF 保护，这在内部服务管理平台中是常见的做法，可以简化与非浏览器客户端的交互。

---

## 6. 部署与运行

### 6.1. 本地启动
- 在 IDE 中找到 `MonitorAdmin.java` 类。
- 直接运行其 `main` 方法即可启动。
- 启动后，控制台会打印访问地址。访问 `http://localhost:9090/admin` ，并使用 `application.yml` 中配置的用户名和密码登录。

---

## 7. 客户端接入指南

对于任何需要被监控的 Spring Boot 微服务，请遵循以下步骤接入：

### 7.1. 引入依赖
在客户端项目的 `pom.xml` 中，添加 `spring-boot-admin-starter-client` 依赖。

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
</dependency>
```

### 7.2. 配置客户端
在客户端的 `application.yml` 文件中，添加以下配置：

```yaml
spring:
  boot:
    admin:
      client:
        # 监控中心地址
        url: http://localhost:9090/admin
        instance:
          # 服务主机类型，建议使用IP，避免因hostname解析问题导致注册失败
          service-host-type: IP
          metadata:
            # 客户端认证用户名，需与监控中心配置的 spring.security.user.name 一致
            username: ${spring.boot.admin.client.username}
            userpassword: ${spring.boot.admin.client.password}
        # 客户端连接监控中心的用户名和密码
        username: @monitor.username@ # 此处应填写监控中心 spring.security.user.name 的值
        password: @monitor.password@ # 此处应填写监控中心 spring.security.user.password 的值

# 为了让监控中心能获取到所有信息，需要暴露所有监控端点
management:
  endpoints:
    web:
      exposure:
        include: '*' # 暴露所有端点, 如需安全控制可改为 'health,info'
  endpoint:
    health:
      # 健康检查默认只显示基本信息，配置为ALWAYS可以显示详细信息（如数据库、Redis等）
      show-details: ALWAYS
```
完成以上配置后，启动客户端应用，它将自动注册到 `monitor-admin` 监控中心。您可以在监控中心的 UI 界面上看到该服务实例。
