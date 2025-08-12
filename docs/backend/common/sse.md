# SSE推送 (sse) 

## 概述

SSE模块是基于Spring Boot的服务器推送事件模块，提供实时消息推送功能。支持单机和集群环境下的消息分发，通过Redis实现跨节点的消息同步。

## 核心特性

- **实时通信**：基于SSE协议的长连接通信
- **多连接支持**：支持单用户多设备/浏览器同时连接
- **集群支持**：通过Redis发布订阅实现集群环境下的消息分发
- **灵活配置**：可通过配置文件控制功能开启/关闭
- **自动清理**：连接异常时自动清理资源

## 技术架构

### 依赖关系

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

```text
├── config/
│   ├── SseAutoConfiguration.java     # 自动配置类
│   └── SseProperties.java           # 配置属性类
├── controller/
│   └── SseController.java           # REST控制器
├── core/
│   └── SseEmitterManager.java       # 连接管理器
├── dto/
│   └── SseMessageDto.java           # 消息传输对象
├── listener/
│   └── SseTopicListener.java        # 主题监听器
└── utils/
    └── SseMessageUtils.java          # 消息工具类
```

## 配置说明

### 必需配置

在 `application.yml` 中添加以下配置：

```yaml
# SSE配置
sse:
  enabled: true           # 启用SSE功能
  path: /sse             # SSE服务访问路径

# Redis配置（必需）
spring:
  redis:
    host: localhost
    port: 6379
    database: 0
```

### 配置参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sse.enabled` | Boolean | false | 是否启用SSE功能 |
| `sse.path` | String | - | SSE服务的访问路径 |

## 核心API

### 建立连接

**接口地址：** `GET ${sse.path}`

**请求头：**
```
Accept: text/event-stream
Cache-Control: no-cache
```

**响应格式：**
```
Content-Type: text/event-stream
```

### 关闭连接

**接口地址：** `GET ${sse.path}/close`

### 发送消息

**向指定用户发送消息：**
```
GET ${sse.path}/send?userId=123&msg=Hello
```

**向所有用户广播消息：**
```
GET ${sse.path}/sendAll?msg=Broadcast Message
```

## 使用指南

### 1. 客户端连接

#### JavaScript示例

```javascript
// 建立SSE连接
const eventSource = new EventSource('/sse');

// 监听消息
eventSource.addEventListener('message', function(event) {
    console.log('收到消息:', event.data);
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
    // 可选：调用服务端关闭接口
    fetch('/sse/close');
}
```

#### jQuery示例

```javascript
$(document).ready(function() {
    var eventSource = new EventSource('/sse');
    
    eventSource.onmessage = function(event) {
        $('#messages').append('<div>' + event.data + '</div>');
    };
    
    eventSource.onerror = function(event) {
        console.error('SSE连接错误', event);
    };
});
```

### 2. 服务端发送消息

#### 使用工具类（推荐）

```java
// 向指定用户发送消息
SseMessageUtils.sendMessage(userId, "Hello User");

// 向所有用户广播消息
SseMessageUtils.sendMessage("广播消息");

// 通过Redis发布消息（集群环境）
SseMessageDto message = SseMessageDto.of(Arrays.asList(123L, 456L), "集群消息");
SseMessageUtils.publishMessage(message);

// 广播消息到所有节点
SseMessageUtils.publishAll("全局广播");
```

#### 直接使用管理器

```java
@Autowired
private SseEmitterManager sseEmitterManager;

public void sendNotification(Long userId, String content) {
    // 本地发送
    sseEmitterManager.sendMessage(userId, content);
    
    // 集群发送
    SseMessageDto dto = new SseMessageDto();
    dto.setUserIds(Arrays.asList(userId));
    dto.setMessage(content);
    sseEmitterManager.publishMessage(dto);
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
        String message = String.format("订单 %s 状态更新为：%s", orderId, status);
        SseMessageUtils.sendMessage(order.getUserId(), message);
    }
}
```

#### 系统通知推送

```java
@Service
public class NotificationService {
    
    public void sendSystemNotice(String notice) {
        // 向所有在线用户推送系统通知
        SseMessageUtils.publishAll("系统通知：" + notice);
    }
    
    public void sendPersonalMessage(Long userId, String message) {
        // 向特定用户推送个人消息
        SseMessageDto dto = SseMessageDto.of(Arrays.asList(userId), message);
        SseMessageUtils.publishMessage(dto);
    }
}
```

## 高级特性

### 1. 消息格式化

```java
// 发送JSON格式消息
@Service
public class MessageService {
    
    public void sendJsonMessage(Long userId, Object data) {
        try {
            String jsonMessage = JsonUtils.toJsonString(data);
            SseMessageUtils.sendMessage(userId, jsonMessage);
        } catch (Exception e) {
            log.error("发送JSON消息失败", e);
        }
    }
}
```

### 2. 连接状态监控

```java
// 可以扩展SseEmitterManager来添加连接统计功能
@Component
public class SseMonitor {
    
    @Autowired
    private SseEmitterManager sseEmitterManager;
    
    @EventListener
    public void handleConnect(SseConnectEvent event) {
        log.info("用户 {} 建立SSE连接", event.getUserId());
    }
    
    @EventListener
    public void handleDisconnect(SseDisconnectEvent event) {
        log.info("用户 {} 断开SSE连接", event.getUserId());
    }
}
```

### 3. 消息持久化

```java
// 对重要消息进行持久化处理
@Service
public class PersistentMessageService {
    
    public void sendImportantMessage(Long userId, String message) {
        // 先保存到数据库
        saveMessageToDb(userId, message);
        
        // 再推送给用户
        SseMessageUtils.sendMessage(userId, message);
    }
}
```

## 错误处理

### 常见错误及解决方案

#### 1. 连接建立失败

**原因：** 用户未登录或Token无效
**解决：** 确保客户端请求时携带有效的认证信息

```javascript
// 在请求头中添加认证信息
const eventSource = new EventSource('/sse', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});
```

#### 2. 消息发送失败

**原因：** 用户连接已断开或网络异常
**解决：** 系统会自动清理无效连接，重要消息建议配合持久化机制

## 性能优化

### 1. 连接管理优化

- **连接数限制**：建议为每个用户设置最大连接数限制
- **心跳检测**：定期发送心跳消息检测连接有效性
- **资源清理**：及时清理无效连接释放内存

### 2. 消息发送优化

- **批量发送**：对于大量用户的广播消息，考虑分批发送
- **消息压缩**：对于大型消息内容，考虑使用压缩算法
- **异步处理**：消息发送采用异步方式避免阻塞主线程

### 关键日志说明

- **连接建立**：`SSE连接建立 userId={}, token={}`
- **消息发送**：`SSE发送消息 userId={}, message={}`
- **连接断开**：`SSE连接断开 userId={}, token={}`
- **Redis消息**：`SSE主题订阅收到消息 userIds={}, message={}`

## 最佳实践

### 1. 客户端最佳实践

- **重连机制**：实现自动重连逻辑处理网络中断
- **消息去重**：对重复消息进行客户端去重处理
- **错误处理**：优雅处理连接错误和消息解析错误

```javascript
function createSSEConnection() {
    const eventSource = new EventSource('/sse');
    let reconnectTimer;
    
    eventSource.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            handleMessage(data);
        } catch (e) {
            console.error('消息解析错误:', e);
        }
    };
    
    eventSource.onerror = function(event) {
        console.warn('SSE连接错误，3秒后重连...');
        eventSource.close();
        
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
            createSSEConnection();
        }, 3000);
    };
}
```
