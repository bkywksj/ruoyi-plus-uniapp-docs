# 消息队列 (RocketMQ)

## 概述

RocketMQ 消息队列模块 (`ruoyi-common-rocketmq`) 是基于 Apache RocketMQ 封装的分布式消息队列模块，提供高性能、高可靠的异步消息通信能力。该模块集成了 RocketMQ Spring Boot Starter，提供简化的消息生产者工具类和 Topic 管理功能。

### 核心特性

- **简化发送 API**：封装 `RMSendUtil` 工具类，提供同步、异步、单向、延迟等多种发送方式
- **Topic 自动管理**：支持自动创建 Topic，无需手动在 RocketMQ 控制台创建
- **延迟消息支持**：内置 18 级延迟消息枚举，支持 1 秒到 2 小时的延迟投递
- **事务消息支持**：支持 RocketMQ 事务消息，保证分布式事务一致性
- **诊断工具**：内置 `RMDiagnosticUtil` 诊断工具，快速排查连接问题
- **自动配置**：基于 Spring Boot 自动配置，开箱即用
- **完善日志**：详细的发送日志记录，便于问题排查

## 架构设计

### 模块依赖

```xml
<dependencies>
    <!-- RocketMQ Spring Boot Starter -->
    <dependency>
        <groupId>org.apache.rocketmq</groupId>
        <artifactId>rocketmq-spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

### 核心组件

```
ruoyi-common-rocketmq/
├── config/
│   ├── RocketMQAutoConfiguration.java    # 自动配置类
│   └── RocketMQProperties.java           # 配置属性类
├── enums/
│   └── DelayLevel.java                   # 延迟级别枚举
└── util/
    ├── RMSendUtil.java                   # 消息发送工具类
    ├── RMTopicUtil.java                  # Topic 管理工具类
    └── RMDiagnosticUtil.java             # 诊断工具类
```

## 配置说明

### 基础配置

在 `application.yml` 中添加以下配置：

```yaml
rocketmq:
  # 是否启用 RocketMQ（必需设置为 true 才能启用）
  enabled: true

  # NameServer 地址（多个用分号分隔）
  name-server: 127.0.0.1:9876

  # 集群名称
  cluster-name: RuoYiCluster

  # Broker 地址（用于 Topic 管理）
  broker-addr: 127.0.0.1:10911

  # 生产者配置
  producer:
    # 生产者组名
    group: ruoyi-producer-group
    # 发送消息超时时间（毫秒）
    send-msg-timeout: 3000
    # 消息最大大小（字节，默认 4MB）
    max-message-size: 4194304
    # 发送失败重试次数
    retry-times-when-send-failed: 2
    # 异步发送失败重试次数
    retry-times-when-send-async-failed: 2
    # 是否自动创建 Topic
    auto-create-topic: true
    # 批量发送消息的最大数量
    batch-size: 100
    # 是否启用消息发送日志
    enable-log: true

  # 消费者配置
  consumer:
    # 消费者线程池最小线程数
    consume-thread-min: 20
    # 消费者线程池最大线程数
    consume-thread-max: 64
    # 消息拉取批次大小
    pull-batch-size: 32
    # 消费失败最大重试次数（-1 表示无限重试）
    max-reconsume-times: 16
```

### 配置参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | Boolean | `false` | 是否启用 RocketMQ 模块 |
| `name-server` | String | `127.0.0.1:9876` | NameServer 地址 |
| `cluster-name` | String | `RuoYiCluster` | 集群名称 |
| `broker-addr` | String | `127.0.0.1:10911` | Broker 地址 |
| `producer.group` | String | `default-producer-group` | 生产者组名 |
| `producer.send-msg-timeout` | Integer | `3000` | 发送超时时间（毫秒） |
| `producer.max-message-size` | Integer | `4194304` | 消息最大大小（字节） |
| `producer.retry-times-when-send-failed` | Integer | `2` | 同步发送失败重试次数 |
| `producer.auto-create-topic` | Boolean | `true` | 是否自动创建 Topic |
| `producer.enable-log` | Boolean | `true` | 是否启用发送日志 |
| `consumer.consume-thread-min` | Integer | `20` | 消费线程池最小线程数 |
| `consumer.consume-thread-max` | Integer | `64` | 消费线程池最大线程数 |
| `consumer.max-reconsume-times` | Integer | `16` | 消费失败最大重试次数 |

## 消息发送

### 同步发送

同步发送是最常用的发送方式，阻塞等待响应，保证可靠性。

```java
import plus.ruoyi.common.rocketmq.util.RMSendUtil;
import org.apache.rocketmq.client.producer.SendResult;

// 基础同步发送
SendResult result = RMSendUtil.send("order-topic", orderMessage);
log.info("发送成功: msgId={}", result.getMsgId());

// 自定义超时时间
SendResult result = RMSendUtil.send("order-topic", orderMessage, 5000);

// 强制自动创建 Topic
SendResult result = RMSendUtil.sendWithAutoCreate("order-topic", orderMessage);
```

### 异步发送

异步发送不阻塞主线程，通过回调通知发送结果。

```java
import org.apache.rocketmq.client.producer.SendCallback;

// 完整回调方式
RMSendUtil.sendAsync("order-topic", orderMessage, new SendCallback() {
    @Override
    public void onSuccess(SendResult result) {
        log.info("发送成功: msgId={}", result.getMsgId());
    }

    @Override
    public void onException(Throwable e) {
        log.error("发送失败", e);
    }
});

// 简化回调方式（仅处理成功）
RMSendUtil.sendAsync("order-topic", orderMessage, result -> {
    log.info("发送成功: msgId={}", result.getMsgId());
});

// 自定义超时时间
RMSendUtil.sendAsync("order-topic", orderMessage, callback, 5000);
```

### 单向发送

单向发送性能最高但不保证可靠性，适合日志、监控等不重要消息。

```java
// 单向发送（不等待响应）
RMSendUtil.sendOneWay("log-topic", logMessage);
```

### 延迟消息

RocketMQ 支持 18 个固定延迟级别，从 1 秒到 2 小时。

```java
import plus.ruoyi.common.rocketmq.enums.DelayLevel;

// 使用枚举发送延迟消息
SendResult result = RMSendUtil.sendDelay("order-topic", message, DelayLevel.TEN_SECONDS);

// 使用级别数字发送
SendResult result = RMSendUtil.sendDelay("order-topic", message, 3); // 10秒后消费

// 自定义超时时间
SendResult result = RMSendUtil.sendDelay("order-topic", message, 3, 5000);
```

### 带标签消息

消费者可以通过标签过滤消息。

```java
// 发送带标签的消息
SendResult result = RMSendUtil.sendWithTag("order-topic", "VIP", orderMessage);

// 生成的 destination 格式：order-topic:VIP
```

### 批量发送

批量发送使用单向模式，性能最高。

```java
List<OrderMessage> messages = Arrays.asList(msg1, msg2, msg3);

// 批量发送（自动分批）
RMSendUtil.sendBatch("order-topic", messages);
```

### 事务消息

事务消息需要配合 `@RocketMQTransactionListener` 使用。

```java
// 自动生成事务ID
RMSendUtil.sendTransaction("order-topic", orderMessage);

// 自定义事务ID
RMSendUtil.sendTransaction("order-topic", orderMessage, "tx-12345");

// 完整参数
RMSendUtil.sendTransaction("order-topic", orderMessage, "tx-12345", extraArgs);
```

**事务监听器示例：**

```java
@RocketMQTransactionListener
@Slf4j
public class OrderTransactionListener implements RocketMQLocalTransactionListener {

    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 执行本地事务
            orderService.createOrder(msg.getPayload());
            return RocketMQLocalTransactionState.COMMIT;
        } catch (Exception e) {
            log.error("本地事务执行失败", e);
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }

    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        // 事务回查逻辑
        String transactionId = msg.getHeaders().get("transactionId", String.class);
        boolean exists = orderService.checkOrderExists(transactionId);
        return exists ? RocketMQLocalTransactionState.COMMIT : RocketMQLocalTransactionState.ROLLBACK;
    }
}
```

## 延迟级别枚举

`DelayLevel` 枚举定义了 RocketMQ 支持的 18 个延迟级别：

| 枚举值 | 级别 | 延迟时间 | 说明 |
|--------|------|----------|------|
| `ONE_SECOND` | 1 | 1s | 延迟 1 秒 |
| `FIVE_SECONDS` | 2 | 5s | 延迟 5 秒 |
| `TEN_SECONDS` | 3 | 10s | 延迟 10 秒 |
| `THIRTY_SECONDS` | 4 | 30s | 延迟 30 秒 |
| `ONE_MINUTE` | 5 | 1m | 延迟 1 分钟 |
| `TWO_MINUTES` | 6 | 2m | 延迟 2 分钟 |
| `THREE_MINUTES` | 7 | 3m | 延迟 3 分钟 |
| `FOUR_MINUTES` | 8 | 4m | 延迟 4 分钟 |
| `FIVE_MINUTES` | 9 | 5m | 延迟 5 分钟 |
| `SIX_MINUTES` | 10 | 6m | 延迟 6 分钟 |
| `SEVEN_MINUTES` | 11 | 7m | 延迟 7 分钟 |
| `EIGHT_MINUTES` | 12 | 8m | 延迟 8 分钟 |
| `NINE_MINUTES` | 13 | 9m | 延迟 9 分钟 |
| `TEN_MINUTES` | 14 | 10m | 延迟 10 分钟 |
| `TWENTY_MINUTES` | 15 | 20m | 延迟 20 分钟 |
| `THIRTY_MINUTES` | 16 | 30m | 延迟 30 分钟 |
| `ONE_HOUR` | 17 | 1h | 延迟 1 小时 |
| `TWO_HOURS` | 18 | 2h | 延迟 2 小时 |

**枚举使用示例：**

```java
// 根据级别获取枚举
DelayLevel level = DelayLevel.fromLevel(3);  // TEN_SECONDS

// 根据代码获取枚举
DelayLevel level = DelayLevel.fromCode("10s");  // TEN_SECONDS

// 获取枚举属性
int levelNum = DelayLevel.TEN_SECONDS.getLevel();       // 3
String code = DelayLevel.TEN_SECONDS.getCode();          // "10s"
String desc = DelayLevel.TEN_SECONDS.getDescription();   // "10秒"
```

## Topic 管理

### 创建 Topic

```java
import plus.ruoyi.common.rocketmq.util.RMTopicUtil;

// 使用默认配置创建 Topic（8 个队列）
RMTopicUtil.createTopic("order-topic");

// 指定队列数量
RMTopicUtil.createTopic("order-topic", 16);

// 完整参数创建
RMTopicUtil.createTopicIfNotExists(
    "127.0.0.1:9876",    // NameServer
    "127.0.0.1:10911",   // Broker
    "RuoYiCluster",      // 集群名称
    "order-topic",       // Topic 名称
    16                   // 队列数量
);
```

### 删除 Topic

```java
// 使用默认配置删除
RMTopicUtil.deleteTopic("order-topic");

// 完整参数删除
RMTopicUtil.deleteTopic("127.0.0.1:9876", "RuoYiCluster", "order-topic");
```

### 查询 Topic 列表

```java
// 使用默认配置查询
Set<String> topics = RMTopicUtil.listTopics();

// 指定 NameServer 查询
Set<String> topics = RMTopicUtil.listTopics("127.0.0.1:9876");
```

### 验证 Topic 路由

```java
// 验证 Topic 路由信息是否可用
boolean available = RMTopicUtil.verifyTopicRoute("order-topic");

if (!available) {
    log.warn("Topic 路由信息不可用，请检查 Broker 注册状态");
}
```

## 消息消费

### 注解式消费者

使用 `@RocketMQMessageListener` 注解定义消费者：

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer-group"
)
@Slf4j
public class OrderMessageListener implements RocketMQListener<OrderMessage> {

    @Override
    public void onMessage(OrderMessage message) {
        log.info("收到订单消息: {}", message);
        // 处理订单逻辑
        orderService.processOrder(message);
    }
}
```

### 带标签过滤的消费者

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "vip-order-consumer-group",
    selectorExpression = "VIP || SVIP"  // 只消费 VIP 和 SVIP 标签的消息
)
public class VipOrderMessageListener implements RocketMQListener<OrderMessage> {

    @Override
    public void onMessage(OrderMessage message) {
        log.info("收到 VIP 订单消息: {}", message);
    }
}
```

### 顺序消费

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer-group",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费
)
public class OrderlyMessageListener implements RocketMQListener<OrderMessage> {

    @Override
    public void onMessage(OrderMessage message) {
        // 顺序处理消息
    }
}
```

### 广播消费

```java
@Component
@RocketMQMessageListener(
    topic = "broadcast-topic",
    consumerGroup = "broadcast-consumer-group",
    messageModel = MessageModel.BROADCASTING  // 广播模式
)
public class BroadcastMessageListener implements RocketMQListener<String> {

    @Override
    public void onMessage(String message) {
        // 所有消费者实例都会收到消息
    }
}
```

## 诊断工具

### 快速诊断

```java
import plus.ruoyi.common.rocketmq.util.RMDiagnosticUtil;

// 测试 NameServer 连接
RMDiagnosticUtil.quickDiagnose("127.0.0.1:9876");
```

### 完整诊断

```java
// 执行完整诊断（包括 NameServer 连接 + Broker 注册状态）
RMDiagnosticUtil.diagnose();
```

### 检查 Broker 注册状态

```java
// 检查 Broker 是否已注册到 NameServer
RMDiagnosticUtil.checkBrokerRegistration("127.0.0.1:9876");
```

**诊断输出示例：**

```
========================================
🔍 开始诊断 RocketMQ 连接状态...
========================================
🔍 正在测试 NameServer 连接: 127.0.0.1:9876
✅ 成功连接到 NameServer: 127.0.0.1:9876
💡 提示：Broker 注册需要约 10-30 秒，请耐心等待
========================================
🔍 检查 Broker 注册状态...
========================================
🔍 查询已注册的 Broker...
✅ 发现 1 个已注册的 Broker
  - Broker 名称: broker-a
    集群名称: RuoYiCluster
    Broker 地址: {0=127.0.0.1:10911}
========================================
✅ 诊断完成！
========================================
```

## 业务场景示例

### 订单创建通知

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    /**
     * 创建订单并发送消息
     */
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // 1. 创建订单
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(request.getUserId());
        order.setAmount(request.getAmount());
        order.setStatus(OrderStatus.CREATED);
        orderMapper.insert(order);

        // 2. 发送订单创建消息
        OrderCreatedMessage message = new OrderCreatedMessage();
        message.setOrderNo(order.getOrderNo());
        message.setUserId(order.getUserId());
        message.setAmount(order.getAmount());
        message.setCreateTime(order.getCreateTime());

        RMSendUtil.sendAsync("order-created-topic", message, result -> {
            log.info("订单创建消息发送成功: orderNo={}, msgId={}",
                order.getOrderNo(), result.getMsgId());
        });

        return order;
    }
}
```

### 订单超时取消

```java
@Service
@Slf4j
public class OrderTimeoutService {

    /**
     * 发送订单超时检查消息（30分钟后检查）
     */
    public void scheduleOrderTimeoutCheck(String orderNo) {
        OrderTimeoutMessage message = new OrderTimeoutMessage();
        message.setOrderNo(orderNo);
        message.setScheduleTime(LocalDateTime.now());

        // 30 分钟后检查订单是否已支付
        SendResult result = RMSendUtil.sendDelay(
            "order-timeout-topic",
            message,
            DelayLevel.THIRTY_MINUTES
        );

        log.info("订单超时检查消息已发送: orderNo={}, msgId={}",
            orderNo, result.getMsgId());
    }
}

@Component
@RocketMQMessageListener(
    topic = "order-timeout-topic",
    consumerGroup = "order-timeout-consumer-group"
)
@Slf4j
public class OrderTimeoutListener implements RocketMQListener<OrderTimeoutMessage> {

    @Autowired
    private OrderService orderService;

    @Override
    public void onMessage(OrderTimeoutMessage message) {
        log.info("检查订单是否超时: orderNo={}", message.getOrderNo());

        Order order = orderService.getByOrderNo(message.getOrderNo());
        if (order != null && order.getStatus() == OrderStatus.CREATED) {
            // 订单仍未支付，取消订单
            orderService.cancelOrder(order.getOrderNo(), "支付超时自动取消");
            log.info("订单已自动取消: orderNo={}", message.getOrderNo());
        }
    }
}
```

### 库存扣减（事务消息）

```java
@Service
@Slf4j
public class InventoryService {

    /**
     * 发送库存扣减事务消息
     */
    public void deductInventory(String orderNo, List<OrderItem> items) {
        InventoryDeductMessage message = new InventoryDeductMessage();
        message.setOrderNo(orderNo);
        message.setItems(items);
        message.setTransactionId("inv-" + orderNo);

        RMSendUtil.sendTransaction(
            "inventory-deduct-topic",
            message,
            message.getTransactionId(),
            items  // 传递给事务监听器
        );
    }
}

@RocketMQTransactionListener
@Slf4j
public class InventoryTransactionListener implements RocketMQLocalTransactionListener {

    @Autowired
    private InventoryMapper inventoryMapper;

    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        List<OrderItem> items = (List<OrderItem>) arg;

        try {
            // 执行本地库存扣减
            for (OrderItem item : items) {
                int affected = inventoryMapper.deductStock(
                    item.getSkuId(),
                    item.getQuantity()
                );
                if (affected == 0) {
                    throw new RuntimeException("库存不足: skuId=" + item.getSkuId());
                }
            }
            return RocketMQLocalTransactionState.COMMIT;
        } catch (Exception e) {
            log.error("库存扣减失败", e);
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }

    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        InventoryDeductMessage message = (InventoryDeductMessage) msg.getPayload();

        // 检查库存扣减记录是否存在
        boolean deducted = inventoryMapper.checkDeductRecord(message.getOrderNo());
        return deducted ?
            RocketMQLocalTransactionState.COMMIT :
            RocketMQLocalTransactionState.ROLLBACK;
    }
}
```

### 日志收集（单向发送）

```java
@Aspect
@Component
@Slf4j
public class OperationLogAspect {

    @AfterReturning("@annotation(operationLog)")
    public void logOperation(JoinPoint point, OperationLog operationLog) {
        OperationLogMessage message = new OperationLogMessage();
        message.setModule(operationLog.module());
        message.setAction(operationLog.action());
        message.setOperator(SecurityUtils.getUsername());
        message.setOperateTime(LocalDateTime.now());
        message.setParams(Arrays.toString(point.getArgs()));

        // 使用单向发送，不阻塞业务流程
        RMSendUtil.sendOneWay("operation-log-topic", message);
    }
}
```

## 最佳实践

### 1. Topic 命名规范

```java
// 推荐：业务域-功能-操作
"order-created"
"order-paid"
"inventory-deduct"
"user-register"

// 不推荐：
"topic1"
"test"
"myTopic"
```

### 2. 消费者组命名规范

```java
// 推荐：业务域-功能-consumer-group
"order-process-consumer-group"
"inventory-sync-consumer-group"

// 不推荐：
"group1"
"consumer"
```

### 3. 消息幂等处理

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer-group"
)
@Slf4j
public class OrderMessageListener implements RocketMQListener<OrderMessage> {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public void onMessage(OrderMessage message) {
        String msgKey = "mq:consumed:" + message.getOrderNo();

        // 幂等检查
        Boolean isNew = redisTemplate.opsForValue()
            .setIfAbsent(msgKey, "1", Duration.ofHours(24));

        if (Boolean.FALSE.equals(isNew)) {
            log.info("消息已处理，跳过: orderNo={}", message.getOrderNo());
            return;
        }

        try {
            // 处理业务逻辑
            processOrder(message);
        } catch (Exception e) {
            // 处理失败，删除幂等标记，允许重试
            redisTemplate.delete(msgKey);
            throw e;
        }
    }
}
```

### 4. 消息体设计

```java
@Data
public class OrderMessage implements Serializable {

    /**
     * 消息ID（用于幂等）
     */
    private String msgId;

    /**
     * 业务ID
     */
    private String orderNo;

    /**
     * 消息产生时间
     */
    private LocalDateTime createTime;

    /**
     * 业务数据
     */
    private OrderData data;

    /**
     * 追踪ID（链路追踪）
     */
    private String traceId;
}
```

### 5. 异常处理

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer-group"
)
@Slf4j
public class OrderMessageListener implements RocketMQListener<OrderMessage> {

    @Override
    public void onMessage(OrderMessage message) {
        try {
            processOrder(message);
        } catch (BusinessException e) {
            // 业务异常，记录日志但不重试
            log.error("业务处理失败: {}", e.getMessage());
        } catch (Exception e) {
            // 系统异常，抛出让 RocketMQ 重试
            log.error("系统异常，将重试", e);
            throw e;
        }
    }
}
```

## 常见问题

### Q1: 出现 "No route info of this topic" 错误

**问题原因：**
- Topic 不存在
- Broker 未正确注册到 NameServer
- NameServer 地址配置错误

**解决方案：**

```java
// 1. 运行诊断工具
RMDiagnosticUtil.diagnose();

// 2. 手动创建 Topic
RMTopicUtil.createTopic("your-topic");

// 3. 验证 Topic 路由
boolean ok = RMTopicUtil.verifyTopicRoute("your-topic");
```

### Q2: 消息发送超时

**问题原因：**
- 网络延迟
- Broker 负载过高
- 超时时间设置过短

**解决方案：**

```yaml
rocketmq:
  producer:
    send-msg-timeout: 10000  # 增加超时时间
    retry-times-when-send-failed: 3  # 增加重试次数
```

### Q3: 消息消费重复

**问题原因：**
- RocketMQ 是"至少一次"投递语义
- 网络抖动导致 ACK 丢失
- 消费者重启

**解决方案：**
- 实现消息幂等（参考最佳实践）
- 使用唯一业务ID进行去重

### Q4: 消息堆积

**问题原因：**
- 消费速度跟不上生产速度
- 消费者处理逻辑过慢
- 消费者实例不足

**解决方案：**

```yaml
rocketmq:
  consumer:
    consume-thread-min: 50   # 增加消费线程
    consume-thread-max: 100
    pull-batch-size: 64      # 增加批量拉取数量
```

### Q5: 延迟消息不生效

**问题原因：**
- 延迟级别设置错误（必须 1-18）
- 消息格式不正确

**解决方案：**

```java
// 使用枚举确保级别正确
SendResult result = RMSendUtil.sendDelay(
    "topic",
    message,
    DelayLevel.TEN_MINUTES  // 使用枚举
);
```

## API 参考

### RMSendUtil 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `send(topic, message)` | 同步发送 | `SendResult` |
| `send(topic, message, timeout)` | 同步发送（自定义超时） | `SendResult` |
| `sendWithAutoCreate(topic, message)` | 同步发送（强制创建Topic） | `SendResult` |
| `sendAsync(topic, message, callback)` | 异步发送 | `void` |
| `sendAsync(topic, message, successCallback)` | 异步发送（简化回调） | `void` |
| `sendOneWay(topic, message)` | 单向发送 | `void` |
| `sendDelay(topic, message, delayLevel)` | 延迟发送 | `SendResult` |
| `sendWithTag(topic, tag, message)` | 带标签发送 | `SendResult` |
| `sendBatch(topic, messages)` | 批量发送 | `void` |
| `sendTransaction(topic, message)` | 事务消息 | `void` |

### RMTopicUtil 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `createTopic(topicName)` | 创建 Topic | `void` |
| `createTopic(topicName, queueNum)` | 创建 Topic（指定队列数） | `void` |
| `deleteTopic(topicName)` | 删除 Topic | `void` |
| `listTopics()` | 查询所有 Topic | `Set<String>` |
| `verifyTopicRoute(topicName)` | 验证 Topic 路由 | `boolean` |

### RMDiagnosticUtil 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `quickDiagnose(namesrvAddr)` | 快速诊断 | `void` |
| `diagnose()` | 完整诊断 | `void` |
| `checkBrokerRegistration(namesrvAddr)` | 检查 Broker 注册 | `void` |

## 高级特性

### 顺序消息

顺序消息保证消息按发送顺序被消费,适用于订单状态流转等场景。

**发送顺序消息:**

```java
@Service
@Slf4j
public class OrderStatusService {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    /**
     * 发送订单状态变更消息（保证同一订单的消息顺序消费）
     */
    public void sendOrderStatusChange(String orderNo, String status) {
        OrderStatusMessage message = new OrderStatusMessage();
        message.setOrderNo(orderNo);
        message.setStatus(status);
        message.setChangeTime(LocalDateTime.now());

        // 使用 orderNo 作为 hashKey,保证同一订单的消息发送到同一队列
        rocketMQTemplate.syncSendOrderly(
            "order-status-topic",
            message,
            orderNo  // hashKey
        );

        log.info("订单状态消息发送成功: orderNo={}, status={}", orderNo, status);
    }
}
```

**消费顺序消息:**

```java
@Component
@RocketMQMessageListener(
    topic = "order-status-topic",
    consumerGroup = "order-status-consumer-group",
    consumeMode = ConsumeMode.ORDERLY  // 顺序消费模式
)
@Slf4j
public class OrderStatusListener implements RocketMQListener<OrderStatusMessage> {

    @Autowired
    private OrderService orderService;

    @Override
    public void onMessage(OrderStatusMessage message) {
        log.info("收到订单状态消息: orderNo={}, status={}",
            message.getOrderNo(), message.getStatus());

        // 顺序处理订单状态变更
        orderService.updateOrderStatus(message.getOrderNo(), message.getStatus());
    }
}
```

### 消息过滤

RocketMQ 支持 Tag 和 SQL92 两种消息过滤方式。

**Tag 过滤:**

```java
// 发送带标签的消息
RMSendUtil.sendWithTag("order-topic", "CREATE", createMessage);
RMSendUtil.sendWithTag("order-topic", "PAY", payMessage);
RMSendUtil.sendWithTag("order-topic", "CANCEL", cancelMessage);

// 消费指定标签的消息
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-create-consumer",
    selectorExpression = "CREATE"  // 只消费 CREATE 标签
)
public class OrderCreateListener implements RocketMQListener<OrderMessage> {
    // ...
}

// 消费多个标签的消息
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-pay-cancel-consumer",
    selectorExpression = "PAY || CANCEL"  // 消费 PAY 或 CANCEL 标签
)
public class OrderPayCancelListener implements RocketMQListener<OrderMessage> {
    // ...
}
```

**SQL92 过滤:**

```java
// 发送带属性的消息
Message<OrderMessage> message = MessageBuilder
    .withPayload(orderMessage)
    .setHeader("orderType", "VIP")
    .setHeader("amount", 1000)
    .build();
rocketMQTemplate.syncSend("order-topic", message);

// 使用 SQL92 过滤消费
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "vip-high-amount-consumer",
    selectorType = SelectorType.SQL92,
    selectorExpression = "orderType = 'VIP' AND amount > 500"
)
public class VipHighAmountListener implements RocketMQListener<OrderMessage> {
    // ...
}
```

### 消息重试与死信队列

**配置消费重试:**

```yaml
rocketmq:
  consumer:
    max-reconsume-times: 16  # 最大重试次数
```

**重试间隔时间表:**

| 重试次数 | 间隔时间 | 重试次数 | 间隔时间 |
|---------|---------|---------|---------|
| 1 | 10s | 9 | 7m |
| 2 | 30s | 10 | 8m |
| 3 | 1m | 11 | 9m |
| 4 | 2m | 12 | 10m |
| 5 | 3m | 13 | 20m |
| 6 | 4m | 14 | 30m |
| 7 | 5m | 15 | 1h |
| 8 | 6m | 16 | 2h |

**处理死信消息:**

```java
@Component
@RocketMQMessageListener(
    topic = "%DLQ%order-consumer-group",  // 死信队列 Topic
    consumerGroup = "dlq-order-consumer-group"
)
@Slf4j
public class DeadLetterQueueListener implements RocketMQListener<MessageExt> {

    @Autowired
    private AlertService alertService;

    @Override
    public void onMessage(MessageExt message) {
        log.error("收到死信消息: msgId={}, topic={}, body={}",
            message.getMsgId(),
            message.getProperty("REAL_TOPIC"),
            new String(message.getBody()));

        // 发送告警
        alertService.sendAlert("消息消费失败进入死信队列", message.getMsgId());

        // 记录到数据库供人工处理
        saveDeadLetter(message);
    }
}
```

### 消息轨迹

启用消息轨迹可以追踪消息的完整生命周期。

**配置消息轨迹:**

```yaml
rocketmq:
  producer:
    enable-msg-trace: true
    customized-trace-topic: RMQ_SYS_TRACE_TOPIC
  consumer:
    enable-msg-trace: true
```

**查看消息轨迹:**

可通过 RocketMQ Console 控制台查看消息的发送、存储、消费轨迹。

## 监控与运维

### 健康检查

```java
@Component
@Slf4j
public class RocketMQHealthIndicator implements HealthIndicator {

    @Value("${rocketmq.name-server}")
    private String nameServer;

    @Override
    public Health health() {
        try {
            // 测试 NameServer 连接
            DefaultMQAdminExt admin = new DefaultMQAdminExt();
            admin.setNamesrvAddr(nameServer);
            admin.start();

            ClusterInfo clusterInfo = admin.examineBrokerClusterInfo();
            admin.shutdown();

            if (clusterInfo.getBrokerAddrTable().isEmpty()) {
                return Health.down()
                    .withDetail("error", "No broker registered")
                    .build();
            }

            return Health.up()
                .withDetail("nameServer", nameServer)
                .withDetail("brokerCount", clusterInfo.getBrokerAddrTable().size())
                .build();

        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

### 消费进度监控

```java
@Service
@Slf4j
public class ConsumerMonitorService {

    @Value("${rocketmq.name-server}")
    private String nameServer;

    /**
     * 获取消费组的消费进度
     */
    public Map<String, Long> getConsumerProgress(String consumerGroup, String topic) {
        Map<String, Long> result = new HashMap<>();

        try {
            DefaultMQAdminExt admin = new DefaultMQAdminExt();
            admin.setNamesrvAddr(nameServer);
            admin.start();

            ConsumeStats stats = admin.examineConsumeStats(consumerGroup, topic);

            long totalDiff = 0;
            for (Map.Entry<MessageQueue, OffsetWrapper> entry : stats.getOffsetTable().entrySet()) {
                MessageQueue mq = entry.getKey();
                OffsetWrapper offset = entry.getValue();
                long diff = offset.getBrokerOffset() - offset.getConsumerOffset();
                totalDiff += diff;

                result.put(mq.toString(), diff);
            }
            result.put("totalLag", totalDiff);

            admin.shutdown();

        } catch (Exception e) {
            log.error("获取消费进度失败", e);
        }

        return result;
    }

    /**
     * 检查消息堆积告警
     */
    @Scheduled(fixedRate = 60000)
    public void checkMessageLag() {
        Map<String, Long> progress = getConsumerProgress("order-consumer-group", "order-topic");
        Long totalLag = progress.get("totalLag");

        if (totalLag != null && totalLag > 10000) {
            log.warn("消息堆积告警: consumerGroup=order-consumer-group, lag={}", totalLag);
            // 发送告警通知
        }
    }
}
```

### 生产者监控

```java
@Aspect
@Component
@Slf4j
public class RocketMQProducerMonitor {

    private final MeterRegistry meterRegistry;
    private final Counter sendSuccessCounter;
    private final Counter sendFailCounter;
    private final Timer sendTimer;

    public RocketMQProducerMonitor(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.sendSuccessCounter = Counter.builder("rocketmq.producer.send.success")
            .description("RocketMQ 消息发送成功计数")
            .register(meterRegistry);
        this.sendFailCounter = Counter.builder("rocketmq.producer.send.fail")
            .description("RocketMQ 消息发送失败计数")
            .register(meterRegistry);
        this.sendTimer = Timer.builder("rocketmq.producer.send.time")
            .description("RocketMQ 消息发送耗时")
            .register(meterRegistry);
    }

    @Around("execution(* plus.ruoyi.common.rocketmq.util.RMSendUtil.send*(..))")
    public Object monitorSend(ProceedingJoinPoint pjp) throws Throwable {
        long startTime = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            sendSuccessCounter.increment();
            return result;
        } catch (Exception e) {
            sendFailCounter.increment();
            throw e;
        } finally {
            sendTimer.record(System.currentTimeMillis() - startTime, TimeUnit.MILLISECONDS);
        }
    }
}
```

## 性能优化

### 生产者优化

**1. 批量发送:**

```java
// 批量发送可显著提升吞吐量
List<OrderMessage> messages = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
    messages.add(createOrderMessage(i));
}

// 批量发送（内部自动分批）
RMSendUtil.sendBatch("order-topic", messages);
```

**2. 异步发送:**

```java
// 高吞吐场景使用异步发送
for (OrderMessage message : messages) {
    RMSendUtil.sendAsync("order-topic", message, result -> {
        // 异步回调处理
    });
}
```

**3. 单向发送:**

```java
// 对于日志等不重要消息,使用单向发送
RMSendUtil.sendOneWay("log-topic", logMessage);
```

### 消费者优化

**1. 增加消费线程:**

```yaml
rocketmq:
  consumer:
    consume-thread-min: 50
    consume-thread-max: 100
```

**2. 批量消费:**

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-batch-consumer-group",
    consumeMessageBatchMaxSize = 100  // 批量消费
)
public class BatchOrderListener implements RocketMQListener<List<OrderMessage>> {

    @Override
    public void onMessage(List<OrderMessage> messages) {
        // 批量处理消息
        orderService.batchProcess(messages);
    }
}
```

**3. 消费者扩容:**

增加消费者实例数量,提升整体消费能力。注意队列数量要大于等于消费者数量。

### 网络优化

```yaml
rocketmq:
  producer:
    send-msg-timeout: 3000
    compress-msg-body-over-howmuch: 4096  # 超过 4KB 压缩
```

## 集群部署

### 多 Master 模式

```yaml
# 节点1
rocketmq:
  name-server: 192.168.1.100:9876;192.168.1.101:9876

# 节点2
rocketmq:
  name-server: 192.168.1.100:9876;192.168.1.101:9876
```

### Master-Slave 模式

```yaml
rocketmq:
  name-server: 192.168.1.100:9876;192.168.1.101:9876
  # Slave 自动同步 Master 数据
```

### 容灾配置

```java
@Configuration
public class RocketMQFailoverConfig {

    @Bean
    public DefaultMQProducer mqProducer() {
        DefaultMQProducer producer = new DefaultMQProducer("failover-producer-group");
        // 配置多个 NameServer,自动故障转移
        producer.setNamesrvAddr("192.168.1.100:9876;192.168.1.101:9876");
        producer.setRetryTimesWhenSendFailed(3);
        producer.setRetryTimesWhenSendAsyncFailed(3);
        producer.setSendMsgTimeout(5000);
        return producer;
    }
}
```

## 与其他组件集成

### 与 Spring 事务集成

```java
@Service
@Slf4j
public class OrderTransactionalService {

    @Autowired
    private OrderMapper orderMapper;

    @Transactional
    public void createOrderWithMessage(CreateOrderRequest request) {
        // 1. 数据库操作
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        orderMapper.insert(order);

        // 2. 发送消息（事务提交后才真正发送）
        // 使用 TransactionSynchronizationManager 确保事务提交后发送
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    RMSendUtil.sendAsync("order-topic", order, result -> {
                        log.info("订单消息发送成功: {}", result.getMsgId());
                    });
                }
            }
        );
    }
}
```

### 与分布式事务集成

```java
@GlobalTransactional
@Service
public class DistributedOrderService {

    @Autowired
    private OrderService orderService;

    @Autowired
    private InventoryService inventoryService;

    public void createOrder(CreateOrderRequest request) {
        // 1. 创建订单
        Order order = orderService.create(request);

        // 2. 扣减库存
        inventoryService.deduct(request.getItems());

        // 3. 发送事务消息
        RMSendUtil.sendTransaction("order-created-topic", order);
    }
}
```

### 与 Redis 集成（消息去重）

```java
@Component
@Slf4j
public class IdempotentMessageHandler {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String MSG_CONSUMED_PREFIX = "mq:consumed:";
    private static final long EXPIRE_HOURS = 24;

    /**
     * 检查消息是否已消费
     */
    public boolean isConsumed(String msgId) {
        return Boolean.TRUE.equals(
            redisTemplate.hasKey(MSG_CONSUMED_PREFIX + msgId)
        );
    }

    /**
     * 标记消息已消费
     */
    public void markConsumed(String msgId) {
        redisTemplate.opsForValue().set(
            MSG_CONSUMED_PREFIX + msgId,
            "1",
            Duration.ofHours(EXPIRE_HOURS)
        );
    }

    /**
     * 幂等消费包装
     */
    public <T> void consumeIdempotent(String msgId, T message, Consumer<T> handler) {
        if (isConsumed(msgId)) {
            log.info("消息已处理,跳过: msgId={}", msgId);
            return;
        }

        try {
            handler.accept(message);
            markConsumed(msgId);
        } catch (Exception e) {
            log.error("消息处理失败: msgId={}", msgId, e);
            throw e;
        }
    }
}
```

## 安全配置

### ACL 访问控制

```yaml
rocketmq:
  producer:
    access-key: your-access-key
    secret-key: your-secret-key
  consumer:
    access-key: your-access-key
    secret-key: your-secret-key
```

### 消息加密

```java
@Service
public class EncryptedMessageService {

    @Autowired
    private EncryptService encryptService;

    /**
     * 发送加密消息
     */
    public void sendEncrypted(String topic, Object message) {
        String json = JsonUtils.toJson(message);
        String encrypted = encryptService.encrypt(json);

        RMSendUtil.send(topic, encrypted);
    }

    /**
     * 解密消息
     */
    public <T> T decryptMessage(String encrypted, Class<T> clazz) {
        String decrypted = encryptService.decrypt(encrypted);
        return JsonUtils.parseObject(decrypted, clazz);
    }
}
