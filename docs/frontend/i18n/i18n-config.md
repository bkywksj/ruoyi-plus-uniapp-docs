# 国际化配置

## 概述

框架使用 Vue I18n 实现国际化功能，支持中文（zh_CN）和英文（en_US）两种语言，并集成了 Element Plus 的国际化支持。国际化系统采用模块化设计，将翻译内容按功能模块组织，便于维护和扩展。

**核心特性：**

- **Vue 3 Composition API 模式** - 使用现代化的组合式 API，提供更好的类型支持和开发体验
- **全局注入支持** - 在模板中可直接使用 `$t` 方法，无需额外导入
- **Element Plus 集成** - 无缝集成 Element Plus 组件库的国际化
- **模块化语言包** - 按业务模块组织翻译内容，结构清晰易维护
- **TypeScript 类型安全** - 完整的类型定义，提供智能提示和类型检查
- **动态语言切换** - 支持运行时切换语言，无需刷新页面

## 配置文件

### i18n 实例配置

i18n 实例在 `src/locales/i18n.ts` 中创建和配置，这是整个国际化系统的核心入口。

```typescript
import { createI18n } from 'vue-i18n'
import zh_CN from '@/locales/zh_CN'
import en_US from '@/locales/en_US'
import el_en from 'element-plus/es/locale/lang/en'
import el_zhCn from 'element-plus/es/locale/lang/zh-cn'

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
```

### 配置项详解

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `globalInjection` | boolean | 将 `$t`, `$d`, `$n` 等方法全局注入到模板中，可在任何组件模板中直接使用 |
| `allowComposition` | boolean | 允许使用组合式 API 的 `useI18n()`，在 `<script setup>` 中使用 |
| `legacy` | boolean | 设为 `false` 使用 Vue 3 Composition API 模式，设为 `true` 使用 Vue 2 兼容模式 |
| `locale` | string | 当前激活的语言代码，支持 `'zh_CN'` 和 `'en_US'` |
| `messages` | object | 所有语言的翻译消息对象，key 为语言代码，value 为翻译内容 |

### 语言代码枚举

框架在 `src/systemConfig.ts` 中定义了语言代码枚举，确保类型安全：

```typescript
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US'
}
```

### 获取当前语言

框架提供 `getLanguage()` 函数从布局配置中获取用户设置的语言，如果未设置则返回默认中文：

```typescript
export const getLanguage = (): LanguageCode => {
  const layout = useLayout()

  if (layout.language.value) {
    return layout.language.value
  }
  return LanguageCode.zh_CN  // 默认中文
}
```

### 在应用中注册

在应用入口文件 `src/main.ts` 中注册 i18n 插件：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import i18n from '@/locales/i18n'

const app = createApp(App)
app.use(i18n)  // 注册国际化插件
app.mount('#app')
```

## 语言包结构

### 目录结构

```
src/locales/
├── i18n.ts          # i18n 实例配置
├── zh_CN.ts         # 中文语言包
└── en_US.ts         # 英文语言包
```

### 语言包组织方式

语言包采用模块化组织，按业务功能划分为多个子模块。以中文语言包 `zh_CN.ts` 为例：

```typescript
export default {
  // 通用按钮
  button: {
    query: '查询',
    add: '新增',
    update: '修改',
    delete: '删除',
    export: '导出',
    import: '导入',
    reset: '重置',
    submit: '提交',
    cancel: '取消',
    confirm: '确定',
    close: '关闭',
    back: '返回',
    save: '保存',
    edit: '编辑',
    detail: '详情',
    batch_delete: '批量删除',
    batch_export: '批量导出',
    expand_all: '展开全部',
    collapse_all: '折叠全部',
    refresh: '刷新',
    more: '更多',
  },

  // 对话框
  dialog: {
    add_title: '添加{name}',
    edit_title: '修改{name}',
    detail_title: '{name}详情',
    import_title: '导入{name}',
    export_title: '导出{name}',
  },

  // 操作消息
  message: {
    operation_success: '操作成功',
    operation_failed: '操作失败',
    add_success: '新增成功',
    update_success: '修改成功',
    delete_success: '删除成功',
    delete_confirm: '确认删除这{count}条数据吗？',
    export_confirm: '确认导出所选数据吗？',
    please_select: '请至少选择一条数据',
    loading: '加载中...',
    no_data: '暂无数据',
  },

  // 表单占位符
  placeholder: {
    input: '请输入{name}',
    select: '请选择{name}',
    date: '请选择日期',
    date_range: '请选择日期范围',
    time: '请选择时间',
  },

  // 提示文本
  tooltip: {
    refresh: '刷新',
    search: '搜索',
    reset: '重置',
    fullscreen: '全屏',
    exit_fullscreen: '退出全屏',
  },

  // 路由名称
  route: {
    dashboard: '首页',
    system: '系统管理',
    user: '用户管理',
    role: '角色管理',
    menu: '菜单管理',
    dept: '部门管理',
    post: '岗位管理',
    dict: '字典管理',
    config: '参数设置',
    notice: '通知公告',
    log: '日志管理',
    online: '在线用户',
    job: '定时任务',
    monitor: '系统监控',
    server: '服务监控',
    cache: '缓存监控',
  },

  // 登录页面
  login: {
    title: '若依管理系统',
    username: '用户名',
    password: '密码',
    code: '验证码',
    remember_me: '记住我',
    forgot_password: '忘记密码',
    login: '登录',
    register: '注册账号',
    login_success: '登录成功',
    logout_success: '退出成功',
    username_required: '请输入用户名',
    password_required: '请输入密码',
    code_required: '请输入验证码',
  },

  // 注册页面
  register: {
    title: '注册账号',
    username: '用户名',
    password: '密码',
    confirm_password: '确认密码',
    email: '邮箱',
    phone: '手机号',
    code: '验证码',
    get_code: '获取验证码',
    agree: '我已阅读并同意',
    user_agreement: '《用户协议》',
    privacy_policy: '《隐私政策》',
    register: '注册',
    has_account: '已有账号',
    go_login: '去登录',
    register_success: '注册成功',
  },

  // 导航栏
  navbar: {
    dashboard: '首页',
    logout: '退出登录',
    profile: '个人中心',
    change_password: '修改密码',
    language: '语言',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    fullscreen: '全屏',
    exit_fullscreen: '退出全屏',
    message: '消息',
    notice: '通知',
  },

  // 标签页视图
  tagsView: {
    refresh: '刷新',
    close: '关闭',
    close_others: '关闭其他',
    close_all: '关闭所有',
    close_left: '关闭左侧',
    close_right: '关闭右侧',
  },

  // 菜单系统
  menu: {
    system: {
      title: '系统管理',
      user: '用户管理',
      role: '角色管理',
      menu: '菜单管理',
      dept: '部门管理',
      post: '岗位管理',
      dict: '字典管理',
      config: '参数设置',
      notice: '通知公告',
      log: '日志管理',
    },
    monitor: {
      title: '系统监控',
      online: '在线用户',
      job: '定时任务',
      druid: '数据监控',
      server: '服务监控',
      cache: '缓存监控',
      cache_list: '缓存列表',
    },
    tool: {
      title: '系统工具',
      gen: '代码生成',
      build: '表单构建',
      swagger: '系统接口',
    },
    tenant: {
      title: '租户管理',
      tenant: '租户管理',
      package: '租户套餐',
    },
  },
}
```

### 语言包模块说明

| 模块 | 说明 | 使用场景 |
|------|------|----------|
| `button` | 通用按钮文本 | 查询、新增、修改、删除等常用按钮 |
| `dialog` | 对话框标题 | 添加、编辑、详情等对话框标题模板 |
| `message` | 操作消息 | 成功、失败、确认等提示消息 |
| `placeholder` | 表单占位符 | 输入框、选择框等占位符文本 |
| `tooltip` | 提示文本 | 按钮和图标的悬浮提示 |
| `route` | 路由名称 | 菜单和面包屑中显示的路由名称 |
| `login` | 登录页面 | 登录表单的所有文本内容 |
| `register` | 注册页面 | 注册表单的所有文本内容 |
| `navbar` | 导航栏 | 顶部导航栏的菜单和操作 |
| `tagsView` | 标签页视图 | 页签的右键菜单操作 |
| `menu` | 菜单系统 | 侧边栏菜单的多级结构 |

## 在模板中使用

### 基础用法

在模板中直接使用 `$t` 函数进行翻译，由于配置了 `globalInjection: true`，无需导入任何函数：

```vue
<template>
  <div class="login-form">
    <h1>{{ $t('login.title') }}</h1>

    <el-form>
      <el-form-item :label="$t('login.username')">
        <el-input :placeholder="$t('login.username_required')" />
      </el-form-item>

      <el-form-item :label="$t('login.password')">
        <el-input type="password" :placeholder="$t('login.password_required')" />
      </el-form-item>

      <el-button type="primary">{{ $t('login.login') }}</el-button>
    </el-form>
  </div>
</template>
```

### 带参数的翻译

使用命名参数进行动态内容替换：

```vue
<template>
  <div>
    <!-- 对话框标题 -->
    <el-dialog :title="$t('dialog.add_title', { name: $t('route.user') })">
      <!-- 添加用户 -->
    </el-dialog>

    <!-- 表单占位符 -->
    <el-input :placeholder="$t('placeholder.input', { name: '用户名' })" />
    <el-select :placeholder="$t('placeholder.select', { name: '角色' })" />

    <!-- 删除确认 -->
    <div>{{ $t('message.delete_confirm', { count: selectedRows.length }) }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selectedRows = ref([])
</script>
```

### 复数处理

虽然当前语言包未包含复数形式，但 Vue I18n 支持复数处理。可以这样定义：

```typescript
// 在语言包中定义
export default {
  message: {
    items_count: '没有项目 | 1个项目 | {count}个项目',
  }
}
```

```vue
<template>
  <div>
    {{ $t('message.items_count', 0) }}  <!-- 没有项目 -->
    {{ $t('message.items_count', 1) }}  <!-- 1个项目 -->
    {{ $t('message.items_count', { count: 5 }) }}  <!-- 5个项目 -->
  </div>
</template>
```

### 列表渲染中使用

在 `v-for` 循环中使用翻译：

```vue
<template>
  <div class="button-group">
    <el-button
      v-for="action in actions"
      :key="action"
      @click="handleAction(action)"
    >
      {{ $t(`button.${action}`) }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
const actions = ['query', 'add', 'update', 'delete', 'export']

const handleAction = (action: string) => {
  console.log(`执行${action}操作`)
}
</script>
```

### 条件渲染中使用

根据状态显示不同的翻译文本：

```vue
<template>
  <div>
    <el-button :loading="loading">
      {{ loading ? $t('message.loading') : $t('button.submit') }}
    </el-button>

    <div class="data-list">
      <div v-if="dataList.length === 0">
        {{ $t('message.no_data') }}
      </div>
      <div v-else v-for="item in dataList" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(false)
const dataList = ref([])
</script>
```

## 在脚本中使用

### 使用 Composition API

在 `<script setup>` 中使用 `useI18n()` 获取翻译函数：

```vue
<template>
  <div>
    <el-button @click="handleSubmit">提交</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const handleSubmit = async () => {
  try {
    // 执行提交操作
    await submitForm()

    // 显示成功消息
    ElMessage.success(t('message.operation_success'))
  } catch (error) {
    // 显示失败消息
    ElMessage.error(t('message.operation_failed'))
  }
}

const submitForm = async () => {
  // 提交逻辑
}
</script>
```

### 在函数中使用翻译

在普通函数或工具函数中使用翻译：

```typescript
import { i18n } from '@/locales/i18n'

export const validateForm = (data: any) => {
  const t = i18n.global.t

  if (!data.username) {
    return {
      success: false,
      message: t('login.username_required')
    }
  }

  if (!data.password) {
    return {
      success: false,
      message: t('login.password_required')
    }
  }

  return { success: true }
}
```

### 在表格列配置中使用

为表格列动态设置标题：

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const columns = computed(() => [
  {
    prop: 'username',
    label: t('route.user'),
    width: 120
  },
  {
    prop: 'roleName',
    label: t('route.role'),
    width: 100
  },
  {
    prop: 'deptName',
    label: t('route.dept'),
    width: 150
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 180
  }
])
</script>
```

### 在路由配置中使用

动态设置路由元信息：

```typescript
import { i18n } from '@/locales/i18n'

export const routes = [
  {
    path: '/system',
    meta: {
      title: () => i18n.global.t('menu.system.title'),
      icon: 'system'
    },
    children: [
      {
        path: 'user',
        meta: {
          title: () => i18n.global.t('menu.system.user'),
          icon: 'user'
        }
      },
      {
        path: 'role',
        meta: {
          title: () => i18n.global.t('menu.system.role'),
          icon: 'role'
        }
      }
    ]
  }
]
```

## Element Plus 集成

### 配置说明

框架已将 Element Plus 的语言包合并到主语言包中：

```typescript
import el_en from 'element-plus/es/locale/lang/en'
import el_zhCn from 'element-plus/es/locale/lang/zh-cn'

const i18n = createI18n({
  // ... 其他配置
  messages: {
    zh_CN: {
      ...zh_CN,
      ...el_zhCn  // 合并 Element Plus 中文
    },
    en_US: {
      ...en_US,
      ...el_en    // 合并 Element Plus 英文
    }
  }
})
```

### 组件自动国际化

Element Plus 组件会自动使用配置的语言：

```vue
<template>
  <div>
    <!-- 日期选择器会显示中文月份和星期 -->
    <el-date-picker
      v-model="date"
      type="date"
      placeholder="选择日期"
    />

    <!-- 分页组件会显示中文文本 -->
    <el-pagination
      :total="100"
      :page-size="10"
      layout="total, prev, pager, next"
    />

    <!-- 表格的空状态会显示中文 -->
    <el-table :data="[]">
      <el-table-column prop="name" label="姓名" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const date = ref('')
</script>
```

### 局部覆盖语言

如果需要为某个组件单独设置语言，可以使用 `el-config-provider`：

```vue
<template>
  <div>
    <!-- 全局使用中文 -->
    <el-button>中文按钮</el-button>

    <!-- 局部使用英文 -->
    <el-config-provider :locale="enLocale">
      <el-date-picker
        v-model="date"
        type="date"
        placeholder="Select date"
      />
    </el-config-provider>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import en from 'element-plus/es/locale/lang/en'

const date = ref('')
const enLocale = en
</script>
```

## 语言切换实现

### 在导航栏添加语言切换

创建一个语言切换下拉菜单：

```vue
<template>
  <div class="language-switcher">
    <el-dropdown @command="handleLanguageChange">
      <span class="el-dropdown-link">
        <el-icon><Globe /></el-icon>
        {{ currentLanguageName }}
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh_CN">简体中文</el-dropdown-item>
          <el-dropdown-item command="en_US">English</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLayout } from '@/stores/modules/layout'
import { LanguageCode } from '@/systemConfig'

const { locale } = useI18n()
const layout = useLayout()

// 当前语言显示名称
const currentLanguageName = computed(() => {
  return locale.value === 'zh_CN' ? '简体中文' : 'English'
})

// 切换语言
const handleLanguageChange = (lang: string) => {
  locale.value = lang
  layout.setLanguage(lang as LanguageCode)

  // 刷新页面以应用新语言（如果需要）
  // location.reload()
}
</script>

<style scoped>
.language-switcher {
  cursor: pointer;
  padding: 0 12px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
```

### 持久化语言设置

在布局 Store 中保存语言设置：

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LanguageCode } from '@/systemConfig'

export const useLayout = defineStore('layout', () => {
  const language = ref<LanguageCode>(
    (localStorage.getItem('language') as LanguageCode) || LanguageCode.zh_CN
  )

  const setLanguage = (lang: LanguageCode) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  return {
    language,
    setLanguage
  }
})
```

### 监听语言变化

在需要响应语言变化的组件中监听：

```vue
<script lang="ts" setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// 监听语言变化
watch(locale, (newLocale) => {
  console.log('语言已切换为:', newLocale)

  // 重新加载某些数据
  loadData()

  // 更新页面标题
  document.title = newLocale === 'zh_CN' ? '管理系统' : 'Admin System'
})

const loadData = () => {
  // 重新加载数据
}
</script>
```

## 动态参数和高级用法

### 动态消息构建

根据不同参数构建消息：

```vue
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t } = useI18n()

// 删除确认
const handleDelete = async (selectedRows: any[]) => {
  const count = selectedRows.length

  try {
    await ElMessageBox.confirm(
      t('message.delete_confirm', { count }),
      t('message.warning'),
      {
        type: 'warning',
        confirmButtonText: t('button.confirm'),
        cancelButtonText: t('button.cancel')
      }
    )

    // 执行删除
    await deleteRows(selectedRows)
    ElMessage.success(t('message.delete_success'))
  } catch {
    // 用户取消
  }
}

const deleteRows = async (rows: any[]) => {
  // 删除逻辑
}
</script>
```

### 表单验证消息

在表单验证规则中使用翻译：

```vue
<script lang="ts" setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormRules } from 'element-plus'

const { t } = useI18n()

const formData = reactive({
  username: '',
  password: '',
  email: ''
})

const rules = reactive<FormRules>({
  username: [
    {
      required: true,
      message: t('login.username_required'),
      trigger: 'blur'
    },
    {
      min: 3,
      max: 20,
      message: '用户名长度在3-20个字符',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: t('login.password_required'),
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: 'blur'
    }
  ]
})
</script>
```

### 日期时间格式化

使用 `$d` 函数格式化日期：

```vue
<template>
  <div>
    <p>{{ $d(new Date(), 'short') }}</p>
    <p>{{ $d(new Date(), 'long') }}</p>
  </div>
</template>

<script lang="ts" setup>
// 在 i18n 配置中定义日期格式
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  // ... 其他配置
  datetimeFormats: {
    'zh_CN': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
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
        weekday: 'long'
      }
    }
  }
})
</script>
```

### 数字格式化

使用 `$n` 函数格式化数字：

```vue
<template>
  <div>
    <p>价格: {{ $n(12345.67, 'currency') }}</p>
    <p>百分比: {{ $n(0.85, 'percent') }}</p>
  </div>
</template>

<script lang="ts" setup>
// 在 i18n 配置中定义数字格式
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  // ... 其他配置
  numberFormats: {
    'zh_CN': {
      currency: {
        style: 'currency',
        currency: 'CNY',
        notation: 'standard'
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 2
      }
    },
    'en_US': {
      currency: {
        style: 'currency',
        currency: 'USD',
        notation: 'standard'
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 2
      }
    }
  }
})
</script>
```

## TypeScript 类型支持

### 语言包类型定义

为语言包定义类型以获得智能提示：

```typescript
// src/locales/types.ts
export interface LocaleMessages {
  button: {
    query: string
    add: string
    update: string
    delete: string
    // ... 其他按钮
  }
  dialog: {
    add_title: string
    edit_title: string
    // ... 其他对话框
  }
  message: {
    operation_success: string
    operation_failed: string
    // ... 其他消息
  }
  // ... 其他模块
}
```

### 类型安全的翻译函数

创建类型安全的翻译辅助函数：

```typescript
import { useI18n } from 'vue-i18n'
import type { LocaleMessages } from '@/locales/types'

export const useTypedI18n = () => {
  const { t, locale } = useI18n<{ message: LocaleMessages }>()

  return {
    t,
    locale,
    // 提供类型安全的翻译函数
    translateButton: (key: keyof LocaleMessages['button']) => {
      return t(`button.${key}`)
    },
    translateMessage: (key: keyof LocaleMessages['message']) => {
      return t(`message.${key}`)
    }
  }
}
```

使用类型安全的翻译：

```vue
<script lang="ts" setup>
import { useTypedI18n } from '@/composables/useTypedI18n'

const { translateButton, translateMessage } = useTypedI18n()

const handleSave = () => {
  // TypeScript 会提供智能提示
  console.log(translateButton('save'))
  console.log(translateMessage('operation_success'))
}
</script>
```

## 最佳实践

### 1. 合理组织语言包结构

**推荐做法：**

```typescript
// ✅ 按功能模块组织
export default {
  user: {
    list_title: '用户列表',
    add_user: '新增用户',
    edit_user: '编辑用户',
    username: '用户名',
    password: '密码'
  },
  role: {
    list_title: '角色列表',
    add_role: '新增角色',
    edit_role: '编辑角色',
    role_name: '角色名称',
    permissions: '权限'
  }
}
```

**不推荐做法：**

```typescript
// ❌ 扁平化结构，不易维护
export default {
  user_list_title: '用户列表',
  user_add: '新增用户',
  user_edit: '编辑用户',
  role_list_title: '角色列表',
  role_add: '新增角色',
  // ...
}
```

### 2. 提取通用文本

将重复使用的文本提取为通用翻译：

```typescript
export default {
  // 通用操作
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确定',
    delete: '删除',
    edit: '编辑',
    view: '查看'
  },

  // 在各模块中复用
  user: {
    title: '用户管理',
    // 使用 common.save 而不是 user.save
  }
}
```

### 3. 使用参数化翻译

避免硬编码多个相似的翻译键：

```typescript
// ✅ 推荐：使用参数
export default {
  dialog: {
    title: '{action}{name}'  // 支持"新增用户"、"编辑角色"等
  }
}

// 使用
t('dialog.title', { action: '新增', name: '用户' })

// ❌ 不推荐：为每种组合创建键
export default {
  dialog: {
    add_user_title: '新增用户',
    edit_user_title: '编辑用户',
    add_role_title: '新增角色',
    edit_role_title: '编辑角色',
    // ... 组合爆炸
  }
}
```

### 4. 保持中英文键名一致

确保所有语言包的键名完全相同：

```typescript
// zh_CN.ts
export default {
  button: {
    save: '保存',
    cancel: '取消'
  }
}

// en_US.ts
export default {
  button: {
    save: 'Save',
    cancel: 'Cancel'
  }
}

// ❌ 错误：键名不一致会导致翻译失败
// en_US.ts
export default {
  button: {
    saveButton: 'Save',  // 应该是 save
    cancelBtn: 'Cancel'  // 应该是 cancel
  }
}
```

### 5. 避免在翻译中包含 HTML

```typescript
// ❌ 不推荐：在翻译中包含 HTML
export default {
  message: {
    welcome: '<strong>欢迎</strong>回来'
  }
}

// ✅ 推荐：在模板中处理格式
export default {
  message: {
    welcome: '欢迎回来'
  }
}
```

```vue
<template>
  <div>
    <strong>{{ $t('message.welcome') }}</strong>
  </div>
</template>
```

### 6. 组件中优先使用 Composition API

```vue
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

// ✅ 推荐：使用 Composition API
const { t, locale } = useI18n()

const handleClick = () => {
  console.log(t('button.save'))
}
</script>
```

### 7. 为大型应用拆分语言包

对于大型应用，可以将语言包拆分为多个文件：

```typescript
// src/locales/zh_CN/index.ts
import common from './common'
import user from './user'
import role from './role'
import menu from './menu'

export default {
  ...common,
  user,
  role,
  menu
}

// src/locales/zh_CN/user.ts
export default {
  list_title: '用户列表',
  add_user: '新增用户',
  // ... 用户模块翻译
}
```

### 8. 使用 fallback 处理缺失翻译

配置回退语言以处理翻译缺失的情况：

```typescript
const i18n = createI18n({
  locale: 'zh_CN',
  fallbackLocale: 'en_US',  // 当中文翻译缺失时回退到英文
  messages: {
    zh_CN,
    en_US
  }
})
```

## 常见问题

### 1. 翻译键不存在时显示键名

**问题描述：**
调用 `$t('nonexistent.key')` 时直接显示 `"nonexistent.key"` 而不是翻译内容。

**原因分析：**
- 翻译键拼写错误
- 语言包中未定义该键
- 语言包未正确导入

**解决方案：**

```typescript
// 1. 检查键名是否正确
$t('button.save')  // ✅ 正确
$t('button.saev')  // ❌ 拼写错误

// 2. 确认语言包中已定义
// zh_CN.ts
export default {
  button: {
    save: '保存'  // ✅ 已定义
  }
}

// 3. 检查语言包是否正确导入
import zh_CN from '@/locales/zh_CN'
console.log(zh_CN.button.save)  // 应该输出 "保存"
```

### 2. 切换语言后部分内容未更新

**问题描述：**
切换语言后，某些组件的文本没有更新为新语言。

**原因分析：**
- 使用了静态赋值而不是响应式引用
- 组件未监听语言变化
- 缓存的数据未刷新

**解决方案：**

```vue
<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// ❌ 错误：静态赋值，不会响应语言变化
const pageTitle = t('route.dashboard')

// ✅ 正确：使用 computed 实现响应式
const pageTitle = computed(() => t('route.dashboard'))

// 或者监听语言变化手动更新
watch(locale, () => {
  // 重新加载需要翻译的数据
  loadMenuData()
})
</script>
```

### 3. Element Plus 组件未使用配置的语言

**问题描述：**
Element Plus 组件（如日期选择器、分页等）仍然显示英文。

**原因分析：**
- Element Plus 语言包未正确导入
- 语言包合并顺序错误
- 使用了局部语言配置

**解决方案：**

```typescript
// ✅ 确保正确导入和合并 Element Plus 语言包
import el_en from 'element-plus/es/locale/lang/en'
import el_zhCn from 'element-plus/es/locale/lang/zh-cn'

const i18n = createI18n({
  messages: {
    zh_CN: {
      ...zh_CN,
      ...el_zhCn  // Element Plus 语言包应该放在后面
    },
    en_US: {
      ...en_US,
      ...el_en
    }
  }
})
```

### 4. 在路由守卫中无法使用翻译

**问题描述：**
在路由守卫或全局配置中使用 `useI18n()` 报错。

**原因分析：**
`useI18n()` 只能在组件的 setup 函数中使用。

**解决方案：**

```typescript
// ❌ 错误：在路由守卫中使用 useI18n()
router.beforeEach((to, from) => {
  const { t } = useI18n()  // 报错
  document.title = t('route.dashboard')
})

// ✅ 正确：使用 i18n.global
import { i18n } from '@/locales/i18n'

router.beforeEach((to, from) => {
  const t = i18n.global.t
  document.title = t('route.dashboard')
})
```

### 5. 参数化翻译不生效

**问题描述：**
使用 `$t('dialog.title', { name: '用户' })` 时参数未被替换。

**原因分析：**
- 语言包中未使用正确的参数占位符语法
- 参数名称不匹配

**解决方案：**

```typescript
// ❌ 错误：参数占位符语法错误
export default {
  dialog: {
    title: '添加$name'  // 错误语法
  }
}

// ✅ 正确：使用花括号包裹参数名
export default {
  dialog: {
    title: '添加{name}'  // 正确语法
  }
}

// 使用
$t('dialog.title', { name: '用户' })  // 输出："添加用户"
```

### 6. 动态键名不工作

**问题描述：**
尝试使用变量作为翻译键时无法获取正确翻译。

**原因分析：**
需要使用模板字符串或字符串拼接。

**解决方案：**

```vue
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const action = 'save'

// ❌ 错误：直接使用变量
const text1 = t(action)

// ✅ 正确：使用模板字符串
const text2 = t(`button.${action}`)

// ✅ 正确：使用字符串拼接
const text3 = t('button.' + action)
</script>
```

### 7. TypeScript 类型错误

**问题描述：**
使用 `useI18n()` 时 TypeScript 报类型错误。

**原因分析：**
缺少类型声明或配置不正确。

**解决方案：**

```typescript
// 在 src/types/i18n.d.ts 中添加类型声明
import 'vue-i18n'

declare module 'vue-i18n' {
  export interface DefineLocaleMessage {
    // 定义消息类型
  }
}

// 在组件中正确使用
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
// t 和 locale 现在有正确的类型
```

### 8. 生产环境翻译失效

**问题描述：**
开发环境正常，生产环境翻译显示为键名。

**原因分析：**
- 构建时语言包未正确打包
- 语言包路径错误
- tree-shaking 移除了语言包

**解决方案：**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 确保语言包被正确打包
          'vendor-i18n': ['vue-i18n']
        }
      }
    }
  }
})

// 确保语言包正确导入
import zh_CN from '@/locales/zh_CN'  // ✅ 使用绝对路径
import en_US from '@/locales/en_US'
```

## 支持的语言

当前框架支持以下语言：

| 语言代码 | 语言名称 | 显示名称 | Element Plus 支持 |
|----------|---------|---------|------------------|
| `zh_CN` | 简体中文 | 简体中文 | ✅ |
| `en_US` | 英语（美国） | English | ✅ |

如需添加新语言，请按以下步骤操作：

1. 在 `src/locales/` 目录下创建新的语言包文件（如 `ja_JP.ts`）
2. 复制 `zh_CN.ts` 的结构并翻译所有文本
3. 在 `src/locales/i18n.ts` 中导入新语言包
4. 在 `LanguageCode` 枚举中添加新语言代码
5. 在语言切换组件中添加新语言选项

## 相关文件

- `src/locales/i18n.ts` - i18n 实例配置和初始化
- `src/locales/zh_CN.ts` - 中文语言包（332行）
- `src/locales/en_US.ts` - 英文语言包（332行）
- `src/systemConfig.ts` - 语言代码枚举定义
- `src/stores/modules/layout.ts` - 语言设置持久化
