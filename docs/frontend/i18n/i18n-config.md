# 国际化配置

## 介绍

RuoYi-Plus-UniApp 前端项目采用 Vue I18n 作为国际化解决方案,提供完整的多语言支持能力。系统内置中文(zh_CN)和英文(en_US)两种语言,并深度集成了 Element Plus 组件库的国际化支持,确保整个应用的语言切换一致性。

国际化配置基于 Vue I18n v9+ 版本,采用 Composition API 模式,支持全局注入、动态语言切换、类型安全的翻译键等现代化特性,为构建多语言应用提供了坚实的基础。

**核心特性:**

- **双语言支持** - 内置简体中文和英文两种语言,支持扩展更多语言
- **Composition API 模式** - 使用 Vue 3 Composition API,提供 `useI18n()` 钩子函数
- **全局注入** - `$t`、`$d` 等方法自动注入到模板中,无需手动导入
- **Element Plus 集成** - 完整集成 Element Plus 组件库的语言包
- **类型安全** - 完整的 TypeScript 类型定义,提供类型检查和自动补全
- **动态切换** - 支持运行时动态切换语言,无需刷新页面
- **本地持久化** - 用户选择的语言自动保存到本地存储
- **模块化组织** - 语言包按功能模块组织,便于维护和扩展

## 配置架构

### 目录结构

国际化相关文件组织在 `src/locales/` 目录下:

```
src/locales/
├── i18n.ts           # i18n 实例配置和导出
├── zh_CN.ts          # 中文语言包
└── en_US.ts          # 英文语言包
```

### 配置文件说明

#### i18n 实例配置 (i18n.ts)

这是国际化的核心配置文件,负责创建和配置 Vue I18n 实例:

```typescript
// src/locales/i18n.ts
import { createI18n } from 'vue-i18n'
import zh_CN from '@/locales/zh_CN'
import en_US from '@/locales/en_US'
// 引入 Element Plus 的语言包
import el_en from 'element-plus/es/locale/lang/en'
import el_zhCn from 'element-plus/es/locale/lang/zh-cn'
import { LanguageCode } from '@/systemConfig'

/**
 * 获取当前语言
 * 从本地存储中获取用户设置的语言,如果没有则使用默认语言(中文)
 * @returns 当前语言代码,如 zh_CN 或 en_US
 */
export const getLanguage = (): LanguageCode => {
  const layout = useLayout()

  // 如果存在有效的语言配置则返回,否则使用默认语言
  if (layout.language.value) {
    return layout.language.value
  }
  return LanguageCode.zh_CN
}

/**
 * 创建 i18n 实例
 * 配置国际化实例,设置默认语言和翻译消息
 */
const i18n = createI18n({
  globalInjection: true,      // 全局注入 $t, $d 等方法到模板中
  allowComposition: true,     // 允许组合式 API
  legacy: false,              // 使用 Vue 3 Composition API 模式
  locale: getLanguage(),      // 设置当前语言
  messages: {
    zh_CN: {
      ...zh_CN,
      ...el_zhCn              // Element Plus 中文语言包
    },
    en_US: {
      ...en_US,
      ...el_en                // Element Plus 英文语言包
    }
  }
})

export default i18n

// 导出语言包类型,用于类型检查和自动补全
export type LanguageType = typeof zh_CN
```

#### 中文语言包 (zh_CN.ts)

中文语言包定义了所有中文翻译文本,按功能模块组织:

```typescript
// src/locales/zh_CN.ts
export default {
  // 顶层通用翻译
  '操作': '操作',
  '新增': '新增',
  '修改': '修改',
  '删除': '删除',
  '导出': '导出',
  '导入': '导入',
  '确定': '确定',
  '取消': '取消',

  // 按钮权限系统
  button: {
    query: '查询',
    add: '新增',
    update: '修改',
    delete: '删除',
    export: '导出',
    import: '导入',
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    // ... 更多按钮翻译
  },

  // 对话框提示
  dialog: {
    add: '新增',
    edit: '修改',
    delete: '删除',
    query: '查询',
    detail: '详情',
    import: '导入',
    export: '导出',
    config: '配置'
  },

  // 消息提示
  message: {
    operation: '操作',
    confirmDelete: '是否确认删除下列数据:',
    confirmCancel: '是否确认取消操作?',
    success: '操作成功',
    error: '操作失败',
    saveSuccess: '保存成功',
    addSuccess: '新增成功',
    updateSuccess: '修改成功',
    deleteSuccess: '删除成功',
    // ... 更多消息翻译
  },

  // 占位符
  placeholder: {
    input: '请输入',
    select: '请选择'
  },

  // 工具提示
  tooltip: {
    showSearch: '显示搜索',
    hideSearch: '隐藏搜索',
    resetSearch: '重置搜索',
    refresh: '刷新',
    print: '打印',
    columns: '显示/隐藏列'
  },

  // 路由国际化
  route: {
    dashboard: '首页',
    document: '项目文档'
  },

  // 尺寸选项
  label: {
    large: '较大',
    default: '默认',
    small: '较小'
  },

  // 登录页面
  login: {
    selectPlaceholder: '请选择/输入公司名称',
    tenantId: '租户id',
    userName: '用户名',
    password: '密码',
    login: '登 录',
    logging: '登 录 中...',
    code: '验证码',
    rememberPassword: '记住我',
    switchRegisterPage: '立即注册',
    leftView: {
      title: '欢迎使用',
      subtitle: '简洁、高效、现代化的管理系统'
    },
    rule: {
      tenantId: { required: '请输入您的租户id' },
      userName: { required: '请输入您的账号' },
      password: { required: '请输入您的密码' },
      code: { required: '请输入验证码' }
    },
    social: {
      wechat_open: '微信开放平台',
      wechat_mp: '微信公众号',
      github: 'GitHub',
      gitee: 'Gitee'
      // ... 更多第三方登录方式
    }
  },

  // 注册页面
  register: {
    userName: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    register: '注 册',
    registering: '注 册 中...',
    registerSuccess: '恭喜你,您的账号 {userName} 注册成功!',
    hasAccount: '已有账号?',
    switchLoginPage: '立即登录',
    subtitle: '创建您的账户',
    rule: {
      userName: {
        required: '请输入您的账号',
        length: '用户账号长度必须介于 {min} 和 {max} 之间'
      },
      password: {
        required: '请输入您的密码',
        length: '用户密码长度必须介于 {min} 和 {max} 之间',
        pattern: '不能包含非法字符:{strings}'
      },
      confirmPassword: {
        required: '请再次输入您的密码',
        equalToPassword: '两次输入的密码不一致'
      }
    }
  },

  // 导航栏
  navbar: {
    searchMenu: '搜索菜单',
    full: '全屏',
    exitFull: '退出全屏',
    language: '语言',
    dashboard: '首页',
    document: '项目文档',
    message: '消息',
    git: '仓库地址',
    layoutSize: '布局大小',
    sizeChangeSuccess: '布局大小切换成功',
    selectTenant: '选择租户',
    layoutSetting: '布局设置',
    personalCenter: '个人中心',
    logout: '退出登录',
    aiChat: 'AI助手'
  },

  // 页签
  tagsView: {
    refresh: '刷新页面',
    closeCurrent: '关闭当前',
    closeOthers: '关闭其他',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '全部关闭'
  },

  // 菜单系统
  menu: {
    index: '首页',
    system: {
      _self: '系统管理',
      user: '用户管理',
      role: '角色管理',
      menu: '菜单管理',
      dept: '部门管理',
      post: '岗位管理',
      dict: '字典管理',
      config: '参数设置',
      notice: '通知公告',
      log: {
        _self: '日志管理',
        operLog: '操作日志',
        loginLog: '登录日志'
      },
      oss: '文件管理'
    },
    monitor: {
      _self: '系统监控',
      online: '在线用户',
      cache: '缓存监控',
      admin: 'admin监控',
      snailjob: '任务调度'
    },
    tool: {
      _self: '系统工具',
      gen: '代码生成'
    },
    tenant: {
      _self: '租户管理',
      tenant: '租户管理',
      tenantPackage: '租户套餐'
    },
    workflow: {
      _self: '工作流',
      category: '流程分类',
      processDefinition: '流程定义',
      monitor: {
        _self: '流程监控',
        processInstance: '流程实例',
        allTaskWaiting: '待办任务'
      }
    },
    task: {
      _self: '我的任务',
      myDocument: '我发起的',
      taskWaiting: '我的待办',
      allTaskWaiting: '待办任务',
      taskFinish: '我的已办',
      taskCopyList: '我的抄送'
    }
  }
}
```

#### 英文语言包 (en_US.ts)

英文语言包与中文语言包结构完全对应:

```typescript
// src/locales/en_US.ts
export default {
  '操作': 'Operation',
  '新增': 'Add',
  '修改': 'Edit',
  '删除': 'Delete',

  button: {
    query: 'Query',
    add: 'Add',
    update: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save'
    // ... 对应的英文翻译
  },

  message: {
    confirmDelete: 'Confirm delete the following:',
    success: 'Operation successful',
    error: 'Operation failed',
    saveSuccess: 'Save successful',
    addSuccess: 'Added successfully'
    // ... 对应的英文翻译
  },

  login: {
    userName: 'UserName',
    password: 'Password',
    login: 'Login',
    logging: 'Logging...',
    leftView: {
      title: 'Welcome',
      subtitle: 'Simple, Efficient, Modern Management System'
    }
    // ... 对应的英文翻译
  }

  // ... 其他模块的英文翻译
}
```

## 配置选项详解

### createI18n 配置参数

`createI18n` 函数接受一个配置对象,包含以下核心选项:

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `globalInjection` | `boolean` | `true` | 将 `$t`、`$d`、`$n` 等方法全局注入到组件模板中 |
| `allowComposition` | `boolean` | `true` | 允许使用 Composition API 的 `useI18n()` 钩子 |
| `legacy` | `boolean` | `false` | 设为 `false` 使用 Vue 3 Composition API 模式,`true` 使用 Vue 2 Options API 模式 |
| `locale` | `string` | `'zh_CN'` | 当前激活的语言代码 |
| `fallbackLocale` | `string` | `'zh_CN'` | 回退语言,当当前语言缺少翻译时使用 |
| `messages` | `object` | `{}` | 所有语言的翻译消息对象 |
| `datetimeFormats` | `object` | `{}` | 日期时间格式化配置 |
| `numberFormats` | `object` | `{}` | 数字格式化配置 |
| `modifiers` | `object` | `{}` | 自定义修饰符 |
| `missing` | `function` | - | 缺少翻译时的回调函数 |
| `silentTranslationWarn` | `boolean` | `false` | 是否静默缺少翻译的警告 |
| `silentFallbackWarn` | `boolean` | `false` | 是否静默回退警告 |

### 语言代码枚举

系统在 `src/systemConfig.ts` 中定义了语言代码枚举:

```typescript
// src/systemConfig.ts
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US'
}
```

这确保了类型安全,避免使用错误的语言代码。

### 获取当前语言

`getLanguage()` 函数从布局配置中获取用户选择的语言:

```typescript
export const getLanguage = (): LanguageCode => {
  const layout = useLayout()

  if (layout.language.value) {
    return layout.language.value
  }
  return LanguageCode.zh_CN  // 默认中文
}
```

工作流程:
1. 调用 `useLayout()` 获取布局配置
2. 检查 `layout.language.value` 是否存在
3. 如果存在,返回用户设置的语言
4. 否则返回默认语言 `zh_CN`

## 应用集成

### 在 Vue 应用中注册

在应用入口文件 `src/main.ts` 中注册 i18n 插件:

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import i18n from '@/locales/i18n'

const app = createApp(App)

// 注册国际化插件
app.use(i18n)

app.mount('#app')
```

注册后,i18n 的功能将在整个应用中可用。

### Element Plus 集成

项目同时注册了 Element Plus 组件库,并配置了国际化:

```typescript
// src/main.ts
import ElementPlus from 'element-plus'
import i18n from '@/locales/i18n'

// 创建 Element Plus 配置
const elementPlusConfig = computed(() => ({
  locale: i18n.global.locale.value === 'zh_CN' ? el_zhCn : el_en
}))

// 注册 Element Plus 并传入国际化配置
app.use(ElementPlus, elementPlusConfig.value)
```

这确保了 Element Plus 组件(如日期选择器、分页器等)的语言与应用保持一致。

## 语言包组织

### 模块化结构

语言包采用模块化组织方式,按功能领域划分:

```typescript
{
  // 顶层通用翻译
  '操作': 'Operation',
  '新增': 'Add',

  // 按钮模块
  button: {
    query: 'Query',
    add: 'Add'
  },

  // 对话框模块
  dialog: {
    add: 'Add',
    edit: 'Edit'
  },

  // 消息模块
  message: {
    success: 'Success'
  },

  // 登录模块
  login: {
    userName: 'UserName',
    // 嵌套的子模块
    leftView: {
      title: 'Welcome'
    },
    // 嵌套的验证规则
    rule: {
      userName: {
        required: 'Please enter username'
      }
    }
  },

  // 菜单模块
  menu: {
    system: {
      _self: 'System',
      user: 'Users',
      // 嵌套的子菜单
      log: {
        _self: 'Logs',
        operLog: 'Operation Log'
      }
    }
  }
}
```

### 命名约定

**翻译键命名规则:**

1. **顶层通用键**: 使用中文或简短英文,如 `'操作'`、`'新增'`
2. **模块键**: 使用小驼峰命名,如 `button`、`message`、`login`
3. **嵌套键**: 使用点号访问,如 `login.userName`、`menu.system.user`
4. **特殊标记**: 父级菜单使用 `_self` 标识自身名称

**示例:**

```typescript
// ✅ 推荐
button: {
  query: '查询',
  add: '新增'
}

login: {
  userName: '用户名',
  rule: {
    userName: {
      required: '请输入用户名'
    }
  }
}

menu: {
  system: {
    _self: '系统管理',
    user: '用户管理'
  }
}

// ❌ 不推荐
Button: {
  QUERY: '查询'
}

login_userName: '用户名'
```

### 动态参数支持

语言包支持在翻译文本中使用动态参数:

```typescript
// 中文语言包
register: {
  registerSuccess: '恭喜你,您的账号 {userName} 注册成功!',
  rule: {
    userName: {
      length: '用户账号长度必须介于 {min} 和 {max} 之间'
    },
    password: {
      pattern: '不能包含非法字符:{strings}'
    }
  }
}

// 英文语言包
register: {
  registerSuccess: 'Congratulations, your {userName} account has been registered!',
  rule: {
    userName: {
      length: 'The length of the user account must be between {min} and {max}'
    },
    password: {
      pattern: "Can't contain illegal characters: {strings}"
    }
  }
}
```

使用时传入参数:

```typescript
// 在组件中使用
const { t } = useI18n()

// 单个参数
t('register.registerSuccess', { userName: 'admin' })
// 输出: 恭喜你,您的账号 admin 注册成功!

// 多个参数
t('register.rule.userName.length', { min: 2, max: 20 })
// 输出: 用户账号长度必须介于 2 和 20 之间
```

## 使用方式

### 在模板中使用

#### 全局注入方式

由于配置了 `globalInjection: true`,可以直接在模板中使用 `$t`:

```vue
<template>
  <div>
    <!-- 简单翻译 -->
    <h1>{{ $t('login.userName') }}</h1>

    <!-- 嵌套键访问 -->
    <p>{{ $t('login.leftView.title') }}</p>

    <!-- 带参数的翻译 -->
    <span>{{ $t('register.registerSuccess', { userName: 'admin' }) }}</span>

    <!-- 在属性中使用 -->
    <el-input :placeholder="$t('placeholder.input') + $t('login.userName')" />

    <!-- 按钮文本 -->
    <el-button>{{ $t('button.confirm') }}</el-button>
    <el-button>{{ $t('button.cancel') }}</el-button>
  </div>
</template>
```

### 在脚本中使用

#### Composition API 方式

使用 `useI18n()` 钩子获取国际化功能:

```vue
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// 翻译文本
const title = t('login.userName')
const message = t('message.success')

// 带参数的翻译
const successMsg = t('register.registerSuccess', { userName: 'admin' })

// 访问当前语言
console.log('Current locale:', locale.value)  // 'zh_CN' 或 'en_US'

// 切换语言
const switchLanguage = () => {
  locale.value = locale.value === 'zh_CN' ? 'en_US' : 'zh_CN'
}

// 在函数中使用
const handleSubmit = () => {
  ElMessage.success(t('message.saveSuccess'))
}
</script>
```

#### Options API 方式

在 Options API 中使用 `this.$t`:

```vue
<script>
export default {
  methods: {
    handleClick() {
      // 使用 $t 翻译
      this.$message.success(this.$t('message.success'))
    },

    switchLanguage() {
      // 切换语言
      this.$i18n.locale = this.$i18n.locale === 'zh_CN' ? 'en_US' : 'zh_CN'
    }
  },

  computed: {
    currentLanguage() {
      return this.$i18n.locale
    }
  }
}
</script>
```

### 在 JavaScript/TypeScript 中使用

在非组件文件(如工具函数、API 模块)中使用:

```typescript
import i18n from '@/locales/i18n'

// 获取全局 i18n 实例
const { t, locale } = i18n.global

// 翻译文本
const message = t('message.success')

// 带参数
const errorMsg = t('message.error', { reason: '网络错误' })

// 获取当前语言
const currentLang = locale.value

// 切换语言
locale.value = 'en_US'

// 在工具函数中使用
export function formatMessage(key: string, params?: any) {
  return i18n.global.t(key, params)
}

// 在 API 请求中使用
export async function fetchData() {
  try {
    const data = await request.get('/api/data')
    ElMessage.success(i18n.global.t('message.success'))
    return data
  } catch (error) {
    ElMessage.error(i18n.global.t('message.error'))
    throw error
  }
}
```

### 在路由守卫中使用

在路由守卫中使用国际化:

```typescript
// src/router/permission.ts
import i18n from '@/locales/i18n'

router.beforeEach((to, from, next) => {
  const { t } = i18n.global

  // 设置页面标题
  if (to.meta.title) {
    document.title = t(to.meta.title as string)
  }

  // 权限检查消息
  if (!hasPermission(to)) {
    ElMessage.error(t('message.unauthorized'))
    next('/login')
    return
  }

  next()
})
```

## 动态语言切换

### 切换语言方法

项目提供了多种语言切换方式:

#### 方式 1: 直接修改 locale

```typescript
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// 切换到英文
locale.value = 'en_US'

// 切换到中文
locale.value = 'zh_CN'

// 切换语言(toggle)
const toggleLanguage = () => {
  locale.value = locale.value === 'zh_CN' ? 'en_US' : 'zh_CN'
}
```

#### 方式 2: 使用布局配置

```typescript
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 切换语言
layout.setLanguage('en_US')

// 或者
layout.language.value = 'en_US'
```

#### 方式 3: 全局实例切换

```typescript
import i18n from '@/locales/i18n'

// 全局切换
i18n.global.locale.value = 'en_US'
```

### 语言切换组件示例

创建一个语言切换下拉菜单:

```vue
<template>
  <el-dropdown @command="handleLanguageChange">
    <span class="language-selector">
      {{ currentLanguageName }}
      <el-icon class="el-icon--right"><arrow-down /></el-icon>
    </span>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh_CN" :disabled="locale === 'zh_CN'">
          简体中文
        </el-dropdown-item>
        <el-dropdown-item command="en_US" :disabled="locale === 'en_US'">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@element-plus/icons-vue'
import { LanguageCode } from '@/systemConfig'

const { locale } = useI18n()

// 当前语言显示名称
const currentLanguageName = computed(() => {
  return locale.value === 'zh_CN' ? '简体中文' : 'English'
})

// 切换语言
const handleLanguageChange = (lang: LanguageCode) => {
  locale.value = lang

  // 提示用户
  ElMessage.success(
    lang === 'zh_CN' ? '语言切换成功' : 'Language switched successfully'
  )

  // 保存到本地存储
  const layout = useLayout()
  layout.setLanguage(lang)
}
</script>

<style scoped>
.language-selector {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
```

### 语言切换持久化

语言选择会自动保存到本地存储,确保刷新页面后保持用户的选择:

```typescript
// src/composables/useLayout.ts
export const useLayout = () => {
  const language = ref<LanguageCode>(
    localCache.getCache('language') || LanguageCode.zh_CN
  )

  const setLanguage = (lang: LanguageCode) => {
    language.value = lang
    // 保存到 localStorage
    localCache.setCache('language', lang)

    // 同步到 i18n
    i18n.global.locale.value = lang
  }

  return {
    language,
    setLanguage
  }
}
```

## 支持的语言列表

### 当前支持的语言

| 语言代码 | 语言名称 | 显示名称 | Element Plus 支持 |
|----------|---------|---------|------------------|
| `zh_CN` | 简体中文 | 简体中文 | ✅ |
| `en_US` | 英语(美国) | English | ✅ |

### 扩展新语言

要添加新的语言支持,按以下步骤操作:

**步骤 1: 更新语言代码枚举**

```typescript
// src/systemConfig.ts
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US',
  ja_JP = 'ja_JP',  // 新增日语
  ko_KR = 'ko_KR'   // 新增韩语
}
```

**步骤 2: 创建语言包文件**

```typescript
// src/locales/ja_JP.ts
export default {
  '操作': '操作',
  '新增': '追加',
  '修改': '変更',
  '删除': '削除',

  button: {
    query: '照会',
    add: '追加',
    update: '変更',
    delete: '削除'
  },

  message: {
    success: '成功しました',
    error: '失敗しました'
  }

  // ... 其他翻译
}
```

**步骤 3: 在 i18n 配置中注册**

```typescript
// src/locales/i18n.ts
import ja_JP from '@/locales/ja_JP'
import el_ja from 'element-plus/es/locale/lang/ja'

const i18n = createI18n({
  // ... 其他配置
  messages: {
    zh_CN: {
      ...zh_CN,
      ...el_zhCn
    },
    en_US: {
      ...en_US,
      ...el_en
    },
    ja_JP: {
      ...ja_JP,
      ...el_ja  // Element Plus 日语语言包
    }
  }
})
```

**步骤 4: 更新语言切换组件**

```vue
<template>
  <el-dropdown-menu>
    <el-dropdown-item command="zh_CN">简体中文</el-dropdown-item>
    <el-dropdown-item command="en_US">English</el-dropdown-item>
    <el-dropdown-item command="ja_JP">日本語</el-dropdown-item>
    <el-dropdown-item command="ko_KR">한국어</el-dropdown-item>
  </el-dropdown-menu>
</template>
```

## 类型安全

### 语言包类型定义

项目导出了语言包类型,用于类型检查:

```typescript
// src/locales/i18n.ts
export type LanguageType = typeof zh_CN
```

### 使用类型定义

在定义新语言包时,使用类型确保结构一致:

```typescript
import type { LanguageType } from '@/locales/i18n'

// 确保 en_US 语言包与 zh_CN 结构一致
const en_US: LanguageType = {
  '操作': 'Operation',
  '新增': 'Add',
  button: {
    query: 'Query',
    add: 'Add'
  }
  // TypeScript 会检查是否缺少必需的键
}

export default en_US
```

### 翻译键类型提示

使用字符串字面量类型获得翻译键的类型提示:

```typescript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ✅ 类型安全的翻译键
t('button.query')
t('message.success')
t('login.userName')

// ❌ TypeScript 会警告拼写错误
t('buton.query')  // 'buton' 拼写错误
t('message.sucesss')  // 'sucesss' 拼写错误
```

## 最佳实践

### 1. 翻译键命名规范

遵循一致的命名约定:

```typescript
// ✅ 推荐 - 使用模块化组织
{
  button: {
    save: '保存',
    cancel: '取消'
  },
  message: {
    saveSuccess: '保存成功',
    saveError: '保存失败'
  },
  dialog: {
    confirmDelete: '确认删除?'
  }
}

// ❌ 不推荐 - 扁平化结构
{
  'button_save': '保存',
  'button_cancel': '取消',
  'message_save_success': '保存成功'
}
```

### 2. 避免硬编码文本

始终使用翻译键,避免硬编码:

```vue
<!-- ❌ 不推荐 - 硬编码中文 -->
<template>
  <el-button>保存</el-button>
  <span>用户名</span>
</template>

<!-- ✅ 推荐 - 使用翻译 -->
<template>
  <el-button>{{ $t('button.save') }}</el-button>
  <span>{{ $t('login.userName') }}</span>
</template>
```

### 3. 统一使用 Composition API

在 Vue 3 项目中统一使用 Composition API:

```vue
<script lang="ts" setup>
// ✅ 推荐
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const message = t('message.success')
</script>
```

```vue
<script>
// ❌ 不推荐 - Options API
export default {
  methods: {
    getMessage() {
      return this.$t('message.success')
    }
  }
}
</script>
```

### 4. 动态参数使用

善用动态参数功能:

```typescript
// ✅ 推荐 - 使用参数
{
  message: {
    deleteConfirm: '确认删除 {count} 条数据?'
  }
}

// 使用
t('message.deleteConfirm', { count: 5 })
// 输出: 确认删除 5 条数据?
```

```typescript
// ❌ 不推荐 - 字符串拼接
{
  message: {
    deleteConfirm: '确认删除'
  }
}

// 使用
t('message.deleteConfirm') + count + '条数据?'
```

### 5. 提取公共翻译

将常用翻译提取到顶层或公共模块:

```typescript
{
  // 顶层公共翻译
  '操作': 'Operation',
  '确定': 'Confirm',
  '取消': 'Cancel',

  // 公共模块
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除'
  }
}
```

### 6. 保持两种语言同步

添加新翻译时,同时更新所有语言包:

```typescript
// zh_CN.ts
{
  newFeature: {
    title: '新功能',
    description: '这是一个新功能'
  }
}

// en_US.ts - 同步添加
{
  newFeature: {
    title: 'New Feature',
    description: 'This is a new feature'
  }
}
```

### 7. 使用嵌套结构

使用嵌套结构组织复杂的翻译:

```typescript
// ✅ 推荐 - 嵌套结构
{
  user: {
    profile: {
      title: '个人资料',
      form: {
        nickname: '昵称',
        email: '邮箱',
        phone: '手机号'
      },
      action: {
        save: '保存',
        cancel: '取消'
      }
    }
  }
}

// 使用
t('user.profile.title')
t('user.profile.form.nickname')
t('user.profile.action.save')
```

## 常见问题

### 1. 翻译不生效

**问题描述:**

使用 `$t()` 或 `t()` 翻译,但显示的是翻译键而不是翻译文本。

**可能原因:**

- 翻译键拼写错误
- 语言包中缺少对应的翻译
- i18n 实例未正确注册

**解决方案:**

```typescript
// 1. 检查翻译键是否正确
t('button.query')  // ✅ 正确
t('buton.query')   // ❌ 拼写错误

// 2. 确认语言包中有对应翻译
// zh_CN.ts
{
  button: {
    query: '查询'  // 确保存在
  }
}

// 3. 检查 i18n 是否已注册
// main.ts
import i18n from '@/locales/i18n'
app.use(i18n)  // 必须注册
```

### 2. Element Plus 组件语言未切换

**问题描述:**

切换应用语言后,Element Plus 组件(如日期选择器)仍显示原语言。

**原因分析:**

Element Plus 需要单独配置国际化。

**解决方案:**

```typescript
// main.ts
import ElementPlus from 'element-plus'
import el_en from 'element-plus/es/locale/lang/en'
import el_zhCn from 'element-plus/es/locale/lang/zh-cn'
import i18n from '@/locales/i18n'

// 动态配置 Element Plus 语言
const elementPlusLocale = computed(() => {
  return i18n.global.locale.value === 'zh_CN' ? el_zhCn : el_en
})

app.use(ElementPlus, {
  locale: elementPlusLocale.value
})

// 监听语言切换,更新 Element Plus
watch(() => i18n.global.locale.value, (newLocale) => {
  // 重新配置 Element Plus
  app.config.globalProperties.$ELEMENT = {
    locale: newLocale === 'zh_CN' ? el_zhCn : el_en
  }
})
```

### 3. 动态参数不显示

**问题描述:**

使用动态参数的翻译,参数值没有正确替换。

**原因分析:**

参数格式不正确或参数名不匹配。

**解决方案:**

```typescript
// 语言包
{
  message: {
    welcome: '欢迎 {userName} 登录系统'
  }
}

// ❌ 错误用法
t('message.welcome', { username: 'admin' })  // 参数名不匹配(userName vs username)
t('message.welcome', ['admin'])  // 错误的参数格式

// ✅ 正确用法
t('message.welcome', { userName: 'admin' })
// 输出: 欢迎 admin 登录系统
```

### 4. 在非组件文件中使用报错

**问题描述:**

在工具函数或 API 模块中使用 `useI18n()` 报错。

**原因分析:**

`useI18n()` 只能在组件的 setup 函数中使用。

**解决方案:**

在非组件文件中使用全局实例:

```typescript
// ❌ 错误 - 在非组件文件中使用 useI18n
import { useI18n } from 'vue-i18n'

export function formatMessage() {
  const { t } = useI18n()  // 报错!
  return t('message.success')
}

// ✅ 正确 - 使用全局实例
import i18n from '@/locales/i18n'

export function formatMessage() {
  return i18n.global.t('message.success')
}

// 或者传入 t 函数
export function formatMessage(t: (key: string) => string) {
  return t('message.success')
}
```

### 5. 语言切换后页面未更新

**问题描述:**

切换语言后,部分文本没有更新。

**原因分析:**

- 使用了静态翻译(组件初始化时翻译一次)
- 翻译结果被缓存

**解决方案:**

```vue
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()

// ❌ 错误 - 静态翻译
const title = t('login.title')

// ✅ 正确 - 使用计算属性
const title = computed(() => t('login.title'))

// ✅ 或直接在模板中使用
// <h1>{{ $t('login.title') }}</h1>
</script>
```

## 总结

RuoYi-Plus-UniApp 的国际化配置基于 Vue I18n,提供了完整的多语言支持能力。通过合理的配置和规范的使用,可以轻松实现应用的国际化。

**核心要点:**

1. **配置简洁** - 使用 `createI18n` 快速配置国际化实例
2. **模块化组织** - 语言包按功能模块组织,便于维护
3. **类型安全** - 完整的 TypeScript 支持,提供类型检查
4. **Element Plus 集成** - 深度集成组件库,确保一致性
5. **动态切换** - 支持运行时动态切换语言
6. **持久化** - 语言选择自动保存,提升用户体验
7. **易于扩展** - 简单几步即可添加新语言支持

遵循本文档的规范和最佳实践,可以构建出高质量的多语言应用。
