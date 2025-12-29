# useAiChat AI 对话组合函数

## 介绍

`useAiChat` 是一组用于集成 AI 对话功能的组合式函数，提供了与后端 AI 服务进行交互的完整解决方案。该模块封装了 AI 调用的通用逻辑，支持多种 AI 功能场景，包括基础对话、文本优化、数据生成、内容审核和翻译等。

**核心特性：**

- **基础对话** - 通过 `useAiChat` 实现与 AI 模型的基础对话交互，支持自定义模型提供商、温度参数和系统提示词
- **文本优化** - 通过 `useAiTextOptimize` 支持六种优化模式：润色、扩写、精简、正式化、口语化、营销文案
- **数据生成** - 通过 `useAiDataGenerate` 根据字段定义自动生成测试数据，支持真实数据和随机数据模式
- **内容审核** - 通过 `useAiContentReview` 实现内容合规性检查、敏感词检测和质量评估
- **智能翻译** - 通过 `useAiTranslate` 实现多语言翻译，支持保持原文格式

## 基础用法

### 基础对话

使用 `useAiChat` 进行基础的 AI 对话交互：

```vue
<template>
  <div class="ai-chat-demo">
    <el-input
      v-model="message"
      type="textarea"
      :rows="3"
      placeholder="请输入您的问题..."
    />
    <el-button
      type="primary"
      :loading="loading"
      @click="handleSend"
    >
      发送
    </el-button>
    <div v-if="response" class="response">
      <h4>AI 回复：</h4>
      <p>{{ response }}</p>
      <div v-if="tokenUsage" class="token-info">
        Token 使用：{{ tokenUsage.totalTokens }}
      </div>
    </div>
    <div v-if="error" class="error">
      错误：{{ error.message }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAiChat } from '@/composables/useAiChat'

const message = ref('')

const {
  loading,
  response,
  tokenUsage,
  error,
  sendMessage
} = useAiChat({
  provider: 'deepseek',
  temperature: 0.7,
  onSuccess: (content) => {
    console.log('AI 回复成功:', content)
  },
  onError: (err) => {
    console.error('AI 调用失败:', err)
  }
})

const handleSend = async () => {
  if (!message.value.trim()) return

  try {
    await sendMessage(message.value)
    message.value = ''
  } catch (err) {
    // 错误已通过 error ref 处理
  }
}
</script>
```

**使用说明：**
- `loading` 表示当前是否正在等待 AI 响应
- `response` 包含 AI 返回的文本内容
- `tokenUsage` 记录本次调用的 Token 使用情况
- `error` 包含调用过程中的错误信息
- `sendMessage` 用于发送消息给 AI

### 配置选项

`useAiChat` 支持多种配置选项来定制 AI 行为：

```typescript
import { useAiChat } from '@/composables/useAiChat'

const { sendMessage } = useAiChat({
  // 模型提供商：deepseek、openai、azure 等
  provider: 'deepseek',

  // 具体模型名称
  modelName: 'deepseek-chat',

  // 温度参数：0-1，越高越随机
  temperature: 0.7,

  // 系统提示词：设定 AI 的角色和行为
  systemPrompt: '你是一个专业的技术顾问，擅长解答编程问题。',

  // 成功回调
  onSuccess: (response) => {
    console.log('收到回复:', response)
  },

  // 错误回调
  onError: (error) => {
    ElMessage.error(error.message)
  }
})
```

**配置参数说明：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| provider | `string` | `'deepseek'` | 模型提供商 |
| modelName | `string` | - | 具体模型名称 |
| temperature | `number` | `0.7` | 温度参数，控制输出随机性 |
| systemPrompt | `string` | - | 系统提示词 |
| onSuccess | `(response: string) => void` | - | 成功回调函数 |
| onError | `(error: Error) => void` | - | 错误回调函数 |

### 指定 AI 功能类型

发送消息时可以指定特定的 AI 功能类型：

```typescript
import { useAiChat } from '@/composables/useAiChat'

const { sendMessage } = useAiChat()

// 基础对话
await sendMessage('请介绍一下 Vue 3')

// 指定功能类型
await sendMessage('请优化这段文字', 'optimize')
await sendMessage('请生成测试数据', 'generate')
await sendMessage('请审核这段内容', 'review')
await sendMessage('请翻译成英文', 'translate')

// 临时覆盖配置
await sendMessage('使用更高温度回答', undefined, {
  temperature: 0.9,
  provider: 'openai'
})
```

## 文本优化

### 使用 useAiTextOptimize

`useAiTextOptimize` 提供了专业的文本优化功能，支持六种优化模式：

```vue
<template>
  <div class="text-optimize-demo">
    <el-input
      v-model="originalText"
      type="textarea"
      :rows="4"
      placeholder="请输入需要优化的文本..."
    />

    <el-select v-model="optimizeType" placeholder="选择优化类型">
      <el-option label="润色" value="polish" />
      <el-option label="扩写" value="expand" />
      <el-option label="精简" value="shorten" />
      <el-option label="正式化" value="formal" />
      <el-option label="口语化" value="casual" />
      <el-option label="营销文案" value="marketing" />
    </el-select>

    <el-button
      type="primary"
      :loading="loading"
      @click="handleOptimize"
    >
      优化文本
    </el-button>

    <div v-if="response" class="result">
      <h4>优化结果：</h4>
      <p>{{ response }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAiTextOptimize } from '@/composables/useAiChat'

const originalText = ref('')
const optimizeType = ref<'polish' | 'expand' | 'shorten' | 'formal' | 'casual' | 'marketing'>('polish')

const { loading, response, optimize } = useAiTextOptimize()

const handleOptimize = async () => {
  if (!originalText.value.trim()) return

  try {
    await optimize(originalText.value, optimizeType.value)
  } catch (err) {
    console.error('优化失败:', err)
  }
}
</script>
```

### 优化类型说明

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `polish` | 润色 | 使文本更加流畅专业 |
| `expand` | 扩写 | 增加细节和描述内容 |
| `shorten` | 精简 | 保留核心信息，删除冗余 |
| `formal` | 正式化 | 改写为正式专业的表达 |
| `casual` | 口语化 | 改写为轻松日常的表达 |
| `marketing` | 营销文案 | 改写为推广宣传文案 |

### 高级优化选项

```typescript
import { useAiTextOptimize } from '@/composables/useAiChat'

const { optimize } = useAiTextOptimize()

// 带高级选项的优化
await optimize('这是一段需要优化的文本', 'expand', {
  // 最大字数限制
  maxLength: 500,

  // 最小字数要求
  minLength: 200,

  // 必须包含的关键词
  keywords: ['创新', '高效', '专业'],

  // 文风要求
  style: '科技感、未来感'
})
```

## 数据生成

### 使用 useAiDataGenerate

`useAiDataGenerate` 可以根据字段定义自动生成测试数据：

```vue
<template>
  <div class="data-generate-demo">
    <el-form>
      <el-form-item label="生成数量">
        <el-input-number v-model="count" :min="1" :max="100" />
      </el-form-item>
      <el-form-item label="数据类型">
        <el-radio-group v-model="dataType">
          <el-radio label="realistic">真实数据</el-radio>
          <el-radio label="random">随机数据</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <el-button
      type="primary"
      :loading="loading"
      @click="handleGenerate"
    >
      生成数据
    </el-button>

    <el-table v-if="generatedData.length" :data="generatedData">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="age" label="年龄" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="电话" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAiDataGenerate } from '@/composables/useAiChat'
import type { FieldSchema } from '@/api/business/base/ai/aiTypes'

const count = ref(10)
const dataType = ref<'realistic' | 'random'>('realistic')
const generatedData = ref<any[]>([])

const { loading, generate } = useAiDataGenerate()

// 定义数据字段结构
const schema: FieldSchema[] = [
  { name: 'name', label: '姓名', type: 'string', required: true, example: '张三' },
  { name: 'age', label: '年龄', type: 'number', required: true, example: '25' },
  { name: 'email', label: '邮箱', type: 'email', required: true, example: 'zhangsan@example.com' },
  { name: 'phone', label: '电话', type: 'phone', required: false, example: '13800138000' }
]

const handleGenerate = async () => {
  try {
    generatedData.value = await generate(schema, count.value, {
      dataType: dataType.value
    })
  } catch (err) {
    console.error('生成失败:', err)
  }
}
</script>
```

### 字段定义

```typescript
interface FieldSchema {
  /** 字段名 */
  name: string
  /** 字段标签 */
  label: string
  /** 字段类型 */
  type: string
  /** 是否必填 */
  required?: boolean
  /** 示例值 */
  example?: string
}
```

**支持的字段类型：**
- `string` - 字符串
- `number` - 数字
- `email` - 邮箱地址
- `phone` - 电话号码
- `date` - 日期
- `datetime` - 日期时间
- `boolean` - 布尔值
- `url` - 网址
- `address` - 地址

## 内容审核

### 使用 useAiContentReview

`useAiContentReview` 提供内容审核功能，支持合规性检查、敏感词检测和质量评估：

```vue
<template>
  <div class="content-review-demo">
    <el-form label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="content.title" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="content.body" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>

    <el-checkbox-group v-model="checkItems">
      <el-checkbox label="compliance">合规性检查</el-checkbox>
      <el-checkbox label="sensitive">敏感词检测</el-checkbox>
      <el-checkbox label="quality">质量评估</el-checkbox>
    </el-checkbox-group>

    <el-button
      type="primary"
      :loading="loading"
      @click="handleReview"
    >
      开始审核
    </el-button>

    <div v-if="reviewResult" class="review-result">
      <el-tag :type="reviewResult.status === 'pass' ? 'success' : 'danger'">
        {{ reviewResult.status === 'pass' ? '审核通过' : '审核未通过' }}
      </el-tag>
      <p>评分：{{ reviewResult.score }}/100</p>
      <ul v-if="reviewResult.issues?.length">
        <li v-for="(issue, index) in reviewResult.issues" :key="index">
          {{ issue }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useAiContentReview } from '@/composables/useAiChat'

const content = reactive({
  title: '',
  body: ''
})

const checkItems = ref<('compliance' | 'sensitive' | 'quality')[]>(['compliance', 'sensitive'])
const reviewResult = ref<any>(null)

const { loading, review } = useAiContentReview()

const handleReview = async () => {
  try {
    reviewResult.value = await review(content, {
      checkItems: checkItems.value,
      autoFix: true
    })
  } catch (err) {
    console.error('审核失败:', err)
  }
}
</script>
```

### 审核选项

```typescript
interface AiReviewOptions {
  /** 检查项目 */
  checkItems?: ('compliance' | 'sensitive' | 'quality')[]
  /** 是否自动提供修复建议 */
  autoFix?: boolean
}
```

### 审核结果格式

```typescript
interface ReviewResult {
  /** 审核状态：pass-通过, fail-未通过 */
  status: 'pass' | 'fail'
  /** 评分：0-100 */
  score: number
  /** 发现的问题列表 */
  issues?: string[]
  /** 修复建议 */
  suggestions?: string[]
}
```

## 智能翻译

### 使用 useAiTranslate

`useAiTranslate` 提供多语言翻译功能：

```vue
<template>
  <div class="translate-demo">
    <el-input
      v-model="sourceText"
      type="textarea"
      :rows="4"
      placeholder="请输入需要翻译的文本..."
    />

    <el-select v-model="targetLanguage" placeholder="目标语言">
      <el-option label="英文" value="英文" />
      <el-option label="日文" value="日文" />
      <el-option label="韩文" value="韩文" />
      <el-option label="法文" value="法文" />
      <el-option label="德文" value="德文" />
      <el-option label="中文" value="中文" />
    </el-select>

    <el-checkbox v-model="keepFormat">保持原文格式</el-checkbox>

    <el-button
      type="primary"
      :loading="loading"
      @click="handleTranslate"
    >
      翻译
    </el-button>

    <div v-if="response" class="translation-result">
      <h4>翻译结果：</h4>
      <p>{{ response }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAiTranslate } from '@/composables/useAiChat'

const sourceText = ref('')
const targetLanguage = ref('英文')
const keepFormat = ref(true)

const { loading, response, translate } = useAiTranslate()

const handleTranslate = async () => {
  if (!sourceText.value.trim()) return

  try {
    await translate(sourceText.value, targetLanguage.value, {
      keepFormat: keepFormat.value
    })
  } catch (err) {
    console.error('翻译失败:', err)
  }
}
</script>
```

## API

### useAiChat

基础 AI 对话 Hook。

#### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| options | `UseAiChatOptions` | `{}` | 配置选项 |

#### UseAiChatOptions

```typescript
interface UseAiChatOptions {
  /** 模型提供商 */
  provider?: string
  /** 模型名称 */
  modelName?: string
  /** 温度参数 */
  temperature?: number
  /** 系统提示词 */
  systemPrompt?: string
  /** 成功回调 */
  onSuccess?: (response: string) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}
```

#### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| loading | `Ref<boolean>` | 加载状态 |
| response | `Ref<string>` | AI 响应内容 |
| tokenUsage | `Ref<TokenUsage \| null>` | Token 使用情况 |
| responseTime | `Ref<number \| null>` | 响应时间（毫秒） |
| error | `Ref<Error \| null>` | 错误信息 |
| sendMessage | `(message: string, aiFeature?: AiFeatureType, customOptions?: Partial<UseAiChatOptions>) => Promise<string>` | 发送消息 |
| reset | `() => void` | 重置状态 |

### useAiTextOptimize

文本优化 Hook。

#### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| loading | `Ref<boolean>` | 加载状态 |
| response | `Ref<string>` | 优化后的文本 |
| error | `Ref<Error \| null>` | 错误信息 |
| tokenUsage | `Ref<TokenUsage \| null>` | Token 使用情况 |
| responseTime | `Ref<number \| null>` | 响应时间 |
| optimize | `(text: string, type?: OptimizeType, options?: AiOptimizeOptions) => Promise<string>` | 执行优化 |

#### OptimizeType

```typescript
type OptimizeType = 'polish' | 'expand' | 'shorten' | 'formal' | 'casual' | 'marketing'
```

#### AiOptimizeOptions

```typescript
interface AiOptimizeOptions {
  /** 优化类型 */
  type?: OptimizeType
  /** 最大长度 */
  maxLength?: number
  /** 最小长度 */
  minLength?: number
  /** 关键词列表 */
  keywords?: string[]
  /** 文风要求 */
  style?: string
}
```

### useAiDataGenerate

数据生成 Hook。

#### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| loading | `Ref<boolean>` | 加载状态 |
| response | `Ref<string>` | 原始响应内容 |
| error | `Ref<Error \| null>` | 错误信息 |
| tokenUsage | `Ref<TokenUsage \| null>` | Token 使用情况 |
| responseTime | `Ref<number \| null>` | 响应时间 |
| generate | `(schema: FieldSchema[], count?: number, options?: AiGenerateOptions) => Promise<any[]>` | 生成数据 |

#### FieldSchema

```typescript
interface FieldSchema {
  /** 字段名 */
  name: string
  /** 字段标签 */
  label: string
  /** 字段类型 */
  type: string
  /** 是否必填 */
  required?: boolean
  /** 示例值 */
  example?: string
}
```

#### AiGenerateOptions

```typescript
interface AiGenerateOptions {
  /** 数据类型：realistic-真实数据, random-随机数据 */
  dataType?: 'realistic' | 'random'
}
```

### useAiContentReview

内容审核 Hook。

#### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| loading | `Ref<boolean>` | 加载状态 |
| response | `Ref<string>` | 原始响应内容 |
| error | `Ref<Error \| null>` | 错误信息 |
| tokenUsage | `Ref<TokenUsage \| null>` | Token 使用情况 |
| responseTime | `Ref<number \| null>` | 响应时间 |
| review | `(content: Record<string, any>, options?: AiReviewOptions) => Promise<ReviewResult>` | 执行审核 |

#### AiReviewOptions

```typescript
interface AiReviewOptions {
  /** 检查项目 */
  checkItems?: ('compliance' | 'sensitive' | 'quality')[]
  /** 是否自动修复 */
  autoFix?: boolean
}
```

### useAiTranslate

翻译 Hook。

#### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| loading | `Ref<boolean>` | 加载状态 |
| response | `Ref<string>` | 翻译结果 |
| error | `Ref<Error \| null>` | 错误信息 |
| tokenUsage | `Ref<TokenUsage \| null>` | Token 使用情况 |
| responseTime | `Ref<number \| null>` | 响应时间 |
| translate | `(text: string, targetLanguage?: string, options?: AiTranslateOptions) => Promise<string>` | 执行翻译 |

#### AiTranslateOptions

```typescript
interface AiTranslateOptions {
  /** 是否保持原文格式 */
  keepFormat?: boolean
}
```

### 类型定义

```typescript
/** AI 功能类型 */
type AiFeatureType = 'chat' | 'optimize' | 'generate' | 'review' | 'translate'

/** Token 使用情况 */
interface TokenUsage {
  /** 提示词 Token 数 */
  promptTokens: number
  /** 补全 Token 数 */
  completionTokens: number
  /** 总 Token 数 */
  totalTokens: number
}

/** AI 聊天请求参数 */
interface AiChatBo {
  /** 消息内容 */
  message: string
  /** AI 功能类型 */
  aiFeature?: AiFeatureType
  /** 模型提供商 */
  provider?: string
  /** 模型名称 */
  modelName?: string
  /** 温度参数 */
  temperature?: number
  /** 系统提示词 */
  systemPrompt?: string
}

/** AI 聊天响应 */
interface AiChatVo {
  /** 响应内容 */
  content: string
  /** Token 使用情况 */
  tokenUsage?: TokenUsage
  /** 响应时间（毫秒） */
  responseTime?: number
}
```

## 最佳实践

### 1. 错误处理

始终处理 AI 调用可能出现的错误：

```typescript
import { useAiChat } from '@/composables/useAiChat'
import { ElMessage } from 'element-plus'

const { sendMessage, error } = useAiChat({
  onError: (err) => {
    if (err.message.includes('timeout')) {
      ElMessage.error('AI 响应超时，请稍后重试')
    } else if (err.message.includes('quota')) {
      ElMessage.error('API 调用额度已用尽')
    } else {
      ElMessage.error(`AI 调用失败: ${err.message}`)
    }
  }
})

// 或使用 try-catch
try {
  const result = await sendMessage('你好')
} catch (err) {
  console.error('发送失败:', err)
}
```

### 2. 合理设置温度参数

根据场景选择合适的温度值：

```typescript
// 创意写作：高温度，更随机
const creativeChat = useAiChat({ temperature: 0.9 })

// 代码生成：低温度，更确定性
const codeChat = useAiChat({ temperature: 0.3 })

// 翻译任务：最低温度，保证准确性
const translateChat = useAiTranslate()
// 内部默认使用 0.3
```

### 3. 复用实例

对于同一类型的 AI 调用，复用组合函数实例：

```typescript
// ✅ 推荐：复用实例
const { sendMessage, loading, response } = useAiChat()

const askQuestion1 = () => sendMessage('问题1')
const askQuestion2 = () => sendMessage('问题2')

// ❌ 不推荐：每次创建新实例
const askQuestion = (question: string) => {
  const { sendMessage } = useAiChat() // 每次都创建新实例
  return sendMessage(question)
}
```

### 4. 状态重置

在需要时重置状态：

```typescript
const { sendMessage, reset, response, error } = useAiChat()

// 开始新对话前重置
const startNewConversation = () => {
  reset()
  // 其他初始化逻辑
}

// 组件卸载时重置
onUnmounted(() => {
  reset()
})
```

### 5. 加载状态展示

使用 loading 状态提供用户反馈：

```vue
<template>
  <div class="ai-container">
    <!-- 发送按钮 -->
    <el-button :loading="loading" @click="send">
      {{ loading ? 'AI 思考中...' : '发送' }}
    </el-button>

    <!-- 骨架屏 -->
    <el-skeleton v-if="loading" :rows="3" animated />

    <!-- 响应内容 -->
    <div v-else-if="response">{{ response }}</div>
  </div>
</template>
```

## 常见问题

### 1. AI 响应超时

**问题原因：**
- 网络延迟较高
- AI 模型处理时间长
- 请求内容过于复杂

**解决方案：**

```typescript
// 1. 增加超时时间（需要后端配合）
const { sendMessage } = useAiChat({
  // 后端需要支持超时配置
})

// 2. 提供取消功能
const controller = new AbortController()

// 3. 分批处理长文本
const longText = '...'
const chunks = splitIntoChunks(longText, 1000)
for (const chunk of chunks) {
  await sendMessage(chunk)
}
```

### 2. Token 超出限制

**问题原因：**
- 输入内容过长
- 系统提示词太长
- 历史消息累积过多

**解决方案：**

```typescript
// 1. 限制输入长度
const maxLength = 2000
const truncatedMessage = message.slice(0, maxLength)

// 2. 精简系统提示词
const systemPrompt = '你是专业顾问。' // 简洁明了

// 3. 检查 Token 使用情况
const { tokenUsage } = useAiChat()
watch(tokenUsage, (usage) => {
  if (usage && usage.totalTokens > 3000) {
    console.warn('Token 使用较高，建议开启新对话')
  }
})
```

### 3. 生成数据格式错误

**问题原因：**
- AI 返回的 JSON 格式不正确
- 字段定义不够清晰

**解决方案：**

```typescript
const { generate } = useAiDataGenerate()

// 1. 提供更明确的字段定义
const schema: FieldSchema[] = [
  {
    name: 'age',
    label: '年龄',
    type: 'number',
    required: true,
    example: '25' // 提供示例帮助 AI 理解
  }
]

// 2. 使用真实数据模式
const data = await generate(schema, 10, { dataType: 'realistic' })

// 3. 后处理验证
const validData = data.filter(item => {
  return typeof item.age === 'number' && item.age > 0
})
```

### 4. 翻译质量不佳

**问题原因：**
- 原文含有专业术语
- 语境信息不足

**解决方案：**

```typescript
const { translate } = useAiTranslate()

// 1. 提供上下文信息
const context = '以下是一段技术文档：'
const result = await translate(
  context + originalText,
  '英文',
  { keepFormat: true }
)

// 2. 分段翻译长文本
const paragraphs = text.split('\n\n')
const translations = await Promise.all(
  paragraphs.map(p => translate(p, '英文'))
)
const fullTranslation = translations.join('\n\n')
```

### 5. 多个 AI 调用冲突

**问题原因：**
- 多个组件同时调用 AI
- 状态管理混乱

**解决方案：**

```typescript
// 1. 每个功能使用独立实例
const chatAi = useAiChat()
const optimizeAi = useAiTextOptimize()
const translateAi = useAiTranslate()

// 2. 使用队列管理请求
const requestQueue: Array<() => Promise<void>> = []
let isProcessing = false

const enqueueRequest = (request: () => Promise<void>) => {
  requestQueue.push(request)
  processQueue()
}

const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) return
  isProcessing = true

  const request = requestQueue.shift()!
  await request()

  isProcessing = false
  processQueue()
}
```
