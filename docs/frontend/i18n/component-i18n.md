# 组件国际化

## 介绍

组件国际化是前端应用实现多语言支持的核心功能,框架基于 Vue I18n 提供了增强的 `useI18n()` composable,支持在组件中灵活使用国际化功能。除了标准的 Vue I18n 功能外,还针对业务场景提供了多种增强特性,包括字段智能翻译、语言状态检测、路由标题翻译等。

**核心特性:**

- **增强翻译函数** - 扩展原生 `t()` 函数,支持 field/comment 字段智能翻译、语言映射、快捷用法等多种模式
- **语言状态管理** - 提供 `currentLanguage`、`isChinese`、`isEnglish` 等响应式状态,便于条件渲染
- **语言切换** - 内置 `setLanguage()` 方法,自动同步 Vue I18n、布局状态和 HTML lang 属性
- **路由标题翻译** - 提供 `translateRouteTitle()` 专用函数,支持导航菜单和面包屑国际化
- **格式化方法** - 集成日期格式化 `d()` 和数字格式化 `n()` 方法
- **类型安全** - 使用 `ObjKeysToUnion` 类型工具,提供完整的翻译键自动补全和类型检查
- **Element Plus 集成** - 自动整合 Element Plus 组件库的语言包,实现统一的语言切换体验

## 基础用法

### 在组件中使用

在 Vue 组件中使用国际化功能,首先需要从 `@/composables/useI18n` 导入 `useI18n` composable:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

// 解构获取翻译函数和其他工具
const { t } = useI18n()
</script>

<template>
  <div>
    <!-- 使用语言包键名翻译 -->
    <el-button type="primary">{{ t('button.add') }}</el-button>
    <el-button type="danger">{{ t('button.delete') }}</el-button>

    <!-- 消息提示 -->
    <p>{{ t('message.success') }}</p>
  </div>
</template>
```

**使用说明:**

- `useI18n()` 是对 Vue I18n 原生 `useI18n()` 的增强封装
- 返回的 `t()` 函数支持多种翻译模式,不仅限于键值对翻译
- 组件会自动响应语言切换,无需手动处理刷新

### 完整 API 概览

`useI18n()` composable 返回丰富的属性和方法:

```typescript
const {
  // ===== 翻译函数 =====
  t,                      // 增强的翻译函数,支持多种翻译模式

  // ===== 语言管理 =====
  locale,                 // 当前语言（响应式 Ref）
  currentLanguage,        // 当前语言（别名,等同于 locale）
  currentLanguageName,    // 当前语言显示名称（如"简体中文"、"English"）
  languages,              // 可用语言列表（计算属性）
  availableLocales,       // 可用语言列表（Vue I18n 原生）
  setLanguage,            // 设置语言方法
  initLanguage,           // 初始化语言方法

  // ===== 语言状态 =====
  isChinese,              // 是否为中文环境（computed boolean）
  isEnglish,              // 是否为英文环境（computed boolean）

  // ===== 格式化方法 =====
  d,                      // 日期格式化
  n,                      // 数字格式化

  // ===== 其他方法 =====
  te,                     // 检查翻译键是否存在
  tm,                     // 翻译消息函数（返回原始消息对象）
  rt,                     // 运行时翻译
  translateRouteTitle,    // 翻译路由标题

  // ===== Vue I18n 原生 =====
  fallbackLocale,         // 备用语言
  messages                // 所有语言消息对象
} = useI18n()
```

## 翻译函数详解

### t() 函数签名

增强的 `t()` 函数支持多种调用方式:

```typescript
// 函数签名
const t = (
  key: ObjKeysToUnion<LanguageType> | string,
  fieldInfoOrValue?:
    | ({
        field?: string
        comment?: string
      } & Partial<Record<LanguageCode, string>> &
        Record<string, any>)
    | string
): string
```

**参数说明:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | `string` | 翻译键名或英文文本 |
| `fieldInfoOrValue` | `object \| string` | 字段信息对象、语言映射对象或中文翻译值 |

### 用法1: 标准键值翻译

使用语言包中定义的键名进行翻译,这是最常见的用法:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="button-group">
    <!-- 按钮翻译 -->
    <el-button type="primary">{{ t('button.add') }}</el-button>
    <el-button type="success">{{ t('button.update') }}</el-button>
    <el-button type="danger">{{ t('button.delete') }}</el-button>
    <el-button type="info">{{ t('button.query') }}</el-button>

    <!-- 消息翻译 -->
    <el-alert :title="t('message.success')" type="success" />

    <!-- 表单标签翻译 -->
    <el-form-item :label="t('login.userName')">
      <el-input />
    </el-form-item>
  </div>
</template>
```

**技术实现:**

- 内部调用 `vueI18n.te(key)` 检查键是否存在
- 存在则调用 `vueI18n.t(key)` 返回翻译结果
- 不存在则返回键名本身作为降级显示

### 用法2: Field/Comment 智能翻译

适用于表格列标题等场景,根据当前语言自动选择 `field`（字段名）或 `comment`（字段备注）:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const tableData = ref([
  { userName: 'admin', email: 'admin@example.com', status: 1 }
])
</script>

<template>
  <el-table :data="tableData">
    <!-- 只使用 field（字段名） -->
    <el-table-column
      :label="t('', { field: 'UserName' })"
      prop="userName"
    />
    <!-- 中文环境: "UserName", 英文环境: "UserName" -->

    <!-- 只使用 comment（字段备注） -->
    <el-table-column
      :label="t('', { comment: '用户名' })"
      prop="userName"
    />
    <!-- 中文环境: "用户名", 英文环境: "用户名" -->

    <!-- 同时使用 field 和 comment -->
    <el-table-column
      :label="t('', { field: 'UserName', comment: '用户名' })"
      prop="userName"
    />
    <!-- 中文环境: "用户名", 英文环境: "UserName" -->

    <!-- 邮箱列 -->
    <el-table-column
      :label="t('', { field: 'Email', comment: '邮箱' })"
      prop="email"
    />

    <!-- 状态列 -->
    <el-table-column
      :label="t('', { field: 'Status', comment: '状态' })"
      prop="status"
    />
  </el-table>
</template>
```

**优先级规则:**

| 当前语言 | 优先级1 | 优先级2 | 优先级3 |
|---------|--------|--------|--------|
| 中文 (`zh_CN`) | `comment` | `field` | 任意可用值 |
| 英文 (`en_US`) | `field` | `comment` | 任意可用值 |

**使用场景:**

- 代码生成器生成的表格列标题
- 动态表单字段标签
- API 返回的字段国际化

### 用法3: 语言映射翻译

使用语言代码明确指定每种语言的翻译:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()
</script>

<template>
  <el-table :data="tableData">
    <!-- 使用语言特定的翻译 -->
    <el-table-column
      :label="t('', {
        [LanguageCode.zh_CN]: '用户名',
        [LanguageCode.en_US]: 'User Name'
      })"
      prop="userName"
    />
    <!-- 中文环境: "用户名", 英文环境: "User Name" -->

    <el-table-column
      :label="t('', {
        [LanguageCode.zh_CN]: '创建时间',
        [LanguageCode.en_US]: 'Created At'
      })"
      prop="createTime"
    />

    <el-table-column
      :label="t('', {
        [LanguageCode.zh_CN]: '操作',
        [LanguageCode.en_US]: 'Actions'
      })"
    >
      <template #default>
        <el-button size="small">{{ t('button.edit') }}</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
```

**使用说明:**

- `LanguageCode` 枚举定义在 `@/systemConfig` 中
- 支持 `zh_CN`（简体中文）和 `en_US`（英语）
- 优先级最高,会覆盖 field/comment 设置

### 用法4: 混合翻译模式

结合 field、comment 和语言映射,实现灵活的降级策略:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()
</script>

<template>
  <el-table :data="tableData">
    <el-table-column
      :label="t('', {
        field: 'UserName',
        comment: '用户名(默认)',
        [LanguageCode.zh_CN]: '用户名(中文)',
        [LanguageCode.en_US]: 'User Name (English)'
      })"
      prop="userName"
    />
    <!--
      优先级:
      1. 中文环境 → zh_CN 映射 → "用户名(中文)"
      2. 英文环境 → en_US 映射 → "User Name (English)"
      3. 其他语言 → 根据语言选择 field 或 comment
    -->
  </el-table>
</template>
```

**完整优先级规则:**

1. 当前语言的映射值（如 `zh_CN` 或 `en_US`）
2. `comment`（中文环境）或 `field`（英文环境）
3. `field`（中文环境降级）或 `comment`（英文环境降级）
4. 其他语言的映射值
5. 任何可用的翻译值

### 用法5: 快捷双参数翻译

传入两个字符串参数,第一个为英文,第二个为中文:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <!-- t(englishText, chineseText) -->
    <span>{{ t('User ID', '用户ID') }}</span>
    <!-- 中文环境: "用户ID", 英文环境: "User ID" -->

    <span>{{ t('Create Time', '创建时间') }}</span>
    <!-- 中文环境: "创建时间", 英文环境: "Create Time" -->

    <el-button>{{ t('Submit', '提交') }}</el-button>
    <!-- 中文环境: "提交", 英文环境: "Submit" -->
  </div>
</template>
```

**实现原理:**

```typescript
// 源码实现
if (typeof fieldInfoOrValue === 'string') {
  const currentLang = currentLanguage.value

  // 中文环境返回第二个参数（中文）
  if (currentLang === LanguageCode.zh_CN) {
    return fieldInfoOrValue
  }
  // 英文或其他环境返回第一个参数（英文）
  else {
    return key
  }
}
```

**使用场景:**

- 临时文本国际化
- 无需定义语言包的简单场景
- 快速原型开发

### 用法6: 按钮键降级处理

当使用模块化按钮键名时,自动降级到通用按钮键:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <!-- 模块化按钮键 -->
    <el-button>{{ t('button.user.add') }}</el-button>
    <!--
      查找顺序:
      1. 'button.user.add' - 如果存在则使用
      2. 'button.add' - 降级到通用按钮键
      3. 'button.user.add' - 返回原键名
    -->

    <el-button>{{ t('button.role.delete') }}</el-button>
    <!-- 降级到 button.delete -->
  </div>
</template>
```

**实现原理:**

```typescript
// 按钮键降级处理
if (typeof key === 'string' && key.startsWith('button.') && key.split('.').length > 2) {
  const parts = key.split('.')
  const action = parts[parts.length - 1]
  const genericButtonKey = `button.${action}`

  if (vueI18n.te(genericButtonKey)) {
    return vueI18n.t(genericButtonKey)
  }
}
```

## 语言管理

### 获取当前语言

`useI18n()` 提供多个响应式属性来获取当前语言状态:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const {
  currentLanguage,      // 当前语言代码
  currentLanguageName,  // 当前语言名称
  locale,              // 等同于 currentLanguage
  isChinese,           // 是否为中文
  isEnglish            // 是否为英文
} = useI18n()
</script>

<template>
  <div class="language-info">
    <!-- 显示当前语言代码 -->
    <p>Language Code: {{ currentLanguage }}</p>
    <!-- 输出: "zh_CN" 或 "en_US" -->

    <!-- 显示当前语言名称 -->
    <p>Language Name: {{ currentLanguageName }}</p>
    <!-- 输出: "简体中文" 或 "English" -->

    <!-- 条件渲染 -->
    <div v-if="isChinese" class="chinese-content">
      <p>这是中文环境下的专属内容</p>
      <p>可以显示特定于中文用户的信息</p>
    </div>

    <div v-if="isEnglish" class="english-content">
      <p>This is English-specific content</p>
      <p>Can show information specific to English users</p>
    </div>

    <!-- 使用 v-show 保持 DOM 结构 -->
    <p v-show="isChinese">中文提示信息</p>
    <p v-show="isEnglish">English tips</p>
  </div>
</template>
```

**currentLanguageName 实现:**

```typescript
const currentLanguageName = computed(() => {
  switch (currentLanguage.value) {
    case LanguageCode.zh_CN:
      return '简体中文'
    case LanguageCode.en_US:
      return 'English'
    default:
      return currentLanguage.value
  }
})
```

### 切换语言

使用 `setLanguage()` 方法切换应用语言:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'
import { showMsgSuccess } from '@/utils/modal'

const { t, setLanguage, currentLanguage, isChinese } = useI18n()

/**
 * 切换到指定语言
 */
const switchLanguage = (lang: LanguageCode) => {
  const success = setLanguage(lang)
  if (success) {
    const message = lang === LanguageCode.zh_CN
      ? '切换语言成功！'
      : 'Switch Language Successful!'
    showMsgSuccess(message)
  }
}

/**
 * 切换中英文
 */
const toggleLanguage = () => {
  const newLang = isChinese.value
    ? LanguageCode.en_US
    : LanguageCode.zh_CN
  switchLanguage(newLang)
}
</script>

<template>
  <div class="language-switcher">
    <!-- 直接切换到指定语言 -->
    <el-button @click="switchLanguage(LanguageCode.zh_CN)">
      中文
    </el-button>
    <el-button @click="switchLanguage(LanguageCode.en_US)">
      English
    </el-button>

    <!-- 切换按钮 -->
    <el-button @click="toggleLanguage">
      {{ isChinese ? 'Switch to English' : '切换到中文' }}
    </el-button>

    <!-- 当前语言显示 -->
    <span class="current-lang">{{ currentLanguage }}</span>
  </div>
</template>
```

**setLanguage() 实现细节:**

```typescript
const setLanguage = (lang: LanguageCode): boolean => {
  // 检查语言是否可用
  if (vueI18n.availableLocales.includes(lang)) {
    // 1. 设置 Vue I18n 的 locale
    vueI18n.locale.value = lang

    // 2. 同步到布局状态管理（持久化）
    layout.changeLanguage(lang)

    // 3. 更新 HTML 的 lang 属性
    document.querySelector('html')?.setAttribute('lang', lang)

    return true
  }
  console.warn(`Language ${lang} is not available`)
  return false
}
```

### 获取可用语言列表

通过 `languages` 或 `availableLocales` 获取所有可用语言:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { languages, setLanguage, currentLanguage } = useI18n()

// 语言显示名称映射
const languageNames: Record<string, string> = {
  [LanguageCode.zh_CN]: '简体中文',
  [LanguageCode.en_US]: 'English'
}
</script>

<template>
  <!-- 下拉选择器 -->
  <el-select
    :model-value="currentLanguage"
    @change="setLanguage"
    placeholder="Select Language"
  >
    <el-option
      v-for="lang in languages"
      :key="lang"
      :label="languageNames[lang] || lang"
      :value="lang"
    />
  </el-select>

  <!-- 按钮组 -->
  <el-button-group>
    <el-button
      v-for="lang in languages"
      :key="lang"
      :type="currentLanguage === lang ? 'primary' : 'default'"
      @click="setLanguage(lang)"
    >
      {{ languageNames[lang] || lang }}
    </el-button>
  </el-button-group>
</template>
```

### 初始化语言

在应用启动时使用 `initLanguage()` 确保语言设置同步:

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import i18n from '@/locales/i18n'

const app = createApp(App)

// 注册 i18n
app.use(i18n)

// 在 App.vue 中初始化
// App.vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { initLanguage } = useI18n()

// 应用挂载时初始化语言
onMounted(() => {
  initLanguage()
})
</script>
```

**initLanguage() 实现:**

```typescript
const initLanguage = () => {
  // 使用布局状态管理中保存的语言
  vueI18n.locale.value = layout.language.value

  // 更新 HTML lang 属性
  document.querySelector('html')?.setAttribute('lang', layout.language.value)
}
```

## 格式化方法

### 日期格式化

使用 `d()` 方法格式化日期:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { d } = useI18n()

const now = new Date()
const birthday = new Date('1990-05-15')
</script>

<template>
  <div class="date-examples">
    <!-- 短格式 -->
    <p>Short: {{ d(now, 'short') }}</p>
    <!-- 中文: "2024/12/25", 英文: "12/25/2024" -->

    <!-- 长格式 -->
    <p>Long: {{ d(now, 'long') }}</p>
    <!-- 中文: "2024年12月25日", 英文: "December 25, 2024" -->

    <!-- 完整格式 -->
    <p>Full: {{ d(birthday, 'full') }}</p>

    <!-- 自定义格式 -->
    <p>Custom: {{ d(now, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }) }}</p>
  </div>
</template>
```

**日期格式化配置:**

需要在 i18n 配置中定义日期格式:

```typescript
// locales/i18n.ts
const i18n = createI18n({
  // ... 其他配置
  datetimeFormats: {
    zh_CN: {
      short: { year: 'numeric', month: 'numeric', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
    },
    en_US: {
      short: { year: 'numeric', month: 'numeric', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
    }
  }
})
```

### 数字格式化

使用 `n()` 方法格式化数字:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { n } = useI18n()

const price = 1234567.89
const percentage = 0.8567
const count = 1000000
</script>

<template>
  <div class="number-examples">
    <!-- 货币格式 -->
    <p>Currency: {{ n(price, 'currency') }}</p>
    <!-- 中文: "¥1,234,567.89", 英文: "$1,234,567.89" -->

    <!-- 百分比格式 -->
    <p>Percent: {{ n(percentage, 'percent') }}</p>
    <!-- 输出: "85.67%" -->

    <!-- 小数格式 -->
    <p>Decimal: {{ n(price, 'decimal') }}</p>
    <!-- 输出: "1,234,567.89" -->

    <!-- 自定义格式 -->
    <p>Custom: {{ n(count, {
      notation: 'compact',
      compactDisplay: 'short'
    }) }}</p>
    <!-- 输出: "1M" 或 "100万" -->
  </div>
</template>
```

**数字格式化配置:**

```typescript
// locales/i18n.ts
const i18n = createI18n({
  // ... 其他配置
  numberFormats: {
    zh_CN: {
      currency: { style: 'currency', currency: 'CNY' },
      decimal: { style: 'decimal', minimumFractionDigits: 2 },
      percent: { style: 'percent', minimumFractionDigits: 2 }
    },
    en_US: {
      currency: { style: 'currency', currency: 'USD' },
      decimal: { style: 'decimal', minimumFractionDigits: 2 },
      percent: { style: 'percent', minimumFractionDigits: 2 }
    }
  }
})
```

## 路由标题翻译

### translateRouteTitle 函数

专门用于翻译路由标题的便捷函数:

```typescript
import { translateRouteTitle } from '@/composables/useI18n'

// 翻译路由标题
const title = translateRouteTitle('dashboard')
// 中文: "仪表盘", 英文: "Dashboard"

const menuTitle = translateRouteTitle('system')
// 中文: "系统管理", 英文: "System"
```

**函数实现:**

```typescript
export const translateRouteTitle = (title: string): string => {
  if (!title) return ''

  // 构建路由翻译键
  const routeKey = `route.${title}` as ObjKeysToUnion<LanguageType>

  // 检查键是否存在
  const hasKey = i18n.global.te(routeKey)
  if (hasKey) {
    return i18n.global.t(routeKey)
  }

  // 不存在则返回原标题
  return title
}
```

### 在导航中使用

```vue
<script setup lang="ts">
import { translateRouteTitle } from '@/composables/useI18n'

// 路由元信息
const route = useRoute()

// 翻译当前路由标题
const pageTitle = computed(() => {
  return translateRouteTitle(route.meta?.title as string)
})
</script>

<template>
  <div class="page-header">
    <h1>{{ pageTitle }}</h1>
  </div>
</template>
```

### 面包屑导航

```vue
<script setup lang="ts">
import { translateRouteTitle } from '@/composables/useI18n'

const route = useRoute()

// 生成面包屑数据
const breadcrumbs = computed(() => {
  return route.matched
    .filter(item => item.meta?.title)
    .map(item => ({
      path: item.path,
      title: translateRouteTitle(item.meta.title as string)
    }))
})
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="crumb in breadcrumbs"
      :key="crumb.path"
      :to="crumb.path"
    >
      {{ crumb.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
```

## 动态参数

### 基本用法

在翻译文本中使用占位符传递动态值:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const userName = ref('admin')
const count = ref(5)
</script>

<template>
  <div>
    <!-- 语言包定义: registerSuccess: '恭喜你，您的账号 {userName} 注册成功！' -->
    <p>{{ t('register.registerSuccess', { userName: userName }) }}</p>
    <!-- 输出: "恭喜你，您的账号 admin 注册成功！" -->

    <!-- 多个参数 -->
    <p>{{ t('message.selected', { count: count }) }}</p>
    <!-- 语言包: selected: '已选择 {count} 项' -->
  </div>
</template>
```

### 语言包定义

```typescript
// locales/zh_CN.ts
export default {
  register: {
    registerSuccess: '恭喜你，您的账号 {userName} 注册成功！'
  },
  message: {
    selected: '已选择 {count} 项',
    deleteConfirm: '确定删除 {name} 吗？',
    rangeError: '请输入 {min} 到 {max} 之间的数值'
  },
  login: {
    rule: {
      userName: {
        range: '用户名长度应在 {min} 到 {max} 个字符之间'
      }
    }
  }
}

// locales/en_US.ts
export default {
  register: {
    registerSuccess: 'Congratulations, your account {userName} has been registered successfully!'
  },
  message: {
    selected: '{count} items selected',
    deleteConfirm: 'Are you sure to delete {name}?',
    rangeError: 'Please enter a value between {min} and {max}'
  },
  login: {
    rule: {
      userName: {
        range: 'Username length should be between {min} and {max} characters'
      }
    }
  }
}
```

### 复杂参数示例

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const formRules = computed(() => ({
  userName: [
    {
      required: true,
      message: t('login.rule.userName.required'),
      trigger: 'blur'
    },
    {
      min: 3,
      max: 20,
      message: t('login.rule.userName.range', { min: 3, max: 20 }),
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
}))

// 删除确认
const handleDelete = (item: { name: string }) => {
  ElMessageBox.confirm(
    t('message.deleteConfirm', { name: item.name }),
    t('message.warning'),
    { type: 'warning' }
  ).then(() => {
    // 执行删除
  })
}
</script>
```

## 检查翻译键

### te() 方法

使用 `te()` 检查翻译键是否存在:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t, te } = useI18n()

// 安全获取翻译
const safeTranslate = (key: string, fallback: string = '') => {
  return te(key) ? t(key) : fallback
}

// 动态键名场景
const getStatusText = (status: string) => {
  const key = `status.${status}`
  if (te(key)) {
    return t(key)
  }
  return status // 返回原值作为降级
}
</script>

<template>
  <div>
    <!-- 条件渲染 -->
    <span v-if="te('custom.feature')">
      {{ t('custom.feature') }}
    </span>
    <span v-else>
      Feature not available
    </span>

    <!-- 使用安全翻译 -->
    <p>{{ safeTranslate('experimental.feature', '实验性功能') }}</p>
  </div>
</template>
```

### tm() 方法

获取原始消息对象,用于处理复杂结构:

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { tm } = useI18n()

// 获取整个消息模块
const buttonMessages = computed(() => tm('button'))
// 返回: { add: '新增', delete: '删除', ... }

// 获取嵌套结构
const loginRules = computed(() => tm('login.rule'))
// 返回: { userName: { required: '...', range: '...' }, ... }
</script>

<template>
  <div>
    <!-- 遍历消息对象 -->
    <el-button
      v-for="(label, key) in buttonMessages"
      :key="key"
    >
      {{ label }}
    </el-button>
  </div>
</template>
```

## 类型安全

### ObjKeysToUnion 类型工具

框架提供 `ObjKeysToUnion` 类型工具,将嵌套对象键转换为联合类型:

```typescript
/**
 * 对象键名转联合类型
 * { a: 1, b: { ba: 1, bb: 2 } } → 'a' | 'b.ba' | 'b.bb'
 */
export type ObjKeysToUnion<T, Depth extends number[] = [0, 1, 2, 3]> =
  Depth['length'] extends 4
    ? never
    : T extends object
      ? {
          [K in keyof T]: `${K & string}${T[K] extends object
            ? `.${ObjKeysToUnion<T[K], [...Depth, 0]>}`
            : ''
          }`
        }[keyof T]
      : never
```

**使用效果:**

```typescript
// 假设语言包结构
const zh_CN = {
  button: {
    add: '新增',
    delete: '删除'
  },
  message: {
    success: '操作成功'
  }
}

// 生成的类型
type TranslationKeys = ObjKeysToUnion<typeof zh_CN>
// 'button.add' | 'button.delete' | 'message.success'

// 在 t() 函数中使用
const { t } = useI18n()

t('button.add')      // ✅ 类型正确
t('button.query')    // ⚠️ 如果不存在会有类型警告
t('invalid.key')     // ⚠️ 类型警告
```

### 类型提示效果

编辑器会自动提示所有可用的翻译键:

```typescript
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

// 输入 t('button. 时会提示:
// - button.add
// - button.delete
// - button.update
// - button.query
// - button.export
// - button.import
// ...

// 输入 t('message. 时会提示:
// - message.success
// - message.error
// - message.warning
// - message.confirmDelete
// ...
```

## 在 JS/TS 中使用

### 使用全局 i18n 实例

在非组件文件中使用翻译功能:

```typescript
// utils/validation.ts
import i18n from '@/locales/i18n'

/**
 * 获取验证错误消息
 */
export const getValidationMessage = (rule: string) => {
  const key = `validation.${rule}`
  if (i18n.global.te(key)) {
    return i18n.global.t(key)
  }
  return rule
}

// 使用
const message = getValidationMessage('required')
```

### 在路由守卫中使用

```typescript
// router/permission.ts
import i18n from '@/locales/i18n'
import { translateRouteTitle } from '@/composables/useI18n'

router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    const title = translateRouteTitle(to.meta.title as string)
    document.title = `${title} - ${i18n.global.t('app.name')}`
  }
  next()
})
```

### 在 Pinia Store 中使用

```typescript
// stores/notification.ts
import { defineStore } from 'pinia'
import i18n from '@/locales/i18n'

export const useNotificationStore = defineStore('notification', () => {
  const showSuccessMessage = (action: string) => {
    const actionText = i18n.global.t(`button.${action}`)
    const message = i18n.global.t('message.operationSuccess', { action: actionText })

    ElMessage.success(message)
  }

  return { showSuccessMessage }
})
```

### 在 API 请求拦截器中使用

```typescript
// utils/request.ts
import i18n from '@/locales/i18n'

// 响应拦截器
service.interceptors.response.use(
  (response) => response,
  (error) => {
    // 根据状态码显示对应消息
    const status = error.response?.status
    const messageKey = `http.error.${status}`

    const message = i18n.global.te(messageKey)
      ? i18n.global.t(messageKey)
      : i18n.global.t('http.error.default')

    ElMessage.error(message)
    return Promise.reject(error)
  }
)
```

## 实战示例

### 语言选择器组件

完整的语言选择器组件实现:

```vue
<template>
  <el-tooltip
    :content="showTooltip ? t('navbar.language') : ''"
    :disabled="!showTooltip"
    effect="dark"
    placement="bottom"
    :offset="6"
  >
    <div :class="containerClass">
      <el-dropdown trigger="hover" @command="handleLanguageChange">
        <div :class="triggerClass">
          <Icon code="globe" :size="iconSize" :animate="iconAnimate" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              :disabled="isChinese"
              command="zh_CN"
            >
              中文
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="isEnglish"
              command="en_US"
            >
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts" name="LangSelect">
import { LanguageCode } from '@/systemConfig'
import { showMsgSuccess } from '@/utils/modal'

const { t, setLanguage, isChinese, isEnglish } = useI18n()

interface LangSelectProps {
  showTooltip?: boolean
  showAnimate?: boolean
  showBackground?: boolean
}

const props = withDefaults(defineProps<LangSelectProps>(), {
  showTooltip: true,
  showAnimate: true,
  showBackground: true
})

// 计算样式类
const containerClass = computed(() => {
  return props.showBackground ? 'flex-center h-full px-1' : ''
})

const triggerClass = computed(() => {
  return props.showBackground
    ? 'navbar-tool-item flex-center w-9 h-9 rounded-2 cursor-pointer'
    : 'simple-trigger'
})

// 语言切换成功消息
const messages = {
  [LanguageCode.zh_CN]: '切换语言成功！',
  [LanguageCode.en_US]: 'Switch Language Successful!'
}

/**
 * 处理语言切换
 */
const handleLanguageChange = (lang: LanguageCode) => {
  setLanguage(lang)
  showMsgSuccess(messages[lang] || '切换语言成功！')
}
</script>

<style lang="scss" scoped>
.simple-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--el-text-color-regular);

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
```

### 国际化表格

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t, isChinese } = useI18n()

const tableData = ref([
  { id: 1, userName: 'admin', status: 1, createTime: '2024-01-01' },
  { id: 2, userName: 'user', status: 0, createTime: '2024-01-02' }
])

// 状态映射
const statusMap = computed(() => ({
  1: t('status.enabled', '启用'),
  0: t('status.disabled', '禁用')
}))

// 列配置
const columns = computed(() => [
  {
    prop: 'id',
    label: t('', { field: 'ID', comment: '编号' }),
    width: 80
  },
  {
    prop: 'userName',
    label: t('', { field: 'UserName', comment: '用户名' })
  },
  {
    prop: 'status',
    label: t('', { field: 'Status', comment: '状态' }),
    formatter: (row: any) => statusMap.value[row.status]
  },
  {
    prop: 'createTime',
    label: t('', { field: 'CreateTime', comment: '创建时间' })
  }
])
</script>

<template>
  <el-table :data="tableData">
    <el-table-column
      v-for="col in columns"
      :key="col.prop"
      :prop="col.prop"
      :label="col.label"
      :width="col.width"
      :formatter="col.formatter"
    />
    <el-table-column
      :label="t('', {
        [LanguageCode.zh_CN]: '操作',
        [LanguageCode.en_US]: 'Actions'
      })"
      width="200"
    >
      <template #default="{ row }">
        <el-button type="primary" link>
          {{ t('button.edit') }}
        </el-button>
        <el-button type="danger" link>
          {{ t('button.delete') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
```

### 国际化表单验证

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const form = reactive({
  userName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 国际化验证规则
const rules = computed(() => ({
  userName: [
    {
      required: true,
      message: t('login.rule.userName.required'),
      trigger: 'blur'
    },
    {
      min: 3,
      max: 20,
      message: t('login.rule.userName.range', { min: 3, max: 20 }),
      trigger: 'blur'
    }
  ],
  email: [
    {
      required: true,
      message: t('validation.email.required', '请输入邮箱'),
      trigger: 'blur'
    },
    {
      type: 'email',
      message: t('validation.email.format', '请输入正确的邮箱格式'),
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: t('login.rule.password.required'),
      trigger: 'blur'
    },
    {
      min: 6,
      max: 20,
      message: t('login.rule.password.range', { min: 6, max: 20 }),
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: t('validation.confirmPassword.required', '请再次输入密码'),
      trigger: 'blur'
    },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== form.password) {
          callback(new Error(t('validation.confirmPassword.mismatch', '两次密码不一致')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}))
</script>

<template>
  <el-form :model="form" :rules="rules" label-width="100px">
    <el-form-item :label="t('login.userName')" prop="userName">
      <el-input v-model="form.userName" />
    </el-form-item>
    <el-form-item :label="t('Email', '邮箱')" prop="email">
      <el-input v-model="form.email" />
    </el-form-item>
    <el-form-item :label="t('login.password')" prop="password">
      <el-input v-model="form.password" type="password" show-password />
    </el-form-item>
    <el-form-item :label="t('Confirm Password', '确认密码')" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary">{{ t('button.submit') }}</el-button>
      <el-button>{{ t('button.reset') }}</el-button>
    </el-form-item>
  </el-form>
</template>
```

### 国际化消息提示

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t, isChinese } = useI18n()

/**
 * 显示成功消息
 */
const showSuccess = (action: string) => {
  ElMessage.success(t(`message.${action}Success`, `${action}成功`))
}

/**
 * 显示错误消息
 */
const showError = (message: string) => {
  ElMessage.error(message)
}

/**
 * 删除确认对话框
 */
const confirmDelete = async (name: string) => {
  try {
    await ElMessageBox.confirm(
      t('message.confirmDelete', { name }),
      t('message.warning'),
      {
        confirmButtonText: t('button.confirm', '确定'),
        cancelButtonText: t('button.cancel', '取消'),
        type: 'warning'
      }
    )
    // 执行删除
    showSuccess('delete')
    return true
  } catch {
    // 用户取消
    return false
  }
}

/**
 * 操作确认对话框
 */
const confirmAction = async (action: string, content: string) => {
  const title = isChinese.value ? '提示' : 'Tip'

  try {
    await ElMessageBox.confirm(content, title, {
      confirmButtonText: t('button.confirm'),
      cancelButtonText: t('button.cancel'),
      type: 'info'
    })
    return true
  } catch {
    return false
  }
}
</script>

<template>
  <div class="action-buttons">
    <el-button @click="showSuccess('add')">
      {{ t('button.add') }}
    </el-button>
    <el-button @click="confirmDelete('测试用户')">
      {{ t('button.delete') }}
    </el-button>
  </div>
</template>
```

## API 参考

### useI18n() 返回值

| 属性/方法 | 类型 | 说明 |
|---------|------|------|
| `t` | `(key: string, params?: object \| string) => string` | 增强的翻译函数 |
| `locale` | `Ref<LanguageCode>` | 当前语言代码 |
| `currentLanguage` | `Ref<LanguageCode>` | 当前语言代码（别名） |
| `currentLanguageName` | `ComputedRef<string>` | 当前语言显示名称 |
| `languages` | `ComputedRef<string[]>` | 可用语言列表 |
| `availableLocales` | `string[]` | 可用语言列表 |
| `isChinese` | `ComputedRef<boolean>` | 是否为中文环境 |
| `isEnglish` | `ComputedRef<boolean>` | 是否为英文环境 |
| `setLanguage` | `(lang: LanguageCode) => boolean` | 设置语言 |
| `initLanguage` | `() => void` | 初始化语言 |
| `d` | `(value: Date, format: string) => string` | 日期格式化 |
| `n` | `(value: number, format: string) => string` | 数字格式化 |
| `te` | `(key: string) => boolean` | 检查翻译键是否存在 |
| `tm` | `(key: string) => object` | 获取原始消息对象 |
| `rt` | `(message: string) => string` | 运行时翻译 |
| `translateRouteTitle` | `(title: string) => string` | 翻译路由标题 |
| `fallbackLocale` | `Ref<string>` | 备用语言 |
| `messages` | `object` | 所有语言消息 |

### t() 函数参数

| 用法 | 参数1 | 参数2 | 示例 |
|------|-------|-------|------|
| 标准翻译 | 翻译键 | - | `t('button.add')` |
| 带参数翻译 | 翻译键 | 参数对象 | `t('message.hello', { name: 'John' })` |
| 快捷翻译 | 英文 | 中文 | `t('Submit', '提交')` |
| Field 翻译 | 空字符串 | `{ field: string }` | `t('', { field: 'UserName' })` |
| Comment 翻译 | 空字符串 | `{ comment: string }` | `t('', { comment: '用户名' })` |
| 语言映射 | 空字符串 | `{ [LanguageCode]: string }` | `t('', { zh_CN: '中文', en_US: 'English' })` |

### LanguageCode 枚举

```typescript
export enum LanguageCode {
  zh_CN = 'zh_CN',  // 简体中文
  en_US = 'en_US'   // 英语
}
```

## 最佳实践

### 1. 优先使用语言包键名

对于固定文本,优先在语言包中定义并使用键名:

```vue
<!-- ✅ 推荐: 使用语言包键名 -->
<el-button>{{ t('button.add') }}</el-button>

<!-- ⚠️ 可用: 快捷翻译,适合临时场景 -->
<el-button>{{ t('Submit', '提交') }}</el-button>
```

### 2. 表格列使用 Field/Comment

对于代码生成的表格列,使用 field/comment 模式:

```vue
<!-- ✅ 推荐: field/comment 组合 -->
<el-table-column
  :label="t('', { field: 'UserName', comment: '用户名' })"
  prop="userName"
/>
```

### 3. 条件渲染使用 isChinese/isEnglish

```vue
<!-- ✅ 推荐: 使用语言状态判断 -->
<div v-if="isChinese">中文特定内容</div>

<!-- ❌ 不推荐: 直接比较语言代码 -->
<div v-if="currentLanguage === 'zh_CN'">中文特定内容</div>
```

### 4. 动态文本使用参数

```vue
<!-- ✅ 推荐: 使用参数占位符 -->
<p>{{ t('message.welcome', { name: userName }) }}</p>

<!-- ❌ 不推荐: 字符串拼接 -->
<p>{{ t('message.welcome') + userName }}</p>
```

### 5. 表单验证规则使用 computed

```typescript
// ✅ 推荐: 使用 computed 确保响应式
const rules = computed(() => ({
  userName: [
    { required: true, message: t('validation.required'), trigger: 'blur' }
  ]
}))

// ❌ 不推荐: 直接定义,语言切换后不更新
const rules = {
  userName: [
    { required: true, message: t('validation.required'), trigger: 'blur' }
  ]
}
```

## 常见问题

### 1. 语言切换后部分文本不更新

**问题原因:**
- 验证规则等在组件初始化时就确定了值
- 没有使用 `computed` 包装响应式数据

**解决方案:**

```typescript
// ✅ 使用 computed 包装
const rules = computed(() => ({
  userName: [
    { required: true, message: t('validation.required'), trigger: 'blur' }
  ]
}))
```

### 2. 在非组件文件中无法使用 useI18n

**问题原因:**
- `useI18n()` 只能在 setup 上下文中使用

**解决方案:**

```typescript
// 使用全局 i18n 实例
import i18n from '@/locales/i18n'

const message = i18n.global.t('message.success')
```

### 3. 翻译键不存在时显示键名

**问题原因:**
- 语言包中未定义该键

**解决方案:**

```typescript
// 使用 te() 检查并提供降级
const { t, te } = useI18n()

const text = te('custom.key') ? t('custom.key') : '默认文本'
```

### 4. Element Plus 组件语言不同步

**问题原因:**
- Element Plus 需要单独配置语言

**解决方案:**

```typescript
// i18n.ts 中已整合 Element Plus 语言包
const i18n = createI18n({
  messages: {
    zh_CN: { ...zh_CN, ...el_zhCn },
    en_US: { ...en_US, ...el_en }
  }
})
```

### 5. 日期/数字格式化不生效

**问题原因:**
- 未配置 datetimeFormats 或 numberFormats

**解决方案:**

```typescript
const i18n = createI18n({
  datetimeFormats: {
    zh_CN: { short: { ... }, long: { ... } },
    en_US: { short: { ... }, long: { ... } }
  },
  numberFormats: {
    zh_CN: { currency: { ... } },
    en_US: { currency: { ... } }
  }
})
```

### 6. 类型提示不完整

**问题原因:**
- 语言包类型未正确导出

**解决方案:**

```typescript
// locales/i18n.ts
export type LanguageType = typeof zh_CN

// composables/useI18n.ts
import type { LanguageType } from '@/locales/i18n'

const t = (key: ObjKeysToUnion<LanguageType> | string, ...) => { ... }
```

### 7. 路由标题翻译无效

**问题原因:**
- 路由 meta.title 与语言包 route 键不匹配

**解决方案:**

```typescript
// 确保路由 title 与语言包键对应
// router/modules/system.ts
{
  path: '/system/user',
  meta: { title: 'user' }  // 对应 route.user
}

// locales/zh_CN.ts
export default {
  route: {
    user: '用户管理'
  }
}
```
