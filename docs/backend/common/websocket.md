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

```text
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

```text
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
```

## 性能优化

### 连接管理优化

#### 1. 连接池配置

WebSocket连接的性能与服务器资源密切相关，需要合理配置连接参数：

```yaml
# application.yml
server:
  undertow:
    # 工作线程数（建议为CPU核心数的2-4倍）
    worker-threads: 200
    # IO线程数（建议为CPU核心数）
    io-threads: 8
    # 直接内存缓冲区
    direct-buffers: true
    # 缓冲区大小
    buffer-size: 1024

# WebSocket配置
websocket:
  enabled: true
  path: "/resource/websocket"
  allowedOrigins: "*"
```

#### 2. 会话清理策略

系统采用懒清理策略，在以下时机清理无效连接：

```java
/**
 * 自动清理无效连接的场景
 */
public class SessionCleanupStrategy {

    // 1. 消息发送失败时清理
    public static void sendMessage(Long userId, String message) {
        Map<String, WebSocketSession> userSessions = WebSocketSessionHolder.getUserSessions(userId);
        List<String> failedSessions = new ArrayList<>();

        for (Map.Entry<String, WebSocketSession> entry : userSessions.entrySet()) {
            if (!sendMessage(entry.getValue(), message)) {
                failedSessions.add(entry.getKey());
            }
        }

        // 清理失败的连接
        for (String sessionId : failedSessions) {
            WebSocketSessionHolder.removeSessionById(userId, sessionId);
        }
    }

    // 2. 连接关闭回调时清理
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = getLoginUser(session).getUserId();
        WebSocketSessionHolder.removeSessionById(userId, session.getId());
    }

    // 3. 用户登出时强制清理
    public void onUserLogout(Long userId) {
        WebSocketSessionHolder.removeAllSessions(userId);
    }
}
```

#### 3. 心跳机制优化

多种心跳格式支持，客户端可根据需求选择：

```java
/**
 * 心跳处理策略
 */
@Override
protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    String payload = message.getPayload();

    // 方式1：简单字符串心跳（最轻量）
    if ("ping".equals(payload)) {
        WebSocketUtils.sendMessage(session, "pong");
        return;
    }

    // 方式2：JSON格式心跳（携带时间戳）
    if (payload.contains("\"type\":\"ping\"")) {
        JSONObject response = new JSONObject();
        response.put("type", "pong");
        response.put("timestamp", System.currentTimeMillis());
        WebSocketUtils.sendMessage(session, response.toString());
        return;
    }

    // 业务消息处理...
}
```

### 消息发送优化

#### 1. 批量消息合并

对于高频消息场景，可使用消息合并策略：

```java
@Service
public class MessageBatchService {

    private final ConcurrentMap<Long, List<String>> pendingMessages = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public MessageBatchService() {
        // 每100ms刷新一次待发送消息
        scheduler.scheduleAtFixedRate(this::flushMessages, 100, 100, TimeUnit.MILLISECONDS);
    }

    /**
     * 添加待发送消息
     */
    public void addMessage(Long userId, String message) {
        pendingMessages.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(message);
    }

    /**
     * 刷新发送消息
     */
    private void flushMessages() {
        for (Map.Entry<Long, List<String>> entry : pendingMessages.entrySet()) {
            Long userId = entry.getKey();
            List<String> messages = entry.getValue();

            if (!messages.isEmpty()) {
                // 合并消息为JSON数组
                JSONArray batch = new JSONArray();
                messages.forEach(batch::add);

                WebSocketUtils.sendMessage(userId, batch.toString());
                messages.clear();
            }
        }
    }
}
```

#### 2. 消息压缩

对于大消息体，可启用压缩：

```java
/**
 * 消息压缩工具
 */
public class MessageCompressor {

    private static final int COMPRESS_THRESHOLD = 1024; // 1KB以上启用压缩

    public static String compressIfNeeded(String message) {
        if (message.length() > COMPRESS_THRESHOLD) {
            // 使用Gzip压缩并Base64编码
            byte[] compressed = GzipUtils.compress(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(compressed);
        }
        return message;
    }

    public static String decompressIfNeeded(String message) {
        if (isCompressed(message)) {
            byte[] decoded = Base64.getDecoder().decode(message);
            return new String(GzipUtils.decompress(decoded), StandardCharsets.UTF_8);
        }
        return message;
    }
}
```

### 分布式性能优化

#### 1. 本地优先策略

系统采用本地优先发送策略，减少Redis通信开销：

```java
public static void publishMessage(WebSocketMessageDto webSocketMessage) {
    List<Long> userIds = webSocketMessage.getUserIds();
    List<Long> unsentUserIds = new ArrayList<>();

    // 第一阶段：本地会话处理（无Redis开销）
    for (Long userId : userIds) {
        if (WebSocketSessionHolder.isUserOnline(userId)) {
            // 用户在当前实例，直接发送
            sendMessage(userId, webSocketMessage.getMessage());
        } else {
            unsentUserIds.add(userId);
        }
    }

    // 第二阶段：仅对不在本地的用户通过Redis分发
    if (CollUtil.isNotEmpty(unsentUserIds)) {
        WebSocketMessageDto broadcastMessage = WebSocketMessageDto.of(
            unsentUserIds, webSocketMessage.getMessage()
        );
        RedisUtils.publish(WEB_SOCKET_TOPIC, broadcastMessage, consumer -> {
            log.info("跨实例消息分发 - 目标用户: {}", unsentUserIds);
        });
    }
}
```

#### 2. Redis发布订阅优化

```yaml
# Redis连接池配置
spring:
  data:
    redis:
      lettuce:
        pool:
          # 最大连接数
          max-active: 50
          # 最大空闲连接
          max-idle: 20
          # 最小空闲连接
          min-idle: 5
          # 获取连接超时时间
          max-wait: 2000ms
```

### 监控指标

#### 连接统计

```java
/**
 * 定期记录连接统计信息
 */
@Scheduled(fixedRate = 60000) // 每分钟
public void logConnectionStats() {
    // 全局统计
    ConnectionStats globalStats = WebSocketSessionHolder.getGlobalConnectionStats();
    log.info("WebSocket全局统计 - 租户数: {}, 在线用户: {}, 总连接数: {}",
        globalStats.getTotalTenants(),
        globalStats.getOnlineUsers(),
        globalStats.getTotalConnections()
    );

    // 各租户统计
    for (String tenantId : WebSocketSessionHolder.getAllTenantIds()) {
        TenantHelper.dynamic(tenantId, () -> {
            ConnectionStats stats = WebSocketSessionHolder.getConnectionStats();
            log.info("租户 {} 统计 - 在线用户: {}, 连接数: {}",
                tenantId, stats.getOnlineUsers(), stats.getTotalConnections());
        });
    }
}
```

## 模块集成

### 与Redis模块集成

WebSocket模块依赖Redis实现分布式消息分发：

```java
/**
 * Redis发布订阅消息处理
 */
public class RedisWebSocketIntegration {

    /**
     * 订阅WebSocket消息主题
     */
    public static void subscribeMessage(Consumer<WebSocketMessageDto> consumer) {
        RedisUtils.subscribe(WEB_SOCKET_TOPIC, WebSocketMessageDto.class, consumer);
    }

    /**
     * 发布消息到Redis主题
     */
    public static void publishToRedis(WebSocketMessageDto message) {
        RedisUtils.publish(WEB_SOCKET_TOPIC, message, consumer -> {
            log.info("消息发布到Redis - topic: {}", WEB_SOCKET_TOPIC);
        });
    }
}
```

### 与SaToken模块集成

WebSocket连接必须经过SaToken认证：

```java
/**
 * WebSocket握手拦截器 - SaToken集成
 */
public class PlusWebSocketInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            // 从请求中获取token并验证用户登录状态
            LoginUser loginUser = LoginHelper.getLoginUser();

            // 验证租户权限和状态
            String tenantId = TenantHelper.getTenantId();
            if (StringUtils.isBlank(tenantId)) {
                log.error("WebSocket认证失败: 无效的租户信息");
                return false;
            }

            // 将用户信息存储到WebSocket会话属性中
            attributes.put(LOGIN_USER, loginUser);
            return true;

        } catch (NotLoginException e) {
            log.error("WebSocket认证失败: {}", e.getMessage());
            return false;
        }
    }
}
```

### 与租户模块集成

多租户隔离是WebSocket模块的核心特性：

```java
/**
 * 多租户WebSocket消息处理
 */
public class TenantWebSocketIntegration {

    /**
     * 在指定租户上下文中处理消息
     */
    public void handleMessage(WebSocketMessageDto message) {
        String messageTenantId = message.getTenantId();

        // 在指定租户上下文中处理消息
        TenantHelper.dynamic(messageTenantId, () -> {
            if (CollUtil.isNotEmpty(message.getUserIds())) {
                // 定向推送
                handleTargetedMessage(message, messageTenantId);
            } else {
                // 群发消息
                handleBroadcastMessage(message, messageTenantId);
            }
        });
    }

    /**
     * 处理全局消息（所有租户）
     */
    public void handleGlobalMessage(WebSocketMessageDto message) {
        for (String tenantId : WebSocketSessionHolder.getAllTenantIds()) {
            TenantHelper.dynamic(tenantId, () -> {
                var tenantUserIds = WebSocketSessionHolder.getAllUserIds();
                for (Long userId : tenantUserIds) {
                    WebSocketUtils.sendMessage(userId, message.getMessage());
                }
            });
        }
    }
}
```

### 与日志模块集成

WebSocket操作可集成日志记录：

```java
@Service
public class WebSocketLogService {

    @Autowired
    private OperLogService operLogService;

    /**
     * 记录WebSocket管理操作日志
     */
    public void logAdminOperation(String action, Long targetUserId, String detail) {
        OperLog operLog = new OperLog();
        operLog.setTitle("WebSocket管理");
        operLog.setBusinessType(BusinessType.OTHER.ordinal());
        operLog.setMethod("WebSocket." + action);
        operLog.setOperatorType(OperatorType.MANAGE.ordinal());
        operLog.setOperName(LoginHelper.getUsername());
        operLog.setOperParam(String.format("目标用户: %d, 详情: %s", targetUserId, detail));
        operLog.setOperTime(new Date());

        operLogService.insertOperlog(operLog);
    }
}
```

## 测试策略

### 单元测试

#### 会话管理器测试

```java
@ExtendWith(MockitoExtension.class)
class WebSocketSessionHolderTest {

    @Mock
    private WebSocketSession mockSession;

    @BeforeEach
    void setUp() {
        // 模拟租户上下文
        TenantHelper.setTenantId("000000");
        when(mockSession.getId()).thenReturn("test-session-001");
        when(mockSession.isOpen()).thenReturn(true);
    }

    @Test
    void testAddSession() {
        Long userId = 1001L;
        String sessionId = "test-session-001";

        // 添加会话
        WebSocketSessionHolder.addSession(userId, sessionId, mockSession);

        // 验证会话存在
        assertTrue(WebSocketSessionHolder.isUserOnline(userId));
        assertTrue(WebSocketSessionHolder.isSessionExists(userId, sessionId));
        assertEquals(mockSession, WebSocketSessionHolder.getSession(userId, sessionId));
    }

    @Test
    void testMultipleConnections() {
        Long userId = 1001L;
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);

        when(session1.getId()).thenReturn("session-001");
        when(session2.getId()).thenReturn("session-002");
        when(session1.isOpen()).thenReturn(true);
        when(session2.isOpen()).thenReturn(true);

        // 添加多个连接
        WebSocketSessionHolder.addSession(userId, "session-001", session1);
        WebSocketSessionHolder.addSession(userId, "session-002", session2);

        // 验证用户有2个连接
        Map<String, WebSocketSession> sessions = WebSocketSessionHolder.getUserSessions(userId);
        assertEquals(2, sessions.size());
    }

    @Test
    void testRemoveSpecificSession() {
        Long userId = 1001L;
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);

        when(session1.getId()).thenReturn("session-001");
        when(session2.getId()).thenReturn("session-002");
        when(session1.isOpen()).thenReturn(true);
        when(session2.isOpen()).thenReturn(true);

        WebSocketSessionHolder.addSession(userId, "session-001", session1);
        WebSocketSessionHolder.addSession(userId, "session-002", session2);

        // 移除一个连接
        WebSocketSessionHolder.removeSessionById(userId, "session-001");

        // 验证只剩一个连接
        assertFalse(WebSocketSessionHolder.isSessionExists(userId, "session-001"));
        assertTrue(WebSocketSessionHolder.isSessionExists(userId, "session-002"));
        assertTrue(WebSocketSessionHolder.isUserOnline(userId));
    }

    @Test
    void testConnectionStats() {
        Long userId1 = 1001L;
        Long userId2 = 1002L;

        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);
        WebSocketSession session3 = mock(WebSocketSession.class);

        when(session1.getId()).thenReturn("session-001");
        when(session2.getId()).thenReturn("session-002");
        when(session3.getId()).thenReturn("session-003");

        WebSocketSessionHolder.addSession(userId1, "session-001", session1);
        WebSocketSessionHolder.addSession(userId1, "session-002", session2);
        WebSocketSessionHolder.addSession(userId2, "session-003", session3);

        // 验证统计信息
        WebSocketSessionHolder.ConnectionStats stats = WebSocketSessionHolder.getConnectionStats();
        assertEquals(2, stats.getOnlineUsers()); // 2个用户
        assertEquals(3, stats.getTotalConnections()); // 3个连接
    }
}
```

#### 消息处理器测试

```java
@ExtendWith(MockitoExtension.class)
class PlusWebSocketHandlerTest {

    @Mock
    private WebSocketSession mockSession;

    @Mock
    private MessageProcessor mockProcessor;

    @InjectMocks
    private PlusWebSocketHandler handler;

    private LoginUser loginUser;

    @BeforeEach
    void setUp() {
        loginUser = new LoginUser();
        loginUser.setUserId(1001L);
        loginUser.setUserType("sys_user");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("LOGIN_USER", loginUser);

        when(mockSession.getAttributes()).thenReturn(attributes);
        when(mockSession.getId()).thenReturn("test-session");
    }

    @Test
    void testHandlePingMessage() throws Exception {
        TextMessage pingMessage = new TextMessage("ping");

        // 处理ping消息
        handler.handleTextMessage(mockSession, pingMessage);

        // 验证返回pong响应
        verify(mockSession).sendMessage(argThat(msg ->
            msg instanceof TextMessage && "pong".equals(((TextMessage) msg).getPayload())
        ));
    }

    @Test
    void testHandleJsonMessage() throws Exception {
        String jsonPayload = "{\"type\":\"chat\",\"content\":\"Hello\"}";
        TextMessage message = new TextMessage(jsonPayload);

        when(mockProcessor.support("chat")).thenReturn(true);

        handler.handleTextMessage(mockSession, message);

        verify(mockProcessor).process(eq(mockSession), eq(loginUser), eq(jsonPayload));
    }
}
```

### 集成测试

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {"websocket.enabled=true"})
class WebSocketIntegrationTest {

    @LocalServerPort
    private int port;

    private WebSocketClient client;
    private WebSocketSession clientSession;
    private List<String> receivedMessages = new CopyOnWriteArrayList<>();

    @BeforeEach
    void setUp() throws Exception {
        client = new StandardWebSocketClient();

        // 获取测试token
        String token = getTestToken();

        // 建立WebSocket连接
        URI uri = new URI("ws://localhost:" + port + "/resource/websocket?token=" + token);

        clientSession = client.execute(new TextWebSocketHandler() {
            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                receivedMessages.add(message.getPayload());
            }
        }, uri).get(5, TimeUnit.SECONDS);
    }

    @Test
    void testConnectionEstablishment() {
        assertTrue(clientSession.isOpen());
    }

    @Test
    void testHeartbeat() throws Exception {
        // 发送ping
        clientSession.sendMessage(new TextMessage("ping"));

        // 等待pong响应
        Thread.sleep(500);

        assertTrue(receivedMessages.contains("pong"));
    }

    @Test
    void testMessageReceive() throws Exception {
        Long testUserId = 1001L;
        String testMessage = "Test notification";

        // 服务端发送消息
        WebSocketUtils.sendMessage(testUserId, testMessage);

        // 等待消息到达
        Thread.sleep(500);

        assertTrue(receivedMessages.contains(testMessage));
    }

    @AfterEach
    void tearDown() throws Exception {
        if (clientSession != null && clientSession.isOpen()) {
            clientSession.close();
        }
    }
}
```

### 负载测试

```java
@SpringBootTest
class WebSocketLoadTest {

    @Test
    void testMassiveConnections() throws Exception {
        int connectionCount = 1000;
        List<WebSocketSession> sessions = new ArrayList<>();
        ExecutorService executor = Executors.newFixedThreadPool(100);
        CountDownLatch latch = new CountDownLatch(connectionCount);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < connectionCount; i++) {
            final int userId = i;
            executor.submit(() -> {
                try {
                    WebSocketSession session = createConnection(userId);
                    if (session != null && session.isOpen()) {
                        sessions.add(session);
                        successCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await(60, TimeUnit.SECONDS);

        log.info("连接测试结果 - 成功: {}/{}", successCount.get(), connectionCount);
        assertTrue(successCount.get() >= connectionCount * 0.95); // 95%成功率

        // 清理
        for (WebSocketSession session : sessions) {
            try {
                session.close();
            } catch (Exception ignored) {}
        }
    }

    @Test
    void testMessageThroughput() throws Exception {
        int messageCount = 10000;
        Long testUserId = 1001L;
        AtomicInteger sentCount = new AtomicInteger(0);

        long startTime = System.currentTimeMillis();

        for (int i = 0; i < messageCount; i++) {
            WebSocketUtils.sendMessage(testUserId, "Message " + i);
            sentCount.incrementAndGet();
        }

        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        double throughput = (double) messageCount / duration * 1000;

        log.info("消息吞吐量测试 - 发送: {} 条, 耗时: {} ms, 吞吐量: {} msg/s",
            messageCount, duration, throughput);

        assertTrue(throughput >= 1000); // 至少1000 msg/s
    }
}
```

## 安全考虑

### 连接认证

所有WebSocket连接必须经过认证：

```java
/**
 * WebSocket连接认证策略
 */
public class WebSocketSecurityConfig {

    /**
     * 握手前验证Token
     */
    public boolean validateConnection(ServerHttpRequest request) {
        // 1. 从URL参数获取Token
        String token = extractToken(request);
        if (StringUtils.isBlank(token)) {
            log.warn("WebSocket连接拒绝: 缺少Token");
            return false;
        }

        // 2. 验证Token有效性
        try {
            StpUtil.checkLogin();
        } catch (NotLoginException e) {
            log.warn("WebSocket连接拒绝: Token无效 - {}", e.getMessage());
            return false;
        }

        // 3. 验证租户状态
        String tenantId = TenantHelper.getTenantId();
        if (!isTenantActive(tenantId)) {
            log.warn("WebSocket连接拒绝: 租户已禁用 - {}", tenantId);
            return false;
        }

        return true;
    }
}
```

### 消息权限控制

```java
/**
 * 消息发送权限验证
 */
public class MessagePermissionValidator {

    /**
     * 验证是否可以发送全局消息
     */
    public static void validateGlobalMessage() {
        if (!LoginHelper.isSuperAdmin()) {
            throw new ServiceException("无权限发送全局消息");
        }
    }

    /**
     * 验证是否可以跨租户发送消息
     */
    public static void validateCrossTenantMessage(String targetTenantId) {
        if (!LoginHelper.isSuperAdmin()) {
            throw new ServiceException("无权限跨租户发送消息");
        }
    }

    /**
     * 验证是否可以向指定用户发送消息
     */
    public static void validateTargetUser(Long targetUserId) {
        String currentTenantId = TenantHelper.getTenantId();
        String userTenantId = getUserTenantId(targetUserId);

        if (!currentTenantId.equals(userTenantId) && !LoginHelper.isSuperAdmin()) {
            throw new ServiceException("无权限向其他租户用户发送消息");
        }
    }
}
```

### 防止连接滥用

```java
/**
 * 连接限制策略
 */
@Component
public class ConnectionLimitInterceptor implements HandshakeInterceptor {

    // 每个用户最大连接数
    private static final int MAX_CONNECTIONS_PER_USER = 10;

    // 每个IP最大连接数
    private static final int MAX_CONNECTIONS_PER_IP = 50;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        Long userId = loginUser.getUserId();

        // 检查用户连接数限制
        Map<String, WebSocketSession> userSessions = WebSocketSessionHolder.getUserSessions(userId);
        if (userSessions.size() >= MAX_CONNECTIONS_PER_USER) {
            log.warn("用户 {} 连接数已达上限: {}", userId, MAX_CONNECTIONS_PER_USER);
            return false;
        }

        // 检查IP连接数限制
        String clientIp = getClientIp(request);
        int ipConnections = countConnectionsByIp(clientIp);
        if (ipConnections >= MAX_CONNECTIONS_PER_IP) {
            log.warn("IP {} 连接数已达上限: {}", clientIp, MAX_CONNECTIONS_PER_IP);
            return false;
        }

        return true;
    }
}
```

### 消息内容安全

```java
/**
 * 消息内容过滤
 */
public class MessageContentFilter {

    // 敏感词列表
    private static final List<String> SENSITIVE_WORDS = loadSensitiveWords();

    // 最大消息长度
    private static final int MAX_MESSAGE_LENGTH = 10000;

    /**
     * 过滤消息内容
     */
    public static String filterMessage(String message) {
        if (StringUtils.isBlank(message)) {
            return message;
        }

        // 长度检查
        if (message.length() > MAX_MESSAGE_LENGTH) {
            throw new ServiceException("消息内容过长");
        }

        // 敏感词过滤
        String filtered = message;
        for (String word : SENSITIVE_WORDS) {
            filtered = filtered.replace(word, "***");
        }

        // XSS过滤
        filtered = HtmlUtil.cleanHtmlTag(filtered);

        return filtered;
    }
}
```

## 注意事项

### 连接生命周期

1. **连接建立**
   - 必须通过握手拦截器验证用户身份
   - 验证通过后将用户信息存入会话属性
   - 使用sessionId作为连接唯一标识

2. **消息处理**
   - 从会话属性中获取用户信息，不要重复查询数据库
   - 心跳消息优先处理，避免阻塞业务消息
   - 使用策略模式将消息路由到对应处理器

3. **连接关闭**
   - 及时清理会话管理器中的连接记录
   - 关闭连接时优雅处理，使用合适的关闭状态码
   - 保留用户的其他活跃连接

### 多租户注意事项

1. **租户上下文**
   - WebSocket消息处理没有自动的租户上下文
   - 必须从消息中获取租户ID并手动切换上下文
   - 使用`TenantHelper.dynamic()`确保正确的租户隔离

2. **跨租户操作**
   - 跨租户消息发送需要超级管理员权限
   - 全局广播需要遍历所有租户分别发送
   - 统计信息区分租户级别和全局级别

### 分布式部署注意事项

1. **Redis依赖**
   - WebSocket分布式消息依赖Redis发布订阅
   - 确保Redis连接稳定可用
   - 配置合适的连接池大小

2. **本地优先策略**
   - 优先在当前实例发送消息
   - 仅对不在本实例的用户通过Redis分发
   - 减少不必要的Redis通信开销

## 常见问题

### 1. 连接无法建立

**问题原因**：
- Token无效或已过期
- 租户状态异常
- 连接数超限
- WebSocket服务未启用

**解决方案**：

```java
// 1. 检查WebSocket是否启用
@Value("${websocket.enabled:false}")
private boolean websocketEnabled;

// 2. 检查Token有效性
try {
    StpUtil.checkLogin();
    LoginUser loginUser = LoginHelper.getLoginUser();
    log.info("用户认证成功: {}", loginUser.getUserId());
} catch (NotLoginException e) {
    log.error("Token验证失败: {}", e.getMessage());
}

// 3. 检查连接数
Map<String, WebSocketSession> sessions = WebSocketSessionHolder.getUserSessions(userId);
log.info("当前用户连接数: {}", sessions.size());
```

### 2. 消息发送失败

**问题原因**：
- 目标用户不在线
- 会话已关闭
- 网络异常

**解决方案**：

```java
// 1. 检查用户是否在线
if (!WebSocketSessionHolder.isUserOnline(userId)) {
    log.warn("用户 {} 当前不在线", userId);
    // 可以考虑存储离线消息
    saveOfflineMessage(userId, message);
    return;
}

// 2. 发送消息并处理失败
boolean success = WebSocketUtils.sendMessage(userId, sessionId, message);
if (!success) {
    log.warn("消息发送失败，会话可能已断开");
    // 会话会自动清理，可以尝试发送到用户其他连接
    WebSocketUtils.sendMessage(userId, message);
}
```

### 3. 多实例消息不同步

**问题原因**：
- Redis连接异常
- 主题订阅失败
- 消息序列化问题

**解决方案**：

```java
// 1. 检查Redis连接状态
RedisConnectionFactory factory = redisTemplate.getConnectionFactory();
RedisConnection connection = factory.getConnection();
log.info("Redis连接状态: {}", connection.ping());

// 2. 检查主题订阅状态
WebSocketUtils.subscribeMessage(message -> {
    log.info("收到订阅消息: {}", message);
});

// 3. 手动触发消息分发测试
WebSocketMessageDto testMessage = WebSocketMessageDto.of(
    Arrays.asList(1001L), "测试消息"
);
RedisUtils.publish(WEB_SOCKET_TOPIC, testMessage, consumer -> {
    log.info("测试消息已发布");
});
```

### 4. 心跳超时断连

**问题原因**：
- 客户端心跳间隔过长
- 服务器超时配置过短
- 网络不稳定

**解决方案**：

```yaml
# 调整Undertow配置
server:
  undertow:
    # WebSocket超时时间（毫秒）
    websocket-timeout: 300000  # 5分钟
```

```javascript
// 客户端心跳配置
const HEARTBEAT_INTERVAL = 30000; // 30秒

setInterval(() => {
    if (websocket.readyState === WebSocket.OPEN) {
        websocket.send('ping');
    }
}, HEARTBEAT_INTERVAL);
```

### 5. 内存泄漏

**问题原因**：
- 连接关闭但未清理会话
- 消息处理异常导致会话残留
- 大量僵尸连接

**解决方案**：

```java
// 定期清理僵尸连接
@Scheduled(fixedRate = 300000) // 5分钟
public void cleanupZombieSessions() {
    for (String tenantId : WebSocketSessionHolder.getAllTenantIds()) {
        TenantHelper.dynamic(tenantId, () -> {
            Set<Long> userIds = WebSocketSessionHolder.getAllUserIds();
            for (Long userId : userIds) {
                Map<String, WebSocketSession> sessions =
                    WebSocketSessionHolder.getUserSessions(userId);

                for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
                    WebSocketSession session = entry.getValue();
                    if (session == null || !session.isOpen()) {
                        WebSocketSessionHolder.removeSessionById(userId, entry.getKey());
                        log.info("清理僵尸会话: 用户={}, 会话={}", userId, entry.getKey());
                    }
                }
            }
        });
    }
}
```
