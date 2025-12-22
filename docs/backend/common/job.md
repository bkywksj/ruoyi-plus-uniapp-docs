# SnailJob任务调度模块文档

## 概述

本模块基于 [SnailJob](https://snailjob.opensnail.com/) 分布式任务调度框架，为RuoYi-Plus-UniApp提供强大的定时任务和分布式任务调度能力。SnailJob是一个灵活、可靠、快速的分布式任务调度平台，支持多种任务类型和执行模式。

**核心特性：**

- **分布式调度** - 支持集群部署，任务在多个节点间负载均衡
- **多种任务类型** - 普通任务、分片任务、MapReduce任务、广播任务、工作流任务
- **高可用性** - 任务重试机制、故障转移、集群容错
- **可视化管理** - Web控制台管理任务、实时监控、日志查看
- **灵活配置** - 支持Cron表达式、固定频率、固定延迟等多种触发策略
- **日志收集** - 自动配置日志收集器，将任务日志发送到调度中心

## 模块架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    SnailJob 任务调度架构                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐   │
│  │   SnailJob      │     │        Application Server        │   │
│  │   Server        │────▶│  ┌─────────────────────────────┐ │   │
│  │  (调度中心)      │     │  │   JobAutoConfiguration      │ │   │
│  │                 │     │  │  ┌──────────────────────┐   │ │   │
│  │  ├─ 任务管理     │     │  │  │ @EnableScheduling    │   │ │   │
│  │  ├─ 调度引擎     │     │  │  │ @EnableSnailJob      │   │ │   │
│  │  ├─ 日志收集     │◀───│  │  │ SnailLogbackAppender │   │ │   │
│  │  └─ 监控统计     │     │  │  └──────────────────────┘   │ │   │
│  └─────────────────┘     │  └─────────────────────────────┘ │   │
│                          │                                   │   │
│                          │  ┌─────────────────────────────┐ │   │
│                          │  │      Job Executors          │ │   │
│                          │  │  ┌────────┐ ┌────────────┐  │ │   │
│                          │  │  │ Normal │ │ Sharding   │  │ │   │
│                          │  │  │ Job    │ │ Job        │  │ │   │
│                          │  │  └────────┘ └────────────┘  │ │   │
│                          │  │  ┌────────┐ ┌────────────┐  │ │   │
│                          │  │  │ Map    │ │ Broadcast  │  │ │   │
│                          │  │  │ Reduce │ │ Job        │  │ │   │
│                          │  │  └────────┘ └────────────┘  │ │   │
│                          │  └─────────────────────────────┘ │   │
│                          └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 模块结构

```
ruoyi-common-job/
├── src/main/java/plus/ruoyi/common/job/
│   └── config/
│       └── JobAutoConfiguration.java      # SnailJob自动配置类
└── src/main/resources/META-INF/
    └── spring/
        └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

## 依赖说明

### Maven依赖

```xml
<dependencies>
    <!-- 核心模块 - 提供基础功能支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>

    <!-- Spring Boot自动配置 - 提供自动配置与条件装配能力 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-autoconfigure</artifactId>
    </dependency>

    <!-- SnailJob客户端启动器 - 提供任务调度客户端能力 -->
    <dependency>
        <groupId>com.aizuda</groupId>
        <artifactId>snail-job-client-starter</artifactId>
    </dependency>

    <!-- SnailJob任务核心库 - 定义任务执行与管理接口 -->
    <dependency>
        <groupId>com.aizuda</groupId>
        <artifactId>snail-job-client-job-core</artifactId>
    </dependency>

    <!-- SnailJob重试核心依赖 - 提供任务重试机制 -->
    <dependency>
        <groupId>com.aizuda</groupId>
        <artifactId>snail-job-client-retry-core</artifactId>
    </dependency>
</dependencies>
```

### 依赖组件说明

| 组件 | 说明 | 功能 |
|------|------|------|
| `snail-job-client-starter` | 客户端启动器 | 提供SnailJob客户端自动配置 |
| `snail-job-client-job-core` | 任务核心库 | 定义任务执行器接口、注解、参数模型 |
| `snail-job-client-retry-core` | 重试核心库 | 提供任务失败重试机制 |

## 自动配置机制

### JobAutoConfiguration

模块提供了自动配置类 `JobAutoConfiguration`，基于Spring Boot自动配置机制实现：

```java
@AutoConfiguration
@ConditionalOnProperty(prefix = "snail-job", name = "enabled", havingValue = "true")
@EnableScheduling
@EnableSnailJob
public class JobAutoConfiguration {

    /**
     * SnailJob客户端启动事件监听器
     * 在SnailJob客户端启动时自动配置日志收集器
     */
    @EventListener(SnailClientStartingEvent.class)
    public void onStarting(SnailClientStartingEvent event) {
        // 获取Logback日志上下文
        LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();

        // 创建SnailJob专用的日志追加器
        SnailLogbackAppender<ILoggingEvent> ca = new SnailLogbackAppender<>();
        ca.setName("snail_log_appender");
        ca.start();

        // 将日志追加器添加到根日志记录器
        Logger rootLogger = lc.getLogger(Logger.ROOT_LOGGER_NAME);
        rootLogger.addAppender(ca);
    }
}
```

**配置装配条件：**

| 注解 | 说明 |
|------|------|
| `@AutoConfiguration` | 标记为Spring Boot自动配置类 |
| `@ConditionalOnProperty(prefix = "snail-job", name = "enabled", havingValue = "true")` | 仅当`snail-job.enabled=true`时启用 |
| `@EnableScheduling` | 启用Spring定时任务支持 |
| `@EnableSnailJob` | 启用SnailJob客户端 |

**日志收集机制：**

自动配置类监听 `SnailClientStartingEvent` 事件，在SnailJob客户端启动时自动配置Logback日志追加器。通过 `SnailLogbackAppender` 将应用程序日志发送到SnailJob调度中心，实现任务执行日志的统一管理和查看。

## 配置说明

### 环境配置

#### 开发环境配置（application-dev.yml）

```yaml
################## 定时任务配置 ##################
--- # snail-job 配置
snail-job:
  # 是否启用定时任务
  enabled: false
  # 需要在 SnailJob 后台组管理创建对应名称的组,然后创建任务的时候选择对应的组,才能正确分派任务
  group: ${app.id}
  # SnailJob 接入验证令牌 详见 script/sql/ry_job.sql `sj_group_config` 表
  token: "SJ_xxxxxxxxxxxxxxxxxxxxxxxxx"
  server:
    # 调度中心地址
    host: 127.0.0.1
    # 调度中心端口
    port: 17888
  # 命名空间UUID 详见 script/sql/ry_job.sql `sj_namespace`表`unique_id`字段
  namespace: ${spring.profiles.active}
  # 随主应用端口漂移
  port: 2${server.port}
  # 客户端ip指定
  host:
  # RPC类型: netty, grpc
  rpc-type: grpc
```

#### 生产环境配置（application-prod.yml）

```yaml
################## 定时任务配置 ##################
--- # snail-job 配置
snail-job:
  # 生产环境启用定时任务
  enabled: true
  # 需要在 SnailJob 后台组管理创建对应名称的组,然后创建任务的时候选择对应的组,才能正确分派任务
  group: ${app.id}
  # SnailJob 接入验证令牌 详见 script/sql/ry_job.sql `sj_group_config`表
  token: "SJ_xxxxxxxxxxxxxxxxxxxxxxxxx"
  server:
    # 调度中心地址
    host: 127.0.0.1
    # 调度中心端口
    port: 17888
  # 命名空间UUID 详见 script/sql/ry_job.sql `sj_namespace`表`unique_id`字段
  namespace: ${spring.profiles.active}
  # 随主应用端口漂移
  port: 2${server.port}
  # 客户端ip指定
  host:
  # RPC类型: netty, grpc
  rpc-type: grpc
```

### 配置参数详解

| 参数 | 说明 | 类型 | 默认值 | 示例 |
|------|------|------|--------|------|
| `enabled` | 是否启用SnailJob模块 | `boolean` | `false` | `true` |
| `group` | 任务组名，需要在后台预先创建 | `string` | - | `${app.id}` |
| `token` | 接入验证令牌 | `string` | - | `SJ_xxxx...` |
| `server.host` | SnailJob调度中心地址 | `string` | - | `127.0.0.1` |
| `server.port` | SnailJob调度中心端口 | `int` | - | `17888` |
| `namespace` | 命名空间UUID | `string` | - | `${spring.profiles.active}` |
| `port` | 客户端端口 | `string` | - | `2${server.port}` |
| `host` | 客户端IP指定 | `string` | 自动获取 | 留空 |
| `rpc-type` | RPC通信类型 | `string` | - | `grpc`/`netty` |

### 重要配置说明

1. **开发环境默认关闭**：为避免开发时误触生产任务，开发环境默认 `enabled: false`

2. **生产环境启用**：生产环境设置 `enabled: true` 启用定时任务功能

3. **组管理**：使用 `${app.id}` 作为组名，需要在SnailJob后台组管理中预先创建对应的组

4. **命名空间隔离**：使用 `${spring.profiles.active}` 作为命名空间，实现不同环境的任务隔离

5. **端口配置**：客户端端口使用 `2${server.port}` 模式，避免端口冲突

6. **数据库初始化**：需要执行 `script/sql/ry_job.sql` 初始化SnailJob相关数据表

### RPC类型选择

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `grpc` | 基于gRPC协议通信 | 推荐使用，性能更好，支持双向流 |
| `netty` | 基于Netty的自定义协议 | 轻量级场景 |

## 任务开发指南

### 任务开发目录结构

建议在业务模块中创建任务类：

```
plus.ruoyi.business.job/
├── normal/        # 普通任务
├── sharding/      # 分片任务
├── mapreduce/     # MapReduce任务
├── broadcast/     # 广播任务
└── workflow/      # 工作流任务
```

### 1. 普通任务

使用 `@JobExecutor` 注解创建普通任务，适用于简单的单机定时任务：

```java
@Component
@JobExecutor(name = "testJobExecutor")
public class TestAnnoJobExecutor {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 获取任务参数
        String params = Convert.toStr(jobArgs.getJobParams());

        // 本地日志 - 仅在客户端记录
        SnailJobLog.LOCAL.info("本地日志: {}", params);
        // 远程日志 - 发送到SnailJob服务端
        SnailJobLog.REMOTE.info("远程日志: {}", params);

        // 执行业务逻辑
        doBusinessLogic(params);

        return ExecuteResult.success("任务执行成功");
    }

    private void doBusinessLogic(String params) {
        // 业务处理逻辑
    }
}
```

**注解说明：**

| 属性 | 说明 | 必填 |
|------|------|------|
| `name` | 任务执行器名称，需要在后台配置时使用 | 是 |

### 2. 静态分片任务

根据服务端参数进行分片处理，适用于需要按固定范围处理数据的场景：

```java
@Component
@JobExecutor(name = "testStaticShardingJob")
public class TestStaticShardingJob {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 解析分片参数，格式: "startId,endId"
        String jobParams = Convert.toStr(jobArgs.getJobParams());
        String[] split = jobParams.split(",");
        Long fromId = Long.parseLong(split[0]);
        Long toId = Long.parseLong(split[1]);

        SnailJobLog.REMOTE.info("处理数据范围: {} - {}", fromId, toId);

        // 处理指定范围的数据
        int processed = processDataRange(fromId, toId);

        return ExecuteResult.success("处理完成，共处理 " + processed + " 条数据");
    }

    private int processDataRange(Long fromId, Long toId) {
        // 查询并处理指定范围的数据
        int count = 0;
        // 业务处理逻辑
        return count;
    }
}
```

**后台配置示例：**

在SnailJob后台创建多个任务实例，分别配置不同的分片参数：
- 实例1：`1,10000`
- 实例2：`10001,20000`
- 实例3：`20001,30000`

### 3. Map任务（动态分片）

Map任务只分片不关注合并结果，适用于需要动态分片并行处理的场景：

```java
@Component
@JobExecutor(name = "testMapJobAnnotation")
public class TestMapJobAnnotation {

    /**
     * Map阶段 - 数据分片
     */
    @MapExecutor
    public ExecuteResult doJobMapExecute(MapArgs mapArgs, MapHandler mapHandler) {
        // 动态创建分片数据
        int partitionSize = 50;
        List<List<Integer>> partition = IntStream.rangeClosed(1, 200)
            .boxed()
            .collect(Collectors.groupingBy(i -> (i - 1) / partitionSize))
            .values()
            .stream()
            .toList();

        SnailJobLog.REMOTE.info("创建了 {} 个分片", partition.size());

        // 分发到子任务执行
        return mapHandler.doMap(partition, "doCalc");
    }

    /**
     * 子任务 - 处理单个分片
     */
    @MapExecutor(taskName = "doCalc")
    public ExecuteResult doCalc(MapArgs mapArgs) {
        @SuppressWarnings("unchecked")
        List<Integer> sourceList = (List<Integer>) mapArgs.getMapResult();

        // 处理分片数据
        int partitionTotal = sourceList.stream().mapToInt(i -> i).sum();

        SnailJobLog.REMOTE.info("分片计算结果: {}", partitionTotal);

        return ExecuteResult.success(partitionTotal);
    }
}
```

### 4. MapReduce任务

MapReduce任务支持分片后合并结果，适用于需要汇总各分片结果的场景：

```java
@Component
@JobExecutor(name = "testMapReduceAnnotation")
public class TestMapReduceAnnotation {

    /**
     * Map阶段 - 数据分片
     */
    @MapExecutor
    public ExecuteResult rootMapExecute(MapArgs mapArgs, MapHandler mapHandler) {
        // 创建分片数据
        List<List<Integer>> partition = createPartitions();

        SnailJobLog.REMOTE.info("创建了 {} 个分片", partition.size());

        return mapHandler.doMap(partition, "doCalc");
    }

    /**
     * 子任务 - 处理单个分片
     */
    @MapExecutor(taskName = "doCalc")
    public ExecuteResult doCalc(MapArgs mapArgs) {
        @SuppressWarnings("unchecked")
        List<Integer> sourceList = (List<Integer>) mapArgs.getMapResult();

        // 分片计算
        int partitionTotal = sourceList.stream().mapToInt(i -> i).sum();

        return ExecuteResult.success(partitionTotal);
    }

    /**
     * Reduce阶段 - 合并结果
     */
    @ReduceExecutor
    public ExecuteResult reduceExecute(ReduceArgs reduceArgs) {
        // 获取所有分片的计算结果
        List<?> mapResults = reduceArgs.getMapResult();

        // 合并结果
        int reduceTotal = mapResults.stream()
            .mapToInt(i -> Integer.parseInt((String) i))
            .sum();

        SnailJobLog.REMOTE.info("Reduce汇总结果: {}", reduceTotal);

        return ExecuteResult.success(reduceTotal);
    }

    private List<List<Integer>> createPartitions() {
        int partitionSize = 50;
        return IntStream.rangeClosed(1, 200)
            .boxed()
            .collect(Collectors.groupingBy(i -> (i - 1) / partitionSize))
            .values()
            .stream()
            .toList();
    }
}
```

### 5. 广播任务

广播任务会在所有客户端节点上执行，适用于需要在所有节点同步执行的场景：

```java
@Component
@JobExecutor(name = "testBroadcastJob")
public class TestBroadcastJob {

    @Value("${snail-job.port}")
    private int clientPort;

    @Value("${server.port}")
    private int serverPort;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("广播任务在节点执行 - 客户端端口: {}, 服务端口: {}",
            clientPort, serverPort);

        // 广播任务逻辑 - 例如清理本地缓存
        boolean success = clearLocalCache();

        if (success) {
            return ExecuteResult.success("广播任务执行成功");
        } else {
            throw new RuntimeException("广播任务执行失败");
        }
    }

    private boolean clearLocalCache() {
        // 清理本地缓存逻辑
        return true;
    }
}
```

**广播任务适用场景：**

- 缓存刷新：所有节点同步刷新本地缓存
- 配置更新：所有节点重新加载配置
- 健康检查：检查所有节点的服务状态

### 6. 工作流任务（DAG）

工作流任务支持复杂的任务依赖关系，通过有向无环图（DAG）定义任务执行顺序：

```java
/**
 * 微信账单任务 - 工作流节点1
 */
@Component
@JobExecutor(name = "wechatBillTask")
public class WechatBillTask {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        BillDto billDto = new BillDto();
        billDto.setBillChannel("wechat");

        // 从工作流上下文获取参数
        String settlementDate = (String) jobArgs.getWfContext().get("settlementDate");
        if (StrUtil.equals(settlementDate, "sysdate")) {
            settlementDate = DateUtil.today();
        }
        billDto.setBillDate(settlementDate);
        billDto.setBillAmount(new BigDecimal("1234.56"));

        SnailJobLog.REMOTE.info("微信账单处理完成: {}", billDto);

        // 将结果放入上下文传递给下游任务
        jobArgs.appendContext("wechat", JsonUtils.toJsonString(billDto));

        return ExecuteResult.success(billDto);
    }
}

/**
 * 支付宝账单任务 - 工作流节点2
 */
@Component
@JobExecutor(name = "alipayBillTask")
public class AlipayBillTask {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        BillDto billDto = new BillDto();
        billDto.setBillChannel("alipay");

        String settlementDate = (String) jobArgs.getWfContext().get("settlementDate");
        if (StrUtil.equals(settlementDate, "sysdate")) {
            settlementDate = DateUtil.today();
        }
        billDto.setBillDate(settlementDate);
        billDto.setBillAmount(new BigDecimal("5678.90"));

        SnailJobLog.REMOTE.info("支付宝账单处理完成: {}", billDto);

        jobArgs.appendContext("alipay", JsonUtils.toJsonString(billDto));

        return ExecuteResult.success(billDto);
    }
}

/**
 * 账单汇总任务 - 工作流终节点
 */
@Component
@JobExecutor(name = "summaryBillTask")
public class SummaryBillTask {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 从上下文获取上游任务结果
        String wechatJson = (String) jobArgs.getWfContext("wechat");
        String alipayJson = (String) jobArgs.getWfContext("alipay");

        BillDto wechatBill = JsonUtils.parseObject(wechatJson, BillDto.class);
        BillDto alipayBill = JsonUtils.parseObject(alipayJson, BillDto.class);

        // 汇总计算
        BigDecimal totalAmount = wechatBill.getBillAmount()
            .add(alipayBill.getBillAmount());

        SnailJobLog.REMOTE.info("账单汇总完成，总金额: {}", totalAmount);

        return ExecuteResult.success(totalAmount);
    }
}
```

**工作流上下文传递：**

| 方法 | 说明 |
|------|------|
| `jobArgs.getWfContext()` | 获取完整的工作流上下文Map |
| `jobArgs.getWfContext(key)` | 根据key获取上下文数据 |
| `jobArgs.appendContext(key, value)` | 向上下文添加数据，传递给下游任务 |

### 7. 继承方式创建任务

除了注解方式，还可以通过继承 `AbstractJobExecutor` 创建任务：

```java
@Component
public class TestClassJobExecutor extends AbstractJobExecutor {

    @Override
    protected ExecuteResult doJobExecute(JobArgs jobArgs) {
        String params = Convert.toStr(jobArgs.getJobParams());

        SnailJobLog.REMOTE.info("继承方式任务执行，参数: {}", params);

        // 任务逻辑
        doTask(params);

        return ExecuteResult.success("继承方式任务执行成功");
    }

    private void doTask(String params) {
        // 业务处理
    }
}
```

## 核心API详解

### 任务参数（JobArgs）

`JobArgs` 是任务执行时传入的参数对象，包含任务参数和工作流上下文：

```java
public class JobArgs {
    /** 任务参数 - 在后台配置任务时设置 */
    private Object jobParams;

    /** 工作流上下文 - 用于工作流任务间数据传递 */
    private Map<String, Object> wfContext;

    /**
     * 获取任务参数
     * @return 任务参数对象
     */
    public Object getJobParams();

    /**
     * 获取工作流上下文
     * @return 完整的上下文Map
     */
    public Map<String, Object> getWfContext();

    /**
     * 根据key获取工作流上下文数据
     * @param key 上下文key
     * @return 对应的值
     */
    public Object getWfContext(String key);

    /**
     * 向上下文添加数据
     * @param key 键
     * @param value 值
     */
    public void appendContext(String key, Object value);
}
```

### 执行结果（ExecuteResult）

`ExecuteResult` 用于返回任务执行结果：

```java
// 成功结果 - 无返回数据
ExecuteResult.success();

// 成功结果 - 携带消息
ExecuteResult.success("执行成功");

// 成功结果 - 携带数据
ExecuteResult.success(resultData);

// 失败结果
ExecuteResult.failure();

// 失败结果 - 携带消息
ExecuteResult.failure("执行失败：参数错误");

// 失败结果 - 携带异常
ExecuteResult.failure(exception);
```

### 日志记录（SnailJobLog）

SnailJob提供两种日志记录方式：

```java
// 本地日志 - 仅在客户端记录，不发送到调度中心
SnailJobLog.LOCAL.debug("调试信息: {}", data);
SnailJobLog.LOCAL.info("本地日志信息: {}", data);
SnailJobLog.LOCAL.warn("警告信息: {}", data);
SnailJobLog.LOCAL.error("错误信息: {}", data);

// 远程日志 - 发送到SnailJob调度中心，可在Web控制台查看
SnailJobLog.REMOTE.debug("调试信息: {}", data);
SnailJobLog.REMOTE.info("远程日志信息: {}", data);
SnailJobLog.REMOTE.warn("警告信息: {}", data);
SnailJobLog.REMOTE.error("错误信息", exception);
```

**日志使用建议：**

- 开发调试阶段使用 `LOCAL` 日志
- 生产环境关键信息使用 `REMOTE` 日志
- 异常信息建议同时记录本地和远程

### Map/Reduce相关API

```java
// MapArgs - Map阶段参数
public class MapArgs {
    /** 获取分片数据 */
    public Object getMapResult();
}

// MapHandler - 分片处理器
public interface MapHandler {
    /**
     * 执行数据分片
     * @param data 要分片的数据列表
     * @param taskName 子任务名称
     * @return 执行结果
     */
    ExecuteResult doMap(List<?> data, String taskName);
}

// ReduceArgs - Reduce阶段参数
public class ReduceArgs {
    /** 获取所有Map任务的结果列表 */
    public List<?> getMapResult();
}
```

## Cron表达式参考

SnailJob支持标准的Cron表达式，用于配置任务触发时间：

### Cron表达式格式

```
秒 分 时 日 月 周 [年]
```

| 字段 | 允许值 | 允许特殊字符 |
|------|--------|--------------|
| 秒 | 0-59 | `, - * /` |
| 分 | 0-59 | `, - * /` |
| 时 | 0-23 | `, - * /` |
| 日 | 1-31 | `, - * / ? L W` |
| 月 | 1-12 或 JAN-DEC | `, - * /` |
| 周 | 1-7 或 SUN-SAT | `, - * / ? L #` |
| 年（可选） | 1970-2099 | `, - * /` |

### 常用Cron表达式示例

| 表达式 | 说明 |
|--------|------|
| `0 0 * * * ?` | 每小时执行一次 |
| `0 0 0 * * ?` | 每天凌晨执行 |
| `0 0 0 1 * ?` | 每月1号凌晨执行 |
| `0 0 0 ? * MON` | 每周一凌晨执行 |
| `0 0/30 * * * ?` | 每30分钟执行一次 |
| `0 0 8-18 * * ?` | 每天8点到18点，每小时执行 |
| `0 0 0 L * ?` | 每月最后一天凌晨执行 |
| `0 0 10,14,16 * * ?` | 每天10点、14点、16点执行 |

## 任务重试机制

SnailJob提供完善的任务重试机制，通过 `snail-job-client-retry-core` 组件实现：

### 重试配置

在后台创建任务时可配置：

| 配置项 | 说明 |
|--------|------|
| 重试次数 | 任务失败后最大重试次数 |
| 重试间隔 | 每次重试之间的等待时间 |
| 重试策略 | 固定间隔、指数退避等 |

### 重试最佳实践

1. **确保任务幂等性**：重试可能导致任务多次执行，需确保不会产生副作用

2. **合理设置重试次数**：根据任务重要性设置，一般3-5次

3. **设置合适的重试间隔**：避免频繁重试对系统造成压力

4. **记录重试日志**：便于问题排查

```java
@Component
@JobExecutor(name = "retryableJob")
public class RetryableJob {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        try {
            // 业务逻辑
            doBusinessLogic();
            return ExecuteResult.success();
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("任务执行失败，等待重试", e);
            // 抛出异常触发重试
            throw e;
        }
    }
}
```

## 特性说明

### 1. 分布式调度

- **集群部署**：支持多实例部署，任务在节点间负载均衡
- **故障转移**：节点宕机时任务自动迁移到其他节点
- **任务锁定**：通过分布式锁确保同一任务不会重复执行

### 2. 多种任务类型

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| 普通任务 | 单机执行的简单任务 | 简单的定时任务 |
| 分片任务 | 大数据量任务的分片并行处理 | 数据批处理 |
| MapReduce任务 | 支持分布式计算模式 | 数据汇总计算 |
| 广播任务 | 在所有节点执行的任务 | 缓存刷新、配置同步 |
| 工作流任务 | 支持DAG有向无环图的复杂任务流 | 多步骤依赖任务 |

### 3. 可视化管理

- **Web控制台**：通过Web界面管理任务
- **实时监控**：查看任务执行状态和进度
- **日志查看**：在线查看任务执行日志
- **历史统计**：任务执行历史和统计分析

### 4. 高可用性

- **任务重试**：失败任务自动重试
- **失败告警**：支持配置告警通知
- **集群容错**：节点故障自动恢复

## 最佳实践

### 1. 任务设计原则

**幂等性设计：**

```java
@Component
@JobExecutor(name = "idempotentJob")
public class IdempotentJob {

    @Autowired
    private OrderService orderService;

    @Autowired
    private RedissonClient redissonClient;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        String orderId = Convert.toStr(jobArgs.getJobParams());

        // 使用分布式锁确保幂等性
        RLock lock = redissonClient.getLock("job:order:" + orderId);
        if (lock.tryLock()) {
            try {
                // 检查是否已处理
                if (orderService.isProcessed(orderId)) {
                    return ExecuteResult.success("订单已处理，跳过");
                }

                // 处理订单
                orderService.processOrder(orderId);

                return ExecuteResult.success("处理成功");
            } finally {
                lock.unlock();
            }
        } else {
            return ExecuteResult.success("任务正在执行中，跳过");
        }
    }
}
```

### 2. 异常处理

```java
@Component
@JobExecutor(name = "exceptionHandlingJob")
public class ExceptionHandlingJob {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        try {
            // 业务逻辑
            doBusinessLogic();
            return ExecuteResult.success();
        } catch (BusinessException e) {
            // 业务异常 - 记录日志但不重试
            SnailJobLog.REMOTE.warn("业务异常: {}", e.getMessage());
            return ExecuteResult.failure(e.getMessage());
        } catch (Exception e) {
            // 系统异常 - 记录日志并触发重试
            SnailJobLog.REMOTE.error("系统异常", e);
            throw e;
        }
    }
}
```

### 3. 性能优化

- **合理设置分片大小**：避免分片过大或过小
- **避免长时间运行**：将大任务拆分为多个小任务
- **使用异步处理**：提高吞吐量
- **批量操作**：减少数据库交互次数

### 4. 监控告警

- **关键任务设置失败告警**
- **监控任务执行时间**
- **定期检查任务执行状态**
- **设置任务超时告警**

## 常见问题

### Q1: 任务执行失败如何排查？

**排查步骤：**

1. 登录SnailJob Web控制台查看任务执行日志
2. 检查客户端应用日志
3. 确认任务参数配置是否正确
4. 检查网络连接是否正常

### Q2: 如何调试任务？

**调试方法：**

1. 使用 `SnailJobLog.LOCAL` 记录本地调试日志
2. 通过Web控制台查看 `SnailJobLog.REMOTE` 远程日志
3. 在开发环境单独测试任务逻辑
4. 使用断点调试任务执行过程

### Q3: 如何处理大数据量任务？

**解决方案：**

使用分片任务或MapReduce任务，将大任务分解为多个小任务并行处理：

```java
@Component
@JobExecutor(name = "bigDataJob")
public class BigDataJob {

    @MapExecutor
    public ExecuteResult map(MapArgs mapArgs, MapHandler mapHandler) {
        // 查询总数据量
        long total = queryTotalCount();

        // 按每页1000条分片
        int pageSize = 1000;
        List<int[]> partitions = new ArrayList<>();
        for (int i = 0; i < total; i += pageSize) {
            partitions.add(new int[]{i, Math.min(i + pageSize, (int)total)});
        }

        return mapHandler.doMap(partitions, "processPage");
    }

    @MapExecutor(taskName = "processPage")
    public ExecuteResult processPage(MapArgs mapArgs) {
        int[] range = (int[]) mapArgs.getMapResult();
        // 处理指定范围的数据
        processDataInRange(range[0], range[1]);
        return ExecuteResult.success();
    }
}
```

### Q4: 工作流任务如何传递数据？

**数据传递方式：**

通过 `jobArgs.appendContext(key, value)` 向上下文添加数据，下游任务通过 `jobArgs.getWfContext(key)` 获取：

```java
// 上游任务
jobArgs.appendContext("result", JsonUtils.toJsonString(data));

// 下游任务
String json = (String) jobArgs.getWfContext("result");
MyData data = JsonUtils.parseObject(json, MyData.class);
```

### Q5: 客户端无法连接调度中心？

**检查清单：**

1. 确认 `snail-job.server.host` 和 `snail-job.server.port` 配置正确
2. 检查网络连通性
3. 确认调度中心服务已启动
4. 检查 `snail-job.token` 是否匹配
5. 确认 `snail-job.namespace` 配置正确

### Q6: 任务重复执行怎么办？

**解决方案：**

1. 确保任务具有幂等性
2. 使用分布式锁防止并发执行
3. 在业务层面做去重处理
4. 检查调度配置是否正确

## SnailJob服务端部署

### 服务端架构

SnailJob服务端是独立部署的调度中心，负责任务的调度、分发和监控。项目中提供了定制化的服务端模块 `ruoyi-snailjob-server`。

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SnailJob 服务端架构                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   ruoyi-snailjob-server                     │   │
│   │  ┌─────────────────────────────────────────────────────┐    │   │
│   │  │              SnailJobServer.java                     │    │   │
│   │  │  • 启动入口类                                        │    │   │
│   │  │  • 集成 SnailJobServerApplication                    │    │   │
│   │  │  • 自定义启动日志输出                                │    │   │
│   │  └─────────────────────────────────────────────────────┘    │   │
│   │                                                             │   │
│   │  ┌─────────────────────────────────────────────────────┐    │   │
│   │  │              SecurityConfig.java                     │    │   │
│   │  │  • Actuator端点认证                                  │    │   │
│   │  │  • HTTP Basic认证过滤器                              │    │   │
│   │  └─────────────────────────────────────────────────────┘    │   │
│   │                                                             │   │
│   │  ┌─────────────────────────────────────────────────────┐    │   │
│   │  │              ActuatorAuthFilter.java                 │    │   │
│   │  │  • 监控端点安全过滤                                  │    │   │
│   │  │  • 用户名密码校验                                    │    │   │
│   │  └─────────────────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                     配置文件结构                             │   │
│   │  ├── application.yml        # 主配置（端口、日志等）        │   │
│   │  ├── application-dev.yml    # 开发环境（数据库、服务端配置）│   │
│   │  ├── application-prod.yml   # 生产环境配置                  │   │
│   │  └── logback-plus.xml       # 日志配置                      │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 服务端启动类

```java
/**
 * 任务调度服务端启动程序
 * SnailJob Server
 *
 * @author opensnail
 * @date 2024-05-17
 */
@SpringBootApplication
public class SnailJobServer {

    public static void main(String[] args) {
        // 启动Spring Boot应用并获取应用上下文
        ConfigurableApplicationContext context = SpringApplication.run(
            com.aizuda.snailjob.server.SnailJobServerApplication.class, args);

        // 获取环境配置
        Environment env = context.getEnvironment();

        ThreadUtil.sleep(1000);
        // 打印启动成功信息
        System.out.printf(
            "\n(✨◠‿◠)ﾉ♪♫ %s 启动成功！环境: %s 地址: http://127.0.0.1:%s%s\n\n",
            env.getProperty("spring.application.name"),
            Arrays.toString(env.getActiveProfiles()),
            env.getProperty("server.port"),
            env.getProperty("server.servlet.context-path"));
    }
}
```

### 服务端主配置

```yaml
# ======================================
# Snail Job 服务器主配置文件
# ======================================

# 服务器配置
server:
  # 服务端口
  port: ${SERVER_PORT:8800}
  servlet:
    # 应用上下文路径
    context-path: /snail-job

# Spring 基础配置
spring:
  application:
    # 应用名称
    name: ruoyi-snailjob-server
  profiles:
    # 激活的配置文件（使用环境变量）
    active: @profiles.active@
  web:
    resources:
      # 静态资源路径（Web控制台）
      static-locations: classpath:admin/

# MyBatis Plus 配置
mybatis-plus:
  typeAliasesPackage: com.aizuda.snailjob.template.datasource.persistence.po
  global-config:
    db-config:
      # 查询条件策略：非空字段才参与查询
      where-strategy: NOT_EMPTY
      # 关闭大写命名
      capital-mode: false
      # 逻辑删除值
      logic-delete-value: 1
      # 逻辑未删除值
      logic-not-delete-value: 0
  configuration:
    # 下划线转驼峰命名
    map-underscore-to-camel-case: true
    # 启用二级缓存
    cache-enabled: true

# 日志配置
logging:
  # 日志配置文件
  config: classpath:logback-plus.xml
  level:
    # SnailJob包的日志级别
    com.aizuda.snailjob: ${LOG_LEVEL:info}

# Spring Boot Actuator 监控端点配置
management:
  endpoints:
    web:
      exposure:
        # 暴露所有端点
        include: '*'
  endpoint:
    health:
      # 健康检查显示详细信息
      show-details: ALWAYS
    logfile:
      # 外部日志文件路径
      external-file: ./logs/ruoyi-snailjob-server/console.log
```

### 服务端高级配置

```yaml
# ======================================
# Snail Job 服务端高级配置
# ======================================

--- # snail-job 服务端配置
snail-job:
  # 服务端节点IP（默认按照NetUtil.getLocalIpStr()自动获取）
  server-host:
  # 服务端端口号
  server-port: ${SNAILJOB_SERVER_PORT:17888}
  # 合并日志默认保存天数
  merge-Log-days: 1
  # 合并日志默认的条数
  merge-Log-num: 500
  # 配置每批次拉取重试数据的大小
  retry-pull-page-size: 100
  # 配置日志保存时间（单位：天）
  log-storage: 7
  # bucket的总数量（用于分布式调度）
  bucket-total: 128
  # Dashboard 任务容错天数
  summary-day: 7
  # 配置负载均衡周期时间（秒）
  load-balance-cycle-time: 10
  # 重试任务拉取的并行度
  retry-max-pull-parallel: 2
```

### 服务端配置参数说明

| 参数 | 说明 | 默认值 | 建议值 |
|------|------|--------|--------|
| `server-host` | 服务端节点IP | 自动获取 | 集群环境需指定 |
| `server-port` | 服务端RPC端口 | `17888` | 保持默认 |
| `merge-Log-days` | 合并日志保存天数 | `1` | 根据日志量调整 |
| `merge-Log-num` | 合并日志条数阈值 | `500` | 500-1000 |
| `retry-pull-page-size` | 重试数据拉取批次大小 | `100` | 50-200 |
| `log-storage` | 日志保存天数 | `7` | 生产环境可延长 |
| `bucket-total` | 分布式调度桶数量 | `128` | 2的幂次方 |
| `summary-day` | Dashboard统计天数 | `7` | 7-30 |
| `load-balance-cycle-time` | 负载均衡周期（秒） | `10` | 10-30 |
| `retry-max-pull-parallel` | 重试任务并行度 | `2` | CPU核心数/2 |

## 数据库配置

### HikariCP连接池配置

```yaml
# 数据库配置
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://${SNAILJOB_DB_HOST:127.0.0.1}:${SNAILJOB_DB_PORT:3306}/${SNAILJOB_DB_NAME:ryplus_uni_workflow}?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: ${SNAILJOB_DB_USERNAME:root}
    password: ${SNAILJOB_DB_PASSWORD:root}
    # HikariCP 连接池配置
    hikari:
      # 连接超时时间（毫秒）
      connection-timeout: 30000
      # 连接验证超时时间（毫秒）
      validation-timeout: 5000
      # 最小空闲连接数
      minimum-idle: 10
      # 最大连接池大小
      maximum-pool-size: 20
      # 空闲连接超时时间（毫秒）
      idle-timeout: 600000
      # 连接最大生命周期（毫秒）
      max-lifetime: 900000
      # 连接保活时间（毫秒）
      keepaliveTime: 30000
```

### 连接池参数说明

| 参数 | 说明 | 默认值 | 建议值 |
|------|------|--------|--------|
| `connection-timeout` | 获取连接超时时间 | `30000ms` | 30秒 |
| `validation-timeout` | 连接验证超时时间 | `5000ms` | 5秒 |
| `minimum-idle` | 最小空闲连接数 | `10` | 与CPU核心相关 |
| `maximum-pool-size` | 最大连接池大小 | `20` | 最小空闲的2倍 |
| `idle-timeout` | 空闲连接超时 | `600000ms` | 10分钟 |
| `max-lifetime` | 连接最大生命周期 | `900000ms` | 15分钟 |
| `keepaliveTime` | 连接保活时间 | `30000ms` | 30秒 |

### 数据库优化建议

1. **索引优化**：确保任务表的关键字段有索引

```sql
-- 任务表索引
CREATE INDEX idx_job_status ON sj_job(job_status);
CREATE INDEX idx_job_next_trigger_time ON sj_job(next_trigger_time);
CREATE INDEX idx_job_group_name ON sj_job(group_name);

-- 日志表索引
CREATE INDEX idx_job_log_job_id ON sj_job_log(job_id);
CREATE INDEX idx_job_log_create_dt ON sj_job_log(create_dt);
```

2. **定期清理历史数据**：

```sql
-- 清理30天前的日志数据
DELETE FROM sj_job_log WHERE create_dt < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 清理已完成的重试任务
DELETE FROM sj_retry_task WHERE retry_status = 2 AND create_dt < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

## 监控与安全配置

### Spring Boot Admin集成

```yaml
--- # Spring Boot Admin 监控中心配置
spring.boot.admin.client:
  # 是否启用监控客户端
  enabled: ${MONITOR_ENABLED:false}
  # 监控中心地址
  url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
  instance:
    # 服务主机类型
    service-host-type: IP
    metadata:
      # 监控认证用户名
      username: ${MONITOR_USERNAME:ruoyi}
      # 监控认证密码
      userpassword: ${MONITOR_PASSWORD:123456}
  # 监控用户名
  username: ${MONITOR_USERNAME:ruoyi}
  # 监控密码
  password: ${MONITOR_PASSWORD:123456}
```

### Actuator端点安全配置

项目提供了Actuator端点的安全认证配置：

```java
/**
 * 安全配置类
 * 用于配置Actuator端点的认证过滤器
 *
 * @author Lion Li
 */
@Configuration
public class SecurityConfig {

    @Value("${spring.boot.admin.client.username}")
    private String username;

    @Value("${spring.boot.admin.client.password}")
    private String password;

    /**
     * 注册Actuator认证过滤器
     * 为/actuator路径及其子路径添加HTTP Basic认证
     */
    @Bean
    public FilterRegistrationBean<ActuatorAuthFilter> actuatorFilterRegistrationBean() {
        FilterRegistrationBean<ActuatorAuthFilter> registrationBean =
            new FilterRegistrationBean<>();

        // 创建认证过滤器实例
        registrationBean.setFilter(new ActuatorAuthFilter(username, password));

        // 设置过滤器拦截的URL模式
        registrationBean.addUrlPatterns("/actuator", "/actuator/*");

        return registrationBean;
    }
}
```

### 监控指标说明

| 端点 | 路径 | 说明 |
|------|------|------|
| 健康检查 | `/actuator/health` | 服务健康状态 |
| 信息 | `/actuator/info` | 应用信息 |
| 指标 | `/actuator/metrics` | 性能指标数据 |
| 日志文件 | `/actuator/logfile` | 在线查看日志 |
| 环境 | `/actuator/env` | 环境变量信息 |

## 集群部署架构

### 高可用部署方案

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SnailJob 高可用集群架构                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                        ┌─────────────────┐                          │
│                        │   负载均衡器     │                          │
│                        │   (Nginx/SLB)   │                          │
│                        └────────┬────────┘                          │
│                                 │                                   │
│           ┌────────────────────┼────────────────────┐               │
│           │                    │                    │               │
│   ┌───────▼───────┐    ┌───────▼───────┐    ┌───────▼───────┐       │
│   │  SnailJob     │    │  SnailJob     │    │  SnailJob     │       │
│   │  Server-1     │    │  Server-2     │    │  Server-3     │       │
│   │  :8800        │    │  :8800        │    │  :8800        │       │
│   │  :17888       │    │  :17888       │    │  :17888       │       │
│   └───────┬───────┘    └───────┬───────┘    └───────┬───────┘       │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                    │
│                      ┌─────────▼─────────┐                          │
│                      │   MySQL集群        │                          │
│                      │   (主从复制)       │                          │
│                      └───────────────────┘                          │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    应用服务集群                               │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │   │
│   │  │ App-1   │  │ App-2   │  │ App-3   │  │ App-N   │         │   │
│   │  │ Client  │  │ Client  │  │ Client  │  │ Client  │         │   │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 集群配置要点

1. **服务端集群配置**：

```yaml
snail-job:
  # 集群环境必须指定服务端IP
  server-host: 192.168.1.100
  server-port: 17888
  # 增加bucket数量以支持更多节点
  bucket-total: 256
```

2. **客户端多服务端配置**：

```yaml
snail-job:
  enabled: true
  group: ${app.id}
  token: "SJ_xxxxxxxxxxxxxxxxxxxxxxxxx"
  server:
    # 多服务端地址（逗号分隔）
    host: 192.168.1.100,192.168.1.101,192.168.1.102
    port: 17888
```

3. **Nginx负载均衡配置**：

```nginx
upstream snailjob_servers {
    server 192.168.1.100:8800 weight=1;
    server 192.168.1.101:8800 weight=1;
    server 192.168.1.102:8800 weight=1;
}

server {
    listen 80;
    server_name snailjob.example.com;

    location / {
        proxy_pass http://snailjob_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 性能调优指南

### 1. JVM参数优化

```bash
# 生产环境JVM参数建议
JAVA_OPTS="-Xms2g -Xmx2g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/logs/heapdump.hprof \
  -XX:+PrintGCDetails \
  -XX:+PrintGCDateStamps \
  -Xloggc:/logs/gc.log"
```

### 2. 任务执行优化

```java
/**
 * 高性能任务示例
 * 采用批量处理和异步执行
 */
@Component
@JobExecutor(name = "highPerformanceJob")
public class HighPerformanceJob {

    @Autowired
    private ThreadPoolTaskExecutor taskExecutor;

    @Autowired
    private DataService dataService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 获取分页参数
        int pageSize = 1000;
        int totalPages = dataService.getTotalPages(pageSize);

        // 使用CompletableFuture并行处理
        List<CompletableFuture<Integer>> futures = new ArrayList<>();

        for (int page = 0; page < totalPages; page++) {
            final int currentPage = page;
            CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
                List<Data> dataList = dataService.getPageData(currentPage, pageSize);
                return processBatch(dataList);
            }, taskExecutor);
            futures.add(future);
        }

        // 等待所有任务完成
        int totalProcessed = futures.stream()
            .map(CompletableFuture::join)
            .mapToInt(Integer::intValue)
            .sum();

        SnailJobLog.REMOTE.info("处理完成，共处理 {} 条数据", totalProcessed);

        return ExecuteResult.success("处理完成: " + totalProcessed);
    }

    private int processBatch(List<Data> dataList) {
        // 批量处理逻辑
        dataService.batchUpdate(dataList);
        return dataList.size();
    }
}
```

### 3. 线程池配置

```java
@Configuration
public class TaskExecutorConfig {

    @Bean("jobTaskExecutor")
    public ThreadPoolTaskExecutor jobTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // 核心线程数
        executor.setCorePoolSize(Runtime.getRuntime().availableProcessors());
        // 最大线程数
        executor.setMaxPoolSize(Runtime.getRuntime().availableProcessors() * 2);
        // 队列容量
        executor.setQueueCapacity(500);
        // 线程名前缀
        executor.setThreadNamePrefix("job-task-");
        // 拒绝策略：调用者运行
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

### 4. 数据库批量操作

```java
/**
 * 批量数据处理任务
 * 使用MyBatis-Plus批量插入
 */
@Component
@JobExecutor(name = "batchInsertJob")
public class BatchInsertJob {

    @Autowired
    private DataMapper dataMapper;

    private static final int BATCH_SIZE = 1000;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        List<Data> allData = generateData();

        // 分批处理
        List<List<Data>> batches = Lists.partition(allData, BATCH_SIZE);

        int inserted = 0;
        for (List<Data> batch : batches) {
            // 使用批量插入
            dataMapper.insertBatch(batch);
            inserted += batch.size();

            SnailJobLog.REMOTE.info("已插入 {} 条数据", inserted);
        }

        return ExecuteResult.success("批量插入完成: " + inserted);
    }
}
```

## 日志配置详解

### Logback配置示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 日志存储路径 -->
    <property name="log.path" value="./logs/ruoyi-snailjob-server"/>

    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${log.path}/console.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/%d{yyyy-MM-dd}/console.%i.log.gz</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 任务执行日志 -->
    <appender name="JOB_LOG" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${log.path}/job-execute.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/%d{yyyy-MM-dd}/job-execute.%i.log.gz</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- SnailJob日志级别 -->
    <logger name="com.aizuda.snailjob" level="INFO"/>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### 日志分类说明

| 日志类型 | 文件路径 | 说明 |
|----------|----------|------|
| 控制台日志 | `console.log` | 服务端运行日志 |
| 任务执行日志 | `job-execute.log` | 任务执行详细日志 |
| GC日志 | `gc.log` | JVM垃圾回收日志 |
| 错误日志 | `error.log` | 错误级别日志 |

## 环境变量配置

### 服务端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SERVER_PORT` | HTTP服务端口 | `8800` |
| `SNAILJOB_SERVER_PORT` | RPC服务端口 | `17888` |
| `SNAILJOB_DB_HOST` | 数据库主机 | `127.0.0.1` |
| `SNAILJOB_DB_PORT` | 数据库端口 | `3306` |
| `SNAILJOB_DB_NAME` | 数据库名称 | `ryplus_uni_workflow` |
| `SNAILJOB_DB_USERNAME` | 数据库用户名 | `root` |
| `SNAILJOB_DB_PASSWORD` | 数据库密码 | `root` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `MONITOR_ENABLED` | 监控开关 | `false` |
| `MONITOR_URL` | 监控中心地址 | `http://127.0.0.1:9090/admin` |
| `MONITOR_USERNAME` | 监控用户名 | `ruoyi` |
| `MONITOR_PASSWORD` | 监控密码 | `123456` |

### Docker部署配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  snailjob-server:
    image: ruoyi/snailjob-server:latest
    container_name: snailjob-server
    ports:
      - "8800:8800"
      - "17888:17888"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SNAILJOB_DB_HOST=mysql
      - SNAILJOB_DB_PORT=3306
      - SNAILJOB_DB_NAME=ryplus_uni_workflow
      - SNAILJOB_DB_USERNAME=root
      - SNAILJOB_DB_PASSWORD=root123
      - LOG_LEVEL=info
    volumes:
      - ./logs:/logs
    depends_on:
      - mysql
    networks:
      - ruoyi-network

  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root123
      - MYSQL_DATABASE=ryplus_uni_workflow
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - ruoyi-network

volumes:
  mysql-data:

networks:
  ruoyi-network:
    driver: bridge
```

## 实战案例

### 案例1：订单超时自动取消

```java
/**
 * 订单超时取消任务
 * 每分钟执行一次，取消超过30分钟未支付的订单
 */
@Component
@JobExecutor(name = "orderTimeoutCancelJob")
public class OrderTimeoutCancelJob {

    @Autowired
    private OrderService orderService;

    @Autowired
    private RedissonClient redissonClient;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 获取超时时间参数（分钟）
        int timeoutMinutes = Convert.toInt(jobArgs.getJobParams(), 30);

        SnailJobLog.REMOTE.info("开始处理超时订单，超时时间: {} 分钟", timeoutMinutes);

        // 查询超时未支付订单
        LocalDateTime deadline = LocalDateTime.now().minusMinutes(timeoutMinutes);
        List<Order> timeoutOrders = orderService.findUnpaidOrdersBefore(deadline);

        if (CollUtil.isEmpty(timeoutOrders)) {
            return ExecuteResult.success("无超时订单");
        }

        int cancelCount = 0;
        for (Order order : timeoutOrders) {
            // 使用分布式锁防止并发处理
            String lockKey = "order:cancel:" + order.getOrderNo();
            RLock lock = redissonClient.getLock(lockKey);

            try {
                if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                    try {
                        // 再次检查订单状态
                        if (orderService.isUnpaid(order.getOrderNo())) {
                            orderService.cancelOrder(order.getOrderNo(), "超时自动取消");
                            cancelCount++;
                            SnailJobLog.REMOTE.info("订单已取消: {}", order.getOrderNo());
                        }
                    } finally {
                        lock.unlock();
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                SnailJobLog.REMOTE.warn("订单取消中断: {}", order.getOrderNo());
            }
        }

        String message = String.format("处理完成，共取消 %d 个超时订单", cancelCount);
        SnailJobLog.REMOTE.info(message);

        return ExecuteResult.success(message);
    }
}
```

### 案例2：数据同步任务

```java
/**
 * 数据同步任务
 * 使用MapReduce模式并行同步数据
 */
@Component
@JobExecutor(name = "dataSyncJob")
public class DataSyncJob {

    @Autowired
    private DataSyncService dataSyncService;

    /**
     * Map阶段 - 分片数据
     */
    @MapExecutor
    public ExecuteResult mapExecute(MapArgs mapArgs, MapHandler mapHandler) {
        // 获取需要同步的数据源列表
        List<String> dataSources = dataSyncService.getDataSources();

        SnailJobLog.REMOTE.info("开始数据同步，数据源数量: {}", dataSources.size());

        // 按数据源分片
        return mapHandler.doMap(dataSources, "syncDataSource");
    }

    /**
     * 子任务 - 同步单个数据源
     */
    @MapExecutor(taskName = "syncDataSource")
    public ExecuteResult syncDataSource(MapArgs mapArgs) {
        String dataSource = (String) mapArgs.getMapResult();

        SnailJobLog.REMOTE.info("开始同步数据源: {}", dataSource);

        try {
            int syncCount = dataSyncService.syncFromSource(dataSource);

            SnailJobLog.REMOTE.info("数据源 {} 同步完成，同步数量: {}", dataSource, syncCount);

            return ExecuteResult.success(syncCount);
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("数据源 {} 同步失败", dataSource, e);
            throw e;
        }
    }

    /**
     * Reduce阶段 - 汇总结果
     */
    @ReduceExecutor
    public ExecuteResult reduceExecute(ReduceArgs reduceArgs) {
        List<?> results = reduceArgs.getMapResult();

        int totalSync = results.stream()
            .mapToInt(r -> Integer.parseInt(String.valueOf(r)))
            .sum();

        String message = String.format("数据同步完成，共同步 %d 条数据", totalSync);
        SnailJobLog.REMOTE.info(message);

        return ExecuteResult.success(message);
    }
}
```

### 案例3：报表生成任务

```java
/**
 * 日报生成任务
 * 工作流模式：数据采集 -> 数据处理 -> 报表生成 -> 邮件发送
 */
@Component
@JobExecutor(name = "dailyReportCollectTask")
public class DailyReportCollectTask {

    @Autowired
    private ReportDataService reportDataService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 获取报表日期
        String reportDate = (String) jobArgs.getWfContext().get("reportDate");
        if (StrUtil.isEmpty(reportDate)) {
            reportDate = DateUtil.format(DateUtil.yesterday(), "yyyy-MM-dd");
        }

        SnailJobLog.REMOTE.info("开始采集 {} 的数据", reportDate);

        // 采集数据
        Map<String, Object> rawData = reportDataService.collectData(reportDate);

        // 将原始数据放入上下文
        jobArgs.appendContext("rawData", JsonUtils.toJsonString(rawData));
        jobArgs.appendContext("reportDate", reportDate);

        return ExecuteResult.success("数据采集完成");
    }
}

@Component
@JobExecutor(name = "dailyReportProcessTask")
public class DailyReportProcessTask {

    @Autowired
    private ReportDataService reportDataService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        String rawDataJson = (String) jobArgs.getWfContext("rawData");
        Map<String, Object> rawData = JsonUtils.parseMap(rawDataJson);

        SnailJobLog.REMOTE.info("开始处理数据");

        // 数据处理
        Map<String, Object> processedData = reportDataService.processData(rawData);

        // 将处理后的数据放入上下文
        jobArgs.appendContext("processedData", JsonUtils.toJsonString(processedData));

        return ExecuteResult.success("数据处理完成");
    }
}

@Component
@JobExecutor(name = "dailyReportGenerateTask")
public class DailyReportGenerateTask {

    @Autowired
    private ReportGenerateService reportGenerateService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        String processedDataJson = (String) jobArgs.getWfContext("processedData");
        String reportDate = (String) jobArgs.getWfContext("reportDate");

        Map<String, Object> processedData = JsonUtils.parseMap(processedDataJson);

        SnailJobLog.REMOTE.info("开始生成报表");

        // 生成报表
        String reportPath = reportGenerateService.generateReport(reportDate, processedData);

        // 将报表路径放入上下文
        jobArgs.appendContext("reportPath", reportPath);

        return ExecuteResult.success("报表生成完成: " + reportPath);
    }
}

@Component
@JobExecutor(name = "dailyReportSendTask")
public class DailyReportSendTask {

    @Autowired
    private MailService mailService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        String reportPath = (String) jobArgs.getWfContext("reportPath");
        String reportDate = (String) jobArgs.getWfContext("reportDate");

        SnailJobLog.REMOTE.info("开始发送报表邮件");

        // 发送邮件
        mailService.sendReportEmail(
            "daily-report@example.com",
            "日报 - " + reportDate,
            "请查收附件中的日报。",
            reportPath
        );

        return ExecuteResult.success("报表邮件发送完成");
    }
}
```

## 故障排查指南

### 1. 任务不执行排查

**检查步骤：**

1. 确认客户端配置
   - `snail-job.enabled` 是否为 `true`
   - `snail-job.group` 是否与服务端配置一致
   - `snail-job.token` 是否正确

2. 检查网络连通性
   ```bash
   telnet <server-host> 17888
   ```

3. 查看客户端日志
   - 搜索 `SnailJob` 相关日志
   - 检查是否有连接失败信息

4. 检查任务执行器
   - 确认 `@JobExecutor` 注解的 `name` 与后台配置一致
   - 确认任务类被Spring容器管理

### 2. 任务执行失败排查

**检查步骤：**

1. 查看服务端Web控制台
   - 任务执行日志
   - 错误信息

2. 检查客户端日志
   - `SnailJobLog.REMOTE` 输出
   - 异常堆栈信息

3. 检查任务逻辑
   - 是否有空指针异常
   - 是否有数据库连接问题
   - 是否有超时问题

### 3. 服务端启动失败排查

**常见问题：**

1. 端口被占用
   ```bash
   netstat -ano | findstr 8800
   netstat -ano | findstr 17888
   ```

2. 数据库连接失败
   - 检查数据库配置
   - 检查数据库服务状态
   - 检查用户权限

3. 内存不足
   - 增加JVM内存参数
   - 检查系统可用内存

### 4. 日志查看命令

```bash
# 实时查看服务端日志
tail -f ./logs/ruoyi-snailjob-server/console.log

# 搜索错误日志
grep -n "ERROR" ./logs/ruoyi-snailjob-server/console.log

# 查看任务执行日志
tail -f ./logs/ruoyi-snailjob-server/job-execute.log

# 按时间范围查看日志
sed -n '/2025-01-01 10:00/,/2025-01-01 11:00/p' console.log
```
