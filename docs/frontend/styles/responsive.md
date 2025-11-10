# 响应式设计

## 介绍

RuoYi-Plus-UniApp 前端项目采用移动优先（Mobile-First）的响应式设计理念，通过 UnoCSS 工具类和 SCSS 混合器双重体系，为不同屏幕尺寸和设备类型提供优化的用户体验。响应式设计系统覆盖从手机（500px）到超大屏幕（1920px+）的完整设备范围，确保应用在各种终端上都能完美呈现。

系统提供了两套互补的响应式方案：**UnoCSS 响应式工具类**适用于简单快速的样式调整，支持断点前缀（如 `md:flex`、`lg:hidden`）实现即写即用的响应式布局；**SCSS 响应式 Mixin** 则提供更强大的样式组织能力，通过 `@include respond-to()` 混合器，可以在组件样式中集中管理复杂的响应式逻辑。

**核心特性:**

- **双断点体系** - 标准化断点（sm/md/lg/xl）与设备特定断点（phone/ipad/notebook）相结合，覆盖所有主流设备
- **移动优先策略** - 采用 max-width 媒体查询，从大屏向小屏适配，确保移动端性能最优
- **工具类优先** - UnoCSS 提供丰富的响应式工具类，支持所有原子类的断点变体，开发效率高
- **混合器增强** - SCSS `respond-to` 混合器支持复杂样式逻辑，适合组件级响应式设计
- **设备语义化** - 提供 `$device-phone`、`$device-ipad`、`$device-notebook` 等语义化变量，代码可读性强
- **统一管理** - 所有断点值集中在 `_variables.scss` 中定义，维护简单，修改方便

项目的响应式设计不仅仅是简单的屏幕适配，更注重在不同设备上提供最佳的交互体验。例如，在移动端会自动隐藏侧边栏并提供抽屉式导航，在平板设备上会调整布局密度，在大屏幕上则充分利用空间展示更多信息。通过精心设计的断点系统和灵活的工具类组合，开发者可以轻松实现各种响应式需求。

## 响应式断点系统

### 标准化断点

项目定义了四个标准化响应式断点，遵循业界主流的断点规范，与 Bootstrap、Tailwind CSS 等主流框架保持一致：

```scss
/* 标准响应式断点 */
$sm: 768px;   // 小屏幕（平板竖屏及以下）
$md: 992px;   // 中等屏幕（平板横屏及以下）
$lg: 1200px;  // 大屏幕（小型桌面显示器及以下）
$xl: 1920px;  // 超大屏幕（大型桌面显示器及以下）

/* 断点映射表 */
$breakpoints: (
  'sm': $sm,
  'md': $md,
  'lg': $lg,
  'xl': $xl
) !default;
```

**断点说明:**

- **sm (768px)** - 小屏幕断点，主要针对平板竖屏及以下设备。低于此宽度的设备会进入移动端布局模式，通常会隐藏侧边栏、折叠导航菜单、调整表格为卡片展示等
- **md (992px)** - 中等屏幕断点，主要针对平板横屏及小型笔记本。系统在此断点会调整布局密度，可能会显示简化版侧边栏或自动折叠某些非关键功能区域
- **lg (1200px)** - 大屏幕断点，主要针对常规桌面显示器。在此宽度以上，系统会展示完整的桌面布局，包括侧边栏、多列布局、完整的数据表格等
- **xl (1920px)** - 超大屏幕断点，主要针对高分辨率显示器。在此宽度以上，系统会充分利用屏幕空间，可能会展示额外的信息面板、更大的间距和字体等

### 设备特定断点

除了标准断点外，项目还定义了一组语义化的设备特定断点，这些断点基于真实设备的物理尺寸，使代码更具可读性：

```scss
/* 设备特定断点 */
$device-notebook: 1600px;         // 笔记本电脑
$device-ipad-pro: 1180px;         // iPad Pro (横屏)
$device-ipad: 800px;              // iPad (横屏)
$device-ipad-vertical: 900px;     // iPad (竖屏)
$device-phone: 500px;             // 手机
```

**设备断点说明:**

- **$device-phone (500px)** - 手机设备断点，涵盖 iPhone SE、iPhone 12/13/14 等主流手机竖屏宽度。低于此宽度需要提供极简化的移动端体验
- **$device-ipad (800px)** - iPad 横屏断点，对应 iPad、iPad Air 等设备的横屏模式，适合双列布局
- **$device-ipad-vertical (900px)** - iPad 竖屏断点，对应 iPad 系列设备的竖屏模式，适合单列或紧凑双列布局
- **$device-ipad-pro (1180px)** - iPad Pro 横屏断点，对应 iPad Pro 12.9" 等大屏平板的横屏模式，可以展示接近桌面端的体验
- **$device-notebook (1600px)** - 笔记本电脑断点，对应 13-15 寸笔记本的常见分辨率，适合完整的桌面端体验

**使用场景对比:**

| 场景 | 使用断点 | 理由 |
|------|---------|------|
| 通用响应式布局 | `$sm`、`$md`、`$lg`、`$xl` | 标准化，与主流框架一致，便于维护 |
| 特定设备优化 | `$device-phone`、`$device-ipad` 等 | 语义化清晰，针对真实设备优化 |
| 登录/认证页面 | `$device-ipad-pro`、`$device-phone` | 需要针对不同设备提供差异化体验 |
| 后台管理布局 | `$md`、`$lg` | 标准断点即可满足需求 |

### 断点使用建议

**何时使用标准断点:**

```scss
// ✅ 推荐：通用布局调整
.container {
  max-width: 1200px;

  @include respond-to('lg') {
    max-width: 960px;
  }

  @include respond-to('md') {
    max-width: 720px;
  }

  @include respond-to('sm') {
    max-width: 100%;
    padding: 0 15px;
  }
}
```

**何时使用设备断点:**

```scss
// ✅ 推荐：针对特定设备优化
.login-page {
  display: flex;

  @media (max-width: $device-ipad-pro) {
    // iPad Pro 及以下设备：简化布局
    background: transparent;
  }

  @media (max-width: $device-phone) {
    // 手机设备：完全重构布局
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
```

## UnoCSS 响应式工具类

### 响应式前缀系统

UnoCSS 通过 `presetUno` 预设提供了完整的响应式前缀支持，所有原子类都可以添加断点前缀实现响应式变化：

```html
<!-- 响应式显示/隐藏 -->
<div class="block md:hidden">
  仅在中等屏幕以下显示（移动端和平板）
</div>

<div class="hidden md:block">
  仅在中等屏幕以上显示（桌面端）
</div>

<!-- 响应式布局 -->
<div class="flex-col md:flex-row">
  移动端垂直排列，桌面端水平排列
</div>

<!-- 响应式尺寸 -->
<div class="w-full md:w-1/2 lg:w-1/3">
  移动端全宽，平板端半宽，桌面端三分之一宽
</div>

<!-- 响应式间距 -->
<div class="p-4 md:p-6 lg:p-8">
  不同屏幕使用不同内边距
</div>

<!-- 响应式文字 -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">
  响应式标题大小
</h1>
```

### 断点前缀对应关系

UnoCSS 的断点前缀与标准断点的对应关系（采用 min-width 策略）：

| 前缀 | 断点值 | 媒体查询 | 适用设备 |
|------|--------|---------|---------|
| 无前缀 | - | 默认样式 | 所有设备 |
| `sm:` | 640px | `@media (min-width: 640px)` | 平板及以上 |
| `md:` | 768px | `@media (min-width: 768px)` | 平板横屏及以上 |
| `lg:` | 1024px | `@media (min-width: 1024px)` | 桌面及以上 |
| `xl:` | 1280px | `@media (min-width: 1280px)` | 大屏桌面及以上 |
| `2xl:` | 1536px | `@media (min-width: 1536px)` | 超大屏幕 |

**注意:** UnoCSS 的默认断点值与项目 SCSS 断点略有不同。UnoCSS 采用 **min-width 移动优先**策略，而项目 SCSS 采用 **max-width 桌面优先**策略。在实际使用中需要注意这一差异。

### 常用响应式工具类组合

#### 1. 响应式容器

```vue
<template>
  <div class="container-responsive">
    <div class="content-box">
      响应式容器示例
    </div>
  </div>
</template>

<style scoped>
.container-responsive {
  /* 默认移动端样式 */
  @apply w-full px-4;

  /* 平板及以上 */
  @apply md:px-6 md:max-w-3xl md:mx-auto;

  /* 桌面及以上 */
  @apply lg:px-8 lg:max-w-5xl;

  /* 大屏桌面 */
  @apply xl:max-w-7xl;
}

.content-box {
  @apply bg-white dark:bg-dark-800 rounded p-4 md:p-6 lg:p-8;
}
</style>
```

#### 2. 响应式网格布局

```vue
<template>
  <div class="grid-responsive">
    <div v-for="item in items" :key="item.id" class="grid-item">
      {{ item.title }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const items = ref([
  { id: 1, title: '项目 1' },
  { id: 2, title: '项目 2' },
  { id: 3, title: '项目 3' },
  { id: 4, title: '项目 4' },
])
</script>

<style scoped>
.grid-responsive {
  /* 移动端：单列 */
  @apply grid grid-cols-1 gap-4;

  /* 平板：双列 */
  @apply md:grid-cols-2 md:gap-6;

  /* 桌面：三列 */
  @apply lg:grid-cols-3;

  /* 大屏：四列 */
  @apply xl:grid-cols-4;
}

.grid-item {
  @apply bg-bg-base border border-border rounded p-4;
  @apply hover:shadow-lg transition-shadow;
}
</style>
```

#### 3. 响应式导航栏

```vue
<template>
  <nav class="navbar-responsive">
    <div class="navbar-brand">
      Logo
    </div>

    <!-- 移动端菜单按钮 -->
    <button class="menu-toggle md:hidden" @click="toggleMenu">
      <Icon code="menu" />
    </button>

    <!-- 导航菜单 -->
    <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
      <a href="#" class="menu-item">首页</a>
      <a href="#" class="menu-item">产品</a>
      <a href="#" class="menu-item">服务</a>
      <a href="#" class="menu-item">关于</a>
    </div>
  </nav>
</template>

<script lang="ts" setup>
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<style scoped>
.navbar-responsive {
  @apply flex items-center justify-between;
  @apply bg-white dark:bg-dark-800 shadow-md;
  @apply px-4 py-3 md:px-6 lg:px-8;
}

.navbar-brand {
  @apply text-xl font-bold text-primary;
  @apply md:text-2xl;
}

.menu-toggle {
  @apply p-2 text-2xl text-text-base;
  @apply hover:bg-bg-overlay rounded;
}

.navbar-menu {
  /* 移动端：隐藏，通过绝对定位显示 */
  @apply hidden absolute top-full left-0 right-0;
  @apply flex-col bg-white dark:bg-dark-800 shadow-lg;
  @apply md:flex md:relative md:flex-row md:shadow-none;
  @apply md:ml-auto md:gap-4;

  &.is-active {
    @apply flex md:flex;
  }
}

.menu-item {
  @apply block px-4 py-3 text-text-base;
  @apply hover:bg-bg-overlay hover:text-primary;
  @apply md:px-3 md:py-2 md:rounded;
  @apply transition-colors;
}
</style>
```

#### 4. 响应式卡片列表

```vue
<template>
  <div class="card-list-responsive">
    <div v-for="card in cards" :key="card.id" class="card-item">
      <img :src="card.image" :alt="card.title" class="card-image" />
      <div class="card-content">
        <h3 class="card-title">{{ card.title }}</h3>
        <p class="card-description">{{ card.description }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const cards = ref([
  {
    id: 1,
    title: '卡片标题 1',
    description: '这是卡片的描述内容',
    image: '/images/card1.jpg'
  },
  // ... 更多卡片
])
</script>

<style scoped>
.card-list-responsive {
  @apply grid gap-4;

  /* 移动端：单列 */
  @apply grid-cols-1;

  /* 小平板：双列 */
  @apply sm:grid-cols-2 sm:gap-6;

  /* 大平板/小桌面：三列 */
  @apply lg:grid-cols-3;

  /* 大屏桌面：四列 */
  @apply xl:grid-cols-4 xl:gap-8;
}

.card-item {
  @apply bg-white dark:bg-dark-800 rounded-lg overflow-hidden;
  @apply shadow-base hover:shadow-light transition-shadow;
}

.card-image {
  @apply w-full h-48 object-cover;
  @apply md:h-56 lg:h-64;
}

.card-content {
  @apply p-4 md:p-6;
}

.card-title {
  @apply text-lg font-bold text-heading mb-2;
  @apply md:text-xl;
}

.card-description {
  @apply text-sm text-text-secondary;
  @apply md:text-base;
  @apply line-clamp-2;
}
</style>
```

### 响应式工具类最佳实践

**1. 移动优先原则**

```html
<!-- ✅ 推荐：从移动端开始，向大屏幕扩展 -->
<div class="text-sm md:text-base lg:text-lg">
  移动端小字体，逐步增大
</div>

<!-- ❌ 不推荐：从桌面端开始 -->
<div class="text-lg md:text-base sm:text-sm">
  难以维护和理解
</div>
```

**2. 使用语义化间距**

```html
<!-- ✅ 推荐：使用渐进式间距 -->
<div class="p-4 md:p-6 lg:p-8 xl:p-12">
  间距随屏幕大小渐进增加
</div>

<!-- ❌ 不推荐：跳跃式间距 -->
<div class="p-2 md:p-12">
  间距变化太大，视觉不连贯
</div>
```

**3. 合理使用显示/隐藏**

```html
<!-- ✅ 推荐：为不同设备提供不同的内容展示 -->
<div class="block md:hidden">
  <MobileMenu />
</div>
<div class="hidden md:block">
  <DesktopMenu />
</div>

<!-- ❌ 不推荐：过度隐藏内容 -->
<div class="hidden xl:block">
  <!-- 只在超大屏幕显示，过于激进 -->
</div>
```

## SCSS 响应式 Mixin

### respond-to 混合器

项目提供了 `respond-to` 混合器，用于在 SCSS 中快速创建响应式样式。该混合器支持标准断点（sm、md、lg、xl），采用 **max-width** 策略，从大屏向小屏适配：

```scss
/**
 * 响应式断点混合器
 * @param {string} $breakpoint - 断点名称 (sm|md|lg|xl)
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
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}
```

### 基本使用

**导入 Mixin:**

```scss
// 在组件样式中导入
@use '@/assets/styles/abstracts/variables' as *;
@use '@/assets/styles/abstracts/mixins' as *;

.my-component {
  // 使用 respond-to mixin
}
```

**简单示例:**

```scss
.container {
  max-width: 1200px;
  padding: 0 20px;

  // 大屏幕及以下（≤ 1200px）
  @include respond-to('lg') {
    max-width: 960px;
    padding: 0 15px;
  }

  // 中等屏幕及以下（≤ 992px）
  @include respond-to('md') {
    max-width: 720px;
  }

  // 小屏幕及以下（≤ 768px）
  @include respond-to('sm') {
    max-width: 100%;
    padding: 0 10px;
  }
}
```

### 复杂布局示例

#### 1. 侧边栏响应式布局

```scss
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;

  // 中等屏幕及以下：移动端模式
  @include respond-to('md') {
    &.mobile {
      .main-container {
        margin-left: 0;
      }

      .fixed-header {
        width: 100%;
      }

      // 移动端侧边栏隐藏状态
      &.hideSidebar {
        .sidebar-container {
          pointer-events: none;
          transition-duration: var(--duration-normal);
          transform: translate3d(-240px, 0, 0);
        }
      }
    }
  }
}

.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 240px;
  background-color: var(--menu-bg);
  transition: width var(--duration-normal);

  // 小屏幕：完全隐藏
  @include respond-to('sm') {
    transform: translate3d(-100%, 0, 0);

    &.is-open {
      transform: translate3d(0, 0, 0);
    }
  }
}
```

#### 2. 表单响应式布局

```scss
.form-container {
  .el-form {
    // 默认桌面端：双列布局
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    // 中等屏幕：单列布局
    @include respond-to('md') {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    // 小屏幕：紧凑布局
    @include respond-to('sm') {
      gap: 12px;

      .el-form-item {
        margin-bottom: 12px;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;

    // 小屏幕：按钮全宽排列
    @include respond-to('sm') {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
```

#### 3. 数据表格响应式

```scss
.table-container {
  overflow-x: auto;

  .el-table {
    min-width: 100%;

    // 中等屏幕：调整字体和间距
    @include respond-to('md') {
      font-size: 13px;

      .el-table__header th,
      .el-table__body td {
        padding: 8px 10px;
      }
    }

    // 小屏幕：隐藏次要列
    @include respond-to('sm') {
      .el-table__column--secondary {
        display: none;
      }

      // 切换为卡片视图
      &.mobile-card-view {
        .el-table__header {
          display: none;
        }

        .el-table__body {
          display: block;

          tr {
            display: block;
            margin-bottom: 16px;
            padding: 16px;
            background: var(--bg-base);
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          td {
            display: block;
            text-align: left;
            padding: 8px 0;
            border: none;

            &:before {
              content: attr(data-label);
              font-weight: bold;
              display: inline-block;
              width: 100px;
            }
          }
        }
      }
    }
  }
}
```

### 结合设备断点使用

虽然 `respond-to` 混合器只支持标准断点，但可以直接使用 `@media` 查询结合设备断点变量：

```scss
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  // iPad Pro 及以下：简化背景
  @media (max-width: $device-ipad-pro) {
    background: transparent;
  }

  // 手机设备：全屏固定布局
  @media (max-width: $device-phone) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .login-form {
      width: 100%;
      padding: 20px;
    }
  }

  .login-left-view {
    flex: 1;

    // iPad 横屏及以下：隐藏左侧品牌区
    @media (max-width: $device-ipad) {
      display: none;
    }
  }

  .login-right-view {
    width: 480px;

    // 笔记本及以下：调整宽度
    @media (max-width: $device-notebook) {
      width: 420px;
    }

    // iPad 及以下：全宽
    @media (max-width: $device-ipad) {
      width: 100%;
      max-width: 420px;
    }

    // 手机：完全全宽
    @media (max-width: $device-phone) {
      max-width: 100%;
    }
  }
}
```

## 响应式布局模式

### 1. Flex 弹性布局

Flex 布局是最常用的响应式布局方式，通过改变 `flex-direction` 可以轻松实现横向和纵向切换：

```vue
<template>
  <div class="flex-layout">
    <aside class="sidebar">侧边栏</aside>
    <main class="main-content">主内容</main>
  </div>
</template>

<style scoped lang="scss">
.flex-layout {
  display: flex;
  gap: 20px;

  // 中等屏幕及以下：纵向排列
  @include respond-to('md') {
    flex-direction: column;
  }
}

.sidebar {
  width: 280px;
  background: var(--bg-base);

  @include respond-to('md') {
    width: 100%;
  }
}

.main-content {
  flex: 1;
  background: var(--bg-page);
}
</style>
```

### 2. Grid 网格布局

Grid 布局提供了更强大的二维布局能力，非常适合复杂的响应式设计：

```vue
<template>
  <div class="grid-layout">
    <header class="header">Header</header>
    <aside class="sidebar">Sidebar</aside>
    <main class="main">Main Content</main>
    <aside class="aside">Aside</aside>
    <footer class="footer">Footer</footer>
  </div>
</template>

<style scoped lang="scss">
.grid-layout {
  display: grid;
  min-height: 100vh;
  gap: 20px;

  // 桌面端：复杂网格布局
  grid-template-columns: 240px 1fr 280px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";

  // 中等屏幕：简化为双列
  @include respond-to('md') {
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      "header header"
      "sidebar main"
      "footer footer";

    .aside {
      display: none;
    }
  }

  // 小屏幕：单列布局
  @include respond-to('sm') {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "footer";
    gap: 12px;

    .sidebar,
    .aside {
      display: none;
    }
  }
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
</style>
```

### 3. Container Queries（容器查询）

对于组件级的响应式设计，可以使用 CSS Container Queries（需要现代浏览器支持）：

```vue
<template>
  <div class="card-container">
    <div class="card">
      <img src="/image.jpg" alt="Image" class="card-image" />
      <div class="card-body">
        <h3 class="card-title">标题</h3>
        <p class="card-text">内容文本</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  border-radius: 8px;
  overflow: hidden;

  // 当容器宽度 ≥ 600px 时，横向排列
  @container card (min-width: 600px) {
    flex-direction: row;

    .card-image {
      width: 40%;
      height: auto;
    }

    .card-body {
      width: 60%;
    }
  }
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 20px;
}
</style>
```

### 4. 流式布局（Fluid Layout）

流式布局使用百分比和 `max-width` 实现自适应：

```vue
<template>
  <div class="fluid-container">
    <div class="fluid-content">
      <h1>流式布局示例</h1>
      <p>内容会根据容器宽度自动调整</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fluid-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @include respond-to('md') {
    width: 95%;
    max-width: 960px;
  }

  @include respond-to('sm') {
    width: 100%;
    padding: 15px;
  }
}

.fluid-content {
  h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
  }

  p {
    font-size: clamp(0.875rem, 2vw, 1.125rem);
    line-height: 1.6;
  }
}
</style>
```

## 最佳实践

### 1. 移动优先开发

始终从移动端开始设计和开发，然后逐步增强到大屏幕：

```vue
<template>
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product-item">
      {{ product.name }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-list {
  // 移动端：单列，小间距
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 12px;

  // 平板：双列
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
  }

  // 桌面：三列
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
  }

  // 大屏：四列
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}
```

### 2. 使用相对单位

优先使用 `rem`、`em`、`%`、`vw`、`vh` 等相对单位，避免固定像素值：

```scss
// ✅ 推荐：使用相对单位
.responsive-text {
  font-size: clamp(0.875rem, 2.5vw, 1.25rem); // 自适应字体大小
  padding: 1em 2em;                            // 基于字体大小的内边距
  max-width: 80%;                              // 相对于父容器的宽度
  margin: 0 auto;
}

// ❌ 不推荐：使用固定像素
.fixed-text {
  font-size: 16px;
  padding: 16px 32px;
  max-width: 960px;
}
```

### 3. 触摸友好设计

为移动设备提供足够大的点击区域（最小 44x44 像素）：

```scss
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  min-height: 44px;          // 最小触摸区域
  font-size: 16px;
  border-radius: 8px;

  @include respond-to('sm') {
    width: 100%;             // 移动端全宽按钮
    padding: 14px 20px;      // 稍大的内边距
  }
}

.icon-button {
  width: 44px;
  height: 44px;
  padding: 0;

  @include respond-to('sm') {
    width: 48px;             // 移动端更大的图标按钮
    height: 48px;
  }
}
```

### 4. 优化图片加载

使用响应式图片技术，为不同设备加载合适尺寸的图片：

```vue
<template>
  <!-- 使用 srcset 和 sizes -->
  <img
    src="/images/hero-800.jpg"
    srcset="
      /images/hero-400.jpg 400w,
      /images/hero-800.jpg 800w,
      /images/hero-1200.jpg 1200w,
      /images/hero-1600.jpg 1600w
    "
    sizes="
      (max-width: 640px) 100vw,
      (max-width: 1024px) 80vw,
      1200px
    "
    alt="Hero Image"
    class="hero-image"
  />

  <!-- 使用 picture 元素 -->
  <picture>
    <source
      media="(max-width: 640px)"
      srcset="/images/mobile-banner.jpg"
    />
    <source
      media="(max-width: 1024px)"
      srcset="/images/tablet-banner.jpg"
    />
    <img
      src="/images/desktop-banner.jpg"
      alt="Banner"
      class="banner-image"
    />
  </picture>
</template>

<style scoped lang="scss">
.hero-image,
.banner-image {
  width: 100%;
  height: auto;
  display: block;
}
</style>
```

### 5. 合理使用断点

避免为每个像素值创建断点，使用有意义的断点：

```scss
// ❌ 不推荐：过多的断点
.container {
  @media (max-width: 1199px) { /* ... */ }
  @media (max-width: 1150px) { /* ... */ }
  @media (max-width: 1100px) { /* ... */ }
  @media (max-width: 1050px) { /* ... */ }
  // ...
}

// ✅ 推荐：使用标准断点
.container {
  max-width: 1200px;

  @include respond-to('lg') {
    max-width: 960px;
  }

  @include respond-to('md') {
    max-width: 720px;
  }

  @include respond-to('sm') {
    max-width: 100%;
  }
}
```

### 6. 性能优化

减少不必要的媒体查询，合并相同断点的样式：

```scss
// ❌ 不推荐：分散的媒体查询
.header {
  height: 80px;

  @include respond-to('md') {
    height: 60px;
  }
}

.navbar {
  padding: 20px;

  @include respond-to('md') {
    padding: 15px;
  }
}

.logo {
  font-size: 24px;

  @include respond-to('md') {
    font-size: 20px;
  }
}

// ✅ 推荐：合并媒体查询
.header {
  height: 80px;
}

.navbar {
  padding: 20px;
}

.logo {
  font-size: 24px;
}

@include respond-to('md') {
  .header {
    height: 60px;
  }

  .navbar {
    padding: 15px;
  }

  .logo {
    font-size: 20px;
  }
}
```

### 7. 测试多设备

在开发过程中使用浏览器开发者工具测试多种设备尺寸：

**Chrome DevTools 常用设备预设:**
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad Air (820x1180)
- iPad Pro 12.9" (1024x1366)
- Nest Hub Max (1280x800)

**手动测试断点:**
```
500px  - 手机竖屏
768px  - 平板竖屏
992px  - 平板横屏
1200px - 小型桌面
1600px - 笔记本
1920px - 大屏显示器
```

## 常见问题

### 1. UnoCSS 和 SCSS 断点不一致

**问题描述:**

UnoCSS 使用 min-width（移动优先），而项目 SCSS 使用 max-width（桌面优先），导致断点行为不一致。

**问题原因:**

- UnoCSS 默认采用 Tailwind CSS 的 min-width 策略
- 项目 SCSS 历史上采用 max-width 策略
- 两者断点值也不完全相同（UnoCSS 的 md 是 768px，SCSS 的 md 是 992px）

**解决方案:**

选择一个主要策略，并在使用时保持一致：

```vue
<template>
  <div class="responsive-container">
    <!-- 使用 UnoCSS 时：移动优先 -->
    <div class="w-full md:w-1/2 lg:w-1/3">
      UnoCSS 响应式
    </div>
  </div>
</template>

<style scoped lang="scss">
// 使用 SCSS 时：桌面优先
.responsive-container {
  max-width: 1200px;

  @include respond-to('md') {
    max-width: 960px;
  }

  @include respond-to('sm') {
    max-width: 100%;
  }
}
</style>
```

**推荐做法:**

- **HTML 类名**: 优先使用 UnoCSS 工具类（移动优先）
- **组件样式**: 使用 SCSS Mixin（桌面优先）
- **避免混用**: 不要在同一个元素上同时使用两种策略

### 2. 侧边栏在移动端无法正确隐藏

**问题描述:**

在移动设备上，侧边栏没有完全隐藏，或者隐藏后无法通过滑动显示。

**问题原因:**

- 没有正确设置 `transform` 或 `display` 属性
- 缺少移动端的遮罩层
- 没有处理触摸事件

**解决方案:**

```scss
.app-wrapper {
  position: relative;

  // 移动端模式
  &.mobile {
    .main-container {
      margin-left: 0;
    }

    // 侧边栏默认隐藏
    .sidebar-container {
      position: fixed;
      z-index: 1001;
      transform: translate3d(-100%, 0, 0);
      transition: transform 0.3s ease;
    }

    // 显示侧边栏
    &.openSidebar {
      .sidebar-container {
        transform: translate3d(0, 0, 0);
      }

      // 添加遮罩层
      .drawer-bg {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: 999;
      }
    }
  }
}
```

**Vue 组件处理:**

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const isMobile = computed(() => appStore.device === 'mobile')
const sidebarOpened = computed(() => !appStore.sidebar.opened)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const closeSidebar = () => {
  if (isMobile.value) {
    appStore.closeSidebar()
  }
}
</script>

<template>
  <div
    :class="{
      'app-wrapper': true,
      'mobile': isMobile,
      'openSidebar': sidebarOpened && isMobile
    }"
  >
    <div v-if="isMobile && sidebarOpened" class="drawer-bg" @click="closeSidebar" />
    <Sidebar />
    <MainContainer />
  </div>
</template>
```

### 3. 表格在移动端显示不完整

**问题描述:**

数据表格在小屏幕设备上横向滚动体验差，或者重要列被隐藏。

**问题原因:**

- 表格列过多，小屏幕无法容纳
- 没有为移动端优化表格展示方式
- 缺少横向滚动提示

**解决方案1: 响应式表格（横向滚动）**

```vue
<template>
  <div class="table-wrapper">
    <div class="table-scroll-hint" v-if="isMobile">
      <Icon code="arrow-right" />
      <span>左右滑动查看更多</span>
    </div>
    <div class="table-container">
      <el-table :data="tableData">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" class-name="hidden-sm" />
        <el-table-column prop="phone" label="电话" min-width="150" class-name="hidden-sm" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="120" fixed="right" />
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-wrapper {
  position: relative;
}

.table-scroll-hint {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
  font-size: 14px;
  border-radius: 4px;
  margin-bottom: 12px;

  @include respond-to('sm') {
    display: flex;
  }
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; // iOS 平滑滚动

  @include respond-to('sm') {
    // 隐藏次要列
    :deep(.hidden-sm) {
      display: none;
    }
  }
}
</style>
```

**解决方案2: 卡片视图（移动端优化）**

```vue
<template>
  <div class="data-view">
    <!-- 桌面端：表格视图 -->
    <el-table v-if="!isMobile" :data="tableData" class="desktop-table">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作" />
    </el-table>

    <!-- 移动端：卡片视图 -->
    <div v-else class="card-list">
      <div v-for="item in tableData" :key="item.id" class="data-card">
        <div class="card-header">
          <span class="card-id">#{{ item.id }}</span>
          <el-tag :type="item.status === 'active' ? 'success' : 'info'">
            {{ item.status }}
          </el-tag>
        </div>
        <div class="card-body">
          <div class="card-item">
            <label>姓名:</label>
            <span>{{ item.name }}</span>
          </div>
          <div class="card-item">
            <label>邮箱:</label>
            <span>{{ item.email }}</span>
          </div>
          <div class="card-item">
            <label>电话:</label>
            <span>{{ item.phone }}</span>
          </div>
        </div>
        <div class="card-actions">
          <el-button size="small">编辑</el-button>
          <el-button size="small" type="danger">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const isMobile = computed(() => appStore.device === 'mobile')

const tableData = ref([
  { id: 1, name: '张三', email: 'zhang@example.com', phone: '13800138000', status: 'active' },
  // ...
])
</script>

<style scoped lang="scss">
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-card {
  background: var(--bg-base);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color-light);
}

.card-id {
  font-weight: bold;
  color: var(--text-color);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.card-item {
  display: flex;

  label {
    width: 60px;
    font-weight: 500;
    color: var(--text-color-secondary);
  }

  span {
    flex: 1;
    color: var(--text-color);
  }
}

.card-actions {
  display: flex;
  gap: 8px;

  .el-button {
    flex: 1;
  }
}
</style>
```

### 4. 响应式字体大小不协调

**问题描述:**

在不同设备上，字体大小变化不够平滑，或者在某些设备上过大/过小。

**问题原因:**

- 使用固定像素值而非相对单位
- 断点之间的字体大小跳跃过大
- 没有考虑设备的像素密度

**解决方案: 使用 clamp() 函数**

```scss
// 使用 clamp() 实现流式字体大小
h1 {
  // clamp(最小值, 理想值, 最大值)
  font-size: clamp(1.75rem, 5vw, 3rem);
  line-height: 1.2;
}

h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

h3 {
  font-size: clamp(1.25rem, 3vw, 2rem);
}

body {
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.6;
}

// 结合媒体查询微调
@include respond-to('sm') {
  h1 {
    font-size: clamp(1.5rem, 4vw, 2rem);
  }
}
```

**使用CSS变量实现主题化字体:**

```scss
:root {
  // 基础字体大小
  --font-size-base: 16px;
  --font-size-sm: 14px;
  --font-size-lg: 18px;

  // 标题字体大小
  --font-size-h1: clamp(1.75rem, 5vw, 3rem);
  --font-size-h2: clamp(1.5rem, 4vw, 2.5rem);
  --font-size-h3: clamp(1.25rem, 3vw, 2rem);

  @include respond-to('md') {
    --font-size-base: 15px;
  }

  @include respond-to('sm') {
    --font-size-base: 14px;
    --font-size-sm: 13px;
  }
}

// 使用变量
body {
  font-size: var(--font-size-base);
}

h1 {
  font-size: var(--font-size-h1);
}
```

### 5. 响应式图片加载慢

**问题描述:**

移动端加载了过大的桌面端图片，导致页面加载缓慢。

**问题原因:**

- 没有使用响应式图片技术
- 所有设备加载相同尺寸的图片
- 没有使用图片懒加载

**解决方案:**

```vue
<template>
  <div class="image-container">
    <!-- 方案1: 使用 srcset -->
    <img
      :src="imageSrc"
      :srcset="imageSrcset"
      :sizes="imageSizes"
      :alt="imageAlt"
      loading="lazy"
      class="responsive-image"
    />

    <!-- 方案2: 使用 picture 元素 -->
    <picture>
      <source
        media="(max-width: 640px)"
        :srcset="mobileImage"
      />
      <source
        media="(max-width: 1024px)"
        :srcset="tabletImage"
      />
      <img
        :src="desktopImage"
        :alt="imageAlt"
        loading="lazy"
        class="responsive-image"
      />
    </picture>
  </div>
</template>

<script lang="ts" setup>
const imageSrc = '/images/product-800.jpg'

const imageSrcset = [
  '/images/product-400.jpg 400w',
  '/images/product-800.jpg 800w',
  '/images/product-1200.jpg 1200w',
  '/images/product-1600.jpg 1600w'
].join(', ')

const imageSizes = [
  '(max-width: 640px) 100vw',
  '(max-width: 1024px) 80vw',
  '1200px'
].join(', ')

const imageAlt = 'Product Image'

const mobileImage = '/images/product-mobile.jpg'
const tabletImage = '/images/product-tablet.jpg'
const desktopImage = '/images/product-desktop.jpg'
</script>

<style scoped lang="scss">
.image-container {
  position: relative;
  overflow: hidden;
}

.responsive-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
</style>
```

---

通过合理使用响应式断点系统、UnoCSS 工具类和 SCSS 混合器，可以轻松构建适配各种设备的现代化 Web 应用。记住始终遵循移动优先原则，使用相对单位，并在多种设备上进行充分测试，确保用户在任何设备上都能获得最佳体验。
