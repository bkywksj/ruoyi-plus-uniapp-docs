# 布局系统概述

## 介绍

布局系统是 RuoYi-Plus-UniApp 管理端前端应用的核心骨架，负责页面整体结构组织、导航管理、主题控制和响应式适配。系统采用 Vue 3 + TypeScript + Composition API 架构，提供灵活可扩展的布局解决方案。

**核心特性:**

- **多布局模式** - 支持垂直、水平、混合三种菜单布局模式
- **主题系统** - 亮色/暗色主题切换，支持自定义主题色
- **响应式设计** - 自动适配桌面端和移动端设备
- **多标签管理** - TagsView 标签页系统，支持缓存和快捷操作
- **状态持久化** - 布局配置自动保存到 localStorage
- **权限集成** - 与路由权限深度集成，动态菜单渲染
- **实时通信** - 集成 WebSocket 和 SSE 实时消息推送

## 整体架构

### 布局类型

系统包含两套主要布局:

| 布局组件 | 文件路径 | 使用场景 |
|---------|---------|---------|
| Layout | `layouts/Layout.vue` | 管理后台主布局，功能完整 |
| HomeLayout | `layouts/HomeLayout.vue` | 前台展示页面，结构简洁 |

### 目录结构

```text
layouts/
├── Layout.vue                    # 主布局容器
├── HomeLayout.vue               # 前台简洁布局
└── components/
    ├── AppMain/                 # 主内容区
    │   ├── AppMain.vue         # 内容路由渲染
    │   ├── ParentView.vue      # 父级视图容器
    │   └── iframe/             # iframe 内嵌页面
    │       ├── IframeToggle.vue # iframe 切换组件
    │       └── InnerLink.vue    # 内部链接组件
    ├── Navbar/                  # 顶部导航栏
    │   ├── Navbar.vue          # 导航栏主体
    │   ├── TopNav.vue          # 水平导航菜单
    │   ├── Breadcrumb.vue      # 面包屑导航
    │   ├── Hamburger.vue       # 汉堡菜单按钮
    │   └── tools/              # 导航栏工具集
    │       ├── AiChat.vue      # AI 聊天助手
    │       ├── DocLink.vue     # 文档链接
    │       ├── FullscreenToggle.vue # 全屏切换
    │       ├── GitLink.vue     # Git 链接
    │       ├── LangSelect.vue  # 语言选择
    │       ├── LayoutSetting.vue # 布局设置
    │       ├── NavbarSearch.vue # 导航搜索
    │       ├── Notice.vue      # 通知消息
    │       ├── RefreshButton.vue # 刷新按钮
    │       ├── SizeSelect.vue  # 尺寸选择
    │       ├── TenantSelect.vue # 租户选择
    │       └── UserDropdown.vue # 用户下拉菜单
    ├── Sidebar/                 # 侧边栏系统
    │   ├── Sidebar.vue         # 侧边栏容器
    │   ├── SidebarItem.vue     # 菜单项组件
    │   ├── Logo.vue            # 应用 Logo
    │   └── AppLink.vue         # 智能链接组件
    ├── TagsView/               # 标签视图系统
    │   ├── TagsView.vue        # 标签页管理
    │   └── ScrollPane.vue      # 滚动容器
    └── Settings/               # 设置面板
        └── Settings.vue        # 主题设置抽屉
```

## 核心组件详解

### Layout 主布局

Layout 是管理后台的主布局容器，协调所有子组件的渲染和交互。

#### 组件结构

```vue
<template>
  <div class="app-wrapper" :class="classObj" :style="{ '--current-color': theme }">
    <!-- 移动端遮罩层 -->
    <div v-if="device === 'mobile' && sidebar.opened"
         class="drawer-bg"
         @click="handleClickOutside" />

    <!-- 侧边栏 (非水平模式显示) -->
    <Sidebar v-if="showSidebar" class="sidebar-container" />

    <!-- 主内容区 -->
    <div class="main-container" :class="mainContainerClass">
      <!-- 固定头部区域 -->
      <div :class="{ 'fixed-header': fixedHeader }">
        <Navbar ref="navbarRef" @set-layout="setLayout" />
        <TagsView v-if="needTagsView" />
      </div>

      <!-- 页面内容 -->
      <AppMain />

      <!-- 设置面板 -->
      <Settings ref="settingRef" />
    </div>

    <!-- 水印组件 -->
    <AWatermark :visible="watermarkVisible" :content="watermarkContentText" />
  </div>
</template>
```

#### 核心功能

**1. 设备检测与响应式**

```typescript
const { width } = useWindowSize()

// 992px 断点区分移动端和桌面端
watch(
  () => width.value,
  (newWidth) => {
    if (newWidth < 992) {
      layout.toggleDevice('mobile')
      layout.closeSideBar(true)
    } else {
      layout.toggleDevice('desktop')
    }
  },
  { immediate: true }
)
```

**2. 动态类名计算**

```typescript
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
  dark: dark.value,
  [`layout-${menuLayout.value}`]: true,
}))
```

**3. 侧边栏显示逻辑**

```typescript
const showSidebar = computed(() => {
  // 水平布局模式下隐藏侧边栏
  if (menuLayout.value === MenuLayoutMode.Horizontal) {
    return false
  }
  // 侧边栏未隐藏时显示
  return !sidebar.value.hide
})
```

**4. 实时通信初始化**

```typescript
onMounted(() => {
  // 初始化 WebSocket 连接
  initWebSocket()
  // 初始化 SSE 连接
  initSSE()
})
```

### Sidebar 侧边栏

侧边栏组件负责菜单渲染、Logo 展示和主题样式控制。

#### 组件结构

```vue
<template>
  <div :class="{ 'has-logo': showLogo }" :style="{ backgroundColor: background }">
    <!-- Logo 区域 -->
    <Logo v-if="showLogo" :collapse="isCollapse" />

    <!-- 可滚动菜单区域 -->
    <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="background"
        :text-color="textColor"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        mode="vertical"
      >
        <!-- 递归渲染菜单项 -->
        <SidebarItem
          v-for="(route, index) in sidebarRoutes"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>
```

#### 主题样式

侧边栏支持亮色和暗色两种主题:

```typescript
// 亮色主题
const lightColors = {
  background: '#ffffff',
  textColor: '#333639'
}

// 暗色主题 (从 SCSS 变量获取)
const darkColors = computed(() => ({
  background: getComputedStyle(document.documentElement)
    .getPropertyValue('--side-bar-bg-color').trim(),
  textColor: getComputedStyle(document.documentElement)
    .getPropertyValue('--side-bar-text-color').trim()
}))
```

#### 菜单激活逻辑

```typescript
const activeMenu = computed(() => {
  const { path, meta } = route
  // 支持自定义激活路径
  if (meta?.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})
```

### Navbar 导航栏

导航栏是布局顶部的核心组件，包含菜单切换、导航工具和用户操作。

#### 组件结构

```vue
<template>
  <div class="h-50px w-full flex items-center justify-between navbar-border">
    <!-- 左侧区域 -->
    <div class="h-full flex items-center navbar-left">
      <!-- 水平模式: Logo + 刷新按钮 -->
      <div v-if="isHorizontalLayout" class="flex items-center h-full navbar-logo">
        <Logo v-if="layout.sidebarLogo.value" :collapse="width < 768" />
        <RefreshButton />
      </div>

      <!-- 垂直/混合模式: 汉堡菜单 + 刷新按钮 -->
      <div v-else class="flex items-center h-full ml-2">
        <Hamburger :is-active="layout.sidebar.value.opened" @toggle-click="toggleSideBar" />
        <RefreshButton />
      </div>

      <!-- 导航内容: 顶部导航或面包屑 -->
      <div class="navbar-content flex-1 min-w-0">
        <TopNav v-if="layout.topNav.value" />
        <div v-else class="h-full flex items-center">
          <Breadcrumb />
        </div>
      </div>
    </div>

    <!-- 右侧工具栏 -->
    <div class="h-full flex items-center navbar-tools">
      <template v-if="layout.device.value !== 'mobile'">
        <TenantSelect v-if="width > 1200" @tenant-change="onTenantChange" />
        <NavbarSearch v-if="width > 768" />
        <FullscreenToggle v-if="width > 1024" />
        <Notice v-if="width > 768" />
        <AiChat v-if="width > 768" />
        <LangSelect v-if="width > 1024" />
        <LayoutSetting @set-layout="setLayout" />
      </template>

      <!-- 移动端简化工具栏 -->
      <template v-else>
        <LayoutSetting @set-layout="setLayout" />
      </template>

      <!-- 用户下拉菜单 -->
      <UserDropdown :is-dynamic-tenant="isDynamicTenant" />
    </div>
  </div>
</template>
```

#### 响应式断点

| 断点 | 显示组件 |
|------|---------|
| > 1200px | TenantSelect, 所有工具 |
| > 1024px | FullscreenToggle, LangSelect |
| > 768px | NavbarSearch, Notice, AiChat |
| ≤ 768px | 仅 LayoutSetting + UserDropdown |

#### 水平模式主题切换

```typescript
// 水平布局模式自动切换为浅色菜单
watch(
  () => layout.menuLayout.value,
  (newLayout) => {
    if (newLayout === MenuLayoutMode.Horizontal) {
      layout.sideTheme.value = SideTheme.Light
    }
  },
  { immediate: false }
)
```

### TagsView 标签视图

TagsView 实现多标签页管理，支持页面缓存、快捷操作和右键菜单。

#### 核心功能

**1. 标签渲染**

```vue
<template>
  <div class="tags-view-container">
    <ScrollPane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        :class="isActive(tag) ? 'active' : ''"
        class="tags-view-item"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.meta?.title }}
        <!-- 非固定标签显示关闭按钮 -->
        <span v-if="!isAffix(tag)" class="icon-close" @click.prevent.stop="closeSelectedTag(tag)">
          <Close class="el-icon" />
        </span>
      </router-link>
    </ScrollPane>

    <!-- 右键菜单 -->
    <ul v-show="visible" :style="menuStyle" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        <Refresh /> {{ t('tagsView.refresh') }}
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <Close /> {{ t('tagsView.close') }}
      </li>
      <li @click="closeOthersTags">
        <CircleClose /> {{ t('tagsView.closeOthers') }}
      </li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <Back /> {{ t('tagsView.closeLeft') }}
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
        <Right /> {{ t('tagsView.closeRight') }}
      </li>
      <li @click="closeAllTags(selectedTag)">
        <CircleClose /> {{ t('tagsView.closeAll') }}
      </li>
    </ul>
  </div>
</template>
```

**2. 固定标签处理**

```typescript
// 初始化固定标签 (affix: true 的路由)
const initTags = () => {
  const affixTags = filterAffixTags(routes.value)
  for (const tag of affixTags) {
    if (tag.name) {
      layout.addVisitedView(tag)
    }
  }
}

// 过滤固定标签
const filterAffixTags = (routes: RouteRecordRaw[], basePath = '/') => {
  let tags: RouteLocationNormalized[] = []
  routes.forEach((route) => {
    if (route.meta?.affix) {
      const tagPath = path.resolve(basePath, route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta },
      } as RouteLocationNormalized)
    }
    if (route.children) {
      const childTags = filterAffixTags(route.children, route.path)
      if (childTags.length >= 1) {
        tags = [...tags, ...childTags]
      }
    }
  })
  return tags
}
```

**3. 右键菜单操作**

```typescript
// 刷新当前标签
const refreshSelectedTag = (view: RouteLocationNormalized) => {
  layout.delCachedView(view)
  nextTick(() => {
    router.replace({ path: '/redirect' + view.fullPath })
  })
}

// 关闭其他标签
const closeOthersTags = () => {
  router.push(selectedTag.value!)
  layout.delOthersViews(selectedTag.value!)
  moveToCurrentTag()
}

// 关闭左侧标签
const closeLeftTags = () => {
  layout.delLeftViews(selectedTag.value!)
}

// 关闭右侧标签
const closeRightTags = () => {
  layout.delRightViews(selectedTag.value!)
}

// 关闭所有标签
const closeAllTags = (view: RouteLocationNormalized) => {
  layout.delAllViews()
  if (affixTags.value.some((tag) => tag.path === route.path)) {
    return
  }
  toLastView(layout.visitedViews.value, view)
}
```

**4. 滚动定位**

```typescript
// 移动到当前激活的标签
const moveToCurrentTag = () => {
  nextTick(() => {
    for (const r of visitedViews.value) {
      if (r.path === route.path) {
        scrollPaneRef.value?.moveToTarget(r.path)
        if (r.fullPath !== route.fullPath) {
          layout.updateVisitedView(route)
        }
      }
    }
  })
}
```

### AppMain 内容区

AppMain 负责渲染路由内容，支持页面缓存和过渡动画。

#### 组件结构

```vue
<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route: currentRoute }">
      <transition :name="transitionName" mode="out-in">
        <keep-alive :include="cachedViews">
          <component
            :is="Component"
            v-if="!currentRoute.meta?.link"
            :key="currentRoute.path"
          />
        </keep-alive>
      </transition>
    </router-view>

    <!-- iframe 内嵌页面 -->
    <IframeToggle />
  </section>
</template>
```

#### 缓存策略

```typescript
// 从 useLayout 获取缓存的视图列表
const cachedViews = computed(() => layout.cachedViews.value)

// keep-alive 根据组件 name 进行缓存
// 组件 name 必须与路由配置中的 name 一致
```

#### 过渡动画

```typescript
const { animationEnable } = useLayout()
const { getTransitionName } = useAnimation()

// 获取随机过渡动画名称
const transitionName = computed(() => {
  if (!animationEnable.value) {
    return ''
  }
  return getTransitionName()
})
```

### Settings 设置面板

Settings 提供可视化的主题配置界面，支持实时预览和持久化保存。

#### 配置项

**1. 主题风格**

```vue
<div class="setting-section">
  <h4>{{ t('settings.themeStyle') }}</h4>
  <div class="theme-options">
    <el-tooltip :content="t('settings.light')">
      <div class="theme-item" :class="{ active: !dark }" @click="handleThemeChange(false)">
        <SunOne theme="outline" size="20" />
      </div>
    </el-tooltip>
    <el-tooltip :content="t('settings.dark')">
      <div class="theme-item" :class="{ active: dark }" @click="handleThemeChange(true)">
        <Moon theme="outline" size="20" />
      </div>
    </el-tooltip>
  </div>
</div>
```

**2. 菜单布局**

```vue
<div class="setting-section">
  <h4>{{ t('settings.menuLayout') }}</h4>
  <div class="layout-options">
    <!-- 垂直布局 -->
    <el-tooltip :content="t('settings.vertical')">
      <div class="layout-item" :class="{ active: menuLayout === 'vertical' }"
           @click="handleLayoutChange('vertical')">
        <LayoutVertical />
      </div>
    </el-tooltip>
    <!-- 水平布局 -->
    <el-tooltip :content="t('settings.horizontal')">
      <div class="layout-item" :class="{ active: menuLayout === 'horizontal' }"
           @click="handleLayoutChange('horizontal')">
        <LayoutHorizontal />
      </div>
    </el-tooltip>
    <!-- 混合布局 -->
    <el-tooltip :content="t('settings.mixed')">
      <div class="layout-item" :class="{ active: menuLayout === 'mixed' }"
           @click="handleLayoutChange('mixed')">
        <LayoutMixed />
      </div>
    </el-tooltip>
  </div>
</div>
```

**3. 主题色**

```vue
<div class="setting-section">
  <h4>{{ t('settings.themeColor') }}</h4>
  <div class="color-options">
    <div
      v-for="color in predefineColors"
      :key="color"
      class="color-item"
      :class="{ active: theme === color }"
      :style="{ backgroundColor: color }"
      @click="handleColorChange(color)"
    >
      <Check v-if="theme === color" />
    </div>
    <!-- 自定义颜色选择器 -->
    <el-color-picker v-model="customColor" @change="handleColorChange" />
  </div>
</div>
```

**4. 基础配置**

```vue
<div class="setting-section">
  <h4>{{ t('settings.basicConfig') }}</h4>
  <div class="config-list">
    <div class="config-item">
      <span>{{ t('settings.tagsView') }}</span>
      <el-switch v-model="tagsViewEnabled" @change="handleTagsViewChange" />
    </div>
    <div class="config-item">
      <span>{{ t('settings.fixedHeader') }}</span>
      <el-switch v-model="fixedHeaderEnabled" @change="handleFixedHeaderChange" />
    </div>
    <div class="config-item">
      <span>{{ t('settings.sidebarLogo') }}</span>
      <el-switch v-model="sidebarLogoEnabled" @change="handleSidebarLogoChange" />
    </div>
    <div class="config-item">
      <span>{{ t('settings.dynamicTitle') }}</span>
      <el-switch v-model="dynamicTitleEnabled" @change="handleDynamicTitleChange" />
    </div>
  </div>
</div>
```

**5. 水印设置**

```vue
<div class="setting-section">
  <h4>{{ t('settings.watermark') }}</h4>
  <div class="config-list">
    <div class="config-item">
      <span>{{ t('settings.enableWatermark') }}</span>
      <el-switch v-model="watermarkEnabled" @change="handleWatermarkChange" />
    </div>
    <div v-if="watermarkEnabled" class="config-item">
      <span>{{ t('settings.watermarkContent') }}</span>
      <el-input v-model="watermarkContent" @change="handleWatermarkContentChange" />
    </div>
  </div>
</div>
```

#### 暗黑模式动画

```typescript
// 使用 View Transitions API 实现流畅切换动画
const handleThemeChange = (isDark: boolean) => {
  toggleThemeWithAnimation(isDark)
}

// toggleThemeWithAnimation 实现
const toggleThemeWithAnimation = (isDark: boolean) => {
  // 检查浏览器是否支持 View Transitions
  if (!document.startViewTransition) {
    layout.toggleDark(isDark)
    return
  }

  // 使用 View Transitions API
  document.startViewTransition(() => {
    layout.toggleDark(isDark)
  })
}
```

### HomeLayout 前台布局

HomeLayout 是简洁的前台布局，仅包含内容区域。

```vue
<template>
  <div class="home-layout">
    <AppMain />
  </div>
</template>

<script lang="ts" setup>
import AppMain from './components/AppMain/AppMain.vue'
import { initWebSocket, initSSE } from '@/utils/websocket'

defineOptions({
  name: 'HomeLayout',
})

onMounted(() => {
  // 初始化实时通信
  initWebSocket()
  initSSE()
})
</script>
```

## useLayout 状态管理

`useLayout` 是布局系统的核心状态管理 Composable，采用单例模式确保全局状态一致性。

### 状态接口

```typescript
/** 侧边栏状态 */
interface SidebarState {
  opened: boolean        // 是否展开
  withoutAnimation: boolean  // 是否禁用动画
  hide: boolean          // 是否隐藏
}

/** 标签视图状态 */
interface TagsViewState {
  visitedViews: RouteLocationNormalized[]  // 已访问视图
  cachedViews: string[]                     // 缓存的组件名
  iframeViews: RouteLocationNormalized[]   // iframe 视图
}

/** 布局配置 */
interface LayoutSetting {
  theme: string           // 主题色
  sideTheme: SideTheme   // 侧边栏主题
  dark: boolean          // 暗黑模式
  topNav: boolean        // 顶部导航
  menuLayout: MenuLayoutMode  // 菜单布局模式
  tagsView: boolean      // 标签视图
  fixedHeader: boolean   // 固定头部
  sidebarLogo: boolean   // 侧边栏 Logo
  dynamicTitle: boolean  // 动态标题
  watermark: boolean     // 水印
  watermarkContent: string  // 水印内容
}

/** 完整布局状态 */
interface LayoutState {
  device: DeviceType     // 设备类型
  sidebar: SidebarState  // 侧边栏状态
  title: string          // 页面标题
  showSettings: boolean  // 显示设置面板
  animationEnable: boolean  // 启用动画
  tagsView: TagsViewState   // 标签视图状态
  config: LayoutSetting     // 布局配置
}
```

### 配置枚举

```typescript
/** 菜单布局模式 */
export enum MenuLayoutMode {
  Vertical = 'vertical',     // 垂直布局 (侧边栏菜单)
  Horizontal = 'horizontal', // 水平布局 (顶部菜单)
  Mixed = 'mixed',          // 混合布局 (顶部+侧边栏)
}

/** 侧边栏主题 */
export enum SideTheme {
  Light = 'theme-light',  // 亮色主题
  Dark = 'theme-dark',    // 暗色主题
}

/** 设备类型 */
export type DeviceType = 'desktop' | 'mobile'
```

### 核心 API

#### 状态访问

```typescript
const layout = useLayout()

// 响应式状态
layout.theme.value           // 主题色
layout.sideTheme.value       // 侧边栏主题
layout.dark.value            // 暗黑模式
layout.topNav.value          // 顶部导航
layout.menuLayout.value      // 菜单布局
layout.tagsView.value        // 标签视图开关
layout.fixedHeader.value     // 固定头部
layout.sidebarLogo.value     // 侧边栏 Logo
layout.dynamicTitle.value    // 动态标题
layout.watermark.value       // 水印开关
layout.watermarkContent.value // 水印内容

// 状态对象
layout.sidebar.value         // 侧边栏状态
layout.device.value          // 设备类型
layout.visitedViews.value    // 已访问视图
layout.cachedViews.value     // 缓存视图
```

#### 侧边栏操作

```typescript
// 切换侧边栏展开/收起
layout.toggleSideBar(withoutAnimation?: boolean)

// 展开侧边栏
layout.openSideBar(withoutAnimation?: boolean)

// 收起侧边栏
layout.closeSideBar(withoutAnimation?: boolean)

// 切换侧边栏显示/隐藏
layout.toggleSideBarHide(status: boolean)
```

#### 设备与尺寸

```typescript
// 切换设备类型
layout.toggleDevice(device: DeviceType)

// 设置组件尺寸
layout.setSize(size: string)

// 切换语言
layout.changeLanguage(lang: string)
```

#### 主题操作

```typescript
// 切换暗黑模式
layout.toggleDark(isDark?: boolean)

// 设置主题色
layout.theme.value = '#409EFF'

// 设置侧边栏主题
layout.sideTheme.value = SideTheme.Dark
```

#### 标题操作

```typescript
// 设置页面标题
layout.setTitle(title: string)

// 重置为默认标题
layout.resetTitle()
```

#### 标签视图操作

```typescript
// 添加已访问视图
layout.addVisitedView(view: RouteLocationNormalized)

// 添加缓存视图
layout.addCachedView(view: RouteLocationNormalized)

// 删除已访问视图
layout.delVisitedView(view: RouteLocationNormalized)

// 删除缓存视图
layout.delCachedView(view: RouteLocationNormalized)

// 删除其他视图
layout.delOthersViews(view: RouteLocationNormalized)

// 删除左侧视图
layout.delLeftViews(view: RouteLocationNormalized)

// 删除右侧视图
layout.delRightViews(view: RouteLocationNormalized)

// 删除所有视图
layout.delAllViews()

// 更新已访问视图
layout.updateVisitedView(view: RouteLocationNormalized)

// iframe 相关
layout.addIframeView(view: RouteLocationNormalized)
layout.delIframeView(view: RouteLocationNormalized)
```

#### 配置持久化

```typescript
// 保存配置到 localStorage
layout.saveSettings()

// 重置为默认配置
layout.resetConfig()
```

### 存储键名

布局配置存储在 localStorage 中:

```typescript
const STORAGE_KEY = 'layout-config'

// 存储结构
{
  theme: '#409EFF',
  sideTheme: 'theme-dark',
  dark: false,
  topNav: false,
  menuLayout: 'vertical',
  tagsView: true,
  fixedHeader: true,
  sidebarLogo: true,
  dynamicTitle: true,
  watermark: false,
  watermarkContent: 'RuoYi-Plus'
}
```

## 布局配置

### 菜单布局模式

#### 垂直布局 (Vertical)

```text
┌─────────────────────────────────────────┐
│ Navbar                                   │
├─────────┬───────────────────────────────┤
│         │                               │
│ Sidebar │         AppMain               │
│         │                               │
│         │                               │
└─────────┴───────────────────────────────┘
```

- 侧边栏在左侧，显示完整菜单树
- Navbar 包含面包屑导航
- 适合菜单层级较深的系统

#### 水平布局 (Horizontal)

```text
┌─────────────────────────────────────────┐
│ Navbar  [Logo] [Menu1] [Menu2] [Menu3]  │
├─────────────────────────────────────────┤
│                                         │
│                AppMain                  │
│                                         │
└─────────────────────────────────────────┘
```

- 菜单在顶部水平排列
- 无侧边栏，内容区域更宽
- 适合菜单数量较少的系统

#### 混合布局 (Mixed)

```text
┌─────────────────────────────────────────┐
│ Navbar  [TopMenu1] [TopMenu2]           │
├─────────┬───────────────────────────────┤
│         │                               │
│ Sidebar │         AppMain               │
│ (子菜单) │                               │
│         │                               │
└─────────┴───────────────────────────────┘
```

- 顶部显示一级菜单
- 侧边栏显示二级及以下菜单
- 适合大型系统的菜单组织

### 路由配置

#### meta 字段说明

```typescript
interface RouteMeta {
  title?: string           // 菜单标题 (必须)
  icon?: string            // 菜单图标
  hidden?: boolean         // 是否隐藏菜单
  alwaysShow?: boolean     // 是否始终显示根菜单
  noCache?: boolean        // 是否不缓存 (true 不缓存)
  affix?: boolean          // 是否固定在 TagsView
  breadcrumb?: boolean     // 是否显示在面包屑
  activeMenu?: string      // 激活的菜单路径
  link?: string            // 外链地址
}
```

#### 配置示例

```typescript
// 普通菜单
{
  path: '/system',
  component: Layout,
  meta: { title: '系统管理', icon: 'system' },
  children: [
    {
      path: 'user',
      name: 'User',
      component: () => import('@/views/system/user/index.vue'),
      meta: { title: '用户管理', icon: 'user' }
    }
  ]
}

// 固定标签
{
  path: '/dashboard',
  component: Layout,
  children: [
    {
      path: '',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: { title: '首页', icon: 'dashboard', affix: true }
    }
  ]
}

// 不缓存页面
{
  path: 'detail/:id',
  name: 'UserDetail',
  component: () => import('@/views/system/user/detail.vue'),
  meta: { title: '用户详情', noCache: true, activeMenu: '/system/user' }
}

// 外链
{
  path: '/external-link',
  component: Layout,
  children: [
    {
      path: 'https://www.baidu.com',
      meta: { title: '百度', icon: 'link', link: 'https://www.baidu.com' }
    }
  ]
}
```

### 响应式断点

| 断点 | 宽度 | 设备类型 | 侧边栏行为 |
|------|------|---------|-----------|
| 移动端 | < 992px | mobile | 自动收起，抽屉模式 |
| 桌面端 | ≥ 992px | desktop | 正常展示 |

### 样式变量

布局系统使用 CSS 变量实现主题定制:

```scss
// 侧边栏宽度
--sidebar-width: 210px;
--sidebar-collapsed-width: 54px;

// 导航栏高度
--navbar-height: 50px;

// TagsView 高度
--tags-view-height: 34px;

// 侧边栏颜色 (暗色主题)
--side-bar-bg-color: #304156;
--side-bar-text-color: #bfcbd9;

// 主题色
--el-color-primary: var(--current-color);
```

## 最佳实践

### 1. 合理使用页面缓存

```typescript
// 需要缓存的页面
// 1. 组件 name 必须与路由 name 一致
defineOptions({
  name: 'UserList',  // 与路由的 name: 'UserList' 一致
})

// 2. 路由配置不设置 noCache 或设为 false
{
  path: 'list',
  name: 'UserList',
  component: () => import('@/views/user/list.vue'),
  meta: { title: '用户列表' }  // 默认缓存
}

// 不需要缓存的页面
{
  path: 'detail/:id',
  name: 'UserDetail',
  component: () => import('@/views/user/detail.vue'),
  meta: { title: '用户详情', noCache: true }
}
```

### 2. 正确配置固定标签

```typescript
// 首页等常用页面设置为固定标签
{
  path: '/dashboard',
  component: Layout,
  children: [
    {
      path: '',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: {
        title: '首页',
        icon: 'dashboard',
        affix: true  // 固定在 TagsView，不可关闭
      }
    }
  ]
}
```

### 3. 动态激活菜单

```typescript
// 详情页激活列表页菜单
{
  path: 'detail/:id',
  name: 'UserDetail',
  component: () => import('@/views/user/detail.vue'),
  meta: {
    title: '用户详情',
    hidden: true,  // 隐藏菜单
    activeMenu: '/system/user'  // 激活用户列表菜单
  }
}
```

### 4. 响应式布局处理

```typescript
// 在组件中监听设备变化
const layout = useLayout()

watch(
  () => layout.device.value,
  (device) => {
    if (device === 'mobile') {
      // 移动端处理逻辑
      // 例如: 简化表格列、隐藏次要信息
    }
  }
)

// 使用 CSS 媒体查询
@media (max-width: 992px) {
  .desktop-only {
    display: none;
  }
}
```

### 5. 主题色适配

```typescript
// 使用 CSS 变量实现主题适配
.custom-component {
  // 使用主题色
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);

  // 使用计算后的颜色
  background-color: var(--el-color-primary-light-9);

  &:hover {
    background-color: var(--el-color-primary-light-7);
  }
}
```

### 6. 布局配置持久化

```typescript
// 监听配置变化自动保存
watch(
  [
    () => layout.theme.value,
    () => layout.dark.value,
    () => layout.menuLayout.value,
  ],
  () => {
    layout.saveSettings()
  },
  { deep: true }
)
```

## 常见问题

### 1. 页面缓存不生效

**问题原因:**
- 组件 name 与路由 name 不一致
- 组件未定义 name
- 路由配置了 `noCache: true`

**解决方案:**

```typescript
// 组件中定义 name
defineOptions({
  name: 'UserList',  // 必须与路由 name 一致
})

// 路由配置
{
  path: 'list',
  name: 'UserList',  // 与组件 name 一致
  component: () => import('@/views/user/list.vue'),
  meta: { title: '用户列表' }  // 不要设置 noCache: true
}
```

### 2. 侧边栏菜单不显示

**问题原因:**
- 路由配置了 `hidden: true`
- 没有子路由
- 权限不足

**解决方案:**

```typescript
// 检查路由配置
{
  path: '/system',
  component: Layout,
  meta: { title: '系统管理', icon: 'system' },
  children: [
    {
      path: 'user',
      name: 'User',
      component: () => import('@/views/system/user/index.vue'),
      meta: {
        title: '用户管理',
        // hidden: true,  // 移除或设为 false
      }
    }
  ]
}

// 检查用户权限
const userStore = useUserStore()
console.log(userStore.permissions)  // 查看权限列表
```

### 3. 暗黑模式样式异常

**问题原因:**
- 使用了硬编码颜色值
- 未使用 CSS 变量

**解决方案:**

```scss
// ❌ 错误写法
.component {
  background-color: #ffffff;
  color: #333333;
}

// ✅ 正确写法
.component {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}
```

### 4. TagsView 标签过多

**问题原因:**
- 打开页面过多
- 未及时关闭不需要的标签

**解决方案:**

```typescript
// 限制最大标签数量
const MAX_TAGS = 10

watch(
  () => layout.visitedViews.value.length,
  (count) => {
    if (count > MAX_TAGS) {
      // 关闭最早打开的非固定标签
      const oldestNonAffix = layout.visitedViews.value.find(
        view => !view.meta?.affix
      )
      if (oldestNonAffix) {
        layout.delVisitedView(oldestNonAffix)
      }
    }
  }
)
```

### 5. 移动端侧边栏无法关闭

**问题原因:**
- 点击遮罩层事件未触发
- 设备类型判断错误

**解决方案:**

```typescript
// 确保遮罩层正确绑定事件
<div
  v-if="device === 'mobile' && sidebar.opened"
  class="drawer-bg"
  @click="handleClickOutside"
/>

// 处理函数
const handleClickOutside = () => {
  layout.closeSideBar(false)
}

// 检查设备类型
console.log(layout.device.value)  // 应该是 'mobile'
```

### 6. 水印不显示

**问题原因:**
- 水印功能未启用
- 水印内容为空

**解决方案:**

```typescript
// 启用水印
layout.watermark.value = true

// 设置水印内容
layout.watermarkContent.value = '机密文档'

// 或在设置面板中开启
```

## 扩展指南

### 添加新的布局模式

1. **定义枚举值**

```typescript
// systemConfig.ts
export enum MenuLayoutMode {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Mixed = 'mixed',
  Custom = 'custom',  // 新增
}
```

2. **创建布局组件**

```vue
<!-- CustomLayout.vue -->
<template>
  <div class="custom-layout">
    <CustomHeader />
    <div class="custom-content">
      <CustomSidebar />
      <AppMain />
    </div>
    <CustomFooter />
  </div>
</template>

<script lang="ts" setup>
import AppMain from './components/AppMain/AppMain.vue'
// 导入自定义组件
</script>
```

3. **注册路由**

```typescript
// router/index.ts
{
  path: '/custom',
  component: () => import('@/layouts/CustomLayout.vue'),
  children: [/* 子路由 */]
}
```

4. **更新设置面板**

```vue
<!-- Settings.vue -->
<el-tooltip :content="t('settings.custom')">
  <div class="layout-item" :class="{ active: menuLayout === 'custom' }"
       @click="handleLayoutChange('custom')">
    <LayoutCustom />
  </div>
</el-tooltip>
```

### 添加导航栏工具

1. **创建工具组件**

```vue
<!-- tools/CustomTool.vue -->
<template>
  <div class="navbar-tool-item" @click="handleClick">
    <el-tooltip :content="t('navbar.customTool')">
      <el-icon><Setting /></el-icon>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { Setting } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const handleClick = () => {
  // 处理逻辑
}
</script>
```

2. **在 Navbar 中引入**

```vue
<!-- Navbar.vue -->
<template>
  <div class="h-full flex items-center navbar-tools">
    <!-- 其他工具 -->
    <CustomTool v-if="width > 768" />
    <!-- 用户下拉 -->
  </div>
</template>

<script lang="ts" setup>
import CustomTool from './tools/CustomTool.vue'
</script>
```

### 自定义主题色

1. **添加预设颜色**

```typescript
// Settings.vue
const predefineColors = [
  '#409EFF',  // 默认蓝
  '#1890ff',  // 拂晓蓝
  '#304156',  // 深灰
  '#212121',  // 纯黑
  '#11a983',  // 碧绿
  '#13c2c2',  // 明青
  '#722ed1',  // 酱紫
  '#eb2f96',  // 法式洋红
  '#ff5500',  // 橙红 (新增)
]
```

2. **应用主题色**

```typescript
// 设置 Element Plus 主题色
const handleColorChange = (color: string) => {
  layout.theme.value = color

  // 生成色阶
  document.documentElement.style.setProperty('--el-color-primary', color)

  for (let i = 1; i <= 9; i++) {
    const lightColor = mix('#ffffff', color, i * 0.1)
    document.documentElement.style.setProperty(
      `--el-color-primary-light-${i}`,
      lightColor
    )
  }

  const darkColor = mix('#000000', color, 0.2)
  document.documentElement.style.setProperty('--el-color-primary-dark-2', darkColor)
}
```

## 总结

布局系统是 RuoYi-Plus-UniApp 管理端前端的核心基础设施，提供了:

1. **灵活的布局模式** - 垂直、水平、混合三种模式适应不同场景
2. **完善的主题系统** - 亮色/暗色切换，自定义主题色
3. **响应式设计** - 自动适配桌面端和移动端
4. **高效的状态管理** - useLayout 单例模式，配置持久化
5. **丰富的工具组件** - 搜索、通知、多语言、租户切换等
6. **标签页管理** - 缓存、快捷操作、右键菜单

通过合理配置和使用布局系统，可以快速构建功能完善、用户体验良好的管理后台界面。
