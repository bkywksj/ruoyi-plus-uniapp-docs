# useLayout

布局管理组合函数，提供动态布局配置、响应式设计和界面状态管理功能，包括侧边栏、标签栏、菜单展开等布局相关的交互控制。

## 📋 功能特性

- **布局配置**: 动态切换布局模式（经典、现代、简洁）
- **侧边栏控制**: 侧边栏展开/收起、移动端抽屉模式
- **标签栏管理**: 标签页显示/隐藏、操作菜单
- **响应式支持**: 自适应移动端和桌面端
- **主题切换**: 配合主题系统的布局样式调整
- **状态持久化**: 布局配置自动保存到本地存储

## 🎯 基础用法

### 基本布局控制

```vue
<template>
  <div class="layout-container" :class="layoutClasses">
    <!-- 侧边栏 -->
    <aside
      v-show="!isMobile || sidebarVisible"
      :class="sidebarClasses"
      @click="handleSidebarClick">
      <div class="sidebar-content">
        <!-- 侧边栏内容 -->
      </div>
    </aside>

    <!-- 主内容区 -->
    <main :class="mainContentClasses">
      <!-- 顶部导航 -->
      <header class="navbar">
        <el-button
          :icon="sidebarCollapsed ? 'Expand' : 'Fold'"
          @click="toggleSidebar">
          {{ sidebarCollapsed ? '展开' : '收起' }}
        </el-button>

        <!-- 布局模式切换 -->
        <el-dropdown @command="changeLayoutMode">
          <span class="layout-switcher">
            布局模式 <el-icon><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="classic">经典布局</el-dropdown-item>
              <el-dropdown-item command="modern">现代布局</el-dropdown-item>
              <el-dropdown-item command="simple">简洁布局</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>

      <!-- 标签栏 -->
      <div v-if="showTagsView" class="tags-view">
        <!-- 标签页内容 -->
      </div>

      <!-- 页面内容 -->
      <div class="app-main">
        <router-view />
      </div>
    </main>

    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && sidebarVisible"
      class="sidebar-mask"
      @click="closeSidebar">
    </div>
  </div>
</template>

<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  // 布局状态
  layoutMode,
  sidebarCollapsed,
  sidebarVisible,
  showTagsView,
  isMobile,

  // 样式类
  layoutClasses,
  sidebarClasses,
  mainContentClasses,

  // 操作方法
  toggleSidebar,
  closeSidebar,
  changeLayoutMode,
  handleSidebarClick
} = useLayout()
</script>
```

### 响应式布局

```vue
<template>
  <div class="responsive-layout">
    <!-- 桌面端导航 -->
    <nav v-if="!isMobile" class="desktop-nav">
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapsed"
        mode="vertical">
        <!-- 菜单项 -->
      </el-menu>
    </nav>

    <!-- 移动端导航 -->
    <el-drawer
      v-if="isMobile"
      v-model="sidebarVisible"
      :with-header="false"
      direction="ltr"
      size="280px">
      <div class="mobile-nav">
        <!-- 移动端菜单 -->
      </div>
    </el-drawer>

    <!-- 内容区域 -->
    <section :class="['content-area', {
      'content-expanded': sidebarCollapsed,
      'content-mobile': isMobile
    }]">
      <!-- 响应式内容 -->
    </section>
  </div>
</template>

<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  isMobile,
  sidebarCollapsed,
  sidebarVisible,
  activeMenu,

  // 响应式监听
  onBreakpointChange,
  getBreakpoint
} = useLayout()

// 监听断点变化
onBreakpointChange((breakpoint) => {
  console.log('当前断点:', breakpoint)
  // sm, md, lg, xl, xxl
})
</script>
```

## 📱 移动端适配

### 移动端布局优化

```vue
<template>
  <div class="mobile-layout" v-if="isMobile">
    <!-- 移动端顶部栏 -->
    <header class="mobile-header">
      <el-button
        :icon="Menu"
        @click="toggleSidebar"
        class="menu-toggle">
      </el-button>

      <h1 class="page-title">{{ pageTitle }}</h1>

      <div class="header-actions">
        <!-- 头部操作按钮 -->
      </div>
    </header>

    <!-- 移动端侧边栏 -->
    <transition name="slide">
      <aside v-show="sidebarVisible" class="mobile-sidebar">
        <!-- 侧边栏内容 -->
      </aside>
    </transition>

    <!-- 底部导航栏 -->
    <nav class="bottom-navigation" v-if="showBottomNav">
      <div
        v-for="item in bottomNavItems"
        :key="item.path"
        :class="['nav-item', { active: item.active }]"
        @click="navigateTo(item.path)">
        <el-icon>{{ item.icon }}</el-icon>
        <span>{{ item.label }}</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  isMobile,
  sidebarVisible,
  toggleSidebar,
  pageTitle,
  showBottomNav,
  bottomNavItems,
  navigateTo
} = useLayout()
</script>
```

### 断点监听

```vue
<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  currentBreakpoint,
  isLargeScreen,
  isMediumScreen,
  isSmallScreen
} = useLayout()

// 根据屏幕尺寸调整组件行为
watch(currentBreakpoint, (newBreakpoint) => {
  switch (newBreakpoint) {
    case 'sm':
      // 小屏幕处理逻辑
      break
    case 'md':
      // 中等屏幕处理逻辑
      break
    case 'lg':
    case 'xl':
    case 'xxl':
      // 大屏幕处理逻辑
      break
  }
})
</script>
```

## 🎨 主题与布局

### 主题切换集成

```vue
<template>
  <div :class="themeLayoutClasses">
    <!-- 主题感知的布局 -->
    <div class="themed-sidebar" :style="sidebarStyles">
      <!-- 侧边栏内容 -->
    </div>

    <div class="themed-main" :style="mainStyles">
      <!-- 主内容区 -->
    </div>
  </div>
</template>

<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  // 主题相关样式
  themeLayoutClasses,
  sidebarStyles,
  mainStyles,

  // 主题切换
  onThemeChange,
  getCurrentTheme
} = useLayout()

// 监听主题变化
onThemeChange((theme) => {
  console.log('主题已切换到:', theme)
  // 可以在这里执行主题切换后的布局调整
})
</script>
```

### 自定义布局样式

```vue
<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  setCustomLayoutConfig,
  getLayoutConfig,
  resetLayoutConfig
} = useLayout()

// 设置自定义布局配置
const customConfig = {
  sidebarWidth: '280px',
  headerHeight: '64px',
  tagsViewHeight: '40px',
  borderRadius: '8px',
  transitionDuration: '0.3s'
}

setCustomLayoutConfig(customConfig)

// 重置为默认配置
const resetToDefault = () => {
  resetLayoutConfig()
}
</script>
```

## 🔧 高级功能

### 布局状态管理

```vue
<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  // 状态管理
  saveLayoutState,
  restoreLayoutState,
  clearLayoutState,

  // 布局历史
  layoutHistory,
  undoLayout,
  redoLayout,
  canUndoLayout,
  canRedoLayout
} = useLayout()

// 保存当前布局状态
const saveCurrentLayout = () => {
  const state = {
    mode: 'modern',
    sidebarCollapsed: false,
    showTagsView: true,
    customStyles: {
      primaryColor: '#409eff'
    }
  }

  saveLayoutState('my-layout', state)
}

// 恢复布局状态
const restoreMyLayout = () => {
  restoreLayoutState('my-layout')
}

// 布局历史操作
const handleUndo = () => {
  if (canUndoLayout.value) {
    undoLayout()
  }
}
</script>
```

### 动画与过渡

```vue
<template>
  <div class="animated-layout">
    <!-- 带动画的侧边栏 -->
    <transition
      :name="sidebarTransition"
      @enter="onSidebarEnter"
      @leave="onSidebarLeave">
      <aside v-show="sidebarVisible" class="animated-sidebar">
        <!-- 侧边栏内容 -->
      </aside>
    </transition>

    <!-- 带动画的主内容区 -->
    <transition :name="contentTransition" mode="out-in">
      <main :key="currentRoute" class="animated-main">
        <router-view />
      </main>
    </transition>
  </div>
</template>

<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  sidebarTransition,
  contentTransition,
  onSidebarEnter,
  onSidebarLeave,
  currentRoute,

  // 动画配置
  setAnimationConfig,
  enableAnimations,
  disableAnimations
} = useLayout()

// 配置动画效果
setAnimationConfig({
  sidebar: {
    enterFromClass: 'slide-enter-from',
    enterActiveClass: 'slide-enter-active',
    leaveToClass: 'slide-leave-to',
    duration: 300
  },
  content: {
    enterFromClass: 'fade-enter-from',
    enterActiveClass: 'fade-enter-active',
    leaveToClass: 'fade-leave-to',
    duration: 200
  }
})
</script>
```

## 📚 API 参考

### 布局状态

| 属性 | 类型 | 描述 |
|------|------|------|
| layoutMode | ComputedRef\<string\> | 当前布局模式 |
| sidebarCollapsed | ComputedRef\<boolean\> | 侧边栏是否收起 |
| sidebarVisible | ComputedRef\<boolean\> | 侧边栏是否可见 |
| showTagsView | ComputedRef\<boolean\> | 是否显示标签栏 |
| isMobile | ComputedRef\<boolean\> | 是否为移动端 |

### 样式类

| 属性 | 类型 | 描述 |
|------|------|------|
| layoutClasses | ComputedRef\<string[]\> | 布局容器样式类 |
| sidebarClasses | ComputedRef\<string[]\> | 侧边栏样式类 |
| mainContentClasses | ComputedRef\<string[]\> | 主内容区样式类 |

### 操作方法

| 方法 | 类型 | 描述 |
|------|------|------|
| toggleSidebar | () => void | 切换侧边栏展开/收起状态 |
| closeSidebar | () => void | 关闭侧边栏 |
| changeLayoutMode | (mode: string) => void | 切换布局模式 |
| setCustomLayoutConfig | (config: object) => void | 设置自定义布局配置 |

### 响应式功能

| 方法 | 类型 | 描述 |
|------|------|------|
| onBreakpointChange | (callback: function) => void | 监听断点变化 |
| getCurrentBreakpoint | () => string | 获取当前断点 |
| isLargeScreen | ComputedRef\<boolean\> | 是否为大屏幕 |
| isMediumScreen | ComputedRef\<boolean\> | 是否为中等屏幕 |

## 🎯 最佳实践

### 布局设计原则

1. **移动优先**：优先考虑移动端体验，然后适配桌面端
2. **一致性**：保持整个应用的布局风格一致
3. **可访问性**：确保布局对所有用户都友好
4. **性能优化**：避免不必要的重排和重绘

### 使用建议

1. **合理使用断点**：根据实际需求设置断点，避免过多断点
2. **状态持久化**：重要的布局状态应该持久化保存
3. **动画节制**：适度使用动画，避免影响性能
4. **测试全面**：在不同设备和屏幕尺寸下测试布局

### 性能优化

```vue
<script setup>
import { useLayout } from '@/composables/useLayout'

const {
  // 性能优化相关
  enableVirtualScroll,
  optimizeAnimations,
  lazyLoadSidebar
} = useLayout()

// 启用虚拟滚动（适用于长列表）
enableVirtualScroll({
  itemHeight: 40,
  buffer: 10
})

// 优化动画性能
optimizeAnimations({
  useTransform: true,
  useWillChange: true,
  reducedMotion: true // 遵循用户的减少动画偏好
})
</script>
```