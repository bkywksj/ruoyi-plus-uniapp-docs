# 技术栈介绍

## 概述

RuoYi-Plus-UniApp 前端框架采用现代化的技术栈构建，基于 Vue 3 生态系统，结合 TypeScript、Vite 等先进技术，为企业级应用提供高性能、高可维护性的开发解决方案。本文档详细介绍项目所使用的全部技术栈、版本信息、配置方式及最佳实践。

**核心特性：**

- **Vue 3 Composition API** - 采用组合式 API 实现更好的逻辑复用和代码组织
- **TypeScript 5.8** - 全面的类型安全保障，提升开发效率和代码质量
- **Vite 6.3** - 极速的开发服务器和构建工具，毫秒级热更新
- **Element Plus 2.9** - 成熟的企业级 UI 组件库
- **UnoCSS** - 即时原子化 CSS 引擎，按需生成样式
- **Pinia 3.0** - Vue 3 官方推荐的状态管理库

---

## 技术栈版本总览

### 核心依赖版本

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.13 | 渐进式 JavaScript 框架 |
| Vue Router | 4.5.0 | Vue 官方路由 |
| Pinia | 3.0.2 | Vue 官方状态管理 |
| TypeScript | 5.8.3 | JavaScript 超集 |
| Vite | 6.3.2 | 下一代前端构建工具 |
| Element Plus | 2.9.8 | Vue 3 企业级 UI 组件库 |
| UnoCSS | 66.5.2 | 原子化 CSS 引擎 |
| Axios | 1.8.4 | HTTP 客户端 |
| VueUse | 13.1.0 | Vue 组合式 API 工具集 |
| Vue I18n | 11.1.3 | 国际化解决方案 |
| ECharts | 5.6.0 | 数据可视化图表库 |
| Sass | 1.87.0 | CSS 预处理器 |

### 开发依赖版本

| 技术 | 版本 | 说明 |
|------|------|------|
| ESLint | 9.21.0 | 代码规范检查 |
| Prettier | 3.5.2 | 代码格式化 |
| Vitest | 3.1.2 | 单元测试框架 |
| unplugin-auto-import | 19.1.2 | API 自动导入 |
| unplugin-vue-components | 28.5.0 | 组件自动导入 |
| unplugin-icons | 22.1.0 | 图标自动导入 |
| vite-plugin-compression | 0.5.1 | 资源压缩插件 |
| vite-plugin-vue-devtools | 7.7.5 | Vue 开发工具 |

### 环境要求

```json
{
  "engines": {
    "node": ">=18.18.0",
    "npm": ">=8.9.0",
    "pnpm": ">=7.30"
  },
  "browserslist": [
    "Chrome >= 87",
    "Edge >= 88",
    "Safari >= 14",
    "Firefox >= 78"
  ]
}
```

---

## 核心框架技术

### Vue 3

Vue 3 是项目的核心框架，采用全新的 Composition API 架构，提供更好的逻辑复用和代码组织能力。

#### 响应式系统

Vue 3 基于 Proxy 实现全新的响应式系统，相比 Vue 2 的 `Object.defineProperty` 具有更好的性能和更完整的响应式支持。

```typescript
// 基础响应式示例
import { ref, reactive, computed, watch } from 'vue'

// ref - 用于基本类型
const count = ref(0)

// reactive - 用于对象类型
const state = reactive({
  user: null,
  loading: false,
  error: null
})

// computed - 计算属性
const doubleCount = computed(() => count.value * 2)

// watch - 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`)
})
```

#### Composition API

Composition API 是 Vue 3 的核心特性，通过组合式函数实现逻辑复用。

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 组件状态
const isLoading = ref(true)
const data = ref<UserInfo | null>(null)

// 生命周期钩子
onMounted(async () => {
  try {
    data.value = await fetchUserInfo()
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  // 清理资源
})
</script>

<template>
  <div v-if="isLoading">加载中...</div>
  <div v-else>{{ data?.name }}</div>
</template>
```

#### 组合式函数 (Composables)

项目采用组合式函数模式封装可复用的逻辑。

```typescript
// src/composables/useUser.ts
export function useUser() {
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchUser = async () => {
    loading.value = true
    error.value = null
    try {
      userInfo.value = await getUserInfo()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await logoutApi()
    userInfo.value = null
  }

  return {
    userInfo,
    loading,
    error,
    fetchUser,
    logout
  }
}
```

### Vue Router 4

Vue Router 4 是 Vue 3 的官方路由解决方案，提供完整的路由功能支持。

#### 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'dashboard',
          affix: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

export default router
```

#### 路由守卫

```typescript
// src/router/permission.ts
import router from './index'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'

// 白名单路由
const whiteList = ['/login', '/register', '/forget-password']

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 设置页面标题
  document.title = `${to.meta.title || ''} - ${import.meta.env.VITE_APP_TITLE}`

  // 判断是否已登录
  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 判断是否已加载路由
      if (permissionStore.routes.length === 0) {
        try {
          // 获取用户信息和权限
          await userStore.getInfo()
          // 生成动态路由
          const accessRoutes = await permissionStore.generateRoutes()
          // 动态添加路由
          accessRoutes.forEach((route) => {
            router.addRoute(route)
          })
          next({ ...to, replace: true })
        } catch (error) {
          // 获取信息失败，重新登录
          await userStore.logout()
          next(`/login?redirect=${to.path}`)
        }
      } else {
        next()
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})
```

#### 动态路由

项目支持基于后端权限的动态路由生成。

```typescript
// src/stores/modules/permission.ts
export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])

  // 根据后端返回的菜单生成路由
  const generateRoutes = async () => {
    const { data } = await getRouters()
    const asyncRoutes = filterAsyncRoutes(data)

    addRoutes.value = asyncRoutes
    routes.value = constantRoutes.concat(asyncRoutes)

    return asyncRoutes
  }

  // 过滤异步路由
  const filterAsyncRoutes = (routes: any[], roles?: string[]) => {
    const res: RouteRecordRaw[] = []

    routes.forEach((route) => {
      const tmp = { ...route }
      // 处理组件
      if (tmp.component === 'Layout') {
        tmp.component = Layout
      } else if (tmp.component === 'ParentView') {
        tmp.component = ParentView
      } else if (tmp.component === 'InnerLink') {
        tmp.component = InnerLink
      } else {
        tmp.component = loadView(tmp.component)
      }

      // 递归处理子路由
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }

      res.push(tmp)
    })

    return res
  }

  return {
    routes,
    addRoutes,
    generateRoutes
  }
})
```

### Pinia 状态管理

Pinia 是 Vue 3 官方推荐的状态管理库，提供更简洁的 API 和更好的 TypeScript 支持。

#### Store 定义

```typescript
// src/stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getInfo } from '@/api/auth'
import type { LoginData, UserInfo } from '@/types/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(getToken() || '')
  const userInfo = ref<UserInfo | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // 登录
  const loginAction = async (loginData: LoginData) => {
    const { data } = await login(loginData)
    token.value = data.access_token
    setToken(data.access_token)
  }

  // 获取用户信息
  const getInfoAction = async () => {
    const { data } = await getInfo()
    userInfo.value = data.user
    roles.value = data.roles
    permissions.value = data.permissions
    return data
  }

  // 登出
  const logoutAction = async () => {
    await logout()
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
    removeToken()
  }

  // 重置状态
  const resetState = () => {
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    loginAction,
    getInfoAction,
    logoutAction,
    resetState
  }
}, {
  persist: {
    // 持久化配置
    key: 'user-store',
    storage: localStorage,
    pick: ['token']
  }
})
```

#### Store 使用

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 使用 storeToRefs 保持响应式
const { userInfo, roles } = storeToRefs(userStore)

// 直接调用 action
const handleLogout = async () => {
  await userStore.logoutAction()
  router.push('/login')
}
</script>

<template>
  <div class="user-info">
    <span>{{ userInfo?.nickName }}</span>
    <el-button @click="handleLogout">退出登录</el-button>
  </div>
</template>
```

#### Store 持久化

```typescript
// src/stores/index.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()

// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

export default pinia
```

---

## 构建工具链

### Vite

Vite 是项目的核心构建工具，提供极速的开发服务器和优化的生产构建。

#### 基础配置

```typescript
// vite.config.ts
import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

  return defineConfig({
    // 环境变量目录
    envDir: './env',

    // 基础路径
    base: env.VITE_APP_CONTEXT_PATH,

    // 路径别名
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      strictPort: false,
      open: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'http://127.0.0.1:' + env.VITE_APP_BASE_API_PORT,
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        }
      }
    },

    // CSS 配置
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      },
      postcss: {
        plugins: [
          autoprefixer()
        ]
      }
    },

    // 依赖预构建
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@vueuse/core',
        'echarts',
        'vue-i18n',
        'element-plus/es/components/**/css'
      ]
    }
  })
}
```

#### 插件系统

项目使用模块化的插件配置方式。

```typescript
// vite/plugins/index.ts
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import createUnoCss from './unocss'
import createAutoImport from './auto-imports'
import createComponents from './components'
import createIcons from './icons'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import createOpenApiPlugin from './openapi'
import { createHmrControlPlugin } from './hmrControl'

export default (viteEnv: any, isBuild = false): [] => {
  const vitePlugins: any = []

  // Vue 官方插件
  vitePlugins.push(vue())

  // Vue 开发工具
  vitePlugins.push(vueDevTools())

  // UnoCSS 原子化 CSS
  vitePlugins.push(createUnoCss())

  // API 自动导入
  vitePlugins.push(createAutoImport(path))

  // 组件自动导入
  vitePlugins.push(createComponents(path))

  // 资源压缩
  vitePlugins.push(createCompression(viteEnv))

  // 图标自动导入
  vitePlugins.push(createIcons())

  // OpenAPI 代码生成
  vitePlugins.push(createOpenApiPlugin({
    input: `http://127.0.0.1:${apiPort}/v3/api-docs/business`,
    output: 'src/api',
    mode: 'manual',
    enabled: true
  }))

  // HMR 控制（开发模式）
  if (!isBuild) {
    vitePlugins.push(createHmrControlPlugin())
  }

  return vitePlugins
}
```

### TypeScript

项目采用 TypeScript 进行开发，提供完整的类型安全保障。

#### TypeScript 配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "baseUrl": ".",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "strict": true,
    "allowJs": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["node", "vite/client"],
    "noImplicitAny": false,
    "removeComments": true,
    "experimentalDecorators": true,
    "strictFunctionTypes": false,
    "strictNullChecks": false,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "vite.config.ts",
    "vitest.config.ts",
    "eslint.config.ts",
    "src/**/*.d.ts"
  ],
  "exclude": ["node_modules", "dist", "src/**/__tests__/*"]
}
```

#### 类型定义示例

```typescript
// src/types/auth.d.ts
export interface LoginData {
  username: string
  password: string
  code?: string
  uuid?: string
  rememberMe?: boolean
}

export interface LoginResult {
  access_token: string
  expires_in: number
}

export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  avatar: string
  email: string
  phonenumber: string
  sex: string
  deptId: number
  deptName: string
}

export interface UserInfoResult {
  user: UserInfo
  roles: string[]
  permissions: string[]
}
```

### 自动导入系统

项目配置了完整的自动导入系统，减少手动 import 的工作量。

#### API 自动导入

```typescript
// vite/plugins/auto-imports.ts
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default (path: any) => {
  return AutoImport({
    // 自动导入的库
    imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],

    // 自动导入目录
    dirs: ['src/composables', 'src/stores/modules'],

    // ESLint 配置
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true
    },

    // Element Plus 解析器
    resolvers: [ElementPlusResolver()],

    // Vue 模板中自动导入
    vueTemplate: true,

    // 类型声明文件
    dts: 'src/types/auto-imports.d.ts'
  })
}
```

#### 组件自动导入

```typescript
// vite/plugins/components.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'

export default (path: any) => {
  return Components({
    resolvers: [
      // Element Plus 组件自动导入
      ElementPlusResolver(),

      // 图标组件自动导入
      IconsResolver({
        enabledCollections: ['ep']
      })
    ],

    // 类型声明文件
    dts: path.resolve(path.join(process.cwd(), './src'), 'types', 'components.d.ts')
  })
}
```

#### 使用示例

```vue
<script setup lang="ts">
// 无需手动导入 Vue API
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 无需手动导入 VueUse
const { width, height } = useWindowSize()

// 无需手动导入 Pinia Store
const userStore = useUserStore()
</script>

<template>
  <!-- 无需手动导入 Element Plus 组件 -->
  <el-button type="primary" @click="count++">
    点击次数: {{ count }}
  </el-button>

  <!-- 无需手动导入图标组件 -->
  <i-ep-search />
</template>
```

---

## UI 组件与样式

### Element Plus

Element Plus 是项目的核心 UI 组件库，提供丰富的企业级组件。

#### 组件按需导入

项目采用自动按需导入方式，只打包使用到的组件。

```typescript
// 自动导入配置已在 vite 插件中完成
// 直接在模板中使用即可
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
```

#### 主题定制

```scss
// src/assets/styles/element-plus.scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #409eff
    ),
    'success': (
      'base': #67c23a
    ),
    'warning': (
      'base': #e6a23c
    ),
    'danger': (
      'base': #f56c6c
    ),
    'info': (
      'base': #909399
    )
  )
);

// 自定义组件样式
.el-button {
  --el-button-border-radius: 4px;
}

.el-card {
  --el-card-border-radius: 8px;
}
```

#### 图标使用

```vue
<template>
  <!-- 方式一: 自动导入 -->
  <i-ep-search />
  <i-ep-edit />
  <i-ep-delete />

  <!-- 方式二: Element Plus Icon 组件 -->
  <el-icon><Search /></el-icon>

  <!-- 方式三: 在按钮中使用 -->
  <el-button type="primary" :icon="Search">搜索</el-button>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
</script>
```

### UnoCSS 原子化 CSS

UnoCSS 是项目的原子化 CSS 引擎，提供即时生成的工具类。

#### 配置详解

```typescript
// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  // 快捷方式
  shortcuts: {
    'panel-title': 'pb-[5px] font-sans leading-[1.1] font-medium text-base text-[#6379bb] border-b border-b-solid border-[var(--el-border-color-light)] mb-5 mt-0',
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'card': 'bg-white dark:bg-dark-800 rounded shadow p-4',
    'tag': 'inline-block px-2 py-1 text-xs rounded'
  },

  // 主题配置
  theme: {
    colors: {
      'primary': 'var(--el-color-primary)',
      'primary_dark': 'var(--el-color-primary-light-5)',
      'success': 'var(--color-success)',
      'warning': 'var(--color-warning)',
      'danger': 'var(--color-danger)',
      'info': 'var(--color-info)',
      'text-base': 'var(--text-color)',
      'text-secondary': 'var(--text-color-secondary)',
      'border': 'var(--border-color)',
      'bg-base': 'var(--bg-color)',
      'bg-page': 'var(--bg-color-page)',
      'menu-bg': 'var(--menu-bg)',
      'menu-text': 'var(--menu-color)'
    },
    spacing: {
      'sidebar': 'var(--sidebar-width)',
      'header': 'var(--header-height)',
      'tags-view': 'var(--tags-view-height)'
    }
  },

  // 自定义规则
  rules: [
    ['sidebar-width', { 'width': 'var(--sidebar-width)' }],
    ['header-height', { 'height': 'var(--header-height)' }],
    ['scrollbar', { 'overflow': 'auto' }],
    ['scrollbar-y', { 'overflow-y': 'auto', 'overflow-x': 'hidden' }],
    ['text-ellipsis', { 'white-space': 'nowrap', 'overflow': 'hidden', 'text-overflow': 'ellipsis' }]
  ],

  // 预设
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({}),
    presetTypography(),
    presetWebFonts({})
  ],

  // 转换器
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ]
})
```

#### 使用示例

```vue
<template>
  <!-- 基础工具类 -->
  <div class="flex items-center justify-between p-4 bg-white rounded shadow">
    <span class="text-lg font-bold text-gray-800">标题</span>
    <span class="text-sm text-gray-500">描述文本</span>
  </div>

  <!-- 快捷方式 -->
  <div class="flex-center h-40 bg-primary text-white">
    居中内容
  </div>

  <!-- 变体组 -->
  <button class="hover:(bg-blue-500 text-white scale-105) transition-all">
    悬停效果
  </button>

  <!-- 属性化模式 -->
  <div text="xl blue-500" p="4" m="2" bg="gray-100">
    属性化写法
  </div>

  <!-- 响应式 -->
  <div class="w-full md:w-1/2 lg:w-1/3">
    响应式宽度
  </div>

  <!-- 暗色模式 -->
  <div class="bg-white dark:bg-gray-800 text-black dark:text-white">
    暗色模式支持
  </div>
</template>
```

### Sass 样式

项目使用 Sass 作为 CSS 预处理器，采用模块化的样式架构。

#### 样式目录结构

```text
src/assets/styles/
├── abstracts/           # 抽象层（变量、混入、函数）
│   ├── _variables.scss  # CSS 变量定义
│   ├── _mixins.scss     # 混入定义
│   └── _functions.scss  # Sass 函数
├── base/                # 基础样式
│   ├── _reset.scss      # 样式重置
│   ├── _typography.scss # 排版样式
│   └── _animations.scss # 动画定义
├── components/          # 组件样式
│   ├── _button.scss     # 按钮样式
│   ├── _card.scss       # 卡片样式
│   └── _form.scss       # 表单样式
├── layout/              # 布局样式
│   ├── _header.scss     # 头部布局
│   ├── _sidebar.scss    # 侧边栏布局
│   └── _content.scss    # 内容区布局
├── themes/              # 主题样式
│   ├── _light.scss      # 亮色主题
│   └── _dark.scss       # 暗色主题
├── vendors/             # 第三方样式
│   └── _element-plus.scss
└── index.scss           # 样式入口
```

#### 变量定义

```scss
// src/assets/styles/abstracts/_variables.scss
:root {
  // 颜色变量
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;

  // 文本颜色
  --text-color: #303133;
  --text-color-secondary: #606266;
  --text-color-placeholder: #c0c4cc;

  // 边框颜色
  --border-color: #dcdfe6;
  --border-color-light: #e4e7ed;
  --border-color-lighter: #ebeef5;

  // 背景颜色
  --bg-color: #ffffff;
  --bg-color-page: #f2f3f5;
  --bg-color-overlay: #ffffff;

  // 布局尺寸
  --sidebar-width: 210px;
  --sidebar-width-collapsed: 64px;
  --header-height: 50px;
  --tags-view-height: 34px;

  // 圆角
  --border-radius-base: 4px;
  --border-radius-small: 2px;
  --border-radius-large: 8px;

  // 阴影
  --shadow-base: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  --shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  // 过渡
  --transition-duration: 0.3s;
  --transition-timing: ease-in-out;
}

// 暗色主题
[data-theme='dark'] {
  --text-color: #e5eaf3;
  --text-color-secondary: #a3a6ad;
  --bg-color: #141414;
  --bg-color-page: #0a0a0a;
  --bg-color-overlay: #1d1e1f;
  --border-color: #4c4d4f;
}
```

---

## 开发工具与规范

### ESLint 代码规范

项目采用 ESLint 9 的扁平化配置方式。

```typescript
// eslint.config.ts
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from '@vue/eslint-config-prettier'

export default [
  // 基础 JavaScript 规则
  eslint.configs.recommended,

  // TypeScript 规则
  ...tseslint.configs.recommended,

  // Vue 规则
  ...pluginVue.configs['flat/recommended'],

  // Prettier 兼容
  eslintConfigPrettier,

  // 自定义规则
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',

      // TypeScript 规则
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',

      // 通用规则
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  },

  // 忽略文件
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '*.d.ts',
      'src/types/auto-imports.d.ts',
      'src/types/components.d.ts'
    ]
  }
]
```

### Prettier 代码格式化

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "none",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "auto",
  "vueIndentScriptAndStyle": false,
  "htmlWhitespaceSensitivity": "ignore"
}
```

### 开发脚本

```json
{
  "scripts": {
    "dev": "vite serve --mode development",
    "build:prod": "vite build --mode production",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint:eslint": "eslint --max-warnings=0 --timeout=60000",
    "lint:eslint:fix": "eslint --fix --timeout=60000",
    "prettier": "prettier --write ."
  }
}
```

---

## 功能增强库

### VueUse 组合式工具

VueUse 提供了 200+ 组合式函数，极大提升开发效率。

```typescript
// 常用组合式函数示例
import {
  useWindowSize,      // 窗口尺寸
  useLocalStorage,    // 本地存储
  useDebounceFn,      // 防抖函数
  useThrottleFn,      // 节流函数
  useEventListener,   // 事件监听
  useClipboard,       // 剪贴板
  useDark,            // 暗色模式
  useFullscreen,      // 全屏
  useTitle,           // 页面标题
  useOnline           // 网络状态
} from '@vueuse/core'

// 使用示例
const { width, height } = useWindowSize()
const storedValue = useLocalStorage('key', 'default')
const isDark = useDark()
const { toggle: toggleFullscreen } = useFullscreen()
const { copy, copied } = useClipboard()
```

### Axios HTTP 客户端

项目对 Axios 进行了完整封装，提供统一的请求/响应处理。

```typescript
// src/utils/request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    // 添加 token
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }

    // 添加租户 ID
    const tenantId = getTenantId()
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId
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
    const { code, msg, data } = response.data

    // 成功响应
    if (code === 200) {
      return response.data
    }

    // 业务错误
    ElMessage.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (error) => {
    const { response } = error

    // 处理 HTTP 错误
    if (response) {
      switch (response.status) {
        case 401:
          // 未授权，跳转登录
          handleUnauthorized()
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(response.data?.msg || '请求失败')
      }
    } else {
      ElMessage.error('网络连接异常')
    }

    return Promise.reject(error)
  }
)

export default service
```

### ECharts 数据可视化

```typescript
// src/composables/useECharts.ts
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref, Ref, watch } from 'vue'
import { useDark, useResizeObserver } from '@vueuse/core'

export function useECharts(
  chartRef: Ref<HTMLElement | null>,
  options: Ref<echarts.EChartsOption>
) {
  let chartInstance: echarts.ECharts | null = null
  const isDark = useDark()

  // 初始化图表
  const initChart = () => {
    if (!chartRef.value) return

    chartInstance = echarts.init(
      chartRef.value,
      isDark.value ? 'dark' : 'light'
    )
    chartInstance.setOption(options.value)
  }

  // 更新图表
  const updateChart = () => {
    chartInstance?.setOption(options.value)
  }

  // 调整大小
  const resize = () => {
    chartInstance?.resize()
  }

  // 监听主题变化
  watch(isDark, () => {
    chartInstance?.dispose()
    initChart()
  })

  // 监听配置变化
  watch(options, updateChart, { deep: true })

  // 监听容器大小变化
  useResizeObserver(chartRef, resize)

  onMounted(initChart)

  onUnmounted(() => {
    chartInstance?.dispose()
    chartInstance = null
  })

  return {
    chartInstance,
    resize
  }
}
```

### Vue I18n 国际化

```typescript
// src/i18n/index.ts
import { createI18n } from 'vue-i18n'
import zhCn from './locales/zh-cn'
import en from './locales/en'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh-cn',
  fallbackLocale: 'zh-cn',
  messages: {
    'zh-cn': zhCn,
    'en': en
  }
})

export default i18n
```

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const changeLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}
</script>

<template>
  <div>
    <h1>{{ t('common.title') }}</h1>
    <el-select v-model="locale" @change="changeLanguage">
      <el-option label="中文" value="zh-cn" />
      <el-option label="English" value="en" />
    </el-select>
  </div>
</template>
```

### 加密库

项目使用 CryptoJS 和 JSEncrypt 实现数据加密。

```typescript
// src/utils/crypto.ts
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

// AES 加密
export function encryptAES(data: string, key: string): string {
  const keyHex = CryptoJS.enc.Utf8.parse(key)
  const encrypted = CryptoJS.AES.encrypt(data, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

// AES 解密
export function decryptAES(encryptedData: string, key: string): string {
  const keyHex = CryptoJS.enc.Utf8.parse(key)
  const decrypted = CryptoJS.AES.decrypt(encryptedData, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

// RSA 加密
export function encryptRSA(data: string, publicKey: string): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  return encrypt.encrypt(data) || ''
}

// 生成随机 AES 密钥
export function generateAESKey(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
```

---

## 技术选型对比

### Vue 3 vs Vue 2

| 特性 | Vue 3 | Vue 2 |
|------|-------|-------|
| 响应式系统 | Proxy | Object.defineProperty |
| API 风格 | Composition API + Options API | Options API |
| TypeScript | 原生支持 | 需要额外配置 |
| 性能 | 更快 | 相对较慢 |
| 包体积 | 更小（Tree-shaking） | 较大 |
| 生命周期 | setup + 生命周期钩子 | 选项式生命周期 |

### Pinia vs Vuex

| 特性 | Pinia | Vuex |
|------|-------|------|
| API 复杂度 | 简单 | 相对复杂 |
| TypeScript | 原生支持 | 需要额外类型定义 |
| 模块化 | 天然支持 | 需要手动配置 |
| DevTools | 完整支持 | 完整支持 |
| 体积 | 更小 | 较大 |
| Mutations | 不需要 | 必须 |

### Vite vs Webpack

| 特性 | Vite | Webpack |
|------|------|---------|
| 启动速度 | 极快（毫秒级） | 较慢（秒级） |
| 热更新 | 极快 | 较慢 |
| 配置复杂度 | 简单 | 复杂 |
| 插件生态 | 快速增长 | 成熟完善 |
| 生产构建 | Rollup | Webpack |
| ESM 支持 | 原生支持 | 需要配置 |

### UnoCSS vs Tailwind CSS

| 特性 | UnoCSS | Tailwind CSS |
|------|--------|--------------|
| 构建速度 | 极快 | 较快 |
| 按需生成 | 实时按需 | 预生成 + Purge |
| 自定义规则 | 灵活简单 | 相对复杂 |
| 预设系统 | 丰富 | 插件系统 |
| 属性化模式 | 内置支持 | 需要插件 |
| 打包体积 | 极小 | 较小 |

---

## 最佳实践

### 1. 组件设计原则

```vue
<!-- 推荐: 使用 Composition API + TypeScript -->
<script setup lang="ts">
interface Props {
  title: string
  loading?: boolean
  data?: Record<string, any>[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  data: () => []
})

const emit = defineEmits<{
  (e: 'update', value: Record<string, any>): void
  (e: 'delete', id: number): void
}>()
</script>

<template>
  <div class="component-wrapper">
    <h3>{{ title }}</h3>
    <el-skeleton v-if="loading" :rows="3" />
    <template v-else>
      <div v-for="item in data" :key="item.id">
        {{ item.name }}
      </div>
    </template>
  </div>
</template>
```

### 2. 状态管理规范

```typescript
// 推荐: 使用 setup store 语法
export const useExampleStore = defineStore('example', () => {
  // 状态
  const list = ref<ExampleItem[]>([])
  const loading = ref(false)
  const current = ref<ExampleItem | null>(null)

  // Getter
  const total = computed(() => list.value.length)
  const isEmpty = computed(() => list.value.length === 0)

  // Action
  const fetchList = async (params?: QueryParams) => {
    loading.value = true
    try {
      const { data } = await getListApi(params)
      list.value = data.rows
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    list.value = []
    current.value = null
  }

  return {
    list,
    loading,
    current,
    total,
    isEmpty,
    fetchList,
    reset
  }
})
```

### 3. API 请求封装

```typescript
// 推荐: 统一的 API 模块结构
// src/api/system/user.ts
import request from '@/utils/request'
import type { UserQuery, UserForm, UserInfo } from '@/types/system/user'

// 查询用户列表
export function listUser(query: UserQuery) {
  return request<PageResult<UserInfo>>({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// 获取用户详情
export function getUser(userId: number) {
  return request<UserInfo>({
    url: `/system/user/${userId}`,
    method: 'get'
  })
}

// 新增用户
export function addUser(data: UserForm) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  })
}

// 修改用户
export function updateUser(data: UserForm) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

// 删除用户
export function delUser(userIds: number | number[]) {
  return request({
    url: `/system/user/${userIds}`,
    method: 'delete'
  })
}
```

### 4. 样式编写规范

```scss
// 推荐: 使用 BEM 命名 + CSS 变量
.user-card {
  padding: var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-light);

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  &__title {
    font-size: var(--font-size-lg);
    color: var(--heading-color);
  }

  &__content {
    color: var(--text-color);
  }

  &--active {
    border-color: var(--primary-color);
  }
}
```

---

## 常见问题

### 1. 开发服务器启动慢

**问题原因：**
- 依赖预构建未完成
- 大量依赖需要转换

**解决方案：**
```typescript
// vite.config.ts
optimizeDeps: {
  include: [
    'vue',
    'vue-router',
    'pinia',
    'axios',
    '@vueuse/core',
    'echarts',
    'element-plus/es/components/**/css'
  ]
}
```

### 2. 打包体积过大

**问题原因：**
- 未按需加载组件
- 第三方库未进行 Tree-shaking

**解决方案：**
```typescript
// 使用动态导入
const ECharts = defineAsyncComponent(() => import('echarts'))

// 路由懒加载
{
  path: '/dashboard',
  component: () => import('@/views/dashboard/index.vue')
}
```

### 3. 类型推导不准确

**问题原因：**
- 自动导入的类型声明未生成
- tsconfig 配置问题

**解决方案：**
```json
{
  "compilerOptions": {
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "src/**/*.d.ts"
  ]
}
```

### 4. 热更新失效

**问题原因：**
- 文件监听数量超限
- 组件未正确声明

**解决方案：**
```typescript
// vite.config.ts
server: {
  watch: {
    usePolling: true,
    interval: 100
  }
}
```

### 5. Element Plus 样式丢失

**问题原因：**
- 自动导入配置不完整
- CSS 导入顺序问题

**解决方案：**
```typescript
// vite/plugins/components.ts
ElementPlusResolver({
  importStyle: 'sass'
})
```

---

## 总结

RuoYi-Plus-UniApp 前端框架基于现代化的技术栈构建，通过合理的技术选型和架构设计，实现了高性能、高可维护性的企业级应用开发方案。主要技术特点包括：

1. **Vue 3 + TypeScript** - 提供完整的类型安全和更好的开发体验
2. **Vite** - 极速的开发服务器和优化的生产构建
3. **Element Plus** - 成熟稳定的企业级 UI 组件库
4. **UnoCSS** - 高性能的原子化 CSS 解决方案
5. **Pinia** - 简洁高效的状态管理
6. **自动导入** - 减少样板代码，提升开发效率

无论是中小型项目还是大型企业应用，该技术栈都能提供稳定可靠的技术支撑，是现代前端开发的优秀实践。
