# 通讯 (WebSocket)

## 概述

WebSocket 通讯模块 (`ruoyi-common-websocket`) 提供实时双向通信与消息推送功能，支持分布式环境下的多服务实例消息分发。该模块采用现代化的架构设计，具备高性能、高可用性和企业级的安全特性。

### 核心特性

- **实时双向通信**：基于 Spring Boot WebSocket 实现高性能的实时通信
- **多租户隔离**：完整的多租户支持，确保不同租户间的数据和连接完全隔离
- **多连接支持**：同一用户可在多个设备/浏览器标签页建立多个连接，避免互相挤号
- **分布式消息分发**：基于 Redis 发布订阅机制实现跨服务实例消息推送
- **用户认证集成**：集成 SaToken 认证框架，确保连接安全
- **智能消息路由**：优先本地发送，跨实例自动路由
- **会话管理**：线程安全的用户会话管理，支持三级映射结构
- **心跳检测**：内置心跳机制保持连接活跃
- **权限控制**：细粒度的管理员权限控制，支持超级管理员和租户管理员

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

    <!-- 租户模块 - 多租户支持 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-tenant</artifactId>
    </dependency>

    <!-- Spring Boot WebSocket -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
</dependencies>
```

### 多租户架构

采用三级映射结构实现多租户隔离：

```
租户会话映射表:
{
  "000000": {          // 默认租户
    1001: {            // 用户ID
      "session_001": WebSocketSession1,
      "session_002": WebSocketSession2
    }
  },
  "100001": {          // 租户1
    2001: {            // 用户ID
      "session_003": WebSocketSession3
    }
  }
}
```

#### 多租户隔离特性

- **连接隔离**：每个租户的WebSocket连接完全独立管理
- **消息隔离**：消息只在租户内传递，不会跨租户泄露
- **权限隔离**：租户管理员只能管理本租户的连接和用户
- **统计隔离**：连接统计按租户分别计算

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
  path: "/websocket"         # 服务端点路径，默认 "/websocket"
  allowedOrigins: "*"        # 允许跨域的源地址，默认 "*"
```

#### 2. 拦截器层 (Interceptor)

**PlusWebSocketInterceptor** - 握手拦截器
- 用户身份认证验证
- 登录状态检查
- 用户信息注入会话属性
- 支持多租户上下文验证

#### 3. 处理器层 (Handler)

**PlusWebSocketHandler** - 消息处理器
- 连接建立与关闭处理
- 支持多种格式的心跳检测（简单字符串、JSON格式）
- 文本/二进制消息处理
- 传输错误处理
- 多连接场景下的精确连接管理

#### 4. 会话管理层 (Session Management)

**WebSocketSessionHolder** - 会话管理器
- 三级映射结构：tenantId -> userId -> (sessionId -> WebSocketSession)
- 线程安全的会话存储 (ConcurrentHashMap)
- 支持同一用户多连接管理
- 会话添加、移除、查询
- 在线用户管理（支持全局和租户级别）
- 连接统计功能

#### 5. 工具层 (Utilities)

**WebSocketUtils** - 工具类
- 消息发送（单点、批量、群发）
- 智能消息路由分发
- 跨租户消息发送（超级管理员专用）
- 全局消息广播（超级管理员专用）
- Redis发布订阅消息处理
- 权限验证集成

#### 6. 监听器层 (Listener)

**WebSocketTopicListener** - 主题监听器
- 应用启动时初始化Redis订阅
- 跨服务实例消息分发处理
- 支持全局消息、租户消息、定向消息处理
- 多租户上下文动态切换

#### 7. 管理层 (Administration)

**WebSocketAdminController** - 管理控制器
- 提供完整的WebSocket管理API
- 支持超级管理员和租户管理员权限控制
- 连接统计查询
- 在线用户管理
- 消息推送管理
- 连接断开管理

## 消息流转机制

### 智能分发策略

1. **本地优先**：优先在当前服务实例内直接发送消息给用户的所有连接
2. **跨实例路由**：对于不在当前实例的用户，通过Redis发布订阅机制分发到其他实例
3. **租户隔离**：确保消息只在指定租户内传递
4. **多连接支持**：向用户的所有活跃连接发送消息

### 消息流程图

```
发送消息 → 检查租户权限 → 获取目标用户连接
                ↓              ↓
             权限验证        本地连接存在？
                ↓              ↓              ↓
             通过检查      发送到所有连接    加入Redis队列
                            ↓              ↓
                          完成          发布到主题
                                         ↓
                                    其他实例监听
                                         ↓
                                    租户上下文切换
                                         ↓
                                    处理并发送到所有连接
```

## API 使用指南

### 配置启用

在 `application.yml` 中配置：

```yaml
websocket:
  enabled: true                    # 启用WebSocket功能
  path: "/resource/websocket"      # WebSocket端点路径
  allowedOrigins: "*"              # 允许的跨域源
```

### 核心API

#### 1. 消息发送API

**向指定用户发送消息（发送到用户的所有连接）**

```java
// 向单个用户的所有连接发送消息
WebSocketUtils.sendMessage(userId, "Hello World");

// 向多个用户发送消息
List<Long> userIds = Arrays.asList(1001L, 1002L, 1003L);
WebSocketMessageDto message = WebSocketMessageDto.of(userIds, "批量消息内容");
WebSocketUtils.publishMessage(message);
```

**向用户的特定连接发送消息**

```java
// 向用户的特定连接发送消息
boolean success = WebSocketUtils.sendMessage(userId, sessionId, "特定连接消息");
```

**群发消息**

```java
// 向当前租户的所有在线用户发送消息
WebSocketUtils.publishAll("系统公告：服务将在10分钟后维护");

// 向所有租户的所有在线用户发送消息（需要超级管理员权限）
WebSocketUtils.publishGlobal("全局系统维护通知");

// 跨租户发送消息（需要超级管理员权限）
WebSocketUtils.publishCrossTenant("100001", Arrays.asList(2001L, 2002L), "跨租户消息");
```

#### 2. 会话管理API

```java
// 检查用户是否在线（当前租户）
boolean isOnline = WebSocketSessionHolder.isUserOnline(userId);

// 获取用户的所有会话（当前租户）
Map<String, WebSocketSession> userSessions = WebSocketSessionHolder.getUserSessions(userId);

// 获取用户的特定会话
WebSocketSession session = WebSocketSessionHolder.getSession(userId, sessionId);

// 获取当前租户所有在线用户ID
Set<Long> onlineUsers = WebSocketSessionHolder.getAllUserIds();

// 获取全局所有在线用户ID（超级管理员专用）
Set<Long> globalOnlineUsers = WebSocketSessionHolder.getGlobalAllUserIds();

// 移除用户的特定会话
WebSocketSessionHolder.removeSessionById(userId, sessionId);

// 移除用户的所有会话
WebSocketSessionHolder.removeAllSessions(userId);
```

#### 3. 统计信息API

```java
// 获取当前租户连接统计
WebSocketSessionHolder.ConnectionStats stats = WebSocketUtils.getConnectionStats();

// 获取全局连接统计（超级管理员专用）
WebSocketSessionHolder.ConnectionStats globalStats = WebSocketUtils.getGlobalConnectionStats();
```

#### 4. 消息订阅API

```java
// 订阅WebSocket消息主题（通常在监听器中使用）
WebSocketUtils.subscribeMessage(message -> {
    // 处理接收到的消息
    if (message.isGlobal()) {
        System.out.println("收到全局消息: " + message.getMessage());
    } else if (message.isBroadcast()) {
        System.out.println("收到租户广播消息: " + message.getMessage());
    } else {
        System.out.println("收到定向消息: " + message.getMessage());
        System.out.println("目标用户: " + message.getUserIds());
    }
});
```

### 管理API

#### 1. 连接统计

```java
@RestController
@RequestMapping("/webSocket")
public class WebSocketController {
    
    /**
     * 获取连接统计信息
     */
    @GetMapping("/getStats")
    @SaCheckRole(value = {TenantConstants.SUPER_ADMIN_ROLE_KEY, TenantConstants.TENANT_ADMIN_ROLE_KEY}, mode = SaMode.OR)
    public R<WebSocketSessionHolder.ConnectionStats> getStats() {
        if (LoginHelper.isSuperAdmin()) {
            // 超级管理员查看全局统计
            return R.ok(WebSocketUtils.getGlobalConnectionStats());
        } else {
            // 租户管理员查看本租户统计
            return R.ok(WebSocketUtils.getConnectionStats());
        }
    }
}
```

#### 2. 在线用户管理

```java
/**
 * 获取在线用户列表
 */
@GetMapping("/getOnlineUsers")
@SaCheckRole(value = {TenantConstants.SUPER_ADMIN_ROLE_KEY, TenantConstants.TENANT_ADMIN_ROLE_KEY}, mode = SaMode.OR)
public R<Set<Long>> getOnlineUsers(@RequestParam(required = false, defaultValue = "false") boolean global) {
    if (global && LoginHelper.isSuperAdmin()) {
        // 超级管理员查看全局在线用户
        return R.ok(WebSocketSessionHolder.getGlobalAllUserIds());
    } else {
        // 查看当前租户在线用户
        return R.ok(WebSocketSessionHolder.getAllUserIds());
    }
}
```

#### 3. 消息推送管理

```java
/**
 * 向指定用户发送消息
 */
@PostMapping("/sendUserMessage")
@SaCheckRole(value = {TenantConstants.SUPER_ADMIN_ROLE_KEY, TenantConstants.TENANT_ADMIN_ROLE_KEY}, mode = SaMode.OR)
public R<Void> sendUserMessage(@RequestBody SendUserMessageRequest request) {
    WebSocketUtils.publishMessage(WebSocketMessageDto.of(request.getUserId(), request.getMessage()));
    return R.ok();
}

/**
 * 广播消息
 */
@PostMapping("/broadcastMessage")
@SaCheckRole(value = {TenantConstants.SUPER_ADMIN_ROLE_KEY, TenantConstants.TENANT_ADMIN_ROLE_KEY}, mode = SaMode.OR)
public R<Void> broadcastMessage(@RequestBody BroadcastMessageRequest request) {
    if (request.isGlobal() && LoginHelper.isSuperAdmin()) {
        // 超级管理员全局群发
        WebSocketUtils.publishGlobal(request.getMessage());
    } else {
        // 当前租户群发
        WebSocketUtils.publishAll(request.getMessage());
    }
    return R.ok();
}
```

### 业务场景集成示例

#### 1. 实时通知推送

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
     * 推送系统维护通知（租户级别）
     */
    public void pushTenantMaintenance(String content, LocalDateTime scheduleTime) {
        WebSocketMessage message = WebSocketMessage.create(
            "system_notice", 
            "系统维护通知", 
            Map.of("content", content, "scheduleTime", scheduleTime)
        );
        
        // 向当前租户所有在线用户推送
        WebSocketUtils.publishAll(JsonUtils.toJsonString(message));
    }
    
    /**
     * 推送全局系统维护通知（超级管理员专用）
     */
    public void pushGlobalMaintenance(String content, LocalDateTime scheduleTime) {
        if (!LoginHelper.isSuperAdmin()) {
            throw new RuntimeException("无权限执行全局推送操作");
        }
        
        WebSocketMessage message = WebSocketMessage.create(
            "global_notice", 
            "全局系统维护通知", 
            Map.of("content", content, "scheduleTime", scheduleTime)
        );
        
        // 向所有租户所有在线用户推送
        WebSocketUtils.publishGlobal(JsonUtils.toJsonString(message));
    }
}
```

#### 2. 多连接场景处理

```java
@Service
public class MultiConnectionService {
    
    /**
     * 向用户的所有设备推送消息
     */
    public void pushToAllDevices(Long userId, String message) {
        // 获取用户的所有连接
        Map<String, WebSocketSession> userSessions = WebSocketSessionHolder.getUserSessions(userId);
        
        log.info("向用户 {} 的 {} 个连接推送消息", userId, userSessions.size());
        
        // 发送到用户的所有连接
        WebSocketUtils.sendMessage(userId, message);
    }
    
    /**
     * 向用户的特定设备推送消息
     */
    public boolean pushToSpecificDevice(Long userId, String sessionId, String message) {
        return WebSocketUtils.sendMessage(userId, sessionId, message);
    }
    
    /**
     * 获取用户的连接详情
     */
    public UserConnectionInfo getUserConnectionInfo(Long userId) {
        Map<String, WebSocketSession> sessions = WebSocketSessionHolder.getUserSessions(userId);
        
        UserConnectionInfo info = new UserConnectionInfo();
        info.setUserId(userId);
        info.setTenantId(TenantHelper.getTenantId());
        info.setOnline(WebSocketSessionHolder.isUserOnline(userId));
        info.setConnectionCount(sessions.size());
        info.setSessionIds(sessions.keySet());
        
        return info;
    }
    
    /**
     * 强制断开用户的某个特定连接
     */
    public void disconnectSpecificSession(Long userId, String sessionId, String reason) {
        // 先发送断开通知
        WebSocketMessage message = WebSocketMessage.create(
            "force_disconnect", 
            "连接被管理员断开", 
            Map.of("reason", reason)
        );
        
        WebSocketUtils.sendMessage(userId, sessionId, JsonUtils.toJsonString(message));
        
        // 断开连接
        WebSocketSessionHolder.removeSessionById(userId, sessionId);
    }
}
```

#### 3. 租户隔离的消息处理

```java
@Service
public class TenantMessageService {
    
    /**
     * 向租户内的指定角色用户发送消息
     */
    public void sendToRoleUsers(String roleKey, String message) {
        // 获取当前租户具有指定角色的用户ID列表
        List<Long> roleUserIds = getUserIdsByRole(roleKey);
        
        if (CollUtil.isNotEmpty(roleUserIds)) {
            WebSocketMessageDto messageDto = WebSocketMessageDto.of(roleUserIds, message);
            WebSocketUtils.publishMessage(messageDto);
        }
    }
    
    /**
     * 跨租户消息发送（超级管理员专用）
     */
    public void sendCrossTenantMessage(String targetTenantId, List<Long> userIds, String message) {
        if (!LoginHelper.isSuperAdmin()) {
            throw new RuntimeException("无权限执行跨租户发送操作");
        }
        
        WebSocketUtils.publishCrossTenant(targetTenantId, userIds, message);
    }
    
    /**
     * 获取租户连接统计对比
     */
    public Map<String, Object> getTenantCompareStats() {
        if (!LoginHelper.isSuperAdmin()) {
            throw new RuntimeException("无权限查看全局统计");
        }
        
        Map<String, Object> result = new HashMap<>();
        
        // 全局统计
        WebSocketSessionHolder.ConnectionStats globalStats = WebSocketUtils.getGlobalConnectionStats();
        result.put("global", globalStats);
        
        // 各租户统计（需要切换租户上下文）
        Map<String, WebSocketSessionHolder.ConnectionStats> tenantStats = new HashMap<>();
        for (String tenantId : WebSocketSessionHolder.getAllTenantIds()) {
            TenantHelper.dynamic(tenantId, () -> {
                WebSocketSessionHolder.ConnectionStats stats = WebSocketUtils.getConnectionStats();
                tenantStats.put(tenantId, stats);
            });
        }
        result.put("tenants", tenantStats);
        
        return result;
    }
    
    private List<Long> getUserIdsByRole(String roleKey) {
        // 根据角色获取用户ID列表的具体实现
        // 这里需要根据实际的用户角色查询逻辑实现
        return Collections.emptyList();
    }
}
```

## 核心实现原理

### 多租户连接认证机制

WebSocket连接建立时的多租户认证流程：

```java
@Override
public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Map<String, Object> attributes) {
    try {
        // 从请求中获取token并验证用户登录状态（包含租户信息）
        LoginUser loginUser = LoginHelper.getLoginUser();
        
        // 验证租户权限和状态
        String tenantId = TenantHelper.getTenantId();
        if (StringUtils.isBlank(tenantId)) {
            log.error("WebSocket 认证失败: 无效的租户信息");
            return false;
        }
        
        // 将用户信息存储到WebSocket会话属性中
        attributes.put(LOGIN_USER, loginUser);
        return true;
    } catch (NotLoginException e) {
        log.error("WebSocket 认证失败: {}, 无法访问系统资源", e.getMessage());
        return false; // 拒绝连接
    }
}
```

### 多连接会话生命周期管理

**连接建立**：
1. 通过握手拦截器验证用户身份和租户权限
2. 将用户信息注入WebSocket会话属性
3. 在会话管理器中注册用户会话映射（支持同一用户多个连接）
4. 使用sessionId作为连接的唯一标识
5. 记录连接建立日志和统计信息

**消息处理**：
1. 从会话属性中获取用户信息
2. 验证租户上下文
3. 处理心跳检测（支持多种格式）
4. 构造消息传输对象
5. 调用消息发布机制

**连接关闭**：
1. 从会话属性中获取用户信息
2. 从会话管理器中精确移除指定会话
3. 保留用户的其他活跃连接
4. 清理租户映射（如果用户无连接且租户无用户）
5. 记录连接关闭日志

### 多租户分布式消息分发机制

**智能路由算法**：

```java
public static void publishMessage(WebSocketMessageDto webSocketMessage) {
    // 确保消息对象有租户ID
    if (StringUtils.isBlank(webSocketMessage.getTenantId())) {
        webSocketMessage.setTenantId(TenantHelper.getTenantId());
    }
    
    String targetTenantId = webSocketMessage.getTenantId();
    List<Long> unsentUserIds = new ArrayList<>();

    // 第一阶段：本地会话处理（在目标租户上下文中）
    for (Long userId : webSocketMessage.getUserIds()) {
        if (WebSocketSessionHolder.isUserOnline(userId)) {
            // 用户在当前实例，发送到用户的所有连接
            sendMessage(userId, webSocketMessage.getMessage());
        } else {
            // 用户不在当前实例，标记为待分发
            unsentUserIds.add(userId);
        }
    }

    // 第二阶段：跨实例分发
    if (CollUtil.isNotEmpty(unsentUserIds)) {
        WebSocketMessageDto broadcastMessage = WebSocketMessageDto.of(unsentUserIds, webSocketMessage.getMessage());
        broadcastMessage.setTenantId(targetTenantId); // 保持租户信息

        // 通过Redis发布订阅分发到其他实例
        RedisUtils.publish(WEB_SOCKET_TOPIC, broadcastMessage, consumer -> {
            log.info("WebSocket跨实例消息分发 - 租户: {}, 目标用户：{}", targetTenantId, unsentUserIds);
        });
    }
}
```

**多租户订阅处理机制**：

```java
// 监听Redis主题消息
WebSocketUtils.subscribeMessage((message) -> {
    try {
        // 处理全局消息（所有租户）
        if (message.isGlobal()) {
            handleGlobalMessage(message);
            return;
        }

        // 获取消息的目标租户ID
        String messageTenantId = message.getTenantId();
        if (messageTenantId == null) {
            log.warn("收到无租户ID的消息，忽略处理");
            return;
        }

        // 在指定租户上下文中处理消息
        TenantHelper.dynamic(messageTenantId, () -> {
            if (CollUtil.isNotEmpty(message.getUserIds())) {
                // 定向推送：向指定用户的所有连接发送消息
                handleTargetedMessage(message, messageTenantId);
            } else {
                // 群发消息：向当前租户的所有在线用户发送消息
                handleBroadcastMessage(message, messageTenantId);
            }
        });

    } catch (Exception e) {
        log.error("处理WebSocket消息异常: {}", e.getMessage(), e);
    }
});
```

### 线程安全保证

**会话并发管理**：
- 使用`ConcurrentHashMap`保证线程安全的会话存储
- 三级映射的同步控制机制
- 会话添加/移除操作的原子性处理
- synchronized关键字保证消息发送的线程安全

```java
public static void addSession(Long userId, String sessionId, WebSocketSession session) {
    String tenantId = TenantHelper.getTenantId();

    // 添加同步控制
    synchronized (TENANT_SESSION_MAP) {
        Map<Long, Map<String, WebSocketSession>> tenantUsers = TENANT_SESSION_MAP.computeIfAbsent(
            tenantId, k -> new ConcurrentHashMap<>()
        );

        Map<String, WebSocketSession> userSessions = tenantUsers.computeIfAbsent(
            userId, k -> new ConcurrentHashMap<>()
        );

        // 处理已存在的会话
        WebSocketSession existingSession = userSessions.get(sessionId);
        if (existingSession != null && existingSession.isOpen()) {
            try {
                existingSession.close(CloseStatus.NORMAL);
            } catch (Exception e) {
                log.warn("关闭旧会话异常: {}", e.getMessage());
            }
        }

        userSessions.put(sessionId, session);
    }
}
```

## 消息格式标准化

### 统一消息格式

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
     * 租户ID
     */
    private String tenantId;
    
    /**
     * 消息优先级
     */
    private Integer priority;
    
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
        message.setTenantId(TenantHelper.getTenantId());
        return message;
    }
}
```

### 心跳消息格式支持

模块支持多种心跳消息格式：

1. **简单字符串格式**：`"ping"`
2. **JSON格式**：`{"type":"ping","timestamp":1234567890}`
3. **自定义格式**：可扩展支持其他格式

## 权限控制

### 角色权限说明

- **超级管理员**：可以查看和管理所有租户的WebSocket连接
- **租户管理员**：只能查看和管理本租户的WebSocket连接
- **普通用户**：只能建立和使用自己的WebSocket连接

### 权限控制实现

```java
@SaCheckRole(value = {TenantConstants.SUPER_ADMIN_ROLE_KEY, TenantConstants.TENANT_ADMIN_ROLE_KEY}, mode = SaMode.OR)
public R<WebSocketSessionHolder.ConnectionStats> getStats() {
    if (LoginHelper.isSuperAdmin()) {
        // 超级管理员查看全局统计
        return R.ok(WebSocketUtils.getGlobalConnectionStats());
    } else {
        // 租户管理员查看本租户统计
        return R.ok(WebSocketUtils.getConnectionStats());
    }
}
