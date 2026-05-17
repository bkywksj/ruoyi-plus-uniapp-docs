# LangChain4j AI 集成模块

企业级 LLM 应用开发框架 - 提供统一的大模型接入能力

## 模块简介

`ruoyi-common-langchain4j` 模块集成了 [LangChain4j](https://github.com/langchain4j/langchain4j) 框架，提供企业级大语言模型应用开发能力。该模块实现了统一的模型抽象层，支持多种主流大模型提供商，并提供完整的对话管理、流式响应、会话记忆和检索增强生成（RAG）能力。

### 核心特性

- **多模型支持**: 统一接口支持 DeepSeek、通义千问、Claude、OpenAI、Ollama 等主流大模型
- **流式聊天**: 支持流式响应，实时返回AI回答，提升用户体验
- **WebSocket集成**: 通过 WebSocket 实现实时 AI 聊天，支持长连接通信
- **对话记忆**: 基于 Redis 的会话记忆管理，支持上下文连贯对话
- **多种对话模式**: 支持单轮对话、连续对话、RAG检索增强、函数调用四种模式
- **Token统计**: 实时统计 Token 使用情况，便于成本控制
- **环境变量配置**: 支持通过环境变量配置 API 密钥，避免敏感信息硬编码
- **功能开关**: 提供 `langchain4j.enabled` 开关，可动态启用/禁用

### 模块依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-langchain4j</artifactId>
</dependency>
```

### 技术栈版本

| 技术 | 版本 | 说明 |
|------|------|------|
| LangChain4j | 0.35.0 | LLM应用开发框架 |
| Spring Boot | 3.5.12 | 自动配置支持 |
| Redisson | 3.52.0 | Redis客户端 |

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        应用层 (Application Layer)                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   REST API  │  │  WebSocket  │  │    SSE     │  │   Service   │ │
│  │  Controller │  │  Processor  │  │  Endpoint  │  │   调用      │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │        │
│         └────────────────┴────────────────┴────────────────┘        │
│                                  │                                   │
├──────────────────────────────────┼───────────────────────────────────┤
│                        核心服务层 (Core Service Layer)               │
│                                  │                                   │
│  ┌───────────────────────────────▼───────────────────────────────┐  │
│  │                        ChatService                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │ SINGLE Mode │  │CONTINUOUS   │  │  RAG Mode   │            │  │
│  │  │ (单轮对话)  │  │  Mode       │  │ (检索增强)  │            │  │
│  │  └─────────────┘  │ (连续对话)  │  └─────────────┘            │  │
│  │  ┌─────────────┐  └─────────────┘                             │  │
│  │  │FUNCTION Mode│                                              │  │
│  │  │ (函数调用)  │                                              │  │
│  │  └─────────────┘                                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                  │                                   │
├──────────────────────────────────┼───────────────────────────────────┤
│                        基础设施层 (Infrastructure Layer)             │
│         ┌────────────────────────┼────────────────────────┐         │
│         │                        │                        │         │
│  ┌──────▼──────┐  ┌──────────────▼──────────────┐  ┌──────▼──────┐  │
│  │ ModelFactory│  │    ChatMemoryManager        │  │StreamHandler│  │
│  │  (模型工厂) │  │      (记忆管理器)           │  │ (流式处理)  │  │
│  └──────┬──────┘  └──────────────┬──────────────┘  └─────────────┘  │
│         │                        │                                   │
│  ┌──────▼──────────────────┐  ┌──▼───────────────┐                  │
│  │    ModelProvider        │  │  RedisChatStore  │                  │
│  │  ┌────────┐ ┌────────┐  │  │  (Redis存储)     │                  │
│  │  │DeepSeek│ │QianWen │  │  └──────────────────┘                  │
│  │  └────────┘ └────────┘  │                                        │
│  │  ┌────────┐ ┌────────┐  │                                        │
│  │  │ Claude │ │ OpenAI │  │                                        │
│  │  └────────┘ └────────┘  │                                        │
│  │  ┌────────┐             │                                        │
│  │  │ Ollama │             │                                        │
│  │  └────────┘             │                                        │
│  └─────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 类名 | 职责 |
|------|------|------|
| 聊天服务 | `ChatService` | 核心对话服务，处理四种对话模式 |
| 模型工厂 | `ModelFactory` | 创建和管理不同提供商的模型实例 |
| 模型提供商 | `ModelProvider` | 定义支持的模型提供商枚举 |
| 记忆管理器 | `ChatMemoryManager` | 管理会话记忆，支持内存和Redis存储 |
| Redis存储 | `RedisChatStore` | 实现ChatMemoryStore接口的Redis存储 |
| 流式处理器 | `StreamChatHandler` | 处理流式响应的回调处理器 |
| WebSocket处理器 | `AiChatMessageProcessor` | 处理WebSocket AI聊天消息 |

### 对话模式

系统支持四种对话模式，通过 `ChatMode` 枚举定义：

```java
public enum ChatMode {
    /**
     * 单轮对话模式
     * 不保留历史记录，每次对话独立
     */
    SINGLE,

    /**
     * 连续对话模式
     * 保留会话历史，支持上下文连贯对话
     */
    CONTINUOUS,

    /**
     * RAG模式
     * 检索增强生成，结合知识库回答问题
     */
    RAG,

    /**
     * 函数调用模式
     * 支持调用外部函数/工具
     */
    FUNCTION
}
```

## 快速开始

### 1. 添加依赖

在需要使用 AI 功能的模块 `pom.xml` 中添加：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-langchain4j</artifactId>
</dependency>
```

### 2. 配置文件

在 `application-dev.yml` 中配置：

```yaml
langchain4j:
  enabled: true  # 启用 LangChain4j
  default-provider: deepseek  # 默认模型提供商
  default-model: deepseek-chat  # 默认模型名称
  timeout: 60s  # 请求超时时间
  max-retries: 3  # 最大重试次数

  # DeepSeek 配置 (推荐)
  deepseek:
    enabled: true
    api-key: ${DEEPSEEK_API_KEY:your-api-key}  # 支持环境变量
    base-url: https://api.deepseek.com
    model-name: deepseek-chat
    temperature: 0.7
    max-tokens: 2048

  # OpenAI 配置
  openai:
    enabled: false
    api-key: ${OPENAI_API_KEY:your-api-key}
    base-url: https://api.openai.com/v1
    model-name: gpt-4-turbo
    temperature: 0.7
    max-tokens: 2048

  # 通义千问配置
  qianwen:
    enabled: false
    api-key: ${QIANWEN_API_KEY:your-api-key}
    base-url: https://dashscope.aliyuncs.com/api/v1
    model-name: qwen-turbo
    temperature: 0.7
    max-tokens: 2048

  # Claude 配置
  claude:
    enabled: false
    api-key: ${CLAUDE_API_KEY:your-api-key}
    base-url: https://api.anthropic.com
    model-name: claude-3-5-sonnet-20241022
    temperature: 0.7
    max-tokens: 2048

  # Ollama 本地模型配置
  ollama:
    enabled: false
    base-url: http://localhost:11434
    model-name: llama3:latest

  # 对话配置
  chat:
    stream-enabled: true  # 启用流式响应
    history-size: 10  # 历史消息保留数量
    session-timeout: 30  # 会话超时时间(分钟)
    memory-enabled: true  # 启用内存管理
    memory-store-type: redis  # 内存存储类型: memory, redis

  # RAG 配置
  rag:
    enabled: false  # 是否启用 RAG
    max-results: 5  # 检索结果数量
    min-score: 0.7  # 最小相似度分数
    chunk-size: 500  # 文档分块大小
    chunk-overlap: 50  # 分块重叠大小
    vector-store-type: memory  # 向量存储类型: memory, milvus
```

::: tip 环境变量配置
推荐使用环境变量配置 API 密钥，避免敏感信息硬编码：
```bash
export DEEPSEEK_API_KEY=your-actual-api-key
export OPENAI_API_KEY=your-actual-api-key
```
:::

### 3. 基础对话

```java
import plus.ruoyi.common.langchain4j.core.chat.ChatService;
import plus.ruoyi.common.langchain4j.domain.dto.ChatRequest;
import plus.ruoyi.common.langchain4j.domain.dto.ChatResponse;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final ChatService chatService;

    /**
     * 简单对话
     */
    public String chat(String message) {
        ChatRequest request = new ChatRequest();
        request.setMessage(message);
        request.setSessionId("user-" + System.currentTimeMillis());

        ChatResponse response = chatService.chat(request);
        return response.getContent();
    }

    /**
     * 带上下文的对话 (使用会话ID)
     */
    public String chatWithContext(String sessionId, String message) {
        ChatRequest request = new ChatRequest();
        request.setMessage(message);
        request.setSessionId(sessionId);  // 相同sessionId会保留上下文

        ChatResponse response = chatService.chat(request);
        return response.getContent();
    }
}
```

### 4. 流式对话

```java
import plus.ruoyi.common.langchain4j.core.chat.ChatService;
import plus.ruoyi.common.langchain4j.domain.dto.ChatRequest;
import plus.ruoyi.common.langchain4j.domain.dto.ChatResponse;

@Service
@RequiredArgsConstructor
public class AiStreamService {

    private final ChatService chatService;

    /**
     * 流式对话
     */
    public void chatStream(String message, Consumer<ChatResponse> responseConsumer) {
        ChatRequest request = new ChatRequest();
        request.setMessage(message);
        request.setSessionId("stream-" + System.currentTimeMillis());
        request.setStream(true);

        chatService.streamChat(request, responseConsumer);
    }
}
```

### 5. WebSocket 实时聊天

前端通过 WebSocket 连接实现实时 AI 聊天：

```javascript
// 前端 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080/ws');

// 发送消息
ws.send(JSON.stringify({
  type: 'ai_chat',
  content: '你好，请介绍一下自己'
}));

// 接收 AI 响应
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('AI:', data.content);
};
```

后端 WebSocket 处理器已自动配置，无需额外编码。

## 模型提供商

### 提供商概览

系统通过 `ModelProvider` 枚举定义支持的模型提供商：

```java
public enum ModelProvider {
    /**
     * DeepSeek - 国产大模型
     * 使用 OpenAI 兼容 API
     */
    DEEPSEEK("deepseek", "DeepSeek", "https://api.deepseek.com"),

    /**
     * 通义千问 - 阿里云大模型
     * 使用 DashScope API
     */
    QIANWEN("qianwen", "通义千问", "https://dashscope.aliyuncs.com/api/v1"),

    /**
     * Claude - Anthropic 大模型
     * 使用 Anthropic API
     */
    CLAUDE("claude", "Claude", "https://api.anthropic.com"),

    /**
     * OpenAI - GPT 系列模型
     * 使用 OpenAI API
     */
    OPENAI("openai", "OpenAI", "https://api.openai.com/v1"),

    /**
     * Ollama - 本地部署模型
     * 支持各种开源模型
     */
    OLLAMA("ollama", "Ollama", "http://localhost:11434");

    private final String code;
    private final String name;
    private final String defaultBaseUrl;
}
```

### DeepSeek 配置

DeepSeek 使用 OpenAI 兼容 API，配置简单：

```yaml
langchain4j:
  deepseek:
    enabled: true
    api-key: ${DEEPSEEK_API_KEY}
    base-url: https://api.deepseek.com
    model-name: deepseek-chat  # 或 deepseek-coder
    temperature: 0.7
    max-tokens: 2048
```

**支持的模型**：
- `deepseek-chat` - 通用对话模型
- `deepseek-coder` - 代码生成模型

**模型创建实现**：

```java
private ChatLanguageModel createDeepSeekChatModel(String modelName) {
    ModelConfig config = properties.getDeepseek();
    String actualModelName = StringUtils.hasText(modelName)
        ? modelName : config.getModelName();

    return OpenAiChatModel.builder()
        .baseUrl(config.getBaseUrl())
        .apiKey(config.getApiKey())
        .modelName(actualModelName)
        .temperature(config.getTemperature())
        .maxTokens(config.getMaxTokens())
        .timeout(properties.getTimeout())
        .maxRetries(properties.getMaxRetries())
        .build();
}
```

### 通义千问配置

通义千问使用阿里云 DashScope API：

```yaml
langchain4j:
  qianwen:
    enabled: true
    api-key: ${QIANWEN_API_KEY}
    base-url: https://dashscope.aliyuncs.com/api/v1
    model-name: qwen-turbo  # 或 qwen-plus, qwen-max
    temperature: 0.7
    max-tokens: 2048
```

**支持的模型**：
- `qwen-turbo` - 快速响应模型
- `qwen-plus` - 增强版模型
- `qwen-max` - 最强能力模型

**模型创建实现**：

```java
private ChatLanguageModel createQianWenChatModel(String modelName) {
    ModelConfig config = properties.getQianwen();
    String actualModelName = StringUtils.hasText(modelName)
        ? modelName : config.getModelName();

    return QwenChatModel.builder()
        .baseUrl(config.getBaseUrl())
        .apiKey(config.getApiKey())
        .modelName(actualModelName)
        .temperature(config.getTemperature().floatValue())
        .maxTokens(config.getMaxTokens())
        .build();
}
```

### Claude 配置

Claude 使用 Anthropic 官方 API：

```yaml
langchain4j:
  claude:
    enabled: true
    api-key: ${CLAUDE_API_KEY}
    base-url: https://api.anthropic.com
    model-name: claude-3-5-sonnet-20241022
    temperature: 0.7
    max-tokens: 2048
```

**支持的模型**：
- `claude-3-5-sonnet-20241022` - 平衡性能与速度
- `claude-3-opus-20240229` - 最强能力
- `claude-3-haiku-20240307` - 快速响应

**模型创建实现**：

```java
private ChatLanguageModel createClaudeChatModel(String modelName) {
    ModelConfig config = properties.getClaude();
    String actualModelName = StringUtils.hasText(modelName)
        ? modelName : config.getModelName();

    return AnthropicChatModel.builder()
        .baseUrl(config.getBaseUrl())
        .apiKey(config.getApiKey())
        .modelName(actualModelName)
        .temperature(config.getTemperature())
        .maxTokens(config.getMaxTokens())
        .timeout(properties.getTimeout())
        .maxRetries(properties.getMaxRetries())
        .build();
}
```

### OpenAI 配置

OpenAI 使用官方 API：

```yaml
langchain4j:
  openai:
    enabled: true
    api-key: ${OPENAI_API_KEY}
    base-url: https://api.openai.com/v1
    model-name: gpt-4-turbo
    temperature: 0.7
    max-tokens: 2048
```

**支持的模型**：
- `gpt-4-turbo` - GPT-4 Turbo
- `gpt-4` - GPT-4
- `gpt-3.5-turbo` - GPT-3.5 Turbo

### Ollama 配置

Ollama 用于本地部署开源模型：

```yaml
langchain4j:
  ollama:
    enabled: true
    base-url: http://localhost:11434
    model-name: llama3:latest
```

**支持的模型**：
- `llama3:latest` - Meta Llama 3
- `mistral:latest` - Mistral
- `codellama:latest` - Code Llama
- 任何 Ollama 支持的模型

**模型创建实现**：

```java
private ChatLanguageModel createOllamaChatModel(String modelName) {
    ModelConfig config = properties.getOllama();
    String actualModelName = StringUtils.hasText(modelName)
        ? modelName : config.getModelName();

    return OllamaChatModel.builder()
        .baseUrl(config.getBaseUrl())
        .modelName(actualModelName)
        .temperature(config.getTemperature())
        .timeout(properties.getTimeout())
        .build();
}
```

### 动态切换模型

运行时可以动态切换不同的模型提供商：

```java
// 使用 DeepSeek
ChatRequest request1 = new ChatRequest();
request1.setMessage("介绍一下量子计算");
request1.setProvider("deepseek");
ChatResponse response1 = chatService.chat(request1);

// 切换到 OpenAI
ChatRequest request2 = new ChatRequest();
request2.setMessage("同样的问题");
request2.setProvider("openai");
request2.setModelName("gpt-4-turbo");
ChatResponse response2 = chatService.chat(request2);

// 使用 Claude
ChatRequest request3 = new ChatRequest();
request3.setMessage("请用更简洁的方式解释");
request3.setProvider("claude");
request3.setModelName("claude-3-5-sonnet-20241022");
ChatResponse response3 = chatService.chat(request3);
```

## ChatService 核心服务

### 服务架构

`ChatService` 是模块的核心服务，负责处理所有对话请求：

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ModelFactory modelFactory;
    private final ChatMemoryManager chatMemoryManager;
    private final LangChain4jProperties properties;

    /**
     * 同步对话
     */
    public ChatResponse chat(ChatRequest request) {
        // 获取或创建模型
        ChatLanguageModel chatModel = getOrCreateModel(request);
        String sessionId = getSessionId(request);

        // 根据模式处理对话
        ChatResponse response = switch (request.getMode()) {
            case SINGLE -> handleSingleChat(chatModel, request);
            case CONTINUOUS -> handleContinuousChat(chatModel, request, sessionId);
            case RAG -> handleRagChat(chatModel, request, sessionId);
            case FUNCTION -> handleFunctionChat(chatModel, request, sessionId);
        };

        return response;
    }

    /**
     * 流式对话
     */
    public void streamChat(ChatRequest request, Consumer<ChatResponse> responseConsumer) {
        StreamingChatLanguageModel streamingModel = getOrCreateStreamingModel(request);
        String sessionId = getSessionId(request);
        String messageId = generateMessageId();

        // 构建消息列表
        List<ChatMessage> messages = buildMessages(request, sessionId);

        // 创建流式处理器
        StreamChatHandler handler = new StreamChatHandler(
            messageId, sessionId, responseConsumer
        );

        // 发起流式请求
        streamingModel.generate(messages, handler);
    }
}
```

### 单轮对话模式

单轮对话不保留历史记录，每次对话独立：

```java
private ChatResponse handleSingleChat(ChatLanguageModel chatModel, ChatRequest request) {
    long startTime = System.currentTimeMillis();

    // 构建消息
    List<ChatMessage> messages = new ArrayList<>();

    // 添加系统提示词
    if (StringUtils.hasText(request.getSystemPrompt())) {
        messages.add(SystemMessage.from(request.getSystemPrompt()));
    }

    // 添加用户消息
    messages.add(UserMessage.from(request.getMessage()));

    // 调用模型
    Response<AiMessage> response = chatModel.generate(messages);

    long responseTime = System.currentTimeMillis() - startTime;

    return ChatResponse.builder()
        .sessionId(request.getSessionId())
        .messageId(generateMessageId())
        .content(response.content().text())
        .tokenUsage(convertTokenUsage(response.tokenUsage()))
        .responseTime(responseTime)
        .finished(true)
        .build();
}
```

**使用场景**：
- 一次性问答
- 不需要上下文的独立查询
- 代码生成
- 翻译任务

### 连续对话模式

连续对话模式保留会话历史，支持上下文连贯对话：

```java
private ChatResponse handleContinuousChat(
    ChatLanguageModel chatModel,
    ChatRequest request,
    String sessionId
) {
    long startTime = System.currentTimeMillis();

    // 获取会话记忆
    ChatMemory memory = chatMemoryManager.getOrCreateMemory(sessionId);

    // 添加系统提示词（如果有）
    if (StringUtils.hasText(request.getSystemPrompt())) {
        memory.add(SystemMessage.from(request.getSystemPrompt()));
    }

    // 添加用户消息到记忆
    UserMessage userMessage = UserMessage.from(request.getMessage());
    memory.add(userMessage);

    // 获取历史消息
    List<ChatMessage> messages = memory.messages();

    // 调用模型
    Response<AiMessage> response = chatModel.generate(messages);

    // 将AI回复添加到记忆
    memory.add(response.content());

    long responseTime = System.currentTimeMillis() - startTime;

    return ChatResponse.builder()
        .sessionId(sessionId)
        .messageId(generateMessageId())
        .content(response.content().text())
        .tokenUsage(convertTokenUsage(response.tokenUsage()))
        .responseTime(responseTime)
        .finished(true)
        .build();
}
```

**使用场景**：
- 多轮对话
- 需要上下文理解的任务
- 客服对话
- 教学辅导

### RAG 检索增强模式

RAG 模式结合知识库进行回答：

```java
private ChatResponse handleRagChat(
    ChatLanguageModel chatModel,
    ChatRequest request,
    String sessionId
) {
    long startTime = System.currentTimeMillis();

    // 检索相关文档
    List<TextSegment> relevantDocuments = retrieveDocuments(
        request.getMessage(),
        request.getKnowledgeBaseIds()
    );

    // 构建增强提示词
    String augmentedPrompt = buildRagPrompt(request.getMessage(), relevantDocuments);

    // 获取会话记忆
    ChatMemory memory = chatMemoryManager.getOrCreateMemory(sessionId);

    // 添加增强后的用户消息
    memory.add(UserMessage.from(augmentedPrompt));

    // 调用模型
    Response<AiMessage> response = chatModel.generate(memory.messages());

    // 添加AI回复到记忆
    memory.add(response.content());

    long responseTime = System.currentTimeMillis() - startTime;

    // 构建引用信息
    List<Reference> references = buildReferences(relevantDocuments);

    return ChatResponse.builder()
        .sessionId(sessionId)
        .messageId(generateMessageId())
        .content(response.content().text())
        .tokenUsage(convertTokenUsage(response.tokenUsage()))
        .responseTime(responseTime)
        .references(references)
        .finished(true)
        .build();
}

private String buildRagPrompt(String question, List<TextSegment> documents) {
    StringBuilder context = new StringBuilder();
    for (TextSegment doc : documents) {
        context.append(doc.text()).append("\n\n");
    }

    return String.format("""
        请根据以下参考资料回答问题。如果参考资料中没有相关信息，请明确说明。

        参考资料：
        %s

        问题：%s
        """, context, question);
}
```

**使用场景**：
- 企业知识库问答
- 文档检索问答
- 技术支持
- FAQ系统

### 函数调用模式

函数调用模式支持调用外部工具：

```java
private ChatResponse handleFunctionChat(
    ChatLanguageModel chatModel,
    ChatRequest request,
    String sessionId
) {
    long startTime = System.currentTimeMillis();

    // 获取会话记忆
    ChatMemory memory = chatMemoryManager.getOrCreateMemory(sessionId);

    // 添加用户消息
    memory.add(UserMessage.from(request.getMessage()));

    // 定义可用工具
    List<ToolSpecification> tools = getAvailableTools();

    // 调用模型（带工具）
    Response<AiMessage> response = chatModel.generate(memory.messages(), tools);

    // 处理工具调用
    if (response.content().hasToolExecutionRequests()) {
        for (ToolExecutionRequest toolRequest : response.content().toolExecutionRequests()) {
            String result = executeToolCall(toolRequest);
            memory.add(ToolExecutionResultMessage.from(toolRequest, result));
        }

        // 再次调用模型获取最终回复
        response = chatModel.generate(memory.messages());
    }

    // 添加AI回复到记忆
    memory.add(response.content());

    long responseTime = System.currentTimeMillis() - startTime;

    return ChatResponse.builder()
        .sessionId(sessionId)
        .messageId(generateMessageId())
        .content(response.content().text())
        .tokenUsage(convertTokenUsage(response.tokenUsage()))
        .responseTime(responseTime)
        .finished(true)
        .build();
}
```

**使用场景**：
- 调用外部API
- 数据库查询
- 计算任务
- 系统集成

## 会话记忆管理

### ChatMemoryManager

`ChatMemoryManager` 负责管理会话记忆，支持内存和 Redis 两种存储方式：

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatMemoryManager {

    private final LangChain4jProperties properties;
    private final RedisChatStore redisChatStore;

    /**
     * 会话记忆缓存
     * 使用 ConcurrentHashMap 保证线程安全
     */
    private final Map<String, ChatMemory> memoryCache = new ConcurrentHashMap<>();

    /**
     * 获取或创建会话记忆
     */
    public ChatMemory getOrCreateMemory(String sessionId) {
        return memoryCache.computeIfAbsent(sessionId, this::createMemory);
    }

    /**
     * 创建会话记忆
     */
    private ChatMemory createMemory(String sessionId) {
        int maxMessages = properties.getChat().getHistorySize();

        if ("redis".equalsIgnoreCase(properties.getChat().getMemoryStoreType())) {
            // 使用 Redis 存储
            return MessageWindowChatMemory.builder()
                .id(sessionId)
                .maxMessages(maxMessages)
                .chatMemoryStore(redisChatStore)
                .build();
        } else {
            // 使用内存存储
            return MessageWindowChatMemory.withMaxMessages(maxMessages);
        }
    }

    /**
     * 清除会话记忆
     */
    public void clearMemory(String sessionId) {
        ChatMemory memory = memoryCache.remove(sessionId);
        if (memory != null) {
            memory.clear();
        }
        log.info("Cleared chat memory for session: {}", sessionId);
    }

    /**
     * 获取会话历史
     */
    public List<ChatMessage> getHistory(String sessionId) {
        ChatMemory memory = memoryCache.get(sessionId);
        return memory != null ? memory.messages() : Collections.emptyList();
    }

    /**
     * 清理过期会话
     */
    @Scheduled(fixedRate = 300000) // 每5分钟执行
    public void cleanupExpiredSessions() {
        long timeout = properties.getChat().getSessionTimeout() * 60 * 1000;
        long now = System.currentTimeMillis();

        memoryCache.entrySet().removeIf(entry -> {
            // 检查会话是否过期
            // 这里简化处理，实际可以记录最后访问时间
            return false;
        });
    }
}
```

### RedisChatStore

`RedisChatStore` 实现 `ChatMemoryStore` 接口，提供 Redis 持久化存储：

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisChatStore implements ChatMemoryStore {

    private static final String CHAT_MEMORY_KEY_PREFIX = "langchain4j:chat:";

    private final LangChain4jProperties properties;

    /**
     * 获取会话消息
     */
    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        String key = buildKey(memoryId);

        List<String> jsonMessages = RedisUtils.getCacheList(key);
        if (CollectionUtils.isEmpty(jsonMessages)) {
            return new ArrayList<>();
        }

        return jsonMessages.stream()
            .map(ChatMessageSerializer::messageFromJson)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    /**
     * 更新会话消息
     */
    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        String key = buildKey(memoryId);

        // 序列化消息
        List<String> jsonMessages = messages.stream()
            .map(ChatMessageSerializer::messageToJson)
            .collect(Collectors.toList());

        // 计算过期时间
        Duration duration = Duration.ofMinutes(properties.getChat().getSessionTimeout());

        // 存储到 Redis
        RedisUtils.deleteObject(key);
        if (!jsonMessages.isEmpty()) {
            RedisUtils.setCacheList(key, jsonMessages, duration);
        }

        log.debug("Updated chat memory in Redis, key: {}, messages: {}",
            key, messages.size());
    }

    /**
     * 删除会话消息
     */
    @Override
    public void deleteMessages(Object memoryId) {
        String key = buildKey(memoryId);
        RedisUtils.deleteObject(key);
        log.debug("Deleted chat memory from Redis, key: {}", key);
    }

    /**
     * 构建 Redis Key
     */
    private String buildKey(Object memoryId) {
        return CHAT_MEMORY_KEY_PREFIX + memoryId.toString();
    }
}
```

### 消息序列化

```java
public class ChatMessageSerializer {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    /**
     * 消息转JSON
     */
    public static String messageToJson(ChatMessage message) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("type", message.type().name());
            data.put("text", getMessageText(message));

            if (message instanceof SystemMessage) {
                data.put("role", "system");
            } else if (message instanceof UserMessage) {
                data.put("role", "user");
            } else if (message instanceof AiMessage) {
                data.put("role", "assistant");
            }

            return OBJECT_MAPPER.writeValueAsString(data);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize message", e);
        }
    }

    /**
     * JSON转消息
     */
    public static ChatMessage messageFromJson(String json) {
        try {
            Map<String, Object> data = OBJECT_MAPPER.readValue(json, Map.class);
            String type = (String) data.get("type");
            String text = (String) data.get("text");

            return switch (type) {
                case "SYSTEM" -> SystemMessage.from(text);
                case "USER" -> UserMessage.from(text);
                case "AI" -> AiMessage.from(text);
                default -> null;
            };
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize message", e);
        }
    }
}
```

## 流式响应处理

### StreamChatHandler

`StreamChatHandler` 实现 `StreamingResponseHandler` 接口，处理流式响应：

```java
@Slf4j
public class StreamChatHandler implements StreamingResponseHandler<AiMessage> {

    private final String messageId;
    private final String sessionId;
    private final Consumer<ChatResponse> responseConsumer;
    private final StringBuilder fullContent = new StringBuilder();
    private final long startTime = System.currentTimeMillis();

    public StreamChatHandler(
        String messageId,
        String sessionId,
        Consumer<ChatResponse> responseConsumer
    ) {
        this.messageId = messageId;
        this.sessionId = sessionId;
        this.responseConsumer = responseConsumer;
    }

    /**
     * 处理每个Token
     */
    @Override
    public void onNext(String token) {
        fullContent.append(token);

        ChatResponse response = ChatResponse.builder()
            .messageId(messageId)
            .sessionId(sessionId)
            .content(token)
            .finished(false)
            .build();

        responseConsumer.accept(response);
    }

    /**
     * 处理完成
     */
    @Override
    public void onComplete(Response<AiMessage> response) {
        long responseTime = System.currentTimeMillis() - startTime;

        ChatResponse finalResponse = ChatResponse.builder()
            .messageId(messageId)
            .sessionId(sessionId)
            .content(fullContent.toString())
            .tokenUsage(convertTokenUsage(response.tokenUsage()))
            .responseTime(responseTime)
            .finished(true)
            .build();

        responseConsumer.accept(finalResponse);

        log.info("Stream chat completed, messageId: {}, tokens: {}, time: {}ms",
            messageId,
            response.tokenUsage() != null ? response.tokenUsage().totalTokenCount() : 0,
            responseTime);
    }

    /**
     * 处理错误
     */
    @Override
    public void onError(Throwable error) {
        log.error("Stream chat error, messageId: {}", messageId, error);

        ChatResponse errorResponse = ChatResponse.builder()
            .messageId(messageId)
            .sessionId(sessionId)
            .error(error.getMessage())
            .finished(true)
            .build();

        responseConsumer.accept(errorResponse);
    }

    /**
     * 转换Token使用统计
     */
    private TokenUsageInfo convertTokenUsage(TokenUsage tokenUsage) {
        if (tokenUsage == null) {
            return null;
        }

        return TokenUsageInfo.builder()
            .inputTokens(tokenUsage.inputTokenCount())
            .outputTokens(tokenUsage.outputTokenCount())
            .totalTokens(tokenUsage.totalTokenCount())
            .build();
    }
}
```

### SSE 流式端点

```java
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final ChatService chatService;

    /**
     * SSE 流式对话
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<ChatResponse>> streamChat(@RequestBody ChatRequest request) {
        return Flux.create(sink -> {
            request.setStream(true);

            chatService.streamChat(request, response -> {
                sink.next(ServerSentEvent.<ChatResponse>builder()
                    .data(response)
                    .build());

                if (Boolean.TRUE.equals(response.getFinished())) {
                    sink.complete();
                }
            });
        });
    }
}
```

## WebSocket 集成

### AiChatMessageProcessor

`AiChatMessageProcessor` 实现 `MessageProcessor` 接口，处理 WebSocket AI 聊天消息：

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class AiChatMessageProcessor implements MessageProcessor {

    private final ChatService chatService;
    private final LangChain4jProperties properties;

    /**
     * 支持的消息类型
     */
    @Override
    public boolean support(String type) {
        return "ai_chat".equalsIgnoreCase(type);
    }

    /**
     * 处理消息
     */
    @Override
    public void process(WebSocketSession session, WebSocketMessage message) {
        if (!properties.getEnabled()) {
            sendErrorMessage(session, "AI功能未启用");
            return;
        }

        try {
            // 解析请求
            ChatRequest request = parseRequest(message);
            String sessionId = getSessionId(session, request);
            request.setSessionId(sessionId);

            // 判断是否流式
            if (Boolean.TRUE.equals(request.getStream())) {
                handleStreamChat(session, request);
            } else {
                handleSyncChat(session, request);
            }
        } catch (Exception e) {
            log.error("AI chat processing error", e);
            sendErrorMessage(session, "处理失败: " + e.getMessage());
        }
    }

    /**
     * 处理流式对话
     */
    private void handleStreamChat(WebSocketSession session, ChatRequest request) {
        String sessionId = request.getSessionId();
        AtomicBoolean isFirstChunk = new AtomicBoolean(true);

        chatService.streamChat(request, response -> {
            try {
                if (isFirstChunk.getAndSet(false)) {
                    // 发送开始消息
                    sendStartMessage(session, sessionId, response.getMessageId());
                }

                if (Boolean.TRUE.equals(response.getFinished())) {
                    // 发送完成消息
                    sendCompleteMessage(session, sessionId, response);
                } else {
                    // 发送流式内容
                    sendStreamMessage(session, sessionId, response);
                }
            } catch (Exception e) {
                log.error("Failed to send WebSocket message", e);
            }
        });
    }

    /**
     * 处理同步对话
     */
    private void handleSyncChat(WebSocketSession session, ChatRequest request) {
        ChatResponse response = chatService.chat(request);
        sendChatResponse(session, response);
    }

    /**
     * 发送开始消息
     */
    private void sendStartMessage(WebSocketSession session, String sessionId, String messageId) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "ai_chat_start");
        data.put("sessionId", sessionId);
        data.put("messageId", messageId);
        sendMessage(session, data);
    }

    /**
     * 发送流式消息
     */
    private void sendStreamMessage(WebSocketSession session, String sessionId, ChatResponse response) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "ai_chat_stream");
        data.put("sessionId", sessionId);
        data.put("messageId", response.getMessageId());
        data.put("content", response.getContent());
        sendMessage(session, data);
    }

    /**
     * 发送完成消息
     */
    private void sendCompleteMessage(WebSocketSession session, String sessionId, ChatResponse response) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "ai_chat_complete");
        data.put("sessionId", sessionId);
        data.put("messageId", response.getMessageId());
        data.put("content", response.getContent());
        data.put("tokenUsage", response.getTokenUsage());
        data.put("responseTime", response.getResponseTime());
        sendMessage(session, data);
    }

    /**
     * 发送错误消息
     */
    private void sendErrorMessage(WebSocketSession session, String error) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "ai_chat_error");
        data.put("error", error);
        sendMessage(session, data);
    }
}
```

### 前端 WebSocket 集成

```typescript
// WebSocket AI 聊天客户端
class AiChatClient {
  private ws: WebSocket;
  private messageCallback: (response: ChatResponse) => void;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupListeners();
  }

  private setupListeners() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'ai_chat_start':
          console.log('AI开始响应', data.messageId);
          break;
        case 'ai_chat_stream':
          this.messageCallback?.({
            content: data.content,
            finished: false
          });
          break;
        case 'ai_chat_complete':
          this.messageCallback?.({
            content: data.content,
            tokenUsage: data.tokenUsage,
            responseTime: data.responseTime,
            finished: true
          });
          break;
        case 'ai_chat_error':
          console.error('AI错误', data.error);
          break;
      }
    };
  }

  chat(message: string, stream: boolean = true): void {
    this.ws.send(JSON.stringify({
      type: 'ai_chat',
      content: message,
      stream
    }));
  }

  onMessage(callback: (response: ChatResponse) => void) {
    this.messageCallback = callback;
  }
}

// 使用示例
const client = new AiChatClient('ws://localhost:8080/ws');

client.onMessage((response) => {
  if (response.finished) {
    console.log('完整回复:', response.content);
    console.log('Token使用:', response.tokenUsage);
  } else {
    process.stdout.write(response.content);
  }
});

client.chat('介绍一下Spring Boot');
```

## API 参考

### ChatRequest

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    /**
     * 会话ID
     * 相同ID的对话会保留上下文
     */
    private String sessionId;

    /**
     * 用户消息内容
     */
    @NotBlank(message = "消息内容不能为空")
    private String message;

    /**
     * 对话模式
     * 默认: CONTINUOUS
     */
    private ChatMode mode = ChatMode.CONTINUOUS;

    /**
     * 模型提供商
     * 可选值: deepseek, qianwen, claude, openai, ollama
     */
    private String provider;

    /**
     * 模型名称
     * 如: deepseek-chat, gpt-4-turbo
     */
    private String modelName;

    /**
     * 是否流式响应
     */
    private Boolean stream = false;

    /**
     * 系统提示词
     */
    private String systemPrompt;

    /**
     * 温度参数 (0.0-2.0)
     * 越高越随机，越低越确定
     */
    private Double temperature;

    /**
     * 最大Token数
     */
    private Integer maxTokens;

    /**
     * 知识库ID列表 (RAG模式)
     */
    private List<String> knowledgeBaseIds;
}
```

### ChatResponse

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    /**
     * 会话ID
     */
    private String sessionId;

    /**
     * 消息ID
     */
    private String messageId;

    /**
     * AI回复内容
     */
    private String content;

    /**
     * 是否完成
     * 流式响应时，最后一条消息为true
     */
    private Boolean finished;

    /**
     * Token使用统计
     */
    private TokenUsageInfo tokenUsage;

    /**
     * 响应时间(毫秒)
     */
    private Long responseTime;

    /**
     * 引用资料 (RAG模式)
     */
    private List<Reference> references;

    /**
     * 错误信息
     */
    private String error;
}
```

### TokenUsageInfo

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenUsageInfo {

    /**
     * 输入Token数
     */
    private Integer inputTokens;

    /**
     * 输出Token数
     */
    private Integer outputTokens;

    /**
     * 总Token数
     */
    private Integer totalTokens;
}
```

### 配置属性

```java
@Data
@ConfigurationProperties(prefix = "langchain4j")
public class LangChain4jProperties {

    /**
     * 是否启用
     */
    private Boolean enabled = true;

    /**
     * 默认提供商
     */
    private String defaultProvider = "deepseek";

    /**
     * 默认模型
     */
    private String defaultModel = "deepseek-chat";

    /**
     * 请求超时时间
     */
    private Duration timeout = Duration.ofSeconds(60);

    /**
     * 最大重试次数
     */
    private Integer maxRetries = 3;

    /**
     * DeepSeek配置
     */
    private ModelConfig deepseek;

    /**
     * 通义千问配置
     */
    private ModelConfig qianwen;

    /**
     * Claude配置
     */
    private ModelConfig claude;

    /**
     * OpenAI配置
     */
    private ModelConfig openai;

    /**
     * Ollama配置
     */
    private ModelConfig ollama;

    /**
     * 对话配置
     */
    private ChatConfig chat = new ChatConfig();

    /**
     * Embedding配置
     */
    private EmbeddingConfig embedding = new EmbeddingConfig();

    /**
     * RAG配置
     */
    private RagConfig rag = new RagConfig();
}

@Data
public class ModelConfig {
    private Boolean enabled = false;
    private String apiKey;
    private String baseUrl;
    private String modelName;
    private Double temperature = 0.7;
    private Integer maxTokens = 2048;
}

@Data
public class ChatConfig {
    private Boolean streamEnabled = true;
    private Integer historySize = 10;
    private Integer sessionTimeout = 30;
    private Boolean memoryEnabled = true;
    private String memoryStoreType = "memory";
}

@Data
public class RagConfig {
    private Boolean enabled = false;
    private Integer maxResults = 5;
    private Double minScore = 0.7;
    private Integer chunkSize = 500;
    private Integer chunkOverlap = 50;
    private String vectorStoreType = "memory";
}
```

## 最佳实践

### 1. 合理选择对话模式

```java
// 单轮问答 - 不需要上下文
ChatRequest request = new ChatRequest();
request.setMode(ChatMode.SINGLE);
request.setMessage("今天是星期几？");

// 连续对话 - 需要上下文
ChatRequest request = new ChatRequest();
request.setMode(ChatMode.CONTINUOUS);
request.setSessionId("user-123");
request.setMessage("继续上面的话题...");

// RAG模式 - 需要知识库支持
ChatRequest request = new ChatRequest();
request.setMode(ChatMode.RAG);
request.setKnowledgeBaseIds(List.of("kb-001", "kb-002"));
request.setMessage("公司的年假政策是什么？");
```

### 2. 合理设置Temperature

```java
// 创意写作 - 高温度
ChatRequest request = new ChatRequest();
request.setTemperature(0.9);
request.setMessage("写一首关于春天的诗");

// 代码生成 - 低温度
ChatRequest request = new ChatRequest();
request.setTemperature(0.2);
request.setMessage("写一个Java单例模式的实现");

// 问答 - 中等温度
ChatRequest request = new ChatRequest();
request.setTemperature(0.5);
request.setMessage("什么是微服务架构？");
```

### 3. 使用系统提示词定制行为

```java
ChatRequest request = new ChatRequest();
request.setSystemPrompt("""
    你是一个专业的Java开发助手。
    请遵循以下规则：
    1. 使用中文回答
    2. 代码示例使用Java 17+语法
    3. 遵循Spring Boot最佳实践
    4. 添加详细的注释
    """);
request.setMessage("如何实现分布式锁？");
```

### 4. 控制Token使用

```java
// 限制输出长度
ChatRequest request = new ChatRequest();
request.setMaxTokens(500);  // 最多500个token
request.setMessage("简要介绍一下机器学习");

// 监控Token使用
ChatResponse response = chatService.chat(request);
TokenUsageInfo usage = response.getTokenUsage();
log.info("Token使用: 输入={}, 输出={}, 总计={}",
    usage.getInputTokens(),
    usage.getOutputTokens(),
    usage.getTotalTokens());
```

### 5. 流式响应用户体验优化

```typescript
// 前端逐字显示效果
const displayContent = ref('');

client.onMessage((response) => {
  if (!response.finished) {
    // 逐字追加显示
    displayContent.value += response.content;
  } else {
    // 显示完成状态
    console.log('回答完成，共用时', response.responseTime, 'ms');
  }
});
```

## 故障排查

### 1. 连接失败

**错误**: `Connection refused` 或 `API key invalid`

**解决方案**:
- 检查 API 密钥是否正确
- 检查网络连接是否正常
- 检查 base-url 是否正确
- 对于国内用户，OpenAI 可能需要代理

```yaml
langchain4j:
  openai:
    # 使用代理地址
    base-url: https://your-proxy.com/v1
```

### 2. 流式响应中断

**原因**: 网络超时或 Token 超限

**解决方案**:
```yaml
langchain4j:
  timeout: 120s  # 增加超时时间
  deepseek:
    max-tokens: 4096  # 增加最大 Token 数
```

### 3. 内存占用过高

**原因**: 对话历史过多

**解决方案**:
```yaml
langchain4j:
  chat:
    history-size: 5  # 减少历史消息数量
    session-timeout: 10  # 减少会话超时时间
    memory-store-type: redis  # 使用Redis存储
```

### 4. Redis连接问题

**错误**: `Cannot connect to Redis`

**解决方案**:
```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: your-password
      timeout: 10s

langchain4j:
  chat:
    memory-store-type: memory  # 暂时切换到内存存储
```

### 5. 模型响应慢

**原因**: 模型负载高或网络延迟

**解决方案**:
```java
// 使用更快的模型
ChatRequest request = new ChatRequest();
request.setProvider("deepseek");
request.setModelName("deepseek-chat");  // 比deepseek-coder更快

// 或使用本地Ollama
request.setProvider("ollama");
request.setModelName("llama3:latest");
```

## 应用场景

### 1. 智能客服

```java
@Service
public class CustomerServiceBot {

    @Autowired
    private ChatService chatService;

    public String handleCustomerQuery(String customerId, String question) {
        String sessionId = "customer-" + customerId;

        ChatRequest request = new ChatRequest();
        request.setSessionId(sessionId);
        request.setMode(ChatMode.CONTINUOUS);
        request.setSystemPrompt("""
            你是XX公司的客服助手。
            请友善、专业地回答客户问题。
            如果无法回答，请引导客户联系人工客服。
            """);
        request.setMessage(question);

        return chatService.chat(request).getContent();
    }
}
```

### 2. 代码生成助手

```java
@Service
public class CodeGenerator {

    @Autowired
    private ChatService chatService;

    public String generateEntity(String tableName, List<String> columns) {
        String prompt = String.format(
            "生成一个名为 %s 的实体类，包含以下字段: %s",
            tableName, String.join(", ", columns)
        );

        ChatRequest request = new ChatRequest();
        request.setMode(ChatMode.SINGLE);
        request.setSystemPrompt("""
            你是一个Java代码生成器。
            生成的代码要求：
            1. 使用Lombok注解
            2. 添加MyBatis-Plus注解
            3. 字段使用驼峰命名
            4. 添加详细注释
            """);
        request.setMessage(prompt);
        request.setTemperature(0.2);  // 降低创造性

        return chatService.chat(request).getContent();
    }
}
```

### 3. 文档问答系统

```java
@Service
public class DocumentQA {

    @Autowired
    private ChatService chatService;

    public String ask(String question, List<String> knowledgeBaseIds) {
        ChatRequest request = new ChatRequest();
        request.setMode(ChatMode.RAG);
        request.setKnowledgeBaseIds(knowledgeBaseIds);
        request.setSystemPrompt("""
            请根据提供的参考资料回答问题。
            如果参考资料中没有相关信息，请明确说明。
            回答时请引用相关资料来源。
            """);
        request.setMessage(question);

        return chatService.chat(request).getContent();
    }
}
```

### 4. 内容审核

```java
@Service
public class ContentModerator {

    @Autowired
    private ChatService chatService;

    public ModerationResult moderate(String content) {
        ChatRequest request = new ChatRequest();
        request.setMode(ChatMode.SINGLE);
        request.setSystemPrompt("""
            你是一个内容审核助手。
            请判断以下内容是否包含：
            1. 违法违规信息
            2. 色情低俗内容
            3. 暴力恐怖内容
            4. 政治敏感内容

            请以JSON格式返回审核结果：
            {"safe": true/false, "categories": [], "reason": ""}
            """);
        request.setMessage(content);
        request.setTemperature(0.1);

        String result = chatService.chat(request).getContent();
        return parseResult(result);
    }
}
```

## 前端集成

### AAiChat 组件

框架提供了完整的 AI 聊天组件：

```vue
<template>
  <AAiChat
    :show="showAiChat"
    @close="showAiChat = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AAiChat from '@/components/AAiChat/index.vue'

const showAiChat = ref(false)
</script>
```

组件特性：
- 流式响应显示
- Markdown 渲染
- 代码高亮
- 历史记录
- 会话管理
- 复制/重试功能

## EmbeddingService 向量嵌入服务

### 服务概述

`EmbeddingService` 提供文本向量化能力，将文本转换为高维向量表示，是 RAG 功能的基础组件。

```java
@Slf4j
public class EmbeddingService {

    private final LangChain4jProperties properties;
    private volatile EmbeddingModel embeddingModel;

    /**
     * 嵌入单个文本
     */
    public List<Float> embed(String text) {
        Response<Embedding> response = getEmbeddingModel().embed(text);
        return response.content().vectorAsList();
    }

    /**
     * 嵌入多个文本
     */
    public List<List<Float>> embedAll(List<String> texts) {
        if (CollUtil.isEmpty(texts)) {
            return List.of();
        }

        List<TextSegment> segments = texts.stream()
            .map(TextSegment::from)
            .collect(Collectors.toList());

        Response<List<Embedding>> response = getEmbeddingModel().embedAll(segments);

        return response.content().stream()
            .map(Embedding::vectorAsList)
            .collect(Collectors.toList());
    }

    /**
     * 批量嵌入文本段落
     */
    public List<Embedding> embedSegments(List<TextSegment> segments) {
        if (CollUtil.isEmpty(segments)) {
            return List.of();
        }

        int batchSize = properties.getEmbedding().getBatchSize();
        List<Embedding> allEmbeddings = CollUtil.newArrayList();

        // 分批处理
        for (int i = 0; i < segments.size(); i += batchSize) {
            int end = Math.min(i + batchSize, segments.size());
            List<TextSegment> batch = segments.subList(i, end);

            Response<List<Embedding>> response = getEmbeddingModel().embedAll(batch);
            allEmbeddings.addAll(response.content());

            log.debug("Embedded batch {}-{} of {}", i, end, segments.size());
        }

        return allEmbeddings;
    }

    /**
     * 计算余弦相似度
     */
    public double cosineSimilarity(List<Float> vector1, List<Float> vector2) {
        if (vector1.size() != vector2.size()) {
            throw new IllegalArgumentException("Vector dimensions must match");
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < vector1.size(); i++) {
            dotProduct += vector1.get(i) * vector2.get(i);
            norm1 += vector1.get(i) * vector1.get(i);
            norm2 += vector2.get(i) * vector2.get(i);
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
```

### 嵌入模型配置

```yaml
langchain4j:
  embedding:
    model-name: text-embedding-3-small  # 嵌入模型名称
    dimension: 1536                      # 向量维度
    batch-size: 100                      # 批处理大小
```

### 使用示例

```java
@Service
@RequiredArgsConstructor
public class DocumentSearchService {

    private final EmbeddingService embeddingService;

    /**
     * 文本相似度搜索
     */
    public double calculateSimilarity(String text1, String text2) {
        List<Float> vector1 = embeddingService.embed(text1);
        List<Float> vector2 = embeddingService.embed(text2);
        return embeddingService.cosineSimilarity(vector1, vector2);
    }

    /**
     * 批量向量化文档
     */
    public List<List<Float>> embedDocuments(List<String> documents) {
        return embeddingService.embedAll(documents);
    }
}
```

### 支持的嵌入模型

| 提供商 | 模型名称 | 向量维度 | 说明 |
|--------|----------|----------|------|
| OpenAI | text-embedding-3-small | 1536 | 推荐，性价比高 |
| OpenAI | text-embedding-3-large | 3072 | 更高精度 |
| OpenAI | text-embedding-ada-002 | 1536 | 旧版模型 |
| 本地 | all-MiniLM-L6-v2 | 384 | 本地模型，需启用依赖 |

## RagService 检索增强服务

### 服务架构

`RagService` 提供完整的 RAG（检索增强生成）能力，包括文档向量化、存储和检索：

```java
@Slf4j
public class RagService {

    private final LangChain4jProperties properties;
    private final EmbeddingService embeddingService;
    private final EmbeddingStore<TextSegment> embeddingStore;

    /**
     * 添加文档到向量库
     */
    public void addDocument(String documentId, String content) {
        // 分割文档
        List<TextSegment> segments = splitDocument(content, documentId);

        // 批量向量化
        List<Embedding> embeddings = embeddingService.embedSegments(segments);

        // 存储到向量库
        embeddingStore.addAll(embeddings, segments);

        log.info("Added document {} with {} segments", documentId, segments.size());
    }

    /**
     * 检索相关文档
     */
    public List<DocumentReference> retrieve(String query, int maxResults) {
        // 向量化查询
        List<Float> queryEmbedding = embeddingService.embed(query);

        // 转换为Embedding对象
        float[] floatArray = new float[queryEmbedding.size()];
        for (int i = 0; i < queryEmbedding.size(); i++) {
            floatArray[i] = queryEmbedding.get(i);
        }
        Embedding embedding = new Embedding(floatArray);

        // 执行检索
        List<EmbeddingMatch<TextSegment>> matches = embeddingStore.search(
            EmbeddingSearchRequest.builder()
                .queryEmbedding(embedding)
                .maxResults(maxResults)
                .minScore(properties.getRag().getMinScore())
                .build()
        ).matches();

        // 转换为响应对象
        return matches.stream()
            .map(this::convertToReference)
            .collect(Collectors.toList());
    }

    /**
     * 构建RAG提示词
     */
    public String buildRagPrompt(String query, List<DocumentReference> references) {
        if (CollUtil.isEmpty(references)) {
            return query;
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("参考以下信息回答问题：\n\n");

        for (int i = 0; i < references.size(); i++) {
            DocumentReference ref = references.get(i);
            prompt.append(String.format("[文档%d] %s\n", i + 1, ref.getContent()));
        }

        prompt.append("\n问题：").append(query);
        prompt.append("\n\n请基于以上参考信息，准确、详细地回答问题。如果参考信息不足以回答问题，请明确说明。");

        return prompt.toString();
    }

    /**
     * 分割文档
     */
    private List<TextSegment> splitDocument(String content, String documentId) {
        Metadata metadata = new Metadata();
        metadata.put("id", documentId);

        Document document = Document.from(content, metadata);

        DocumentSplitter splitter = DocumentSplitters.recursive(
            properties.getRag().getChunkSize(),
            properties.getRag().getChunkOverlap()
        );

        return splitter.split(document);
    }
}
```

### RAG 配置详解

```yaml
langchain4j:
  rag:
    enabled: true                    # 是否启用RAG
    max-results: 5                   # 检索结果数量
    min-score: 0.7                   # 最小相似度分数（0-1）
    chunk-size: 500                  # 文档分块大小（字符数）
    chunk-overlap: 50                # 分块重叠大小
    vector-store-type: memory        # 向量存储类型: memory, milvus, pgvector

    # Milvus 向量数据库配置
    milvus:
      host: localhost
      port: 19530
      collection-name: documents
      database-name: default
```

### KnowledgeDocument 知识文档实体

```java
@Data
@Accessors(chain = true)
public class KnowledgeDocument implements Serializable {

    /**
     * 文档ID
     */
    private Long id;

    /**
     * 知识库ID
     */
    private Long knowledgeBaseId;

    /**
     * 文档名称
     */
    private String name;

    /**
     * 文档内容
     */
    private String content;

    /**
     * 文件路径
     */
    private String filePath;

    /**
     * 文档类型
     */
    private String fileType;

    /**
     * 文件大小
     */
    private Long fileSize;

    /**
     * 分块数量
     */
    private Integer chunkCount;

    /**
     * 向量化状态: 0-待处理, 1-处理中, 2-已完成, 3-失败
     */
    private Integer embeddingStatus;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
```

### DocumentReference 文档引用

```java
@Data
public class DocumentReference {

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 匹配内容
     */
    private String content;

    /**
     * 相似度分数 (0-1)
     */
    private Double score;

    /**
     * 元数据
     */
    private Map<String, Object> metadata;
}
```

### RAG 完整使用示例

```java
@Service
@RequiredArgsConstructor
public class KnowledgeBaseService {

    private final RagService ragService;
    private final ChatService chatService;

    /**
     * 添加文档到知识库
     */
    public void addDocument(KnowledgeDocument document) {
        ragService.addDocument(
            document.getId().toString(),
            document.getContent()
        );
    }

    /**
     * 知识库问答
     */
    public String queryKnowledgeBase(String question) {
        // 1. 检索相关文档
        List<DocumentReference> references = ragService.retrieve(question, 5);

        // 2. 构建增强提示词
        String ragPrompt = ragService.buildRagPrompt(question, references);

        // 3. 调用AI生成回答
        ChatRequest request = new ChatRequest();
        request.setMessage(ragPrompt);
        request.setMode(ChatMode.SINGLE);
        request.setSystemPrompt("你是一个专业的知识库问答助手，请根据提供的参考资料回答问题。");

        ChatResponse response = chatService.chat(request);

        return response.getContent();
    }

    /**
     * 批量导入文档
     */
    public void importDocuments(List<KnowledgeDocument> documents) {
        for (KnowledgeDocument doc : documents) {
            try {
                addDocument(doc);
                doc.setEmbeddingStatus(2); // 已完成
            } catch (Exception e) {
                doc.setEmbeddingStatus(3); // 失败
                log.error("Failed to embed document: {}", doc.getId(), e);
            }
        }
    }
}
```

## PromptUtils 提示词工具

### 工具概述

`PromptUtils` 提供丰富的提示词构建能力，支持模板加载、变量替换、少样本学习、思维链等高级提示词技术：

```java
@Slf4j
public class PromptUtils {

    /**
     * 从资源文件加载提示词模板
     */
    public static String loadPromptTemplate(String templateName) {
        String path = "prompts/" + templateName;
        try (InputStream is = PromptUtils.class.getClassLoader().getResourceAsStream(path)) {
            if (is == null) {
                log.warn("Prompt template not found: {}", path);
                return "";
            }
            return IoUtil.read(is, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to load prompt template: {}", path, e);
            return "";
        }
    }

    /**
     * 替换提示词变量
     *
     * @param template  模板字符串，使用 {{variableName}} 作为占位符
     * @param variables 变量映射
     * @return 替换后的字符串
     */
    public static String fillTemplate(String template, Map<String, String> variables) {
        if (StrUtil.isBlank(template) || variables == null || variables.isEmpty()) {
            return template;
        }

        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            result = result.replace(placeholder, entry.getValue());
        }

        return result;
    }

    /**
     * 构建系统提示词
     */
    public static String buildSystemPrompt(String role, String context) {
        StringBuilder prompt = new StringBuilder();

        if (StrUtil.isNotBlank(role)) {
            prompt.append("你是").append(role).append("。\n");
        }

        if (StrUtil.isNotBlank(context)) {
            prompt.append(context);
        }

        return prompt.toString();
    }

    /**
     * 构建少样本提示词(Few-shot)
     */
    public static String buildFewShotPrompt(String instruction, List<Example> examples, String query) {
        StringBuilder prompt = new StringBuilder();

        if (StrUtil.isNotBlank(instruction)) {
            prompt.append(instruction).append("\n\n");
        }

        if (examples != null && !examples.isEmpty()) {
            prompt.append("示例：\n");
            for (int i = 0; i < examples.size(); i++) {
                Example example = examples.get(i);
                prompt.append("示例").append(i + 1).append("：\n");
                prompt.append("输入：").append(example.input()).append("\n");
                prompt.append("输出：").append(example.output()).append("\n\n");
            }
        }

        prompt.append("请按照以上示例的格式处理以下输入：\n");
        prompt.append("输入：").append(query);

        return prompt.toString();
    }

    /**
     * 构建思维链提示词(Chain of Thought)
     */
    public static String buildCoTPrompt(String query) {
        return query + "\n\n请一步一步地思考并解释你的推理过程。";
    }

    /**
     * 构建角色扮演提示词
     */
    public static String buildRolePlayPrompt(String role, String personality, String task) {
        return StrUtil.format(
            "你现在扮演{}，性格特点是{}。\n现在请你完成以下任务：{}",
            role, personality, task
        );
    }

    /**
     * 限制输出格式
     */
    public static String addFormatConstraint(String prompt, String format) {
        return prompt + "\n\n请严格按照以下格式输出：\n" + format;
    }

    /**
     * 添加输出长度限制
     */
    public static String addLengthConstraint(String prompt, int maxWords) {
        return prompt + StrUtil.format("\n\n请将回答控制在{}字以内。", maxWords);
    }

    /**
     * 示例记录
     */
    public record Example(String input, String output) {}
}
```

### 提示词模板使用

创建提示词模板文件 `resources/prompts/code-review.txt`：

```text
你是一名资深的{{language}}代码审查专家。

请审查以下代码并提供改进建议：

代码：
```{{language}}
{{code}}
```

请从以下方面进行审查：
1. 代码规范性
2. 性能优化
3. 安全隐患
4. 可维护性
```

使用模板：

```java
@Service
public class CodeReviewService {

    public String reviewCode(String language, String code) {
        // 加载模板
        String template = PromptUtils.loadPromptTemplate("code-review.txt");

        // 填充变量
        Map<String, String> variables = Map.of(
            "language", language,
            "code", code
        );
        String prompt = PromptUtils.fillTemplate(template, variables);

        // 调用AI
        ChatRequest request = new ChatRequest();
        request.setMessage(prompt);
        request.setTemperature(0.3);

        return chatService.chat(request).getContent();
    }
}
```

### 少样本学习示例

```java
@Service
public class SentimentAnalysisService {

    public String analyzeSentiment(String text) {
        // 构建示例
        List<PromptUtils.Example> examples = List.of(
            new PromptUtils.Example("这个产品太棒了，强烈推荐！", "正面"),
            new PromptUtils.Example("质量很差，完全不值这个价格", "负面"),
            new PromptUtils.Example("还可以吧，没什么特别的", "中性")
        );

        // 构建少样本提示词
        String prompt = PromptUtils.buildFewShotPrompt(
            "请判断以下文本的情感倾向（正面/负面/中性）",
            examples,
            text
        );

        ChatRequest request = new ChatRequest();
        request.setMessage(prompt);
        request.setMode(ChatMode.SINGLE);
        request.setTemperature(0.1);

        return chatService.chat(request).getContent();
    }
}
```

### 思维链推理示例

```java
@Service
public class MathSolverService {

    public String solveProblem(String problem) {
        // 使用思维链提示
        String cotPrompt = PromptUtils.buildCoTPrompt(problem);

        ChatRequest request = new ChatRequest();
        request.setMessage(cotPrompt);
        request.setSystemPrompt("你是一个数学老师，请详细解释每一步的推理过程。");
        request.setTemperature(0.2);

        return chatService.chat(request).getContent();
    }
}
```

## TokenCounter 工具类

### 功能概述

`TokenCounter` 提供 Token 计数和文本处理能力，帮助控制 API 调用成本：

```java
public class TokenCounter {

    private static final Tokenizer DEFAULT_TOKENIZER = new OpenAiTokenizer();

    /**
     * 估算文本的Token数量
     */
    public static int estimateTokenCount(String text) {
        if (StrUtil.isBlank(text)) {
            return 0;
        }
        return DEFAULT_TOKENIZER.estimateTokenCountInText(text);
    }

    /**
     * 估算多个文本的总Token数
     */
    public static int estimateTokenCount(String... texts) {
        int total = 0;
        for (String text : texts) {
            total += estimateTokenCount(text);
        }
        return total;
    }

    /**
     * 检查文本是否超过Token限制
     */
    public static boolean exceedsLimit(String text, int limit) {
        return estimateTokenCount(text) > limit;
    }

    /**
     * 截断文本以适应Token限制
     */
    public static String truncateToTokenLimit(String text, int maxTokens) {
        if (StrUtil.isBlank(text)) {
            return text;
        }

        int currentTokens = estimateTokenCount(text);
        if (currentTokens <= maxTokens) {
            return text;
        }

        // 粗略估算需要保留的字符比例
        double ratio = (double) maxTokens / currentTokens;
        int targetLength = (int) (text.length() * ratio * 0.9); // 留10%余量

        return text.substring(0, Math.min(targetLength, text.length()));
    }

    /**
     * 计算对话历史的总Token数
     */
    public static int calculateConversationTokens(ChatMessage... messages) {
        int total = 0;
        for (var message : messages) {
            total += estimateTokenCount(message.text());
            total += 4; // 消息格式开销
        }
        total += 3; // 对话格式开销
        return total;
    }

    /**
     * 根据中文字符粗略估算Token（1个汉字约等于2个token）
     */
    public static int estimateChineseTokens(String text) {
        if (StrUtil.isBlank(text)) {
            return 0;
        }

        int chineseCount = 0;
        int otherCount = 0;

        for (char c : text.toCharArray()) {
            if (isChinese(c)) {
                chineseCount++;
            } else {
                otherCount++;
            }
        }

        // 中文字符约2个token，其他字符约0.25个token
        return (int) (chineseCount * 2 + otherCount * 0.25);
    }

    private static boolean isChinese(char c) {
        Character.UnicodeBlock ub = Character.UnicodeBlock.of(c);
        return ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS
            || ub == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS
            || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A
            || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B;
    }
}
```

### Token 计数使用示例

```java
@Service
@RequiredArgsConstructor
public class TokenManagementService {

    private static final int MAX_TOKENS = 4096;

    /**
     * 检查消息是否超限
     */
    public boolean isMessageTooLong(String message) {
        return TokenCounter.exceedsLimit(message, MAX_TOKENS);
    }

    /**
     * 安全截断消息
     */
    public String safeTruncate(String message, int maxTokens) {
        return TokenCounter.truncateToTokenLimit(message, maxTokens);
    }

    /**
     * 计算预估成本
     */
    public double estimateCost(String text, double pricePerThousandTokens) {
        int tokens = TokenCounter.estimateTokenCount(text);
        return (tokens / 1000.0) * pricePerThousandTokens;
    }

    /**
     * 验证对话历史是否超限
     */
    public boolean validateConversationSize(List<String> messages, int maxTokens) {
        int totalTokens = 0;
        for (String msg : messages) {
            totalTokens += TokenCounter.estimateTokenCount(msg);
            totalTokens += 4; // 消息格式开销
        }
        totalTokens += 3; // 对话格式开销

        return totalTokens <= maxTokens;
    }
}
```

### Token 估算规则

| 文本类型 | 估算规则 |
|----------|----------|
| 英文 | 约 4 个字符 = 1 个 Token |
| 中文 | 约 1 个汉字 = 2 个 Token |
| 代码 | 约 3 个字符 = 1 个 Token |
| 标点 | 约 1 个标点 = 1 个 Token |

## Maven 依赖说明

### 完整依赖配置

```xml
<dependencies>
    <!-- LangChain4j 核心依赖 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
        <version>${langchain4j.version}</version>
    </dependency>

    <!-- OpenAI 模型支持 (包括 DeepSeek 兼容) -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai</artifactId>
        <version>${langchain4j.version}</version>
    </dependency>

    <!-- Ollama 本地模型支持 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-ollama</artifactId>
        <version>${langchain4j.version}</version>
    </dependency>

    <!-- DashScope 通义千问支持 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-dashscope</artifactId>
        <version>${langchain4j.version}</version>
    </dependency>

    <!-- Anthropic Claude 支持 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-anthropic</artifactId>
        <version>${langchain4j.version}</version>
    </dependency>

    <!-- 本地嵌入模型 (可选) -->
    <!--
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-embeddings-all-minilm-l6-v2</artifactId>
        <version>${langchain4j.version}</version>
    </dependency>
    -->

    <!-- Redis 会话存储 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- WebSocket 实时通信 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-websocket</artifactId>
    </dependency>
</dependencies>
```

### 依赖版本

```xml
<properties>
    <langchain4j.version>0.35.0</langchain4j.version>
</properties>
```

### 可选依赖

| 依赖 | 用途 | 说明 |
|------|------|------|
| langchain4j-embeddings-all-minilm-l6-v2 | 本地嵌入模型 | 无需 API，离线使用 |
| langchain4j-milvus | Milvus 向量库 | 生产环境推荐 |
| langchain4j-pgvector | PostgreSQL 向量扩展 | 已有 PG 数据库时使用 |

## 性能优化

### 1. 启用 Redis 缓存

```yaml
langchain4j:
  chat:
    memory-store-type: redis  # 使用 Redis 而非内存
```

### 2. 合理设置 Token 限制

```yaml
langchain4j:
  deepseek:
    max-tokens: 2048  # 根据实际需求调整
```

### 3. 控制历史消息数量

```yaml
langchain4j:
  chat:
    history-size: 5  # 只保留最近 5 条消息
```

### 4. 设置合理的超时时间

```yaml
langchain4j:
  timeout: 30s  # 根据模型响应速度调整
```

### 5. 使用连接池

```yaml
spring:
  data:
    redis:
      lettuce:
        pool:
          max-active: 20
          max-idle: 10
          min-idle: 5
```
