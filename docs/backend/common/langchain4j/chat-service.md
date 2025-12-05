# 聊天服务

## 介绍

ChatService 是 LangChain4j 模块的核心服务，提供同步和流式的 AI 对话功能。它支持多种对话模式，自动管理会话记忆，是构建智能对话应用的关键组件。

**核心特性:**

- **多对话模式** - 单轮对话、连续对话、RAG 对话、函数调用
- **会话管理** - 自动管理对话历史，支持多轮上下文
- **流式响应** - 实时输出响应内容，提升用户体验
- **灵活配置** - 支持自定义系统提示词、温度参数等

## 对话模式

| 模式 | 枚举值 | 说明 | 使用场景 |
|------|--------|------|---------|
| 单轮对话 | `SINGLE` | 无上下文记忆 | 简单问答、翻译 |
| 连续对话 | `CONTINUOUS` | 保持上下文记忆 | 多轮对话、客服 |
| RAG 对话 | `RAG` | 基于知识库检索 | 文档问答 |
| 函数调用 | `FUNCTION` | 调用外部工具 | 天气查询、计算 |

## 基本用法

### 单轮同步对话

适合简单的问答场景，不需要记忆上下文：

```java
@Autowired
private ChatService chatService;

public String simpleChat(String message) {
    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setMessage(message)
        .setMode(ChatMode.SINGLE)
        .setStream(false);

    ChatResponse response = chatService.chat(request);
    return response.getContent();
}
```

### 多轮连续对话

保持会话上下文，实现连续对话：

```java
public String continuousChat(String sessionId, String message) {
    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSessionId(sessionId)          // 会话ID
        .setMessage(message)
        .setMode(ChatMode.CONTINUOUS)     // 连续对话模式
        .setStream(false);

    ChatResponse response = chatService.chat(request);
    return response.getContent();
}
```

**对话示例：**

```java
String sessionId = "user-123";

// 第一轮
String response1 = continuousChat(sessionId, "我叫张三");
// AI: 你好张三！

// 第二轮（AI 记住了名字）
String response2 = continuousChat(sessionId, "我叫什么名字？");
// AI: 你叫张三。
```

### 流式对话

实时流式输出响应，提升用户体验：

```java
public void streamChat(String message, Consumer<String> onContent) {
    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setMessage(message)
        .setMode(ChatMode.SINGLE)
        .setStream(true);

    chatService.streamChat(request, response -> {
        if (!response.getFinished()) {
            // 输出内容片段
            onContent.accept(response.getContent());
        } else {
            // 流式完成
            System.out.println("\n完成！");
        }
    });
}

// 使用
streamChat("讲个笑话", content -> System.out.print(content));
```

## 高级功能

### 自定义系统提示词

为 AI 设置角色和行为规范：

```java
public String techAssistant(String question) {
    String systemPrompt = """
        你是一个专业的 Java 技术顾问。
        你擅长 Spring Boot、微服务架构、数据库优化等领域。
        请用简洁专业的语言回答技术问题。
        """;

    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSystemPrompt(systemPrompt)
        .setMessage(question)
        .setMode(ChatMode.SINGLE)
        .setStream(false);

    ChatResponse response = chatService.chat(request);
    return response.getContent();
}
```

### 调整模型参数

根据场景调整温度、Token 限制等参数：

```java
// 精确问答（低温度）
ChatRequest accurateRequest = new ChatRequest()
    .setProvider("deepseek")
    .setMessage("什么是 Spring Boot？")
    .setTemperature(0.1)      // 输出更稳定
    .setMaxTokens(200);

// 创意写作（高温度）
ChatRequest creativeRequest = new ChatRequest()
    .setProvider("deepseek")
    .setMessage("写一首关于春天的诗")
    .setTemperature(1.5)      // 输出更有创意
    .setMaxTokens(500);
```

### 会话管理

```java
// 获取会话历史
List<ChatMessage> history = chatService.getSessionMessages(sessionId);

// 清除会话
chatService.clearSession(sessionId);

// 获取所有活跃会话
List<String> sessions = chatService.getActiveSessions();
```

## ChatRequest 配置

### 必填参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `message` | String | 用户消息 |
| `mode` | ChatMode | 对话模式 |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `provider` | String | 配置默认值 | 模型提供商 |
| `modelName` | String | 配置默认值 | 模型名称 |
| `sessionId` | String | 自动生成 | 会话ID |
| `systemPrompt` | String | 无 | 系统提示词 |
| `temperature` | Double | `0.7` | 温度参数 |
| `maxTokens` | Integer | `2048` | 最大Token数 |
| `stream` | Boolean | `false` | 是否流式 |

## ChatResponse 结构

```java
public class ChatResponse {
    private String content;           // 响应内容
    private Boolean finished;         // 是否完成
    private String error;             // 错误信息
    private String sessionId;         // 会话ID
    private TokenUsage tokenUsage;    // Token使用统计
    private Long responseTime;        // 响应时间(ms)
}
```

## 使用场景

### 智能客服

```java
@RestController
@RequestMapping("/customer-service")
@RequiredArgsConstructor
public class CustomerServiceController {

    private final ChatService chatService;

    @PostMapping("/chat")
    public R<String> chat(@RequestParam String userId,
                          @RequestBody String message) {
        String systemPrompt = """
            你是一个友好的客户服务助手。
            请礼貌、专业地回答客户问题。
            如果不确定答案，请诚实地告知客户。
            """;

        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setSessionId("customer-" + userId)
            .setSystemPrompt(systemPrompt)
            .setMessage(message)
            .setMode(ChatMode.CONTINUOUS)
            .setStream(false);

        ChatResponse response = chatService.chat(request);
        return R.ok(response.getContent());
    }
}
```

### 代码助手

```java
public String codeAssistant(String question) {
    String systemPrompt = """
        你是一个专业的编程助手。
        回答时请包含：
        1. 清晰的解释
        2. 完整的代码示例
        3. 最佳实践建议
        """;

    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSystemPrompt(systemPrompt)
        .setMessage(question)
        .setMode(ChatMode.SINGLE)
        .setTemperature(0.3)      // 低温度，输出更准确
        .setMaxTokens(1000);

    return chatService.chat(request).getContent();
}
```

### 文档翻译

```java
public String translate(String text, String targetLang) {
    String systemPrompt = String.format(
        "你是一个专业的翻译助手。请将文本翻译成%s。", targetLang
    );

    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSystemPrompt(systemPrompt)
        .setMessage(text)
        .setMode(ChatMode.SINGLE)
        .setTemperature(0.3);     // 低温度，翻译更准确

    return chatService.chat(request).getContent();
}
```

### 内容审核

```java
public boolean contentModeration(String content) {
    String systemPrompt = """
        你是一个内容审核助手。
        请判断以下内容是否包含不当信息。
        只回答"是"或"否"。
        """;

    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSystemPrompt(systemPrompt)
        .setMessage(content)
        .setMode(ChatMode.SINGLE)
        .setTemperature(0.0)      // 最低温度，输出最稳定
        .setMaxTokens(10);

    String result = chatService.chat(request).getContent();
    return result.contains("是");
}
```

## 配置说明

### 对话配置

```yaml
langchain4j:
  chat:
    # 是否启用流式响应
    stream-enabled: true

    # 历史消息保留数量
    history-size: 10

    # 会话超时时间(分钟)
    session-timeout: 30

    # 是否启用内存管理
    memory-enabled: true

    # 存储类型: memory, redis
    memory-store-type: redis
```

### 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `stream-enabled` | Boolean | `true` | 是否启用流式 |
| `history-size` | Integer | `10` | 保留历史消息数 |
| `session-timeout` | Integer | `30` | 会话超时(分钟) |
| `memory-enabled` | Boolean | `true` | 是否启用记忆 |
| `memory-store-type` | String | `redis` | 存储类型 |

## 最佳实践

### 1. 合理设置历史消息数量

```yaml
chat:
  history-size: 10  # 简单对话
  # history-size: 20  # 复杂对话
```

### 2. 使用流式提升体验

```java
// 长文本生成 - 使用流式
.setStream(true)

// 简短问答 - 使用同步
.setStream(false)
```

### 3. 根据场景调整温度

```java
// 代码生成、翻译 - 低温度
.setTemperature(0.1)

// 日常对话 - 中温度
.setTemperature(0.7)

// 创意写作 - 高温度
.setTemperature(1.5)
```

### 4. 设置合理的 Token 限制

```java
// 简短回答
.setMaxTokens(100)

// 中等长度
.setMaxTokens(500)

// 长文章
.setMaxTokens(2000)
```

### 5. 定期清理过期会话

```java
@Scheduled(cron = "0 0 * * * ?")  // 每小时执行
public void cleanExpiredSessions() {
    // 会话管理器会自动清理超时会话
    log.info("已清理过期会话");
}
```

## 常见问题

### 1. 如何保持多轮对话

**使用 CONTINUOUS 模式并提供会话ID：**

```java
ChatRequest request = new ChatRequest()
    .setMode(ChatMode.CONTINUOUS)
    .setSessionId(sessionId);
```

### 2. 流式响应如何判断结束

**检查 `finished` 字段：**

```java
chatService.streamChat(request, response -> {
    if (response.getFinished()) {
        System.out.println("流式完成");
    }
});
```

### 3. 如何限制响应长度

**设置 `maxTokens` 参数：**

```java
.setMaxTokens(200)  // 限制最多200个Token
```

### 4. Redis 连接失败怎么办

**切换到内存存储：**

```yaml
chat:
  memory-store-type: memory  # 使用内存（仅开发环境）
```

## 总结

ChatService 提供了强大而灵活的 AI 对话能力，支持多种对话模式和丰富的配置选项。通过合理使用系统提示词、温度参数等功能，你可以构建出满足各种业务需求的智能对话应用。
