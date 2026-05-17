# API 自动导入插件

## 介绍

API 自动导入插件（unplugin-auto-import）用于自动导入 Vue、UniApp、Pinia 等框架的常用 API，以及项目中的 Composables 和 Store 模块。该插件消除了手动 import 语句的繁琐操作，让开发者可以直接在代码中使用常用函数，同时保持完整的 TypeScript 类型支持。

**核心特性：**

- **框架 API 自动导入** - 自动导入 Vue、UniApp、Pinia 的核心 API，无需手动 import
- **自定义目录扫描** - 支持自动扫描 composables 和 stores 目录，导入自定义函数
- **TypeScript 支持** - 自动生成类型声明文件，提供完整的 IDE 智能提示
- **ESLint 集成** - 自动生成 ESLint 配置，避免 no-undef 错误
- **Vue 模板支持** - 在 Vue 模板中也能使用自动导入的 API
- **按需导入** - 仅导入实际使用的 API，优化打包体积

## 基本用法

### 插件配置

在 `vite/plugins/auto-imports.ts` 中配置：

```typescript
import AutoImport from 'unplugin-auto-import/vite'

export default () => {
  return AutoImport({
    // 预设导入的库
    imports: ['vue', 'uni-app', 'pinia'],
    // 自动扫描的目录
    dirs: ['src/composables', 'src/stores/modules'],
    // ESLint 配置
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true,
    },
    // Vue 模板支持
    vueTemplate: true,
    // 类型声明文件
    dts: 'src/types/auto-imports.d.ts',
  })
}
```

### 在插件入口中注册

```typescript
// vite/plugins/index.ts
import createAutoImport from './auto-imports'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 其他插件...

  // 自动导入插件
  vitePlugins.push(createAutoImport())

  return vitePlugins
}
```

## 配置选项

### imports

- **类型**: `string[]`
- **默认值**: `['vue', 'uni-app', 'pinia']`
- **说明**: 预设导入的库列表

```typescript
AutoImport({
  imports: [
    'vue',      // ref, computed, watch, onMounted 等
    'uni-app',  // onLoad, onShow, onHide 等
    'pinia',    // defineStore, storeToRefs 等
  ],
})
```

**Vue 预设导入的 API：**

| API | 说明 |
|-----|------|
| `ref` | 创建响应式引用 |
| `reactive` | 创建响应式对象 |
| `computed` | 创建计算属性 |
| `watch` | 侦听器 |
| `watchEffect` | 副作用侦听器 |
| `onMounted` | 挂载完成钩子 |
| `onUnmounted` | 卸载钩子 |
| `nextTick` | DOM 更新后回调 |
| `provide` / `inject` | 依赖注入 |
| `defineComponent` | 定义组件 |
| `defineAsyncComponent` | 定义异步组件 |

**UniApp 预设导入的 API：**

| API | 说明 |
|-----|------|
| `onLoad` | 页面加载 |
| `onShow` | 页面显示 |
| `onHide` | 页面隐藏 |
| `onReady` | 页面初次渲染完成 |
| `onUnload` | 页面卸载 |
| `onPullDownRefresh` | 下拉刷新 |
| `onReachBottom` | 上拉触底 |
| `onPageScroll` | 页面滚动 |
| `onShareAppMessage` | 分享 |
| `onBackPress` | 返回按钮 |

**Pinia 预设导入的 API：**

| API | 说明 |
|-----|------|
| `defineStore` | 定义 Store |
| `storeToRefs` | Store 转换为 refs |
| `createPinia` | 创建 Pinia 实例 |
| `mapState` | 映射状态 |
| `mapActions` | 映射操作 |

### dirs

- **类型**: `string[]`
- **默认值**: `['src/composables', 'src/stores/modules']`
- **说明**: 自动扫描并导入的目录

```typescript
AutoImport({
  dirs: [
    'src/composables',     // 组合式函数目录
    'src/stores/modules',  // Pinia Store 模块目录
  ],
})
```

**扫描规则：**

- 扫描目录下的所有 `.ts`、`.js` 文件
- 自动导入文件的 `default` 导出和具名导出
- 支持嵌套目录扫描

**示例：自动导入的 Composable：**

```typescript
// src/composables/useAuth.ts
export function useAuth() {
  const isLoggedIn = ref(false)

  const login = async (username: string, password: string) => {
    // 登录逻辑
  }

  const logout = () => {
    isLoggedIn.value = false
  }

  return { isLoggedIn, login, logout }
}
```

使用时无需导入：

```vue
<script lang="ts" setup>
// 无需 import { useAuth } from '@/composables/useAuth'
const { isLoggedIn, login, logout } = useAuth()
</script>
```

### eslintrc

- **类型**: `object`
- **说明**: ESLint 配置生成选项

```typescript
AutoImport({
  eslintrc: {
    // 启用 ESLint 配置生成
    enabled: true,
    // 配置文件路径
    filepath: './.eslintrc-auto-import.json',
    // 全局属性值
    globalsPropValue: true,
  },
})
```

**生成的 ESLint 配置示例：**

```json
{
  "globals": {
    "ref": true,
    "computed": true,
    "watch": true,
    "onMounted": true,
    "useAuth": true,
    "useUserStore": true
  }
}
```

**在 ESLint 配置中引用：**

```javascript
// .eslintrc.cjs
module.exports = {
  extends: ['./.eslintrc-auto-import.json'],
  // 其他配置...
}
```

### vueTemplate

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否在 Vue 模板中启用自动导入

```typescript
AutoImport({
  vueTemplate: true,
})
```

启用后可以在模板中直接使用：

```vue
<template>
  <!-- 直接使用 ref 创建的响应式变量 -->
  <view>{{ count }}</view>

  <!-- 直接调用自动导入的函数 -->
  <button @click="() => count++">增加</button>
</template>

<script lang="ts" setup>
const count = ref(0)
</script>
```

### dts

- **类型**: `string | false`
- **默认值**: `'src/types/auto-imports.d.ts'`
- **说明**: TypeScript 类型声明文件路径

```typescript
AutoImport({
  dts: 'src/types/auto-imports.d.ts',
})
```

## 生成的类型声明

插件会自动生成 TypeScript 类型声明文件，提供完整的类型支持：

```typescript
// src/types/auto-imports.d.ts
export {}
declare global {
  // Vue API
  const ref: typeof import('vue')['ref']
  const computed: typeof import('vue')['computed']
  const watch: typeof import('vue')['watch']
  const onMounted: typeof import('vue')['onMounted']

  // UniApp API
  const onLoad: typeof import('@dcloudio/uni-app')['onLoad']
  const onShow: typeof import('@dcloudio/uni-app')['onShow']

  // Pinia API
  const defineStore: typeof import('pinia')['defineStore']
  const storeToRefs: typeof import('pinia')['storeToRefs']

  // 自定义 Composables
  const useAuth: typeof import('../composables/useAuth')['useAuth']
  const useHttp: typeof import('../composables/useHttp')['useHttp']
  const useDict: typeof import('../composables/useDict')['useDict']

  // Store 模块
  const useUserStore: typeof import('../stores/modules/user')['useUserStore']
  const useDictStore: typeof import('../stores/modules/dict')['useDictStore']
}
```

**类型声明文件的作用：**

1. **IDE 智能提示** - 编辑器能够识别自动导入的 API
2. **类型检查** - TypeScript 编译器能够正确检查类型
3. **代码导航** - 支持跳转到 API 定义

## 项目中自动导入的 API

### Vue 核心 API

```typescript
// 响应式
const count = ref(0)
const state = reactive({ name: 'test' })
const doubled = computed(() => count.value * 2)

// 侦听器
watch(count, (newVal) => {
  console.log('count changed:', newVal)
})

watchEffect(() => {
  console.log('count is:', count.value)
})

// 生命周期
onMounted(() => {
  console.log('mounted')
})

onUnmounted(() => {
  console.log('unmounted')
})
```

### UniApp 页面生命周期

```typescript
// 页面加载
onLoad((options) => {
  console.log('页面参数:', options)
})

// 页面显示
onShow(() => {
  console.log('页面显示')
})

// 页面隐藏
onHide(() => {
  console.log('页面隐藏')
})

// 下拉刷新
onPullDownRefresh(() => {
  // 刷新逻辑
  uni.stopPullDownRefresh()
})

// 上拉触底
onReachBottom(() => {
  // 加载更多
})

// 分享
onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/pages/index/index',
  }
})
```

### 项目 Composables

```typescript
// HTTP 请求
const { get, post } = useHttp()

// 用户认证
const { isLoggedIn, login, logout } = useAuth()

// 字典数据
const { getDict, getDictLabel } = useDict()

// 主题切换
const { isDark, toggleTheme } = useTheme()

// 事件总线
const { emit, on, off } = useEventBus()

// Token 管理
const { getToken, setToken, removeToken } = useToken()

// 滚动管理
const { scrollTo, scrollToTop } = useScroll()

// 分享功能
const { share } = useShare()

// 支付功能
const { pay, wxPay, aliPay } = usePayment()

// 订阅消息
const { subscribe, requestSubscribe } = useSubscribe()
```

### Pinia Store

```typescript
// 用户状态
const userStore = useUserStore()
const { userInfo, isLoggedIn } = storeToRefs(userStore)

// 字典状态
const dictStore = useDictStore()

// 功能开关
const featureStore = useFeatureStore()

// Tabbar 状态
const tabbarStore = useTabbarStore()
```

## 工作原理

```text
┌─────────────────────────────────────────────────────────────┐
│                    自动导入工作流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 构建启动                                                 │
│       ↓                                                     │
│  2. 扫描 imports 配置的预设库                                │
│       ↓                                                     │
│  3. 扫描 dirs 配置的目录                                     │
│       ↓                                                     │
│  4. 收集所有可自动导入的 API                                  │
│       ↓                                                     │
│  5. 生成类型声明文件 (dts)                                   │
│       ↓                                                     │
│  6. 生成 ESLint 配置 (eslintrc)                             │
│       ↓                                                     │
│  7. 转换源代码                                               │
│       │                                                     │
│       ├─ 检测未导入的 API 使用                               │
│       ├─ 自动注入 import 语句                                │
│       └─ 保持代码简洁                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 使用示例

### 基础页面开发

```vue
<template>
  <view class="page">
    <view class="user-info" v-if="isLoggedIn">
      <text>欢迎，{{ userInfo.nickname }}</text>
      <button @click="handleLogout">退出登录</button>
    </view>

    <view class="content">
      <text>计数：{{ count }}</text>
      <button @click="increment">增加</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 无需任何 import 语句！

// Vue API 直接使用
const count = ref(0)

const increment = () => {
  count.value++
}

// Store 直接使用
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// Composable 直接使用
const { isLoggedIn, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  uni.reLaunch({ url: '/pages/login/index' })
}

// UniApp 生命周期直接使用
onLoad(() => {
  console.log('页面加载')
})

onShow(() => {
  console.log('页面显示')
})
</script>
```

### 异步数据加载

```vue
<script lang="ts" setup>
// 响应式数据
const loading = ref(false)
const list = ref<any[]>([])
const page = ref(1)

// HTTP 请求
const { get } = useHttp()

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await get('/api/list', { page: page.value })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onLoad(() => {
  loadData()
})

// 下拉刷新
onPullDownRefresh(async () => {
  page.value = 1
  await loadData()
  uni.stopPullDownRefresh()
})

// 上拉加载更多
onReachBottom(() => {
  page.value++
  loadData()
})
</script>
```

### 表单处理

```vue
<script lang="ts" setup>
// 表单数据
const form = reactive({
  username: '',
  password: '',
})

// 表单验证
const errors = ref<Record<string, string>>({})

// 计算属性
const isValid = computed(() => {
  return form.username.length > 0 && form.password.length >= 6
})

// 侦听器
watch(
  () => form.username,
  (newVal) => {
    if (newVal.length < 3) {
      errors.value.username = '用户名至少3个字符'
    } else {
      delete errors.value.username
    }
  }
)

// 认证功能
const { login } = useAuth()

// 提交表单
const handleSubmit = async () => {
  if (!isValid.value) {
    uni.showToast({ title: '请检查表单', icon: 'none' })
    return
  }

  try {
    await login(form.username, form.password)
    uni.showToast({ title: '登录成功' })
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (error) {
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}
</script>
```

## API

### 插件选项

```typescript
interface AutoImportOptions {
  /** 预设导入的库 */
  imports?: string[]
  /** 自动扫描的目录 */
  dirs?: string[]
  /** ESLint 配置 */
  eslintrc?: {
    enabled?: boolean
    filepath?: string
    globalsPropValue?: boolean
  }
  /** Vue 模板支持 */
  vueTemplate?: boolean
  /** 类型声明文件路径 */
  dts?: string | false
  /** 自定义解析器 */
  resolvers?: any[]
  /** 是否在 import 语句中包含后缀 */
  include?: RegExp[]
  /** 排除的文件 */
  exclude?: RegExp[]
}
```

### 选项说明

| 选项 | 类型 | 说明 |
|------|------|------|
| imports | `string[]` | 预设导入的库列表 |
| dirs | `string[]` | 自动扫描的目录列表 |
| eslintrc.enabled | `boolean` | 是否生成 ESLint 配置 |
| eslintrc.filepath | `string` | ESLint 配置文件路径 |
| vueTemplate | `boolean` | 是否在模板中启用自动导入 |
| dts | `string \| false` | 类型声明文件路径 |

## 最佳实践

### 1. 合理组织 Composables

```typescript
// src/composables/useAuth.ts
// 认证相关的组合式函数
export function useAuth() {
  // ...
}

// src/composables/useHttp.ts
// HTTP 请求相关
export function useHttp() {
  // ...
}

// src/composables/useDict.ts
// 字典数据相关
export function useDict() {
  // ...
}
```

**目录结构建议：**

```text
src/composables/
├── useAuth.ts        # 认证
├── useHttp.ts        # HTTP 请求
├── useDict.ts        # 字典
├── useTheme.ts       # 主题
├── useToken.ts       # Token 管理
├── useEventBus.ts    # 事件总线
├── useScroll.ts      # 滚动
├── useShare.ts       # 分享
├── usePayment.ts     # 支付
└── useSubscribe.ts   # 订阅消息
```

### 2. Store 模块化

```typescript
// src/stores/modules/user.ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const isLoggedIn = computed(() => !!userInfo.value)

  return { userInfo, isLoggedIn }
})

// src/stores/modules/dict.ts
export const useDictStore = defineStore('dict', () => {
  const dictMap = ref<Map<string, any[]>>(new Map())

  return { dictMap }
})
```

### 3. 避免命名冲突

```typescript
// ❌ 不推荐：与 Vue API 同名
export function ref() {
  // 会与 Vue 的 ref 冲突
}

// ✅ 推荐：使用 use 前缀
export function useCustomRef() {
  // 避免冲突
}
```

### 4. 导出规范

```typescript
// ✅ 推荐：具名导出
export function useAuth() { }
export function useHttp() { }

// ✅ 也支持：默认导出 + 具名导出
export function useDict() { }
export default useDict

// ❌ 不推荐：仅默认导出（不利于识别）
export default function() { }
```

## 常见问题

### 1. ESLint 报 no-undef 错误

**问题原因：**
- ESLint 未正确加载自动生成的配置文件
- ESLint 配置未更新

**解决方案：**

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    './.eslintrc-auto-import.json', // 确保引入自动生成的配置
  ],
}
```

### 2. TypeScript 类型报错

**问题原因：**
- 类型声明文件未正确引用
- `tsconfig.json` 未包含类型文件

**解决方案：**

```json
// tsconfig.json
{
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "src/types/*.d.ts"  // 确保包含类型声明目录
  ]
}
```

### 3. 新增 Composable 未自动识别

**问题原因：**
- 需要重新生成类型声明文件
- 开发服务器缓存

**解决方案：**

1. 重启开发服务器
2. 删除 `src/types/auto-imports.d.ts` 后重新启动

### 4. 模板中无法使用自动导入

**问题原因：**
- `vueTemplate` 选项未启用

**解决方案：**

```typescript
AutoImport({
  vueTemplate: true, // 确保启用
})
```

### 5. 打包后函数未定义

**问题原因：**
- 自动导入的 API 被 tree-shaking 移除
- 动态使用的 API 未被正确识别

**解决方案：**

```typescript
// 确保在代码中显式使用 API
// 避免通过字符串动态调用

// ❌ 不推荐
const fn = 'useAuth'
window[fn]()

// ✅ 推荐
const auth = useAuth()
```

