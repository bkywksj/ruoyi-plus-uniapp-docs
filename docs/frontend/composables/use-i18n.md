# useI18n 国际化 Composable

## 介绍

`useI18n` 是前端项目中的核心国际化 Composable,它对 Vue I18n 的原生 `useI18n` 钩子进行了深度扩展,提供了更强大的翻译功能和更便捷的语言管理能力。

**核心特性:**

- **增强翻译函数** - 支持六种翻译模式,包括字段信息国际化、简单用法、语言映射等
- **智能降级策略** - 多层次的翻译降级机制,确保始终返回有意义的文本
- **语言状态管理** - 与 `useLayout` 深度集成,实现语言状态的全局同步
- **Vue I18n 兼容** - 完全保留原生 API,支持日期格式化、数字格式化等
- **类型安全** - 完整的 TypeScript 支持,提供翻译键名自动补全
- **Element Plus 集成** - 自动同步 Element Plus 组件库的语言设置

该 Composable 解决了传统 i18n 方案在企业级应用中的痛点:代码生成器生成的表格列、表单字段需要快速国际化,而传统方式需要维护大量的语言包键名。通过字段信息对象模式,可以直接在组件中定义多语言文本,大大简化了开发流程。

## 架构设计

### 整体架构

```
┌──────────────────────────────────────────────────────────────────┐
│                         useI18n Composable                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐  │
│  │   翻译核心      │    │   语言管理      │    │   状态查询      │  │
│  │                │    │                │    │                │  │
│  │  t()           │    │  setLanguage() │    │  isChinese     │  │
│  │  te()          │    │  initLanguage()│    │  isEnglish     │  │
│  │  translateRoute│    │  getLanguage() │    │  currentLang   │  │
│  └────────────────┘    └────────────────┘    └────────────────┘  │
│           │                    │                    │             │
│           └────────────────────┼────────────────────┘             │
│                                │                                   │
│                    ┌───────────▼───────────┐                       │
│                    │     Vue I18n Core     │                       │
│                    │                       │                       │
│                    │  locale, messages     │                       │
│                    │  d(), n(), rt(), tm() │                       │
│                    └───────────────────────┘                       │
│                                │                                   │
│           ┌────────────────────┼────────────────────┐             │
│           │                    │                    │             │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐  │
│  │   zh_CN.ts      │  │   en_US.ts      │  │   useLayout     │  │
│  │   中文语言包     │  │   英文语言包     │  │   状态持久化     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 核心模块

**1. 翻译核心模块**

负责文本翻译的核心逻辑,支持多种翻译模式:

```typescript
// 翻译函数签名
const t = (
  key: ObjKeysToUnion<LanguageType> | string,
  fieldInfoOrValue?:
    | ({
        field?: string
        comment?: string
      } & Partial<Record<LanguageCode, string>>)
    | string
): string
```

**2. 语言管理模块**

负责语言的设置、初始化和同步:

- 同步 Vue I18n 的 `locale` 设置
- 同步 `useLayout` 的语言状态
- 更新 HTML 元素的 `lang` 属性

**3. 状态查询模块**

提供语言状态的响应式查询:

- `currentLanguage` - 当前语言代码
- `currentLanguageName` - 当前语言显示名称
- `isChinese` / `isEnglish` - 语言环境判断

### 与 Vue I18n 的关系

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐              ┌─────────────────────────┐  │
│   │  Component  │──────────────▶│      useI18n()         │  │
│   └─────────────┘              │  (Enhanced Composable)  │  │
│                                └───────────┬─────────────┘  │
│                                            │                 │
│                                ┌───────────▼─────────────┐  │
│                                │   useVueI18n()          │  │
│                                │   (Vue I18n Native)     │  │
│                                └───────────┬─────────────┘  │
│                                            │                 │
│                                ┌───────────▼─────────────┐  │
│                                │      i18n Instance      │  │
│                                │   (createI18n)          │  │
│                                └─────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 语言包配置

### 语言包结构

项目支持中文 (zh_CN) 和英文 (en_US) 两种语言,语言包采用嵌套对象结构:

```
src/locales/
├── i18n.ts        # i18n 实例配置
├── zh_CN.ts       # 中文语言包
└── en_US.ts       # 英文语言包
```

### 语言包模块划分

语言包按功能模块划分,便于维护和扩展:

```typescript
// zh_CN.ts 语言包结构
export default {
  // 通用文本
  '操作': '操作',
  '新增': '新增',
  '修改': '修改',
  '删除': '删除',

  // 按钮权限系统
  button: {
    query: '查询',
    add: '新增',
    update: '修改',
    delete: '删除',
    export: '导出',
    import: '导入',
    save: '保存',
    cancel: '取消',
    // 系统管理按钮
    resetPwd: '重置密码',
    unlock: '账户解锁',
    // 监控按钮
    batchLogout: '批量强退',
    forceLogout: '单条强退',
    // 开发工具按钮
    importCode: '导入代码',
    previewCode: '预览代码',
    generateCode: '生成代码'
  },

  // 弹窗提示
  dialog: {
    add: '新增',
    edit: '修改',
    delete: '删除',
    detail: '详情',
    import: '导入',
    export: '导出',
    config: '配置'
  },

  // 消息提示
  message: {
    success: '操作成功',
    error: '操作失败',
    saveSuccess: '保存成功',
    deleteSuccess: '删除成功',
    confirmDelete: '是否确认删除下列数据:',
    noData: '暂无数据',
    networkError: '网络错误，请稍后重试'
  },

  // 占位符
  placeholder: {
    input: '请输入',
    select: '请选择'
  },

  // 提示文本
  tooltip: {
    showSearch: '显示搜索',
    hideSearch: '隐藏搜索',
    refresh: '刷新',
    columns: '显示/隐藏列'
  },

  // 路由标题
  route: {
    dashboard: '首页',
    document: '项目文档'
  },

  // 登录页面
  login: {
    userName: '用户名',
    password: '密码',
    login: '登 录',
    code: '验证码',
    rememberPassword: '记住我',
    rule: {
      userName: { required: '请输入您的账号' },
      password: { required: '请输入您的密码' }
    }
  },

  // 导航栏
  navbar: {
    searchMenu: '搜索菜单',
    full: '全屏',
    language: '语言',
    logout: '退出登录'
  },

  // 菜单系统
  menu: {
    index: '首页',
    system: {
      _self: '系统管理',
      user: '用户管理',
      role: '角色管理',
      menu: '菜单管理',
      dept: '部门管理'
    }
  }
}
```

### i18n 实例配置

```typescript
// src/locales/i18n.ts
import { createI18n } from 'vue-i18n'
import zh_CN from '@/locales/zh_CN'
import en_US from '@/locales/en_US'
import el_en from 'element-plus/es/locale/lang/en'
import el_zhCn from 'element-plus/es/locale/lang/zh-cn'
import { LanguageCode } from '@/systemConfig'

/**
 * 获取当前语言
 * 从 useLayout 状态中获取,默认中文
 */
export const getLanguage = (): LanguageCode => {
  const layout = useLayout()
  if (layout.language.value) {
    return layout.language.value
  }
  return LanguageCode.zh_CN
}

/**
 * 创建 i18n 实例
 */
const i18n = createI18n({
  globalInjection: true,      // 全局注入 $t, $d 等方法
  allowComposition: true,     // 允许组合式 API
  legacy: false,              // 使用 Composition API 模式
  locale: getLanguage(),      // 设置当前语言
  messages: {
    zh_CN: {
      ...zh_CN,
      ...el_zhCn  // 合并 Element Plus 中文包
    },
    en_US: {
      ...en_US,
      ...el_en   // 合并 Element Plus 英文包
    }
  }
})

export default i18n
export type LanguageType = typeof zh_CN
```

### Element Plus 语言集成

项目将 Element Plus 的语言包合并到统一的 i18n 配置中,确保组件库语言与应用语言同步:

```typescript
// 语言包合并示例
messages: {
  zh_CN: {
    ...zh_CN,           // 应用语言包
    ...el_zhCn          // Element Plus 中文包
  },
  en_US: {
    ...en_US,           // 应用语言包
    ...el_en            // Element Plus 英文包
  }
}
```

这样设置后,Element Plus 的日期选择器、分页器、表格等组件会自动使用对应语言的文本。

## 翻译函数详解

### 六种翻译模式

`t` 函数是 `useI18n` 的核心,支持六种不同的翻译模式:

#### 模式一: 传统 i18n 键翻译

最基础的翻译方式,通过键名查找语言包中的翻译:

```vue
<template>
  <div>
    <h1>{{ t('navbar.language') }}</h1>
    <p>{{ t('message.success') }}</p>
    <el-button>{{ t('button.save') }}</el-button>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
```

**工作原理:**

```typescript
// 源码实现
if (vueI18n.te(key)) {
  return vueI18n.t(key)
}
```

#### 模式二: 简单用法 (英文, 中文)

最简洁的国际化方式,第一个参数是英文,第二个参数是中文:

```vue
<template>
  <el-form>
    <el-form-item :label="t('UserName', '用户名')">
      <el-input v-model="form.userName" />
    </el-form-item>
    <el-form-item :label="t('Password', '密码')">
      <el-input type="password" v-model="form.password" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const { t } = useI18n()

const form = reactive({
  userName: '',
  password: ''
})
</script>
```

**工作原理:**

```typescript
// 源码实现
if (typeof fieldInfoOrValue === 'string') {
  const currentLang = currentLanguage.value

  // 中文环境返回第二个参数
  if (currentLang === LanguageCode.zh_CN) {
    return fieldInfoOrValue  // '用户名'
  }
  // 英文环境返回第一个参数
  else {
    return key  // 'UserName'
  }
}
```

#### 模式三: 只使用字段名 (field)

适用于代码生成器生成的表格列,字段名通常是英文:

```vue
<template>
  <el-table :data="tableData">
    <el-table-column :label="t('', { field: 'UserName' })" prop="userName" />
    <el-table-column :label="t('', { field: 'Email' })" prop="email" />
    <el-table-column :label="t('', { field: 'CreateTime' })" prop="createTime" />
  </el-table>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
```

**显示效果:**

- 英文环境: `UserName`、`Email`、`CreateTime`
- 中文环境: `UserName`、`Email`、`CreateTime` (无中文备注时显示字段名)

#### 模式四: 只使用备注 (comment)

适用于只有中文说明的场景:

```vue
<template>
  <el-descriptions>
    <el-descriptions-item :label="t('', { comment: '用户名' })">
      {{ userInfo.userName }}
    </el-descriptions-item>
    <el-descriptions-item :label="t('', { comment: '创建时间' })">
      {{ userInfo.createTime }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
```

**显示效果:**

- 英文环境: `用户名`、`创建时间` (无英文时显示备注)
- 中文环境: `用户名`、`创建时间`

#### 模式五: 字段名 + 备注组合

推荐方式,同时提供英文字段名和中文备注:

```vue
<template>
  <el-table :data="tableData">
    <el-table-column
      :label="t('', { field: 'UserName', comment: '用户名' })"
      prop="userName"
    />
    <el-table-column
      :label="t('', { field: 'Email', comment: '邮箱地址' })"
      prop="email"
    />
    <el-table-column
      :label="t('', { field: 'CreateTime', comment: '创建时间' })"
      prop="createTime"
    />
  </el-table>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
```

**显示效果:**

- 英文环境: `UserName`、`Email`、`CreateTime`
- 中文环境: `用户名`、`邮箱地址`、`创建时间`

#### 模式六: 语言映射对象

最灵活的方式,可以为每种语言指定不同的翻译:

```vue
<template>
  <el-table :data="tableData">
    <el-table-column
      :label="t('', {
        [LanguageCode.zh_CN]: '用户名称',
        [LanguageCode.en_US]: 'User Name'
      })"
      prop="userName"
    />
    <el-table-column
      :label="t('', {
        field: 'Status',
        comment: '状态',
        [LanguageCode.zh_CN]: '用户状态',
        [LanguageCode.en_US]: 'User Status'
      })"
      prop="status"
    />
  </el-table>
</template>

<script setup lang="ts">
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()
</script>
```

**显示效果:**

- 英文环境: `User Name`、`User Status`
- 中文环境: `用户名称`、`用户状态`

### 翻译优先级

`t` 函数内部实现了多层次的降级策略:

```
优先级1: 当前语言映射
    ↓ (不存在)
优先级2: 根据语言使用 field/comment
    ↓ (不存在)
优先级3: 降级策略
    ↓ (不存在)
优先级4: 使用任何可用翻译
    ↓ (不存在)
优先级5: 使用 Vue I18n 翻译
    ↓ (不存在)
优先级6: 返回键名本身
```

**源码实现:**

```typescript
const t = (key, fieldInfoOrValue) => {
  // 简单用法处理
  if (typeof fieldInfoOrValue === 'string') {
    return currentLanguage.value === LanguageCode.zh_CN
      ? fieldInfoOrValue
      : key
  }

  if (fieldInfoOrValue) {
    const fieldInfo = fieldInfoOrValue
    const currentLang = currentLanguage.value

    // 优先级1: 当前语言映射
    if (fieldInfo[currentLang]) {
      return fieldInfo[currentLang]
    }

    // 优先级2: 根据语言选择 field 或 comment
    if (currentLang === LanguageCode.zh_CN) {
      if (fieldInfo.comment) return fieldInfo.comment
    } else {
      if (fieldInfo.field) return fieldInfo.field
    }

    // 优先级3: 降级策略
    if (currentLang === LanguageCode.zh_CN) {
      if (fieldInfo.field) return fieldInfo.field
      if (fieldInfo[LanguageCode.en_US]) return fieldInfo[LanguageCode.en_US]
    } else {
      if (fieldInfo.comment) return fieldInfo.comment
      if (fieldInfo[LanguageCode.zh_CN]) return fieldInfo[LanguageCode.zh_CN]
    }

    // 优先级4: 任何可用翻译
    const values = Object.entries(fieldInfo)
      .filter(([key, value]) => key !== 'field' && key !== 'comment' && value)
      .map(([_, value]) => value)
    if (values.length > 0) return values[0]
  }

  // 优先级5: Vue I18n 翻译
  if (vueI18n.te(key)) {
    return vueI18n.t(key)
  }

  // 按钮键降级处理
  if (key.startsWith('button.') && key.split('.').length > 2) {
    const action = key.split('.').pop()
    const genericKey = `button.${action}`
    if (vueI18n.te(genericKey)) return vueI18n.t(genericKey)
  }

  // 优先级6: 返回键名
  return key
}
```

### 按钮键降级机制

对于按钮翻译键,实现了特殊的降级逻辑:

```typescript
// 具体按钮键: button.system.user.add
// 降级到通用按钮键: button.add

if (key.startsWith('button.') && key.split('.').length > 2) {
  const parts = key.split('.')
  const action = parts[parts.length - 1]  // 'add'
  const genericButtonKey = `button.${action}`  // 'button.add'

  if (vueI18n.te(genericButtonKey)) {
    return vueI18n.t(genericButtonKey)
  }
}
```

这样可以避免为每个模块的每个按钮都定义翻译键。

## 语言管理

### setLanguage 设置语言

`setLanguage` 方法用于切换应用语言:

```typescript
/**
 * 设置语言
 * @param lang 语言代码
 * @returns 是否设置成功
 */
const setLanguage = (lang: LanguageCode): boolean => {
  if (vueI18n.availableLocales.includes(lang)) {
    // 1. 设置 Vue I18n 的 locale
    vueI18n.locale.value = lang

    // 2. 同步到布局状态管理 (持久化)
    layout.changeLanguage(lang)

    // 3. 更新 HTML 的 lang 属性
    document.querySelector('html')?.setAttribute('lang', lang)

    return true
  }
  console.warn(`Language ${lang} is not available`)
  return false
}
```

**使用示例:**

```vue
<template>
  <el-dropdown @command="handleLanguageChange">
    <span>{{ currentLanguageName }}</span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :disabled="isChinese" command="zh_CN">
          中文
        </el-dropdown-item>
        <el-dropdown-item :disabled="isEnglish" command="en_US">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { LanguageCode } from '@/systemConfig'
import { showMsgSuccess } from '@/utils/modal'

const { setLanguage, currentLanguageName, isChinese, isEnglish } = useI18n()

const messages = {
  [LanguageCode.zh_CN]: '切换语言成功！',
  [LanguageCode.en_US]: 'Switch Language Successful!'
}

const handleLanguageChange = (lang: LanguageCode) => {
  setLanguage(lang)
  showMsgSuccess(messages[lang])
}
</script>
```

### initLanguage 初始化语言

`initLanguage` 方法在应用启动时调用,确保语言设置同步:

```typescript
/**
 * 初始化语言设置
 * 确保 Vue I18n 的 locale 与应用状态同步
 */
const initLanguage = () => {
  // 使用布局状态管理中保存的语言
  vueI18n.locale.value = layout.language.value
  document.querySelector('html')?.setAttribute('lang', layout.language.value)
}
```

**应用启动时调用:**

```typescript
// main.ts 或 App.vue
const { initLanguage } = useI18n()
initLanguage()
```

### 语言持久化

语言设置通过 `useLayout` Composable 持久化到 localStorage:

```typescript
// useLayout 中的语言管理
const language = useLocalStorage<LanguageCode>(
  'app-language',
  LanguageCode.zh_CN
)

const changeLanguage = (lang: LanguageCode) => {
  language.value = lang
}
```

用户刷新页面后,语言设置会自动恢复。

## 语言状态查询

### currentLanguage 当前语言

响应式的当前语言代码:

```typescript
const currentLanguage = layout.language  // ComputedRef<LanguageCode>
```

**使用示例:**

```vue
<script setup lang="ts">
const { currentLanguage } = useI18n()

// 响应式监听语言变化
watch(currentLanguage, (newLang, oldLang) => {
  console.log(`语言从 ${oldLang} 切换到 ${newLang}`)
  // 执行语言变化后的逻辑
})

// 根据语言执行不同逻辑
const fetchData = () => {
  const apiLang = currentLanguage.value === 'zh_CN' ? 'zh' : 'en'
  api.getData({ lang: apiLang })
}
</script>
```

### currentLanguageName 当前语言名称

返回当前语言的显示名称:

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

**使用示例:**

```vue
<template>
  <div class="language-display">
    当前语言: {{ currentLanguageName }}
  </div>
</template>

<script setup lang="ts">
const { currentLanguageName } = useI18n()
</script>
```

### isChinese / isEnglish 语言判断

便捷的语言环境判断:

```typescript
const isChinese = computed(() => currentLanguage.value === LanguageCode.zh_CN)
const isEnglish = computed(() => currentLanguage.value === LanguageCode.en_US)
```

**使用示例:**

```vue
<template>
  <div>
    <!-- 根据语言显示不同内容 -->
    <img v-if="isChinese" src="/logo-cn.png" alt="Logo" />
    <img v-else src="/logo-en.png" alt="Logo" />

    <!-- 条件渲染 -->
    <div v-if="isChinese" class="chinese-tip">
      温馨提示：请使用中文输入
    </div>

    <!-- 动态样式 -->
    <div :class="{ 'text-vertical': isChinese }">
      {{ content }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { isChinese, isEnglish } = useI18n()

// 计算属性中使用
const welcomeMessage = computed(() => {
  return isChinese.value ? '欢迎使用系统' : 'Welcome to the System'
})
</script>
```

### languages 可用语言列表

返回所有可用的语言代码列表:

```typescript
const languages = computed(() => vueI18n.availableLocales)
// ['zh_CN', 'en_US']
```

**使用示例:**

```vue
<template>
  <el-select v-model="selectedLang" @change="handleChange">
    <el-option
      v-for="lang in languages"
      :key="lang"
      :label="getLangName(lang)"
      :value="lang"
    />
  </el-select>
</template>

<script setup lang="ts">
const { languages, currentLanguage, setLanguage } = useI18n()

const selectedLang = ref(currentLanguage.value)

const getLangName = (code: string) => {
  const names: Record<string, string> = {
    zh_CN: '简体中文',
    en_US: 'English'
  }
  return names[code] || code
}

const handleChange = (lang: LanguageCode) => {
  setLanguage(lang)
}
</script>
```

## Vue I18n 原生功能

`useI18n` 完全保留了 Vue I18n 的原生 API:

### 日期格式化 (d)

```vue
<template>
  <div>
    <!-- 短日期 -->
    <p>{{ d(new Date(), 'short') }}</p>
    <!-- 长日期 -->
    <p>{{ d(new Date(), 'long') }}</p>
  </div>
</template>

<script setup lang="ts">
const { d } = useI18n()
</script>
```

### 数字格式化 (n)

```vue
<template>
  <div>
    <!-- 货币格式 -->
    <p>{{ n(1234.56, 'currency') }}</p>
    <!-- 百分比格式 -->
    <p>{{ n(0.85, 'percent') }}</p>
  </div>
</template>

<script setup lang="ts">
const { n } = useI18n()
</script>
```

### 检查翻译键是否存在 (te)

```vue
<script setup lang="ts">
const { te, t } = useI18n()

// 安全翻译
const safeTranslate = (key: string, fallback: string) => {
  return te(key) ? t(key) : fallback
}

// 使用
const title = safeTranslate('custom.title', '默认标题')
</script>
```

### 获取翻译消息对象 (tm)

```vue
<script setup lang="ts">
const { tm } = useI18n()

// 获取整个消息对象
const loginMessages = tm('login')
console.log(loginMessages.userName)  // '用户名'
console.log(loginMessages.password)  // '密码'
</script>
```

### 运行时翻译 (rt)

```vue
<script setup lang="ts">
const { rt, tm } = useI18n()

// 获取消息对象后进行翻译
const message = tm('message')
const successText = rt(message.success)
</script>
```

## 路由标题翻译

### translateRouteTitle 函数

独立导出的路由标题翻译函数:

```typescript
/**
 * 翻译路由标题
 * @param title 路由标题或翻译键
 * @returns 翻译后的标题
 */
export const translateRouteTitle = (title: string): string => {
  if (!title) return ''

  const routeKey = `route.${title}` as ObjKeysToUnion<LanguageType>
  const hasKey = i18n.global.te(routeKey)
  if (hasKey) {
    return i18n.global.t(routeKey)
  }

  return title
}
```

**使用场景:**

```vue
<template>
  <!-- 面包屑导航 -->
  <el-breadcrumb>
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      {{ translateRouteTitle(item.meta.title) }}
    </el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 页签标题 -->
  <div class="tags-view">
    <router-link v-for="tag in visitedViews" :key="tag.path" :to="tag">
      {{ translateRouteTitle(tag.title) }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { translateRouteTitle } from '@/composables/useI18n'
</script>
```

### 路由配置

在路由元信息中配置标题:

```typescript
// router/routes.ts
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      title: 'dashboard'  // 对应 route.dashboard
    }
  },
  {
    path: '/system/user',
    component: User,
    meta: {
      title: 'system.user'  // 对应 menu.system.user
    }
  }
]
```

## 实际应用场景

### 表格列国际化

代码生成器生成的表格通常需要快速国际化:

```vue
<template>
  <el-table :data="tableData">
    <el-table-column type="selection" width="55" />
    <el-table-column
      :label="t('', { field: 'Id', comment: '编号' })"
      prop="id"
      width="80"
    />
    <el-table-column
      :label="t('', { field: 'UserName', comment: '用户名' })"
      prop="userName"
    />
    <el-table-column
      :label="t('', { field: 'NickName', comment: '昵称' })"
      prop="nickName"
    />
    <el-table-column
      :label="t('', { field: 'Email', comment: '邮箱' })"
      prop="email"
    />
    <el-table-column
      :label="t('', { field: 'Phone', comment: '手机号' })"
      prop="phone"
    />
    <el-table-column
      :label="t('', { field: 'Status', comment: '状态' })"
      prop="status"
    >
      <template #default="{ row }">
        <el-tag :type="row.status === '0' ? 'success' : 'danger'">
          {{ row.status === '0' ? t('启用', 'Enable') : t('停用', 'Disable') }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column :label="t('操作', 'Operation')" width="180">
      <template #default="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">
          {{ t('button.update') }}
        </el-button>
        <el-button type="danger" link @click="handleDelete(row)">
          {{ t('button.delete') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
```

### 表单标签国际化

```vue
<template>
  <el-form :model="form" :rules="rules" label-width="100px">
    <el-form-item :label="t('UserName', '用户名')" prop="userName">
      <el-input
        v-model="form.userName"
        :placeholder="t('placeholder.input') + t('UserName', '用户名')"
      />
    </el-form-item>

    <el-form-item :label="t('Password', '密码')" prop="password">
      <el-input
        type="password"
        v-model="form.password"
        :placeholder="t('placeholder.input') + t('Password', '密码')"
      />
    </el-form-item>

    <el-form-item :label="t('Email', '邮箱')" prop="email">
      <el-input
        v-model="form.email"
        :placeholder="t('placeholder.input') + t('Email', '邮箱')"
      />
    </el-form-item>

    <el-form-item :label="t('', { field: 'Department', comment: '部门' })" prop="deptId">
      <el-tree-select
        v-model="form.deptId"
        :data="deptOptions"
        :placeholder="t('placeholder.select') + t('Department', '部门')"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        {{ t('button.confirm') }}
      </el-button>
      <el-button @click="handleCancel">
        {{ t('button.cancel') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const { t } = useI18n()

const form = reactive({
  userName: '',
  password: '',
  email: '',
  deptId: undefined
})

const rules = {
  userName: [
    { required: true, message: t('login.rule.userName.required'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.rule.password.required'), trigger: 'blur' }
  ]
}
</script>
```

### 导航栏语言切换

完整的语言切换组件实现:

```vue
<template>
  <el-tooltip
    :content="showTooltip ? t('navbar.language') : ''"
    :disabled="!showTooltip"
    effect="dark"
    placement="bottom"
  >
    <div :class="containerClass">
      <el-dropdown trigger="hover" @command="handleLanguageChange">
        <div :class="triggerClass">
          <Icon code="globe" :size="iconSize" :animate="iconAnimate" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :disabled="isChinese" command="zh_CN">
              中文
            </el-dropdown-item>
            <el-dropdown-item :disabled="isEnglish" command="en_US">
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
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

const containerClass = computed(() =>
  props.showBackground ? 'flex-center h-full px-1' : ''
)

const triggerClass = computed(() =>
  props.showBackground
    ? 'navbar-tool-item flex-center w-9 h-9 rounded-2 cursor-pointer'
    : 'simple-trigger'
)

const iconSize = computed(() => props.showBackground ? 'md' : '20px')

const messages = {
  [LanguageCode.zh_CN]: '切换语言成功！',
  [LanguageCode.en_US]: 'Switch Language Successful!'
}

const handleLanguageChange = (lang: LanguageCode) => {
  setLanguage(lang)
  showMsgSuccess(messages[lang])
}
</script>
```

### 消息提示国际化

```typescript
import { showMsgSuccess, showMsgError, showConfirm } from '@/utils/modal'

const { t } = useI18n()

// 操作成功提示
const handleSave = async () => {
  await api.save(form)
  showMsgSuccess(t('message.saveSuccess'))
}

// 操作失败提示
const handleError = (error: Error) => {
  showMsgError(t('message.error') + ': ' + error.message)
}

// 确认对话框
const handleDelete = async (row: any) => {
  await showConfirm(
    t('message.confirmDelete') + row.userName,
    t('message.confirm')
  )
  await api.delete(row.id)
  showMsgSuccess(t('message.deleteSuccess'))
}
```

### 动态列配置

结合表格列设置功能:

```vue
<template>
  <el-table :data="tableData">
    <el-table-column
      v-for="column in visibleColumns"
      :key="column.prop"
      :prop="column.prop"
      :label="t('', column.label)"
      :width="column.width"
    />
  </el-table>
</template>

<script setup lang="ts">
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()

// 列配置
const columns = ref([
  {
    prop: 'userName',
    label: {
      field: 'UserName',
      comment: '用户名',
      [LanguageCode.zh_CN]: '用户名称',
      [LanguageCode.en_US]: 'User Name'
    },
    width: 120,
    visible: true
  },
  {
    prop: 'email',
    label: {
      field: 'Email',
      comment: '邮箱地址'
    },
    width: 180,
    visible: true
  },
  {
    prop: 'createTime',
    label: {
      field: 'CreateTime',
      comment: '创建时间'
    },
    width: 160,
    visible: true
  }
])

// 可见列
const visibleColumns = computed(() =>
  columns.value.filter(col => col.visible)
)
</script>
```

## API 参考

### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `t` | `(key, fieldInfoOrValue?) => string` | 增强的翻译函数 |
| `locale` | `Ref<string>` | 当前语言 (Vue I18n) |
| `availableLocales` | `string[]` | 可用语言列表 |
| `fallbackLocale` | `Ref<string>` | 备用语言 |
| `messages` | `ComputedRef<Messages>` | 所有语言消息 |
| `d` | `DateTimeFormat` | 日期格式化 |
| `n` | `NumberFormat` | 数字格式化 |
| `rt` | `RuntimeTranslate` | 运行时翻译 |
| `te` | `TranslationExists` | 检查翻译键存在 |
| `tm` | `TranslationMessage` | 获取翻译消息对象 |
| `currentLanguage` | `ComputedRef<LanguageCode>` | 当前语言代码 |
| `currentLanguageName` | `ComputedRef<string>` | 当前语言显示名称 |
| `languages` | `ComputedRef<string[]>` | 可用语言列表 (别名) |
| `isChinese` | `ComputedRef<boolean>` | 是否中文环境 |
| `isEnglish` | `ComputedRef<boolean>` | 是否英文环境 |
| `setLanguage` | `(lang: LanguageCode) => boolean` | 设置语言 |
| `initLanguage` | `() => void` | 初始化语言设置 |
| `translateRouteTitle` | `(title: string) => string` | 翻译路由标题 |

### t 函数参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | `string` | 是 | 翻译键名或英文内容 |
| `fieldInfoOrValue` | `FieldInfo \| string` | 否 | 字段信息对象或中文值 |

**FieldInfo 对象:**

| 属性 | 类型 | 说明 |
|------|------|------|
| `field` | `string` | 英文字段名 |
| `comment` | `string` | 中文备注 |
| `[LanguageCode.zh_CN]` | `string` | 中文翻译 |
| `[LanguageCode.en_US]` | `string` | 英文翻译 |

### setLanguage 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `lang` | `LanguageCode` | 语言代码 (`zh_CN` 或 `en_US`) |

**返回值:** `boolean` - 是否设置成功

## 类型定义

### LanguageCode 枚举

```typescript
// src/systemConfig.ts
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US'
}
```

### LanguageType 类型

```typescript
// src/locales/i18n.ts
export type LanguageType = typeof zh_CN
```

### ObjKeysToUnion 类型工具

递归提取对象键名为联合类型:

```typescript
/**
 * 对象键名转联合类型
 * { a: 1, b: { ba: 1, bb: 2} } ---> 'a' | 'b.ba' | 'b.bb'
 */
export type ObjKeysToUnion<T, Depth extends number[] = [0, 1, 2, 3]> =
  Depth['length'] extends 4
    ? never
    : T extends object
      ? {
          [K in keyof T]: `${K & string}${
            T[K] extends object
              ? `.${ObjKeysToUnion<T[K], [...Depth, 0]>}`
              : ''
          }`
        }[keyof T]
      : never
```

### FieldInfo 接口

```typescript
interface FieldInfo {
  /** 英文字段名 (非中文环境优先使用) */
  field?: string
  /** 中文备注 (中文环境优先使用) */
  comment?: string
  /** 语言特定翻译 */
  [key: LanguageCode]: string
}
```

### useI18n 返回类型

```typescript
interface UseI18nReturn {
  // 增强翻译函数
  t: (
    key: ObjKeysToUnion<LanguageType> | string,
    fieldInfoOrValue?: FieldInfo | string
  ) => string

  // Vue I18n 原生属性
  locale: Ref<string>
  availableLocales: string[]
  fallbackLocale: Ref<string | string[]>
  messages: ComputedRef<LocaleMessages<VueMessageType>>

  // Vue I18n 格式化方法
  d: DateTimeFormatFunction
  n: NumberFormatFunction
  rt: RuntimeTranslationFunction
  te: TranslationExistsFunction
  tm: TranslationMessageFunction

  // 扩展状态
  currentLanguage: ComputedRef<LanguageCode>
  currentLanguageName: ComputedRef<string>
  languages: ComputedRef<string[]>
  isChinese: ComputedRef<boolean>
  isEnglish: ComputedRef<boolean>

  // 扩展方法
  setLanguage: (lang: LanguageCode) => boolean
  initLanguage: () => void
  translateRouteTitle: (title: string) => string
}
```

## 最佳实践

### 1. 优先使用简单用法

对于简单的双语翻译,使用简单用法最清晰:

```typescript
// ✅ 推荐
t('UserName', '用户名')
t('Save', '保存')
t('Delete', '删除')

// ❌ 不推荐 (过于复杂)
t('', {
  [LanguageCode.zh_CN]: '用户名',
  [LanguageCode.en_US]: 'UserName'
})
```

### 2. 表格列使用字段信息对象

代码生成器生成的表格列推荐使用字段信息对象:

```typescript
// ✅ 推荐
t('', { field: 'UserName', comment: '用户名' })

// ❌ 不推荐 (需要维护语言包)
t('system.user.userName')
```

### 3. 按钮使用统一键名

按钮翻译使用 `button.xxx` 格式:

```typescript
// ✅ 推荐
t('button.add')
t('button.update')
t('button.delete')

// ❌ 不推荐 (重复定义)
t('system.user.button.add')
t('system.role.button.add')
```

### 4. 消息提示使用语言包

操作消息使用 `message.xxx` 格式:

```typescript
// ✅ 推荐
showMsgSuccess(t('message.saveSuccess'))
showMsgError(t('message.deleteError'))

// ❌ 不推荐 (硬编码)
showMsgSuccess('保存成功')
```

### 5. 监听语言变化

需要响应语言变化时,使用 watch:

```typescript
const { currentLanguage } = useI18n()

watch(currentLanguage, (newLang) => {
  // 重新加载数据
  fetchData()
  // 更新图表语言
  updateChartLocale(newLang)
})
```

### 6. 类型安全使用

利用 TypeScript 获得翻译键提示:

```typescript
const { t } = useI18n()

// 有类型提示
t('button.add')      // ✅ 自动补全
t('message.success') // ✅ 自动补全
t('nonexistent')     // ⚠️ 无提示,但仍可使用
```

### 7. 组件内解构使用

在组件中按需解构:

```typescript
// ✅ 推荐 - 按需解构
const { t, isChinese, setLanguage } = useI18n()

// ❌ 不推荐 - 解构所有
const i18n = useI18n()
```

### 8. 避免在模板中使用复杂表达式

复杂翻译逻辑放到 script 中:

```typescript
// ✅ 推荐
const statusText = computed(() => {
  return row.status === '0'
    ? t('启用', 'Enable')
    : t('停用', 'Disable')
})

// ❌ 不推荐 (模板中逻辑复杂)
// <span>{{ row.status === '0' ? t('启用', 'Enable') : t('停用', 'Disable') }}</span>
```

## 常见问题

### 1. 语言切换后页面未更新

**问题描述:** 切换语言后,部分文本没有更新。

**原因分析:**
- 使用了非响应式的翻译结果
- 组件没有正确使用 `computed`

**解决方案:**

```typescript
// ❌ 错误 - 非响应式
const title = t('navbar.language')

// ✅ 正确 - 使用 computed
const title = computed(() => t('navbar.language'))
```

### 2. 翻译键没有自动补全

**问题描述:** 在编辑器中输入翻译键时没有自动补全提示。

**原因分析:**
- 语言包类型定义不完整
- 编辑器 TypeScript 配置问题

**解决方案:**

```typescript
// 确保语言包导出类型
// src/locales/i18n.ts
export type LanguageType = typeof zh_CN

// 在组件中使用类型
const { t } = useI18n()
t('button.add')  // 应该有自动补全
```

### 3. Element Plus 组件语言未同步

**问题描述:** Element Plus 的日期选择器、分页器等组件语言与应用不一致。

**原因分析:**
- 语言包合并顺序错误
- 未使用 `setLanguage` 方法

**解决方案:**

```typescript
// 确保正确合并语言包
messages: {
  zh_CN: {
    ...zh_CN,
    ...el_zhCn  // Element Plus 中文包
  }
}

// 使用 setLanguage 切换语言
const { setLanguage } = useI18n()
setLanguage(LanguageCode.en_US)
```

### 4. 路由标题翻译无效

**问题描述:** 面包屑或页签的路由标题没有翻译。

**原因分析:**
- 路由 meta.title 格式不正确
- 语言包中缺少对应键

**解决方案:**

```typescript
// 路由配置
{
  path: '/system/user',
  meta: {
    title: 'system.user'  // 对应 menu.system.user
  }
}

// 语言包配置
menu: {
  system: {
    user: '用户管理'
  }
}
```

### 5. 刷新页面语言重置

**问题描述:** 刷新页面后语言设置丢失。

**原因分析:**
- `initLanguage` 未在应用启动时调用
- `useLayout` 持久化配置问题

**解决方案:**

```typescript
// main.ts 或 App.vue
import { useI18n } from '@/composables/useI18n'

const { initLanguage } = useI18n()

// 在应用启动时初始化
onMounted(() => {
  initLanguage()
})
```

### 6. 字段信息翻译返回空

**问题描述:** 使用字段信息对象时返回空字符串。

**原因分析:**
- 字段信息对象为空
- 所有属性都是 undefined

**解决方案:**

```typescript
// 确保至少提供一个有效属性
t('', { field: 'UserName' })  // ✅ 有 field
t('', { comment: '用户名' })   // ✅ 有 comment
t('', {})                      // ❌ 返回空键名 ''
```

### 7. 翻译函数在非组件中使用

**问题描述:** 在 utils 或 api 文件中无法使用 `useI18n`。

**原因分析:**
- Composable 只能在组件 setup 或其他 Composable 中使用

**解决方案:**

```typescript
// 使用 i18n 实例直接访问
import i18n from '@/locales/i18n'

// 在非组件中
const translate = (key: string) => {
  return i18n.global.t(key)
}

// 或使用 translateRouteTitle
import { translateRouteTitle } from '@/composables/useI18n'
const title = translateRouteTitle('dashboard')
```

### 8. 动态翻译键性能问题

**问题描述:** 大量动态翻译键导致性能下降。

**原因分析:**
- 每次渲染都重新计算翻译
- 未使用缓存

**解决方案:**

```typescript
// 使用 computed 缓存翻译结果
const translatedColumns = computed(() => {
  return columns.value.map(col => ({
    ...col,
    label: t('', col.label)
  }))
})

// 避免在 v-for 中直接调用 t 函数
// ❌ 每次渲染都调用
<el-table-column
  v-for="col in columns"
  :label="t('', col.label)"
/>

// ✅ 使用预计算结果
<el-table-column
  v-for="col in translatedColumns"
  :label="col.label"
/>
```

## 性能优化

### 1. 翻译结果缓存

对于频繁使用的翻译,使用 `computed` 缓存:

```typescript
// 缓存固定翻译
const buttonLabels = computed(() => ({
  add: t('button.add'),
  update: t('button.update'),
  delete: t('button.delete'),
  export: t('button.export')
}))
```

### 2. 批量翻译优化

对于表格列等批量翻译场景:

```typescript
// 预计算列配置
const columnConfig = computed(() => {
  return rawColumns.map(col => ({
    ...col,
    label: t('', col.labelInfo)
  }))
})
```

### 3. 语言切换防抖

避免快速切换语言导致的性能问题:

```typescript
import { useDebounceFn } from '@vueuse/core'

const { setLanguage } = useI18n()

const debouncedSetLanguage = useDebounceFn((lang: LanguageCode) => {
  setLanguage(lang)
}, 300)
```

### 4. 按需加载语言包

对于大型应用,可以按需加载语言包:

```typescript
// 动态导入语言包
const loadLanguage = async (lang: LanguageCode) => {
  const messages = await import(`@/locales/${lang}.ts`)
  i18n.global.setLocaleMessage(lang, messages.default)
}
```

## 扩展指南

### 添加新语言

1. 创建语言包文件:

```typescript
// src/locales/ja_JP.ts
export default {
  '操作': '操作',
  '新增': '追加',
  '修改': '編集',
  // ... 其他翻译
}
```

2. 更新 i18n 配置:

```typescript
// src/locales/i18n.ts
import ja_JP from '@/locales/ja_JP'
import el_ja from 'element-plus/es/locale/lang/ja'

const i18n = createI18n({
  messages: {
    zh_CN: { ...zh_CN, ...el_zhCn },
    en_US: { ...en_US, ...el_en },
    ja_JP: { ...ja_JP, ...el_ja }  // 新增日语
  }
})
```

3. 更新语言代码枚举:

```typescript
// src/systemConfig.ts
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US',
  ja_JP = 'ja_JP'  // 新增日语
}
```

4. 更新语言名称映射:

```typescript
// useI18n.ts
const currentLanguageName = computed(() => {
  switch (currentLanguage.value) {
    case LanguageCode.zh_CN:
      return '简体中文'
    case LanguageCode.en_US:
      return 'English'
    case LanguageCode.ja_JP:
      return '日本語'
    default:
      return currentLanguage.value
  }
})
```

### 自定义翻译降级策略

可以扩展翻译函数的降级逻辑:

```typescript
// 自定义翻译函数
const customT = (key: string, options?: FieldInfo) => {
  // 先尝试自定义翻译
  const customTranslation = getCustomTranslation(key)
  if (customTranslation) return customTranslation

  // 降级到标准翻译
  return t(key, options)
}
```

### 集成第三方翻译服务

可以扩展支持在线翻译:

```typescript
const translateOnline = async (text: string, targetLang: string) => {
  // 调用翻译 API
  const response = await fetch(`/api/translate`, {
    method: 'POST',
    body: JSON.stringify({ text, targetLang })
  })
  return response.json()
}
```
