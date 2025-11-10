# 扩展开发指南

## 介绍

RuoYi-Plus-UniApp 扩展模块(`ruoyi-extend`)提供了系统核心功能之外的独立服务组件,采用模块化设计,支持按需部署和扩展。扩展模块与主应用解耦,可以独立运行、独立部署,为系统提供应用监控、任务调度等企业级功能。

**核心特性:**

- **独立部署** - 扩展模块可作为独立的 Spring Boot 应用运行,不依赖主应用
- **模块化设计** - 每个扩展模块都是独立的 Maven 子模块,职责单一清晰
- **松耦合架构** - 通过标准化接口和配置实现与主应用的松耦合集成
- **开箱即用** - 提供完整的配置和启动类,简化部署和使用流程
- **可扩展性强** - 遵循 Spring Boot 规范,支持自定义扩展和二次开发
- **企业级功能** - 集成 Spring Boot Admin、SnailJob 等成熟的开源组件

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/pom.xml:14-24

## 扩展模块概览

### 模块列表

RuoYi-Plus-UniApp 当前提供两个核心扩展模块:

| 模块名称 | Artifact ID | 端口 | 功能描述 |
|---------|-------------|------|---------|
| 应用监控服务 | `ruoyi-monitor-admin` | 9090 | 基于 Spring Boot Admin 的应用监控中心 |
| 任务调度服务 | `ruoyi-snailjob-server` | 8800 | 基于 SnailJob 的分布式任务调度中心 |

### 目录结构

```
ruoyi-extend/                           # 扩展模块根目录
├── pom.xml                             # 父级 POM 配置
├── ruoyi-monitor-admin/                # 应用监控服务
│   ├── pom.xml                         # Monitor Admin Maven 配置
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── plus/ruoyi/monitor/admin/
│   │   │   │       ├── MonitorAdmin.java           # 启动类
│   │   │   │       ├── config/
│   │   │   │       │   └── SecurityConfig.java     # 安全配置
│   │   │   │       ├── event/
│   │   │   │       │   └── NotifierEvent.java      # 通知事件
│   │   │   │       ├── notifier/
│   │   │   │       │   ├── CustomNotifier.java     # 自定义通知器
│   │   │   │       │   └── InfoNotifier.java       # 信息通知器
│   │   │   │       └── properties/
│   │   │   │           └── NotifyProperties.java   # 通知配置属性
│   │   │   └── resources/
│   │   │       ├── application.yml                  # 应用配置
│   │   │       └── logback-plus.xml                 # 日志配置
│   │   └── test/                                    # 测试代码
│   └── README.md                                    # 模块说明
└── ruoyi-snailjob-server/              # 任务调度服务
    ├── pom.xml                         # SnailJob Server Maven 配置
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   ├── com/aizuda/snailjob/server/
    │   │   │   │   ├── common/
    │   │   │   │   │   └── register/
    │   │   │   │   │       └── ServerRegister.java     # 服务注册
    │   │   │   │   └── starter/
    │   │   │   │       └── filter/
    │   │   │   │           ├── ActuatorAuthFilter.java  # 认证过滤器
    │   │   │   │           └── SecurityConfig.java      # 安全配置
    │   │   │   └── plus/ruoyi/snailjob/
    │   │   │       └── SnailJobServer.java              # 启动类
    │   │   └── resources/
    │   │       ├── application.yml                      # 主配置文件
    │   │       ├── application-dev.yml                  # 开发环境配置
    │   │       ├── application-prod.yml                 # 生产环境配置
    │   │       ├── logback-plus.xml                     # 日志配置
    │   │       └── admin/                               # 前端静态资源
    │   └── test/                                        # 测试代码
    └── README.md                                        # 模块说明
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/

## 扩展模块详解

### 1. 应用监控服务 (Monitor Admin)

应用监控服务基于 **Spring Boot Admin** 构建,提供了可视化的应用监控和管理功能,支持多实例监控、健康检查、日志查看、邮件告警等企业级特性。

#### 核心功能

**监控能力:**
- 应用健康状态实时监控
- JVM 内存、线程、GC 监控
- HTTP 请求追踪和统计
- 日志实时查看和下载
- 环境变量和配置查看

**告警通知:**
- 邮件通知(服务上线/下线)
- 钉钉 Webhook 通知
- 自定义通知渠道扩展
- 告警模板配置

**安全认证:**
- 基于 Spring Security 的登录认证
- 支持自定义用户名密码
- 客户端认证保护

#### Maven 依赖

```xml
<dependencies>
    <!-- Spring Boot Admin 服务端 -->
    <dependency>
        <groupId>de.codecentric</groupId>
        <artifactId>spring-boot-admin-starter-server</artifactId>
    </dependency>

    <!-- Spring Boot Admin 客户端(自监控) -->
    <dependency>
        <groupId>de.codecentric</groupId>
        <artifactId>spring-boot-admin-starter-client</artifactId>
    </dependency>

    <!-- Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- 邮件通知支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-mail</artifactId>
    </dependency>
</dependencies>
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/pom.xml:18-58

#### 启动类

```java
package plus.ruoyi.monitor.admin;

import cn.hutool.core.thread.ThreadUtil;
import de.codecentric.boot.admin.server.config.EnableAdminServer;
import plus.ruoyi.common.core.utils.SpringUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Arrays;

/**
 * 监控服务启动类
 *
 * Spring Boot Admin
 * 主要功能:
 * 1. 监控各个微服务的健康状态
 * 2. 提供 Web 界面查看服务状态
 * 3. 支持邮件和 WebHook 通知
 *
 * @author Lion Li
 */
@EnableAdminServer  // 启用 Admin Server 功能
@SpringBootApplication
public class MonitorAdmin {

    public static void main(String[] args) {
        SpringApplication.run(MonitorAdmin.class, args);

        ThreadUtil.sleep(1000);
        // 打印启动成功信息
        System.out.printf("\n(✨◠‿◠)ﾉ♪♫ %s 启动成功！环境: %s 地址: http://127.0.0.1:%s%s\n\n",
            SpringUtils.getApplicationName(),
            Arrays.toString(SpringUtils.getActiveProfiles()),
            SpringUtils.getProperty("server.port"),
            SpringUtils.getProperty("spring.boot.admin.context-path"));
    }
}
```

**关键注解说明:**
- `@EnableAdminServer`: 启用 Spring Boot Admin Server 功能,提供监控中心能力
- `@SpringBootApplication`: 标准的 Spring Boot 应用启动类注解

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/java/plus/ruoyi/monitor/admin/MonitorAdmin.java:1-37

#### 核心配置

```yaml
# 服务器基础配置
server:
  port: ${SERVER_PORT:9090}  # 监控中心端口,默认 9090

# Spring 应用配置
spring:
  application:
    name: Spring Boot Admin

  # 安全认证配置
  security:
    user:
      name: ${MONITOR_USERNAME:ruoyi}      # 登录用户名
      password: ${MONITOR_PASSWORD:123456} # 登录密码

  # Admin Server 配置
  boot:
    admin:
      ui:
        title: ${MONITOR_TITLE:Spring Boot Admin服务监控中心}
      context-path: /admin  # 监控中心访问路径

# Actuator 监控端点配置
management:
  endpoints:
    web:
      exposure:
        include: '*'  # 暴露所有监控端点
  endpoint:
    health:
      show-details: ALWAYS  # 健康检查显示详细信息
    logfile:
      external-file: ./logs/ruoyi-monitor-admin.log  # 日志文件路径
```

**配置说明:**
- 默认端口 `9090`,可通过环境变量 `SERVER_PORT` 覆盖
- 默认用户名/密码为 `ruoyi/123456`,建议生产环境修改
- 监控中心访问地址: `http://localhost:9090/admin`

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml:1-60

#### 自监控配置

Monitor Admin 支持自我监控,将自己注册为监控客户端:

```yaml
# Spring Boot Admin 客户端配置(自监控)
spring.boot.admin.client:
  # 启用监控客户端
  enabled: ${MONITOR_SELF_ENABLED:true}
  # Admin Server 地址
  url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
  instance:
    service-host-type: IP  # 服务主机类型
    metadata:
      username: ${MONITOR_USERNAME:ruoyi}      # 客户端认证用户名
      userpassword: ${MONITOR_PASSWORD:123456} # 客户端认证密码
  username: ${MONITOR_USERNAME:ruoyi}  # 客户端用户名
  password: ${MONITOR_PASSWORD:123456} # 客户端密码
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml:61-78

#### 告警通知配置

支持邮件和钉钉 Webhook 两种通知方式:

**邮件通知:**

```yaml
notify:
  mail:
    enabled: ${NOTIFY_MAIL_ENABLED:false}  # 是否启用邮件通知
    to: ${NOTIFY_MAIL_TO:admin@example.com}  # 收件人邮箱
    subject: ${NOTIFY_MAIL_SUBJECT:admin监控通知}  # 邮件主题
    template: "<html><body>
                  <p><b>服务名称:</b> {}</p>
                  <p><b>实例编号:</b> {}</p>
                  <p><b>服务状态:</b> {}({})</p>
                  <p><b>服务地址:</b> {}</p>
                  <p><b>发送时间:</b> {}</p>
               </body></html>"  # HTML 邮件模板
```

**钉钉 Webhook 通知:**

```yaml
notify:
  web-hook:
    enabled: ${NOTIFY_WEBHOOK_ENABLED:false}  # 是否启用 Webhook 通知
    type: 1  # 通知类型: 1-钉钉
    secret: ${DINGTALK_SECRET:}  # 钉钉机器人密钥
    keywords: ${DINGTALK_KEYWORDS:}  # 关键词列表
    url: ${DINGTALK_WEBHOOK_URL:https://oapi.dingtalk.com/robot/send?access_token=xxxxxx}
    template: |  # Markdown 消息模板
      #### **{}**
      - **服务名称**: {}
      - **实例编号**: {}
      - **服务状态**: {}({})
      - **服务地址**: {}
      - **发送时间**: {}
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml:80-118

### 2. 任务调度服务 (SnailJob Server)

任务调度服务基于 **SnailJob** 构建,是一个分布式任务调度和重试平台,提供强大的任务管理、调度执行、失败重试等能力。

#### 核心功能

**任务调度:**
- 定时任务调度(Cron 表达式)
- 一次性任务调度
- 延时任务调度
- 并行/串行任务编排
- 任务分片执行

**重试机制:**
- 失败自动重试
- 重试策略配置(指数退避、固定间隔等)
- 重试次数限制
- 死信队列支持

**监控管理:**
- 任务执行状态监控
- 执行日志查看
- 性能指标统计
- 可视化管理界面

**高可用:**
- 服务端集群部署
- 任务负载均衡
- 故障转移
- 数据持久化

#### Maven 依赖

```xml
<dependencies>
    <!-- SnailJob 服务端 -->
    <dependency>
        <groupId>com.aizuda</groupId>
        <artifactId>snail-job-server-starter</artifactId>
        <version>${snailjob.version}</version>
        <exclusions>
            <exclusion>
                <groupId>org.scala-lang</groupId>
                <artifactId>scala-library</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <!-- Scala 库(解决版本冲突) -->
    <dependency>
        <groupId>org.scala-lang</groupId>
        <artifactId>scala-library</artifactId>
        <version>2.13.9</version>
    </dependency>

    <!-- Spring Boot Admin 客户端(监控支持) -->
    <dependency>
        <groupId>de.codecentric</groupId>
        <artifactId>spring-boot-admin-starter-client</artifactId>
        <version>${spring-boot-admin.version}</version>
    </dependency>
</dependencies>
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-snailjob-server/pom.xml:18-47

#### 启动类

```java
package plus.ruoyi.snailjob;

import cn.hutool.core.thread.ThreadUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.util.Arrays;

/**
 * 任务调度服务端启动程序
 *
 * SnailJob Server
 *
 * @author opensnail
 * @date 2024-05-17
 */
@SpringBootApplication
public class SnailJobServer {

    public static void main(String[] args) {
        // 启动 SnailJob Server 应用
        ConfigurableApplicationContext context = SpringApplication.run(
            com.aizuda.snailjob.server.SnailJobServerApplication.class, args);

        // 获取环境配置
        Environment env = context.getEnvironment();

        ThreadUtil.sleep(1000);
        // 打印启动成功信息
        System.out.printf("\n(✨◠‿◠)ﾉ♪♫ %s 启动成功！环境: %s 地址: http://127.0.0.1:%s%s\n\n",
            env.getProperty("spring.application.name"),
            Arrays.toString(env.getActiveProfiles()),
            env.getProperty("server.port"),
            env.getProperty("server.servlet.context-path"));
    }
}
```

**实现说明:**
- 启动类通过 `SpringApplication.run()` 启动 SnailJob 官方提供的 `SnailJobServerApplication`
- 保留了启动信息打印功能,方便开发调试

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-snailjob-server/src/main/java/plus/ruoyi/snailjob/SnailJobServer.java:1-39

#### 核心配置

```yaml
# 服务器配置
server:
  port: ${SERVER_PORT:8800}  # 服务端口,默认 8800
  servlet:
    context-path: /snail-job  # 应用上下文路径

# Spring 基础配置
spring:
  application:
    name: ruoyi-snailjob-server
  profiles:
    active: @profiles.active@  # 激活的配置文件
  web:
    resources:
      static-locations: classpath:admin/  # 静态资源路径

# MyBatis Plus 配置
mybatis-plus:
  typeAliasesPackage: com.aizuda.snailjob.template.datasource.persistence.po
  global-config:
    db-config:
      where-strategy: NOT_EMPTY  # 查询条件策略
      capital-mode: false  # 关闭大写命名
      logic-delete-value: 1  # 逻辑删除值
      logic-not-delete-value: 0  # 逻辑未删除值
  configuration:
    map-underscore-to-camel-case: true  # 下划线转驼峰
    cache-enabled: true  # 启用二级缓存

# 日志配置
logging:
  config: classpath:logback-plus.xml
  level:
    com.aizuda.snailjob: ${LOG_LEVEL:info}

# Actuator 监控端点配置
management:
  endpoints:
    web:
      exposure:
        include: '*'  # 暴露所有端点
  endpoint:
    health:
      show-details: ALWAYS  # 健康检查详细信息
    logfile:
      external-file: ./logs/ruoyi-snailjob-server/console.log
```

**配置说明:**
- 默认端口 `8800`,访问地址: `http://localhost:8800/snail-job`
- 集成了 MyBatis Plus,支持逻辑删除和二级缓存
- 暴露了 Actuator 监控端点,可被 Monitor Admin 监控

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-snailjob-server/src/main/resources/application.yml:1-67

## 开发扩展模块

### 创建新扩展模块

按照以下步骤创建新的扩展模块:

#### 1. 创建 Maven 模块

在 `ruoyi-extend/pom.xml` 中添加新模块:

```xml
<modules>
    <!-- 应用监控服务 -->
    <module>ruoyi-monitor-admin</module>
    <!-- 任务调度服务 -->
    <module>ruoyi-snailjob-server</module>
    <!-- 新增扩展模块 -->
    <module>ruoyi-your-extension</module>
</modules>
```

#### 2. 创建模块目录结构

```bash
ruoyi-extend/
└── ruoyi-your-extension/
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/
        │   │   └── plus/ruoyi/extension/
        │   │       └── YourExtensionApplication.java
        │   └── resources/
        │       ├── application.yml
        │       └── logback-plus.xml
        └── test/
            └── java/
```

#### 3. 编写 POM 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>ruoyi-extend</artifactId>
        <groupId>plus.ruoyi</groupId>
        <version>${revision}</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <packaging>jar</packaging>
    <artifactId>ruoyi-your-extension</artifactId>

    <description>
        您的扩展模块描述
    </description>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Admin 客户端(可选,用于监控) -->
        <dependency>
            <groupId>de.codecentric</groupId>
            <artifactId>spring-boot-admin-starter-client</artifactId>
        </dependency>

        <!-- 其他依赖... -->
    </dependencies>

    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <!-- Spring Boot Maven 插件 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

#### 4. 编写启动类

```java
package plus.ruoyi.extension;

import cn.hutool.core.thread.ThreadUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.util.Arrays;

/**
 * 扩展服务启动类
 *
 * @author Your Name
 */
@SpringBootApplication
public class YourExtensionApplication {

    public static void main(String[] args) {
        var context = SpringApplication.run(YourExtensionApplication.class, args);

        Environment env = context.getEnvironment();
        ThreadUtil.sleep(1000);

        System.out.printf("\n(✨◠‿◠)ﾉ♪♫ %s 启动成功！环境: %s 地址: http://127.0.0.1:%s%s\n\n",
            env.getProperty("spring.application.name"),
            Arrays.toString(env.getActiveProfiles()),
            env.getProperty("server.port"),
            env.getProperty("server.servlet.context-path", ""));
    }
}
```

#### 5. 编写配置文件

`src/main/resources/application.yml`:

```yaml
# 服务器配置
server:
  port: ${SERVER_PORT:8080}

# Spring 应用配置
spring:
  application:
    name: ruoyi-your-extension
  profiles:
    active: @profiles.active@

# 日志配置
logging:
  config: classpath:logback-plus.xml
  level:
    plus.ruoyi.extension: ${LOG_LEVEL:info}

# Actuator 监控端点配置
management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: ALWAYS
```

### 集成 Spring Boot Admin 监控

如果希望新扩展模块被 Monitor Admin 监控,需要进行以下配置:

#### 1. 添加依赖

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
</dependency>
```

#### 2. 添加配置

在 `application.yml` 中添加:

```yaml
# Spring Boot Admin 客户端配置
spring.boot.admin.client:
  # 启用监控客户端
  enabled: true
  # Monitor Admin Server 地址
  url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
  instance:
    # 服务主机类型
    service-host-type: IP
    # 客户端认证信息
    metadata:
      username: ${MONITOR_USERNAME:ruoyi}
      userpassword: ${MONITOR_PASSWORD:123456}
  # 客户端用户名密码
  username: ${MONITOR_USERNAME:ruoyi}
  password: ${MONITOR_PASSWORD:123456}
```

#### 3. 暴露监控端点

```yaml
management:
  endpoints:
    web:
      exposure:
        # 暴露所有监控端点
        include: '*'
  endpoint:
    health:
      # 健康检查显示详细信息
      show-details: ALWAYS
    logfile:
      # 日志文件路径(可选)
      external-file: ./logs/ruoyi-your-extension.log
```

### 集成配置管理

扩展模块可以复用主应用的配置管理能力:

#### 使用环境变量

所有扩展模块都支持通过环境变量覆盖配置:

```yaml
server:
  port: ${SERVER_PORT:8080}  # 默认 8080,可通过 SERVER_PORT 环境变量覆盖
```

#### 使用 Profile

支持多环境配置:

```bash
# 开发环境
java -jar ruoyi-your-extension.jar --spring.profiles.active=dev

# 生产环境
java -jar ruoyi-your-extension.jar --spring.profiles.active=prod
```

创建对应的配置文件:
- `application-dev.yml`: 开发环境配置
- `application-prod.yml`: 生产环境配置

### 使用通用模块

扩展模块可以引用 `ruoyi-common` 中的通用功能:

#### 1. 添加依赖

```xml
<dependencies>
    <!-- 核心通用模块 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>

    <!-- 邮件模块 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-mail</artifactId>
    </dependency>

    <!-- Redis 模块 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- 其他通用模块... -->
</dependencies>
```

#### 2. 使用工具类

```java
import plus.ruoyi.common.core.utils.SpringUtils;
import plus.ruoyi.common.core.utils.StringUtils;
import plus.ruoyi.common.core.utils.JsonUtils;

// 获取 Spring 上下文信息
String appName = SpringUtils.getApplicationName();
String[] profiles = SpringUtils.getActiveProfiles();

// 字符串工具
boolean isEmpty = StringUtils.isEmpty(str);

// JSON 工具
String json = JsonUtils.toJsonString(object);
User user = JsonUtils.parseObject(json, User.class);
```

## API 文档

### Monitor Admin API

#### 获取应用列表

**接口:** `GET /admin/applications`

**请求头:**
```
Authorization: Basic base64(username:password)
```

**响应示例:**
```json
[
  {
    "name": "ruoyi-admin",
    "instances": [
      {
        "id": "abc123",
        "version": "5.5.0",
        "registration": {
          "name": "ruoyi-admin",
          "managementUrl": "http://localhost:8080/actuator",
          "healthUrl": "http://localhost:8080/actuator/health",
          "serviceUrl": "http://localhost:8080"
        },
        "statusInfo": {
          "status": "UP",
          "details": {
            "diskSpace": {
              "status": "UP",
              "details": {
                "total": 500107862016,
                "free": 100107862016,
                "threshold": 10485760
              }
            }
          }
        }
      }
    ]
  }
]
```

#### 获取应用详情

**接口:** `GET /admin/instances/{instanceId}`

**路径参数:**
- `instanceId`: 实例 ID

**响应示例:**
```json
{
  "id": "abc123",
  "version": "5.5.0",
  "registration": {
    "name": "ruoyi-admin",
    "managementUrl": "http://localhost:8080/actuator",
    "healthUrl": "http://localhost:8080/actuator/health"
  },
  "statusInfo": {
    "status": "UP"
  },
  "info": {
    "app": {
      "name": "RuoYi-Plus-UniApp",
      "version": "5.5.0"
    }
  }
}
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/

### SnailJob API

SnailJob Server 提供了完整的 RESTful API 和 Web 管理界面。

#### 访问管理界面

**地址:** `http://localhost:8800/snail-job`

**功能:**
- 任务管理(创建、编辑、删除、执行)
- 任务日志查看
- 重试记录查询
- 性能监控统计

#### 核心 API

SnailJob 的 API 由官方提供,详细文档请参考:
- 官方文档: https://snailjob.opensnail.com/
- API 文档: https://snailjob.opensnail.com/pages/guide/

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-snailjob-server/

## 配置参考

### Monitor Admin 完整配置

```yaml
# ======================================
# Spring Boot Admin 监控中心配置文件
# ======================================

# 服务器基础配置
server:
  port: ${SERVER_PORT:9090}

# Spring 应用配置
spring:
  application:
    name: Spring Boot Admin
  profiles:
    active: @profiles.active@

  # 安全认证
  security:
    user:
      name: ${MONITOR_USERNAME:ruoyi}
      password: ${MONITOR_PASSWORD:123456}

  # Admin Server 配置
  boot:
    admin:
      ui:
        title: ${MONITOR_TITLE:Spring Boot Admin服务监控中心}
      context-path: /admin

  # Thymeleaf 配置
  thymeleaf:
    check-template-location: false

# 日志配置
logging:
  config: classpath:logback-plus.xml
  level:
    org.springframework.boot.admin: ${LOG_LEVEL:info}

# Actuator 监控端点
management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: ALWAYS
    logfile:
      external-file: ./logs/ruoyi-monitor-admin.log

# 自监控配置
spring.boot.admin.client:
  enabled: ${MONITOR_SELF_ENABLED:true}
  url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
  instance:
    service-host-type: IP
    metadata:
      username: ${MONITOR_USERNAME:ruoyi}
      userpassword: ${MONITOR_PASSWORD:123456}
  username: ${MONITOR_USERNAME:ruoyi}
  password: ${MONITOR_PASSWORD:123456}

# 通知配置
notify:
  # 邮件通知
  mail:
    enabled: ${NOTIFY_MAIL_ENABLED:false}
    to: ${NOTIFY_MAIL_TO:admin@example.com}
    subject: ${NOTIFY_MAIL_SUBJECT:admin监控通知}
    template: "<html><body>
                  <p><b>服务名称:</b> {}</p>
                  <p><b>实例编号:</b> {}</p>
                  <p><b>服务状态:</b> {}({})</p>
                  <p><b>服务地址:</b> {}</p>
                  <p><b>发送时间:</b> {}</p>
               </body></html>"
  # Webhook 通知
  web-hook:
    enabled: ${NOTIFY_WEBHOOK_ENABLED:false}
    type: 1
    secret: ${DINGTALK_SECRET:}
    keywords: ${DINGTALK_KEYWORDS:}
    url: ${DINGTALK_WEBHOOK_URL:https://oapi.dingtalk.com/robot/send?access_token=xxxxxx}
    template: |
      #### **{}**
      - **服务名称**: {}
      - **实例编号**: {}
      - **服务状态**: {}({})
      - **服务地址**: {}
      - **发送时间**: {}
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml

### SnailJob Server 完整配置

```yaml
# ======================================
# Snail Job 服务器主配置文件
# ======================================

# 服务器配置
server:
  port: ${SERVER_PORT:8800}
  servlet:
    context-path: /snail-job

# Spring 基础配置
spring:
  application:
    name: ruoyi-snailjob-server
  profiles:
    active: @profiles.active@
  web:
    resources:
      static-locations: classpath:admin/

# MyBatis Plus 配置
mybatis-plus:
  typeAliasesPackage: com.aizuda.snailjob.template.datasource.persistence.po
  global-config:
    db-config:
      where-strategy: NOT_EMPTY
      capital-mode: false
      logic-delete-value: 1
      logic-not-delete-value: 0
  configuration:
    map-underscore-to-camel-case: true
    cache-enabled: true

# 日志配置
logging:
  config: classpath:logback-plus.xml
  level:
    com.aizuda.snailjob: ${LOG_LEVEL:info}

# Actuator 监控端点
management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: ALWAYS
    logfile:
      external-file: ./logs/ruoyi-snailjob-server/console.log
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-snailjob-server/src/main/resources/application.yml

### 环境变量列表

| 变量名 | 说明 | 默认值 | 适用模块 |
|--------|------|--------|----------|
| `SERVER_PORT` | 服务端口 | 9090/8800 | 所有 |
| `MONITOR_USERNAME` | 监控中心用户名 | ruoyi | Monitor Admin |
| `MONITOR_PASSWORD` | 监控中心密码 | 123456 | Monitor Admin |
| `MONITOR_TITLE` | 监控中心标题 | Spring Boot Admin服务监控中心 | Monitor Admin |
| `MONITOR_URL` | 监控中心地址 | http://127.0.0.1:9090/admin | 所有客户端 |
| `MONITOR_SELF_ENABLED` | 是否启用自监控 | true | Monitor Admin |
| `NOTIFY_MAIL_ENABLED` | 是否启用邮件通知 | false | Monitor Admin |
| `NOTIFY_MAIL_TO` | 收件人邮箱 | admin@example.com | Monitor Admin |
| `NOTIFY_MAIL_SUBJECT` | 邮件主题 | admin监控通知 | Monitor Admin |
| `NOTIFY_WEBHOOK_ENABLED` | 是否启用 Webhook 通知 | false | Monitor Admin |
| `DINGTALK_SECRET` | 钉钉机器人密钥 | 空 | Monitor Admin |
| `DINGTALK_KEYWORDS` | 钉钉关键词列表 | 空 | Monitor Admin |
| `DINGTALK_WEBHOOK_URL` | 钉钉 Webhook 地址 | https://oapi.dingtalk.com/robot/send?... | Monitor Admin |
| `LOG_LEVEL` | 日志级别 | info | 所有 |

## 部署指南

### 本地开发部署

#### 1. 编译打包

```bash
# 进入项目根目录
cd ruoyi-plus-uniapp-workflow

# 编译整个项目
mvn clean package -DskipTests

# 或者只编译扩展模块
cd ruoyi-extend
mvn clean package -DskipTests
```

#### 2. 启动 Monitor Admin

```bash
# 进入目标目录
cd ruoyi-extend/ruoyi-monitor-admin/target

# 启动服务
java -jar ruoyi-monitor-admin.jar

# 或指定配置
java -jar ruoyi-monitor-admin.jar \
  --SERVER_PORT=9090 \
  --MONITOR_USERNAME=admin \
  --MONITOR_PASSWORD=admin123

# 访问地址
# http://localhost:9090/admin
```

#### 3. 启动 SnailJob Server

```bash
# 进入目标目录
cd ruoyi-extend/ruoyi-snailjob-server/target

# 启动服务
java -jar ruoyi-snailjob-server.jar

# 或指定配置
java -jar ruoyi-snailjob-server.jar \
  --SERVER_PORT=8800 \
  --spring.profiles.active=dev

# 访问地址
# http://localhost:8800/snail-job
```

### Docker 部署

#### Monitor Admin Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim

LABEL maintainer="Lion Li"

# 工作目录
WORKDIR /app

# 复制 JAR 文件
COPY ruoyi-monitor-admin.jar app.jar

# 暴露端口
EXPOSE 9090

# 环境变量
ENV SERVER_PORT=9090 \
    MONITOR_USERNAME=ruoyi \
    MONITOR_PASSWORD=123456 \
    LOG_LEVEL=info

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### SnailJob Server Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim

LABEL maintainer="opensnail"

# 工作目录
WORKDIR /app

# 复制 JAR 文件
COPY ruoyi-snailjob-server.jar app.jar

# 暴露端口
EXPOSE 8800

# 环境变量
ENV SERVER_PORT=8800 \
    LOG_LEVEL=info

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Docker Compose 部署

```yaml
version: '3.8'

services:
  # Monitor Admin 监控中心
  monitor-admin:
    image: ruoyi/monitor-admin:latest
    container_name: monitor-admin
    ports:
      - "9090:9090"
    environment:
      - SERVER_PORT=9090
      - MONITOR_USERNAME=admin
      - MONITOR_PASSWORD=admin123
      - MONITOR_SELF_ENABLED=true
      - NOTIFY_MAIL_ENABLED=false
      - LOG_LEVEL=info
    volumes:
      - ./logs/monitor:/app/logs
    restart: unless-stopped
    networks:
      - ruoyi-network

  # SnailJob 任务调度中心
  snailjob-server:
    image: ruoyi/snailjob-server:latest
    container_name: snailjob-server
    ports:
      - "8800:8800"
    environment:
      - SERVER_PORT=8800
      - MONITOR_URL=http://monitor-admin:9090/admin
      - MONITOR_USERNAME=admin
      - MONITOR_PASSWORD=admin123
      - LOG_LEVEL=info
    volumes:
      - ./logs/snailjob:/app/logs
    restart: unless-stopped
    depends_on:
      - monitor-admin
    networks:
      - ruoyi-network

networks:
  ruoyi-network:
    driver: bridge
```

**启动命令:**

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署

#### 1. 准备工作

**环境要求:**
- JDK 17+
- 2GB+ 内存
- 10GB+ 磁盘空间

**配置文件准备:**

创建生产环境配置 `application-prod.yml`:

```yaml
# Monitor Admin 生产配置
spring:
  security:
    user:
      name: ${MONITOR_USERNAME}  # 从环境变量读取
      password: ${MONITOR_PASSWORD}

# 通知配置
notify:
  mail:
    enabled: true
    to: ops@company.com
  web-hook:
    enabled: true
    url: ${DINGTALK_WEBHOOK_URL}
```

#### 2. 系统服务配置

创建 systemd 服务文件 `/etc/systemd/system/monitor-admin.service`:

```ini
[Unit]
Description=Monitor Admin Service
After=network.target

[Service]
Type=simple
User=ruoyi
WorkingDirectory=/opt/ruoyi/monitor-admin
ExecStart=/usr/bin/java \
  -Xms512m -Xmx1024m \
  -Dspring.profiles.active=prod \
  -jar /opt/ruoyi/monitor-admin/ruoyi-monitor-admin.jar

Environment="SERVER_PORT=9090"
Environment="MONITOR_USERNAME=admin"
Environment="MONITOR_PASSWORD=your_secure_password"

Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

创建 SnailJob Server 服务文件 `/etc/systemd/system/snailjob-server.service`:

```ini
[Unit]
Description=SnailJob Server Service
After=network.target monitor-admin.service

[Service]
Type=simple
User=ruoyi
WorkingDirectory=/opt/ruoyi/snailjob-server
ExecStart=/usr/bin/java \
  -Xms1024m -Xmx2048m \
  -Dspring.profiles.active=prod \
  -jar /opt/ruoyi/snailjob-server/ruoyi-snailjob-server.jar

Environment="SERVER_PORT=8800"
Environment="MONITOR_URL=http://localhost:9090/admin"
Environment="MONITOR_USERNAME=admin"
Environment="MONITOR_PASSWORD=your_secure_password"

Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 3. 服务管理

```bash
# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start monitor-admin
sudo systemctl start snailjob-server

# 设置开机自启
sudo systemctl enable monitor-admin
sudo systemctl enable snailjob-server

# 查看服务状态
sudo systemctl status monitor-admin
sudo systemctl status snailjob-server

# 查看日志
sudo journalctl -u monitor-admin -f
sudo journalctl -u snailjob-server -f

# 停止服务
sudo systemctl stop monitor-admin
sudo systemctl stop snailjob-server

# 重启服务
sudo systemctl restart monitor-admin
sudo systemctl restart snailjob-server
```

#### 4. Nginx 反向代理配置

```nginx
# Monitor Admin 反向代理
server {
    listen 80;
    server_name monitor.example.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monitor.example.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /admin {
        proxy_pass http://localhost:9090/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# SnailJob Server 反向代理
server {
    listen 443 ssl http2;
    server_name snailjob.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /snail-job {
        proxy_pass http://localhost:8800/snail-job;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

重新加载 Nginx 配置:

```bash
sudo nginx -t  # 测试配置
sudo nginx -s reload  # 重新加载
```

## 最佳实践

### 1. 安全加固

**修改默认密码:**

生产环境务必修改默认用户名和密码:

```bash
# 设置环境变量
export MONITOR_USERNAME=your_username
export MONITOR_PASSWORD=your_secure_password

# 或在配置文件中修改
spring:
  security:
    user:
      name: ${MONITOR_USERNAME:your_username}
      password: ${MONITOR_PASSWORD:your_secure_password}
```

**启用 HTTPS:**

使用 Nginx 反向代理并配置 SSL 证书,禁止 HTTP 直接访问。

**限制访问 IP:**

在 Nginx 中配置 IP 白名单:

```nginx
location /admin {
    # 允许内网访问
    allow 192.168.0.0/16;
    allow 10.0.0.0/8;
    # 允许特定外网 IP
    allow 1.2.3.4;
    # 拒绝其他所有 IP
    deny all;

    proxy_pass http://localhost:9090/admin;
}
```

### 2. 性能优化

**JVM 参数调优:**

```bash
# Monitor Admin(小内存)
java -Xms512m -Xmx1024m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -jar ruoyi-monitor-admin.jar

# SnailJob Server(大内存)
java -Xms1024m -Xmx2048m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=./logs/heapdump.hprof \
     -jar ruoyi-snailjob-server.jar
```

**日志级别调整:**

生产环境建议使用 `warn` 或 `error` 级别:

```yaml
logging:
  level:
    org.springframework.boot.admin: warn
    com.aizuda.snailjob: warn
```

**定期清理日志:**

配置日志文件大小和保留天数:

```xml
<!-- logback-plus.xml -->
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>./logs/app.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <!-- 每天滚动 -->
        <fileNamePattern>./logs/app.%d{yyyy-MM-dd}.log</fileNamePattern>
        <!-- 保留 30 天 -->
        <maxHistory>30</maxHistory>
        <!-- 总大小不超过 10GB -->
        <totalSizeCap>10GB</totalSizeCap>
    </rollingPolicy>
</appender>
```

### 3. 监控告警

**配置邮件告警:**

```yaml
notify:
  mail:
    enabled: true
    to: ops@company.com,admin@company.com  # 多个收件人用逗号分隔
    subject: "[生产环境] 应用监控告警"
    template: |
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #ff0000;">⚠️ 应用状态告警</h2>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr><td><b>服务名称</b></td><td>{}</td></tr>
          <tr><td><b>实例编号</b></td><td>{}</td></tr>
          <tr><td><b>服务状态</b></td><td style="color: #ff0000;">{} ({})</td></tr>
          <tr><td><b>服务地址</b></td><td>{}</td></tr>
          <tr><td><b>发送时间</b></td><td>{}</td></tr>
        </table>
        <p>请及时处理！</p>
      </body>
      </html>
```

**配置钉钉告警:**

1. 创建钉钉群聊机器人
2. 获取 Webhook 地址和密钥
3. 配置告警:

```yaml
notify:
  web-hook:
    enabled: true
    type: 1  # 钉钉
    secret: SECxxx...  # 机器人密钥
    keywords: 监控告警  # 关键词(可选)
    url: https://oapi.dingtalk.com/robot/send?access_token=xxx
    template: |
      #### **🚨 应用监控告警**
      ---
      - **服务名称**: {}
      - **实例编号**: {}
      - **服务状态**: <font color="#FF0000">{}({})</font>
      - **服务地址**: {}
      - **发送时间**: {}
      ---
      请及时处理！
```

### 4. 日志管理

**集中式日志收集:**

使用 ELK(Elasticsearch + Logstash + Kibana) 收集和分析日志:

```yaml
# logback-plus.xml 配置
<appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>logstash-server:5000</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <customFields>{"app":"monitor-admin","env":"production"}</customFields>
    </encoder>
</appender>
```

**日志格式化:**

使用结构化日志便于分析:

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger log = LoggerFactory.getLogger(YourClass.class);

// 使用 MDC 添加上下文信息
MDC.put("userId", "12345");
MDC.put("requestId", UUID.randomUUID().toString());

log.info("User action: {}, result: {}", action, result);

// 清理 MDC
MDC.clear();
```

### 5. 高可用部署

**Monitor Admin 集群:**

Monitor Admin 支持多实例部署,通过负载均衡器分发请求:

```nginx
upstream monitor_backend {
    server monitor1.example.com:9090;
    server monitor2.example.com:9090;
    server monitor3.example.com:9090;
}

server {
    listen 443 ssl http2;
    server_name monitor.example.com;

    location /admin {
        proxy_pass http://monitor_backend/admin;
        # 其他配置...
    }
}
```

**SnailJob Server 集群:**

SnailJob 原生支持集群部署,只需配置相同的数据库即可:

```yaml
# 多个 SnailJob 实例共享同一个数据库
spring:
  datasource:
    url: jdbc:mysql://db.example.com:3306/snailjob?useUnicode=true&characterEncoding=utf8
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

### 6. 备份与恢复

**数据库备份:**

对于 SnailJob Server,定期备份数据库:

```bash
#!/bin/bash
# backup-snailjob-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/snailjob"
DB_NAME="snailjob"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -h db.example.com -u root -p$DB_PASSWORD \
  --databases $DB_NAME \
  --single-transaction \
  --routines \
  --triggers \
  | gzip > $BACKUP_DIR/snailjob_$DATE.sql.gz

# 保留最近 30 天的备份
find $BACKUP_DIR -name "snailjob_*.sql.gz" -mtime +30 -delete
```

配置定时任务:

```bash
# crontab -e
# 每天凌晨 2 点备份
0 2 * * * /opt/scripts/backup-snailjob-db.sh
```

**配置文件备份:**

定期备份配置文件和启动脚本:

```bash
#!/bin/bash
# backup-config.sh

BACKUP_DIR="/backup/config"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
  /opt/ruoyi/monitor-admin/application*.yml \
  /opt/ruoyi/snailjob-server/application*.yml \
  /etc/systemd/system/monitor-admin.service \
  /etc/systemd/system/snailjob-server.service \
  /etc/nginx/conf.d/monitor.conf

# 保留最近 90 天的备份
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +90 -delete
```

## 常见问题

### 1. Monitor Admin 无法访问

**问题描述:**
启动后无法访问 Monitor Admin 管理界面,浏览器显示连接超时或拒绝连接。

**问题原因:**
- 端口未正确绑定
- 防火墙阻止访问
- Nginx 配置错误
- 服务未正常启动

**解决方案:**

```bash
# 1. 检查服务是否正常启动
sudo systemctl status monitor-admin
sudo journalctl -u monitor-admin -n 50

# 2. 检查端口监听
netstat -tlnp | grep 9090
# 或
ss -tlnp | grep 9090

# 3. 检查防火墙
sudo firewall-cmd --list-ports
# 添加端口
sudo firewall-cmd --permanent --add-port=9090/tcp
sudo firewall-cmd --reload

# 4. 本地测试
curl http://localhost:9090/admin

# 5. 检查 Nginx 配置
sudo nginx -t
sudo nginx -s reload
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml:6-8

### 2. 应用注册失败

**问题描述:**
客户端应用无法注册到 Monitor Admin,监控界面看不到应用实例。

**问题原因:**
- Monitor Admin Server 地址配置错误
- 客户端认证信息不匹配
- 网络不通
- Actuator 端点未暴露

**解决方案:**

```yaml
# 客户端配置检查
spring.boot.admin.client:
  # 1. 确认 URL 正确
  url: http://localhost:9090/admin  # 确保地址可访问

  # 2. 确认认证信息匹配
  username: ruoyi  # 必须与服务端一致
  password: 123456  # 必须与服务端一致

  instance:
    metadata:
      username: ruoyi
      userpassword: 123456

# 3. 确认 Actuator 端点暴露
management:
  endpoints:
    web:
      exposure:
        include: '*'  # 或至少包含: health,info,metrics

# 4. 确认健康检查端点可访问
curl http://localhost:8080/actuator/health
```

**调试步骤:**

```bash
# 1. 检查客户端日志
tail -f logs/ruoyi-admin.log | grep "admin.client"

# 2. 测试网络连通性
curl -u ruoyi:123456 http://monitor-server:9090/admin/applications

# 3. 检查防火墙规则
sudo iptables -L -n | grep 9090
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml:61-78

### 3. 邮件通知发送失败

**问题描述:**
配置了邮件通知但收不到告警邮件。

**问题原因:**
- 邮件服务器配置错误
- 认证信息不正确
- 邮件模板格式错误
- 收件人邮箱地址无效

**解决方案:**

```yaml
# 1. 检查邮件服务配置
spring:
  mail:
    host: smtp.example.com  # SMTP 服务器地址
    port: 587  # SMTP 端口(465 for SSL, 587 for TLS)
    username: noreply@example.com  # 发件人邮箱
    password: ${MAIL_PASSWORD}  # 邮箱密码或授权码
    properties:
      mail:
        smtp:
          auth: true  # 启用认证
          starttls:
            enable: true  # 启用 TLS
            required: true

# 2. 检查通知配置
notify:
  mail:
    enabled: true  # 确保已启用
    to: admin@example.com  # 确保邮箱地址正确
    subject: "监控告警"
    template: "<html><body>...</body></html>"  # 确保模板格式正确
```

**测试邮件发送:**

```java
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Autowired
private JavaMailSender mailSender;

public void testSendMail() {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom("noreply@example.com");
    message.setTo("admin@example.com");
    message.setSubject("测试邮件");
    message.setText("这是一封测试邮件");

    try {
        mailSender.send(message);
        System.out.println("邮件发送成功");
    } catch (Exception e) {
        System.err.println("邮件发送失败: " + e.getMessage());
        e.printStackTrace();
    }
}
```

**常见邮箱配置:**

```yaml
# QQ 邮箱
spring:
  mail:
    host: smtp.qq.com
    port: 587
    username: your-email@qq.com
    password: your-auth-code  # 注意是授权码不是密码

# 163 邮箱
spring:
  mail:
    host: smtp.163.com
    port: 465
    username: your-email@163.com
    password: your-auth-code

# Gmail
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml:80-97

### 4. SnailJob 任务执行失败

**问题描述:**
在 SnailJob Server 中创建的任务无法正常执行,任务状态显示失败。

**问题原因:**
- 客户端未连接到服务端
- 任务处理器未正确注册
- Cron 表达式错误
- 任务参数配置错误

**解决方案:**

```java
// 1. 确保客户端已添加依赖
<dependency>
    <groupId>com.aizuda</groupId>
    <artifactId>snail-job-client-starter</artifactId>
    <version>${snailjob.version}</version>
</dependency>

// 2. 配置客户端连接
spring:
  application:
    name: ruoyi-admin  # 客户端应用名
  snailjob:
    client:
      # SnailJob Server 地址
      server-url: http://localhost:8800/snail-job
      # 命名空间(用于隔离不同环境)
      namespace: default
      # 是否启用客户端
      enabled: true

// 3. 正确注册任务处理器
import com.aizuda.snailjob.client.job.core.annotation.JobExecutor;
import com.aizuda.snailjob.client.model.ExecuteResult;

@Component
public class MyJobHandler {

    /**
     * 任务处理器
     *
     * @param jobContext 任务上下文
     * @return 执行结果
     */
    @JobExecutor(name = "testJob")
    public ExecuteResult execute(String jobContext) {
        try {
            // 执行业务逻辑
            System.out.println("执行任务: " + jobContext);

            // 返回成功结果
            return ExecuteResult.success("任务执行成功");
        } catch (Exception e) {
            // 返回失败结果
            return ExecuteResult.failure("任务执行失败: " + e.getMessage());
        }
    }
}

// 4. 检查 Cron 表达式
// 正确示例:
// 0 */5 * * * ?    # 每 5 分钟执行一次
// 0 0 2 * * ?      # 每天凌晨 2 点执行
// 0 0 12 * * MON   # 每周一中午 12 点执行
```

**调试步骤:**

```bash
# 1. 检查客户端日志
tail -f logs/ruoyi-admin.log | grep "snailjob"

# 2. 检查服务端日志
tail -f logs/ruoyi-snailjob-server/console.log

# 3. 检查网络连通性
curl http://localhost:8800/snail-job/actuator/health

# 4. 在 Web 界面检查
# http://localhost:8800/snail-job
# - 查看任务列表
# - 查看执行日志
# - 查看客户端连接状态
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-snailjob-server/

### 5. 内存溢出问题

**问题描述:**
扩展服务运行一段时间后出现 `OutOfMemoryError`,服务崩溃。

**问题原因:**
- JVM 堆内存设置过小
- 存在内存泄漏
- 日志文件过大占用堆外内存
- 缓存数据未及时清理

**解决方案:**

```bash
# 1. 调整 JVM 参数
java -Xms1024m -Xmx2048m \  # 增加堆内存
     -XX:MetaspaceSize=256m \  # 元空间初始大小
     -XX:MaxMetaspaceSize=512m \  # 元空间最大大小
     -XX:+UseG1GC \  # 使用 G1 垃圾回收器
     -XX:MaxGCPauseMillis=200 \  # GC 停顿时间目标
     -XX:+HeapDumpOnOutOfMemoryError \  # OOM 时生成堆转储
     -XX:HeapDumpPath=./logs/heapdump.hprof \  # 堆转储文件路径
     -XX:+PrintGCDetails \  # 打印 GC 详情
     -XX:+PrintGCDateStamps \  # 打印 GC 时间戳
     -Xloggc:./logs/gc.log \  # GC 日志文件
     -jar ruoyi-snailjob-server.jar

# 2. 定期清理日志
# 配置日志滚动策略
<rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
    <fileNamePattern>./logs/app.%d{yyyy-MM-dd}.log</fileNamePattern>
    <maxHistory>7</maxHistory>  # 只保留 7 天日志
    <totalSizeCap>5GB</totalSizeCap>  # 总大小不超过 5GB
</rollingPolicy>

# 3. 监控内存使用
curl http://localhost:9090/actuator/metrics/jvm.memory.used
curl http://localhost:9090/actuator/metrics/jvm.gc.pause

# 4. 分析堆转储文件
# 使用 MAT(Memory Analyzer Tool) 或 JProfiler 分析 heapdump.hprof
```

**预防措施:**

```java
// 1. 及时关闭资源
try (InputStream is = new FileInputStream("file.txt")) {
    // 使用资源
} catch (IOException e) {
    log.error("IO error", e);
}

// 2. 使用弱引用缓存
import java.lang.ref.WeakReference;
import java.util.WeakHashMap;

Map<String, WeakReference<Object>> cache = new WeakHashMap<>();

// 3. 定期清理缓存
@Scheduled(cron = "0 0 3 * * ?")  # 每天凌晨 3 点清理
public void cleanCache() {
    cache.clear();
    log.info("缓存已清理");
}
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/

### 6. 端口冲突

**问题描述:**
启动扩展服务时提示端口已被占用。

**问题原因:**
- 其他应用占用了默认端口
- 之前的进程未完全关闭

**解决方案:**

```bash
# 1. 查找占用端口的进程
# Windows
netstat -ano | findstr :9090
taskkill /PID <进程ID> /F

# Linux
lsof -i:9090
kill -9 <进程ID>

# 或
ss -tlnp | grep 9090
systemctl stop monitor-admin

# 2. 修改配置使用其他端口
# application.yml
server:
  port: 9091  # 改为其他端口

# 或通过环境变量
export SERVER_PORT=9091
java -jar ruoyi-monitor-admin.jar

# 或命令行参数
java -jar ruoyi-monitor-admin.jar --server.port=9091

# 3. 确保防火墙允许新端口
sudo firewall-cmd --permanent --add-port=9091/tcp
sudo firewall-cmd --reload

# 4. 更新 Nginx 配置
location /admin {
    proxy_pass http://localhost:9091/admin;  # 更新端口
}
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml:6-8

### 7. 日志文件过大

**问题描述:**
日志文件增长过快,占用大量磁盘空间。

**问题原因:**
- 日志级别设置为 DEBUG
- 未配置日志滚动策略
- 高频日志输出
- 未定期清理

**解决方案:**

```xml
<!-- logback-plus.xml 配置 -->
<configuration>
    <!-- 定义日志文件路径 -->
    <property name="LOG_PATH" value="./logs"/>

    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 文件输出(按时间和大小滚动) -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/app.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <!-- 按天滚动 -->
            <fileNamePattern>${LOG_PATH}/app.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <!-- 单个文件大小 -->
            <maxFileSize>100MB</maxFileSize>
            <!-- 保留天数 -->
            <maxHistory>15</maxHistory>
            <!-- 总大小限制 -->
            <totalSizeCap>5GB</totalSizeCap>
        </rollingPolicy>
    </appender>

    <!-- Root Logger -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>

    <!-- 特定包日志级别 -->
    <logger name="plus.ruoyi.monitor.admin" level="INFO"/>
    <logger name="com.aizuda.snailjob" level="INFO"/>
    <logger name="org.springframework.boot.admin" level="WARN"/>
</configuration>
```

**定时清理脚本:**

```bash
#!/bin/bash
# clean-logs.sh

LOG_DIR="/opt/ruoyi/logs"
DAYS=30  # 保留最近 30 天

# 删除 30 天前的日志文件
find $LOG_DIR -name "*.log" -mtime +$DAYS -delete
find $LOG_DIR -name "*.log.*" -mtime +$DAYS -delete

echo "日志清理完成: $(date)"
```

配置定时任务:

```bash
# crontab -e
# 每天凌晨 3 点清理日志
0 3 * * * /opt/scripts/clean-logs.sh >> /var/log/clean-logs.log 2>&1
```

**生产环境日志级别建议:**

```yaml
logging:
  level:
    root: WARN  # 根日志级别
    plus.ruoyi: INFO  # 业务日志
    org.springframework: WARN  # Spring 框架
    org.springframework.boot.admin: WARN  # Monitor Admin
    com.aizuda.snailjob: INFO  # SnailJob
```

参考: ruoyi-plus-uniapp-workflow/ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml:20-25

## 附录

### A. 完整示例

#### 自定义扩展模块完整示例

创建一个简单的消息推送服务作为扩展模块:

**1. POM 配置 (`ruoyi-message-push/pom.xml`):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>ruoyi-extend</artifactId>
        <groupId>plus.ruoyi</groupId>
        <version>${revision}</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>
    <artifactId>ruoyi-message-push</artifactId>

    <description>
        消息推送服务 - 提供统一的消息推送能力
    </description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>de.codecentric</groupId>
            <artifactId>spring-boot-admin-starter-client</artifactId>
        </dependency>
        <dependency>
            <groupId>plus.ruoyi</groupId>
            <artifactId>ruoyi-common-core</artifactId>
        </dependency>
    </dependencies>

    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

**2. 启动类:**

```java
package plus.ruoyi.message.push;

import cn.hutool.core.thread.ThreadUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.util.Arrays;

/**
 * 消息推送服务启动类
 *
 * @author RuoYi
 */
@SpringBootApplication
public class MessagePushApplication {

    public static void main(String[] args) {
        var context = SpringApplication.run(MessagePushApplication.class, args);
        Environment env = context.getEnvironment();

        ThreadUtil.sleep(1000);
        System.out.printf("\n(✨◠‿◠)ﾉ♪♫ %s 启动成功！环境: %s 地址: http://127.0.0.1:%s%s\n\n",
            env.getProperty("spring.application.name"),
            Arrays.toString(env.getActiveProfiles()),
            env.getProperty("server.port"),
            env.getProperty("server.servlet.context-path", ""));
    }
}
```

**3. 消息推送服务:**

```java
package plus.ruoyi.message.push.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 消息推送服务
 *
 * @author RuoYi
 */
@Slf4j
@Service
public class MessagePushService {

    /**
     * 推送消息
     *
     * @param userId 用户ID
     * @param message 消息内容
     * @return 是否成功
     */
    public boolean pushMessage(String userId, String message) {
        try {
            log.info("推送消息给用户 {}: {}", userId, message);

            // 实现消息推送逻辑
            // 可以是 WebSocket、SSE、推送通知等

            return true;
        } catch (Exception e) {
            log.error("消息推送失败", e);
            return false;
        }
    }
}
```

**4. REST 控制器:**

```java
package plus.ruoyi.message.push.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import plus.ruoyi.message.push.service.MessagePushService;

import java.util.HashMap;
import java.util.Map;

/**
 * 消息推送控制器
 *
 * @author RuoYi
 */
@RestController
@RequestMapping("/api/message")
@RequiredArgsConstructor
public class MessagePushController {

    private final MessagePushService messagePushService;

    /**
     * 推送消息
     */
    @PostMapping("/push")
    public Map<String, Object> pushMessage(@RequestParam String userId,
                                           @RequestParam String message) {
        boolean success = messagePushService.pushMessage(userId, message);

        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        result.put("message", success ? "推送成功" : "推送失败");
        return result;
    }

    /**
     * 健康检查
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("service", "message-push");
        return result;
    }
}
```

**5. 配置文件 (`application.yml`):**

```yaml
server:
  port: ${SERVER_PORT:8900}

spring:
  application:
    name: ruoyi-message-push
  profiles:
    active: @profiles.active@

logging:
  config: classpath:logback-plus.xml
  level:
    plus.ruoyi.message.push: ${LOG_LEVEL:info}

management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: ALWAYS

spring.boot.admin.client:
  enabled: true
  url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
  instance:
    service-host-type: IP
    metadata:
      username: ${MONITOR_USERNAME:ruoyi}
      userpassword: ${MONITOR_PASSWORD:123456}
  username: ${MONITOR_USERNAME:ruoyi}
  password: ${MONITOR_PASSWORD:123456}
```
