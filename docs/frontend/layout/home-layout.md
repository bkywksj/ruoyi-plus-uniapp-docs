# 前台布局 HomeLayout

## 概述

HomeLayout 是系统提供的极简布局方案,专为前台展示页面、登录认证页面和错误处理页面等场景设计。与功能完整的后台管理布局(Layout)不同,HomeLayout 采用极简设计理念,去除了侧边栏、顶部导航栏、标签视图等复杂组件,仅保留核心的内容渲染功能,为用户提供纯净、专注的浏览体验。

HomeLayout 的核心价值在于为不同类型的页面提供最适合的布局模式。登录页面需要用户专注于表单填写,首页展示需要大面积的内容呈现区域,错误页面需要简洁清晰的信息展示——这些场景都不需要复杂的后台管理功能,使用 HomeLayout 可以获得更好的用户体验和更快的页面加载速度。

**核心特性:**

- **极简设计** - 移除所有非必要 UI 元素,仅保留 AppMain 内容渲染组件
- **主题集成** - 与主系统保持主题色一致性,通过 CSS 变量统一管理
- **实时通信** - 集成 WebSocket 和 SSE 双通道实时消息推送能力
- **路由复用** - 复用 AppMain 组件,继承组件缓存、过渡动画、iframe 支持等功能
- **条件加载** - 通过系统配置动态控制是否启用前台首页功能
- **性能优化** - 更少的组件意味着更快的加载速度和更小的内存占用

## 组件架构

```text
layouts/
├── HomeLayout.vue              # 前台布局主组件(极简版)
└── components/
    └── AppMain/
        └── AppMain.vue          # 主内容区域(共享组件)
```

HomeLayout 的架构设计遵循"少即是多"的原则:

```text
┌──────────────────────────────────────────────────────────────┐
│                     HomeLayout.vue                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   CSS 变量绑定                          │  │
│  │                 --current-color: theme                  │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │                      AppMain                           │  │
│  │                                                        │  │
│  │   ┌────────────────────────────────────────────────┐   │  │
│  │   │               router-view                       │   │  │
│  │   │         (动态页面内容渲染区域)                    │   │  │
│  │   └────────────────────────────────────────────────┘   │  │
│  │   ┌────────────────────────────────────────────────┐   │  │
│  │   │            IframeToggle                         │   │  │
│  │   │          (外部链接渲染区域)                       │   │  │
│  │   └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              实时通信初始化                              │  │
│  │           WebSocket + SSE 连接建立                       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 核心实现

### HomeLayout.vue 组件源码

```vue
<template>
  <div class="" :style="{ '--current-color': theme }">
    <!-- 主内容区 -->
    <div class="">
      <!-- 主内容 -->
      <app-main />
    </div>
  </div>
</template>

<script setup lang="ts" name="HomeLayout">
import AppMain from './components/AppMain/AppMain.vue'
import { SystemConfig } from '@/systemConfig'

// 获取应用设置 - 通过 useLayout 统一管理布局状态
const theme = computed(() => useLayout().theme)

// 组件挂载时初始化实时通信
onMounted(() => {
  // 建立 WebSocket 连接
  webSocket.initialize()
  webSocket.connect()

  // 启用 SSE 服务端推送
  useSSE(SystemConfig.api.baseUrl + '/resource/sse')
})
</script>
```

### 设计解析

HomeLayout 的实现只有不到 30 行代码,但包含了几个关键设计决策:

**1. 主题色绑定**

```typescript
const theme = computed(() => useLayout().theme)
```

通过 `useLayout()` 组合函数获取当前主题色,并将其绑定到根元素的 CSS 变量。这确保了 HomeLayout 中的页面与后台管理系统保持视觉一致性。

**2. 实时通信初始化**

```typescript
onMounted(() => {
  webSocket.initialize()
  webSocket.connect()
  useSSE(SystemConfig.api.baseUrl + '/resource/sse')
})
```

即使是简洁的前台布局,依然保持与后台系统的实时通信能力。WebSocket 用于双向通信,SSE 用于服务端单向推送。这确保了用户在前台页面也能接收到系统通知、消息提醒等实时信息。

**3. AppMain 组件复用**

HomeLayout 直接复用了 `AppMain` 组件,继承了其完整功能:

- **路由视图渲染** - 支持 Vue Router 的动态路由
- **组件缓存** - keep-alive 缓存机制,提升页面切换性能
- **过渡动画** - 平滑的页面切换效果
- **iframe 支持** - 外部页面内嵌能力

## 路由配置

### 基础配置

HomeLayout 的路由配置位于 `router/modules/constant.ts`:

```typescript
import HomeLayout from '@/layouts/HomeLayout.vue'
import { SystemConfig } from '@/systemConfig'

export const constantRoutes: RouteRecordRaw[] = [
  // 根路径重定向 - 根据配置决定重定向目标
  {
    path: '/',
    redirect: () => {
      return SystemConfig.app.enableFrontend ? '/home' : '/index'
    }
  },

  // 条件性添加前台首页路由
  ...((SystemConfig.app.enableFrontend
    ? [
        {
          path: '/home',
          component: HomeLayout,
          redirect: '/home',
          children: [
            {
              path: '',
              component: () => import('@/views/common/home.vue'),
              name: 'Home',
              meta: {
                title: '主页',
                icon: 'home',
                affix: true,
                i18nKey: 'menu.home'
              }
            }
          ]
        }
      ]
    : []) as RouteRecordRaw[]),

  // ...其他路由配置
]
```

### 条件加载机制

HomeLayout 的加载受系统配置控制:

```typescript
// systemConfig.ts
export const SystemConfig = {
  app: {
    /** 是否启用前台首页 */
    enableFrontend: import.meta.env.VITE_ENABLE_FRONTEND === 'true'
  }
}
```

当 `enableFrontend` 为 `true` 时:
- 根路径 `/` 重定向到 `/home`
- `/home` 路由使用 HomeLayout 布局
- 用户首先看到前台展示页面

当 `enableFrontend` 为 `false` 时:
- 根路径 `/` 重定向到 `/index`
- `/index` 路由使用完整的 Layout 布局
- 用户直接进入后台管理系统

### 扩展路由配置

如需添加更多使用 HomeLayout 的页面:

```typescript
// 产品展示页
{
  path: '/products',
  component: HomeLayout,
  children: [
    {
      path: '',
      component: () => import('@/views/frontend/products/index.vue'),
      name: 'Products',
      meta: { title: '产品展示' }
    },
    {
      path: ':id',
      component: () => import('@/views/frontend/products/detail.vue'),
      name: 'ProductDetail',
      meta: { title: '产品详情' }
    }
  ]
}

// 关于我们页
{
  path: '/about',
  component: HomeLayout,
  children: [
    {
      path: '',
      component: () => import('@/views/frontend/about/index.vue'),
      name: 'About',
      meta: { title: '关于我们' }
    }
  ]
}

// 联系我们页
{
  path: '/contact',
  component: HomeLayout,
  children: [
    {
      path: '',
      component: () => import('@/views/frontend/contact/index.vue'),
      name: 'Contact',
      meta: { title: '联系我们' }
    }
  ]
}
```

## 主题系统集成

### CSS 变量绑定

HomeLayout 通过 CSS 变量实现与主系统的主题色统一:

```vue
<div :style="{ '--current-color': theme }">
  <!-- 内容 -->
</div>
```

这个绑定使得 HomeLayout 内的所有组件都可以通过 `var(--current-color)` 访问当前主题色:

```scss
// 在 HomeLayout 内的组件中使用主题色
.custom-button {
  background-color: var(--current-color);

  &:hover {
    background-color: color-mix(in srgb, var(--current-color) 80%, white);
  }
}

.custom-link {
  color: var(--current-color);

  &:hover {
    text-decoration: underline;
  }
}

.custom-badge {
  border: 1px solid var(--current-color);
  color: var(--current-color);
}
```

### 获取主题色

主题色通过 `useLayout()` 组合函数获取:

```typescript
// useLayout 返回的主题相关属性
interface LayoutState {
  theme: Ref<string>           // 主题色值,如 '#5d87ff'
  dark: Ref<boolean>           // 是否暗黑模式
  sideTheme: Ref<string>       // 侧边栏主题
}

// 使用方式
const layout = useLayout()
const currentTheme = layout.theme.value  // '#5d87ff'
const isDarkMode = layout.dark.value     // false
```

### 暗黑模式支持

HomeLayout 自动继承系统的暗黑模式设置:

```typescript
// useLayout 内部处理暗黑模式
const dark = useDark({
  storageKey: `${SystemConfig.app.id}-dark`,
  valueDark: 'dark',
  valueLight: 'light'
})
```

在 HomeLayout 内的页面中,可以根据暗黑模式调整样式:

```vue
<script setup lang="ts">
const layout = useLayout()
const isDark = computed(() => layout.dark.value)
</script>

<template>
  <div :class="{ 'dark-mode': isDark }">
    <!-- 内容 -->
  </div>
</template>

<style lang="scss" scoped>
.container {
  background-color: #ffffff;
  color: #333333;

  &.dark-mode {
    background-color: #1a1a1a;
    color: #e0e0e0;
  }
}
</style>
```

## 实时通信集成

### WebSocket 通信

HomeLayout 在挂载时初始化全局 WebSocket 连接:

```typescript
onMounted(() => {
  webSocket.initialize()
  webSocket.connect()
})
```

`webSocket` 是 `GlobalWebSocketManager` 的全局实例,提供以下功能:

```typescript
// 全局 WebSocket 管理器 API
interface GlobalWebSocketManager {
  // 初始化连接
  initialize(url?: string, options?: WSOptions): WSInstance | null

  // 连接控制
  connect(): boolean
  disconnect(): void
  reconnect(): boolean

  // 消息发送
  send(message: string | object): boolean

  // 状态获取
  status: string           // 'OPEN' | 'CLOSED' | 'CONNECTING'
  isConnected: boolean

  // 消息处理器管理
  addMessageHandler(handler: MessageHandler): void
  removeMessageHandler(handlerClass: typeof MessageHandler): void
  getMessageHandlers(): string[]

  // 销毁实例
  destroy(): void
}
```

### 消息类型定义

系统支持多种 WebSocket 消息类型:

```typescript
export enum WSMessageType {
  // 系统级消息
  SYSTEM_NOTICE = 'system_notice',     // 系统通知

  // AI 聊天消息
  AI_CHAT_START = 'ai_chat_start',     // 开始生成
  AI_CHAT_STREAM = 'ai_chat_stream',   // 流式响应
  AI_CHAT_COMPLETE = 'ai_chat_complete', // 生成完成
  AI_CHAT_ERROR = 'ai_chat_error',     // 生成错误

  // 业务消息
  CHAT_MESSAGE = 'chat_message',       // 聊天消息

  // 开发工具消息
  DEV_LOG = 'devLog',                  // 开发日志

  // 技术消息
  HEARTBEAT = 'heartbeat'              // 心跳
}
```

### 消息处理管道

WebSocket 消息通过处理管道进行分发:

```typescript
// 消息处理管道架构
class MessagePipeline {
  private handlers: MessageHandler[] = []

  // 处理器按优先级顺序执行
  // 1. HeartbeatHandler - 过滤心跳消息
  // 2. AiChatStreamHandler - 处理 AI 消息
  // 3. SystemNoticeHandler - 处理系统通知
}

// 消息处理器接口
interface MessageHandler {
  handle(message: WSMessage): boolean | Promise<boolean>
}

// 标准消息格式
interface WSMessage {
  type: WSMessageType
  data: any
  timestamp: number
  id?: string
}
```

### SSE 服务端推送

HomeLayout 同时启用 SSE 连接:

```typescript
useSSE(SystemConfig.api.baseUrl + '/resource/sse')
```

SSE 提供以下功能:

```typescript
// SSE Hook 返回值
interface SSEReturn {
  close: () => void                    // 关闭连接
  reconnect: () => void                // 重新连接
  status: Ref<string>                  // 连接状态
  unreadCount: ComputedRef<number>     // 未读消息数
  eventSource: Readonly<Ref<EventSource | null>>
}
```

SSE 特性:

- **自动重连** - 指数退避策略(3s → 6s → 12s → ...)
- **最大重试** - 默认 8 次重试后停止
- **消息通知** - 收到消息自动显示 Element Plus 通知
- **未读计数** - 自动更新通知中心未读数量
- **资源清理** - 组件卸载时自动断开连接

### 功能开关控制

实时通信功能受系统配置控制:

```typescript
// 检查 WebSocket 是否启用
const featureStore = useFeatureStore()
if (!featureStore.features.websocketEnabled) {
  // WebSocket 功能已禁用
}

// 检查 SSE 是否启用
if (!featureStore.features.sseEnabled) {
  // SSE 功能已禁用
}
```

## AppMain 组件详解

HomeLayout 复用的 AppMain 组件是布局的核心内容渲染区域:

### 组件结构

```vue
<template>
  <section class="app-main">
    <el-scrollbar class="p-4">
      <!-- 路由视图部分 -->
      <router-view v-slot="{ Component, route }">
        <transition :enter-active-class="animate" mode="out-in">
          <keep-alive :include="layout.cachedViews.value">
            <component :is="Component" v-if="!route.meta.link" :key="route.path" />
          </keep-alive>
        </transition>
      </router-view>
      <!-- iframe处理 -->
      <IframeToggle />
    </el-scrollbar>
  </section>
</template>
```

### 组件缓存机制

AppMain 使用 `keep-alive` 缓存组件:

```typescript
const layout = useLayout()

// cachedViews 存储需要缓存的组件名称
// 由 useLayout 统一管理
const cachedViews = layout.cachedViews.value  // ['Home', 'About', ...]
```

缓存机制说明:

- 组件名称在 `cachedViews` 列表中才会被缓存
- 页面切换时,缓存的组件保留状态不销毁
- 可通过 `useLayout()` 动态添加/移除缓存

### 过渡动画

AppMain 支持页面切换动画:

```typescript
const animation = useAnimation()
const animate = ref<string>('')
const animationEnable = ref(layout.animationEnable.value)

// 监听动画启用状态变化
watch(
  () => layout.animationEnable.value,
  (val: boolean) => {
    animationEnable.value = val
    animate.value = val
      ? animation.getRandomAnimation()
      : animation.defaultAnimate
  },
  { immediate: true }
)
```

动画效果:

- **启用时** - 使用随机动画效果
- **禁用时** - 使用默认动画或无动画
- **可配置** - 通过系统设置开关控制

### iframe 支持

AppMain 支持渲染外部链接:

```typescript
watchEffect(() => {
  if (route.meta.link) {
    layout.addIframeView(route)
  }
})
```

当路由配置中包含 `meta.link` 时,该页面会通过 iframe 方式渲染。

### 样式定义

```scss
.app-main {
  // 计算内容区域高度
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  z-index: 1;
  overflow: hidden;
  background-color: var(--app-bg);

  .el-scrollbar {
    height: 100%;
  }
}

// 滚动条美化
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-lighter);
  border-radius: var(--radius-round);

  &:hover {
    background-color: var(--el-border-color);
  }
}
```

## 适用场景

### 推荐场景

| 场景类型 | 具体应用 | 使用理由 |
|----------|----------|----------|
| **登录认证** | 登录页、注册页、忘记密码页、重置密码页 | 需要用户专注于表单填写,无需导航干扰 |
| **错误页面** | 404 页面、500 页面、401 未授权页、403 禁止访问页 | 简洁清晰的错误信息展示 |
| **引导页面** | 欢迎页、新手引导、功能介绍、版本更新 | 突出重点内容和操作 |
| **展示页面** | 产品介绍、公司简介、公告详情、帮助中心 | 内容为主的静态展示 |
| **落地页面** | 营销页面、活动页面、推广页面 | 大面积展示,无干扰 |
| **移动端适配** | H5 页面、微信小程序页面、APP 内嵌页 | 移动端友好的简洁布局 |
| **打印预览** | 报表打印、单据打印、证书打印 | 纯净页面便于打印 |
| **全屏应用** | 数据大屏、全屏演示、Kiosk 模式 | 需要最大化内容展示区域 |

### 不推荐场景

| 场景类型 | 应使用布局 | 原因 |
|----------|------------|------|
| 后台管理页面 | Layout | 需要侧边栏导航 |
| 多标签操作 | Layout | 需要标签页视图 |
| 需要面包屑 | Layout | 需要导航定位 |
| 复杂表单管理 | Layout | 需要完整的操作工具栏 |
| 数据 CRUD | Layout | 需要完整的管理功能 |

## 与主布局对比

### 功能对比

| 特性 | HomeLayout | Layout |
|------|------------|--------|
| **复杂度** | 极简(< 30 行代码) | 功能完整(134 行模板) |
| **组件数量** | 1 个核心组件 | 10+ 个组件 |
| **侧边栏** | 否 无 | 是 支持收缩、隐藏、主题切换 |
| **顶部导航** | 否 无 | 是 搜索、通知、用户菜单 |
| **标签视图** | 否 无 | 是 多标签页、右键菜单 |
| **面包屑** | 否 无 | 是 路径导航 |
| **设置面板** | 否 无 | 是 布局、主题配置 |
| **水印功能** | 否 无 | 是 全局水印 |
| **主题色** | 是 继承主系统 | 是 完整主题系统 |
| **实时通信** | 是 WebSocket + SSE | 是 WebSocket + SSE |
| **组件缓存** | 是 keep-alive | 是 keep-alive |
| **过渡动画** | 是 可配置 | 是 可配置 |
| **iframe** | 是 支持 | 是 支持 |

### 性能对比

| 指标 | HomeLayout | Layout |
|------|------------|--------|
| **首屏加载** | <Icon icon="lucide:zap" /> 极快(< 100KB) | <Icon icon="lucide:snail" /> 相对较慢(> 300KB) |
| **内存占用** | <Icon icon="lucide:heart" /> 低 | <Icon icon="lucide:diamond" /> 中等 |
| **DOM 节点** | <Icon icon="lucide:heart" /> 少(< 50) | <Icon icon="lucide:diamond" /> 多(> 200) |
| **事件监听** | <Icon icon="lucide:heart" /> 少 | <Icon icon="lucide:diamond" /> 多 |
| **维护成本** | <Icon icon="lucide:heart" /> 低 | <Icon icon="lucide:diamond" /> 中等 |

### 使用场景选择

```text
用户访问页面
    │
    ▼
是否需要后台管理功能?
    │
    ├── 是 → 使用 Layout
    │       ├── 需要侧边栏导航
    │       ├── 需要多标签页
    │       ├── 需要用户工具栏
    │       └── 需要完整权限控制
    │
    └── 否 → 使用 HomeLayout
            ├── 登录/注册页面
            ├── 错误页面
            ├── 展示页面
            └── 营销落地页
```

## 前台首页示例

系统提供了一个完整的前台首页示例:

### 页面结构

```vue
<template>
  <div class="w-full min-h-screen flex justify-center relative">
    <!-- 背景图片层 -->
    <div
      :style="{ backgroundImage: `url(${homeBg})` }"
      class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 h-screen"
    ></div>

    <!-- 内容层 -->
    <div class="w-full min-h-screen shadow-2xl relative z-10">
      <!-- 头部横幅 -->
      <div class="py-20 text-center text-white">
        <h1 class="text-5xl font-bold drop-shadow-lg">欢迎来到我们的平台</h1>
        <p class="text-xl mt-4 opacity-90">为您提供最优质的服务体验</p>
        <el-button type="primary" size="large" @click="handleGetStarted">
          立即开始
        </el-button>
      </div>

      <!-- 特色功能区 -->
      <div class="py-4">
        <div class="max-w-5xl mx-auto px-5">
          <h2 class="text-3xl font-semibold text-center mb-12">核心功能</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="feature in features"
              :key="feature.id"
              class="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
            >
              <el-icon :size="48" :color="feature.color">
                <component :is="feature.icon" />
              </el-icon>
              <h3 class="text-lg font-semibold mb-3">{{ feature.title }}</h3>
              <p class="text-gray-600 text-sm">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计数据区 -->
      <div class="py-16">
        <div class="max-w-4xl mx-auto px-5">
          <div class="grid grid-cols-4 gap-8">
            <div v-for="stat in stats" :key="stat.label" class="text-center">
              <el-icon :size="32" :color="stat.color">
                <component :is="stat.icon" />
              </el-icon>
              <div class="text-3xl font-bold mb-1">{{ stat.value }}+</div>
              <div>{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 数据定义

```typescript
<script setup lang="ts">
import homeBg from '@/assets/images/homeBg.jpg'
import { ref, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { StarFilled, TrophyBase, Lock, Lightning, User, Avatar, Medal } from '@element-plus/icons-vue'

const router = useRouter()

// 特色功能数据 - 使用 markRaw 避免响应式警告
const features = ref([
  {
    id: 1,
    icon: markRaw(StarFilled),
    color: '#fbbf24',
    title: '高质量服务',
    description: '我们提供专业、可靠的服务，确保您的满意度'
  },
  {
    id: 2,
    icon: markRaw(Lock),
    color: '#10b981',
    title: '安全可靠',
    description: '采用最先进的安全技术，保护您的数据安全'
  },
  {
    id: 3,
    icon: markRaw(Lightning),
    color: '#f59e0b',
    title: '快速响应',
    description: '7×24小时快速响应，第一时间解决您的问题'
  },
  {
    id: 4,
    icon: markRaw(TrophyBase),
    color: '#ef4444',
    title: '行业领先',
    description: '多年行业经验，获得众多客户的信赖和好评'
  }
])

// 统计数据
const stats = ref([
  { label: '注册用户', value: 10000, icon: markRaw(User), color: '#3b82f6' },
  { label: '服务客户', value: 5000, icon: markRaw(Avatar), color: '#10b981' },
  { label: '项目完成', value: 8000, icon: markRaw(Medal), color: '#f59e0b' },
  { label: '满意度', value: 99.9, icon: markRaw(StarFilled), color: '#ef4444' }
])

// 立即开始按钮点击处理
const handleGetStarted = () => {
  const userStore = useUserStore()
  if (userStore.token) {
    router.push('/index')
    ElMessage.success('欢迎回来！')
  } else {
    router.push('/login?redirect=/index')
  }
}

onMounted(() => {
  // 显示欢迎消息
  ElNotification({
    title: '欢迎访问',
    message: '欢迎来到我们的平台，希望您有愉快的体验！',
    type: 'success',
    duration: 3000
  })
})
</script>
```

### 使用 markRaw 优化

注意示例中使用了 `markRaw` 包装图标组件:

```typescript
// 使用 markRaw 避免响应式警告
icon: markRaw(StarFilled)
```

这是因为 Element Plus 图标组件不需要响应式处理,使用 `markRaw` 可以:

- 避免 Vue 响应式系统的警告
- 提升性能,减少不必要的响应式转换
- 保持组件引用的稳定性

## 性能优化

### 组件懒加载

```typescript
// 路由级别的懒加载
const HomeLayout = () => import('@/layouts/HomeLayout.vue')

// 页面组件懒加载
{
  path: '/home',
  component: HomeLayout,
  children: [
    {
      path: '',
      component: () => import('@/views/common/home.vue')
    }
  ]
}
```

### 资源预加载

```typescript
// 关键资源预加载
onMounted(() => {
  // 预加载常用图片
  const images = [
    '/assets/images/homeBg.jpg',
    '/assets/images/logo.png'
  ]

  images.forEach(src => {
    const img = new Image()
    img.src = src
  })
})
```

### 代码分割

```typescript
// 按需导入工具函数
const loadUtils = () => import('@/utils/common')
const loadValidators = () => import('@/utils/validators')

// 动态导入重型组件
const loadChart = async () => {
  const { default: Chart } = await import('@/components/Chart.vue')
  return Chart
}
```

### 图片优化

```vue
<template>
  <!-- 使用响应式图片 -->
  <img
    :src="homeBg"
    loading="lazy"
    decoding="async"
    alt="背景图片"
  />

  <!-- 或使用 picture 元素提供多种格式 -->
  <picture>
    <source srcset="/images/bg.webp" type="image/webp">
    <source srcset="/images/bg.jpg" type="image/jpeg">
    <img src="/images/bg.jpg" alt="背景" loading="lazy">
  </picture>
</template>
```

## 扩展开发

### 添加全局组件

```typescript
// 在 HomeLayout 中添加全局组件
import GlobalLoading from '@/components/GlobalLoading.vue'
import GlobalMessage from '@/components/GlobalMessage.vue'
import BackToTop from '@/components/BackToTop.vue'

// 组件注册
app.component('GlobalLoading', GlobalLoading)
app.component('GlobalMessage', GlobalMessage)
app.component('BackToTop', BackToTop)
```

### 自定义主题

```scss
// 为 HomeLayout 定制专属主题
.home-layout {
  // 自定义调色板
  --home-primary: #667eea;
  --home-secondary: #764ba2;
  --home-accent: #f093fb;

  // 应用渐变背景
  background: linear-gradient(
    135deg,
    var(--home-primary) 0%,
    var(--home-secondary) 100%
  );

  // 自定义卡片样式
  .home-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
  }
}
```

### 集成动画库

```typescript
// 集成 AOS 动画库
import AOS from 'aos'
import 'aos/dist/aos.css'

onMounted(() => {
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  })
})
```

```vue
<template>
  <!-- 使用 AOS 动画 -->
  <div data-aos="fade-up" data-aos-delay="100">
    <h2>标题</h2>
  </div>

  <div data-aos="fade-right" data-aos-delay="200">
    <p>内容</p>
  </div>
</template>
```

### 添加返回顶部

```vue
<template>
  <div class="home-layout">
    <app-main />

    <!-- 返回顶部按钮 -->
    <el-backtop
      :right="40"
      :bottom="40"
      :visibility-height="200"
    >
      <div class="back-to-top">
        <el-icon><ArrowUp /></el-icon>
      </div>
    </el-backtop>
  </div>
</template>

<style lang="scss" scoped>
.back-to-top {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--current-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}
</style>
```

## 最佳实践

### 1. 保持简洁

```vue
<!-- ✅ 推荐: 简洁的结构 -->
<template>
  <div class="home-container">
    <header class="home-header">
      <h1>标题</h1>
    </header>
    <main class="home-content">
      <router-view />
    </main>
    <footer class="home-footer">
      <p>版权信息</p>
    </footer>
  </div>
</template>

<!-- ❌ 避免: 在 HomeLayout 页面中添加复杂组件 -->
<template>
  <div>
    <Navbar />      <!-- 不需要 -->
    <Sidebar />     <!-- 不需要 -->
    <Breadcrumb />  <!-- 不需要 -->
    <AppMain />
  </div>
</template>
```

### 2. 响应式优先

```scss
// ✅ 推荐: 移动端优先的响应式设计
.home-container {
  padding: 16px;

  @media (min-width: 768px) {
    padding: 24px;
  }

  @media (min-width: 1024px) {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

// 网格布局响应式
.feature-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 3. 语义化 HTML

```vue
<!-- ✅ 推荐: 语义化的标签 -->
<template>
  <main role="main" class="home-main">
    <header class="page-header">
      <h1>页面标题</h1>
      <p>页面描述</p>
    </header>

    <section class="features" aria-labelledby="features-title">
      <h2 id="features-title">功能特性</h2>
      <article v-for="feature in features" :key="feature.id">
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </article>
    </section>

    <footer class="page-footer">
      <nav aria-label="页脚导航">
        <a href="/about">关于我们</a>
        <a href="/contact">联系我们</a>
      </nav>
    </footer>
  </main>
</template>
```

### 4. 无障碍访问

```vue
<template>
  <!-- 添加适当的 ARIA 属性 -->
  <button
    @click="handleAction"
    :aria-label="buttonLabel"
    :aria-disabled="isDisabled"
  >
    {{ buttonText }}
  </button>

  <!-- 为图片添加 alt 属性 -->
  <img
    :src="imageSrc"
    :alt="imageDescription"
    role="img"
  />

  <!-- 表单无障碍 -->
  <form @submit.prevent="handleSubmit" aria-label="联系表单">
    <label for="email">邮箱地址</label>
    <input
      id="email"
      type="email"
      v-model="email"
      aria-required="true"
      aria-describedby="email-help"
    />
    <span id="email-help" class="help-text">请输入有效的邮箱地址</span>
  </form>
</template>
```

### 5. 状态管理简化

```typescript
// ✅ 推荐: 在 HomeLayout 页面使用简单的状态管理
const localState = ref({
  isLoading: false,
  formData: {
    name: '',
    email: ''
  }
})

// ❌ 避免: 过度使用状态管理
const homeStore = defineStore('home', {
  state: () => ({
    sidebarVisible: false,  // HomeLayout 不需要侧边栏状态
    tabsViews: [],          // HomeLayout 不需要标签页状态
    menuCollapsed: false    // HomeLayout 不需要菜单状态
  })
})
```

## 常见问题

### 1. 样式与主系统冲突

**问题描述:** HomeLayout 页面的样式与主系统样式产生冲突。

**解决方案:**

```scss
// 方案1: 使用作用域样式
<style lang="scss" scoped>
.home-page {
  // 样式只作用于当前组件
}
</style>

// 方案2: 使用 CSS 模块
<style lang="scss" module>
.container {
  // 自动添加唯一类名
}
</style>

// 方案3: 使用特定前缀
.home-layout {
  // 重置可能冲突的样式
  * {
    box-sizing: border-box;
  }

  // 使用 home- 前缀避免冲突
  .home-button {
    // 样式定义
  }
}
```

### 2. 路由配置不生效

**问题描述:** 配置了 HomeLayout 路由但页面不显示。

**解决方案:**

```typescript
// 确保路由配置正确
{
  path: '/home',
  component: HomeLayout,
  children: [
    {
      path: '',  // 重要: 空路径作为默认子路由
      component: HomePage
    }
  ]
}

// 检查系统配置是否启用
// .env 文件
VITE_ENABLE_FRONTEND=true
```

### 3. 主题色不生效

**问题描述:** CSS 变量 `--current-color` 未正确应用。

**解决方案:**

```typescript
// 确保计算属性正确绑定
const theme = computed(() => useLayout().theme)

// 确保模板中正确使用
:style="{ '--current-color': theme }"

// 在子组件中使用
.my-element {
  color: var(--current-color);
}
```

### 4. 实时通信无法连接

**问题描述:** WebSocket 或 SSE 连接失败。

**解决方案:**

```typescript
// 检查功能开关
const featureStore = useFeatureStore()
console.log('WebSocket enabled:', featureStore.features.websocketEnabled)
console.log('SSE enabled:', featureStore.features.sseEnabled)

// 检查用户认证状态
const { getAuthQuery } = useToken()
const authQuery = getAuthQuery()
if (!authQuery) {
  console.warn('用户未登录,无法建立连接')
}

// 检查 API 地址配置
console.log('API Base URL:', SystemConfig.api.baseUrl)
```

### 5. 组件缓存问题

**问题描述:** 页面切换后状态丢失或不更新。

**解决方案:**

```typescript
// 确保组件定义了 name
defineOptions({
  name: 'HomePage'  // 必须与 cachedViews 中的名称一致
})

// 使用 onActivated/onDeactivated 生命周期
onActivated(() => {
  // 组件被激活时刷新数据
  fetchLatestData()
})

onDeactivated(() => {
  // 组件被停用时清理资源
  clearTimers()
})
```

## 类型定义

```typescript
/**
 * HomeLayout 相关类型定义
 */

/**
 * 系统配置类型
 */
interface SystemConfigType {
  app: {
    /** 是否启用前台首页 */
    enableFrontend: boolean
  }
  api: {
    /** API 基础路径 */
    baseUrl: string
  }
}

/**
 * 布局状态类型
 */
interface LayoutState {
  /** 主题色 */
  theme: Ref<string>
  /** 是否暗黑模式 */
  dark: Ref<boolean>
  /** 缓存的视图列表 */
  cachedViews: Ref<string[]>
  /** 是否启用动画 */
  animationEnable: Ref<boolean>
}

/**
 * WebSocket 消息类型
 */
enum WSMessageType {
  SYSTEM_NOTICE = 'system_notice',
  AI_CHAT_START = 'ai_chat_start',
  AI_CHAT_STREAM = 'ai_chat_stream',
  AI_CHAT_COMPLETE = 'ai_chat_complete',
  AI_CHAT_ERROR = 'ai_chat_error',
  CHAT_MESSAGE = 'chat_message',
  DEV_LOG = 'devLog',
  HEARTBEAT = 'heartbeat'
}

/**
 * WebSocket 消息结构
 */
interface WSMessage {
  type: WSMessageType
  data: any
  timestamp: number
  id?: string
}

/**
 * SSE Hook 返回类型
 */
interface SSEReturn {
  close: () => void
  reconnect: () => void
  status: Ref<string>
  unreadCount: ComputedRef<number>
  eventSource: Readonly<Ref<EventSource | null>>
}

/**
 * 全局 WebSocket 管理器类型
 */
interface GlobalWebSocketManager {
  initialize(url?: string, options?: any): any
  connect(): boolean
  disconnect(): void
  reconnect(): boolean
  send(message: string | object): boolean
  readonly status: string
  readonly isConnected: boolean
  addMessageHandler(handler: MessageHandler): void
  removeMessageHandler(handlerClass: new () => MessageHandler): void
  getMessageHandlers(): string[]
  destroy(): void
}

/**
 * 消息处理器接口
 */
interface MessageHandler {
  handle(message: WSMessage): boolean | Promise<boolean>
}

/**
 * 功能特性数据类型
 */
interface FeatureItem {
  id: number
  icon: Component
  color: string
  title: string
  description: string
}

/**
 * 统计数据类型
 */
interface StatItem {
  label: string
  value: number
  icon: Component
  color: string
}
```

## 总结

HomeLayout 作为系统的极简布局方案,以"少即是多"的设计哲学为核心,为前台展示、用户认证、错误处理等场景提供了优雅的解决方案。

**核心优势:**

1. **极致简洁** - 仅保留核心内容渲染功能,代码量少于 30 行
2. **性能优越** - 更少的组件和 DOM 节点,加载速度更快
3. **主题统一** - 与主系统共享主题色,保持视觉一致性
4. **通信完整** - 保留 WebSocket 和 SSE 实时通信能力
5. **扩展灵活** - 可根据需求添加自定义功能

**使用建议:**

- 根据页面实际需求选择合适的布局
- 前台展示类页面优先使用 HomeLayout
- 需要完整管理功能的页面使用 Layout
- 合理利用组件缓存和懒加载优化性能
- 遵循响应式设计和无障碍访问规范
