# 全局样式

## 介绍

RuoYi-Plus-UniApp 前端项目的全局样式系统提供了一套完整的基础样式规范,包括全局变量、重置样式、排版系统、通用工具类等。全局样式作为整个应用的样式基础,确保了视觉一致性和开发效率。

**核心特性:**

- **统一变量系统** - 定义全局 SCSS 变量和 CSS 变量,包括颜色、尺寸、动画时长、层级等
- **完善的重置样式** - 消除浏览器默认样式差异,建立统一的视觉基线
- **系统化排版** - 标题层次、段落样式、链接样式、代码块样式等
- **实用工具类** - 文本省略、容器样式、筛选器、链接类型等常用样式
- **响应式断点** - 统一的断点系统,支持多种设备适配
- **主题集成** - 与主题系统无缝集成,支持亮色/暗色模式

## 全局变量系统

### SCSS 变量

SCSS 变量定义在 `src/assets/styles/abstracts/_variables.scss` 文件中,用于编译时的样式计算。

#### 基础颜色变量

项目定义了一组语义化的基础颜色变量:

```scss
/* 基础颜色变量 */
$blue: #324157;        // 主蓝色
$light-blue: #3a71a8;  // 浅蓝色
$red: #c03639;         // 红色
$pink: #e65d6e;        // 粉色
$green: #30b08f;       // 绿色
$tiffany: #4ab7bd;     // 蒂芙尼蓝
$yellow: #fec171;      // 黄色
$panGreen: #30b08f;    // Pan绿色
```

**使用示例:**

```scss
.custom-button {
  background: $blue;
  color: white;

  &:hover {
    background: $light-blue;
  }
}

.success-badge {
  background: $green;
}

.warning-banner {
  background: $yellow;
  color: $blue;
}
```

#### Element Plus 主题色变量

为了与 Element Plus 组件库保持一致,定义了对应的主题色变量:

```scss
/* Element UI 主题色变量 */
$el-color-primary: #409eff;   // 主要
$el-color-success: #67c23a;   // 成功
$el-color-warning: #e6a23c;   // 警告
$el-color-danger: #f56c6c;    // 危险
$el-color-info: #909399;      // 信息
```

**颜色语义:**
- `primary`: 主要操作、强调内容
- `success`: 成功状态、确认操作
- `warning`: 警告信息、需要注意
- `danger`: 危险操作、错误状态
- `info`: 信息提示、中性内容

**使用场景:**

```scss
.primary-action {
  color: $el-color-primary;
}

.success-message {
  border-left: 4px solid $el-color-success;
}

.warning-box {
  background: rgba($el-color-warning, 0.1);
  border: 1px solid $el-color-warning;
}

.danger-zone {
  border: 2px solid $el-color-danger;

  &:hover {
    background: rgba($el-color-danger, 0.05);
  }
}
```

#### 布局尺寸变量

定义全局布局相关的尺寸变量:

```scss
/* 布局尺寸变量 */
$base-sidebar-width: 240px;  // 侧边栏基础宽度
```

**应用示例:**

```scss
.sidebar {
  width: $base-sidebar-width;
  transition: width 0.3s ease;

  &.collapsed {
    width: 54px;
  }
}

.main-content {
  margin-left: $base-sidebar-width;
  transition: margin-left 0.3s ease;

  &.full-width {
    margin-left: 54px;
  }
}
```

#### 响应式断点变量

统一的响应式断点系统,支持多种屏幕尺寸:

```scss
/* 响应式断点变量 */
$sm: 768px;    // 小型设备(平板)
$md: 992px;    // 中型设备(桌面)
$lg: 1200px;   // 大型设备(大屏桌面)
$xl: 1920px;   // 超大设备(超大屏)

/* 设备断点变量 */
$device-notebook: 1600px;        // 笔记本
$device-ipad-pro: 1180px;        // iPad Pro
$device-ipad: 800px;             // iPad
$device-ipad-vertical: 900px;    // iPad 竖屏
$device-phone: 500px;            // 手机

/* 断点映射 */
$breakpoints: (
  'sm': $sm,
  'md': $md,
  'lg': $lg,
  'xl': $xl
);
```

**断点对比:**

| 断点 | 尺寸 | 设备类型 | 适用场景 |
|------|------|----------|----------|
| `$sm` | 768px | 平板 | 中小屏适配 |
| `$md` | 992px | 桌面 | 标准桌面布局 |
| `$lg` | 1200px | 大屏桌面 | 宽屏优化 |
| `$xl` | 1920px | 超大屏 | 4K/超宽屏 |

**使用示例:**

```scss
.container {
  width: 100%;
  padding: 16px;

  @media (min-width: $sm) {
    width: 750px;
  }

  @media (min-width: $md) {
    width: 970px;
    padding: 24px;
  }

  @media (min-width: $lg) {
    width: 1170px;
  }

  @media (min-width: $xl) {
    width: 1600px;
  }
}
```

### CSS 变量

CSS 变量定义在 `:root` 选择器中,支持运行时动态修改,与主题系统集成。

#### 动画时长变量

统一的动画时长系统,确保动画效果一致:

```scss
:root {
  --duration-normal: 0.3s;  // 标准动画时长
  --duration-slow: 0.6s;    // 慢速动画时长
}
```

**使用场景:**

```scss
.transition-element {
  transition: all var(--duration-normal) ease;
}

.slow-animation {
  transition: transform var(--duration-slow) cubic-bezier(0.4, 0, 0.2, 1);
}

.button {
  transition: background var(--duration-normal),
              transform var(--duration-normal);

  &:hover {
    transform: translateY(-2px);
  }
}
```

**动画时长选择指南:**
- `--duration-normal` (0.3s): 按钮hover、下拉菜单、标签切换等快速交互
- `--duration-slow` (0.6s): 页面切换、侧边栏展开、模态框显示等较慢动画

#### Z-index 层级变量

统一管理 z-index 层级,避免层级混乱:

```scss
:root {
  --z-sidebar: 1001;   // 侧边栏层级
  --z-header: 9;       // 头部层级
  --z-mask: 999;       // 遮罩层级
  --z-modal: 1050;     // 模态框层级
}
```

**层级规则:**

| 层级 | 值 | 用途 | 说明 |
|------|-----|------|------|
| `--z-header` | 9 | 头部导航 | 低于侧边栏 |
| `--z-mask` | 999 | 遮罩层 | 覆盖主内容 |
| `--z-sidebar` | 1001 | 侧边栏 | 高于遮罩层 |
| `--z-modal` | 1050 | 模态框 | 最高层级 |

**使用示例:**

```scss
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-header);
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: var(--z-sidebar);
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-mask);
  background: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-modal);
}
```

#### 尺寸变量

统一的尺寸系统:

```scss
:root {
  --sidebar-collapsed-width: 54px;  // 侧边栏收起宽度
}
```

**应用示例:**

```scss
.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.main-content.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}
```

#### 圆角变量

统一的圆角系统,支持四种尺寸:

```scss
:root {
  --radius-sm: 4px;      // 小圆角
  --radius-md: 8px;      // 中圆角
  --radius-lg: 12px;     // 大圆角
  --radius-round: 20px;  // 全圆角
}
```

**圆角使用指南:**

| 变量 | 值 | 适用组件 | 示例 |
|------|-----|----------|------|
| `--radius-sm` | 4px | 按钮、输入框、标签 | 小型UI元素 |
| `--radius-md` | 8px | 卡片、面板、下拉菜单 | 中型容器 |
| `--radius-lg` | 12px | 模态框、抽屉、大卡片 | 大型容器 |
| `--radius-round` | 20px | 徽章、标签、特殊按钮 | 圆形元素 |

**使用示例:**

```scss
.button {
  border-radius: var(--radius-sm);
}

.card {
  border-radius: var(--radius-md);
}

.modal {
  border-radius: var(--radius-lg);
}

.badge {
  border-radius: var(--radius-round);
  padding: 4px 12px;
}
```

#### 动态圆角系统

支持基于基础值动态计算的圆角系统:

```scss
:root {
  --custom-radius: 12px;  // 基础圆角值,可通过主题切换

  // Element Plus 组件圆角映射
  --el-border-radius-base: calc(var(--custom-radius) / 3 + 2px);
  --el-border-radius-small: calc(var(--custom-radius) / 3 + 4px);
  --el-messagebox-border-radius: calc(var(--custom-radius) / 3 + 4px);
  --el-popover-border-radius: calc(var(--custom-radius) / 3 + 4px);
}
```

**计算逻辑:**
- 基础圆角: `12px / 3 + 2px = 6px`
- 小圆角: `12px / 3 + 4px = 8px`

**主题切换示例:**

```typescript
// 切换为更圆润的主题
const setRoundedTheme = () => {
  document.documentElement.style.setProperty('--custom-radius', '16px')
  // 自动计算: base = 5.33 + 2 = 7.33px, small = 5.33 + 4 = 9.33px
}

// 切换为方正主题
const setSharpTheme = () => {
  document.documentElement.style.setProperty('--custom-radius', '6px')
  // 自动计算: base = 2 + 2 = 4px, small = 2 + 4 = 6px
}
```

#### 组件统一高度系统

统一 Element Plus 组件的高度:

```scss
:root {
  --el-component-custom-height: 32px;
  --el-component-size: var(--el-component-custom-height);
}
```

**效果:**
- 所有按钮、输入框、选择器等组件统一高度为 32px
- 确保视觉一致性和对齐

#### 主色系变量

```scss
:root {
  --main-color: var(--el-color-primary);  // 主色映射到 Element Plus 主题色
}
```

#### Element Plus 菜单颜色映射

```scss
:root {
  /* 自定义激活颜色 */
  --custom-active-bg-color: rgba(64, 158, 255, 0.1);
  --cutsom-active-text-color: rgba(66, 161, 255, 1);

  /* Element Plus 菜单激活颜色 */
  --el-menu-active-bg-color: rgba(64, 158, 255, 0.1);
  --el-menu-active-text-color: rgba(66, 161, 255, 1);
}
```

**应用效果:**
- 菜单激活项背景色: 半透明蓝色
- 菜单激活项文字色: 亮蓝色
- 统一的交互反馈

## 重置样式

重置样式定义在 `src/assets/styles/base/_reset.scss` 文件中,消除浏览器默认样式差异。

### 盒模型重置

统一所有元素使用 `border-box` 盒模型:

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

**优势:**
- padding 和 border 不再增加元素总宽度
- 简化布局计算
- 避免宽度溢出问题

**对比示例:**

```scss
/* content-box (默认) */
.box-content {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 2px solid #ccc;
  /* 实际宽度: 200 + 20*2 + 2*2 = 244px */
}

/* border-box (推荐) */
.box-border {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 2px solid #ccc;
  /* 实际宽度: 200px (包含padding和border) */
}
```

### HTML 和 Body 重置

```scss
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--text-color-primary);
  background: var(--bg-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**设置说明:**
- 高度100%: 确保全屏布局
- 字体平滑: 提升文字渲染质量
- 主题集成: 使用 CSS 变量支持主题切换

### 标题重置

```scss
h1, h2, h3, h4, h5, h6 {
  margin: 0 0 16px 0;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-color-primary);
}
```

### 段落重置

```scss
p {
  margin: 0 0 16px 0;
  line-height: 1.8;
  color: var(--text-color-regular);
}
```

### 链接重置

```scss
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color var(--duration-normal) ease;

  &:hover {
    color: var(--primary-color-hover);
  }

  &:focus {
    outline: none;
  }
}
```

### 列表重置

```scss
ul,
ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
```

**应用场景:**
- 导航菜单
- 数据列表
- 标签组
- 任何非语义化列表

### 表单元素重置

```scss
button,
input,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;

  &:focus {
    outline: none;
  }
}
```

### 图片重置

```scss
img {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
}
```

**优势:**
- 响应式图片
- 避免图片超出容器
- 消除图片底部空隙

## 排版系统

排版系统定义在 `src/assets/styles/base/_typography.scss` 文件中。

### 字体族

```scss
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
               Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
               sans-serif;
}
```

**字体栈说明:**
- macOS/iOS: -apple-system (San Francisco)
- Windows: Segoe UI
- Android: Roboto
- Linux: Ubuntu
- 后备字体: 无衬线字体

### 标题层次

六级标题清晰的视觉层次:

```scss
h1 {
  font-size: 32px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16px;
}

h2 {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16px;
}

h3 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16px;
}

h4 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16px;
}

h5 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16px;
}

h6 {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16px;
}
```

**响应式标题:**

```scss
@media (max-width: 768px) {
  h1 { font-size: 28px; }
  h2 { font-size: 24px; }
  h3 { font-size: 20px; }
  h4 { font-size: 18px; }
  h5 { font-size: 16px; }
  h6 { font-size: 14px; }
}
```

### 段落样式

```scss
p {
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 16px;
  color: var(--text-color-regular);
}
```

### 链接样式

```scss
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary-color-hover);
    text-decoration: underline;
  }

  &:active {
    color: var(--primary-color-active);
  }
}
```

### 代码样式

```scss
code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  padding: 2px 6px;
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  color: var(--text-color-danger);
}

pre {
  margin: 0 0 16px 0;
  padding: 16px;
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow-x: auto;

  code {
    padding: 0;
    background: none;
    border: none;
    color: inherit;
  }
}
```

## 通用工具类

### 容器样式

#### 搜索面板容器

```scss
.panel,
.search {
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;
  padding: 12px;
  transition: all var(--duration-normal) ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}
```

**使用示例:**

```vue
<template>
  <div class="search">
    <el-form :inline="true">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="请输入关键词" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
  </div>

  <div class="panel">
    <el-table :data="tableData">
      <!-- 表格列 -->
    </el-table>
  </div>
</template>
```

#### 组件容器

```scss
.components-container {
  margin: 30px 50px;
  position: relative;
}
```

**应用场景:**
- 页面主要内容区域
- 组件演示容器
- 内容展示区域

**使用示例:**

```vue
<template>
  <div class="components-container">
    <h2>用户管理</h2>
    <div class="search">
      <!-- 搜索表单 -->
    </div>
    <div class="panel">
      <!-- 数据表格 -->
    </div>
  </div>
</template>
```

### 侧边提示样式

```scss
aside {
  background: #eef1f6;
  padding: 8px 24px;
  margin-bottom: 20px;
  border-radius: var(--radius-sm);
  display: block;
  line-height: 32px;
  font-size: 16px;
  color: #2c3e50;

  a {
    color: #337ab7;
    cursor: pointer;

    &:hover {
      color: rgb(32, 160, 255);
    }
  }
}
```

**使用示例:**

```vue
<template>
  <aside>
    提示: 这是一个侧边提示框,用于显示重要信息或链接。
    <a href="#" @click.prevent="showHelp">查看帮助</a>
  </aside>
</template>
```

### 子导航栏样式

```scss
.sub-navbar {
  height: 50px;
  line-height: 50px;
  position: relative;
  width: 100%;
  text-align: right;
  padding-right: 20px;
  transition: var(--duration-slow) ease position;
  background: linear-gradient(
    90deg,
    rgba(32, 182, 249, 1) 0%,
    rgba(33, 120, 241, 1) 100%
  );

  .subtitle {
    font-size: 20px;
    color: #fff;
  }

  &.draft {
    background: #d0d0d0;
  }

  &.deleted {
    background: #d0d0d0;
  }
}
```

**状态说明:**
- 默认: 蓝色渐变背景
- `.draft`: 草稿状态,灰色背景
- `.deleted`: 已删除状态,灰色背景

**使用示例:**

```vue
<template>
  <div :class="['sub-navbar', status]">
    <span class="subtitle">{{ title }}</span>
    <div class="actions">
      <el-button size="small">保存</el-button>
      <el-button size="small" type="primary">发布</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  title: string
  isDraft?: boolean
  isDeleted?: boolean
}>()

const status = computed(() => {
  if (props.isDeleted) return 'deleted'
  if (props.isDraft) return 'draft'
  return ''
})
</script>
```

### 链接类型样式

```scss
.link-type,
.link-type:focus {
  color: #337ab7;
  cursor: pointer;
  transition: color var(--duration-normal) ease;

  &:hover {
    color: rgb(32, 160, 255);
  }
}
```

**使用场景:**
- 表格中的操作链接
- 文本中的可点击链接
- 自定义链接样式

**使用示例:**

```vue
<template>
  <el-table :data="tableData">
    <el-table-column label="操作">
      <template #default="{ row }">
        <span class="link-type" @click="handleEdit(row)">编辑</span>
        <span class="link-type" @click="handleDelete(row)">删除</span>
      </template>
    </el-table-column>
  </el-table>
</template>
```

### 筛选容器样式

```scss
.filter-container {
  padding-bottom: 10px;

  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
}
```

**使用示例:**

```vue
<template>
  <div class="filter-container">
    <div class="filter-item">
      <el-input v-model="filters.name" placeholder="姓名" />
    </div>
    <div class="filter-item">
      <el-select v-model="filters.status" placeholder="状态">
        <el-option label="全部" value="" />
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
    </div>
    <div class="filter-item">
      <el-button type="primary" @click="handleFilter">筛选</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
  </div>
</template>
```

### 文本省略工具类

提供三种文本省略样式:

#### 单行省略

```scss
.lines1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**使用示例:**

```vue
<template>
  <div class="lines1" style="width: 200px;">
    这是一段很长的文本内容,超出宽度会显示省略号...
  </div>
</template>
```

**优先使用 UnoCSS:**

```vue
<template>
  <!-- 推荐:使用 UnoCSS 原子类 -->
  <div class="text-ellipsis w-200px">
    这是一段很长的文本内容
  </div>

  <!-- 或使用全局类 -->
  <div class="lines1" style="width: 200px;">
    这是一段很长的文本内容
  </div>
</template>
```

#### 两行省略

```scss
.lines2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

**使用示例:**

```vue
<template>
  <div class="lines2" style="width: 300px;">
    这是一段较长的文本内容,会在第二行末尾显示省略号。
    如果内容超过两行,多余的内容将被隐藏。
  </div>
</template>
```

#### 三行省略

```scss
.lines3 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
```

**使用示例:**

```vue
<template>
  <div class="lines3" style="width: 400px;">
    这是一段很长的文本内容,会在第三行末尾显示省略号。
    适用于文章摘要、商品描述等需要限制显示行数的场景。
    超出三行的内容将被隐藏,用户可以通过点击"展开"按钮查看完整内容。
  </div>
</template>
```

**对比表:**

| 类名 | 显示行数 | 适用场景 | 浏览器支持 |
|------|---------|----------|-----------|
| `.lines1` | 1行 | 标题、标签、表格单元格 | 所有浏览器 |
| `.lines2` | 2行 | 短摘要、列表项描述 | Webkit内核 |
| `.lines3` | 3行 | 文章摘要、商品描述 | Webkit内核 |

**注意事项:**
- 多行省略依赖 `-webkit-line-clamp`,仅支持 Webkit 内核浏览器
- 非 Webkit 浏览器会显示完整文本
- 建议配合固定宽度使用

## 主题集成

全局样式与主题系统无缝集成,支持亮色/暗色模式动态切换。

### 主题变量引用

所有颜色相关样式都使用 CSS 变量:

```scss
.component {
  color: var(--text-color-primary);       // 主要文本色
  background: var(--bg-level-1);          // 一级背景色
  border: 1px solid var(--border-color);  // 边框色
}
```

### 暗色模式适配

暗色模式下,主题变量会自动切换:

```scss
/* 亮色模式 */
:root {
  --text-color-primary: #303133;
  --bg-level-1: #ffffff;
  --border-color: #dcdfe6;
}

/* 暗色模式 */
.dark {
  --text-color-primary: #e5eaf3;
  --bg-level-1: #1d1e1f;
  --border-color: #414243;
}
```

**组件自动适配:**

```vue
<template>
  <div class="auto-theme-card">
    <h3>卡片标题</h3>
    <p>卡片内容会根据主题自动调整颜色</p>
  </div>
</template>

<style lang="scss" scoped>
.auto-theme-card {
  background: var(--bg-level-1);
  color: var(--text-color-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;

  h3 {
    color: var(--text-color-primary);
    margin-bottom: 12px;
  }

  p {
    color: var(--text-color-regular);
    line-height: 1.6;
  }
}
</style>
```

## 响应式设计

### 断点使用

使用预定义的断点变量实现响应式设计:

```scss
.responsive-container {
  padding: 16px;

  @media (min-width: $sm) {
    padding: 20px;
  }

  @media (min-width: $md) {
    padding: 24px;
  }

  @media (min-width: $lg) {
    padding: 32px;
  }
}
```

### 移动优先

采用移动优先策略:

```scss
/* 基础样式(移动端) */
.card {
  width: 100%;
  padding: 12px;
  font-size: 14px;
}

/* 平板及以上 */
@media (min-width: $sm) {
  .card {
    width: 750px;
    padding: 16px;
  }
}

/* 桌面及以上 */
@media (min-width: $md) {
  .card {
    width: 970px;
    padding: 20px;
    font-size: 16px;
  }
}

/* 大屏及以上 */
@media (min-width: $lg) {
  .card {
    width: 1170px;
    padding: 24px;
  }
}
```

### 设备适配

针对特定设备的适配:

```scss
/* iPad 竖屏 */
@media (max-width: $device-ipad-vertical) {
  .sidebar {
    display: none;
  }
}

/* 手机 */
@media (max-width: $device-phone) {
  .filter-container {
    .filter-item {
      display: block;
      width: 100%;
      margin-bottom: 8px;
    }
  }
}
```

## 性能优化

### 使用 CSS 变量

CSS 变量支持运行时修改,无需重新编译:

```typescript
// 动态修改主题
const changeThemeRadius = (radius: number) => {
  document.documentElement.style.setProperty('--custom-radius', `${radius}px`)
}

// 动态修改动画时长
const changeAnimationSpeed = (fast: boolean) => {
  const duration = fast ? '0.15s' : '0.3s'
  document.documentElement.style.setProperty('--duration-normal', duration)
}
```

### 避免深度嵌套

```scss
/* ❌ 不推荐 - 深度嵌套 */
.container {
  .header {
    .title {
      .text {
        color: red;
      }
    }
  }
}

/* ✅ 推荐 - 扁平化 */
.container-header-title-text {
  color: red;
}

/* ✅ 或使用 BEM */
.container__header-title-text {
  color: red;
}
```

### 使用高效选择器

```scss
/* ❌ 避免通配符 */
* {
  margin: 0;
}

/* ✅ 使用类选择器 */
.reset-margin {
  margin: 0;
}

/* ❌ 避免属性选择器 */
[class^="icon-"] {
  font-size: 16px;
}

/* ✅ 使用类选择器 */
.icon {
  font-size: 16px;
}
```

### 合并相同属性

```scss
/* ❌ 不推荐 - 重复定义 */
.button-primary {
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.button-secondary {
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

/* ✅ 推荐 - 使用占位符选择器 */
%button-base {
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.button-primary {
  @extend %button-base;
  background: var(--primary-color);
}

.button-secondary {
  @extend %button-base;
  background: var(--secondary-color);
}
```

## 最佳实践

### 使用语义化变量

```scss
/* ❌ 不推荐 - 使用具体值 */
.card {
  color: #303133;
  background: #ffffff;
  border: 1px solid #dcdfe6;
}

/* ✅ 推荐 - 使用语义化变量 */
.card {
  color: var(--text-color-primary);
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
}
```

### 统一动画时长

```scss
/* ❌ 不推荐 - 硬编码时长 */
.button {
  transition: all 0.3s;
}

.modal {
  transition: opacity 0.25s;
}

/* ✅ 推荐 - 使用统一变量 */
.button {
  transition: all var(--duration-normal);
}

.modal {
  transition: opacity var(--duration-normal);
}
```

### 统一 Z-index

```scss
/* ❌ 不推荐 - 随意使用数值 */
.header {
  z-index: 100;
}

.modal {
  z-index: 9999;
}

/* ✅ 推荐 - 使用统一变量 */
.header {
  z-index: var(--z-header);
}

.modal {
  z-index: var(--z-modal);
}
```

### 使用混合宏

```scss
/* ❌ 不推荐 - 重复代码 */
.card1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card2 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ✅ 推荐 - 使用工具类 */
.card1 {
  @extend .lines1;
}

/* ✅ 或使用 UnoCSS */
<div class="text-ellipsis">内容</div>
```

### 组件作用域变量

```scss
/* 组件内定义局部变量 */
.custom-card {
  --card-padding: 20px;
  --card-radius: 8px;

  padding: var(--card-padding);
  border-radius: var(--card-radius);

  &.compact {
    --card-padding: 12px;
    --card-radius: 4px;
  }

  &.large {
    --card-padding: 32px;
    --card-radius: 12px;
  }
}
```

### 移动端优化

```scss
/* 移动端优化 */
@media (max-width: $device-phone) {
  .components-container {
    margin: 16px;
  }

  .panel,
  .search {
    padding: 8px;
    margin-bottom: 8px;
  }

  .filter-container {
    .filter-item {
      display: block;
      width: 100%;
    }
  }

  .sub-navbar {
    padding-right: 12px;

    .subtitle {
      font-size: 16px;
    }
  }

  aside {
    padding: 8px 16px;
    font-size: 14px;
  }
}
```

## 常见问题

### 1. 如何自定义全局圆角?

**问题描述:**
想要调整整个应用的圆角风格,使其更圆润或更方正。

**解决方案:**

通过修改 `--custom-radius` 变量实现全局圆角调整:

```typescript
// 在主题配置中
const setRoundedTheme = () => {
  // 更圆润的主题
  document.documentElement.style.setProperty('--custom-radius', '16px')
}

const setSharpTheme = () => {
  // 更方正的主题
  document.documentElement.style.setProperty('--custom-radius', '6px')
}

// 默认主题
const setDefaultTheme = () => {
  document.documentElement.style.setProperty('--custom-radius', '12px')
}
```

或在 CSS 中直接修改:

```scss
:root {
  --custom-radius: 16px;  // 调整此值
}
```

### 2. 为什么文本省略不生效?

**问题原因:**
- 未设置容器宽度
- 使用了错误的 display 属性
- 多行省略浏览器不支持

**解决方案:**

```vue
<template>
  <!-- ❌ 错误 - 未设置宽度 -->
  <div class="lines1">
    很长的文本内容
  </div>

  <!-- ✅ 正确 - 设置固定宽度 -->
  <div class="lines1" style="width: 200px;">
    很长的文本内容
  </div>

  <!-- ✅ 正确 - 使用父容器宽度 -->
  <div style="width: 300px;">
    <div class="lines1">
      很长的文本内容
    </div>
  </div>

  <!-- ❌ 错误 - display: inline -->
  <span class="lines1">内容</span>

  <!-- ✅ 正确 - display: block 或 inline-block -->
  <div class="lines1">内容</div>
</template>
```

### 3. 如何统一修改所有组件高度?

**问题描述:**
想要调整所有 Element Plus 组件(按钮、输入框等)的高度。

**解决方案:**

修改 `--el-component-custom-height` 变量:

```scss
:root {
  --el-component-custom-height: 36px;  // 调整高度
  --el-component-size: var(--el-component-custom-height);
}

// 或针对不同断点
@media (max-width: $device-phone) {
  :root {
    --el-component-custom-height: 40px;  // 移动端更大的高度
  }
}
```

通过 JavaScript 动态修改:

```typescript
const setComponentSize = (size: 'small' | 'default' | 'large') => {
  const heights = {
    small: '28px',
    default: '32px',
    large: '40px'
  }
  document.documentElement.style.setProperty(
    '--el-component-custom-height',
    heights[size]
  )
}
```

### 4. 暗色模式下颜色对比度不足?

**问题原因:**
使用了固定颜色值,未使用 CSS 变量。

**解决方案:**

```scss
/* ❌ 错误 - 固定颜色 */
.text {
  color: #333333;  // 暗色模式下看不清
}

/* ✅ 正确 - 使用 CSS 变量 */
.text {
  color: var(--text-color-primary);  // 自动适配主题
}

/* ✅ 或针对暗色模式特殊处理 */
.text {
  color: var(--text-color-primary);

  .dark & {
    color: var(--text-color-primary);  // 暗色模式下更亮
  }
}
```

### 5. 如何实现平滑的主题切换动画?

**解决方案:**

项目已内置主题切换动画,使用 View Transition API:

```typescript
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

// 在主题切换按钮点击事件中
const handleThemeToggle = (event: MouseEvent) => {
  const isDark = document.documentElement.classList.contains('dark')
  toggleThemeWithAnimation(event, isDark)
}
```

主题切换会从点击位置以圆形扩散动画过渡。

### 6. 响应式断点如何选择?

**选择指南:**

| 场景 | 推荐断点 | 说明 |
|------|---------|------|
| 移动端适配 | `$device-phone` (500px) | 针对手机 |
| 平板适配 | `$sm` (768px) | iPad等平板 |
| 桌面适配 | `$md` (992px) | 标准桌面 |
| 大屏优化 | `$lg` (1200px) | 宽屏显示器 |
| 超大屏 | `$xl` (1920px) | 4K显示器 |

**使用示例:**

```scss
.layout {
  padding: 16px;

  // 平板及以上
  @media (min-width: $sm) {
    padding: 20px;
  }

  // 桌面及以上
  @media (min-width: $md) {
    padding: 24px;
    display: grid;
    grid-template-columns: 240px 1fr;
  }

  // 大屏及以上
  @media (min-width: $lg) {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

## 总结

RuoYi-Plus-UniApp 的全局样式系统提供了完整的样式基础设施:

### 核心优势

1. **统一的变量系统** - SCSS 变量和 CSS 变量结合,兼顾编译时和运行时
2. **完善的重置样式** - 消除浏览器差异,建立统一基线
3. **系统化排版** - 清晰的文本层次和样式规范
4. **实用工具类** - 覆盖常见场景的即用型样式类
5. **主题集成** - 与主题系统无缝集成,支持动态切换
6. **响应式友好** - 统一的断点系统,移动优先策略

### 开发建议

1. **优先使用 CSS 变量** - 支持主题切换和动态修改
2. **遵循命名规范** - 使用语义化的变量和类名
3. **移动优先** - 基础样式适配移动端,逐步增强
4. **避免硬编码** - 使用变量代替具体数值
5. **保持一致性** - 使用统一的间距、圆角、动画时长
6. **性能优化** - 避免深度嵌套,使用高效选择器

通过合理使用全局样式系统,可以快速构建视觉一致、主题灵活、性能优秀的用户界面。
