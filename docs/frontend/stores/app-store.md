# 应用布局状态管理 useLayout

## 介绍

应用布局状态管理(`useLayout`)是基于 Vue 3 Composition API 的统一布局状态管理系统，提供了完整的布局、主题、侧边栏、标签视图等功能的状态管理和操作方法。

**核心特性:**

- **统一状态管理** - 使用单一配置对象管理所有布局相关状态
- **响应式设计** - 自动适配不同设备尺寸(PC/Tablet/Mobile)
- **主题系统** - 支持亮色/暗色主题切换，主题色自定义
- **多语言支持** - 集成 Element Plus 国际化
- **标签视图管理** - 完整的多标签页管理功能
- **持久化存储** - 自动保存用户配置到 localStorage
- **单例模式** - 确保全局状态的唯一性

## 状态定义

### 布局状态接口

```typescript
/** 布局状态接口 */
interface LayoutState {
  /** 当前设备类型 */
  device: DeviceType
  /** 侧边栏状态配置 */
  sidebar: SidebarState
  /** 当前页面标题 */
  title: string
  /** 是否显示设置面板 */
  showSettings: boolean
  /** 是否启用页面切换动画 */
  animationEnable: boolean
  /** 标签视图状态 */
  tagsView: TagsViewState
  /** 布局配置 */
  config: LayoutSetting
}

/** 设备类型 */
type DeviceType = 'pc' | 'mobile' | 'tablet'

/** 侧边栏状态接口 */
interface SidebarState {
  /** 是否打开侧边栏 */
  opened: boolean
  /** 是否禁用切换动画 */
  withoutAnimation: boolean
  /** 是否完全隐藏侧边栏 */
  hide: boolean
}

/** 标签视图状态接口 */
interface TagsViewState {
  /** 已访问的视图列表 */
  visitedViews: RouteLocationNormalized[]
  /** 缓存的视图名称列表 */
  cachedViews: string[]
  /** iframe 视图列表 */
  iframeViews: RouteLocationNormalized[]
}
```

### 布局配置接口

```typescript
/** 布局配置接口 */
interface LayoutSetting {
  // 标题配置
  title: string                    // 系统标题
  dynamicTitle: boolean            // 是否启用动态标题

  // 布局相关配置
  topNav: boolean                  // 是否显示顶部导航
  menuLayout: MenuLayoutMode       // 菜单布局模式
  tagsView: boolean                // 是否显示标签视图
  fixedHeader: boolean             // 是否固定头部
  sidebarLogo: boolean             // 是否显示侧边栏Logo
  layout: string                   // 布局类型

  // 外观主题配置
  theme: string                    // 主题色
  sideTheme: string                // 侧边栏主题
  dark: boolean                    // 暗黑模式

  // 功能配置
  showSettings: boolean            // 是否显示设置面板
  animationEnable: boolean         // 是否启用动画

  // 用户偏好配置
  sidebarStatus: string            // 侧边栏状态 '1'打开 '0'关闭
  size: ElSize                     // 组件尺寸
  language: LanguageCode           // 界面语言

  // 其他配置
  showSelectValue: boolean         // 选择器是否显示值
  watermark: boolean               // 是否显示水印
  watermarkContent: string         // 水印内容
}
```

## 核心方法

### 侧边栏管理

```typescript
/** 切换侧边栏开关状态 */
const toggleSideBar = (withoutAnimation = false): void

/** 打开侧边栏 */
const openSideBar = (withoutAnimation = false): void

/** 关闭侧边栏 */
const closeSideBar = (withoutAnimation = false): void

/** 设置侧边栏隐藏状态（用于特殊页面完全隐藏侧边栏） */
const toggleSideBarHide = (status: boolean): void
```

**技术实现:**

```typescript
const toggleSideBar = (withoutAnimation = false): void => {
  if (state.sidebar.hide) return

  const newStatus = state.config.sidebarStatus === SIDEBAR_OPEN ? SIDEBAR_CLOSED : SIDEBAR_OPEN
  updateSidebarStatus(newStatus, withoutAnimation)
}

const updateSidebarStatus = (status: string, withoutAnimation = false) => {
  state.config.sidebarStatus = status
  state.sidebar.withoutAnimation = withoutAnimation
  state.sidebar.opened = status === SIDEBAR_OPEN
}
```

### 设备和用户偏好设置

```typescript
/** 切换设备类型 */
const toggleDevice = (device: DeviceType): void

/** 设置组件尺寸 */
const setSize = (newSize: ElSize): void

/** 切换界面语言 */
const changeLanguage = (lang: LanguageCode): void

/** 切换暗黑模式 */
const toggleDark = (value: boolean): void
```

### 页面标题管理

```typescript
/** 设置当前页面标题 */
const setTitle = (value: string): void

/** 重置页面标题为系统默认标题 */
const resetTitle = (): void
```

**技术实现:**

```typescript
const setTitle = (value: string): void => {
  if (!value) return
  state.title = value
  updateDocumentTitle()
}

const updateDocumentTitle = (): void => {
  document.title = dynamicTitle.value ? `${state.title} - ${appTitle}` : SystemConfig.ui.title
}
```

### 配置管理

```typescript
/** 保存布局设置 */
const saveSettings = (newConfig?: Partial<LayoutSetting>): void

/** 重置所有配置为系统默认值 */
const resetConfig = (): void
```

## 标签视图管理

### 添加视图

```typescript
/** 添加视图到已访问和缓存列表 */
addView(view: RouteLocationNormalized): void

/** 添加视图到已访问列表 */
addVisitedView(view: RouteLocationNormalized): void

/** 添加视图到缓存列表（只缓存有名称且未设置 noCache 的视图） */
addCachedView(view: RouteLocationNormalized): void

/** 添加 iframe 视图 */
addIframeView(view: RouteLocationNormalized): void
```

### 删除视图

```typescript
/** 删除指定视图 */
async delView(view: RouteLocationNormalized): Promise<{
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}>

/** 删除除指定视图外的其他所有视图 */
async delOthersViews(view: RouteLocationNormalized): Promise<{
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}>

/** 删除所有视图（保留固定的视图） */
async delAllViews(): Promise<{
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}>

/** 删除指定视图右侧的所有标签 */
async delRightTags(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>

/** 删除指定视图左侧的所有标签 */
async delLeftTags(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
```

### 查询和更新视图

```typescript
/** 更新已访问视图的信息 */
updateVisitedView(view: RouteLocationNormalized): void

/** 获取已访问视图列表的副本 */
getVisitedViews(): RouteLocationNormalized[]

/** 获取缓存视图名称列表的副本 */
getCachedViews(): string[]

/** 判断是否为动态路由 */
isDynamicRoute(view: RouteLocationNormalized): boolean
```

## 基本用法

### 基础使用

```vue
<template>
  <div class="layout-container">
    <div>
      <p>设备类型: {{ layout.device.value }}</p>
      <p>侧边栏状态: {{ layout.sidebar.value.opened ? '打开' : '关闭' }}</p>
      <p>当前主题: {{ layout.theme.value }}</p>
    </div>

    <el-button @click="layout.toggleSideBar()">切换侧边栏</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()
</script>
```

### 侧边栏控制

```vue
<template>
  <div class="sidebar-controls">
    <el-button @click="layout.toggleSideBar()">切换</el-button>
    <el-button @click="layout.openSideBar(false)">打开</el-button>
    <el-button @click="layout.closeSideBar(true)">关闭(无动画)</el-button>
    <el-button @click="layout.toggleSideBarHide(true)">隐藏</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()
</script>
```

### 响应式布局

```vue
<script lang="ts" setup>
import { useLayout } from '@/composables/useLayout'
import { useWindowSize } from '@vueuse/core'
import { watchEffect } from 'vue'

const layout = useLayout()
const { width } = useWindowSize()

watchEffect(() => {
  const isMobile = width.value < 768
  const isTablet = width.value >= 768 && width.value < 992

  if (isMobile) {
    layout.toggleDevice('mobile')
    layout.closeSideBar()
  } else if (isTablet) {
    layout.toggleDevice('tablet')
    layout.closeSideBar()
  } else {
    layout.toggleDevice('pc')
    layout.openSideBar()
  }
})
</script>
```

### 主题切换

```vue
<template>
  <div class="theme-controls">
    <el-switch
      v-model="darkMode"
      @change="handleDarkChange"
      active-text="暗黑模式"
    />

    <el-color-picker v-model="themeColor" @change="handleThemeChange" />

    <el-radio-group v-model="sidebarTheme" @change="handleSideThemeChange">
      <el-radio-button value="theme-dark">暗色</el-radio-button>
      <el-radio-button value="theme-light">亮色</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

const darkMode = ref(layout.dark.value)
const handleDarkChange = (value: boolean) => layout.toggleDark(value)

const themeColor = ref(layout.theme.value)
const handleThemeChange = (value: string) => {
  layout.theme.value = value
  document.documentElement.style.setProperty('--el-color-primary', value)
}

const sidebarTheme = ref(layout.sideTheme.value)
const handleSideThemeChange = (value: string) => {
  layout.sideTheme.value = value
}
</script>
```

### 多语言切换

```vue
<template>
  <el-dropdown @command="handleLanguageChange">
    <el-button>{{ currentLanguageLabel }}</el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh_CN">简体中文</el-dropdown-item>
        <el-dropdown-item command="en_US">English</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <el-config-provider :locale="layout.locale.value">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

const currentLanguageLabel = computed(() => {
  return layout.language.value === 'zh_CN' ? '简体中文' : 'English'
})

const handleLanguageChange = (lang: LanguageCode) => {
  layout.changeLanguage(lang)
}
</script>
```

### 标签视图管理

```vue
<template>
  <div class="tags-view">
    <el-tag
      v-for="tag in layout.visitedViews.value"
      :key="tag.path"
      :closable="!tag.meta?.affix"
      @close="handleCloseTag(tag)"
      @click="router.push(tag.fullPath)"
    >
      {{ tag.meta?.title }}
    </el-tag>

    <router-view v-slot="{ Component }">
      <keep-alive :include="layout.cachedViews.value">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const router = useRouter()
const layout = useLayout()

const handleCloseTag = async (tag: RouteLocationNormalized) => {
  const { visitedViews } = await layout.delView(tag)
  const latestView = visitedViews[visitedViews.length - 1]
  router.push(latestView?.fullPath || '/')
}
</script>
```

**路由守卫集成:**

```typescript
// src/router/guard.ts
router.afterEach((to) => {
  const layout = useLayout()
  layout.addView(to)
  if (to.meta.title) {
    layout.setTitle(to.meta.title as string)
  }
})
```

## 持久化机制

### 自动同步

```typescript
watch(
  () => state.config,
  (newConfig) => {
    localCache.setJSON(CACHE_KEY, newConfig)
    state.sidebar.opened = newConfig.sidebarStatus ? !!+newConfig.sidebarStatus : true
  },
  { deep: true }
)
```

### 初始化加载

```typescript
const cachedConfig = localCache.getJSON<LayoutSetting>(CACHE_KEY) || { ...DEFAULT_CONFIG }

const state = reactive<LayoutState>({
  device: 'pc',
  sidebar: createSidebarState(cachedConfig.sidebarStatus),
  title: SystemConfig.ui.title,
  showSettings: SystemConfig.ui.showSettings,
  animationEnable: SystemConfig.ui.animationEnable,
  tagsView: createTagsViewState(),
  config: { ...cachedConfig }
})
```

## 响应式设计

### 断点规则

| 设备 | 宽度范围 | 行为 |
|------|----------|------|
| 移动设备 | `< 768px` | 自动关闭侧边栏，移动端布局 |
| 平板设备 | `768px ~ 992px` | 显示收缩侧边栏，平板布局 |
| 桌面设备 | `≥ 992px` | 完全展开侧边栏，桌面布局 |

### 自动响应

```typescript
const { width } = useWindowSize()
const BREAKPOINT = 992

watch(width, () => {
  const isMobile = width.value - 1 < BREAKPOINT

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

## 暗黑模式实现

### VueUse 集成

```typescript
const isDark = useDark({
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
})

isDark.value = state.config.dark

watch(dark, (newValue) => isDark.value = newValue)
watch(isDark, (newValue) => dark.value = newValue)
```

### CSS 变量支持

```scss
:root {
  --bg-color: #ffffff;
  --text-color: #303133;
}

html.dark {
  --bg-color: #1a1a1a;
  --text-color: #e5eaf3;
}

.layout-container {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}
```

## 单例模式实现

```typescript
let layoutStateInstance: ReturnType<typeof createLayoutState> | null = null

function createLayoutState() {
  // 创建状态和方法
  return { ... }
}

export const useLayout = () => {
  if (!layoutStateInstance) {
    layoutStateInstance = createLayoutState()
  }
  return layoutStateInstance
}
```

**与 Pinia 对比:**

| 特性 | Pinia Store | useLayout Composable |
|------|-------------|---------------------|
| 状态管理 | 是 | 是 |
| 类型安全 | 是 | 是 |
| DevTools | 是 | 否 |
| 持久化 | 需要插件 | 内置 |
| 体积 | 较大 | 较小 |

## API 文档

### 只读状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `state` | `Readonly<LayoutState>` | 只读的完整状态对象 |
| `device` | `ComputedRef<DeviceType>` | 当前设备类型 |
| `sidebar` | `ComputedRef<SidebarState>` | 侧边栏状态 |
| `title` | `ComputedRef<string>` | 当前页面标题 |
| `visitedViews` | `ComputedRef<RouteLocationNormalized[]>` | 已访问的视图列表 |
| `cachedViews` | `ComputedRef<string[]>` | 缓存的视图名称列表 |

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
| `topNav` | `WritableComputedRef<boolean>` | 顶部导航栏显示 |
| `menuLayout` | `WritableComputedRef<MenuLayoutMode>` | 菜单布局模式 |
| `tagsView` | `WritableComputedRef<boolean>` | 标签视图显示 |
| `fixedHeader` | `WritableComputedRef<boolean>` | 固定头部 |
| `sidebarLogo` | `WritableComputedRef<boolean>` | 侧边栏Logo显示 |
| `dynamicTitle` | `WritableComputedRef<boolean>` | 动态标题 |
| `watermark` | `WritableComputedRef<boolean>` | 是否显示水印 |

### 侧边栏操作方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `toggleSideBar` | `withoutAnimation?: boolean` | 切换侧边栏 |
| `openSideBar` | `withoutAnimation?: boolean` | 打开侧边栏 |
| `closeSideBar` | `withoutAnimation?: boolean` | 关闭侧边栏 |
| `toggleSideBarHide` | `status: boolean` | 设置隐藏状态 |

### 设备和偏好设置方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `toggleDevice` | `device: DeviceType` | 切换设备类型 |
| `setSize` | `newSize: ElSize` | 设置组件尺寸 |
| `changeLanguage` | `lang: LanguageCode` | 切换语言 |
| `toggleDark` | `value: boolean` | 切换暗黑模式 |
| `setTitle` | `value: string` | 设置页面标题 |
| `resetTitle` | - | 重置页面标题 |
| `saveSettings` | `newConfig?: Partial<LayoutSetting>` | 保存设置 |
| `resetConfig` | - | 重置配置 |

### 标签视图操作方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `addView` | `view` | 添加视图 |
| `addVisitedView` | `view` | 添加已访问视图 |
| `addCachedView` | `view` | 添加缓存视图 |
| `delView` | `view` | 删除视图 |
| `delOthersViews` | `view` | 删除其他视图 |
| `delAllViews` | - | 删除所有视图 |
| `delRightTags` | `view` | 删除右侧标签 |
| `delLeftTags` | `view` | 删除左侧标签 |
| `updateVisitedView` | `view` | 更新视图 |
| `isDynamicRoute` | `view` | 判断动态路由 |

## 最佳实践

### 1. 初始化时机

```typescript
// App.vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { useWindowSize } from '@vueuse/core'

const layout = useLayout()
const { width } = useWindowSize()

onMounted(() => {
  const isMobile = width.value < 992
  layout.toggleDevice(isMobile ? 'mobile' : 'pc')
})
</script>
```

### 2. 防抖处理

```typescript
import { useDebounceFn } from '@vueuse/core'

const handleResize = useDebounceFn(() => {
  const isMobile = width.value < 992
  layout.toggleDevice(isMobile ? 'mobile' : 'pc')
}, 300)

watch(width, handleResize)
```

### 3. 动画性能优化

```typescript
// 移动端禁用复杂动画
if (layout.device.value === 'mobile') {
  layout.toggleSideBar(true) // 无动画切换
  layout.state.animationEnable = false
}

// 页面加载完成后启用动画
onMounted(() => {
  setTimeout(() => {
    layout.state.animationEnable = true
  }, 100)
})
```

### 4. 标签视图性能优化

```typescript
// 限制标签数量
const MAX_TAGS = 20

watch(
  () => layout.visitedViews.value.length,
  (length) => {
    if (length > MAX_TAGS) {
      const views = layout.visitedViews.value
      const oldestView = views.find(v => !v.meta?.affix)
      if (oldestView) {
        layout.delView(oldestView)
      }
    }
  }
)
```

### 5. 缓存策略

```typescript
// 不缓存表单页面
const routes = [
  {
    path: '/form/edit',
    component: FormEdit,
    meta: {
      title: '编辑表单',
      noCache: true // 禁用缓存
    }
  }
]

// 动态路由不删除缓存
if (layout.isDynamicRoute(route)) {
  await layout.delVisitedView(route)
} else {
  await layout.delView(route)
}
```

## 常见问题

### 1. 侧边栏状态不同步

**问题原因:** 直接修改状态而不通过方法

**解决方案:**

```typescript
// ❌ 错误: 直接修改状态
layout.sidebar.value.opened = false

// ✅ 正确: 使用方法修改
layout.closeSideBar()

// 清理损坏的缓存
import { localCache } from '@/utils/cache'
localCache.remove('layout-config')
location.reload()
```

### 2. 标签视图缓存失效

**问题原因:** 组件未设置 `name` 属性，或与路由配置不一致

**解决方案:**

```vue
<!-- ✅ 正确: 定义 name -->
<script lang="ts">
export default {
  name: 'UserList' // 必须与路由配置中的 name 一致
}
</script>

<script lang="ts" setup>
// ...
</script>
```

```typescript
// 路由配置
{
  path: '/user/list',
  name: 'UserList', // 与组件 name 一致
  component: () => import('@/views/user/list.vue'),
  meta: { title: '用户列表' }
}

// keep-alive 配置
<router-view v-slot="{ Component }">
  <keep-alive :include="layout.cachedViews.value">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

### 3. 响应式布局不生效

**问题原因:** 没有监听窗口变化或设备类型没有更新

**解决方案:**

```typescript
// App.vue
import { useLayout } from '@/composables/useLayout'
import { useWindowSize } from '@vueuse/core'
import { watch } from 'vue'

const layout = useLayout()
const { width } = useWindowSize()

watch(width, () => {
  const isMobile = width.value < 992

  if (isMobile) {
    layout.toggleDevice('mobile')
    layout.closeSideBar()
  } else {
    layout.toggleDevice('pc')
    layout.openSideBar()
  }
}, { immediate: true })
```

### 4. 配置持久化失败

**问题原因:** localStorage 存储满或浏览器隐私模式禁用存储

**解决方案:**

```typescript
import { localCache } from '@/utils/cache'

// 检查存储是否可用
try {
  localCache.setJSON('test', { value: 'test' })
  localCache.remove('test')
} catch (error) {
  console.error('localStorage 不可用:', error)
  ElMessage.warning('浏览器存储不可用,设置将无法保存')
}

// 清理旧配置
const oldConfig = localCache.getJSON('layout-config')
if (oldConfig && typeof oldConfig !== 'object') {
  localCache.remove('layout-config')
}
```

## 与其他模块协作

### 与 Permission Store

```typescript
import { useLayout } from '@/composables/useLayout'
import { usePermissionStore } from '@/stores/modules/permission'

const layout = useLayout()
const permissionStore = usePermissionStore()

// 动态路由生成完成后,添加固定标签
watch(
  () => permissionStore.routes,
  (routes) => {
    routes.forEach(route => {
      if (route.meta?.affix) {
        layout.addVisitedView(route)
      }
    })
  }
)
```

### 与 User Store

```typescript
import { useLayout } from '@/composables/useLayout'
import { useUserStore } from '@/stores/modules/user'

const layout = useLayout()
const userStore = useUserStore()

// 用户退出后,重置布局
watch(
  () => userStore.token,
  (token) => {
    if (!token) {
      layout.delAllViews()
      layout.resetTitle()
    }
  }
)
```

### 与布局组件

```vue
<template>
  <div
    :class="[
      'app-wrapper',
      {
        'hide-sidebar': !layout.sidebar.value.opened,
        'open-sidebar': layout.sidebar.value.opened,
        mobile: layout.device.value === 'mobile'
      }
    ]"
  >
    <sidebar v-if="!layout.sidebar.value.hide" />
    <div class="main-container">
      <navbar />
      <tags-view v-if="layout.tagsView.value" />
      <app-main />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()
</script>
```

### 5. 暗黑模式切换闪烁

**问题描述:** 页面刷新时暗黑模式会出现短暂的亮色闪烁

**问题原因:**

- CSS 加载早于 JavaScript 执行
- 暗黑模式类名在 JS 初始化后才添加

**解决方案:**

```typescript
// index.html 中添加内联脚本，在 head 中优先执行
<script>
  (function() {
    try {
      const config = localStorage.getItem('layout-config')
      if (config) {
        const parsed = JSON.parse(config)
        if (parsed.dark) {
          document.documentElement.classList.add('dark')
        }
      }
    } catch (e) {}
  })()
</script>

// 或者使用 CSS 媒体查询作为默认值
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --bg-color: #1a1a1a;
    --text-color: #e5eaf3;
  }
}
```

### 6. 多标签页数据不同步

**问题描述:** 同一用户在多个浏览器标签页操作时，布局配置不同步

**问题原因:**

- localStorage 的 storage 事件监听未实现
- 各标签页状态独立管理

**解决方案:**

```typescript
// 监听 storage 事件实现跨标签页同步
import { onMounted, onUnmounted } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { localCache } from '@/utils/cache'

const layout = useLayout()

const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'layout-config' && event.newValue) {
    try {
      const newConfig = JSON.parse(event.newValue)
      // 同步主题配置
      if (newConfig.dark !== layout.dark.value) {
        layout.toggleDark(newConfig.dark)
      }
      // 同步语言配置
      if (newConfig.language !== layout.language.value) {
        layout.changeLanguage(newConfig.language)
      }
    } catch (e) {
      console.error('配置同步失败:', e)
    }
  }
}

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
```

### 7. 移动端侧边栏遮罩层问题

**问题描述:** 移动端打开侧边栏后，点击遮罩层无法关闭，或者遮罩层不显示

**问题原因:**

- 遮罩层事件未绑定
- z-index 层级设置不正确
- 设备类型判断逻辑错误

**解决方案:**

```vue
<template>
  <div class="app-wrapper" :class="{ mobile: isMobile }">
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && layout.sidebar.value.opened"
      class="drawer-bg"
      @click="handleCloseSidebar"
    />
    <sidebar />
    <div class="main-container">
      <app-main />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

const isMobile = computed(() => layout.device.value === 'mobile')

const handleCloseSidebar = () => {
  layout.closeSideBar(false)
}
</script>

<style lang="scss" scoped>
.drawer-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.mobile {
  .sidebar-container {
    z-index: 1001;
  }
}
</style>
```

## 总结

`useLayout` composable 核心要点:

1. **统一管理** - 所有布局相关状态集中管理，避免状态分散
2. **类型安全** - 完整的 TypeScript 类型支持
3. **自动持久化** - 配置自动保存到 localStorage
4. **响应式设计** - 自动适配不同设备
5. **灵活扩展** - 易于扩展新功能
