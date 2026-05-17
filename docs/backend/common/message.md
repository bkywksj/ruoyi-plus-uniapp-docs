# 统一消息推送模块 (ruoyi-common-message)

## 模块概述

`ruoyi-common-message` 是 RuoYi-Plus 框架的统一消息推送模块，提供多通道消息路由、智能降级、广播推送等高级功能。该模块采用桥接模式设计，通过统一的 `MessageChannel` 接口抽象各类消息通道，实现消息发送的统一调度和管理。

**核心特性:**

- **多通道支持** - 支持 WebSocket、SSE、短信、小程序、公众号等多种推送通道
- **智能降级** - 按优先级自动切换通道，确保消息送达
- **广播推送** - 支持同时向多个通道发送消息
- **自动发现** - 通过 Spring 自动发现所有 `MessageChannel` 实现
- **零配置** - 无需显式配置通道列表，按需引入模块即可
- **多租户** - 支持租户级别的通道隔离
- **健康检查** - 支持通道健康检查和可用性检测

**架构设计:**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    MessagePushService                           │
│                   (统一消息调度服务)                               │
├─────────────────────────────────────────────────────────────────┤
│  send()         - 发送到指定通道                                  │
│  sendWithFallback() - 智能降级发送                                │
│  broadcast()    - 广播到多个通道                                  │
│  sendAuto()     - 自动选择最佳通道                                │
│  sendByMessageType() - 根据消息类型选择通道                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 调用
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MessageChannel (接口)                          │
│                   (消息通道抽象接口)                               │
├─────────────────────────────────────────────────────────────────┤
│  getChannelType()  - 通道类型标识                                 │
│  getChannelName()  - 通道名称                                    │
│  send()           - 发送消息                                     │
│  batchSend()      - 批量发送                                     │
│  isEnabled()      - 是否启用                                     │
│  getPriority()    - 优先级                                       │
│  healthCheck()    - 健康检查                                     │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ WebSocket   │ │    SSE      │ │    SMS      │ │   MiniApp   │
│  Channel    │ │  Channel    │ │  Channel    │ │   Channel   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
  (websocket)     (sse)          (sms)          (miniapp)
```

## 快速开始

### 1. 添加依赖

```xml
<!-- 统一消息推送模块 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-message</artifactId>
</dependency>

<!-- 按需添加消息通道 -->
<!-- WebSocket 通道 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-websocket</artifactId>
</dependency>

<!-- SSE 通道 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-sse</artifactId>
</dependency>

<!-- 短信通道 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-sms</artifactId>
</dependency>

<!-- 小程序通道 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-miniapp</artifactId>
</dependency>

<!-- 公众号通道 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-mp</artifactId>
</dependency>
```

### 2. 注入服务

```java
import plus.ruoyi.common.message.service.MessagePushService;

@Service
public class NotificationService {

    @Autowired
    private MessagePushService messagePushService;

    /**
     * 发送订单通知
     */
    public void sendOrderNotification(Long userId, String orderNo) {
        MessageContext context = MessageContext.of(userId, "您的订单 " + orderNo + " 已支付成功");

        // 发送到 WebSocket 通道
        MessageResult result = messagePushService.send("websocket", context);

        if (result.isSuccess()) {
            log.info("消息发送成功: {}", result);
        } else {
            log.error("消息发送失败: {}", result.getErrorMessage());
        }
    }
}
```

### 3. 基本使用示例

```java
// 1. 简单消息发送
MessageContext context = MessageContext.of(userId, "您有一条新消息");
messagePushService.send("websocket", context);

// 2. 发送给多个用户
MessageContext context = MessageContext.of(List.of(1L, 2L, 3L), "系统公告：明天将进行系统维护");
messagePushService.send("websocket", context);

// 3. 智能降级发送 (WebSocket 失败自动切换 SSE)
messagePushService.sendWithFallback(List.of("websocket", "sse"), context);

// 4. 广播到多个通道
messagePushService.broadcast(List.of("websocket", "miniapp", "sms"), context);

// 5. 自动选择最佳通道
messagePushService.sendAuto(context);
```

## 核心接口

### MessageChannel 接口

`MessageChannel` 是消息通道的统一抽象接口，定义在 `ruoyi-common-core` 模块中，所有消息通道都需要实现此接口。

```java
public interface MessageChannel {

    /**
     * 通道类型标识
     * @return websocket/sse/sms/miniapp/mp/email 等
     */
    String getChannelType();

    /**
     * 通道名称 (用于日志和展示)
     * @return 通道中文名称
     */
    String getChannelName();

    /**
     * 发送消息
     * @param context 消息上下文
     * @return 发送结果
     */
    MessageResult send(MessageContext context);

    /**
     * 批量发送消息 (默认串行发送)
     * @param contexts 消息上下文列表
     * @return 发送结果列表
     */
    default List<MessageResult> batchSend(List<MessageContext> contexts);

    /**
     * 通道是否启用
     * @return true-启用，false-未启用
     */
    boolean isEnabled();

    /**
     * 通道优先级 (数字越小优先级越高)
     * @return 优先级，默认值5
     */
    default int getPriority();

    /**
     * 健康检查
     * @return true-健康，false-不健康
     */
    default boolean healthCheck();

    /**
     * 是否支持指定租户
     * @param tenantId 租户ID
     * @return true-支持，false-不支持
     */
    default boolean supportTenant(String tenantId);
}
```

**通道优先级建议值:**

| 优先级 | 通道类型 | 说明 |
|--------|----------|------|
| 1 | WebSocket/SSE | 实时推送，延迟最低 |
| 3 | 短信 | 传统可靠通道 |
| 5 | 小程序/公众号 | 第三方平台推送 |
| 7 | 邮件 | 非实时通知 |
| 10 | 站内信 | 系统内部通知 |

### MessageContext 消息上下文

`MessageContext` 封装消息发送所需的所有信息，作为各通道间传递的统一数据载体。

```java
@Data
@Accessors(chain = true)
public class MessageContext implements Serializable {

    /** 消息ID (自动生成UUID) */
    private String messageId;

    /** 租户ID */
    private String tenantId;

    /** 目标用户ID列表 */
    private List<Long> userIds;

    /** 消息内容 (纯文本或JSON) */
    private String content;

    /** 扩展参数 (各通道特有参数) */
    private Map<String, Object> params;

    /** 消息类型 (order/verify_code/promotion等) */
    private String messageType;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 过期时间 */
    private LocalDateTime expireTime;

    /** 优先级 (0-10，默认5) */
    private Integer priority = 5;

    /** 是否需要持久化 */
    private Boolean persistent = false;

    /** 重试次数 */
    private Integer retryCount = 0;

    /** 最大重试次数 */
    private Integer maxRetry = 0;

    // ========== 静态工厂方法 ==========

    /** 创建简单消息 (多用户) */
    public static MessageContext of(List<Long> userIds, String content);

    /** 创建简单消息 (单用户) */
    public static MessageContext of(Long userId, String content);

    /** 创建带参数的消息 */
    public static MessageContext of(List<Long> userIds, String content, Map<String, Object> params);

    /** 创建仅参数消息 (用于模板消息) */
    public static MessageContext ofParams(List<Long> userIds, Map<String, Object> params);
}
```

**各通道扩展参数说明:**

| 通道 | 参数名 | 类型 | 说明 |
|------|--------|------|------|
| SMS | phone | String | 手机号 |
| MiniApp | appid | String | 小程序AppID |
| MiniApp | openid | String | 用户OpenID |
| MiniApp | templateId | String | 模板ID |
| MiniApp | data | Map | 模板数据 |
| MiniApp | page | String | 跳转页面路径 |
| MP | appid | String | 公众号AppID |
| MP | openid | String | 用户OpenID |
| MP | templateId | String | 模板ID |
| MP | data | Map | 模板数据 |
| MP | url | String | 跳转链接 |

### MessageResult 发送结果

```java
@Data
public class MessageResult implements Serializable {

    /** 是否发送成功 */
    private Boolean success;

    /** 消息ID */
    private String messageId;

    /** 通道类型 */
    private String channelType;

    /** 目标用户ID */
    private Long userId;

    /** 错误信息 */
    private String errorMessage;

    /** 错误码 */
    private String errorCode;

    /** 第三方消息ID */
    private String thirdPartyMsgId;

    /** 发送时间 */
    private LocalDateTime sendTime;

    /** 耗时(毫秒) */
    private Long costTime;

    /** 扩展信息 */
    private String extra;

    // ========== 静态工厂方法 ==========

    public static MessageResult success(String messageId, String channelType, Long userId);

    public static MessageResult fail(String messageId, String channelType, Long userId, String errorMessage);

    public static MessageResult fail(String messageId, String channelType, Long userId, String errorCode, String errorMessage);
}
```

## MessagePushService API

### send - 发送到指定通道

```java
/**
 * 发送消息到指定通道
 *
 * @param channelType 通道类型 (websocket/sse/sms/miniapp/mp)
 * @param context     消息上下文
 * @return 发送结果
 */
public MessageResult send(String channelType, MessageContext context)
```

**使用示例:**

```java
// 发送 WebSocket 消息
MessageContext context = MessageContext.of(userId, "您有新的消息");
MessageResult result = messagePushService.send("websocket", context);

// 发送短信
MessageContext smsContext = MessageContext.of(
    userId,
    "您的验证码是：123456",
    Map.of("phone", "13800138000")
);
MessageResult smsResult = messagePushService.send("sms", smsContext);
```

### sendWithFallback - 智能降级发送

```java
/**
 * 智能降级发送 (按优先级尝试多个通道)
 *
 * @param channelTypes 通道类型列表 (按优先级排序)
 * @param context      消息上下文
 * @return 第一个成功的发送结果，或最后一个失败结果
 */
public MessageResult sendWithFallback(List<String> channelTypes, MessageContext context)
```

**使用示例:**

```java
// 验证码发送：短信失败自动切换邮件
MessageResult result = messagePushService.sendWithFallback(
    List.of("sms", "email"),
    context
);

// 实时通知：WebSocket 失败自动切换 SSE
MessageResult result = messagePushService.sendWithFallback(
    List.of("websocket", "sse"),
    context
);

// 重要通知：多通道降级
MessageResult result = messagePushService.sendWithFallback(
    List.of("websocket", "miniapp", "sms"),
    context
);
```

### broadcast - 广播到多个通道

```java
/**
 * 广播消息到多个通道 (全部发送，不降级)
 *
 * @param channelTypes 通道类型列表
 * @param context      消息上下文
 * @return 所有通道的发送结果列表
 */
public List<MessageResult> broadcast(List<String> channelTypes, MessageContext context)
```

**使用示例:**

```java
// 重要公告同时推送多个通道
List<MessageResult> results = messagePushService.broadcast(
    List.of("websocket", "miniapp", "mp", "sms"),
    MessageContext.of(userIds, "系统紧急维护通知")
);

// 统计发送结果
long successCount = results.stream().filter(MessageResult::isSuccess).count();
long failCount = results.size() - successCount;
log.info("广播完成: 成功 {}, 失败 {}", successCount, failCount);
```

### sendAuto - 自动选择最佳通道

```java
/**
 * 自动选择最佳通道发送 (根据优先级)
 *
 * @param context 消息上下文
 * @return 发送结果
 */
public MessageResult sendAuto(MessageContext context)
```

**使用示例:**

```java
// 自动选择优先级最高的可用通道
MessageResult result = messagePushService.sendAuto(
    MessageContext.of(userId, "系统通知消息")
);
```

### sendByMessageType - 根据消息类型发送

```java
/**
 * 根据消息类型自动选择通道并降级发送
 *
 * @param context 消息上下文 (必须设置 messageType)
 * @return 发送结果
 */
public MessageResult sendByMessageType(MessageContext context)
```

**内置消息类型与通道映射:**

| 消息类型 | 通道优先级 | 说明 |
|----------|-----------|------|
| verify_code | sms → email | 验证码优先短信 |
| order | websocket → miniapp → mp | 订单通知优先实时推送 |
| promotion | miniapp → mp → sms | 营销消息优先小程序/公众号 |
| system_notice | websocket → sse | 系统通知优先实时 |
| important | sms → websocket → miniapp → mp | 重要通知全部尝试 |
| (default) | websocket | 默认 WebSocket |

**使用示例:**

```java
// 发送验证码 (自动选择 sms → email)
MessageContext context = MessageContext.of(userId, "验证码：123456")
    .setMessageType("verify_code")
    .setParams(Map.of("phone", "13800138000"));

MessageResult result = messagePushService.sendByMessageType(context);

// 发送订单通知 (自动选择 websocket → miniapp → mp)
MessageContext orderContext = MessageContext.of(userId, "订单已支付")
    .setMessageType("order");

MessageResult orderResult = messagePushService.sendByMessageType(orderContext);
```

### getAvailableChannels - 获取可用通道

```java
/**
 * 获取所有可用通道
 *
 * @return 可用通道列表 (按优先级排序)
 */
public List<MessageChannel> getAvailableChannels()

/**
 * 获取所有可用通道类型
 *
 * @return 通道类型列表
 */
public List<String> getAvailableChannelTypes()

/**
 * 获取通道信息
 *
 * @param channelType 通道类型
 * @return 通道信息描述
 */
public String getChannelInfo(String channelType)
```

**使用示例:**

```java
// 获取所有可用通道类型
List<String> channelTypes = messagePushService.getAvailableChannelTypes();
// 输出: [websocket, sse, sms, miniapp, mp]

// 获取通道详细信息
String info = messagePushService.getChannelInfo("websocket");
// 输出: WebSocket实时推送 (类型:websocket, 优先级:1, 启用:是, 健康:是)
```

## 实现自定义通道

### 1. 实现 MessageChannel 接口

```java
package com.example.channel;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import plus.ruoyi.common.core.message.MessageChannel;
import plus.ruoyi.common.core.message.MessageContext;
import plus.ruoyi.common.core.message.MessageResult;

/**
 * 钉钉消息通道实现
 */
@Slf4j
@Component
public class DingTalkChannel implements MessageChannel {

    @Override
    public String getChannelType() {
        return "dingtalk";
    }

    @Override
    public String getChannelName() {
        return "钉钉消息推送";
    }

    @Override
    public MessageResult send(MessageContext context) {
        long startTime = System.currentTimeMillis();

        try {
            // 从 params 获取钉钉相关参数
            String accessToken = (String) context.getParams().get("accessToken");
            String content = context.getContent();

            // 调用钉钉 API 发送消息
            // ... 实际发送逻辑 ...

            MessageResult result = MessageResult.success(
                context.getMessageId(),
                getChannelType(),
                context.getUserIds().get(0)
            );
            result.setCostTime(System.currentTimeMillis() - startTime);
            return result;

        } catch (Exception e) {
            log.error("钉钉消息发送失败", e);
            return MessageResult.fail(
                context.getMessageId(),
                getChannelType(),
                context.getUserIds().get(0),
                "DINGTALK_ERROR",
                e.getMessage()
            );
        }
    }

    @Override
    public boolean isEnabled() {
        // 从配置文件读取启用状态
        return true;
    }

    @Override
    public int getPriority() {
        return 5; // 与小程序/公众号同级
    }

    @Override
    public boolean healthCheck() {
        // 可以添加钉钉 API 健康检查逻辑
        return isEnabled();
    }
}
```

### 2. 自动注册

实现类添加 `@Component` 注解后，Spring 会自动发现并注入到 `MessagePushService` 中，无需额外配置。

### 3. 使用自定义通道

```java
// 发送钉钉消息
MessageContext context = MessageContext.of(userId, "您有一条新的待办任务")
    .setParams(Map.of(
        "accessToken", "your_access_token",
        "agentId", "your_agent_id"
    ));

MessageResult result = messagePushService.send("dingtalk", context);
```

## 业务场景示例

### 场景1：验证码发送

```java
@Service
public class VerifyCodeService {

    @Autowired
    private MessagePushService messagePushService;

    /**
     * 发送验证码 (短信优先，邮件备用)
     */
    public boolean sendVerifyCode(Long userId, String phone, String code) {
        MessageContext context = MessageContext.of(userId, "您的验证码是：" + code + "，5分钟内有效")
            .setMessageType("verify_code")
            .setParams(Map.of("phone", phone))
            .setExpireTime(LocalDateTime.now().plusMinutes(5))
            .setMaxRetry(2);

        // 智能降级：短信失败自动切换邮件
        MessageResult result = messagePushService.sendWithFallback(
            List.of("sms", "email"),
            context
        );

        return result.isSuccess();
    }
}
```

### 场景2：订单状态通知

```java
@Service
public class OrderNotificationService {

    @Autowired
    private MessagePushService messagePushService;

    /**
     * 订单支付成功通知 (多通道推送)
     */
    public void notifyOrderPaid(Long userId, String orderNo, BigDecimal amount) {
        String content = String.format("订单 %s 支付成功，金额：%.2f 元", orderNo, amount);

        MessageContext context = MessageContext.of(userId, content)
            .setMessageType("order")
            .setParams(Map.of(
                "orderNo", orderNo,
                "amount", amount.toString()
            ));

        // 方式1：使用消息类型自动选择通道
        messagePushService.sendByMessageType(context);

        // 方式2：广播到多个通道
        messagePushService.broadcast(List.of("websocket", "miniapp"), context);
    }
}
```

### 场景3：系统公告推送

```java
@Service
public class SystemNoticeService {

    @Autowired
    private MessagePushService messagePushService;

    /**
     * 发送系统公告 (广播到所有通道)
     */
    public void sendSystemNotice(List<Long> userIds, String title, String content) {
        MessageContext context = MessageContext.of(userIds, content)
            .setMessageType("system_notice")
            .setPriority(10) // 高优先级
            .setPersistent(true); // 持久化

        // 广播到所有可用通道
        List<String> availableChannels = messagePushService.getAvailableChannelTypes();
        List<MessageResult> results = messagePushService.broadcast(availableChannels, context);

        // 记录发送结果
        results.forEach(result -> {
            if (result.isFail()) {
                log.warn("通道 {} 发送失败: {}", result.getChannelType(), result.getErrorMessage());
            }
        });
    }
}
```

### 场景4：营销消息推送

```java
@Service
public class PromotionService {

    @Autowired
    private MessagePushService messagePushService;

    /**
     * 推送营销消息 (小程序优先)
     */
    public void sendPromotion(Long userId, String title, String content, String pageUrl) {
        // 小程序模板消息
        MessageContext miniappContext = MessageContext.ofParams(userId, Map.of(
            "appid", "wx123456789",
            "openid", getOpenId(userId),
            "templateId", "promotion_template_001",
            "data", Map.of(
                "title", Map.of("value", title),
                "content", Map.of("value", content)
            ),
            "page", pageUrl
        )).setMessageType("promotion");

        // 使用消息类型自动选择通道 (miniapp → mp → sms)
        MessageResult result = messagePushService.sendByMessageType(miniappContext);

        if (result.isFail()) {
            log.warn("营销消息发送失败: userId={}, error={}", userId, result.getErrorMessage());
        }
    }
}
```

## 自动配置

模块提供了自动配置类 `MessageAutoConfiguration`，在 Spring Boot 应用启动时自动装配。

```java
@Slf4j
@AutoConfiguration
public class MessageAutoConfiguration {

    @Bean
    public MessagePushService messagePushService(List<MessageChannel> channels) {
        log.info("初始化统一消息推送服务, 发现 {} 个消息通道", channels.size());

        // 打印所有注册的通道
        channels.forEach(channel ->
            log.info("注册消息通道: type={}, name={}, priority={}, enabled={}",
                channel.getChannelType(),
                channel.getChannelName(),
                channel.getPriority(),
                channel.isEnabled())
        );

        return new MessagePushService(channels);
    }
}
```

**自动装配条件:**

- 引入 `ruoyi-common-message` 依赖
- Spring 容器中存在 `MessageChannel` 实现

## 最佳实践

### 1. 通道选择策略

```java
// ✅ 推荐：根据业务场景选择合适的通道策略

// 实时性要求高：WebSocket/SSE
messagePushService.sendWithFallback(List.of("websocket", "sse"), context);

// 送达率要求高：多通道降级
messagePushService.sendWithFallback(List.of("sms", "miniapp", "email"), context);

// 覆盖面要求高：广播
messagePushService.broadcast(List.of("websocket", "miniapp", "mp"), context);

// 成本敏感：按优先级自动选择
messagePushService.sendAuto(context);
```

### 2. 消息内容设计

```java
// ✅ 推荐：针对不同通道定制内容

// WebSocket/SSE：可以发送结构化数据
MessageContext wsContext = MessageContext.of(userId,
    JsonUtils.toJson(Map.of(
        "type", "ORDER_PAID",
        "orderId", orderId,
        "amount", amount
    ))
);

// 短信：简洁明了
MessageContext smsContext = MessageContext.of(userId,
    "您的订单已支付成功，金额：" + amount + "元【XX商城】"
);
```

### 3. 错误处理

```java
// ✅ 推荐：完善的错误处理

MessageResult result = messagePushService.send("websocket", context);

if (result.isFail()) {
    switch (result.getErrorCode()) {
        case "CHANNEL_NOT_FOUND":
            log.error("通道不存在，请检查配置");
            break;
        case "CHANNEL_DISABLED":
            log.warn("通道已禁用，尝试其他通道");
            messagePushService.sendAuto(context);
            break;
        case "USER_OFFLINE":
            log.info("用户离线，消息已缓存");
            break;
        default:
            log.error("消息发送失败: {}", result.getErrorMessage());
    }
}
```

### 4. 性能优化

```java
// ✅ 推荐：批量发送提升性能

// 批量构建消息上下文
List<MessageContext> contexts = userIds.stream()
    .map(userId -> MessageContext.of(userId, content))
    .toList();

// 使用批量发送接口
MessageChannel channel = messagePushService.getAvailableChannels()
    .stream()
    .filter(ch -> "websocket".equals(ch.getChannelType()))
    .findFirst()
    .orElseThrow();

List<MessageResult> results = channel.batchSend(contexts);
```

## 常见问题

### 1. 通道未找到

**问题**: 调用 `send()` 时提示 "通道不存在"

**原因**:
- 未引入对应的通道模块依赖
- 通道实现类未添加 `@Component` 注解
- 通道类型名称拼写错误

**解决方案**:
```java
// 查看所有可用通道
List<String> channels = messagePushService.getAvailableChannelTypes();
log.info("可用通道: {}", channels);

// 确认依赖是否引入
// pom.xml 中添加对应模块依赖
```

### 2. 消息发送失败但无错误信息

**问题**: `MessageResult.isFail()` 返回 true，但 `errorMessage` 为空

**原因**: 通道实现未正确设置错误信息

**解决方案**:
```java
// 在通道实现中正确设置错误信息
return MessageResult.fail(
    context.getMessageId(),
    getChannelType(),
    userId,
    "ERROR_CODE",  // 错误码
    "详细错误描述"  // 错误信息
);
```

### 3. 智能降级不生效

**问题**: 第一个通道失败后没有尝试下一个通道

**原因**:
- 通道返回了成功状态但实际未发送
- 所有通道都被禁用

**解决方案**:
```java
// 检查通道状态
messagePushService.getAvailableChannels().forEach(channel -> {
    log.info("通道 {} 状态: enabled={}, health={}",
        channel.getChannelType(),
        channel.isEnabled(),
        channel.healthCheck());
});

// 确保通道实现正确返回失败状态
```

### 4. 多租户消息隔离

**问题**: 不同租户的消息互相可见

**原因**: 未正确设置租户ID

**解决方案**:
```java
// 设置租户ID
MessageContext context = MessageContext.of(userId, content)
    .setTenantId(TenantHelper.getTenantId());

// 通道实现中检查租户
@Override
public MessageResult send(MessageContext context) {
    if (!supportTenant(context.getTenantId())) {
        return MessageResult.fail(..., "TENANT_NOT_SUPPORTED", "不支持该租户");
    }
    // ... 发送逻辑
}
```

### 5. 消息发送超时

**问题**: 消息发送耗时过长导致接口超时

**原因**:
- 同步发送阻塞主线程
- 第三方通道接口响应慢
- 网络延迟较高

**解决方案**:
```java
// 使用异步发送
@Async
public CompletableFuture<MessageResult> sendAsync(String channelType, MessageContext context) {
    return CompletableFuture.completedFuture(
        messagePushService.send(channelType, context)
    );
}

// 设置超时时间
MessageContext context = MessageContext.of(userId, content)
    .setParams(Map.of("timeout", 5000)); // 5秒超时

// 通道实现中处理超时
@Override
public MessageResult send(MessageContext context) {
    int timeout = (int) context.getParams().getOrDefault("timeout", 10000);
    // 使用带超时的 HTTP 客户端
}
```

### 6. 消息重复发送

**问题**: 同一消息被发送多次

**原因**:
- 接口重试导致重复调用
- 消息队列消费重复

**解决方案**:
```java
// 使用消息ID去重
@Override
public MessageResult send(MessageContext context) {
    String messageId = context.getMessageId();

    // 检查是否已发送
    if (redisTemplate.hasKey("msg:sent:" + messageId)) {
        return MessageResult.success(messageId, getChannelType(), userId)
            .setExtra("duplicate");
    }

    // 发送消息
    MessageResult result = doSend(context);

    // 记录已发送
    if (result.isSuccess()) {
        redisTemplate.opsForValue().set(
            "msg:sent:" + messageId,
            "1",
            Duration.ofHours(24)
        );
    }

    return result;
}
```

## 模块依赖

```text
ruoyi-common-message
    └── ruoyi-common-core (消息接口定义)

各通道模块独立存在，按需引入：
├── ruoyi-common-websocket (WebSocket 通道)
├── ruoyi-common-sse (SSE 通道)
├── ruoyi-common-sms (短信通道)
├── ruoyi-common-miniapp (小程序通道)
├── ruoyi-common-mp (公众号通道)
└── ruoyi-common-mail (邮件通道)
```

**设计原则:**

1. `ruoyi-common-message` 不依赖任何具体通道实现
2. 通过 Spring 自动发现所有 `MessageChannel` 实现
3. 业务模块按需引入具体通道模块
4. 新增通道只需实现接口并添加 `@Component` 注解
