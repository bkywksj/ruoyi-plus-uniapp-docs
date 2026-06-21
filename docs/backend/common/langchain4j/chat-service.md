# 聊天服务

## 介绍

ChatService 是 LangChain4j 模块的核心服务，提供同步和流式的 AI 对话功能。它支持多种对话模式，自动管理会话记忆，是构建智能对话应用的关键组件。通过统一的服务接口，开发者可以轻松实现单轮问答、多轮对话、知识库问答和函数调用等功能。

**核心特性:**

- **多对话模式** - 单轮对话、连续对话、RAG 对话、函数调用四种模式
- **会话管理** - 自动管理对话历史，支持多轮上下文记忆
- **流式响应** - 实时输出响应内容，提升用户体验
- **深度思考** - 流式响应区分 `thinking` / `content` 两阶段，透传推理内容（reasoning_content）
- **灵活存储** - 支持内存和 Redis 两种会话存储方式
- **Token 统计** - 自动统计输入和输出 Token 使用量
- **灵活配置** - 支持自定义系统提示词、温度参数等

::: warning LangChain4j 1.x API 说明
本模块基于 **LangChain4j 1.14.1**。1.x 对模型层 API 做了重命名，文档中的代码已对齐新 API：

- 模型接口：`ChatLanguageModel` → `ChatModel`、`StreamingChatLanguageModel` → `StreamingChatModel`
- 调用方法：`generate()` → `chat()`，同步调用返回 `dev.langchain4j.model.chat.response.ChatResponse`
- 流式回调：`StreamingResponseHandler<AiMessage>` → `StreamingChatResponseHandler`，`onNext` → `onPartialResponse`、`onComplete` → `onCompleteResponse`，并新增 `onPartialThinking` 推理增量回调
- 项目响应 DTO：原 `ChatResponse` 已重命名为 **`AiChatResponse`**，以避免与 langchain4j 1.x 的模型层 `ChatResponse` 同名冲突

完整的旧 → 新 API 迁移对照表见「模型工厂」文档。
:::

## 模块架构

### 整体架构图

```text
┌─────────────────────────────────────────────────────────────────┐
│                      应用层 (Application)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Controller  │  │   Service   │  │     Scheduled Task      │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
└─────────┼────────────────┼─────────────────────┼───────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ChatService (核心服务)                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                      对话处理引擎                          │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │ │
│  │  │  SINGLE  │ │CONTINUOUS│ │   RAG    │ │   FUNCTION   │ │ │
│  │  │  单轮    │ │  多轮    │ │ 知识库  │ │   函数调用   │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌──────────────────────────┴────────────────────────────────┐ │
│  │                                                            │ │
│  │   ┌─────────────────┐          ┌─────────────────────┐   │ │
│  │   │  ModelFactory   │          │  ChatMemoryManager  │   │ │
│  │   │  模型工厂       │          │  会话记忆管理       │   │ │
│  │   └────────┬────────┘          └──────────┬──────────┘   │ │
│  │            │                               │              │ │
│  └────────────┼───────────────────────────────┼──────────────┘ │
└───────────────┼───────────────────────────────┼────────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│      AI Model Provider    │   │       Memory Store             │
│  ┌─────────────────────┐  │   │  ┌────────┐   ┌────────────┐  │
│  │ DeepSeek  │ OpenAI  │  │   │  │ Memory │   │   Redis    │  │
│  │ Qwen      │ Ollama  │  │   │  │ 内存   │   │  持久化    │  │
│  └─────────────────────┘  │   │  └────────┘   └────────────┘  │
└───────────────────────────┘   └───────────────────────────────┘
```

### 核心组件说明

| 组件 | 类名 | 职责 |
|------|------|------|
| 对话服务 | `ChatService` | 处理同步/流式对话请求，协调模型调用和会话管理 |
| 记忆管理 | `ChatMemoryManager` | 管理会话内存，支持内存和 Redis 存储 |
| 流式处理 | `StreamChatHandler` | 处理流式响应，实现增量内容推送 |
| Redis 存储 | `RedisChatStore` | 实现 `ChatMemoryStore` 接口的 Redis 存储 |
| 模型工厂 | `ModelFactory` | 创建同步和流式聊天模型实例 |

### 数据流转图

```text
┌──────────┐    ChatRequest     ┌─────────────┐
│  Client  │ ─────────────────► │ ChatService │
└──────────┘                    └──────┬──────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
            ┌───────────┐      ┌───────────┐      ┌───────────┐
            │ getOrGen  │      │  create   │      │  handle   │
            │ SessionId │      │ ChatModel │      │  ByMode   │
            └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
                  │                  │                  │
                  ▼                  ▼                  ▼
            ┌───────────┐      ┌───────────┐      ┌───────────┐
            │  Memory   │      │  Model    │      │ generate  │
            │  Manager  │◄────►│  Factory  │◄────►│  Response │
            └───────────┘      └───────────┘      └─────┬─────┘
                                                        │
                                                        ▼
                                                ┌───────────────┐
                                                │ AiChatResponse│
                                                │ + TokenUsage  │
                                                └───────────────┘
```

## 对话模式

聊天服务支持四种对话模式，每种模式适用于不同的业务场景：

| 模式 | 枚举值 | 说明 | 使用场景 |
|------|--------|------|---------|
| 单轮对话 | `SINGLE` | 无上下文记忆 | 简单问答、翻译、摘要 |
| 连续对话 | `CONTINUOUS` | 保持上下文记忆 | 多轮对话、智能客服 |
| RAG 对话 | `RAG` | 基于知识库检索 | 文档问答、企业知识库 |
| 函数调用 | `FUNCTION` | 调用外部工具 | 天气查询、计算、API调用 |

### 模式选择指南

```text
                    ┌─────────────────────┐
                    │  需要记住上下文吗？   │
                    └──────────┬──────────┘
                               │
                   ┌───────────┴───────────┐
                   │                       │
                   ▼ 否                    ▼ 是
           ┌───────────────┐       ┌───────────────┐
           │    SINGLE     │       │  需要知识库？  │
           └───────────────┘       └───────┬───────┘
                                           │
                               ┌───────────┴───────────┐
                               │                       │
                               ▼ 是                    ▼ 否
                       ┌───────────────┐       ┌───────────────┐
                       │      RAG      │       │  需要调工具？  │
                       └───────────────┘       └───────┬───────┘
                                                       │
                                           ┌───────────┴───────────┐
                                           │                       │
                                           ▼ 是                    ▼ 否
                                   ┌───────────────┐       ┌───────────────┐
                                   │   FUNCTION    │       │  CONTINUOUS   │
                                   └───────────────┘       └───────────────┘
```

### ChatMode 枚举定义

```java
/**
 * 对话模式枚举
 */
@Getter
@AllArgsConstructor
public enum ChatMode {
    /**
     * 单轮对话 - 不保存对话历史
     */
    SINGLE("single", "单轮对话"),

    /**
     * 多轮对话 - 保存对话历史，支持上下文
     */
    CONTINUOUS("continuous", "多轮对话"),

    /**
     * RAG增强对话 - 基于知识库检索增强
     */
    RAG("rag", "知识库问答"),

    /**
     * 函数调用 - 支持调用外部工具
     */
    FUNCTION("function", "函数调用");

    private final String code;
    private final String name;
}
```

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

    AiChatResponse response = chatService.chat(request);
    return response.getContent();
}
```

**工作原理:**

1. 创建 `ChatRequest` 对象，设置对话模式为 `SINGLE`
2. `ChatService` 调用 `ModelFactory` 创建聊天模型
3. 调用 `handleSingleChat` 方法处理单轮对话
4. 直接调用模型生成响应，不保存历史
5. 构建 `AiChatResponse` 返回结果

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

    AiChatResponse response = chatService.chat(request);
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

// 第三轮（继续保持上下文）
String response3 = continuousChat(sessionId, "今年30岁");
// AI: 好的，张三，我记住了你今年30岁。

// 第四轮
String response4 = continuousChat(sessionId, "我的信息是什么？");
// AI: 根据我们的对话，你叫张三，今年30岁。
```

**工作原理:**

1. `ChatMemoryManager` 根据 `sessionId` 获取或创建会话内存
2. 如果是新会话且有系统提示词，先添加系统消息
3. 添加用户消息到会话内存
4. 调用模型生成响应时传入完整的消息历史
5. 将 AI 回复保存到会话内存

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

**流式响应处理流程:**

```text
┌──────────────────────────────────────────────────────────────┐
│                  流式响应处理流程                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  StreamingChatModel.chat(messages, handler)                  │
│            │                                                 │
│            ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       StreamChatHandler (StreamingChatResponseHandler)│   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ onPartialThinking(partialThinking)             │  │   │
│  │  │   └─► phase=thinking 推理增量                  │  │   │
│  │  │   └─► responseConsumer.accept(partial)         │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ onPartialResponse(partialResponse)             │  │   │
│  │  │   └─► fullContent.append(partialResponse)      │  │   │
│  │  │   └─► phase=content 正文增量                   │  │   │
│  │  │   └─► responseConsumer.accept(partial)         │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ onCompleteResponse(completeResponse)           │  │   │
│  │  │   └─► 设置 TokenUsage                          │  │   │
│  │  │   └─► responseConsumer.accept(final)           │  │   │
│  │  │   └─► 执行 onComplete 回调                     │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ onError(error)                                 │  │   │
│  │  │   └─► 记录错误日志                             │  │   │
│  │  │   └─► responseConsumer.accept(error)           │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 多轮流式对话

结合会话记忆和流式输出：

```java
public void continuousStreamChat(String sessionId, String message,
                                  Consumer<String> onContent) {
    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSessionId(sessionId)
        .setMessage(message)
        .setMode(ChatMode.CONTINUOUS)
        .setStream(true);

    chatService.streamChat(request, response -> {
        if (!response.getFinished()) {
            onContent.accept(response.getContent());
        } else {
            // 流式完成，Token 统计已在 response.getTokenUsage() 中
            log.info("Token使用: {}", response.getTokenUsage());
        }
    });
}
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

    AiChatResponse response = chatService.chat(request);
    return response.getContent();
}
```

**系统提示词处理逻辑:**

```java
// 单轮对话 - 每次请求都添加系统提示词
private AiChatResponse handleSingleChat(ChatModel chatModel,
                                        ChatRequest request) {
    UserMessage userMessage = UserMessage.from(request.getMessage());

    // 1.x：chat() 返回 dev.langchain4j.model.chat.response.ChatResponse
    ChatResponse response;
    if (StrUtil.isNotBlank(request.getSystemPrompt())) {
        SystemMessage systemMessage = SystemMessage.from(request.getSystemPrompt());
        response = chatModel.chat(systemMessage, userMessage);
    } else {
        response = chatModel.chat(userMessage);
    }

    return buildResponse(response);
}

// 多轮对话 - 仅在新会话时添加系统提示词
private AiChatResponse handleContinuousChat(...) {
    var memory = memoryManager.getOrCreateMemory(sessionId);

    // 只有在会话为空时才添加系统提示词
    if (memory.messages().isEmpty() && StrUtil.isNotBlank(request.getSystemPrompt())) {
        memory.add(SystemMessage.from(request.getSystemPrompt()));
    }

    // ... 后续处理
}
```

### 调整模型参数

根据场景调整温度、Token 限制等参数：

```java
// 精确问答（低温度）- 输出更稳定、确定性更高
ChatRequest accurateRequest = new ChatRequest()
    .setProvider("deepseek")
    .setMessage("什么是 Spring Boot？")
    .setTemperature(0.1)      // 低温度
    .setMaxTokens(200);

// 创意写作（高温度）- 输出更多样化、创意性更强
ChatRequest creativeRequest = new ChatRequest()
    .setProvider("deepseek")
    .setMessage("写一首关于春天的诗")
    .setTemperature(1.5)      // 高温度
    .setMaxTokens(500);

// 代码生成（极低温度）- 最大确定性
ChatRequest codeRequest = new ChatRequest()
    .setProvider("deepseek")
    .setMessage("写一个快速排序算法")
    .setTemperature(0.0)      // 零温度
    .setMaxTokens(1000);
```

**温度参数说明:**

| 温度范围 | 输出特性 | 适用场景 |
|----------|----------|----------|
| 0.0 - 0.3 | 确定性高，输出稳定 | 代码生成、翻译、事实问答 |
| 0.4 - 0.7 | 适度多样性 | 日常对话、客服 |
| 0.8 - 1.2 | 创意性强 | 写作、头脑风暴 |
| 1.3 - 2.0 | 高度随机 | 创意文案、诗歌 |

### 会话管理

```java
// 获取会话历史
List<ChatMessage> history = chatService.getSessionMessages(sessionId);

// 清除会话
chatService.clearSession(sessionId);

// 获取所有活跃会话（需要扩展实现）
List<String> sessions = chatService.getActiveSessions();
```

### 知识库 ID 配置（RAG 模式）

```java
public String ragChat(String question, List<Long> knowledgeBaseIds) {
    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setMessage(question)
        .setMode(ChatMode.RAG)
        .setKnowledgeBaseIds(knowledgeBaseIds)  // 指定知识库
        .setStream(false);

    AiChatResponse response = chatService.chat(request);

    // RAG 模式会返回引用的文档
    List<DocumentReference> refs = response.getReferences();

    return response.getContent();
}
```

### 额外参数传递

```java
public String chatWithExtraParams(String message) {
    Map<String, Object> extraParams = new HashMap<>();
    extraParams.put("topP", 0.9);
    extraParams.put("frequencyPenalty", 0.5);
    extraParams.put("presencePenalty", 0.5);

    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setMessage(message)
        .setMode(ChatMode.SINGLE)
        .setExtraParams(extraParams);

    return chatService.chat(request).getContent();
}
```

## 核心实现

### ChatService 同步对话实现

```java
/**
 * 同步对话
 */
public AiChatResponse chat(ChatRequest request) {
    long startTime = System.currentTimeMillis();

    try {
        // 1. 获取或生成会话ID
        String sessionId = getOrGenerateSessionId(request);

        // 2. 获取模型提供商
        String provider = StrUtil.isNotBlank(request.getProvider())
            ? request.getProvider()
            : properties.getDefaultProvider();

        // 3. 创建聊天模型（1.x：ChatModel；传入 thinking 覆盖项）
        ChatModel chatModel = modelFactory.createChatModel(
            provider,
            request.getModelName(),
            resolveThinkingOptions(request)
        );

        // 4. 根据对话模式处理
        AiChatResponse response = switch (request.getMode()) {
            case SINGLE -> handleSingleChat(chatModel, request);
            case CONTINUOUS -> handleContinuousChat(chatModel, request, sessionId);
            case RAG -> handleRagChat(chatModel, request, sessionId);
            case FUNCTION -> handleFunctionChat(chatModel, request, sessionId);
        };

        // 5. 设置响应信息
        response.setSessionId(sessionId);
        response.setResponseTime(System.currentTimeMillis() - startTime);

        return response;

    } catch (Exception e) {
        log.error("Chat error: {}", e.getMessage(), e);
        return AiChatResponse.builder()
            .error(e.getMessage())
            .responseTime(System.currentTimeMillis() - startTime)
            .build();
    }
}
```

### ChatService 流式对话实现

```java
/**
 * 流式对话
 */
public void streamChat(ChatRequest request, Consumer<AiChatResponse> responseConsumer) {
    try {
        // 1. 获取或生成会话ID
        String sessionId = getOrGenerateSessionId(request);

        // 2. 获取模型提供商
        String provider = StrUtil.isNotBlank(request.getProvider())
            ? request.getProvider()
            : properties.getDefaultProvider();

        // 3. 创建流式聊天模型（1.x：StreamingChatModel；传入 thinking 覆盖项）
        StreamingChatModel streamingModel = modelFactory.createStreamingChatModel(
            provider,
            request.getModelName(),
            resolveThinkingOptions(request)
        );

        // 4. 根据对话模式处理
        switch (request.getMode()) {
            case SINGLE -> handleSingleStreamChat(streamingModel, request, responseConsumer);
            case CONTINUOUS -> handleContinuousStreamChat(streamingModel, request,
                                                          sessionId, responseConsumer);
            case RAG -> handleRagStreamChat(streamingModel, request, sessionId, responseConsumer);
            case FUNCTION -> handleFunctionStreamChat(streamingModel, request,
                                                      sessionId, responseConsumer);
        }

    } catch (Exception e) {
        log.error("Stream chat error: {}", e.getMessage(), e);
        responseConsumer.accept(AiChatResponse.builder()
            .error(e.getMessage())
            .finished(true)
            .build());
    }
}
```

### 多轮流式对话处理

```java
/**
 * 多轮流式对话
 */
private void handleContinuousStreamChat(
    StreamingChatModel streamingModel,
    ChatRequest request,
    String sessionId,
    Consumer<AiChatResponse> responseConsumer) {

    // 获取会话内存
    var memory = memoryManager.getOrCreateMemory(sessionId);

    // 添加系统提示词（仅新会话）
    if (memory.messages().isEmpty() && StrUtil.isNotBlank(request.getSystemPrompt())) {
        memory.add(SystemMessage.from(request.getSystemPrompt()));
    }

    // 添加用户消息
    UserMessage userMessage = UserMessage.from(request.getMessage());
    memory.add(userMessage);

    String messageId = IdUtil.fastSimpleUUID();
    StringBuilder fullContent = new StringBuilder();

    // 创建流式处理器，包含完成回调
    var handler = new StreamChatHandler(messageId, responseConsumer, fullContent, () -> {
        // 流式完成后，将AI回复保存到内存（仅 text）
        memory.add(AiMessage.from(fullContent.toString()));
    });

    // 生成流式响应（1.x：chat()）
    streamingModel.chat(memory.messages(), handler);
}
```

### 响应构建

```java
/**
 * 构建同步响应对象（含 thinking 内容）
 * 入参为 langchain4j 1.x 的 dev.langchain4j.model.chat.response.ChatResponse
 */
private AiChatResponse buildResponse(ChatResponse response) {
    AiMessage aiMessage = response.aiMessage();
    // langchain4j 1.x 在 AiMessage.thinking() 上承载推理内容（不带 <think> 标签）
    String thinking = aiMessage != null ? aiMessage.thinking() : null;
    String text = aiMessage != null ? aiMessage.text() : null;

    AiChatResponse chatResponse = AiChatResponse.builder()
        .messageId(IdUtil.fastSimpleUUID())
        .content(text)
        .reasoningContent(StrUtil.isNotBlank(thinking) ? thinking : null)
        .phase(AiChatResponse.Phase.CONTENT)
        .finished(true)
        .build();

    // 设置Token使用情况
    if (response.tokenUsage() != null) {
        TokenUsage tokenUsage = new TokenUsage();
        tokenUsage.setPromptTokens(response.tokenUsage().inputTokenCount());
        tokenUsage.setCompletionTokens(response.tokenUsage().outputTokenCount());
        tokenUsage.setTotalTokens(response.tokenUsage().totalTokenCount());
        chatResponse.setTokenUsage(tokenUsage);
    }

    return chatResponse;
}
```

## 会话记忆管理

### ChatMemoryManager 实现

ChatMemoryManager 负责管理所有会话的记忆，支持内存和 Redis 两种存储方式。

```java
/**
 * 对话内存管理器
 * 负责管理会话的消息历史
 */
@Slf4j
public class ChatMemoryManager {

    private final LangChain4jProperties properties;
    private final RedisChatStore redisChatStore;

    /**
     * 内存缓存 - 用于快速访问
     */
    private final Map<String, ChatMemory> memoryCache = new ConcurrentHashMap<>();

    /**
     * 获取或创建会话内存
     */
    public ChatMemory getOrCreateMemory(String sessionId) {
        if (sessionId == null) {
            sessionId = generateSessionId();
        }
        return memoryCache.computeIfAbsent(sessionId, this::createMemory);
    }

    /**
     * 创建新的会话内存
     */
    private ChatMemory createMemory(String sessionId) {
        int maxMessages = properties.getChat().getHistorySize();

        if ("redis".equalsIgnoreCase(properties.getChat().getMemoryStoreType())) {
            log.debug("Creating Redis-backed chat memory for session: {}", sessionId);
            return MessageWindowChatMemory.builder()
                .id(sessionId)
                .maxMessages(maxMessages)
                .chatMemoryStore(redisChatStore)
                .build();
        } else {
            log.debug("Creating in-memory chat memory for session: {}", sessionId);
            return MessageWindowChatMemory.withMaxMessages(maxMessages);
        }
    }

    /**
     * 获取会话消息历史
     */
    public List<ChatMessage> getMessages(String sessionId) {
        ChatMemory memory = memoryCache.get(sessionId);
        if (memory == null) {
            return List.of();
        }
        return memory.messages();
    }

    /**
     * 清除会话内存
     */
    public void clearMemory(String sessionId) {
        ChatMemory memory = memoryCache.remove(sessionId);
        if (memory != null) {
            memory.clear();
            log.info("Cleared memory for session: {}", sessionId);
        }
    }

    /**
     * 清除所有会话内存
     */
    public void clearAllMemories() {
        memoryCache.values().forEach(ChatMemory::clear);
        memoryCache.clear();
        log.info("Cleared all chat memories");
    }

    /**
     * 生成会话ID
     */
    public String generateSessionId() {
        return IdUtil.fastSimpleUUID();
    }

    /**
     * 获取活跃会话数量
     */
    public int getActiveSessionCount() {
        return memoryCache.size();
    }
}
```

### 存储方式对比

```text
┌─────────────────────────────────────────────────────────────────┐
│                    会话存储方式对比                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────┐    ┌─────────────────────────────┐│
│  │      内存存储 (Memory)   │    │      Redis 存储            ││
│  ├─────────────────────────┤    ├─────────────────────────────┤│
│  │ ✓ 访问速度极快          │    │ ✓ 支持持久化               ││
│  │ ✓ 无需额外依赖          │    │ ✓ 支持分布式部署           ││
│  │ ✓ 简单易用              │    │ ✓ 支持自动过期             ││
│  │ ✗ 重启后数据丢失        │    │ ✓ 可跨实例共享             ││
│  │ ✗ 不支持分布式          │    │ ✗ 需要 Redis 依赖          ││
│  │ ✗ 内存占用增长          │    │ ✗ 网络延迟开销             ││
│  └─────────────────────────┘    └─────────────────────────────┘│
│                                                                 │
│  适用场景:                       适用场景:                      │
│  - 开发测试环境                  - 生产环境                     │
│  - 单机部署                      - 集群部署                     │
│  - 临时会话                      - 需要持久化的会话             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Redis 存储实现

### RedisChatStore 核心实现

```java
/**
 * Redis聊天存储实现
 * 将聊天消息持久化到Redis
 */
@Slf4j
public class RedisChatStore implements ChatMemoryStore {

    private final LangChain4jProperties properties;
    private static final String CHAT_MEMORY_KEY_PREFIX = "langchain4j:chat:";

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        String key = buildKey(memoryId);

        try {
            List<String> jsonMessages = RedisUtils.getCacheList(key);

            if (CollUtil.isEmpty(jsonMessages)) {
                return new ArrayList<>();
            }

            // 刷新过期时间（滑动窗口）
            refreshExpiration(key);

            return jsonMessages.stream()
                    .map(ChatMessageDeserializer::messageFromJson)
                    .toList();

        } catch (Exception e) {
            log.error("获取会话消息失败，会话ID: {}", memoryId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        String key = buildKey(memoryId);

        try {
            List<String> jsonMessages = messages.stream()
                    .map(ChatMessageSerializer::messageToJson)
                    .toList();

            // 使用RedisUtils设置缓存并指定过期时间
            Duration duration = Duration.ofMinutes(properties.getChat().getSessionTimeout());
            RedisUtils.setCacheList(key, jsonMessages, duration);

            log.debug("更新会话消息成功，会话ID: {}，消息数量: {}", memoryId, messages.size());

        } catch (Exception e) {
            log.error("更新会话消息失败，会话ID: {}", memoryId, e);
        }
    }

    @Override
    public void deleteMessages(Object memoryId) {
        String key = buildKey(memoryId);

        try {
            RedisUtils.deleteObject(key);
            log.debug("删除会话消息成功，会话ID: {}", memoryId);
        } catch (Exception e) {
            log.error("删除会话消息失败，会话ID: {}", memoryId, e);
        }
    }

    /**
     * 获取所有会话ID
     */
    public List<String> getAllSessionIds() {
        Collection<String> keys = RedisUtils.keys(CHAT_MEMORY_KEY_PREFIX + "*");
        if (CollUtil.isEmpty(keys)) {
            return List.of();
        }

        return keys.stream()
                .map(key -> key.replace(CHAT_MEMORY_KEY_PREFIX, ""))
                .toList();
    }

    /**
     * 清空所有会话
     */
    public void clearAll() {
        RedisUtils.deleteKeys(CHAT_MEMORY_KEY_PREFIX + "*");
        log.info("已清空Redis中的所有聊天会话");
    }

    private String buildKey(Object memoryId) {
        return CHAT_MEMORY_KEY_PREFIX + memoryId;
    }

    private void refreshExpiration(String key) {
        long timeoutMinutes = properties.getChat().getSessionTimeout();
        RedisUtils.expire(key, Duration.ofMinutes(timeoutMinutes));
    }
}
```

### Redis 数据结构

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Redis 存储结构示例                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Key: langchain4j:chat:session-abc123                           │
│  Type: List                                                     │
│  TTL: 30 分钟（滑动窗口）                                        │
│                                                                 │
│  Value:                                                         │
│  [                                                              │
│    {                                                            │
│      "type": "SYSTEM",                                          │
│      "text": "你是一个专业的技术顾问..."                         │
│    },                                                           │
│    {                                                            │
│      "type": "USER",                                            │
│      "text": "什么是 Spring Boot?"                              │
│    },                                                           │
│    {                                                            │
│      "type": "AI",                                              │
│      "text": "Spring Boot 是一个开源的 Java 框架..."            │
│    },                                                           │
│    {                                                            │
│      "type": "USER",                                            │
│      "text": "它有什么优势?"                                    │
│    },                                                           │
│    {                                                            │
│      "type": "AI",                                              │
│      "text": "Spring Boot 的主要优势包括..."                    │
│    }                                                            │
│  ]                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 流式响应处理

### StreamChatHandler 实现

```java
/**
 * 流式对话响应处理器（langchain4j 1.x StreamingChatResponseHandler）
 * 支持 thinking / content 两阶段流式输出
 */
@Slf4j
public class StreamChatHandler implements StreamingChatResponseHandler {

    private final String messageId;
    private final Consumer<AiChatResponse> responseConsumer;
    /** 累积最终回复内容（content 阶段），供多轮对话保存到 memory */
    private final StringBuilder fullContent;
    /** 累积 thinking 内容（完成时回填到 reasoningContent） */
    private final StringBuilder fullThinking = new StringBuilder();
    private final Runnable onComplete;

    public StreamChatHandler(
            String messageId,
            Consumer<AiChatResponse> responseConsumer,
            StringBuilder fullContent) {
        this(messageId, responseConsumer, fullContent, null);
    }

    public StreamChatHandler(
            String messageId,
            Consumer<AiChatResponse> responseConsumer,
            StringBuilder fullContent,
            Runnable onComplete) {
        this.messageId = messageId;
        this.responseConsumer = responseConsumer;
        this.fullContent = fullContent;
        this.onComplete = onComplete;
    }

    /**
     * 推理 / 思考阶段增量（仅推理模型 + enableThinking=true 时触发）
     */
    @Override
    public void onPartialThinking(PartialThinking partialThinking) {
        if (partialThinking == null) {
            return;
        }
        String text = partialThinking.text();
        if (text == null || text.isEmpty()) {
            return;
        }
        fullThinking.append(text);

        AiChatResponse response = AiChatResponse.builder()
                .messageId(messageId)
                .reasoningContent(text)
                .phase(AiChatResponse.Phase.THINKING)
                .finished(false)
                .build();

        responseConsumer.accept(response);
    }

    /**
     * 最终回复增量
     */
    @Override
    public void onPartialResponse(String partialResponse) {
        if (partialResponse == null || partialResponse.isEmpty()) {
            return;
        }
        fullContent.append(partialResponse);

        AiChatResponse response = AiChatResponse.builder()
                .messageId(messageId)
                .content(partialResponse)
                .phase(AiChatResponse.Phase.CONTENT)
                .finished(false)
                .build();

        responseConsumer.accept(response);
    }

    /**
     * 流式完成：返回 TokenUsage 和完整 thinking
     */
    @Override
    public void onCompleteResponse(ChatResponse completeResponse) {
        AiChatResponse finalResponse = AiChatResponse.builder()
                .messageId(messageId)
                .content("")
                .reasoningContent(fullThinking.length() > 0 ? fullThinking.toString() : null)
                .phase(AiChatResponse.Phase.CONTENT)
                .finished(true)
                .build();

        // 设置Token使用情况
        if (completeResponse != null && completeResponse.tokenUsage() != null) {
            TokenUsage tokenUsage = new TokenUsage();
            tokenUsage.setPromptTokens(completeResponse.tokenUsage().inputTokenCount());
            tokenUsage.setCompletionTokens(completeResponse.tokenUsage().outputTokenCount());
            tokenUsage.setTotalTokens(completeResponse.tokenUsage().totalTokenCount());
            finalResponse.setTokenUsage(tokenUsage);
        }

        responseConsumer.accept(finalResponse);

        // 执行完成回调（如保存到会话记忆）
        if (onComplete != null) {
            onComplete.run();
        }
    }

    @Override
    public void onError(Throwable error) {
        log.error("流式错误: messageId={}, error={}", messageId, error.getMessage(), error);

        AiChatResponse errorResponse = AiChatResponse.builder()
                .messageId(messageId)
                .error(error.getMessage())
                .finished(true)
                .build();

        responseConsumer.accept(errorResponse);
    }
}
```

## 数据传输对象

### ChatRequest 完整定义

```java
/**
 * 聊天请求DTO
 */
@Data
@Accessors(chain = true)
public class ChatRequest implements Serializable {

    /**
     * 会话ID - 用于标识对话会话
     */
    private String sessionId;

    /**
     * 用户消息 - 必填
     */
    private String message;

    /**
     * 对话模式 - 默认 CONTINUOUS
     */
    private ChatMode mode = ChatMode.CONTINUOUS;

    /**
     * 模型提供商 - 如 deepseek, openai
     */
    private String provider;

    /**
     * 模型名称 - 如 deepseek-chat
     */
    private String modelName;

    /**
     * 是否流式返回 - 默认 true
     */
    private Boolean stream = true;

    /**
     * 系统提示词 - 设置 AI 角色和行为
     */
    private String systemPrompt;

    /**
     * 温度参数 - 控制输出随机性 (0.0-2.0)
     */
    private Double temperature;

    /**
     * 最大Token数 - 限制输出长度
     */
    private Integer maxTokens;

    /**
     * 知识库ID列表 - RAG模式使用
     */
    private List<Long> knowledgeBaseIds;

    /**
     * 额外参数 - 传递给模型的其他参数
     */
    private Map<String, Object> extraParams;
}
```

### AiChatResponse 完整定义

::: tip 命名说明
项目响应 DTO 在 1.x 升级时由 `ChatResponse` 重命名为 `AiChatResponse`，以避免与 langchain4j 1.x 的模型层 `dev.langchain4j.model.chat.response.ChatResponse` 同名冲突——否则所有用到模型层 `ChatResponse` 的地方都得写全限定类名，违反项目导入规范。
:::

```java
/**
 * AI 聊天响应 DTO
 */
@Builder
@Data
@Accessors(chain = true)
public class AiChatResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 会话ID
     */
    private String sessionId;

    /**
     * 消息ID - 唯一标识本次响应
     */
    private String messageId;

    /**
     * AI回复正文
     * 流式模式下为 content 阶段增量，同步模式下为完整内容
     */
    private String content;

    /**
     * 深度思考内容（reasoning / chain-of-thought）
     * 完成态为累积全文，流式为单次增量；仅模型支持 thinking 且 returnThinking=true 时返回
     */
    private String reasoningContent;

    /**
     * 当前流式增量所属阶段：thinking（思考增量）/ content（正文增量）/ null（非流式或完成消息）
     */
    private String phase;

    /**
     * 是否完成
     * 流式模式下用于判断是否结束
     */
    @Builder.Default
    private Boolean finished = true;

    /**
     * Token使用情况
     * 仅在响应完成时提供
     */
    private TokenUsage tokenUsage;

    /**
     * 响应时间(毫秒)
     * 同步模式下为总耗时
     */
    private Long responseTime;

    /**
     * 引用的文档 - RAG模式
     */
    private List<DocumentReference> references;

    /**
     * 错误信息
     * 出错时包含错误详情
     */
    private String error;

    /**
     * 流式增量阶段枚举值
     */
    public static final class Phase {
        public static final String THINKING = "thinking";
        public static final String CONTENT = "content";

        private Phase() {
        }
    }
}
```

### TokenUsage 定义

```java
/**
 * Token使用情况
 */
@Data
public class TokenUsage implements Serializable {

    /**
     * 输入 Token 数（提示词部分）
     */
    private Integer promptTokens;

    /**
     * 输出 Token 数（生成内容部分）
     */
    private Integer completionTokens;

    /**
     * 总 Token 数
     */
    private Integer totalTokens;
}
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
| `stream` | Boolean | `true` | 是否流式 |
| `knowledgeBaseIds` | `List<Long>` | 无 | 知识库ID列表 |
| `extraParams` | `Map<String, Object>` | 无 | 额外参数 |

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

        AiChatResponse response = chatService.chat(request);
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

### SSE 流式接口

```java
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(60000L);  // 60秒超时

        CompletableFuture.runAsync(() -> {
            try {
                chatService.streamChat(request, response -> {
                    try {
                        emitter.send(SseEmitter.event()
                            .data(response)
                            .name("message"));

                        if (response.getFinished()) {
                            emitter.complete();
                        }
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                });
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
```

### WebSocket 流式接口

```java
@ServerEndpoint("/ws/chat")
@Component
@RequiredArgsConstructor
public class ChatWebSocket {

    private static ChatService chatService;

    @Autowired
    public void setChatService(ChatService service) {
        chatService = service;
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        ChatRequest request = JSON.parseObject(message, ChatRequest.class);

        chatService.streamChat(request, response -> {
            try {
                session.getBasicRemote().sendText(JSON.toJSONString(response));
            } catch (IOException e) {
                log.error("WebSocket发送失败", e);
            }
        });
    }
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

### 不同场景配置示例

```yaml
# 开发环境 - 使用内存存储
langchain4j:
  chat:
    memory-store-type: memory
    history-size: 20
    session-timeout: 60

# 生产环境 - 使用 Redis 存储
langchain4j:
  chat:
    memory-store-type: redis
    history-size: 10
    session-timeout: 30

# 高并发场景 - 减少历史消息
langchain4j:
  chat:
    memory-store-type: redis
    history-size: 5
    session-timeout: 15
```

## 最佳实践

### 1. 合理设置历史消息数量

```yaml
chat:
  history-size: 10  # 简单对话
  # history-size: 20  # 复杂对话
```

**说明:**
- 历史消息过多会增加 Token 消耗
- 建议根据对话复杂度设置 5-20 条
- 复杂技术讨论可适当增加

### 2. 使用流式提升体验

```java
// 长文本生成 - 使用流式
.setStream(true)

// 简短问答 - 使用同步
.setStream(false)
```

**适用场景:**
- 流式：长文本生成、代码编写、文章创作
- 同步：简短问答、分类、审核

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
    chatMemoryManager.removeExpiredSessions();
    log.info("已清理过期会话");
}
```

### 6. 设计合理的系统提示词

```java
// ✅ 好的系统提示词
String goodPrompt = """
    你是一个专业的技术顾问。

    请遵循以下规则：
    1. 使用简洁专业的语言
    2. 提供代码示例时使用正确的格式
    3. 如果不确定，请诚实说明

    专业领域：Java、Spring Boot、微服务
    """;

// ❌ 差的系统提示词
String badPrompt = "你是助手";  // 太简单
```

### 7. 合理使用会话 ID

```java
// ✅ 好的会话ID设计
String sessionId = "user:" + userId + ":chat:" + chatType;

// 或使用业务维度
String sessionId = "order:" + orderId + ":support";

// ❌ 差的会话ID
String sessionId = UUID.randomUUID().toString();  // 无法追踪
```

### 8. Token 使用监控

```java
@Aspect
@Component
@Slf4j
public class ChatTokenMonitor {

    @AfterReturning(pointcut = "execution(* plus.ruoyi..*ChatService.chat(..))",
                    returning = "response")
    public void monitorTokenUsage(AiChatResponse response) {
        if (response.getTokenUsage() != null) {
            TokenUsage usage = response.getTokenUsage();
            log.info("Token使用 - 输入:{}, 输出:{}, 总计:{}",
                usage.getPromptTokens(),
                usage.getCompletionTokens(),
                usage.getTotalTokens());

            // 可以记录到监控系统
            if (usage.getTotalTokens() > 4000) {
                log.warn("Token使用量较高，请检查对话历史长度");
            }
        }
    }
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
        // 此时可以获取 TokenUsage
        log.info("Token使用: {}", response.getTokenUsage());
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

**或添加降级逻辑：**

```java
@Component
public class ChatMemoryFallback {

    public ChatMemory createMemoryWithFallback(String sessionId) {
        try {
            // 尝试使用 Redis
            return createRedisMemory(sessionId);
        } catch (Exception e) {
            log.warn("Redis不可用，降级到内存存储");
            return createInMemoryStorage(sessionId);
        }
    }
}
```

### 5. 对话上下文过长导致错误

**问题原因:**
- 历史消息过多，超出模型上下文窗口
- Token 数量超过限制

**解决方案:**

```yaml
# 减少历史消息数量
chat:
  history-size: 5
```

```java
// 或手动清理历史
if (chatService.getSessionMessages(sessionId).size() > 20) {
    chatService.clearSession(sessionId);
}
```

### 6. 流式响应卡顿或延迟

**问题原因:**
- 网络延迟
- 模型响应慢
- 客户端处理阻塞

**解决方案:**

```java
// 使用异步处理
CompletableFuture.runAsync(() -> {
    chatService.streamChat(request, response -> {
        // 异步处理响应
        messageQueue.offer(response);
    });
});
```

### 7. 会话 ID 冲突

**问题原因:**
- 不同用户使用相同会话 ID
- 会话 ID 生成规则不当

**解决方案:**

```java
// 使用复合会话 ID
String sessionId = String.format("tenant:%s:user:%s:chat:%s",
    tenantId, userId, chatType);
```

### 8. Token 统计不准确

**问题原因:**
- 某些模型不返回 Token 统计
- 流式模式下仅最后一条消息包含统计

**解决方案:**

```java
// 确保在 finished=true 时获取统计
chatService.streamChat(request, response -> {
    if (response.getFinished() && response.getTokenUsage() != null) {
        // 记录 Token 使用
        recordTokenUsage(response.getTokenUsage());
    }
});
```

## 总结

ChatService 提供了强大而灵活的 AI 对话能力，支持多种对话模式和丰富的配置选项。通过合理使用系统提示词、温度参数、会话管理等功能，你可以构建出满足各种业务需求的智能对话应用。

**核心要点:**

1. **选择合适的对话模式** - 根据业务场景选择 SINGLE、CONTINUOUS、RAG 或 FUNCTION 模式
2. **合理配置会话存储** - 开发环境用内存，生产环境用 Redis
3. **优化 Token 使用** - 控制历史消息数量和输出长度
4. **利用流式响应** - 提升长文本生成的用户体验
5. **监控和日志** - 记录 Token 使用和响应时间，便于优化和排查问题
