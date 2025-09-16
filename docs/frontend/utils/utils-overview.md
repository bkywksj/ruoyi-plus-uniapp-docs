# 工具函数概览

Vue3 + TypeScript 项目的完整工具函数库，提供了丰富的实用工具函数，涵盖了前端开发中的各种常见需求。

## 📦 工具分类

### 🔤 字符串处理
**string.ts** - 提供全面的字符串处理功能
- **基本操作**: 空值转换、大小写转换、字符串截断、字节长度计算
- **格式化**: sprintf 格式化、HTML 转文本、特殊字符转义
- **URL 处理**: 外部链接判断、查询参数解析、路径标准化
- **验证**: JSON 格式验证、路径匹配
- **转换**: 驼峰命名与短横线命名互转

```typescript
import { capitalize, truncate, isExternal, parseStrEmpty } from '@/utils/string'

// 字符串首字母大写
const title = capitalize('hello world') // "Hello world"

// 截断长文本
const short = truncate('这是一个很长的文本...', 10) // "这是一个很长..."

// 判断是否为外部链接
const isExt = isExternal('https://example.com') // true
```

### 📊 对象操作
**object.ts** - 强大的对象和数组处理工具
- **对象操作**: 深度合并、浅比较、深拷贝、属性筛选
- **属性访问**: 安全获取嵌套属性、动态设置属性值
- **数据清理**: 移除空值、数组去重、对象扁平化
- **格式转换**: URL 查询参数转换、键名格式转换

```typescript
import { deepClone, get, pick, removeEmpty } from '@/utils/object'

// 深拷贝对象
const copy = deepClone(originalData)

// 安全获取嵌套属性
const name = get(user, 'profile.name', '默认名称')

// 选取指定属性
const userInfo = pick(user, ['id', 'name', 'email'])
```

### 📅 日期时间
**date.ts** - 完整的日期时间处理方案
- **格式化**: 多种日期格式输出、相对时间、表格时间格式
- **解析**: 字符串转日期对象、时间戳处理
- **计算**: 日期范围、时间差计算、日期加减
- **获取**: 当前时间、本周/本月范围、时间戳

```typescript
import { formatDate, getCurrentDateTime, getDaysBetween } from '@/utils/date'

// 格式化日期
const dateStr = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')

// 获取当前时间
const now = getCurrentDateTime() // "2024-03-20 15:30:45"

// 计算日期差
const days = getDaysBetween(startDate, endDate)
```

### 🎨 数据格式化
**format.ts** - 专业的数据展示格式化
- **数值格式**: 货币格式、百分比、文件大小、距离单位
- **隐私保护**: 手机号脱敏、身份证脱敏、银行卡脱敏
- **文本处理**: 长度限制、文件名格式化、列表格式化
- **状态显示**: 枚举值转换、布尔值显示、状态颜色

```typescript
import { formatCurrency, formatPrivacy, formatFileSize } from '@/utils/format'

// 货币格式化
const price = formatCurrency(1234.56) // "¥1,234.56"

// 隐私数据脱敏
const phone = formatPrivacy('13812345678', { showStart: 3, showEnd: 4 }) // "138****5678"

// 文件大小格式化
const size = formatFileSize(1048576) // "1.00 MB"
```

### ⚙️ 函数增强
**function.ts** - 函数式编程工具集
- **性能优化**: 防抖、节流、记忆化缓存
- **执行控制**: 重试机制、超时控制、频率限制
- **函数转换**: 柯里化、偏函数应用
- **异步处理**: 串行执行、并行控制、错误处理

```typescript
import { debounce, throttle, retry, copy } from '@/utils/function'

// 防抖处理
const debouncedSearch = debounce(handleSearch, 300)

// 节流处理
const throttledScroll = throttle(handleScroll, 100)

// 复制到剪贴板
await copy('要复制的文本', '复制成功提示')
```

### ✅ 数据验证
**validators.ts** - 全面的数据验证工具
- **类型验证**: 字符串、数组、对象、数字类型检查
- **格式验证**: 邮箱、URL、IP地址、UUID格式
- **业务验证**: 中国手机号、身份证、银行卡号
- **文件验证**: 文件类型、大小、图片格式检查

```typescript
import { isEmail, isChinesePhoneNumber, isValidURL, isImageFile } from '@/utils/validators'

// 邮箱验证
const valid = isEmail('user@example.com') // true

// 手机号验证
const phoneValid = isChinesePhoneNumber('13812345678') // true

// URL验证
const urlValid = isValidURL('https://example.com') // true
```

### 🔐 加密安全
**crypto.ts & rsa.ts** - 数据加密和安全处理
- **对称加密**: AES 加密解密、密钥生成
- **非对称加密**: RSA 公私钥加密、数字签名
- **编码处理**: Base64 编解码
- **哈希计算**: SHA-256、MD5 哈希值生成

```typescript
import { encryptWithAes, generateAesKey } from '@/utils/crypto'
import { rsaEncrypt, rsaDecrypt } from '@/utils/rsa'

// AES 加密
const key = generateAesKey()
const encrypted = encryptWithAes('敏感数据', key)

// RSA 加密
const rsaEncrypted = rsaEncrypt('重要信息')
```

### 💾 缓存管理
**cache.ts** - 浏览器存储封装
- **会话缓存**: sessionStorage 封装，支持 JSON 对象
- **本地缓存**: localStorage 封装，支持过期时间
- **自动清理**: 定期清理过期缓存
- **统计信息**: 缓存使用情况监控

```typescript
import { sessionCache, localCache } from '@/utils/cache'

// 会话缓存
sessionCache.setJSON('userInfo', { id: 1, name: '张三' })
const user = sessionCache.getJSON('userInfo')

// 本地缓存（7天过期）
localCache.set('theme', 'dark', 7 * 24 * 3600)
const theme = localCache.get('theme')
```

### 🎯 DOM 操作
**class.ts & scroll.ts** - DOM 元素和页面操作
- **类名操作**: 添加、删除、切换、替换 CSS 类名
- **滚动控制**: 平滑滚动、滚动到元素、可见性检测
- **动画支持**: 缓动函数、动画帧控制

```typescript
import { addClass, removeClass, toggleClass } from '@/utils/class'
import { scrollToTop, scrollToElement } from '@/utils/scroll'

// DOM 类名操作
addClass(element, 'active')
toggleClass(element, 'visible')

// 平滑滚动
scrollToTop(800) // 800ms 滚动到顶部
scrollToElement('#section', 0, 500) // 滚动到指定元素
```

### 🌳 数据结构
**tree.ts** - 树形数据处理专家
- **树构建**: 平铺数组转树结构
- **树操作**: 查找节点、插入删除、更新节点
- **树遍历**: 深度遍历、广度遍历、路径查找
- **树转换**: 扁平化、过滤、叶子节点获取

```typescript
import { buildTree, findTreeNode, flattenTree } from '@/utils/tree'

// 构建树结构
const tree = buildTree(flatData, { id: 'id', parentId: 'pid' })

// 查找节点
const node = findTreeNode(tree, node => node.id === '123')

// 扁平化树
const flatArray = flattenTree(tree)
```

### 💬 UI 交互
**modal.ts** - Element Plus 弹窗消息封装
- **消息提示**: 成功、错误、警告、信息提示
- **弹窗对话**: 确认框、输入框、警告框
- **通知消息**: 右上角通知推送
- **加载状态**: 全局加载遮罩控制

```typescript
import { showMsgSuccess, showConfirm, showLoading, hideLoading } from '@/utils/modal'

// 消息提示
showMsgSuccess('操作成功！')

// 确认对话框
const [err] = await showConfirm('确定要删除这条记录吗？')
if (!err) {
  // 用户确认删除
  handleDelete()
}

// 加载状态
showLoading('数据加载中...')
// 操作完成后
hideLoading()
```

### 📑 页面管理
**tab.ts** - 标签页导航控制
- **页面操作**: 刷新、关闭、打开新页面
- **批量管理**: 关闭全部、关闭左侧、关闭右侧
- **状态更新**: 页面标题、路由信息更新

```typescript
import { refreshPage, closePage, openPage, closeOtherPage } from '@/utils/tab'

// 刷新当前页面
refreshPage()

// 打开新页面
openPage('/user/detail', '用户详情', { id: '123' })

// 关闭其他页面
closeOtherPage()
```

### 🛡️ 错误处理
**to.ts** - 优雅的异步错误处理
- **基础包装**: Promise 转 `[error, data]` 格式
- **表单验证**: Element Plus 表单验证封装
- **批量处理**: 多个异步操作并行处理
- **增强功能**: 超时控制、重试机制、条件执行

```typescript
import { to, toValidate, toAll, toWithTimeout } from '@/utils/to'

// 基础异步处理
const [err, userData] = await to(fetchUserData(userId))
if (err) {
  console.error('获取用户数据失败:', err.message)
  return
}

// 表单验证
const [validErr, isValid] = await toValidate(formRef.value)
if (!validErr && isValid) {
  submitForm()
}

// 批量请求
const results = await toAll([api1(), api2(), api3()])
```

### ⚡ 逻辑处理
**boolean.ts** - 布尔值处理工具
- **类型判断**: 多格式真假值检查
- **类型转换**: 统一转换为标准布尔格式
- **状态切换**: 布尔状态切换操作

```typescript
import { isTrue, isFalse, toBoolString, toggleStatus } from '@/utils/boolean'

// 多格式布尔判断
const result1 = isTrue('1')        // true
const result2 = isTrue('yes')      // true
const result3 = isFalse(null)      // true

// 类型转换
const boolStr = toBoolString('yes')    // '1'
const boolVal = toBool('false')        // false

// 状态切换
const newStatus = toggleStatus('true')   // '0'
```

## 🚀 使用方式

### 按需导入
```typescript
// 推荐：按需导入需要的函数
import { formatDate, isEmail, deepClone } from '@/utils'

// 或者从具体文件导入
import { formatDate } from '@/utils/date'
import { isEmail } from '@/utils/validators'
import { deepClone } from '@/utils/object'
```

### 统一导入（不推荐）
```typescript
// 不推荐：导入整个工具库（会增加打包体积）
import * as utils from '@/utils'
```

## 📋 工具函数统计

| 分类 | 文件名 | 函数数量 | 主要功能 |
|------|--------|----------|----------|
| 字符串处理 | string.ts | 15+ | 字符串操作、格式转换、验证 |
| 对象操作 | object.ts | 12+ | 对象处理、数组操作、数据转换 |
| 日期时间 | date.ts | 18+ | 日期格式化、时间计算 |
| 数据格式化 | format.ts | 20+ | 数值、文本、隐私数据格式化 |
| 函数增强 | function.ts | 15+ | 防抖节流、异步控制、函数式编程 |
| 数据验证 | validators.ts | 35+ | 各类格式验证、类型检查 |
| 布尔处理 | boolean.ts | 5+ | 布尔值判断、转换、切换 |
| 加密安全 | crypto.ts | 10+ | AES加密、哈希计算 |
| RSA加密 | rsa.ts | 5+ | RSA加解密、数字签名 |
| 缓存管理 | cache.ts | 20+ | 浏览器存储封装 |
| DOM操作 | class.ts | 7+ | CSS类名操作 |
| 滚动控制 | scroll.ts | 6+ | 页面滚动、元素可见性 |
| 树形数据 | tree.ts | 15+ | 树结构构建、操作、遍历 |
| UI交互 | modal.ts | 15+ | 消息提示、弹窗对话 |
| 页面管理 | tab.ts | 8+ | 标签页操作、路由管理 |
| 错误处理 | to.ts | 10+ | 异步错误处理、Promise包装 |

## 🎯 最佳实践

### 1. 按需导入，减少打包体积
```typescript
// ✅ 推荐
import { formatDate } from '@/utils/date'

// ❌ 不推荐
import * as dateUtils from '@/utils/date'
```

### 2. 使用 TypeScript 类型提示
```typescript
// 利用完整的类型提示
import { TreeNode, buildTree } from '@/utils/tree'

const data: TreeNode[] = [/* ... */]
const tree = buildTree(data, { id: 'id', parentId: 'parentId' })
```

### 3. 组合使用提升效率
```typescript
import { to } from '@/utils/to'
import { formatCurrency } from '@/utils/format'
import { showMsgError, showMsgSuccess } from '@/utils/modal'

const handleSubmit = async () => {
  const [err, result] = await to(submitOrder())
  
  if (err) {
    showMsgError('提交失败：' + err.message)
    return
  }
  
  const amount = formatCurrency(result.totalAmount)
  showMsgSuccess(`订单提交成功，金额：${amount}`)
}
```

### 4. 错误处理最佳实践
```typescript
import { to, toValidate } from '@/utils/to'

const handleFormSubmit = async () => {
  // 1. 表单验证
  const [validErr, isValid] = await toValidate(formRef.value)
  if (validErr || !isValid) {
    return
  }
  
  // 2. 数据提交
  const [submitErr, result] = await to(submitData())
  if (submitErr) {
    handleError(submitErr)
    return
  }
  
  // 3. 成功处理
  handleSuccess(result)
}
```


通过这些工具函数，可以大大提升开发效率，减少重复代码，让项目代码更加优雅和可维护。每个工具都经过精心设计，支持 TypeScript 类型提示，并提供了完整的使用示例和最佳实践。
