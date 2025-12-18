# string 字符串工具

## 介绍

`string` 是字符串处理工具集，提供字符串判空、格式化、HTML 处理、URL 操作、路径处理等常用功能。该工具集涵盖了移动端开发中常见的字符串操作场景。

**核心特性:**

- **判空处理** - 统一的空值判断和默认值处理
- **格式化** - 首字母大写、截断、sprintf 格式化
- **HTML 处理** - HTML 转文本、富文本适配
- **URL 操作** - 查询参数解析和构建
- **路径处理** - 路径规范化和匹配

## 判空处理

### parseStrEmpty

将空值转换为空字符串：

```typescript
import { parseStrEmpty } from '@/utils/string'

// 处理各种空值
console.log(parseStrEmpty(null))      // ''
console.log(parseStrEmpty(undefined)) // ''
console.log(parseStrEmpty(''))        // ''
console.log(parseStrEmpty('hello'))   // 'hello'
console.log(parseStrEmpty(123))       // '123'

// 实际应用
const displayName = parseStrEmpty(user.nickname) || '未设置昵称'
```

### isEmpty / isNotEmpty

判断字符串是否为空：

```typescript
import { isEmpty, isNotEmpty } from '@/utils/string'

// 判断空值
console.log(isEmpty(null))      // true
console.log(isEmpty(undefined)) // true
console.log(isEmpty(''))        // true
console.log(isEmpty('  '))      // true（空白字符也视为空）
console.log(isEmpty('hello'))   // false

// 判断非空
console.log(isNotEmpty('hello')) // true
console.log(isNotEmpty(''))      // false

// 表单验证
const validateForm = () => {
  if (isEmpty(form.username)) {
    showError('请输入用户名')
    return false
  }
  return true
}
```

## 格式化功能

### capitalize

首字母大写：

```typescript
import { capitalize } from '@/utils/string'

console.log(capitalize('hello'))  // 'Hello'
console.log(capitalize('HELLO'))  // 'Hello'（其余转小写）
console.log(capitalize(''))       // ''

// 格式化名称
const formatName = (name: string) => capitalize(name.toLowerCase())
```

### truncate

字符串截断：

```typescript
import { truncate } from '@/utils/string'

// 默认省略号
console.log(truncate('这是一段很长的文字', 10))
// '这是一段很长的文...'

// 自定义省略符
console.log(truncate('这是一段很长的文字', 10, '>>>'))
// '这是一段很长的>>>''

// 不需要截断时返回原字符串
console.log(truncate('短文本', 10))
// '短文本'

// 列表显示
const items = data.map(item => ({
  ...item,
  title: truncate(item.title, 20)
}))
```

### sprintf

格式化字符串（类似 C 语言的 sprintf）：

```typescript
import { sprintf } from '@/utils/string'

// 基本用法
console.log(sprintf('Hello, %s!', 'World'))
// 'Hello, World!'

// 多个参数
console.log(sprintf('%s has %d apples', 'Tom', 5))
// 'Tom has 5 apples'

// 实际应用
const errorMessage = sprintf('第%d行第%d列数据错误', row, col)
const welcomeText = sprintf('欢迎回来，%s！', username)
```

## HTML 处理

### html2Text

HTML 转纯文本：

```typescript
import { html2Text } from '@/utils/string'

// 移除 HTML 标签
const html = '<p>Hello <strong>World</strong></p>'
console.log(html2Text(html)) // 'Hello World'

// 处理富文本内容
const richContent = '<div><p>段落1</p><p>段落2</p></div>'
console.log(html2Text(richContent)) // '段落1段落2'

// 列表摘要显示
const summary = truncate(html2Text(article.content), 100)
```

### adaptRichText

适配富文本内容（用于小程序 rich-text）：

```typescript
import { adaptRichText } from '@/utils/string'

// 适配图片宽度
const html = '<img src="xxx" style="width:800px">'
const adapted = adaptRichText(html)
// 图片宽度被调整为 100%

// 在 rich-text 组件中使用
<rich-text :nodes="adaptRichText(content)" />
```

## URL 操作

### getQueryObject

从 URL 解析查询参数：

```typescript
import { getQueryObject } from '@/utils/string'

// 解析当前 URL
const params = getQueryObject()
console.log(params.id)    // URL 中的 id 参数
console.log(params.type)  // URL 中的 type 参数

// 解析指定 URL
const url = 'https://example.com/page?id=123&name=test'
const query = getQueryObject(url)
console.log(query) // { id: '123', name: 'test' }
```

### objectToQuery

对象转查询字符串：

```typescript
import { objectToQuery } from '@/utils/string'

// 基本用法
const params = { id: 123, name: 'test', type: 'user' }
console.log(objectToQuery(params))
// 'id=123&name=test&type=user'

// 构建 URL
const baseUrl = 'https://api.example.com/users'
const queryStr = objectToQuery({ page: 1, size: 10 })
const fullUrl = `${baseUrl}?${queryStr}`
// 'https://api.example.com/users?page=1&size=10'

// 过滤空值
const cleanParams = Object.fromEntries(
  Object.entries(params).filter(([_, v]) => v !== '' && v !== null)
)
const queryString = objectToQuery(cleanParams)
```

### addQueryParams

向 URL 添加查询参数：

```typescript
import { addQueryParams } from '@/utils/string'

// 添加单个参数
const url1 = addQueryParams('/api/users', { page: 1 })
// '/api/users?page=1'

// 添加多个参数
const url2 = addQueryParams('/api/users', { page: 1, size: 10 })
// '/api/users?page=1&size=10'

// 已有参数时追加
const url3 = addQueryParams('/api/users?type=admin', { page: 1 })
// '/api/users?type=admin&page=1'
```

## 路径处理

### normalizePath

规范化路径：

```typescript
import { normalizePath } from '@/utils/string'

// 处理多余斜杠
console.log(normalizePath('//pages//index//'))
// '/pages/index'

// 处理相对路径
console.log(normalizePath('./pages/index'))
// 'pages/index'

// 统一路径格式
const routes = [
  '/pages/index/',
  'pages/user',
  '//pages//detail//'
].map(normalizePath)
// ['/pages/index', 'pages/user', '/pages/detail']
```

### isPathMatch

路径匹配判断：

```typescript
import { isPathMatch } from '@/utils/string'

// 精确匹配
console.log(isPathMatch('/pages/index', '/pages/index'))
// true

// 通配符匹配
console.log(isPathMatch('/pages/user/*', '/pages/user/detail'))
// true

console.log(isPathMatch('/pages/**', '/pages/user/detail'))
// true

// 路由权限判断
const hasPermission = (path: string, allowedPaths: string[]) => {
  return allowedPaths.some(pattern => isPathMatch(pattern, path))
}
```

### joinPath

路径拼接：

```typescript
import { joinPath } from '@/utils/string'

// 基本拼接
console.log(joinPath('/api', 'users', '123'))
// '/api/users/123'

// 自动处理斜杠
console.log(joinPath('/api/', '/users/', '/123'))
// '/api/users/123'

// 构建 API 路径
const apiPath = joinPath(baseUrl, 'v1', 'users', userId)
```

## 格式转换

### camelToKebab

驼峰转连字符：

```typescript
import { camelToKebab } from '@/utils/string'

console.log(camelToKebab('backgroundColor'))
// 'background-color'

console.log(camelToKebab('fontSize'))
// 'font-size'

// 生成 CSS 类名
const className = camelToKebab(componentName)
```

### kebabToCamel

连字符转驼峰：

```typescript
import { kebabToCamel } from '@/utils/string'

console.log(kebabToCamel('background-color'))
// 'backgroundColor'

console.log(kebabToCamel('font-size'))
// 'fontSize'

// 解析 CSS 属性
const propName = kebabToCamel(cssProperty)
```

### snakeToCamel

下划线转驼峰：

```typescript
import { snakeToCamel } from '@/utils/string'

console.log(snakeToCamel('user_name'))
// 'userName'

console.log(snakeToCamel('created_at'))
// 'createdAt'

// API 响应数据转换
const formatResponse = (data: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      snakeToCamel(key),
      value
    ])
  )
}
```

## 实际应用场景

### 表单数据处理

```typescript
import { isEmpty, parseStrEmpty, truncate } from '@/utils/string'

// 表单验证
const validateForm = (form: FormData) => {
  const errors: string[] = []

  if (isEmpty(form.username)) {
    errors.push('用户名不能为空')
  }

  if (isEmpty(form.email)) {
    errors.push('邮箱不能为空')
  }

  return errors
}

// 数据提交前处理
const prepareSubmitData = (form: FormData) => {
  return {
    username: parseStrEmpty(form.username).trim(),
    nickname: parseStrEmpty(form.nickname).trim(),
    remark: truncate(parseStrEmpty(form.remark), 200)
  }
}
```

### API 请求构建

```typescript
import { objectToQuery, joinPath, addQueryParams } from '@/utils/string'

// 构建请求 URL
const buildApiUrl = (
  endpoint: string,
  params?: Record<string, any>
) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const url = joinPath(baseUrl, endpoint)

  if (params && Object.keys(params).length > 0) {
    return addQueryParams(url, params)
  }

  return url
}

// 使用示例
const url = buildApiUrl('/users', { page: 1, size: 10, status: 'active' })
// 'https://api.example.com/users?page=1&size=10&status=active'
```

### 文章列表显示

```typescript
import { html2Text, truncate } from '@/utils/string'

// 处理文章摘要
const formatArticle = (article: Article) => ({
  id: article.id,
  title: truncate(article.title, 30),
  summary: truncate(html2Text(article.content), 100),
  author: article.author,
  createTime: article.createTime
})

// 批量处理
const formattedList = articleList.map(formatArticle)
```

## API

### 判空函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| parseStrEmpty | 空值转空字符串 | `(value: any)` | `string` |
| isEmpty | 判断是否为空 | `(value: any)` | `boolean` |
| isNotEmpty | 判断是否非空 | `(value: any)` | `boolean` |

### 格式化函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| capitalize | 首字母大写 | `(str: string)` | `string` |
| truncate | 字符串截断 | `(str: string, length: number, suffix?: string)` | `string` |
| sprintf | 格式化字符串 | `(format: string, ...args: any[])` | `string` |

### HTML 处理函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| html2Text | HTML 转文本 | `(html: string)` | `string` |
| adaptRichText | 适配富文本 | `(html: string)` | `string` |

### URL 操作函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| getQueryObject | 解析查询参数 | `(url?: string)` | `Record<string, string>` |
| objectToQuery | 对象转查询串 | `(obj: Record<string, any>)` | `string` |
| addQueryParams | 添加查询参数 | `(url: string, params: Record<string, any>)` | `string` |

### 路径处理函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| normalizePath | 规范化路径 | `(path: string)` | `string` |
| isPathMatch | 路径匹配 | `(pattern: string, path: string)` | `boolean` |
| joinPath | 路径拼接 | `(...parts: string[])` | `string` |

### 格式转换函数

| 函数 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| camelToKebab | 驼峰转连字符 | `(str: string)` | `string` |
| kebabToCamel | 连字符转驼峰 | `(str: string)` | `string` |
| snakeToCamel | 下划线转驼峰 | `(str: string)` | `string` |

## 最佳实践

### 1. 统一空值处理

```typescript
// 封装显示文本函数
const displayText = (value: any, defaultText = '-') => {
  return isNotEmpty(value) ? String(value) : defaultText
}

// 使用
<text>{{ displayText(user.phone) }}</text>
<text>{{ displayText(user.email, '未绑定') }}</text>
```

### 2. URL 参数处理

```typescript
// 安全获取 URL 参数
const getUrlParam = (key: string, defaultValue = '') => {
  const params = getQueryObject()
  return params[key] || defaultValue
}

// 构建分页 URL
const buildPageUrl = (page: number, size: number) => {
  const currentParams = getQueryObject()
  return objectToQuery({
    ...currentParams,
    page,
    size
  })
}
```

### 3. 文本安全显示

```typescript
// 防止 XSS 的文本显示
const safeText = (text: string) => {
  return html2Text(text)
}

// 截断并安全显示
const safeDisplay = (text: string, maxLength: number) => {
  return truncate(html2Text(text), maxLength)
}
```

## 常见问题

### 1. isEmpty 对空白字符串的处理？

`isEmpty` 会将只包含空白字符的字符串视为空：

```typescript
isEmpty('   ')  // true
isEmpty('\n\t') // true
```

### 2. truncate 中文字符计算？

`truncate` 按字符数计算，中文和英文都算一个字符：

```typescript
truncate('你好世界', 2) // '你好...'
truncate('hello', 2)   // 'he...'
```

### 3. URL 编码问题？

`objectToQuery` 会自动进行 URL 编码：

```typescript
objectToQuery({ name: '张三' })
// 'name=%E5%BC%A0%E4%B8%89'
```
