# WebSocket 流式对话

## 介绍

WebSocket 流式对话提供了实时、双向的 AI 对话能力，适合构建聊天应用、在线客服等场景。相比传统的 HTTP 请求，WebSocket 可以实现更低延迟的流式响应和更好的用户体验。

**核心特性:**

- **实时通信** - 基于 WebSocket 的双向实时通信
- **流式输出** - AI 响应逐字输出，即时可见
- **会话保持** - 自动管理会话状态和历史记录
- **连接管理** - 自动处理连接、断线重连等

## 快速开始

### 1. 创建 WebSocket 端点

```java
@Component
@ServerEndpoint(value = "/ws/chat/{sessionId}")
@Slf4j
public class AiChatWebSocket {

    private static ChatService chatService;
    private static ChatMemoryManager memoryManager;

    @Autowired
    public void setChatService(ChatService chatService) {
        AiChatWebSocket.chatService = chatService;
    }

    @Autowired
    public void setMemoryManager(ChatMemoryManager memoryManager) {
        AiChatWebSocket.memoryManager = memoryManager;
    }

    private Session session;
    private String sessionId;

    /**
     * 连接建立
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("sessionId") String sessionId) {
        this.session = session;
        this.sessionId = sessionId;
        log.info("WebSocket 连接建立: {}", sessionId);

        // 发送欢迎消息
        sendMessage("连接成功，开始对话吧！");
    }

    /**
     * 接收消息
     */
    @OnMessage
    public void onMessage(String message) {
        log.info("收到消息: {}", message);

        try {
            // 解析请求
            AiChatRequest request = parseRequest(message);

            // 构建对话请求
            ChatRequest chatRequest = new ChatRequest()
                .setProvider(request.getProvider())
                .setSessionId(sessionId)
                .setMessage(request.getMessage())
                .setMode(ChatMode.CONTINUOUS)
                .setStream(true);

            // 流式对话
            chatService.streamChat(chatRequest, response -> {
                if (!response.getFinished()) {
                    // 发送内容片段
                    sendMessage(response.getContent());
                } else {
                    // 发送完成标记
                    sendComplete(response);
                }
            });

        } catch (Exception e) {
            log.error("处理消息失败", e);
            sendError(e.getMessage());
        }
    }

    /**
     * 连接关闭
     */
    @OnClose
    public void onClose() {
        log.info("WebSocket 连接关闭: {}", sessionId);
    }

    /**
     * 错误处理
     */
    @OnError
    public void onError(Throwable error) {
        log.error("WebSocket 错误: {}", sessionId, error);
    }

    /**
     * 发送消息
     */
    private void sendMessage(String content) {
        try {
            AiChatResponse response = new AiChatResponse()
                .setType("content")
                .setContent(content);
            session.getBasicRemote().sendText(toJson(response));
        } catch (IOException e) {
            log.error("发送消息失败", e);
        }
    }

    /**
     * 发送完成标记
     */
    private void sendComplete(ChatResponse response) {
        try {
            AiChatResponse wsResponse = new AiChatResponse()
                .setType("complete")
                .setTokenUsage(response.getTokenUsage())
                .setResponseTime(response.getResponseTime());
            session.getBasicRemote().sendText(toJson(wsResponse));
        } catch (IOException e) {
            log.error("发送完成标记失败", e);
        }
    }

    /**
     * 发送错误
     */
    private void sendError(String error) {
        try {
            AiChatResponse response = new AiChatResponse()
                .setType("error")
                .setError(error);
            session.getBasicRemote().sendText(toJson(response));
        } catch (IOException e) {
            log.error("发送错误消息失败", e);
        }
    }

    private AiChatRequest parseRequest(String message) {
        return JSON.parseObject(message, AiChatRequest.class);
    }

    private String toJson(Object obj) {
        return JSON.toJSONString(obj);
    }
}
```

### 2. 配置 WebSocket

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig {

    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
```

### 3. 前端连接示例

```javascript
// 建立 WebSocket 连接
const sessionId = 'user-123';
const ws = new WebSocket(`ws://localhost:8080/ws/chat/${sessionId}`);

// 连接打开
ws.onopen = () => {
  console.log('WebSocket 连接已建立');
};

// 接收消息
ws.onmessage = (event) => {
  const response = JSON.parse(event.data);

  if (response.type === 'content') {
    // 追加内容片段
    appendMessage(response.content);
  } else if (response.type === 'complete') {
    // 流式完成
    console.log('响应完成');
    console.log('Token 使用:', response.tokenUsage);
  } else if (response.type === 'error') {
    // 错误处理
    console.error('错误:', response.error);
  }
};

// 发送消息
function sendMessage(message) {
  const request = {
    provider: 'deepseek',
    message: message
  };
  ws.send(JSON.stringify(request));
}

// 关闭连接
ws.onclose = () => {
  console.log('WebSocket 连接已关闭');
};

// 错误处理
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};
```

## 完整示例

### 聊天界面

```html
<!DOCTYPE html>
<html>
<head>
  <title>AI 聊天</title>
  <style>
    .chat-container {
      width: 600px;
      height: 500px;
      border: 1px solid #ccc;
      overflow-y: auto;
      padding: 10px;
    }
    .message {
      margin: 10px 0;
      padding: 8px;
      border-radius: 5px;
    }
    .user-message {
      background: #e3f2fd;
      text-align: right;
    }
    .ai-message {
      background: #f5f5f5;
    }
    .input-area {
      margin-top: 10px;
    }
    #messageInput {
      width: 500px;
      padding: 8px;
    }
    #sendButton {
      padding: 8px 20px;
    }
  </style>
</head>
<body>
  <div class="chat-container" id="chatContainer"></div>
  <div class="input-area">
    <input type="text" id="messageInput" placeholder="输入消息...">
    <button id="sendButton">发送</button>
  </div>

  <script>
    let ws;
    let currentAiMessage = null;

    // 初始化 WebSocket
    function initWebSocket() {
      const sessionId = 'user-' + Date.now();
      ws = new WebSocket(`ws://localhost:8080/ws/chat/${sessionId}`);

      ws.onopen = () => {
        console.log('连接成功');
        addSystemMessage('连接成功，开始对话吧！');
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.type === 'content') {
          // 追加 AI 回复内容
          if (!currentAiMessage) {
            currentAiMessage = addAiMessage('');
          }
          currentAiMessage.textContent += response.content;
        } else if (response.type === 'complete') {
          // 回复完成
          currentAiMessage = null;
          console.log('Token 使用:', response.tokenUsage);
        } else if (response.type === 'error') {
          addSystemMessage('错误: ' + response.error);
        }
      };

      ws.onclose = () => {
        addSystemMessage('连接已关闭');
      };

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        addSystemMessage('连接错误');
      };
    }

    // 发送消息
    function sendMessage() {
      const input = document.getElementById('messageInput');
      const message = input.value.trim();

      if (!message) return;

      // 显示用户消息
      addUserMessage(message);

      // 发送到服务器
      const request = {
        provider: 'deepseek',
        message: message
      };
      ws.send(JSON.stringify(request));

      // 清空输入框
      input.value = '';
    }

    // 添加用户消息
    function addUserMessage(content) {
      const container = document.getElementById('chatContainer');
      const div = document.createElement('div');
      div.className = 'message user-message';
      div.textContent = content;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    // 添加 AI 消息
    function addAiMessage(content) {
      const container = document.getElementById('chatContainer');
      const div = document.createElement('div');
      div.className = 'message ai-message';
      div.textContent = content;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
      return div;
    }

    // 添加系统消息
    function addSystemMessage(content) {
      const container = document.getElementById('chatContainer');
      const div = document.createElement('div');
      div.style.color = '#999';
      div.style.textAlign = 'center';
      div.textContent = content;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    // 绑定事件
    document.getElementById('sendButton').onclick = sendMessage;
    document.getElementById('messageInput').onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };

    // 初始化
    initWebSocket();
  </script>
</body>
</html>
```

## Vue 3 示例

```vue
<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="message-list" ref="messageList">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role === 'user' ? 'user' : 'ai']"
      >
        {{ msg.content }}
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <input
        v-model="inputMessage"
        @keypress.enter="sendMessage"
        placeholder="输入消息..."
      />
      <button @click="sendMessage" :disabled="!connected">
        发送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const messages = ref([]);
const inputMessage = ref('');
const connected = ref(false);
const currentAiMessage = ref(null);

let ws = null;

// 初始化 WebSocket
const initWebSocket = () => {
  const sessionId = 'user-' + Date.now();
  ws = new WebSocket(`ws://localhost:8080/ws/chat/${sessionId}`);

  ws.onopen = () => {
    connected.value = true;
    addSystemMessage('连接成功');
  };

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);

    if (response.type === 'content') {
      if (!currentAiMessage.value) {
        currentAiMessage.value = addAiMessage('');
      }
      currentAiMessage.value.content += response.content;
      scrollToBottom();
    } else if (response.type === 'complete') {
      currentAiMessage.value = null;
    } else if (response.type === 'error') {
      addSystemMessage('错误: ' + response.error);
    }
  };

  ws.onclose = () => {
    connected.value = false;
    addSystemMessage('连接已关闭');
  };
};

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return;

  addUserMessage(inputMessage.value);

  const request = {
    provider: 'deepseek',
    message: inputMessage.value
  };
  ws.send(JSON.stringify(request));

  inputMessage.value = '';
};

// 添加用户消息
const addUserMessage = (content) => {
  messages.value.push({
    role: 'user',
    content: content
  });
  scrollToBottom();
};

// 添加 AI 消息
const addAiMessage = (content) => {
  const message = {
    role: 'ai',
    content: content
  };
  messages.value.push(message);
  scrollToBottom();
  return message;
};

// 添加系统消息
const addSystemMessage = (content) => {
  messages.value.push({
    role: 'system',
    content: content
  });
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const list = messageList.value;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  });
};

onMounted(() => {
  initWebSocket();
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
});

const messageList = ref(null);
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  margin: 8px 0;
  padding: 10px;
  border-radius: 8px;
  max-width: 70%;
}

.message.user {
  background: #e3f2fd;
  margin-left: auto;
  text-align: right;
}

.message.ai {
  background: #f5f5f5;
}

.input-area {
  display: flex;
  padding: 16px;
  border-top: 1px solid #ddd;
}

.input-area input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
}

.input-area button {
  padding: 8px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-area button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style>
```

## 最佳实践

### 1. 心跳保活

```java
@Scheduled(fixedRate = 30000)  // 每30秒
public void sendHeartbeat() {
    if (session != null && session.isOpen()) {
        try {
            session.getBasicRemote().sendText("{\"type\":\"heartbeat\"}");
        } catch (IOException e) {
            log.error("心跳发送失败", e);
        }
    }
}
```

### 2. 错误重连

```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connect() {
  ws = new WebSocket(url);

  ws.onerror = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      setTimeout(() => connect(), 3000);
    }
  };

  ws.onopen = () => {
    reconnectAttempts = 0;
  };
}
```

### 3. 连接管理

```java
// 管理所有连接
private static Map<String, Session> sessions = new ConcurrentHashMap<>();

@OnOpen
public void onOpen(Session session, @PathParam("sessionId") String sessionId) {
    sessions.put(sessionId, session);
}

@OnClose
public void onClose() {
    sessions.remove(sessionId);
}

// 广播消息
public static void broadcast(String message) {
    sessions.values().forEach(session -> {
        try {
            session.getBasicRemote().sendText(message);
        } catch (IOException e) {
            log.error("广播失败", e);
        }
    });
}
```

### 4. 消息压缩

```java
// 启用压缩
@ServerEndpoint(
    value = "/ws/chat/{sessionId}",
    configurator = MessageCompressionConfigurator.class
)
```

## 常见问题

### 1. 连接断开怎么办

实现自动重连机制（见最佳实践）

### 2. 如何控制并发连接数

```java
private static final int MAX_CONNECTIONS = 1000;

@OnOpen
public void onOpen(Session session, @PathParam("sessionId") String sessionId) {
    if (sessions.size() >= MAX_CONNECTIONS) {
        throw new RuntimeException("连接数已达上限");
    }
    sessions.put(sessionId, session);
}
```

### 3. 如何处理大消息

```java
// 设置最大消息大小
@OnMessage(maxMessageSize = 1024 * 1024)  // 1MB
public void onMessage(String message) {
    // ...
}
```

## 总结

WebSocket 流式对话提供了实时、流畅的 AI 对话体验，适合构建现代化的聊天应用。通过合理的连接管理和错误处理，可以构建出稳定可靠的实时对话系统。
