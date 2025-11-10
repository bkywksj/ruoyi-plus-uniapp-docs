# 样式最佳实践

## 介绍

本文档汇总了 RuoYi-Plus 前端项目中样式开发的最佳实践，涵盖样式组织、命名规范、性能优化、主题适配等方面。遵循这些实践可以提高代码质量、开发效率和项目可维护性。

**核心价值：**

- **可维护性** - 清晰的组织结构和命名规范，便于长期维护
- **可扩展性** - 模块化设计支持功能快速扩展
- **高性能** - 优化技巧确保应用流畅运行
- **团队协作** - 统一规范降低协作成本
- **主题灵活** - 完善的主题系统支持多种视觉风格

## 样式组织规范

### 7-1 架构模式

项目采用 7-1 架构模式组织样式文件：

```
styles/
├── abstracts/      # 1. 抽象层（不输出CSS）
├── base/           # 2. 基础层（全局基础样式）
├── components/     # 3. 组件层（组件样式）
├── layout/         # 4. 布局层（布局结构）
├── themes/         # 5. 主题层（主题变量）
├── vendors/        # 6. 第三方层（库样式覆盖）
└── main.scss       # 7. 主入口文件
```

**各层职责：**

1. **抽象层** (`abstracts/`)
   - 变量定义 (`_variables.scss`)
   - 混合器 (`_mixins.scss`)
   - 函数 (`_functions.scss`)
   - 不生成任何CSS代码

2. **基础层** (`base/`)
   - CSS重置 (`_reset.scss`)
   - 排版规则 (`_typography.scss`)
   - 全局基础样式

3. **组件层** (`components/`)
   - 按钮样式 (`_buttons.scss`)
   - 动画效果 (`_animations.scss`)
   - 可复用组件样式

4. **布局层** (`layout/`)
   - 页面布局 (`_layout.scss`)
   - 网格系统
   - 容器样式

5. **主题层** (`themes/`)
   - 亮色主题 (`_light.scss`)
   - 暗色主题 (`_dark.scss`)
   - 主题CSS变量

6. **第三方层** (`vendors/`)
   - Element Plus覆盖 (`_element-plus.scss`)
   - 其他第三方库样式

7. **主入口** (`main.scss`)
   - 按顺序导入所有模块
   - 定义全局样式

### 文件命名规范

**SCSS 部分文件**：

```scss
// ✅ 推荐：使用下划线前缀
_variables.scss
_mixins.scss
_buttons.scss

// ❌ 避免：无前缀（会被编译为独立CSS文件）
variables.scss
mixins.scss
```

**普通 SCSS 文件**：

```scss
// ✅ 推荐：小写连字符
main.scss
theme-animation.scss

// ❌ 避免：驼峰或下划线
mainStyle.scss
theme_animation.scss
```

### 导入顺序

**严格遵循以下顺序导入**：

```scss
// 1. 外部库（最先）
@use 'animate.css';
@use 'element-plus/dist/index.css';

// 2. 抽象层（提供变量和工具）
@use './abstracts/variables' as *;
@use './abstracts/mixins' as *;

// 3. 主题层（定义CSS变量）
@use './themes/light';
@use './themes/dark';

// 4. 基础层（重置和基础样式）
@use './base/reset';
@use './base/typography';

// 5. 布局层（布局结构）
@use './layout/layout';

// 6. 组件层（组件样式）
@use './components/buttons';
@use './components/animations';

// 7. 第三方覆盖（最后，确保优先级）
@use './vendors/element-plus';
```

**为什么顺序重要？**

- **层叠优先级** - 后导入的样式优先级更高
- **变量可用性** - 确保变量在使用前已定义
- **依赖关系** - 满足模块间的依赖需求

## 命名规范

### BEM 命名方法论

项目推荐使用 BEM（Block Element Modifier）命名方法：

```scss
// Block（块）
.button { }

// Element（元素）
.button__icon { }
.button__text { }

// Modifier（修饰符）
.button--primary { }
.button--large { }
.button--disabled { }
```

**完整示例：**

```vue
<template>
  <button class="search-form">
    <i class="search-form__icon"></i>
    <input class="search-form__input search-form__input--focused" />
    <button class="search-form__button search-form__button--primary">
      搜索
    </button>
  </button>
</template>

<style lang="scss" scoped>
.search-form {
  display: flex;
  gap: 8px;

  &__icon {
    font-size: 16px;
    color: var(--text-secondary);
  }

  &__input {
    padding: 8px 12px;
    border: 1px solid var(--border-color);

    &--focused {
      border-color: var(--el-color-primary);
    }
  }

  &__button {
    padding: 8px 16px;

    &--primary {
      background: var(--el-color-primary);
      color: white;
    }
  }
}
</style>
```

### 类名前缀

**使用有意义的前缀区分不同类型：**

```scss
// ✅ 推荐
.is-active      // 状态类
.has-error      // 状态类
.js-accordion   // JavaScript钩子
.u-hidden       // 工具类
.c-button       // 组件类

// ❌ 避免
.active
.error
.accordion
.hidden
.button
```

### 工具类命名

**遵循原子化CSS思想：**

```scss
// 布局
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }

// 间距
.m-0 { margin: 0; }
.p-4 { padding: 16px; }
.mt-2 { margin-top: 8px; }

// 文本
.text-center { text-align: center; }
.text-ellipsis { /* 单行省略 */ }

// 颜色
.text-primary { color: var(--el-color-primary); }
.bg-white { background-color: white; }
```

**使用 UnoCSS 工具类**：

项目集成了 UnoCSS，优先使用内置工具类：

```vue
<template>
  <!-- ✅ 推荐：使用 UnoCSS -->
  <div class="flex items-center justify-between p-4 text-gray-700">
    内容
  </div>

  <!-- ❌ 避免：自定义重复的工具类 -->
  <div class="custom-flex custom-center custom-padding">
    内容
  </div>
</template>
```

## SCSS 使用规范

### @use 替代 @import

**现代SCSS使用 @use 和 @forward**：

```scss
// ❌ 过时：@import
@import './variables';
@import './mixins';

// ✅ 推荐：@use
@use './variables' as *;      // 使用所有成员
@use './mixins' as m;          // 使用命名空间
@use './functions';            // 显式命名空间
```

**@use 的优势：**

- 命名空间隔离，避免变量冲突
- 只加载一次，提高编译性能
- 更清晰的依赖关系

### 嵌套规范

**限制嵌套层级**：

```scss
// ✅ 推荐：最多3层
.card {
  padding: 16px;

  &__header {
    margin-bottom: 12px;

    &__title {
      font-size: 18px;
      font-weight: 600;
    }
  }
}

// ❌ 避免：过深嵌套
.page {
  .container {
    .content {
      .card {
        .header {
          .title {
            // 6层嵌套，难以维护
          }
        }
      }
    }
  }
}
```

**使用 & 符号**：

```scss
.button {
  background: white;

  // ✅ 推荐：BEM修饰符
  &--primary {
    background: blue;
  }

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

### 变量命名

**使用语义化的变量名**：

```scss
// ✅ 推荐：语义化
$color-primary: #409eff;
$color-success: #67c23a;
$color-danger: #f56c6c;
$spacing-small: 8px;
$spacing-medium: 16px;
$duration-normal: 0.3s;

// ❌ 避免：无意义
$blue: #409eff;
$green: #67c23a;
$red: #f56c6c;
$s: 8px;
$m: 16px;
$d: 0.3s;
```

**遵循命名约定**：

```scss
// 颜色: color-{语义}
$color-primary
$color-text
$color-border

// 尺寸: size-{类型}-{大小}
$size-font-small
$size-border-radius

// 间距: spacing-{大小}
$spacing-xs
$spacing-sm
$spacing-md

// 时长: duration-{速度}
$duration-fast
$duration-normal
$duration-slow
```

### 混合器使用

**创建可复用的混合器**：

```scss
// ✅ 推荐：参数化混合器
@mixin button-variant($bg, $color, $border) {
  background-color: $bg;
  color: $color;
  border: 1px solid $border;

  &:hover {
    background-color: darken($bg, 10%);
    border-color: darken($border, 10%);
  }
}

// 使用
.button-primary {
  @include button-variant(#409eff, white, #409eff);
}

.button-success {
  @include button-variant(#67c23a, white, #67c23a);
}
```

**避免过度使用混合器**：

```scss
// ❌ 避免：简单属性不需要混合器
@mixin red-text {
  color: red;
}

// ✅ 推荐：使用变量或工具类
$color-danger: red;

.error-text {
  color: $color-danger;
}
```

## CSS 变量使用

### 定义CSS变量

**在 :root 中定义全局变量**：

```scss
:root {
  // 颜色系统
  --color-primary: #409eff;
  --color-success: #67c23a;
  --color-warning: #e6a23c;
  --color-danger: #f56c6c;

  // 文本颜色
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;

  // 背景层级
  --bg-base: #ffffff;
  --bg-level-1: #f5f7fa;
  --bg-level-2: #ebeef5;

  // 间距系统
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  // 圆角系统
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-round: 20px;

  // 阴影系统
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);

  // 动画时长
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.6s;

  // Z-index层级
  --z-dropdown: 1000;
  --z-sticky: 1010;
  --z-fixed: 1020;
  --z-modal: 1050;
  --z-popover: 2000;
}
```

### 使用CSS变量

**优先使用CSS变量**：

```scss
// ✅ 推荐：CSS变量（支持主题切换）
.card {
  background-color: var(--bg-level-1);
  border: 1px solid var(--bg-level-2);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-normal) ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

// ❌ 避免：硬编码值
.card {
  background-color: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}
```

### CSS变量回退值

**提供合理的回退值**：

```scss
.element {
  // 单个回退值
  color: var(--text-primary, #303133);

  // 多层回退
  background: var(--bg-custom, var(--bg-level-1, #f5f7fa));

  // calc 计算
  padding: calc(var(--spacing-md, 16px) * 2);
}
```

### 动态CSS变量

**使用 JavaScript 动态修改**：

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 修改单个变量
  document.documentElement.style.setProperty('--color-primary', '#FF0000')

  // 批量修改
  const theme = {
    '--color-primary': '#FF0000',
    '--color-success': '#00FF00',
    '--color-warning': '#FFA500',
  }

  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
})
</script>
```

## 响应式设计

### 断点系统

**使用统一的断点**：

```scss
// 定义断点变量
$breakpoint-sm: 768px;
$breakpoint-md: 992px;
$breakpoint-lg: 1200px;
$breakpoint-xl: 1920px;

// 创建响应式混合器
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (max-width: #{$breakpoint-sm}) {
      @content;
    }
  }
  @else if $breakpoint == 'md' {
    @media (max-width: #{$breakpoint-md}) {
      @content;
    }
  }
  @else if $breakpoint == 'lg' {
    @media (max-width: #{$breakpoint-lg}) {
      @content;
    }
  }
  @else if $breakpoint == 'xl' {
    @media (max-width: #{$breakpoint-xl}) {
      @content;
    }
  }
}
```

**使用示例：**

```scss
.container {
  padding: 32px;

  @include respond-to('lg') {
    padding: 24px;
  }

  @include respond-to('md') {
    padding: 16px;
  }

  @include respond-to('sm') {
    padding: 12px;
  }
}
```

### Mobile First

**优先考虑移动端**：

```scss
// ✅ 推荐：Mobile First
.element {
  // 移动端样式（基础）
  font-size: 14px;
  padding: 8px;

  // 平板及以上
  @media (min-width: 768px) {
    font-size: 16px;
    padding: 12px;
  }

  // 桌面端
  @media (min-width: 1200px) {
    font-size: 18px;
    padding: 16px;
  }
}

// ❌ 避免：Desktop First
.element {
  // 桌面端样式
  font-size: 18px;
  padding: 16px;

  // 平板
  @media (max-width: 1199px) {
    font-size: 16px;
    padding: 12px;
  }

  // 移动端
  @media (max-width: 767px) {
    font-size: 14px;
    padding: 8px;
  }
}
```

### 响应式单位

**合理使用相对单位**：

```scss
// ✅ 推荐：使用相对单位
.card {
  width: 100%;
  max-width: 600px;
  padding: 1rem;           // 相对于根字体
  margin: 2em 0;           // 相对于当前字体
  font-size: clamp(14px, 2vw, 18px); // 响应式字体
}

// ❌ 避免：全部使用固定单位
.card {
  width: 600px;
  padding: 16px;
  margin: 32px 0;
  font-size: 16px;
}
```

**单位选择指南**：

- `px` - 边框、阴影等需要精确控制的属性
- `rem` - 字体大小、间距（可全局缩放）
- `em` - 相对于父元素的尺寸
- `%` - 相对于父容器的百分比
- `vw/vh` - 相对于视口的百分比
- `clamp()` - 响应式数值范围

### 容器查询

**使用CSS容器查询（现代浏览器）**：

```scss
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 12px;

  @container card (min-width: 400px) {
    padding: 16px;
    display: flex;
  }

  @container card (min-width: 600px) {
    padding: 24px;
  }
}
```

## 性能优化

### 减少重排重绘

**使用 transform 和 opacity**：

```scss
// ✅ 推荐：使用 transform（GPU加速）
.element {
  transform: translateX(0);
  transition: transform 0.3s ease;

  &.moved {
    transform: translateX(100px);
  }
}

// ❌ 避免：使用 left/top（触发重排）
.element {
  position: relative;
  left: 0;
  transition: left 0.3s ease;

  &.moved {
    left: 100px;
  }
}
```

**优化动画属性**：

```scss
// ✅ 推荐：只动画化 transform 和 opacity
.fade-slide {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

  &.hidden {
    opacity: 0;
    transform: translateY(-20px);
  }
}

// ❌ 避免：动画化触发重排的属性
.fade-slide {
  opacity: 1;
  height: auto;
  margin-top: 0;
  transition:
    opacity 0.3s ease,
    height 0.3s ease,
    margin-top 0.3s ease;
}
```

### will-change

**合理使用 will-change**：

```scss
// ✅ 推荐：交互前添加
.button {
  &:hover {
    will-change: transform;
    transform: scale(1.05);
  }

  &:active {
    will-change: auto; // 交互后移除
  }
}

// ❌ 避免：长期使用
.button {
  will-change: transform; // 持续占用资源
  transform: scale(1);
}
```

### 选择器优化

**使用高效的选择器**：

```scss
// ✅ 推荐：类选择器
.button { }
.button-primary { }

// ✅ 可以：子选择器
.list > .item { }

// ⚠️ 谨慎：后代选择器
.container .item { }

// ❌ 避免：过度限定
div.container ul.list li.item span.text { }

// ❌ 避免：通配符
* { margin: 0; }
```

### 代码分割

**按需加载样式**：

```vue
<template>
  <div class="page">
    <!-- 内容 -->
  </div>
</template>

<script lang="ts" setup>
// ✅ 推荐：组件级样式（自动按需）
</script>

<style lang="scss" scoped>
// 组件样式
.page {
  // ...
}
</style>
```

### 压缩和优化

**生产环境优化**：

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 自动导入全局样式
        additionalData: `@use "@/assets/styles/abstracts/variables" as *;`,
      },
    },
  },
  build: {
    // CSS 代码分割
    cssCodeSplit: true,
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 删除 console
        drop_debugger: true, // 删除 debugger
      },
    },
  },
})
```

## 主题适配

### 主题切换架构

**使用 data 属性控制主题**：

```typescript
// useTheme.ts
export function useTheme() {
  const theme = ref<'light' | 'dark'>('light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return {
    theme,
    toggleTheme,
  }
}
```

**定义主题变量**：

```scss
// themes/_light.scss
[data-theme='light'] {
  --bg-base: #ffffff;
  --bg-level-1: #f5f7fa;
  --bg-level-2: #ebeef5;
  --text-primary: #303133;
  --text-regular: #606266;
  --border-color: #dcdfe6;
}

// themes/_dark.scss
[data-theme='dark'] {
  --bg-base: #1a1a1a;
  --bg-level-1: #242424;
  --bg-level-2: #2e2e2e;
  --text-primary: #e5e5e5;
  --text-regular: #a8a8a8;
  --border-color: #3e3e3e;
}
```

### 主题过渡动画

**平滑的主题切换**：

```scss
// theme-animation.scss
* {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;
}

// 禁用某些元素的过渡
.no-transition,
.no-transition * {
  transition: none !important;
}
```

### 暗黑模式媒体查询

**响应系统主题偏好**：

```scss
// 默认跟随系统
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --bg-base: #1a1a1a;
    --text-primary: #e5e5e5;
    // ... 暗黑模式变量
  }
}
```

### 组件主题适配

**编写主题无关的组件**：

```vue
<template>
  <div class="themed-card">
    <h3 class="themed-card__title">标题</h3>
    <p class="themed-card__content">内容</p>
  </div>
</template>

<style lang="scss" scoped>
.themed-card {
  // ✅ 推荐：使用CSS变量
  background-color: var(--bg-level-1);
  border: 1px solid var(--border-color);
  color: var(--text-primary);

  // ❌ 避免：硬编码颜色
  // background-color: #ffffff;
  // border: 1px solid #dcdfe6;
  // color: #303133;

  &__title {
    color: var(--text-primary);
    font-weight: 600;
  }

  &__content {
    color: var(--text-regular);
  }
}
</style>
```

## 代码复用

### 抽取公共样式

**识别重复代码**：

```scss
// ❌ 避免：重复代码
.card-a {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-b {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

// ✅ 推荐：使用混合器
@mixin card-base {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-a {
  @include card-base;
  background: white;
}

.card-b {
  @include card-base;
  background: #f5f5f5;
}

// ✅ 更好：使用基类
.card-base {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-a {
  @extend .card-base;
  background: white;
}

.card-b {
  @extend .card-base;
  background: #f5f5f5;
}
```

### 组合而非继承

**优先使用组合**：

```vue
<template>
  <!-- ✅ 推荐：组合多个类 -->
  <button class="btn btn-primary btn-large">
    提交
  </button>

  <!-- ❌ 避免：单一类承担所有样式 -->
  <button class="primary-large-button">
    提交
  </button>
</template>

<style lang="scss" scoped>
// 基础按钮
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

// 颜色变体
.btn-primary {
  background: var(--el-color-primary);
  color: white;
}

.btn-success {
  background: var(--el-color-success);
  color: white;
}

// 尺寸变体
.btn-large {
  padding: 12px 24px;
  font-size: 16px;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
```

### 工具类库

**利用UnoCSS工具类**：

```vue
<template>
  <!-- ✅ 推荐：使用工具类 -->
  <div class="flex items-center justify-between p-4 bg-white rounded-lg">
    <span class="text-lg font-semibold">标题</span>
    <button class="px-4 py-2 bg-blue-500 text-white rounded">
      操作
    </button>
  </div>

  <!-- ❌ 避免：自定义重复样式 -->
  <div class="custom-container">
    <span class="custom-title">标题</span>
    <button class="custom-button">操作</button>
  </div>
</template>

<style lang="scss" scoped>
/* ❌ 重复的自定义样式 */
.custom-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.custom-title {
  font-size: 18px;
  font-weight: 600;
}

.custom-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
}
</style>
```

## 避免常见错误

### 不要使用 !important

```scss
// ❌ 避免：滥用 !important
.button {
  color: red !important;
  background: blue !important;
}

// ✅ 推荐：提高选择器优先级
.page .button {
  color: red;
  background: blue;
}

// ✅ 更好：使用更具体的类名
.button--danger {
  color: red;
  background: blue;
}
```

**何时可以使用 !important**：

- 覆盖第三方库样式（没有其他方法）
- 工具类（确保总是生效）

```scss
// ✅ 可以：工具类
.u-hidden {
  display: none !important;
}
```

### 避免过度嵌套

```scss
// ❌ 避免：超过3层嵌套
.page {
  .container {
    .content {
      .card {
        .header {
          .title {
            // 太深了
          }
        }
      }
    }
  }
}

// ✅ 推荐：扁平化
.page-container {
  // ...
}

.page-content {
  // ...
}

.page-card {
  // ...
}

.page-card__header {
  // ...
}

.page-card__title {
  // ...
}
```

### 避免魔法数字

```scss
// ❌ 避免：硬编码数值
.element {
  padding: 23px;
  margin-top: 47px;
  z-index: 9999;
}

// ✅ 推荐：使用变量
.element {
  padding: var(--spacing-md);
  margin-top: calc(var(--spacing-md) * 3);
  z-index: var(--z-modal);
}
```

### 避免样式污染

```vue
<!-- ❌ 避免：全局样式污染 -->
<style lang="scss">
.title {
  font-size: 24px; // 会影响所有 .title
}
</style>

<!-- ✅ 推荐：使用 scoped -->
<style lang="scss" scoped>
.title {
  font-size: 24px; // 只影响当前组件
}
</style>

<!-- ✅ 更好：使用唯一类名 -->
<style lang="scss" scoped>
.user-profile__title {
  font-size: 24px;
}
</style>
```

### 避免冗余代码

```scss
// ❌ 避免：冗余属性
.element {
  display: block;
  display: flex; // 覆盖了上面的
}

// ❌ 避免：无效属性
.element {
  display: inline;
  width: 100px; // inline元素宽度无效
}

// ❌ 避免：默认值
.element {
  position: static; // 默认值
  display: block; // div默认就是block
}

// ✅ 推荐：只写必要的
.element {
  display: flex;
  width: 100px;
}
```

## 工具和插件

### VS Code 插件

**推荐安装**：

1. **SCSS IntelliSense** - SCSS 智能提示
2. **Stylelint** - 样式代码检查
3. **PostCSS Language Support** - PostCSS 支持
4. **Color Highlight** - 颜色高亮
5. **CSS Peek** - 快速查看CSS定义

### Stylelint 配置

**安装和配置**：

```bash
pnpm add -D stylelint stylelint-config-standard-scss
```

```javascript
// .stylelintrc.js
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
  ],
  rules: {
    'selector-class-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
    'max-nesting-depth': 3,
    'no-descending-specificity': null,
  },
}
```

### UnoCSS 配置

**最大化工具类使用**：

```typescript
// uno.config.ts
import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded cursor-pointer',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
    'card': 'bg-white rounded-lg shadow p-4',
  },
  theme: {
    colors: {
      primary: 'var(--el-color-primary)',
      success: 'var(--el-color-success)',
      warning: 'var(--el-color-warning)',
      danger: 'var(--el-color-danger)',
    },
  },
})
```

## 实际案例

### 案例1：响应式卡片

**需求**：创建一个响应式卡片组件，在不同屏幕尺寸下显示不同布局。

```vue
<template>
  <div class="responsive-card">
    <img class="responsive-card__image" :src="image" alt="">
    <div class="responsive-card__content">
      <h3 class="responsive-card__title">{{ title }}</h3>
      <p class="responsive-card__description">{{ description }}</p>
      <button class="responsive-card__action">查看详情</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  image: string
  title: string
  description: string
}>()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/abstracts/mixins' as *;
@use '@/assets/styles/abstracts/variables' as *;

.responsive-card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: box-shadow var(--duration-normal) ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  // 平板横向及以上：横向布局
  @include respond-to('md') {
    flex-direction: row;
  }

  &__image {
    width: 100%;
    height: 200px;
    object-fit: cover;

    @include respond-to('md') {
      width: 200px;
      height: auto;
    }
  }

  &__content {
    padding: var(--spacing-md);
    flex: 1;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);

    @include respond-to('lg') {
      font-size: 20px;
    }
  }

  &__description {
    color: var(--text-regular);
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }

  &__action {
    @include button-base;
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--el-color-primary);
    color: white;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
```

### 案例2：主题切换按钮

**需求**：创建一个带动画的主题切换按钮。

```vue
<template>
  <button
    class="theme-toggle"
    :class="{ 'theme-toggle--dark': isDark }"
    @click="toggleTheme"
  >
    <transition name="icon-fade" mode="out-in">
      <i v-if="isDark" key="moon" class="icon-moon">🌙</i>
      <i v-else key="sun" class="icon-sun">☀️</i>
    </transition>
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
const isDark = computed(() => theme.value === 'dark')
</script>

<style lang="scss" scoped>
.theme-toggle {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-round);
  background-color: var(--bg-level-2);
  border: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color var(--duration-normal) ease,
    transform var(--duration-fast) ease;

  &:hover {
    background-color: var(--bg-level-3);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  i {
    font-size: 24px;
    line-height: 1;
  }
}

// 图标淡入淡出动画
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity var(--duration-fast) ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}
</style>
```

### 案例3：数据表格布局

**需求**：创建一个复杂的数据表格页面布局。

```vue
<template>
  <div class="table-page">
    <!-- 搜索栏 -->
    <div class="table-page__search search">
      <div class="filter-container">
        <div class="filter-item">
          <el-input
            v-model="keyword"
            placeholder="搜索..."
            clearable
          />
        </div>
        <div class="filter-item">
          <el-button type="primary" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-page__content panel">
      <el-table :data="tableData" style="width: 100%">
        <!-- 表格列 -->
      </el-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('')
const tableData = ref([])

const handleSearch = () => {
  console.log('搜索:', keyword.value)
}

const handleReset = () => {
  keyword.value = ''
}
</script>

<style lang="scss" scoped>
.table-page {
  padding: var(--spacing-lg);

  &__search {
    margin-bottom: var(--spacing-md);
  }

  &__content {
    // panel 类已提供基础样式
  }
}
</style>
```

## 总结

遵循本文档的最佳实践，可以：

**提高代码质量**：
- 统一的命名规范
- 清晰的代码结构
- 可维护的样式代码

**提升开发效率**：
- 复用混合器和工具类
- 快速实现响应式设计
- 高效的主题切换

**优化应用性能**：
- 减少重排重绘
- 合理使用CSS变量
- 优化选择器性能

**团队协作顺畅**：
- 统一的开发规范
- 清晰的文档说明
- 易于理解的代码

**核心原则**：

1. **保持简单** - 不过度设计，够用就好
2. **追求复用** - 识别重复，抽取公共
3. **注重性能** - 优化为先，体验至上
4. **规范统一** - 团队协作，保持一致
5. **持续优化** - 不断改进，追求卓越

掌握这些最佳实践，将帮助你编写出高质量、高性能、易维护的样式代码。
