# 定时任务最佳实践

## 概述

定时任务是企业级应用中实现自动化处理的核心功能。RuoYi-Plus框架集成了SnailJob分布式任务调度框架，提供了一套完整的定时任务解决方案，支持任务的分布式调度、失败重试、日志追踪等高级特性，能够满足大多数企业的自动化任务需求。

### 核心特性

- **分布式调度** - 基于SnailJob实现跨节点的任务调度和负载均衡
- **任务管理** - 提供Web控制台，支持任务的创建、修改、暂停、删除
- **失败重试** - 内置失败重试机制，支持自定义重试策略
- **日志追踪** - 统一的任务执行日志收集和查看
- **动态配置** - 支持运行时动态调整任务参数和执行时间
- **可视化监控** - 提供任务执行状态的实时监控和统计

### 适用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| 数据同步 | 定期同步外部系统数据 | 每小时同步第三方平台订单 |
| 报表生成 | 定时生成业务报表 | 每日凌晨生成销售日报 |
| 数据清理 | 清理过期或无效数据 | 每周清理30天前的日志 |
| 消息推送 | 定时发送通知消息 | 每天9点发送待办提醒 |
| 缓存刷新 | 定期更新缓存数据 | 每5分钟刷新热点数据缓存 |
| 状态检查 | 定期检查系统状态 | 每分钟检查订单超时状态 |

## 架构设计

### 整体架构

SnailJob分布式任务调度系统由以下核心组件构成：

```text
┌─────────────────────────────────────────────────────────────┐
│                     SnailJob Server                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  调度中心                            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐            │   │
│  │  │ 任务管理 │  │ 调度引擎 │  │ 日志管理 │            │   │
│  │  └─────────┘  └─────────┘  └─────────┘            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐            │   │
│  │  │ 执行器管理│  │ 重试管理 │  │ 告警服务 │            │   │
│  │  └─────────┘  └─────────┘  └─────────┘            │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                    Netty 通信                               │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Client 节点1 │  │ Client 节点2 │  │ Client 节点N │
│ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │
│ │执行器容器│ │  │ │执行器容器│ │  │ │执行器容器│ │
│ │ ┌─────┐ │ │  │ │ ┌─────┐ │ │  │ │ ┌─────┐ │ │
│ │ │Job A│ │ │  │ │ │Job B│ │ │  │ │ │Job C│ │ │
│ │ └─────┘ │ │  │ │ └─────┘ │ │  │ │ └─────┘ │ │
│ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │
└─────────────┘  └─────────────┘  └─────────────┘
```

### 核心组件

| 组件 | 职责 | 位置 |
|------|------|------|
| `SnailJob Server` | 任务调度中心，负责任务管理和分发 | ruoyi-snailjob-server |
| `SnailJob Client` | 任务执行器，负责接收和执行任务 | ruoyi-common-job |
| `@JobExecutor` | 任务执行器注解，标记任务执行方法 | 业务模块 |
| `JobArgs` | 任务执行参数，包含任务上下文信息 | SnailJob SDK |
| `ExecuteResult` | 任务执行结果，返回执行状态和消息 | SnailJob SDK |
| `SnailJobLog` | 任务日志工具，支持本地和远程日志 | SnailJob SDK |

### 执行流程

```text
1. 调度时间到达
       │
       ▼
2. Server 查询待执行任务
       │
       ▼
3. 选择执行节点（负载均衡）
       │
       ▼
4. 发送任务执行指令
       │
       ▼
5. Client 接收任务
       │
       ▼
6. 查找对应 JobExecutor
       │
       ▼
7. 执行任务业务逻辑
       │
       ├── 成功 ──► 返回成功结果
       │
       └── 失败 ──► 触发重试机制
                       │
                       ▼
                  达到最大重试次数？
                       │
                       ├── 否 ──► 重新调度执行
                       │
                       └── 是 ──► 标记任务失败
```

## 配置说明

### 客户端配置

在`application-dev.yml`中配置SnailJob客户端：

```yaml
# snail-job 配置
snail-job:
  # 是否启用定时任务
  enabled: ${SNAIL_JOB_ENABLED:false}
  # 组名称，需要在SnailJob后台创建对应的组
  group: ${app.id}
  # 接入验证令牌
  token: ${SNAIL_JOB_TOKEN:SJ_cKqBTPzCsWA3VyuCfFoccmuIEGXjr5KT}
  server:
    # 调度中心地址
    host: ${SNAIL_JOB_HOST:127.0.0.1}
    # 调度中心端口
    port: ${SNAIL_JOB_PORT:17888}
```

### 服务端配置

在`ruoyi-snailjob-server`模块的`application-dev.yml`中：

```yaml
# snail-job 服务端配置
snail-job:
  # 服务端节点IP（默认自动获取）
  server-host:
  # 服务端端口号
  server-port: ${SNAILJOB_SERVER_PORT:17888}
  # 合并日志默认保存天数
  merge-Log-days: 1
  # 合并日志默认的条数
  merge-Log-num: 500
  # 配置每批次拉取重试数据的大小
  retry-pull-page-size: 100
  # 分区数量（用于并行处理）
  bucket-count: 32
  # 回调最大重试次数
  callback-max-retry: 3
```

### 自动配置类

框架提供了`JobAutoConfiguration`自动配置类：

```java
@AutoConfiguration
@ConditionalOnProperty(prefix = "snail-job", name = "enabled", havingValue = "true")
@EnableScheduling
@EnableSnailJob
public class JobAutoConfiguration {

    /**
     * SnailJob 客户端启动事件监听器
     * 配置日志收集器，将日志发送到调度中心
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

## 任务开发

### @JobExecutor注解

使用`@JobExecutor`注解标记任务执行器：

```java
/**
 * 示例任务执行器
 */
@Component
@JobExecutor(name = "testJobExecutor")
public class TestAnnoJobExecutor {

    /**
     * 任务执行方法
     * 方法名固定为 jobExecute，参数为 JobArgs
     *
     * @param jobArgs 任务参数
     * @return 执行结果
     */
    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 本地日志
        SnailJobLog.LOCAL.info("任务开始执行, jobArgs: {}",
            JsonUtil.toJsonString(jobArgs));

        // 远程日志（发送到调度中心）
        SnailJobLog.REMOTE.info("任务开始执行, jobArgs: {}",
            JsonUtil.toJsonString(jobArgs));

        // 执行业务逻辑
        try {
            doBusinessLogic(jobArgs);
            return ExecuteResult.success("执行成功");
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("任务执行失败", e);
            return ExecuteResult.failure("执行失败: " + e.getMessage());
        }
    }

    private void doBusinessLogic(JobArgs jobArgs) {
        // 业务逻辑实现
    }
}
```

### JobArgs参数

`JobArgs`包含任务执行的上下文信息：

```java
public class JobArgs {
    /** 任务ID */
    private Long jobId;

    /** 任务批次ID */
    private Long taskBatchId;

    /** 任务实例ID */
    private Long taskId;

    /** 任务名称 */
    private String jobName;

    /** 执行器名称 */
    private String executorInfo;

    /** 任务参数（JSON格式） */
    private String jobParams;

    /** 重试次数 */
    private Integer retryCount;

    /** 分片参数 */
    private ShardingContext shardingContext;
}
```

### ExecuteResult返回值

任务执行必须返回`ExecuteResult`对象：

```java
// 成功
return ExecuteResult.success();
return ExecuteResult.success("执行成功，处理了100条数据");

// 失败
return ExecuteResult.failure();
return ExecuteResult.failure("执行失败: 数据库连接异常");

// 带数据的结果
return ExecuteResult.success().setResult("处理结果数据");
```

### 任务日志

SnailJob提供两种日志记录方式：

```java
// 本地日志 - 输出到应用日志文件
SnailJobLog.LOCAL.info("本地日志信息");
SnailJobLog.LOCAL.error("本地错误日志", exception);

// 远程日志 - 发送到调度中心，可在Web控制台查看
SnailJobLog.REMOTE.info("远程日志信息");
SnailJobLog.REMOTE.error("远程错误日志", exception);
```

## 任务类型

### 1. 普通定时任务

最常见的定时任务类型，按固定时间或间隔执行：

```java
@Component
@JobExecutor(name = "dailyReportJob")
public class DailyReportJobExecutor {

    @Autowired
    private ReportService reportService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("开始生成日报...");

        try {
            // 获取任务参数
            String params = jobArgs.getJobParams();
            ReportConfig config = JsonUtil.parseObject(params, ReportConfig.class);

            // 生成报表
            Report report = reportService.generateDailyReport(config);

            SnailJobLog.REMOTE.info("日报生成完成，报表ID: {}", report.getId());
            return ExecuteResult.success("报表生成成功");

        } catch (Exception e) {
            SnailJobLog.REMOTE.error("日报生成失败", e);
            return ExecuteResult.failure(e.getMessage());
        }
    }
}
```

### 2. 数据清理任务

定期清理过期数据：

```java
@Component
@JobExecutor(name = "dataCleanupJob")
public class DataCleanupJobExecutor {

    @Autowired
    private LogMapper logMapper;

    @Autowired
    private TempFileMapper tempFileMapper;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("开始数据清理任务...");

        int totalDeleted = 0;

        try {
            // 清理30天前的操作日志
            int logDeleted = logMapper.deleteByCreateTimeBefore(
                LocalDateTime.now().minusDays(30)
            );
            SnailJobLog.REMOTE.info("清理操作日志: {} 条", logDeleted);
            totalDeleted += logDeleted;

            // 清理7天前的临时文件
            int fileDeleted = tempFileMapper.deleteExpiredFiles(
                LocalDateTime.now().minusDays(7)
            );
            SnailJobLog.REMOTE.info("清理临时文件: {} 条", fileDeleted);
            totalDeleted += fileDeleted;

            return ExecuteResult.success("清理完成，共删除 " + totalDeleted + " 条数据");

        } catch (Exception e) {
            SnailJobLog.REMOTE.error("数据清理失败", e);
            return ExecuteResult.failure(e.getMessage());
        }
    }
}
```

### 3. 数据同步任务

同步外部系统数据：

```java
@Component
@JobExecutor(name = "orderSyncJob")
public class OrderSyncJobExecutor {

    @Autowired
    private ThirdPartyOrderClient orderClient;

    @Autowired
    private OrderService orderService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("开始订单同步任务...");

        try {
            // 解析同步参数
            SyncParams params = JsonUtil.parseObject(
                jobArgs.getJobParams(), SyncParams.class);

            // 获取需要同步的时间范围
            LocalDateTime startTime = params.getStartTime();
            LocalDateTime endTime = params.getEndTime();

            // 从第三方平台拉取订单
            List<ThirdPartyOrder> orders = orderClient.fetchOrders(startTime, endTime);
            SnailJobLog.REMOTE.info("拉取到 {} 条订单", orders.size());

            // 批量同步到本地
            int syncCount = 0;
            for (ThirdPartyOrder order : orders) {
                try {
                    orderService.syncOrder(order);
                    syncCount++;
                } catch (Exception e) {
                    SnailJobLog.REMOTE.warn("订单 {} 同步失败: {}",
                        order.getOrderNo(), e.getMessage());
                }
            }

            SnailJobLog.REMOTE.info("订单同步完成，成功 {} 条，失败 {} 条",
                syncCount, orders.size() - syncCount);

            return ExecuteResult.success(String.format("同步完成: %d/%d",
                syncCount, orders.size()));

        } catch (Exception e) {
            SnailJobLog.REMOTE.error("订单同步失败", e);
            return ExecuteResult.failure(e.getMessage());
        }
    }
}
```

### 4. 分片任务

处理大量数据时，使用分片提高效率：

```java
@Component
@JobExecutor(name = "batchProcessJob")
public class BatchProcessJobExecutor {

    @Autowired
    private DataMapper dataMapper;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 获取分片信息
        ShardingContext sharding = jobArgs.getShardingContext();
        int shardIndex = sharding.getShardIndex();  // 当前分片索引
        int shardTotal = sharding.getShardTotal();  // 分片总数

        SnailJobLog.REMOTE.info("分片任务开始，分片: {}/{}",
            shardIndex + 1, shardTotal);

        try {
            // 根据分片获取数据
            // 例如：按ID取模分片
            List<Data> dataList = dataMapper.selectBySharding(shardIndex, shardTotal);

            SnailJobLog.REMOTE.info("分片 {} 获取数据 {} 条",
                shardIndex, dataList.size());

            // 处理数据
            int processedCount = 0;
            for (Data data : dataList) {
                processData(data);
                processedCount++;

                // 每处理100条记录一次日志
                if (processedCount % 100 == 0) {
                    SnailJobLog.REMOTE.info("分片 {} 已处理 {} 条",
                        shardIndex, processedCount);
                }
            }

            return ExecuteResult.success(String.format("分片 %d 处理完成: %d 条",
                shardIndex, processedCount));

        } catch (Exception e) {
            SnailJobLog.REMOTE.error("分片 {} 处理失败", shardIndex, e);
            return ExecuteResult.failure(e.getMessage());
        }
    }

    private void processData(Data data) {
        // 数据处理逻辑
    }
}
```

### 5. 状态检查任务

定期检查和更新数据状态：

```java
@Component
@JobExecutor(name = "orderStatusCheckJob")
public class OrderStatusCheckJobExecutor {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderService orderService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("开始订单状态检查...");

        try {
            // 查询超时未支付的订单（30分钟）
            List<Order> timeoutOrders = orderMapper.selectTimeoutUnpaidOrders(
                LocalDateTime.now().minusMinutes(30)
            );

            SnailJobLog.REMOTE.info("发现 {} 个超时订单", timeoutOrders.size());

            int cancelledCount = 0;
            for (Order order : timeoutOrders) {
                try {
                    orderService.cancelOrder(order.getId(), "支付超时自动取消");
                    cancelledCount++;
                } catch (Exception e) {
                    SnailJobLog.REMOTE.warn("订单 {} 取消失败: {}",
                        order.getOrderNo(), e.getMessage());
                }
            }

            // 查询发货超时的订单（7天）
            List<Order> shippingTimeoutOrders = orderMapper.selectShippingTimeoutOrders(
                LocalDateTime.now().minusDays(7)
            );

            SnailJobLog.REMOTE.info("发现 {} 个发货超时订单", shippingTimeoutOrders.size());

            // 发送提醒通知
            for (Order order : shippingTimeoutOrders) {
                orderService.sendShippingReminder(order);
            }

            return ExecuteResult.success(String.format(
                "检查完成: 取消超时订单 %d 个，发送发货提醒 %d 个",
                cancelledCount, shippingTimeoutOrders.size()));

        } catch (Exception e) {
            SnailJobLog.REMOTE.error("订单状态检查失败", e);
            return ExecuteResult.failure(e.getMessage());
        }
    }
}
```

## Cron表达式

### 常用表达式

| 表达式 | 说明 |
|--------|------|
| `0 0 0 * * ?` | 每天凌晨0点 |
| `0 0 1 * * ?` | 每天凌晨1点 |
| `0 30 8 * * ?` | 每天上午8:30 |
| `0 0 */2 * * ?` | 每2小时执行一次 |
| `0 */30 * * * ?` | 每30分钟执行一次 |
| `0 0/5 * * * ?` | 每5分钟执行一次 |
| `0 0 0 ? * MON` | 每周一凌晨0点 |
| `0 0 0 1 * ?` | 每月1号凌晨0点 |
| `0 0 0 L * ?` | 每月最后一天凌晨0点 |
| `0 0 0 ? * 6L` | 每月最后一个周五凌晨0点 |

### 表达式格式

```text
秒 分 时 日 月 周 [年]
┬  ┬  ┬  ┬  ┬  ┬
│  │  │  │  │  │
│  │  │  │  │  └── 周（1-7，1=周日，或 SUN-SAT）
│  │  │  │  └───── 月（1-12，或 JAN-DEC）
│  │  │  └──────── 日（1-31）
│  │  └─────────── 时（0-23）
│  └────────────── 分（0-59）
└───────────────── 秒（0-59）
```

### 特殊字符

| 字符 | 说明 | 示例 |
|------|------|------|
| `*` | 所有值 | `* * * * * ?` 每秒执行 |
| `?` | 不指定值（日/周二选一） | `0 0 0 ? * MON` |
| `-` | 范围 | `0 0 9-17 * * ?` 9-17点每小时 |
| `,` | 列表 | `0 0 8,12,18 * * ?` 8/12/18点 |
| `/` | 间隔 | `0 0/30 * * * ?` 每30分钟 |
| `L` | 最后 | `0 0 0 L * ?` 每月最后一天 |
| `W` | 最近工作日 | `0 0 0 15W * ?` 每月15号最近工作日 |
| `#` | 第几个周几 | `0 0 0 ? * 6#3` 每月第三个周五 |

## 最佳实践

### 1. 合理设置任务超时时间

```java
@Component
@JobExecutor(name = "longRunningJob")
public class LongRunningJobExecutor {

    // 在SnailJob控制台配置任务超时时间
    // 默认任务超时时间可能不够，需要根据实际情况调整

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        long startTime = System.currentTimeMillis();

        try {
            // 执行长时间任务
            processLargeData();

            long duration = System.currentTimeMillis() - startTime;
            SnailJobLog.REMOTE.info("任务执行完成，耗时: {}ms", duration);

            return ExecuteResult.success();
        } catch (Exception e) {
            return ExecuteResult.failure(e.getMessage());
        }
    }
}
```

### 2. 防止任务重复执行

```java
@Component
@JobExecutor(name = "uniqueJob")
public class UniqueJobExecutor {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private static final String LOCK_KEY_PREFIX = "job:lock:";
    private static final long LOCK_EXPIRE_SECONDS = 300;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        String lockKey = LOCK_KEY_PREFIX + jobArgs.getJobId();

        // 尝试获取分布式锁
        Boolean locked = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, "1", LOCK_EXPIRE_SECONDS, TimeUnit.SECONDS);

        if (!Boolean.TRUE.equals(locked)) {
            SnailJobLog.REMOTE.warn("任务正在执行中，跳过本次调度");
            return ExecuteResult.success("任务跳过: 上次执行未完成");
        }

        try {
            // 执行任务逻辑
            doJob();
            return ExecuteResult.success();
        } finally {
            // 释放锁
            redisTemplate.delete(lockKey);
        }
    }
}
```

### 3. 任务幂等性设计

```java
@Component
@JobExecutor(name = "idempotentJob")
public class IdempotentJobExecutor {

    @Autowired
    private JobRecordMapper jobRecordMapper;

    @Autowired
    @Lazy
    private IdempotentJobExecutor self;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        Long taskBatchId = jobArgs.getTaskBatchId();

        // 检查任务是否已执行
        JobRecord record = jobRecordMapper.selectByTaskBatchId(taskBatchId);
        if (record != null && "SUCCESS".equals(record.getStatus())) {
            SnailJobLog.REMOTE.info("任务已执行成功，跳过重复执行");
            return ExecuteResult.success("任务已执行");
        }

        try {
            // 执行任务
            String result = self.doJobWithTransaction(jobArgs);

            // 记录执行成功
            saveJobRecord(taskBatchId, "SUCCESS", result);

            return ExecuteResult.success(result);
        } catch (Exception e) {
            // 记录执行失败
            saveJobRecord(taskBatchId, "FAILED", e.getMessage());
            return ExecuteResult.failure(e.getMessage());
        }
    }

    @Transactional
    public String doJobWithTransaction(JobArgs jobArgs) {
        // 带事务的业务逻辑
        return "处理完成";
    }

    private void saveJobRecord(Long taskBatchId, String status, String result) {
        JobRecord record = new JobRecord();
        record.setTaskBatchId(taskBatchId);
        record.setStatus(status);
        record.setResult(result);
        record.setExecuteTime(LocalDateTime.now());
        jobRecordMapper.insertOrUpdate(record);
    }
}
```

### 4. 大数据量分批处理

```java
@Component
@JobExecutor(name = "batchDataJob")
public class BatchDataJobExecutor {

    @Autowired
    private DataMapper dataMapper;

    private static final int BATCH_SIZE = 1000;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("开始批量数据处理任务...");

        int totalProcessed = 0;
        int pageNum = 1;

        try {
            while (true) {
                // 分页查询数据
                List<Data> dataList = dataMapper.selectPage(pageNum, BATCH_SIZE);

                if (dataList.isEmpty()) {
                    break;
                }

                // 批量处理
                int processed = processBatch(dataList);
                totalProcessed += processed;

                SnailJobLog.REMOTE.info("第 {} 批处理完成，本批: {} 条，累计: {} 条",
                    pageNum, processed, totalProcessed);

                pageNum++;

                // 避免过度占用资源
                Thread.sleep(100);
            }

            return ExecuteResult.success("处理完成，共 " + totalProcessed + " 条");

        } catch (Exception e) {
            SnailJobLog.REMOTE.error("批量处理失败，已处理: {} 条", totalProcessed, e);
            return ExecuteResult.failure(e.getMessage());
        }
    }

    private int processBatch(List<Data> dataList) {
        int count = 0;
        for (Data data : dataList) {
            try {
                processData(data);
                count++;
            } catch (Exception e) {
                SnailJobLog.REMOTE.warn("数据 {} 处理失败", data.getId());
            }
        }
        return count;
    }
}
```

### 5. 异常处理和重试策略

```java
@Component
@JobExecutor(name = "retryableJob")
public class RetryableJobExecutor {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        int retryCount = jobArgs.getRetryCount();

        SnailJobLog.REMOTE.info("任务执行，当前重试次数: {}", retryCount);

        try {
            // 根据重试次数调整策略
            if (retryCount > 0) {
                // 重试时可能需要清理之前的部分数据
                cleanupPartialData(jobArgs);
            }

            // 执行业务逻辑
            doBusinessLogic();

            return ExecuteResult.success();

        } catch (RetryableException e) {
            // 可重试的异常
            SnailJobLog.REMOTE.warn("发生可重试异常: {}", e.getMessage());
            return ExecuteResult.failure(e.getMessage());

        } catch (NonRetryableException e) {
            // 不可重试的异常，直接标记失败
            SnailJobLog.REMOTE.error("发生不可重试异常", e);
            // 发送告警通知
            sendAlertNotification(e);
            return ExecuteResult.failure("不可重试: " + e.getMessage());

        } catch (Exception e) {
            // 其他异常，根据重试次数决定
            if (retryCount >= 3) {
                SnailJobLog.REMOTE.error("重试次数已达上限，任务失败", e);
                sendAlertNotification(e);
            }
            return ExecuteResult.failure(e.getMessage());
        }
    }

    private void cleanupPartialData(JobArgs jobArgs) {
        // 清理之前执行产生的部分数据
    }

    private void sendAlertNotification(Exception e) {
        // 发送告警通知
    }
}
```

### 6. 任务执行日志规范

```java
@Component
@JobExecutor(name = "wellLoggedJob")
public class WellLoggedJobExecutor {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 1. 记录任务开始
        SnailJobLog.REMOTE.info("========== 任务开始 ==========");
        SnailJobLog.REMOTE.info("任务ID: {}", jobArgs.getJobId());
        SnailJobLog.REMOTE.info("批次ID: {}", jobArgs.getTaskBatchId());
        SnailJobLog.REMOTE.info("任务参数: {}", jobArgs.getJobParams());
        SnailJobLog.REMOTE.info("重试次数: {}", jobArgs.getRetryCount());

        long startTime = System.currentTimeMillis();

        try {
            // 2. 记录关键步骤
            SnailJobLog.REMOTE.info(">>> 步骤1: 数据准备");
            List<Data> dataList = prepareData();
            SnailJobLog.REMOTE.info("数据准备完成，共 {} 条", dataList.size());

            SnailJobLog.REMOTE.info(">>> 步骤2: 数据处理");
            int processed = processData(dataList);
            SnailJobLog.REMOTE.info("数据处理完成，成功 {} 条", processed);

            SnailJobLog.REMOTE.info(">>> 步骤3: 结果保存");
            saveResult(processed);
            SnailJobLog.REMOTE.info("结果保存完成");

            // 3. 记录任务结束
            long duration = System.currentTimeMillis() - startTime;
            SnailJobLog.REMOTE.info("========== 任务完成 ==========");
            SnailJobLog.REMOTE.info("执行耗时: {}ms", duration);
            SnailJobLog.REMOTE.info("处理结果: 成功处理 {} 条数据", processed);

            return ExecuteResult.success("处理 " + processed + " 条，耗时 " + duration + "ms");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            SnailJobLog.REMOTE.error("========== 任务失败 ==========");
            SnailJobLog.REMOTE.error("执行耗时: {}ms", duration);
            SnailJobLog.REMOTE.error("失败原因: ", e);

            return ExecuteResult.failure(e.getMessage());
        }
    }
}
```

### 7. 数据权限处理

```java
@Component
@JobExecutor(name = "dataPermissionJob")
public class DataPermissionJobExecutor {

    @Autowired
    private UserMapper userMapper;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        // 定时任务没有用户上下文，需要忽略数据权限
        List<User> allUsers = DataPermissionHelper.ignore(() -> {
            return userMapper.selectList(null);
        });

        SnailJobLog.REMOTE.info("查询到 {} 个用户", allUsers.size());

        // 或者使用忽略模式执行整个任务
        DataPermissionHelper.ignore(() -> {
            processAllUsers(allUsers);
        });

        return ExecuteResult.success();
    }

    private void processAllUsers(List<User> users) {
        // 处理所有用户
    }
}
```

## 常见问题

### 1. 任务未被调度执行

**问题原因：**
- SnailJob客户端未启用（enabled=false）
- 组名称配置错误
- Token验证失败
- 网络连接问题

**解决方案：**

```yaml
# 检查配置
snail-job:
  enabled: true  # 确保启用
  group: ruoyi-admin  # 与控制台组名一致
  token: xxx  # 与控制台配置一致
  server:
    host: 127.0.0.1  # 确保地址正确
    port: 17888
```

### 2. 任务执行超时

**问题原因：**
- 任务执行时间过长
- 超时时间设置过短
- 数据量过大

**解决方案：**

```java
// 1. 在控制台调整任务超时时间

// 2. 优化任务逻辑，使用分页处理
public ExecuteResult jobExecute(JobArgs jobArgs) {
    int pageNum = 1;
    while (true) {
        List<Data> dataList = dataMapper.selectPage(pageNum++, 500);
        if (dataList.isEmpty()) break;
        processData(dataList);
    }
    return ExecuteResult.success();
}

// 3. 使用分片任务拆分大任务
```

### 3. 任务重复执行

**问题原因：**
- 任务执行时间超过调度间隔
- 多节点同时执行
- 重试机制触发

**解决方案：**

```java
// 使用分布式锁防止重复执行
public ExecuteResult jobExecute(JobArgs jobArgs) {
    String lockKey = "job:lock:" + jobArgs.getJobName();

    Boolean locked = redisTemplate.opsForValue()
        .setIfAbsent(lockKey, "1", 300, TimeUnit.SECONDS);

    if (!Boolean.TRUE.equals(locked)) {
        return ExecuteResult.success("跳过: 任务正在执行");
    }

    try {
        // 执行任务
        return doJob();
    } finally {
        redisTemplate.delete(lockKey);
    }
}
```

### 4. 任务日志不显示

**问题原因：**
- 使用了普通Logger而非SnailJobLog
- 日志收集器配置问题
- 网络连接中断

**解决方案：**

```java
// ✅ 正确：使用SnailJobLog记录远程日志
SnailJobLog.REMOTE.info("这条日志会显示在控制台");

// ❌ 错误：使用普通Logger，不会发送到控制台
log.info("这条日志只在本地");
```

### 5. 分片任务数据不均衡

**问题原因：**
- 分片策略不合理
- 数据分布不均匀

**解决方案：**

```java
// 使用ID取模实现均匀分片
public List<Data> selectBySharding(int shardIndex, int shardTotal) {
    // SQL: SELECT * FROM data WHERE id % #{shardTotal} = #{shardIndex}
    return dataMapper.selectByIdMod(shardIndex, shardTotal);
}

// 或使用范围分片
public List<Data> selectByRange(int shardIndex, int shardTotal, long totalCount) {
    long rangeSize = totalCount / shardTotal;
    long start = shardIndex * rangeSize;
    long end = (shardIndex == shardTotal - 1) ? totalCount : start + rangeSize;
    return dataMapper.selectByIdRange(start, end);
}
```

### 6. 任务依赖问题

**问题原因：**
- 任务之间存在执行顺序依赖
- 前置任务未完成

**解决方案：**

```java
// 方式1：使用工作流（在控制台配置任务依赖）

// 方式2：在任务中检查前置条件
public ExecuteResult jobExecute(JobArgs jobArgs) {
    // 检查前置任务是否完成
    if (!checkPreCondition()) {
        SnailJobLog.REMOTE.warn("前置条件未满足，任务延迟执行");
        return ExecuteResult.failure("前置条件未满足");
    }

    // 执行任务
    return doJob();
}

private boolean checkPreCondition() {
    // 检查前置任务的执行状态
    return jobRecordMapper.isTaskCompleted("preTaskName", LocalDate.now());
}
```

## 监控和告警

### 任务监控指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| 执行成功率 | 任务执行成功的比例 | < 95% |
| 平均执行时间 | 任务执行的平均耗时 | > 预期2倍 |
| 执行延迟 | 实际执行时间与计划时间的差异 | > 5分钟 |
| 重试次数 | 任务重试的次数 | > 3次 |
| 积压任务数 | 等待执行的任务数量 | > 100 |

### 告警配置

```java
@Component
@JobExecutor(name = "monitoredJob")
public class MonitoredJobExecutor {

    @Autowired
    private AlertService alertService;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        long startTime = System.currentTimeMillis();

        try {
            ExecuteResult result = doJob();

            // 执行时间监控
            long duration = System.currentTimeMillis() - startTime;
            if (duration > 60000) { // 超过1分钟
                alertService.sendWarning("任务执行时间过长",
                    String.format("任务 %s 执行耗时 %dms", jobArgs.getJobName(), duration));
            }

            return result;

        } catch (Exception e) {
            // 失败告警
            if (jobArgs.getRetryCount() >= 2) {
                alertService.sendError("任务执行失败",
                    String.format("任务 %s 重试 %d 次后仍然失败: %s",
                        jobArgs.getJobName(), jobArgs.getRetryCount(), e.getMessage()));
            }

            return ExecuteResult.failure(e.getMessage());
        }
    }
}
```

## 性能优化

### 1. 任务执行优化

```java
// 使用异步处理提升性能
@Component
@JobExecutor(name = "asyncProcessJob")
public class AsyncProcessJobExecutor {

    @Autowired
    private ThreadPoolTaskExecutor taskExecutor;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        List<Data> dataList = fetchData();

        // 使用CompletableFuture并行处理
        List<CompletableFuture<Void>> futures = dataList.stream()
            .map(data -> CompletableFuture.runAsync(
                () -> processData(data), taskExecutor))
            .toList();

        // 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        return ExecuteResult.success();
    }
}
```

### 2. 数据库优化

```java
// 使用批量操作减少数据库交互
@Component
@JobExecutor(name = "batchDbJob")
public class BatchDbJobExecutor {

    @Autowired
    private DataMapper dataMapper;

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        List<Data> dataList = prepareData();

        // 批量插入
        Lists.partition(dataList, 500).forEach(batch -> {
            dataMapper.batchInsert(batch);
        });

        // 批量更新
        Lists.partition(dataList, 500).forEach(batch -> {
            dataMapper.batchUpdate(batch);
        });

        return ExecuteResult.success();
    }
}
```

## 总结

RuoYi-Plus框架集成的SnailJob分布式任务调度系统，提供了完整的定时任务解决方案：

1. **分布式架构** - Server/Client分离，支持集群部署和负载均衡
2. **丰富的任务类型** - 支持普通任务、分片任务、工作流等
3. **可靠的执行保障** - 内置失败重试、幂等性支持
4. **完善的监控体系** - 统一日志收集、执行状态追踪
5. **灵活的配置管理** - 动态调整任务参数和执行时间

在实际应用中，需要注意：
- 合理设置任务超时时间和重试策略
- 设计任务的幂等性，避免重复执行问题
- 大数据量任务使用分批或分片处理
- 定时任务中正确处理数据权限
- 建立完善的监控和告警机制
