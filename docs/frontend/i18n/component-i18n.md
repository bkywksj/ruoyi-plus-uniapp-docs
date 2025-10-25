# 组件国际化

## 概述

框架提供了增强的 `useI18n()` composable，支持在组件中灵活使用国际化功能。除了标准的 Vue I18n 功能外，还提供了针对业务场景的增强特性。

## 基础用法

### 在组件中使用

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <!-- 使用语言包键名翻译 -->
    <el-button>{{ t('button.add') }}</el-button>
    <el-button>{{ t('button.delete') }}</el-button>

    <!-- 消息提示 -->
    <p>{{ t('message.success') }}</p>
  </div>
</template>
```

## useI18n API

### 返回值

```typescript
const {
  // 翻译函数
  t,                      // 增强的翻译函数

  // 语言管理
  locale,                 // 当前语言（响应式）
  currentLanguage,        // 当前语言（别名）
  currentLanguageName,    // 当前语言显示名称
  languages,              // 可用语言列表
  setLanguage,            // 设置语言
  initLanguage,           // 初始化语言

  // 语言状态
  isChinese,              // 是否为中文环境
  isEnglish,              // 是否为英文环境

  // 格式化方法
  d,                      // 日期格式化
  n,                      // 数字格式化

  // 其他方法
  te,                     // 检查翻译键是否存在
  tm,                     // 翻译消息函数
  rt,                     // 运行时翻译
  translateRouteTitle     // 翻译路由标题
} = useI18n()
```

## 翻译函数 t() 的增强用法

### 1. 标准用法

使用语言包中定义的键名：

```vue
<template>
  <el-button>{{ t('button.add') }}</el-button>
  <el-button>{{ t('button.update') }}</el-button>
  <p>{{ t('message.success') }}</p>
</template>
```

### 2. 简化用法（field + comment）

适用于表格列标题等场景，根据当前语言自动选择：

```vue
<template>
  <!-- 只使用 field (字段名) -->
  <el-table-column
    :label="t('', { field: 'UserName' })"
    prop="userName"
  />
  <!-- 英文环境: "UserName", 中文环境: "UserName" -->

  <!-- 只使用 comment (字段备注) -->
  <el-table-column
    :label="t('', { comment: '用户名' })"
    prop="userName"
  />
  <!-- 英文环境: "用户名", 中文环境: "用户名" -->

  <!-- 同时使用 field 和 comment -->
  <el-table-column
    :label="t('', { field: 'UserName', comment: '用户名' })"
    prop="userName"
  />
  <!-- 英文环境: "UserName", 中文环境: "用户名" -->
</template>
```

**优先级规则：**
- 中文环境：优先使用 `comment`，降级到 `field`
- 英文环境：优先使用 `field`，降级到 `comment`

### 3. 语言映射用法

使用语言代码明确指定翻译：

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()
</script>

<template>
  <!-- 使用语言特定的翻译 -->
  <el-table-column
    :label="t('', {
      [LanguageCode.zh_CN]: '用户名',
      [LanguageCode.en_US]: 'User Name'
    })"
    prop="userName"
  />
</template>
```

### 4. 混合用法

结合 field、comment 和语言映射：

```vue
<template>
  <el-table-column
    :label="t('', {
      field: 'UserName',
      comment: '用户名(默认)',
      [LanguageCode.zh_CN]: '用户名(中文)',
      [LanguageCode.en_US]: 'User Name (English)'
    })"
    prop="userName"
  />
</template>
```

**优先级：**
1. 当前语言的映射 (如 `zh_CN`)
2. `comment`（中文环境）或 `field`（英文环境）
3. `field`（中文环境降级）或 `comment`（英文环境降级）
4. 任何可用的翻译

### 5. 快捷用法

传入两个字符串参数：

```vue
<template>
  <!-- t(key, cnValue) -->
  <span>{{ t('userId', '用户ID') }}</span>
  <!-- 中文环境: "用户ID", 英文环境: "userId" -->
</template>
```

## 语言管理

### 获取当前语言

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { currentLanguage, currentLanguageName, isChinese, isEnglish } = useI18n()
</script>

<template>
  <div>
    <!-- 当前语言代码 -->
    <p>Language Code: {{ currentLanguage }}</p>

    <!-- 当前语言名称 -->
    <p>Language Name: {{ currentLanguageName }}</p>

    <!-- 条件渲染 -->
    <p v-if="isChinese">这是中文环境</p>
    <p v-if="isEnglish">This is English environment</p>
  </div>
</template>
```

### 切换语言

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { setLanguage, currentLanguage } = useI18n()

const handleLanguageChange = () => {
  const newLang = currentLanguage.value === LanguageCode.zh_CN
    ? LanguageCode.en_US
    : LanguageCode.zh_CN

  setLanguage(newLang)
}
</script>

<template>
  <el-button @click="handleLanguageChange">
    {{ t('navbar.language') }}
  </el-button>
</template>
```

### 获取可用语言列表

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { languages, setLanguage } = useI18n()
</script>

<template>
  <el-select @change="setLanguage">
    <el-option
      v-for="lang in languages"
      :key="lang"
      :label="lang"
      :value="lang"
    />
  </el-select>
</template>
```

## 格式化方法

### 日期格式化

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { d } = useI18n()
const date = new Date()
</script>

<template>
  <p>{{ d(date, 'long') }}</p>
</template>
```

### 数字格式化

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { n } = useI18n()
const price = 1234.56
</script>

<template>
  <p>{{ n(price, 'currency') }}</p>
</template>
```

## 动态参数

在翻译文本中使用占位符：

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const userName = 'admin'
</script>

<template>
  <!-- 语言包中定义: registerSuccess: '恭喜你，您的账号 {userName} 注册成功！' -->
  <p>{{ t('register.registerSuccess', { userName }) }}</p>
</template>
```

## 检查翻译键是否存在

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t, te } = useI18n()

// 检查键是否存在
if (te('button.customKey')) {
  console.log(t('button.customKey'))
} else {
  console.log('Translation key not found')
}
</script>
```

## 在 JS/TS 中使用

### 使用全局实例

```typescript
import i18n from '@/locales/i18n'

// 直接使用全局实例
const message = i18n.global.t('message.success')
console.log(message)
```

### 在路由中使用

```typescript
import { translateRouteTitle } from '@/composables/useI18n'

const title = translateRouteTitle('dashboard')
```

## 实战示例

### 表格列标题

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <el-table :data="tableData">
    <!-- 使用 field + comment -->
    <el-table-column
      :label="t('', { field: 'UserName', comment: '用户名' })"
      prop="userName"
    />

    <!-- 使用语言包键名 -->
    <el-table-column
      :label="t('操作')"
      prop="actions"
    />
  </el-table>
</template>
```

### 按钮文本

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <el-button>{{ t('button.add') }}</el-button>
  <el-button>{{ t('button.update') }}</el-button>
  <el-button>{{ t('button.delete') }}</el-button>
  <el-button>{{ t('button.export') }}</el-button>
</template>
```

### 表单验证消息

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const rules = {
  userName: [
    {
      required: true,
      message: t('login.rule.userName.required'),
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: t('login.rule.password.required'),
      trigger: 'blur'
    }
  ]
}
</script>

<template>
  <el-form :rules="rules">
    <el-form-item :label="t('login.userName')" prop="userName">
      <el-input v-model="form.userName" />
    </el-form-item>
  </el-form>
</template>
```

### 确认对话框

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { ElMessageBox } from 'element-plus'

const { t } = useI18n()

const handleDelete = () => {
  ElMessageBox.confirm(
    t('message.confirmDelete'),
    t('message.operation'),
    {
      confirmButtonText: t('确定'),
      cancelButtonText: t('取消'),
      type: 'warning'
    }
  ).then(() => {
    // 删除操作
  })
}
</script>
```

## 类型支持

框架提供完整的类型支持，编辑器会自动提示可用的翻译键：

```typescript
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

// 类型安全的翻译键
t('button.add')        // ✅ 正确
t('button.query')      // ✅ 正确
t('button.notExist')   // ⚠️ 编辑器警告（如果键不存在）
```
