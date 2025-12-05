# 快速开始

## 介绍

RocketMQ 是阿里巴巴开源的分布式消息队列中间件，具有高性能、高可靠、高实时、分布式特性。RuoYi-Plus 已深度集成 RocketMQ，提供开箱即用的消息队列能力。

**核心特性:**

- **高性能** - 单机支持万级 TPS
- **高可靠** - 消息不丢失，支持持久化
- **异步解耦** - 系统间异步通信，降低耦合度
- **削峰填谷** - 应对高并发场景，保护后端服务
- **延迟消息** - 支持 18 个固定延迟级别

## 环境要求

| 项目 | 要求 | 说明 |
|------|------|------|
| Java | 21+ | RocketMQ 客户端要求 |
| RocketMQ Server | 4.9.0+ | 推荐 5.x 版本 |
| Spring Boot | 3.5.6 | 框架版本 |

## 第一步：安装 RocketMQ

### Docker 方式（推荐）

```bash
# 拉取镜像
docker pull apache/rocketmq:5.1.0

# 启动 NameServer
docker run -d \
  --name rmqnamesrv \
  -p 9876:9876 \
  apache/rocketmq:5.1.0 \
  sh mqnamesrv

# 启动 Broker
docker run -d \
  --name rmqbroker \
  -p 10911:10911 \
  -p 10909:10909 \
  --link rmqnamesrv:namesrv \
  -e "NAMESRV_ADDR=namesrv:9876" \
  apache/rocketmq:5.1.0 \
  sh mqbroker
```

### Docker Compose 方式

创建 `docker-compose.yml`:

```yaml
version: '3.8'
services:
  namesrv:
    image: apache/rocketmq:5.1.0
    container_name: rmqnamesrv
    ports:
      - 9876:9876
    command: sh mqnamesrv

  broker:
    image: apache/rocketmq:5.1.0
    container_name: rmqbroker
    ports:
      - 10911:10911
      - 10909:10909
    environment:
      - NAMESRV_ADDR=namesrv:9876
    depends_on:
      - namesrv
    command: sh mqbroker
```

启动：

```bash
docker-compose up -d
```

## 第二步：添加依赖

在 `pom.xml` 中添加 RocketMQ 模块依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-rocketmq</artifactId>
</dependency>
```

## 第三步：配置 RocketMQ

在 `application.yml` 中添加配置：

```yaml
rocketmq:
  # 启用 RocketMQ
  enabled: true

  # NameServer 地址
  name-server: 127.0.0.1:9876

  # 集群名称
  cluster-name: RuoYiCluster

  # Broker 地址
  broker-addr: 127.0.0.1:10911

  # 生产者配置
  producer:
    group: ruoyi-producer-group
    send-msg-timeout: 3000
    retry-times-when-send-failed: 2
    auto-create-topic: true

  # 消费者配置
  consumer:
    consume-thread-min: 20
    consume-thread-max: 64
```

## 第四步：发送第一条消息

### 同步发送

```java
import plus.ruoyi.common.rocketmq.util.RMSendUtil;

@RestController
@RequestMapping("/demo")
public class DemoController {

    /**
     * 发送消息
     */
    @PostMapping("/send")
    public R<String> sendMessage(@RequestBody String message) {
        // 同步发送消息
        SendResult result = RMSendUtil.send("demo-topic", message);

        return R.ok("消息发送成功", result.getMsgId());
    }
}
```

**测试：**

```bash
curl -X POST http://localhost:8080/demo/send \
  -H "Content-Type: application/json" \
  -d "Hello RocketMQ!"
```

### 异步发送

```java
/**
 * 异步发送消息
 */
@PostMapping("/send/async")
public R<Void> sendAsync(@RequestBody String message) {
    RMSendUtil.sendAsync("demo-topic", message, result -> {
        log.info("消息发送成功: msgId={}", result.getMsgId());
    });

    return R.ok("消息已提交");
}
```

### 单向发送

```java
/**
 * 单向发送（不等待响应）
 */
@PostMapping("/send/oneway")
public R<Void> sendOneWay(@RequestBody String message) {
    RMSendUtil.sendOneWay("log-topic", message);
    return R.ok();
}
```

## 第五步：消费消息

### 创建消费者

```java
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.stereotype.Component;

/**
 * 消息消费者
 */
@Component
@RocketMQMessageListener(
    topic = "demo-topic",
    consumerGroup = "demo-consumer-group"
)
public class DemoConsumer implements RocketMQListener<String> {

    @Override
    public void onMessage(String message) {
        log.info("收到消息: {}", message);

        // 处理业务逻辑
        // ...

        log.info("消息处理完成");
    }
}
```

### 启动应用

启动 Spring Boot 应用后，查看日志：

```
========================================
🚀 RocketMQ 模块开始初始化
  - NameServer: 127.0.0.1:9876
  - 集群名称: RuoYiCluster
  - Broker地址: 127.0.0.1:10911
  - 生产者组: ruoyi-producer-group
  - 发送超时: 3000ms
  - 自动创建Topic: true
  - 消费线程: 20-64
========================================
✅ RocketMQ 客户端启动完成！
========================================
```

## 常见使用场景

### 1. 订单异步处理

```java
/**
 * 订单服务
 */
@Service
public class OrderService {

    /**
     * 创建订单
     */
    public Long createOrder(OrderDTO orderDTO) {
        // 1. 保存订单到数据库
        Order order = saveOrder(orderDTO);

        // 2. 发送订单创建消息
        RMSendUtil.send("order-topic", order);

        return order.getId();
    }
}

/**
 * 订单消费者 - 库存扣减
 */
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "inventory-consumer-group"
)
public class InventoryConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        // 扣减库存
        inventoryService.deduct(order);
    }
}

/**
 * 订单消费者 - 发送通知
 */
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "notification-consumer-group"
)
public class NotificationConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        // 发送通知
        notificationService.sendOrderNotification(order);
    }
}
```

### 2. 延迟消息

```java
import plus.ruoyi.common.rocketmq.enums.DelayLevel;

/**
 * 发送延迟消息
 */
public void sendDelayMessage() {
    // 10秒后消费
    RMSendUtil.sendDelay("delay-topic", "订单超时检查", DelayLevel.TEN_SECONDS);

    // 30分钟后消费
    RMSendUtil.sendDelay("delay-topic", "订单关闭提醒", DelayLevel.THIRTY_MINUTES);
}
```

### 3. 消息过滤（标签）

```java
/**
 * 发送带标签的消息
 */
public void sendWithTag() {
    // VIP 订单
    RMSendUtil.sendWithTag("order-topic", "VIP", vipOrder);

    // 普通订单
    RMSendUtil.sendWithTag("order-topic", "NORMAL", normalOrder);
}

/**
 * 消费者 - 只消费 VIP 订单
 */
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    selectorExpression = "VIP",  // 只消费标签为 VIP 的消息
    consumerGroup = "vip-consumer-group"
)
public class VipOrderConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        log.info("处理VIP订单: {}", order.getId());
    }
}
```

### 4. 批量发送

```java
/**
 * 批量发送消息
 */
public void sendBatch() {
    List<String> messages = Arrays.asList(
        "消息1", "消息2", "消息3", "消息4", "消息5"
    );

    RMSendUtil.sendBatch("batch-topic", messages);
}
```

## 配置说明

### 生产者配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `producer.group` | String | `default-producer-group` | 生产者组名 |
| `producer.send-msg-timeout` | Integer | `3000` | 发送超时（毫秒） |
| `producer.max-message-size` | Integer | `4194304` | 最大消息大小（字节） |
| `producer.retry-times-when-send-failed` | Integer | `2` | 同步发送重试次数 |
| `producer.auto-create-topic` | Boolean | `true` | 是否自动创建 Topic |
| `producer.batch-size` | Integer | `100` | 批量发送大小 |
| `producer.enable-log` | Boolean | `true` | 是否启用日志 |

### 消费者配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `consumer.consume-thread-min` | Integer | `20` | 消费线程最小数 |
| `consumer.consume-thread-max` | Integer | `64` | 消费线程最大数 |
| `consumer.pull-batch-size` | Integer | `32` | 拉取批次大小 |
| `consumer.max-reconsume-times` | Integer | `16` | 最大重试次数 |

## 最佳实践

### 1. Topic 命名规范

```java
// ✅ 推荐
"order-created"          // 订单创建
"order-paid"             // 订单支付
"user-registered"        // 用户注册

// ❌ 不推荐
"topic1", "test", "aaa"  // 无意义命名
```

### 2. 选择合适的发送方式

```java
// 同步发送 - 重要消息（订单、支付）
RMSendUtil.send("order-topic", order);

// 异步发送 - 次要消息（通知、日志）
RMSendUtil.sendAsync("notification-topic", message);

// 单向发送 - 不重要消息（监控数据）
RMSendUtil.sendOneWay("monitor-topic", data);
```

### 3. 消息幂等处理

```java
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer"
)
public class OrderConsumer implements RocketMQListener<Order> {

    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public void onMessage(Order order) {
        String key = "order:processed:" + order.getId();

        // 检查是否已处理（幂等）
        if (redisTemplate.hasKey(key)) {
            log.info("订单已处理，跳过: {}", order.getId());
            return;
        }

        // 处理业务
        processOrder(order);

        // 标记已处理
        redisTemplate.opsForValue().set(key, "1", 24, TimeUnit.HOURS);
    }
}
```

### 4. 异常处理

```java
@Override
public void onMessage(String message) {
    try {
        // 业务处理
        processMessage(message);
    } catch (Exception e) {
        log.error("消息处理失败: {}", message, e);
        // RocketMQ 会自动重试
        throw e;  // 抛出异常触发重试
    }
}
```

## 常见问题

### 1. RocketMQ 未启动

**现象：** 启动应用报错 `connect to <127.0.0.1:9876> failed`

**解决：**

```bash
# 检查 RocketMQ 是否启动
docker ps | grep rocketmq

# 如果未启动，重新启动
docker-compose up -d
```

### 2. 消息发送失败

**原因：**
- NameServer 地址错误
- Broker 未注册
- 网络不通

**解决：**

```yaml
# 检查配置
rocketmq:
  name-server: 127.0.0.1:9876  # 确保地址正确
  broker-addr: 127.0.0.1:10911
```

### 3. 消费者未收到消息

**原因：**
- ConsumerGroup 名称冲突
- Topic 不存在
- 消费者未启动

**检查：**

```java
// 确认注解配置正确
@RocketMQMessageListener(
    topic = "demo-topic",        // 确认 Topic 名称
    consumerGroup = "demo-group" // 确认 ConsumerGroup 唯一
)
```

### 4. 如何查看消息

使用 RocketMQ Dashboard：

```bash
# 启动 Dashboard
docker run -d \
  --name rocketmq-dashboard \
  -p 8080:8080 \
  -e "JAVA_OPTS=-Drocketmq.namesrv.addr=127.0.0.1:9876" \
  apacherocketmq/rocketmq-dashboard:latest
```

访问: http://localhost:8080

## 下一步

现在你已经掌握了 RocketMQ 的基本使用，可以继续学习：

- **消息生产** - 详细的发送 API 和使用场景
- **消息消费** - 消费模式、过滤、重试机制
- **延迟消息** - 18 个延迟级别的使用
- **事务消息** - 分布式事务解决方案
- **顺序消息** - 保证消息顺序消费

## 总结

通过本文档，你已经学会了：

1. ✅ 安装和启动 RocketMQ
2. ✅ 添加依赖和配置
3. ✅ 发送和消费消息
4. ✅ 常见场景的实战案例
5. ✅ 最佳实践和问题排查

现在你可以在项目中使用 RocketMQ 构建高性能的异步消息系统了！
