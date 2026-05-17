# SSE 服务端推送模块

基于 Spring Boot 的服务器推送事件模块,提供实时消息推送功能,支持单机和集群环境下的消息分发。

## 模块简介

`ruoyi-common-sse` 模块基于 HTML5 标准的 Server-Sent Events (SSE) 技术,实现了服务端向客户端的单向实时消息推送。通过 Redis 发布订阅实现集群环境下的消息同步,并集成了统一消息接口,支持与其他通道协同工作。

### 核心特性

- **实时通信**: 基于 SSE 协议的长连接通信,HTTP 原生支持
- **多连接支持**: 支持单用户多设备/浏览器同时连接
- **集群支持**: 通过 Redis 发布订阅实现集群环境下的消息分发
- **统一消息**: 集成 MessageChannel 接口,支持统一消息推送
- **自动重连**: 浏览器原生支持自动断线重连
- **灵活配置**: 可通过配置文件控制功能开启/关闭
- **自动清理**: 连接异常时自动清理资源
- **认证集成**: 与 Sa-Token 深度集成,支持用户认证

### SSE vs WebSocket

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 单向 (服务端→客户端) | 双向 |
| 协议 | HTTP | WebSocket |
| 自动重连 | 浏览器原生支持 | 需要手动实现 |
| 复杂度 | 简单 | 相对复杂 |
| 适用场景 | 服务端推送、通知、日志流 | 聊天、游戏、实时协作 |
| 浏览器支持 | 广泛 | 广泛 |

## 模块架构

### 整体架构

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     ruoyi-common-sse 模块架构                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Application Layer                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │ OrderService│  │NotifyService│  │MessagePush  │         │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │   │
│  └─────────┼────────────────┼────────────────┼──────────────────┘   │
│            │                │                │                      │
│  ┌─────────┴────────────────┴────────────────┴──────────────────┐   │
│  │              SseMessageUtils / SseMessageChannel              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │sendMessage()│  │publishMsg() │  │ publishAll()│          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┴──────────────────────────────────┐   │
│  │                   SseEmitterManager                           │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │    USER_TOKEN_EMITTERS: Map<userId, Map<token, Emitter>>│ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │  connect()  │  │ disconnect()│  │sendMessage()│          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┴──────────────────────────────────┐   │
│  │                   Redis Pub/Sub (集群)                        │   │
│  │              Topic: global:sse                                │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│              ┌───────────────┼───────────────┐                     │
│              ▼               ▼               ▼                     │
│     ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│     │ Instance 1 │  │ Instance 2 │  │ Instance 3 │                │
│     │  Listener  │  │  Listener  │  │  Listener  │                │
│     └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

### 模块依赖

```xml
<dependencies>
    <!-- 核心模块 - 提供基础功能支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-core</artifactId>
    </dependency>

    <!-- Redis模块 - 提供分布式消息支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- 认证模块 - 提供用户认证支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-satoken</artifactId>
    </dependency>

    <!-- JSON模块 - 提供消息序列化支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-json</artifactId>
    </dependency>
</dependencies>
```

### 核心组件

| 组件 | 说明 |
|------|------|
| `SseAutoConfiguration` | 自动配置类,条件装配 SSE 组件 |
| `SseEmitterManager` | 连接管理器,管理用户连接和消息发送 |
| `SseController` | REST 控制器,提供 HTTP 接口 |
| `SseTopicListener` | 主题监听器,处理 Redis 订阅消息 |
| `SseMessageUtils` | 消息工具类,提供静态方法 |
| `SseMessageChannel` | 统一消息通道,集成 MessageChannel 接口 |
| `SseMessageDto` | 消息传输对象 |
| `SseProperties` | 配置属性类 |

## 配置说明

### 基本配置

在 `application.yml` 中添加以下配置:

```yaml
# SSE配置
sse:
  enabled: true           # 启用SSE功能
  path: /resource/sse     # SSE服务访问路径

# Redis配置（必需）
spring:
  data:
    redis:
      host: localhost
      port: 6379
      database: 0
```

### 配置参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sse.enabled` | Boolean | false | 是否启用 SSE 功能 |
| `sse.path` | String | - | SSE 服务的访问路径 |

## 自动配置

### SseAutoConfiguration

当 `sse.enabled=true` 时,自动装配以下组件:

```java
@AutoConfiguration
@ConditionalOnProperty(value = "sse.enabled", havingValue = "true")
@EnableConfigurationProperties(SseProperties.class)
public class SseAutoConfiguration {

    /**
     * 配置SSE连接管理器
     */
    @Bean
    public SseEmitterManager sseEmitterManager() {
        return new SseEmitterManager();
    }

    /**
     * 配置SSE主题监听器
     */
    @Bean
    public SseTopicListener sseTopicListener() {
        return new SseTopicListener();
    }

    /**
     * 配置SSE控制器
     */
    @Bean
    public SseController sseController(SseEmitterManager sseEmitterManager) {
        return new SseController(sseEmitterManager);
    }

    /**
     * 注册SSE消息通道
     * 实现统一消息接口，支持通过 MessagePushService 发送 SSE 消息
     */
    @Bean
    public SseMessageChannel sseMessageChannel() {
        return new SseMessageChannel();
    }
}
```

### 连接管理器

`SseEmitterManager` 负责管理所有用户的 SSE 连接:

```java
public class SseEmitterManager {

    // Redis发布订阅的主题名称
    private final static String SSE_TOPIC = "global:sse";

    // 用户连接映射表: userId -> (token -> SseEmitter)
    private final static Map<Long, Map<String, SseEmitter>> USER_TOKEN_EMITTERS = new ConcurrentHashMap<>();

    /**
     * 建立SSE连接
     * @param userId 用户ID
     * @param token 用户令牌
     * @return SSE连接对象，超时时间设置为一天
     */
    public SseEmitter connect(Long userId, String token) {
        Map<String, SseEmitter> emitters = USER_TOKEN_EMITTERS.computeIfAbsent(userId, k -> new ConcurrentHashMap<>());

        // 创建 SseEmitter，超时时间设置为一天 (86400000ms)
        SseEmitter emitter = new SseEmitter(86400000L);
        emitters.put(token, emitter);

        // 设置生命周期回调
        emitter.onCompletion(() -> cleanupEmitter(emitters, token));
        emitter.onTimeout(() -> cleanupEmitter(emitters, token));
        emitter.onError((e) -> cleanupEmitter(emitters, token));

        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (IOException e) {
            emitters.remove(token);
        }
        return emitter;
    }

    /**
     * 断开SSE连接
     */
    public void disconnect(Long userId, String token) {
        // ... 断开逻辑
    }

    /**
     * 向指定用户发送消息（本地）
     */
    public void sendMessage(Long userId, String message) {
        // ... 发送逻辑
    }

    /**
     * 发布消息到Redis主题（集群）
     */
    public void publishMessage(SseMessageDto sseMessageDto) {
        RedisUtils.publish(SSE_TOPIC, sseMessageDto, consumer -> {
            log.info("SSE发送主题订阅消息topic:{} session keys:{} message:{}",
                SSE_TOPIC, sseMessageDto.getUserIds(), sseMessageDto.getMessage());
        });
    }
}
```

## 核心 API

### REST 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `${sse.path}` | GET | 建立 SSE 连接 |
| `${sse.path}/close` | GET | 关闭 SSE 连接 |
| `${sse.path}/send?userId=123&msg=Hello` | GET | 向指定用户发送消息 |
| `${sse.path}/sendAll?msg=Broadcast` | GET | 向所有用户广播消息 |

### SseController

```java
@RestController
@ConditionalOnProperty(value = "sse.enabled", havingValue = "true")
@RequiredArgsConstructor
public class SseController implements DisposableBean {

    private final SseEmitterManager sseEmitterManager;

    /**
     * 建立SSE连接
     * 需要用户登录状态验证
     */
    @GetMapping(value = "${sse.path}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect() {
        StpUtil.checkLogin();
        String tokenValue = StpUtil.getTokenValue();
        Long userId = LoginHelper.getUserId();
        return sseEmitterManager.connect(userId, tokenValue);
    }

    /**
     * 关闭SSE连接
     * 忽略权限验证
     */
    @SaIgnore
    @GetMapping(value = "${sse.path}/close")
    public R<Void> close() {
        String tokenValue = StpUtil.getTokenValue();
        Long userId = LoginHelper.getUserId();
        sseEmitterManager.disconnect(userId, tokenValue);
        return R.ok();
    }

    /**
     * 向指定用户发送消息
     */
    @GetMapping(value = "${sse.path}/send")
    public R<Void> send(Long userId, String msg) {
        SseMessageDto dto = new SseMessageDto();
        dto.setUserIds(List.of(userId));
        dto.setMessage(msg);
        sseEmitterManager.publishMessage(dto);
        return R.ok();
    }

    /**
     * 向所有用户广播消息
     */
    @GetMapping(value = "${sse.path}/sendAll")
    public R<Void> send(String msg) {
        sseEmitterManager.publishAll(msg);
        return R.ok();
    }
}
```

### SseMessageUtils 工具类

```java
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class SseMessageUtils {

    private final static Boolean SSE_ENABLE = SpringUtils.getProperty("sse.enabled", Boolean.class, true);
    private static SseEmitterManager MANAGER;

    /**
     * 向指定用户发送消息（本地）
     */
    public static void sendMessage(Long userId, String message) {
        if (!isEnable()) return;
        MANAGER.sendMessage(userId, message);
    }

    /**
     * 向本机所有用户发送消息
     */
    public static void sendMessage(String message) {
        if (!isEnable()) return;
        MANAGER.sendMessage(message);
    }

    /**
     * 发布SSE订阅消息（集群）
     */
    public static void publishMessage(SseMessageDto sseMessageDto) {
        if (!isEnable()) return;
        MANAGER.publishMessage(sseMessageDto);
    }

    /**
     * 向所有用户发布广播消息（集群）
     */
    public static void publishAll(String message) {
        if (!isEnable()) return;
        MANAGER.publishAll(message);
    }

    /**
     * 检查SSE功能是否开启
     */
    public static Boolean isEnable() {
        return SSE_ENABLE;
    }
}
```

## 统一消息集成

### SseMessageChannel

SSE 模块集成了统一消息接口,支持通过 `MessagePushService` 发送消息:

```java
@Slf4j
public class SseMessageChannel implements MessageChannel {

    @Override
    public String getChannelType() {
        return "sse";
    }

    @Override
    public String getChannelName() {
        return "SSE服务端推送";
    }

    @Override
    public MessageResult send(MessageContext context) {
        long startTime = System.currentTimeMillis();

        // 参数校验
        if (context == null || context.getUserIds() == null || context.getUserIds().isEmpty()) {
            return MessageResult.fail(
                context != null ? context.getMessageId() : null,
                getChannelType(),
                null,
                "PARAM_ERROR",
                "目标用户列表不能为空"
            );
        }

        // 构建 SSE 消息对象
        SseMessageDto dto = SseMessageDto.of(
            context.getUserIds(),
            context.getContent()
        );

        // 发送消息
        SseMessageUtils.publishMessage(dto);

        // 构建成功结果
        MessageResult result = MessageResult.success(
            context.getMessageId(),
            getChannelType(),
            context.getUserIds().get(0)
        );
        result.setCostTime(System.currentTimeMillis() - startTime);

        return result;
    }

    @Override
    public boolean isEnabled() {
        return SseMessageUtils.isEnable();
    }

    @Override
    public int getPriority() {
        return 2;  // SSE 优先级略高于短信
    }
}
```

### 使用统一消息发送

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final MessagePushService messagePushService;

    /**
     * 通过统一消息接口发送 SSE 消息
     */
    public void sendNotification(Long userId, String content) {
        MessageContext context = MessageContext.of(userId, content);
        messagePushService.send("sse", context);
    }
}
```

## 使用指南

### 1. 客户端连接

#### JavaScript 示例

```javascript
// 建立SSE连接
const eventSource = new EventSource('/resource/sse');

// 监听消息
eventSource.addEventListener('message', function(event) {
    console.log('收到消息:', event.data);
    // 处理消息
    handleMessage(JSON.parse(event.data));
});

// 监听连接状态
eventSource.addEventListener('open', function(event) {
    console.log('连接已建立');
});

eventSource.addEventListener('error', function(event) {
    console.log('连接错误:', event);
});

// 关闭连接
function closeConnection() {
    eventSource.close();
    // 调用服务端关闭接口
    fetch('/resource/sse/close');
}
```

#### Vue 3 示例

```vue
<template>
  <div class="notification-container">
    <div v-for="msg in messages" :key="msg.id" class="notification">
      {{ msg.content }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messages = ref([])
let eventSource = null

onMounted(() => {
  // 建立 SSE 连接
  eventSource = new EventSource('/resource/sse')

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    messages.value.push({
      id: Date.now(),
      content: data.message
    })
  }

  eventSource.onerror = (error) => {
    console.error('SSE 连接错误:', error)
    // 浏览器会自动重连
  }
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    fetch('/resource/sse/close')
  }
})
</script>
```

### 2. 服务端发送消息

#### 使用工具类 (推荐)

```java
// 向指定用户发送消息（本地）
SseMessageUtils.sendMessage(userId, "Hello User");

// 向所有用户广播消息（本地）
SseMessageUtils.sendMessage("广播消息");

// 通过Redis发布消息（集群环境）
SseMessageDto message = SseMessageDto.of(Arrays.asList(123L, 456L), "集群消息");
SseMessageUtils.publishMessage(message);

// 广播消息到所有节点
SseMessageUtils.publishAll("全局广播");
```

#### 直接使用管理器

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SseEmitterManager sseEmitterManager;

    public void sendNotification(Long userId, String content) {
        // 本地发送
        sseEmitterManager.sendMessage(userId, content);

        // 集群发送
        SseMessageDto dto = new SseMessageDto();
        dto.setUserIds(Arrays.asList(userId));
        dto.setMessage(content);
        sseEmitterManager.publishMessage(dto);
    }
}
```

### 3. 业务集成示例

#### 订单状态推送

```java
@Service
public class OrderService {

    public void updateOrderStatus(Long orderId, String status) {
        // 业务逻辑...
        Order order = updateOrder(orderId, status);

        // 推送状态更新
        String message = String.format(
            "{\"type\":\"order\",\"orderId\":\"%s\",\"status\":\"%s\"}",
            orderId, status
        );
        SseMessageUtils.sendMessage(order.getUserId(), message);
    }
}
```

#### 系统通知推送

```java
@Service
public class SystemNoticeService {

    public void sendSystemNotice(String notice) {
        // 向所有在线用户推送系统通知
        String message = String.format(
            "{\"type\":\"system\",\"content\":\"%s\",\"time\":%d}",
            notice, System.currentTimeMillis()
        );
        SseMessageUtils.publishAll(message);
    }

    public void sendPersonalMessage(Long userId, String content) {
        // 向特定用户推送个人消息
        SseMessageDto dto = SseMessageDto.of(Arrays.asList(userId), content);
        SseMessageUtils.publishMessage(dto);
    }
}
```

#### AI 流式对话

```java
@Service
@RequiredArgsConstructor
public class AiChatService {

    private final SseEmitterManager sseEmitterManager;

    /**
     * AI 流式响应
     */
    public void streamChat(Long userId, String question) {
        // 调用 AI 接口获取流式响应
        aiClient.streamChat(question, chunk -> {
            // 每接收到一个 chunk 就推送给客户端
            String message = String.format(
                "{\"type\":\"ai_chunk\",\"content\":\"%s\"}",
                chunk
            );
            sseEmitterManager.sendMessage(userId, message);
        });

        // 发送完成标记
        sseEmitterManager.sendMessage(userId,
            "{\"type\":\"ai_done\",\"content\":\"\"}");
    }
}
```

## 集群部署

### 集群消息分发

通过 Redis 发布订阅实现集群环境下的消息同步:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    集群消息分发流程                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────┐                                                       │
│   │ Client  │ 发送请求到某个节点                                      │
│   └────┬────┘                                                       │
│        │                                                            │
│        ▼                                                            │
│   ┌─────────┐     publishMessage()    ┌─────────────────────────┐  │
│   │ Node 1  │─────────────────────────▶│    Redis Pub/Sub       │  │
│   │ (处理节点)│                         │   Topic: global:sse    │  │
│   └─────────┘                          └───────────┬─────────────┘  │
│                                                    │                │
│                              订阅消息分发到所有节点   │                │
│                                                    │                │
│              ┌────────────────┬────────────────────┼────────────────┐
│              │                │                    │                │
│              ▼                ▼                    ▼                │
│     ┌─────────────┐  ┌─────────────┐      ┌─────────────┐          │
│     │   Node 1    │  │   Node 2    │      │   Node 3    │          │
│     │  Listener   │  │  Listener   │      │  Listener   │          │
│     └──────┬──────┘  └──────┬──────┘      └──────┬──────┘          │
│            │                │                    │                 │
│            ▼                ▼                    ▼                 │
│     ┌─────────────┐  ┌─────────────┐      ┌─────────────┐          │
│     │ 本地连接的   │  │ 本地连接的   │      │ 本地连接的   │          │
│     │   用户      │  │   用户      │      │   用户      │          │
│     └─────────────┘  └─────────────┘      └─────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### SseTopicListener

```java
@Slf4j
public class SseTopicListener implements ApplicationRunner, Ordered {

    @Autowired
    private SseEmitterManager sseEmitterManager;

    @Override
    public void run(ApplicationArguments args) {
        sseEmitterManager.subscribeMessage((message) -> {
            log.info("SSE主题订阅收到消息session keys={} message={}",
                message.getUserIds(), message.getMessage());

            // 根据userIds判断推送方式
            if (CollUtil.isNotEmpty(message.getUserIds())) {
                // 向指定用户推送消息
                message.getUserIds().forEach(userId -> {
                    sseEmitterManager.sendMessage(userId, message.getMessage());
                });
            } else {
                // 向所有用户广播消息
                sseEmitterManager.sendMessage(message.getMessage());
            }
        });
        log.info("初始化SSE主题订阅监听器成功");
    }

    @Override
    public int getOrder() {
        return -1;  // 高优先级
    }
}
```

## 高级特性

### 1. 消息格式化

```java
@Service
public class MessageService {

    /**
     * 发送 JSON 格式消息
     */
    public void sendJsonMessage(Long userId, Object data) {
        try {
            String jsonMessage = JsonUtils.toJsonString(data);
            SseMessageUtils.sendMessage(userId, jsonMessage);
        } catch (Exception e) {
            log.error("发送JSON消息失败", e);
        }
    }

    /**
     * 发送带类型的消息
     */
    public void sendTypedMessage(Long userId, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        String jsonMessage = JsonUtils.toJsonString(message);
        SseMessageUtils.sendMessage(userId, jsonMessage);
    }
}
```

### 2. 进度条推送

```java
@Service
public class TaskProgressService {

    /**
     * 推送任务进度
     */
    public void pushProgress(Long userId, String taskId, int progress, String status) {
        Map<String, Object> progressData = new HashMap<>();
        progressData.put("type", "progress");
        progressData.put("taskId", taskId);
        progressData.put("progress", progress);
        progressData.put("status", status);

        String message = JsonUtils.toJsonString(progressData);
        SseMessageUtils.sendMessage(userId, message);
    }

    /**
     * 文件上传进度示例
     */
    public void uploadFile(Long userId, String taskId, MultipartFile file) {
        long totalSize = file.getSize();
        long uploadedSize = 0;

        // 模拟分块上传
        while (uploadedSize < totalSize) {
            // 上传逻辑...
            uploadedSize += 1024 * 100;  // 每次上传 100KB

            int progress = (int) (uploadedSize * 100 / totalSize);
            pushProgress(userId, taskId, progress, "uploading");
        }

        pushProgress(userId, taskId, 100, "completed");
    }
}
```

### 3. 日志流式输出

```java
@Service
public class LogStreamService {

    /**
     * 流式推送日志
     */
    public void streamLogs(Long userId, String logFile) {
        try (BufferedReader reader = new BufferedReader(new FileReader(logFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Map<String, Object> logData = new HashMap<>();
                logData.put("type", "log");
                logData.put("content", line);
                logData.put("timestamp", System.currentTimeMillis());

                String message = JsonUtils.toJsonString(logData);
                SseMessageUtils.sendMessage(userId, message);

                Thread.sleep(100);  // 控制推送速率
            }
        } catch (Exception e) {
            log.error("日志流式输出异常", e);
        }
    }
}
```

## 最佳实践

### 1. 客户端最佳实践

```javascript
class SseClient {
    constructor(url, options = {}) {
        this.url = url;
        this.options = options;
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.reconnectAttempts = 0;
        this.eventSource = null;
        this.handlers = {};
    }

    connect() {
        this.eventSource = new EventSource(this.url);

        this.eventSource.onopen = () => {
            console.log('SSE 连接已建立');
            this.reconnectAttempts = 0;
        };

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (e) {
                console.error('消息解析错误:', e);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('SSE 连接错误:', error);
            this.eventSource.close();
            this.reconnect();
        };
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`${this.reconnectInterval / 1000}秒后重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectInterval);
        } else {
            console.error('达到最大重连次数，停止重连');
        }
    }

    on(type, handler) {
        this.handlers[type] = handler;
    }

    handleMessage(data) {
        const handler = this.handlers[data.type];
        if (handler) {
            handler(data);
        }
    }

    close() {
        if (this.eventSource) {
            this.eventSource.close();
            fetch('/resource/sse/close');
        }
    }
}

// 使用示例
const sseClient = new SseClient('/resource/sse', {
    reconnectInterval: 3000,
    maxReconnectAttempts: 10
});

sseClient.on('order', (data) => {
    console.log('订单更新:', data);
});

sseClient.on('system', (data) => {
    console.log('系统通知:', data);
});

sseClient.connect();
```

### 2. 服务端最佳实践

```java
@Service
@Slf4j
public class SseNotificationService {

    /**
     * 发送消息并处理失败情况
     */
    public boolean sendWithRetry(Long userId, String message, int maxRetries) {
        for (int i = 0; i < maxRetries; i++) {
            try {
                SseMessageUtils.sendMessage(userId, message);
                return true;
            } catch (Exception e) {
                log.warn("SSE 发送失败，尝试次数: {}/{}", i + 1, maxRetries, e);
                if (i < maxRetries - 1) {
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }
        return false;
    }

    /**
     * 批量发送消息
     */
    public void batchSend(List<Long> userIds, String message) {
        // 分批发送，避免阻塞
        int batchSize = 100;
        for (int i = 0; i < userIds.size(); i += batchSize) {
            List<Long> batch = userIds.subList(i, Math.min(i + batchSize, userIds.size()));
            SseMessageDto dto = SseMessageDto.of(batch, message);
            SseMessageUtils.publishMessage(dto);
        }
    }
}
```

### 3. 消息去重

```java
@Service
public class DeduplicatedMessageService {

    private final RedissonClient redissonClient;
    private static final String DEDUP_PREFIX = "sse:dedup:";

    /**
     * 发送去重消息
     */
    public void sendDeduplicatedMessage(Long userId, String messageId, String content) {
        String key = DEDUP_PREFIX + userId + ":" + messageId;
        RBucket<String> bucket = redissonClient.getBucket(key);

        // 使用 setIfAbsent 实现去重
        if (bucket.setIfAbsent("1", Duration.ofMinutes(5))) {
            SseMessageUtils.sendMessage(userId, content);
        } else {
            log.debug("消息已发送，跳过: userId={}, messageId={}", userId, messageId);
        }
    }
}
```

## 故障排查

### 1. 连接建立失败

**原因**: 用户未登录或 Token 无效

**解决**: 确保客户端请求时携带有效的认证信息

```javascript
// 确保登录后再建立 SSE 连接
if (isLoggedIn()) {
    const eventSource = new EventSource('/resource/sse');
}
```

### 2. 消息发送失败

**原因**: 用户连接已断开或网络异常

**解决**: 系统会自动清理无效连接,重要消息建议配合持久化机制

### 3. SSE 功能未启用

**原因**: 配置文件未正确设置

**解决**:
```yaml
sse:
  enabled: true  # 确保启用
  path: /resource/sse
```

### 4. 集群环境消息不同步

**原因**: Redis 连接异常

**解决**: 检查 Redis 配置和连接状态

### 5. 连接超时

**原因**: 长时间无消息导致连接被代理服务器关闭

**解决**:
- 定期发送心跳消息
- 配置 Nginx 等代理的超时时间

```nginx
location /resource/sse {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 86400s;  # 设置较长的超时时间
}
```

## 性能优化

### 1. 连接管理优化

- **连接数限制**: 建议为每个用户设置最大连接数限制
- **心跳检测**: 定期发送心跳消息检测连接有效性
- **资源清理**: 及时清理无效连接释放内存

### 2. 消息发送优化

- **批量发送**: 对于大量用户的广播消息,考虑分批发送
- **消息压缩**: 对于大型消息内容,考虑使用压缩算法
- **异步处理**: 消息发送采用异步方式避免阻塞主线程

### 3. 日志监控

| 日志类型 | 示例 |
|---------|------|
| 连接建立 | `SSE连接建立 userId={}, token={}` |
| 消息发送 | `SSE发送消息 userId={}, message={}` |
| 连接断开 | `SSE连接断开 userId={}, token={}` |
| Redis 消息 | `SSE主题订阅收到消息 userIds={}, message={}` |

## 技术栈

- **Spring Boot**: Web MVC, SseEmitter
- **Redis**: Pub/Sub 消息分发
- **Sa-Token**: 用户认证
- **HTML5 SSE**: Server-Sent Events 标准
