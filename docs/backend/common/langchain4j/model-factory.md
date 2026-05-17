# 模型工厂

## 介绍

ModelFactory 是 LangChain4j 模块的核心组件，负责创建和管理各种 AI 模型实例。它采用工厂模式设计，通过统一的接口屏蔽不同模型提供商的实现差异，使开发者能够以一致的方式使用多种 AI 模型，并支持运行时动态切换。

**核心特性:**

- **多提供商支持** - 支持 DeepSeek、通义千问、Claude、OpenAI、Ollama 五大主流模型提供商
- **统一接口** - 无论使用哪个提供商，API 调用方式完全一致，降低学习成本
- **自动配置** - 基于 Spring Boot 自动配置机制，根据配置文件自动初始化模型参数
- **灵活切换** - 支持运行时动态切换不同的模型提供商，无需重启服务
- **流式支持** - 同时支持同步和流式两种聊天模型，满足不同业务场景需求
- **智能降级** - 结合异常处理实现主备模型降级策略，提高系统可用性
- **调试日志** - 根据日志级别自动开启请求/响应日志，便于开发调试

## 模块架构

### 整体架构

```text
┌─────────────────────────────────────────────────────────────┐
│                       业务层 (Business Layer)                │
│                  ChatService / RAG / Embedding               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     ModelFactory (模型工厂)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  createChatModel(provider)                           │   │
│  │  createChatModel(provider, modelName)                │   │
│  │  createStreamingChatModel(provider)                  │   │
│  │  createStreamingChatModel(provider, modelName)       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DeepSeek   │     │   Claude    │     │   Ollama    │
│  OpenAI SDK │     │Anthropic SDK│     │ Ollama SDK  │
└─────────────┘     └─────────────┘     └─────────────┘
         ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  通义千问    │     │   OpenAI    │     │  本地模型   │
│  Qwen SDK   │     │ OpenAI SDK  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 核心类结构

```text
plus.ruoyi.common.langchain4j
├── config/
│   ├── LangChain4jProperties.java     # 配置属性类
│   │   ├── ModelConfig                # 模型配置(API Key、URL等)
│   │   ├── ChatConfig                 # 对话配置
│   │   ├── EmbeddingConfig            # 嵌入配置
│   │   ├── RagConfig                  # RAG配置
│   │   └── MilvusConfig               # Milvus配置
│   └── LangChain4jAutoConfiguration.java  # 自动配置类
├── factory/
│   └── ModelFactory.java              # 模型工厂(核心)
├── enums/
│   ├── ModelProvider.java             # 模型提供商枚举
│   ├── ChatMode.java                  # 对话模式枚举
│   ├── MessageRole.java               # 消息角色枚举
│   └── VectorStoreType.java           # 向量存储类型枚举
├── core/
│   ├── chat/
│   │   ├── ChatService.java           # 对话服务
│   │   ├── ChatMemoryManager.java     # 对话记忆管理
│   │   └── StreamChatHandler.java     # 流式处理器
│   ├── embedding/
│   │   └── EmbeddingService.java      # 嵌入服务
│   └── rag/
│       └── RagService.java            # RAG服务
├── store/
│   └── redis/
│       └── RedisChatStore.java        # Redis存储
└── utils/
    ├── PromptUtils.java               # 提示词工具
    └── TokenCounter.java              # Token计数器
```

## 支持的模型提供商

ModelFactory 支持五种主流 AI 模型提供商，每种都有其特点和适用场景：

### 提供商概览

| 提供商 | 代码 | 默认模型 | 默认API地址 | 特点 |
|-------|------|---------|-------------|------|
| DeepSeek | `deepseek` | `deepseek-chat` | `https://api.deepseek.com` | 性价比高，中文优化 |
| 通义千问 | `qianwen` | `qwen-turbo` | `https://dashscope.aliyuncs.com/api/v1` | 阿里云原生，稳定可靠 |
| Claude | `claude` | `claude-3-5-sonnet-20241022` | `https://api.anthropic.com` | 推理能力强，对话自然 |
| OpenAI | `openai` | `gpt-4o-mini` | `https://api.openai.com/v1` | 生态成熟，功能丰富 |
| Ollama | `ollama` | `llama3.2` | `http://localhost:11434` | 本地部署，隐私安全 |

### DeepSeek

DeepSeek 是国产大模型，以高性价比著称，特别适合中文场景。ModelFactory 使用 OpenAI 兼容 API 与 DeepSeek 通信，因为 DeepSeek 提供了与 OpenAI 兼容的接口。

**支持的模型:**
- `deepseek-chat` - 通用对话模型
- `deepseek-coder` - 代码生成专用模型

**特点:**
- 价格低廉，仅为 GPT-4 的 1/100
- 中文理解和生成能力出色
- 代码生成能力强（使用 deepseek-coder）
- OpenAI 兼容接口，迁移成本低

```java
// DeepSeek 模型创建实现（LangChain4j 1.14.1）
private ChatModel createDeepSeekChatModel(String modelName, ThinkingOptions thinking) {
    ModelConfig config = effectiveConfig(properties.getDeepseek(), thinking);
    validateConfig(config, "DeepSeek");

    // 使用 OpenAI SDK 调用 DeepSeek API（OpenAI 兼容协议）
    OpenAiChatModel.OpenAiChatModelBuilder builder = OpenAiChatModel.builder()
            .apiKey(config.getApiKey())
            .baseUrl(getBaseUrl(config, ModelProvider.DEEPSEEK))
            .modelName(getModelName(modelName, config, "deepseek-chat"))
            .temperature(config.getTemperature())
            .topP(config.getTopP())
            .maxTokens(config.getMaxTokens())
            .timeout(properties.getTimeout())
            .maxRetries(properties.getMaxRetries())
            .logRequests(log.isDebugEnabled())
            .logResponses(log.isDebugEnabled());

    // 启用深度思考：自动解析 reasoning_content 字段
    if (Boolean.TRUE.equals(config.getEnableThinking())) {
        builder.returnThinking(Boolean.TRUE.equals(config.getReturnThinking()));
    }

    return builder.build();
}
```

### 通义千问

通义千问是阿里云推出的大语言模型，使用 DashScope SDK 进行调用，原生支持阿里云生态。

**支持的模型:**
- `qwen-turbo` - 快速响应，适合日常对话
- `qwen-plus` - 均衡型号，适合大多数场景
- `qwen-max` - 最强能力，适合复杂任务

**特点:**
- 阿里云原生支持
- 与阿里云其他服务深度集成
- 支持长上下文（128K tokens）
- 价格适中

```java
// 通义千问模型创建实现（LangChain4j 1.14.1）
private ChatModel createQianWenChatModel(String modelName, ThinkingOptions thinking) {
    ModelConfig config = effectiveConfig(properties.getQianwen(), thinking);
    validateConfig(config, "QianWen");

    QwenChatModel.QwenChatModelBuilder builder = QwenChatModel.builder()
            .apiKey(config.getApiKey())
            .modelName(getModelName(modelName, config, "qwen-turbo"))
            .temperature(config.getTemperature().floatValue())
            .topP(config.getTopP())
            .maxTokens(config.getMaxTokens());

    // Qwen 通过 defaultRequestParameters 透传 enable_thinking / thinking_budget
    if (Boolean.TRUE.equals(config.getEnableThinking())) {
        builder.defaultRequestParameters(buildQwenThinkingParameters(config));
    }

    return builder.build();
}
```

### Claude

Claude 是 Anthropic 公司推出的 AI 助手，以安全性和推理能力著称。使用专用的 Anthropic SDK 进行调用。

**支持的模型:**
- `claude-3-5-sonnet-20241022` - 最新的 Sonnet 模型，性能均衡
- `claude-3-opus-20240229` - 最强推理能力
- `claude-3-haiku-20240307` - 快速响应，成本最低

**特点:**
- 强大的推理和分析能力
- 对话风格自然
- 安全性设计优先
- 支持超长上下文（200K tokens）

```java
// Claude 模型创建实现（LangChain4j 1.14.1）
private ChatModel createClaudeChatModel(String modelName, ThinkingOptions thinking) {
    ModelConfig config = effectiveConfig(properties.getClaude(), thinking);
    validateConfig(config, "Claude");

    AnthropicChatModel.AnthropicChatModelBuilder builder = AnthropicChatModel.builder()
            .apiKey(config.getApiKey())
            .baseUrl(getBaseUrl(config, ModelProvider.CLAUDE))
            .modelName(getModelName(modelName, config, "claude-3-5-sonnet-20241022"))
            .temperature(config.getTemperature())
            .topP(config.getTopP())
            .maxTokens(config.getMaxTokens())
            .timeout(properties.getTimeout())
            .maxRetries(properties.getMaxRetries())
            .logRequests(log.isDebugEnabled())
            .logResponses(log.isDebugEnabled());

    // Claude Extended Thinking：thinkingType + thinkingBudgetTokens 必填
    applyClaudeThinking(builder, config);
    return builder.build();
}
```

### OpenAI

OpenAI 是 AI 领域的先驱，GPT 系列模型生态最为成熟，使用 OpenAI SDK 调用。

**支持的模型:**
- `gpt-4o` - 多模态旗舰模型
- `gpt-4o-mini` - 快速且经济的选择
- `gpt-4-turbo` - 高性能版本
- `gpt-3.5-turbo` - 经典模型，成本最低

**特点:**
- 生态最成熟
- 功能最丰富（函数调用、多模态等）
- 文档完善，社区活跃
- 支持微调

```java
// OpenAI 模型创建实现（LangChain4j 1.14.1）
private ChatModel createOpenAiChatModel(String modelName, ThinkingOptions thinking) {
    ModelConfig config = effectiveConfig(properties.getOpenai(), thinking);
    validateConfig(config, "OpenAI");

    OpenAiChatModel.OpenAiChatModelBuilder builder = OpenAiChatModel.builder()
            .apiKey(config.getApiKey())
            .baseUrl(getBaseUrl(config, ModelProvider.OPENAI))
            .modelName(getModelName(modelName, config, "gpt-4o-mini"))
            .temperature(config.getTemperature())
            .topP(config.getTopP())
            .maxTokens(config.getMaxTokens())
            .timeout(properties.getTimeout())
            .maxRetries(properties.getMaxRetries())
            .logRequests(log.isDebugEnabled())
            .logResponses(log.isDebugEnabled());

    // OpenAI 推理模型：通过 reasoningEffort 控制思考强度（low/medium/high）
    applyOpenAiReasoning(builder, config);
    return builder.build();
}
```

### Ollama

Ollama 是本地模型部署方案，无需 API Key，适合隐私敏感场景。使用 Ollama SDK 调用本地服务。

**支持的模型:**
- `llama3.2` - Meta 最新开源模型
- `llama3.1` - 稳定版本
- `mistral` - Mistral AI 开源模型
- `codellama` - 代码专用模型
- 以及 Ollama 支持的其他所有模型

**特点:**
- 完全本地运行，数据不出服务器
- 无需 API Key
- 支持多种开源模型
- 适合隐私敏感场景
- 5 分钟超时设置（本地模型首次加载较慢）

```java
// Ollama 模型创建实现（LangChain4j 1.14.1）
private ChatModel createOllamaChatModel(String modelName, ThinkingOptions thinking) {
    ModelConfig config = effectiveConfig(properties.getOllama(), thinking);

    OllamaChatModel.OllamaChatModelBuilder builder = OllamaChatModel.builder()
            .baseUrl(getBaseUrl(config, ModelProvider.OLLAMA))
            .modelName(getModelName(modelName, config, "llama3.2"))
            .temperature(config.getTemperature())
            .timeout(Duration.ofMinutes(5));  // 本地模型需要更长超时

    // Ollama 推理模型（deepseek-r1 / qwq）：通过 think=true 暴露思考块
    if (Boolean.TRUE.equals(config.getEnableThinking())) {
        builder.think(Boolean.TRUE)
                .returnThinking(Boolean.TRUE.equals(config.getReturnThinking()));
    }

    return builder.build();
}
```

## 基本用法

### 注入模型工厂

ModelFactory 作为 Spring Bean 自动注册，可以直接注入使用：

```java
@Service
@RequiredArgsConstructor
public class AiService {

    private final ModelFactory modelFactory;

    // 使用模型工厂创建模型
}
```

### 创建聊天模型

#### 使用默认模型

```java
// 使用指定提供商的默认模型（LangChain4j 1.14.1：返回 ChatModel）
ChatModel model = modelFactory.createChatModel("deepseek");

// 发送消息并获取响应（1.14.1：chat() 返回 ChatResponse）
ChatResponse response = model.chat(UserMessage.from("你好，请介绍一下自己"));
String answer = response.aiMessage().text();
```

#### 指定模型名称

```java
// 使用 DeepSeek 的代码模型
ChatModel codeModel = modelFactory.createChatModel("deepseek", "deepseek-coder");

// 使用 OpenAI 的 GPT-4
ChatModel gpt4Model = modelFactory.createChatModel("openai", "gpt-4-turbo");

// 使用通义千问的最强模型
ChatModel qwenMaxModel = modelFactory.createChatModel("qianwen", "qwen-max");
```

### 创建流式模型

流式模型用于实时输出，提供更好的用户体验：

#### 基本流式调用

```java
// 创建流式聊天模型（LangChain4j 1.14.1：返回 StreamingChatModel）
StreamingChatModel streamingModel =
    modelFactory.createStreamingChatModel("deepseek");

// 使用流式处理器（1.14.1：StreamingChatResponseHandler）
streamingModel.chat(List.of(UserMessage.from("写一首关于春天的诗")),
    new StreamingChatResponseHandler() {
        @Override
        public void onPartialResponse(String partialResponse) {
            // 最终回复增量
            System.out.print(partialResponse);
        }

        @Override
        public void onPartialThinking(PartialThinking partialThinking) {
            // 推理阶段增量（仅推理模型 + enableThinking=true 时触发）
            System.out.print("[思考] " + partialThinking.text());
        }

        @Override
        public void onCompleteResponse(ChatResponse completeResponse) {
            // 生成完成
            System.out.println("\n生成完成，共使用 " +
                completeResponse.tokenUsage().totalTokenCount() + " tokens");
        }

        @Override
        public void onError(Throwable error) {
            // 发生错误
            System.err.println("生成失败: " + error.getMessage());
        }
    });
```

#### 指定模型名称的流式调用

```java
StreamingChatModel streamingModel =
    modelFactory.createStreamingChatModel("openai", "gpt-4o");

// 使用 CompletableFuture 处理
CompletableFuture<ChatResponse> future = new CompletableFuture<>();

streamingModel.chat(List.of(UserMessage.from("分析这段代码的复杂度")),
    new StreamingChatResponseHandler() {
        StringBuilder content = new StringBuilder();

        @Override
        public void onPartialResponse(String partialResponse) {
            content.append(partialResponse);
            // 可以在这里实时推送到前端
        }

        @Override
        public void onCompleteResponse(ChatResponse completeResponse) {
            future.complete(completeResponse);
        }

        @Override
        public void onError(Throwable error) {
            future.completeExceptionally(error);
        }
    });

// 等待完成
ChatResponse response = future.get();
```

### 多轮对话

```java
@Service
@RequiredArgsConstructor
public class MultiTurnChatService {

    private final ModelFactory modelFactory;

    public String chat(List<ChatMessage> history, String userMessage) {
        // LangChain4j 1.14.1：ChatModel 替代 ChatLanguageModel
        ChatModel model = modelFactory.createChatModel("deepseek");

        // 构建消息列表
        List<dev.langchain4j.data.message.ChatMessage> messages = new ArrayList<>();

        // 添加历史消息
        for (ChatMessage msg : history) {
            if ("user".equals(msg.getRole())) {
                messages.add(UserMessage.from(msg.getContent()));
            } else {
                messages.add(AiMessage.from(msg.getContent()));
            }
        }

        // 添加当前用户消息
        messages.add(UserMessage.from(userMessage));

        // 生成响应（1.14.1：chat() 直接返回 ChatResponse）
        ChatResponse response = model.chat(messages);
        return response.aiMessage().text();
    }
}
```

## 配置详解

### 全局配置

```yaml
langchain4j:
  # 是否启用 LangChain4j 模块
  enabled: true

  # 默认模型提供商
  default-provider: deepseek

  # 默认模型名称
  default-model: deepseek-chat

  # 请求超时时间
  timeout: 60s

  # 最大重试次数
  max-retries: 3
```

### 模型提供商配置

#### DeepSeek 配置

```yaml
langchain4j:
  deepseek:
    # 是否启用
    enabled: true
    # API密钥（建议使用环境变量）
    api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY}
    # API地址（可选，使用默认值）
    base-url: https://api.deepseek.com
    # 模型名称
    model-name: deepseek-chat
    # 温度参数（0-2）
    temperature: 0.7
    # Top P 参数
    top-p: 1.0
    # 最大生成 Token 数
    max-tokens: 4096
```

#### 通义千问配置

```yaml
langchain4j:
  qianwen:
    enabled: true
    api-key: ${LANGCHAIN4J_QIANWEN_API_KEY}
    model-name: qwen-turbo
    temperature: 0.7
    top-p: 1.0
    max-tokens: 2048
```

#### Claude 配置

```yaml
langchain4j:
  claude:
    enabled: true
    api-key: ${LANGCHAIN4J_CLAUDE_API_KEY}
    base-url: https://api.anthropic.com
    model-name: claude-3-5-sonnet-20241022
    temperature: 0.7
    top-p: 1.0
    max-tokens: 4096
```

#### OpenAI 配置

```yaml
langchain4j:
  openai:
    enabled: true
    api-key: ${LANGCHAIN4J_OPENAI_API_KEY}
    base-url: https://api.openai.com/v1
    model-name: gpt-4o-mini
    temperature: 0.7
    top-p: 1.0
    max-tokens: 2048
```

#### Ollama 配置

```yaml
langchain4j:
  ollama:
    enabled: true
    # Ollama 本地服务地址
    base-url: http://localhost:11434
    # 模型名称（需要先用 ollama pull 下载）
    model-name: llama3.2
    temperature: 0.7
    max-tokens: 2048
```

### 多模型完整配置示例

```yaml
langchain4j:
  enabled: true
  default-provider: deepseek
  default-model: deepseek-chat
  timeout: 60s
  max-retries: 3

  # DeepSeek - 默认模型，性价比高
  deepseek:
    enabled: true
    api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY}
    model-name: deepseek-chat
    temperature: 0.7
    max-tokens: 4096

  # OpenAI - 高级功能
  openai:
    enabled: true
    api-key: ${LANGCHAIN4J_OPENAI_API_KEY}
    model-name: gpt-4o-mini
    temperature: 0.7
    max-tokens: 2048

  # 通义千问 - 阿里云集成
  qianwen:
    enabled: true
    api-key: ${LANGCHAIN4J_QIANWEN_API_KEY}
    model-name: qwen-turbo
    temperature: 0.7
    max-tokens: 2048

  # Claude - 复杂推理
  claude:
    enabled: false
    api-key: ${LANGCHAIN4J_CLAUDE_API_KEY}
    model-name: claude-3-5-sonnet-20241022
    temperature: 0.7
    max-tokens: 4096

  # Ollama - 本地部署
  ollama:
    enabled: false
    base-url: http://localhost:11434
    model-name: llama3.2
    temperature: 0.7

  # 对话配置
  chat:
    stream-enabled: true
    history-size: 10
    session-timeout: 30
    memory-enabled: true
    memory-store-type: redis

  # 嵌入配置
  embedding:
    model-name: text-embedding-3-small
    dimension: 1536
    batch-size: 100

  # RAG 配置
  rag:
    enabled: false
    max-results: 5
    min-score: 0.7
    chunk-size: 500
    chunk-overlap: 50
    vector-store-type: memory
```

## 高级用法

### 动态模型选择

根据业务需求动态选择最合适的模型：

```java
@Service
@RequiredArgsConstructor
public class SmartAiService {

    private final ModelFactory modelFactory;

    /**
     * 根据任务类型选择合适的模型
     */
    public String process(String content, TaskType taskType) {
        String provider;
        String modelName = null;

        switch (taskType) {
            case CODE_GENERATION:
                // 代码生成使用 DeepSeek Coder
                provider = "deepseek";
                modelName = "deepseek-coder";
                break;

            case COMPLEX_REASONING:
                // 复杂推理使用 Claude
                provider = "claude";
                modelName = "claude-3-opus-20240229";
                break;

            case QUICK_ANSWER:
                // 快速回答使用通义千问
                provider = "qianwen";
                modelName = "qwen-turbo";
                break;

            case PRIVATE_DATA:
                // 隐私数据使用本地模型
                provider = "ollama";
                modelName = "llama3.2";
                break;

            default:
                // 默认使用 DeepSeek
                provider = "deepseek";
        }

        ChatModel model = modelName != null
            ? modelFactory.createChatModel(provider, modelName)
            : modelFactory.createChatModel(provider);

        return model.chat(UserMessage.from(content)).aiMessage().text();
    }
}
```

### 模型降级策略

主模型失败时自动切换到备用模型，提高系统可用性：

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ResilientAiService {

    private final ModelFactory modelFactory;

    /**
     * 带降级策略的对话
     */
    public String chatWithFallback(String message) {
        // 定义模型优先级列表
        List<String> providers = List.of("openai", "deepseek", "qianwen");

        for (String provider : providers) {
            try {
                ChatModel model = modelFactory.createChatModel(provider);
                ChatResponse response = model.chat(UserMessage.from(message));
                log.info("使用 {} 模型成功响应", provider);
                return response.aiMessage().text();
            } catch (Exception e) {
                log.warn("模型 {} 调用失败: {}", provider, e.getMessage());
            }
        }

        throw new RuntimeException("所有模型均不可用");
    }

    /**
     * 带重试的对话
     */
    public String chatWithRetry(String message, int maxRetries) {
        String provider = "deepseek";
        Exception lastException = null;

        for (int i = 0; i < maxRetries; i++) {
            try {
                ChatModel model = modelFactory.createChatModel(provider);
                return model.chat(UserMessage.from(message)).aiMessage().text();
            } catch (Exception e) {
                lastException = e;
                log.warn("第 {} 次调用失败: {}", i + 1, e.getMessage());

                // 指数退避
                try {
                    Thread.sleep((long) Math.pow(2, i) * 1000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        throw new RuntimeException("重试 " + maxRetries + " 次后仍然失败", lastException);
    }
}
```

### 并行模型调用

同时调用多个模型，选择最佳结果或合并结果：

```java
@Service
@RequiredArgsConstructor
public class ParallelAiService {

    private final ModelFactory modelFactory;

    /**
     * 并行调用多个模型，返回最快响应
     */
    public String raceModels(String message) {
        List<String> providers = List.of("deepseek", "qianwen", "openai");

        CompletableFuture<String>[] futures = providers.stream()
            .map(provider -> CompletableFuture.supplyAsync(() -> {
                ChatModel model = modelFactory.createChatModel(provider);
                return model.chat(UserMessage.from(message)).aiMessage().text();
            }))
            .toArray(CompletableFuture[]::new);

        // 返回最快完成的结果
        return CompletableFuture.anyOf(futures)
            .thenApply(result -> (String) result)
            .join();
    }

    /**
     * 并行调用多个模型，合并所有结果
     */
    public Map<String, String> consultAllModels(String message) {
        List<String> providers = List.of("deepseek", "qianwen", "openai");

        Map<String, CompletableFuture<String>> futures = new HashMap<>();
        for (String provider : providers) {
            futures.put(provider, CompletableFuture.supplyAsync(() -> {
                ChatModel model = modelFactory.createChatModel(provider);
                return model.chat(UserMessage.from(message)).aiMessage().text();
            }));
        }

        // 等待所有结果
        Map<String, String> results = new HashMap<>();
        for (Map.Entry<String, CompletableFuture<String>> entry : futures.entrySet()) {
            try {
                results.put(entry.getKey(), entry.getValue().get(30, TimeUnit.SECONDS));
            } catch (Exception e) {
                results.put(entry.getKey(), "调用失败: " + e.getMessage());
            }
        }

        return results;
    }
}
```

### 系统提示词配置

为模型设置系统提示词，定义 AI 助手的角色和行为：

```java
@Service
@RequiredArgsConstructor
public class CustomPromptService {

    private final ModelFactory modelFactory;

    /**
     * 使用系统提示词的对话
     */
    public String chatWithSystemPrompt(String userMessage, String systemPrompt) {
        ChatModel model = modelFactory.createChatModel("deepseek");

        // 1.14.1：使用可变参数或 List 调用 chat()
        ChatResponse response = model.chat(
            SystemMessage.from(systemPrompt),
            UserMessage.from(userMessage)
        );

        return response.aiMessage().text();
    }

    /**
     * 代码助手
     */
    public String codeAssistant(String question) {
        String systemPrompt = """
            你是一个专业的编程助手，精通 Java、Spring Boot、Vue.js 等技术。
            请按以下规则回答：
            1. 代码使用 Markdown 格式
            2. 解释清晰简洁
            3. 提供最佳实践建议
            4. 注意代码安全性
            """;

        return chatWithSystemPrompt(question, systemPrompt);
    }

    /**
     * 翻译助手
     */
    public String translator(String text, String targetLanguage) {
        String systemPrompt = String.format("""
            你是一个专业翻译，请将用户输入翻译成%s。
            要求：
            1. 保持原文风格
            2. 翻译准确自然
            3. 只返回翻译结果，不要解释
            """, targetLanguage);

        return chatWithSystemPrompt(text, systemPrompt);
    }
}
```

### 自定义模型工厂

如果需要支持其他模型提供商，可以扩展 ModelFactory：

```java
@Component
public class ExtendedModelFactory extends ModelFactory {

    public ExtendedModelFactory(LangChain4jProperties properties) {
        super(properties);
    }

    /**
     * 创建自定义模型
     */
    public ChatModel createCustomModel(String providerCode, String modelName) {
        // 先尝试使用内置提供商
        try {
            return super.createChatModel(providerCode, modelName);
        } catch (IllegalArgumentException e) {
            // 不是内置提供商，尝试自定义
        }

        // 自定义提供商处理
        if ("azure".equalsIgnoreCase(providerCode)) {
            return createAzureOpenAiModel(modelName);
        }

        if ("moonshot".equalsIgnoreCase(providerCode)) {
            return createMoonshotModel(modelName);
        }

        throw new IllegalArgumentException("Unknown provider: " + providerCode);
    }

    private ChatModel createAzureOpenAiModel(String modelName) {
        // Azure OpenAI 实现
        // return AzureOpenAiChatModel.builder()...
        throw new UnsupportedOperationException("Azure OpenAI not implemented");
    }

    private ChatModel createMoonshotModel(String modelName) {
        // Moonshot 实现
        // return OpenAiChatModel.builder()
        //     .baseUrl("https://api.moonshot.cn/v1")...
        throw new UnsupportedOperationException("Moonshot not implemented");
    }
}
```

## API 详解

### ModelFactory 类

模型工厂的核心类，提供创建各种模型实例的方法。

#### 构造方法

```java
public ModelFactory(LangChain4jProperties properties)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `properties` | `LangChain4jProperties` | LangChain4j 配置属性 |

#### 核心方法

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| `createChatModel(String providerCode)` | `ChatModel` | 创建同步聊天模型 |
| `createChatModel(String providerCode, String modelName)` | `ChatModel` | 创建指定名称的同步聊天模型 |
| `createChatModel(String providerCode, String modelName, ThinkingOptions thinking)` | `ChatModel` | 创建支持思考参数覆盖的同步聊天模型 |
| `createStreamingChatModel(String providerCode)` | `StreamingChatModel` | 创建流式聊天模型 |
| `createStreamingChatModel(String providerCode, String modelName)` | `StreamingChatModel` | 创建指定名称的流式聊天模型 |
| `createStreamingChatModel(String providerCode, String modelName, ThinkingOptions thinking)` | `StreamingChatModel` | 创建支持思考参数覆盖的流式聊天模型 |

### ModelProvider 枚举

定义支持的模型提供商。

```java
public enum ModelProvider {
    DEEPSEEK("deepseek", "DeepSeek", "https://api.deepseek.com"),
    QIANWEN("qianwen", "通义千问", "https://dashscope.aliyuncs.com/api/v1"),
    CLAUDE("claude", "Claude", "https://api.anthropic.com"),
    OPENAI("openai", "OpenAI", "https://api.openai.com/v1"),
    OLLAMA("ollama", "Ollama", "http://localhost:11434");

    // Getter 方法
    public String getCode();
    public String getName();
    public String getDefaultBaseUrl();

    // 静态方法
    public static ModelProvider fromCode(String code);
}
```

### LangChain4jProperties 配置类

#### ModelConfig 内部类

```java
@Data
public static class ModelConfig {
    private String apiKey;                            // API密钥
    private String baseUrl;                           // API地址
    private String modelName;                         // 模型名称
    private Double temperature = 0.7;                 // 温度参数
    private Double topP = 1.0;                        // Top P参数
    private Integer maxTokens = 2048;                 // 最大Token数
    private Boolean enabled = false;                  // 是否启用

    // 1.14.1 新增：深度思考相关配置
    private Boolean enableThinking = false;           // 是否开启深度思考
    private Integer thinkingBudgetTokens = 1024;      // 思考预算（仅 Claude/Qwen 生效）
    private String reasoningEffort;                   // OpenAI 推理强度: low|medium|high
    private Boolean returnThinking = true;            // 是否返回思考内容到客户端

    private Map<String, Object> extraParams = new HashMap<>(); // 额外参数
}
```

#### ChatConfig 内部类

```java
@Data
public static class ChatConfig {
    private Boolean streamEnabled = true;      // 是否启用流式
    private Integer historySize = 10;          // 历史消息保留数
    private Integer sessionTimeout = 30;       // 会话超时(分钟)
    private Boolean memoryEnabled = true;      // 是否启用记忆
    private String memoryStoreType = "redis";  // 存储类型
}
```

## 参数说明

### 温度参数 (Temperature)

温度参数控制模型输出的随机性：

| 范围 | 效果 | 适用场景 |
|------|------|----------|
| 0.0 - 0.3 | 输出稳定、确定性高 | 代码生成、精确问答、数据提取 |
| 0.4 - 0.7 | 平衡创造性和准确性 | 日常对话、内容创作 |
| 0.8 - 1.2 | 输出多样、有创意 | 创意写作、头脑风暴 |
| 1.3 - 2.0 | 高度随机 | 极限创意场景（谨慎使用） |

### Top P 参数

Top P（核采样）控制词汇选择范围：

| 值 | 效果 |
|----|------|
| 0.1 | 只考虑最可能的 10% 词汇，输出非常确定 |
| 0.5 | 考虑累计概率 50% 的词汇，适度多样 |
| 0.9 | 考虑累计概率 90% 的词汇，较为多样 |
| 1.0 | 考虑所有词汇，最大多样性 |

**建议**: 通常设置 Temperature 或 Top P 其中之一，不要同时调整两者。

### Max Tokens 参数

控制模型生成的最大 Token 数：

| 任务类型 | 建议值 |
|----------|--------|
| 简单问答 | 256 - 512 |
| 普通对话 | 1024 - 2048 |
| 长文生成 | 4096+ |
| 代码生成 | 2048 - 8192 |

**注意**: 不同模型的最大 Token 限制不同，请参考各模型文档。

## 最佳实践

### 1. 使用环境变量管理密钥

API 密钥是敏感信息，应通过环境变量注入：

```yaml
# 配置文件中使用环境变量
langchain4j:
  deepseek:
    api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY}
  openai:
    api-key: ${LANGCHAIN4J_OPENAI_API_KEY}
```

```bash
# 在启动脚本或 CI/CD 中设置环境变量
export LANGCHAIN4J_DEEPSEEK_API_KEY=sk-xxx
export LANGCHAIN4J_OPENAI_API_KEY=sk-yyy
```

### 2. 根据场景选择合适的模型

```java
@Service
@RequiredArgsConstructor
public class OptimalModelService {

    private final ModelFactory modelFactory;

    public ChatModel getModel(UseCase useCase) {
        return switch (useCase) {
            // 成本敏感：使用 DeepSeek 或 Qwen Turbo
            case COST_SENSITIVE -> modelFactory.createChatModel("deepseek");

            // 高质量：使用 GPT-4 或 Claude
            case HIGH_QUALITY -> modelFactory.createChatModel("openai", "gpt-4-turbo");

            // 代码相关：使用代码专用模型
            case CODE_RELATED -> modelFactory.createChatModel("deepseek", "deepseek-coder");

            // 隐私敏感：使用本地模型
            case PRIVACY_SENSITIVE -> modelFactory.createChatModel("ollama");

            // 快速响应：使用轻量模型
            case FAST_RESPONSE -> modelFactory.createChatModel("qianwen", "qwen-turbo");

            default -> modelFactory.createChatModel("deepseek");
        };
    }
}
```

### 3. 实现超时和重试机制

```yaml
langchain4j:
  # 全局超时设置
  timeout: 60s
  # 全局重试次数
  max-retries: 3
```

```java
@Service
@RequiredArgsConstructor
public class RobustAiService {

    private final ModelFactory modelFactory;

    @Retryable(
        value = RuntimeException.class,
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String chat(String message) {
        ChatModel model = modelFactory.createChatModel("deepseek");
        return model.chat(UserMessage.from(message)).aiMessage().text();
    }

    @Recover
    public String recoverChat(RuntimeException e, String message) {
        // 降级处理
        ChatModel fallback = modelFactory.createChatModel("qianwen");
        return fallback.chat(UserMessage.from(message)).aiMessage().text();
    }
}
```

### 4. 启用调试日志

开发环境中启用详细日志：

```yaml
logging:
  level:
    plus.ruoyi.common.langchain4j: DEBUG
    dev.langchain4j: DEBUG
```

这将自动启用请求/响应日志（通过 `log.isDebugEnabled()` 检测）。

### 5. 缓存模型实例

对于频繁使用的模型，可以考虑缓存实例：

```java
@Service
public class CachedModelService {

    private final ModelFactory modelFactory;
    private final Map<String, ChatModel> modelCache = new ConcurrentHashMap<>();

    public CachedModelService(ModelFactory modelFactory) {
        this.modelFactory = modelFactory;
    }

    public ChatModel getCachedModel(String provider) {
        return modelCache.computeIfAbsent(provider, modelFactory::createChatModel);
    }

    public ChatModel getCachedModel(String provider, String modelName) {
        String key = provider + ":" + modelName;
        return modelCache.computeIfAbsent(key,
            k -> modelFactory.createChatModel(provider, modelName));
    }
}
```

### 6. Token 使用量监控

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class MonitoredAiService {

    private final ModelFactory modelFactory;
    private final MeterRegistry meterRegistry;

    public String chatWithMonitoring(String message) {
        ChatModel model = modelFactory.createChatModel("deepseek");

        long start = System.currentTimeMillis();
        ChatResponse response = model.chat(UserMessage.from(message));
        long duration = System.currentTimeMillis() - start;

        // 记录指标
        meterRegistry.counter("ai.requests", "provider", "deepseek").increment();
        meterRegistry.timer("ai.response.time").record(duration, TimeUnit.MILLISECONDS);

        if (response.tokenUsage() != null) {
            meterRegistry.counter("ai.tokens.input")
                .increment(response.tokenUsage().inputTokenCount());
            meterRegistry.counter("ai.tokens.output")
                .increment(response.tokenUsage().outputTokenCount());
        }

        return response.aiMessage().text();
    }
}
```

## 常见问题

### 1. 模型创建失败

**问题描述**: 调用 `createChatModel` 时抛出异常。

**可能原因:**
- API Key 未配置或无效
- 模型未启用（`enabled: false`）
- 网络连接问题
- 提供商代码拼写错误

**解决方案:**

```yaml
# 检查配置是否正确
langchain4j:
  deepseek:
    enabled: true        # 确保启用
    api-key: sk-xxx      # 确保 Key 有效
```

```java
// 在代码中处理异常
try {
    ChatModel model = modelFactory.createChatModel("deepseek");
} catch (IllegalStateException e) {
    log.error("API Key 未配置: {}", e.getMessage());
} catch (IllegalArgumentException e) {
    log.error("未知的提供商: {}", e.getMessage());
}
```

### 2. 请求超时

**问题描述**: 模型响应时间过长，导致超时。

**可能原因:**
- 网络延迟
- 模型负载高
- 输入内容过长
- 超时配置过短

**解决方案:**

```yaml
langchain4j:
  # 增加超时时间
  timeout: 120s
  # 增加重试次数
  max-retries: 5
```

```java
// Ollama 本地模型需要更长超时
// 框架已自动设置 5 分钟超时
ChatModel model = modelFactory.createChatModel("ollama");
```

### 3. 流式响应中断

**问题描述**: 流式响应过程中突然中断。

**可能原因:**
- 网络不稳定
- 服务器端断开连接
- Token 配额耗尽

**解决方案:**

```java
streamingModel.chat(List.of(UserMessage.from(message)),
    new StreamingChatResponseHandler() {
        @Override
        public void onPartialResponse(String partialResponse) {
            // 正常接收增量
        }

        @Override
        public void onCompleteResponse(ChatResponse completeResponse) {
            // 完成
        }

        @Override
        public void onError(Throwable error) {
            if (error instanceof SocketTimeoutException) {
                log.warn("连接超时，尝试重新连接");
                // 重试逻辑
            } else if (error.getMessage().contains("quota")) {
                log.error("配额不足: {}", error.getMessage());
                // 切换到其他模型
            }
        }
    });
```

### 4. 如何获取各提供商的 API Key

| 提供商 | 申请地址 | 说明 |
|-------|---------|------|
| DeepSeek | https://platform.deepseek.com | 注册后在控制台创建 API Key |
| OpenAI | https://platform.openai.com | 需要海外手机号验证 |
| 通义千问 | https://dashscope.console.aliyun.com | 阿里云账号直接开通 |
| Claude | https://console.anthropic.com | 需要申请访问权限 |
| Ollama | 无需 API Key | 本地部署，直接使用 |

### 5. 本地 Ollama 部署

**安装步骤:**

```bash
# Linux/Mac 安装
curl -fsSL https://ollama.com/install.sh | sh

# Windows 安装
# 下载安装包: https://ollama.com/download

# 下载模型
ollama pull llama3.2
ollama pull mistral
ollama pull codellama

# 启动服务
ollama serve
```

**验证服务:**

```bash
# 测试 API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello"
}'
```

### 6. 中文乱码问题

**问题描述**: 模型返回的中文显示为乱码。

**解决方案:**

```yaml
# 确保应用编码为 UTF-8
server:
  servlet:
    encoding:
      charset: UTF-8
      force: true
```

```java
// 确保响应编码正确
@RestController
public class AiController {

    @PostMapping(value = "/chat", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public String chat(@RequestBody String message) {
        // ...
    }
}
```

## 类型定义

### 完整类型定义

```java
/**
 * 模型提供商枚举
 */
public enum ModelProvider {
    DEEPSEEK("deepseek", "DeepSeek", "https://api.deepseek.com"),
    QIANWEN("qianwen", "通义千问", "https://dashscope.aliyuncs.com/api/v1"),
    CLAUDE("claude", "Claude", "https://api.anthropic.com"),
    OPENAI("openai", "OpenAI", "https://api.openai.com/v1"),
    OLLAMA("ollama", "Ollama", "http://localhost:11434");

    private final String code;
    private final String name;
    private final String defaultBaseUrl;

    public static ModelProvider fromCode(String code) {
        for (ModelProvider provider : values()) {
            if (provider.getCode().equalsIgnoreCase(code)) {
                return provider;
            }
        }
        throw new IllegalArgumentException("Unknown model provider: " + code);
    }
}

/**
 * LangChain4j 配置属性
 */
@Data
@ConfigurationProperties(prefix = "langchain4j")
public class LangChain4jProperties {
    private Boolean enabled = true;
    private String defaultProvider = "deepseek";
    private String defaultModel = "deepseek-chat";
    private Duration timeout = Duration.ofSeconds(60);
    private Integer maxRetries = 3;

    private ModelConfig deepseek = new ModelConfig();
    private ModelConfig qianwen = new ModelConfig();
    private ModelConfig claude = new ModelConfig();
    private ModelConfig openai = new ModelConfig();
    private ModelConfig ollama = new ModelConfig();

    private ChatConfig chat = new ChatConfig();
    private EmbeddingConfig embedding = new EmbeddingConfig();
    private RagConfig rag = new RagConfig();

    @Data
    public static class ModelConfig {
        private String apiKey;
        private String baseUrl;
        private String modelName;
        private Double temperature = 0.7;
        private Double topP = 1.0;
        private Integer maxTokens = 2048;
        private Boolean enabled = false;

        // 1.14.1 新增：深度思考相关
        private Boolean enableThinking = false;
        private Integer thinkingBudgetTokens = 1024;
        private String reasoningEffort;
        private Boolean returnThinking = true;

        private Map<String, Object> extraParams = new HashMap<>();
    }

    @Data
    public static class ChatConfig {
        private Boolean streamEnabled = true;
        private Integer historySize = 10;
        private Integer sessionTimeout = 30;
        private Boolean memoryEnabled = true;
        private String memoryStoreType = "redis";
    }

    @Data
    public static class EmbeddingConfig {
        private String modelName = "text-embedding-3-small";
        private Integer dimension = 1536;
        private Integer batchSize = 100;
    }

    @Data
    public static class RagConfig {
        private Boolean enabled = false;
        private Integer maxResults = 5;
        private Double minScore = 0.7;
        private Integer chunkSize = 500;
        private Integer chunkOverlap = 50;
        private String vectorStoreType = "memory";
        private MilvusConfig milvus = new MilvusConfig();
    }

    @Data
    public static class MilvusConfig {
        private String host = "localhost";
        private Integer port = 19530;
        private String collectionName = "documents";
        private String databaseName = "default";
    }
}
```

## 版本迁移

`ruoyi-common-langchain4j` 已从 LangChain4j `0.35.0` 升级到 `1.14.1`，本次升级带来了大量 Breaking Changes，主要集中在「模型接口重命名」「响应类型统一」「流式回调拆分」三个维度。下面的对照表覆盖了所有从旧版本迁移到新版本时需要关注的 API 变更。

### 接口类重命名

| 旧 API (0.35.0) | 新 API (1.14.1) | 说明 |
|----------------|----------------|------|
| `ChatLanguageModel` | `ChatModel` | 同步聊天模型接口（包路径 `dev.langchain4j.model.chat`） |
| `StreamingChatLanguageModel` | `StreamingChatModel` | 流式聊天模型接口（包路径同上） |
| `EmbeddingModel` | `EmbeddingModel` | 嵌入模型接口未变 |
| `Response<AiMessage>` | `ChatResponse` | 响应类型统一（包路径 `dev.langchain4j.model.chat.response`） |
| `StreamingResponseHandler<AiMessage>` | `StreamingChatResponseHandler` | 流式回调接口，新增 `onPartialThinking` 方法 |

### 方法签名变更

| 旧调用 | 新调用 |
|--------|--------|
| `model.generate(String text)` | `model.chat(UserMessage.from(text))` |
| `model.generate(List<ChatMessage>)` | `model.chat(List<ChatMessage>)` |
| `response.content()` | `response.aiMessage()` |
| `response.content().text()` | `response.aiMessage().text()` |
| `streamingModel.generate(msg, handler)` | `streamingModel.chat(List.of(msg), handler)` |
| `handler.onNext(String token)` | `handler.onPartialResponse(String partialResponse)` |
| `handler.onComplete(Response<AiMessage>)` | `handler.onCompleteResponse(ChatResponse)` |

### 流式回调拆分

`StreamingChatResponseHandler` 把回调拆分为「内容增量」与「思考增量」两个独立方法，便于深度思考场景按阶段处理：

```java
// 0.35.0 旧版：所有 token 走同一个回调
streamingModel.generate("...", new StreamingResponseHandler<AiMessage>() {
    @Override
    public void onNext(String token) { ... }

    @Override
    public void onComplete(Response<AiMessage> response) { ... }
});

// 1.14.1 新版：内容与思考分通道
streamingModel.chat(List.of(UserMessage.from("...")),
    new StreamingChatResponseHandler() {
        @Override
        public void onPartialResponse(String partialResponse) { /* 最终回复增量 */ }

        @Override
        public void onPartialThinking(PartialThinking partialThinking) { /* 推理增量 */ }

        @Override
        public void onCompleteResponse(ChatResponse completeResponse) { /* 完成 */ }

        @Override
        public void onError(Throwable error) { /* 异常 */ }
    });
```

`onPartialThinking` 是 1.14.1 新增的回调，仅在以下条件同时满足时触发：

- 使用的是推理模型（`deepseek-reasoner` / `o1-mini` / Claude Extended Thinking 等）
- 配置 `enable-thinking: true`
- 配置 `return-thinking: true`

不满足任一条件时，新版回调行为与旧版完全一致，无需额外兼容。

### TokenUsage 字段重命名

| 旧字段 (0.35.0) | 新字段 (1.14.1) |
|---------------|---------------|
| `tokenUsage.inputTokenCount()` | `tokenUsage.inputTokenCount()` 保持不变 |
| `tokenUsage.outputTokenCount()` | `tokenUsage.outputTokenCount()` 保持不变 |
| `tokenUsage.totalTokenCount()` | `tokenUsage.totalTokenCount()` 保持不变 |

TokenUsage 接口保持兼容，无需修改。

### 深度思考相关新 API

1.14.1 全新引入的 API，0.35.0 中不存在对应实现：

| 新 API | 说明 |
|--------|------|
| `AiMessage.thinking()` | 同步响应中获取推理内容 |
| `OpenAiChatModelBuilder.returnThinking(Boolean)` | OpenAI 兼容协议下解析 `reasoning_content` |
| `OpenAiChatModelBuilder.reasoningEffort(String)` | OpenAI 推理强度 |
| `AnthropicChatModelBuilder.thinkingType(String)` | Claude Extended Thinking 协议 |
| `AnthropicChatModelBuilder.thinkingBudgetTokens(Integer)` | Claude 思考预算 |
| `QwenChatRequestParameters.enableThinking(Boolean)` | 通义千问启用思考 |
| `QwenChatRequestParameters.thinkingBudget(Integer)` | 通义千问思考预算 |
| `OllamaChatModelBuilder.think(Boolean)` | Ollama 暴露思考块 |
| `PartialThinking` | 流式思考增量类型 |

### 完整迁移示例

下面是一个完整的迁移对照示例，展示如何把 0.35.0 的同步对话代码升级到 1.14.1：

```java
// ========== 0.35.0 旧代码 ==========
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.output.Response;

public String oldChat(String question) {
    ChatLanguageModel model = OpenAiChatModel.builder()
        .apiKey("sk-xxx")
        .modelName("gpt-4o-mini")
        .build();

    Response<AiMessage> response = model.generate(question);
    return response.content().text();
}

// ========== 1.14.1 新代码 ==========
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.response.ChatResponse;

public String newChat(String question) {
    ChatModel model = OpenAiChatModel.builder()
        .apiKey("sk-xxx")
        .modelName("gpt-4o-mini")
        .build();

    ChatResponse response = model.chat(UserMessage.from(question));
    return response.aiMessage().text();
}
```

### 迁移建议

1. **先升级依赖再修改代码**：先在 BOM 中把 langchain4j 版本升级到 1.14.1，让编译报错把所有需要修改的位置标出来，再逐个修复
2. **优先使用框架封装**：业务代码尽量通过 `ModelFactory` + `ChatService` 调用，框架内部已经完成 API 适配，业务侧无需感知底层变化
3. **流式回调全量重写**：旧版 `StreamingResponseHandler` 与新版 `StreamingChatResponseHandler` 完全不兼容，必须重写所有自定义流式处理器
4. **响应字段统一**：把 `response.content().text()` 全局替换为 `response.aiMessage().text()`，把 `Response<AiMessage>` 替换为 `ChatResponse`
5. **深度思考独立梳理**：1.14.1 引入的 thinking 能力是新特性，建议作为单独的开发任务推进，不要混入兼容性迁移

## 总结

ModelFactory 是 LangChain4j 模块的核心组件，通过工厂模式为应用提供统一的 AI 模型访问接口。它支持 DeepSeek、通义千问、Claude、OpenAI、Ollama 五大主流模型提供商，并提供灵活的配置选项和扩展能力。

**主要优势:**

1. **统一接口** - 一套 API 对接多个模型提供商
2. **灵活切换** - 运行时动态选择最合适的模型
3. **配置简单** - 基于 Spring Boot 自动配置
4. **可靠稳定** - 内置重试和超时机制
5. **易于扩展** - 可自定义添加新的模型提供商

通过合理使用 ModelFactory，你可以轻松构建具有 AI 能力的应用，并根据不同的业务场景选择最合适的模型。
