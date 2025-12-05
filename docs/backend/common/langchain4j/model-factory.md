# 模型工厂

## 介绍

ModelFactory 是 LangChain4j 模块的核心组件，负责创建和管理各种 AI 模型实例。它支持多个主流模型提供商，并提供统一的接口来创建同步和流式聊天模型。

**核心特性:**

- **多提供商支持** - 支持 DeepSeek、通义千问、Claude、OpenAI、Ollama
- **统一接口** - 无论使用哪个提供商，API 调用方式一致
- **自动配置** - 根据配置文件自动初始化模型参数
- **灵活切换** - 运行时动态切换不同的模型提供商

## 支持的模型提供商

| 提供商 | 代码 | 默认模型 | 说明 |
|-------|------|---------|------|
| DeepSeek | `deepseek` | `deepseek-chat` | 国产大模型，性价比高 |
| 通义千问 | `qianwen` | `qwen-turbo` | 阿里云大模型 |
| Claude | `claude` | `claude-3-5-sonnet-20241022` | Anthropic 旗下模型 |
| OpenAI | `openai` | `gpt-4o-mini` | OpenAI 官方模型 |
| Ollama | `ollama` | `llama3.2` | 本地部署方案 |

## 基本用法

### 创建聊天模型

```java
@Autowired
private ModelFactory modelFactory;

// 使用默认配置创建模型
ChatLanguageModel model = modelFactory.createChatModel("deepseek");

// 指定具体模型名称
ChatLanguageModel model = modelFactory.createChatModel("openai", "gpt-4");
```

### 创建流式模型

```java
// 创建流式聊天模型
StreamingChatLanguageModel streamingModel =
    modelFactory.createStreamingChatModel("deepseek");

// 指定模型名称
StreamingChatLanguageModel streamingModel =
    modelFactory.createStreamingChatModel("qianwen", "qwen-max");
```

## 配置示例

### 单个模型配置

```yaml
langchain4j:
  default-provider: deepseek

  deepseek:
    enabled: true
    api-key: sk-your-deepseek-key
    base-url: https://api.deepseek.com
    model-name: deepseek-chat
    temperature: 0.7
    max-tokens: 4096
```

### 多模型配置

```yaml
langchain4j:
  default-provider: deepseek
  timeout: 60s
  max-retries: 3

  # DeepSeek 配置
  deepseek:
    enabled: true
    api-key: ${DEEPSEEK_API_KEY}
    model-name: deepseek-chat
    temperature: 0.7

  # OpenAI 配置
  openai:
    enabled: true
    api-key: ${OPENAI_API_KEY}
    model-name: gpt-4o-mini
    temperature: 0.7

  # 通义千问配置
  qianwen:
    enabled: true
    api-key: ${QIANWEN_API_KEY}
    model-name: qwen-turbo
    temperature: 0.7
```

## 使用场景

### 动态切换模型

根据业务需求动态选择不同的模型：

```java
@Service
@RequiredArgsConstructor
public class AiService {

    private final ModelFactory modelFactory;

    public String chat(String message, String provider) {
        // 根据参数选择模型
        ChatLanguageModel model = modelFactory.createChatModel(provider);

        Response<AiMessage> response = model.generate(message);
        return response.content().text();
    }

    // 简单任务使用快速模型
    public String quickAnswer(String question) {
        ChatLanguageModel model = modelFactory.createChatModel("deepseek");
        return model.generate(question).content().text();
    }

    // 复杂任务使用高级模型
    public String complexAnalysis(String content) {
        ChatLanguageModel model = modelFactory.createChatModel("openai", "gpt-4");
        return model.generate(content).content().text();
    }
}
```

### 模型降级策略

主模型失败时自动切换到备用模型：

```java
public String chatWithFallback(String message) {
    try {
        // 优先使用主模型
        ChatLanguageModel primaryModel = modelFactory.createChatModel("openai");
        return primaryModel.generate(message).content().text();
    } catch (Exception e) {
        log.warn("主模型调用失败，切换到备用模型", e);

        // 降级到备用模型
        ChatLanguageModel fallbackModel = modelFactory.createChatModel("deepseek");
        return fallbackModel.generate(message).content().text();
    }
}
```

### 本地模型部署

使用 Ollama 部署本地模型：

```yaml
langchain4j:
  ollama:
    enabled: true
    base-url: http://localhost:11434
    model-name: llama3.2
    temperature: 0.7
```

```java
// 使用本地模型，无需 API Key
ChatLanguageModel localModel = modelFactory.createChatModel("ollama");
String response = localModel.generate("你好").content().text();
```

## 配置参数说明

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `enabled` | Boolean | 是否启用该模型 | `false` |
| `api-key` | String | API 密钥 | - |
| `base-url` | String | API 基础地址 | 根据提供商 |
| `model-name` | String | 模型名称 | 根据提供商 |
| `temperature` | Double | 温度参数（0-2） | `0.7` |
| `top-p` | Double | Top P 参数（0-1） | `1.0` |
| `max-tokens` | Integer | 最大生成 Token 数 | `2048` |

**温度参数说明：**
- **0.0-0.3**: 输出稳定、准确，适合代码生成、精确问答
- **0.5-0.8**: 平衡准确性和多样性，适合日常对话
- **1.0-2.0**: 输出随机、有创意，适合创意写作

## 最佳实践

### 1. 使用环境变量管理密钥

```yaml
deepseek:
  api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY}

openai:
  api-key: ${LANGCHAIN4J_OPENAI_API_KEY}
```

### 2. 根据场景选择模型

```java
// 简单任务 - DeepSeek
ChatLanguageModel simpleModel = modelFactory.createChatModel("deepseek");

// 专业领域 - GPT-4
ChatLanguageModel professionalModel =
    modelFactory.createChatModel("openai", "gpt-4");

// 隐私敏感 - 本地 Ollama
ChatLanguageModel privateModel = modelFactory.createChatModel("ollama");
```

### 3. 设置合理的超时和重试

```yaml
langchain4j:
  timeout: 60s      # 超时时间
  max-retries: 3    # 最大重试次数
```

### 4. 启用调试日志

```yaml
logging:
  level:
    plus.ruoyi.common.langchain4j: DEBUG
```

## 常见问题

### 1. 模型创建失败

**原因：**
- API Key 无效
- 模型未启用
- 网络连接问题

**解决：**

```yaml
# 检查配置
deepseek:
  enabled: true  # 确保启用
  api-key: sk-xxx  # 确保 Key 正确
```

### 2. 如何获取 API Key

| 提供商 | 申请地址 |
|-------|---------|
| DeepSeek | https://platform.deepseek.com |
| OpenAI | https://platform.openai.com |
| 通义千问 | https://dashscope.console.aliyun.com |

### 3. 本地模型部署

安装 Ollama 并下载模型：

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 下载模型
ollama pull llama3.2

# 启动服务
ollama serve
```

## 总结

ModelFactory 提供了统一、灵活的接口来管理多个 AI 模型提供商。通过简单的配置和 API 调用，你可以轻松地在不同模型之间切换，满足各种业务场景的需求。
