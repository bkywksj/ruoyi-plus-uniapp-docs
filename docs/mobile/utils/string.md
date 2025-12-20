# string 字符串工具

## 介绍

`string` 是字符串处理工具集，提供字符串判空、格式化、HTML 处理、URL 操作、路径处理、字节长度计算等常用功能。该工具集涵盖了移动端开发中常见的字符串操作场景，是项目中使用频率最高的工具模块之一。

**核心特性:**

- **判空处理** - 统一的空值判断和默认值处理，支持多种空值类型
- **格式化** - 首字母大写、截断、sprintf 格式化、命名风格转换
- **HTML 处理** - HTML 转文本、富文本适配、XSS 防护转义
- **URL 操作** - 查询参数解析和构建、外部链接识别
- **路径处理** - 路径规范化、通配符匹配、路径拼接
- **字节计算** - UTF-8 编码字节长度计算，精确处理中文和 Emoji
- **JSON 验证** - 安全的 JSON 字符串验证

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          String 字符串工具模块                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   判空处理       │  │   格式化功能     │  │   HTML 处理     │             │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤             │
│  │ parseStrEmpty   │  │ capitalize      │  │ html2Text       │             │
│  │ isEmpty         │  │ truncate        │  │ getTextExcerpt  │             │
│  │ isNotEmpty      │  │ sprintf         │  │ escapeHtml      │             │
│  │                 │  │ byteLength      │  │ adaptRichText   │             │
│  │                 │  │ createUniqueStr │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   URL 操作      │  │   路径处理       │  │   格式转换      │             │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤             │
│  │ getQueryObject  │  │ normalizePath   │  │ camelToKebab    │             │
│  │ objectToQuery   │  │ isPathMatch     │  │ kebabToCamel    │             │
│  │ addQueryParams  │  │ joinPath        │  │ snakeToCamel    │             │
│  │ isExternal      │  │                 │  │ isValidJSON     │             │
│  │ isHttp          │  │                 │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 模块依赖关系

```
┌──────────────────────────────────────────────────────────────┐
│                        应用层                                 │
├──────────────────────────────────────────────────────────────┤
│  页面组件  │  业务逻辑  │  API 请求  │  表单验证  │  列表展示  │
└──────┬─────┴─────┬──────┴─────┬──────┴─────┬──────┴─────┬─────┘
       │           │            │            │            │
       ▼           ▼            ▼            ▼            ▼
┌──────────────────────────────────────────────────────────────┐
│                    string 工具模块                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   判空处理 ────────────────────────────────► 表单验证        │
│      │                                                       │
│      ▼                                                       │
│   格式化功能 ──────────────────────────────► 数据展示        │
│      │                                                       │
│      ▼                                                       │
│   HTML 处理 ───────────────────────────────► 富文本/摘要     │
│      │                                                       │
│      ▼                                                       │
│   URL 操作 ────────────────────────────────► API 请求        │
│      │                                                       │
│      ▼                                                       │
│   路径处理 ────────────────────────────────► 路由/权限       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 判空处理

### parseStrEmpty

将空值转换为空字符串，统一处理 `null`、`undefined` 等空值类型：

```typescript
import { parseStrEmpty } from '@/utils/string'

// 处理各种空值
console.log(parseStrEmpty(null))      // ''
console.log(parseStrEmpty(undefined)) // ''
console.log(parseStrEmpty(''))        // ''
console.log(parseStrEmpty('hello'))   // 'hello'
console.log(parseStrEmpty(123))       // '123'
console.log(parseStrEmpty(0))         // '0'
console.log(parseStrEmpty(false))     // 'false'

// 实际应用 - 显示用户昵称
const displayName = parseStrEmpty(user.nickname) || '未设置昵称'

// 实际应用 - 表单数据处理
const formData = {
  username: parseStrEmpty(form.username),
  email: parseStrEmpty(form.email),
  phone: parseStrEmpty(form.phone)
}
```

**实现原理:**

```
输入值处理流程:
┌─────────────┐
│   输入值     │
└──────┬──────┘
       │
       ▼
┌──────────────────┐    是    ┌─────────────┐
│ value == null ?  │─────────►│ 返回 ''     │
└────────┬─────────┘          └─────────────┘
         │ 否
         ▼
┌──────────────────┐    是    ┌─────────────┐
│ value == '' ?    │─────────►│ 返回 ''     │
└────────┬─────────┘          └─────────────┘
         │ 否
         ▼
┌──────────────────┐
│ 返回 String(val) │
└──────────────────┘
```

### isEmpty / isNotEmpty

判断字符串是否为空，会自动处理空白字符：

```typescript
import { isEmpty, isNotEmpty } from '@/utils/string'

// 判断空值 - 各种情况
console.log(isEmpty(null))      // true
console.log(isEmpty(undefined)) // true
console.log(isEmpty(''))        // true
console.log(isEmpty('  '))      // true（空白字符也视为空）
console.log(isEmpty('\n\t'))    // true（换行和制表符也视为空）
console.log(isEmpty('hello'))   // false
console.log(isEmpty('  hi  '))  // false（有实际内容）

// 判断非空
console.log(isNotEmpty('hello')) // true
console.log(isNotEmpty(''))      // false
console.log(isNotEmpty('  '))    // false

// 表单验证示例
const validateForm = () => {
  const errors: string[] = []

  if (isEmpty(form.username)) {
    errors.push('请输入用户名')
  }

  if (isEmpty(form.password)) {
    errors.push('请输入密码')
  }

  if (isEmpty(form.email)) {
    errors.push('请输入邮箱')
  }

  return errors.length === 0 ? null : errors
}

// 条件渲染
const showPlaceholder = isEmpty(user.avatar)
```

**空值判断规则:**

| 输入值 | isEmpty 结果 | 说明 |
|--------|-------------|------|
| `null` | `true` | null 值 |
| `undefined` | `true` | undefined 值 |
| `''` | `true` | 空字符串 |
| `'  '` | `true` | 纯空白字符 |
| `'\n\t'` | `true` | 换行和制表符 |
| `'hello'` | `false` | 有实际内容 |
| `'  hi  '` | `false` | 包含实际内容 |
| `0` | `false` | 数字 0 |
| `false` | `false` | 布尔值 false |

## 格式化功能

### capitalize

首字母大写，其余字母转小写：

```typescript
import { capitalize } from '@/utils/string'

// 基本用法
console.log(capitalize('hello'))   // 'Hello'
console.log(capitalize('HELLO'))   // 'Hello'（其余转小写）
console.log(capitalize('hELLO'))   // 'Hello'
console.log(capitalize(''))        // ''
console.log(capitalize('a'))       // 'A'

// 格式化用户名
const formatUsername = (name: string) => {
  return capitalize(name.toLowerCase().trim())
}

// 格式化多个单词（仅首字母大写）
const formatTitle = (title: string) => {
  return title
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

console.log(formatTitle('hello world')) // 'Hello World'
```

### truncate

字符串截断，支持自定义省略符号：

```typescript
import { truncate } from '@/utils/string'

// 默认省略号 '...'
console.log(truncate('这是一段很长的文字需要截断', 10))
// '这是一段很长的文...'

// 自定义省略符
console.log(truncate('这是一段很长的文字需要截断', 10, '>>>'))
// '这是一段很长的>>>'

console.log(truncate('这是一段很长的文字需要截断', 10, '…'))
// '这是一段很长的文…'

// 不需要截断时返回原字符串
console.log(truncate('短文本', 10))
// '短文本'

// 边界情况
console.log(truncate('', 10))      // ''
console.log(truncate('hello', 0))  // '...'
console.log(truncate('hello', 3))  // '...'（长度小于省略符）

// 列表项标题截断
const formatListItem = (item: Article) => ({
  ...item,
  title: truncate(item.title, 20),
  summary: truncate(item.summary, 50)
})

// 消息通知截断
const formatNotification = (message: string) => {
  return truncate(message, 30, '...[查看更多]')
}
```

**截断算法流程:**

```
┌─────────────────────────────────────────────────────┐
│                 truncate 截断流程                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  输入: str = "这是一段很长的文字", length = 10       │
│       suffix = "..."                                │
│                                                     │
│  Step 1: 检查边界条件                                │
│  ┌─────────────────────────────────┐                │
│  │ str 为空? → 返回 ''             │                │
│  │ str.length <= length? → 返回 str│                │
│  └─────────────────────────────────┘                │
│                                                     │
│  Step 2: 计算截断位置                                │
│  ┌─────────────────────────────────┐                │
│  │ cutLength = length - suffix.len │                │
│  │ cutLength = 10 - 3 = 7          │                │
│  └─────────────────────────────────┘                │
│                                                     │
│  Step 3: 截断并拼接                                  │
│  ┌─────────────────────────────────┐                │
│  │ result = str.slice(0, 7) + '...'│                │
│  │ result = "这是一段很长的" + "..."│                │
│  └─────────────────────────────────┘                │
│                                                     │
│  输出: "这是一段很长的..."                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### byteLength

计算字符串的 UTF-8 字节长度，精确处理中文、Emoji 等多字节字符：

```typescript
import { byteLength } from '@/utils/string'

// ASCII 字符 - 1 字节
console.log(byteLength('hello'))    // 5
console.log(byteLength('12345'))    // 5

// 中文字符 - 3 字节
console.log(byteLength('你好'))      // 6 (2 × 3)
console.log(byteLength('中国'))      // 6 (2 × 3)

// 混合字符
console.log(byteLength('hello你好')) // 11 (5 + 6)
console.log(byteLength('a中b'))      // 5 (1 + 3 + 1)

// Emoji - 4 字节（UTF-8 编码）
console.log(byteLength('😀'))        // 4
console.log(byteLength('👨‍👩‍👧'))    // 18（组合 Emoji）

// 实际应用 - 数据库字段长度验证
const validateField = (value: string, maxBytes: number) => {
  const bytes = byteLength(value)
  if (bytes > maxBytes) {
    return `内容超出限制，当前 ${bytes} 字节，最大 ${maxBytes} 字节`
  }
  return null
}

// 验证用户名（数据库字段 VARCHAR(30)）
const error = validateField(username, 30)
if (error) {
  showError(error)
}
```

**UTF-8 编码字节计算规则:**

```
UTF-8 编码规则:
┌─────────────────────────────────────────────────────────────┐
│  Unicode 范围          │ UTF-8 字节数 │ 编码格式              │
├────────────────────────┼──────────────┼──────────────────────┤
│ U+0000 ~ U+007F        │ 1 字节       │ 0xxxxxxx             │
│ (ASCII)                │              │                      │
├────────────────────────┼──────────────┼──────────────────────┤
│ U+0080 ~ U+07FF        │ 2 字节       │ 110xxxxx 10xxxxxx    │
│ (拉丁扩展等)            │              │                      │
├────────────────────────┼──────────────┼──────────────────────┤
│ U+0800 ~ U+FFFF        │ 3 字节       │ 1110xxxx 10xxxxxx    │
│ (中日韩文字)            │              │ 10xxxxxx             │
├────────────────────────┼──────────────┼──────────────────────┤
│ U+10000 ~ U+10FFFF     │ 4 字节       │ 11110xxx 10xxxxxx    │
│ (Emoji、稀有字符)       │              │ 10xxxxxx 10xxxxxx    │
└─────────────────────────────────────────────────────────────┘
```

**实现算法:**

```typescript
/**
 * 计算字符串的 UTF-8 字节长度
 * 处理 JavaScript 的 UTF-16 代理对转换为 UTF-8 字节
 */
const byteLength = (str: string): number => {
  if (!str) return 0

  let bytes = 0
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)

    if (code <= 0x7F) {
      // ASCII: 1 字节
      bytes += 1
    } else if (code <= 0x7FF) {
      // 2 字节字符
      bytes += 2
    } else if (code >= 0xD800 && code <= 0xDBFF) {
      // 高代理项（Emoji 等 4 字节字符的前半部分）
      bytes += 4
      i++ // 跳过低代理项
    } else {
      // 3 字节字符（中日韩等）
      bytes += 3
    }
  }

  return bytes
}
```

### createUniqueString

生成唯一字符串，基于时间戳和随机数：

```typescript
import { createUniqueString } from '@/utils/string'

// 生成唯一 ID
const id1 = createUniqueString()
const id2 = createUniqueString()
console.log(id1) // '1703145600000abc123'
console.log(id2) // '1703145600001def456'
console.log(id1 !== id2) // true

// 生成临时文件名
const tempFileName = `temp_${createUniqueString()}.jpg`

// 生成表单唯一标识
const formId = `form_${createUniqueString()}`

// 生成缓存 key
const cacheKey = `cache_${createUniqueString()}`

// 批量生成唯一 ID
const generateIds = (count: number): string[] => {
  return Array.from({ length: count }, () => createUniqueString())
}
```

### sprintf

格式化字符串，类似 C 语言的 sprintf 函数：

```typescript
import { sprintf } from '@/utils/string'

// 字符串替换 %s
console.log(sprintf('Hello, %s!', 'World'))
// 'Hello, World!'

// 数字替换 %d
console.log(sprintf('Count: %d', 42))
// 'Count: 42'

// 多个参数
console.log(sprintf('%s has %d apples', 'Tom', 5))
// 'Tom has 5 apples'

// 复杂模板
console.log(sprintf('用户 %s 于 %s 完成了第 %d 个任务', '张三', '2025-01-01', 10))
// '用户 张三 于 2025-01-01 完成了第 10 个任务'

// 实际应用 - 错误信息
const errorMessage = sprintf('第%d行第%d列数据错误: %s', row, col, error)

// 实际应用 - 欢迎语
const welcomeText = sprintf('欢迎回来，%s！您有 %d 条未读消息', username, unreadCount)

// 实际应用 - 分页信息
const pageInfo = sprintf('共 %d 条记录，当前第 %d/%d 页', total, current, totalPages)
```

**格式说明符:**

| 说明符 | 类型 | 说明 |
|--------|------|------|
| `%s` | string | 字符串 |
| `%d` | number | 整数 |
| `%f` | number | 浮点数 |
| `%%` | - | 百分号字面量 |

## HTML 处理

### html2Text

将 HTML 内容转换为纯文本，移除所有标签：

```typescript
import { html2Text } from '@/utils/string'

// 移除 HTML 标签
const html = '<p>Hello <strong>World</strong></p>'
console.log(html2Text(html)) // 'Hello World'

// 处理复杂 HTML
const richContent = `
  <div class="article">
    <h1>标题</h1>
    <p>第一段内容</p>
    <p>第二段内容</p>
    <ul>
      <li>列表项1</li>
      <li>列表项2</li>
    </ul>
  </div>
`
console.log(html2Text(richContent))
// '标题第一段内容第二段内容列表项1列表项2'

// 处理带属性的标签
const htmlWithAttrs = '<a href="https://example.com" class="link">链接文字</a>'
console.log(html2Text(htmlWithAttrs)) // '链接文字'

// 处理自闭合标签
const htmlWithBr = '第一行<br/>第二行<br>第三行'
console.log(html2Text(htmlWithBr)) // '第一行第二行第三行'

// 列表摘要显示
const summary = truncate(html2Text(article.content), 100)
```

### getTextExcerpt

从 HTML 内容提取文本摘要，支持长度限制：

```typescript
import { getTextExcerpt } from '@/utils/string'

// 提取摘要
const html = '<p>这是一篇很长的文章内容，包含了很多有价值的信息...</p>'
const excerpt = getTextExcerpt(html, 20)
// '这是一篇很长的文章内容...'

// 处理富文本内容
const richContent = `
  <h1>文章标题</h1>
  <p>这是文章的第一段，介绍了文章的主要内容。</p>
  <p>这是第二段，包含更多细节信息。</p>
`
console.log(getTextExcerpt(richContent, 30))
// '文章标题这是文章的第一段，介绍...'

// 文章列表展示
const formatArticleList = (articles: Article[]) => {
  return articles.map(article => ({
    id: article.id,
    title: article.title,
    excerpt: getTextExcerpt(article.content, 100),
    author: article.author
  }))
}
```

### escapeHtml

HTML 特殊字符转义，防止 XSS 攻击：

```typescript
import { escapeHtml } from '@/utils/string'

// 转义特殊字符
console.log(escapeHtml('<script>alert("XSS")</script>'))
// '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

console.log(escapeHtml('Tom & Jerry'))
// 'Tom &amp; Jerry'

console.log(escapeHtml('"Hello" <World>'))
// '&quot;Hello&quot; &lt;World&gt;'

// 用户输入安全显示
const displayUserInput = (input: string) => {
  return escapeHtml(input)
}

// 评论内容安全渲染
const renderComment = (comment: Comment) => {
  return {
    ...comment,
    content: escapeHtml(comment.content)
  }
}

// 搜索关键词高亮（安全版）
const highlightKeyword = (text: string, keyword: string) => {
  const escaped = escapeHtml(text)
  const escapedKeyword = escapeHtml(keyword)
  return escaped.replace(
    new RegExp(escapedKeyword, 'gi'),
    `<mark>${escapedKeyword}</mark>`
  )
}
```

**转义字符映射表:**

| 原字符 | 转义后 | 说明 |
|--------|--------|------|
| `&` | `&amp;` | 和号 |
| `<` | `&lt;` | 小于号 |
| `>` | `&gt;` | 大于号 |
| `"` | `&quot;` | 双引号 |
| `'` | `&#39;` | 单引号 |

### adaptRichText

适配富文本内容用于小程序 rich-text 组件显示：

```typescript
import { adaptRichText } from '@/utils/string'

// 适配图片宽度
const html = '<img src="xxx" style="width:800px">'
const adapted = adaptRichText(html)
// 图片宽度被调整为 100%，适应屏幕

// 适配视频
const videoHtml = '<video src="xxx" width="640" height="360"></video>'
const adaptedVideo = adaptRichText(videoHtml)
// 视频尺寸适配移动端

// 在 rich-text 组件中使用
<template>
  <rich-text :nodes="adaptedContent" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { adaptRichText } from '@/utils/string'

const props = defineProps<{
  content: string
}>()

const adaptedContent = computed(() => {
  return adaptRichText(props.content)
})
</script>
```

**适配处理内容:**

```
富文本适配流程:
┌─────────────────────────────────────────────────────┐
│                                                     │
│  原始 HTML                                          │
│  ┌─────────────────────────────────────────┐        │
│  │ <img src="x" style="width:800px">       │        │
│  │ <video width="640" height="360">        │        │
│  │ <table style="width:1000px">            │        │
│  └─────────────────────────────────────────┘        │
│                    │                                │
│                    ▼                                │
│  ┌─────────────────────────────────────────┐        │
│  │           适配处理                        │        │
│  │  • 图片: max-width:100%                  │        │
│  │  • 视频: width:100%                      │        │
│  │  • 表格: overflow:auto                   │        │
│  │  • 移除脚本标签                           │        │
│  └─────────────────────────────────────────┘        │
│                    │                                │
│                    ▼                                │
│  适配后 HTML                                        │
│  ┌─────────────────────────────────────────┐        │
│  │ <img src="x" style="max-width:100%">    │        │
│  │ <video style="width:100%">              │        │
│  │ <div style="overflow:auto"><table>      │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## URL 操作

### getQueryObject

从 URL 解析查询参数，返回键值对对象：

```typescript
import { getQueryObject } from '@/utils/string'

// 解析当前页面 URL
const params = getQueryObject()
console.log(params.id)    // URL 中的 id 参数
console.log(params.type)  // URL 中的 type 参数

// 解析指定 URL
const url = 'https://example.com/page?id=123&name=test&tags=a,b,c'
const query = getQueryObject(url)
console.log(query)
// { id: '123', name: 'test', tags: 'a,b,c' }

// 处理编码参数
const encodedUrl = 'https://example.com?name=%E5%BC%A0%E4%B8%89&city=%E5%8C%97%E4%BA%AC'
const decodedQuery = getQueryObject(encodedUrl)
console.log(decodedQuery)
// { name: '张三', city: '北京' }

// 页面跳转后获取参数
onLoad(() => {
  const params = getQueryObject()
  if (params.orderId) {
    loadOrderDetail(params.orderId)
  }
})
```

### objectToQuery

将对象转换为 URL 查询字符串：

```typescript
import { objectToQuery } from '@/utils/string'

// 基本用法
const params = { id: 123, name: 'test', type: 'user' }
console.log(objectToQuery(params))
// 'id=123&name=test&type=user'

// 自动 URL 编码
const chineseParams = { name: '张三', city: '北京' }
console.log(objectToQuery(chineseParams))
// 'name=%E5%BC%A0%E4%B8%89&city=%E5%8C%97%E4%BA%AC'

// 过滤空值
const paramsWithEmpty = { id: 123, name: '', type: null, status: undefined }
const cleanParams = Object.fromEntries(
  Object.entries(paramsWithEmpty).filter(([_, v]) => v !== '' && v != null)
)
console.log(objectToQuery(cleanParams))
// 'id=123'

// 构建 API URL
const baseUrl = 'https://api.example.com/users'
const queryStr = objectToQuery({ page: 1, size: 10, status: 'active' })
const fullUrl = `${baseUrl}?${queryStr}`
// 'https://api.example.com/users?page=1&size=10&status=active'

// 数组参数处理
const arrayParams = { ids: [1, 2, 3] }
// 需要先转换数组
const serializedParams = {
  ids: arrayParams.ids.join(',')
}
console.log(objectToQuery(serializedParams))
// 'ids=1,2,3'
```

### addQueryParams

向已有 URL 添加查询参数：

```typescript
import { addQueryParams } from '@/utils/string'

// 添加单个参数
const url1 = addQueryParams('/api/users', { page: 1 })
// '/api/users?page=1'

// 添加多个参数
const url2 = addQueryParams('/api/users', { page: 1, size: 10, sort: 'name' })
// '/api/users?page=1&size=10&sort=name'

// 已有参数时追加
const url3 = addQueryParams('/api/users?type=admin', { page: 1 })
// '/api/users?type=admin&page=1'

// 覆盖已有参数
const url4 = addQueryParams('/api/users?page=1', { page: 2 })
// '/api/users?page=2'

// 实际应用 - 分页导航
const getPageUrl = (page: number) => {
  return addQueryParams(currentPath, { page, size: pageSize })
}

// 实际应用 - 添加筛选条件
const addFilter = (filterKey: string, filterValue: string) => {
  const newUrl = addQueryParams(window.location.href, {
    [filterKey]: filterValue
  })
  navigateTo({ url: newUrl })
}
```

### isExternal

判断链接是否为外部链接：

```typescript
import { isExternal } from '@/utils/string'

// 外部链接
console.log(isExternal('https://www.google.com'))    // true
console.log(isExternal('http://example.com'))        // true
console.log(isExternal('//cdn.example.com/file.js')) // true
console.log(isExternal('mailto:test@example.com'))   // true
console.log(isExternal('tel:+86-123-4567-8900'))     // true

// 内部链接
console.log(isExternal('/pages/index'))              // false
console.log(isExternal('./components/button'))       // false
console.log(isExternal('pages/user/profile'))        // false

// 导航时判断链接类型
const handleLinkClick = (url: string) => {
  if (isExternal(url)) {
    // 外部链接 - 使用系统浏览器打开
    // #ifdef APP-PLUS
    plus.runtime.openURL(url)
    // #endif
    // #ifdef H5
    window.open(url, '_blank')
    // #endif
  } else {
    // 内部链接 - 使用 uni-app 路由
    uni.navigateTo({ url })
  }
}

// 菜单渲染时区分链接类型
const renderMenuItem = (item: MenuItem) => {
  return {
    ...item,
    isExternal: isExternal(item.url),
    icon: isExternal(item.url) ? 'external-link' : 'internal-link'
  }
}
```

**外部链接判断规则:**

```
外部链接匹配模式:
┌────────────────────────────────────────────┐
│  /^(https?:)?\/\//    HTTP/HTTPS 协议      │
│  例: https://xxx, http://xxx, //xxx        │
├────────────────────────────────────────────┤
│  /^mailto:/           邮件链接             │
│  例: mailto:test@example.com               │
├────────────────────────────────────────────┤
│  /^tel:/              电话链接             │
│  例: tel:+86-123-4567-8900                 │
├────────────────────────────────────────────┤
│  /^data:/             Data URL             │
│  例: data:image/png;base64,xxx             │
└────────────────────────────────────────────┘
```

### isHttp

判断链接是否为 HTTP/HTTPS 协议：

```typescript
import { isHttp } from '@/utils/string'

// HTTP 链接
console.log(isHttp('https://www.example.com'))  // true
console.log(isHttp('http://api.example.com'))   // true

// 非 HTTP 链接
console.log(isHttp('//cdn.example.com'))        // false
console.log(isHttp('/api/users'))               // false
console.log(isHttp('ftp://files.example.com'))  // false
console.log(isHttp('mailto:test@example.com'))  // false

// 图片 URL 处理
const getImageUrl = (path: string) => {
  if (isHttp(path)) {
    // 已经是完整 URL
    return path
  }
  // 拼接基础 URL
  return `${import.meta.env.VITE_OSS_URL}${path}`
}

// API 请求地址处理
const getApiUrl = (endpoint: string) => {
  if (isHttp(endpoint)) {
    return endpoint
  }
  return `${baseUrl}${endpoint}`
}
```

## 路径处理

### normalizePath

规范化路径，处理多余斜杠和相对路径符号：

```typescript
import { normalizePath } from '@/utils/string'

// 处理多余斜杠
console.log(normalizePath('//pages//index//'))
// '/pages/index'

console.log(normalizePath('/api///users////list'))
// '/api/users/list'

// 处理相对路径
console.log(normalizePath('./pages/index'))
// 'pages/index'

console.log(normalizePath('../pages/index'))
// '../pages/index'

// 保持协议部分
console.log(normalizePath('https://example.com//api//users'))
// 'https://example.com/api/users'

// 统一路径格式
const routes = [
  '/pages/index/',
  'pages/user',
  '//pages//detail//',
  './pages/about'
].map(normalizePath)
// ['/pages/index', 'pages/user', '/pages/detail', 'pages/about']

// 构建文件路径
const buildFilePath = (...parts: string[]) => {
  return normalizePath(parts.join('/'))
}
```

### isPathMatch

路径模式匹配，支持通配符：

```typescript
import { isPathMatch } from '@/utils/string'

// 精确匹配
console.log(isPathMatch('/pages/index', '/pages/index'))
// true

console.log(isPathMatch('/pages/index', '/pages/user'))
// false

// 单层通配符 *
console.log(isPathMatch('/pages/user/*', '/pages/user/detail'))
// true

console.log(isPathMatch('/pages/user/*', '/pages/user/detail/edit'))
// false（* 只匹配一层）

// 多层通配符 **
console.log(isPathMatch('/pages/**', '/pages/user/detail'))
// true

console.log(isPathMatch('/api/**/users', '/api/v1/admin/users'))
// true

// 路由权限判断
const checkRoutePermission = (path: string, allowedPatterns: string[]) => {
  return allowedPatterns.some(pattern => isPathMatch(pattern, path))
}

const allowedRoutes = [
  '/pages/index',
  '/pages/user/*',
  '/pages/article/**'
]

console.log(checkRoutePermission('/pages/user/profile', allowedRoutes))
// true

console.log(checkRoutePermission('/pages/admin/settings', allowedRoutes))
// false

// 白名单路由检查
const whiteList = [
  '/pages/auth/**',
  '/pages/public/*',
  '/pages/error/*'
]

const isWhitelisted = (path: string) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}
```

**通配符匹配规则:**

```
路径匹配规则:
┌─────────────────────────────────────────────────────────────┐
│  通配符  │  含义                │  示例                      │
├──────────┼─────────────────────┼───────────────────────────┤
│   *      │  匹配单层路径        │  /user/* 匹配 /user/1     │
│          │  (不含 /)           │  不匹配 /user/1/edit       │
├──────────┼─────────────────────┼───────────────────────────┤
│   **     │  匹配多层路径        │  /api/** 匹配 /api/v1/x   │
│          │  (包含 /)           │  也匹配 /api/v1/x/y/z     │
├──────────┼─────────────────────┼───────────────────────────┤
│   无     │  精确匹配            │  /user 只匹配 /user        │
└─────────────────────────────────────────────────────────────┘

匹配流程:
┌─────────────┐
│ 输入: pattern, path │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ pattern 包含 ** ? │
└──────┬───────────┘
       │
   ┌───┴───┐
   │ 是    │ 否
   ▼       ▼
┌─────┐ ┌───────────────┐
│转换  │ │ pattern 包含 * │
│为正则│ └───────┬───────┘
└──┬──┘         │
   │        ┌───┴───┐
   │        │ 是    │ 否
   │        ▼       ▼
   │    ┌─────┐ ┌─────────┐
   │    │转换  │ │ 精确比较 │
   │    │为正则│ │ === 判断│
   │    └──┬──┘ └────┬────┘
   │       │         │
   ▼       ▼         ▼
┌──────────────────────┐
│   返回匹配结果        │
└──────────────────────┘
```

### joinPath

路径拼接，自动处理斜杠：

```typescript
import { joinPath } from '@/utils/string'

// 基本拼接
console.log(joinPath('/api', 'users', '123'))
// '/api/users/123'

// 自动处理多余斜杠
console.log(joinPath('/api/', '/users/', '/123'))
// '/api/users/123'

console.log(joinPath('api', 'users', 'list'))
// 'api/users/list'

// 构建 API 路径
const baseUrl = 'https://api.example.com'
const apiPath = joinPath(baseUrl, 'v1', 'users', userId)
// 'https://api.example.com/v1/users/123'

// 构建文件路径
const uploadPath = joinPath('uploads', userId, 'images', fileName)
// 'uploads/123/images/avatar.jpg'

// 实际应用 - API 请求封装
const createApiUrl = (module: string, action: string, id?: string) => {
  const parts = ['/api', module, action]
  if (id) parts.push(id)
  return joinPath(...parts)
}

console.log(createApiUrl('user', 'profile', '123'))
// '/api/user/profile/123'
```

## 格式转换

### camelToKebab

驼峰命名转连字符命名（kebab-case）：

```typescript
import { camelToKebab } from '@/utils/string'

// 基本转换
console.log(camelToKebab('backgroundColor'))
// 'background-color'

console.log(camelToKebab('fontSize'))
// 'font-size'

console.log(camelToKebab('borderTopLeftRadius'))
// 'border-top-left-radius'

// 保持小写
console.log(camelToKebab('lowercase'))
// 'lowercase'

// 生成 CSS 类名
const generateClassName = (componentName: string) => {
  return `wd-${camelToKebab(componentName)}`
}

console.log(generateClassName('Button'))       // 'wd-button'
console.log(generateClassName('DatePicker'))   // 'wd-date-picker'
console.log(generateClassName('ConfigProvider')) // 'wd-config-provider'

// 对象键名转换
const convertKeysToKebab = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      camelToKebab(key),
      value
    ])
  )
}

const styles = convertKeysToKebab({
  backgroundColor: '#fff',
  fontSize: '14px',
  borderRadius: '8px'
})
// { 'background-color': '#fff', 'font-size': '14px', 'border-radius': '8px' }
```

### kebabToCamel

连字符命名转驼峰命名（camelCase）：

```typescript
import { kebabToCamel } from '@/utils/string'

// 基本转换
console.log(kebabToCamel('background-color'))
// 'backgroundColor'

console.log(kebabToCamel('font-size'))
// 'fontSize'

console.log(kebabToCamel('border-top-left-radius'))
// 'borderTopLeftRadius'

// 保持无连字符的字符串
console.log(kebabToCamel('color'))
// 'color'

// 解析 CSS 属性名
const parseCssProperty = (property: string) => {
  return kebabToCamel(property)
}

// 组件名转换
const getComponentName = (tagName: string) => {
  // 移除 wd- 前缀并转换
  if (tagName.startsWith('wd-')) {
    return kebabToCamel(tagName.slice(3))
  }
  return kebabToCamel(tagName)
}

console.log(getComponentName('wd-button'))       // 'button'
console.log(getComponentName('wd-date-picker'))  // 'datePicker'

// 批量转换对象键名
const convertKeysToCamel = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      kebabToCamel(key),
      value
    ])
  )
}
```

### snakeToCamel

下划线命名转驼峰命名：

```typescript
import { snakeToCamel } from '@/utils/string'

// 基本转换
console.log(snakeToCamel('user_name'))
// 'userName'

console.log(snakeToCamel('created_at'))
// 'createdAt'

console.log(snakeToCamel('order_detail_id'))
// 'orderDetailId'

// 全大写下划线（常量风格）
console.log(snakeToCamel('MAX_SIZE'))
// 'maxSize'

// API 响应数据转换
const formatApiResponse = <T extends Record<string, any>>(data: T): T => {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    const camelKey = snakeToCamel(key)

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = formatApiResponse(value)
    } else if (Array.isArray(value)) {
      result[camelKey] = value.map(item =>
        typeof item === 'object' ? formatApiResponse(item) : item
      )
    } else {
      result[camelKey] = value
    }
  }

  return result as T
}

// 转换 API 响应
const apiResponse = {
  user_id: 1,
  user_name: '张三',
  created_at: '2025-01-01',
  user_profile: {
    avatar_url: 'xxx',
    nick_name: '昵称'
  }
}

const formattedData = formatApiResponse(apiResponse)
// {
//   userId: 1,
//   userName: '张三',
//   createdAt: '2025-01-01',
//   userProfile: {
//     avatarUrl: 'xxx',
//     nickName: '昵称'
//   }
// }
```

**命名风格对照表:**

| 风格 | 示例 | 使用场景 |
|------|------|---------|
| camelCase | `userName` | JavaScript/TypeScript 变量 |
| PascalCase | `UserName` | 类名、组件名 |
| kebab-case | `user-name` | CSS 类名、HTML 属性 |
| snake_case | `user_name` | 数据库字段、Python |
| SCREAMING_SNAKE | `USER_NAME` | 常量 |

### isValidJSON

验证字符串是否为有效的 JSON 格式：

```typescript
import { isValidJSON } from '@/utils/string'

// 有效的 JSON
console.log(isValidJSON('{"name":"test"}'))     // true
console.log(isValidJSON('[1, 2, 3]'))           // true
console.log(isValidJSON('"hello"'))             // true
console.log(isValidJSON('123'))                 // true
console.log(isValidJSON('true'))                // true
console.log(isValidJSON('null'))                // true

// 无效的 JSON
console.log(isValidJSON('{name: "test"}'))      // false（键名未加引号）
console.log(isValidJSON("{'name': 'test'}"))    // false（使用单引号）
console.log(isValidJSON('undefined'))           // false
console.log(isValidJSON(''))                    // false
console.log(isValidJSON('hello'))               // false

// 安全解析 JSON
const safeParseJSON = <T>(str: string, defaultValue: T): T => {
  if (!isValidJSON(str)) {
    return defaultValue
  }
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

// 表单数据验证
const validateJsonField = (value: string) => {
  if (!isValidJSON(value)) {
    return '请输入有效的 JSON 格式'
  }
  return null
}

// 缓存数据读取
const getCachedData = <T>(key: string, defaultValue: T): T => {
  const cached = localStorage.getItem(key)
  if (!cached || !isValidJSON(cached)) {
    return defaultValue
  }
  return JSON.parse(cached)
}
```

## 实际应用场景

### 表单数据处理

```typescript
import { isEmpty, parseStrEmpty, truncate, byteLength } from '@/utils/string'

interface FormData {
  username: string
  nickname: string
  email: string
  remark: string
}

// 表单验证
const validateForm = (form: FormData) => {
  const errors: Record<string, string> = {}

  if (isEmpty(form.username)) {
    errors.username = '用户名不能为空'
  } else if (byteLength(form.username) > 30) {
    errors.username = '用户名长度不能超过30字节'
  }

  if (isEmpty(form.email)) {
    errors.email = '邮箱不能为空'
  }

  if (byteLength(form.remark) > 500) {
    errors.remark = '备注长度不能超过500字节'
  }

  return Object.keys(errors).length > 0 ? errors : null
}

// 数据提交前处理
const prepareSubmitData = (form: FormData) => {
  return {
    username: parseStrEmpty(form.username).trim(),
    nickname: parseStrEmpty(form.nickname).trim(),
    email: parseStrEmpty(form.email).trim().toLowerCase(),
    remark: truncate(parseStrEmpty(form.remark), 200)
  }
}

// 使用示例
const handleSubmit = async () => {
  const errors = validateForm(formData)
  if (errors) {
    showErrors(errors)
    return
  }

  const data = prepareSubmitData(formData)
  await submitApi(data)
}
```

### API 请求构建

```typescript
import { objectToQuery, joinPath, addQueryParams, isHttp } from '@/utils/string'

// API 请求封装
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // 构建完整 URL
  buildUrl(endpoint: string, params?: Record<string, any>): string {
    // 如果已经是完整 URL，直接返回
    if (isHttp(endpoint)) {
      return params ? addQueryParams(endpoint, params) : endpoint
    }

    // 拼接基础 URL
    const url = joinPath(this.baseUrl, endpoint)
    return params ? addQueryParams(url, params) : url
  }

  // GET 请求
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params)
    const response = await fetch(url)
    return response.json()
  }

  // POST 请求
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

// 使用示例
const api = new ApiClient('https://api.example.com/v1')

// 获取用户列表
const users = await api.get('/users', { page: 1, size: 10, status: 'active' })

// 创建用户
const newUser = await api.post('/users', { name: '张三', email: 'test@example.com' })
```

### 文章列表显示

```typescript
import { html2Text, truncate, getTextExcerpt, escapeHtml } from '@/utils/string'

interface Article {
  id: number
  title: string
  content: string
  author: string
  createTime: string
}

interface ArticleListItem {
  id: number
  title: string
  summary: string
  author: string
  createTime: string
}

// 处理文章列表数据
const formatArticleList = (articles: Article[]): ArticleListItem[] => {
  return articles.map(article => ({
    id: article.id,
    title: truncate(escapeHtml(article.title), 30),
    summary: getTextExcerpt(article.content, 100),
    author: escapeHtml(article.author),
    createTime: article.createTime
  }))
}

// 搜索结果高亮
const highlightSearchResult = (
  articles: Article[],
  keyword: string
): ArticleListItem[] => {
  const safeKeyword = escapeHtml(keyword)
  const regex = new RegExp(`(${safeKeyword})`, 'gi')

  return articles.map(article => {
    const plainTitle = escapeHtml(article.title)
    const plainSummary = getTextExcerpt(article.content, 100)

    return {
      id: article.id,
      title: plainTitle.replace(regex, '<mark>$1</mark>'),
      summary: plainSummary.replace(regex, '<mark>$1</mark>'),
      author: article.author,
      createTime: article.createTime
    }
  })
}
```

### 路由权限控制

```typescript
import { isPathMatch, normalizePath, isExternal } from '@/utils/string'

// 权限白名单
const whiteList = [
  '/pages/auth/login',
  '/pages/auth/register',
  '/pages/public/**',
  '/pages/error/*'
]

// 需要登录的路由
const authRequired = [
  '/pages/user/**',
  '/pages/order/**',
  '/pages/settings/**'
]

// 检查是否在白名单中
const isWhitelisted = (path: string): boolean => {
  const normalizedPath = normalizePath(path)
  return whiteList.some(pattern => isPathMatch(pattern, normalizedPath))
}

// 检查是否需要登录
const requiresAuth = (path: string): boolean => {
  const normalizedPath = normalizePath(path)
  return authRequired.some(pattern => isPathMatch(pattern, normalizedPath))
}

// 路由守卫
const routeGuard = (to: string) => {
  // 外部链接不处理
  if (isExternal(to)) {
    return true
  }

  // 白名单直接放行
  if (isWhitelisted(to)) {
    return true
  }

  // 需要登录的路由检查 token
  if (requiresAuth(to)) {
    const token = getToken()
    if (!token) {
      // 重定向到登录页
      uni.redirectTo({
        url: `/pages/auth/login?redirect=${encodeURIComponent(to)}`
      })
      return false
    }
  }

  return true
}
```

### 数据格式转换

```typescript
import { snakeToCamel, camelToKebab, kebabToCamel } from '@/utils/string'

// API 响应数据转换（snake_case → camelCase）
const transformApiResponse = <T extends Record<string, any>>(data: T): T => {
  if (!data || typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => transformApiResponse(item)) as T
  }

  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    const camelKey = snakeToCamel(key)
    result[camelKey] = transformApiResponse(value)
  }

  return result as T
}

// API 请求数据转换（camelCase → snake_case）
const transformApiRequest = <T extends Record<string, any>>(data: T): T => {
  if (!data || typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => transformApiRequest(item)) as T
  }

  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    // camelToSnake 转换
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    result[snakeKey] = transformApiRequest(value)
  }

  return result as T
}

// CSS 属性转换
const styleObjectToString = (styles: Record<string, string | number>): string => {
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = camelToKebab(key)
      const cssValue = typeof value === 'number' ? `${value}px` : value
      return `${cssKey}: ${cssValue}`
    })
    .join('; ')
}

// 使用示例
const styles = {
  backgroundColor: '#fff',
  fontSize: 14,
  borderRadius: 8,
  paddingTop: 10
}

console.log(styleObjectToString(styles))
// 'background-color: #fff; font-size: 14px; border-radius: 8px; padding-top: 10px'
```

## API

### 判空函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `parseStrEmpty` | 空值转空字符串 | `(value: any)` | `string` |
| `isEmpty` | 判断是否为空 | `(value: any)` | `boolean` |
| `isNotEmpty` | 判断是否非空 | `(value: any)` | `boolean` |

### 格式化函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `capitalize` | 首字母大写 | `(str: string)` | `string` |
| `truncate` | 字符串截断 | `(str: string, length: number, suffix?: string)` | `string` |
| `sprintf` | 格式化字符串 | `(format: string, ...args: any[])` | `string` |
| `byteLength` | 计算字节长度 | `(str: string)` | `number` |
| `createUniqueString` | 生成唯一字符串 | `()` | `string` |

### HTML 处理函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `html2Text` | HTML 转文本 | `(html: string)` | `string` |
| `getTextExcerpt` | 提取文本摘要 | `(html: string, length: number)` | `string` |
| `escapeHtml` | HTML 字符转义 | `(str: string)` | `string` |
| `adaptRichText` | 适配富文本 | `(html: string)` | `string` |

### URL 操作函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `getQueryObject` | 解析查询参数 | `(url?: string)` | `Record<string, string>` |
| `objectToQuery` | 对象转查询串 | `(obj: Record<string, any>)` | `string` |
| `addQueryParams` | 添加查询参数 | `(url: string, params: Record<string, any>)` | `string` |
| `isExternal` | 判断外部链接 | `(url: string)` | `boolean` |
| `isHttp` | 判断 HTTP 链接 | `(url: string)` | `boolean` |

### 路径处理函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `normalizePath` | 规范化路径 | `(path: string)` | `string` |
| `isPathMatch` | 路径匹配 | `(pattern: string, path: string)` | `boolean` |
| `joinPath` | 路径拼接 | `(...parts: string[])` | `string` |

### 格式转换函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `camelToKebab` | 驼峰转连字符 | `(str: string)` | `string` |
| `kebabToCamel` | 连字符转驼峰 | `(str: string)` | `string` |
| `snakeToCamel` | 下划线转驼峰 | `(str: string)` | `string` |
| `isValidJSON` | 验证 JSON 格式 | `(str: string)` | `boolean` |

### 类型定义

```typescript
/**
 * 查询参数对象类型
 */
type QueryObject = Record<string, string>

/**
 * 格式化函数的替换符类型
 */
type SprintfArg = string | number | boolean

/**
 * 路径匹配模式
 * - 精确匹配: '/pages/index'
 * - 单层通配: '/pages/*'
 * - 多层通配: '/pages/**'
 */
type PathPattern = string

/**
 * 命名风格类型
 */
type NamingStyle = 'camelCase' | 'kebab-case' | 'snake_case' | 'PascalCase'
```

## 最佳实践

### 1. 统一空值处理

```typescript
// ✅ 推荐：封装统一的显示函数
const displayText = (value: any, defaultText = '-') => {
  return isNotEmpty(value) ? String(value) : defaultText
}

// 使用
<text>{{ displayText(user.phone) }}</text>
<text>{{ displayText(user.email, '未绑定') }}</text>

// ❌ 不推荐：每处单独判断
<text>{{ user.phone || '-' }}</text>
<text>{{ user.email ? user.email : '未绑定' }}</text>
```

### 2. URL 参数安全处理

```typescript
// ✅ 推荐：使用工具函数处理
const getUrlParam = (key: string, defaultValue = '') => {
  const params = getQueryObject()
  return params[key] || defaultValue
}

// 构建 URL 时过滤空值
const buildUrl = (base: string, params: Record<string, any>) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== '')
  )
  return addQueryParams(base, cleanParams)
}

// ❌ 不推荐：直接拼接字符串
const url = `/api/users?id=${id}&name=${name}`
```

### 3. XSS 防护

```typescript
// ✅ 推荐：用户输入始终转义
const displayUserContent = (content: string) => {
  return escapeHtml(content)
}

// 富文本内容使用专门的组件处理
<rich-text :nodes="adaptRichText(content)" />

// ❌ 不推荐：直接渲染用户输入
<view v-html="userInput"></view>
```

### 4. 字节长度验证

```typescript
// ✅ 推荐：数据库字段长度验证使用字节长度
const validateDbField = (value: string, maxBytes: number, fieldName: string) => {
  const bytes = byteLength(value)
  if (bytes > maxBytes) {
    return `${fieldName}超出长度限制（当前${bytes}字节，最大${maxBytes}字节）`
  }
  return null
}

// ❌ 不推荐：使用字符长度验证（中文3字节会导致数据库溢出）
if (value.length > 30) {
  return '超出长度限制'
}
```

### 5. 路径处理规范化

```typescript
// ✅ 推荐：路径操作前先规范化
const handleRoute = (path: string) => {
  const normalizedPath = normalizePath(path)

  if (isPathMatch('/pages/auth/**', normalizedPath)) {
    // 认证相关页面
  }
}

// ❌ 不推荐：直接比较可能不一致的路径
if (path === '/pages//index/') {
  // 可能匹配不上
}
```

### 6. API 数据格式转换

```typescript
// ✅ 推荐：统一在请求层转换
const request = {
  // 请求拦截器：camelCase → snake_case
  transformRequest: (data) => transformApiRequest(data),

  // 响应拦截器：snake_case → camelCase
  transformResponse: (data) => transformApiResponse(data)
}

// ❌ 不推荐：每处单独转换
const userData = {
  user_name: formData.userName,
  created_at: formData.createdAt
}
```

### 7. 文本摘要提取

```typescript
// ✅ 推荐：组合使用 html2Text 和 truncate
const getArticleSummary = (htmlContent: string, maxLength = 100) => {
  const plainText = html2Text(htmlContent)
  return truncate(plainText, maxLength)
}

// 或使用 getTextExcerpt（内部已处理）
const summary = getTextExcerpt(htmlContent, 100)

// ❌ 不推荐：直接截断 HTML
const summary = htmlContent.slice(0, 100) + '...'
```

## 常见问题

### 1. isEmpty 对数字 0 的处理？

`isEmpty` 判断的是字符串空值，数字 0 不被视为空：

```typescript
isEmpty(0)       // false
isEmpty('0')     // false
isEmpty('')      // true
isEmpty(null)    // true

// 如需同时判断数字 0，使用显式比较
const isEmptyOrZero = (value: any) => isEmpty(value) || value === 0
```

### 2. truncate 中文字符计算问题？

`truncate` 按字符数计算，中文和英文都算一个字符。如需按字节截断，应结合 `byteLength` 使用：

```typescript
// 按字符截断
truncate('你好世界hello', 5) // '你好世界h...'

// 按字节截断（数据库场景）
const truncateByBytes = (str: string, maxBytes: number) => {
  let bytes = 0
  let result = ''

  for (const char of str) {
    const charBytes = byteLength(char)
    if (bytes + charBytes > maxBytes - 3) { // 预留 '...' 的空间
      return result + '...'
    }
    bytes += charBytes
    result += char
  }

  return result
}
```

### 3. URL 编码问题？

`objectToQuery` 会自动进行 URL 编码，`getQueryObject` 会自动解码：

```typescript
// 编码
objectToQuery({ name: '张三', tag: 'a&b' })
// 'name=%E5%BC%A0%E4%B8%89&tag=a%26b'

// 解码
getQueryObject('?name=%E5%BC%A0%E4%B8%89')
// { name: '张三' }

// 注意：如果参数值本身包含编码，可能需要多次解码
const fullyDecode = (str: string) => {
  try {
    const decoded = decodeURIComponent(str)
    return decoded === str ? str : fullyDecode(decoded)
  } catch {
    return str
  }
}
```

### 4. isPathMatch 性能优化？

频繁调用 `isPathMatch` 时，可以预编译正则表达式：

```typescript
// 预编译匹配器
const createPathMatcher = (patterns: string[]) => {
  const regexes = patterns.map(pattern => {
    const regexStr = pattern
      .replace(/\*\*/g, '{{DOUBLE}}')
      .replace(/\*/g, '[^/]*')
      .replace(/{{DOUBLE}}/g, '.*')
    return new RegExp(`^${regexStr}$`)
  })

  return (path: string) => regexes.some(regex => regex.test(path))
}

// 使用
const isWhitelisted = createPathMatcher(['/pages/auth/**', '/pages/public/*'])

isWhitelisted('/pages/auth/login')  // true
isWhitelisted('/pages/admin/users') // false
```

### 5. escapeHtml 与 v-html 的关系？

`escapeHtml` 是防止 XSS 攻击的手段，但在某些场景需要区分处理：

```typescript
// 场景1：纯文本显示 - 使用 escapeHtml
<text>{{ escapeHtml(userInput) }}</text>

// 场景2：需要渲染 HTML - 使用 adaptRichText（内部会过滤危险标签）
<rich-text :nodes="adaptRichText(richContent)" />

// 场景3：可信内容（如系统生成）- 可直接渲染
<view v-html="systemGeneratedHtml"></view>

// 绝对禁止：直接渲染用户输入
// ❌ <view v-html="userInput"></view>
```

### 6. byteLength 与数据库字段长度？

MySQL 的 VARCHAR 长度单位是字符还是字节取决于字符集：

```typescript
// UTF-8 字符集下，VARCHAR(30) 可存储：
// - 30 个 ASCII 字符
// - 10 个中文字符（每个 3 字节）
// - 混合字符需要计算

// 推荐使用 byteLength 验证
const validateVarchar = (value: string, maxChars: number) => {
  // MySQL VARCHAR(n) 在 utf8mb4 下，n 是字符数，每字符最多 4 字节
  // 但实际中文是 3 字节，英文是 1 字节
  const bytes = byteLength(value)
  const maxBytes = maxChars * 3 // 保守估计，按中文计算

  if (bytes > maxBytes) {
    return `内容过长，请精简`
  }
  return null
}
```

### 7. snakeToCamel 处理连续下划线？

连续下划线会被视为单个分隔符：

```typescript
snakeToCamel('user__name')   // 'userName'（双下划线）
snakeToCamel('user___name')  // 'userName'（三下划线）
snakeToCamel('__user_name')  // 'UserName'（前导下划线转大写）

// 如需保留前导下划线，可以特殊处理
const snakeToCamelPreserveLeading = (str: string) => {
  const leading = str.match(/^_+/)?.[0] || ''
  const rest = str.slice(leading.length)
  return leading + snakeToCamel(rest)
}
```

### 8. 如何处理特殊字符的路径匹配？

路径中包含特殊字符时需要转义：

```typescript
// 问题：路径包含正则特殊字符
const path = '/pages/[id]/detail'

// 解决：转义特殊字符
const escapeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 或者使用精确匹配
const exactMatch = (pattern: string, path: string) => {
  return pattern === path
}
```

## 总结

string 字符串工具模块是项目中最基础也是最常用的工具模块，涵盖了以下核心功能：

1. **判空处理** - `parseStrEmpty`、`isEmpty`、`isNotEmpty` 统一空值判断
2. **格式化功能** - `capitalize`、`truncate`、`sprintf`、`byteLength` 字符串格式化
3. **HTML 处理** - `html2Text`、`escapeHtml`、`adaptRichText` 安全处理 HTML
4. **URL 操作** - `getQueryObject`、`objectToQuery`、`isExternal` URL 参数处理
5. **路径处理** - `normalizePath`、`isPathMatch`、`joinPath` 路径规范化和匹配
6. **格式转换** - `camelToKebab`、`snakeToCamel` 命名风格转换

使用建议：

- 始终使用 `isEmpty` 而非 `!value` 判断空值
- 用户输入显示前使用 `escapeHtml` 防止 XSS
- 数据库字段验证使用 `byteLength` 而非 `length`
- URL 参数处理使用工具函数而非字符串拼接
- 路径比较前先使用 `normalizePath` 规范化
