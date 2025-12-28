# 国际化最佳实践

## 概述

本文档提供在框架中使用国际化的最佳实践和常见模式，帮助开发者高效、规范地实现多语言支持。

## 代码组织

### 语言包结构规范

1. **模块化组织**

```typescript
// ✅ 推荐：按功能模块组织
export default {
  button: { /* 按钮翻译 */ },
  dialog: { /* 对话框翻译 */ },
  message: { /* 消息翻译 */ },
  login: { /* 登录模块 */ },
  user: { /* 用户模块 */ }
}

// ❌ 不推荐：扁平化结构
export default {
  addButton: '新增',
  deleteButton: '删除',
  loginUserName: '用户名',
  // ... 难以维护
}
```

2. **使用注释分组**

```typescript
export default {
  /** 按钮权限系统 */
  button: {
    query: '查询',
    add: '新增'
  },

  /** 消息提示 */
  message: {
    success: '操作成功',
    error: '操作失败'
  }
}
```

3. **保持结构一致**

确保所有语言包的结构完全一致：

```typescript
// zh_CN.ts
export default {
  button: {
    add: '新增',
    delete: '删除'
  }
}

// en_US.ts
export default {
  button: {
    add: 'Add',
    delete: 'Delete'
  }
}
```

## 命名规范

### 键名命名

1. **使用小驼峰命名法（camelCase）**

```typescript
// ✅ 推荐
{
  userName: '用户名',
  loginSuccess: '登录成功',
  resetPassword: '重置密码'
}

// ❌ 不推荐
{
  'user-name': '用户名',
  'login_success': '登录成功',
  'ResetPassword': '重置密码'
}
```

2. **使用有意义的名称**

```typescript
// ✅ 推荐
{
  confirmDelete: '是否确认删除下列数据:',
  exportSuccess: '导出成功'
}

// ❌ 不推荐
{
  msg1: '是否确认删除下列数据:',
  s1: '导出成功'
}
```

3. **菜单父级使用 `_self`**

```typescript
menu: {
  system: {
    _self: '系统管理',  // 父级菜单名称
    user: '用户管理',
    role: '角色管理'
  }
}
```

## 使用场景

### 1. 表格列标题

推荐使用 `field + comment` 模式：

```vue
<template>
  <el-table :data="tableData">
    <!-- ✅ 推荐：使用 field + comment -->
    <el-table-column
      :label="t('', { field: 'UserName', comment: '用户名' })"
      prop="userName"
    />
    <el-table-column
      :label="t('', { field: 'CreateTime', comment: '创建时间' })"
      prop="createTime"
    />

    <!-- ❌ 不推荐：硬编码 -->
    <el-table-column label="用户名" prop="userName" />
  </el-table>
</template>
```

### 2. 按钮文本

使用语言包中的 `button` 模块：

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
const { t } = useI18n()
</script>

<template>
  <!-- ✅ 推荐：使用语言包 -->
  <el-button>{{ t('button.add') }}</el-button>
  <el-button>{{ t('button.update') }}</el-button>
  <el-button>{{ t('button.delete') }}</el-button>

  <!-- ❌ 不推荐：硬编码 -->
  <el-button>新增</el-button>
  <el-button>修改</el-button>
</template>
```

### 3. 消息提示

```typescript
import { useI18n } from '@/composables/useI18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

// ✅ 推荐：使用语言包
const handleSuccess = () => {
  ElMessage.success(t('message.addSuccess'))
}

// ❌ 不推荐：硬编码
const handleSuccess = () => {
  ElMessage.success('新增成功')
}
```

### 4. 表单验证

```typescript
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

// ✅ 推荐：使用语言包
const rules = {
  userName: [
    {
      required: true,
      message: t('login.rule.userName.required'),
      trigger: 'blur'
    }
  ]
}

// ❌ 不推荐：硬编码
const rules = {
  userName: [
    {
      required: true,
      message: '请输入您的账号',
      trigger: 'blur'
    }
  ]
}
```

### 5. 对话框标题

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
const { t } = useI18n()

const dialogTitle = computed(() => {
  return form.id ? t('dialog.edit') : t('dialog.add')
})
</script>

<template>
  <el-dialog :title="dialogTitle">
    <!-- 对话框内容 -->
  </el-dialog>
</template>
```

## 动态内容处理

### 使用占位符

```typescript
// 语言包定义
{
  registerSuccess: '恭喜你，您的账号 {userName} 注册成功！',
  passwordLength: '用户密码长度必须介于 {min} 和 {max} 之间'
}

// 使用
const { t } = useI18n()
const message = t('register.registerSuccess', { userName: 'admin' })
const rule = t('register.rule.password.length', { min: 6, max: 20 })
```

### 处理复数和数量

```typescript
// 语言包定义
{
  itemCount: '共 {count} 条'
}

// 使用
const { t } = useI18n()
const message = t('itemCount', { count: 10 })  // "共 10 条"
```

## 条件渲染

### 根据语言显示不同内容

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
const { isChinese, isEnglish } = useI18n()
</script>

<template>
  <div>
    <!-- ✅ 推荐：使用计算属性 -->
    <p v-if="isChinese">这是中文特有的内容</p>
    <p v-if="isEnglish">This is English-specific content</p>

    <!-- ✅ 也可以：根据语言代码判断 -->
    <p v-if="currentLanguage === LanguageCode.zh_CN">
      显示中文内容
    </p>
  </div>
</template>
```

## 性能优化

### 1. 避免在循环中创建 useI18n

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

// ✅ 推荐：在组件顶层创建一次
const { t } = useI18n()

const items = [
  { key: 'button.add', value: t('button.add') },
  { key: 'button.delete', value: t('button.delete') }
]
</script>

<!-- ❌ 不推荐：在 v-for 内部使用多次 -->
```

### 2. 缓存翻译结果

```typescript
import { useI18n } from '@/composables/useI18n'

const { t, currentLanguage } = useI18n()

// ✅ 推荐：使用计算属性缓存
const buttonLabels = computed(() => ({
  add: t('button.add'),
  update: t('button.update'),
  delete: t('button.delete')
}))
```

## 类型安全

### 使用类型提示

框架提供完整的类型支持：

```typescript
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

// ✅ 编辑器会自动提示可用的键
t('button.')  // 自动补全: add, update, delete...
t('message.')  // 自动补全: success, error...

// ⚠️ 不存在的键会有警告
t('button.notExist')  // TypeScript 警告
```

## 测试建议

### 1. 测试不同语言环境

```typescript
import { describe, it, expect } from 'vitest'
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

describe('i18n', () => {
  it('should return correct translation in Chinese', () => {
    const { t, setLanguage } = useI18n()
    setLanguage(LanguageCode.zh_CN)
    expect(t('button.add')).toBe('新增')
  })

  it('should return correct translation in English', () => {
    const { t, setLanguage } = useI18n()
    setLanguage(LanguageCode.en_US)
    expect(t('button.add')).toBe('Add')
  })
})
```

### 2. 确保语言包完整性

```typescript
// 检查所有语言包是否有相同的键
const zh_CN_keys = Object.keys(zh_CN)
const en_US_keys = Object.keys(en_US)

console.assert(
  JSON.stringify(zh_CN_keys.sort()) === JSON.stringify(en_US_keys.sort()),
  'Language pack keys mismatch'
)
```

## 常见错误

### 1. 硬编码文本

```vue
<!-- ❌ 错误：硬编码中文 -->
<el-button>新增</el-button>
<p>操作成功</p>

<!-- ✅ 正确：使用国际化 -->
<el-button>{{ t('button.add') }}</el-button>
<p>{{ t('message.success') }}</p>
```

### 2. 混合使用不同的键名风格

```typescript
// ❌ 错误：混合命名风格
{
  userName: '用户名',
  'user-email': '邮箱',
  UserPhone: '电话'
}

// ✅ 正确：统一使用 camelCase
{
  userName: '用户名',
  userEmail: '邮箱',
  userPhone: '电话'
}
```

### 3. 在模板中创建 useI18n

```vue
<!-- ❌ 错误：在模板中创建 -->
<template>
  <div>{{ useI18n().t('button.add') }}</div>
</template>

<!-- ✅ 正确：在 script 中创建 -->
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div>{{ t('button.add') }}</div>
</template>
```

### 4. 语言包结构不一致

```typescript
// ❌ 错误：zh_CN 和 en_US 结构不同
// zh_CN.ts
export default {
  button: {
    add: '新增',
    delete: '删除'
  }
}

// en_US.ts
export default {
  button: {
    add: 'Add'
    // 缺少 delete
  },
  action: {  // zh_CN 中没有这个
    save: 'Save'
  }
}
```

## 迁移现有代码

### 从硬编码迁移到国际化

1. **识别硬编码文本**

```bash
# 搜索中文字符
grep -r "[\u4e00-\u9fa5]" src/
```

2. **添加到语言包**

```typescript
// zh_CN.ts
export default {
  user: {
    userName: '用户名',
    password: '密码'
  }
}

// en_US.ts
export default {
  user: {
    userName: 'User Name',
    password: 'Password'
  }
}
```

3. **替换组件中的硬编码**

```vue
<!-- 迁移前 -->
<el-form-item label="用户名">
  <el-input v-model="form.userName" />
</el-form-item>

<!-- 迁移后 -->
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
const { t } = useI18n()
</script>

<el-form-item :label="t('user.userName')">
  <el-input v-model="form.userName" />
</el-form-item>
```

## 扩展新语言

如需添加新语言（如繁体中文 `zh_TW`）：

1. **添加语言代码枚举**

```typescript
// src/systemConfig.ts
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US',
  zh_TW = 'zh_TW'  // 新增
}
```

2. **创建语言包文件**

```typescript
// src/locales/zh_TW.ts
export default {
  button: {
    add: '新增',
    delete: '刪除'
  }
  // ... 复制 zh_CN 的结构并翻译
}
```

3. **注册到 i18n 实例**

```typescript
// src/locales/i18n.ts
import zh_TW from '@/locales/zh_TW'

const i18n = createI18n({
  // ...
  messages: {
    zh_CN: { ...zh_CN, ...el_zhCn },
    en_US: { ...en_US, ...el_en },
    zh_TW: { ...zh_TW, ...el_zhTw }  // 新增
  }
})
```

4. **更新 useI18n 的语言名称映射**

```typescript
// src/composables/useI18n.ts
const currentLanguageName = computed(() => {
  switch (currentLanguage.value) {
    case LanguageCode.zh_CN:
      return '简体中文'
    case LanguageCode.en_US:
      return 'English'
    case LanguageCode.zh_TW:
      return '繁體中文'  // 新增
    default:
      return currentLanguage.value
  }
})
```

## 调试技巧

### 1. 检查缺失的翻译键

```typescript
import { useI18n } from '@/composables/useI18n'

const { t, te } = useI18n()

const checkTranslation = (key: string) => {
  if (!te(key)) {
    console.warn(`Translation key missing: ${key}`)
  }
  return t(key)
}
```

### 2. 显示翻译键而非翻译值

在开发过程中，可以临时修改 `t()` 函数返回键名：

```typescript
// 开发模式：显示键名
const t = (key: string) => {
  return import.meta.env.DEV ? key : vueI18n.t(key)
}
```

## 常见问题

### 1. 语言切换后部分内容未更新或显示错误

**问题描述：**

切换语言后，页面上部分文本仍然显示旧语言，或者某些组件的翻译没有响应式更新：

```vue
<template>
  <!-- 切换语言后，staticText 仍显示旧语言 -->
  <div>{{ staticText }}</div>

  <!-- tableColumns 中的 label 没有更新 -->
  <el-table :data="data">
    <el-table-column
      v-for="col in tableColumns"
      :key="col.prop"
      :label="col.label"
    />
  </el-table>
</template>

<script setup lang="ts">
const { t } = useI18n()

// 问题1：非响应式赋值
const staticText = t('button.add')

// 问题2：在非响应式上下文中使用翻译
const tableColumns = [
  { prop: 'name', label: t('user.name') },
  { prop: 'age', label: t('user.age') }
]
</script>
```

**问题原因：**

- 在 `setup()` 函数顶层直接调用 `t()` 并赋值给普通变量
- 翻译结果在组件创建时计算一次，不会响应语言变化
- 数组或对象中的翻译值不具备响应性
- Vue I18n 的 `t()` 函数本身是响应式的，但赋值后丢失响应性

**解决方案：**

```typescript
// 方案1：使用计算属性保持响应性
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

// ✅ 正确：使用计算属性
const staticText = computed(() => t('button.add'))

// ✅ 正确：表格列使用计算属性
const tableColumns = computed(() => [
  { prop: 'name', label: t('user.name') },
  { prop: 'age', label: t('user.age') }
])

// 方案2：在模板中直接使用 t()
// 模板中的 t() 调用会自动响应语言变化
<template>
  <div>{{ t('button.add') }}</div>

  <el-table :data="data">
    <el-table-column prop="name" :label="t('user.name')" />
    <el-table-column prop="age" :label="t('user.age')" />
  </el-table>
</template>

// 方案3：监听语言变化并更新数据
import { watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t, currentLanguage } = useI18n()
const tableColumns = ref([])

// 监听语言变化，重新计算表格列
watch(currentLanguage, () => {
  tableColumns.value = [
    { prop: 'name', label: t('user.name') },
    { prop: 'age', label: t('user.age') }
  ]
}, { immediate: true })

// 方案4：使用翻译键而非翻译值
interface Column {
  prop: string
  labelKey: string  // 存储键名而非翻译值
}

const tableColumns: Column[] = [
  { prop: 'name', labelKey: 'user.name' },
  { prop: 'age', labelKey: 'user.age' }
]

// 模板中翻译
<template>
  <el-table :data="data">
    <el-table-column
      v-for="col in tableColumns"
      :key="col.prop"
      :prop="col.prop"
      :label="t(col.labelKey)"
    />
  </el-table>
</template>

// 方案5：创建响应式翻译工具函数
function useReactiveTranslation() {
  const { t, currentLanguage } = useI18n()

  // 创建响应式翻译函数
  const rt = (key: string, params?: Record<string, unknown>) => {
    return computed(() => t(key, params))
  }

  // 批量创建响应式翻译
  const rtBatch = (keys: string[]) => {
    return computed(() => {
      const result: Record<string, string> = {}
      keys.forEach(key => {
        result[key] = t(key)
      })
      return result
    })
  }

  return { rt, rtBatch }
}

// 使用示例
const { rt, rtBatch } = useReactiveTranslation()
const buttonAdd = rt('button.add')  // ComputedRef<string>
const buttons = rtBatch(['button.add', 'button.delete', 'button.update'])

// 方案6：使用 provide/inject 共享翻译状态
// 在根组件中
import { provide, reactive, watch } from 'vue'

const { t, currentLanguage } = useI18n()

const translations = reactive({
  buttonAdd: '',
  buttonDelete: '',
  userTitle: ''
})

watch(currentLanguage, () => {
  translations.buttonAdd = t('button.add')
  translations.buttonDelete = t('button.delete')
  translations.userTitle = t('user.title')
}, { immediate: true })

provide('translations', translations)

// 在子组件中
const translations = inject('translations')
// translations.buttonAdd 会自动响应语言变化

// 方案7：强制组件重新渲染
// 当语言变化时，使用 key 强制重新渲染组件
<template>
  <ComplexComponent :key="languageKey" />
</template>

<script setup lang="ts">
const { currentLanguage } = useI18n()
const languageKey = computed(() => `lang-${currentLanguage.value}`)
</script>
```

### 2. 动态翻译键无法正确解析

**问题描述：**

使用变量作为翻译键时，翻译不生效或显示原始键名：

```typescript
// 翻译键是动态的
const status = ref('pending')
const statusText = t(`status.${status.value}`)  // 显示 "status.pending" 而非翻译值

// 从接口获取的状态码
const code = 'USER_NOT_FOUND'
const message = t(`error.${code}`)  // 可能显示原键名
```

**问题原因：**

- 语言包中不存在对应的翻译键
- 动态键的格式与语言包结构不匹配
- 键名中包含特殊字符或路径错误
- TypeScript 类型检查无法验证动态键

**解决方案：**

```typescript
// 方案1：确保语言包包含所有可能的键
// zh_CN.ts
export default {
  status: {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  },
  error: {
    USER_NOT_FOUND: '用户不存在',
    PERMISSION_DENIED: '权限不足',
    NETWORK_ERROR: '网络错误'
  }
}

// 方案2：使用 te() 检查键是否存在
import { useI18n } from '@/composables/useI18n'

const { t, te } = useI18n()

function safeTranslate(key: string, fallback?: string): string {
  if (te(key)) {
    return t(key)
  }
  console.warn(`Translation key not found: ${key}`)
  return fallback || key
}

// 使用
const statusText = safeTranslate(`status.${status.value}`, '未知状态')

// 方案3：创建带类型安全的动态翻译映射
type StatusCode = 'pending' | 'processing' | 'completed' | 'failed'

const statusKeyMap: Record<StatusCode, string> = {
  pending: 'status.pending',
  processing: 'status.processing',
  completed: 'status.completed',
  failed: 'status.failed'
}

function getStatusText(code: StatusCode): string {
  const key = statusKeyMap[code]
  return key ? t(key) : code
}

// 方案4：创建翻译键验证工具
interface TranslationKeyValidator {
  validate(key: string): boolean
  getAvailableKeys(prefix: string): string[]
  suggestKey(key: string): string | null
}

function createKeyValidator(messages: Record<string, unknown>): TranslationKeyValidator {
  const flattenKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
    const keys: string[] = []
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'object' && value !== null) {
        keys.push(...flattenKeys(value as Record<string, unknown>, fullKey))
      } else {
        keys.push(fullKey)
      }
    }
    return keys
  }

  const allKeys = flattenKeys(messages)

  return {
    validate(key: string): boolean {
      return allKeys.includes(key)
    },

    getAvailableKeys(prefix: string): string[] {
      return allKeys.filter(k => k.startsWith(prefix))
    },

    suggestKey(key: string): string | null {
      // 简单的模糊匹配
      const similar = allKeys.find(k =>
        k.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(k.toLowerCase())
      )
      return similar || null
    }
  }
}

// 使用
import zhCN from '@/locales/zh_CN'
const validator = createKeyValidator(zhCN)

if (!validator.validate(`status.${code}`)) {
  const suggestion = validator.suggestKey(code)
  console.warn(`Key not found: status.${code}, suggestion: ${suggestion}`)
}

// 方案5：处理接口返回的错误码
interface ApiError {
  code: string
  message: string
}

function translateApiError(error: ApiError): string {
  const key = `error.${error.code}`

  // 优先使用本地化翻译
  if (te(key)) {
    return t(key)
  }

  // 回退到接口返回的消息
  if (error.message) {
    return error.message
  }

  // 最终回退到错误码
  return error.code
}

// 方案6：使用枚举确保类型安全
enum ErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// 创建类型安全的翻译函数
function translateError(code: ErrorCode): string {
  return t(`error.${code}`)
}

// TypeScript 会在编译时检查参数类型
translateError(ErrorCode.USER_NOT_FOUND)  // ✅
translateError('UNKNOWN_CODE')  // ❌ TypeScript 错误

// 方案7：动态加载翻译键
async function loadDynamicTranslations(category: string): Promise<void> {
  try {
    const translations = await import(`@/locales/dynamic/${category}.ts`)
    // 合并到现有语言包
    const i18n = useI18n()
    i18n.mergeLocaleMessage(currentLanguage.value, translations.default)
  } catch (error) {
    console.error(`Failed to load translations for: ${category}`)
  }
}

// 使用时先加载
await loadDynamicTranslations('errors')
const errorMessage = t(`error.${errorCode}`)
```

### 3. 复数和数量的国际化处理不正确

**问题描述：**

不同语言的复数规则不同，简单的占位符替换无法正确处理复数形式：

```typescript
// 语言包
{
  itemCount: '共 {count} 条'  // 中文只需一种形式
}

// 但英文需要区分单复数
// 1 item, 2 items, 0 items
```

**问题原因：**

- 不同语言有不同的复数规则（单数、双数、少量、多量等）
- 简单的字符串替换无法处理复杂的复数逻辑
- 某些语言需要根据数量显示完全不同的表达

**解决方案：**

```typescript
// 方案1：使用 Vue I18n 的复数功能
// zh_CN.ts
export default {
  items: '共 {count} 条',
  files: '{count} 个文件'
}

// en_US.ts
export default {
  items: 'no items | {count} item | {count} items',
  files: 'no files | {count} file | {count} files'
}

// 使用 tc() 或 t() 的复数模式
const { t } = useI18n()
const itemText = t('items', { count: 10 })  // 英文: "10 items", 中文: "共 10 条"
const fileText = t('files', { count: 1 })   // 英文: "1 file", 中文: "1 个文件"

// 方案2：为中文创建统一的复数处理
// zh_CN.ts
export default {
  // 使用模板语法
  items: '共 {count} 条',
  files: '{count} 个文件',

  // 需要区分的情况（中文较少见）
  message: {
    none: '没有消息',
    some: '有 {count} 条消息'
  }
}

// en_US.ts
export default {
  items: 'no items | {count} item | {count} items',
  files: 'no files | {count} file | {count} files',

  message: {
    none: 'No messages',
    some: 'You have {count} message | You have {count} messages'
  }
}

// 自定义复数处理函数
function pluralize(
  count: number,
  singular: string,
  plural: string,
  zero?: string
): string {
  if (count === 0 && zero) return zero
  if (count === 1) return singular
  return plural
}

// 使用
const fileText = pluralize(
  fileCount,
  t('file.singular'),
  t('file.plural'),
  t('file.none')
)

// 方案3：创建通用的复数处理 Composable
interface PluralOptions {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

function usePlural() {
  const { currentLanguage } = useI18n()

  // 获取当前语言的复数规则
  const getPluralForm = (count: number): keyof PluralOptions => {
    const lang = currentLanguage.value

    if (lang === 'zh_CN') {
      // 中文只有 other
      return 'other'
    }

    if (lang === 'en_US') {
      // 英文：0=other, 1=one, 2+=other
      if (count === 0) return 'zero'
      if (count === 1) return 'one'
      return 'other'
    }

    // 俄语等语言有更复杂的规则
    // ...

    return 'other'
  }

  const plural = (count: number, options: PluralOptions): string => {
    const form = getPluralForm(count)
    const template = options[form] || options.other
    return template.replace('{count}', String(count))
  }

  return { plural, getPluralForm }
}

// 使用
const { plural } = usePlural()
const text = plural(5, {
  zero: 'No items',
  one: '{count} item',
  other: '{count} items'
})

// 方案4：使用 Intl.PluralRules（原生 API）
function createPluralFormatter(locale: string) {
  const pluralRules = new Intl.PluralRules(locale)

  return function format(
    count: number,
    forms: { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string }
  ): string {
    const rule = pluralRules.select(count)
    const template = forms[rule as keyof typeof forms] || forms.other
    return template.replace(/{count}/g, String(count))
  }
}

// 使用
const formatPlural = createPluralFormatter('en-US')
const text = formatPlural(2, {
  one: '1 file selected',
  other: '{count} files selected'
})  // "2 files selected"

// 方案5：处理特殊的数量表达
// 语言包
export default {
  time: {
    justNow: '刚刚',
    minutesAgo: '{count} 分钟前',
    hoursAgo: '{count} 小时前',
    daysAgo: '{count} 天前',
    weeksAgo: '{count} 周前',
    monthsAgo: '{count} 个月前',
    yearsAgo: '{count} 年前'
  }
}

function formatRelativeTime(date: Date): string {
  const { t } = useI18n()
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return t('time.justNow')
  if (minutes < 60) return t('time.minutesAgo', { count: minutes })
  if (hours < 24) return t('time.hoursAgo', { count: hours })
  if (days < 7) return t('time.daysAgo', { count: days })
  if (weeks < 4) return t('time.weeksAgo', { count: weeks })
  if (months < 12) return t('time.monthsAgo', { count: months })
  return t('time.yearsAgo', { count: years })
}

// 方案6：处理范围数量
function formatRange(min: number, max: number): string {
  const { t, currentLanguage } = useI18n()

  if (currentLanguage.value === 'zh_CN') {
    return t('range.between', { min, max })  // "{min} 到 {max} 之间"
  }

  // 英文使用不同的表达
  return t('range.between', { min, max })  // "between {min} and {max}"
}

// 语言包
// zh_CN: { range: { between: '{min} 到 {max} 之间' } }
// en_US: { range: { between: 'between {min} and {max}' } }
```

### 4. 语言包缺失或加载失败

**问题描述：**

部分翻译显示为键名而非翻译值，或者切换到某些语言时完全无法显示翻译：

```
// 预期显示："新增用户"
// 实际显示："user.addUser" 或 undefined
```

**问题原因：**

- 语言包文件未正确导入
- 翻译键在某些语言包中缺失
- 动态加载语言包失败
- 语言包结构不一致
- 语言包合并顺序错误

**解决方案：**

```typescript
// 方案1：创建语言包完整性检查工具
interface KeyCheckResult {
  missingKeys: string[]
  extraKeys: string[]
  isComplete: boolean
}

function checkLanguagePackCompleteness(
  reference: Record<string, unknown>,
  target: Record<string, unknown>,
  prefix = ''
): KeyCheckResult {
  const missingKeys: string[] = []
  const extraKeys: string[] = []

  const getKeys = (obj: Record<string, unknown>, pre: string): string[] => {
    const keys: string[] = []
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = pre ? `${pre}.${key}` : key
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...getKeys(value as Record<string, unknown>, fullKey))
      } else {
        keys.push(fullKey)
      }
    }
    return keys
  }

  const refKeys = new Set(getKeys(reference, prefix))
  const targetKeys = new Set(getKeys(target, prefix))

  // 找出目标语言包缺失的键
  refKeys.forEach(key => {
    if (!targetKeys.has(key)) {
      missingKeys.push(key)
    }
  })

  // 找出目标语言包多余的键
  targetKeys.forEach(key => {
    if (!refKeys.has(key)) {
      extraKeys.push(key)
    }
  })

  return {
    missingKeys,
    extraKeys,
    isComplete: missingKeys.length === 0
  }
}

// 使用
import zhCN from '@/locales/zh_CN'
import enUS from '@/locales/en_US'

const result = checkLanguagePackCompleteness(zhCN, enUS)
if (!result.isComplete) {
  console.warn('English language pack is incomplete:')
  console.warn('Missing keys:', result.missingKeys)
  console.warn('Extra keys:', result.extraKeys)
}

// 方案2：创建安全的翻译函数，带回退机制
function createSafeI18n() {
  const { t, te, currentLanguage } = useI18n()

  // 回退语言顺序
  const fallbackChain = ['en_US', 'zh_CN']

  const safeT = (key: string, params?: Record<string, unknown>): string => {
    // 尝试当前语言
    if (te(key)) {
      return t(key, params)
    }

    // 尝试回退语言
    for (const fallback of fallbackChain) {
      if (fallback !== currentLanguage.value) {
        // 临时切换语言检查
        // 注意：这是简化示例，实际需要更复杂的处理
        const fallbackMessage = messages[fallback]?.[key]
        if (fallbackMessage) {
          console.warn(`Using fallback translation for key: ${key}`)
          return typeof fallbackMessage === 'string'
            ? fallbackMessage
            : t(key, params)
        }
      }
    }

    // 最终回退：返回键名的可读形式
    console.error(`Translation not found: ${key}`)
    return key.split('.').pop() || key
  }

  return { t: safeT, te }
}

// 方案3：在开发环境添加缺失翻译的自动提示
if (import.meta.env.DEV) {
  const originalT = i18n.global.t.bind(i18n.global)

  i18n.global.t = ((key: string, ...args: any[]) => {
    const result = originalT(key, ...args)

    // 如果翻译结果等于键名，说明翻译缺失
    if (result === key || result.includes(key)) {
      // 收集缺失的翻译
      window.__missingTranslations__ = window.__missingTranslations__ || new Set()
      window.__missingTranslations__.add(key)

      // 在控制台输出
      console.warn(`[i18n] Missing translation: ${key}`)
    }

    return result
  }) as typeof i18n.global.t

  // 提供导出缺失翻译的方法
  window.__exportMissingTranslations__ = () => {
    const missing = Array.from(window.__missingTranslations__ || [])
    console.log('Missing translations:')
    console.log(JSON.stringify(missing, null, 2))
    return missing
  }
}

// 方案4：动态加载语言包并处理失败
async function loadLanguageAsync(locale: string): Promise<boolean> {
  try {
    // 动态导入语言包
    const messages = await import(`@/locales/${locale}.ts`)

    // 合并到 i18n 实例
    i18n.global.setLocaleMessage(locale, messages.default)

    return true
  } catch (error) {
    console.error(`Failed to load language pack: ${locale}`, error)

    // 回退到默认语言
    if (locale !== 'zh_CN') {
      console.warn(`Falling back to zh_CN`)
      i18n.global.locale.value = 'zh_CN'
    }

    return false
  }
}

// 方案5：使用默认值填充缺失的翻译
function fillMissingTranslations(
  target: Record<string, unknown>,
  reference: Record<string, unknown>,
  path = ''
): Record<string, unknown> {
  const result = { ...target }

  for (const [key, value] of Object.entries(reference)) {
    const currentPath = path ? `${path}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = fillMissingTranslations(
        (target[key] as Record<string, unknown>) || {},
        value as Record<string, unknown>,
        currentPath
      )
    } else if (!(key in result)) {
      // 填充缺失的翻译
      result[key] = `[Missing: ${currentPath}]`
      console.warn(`Filled missing translation: ${currentPath}`)
    }
  }

  return result
}

// 方案6：创建语言包验证脚本
// scripts/validate-i18n.ts
import fs from 'fs'
import path from 'path'

async function validateLanguagePacks() {
  const localesDir = path.resolve(__dirname, '../src/locales')
  const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'))

  const packs: Record<string, Record<string, unknown>> = {}

  for (const file of files) {
    const locale = file.replace('.ts', '')
    const module = await import(path.join(localesDir, file))
    packs[locale] = module.default
  }

  const reference = packs['zh_CN']
  const results: Record<string, KeyCheckResult> = {}

  for (const [locale, pack] of Object.entries(packs)) {
    if (locale !== 'zh_CN') {
      results[locale] = checkLanguagePackCompleteness(reference, pack)
    }
  }

  // 输出报告
  console.log('\n=== Language Pack Validation Report ===\n')

  for (const [locale, result] of Object.entries(results)) {
    console.log(`${locale}:`)
    console.log(`  Complete: ${result.isComplete ? '✅' : '❌'}`)

    if (result.missingKeys.length > 0) {
      console.log(`  Missing keys (${result.missingKeys.length}):`)
      result.missingKeys.forEach(key => console.log(`    - ${key}`))
    }

    if (result.extraKeys.length > 0) {
      console.log(`  Extra keys (${result.extraKeys.length}):`)
      result.extraKeys.forEach(key => console.log(`    - ${key}`))
    }

    console.log('')
  }
}

validateLanguagePacks()

// 方案7：配置 Vue I18n 的缺失处理器
const i18n = createI18n({
  locale: 'zh_CN',
  fallbackLocale: 'en_US',

  // 缺失翻译时的处理
  missing: (locale, key, vm, values) => {
    console.warn(`[i18n] Missing translation: ${key} (locale: ${locale})`)

    // 返回格式化的缺失提示
    if (import.meta.env.DEV) {
      return `⚠️${key}`
    }

    // 生产环境返回键名的最后一部分
    return key.split('.').pop() || key
  },

  // 是否在控制台显示警告
  silentTranslationWarn: !import.meta.env.DEV,
  silentFallbackWarn: !import.meta.env.DEV
})
```

### 5. 日期、时间、货币等格式化不一致

**问题描述：**

日期、时间、货币等在不同语言环境下显示格式不正确：

```typescript
// 中文期望：2024年1月15日
// 英文期望：January 15, 2024
// 实际可能显示：2024-01-15（两种语言一样）

// 货币格式
// 中文期望：¥1,234.56
// 英文期望：$1,234.56
```

**问题原因：**

- 未使用语言敏感的格式化函数
- 格式化配置未根据语言环境调整
- 使用固定格式的日期/货币库
- 未配置 Vue I18n 的 datetime 和 number 格式

**解决方案：**

```typescript
// 方案1：配置 Vue I18n 的日期时间格式
// src/locales/i18n.ts
const datetimeFormats = {
  'zh_CN': {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric'
    },
    dateOnly: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  },
  'en_US': {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    },
    dateOnly: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  }
}

const i18n = createI18n({
  datetimeFormats,
  // ...
})

// 使用
const { d } = useI18n()
const shortDate = d(new Date(), 'short')  // 中文: 2024年1月15日, 英文: Jan 15, 2024
const longDate = d(new Date(), 'long')    // 带星期和时间

// 方案2：配置 Vue I18n 的数字格式
const numberFormats = {
  'zh_CN': {
    currency: {
      style: 'currency',
      currency: 'CNY',
      currencyDisplay: 'symbol'
    },
    decimal: {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    },
    percent: {
      style: 'percent',
      minimumFractionDigits: 1
    }
  },
  'en_US': {
    currency: {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'symbol'
    },
    decimal: {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    },
    percent: {
      style: 'percent',
      minimumFractionDigits: 1
    }
  }
}

const i18n = createI18n({
  numberFormats,
  // ...
})

// 使用
const { n } = useI18n()
const price = n(1234.56, 'currency')  // 中文: ¥1,234.56, 英文: $1,234.56
const rate = n(0.123, 'percent')      // 12.3%

// 方案3：创建统一的格式化工具
import { useI18n } from '@/composables/useI18n'

function useLocaleFormatter() {
  const { currentLanguage } = useI18n()

  // 日期格式化
  const formatDate = (
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    const d = new Date(date)
    const locale = currentLanguage.value.replace('_', '-')  // zh_CN -> zh-CN

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(d)
  }

  // 时间格式化
  const formatTime = (
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    const d = new Date(date)
    const locale = currentLanguage.value.replace('_', '-')

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: currentLanguage.value === 'en_US'
    }

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(d)
  }

  // 货币格式化
  const formatCurrency = (
    amount: number,
    currency?: string
  ): string => {
    const locale = currentLanguage.value.replace('_', '-')
    const currencyCode = currency || (currentLanguage.value === 'zh_CN' ? 'CNY' : 'USD')

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(amount)
  }

  // 数字格式化
  const formatNumber = (
    num: number,
    options: Intl.NumberFormatOptions = {}
  ): string => {
    const locale = currentLanguage.value.replace('_', '-')
    return new Intl.NumberFormat(locale, options).format(num)
  }

  // 相对时间格式化
  const formatRelativeTime = (
    date: Date | string | number
  ): string => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    const locale = currentLanguage.value.replace('_', '-')
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    if (days > 0) return rtf.format(-days, 'day')
    if (hours > 0) return rtf.format(-hours, 'hour')
    if (minutes > 0) return rtf.format(-minutes, 'minute')
    return rtf.format(-seconds, 'second')
  }

  return {
    formatDate,
    formatTime,
    formatCurrency,
    formatNumber,
    formatRelativeTime
  }
}

// 使用
const { formatDate, formatCurrency, formatRelativeTime } = useLocaleFormatter()

console.log(formatDate(new Date()))          // 2024年1月15日 / January 15, 2024
console.log(formatCurrency(1234.56))         // ¥1,234.56 / $1,234.56
console.log(formatRelativeTime(yesterday))   // 昨天 / yesterday

// 方案4：自定义日期格式化模式
const datePatterns = {
  'zh_CN': {
    short: 'YYYY年M月D日',
    long: 'YYYY年M月D日 dddd',
    datetime: 'YYYY年M月D日 HH:mm:ss',
    time: 'HH:mm:ss'
  },
  'en_US': {
    short: 'MMM D, YYYY',
    long: 'dddd, MMMM D, YYYY',
    datetime: 'MMM D, YYYY h:mm:ss A',
    time: 'h:mm:ss A'
  }
}

function formatDateWithPattern(
  date: Date,
  patternKey: keyof typeof datePatterns['zh_CN'],
  locale: string
): string {
  const pattern = datePatterns[locale as keyof typeof datePatterns]?.[patternKey]
  if (!pattern) return date.toLocaleDateString()

  // 使用 dayjs 或其他库进行格式化
  return dayjs(date).locale(locale.replace('_', '-').toLowerCase()).format(pattern)
}

// 方案5：处理时区问题
function useTimezone() {
  const { currentLanguage } = useI18n()

  // 根据语言获取默认时区
  const defaultTimezone = computed(() => {
    const timezones: Record<string, string> = {
      'zh_CN': 'Asia/Shanghai',
      'en_US': 'America/New_York',
      'ja_JP': 'Asia/Tokyo'
    }
    return timezones[currentLanguage.value] || 'UTC'
  })

  const formatWithTimezone = (
    date: Date,
    timezone?: string,
    options: Intl.DateTimeFormatOptions = {}
  ): string => {
    const tz = timezone || defaultTimezone.value
    const locale = currentLanguage.value.replace('_', '-')

    return new Intl.DateTimeFormat(locale, {
      ...options,
      timeZone: tz
    }).format(date)
  }

  return { defaultTimezone, formatWithTimezone }
}

// 方案6：集成 dayjs 并配置多语言
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

function useDayjs() {
  const { currentLanguage } = useI18n()

  // 根据当前语言配置 dayjs
  const configuredDayjs = computed(() => {
    const localeMap: Record<string, string> = {
      'zh_CN': 'zh-cn',
      'en_US': 'en'
    }
    return dayjs().locale(localeMap[currentLanguage.value] || 'en')
  })

  const format = (date: Date | string, format?: string): string => {
    const localeMap: Record<string, string> = {
      'zh_CN': 'zh-cn',
      'en_US': 'en'
    }
    return dayjs(date).locale(localeMap[currentLanguage.value] || 'en').format(format || 'LL')
  }

  const fromNow = (date: Date | string): string => {
    const localeMap: Record<string, string> = {
      'zh_CN': 'zh-cn',
      'en_US': 'en'
    }
    return dayjs(date).locale(localeMap[currentLanguage.value] || 'en').fromNow()
  }

  return { format, fromNow, configuredDayjs }
}
```

### 6. 嵌套翻译键路径过深导致类型提示失效

**问题描述：**

当语言包结构嵌套层级较深时，TypeScript 的自动补全和类型检查失效：

```typescript
// 深层嵌套的语言包
export default {
  system: {
    user: {
      management: {
        list: {
          title: '用户列表',
          columns: {
            name: '姓名',
            age: '年龄'
          }
        }
      }
    }
  }
}

// 使用时没有类型提示
t('system.user.management.list.columns.name')  // 无自动补全
```

**问题原因：**

- TypeScript 对深层嵌套对象的类型推断有限制
- Vue I18n 的类型定义可能不支持深层键名推断
- 编辑器对复杂类型的处理性能有限

**解决方案：**

```typescript
// 方案1：限制嵌套深度，使用扁平化命名
// ❌ 过深的嵌套
export default {
  system: {
    user: {
      management: {
        list: {
          title: '用户列表'
        }
      }
    }
  }
}

// ✅ 推荐：限制在 2-3 层
export default {
  userList: {
    title: '用户列表',
    columnName: '姓名',
    columnAge: '年龄'
  }
}

// 方案2：生成类型安全的翻译键
// scripts/generate-i18n-types.ts
import fs from 'fs'
import path from 'path'

function generateKeyPaths(
  obj: Record<string, unknown>,
  prefix = ''
): string[] {
  const paths: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      paths.push(...generateKeyPaths(value as Record<string, unknown>, currentPath))
    } else {
      paths.push(currentPath)
    }
  }

  return paths
}

async function generateTypes() {
  const zhCN = await import('../src/locales/zh_CN')
  const keys = generateKeyPaths(zhCN.default)

  const typeContent = `
// 自动生成的翻译键类型，请勿手动修改
// 生成时间: ${new Date().toISOString()}

export type TranslationKey =
${keys.map(key => `  | '${key}'`).join('\n')}

export type TranslationKeyPrefix<T extends string> =
  TranslationKey extends \`\${T}.\${infer Rest}\` ? Rest : never
`

  fs.writeFileSync(
    path.resolve(__dirname, '../src/types/i18n-keys.d.ts'),
    typeContent
  )

  console.log(`Generated ${keys.length} translation keys`)
}

generateTypes()

// 方案3：创建类型安全的翻译函数包装器
// src/types/i18n-keys.d.ts
export type TranslationKey =
  | 'button.add'
  | 'button.delete'
  | 'user.title'
  | 'user.name'
  // ... 更多键

// src/composables/useTypedI18n.ts
import type { TranslationKey } from '@/types/i18n-keys'

export function useTypedI18n() {
  const { t: rawT, te: rawTe, ...rest } = useI18n()

  // 类型安全的翻译函数
  const t = (key: TranslationKey, params?: Record<string, unknown>): string => {
    return rawT(key, params)
  }

  const te = (key: TranslationKey): boolean => {
    return rawTe(key)
  }

  return { t, te, ...rest }
}

// 使用时有完整的类型提示
const { t } = useTypedI18n()
t('button.add')  // ✅ 自动补全
t('nonexistent') // ❌ TypeScript 错误

// 方案4：使用模块化的翻译键常量
// src/locales/keys.ts
export const I18N_KEYS = {
  BUTTON: {
    ADD: 'button.add',
    DELETE: 'button.delete',
    UPDATE: 'button.update'
  },
  USER: {
    TITLE: 'user.title',
    NAME: 'user.name',
    AGE: 'user.age'
  },
  MESSAGE: {
    SUCCESS: 'message.success',
    ERROR: 'message.error'
  }
} as const

// 提取所有值的类型
type ExtractValues<T> = T extends object
  ? { [K in keyof T]: ExtractValues<T[K]> }[keyof T]
  : T

export type I18nKey = ExtractValues<typeof I18N_KEYS>

// 使用
import { I18N_KEYS } from '@/locales/keys'

t(I18N_KEYS.BUTTON.ADD)  // 有完整的自动补全

// 方案5：按模块分割语言包并提供类型
// src/locales/modules/user.ts
export const userLocale = {
  zh_CN: {
    title: '用户管理',
    name: '姓名',
    age: '年龄'
  },
  en_US: {
    title: 'User Management',
    name: 'Name',
    age: 'Age'
  }
} as const

export type UserLocaleKey = keyof typeof userLocale.zh_CN

// 创建模块化的翻译函数
function useUserI18n() {
  const { currentLanguage } = useI18n()

  const t = (key: UserLocaleKey): string => {
    const locale = userLocale[currentLanguage.value as keyof typeof userLocale]
    return locale?.[key] || key
  }

  return { t }
}

// 使用
const { t } = useUserI18n()
t('title')  // 有类型提示：'title' | 'name' | 'age'

// 方案6：创建命名空间翻译函数
function useNamespacedI18n(namespace: string) {
  const { t: rawT, te: rawTe } = useI18n()

  const t = (key: string, params?: Record<string, unknown>): string => {
    const fullKey = `${namespace}.${key}`
    return rawT(fullKey, params)
  }

  const te = (key: string): boolean => {
    const fullKey = `${namespace}.${key}`
    return rawTe(fullKey)
  }

  return { t, te }
}

// 使用
const userI18n = useNamespacedI18n('system.user')
userI18n.t('title')  // 实际调用 t('system.user.title')

// 方案7：使用 VSCode 插件增强类型提示
// 安装 i18n Ally 插件，配置 .vscode/settings.json
{
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.sortKeys": true,
  "i18n-ally.enabledParsers": ["ts"],
  "i18n-ally.sourceLanguage": "zh_CN",
  "i18n-ally.displayLanguage": "zh_CN",
  "i18n-ally.extract.autoDetect": true
}

// 方案8：运行时键名验证（开发环境）
function createValidatedT() {
  const { t: rawT, te } = useI18n()

  return function validatedT(key: string, params?: Record<string, unknown>): string {
    if (import.meta.env.DEV) {
      if (!te(key)) {
        console.error(`[i18n] Invalid translation key: ${key}`)
        console.trace('Called from:')
      }
    }
    return rawT(key, params)
  }
}

const t = createValidatedT()
t('invalid.key')  // 开发环境会在控制台输出错误和调用栈
```

### 7. 翻译内容包含HTML或特殊字符显示异常

**问题描述：**

翻译文本中包含 HTML 标签或特殊字符时显示不正确：

```typescript
// 语言包
{
  welcome: '欢迎 <strong>{name}</strong> 回来！',
  copyright: '© 2024 版权所有',
  terms: '请阅读 <a href="/terms">服务条款</a>'
}

// 页面显示原始 HTML 而非渲染后的效果
// 显示：欢迎 <strong>张三</strong> 回来！
```

**问题原因：**

- Vue 默认会对文本进行 HTML 转义以防止 XSS 攻击
- 使用 `{{ }}` 插值会自动转义 HTML
- 特殊字符（如 `<`, `>`, `&`）被转义

**解决方案：**

```typescript
// 方案1：使用 v-html 渲染 HTML 内容（注意安全风险）
<template>
  <!-- 使用 v-html 渲染 HTML -->
  <p v-html="welcomeMessage"></p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

// ⚠️ 警告：只对可信内容使用 v-html
const welcomeMessage = computed(() => t('welcome', { name: 'John' }))
</script>

// 方案2：使用插槽处理复杂内容
// 语言包
{
  welcome: {
    before: '欢迎',
    after: '回来！'
  }
}

// 组件
<template>
  <p>
    {{ t('welcome.before') }}
    <strong>{{ userName }}</strong>
    {{ t('welcome.after') }}
  </p>
</template>

// 方案3：创建安全的 HTML 渲染组件
// components/I18nHtml.vue
<template>
  <component :is="tag" v-html="sanitizedContent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  content: string
  tag?: string
}>()

// 使用 DOMPurify 清理 HTML
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(props.content, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u', 'br', 'span'],
    ALLOWED_ATTR: ['class', 'style']
  })
})
</script>

// 使用
<template>
  <I18nHtml :content="t('welcome', { name: userName })" />
</template>

// 方案4：使用 Vue I18n 的组件插值
// 语言包
{
  terms: '请阅读 {link} 了解详情'
}

// 组件
<template>
  <i18n-t keypath="terms" tag="p">
    <template #link>
      <router-link to="/terms">服务条款</router-link>
    </template>
  </i18n-t>
</template>

// 方案5：创建翻译内容解析器
interface ParsedSegment {
  type: 'text' | 'bold' | 'link' | 'variable'
  content: string
  href?: string
  variable?: string
}

function parseTranslation(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []

  // 正则匹配各种标记
  const regex = /(<strong>(.*?)<\/strong>)|(<a href="(.*?)">(.*?)<\/a>)|(\{(\w+)\})|([^<{]+)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      // <strong>...</strong>
      segments.push({ type: 'bold', content: match[2] })
    } else if (match[3]) {
      // <a href="...">...</a>
      segments.push({ type: 'link', content: match[5], href: match[4] })
    } else if (match[6]) {
      // {variable}
      segments.push({ type: 'variable', content: match[6], variable: match[7] })
    } else if (match[8]) {
      // 普通文本
      segments.push({ type: 'text', content: match[8] })
    }
  }

  return segments
}

// 渲染组件
<template>
  <span>
    <template v-for="(segment, index) in segments" :key="index">
      <span v-if="segment.type === 'text'">{{ segment.content }}</span>
      <strong v-else-if="segment.type === 'bold'">{{ segment.content }}</strong>
      <a v-else-if="segment.type === 'link'" :href="segment.href">{{ segment.content }}</a>
      <span v-else-if="segment.type === 'variable'">{{ variables[segment.variable] }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  translationKey: string
  variables?: Record<string, string>
}>()

const { t } = useI18n()
const segments = computed(() => parseTranslation(t(props.translationKey)))
</script>

// 方案6：处理特殊字符
// 语言包中使用 HTML 实体
{
  copyright: '&copy; 2024 版权所有',
  arrow: '点击这里 &rarr;',
  math: '1 &lt; 2 &lt; 3'
}

// 或使用 Unicode
{
  copyright: '© 2024 版权所有',
  arrow: '点击这里 →',
  trademark: '产品名™'
}

// 方案7：创建富文本翻译 Composable
function useRichI18n() {
  const { t } = useI18n()

  // 支持 Markdown 风格的简单格式
  const richT = (key: string, params?: Record<string, unknown>): string => {
    let text = t(key, params)

    // 转换 Markdown 格式
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
    text = text.replace(/`(.*?)`/g, '<code>$1</code>')
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

    return text
  }

  return { richT }
}

// 语言包使用 Markdown 格式
{
  welcome: '欢迎 **{name}** 回来！',
  terms: '请阅读 [服务条款](/terms) 了解详情',
  code: '使用 `npm install` 安装依赖'
}

// 方案8：白名单 HTML 标签渲染
const ALLOWED_TAGS = ['strong', 'em', 'b', 'i', 'u', 'br', 'span', 'code']

function sanitizeHtml(html: string): string {
  // 移除所有不在白名单中的标签
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi

  return html.replace(tagRegex, (match, tagName) => {
    if (ALLOWED_TAGS.includes(tagName.toLowerCase())) {
      // 保留允许的标签，但移除所有属性
      if (match.startsWith('</')) {
        return `</${tagName}>`
      }
      return `<${tagName}>`
    }
    // 移除不允许的标签
    return ''
  })
}

// 使用
<template>
  <span v-html="safeContent"></span>
</template>

<script setup lang="ts">
const { t } = useI18n()
const safeContent = computed(() => sanitizeHtml(t('welcome', { name: 'John' })))
</script>
```

### 8. 国际化与第三方组件库集成问题

**问题描述：**

使用 Element Plus、Ant Design 等第三方组件库时，组件内部的文本（如日期选择器的月份、分页的提示）没有跟随应用语言切换：

```vue
<template>
  <!-- Element Plus 组件显示英文，但应用是中文 -->
  <el-date-picker v-model="date" />
  <el-pagination :total="100" />
</template>
```

**问题原因：**

- 第三方组件库有自己的国际化系统
- 未正确配置组件库的语言包
- 应用语言与组件库语言不同步
- 动态切换语言时组件库未更新

**解决方案：**

```typescript
// 方案1：配置 Element Plus 国际化
// src/locales/i18n.ts
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

// 应用语言包
import appZhCN from './zh_CN'
import appEnUS from './en_US'

// 合并语言包
const messages = {
  'zh_CN': { ...appZhCN },
  'en_US': { ...appEnUS }
}

const i18n = createI18n({
  locale: 'zh_CN',
  messages
})

// Element Plus 语言配置
const elementLocales = {
  'zh_CN': zhCn,
  'en_US': en
}

export { i18n, elementLocales }

// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { i18n, elementLocales } from './locales/i18n'

const app = createApp(App)

// 根据当前语言设置 Element Plus
app.use(ElementPlus, {
  locale: elementLocales[i18n.global.locale.value]
})

app.use(i18n)
app.mount('#app')

// 方案2：使用 ConfigProvider 动态切换语言
<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const { currentLanguage } = useI18n()

const localeMap = {
  'zh_CN': zhCn,
  'en_US': en
}

const elementLocale = computed(() => {
  return localeMap[currentLanguage.value as keyof typeof localeMap] || zhCn
})
</script>

// 方案3：创建统一的语言同步系统
// src/composables/useLanguageSync.ts
import { watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

export function useLanguageSync() {
  const { currentLanguage } = useI18n()

  // 同步 dayjs 语言
  const syncDayjs = (lang: string) => {
    const localeMap: Record<string, string> = {
      'zh_CN': 'zh-cn',
      'en_US': 'en'
    }
    dayjs.locale(localeMap[lang] || 'en')
  }

  // 同步文档语言属性
  const syncDocumentLang = (lang: string) => {
    const langMap: Record<string, string> = {
      'zh_CN': 'zh-CN',
      'en_US': 'en-US'
    }
    document.documentElement.lang = langMap[lang] || 'en-US'
  }

  // 同步所有第三方库
  const syncAll = (lang: string) => {
    syncDayjs(lang)
    syncDocumentLang(lang)
    // 添加更多第三方库的同步逻辑
  }

  // 监听语言变化
  watch(currentLanguage, (newLang) => {
    syncAll(newLang)
  }, { immediate: true })

  return { syncAll }
}

// 在 App.vue 中使用
<script setup lang="ts">
import { useLanguageSync } from '@/composables/useLanguageSync'
useLanguageSync()
</script>

// 方案4：Ant Design Vue 国际化配置
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'

<template>
  <a-config-provider :locale="antdLocale">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
const { currentLanguage } = useI18n()

const antdLocaleMap = {
  'zh_CN': zhCN,
  'en_US': enUS
}

const antdLocale = computed(() => {
  return antdLocaleMap[currentLanguage.value as keyof typeof antdLocaleMap] || zhCN
})
</script>

// 方案5：处理 ECharts 图表国际化
import * as echarts from 'echarts'
import { useI18n } from '@/composables/useI18n'

function useEChartsLocale() {
  const { currentLanguage } = useI18n()

  // ECharts 月份/星期等本地化配置
  const localeConfig = computed(() => {
    if (currentLanguage.value === 'zh_CN') {
      return {
        months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      }
    }
    return {
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  })

  return { localeConfig }
}

// 方案6：创建第三方库语言注册中心
interface LibraryLocaleHandler {
  name: string
  setLocale: (lang: string) => void
}

class LocaleRegistry {
  private handlers: LibraryLocaleHandler[] = []

  register(handler: LibraryLocaleHandler): void {
    this.handlers.push(handler)
  }

  unregister(name: string): void {
    this.handlers = this.handlers.filter(h => h.name !== name)
  }

  setLocale(lang: string): void {
    this.handlers.forEach(handler => {
      try {
        handler.setLocale(lang)
      } catch (error) {
        console.error(`Failed to set locale for ${handler.name}:`, error)
      }
    })
  }
}

const localeRegistry = new LocaleRegistry()

// 注册 Element Plus
localeRegistry.register({
  name: 'element-plus',
  setLocale: (lang) => {
    // Element Plus 语言切换逻辑
  }
})

// 注册 dayjs
localeRegistry.register({
  name: 'dayjs',
  setLocale: (lang) => {
    const localeMap: Record<string, string> = {
      'zh_CN': 'zh-cn',
      'en_US': 'en'
    }
    dayjs.locale(localeMap[lang] || 'en')
  }
})

// 在语言切换时调用
const { currentLanguage } = useI18n()
watch(currentLanguage, (lang) => {
  localeRegistry.setLocale(lang)
})

// 方案7：处理组件库内部文案覆盖
// 某些情况下需要覆盖组件库的默认文案

// Element Plus 分页组件自定义文案
<template>
  <el-pagination
    :total="total"
    :page-sizes="[10, 20, 50, 100]"
    layout="total, sizes, prev, pager, next"
  >
    <template #total>
      {{ t('pagination.total', { total }) }}
    </template>
  </el-pagination>
</template>

// 语言包
{
  pagination: {
    total: '共 {total} 条'
  }
}

// 方案8：懒加载第三方库语言包
async function loadLibraryLocale(library: string, locale: string): Promise<void> {
  const loaders: Record<string, Record<string, () => Promise<unknown>>> = {
    'element-plus': {
      'zh_CN': () => import('element-plus/es/locale/lang/zh-cn'),
      'en_US': () => import('element-plus/es/locale/lang/en')
    },
    'ant-design-vue': {
      'zh_CN': () => import('ant-design-vue/es/locale/zh_CN'),
      'en_US': () => import('ant-design-vue/es/locale/en_US')
    }
  }

  const loader = loaders[library]?.[locale]
  if (loader) {
    try {
      const module = await loader()
      // 应用加载的语言包
      console.log(`Loaded ${library} locale: ${locale}`)
      return module.default
    } catch (error) {
      console.error(`Failed to load ${library} locale: ${locale}`, error)
    }
  }
}

// 在语言切换时懒加载
const { currentLanguage } = useI18n()
const elementLocale = ref(zhCn)

watch(currentLanguage, async (lang) => {
  const locale = await loadLibraryLocale('element-plus', lang)
  if (locale) {
    elementLocale.value = locale
  }
}, { immediate: true })
