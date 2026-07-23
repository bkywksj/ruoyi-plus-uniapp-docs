# 深度思考能力

## 介绍

深度思考（Deep Thinking / Reasoning / Chain-of-Thought）是新一代大语言模型在生成最终回复之前，先输出一段"推理过程"的能力。模型会把分析、拆解、规划、验证等思考步骤显式地表达出来，再基于这些推理产出最终答案。RuoYi-Plus 在 `ruoyi-common-langchain4j` 模块中对该能力做了统一封装，覆盖 DeepSeek、通义千问、Anthropic Claude、OpenAI、Ollama 五大主流模型供应商，开发者只需通过配置开关或请求参数即可启用，并通过统一的 `phase`、`reasoningContent`、`content` 字段拿到推理片段与最终答案，无需再为每家供应商写一套适配逻辑。

**核心特性:**

- **统一封装** - 把各供应商的 thinking 协议（DeepSeek `reasoning_content`、Claude `thinking_type`、Qwen `enable_thinking`、Ollama `think`、OpenAI `reasoning_effort`）抽象为一组统一参数
- **双阶段输出** - 流式响应通过 `phase=thinking` 与 `phase=content` 区分推理增量与最终回复增量，前端可分通道渲染
- **配置驱动** - 通过 `langchain4j.{provider}.enableThinking` 全局开关 + `ChatRequest.thinkingEnabled` 请求覆盖，支持「全局关闭、按请求启用」或「全局开启、按请求关闭」两种治理模式
- **预算可控** - Claude 与 Qwen 通过 `thinkingBudgetTokens` 限制思考最大 token 数；OpenAI 系列通过 `reasoningEffort` 控制思考强度
- **安全收窄** - 请求级覆盖只能"收窄"权限：后端 `enableThinking=false` 时，前端传 `thinkingEnabled=true` 不会越权开启
- **服务端可见** - 关闭 `returnThinking` 后，推理内容仅在服务端日志可见，不会推送到客户端，满足合规要求
- **完整的会话保存** - 多轮对话只把最终回复持久化到记忆，不会污染上下文，避免推理内容反复被模型读取

## 什么是深度思考

### 概念

传统大模型采用「输入 → 输出」的单步推理：模型读完用户消息后，直接生成最终答案。深度思考模型则在二者之间增加了一段「思考链 / Chain-of-Thought」，会先输出一段类似草稿的推理过程，然后再给出最终回复。

```text
传统模型:
  user message → [模型内部权重计算] → answer

深度思考模型:
  user message
    → [模型生成可见的推理草稿: reasoning_content / thinking]
    → [基于推理草稿生成最终答案: content / text]
```

### 适用场景

启用深度思考能显著提升模型在以下场景的表现：

| 场景 | 收益 | 推荐模型 |
|------|------|---------|
| 复杂数学推理 | 减少计算错误、提供清晰推导步骤 | DeepSeek-Reasoner / Qwen3-Thinking / o1 |
| 多步逻辑分析 | 拆解步骤、避免遗漏前提 | Claude Sonnet thinking / DeepSeek-R1 |
| 代码调试与重构 | 罗列假设、对比方案、提出验证步骤 | DeepSeek-Reasoner / Claude thinking |
| 业务规划与方案设计 | 显式列出权衡、约束、替代方案 | Claude thinking / Qwen3-Thinking |
| 知识密集型问答 | 先做信息整合再回答，降低幻觉率 | DeepSeek-Reasoner / Qwen-QwQ |
| 自动化测试用例生成 | 先思考用例分类，再生成具体用例 | DeepSeek-Reasoner / Claude thinking |

### 不适用场景

并不是所有任务都需要深度思考。以下场景应保持关闭：

- 简单问答（如「今天星期几」「你好」），开启后会产生不必要的 token 消耗
- 实时性要求高的对话场景（如客服首响要求 < 1s），思考阶段会增加首字延迟
- 工具调用 / Function Calling 场景下，部分供应商的 thinking 与 tool use 互斥
- 输出已经被严格约束为短文本或固定 JSON 结构的场景

### 与"长输出"的区别

深度思考 ≠ 让模型输出更长的答案。两者本质区别：

- **长输出**：直接增加 `maxTokens`，让最终回复更详细；但模型仍是「一气呵成」生成
- **深度思考**：模型先内部规划，再写最终答案；推理部分占用独立的 token 预算（`thinkingBudgetTokens`），与 `maxTokens` 控制的最终回复 token 数互不影响

## 配置项详解

### 全局配置

在 `langchain4j.yml` 中按供应商分别配置思考开关。所有思考相关字段都位于 `ModelConfig` 内，可在 `deepseek` / `qianwen` / `claude` / `openai` / `ollama` 任一节点下设置：

```yaml
langchain4j:
  deepseek:
    enabled: true
    api-key: ${LANGCHAIN4J_DEEPSEEK_API_KEY}
    model-name: deepseek-reasoner          # 必须使用支持推理的模型
    max-tokens: 8192
    # 深度思考开关
    enable-thinking: true
    # 是否把推理内容下发到客户端（false 则只记录到服务端日志）
    return-thinking: true

  qianwen:
    enabled: true
    api-key: ${LANGCHAIN4J_QIANWEN_API_KEY}
    model-name: qwen3-235b-a22b-thinking-2507
    max-tokens: 8192
    enable-thinking: true
    # Qwen 支持显式预算
    thinking-budget-tokens: 4096
    return-thinking: true

  claude:
    enabled: true
    api-key: ${LANGCHAIN4J_CLAUDE_API_KEY}
    model-name: claude-3-5-sonnet-20241022
    max-tokens: 16384
    enable-thinking: true
    # Claude 必填；要求 thinking-budget-tokens < max-tokens
    thinking-budget-tokens: 4096
    return-thinking: true

  openai:
    enabled: true
    api-key: ${LANGCHAIN4J_OPENAI_API_KEY}
    model-name: o1-mini                    # 必须是 o1/o3/gpt-5-thinking 系列
    max-tokens: 8192
    enable-thinking: true
    # OpenAI 用强度档位代替预算，取值 low | medium | high
    reasoning-effort: medium
    return-thinking: true

  ollama:
    enabled: true
    base-url: http://localhost:11434
    model-name: deepseek-r1:14b            # 必须是 deepseek-r1 / qwq 等推理模型
    enable-thinking: true
    return-thinking: true
```

### 字段含义

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `enable-thinking` | `Boolean` | `false` | 深度思考总开关；为 `false` 时其他思考字段全部失效 |
| `thinking-budget-tokens` | `Integer` | `1024` | 思考阶段最大 token 数。仅 Claude（必填）和 Qwen（可选）生效；DeepSeek/OpenAI/Ollama 忽略此字段 |
| `reasoning-effort` | `String` | `null` | OpenAI 系列推理强度，取值 `low` / `medium` / `high`；其他供应商忽略 |
| `return-thinking` | `Boolean` | `true` | 是否把推理内容下发到客户端。设为 `false` 时模型仍然推理，但 `reasoningContent` 字段不会推送给前端，仅记录到服务端 |
| `max-tokens` | `Integer` | `2048` | 最终回复的最大 token 数。注意 Claude 要求 `thinking-budget-tokens < max-tokens` |

### 请求级覆盖

除全局配置外，调用方可在 `ChatRequest` 上传入两个字段做请求级覆盖：

```java
ChatRequest request = new ChatRequest()
    .setMessage("分析这道数学题: ...")
    .setProvider("deepseek")
    .setThinkingEnabled(true)        // 本次请求强制启用 / 关闭思考
    .setThinkingBudgetTokens(8192);  // 本次请求覆盖预算（仅 Claude/Qwen 生效）
```

请求级覆盖遵循以下规则：

- **只能收窄**：后端配置 `enable-thinking=false` 时，请求传 `thinkingEnabled=true` 不会生效；这一规则避免前端绕过运维管控开启高成本思考
- **可以临时关闭**：后端配置 `enable-thinking=true` 时，请求传 `thinkingEnabled=false` 会临时关闭本次请求的推理（适合简单问答场景节约 token）
- **预算可上调**：`thinkingBudgetTokens > 0` 即覆盖；`<= 0` 视为无效；预算覆盖始终生效（不受 `enableThinking` 收窄规则约束）
- **空值沿用配置**：两个字段为 `null` 时完全沿用 `langchain4j.yml` 中的设置，零侵入

### 内部参数转换

`ModelFactory` 通过 `ThinkingOptions` record 把请求级覆盖与全局配置合并，得到本次调用的「生效配置」，再传给具体供应商的 builder：

```java
public record ThinkingOptions(Boolean enabled, Integer budgetTokens) {
    public static final ThinkingOptions NONE = new ThinkingOptions(null, null);

    public boolean isEmpty() {
        return enabled == null && budgetTokens == null;
    }
}
```

`ChatService` 在每次对话开始时根据请求生成 `ThinkingOptions`，无覆盖时直接传 `NONE` 以避免拷贝开销：

```java
private ThinkingOptions resolveThinkingOptions(ChatRequest request) {
    if (request.getThinkingEnabled() == null && request.getThinkingBudgetTokens() == null) {
        return ThinkingOptions.NONE;
    }
    return new ThinkingOptions(request.getThinkingEnabled(), request.getThinkingBudgetTokens());
}
```

## 各供应商支持矩阵

不同供应商的 thinking 协议差异较大。`ModelFactory` 已经把这些差异统一封装，开发者只需要选对模型名称、按下表查看哪些字段会被使用：

| 供应商 | 推荐模型 | enable-thinking | thinking-budget-tokens | reasoning-effort | return-thinking | 备注 |
|--------|----------|----------------|------------------------|------------------|----------------|------|
| DeepSeek | `deepseek-reasoner` | 必须 `true` | 忽略 | 忽略 | 生效 | OpenAI 兼容协议，自动解析 `reasoning_content` 字段 |
| 通义千问 | `qwen3-thinking` / `qwq-32b-preview` | 必须 `true` | 生效（可选） | 忽略 | 生效 | 通过 `QwenChatRequestParameters` 透传 `enable_thinking` 与 `thinking_budget` |
| Claude | `claude-3-5-sonnet-20241022`+ | 必须 `true` | 必填，必须 `<` max-tokens | 忽略 | 生效 | 走 `thinkingType=enabled` 协议；预算 `<= 0` 自动回退到 1024 |
| OpenAI | `o1-mini` / `o1` / `o3` / `gpt-5-thinking` | 必须 `true` | 忽略 | 生效 | 生效 | 普通 GPT 模型即使开启 `enable-thinking` 也不会推理；用 `reasoning-effort` 控制思考强度 |
| Ollama | `deepseek-r1` / `qwq` | 必须 `true` | 忽略 | 忽略 | 生效 | 通过 `think=true` 让本地模型暴露思考块 |

### DeepSeek

DeepSeek 使用 OpenAI 兼容协议，思考内容通过 `reasoning_content` 字段返回。`ModelFactory` 在开启 thinking 时调用 `builder.returnThinking(true)`，langchain4j 1.x 的 OpenAI 客户端会自动识别该字段并填充到 `AiMessage.thinking()`：

```java
private ChatModel createDeepSeekChatModel(String modelName, ThinkingOptions thinking) {
    ModelConfig config = effectiveConfig(properties.getDeepseek(), thinking);
    validateConfig(config, "DeepSeek");

    OpenAiChatModel.OpenAiChatModelBuilder builder = OpenAiChatModel.builder()
            .apiKey(config.getApiKey())
            .baseUrl(getBaseUrl(config, ModelProvider.DEEPSEEK))
            .modelName(getModelName(modelName, config, "deepseek-chat"))
            .temperature(config.getTemperature())
            .topP(config.getTopP())
            .maxTokens(config.getMaxTokens())
            .timeout(properties.getTimeout())
            .maxRetries(properties.getMaxRetries());

    if (Boolean.TRUE.equals(config.getEnableThinking())) {
        builder.returnThinking(Boolean.TRUE.equals(config.getReturnThinking()));
    }

    return builder.build();
}
```

**<Warn/> 注意**：必须将 `model-name` 设为 `deepseek-reasoner`，普通的 `deepseek-chat` 不支持推理输出。

### 通义千问（Qwen）

阿里云通义千问通过 `QwenChatRequestParameters` 透传两个原生字段 `enable_thinking` 与 `thinking_budget`：

```java
private QwenChatRequestParameters buildQwenThinkingParameters(ModelConfig config) {
    QwenChatRequestParameters.Builder builder = QwenChatRequestParameters.builder()
            .enableThinking(Boolean.TRUE);
    Integer budget = config.getThinkingBudgetTokens();
    if (budget != null && budget > 0) {
        builder.thinkingBudget(budget);
    }
    return builder.build();
}
```

`thinking-budget-tokens` 不传时阿里云会用模型默认值；推荐设置在 2048-8192 区间，避免推理过短导致结论草率或过长导致首字延迟。

### Anthropic Claude

Claude 的 Extended Thinking 通过 `thinking_type=enabled` 与 `thinking_budget_tokens` 两个参数控制，且 Anthropic 强约束 `thinking_budget_tokens < max_tokens`：

```java
private Integer ensureClaudeBudget(ModelConfig config) {
    Integer budget = config.getThinkingBudgetTokens();
    Integer maxTokens = config.getMaxTokens();
    if (budget == null || budget <= 0) {
        budget = 1024;
    }
    if (maxTokens != null && budget >= maxTokens) {
        log.warn("Claude thinkingBudgetTokens({}) 必须小于 maxTokens({})，自动调整为 maxTokens/2", budget, maxTokens);
        budget = Math.max(1024, maxTokens / 2);
    }
    return budget;
}
```

框架做了三层兜底：

1. 预算 `<= 0` 自动回退到 1024
2. 预算 `>= max-tokens` 自动调整为 `max-tokens / 2`
3. 调整时打 WARN 级日志，便于运维排查

### OpenAI

OpenAI 的推理模型（`o1` / `o3` / `gpt-5-thinking`）使用「强度档位」而非「token 预算」：

```java
private void applyOpenAiReasoning(OpenAiChatModel.OpenAiChatModelBuilder builder, ModelConfig config) {
    if (!Boolean.TRUE.equals(config.getEnableThinking())) {
        return;
    }
    if (StrUtil.isNotBlank(config.getReasoningEffort())) {
        builder.reasoningEffort(config.getReasoningEffort());
    }
    builder.returnThinking(Boolean.TRUE.equals(config.getReturnThinking()));
}
```

各档位含义：

- `low`：快速思考，推理 token 少，适合简单逻辑题
- `medium`：默认推荐档位，平衡延迟与质量
- `high`：深度推理，适合复杂数学 / 代码 / 多步规划

**<Warn/> 注意**：对普通 `gpt-4o` 等模型开启 thinking 不会有任何效果，OpenAI 服务端会直接忽略 `reasoning_effort` 字段。

### Ollama

本地 Ollama 通过 `think=true` 让推理模型暴露思考块（仅对 `deepseek-r1` / `qwq` 等模型有效）：

```java
if (Boolean.TRUE.equals(config.getEnableThinking())) {
    builder.think(Boolean.TRUE)
            .returnThinking(Boolean.TRUE.equals(config.getReturnThinking()));
}
```

部署 Ollama 推理模型需要至少 16GB 内存（`deepseek-r1:14b` 大约 9GB 模型权重 + 推理上下文）。在资源紧张的机器上建议改用 `deepseek-r1:7b`。

## 同步对话用法

### 基本调用

同步对话直接返回 `AiChatResponse`，推理内容会一次性放在 `reasoningContent` 字段中，最终回复在 `content` 字段：

```java
@Service
@RequiredArgsConstructor
public class ThinkingChatExample {

    private final ChatService chatService;

    public void chatWithThinking() {
        ChatRequest request = new ChatRequest()
                .setMessage("一个长方形的周长是 24，长是宽的 2 倍，求面积。请一步步分析。")
                .setProvider("deepseek")
                .setModelName("deepseek-reasoner")
                .setMode(ChatMode.SINGLE)
                .setThinkingEnabled(true);

        AiChatResponse response = chatService.chat(request);

        System.out.println("推理过程:");
        System.out.println(response.getReasoningContent());
        System.out.println();
        System.out.println("最终回复:");
        System.out.println(response.getContent());
        System.out.println();
        System.out.println("Token 使用: " + response.getTokenUsage());
    }
}
```

### 服务端只记录、不下发

如果只想在服务端日志记录推理过程（用于审计与质量分析），但不希望前端看到，可在配置中关闭 `return-thinking`：

```yaml
langchain4j:
  deepseek:
    enable-thinking: true
    return-thinking: false   # 关闭后客户端拿不到 reasoningContent
```

此时模型仍然完整推理，但返回的 `AiChatResponse.reasoningContent` 始终为 `null`，避免敏感推理细节泄露到客户端。

### 同步响应字段

`AiChatResponse` 在思考模式下的字段填充情况：

```java
private AiChatResponse buildResponse(ChatResponse response) {
    AiMessage aiMessage = response.aiMessage();
    String thinking = aiMessage != null ? aiMessage.thinking() : null;
    String text = aiMessage != null ? aiMessage.text() : null;

    return AiChatResponse.builder()
            .messageId(IdUtil.fastSimpleUUID())
            .content(text)
            .reasoningContent(StrUtil.isNotBlank(thinking) ? thinking : null)
            .phase(AiChatResponse.Phase.CONTENT)
            .finished(true)
            .build();
}
```

关键点：

- `content` - 最终回复（不含推理）
- `reasoningContent` - 完整推理过程（不带 `<think>` 标签，langchain4j 1.x 已自动剥离）
- `phase` - 同步调用恒为 `content`（同步场景没有「阶段」概念）
- `finished` - 同步调用恒为 `true`

## 流式对话用法

### 双阶段推送

流式对话才能完整体现深度思考的价值：用户可以先看到推理草稿，再看到最终答案。`StreamChatHandler` 实现了 langchain4j 1.x 的 `StreamingChatResponseHandler` 接口，分别处理 `onPartialThinking` 与 `onPartialResponse` 两个回调：

```java
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
```

### 调用示例

```java
@Service
@RequiredArgsConstructor
public class StreamingThinkingExample {

    private final ChatService chatService;

    public void streamWithThinking() {
        ChatRequest request = new ChatRequest()
                .setMessage("帮我设计一个分布式 ID 生成器，要求支持每秒百万级 QPS，简述设计思路")
                .setProvider("deepseek")
                .setModelName("deepseek-reasoner")
                .setMode(ChatMode.CONTINUOUS)
                .setSessionId("user-123-session-1")
                .setThinkingEnabled(true)
                .setStream(true);

        chatService.streamChat(request, response -> {
            if (Boolean.TRUE.equals(response.getFinished())) {
                // 完成消息
                System.out.println("\n\n[完成] 完整推理已经累积，token=" + response.getTokenUsage());
                return;
            }

            String phase = response.getPhase();
            if (AiChatResponse.Phase.THINKING.equals(phase)) {
                // 思考阶段增量
                System.out.print("[思考] " + response.getReasoningContent());
            } else if (AiChatResponse.Phase.CONTENT.equals(phase)) {
                // 最终回复增量
                System.out.print(response.getContent());
            }
        });
    }
}
```

### 流式响应阶段说明

`AiChatResponse.phase` 在流式模式下有三种取值：

| phase | finished | 触发场景 | 字段填充 |
|-------|----------|---------|---------|
| `thinking` | `false` | 推理阶段增量 | 仅 `reasoningContent` |
| `content` | `false` | 最终回复增量 | 仅 `content` |
| `content` | `true` | 流式完成 | `reasoningContent` 累积全文 + 空字符串 `content` + `tokenUsage` |

完成消息特别值得注意：

```java
@Override
public void onCompleteResponse(ChatResponse completeResponse) {
    AiChatResponse finalResponse = AiChatResponse.builder()
            .messageId(messageId)
            .content("")
            .reasoningContent(fullThinking.length() > 0 ? fullThinking.toString() : null)
            .phase(AiChatResponse.Phase.CONTENT)
            .finished(true)
            .build();

    if (completeResponse != null && completeResponse.tokenUsage() != null) {
        TokenUsage tokenUsage = new TokenUsage();
        tokenUsage.setPromptTokens(completeResponse.tokenUsage().inputTokenCount());
        tokenUsage.setCompletionTokens(completeResponse.tokenUsage().outputTokenCount());
        tokenUsage.setTotalTokens(completeResponse.tokenUsage().totalTokenCount());
        finalResponse.setTokenUsage(tokenUsage);
    }

    responseConsumer.accept(finalResponse);
}
```

完成消息会把全程累积的 `fullThinking` 一次性放在 `reasoningContent` 中，方便前端在结束时把完整推理另存或折叠展示。

### 多轮对话的记忆策略

值得强调的是，多轮对话中**只有最终回复 `content` 会被写入 `ChatMemory`，推理内容 `reasoningContent` 不会持久化**：

```java
var handler = new StreamChatHandler(messageId, responseConsumer, fullContent, () -> {
    // 流式完成后，保存 AI 回复（仅 text）到 memory
    memory.add(AiMessage.from(fullContent.toString()));
});
```

这样设计有两个好处：

1. **避免推理污染上下文**：思考草稿可能包含错误尝试，写入记忆会让后续对话被误导
2. **节省 token**：推理内容通常比最终回复长 3-5 倍，不写入记忆能显著降低后续轮次的 prompt token 消耗

## WebSocket 流式响应

### 端到端流程

实战中前端通过 WebSocket 接入，整体链路如下：

```text
WebSocket Client
      │  发送 {type:"ai_chat", message:"...", thinkingEnabled:true}
      ▼
AiChatMessageProcessor.process()
      │  解析为 AiChatWebSocketRequest
      │  校验参数
      │  转换为 ChatRequest（透传 thinkingEnabled / thinkingBudgetTokens）
      ▼
ChatService.streamChat()
      │  ModelFactory.createStreamingChatModel(provider, model, ThinkingOptions)
      │  注册 StreamChatHandler 回调
      ▼
StreamingChatModel.chat()
      │
      ▼ 流式回调（按阶段触发）
StreamChatHandler
      │  onPartialThinking → AiChatStreamResponse.ofThinking(...)
      │  onPartialResponse → AiChatStreamResponse.of(...)
      │  onCompleteResponse → AiChatCompleteResponse + reasoningContent
      ▼
WebSocketUtils.sendMessage(JSON)
      │
      ▼
WebSocket Client
      接收并按 phase 分通道渲染
```

### 服务端消息格式

`AiChatMessageProcessor.sendStreamMessage` 根据 `phase` 选择不同的 DTO：

```java
private void sendStreamMessage(WebSocketSession session, String sessionId, AiChatResponse chatResponse) {
    AiChatStreamResponse response;
    if (AiChatResponse.Phase.THINKING.equals(chatResponse.getPhase())) {
        response = AiChatStreamResponse.ofThinking(
            sessionId,
            chatResponse.getMessageId(),
            chatResponse.getReasoningContent()
        );
    } else {
        response = AiChatStreamResponse.of(
            sessionId,
            chatResponse.getMessageId(),
            chatResponse.getContent()
        );
    }
    WebSocketUtils.sendMessage(session, JsonUtils.toJsonString(response));
}
```

#### 思考阶段消息

```json
{
  "type": "ai_chat_stream",
  "sessionId": "user-123-session-1",
  "messageId": "abc-def-123",
  "phase": "thinking",
  "reasoningContent": "首先分析题目条件: 长方形周长是 24，",
  "content": null,
  "finished": false
}
```

#### 内容阶段消息

```json
{
  "type": "ai_chat_stream",
  "sessionId": "user-123-session-1",
  "messageId": "abc-def-123",
  "phase": "content",
  "reasoningContent": null,
  "content": "面积为 ",
  "finished": false
}
```

#### 完成消息

```json
{
  "type": "ai_chat_complete",
  "sessionId": "user-123-session-1",
  "messageId": "abc-def-123",
  "content": "面积为 32 平方单位",
  "reasoningContent": "首先分析题目条件: 长方形周长是 24，长是宽的 2 倍...（完整推理）",
  "tokenUsage": {
    "promptTokens": 35,
    "completionTokens": 412,
    "totalTokens": 447
  },
  "finished": true
}
```

### 客户端示例（JavaScript）

```javascript
const ws = new WebSocket('ws://localhost:8080/websocket')

let thinkingBuffer = ''
let contentBuffer = ''

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)

  switch (msg.type) {
    case 'ai_chat_start':
      thinkingBuffer = ''
      contentBuffer = ''
      break

    case 'ai_chat_stream':
      if (msg.phase === 'thinking') {
        // 思考阶段：在折叠面板里展示
        thinkingBuffer += msg.reasoningContent
        renderThinking(thinkingBuffer)
      } else if (msg.phase === 'content') {
        // 内容阶段：在主对话区域展示
        contentBuffer += msg.content
        renderContent(contentBuffer)
      }
      break

    case 'ai_chat_complete':
      // 完成消息：可以保存完整推理用于历史回看
      console.log('总用量:', msg.tokenUsage)
      break

    case 'ai_chat_error':
      console.error('AI 错误:', msg.error)
      break
  }
}

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'ai_chat',
    message: '帮我推导勾股定理',
    provider: 'deepseek',
    modelName: 'deepseek-reasoner',
    mode: 'continuous',
    sessionId: 'demo-session',
    thinkingEnabled: true,
    thinkingBudgetTokens: 4096
  }))
}
```

### 关闭推理的客户端处理

如果服务端 `return-thinking=false`，前端不会收到 `phase=thinking` 的消息，整个对话退化为普通流式输出，前端无需特殊兼容代码——`AiChatStreamResponse` 中 `reasoningContent` 字段为 `null`。

## 最佳实践

### 1. 全局默认关闭，按需启用

生产环境推荐把 `enable-thinking` 默认设为 `false`，把开关交给业务方按场景启用：

```yaml
langchain4j:
  deepseek:
    enable-thinking: false   # 默认关闭，简单对话快、便宜
```

```java
// 业务侧根据「场景类型」决定是否启用
ChatRequest request = new ChatRequest()
    .setMessage(userMessage)
    .setThinkingEnabled(needDeepThinking(taskType));

boolean needDeepThinking(TaskType taskType) {
    return switch (taskType) {
        case MATH, CODE_DEBUG, COMPLEX_REASONING -> true;
        case CASUAL_CHAT, FAQ -> false;
        default -> false;
    };
}
```

这种模式下，运维方握有「绝对关闭」权限（`enable-thinking=false` 时业务侧无法绕过），而业务方在被允许的范围内拥有最细粒度的控制。

### 2. 按用户档位差异化预算

针对不同付费档位的用户，分配不同的思考预算：

```java
@Service
@RequiredArgsConstructor
public class TieredThinkingService {

    private final ChatService chatService;

    public void chat(String userId, String message, UserTier tier) {
        Integer budget = switch (tier) {
            case FREE -> 1024;        // 免费用户：最低预算
            case PRO -> 4096;         // Pro 用户：标准预算
            case ENTERPRISE -> 16384; // 企业用户：深度推理
        };

        ChatRequest request = new ChatRequest()
            .setMessage(message)
            .setProvider("claude")
            .setSessionId(userId)
            .setThinkingEnabled(true)
            .setThinkingBudgetTokens(budget);

        chatService.streamChat(request, response -> { /* 推送给用户 */ });
    }
}
```

### 3. 思考与最终回复分通道存储

数据库表设计上把推理与回复分开存储，便于后续做模型质量分析：

```sql
CREATE TABLE ai_chat_message (
    id              BIGINT PRIMARY KEY,
    session_id      VARCHAR(64) NOT NULL,
    role            VARCHAR(16) NOT NULL,
    content         TEXT,                -- 最终回复
    reasoning       TEXT,                -- 推理过程（可空）
    token_input     INT,
    token_output    INT,
    created_at      DATETIME NOT NULL,
    INDEX idx_session (session_id, created_at)
);
```

业务侧只用 `content` 显示历史；运维 / 算法侧通过 `reasoning` 字段分析模型在何时翻车，做后续调优。

### 4. 监控思考 token 占比

思考 token 消耗常常是普通对话的 3-10 倍，应纳入监控：

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class ThinkingMetrics {

    private final MeterRegistry meterRegistry;

    public void record(String provider, AiChatResponse response) {
        if (response.getTokenUsage() == null) {
            return;
        }
        TokenUsage usage = response.getTokenUsage();

        meterRegistry.counter("ai.token.input", "provider", provider)
            .increment(usage.getPromptTokens());
        meterRegistry.counter("ai.token.output", "provider", provider)
            .increment(usage.getCompletionTokens());

        // 推理 token 估算：基于 reasoningContent 字符数 / 2 (中文) 或 / 4 (英文)
        if (StrUtil.isNotBlank(response.getReasoningContent())) {
            int estimatedThinkingTokens = response.getReasoningContent().length() / 2;
            meterRegistry.counter("ai.token.thinking", "provider", provider)
                .increment(estimatedThinkingTokens);
        }
    }
}
```

通过 Grafana 把 `ai.token.thinking / ai.token.output` 比例画出来，可以快速发现「思考过度」（比例 > 5）或「思考不充分」（比例 < 0.3）的异常会话。

### 5. 失败降级到非推理模型

推理模型通常贵且慢，遇到限流或超时时应降级到普通模型保住可用性：

```java
public AiChatResponse chatWithFallback(ChatRequest request) {
    try {
        return chatService.chat(request);
    } catch (Exception ex) {
        log.warn("推理模型失败，降级到 deepseek-chat: {}", ex.getMessage());
        ChatRequest fallback = new ChatRequest()
            .setMessage(request.getMessage())
            .setProvider("deepseek")
            .setModelName("deepseek-chat")
            .setMode(request.getMode())
            .setSessionId(request.getSessionId())
            .setThinkingEnabled(false);  // 关闭思考
        return chatService.chat(fallback);
    }
}
```

### 6. 前端折叠展示推理

推理内容通常很长且不一定是用户关心的，建议默认折叠：

```html
<details class="reasoning-block">
  <summary>查看模型推理过程（{{ thinkingTokens }} tokens）</summary>
  <pre>{{ thinkingBuffer }}</pre>
</details>
<div class="content-block">
  {{ contentBuffer }}
</div>
```

折叠后用户先看到答案，关心推理的用户再点开查看，体验上接近"先答案、后解释"的人类沟通方式。

## 常见问题

### 1. 开启 enable-thinking 后没有 reasoningContent

**问题原因:**

- `model-name` 不是推理模型（如 DeepSeek 用了 `deepseek-chat` 而不是 `deepseek-reasoner`）
- OpenAI 用了 `gpt-4o-mini` 等非推理模型
- Ollama 拉取的是 `llama3.2` 等普通模型，不是 `deepseek-r1` / `qwq`
- `return-thinking` 被显式设为 `false`

**解决方案:**

按下表对照修正 `model-name`：

| 供应商 | 错误模型 | 正确模型 |
|--------|---------|---------|
| DeepSeek | `deepseek-chat` | `deepseek-reasoner` |
| 通义千问 | `qwen-turbo` | `qwen3-thinking` / `qwq-32b-preview` |
| OpenAI | `gpt-4o` / `gpt-4o-mini` | `o1-mini` / `o1` / `o3` / `gpt-5-thinking` |
| Ollama | `llama3.2` / `mistral` | `deepseek-r1:14b` / `qwq:32b` |
| Claude | `claude-3-haiku` | `claude-3-5-sonnet-20241022`+ |

### 2. Claude 报错 `thinking_budget_tokens must be less than max_tokens`

**问题原因:**

Anthropic API 强约束 `thinking_budget_tokens < max_tokens`，违反时直接返回 400。

**解决方案:**

`ModelFactory.ensureClaudeBudget()` 已经做了兜底，但建议显式配置避免触发自动调整：

```yaml
langchain4j:
  claude:
    enable-thinking: true
    max-tokens: 16384            # 整体回复上限
    thinking-budget-tokens: 4096 # 思考预算，必须 < max-tokens
```

观察日志，若出现 `Claude thinkingBudgetTokens(X) 必须小于 maxTokens(Y)，自动调整为 maxTokens/2`，说明触发了自动兜底，应主动修正配置。

### 3. 流式回调中 phase 字段为 null

**问题原因:**

- 使用了同步调用 `chatService.chat()`，同步场景下 `phase` 在内部恒为 `content`，回调侧不应依赖 `phase` 区分阶段
- 自定义了 `StreamingChatResponseHandler` 但未保留框架的 `phase` 设置逻辑

**解决方案:**

- 同步调用直接读 `getContent()` 与 `getReasoningContent()` 即可
- 流式调用务必使用框架提供的 `StreamChatHandler`，或参照其实现保留 `phase` 字段填充逻辑

### 4. 思考内容反复出现在多轮对话中

**问题原因:**

- 业务侧把 `reasoningContent` 拼接进 prompt 发回模型
- 自定义了 ChatMemory 实现，把 `AiMessage` 中的 `thinking()` 也写入了记忆

**解决方案:**

框架默认实现已经规避：`ChatService` 在多轮场景下只调用 `memory.add(AiMessage.from(fullContent.toString()))`，主动剥离了 thinking 内容。如果自定义记忆，请确保只持久化 `text()`，不要持久化 `thinking()`：

```java
// ✅ 正确：只保存最终文本
memory.add(AiMessage.from(response.aiMessage().text()));

// ❌ 错误：会把推理也保留下来
memory.add(response.aiMessage());
```

### 5. 用 OpenAI 兼容代理（如 OneAPI / Cloudflare AI Gateway）时拿不到推理

**问题原因:**

很多 OpenAI 代理会过滤非标准字段（如 `reasoning_content`、`reasoning_summary`），导致推理内容在代理层被丢弃。

**解决方案:**

- 检查代理是否支持 `reasoning_content` 透传，多数代理需要在配置里显式开启
- 若代理不支持，可绕过代理直连官方 API（在 `base-url` 字段填 `https://api.deepseek.com`）
- 临时验证：用 curl 直接调用代理 + 真实供应商两个 baseUrl，对比响应体差异

### 6. 推理过程出现 `<think>...</think>` 标签

**问题原因:**

部分本地推理模型（如早期的 `deepseek-r1`）会把推理内容用 `<think>` 标签包裹后混入 `content` 字段。langchain4j 1.x 已经做了自动剥离，但旧版本未升级时会出现这个问题。

**解决方案:**

- 确保使用 LangChain4j 1.14.1+
- 升级前可在业务侧做 post-process 兜底：

```java
String content = response.getContent();
if (content != null && content.contains("<think>")) {
    int start = content.indexOf("<think>");
    int end = content.indexOf("</think>") + "</think>".length();
    String thinking = content.substring(start, end)
        .replace("<think>", "")
        .replace("</think>", "");
    String pureContent = (content.substring(0, start) + content.substring(end)).trim();

    response.setContent(pureContent);
    response.setReasoningContent(thinking);
}
```

### 7. 启用推理后首字延迟显著增加

**问题原因:**

推理模型需要先完成内部思考才开始输出，首字延迟 = 推理时间 + 第一个 token 网络延迟。Claude / OpenAI o1 的推理时间可达 5-15 秒。

**解决方案:**

- 前端在 `ai_chat_start` 消息到达后立即显示「AI 正在思考...」的占位提示
- 推送 `phase=thinking` 的首个增量后切换到「正在推理...」的进度提示
- 出现 `phase=content` 后才切换到真正的打字机效果

```javascript
let status = 'idle'

function onChatMessage(msg) {
  if (msg.type === 'ai_chat_start') {
    status = 'pending'; renderStatus('AI 正在思考...')
  } else if (msg.type === 'ai_chat_stream' && msg.phase === 'thinking') {
    if (status !== 'thinking') {
      status = 'thinking'; renderStatus('正在推理...')
    }
    appendThinking(msg.reasoningContent)
  } else if (msg.type === 'ai_chat_stream' && msg.phase === 'content') {
    if (status !== 'content') {
      status = 'content'; renderStatus('')
    }
    appendContent(msg.content)
  }
}
```

### 8. 后端配置 enable-thinking=false 时，前端传 thinkingEnabled=true 没有生效

**问题原因:**

这是 `ModelFactory.effectiveConfig()` 的「只能收窄」规则。后端配置为 `false` 时，请求级覆盖无法越权开启，避免前端绕过运维管控产生意外成本。

**解决方案:**

- 把后端配置改为 `enable-thinking: true`，然后让前端按需关闭
- 如果担心默认开启带来的成本，可以维持「默认开启 + return-thinking=false」的组合：模型仍然推理保证质量，但不下发推理内容到客户端

## 类型定义

### 配置类型

```java
public static class ModelConfig {
    /** API密钥 */
    private String apiKey;
    /** API地址 */
    private String baseUrl;
    /** 模型名称 */
    private String modelName;
    /** 温度参数 (0-2) */
    private Double temperature = 0.7;
    /** Top P参数 */
    private Double topP = 1.0;
    /** 最大Token数 */
    private Integer maxTokens = 2048;
    /** 是否启用 */
    private Boolean enabled = false;

    /** 是否开启深度思考 */
    private Boolean enableThinking = false;
    /** 思考预算 Token 数（仅 Claude/Qwen 生效） */
    private Integer thinkingBudgetTokens = 1024;
    /** OpenAI 推理强度: low | medium | high */
    private String reasoningEffort;
    /** 是否在响应中返回思考内容 */
    private Boolean returnThinking = true;

    /** 额外参数 */
    private Map<String, Object> extraParams = new HashMap<>();
}
```

### 请求与响应类型

```java
public class ChatRequest implements Serializable {
    private String sessionId;
    private String message;
    private ChatMode mode = ChatMode.CONTINUOUS;
    private String provider;
    private String modelName;
    private Boolean stream = true;
    private String systemPrompt;
    private Double temperature;
    private Integer maxTokens;

    /** 本次对话是否启用深度思考；null 表示沿用后端配置 */
    private Boolean thinkingEnabled;
    /** 思考预算 Token 数；null 表示沿用后端配置 */
    private Integer thinkingBudgetTokens;

    private List<Long> knowledgeBaseIds;
    private Map<String, Object> extraParams;
}

@Builder
@Data
public class AiChatResponse implements Serializable {
    private String sessionId;
    private String messageId;

    /** AI 回复正文（content 阶段累积） */
    private String content;
    /** 深度思考内容（流式时为单次增量，完成时为累积全文） */
    private String reasoningContent;
    /** 当前流式增量所属阶段: thinking | content | null */
    private String phase;

    @Builder.Default
    private Boolean finished = true;

    private TokenUsage tokenUsage;
    private Long responseTime;
    private List<DocumentReference> references;
    private String error;

    public static final class Phase {
        public static final String THINKING = "thinking";
        public static final String CONTENT = "content";
    }
}
```

### 工厂参数类型

```java
public record ThinkingOptions(Boolean enabled, Integer budgetTokens) {

    /** 无覆盖（完全沿用后端配置） */
    public static final ThinkingOptions NONE = new ThinkingOptions(null, null);

    /** 是否携带任何覆盖项 */
    public boolean isEmpty() {
        return enabled == null && budgetTokens == null;
    }
}
```

### WebSocket 响应类型

```java
public class AiChatStreamResponse extends AiChatWebSocketResponse {
    /** 消息ID */
    private String messageId;
    /** 内容片段（content 阶段使用） */
    private String content;
    /** 推理内容片段（thinking 阶段使用） */
    private String reasoningContent;
    /** 阶段：thinking | content */
    private String phase;
    /** 是否完成 */
    private Boolean finished = false;

    public static AiChatStreamResponse of(String sessionId, String messageId, String content);
    public static AiChatStreamResponse ofThinking(String sessionId, String messageId, String reasoningContent);
}
```

## 总结

深度思考是 LangChain4j 1.14.1 集成的核心新能力，框架通过五个层次完成了统一封装：

1. **配置层** - `ModelConfig.enableThinking / thinkingBudgetTokens / reasoningEffort / returnThinking` 四个字段覆盖所有供应商差异
2. **协议层** - `ModelFactory` 按供应商分别走 `returnThinking` / `thinkingType` / `defaultRequestParameters` / `think` 等原生协议
3. **请求层** - `ChatRequest.thinkingEnabled / thinkingBudgetTokens` 提供请求级覆盖，遵循「只能收窄」安全规则
4. **响应层** - `AiChatResponse.reasoningContent / phase` 统一两阶段输出协议，前端无需关心底层差异
5. **传输层** - `AiChatStreamResponse` 通过 `phase` 字段把思考与回复分通道推送，配合 `AiChatCompleteResponse` 在结束时回填完整推理

把深度思考能力真正用好的关键是抓住三个要点：选对推理模型、配好预算、分通道渲染。通过本文档介绍的配置与示例，可以快速在 RuoYi-Plus 项目中接入「会思考的 AI」，在复杂任务上获得显著的质量提升。
