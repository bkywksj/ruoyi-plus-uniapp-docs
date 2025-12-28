# 主题状态管理 (theme)

## 介绍

主题状态管理模块是 RuoYi-Plus 前端框架的核心功能之一，负责应用的主题色、暗黑模式、布局配置和用户界面偏好设置的统一管理。该模块通过 `useTheme` 和 `useLayout` 两个 Composable 协同工作，实现了从主题色设置、颜色变体生成到 CSS 变量应用的完整链路，提供了企业级应用所需的完整主题定制能力。

主题系统采用单例模式设计，确保全局状态的一致性。所有配置都会自动持久化到 localStorage，用户的偏好设置在页面刷新后得以保留。系统深度集成 VueUse 的暗黑模式管理，与 Element Plus 主题变量体系无缝对接，支持实时预览和动态切换。

**核心特性:**

- **主题色管理** - 自定义主题色，自动生成 9 级亮色和 9 级暗色变体，共 18 个颜色等级覆盖所有 UI 场景
- **暗黑模式** - 集成 VueUse 暗黑模式，自动应用暗黑主题 CSS 变量，支持系统偏好跟随
- **颜色工具** - Hex ↔ RGB 转换、颜色混合、亮度调节、透明度添加等完整工具函数
- **CSS 变量管理** - 动态设置 Element Plus 主题变量，实时更新全局样式
- **配置持久化** - 自动保存用户偏好到 localStorage，跨会话保持配置
- **响应式布局** - 自动检测设备类型，动态调整侧边栏和菜单布局
- **多语言支持** - 集成 Element Plus 国际化，支持中英文切换
- **标签视图管理** - 完整的多标签页功能，支持缓存、固定、批量操作

## 架构设计

### 模块协作

主题系统由两个核心 Composable 组成，各司其职又紧密协作：

| 模块 | 职责 | 主要功能 |
|------|------|----------|
| useTheme | 主题色设置、颜色变体生成、CSS 变量应用 | `setTheme`、`getLightColor`、`getDarkColor`、`applyThemeColors` |
| useLayout | 布局状态、配置持久化、暗黑模式同步、标签视图管理 | `toggleDark`、`toggleSideBar`、`addView`、`saveSettings` |

### 单例模式设计

```typescript
let layoutStateInstance: ReturnType<typeof createLayoutState> | null = null

export const useLayout = () => {
  if (!layoutStateInstance) {
    layoutStateInstance = createLayoutState()
  }
  return layoutStateInstance
}
```

单例模式确保：
- 全局状态唯一，避免多实例导致的状态不一致
- 所有组件访问同一状态实例
- 配置修改实时同步到所有使用处

### 数据流向

**主题色设置流程：**

```
用户操作 → useTheme.setTheme(color)
         → useLayout.theme.value = color
         → applyThemeColors(color)
         → 生成 9 级亮色变体
         → 生成 9 级暗色变体
         → document.documentElement.style.setProperty()
         → 组件样式实时更新
         → localStorage 自动持久化
```

**暗黑模式切换流程：**

```
用户切换 → useLayout.toggleDark(value)
         → dark.value = value
         → watch 触发同步
         → VueUse isDark 更新
         → html 元素添加/移除 .dark 类
         → CSS 暗黑变量生效
         → 配置持久化到 localStorage
```

### 响应式设计流程

```
窗口 resize → useWindowSize().width 变化
           → watch 触发
           → 判断是否小于 992px 断点
           → 切换设备类型 (pc/mobile)
           → 自动打开/关闭侧边栏
           → 布局组件响应式调整
```

## 状态定义

### 核心类型定义

```typescript
/**
 * 设备类型定义
 * 用于响应式布局的设备类型识别
 */
type DeviceType = 'pc' | 'mobile' | 'tablet'

/**
 * 侧边栏主题类型
 */
type SideTheme = 'theme-dark' | 'theme-light'

/**
 * 菜单布局模式
 */
enum MenuLayoutMode {
  Vertical = 'vertical',    // 垂直布局 - 传统左侧菜单
  Horizontal = 'horizontal', // 水平布局 - 顶部菜单
  Mixed = 'mixed'           // 混合布局 - 顶部+左侧
}

/**
 * 语言代码
 */
enum LanguageCode {
  zh_CN = 'zh_CN',  // 简体中文
  en_US = 'en_US'   // 英文
}

/**
 * Element Plus 组件尺寸
 */
type ElSize = 'large' | 'default' | 'small'
```

### 主题配置接口

```typescript
interface LayoutSetting {
  // ========== 标题配置 ==========
  /** 系统标题 */
  title: string
  /** 是否启用动态标题 */
  dynamicTitle: boolean

  // ========== 主题外观 ==========
  /** 主题色 (如 '#5d87ff') */
  theme: string
  /** 侧边栏主题 ('theme-dark' | 'theme-light') */
  sideTheme: SideTheme
  /** 暗黑模式开关 */
  dark: boolean

  // ========== 布局结构 ==========
  /** 顶部导航 */
  topNav: boolean
  /** 标签视图 */
  tagsView: boolean
  /** 固定头部 */
  fixedHeader: boolean
  /** 侧边栏Logo */
  sidebarLogo: boolean
  /** 菜单布局模式 */
  menuLayout: MenuLayoutMode
  /** 布局类型 */
  layout: string

  // ========== 功能配置 ==========
  /** 是否显示设置面板 */
  showSettings: boolean
  /** 是否启用页面切换动画 */
  animationEnable: boolean

  // ========== 用户偏好 ==========
  /** 侧边栏状态 ('1' 打开 | '0' 关闭) */
  sidebarStatus: string
  /** 组件尺寸 */
  size: ElSize
  /** 界面语言 */
  language: LanguageCode

  // ========== 选择器配置 ==========
  /** 选择器是否显示值 */
  showSelectValue: boolean

  // ========== 水印配置 ==========
  /** 是否显示水印 */
  watermark: boolean
  /** 水印内容 */
  watermarkContent: string
}
```

### 侧边栏状态接口

```typescript
interface SidebarState {
  /** 是否打开侧边栏 */
  opened: boolean
  /** 是否禁用切换动画 */
  withoutAnimation: boolean
  /** 是否完全隐藏侧边栏（用于特殊页面） */
  hide: boolean
}
```

### 标签视图状态接口

```typescript
interface TagsViewState {
  /** 已访问的视图列表 */
  visitedViews: RouteLocationNormalized[]
  /** 缓存的视图名称列表 */
  cachedViews: string[]
  /** iframe 视图列表 */
  iframeViews: RouteLocationNormalized[]
}
```

### 颜色对象接口

```typescript
interface ThemeColors {
  /** 主题主色调 */
  primary: string
  /** 亮色变体(9个等级) */
  lightColors: string[]
  /** 暗色变体(9个等级) */
  darkColors: string[]
}
```

### 布局状态完整接口

```typescript
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

### 默认配置

```typescript
const DEFAULT_CONFIG: LayoutSetting = {
  // 标题配置
  title: SystemConfig.ui.title,
  dynamicTitle: true,

  // 布局相关配置
  topNav: false,
  menuLayout: 'vertical',
  tagsView: true,
  fixedHeader: true,
  sidebarLogo: true,
  layout: 'default',

  // 外观主题配置
  theme: '#5d87ff',        // 默认主题色
  sideTheme: 'theme-dark', // 默认暗色侧边栏
  dark: false,             // 默认亮色模式

  // 功能配置
  showSettings: true,
  animationEnable: true,

  // 用户偏好配置
  sidebarStatus: '1',      // 默认打开
  size: 'default',
  language: 'zh_CN',

  // 选择器配置
  showSelectValue: true,

  // 水印配置
  watermark: false,
  watermarkContent: ''
}
```

## 核心方法

### setTheme - 设置主题色

设置新的主题色并应用到整个应用：

```typescript
/**
 * 设置主题色
 * @param color 十六进制颜色字符串
 * @description 设置新的主题色并应用到整个应用
 */
const setTheme = (color: string): void => {
  // 更新布局状态管理中的主题
  layout.theme.value = color
  // 应用主题颜色
  applyThemeColors(color)
}
```

**使用示例:**

```typescript
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// 设置为蓝色主题
setTheme('#1890ff')

// 设置为红色主题
setTheme('#f5222d')

// 设置为绿色主题
setTheme('#52c41a')
```

### resetTheme - 重置主题

将主题重置为当前配置中保存的默认值：

```typescript
/**
 * 重置为默认主题
 * @description 将主题重置为系统默认值
 */
const resetTheme = (): void => {
  const defaultTheme = layout.theme.value
  applyThemeColors(defaultTheme)
}
```

### generateThemeColors - 生成主题色系

根据主色自动生成完整的 18 级颜色变体：

```typescript
/**
 * 为指定颜色生成所有变体
 * @param color 基础颜色
 * @returns 主题颜色对象，包含主色和变体
 */
const generateThemeColors = (color: string): ThemeColors => {
  // 生成9个亮色变体
  const lightColors = Array.from({ length: 9 }, (_, i) =>
    getLightColor(color, (i + 1) / 10)
  )

  // 生成9个暗色变体
  const darkColors = Array.from({ length: 9 }, (_, i) =>
    getDarkColor(color, (i + 1) / 10)
  )

  return {
    primary: color,
    lightColors,
    darkColors
  }
}
```

**颜色变体示例:**

```typescript
const colors = generateThemeColors('#1890ff')
// 结果:
// {
//   primary: '#1890ff',
//   lightColors: [
//     '#2f9bff',  // light-1: 10% 调亮
//     '#46a6ff',  // light-2: 20% 调亮
//     '#5db1ff',  // light-3: 30% 调亮
//     '#74bcff',  // light-4: 40% 调亮
//     '#8bc7ff',  // light-5: 50% 调亮
//     '#a2d2ff',  // light-6: 60% 调亮
//     '#b9ddff',  // light-7: 70% 调亮
//     '#d0e8ff',  // light-8: 80% 调亮
//     '#e7f3ff',  // light-9: 90% 调亮
//   ],
//   darkColors: [
//     '#1682e6',  // dark-1: 10% 调暗
//     '#1474cc',  // dark-2: 20% 调暗
//     '#1266b3',  // dark-3: 30% 调暗
//     '#0f5899',  // dark-4: 40% 调暗
//     '#0d4a80',  // dark-5: 50% 调暗
//     '#0a3c66',  // dark-6: 60% 调暗
//     '#082e4d',  // dark-7: 70% 调暗
//     '#052033',  // dark-8: 80% 调暗
//     '#03121a',  // dark-9: 90% 调暗
//   ]
// }
```

### applyThemeColors - 应用主题色

将主题色应用到 Element Plus CSS 变量：

```typescript
/**
 * 应用主题颜色到CSS变量
 * @param color 主题颜色
 */
const applyThemeColors = (color: string): void => {
  // 设置主色
  document.documentElement.style.setProperty('--el-color-primary', color)

  // 设置亮色变体 (--el-color-primary-light-1 ~ light-9)
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-light-${i}`,
      getLightColor(color, i / 10)
    )
  }

  // 设置暗色变体 (--el-color-primary-dark-1 ~ dark-9)
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-dark-${i}`,
      getDarkColor(color, i / 10)
    )
  }

  // 更新当前主题变量
  currentTheme.value = color
}
```

### toggleDark - 切换暗黑模式

```typescript
/**
 * 切换暗黑模式
 * @param value true 启用暗黑模式, false 禁用
 */
const toggleDark = (value: boolean): void => {
  dark.value = value
}
```

**暗黑模式实现原理:**

1. 更新 `dark.value` 状态
2. watch 监听触发，同步到 VueUse 的 `isDark`
3. VueUse 自动添加/移除 `.dark` 类到 `<html>` 元素
4. CSS 暗黑变量通过选择器 `html.dark` 生效
5. 配置自动持久化到 localStorage

```typescript
// 暗黑模式管理
const isDark = useDark({
  storage: {
    getItem: () => null,      // 禁用 VueUse 内置存储
    setItem: () => {},
    removeItem: () => {}
  }
})

// 初始化时同步暗黑模式状态
isDark.value = state.config.dark

// 双向同步
watch(dark, (newValue) => {
  isDark.value = newValue
})

watch(isDark, (newValue) => {
  dark.value = newValue
})
```

## 侧边栏管理

### toggleSideBar - 切换侧边栏

```typescript
/**
 * 切换侧边栏开关状态
 * @param withoutAnimation 是否禁用切换动画，默认 false
 */
const toggleSideBar = (withoutAnimation = false): void => {
  if (state.sidebar.hide) return

  const newStatus = state.config.sidebarStatus === '1' ? '0' : '1'
  updateSidebarStatus(newStatus, withoutAnimation)
}
```

### openSideBar / closeSideBar - 打开/关闭侧边栏

```typescript
/**
 * 打开侧边栏
 * @param withoutAnimation 是否禁用动画效果，默认 false
 */
const openSideBar = (withoutAnimation = false): void => {
  updateSidebarStatus('1', withoutAnimation)
}

/**
 * 关闭侧边栏
 * @param withoutAnimation 是否禁用动画效果，默认 false
 */
const closeSideBar = (withoutAnimation = false): void => {
  updateSidebarStatus('0', withoutAnimation)
}
```

### toggleSideBarHide - 隐藏侧边栏

```typescript
/**
 * 设置侧边栏隐藏状态（用于某些特殊页面完全隐藏侧边栏）
 * @param status true 隐藏, false 显示
 */
const toggleSideBarHide = (status: boolean): void => {
  state.sidebar.hide = status
}
```

**使用示例:**

```vue
<template>
  <div class="sidebar-control">
    <el-button @click="layout.toggleSideBar()">
      切换侧边栏
    </el-button>
    <el-button @click="layout.toggleSideBar(true)">
      切换（无动画）
    </el-button>
    <el-button @click="layout.closeSideBar()">
      关闭侧边栏
    </el-button>
    <el-button @click="layout.openSideBar()">
      打开侧边栏
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 响应式访问侧边栏状态
console.log(layout.sidebar.value.opened)  // 是否打开
console.log(layout.sidebar.value.hide)    // 是否隐藏
</script>
```

## 菜单布局管理

### 布局模式

系统支持三种菜单布局模式：

| 模式 | 说明 | 侧边栏 | 顶部导航 |
|------|------|--------|----------|
| `vertical` | 垂直布局 | 显示 | 隐藏 |
| `horizontal` | 水平布局 | 隐藏 | 显示 |
| `mixed` | 混合布局 | 显示 | 显示 |

### 布局模式同步

```typescript
// 菜单布局初始化同步
if (state.config.menuLayout === MenuLayoutMode.Horizontal) {
  state.config.topNav = true
  state.sidebar.hide = true  // 水平布局隐藏侧边栏
} else if (state.config.menuLayout === MenuLayoutMode.Mixed) {
  state.config.topNav = true
  state.sidebar.hide = false // 混合布局显示侧边栏
} else if (state.config.menuLayout === MenuLayoutMode.Vertical) {
  state.config.topNav = false
  state.sidebar.hide = false // 垂直布局显示侧边栏
}
```

**切换布局模式示例:**

```vue
<template>
  <el-radio-group v-model="layout.menuLayout.value">
    <el-radio-button value="vertical">垂直布局</el-radio-button>
    <el-radio-button value="horizontal">水平布局</el-radio-button>
    <el-radio-button value="mixed">混合布局</el-radio-button>
  </el-radio-group>
</template>

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()
</script>
```

## 响应式设计

### 断点配置

```typescript
const { width } = useWindowSize()
const BREAKPOINT = 992  // 移动端断点

// 监听窗口宽度变化
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

### 设备类型切换

```typescript
/**
 * 切换设备类型
 * @param device 设备类型：'pc' | 'mobile' | 'tablet'
 */
const toggleDevice = (device: DeviceType): void => {
  state.device = device
}
```

**响应式布局示例:**

```vue
<template>
  <div :class="layoutClass">
    <sidebar v-if="showSidebar" />
    <main-content />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

const showSidebar = computed(() =>
  layout.device.value === 'pc' && !layout.sidebar.value.hide
)

const layoutClass = computed(() => ({
  'layout-pc': layout.device.value === 'pc',
  'layout-mobile': layout.device.value === 'mobile',
  'sidebar-open': layout.sidebar.value.opened,
  'sidebar-closed': !layout.sidebar.value.opened
}))
</script>
```

## 颜色工具函数

### getLightColor - 调亮颜色

```typescript
/**
 * 生成亮色变体
 * @param color 基础颜色
 * @param level 亮度级别 (0-1)，越大越亮
 * @returns 亮色变体的十六进制颜色
 */
const getLightColor = (color: string, level: number): string => {
  return lightenColor(color, level)
}

// 算法原理: newValue = (255 - value) * level + value
// 例如: 将 #1890ff 调亮 20%
// R: (255 - 24) * 0.2 + 24 = 70.2
// G: (255 - 144) * 0.2 + 144 = 166.2
// B: (255 - 255) * 0.2 + 255 = 255
```

### getDarkColor - 调暗颜色

```typescript
/**
 * 生成暗色变体
 * @param color 基础颜色
 * @param level 暗度级别 (0-1)，越大越暗
 * @returns 暗色变体的十六进制颜色
 */
const getDarkColor = (color: string, level: number): string => {
  return darkenColor(color, level)
}

// 算法原理: newValue = value * (1 - level)
// 例如: 将 #1890ff 调暗 20%
// R: 24 * 0.8 = 19.2
// G: 144 * 0.8 = 115.2
// B: 255 * 0.8 = 204
```

### addAlphaToHex - 添加透明度

```typescript
/**
 * 将十六进制颜色转换为带透明度的颜色
 * @param hex 十六进制颜色 (如 #282828)
 * @param alpha 透明度 (0-1)
 * @returns 带透明度的十六进制颜色 (如 #28282880)
 */
const addAlphaToHex = (hex: string, alpha: number = 1): string => {
  if (alpha >= 1) return hex
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${alphaHex}`
}
```

**透明度转换对照表:**

| alpha | hex 值 | 示例 |
|-------|--------|------|
| 1.0 | FF | `#1890ffff` |
| 0.9 | E6 | `#1890ffe6` |
| 0.8 | CC | `#1890ffcc` |
| 0.7 | B3 | `#1890ffb3` |
| 0.6 | 99 | `#1890ff99` |
| 0.5 | 80 | `#1890ff80` |
| 0.4 | 66 | `#1890ff66` |
| 0.3 | 4D | `#1890ff4d` |
| 0.2 | 33 | `#1890ff33` |
| 0.1 | 1A | `#1890ff1a` |
| 0 | 00 | `#1890ff00` |

### hexToRgb / rgbToHex - 颜色格式转换

```typescript
import { hexToRgb, rgbToHex } from '@/utils/colors'

// Hex 转 RGB 数组
const rgb = hexToRgb('#1890ff')  // [24, 144, 255]

// RGB 转 Hex
const hex = rgbToHex(24, 144, 255)  // '#1890ff'

// 实际应用
const [r, g, b] = hexToRgb(currentTheme)
const rgba = `rgba(${r}, ${g}, ${b}, 0.5)`
```

## 标签视图管理

### addView - 添加视图

```typescript
/**
 * 添加视图到已访问和缓存列表
 * @param view 路由视图对象
 */
addView(view: RouteLocationNormalized) {
  this.addVisitedView(view)
  this.addCachedView(view)
}

/**
 * 添加视图到已访问列表
 * @param view 路由视图对象
 * @description 如果视图已存在则不重复添加
 */
addVisitedView(view: RouteLocationNormalized) {
  if (state.tagsView.visitedViews.some((v) => v.path === view.path)) return

  state.tagsView.visitedViews.push({
    ...view,
    title: view.meta?.title || 'no-name'
  })
}

/**
 * 添加视图到缓存列表
 * @param view 路由视图对象
 * @description 只缓存有名称且未设置 noCache 的视图
 */
addCachedView(view: RouteLocationNormalized) {
  const viewName = view.name as string
  if (!viewName || state.tagsView.cachedViews.includes(viewName)) return
  if (!view.meta?.noCache) {
    state.tagsView.cachedViews.push(viewName)
  }
}
```

### delView - 删除视图

```typescript
/**
 * 删除指定视图
 * @param view 要删除的路由视图
 * @returns Promise 包含删除后的视图列表
 */
async delView(view: RouteLocationNormalized) {
  await this.delVisitedView(view)
  if (!this.isDynamicRoute(view)) {
    await this.delCachedView(view)
  }
  return {
    visitedViews: this.getVisitedViews(),
    cachedViews: this.getCachedViews()
  }
}
```

### delOthersViews - 删除其他视图

```typescript
/**
 * 删除除指定视图外的其他所有视图
 * @param view 要保留的路由视图
 * @returns Promise 包含删除后的视图列表
 */
async delOthersViews(view: RouteLocationNormalized) {
  await this.delOthersVisitedViews(view)
  await this.delOthersCachedViews(view)
  return {
    visitedViews: this.getVisitedViews(),
    cachedViews: this.getCachedViews()
  }
}

/**
 * 删除除指定视图外的其他已访问视图
 * @description 保留固定的视图（meta.affix=true）和指定视图
 */
async delOthersVisitedViews(view: RouteLocationNormalized) {
  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (v) => v.meta?.affix || v.path === view.path
  )
  return this.getVisitedViews()
}
```

### delRightTags / delLeftTags - 删除左右标签

```typescript
/**
 * 删除指定视图右侧的所有标签
 * @param view 基准视图
 * @description 保留指定视图及其左侧的视图
 */
async delRightTags(view: RouteLocationNormalized) {
  const index = state.tagsView.visitedViews.findIndex(
    (v) => v.path === view.path
  )
  if (index === -1) return this.getVisitedViews()

  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (item, idx) => {
      if (idx <= index || item.meta?.affix) return true

      // 同时删除缓存
      const cacheIndex = state.tagsView.cachedViews.indexOf(item.name as string)
      if (cacheIndex > -1) {
        state.tagsView.cachedViews.splice(cacheIndex, 1)
      }
      return false
    }
  )

  return this.getVisitedViews()
}

/**
 * 删除指定视图左侧的所有标签
 */
async delLeftTags(view: RouteLocationNormalized) {
  // 类似实现，保留 idx >= index 的视图
}
```

### delAllViews - 删除所有视图

```typescript
/**
 * 删除所有视图
 * @description 保留固定的已访问视图，清空所有缓存
 */
async delAllViews() {
  await this.delAllVisitedViews()
  await this.delAllCachedViews()
  return {
    visitedViews: this.getVisitedViews(),
    cachedViews: this.getCachedViews()
  }
}

/**
 * 删除所有已访问视图
 * @description 只保留固定的视图（meta.affix=true）
 */
async delAllVisitedViews() {
  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (tag) => tag.meta?.affix
  )
  return this.getVisitedViews()
}
```

**标签视图使用示例:**

```vue
<template>
  <div class="tags-view-container">
    <scroll-pane>
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="tag.path"
        class="tags-view-item"
        :class="{ active: isActive(tag) }"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <span
          v-if="!isAffix(tag)"
          class="close-icon"
          @click.prevent.stop="closeSelectedTag(tag)"
        >×</span>
      </router-link>
    </scroll-pane>

    <!-- 右键菜单 -->
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }">
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags">关闭其他</li>
      <li @click="closeRightTags">关闭右侧</li>
      <li @click="closeLeftTags">关闭左侧</li>
      <li @click="closeAllTags">关闭所有</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const route = useRoute()
const router = useRouter()
const layout = useLayout()

const visitedViews = computed(() => layout.visitedViews.value)

const isActive = (tag) => tag.path === route.path
const isAffix = (tag) => tag.meta?.affix

const closeSelectedTag = async (tag) => {
  const { visitedViews } = await layout.delView(tag)
  if (isActive(tag)) {
    toLastView(visitedViews)
  }
}

const closeOthersTags = async () => {
  await layout.delOthersViews(route)
}

const closeRightTags = async () => {
  await layout.delRightTags(route)
}

const closeLeftTags = async () => {
  await layout.delLeftTags(route)
}

const closeAllTags = async () => {
  const { visitedViews } = await layout.delAllViews()
  toLastView(visitedViews)
}

const toLastView = (visitedViews) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    router.push('/')
  }
}
</script>
```

## 配置持久化

### 存储机制

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

```typescript
/**
 * 保存布局设置
 * @param newConfig 新的布局配置，为空则重置为默认配置
 */
const saveSettings = (newConfig?: Partial<LayoutSetting>): void => {
  if (newConfig) {
    Object.assign(state.config, newConfig)
  } else {
    state.config = { ...DEFAULT_CONFIG }
  }
}

/**
 * 重置所有配置为系统默认值
 */
const resetConfig = (): void => {
  state.config = { ...DEFAULT_CONFIG }
}
```

**使用示例:**

```vue
<template>
  <div class="settings-panel">
    <el-form :model="form" label-width="100px">
      <el-form-item label="主题色">
        <el-color-picker v-model="form.theme" @change="handleThemeChange" />
      </el-form-item>

      <el-form-item label="暗黑模式">
        <el-switch v-model="form.dark" @change="handleDarkChange" />
      </el-form-item>

      <el-form-item label="标签视图">
        <el-switch v-model="form.tagsView" />
      </el-form-item>

      <el-form-item label="固定头部">
        <el-switch v-model="form.fixedHeader" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
        <el-button @click="resetSettings">恢复默认</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { useTheme } from '@/composables/useTheme'

const layout = useLayout()
const { setTheme } = useTheme()

const form = reactive({
  theme: layout.theme.value,
  dark: layout.dark.value,
  tagsView: layout.tagsView.value,
  fixedHeader: layout.fixedHeader.value
})

// 主题色变化
const handleThemeChange = (color: string) => {
  setTheme(color)
}

// 暗黑模式变化
const handleDarkChange = (value: boolean) => {
  layout.toggleDark(value)
}

// 保存设置
const saveSettings = () => {
  layout.saveSettings(form)
}

// 重置设置
const resetSettings = () => {
  layout.resetConfig()
  // 重新同步表单
  Object.assign(form, {
    theme: layout.theme.value,
    dark: layout.dark.value,
    tagsView: layout.tagsView.value,
    fixedHeader: layout.fixedHeader.value
  })
}

// 监听布局变化同步到表单
watch(() => layout.state, (state) => {
  form.theme = state.config.theme
  form.dark = state.config.dark
  form.tagsView = state.config.tagsView
  form.fixedHeader = state.config.fixedHeader
}, { deep: true })
</script>
```

## 文档标题管理

### 动态标题更新

```typescript
const appTitle = SystemConfig.app.title

/**
 * 更新浏览器标签页标题
 * @description 根据动态标题设置决定显示格式
 * - 启用动态标题: "当前页面标题 - 应用名称"
 * - 禁用动态标题: 使用系统默认标题
 */
const updateDocumentTitle = (): void => {
  document.title = dynamicTitle.value
    ? `${state.title} - ${appTitle}`
    : SystemConfig.ui.title
}

// 监听动态标题设置和当前标题变化
watch([dynamicTitle, () => state.title], updateDocumentTitle)

// 初始化时设置文档标题
updateDocumentTitle()
```

### setTitle / resetTitle

```typescript
/**
 * 设置当前页面标题
 * @param value 页面标题，为空则不更新
 */
const setTitle = (value: string): void => {
  if (!value) return
  state.title = value
  updateDocumentTitle()
}

/**
 * 重置页面标题为系统默认标题
 */
const resetTitle = (): void => {
  state.title = SystemConfig.ui.title
  updateDocumentTitle()
}
```

**使用示例:**

```typescript
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 在路由守卫中设置标题
router.afterEach((to) => {
  if (to.meta?.title) {
    layout.setTitle(to.meta.title as string)
  }
})

// 手动设置标题
layout.setTitle('用户管理')

// 重置为默认标题
layout.resetTitle()
```

## 使用示例

### 基础用法

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { useLayout } from '@/composables/useLayout'

const { currentTheme, setTheme, getLightColor, getDarkColor } = useTheme()
const layout = useLayout()

// 设置主题色
setTheme('#1890ff')

// 切换暗黑模式
layout.toggleDark(true)

// 生成颜色变体
const hoverColor = getLightColor('#1890ff', 0.2)  // 悬停色
const activeColor = getDarkColor('#1890ff', 0.1)  // 按下色
</script>
```

### 主题色选择器

```vue
<template>
  <div class="theme-picker">
    <!-- 预设颜色 -->
    <div class="preset-colors">
      <div
        v-for="color in presetColors"
        :key="color"
        class="color-item"
        :style="{ backgroundColor: color }"
        :class="{ active: color === currentTheme }"
        @click="setTheme(color)"
      >
        <el-icon v-if="color === currentTheme"><Check /></el-icon>
      </div>
    </div>

    <!-- 自定义颜色 -->
    <div class="custom-color">
      <span class="label">自定义</span>
      <el-color-picker
        v-model="customColor"
        :predefine="presetColors"
        @change="handleCustomColorChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, setTheme } = useTheme()

const presetColors = [
  '#5d87ff',  // 默认蓝
  '#1890ff',  // 科技蓝
  '#13c2c2',  // 青色
  '#52c41a',  // 成功绿
  '#faad14',  // 警告黄
  '#f5222d',  // 错误红
  '#722ed1',  // 紫色
  '#eb2f96',  // 粉红
]

const customColor = ref(currentTheme.value)

const handleCustomColorChange = (color: string) => {
  if (color) {
    setTheme(color)
  }
}

// 监听主题变化，同步自定义颜色
watch(currentTheme, (newColor) => {
  customColor.value = newColor
})
</script>

<style lang="scss" scoped>
.theme-picker {
  .preset-colors {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    .color-item {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.1);
      }

      &.active {
        box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
      }
    }
  }

  .custom-color {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      color: var(--el-text-color-regular);
    }
  }
}
</style>
```

### 暗黑模式切换

```vue
<template>
  <div class="dark-mode-switch">
    <el-switch
      v-model="dark"
      :active-action-icon="Moon"
      :inactive-action-icon="Sunny"
      @change="handleDarkChange"
    />
    <span class="label">{{ dark ? '暗黑模式' : '明亮模式' }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

const dark = computed({
  get: () => layout.dark.value,
  set: (value) => layout.toggleDark(value)
})

const handleDarkChange = (value: boolean) => {
  // 可以添加过渡动画效果
  document.documentElement.classList.add('theme-transition')
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 300)
}
</script>

<style lang="scss">
// 全局样式 - 主题切换过渡
.theme-transition {
  *,
  *::before,
  *::after {
    transition: background-color 0.3s, color 0.3s, border-color 0.3s !important;
  }
}
</style>
```

### 自定义组件适配主题

```vue
<template>
  <div class="custom-card" :style="cardStyle">
    <div class="card-header" :style="headerStyle">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, getLightColor, addAlphaToHex } = useTheme()

const cardStyle = computed(() => ({
  '--card-bg': getLightColor(currentTheme.value, 0.95),
  '--card-border': addAlphaToHex(currentTheme.value, 0.2),
  '--card-shadow': addAlphaToHex(currentTheme.value, 0.1)
}))

const headerStyle = computed(() => ({
  backgroundColor: getLightColor(currentTheme.value, 0.9),
  borderColor: addAlphaToHex(currentTheme.value, 0.3)
}))
</script>

<style lang="scss" scoped>
.custom-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-shadow: 0 2px 12px var(--card-shadow);
  overflow: hidden;

  .card-header {
    padding: 16px;
    border-bottom: 1px solid;
  }

  .card-body {
    padding: 16px;
  }
}
</style>
```

### 完整布局控制面板

```vue
<template>
  <el-drawer v-model="visible" title="系统配置" :size="280">
    <!-- 主题设置 -->
    <el-divider>主题设置</el-divider>

    <div class="setting-item">
      <span>主题色</span>
      <el-color-picker
        v-model="layout.theme.value"
        :predefine="presetColors"
        @change="handleThemeChange"
      />
    </div>

    <div class="setting-item">
      <span>暗黑模式</span>
      <el-switch v-model="layout.dark.value" @change="layout.toggleDark" />
    </div>

    <div class="setting-item">
      <span>侧边栏主题</span>
      <el-select v-model="layout.sideTheme.value">
        <el-option label="暗色" value="theme-dark" />
        <el-option label="亮色" value="theme-light" />
      </el-select>
    </div>

    <!-- 布局设置 -->
    <el-divider>布局设置</el-divider>

    <div class="setting-item">
      <span>菜单布局</span>
      <el-select v-model="layout.menuLayout.value">
        <el-option label="垂直" value="vertical" />
        <el-option label="水平" value="horizontal" />
        <el-option label="混合" value="mixed" />
      </el-select>
    </div>

    <div class="setting-item">
      <span>显示标签页</span>
      <el-switch v-model="layout.tagsView.value" />
    </div>

    <div class="setting-item">
      <span>固定头部</span>
      <el-switch v-model="layout.fixedHeader.value" />
    </div>

    <div class="setting-item">
      <span>侧边栏Logo</span>
      <el-switch v-model="layout.sidebarLogo.value" />
    </div>

    <div class="setting-item">
      <span>动态标题</span>
      <el-switch v-model="layout.dynamicTitle.value" />
    </div>

    <!-- 功能设置 -->
    <el-divider>功能设置</el-divider>

    <div class="setting-item">
      <span>组件尺寸</span>
      <el-select v-model="layout.size.value" @change="layout.setSize">
        <el-option label="大" value="large" />
        <el-option label="默认" value="default" />
        <el-option label="小" value="small" />
      </el-select>
    </div>

    <div class="setting-item">
      <span>界面语言</span>
      <el-select v-model="layout.language.value" @change="layout.changeLanguage">
        <el-option label="简体中文" value="zh_CN" />
        <el-option label="English" value="en_US" />
      </el-select>
    </div>

    <div class="setting-item">
      <span>显示水印</span>
      <el-switch v-model="layout.watermark.value" />
    </div>

    <!-- 操作按钮 -->
    <div class="setting-actions">
      <el-button @click="handleReset">恢复默认</el-button>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { useTheme } from '@/composables/useTheme'

const visible = defineModel<boolean>()

const layout = useLayout()
const { setTheme } = useTheme()

const presetColors = [
  '#5d87ff', '#1890ff', '#13c2c2',
  '#52c41a', '#faad14', '#f5222d'
]

const handleThemeChange = (color: string) => {
  if (color) {
    setTheme(color)
  }
}

const handleReset = () => {
  layout.resetConfig()
  setTheme(layout.theme.value)
}
</script>

<style lang="scss" scoped>
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  span {
    color: var(--el-text-color-regular);
  }
}

.setting-actions {
  margin-top: 24px;
  text-align: center;
}
</style>
```

## 最佳实践

### 1. 使用 CSS 变量

```scss
// ✅ 推荐: 使用 CSS 变量
.my-component {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-color: var(--el-color-primary);

  &:hover {
    background-color: var(--el-color-primary-light-9);
  }

  &:active {
    background-color: var(--el-color-primary-light-7);
  }
}

// ❌ 避免: 硬编码颜色
.my-component {
  background-color: #ffffff;
  color: #303133;
  border-color: #5d87ff;
}
```

### 2. 暗黑模式适配

```scss
.my-component {
  // 基础样式使用 CSS 变量
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);

  // 图片资源适配暗黑模式
  background-image: url('@/assets/images/bg-light.png');

  html.dark & {
    background-image: url('@/assets/images/bg-dark.png');
  }

  // 或使用 CSS 变量控制
  --component-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  html.dark & {
    --component-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  box-shadow: var(--component-shadow);
}
```

### 3. 初始化时应用主题

```typescript
// main.ts
import { useTheme } from '@/composables/useTheme'
import { useLayout } from '@/composables/useLayout'

// 在 createApp 之前同步应用主题，避免闪烁
const initTheme = () => {
  const theme = localStorage.getItem('layout-config')
  if (theme) {
    try {
      const { theme: themeColor, dark } = JSON.parse(theme)
      // 立即应用主题色
      document.documentElement.style.setProperty('--el-color-primary', themeColor)
      // 立即应用暗黑模式
      if (dark) {
        document.documentElement.classList.add('dark')
      }
    } catch (e) {
      console.warn('Failed to parse theme config:', e)
    }
  }
}

initTheme()

const app = createApp(App)

// 应用挂载后，初始化主题系统
app.mount('#app')

// 确保主题系统初始化
const layout = useLayout()
const { setTheme } = useTheme()
setTheme(layout.theme.value)
```

### 4. 响应式主题样式

```vue
<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, getLightColor, addAlphaToHex } = useTheme()

// ✅ 使用 computed 确保响应式
const buttonStyle = computed(() => ({
  '--btn-bg': currentTheme.value,
  '--btn-hover': getLightColor(currentTheme.value, 0.1),
  '--btn-active': getLightColor(currentTheme.value, 0.2)
}))

// ✅ 或使用 watchEffect 动态更新自定义变量
watchEffect(() => {
  document.documentElement.style.setProperty(
    '--custom-primary',
    currentTheme.value
  )
  document.documentElement.style.setProperty(
    '--custom-primary-hover',
    getLightColor(currentTheme.value, 0.1)
  )
})
</script>
```

### 5. 避免主题切换闪烁

```typescript
// 使用 CSS 过渡平滑切换
const smoothThemeTransition = () => {
  const el = document.documentElement

  // 添加过渡类
  el.classList.add('theme-transition')

  // 在过渡完成后移除
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.classList.remove('theme-transition')
      }, 300)
    })
  })
}

// 在切换主题时调用
const handleThemeChange = (color: string) => {
  smoothThemeTransition()
  setTheme(color)
}
```

```scss
// 全局样式
.theme-transition {
  *,
  *::before,
  *::after {
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease !important;
  }
}
```

## 常见问题

### 1. 主题色切换后页面闪烁

**问题原因:**
- CSS 变量异步应用导致初始渲染使用默认值
- 主题配置加载晚于组件渲染

**解决方案:**

```typescript
// 在 index.html 的 <head> 中添加内联脚本
<script>
  (function() {
    try {
      const config = localStorage.getItem('layout-config')
      if (config) {
        const { theme, dark } = JSON.parse(config)
        if (theme) {
          document.documentElement.style.setProperty('--el-color-primary', theme)
        }
        if (dark) {
          document.documentElement.classList.add('dark')
        }
      }
    } catch (e) {}
  })()
</script>
```

### 2. 暗黑模式样式不生效

**问题原因:**
- 未使用 CSS 变量
- 未定义暗黑模式样式
- `.dark` 类选择器优先级不够

**解决方案:**

```scss
// 方案1: 使用 Element Plus 变量
.component {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

// 方案2: 自定义暗黑样式
.component {
  background: #ffffff;

  html.dark & {
    background: #1a1a1a;
  }
}

// 方案3: 使用 CSS 变量统一管理
:root {
  --custom-bg: #ffffff;
  --custom-text: #333333;
}

html.dark {
  --custom-bg: #1a1a1a;
  --custom-text: #e5e5e5;
}

.component {
  background: var(--custom-bg);
  color: var(--custom-text);
}
```

### 3. Element Plus 组件未跟随主题

**问题原因:**
- 未正确设置 CSS 变量
- 组件使用了固定的 `type` 属性
- CSS 变量优先级被覆盖

**解决方案:**

```vue
<!-- 使用 type="primary" 会自动跟随主题色 -->
<el-button type="primary">按钮</el-button>

<!-- 自定义颜色使用响应式变量 -->
<template>
  <el-button :style="{ backgroundColor: currentTheme }">
    自定义
  </el-button>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
const { currentTheme } = useTheme()
</script>
```

### 4. 颜色变体计算不符预期

**问题原因:**
- `level` 参数理解错误
- 颜色格式不正确

**说明:**

| level | getLightColor | getDarkColor |
|-------|---------------|--------------|
| 0.1 | 稍微调亮 (接近原色) | 稍微调暗 (接近原色) |
| 0.5 | 明显调亮 (中间色) | 明显调暗 (中间色) |
| 0.9 | 接近白色 | 接近黑色 |

```typescript
const color = '#1890ff'

// 亮色变体示例
getLightColor(color, 0.1)  // 稍亮
getLightColor(color, 0.5)  // 中等亮度
getLightColor(color, 0.9)  // 接近白色

// 暗色变体示例
getDarkColor(color, 0.1)   // 稍暗
getDarkColor(color, 0.5)   // 中等暗度
getDarkColor(color, 0.9)   // 接近黑色
```

### 5. 标签视图缓存失效

**问题原因:**
- 组件 `name` 与路由 `name` 不一致
- 路由设置了 `noCache: true`
- 动态路由处理不当

**解决方案:**

```typescript
// 确保组件名称与路由名称一致
// router.ts
{
  path: '/user/list',
  name: 'UserList',  // 路由名称
  component: () => import('@/views/user/list.vue'),
  meta: {
    title: '用户列表',
    noCache: false  // 确保没有禁用缓存
  }
}

// views/user/list.vue
<script setup lang="ts">
defineOptions({
  name: 'UserList'  // 组件名称必须一致
})
</script>
```

## API 参考

### useTheme 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| currentTheme | `Ref<string>` | 当前主题色 |
| setTheme | `(color: string) => void` | 设置主题色 |
| resetTheme | `() => void` | 重置主题 |
| generateThemeColors | `(color: string) => ThemeColors` | 生成完整色系 |
| getLightColor | `(color: string, level: number) => string` | 生成亮色变体 |
| getDarkColor | `(color: string, level: number) => string` | 生成暗色变体 |
| addAlphaToHex | `(hex: string, alpha: number) => string` | 添加透明度 |

### useLayout 返回值

**只读状态:**

| 属性 | 类型 | 说明 |
|------|------|------|
| state | `DeepReadonly<LayoutState>` | 完整状态对象（只读） |
| device | `ComputedRef<DeviceType>` | 当前设备类型 |
| sidebar | `ComputedRef<SidebarState>` | 侧边栏状态 |
| title | `ComputedRef<string>` | 当前页面标题 |
| showSettings | `ComputedRef<boolean>` | 是否显示设置面板 |
| animationEnable | `ComputedRef<boolean>` | 是否启用动画 |
| visitedViews | `ComputedRef<RouteLocationNormalized[]>` | 已访问视图列表 |
| cachedViews | `ComputedRef<string[]>` | 缓存的视图名称列表 |
| iframeViews | `ComputedRef<RouteLocationNormalized[]>` | iframe 视图列表 |

**可写配置:**

| 属性 | 类型 | 说明 |
|------|------|------|
| theme | `WritableComputedRef<string>` | 主题色 |
| sideTheme | `WritableComputedRef<SideTheme>` | 侧边栏主题 |
| dark | `WritableComputedRef<boolean>` | 暗黑模式 |
| topNav | `WritableComputedRef<boolean>` | 顶部导航 |
| menuLayout | `WritableComputedRef<MenuLayoutMode>` | 菜单布局模式 |
| tagsView | `WritableComputedRef<boolean>` | 标签视图 |
| fixedHeader | `WritableComputedRef<boolean>` | 固定头部 |
| sidebarLogo | `WritableComputedRef<boolean>` | 侧边栏Logo |
| dynamicTitle | `WritableComputedRef<boolean>` | 动态标题 |
| size | `WritableComputedRef<ElSize>` | 组件尺寸 |
| language | `WritableComputedRef<LanguageCode>` | 界面语言 |
| locale | `ComputedRef<LocaleType>` | Element Plus 本地化配置 |
| watermark | `WritableComputedRef<boolean>` | 是否显示水印 |
| watermarkContent | `WritableComputedRef<string>` | 水印内容 |
| showSelectValue | `WritableComputedRef<boolean>` | 选择器显示值 |

**侧边栏方法:**

| 方法 | 类型 | 说明 |
|------|------|------|
| toggleSideBar | `(withoutAnimation?: boolean) => void` | 切换侧边栏 |
| openSideBar | `(withoutAnimation?: boolean) => void` | 打开侧边栏 |
| closeSideBar | `(withoutAnimation?: boolean) => void` | 关闭侧边栏 |
| toggleSideBarHide | `(status: boolean) => void` | 设置侧边栏隐藏 |

**设备和偏好方法:**

| 方法 | 类型 | 说明 |
|------|------|------|
| toggleDevice | `(device: DeviceType) => void` | 切换设备类型 |
| setSize | `(size: ElSize) => void` | 设置组件尺寸 |
| changeLanguage | `(lang: LanguageCode) => void` | 切换语言 |
| toggleDark | `(value: boolean) => void` | 切换暗黑模式 |
| setTitle | `(value: string) => void` | 设置页面标题 |
| resetTitle | `() => void` | 重置页面标题 |
| saveSettings | `(config?: Partial<LayoutSetting>) => void` | 保存设置 |
| resetConfig | `() => void` | 重置所有配置 |

**标签视图方法:**

| 方法 | 类型 | 说明 |
|------|------|------|
| addView | `(view: RouteLocationNormalized) => void` | 添加视图 |
| addVisitedView | `(view: RouteLocationNormalized) => void` | 添加已访问视图 |
| addCachedView | `(view: RouteLocationNormalized) => void` | 添加缓存视图 |
| addIframeView | `(view: RouteLocationNormalized) => void` | 添加 iframe 视图 |
| delView | `(view: RouteLocationNormalized) => Promise<ViewLists>` | 删除视图 |
| delVisitedView | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除已访问视图 |
| delCachedView | `(view?: RouteLocationNormalized) => Promise<string[]>` | 删除缓存视图 |
| delIframeView | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除 iframe 视图 |
| delOthersViews | `(view: RouteLocationNormalized) => Promise<ViewLists>` | 删除其他视图 |
| delRightTags | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除右侧标签 |
| delLeftTags | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除左侧标签 |
| delAllViews | `() => Promise<ViewLists>` | 删除所有视图 |
| updateVisitedView | `(view: RouteLocationNormalized) => void` | 更新视图信息 |
| getVisitedViews | `() => RouteLocationNormalized[]` | 获取已访问视图 |
| getCachedViews | `() => string[]` | 获取缓存视图 |
| getIframeViews | `() => RouteLocationNormalized[]` | 获取 iframe 视图 |
| isDynamicRoute | `(view: RouteLocationNormalized) => boolean` | 判断动态路由 |

## 总结

主题状态管理系统通过 `useTheme` 和 `useLayout` 协同工作，提供完整的主题定制能力：

1. **主题色系统**: 自动生成 18 个颜色变体，覆盖 Element Plus 全部主题需求
2. **暗黑模式**: 与 VueUse 深度集成，实现流畅的明暗切换
3. **响应式布局**: 自动适配不同设备，动态调整侧边栏和菜单布局
4. **标签视图**: 完整的多标签页管理，支持缓存、固定、批量操作
5. **持久化**: 自动保存用户偏好，跨会话保持配置
6. **类型安全**: 完整的 TypeScript 类型定义

**使用建议：**

- 优先使用 CSS 变量而非硬编码颜色
- 在应用初始化时同步应用主题配置，避免闪烁
- 使用 computed 确保样式响应式更新
- 确保组件 name 与路由 name 一致以支持缓存
- 合理使用 `noCache` 控制视图缓存策略
