# LangChain4j AI 集成模块

企业级 LLM 应用开发框架 - 提供统一的大模型接入能力

## 📖 模块简介

`ruoyi-common-langchain4j` 模块集成了 [LangChain4j](https://github.com/langchain4j/langchain4j) 框架,提供企业级大语言模型应用开发能力。

### 核心特性

- ✅ **多模型支持**: 统一接口支持 OpenAI、Claude、DeepSeek、通义千问、Ollama 等主流大模型
- ✅ **流式聊天**: 支持流式响应,实时返回AI回答
- ✅ **WebSocket集成**: 通过 WebSocket 实现实时 AI 聊天
- ✅ **对话记忆**: 基于 Redis 的会话记忆管理,支持上下文连贯对话
- ✅ **RAG支持**: 检索增强生成,结合知识库提升回答准确性
- ✅ **Token统计**: 实时统计 Token 使用情况
- ✅ **环境变量配置**: 支持通过环境变量配置 API 密钥,避免敏感信息硬编码
- ✅ **功能开关**: 提供 `LANGCHAIN4J_ENABLED` 开关,可动态启用/禁用

## 🚀 快速开始

### 1. 添加依赖

在需要使用 AI 功能的模块 `pom.xml` 中添加:

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-langchain4j</artifactId>
</dependency>
```

### 2. 配置文件

在 `application-dev.yml` 中配置:

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
推荐使用环境变量配置 API 密钥,避免敏感信息硬编码:
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
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class AiStreamService {

    private final ChatService chatService;

    /**
     * 流式对话 (SSE)
     */
    public Flux<String> chatStream(String message) {
        ChatRequest request = new ChatRequest();
        request.setMessage(message);
        request.setSessionId("stream-" + System.currentTimeMillis());

        return chatService.chatStream(request);
    }
}
```

### 5. WebSocket 实时聊天

前端通过 WebSocket 连接实现实时 AI 聊天:

```javascript
// 前端 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080/ws');

// 发送消息
ws.send(JSON.stringify({
  type: 'ai_chat',
  content: '你好,请介绍一下自己'
}));

// 接收 AI 响应
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('AI:', data.content);
};
```

后端 WebSocket 处理器已自动配置,无需额外编码。

## 📚 核心 API

### ChatService

| 方法 | 说明 |
|------|------|
| `chat(ChatRequest)` | 普通对话,返回完整响应 |
| `chatStream(ChatRequest)` | 流式对话,返回 `Flux<String>` |
| `clearHistory(sessionId)` | 清除会话历史 |
| `getHistory(sessionId)` | 获取会话历史消息 |

### ChatRequest

| 字段 | 类型 | 说明 |
|------|------|------|
| `message` | String | 用户消息内容 |
| `sessionId` | String | 会话ID (相同ID保留上下文) |
| `provider` | String | 模型提供商 (可选,默认使用配置) |
| `modelName` | String | 模型名称 (可选,默认使用配置) |
| `temperature` | Double | 温度参数 (可选,默认0.7) |
| `maxTokens` | Integer | 最大Token数 (可选) |

### ChatResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| `content` | String | AI 回复内容 |
| `sessionId` | String | 会话ID |
| `tokenUsage` | TokenUsage | Token 使用统计 |
| `finishReason` | String | 完成原因 |

## 🔧 高级功能

### 1. 多模型切换

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
```

### 2. RAG 检索增强生成

```java
import plus.ruoyi.common.langchain4j.core.rag.RagService;
import plus.ruoyi.common.langchain4j.domain.KnowledgeDocument;

@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private final RagService ragService;
    private final ChatService chatService;

    /**
     * 添加知识库文档
     */
    public void addDocument(String content, Map<String, String> metadata) {
        KnowledgeDocument document = new KnowledgeDocument();
        document.setContent(content);
        document.setMetadata(metadata);

        ragService.addDocument(document);
    }

    /**
     * 基于知识库的问答
     */
    public String askWithKnowledge(String question) {
        // RAG 会自动检索相关文档并增强提示词
        ChatRequest request = new ChatRequest();
        request.setMessage(question);
        request.setSessionId("rag-" + System.currentTimeMillis());

        ChatResponse response = chatService.chat(request);
        return response.getContent();
    }
}
```

### 3. Prompt 模板管理

```java
import plus.ruoyi.common.langchain4j.utils.PromptUtils;

public class PromptService {

    /**
     * 使用 Prompt 模板
     */
    public String generateCode(String requirement) {
        String template = """
            你是一个专业的 Java 开发工程师。
            请根据以下需求生成代码:

            需求: {{requirement}}

            要求:
            1. 使用 Spring Boot 3
            2. 遵循最佳实践
            3. 添加详细注释
            """;

        String prompt = PromptUtils.format(template, Map.of(
            "requirement", requirement
        ));

        ChatRequest request = new ChatRequest();
        request.setMessage(prompt);

        return chatService.chat(request).getContent();
    }
}
```

### 4. Token 统计

```java
ChatResponse response = chatService.chat(request);

// 获取 Token 使用情况
TokenUsage usage = response.getTokenUsage();
log.info("输入 Token: {}", usage.getInputTokenCount());
log.info("输出 Token: {}", usage.getOutputTokenCount());
log.info("总计 Token: {}", usage.getTotalTokenCount());
```

### 5. 会话管理

```java
// 创建新会话
String sessionId = UUID.randomUUID().toString();

// 多轮对话
chatService.chat(new ChatRequest(sessionId, "我想学习 Spring Boot"));
chatService.chat(new ChatRequest(sessionId, "从哪里开始学习?"));  // 有上下文
chatService.chat(new ChatRequest(sessionId, "推荐一些资料"));    // 有上下文

// 查看历史
List<ChatMessage> history = chatService.getHistory(sessionId);

// 清除历史
chatService.clearHistory(sessionId);
```

## 🎨 前端集成

### AAiChat 组件

框架提供了完整的 AI 聊天组件:

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

组件特性:
- ✅ 流式响应显示
- ✅ Markdown 渲染
- ✅ 代码高亮
- ✅ 历史记录
- ✅ 会话管理
- ✅ 复制/重试功能

## 🛠️ 故障排查

### 1. 连接失败

**错误**: `Connection refused` 或 `API key invalid`

**解决方案**:
- 检查 API 密钥是否正确
- 检查网络连接是否正常
- 检查 base-url 是否正确
- 对于国内用户,OpenAI 可能需要代理

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
```

### 4. RAG 检索不准确

**原因**: 向量相似度阈值过高

**解决方案**:
```yaml
langchain4j:
  rag:
    min-score: 0.5  # 降低最小相似度分数
    max-results: 10  # 增加检索结果数量
```

## 💡 应用场景

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
            "生成一个名为 %s 的实体类,包含以下字段: %s",
            tableName, String.join(", ", columns)
        );

        ChatRequest request = new ChatRequest();
        request.setMessage(prompt);
        request.setTemperature(0.2);  // 降低创造性,提高准确性

        return chatService.chat(request).getContent();
    }
}
```

### 3. 文档问答系统

```java
@Service
public class DocumentQA {

    @Autowired
    private RagService ragService;
    @Autowired
    private ChatService chatService;

    public void indexDocuments(List<String> documents) {
        documents.forEach(doc -> {
            KnowledgeDocument knowledge = new KnowledgeDocument();
            knowledge.setContent(doc);
            ragService.addDocument(knowledge);
        });
    }

    public String ask(String question) {
        ChatRequest request = new ChatRequest();
        request.setMessage(question);

        return chatService.chat(request).getContent();
    }
}
```

## 📄 技术栈

- **LangChain4j**: 企业级 LLM 应用开发框架
- **Spring Boot**: 自动配置和依赖注入
- **Redis**: 会话记忆存储
- **WebSocket**: 实时通信
- **Reactor**: 响应式编程

## 📖 参考资料

- [LangChain4j 官方文档](https://docs.langchain4j.dev/)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [通义千问 API 文档](https://help.aliyun.com/zh/dashscope/)

## 🎯 性能优化

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
