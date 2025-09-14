# useI18n

增强的国际化钩子，扩展了 Vue I18n 的原生功能，提供更多实用功能，并与应用状态管理集成。

## 📋 功能特性

- **增强翻译**: 支持多语言字段国际化，智能语言映射
- **语言管理**: 动态设置应用语言，自动同步到全局状态
- **语言状态**: 检查当前语言环境，提供便捷的语言判断
- **Vue I18n 兼容**: 完全兼容 Vue I18n 原生 API
- **类型安全**: 完整的 TypeScript 支持

## 🎯 基础用法

### 基本翻译

```vue
<template>
  <div>
    <!-- 传统 i18n 键翻译 -->
    <h1>{{ t('user.title') }}</h1>
    
    <!-- 简单用法：中英文切换 -->
    <p>{{ t('username', '用户名') }}</p>
    
    <!-- 字段信息翻译 -->
    <el-table-column :label="t('', { field: 'UserName', comment: '用户名' })" />
  </div>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
```

### 语言管理

```vue
<template>
  <div>
    <p>当前语言: {{ currentLanguageName }}</p>
    <p>是否中文: {{ isChinese }}</p>
    
    <el-select v-model="selectedLang" @change="switchLanguage">
      <el-option label="简体中文" value="zh-CN" />
      <el-option label="English" value="en-US" />
    </el-select>
  </div>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { 
  currentLanguage, 
  currentLanguageName, 
  isChinese, 
  setLanguage 
} = useI18n()

const selectedLang = ref(currentLanguage.value)

const switchLanguage = (lang) => {
  setLanguage(lang)
}
</script>
```

## 🔧 API 参考

### 状态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `currentLanguage` | `ComputedRef<LanguageCode>` | 当前语言代码 |
| `currentLanguageName` | `ComputedRef<string>` | 当前语言显示名称 |
| `languages` | `ComputedRef<string[]>` | 可用语言列表 |
| `isChinese` | `ComputedRef<boolean>` | 是否为中文环境 |
| `isEnglish` | `ComputedRef<boolean>` | 是否为英文环境 |

### 翻译方法

#### `t(key, fieldInfoOrValue?)`

增强的翻译函数，支持多种翻译方式。

**参数:**
- `key` - 翻译键名或英文内容
- `fieldInfoOrValue` - 字段信息对象或中文翻译值

**返回:** `string` - 翻译后的文本

**示例:**

```javascript
// 1. 只使用字段名
t('', { field: 'UserName' })
// 英文环境: "UserName", 中文环境: "UserName"

// 2. 只使用备注
t('', { comment: '用户名' })
// 英文环境: "用户名", 中文环境: "用户名"

// 3. 字段名和备注组合
t('', { field: 'UserName', comment: '用户名' })
// 英文环境: "UserName", 中文环境: "用户名"

// 4. 语言特定翻译
t('', { 
  [LanguageCode.zh_CN]: '用户名', 
  [LanguageCode.en_US]: 'UserName' 
})
// 英文环境: "UserName", 中文环境: "用户名"

// 5. 简单用法
t('username', '用户名')
// 英文环境: "username", 中文环境: "用户名"

// 6. 传统 i18n 键
t('user.name')
// 根据 i18n 配置翻译
```

### 语言管理方法

#### `setLanguage(lang)`

设置应用语言。

**参数:**
- `lang: LanguageCode` - 语言代码

**返回:** `boolean` - 是否设置成功

#### `initLanguage()`

初始化语言设置，确保 Vue I18n 的 locale 与应用状态同步。

## 🎨 高级用法

### 表格列标题国际化

```vue
<template>
  <el-table :data="tableData">
    <el-table-column 
      v-for="column in columns" 
      :key="column.prop"
      :prop="column.prop"
      :label="t('', column.label)"
    />
  </el-table>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()

const columns = [
  {
    prop: 'userName',
    label: {
      field: 'UserName',
      comment: '用户名',
      [LanguageCode.zh_CN]: '用户名称',
      [LanguageCode.en_US]: 'User Name'
    }
  },
  {
    prop: 'email',
    label: {
      field: 'Email',
      comment: '邮箱地址'
    }
  }
]
</script>
```

### 表单标签国际化

```vue
<template>
  <el-form>
    <el-form-item :label="t('userName', '用户名')">
      <el-input v-model="form.userName" />
    </el-form-item>
    
    <el-form-item :label="t('', { field: 'Password', comment: '密码' })">
      <el-input type="password" v-model="form.password" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const form = reactive({
  userName: '',
  password: ''
})
</script>
```

### 动态语言切换

```vue
<template>
  <div class="language-switcher">
    <el-dropdown @command="handleLanguageChange">
      <span class="el-dropdown-link">
        {{ currentLanguageName }}
        <el-icon><arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
          <el-dropdown-item command="en-US">English</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { currentLanguageName, setLanguage } = useI18n()

const handleLanguageChange = (lang) => {
  const success = setLanguage(lang)
  if (success) {
    ElMessage.success('语言切换成功')
  } else {
    ElMessage.error('语言切换失败')
  }
}
</script>
```

## 💡 最佳实践

### 翻译键命名规范

```javascript
// 推荐：使用命名空间
t('user.name')        // 用户名
t('button.save')      // 保存按钮
t('message.success')  // 成功消息

// 推荐：字段信息对象
t('', {
  field: 'UserName',
  comment: '用户名',
  [LanguageCode.zh_CN]: '用户名称'
})
```

### 组件内使用模式

```vue
<script setup>
import { useI18n } from '@/composables/useI18n'

// 解构需要的方法和状态
const { t, currentLanguage, isChinese, setLanguage } = useI18n()

// 响应式计算
const welcomeMessage = computed(() => {
  return isChinese.value ? '欢迎使用' : 'Welcome'
})

// 监听语言变化
watch(currentLanguage, (newLang) => {
  console.log('语言已切换为:', newLang)
})
</script>
```

### 错误处理

```javascript
const { setLanguage } = useI18n()

// 安全的语言设置
const changeLanguage = (lang) => {
  try {
    const success = setLanguage(lang)
    if (!success) {
      console.warn(`不支持的语言: ${lang}`)
      // fallback 逻辑
    }
  } catch (error) {
    console.error('语言切换失败:', error)
  }
}
```
