# 应用布局状态管理 useLayout

## 介绍

应用布局状态管理(`useLayout`)是基于 Vue 3 Composition API 的统一布局状态管理系统,提供了完整的布局、主题、侧边栏、标签视图等功能的状态管理和操作方法。与传统的 Pinia store 不同,该模块采用 Composable 模式实现,通过单例模式确保全局状态的唯一性。

**核心特性:**

- **统一状态管理** - 使用单一配置对象管理所有布局相关状态
- **响应式设计** - 自动适配不同设备尺寸(PC/Tablet/Mobile),动态调整布局
- **主题系统** - 支持亮色/暗色主题切换,主题色自定义,侧边栏主题配置
- **多语言支持** - 集成 Element Plus 国际化,支持中英文切换
- **标签视图管理** - 完整的多标签页管理功能,支持缓存和 iframe 视图
- **持久化存储** - 自动保存用户配置到 localStorage,刷新后保持状态
- **类型安全** - 完整的 TypeScript 类型支持,开发体验友好
- **单例模式** - 确保全局状态的唯一性,避免状态冲突

## 状态定义

### 布局状态接口

```typescript
/**
 * 布局状态接口
 * 定义整个应用布局的完整状态结构
 */
interface LayoutState {
  /** 当前设备类型,影响布局响应式行为 */
  device: DeviceType

  /** 侧边栏状态配置 */
  sidebar: SidebarState

  /** 当前页面标题,用于动态标题显示 */
  title: string

  /** 是否显示设置面板 */
  showSettings: boolean

  /** 是否启用页面切换动画效果 */
  animationEnable: boolean

  /** 标签视图状态,管理多标签页功能 */
  tagsView: TagsViewState

  /** 布局配置,包含所有UI相关设置 */
  config: LayoutSetting
}

/**
 * 设备类型定义
 * 用于响应式布局的设备类型识别
 */
type DeviceType = 'pc' | 'mobile' | 'tablet'

/**
 * 侧边栏状态接口
 * 侧边栏的完整状态信息
 */
interface SidebarState {
  /** 是否打开侧边栏 */
  opened: boolean

  /** 是否禁用切换动画 */
  withoutAnimation: boolean

  /** 是否完全隐藏侧边栏（用于特殊页面） */
  hide: boolean
}

/**
 * 标签视图状态接口
 * 多标签页功能的状态管理
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

### 布局配置接口

```typescript
/**
 * 布局配置接口
 * 包含所有可自定义的UI设置
 */
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

  // 选择器配置
  showSelectValue: boolean         // 选择器是否显示值

  // 水印配置
  watermark: boolean               // 是否显示水印
  watermarkContent: string         // 水印内容
}
```

## 核心方法

### 侧边栏管理

#### toggleSideBar - 切换侧边栏

```typescript
/**
 * 切换侧边栏开关状态
 * @param withoutAnimation 是否禁用切换动画,默认 false
 * @description 智能切换侧边栏状态,隐藏状态下不生效
 */
const toggleSideBar = (withoutAnimation = false): void
```

**功能说明:**
- 在打开和关闭状态之间切换
- 如果侧边栏处于隐藏状态(`hide: true`),则不生效
- 支持禁用动画效果,用于程序化控制
- 自动持久化状态到 localStorage

**技术实现:**

```typescript
// src/composables/useLayout.ts:342-347
const toggleSideBar = (withoutAnimation = false): void => {
  if (state.sidebar.hide) return

  const newStatus = state.config.sidebarStatus === SIDEBAR_OPEN ? SIDEBAR_CLOSED : SIDEBAR_OPEN
  updateSidebarStatus(newStatus, withoutAnimation)
}
```

#### openSideBar / closeSideBar - 强制控制

```typescript
/**
 * 打开侧边栏
 * @param withoutAnimation 是否禁用动画效果,默认 false
 */
const openSideBar = (withoutAnimation = false): void

/**
 * 关闭侧边栏
 * @param withoutAnimation 是否禁用动画效果,默认 false
 */
const closeSideBar = (withoutAnimation = false): void
```

**功能说明:**
- 强制打开或关闭侧边栏,不考虑当前状态
- 常用于响应式布局切换时
- 支持禁用动画效果

**技术实现:**

```typescript
// src/composables/useLayout.ts:353-363
const openSideBar = (withoutAnimation = false): void => {
  updateSidebarStatus(SIDEBAR_OPEN, withoutAnimation)
}

const closeSideBar = (withoutAnimation = false): void => {
  updateSidebarStatus(SIDEBAR_CLOSED, withoutAnimation)
}

// 通用更新方法
const updateSidebarStatus = (status: string, withoutAnimation = false) => {
  state.config.sidebarStatus = status
  state.sidebar.withoutAnimation = withoutAnimation
  state.sidebar.opened = status === SIDEBAR_OPEN
}
```

#### toggleSideBarHide - 显示/隐藏控制

```typescript
/**
 * 设置侧边栏隐藏状态（用于某些特殊页面完全隐藏侧边栏）
 * @param status true 隐藏, false 显示
 */
const toggleSideBarHide = (status: boolean): void
```

**功能说明:**
- 完全隐藏或显示侧边栏
- `true`: 完全隐藏,`toggleSideBar` 方法失效
- `false`: 显示侧边栏,恢复正常功能
- 用于某些特殊页面(如登录页、全屏预览页)

### 设备和用户偏好设置

#### toggleDevice - 设备切换

```typescript
/**
 * 切换设备类型
 * @param device 设备类型：'pc' | 'mobile' | 'tablet'
 */
const toggleDevice = (device: DeviceType): void
```

**功能说明:**
- 设置当前设备类型,用于响应式布局适配
- 通常由窗口 resize 事件触发
- 会影响布局的显示方式

#### setSize - 尺寸设置

```typescript
/**
 * 设置组件尺寸
 * @param newSize Element Plus 组件尺寸
 */
const setSize = (newSize: ElSize): void
```

**功能说明:**
- 设置全局 UI 组件尺寸
- 可选值: `'default'` | `'large'` | `'small'`
- 影响所有 Element Plus 组件的尺寸
- 自动持久化到本地存储

#### changeLanguage - 语言切换

```typescript
/**
 * 切换界面语言
 * @param lang 语言代码
 */
const changeLanguage = (lang: LanguageCode): void
```

**功能说明:**
- 切换应用语言并自动持久化
- 支持的语言: `'zh_CN'` (简体中文) | `'en_US'` (English)
- 自动更新 Element Plus 本地化配置

#### toggleDark - 暗黑模式切换

```typescript
/**
 * 切换暗黑模式
 * @param value true 启用暗黑模式, false 禁用
 */
const toggleDark = (value: boolean): void
```

**功能说明:**
- 启用或禁用暗黑模式
- 集成 VueUse 的 `useDark`
- 自动更新 CSS 变量和类名
- 状态自动持久化

### 页面标题管理

#### setTitle - 设置页面标题

```typescript
/**
 * 设置当前页面标题
 * @param value 页面标题,为空则不更新
 */
const setTitle = (value: string): void
```

**功能说明:**
- 设置当前页面标题
- 自动更新浏览器标签页标题
- 配合动态标题设置使用

**技术实现:**

```typescript
// src/composables/useLayout.ts:411-415
const setTitle = (value: string): void => {
  if (!value) return
  state.title = value
  updateDocumentTitle()
}

// 更新文档标题
const updateDocumentTitle = (): void => {
  document.title = dynamicTitle.value ? `${state.title} - ${appTitle}` : SystemConfig.ui.title
}
```

#### resetTitle - 重置页面标题

```typescript
/**
 * 重置页面标题为系统默认标题
 */
const resetTitle = (): void
```

**功能说明:**
- 重置页面标题为系统默认标题
- 通常在退出登录或返回首页时使用

### 配置管理

#### saveSettings - 保存布局设置

```typescript
/**
 * 保存布局设置
 * @param newConfig 新的布局配置,为空则重置为默认配置
 */
const saveSettings = (newConfig?: Partial<LayoutSetting>): void
```

**功能说明:**
- 保存新的布局配置
- 支持部分更新,只更新指定的配置项
- 自动持久化到 localStorage

#### resetConfig - 重置配置

```typescript
/**
 * 重置所有配置为系统默认值
 */
const resetConfig = (): void
```

**功能说明:**
- 重置所有配置为系统默认值
- 清除所有用户自定义设置
- 通常在设置面板提供"恢复默认"功能

## 标签视图管理

### 添加视图

#### addView - 添加视图

```typescript
/**
 * 添加视图到已访问和缓存列表
 * @param view 路由视图对象
 */
addView(view: RouteLocationNormalized): void
```

**功能说明:**
- 同时添加视图到已访问列表和缓存列表
- 自动提取路由标题
- 避免重复添加

#### addVisitedView - 添加已访问视图

```typescript
/**
 * 添加视图到已访问列表
 * @param view 路由视图对象
 * @description 如果视图已存在则不重复添加
 */
addVisitedView(view: RouteLocationNormalized): void
```

**功能说明:**
- 只添加到已访问列表,不影响缓存
- 如果视图已存在则不重复添加
- 自动提取 meta.title 作为标签标题

#### addCachedView - 添加缓存视图

```typescript
/**
 * 添加视图到缓存列表
 * @param view 路由视图对象
 * @description 只缓存有名称且未设置 noCache 的视图
 */
addCachedView(view: RouteLocationNormalized): void
```

**功能说明:**
- 只添加到缓存列表,不影响已访问列表
- 只缓存有 `name` 且 `meta.noCache !== true` 的视图
- 配合 `<keep-alive>` 使用

#### addIframeView - 添加 iframe 视图

```typescript
/**
 * 添加 iframe 视图
 * @param view 路由视图对象
 */
addIframeView(view: RouteLocationNormalized): void
```

**功能说明:**
- 添加 iframe 类型的视图
- 用于管理外部链接标签
- 避免重复添加

### 删除视图

#### delView - 删除指定视图

```typescript
/**
 * 删除指定视图
 * @param view 要删除的路由视图
 * @returns Promise 包含删除后的视图列表
 */
async delView(view: RouteLocationNormalized): Promise<{
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}>
```

**功能说明:**
- 同时从已访问列表和缓存列表中删除
- 对于动态路由(包含 `:id` 等参数),不删除缓存
- 返回删除后的视图列表

#### delOthersViews - 删除其他视图

```typescript
/**
 * 删除除指定视图外的其他所有视图
 * @param view 要保留的路由视图
 * @returns Promise 包含删除后的视图列表
 */
async delOthersViews(view: RouteLocationNormalized): Promise<{
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}>
```

**功能说明:**
- 保留指定视图,删除其他所有视图
- 保留固定的视图(`meta.affix=true`)
- 常用于"关闭其他"功能

#### delAllViews - 删除所有视图

```typescript
/**
 * 删除所有视图
 * @returns Promise 包含删除后的视图列表
 * @description 保留固定的已访问视图,清空所有缓存
 */
async delAllViews(): Promise<{
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}>
```

**功能说明:**
- 删除所有视图
- 保留固定的视图(`meta.affix=true`)
- 清空所有缓存
- 常用于"关闭全部"功能

#### delRightTags - 删除右侧标签

```typescript
/**
 * 删除指定视图右侧的所有标签
 * @param view 基准视图,该视图右侧的标签将被删除
 * @returns Promise 包含更新后的已访问视图列表
 */
async delRightTags(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
```

**功能说明:**
- 保留指定视图及其左侧的视图
- 删除右侧的视图和对应缓存
- 保留固定的视图

#### delLeftTags - 删除左侧标签

```typescript
/**
 * 删除指定视图左侧的所有标签
 * @param view 基准视图,该视图左侧的标签将被删除
 * @returns Promise 包含更新后的已访问视图列表
 */
async delLeftTags(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
```

**功能说明:**
- 保留指定视图及其右侧的视图
- 删除左侧的视图和对应缓存
- 保留固定的视图

### 更新视图

#### updateVisitedView - 更新已访问视图

```typescript
/**
 * 更新已访问视图的信息
 * @param view 包含新信息的路由视图
 */
updateVisitedView(view: RouteLocationNormalized): void
```

**功能说明:**
- 根据路径查找并更新对应的已访问视图
- 常用于更新标签标题或其他 meta 信息

### 查询视图

#### getVisitedViews - 获取已访问视图

```typescript
/**
 * 获取已访问视图列表的副本
 * @returns 已访问视图数组的浅拷贝
 */
getVisitedViews(): RouteLocationNormalized[]
```

#### getCachedViews - 获取缓存视图

```typescript
/**
 * 获取缓存视图名称列表的副本
 * @returns 缓存视图名称数组的浅拷贝
 */
getCachedViews(): string[]
```

#### getIframeViews - 获取 iframe 视图

```typescript
/**
 * 获取 iframe 视图列表的副本
 * @returns iframe 视图数组的浅拷贝
 */
getIframeViews(): RouteLocationNormalized[]
```

### 工具方法

#### isDynamicRoute - 判断是否为动态路由

```typescript
/**
 * 判断是否为动态路由
 * @param view 路由视图对象
 * @returns true 如果是动态路由,false 否则
 * @description 检查路由路径是否包含动态参数（如 :id）
 */
isDynamicRoute(view: RouteLocationNormalized): boolean
```

**功能说明:**
- 检查路由路径是否包含动态参数(如 `:id`)
- 用于决定是否删除缓存

**技术实现:**

```typescript
// src/composables/useLayout.ts:714-716
isDynamicRoute(view: RouteLocationNormalized): boolean {
  return view.matched.some((m) => m.path.includes(':'))
}
```

## 基本用法

### 1. 基础使用

```vue
<template>
  <div class="layout-container">
    <!-- 侧边栏状态显示 -->
    <div>
      <p>设备类型: {{ layout.device.value }}</p>
      <p>侧边栏状态: {{ layout.sidebar.value.opened ? '打开' : '关闭' }}</p>
      <p>当前主题: {{ layout.theme.value }}</p>
      <p>语言: {{ layout.language.value }}</p>
    </div>

    <!-- 操作按钮 -->
    <el-button @click="layout.toggleSideBar()">
      切换侧边栏
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { useLayout } from '@/composables/useLayout'

// 获取布局管理实例
const layout = useLayout()
</script>
```

**使用说明:**
- 使用 `useLayout()` 获取布局管理实例
- 所有状态都是响应式的,可直接在模板中使用
- 通过 `.value` 访问计算属性的值

### 2. 侧边栏控制

```vue
<template>
  <div class="sidebar-controls">
    <!-- 切换按钮 -->
    <el-button @click="handleToggle">
      <el-icon><Fold v-if="layout.sidebar.value.opened" /><Expand v-else /></el-icon>
    </el-button>

    <!-- 强制打开 -->
    <el-button @click="handleOpen">打开侧边栏</el-button>

    <!-- 强制关闭 -->
    <el-button @click="handleClose">关闭侧边栏</el-button>

    <!-- 完全隐藏 -->
    <el-button @click="handleHide">隐藏侧边栏</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 切换侧边栏
const handleToggle = () => {
  layout.toggleSideBar()
}

// 强制打开侧边栏
const handleOpen = () => {
  layout.openSideBar(false) // 带动画
}

// 强制关闭侧边栏
const handleClose = () => {
  layout.closeSideBar(true) // 无动画
}

// 完全隐藏侧边栏
const handleHide = () => {
  layout.toggleSideBarHide(true)
  // 恢复显示
  // layout.toggleSideBarHide(false)
}
</script>
```

**使用说明:**
- `toggleSideBar()` 智能切换,隐藏状态下不生效
- `openSideBar()` / `closeSideBar()` 强制控制,不考虑当前状态
- `toggleSideBarHide()` 完全隐藏,用于特殊页面
- 支持禁用动画参数,提升性能

### 3. 响应式布局

```vue
<template>
  <div class="responsive-layout">
    <div v-if="layout.device.value === 'mobile'">
      移动端布局
    </div>
    <div v-else-if="layout.device.value === 'tablet'">
      平板布局
    </div>
    <div v-else>
      桌面布局
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLayout } from '@/composables/useLayout'
import { useWindowSize } from '@vueuse/core'
import { watchEffect } from 'vue'

const layout = useLayout()
const { width } = useWindowSize()

// 自动响应窗口变化
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

**技术实现:**

```typescript
// src/composables/useLayout.ts:262-286
const { width } = useWindowSize()
const BREAKPOINT = 992 // 移动端断点

watch(width, () => {
  const isMobile = width.value - 1 < BREAKPOINT

  // 如果当前是移动端状态,确保侧边栏关闭
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

**使用说明:**
- 使用 VueUse 的 `useWindowSize` 监听窗口变化
- 断点定义: < 768px(移动端), 768-992px(平板), > 992px(桌面)
- 移动端自动关闭侧边栏,桌面端自动打开
- 自动更新设备类型,影响布局显示

### 4. 主题切换

```vue
<template>
  <div class="theme-controls">
    <!-- 暗黑模式切换 -->
    <el-switch
      v-model="darkMode"
      @change="handleDarkChange"
      active-text="暗黑模式"
      inactive-text="亮色模式"
    />

    <!-- 主题色选择 -->
    <el-color-picker
      v-model="themeColor"
      @change="handleThemeChange"
      :predefine="predefineColors"
    />

    <!-- 侧边栏主题 -->
    <el-radio-group v-model="sidebarTheme" @change="handleSideThemeChange">
      <el-radio-button value="theme-dark">暗色</el-radio-button>
      <el-radio-button value="theme-light">亮色</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 暗黑模式
const darkMode = ref(layout.dark.value)

const handleDarkChange = (value: boolean) => {
  layout.toggleDark(value)
}

// 主题色
const themeColor = ref(layout.theme.value)

const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399'
]

const handleThemeChange = (value: string) => {
  layout.theme.value = value
  // 更新 CSS 变量
  document.documentElement.style.setProperty('--el-color-primary', value)
}

// 侧边栏主题
const sidebarTheme = ref(layout.sideTheme.value)

const handleSideThemeChange = (value: string) => {
  layout.sideTheme.value = value
}

// 监听配置变化
watch([() => layout.dark.value, () => layout.theme.value], ([dark, theme]) => {
  console.log('主题已更新:', { dark, theme })
})
</script>
```

**使用说明:**
- `toggleDark()` 切换暗黑模式,集成 VueUse
- `theme.value` 设置主题色,需要手动更新 CSS 变量
- `sideTheme.value` 设置侧边栏主题
- 所有设置自动持久化到 localStorage

### 5. 多语言切换

```vue
<template>
  <div class="language-controls">
    <!-- 语言选择器 -->
    <el-dropdown @command="handleLanguageChange">
      <el-button>
        {{ currentLanguageLabel }}
        <el-icon><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh_CN">简体中文</el-dropdown-item>
          <el-dropdown-item command="en_US">English</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- Element Plus 国际化配置 -->
    <el-config-provider :locale="layout.locale.value">
      <!-- 你的应用内容 -->
      <router-view />
    </el-config-provider>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { ElMessage } from 'element-plus'
import type { LanguageCode } from '@/systemConfig'

const layout = useLayout()

// 当前语言标签
const currentLanguageLabel = computed(() => {
  return layout.language.value === 'zh_CN' ? '简体中文' : 'English'
})

// 切换语言
const handleLanguageChange = (lang: LanguageCode) => {
  layout.changeLanguage(lang)
  ElMessage.success('语言切换成功')
  // 可选: 刷新页面以完全应用
  // window.location.reload()
}
</script>
```

**语言映射配置:**

```typescript
// src/composables/useLayout.ts:92-95
const LANGUAGE_MAP: Record<LanguageCode, LocaleType> = {
  [LanguageCode.zh_CN]: zhCN,
  [LanguageCode.en_US]: enUS
}

// 语言本地化映射
const locale = computed<LocaleType>(() => LANGUAGE_MAP[language.value])
```

**使用说明:**
- 支持简体中文(`zh_CN`)和英文(`en_US`)
- 自动更新 Element Plus 本地化配置
- 语言设置自动持久化
- 建议配合 `el-config-provider` 使用

### 6. 标签视图管理

```vue
<template>
  <div class="tags-view">
    <!-- 标签列表 -->
    <div class="tags-list">
      <el-tag
        v-for="tag in layout.visitedViews.value"
        :key="tag.path"
        :closable="!isAffix(tag)"
        @close="handleCloseTag(tag)"
        @click="handleClickTag(tag)"
      >
        {{ tag.meta?.title }}
      </el-tag>
    </div>

    <!-- 右键菜单 -->
    <el-dropdown trigger="contextmenu" @command="handleCommand">
      <span>右键菜单</span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">刷新页面</el-dropdown-item>
          <el-dropdown-item command="close">关闭当前</el-dropdown-item>
          <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
          <el-dropdown-item command="closeAll">关闭全部</el-dropdown-item>
          <el-dropdown-item command="closeLeft">关闭左侧</el-dropdown-item>
          <el-dropdown-item command="closeRight">关闭右侧</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- keep-alive 缓存 -->
    <router-view v-slot="{ Component }">
      <keep-alive :include="layout.cachedViews.value">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const router = useRouter()
const route = useRoute()
const layout = useLayout()

// 判断是否为固定标签
const isAffix = (tag: RouteLocationNormalized) => {
  return tag.meta?.affix
}

// 关闭标签
const handleCloseTag = async (tag: RouteLocationNormalized) => {
  const { visitedViews } = await layout.delView(tag)

  if (isActive(tag)) {
    // 如果关闭的是当前标签,跳转到最后一个标签
    const latestView = visitedViews[visitedViews.length - 1]
    if (latestView) {
      router.push(latestView.fullPath)
    } else {
      router.push('/')
    }
  }
}

// 点击标签
const handleClickTag = (tag: RouteLocationNormalized) => {
  router.push(tag.fullPath)
}

// 判断是否为当前标签
const isActive = (tag: RouteLocationNormalized) => {
  return tag.path === route.path
}

// 处理右键菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'refresh':
      // 刷新当前页面
      await layout.delCachedView(route)
      await nextTick()
      layout.addCachedView(route)
      break
    case 'close':
      // 关闭当前标签
      await handleCloseTag(route)
      break
    case 'closeOthers':
      // 关闭其他标签
      await layout.delOthersViews(route)
      break
    case 'closeAll':
      // 关闭所有标签
      const { visitedViews } = await layout.delAllViews()
      const latestView = visitedViews[visitedViews.length - 1]
      if (latestView) {
        router.push(latestView.fullPath)
      } else {
        router.push('/')
      }
      break
    case 'closeLeft':
      // 关闭左侧标签
      await layout.delLeftTags(route)
      break
    case 'closeRight':
      // 关闭右侧标签
      await layout.delRightTags(route)
      break
  }
}
</script>
```

**在路由守卫中使用:**

```typescript
// src/router/guard.ts
import { useLayout } from '@/composables/useLayout'

router.afterEach((to) => {
  const layout = useLayout()

  // 添加标签
  layout.addView(to)

  // 设置页面标题
  if (to.meta.title) {
    layout.setTitle(to.meta.title as string)
  }
})
```

**使用说明:**
- `visitedViews` 存储已访问的标签
- `cachedViews` 存储需要缓存的组件名称
- 固定标签(`meta.affix=true`)不可关闭
- 动态路由不删除缓存,避免丢失状态
- 配合 `<keep-alive>` 实现页面缓存

## 持久化机制

### 自动同步

```typescript
// src/composables/useLayout.ts:295-303
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

**功能说明:**
- 深度监听配置对象变化
- 自动保存到 `localStorage`
- 同步更新侧边栏的打开状态
- 存储键名: `'layout-config'`

### 初始化加载

```typescript
// src/composables/useLayout.ts:174
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
```

**功能说明:**
- 从 localStorage 读取配置
- 如果不存在则使用默认配置
- 自动恢复侧边栏状态
- 恢复用户偏好设置(语言、尺寸、主题等)

### 默认配置

```typescript
// src/composables/useLayout.ts:101-134
const DEFAULT_CONFIG: LayoutSetting = {
  // 标题配置
  title: SystemConfig.ui.title,

  // 布局相关配置
  topNav: SystemConfig.ui.topNav,
  menuLayout: SystemConfig.ui.menuLayout,
  tagsView: SystemConfig.ui.tagsView,
  fixedHeader: SystemConfig.ui.fixedHeader,
  sidebarLogo: SystemConfig.ui.sidebarLogo,
  dynamicTitle: SystemConfig.ui.dynamicTitle,
  layout: SystemConfig.ui.layout,

  // 外观主题配置
  theme: SystemConfig.ui.theme,
  sideTheme: SystemConfig.ui.sideTheme,
  dark: SystemConfig.ui.dark,

  // 功能配置
  showSettings: SystemConfig.ui.showSettings,
  animationEnable: SystemConfig.ui.animationEnable,

  // 用户偏好配置
  sidebarStatus: SystemConfig.ui.sidebarStatus,
  size: SystemConfig.ui.size,
  language: SystemConfig.ui.language,

  // 选择器配置
  showSelectValue: SystemConfig.ui.showSelectValue,

  // 水印配置
  watermark: SystemConfig.ui.watermark,
  watermarkContent: SystemConfig.ui.watermarkContent
}
```

**功能说明:**
- 从 `SystemConfig` 读取系统默认配置
- 可在 `src/systemConfig.ts` 中修改
- 用户首次访问时使用此配置
- 重置配置时恢复到此状态

## 响应式设计

### 断点定义

```typescript
// 断点常量
const BREAKPOINT = 992 // 移动端断点,小于此宽度切换为移动端布局
```

**断点规则:**
1. **移动设备** - `width < 768px`
   - 自动关闭侧边栏
   - 使用移动端布局
   - 增大点击区域

2. **平板设备** - `768px ≤ width < 992px`
   - 显示收缩的侧边栏
   - 使用平板布局
   - 优化触摸交互

3. **桌面设备** - `width ≥ 992px`
   - 完全展开侧边栏
   - 使用桌面布局
   - 完整功能展示

### 自动响应

```typescript
// src/composables/useLayout.ts:262-286
const { width } = useWindowSize()
const BREAKPOINT = 992

watch(width, () => {
  const isMobile = width.value - 1 < BREAKPOINT

  // 如果当前是移动端状态,确保侧边栏关闭
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

**功能说明:**
- 使用 VueUse 的 `useWindowSize` 监听窗口变化
- 自动切换设备类型和侧边栏状态
- 防抖处理,避免频繁触发
- 移动端优先关闭侧边栏

### 触摸优化

**移动端特性:**
- 增大点击区域,方便触摸操作
- 支持滑动手势关闭侧边栏
- 优化动画性能,减少卡顿
- 简化操作流程

**实现建议:**

```typescript
// 在移动端禁用复杂动画
if (layout.device.value === 'mobile') {
  layout.closeSideBar(true) // 无动画关闭
}

// 触摸手势支持
import { useSwipe } from '@vueuse/core'

const { direction } = useSwipe(el, {
  onSwipe() {
    if (direction.value === 'left' && layout.device.value === 'mobile') {
      layout.closeSideBar()
    }
  }
})
```

## 暗黑模式实现

### VueUse 集成

```typescript
// src/composables/useLayout.ts:239-258
const isDark = useDark({
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
})

// 初始化时同步暗黑模式状态
isDark.value = state.config.dark

// 监听配置中的暗黑模式变化,同步到 VueUse
watch(dark, (newValue) => {
  isDark.value = newValue
})

// 监听 VueUse 的暗黑模式变化,同步到配置
watch(isDark, (newValue) => {
  dark.value = newValue
})
```

**功能说明:**
- 使用 VueUse 的 `useDark`,但禁用其内置存储
- 由我们自己管理持久化,确保配置统一
- 双向同步配置和 VueUse 状态
- 自动更新 HTML 的 `dark` 类名

### CSS 变量支持

**CSS 变量定义:**

```scss
:root {
  // 亮色主题
  --bg-color: #ffffff;
  --text-color: #303133;
  --border-color: #dcdfe6;
}

html.dark {
  // 暗色主题
  --bg-color: #1a1a1a;
  --text-color: #e5eaf3;
  --border-color: #4c4d4f;
}
```

**使用示例:**

```scss
.layout-container {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);

  transition: all 0.3s ease;
}
```

### 主题切换动画

```scss
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

// 禁用动画
html.dark * {
  transition: none;
}

// 重新启用动画
html.dark.transition-enabled * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## 文档标题管理

### 动态标题

```typescript
// src/composables/useLayout.ts:315-323
const updateDocumentTitle = (): void => {
  document.title = dynamicTitle.value ? `${state.title} - ${appTitle}` : SystemConfig.ui.title
}

// 监听动态标题设置和当前标题变化
watch([dynamicTitle, () => state.title], updateDocumentTitle)

// 初始化时设置文档标题
updateDocumentTitle()
```

**功能说明:**
- 根据 `dynamicTitle` 设置决定显示格式
- 启用动态标题: `"当前页面标题 - 应用名称"`
- 禁用动态标题: 使用系统默认标题
- 自动监听标题变化

### 路由守卫集成

```typescript
// src/router/guard.ts:165-167
router.afterEach((to) => {
  const layout = useLayout()
  if (to.meta.title) {
    layout.setTitle(to.meta.title as string)
  }
})
```

**使用建议:**

```typescript
// 设置页面标题
layout.setTitle('用户管理')
// 浏览器标签页显示: "用户管理 - RuoYi Plus"

// 重置为默认标题
layout.resetTitle()
// 浏览器标签页显示: "RuoYi Plus 管理系统"
```

## 单例模式实现

### 实例管理

```typescript
// src/composables/useLayout.ts:165-172
let layoutStateInstance: ReturnType<typeof createLayoutState> | null = null

function createLayoutState() {
  // ... 创建状态和方法
  return { ... }
}

export const useLayout = () => {
  if (!layoutStateInstance) {
    layoutStateInstance = createLayoutState()
  }
  return layoutStateInstance
}
```

**功能说明:**
- 确保全局只有一个状态实例
- 避免状态冲突和数据不一致
- 多次调用 `useLayout()` 返回同一个实例
- 类似 Pinia store 的单例行为

### 为什么不使用 Pinia?

**设计考虑:**

1. **轻量化**: 不需要 Pinia 的额外开销
2. **类型安全**: 直接使用 TypeScript 类型,无需定义 store
3. **灵活性**: 可以自由组织代码结构
4. **性能**: 减少一层抽象,性能更好
5. **集成**: 直接使用 VueUse,集成更方便

**对比:**

| 特性 | Pinia Store | useLayout Composable |
|------|-------------|---------------------|
| 状态管理 | ✅ | ✅ |
| 类型安全 | ✅ | ✅ |
| DevTools | ✅ | ❌ |
| 持久化 | 需要插件 | 内置 |
| 响应式 | ✅ | ✅ |
| 单例 | ✅ | ✅ |
| 体积 | 较大 | 较小 |

## API 文档

### 只读状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `state` | `Readonly<LayoutState>` | 只读的完整状态对象 |
| `device` | `ComputedRef<DeviceType>` | 当前设备类型 |
| `sidebar` | `ComputedRef<SidebarState>` | 侧边栏状态 |
| `title` | `ComputedRef<string>` | 当前页面标题 |
| `showSettings` | `ComputedRef<boolean>` | 是否显示设置面板 |
| `animationEnable` | `ComputedRef<boolean>` | 是否启用动画效果 |
| `visitedViews` | `ComputedRef<RouteLocationNormalized[]>` | 已访问的视图列表 |
| `cachedViews` | `ComputedRef<string[]>` | 缓存的视图名称列表 |
| `iframeViews` | `ComputedRef<RouteLocationNormalized[]>` | iframe 视图列表 |

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
| `showSelectValue` | `WritableComputedRef<boolean>` | 选择器显示值配置 |
| `watermark` | `WritableComputedRef<boolean>` | 是否显示水印 |
| `watermarkContent` | `WritableComputedRef<string>` | 水印内容 |

### 侧边栏操作方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `toggleSideBar` | `withoutAnimation?: boolean` | `void` | 切换侧边栏开关状态 |
| `openSideBar` | `withoutAnimation?: boolean` | `void` | 打开侧边栏 |
| `closeSideBar` | `withoutAnimation?: boolean` | `void` | 关闭侧边栏 |
| `toggleSideBarHide` | `status: boolean` | `void` | 设置侧边栏隐藏状态 |

### 设备和偏好设置方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `toggleDevice` | `device: DeviceType` | `void` | 切换设备类型 |
| `setSize` | `newSize: ElSize` | `void` | 设置组件尺寸 |
| `changeLanguage` | `lang: LanguageCode` | `void` | 切换界面语言 |
| `toggleDark` | `value: boolean` | `void` | 切换暗黑模式 |
| `setTitle` | `value: string` | `void` | 设置页面标题 |
| `resetTitle` | - | `void` | 重置页面标题 |
| `saveSettings` | `newConfig?: Partial<LayoutSetting>` | `void` | 保存布局设置 |
| `resetConfig` | - | `void` | 重置所有配置 |

### 标签视图操作方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addView` | `view: RouteLocationNormalized` | `void` | 添加视图到已访问和缓存列表 |
| `addVisitedView` | `view: RouteLocationNormalized` | `void` | 添加视图到已访问列表 |
| `addCachedView` | `view: RouteLocationNormalized` | `void` | 添加视图到缓存列表 |
| `addIframeView` | `view: RouteLocationNormalized` | `void` | 添加 iframe 视图 |
| `delView` | `view: RouteLocationNormalized` | `Promise<{visitedViews, cachedViews}>` | 删除指定视图 |
| `delVisitedView` | `view: RouteLocationNormalized` | `Promise<RouteLocationNormalized[]>` | 从已访问列表中删除视图 |
| `delCachedView` | `view?: RouteLocationNormalized` | `Promise<string[]>` | 从缓存列表中删除视图 |
| `delIframeView` | `view: RouteLocationNormalized` | `Promise<RouteLocationNormalized[]>` | 删除 iframe 视图 |
| `delOthersViews` | `view: RouteLocationNormalized` | `Promise<{visitedViews, cachedViews}>` | 删除除指定视图外的其他所有视图 |
| `delOthersVisitedViews` | `view: RouteLocationNormalized` | `Promise<RouteLocationNormalized[]>` | 删除除指定视图外的其他已访问视图 |
| `delOthersCachedViews` | `view: RouteLocationNormalized` | `Promise<string[]>` | 删除除指定视图外的其他缓存视图 |
| `delAllViews` | - | `Promise<{visitedViews, cachedViews}>` | 删除所有视图 |
| `delAllVisitedViews` | - | `Promise<RouteLocationNormalized[]>` | 删除所有已访问视图 |
| `delAllCachedViews` | - | `Promise<string[]>` | 清空所有缓存视图 |
| `delRightTags` | `view: RouteLocationNormalized` | `Promise<RouteLocationNormalized[]>` | 删除指定视图右侧的所有标签 |
| `delLeftTags` | `view: RouteLocationNormalized` | `Promise<RouteLocationNormalized[]>` | 删除指定视图左侧的所有标签 |
| `updateVisitedView` | `view: RouteLocationNormalized` | `void` | 更新已访问视图的信息 |
| `getVisitedViews` | - | `RouteLocationNormalized[]` | 获取已访问视图列表的副本 |
| `getCachedViews` | - | `string[]` | 获取缓存视图名称列表的副本 |
| `getIframeViews` | - | `RouteLocationNormalized[]` | 获取 iframe 视图列表的副本 |
| `isDynamicRoute` | `view: RouteLocationNormalized` | `boolean` | 判断是否为动态路由 |

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

// 初始化设备类型
onMounted(() => {
  const isMobile = width.value < 992
  layout.toggleDevice(isMobile ? 'mobile' : 'pc')
})
</script>
```

**要点:**
- 在 App.vue 的 `setup` 中初始化
- 根据窗口宽度设置初始设备类型
- 确保在路由守卫之前初始化

### 2. 防抖处理

```typescript
import { useDebounceFn } from '@vueuse/core'

const handleResize = useDebounceFn(() => {
  const isMobile = width.value < 992
  layout.toggleDevice(isMobile ? 'mobile' : 'pc')
}, 300)

watch(width, handleResize)
```

**要点:**
- resize 事件使用防抖,避免频繁触发
- 建议延迟 300ms
- 提升性能,减少不必要的状态更新

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

**要点:**
- 移动端考虑禁用复杂动画
- 页面加载时禁用动画,避免卡顿
- 使用 `will-change` 优化动画性能

### 4. 语言切换提示

```typescript
const handleLanguageChange = async (lang: LanguageCode) => {
  const loading = ElLoading.service({
    lock: true,
    text: '切换语言中...'
  })

  try {
    layout.changeLanguage(lang)

    // 刷新页面以完全应用
    await new Promise(resolve => setTimeout(resolve, 300))
    window.location.reload()
  } finally {
    loading.close()
  }
}
```

**要点:**
- 提供用户友好的切换提示
- 部分组件可能需要刷新页面
- 使用 loading 提升用户体验

### 5. 尺寸一致性

```typescript
// 自定义组件响应全局尺寸
<template>
  <el-button :size="layout.size.value">
    按钮
  </el-button>

  <el-input :size="layout.size.value" />

  <el-select :size="layout.size.value" />
</template>

<script lang="ts" setup>
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()
</script>
```

**要点:**
- 确保自定义组件响应全局尺寸设置
- 统一使用 `layout.size.value`
- 避免硬编码尺寸值

### 6. 状态持久化策略

```typescript
// 敏感配置不持久化
const privateSetting = ref({
  token: '',
  userInfo: {}
})

// 只持久化 UI 配置
watch(
  () => layout.state.config,
  (config) => {
    // 过滤敏感信息
    const safeConfig = {
      ...config,
      watermarkContent: '' // 不保存个人水印内容
    }
    localCache.setJSON('layout-config', safeConfig)
  },
  { deep: true }
)
```

**要点:**
- 只持久化 UI 相关配置
- 不持久化敏感信息(token、用户信息等)
- 定期清理过期配置

### 7. 标签视图性能优化

```typescript
// 限制标签数量
const MAX_TAGS = 20

watch(
  () => layout.visitedViews.value.length,
  (length) => {
    if (length > MAX_TAGS) {
      // 删除最旧的非固定标签
      const views = layout.visitedViews.value
      const oldestView = views.find(v => !v.meta?.affix)
      if (oldestView) {
        layout.delView(oldestView)
      }
    }
  }
)
```

**要点:**
- 限制标签数量,避免性能问题
- 优先删除非固定标签
- 建议最多保留 20-30 个标签

### 8. 缓存策略

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
  // 只删除已访问视图,保留缓存
  await layout.delVisitedView(route)
} else {
  // 完全删除
  await layout.delView(route)
}
```

**要点:**
- 表单页面建议不缓存,避免数据残留
- 动态路由保留缓存,避免丢失状态
- 使用 `meta.noCache` 控制缓存策略

### 9. 响应式布局适配

```typescript
// 平板设备特殊处理
if (layout.device.value === 'tablet') {
  // 显示收缩的侧边栏
  layout.closeSideBar(true)
  state.sidebar.opened = false // 但保持 opened 为 false
}

// 监听设备变化,动态调整布局
watch(
  () => layout.device.value,
  (device) => {
    if (device === 'mobile') {
      layout.closeSideBar()
      layout.tagsView.value = false
    } else {
      layout.openSideBar()
      layout.tagsView.value = true
    }
  }
)
```

**要点:**
- 平板设备使用专门的布局方案
- 移动端隐藏标签视图,节省空间
- 根据设备类型动态调整功能

### 10. 错误处理

```typescript
try {
  const layout = useLayout()
  layout.setSize('large')
} catch (error) {
  console.error('布局设置失败:', error)
  ElMessage.error('配置更新失败,请刷新页面')
}

// 监听存储错误
window.addEventListener('error', (event) => {
  if (event.message.includes('localStorage')) {
    ElMessage.warning('浏览器存储已满,部分设置可能无法保存')
  }
})
```

**要点:**
- 捕获配置更新错误
- 处理 localStorage 存储满的情况
- 提供友好的错误提示

## 常见问题

### 1. 侧边栏状态不同步

**问题描述:**
侧边栏的打开/关闭状态在不同组件中显示不一致。

**问题原因:**
- 多次创建 `useLayout` 实例
- 直接修改状态而不通过方法
- 缓存配置损坏

**解决方案:**

```typescript
// ❌ 错误: 直接修改状态
const layout = useLayout()
layout.sidebar.value.opened = false // 不会触发持久化

// ✅ 正确: 使用方法修改
layout.closeSideBar()

// 清理损坏的缓存
import { localCache } from '@/utils/cache'
localCache.remove('layout-config')
location.reload()
```

### 2. 暗黑模式切换无效

**问题描述:**
切换暗黑模式后,部分组件样式没有更新。

**问题原因:**
- CSS 变量未正确定义
- VueUse 的 `useDark` 冲突
- 样式优先级问题

**解决方案:**

```typescript
// 1. 确保 CSS 变量正确定义
:root {
  --bg-color: #ffffff;
}

html.dark {
  --bg-color: #1a1a1a;
}

// 2. 检查 VueUse 配置
const isDark = useDark({
  storage: {
    getItem: () => null, // 禁用内置存储
    setItem: () => {},
    removeItem: () => {}
  }
})

// 3. 强制刷新样式
const layout = useLayout()
layout.toggleDark(true)
await nextTick()
document.documentElement.classList.toggle('dark', true)
```

### 3. 标签视图缓存失效

**问题描述:**
切换标签后,页面状态丢失,需要重新加载。

**问题原因:**
- 组件未设置 `name` 属性
- `cachedViews` 不包含组件名称
- 路由配置中 `name` 与组件 `name` 不一致

**解决方案:**

```vue
<!-- ❌ 错误: 组件没有 name -->
<script lang="ts" setup>
// ...
</script>

<!-- ✅ 正确: 定义 name -->
<script lang="ts">
export default {
  name: 'UserList' // 必须与路由配置中的 name 一致
}
</script>

<script lang="ts" setup>
// ...
</script>

// 路由配置
{
  path: '/user/list',
  name: 'UserList', // 与组件 name 一致
  component: () => import('@/views/user/list.vue'),
  meta: {
    title: '用户列表',
    // noCache: true // 不要设置,否则不缓存
  }
}

// keep-alive 配置
<router-view v-slot="{ Component }">
  <keep-alive :include="layout.cachedViews.value">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

### 4. 响应式布局不生效

**问题描述:**
窗口大小改变时,布局没有自动适配。

**问题原因:**
- 没有监听窗口变化
- 设备类型没有更新
- 断点判断逻辑错误

**解决方案:**

```typescript
// App.vue
import { useLayout } from '@/composables/useLayout'
import { useWindowSize } from '@vueuse/core'
import { watch } from 'vue'

const layout = useLayout()
const { width } = useWindowSize()

// 监听窗口变化
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

// 或使用 useLayout 内置的响应式处理
// src/composables/useLayout.ts 已经实现了自动响应
```

### 5. 配置持久化失败

**问题描述:**
刷新页面后,用户设置丢失,恢复为默认配置。

**问题原因:**
- localStorage 存储满
- 浏览器隐私模式禁用存储
- 配置序列化失败

**解决方案:**

```typescript
import { localCache } from '@/utils/cache'

// 1. 检查存储是否可用
try {
  localCache.setJSON('test', { value: 'test' })
  localCache.remove('test')
} catch (error) {
  console.error('localStorage 不可用:', error)
  ElMessage.warning('浏览器存储不可用,设置将无法保存')
}

// 2. 清理旧配置
const oldConfig = localCache.getJSON('layout-config')
if (oldConfig && typeof oldConfig !== 'object') {
  localCache.remove('layout-config')
}

// 3. 使用默认配置
const layout = useLayout()
if (!localCache.getJSON('layout-config')) {
  layout.saveSettings() // 保存默认配置
}

// 4. 定期清理
const cleanup = () => {
  // 只保留最新的配置
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('layout-config-')) {
      localStorage.removeItem(key)
    }
  })
}

onMounted(cleanup)
```

## 与其他模块协作

### 与 Permission Store

```typescript
import { useLayout } from '@/composables/useLayout'
import { usePermissionStore } from '@/stores/modules/permission'

const layout = useLayout()
const permissionStore = usePermissionStore()

// 动态路由生成完成后,添加到标签视图
watch(
  () => permissionStore.routes,
  (routes) => {
    // 添加固定标签
    routes.forEach(route => {
      if (route.meta?.affix) {
        layout.addVisitedView(route)
      }
    })
  }
)
```

**协作关系:**
- Permission Store 提供路由数据
- Layout 管理标签视图
- 共同实现动态菜单和多标签页

### 与 User Store

```typescript
import { useLayout } from '@/composables/useLayout'
import { useUserStore } from '@/stores/modules/user'

const layout = useLayout()
const userStore = useUserStore()

// 用户登录后,恢复用户偏好设置
watch(
  () => userStore.userInfo,
  (userInfo) => {
    if (userInfo) {
      // 恢复用户的语言设置
      if (userInfo.language) {
        layout.changeLanguage(userInfo.language)
      }

      // 恢复用户的主题设置
      if (userInfo.theme) {
        layout.theme.value = userInfo.theme
      }
    }
  }
)

// 用户退出后,重置布局
watch(
  () => userStore.token,
  (token) => {
    if (!token) {
      // 清空标签视图
      layout.delAllViews()
      // 重置页面标题
      layout.resetTitle()
    }
  }
)
```

**协作关系:**
- User Store 提供用户信息
- Layout 恢复用户偏好设置
- 共同实现个性化配置

### 与 Theme Store

```typescript
import { useLayout } from '@/composables/useLayout'
import { useThemeStore } from '@/stores/modules/theme'

const layout = useLayout()
const themeStore = useThemeStore()

// 同步主题设置
watch(
  () => layout.theme.value,
  (theme) => {
    themeStore.setTheme(theme)
  }
)

watch(
  () => layout.dark.value,
  (dark) => {
    themeStore.setDark(dark)
  }
)

// 同步侧边栏主题
watch(
  () => layout.sideTheme.value,
  (sideTheme) => {
    themeStore.setSideTheme(sideTheme)
  }
)
```

**协作关系:**
- Layout 管理主题配置
- Theme Store 应用主题样式
- 共同管理应用的视觉表现

### 与布局组件

```vue
<!-- Layout.vue -->
<template>
  <div
    :class="[
      'app-wrapper',
      {
        'hide-sidebar': !layout.sidebar.value.opened,
        'open-sidebar': layout.sidebar.value.opened,
        'without-animation': layout.sidebar.value.withoutAnimation,
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

**协作关系:**
- Layout 组件监听 sidebar 状态
- AppMain 响应 device 变化
- Navbar 使用 size 配置
- TagsView 使用标签视图状态

## 总结

`useLayout` composable 是一个功能强大的布局状态管理系统,提供了完整的布局、主题、侧边栏、标签视图等功能。它采用 Composition API 和单例模式,确保全局状态的唯一性和一致性。

**核心优势:**

1. **统一管理** - 所有布局相关状态集中管理,避免状态分散
2. **类型安全** - 完整的 TypeScript 类型支持,开发体验优秀
3. **自动持久化** - 配置自动保存到 localStorage,刷新后保持状态
4. **响应式设计** - 自动适配不同设备,提供最佳用户体验
5. **灵活扩展** - 易于扩展新功能,不影响现有代码

**适用场景:**

- 企业级管理后台
- 多页面应用
- 需要多标签页功能的系统
- 需要响应式布局的应用
- 需要主题切换的系统

通过合理使用 `useLayout`,可以大大简化布局管理的复杂度,提升开发效率和用户体验。
