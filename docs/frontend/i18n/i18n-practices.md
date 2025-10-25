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
