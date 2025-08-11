# SnailJob任务调度模块文档

## 概述

本模块基于 [SnailJob](https://snailjob.opensnail.com/) 分布式任务调度框架，为ruoyi-plus-uniapp提供强大的定时任务和分布式任务调度能力。SnailJob是一个灵活、可靠、快速的分布式任务调度平台，支持多种任务类型和执行模式。

## 模块结构

```
ruoyi-common-job/
├── src/main/java/plus/ruoyi/common/job/
│   └── config/
│       └── SnailJobConfig.java          # SnailJob自动配置类
└── src/main/resources/META-INF/
    └── spring/
        └── org.springframework.boot.autoconfigure.AutoConfiguration.imports  # 自动配置注册
```

## 依赖说明

### Maven依赖

```xml
<dependencies>
    <!-- SnailJob客户端启动器 -->
    <dependency>
        <groupId>com.aizuda</groupId>
        <artifactId>snail-job-client-starter</artifactId>
    </dependency>
    
    <!-- SnailJob任务核心库 -->
    <dependency>
        <groupId>com.aizuda</groupId>
        <artifactId>snail-job-client-job-core</artifactId>
    </dependency>
    
    <!-- SnailJob重试核心依赖 -->
    <dependency>
        <groupId>com.aizuda</groupId>
        <artifactId>snail-job-client-retry-core</artifactId>
    </dependency>
</dependencies>
```

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

### 配置参数说明

| 参数 | 说明 | 示例值 |
|------|------|--------|
| `enabled` | 是否启用SnailJob模块 | `true`/`false` |
| `group` | 任务组名，需要在SnailJob后台预先创建 | `${app.id}` |
| `token` | 接入验证令牌，对应数据库`sj_group_config`表 | `SJ_xxxxxxxxxxxxxxxxxxxxxxxxx` |
| `server.host` | SnailJob调度中心地址 | `127.0.0.1` |
| `server.port` | SnailJob调度中心端口 | `17888` |
| `namespace` | 命名空间UUID，对应数据库`sj_namespace`表的`unique_id`字段 | `${spring.profiles.active}` |
| `port` | 客户端端口，建议随主应用端口漂移 | `2${server.port}` |
| `host` | 客户端IP指定，留空则自动获取 | 留空 |
| `rpc-type` | RPC通信类型 | `grpc`/`netty` |

### 重要说明

1. **开发环境默认关闭**：为避免开发时误触生产任务，开发环境默认 `enabled: false`
2. **生产环境启用**：生产环境设置 `enabled: true` 启用定时任务功能
3. **组管理**：使用 `${app.id}` 作为组名，需要在SnailJob后台组管理中预先创建对应的组
4. **命名空间隔离**：使用 `${spring.profiles.active}` 作为命名空间，实现不同环境的任务隔离
5. **端口配置**：客户端端口使用 `2${server.port}` 模式，避免端口冲突
6. **数据库初始化**：需要执行 `script/sql/ry_job.sql` 初始化SnailJob相关数据表

### 自动配置

模块提供了自动配置类 `SnailJobConfig`：

- **条件装配**：只有当 `snail-job.enabled=true` 时才会启用
- **自动启用**：
  - `@EnableScheduling`：启用Spring定时任务支持
  - `@EnableSnailJob`：启用SnailJob客户端
- **日志收集**：自动配置日志收集器，将应用日志发送到SnailJob服务端

## 任务开发指南

### 任务开发目录

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

使用 `@JobExecutor` 注解创建普通任务：

```java
@Component
@JobExecutor(name = "testJobExecutor")
public class TestAnnoJobExecutor {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.LOCAL.info("本地日志: {}", jobArgs.getJobParams());
        SnailJobLog.REMOTE.info("远程日志: {}", jobArgs.getJobParams());
        return ExecuteResult.success("任务执行成功");
    }
}
```

### 2. 静态分片任务

根据服务端参数进行分片处理：

```java
@Component
@JobExecutor(name = "testStaticShardingJob")
public class TestStaticShardingJob {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        String jobParams = Convert.toStr(jobArgs.getJobParams());
        String[] split = jobParams.split(",");
        Long fromId = Long.parseLong(split[0]);
        Long toId = Long.parseLong(split[1]);
        
        // 处理指定范围的数据
        processDataRange(fromId, toId);
        
        return ExecuteResult.success("分片任务执行完成");
    }
}
```

### 3. Map任务（动态分片）

只分片不关注合并结果：

```java
@Component
@JobExecutor(name = "testMapJobAnnotation")
public class TestMapJobAnnotation {

    @MapExecutor
    public ExecuteResult doJobMapExecute(MapArgs mapArgs, MapHandler mapHandler) {
        // 数据分片
        int partitionSize = 50;
        List<List<Integer>> partition = IntStream.rangeClosed(1, 200)
            .boxed()
            .collect(Collectors.groupingBy(i -> (i - 1) / partitionSize))
            .values()
            .stream()
            .toList();
            
        return mapHandler.doMap(partition, "doCalc");
    }

    @MapExecutor(taskName = "doCalc")
    public ExecuteResult doCalc(MapArgs mapArgs) {
        List<Integer> sourceList = (List<Integer>) mapArgs.getMapResult();
        int partitionTotal = sourceList.stream().mapToInt(i -> i).sum();
        SnailJobLog.REMOTE.info("分片计算结果: {}", partitionTotal);
        return ExecuteResult.success(partitionTotal);
    }
}
```

### 4. MapReduce任务

分片后合并结果：

```java
@Component
@JobExecutor(name = "testMapReduceAnnotation")
public class TestMapReduceAnnotation {

    @MapExecutor
    public ExecuteResult rootMapExecute(MapArgs mapArgs, MapHandler mapHandler) {
        // 数据分片逻辑
        List<List<Integer>> partition = createPartitions();
        return mapHandler.doMap(partition, "doCalc");
    }

    @MapExecutor(taskName = "doCalc")
    public ExecuteResult doCalc(MapArgs mapArgs) {
        // 分片计算逻辑
        List<Integer> sourceList = (List<Integer>) mapArgs.getMapResult();
        int partitionTotal = sourceList.stream().mapToInt(i -> i).sum();
        return ExecuteResult.success(partitionTotal);
    }

    @ReduceExecutor
    public ExecuteResult reduceExecute(ReduceArgs reduceArgs) {
        // 合并结果
        int reduceTotal = reduceArgs.getMapResult()
            .stream()
            .mapToInt(i -> Integer.parseInt((String) i))
            .sum();
        return ExecuteResult.success(reduceTotal);
    }
}
```

### 5. 广播任务

在所有客户端节点上执行：

```java
@Component
@JobExecutor(name = "testBroadcastJob")
public class TestBroadcastJob {

    @Value("${snail-job.port}")
    private int clientPort;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("广播任务在端口 {} 执行", clientPort);
        
        // 广播任务逻辑
        boolean success = executeBroadcastLogic();
        
        if (success) {
            return ExecuteResult.success("广播任务执行成功");
        } else {
            throw new RuntimeException("广播任务执行失败");
        }
    }
}
```

### 6. 工作流任务（DAG）

支持复杂的任务依赖关系：

```java
// 微信账单任务
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
        
        // 将结果放入上下文传递给下游任务
        jobArgs.appendContext("wechat", JsonUtils.toJsonString(billDto));
        
        return ExecuteResult.success(billDto);
    }
}

// 支付宝账单任务
@Component
@JobExecutor(name = "alipayBillTask")
public class AlipayBillTask {
    // 类似实现...
}

// 汇总任务
@Component
@JobExecutor(name = "summaryBillTask")
public class SummaryBillTask {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 从上下文获取上游任务结果
        String wechat = (String) jobArgs.getWfContext("wechat");
        String alipay = (String) jobArgs.getWfContext("alipay");
        
        // 汇总计算
        BigDecimal totalAmount = calculateTotal(wechat, alipay);
        
        return ExecuteResult.success(totalAmount);
    }
}
```

### 7. 继承方式创建任务

除了注解方式，还可以通过继承 `AbstractJobExecutor`：

```java
@Component
public class TestClassJobExecutor extends AbstractJobExecutor {

    @Override
    protected ExecuteResult doJobExecute(JobArgs jobArgs) {
        // 任务逻辑
        return ExecuteResult.success("继承方式任务执行成功");
    }
}
```

## 核心API说明

### 任务参数（JobArgs）

```java
public class JobArgs {
    private Object jobParams;           // 任务参数
    private Map<String, Object> wfContext; // 工作流上下文
    
    // 获取任务参数
    public Object getJobParams();
    
    // 获取工作流上下文
    public Map<String, Object> getWfContext();
    public Object getWfContext(String key);
    
    // 向上下文添加数据
    public void appendContext(String key, Object value);
}
```

### 执行结果（ExecuteResult）

```java
// 成功结果
ExecuteResult.success("执行成功");
ExecuteResult.success(resultData);

// 失败结果
ExecuteResult.failure("执行失败");
```

### 日志记录

```java
// 本地日志（仅在客户端记录）
SnailJobLog.LOCAL.info("本地日志信息");

// 远程日志（发送到SnailJob服务端）
SnailJobLog.REMOTE.info("远程日志信息");
SnailJobLog.REMOTE.error("错误信息", exception);
```

## 特性说明

### 1. 分布式调度
- 支持集群部署，任务在多个节点间负载均衡
- 故障转移，节点宕机时任务自动迁移

### 2. 多种任务类型
- **普通任务**：单机执行的简单任务
- **分片任务**：大数据量任务的分片并行处理
- **MapReduce任务**：支持分布式计算模式
- **广播任务**：在所有节点执行的任务
- **工作流任务**：支持DAG有向无环图的复杂任务流

### 3. 可视化管理
- Web控制台管理任务
- 实时监控任务执行状态
- 查看任务执行日志
- 任务执行历史统计

### 4. 高可用性
- 任务重试机制
- 失败告警通知
- 集群容错处理

## 最佳实践

### 1. 任务设计原则
- **幂等性**：确保任务可以重复执行而不产生副作用
- **无状态**：任务不应依赖本地状态
- **异常处理**：妥善处理异常情况

### 2. 性能优化
- 合理设置分片大小
- 避免长时间运行的任务
- 使用异步处理提高吞吐量

### 3. 监控告警
- 关键任务设置失败告警
- 监控任务执行时间
- 定期检查任务执行状态

## 常见问题

### Q: 如何调试任务？
A: 可以使用 `SnailJobLog.LOCAL` 记录本地调试日志，或通过Web控制台查看 `SnailJobLog.REMOTE` 远程日志。

### Q: 任务执行失败如何处理？
A:
1. 检查任务逻辑是否正确
2. 查看异常日志定位问题
3. 确保任务具有幂等性
4. 配置合适的重试次数

### Q: 如何处理大数据量任务？
A: 使用分片任务或MapReduce任务，将大任务分解为多个小任务并行处理。

### Q: 工作流任务如何传递数据？
A: 通过 `jobArgs.appendContext(key, value)` 向上下文添加数据，下游任务通过 `jobArgs.getWfContext(key)` 获取。

## 相关链接

- [SnailJob官方文档](https://snailjob.opensnail.com/)
