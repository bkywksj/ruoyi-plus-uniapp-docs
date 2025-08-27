# 主布局(Layout)

## 简介

`Layout.vue` 是整个后台管理系统的核心布局容器，负责协调和管理所有子组件的显示和交互。它提供了完整的后台管理界面结构，包括侧边栏、顶部导航、标签视图、主内容区和设置面板的统一管理。

## 组件结构

```vue
<template>
  <div class="app-wrapper" :class="classObj" :style="{ '--current-color': theme }">
    <!-- 移动端侧边栏遮罩层 -->
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />

    <!-- 侧边栏 -->
    <Sidebar v-if="!sidebar.hide" class="sidebar-container" />

    <!-- 主内容区 -->
    <div class="main-container" :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }">
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
  </div>
</template>
```

## 核心功能

### 🏗️ 布局管理

- **响应式布局**: 根据屏幕尺寸自动调整布局模式
- **组件协调**: 统一管理各子组件的显示状态和交互
- **主题集成**: 通过 CSS 变量实现主题色的全局应用

### 📱 设备适配

- **设备检测**: 自动检测设备类型（PC/移动端）
- **断点响应**: 基于窗口宽度的断点切换
- **交互优化**: 移动端专门的交互处理（遮罩层、侧边栏等）

### 🎨 主题支持

- **动态主题**: 支持实时切换主题色
- **CSS 变量**: 通过 `--current-color` 变量全局应用主题
- **布局配置**: 支持多种布局选项的动态切换

## 关键特性

### 响应式断点

系统使用 992px 作为移动端和桌面端的断点：

```typescript
const WIDTH = 992 // 响应式断点

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    // 移动端模式
    useStateStore().toggleDevice('mobile')
    useStateStore().closeSideBar()
  } else {
    // 桌面端模式
    useStateStore().toggleDevice('pc') 
    useStateStore().openSideBar()
  }
})
```

### 条件渲染

```vue
<!-- 侧边栏条件显示 -->
<Sidebar v-if="!sidebar.hide" class="sidebar-container" />

<!-- 标签视图条件显示 -->
<tags-view v-if="needTagsView" />

<!-- 移动端遮罩层 -->
<div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
```

## 计算属性详解

### classObj - 布局状态类

```typescript
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,        // 侧边栏隐藏状态
  openSidebar: sidebar.value.opened,         // 侧边栏打开状态  
  withoutAnimation: sidebar.value.withoutAnimation, // 无动画状态
  mobile: device.value === 'mobile'          // 移动端状态
}))
```

### 布局配置

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `theme` | string | 当前主题色 |
| `sidebar` | object | 侧边栏状态 |
| `device` | string | 设备类型 |
| `needTagsView` | boolean | 是否显示标签视图 |
| `fixedHeader` | boolean | 是否固定头部 |

## 事件处理

### 移动端交互

```typescript
// 处理移动端点击侧边栏外区域关闭侧边栏
const handleClickOutside = () => {
  useStateStore().closeSideBar()
}
```

### 设置面板控制

```typescript
// 打开设置面板
const setLayout = () => {
  settingRef.value?.openSetting()
}
```

## 生命周期管理

组件挂载时初始化实时通信：

```typescript
onMounted(() => {
  // 建立实时通信连接
  webSocket.initialize()
  webSocket.connect()

  // 启用服务端推送事件
  useSSE(SystemConfig.api.baseUrl + '/resource/sse')
})
```

## Store 集成

Layout 组件深度集成了多个 Pinia Store：

### StateStore 集成

```typescript
const stateStore = useStateStore()

// 主要使用的状态
- sidebar.opened     // 侧边栏开关状态
- sidebar.hide       // 侧边栏隐藏状态
- device            // 设备类型 (pc/mobile)
```

### ThemeStore 集成

```typescript
const themeStore = useThemeStore()

// 主要使用的状态
- theme            // 主题颜色
- tagsView         // 标签视图开关
- fixedHeader      // 固定头部开关
```

## 响应式设计

### 断点定义

| 设备类型 | 屏幕宽度 | 侧边栏模式 | 主要特性 |
|----------|----------|------------|----------|
| 移动端 | < 992px | Overlay | 遮罩层、手势控制 |
| 桌面端 | ≥ 992px | Fixed | 固定位置、平滑切换 |

### 响应式监听

```typescript
const { width } = useWindowSize()
const WIDTH = 992

watchEffect(() => {
  // 根据窗口宽度切换设备模式
  if (width.value - 1 < WIDTH) {
    useStateStore().toggleDevice('mobile')
    useStateStore().closeSideBar()
  } else {
    useStateStore().toggleDevice('pc')
    useStateStore().openSideBar()
  }
})
```

## 使用示例

### 基本使用

```vue
<template>
  <Layout />
</template>

<script setup>
import Layout from '@/layouts/Layout.vue'
</script>
```

### 路由配置

```typescript
// router/index.ts
{
  path: '/admin',
  component: () => import('@/layouts/Layout.vue'),
  children: [
    {
      path: 'dashboard',
      component: () => import('@/views/dashboard/index.vue')
    }
  ]
}
```

### 主题定制

```typescript
// 在组件中使用
const themeStore = useThemeStore()

// 切换主题
themeStore.setTheme('#ff6b35')

// 切换布局选项
themeStore.toggleTagsView()
themeStore.toggleFixedHeader()
```

## 最佳实践

### 推荐做法

1. **状态管理集中化**
   ```typescript
   // 使用 store 管理布局状态
   const stateStore = useStateStore()
   stateStore.toggleSideBar()
   ```

2. **响应式友好**
   ```typescript
   // 使用计算属性响应状态变化
   const classObj = computed(() => ({
     hideSidebar: !sidebar.value.opened
   }))
   ```

3. **条件渲染优化**
   ```vue
   <!-- 使用 v-if 而非 v-show 优化性能 -->
   <Sidebar v-if="!sidebar.hide" />
   ```

### ❌ 避免做法

1. **直接操作 DOM**
   ```typescript
   // ❌ 不要直接操作 DOM
   document.querySelector('.sidebar').style.width = '200px'
   
   // ✅ 使用状态管理
   useStateStore().toggleSideBar()
   ```

2. **硬编码样式值**
   ```scss
   /* ❌ 硬编码 */
   .sidebar { width: 210px; }
   
   /* ✅ 使用变量 */
   .sidebar { width: $sideBarWidth; }
   ```

3. **忽略移动端体验**
   ```vue
   <!-- ❌ 忽略移动端 -->
   <div class="layout">
   
   <!-- ✅ 响应式处理 -->
   <div class="layout" :class="{ mobile: device === 'mobile' }">
   ```

## 故障排除

### 常见问题

1. **侧边栏显示异常**
    - 检查 `sidebar.hide` 状态
    - 确认 CSS 变量是否正确加载
    - 验证响应式断点设置

2. **主题切换不生效**
    - 检查 `--current-color` CSS 变量
    - 确认 ThemeStore 状态更新
    - 验证 CSS 变量的作用域

3. **移动端布局错乱**
    - 检查设备检测逻辑
    - 确认移动端专用样式
    - 验证遮罩层事件处理

### 调试技巧

```typescript
// 开发环境调试
if (process.env.NODE_ENV === 'development') {
  console.log('Layout State:', {
    sidebar: sidebar.value,
    device: device.value,
    theme: theme.value
  })
}
```

## 总结

Layout 组件是整个应用的布局基石，通过精心设计的组件结构、响应式适配、主题系统和状态管理，为用户提供了流畅的使用体验。理解 Layout 的工作原理和最佳实践，是开发高质量后台管理系统的重要基础。
