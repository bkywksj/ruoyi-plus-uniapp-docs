# 消息消费

## 介绍

消息消费是 RocketMQ 的核心功能之一。RuoYi-Plus 使用 Spring Boot 的注解式编程方式，通过 `@RocketMQMessageListener` 注解即可快速创建消息消费者。

**核心特性:**

- **注解式消费** - 通过注解快速创建消费者
- **消息过滤** - 支持标签过滤和 SQL92 表达式过滤
- **消费模式** - 集群消费和广播消费
- **重试机制** - 消费失败自动重试
- **并发消费** - 多线程并发消费

## 快速开始

### 基本消费者

```java
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.stereotype.Component;

@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer-group"
)
public class OrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        log.info("收到订单消息: orderId={}", order.getId());

        // 处理业务逻辑
        processOrder(order);

        log.info("订单处理完成");
    }
}
```

### 消费字符串消息

```java
@Component
@RocketMQMessageListener(
    topic = "log-topic",
    consumerGroup = "log-consumer"
)
public class LogConsumer implements RocketMQListener<String> {

    @Override
    public void onMessage(String message) {
        log.info("收到日志: {}", message);
    }
}
```

## 注解配置

### @RocketMQMessageListener 参数

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `topic` | String | Topic 名称 | - |
| `consumerGroup` | String | 消费者组名 | - |
| `selectorExpression` | String | 消息过滤表达式 | `"*"` (全部) |
| `selectorType` | SelectorType | 过滤类型 | `TAG` |
| `consumeMode` | ConsumeMode | 消费模式 | `CONCURRENTLY` |
| `messageModel` | MessageModel | 消息模型 | `CLUSTERING` |
| `consumeThreadMax` | int | 最大消费线程数 | `64` |
| `maxReconsumeTimes` | int | 最大重试次数 | `16` |
| `consumeTimeout` | long | 消费超时（分钟） | `15` |

## 消息过滤

### 标签过滤

```java
/**
 * 只消费 VIP 标签的消息
 */
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "vip-order-consumer",
    selectorExpression = "VIP"  // 只消费标签为 VIP 的消息
)
public class VipOrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        log.info("处理VIP订单: {}", order.getId());
    }
}

/**
 * 消费多个标签
 */
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "special-order-consumer",
    selectorExpression = "VIP || SVIP"  // VIP 或 SVIP
)
public class SpecialOrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        log.info("处理特殊订单: {}", order.getId());
    }
}
```

### SQL92 过滤

```java
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "large-order-consumer",
    selectorType = SelectorType.SQL92,
    selectorExpression = "amount > 1000"  // 金额大于 1000 的订单
)
public class LargeOrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        log.info("处理大额订单: amount={}", order.getAmount());
    }
}
```

## 消费模式

### 集群消费（默认）

多个消费者平分消息，每条消息只被一个消费者处理。

```java
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    messageModel = MessageModel.CLUSTERING  // 集群消费（默认）
)
public class OrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        // 集群中的一个消费者处理
        processOrder(order);
    }
}
```

**场景：** 订单处理、数据同步等需要负载均衡的场景。

### 广播消费

每个消费者都会收到相同的消息。

```java
@RocketMQMessageListener(
    topic = "config-update",
    consumerGroup = "config-consumer",
    messageModel = MessageModel.BROADCASTING  // 广播消费
)
public class ConfigUpdateConsumer implements RocketMQListener<Config> {

    @Override
    public void onMessage(Config config) {
        // 所有消费者都会收到
        updateLocalConfig(config);
    }
}
```

**场景：** 配置更新、缓存刷新等需要所有实例同步的场景。

## 并发消费

### 设置并发线程数

```java
@RocketMQMessageListener(
    topic = "high-throughput-topic",
    consumerGroup = "high-throughput-consumer",
    consumeThreadMax = 128  // 最大 128 个线程并发消费
)
public class HighThroughputConsumer implements RocketMQListener<Message> {

    @Override
    public void onMessage(Message message) {
        processMessage(message);
    }
}
```

### 顺序消费

```java
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-sequential-consumer",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费
)
public class OrderSequentialConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        // 同一队列的消息顺序消费
        log.info("顺序处理订单: orderId={}", order.getId());
    }
}
```

**注意：** 顺序消费会降低性能，只在必要时使用。

## 重试机制

### 自动重试

消费失败时，RocketMQ 会自动重试。

```java
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    maxReconsumeTimes = 3  // 最多重试 3 次
)
public class OrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        try {
            processOrder(order);
        } catch (Exception e) {
            log.error("订单处理失败: {}", order.getId(), e);
            // 抛出异常触发重试
            throw e;
        }
    }
}
```

### 处理重试消息

```java
@Override
public void onMessage(MessageExt messageExt) {
    // 获取重试次数
    int reconsumeTimes = messageExt.getReconsumeTimes();

    log.info("消息重试次数: {}", reconsumeTimes);

    if (reconsumeTimes >= 3) {
        // 重试次数过多，记录到死信队列
        log.error("消息多次重试失败，进入死信: msgId={}", messageExt.getMsgId());
        // 不再抛出异常，避免无限重试
        return;
    }

    try {
        processMessage(messageExt);
    } catch (Exception e) {
        throw e;  // 继续重试
    }
}
```

## 实战案例

### 订单处理

```java
@Component
@RocketMQMessageListener(
    topic = "order-created",
    consumerGroup = "order-processor"
)
public class OrderProcessor implements RocketMQListener<Order> {

    @Autowired
    private OrderService orderService;

    @Autowired
    private InventoryService inventoryService;

    @Override
    public void onMessage(Order order) {
        log.info("开始处理订单: orderId={}", order.getId());

        try {
            // 1. 检查库存
            inventoryService.checkStock(order);

            // 2. 扣减库存
            inventoryService.deduct(order);

            // 3. 更新订单状态
            orderService.updateStatus(order.getId(), "PROCESSING");

            log.info("订单处理完成: orderId={}", order.getId());

        } catch (Exception e) {
            log.error("订单处理失败: orderId={}", order.getId(), e);
            throw e;  // 触发重试
        }
    }
}
```

### 异步通知

```java
@Component
@RocketMQMessageListener(
    topic = "notification-topic",
    consumerGroup = "notification-sender",
    consumeThreadMax = 20
)
public class NotificationSender implements RocketMQListener<Notification> {

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    @Override
    public void onMessage(Notification notification) {
        log.info("发送通知: userId={}, type={}",
            notification.getUserId(), notification.getType());

        try {
            switch (notification.getType()) {
                case EMAIL:
                    emailService.send(notification);
                    break;
                case SMS:
                    smsService.send(notification);
                    break;
                case PUSH:
                    pushService.send(notification);
                    break;
            }
        } catch (Exception e) {
            log.error("通知发送失败", e);
            // 通知失败不重试，记录日志即可
        }
    }
}
```

### 数据同步

```java
@Component
@RocketMQMessageListener(
    topic = "data-sync-topic",
    consumerGroup = "data-sync-consumer",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费
)
public class DataSyncConsumer implements RocketMQListener<DataEntity> {

    @Autowired
    private SyncService syncService;

    @Override
    public void onMessage(DataEntity entity) {
        log.info("同步数据: id={}, type={}", entity.getId(), entity.getType());

        syncService.sync(entity);
    }
}
```

### 日志收集

```java
@Component
@RocketMQMessageListener(
    topic = "operation-log",
    consumerGroup = "log-collector",
    messageModel = MessageModel.CLUSTERING,
    consumeThreadMax = 50  // 高并发
)
public class LogCollector implements RocketMQListener<OperationLog> {

    @Autowired
    private LogService logService;

    @Override
    public void onMessage(OperationLog log) {
        // 批量保存日志
        logService.save(log);
    }
}
```

## 消息幂等处理

### 使用 Redis 防重

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer"
)
public class OrderConsumer implements RocketMQListener<Order> {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    public void onMessage(Order order) {
        String key = "order:processed:" + order.getId();

        // 检查是否已处理
        Boolean exists = redisTemplate.hasKey(key);
        if (Boolean.TRUE.equals(exists)) {
            log.info("订单已处理，跳过: orderId={}", order.getId());
            return;
        }

        try {
            // 处理业务
            processOrder(order);

            // 标记已处理（24小时过期）
            redisTemplate.opsForValue().set(key, "1", 24, TimeUnit.HOURS);

        } catch (Exception e) {
            log.error("订单处理失败", e);
            throw e;
        }
    }
}
```

### 使用数据库防重

```java
@Override
public void onMessage(Order order) {
    try {
        // 使用数据库唯一索引保证幂等
        orderService.saveWithUniqueCheck(order);
    } catch (DuplicateKeyException e) {
        log.info("订单已存在，跳过: orderId={}", order.getId());
    }
}
```

## 异常处理

### 区分业务异常和系统异常

```java
@Override
public void onMessage(Order order) {
    try {
        validateOrder(order);
        processOrder(order);

    } catch (BusinessException e) {
        // 业务异常：不重试，记录日志
        log.error("业务异常: {}", e.getMessage());
        saveFailedRecord(order, e.getMessage());

    } catch (Exception e) {
        // 系统异常：重试
        log.error("系统异常，触发重试", e);
        throw e;
    }
}
```

### 监控告警

```java
@Override
public void onMessage(Order order) {
    long startTime = System.currentTimeMillis();

    try {
        processOrder(order);

        long duration = System.currentTimeMillis() - startTime;
        if (duration > 5000) {
            log.warn("消息处理耗时过长: {}ms", duration);
        }

    } catch (Exception e) {
        log.error("消息处理失败", e);
        // 发送告警
        alertService.sendAlert("消息消费失败", e.getMessage());
        throw e;
    }
}
```

## 配置优化

### 消费者配置

```yaml
rocketmq:
  consumer:
    # 最小消费线程数
    consume-thread-min: 20

    # 最大消费线程数
    consume-thread-max: 64

    # 消息拉取批次大小
    pull-batch-size: 32

    # 最大重试次数
    max-reconsume-times: 16
```

### 性能调优

```java
@RocketMQMessageListener(
    topic = "high-throughput-topic",
    consumerGroup = "high-throughput-consumer",
    consumeThreadMax = 128,       // 增加线程数
    consumeTimeout = 5            // 减少超时时间（分钟）
)
public class HighPerformanceConsumer implements RocketMQListener<Message> {

    @Override
    public void onMessage(Message message) {
        // 快速处理
        processQuickly(message);
    }
}
```

## 最佳实践

### 1. ConsumerGroup 命名规范

```java
// ✅ 推荐：业务-功能-consumer
"order-processor-consumer"
"notification-sender-consumer"
"log-collector-consumer"

// ❌ 不推荐
"consumer1", "test-consumer"
```

### 2. 合理设置并发线程数

```java
// 轻量级任务：低线程数
consumeThreadMax = 20

// 重量级任务：中等线程数
consumeThreadMax = 64

// 高吞吐场景：高线程数
consumeThreadMax = 128
```

### 3. 幂等性设计

```java
// ✅ 每个消费者都应该实现幂等
@Override
public void onMessage(Order order) {
    if (isDuplicate(order)) {
        return;
    }
    processOrder(order);
    markProcessed(order);
}
```

### 4. 快速失败

```java
// ✅ 明确知道失败的消息，不要重试
@Override
public void onMessage(Order order) {
    if (!isValid(order)) {
        log.error("无效订单，不重试: {}", order);
        return;  // 不抛异常
    }

    try {
        processOrder(order);
    } catch (Exception e) {
        throw e;  // 系统异常才重试
    }
}
```

## 常见问题

### 1. 消费者未收到消息

**检查：**
- Topic 名称是否正确
- ConsumerGroup 是否唯一
- 消费者是否启动

```java
// 确认注解配置
@RocketMQMessageListener(
    topic = "order-topic",  // 确认 Topic 名称
    consumerGroup = "order-consumer"  // 确认 Group 唯一
)
```

### 2. 消息重复消费

**原因：** 网络抖动、消费超时等导致

**解决：** 实现幂等性

```java
// 使用 Redis 防重
String key = "msg:processed:" + msgId;
if (redisTemplate.hasKey(key)) {
    return;
}
```

### 3. 消费慢

**优化：**
- 增加消费线程数
- 优化业务逻辑
- 使用批量处理

```java
@RocketMQMessageListener(
    consumeThreadMax = 128  // 增加线程数
)
```

### 4. 顺序消费失效

**原因：** 消息发送到不同队列

**解决：** 发送时指定相同的队列

```java
// 生产者按订单ID选择队列
rocketMQTemplate.syncSendOrderly(
    "order-topic",
    order,
    order.getId().toString()  // 相同订单ID进同一队列
);
```

## 总结

通过注解式编程，RocketMQ 消费者的创建变得简单而强大。合理配置消费模式、过滤规则、并发线程数等参数，结合幂等性设计和异常处理机制，可以构建出高性能、高可靠的消息消费系统。
