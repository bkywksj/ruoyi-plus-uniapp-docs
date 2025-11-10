# 样式系统最佳实践

## 介绍

本文档汇总了 RuoYi-Plus-UniApp 前端项目样式系统的最佳实践,涵盖 SCSS 架构、UnoCSS 原子化、主题系统、性能优化、代码规范等方面。这些实践基于项目实际架构和真实开发经验总结而来,旨在帮助开发者编写高质量、可维护、高性能的样式代码。

**核心内容:**

- **架构设计最佳实践** - SCSS 分层架构、模块化组织、命名规范
- **原子化 CSS 实践** - UnoCSS 使用规范、预设配置、自定义扩展
- **主题系统实践** - 暗黑模式适配、CSS 变量使用、动态切换
- **响应式设计实践** - 移动优先、断点策略、Flex/Grid 布局
- **性能优化实践** - CSS 性能优化、动画性能、打包优化
- **代码规范实践** - 命名约定、代码组织、团队协作
- **常见问题解决** - 实际开发中的典型问题和解决方案

**适用场景:**

本文档适用于以下开发场景:

1. **新项目启动** - 参考架构设计和规范建立
2. **代码重构** - 优化现有样式代码结构
3. **主题开发** - 实现主题切换和暗黑模式
4. **性能优化** - 解决样式性能问题
5. **团队协作** - 统一样式开发规范
6. **问题排查** - 解决常见样式问题

---

## 架构设计最佳实践

### 1. SCSS 分层架构

项目采用 ITCSS (Inverted Triangle CSS) 分层架构,按照特异性从低到高组织样式代码。

**目录结构:**

```scss
src/assets/styles/
├── abstracts/          # 抽象层(变量、混合器)
│   ├── _variables.scss # 全局变量
│   └── _mixins.scss    # 混合器函数
├── themes/             # 主题层
│   ├── _light.scss     # 亮色主题
│   └── _dark.scss      # 暗黑主题
├── base/               # 基础层
│   ├── _reset.scss     # 样式重置
│   └── _typography.scss # 排版样式
├── layout/             # 布局层
│   └── _layout.scss    # 布局样式
├── components/         # 组件层
│   ├── _buttons.scss   # 按钮组件
│   └── _animations.scss # 动画组件
└── vendors/            # 第三方覆盖
    └── _element-plus.scss
```

**导入顺序(main.scss):**

```scss
/* 1. 外部库 - 最先导入 */
@use 'animate.css';
@use 'element-plus/dist/index.css';

/* 2. 抽象层 - 提供变量和工具 */
@use './abstracts/variables' as *;
@use './abstracts/mixins' as *;

/* 3. 主题系统 - 定义主题变量 */
@use './themes/light';
@use './themes/dark';

/* 4. 基础样式 - 重置和基础样式 */
@use './base/reset';
@use './base/typography';

/* 5. 布局层 - 页面布局 */
@use './layout/layout';

/* 6. 组件样式 - 可复用组件 */
@use './components/buttons';
@use './components/animations';

/* 7. 第三方库覆盖 - 最后导入 */
@use './vendors/element-plus';

/* 8. 主题切换动画 */
@use './theme-animation';
```

**最佳实践要点:**

1. **严格按顺序导入** - 确保样式优先级正确
2. **使用 @use 代替 @import** - 避免命名冲突和重复导入
3. **抽象层使用别名** - `as *` 允许直接使用变量和混合器
4. **组件样式独立文件** - 便于维护和按需加载
5. **第三方覆盖放最后** - 确保能覆盖第三方库样式

**反例 - 错误的导入顺序:**

```scss
// ❌ 错误示例
@use './components/buttons';    // 组件在变量之前
@use './abstracts/variables';   // 无法使用变量

@use './vendors/element-plus';  // 第三方在前
@use './base/reset';            // 重置在后,可能被覆盖
```

### 2. 模块化组织原则

**单一职责原则:**

每个 SCSS 文件只负责一个功能模块。

```scss
// ✅ 正确 - _buttons.scss 只包含按钮相关样式
@mixin colorBtn($color) { /* ... */ }

.pan-btn { /* ... */ }
.custom-button { /* ... */ }

// ❌ 错误 - 混杂多种功能
@mixin colorBtn($color) { /* ... */ }
.data-table { /* ... */ }  // 表格样式不应该在按钮文件中
.modal-dialog { /* ... */ } // 对话框样式不应该在按钮文件中
```

**命名空间隔离:**

使用 `@use` 模块系统防止命名冲突。

```scss
// _colors.scss
$primary: #409eff;
$success: #67c23a;

// _sizes.scss
$primary: 16px;  // 与 colors 模块的 primary 不冲突

// main.scss
@use './colors' as c;
@use './sizes' as s;

.button {
  color: c.$primary;      // #409eff
  font-size: s.$primary;  // 16px
}
```

**文件大小控制:**

单个 SCSS 文件不超过 300 行,超过则拆分。

```scss
// ❌ 单个文件过大
// _components.scss (800行)
.button { /* 100行 */ }
.input { /* 150行 */ }
.select { /* 200行 */ }
.dialog { /* 350行 */ }

// ✅ 按组件拆分
// _button.scss (100行)
// _input.scss (150行)
// _select.scss (200行)
// _dialog.scss (350行)
```

### 3. 变量命名规范

**SCSS 变量命名:**

使用 kebab-case,按用途分类。

```scss
// ✅ 正确的变量命名
// 颜色变量
$primary-color: #409eff;
$success-color: #67c23a;
$danger-color: #f56c6c;

// 尺寸变量
$base-sidebar-width: 240px;
$header-height: 50px;

// 断点变量
$breakpoint-sm: 768px;
$breakpoint-md: 992px;
$breakpoint-lg: 1200px;

// ❌ 错误的命名
$blue: #409eff;        // 语义不明确
$sidebarWidth: 240px;  // 使用了驼峰命名
$BP_SM: 768px;         // 全大写不符合规范
```

**CSS 变量命名:**

使用双连字符,体现层级关系。

```scss
:root {
  // ✅ 正确的 CSS 变量命名
  --color-primary: #409eff;
  --color-text-primary: #303133;
  --color-text-regular: #606266;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;

  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.6s;

  // ❌ 错误的命名
  --primary: #409eff;      // 缺少分类前缀
  --text_color: #303133;   // 使用下划线
  --Spacing-MD: 16px;      // 使用大写
}
```

**Element Plus 变量覆盖:**

使用 `--el-` 前缀覆盖 Element Plus 变量。

```scss
:root {
  // ✅ 覆盖 Element Plus 组件高度
  --el-component-size: 32px !important;

  // ✅ 覆盖 Element Plus 圆角
  --el-border-radius-base: 6px !important;
  --el-border-radius-small: 8px !important;

  // ✅ 覆盖 Element Plus 颜色
  --el-color-primary: #409eff !important;
}
```

### 4. 混合器设计原则

**参数化设计:**

混合器应该接收参数,提供灵活性。

```scss
// ✅ 正确 - 参数化混合器
@mixin button-variant($bg-color, $text-color, $hover-scale: 1.05) {
  background: $bg-color;
  color: $text-color;
  transition: all 0.3s ease;

  &:hover {
    transform: scale($hover-scale);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

// 使用
.btn-primary {
  @include button-variant(#409eff, #fff);
}

.btn-success {
  @include button-variant(#67c23a, #fff, 1.1);
}

// ❌ 错误 - 硬编码值
@mixin button-blue {
  background: #409eff;  // 只能用于蓝色按钮
  color: #fff;
}
```

**默认参数:**

为参数提供合理的默认值。

```scss
// ✅ 提供默认参数
@mixin card-style(
  $padding: 16px,
  $radius: 8px,
  $shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
) {
  padding: $padding;
  border-radius: $radius;
  box-shadow: $shadow;
}

// 使用时可以只传部分参数
.card-small {
  @include card-style($padding: 8px);  // 其他参数使用默认值
}

.card-large {
  @include card-style(24px, 12px);  // 覆盖前两个参数
}
```

**避免过度抽象:**

不要为了复用而过度抽象。

```scss
// ❌ 过度抽象 - 只用一次的样式
@mixin specific-header-style {
  height: 60px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-bottom: 2px solid #e4e7ed;
}

.page-header {
  @include specific-header-style;  // 只在一个地方使用
}

// ✅ 直接编写
.page-header {
  height: 60px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-bottom: 2px solid #e4e7ed;
}
```

---

## UnoCSS 原子化实践

### 1. 优先使用 UnoCSS

在 Vue 模板中,优先使用 UnoCSS 原子类而不是自定义样式。

**优先级规则:**

```
UnoCSS 原子类 > SCSS 工具类 > 自定义样式
```

**示例对比:**

```vue
<!-- ✅ 最佳 - 使用 UnoCSS -->
<template>
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
    <span class="text-lg font-semibold text-gray-800">标题</span>
    <button class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
      操作
    </button>
  </div>
</template>

<!-- ⚠️ 次选 - 使用 SCSS 工具类 -->
<template>
  <div class="card-container">
    <span class="title">标题</span>
    <button class="btn-primary">操作</button>
  </div>
</template>

<style lang="scss" scoped>
.card-container {
  @apply flex items-center justify-between p-4 bg-white rounded-lg shadow-md;
}

.title {
  @apply text-lg font-semibold text-gray-800;
}

.btn-primary {
  @apply px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600;
}
</style>

<!-- ❌ 避免 - 完全自定义 -->
<template>
  <div class="card-container">
    <span class="title">标题</span>
    <button class="btn-primary">操作</button>
  </div>
</template>

<style lang="scss" scoped>
.card-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.btn-primary {
  padding: 8px 16px;
  color: white;
  background: #409eff;
  border-radius: 4px;

  &:hover {
    background: #66b1ff;
  }
}
</style>
```

### 2. UnoCSS 预设使用

项目配置了 Wind 预设和 Icons 预设。

**Wind 预设常用类:**

```vue
<template>
  <!-- 布局 -->
  <div class="flex flex-col items-center justify-center">
    <!-- Flexbox 布局 -->
  </div>

  <div class="grid grid-cols-3 gap-4">
    <!-- Grid 布局 -->
  </div>

  <!-- 间距 -->
  <div class="p-4 m-2">          <!-- padding: 16px, margin: 8px -->
    <div class="px-6 py-3">      <!-- padding: 24px 12px -->
    </div>
  </div>

  <!-- 尺寸 -->
  <div class="w-full h-screen">  <!-- width: 100%, height: 100vh -->
    <div class="w-64 h-32">      <!-- width: 256px, height: 128px -->
    </div>
  </div>

  <!-- 文字 -->
  <p class="text-base font-normal text-gray-700">
    普通文本
  </p>

  <h1 class="text-3xl font-bold text-blue-600">
    标题文本
  </h1>

  <!-- 背景和边框 -->
  <div class="bg-white border border-gray-200 rounded-lg">
    卡片内容
  </div>

  <!-- 阴影 -->
  <div class="shadow-sm hover:shadow-lg transition-shadow">
    悬浮卡片
  </div>
</template>
```

**Icons 预设使用:**

```vue
<template>
  <!-- 使用 Iconify 图标集 -->
  <div class="i-carbon-user text-2xl" />          <!-- Carbon 图标 -->
  <div class="i-mdi-home text-3xl text-blue-500" /> <!-- MDI 图标 -->
  <div class="i-heroicons-solid-search" />        <!-- Heroicons 图标 -->
</template>
```

### 3. 自定义配置扩展

**主题色扩展:**

项目扩展了 Element Plus 主题色。

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      primary: '#409eff',
      success: '#67c23a',
      warning: '#e6a23c',
      danger: '#f56c6c',
      info: '#909399',
    }
  }
})
```

**使用自定义主题色:**

```vue
<template>
  <!-- 文字颜色 -->
  <span class="text-primary">主要文本</span>
  <span class="text-success">成功文本</span>
  <span class="text-danger">危险文本</span>

  <!-- 背景颜色 -->
  <div class="bg-primary text-white p-4">主要背景</div>
  <div class="bg-success text-white p-4">成功背景</div>

  <!-- 边框颜色 -->
  <div class="border border-primary">主要边框</div>
</template>
```

**快捷方式(Shortcuts):**

定义常用样式组合。

```typescript
// uno.config.ts
export default defineConfig({
  shortcuts: {
    'btn': 'px-4 py-2 rounded cursor-pointer transition-colors',
    'btn-primary': 'btn bg-primary text-white hover:bg-blue-600',
    'btn-success': 'btn bg-success text-white hover:bg-green-600',

    'card': 'p-4 bg-white rounded-lg shadow-sm',
    'input-base': 'px-3 py-2 border border-gray-300 rounded focus:border-primary',
  }
})
```

**使用快捷方式:**

```vue
<template>
  <!-- 按钮 -->
  <button class="btn-primary">确认</button>
  <button class="btn-success">提交</button>

  <!-- 卡片 -->
  <div class="card">
    <h3 class="text-lg font-semibold mb-2">卡片标题</h3>
    <p class="text-gray-600">卡片内容</p>
  </div>

  <!-- 输入框 -->
  <input class="input-base w-full" placeholder="请输入内容">
</template>
```

### 4. UnoCSS 性能优化

**类名提取规则:**

UnoCSS 只会提取实际使用的类名。

```vue
<!-- ✅ 静态类名 - 会被提取 -->
<div class="flex items-center p-4 bg-white">
  静态内容
</div>

<!-- ✅ 动态类名 - 完整类名也会被提取 -->
<div :class="isActive ? 'bg-blue-500' : 'bg-gray-200'">
  动态背景
</div>

<!-- ❌ 字符串拼接 - 不会被提取 -->
<div :class="'bg-' + color + '-500'">
  <!-- 如果 color='blue',类名 'bg-blue-500' 不会生成 -->
</div>

<!-- ✅ 解决方案 - 使用完整类名 -->
<div :class="{
  'bg-blue-500': color === 'blue',
  'bg-red-500': color === 'red',
  'bg-green-500': color === 'green'
}">
  正确的动态类名
</div>
```

**Safelist 配置:**

需要动态生成的类名添加到 safelist。

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 动态背景色
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',

    // 动态间距
    ...Array.from({ length: 10 }, (_, i) => `p-${i}`),
    ...Array.from({ length: 10 }, (_, i) => `m-${i}`),
  ]
})
```

**按需加载:**

UnoCSS 自动按需生成 CSS,无需手动配置。

```vue
<!-- 只使用了 3 个类,只生成这 3 个类的 CSS -->
<div class="flex items-center justify-center">
  内容
</div>

<!-- 生成的 CSS (简化) -->
<style>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
</style>
```

---

## 主题系统最佳实践

### 1. CSS 变量优先

使用 CSS 变量实现主题切换,而不是 SCSS 变量。

**对比:**

```scss
// ❌ 使用 SCSS 变量 - 无法运行时切换
$bg-color: #ffffff;
$text-color: #303133;

.container {
  background: $bg-color;
  color: $text-color;
}

// ✅ 使用 CSS 变量 - 支持运行时切换
:root {
  --bg-color: #ffffff;
  --text-color: #303133;
}

.dark {
  --bg-color: #1a1a1a;
  --text-color: #e5e5e5;
}

.container {
  background: var(--bg-color);
  color: var(--text-color);
}
```

### 2. 语义化变量命名

使用语义化命名,而不是颜色字面量。

```scss
// ❌ 字面量命名
:root {
  --white: #ffffff;
  --black: #000000;
  --gray-100: #f5f5f5;
}

.card {
  background: var(--white);
  color: var(--black);
}

// ✅ 语义化命名
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #303133;
  --text-secondary: #606266;
}

.dark {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --text-primary: #e5e5e5;
  --text-secondary: #b0b0b0;
}

.card {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### 3. 分层变量系统

建立三层变量系统:基础色 → 语义色 → 组件色。

```scss
:root {
  /* 第一层:基础色板 */
  --color-blue-500: #409eff;
  --color-green-500: #67c23a;
  --color-red-500: #f56c6c;
  --color-gray-50: #f5f7fa;
  --color-gray-900: #303133;

  /* 第二层:语义颜色 */
  --color-primary: var(--color-blue-500);
  --color-success: var(--color-green-500);
  --color-danger: var(--color-red-500);
  --bg-base: var(--color-gray-50);
  --text-base: var(--color-gray-900);

  /* 第三层:组件颜色 */
  --button-bg: var(--color-primary);
  --card-bg: var(--bg-base);
  --input-border: var(--color-gray-300);
}

.dark {
  /* 只需修改第二层变量 */
  --bg-base: #1a1a1a;
  --text-base: #e5e5e5;

  /* 第三层自动继承 */
}
```

### 4. 主题切换动画

使用 View Transition API 实现平滑切换。

**基础实现:**

```typescript
// 检测浏览器支持
if (document.startViewTransition) {
  document.startViewTransition(() => {
    // 切换主题类名
    document.documentElement.classList.toggle('dark')
  })
} else {
  // 不支持则直接切换
  document.documentElement.classList.toggle('dark')
}
```

**圆形扩散动画:**

```typescript
// utils/themeAnimation.ts
export const toggleThemeWithAnimation = (event: MouseEvent, isDark: boolean) => {
  const layout = useLayout()

  // 获取点击位置
  const x = event.clientX
  const y = event.clientY

  // 计算最大半径
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  // 设置 CSS 变量
  const root = document.documentElement
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${endRadius}px`)

  // 执行动画
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      layout.toggleDark(!isDark)
    })
  } else {
    layout.toggleDark(!isDark)
  }
}
```

**CSS 动画定义:**

```scss
// theme-animation.scss
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  clip-path: circle(0 at var(--theme-x) var(--theme-y));
}

.dark::view-transition-old(root) {
  clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  z-index: 1;
}

.dark::view-transition-new(root) {
  clip-path: circle(0 at var(--theme-x) var(--theme-y));
}
```

**使用示例:**

```vue
<template>
  <el-switch
    v-model="isDark"
    @click="handleThemeSwitch"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

const layout = useLayout()
const isDark = computed(() => layout.isDark)

const handleThemeSwitch = (event: MouseEvent) => {
  toggleThemeWithAnimation(event, isDark.value)
}
</script>
```

### 5. Element Plus 主题集成

**覆盖 Element Plus 变量:**

```scss
:root {
  // 主色系
  --el-color-primary: #409eff !important;
  --el-color-success: #67c23a !important;
  --el-color-warning: #e6a23c !important;
  --el-color-danger: #f56c6c !important;
  --el-color-info: #909399 !important;

  // 组件尺寸
  --el-component-size: 32px !important;

  // 圆角
  --el-border-radius-base: 6px !important;
  --el-border-radius-small: 8px !important;
}
```

**暗黑模式适配:**

```scss
.dark {
  // Element Plus 会自动处理颜色深浅
  // 只需覆盖特殊情况

  --el-bg-color: #1a1a1a !important;
  --el-text-color-primary: #e5e5e5 !important;

  // 边框颜色
  --el-border-color: rgba(255, 255, 255, 0.1) !important;
}
```

---

## 响应式设计最佳实践

### 1. 移动优先策略

从小屏幕开始设计,逐步增强大屏幕体验。

```scss
// ✅ 移动优先
.container {
  // 默认样式(移动端)
  padding: 16px;
  font-size: 14px;

  // 平板及以上
  @media (min-width: 768px) {
    padding: 24px;
    font-size: 16px;
  }

  // 桌面端
  @media (min-width: 1200px) {
    padding: 32px;
    font-size: 18px;
  }
}

// ❌ 桌面优先(不推荐)
.container {
  // 默认样式(桌面端)
  padding: 32px;
  font-size: 18px;

  // 平板
  @media (max-width: 1199px) {
    padding: 24px;
    font-size: 16px;
  }

  // 移动端
  @media (max-width: 767px) {
    padding: 16px;
    font-size: 14px;
  }
}
```

### 2. 断点使用规范

使用项目定义的标准断点。

**标准断点:**

```scss
// abstracts/_variables.scss
$sm: 768px;   // 平板
$md: 992px;   // 小屏桌面
$lg: 1200px;  // 大屏桌面
$xl: 1920px;  // 超大屏
```

**respond-to 混合器:**

```scss
// 使用混合器
.sidebar {
  width: 240px;

  @include respond-to('md') {
    width: 200px;
  }

  @include respond-to('sm') {
    width: 100%;
  }
}
```

**UnoCSS 响应式:**

```vue
<template>
  <!-- 移动端单列,平板2列,桌面3列 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>项目 1</div>
    <div>项目 2</div>
    <div>项目 3</div>
  </div>

  <!-- 移动端隐藏,桌面显示 -->
  <aside class="hidden lg:block">
    侧边栏内容
  </aside>

  <!-- 响应式间距 -->
  <div class="p-4 md:p-6 lg:p-8">
    内容区域
  </div>
</template>
```

### 3. Flexbox 和 Grid 布局

**Flexbox 适用场景:**

- 一维布局(行或列)
- 内容驱动的流式布局
- 对齐和分布控制

```vue
<template>
  <!-- 水平居中对齐 -->
  <div class="flex items-center justify-center h-screen">
    <div>居中内容</div>
  </div>

  <!-- 两端对齐 -->
  <div class="flex justify-between items-center p-4">
    <span>左侧</span>
    <span>右侧</span>
  </div>

  <!-- 垂直堆叠 -->
  <div class="flex flex-col gap-4">
    <div>项目 1</div>
    <div>项目 2</div>
    <div>项目 3</div>
  </div>
</template>
```

**Grid 适用场景:**

- 二维布局(行和列)
- 结构化的网格系统
- 复杂的对齐需求

```vue
<template>
  <!-- 等宽列 -->
  <div class="grid grid-cols-3 gap-4">
    <div>列 1</div>
    <div>列 2</div>
    <div>列 3</div>
  </div>

  <!-- 响应式网格 -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </div>

  <!-- 不等宽列 -->
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-8">主内容(8列)</div>
    <div class="col-span-4">侧边栏(4列)</div>
  </div>

  <!-- 复杂网格 -->
  <div class="grid grid-cols-3 grid-rows-3 gap-4">
    <div class="col-span-2 row-span-2">大区域</div>
    <div>小区域 1</div>
    <div>小区域 2</div>
    <div class="col-span-3">底部横条</div>
  </div>
</template>
```

### 4. 容器查询(未来方案)

容器查询允许基于父容器尺寸应用样式。

```scss
// 容器查询 API(实验性)
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card-content {
  padding: 1rem;

  @container card (min-width: 400px) {
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  @container card (min-width: 600px) {
    padding: 3rem;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

---

## 性能优化最佳实践

### 1. CSS 选择器优化

**避免深层嵌套:**

```scss
// ❌ 过深嵌套(性能差)
.container {
  .wrapper {
    .content {
      .item {
        .title {
          .text {
            color: red;  // 6层嵌套
          }
        }
      }
    }
  }
}

// ✅ 扁平化(性能好)
.container {
  // 一级样式
}

.container-content {
  // 二级样式
}

.container-item-title {
  // 使用 BEM 命名,避免嵌套
  color: red;
}
```

**避免通配符选择器:**

```scss
// ❌ 性能差
* {
  margin: 0;
  padding: 0;
}

.container * {
  box-sizing: border-box;
}

// ✅ 针对性重置
html, body, div, p, h1, h2, h3 {
  margin: 0;
  padding: 0;
}

.container > * {
  box-sizing: border-box;  // 只影响直接子元素
}
```

**优先使用类选择器:**

```scss
// ❌ 标签选择器(性能差)
div p span {
  color: red;
}

// ❌ 属性选择器(性能差)
[data-type="button"] {
  padding: 10px;
}

// ✅ 类选择器(性能好)
.text-content {
  color: red;
}

.btn {
  padding: 10px;
}
```

### 2. 动画性能优化

**使用 transform 代替 position:**

```scss
// ❌ 使用 position(触发 reflow)
.move-item {
  position: relative;
  animation: movePosition 1s ease;
}

@keyframes movePosition {
  from { left: 0; top: 0; }
  to { left: 100px; top: 100px; }
}

// ✅ 使用 transform(仅触发 composite)
.move-item {
  animation: moveTransform 1s ease;
}

@keyframes moveTransform {
  from { transform: translate(0, 0); }
  to { transform: translate(100px, 100px); }
}
```

**使用 will-change 提示:**

```scss
// 提前告知浏览器将要变化的属性
.animated-element {
  will-change: transform, opacity;
  transition: transform 0.3s, opacity 0.3s;

  &:hover {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

// ⚠️ 不要滥用 will-change
// ❌ 错误 - 对所有元素使用
* {
  will-change: transform;  // 会消耗大量内存
}

// ✅ 正确 - 只对动画元素使用
.dialog {
  &.entering,
  &.leaving {
    will-change: transform, opacity;
  }

  &.entered {
    will-change: auto;  // 动画结束后移除
  }
}
```

**GPU 加速:**

```scss
// 触发 GPU 加速的属性
.gpu-accelerated {
  // 3D transform
  transform: translateZ(0);
  transform: translate3d(0, 0, 0);

  // 或者
  will-change: transform;

  // 或者
  backface-visibility: hidden;
}
```

### 3. 关键 CSS 内联

将首屏关键样式内联到 HTML。

```html
<!-- index.html -->
<head>
  <!-- 内联关键 CSS -->
  <style>
    /* 首屏必需的最小样式 */
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .app-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-size: 24px;
      color: #409eff;
    }
  </style>

  <!-- 异步加载完整样式 -->
  <link rel="preload" href="/assets/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
```

### 4. CSS 代码分割

按路由分割 CSS 文件。

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vendor': ['vue', 'vue-router', 'pinia'],
        },
        // CSS 代码分割
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // CSS 代码分割
    cssCodeSplit: true,
  }
})
```

### 5. 移除未使用的 CSS

使用 PurgeCSS 或 UnoCSS 自动移除未使用的样式。

```typescript
// UnoCSS 自动按需生成
// uno.config.ts
export default defineConfig({
  // UnoCSS 只生成使用的类
  // 无需手动配置 PurgeCSS
})
```

---

## 代码规范最佳实践

### 1. BEM 命名约定

使用 BEM (Block Element Modifier) 命名组件样式。

**命名规则:**

```
.block {}                // 块
.block__element {}       // 元素
.block--modifier {}      // 修饰符
.block__element--modifier {}  // 元素修饰符
```

**示例:**

```vue
<template>
  <!-- 卡片组件 -->
  <div class="card card--primary">
    <div class="card__header">
      <h3 class="card__title">卡片标题</h3>
      <span class="card__subtitle card__subtitle--secondary">副标题</span>
    </div>
    <div class="card__body">
      <p class="card__text">卡片内容</p>
    </div>
    <div class="card__footer">
      <button class="card__button card__button--primary">操作</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  // 块样式
  background: white;
  border-radius: 8px;

  // 修饰符
  &--primary {
    border: 2px solid var(--el-color-primary);
  }

  &--success {
    border: 2px solid var(--el-color-success);
  }

  // 元素
  &__header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
  }

  &__subtitle {
    font-size: 14px;
    color: #909399;

    &--secondary {
      color: #c0c4cc;
    }
  }

  &__body {
    padding: 16px;
  }

  &__text {
    line-height: 1.6;
  }

  &__footer {
    padding: 16px;
    text-align: right;
  }

  &__button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &--primary {
      background: var(--el-color-primary);
      color: white;
    }
  }
}
</style>
```

### 2. 样式作用域

优先使用 scoped 样式,避免全局污染。

```vue
<!-- ✅ 使用 scoped -->
<style lang="scss" scoped>
.container {
  padding: 20px;  // 只影响当前组件
}
</style>

<!-- ⚠️ 全局样式 - 谨慎使用 -->
<style lang="scss">
.global-container {
  padding: 20px;  // 影响整个应用
}
</style>

<!-- ✅ 混合使用 -->
<style lang="scss" scoped>
.component {
  /* 组件样式 */
}
</style>

<style lang="scss">
/* 只在必要时添加全局样式 */
.global-utility {
  /* 全局工具类 */
}
</style>
```

**深度选择器:**

```vue
<style lang="scss" scoped>
/* 修改子组件样式 */
.my-component {
  /* 当前组件样式 */

  /* ✅ Vue 3 推荐写法 */
  :deep(.child-component) {
    color: red;
  }

  /* ❌ 已废弃 */
  ::v-deep .child-component {
    color: red;
  }

  /* ❌ 已废弃 */
  /deep/ .child-component {
    color: red;
  }
}

/* 修改插槽内容 */
:slotted(.slot-content) {
  font-weight: bold;
}

/* 全局选择器 */
:global(.app-container) {
  margin: 0 auto;
}
</style>
```

### 3. 注释规范

为复杂样式添加注释。

```scss
/**
 * 卡片组件样式
 * @description 提供统一的卡片样式,支持多种主题和尺寸
 */
.card {
  // 基础布局
  display: flex;
  flex-direction: column;

  // 间距系统
  padding: var(--spacing-md);  // 16px
  margin-bottom: var(--spacing-lg);  // 24px

  // 视觉样式
  background: var(--bg-primary);
  border-radius: var(--radius-md);  // 8px

  // 阴影效果(仅在亮色主题显示)
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 响应式适配 */
  @include respond-to('sm') {
    padding: var(--spacing-sm);  // 移动端减少内边距
  }

  /* 暗黑模式适配 */
  .dark & {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);  // 增强阴影
  }
}

/**
 * 主题修饰符
 */
.card--primary {
  border-left: 4px solid var(--el-color-primary);  // 主题色左边框
}

// TODO: 添加更多主题变体
// FIXME: 修复 Safari 中的圆角问题
```

### 4. 样式组织顺序

按照固定顺序组织 CSS 属性。

```scss
.element {
  /* 1. 定位 */
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;

  /* 2. 盒模型 */
  display: flex;
  width: 100%;
  height: 50px;
  padding: 16px;
  margin: 20px;
  border: 1px solid #ddd;

  /* 3. 排版 */
  font-family: sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  color: #333;

  /* 4. 视觉效果 */
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 1;

  /* 5. 其他 */
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateX(0);
}
```

### 5. 避免魔法数字

使用变量代替硬编码的数字。

```scss
// ❌ 魔法数字
.sidebar {
  width: 240px;
  top: 50px;
  z-index: 1001;
  padding: 16px;
  border-radius: 8px;
}

// ✅ 使用变量
:root {
  --sidebar-width: 240px;
  --header-height: 50px;
  --z-sidebar: 1001;
  --spacing-md: 16px;
  --radius-md: 8px;
}

.sidebar {
  width: var(--sidebar-width);
  top: var(--header-height);
  z-index: var(--z-sidebar);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

---

## 团队协作最佳实践

### 1. 样式指南文档

维护团队样式指南文档。

**内容包括:**

- 颜色系统
- 间距系统
- 字体系统
- 组件样式库
- 命名规范
- 最佳实践

### 2. 代码审查要点

样式代码审查检查清单:

**架构和组织:**
- [ ] 样式文件是否按功能模块组织
- [ ] 是否避免了不必要的全局样式
- [ ] 是否使用了 scoped 样式

**性能:**
- [ ] 是否避免了深层选择器嵌套
- [ ] 动画是否使用了 transform 而不是 position
- [ ] 是否合理使用了 will-change

**命名和规范:**
- [ ] 类名是否遵循 BEM 命名
- [ ] CSS 变量命名是否语义化
- [ ] 是否使用了项目定义的变量和混合器

**响应式:**
- [ ] 是否遵循移动优先原则
- [ ] 是否使用了标准断点
- [ ] 是否测试了不同屏幕尺寸

**主题适配:**
- [ ] 是否适配了暗黑模式
- [ ] 是否使用了 CSS 变量而不是硬编码颜色
- [ ] 是否考虑了主题切换动画

### 3. 样式 Lint 配置

配置 Stylelint 强制代码规范。

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue',
  ],
  rules: {
    // 选择器嵌套最多3层
    'max-nesting-depth': 3,

    // 类名命名规范(BEM)
    'selector-class-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*((__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?)?$',

    // 颜色必须使用变量
    'color-no-hex': true,

    // 禁止重复选择器
    'no-duplicate-selectors': true,

    // 属性顺序
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'width',
      'height',
      // ... 更多属性
    ],
  },
}
```

### 4. 组件库开发规范

开发可复用组件时的样式规范。

```vue
<!-- 组件: Card.vue -->
<template>
  <div :class="cardClass">
    <div v-if="$slots.header" class="card__header">
      <slot name="header" />
    </div>
    <div class="card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CardProps {
  /** 卡片类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** 是否显示阴影 */
  shadow?: 'always' | 'hover' | 'never'
  /** 是否可悬浮 */
  hoverable?: boolean
}

const props = withDefaults(defineProps<CardProps>(), {
  type: 'default',
  shadow: 'always',
  hoverable: false,
})

const cardClass = computed(() => [
  'card',
  `card--${props.type}`,
  `card--shadow-${props.shadow}`,
  {
    'card--hoverable': props.hoverable,
  },
])
</script>

<style lang="scss" scoped>
.card {
  // 使用 CSS 变量便于主题定制
  background: var(--card-bg, var(--bg-primary));
  border: 1px solid var(--card-border, var(--border-color));
  border-radius: var(--card-radius, var(--radius-md));
  overflow: hidden;
  transition: var(--duration-normal);

  // 类型修饰符
  &--primary {
    border-color: var(--el-color-primary);
  }

  &--success {
    border-color: var(--el-color-success);
  }

  // 阴影修饰符
  &--shadow-always {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &--shadow-hover {
    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    }
  }

  &--shadow-never {
    box-shadow: none;
  }

  // 可悬浮
  &--hoverable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
    }
  }

  // 子元素
  &__header {
    padding: var(--card-padding, 16px);
    border-bottom: 1px solid var(--card-border, var(--border-color));
  }

  &__body {
    padding: var(--card-padding, 16px);
  }

  &__footer {
    padding: var(--card-padding, 16px);
    border-top: 1px solid var(--card-border, var(--border-color));
    background: var(--card-footer-bg, var(--bg-secondary));
  }
}

// 暗黑模式适配
.dark .card {
  --card-bg: var(--bg-level-1);
  --card-border: var(--bg-level-2);
  --card-footer-bg: var(--bg-level-2);

  &--shadow-always,
  &--shadow-hover:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}
</style>
```

---

## 常见问题和解决方案

### 1. 样式优先级冲突

**问题描述:**

Element Plus 样式被覆盖失败。

**原因分析:**

- Element Plus 使用了较高的选择器特异性
- 样式导入顺序不正确
- 缺少 `!important`

**解决方案:**

```scss
// ❌ 优先级不够
.el-button {
  background: red;
}

// ✅ 增加特异性
.custom-button.el-button {
  background: red;
}

// ✅ 使用 deep 选择器
:deep(.el-button) {
  background: red;
}

// ✅ 使用 !important (最后手段)
.el-button {
  background: red !important;
}

// ✅ 最佳 - 覆盖 CSS 变量
:root {
  --el-color-primary: red !important;
}
```

### 2. scoped 样式不生效

**问题描述:**

scoped 样式无法影响子组件。

**原因分析:**

Vue scoped 样式只影响当前组件根元素和其子元素,不影响子组件内部。

**解决方案:**

```vue
<!-- 父组件 -->
<template>
  <div class="parent">
    <ChildComponent class="child" />
  </div>
</template>

<style lang="scss" scoped>
/* ❌ 不生效 - 无法穿透到子组件内部 */
.child .inner-element {
  color: red;
}

/* ✅ 使用 deep 选择器 */
.child :deep(.inner-element) {
  color: red;
}

/* ✅ 或者为子组件根元素设置样式 */
.child {
  /* 可以设置子组件根元素的样式 */
  border: 1px solid red;
}
</style>
```

### 3. CSS 变量在 SCSS 中使用

**问题描述:**

在 SCSS 函数中使用 CSS 变量报错。

**原因分析:**

SCSS 编译时无法解析运行时的 CSS 变量。

**解决方案:**

```scss
// ❌ SCSS 函数无法处理 CSS 变量
@function darken-color($color) {
  @return darken($color, 10%);
}

.button {
  background: darken-color(var(--color-primary));  // 报错
}

// ✅ 使用 CSS calc() 和 filter
.button {
  background: var(--color-primary);

  &:hover {
    filter: brightness(0.9);  // 使用 CSS filter
  }
}

// ✅ 或者在 CSS 中使用 color-mix
.button {
  background: var(--color-primary);

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 90%, black);
  }
}

// ✅ 或者定义衍生变量
:root {
  --color-primary: #409eff;
  --color-primary-dark: #3a8fe7;  // 手动定义深色版本
}

.button {
  background: var(--color-primary);

  &:hover {
    background: var(--color-primary-dark);
  }
}
```

### 4. 动画卡顿优化

**问题描述:**

过渡动画不流畅,出现卡顿。

**原因分析:**

- 动画触发了 reflow/repaint
- 动画元素过多
- 未使用 GPU 加速

**解决方案:**

```scss
// ❌ 触发 reflow
.slide-enter-active {
  transition: width 0.3s, height 0.3s, left 0.3s, top 0.3s;
}

// ✅ 使用 transform(仅触发 composite)
.slide-enter-active {
  transition: transform 0.3s, opacity 0.3s;
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}

// ✅ 添加 will-change 提示
.slide-enter-active,
.slide-leave-active {
  will-change: transform, opacity;
  transition: transform 0.3s, opacity 0.3s;
}

// ✅ 动画结束后移除 will-change
.slide-enter-to,
.slide-leave-from {
  will-change: auto;
}

// ✅ 启用 GPU 加速
.animated-element {
  transform: translateZ(0);  // 触发 3D 加速
}
```

### 5. UnoCSS 类名不生效

**问题描述:**

动态生成的 UnoCSS 类名不起作用。

**原因分析:**

UnoCSS 无法识别字符串拼接的类名。

**解决方案:**

```vue
<template>
  <!-- ❌ 字符串拼接 - 类名不会生成 -->
  <div :class="'text-' + color + '-500'">
    文本
  </div>

  <!-- ✅ 完整类名 -->
  <div :class="{
    'text-blue-500': color === 'blue',
    'text-red-500': color === 'red',
    'text-green-500': color === 'green'
  }">
    文本
  </div>

  <!-- ✅ 或者使用 safelist -->
  <div :class="`text-${color}-500`">
    文本
  </div>
</template>

<script setup lang="ts">
// uno.config.ts 中添加 safelist
export default defineConfig({
  safelist: [
    'text-blue-500',
    'text-red-500',
    'text-green-500',
  ]
})
</script>
```

### 6. 主题切换闪烁

**问题描述:**

切换主题时出现短暂的白屏或闪烁。

**原因分析:**

- 主题类名应用延迟
- 浏览器重新计算样式
- 未使用过渡动画

**解决方案:**

```typescript
// ✅ 使用 View Transition API
const toggleTheme = () => {
  if (!document.startViewTransition) {
    // 不支持则直接切换
    document.documentElement.classList.toggle('dark')
    return
  }

  // 使用过渡动画
  document.startViewTransition(() => {
    document.documentElement.classList.toggle('dark')
  })
}

// ✅ 或者在页面加载前应用主题
// index.html
<script>
  // 在页面渲染前应用主题,避免闪烁
  const theme = localStorage.getItem('theme')
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  }
</script>

// ✅ 使用 CSS 过渡
:root {
  --transition-theme: background-color 0.3s ease, color 0.3s ease;
}

* {
  transition: var(--transition-theme);
}
```

---

## 总结

### 核心原则

1. **架构优先** - 建立清晰的样式架构和分层
2. **原子化优先** - 优先使用 UnoCSS,减少自定义样式
3. **变量驱动** - 使用 CSS 变量实现主题和动态样式
4. **移动优先** - 从小屏幕开始,逐步增强
5. **性能至上** - 优化选择器、动画和加载策略
6. **规范统一** - 遵循 BEM 命名和团队规范

### 关键实践

- 使用 SCSS 分层架构组织样式代码
- 优先使用 UnoCSS 原子类而不是自定义样式
- 使用 CSS 变量实现主题系统和暗黑模式
- 遵循移动优先的响应式设计策略
- 使用 transform 和 will-change 优化动画性能
- 遵循 BEM 命名约定和团队编码规范

### 学习路径

1. **入门阶段** - 了解 SCSS 基础和 UnoCSS 使用
2. **进阶阶段** - 掌握主题系统、响应式设计和性能优化
3. **精通阶段** - 深入理解架构设计、代码规范和团队协作

### 持续改进

- 定期审查和优化样式代码
- 关注 CSS 新特性和最佳实践
- 收集团队反馈,持续更新规范
- 建立样式组件库,提高复用性

通过遵循这些最佳实践,可以构建高质量、可维护、高性能的样式系统,提升开发效率和用户体验。
