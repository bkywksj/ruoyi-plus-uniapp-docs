# 消息生产

## 介绍

RMSendUtil 是 RuoYi-Plus 封装的消息生产工具类，提供了简洁易用的 API 来发送各种类型的消息。它基于 RocketMQTemplate，支持同步、异步、单向、延迟、批量等多种发送方式。

**核心特性:**

- **多种发送方式** - 同步、异步、单向发送
- **延迟消息** - 18 个固定延迟级别
- **标签过滤** - 支持消息标签，方便消费者过滤
- **批量发送** - 高效的批量消息发送
- **事务消息** - 分布式事务支持
- **自动创建Topic** - 首次发送时自动创建 Topic

## 发送方式对比

| 发送方式 | 可靠性 | 性能 | 适用场景 |
|---------|-------|------|---------|
| 同步发送 | ⭐⭐⭐ | ⭐⭐ | 重要消息（订单、支付） |
| 异步发送 | ⭐⭐ | ⭐⭐⭐ | 次要消息（通知、邮件） |
| 单向发送 | ⭐ | ⭐⭐⭐ | 不重要消息（日志、监控） |

## 同步发送

### 基本用法

```java
import plus.ruoyi.common.rocketmq.util.RMSendUtil;

// 最简单的同步发送
SendResult result = RMSendUtil.send("order-topic", orderMessage);

log.info("消息ID: {}", result.getMsgId());
log.info("队列ID: {}", result.getMessageQueue().getQueueId());
```

### 自定义超时

```java
// 5秒超时
SendResult result = RMSendUtil.send("order-topic", message, 5000);
```

### 强制自动创建 Topic

```java
// 忽略全局配置，强制创建 Topic
SendResult result = RMSendUtil.sendWithAutoCreate("new-topic", message);
```

### 实战案例

#### 订单创建

```java
@Service
public class OrderService {

    public Long createOrder(OrderDTO orderDTO) {
        // 1. 保存订单
        Order order = saveOrder(orderDTO);

        // 2. 同步发送订单消息（确保成功）
        try {
            SendResult result = RMSendUtil.send("order-created", order);
            log.info("订单消息发送成功: orderId={}, msgId={}",
                order.getId(), result.getMsgId());
        } catch (Exception e) {
            log.error("订单消息发送失败，需要补偿", e);
            // 记录失败日志，后续补偿
            saveFailedMessage(order);
        }

        return order.getId();
    }
}
```

## 异步发送

### 完整回调

```java
RMSendUtil.sendAsync("order-topic", message, new SendCallback() {
    @Override
    public void onSuccess(SendResult result) {
        log.info("发送成功: msgId={}", result.getMsgId());
    }

    @Override
    public void onException(Throwable e) {
        log.error("发送失败", e);
        // 失败补偿逻辑
    }
});
```

### 简化回调

```java
// 只处理成功情况，失败自动记录日志
RMSendUtil.sendAsync("notification-topic", message, result -> {
    log.info("通知发送成功: {}", result.getMsgId());
});
```

### 实战案例

#### 发送邮件通知

```java
@Service
public class EmailService {

    public void sendOrderEmail(Order order) {
        EmailMessage email = buildEmail(order);

        // 异步发送，不阻塞主流程
        RMSendUtil.sendAsync("email-topic", email, result -> {
            log.info("邮件消息已提交: msgId={}", result.getMsgId());
        });
    }
}
```

#### 发送短信

```java
@Service
public class SmsService {

    public void sendSms(String phone, String content) {
        SmsMessage sms = new SmsMessage(phone, content);

        // 异步发送，提高响应速度
        RMSendUtil.sendAsync("sms-topic", sms,
            result -> log.info("短信发送成功: {}", phone),
            3000);  // 3秒超时
    }
}
```

## 单向发送

### 基本用法

```java
// 不等待响应，性能最高
RMSendUtil.sendOneWay("log-topic", logMessage);
```

### 实战案例

#### 操作日志

```java
@Service
public class LogService {

    public void recordOperation(OperationLog log) {
        // 单向发送，不影响主业务性能
        RMSendUtil.sendOneWay("operation-log", log);
    }
}
```

#### 监控数据

```java
@Service
public class MonitorService {

    @Scheduled(fixedRate = 1000)
    public void collectMetrics() {
        SystemMetrics metrics = collectCurrentMetrics();

        // 高频发送，使用单向模式
        RMSendUtil.sendOneWay("metrics-topic", metrics);
    }
}
```

## 延迟消息

### 延迟级别

RocketMQ 支持 18 个固定延迟级别：

| 级别 | 延迟时间 | 枚举常量 |
|------|---------|----------|
| 1 | 1秒 | `DelayLevel.ONE_SECOND` |
| 2 | 5秒 | `DelayLevel.FIVE_SECONDS` |
| 3 | 10秒 | `DelayLevel.TEN_SECONDS` |
| 4 | 30秒 | `DelayLevel.THIRTY_SECONDS` |
| 5 | 1分钟 | `DelayLevel.ONE_MINUTE` |
| 6 | 2分钟 | `DelayLevel.TWO_MINUTES` |
| ... | ... | ... |
| 16 | 30分钟 | `DelayLevel.THIRTY_MINUTES` |
| 17 | 1小时 | `DelayLevel.ONE_HOUR` |
| 18 | 2小时 | `DelayLevel.TWO_HOURS` |

### 使用枚举

```java
import plus.ruoyi.common.rocketmq.enums.DelayLevel;

// 10秒后消费
RMSendUtil.sendDelay("delay-topic", message, DelayLevel.TEN_SECONDS);

// 30分钟后消费
RMSendUtil.sendDelay("delay-topic", message, DelayLevel.THIRTY_MINUTES);
```

### 使用级别数字

```java
// 级别 3 = 10秒
RMSendUtil.sendDelay("delay-topic", message, 3);
```

### 实战案例

#### 订单超时检查

```java
@Service
public class OrderService {

    public void createOrder(Order order) {
        // 保存订单
        saveOrder(order);

        // 30分钟后检查订单状态
        RMSendUtil.sendDelay(
            "order-timeout-check",
            order.getId(),
            DelayLevel.THIRTY_MINUTES
        );
    }
}

@Component
@RocketMQMessageListener(
    topic = "order-timeout-check",
    consumerGroup = "order-timeout-consumer"
)
public class OrderTimeoutConsumer implements RocketMQListener<Long> {

    @Override
    public void onMessage(Long orderId) {
        Order order = orderService.getById(orderId);

        // 检查订单是否超时未支付
        if (order.getStatus() == OrderStatus.UNPAID) {
            log.info("订单超时，自动关闭: {}", orderId);
            orderService.closeOrder(orderId);
        }
    }
}
```

#### 定时提醒

```java
@Service
public class ReminderService {

    public void scheduleReminder(Long userId, String content, DelayLevel delay) {
        Reminder reminder = new Reminder(userId, content);

        // 延迟发送提醒
        RMSendUtil.sendDelay("reminder-topic", reminder, delay);
    }
}
```

## 带标签消息

### 基本用法

```java
// 发送 VIP 订单
RMSendUtil.sendWithTag("order-topic", "VIP", vipOrder);

// 发送普通订单
RMSendUtil.sendWithTag("order-topic", "NORMAL", normalOrder);
```

### 实战案例

```java
@Service
public class OrderService {

    public void sendOrderMessage(Order order) {
        // 根据用户级别添加标签
        String tag = order.getUserLevel().equals("VIP") ? "VIP" : "NORMAL";

        RMSendUtil.sendWithTag("order-topic", tag, order);
    }
}

// VIP 订单优先处理
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    selectorExpression = "VIP",  // 只消费 VIP 标签
    consumerGroup = "vip-order-consumer"
)
public class VipOrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        log.info("VIP订单优先处理: {}", order.getId());
        processVipOrder(order);
    }
}
```

## 批量发送

### 基本用法

```java
List<String> messages = Arrays.asList(
    "消息1", "消息2", "消息3", "消息4", "消息5"
);

// 批量发送（单向模式）
RMSendUtil.sendBatch("batch-topic", messages);
```

### 实战案例

#### 批量通知

```java
@Service
public class NotificationService {

    public void notifyUsers(List<Long> userIds, String content) {
        List<Notification> notifications = userIds.stream()
            .map(userId -> new Notification(userId, content))
            .toList();

        // 批量发送通知
        RMSendUtil.sendBatch("notification-topic", notifications);
    }
}
```

#### 数据同步

```java
@Service
public class DataSyncService {

    public void syncData(List<DataEntity> entities) {
        // 批量同步数据到其他系统
        RMSendUtil.sendBatch("data-sync-topic", entities);
    }
}
```

## 事务消息

### 基本用法

```java
// 发送事务消息
RMSendUtil.sendTransaction("order-topic", order, "tx-123");
```

### 事务监听器

```java
@RocketMQTransactionListener
public class OrderTransactionListener implements RocketMQLocalTransactionListener {

    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 执行本地事务
            String transactionId = msg.getHeaders().get("transactionId").toString();
            executeBusinessLogic(transactionId);

            // 提交事务
            return RocketMQLocalTransactionState.COMMIT;
        } catch (Exception e) {
            log.error("本地事务执行失败", e);
            // 回滚事务
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }

    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        // 事务回查
        String transactionId = msg.getHeaders().get("transactionId").toString();

        boolean success = checkTransactionStatus(transactionId);
        return success ?
            RocketMQLocalTransactionState.COMMIT :
            RocketMQLocalTransactionState.ROLLBACK;
    }
}
```

### 实战案例

#### 分布式事务

```java
@Service
public class OrderService {

    public void createOrderWithTransaction(Order order) {
        String transactionId = "order-" + order.getId();

        // 发送事务消息
        RMSendUtil.sendTransaction("order-topic", order, transactionId, order);
    }
}
```

## SendResult 详解

```java
public class SendResult {
    private String msgId;                // 消息ID
    private MessageQueue messageQueue;   // 消息队列
    private long queueOffset;            // 队列偏移量
    private String transactionId;        // 事务ID
    private String offsetMsgId;          // 偏移消息ID
    private String regionId;             // 区域ID
}
```

## 配置说明

### 生产者配置

```yaml
rocketmq:
  producer:
    # 生产者组名
    group: ruoyi-producer-group

    # 发送超时（毫秒）
    send-msg-timeout: 3000

    # 最大消息大小（字节，4MB）
    max-message-size: 4194304

    # 同步发送失败重试次数
    retry-times-when-send-failed: 2

    # 异步发送失败重试次数
    retry-times-when-send-async-failed: 2

    # 是否自动创建 Topic
    auto-create-topic: true

    # 批量发送大小
    batch-size: 100

    # 是否启用日志
    enable-log: true
```

## 最佳实践

### 1. 选择合适的发送方式

```java
// ✅ 重要消息使用同步
RMSendUtil.send("order-topic", order);

// ✅ 次要消息使用异步
RMSendUtil.sendAsync("notification-topic", message);

// ✅ 不重要消息使用单向
RMSendUtil.sendOneWay("log-topic", log);
```

### 2. 合理设置超时时间

```java
// 简单消息：默认 3 秒
RMSendUtil.send("topic", message);

// 复杂消息：增加超时
RMSendUtil.send("topic", largeMessage, 10000);
```

### 3. 异常处理

```java
try {
    SendResult result = RMSendUtil.send("topic", message);
    log.info("发送成功: {}", result.getMsgId());
} catch (Exception e) {
    log.error("发送失败", e);
    // 记录失败，后续补偿
    saveFailedMessage(message);
}
```

### 4. 消息大小控制

```java
// ✅ 消息应该小而精
Order order = new Order();
order.setId(123L);
order.setStatus("PAID");

// ❌ 避免发送过大对象
// order.setDetailList(largeList);  // 不要发送大集合
```

## 常见问题

### 1. 发送失败

**原因：**
- NameServer 连接失败
- Topic 不存在
- 消息过大

**解决：**

```yaml
# 检查配置
rocketmq:
  name-server: 127.0.0.1:9876
  producer:
    auto-create-topic: true
    max-message-size: 4194304
```

### 2. 异步发送不生效

**确保提供了回调：**

```java
// ✅ 正确
RMSendUtil.sendAsync("topic", message, result -> {
    log.info("发送成功");
});

// ❌ 错误 - 没有回调
// RMSendUtil.sendAsync("topic", message);
```

### 3. 延迟消息不准确

RocketMQ 只支持固定的 18 个延迟级别，不支持任意延迟时间。

```java
// ✅ 正确 - 使用固定级别
RMSendUtil.sendDelay("topic", message, DelayLevel.TEN_MINUTES);

// ❌ 错误 - 不支持任意延迟
// RMSendUtil.sendDelay("topic", message, 15); // 无效
```

## 总结

RMSendUtil 提供了丰富的消息发送功能，涵盖了各种业务场景。通过选择合适的发送方式和配置参数，可以构建高性能、高可靠的消息系统。
