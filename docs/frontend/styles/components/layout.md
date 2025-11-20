# 布局组件样式

## 介绍

布局组件样式是 RuoYi-Plus-UniApp 前端管理系统的核心样式模块,定义了应用的整体结构布局。该模块采用基于 SCSS 的现代 CSS 架构,通过 CSS 变量实现主题切换,通过响应式设计适配不同设备,为用户提供流畅、一致的使用体验。

布局系统包含四个核心区域:应用容器(`app-wrapper`)、侧边栏(`sidebar-container`)、主容器(`main-container`)和固定头部(`fixed-header`)。每个区域都精心设计了交互动效、状态管理和响应式适配,构成了完整的管理后台布局框架。

**核心特性:**

- **模块化架构** - 将布局拆分为独立模块,便于维护和扩展
- **响应式设计** - 自动适配桌面端、平板和移动端,提供优秀的多端体验
- **主题切换** - 基于 CSS 变量实现亮色/暗色主题无缝切换
- **动画过渡** - 所有状态变化都配有流畅的过渡动画,提升用户体验
- **多布局模式** - 支持左侧菜单、顶部菜单和混合菜单三种布局模式
- **侧边栏折叠** - 支持侧边栏展开/折叠,最大化内容显示空间
- **固定头部** - 可选固定头部,滚动时保持导航栏可见
- **标签视图** - 集成多标签页管理,方便快速切换工作区
- **水印支持** - 内置全局水印功能,支持自定义水印内容

## 文件结构

### 主要文件

```
plus-ui/src/assets/styles/
├── layout/
│   └── _layout.scss           # 布局样式主文件(801行)
├── abstracts/
│   ├── _variables.scss        # 全局变量定义
│   └── _mixins.scss           # 混入工具函数
└── themes/
    ├── _light.scss            # 亮色主题
    └── _dark.scss             # 暗色主题
```

### 布局组件文件

```
plus-ui/src/layouts/
├── Layout.vue                 # 布局主组件
└── components/
    ├── Sidebar/               # 侧边栏组件
    ├── Navbar/                # 导航栏组件
    ├── AppMain/               # 主内容区组件
    ├── TagsView/              # 标签视图组件
    └── Settings/              # 设置面板组件
```

## CSS 变量系统

### 布局尺寸变量

```scss
/* SCSS 变量 */
$base-sidebar-width: 240px;    // 侧边栏宽度

/* CSS 变量 */
:root {
  --sidebar-collapsed-width: 54px;  // 折叠后侧边栏宽度
}
```

### Z-index 层级变量

```scss
:root {
  --z-sidebar: 1001;    // 侧边栏层级
  --z-header: 9;        // 头部层级
  --z-mask: 999;        // 遮罩层级
  --z-modal: 1050;      // 模态框层级
}
```

系统化的 Z-index 管理确保各层级元素的正确叠加顺序,避免层级冲突问题。

### 动画时长变量

```scss
:root {
  --duration-normal: 0.3s;  // 正常动画时长
  --duration-slow: 0.6s;    // 慢速动画时长
}
```

### 圆角变量

```scss
:root {
  --radius-sm: 4px;      // 小圆角
  --radius-md: 8px;      // 中圆角
  --radius-lg: 12px;     // 大圆角
  --radius-round: 20px;  // 圆形圆角

  // 动态圆角系统
  --custom-radius: 12px;
  --el-border-radius-base: calc(var(--custom-radius) / 3 + 2px);
  --el-border-radius-small: calc(var(--custom-radius) / 3 + 4px);
}
```

## 应用容器样式

### 基础容器

应用容器是整个布局的根元素,负责管理全局布局状态和响应式行为。

```scss
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: var(--app-bg);
  color: var(--app-text);

  // 移动端打开侧边栏时固定定位
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
```

**关键特性:**

1. **全屏布局** - 使用 `height: 100%` 和 `width: 100%` 填充整个视口
2. **主题适配** - 通过 `var(--app-bg)` 和 `var(--app-text)` 支持主题切换
3. **移动端优化** - 打开侧边栏时固定定位,防止背景滚动

### 遮罩层

移动端打开侧边栏时显示半透明遮罩,点击关闭侧边栏。

```scss
.drawer-bg {
  background-color: rgba(0, 0, 0, 0.3);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: var(--z-mask);
}
```

**使用示例:**

```vue
<template>
  <div class="app-wrapper" :class="classObj">
    <!-- 移动端侧边栏遮罩层 -->
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />

    <!-- 其他内容 -->
  </div>
</template>

<script setup lang="ts">
const handleClickOutside = () => {
  // 关闭侧边栏
  layout.closeSideBar()
}
</script>
```

### 无动画模式

禁用布局动画,用于初始化或快速切换场景。

```scss
.app-wrapper.withoutAnimation {
  .main-container,
  .sidebar-container {
    transition: none;
  }
}
```

## 侧边栏样式

### 侧边栏容器

侧边栏是左侧固定的导航菜单区域,支持展开/折叠状态切换。

```scss
.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: var(--z-sidebar);
  width: $base-sidebar-width !important;
  height: 100%;
  background-color: var(--menu-bg);
  transition: width var(--duration-normal);
  font-size: 0;
  overflow: hidden;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
}
```

**关键特性:**

1. **固定定位** - 使用 `position: fixed` 固定在左侧
2. **完整高度** - `top: 0; bottom: 0;` 确保占据整个视口高度
3. **平滑过渡** - `transition: width` 实现展开/折叠动画
4. **主题色** - `background-color: var(--menu-bg)` 支持主题切换
5. **阴影效果** - 轻微阴影增强层次感

### 滚动条样式

```scss
.sidebar-container {
  .scrollbar-wrapper {
    overflow-x: hidden !important;
  }

  .el-scrollbar__bar.is-vertical {
    right: 0;
  }

  .el-scrollbar {
    height: 100%;
  }

  // 带 logo 时调整滚动区域高度
  &.has-logo .el-scrollbar {
    height: calc(100% - 50px);
  }
}
```

**技术实现:**

- 使用 Element Plus 的 `el-scrollbar` 组件
- 隐藏水平滚动条,只保留垂直滚动
- Logo 区域占用 50px 高度,滚动区域自动计算剩余高度

### 菜单项样式

#### 一级菜单

```scss
.el-menu {
  border: none;
  height: 100%;
  width: 100% !important;
  padding: 4px 0;

  .el-menu-item {
    margin: 2px 8px;
    border-radius: 8px;
    height: 44px;
    line-height: 44px;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    transition: all 0.2s ease;

    &:hover:not(.is-active) {
      background-color: var(--menu-hover-color) !important;
      color: var(--menu-hover-text-color) !important;
      transform: translateX(2px);
    }

    &.is-active {
      background-color: var(--menu-active-bg) !important;
      color: var(--menu-active-text) !important;
    }
  }
}
```

**设计细节:**

1. **圆角卡片** - `border-radius: 8px` 现代化圆角设计
2. **边距控制** - `margin: 2px 8px` 左右留白,不贴边
3. **统一高度** - `height: 44px` 确保点击区域一致
4. **悬停效果** - 轻微右移 2px,增强交互反馈
5. **激活状态** - 使用主题色高亮当前选中项
6. **文本溢出** - 长文本自动截断,显示省略号

#### 二级菜单

```scss
.el-sub-menu .el-menu {
  padding: 0;

  .el-menu-item {
    margin: 1px 8px;
    padding-left: 36px !important;
    height: 40px;
    line-height: 40px;
    font-size: 13px;

    &:hover:not(.is-active) {
      background-color: var(--menu-hover-color) !important;
      color: var(--menu-hover-text-color) !important;
    }

    &.is-active {
      background-color: var(--menu-active-bg) !important;
      color: var(--menu-active-text) !important;
    }
  }
}
```

**层级区分:**

- **高度递减** - 二级 40px,三级 36px,四级 32px
- **字号递减** - 二级 13px,三级 12px,四级 11px
- **缩进控制** - 二级 36px,三级 56px,四级 76px
- **统一风格** - 保持圆角、悬停效果的一致性

#### 三级和四级菜单

```scss
// 三级菜单
.el-sub-menu .el-sub-menu .el-menu {
  .el-menu-item {
    padding-left: 56px !important;
    height: 36px;
    line-height: 36px;
    font-size: 12px;
  }
}

// 四级菜单
.el-sub-menu .el-sub-menu .el-sub-menu .el-menu {
  .el-menu-item {
    padding-left: 76px !important;
    height: 32px;
    line-height: 32px;
    font-size: 11px;
  }
}
```

系统支持最多四级菜单嵌套,通过逐级缩进和尺寸递减清晰区分层级关系。

### 折叠状态样式

#### 折叠容器

```scss
.hideSidebar .sidebar-container {
  width: var(--sidebar-collapsed-width) !important;
}
```

侧边栏折叠时宽度从 240px 缩小到 54px,仅显示图标。

#### 折叠菜单项

```scss
.hideSidebar .el-menu--collapse {
  .el-menu-item {
    padding: 0 !important;
    margin: 2px 4px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    text-align: center;
    height: 44px !important;

    // 图标容器完全居中
    .el-menu-tooltip__trigger {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }

    // 隐藏文字
    .menu-title {
      display: none !important;
    }

    // 悬停效果改为缩放
    &:hover:not(.is-active) {
      background-color: var(--menu-hover-color) !important;
      color: var(--menu-hover-text-color) !important;
      transform: scale(1.05);
    }
  }
}
```

**折叠优化:**

1. **图标居中** - 使用 Flexbox 实现完美居中
2. **隐藏文字** - 只保留图标,最大化空间利用
3. **缩放动画** - 折叠时用 `scale(1.05)` 替代平移效果
4. **Tooltip 提示** - Element Plus 自动显示完整菜单名称

#### 折叠子菜单

```scss
.hideSidebar .el-menu--collapse {
  .el-sub-menu > .el-sub-menu__title {
    padding: 0 !important;
    margin: 2px 4px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;

    // 隐藏文字和箭头
    & > span:not(.menu-item-icon),
    & > i,
    .el-sub-menu__icon-arrow {
      display: none !important;
    }

    // 图标居中
    .menu-item-icon {
      margin: 0 !important;
    }
  }
}
```

折叠状态下子菜单只显示图标,点击图标在右侧弹出浮层菜单。

## 主容器样式

### 主容器基础

主容器包含头部、内容区和标签视图,根据侧边栏状态动态调整位置。

```scss
.main-container {
  height: 100%;
  transition: margin-left var(--duration-normal);
  margin-left: $base-sidebar-width;
  position: relative;

  // 侧边栏隐藏时
  &.sidebarHide {
    margin-left: 0 !important;
  }
}
```

**响应式调整:**

```scss
// 侧边栏展开时
.main-container {
  margin-left: 240px;
}

// 侧边栏折叠时
.hideSidebar .main-container {
  margin-left: 54px;
}

// 侧边栏完全隐藏时
.sidebarHide .main-container {
  margin-left: 0;
}
```

主容器通过 `margin-left` 自动适配侧边栏宽度,配合过渡动画实现平滑切换。

### 标签视图样式

```scss
.main-container.hasTagsView {
  // 可以添加特定样式
}
```

启用标签视图时,主容器会添加 `hasTagsView` 类,用于调整内容区高度。

## 固定头部样式

### 头部容器

```scss
.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: var(--z-header);
  width: calc(100% - #{$base-sidebar-width});
  transition: width var(--duration-normal);
  background: var(--header-bg);
}
```

**响应式宽度:**

```scss
// 侧边栏展开时
.fixed-header {
  width: calc(100% - 240px);
}

// 侧边栏折叠时
.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

// 侧边栏隐藏时
.sidebarHide .fixed-header {
  width: 100%;
}
```

固定头部宽度根据侧边栏状态动态计算,始终占据剩余空间。

### Navbar 工具项悬停

```scss
.navbar-tool-item {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--bg-level-4) !important;
  }
}
```

导航栏工具项(全屏、搜索、通知等)统一悬停样式,提升交互一致性。

## 水平菜单样式

### 顶部菜单

系统支持顶部水平菜单布局模式,适合菜单项较少的场景。

```scss
.el-menu--horizontal {
  border-bottom: none !important;

  .el-menu-item {
    border-bottom: none !important;
    padding: 0 16px !important;
    min-width: 80px !important;

    &:hover {
      background-color: transparent !important;
    }
  }

  .el-sub-menu > .el-sub-menu__title {
    border-bottom: none !important;
    padding: 0 32px 0 16px !important;
    min-width: 80px !important;

    &:hover {
      background-color: transparent !important;
    }

    // 确保下拉箭头显示
    .el-sub-menu__icon-arrow {
      display: block !important;
      margin-left: 6px !important;
      margin-right: -8px !important;
    }
  }
}
```

**设计特点:**

1. **去除下划线** - 不显示底部横线,更简洁
2. **透明悬停** - 顶部菜单悬停不改变背景色
3. **紧凑布局** - 减少左右内边距,节省空间
4. **最小宽度** - 防止菜单项过度挤压

### 弹出子菜单

```scss
.el-menu--popup {
  border: 1px solid var(--el-border-color) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  padding: 4px 0 !important;

  .el-menu-item {
    margin: 2px 8px !important;
    border-radius: 6px !important;
    height: 44px !important;
    line-height: 44px !important;
    padding: 0 16px !important;
    transition: all 0.2s ease !important;
    background-color: transparent !important;

    &:hover:not(.is-active) {
      background-color: var(--bg-level-3) !important;
      color: inherit !important;
      transform: translateX(2px) !important;
    }

    &.is-active {
      background-color: var(--menu-active-bg) !important;
      color: var(--menu-active-text) !important;
    }
  }
}
```

**弹出菜单特点:**

1. **卡片样式** - 圆角边框和阴影,类似 Dropdown
2. **内边距** - 菜单项留白,不贴边
3. **悬停效果** - 背景色变化 + 右移动画
4. **主题适配** - 自动适配亮色/暗色主题

### 暗色主题弹出菜单

```scss
html.dark .el-menu--popup {
  background-color: var(--el-bg-color) !important;
  border-color: var(--el-border-color) !important;

  .el-menu-item {
    color: var(--el-text-color-primary) !important;

    &:hover:not(.is-active) {
      background-color: var(--bg-level-3) !important;
    }
  }
}
```

暗色主题下自动调整背景色、边框色和文字色,确保对比度和可读性。

## 响应式设计

### 移动端适配

```scss
@include respond-to('md') {
  .app-wrapper {
    &.mobile {
      .main-container {
        margin-left: 0px;
      }

      .fixed-header {
        width: 100%;
      }

      // 移动端侧边栏隐藏状态
      &.hideSidebar {
        .sidebar-container {
          pointer-events: none;
          transition-duration: var(--duration-normal);
          transform: translate3d(-#{$base-sidebar-width}, 0, 0);
        }
      }
    }
  }
}
```

**移动端特性:**

1. **全宽布局** - 主容器和头部占据 100% 宽度
2. **抽屉侧边栏** - 使用 `transform` 实现抽屉效果
3. **禁用交互** - 隐藏时 `pointer-events: none` 避免误触
4. **3D 变换** - `translate3d` 启用硬件加速,动画更流畅

### 响应式断点

```scss
// SCSS 变量
$sm: 768px;
$md: 992px;
$lg: 1200px;
$xl: 1920px;

// 设备断点
$device-notebook: 1600px;
$device-ipad-pro: 1180px;
$device-ipad: 800px;
$device-ipad-vertical: 900px;
$device-phone: 500px;
```

系统定义了多个响应式断点,覆盖主流设备尺寸。

### 设备类型判断

```vue
<script setup lang="ts">
const { width } = useWindowSize()
const WIDTH = 992 // 响应式断点

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    layout.toggleDevice('mobile')
    layout.closeSideBar()
  } else {
    layout.toggleDevice('pc')
    layout.openSideBar()
  }
})
</script>
```

**自动适配逻辑:**

- 宽度 < 992px: 切换到移动端,自动关闭侧边栏
- 宽度 ≥ 992px: 切换到桌面端,自动打开侧边栏

## 主题适配

### CSS 变量映射

布局样式通过 CSS 变量实现主题切换,所有颜色、背景、边框都使用变量定义。

```scss
// 应用背景和文字
background-color: var(--app-bg);
color: var(--app-text);

// 菜单背景
background-color: var(--menu-bg);

// 头部背景和边框
background: var(--header-bg);
border-bottom: 1px solid var(--header-border);

// 菜单悬停和激活
background-color: var(--menu-hover-color);
color: var(--menu-hover-text-color);
background-color: var(--menu-active-bg);
color: var(--menu-active-text);
```

### 主题变量定义

亮色主题和暗色主题分别定义在 `_light.scss` 和 `_dark.scss` 文件中:

```scss
// 亮色主题
:root {
  --app-bg: #f0f2f5;
  --app-text: #333333;
  --menu-bg: #ffffff;
  --menu-hover-color: #f5f5f5;
  --menu-active-bg: rgba(64, 158, 255, 0.1);
}

// 暗色主题
html.dark {
  --app-bg: #1a1a1a;
  --app-text: #e0e0e0;
  --menu-bg: #242424;
  --menu-hover-color: #2f2f2f;
  --menu-active-bg: rgba(64, 158, 255, 0.2);
}
```

主题切换时,仅需切换根元素的 `dark` 类,所有布局样式自动更新。

## 布局模式

### 左侧菜单模式

默认布局模式,菜单位于左侧,主内容在右侧。

```vue
<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <Sidebar v-if="showSidebar" class="sidebar-container" />

    <!-- 主容器 -->
    <div class="main-container">
      <!-- 固定头部 -->
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>

      <!-- 主内容 -->
      <app-main />
    </div>
  </div>
</template>
```

**适用场景:**

- 菜单项较多,需要多级嵌套
- 需要清晰的功能分类
- 传统管理后台风格

### 顶部菜单模式

菜单位于顶部,主内容占据全部宽度。

```vue
<template>
  <div class="app-wrapper" :class="{ horizontalLayout: true }">
    <!-- 主容器 -->
    <div class="main-container sidebarHide horizontalLayout">
      <!-- 固定头部(包含水平菜单) -->
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>

      <!-- 主内容 -->
      <app-main />
    </div>
  </div>
</template>
```

**适用场景:**

- 菜单项较少,一级菜单为主
- 需要更大的内容显示区域
- 现代化扁平设计风格

### 混合菜单模式

顶部显示一级菜单,左侧显示二级子菜单。

```vue
<template>
  <div class="app-wrapper">
    <!-- 侧边栏(二级菜单) -->
    <Sidebar class="sidebar-container" />

    <!-- 主容器 -->
    <div class="main-container">
      <!-- 固定头部(一级菜单) -->
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>

      <!-- 主内容 -->
      <app-main />
    </div>
  </div>
</template>
```

**适用场景:**

- 菜单层级较深,需要分级展示
- 兼顾空间利用和层级清晰
- 大型企业级应用

## 完整示例

### 基础布局

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
        <navbar @set-layout="setLayout" />
        <tags-view v-if="needTagsView" />
      </div>

      <!-- 主内容 -->
      <app-main />

      <!-- 设置面板 -->
      <settings ref="settingRef" />
    </div>

    <!-- 全局水印 -->
    <AWatermark :visible="watermarkVisible" :content="watermarkContentText" />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar/Sidebar.vue'
import AppMain from './components/AppMain/AppMain.vue'
import Navbar from './components/Navbar/Navbar.vue'
import Settings from './components/Settings/Settings.vue'
import TagsView from './components/TagsView/TagsView.vue'
import AWatermark from '@/components/ATheme/AWatermark.vue'
import { SystemConfig, MenuLayoutMode } from '@/systemConfig'
import { useLayout } from '@/composables/useLayout'

// 获取应用布局状态
const layout = useLayout()

// 响应式状态
const theme = layout.theme
const sidebar = layout.sidebar
const device = layout.device
const needTagsView = layout.tagsView
const fixedHeader = layout.fixedHeader
const menuLayout = layout.menuLayout

// 水印配置
const watermarkVisible = layout.watermark
const userStore = useUserStore()
const watermarkContentText = computed(() => {
  const configContent = layout.watermarkContent.value
  if (configContent && configContent.trim() !== '') {
    return configContent
  }
  const userName = userStore.userInfo?.userName
  if (userName) {
    return userName
  }
  return SystemConfig.app.title || 'ruoyi-plus-uniapp'
})

// 计算是否显示侧边栏
const showSidebar = computed(() => {
  return menuLayout.value !== MenuLayoutMode.Horizontal && !sidebar.value.hide
})

// 计算侧边栏状态相关的 class
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
  horizontalLayout: menuLayout.value === MenuLayoutMode.Horizontal
}))

// 响应式处理窗口大小变化
const { width } = useWindowSize()
const WIDTH = 992 // 响应式断点

watchEffect(() => {
  if (device.value === 'mobile') {
    layout.closeSideBar()
  }

  if (width.value - 1 < WIDTH) {
    layout.toggleDevice('mobile')
    layout.closeSideBar()
  } else {
    layout.toggleDevice('pc')
    layout.openSideBar()
  }
})

// 处理移动端点击侧边栏外区域关闭侧边栏
const handleClickOutside = () => {
  layout.closeSideBar()
}

// 打开设置面板
const settingRef = ref()
const setLayout = () => {
  settingRef.value?.openSetting()
}
</script>
```

### 自定义布局样式

```vue
<style lang="scss" scoped>
// 自定义侧边栏宽度
.sidebar-container {
  width: 280px !important;
}

.main-container {
  margin-left: 280px;
}

// 自定义菜单项高度
.el-menu-item {
  height: 48px !important;
  line-height: 48px !important;
}

// 自定义悬停颜色
.el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.08) !important;
}

// 自定义激活颜色
.el-menu-item.is-active {
  background-color: rgba(64, 158, 255, 0.15) !important;
  color: #409eff !important;
  font-weight: 600;
}

// 移动端全屏布局
@media (max-width: 768px) {
  .sidebar-container {
    width: 100vw !important;
  }
}
</style>
```

## 性能优化

### CSS 优化

```scss
// 使用 will-change 优化动画性能
.sidebar-container {
  will-change: width;
}

.main-container {
  will-change: margin-left;
}

// 使用 transform 替代 left/right
.sidebar-container {
  transform: translate3d(0, 0, 0);
}

// 移动端隐藏侧边栏
.hideSidebar .sidebar-container {
  transform: translate3d(-240px, 0, 0);
}
```

### JavaScript 优化

```typescript
// 使用 requestAnimationFrame 优化动画
const toggleSidebar = () => {
  requestAnimationFrame(() => {
    sidebar.value.opened = !sidebar.value.opened
  })
}

// 使用防抖优化窗口大小变化
const { width } = useWindowSize()
const debouncedResize = useDebounceFn(() => {
  if (width.value < 992) {
    layout.toggleDevice('mobile')
  } else {
    layout.toggleDevice('pc')
  }
}, 150)

watch(width, debouncedResize)
```

### 懒加载优化

```typescript
// 懒加载侧边栏组件
const Sidebar = defineAsyncComponent(() =>
  import('./components/Sidebar/Sidebar.vue')
)

// 懒加载标签视图
const TagsView = defineAsyncComponent(() =>
  import('./components/TagsView/TagsView.vue')
)
```

## 最佳实践

### 1. 使用 CSS 变量而非硬编码

**❌ 不推荐:**

```scss
.sidebar-container {
  background-color: #ffffff;
  width: 240px;
}
```

**✅ 推荐:**

```scss
.sidebar-container {
  background-color: var(--menu-bg);
  width: $base-sidebar-width;
}
```

**原因:** CSS 变量支持主题切换,SCSS 变量方便统一管理尺寸。

### 2. 保持布局样式独立

**❌ 不推荐:**

```vue
<style scoped>
.sidebar-container {
  background: #f00;
  width: 300px;
}
</style>
```

**✅ 推荐:**

```scss
// 在 _layout.scss 中统一管理
.sidebar-container {
  background-color: var(--menu-bg);
  width: $base-sidebar-width;
}
```

**原因:** 集中管理布局样式,避免样式冲突和覆盖问题。

### 3. 使用 Flexbox/Grid 替代浮动

**❌ 不推荐:**

```scss
.main-container {
  float: right;
  width: calc(100% - 240px);
}
```

**✅ 推荐:**

```scss
.main-container {
  margin-left: $base-sidebar-width;
}
```

**原因:** margin-left 更简单直观,避免浮动带来的布局问题。

### 4. 移动端优先考虑性能

**✅ 推荐:**

```scss
@media (max-width: 768px) {
  .sidebar-container {
    // 使用 transform 而非 left
    transform: translate3d(-240px, 0, 0);
    // 启用硬件加速
    will-change: transform;
  }
}
```

**原因:** `transform` 比 `left/right` 性能更好,启用 GPU 加速。

### 5. 合理使用 Z-index

**✅ 推荐:**

```scss
:root {
  --z-sidebar: 1001;
  --z-header: 9;
  --z-mask: 999;
  --z-modal: 1050;
}

.sidebar-container {
  z-index: var(--z-sidebar);
}
```

**原因:** 统一管理 Z-index,避免层级冲突和混乱。

## 常见问题

### 1. 侧边栏折叠后菜单图标不居中

**问题原因:**

- Element Plus 默认样式干扰
- 图标容器未设置居中对齐

**解决方案:**

```scss
.hideSidebar .el-menu--collapse {
  .el-menu-item {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;

    .el-menu-tooltip__trigger {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }
  }
}
```

### 2. 移动端侧边栏遮罩层不显示

**问题原因:**

- 遮罩层 Z-index 过低
- 条件渲染逻辑错误

**解决方案:**

```vue
<template>
  <!-- 确保条件正确 -->
  <div
    v-if="device === 'mobile' && sidebar.opened"
    class="drawer-bg"
    @click="handleClickOutside"
  />
</template>

<style>
.drawer-bg {
  z-index: var(--z-mask); /* 确保高于侧边栏 */
}
</style>
```

### 3. 主容器宽度计算不准确

**问题原因:**

- 未考虑侧边栏折叠状态
- calc() 表达式错误

**解决方案:**

```scss
// 侧边栏展开
.fixed-header {
  width: calc(100% - 240px);
}

// 侧边栏折叠
.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

// 侧边栏隐藏
.sidebarHide .fixed-header {
  width: 100%;
}
```

### 4. 菜单项悬停效果失效

**问题原因:**

- CSS 变量未定义
- 选择器优先级不够

**解决方案:**

```scss
// 确保变量已定义
:root {
  --menu-hover-color: #f5f5f5;
  --menu-hover-text-color: #333333;
}

// 提高选择器优先级
.el-menu-item:hover:not(.is-active) {
  background-color: var(--menu-hover-color) !important;
  color: var(--menu-hover-text-color) !important;
}
```

### 5. 响应式断点切换不及时

**问题原因:**

- 未使用响应式 API
- 窗口大小监听失效

**解决方案:**

```typescript
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()
const WIDTH = 992

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    layout.toggleDevice('mobile')
    layout.closeSideBar()
  } else {
    layout.toggleDevice('pc')
    layout.openSideBar()
  }
})
```

## 调试技巧

### 1. 查看布局状态

```vue
<template>
  <div class="debug-panel">
    <p>设备类型: {{ device }}</p>
    <p>侧边栏状态: {{ sidebar.opened ? '展开' : '折叠' }}</p>
    <p>窗口宽度: {{ width }}px</p>
    <p>布局模式: {{ menuLayout }}</p>
  </div>
</template>
```

### 2. 添加边框调试

```scss
// 临时添加边框查看布局
.app-wrapper {
  border: 2px solid red;
}

.sidebar-container {
  border: 2px solid blue;
}

.main-container {
  border: 2px solid green;
}
```

### 3. 使用浏览器开发工具

- 打开开发者工具(F12)
- 切换到 Elements 面板
- 检查 `.app-wrapper`、`.sidebar-container`、`.main-container` 等元素
- 查看计算样式(Computed)和盒模型(Box Model)
- 使用设备模拟器测试响应式

### 4. 禁用动画调试

```scss
// 临时禁用所有动画
* {
  transition: none !important;
  animation: none !important;
}
```

## 扩展阅读

**相关主题:**

- SCSS 变量和混入
- CSS 变量和主题系统
- Flexbox 和 Grid 布局
- 响应式设计原则
- Element Plus 菜单组件
- Vue 3 组合式 API

**工具和库:**

- `useWindowSize` - VueUse 窗口大小监听
- `useLayout` - 自定义布局状态管理
- `el-scrollbar` - Element Plus 滚动条组件
- `el-menu` - Element Plus 菜单组件

