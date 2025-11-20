# 平板适配

## 介绍

平板适配是响应式设计的重要组成部分,专门针对 iPad、Android 平板等中等尺寸设备进行优化。平板设备介于手机和桌面之间,既要考虑触摸操作的便利性,又要充分利用较大的屏幕空间,为用户提供最佳的浏览和交互体验。

RuoYi-Plus-UniApp 前端系统采用移动优先的响应式设计策略,通过精心设计的断点系统和弹性布局,确保应用在各种平板设备上都能完美展示。平板适配不仅仅是简单的缩放,而是针对不同屏幕尺寸和使用场景进行的细致优化。

**核心特性:**

- **多断点支持** - 覆盖标准 iPad、iPad Pro 和 iPad mini 等不同尺寸
- **横竖屏适配** - 针对横屏和竖屏模式提供不同的布局优化
- **触摸友好** - 增大点击区域,优化手势操作体验
- **弹性布局** - 自动调整组件尺寸和间距,充分利用空间
- **性能优化** - 减少不必要的动画和特效,提升流畅度
- **一致体验** - 保持与桌面端相似的功能,避免功能缺失

## 断点系统

### 响应式断点定义

项目定义了多个响应式断点,覆盖从手机到超大屏幕的所有设备。

```scss
// 标准响应式断点
$sm: 768px;       // 小屏幕(手机横屏/小平板)
$md: 992px;       // 中等屏幕(平板)
$lg: 1200px;      // 大屏幕(桌面)
$xl: 1920px;      // 超大屏幕(高分辨率桌面)
```

**断点选择理由:**

- **768px (sm)** - iPhone Plus 横屏、iPad mini 竖屏
- **992px (md)** - 标准 iPad 横屏
- **1200px (lg)** - iPad Pro 横屏、笔记本电脑
- **1920px (xl)** - 1080p 桌面显示器

### iPad 专用断点

针对 Apple iPad 系列设备定义的精确断点。

```scss
// iPad 设备断点
$device-ipad: 800px;          // 标准 iPad (9.7/10.2 英寸)
$device-ipad-pro: 1180px;     // iPad Pro (11/12.9 英寸)
$device-ipad-vertical: 900px; // iPad 竖屏模式
```

**设备覆盖:**

| 设备 | 尺寸 | 竖屏宽度 | 横屏宽度 | 对应断点 |
|------|------|----------|----------|----------|
| iPad mini | 7.9" | 768px | 1024px | $sm / $device-ipad |
| iPad | 10.2" | 810px | 1080px | $device-ipad / $device-ipad-pro |
| iPad Air | 10.9" | 820px | 1180px | $device-ipad / $device-ipad-pro |
| iPad Pro 11" | 11" | 834px | 1194px | $device-ipad-pro |
| iPad Pro 12.9" | 12.9" | 1024px | 1366px | $device-ipad-pro |

### 断点 Mixin

使用 `respond-to` mixin 简化媒体查询编写。

```scss
/**
 * 响应式断点混合器
 * @param {String} $breakpoint - 断点名称(sm/md/lg/xl)
 */
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (max-width: #{$sm}) {
      @content;
    }
  } @else if $breakpoint == 'md' {
    @media (max-width: #{$md}) {
      @content;
    }
  } @else if $breakpoint == 'lg' {
    @media (max-width: #{$lg}) {
      @content;
    }
  } @else if $breakpoint == 'xl' {
    @media (max-width: #{$xl}) {
      @content;
    }
  }
}
```

**使用示例:**

```scss
.sidebar {
  width: 240px;

  // 平板上缩小侧边栏
  @include respond-to('md') {
    width: 200px;
  }

  // 手机上隐藏侧边栏
  @include respond-to('sm') {
    width: 0;
    overflow: hidden;
  }
}
```

## 布局适配

### 侧边栏适配

平板设备屏幕有限,需要优化侧边栏布局。

```scss
.sidebar-container {
  width: $base-sidebar-width; // 240px

  // 平板横屏: 缩小侧边栏
  @media (max-width: $md) {
    width: 200px;
  }

  // 平板竖屏: 折叠侧边栏
  @media (max-width: $device-ipad-vertical) and (orientation: portrait) {
    width: 54px; // 只显示图标

    .menu-title {
      display: none;
    }
  }

  // iPad mini 竖屏: 抽屉式侧边栏
  @media (max-width: $sm) {
    position: fixed;
    left: 0;
    transform: translateX(-100%);
    transition: transform var(--duration-normal);
    z-index: var(--z-sidebar);

    &.open {
      transform: translateX(0);
    }
  }
}
```

**适配策略:**

1. **iPad Pro 横屏** (≥1180px) - 保持标准宽度 240px
2. **标准 iPad 横屏** (992px - 1180px) - 缩小到 200px
3. **iPad 竖屏** (≤900px) - 折叠为 54px,只显示图标
4. **iPad mini** (≤768px) - 抽屉式,默认隐藏

### 主容器适配

主内容区域根据侧边栏状态动态调整。

```scss
.main-container {
  margin-left: $base-sidebar-width; // 240px
  transition: margin-left var(--duration-normal);

  // 平板横屏
  @media (max-width: $md) {
    margin-left: 200px;
  }

  // 平板竖屏
  @media (max-width: $device-ipad-vertical) {
    margin-left: 54px;
  }

  // iPad mini
  @media (max-width: $sm) {
    margin-left: 0;
  }
}
```

### 固定头部适配

头部宽度随侧边栏变化自动调整。

```scss
.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  width: calc(100% - #{$base-sidebar-width});
  transition: width var(--duration-normal);

  // 平板横屏
  @media (max-width: $md) {
    width: calc(100% - 200px);
  }

  // 平板竖屏
  @media (max-width: $device-ipad-vertical) {
    width: calc(100% - 54px);
  }

  // iPad mini
  @media (max-width: $sm) {
    width: 100%;
  }
}
```

### 内容区间距适配

根据屏幕大小调整内边距,优化空间利用。

```scss
.app-main {
  padding: 16px;

  // 平板上减小内边距
  @media (max-width: $md) {
    padding: 12px;
  }

  // iPad mini 进一步减小
  @media (max-width: $sm) {
    padding: 8px;
  }
}

// 卡片间距
.card-container {
  margin-bottom: 24px;

  @media (max-width: $md) {
    margin-bottom: 16px;
  }

  @media (max-width: $sm) {
    margin-bottom: 12px;
  }
}
```

## 栅格布局适配

### 响应式列数

使用 CSS Grid 或 Flexbox 实现响应式栅格。

```scss
.grid-container {
  display: grid;
  gap: 24px;
  // 桌面: 4 列
  grid-template-columns: repeat(4, 1fr);

  // iPad Pro 横屏: 3 列
  @media (max-width: $device-ipad-pro) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  // 标准 iPad: 2 列
  @media (max-width: $md) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  // iPad 竖屏/mini: 1 列
  @media (max-width: $sm) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
```

### Element Plus 栅格适配

Element Plus 的 `el-col` 支持响应式 span 配置。

```vue
<template>
  <el-row :gutter="16">
    <!-- 桌面 6 列, iPad 8 列, 手机 24 列(全宽) -->
    <el-col :xs="24" :sm="12" :md="8" :lg="6">
      <div class="grid-content">内容1</div>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6">
      <div class="grid-content">内容2</div>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6">
      <div class="grid-content">内容3</div>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6">
      <div class="grid-content">内容4</div>
    </el-col>
  </el-row>
</template>

<style scoped>
.grid-content {
  padding: 20px;
  background: var(--bg-level-2);
  border-radius: var(--radius-md);

  // 平板上调整内边距
  @media (max-width: $md) {
    padding: 16px;
  }
}
</style>
```

### Flexbox 响应式布局

```scss
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;

  .flex-item {
    // 桌面: 每行 4 个 (25% - gap)
    flex: 0 0 calc(25% - 18px);

    // iPad Pro: 每行 3 个
    @media (max-width: $device-ipad-pro) {
      flex: 0 0 calc(33.333% - 16px);
    }

    // 标准 iPad: 每行 2 个
    @media (max-width: $md) {
      flex: 0 0 calc(50% - 12px);
    }

    // iPad mini: 全宽
    @media (max-width: $sm) {
      flex: 0 0 100%;
    }
  }
}
```

## 表格适配

### 响应式表格

平板上表格列数较多时需要特殊处理。

```scss
.el-table {
  // 平板上启用横向滚动
  @media (max-width: $md) {
    .el-table__body-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch; // iOS 平滑滚动
    }

    // 固定表格最小宽度
    .el-table__body {
      min-width: 800px;
    }
  }

  // 调整单元格内边距
  @media (max-width: $md) {
    .el-table__cell {
      padding: 8px 6px;
    }
  }

  // 隐藏次要列
  @media (max-width: $sm) {
    .table-column-optional {
      display: none;
    }
  }
}
```

**最佳实践:**

```vue
<template>
  <el-table :data="tableData" class="responsive-table">
    <!-- 主要列,始终显示 -->
    <el-table-column prop="name" label="姓名" width="120" />
    <el-table-column prop="status" label="状态" width="100" />

    <!-- 可选列,平板上隐藏 -->
    <el-table-column
      prop="email"
      label="邮箱"
      class-name="table-column-optional"
    />
    <el-table-column
      prop="createTime"
      label="创建时间"
      class-name="table-column-optional"
    />

    <!-- 操作列,始终显示 -->
    <el-table-column label="操作" width="150" fixed="right">
      <template #default="{ row }">
        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
// 平板上隐藏可选列
@media (max-width: $md) {
  :deep(.table-column-optional) {
    display: none;
  }
}
</style>
```

### 卡片式列表

平板上推荐使用卡片式列表替代表格。

```vue
<template>
  <!-- 桌面显示表格 -->
  <el-table v-if="!isTablet" :data="tableData">
    <!-- 表格列定义 -->
  </el-table>

  <!-- 平板/手机显示卡片 -->
  <div v-else class="card-list">
    <div v-for="item in tableData" :key="item.id" class="card-item">
      <div class="card-header">
        <span class="card-title">{{ item.name }}</span>
        <el-tag :type="item.statusType">{{ item.status }}</el-tag>
      </div>
      <div class="card-body">
        <div class="card-field">
          <span class="field-label">邮箱:</span>
          <span class="field-value">{{ item.email }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">创建时间:</span>
          <span class="field-value">{{ item.createTime }}</span>
        </div>
      </div>
      <div class="card-footer">
        <el-button size="small" @click="handleEdit(item)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(item)">
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()
const isTablet = computed(() => width.value <= 992)
</script>

<style scoped lang="scss">
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-item {
  padding: 16px;
  background: var(--bg-level-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--bg-level-2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
}

.card-body {
  margin-bottom: 12px;
}

.card-field {
  display: flex;
  padding: 6px 0;
}

.field-label {
  width: 80px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.field-value {
  flex: 1;
  color: var(--text-primary);
}

.card-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
```

## 字体和图标适配

### 字体大小调整

平板上适当缩小字体,提升内容密度。

```scss
// 基础字体
body {
  font-size: 14px;

  @media (max-width: $md) {
    font-size: 13px;
  }

  @media (max-width: $sm) {
    font-size: 12px;
  }
}

// 标题字体
h1 {
  font-size: 2.5rem; // 40px

  @media (max-width: $md) {
    font-size: 2.25rem; // 36px
  }

  @media (max-width: $sm) {
    font-size: 2rem; // 32px
  }
}

h2 {
  font-size: 2rem; // 32px

  @media (max-width: $md) {
    font-size: 1.875rem; // 30px
  }

  @media (max-width: $sm) {
    font-size: 1.75rem; // 28px
  }
}

h3 {
  font-size: 1.5rem; // 24px

  @media (max-width: $md) {
    font-size: 1.375rem; // 22px
  }

  @media (max-width: $sm) {
    font-size: 1.25rem; // 20px
  }
}
```

### 图标尺寸调整

```scss
.icon {
  font-size: 20px;

  @media (max-width: $md) {
    font-size: 18px;
  }

  @media (max-width: $sm) {
    font-size: 16px;
  }

  &.icon-large {
    font-size: 32px;

    @media (max-width: $md) {
      font-size: 28px;
    }

    @media (max-width: $sm) {
      font-size: 24px;
    }
  }
}
```

## 触摸优化

### 按钮和点击区域

平板使用触摸操作,需要更大的点击区域。

```scss
// 按钮最小尺寸
.el-button {
  min-height: 32px;
  padding: 0 15px;

  // 平板上增大点击区域
  @media (max-width: $md) {
    min-height: 36px;
    padding: 0 16px;
  }

  // 小按钮
  &.el-button--small {
    min-height: 28px;
    padding: 0 12px;

    @media (max-width: $md) {
      min-height: 32px;
      padding: 0 14px;
    }
  }
}

// 表格操作按钮
.table-action-btn {
  padding: 8px 12px;

  @media (max-width: $md) {
    padding: 10px 14px;
  }
}
```

### 表单控件

```scss
// 输入框
.el-input__inner {
  height: 32px;

  @media (max-width: $md) {
    height: 36px;
    font-size: 14px;
  }
}

// 下拉选择
.el-select {
  .el-input__inner {
    @media (max-width: $md) {
      height: 36px;
    }
  }
}

// 复选框/单选框
.el-checkbox,
.el-radio {
  @media (max-width: $md) {
    // 增大选择框尺寸
    .el-checkbox__inner,
    .el-radio__inner {
      width: 16px;
      height: 16px;
    }
  }
}
```

## 横竖屏适配

### iPad 横屏优化

```scss
@media (min-width: $device-ipad) and
       (max-width: $device-ipad-pro) and
       (orientation: landscape) {
  // 内容区域居中,不要过宽
  .content-wrapper {
    max-width: 90%;
    margin: 0 auto;
  }

  // 表单两列布局
  .form-container {
    .el-form-item {
      width: 50%;
      display: inline-block;
    }
  }

  // 卡片网格
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### iPad 竖屏优化

```scss
@media (max-width: $device-ipad-vertical) and (orientation: portrait) {
  // 侧边栏折叠
  .sidebar-container {
    width: 54px;

    .menu-title {
      display: none;
    }
  }

  // 内容全宽
  .main-container {
    margin-left: 54px;
  }

  // 表单单列
  .form-container {
    .el-form-item {
      width: 100%;
    }
  }

  // 卡片单列
  .card-grid {
    grid-template-columns: 1fr;
  }
}
```

### 检测设备方向

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

// 检测屏幕方向
export function useOrientation() {
  const isPortrait = ref(window.innerHeight > window.innerWidth)

  const updateOrientation = () => {
    isPortrait.value = window.innerHeight > window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateOrientation)
    window.removeEventListener('orientationchange', updateOrientation)
  })

  return {
    isPortrait,
    isLandscape: computed(() => !isPortrait.value)
  }
}
```

**使用示例:**

```vue
<script setup lang="ts">
import { useOrientation } from '@/composables/useOrientation'

const { isPortrait, isLandscape } = useOrientation()
</script>

<template>
  <div :class="{ 'portrait-mode': isPortrait, 'landscape-mode': isLandscape }">
    <!-- 根据方向调整布局 -->
  </div>
</template>
```

## 性能优化

### 减少动画

平板设备性能有限,减少复杂动画。

```scss
@media (max-width: $md) {
  // 禁用非必要动画
  .fancy-animation {
    animation: none !important;
  }

  // 简化过渡效果
  .transition-element {
    transition: opacity 0.2s ease;
    // 移除 transform 动画
  }

  // 移除阴影效果
  .card {
    box-shadow: none;
    border: 1px solid var(--border-color);
  }
}
```

### 懒加载图片

```vue
<template>
  <img
    v-lazy="imageSrc"
    :alt="imageAlt"
    class="responsive-image"
  />
</template>

<style scoped>
.responsive-image {
  width: 100%;
  height: auto;

  // 平板上限制图片尺寸
  @media (max-width: $md) {
    max-width: 100%;
  }
}
</style>
```

## 完整示例

### 响应式页面布局

```vue
<template>
  <div class="page-container" :class="deviceClass">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <span v-if="!sidebarCollapsed" class="title">管理系统</span>
      </div>
      <nav class="sidebar-nav">
        <!-- 菜单项 -->
      </nav>
    </aside>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 固定头部 -->
      <header class="page-header">
        <button class="menu-toggle" @click="toggleSidebar">
          <i class="icon-menu" />
        </button>
        <div class="header-actions">
          <!-- 头部操作按钮 -->
        </div>
      </header>

      <!-- 内容区 -->
      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

// 检测设备类型
const deviceClass = computed(() => {
  if (width.value <= 768) return 'mobile'
  if (width.value <= 992) return 'tablet'
  if (width.value <= 1200) return 'desktop'
  return 'wide'
})

// 侧边栏状态
const sidebarCollapsed = ref(false)

// 平板竖屏时自动折叠
watch(width, (newWidth) => {
  if (newWidth <= 900) {
    sidebarCollapsed.value = true
  }
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped lang="scss">
.page-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background: var(--sidebar-bg);
  transition: width 0.3s;

  &.collapsed {
    width: 64px;

    .title {
      display: none;
    }
  }

  // 平板横屏
  @media (max-width: $md) {
    width: 200px;

    &.collapsed {
      width: 54px;
    }
  }

  // iPad 竖屏/mini
  @media (max-width: $device-ipad-vertical) {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);

  @media (max-width: $md) {
    height: 56px;
    padding: 0 16px;
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  @media (max-width: $md) {
    padding: 16px;
  }

  @media (max-width: $sm) {
    padding: 12px;
  }
}
</style>
```

## 最佳实践

### 1. 移动优先设计

**✅ 推荐:**

```scss
// 先定义移动端样式
.element {
  font-size: 14px;
  padding: 12px;

  // 然后添加平板和桌面样式
  @media (min-width: $sm + 1) {
    font-size: 15px;
    padding: 16px;
  }

  @media (min-width: $md + 1) {
    font-size: 16px;
    padding: 20px;
  }
}
```

**❌ 不推荐:**

```scss
// 桌面优先,需要更多覆盖
.element {
  font-size: 16px;
  padding: 20px;

  @media (max-width: $md) {
    font-size: 15px;
    padding: 16px;
  }

  @media (max-width: $sm) {
    font-size: 14px;
    padding: 12px;
  }
}
```

### 2. 使用相对单位

**✅ 推荐:**

```scss
.container {
  padding: 2%;    // 相对于父元素宽度
  font-size: 1rem; // 相对于根元素字体
  width: 90vw;    // 相对于视口宽度
}
```

**❌ 不推荐:**

```scss
.container {
  padding: 20px;  // 固定像素
  width: 1200px;  // 固定宽度
}
```

### 3. 触摸目标最小44px

```scss
.touch-target {
  // Apple 推荐的最小触摸目标: 44x44pt
  min-width: 44px;
  min-height: 44px;
  padding: 12px;

  @media (max-width: $md) {
    min-width: 48px; // 平板上稍大一点
    min-height: 48px;
  }
}
```

### 4. 避免固定定位过多

```scss
// ❌ 避免: 多个固定定位元素
.header { position: fixed; top: 0; }
.sidebar { position: fixed; left: 0; }
.footer { position: fixed; bottom: 0; }

// ✅ 推荐: 只固定必要元素
.header {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

### 5. 使用 Flexbox/Grid

```scss
// ✅ 推荐: 现代布局
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

// ❌ 避免: 浮动布局
.container {
  .item {
    float: left;
    width: 25%;
  }
}
```

## 常见问题

### 1. iPad 上布局错乱

**问题:** iPad 上某些元素位置不正确或重叠。

**原因:**
- 使用了固定像素宽度
- 忘记添加平板断点
- Z-index 层级冲突

**解决方案:**

```scss
// 使用相对单位和媒体查询
.element {
  width: 90%;
  max-width: 1200px;

  @media (max-width: $md) {
    width: 100%;
    max-width: none;
  }
}
```

### 2. 横竖屏切换时布局闪烁

**问题:** 旋转设备时布局跳动或闪烁。

**解决方案:**

```scss
// 添加平滑过渡
.responsive-element {
  transition: all 0.3s ease;
}

// 禁用方向变化时的动画
@media (orientation: portrait) {
  * {
    transition: none !important;
  }
}
```

### 3. 触摸滚动不流畅

**问题:** iPad 上滚动卡顿,不够流畅。

**解决方案:**

```scss
.scrollable-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; // iOS 平滑滚动
  overscroll-behavior: contain; // 防止滚动穿透
}
```

### 4. 表单输入框被虚拟键盘遮挡

**问题:** 点击输入框时,虚拟键盘遮住了输入框。

**解决方案:**

```typescript
// 输入框获得焦点时滚动到可见区域
onMounted(() => {
  const inputs = document.querySelectorAll('input, textarea')
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    })
  })
})
```

### 5. 平板上图片加载慢

**问题:** 大图片加载时间长,影响体验。

**解决方案:**

```vue
<template>
  <!-- 使用 srcset 提供多种尺寸 -->
  <img
    :srcset="`
      ${smallImage} 480w,
      ${mediumImage} 768w,
      ${largeImage} 1024w
    `"
    sizes="(max-width: 768px) 100vw, (max-width: 992px) 768px, 1024px"
    :src="largeImage"
    alt="Responsive Image"
  />
</template>
```

## 调试工具

### Chrome DevTools

1. 打开 Chrome 开发者工具 (F12)
2. 点击 Toggle Device Toolbar (Ctrl+Shift+M)
3. 选择设备: iPad / iPad Pro / iPad Mini
4. 测试横屏和竖屏模式

### Safari 响应式设计模式

1. 打开 Safari Web Inspector
2. 选择 Develop → Enter Responsive Design Mode
3. 选择 iPad 设备
4. 测试不同方向和尺寸

### 真机测试

```bash
# 使用 Xcode Simulator
open -a Simulator

# 或使用 BrowserStack 进行真机测试
# https://www.browserstack.com/
```

## 总结

平板适配的关键点:

1. **断点系统** - 定义合理的响应式断点,覆盖各种平板设备
2. **弹性布局** - 使用 Flexbox/Grid 实现自适应布局
3. **触摸优化** - 增大点击区域,优化手势操作
4. **横竖屏** - 针对不同方向提供优化布局
5. **性能** - 减少动画,懒加载资源
6. **测试** - 在真实设备上充分测试

遵循这些原则,可以为平板用户提供优秀的使用体验。
