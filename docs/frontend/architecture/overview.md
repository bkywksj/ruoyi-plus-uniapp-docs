# 前端架构概览

## 介绍

RuoYi-Plus-UniApp 前端管理端(plus-ui)采用现代化的前端架构设计,基于 Vue 3 生态系统构建,结合 TypeScript 提供完整的类型安全保障。项目遵循模块化、组件化的设计理念,通过清晰的分层架构和统一的开发规范,为企业级应用提供稳定、高效、可维护的技术解决方案。

**架构核心理念:**

- **渐进式增强** - 采用 Vue 3 渐进式框架,支持按需引入和灵活扩展
- **类型安全** - 全面使用 TypeScript,提供完整的类型推导和检查
- **模块化设计** - 按功能模块组织代码,高内聚低耦合
- **组件化开发** - 可复用的组件体系,提高开发效率
- **工程化规范** - 统一的代码规范、构建流程和部署策略
- **性能优先** - 代码分割、懒加载、缓存优化等性能最佳实践
- **开发友好** - 热更新、类型提示、代码提示等优秀的开发体验

## 技术栈

### 核心框架

#### Vue 3.5.13

Vue 3 是下一代渐进式 JavaScript 框架,提供了更小的包体积、更快的渲染速度和更好的 TypeScript 支持。

**核心特性:**

- **Composition API** - 更灵活的逻辑组织方式,替代 Options API
- **响应式系统** - 基于 Proxy 的响应式系统,性能更优
- **Teleport** - 组件渲染到 DOM 树的任意位置
- **Suspense** - 异步组件加载的优雅处理
- **多根节点组件** - 支持模板中多个根节点
- **Fragment** - 无需额外包裹元素

**使用示例:**

```vue
<template>
  <div class="user-list">
    <h1>{{ title }}</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { listUser } from '@/api/system/user/userApi'
import type { UserVo } from '@/api/system/user/userTypes'

// 响应式数据
const title = ref('用户列表')
const users = ref<UserVo[]>([])
const loading = ref(false)

// 计算属性
const userCount = computed(() => users.value.length)

// 生命周期钩子
onMounted(async () => {
  loading.value = true
  const [err, data] = await listUser({ pageNum: 1, pageSize: 10 })
  if (!err) {
    users.value = data.records
  }
  loading.value = false
})
</script>
```

#### TypeScript 5.8.3

TypeScript 是 JavaScript 的超集,为项目提供静态类型检查和强大的 IDE 支持。

**类型系统优势:**

- **编译时类型检查** - 在开发阶段发现潜在错误
- **智能代码提示** - IDE 提供精准的代码补全
- **重构支持** - 安全地重构代码,自动更新引用
- **接口定义** - 清晰的 API 接口类型定义
- **泛型支持** - 灵活的类型复用和约束

**类型定义示例:**

```typescript
// 用户查询对象
export interface UserQuery {
  pageNum: number
  pageSize: number
  userName?: string
  phone?: string
  status?: string
  deptId?: number
  beginTime?: string
  endTime?: string
}

// 用户视图对象
export interface UserVo {
  userId: number
  userName: string
  nickName: string
  email: string
  phone: string
  sex: string
  avatar: string
  status: string
  deptId: number
  deptName: string
  createTime: string
}

// API 响应结果
export type Result<T = any> = Promise<[Error | null, T | null]>

// 分页结果
export interface PageResult<T = any> {
  records: T[]
  total: number
  pages: number
  current: number
  size: number
}
```

#### Vite 6.3.2

Vite 是新一代前端构建工具,基于原生 ES 模块提供极速的开发体验。

**核心优势:**

- **极速冷启动** - 基于 ESM 的 Dev Server,无需打包即可启动
- **即时热更新** - 无论应用大小,HMR 始终快速
- **按需编译** - 只编译当前屏幕上实际导入的代码
- **优化构建** - 内置 Rollup 打包,生产构建高度优化
- **丰富的插件** - 兼容 Rollup 插件,生态丰富
- **TypeScript 支持** - 开箱即用的 TypeScript 支持

**Vite 配置核心:**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // 环境变量目录
  envDir: './env',

  // 基础路径
  base: '/',

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  // 插件
  plugins: [vue()],

  // 开发服务器
  server: {
    host: '0.0.0.0',
    port: 80,
    open: true,
    proxy: {
      '/dev-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/dev-api/, '')
      }
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },

  // 依赖优化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@vueuse/core',
      'echarts',
      'element-plus'
    ]
  }
})
```

#### Vue Router 4.5.0

Vue Router 是 Vue.js 官方的路由管理器,提供声明式路由和编程式导航。

**核心功能:**

- **嵌套路由** - 支持多层嵌套的路由结构
- **路由参数** - 动态路由参数匹配
- **命名路由** - 通过名称引用路由
- **命名视图** - 同级展示多个视图
- **重定向和别名** - 灵活的路由映射
- **路由守卫** - 全局、路由独享、组件内守卫
- **路由元信息** - 自定义路由元数据
- **滚动行为** - 自定义路由切换时的滚动行为

**路由配置示例:**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/index/index.vue'),
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/common/login.vue'),
    meta: { title: '登录', hidden: true }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export default router
```

**路由守卫实现:**

```typescript
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'

// 白名单 - 无需登录即可访问
const WHITE_LIST = ['/login', '/register', '/401', '/403', '/404']

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 检查登录状态
  if (!userStore.token) {
    // 白名单直接通过
    if (WHITE_LIST.includes(to.path)) {
      return next()
    }
    // 重定向到登录页
    return next(`/login?redirect=${to.fullPath}`)
  }

  // 已登录访问登录页,重定向到首页
  if (to.path === '/login') {
    return next({ path: '/' })
  }

  // 检查是否已获取用户信息
  if (userStore.roles.length === 0) {
    // 获取用户信息
    await userStore.fetchUserInfo()
    // 生成动态路由
    const accessRoutes = await permissionStore.generateRoutes()
    // 添加动态路由
    accessRoutes.forEach(route => {
      router.addRoute(route)
    })
    // 确保动态路由已加载
    next({ ...to, replace: true })
  } else {
    next()
  }
})

// 路由后置守卫
router.afterEach((to) => {
  // 结束进度条
  NProgress.done()
  // 设置页面标题
  document.title = to.meta.title || '管理系统'
})
```

#### Pinia 3.0.2

Pinia 是 Vue 3 官方推荐的状态管理库,提供简洁的 API 和完整的 TypeScript 支持。

**核心特性:**

- **轻量级** - 体积小巧,约 1KB
- **DevTools 支持** - 完整的 Vue DevTools 支持
- **模块化** - 每个 Store 都是独立模块
- **TypeScript** - 完整的 TypeScript 类型推导
- **插件系统** - 支持扩展功能(如持久化)
- **服务端渲染** - 支持 SSR

**Store 定义示例:**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/user'
import { getUserInfo, logout } from '@/api/system/user/userApi'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // 计算属性
  const isLogin = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.userName || '')
  const userId = computed(() => userInfo.value?.userId || 0)

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    roles.value = info.roles
    permissions.value = info.permissions
  }

  const fetchUserInfo = async () => {
    const [err, data] = await getUserInfo()
    if (!err) {
      setUserInfo(data)
    }
    return [err, data]
  }

  const logoutUser = async () => {
    const [err] = await logout()
    if (!err) {
      userInfo.value = null
      token.value = ''
      roles.value = []
      permissions.value = []
      localStorage.removeItem('token')
    }
    return [err]
  }

  return {
    // 状态
    userInfo,
    token,
    roles,
    permissions,
    // 计算属性
    isLogin,
    userName,
    userId,
    // 方法
    setToken,
    setUserInfo,
    fetchUserInfo,
    logoutUser
  }
}, {
  // 持久化配置
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['userInfo', 'token', 'roles', 'permissions']
  }
})
```

### UI 组件库

#### Element Plus 2.9.8

Element Plus 是 Vue 3 版本的 Element UI,提供丰富的企业级 UI 组件。

**组件分类:**

- **基础组件** - Button、Icon、Layout、Container、Border、Link
- **表单组件** - Form、Input、Select、Radio、Checkbox、Switch、DatePicker、Upload
- **数据展示** - Table、Tag、Progress、Tree、Pagination、Badge、Avatar、Card、Carousel
- **通知反馈** - Alert、Message、MessageBox、Notification、Dialog、Drawer、Popconfirm、Tooltip
- **导航菜单** - Menu、Tabs、Breadcrumb、PageHeader、Dropdown、Steps
- **其他** - Dialog、Drawer、Popover、Tooltip、Popconfirm、Calendar、Image、Descriptions

**按需引入配置:**

```typescript
// vite/plugins/components.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default function createComponentsPlugin() {
  return Components({
    resolvers: [ElementPlusResolver()],
    dts: 'src/types/components.d.ts'
  })
}
```

**使用示例:**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
    <el-form-item label="用户名" prop="userName">
      <el-input v-model="form.userName" placeholder="请输入用户名" />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" placeholder="请输入邮箱" />
    </el-form-item>

    <el-form-item label="角色" prop="roleIds">
      <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
        <el-option
          v-for="role in roles"
          :key="role.roleId"
          :label="role.roleName"
          :value="role.roleId"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  userName: '',
  email: '',
  roleIds: []
})

const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('表单提交', form)
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

#### UnoCSS 66.5.2

UnoCSS 是即时原子化 CSS 引擎,提供高性能的原子化 CSS 解决方案。

**核心特性:**

- **即时生成** - 按需生成 CSS,极快的构建速度
- **完全可定制** - 灵活的配置和扩展
- **预设系统** - 内置多种预设(Tailwind、Windi、Attributify)
- **图标支持** - 集成 Iconify,支持 10万+ 图标
- **变体系统** - 支持响应式、暗黑模式等变体

**配置示例:**

```typescript
import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  // 预设
  presets: [
    presetUno(),           // Tailwind/Windi CSS 预设
    presetAttributify(),   // 属性化模式
    presetIcons({          // 图标预设
      scale: 1.2,
      warn: true,
      collections: {
        // 自定义图标集
      }
    })
  ],

  // 自定义规则
  rules: [
    ['flex-center', { display: 'flex', 'align-items': 'center', 'justify-content': 'center' }],
    ['flex-between', { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between' }]
  ],

  // 快捷方式
  shortcuts: {
    'text-ellipsis': 'overflow-hidden text-overflow-ellipsis whitespace-nowrap',
    'text-ellipsis-2': 'overflow-hidden line-clamp-2'
  },

  // 主题
  theme: {
    colors: {
      primary: '#409eff',
      success: '#67c23a',
      warning: '#e6a23c',
      danger: '#f56c6c',
      info: '#909399'
    }
  }
})
```

**使用示例:**

```vue
<template>
  <!-- 传统 class 方式 -->
  <div class="flex items-center justify-between px-4 py-2 bg-gray-100 rounded">
    <span class="text-lg font-bold text-primary">标题</span>
    <el-button type="primary" size="small">操作</el-button>
  </div>

  <!-- 属性化模式 -->
  <div flex="~ items-center justify-between" px-4 py-2 bg-gray-100 rounded>
    <span text-lg font-bold text-primary>标题</span>
    <el-button type="primary" size="small">操作</el-button>
  </div>

  <!-- 使用快捷方式 -->
  <div class="flex-between px-4 py-2">
    <span class="text-ellipsis">这是一段很长的文本内容</span>
  </div>

  <!-- 使用图标 -->
  <div class="i-carbon-user text-2xl text-primary" />
  <div class="i-carbon-settings text-2xl text-gray-600" />
</template>
```

### 工具链

#### ESLint 9.21.0

ESLint 是 JavaScript 代码检查工具,帮助发现和修复代码问题。

**配置示例:**

```typescript
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off'
    }
  }
]
```

#### Prettier 3.5.2

Prettier 是代码格式化工具,统一代码风格。

**配置示例:**

```javascript
module.exports = {
  // 每行最大长度
  printWidth: 120,
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 不使用 tab 缩进
  useTabs: false,
  // 语句末尾添加分号
  semi: false,
  // 使用单引号
  singleQuote: true,
  // 对象属性引号
  quoteProps: 'as-needed',
  // JSX 使用单引号
  jsxSingleQuote: false,
  // 尾随逗号
  trailingComma: 'none',
  // 对象括号空格
  bracketSpacing: true,
  // 箭头函数参数括号
  arrowParens: 'always',
  // 换行符
  endOfLine: 'lf'
}
```

### 其他依赖

#### Axios 1.8.4

Axios 是基于 Promise 的 HTTP 客户端,用于浏览器和 Node.js。

**请求封装:**

```typescript
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    // 添加 token
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, data, msg } = response.data

    // 成功响应
    if (code === 200) {
      return [null, data]
    }

    // 业务错误
    ElMessage.error(msg || '请求失败')
    return [new Error(msg), null]
  },
  (error) => {
    // 网络错误
    let message = error.message || '网络错误'

    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权,请重新登录'
          // 清除 token,跳转登录页
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = `连接错误${error.response.status}`
      }
    }

    ElMessage.error(message)
    return [error, null]
  }
)

export default service
```

#### ECharts 5.6.0

ECharts 是百度开源的数据可视化图表库。

**使用示例:**

```vue
<template>
  <div ref="chartRef" class="chart" style="width: 100%; height: 400px"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: EChartsOption = {
    title: {
      text: '销售统计'
    },
    tooltip: {},
    xAxis: {
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {},
    series: [
      {
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }
    ]
  }

  chartInstance.setOption(option)

  // 自适应大小
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  chartInstance?.resize()
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>
```

#### @vueuse/core 13.1.0

VueUse 是基于 Composition API 的实用函数集合。

**常用函数:**

```typescript
import { useStorage, useDark, useToggle, useDebounce, useThrottle } from '@vueuse/core'

// 持久化存储
const userName = useStorage('user-name', '')

// 暗黑模式
const isDark = useDark()
const toggleDark = useToggle(isDark)

// 防抖
const debouncedValue = useDebounce(searchText, 500)

// 节流
const throttledFn = useThrottle(() => {
  console.log('throttled')
}, 1000)
```

## 项目结构

### 目录组织

```
plus-ui/
├── env/                        # 环境变量配置
│   ├── .env.development        # 开发环境
│   ├── .env.production         # 生产环境
│   └── .env.test               # 测试环境
├── public/                     # 静态资源(不经过 Vite 处理)
│   ├── favicon.ico             # 网站图标
│   └── logo.png                # Logo
├── src/                        # 源代码目录
│   ├── api/                    # API 接口定义
│   │   ├── business/           # 业务模块 API
│   │   ├── common/             # 通用 API
│   │   ├── system/             # 系统模块 API
│   │   ├── tool/               # 工具模块 API
│   │   └── workflow/           # 工作流 API
│   ├── assets/                 # 资源文件(经过 Vite 处理)
│   │   ├── icons/              # SVG 图标
│   │   ├── images/             # 图片资源
│   │   └── styles/             # 全局样式
│   ├── components/             # 公共组件
│   │   ├── AAi/                # AI 对话组件
│   │   ├── ACard/              # 卡片组件
│   │   ├── AForm/              # 表单组件
│   │   ├── AModal/             # 弹窗组件
│   │   ├── ASearchForm/        # 搜索表单
│   │   └── ...                 # 其他组件
│   ├── composables/            # 组合式函数
│   │   ├── useAuth.ts          # 权限验证
│   │   ├── useDialog.ts        # 弹窗管理
│   │   ├── useDict.ts          # 字典管理
│   │   ├── useTheme.ts         # 主题切换
│   │   └── ...                 # 其他 Composables
│   ├── directives/             # 自定义指令
│   │   ├── permission/         # 权限指令
│   │   ├── dialog/             # 弹窗指令
│   │   └── common/             # 通用指令
│   ├── layouts/                # 布局组件
│   │   ├── components/         # 布局子组件
│   │   ├── Layout.vue          # 主布局
│   │   ├── HomeLayout.vue      # 首页布局
│   │   └── BlankLayout.vue     # 空白布局
│   ├── locales/                # 国际化
│   │   ├── lang/               # 语言文件
│   │   └── i18n.ts             # i18n 配置
│   ├── plugins/                # 插件配置
│   │   ├── element-plus.ts     # Element Plus
│   │   ├── echarts.ts          # ECharts
│   │   └── index.ts            # 插件导出
│   ├── router/                 # 路由配置
│   │   ├── modules/            # 路由模块
│   │   ├── utils/              # 路由工具
│   │   ├── guard.ts            # 路由守卫
│   │   └── router.ts           # 路由实例
│   ├── stores/                 # Pinia 状态管理
│   │   ├── modules/            # Store 模块
│   │   │   ├── user.ts         # 用户状态
│   │   │   ├── permission.ts   # 权限状态
│   │   │   ├── dict.ts         # 字典状态
│   │   │   └── ...             # 其他 Store
│   │   └── store.ts            # Pinia 实例
│   ├── types/                  # TypeScript 类型定义
│   │   ├── global.d.ts         # 全局类型
│   │   ├── env.d.ts            # 环境变量类型
│   │   ├── auto-imports.d.ts   # 自动导入类型
│   │   └── components.d.ts     # 组件类型
│   ├── utils/                  # 工具函数
│   │   ├── boolean.ts          # 布尔工具
│   │   ├── cache.ts            # 缓存工具
│   │   ├── crypto.ts           # 加密工具
│   │   ├── date.ts             # 日期工具
│   │   ├── format.ts           # 格式化工具
│   │   ├── modal.ts            # 弹窗工具
│   │   ├── string.ts           # 字符串工具
│   │   ├── tree.ts             # 树形工具
│   │   └── validators.ts       # 验证工具
│   ├── views/                  # 页面组件
│   │   ├── business/           # 业务模块页面
│   │   ├── common/             # 通用页面
│   │   ├── system/             # 系统模块页面
│   │   ├── tool/               # 工具模块页面
│   │   └── workflow/           # 工作流页面
│   ├── App.vue                 # 根组件
│   ├── main.ts                 # 应用入口
│   └── systemConfig.ts         # 系统配置
├── vite/                       # Vite 插件配置
│   └── plugins/                # 自定义插件
│       ├── auto-imports.ts     # 自动导入
│       ├── components.ts       # 组件自动注册
│       ├── compression.ts      # 压缩插件
│       ├── icons.ts            # 图标插件
│       └── unocss.ts           # UnoCSS 插件
├── .editorconfig               # 编辑器配置
├── .env.production             # 生产环境变量
├── .gitignore                  # Git 忽略文件
├── .npmrc                      # npm 配置
├── .prettierignore             # Prettier 忽略文件
├── .prettierrc.js              # Prettier 配置
├── eslint.config.ts            # ESLint 配置
├── index.html                  # HTML 模板
├── package.json                # 项目依赖
├── pnpm-lock.yaml              # 依赖锁定文件
├── README.md                   # 项目说明
├── tsconfig.json               # TypeScript 配置
├── uno.config.ts               # UnoCSS 配置
└── vite.config.ts              # Vite 配置
```

### 分层架构

**RuoYi-Plus-UniApp 采用清晰的分层架构:**

```
┌─────────────────────────────────────┐
│         视图层 (View Layer)          │
│     Vue 组件、页面、布局              │
└─────────────────────────────────────┘
                  ↓↑
┌─────────────────────────────────────┐
│      业务逻辑层 (Business Layer)      │
│  Composables、Stores、自定义指令      │
└─────────────────────────────────────┘
                  ↓↑
┌─────────────────────────────────────┐
│      数据访问层 (Data Access Layer)  │
│         API 接口、HTTP 请求           │
└─────────────────────────────────────┘
                  ↓↑
┌─────────────────────────────────────┐
│        工具层 (Utility Layer)        │
│    工具函数、常量、类型定义            │
└─────────────────────────────────────┘
```

**各层职责:**

1. **视图层** - 负责用户界面展示和交互
   - Vue 组件
   - 页面布局
   - 模板和样式

2. **业务逻辑层** - 负责业务逻辑处理
   - Composables 封装可复用逻辑
   - Stores 管理全局状态
   - 自定义指令扩展 DOM 行为

3. **数据访问层** - 负责数据获取和处理
   - API 接口定义
   - HTTP 请求封装
   - 数据转换和映射

4. **工具层** - 负责提供通用工具
   - 工具函数
   - 常量定义
   - 类型定义

## 核心特性

### 1. 模块化设计

**功能模块划分:**

项目按照业务功能划分为多个模块,每个模块包含独立的 API、组件、页面和状态管理。

```
system/              # 系统管理模块
├── core/            # 核心功能
│   ├── user/        # 用户管理
│   ├── role/        # 角色管理
│   ├── menu/        # 菜单管理
│   ├── dept/        # 部门管理
│   └── ...
├── log/             # 日志管理
└── monitor/         # 系统监控

business/            # 业务模块
├── base/            # 基础业务
│   ├── ad/          # 广告管理
│   ├── payment/     # 支付管理
│   └── ...
└── mall/            # 商城业务
    ├── goods/       # 商品管理
    ├── order/       # 订单管理
    └── ...

tool/                # 工具模块
├── gen/             # 代码生成
└── swagger/         # 接口文档

workflow/            # 工作流模块
├── definition/      # 流程定义
├── instance/        # 流程实例
└── task/            # 任务管理
```

### 2. 类型安全

**全面的 TypeScript 支持:**

```typescript
// API 类型定义
export interface UserQuery {
  pageNum: number
  pageSize: number
  userName?: string
  status?: string
}

export interface UserVo {
  userId: number
  userName: string
  nickName: string
  email: string
  phone: string
  status: string
}

// API 函数定义
export const listUser = (query: UserQuery): Result<PageResult<UserVo>> => {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// 组件 Props 类型
interface ASearchFormProps {
  modelValue: Record<string, any>
  visible?: boolean
  inline?: boolean
  labelWidth?: string
  collapsible?: boolean
}

// 组件 Emits 类型
interface ASearchFormEmits {
  'update:modelValue': [value: Record<string, any>]
  'search': []
  'reset': []
}
```

### 3. 状态管理

**Pinia 模块化状态管理:**

```typescript
// User Store
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // ... 状态和方法

  return { userInfo, token, roles, permissions, /* ... */ }
})

// Permission Store
export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])

  // ... 状态和方法

  return { routes, dynamicRoutes, /* ... */ }
})

// Dict Store
export const useDictStore = defineStore('dict', () => {
  const dicts = ref<Map<string, DictItem[]>>(new Map())

  // ... 状态和方法

  return { dicts, /* ... */ }
})
```

### 4. 路由管理

**动态路由生成:**

基于用户权限动态生成路由,实现细粒度的权限控制。

```typescript
export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])

  // 生成动态路由
  const generateRoutes = async (): Promise<[Error | null, RouteRecordRaw[] | null]> => {
    const userStore = useUserStore()
    const roles = userStore.roles

    // 获取后端路由配置
    const [err, data] = await getRouters()
    if (err) {
      return [err, null]
    }

    // 过滤路由
    const accessRoutes = filterRoutes(data, roles)

    // 保存路由
    routes.value = constantRoutes.concat(accessRoutes)

    return [null, accessRoutes]
  }

  return { routes, generateRoutes }
})
```

**路由守卫实现:**

```typescript
// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 未登录
  if (!userStore.token) {
    if (WHITE_LIST.includes(to.path)) {
      return next()
    }
    return next(`/login?redirect=${to.fullPath}`)
  }

  // 已登录访问登录页
  if (to.path === '/login') {
    return next({ path: '/' })
  }

  // 获取用户信息和生成动态路由
  if (userStore.roles.length === 0) {
    await userStore.fetchUserInfo()
    const accessRoutes = await permissionStore.generateRoutes()
    accessRoutes.forEach(route => router.addRoute(route))
    next({ ...to, replace: true })
  } else {
    next()
  }
})
```

### 5. HTTP 请求

**统一的请求封装:**

```typescript
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    // 添加 Token
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { code, data, msg } = response.data

    if (code === 200) {
      return [null, data]
    }

    // 处理业务错误
    if (code === 401) {
      // Token 过期,清除登录状态
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    }

    ElMessage.error(msg || '请求失败')
    return [new Error(msg), null]
  },
  (error) => {
    // 处理网络错误
    ElMessage.error(error.message || '网络错误')
    return [error, null]
  }
)
```

### 6. 权限控制

**多维度权限控制:**

```typescript
// 1. 路由权限 - 在路由元信息中配置
{
  path: '/system/user',
  component: () => import('@/views/system/user/user.vue'),
  meta: {
    title: '用户管理',
    perms: ['system:user:list']
  }
}

// 2. 按钮权限 - 使用自定义指令
<el-button v-hasPermi="['system:user:add']">新增</el-button>
<el-button v-hasPermi="['system:user:edit']">编辑</el-button>
<el-button v-hasPermi="['system:user:remove']">删除</el-button>

// 3. 接口权限 - 后端验证
export const addUser = (data: UserForm): Result<void> => {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

// 4. 数据权限 - 基于角色和部门
const userStore = useUserStore()
const hasDataScope = (deptId: number) => {
  // 检查用户是否有权限访问该部门数据
  return userStore.dataScope.includes(deptId)
}
```

## 设计原则

### 1. 单一职责原则 (SRP)

每个模块、组件、函数都应该有一个明确的职责。

**示例:**

```typescript
// ❌ 不推荐: 一个函数做太多事情
const handleUser = (user: User) => {
  // 验证
  if (!user.userName) throw new Error('用户名不能为空')
  // 格式化
  user.userName = user.userName.trim()
  // 保存
  saveUser(user)
  // 发送通知
  sendNotification(user)
}

// ✅ 推荐: 职责分离
const validateUser = (user: User) => {
  if (!user.userName) throw new Error('用户名不能为空')
}

const formatUser = (user: User) => {
  return {
    ...user,
    userName: user.userName.trim()
  }
}

const handleUser = async (user: User) => {
  validateUser(user)
  const formatted = formatUser(user)
  await saveUser(formatted)
  await sendNotification(formatted)
}
```

### 2. 开放封闭原则 (OCP)

对扩展开放,对修改封闭。

**示例:**

```typescript
// ❌ 不推荐: 每次添加新类型都要修改代码
const getButtonClass = (type: string) => {
  if (type === 'primary') return 'btn-primary'
  if (type === 'success') return 'btn-success'
  if (type === 'danger') return 'btn-danger'
  // 添加新类型需要修改这里
}

// ✅ 推荐: 使用配置对象,易于扩展
const BUTTON_CLASS_MAP = {
  primary: 'btn-primary',
  success: 'btn-success',
  danger: 'btn-danger'
  // 添加新类型只需添加配置
}

const getButtonClass = (type: string) => {
  return BUTTON_CLASS_MAP[type] || 'btn-default'
}
```

### 3. 依赖倒置原则 (DIP)

高层模块不应该依赖低层模块,两者都应该依赖抽象。

**示例:**

```typescript
// ❌ 不推荐: 直接依赖具体实现
class UserService {
  private api = new HttpClient()

  async getUser(id: number) {
    return this.api.get(`/user/${id}`)
  }
}

// ✅ 推荐: 依赖抽象接口
interface IHttpClient {
  get(url: string): Promise<any>
  post(url: string, data: any): Promise<any>
}

class UserService {
  constructor(private api: IHttpClient) {}

  async getUser(id: number) {
    return this.api.get(`/user/${id}`)
  }
}
```

### 4. 接口隔离原则 (ISP)

客户端不应该依赖它不需要的接口。

**示例:**

```typescript
// ❌ 不推荐: 接口太大,包含不必要的方法
interface IUser {
  login(): void
  logout(): void
  register(): void
  updateProfile(): void
  changePassword(): void
  deleteAccount(): void
}

// ✅ 推荐: 接口分离
interface IAuth {
  login(): void
  logout(): void
}

interface IUserProfile {
  updateProfile(): void
  changePassword(): void
}

interface IUserManagement {
  register(): void
  deleteAccount(): void
}
```

## 性能优化

### 1. 代码分割

**路由懒加载:**

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/system/user',
    component: () => import('@/views/system/user/user.vue')
  },
  {
    path: '/system/role',
    component: () => import('@/views/system/role/role.vue')
  }
]
```

**组件懒加载:**

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
)
</script>
```

**动态导入:**

```typescript
const loadModule = async (moduleName: string) => {
  const module = await import(`./modules/${moduleName}.ts`)
  return module.default
}
```

### 2. 资源优化

**图片懒加载:**

```vue
<template>
  <img v-lazy="imageUrl" alt="懒加载图片" />
</template>
```

**Vite 静态资源处理:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // 小于 4KB 的资源内联为 base64
    rollupOptions: {
      output: {
        // 静态资源分类打包
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
})
```

### 3. 渲染优化

**虚拟列表:**

```vue
<template>
  <virtual-list
    :data="longList"
    :data-key="'id'"
    :data-sources="longList"
    :data-component="itemComponent"
    :estimate-size="50"
  />
</template>
```

**keep-alive 缓存:**

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="$route.path" />
    </keep-alive>
  </router-view>
</template>
```

**防抖节流:**

```typescript
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

// 防抖
const debouncedSearch = useDebounceFn(() => {
  search()
}, 500)

// 节流
const throttledScroll = useThrottleFn(() => {
  handleScroll()
}, 200)
```

### 4. 构建优化

**Vite 构建优化:**

```typescript
export default defineConfig({
  build: {
    // 生产环境移除 console
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Gzip 压缩
    minify: 'terser',
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts']
        }
      }
    }
  }
})
```

## 安全考虑

### 1. XSS 防护

**输入过滤:**

```typescript
// 过滤 HTML 标签
const sanitizeHtml = (html: string) => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// 使用 DOMPurify 库
import DOMPurify from 'dompurify'

const cleanHtml = DOMPurify.sanitize(dirtyHtml)
```

**CSP 策略:**

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
">
```

### 2. CSRF 防护

**Token 验证:**

```typescript
// 请求拦截器添加 CSRF Token
service.interceptors.request.use(config => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})
```

### 3. 权限控制

**前端权限验证:**

```typescript
// 检查权限
export const hasPermission = (perms: string[]) => {
  const userStore = useUserStore()
  return perms.some(perm => userStore.permissions.includes(perm))
}

// 权限指令
app.directive('hasPermi', {
  mounted(el, binding) {
    const { value } = binding
    if (!hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
})
```

## 部署策略

### 1. 构建命令

```bash
# 开发环境构建
npm run build:dev

# 生产环境构建
npm run build:prod

# 预览构建结果
npm run preview
```

### 2. Nginx 配置

```nginx
server {
  listen 80;
  server_name example.com;

  # 前端资源
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }

  # API 代理
  location /api/ {
    proxy_pass http://localhost:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # Gzip 压缩
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
  gzip_min_length 1000;
}
```

### 3. Docker 部署

```dockerfile
# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build:prod

# 运行阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 总结

RuoYi-Plus-UniApp 前端架构采用现代化的技术栈和工程化方案,通过清晰的分层设计、模块化开发、组件化封装,为企业级应用提供了稳定、高效、可维护的技术基础。

**关键要点:**

- **现代化技术栈** - Vue 3 + TypeScript + Vite,提供优秀的开发体验
- **完整的类型系统** - TypeScript 全覆盖,编译时类型检查
- **模块化架构** - 按功能模块组织,高内聚低耦合
- **组件化开发** - 可复用组件体系,提高开发效率
- **性能优化** - 代码分割、懒加载、缓存策略
- **安全保障** - XSS、CSRF 防护,权限控制
- **工程化规范** - 统一的代码规范和构建流程
