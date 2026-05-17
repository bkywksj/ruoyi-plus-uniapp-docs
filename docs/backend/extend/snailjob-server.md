# SnailJob 任务调度服务

分布式任务调度中心 - 基于 SnailJob 1.8.0 提供高性能任务调度与管理能力

## 模块简介

`ruoyi-snailjob-server` 是 RuoYi-Plus 框架的分布式任务调度中心模块，基于 Dromara 开源社区的 SnailJob 框架构建。该模块作为独立服务部署，提供统一的任务调度、管理和监控能力，支持定时任务、延迟任务和失败重试等多种任务类型。

### 核心特性

- **分布式调度**: 支持多实例集群部署，通过动态分片、故障转移确保任务高效可靠执行
- **多任务类型**: 支持 Cron 定时任务、延迟任务、工作流任务，满足各类业务场景
- **失败重试**: 内置强大的重试机制，支持自定义重试策略、退避算法和重试上限
- **可视化管理**: 提供功能完善的 Web 管理后台，支持任务创建、配置、启停和监控
- **实时日志**: 集成日志收集器，支持在管理后台实时查看任务执行日志
- **高可用**: 服务端和客户端均支持集群部署，自动故障转移
- **统一监控**: 集成 Spring Boot Admin，与 `monitor-admin` 无缝对接

::: warning 重要说明
本模块是独立的任务调度服务端，需要单独部署。业务应用作为客户端连接到此服务端。
:::

## 模块架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SnailJob 分布式任务调度架构                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         管理层 (Web UI)                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │  │  任务看板   │  │  任务管理   │  │  调度历史   │  │  在线日志  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    SnailJob Server 服务端集群                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │                       调度引擎                                   │ │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                │ │  │
│  │  │  │ Cron调度器 │  │ 延迟任务   │  │ 重试调度器 │                │ │  │
│  │  │  └────────────┘  └────────────┘  └────────────┘                │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │                       路由策略                                   │ │  │
│  │  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │ │  │
│  │  │  │  轮询  │  │  随机  │  │  分片  │  │ 故障转移│  │  广播  │   │ │  │
│  │  │  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                               │                                      │  │
│  │                    gRPC / Netty (端口 17888)                         │  │
│  └───────────────────────────────┼──────────────────────────────────────┘  │
│                                  │                                          │
│              ┌───────────────────┼───────────────────┐                     │
│              │                   │                   │                     │
│              ▼                   ▼                   ▼                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  Client 实例1   │  │  Client 实例2   │  │  Client 实例N   │            │
│  │  (ruoyi-admin)  │  │  (ruoyi-admin)  │  │  (其他服务)     │            │
│  │                 │  │                 │  │                 │            │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │            │
│  │  │ @SnailJob │  │  │  │ @SnailJob │  │  │  │ @SnailJob │  │            │
│  │  │ 任务方法  │  │  │  │ 任务方法  │  │  │  │ 任务方法  │  │            │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         数据存储层                                    │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      MySQL 数据库                               │  │  │
│  │  │  任务配置 | 调度记录 | 执行日志 | 命名空间 | 分组信息           │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 说明 |
|------|------|
| `SnailJobServer` | 服务端启动入口类，封装 SnailJob 官方服务端 |
| `ActuatorAuthFilter` | Actuator 端点认证过滤器，提供 HTTP Basic 认证 |
| `SecurityConfig` | 安全配置类，注册认证过滤器 |
| `JobAutoConfiguration` | 客户端自动配置类，启用任务调度功能 |

### 端口说明

| 端口 | 用途 | 说明 |
|------|------|------|
| 8800 | Web 管理端口 | 访问管理后台和 API |
| 17888 | RPC 通信端口 | 客户端与服务端通信 |

## 快速部署

### 环境要求

- **JDK**: 17+
- **MySQL**: 5.7+
- **Maven**: 3.8+

### 1. 数据库初始化

SnailJob 需要独立的数据库存储任务配置和执行记录。

**创建数据库**

```sql
-- 创建 SnailJob 专用数据库
CREATE DATABASE IF NOT EXISTS `ryplus_uni_workflow`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE ryplus_uni_workflow;
```

**初始化表结构**

SnailJob 服务端首次启动时会自动创建所需的表结构，包括：

| 表名 | 说明 |
|------|------|
| `sj_namespace` | 命名空间配置 |
| `sj_group_config` | 分组配置 |
| `sj_job` | 任务配置 |
| `sj_job_task` | 任务实例 |
| `sj_job_log_message` | 任务日志 |
| `sj_retry_task` | 重试任务 |
| `sj_retry_dead_letter` | 死信队列 |
| `sj_workflow` | 工作流配置 |
| `sj_workflow_node` | 工作流节点 |
| `sj_system_user` | 系统用户 |

### 2. 修改配置文件

编辑 `application-dev.yml` 配置数据库连接：

```yaml
# 数据库配置
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/ryplus_uni_workflow?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: root
    # HikariCP 连接池配置
    hikari:
      connection-timeout: 30000       # 连接超时时间
      validation-timeout: 5000        # 验证超时时间
      minimum-idle: 10                # 最小空闲连接
      maximum-pool-size: 20           # 最大连接数
      idle-timeout: 600000            # 空闲超时时间
      max-lifetime: 900000            # 连接最大生命周期
      keepaliveTime: 30000            # 保活时间

# SnailJob 服务端配置
snail-job:
  server-port: 17888                  # RPC 通信端口
  log-storage: 7                      # 日志保留天数
  bucket-total: 128                   # 分桶总数
  summary-day: 7                      # Dashboard 统计天数
  retry-pull-page-size: 100           # 重试数据拉取批次大小
  load-balance-cycle-time: 10         # 负载均衡周期时间(秒)
```

### 3. 启动服务

**方式一：IDE 启动**

运行 `plus.ruoyi.snailjob.SnailJobServer` 类的 `main` 方法。

**方式二：Maven 命令启动**

```bash
# 进入模块目录
cd ruoyi-extend/ruoyi-snailjob-server

# 编译打包
mvn clean package -DskipTests

# 运行
java -jar target/ruoyi-snailjob-server.jar --spring.profiles.active=dev
```

启动成功后会显示：

```
(✨◠‿◠)ﾉ♪♫ ruoyi-snailjob-server 启动成功！环境: [dev] 地址: http://127.0.0.1:8800/snail-job
```

### 4. 访问管理后台

- **地址**: http://127.0.0.1:8800/snail-job
- **默认账号**: admin
- **默认密码**: admin

## Docker 部署

### Dockerfile 说明

项目提供了优化的 Dockerfile，使用 Liberica OpenJDK 17 作为基础镜像：

```dockerfile
# 使用贝尔实验室 OpenJDK 17 镜像（支持 CDS 加速启动）
FROM bellsoft/liberica-openjdk-rocky:17-cds

LABEL maintainer="抓蛙师"

# 创建目录结构
RUN mkdir -p /ruoyi/snailjob/logs

WORKDIR /ruoyi/snailjob

# 设置环境变量
ENV SERVER_PORT=8800 \
    SNAILJOB_SERVER_PORT=17888 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    JAVA_OPTS="-Xms512m -Xmx1024m" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=Asia/Shanghai

# 暴露端口
EXPOSE ${SERVER_PORT}
EXPOSE ${SNAILJOB_SERVER_PORT}

# 复制应用
COPY ./target/ruoyi-snailjob-server.jar /ruoyi/snailjob/app.jar

# 启动命令
ENTRYPOINT ["sh", "-c", "cd /ruoyi/snailjob && exec java \
    -Dserver.port=${SERVER_PORT} \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} \
    -Duser.timezone=${TZ} \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/ruoyi/snailjob/logs/ \
    -XX:+UseZGC \
    ${JAVA_OPTS} \
    -jar /ruoyi/snailjob/app.jar"]
```

### 构建 Docker 镜像

```bash
# 进入模块目录
cd ruoyi-extend/ruoyi-snailjob-server

# 编译打包
mvn clean package -DskipTests

# 构建镜像
docker build -t ruoyi-snailjob-server:latest .
```

### Docker Compose 部署

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: snailjob-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ryplus_uni_workflow
      TZ: Asia/Shanghai
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_general_ci
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # SnailJob 服务端
  snailjob-server:
    image: ruoyi-snailjob-server:latest
    container_name: snailjob-server
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      # 数据库配置
      SNAILJOB_DB_HOST: mysql
      SNAILJOB_DB_PORT: 3306
      SNAILJOB_DB_NAME: ryplus_uni_workflow
      SNAILJOB_DB_USERNAME: root
      SNAILJOB_DB_PASSWORD: root
      # 服务配置
      SERVER_PORT: 8800
      SNAILJOB_SERVER_PORT: 17888
      SPRING_PROFILES_ACTIVE: prod
      # JVM 配置
      JAVA_OPTS: "-Xms512m -Xmx1024m"
      # 监控配置（可选）
      MONITOR_ENABLED: "false"
      MONITOR_URL: http://monitor-admin:9090/admin
      MONITOR_USERNAME: ruoyi
      MONITOR_PASSWORD: "123456"
    ports:
      - "8800:8800"
      - "17888:17888"
    volumes:
      - snailjob_logs:/ruoyi/snailjob/logs
    restart: unless-stopped

volumes:
  mysql_data:
  snailjob_logs:
```

**启动服务**

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f snailjob-server

# 停止服务
docker-compose down
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SERVER_PORT` | Web 服务端口 | 8800 |
| `SNAILJOB_SERVER_PORT` | RPC 通信端口 | 17888 |
| `SNAILJOB_DB_HOST` | 数据库地址 | 127.0.0.1 |
| `SNAILJOB_DB_PORT` | 数据库端口 | 3306 |
| `SNAILJOB_DB_NAME` | 数据库名称 | ryplus_uni_workflow |
| `SNAILJOB_DB_USERNAME` | 数据库用户名 | root |
| `SNAILJOB_DB_PASSWORD` | 数据库密码 | root |
| `SPRING_PROFILES_ACTIVE` | 激活的配置环境 | prod |
| `JAVA_OPTS` | JVM 参数 | -Xms512m -Xmx1024m |
| `MONITOR_ENABLED` | 是否启用监控 | false |
| `MONITOR_URL` | 监控中心地址 | - |
| `MONITOR_USERNAME` | 监控认证用户名 | - |
| `MONITOR_PASSWORD` | 监控认证密码 | - |

## 任务类型详解

### 定时任务 (Cron Job)

基于 Cron 表达式的周期性任务，适用于定时执行的场景。

**Cron 表达式格式**

```
┌───────────── 秒 (0-59)
│ ┌───────────── 分 (0-59)
│ │ ┌───────────── 时 (0-23)
│ │ │ ┌───────────── 日 (1-31)
│ │ │ │ ┌───────────── 月 (1-12)
│ │ │ │ │ ┌───────────── 周 (0-7, 0和7都表示周日)
│ │ │ │ │ │
* * * * * *
```

**常用表达式示例**

| 表达式 | 说明 |
|--------|------|
| `0 0 2 * * ?` | 每天凌晨2点执行 |
| `0 0/30 * * * ?` | 每30分钟执行一次 |
| `0 0 10,14,16 * * ?` | 每天10点、14点、16点执行 |
| `0 0 12 ? * WED` | 每周三中午12点执行 |
| `0 0 12 1 * ?` | 每月1号中午12点执行 |
| `0/10 * * * * ?` | 每10秒执行一次 |

**任务示例**

```java
import com.aizuda.snailjob.client.job.core.annotation.JobExecutor;
import com.aizuda.snailjob.client.job.core.dto.JobArgs;
import com.aizuda.snailjob.client.model.ExecuteResult;
import org.springframework.stereotype.Component;

@Component
public class DataSyncJob {

    /**
     * 数据同步任务 - 每天凌晨2点执行
     */
    @JobExecutor(name = "dataSyncJob")
    public ExecuteResult syncData(JobArgs args) {
        try {
            // 执行数据同步逻辑
            int syncCount = doSync();
            return ExecuteResult.success("同步完成，处理记录数: " + syncCount);
        } catch (Exception e) {
            return ExecuteResult.failure("同步失败: " + e.getMessage());
        }
    }

    private int doSync() {
        // 实际同步逻辑
        return 100;
    }
}
```

### 延迟任务 (Delay Job)

在指定延迟时间后执行一次的任务，适用于订单超时、延时通知等场景。

**使用场景**

- 订单超时未支付自动取消
- 预约提醒通知
- 延时发送消息
- 活动定时开启/关闭

**任务示例**

```java
import com.aizuda.snailjob.client.job.core.annotation.JobExecutor;
import com.aizuda.snailjob.client.job.core.dto.JobArgs;
import com.aizuda.snailjob.client.model.ExecuteResult;
import org.springframework.stereotype.Component;

@Component
public class OrderTimeoutJob {

    /**
     * 订单超时取消任务
     */
    @JobExecutor(name = "orderTimeoutJob")
    public ExecuteResult cancelOrder(JobArgs args) {
        // 从任务参数获取订单ID
        String orderId = args.getJobParams();

        try {
            // 检查订单状态并取消
            boolean cancelled = cancelOrderIfUnpaid(orderId);
            if (cancelled) {
                return ExecuteResult.success("订单已取消: " + orderId);
            }
            return ExecuteResult.success("订单已支付，无需取消: " + orderId);
        } catch (Exception e) {
            return ExecuteResult.failure("取消失败: " + e.getMessage());
        }
    }

    private boolean cancelOrderIfUnpaid(String orderId) {
        // 实际取消逻辑
        return true;
    }
}
```

### 失败重试 (Retry)

当任务执行失败时，系统会根据预设的重试策略自动重新执行。

**重试策略配置**

| 参数 | 说明 | 建议值 |
|------|------|--------|
| 最大重试次数 | 任务失败后最多重试的次数 | 3-5 次 |
| 重试间隔 | 两次重试之间的时间间隔 | 10-60 秒 |
| 退避策略 | 重试间隔的增长方式 | 指数退避 |
| 超时时间 | 单次任务执行的超时时间 | 根据业务设定 |

**退避策略说明**

| 策略 | 说明 |
|------|------|
| 固定间隔 | 每次重试间隔相同 |
| 指数退避 | 间隔按指数增长 (10s, 20s, 40s...) |
| 随机退避 | 间隔在指定范围内随机 |

**重试任务示例**

```java
import com.aizuda.snailjob.client.core.annotation.Retryable;
import com.aizuda.snailjob.client.core.retryer.RetryType;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    /**
     * 发送通知 - 失败自动重试
     * 最多重试3次，每次间隔10秒
     */
    @Retryable(scene = "sendNotification", retryType = RetryType.ONLY_REMOTE)
    public void sendNotification(String userId, String message) {
        // 调用第三方通知服务
        boolean success = callNotificationApi(userId, message);
        if (!success) {
            throw new RuntimeException("通知发送失败");
        }
    }

    private boolean callNotificationApi(String userId, String message) {
        // 实际调用逻辑
        return true;
    }
}
```

### 分片任务 (Sharding Job)

将一个大任务分片，由集群中多个节点并行处理，提高执行效率。

**适用场景**

- 大数据量批量处理
- 文件分片处理
- 批量发送消息

**分片任务示例**

```java
import com.aizuda.snailjob.client.job.core.annotation.JobExecutor;
import com.aizuda.snailjob.client.job.core.dto.JobArgs;
import com.aizuda.snailjob.client.model.ExecuteResult;
import org.springframework.stereotype.Component;

@Component
public class BatchProcessJob {

    /**
     * 分片批量处理任务
     */
    @JobExecutor(name = "batchProcessJob")
    public ExecuteResult process(JobArgs args) {
        // 获取分片参数
        int shardIndex = args.getShardingIndex();   // 当前分片索引
        int shardTotal = args.getShardingTotal();   // 总分片数

        try {
            // 根据分片处理对应数据
            int processed = processDataBySharding(shardIndex, shardTotal);
            return ExecuteResult.success(
                String.format("分片[%d/%d]处理完成，处理记录数: %d",
                    shardIndex, shardTotal, processed));
        } catch (Exception e) {
            return ExecuteResult.failure("处理失败: " + e.getMessage());
        }
    }

    private int processDataBySharding(int shardIndex, int shardTotal) {
        // 根据分片查询并处理数据
        // 例如: SELECT * FROM table WHERE id % shardTotal = shardIndex
        return 1000;
    }
}
```

## 客户端接入

### 添加依赖

在需要执行任务的业务模块 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-job</artifactId>
</dependency>
```

该模块包含以下核心依赖：

- `snail-job-client-starter`: 客户端启动器
- `snail-job-client-job-core`: 任务执行核心
- `snail-job-client-retry-core`: 重试机制核心

### 配置客户端

在 `application.yml` 中添加配置：

```yaml
# SnailJob 客户端配置
snail-job:
  # 启用客户端
  enabled: true
  # 服务端地址（多个用逗号分隔）
  server:
    host: 127.0.0.1
    port: 17888
  # 命名空间（用于环境隔离）
  namespace: ruoyi-plus
  # 分组名称（用于业务隔离）
  group-name: ruoyi-business
  # RPC 通信类型
  rpc-type: grpc
```

**配置说明**

| 参数 | 说明 | 必填 |
|------|------|------|
| `enabled` | 是否启用客户端 | 是 |
| `server.host` | 服务端地址 | 是 |
| `server.port` | 服务端 RPC 端口 | 是 |
| `namespace` | 命名空间，用于环境隔离 | 是 |
| `group-name` | 分组名称，用于业务隔离 | 是 |
| `rpc-type` | RPC 类型，grpc 或 netty | 否 |

### 自动配置原理

`JobAutoConfiguration` 自动配置类在 `snail-job.enabled=true` 时自动生效：

```java
@AutoConfiguration
@ConditionalOnProperty(prefix = "snail-job", name = "enabled", havingValue = "true")
@EnableScheduling
@EnableSnailJob
public class JobAutoConfiguration {

    /**
     * 客户端启动事件监听
     * 自动配置日志收集器
     */
    @EventListener(SnailClientStartingEvent.class)
    public void onStarting(SnailClientStartingEvent event) {
        LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();
        SnailLogbackAppender<ILoggingEvent> ca = new SnailLogbackAppender<>();
        ca.setName("snail_log_appender");
        ca.start();
        Logger rootLogger = lc.getLogger(Logger.ROOT_LOGGER_NAME);
        rootLogger.addAppender(ca);
    }
}
```

### 编写任务

**简单任务**

```java
import com.aizuda.snailjob.client.job.core.annotation.JobExecutor;
import com.aizuda.snailjob.client.job.core.dto.JobArgs;
import com.aizuda.snailjob.client.model.ExecuteResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DemoJobs {

    /**
     * 示例任务1: 无参数任务
     */
    @JobExecutor(name = "simpleJob")
    public ExecuteResult simpleJob(JobArgs args) {
        log.info("执行简单任务");
        return ExecuteResult.success();
    }

    /**
     * 示例任务2: 带参数任务
     */
    @JobExecutor(name = "paramJob")
    public ExecuteResult paramJob(JobArgs args) {
        String params = args.getJobParams();
        log.info("执行带参数任务，参数: {}", params);
        return ExecuteResult.success("处理完成");
    }

    /**
     * 示例任务3: 分片任务
     */
    @JobExecutor(name = "shardingJob")
    public ExecuteResult shardingJob(JobArgs args) {
        int index = args.getShardingIndex();
        int total = args.getShardingTotal();
        log.info("执行分片任务，分片索引: {}/{}", index, total);
        return ExecuteResult.success();
    }
}
```

## 集群部署

### 服务端集群

SnailJob 服务端支持多实例部署，通过数据库实现任务协调。

**架构图**

```
                    ┌─────────────────────┐
                    │     Nginx/LB        │
                    │  http://snailjob    │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │ Server 1    │     │ Server 2    │     │ Server 3    │
    │ :8800/:17888│     │ :8801/:17889│     │ :8802/:17890│
    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
           │                   │                   │
           └───────────────────┼───────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    MySQL 数据库     │
                    │  (共享存储)         │
                    └─────────────────────┘
```

**多实例配置**

```yaml
# 实例1
server:
  port: 8800
snail-job:
  server-port: 17888

# 实例2
server:
  port: 8801
snail-job:
  server-port: 17889

# 实例3
server:
  port: 8802
snail-job:
  server-port: 17890
```

**Nginx 负载均衡配置**

```nginx
upstream snailjob {
    server 192.168.1.101:8800 weight=1;
    server 192.168.1.102:8801 weight=1;
    server 192.168.1.103:8802 weight=1;
}

server {
    listen 80;
    server_name snailjob.example.com;

    location /snail-job {
        proxy_pass http://snailjob;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 客户端集群

客户端支持多实例部署，服务端会根据路由策略分配任务。

**客户端配置（多服务端地址）**

```yaml
snail-job:
  enabled: true
  server:
    # 多服务端地址，用于高可用
    host: 192.168.1.101,192.168.1.102,192.168.1.103
    port: 17888,17889,17890
  namespace: ruoyi-plus
  group-name: ruoyi-business
```

**路由策略**

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| 轮询 | 依次分配到各节点 | 通用场景 |
| 随机 | 随机选择节点 | 通用场景 |
| 分片广播 | 广播到所有节点 | 分片任务 |
| 故障转移 | 优先选择可用节点 | 高可用场景 |
| 一致性哈希 | 根据参数哈希选择 | 有状态任务 |

## 监控与日志

### Actuator 监控

服务端集成了 Spring Boot Actuator，暴露健康检查和监控端点。

**端点安全**

所有 Actuator 端点都受 HTTP Basic 认证保护：

```java
@Configuration
public class SecurityConfig {

    @Value("${spring.boot.admin.client.username}")
    private String username;

    @Value("${spring.boot.admin.client.password}")
    private String password;

    @Bean
    public FilterRegistrationBean<ActuatorAuthFilter> actuatorFilterRegistrationBean() {
        FilterRegistrationBean<ActuatorAuthFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new ActuatorAuthFilter(username, password));
        registrationBean.addUrlPatterns("/actuator", "/actuator/*");
        return registrationBean;
    }
}
```

**访问端点**

```bash
# 健康检查
curl -u ruoyi:123456 http://localhost:8800/snail-job/actuator/health

# 查看所有端点
curl -u ruoyi:123456 http://localhost:8800/snail-job/actuator
```

### Spring Boot Admin 集成

服务端可作为客户端注册到 `monitor-admin` 监控中心。

**启用监控**

```yaml
spring.boot.admin.client:
  enabled: true
  url: http://127.0.0.1:9090/admin
  username: ruoyi
  password: "123456"
  instance:
    service-host-type: IP
    metadata:
      username: ruoyi
      userpassword: "123456"
```

### 日志配置

服务端使用自定义 Logback 配置，支持日志推送到管理后台。

**日志 Appender**

```xml
<!-- SnailJob 日志收集器 -->
<appender name="snail_log_server_appender"
          class="com.aizuda.snailjob.server.common.appender.SnailJobServerLogbackAppender">
</appender>
```

**日志级别配置**

```yaml
logging:
  config: classpath:logback-plus.xml
  level:
    com.aizuda.snailjob: info    # SnailJob 框架日志
    plus.ruoyi: info              # 业务日志
```

**生产环境日志**

- 控制台日志: `./logs/ruoyi-snailjob-server/console.log`
- INFO 日志: `./logs/ruoyi-snailjob-server/info.log`
- ERROR 日志: `./logs/ruoyi-snailjob-server/error.log`

## 最佳实践

### 1. 任务设计原则

**幂等性设计**

任务应设计为可重复执行，避免重复处理带来的问题：

```java
@JobExecutor(name = "orderProcessJob")
public ExecuteResult processOrder(JobArgs args) {
    String orderId = args.getJobParams();

    // 检查是否已处理
    if (isOrderProcessed(orderId)) {
        return ExecuteResult.success("订单已处理，跳过");
    }

    // 处理订单
    processOrderLogic(orderId);

    // 标记已处理
    markOrderProcessed(orderId);

    return ExecuteResult.success();
}
```

**合理设置超时时间**

```java
// 根据任务实际执行时间设置超时
// 在管理后台配置，建议预留20-50%的缓冲时间
```

### 2. 异常处理

**统一异常处理**

```java
@JobExecutor(name = "robustJob")
public ExecuteResult robustJob(JobArgs args) {
    try {
        // 业务逻辑
        doBusinessLogic();
        return ExecuteResult.success();
    } catch (BusinessException e) {
        // 业务异常，记录并返回失败
        log.warn("业务异常: {}", e.getMessage());
        return ExecuteResult.failure("业务异常: " + e.getMessage());
    } catch (Exception e) {
        // 系统异常，记录详细日志
        log.error("系统异常", e);
        return ExecuteResult.failure("系统异常: " + e.getMessage());
    }
}
```

### 3. 命名空间和分组规划

**推荐规划**

| 环境 | 命名空间 | 分组 |
|------|----------|------|
| 开发 | dev | ruoyi-admin, ruoyi-business |
| 测试 | test | ruoyi-admin, ruoyi-business |
| 预发 | staging | ruoyi-admin, ruoyi-business |
| 生产 | prod | ruoyi-admin, ruoyi-business |

### 4. 性能优化

**连接池优化**

```yaml
spring:
  datasource:
    hikari:
      minimum-idle: 10          # 根据并发量调整
      maximum-pool-size: 50     # 根据服务器配置调整
```

**JVM 参数优化**

```bash
# 生产环境推荐配置
JAVA_OPTS="-Xms1g -Xmx2g -XX:+UseZGC -XX:+HeapDumpOnOutOfMemoryError"
```

## 故障排查

### 1. 客户端连接失败

**错误现象**

```
Failed to connect to SnailJob server
Connection refused: 127.0.0.1:17888
```

**排查步骤**

1. 检查服务端是否启动
2. 检查端口是否正确（17888 是 RPC 端口，不是 8800）
3. 检查防火墙是否放行端口
4. 检查网络连通性

**解决方案**

```bash
# 检查服务端进程
ps aux | grep snailjob

# 检查端口监听
netstat -tlnp | grep 17888

# 测试连通性
telnet 127.0.0.1 17888
```

### 2. 任务不执行

**可能原因**

1. 任务未注册到服务端
2. 任务被禁用
3. Cron 表达式错误
4. 客户端未正确启动

**排查步骤**

1. 登录管理后台检查任务状态
2. 检查客户端日志是否有注册信息
3. 验证 Cron 表达式

### 3. 任务执行超时

**错误现象**

```
Task execution timeout
```

**解决方案**

1. 增加任务超时时间配置
2. 优化任务执行逻辑
3. 考虑拆分为多个子任务

### 4. 数据库连接问题

**错误现象**

```
Cannot create PoolableConnectionFactory
Connection refused
```

**排查步骤**

1. 检查数据库服务是否启动
2. 检查连接配置是否正确
3. 检查数据库用户权限

```bash
# 测试数据库连接
mysql -h 127.0.0.1 -u root -p ryplus_uni_workflow
```

### 5. 内存溢出

**错误现象**

```
java.lang.OutOfMemoryError: Java heap space
```

**解决方案**

```bash
# 增加堆内存
JAVA_OPTS="-Xms1g -Xmx2g"

# 开启堆转储
JAVA_OPTS="-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/logs/"
```

## 常见问题

### Q1: 如何查看任务执行日志？

登录管理后台 → 调度历史 → 选择任务 → 查看执行日志

### Q2: 如何手动触发任务？

登录管理后台 → 任务管理 → 选择任务 → 点击"执行一次"

### Q3: 如何暂停/恢复任务？

登录管理后台 → 任务管理 → 选择任务 → 点击"暂停"或"恢复"

### Q4: 分片数如何设置？

分片数应根据客户端实例数和数据量设置，一般等于或略大于客户端实例数。

### Q5: 如何实现任务依赖？

使用工作流功能，在管理后台配置任务之间的依赖关系。

## 技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| SnailJob | 1.8.0 | 分布式任务调度框架 |
| Spring Boot | 3.5.12 | 应用基础框架 |
| MyBatis Plus | 3.5.16 | 数据持久层 |
| HikariCP | 5.x | 数据库连接池 |
| gRPC/Netty | - | RPC 通信 |
| Spring Boot Admin | 3.4.x | 应用监控 |
