# 字符串工具 (string.ts)

字符串处理工具库，提供全面的字符串操作、格式转换、验证和处理功能，涵盖前端开发中的各种字符串处理需求。

## 功能分类

### 基本字符串操作
- **空值处理**: 转换 null/undefined 为空字符串
- **空字符串检查**: 检查字符串是否为空或仅包含空格
- **大小写转换**: 首字母大写
- **字符串截断**: 添加省略号的智能截断
- **字节长度计算**: UTF-8 编码下的字节长度
- **唯一标识生成**: 基于时间戳的唯一字符串

### 字符串格式化与替换
- **sprintf 格式化**: 类 printf 的字符串格式化

### HTML 处理
- **HTML 转文本**: 提取 HTML 中的纯文本内容
- **文本摘要**: 从 HTML 获取指定长度的摘要
- **特殊字符转义**: 防止 XSS 攻击的字符转义

### URL 处理
- **链接类型判断**: 区分内部链接和外部链接
- **协议检查**: HTTP/HTTPS 协议判断
- **查询参数处理**: URL 参数解析和构建

### 路径处理
- **路径标准化**: 统一路径格式
- **路径匹配**: 支持通配符的路径匹配

### 格式转换
- **命名格式转换**: 驼峰命名与短横线命名互转

### 验证函数
- **JSON 格式验证**: 检查字符串是否为有效 JSON

## API 参考

### 基本字符串操作

#### parseStrEmpty(str)
转换可能为 undefined 或 null 的字符串为空字符串

```typescript
/**
 * @param {any} str 要转换的值
 * @returns {string} 转换后的字符串
 */
parseStrEmpty(str: any): string
```

**使用示例:**
```typescript
import { parseStrEmpty } from '@/utils/string'

// 处理可能的空值
const result1 = parseStrEmpty(null)      // ""
const result2 = parseStrEmpty(undefined) // ""
const result3 = parseStrEmpty('hello')   // "hello"
const result4 = parseStrEmpty(123)       // "123"

// 在表单处理中的应用
const formData = {
  name: parseStrEmpty(user.name),
  email: parseStrEmpty(user.email),
  phone: parseStrEmpty(user.phone)
}
```

#### isEmpty(str)
检查字符串是否为空（包括 null、undefined、空字符串和仅包含空格）

```typescript
/**
 * @param {string} str 要检查的字符串
 * @returns {boolean} 是否为空
 */
isEmpty(str: any): boolean
```

**使用示例:**
```typescript
import { isEmpty } from '@/utils/string'

// 各种空值检查
console.log(isEmpty(null))        // true
console.log(isEmpty(undefined))   // true
console.log(isEmpty(''))          // true
console.log(isEmpty('   '))       // true
console.log(isEmpty('hello'))     // false

// 表单验证中的应用
const validateForm = (data) => {
  if (isEmpty(data.username)) {
    return '用户名不能为空'
  }
  if (isEmpty(data.email)) {
    return '邮箱不能为空'
  }
  return null
}
```

#### capitalize(str)
首字母大写转换

```typescript
/**
 * @param {string} str 输入字符串
 * @returns {string} 首字母大写后的字符串
 */
capitalize(str: string): string
```

**使用示例:**
```typescript
import { capitalize } from '@/utils/string'

// 基本使用
console.log(capitalize('hello'))      // "Hello"
console.log(capitalize('world'))      // "World"
console.log(capitalize('javaScript')) // "JavaScript"

// 处理用户输入
const formatName = (name: string) => {
  return name.split(' ')
    .map(part => capitalize(part.toLowerCase()))
    .join(' ')
}

console.log(formatName('john DOE')) // "John Doe"
```

#### truncate(str, maxLength, ellipsis?)
智能截断字符串并添加省略号

```typescript
/**
 * @param {string} str 原始字符串
 * @param {number} maxLength 最大长度
 * @param {string} ellipsis 省略号字符，默认 '...'
 * @returns {string} 截断后的字符串
 */
truncate(str: string, maxLength: number, ellipsis: string = '...'): string
```

**使用示例:**
```typescript
import { truncate } from '@/utils/string'

// 基本截断
const longText = 'This is a very long text that needs to be truncated'
console.log(truncate(longText, 20))     // "This is a very l..."
console.log(truncate(longText, 20, '…')) // "This is a very l…"

// 在列表中显示摘要
const articles = [
  { title: 'Vue 3 Composition API 深入浅出完整指南', content: '...' },
  { title: 'TypeScript 高级类型系统详解', content: '...' }
]

const displayArticles = articles.map(article => ({
  ...article,
  shortTitle: truncate(article.title, 15),
  summary: truncate(article.content, 100)
}))
```

#### byteLength(str)
计算字符串的 UTF-8 字节长度

```typescript
/**
 * @param {string} str 要计算的字符串
 * @returns {number} 字节长度
 */
byteLength(str: string): number
```

**使用示例:**
```typescript
import { byteLength } from '@/utils/string'

// 不同字符的字节长度
console.log(byteLength('hello'))    // 5 (ASCII字符各占1字节)
console.log(byteLength('你好'))     // 6 (中文字符各占3字节)
console.log(byteLength('😊'))       // 4 (Emoji占4字节)
console.log(byteLength('Café'))     // 5 (é占2字节)

// 检查文本长度限制
const validateTextLength = (text: string, maxBytes: number) => {
  const bytes = byteLength(text)
  if (bytes > maxBytes) {
    return `文本过长，当前${bytes}字节，最多允许${maxBytes}字节`
  }
  return null
}

// 短信内容验证（70字节限制）
const smsContent = '这是一条测试短信'
console.log(validateTextLength(smsContent, 70))
```

#### createUniqueString()
创建基于时间戳的唯一字符串标识

```typescript
/**
 * @returns {string} 生成的唯一字符串
 */
createUniqueString(): string
```

**使用示例:**
```typescript
import { createUniqueString } from '@/utils/string'

// 生成唯一ID
const id1 = createUniqueString() // "a1b21615528749883"
const id2 = createUniqueString() // "c3d41615528749924"

// 文件上传时生成唯一文件名
const generateFileName = (originalName: string) => {
  const ext = originalName.split('.').pop()
  const uniqueId = createUniqueString()
  return `${uniqueId}.${ext}`
}

// 临时数据存储
const tempDataKey = `temp_${createUniqueString()}`
localStorage.setItem(tempDataKey, JSON.stringify(data))
```

### 字符串格式化

#### sprintf(str, ...args)
类 printf 的字符串格式化，支持 %s 占位符

```typescript
/**
 * @param {string} str 包含%s占位符的模板字符串
 * @param {...any} args 要插入的参数
 * @returns {string} 格式化后的字符串
 */
sprintf(str: string, ...args: any[]): string
```

**使用示例:**
```typescript
import { sprintf } from '@/utils/string'

// 基本格式化
const message1 = sprintf('Hello, %s!', 'World')
console.log(message1) // "Hello, World!"

const message2 = sprintf('用户 %s 的分数是 %s', 'Alice', 95)
console.log(message2) // "用户 Alice 的分数是 95"

// 动态消息生成
const createNotification = (type: string, user: string, action: string) => {
  const templates = {
    info: '用户 %s 执行了 %s 操作',
    warning: '警告：用户 %s 尝试 %s',
    error: '错误：用户 %s 的 %s 操作失败'
  }
  return sprintf(templates[type], user, action)
}

console.log(createNotification('info', '张三', '登录'))
// "用户 张三 执行了 登录 操作"
```

### HTML 处理

#### html2Text(html)
将 HTML 内容转换为纯文本

```typescript
/**
 * @param {string} html HTML字符串
 * @returns {string} 提取的纯文本
 */
html2Text(html: string): string
```

**使用示例:**
```typescript
import { html2Text } from '@/utils/string'

// 提取HTML中的文本
const htmlContent = '<div><h1>标题</h1><p>这是一段<strong>重要</strong>的内容。</p></div>'
const plainText = html2Text(htmlContent)
console.log(plainText) // "标题这是一段重要的内容。"

// 处理富文本编辑器内容
const editorContent = `
  <h2>产品介绍</h2>
  <p>这是一款<em>创新</em>的产品，具有以下特点：</p>
  <ul>
    <li>高性能</li>
    <li>易使用</li>
  </ul>
`
const summary = html2Text(editorContent)
console.log(summary) // "产品介绍这是一款创新的产品，具有以下特点：高性能易使用"
```

#### getTextExcerpt(html, length, ellipsis?)
从 HTML 字符串中获取指定长度的纯文本摘要

```typescript
/**
 * @param {string} html HTML字符串
 * @param {number} length 摘要长度
 * @param {string} ellipsis 省略号字符，默认 '...'
 * @returns {string} 文本摘要
 */
getTextExcerpt(html: string, length: number, ellipsis: string = '...'): string
```

**使用示例:**
```typescript
import { getTextExcerpt } from '@/utils/string'

const richContent = `
  <h1>Vue 3 新特性详解</h1>
  <p>Vue 3 带来了许多令人兴奋的新特性，包括 <strong>Composition API</strong>、
  更好的 TypeScript 支持、以及显著的性能提升。</p>
  <p>本文将详细介绍这些新特性的使用方法和最佳实践。</p>
`

// 生成不同长度的摘要
const shortExcerpt = getTextExcerpt(richContent, 30)
console.log(shortExcerpt) // "Vue 3 新特性详解Vue 3 带来了许多..."

const mediumExcerpt = getTextExcerpt(richContent, 80)
console.log(mediumExcerpt) // "Vue 3 新特性详解Vue 3 带来了许多令人兴奋的新特性，包括 Composition API、更好的 TypeScript..."

// 文章列表摘要生成
const articles = [
  { title: 'Vue 3 指南', content: richContent },
  // ... 更多文章
]

const articlePreviews = articles.map(article => ({
  ...article,
  excerpt: getTextExcerpt(article.content, 120)
}))
```

#### escapeHtml(html)
转义特殊字符，防止 XSS 攻击

```typescript
/**
 * @param {string} html 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
escapeHtml(html: string): string
```

**使用示例:**
```typescript
import { escapeHtml } from '@/utils/string'

// 转义危险内容
const userInput = '<script>alert("XSS攻击")</script>'
const safeContent = escapeHtml(userInput)
console.log(safeContent) // "&lt;script&gt;alert(&quot;XSS攻击&quot;)&lt;/script&gt;"

// 安全显示用户生成内容
const displayUserComment = (comment: string) => {
  return `<div class="comment">${escapeHtml(comment)}</div>`
}

// 处理包含HTML字符的文本
const codeExample = 'if (a < b && c > d) { return true; }'
const escapedCode = escapeHtml(codeExample)
console.log(escapedCode) // "if (a &lt; b &amp;&amp; c &gt; d) { return true; }"
```

### URL 处理

#### isExternal(path)
判断 URL 是否为外部链接

```typescript
/**
 * @param {string} path 要检查的URL
 * @returns {boolean} 是否为外部链接
 */
isExternal(path: string): boolean
```

**使用示例:**
```typescript
import { isExternal } from '@/utils/string'

// 链接类型检查
console.log(isExternal('https://example.com'))     // true
console.log(isExternal('http://test.com'))         // true
console.log(isExternal('mailto:user@example.com')) // true
console.log(isExternal('tel:+1234567890'))         // true
console.log(isExternal('/internal/page'))          // false
console.log(isExternal('internal/page'))           // false

// 动态链接处理
const handleLinkClick = (url: string) => {
  if (isExternal(url)) {
    // 外部链接在新窗口打开
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    // 内部链接使用路由导航
    router.push(url)
  }
}

// 链接列表渲染
const renderLink = (url: string, text: string) => {
  const target = isExternal(url) ? '_blank' : '_self'
  const rel = isExternal(url) ? 'noopener noreferrer' : ''
  return `<a href="${url}" target="${target}" rel="${rel}">${text}</a>`
}
```

#### isHttp(url)
判断 URL 是否使用 HTTP 或 HTTPS 协议

```typescript
/**
 * @param {string} url 要检查的URL
 * @returns {boolean} 是否是HTTP或HTTPS链接
 */
isHttp(url: string): boolean
```

**使用示例:**
```typescript
import { isHttp } from '@/utils/string'

// 协议检查
console.log(isHttp('https://api.example.com'))  // true
console.log(isHttp('http://localhost:3000'))    // true
console.log(isHttp('ftp://files.example.com'))  // false
console.log(isHttp('mailto:user@example.com'))  // false

// API 请求前的URL验证
const makeRequest = async (url: string) => {
  if (!isHttp(url)) {
    throw new Error('只支持HTTP和HTTPS协议的URL')
  }
  
  try {
    const response = await fetch(url)
    return response.json()
  } catch (error) {
    console.error('请求失败:', error)
  }
}

// 图片链接验证
const isValidImageUrl = (url: string) => {
  return isHttp(url) && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}
```

#### getQueryObject(url)
从 URL 中解析查询参数

```typescript
/**
 * @param {string} url URL字符串，默认为当前页面URL
 * @returns {Record<string, string>} 查询参数对象
 */
getQueryObject(url?: string): Record<string, string>
```

**使用示例:**
```typescript
import { getQueryObject } from '@/utils/string'

// 解析URL参数
const url1 = 'https://example.com?name=John&age=30&city=Beijing'
const params1 = getQueryObject(url1)
console.log(params1) // { name: 'John', age: '30', city: 'Beijing' }

// 解析当前页面参数（不传URL参数）
const currentParams = getQueryObject()
console.log(currentParams) // 当前页面的查询参数

// 处理包含特殊字符的参数
const url2 = 'https://example.com?query=hello%20world&filter=%E4%B8%AD%E6%96%87'
const params2 = getQueryObject(url2)
console.log(params2) // { query: 'hello world', filter: '中文' }

// 在组件中使用
const useUrlParams = () => {
  const params = getQueryObject()
  
  return {
    userId: params.userId,
    tab: params.tab || 'default',
    page: parseInt(params.page) || 1
  }
}
```

#### objectToQuery(params)
将参数对象转换为 URL 查询字符串

```typescript
/**
 * @param {Record<string, any>} params 参数对象
 * @returns {string} 生成的查询字符串（不含前缀?）
 */
objectToQuery(params: Record<string, any>): string
```

**使用示例:**
```typescript
import { objectToQuery } from '@/utils/string'

// 基本参数转换
const params1 = { name: 'John', age: 30, active: true }
const query1 = objectToQuery(params1)
console.log(query1) // "name=John&age=30&active=true"

// 嵌套对象处理
const params2 = {
  search: 'vue',
  filter: {
    category: 'frontend',
    level: 'intermediate'
  },
  page: 1
}
const query2 = objectToQuery(params2)
console.log(query2) // "search=vue&filter[category]=frontend&filter[level]=intermediate&page=1"

// 构建完整URL
const buildUrl = (baseUrl: string, params: Record<string, any>) => {
  const queryString = objectToQuery(params)
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

const apiUrl = buildUrl('https://api.example.com/users', {
  page: 2,
  pageSize: 20,
  sortBy: 'name'
})
console.log(apiUrl) // "https://api.example.com/users?page=2&pageSize=20&sortBy=name"
```

### 路径处理

#### normalizePath(path)
标准化路径格式，处理多余的斜杠

```typescript
/**
 * @param {string} path 要处理的路径
 * @returns {string} 标准化后的路径
 */
normalizePath(path: string): string
```

**使用示例:**
```typescript
import { normalizePath } from '@/utils/string'

// 路径标准化
console.log(normalizePath('/api//users/'))        // "/api/users"
console.log(normalizePath('//api///users////'))   // "/api/users"
console.log(normalizePath('/api/users//////'))    // "/api/users"

// API路径构建
const buildApiPath = (...segments: string[]) => {
  return normalizePath(segments.join('/'))
}

const userApiPath = buildApiPath('/api', '/users/', '/profile/')
console.log(userApiPath) // "/api/users/profile"

// 路由路径处理
const routes = [
  '/home//',
  '//about///',
  '/contact/'
].map(path => normalizePath(path))

console.log(routes) // ["/home", "/about", "/contact"]
```

#### isPathMatch(pattern, path)
支持通配符的路径匹配

```typescript
/**
 * @param {string} pattern 匹配模式，支持 * 和 **
 * @param {string} path 要检查的路径
 * @returns {boolean} 是否匹配
 */
isPathMatch(pattern: string, path: string): boolean
```

**使用示例:**
```typescript
import { isPathMatch } from '@/utils/string'

// 单层通配符匹配
console.log(isPathMatch('/api/*', '/api/users'))          // true
console.log(isPathMatch('/api/*', '/api/users/profile'))  // false

// 多层通配符匹配
console.log(isPathMatch('/api/**', '/api/users'))         // true
console.log(isPathMatch('/api/**', '/api/users/profile')) // true
console.log(isPathMatch('/api/**', '/api/v1/users/123'))  // true

// 权限路由匹配
const hasPermission = (userPermissions: string[], requestPath: string) => {
  return userPermissions.some(permission => 
    isPathMatch(permission, requestPath)
  )
}

const userPerms = ['/admin/**', '/api/users/*', '/profile']
console.log(hasPermission(userPerms, '/admin/settings'))  // true
console.log(hasPermission(userPerms, '/api/users/123'))   // true
console.log(hasPermission(userPerms, '/api/orders/456')) // false

// 路由守卫
const protectedRoutes = ['/admin/**', '/dashboard/*']
const isProtectedRoute = (path: string) => {
  return protectedRoutes.some(pattern => isPathMatch(pattern, path))
}
```

### 格式转换

#### camelToKebab(str)
将驼峰命名转换为短横线命名

```typescript
/**
 * @param {string} str 驼峰命名的字符串
 * @returns {string} 短横线命名的字符串
 */
camelToKebab(str: string): string
```

**使用示例:**
```typescript
import { camelToKebab } from '@/utils/string'

// CSS属性名转换
console.log(camelToKebab('backgroundColor'))  // "background-color"
console.log(camelToKebab('fontSize'))         // "font-size"
console.log(camelToKebab('marginTop'))        // "margin-top"

// 组件名转换
console.log(camelToKebab('MyComponent'))      // "my-component"
console.log(camelToKebab('UserProfileCard')) // "user-profile-card"

// 动态CSS样式应用
const applyStyles = (element: HTMLElement, styles: Record<string, string>) => {
  Object.entries(styles).forEach(([property, value]) => {
    const cssProperty = camelToKebab(property)
    element.style.setProperty(cssProperty, value)
  })
}

applyStyles(element, {
  backgroundColor: 'red',
  fontSize: '16px',
  marginTop: '10px'
})
```

#### kebabToCamel(str)
将短横线命名转换为驼峰命名

```typescript
/**
 * @param {string} str 短横线命名的字符串
 * @returns {string} 驼峰命名的字符串
 */
kebabToCamel(str: string): string
```

**使用示例:**
```typescript
import { kebabToCamel } from '@/utils/string'

// CSS属性转JS属性
console.log(kebabToCamel('background-color'))  // "backgroundColor"
console.log(kebabToCamel('font-size'))         // "fontSize"
console.log(kebabToCamel('margin-top'))        // "marginTop"

// HTML属性转换
console.log(kebabToCamel('data-user-id'))      // "dataUserId"
console.log(kebabToCamel('aria-label'))        // "ariaLabel"

// 处理CSS样式对象
const convertCssProperties = (cssObj: Record<string, string>) => {
  const jsObj: Record<string, string> = {}
  
  Object.entries(cssObj).forEach(([key, value]) => {
    const jsKey = kebabToCamel(key)
    jsObj[jsKey] = value
  })
  
  return jsObj
}

const cssStyles = {
  'background-color': 'blue',
  'font-size': '14px',
  'border-radius': '4px'
}

const jsStyles = convertCssProperties(cssStyles)
console.log(jsStyles)
// { backgroundColor: 'blue', fontSize: '14px', borderRadius: '4px' }
```

### 验证函数

#### isValidJSON(str)
检查字符串是否为有效的 JSON 格式

```typescript
/**
 * @param {string} str 要检查的字符串
 * @returns {boolean} 是否为有效的JSON
 */
isValidJSON(str: string): boolean
```

**使用示例:**
```typescript
import { isValidJSON } from '@/utils/string'

// JSON格式验证
console.log(isValidJSON('{"name":"John","age":30}'))  // true
console.log(isValidJSON('[1,2,3]'))                  // true
console.log(isValidJSON('true'))                     // true
console.log(isValidJSON('null'))                     // true
console.log(isValidJSON('{name:"John"}'))            // false (属性名未加引号)
console.log(isValidJSON("{'name':'John'}"))          // false (使用单引号)

// 安全的JSON解析
const safeJsonParse = <T = any>(jsonString: string, defaultValue: T): T => {
  if (!isValidJSON(jsonString)) {
    console.warn('无效的JSON格式:', jsonString)
    return defaultValue
  }
  
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('JSON解析失败:', error)
    return defaultValue
  }
}

// 使用示例
const configString = localStorage.getItem('app-config')
const config = safeJsonParse(configString, { theme: 'light', language: 'zh' })

// API响应验证
const validateApiResponse = (responseText: string) => {
  if (!isValidJSON(responseText)) {
    throw new Error('API返回的不是有效的JSON格式')
  }
  
  return JSON.parse(responseText)
}
```

## 实际应用场景

### 1. 表单数据处理
```typescript
import { parseStrEmpty, isEmpty, capitalize, truncate } from '@/utils/string'

const processFormData = (rawData: any) => {
  return {
    // 处理可能的空值
    firstName: capitalize(parseStrEmpty(rawData.firstName).trim()),
    lastName: capitalize(parseStrEmpty(rawData.lastName).trim()),
    
    // 验证必填字段
    email: isEmpty(rawData.email) ? null : rawData.email.toLowerCase(),
    
    // 处理长文本
    bio: truncate(parseStrEmpty(rawData.bio), 500),
    
    // 生成唯一ID
    id: createUniqueString()
  }
}
```

### 2. URL 和路由处理
```typescript
import { isExternal, getQueryObject, objectToQuery, normalizePath } from '@/utils/string'

const RouterHelper = {
  // 智能链接跳转
  navigate(url: string, params?: Record<string, any>) {
    let finalUrl = normalizePath(url)
    
    if (params) {
      const queryString = objectToQuery(params)
      finalUrl += queryString ? `?${queryString}` : ''
    }
    
    if (isExternal(finalUrl)) {
      window.open(finalUrl, '_blank')
    } else {
      this.$router.push(finalUrl)
    }
  },
  
  // 获取当前页面参数
  getCurrentParams() {
    return getQueryObject()
  }
}
```

### 3. 内容管理系统
```typescript
import { html2Text, getTextExcerpt, escapeHtml } from '@/utils/string'

const ContentProcessor = {
  // 生成文章摘要
  generateSummary(htmlContent: string, maxLength: number = 150) {
    return getTextExcerpt(htmlContent, maxLength)
  },
  
  // 安全显示用户内容
  sanitizeUserContent(content: string) {
    return escapeHtml(content)
  },
  
  // 搜索高亮
  highlightSearchText(text: string, keyword: string) {
    if (!keyword) return text
    
    const safeKeyword = escapeHtml(keyword)
    const safeText = escapeHtml(text)
    const regex = new RegExp(`(${safeKeyword})`, 'gi')
    return safeText.replace(regex, '<mark>$1</mark>')
  }
}
```

### 4. 开发调试工具
```typescript
import { sprintf, byteLength, createUniqueString } from '@/utils/string'

const DevTools = {
  // 格式化日志消息
  log(template: string, ...args: any[]) {
    const timestamp = new Date().toISOString()
    const message = sprintf(template, ...args)
    console.log(`[${timestamp}] ${message}`)
  },
  
  // 性能监控
  measureTextSize(text: string) {
    return {
      characters: text.length,
      bytes: byteLength(text),
      lines: text.split('\n').length
    }
  },
  
  // 生成测试数据
  generateTestId(prefix: string = 'test') {
    return `${prefix}_${createUniqueString()}`
  }
}

// 使用示例
DevTools.log('用户 %s 执行了 %s 操作，耗时 %s ms', 'admin', 'login', 150)
// [2024-03-20T10:30:45.123Z] 用户 admin 执行了 login 操作，耗时 150 ms
```

### 5. 国际化处理
```typescript
import { isEmpty, capitalize } from '@/utils/string'

const I18nHelper = {
  // 智能文本处理
  formatText(text: string, locale: string = 'zh-CN') {
    if (isEmpty(text)) return ''
    
    // 根据语言环境处理文本
    switch (locale) {
      case 'en-US':
        // 英文首字母大写
        return text.split(' ').map(word => capitalize(word.toLowerCase())).join(' ')
      case 'zh-CN':
        // 中文去除多余空格
        return text.replace(/\s+/g, ' ').trim()
      default:
        return text.trim()
    }
  },
  
  // 文本长度适配
  adaptTextLength(text: string, maxLength: number, locale: string) {
    // 中文字符占用空间更大，需要调整长度
    const adjustedLength = locale === 'zh-CN' ? Math.floor(maxLength * 0.7) : maxLength
    return truncate(text, adjustedLength)
  }
}
```

## 最佳实践

### 1. 输入验证和清理
```typescript
import { isEmpty, parseStrEmpty, escapeHtml } from '@/utils/string'

// 创建输入清理器
const createInputSanitizer = (options: {
  required?: boolean
  maxLength?: number
  allowHtml?: boolean
} = {}) => {
  return (input: any): string | null => {
    // 1. 转换为字符串并去除前后空格
    const str = parseStrEmpty(input).trim()
    
    // 2. 检查必填字段
    if (options.required && isEmpty(str)) {
      throw new Error('该字段为必填项')
    }
    
    // 3. 长度检查
    if (options.maxLength && str.length > options.maxLength) {
      throw new Error(`内容长度不能超过 ${options.maxLength} 个字符`)
    }
    
    // 4. HTML 转义
    if (!options.allowHtml) {
      return escapeHtml(str)
    }
    
    return str
  }
}

// 使用示例
const sanitizeUsername = createInputSanitizer({ required: true, maxLength: 20 })
const sanitizeComment = createInputSanitizer({ maxLength: 500, allowHtml: false })
```

### 2. URL 构建器
```typescript
import { normalizePath, objectToQuery, isExternal } from '@/utils/string'

class UrlBuilder {
  private baseUrl: string
  private pathSegments: string[] = []
  private queryParams: Record<string, any> = {}
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }
  
  path(...segments: string[]) {
    this.pathSegments.push(...segments)
    return this
  }
  
  query(params: Record<string, any>) {
    Object.assign(this.queryParams, params)
    return this
  }
  
  build(): string {
    let url = this.baseUrl
    
    if (this.pathSegments.length > 0) {
      const pathString = this.pathSegments.join('/')
      url += '/' + pathString
    }
    
    url = normalizePath(url)
    
    if (Object.keys(this.queryParams).length > 0) {
      const queryString = objectToQuery(this.queryParams)
      url += '?' + queryString
    }
    
    return url
  }
  
  buildAndNavigate() {
    const url = this.build()
    
    if (isExternal(url)) {
      window.open(url, '_blank')
    } else {
      // 假设使用 Vue Router
      // router.push(url)
    }
  }
}

// 使用示例
const apiUrl = new UrlBuilder('https://api.example.com')
  .path('v1', 'users', '123')
  .query({ include: 'profile', fields: 'name,email' })
  .build()
// "https://api.example.com/v1/users/123?include=profile&fields=name,email"
```

### 3. 文本处理管道
```typescript
import { capitalize, truncate, html2Text, isEmpty } from '@/utils/string'

// 创建文本处理管道
class TextProcessor {
  private processors: Array<(text: string) => string> = []
  
  // 添加处理步骤
  pipe(processor: (text: string) => string) {
    this.processors.push(processor)
    return this
  }
  
  // 执行处理管道
  process(input: string): string {
    return this.processors.reduce((text, processor) => {
      return isEmpty(text) ? text : processor(text)
    }, input)
  }
  
  // 预定义的处理步骤
  static steps = {
    htmlToText: (text: string) => html2Text(text),
    capitalize: (text: string) => capitalize(text),
    truncate: (length: number) => (text: string) => truncate(text, length),
    removeExtraSpaces: (text: string) => text.replace(/\s+/g, ' ').trim(),
    toLowerCase: (text: string) => text.toLowerCase(),
    toUpperCase: (text: string) => text.toUpperCase()
  }
}

// 使用示例
const titleProcessor = new TextProcessor()
  .pipe(TextProcessor.steps.htmlToText)
  .pipe(TextProcessor.steps.removeExtraSpaces)
  .pipe(TextProcessor.steps.capitalize)
  .pipe(TextProcessor.steps.truncate(50))

const processedTitle = titleProcessor.process('<h1>  这是一个   很长的标题  </h1>')
// "这是一个很长的标题"
```

### 4. 模板字符串增强
```typescript
import { sprintf, isEmpty, escapeHtml } from '@/utils/string'

// 创建安全的模板渲染器
const createTemplateRenderer = (options: {
  escapeHtml?: boolean
  fallback?: string
} = {}) => {
  return (template: string, data: Record<string, any>): string => {
    if (isEmpty(template)) {
      return options.fallback || ''
    }
    
    // 替换占位符 ${key}
    let result = template.replace(/\${(\w+)}/g, (match, key) => {
      const value = data[key]
      
      if (value === undefined || value === null) {
        return match // 保留原始占位符
      }
      
      const stringValue = String(value)
      return options.escapeHtml ? escapeHtml(stringValue) : stringValue
    })
    
    // 支持 sprintf 风格的占位符
    const sprintfArgs = Object.values(data)
    if (sprintfArgs.length > 0 && result.includes('%s')) {
      result = sprintf(result, ...sprintfArgs)
    }
    
    return result
  }
}

// 使用示例
const safeRenderer = createTemplateRenderer({ escapeHtml: true })
const template = '欢迎 ${username}，您有 %s 条未读消息'
const rendered = safeRenderer(template, { username: '<script>alert("xss")</script>', unread: 5 })
// "欢迎 &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;，您有 5 条未读消息"
```

## 性能优化建议

### 1. 缓存计算结果
```typescript
import { byteLength, createUniqueString } from '@/utils/string'

// 缓存字节长度计算
const byteLengthCache = new Map<string, number>()

const cachedByteLength = (str: string): number => {
  if (byteLengthCache.has(str)) {
    return byteLengthCache.get(str)!
  }
  
  const length = byteLength(str)
  byteLengthCache.set(str, length)
  
  // 防止缓存过大
  if (byteLengthCache.size > 1000) {
    const firstKey = byteLengthCache.keys().next().value
    byteLengthCache.delete(firstKey)
  }
  
  return length
}
```

### 2. 批量处理
```typescript
import { escapeHtml, truncate } from '@/utils/string'

// 批量文本处理
const batchProcessTexts = (
  texts: string[],
  processors: Array<(text: string) => string>
): string[] => {
  return texts.map(text => {
    return processors.reduce((currentText, processor) => {
      return processor(currentText)
    }, text)
  })
}

// 使用示例
const userComments = ['评论1', '评论2', '评论3']
const processedComments = batchProcessTexts(userComments, [
  (text) => escapeHtml(text),
  (text) => truncate(text, 100)
])
```

### 3. 惰性计算
```typescript
import { html2Text, getTextExcerpt } from '@/utils/string'

// 创建惰性文本摘要
class LazyTextExcerpt {
  private _excerpt: string | null = null
  
  constructor(
    private htmlContent: string,
    private maxLength: number = 150
  ) {}
  
  get excerpt(): string {
    if (this._excerpt === null) {
      this._excerpt = getTextExcerpt(this.htmlContent, this.maxLength)
    }
    return this._excerpt
  }
  
  // 清除缓存
  invalidate() {
    this._excerpt = null
  }
}
```

## 调试技巧

### 1. 调试模式
```typescript
import { sprintf, byteLength, isValidJSON } from '@/utils/string'

const DEBUG = process.env.NODE_ENV === 'development'

const debugString = (operation: string, input: any, output: any) => {
  if (!DEBUG) return
  
  console.group(`字符串操作: ${operation}`)
  console.log('输入:', input)
  console.log('输出:', output)
  console.log('输入类型:', typeof input)
  console.log('输出长度:', typeof output === 'string' ? output.length : 'N/A')
  if (typeof output === 'string') {
    console.log('字节长度:', byteLength(output))
  }
  console.groupEnd()
}

// 包装函数添加调试信息
const debugTruncate = (str: string, maxLength: number, ellipsis?: string) => {
  const result = truncate(str, maxLength, ellipsis)
  debugString('truncate', { str, maxLength, ellipsis }, result)
  return result
}
```

### 2. 测试辅助
```typescript
import { isValidJSON, parseStrEmpty, isEmpty } from '@/utils/string'

// 创建测试用例生成器
const createStringTestCases = () => ({
  empty: ['', null, undefined, '   '],
  normal: ['hello', 'world', '测试'],
  special: ['<script>', '&amp;', '"quotes"', "single'quotes"],
  unicode: ['🚀', '你好', 'café', '𝕋𝕖𝕤𝕥'],
  json: [
    '{"valid": true}',
    '{"invalid": }',
    '[1,2,3]',
    'not json'
  ]
})

// 批量测试函数
const testStringFunction = (
  fn: (input: any) => any,
  testCases: Record<string, any[]>,
  description: string
) => {
  console.group(`测试: ${description}`)
  
  Object.entries(testCases).forEach(([category, cases]) => {
    console.group(`类别: ${category}`)
    cases.forEach((testCase, index) => {
      try {
        const result = fn(testCase)
        console.log(`用例 ${index + 1}:`, testCase, '->', result)
      } catch (error) {
        console.error(`用例 ${index + 1} 错误:`, testCase, error)
      }
    })
    console.groupEnd()
  })
  
  console.groupEnd()
}
```

## 相关工具推荐

配合字符串工具使用的其他工具：

- **格式化工具** (`format.ts`) - 用于数据展示格式化
- **验证器** (`validators.ts`) - 用于字符串格式验证
- **对象工具** (`object.ts`) - 用于查询参数对象处理
- **加密工具** (`crypto.ts`) - 用于字符串加密处理

## 总结

字符串工具库提供了全面的字符串处理能力，涵盖了：

- <Ok/> **安全处理**: 防 XSS、空值处理、类型转换
- <Ok/> **格式转换**: 命名格式、编码转换、模板渲染
- <Ok/> **内容处理**: HTML 提取、文本截断、摘要生成
- <Ok/> **URL 操作**: 参数解析、路径处理、链接判断
- <Ok/> **性能优化**: 缓存机制、批量处理、惰性计算

合理使用这些工具函数可以显著提升开发效率，减少bug，并确保应用的安全性和可靠性。建议根据实际需求按需导入，避免不必要的代码体积增加。
