# 通讯 (websocket) 

## 概述

WebSocket 通讯模块 (`ruoyi-common-websocket`) 提供实时双向通信与消息推送功能，支持分布式环境下的多服务实例消息分发。

### 核心特性

- **实时双向通信**：基于 Spring Boot WebSocket 实现
- **分布式消息分发**：基于 Redis 发布订阅机制实现跨服务实例消息推送
- **用户认证集成**：集成 SaToken 认证框架，确保连接安全
- **智能消息路由**：优先本地发送，跨实例自动路由
- **会话管理**：线程安全的用户会话管理
- **心跳检测**：内置心跳机制保持连接活跃

## 架构设计

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
    
    <!-- Spring Boot WebSocket -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
</dependencies>
```

### 核心组件

#### 1. 配置层 (Configuration)

**WebSocketConfig** - 主配置类
- 自动配置条件：`websocket.enabled=true`
- 配置WebSocket端点、拦截器、处理器
- 初始化主题监听器

**WebSocketProperties** - 配置属性类
```yaml
websocket:
  enabled: true              # 是否启用WebSocket
  path: "/websocket"         # 服务端点路径
  allowedOrigins: "*"        # 允许跨域的源地址
```

#### 2. 拦截器层 (Interceptor)

**PlusWebSocketInterceptor** - 握手拦截器
- 用户身份认证验证
- 登录状态检查
- 用户信息注入会话属性

#### 3. 处理器层 (Handler)

**PlusWebSocketHandler** - 消息处理器
- 连接建立与关闭处理
- 文本/二进制消息处理
- 心跳检测（Ping/Pong）
- 传输错误处理

#### 4. 会话管理层 (Session Management)

**WebSocketSessionHolder** - 会话管理器
- 线程安全的会话存储 (ConcurrentHashMap)
- 会话添加、移除、查询
- 在线用户管理

#### 5. 工具层 (Utilities)

**WebSocketUtils** - 工具类
- 消息发送（单点、批量、群发）
- Redis发布订阅消息处理
- 智能消息路由分发

#### 6. 监听器层 (Listener)

**WebSocketTopicListener** - 主题监听器
- 应用启动时初始化Redis订阅
- 跨服务实例消息分发处理
- 定向推送和群发消息处理

## 消息流转机制

### 智能分发策略

1. **本地优先**：优先在当前服务实例内直接发送消息
2. **跨实例路由**：对于不在当前实例的用户，通过Redis发布订阅机制分发到其他实例

### 消息流程图

```
发送消息 → 检查本地会话 → 存在？
                ↓              ↓
              直接发送      加入Redis队列
                ↓              ↓
              完成          发布到主题
                             ↓
                         其他实例监听
                             ↓
                         处理并发送
```

## API 使用指南

### 配置启用

在 `application.yml` 中配置：

```yaml
websocket:
  enabled: true
  path: "/websocket"
  allowedOrigins: "*"
```

### 消息发送API

#### 1. 向指定用户发送消息

```java
// 向单个用户发送消息
WebSocketUtils.sendMessage(userId, "Hello World");

// 向多个用户发送消息
WebSocketMessageDto message = new WebSocketMessageDto();
message.setSessionKeys(Arrays.asList(user1Id, user2Id, user3Id));
message.setMessage("批量消息内容");
WebSocketUtils.publishMessage(message);
```

#### 2. 群发消息

```java
// 向所有在线用户发送消息
WebSocketUtils.publishAll("系统公告：服务将在10分钟后维护");
```

#### 3. 消息订阅

```java
// 订阅WebSocket消息主题（通常在监听器中使用）
WebSocketUtils.subscribeMessage(message -> {
    // 处理接收到的消息
    System.out.println("收到消息: " + message.getMessage());
    System.out.println("目标用户: " + message.getSessionKeys());
});
```

### 会话管理API

```java
// 检查用户是否在线
boolean isOnline = WebSocketSessionHolder.existSession(userId);

// 获取用户会话
WebSocketSession session = WebSocketSessionHolder.getSessions(userId);

// 获取所有在线用户
Set<Long> onlineUsers = WebSocketSessionHolder.getSessionsAll();

// 移除用户会话
WebSocketSessionHolder.removeSession(userId);
```

#### 4. 业务场景集成示例

**实时通知推送**

```java
@Service
public class NotificationPushService {
    
    /**
     * 推送订单状态变更通知
     */
    public void pushOrderStatusChange(Long userId, String orderId, String status) {
        WebSocketMessage message = WebSocketMessage.create(
            "order_status", 
            "订单状态更新", 
            Map.of("orderId", orderId, "status", status)
        );
        
        WebSocketUtils.sendMessage(userId, JsonUtils.toJsonString(message));
    }
    
    /**
     * 推送系统维护通知
     */
    public void pushSystemMaintenance(String content, LocalDateTime scheduleTime) {
        WebSocketMessage message = WebSocketMessage.create(
            "system_notice", 
            "系统维护通知", 
            Map.of("content", content, "scheduleTime", scheduleTime)
        );
        
        // 向所有在线用户推送
        WebSocketUtils.publishAll(JsonUtils.toJsonString(message));
    }
}
```

**在线状态管理**

```java
@Service
public class OnlineUserService {
    
    /**
     * 获取在线用户列表
     */
    public List<Long> getOnlineUsers() {
        return new ArrayList<>(WebSocketSessionHolder.getSessionsAll());
    }
    
    /**
     * 获取在线用户数量
     */
    public int getOnlineUserCount() {
        return WebSocketSessionHolder.getSessionsAll().size();
    }
    
    /**
     * 检查指定用户是否在线
     */
    public boolean isUserOnline(Long userId) {
        return WebSocketSessionHolder.existSession(userId);
    }
    
    /**
     * 强制下线指定用户
     */
    public void forceOffline(Long userId, String reason) {
        WebSocketMessage message = WebSocketMessage.create(
            "force_offline", 
            "强制下线", 
            Map.of("reason", reason)
        );
        
        // 发送下线通知
        WebSocketUtils.sendMessage(userId, JsonUtils.toJsonString(message));
        
        // 移除会话
        WebSocketSessionHolder.removeSession(userId);
    }
}
```

**消息过滤与路由**

```java
@Component
public class MessageFilter {
    
    /**
     * 根据用户权限过滤消息
     */
    public boolean canReceiveMessage(Long userId, WebSocketMessage message) {
        // 根据消息类型和用户权限判断
        switch (message.getType()) {
            case "admin_notice":
                return hasAdminRole(userId);
            case "vip_promotion":
                return hasVipLevel(userId);
            default:
                return true;
        }
    }
    
    /**
     * 消息路由处理
     */
    public void routeMessage(WebSocketMessage message, List<Long> targetUsers) {
        // 过滤有权限接收消息的用户
        List<Long> filteredUsers = targetUsers.stream()
            .filter(userId -> canReceiveMessage(userId, message))
            .collect(Collectors.toList());
            
        if (!filteredUsers.isEmpty()) {
            WebSocketMessageDto dto = new WebSocketMessageDto();
            dto.setSessionKeys(filteredUsers);
            dto.setMessage(JsonUtils.toJsonString(message));
            
            WebSocketUtils.publishMessage(dto);
        }
    }
    
    private boolean hasAdminRole(Long userId) {
        // 检查用户是否有管理员权限
        return LoginHelper.hasRole("admin");
    }
    
    private boolean hasVipLevel(Long userId) {
        // 检查用户是否为VIP
        return false; // 具体实现根据业务逻辑
    }
}

## 后端服务集成

### 在业务模块中使用WebSocket

#### 1. 注入依赖

由于WebSocket模块通过自动配置加载，您可以直接在业务代码中使用：

```java
@Service
public class NotificationService {
    
    /**
     * 发送系统通知
     */
    public void sendSystemNotification(Long userId, String title, String content) {
        // 构造通知消息
        String message = String.format("{\"type\":\"notification\",\"title\":\"%s\",\"content\":\"%s\"}", 
            title, content);
        
        // 发送给指定用户
        WebSocketUtils.sendMessage(userId, message);
    }
    
    /**
     * 发送业务消息
     */
    public void sendBusinessMessage(List<Long> userIds, Object data) {
        WebSocketMessageDto messageDto = new WebSocketMessageDto();
        messageDto.setSessionKeys(userIds);
        messageDto.setMessage(JsonUtils.toJsonString(data));
        
        WebSocketUtils.publishMessage(messageDto);
    }
}
```

#### 2. 消息格式标准化

建议定义统一的消息格式：

```java
@Data
public class WebSocketMessage {
    /**
     * 消息类型：notification、chat、system、business等
     */
    private String type;
    
    /**
     * 消息标题
     */
    private String title;
    
    /**
     * 消息内容
     */
    private Object content;
    
    /**
     * 时间戳
     */
    private Long timestamp;
    
    /**
     * 发送者ID
     */
    private Long senderId;
    
    /**
     * 扩展数据
     */
    private Map<String, Object> extra;
    
    public static WebSocketMessage create(String type, String title, Object content) {
        WebSocketMessage message = new WebSocketMessage();
        message.setType(type);
        message.setTitle(title);
        message.setContent(content);
        message.setTimestamp(System.currentTimeMillis());
        return message;
    }
}
```

#### 3. 事件驱动的消息推送

使用Spring事件机制实现解耦的消息推送：

```java
// 定义WebSocket消息事件
@Data
@AllArgsConstructor
public class WebSocketMessageEvent {
    private List<Long> userIds;
    private WebSocketMessage message;
}

// 事件发布者
@Service
public class MessagePublisher {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void publishMessage(List<Long> userIds, WebSocketMessage message) {
        eventPublisher.publishEvent(new WebSocketMessageEvent(userIds, message));
    }
}

// 事件监听者
@Component
@Slf4j
public class WebSocketMessageListener {
    
    @EventListener
    @Async("websocketExecutor")
    public void handleWebSocketMessage(WebSocketMessageEvent event) {
        try {
            String messageContent = JsonUtils.toJsonString(event.getMessage());
            
            WebSocketMessageDto dto = new WebSocketMessageDto();
            dto.setSessionKeys(event.getUserIds());
            dto.setMessage(messageContent);
            
            WebSocketUtils.publishMessage(dto);
            
            log.info("WebSocket消息推送成功，用户数：{}", event.getUserIds().size());
        } catch (Exception e) {
            log.error("WebSocket消息推送失败", e);
        }
    }
}
```

## 核心实现原理

### 连接认证机制

WebSocket连接建立时的认证流程基于SaToken框架：

```java
@Override
public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Map<String, Object> attributes) {
    try {
        // 从请求中获取token并验证用户登录状态
        LoginUser loginUser = LoginHelper.getLoginUser();
        
        // 将用户信息存储到WebSocket会话属性中
        attributes.put(LOGIN_USER, loginUser);
        return true;
    } catch (NotLoginException e) {
        log.error("WebSocket 认证失败: {}", e.getMessage());
        return false; // 拒绝连接
    }
}
```

### 会话生命周期管理

**连接建立**：
1. 通过握手拦截器验证用户身份
2. 将用户信息注入WebSocket会话属性
3. 在会话管理器中注册用户会话映射
4. 记录连接建立日志

**消息处理**：
1. 从会话属性中获取用户信息
2. 构造消息传输对象
3. 调用消息发布机制

**连接关闭**：
1. 从会话属性中获取用户信息
2. 从会话管理器中移除用户映射
3. 关闭底层WebSocket连接
4. 记录连接关闭日志

### 分布式消息分发机制

**智能路由算法**：

```java
public static void publishMessage(WebSocketMessageDto webSocketMessage) {
    List<Long> unsentSessionKeys = new ArrayList<>();

    // 第一阶段：本地会话处理
    for (Long sessionKey : webSocketMessage.getSessionKeys()) {
        if (WebSocketSessionHolder.existSession(sessionKey)) {
            // 用户在当前实例，直接发送
            sendMessage(sessionKey, webSocketMessage.getMessage());
        } else {
            // 用户不在当前实例，标记为待分发
            unsentSessionKeys.add(sessionKey);
        }
    }

    // 第二阶段：跨实例分发
    if (CollUtil.isNotEmpty(unsentSessionKeys)) {
        WebSocketMessageDto broadcastMessage = new WebSocketMessageDto();
        broadcastMessage.setMessage(webSocketMessage.getMessage());
        broadcastMessage.setSessionKeys(unsentSessionKeys);

        // 通过Redis发布订阅分发到其他实例
        RedisUtils.publish(WEB_SOCKET_TOPIC, broadcastMessage, consumer -> {
            log.info("WebSocket跨实例消息分发 - 目标用户：{}", unsentSessionKeys);
        });
    }
}
```

**订阅处理机制**：

```java
// 监听Redis主题消息
WebSocketUtils.subscribeMessage((message) -> {
    if (CollUtil.isNotEmpty(message.getSessionKeys())) {
        // 定向推送：检查用户是否在当前实例
        message.getSessionKeys().forEach(key -> {
            if (WebSocketSessionHolder.existSession(key)) {
                WebSocketUtils.sendMessage(key, message.getMessage());
            }
        });
    } else {
        // 群发消息：向当前实例所有在线用户发送
        WebSocketSessionHolder.getSessionsAll().forEach(key -> {
            WebSocketUtils.sendMessage(key, message.getMessage());
        });
    }
});
```

### 线程安全保证

**会话并发管理**：
- 使用`ConcurrentHashMap`保证线程安全的会话存储
- 会话添加/移除操作的原子性处理
- synchronized关键字保证消息发送的线程安全

```java
private static synchronized void sendMessage(WebSocketSession session, WebSocketMessage<?> message) {
    if (session == null || !session.isOpen()) {
        log.warn("WebSocket会话已关闭，无法发送消息");
        return;
    }

    try {
        session.sendMessage(message);
    } catch (IOException e) {
        log.error("WebSocket消息发送失败，会话ID：{}，异常：{}", 
            session.getId(), e.getMessage(), e);
    }
}
```

## 最佳实践

### 1. 连接管理

- 实现客户端重连机制
- 定期清理无效连接
- 合理设置连接超时时间

### 2. 消息处理

- 对大量消息进行批量处理
- 实现消息确认机制
- 考虑消息持久化需求

### 3. 性能优化

- 使用连接池管理WebSocket连接
- 对频繁的消息推送进行合并
- 监控内存使用情况

### 4. 安全考虑

- 确保所有WebSocket连接都经过认证
- 实施消息内容验证
- 防止消息泛滥攻击

## 常见问题

### Q1: WebSocket连接认证失败

**问题**：客户端无法建立WebSocket连接，提示认证失败

**解决方案**：
1. 确保客户端已正确登录并获取有效token
2. 检查token是否正确传递给WebSocket握手请求
3. 验证SaToken配置是否正确

### Q2: 消息发送到其他服务实例失败

**问题**：在集群环境中，消息无法发送到其他服务实例的用户

**解决方案**：
1. 检查Redis连接配置
2. 验证Redis发布订阅功能是否正常
3. 确认WebSocketTopicListener是否正确初始化

### Q3: 内存泄漏问题

**问题**：长时间运行后出现内存泄漏

**解决方案**：
1. 确保连接关闭时正确清理会话
2. 定期检查并清理无效会话
3. 监控WebSocketSessionHolder中的会话数量

### Q4: 跨域问题

**问题**：浏览器提示跨域错误

**解决方案**：
1. 配置正确的allowedOrigins
2. 确保WebSocket协议与页面协议匹配
3. 检查代理服务器的WebSocket配置

## 监控与日志

### 关键监控指标

- 在线用户数量
- 消息发送成功率
- 连接建立/断开频率
- Redis发布订阅延迟

### 日志配置

```yaml
logging:
  level:
    plus.ruoyi.common.websocket: DEBUG
```

### 示例监控代码

```java
@Component
public class WebSocketMonitor {
    
    @Scheduled(fixedRate = 60000) // 每分钟统计一次
    public void logStatistics() {
        int onlineUsers = WebSocketSessionHolder.getSessionsAll().size();
        log.info("当前在线用户数: {}", onlineUsers);
    }
}
```

## 扩展开发

### 自定义消息处理器

```java
@Component
public class CustomMessageHandler {
    
    @EventListener
    public void handleCustomMessage(WebSocketMessageDto message) {
        // 自定义消息处理逻辑
        if (message.getMessage().startsWith("CUSTOM:")) {
            // 处理自定义消息
        }
    }
}
```

### 消息持久化

```java
@Service
public class MessagePersistenceService {
    
    public void saveMessage(WebSocketMessageDto message) {
        // 将消息保存到数据库
        // 用于离线用户消息推送
    }
    
    public List<WebSocketMessageDto> getOfflineMessages(Long userId) {
        // 获取用户离线期间的消息
        return Collections.emptyList();
    }
}
```
