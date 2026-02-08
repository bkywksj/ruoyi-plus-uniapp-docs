# 任务调度模块 (job)

任务调度模块基于 SnailJob 分布式任务调度框架，提供可靠的定时任务和异步作业处理能力，支持任务的创建、调度、监控和管理。

## 模块结构

```
job/
├── demo/                   # 示例任务
│   └── TestAnnoJobExecutor.java
├── config/                 # 配置文件
├── executor/              # 任务执行器
└── handler/               # 任务处理器
```

## 核心功能

### 🔧 SnailJob 集成

#### 任务执行器注解
```java
@Component
@JobExecutor(name = "testJobExecutor")
public class TestAnnoJobExecutor {

    public ExecuteResult jobExecute(JobArgs jobArgs) {
        SnailJobLog.LOCAL.info("testJobExecutor. jobArgs:{}", JsonUtil.toJsonString(jobArgs));
        SnailJobLog.REMOTE.info("testJobExecutor. jobArgs:{}", JsonUtil.toJsonString(jobArgs));
        return ExecuteResult.success("测试成功");
    }
}
```

#### 关键组件说明
- **@JobExecutor**: 标识任务执行器的注解
- **JobArgs**: 任务执行参数对象
- **ExecuteResult**: 任务执行结果对象
- **SnailJobLog**: 分布式日志记录工具

### 📋 任务类型支持

#### 定时任务
- **Cron表达式**：支持标准Cron表达式定义执行时间
- **固定间隔**：支持固定时间间隔执行
- **固定延迟**：支持固定延迟时间执行（上次执行完成后延迟指定时间再执行）

#### 异步任务
- **即时执行**：任务提交后立即异步执行
- **批量处理**：支持批量任务的异步处理
- **优先级队列**：支持任务优先级控制

#### 工作流任务
- **DAG调度**：支持有向无环图的复杂工作流
- **条件分支**：根据执行结果选择后续任务
- **并行执行**：支持任务的并行执行

## 任务示例

### 📊 订单相关任务

#### 订单超时取消任务
```java
@Component
@JobExecutor(name = "orderTimeoutCancelExecutor")
public class OrderTimeoutCancelExecutor {
    
    private final IOrderService orderService;
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            SnailJobLog.REMOTE.info("开始执行订单超时取消任务");
            
            // 查询超时未支付的订单
            List<OrderVo> timeoutOrders = orderService.findTimeoutOrders();
            
            int cancelCount = 0;
            for (OrderVo order : timeoutOrders) {
                try {
                    // 取消订单
                    orderService.cancelOrder(order.getId());
                    cancelCount++;
                    
                    SnailJobLog.REMOTE.info("取消超时订单: {}", order.getOrderNo());
                } catch (Exception e) {
                    SnailJobLog.REMOTE.error("取消订单失败: {}, 错误: {}", 
                        order.getOrderNo(), e.getMessage());
                }
            }
            
            SnailJobLog.REMOTE.info("订单超时取消任务完成，共取消{}个订单", cancelCount);
            return ExecuteResult.success(String.format("成功取消%d个超时订单", cancelCount));
            
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("订单超时取消任务执行失败", e);
            return ExecuteResult.failure("任务执行失败: " + e.getMessage());
        }
    }
}
```

#### 订单状态同步任务
```java
@Component
@JobExecutor(name = "orderStatusSyncExecutor")
public class OrderStatusSyncExecutor {
    
    private final IOrderService orderService;
    private final PayService payService;
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            SnailJobLog.REMOTE.info("开始同步订单支付状态");
            
            // 查询待确认支付状态的订单
            List<OrderVo> pendingOrders = orderService.findPendingPaymentOrders();
            
            int syncCount = 0;
            for (OrderVo order : pendingOrders) {
                try {
                    // 主动查询支付状态
                    PaymentResult result = payService.queryPaymentStatus(order.getOrderNo());
                    
                    if (result.isPaid()) {
                        // 更新订单状态为已支付
                        orderService.updateOrderStatus(order.getId(), DictOrderStatus.PAID.getValue());
                        syncCount++;
                        
                        SnailJobLog.REMOTE.info("同步订单支付状态: {} -> 已支付", order.getOrderNo());
                    }
                } catch (Exception e) {
                    SnailJobLog.REMOTE.error("同步订单支付状态失败: {}, 错误: {}", 
                        order.getOrderNo(), e.getMessage());
                }
            }
            
            return ExecuteResult.success(String.format("成功同步%d个订单状态", syncCount));
            
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("订单状态同步任务执行失败", e);
            return ExecuteResult.failure("任务执行失败: " + e.getMessage());
        }
    }
}
```

### 📈 数据统计任务

#### 销售数据统计任务
```java
@Component  
@JobExecutor(name = "salesDataStatExecutor")
public class SalesDataStatExecutor {
    
    private final IOrderService orderService;
    private final IGoodsService goodsService;
    private final IStatisticsService statisticsService;
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            String dateStr = jobArgs.getArgsStr();
            LocalDate statDate = StringUtils.isNotBlank(dateStr) ? 
                LocalDate.parse(dateStr) : LocalDate.now().minusDays(1);
            
            SnailJobLog.REMOTE.info("开始统计{}的销售数据", statDate);
            
            // 统计销售额
            BigDecimal totalSales = orderService.calculateDailySales(statDate);
            
            // 统计订单数量
            Long totalOrders = orderService.countDailyOrders(statDate);
            
            // 统计商品销量
            List<GoodsSalesVo> goodsSales = orderService.calculateGoodsSales(statDate);
            
            // 保存统计结果
            SalesStatVo salesStat = new SalesStatVo();
            salesStat.setStatDate(statDate);
            salesStat.setTotalSales(totalSales);
            salesStat.setTotalOrders(totalOrders);
            salesStat.setGoodsSales(goodsSales);
            
            statisticsService.saveDailySalesStat(salesStat);
            
            SnailJobLog.REMOTE.info("销售数据统计完成: 日期={}, 销售额={}, 订单数={}", 
                statDate, totalSales, totalOrders);
                
            return ExecuteResult.success("销售数据统计成功");
            
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("销售数据统计任务执行失败", e);
            return ExecuteResult.failure("任务执行失败: " + e.getMessage());
        }
    }
}
```

### 🔄 数据清理任务

#### 日志清理任务
```java
@Component
@JobExecutor(name = "logCleanupExecutor") 
public class LogCleanupExecutor {
    
    private final ISystemLogService systemLogService;
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            SnailJobLog.REMOTE.info("开始执行日志清理任务");
            
            // 清理30天前的系统日志
            LocalDateTime cutoffTime = LocalDateTime.now().minusDays(30);
            
            // 清理操作日志
            int operLogCount = systemLogService.cleanupOperationLogs(cutoffTime);
            
            // 清理登录日志
            int loginLogCount = systemLogService.cleanupLoginLogs(cutoffTime);
            
            // 清理错误日志 (保留更长时间)
            LocalDateTime errorLogCutoff = LocalDateTime.now().minusDays(90);
            int errorLogCount = systemLogService.cleanupErrorLogs(errorLogCutoff);
            
            String result = String.format("日志清理完成: 操作日志%d条, 登录日志%d条, 错误日志%d条",
                operLogCount, loginLogCount, errorLogCount);
                
            SnailJobLog.REMOTE.info(result);
            return ExecuteResult.success(result);
            
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("日志清理任务执行失败", e);
            return ExecuteResult.failure("任务执行失败: " + e.getMessage());
        }
    }
}
```

### 📧 消息通知任务

#### 支付成功通知任务
```java
@Component
@JobExecutor(name = "paymentNotifyExecutor")
public class PaymentNotifyExecutor {
    
    private final IMessageService messageService;
    private final IOrderService orderService;
    private final IUserService userService;
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            // 从任务参数中获取订单号
            String orderNo = jobArgs.getArgsStr();
            
            SnailJobLog.REMOTE.info("开始发送支付成功通知: {}", orderNo);
            
            // 获取订单信息
            OrderVo order = orderService.getByOutTradeNo(orderNo);
            if (order == null) {
                return ExecuteResult.failure("订单不存在: " + orderNo);
            }
            
            // 获取用户信息
            SysUserVo user = userService.getById(order.getUserId());
            if (user == null) {
                return ExecuteResult.failure("用户不存在: " + order.getUserId());
            }
            
            // 构建通知消息
            PaymentNotifyMessage message = new PaymentNotifyMessage();
            message.setOrderNo(order.getOrderNo());
            message.setGoodsName(order.getGoodsName());
            message.setTotalAmount(order.getTotalAmount());
            message.setPaymentTime(order.getPaymentTime());
            
            // 发送通知 (短信、邮件、站内信等)
            messageService.sendPaymentSuccessNotify(user, message);
            
            SnailJobLog.REMOTE.info("支付成功通知发送完成: {}", orderNo);
            return ExecuteResult.success("通知发送成功");
            
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("支付成功通知任务执行失败", e);
            return ExecuteResult.failure("任务执行失败: " + e.getMessage());
        }
    }
}
```

## 任务管理

### 📋 任务配置

#### 通过配置文件
```yaml
# application.yml - SnailJob 定时任务配置
snail-job:
  # 是否启用定时任务
  enabled: ${SNAIL_JOB_ENABLED:false}
  
  # 组名配置 - 需要在 SnailJob 后台组管理创建对应名称的组
  # 创建任务时选择对应的组，才能正确分派任务
  group: ${app.id}
  
  # SnailJob 接入验证令牌
  # 详见 script/sql/ry_job.sql `sj_group_config` 表
  token: ${SNAIL_JOB_TOKEN:SJ_cKqBTPzCsWA3VyuCfFoccmuIEGXjr5KT}
  
  # 调度中心服务器配置
  server:
    host: ${SNAIL_JOB_HOST:127.0.0.1}    # 调度中心地址
    port: ${SNAIL_JOB_PORT:17888}         # 调度中心端口
  
  # 命名空间UUID - 详见 script/sql/ry_job.sql `sj_namespace`表`unique_id`字段
  namespace: ${spring.profiles.active}
  
  # 客户端执行器端口 - 随主应用端口漂移
  port: 2${server.port}
  
  # 客户端IP指定（可选）
  host: ${SNAIL_JOB_CLIENT_HOST:}
  
  # RPC通信类型: netty, grpc
  rpc-type: grpc
```

#### 环境变量配置
```bash
# .env 或系统环境变量
SNAIL_JOB_ENABLED=true
SNAIL_JOB_HOST=192.168.1.100
SNAIL_JOB_PORT=17888
SNAIL_JOB_TOKEN=your-custom-token
SNAIL_JOB_CLIENT_HOST=192.168.1.101
```

### 📋 配置详解

#### 核心配置说明

| 配置项 | 说明 | 默认值 | 示例 |
|--------|------|---------|------|
| `enabled` | 是否启用SnailJob功能 | `false` | `true` |
| `group` | 任务分组名称，通常使用应用ID | - | `business-app` |
| `token` | 接入验证令牌，用于安全认证 | - | `SJ_cKqBTPzCsWA3VyuCfFoccmuIEGXjr5KT` |
| `server.host` | 调度中心服务器地址 | `127.0.0.1` | `192.168.1.100` |
| `server.port` | 调度中心服务器端口 | `17888` | `17888` |
| `namespace` | 命名空间，用于多环境隔离 | - | `prod` |
| `port` | 客户端执行器端口 | `2${server.port}` | `28080` |
| `host` | 客户端IP地址（可选） | - | `192.168.1.101` |
| `rpc-type` | RPC通信类型 | `grpc` | `grpc`/`netty` |

#### 数据库初始化

SnailJob 需要初始化相关数据库表，执行以下SQL脚本：

```sql
-- script/sql/ry_job.sql
-- 创建命名空间
INSERT INTO sj_namespace (id, unique_id, name, create_dt, update_dt) 
VALUES (1, 'prod', '生产环境', NOW(), NOW());

-- 创建组配置
INSERT INTO sj_group_config (id, namespace_id, group_name, token, create_dt, update_dt)
VALUES (1, 1, 'business-app', 'SJ_cKqBTPzCsWA3VyuCfFoccmuIEGXjr5KT', NOW(), NOW());
```

### 🕐 常用Cron表达式

```bash
# 每分钟执行一次
0 * * * * ?

# 每小时的第30分钟执行
0 30 * * * ?

# 每天凌晨2点执行
0 0 2 * * ?

# 每天凌晨2点到4点，每小时执行一次
0 0 2-4 * * ?

# 每周一凌晨1点执行
0 0 1 ? * MON

# 每月1号凌晨3点执行
0 0 3 1 * ?

# 工作日每小时执行
0 0 * ? * MON-FRI

# 每5分钟执行一次
0 */5 * * * ?
```

### 📊 任务监控

#### 执行状态监控
```java
@Component
@JobExecutor(name = "taskMonitorExecutor")
public class TaskMonitorExecutor {
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            // 收集任务执行统计信息
            TaskStatistics stats = collectTaskStatistics();
            
            // 检查是否有任务执行异常
            List<TaskFailure> failures = checkTaskFailures();
            
            if (!failures.isEmpty()) {
                // 发送告警通知
                sendAlertNotification(failures);
                
                SnailJobLog.REMOTE.warn("发现{}个任务执行失败", failures.size());
            }
            
            // 记录统计信息
            SnailJobLog.REMOTE.info("任务监控完成: 成功{}, 失败{}, 运行中{}", 
                stats.getSuccessCount(), stats.getFailureCount(), stats.getRunningCount());
            
            return ExecuteResult.success("监控完成");
            
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("任务监控执行失败", e);
            return ExecuteResult.failure("监控失败: " + e.getMessage());
        }
    }
}
```

## 业务集成

### 🔄 与订单模块集成

#### 订单超时处理

> **注意**：SnailJob 是定时任务调度框架，不支持延迟任务。订单超时取消通常采用定时任务轮询的方式实现。

```java
/**
 * 订单超时取消定时任务
 * 通过 Cron 表达式定时执行，每分钟检查一次超时订单
 * 在 SnailJob 管理后台配置: 0 * * * * ? (每分钟执行)
 */
@Component
@JobExecutor(name = "orderTimeoutCancelExecutor")
public class OrderTimeoutCancelExecutor {

    private final IOrderService orderService;

    // 订单超时时间（分钟）
    private static final int ORDER_TIMEOUT_MINUTES = 30;

    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            SnailJobLog.REMOTE.info("开始执行订单超时取消任务");

            // 计算超时时间点
            LocalDateTime timeoutPoint = LocalDateTime.now().minusMinutes(ORDER_TIMEOUT_MINUTES);

            // 查询超时未支付的订单（创建时间早于超时时间点且状态为待支付）
            List<OrderVo> timeoutOrders = orderService.findUnpaidOrdersBeforeTime(timeoutPoint);

            int cancelCount = 0;
            for (OrderVo order : timeoutOrders) {
                try {
                    orderService.cancelOrder(order.getId(), "订单超时自动取消");
                    cancelCount++;
                    SnailJobLog.REMOTE.info("取消超时订单: {}", order.getOrderNo());
                } catch (Exception e) {
                    SnailJobLog.REMOTE.error("取消订单失败: {}", order.getOrderNo(), e);
                }
            }

            return ExecuteResult.success(String.format("成功取消%d个超时订单", cancelCount));
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("订单超时取消任务执行失败", e);
            return ExecuteResult.failure("任务执行失败: " + e.getMessage());
        }
    }
}
```

#### 支付成功后续处理

> **说明**：支付成功后的后续处理（库存扣减、积分赠送、消息通知等）建议使用 Spring 的异步机制或消息队列，而非 SnailJob。SnailJob 主要用于定时任务调度。

```java
@Component
public class PaymentSuccessHandler {

    private final IOrderService orderService;
    private final IStockService stockService;
    private final IPointService pointService;
    private final IMessageService messageService;

    @Async("asyncExecutor")
    @EventListener
    public void handlePaymentSuccess(PaySuccessEvent event) {
        String orderNo = event.getOutTradeNo();

        // 更新订单状态
        orderService.updateOrderByOutTradeNo(orderNo,
            DictOrderStatus.PAID.getValue(), event.getTransactionId());

        // 扣减库存
        stockService.deductStock(orderNo);

        // 赠送积分
        pointService.grantPoints(orderNo);

        // 发送支付成功通知
        messageService.sendPaymentSuccessNotify(orderNo);
    }
}
```

### 📈 数据统计集成

#### 定时统计任务

> **说明**：以下任务均通过 SnailJob 管理后台配置 Cron 表达式触发，无需在代码中使用 `@Scheduled` 注解。

```java
/**
 * 销售数据统计任务
 * SnailJob 配置: 0 0 2 * * ? (每日凌晨2点执行)
 */
@Component
@JobExecutor(name = "salesDataStatExecutor")
public class SalesDataStatExecutor {

    public ExecuteResult execute(JobArgs jobArgs) {
        String dateStr = jobArgs.getArgsStr();
        LocalDate statDate = StringUtils.isNotBlank(dateStr) ?
            LocalDate.parse(dateStr) : LocalDate.now().minusDays(1);

        SnailJobLog.REMOTE.info("开始统计{}的销售数据", statDate);
        // 执行统计逻辑...
        return ExecuteResult.success("销售数据统计成功");
    }
}

/**
 * 周报统计任务
 * SnailJob 配置: 0 0 3 ? * MON (每周一凌晨3点执行)
 */
@Component
@JobExecutor(name = "weeklyReportExecutor")
public class WeeklyReportExecutor {

    public ExecuteResult execute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("开始生成周报");
        // 执行周报生成逻辑...
        return ExecuteResult.success("周报生成成功");
    }
}

/**
 * 月报统计任务
 * SnailJob 配置: 0 0 4 1 * ? (每月1号凌晨4点执行)
 */
@Component
@JobExecutor(name = "monthlyReportExecutor")
public class MonthlyReportExecutor {

    public ExecuteResult execute(JobArgs jobArgs) {
        SnailJobLog.REMOTE.info("开始生成月报");
        // 执行月报生成逻辑...
        return ExecuteResult.success("月报生成成功");
    }
}
```

## 高可用特性

### 🔧 故障转移
- **多实例部署**：支持多个执行器实例部署，提供高可用保障
- **任务分片**：大任务自动分片到多个执行器并行处理
- **故障恢复**：执行器宕机时自动转移任务到其他健康实例

### 📊 负载均衡
```java
@Component
@JobExecutor(name = "heavyTaskExecutor", 
             shardingStrategy = "ROUND_ROBIN") // 轮询分片策略
public class HeavyTaskExecutor {
    
    public ExecuteResult execute(JobArgs jobArgs) {
        // 获取分片参数
        int shardIndex = jobArgs.getShardIndex();
        int shardTotal = jobArgs.getShardTotal();
        
        SnailJobLog.REMOTE.info("执行分片任务: {}/{}", shardIndex, shardTotal);
        
        // 根据分片参数处理对应的数据
        List<DataEntity> dataList = getShardedData(shardIndex, shardTotal);
        
        // 处理分片数据
        processShardedData(dataList);
        
        return ExecuteResult.success("分片任务执行完成");
    }
    
    private List<DataEntity> getShardedData(int shardIndex, int shardTotal) {
        // 根据分片参数获取对应的数据片段
        // 例如：SELECT * FROM table WHERE MOD(id, shardTotal) = shardIndex
        return dataService.getDataBySharding(shardIndex, shardTotal);
    }
}
```

### 🚨 错误处理和重试
```java
@Component
@JobExecutor(name = "retryableTaskExecutor",
             retryCount = 3,           // 最大重试次数
             retryInterval = 60000)    // 重试间隔(毫秒)
public class RetryableTaskExecutor {
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            // 执行可能失败的业务逻辑
            performBusinessLogic(jobArgs);
            
            return ExecuteResult.success("任务执行成功");
            
        } catch (RetryableException e) {
            // 可重试异常，框架会自动重试
            SnailJobLog.REMOTE.warn("任务执行失败，将重试: {}", e.getMessage());
            return ExecuteResult.failure("临时失败，需要重试");
            
        } catch (NonRetryableException e) {
            // 不可重试异常，直接标记为失败
            SnailJobLog.REMOTE.error("任务执行失败，不可重试: {}", e.getMessage());
            return ExecuteResult.failure("永久失败，不重试");
        }
    }
}
```

## 性能优化

### 📈 批处理优化
```java
@Component
@JobExecutor(name = "batchProcessExecutor")
public class BatchProcessExecutor {
    
    private static final int BATCH_SIZE = 1000;
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            SnailJobLog.REMOTE.info("开始批量处理任务");
            
            int totalProcessed = 0;
            int offset = 0;
            
            while (true) {
                // 分批获取数据
                List<DataEntity> batch = dataService.getBatch(offset, BATCH_SIZE);
                
                if (batch.isEmpty()) {
                    break;
                }
                
                // 批量处理
                processBatch(batch);
                
                totalProcessed += batch.size();
                offset += BATCH_SIZE;
                
                // 记录进度
                SnailJobLog.REMOTE.info("已处理{}条数据", totalProcessed);
                
                // 避免长时间占用，适当休眠
                if (totalProcessed % 10000 == 0) {
                    Thread.sleep(100);
                }
            }
            
            return ExecuteResult.success("批量处理完成，共处理" + totalProcessed + "条数据");
            
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("批量处理任务失败", e);
            return ExecuteResult.failure("处理失败: " + e.getMessage());
        }
    }
}
```

### 🎯 异步执行优化
```java
@Component
@JobExecutor(name = "asyncOptimizedExecutor")
public class AsyncOptimizedExecutor {
    
    private final ThreadPoolExecutor executor = new ThreadPoolExecutor(
        10, 20, 60L, TimeUnit.SECONDS, 
        new LinkedBlockingQueue<>(1000),
        new ThreadFactory("async-task-")
    );
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            List<String> taskIds = parseTaskIds(jobArgs.getArgsStr());
            
            // 使用CompletableFuture并行处理多个子任务
            List<CompletableFuture<String>> futures = taskIds.stream()
                .map(taskId -> CompletableFuture
                    .supplyAsync(() -> processSubTask(taskId), executor)
                    .exceptionally(throwable -> {
                        SnailJobLog.REMOTE.error("子任务{}处理失败: {}", 
                            taskId, throwable.getMessage());
                        return "失败:" + taskId;
                    }))
                .toList();
            
            // 等待所有子任务完成
            CompletableFuture<Void> allOf = CompletableFuture.allOf(
                futures.toArray(new CompletableFuture[0]));
            
            allOf.get(30, TimeUnit.MINUTES); // 设置超时时间
            
            // 收集结果
            List<String> results = futures.stream()
                .map(CompletableFuture::join)
                .toList();
            
            SnailJobLog.REMOTE.info("异步任务执行完成，结果: {}", results);
            return ExecuteResult.success("异步任务全部完成");
            
        } catch (Exception e) {
            SnailJobLog.REMOTE.error("异步任务执行失败", e);
            return ExecuteResult.failure("任务失败: " + e.getMessage());
        }
    }
}
```

## 使用示例

### 📱 业务场景集成

#### 订单自动确认收货
```java
// 发货后7天自动确认收货
@Component
@JobExecutor(name = "autoConfirmReceiptExecutor")
public class AutoConfirmReceiptExecutor {
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            LocalDate cutoffDate = LocalDate.now().minusDays(7);
            
            // 查询7天前发货且未确认收货的订单
            List<OrderVo> orders = orderService.findShippedOrdersBeforeDate(cutoffDate);
            
            int confirmCount = 0;
            for (OrderVo order : orders) {
                try {
                    // 自动确认收货
                    orderService.confirmReceipt(order.getId(), "系统自动确认");
                    confirmCount++;
                    
                    SnailJobLog.REMOTE.info("自动确认收货: {}", order.getOrderNo());
                    
                    // 发送确认收货通知
                    notificationService.sendReceiptConfirmNotify(order);
                    
                } catch (Exception e) {
                    SnailJobLog.REMOTE.error("自动确认收货失败: {}", 
                        order.getOrderNo(), e);
                }
            }
            
            return ExecuteResult.success("自动确认收货完成，共" + confirmCount + "个订单");
            
        } catch (Exception e) {
            return ExecuteResult.failure("任务执行失败: " + e.getMessage());
        }
    }
}
```

#### 商品价格监控
```java
@Component
@JobExecutor(name = "priceMonitorExecutor")
public class PriceMonitorExecutor {
    
    public ExecuteResult execute(JobArgs jobArgs) {
        try {
            SnailJobLog.REMOTE.info("开始执行商品价格监控");
            
            // 获取需要监控的商品列表
            List<GoodsVo> monitorGoods = goodsService.getMonitorGoods();
            
            List<PriceChange> priceChanges = new ArrayList<>();
            
            for (GoodsVo goods : monitorGoods) {
                // 获取当前价格和历史价格
                BigDecimal currentPrice = goods.getPrice();
                BigDecimal lastPrice = priceHistoryService.getLastPrice(goods.getId());
                
                // 检查价格是否发生变化
                if (lastPrice != null && currentPrice.compareTo(lastPrice) != 0) {
                    PriceChange change = new PriceChange();
                    change.setGoodsId(goods.getId());
                    change.setGoodsName(goods.getName());
                    change.setOldPrice(lastPrice);
                    change.setNewPrice(currentPrice);
                    change.setChangeTime(new Date());
                    
                    priceChanges.add(change);
                }
                
                // 更新价格历史
                priceHistoryService.recordPrice(goods.getId(), currentPrice);
            }
            
            if (!priceChanges.isEmpty()) {
                // 保存价格变动记录
                priceHistoryService.savePriceChanges(priceChanges);
                
                // 发送价格变动通知
                notificationService.sendPriceChangeNotify(priceChanges);
                
                SnailJobLog.REMOTE.info("发现{}个商品价格发生变化", priceChanges.size());
            }
            
            return ExecuteResult.success("价格监控完成");
            
        } catch (Exception e) {
            return ExecuteResult.failure("价格监控失败: " + e.getMessage());
        }
    }
}
```

## 最佳实践

### 📋 任务设计原则
- **幂等性**：确保任务可以安全重复执行
- **原子性**：单个任务应该是原子操作，要么全成功要么全失败
- **超时控制**：设置合理的任务超时时间
- **资源控制**：避免任务占用过多系统资源

### 🔐 安全考虑
- **权限控制**：敏感任务需要权限验证
- **参数验证**：严格验证任务输入参数
- **日志审计**：记录任务执行的详细日志
- **错误处理**：妥善处理异常，避免敏感信息泄露

### 🚀 性能优化
- **批处理**：大量数据处理使用批处理模式
- **分页查询**：避免一次性加载大量数据
- **异步处理**：耗时操作使用异步模式
- **缓存利用**：合理使用缓存减少数据库压力

### 🔧 监控运维
- **健康检查**：定期检查任务执行器健康状态
- **性能监控**：监控任务执行时间和资源使用
- **告警机制**：任务执行异常时及时告警
- **日志分析**：定期分析任务执行日志
