# 消息推送最佳实践

## 概述

消息推送是实现实时通信的关键功能，RuoYi-Plus 提供了两种成熟的消息推送方案：**WebSocket** 和 **SSE（Server-Sent Events）**。本文档详细介绍这两种方案的架构设计、使用方法和最佳实践。

### 推送方案对比

| 特性 | WebSocket | SSE |
|------|-----------|-----|
| **通信方式** | 双向通信 | 单向（服务器→客户端） |
| **协议** | ws:// / wss:// | http:// / https:// |
| **连接开销** | 较高（握手复杂） | 较低（基于HTTP） |
| **浏览器支持** | 广泛支持 | 除IE外广泛支持 |
| **重连机制** | 需手动实现 | 浏览器自动重连 |
| **适用场景** | 聊天、游戏、实时协作 | 通知、监控、数据推送 |
| **多租户支持** | ✅ 完整支持 | ✅ 支持 |
| **集群支持** | ✅ Redis发布订阅 | ✅ Redis发布订阅 |

### 核心特性

- **双方案支持** - 同时提供 WebSocket 和 SSE 两种推送方式
- **多连接管理** - 支持同一用户多设备/多标签页同时在线
- **多租户隔离** - 消息在租户间完全隔离，确保数据安全
- **集群部署** - 通过 Redis 发布订阅实现跨节点消息分发
- **策略模式** - WebSocket 消息处理采用策略模式，易于扩展
- **自动清理** - 连接断开时自动清理资源，防止内存泄漏

---

## 架构设计

### WebSocket 架构

```text
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                   │
├─────────────────────────────────────────────────────────────────┤
│  浏览器/App  ←→  WebSocket连接  ←→  负载均衡器                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        服务层 (多实例)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐   │
│  │  实例 A       │    │  实例 B       │    │  实例 C       │   │
│  │  ┌─────────┐  │    │  ┌─────────┐  │    │  ┌─────────┐  │   │
│  │  │Handler  │  │    │  │Handler  │  │    │  │Handler  │  │   │
│  │  └────┬────┘  │    │  └────┬────┘  │    │  └────┬────┘  │   │
│  │       ↓       │    │       ↓       │    │       ↓       │   │
│  │  ┌─────────┐  │    │  ┌─────────┐  │    │  ┌─────────┐  │   │
│  │  │Processor│  │    │  │Processor│  │    │  │Processor│  │   │
│  │  └────┬────┘  │    │  └────┬────┘  │    │  └────┬────┘  │   │
│  │       ↓       │    │       ↓       │    │       ↓       │   │
│  │  ┌─────────┐  │    │  ┌─────────┐  │    │  ┌─────────┐  │   │
│  │  │Session  │  │    │  │Session  │  │    │  │Session  │  │   │
│  │  │Holder   │  │    │  │Holder   │  │    │  │Holder   │  │   │
│  │  └─────────┘  │    │  └─────────┘  │    │  └─────────┘  │   │
│  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘   │
└──────────┼────────────────────┼────────────────────┼───────────┘
           └────────────────────┼────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Redis 发布订阅                            │
├─────────────────────────────────────────────────────────────────┤
│               Topic: global:websocket                            │
│         ┌──────────────────────────────────┐                    │
│         │  跨实例消息分发 + 多租户隔离       │                    │
│         └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### SSE 架构

```text
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                   │
├─────────────────────────────────────────────────────────────────┤
│  EventSource API  →  HTTP长连接  →  服务器                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        服务层                                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   SseController                          │   │
│  │  /sse/connect  /sse/close  /sse/send  /sse/sendAll      │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           ↓                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 SseEmitterManager                        │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │  USER_TOKEN_EMITTERS                               │  │   │
│  │  │  userId → (token → SseEmitter)                     │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └────────────────────────┬────────────────────────────────┘   │
└───────────────────────────┼────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Redis 发布订阅                                 │
├─────────────────────────────────────────────────────────────────┤
│                    Topic: global:sse                             │
└─────────────────────────────────────────────────────────────────┘
```

### 会话管理结构

WebSocket 采用三级映射结构实现多租户多连接管理：

```text
TENANT_SESSION_MAP
├── "000000" (默认租户)
│   ├── 1001 (用户ID)
│   │   ├── "session_001" → WebSocketSession
│   │   └── "session_002" → WebSocketSession
│   └── 1002 (用户ID)
│       └── "session_003" → WebSocketSession
├── "100001" (租户1)
│   └── 2001 (用户ID)
│       └── "session_004" → WebSocketSession
└── "100002" (租户2)
    └── 3001 (用户ID)
        └── "session_005" → WebSocketSession
```

SSE 采用二级映射结构：

```text
USER_TOKEN_EMITTERS
├── 1001 (用户ID)
│   ├── "token_abc123" → SseEmitter
│   └── "token_def456" → SseEmitter
└── 1002 (用户ID)
    └── "token_ghi789" → SseEmitter
```

---

## WebSocket 使用指南

### 配置说明

**application.yml 配置**：

```yaml
# WebSocket 配置
websocket:
  # 是否开启 WebSocket
  enabled: true
  # WebSocket 连接路径
  path: /websocket
  # 允许跨域的源，* 表示允许所有
  allowedOrigins: '*'
```

### 核心组件

#### 1. WebSocketUtils 工具类

这是发送消息的主要入口，提供丰富的消息发送方法：

```java
import plus.ruoyi.common.websocket.utils.WebSocketUtils;
import plus.ruoyi.common.websocket.dto.WebSocketMessageDto;

// 1. 向单个用户发送消息
WebSocketUtils.sendMessage(userId, "您有新的消息");

// 2. 向用户的特定连接发送消息
WebSocketUtils.sendMessage(userId, sessionId, "指定连接消息");

// 3. 通过Redis发布订阅发送消息（支持集群）
WebSocketMessageDto message = WebSocketMessageDto.of(userId, "集群消息");
WebSocketUtils.publishMessage(message);

// 4. 向多个用户发送消息
List<Long> userIds = Arrays.asList(1001L, 1002L, 1003L);
WebSocketMessageDto multiMessage = WebSocketMessageDto.of(userIds, "批量消息");
WebSocketUtils.publishMessage(multiMessage);

// 5. 向当前租户所有用户广播
WebSocketUtils.publishAll("系统通知：服务即将维护");

// 6. 向所有租户广播（需超级管理员权限）
WebSocketUtils.publishGlobal("全局系统通知");

// 7. 跨租户发送消息（需超级管理员权限）
WebSocketUtils.publishCrossTenant("100001", userIds, "跨租户消息");

// 8. 强制断开用户连接
WebSocketUtils.disconnectUser(userId);

// 9. 获取连接统计
WebSocketSessionHolder.ConnectionStats stats = WebSocketUtils.getConnectionStats();
System.out.println("在线用户: " + stats.getOnlineUsers());
System.out.println("总连接数: " + stats.getTotalConnections());
```

#### 2. WebSocketMessageDto 消息对象

```java
// 创建单用户消息
WebSocketMessageDto dto = WebSocketMessageDto.of(userId, "消息内容");

// 创建多用户消息
WebSocketMessageDto dto = WebSocketMessageDto.of(userIds, "消息内容");

// 创建租户广播消息
WebSocketMessageDto dto = WebSocketMessageDto.broadcast("广播内容");

// 创建全局广播消息
WebSocketMessageDto dto = WebSocketMessageDto.globalBroadcast("全局广播");

// 创建跨租户消息
WebSocketMessageDto dto = WebSocketMessageDto.crossTenant("100001", userIds, "消息");

// 判断消息类型
dto.isBroadcast();      // 是否广播
dto.isTenantScoped();   // 是否租户内消息
dto.getTargetDescription(); // 获取目标描述
```

#### 3. 自定义消息处理器

通过实现 `MessageProcessor` 接口，可以扩展自定义消息类型处理：

```java
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import plus.ruoyi.common.core.domain.model.LoginUser;
import plus.ruoyi.common.websocket.processor.MessageProcessor;
import plus.ruoyi.common.websocket.utils.WebSocketUtils;

/**
 * 自定义消息处理器示例 - 处理聊天消息
 */
@Component
public class ChatMessageProcessor implements MessageProcessor {

    /**
     * 判断是否支持该消息类型
     *
     * @param type 消息类型（来自JSON的type字段）
     * @return 是否支持
     */
    @Override
    public boolean support(String type) {
        return "chat".equals(type);
    }

    /**
     * 处理消息
     *
     * @param session WebSocket会话
     * @param loginUser 当前登录用户
     * @param payload 消息内容（JSON字符串）
     */
    @Override
    public void process(WebSocketSession session, LoginUser loginUser, String payload) {
        // 解析消息
        JSONObject json = JSONUtil.parseObj(payload);
        Long targetUserId = json.getLong("targetUserId");
        String content = json.getStr("content");

        // 构建响应消息
        JSONObject response = new JSONObject();
        response.set("type", "chat");
        response.set("fromUserId", loginUser.getUserId());
        response.set("fromUserName", loginUser.getUsername());
        response.set("content", content);
        response.set("timestamp", System.currentTimeMillis());

        // 发送给目标用户
        WebSocketUtils.sendMessage(targetUserId, response.toString());

        // 给发送者回执
        JSONObject ack = new JSONObject();
        ack.set("type", "ack");
        ack.set("messageId", json.getStr("messageId"));
        ack.set("status", "delivered");
        WebSocketUtils.sendMessage(session, ack.toString());
    }
}
```

**客户端发送的消息格式**：

```json
{
  "type": "chat",
  "messageId": "msg_001",
  "targetUserId": 1002,
  "content": "你好！"
}
```

#### 4. 会话管理

```java
import plus.ruoyi.common.websocket.holder.WebSocketSessionHolder;

// 检查用户是否在线
boolean online = WebSocketSessionHolder.isUserOnline(userId);

// 获取用户的所有会话
Map<String, WebSocketSession> sessions = WebSocketSessionHolder.getUserSessions(userId);

// 检查特定会话是否存在
boolean exists = WebSocketSessionHolder.isSessionExists(userId, sessionId);

// 获取当前租户所有在线用户ID
Set<Long> onlineUsers = WebSocketSessionHolder.getAllUserIds();

// 获取所有租户的在线用户ID（超级管理员）
Set<Long> allUsers = WebSocketSessionHolder.getGlobalAllUserIds();

// 移除用户的所有连接
WebSocketSessionHolder.removeAllSessions(userId);
```

### 客户端连接示例

#### JavaScript 连接示例

```javascript
class WebSocketClient {
  constructor(options = {}) {
    this.url = options.url || 'ws://localhost:8080/websocket';
    this.token = options.token;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectAttempts = 0;
    this.ws = null;
    this.heartbeatInterval = null;
    this.messageHandlers = new Map();
  }

  // 建立连接
  connect() {
    const url = `${this.url}?Authorization=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket 连接成功');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket 连接关闭', event.code, event.reason);
      this.stopHeartbeat();
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误', error);
    };
  }

  // 处理消息
  handleMessage(data) {
    // 处理心跳响应
    if (data === 'pong') {
      console.log('收到心跳响应');
      return;
    }

    try {
      const message = JSON.parse(data);
      const type = message.type || 'default';

      // 调用对应的消息处理器
      const handler = this.messageHandlers.get(type);
      if (handler) {
        handler(message);
      } else {
        console.log('收到消息:', message);
      }
    } catch (e) {
      console.log('收到文本消息:', data);
    }
  }

  // 注册消息处理器
  on(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  // 发送消息
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
    } else {
      console.warn('WebSocket 未连接');
    }
  }

  // 心跳检测
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping');
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 自动重连
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('重连次数已达上限');
    }
  }

  // 断开连接
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// 使用示例
const client = new WebSocketClient({
  url: 'ws://localhost:8080/websocket',
  token: 'your-auth-token'
});

// 注册消息处理器
client.on('chat', (message) => {
  console.log('收到聊天消息:', message);
});

client.on('notification', (message) => {
  console.log('收到通知:', message);
});

// 建立连接
client.connect();

// 发送消息
client.send({
  type: 'chat',
  targetUserId: 1002,
  content: '你好！'
});
```

#### UniApp 连接示例

```typescript
// composables/useWebSocket.ts
import { ref, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

export function useWebSocket() {
  const userStore = useUserStore()
  const connected = ref(false)
  const socketTask = ref<UniApp.SocketTask | null>(null)
  let heartbeatTimer: number | null = null
  let reconnectTimer: number | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5

  // 建立连接
  const connect = () => {
    const token = userStore.token
    if (!token) {
      console.warn('未登录，无法建立WebSocket连接')
      return
    }

    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
    const url = `${baseUrl}/websocket?Authorization=${token}`

    socketTask.value = uni.connectSocket({
      url,
      success: () => {
        console.log('WebSocket 连接请求发送成功')
      },
      fail: (err) => {
        console.error('WebSocket 连接请求失败', err)
      }
    })

    // 连接打开
    socketTask.value?.onOpen(() => {
      console.log('WebSocket 连接成功')
      connected.value = true
      reconnectAttempts = 0
      startHeartbeat()
    })

    // 接收消息
    socketTask.value?.onMessage((res) => {
      handleMessage(res.data)
    })

    // 连接关闭
    socketTask.value?.onClose(() => {
      console.log('WebSocket 连接关闭')
      connected.value = false
      stopHeartbeat()
      reconnect()
    })

    // 连接错误
    socketTask.value?.onError((err) => {
      console.error('WebSocket 错误', err)
      connected.value = false
    })
  }

  // 消息处理
  const messageHandlers = new Map<string, Function>()

  const handleMessage = (data: string) => {
    if (data === 'pong') {
      return
    }

    try {
      const message = JSON.parse(data)
      const type = message.type || 'default'
      const handler = messageHandlers.get(type)
      if (handler) {
        handler(message)
      }
    } catch (e) {
      console.log('收到文本消息:', data)
    }
  }

  // 注册消息处理器
  const on = (type: string, handler: Function) => {
    messageHandlers.set(type, handler)
  }

  // 发送消息
  const send = (data: string | object) => {
    if (socketTask.value && connected.value) {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      socketTask.value.send({
        data: message,
        success: () => console.log('消息发送成功'),
        fail: (err) => console.error('消息发送失败', err)
      })
    }
  }

  // 心跳检测
  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      send('ping')
    }, 30000) as unknown as number
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 重连
  const reconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++
      console.log(`尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})`)
      reconnectTimer = setTimeout(() => {
        connect()
      }, 3000) as unknown as number
    }
  }

  // 断开连接
  const disconnect = () => {
    stopHeartbeat()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }
    socketTask.value?.close({})
    socketTask.value = null
    connected.value = false
  }

  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    connect,
    disconnect,
    send,
    on
  }
}
```

---

## SSE 使用指南

### 配置说明

**application.yml 配置**：

```yaml
# SSE 配置
sse:
  # 是否开启 SSE
  enabled: true
  # SSE 连接路径
  path: /sse
```

### 核心组件

#### 1. SseMessageUtils 工具类

```java
import plus.ruoyi.common.sse.utils.SseMessageUtils;
import plus.ruoyi.common.sse.dto.SseMessageDto;

// 1. 向单个用户发送消息（本地）
SseMessageUtils.sendMessage(userId, "您有新消息");

// 2. 向本机所有用户发送消息
SseMessageUtils.sendMessage("系统通知");

// 3. 通过Redis发布向指定用户发送消息（支持集群）
SseMessageDto dto = SseMessageDto.of(Arrays.asList(userId), "消息内容");
SseMessageUtils.publishMessage(dto);

// 4. 向所有用户广播（支持集群）
SseMessageUtils.publishAll("全局广播消息");

// 5. 检查SSE功能是否开启
if (SseMessageUtils.isEnable()) {
    // SSE功能已开启
}
```

#### 2. SseEmitterManager 连接管理

```java
import plus.ruoyi.common.sse.core.SseEmitterManager;

@Autowired
private SseEmitterManager sseEmitterManager;

// 建立连接
SseEmitter emitter = sseEmitterManager.connect(userId, token);

// 断开连接
sseEmitterManager.disconnect(userId, token);

// 向用户发送消息
sseEmitterManager.sendMessage(userId, "消息内容");

// 向所有用户发送消息
sseEmitterManager.sendMessage("广播消息");

// 发布消息到Redis（集群模式）
sseEmitterManager.publishMessage(sseMessageDto);
sseEmitterManager.publishAll("全局消息");
```

### 客户端连接示例

#### JavaScript 连接示例

```javascript
class SseClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:8080';
    this.token = options.token;
    this.eventSource = null;
    this.messageHandlers = [];
  }

  // 建立连接
  connect() {
    const url = `${this.baseUrl}/sse?Authorization=${this.token}`;

    this.eventSource = new EventSource(url, {
      withCredentials: true
    });

    this.eventSource.onopen = () => {
      console.log('SSE 连接成功');
    };

    // 监听消息事件
    this.eventSource.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE 错误', error);
      // EventSource 会自动重连
    };
  }

  // 处理消息
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      this.messageHandlers.forEach(handler => handler(message));
    } catch (e) {
      console.log('收到文本消息:', data);
    }
  }

  // 注册消息处理器
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  // 断开连接
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // 通知服务器关闭连接
    fetch(`${this.baseUrl}/sse/close?Authorization=${this.token}`);
  }
}

// 使用示例
const sseClient = new SseClient({
  baseUrl: 'http://localhost:8080',
  token: 'your-auth-token'
});

sseClient.onMessage((message) => {
  console.log('收到SSE消息:', message);
  // 根据消息类型处理
  if (message.type === 'notification') {
    showNotification(message.content);
  }
});

sseClient.connect();
```

#### UniApp 连接示例

由于 UniApp 不直接支持 EventSource，需要使用轮询或第三方插件：

```typescript
// composables/useSse.ts
import { ref, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

export function useSse() {
  const userStore = useUserStore()
  const connected = ref(false)
  let pollTimer: number | null = null
  const messageHandlers: Function[] = []

  // 使用长轮询模拟SSE（UniApp兼容方案）
  const connect = () => {
    const token = userStore.token
    if (!token) return

    const poll = async () => {
      try {
        const res = await uni.request({
          url: `${import.meta.env.VITE_API_URL}/sse`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 60000 // 长轮询超时60秒
        })

        if (res.statusCode === 200 && res.data) {
          handleMessage(res.data)
        }

        // 继续轮询
        if (connected.value) {
          pollTimer = setTimeout(poll, 100) as unknown as number
        }
      } catch (error) {
        console.error('SSE轮询错误', error)
        // 重试
        if (connected.value) {
          pollTimer = setTimeout(poll, 3000) as unknown as number
        }
      }
    }

    connected.value = true
    poll()
  }

  const handleMessage = (data: any) => {
    messageHandlers.forEach(handler => handler(data))
  }

  const onMessage = (handler: Function) => {
    messageHandlers.push(handler)
  }

  const disconnect = () => {
    connected.value = false
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    connect,
    disconnect,
    onMessage
  }
}
```

---

## 业务场景示例

### 场景一：系统通知推送

```java
@Service
@RequiredArgsConstructor
public class NotificationService {

    /**
     * 发送系统通知给指定用户
     */
    public void sendNotification(Long userId, String title, String content) {
        JSONObject notification = new JSONObject();
        notification.set("type", "notification");
        notification.set("title", title);
        notification.set("content", content);
        notification.set("timestamp", System.currentTimeMillis());

        // 使用WebSocket发送
        WebSocketUtils.sendMessage(userId, notification.toString());
    }

    /**
     * 发送系统通知给多个用户
     */
    public void sendNotificationBatch(List<Long> userIds, String title, String content) {
        JSONObject notification = new JSONObject();
        notification.set("type", "notification");
        notification.set("title", title);
        notification.set("content", content);
        notification.set("timestamp", System.currentTimeMillis());

        WebSocketMessageDto message = WebSocketMessageDto.of(userIds, notification.toString());
        WebSocketUtils.publishMessage(message);
    }

    /**
     * 发送系统广播
     */
    public void broadcast(String title, String content) {
        JSONObject notification = new JSONObject();
        notification.set("type", "broadcast");
        notification.set("title", title);
        notification.set("content", content);
        notification.set("timestamp", System.currentTimeMillis());

        WebSocketUtils.publishAll(notification.toString());
    }
}
```

### 场景二：订单状态变更通知

```java
@Service
@RequiredArgsConstructor
public class OrderNotifyService {

    /**
     * 订单状态变更时通知用户
     */
    public void notifyOrderStatusChange(Order order) {
        Long userId = order.getUserId();

        JSONObject message = new JSONObject();
        message.set("type", "order_status");
        message.set("orderId", order.getId());
        message.set("orderNo", order.getOrderNo());
        message.set("status", order.getStatus());
        message.set("statusName", order.getStatusName());
        message.set("updateTime", order.getUpdateTime());

        // 通知买家
        WebSocketUtils.sendMessage(userId, message.toString());

        // 如果有卖家，也通知卖家
        if (order.getSellerId() != null) {
            WebSocketUtils.sendMessage(order.getSellerId(), message.toString());
        }
    }

    /**
     * 订单支付成功通知
     */
    public void notifyPaymentSuccess(Order order) {
        JSONObject message = new JSONObject();
        message.set("type", "payment_success");
        message.set("orderId", order.getId());
        message.set("orderNo", order.getOrderNo());
        message.set("amount", order.getPayAmount());
        message.set("payTime", order.getPayTime());

        WebSocketUtils.sendMessage(order.getUserId(), message.toString());
    }
}
```

### 场景三：实时聊天

```java
@Component
public class ChatMessageProcessor implements MessageProcessor {

    @Autowired
    private ChatMessageService chatMessageService;

    @Override
    public boolean support(String type) {
        return "chat".equals(type) || "typing".equals(type);
    }

    @Override
    public void process(WebSocketSession session, LoginUser loginUser, String payload) {
        JSONObject json = JSONUtil.parseObj(payload);
        String messageType = json.getStr("type");

        if ("chat".equals(messageType)) {
            handleChatMessage(loginUser, json);
        } else if ("typing".equals(messageType)) {
            handleTypingMessage(loginUser, json);
        }
    }

    private void handleChatMessage(LoginUser loginUser, JSONObject json) {
        Long targetUserId = json.getLong("targetUserId");
        String content = json.getStr("content");
        String messageId = json.getStr("messageId");

        // 保存消息到数据库
        ChatMessage chatMessage = chatMessageService.saveMessage(
            loginUser.getUserId(),
            targetUserId,
            content
        );

        // 构建响应
        JSONObject response = new JSONObject();
        response.set("type", "chat");
        response.set("messageId", messageId);
        response.set("chatId", chatMessage.getId());
        response.set("fromUserId", loginUser.getUserId());
        response.set("fromUserName", loginUser.getNickname());
        response.set("fromUserAvatar", loginUser.getAvatar());
        response.set("content", content);
        response.set("timestamp", chatMessage.getCreateTime());

        // 发送给目标用户
        WebSocketUtils.sendMessage(targetUserId, response.toString());

        // 发送回执给发送者
        JSONObject ack = new JSONObject();
        ack.set("type", "message_ack");
        ack.set("messageId", messageId);
        ack.set("chatId", chatMessage.getId());
        ack.set("status", "sent");
        WebSocketUtils.sendMessage(loginUser.getUserId(), ack.toString());
    }

    private void handleTypingMessage(LoginUser loginUser, JSONObject json) {
        Long targetUserId = json.getLong("targetUserId");

        JSONObject response = new JSONObject();
        response.set("type", "typing");
        response.set("userId", loginUser.getUserId());
        response.set("userName", loginUser.getNickname());

        WebSocketUtils.sendMessage(targetUserId, response.toString());
    }
}
```

### 场景四：实时数据监控

```java
@Service
@RequiredArgsConstructor
public class MonitorPushService {

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    /**
     * 启动实时监控数据推送
     */
    @PostConstruct
    public void startMonitorPush() {
        scheduler.scheduleAtFixedRate(() -> {
            try {
                pushServerMetrics();
            } catch (Exception e) {
                log.error("推送监控数据失败", e);
            }
        }, 0, 5, TimeUnit.SECONDS);
    }

    /**
     * 推送服务器指标数据
     */
    private void pushServerMetrics() {
        // 收集服务器指标
        JSONObject metrics = new JSONObject();
        metrics.set("type", "server_metrics");
        metrics.set("cpuUsage", getCpuUsage());
        metrics.set("memoryUsage", getMemoryUsage());
        metrics.set("diskUsage", getDiskUsage());
        metrics.set("activeConnections", getActiveConnections());
        metrics.set("requestsPerSecond", getRequestsPerSecond());
        metrics.set("timestamp", System.currentTimeMillis());

        // 向所有监控页面用户推送
        SseMessageUtils.publishAll(metrics.toString());
    }

    @PreDestroy
    public void stopMonitorPush() {
        scheduler.shutdown();
    }
}
```

### 场景五：工作流审批通知

```java
@Service
@RequiredArgsConstructor
public class WorkflowNotifyService {

    /**
     * 通知审批人有新的待办
     */
    public void notifyNewTask(Long assigneeId, FlowTask task) {
        JSONObject message = new JSONObject();
        message.set("type", "workflow_task");
        message.set("action", "new_task");
        message.set("taskId", task.getId());
        message.set("taskName", task.getName());
        message.set("processName", task.getProcessName());
        message.set("businessKey", task.getBusinessKey());
        message.set("createTime", task.getCreateTime());

        WebSocketUtils.sendMessage(assigneeId, message.toString());
    }

    /**
     * 通知申请人审批结果
     */
    public void notifyApprovalResult(Long applicantId, FlowTask task, boolean approved) {
        JSONObject message = new JSONObject();
        message.set("type", "workflow_result");
        message.set("taskId", task.getId());
        message.set("taskName", task.getName());
        message.set("processName", task.getProcessName());
        message.set("approved", approved);
        message.set("comment", task.getComment());
        message.set("completeTime", task.getCompleteTime());

        WebSocketUtils.sendMessage(applicantId, message.toString());
    }

    /**
     * 批量通知候选人
     */
    public void notifyCandidates(List<Long> candidateIds, FlowTask task) {
        JSONObject message = new JSONObject();
        message.set("type", "workflow_task");
        message.set("action", "candidate_task");
        message.set("taskId", task.getId());
        message.set("taskName", task.getName());
        message.set("processName", task.getProcessName());

        WebSocketMessageDto dto = WebSocketMessageDto.of(candidateIds, message.toString());
        WebSocketUtils.publishMessage(dto);
    }
}
```

---

## 最佳实践

### 1. 消息格式规范

建议统一消息格式，便于客户端处理：

```java
/**
 * 统一消息格式
 */
@Data
public class PushMessage {
    /** 消息类型 */
    private String type;
    /** 消息ID */
    private String messageId;
    /** 业务数据 */
    private Object data;
    /** 时间戳 */
    private Long timestamp;

    public static PushMessage of(String type, Object data) {
        PushMessage message = new PushMessage();
        message.setType(type);
        message.setMessageId(IdUtil.fastSimpleUUID());
        message.setData(data);
        message.setTimestamp(System.currentTimeMillis());
        return message;
    }

    public String toJson() {
        return JsonUtils.toJsonString(this);
    }
}

// 使用示例
PushMessage message = PushMessage.of("notification", notificationData);
WebSocketUtils.sendMessage(userId, message.toJson());
```

### 2. 心跳保活

WebSocket 连接需要心跳保活，防止被代理服务器断开：

```java
// 服务端配置心跳检测
@Configuration
public class WebSocketConfig {

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        // 设置空闲超时时间（毫秒）
        container.setMaxSessionIdleTimeout(60000L);
        return container;
    }
}
```

客户端心跳：

```javascript
// 客户端每30秒发送心跳
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send('ping');
  }
}, 30000);
```

### 3. 异常处理

```java
/**
 * 安全发送消息，捕获异常
 */
public void safeSendMessage(Long userId, String message) {
    try {
        WebSocketUtils.sendMessage(userId, message);
    } catch (Exception e) {
        log.error("发送WebSocket消息失败, userId: {}, message: {}", userId, message, e);
        // 可以将消息存入离线消息队列
        offlineMessageService.save(userId, message);
    }
}
```

### 4. 消息持久化

对于重要消息，建议持久化以支持离线消息：

```java
@Service
public class MessagePersistenceService {

    @Autowired
    private OfflineMessageMapper offlineMessageMapper;

    /**
     * 发送消息，支持离线存储
     */
    public void sendWithPersistence(Long userId, String message, boolean persistent) {
        // 检查用户是否在线
        if (WebSocketSessionHolder.isUserOnline(userId)) {
            WebSocketUtils.sendMessage(userId, message);
        } else if (persistent) {
            // 用户离线，存储消息
            OfflineMessage offlineMessage = new OfflineMessage();
            offlineMessage.setUserId(userId);
            offlineMessage.setContent(message);
            offlineMessage.setCreateTime(new Date());
            offlineMessageMapper.insert(offlineMessage);
        }
    }

    /**
     * 用户上线时推送离线消息
     */
    public void pushOfflineMessages(Long userId) {
        List<OfflineMessage> messages = offlineMessageMapper.selectByUserId(userId);
        for (OfflineMessage message : messages) {
            WebSocketUtils.sendMessage(userId, message.getContent());
        }
        // 清除已推送的离线消息
        offlineMessageMapper.deleteByUserId(userId);
    }
}
```

### 5. 限流控制

防止消息推送过于频繁：

```java
@Service
public class RateLimitedPushService {

    private final RateLimiter rateLimiter = RateLimiter.create(100); // 每秒100条消息

    public void sendMessage(Long userId, String message) {
        if (rateLimiter.tryAcquire()) {
            WebSocketUtils.sendMessage(userId, message);
        } else {
            log.warn("消息推送被限流, userId: {}", userId);
            // 可以将消息加入队列稍后重试
        }
    }
}
```

### 6. 消息压缩

对于大消息，可以进行压缩：

```java
public void sendCompressedMessage(Long userId, Object data) {
    String json = JsonUtils.toJsonString(data);

    // 消息超过一定大小时压缩
    if (json.length() > 1024) {
        byte[] compressed = GzipUtils.compress(json.getBytes(StandardCharsets.UTF_8));
        String base64 = Base64.getEncoder().encodeToString(compressed);

        JSONObject message = new JSONObject();
        message.set("compressed", true);
        message.set("data", base64);

        WebSocketUtils.sendMessage(userId, message.toString());
    } else {
        WebSocketUtils.sendMessage(userId, json);
    }
}
```

### 7. 多租户消息隔离

确保消息在租户间正确隔离：

```java
/**
 * 租户感知的消息推送服务
 */
@Service
public class TenantAwarePushService {

    /**
     * 向当前租户的用户发送消息
     */
    public void sendToTenantUser(Long userId, String message) {
        // WebSocketUtils 自动处理租户隔离
        WebSocketUtils.sendMessage(userId, message);
    }

    /**
     * 向当前租户所有用户广播
     */
    public void broadcastToTenant(String message) {
        WebSocketUtils.publishAll(message);
    }

    /**
     * 跨租户发送消息（需超级管理员权限）
     */
    public void sendCrossTenant(String tenantId, List<Long> userIds, String message) {
        // 仅超级管理员可以执行
        WebSocketUtils.publishCrossTenant(tenantId, userIds, message);
    }
}
```

---

## 常见问题

### 1. WebSocket 连接频繁断开

**问题原因**：
- Nginx 代理超时配置不当
- 没有心跳保活
- 服务器资源不足

**解决方案**：

```nginx
# Nginx 配置
location /websocket {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;  # 设置较长的超时时间
    proxy_send_timeout 3600s;
}
```

```java
// 客户端心跳保活
// 每30秒发送心跳，服务端响应pong
```

### 2. 集群环境消息不同步

**问题原因**：
- Redis 发布订阅未正确配置
- 消息对象序列化问题

**解决方案**：

确保使用 `publishMessage` 而非 `sendMessage`：

```java
// 错误：只能发送到当前实例的用户
WebSocketUtils.sendMessage(userId, message);

// 正确：通过Redis分发到所有实例
WebSocketMessageDto dto = WebSocketMessageDto.of(userId, message);
WebSocketUtils.publishMessage(dto);
```

### 3. 消息丢失

**问题原因**：
- 用户离线时消息未持久化
- 网络抖动导致发送失败

**解决方案**：

```java
// 实现消息确认机制
public void sendWithAck(Long userId, String messageId, String content) {
    // 发送消息
    JSONObject message = new JSONObject();
    message.set("messageId", messageId);
    message.set("content", content);
    message.set("requireAck", true);

    WebSocketUtils.sendMessage(userId, message.toString());

    // 存入待确认队列
    pendingAckService.add(messageId, userId, content);
}

// 客户端收到消息后发送确认
// { "type": "ack", "messageId": "xxx" }

// 服务端收到确认后从队列移除
// 未确认的消息定时重发
```

### 4. 内存泄漏

**问题原因**：
- 连接断开后未清理资源
- 消息处理器持有会话引用

**解决方案**：

框架已内置资源清理机制，确保不要在业务代码中长期持有 `WebSocketSession` 引用：

```java
// 错误：长期持有会话引用
private Map<Long, WebSocketSession> userSessions = new HashMap<>();

// 正确：通过 WebSocketSessionHolder 获取会话
WebSocketSession session = WebSocketSessionHolder.getSession(userId, sessionId);
```

### 5. 跨域问题

**问题原因**：
- WebSocket 跨域配置缺失

**解决方案**：

```yaml
# application.yml
websocket:
  enabled: true
  path: /websocket
  allowedOrigins: '*'  # 或指定具体域名
```

### 6. 认证失败

**问题原因**：
- Token 过期或无效
- 握手时未正确传递 Token

**解决方案**：

```javascript
// 客户端连接时传递 Token
const ws = new WebSocket(`ws://localhost:8080/websocket?Authorization=${token}`);

// 或通过 Sec-WebSocket-Protocol 传递
const ws = new WebSocket(url, [token]);
```

---

## 监控与运维

### 连接统计

```java
@RestController
@RequestMapping("/admin/websocket")
public class WebSocketAdminController {

    @GetMapping("/stats")
    public R<Object> getStats() {
        // 当前租户统计
        WebSocketSessionHolder.ConnectionStats stats = WebSocketUtils.getConnectionStats();

        Map<String, Object> result = new HashMap<>();
        result.put("tenantId", stats.getTenantId());
        result.put("onlineUsers", stats.getOnlineUsers());
        result.put("totalConnections", stats.getTotalConnections());

        return R.ok(result);
    }

    @GetMapping("/globalStats")
    @SaCheckRole("superadmin")
    public R<Object> getGlobalStats() {
        // 全局统计（超级管理员）
        WebSocketSessionHolder.ConnectionStats stats = WebSocketUtils.getGlobalConnectionStats();

        Map<String, Object> result = new HashMap<>();
        result.put("totalTenants", stats.getTotalTenants());
        result.put("totalUsers", stats.getOnlineUsers());
        result.put("totalConnections", stats.getTotalConnections());

        return R.ok(result);
    }
}
```

### 日志监控

```yaml
# logback-spring.xml
<logger name="plus.ruoyi.common.websocket" level="DEBUG"/>
<logger name="plus.ruoyi.common.sse" level="DEBUG"/>
```

### 健康检查

```java
@Component
public class WebSocketHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        WebSocketSessionHolder.ConnectionStats stats = WebSocketUtils.getConnectionStats();

        return Health.up()
            .withDetail("onlineUsers", stats.getOnlineUsers())
            .withDetail("totalConnections", stats.getTotalConnections())
            .build();
    }
}
```

---

## 性能优化

### 1. 消息批量发送

```java
/**
 * 批量发送消息，减少网络开销
 */
public void batchSendMessages(List<Long> userIds, String message) {
    // 按实例分组，减少Redis发布次数
    Map<Boolean, List<Long>> grouped = userIds.stream()
        .collect(Collectors.partitioningBy(WebSocketSessionHolder::isUserOnline));

    // 本地用户直接发送
    for (Long userId : grouped.get(true)) {
        WebSocketUtils.sendMessage(userId, message);
    }

    // 远程用户通过Redis一次性发布
    List<Long> remoteUsers = grouped.get(false);
    if (!remoteUsers.isEmpty()) {
        WebSocketMessageDto dto = WebSocketMessageDto.of(remoteUsers, message);
        WebSocketUtils.publishMessage(dto);
    }
}
```

### 2. 连接池配置

```yaml
# Undertow WebSocket 配置
server:
  undertow:
    buffer-size: 1024
    direct-buffers: true
    threads:
      io: 16
      worker: 256
```

### 3. 异步发送

```java
@Service
public class AsyncPushService {

    @Async("pushExecutor")
    public void asyncSendMessage(Long userId, String message) {
        WebSocketUtils.sendMessage(userId, message);
    }
}

@Configuration
public class AsyncConfig {

    @Bean("pushExecutor")
    public Executor pushExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("push-");
        executor.initialize();
        return executor;
    }
}
```

---

## 总结

RuoYi-Plus 消息推送模块提供了完整的实时通信解决方案：

1. **双方案支持**：WebSocket 适合双向通信场景，SSE 适合服务器单向推送
2. **多连接管理**：支持同一用户多设备同时在线，互不影响
3. **多租户隔离**：消息在租户间完全隔离，确保数据安全
4. **集群部署**：通过 Redis 发布订阅实现跨节点消息同步
5. **易于扩展**：WebSocket 消息处理采用策略模式，新增消息类型只需实现接口
6. **生产就绪**：内置连接管理、心跳保活、资源清理等生产级特性

选择建议：
- **需要双向通信**（如聊天、实时协作）→ 选择 WebSocket
- **只需服务端推送**（如通知、监控）→ 选择 SSE
- **兼容性要求高** → 选择 WebSocket（IE 也支持）
- **实现简单** → 选择 SSE（基于 HTTP，自动重连）
