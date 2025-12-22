# 快速开始

## 介绍

LangChain4j 是一个用于开发由大型语言模型(LLM)驱动的应用程序的 Java 框架。RuoYi-Plus 框架已将 LangChain4j 深度集成到 `ruoyi-common-langchain4j` 模块中，提供开箱即用的 AI 对话能力。

本文档将指导你快速上手使用 LangChain4j 模块，从环境配置到发起第一次对话。

**核心特性:**

- **多模型支持** - 支持 DeepSeek、通义千问、Claude、OpenAI、Ollama 等主流 AI 模型
- **对话记忆** - 内置会话管理，支持多轮连续对话，记忆上下文信息
- **流式响应** - 支持流式输出，提升用户体验
- **自动配置** - Spring Boot 自动配置，零代码即可启用
- **灵活扩展** - 支持自定义模型提供商、系统提示词、温度参数等

## 环境要求

在开始之前，请确保你的环境满足以下要求：

| 项目 | 要求 | 说明 |
|------|------|------|
| Java | 17+ | 项目基于 Java 17 构建 |
| Spring Boot | 3.5.6+ | 框架版本 |
| Redis | 任意版本 | 用于存储对话历史（可选） |
| API Key | 至少一个 | DeepSeek/OpenAI/通义千问等 |

## 第一步：添加依赖

### Maven 依赖

在你的 `pom.xml` 中添加 LangChain4j 模块依赖：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-langchain4j</artifactId>
</dependency>
```

**说明：**
- 该依赖已经在项目的 BOM 中定义版本，无需手动指定 `<version>`
- 依赖会自动引入 LangChain4j 核心库和相关工具类

### 自动配置原理

添加依赖后，Spring Boot 会自动加载 `LangChain4jAutoConfiguration` 配置类，该类通过 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 自动注册。

配置类会注册以下核心 Bean：

| Bean | 说明 | 依赖 |
|------|------|------|
| `ModelFactory` | 模型工厂，创建各种 AI 模型实例 | - |
| `RedisChatStore` | Redis 存储，持久化对话历史 | Redis |
| `ChatMemoryManager` | 对话记忆管理器 | `RedisChatStore` |
| `ChatService` | 核心对话服务 | `ModelFactory`, `ChatMemoryManager` |
| `EmbeddingService` | 向量嵌入服务 | `ModelFactory` |
| `RagService` | RAG 检索增强服务（可选） | `EmbeddingService` |

## 第二步：配置 API Key

### 配置文件位置

LangChain4j 模块使用独立的配置文件 `langchain4j.yml`，位于：

```
ruoyi-common/ruoyi-common-langchain4j/src/main/resources/langchain4j.yml
```

### 基础配置

最小化配置示例（使用 DeepSeek）：

```yaml
langchain4j:
  # 启用模块
  enabled: true

  # 默认模型提供商
  default-provider: deepseek

  # 默认模型名称
  default-model: deepseek-chat

  # DeepSeek 配置
  deepseek:
    enabled: true
    api-key: sk-你的API密钥
    base-url: https://api.deepseek.com
    model-name: deepseek-chat
    temperature: 0.7
    max-tokens: 4096
```

### 完整配置示例

支持多个模型提供商的完整配置：

```yaml
langchain4j:
  # 总开关
  enabled: true

  # 默认模型提供商: openai, deepseek, qianwen, ollama
  default-provider: deepseek

  # 默认模型名称
  default-model: deepseek-chat

  # 请求超时时间
  timeout: 60s

  # 最大重试次数
  max-retries: 3

  # DeepSeek 配置
  deepseek:
    enabled: true
    api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY:sk-your-key}
    base-url: https://api.deepseek.com
    model-name: deepseek-chat
    temperature: 0.7
    top-p: 1.0
    max-tokens: 4096

  # OpenAI 配置
  openai:
    enabled: false
    api-key: ${LANGCHAIN4J_OPENAI_API_KEY:sk-your-key}
    base-url: https://api.openai.com/v1
    model-name: gpt-4o-mini
    temperature: 0.7
    max-tokens: 2048

  # 通义千问配置
  qianwen:
    enabled: false
    api-key: ${LANGCHAIN4J_QIANWEN_API_KEY:sk-your-key}
    model-name: qwen-turbo
    temperature: 0.7
    max-tokens: 2048

  # Ollama 本地部署配置
  ollama:
    enabled: false
    base-url: http://localhost:11434
    model-name: llama3.2
    temperature: 0.7
    max-tokens: 2048

  # 对话配置
  chat:
    stream-enabled: true        # 是否启用流式响应
    history-size: 10            # 历史消息保留数量
    session-timeout: 30         # 会话超时时间（分钟）
    memory-enabled: true        # 是否启用记忆管理
    memory-store-type: redis    # 存储类型: memory, redis

  # 嵌入配置（用于 RAG）
  embedding:
    model-name: text-embedding-3-small
    dimension: 1536
    batch-size: 100

  # RAG 配置（默认关闭）
  rag:
    enabled: false
    max-results: 5
    min-score: 0.7
    chunk-size: 500
    chunk-overlap: 50
    vector-store-type: memory
```

### 环境变量配置

为了安全起见，建议使用环境变量配置 API Key：

**Linux/Mac:**

```bash
export LANGCHAIN4J_DEEPSEEK_API_KEY="sk-your-deepseek-key"
export LANGCHAIN4J_OPENAI_API_KEY="sk-your-openai-key"
export LANGCHAIN4J_QIANWEN_API_KEY="sk-your-qianwen-key"
```

**Windows (PowerShell):**

```powershell
$env:LANGCHAIN4J_DEEPSEEK_API_KEY="sk-your-deepseek-key"
$env:LANGCHAIN4J_OPENAI_API_KEY="sk-your-openai-key"
```

**application.yml 覆盖配置:**

```yaml
langchain4j:
  deepseek:
    api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY}
```

### 配置参数说明

#### 全局配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | Boolean | `true` | 是否启用 LangChain4j 模块 |
| `default-provider` | String | `deepseek` | 默认模型提供商 |
| `default-model` | String | `deepseek-chat` | 默认模型名称 |
| `timeout` | Duration | `60s` | 请求超时时间 |
| `max-retries` | Integer | `3` | 最大重试次数 |

#### 模型配置（通用）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | Boolean | `false` | 是否启用该模型 |
| `api-key` | String | - | API 密钥 |
| `base-url` | String | - | API 基础地址 |
| `model-name` | String | - | 模型名称 |
| `temperature` | Double | `0.7` | 温度参数（0-2），越高越随机 |
| `top-p` | Double | `1.0` | Top P 参数（0-1） |
| `max-tokens` | Integer | `2048` | 最大生成 Token 数 |

#### 对话配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `chat.stream-enabled` | Boolean | `true` | 是否启用流式响应 |
| `chat.history-size` | Integer | `10` | 历史消息保留数量 |
| `chat.session-timeout` | Integer | `30` | 会话超时时间（分钟） |
| `chat.memory-enabled` | Boolean | `true` | 是否启用记忆管理 |
| `chat.memory-store-type` | String | `redis` | 存储类型: `memory`, `redis` |

## 第三步：启动应用

### 启动检查

配置完成后，启动 Spring Boot 应用，查看控制台日志：

```
========================================
LangChain4j 模块初始化完成
默认提供商: deepseek
默认模型: deepseek-chat
对话记忆功能: 已启用
对话存储类型: redis
RAG功能: 已禁用
========================================
```

如果看到以上日志，说明模块已成功初始化。

### 启动失败排查

如果模块未启动，请检查：

1. **配置文件是否正确** - 检查 `langchain4j.yml` 是否存在且格式正确
2. **总开关是否启用** - 确认 `langchain4j.enabled=true`
3. **依赖是否添加** - 确认 `ruoyi-common-langchain4j` 依赖已添加
4. **Redis 是否启动** - 如果使用 Redis 存储，确保 Redis 服务正常运行

## 第四步：发起第一次对话

### 单轮同步对话

最简单的对话示例，发送一条消息并等待完整响应：

```java
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final ChatService chatService;

    /**
     * 单轮同步对话
     */
    @PostMapping("/chat/simple")
    public R<String> simpleChat(@RequestBody String message) {
        // 构建请求
        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")           // 使用 DeepSeek
            .setMessage(message)               // 用户消息
            .setMode(ChatMode.SINGLE)          // 单轮对话模式
            .setStream(false);                 // 同步响应

        // 发起对话
        ChatResponse response = chatService.chat(request);

        return R.ok(response.getContent());
    }
}
```

**请求示例：**

```bash
curl -X POST http://localhost:8080/ai/chat/simple \
  -H "Content-Type: application/json" \
  -d "你好，请介绍一下你自己"
```

**响应示例：**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": "你好！我是 DeepSeek，一个由深度求索公司开发的人工智能助手..."
}
```

### 多轮连续对话

支持上下文记忆的连续对话：

```java
/**
 * 多轮连续对话
 */
@PostMapping("/chat/continuous")
public R<String> continuousChat(
    @RequestParam String sessionId,
    @RequestBody String message) {

    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSessionId(sessionId)           // 会话ID
        .setMessage(message)
        .setMode(ChatMode.CONTINUOUS)      // 连续对话模式
        .setStream(false);

    ChatResponse response = chatService.chat(request);
    return R.ok(response.getContent());
}
```

**对话流程：**

```bash
# 第一轮对话
curl -X POST "http://localhost:8080/ai/chat/continuous?sessionId=user123" \
  -H "Content-Type: application/json" \
  -d "我叫张三，是一名软件工程师"

# 第二轮对话（AI 能记住之前的信息）
curl -X POST "http://localhost:8080/ai/chat/continuous?sessionId=user123" \
  -H "Content-Type: application/json" \
  -d "我叫什么名字？我的职业是什么？"

# 响应：您叫张三，是一名软件工程师。
```

### 流式对话

实时流式输出响应内容：

```java
/**
 * 流式对话（SSE）
 */
@GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter streamChat(@RequestParam String message) {
    SseEmitter emitter = new SseEmitter();

    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setMessage(message)
        .setMode(ChatMode.SINGLE)
        .setStream(true);                  // 启用流式

    // 流式对话
    chatService.streamChat(request, response -> {
        try {
            if (!response.getFinished()) {
                // 发送内容片段
                emitter.send(SseEmitter.event()
                    .data(response.getContent()));
            } else {
                // 发送完成信号
                emitter.send(SseEmitter.event()
                    .data("[DONE]"));
                emitter.complete();
            }
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    });

    return emitter;
}
```

**前端使用 EventSource 接收流式响应：**

```javascript
const eventSource = new EventSource('/ai/chat/stream?message=讲个笑话');

eventSource.onmessage = (event) => {
  if (event.data === '[DONE]') {
    eventSource.close();
  } else {
    // 实时显示内容片段
    console.log(event.data);
  }
};
```

### 自定义系统提示词

为 AI 设置角色和行为规范：

```java
/**
 * 技术助手对话
 */
@PostMapping("/chat/tech-assistant")
public R<String> techAssistant(@RequestBody String question) {
    // 构建系统提示词
    String systemPrompt = PromptUtils.buildSystemPrompt(
        "一个专业的 Java 技术顾问",
        "你擅长 Spring Boot、微服务架构、数据库优化等领域。" +
        "请用简洁专业的语言回答技术问题。"
    );

    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setSystemPrompt(systemPrompt)     // 设置系统提示词
        .setMessage(question)
        .setMode(ChatMode.SINGLE)
        .setStream(false);

    ChatResponse response = chatService.chat(request);
    return R.ok(response.getContent());
}
```

### 调整模型参数

根据场景调整温度参数：

```java
/**
 * 创意写作（高温度）
 */
@PostMapping("/chat/creative")
public R<String> creativeChat(@RequestBody String topic) {
    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setMessage("请围绕'" + topic + "'写一首诗")
        .setMode(ChatMode.SINGLE)
        .setStream(false)
        .setTemperature(1.5)              // 高温度，输出更随机、更有创意
        .setMaxTokens(500);

    ChatResponse response = chatService.chat(request);
    return R.ok(response.getContent());
}

/**
 * 精确问答（低温度）
 */
@PostMapping("/chat/accurate")
public R<String> accurateChat(@RequestBody String question) {
    ChatRequest request = new ChatRequest()
        .setProvider("deepseek")
        .setMessage(question)
        .setMode(ChatMode.SINGLE)
        .setStream(false)
        .setTemperature(0.1);              // 低温度，输出更稳定、更准确

    ChatResponse response = chatService.chat(request);
    return R.ok(response.getContent());
}
```

## 第五步：会话管理

### 生成会话 ID

使用 `ChatMemoryManager` 生成唯一会话 ID：

```java
@Autowired
private ChatMemoryManager memoryManager;

/**
 * 创建新会话
 */
@PostMapping("/session/create")
public R<String> createSession() {
    String sessionId = memoryManager.generateSessionId();
    return R.ok(sessionId);
}
```

### 查询会话历史

获取指定会话的消息历史：

```java
/**
 * 获取会话历史
 */
@GetMapping("/session/history")
public R<List<ChatMessage>> getHistory(@RequestParam String sessionId) {
    var messages = chatService.getSessionMessages(sessionId);

    // 转换为业务对象
    List<ChatMessage> history = messages.stream()
        .map(msg -> new ChatMessage()
            .setRole(msg.type().name())
            .setContent(msg.text()))
        .toList();

    return R.ok(history);
}
```

### 清除会话

清除指定会话的历史记录：

```java
/**
 * 清除会话
 */
@DeleteMapping("/session/clear")
public R<Void> clearSession(@RequestParam String sessionId) {
    chatService.clearSession(sessionId);
    return R.ok();
}
```

## 响应对象说明

### ChatResponse 结构

```java
public class ChatResponse {
    /** 响应内容 */
    private String content;

    /** 是否已完成 */
    private Boolean finished;

    /** 错误信息 */
    private String error;

    /** Token 使用统计 */
    private TokenUsage tokenUsage;

    /** 响应时间（毫秒） */
    private Long responseTime;
}
```

### TokenUsage 结构

```java
public class TokenUsage {
    /** 输入 Token 数 */
    private Integer inputTokens;

    /** 输出 Token 数 */
    private Integer outputTokens;

    /** 总 Token 数 */
    private Integer totalTokens;
}
```

## 最佳实践

### 1. 使用环境变量管理 API Key

**不推荐：** 直接在配置文件中明文写入

```yaml
deepseek:
  api-key: sk-618bfe88c5bc444aa447b42ba827b452  # ❌ 不安全
```

**推荐：** 使用环境变量

```yaml
deepseek:
  api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY}  # ✅ 安全
```

### 2. 为不同场景选择合适的温度

| 场景 | 温度范围 | 说明 |
|------|---------|------|
| 精确问答、代码生成 | 0.0 - 0.3 | 输出稳定、准确 |
| 日常对话、技术解释 | 0.5 - 0.8 | 平衡准确性和多样性 |
| 创意写作、头脑风暴 | 1.0 - 2.0 | 输出更随机、更有创意 |

### 3. 合理设置 Token 限制

根据场景设置 `maxTokens` 参数，避免浪费：

```java
// 简短问答
.setMaxTokens(100)

// 技术解释
.setMaxTokens(500)

// 长文章生成
.setMaxTokens(2000)
```

### 4. 使用流式响应提升体验

对于响应时间较长的场景，使用流式响应：

```java
// 适合流式：长文章、代码生成、故事创作
.setStream(true)

// 适合同步：简短问答、分类任务
.setStream(false)
```

### 5. 为会话设置超时

在配置文件中设置合理的会话超时时间：

```yaml
chat:
  session-timeout: 30  # 30分钟无活动后自动清除
```

### 6. 使用系统提示词规范 AI 行为

为特定领域的应用设置专业系统提示词：

```java
// 客服机器人
String customerServicePrompt = PromptUtils.buildSystemPrompt(
    "友好的客户服务助手",
    "你需要：1. 礼貌友好地回答问题 2. 遇到不确定的问题时承认不知道 " +
    "3. 不要提供法律或医疗建议"
);

// 技术文档助手
String technicalPrompt = PromptUtils.buildSystemPrompt(
    "专业的技术文档编写助手",
    "你擅长编写清晰、详细、结构化的技术文档。" +
    "回答时请包含代码示例和最佳实践。"
);
```

### 7. 监控 Token 使用

记录和监控 Token 使用情况，避免超出配额：

```java
ChatResponse response = chatService.chat(request);

// 记录 Token 使用
TokenUsage usage = response.getTokenUsage();
log.info("Token使用 - 输入: {}, 输出: {}, 总计: {}",
    usage.getInputTokens(),
    usage.getOutputTokens(),
    usage.getTotalTokens());
```

## 常见问题

### 1. 模块未启动

**问题原因：**
- 配置文件中 `langchain4j.enabled=false`
- 依赖未正确添加
- 配置类未被扫描

**解决方案：**

```yaml
# 1. 确认总开关已启用
langchain4j:
  enabled: true

# 2. 确认至少一个模型已启用
deepseek:
  enabled: true
  api-key: sk-your-key
```

### 2. API 调用失败

**问题原因：**
- API Key 无效或过期
- 网络连接问题
- 请求超时

**解决方案：**

```yaml
# 1. 检查 API Key 是否正确
deepseek:
  api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY}

# 2. 增加超时时间
langchain4j:
  timeout: 120s  # 从 60s 增加到 120s

# 3. 增加重试次数
langchain4j:
  max-retries: 5  # 从 3 增加到 5
```

### 3. 会话无法保持上下文

**问题原因：**
- 未启用对话记忆功能
- 使用了 `SINGLE` 模式而非 `CONTINUOUS` 模式
- Redis 连接失败

**解决方案：**

```yaml
# 1. 确认记忆功能已启用
chat:
  memory-enabled: true
  memory-store-type: redis
```

```java
// 2. 使用 CONTINUOUS 模式
ChatRequest request = new ChatRequest()
    .setMode(ChatMode.CONTINUOUS)  // 必须使用连续对话模式
    .setSessionId(sessionId);      // 必须提供会话ID
```

### 4. Redis 连接失败

**问题原因：**
- Redis 服务未启动
- Redis 配置错误

**解决方案：**

```yaml
# 方案1: 使用内存存储（仅开发环境）
chat:
  memory-store-type: memory

# 方案2: 检查 Redis 配置
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: your-password
```

### 5. 响应内容被截断

**问题原因：**
- `maxTokens` 设置过小
- 模型本身的限制

**解决方案：**

```java
// 增加 maxTokens 限制
ChatRequest request = new ChatRequest()
    .setMaxTokens(4096);  // 根据模型支持的最大值调整
```

```yaml
# 或在配置文件中调整默认值
deepseek:
  max-tokens: 4096
```

## 下一步

现在你已经掌握了 LangChain4j 的基本使用方法，可以继续学习：

- **模型工厂** - 了解如何动态切换和管理多个模型
- **聊天服务** - 深入了解对话模式、函数调用等高级特性
- **RAG 检索增强** - 为 AI 添加知识库，提升回答准确性
- **向量存储** - 使用 Milvus、PgVector 等向量数据库
- **WebSocket 流式对话** - 实现实时聊天应用

## 完整示例代码

### 控制器示例

```java
package plus.ruoyi.web.controller.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import plus.ruoyi.common.core.domain.R;
import plus.ruoyi.common.langchain4j.core.chat.ChatMemoryManager;
import plus.ruoyi.common.langchain4j.core.chat.ChatService;
import plus.ruoyi.common.langchain4j.domain.dto.ChatRequest;
import plus.ruoyi.common.langchain4j.domain.dto.ChatResponse;
import plus.ruoyi.common.langchain4j.enums.ChatMode;
import plus.ruoyi.common.langchain4j.utils.PromptUtils;

import java.io.IOException;

/**
 * AI 对话控制器
 *
 * @author 抓蛙师
 */
@Slf4j
@RestController
@RequestMapping("/ai/chat")
@RequiredArgsConstructor
public class AiChatController {

    private final ChatService chatService;
    private final ChatMemoryManager memoryManager;

    /**
     * 单轮同步对话
     */
    @PostMapping("/simple")
    public R<ChatResponse> simpleChat(@RequestBody String message) {
        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setMessage(message)
            .setMode(ChatMode.SINGLE)
            .setStream(false);

        ChatResponse response = chatService.chat(request);
        return R.ok(response);
    }

    /**
     * 多轮连续对话
     */
    @PostMapping("/continuous")
    public R<ChatResponse> continuousChat(
        @RequestParam String sessionId,
        @RequestBody String message) {

        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setSessionId(sessionId)
            .setMessage(message)
            .setMode(ChatMode.CONTINUOUS)
            .setStream(false);

        ChatResponse response = chatService.chat(request);
        return R.ok(response);
    }

    /**
     * 流式对话
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@RequestParam String message) {
        SseEmitter emitter = new SseEmitter();

        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setMessage(message)
            .setMode(ChatMode.SINGLE)
            .setStream(true);

        chatService.streamChat(request, response -> {
            try {
                if (!response.getFinished()) {
                    emitter.send(SseEmitter.event().data(response.getContent()));
                } else {
                    emitter.send(SseEmitter.event().data("[DONE]"));
                    emitter.complete();
                }
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    /**
     * 技术助手
     */
    @PostMapping("/tech-assistant")
    public R<ChatResponse> techAssistant(@RequestBody String question) {
        String systemPrompt = PromptUtils.buildSystemPrompt(
            "专业的 Java 技术顾问",
            "你擅长 Spring Boot、微服务架构、数据库优化等领域。" +
            "请用简洁专业的语言回答技术问题。"
        );

        ChatRequest request = new ChatRequest()
            .setProvider("deepseek")
            .setSystemPrompt(systemPrompt)
            .setMessage(question)
            .setMode(ChatMode.SINGLE)
            .setStream(false);

        ChatResponse response = chatService.chat(request);
        return R.ok(response);
    }

    /**
     * 创建新会话
     */
    @PostMapping("/session/create")
    public R<String> createSession() {
        String sessionId = memoryManager.generateSessionId();
        return R.ok(sessionId);
    }

    /**
     * 清除会话
     */
    @DeleteMapping("/session/clear")
    public R<Void> clearSession(@RequestParam String sessionId) {
        chatService.clearSession(sessionId);
        return R.ok();
    }
}
```

## 总结

通过本文档，你已经学会了：

1. ✅ 添加 LangChain4j 模块依赖
2. ✅ 配置 API Key 和模型参数
3. ✅ 发起单轮和多轮对话
4. ✅ 使用流式响应提升用户体验
5. ✅ 管理会话和历史记录
6. ✅ 自定义系统提示词和模型参数
7. ✅ 掌握最佳实践和常见问题解决方法

现在你可以开始在项目中使用 LangChain4j 构建强大的 AI 应用了！
