# 任务服务 (snailjob-server)

## 1. 模块概述

### 1.1. 模块定位
`snailjob-server` 是一个基于 **SnailJob** 的分布式任务调度中心。作为 `ruoyi-plus-uniapp` 项目的异步处理和定时任务引擎，它提供了一个独立、稳定且功能强大的后台服务，用于管理和调度整个系统的后台任务。此模块本质上是对 SnailJob 官方服务端的封装和集成，使其能无缝融入 `ruoyi-plus-uniapp` 的技术体系和运维规范中。

### 1.2. 核心价值
- **分布式调度**: 在微服务集群环境中，能够对任务进行统一管理和调度，并通过动态分片、故障转移等机制确保任务在多实例下高效、可靠地执行。
- **丰富的任务类型**: 支持 Cron 表达式定义的定时任务、在未来某个时间点执行的延迟任务，并为失败的任务提供强大的自动重试机制。
- **可视化管理**: 提供功能完善的 Web 管理后台，允许开发者和运维人员在线进行任务的创建、配置、启停、手动触发以及监控。
- **高可用性**: 服务端和客户端均支持集群部署，当某个节点宕机时，任务可以自动故障转移到其他可用节点，保证任务调度服务的高可用。
- **统一监控与安全**: 内置了 Spring Boot Admin Client，可以无缝对接到 `monitor-admin` 监控中心。同时，通过自定义安全过滤器，对 Actuator 监控端点进行了安全加固。

---

## 2. 核心功能

### 2.1. 分布式任务调度
- **集中管理**: 在统一的 Web UI 中管理所有注册客户端的任务，支持动态添加、删除和修改任务。
- **路由策略**: 支持多种任务路由策略，如轮询、随机、分片、故障转移等，以灵活控制任务在哪个客户端节点上执行。
- **分片广播**: 支持将一个大任务分片，由集群中的多个客户端节点并行处理，极大提高任务执行效率。

### 2.2. 多种任务类型
- **定时任务**: 基于 Cron 表达式，适用于需要周期性执行的场景，如每日数据同步、定时报表生成等。
- **延迟任务**: 在指定的延迟时间后执行一次，适用于订单超时未支付自动取消、延时通知等场景。
- **失败重试**: 当任务执行失败时，系统会根据预设的重试策略（如重试次数、重试间隔）自动重新执行，提高了任务的成功率。

### 2.3. 任务管理后台
- **任务看板**: 概览系统任务总数、调度次数、成功率等核心指标。
- **任务管理**: 在线对任务进行增、删、改、查，并能控制任务的启停和手动触发。
- **调度历史**: 查看每个任务的详细执行记录，包括执行节点、耗时、状态和结果。
- **在线日志**: 通过集成的 `SnailJobServerLogbackAppender`，可以实时查看任务执行过程中在服务端和客户端输出的日志，便于快速排查问题。

### 2.4. 高可用与监控
- **集群部署**: 服务端和客户端均支持集群部署，避免单点故障。
- **Actuator 监控**: 集成 Actuator 端点，暴露应用内部状态。
- **安全加固**: 通过自定义的 `ActuatorAuthFilter`，为所有 Actuator 端点添加了 HTTP Basic 认证，只有提供正确凭证（与 `monitor-admin` 的连接凭证一致）才能访问。 
- **统一监控**: 将自身作为客户端注册到 `monitor-admin`，允许运维人员通过统一的监控平台来监控 `snailjob-server` 的运行状态、JVM、线程等信息。

---

## 3. 技术栈与依赖

### 3.1. 核心框架
- **SnailJob Server**: 分布式任务调度核心框架。
- **Spring Boot**: 应用基础框架。
- **MyBatis Plus**: 数据持久层框架，用于存储任务、组、命名空间等信息。
- **Netty / gRPC**: SnailJob 底层 RPC 通信框架。

### 3.2. 主要依赖 (`pom.xml`)
- `com.aizuda:snail-job-server-starter`: SnailJob 服务端核心依赖。
- `de.codecentric:spring-boot-admin-starter-client`: 用于将自身注册到 `monitor-admin` 监控中心。
- `mysql:mysql-connector-java`: MySQL 数据库驱动（运行时）。
- `com.zaxxer:HikariCP`: 高性能数据库连接池。
- `org.scala-lang:scala-library`: SnailJob 依赖的 Scala 库，项目中明确指定版本以保证兼容性。

---

## 4. 配置指南

主配置文件为 `src/main/resources/application.yml`，环境相关配置分离在 `application-dev.yml` 和 `application-prod.yml` 中。

### 4.1. `application.yml` 基础配置
```yaml
# 服务器配置
server:
  port: 8800 # 任务调度中心Web管理后台的服务端口
  servlet:
    context-path: /snail-job # 应用访问路径

# Spring 基础配置
spring:
  application:
    name: ruoyi-snailjob-server # 应用名称
  profiles:
    active: @profiles.active@ # 激活的环境配置 (通过Maven profile注入)
```

### 4.2. 环境特定配置 (`application-prod.yml`)
```yaml
# 数据库配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/ryplus_uni_snailjob?useUnicode=true...
    username: ryplus_uni_snailjob # 生产环境数据库用户名
    password: root # 生产环境数据库密码

# snail-job 服务端配置
snail-job:
  server-port: 17888 # SnailJob 内部 RPC 通信端口，客户端通过此端口与服务端连接
  log-storage: 7 # 日志在数据库中的保留天数
  rpc-type: grpc # RPC 通信类型，可选 netty 或 grpc

# Spring Boot Admin 监控中心配置
spring.boot.admin.client:
  enabled: true # 生产环境启用监控上报
  url: http://localhost:9090/admin # 指向 monitor-admin 地址
  username: @monitor.username@ # 连接认证用户名
  password: @monitor.password@ # 连接认证密码
```

---

## 5. 实现原理剖析

### 5.1. Actuator 安全过滤
为了保护 Actuator 端点不被未授权访问（因为 `management.endpoints.web.exposure.include` 设置为 `*`），模块实现了一套简单的 HTTP Basic 认证机制。
1.  **`ActuatorAuthFilter`**: 这是一个自定义的 Servlet 过滤器。它拦截所有发往 `/actuator` 和 `/actuator/*` 的请求。
2.  在 `doFilter` 方法中，它从 HTTP 请求头中获取 `Authorization` 字段，并解码 Base64 编码的用户名和密码。
3.  将解码后的凭证与配置文件中 `spring.boot.admin.client` 下的 `username` 和 `password` 进行比对。
4.  如果认证失败或未提供凭证，则返回 `401 Unauthorized` 响应，阻止访问。
5.  **`SecurityConfig`**: 这个配置类通过 `FilterRegistrationBean` 将 `ActuatorAuthFilter` 过滤器注册到 Spring 的过滤器链中，并明确指定其拦截路径。这是一种轻量级的安全控制方式，避免了引入 Spring Security 带来的复杂性。

### 5.2. 启动类封装
- **`plus.ruoyi.snailjob.SnailJobServer.java`**: 这是项目的入口类，但它本身并不包含 SnailJob 的核心启动逻辑。
- 它的 `main` 方法调用了 `com.aizuda.snailjob.server.SnailJobServerApplication.class` 的 `run` 方法。这清晰地表明，此模块是对 SnailJob 官方服务端的一个“外壳”封装。这种设计的目的是在不侵入修改 SnailJob 源码的情况下，为其附加额外的配置（如 `ActuatorAuthFilter`）、依赖和集成能力，使其更好地融入 `ruoyi-plus-uniapp` 的整体架构。
- 启动完成后，它会打印出格式化的成功信息，包括应用的访问地址、环境等，方便开发者确认启动状态。

### 5.3. 日志系统集成
- **`logback-plus.xml`**: 日志配置中除了标准的控制台和文件输出外，还包含一个特殊的 Appender：
  ```xml
  <appender name="snail_log_server_appender" 
            class="com.aizuda.snailjob.server.common.appender.SnailJobServerLogbackAppender">
  </appender>
  ```
- 这个 `SnailJobServerLogbackAppender` 是 SnailJob 框架提供的，它能捕获应用日志并将其推送到任务调度中心，从而实现在管理后台查看实时日志的功能。

---

## 6. 部署与运行

### 6.1. 环境准备
- **数据库**: 需要一个正在运行的 MySQL 实例。
- **创建数据库**: 手动创建一个名为 `ryplus_uni_snailjob` 的数据库（字符集推荐 `utf8mb4`）。SnailJob 服务端在首次启动时，会自动在该库中创建所需的表结构。

### 6.2. 本地启动
1.  修改 `src/main/resources/application-dev.yml` 文件，配置正确的数据库连接信息（URL, 用户名, 密码）。
2.  在 IDE 中找到 `plus.ruoyi.snailjob.SnailJobServer.java` 类。
3.  直接运行其 `main` 方法。
4.  启动成功后，访问 `http://localhost:8800/snail-job` 即可打开 SnailJob 的管理后台。

### 6.3. 打包与部署
1.  在项目根目录下，执行 Maven 命令进行打包：
    ```bash
    mvn clean package -DskipTests
    ```
2.  打包完成后，会在 `ruoyi-extend/ruoyi-snailjob-server/target` 目录下生成 `ruoyi-snailjob-server.jar` 文件。
3.  使用 `java -jar` 命令运行，并通过 `-Dspring.profiles.active=prod` 指定生产环境配置：
    ```bash
    java -jar -Dspring.profiles.active=prod ruoyi-snailjob-server.jar
    ```

### 6.4. Docker 部署
项目已提供 `Dockerfile` 用于容器化部署。
1.  **构建 Docker 镜像** (在 `ruoyi-extend/ruoyi-snailjob-server` 目录下执行):
    ```bash
    # 确保已先执行 mvn package 打包
    docker build -t ruoyi-snailjob-server:latest .
    ```
2.  **运行 Docker 容器**:
    ```bash
    docker run -d \
      -p 8800:8800 \
      -p 17888:17888 \
      -e "SPRING_PROFILES_ACTIVE=prod" \
      --name snailjob-server \
      ruoyi-snailjob-server:latest
    ```
    - `-p 8800:8800`: 映射 Web 管理后台端口。
    - `-p 17888:17888`: 映射 RPC 通信端口，客户端需要访问此端口。
    - `-e "SPRING_PROFILES_ACTIVE=prod"`: 设置环境变量以激活生产配置。
    - **注意**: 在 Docker 环境中，需要确保容器可以访问到数据库。通常需要修改配置文件中的数据库 `url`，将其中的 `localhost` 改为数据库容器的名称或宿主机的 IP 地址。

---

## 7. 客户端接入指南

对于需要执行分布式任务的微服务，可以作为 SnailJob Client 接入。

### 7.1. 引入依赖
在客户端项目的 `pom.xml` 中，添加 `snail-job-client-starter` 依赖。

### 7.2. 配置客户端
在客户端的 `application.yml` 中，添加 SnailJob 客户端配置：
```yaml
snail-job:
  client:
    # 服务端地址，多个用逗号分隔以实现高可用
    server-addr: http://127.0.0.1:8800/snail-job
    # 命名空间，用于环境隔离 (dev, test, prod)
    namespace: "ruoyi-plus"
    # 组名称，用于业务或应用隔离
    group-name: "ruoyi-business"
```

### 7.3. 编写任务
使用 `@SnailJob` 注解即可将一个方法声明为分布式任务。
```java
import com.aizuda.snailjob.client.job.core.annotation.SnailJob;
import org.springframework.stereotype.Component;

@Component
public class MyJobs {

    @SnailJob(jobName = "myFirstJob", cron = "0/10 * * * * ?")
    public void exampleJob() {
        System.out.println("这是一个每10秒执行一次的分布式任务。");
    }
}
```
完成以上步骤后，启动客户端应用，它会自动将 `exampleJob` 任务注册到 `snailjob-server`，并由服务端根据 Cron 表达式统一调度执行。
