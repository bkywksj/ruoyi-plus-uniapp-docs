# 主布局 Layout

## 介绍

`Layout.vue` 是 RuoYi-Plus 前端管理系统的核心布局容器组件，负责协调和管理整个应用的界面结构。它提供了完整的后台管理界面框架，包括侧边栏导航、顶部导航栏、标签视图、主内容区域和设置面板的统一管理。

**核心特性:**

- **三种布局模式** - 支持垂直布局（左侧边栏）、水平布局（顶部导航）、混合布局（顶部+侧边栏）三种菜单布局模式
- **响应式设计** - 自动检测设备类型，针对 PC 端和移动端提供不同的交互体验
- **主题集成** - 通过 CSS 变量实现主题色的全局应用，支持亮色/暗色模式切换
- **水印功能** - 内置全局水印组件，支持自定义水印内容
- **实时通信** - 集成 WebSocket 和 SSE（Server-Sent Events）实现实时消息推送
- **状态管理** - 通过 `useLayout` 组合函数实现布局状态的统一管理
- **标签视图** - 支持多标签页浏览，提供页面缓存和快速切换功能

## 组件架构

### 整体结构

Layout 组件采用分层架构设计，由多个子组件协同工作：

```text
Layout.vue (主布局容器)
├── Sidebar/Sidebar.vue      # 侧边栏导航
│   ├── Logo.vue             # Logo 显示
│   ├── SidebarItem.vue      # 菜单项渲染
│   └── AppLink.vue          # 路由链接
├── Navbar/Navbar.vue        # 顶部导航栏
│   ├── Hamburger.vue        # 侧边栏切换按钮
│   ├── Breadcrumb.vue       # 面包屑导航
│   ├── TopNav.vue           # 顶部菜单导航
│   └── tools/               # 工具栏组件
│       ├── NavbarSearch.vue # 搜索框
│       ├── FullscreenToggle.vue # 全屏切换
│       ├── LangSelect.vue   # 语言切换
│       ├── SizeSelect.vue   # 尺寸选择
│       ├── TenantSelect.vue # 租户选择
│       ├── Notice.vue       # 通知消息
│       ├── AiChat.vue       # AI 对话
│       ├── DocLink.vue      # 文档链接
│       ├── RefreshButton.vue # 刷新按钮
│       ├── LayoutSetting.vue # 布局设置
│       └── UserDropdown.vue # 用户下拉菜单
├── TagsView/TagsView.vue    # 标签视图
│   └── ScrollPane.vue       # 滚动容器
├── AppMain/AppMain.vue      # 主内容区域
│   ├── ParentView.vue       # 父视图容器
│   └── iframe/              # iframe 相关
│       ├── InnerLink.vue    # 内嵌链接
│       └── IframeToggle.vue # iframe 切换
├── Settings/Settings.vue    # 设置面板
└── AWatermark.vue           # 水印组件
```

### 模板结构

```vue
<template>
  <div class="app-wrapper" :class="classObj" :style="{ '--current-color': theme }">
    <!-- 移动端侧边栏遮罩层 -->
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />

    <!-- 侧边栏 -->
    <Sidebar v-if="showSidebar" class="sidebar-container" />

    <!-- 主内容区 -->
    <div
      class="main-container"
      :class="{
        hasTagsView: needTagsView,
        sidebarHide: sidebar.hide || menuLayout === MenuLayoutMode.Horizontal,
        horizontalLayout: menuLayout === MenuLayoutMode.Horizontal
      }"
    >
      <!-- 固定顶部区域 -->
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar ref="navbarRef" @set-layout="setLayout" />
        <tags-view v-if="needTagsView" />
      </div>

      <!-- 主内容 -->
      <app-main />

      <!-- 设置面板 -->
      <settings ref="settingRef" />
    </div>

    <!-- 全局水印 - 独立渲染，不包裹内容 -->
    <AWatermark :visible="watermarkVisible" :content="watermarkContentText" />
  </div>
</template>
```

## 布局模式

系统支持三种菜单布局模式，通过 `MenuLayoutMode` 枚举定义：

### 垂直布局（Vertical）

经典的左侧边栏布局，适合菜单层级较深的场景。

```typescript
enum MenuLayoutMode {
  /** 垂直布局（左侧边栏） */
  Vertical = 'vertical'
}
```

**特点:**

- 侧边栏固定在左侧
- 支持多级菜单折叠
- 顶部导航栏显示面包屑
- 适合菜单项较多的后台系统

**布局效果:**

```text
┌─────────────────────────────────────────────────┐
│ Logo        │  面包屑导航            工具栏    │
├─────────────┼──────────────────────────────────┤
│  菜单项1    │                                  │
│  菜单项2    │       主内容区域                 │
│  菜单项3    │                                  │
│  ...        │                                  │
└─────────────┴──────────────────────────────────┘
```

### 水平布局（Horizontal）

纯顶部导航布局，侧边栏完全隐藏。

```typescript
enum MenuLayoutMode {
  /** 水平布局（纯顶部） */
  Horizontal = 'horizontal'
}
```

**特点:**

- 所有菜单显示在顶部导航栏
- 侧边栏完全隐藏
- 主内容区域占据全宽
- 适合菜单项较少的简洁系统

**布局效果:**

```text
┌─────────────────────────────────────────────────┐
│ Logo  菜单1  菜单2  菜单3  ...        工具栏    │
├─────────────────────────────────────────────────┤
│                                                 │
│             主内容区域（全宽）                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 混合布局（Mixed）

结合垂直和水平布局的优点，顶部显示一级菜单，侧边栏显示子菜单。

```typescript
enum MenuLayoutMode {
  /** 混合布局（顶部+左侧） */
  Mixed = 'mixed'
}
```

**特点:**

- 顶部导航栏显示一级菜单
- 侧边栏显示当前一级菜单的子菜单
- 结合两种布局的优点
- 适合菜单层级适中的系统

**布局效果:**

```text
┌─────────────────────────────────────────────────┐
│ Logo  一级菜单1  一级菜单2  ...       工具栏    │
├─────────────┬──────────────────────────────────┤
│  二级菜单1  │                                  │
│  二级菜单2  │       主内容区域                 │
│  二级菜单3  │                                  │
│  ...        │                                  │
└─────────────┴──────────────────────────────────┘
```

### 布局模式切换

在设置面板中可以切换布局模式：

```typescript
const handleMenuLayoutChange = (mode: MenuLayoutMode) => {
  layout.menuLayout.value = mode

  switch (mode) {
    case MenuLayoutMode.Vertical:
      // 垂直布局：关闭顶部导航，显示侧边栏
      layout.topNav.value = false
      layout.toggleSideBarHide(false)
      break

    case MenuLayoutMode.Mixed:
      // 混合布局：开启顶部导航，显示侧边栏
      layout.topNav.value = true
      layout.toggleSideBarHide(false)
      break

    case MenuLayoutMode.Horizontal:
      // 水平布局：开启顶部导航，隐藏侧边栏
      layout.topNav.value = true
      layout.toggleSideBarHide(true)
      break
  }
}
```

## 响应式设计

### 断点配置

系统使用 992px 作为移动端和桌面端的响应式断点：

```typescript
const { width } = useWindowSize()
const WIDTH = 992 // 响应式断点

watchEffect(() => {
  // 如果当前是移动端状态，确保侧边栏关闭
  if (device.value === 'mobile') {
    layout.closeSideBar()
  }

  if (width.value - 1 < WIDTH) {
    // 切换为移动端模式
    layout.toggleDevice('mobile')
    layout.closeSideBar()
  } else {
    // 切换为桌面端模式
    layout.toggleDevice('pc')
    layout.openSideBar()
  }
})
```

### 设备类型

支持三种设备类型：

| 设备类型 | 屏幕宽度 | 侧边栏模式 | 主要特性 |
|----------|----------|------------|----------|
| `pc` | ≥ 992px | Fixed（固定） | 侧边栏固定显示，平滑过渡动画 |
| `mobile` | < 992px | Overlay（覆盖） | 侧边栏覆盖显示，带遮罩层 |
| `tablet` | - | 可配置 | 预留，可根据需要扩展 |

### 移动端适配

移动端模式下的特殊处理：

```vue
<template>
  <!-- 移动端侧边栏遮罩层 -->
  <div
    v-if="device === 'mobile' && sidebar.opened"
    class="drawer-bg"
    @click="handleClickOutside"
  />
</template>

<script lang="ts" setup>
// 处理移动端点击侧边栏外区域关闭侧边栏
const handleClickOutside = () => {
  layout.closeSideBar()
}
</script>

<style lang="scss" scoped>
.drawer-bg {
  background: rgba(0, 0, 0, 0.3);
  width: 100%;
  top: 0;
  height: 100%;
  position: fixed;
  z-index: 999;
}
</style>
```

### 动态类名

根据布局状态动态应用 CSS 类名：

```typescript
// 计算侧边栏状态相关的class
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,         // 侧边栏隐藏状态
  openSidebar: sidebar.value.opened,          // 侧边栏打开状态
  withoutAnimation: sidebar.value.withoutAnimation, // 无动画状态
  mobile: device.value === 'mobile',          // 移动端状态
  horizontalLayout: menuLayout.value === MenuLayoutMode.Horizontal // 水平布局
}))

// 计算是否显示侧边栏
const showSidebar = computed(() => {
  return menuLayout.value !== MenuLayoutMode.Horizontal && !sidebar.value.hide
})
```

## 主题系统

### 主题色应用

通过 CSS 变量 `--current-color` 实现主题色的全局应用：

```vue
<template>
  <div
    class="app-wrapper"
    :class="classObj"
    :style="{ '--current-color': theme }"
  >
    <!-- 布局内容 -->
  </div>
</template>
```

### 预定义主题色

系统提供 7 种预设主题色：

```typescript
export const PREDEFINED_THEME_COLORS = [
  '#5D87FF', // 默认蓝色
  '#B48DF3', // 紫色
  '#1D84FF', // 深蓝
  '#60C041', // 绿色
  '#38C0FC', // 青色
  '#F9901F', // 橙色
  '#FF80C8'  // 粉色
] as const
```

### 暗黑模式

通过 VueUse 的 `useDark` 实现暗黑模式切换：

```typescript
// 暗黑模式管理
const isDark = useDark({
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
})

// 初始化时同步暗黑模式状态
isDark.value = state.config.dark

// 监听配置中的暗黑模式变化，同步到 VueUse
watch(dark, (newValue) => {
  isDark.value = newValue
})

// 监听 VueUse 的暗黑模式变化，同步到配置
watch(isDark, (newValue) => {
  dark.value = newValue
})
```

### 侧边栏主题

侧边栏支持深色和浅色两种主题：

```typescript
export enum SideTheme {
  /** 深色主题 */
  Dark = 'theme-dark',
  /** 浅色主题 */
  Light = 'theme-light'
}
```

## 水印功能

Layout 组件内置全局水印功能，通过 `AWatermark` 组件实现。

### 水印配置

```typescript
// 水印配置
const watermarkVisible = layout.watermark
const userStore = useUserStore()

const watermarkContentText = computed(() => {
  // 优先使用用户配置的水印内容
  const configContent = layout.watermarkContent.value

  // 如果配置了具体内容（非空字符串），使用配置的内容
  if (configContent && configContent.trim() !== '') {
    return configContent
  }

  // 如果配置为空，使用当前登录用户的用户名
  const userName = userStore.userInfo?.userName
  if (userName) {
    return userName
  }

  // 兜底：使用应用标题
  return SystemConfig.app.title || 'ruoyi-plus-uniapp'
})
```

### 水印显示优先级

1. **用户配置的水印内容** - 如果在设置中配置了水印文字，优先使用
2. **当前登录用户名** - 如果未配置，显示当前登录用户的用户名
3. **应用标题** - 兜底方案，显示应用名称

### 水印使用示例

```vue
<template>
  <!-- 全局水印 - 独立渲染，不包裹内容 -->
  <AWatermark
    :visible="watermarkVisible"
    :content="watermarkContentText"
  />
</template>
```

## 实时通信

Layout 组件在挂载时初始化实时通信连接，支持 WebSocket 和 SSE 两种方式。

### WebSocket 连接

```typescript
onMounted(() => {
  // 建立 WebSocket 实时通信连接
  webSocket.initialize()
  webSocket.connect()
})
```

**WebSocket 功能:**

- 实时消息推送
- 在线状态同步
- 系统通知下发

### SSE 连接

```typescript
onMounted(() => {
  // 启用服务端推送事件
  useSSE(SystemConfig.api.baseUrl + '/resource/sse')
})
```

**SSE 功能:**

- 服务端单向推送
- 资源更新通知
- 权限变更通知

### 通信架构

```text
┌────────────────┐     WebSocket     ┌────────────────┐
│                │ <===============> │                │
│   前端应用     │                   │   后端服务     │
│                │      SSE          │                │
│                │ <===============  │                │
└────────────────┘                   └────────────────┘
```

## useLayout 集成

Layout 组件深度集成 `useLayout` 组合函数，实现布局状态的统一管理。

### 获取布局实例

```typescript
import { useLayout } from '@/composables/useLayout'

// 获取应用布局状态
const layout = useLayout()
```

### 响应式状态

```typescript
// 响应式状态
const theme = layout.theme                    // 主题色
const sidebar = layout.sidebar                // 侧边栏状态
const device = layout.device                  // 设备类型
const needTagsView = layout.tagsView          // 是否显示标签视图
const fixedHeader = layout.fixedHeader        // 是否固定头部
const menuLayout = layout.menuLayout          // 菜单布局模式

// 水印配置
const watermarkVisible = layout.watermark
```

### 状态操作方法

```typescript
// 侧边栏操作
layout.toggleSideBar()     // 切换侧边栏
layout.openSideBar()       // 打开侧边栏
layout.closeSideBar()      // 关闭侧边栏
layout.toggleSideBarHide() // 设置侧边栏隐藏状态

// 设备切换
layout.toggleDevice('mobile') // 切换为移动端
layout.toggleDevice('pc')     // 切换为桌面端

// 主题操作
layout.toggleDark(true)       // 启用暗黑模式
layout.theme.value = '#ff6b6b' // 设置主题色

// 标签视图操作
layout.addView(route)         // 添加标签
layout.delView(route)         // 删除标签
```

### 完整 useLayout API

```typescript
interface UseLayoutReturn {
  // 只读状态
  state: Readonly<LayoutState>

  // 基础状态计算属性
  device: ComputedRef<DeviceType>
  sidebar: ComputedRef<SidebarState>
  title: ComputedRef<string>
  showSettings: ComputedRef<boolean>
  animationEnable: ComputedRef<boolean>

  // 用户偏好配置
  language: WritableComputedRef<LanguageCode>
  locale: ComputedRef<LocaleType>
  size: WritableComputedRef<ElSize>

  // 主题外观配置
  theme: WritableComputedRef<string>
  sideTheme: WritableComputedRef<SideTheme>
  dark: WritableComputedRef<boolean>

  // 布局功能配置
  topNav: WritableComputedRef<boolean>
  menuLayout: WritableComputedRef<MenuLayoutMode>
  tagsView: WritableComputedRef<boolean>
  fixedHeader: WritableComputedRef<boolean>
  sidebarLogo: WritableComputedRef<boolean>
  dynamicTitle: WritableComputedRef<boolean>

  // 水印配置
  watermark: WritableComputedRef<boolean>
  watermarkContent: WritableComputedRef<string>

  // 标签视图状态
  visitedViews: ComputedRef<RouteLocationNormalized[]>
  cachedViews: ComputedRef<string[]>
  iframeViews: ComputedRef<RouteLocationNormalized[]>

  // 操作方法
  toggleSideBar: (withoutAnimation?: boolean) => void
  openSideBar: (withoutAnimation?: boolean) => void
  closeSideBar: (withoutAnimation?: boolean) => void
  toggleSideBarHide: (status: boolean) => void
  toggleDevice: (device: DeviceType) => void
  setSize: (size: ElSize) => void
  changeLanguage: (lang: LanguageCode) => void
  toggleDark: (value: boolean) => void
  setTitle: (value: string) => void
  resetTitle: () => void
  saveSettings: (config?: Partial<LayoutSetting>) => void
  resetConfig: () => void

  // 标签视图操作
  addView: (view: RouteLocationNormalized) => void
  delView: (view: RouteLocationNormalized) => Promise<ViewResult>
  delOthersViews: (view: RouteLocationNormalized) => Promise<ViewResult>
  delAllViews: () => Promise<ViewResult>
  delRightTags: (view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>
  delLeftTags: (view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>
  // ... 更多标签视图方法
}
```

## 设置面板

通过 `Settings` 组件提供可视化的布局配置界面。

### 打开设置面板

```typescript
// 组件引用
const settingRef = ref<InstanceType<typeof Settings>>()

// 打开设置面板
const setLayout = () => {
  settingRef.value?.openSetting()
}
```

### 设置面板功能

| 功能分类 | 配置项 | 说明 |
|----------|--------|------|
| 布局模式 | 垂直/水平/混合 | 切换菜单布局方式 |
| 侧边栏主题 | 深色/浅色 | 侧边栏背景色 |
| 主题色 | 7种预设色 + 自定义 | 应用主色调 |
| 暗黑模式 | 开/关 | 深色主题切换 |
| 固定头部 | 开/关 | 滚动时头部是否固定 |
| 标签视图 | 开/关 | 是否显示多标签页 |
| 侧边栏Logo | 开/关 | 是否显示Logo |
| 动态标题 | 开/关 | 浏览器标题是否动态变化 |
| 水印 | 开/关 | 是否显示全局水印 |

## 样式系统

### 布局样式变量

```scss
// 侧边栏宽度
$sideBarWidth: 210px;
$hideSideBarWidth: 54px;

// 头部高度
$navBarHeight: 50px;

// 标签视图高度
$tagViewHeight: 34px;

// 过渡动画
$sideBarDuration: 0.28s;
```

### 主要类名

| 类名 | 说明 |
|------|------|
| `.app-wrapper` | 最外层容器 |
| `.sidebar-container` | 侧边栏容器 |
| `.main-container` | 主内容容器 |
| `.fixed-header` | 固定头部 |
| `.hasTagsView` | 有标签视图时的样式 |
| `.sidebarHide` | 侧边栏隐藏状态 |
| `.horizontalLayout` | 水平布局状态 |
| `.hideSidebar` | 侧边栏收起状态 |
| `.openSidebar` | 侧边栏展开状态 |
| `.withoutAnimation` | 无动画状态 |
| `.mobile` | 移动端状态 |
| `.drawer-bg` | 移动端遮罩层 |

### 响应式样式

```scss
// 移动端适配
.mobile {
  .sidebar-container {
    position: fixed;
    z-index: 1001;
    transition: transform $sideBarDuration;
  }

  &.hideSidebar {
    .sidebar-container {
      transform: translate3d(-$sideBarWidth, 0, 0);
    }
  }

  .main-container {
    margin-left: 0;
  }
}

// 水平布局
.horizontalLayout {
  .sidebar-container {
    display: none;
  }

  .main-container {
    margin-left: 0;

    &.sidebarHide {
      margin-left: 0;
    }
  }
}
```

## 路由配置

### 布局路由

```typescript
// router/index.ts
import Layout from '@/layouts/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/index.vue'),
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'system' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'peoples' }
      }
    ]
  }
]
```

### 路由 Meta 配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | string | 页面标题，显示在标签和面包屑中 |
| `icon` | string | 菜单图标 |
| `affix` | boolean | 是否固定在标签视图中 |
| `noCache` | boolean | 是否禁用页面缓存 |
| `hidden` | boolean | 是否在菜单中隐藏 |
| `activeMenu` | string | 高亮的菜单路径 |
| `link` | string | 外链地址 |

## 性能优化

### 页面缓存

通过 `keep-alive` 实现页面缓存，配合标签视图使用：

```vue
<!-- AppMain.vue -->
<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>
```

### 条件渲染优化

```vue
<template>
  <!-- 使用 v-if 而非 v-show 优化性能 -->
  <Sidebar v-if="showSidebar" class="sidebar-container" />

  <!-- 标签视图条件显示 -->
  <tags-view v-if="needTagsView" />
</template>
```

### 动画优化

```typescript
// 禁用动画的场景
layout.openSideBar(true)  // 传入 true 禁用动画
layout.closeSideBar(true) // 传入 true 禁用动画
```

## 最佳实践

### 状态管理集中化

```typescript
// ✅ 推荐：使用 useLayout 管理状态
const layout = useLayout()
layout.toggleSideBar()

// ❌ 避免：直接操作 DOM
document.querySelector('.sidebar').style.width = '200px'
```

### 响应式友好

```typescript
// ✅ 推荐：使用计算属性响应状态变化
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  mobile: device.value === 'mobile'
}))

// ❌ 避免：使用非响应式变量
let isMobile = false
```

### 样式变量化

```scss
// ✅ 推荐：使用 CSS 变量
.sidebar {
  width: $sideBarWidth;
  background: var(--current-color);
}

// ❌ 避免：硬编码样式值
.sidebar {
  width: 210px;
  background: #5D87FF;
}
```

### 移动端优先

```vue
<!-- ✅ 推荐：响应式处理 -->
<div class="layout" :class="{ mobile: device === 'mobile' }">

<!-- ❌ 避免：忽略移动端 -->
<div class="layout">
```

### 配置持久化

```typescript
// ✅ 推荐：使用 saveSettings 保存配置
layout.saveSettings({
  theme: '#ff6b6b',
  dark: true
})

// ✅ 推荐：使用 resetConfig 重置配置
layout.resetConfig()
```

## 常见问题

### 1. 侧边栏显示异常

**问题描述:** 侧边栏不显示或显示位置错误。

**排查步骤:**

1. 检查 `sidebar.hide` 状态是否为 `true`
2. 确认当前布局模式不是 `Horizontal`
3. 验证 CSS 变量是否正确加载
4. 检查响应式断点设置

**解决方案:**

```typescript
// 检查侧边栏状态
const layout = useLayout()
console.log('sidebar.hide:', layout.sidebar.value.hide)
console.log('menuLayout:', layout.menuLayout.value)

// 强制显示侧边栏
layout.toggleSideBarHide(false)
layout.openSideBar()
```

### 2. 主题切换不生效

**问题描述:** 切换主题色后界面没有变化。

**排查步骤:**

1. 检查 `--current-color` CSS 变量是否正确设置
2. 确认 ThemeStore 状态是否更新
3. 验证 CSS 变量的作用域

**解决方案:**

```typescript
// 检查主题状态
const layout = useLayout()
console.log('theme:', layout.theme.value)

// 强制刷新主题
layout.theme.value = '#ff6b6b'
```

### 3. 移动端布局错乱

**问题描述:** 在移动端设备上布局显示不正确。

**排查步骤:**

1. 检查设备检测逻辑是否正确
2. 确认移动端专用样式是否加载
3. 验证遮罩层事件处理

**解决方案:**

```typescript
// 检查设备类型
const layout = useLayout()
console.log('device:', layout.device.value)

// 手动切换为移动端模式
layout.toggleDevice('mobile')
layout.closeSideBar()
```

### 4. 标签视图不更新

**问题描述:** 路由切换后标签视图没有更新。

**排查步骤:**

1. 确认 `tagsView` 配置是否开启
2. 检查路由 meta 配置是否正确
3. 验证标签视图组件是否正确挂载

**解决方案:**

```typescript
// 检查标签视图配置
const layout = useLayout()
console.log('tagsView enabled:', layout.tagsView.value)
console.log('visitedViews:', layout.visitedViews.value)

// 手动添加视图
const route = useRoute()
layout.addView(route)
```

### 5. 水印不显示

**问题描述:** 开启水印后页面上没有显示水印。

**排查步骤:**

1. 检查 `watermark` 配置是否为 `true`
2. 确认 `watermarkContent` 是否有值
3. 验证 AWatermark 组件是否正确渲染

**解决方案:**

```typescript
// 检查水印配置
const layout = useLayout()
console.log('watermark:', layout.watermark.value)
console.log('watermarkContent:', layout.watermarkContent.value)

// 开启水印
layout.watermark.value = true
layout.watermarkContent.value = '机密文档'
```

### 6. WebSocket 连接失败

**问题描述:** 实时通信功能不可用。

**排查步骤:**

1. 检查后端 WebSocket 服务是否启动
2. 确认 SSE 端点是否可访问
3. 验证网络连接状态

**解决方案:**

```typescript
// 检查连接状态
console.log('WebSocket URL:', SystemConfig.api.baseUrl + '/resource/sse')

// 手动重连
webSocket.initialize()
webSocket.connect()
```

### 调试技巧

```typescript
// 开发环境调试
if (import.meta.env.DEV) {
  const layout = useLayout()

  console.log('Layout State:', {
    sidebar: layout.sidebar.value,
    device: layout.device.value,
    theme: layout.theme.value,
    menuLayout: layout.menuLayout.value,
    tagsView: layout.tagsView.value,
    fixedHeader: layout.fixedHeader.value
  })
}
```

## 类型定义

### LayoutState 接口

```typescript
/**
 * 布局状态接口
 */
interface LayoutState {
  /** 当前设备类型，影响布局响应式行为 */
  device: DeviceType
  /** 侧边栏状态配置 */
  sidebar: SidebarState
  /** 当前页面标题，用于动态标题显示 */
  title: string
  /** 是否显示设置面板 */
  showSettings: boolean
  /** 是否启用页面切换动画效果 */
  animationEnable: boolean
  /** 标签视图状态，管理多标签页功能 */
  tagsView: TagsViewState
  /** 布局配置，包含所有UI相关设置 */
  config: LayoutSetting
}
```

### SidebarState 接口

```typescript
/**
 * 侧边栏状态接口
 */
interface SidebarState {
  /** 是否打开侧边栏 */
  opened: boolean
  /** 是否禁用切换动画 */
  withoutAnimation: boolean
  /** 是否完全隐藏侧边栏（用于特殊页面） */
  hide: boolean
}
```

### TagsViewState 接口

```typescript
/**
 * 标签视图状态接口
 */
interface TagsViewState {
  /** 已访问的视图列表 */
  visitedViews: RouteLocationNormalized[]
  /** 缓存的视图名称列表 */
  cachedViews: string[]
  /** iframe 视图列表 */
  iframeViews: RouteLocationNormalized[]
}
```

### DeviceType 类型

```typescript
/**
 * 设备类型定义
 */
type DeviceType = 'pc' | 'mobile' | 'tablet'
```

### LayoutSetting 接口

```typescript
/**
 * 布局配置接口
 */
interface LayoutSetting {
  // 标题配置
  title: string

  // 布局相关配置
  topNav: boolean
  menuLayout: MenuLayoutMode
  tagsView: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  dynamicTitle: boolean
  layout: string

  // 外观主题配置
  theme: string
  sideTheme: SideTheme
  dark: boolean

  // 功能配置
  showSettings: boolean
  animationEnable: boolean

  // 用户偏好配置
  sidebarStatus: string
  size: ElSize
  language: LanguageCode

  // 选择器配置
  showSelectValue: boolean

  // 水印配置
  watermark: boolean
  watermarkContent: string
}
```

## 总结

Layout 组件是整个后台管理系统的布局基石，通过精心设计的组件结构、响应式适配、主题系统、实时通信和状态管理，为用户提供了流畅的使用体验。

**关键要点:**

1. **三种布局模式** - 垂直、水平、混合布局满足不同场景需求
2. **响应式设计** - 992px 断点自动切换 PC/移动端模式
3. **useLayout 集成** - 统一的布局状态管理和操作接口
4. **实时通信** - WebSocket + SSE 双通道消息推送
5. **水印功能** - 灵活的全局水印配置
6. **配置持久化** - 用户偏好自动保存到本地存储

理解 Layout 的工作原理和最佳实践，是开发高质量后台管理系统的重要基础。
