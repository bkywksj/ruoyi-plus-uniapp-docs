# useLayout

布局状态管理组合函数，提供统一的布局配置、响应式设计和界面状态管理功能。该 Composable 是 Plus-UI 管理系统的核心布局管理模块，负责侧边栏控制、标签视图管理、主题切换、设备适配、配置持久化等功能的统一调度。

## 功能特性

- **统一状态管理** - 使用单一配置对象管理所有布局相关状态，确保状态一致性
- **单例模式设计** - 全局唯一的状态实例，避免多实例导致的状态不同步问题
- **响应式设计** - 自适应移动端和桌面端，基于 992px 断点自动切换布局
- **暗黑模式支持** - 集成 VueUse 的 `useDark`，实现无缝主题切换
- **多语言支持** - 集成 Element Plus 国际化，支持中英文切换
- **标签视图管理** - 完整的多标签页功能，支持缓存、固定、关闭等操作
- **配置持久化** - 自动保存用户配置到 localStorage，刷新页面保持状态
- **类型安全** - 完整的 TypeScript 类型定义，提供良好的开发体验
- **动态标题** - 支持页面标题动态更新，提升用户体验

## 核心架构

### 模块协作关系

`useLayout` 作为布局管理的核心模块，与系统中其他模块紧密协作：

```
┌─────────────────────────────────────────────────────────────────┐
│                        useLayout (核心)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 侧边栏管理  │  │ 标签视图管理 │  │ 主题管理    │             │
│  │ Sidebar     │  │ TagsView    │  │ Theme       │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 设备检测    │  │ 配置持久化  │  │ 标题管理    │             │
│  │ Device      │  │ Persistence │  │ Title       │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                        依赖模块                                  │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ @vueuse/core │ localCache   │ SystemConfig │ vue-router        │
│ useDark      │ 本地存储     │ 系统配置     │ 路由信息          │
│ useWindowSize│              │              │                   │
└──────────────┴──────────────┴──────────────┴───────────────────┘
```

### 单例模式实现

`useLayout` 采用单例模式设计，确保全局状态的唯一性：

```typescript
// 全局布局状态实例
let layoutStateInstance: ReturnType<typeof createLayoutState> | null = null

// 创建布局状态实例
function createLayoutState() {
  // 从本地缓存加载配置
  const cachedConfig = localCache.getJSON<LayoutSetting>(CACHE_KEY) || { ...DEFAULT_CONFIG }

  // 创建响应式状态对象
  const state = reactive<LayoutState>({
    device: 'pc',
    sidebar: createSidebarState(cachedConfig.sidebarStatus),
    title: SystemConfig.ui.title,
    showSettings: SystemConfig.ui.showSettings,
    animationEnable: SystemConfig.ui.animationEnable,
    tagsView: createTagsViewState(),
    config: { ...cachedConfig }
  })

  // ... 状态管理逻辑

  return { state, ...methods }
}

// 导出的 Hook 函数
export const useLayout = () => {
  if (!layoutStateInstance) {
    layoutStateInstance = createLayoutState()
  }
  return layoutStateInstance
}
```

**单例模式的优势：**
- 全局唯一状态，避免多组件间状态不同步
- 首次调用时初始化，后续调用直接返回已有实例
- 配置持久化只需在单一位置处理
- 便于调试和状态追踪

### 数据流向

```
用户操作
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     useLayout 方法调用                           │
│  toggleSideBar() / toggleDark() / addView() / setTitle()        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     响应式状态更新                               │
│  state.sidebar / state.config / state.tagsView                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌───────────┐   ┌───────────┐   ┌───────────┐
        │ 视图更新  │   │ 配置持久化│   │ DOM 更新  │
        │ computed  │   │ watch     │   │ title     │
        └───────────┘   └───────────┘   └───────────┘
```

## 类型定义

### 设备类型

```typescript
/**
 * 设备类型定义
 * 用于响应式布局的设备类型识别
 */
type DeviceType = 'pc' | 'mobile' | 'tablet'
```

**使用场景：**
- `pc`: 桌面端设备，显示完整侧边栏
- `mobile`: 移动端设备，侧边栏以抽屉形式展示
- `tablet`: 平板设备，可选择性展示侧边栏

### 侧边栏状态

```typescript
/**
 * 侧边栏状态接口
 * 定义侧边栏的完整状态信息
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

**状态说明：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `opened` | `boolean` | 侧边栏展开状态，`true` 表示展开，`false` 表示收起 |
| `withoutAnimation` | `boolean` | 切换时是否禁用动画，用于响应式切换时避免闪烁 |
| `hide` | `boolean` | 是否完全隐藏侧边栏，用于特殊布局模式（如水平导航） |

### 标签视图状态

```typescript
/**
 * 标签视图状态接口
 * 管理多标签页功能的状态
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

**标签类型说明：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `visitedViews` | `RouteLocationNormalized[]` | 用户已访问的页面列表，用于渲染标签栏 |
| `cachedViews` | `string[]` | 需要缓存的视图组件名称，配合 `<keep-alive>` 使用 |
| `iframeViews` | `RouteLocationNormalized[]` | 内嵌 iframe 的视图列表，需要特殊处理 |

### 完整布局状态

```typescript
/**
 * 布局状态接口
 * 定义整个应用布局的完整状态结构
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

### 布局配置

```typescript
/**
 * 布局设置接口
 * 包含所有可配置的UI选项
 */
interface LayoutSetting {
  // 标题配置
  title: string                    // 系统标题

  // 布局相关配置
  topNav: boolean                  // 是否显示顶部导航
  menuLayout: MenuLayoutMode       // 菜单布局模式
  tagsView: boolean                // 是否显示标签视图
  fixedHeader: boolean             // 是否固定头部
  sidebarLogo: boolean             // 是否显示侧边栏Logo
  dynamicTitle: boolean            // 是否使用动态标题
  layout: string                   // 布局类型

  // 外观主题配置
  theme: string                    // 主题色
  sideTheme: string                // 侧边栏主题
  dark: boolean                    // 暗黑模式

  // 功能配置
  showSettings: boolean            // 是否显示设置面板
  animationEnable: boolean         // 是否启用动画

  // 用户偏好配置
  sidebarStatus: string            // 侧边栏状态
  size: ElSize                     // 组件尺寸
  language: LanguageCode           // 界面语言

  // 选择器配置
  showSelectValue: boolean         // 选择器是否显示值

  // 水印配置
  watermark: boolean               // 是否显示水印
  watermarkContent: string         // 水印内容
}
```

### 菜单布局模式

```typescript
/**
 * 菜单布局模式枚举
 */
enum MenuLayoutMode {
  /** 垂直布局 - 左侧侧边栏导航 */
  Vertical = 'vertical',
  /** 水平布局 - 顶部导航栏 */
  Horizontal = 'horizontal',
  /** 混合布局 - 顶部 + 侧边栏 */
  Mixed = 'mixed'
}
```

**布局模式对比：**

| 模式 | 顶部导航 | 侧边栏 | 适用场景 |
|------|---------|--------|---------|
| `vertical` | 隐藏 | 显示 | 菜单层级较深的系统 |
| `horizontal` | 显示 | 隐藏 | 菜单项较少的系统 |
| `mixed` | 显示 | 显示 | 需要同时展示的复杂系统 |

## 基础用法

### 基本布局控制

```vue
<template>
  <div class="layout-container" :class="{ 'sidebar-opened': sidebar.opened }">
    <!-- 侧边栏 -->
    <aside
      v-show="!isMobile || sidebar.opened"
      :class="['sidebar', { 'collapsed': !sidebar.opened }]">
      <div class="sidebar-content">
        <el-menu :collapse="!sidebar.opened">
          <!-- 菜单项 -->
        </el-menu>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="navbar">
        <el-button
          :icon="sidebar.opened ? 'Fold' : 'Expand'"
          @click="toggleSideBar">
        </el-button>

        <span class="page-title">{{ title }}</span>
      </header>

      <!-- 标签栏 -->
      <div v-if="tagsView" class="tags-view">
        <el-tag
          v-for="tag in visitedViews"
          :key="tag.path"
          :closable="!tag.meta?.affix"
          @close="handleCloseTag(tag)">
          {{ tag.meta?.title }}
        </el-tag>
      </div>

      <!-- 页面内容 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <keep-alive :include="cachedViews">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </main>

    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && sidebar.opened"
      class="sidebar-mask"
      @click="closeSideBar">
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const {
  // 布局状态
  sidebar,
  title,
  tagsView,
  device,

  // 标签视图
  visitedViews,
  cachedViews,

  // 操作方法
  toggleSideBar,
  closeSideBar,
  delView
} = useLayout()

// 计算是否为移动端
const isMobile = computed(() => device.value === 'mobile')

// 关闭标签
const handleCloseTag = async (view: RouteLocationNormalized) => {
  await delView(view)
}
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  height: 100vh;

  &.sidebar-opened {
    .main-content {
      margin-left: 200px;
    }
  }
}

.sidebar {
  width: 200px;
  transition: width 0.3s;

  &.collapsed {
    width: 64px;
  }
}

.main-content {
  flex: 1;
  transition: margin-left 0.3s;
}

.sidebar-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}
</style>
```

### 响应式布局

```vue
<template>
  <div class="responsive-layout">
    <!-- 桌面端导航 -->
    <template v-if="!isMobile">
      <nav class="desktop-nav">
        <el-menu
          :default-active="$route.path"
          :collapse="!sidebar.opened"
          mode="vertical">
          <template v-for="item in menuItems" :key="item.path">
            <el-menu-item :index="item.path">
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </nav>
    </template>

    <!-- 移动端导航 -->
    <el-drawer
      v-else
      v-model="sidebarVisible"
      :with-header="false"
      direction="ltr"
      size="280px"
      @close="closeSideBar">
      <div class="mobile-nav">
        <el-menu :default-active="$route.path" mode="vertical">
          <template v-for="item in menuItems" :key="item.path">
            <el-menu-item :index="item.path" @click="handleMenuClick(item)">
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
    </el-drawer>

    <!-- 内容区域 -->
    <section :class="['content-area', {
      'content-expanded': !sidebar.opened,
      'content-mobile': isMobile
    }]">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const router = useRouter()

const {
  device,
  sidebar,
  closeSideBar
} = useLayout()

const isMobile = computed(() => device.value === 'mobile')
const sidebarVisible = computed({
  get: () => sidebar.value.opened,
  set: (val) => {
    if (!val) closeSideBar()
  }
})

const menuItems = ref([
  { path: '/dashboard', title: '仪表盘', icon: 'Odometer' },
  { path: '/system', title: '系统管理', icon: 'Setting' },
  { path: '/monitor', title: '系统监控', icon: 'Monitor' }
])

const handleMenuClick = (item: typeof menuItems.value[0]) => {
  router.push(item.path)
  if (isMobile.value) {
    closeSideBar()
  }
}
</script>
```

## 侧边栏管理

### 侧边栏状态控制

`useLayout` 提供了完整的侧边栏控制方法：

```vue
<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const {
  sidebar,
  toggleSideBar,
  openSideBar,
  closeSideBar,
  toggleSideBarHide
} = useLayout()

// 切换侧边栏展开/收起
const handleToggle = () => {
  toggleSideBar()
}

// 无动画切换（用于响应式切换）
const handleToggleWithoutAnimation = () => {
  toggleSideBar(true)
}

// 强制打开侧边栏
const handleOpen = () => {
  openSideBar()
}

// 强制关闭侧边栏
const handleClose = () => {
  closeSideBar()
}

// 完全隐藏侧边栏（用于特殊页面）
const handleHideSidebar = () => {
  toggleSideBarHide(true)
}

// 恢复显示侧边栏
const handleShowSidebar = () => {
  toggleSideBarHide(false)
}
</script>
```

### 侧边栏状态持久化

侧边栏状态会自动保存到本地存储：

```typescript
// 侧边栏状态常量
const SIDEBAR_OPEN = '1'
const SIDEBAR_CLOSED = '0'

// 更新侧边栏状态
const updateSidebarStatus = (status: string, withoutAnimation = false) => {
  state.config.sidebarStatus = status
  state.sidebar.withoutAnimation = withoutAnimation
  state.sidebar.opened = status === SIDEBAR_OPEN
}

// 配置变化时自动持久化
watch(
  () => state.config,
  (newConfig) => {
    localCache.setJSON(CACHE_KEY, newConfig)
    // 同步更新侧边栏状态
    state.sidebar.opened = newConfig.sidebarStatus ? !!+newConfig.sidebarStatus : true
  },
  { deep: true }
)
```

### 菜单布局模式切换

```vue
<template>
  <div class="layout-settings">
    <el-form label-width="100px">
      <el-form-item label="菜单布局">
        <el-select v-model="menuLayout" @change="handleLayoutChange">
          <el-option label="垂直布局" value="vertical" />
          <el-option label="水平布局" value="horizontal" />
          <el-option label="混合布局" value="mixed" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { MenuLayoutMode } from '@/systemConfig'

const { menuLayout, topNav, toggleSideBarHide } = useLayout()

// 监听菜单布局变化，自动调整相关状态
const handleLayoutChange = (mode: MenuLayoutMode) => {
  switch (mode) {
    case MenuLayoutMode.Horizontal:
      topNav.value = true
      toggleSideBarHide(true)
      break
    case MenuLayoutMode.Mixed:
      topNav.value = true
      toggleSideBarHide(false)
      break
    case MenuLayoutMode.Vertical:
      topNav.value = false
      toggleSideBarHide(false)
      break
  }
}
</script>
```

## 标签视图管理

### 标签视图基础操作

```vue
<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        :class="['tags-view-item', { active: isActive(tag) }]"
        @contextmenu.prevent="openContextMenu(tag, $event)">
        {{ tag.meta?.title || 'no-name' }}
        <el-icon
          v-if="!isAffix(tag)"
          class="close-icon"
          @click.prevent.stop="closeTag(tag)">
          <Close />
        </el-icon>
      </router-link>
    </div>

    <!-- 右键菜单 -->
    <ul v-show="contextMenu.visible" :style="contextMenuStyle" class="context-menu">
      <li @click="refreshSelectedTag">刷新页面</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag">关闭当前</li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeLeftTags">关闭左侧</li>
      <li @click="closeRightTags">关闭右侧</li>
      <li @click="closeAllTags">关闭所有</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayout } from '@/composables/useLayout'
import type { RouteLocationNormalized } from 'vue-router'

const route = useRoute()
const router = useRouter()

const {
  visitedViews,
  cachedViews,
  addView,
  delView,
  delOthersViews,
  delLeftTags,
  delRightTags,
  delAllViews,
  delCachedView
} = useLayout()

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  left: 0,
  top: 0
})

const selectedTag = ref<RouteLocationNormalized | null>(null)

const contextMenuStyle = computed(() => ({
  left: `${contextMenu.value.left}px`,
  top: `${contextMenu.value.top}px`
}))

// 判断标签是否激活
const isActive = (tag: RouteLocationNormalized) => {
  return tag.path === route.path
}

// 判断是否为固定标签
const isAffix = (tag: RouteLocationNormalized | null) => {
  return tag?.meta?.affix === true
}

// 添加新标签
const addTags = () => {
  if (route.name) {
    addView(route)
  }
}

// 监听路由变化，自动添加标签
watch(
  () => route.path,
  () => {
    addTags()
  },
  { immediate: true }
)

// 关闭标签
const closeTag = async (view: RouteLocationNormalized) => {
  const { visitedViews } = await delView(view)
  if (isActive(view)) {
    toLastView(visitedViews, view)
  }
}

// 跳转到最后一个标签
const toLastView = (visitedViews: RouteLocationNormalized[], view: RouteLocationNormalized) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    router.push('/')
  }
}

// 打开右键菜单
const openContextMenu = (tag: RouteLocationNormalized, e: MouseEvent) => {
  selectedTag.value = tag
  contextMenu.value = {
    visible: true,
    left: e.clientX,
    top: e.clientY
  }
}

// 刷新选中的标签
const refreshSelectedTag = async () => {
  if (selectedTag.value) {
    await delCachedView(selectedTag.value)
    router.replace({
      path: '/redirect' + selectedTag.value.path
    })
  }
  contextMenu.value.visible = false
}

// 关闭选中的标签
const closeSelectedTag = async () => {
  if (selectedTag.value) {
    await closeTag(selectedTag.value)
  }
  contextMenu.value.visible = false
}

// 关闭其他标签
const closeOthersTags = async () => {
  if (selectedTag.value) {
    await delOthersViews(selectedTag.value)
    if (!isActive(selectedTag.value)) {
      router.push(selectedTag.value.path)
    }
  }
  contextMenu.value.visible = false
}

// 关闭左侧标签
const closeLeftTags = async () => {
  if (selectedTag.value) {
    await delLeftTags(selectedTag.value)
    if (!visitedViews.value.some(v => v.path === route.path)) {
      router.push(selectedTag.value.path)
    }
  }
  contextMenu.value.visible = false
}

// 关闭右侧标签
const closeRightTags = async () => {
  if (selectedTag.value) {
    await delRightTags(selectedTag.value)
    if (!visitedViews.value.some(v => v.path === route.path)) {
      router.push(selectedTag.value.path)
    }
  }
  contextMenu.value.visible = false
}

// 关闭所有标签
const closeAllTags = async () => {
  const { visitedViews } = await delAllViews()
  if (selectedTag.value && isAffix(selectedTag.value)) {
    return
  }
  toLastView(visitedViews, route)
  contextMenu.value.visible = false
}
</script>
```

### 标签缓存与 keep-alive

```vue
<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const route = useRoute()
const { cachedViews } = useLayout()
</script>

<style lang="scss" scoped>
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

### iframe 视图管理

```vue
<template>
  <div class="iframe-container">
    <!-- 普通路由视图 -->
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
    </router-view>

    <!-- iframe 视图 -->
    <template v-for="item in iframeViews" :key="item.path">
      <iframe
        v-show="route.path === item.path"
        :src="item.meta?.link"
        class="iframe-view"
        frameborder="0">
      </iframe>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const route = useRoute()
const { cachedViews, iframeViews, addIframeView } = useLayout()

// 监听路由变化，自动添加 iframe 视图
watch(
  () => route.path,
  () => {
    if (route.meta?.link) {
      addIframeView(route)
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.iframe-container {
  position: relative;
  height: 100%;
}

.iframe-view {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
```

## 响应式设计

### 设备检测与自动适配

`useLayout` 使用 VueUse 的 `useWindowSize` 实现响应式设计：

```typescript
const { width } = useWindowSize()
const BREAKPOINT = 992 // 移动端断点

// 监听窗口宽度变化，自动切换设备类型
watch(width, () => {
  const isMobile = width.value - 1 < BREAKPOINT

  // 如果当前是移动端状态，确保侧边栏关闭
  if (state.device === 'mobile') {
    closeSideBar()
  }

  if (isMobile) {
    toggleDevice('mobile')
    closeSideBar()
  } else {
    toggleDevice('pc')
    openSideBar()
  }
})
```

### 响应式布局组件

```vue
<template>
  <div :class="['app-wrapper', classObj]">
    <!-- 移动端侧边栏遮罩 -->
    <div
      v-if="classObj.mobile && classObj.openSidebar"
      class="drawer-bg"
      @click="handleClickOutside">
    </div>

    <!-- 侧边栏 -->
    <Sidebar v-if="!sidebar.hide" class="sidebar-container" />

    <!-- 主区域 -->
    <div
      :class="['main-container', {
        'has-tags-view': tagsView.value,
        'fixed-header': fixedHeader.value
      }]">
      <div :class="{ 'fixed-header': fixedHeader.value }">
        <Navbar />
        <TagsView v-if="tagsView.value" />
      </div>

      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const {
  device,
  sidebar,
  tagsView,
  fixedHeader,
  closeSideBar
} = useLayout()

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

const handleClickOutside = () => {
  closeSideBar(true)
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100%;

  &.mobile {
    .sidebar-container {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1001;
      transition: transform 0.28s;
    }

    &.hideSidebar {
      .sidebar-container {
        transform: translateX(-100%);
      }
    }
  }
}

.drawer-bg {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
}

.main-container {
  flex: 1;
  min-height: 100%;
  transition: margin-left 0.28s;

  .hideSidebar & {
    margin-left: 54px;
  }

  .mobile & {
    margin-left: 0 !important;
  }
}
</style>
```

### 断点管理

```vue
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useLayout } from '@/composables/useLayout'

const { device } = useLayout()

// 基于设备类型的响应式计算属性
const isMobile = computed(() => device.value === 'mobile')
const isTablet = computed(() => device.value === 'tablet')
const isDesktop = computed(() => device.value === 'pc')

// 响应式列数
const gridColumns = computed(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2
  return 4
})

// 响应式间距
const gridGap = computed(() => {
  if (isMobile.value) return '8px'
  if (isTablet.value) return '16px'
  return '24px'
})

// 监听设备变化
watch(device, (newDevice) => {
  console.log('设备类型已切换:', newDevice)
  // 可以执行设备切换后的逻辑
})
</script>
```

## 主题与外观

### 暗黑模式切换

`useLayout` 集成了 VueUse 的 `useDark`，提供无缝的暗黑模式切换：

```vue
<template>
  <div class="theme-switcher">
    <el-switch
      v-model="isDark"
      :active-icon="Moon"
      :inactive-icon="Sunny"
      @change="handleDarkModeChange">
    </el-switch>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useLayout } from '@/composables/useLayout'

const { dark, toggleDark } = useLayout()

const isDark = computed({
  get: () => dark.value,
  set: (val) => toggleDark(val)
})

const handleDarkModeChange = (value: boolean) => {
  console.log('暗黑模式:', value ? '已启用' : '已禁用')
}
</script>
```

### 主题色配置

```vue
<template>
  <div class="theme-color-picker">
    <span class="label">主题色</span>
    <div class="color-options">
      <div
        v-for="color in themeColors"
        :key="color"
        :class="['color-item', { active: theme === color }]"
        :style="{ backgroundColor: color }"
        @click="handleThemeChange(color)">
        <el-icon v-if="theme === color"><Check /></el-icon>
      </div>
    </div>

    <!-- 自定义颜色 -->
    <el-color-picker
      v-model="customColor"
      :predefine="themeColors"
      @change="handleCustomColorChange">
    </el-color-picker>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useLayout } from '@/composables/useLayout'

const { theme } = useLayout()

const themeColors = [
  '#409EFF', // 默认蓝
  '#304156', // 深灰
  '#11a983', // 绿色
  '#13c2c2', // 青色
  '#6959CD', // 紫色
  '#f5222d', // 红色
]

const customColor = ref('')

const handleThemeChange = (color: string) => {
  theme.value = color
}

const handleCustomColorChange = (color: string | null) => {
  if (color) {
    theme.value = color
  }
}
</script>
```

### 侧边栏主题

```vue
<template>
  <div class="sidebar-theme-selector">
    <div
      v-for="item in sideThemeOptions"
      :key="item.value"
      :class="['theme-option', { active: sideTheme === item.value }]"
      @click="handleSideThemeChange(item.value)">
      <div class="preview" :style="item.style">
        <div class="sidebar-preview"></div>
        <div class="content-preview"></div>
      </div>
      <span class="label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const { sideTheme } = useLayout()

const sideThemeOptions = [
  {
    value: 'theme-dark',
    label: '暗色侧边栏',
    style: { '--sidebar-bg': '#304156', '--content-bg': '#fff' }
  },
  {
    value: 'theme-light',
    label: '亮色侧边栏',
    style: { '--sidebar-bg': '#fff', '--content-bg': '#f0f2f5' }
  }
]

const handleSideThemeChange = (value: string) => {
  sideTheme.value = value
}
</script>
```

## 多语言支持

### 语言切换

```vue
<template>
  <el-dropdown @command="handleLanguageChange">
    <span class="language-switcher">
      <el-icon><Translate /></el-icon>
      {{ currentLanguageLabel }}
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="lang in languages"
          :key="lang.value"
          :command="lang.value"
          :disabled="language === lang.value">
          {{ lang.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Translate } from '@element-plus/icons-vue'
import { useLayout } from '@/composables/useLayout'
import { LanguageCode } from '@/systemConfig'

const { language, changeLanguage, locale } = useLayout()

const languages = [
  { value: LanguageCode.zh_CN, label: '简体中文' },
  { value: LanguageCode.en_US, label: 'English' }
]

const currentLanguageLabel = computed(() => {
  const lang = languages.find(l => l.value === language.value)
  return lang?.label || '简体中文'
})

const handleLanguageChange = (lang: LanguageCode) => {
  changeLanguage(lang)
}
</script>
```

### Element Plus 本地化

```vue
<template>
  <el-config-provider :locale="locale" :size="size">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const { locale, size } = useLayout()
</script>
```

## 配置持久化

### 自动保存配置

配置变化时自动保存到 localStorage：

```typescript
const CACHE_KEY = 'layout-config'

// 从本地缓存加载配置
const cachedConfig = localCache.getJSON<LayoutSetting>(CACHE_KEY) || { ...DEFAULT_CONFIG }

// 监听配置变化并持久化
watch(
  () => state.config,
  (newConfig) => {
    localCache.setJSON(CACHE_KEY, newConfig)
    // 同步更新侧边栏状态
    state.sidebar.opened = newConfig.sidebarStatus ? !!+newConfig.sidebarStatus : true
  },
  { deep: true }
)
```

### 保存和重置配置

```vue
<template>
  <div class="settings-panel">
    <!-- 配置项 -->
    <el-form label-width="100px">
      <el-form-item label="固定头部">
        <el-switch v-model="fixedHeader" />
      </el-form-item>

      <el-form-item label="显示标签">
        <el-switch v-model="tagsView" />
      </el-form-item>

      <el-form-item label="侧边栏Logo">
        <el-switch v-model="sidebarLogo" />
      </el-form-item>

      <el-form-item label="动态标题">
        <el-switch v-model="dynamicTitle" />
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="settings-actions">
      <el-button @click="handleSaveSettings">保存配置</el-button>
      <el-button @click="handleResetSettings">重置配置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useLayout } from '@/composables/useLayout'

const {
  fixedHeader,
  tagsView,
  sidebarLogo,
  dynamicTitle,
  saveSettings,
  resetConfig
} = useLayout()

// 保存当前配置（配置会自动持久化，这里可以做额外处理）
const handleSaveSettings = () => {
  // 配置已自动保存，这里可以触发额外操作
  ElMessage.success('配置已保存')
}

// 重置为默认配置
const handleResetSettings = () => {
  resetConfig()
  ElMessage.success('配置已重置')
}
</script>
```

## 文档标题管理

### 动态标题

```vue
<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const route = useRoute()
const { setTitle, resetTitle, dynamicTitle } = useLayout()

// 监听路由变化，更新页面标题
watch(
  () => route.meta?.title,
  (newTitle) => {
    if (newTitle) {
      setTitle(newTitle as string)
    }
  },
  { immediate: true }
)

// 组件卸载时重置标题（可选）
onUnmounted(() => {
  resetTitle()
})
</script>
```

### 标题格式

动态标题的显示格式由 `dynamicTitle` 配置控制：

```typescript
// 更新浏览器标签页标题
const updateDocumentTitle = (): void => {
  document.title = dynamicTitle.value
    ? `${state.title} - ${appTitle}`
    : SystemConfig.ui.title
}

// 示例输出
// dynamicTitle = true: "用户管理 - RuoYi-Plus"
// dynamicTitle = false: "RuoYi-Plus管理系统"
```

## API 参考

### 状态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `state` | `DeepReadonly<LayoutState>` | 只读的完整状态对象 |
| `device` | `ComputedRef<DeviceType>` | 当前设备类型 |
| `sidebar` | `ComputedRef<SidebarState>` | 侧边栏状态 |
| `title` | `ComputedRef<string>` | 当前页面标题 |
| `showSettings` | `ComputedRef<boolean>` | 是否显示设置面板 |
| `animationEnable` | `ComputedRef<boolean>` | 是否启用动画效果 |

### 用户偏好配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `language` | `WritableComputedRef<LanguageCode>` | 界面语言设置 |
| `locale` | `ComputedRef<LocaleType>` | Element Plus 本地化配置 |
| `size` | `WritableComputedRef<ElSize>` | 组件尺寸设置 |

### 主题外观配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `theme` | `WritableComputedRef<string>` | 主题色配置 |
| `sideTheme` | `WritableComputedRef<string>` | 侧边栏主题配置 |
| `dark` | `WritableComputedRef<boolean>` | 暗黑模式配置 |

### 布局功能配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `topNav` | `WritableComputedRef<boolean>` | 顶部导航栏显示配置 |
| `menuLayout` | `WritableComputedRef<MenuLayoutMode>` | 菜单布局模式配置 |
| `tagsView` | `WritableComputedRef<boolean>` | 标签视图显示配置 |
| `fixedHeader` | `WritableComputedRef<boolean>` | 固定头部配置 |
| `sidebarLogo` | `WritableComputedRef<boolean>` | 侧边栏Logo显示配置 |
| `dynamicTitle` | `WritableComputedRef<boolean>` | 动态标题配置 |

### 水印配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `watermark` | `WritableComputedRef<boolean>` | 是否显示水印 |
| `watermarkContent` | `WritableComputedRef<string>` | 水印内容 |

### 标签视图状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `visitedViews` | `ComputedRef<RouteLocationNormalized[]>` | 已访问的视图列表 |
| `cachedViews` | `ComputedRef<string[]>` | 缓存的视图名称列表 |
| `iframeViews` | `ComputedRef<RouteLocationNormalized[]>` | iframe 视图列表 |

### 侧边栏操作方法

| 方法 | 类型 | 说明 |
|------|------|------|
| `toggleSideBar` | `(withoutAnimation?: boolean) => void` | 切换侧边栏开关状态 |
| `openSideBar` | `(withoutAnimation?: boolean) => void` | 打开侧边栏 |
| `closeSideBar` | `(withoutAnimation?: boolean) => void` | 关闭侧边栏 |
| `toggleSideBarHide` | `(status: boolean) => void` | 设置侧边栏隐藏状态 |

### 设备和偏好设置方法

| 方法 | 类型 | 说明 |
|------|------|------|
| `toggleDevice` | `(device: DeviceType) => void` | 切换设备类型 |
| `setSize` | `(size: ElSize) => void` | 设置组件尺寸 |
| `changeLanguage` | `(lang: LanguageCode) => void` | 切换界面语言 |
| `toggleDark` | `(value: boolean) => void` | 切换暗黑模式 |
| `setTitle` | `(value: string) => void` | 设置页面标题 |
| `resetTitle` | `() => void` | 重置页面标题 |
| `saveSettings` | `(config?: Partial<LayoutSetting>) => void` | 保存布局设置 |
| `resetConfig` | `() => void` | 重置所有配置 |

### 标签视图操作方法

| 方法 | 类型 | 说明 |
|------|------|------|
| `addView` | `(view: RouteLocationNormalized) => void` | 添加视图到已访问和缓存列表 |
| `addVisitedView` | `(view: RouteLocationNormalized) => void` | 添加视图到已访问列表 |
| `addCachedView` | `(view: RouteLocationNormalized) => void` | 添加视图到缓存列表 |
| `addIframeView` | `(view: RouteLocationNormalized) => void` | 添加 iframe 视图 |
| `delView` | `(view: RouteLocationNormalized) => Promise<ViewsResult>` | 删除指定视图 |
| `delVisitedView` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除已访问视图 |
| `delCachedView` | `(view?: RouteLocationNormalized) => Promise<string[]>` | 删除缓存视图 |
| `delIframeView` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除 iframe 视图 |
| `delOthersViews` | `(view: RouteLocationNormalized) => Promise<ViewsResult>` | 删除其他视图 |
| `delAllViews` | `() => Promise<ViewsResult>` | 删除所有视图 |
| `delRightTags` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除右侧标签 |
| `delLeftTags` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除左侧标签 |
| `updateVisitedView` | `(view: RouteLocationNormalized) => void` | 更新已访问视图信息 |
| `getVisitedViews` | `() => RouteLocationNormalized[]` | 获取已访问视图列表副本 |
| `getCachedViews` | `() => string[]` | 获取缓存视图列表副本 |
| `getIframeViews` | `() => RouteLocationNormalized[]` | 获取 iframe 视图列表副本 |

## 最佳实践

### 1. 响应式布局设计

优先使用设备检测而非固定断点：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const { device, sidebar } = useLayout()

// ✅ 推荐：基于设备类型计算样式
const containerClass = computed(() => ({
  'is-mobile': device.value === 'mobile',
  'is-tablet': device.value === 'tablet',
  'is-desktop': device.value === 'pc',
  'sidebar-collapsed': !sidebar.value.opened
}))

// ❌ 不推荐：硬编码断点
// const isMobile = window.innerWidth < 768
</script>
```

### 2. 标签视图优化

合理使用缓存，避免内存泄漏：

```vue
<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const route = useRoute()
const { addView, delCachedView } = useLayout()

// 添加当前视图
watch(
  () => route.path,
  () => {
    if (route.name) {
      addView(route)
    }
  },
  { immediate: true }
)

// ✅ 推荐：组件卸载时清理缓存（仅在必要时）
onBeforeUnmount(() => {
  // 只有当组件不需要被缓存时才清理
  if (route.meta?.noCache) {
    delCachedView(route)
  }
})
</script>
```

### 3. 配置变更的副作用处理

监听配置变化并执行必要的副作用：

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useLayout } from '@/composables/useLayout'

const { dark, theme, language } = useLayout()

// ✅ 推荐：集中处理主题变化的副作用
watch(dark, (isDark) => {
  // 更新 meta 主题色
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', isDark ? '#1f1f1f' : '#ffffff')
  }
})

// ✅ 推荐：语言变化时更新文档属性
watch(language, (lang) => {
  document.documentElement.lang = lang === 'zh_CN' ? 'zh-CN' : 'en'
})
</script>
```

### 4. 侧边栏状态管理

根据场景选择合适的侧边栏控制方式：

```vue
<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const {
  toggleSideBar,
  openSideBar,
  closeSideBar,
  toggleSideBarHide
} = useLayout()

// ✅ 推荐：用户交互使用 toggle
const handleMenuClick = () => {
  toggleSideBar()
}

// ✅ 推荐：响应式切换禁用动画
const handleResponsiveChange = () => {
  closeSideBar(true) // withoutAnimation = true
}

// ✅ 推荐：特殊页面隐藏侧边栏
const enterFullscreenMode = () => {
  toggleSideBarHide(true)
}
</script>
```

### 5. 性能优化

避免不必要的重渲染：

```vue
<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useLayout } from '@/composables/useLayout'

const { visitedViews, cachedViews } = useLayout()

// ✅ 推荐：使用计算属性派生数据
const activeTabs = computed(() =>
  visitedViews.value.filter(v => !v.meta?.hidden)
)

// ✅ 推荐：缓存视图名称使用 shallowRef
const cachedNames = computed(() => new Set(cachedViews.value))

// ❌ 不推荐：在模板中直接调用方法
// <div v-for="view in getVisitedViews()" />
</script>
```

## 常见问题

### 1. 侧边栏状态不同步

**问题描述：** 在多个组件中使用 `useLayout`，侧边栏状态不一致。

**原因分析：** 可能在组件内部创建了局部状态，而非使用全局单例。

**解决方案：**

```vue
<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

// ✅ 正确：直接使用 useLayout 返回的状态
const { sidebar, toggleSideBar } = useLayout()

// ❌ 错误：创建局部状态
// const localSidebar = ref({ opened: true })
</script>
```

### 2. 标签页缓存失效

**问题描述：** 页面切换后，之前的页面状态丢失。

**原因分析：** 组件名称与路由 `name` 不匹配，或未正确配置 `keep-alive`。

**解决方案：**

```vue
<!-- 正确配置 keep-alive -->
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews">
      <component :is="Component" :key="$route.path" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const { cachedViews } = useLayout()
</script>
```

确保组件定义了正确的 `name`：

```vue
<script lang="ts">
export default {
  name: 'UserList' // 必须与路由的 name 一致
}
</script>

<script setup lang="ts">
// 组件逻辑
</script>
```

### 3. 响应式布局不生效

**问题描述：** 窗口大小改变后，布局没有自动调整。

**原因分析：** 可能在 SSR 环境中，或 `useWindowSize` 未正确初始化。

**解决方案：**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useLayout } from '@/composables/useLayout'

const { device, toggleDevice, closeSideBar, openSideBar } = useLayout()

// 手动触发响应式检测
onMounted(() => {
  const width = window.innerWidth
  const BREAKPOINT = 992

  if (width < BREAKPOINT) {
    toggleDevice('mobile')
    closeSideBar(true)
  } else {
    toggleDevice('pc')
    openSideBar(true)
  }
})
</script>
```

### 4. 配置持久化失败

**问题描述：** 刷新页面后，配置恢复为默认值。

**原因分析：** localStorage 被禁用，或存储容量已满。

**解决方案：**

```typescript
// 检查 localStorage 是否可用
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

// 在 useLayout 中添加降级处理
if (!isLocalStorageAvailable()) {
  console.warn('localStorage 不可用，配置将不会被持久化')
}
```

### 5. 暗黑模式闪烁

**问题描述：** 页面加载时，先显示亮色主题，然后切换到暗黑主题，造成闪烁。

**原因分析：** 暗黑模式状态在 JavaScript 执行后才应用。

**解决方案：**

在 `index.html` 中添加内联脚本，提前检测并应用主题：

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // 提前检测暗黑模式偏好
    (function() {
      const config = localStorage.getItem('layout-config')
      if (config) {
        try {
          const { dark } = JSON.parse(config)
          if (dark) {
            document.documentElement.classList.add('dark')
          }
        } catch (e) {}
      }
    })()
  </script>
</head>
<body>
  <!-- 应用内容 -->
</body>
</html>
```

### 6. 动态标题不更新

**问题描述：** 页面切换后，浏览器标题没有更新。

**原因分析：** 路由 `meta.title` 未配置，或 `dynamicTitle` 被禁用。

**解决方案：**

```typescript
// 确保路由配置了 title
const routes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/user/index.vue'),
    meta: {
      title: '用户管理' // 必须配置
    }
  }
]
```

```vue
<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const { dynamicTitle, setTitle } = useLayout()

// 确保启用了动态标题
if (!dynamicTitle.value) {
  dynamicTitle.value = true
}

// 手动设置标题
setTitle('自定义标题')
</script>
```
