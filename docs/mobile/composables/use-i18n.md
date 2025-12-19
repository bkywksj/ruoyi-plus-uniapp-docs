# useI18n 国际化

## 介绍

`useI18n` 是增强的国际化组合函数，基于 wot-ui 的翻译系统，扩展了 Vue I18n 的功能特性。适配移动端使用场景，支持多语言字段国际化、路由标题翻译等功能。

**核心特性:**

- **增强翻译函数** - 支持多种翻译方式，包括简单用法、字段信息配置、语言映射等多种翻译模式
- **语言管理** - 提供当前语言、语言列表等响应式状态，支持实时切换语言
- **路由标题翻译** - 支持翻译路由标题的便捷方法，自动从语言包获取对应翻译
- **wot-ui 兼容** - 与 wot-ui 的 useTranslate 保持兼容，同步更新组件库语言
- **缓存集成** - 语言偏好自动持久化到本地缓存，下次启动自动恢复
- **系统语言检测** - 首次使用时自动检测系统语言，提供本地化体验
- **类型安全** - 完整的 TypeScript 类型支持，翻译键名自动补全

**平台兼容性:**

| 平台 | 支持情况 | 备注 |
|------|---------|------|
| H5 | ✅ 完全支持 | 支持 localStorage 缓存 |
| 微信小程序 | ✅ 完全支持 | 支持 uni.getStorageSync |
| 支付宝小程序 | ✅ 完全支持 | - |
| 百度小程序 | ✅ 完全支持 | - |
| QQ小程序 | ✅ 完全支持 | - |
| 字节跳动小程序 | ✅ 完全支持 | - |
| App (Android/iOS) | ✅ 完全支持 | 支持原生存储 |

## 架构设计

### 整体架构

国际化系统由三层架构组成：

```
┌─────────────────────────────────────────────────┐
│                  应用层 (Application)            │
│  ┌─────────────────────────────────────────┐    │
│  │        useI18n() Composable             │    │
│  │  - t() 增强翻译函数                      │    │
│  │  - translate() wot-ui兼容               │    │
│  │  - translateRouteTitle() 路由翻译       │    │
│  │  - 语言状态响应式绑定                    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                  核心层 (Core)                   │
│  ┌─────────────────────────────────────────┐    │
│  │          i18n.ts 核心模块               │    │
│  │  - currentLanguage 响应式状态           │    │
│  │  - languageState 计算属性集合           │    │
│  │  - setLanguage() 语言切换               │    │
│  │  - getLanguage() 获取当前语言           │    │
│  │  - getCurrentMessages() 获取语言包      │    │
│  │  - initLanguage() 初始化语言            │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                  存储层 (Storage)                │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  语言包       │  │    缓存系统            │   │
│  │  zh-CN.ts    │  │  - localStorage (H5)   │   │
│  │  en-US.ts    │  │  - uni.setStorage (MP) │   │
│  └──────────────┘  └────────────────────────┘   │
│                          │                       │
│                          ▼                       │
│               ┌────────────────────┐             │
│               │  wot-ui Locale     │             │
│               │  组件库语言同步     │             │
│               └────────────────────┘             │
└─────────────────────────────────────────────────┘
```

### 语言初始化流程

```
应用启动
    │
    ▼
initLanguage()
    │
    ├─► 从缓存读取语言设置
    │       │
    │       ├─ 缓存存在且有效 ──► 使用缓存语言
    │       │
    │       └─ 缓存不存在/无效
    │               │
    │               ▼
    │       检测系统语言
    │               │
    │               ├─ 系统语言包含 zh/cn ──► 使用中文
    │               │
    │               ├─ 系统语言包含 en ──► 使用英文
    │               │
    │               └─ 其他情况 ──► 默认中文
    │
    ▼
setLanguage(language)
    │
    ├─► 更新 currentLanguage 响应式状态
    │
    ├─► 同步更新 wot-ui Locale
    │
    └─► 保存到缓存
```

## 基本用法

### 简单翻译

使用 `t` 函数进行简单翻译，这是最常用的翻译方式：

```vue
<template>
  <view class="container">
    <!-- 简单用法：t('英文', '中文') -->
    <wd-text :text="t('userName', '用户名')" />
    <wd-text :text="t('password', '密码')" />
    <wd-text :text="t('login', '登录')" />
    <wd-text :text="t('register', '注册')" />

    <!-- 表单标签 -->
    <wd-cell-group>
      <wd-input
        :label="t('userName', '用户名')"
        v-model="form.userName"
        :placeholder="t('pleaseInput', '请输入') + t('userName', '用户名')"
      />
      <wd-input
        :label="t('password', '密码')"
        v-model="form.password"
        type="password"
        :placeholder="t('pleaseInput', '请输入') + t('password', '密码')"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const form = reactive({
  userName: '',
  password: ''
})
</script>
```

**简单翻译原理:**
- 中文环境：返回第二个参数（中文值）
- 其他环境：返回第一个参数（key/英文值）

### 使用字段信息

通过字段信息对象进行翻译，适用于需要更灵活配置的场景：

```vue
<template>
  <view class="form-container">
    <!-- 使用字段信息：field 用于英文，comment 用于中文 -->
    <wd-cell-group>
      <wd-input
        :label="t('', { field: 'UserName', comment: '用户名' })"
        v-model="form.userName"
      />
      <wd-input
        :label="t('', { field: 'Email', comment: '邮箱地址' })"
        v-model="form.email"
      />
      <wd-input
        :label="t('', { field: 'PhoneNumber', comment: '手机号码' })"
        v-model="form.phone"
      />
      <wd-input
        :label="t('', { field: 'Department', comment: '所属部门' })"
        v-model="form.dept"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const form = reactive({
  userName: '',
  email: '',
  phone: '',
  dept: ''
})
</script>
```

**字段信息用法说明:**
- `field` - 用于非中文环境（通常是英文字段名）
- `comment` - 用于中文环境（通常是中文注释）
- 可根据当前语言自动选择对应值

### 使用语言特定翻译

指定不同语言的翻译内容，支持多语言精确配置：

```vue
<template>
  <view class="multi-lang">
    <!-- 使用语言代码指定翻译 -->
    <wd-text :text="labelUserName" />
    <wd-text :text="labelStatus" />

    <!-- 状态显示 -->
    <wd-tag :type="status === 'active' ? 'success' : 'danger'">
      {{ statusText }}
    </wd-tag>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()

const status = ref('active')

// 使用语言代码映射
const labelUserName = computed(() => t('', {
  [LanguageCode.zh_CN]: '用户名',
  [LanguageCode.en_US]: 'UserName'
}))

const labelStatus = computed(() => t('', {
  [LanguageCode.zh_CN]: '状态',
  [LanguageCode.en_US]: 'Status'
}))

const statusText = computed(() => {
  if (status.value === 'active') {
    return t('', {
      [LanguageCode.zh_CN]: '已激活',
      [LanguageCode.en_US]: 'Active'
    })
  }
  return t('', {
    [LanguageCode.zh_CN]: '已禁用',
    [LanguageCode.en_US]: 'Disabled'
  })
})
</script>
```

### 使用传统 i18n 键

通过语言包键名进行翻译，适用于统一管理翻译内容的场景：

```vue
<template>
  <view class="page">
    <!-- 使用 i18n 键翻译 -->
    <wd-navbar :title="t('route.userCenter')" />

    <view class="content">
      <wd-text :text="t('user.userName')" />
      <wd-text :text="t('common.submit')" />
      <wd-text :text="t('message.success')" />
    </view>

    <!-- 按钮翻译 -->
    <view class="button-group">
      <wd-button type="primary">
        {{ t('button.submit') }}
      </wd-button>
      <wd-button>
        {{ t('button.cancel') }}
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
```

**语言包结构示例:**

```typescript
// locales/zh-CN.ts
export default {
  user: {
    userName: '用户名',
    password: '密码',
    email: '邮箱'
  },
  common: {
    submit: '提交',
    cancel: '取消',
    confirm: '确认'
  },
  button: {
    submit: '提交',
    cancel: '取消',
    save: '保存',
    delete: '删除'
  },
  message: {
    success: '操作成功',
    error: '操作失败'
  },
  route: {
    dashboard: '仪表盘',
    userCenter: '个人中心'
  }
}
```

## 语言管理

### 获取当前语言

```typescript
import { useI18n } from '@/composables/useI18n'

const {
  currentLanguage,
  currentLanguageName,
  isChinese,
  isEnglish
} = useI18n()

// 所有返回值都是响应式的
console.log('当前语言代码:', currentLanguage.value) // 'zh-CN' 或 'en-US'
console.log('当前语言名称:', currentLanguageName.value) // '简体中文' 或 'English'
console.log('是否中文:', isChinese.value) // true 或 false
console.log('是否英文:', isEnglish.value) // true 或 false
```

### 切换语言

```typescript
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { setLanguage, currentLanguage } = useI18n()

// 切换到英文
const switchToEnglish = () => {
  const success = setLanguage(LanguageCode.en_US)
  if (success) {
    console.log('语言切换成功:', currentLanguage.value)
    // 可选：显示提示
    uni.showToast({
      title: 'Language changed',
      icon: 'success'
    })
  }
}

// 切换到中文
const switchToChinese = () => {
  const success = setLanguage(LanguageCode.zh_CN)
  if (success) {
    console.log('语言切换成功:', currentLanguage.value)
    uni.showToast({
      title: '语言切换成功',
      icon: 'success'
    })
  }
}

// 切换语言（toggle）
const toggleLanguage = () => {
  if (currentLanguage.value === LanguageCode.zh_CN) {
    setLanguage(LanguageCode.en_US)
  } else {
    setLanguage(LanguageCode.zh_CN)
  }
}
```

**语言切换流程:**
1. 验证语言代码有效性
2. 更新响应式状态 `currentLanguage`
3. 同步更新 wot-ui 组件库语言
4. 保存到本地缓存
5. 返回切换结果

### 获取语言列表

```vue
<template>
  <view class="language-selector">
    <!-- 方式1：使用 Picker 选择器 -->
    <wd-cell title="语言设置" is-link @click="showPicker = true">
      <text>{{ currentLanguageName }}</text>
    </wd-cell>

    <wd-picker
      v-model="showPicker"
      :columns="languageColumns"
      @confirm="onLanguageChange"
    />

    <!-- 方式2：使用按钮组 -->
    <view class="button-group">
      <wd-button
        v-for="lang in languageOptions"
        :key="lang.value"
        :type="currentLanguage === lang.value ? 'primary' : 'default'"
        size="small"
        @click="setLanguage(lang.value)"
      >
        {{ lang.label }}
      </wd-button>
    </view>

    <!-- 方式3：使用 ActionSheet -->
    <wd-action-sheet
      v-model="showActionSheet"
      :actions="languageActions"
      @select="onSelectLanguage"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const {
  languageOptions,
  currentLanguage,
  currentLanguageName,
  setLanguage
} = useI18n()

const showPicker = ref(false)
const showActionSheet = ref(false)

// Picker 列配置
const languageColumns = computed(() =>
  languageOptions.value.map(item => ({
    value: item.value,
    label: item.label
  }))
)

// ActionSheet 配置
const languageActions = computed(() =>
  languageOptions.value.map(item => ({
    name: item.label,
    value: item.value,
    checked: item.value === currentLanguage.value
  }))
)

// Picker 确认
const onLanguageChange = ({ value }) => {
  setLanguage(value)
}

// ActionSheet 选择
const onSelectLanguage = (action) => {
  setLanguage(action.value)
}
</script>
```

## 路由标题翻译

### 基本用法

```typescript
import { useI18n } from '@/composables/useI18n'

const { translateRouteTitle } = useI18n()

// 翻译路由标题
const title = translateRouteTitle('dashboard') // 返回对应语言的标题

// 翻译流程：
// 1. 构建 key: `route.${title}` => 'route.dashboard'
// 2. 从当前语言包查找
// 3. 找到则返回翻译值，否则返回原始标题
```

### 在导航栏中使用

```vue
<template>
  <view class="page">
    <wd-navbar :title="pageTitle" />

    <view class="content">
      <!-- 页面内容 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { translateRouteTitle, currentLanguage } = useI18n()

// 使用计算属性确保语言切换后标题自动更新
const pageTitle = computed(() => translateRouteTitle('userCenter'))
</script>
```

### 动态路由标题

```vue
<template>
  <view class="page">
    <wd-navbar :title="dynamicTitle" />

    <wd-tabs v-model:active="activeTab">
      <wd-tab
        v-for="tab in tabs"
        :key="tab.name"
        :title="translateRouteTitle(tab.titleKey)"
      />
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { translateRouteTitle } = useI18n()

const activeTab = ref(0)

const tabs = [
  { name: 'profile', titleKey: 'profile' },
  { name: 'settings', titleKey: 'settings' },
  { name: 'security', titleKey: 'security' }
]

const dynamicTitle = computed(() => {
  return translateRouteTitle(tabs[activeTab.value].titleKey)
})
</script>
```

## wot-ui 兼容

### translate 方法

`translate` 方法与 wot-ui 的 `useTranslate` 保持兼容：

```typescript
import { useI18n } from '@/composables/useI18n'

const { translate } = useI18n()

// 与 wot-ui 的 useTranslate 兼容
const confirmText = translate('button.confirm') // 确认
const cancelText = translate('button.cancel') // 取消
const loadingText = translate('loading.text') // 加载中...

// 支持函数类型翻译（带参数）
const countText = translate('common.count', 10) // 共 10 条
```

### 组件库语言同步

当调用 `setLanguage` 切换语言时，系统会自动同步更新 wot-ui 组件库的语言：

```typescript
// i18n.ts 内部实现
export const setLanguage = (language: LanguageCode): boolean => {
  // ...
  // 更新当前语言状态
  currentLanguage.value = language

  // 同步更新 wot-ui 的语言设置
  Locale.use(language)

  // 保存到缓存
  setLanguageToCache(language)
  // ...
}
```

这确保了应用翻译和组件库翻译保持一致。

## 翻译优先级

`t` 函数的翻译优先级如下：

### 1. 简单用法 `t('key', '中文值')`

```
中文环境 → 返回第二个参数（中文值）
其他环境 → 返回第一个参数（key/英文值）
```

### 2. 字段信息用法优先级

```
优先级1: 使用当前语言的映射 fieldInfo[currentLang]
    │
    └─ 存在 → 返回该值
    │
    ▼
优先级2: 根据当前语言使用 field 或 comment
    │
    ├─ 中文环境 → 使用 comment
    └─ 其他环境 → 使用 field
    │
    ▼
优先级3: 降级策略
    │
    ├─ 中文环境 → 尝试 field → 尝试英文映射
    └─ 其他环境 → 尝试 comment → 尝试中文映射
    │
    ▼
优先级4: 使用任何可用的翻译值
```

### 3. i18n 键用法

```
从语言包查找键
    │
    ├─ 找到 → 返回翻译值
    │
    ├─ 按钮键降级处理
    │   └─ button.user.save → button.save
    │
    └─ 未找到 → 返回键名本身
```

**按钮键降级示例:**

```typescript
// 假设语言包中没有 button.user.save，但有 button.save
t('button.user.save')
// 1. 首先查找 button.user.save - 未找到
// 2. 提取操作类型 save
// 3. 尝试通用键 button.save - 找到
// 4. 返回 button.save 的翻译值
```

## API

### useI18n 返回值

| 属性/方法 | 说明 | 类型 |
|-----------|------|------|
| t | 增强的翻译函数 | `(key: string, fieldInfoOrValue?: object \| string) => string` |
| currentLanguage | 当前语言代码（响应式） | `ComputedRef<LanguageCode>` |
| currentLanguageName | 当前语言名称（响应式） | `ComputedRef<string>` |
| languageOptions | 可用语言列表（响应式） | `ComputedRef<Array<{value, label, name}>>` |
| isChinese | 是否中文环境（响应式） | `ComputedRef<boolean>` |
| isEnglish | 是否英文环境（响应式） | `ComputedRef<boolean>` |
| setLanguage | 设置应用语言 | `(lang: LanguageCode) => boolean` |
| translateRouteTitle | 翻译路由标题 | `(title: string) => string` |
| translate | wot-ui 兼容的翻译方法 | `(key: string, ...args: unknown[]) => string` |

### 核心模块导出

| 函数/变量 | 说明 | 类型 |
|-----------|------|------|
| getLanguage | 获取当前语言 | `() => LanguageCode` |
| setLanguage | 设置语言 | `(lang: LanguageCode) => boolean` |
| getCurrentMessages | 获取当前语言包 | `() => LanguageType` |
| initLanguage | 初始化语言 | `() => void` |
| languageState | 语言状态对象 | `LanguageState` |

### LanguageCode 枚举

```typescript
enum LanguageCode {
  zh_CN = 'zh-CN',  // 中文(简体)
  en_US = 'en-US'   // 英文(美国)
}
```

### 类型定义

```typescript
/**
 * useI18n 返回值类型
 */
interface UseI18nReturn {
  t: (
    key: ObjKeysToUnion<LanguageType> | string,
    fieldInfoOrValue?:
      | ({
          field?: string
          comment?: string
        } & Partial<Record<LanguageCode, string>> &
          Record<string, any>)
      | string,
  ) => string

  currentLanguage: ComputedRef<LanguageCode>
  currentLanguageName: ComputedRef<string>
  languageOptions: ComputedRef<Array<{
    value: LanguageCode
    label: string
    name: string
  }>>
  isChinese: ComputedRef<boolean>
  isEnglish: ComputedRef<boolean>

  setLanguage: (lang: LanguageCode) => boolean
  translateRouteTitle: (title: string) => string
  translate: (key: string, ...args: unknown[]) => string
}

/**
 * 语言状态类型
 */
interface LanguageState {
  current: ComputedRef<LanguageCode>
  currentName: ComputedRef<string>
  isChinese: ComputedRef<boolean>
  isEnglish: ComputedRef<boolean>
  options: ComputedRef<Array<{
    value: LanguageCode
    label: string
    name: string
  }>>
}

/**
 * 对象键名转联合类型
 * 将嵌套对象的键名转换为点分隔的字符串联合类型
 *
 * @example
 * type Keys = ObjKeysToUnion<{
 *   user: { name: string, age: number },
 *   common: { submit: string }
 * }>
 * // 结果: 'user.name' | 'user.age' | 'common.submit'
 */
type ObjKeysToUnion<T, Depth extends number[] = [0, 1, 2, 3]> =
  Depth['length'] extends 4
    ? never
    : T extends object
      ? {
          [K in keyof T]: `${K & string}${T[K] extends object
            ? `.${ObjKeysToUnion<T[K], [...Depth, 0]>}`
            : ''}`
        }[keyof T]
      : never

/**
 * 语言包类型（自动推断）
 */
type LanguageType = typeof zh_CN
```

## 缓存机制

### 缓存键

```typescript
const LANGUAGE_CACHE_KEY = 'app_language'
```

### 缓存读取流程

```typescript
const getLanguageFromCache = (): LanguageCode => {
  // 1. 尝试从缓存读取
  const cachedLanguage = cache.get<LanguageCode>(LANGUAGE_CACHE_KEY)
  if (cachedLanguage && Object.values(LanguageCode).includes(cachedLanguage)) {
    return cachedLanguage
  }

  // 2. 尝试获取系统语言
  const systemInfo = uni.getSystemInfoSync()
  const systemLanguage = systemInfo.language

  // 3. 匹配系统语言
  if (systemLanguage.includes('zh') || systemLanguage.includes('cn')) {
    return LanguageCode.zh_CN
  } else if (systemLanguage.includes('en')) {
    return LanguageCode.en_US
  }

  // 4. 默认返回中文
  return LanguageCode.zh_CN
}
```

### 缓存写入

```typescript
export const setLanguageToCache = (language: LanguageCode): boolean => {
  try {
    return cache.set(LANGUAGE_CACHE_KEY, language)
  } catch (error) {
    console.error('[i18n] 设置语言到缓存失败:', error)
    return false
  }
}
```

## 最佳实践

### 1. 表单标签翻译

```vue
<template>
  <wd-form :model="form" :rules="rules" ref="formRef">
    <wd-cell-group>
      <wd-input
        :label="t('userName', '用户名')"
        v-model="form.userName"
        :placeholder="t('pleaseInput', '请输入') + t('userName', '用户名')"
        prop="userName"
      />
      <wd-input
        :label="t('phone', '手机号')"
        v-model="form.phone"
        type="number"
        :placeholder="t('pleaseInput', '请输入') + t('phone', '手机号')"
        prop="phone"
      />
      <wd-input
        :label="t('email', '邮箱')"
        v-model="form.email"
        :placeholder="t('pleaseInput', '请输入') + t('email', '邮箱')"
        prop="email"
      />
    </wd-cell-group>

    <view class="submit-btn">
      <wd-button type="primary" block @click="onSubmit">
        {{ t('submit', '提交') }}
      </wd-button>
    </view>
  </wd-form>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const formRef = ref()

const form = reactive({
  userName: '',
  phone: '',
  email: ''
})

// 表单规则也支持国际化
const rules = computed(() => ({
  userName: [
    { required: true, message: t('required', '必填项') }
  ],
  phone: [
    { required: true, message: t('required', '必填项') },
    { pattern: /^1\d{10}$/, message: t('invalidPhone', '手机号格式不正确') }
  ],
  email: [
    { pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: t('invalidEmail', '邮箱格式不正确') }
  ]
}))

const onSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('表单数据:', form)
    }
  })
}
</script>
```

### 2. 按钮文字翻译

```vue
<template>
  <view class="button-group">
    <wd-button type="primary" @click="onSubmit" :loading="loading">
      {{ loading ? t('submitting', '提交中...') : t('submit', '提交') }}
    </wd-button>
    <wd-button @click="onCancel">
      {{ t('cancel', '取消') }}
    </wd-button>
    <wd-button type="info" @click="onReset">
      {{ t('reset', '重置') }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    // 提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  // 取消逻辑
}

const onReset = () => {
  // 重置逻辑
}
</script>
```

### 3. 消息提示翻译

```typescript
import { useI18n } from '@/composables/useI18n'

export const useMessage = () => {
  const { t } = useI18n()

  const showSuccess = (customMsg?: string) => {
    uni.showToast({
      title: customMsg || t('operationSuccess', '操作成功'),
      icon: 'success'
    })
  }

  const showError = (error?: string | Error) => {
    const message = error instanceof Error ? error.message : error
    uni.showToast({
      title: message || t('operationFailed', '操作失败'),
      icon: 'none'
    })
  }

  const showLoading = (msg?: string) => {
    uni.showLoading({
      title: msg || t('loading', '加载中...')
    })
  }

  const confirm = (options: {
    title?: string
    content: string
    onConfirm?: () => void
    onCancel?: () => void
  }) => {
    uni.showModal({
      title: options.title || t('hint', '提示'),
      content: options.content,
      confirmText: t('confirm', '确认'),
      cancelText: t('cancel', '取消'),
      success: (res) => {
        if (res.confirm) {
          options.onConfirm?.()
        } else {
          options.onCancel?.()
        }
      }
    })
  }

  return {
    showSuccess,
    showError,
    showLoading,
    hideLoading: uni.hideLoading,
    confirm
  }
}
```

### 4. 语言切换组件

```vue
<template>
  <view class="language-switch">
    <view class="current-lang" @click="showOptions = true">
      <text class="label">{{ t('language', '语言') }}</text>
      <text class="value">{{ currentLanguageName }}</text>
      <wd-icon name="arrow-right" />
    </view>

    <wd-action-sheet
      v-model="showOptions"
      :actions="actions"
      @select="onSelect"
      :cancel-text="t('cancel', '取消')"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const {
  t,
  languageOptions,
  currentLanguage,
  currentLanguageName,
  setLanguage
} = useI18n()

const showOptions = ref(false)

const actions = computed(() =>
  languageOptions.value.map(item => ({
    name: item.label,
    value: item.value,
    color: item.value === currentLanguage.value ? '#1989fa' : undefined
  }))
)

const onSelect = (action: { value: string }) => {
  setLanguage(action.value as any)
  uni.showToast({
    title: t('languageChanged', '语言已切换'),
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.language-switch {
  .current-lang {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx;
    background: #fff;

    .label {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .value {
      margin-right: 16rpx;
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
```

### 5. 条件渲染翻译

```vue
<template>
  <view class="status-info">
    <!-- 根据语言条件渲染不同布局 -->
    <template v-if="isChinese">
      <view class="chinese-layout">
        <text>状态：{{ statusText }}</text>
        <text>更新时间：{{ updateTime }}</text>
      </view>
    </template>
    <template v-else>
      <view class="english-layout">
        <text>Status: {{ statusText }}</text>
        <text>Updated: {{ updateTime }}</text>
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t, isChinese } = useI18n()

const props = defineProps<{
  status: 'active' | 'inactive'
  updateTime: string
}>()

const statusText = computed(() => {
  const statusMap = {
    active: t('active', '激活'),
    inactive: t('inactive', '未激活')
  }
  return statusMap[props.status]
})
</script>
```

## 常见问题

### 1. 翻译不生效？

**问题原因:**
- 语言包中不存在对应的键
- 键名拼写错误
- 语言包未正确导入

**解决方案:**

```typescript
// 1. 检查语言包是否包含该键
import zh_CN from '@/locales/zh-CN'
console.log('语言包内容:', zh_CN)

// 2. 使用简单用法作为备选
const text = t('unknownKey', '备选中文') // 即使键不存在，中文环境也会显示 '备选中文'

// 3. 检查键名是否正确
t('user.userName') // 正确
t('user.username') // 错误（大小写敏感）
```

### 2. 如何添加新语言？

**步骤:**

1. 创建新语言包文件：

```typescript
// locales/ja-JP.ts
export default {
  user: {
    userName: 'ユーザー名',
    password: 'パスワード'
  },
  // ... 其他翻译
}
```

2. 更新 LanguageCode 枚举：

```typescript
// systemConfig.ts
export enum LanguageCode {
  zh_CN = 'zh-CN',
  en_US = 'en-US',
  ja_JP = 'ja-JP'  // 新增
}
```

3. 更新 i18n.ts：

```typescript
import ja_JP from './ja-JP'

const messages = {
  [LanguageCode.zh_CN]: zh_CN,
  [LanguageCode.en_US]: en_US,
  [LanguageCode.ja_JP]: ja_JP  // 新增
}

// 更新 languageState.options
options: computed(() => [
  { value: LanguageCode.zh_CN, label: '简体中文', name: '简体中文' },
  { value: LanguageCode.en_US, label: 'English', name: 'English' },
  { value: LanguageCode.ja_JP, label: '日本語', name: '日本語' }  // 新增
])
```

### 3. 组件内翻译实时更新？

`useI18n` 返回的状态都是响应式的，语言切换后会自动更新。

```vue
<template>
  <!-- 自动响应语言变化 -->
  <wd-text :text="title" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t, currentLanguage } = useI18n()

// 使用计算属性包装，确保响应式
const title = computed(() => t('pageTitle', '页面标题'))

// 监听语言变化
watch(currentLanguage, (newLang) => {
  console.log('语言已切换到:', newLang)
})
</script>
```

### 4. 如何处理动态翻译？

```typescript
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

// 方式1：使用计算属性
const buttonText = computed(() => t('submit', '提交'))

// 方式2：在模板中直接调用
// <wd-button>{{ t('submit', '提交') }}</wd-button>

// 方式3：带参数的动态翻译
const getCountText = (count: number) => {
  return t('totalCount', `共 ${count} 条`)
}
```

### 5. 翻译键自动补全不工作？

确保 TypeScript 配置正确，语言包类型已导出：

```typescript
// 确保 i18n.ts 中导出类型
export type LanguageType = typeof zh_CN

// useI18n.ts 中使用类型
import type { LanguageType } from '@/locales/i18n'

const t = (key: ObjKeysToUnion<LanguageType> | string, ...) => {
  // ...
}
```

### 6. 如何在非组件中使用国际化？

```typescript
// utils/message.ts
import { useI18n } from '@/composables/useI18n'

// 直接调用 useI18n 获取翻译函数
const { t } = useI18n()

export const showSuccessMessage = () => {
  uni.showToast({
    title: t('success', '成功'),
    icon: 'success'
  })
}

// 或者导入核心函数
import { getLanguage, getCurrentMessages } from '@/locales/i18n'
import { getPropByPath } from '@/wd/components/common/util'

export const translate = (key: string): string => {
  const messages = getCurrentMessages()
  const message = getPropByPath(messages, key)
  return message || key
}
```

### 7. 语言切换后页面没有刷新？

```typescript
// 方式1：强制刷新页面（不推荐）
const switchLanguage = (lang: LanguageCode) => {
  setLanguage(lang)
  // 强制刷新当前页面
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  uni.reLaunch({ url: '/' + currentPage.route })
}

// 方式2：使用响应式数据（推荐）
// 确保所有翻译都使用计算属性或直接在模板中调用 t()
const title = computed(() => t('pageTitle', '页面标题'))
```

### 8. 如何处理复数形式？

```typescript
// 在语言包中定义复数形式
// zh-CN.ts
export default {
  item: {
    count: (n: number) => `共 ${n} 项`,
    selected: (n: number) => `已选择 ${n} 项`
  }
}

// en-US.ts
export default {
  item: {
    count: (n: number) => `${n} item${n > 1 ? 's' : ''}`,
    selected: (n: number) => `${n} item${n > 1 ? 's' : ''} selected`
  }
}

// 使用
const { translate } = useI18n()
const countText = translate('item.count', 5) // 中文: "共 5 项", 英文: "5 items"
```
