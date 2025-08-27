# 布局概述

## 简介

布局系统是整个前端应用的骨架，负责页面的整体结构和组件的组织管理。本系统采用现代化的 Vue 3 + TypeScript 架构，提供了灵活、可扩展的布局解决方案。

## 整体架构

系统包含两套主要布局：

- **管理后台布局 (Layout)** - 功能完整的后台管理界面
- **前台展示布局 (HomeLayout)** - 简洁的前台展示界面

## 核心组件结构

```
layouts/
├── Layout.vue                    # 主布局容器
├── HomeLayout.vue               # 前台布局
└── components/
    ├── AppMain/                 # 主内容区
    │   ├── AppMain.vue         # 内容路由渲染
    │   ├── ParentView.vue      # 父级视图容器
    │   └── iframe/             # iframe内嵌页面
    │       ├── IframeToggle.vue # iframe切换组件
    │       └── InnerLink.vue    # 内部链接组件
    ├── Navbar/                  # 顶部导航栏
    │   ├── Navbar.vue          # 导航栏主体
    │   ├── TopNav.vue          # 水平导航菜单
    │   ├── Breadcrumb.vue      # 面包屑导航
    │   ├── Hamburger.vue       # 汉堡菜单按钮
    │   └── tools/              # 导航栏工具集
    │       ├── DocLink.vue     # 文档链接
    │       ├── FullscreenToggle.vue # 全屏切换
    │       ├── GitLink.vue     # Git链接
    │       ├── LangSelect.vue  # 语言选择
    │       ├── NavbarSearch.vue # 导航搜索
    │       ├── Notice.vue      # 通知消息
    │       ├── SizeSelect.vue  # 尺寸选择
    │       ├── TenantSelect.vue # 租户选择
    │       └── UserDropdown.vue # 用户下拉菜单
    ├── Sidebar/                 # 侧边栏系统
    │   ├── Sidebar.vue         # 侧边栏容器
    │   ├── SidebarItem.vue     # 菜单项组件
    │   ├── Logo.vue            # 应用Logo
    │   └── AppLink.vue         # 智能链接组件
    ├── TagsView/               # 标签视图系统
    │   ├── TagsView.vue        # 标签页管理
    │   └── ScrollPane.vue      # 滚动容器
    └── Settings/               # 设置面板
        └── Settings.vue        # 主题设置抽屉
```

## 布局特性

### 🎯 功能特性

- **响应式设计** - 自适应桌面端和移动端
- **主题切换** - 支持明暗主题和自定义主题色
- **布局配置** - 可配置的布局选项（顶部导航、标签页、固定头部等）
- **多标签管理** - 标签页的增删改查和右键菜单操作
- **权限控制** - 基于路由权限的菜单显示
- **国际化支持** - 多语言界面支持

### 🔧 技术特性

- **组件化架构** - 高度模块化的组件设计
- **状态管理** - 基于 Pinia 的状态管理
- **路由集成** - 与 Vue Router 深度集成
- **类型安全** - 完整的 TypeScript 类型定义
- **性能优化** - 组件懒加载和缓存策略

## 布局模式

### 标准模式 (Layout)

```vue
<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <Sidebar v-if="!sidebar.hide" />
    
    <div class="main-container">
      <!-- 顶部导航 -->
      <Navbar />
      
      <!-- 标签视图 (可选) -->
      <TagsView v-if="needTagsView" />
      
      <!-- 主内容区 -->
      <AppMain />
    </div>
    
    <!-- 设置面板 -->
    <Settings />
  </div>
</template>
```

**适用场景：** 管理后台、控制面板等功能性应用

### 简洁模式 (HomeLayout)

```vue
<template>
  <div class="home-wrapper">
    <!-- 主内容区 -->
    <AppMain />
  </div>
</template>
```

**适用场景：** 前台展示、登录页面等简洁界面

## 状态管理

布局系统使用多个 Pinia Store 管理状态：

| Store | 职责 | 主要状态 |
|-------|------|----------|
| `useStateStore` | 应用基础状态 | 侧边栏状态、设备类型、应用尺寸 |
| `useThemeStore` | 主题配置 | 主题色、深色模式、布局选项 |
| `useTagsViewStore` | 标签视图 | 访问过的视图、缓存的组件 |
| `usePermissionStore` | 权限路由 | 动态路由、菜单权限 |

## 核心组件功能

### Layout - 主布局
- 整体布局容器，协调各个子组件
- 响应式适配和设备检测
- 全局事件监听和状态管理

### Sidebar - 侧边栏

- **Sidebar.vue**: 侧边栏容器，处理菜单渲染和主题
- **SidebarItem.vue**: 菜单项组件，支持多级嵌套和权限控制
- **Logo.vue**: 应用Logo展示，支持折叠状态
- **AppLink.vue**: 智能链接处理内外部跳转

### Navbar - 顶部导航

- **Navbar.vue**: 导航栏主容器，整合各种工具组件
- **TopNav.vue**: 水平导航菜单，支持顶部导航模式
- **Breadcrumb.vue**: 面包屑导航，显示当前页面层级
- **Hamburger.vue**: 汉堡菜单按钮，控制侧边栏展开收起
- **tools/**: 丰富的工具组件集合，包括搜索、通知、设置等

### TagsView - 标签视图

- **TagsView.vue**: 多标签页管理，支持关闭、刷新等操作
- **ScrollPane.vue**: 标签滚动容器，支持鼠标滚轮和自动定位

### AppMain - 主内容区

- **AppMain.vue**: 路由内容渲染，支持缓存和动画
- **ParentView.vue**: 嵌套路由的父级容器
- **iframe/**: 外部页面内嵌支持，处理iframe的显示和切换

### Settings - 设置面板

- 主题配置面板，支持颜色、布局等个性化设置
- 配置持久化和实时预览

### HomeLayout - 前台布局

- 简洁的前台布局模式
- 纯内容展示，无复杂导航结构

## 扩展指南

### 添加新的布局模式

1. **创建布局组件**

```vue
<!-- CustomLayout.vue -->
<template>
  <div class="custom-layout">
    <!-- 自定义布局结构 -->
  </div>
</template>
```

2. **注册路由配置**

```typescript
// router/index.ts
{
  path: '/custom',
  component: () => import('@/layouts/CustomLayout.vue'),
  children: [/* 子路由 */]
}
```

## 最佳实践

### 推荐做法

- 使用计算属性响应状态变化
- 组件职责单一，功能内聚
- 合理使用 CSS 变量管理主题
- 响应式设计优先考虑移动端
- 适当使用组件缓存提升性能

### 避免做法

- 在布局组件中处理业务逻辑
- 硬编码样式值，不使用 CSS 变量
- 过度嵌套组件层级
- 忽略无障碍访问性
- 不考虑国际化需求

## 总结

布局系统是应用的基础架构，通过模块化设计、主题系统、响应式适配等特性，为开发者提供了灵活强大的布局解决方案。每个组件都有明确的职责分工，便于理解和维护。建议按照文档导航顺序深入学习各个组件的具体使用方法。
