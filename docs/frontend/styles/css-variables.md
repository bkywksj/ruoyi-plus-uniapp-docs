# CSS 变量系统

## 介绍

RuoYi-Plus-UI 采用 CSS 自定义属性（CSS Variables）构建完整的设计系统，实现主题切换、样式统一和动态样式调整。CSS 变量系统是整个样式架构的核心，为亮色/暗色主题切换、组件样式统一、响应式设计提供了坚实的基础。

**核心特性：**

- **背景色层级系统** - 提供 5 层背景色层级，从最浅到最深，适用于不同的视觉层次
- **语义化变量命名** - 变量名清晰表达用途，如 `--app-bg`、`--menu-text`、`--header-border` 等
- **主题无感切换** - 通过 CSS 变量实现亮色/暗色主题的无缝切换
- **Element Plus 集成** - 与 Element Plus 的 CSS 变量体系完美融合
- **动态圆角系统** - 基于基础圆角变量动态计算各组件圆角值
- **Z-index 层级管理** - 统一管理模态框、侧边栏、遮罩层等的层级关系

## 变量定义文件结构

CSS 变量分布在多个 SCSS 文件中，形成完整的设计系统：

```text
src/assets/styles/
├── abstracts/
│   └── _variables.scss      # 全局基础变量定义
├── themes/
│   ├── _light.scss          # 亮色主题变量
│   └── _dark.scss           # 暗色主题变量
└── main.scss                # 主入口文件
```

## 基础变量定义

基础变量定义在 `_variables.scss` 文件中，包含 SCSS 变量和 CSS 自定义属性两部分。

### SCSS 基础变量

SCSS 变量用于编译时计算，主要包括颜色、布局尺寸和断点：

```scss
/* 基础颜色变量 */
$blue: #324157;
$light-blue: #3a71a8;
$red: #c03639;
$pink: #e65d6e;
$green: #30b08f;
$tiffany: #4ab7bd;
$yellow: #fec171;
$panGreen: #30b08f;

/* Element UI 主题色变量 */
$el-color-primary: #409eff;
$el-color-success: #67c23a;
$el-color-warning: #e6a23c;
$el-color-danger: #f56c6c;
$el-color-info: #909399;

/* 布局尺寸变量 */
$base-sidebar-width: 240px;

/* 响应式断点变量 */
$sm: 768px;
$md: 992px;
$lg: 1200px;
$xl: 1920px;

/* 设备断点变量 */
$device-notebook: 1600px;
$device-ipad-pro: 1180px;
$device-ipad: 800px;
$device-ipad-vertical: 900px;
$device-phone: 500px;

/* 断点映射 */
$breakpoints: (
  'sm': $sm,
  'md': $md,
  'lg': $lg,
  'xl': $xl
) !default;
```

**使用说明：**

- SCSS 变量以 `$` 开头，在编译时被替换为实际值
- 断点变量用于响应式设计，配合 `@media` 查询使用
- 设备断点针对特定设备尺寸进行精细化适配

### CSS 自定义属性

CSS 自定义属性定义在 `:root` 选择器中，运行时可动态修改：

```scss
:root {
  // 动画时长统一
  --duration-normal: 0.3s;
  --duration-slow: 0.6s;

  // Z-index层级统一
  --z-sidebar: 1001;
  --z-header: 9;
  --z-mask: 999;
  --z-modal: 1050;

  // 侧边栏尺寸统一
  --sidebar-collapsed-width: 54px;

  // 边框圆角统一
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-round: 20px;

  // 主色系
  --main-color: var(--el-color-primary);

  // 组件统一高度系统
  --el-component-custom-height: 32px !important;
  --el-component-size: var(--el-component-custom-height) !important;

  // 动态圆角系统
  --custom-radius: 12px;
  --el-border-radius-base: calc(var(--custom-radius) / 3 + 2px) !important;
  --el-border-radius-small: calc(var(--custom-radius) / 3 + 4px) !important;
  --el-messagebox-border-radius: calc(var(--custom-radius) / 3 + 4px) !important;
  --el-popover-border-radius: calc(var(--custom-radius) / 3 + 4px) !important;

  // 按钮样式
  --el-font-weight-primary: 400 !important;

  /* Element UI 菜单颜色映射 */
  --custom-active-bg-color: rgba(64, 158, 255, 0.1);
  --cutsom-active-text-color: rgba(66, 161, 255, 1);
  --el-menu-active-bg-color: rgba(64, 158, 255, 0.1);
  --el-menu-active-text-color: rgba(66, 161, 255, 1);
}
```

## 动画时长变量

统一管理动画时长，确保整个应用的动画节奏一致：

| 变量名 | 默认值 | 用途 |
|--------|--------|------|
| `--duration-normal` | `0.3s` | 常规过渡动画（悬停、展开等） |
| `--duration-slow` | `0.6s` | 较慢动画（主题切换、页面过渡） |

### 使用示例

```scss
.sidebar-container {
  transition: width var(--duration-normal);
}

.theme-transition {
  transition: background-color var(--duration-slow);
}
```

```vue
<template>
  <div class="animated-element" :style="{
    transition: `all var(--duration-normal) ease`
  }">
    动画内容
  </div>
</template>
```

## Z-index 层级变量

统一管理组件层级，避免 z-index 冲突：

| 变量名 | 默认值 | 用途 |
|--------|--------|------|
| `--z-header` | `9` | 顶部导航栏 |
| `--z-mask` | `999` | 遮罩层 |
| `--z-sidebar` | `1001` | 侧边栏 |
| `--z-modal` | `1050` | 模态框、对话框 |

### 层级设计原则

```text
页面内容        z-index: auto (0)
    ↓
固定头部        z-index: var(--z-header)    = 9
    ↓
遮罩层          z-index: var(--z-mask)      = 999
    ↓
侧边栏          z-index: var(--z-sidebar)   = 1001
    ↓
模态框          z-index: var(--z-modal)     = 1050
```

### 使用示例

```scss
.sidebar-container {
  position: fixed;
  z-index: var(--z-sidebar);
}

.modal-overlay {
  position: fixed;
  z-index: var(--z-modal);
}
```

## 圆角变量系统

### 基础圆角变量

| 变量名 | 默认值 | 用途 |
|--------|--------|------|
| `--radius-sm` | `4px` | 小型组件（标签、小按钮） |
| `--radius-md` | `8px` | 中型组件（卡片、输入框） |
| `--radius-lg` | `12px` | 大型组件（模态框、大卡片） |
| `--radius-round` | `20px` | 圆形/胶囊形（徽章、圆按钮） |

### 动态圆角计算

通过 `--custom-radius` 基础值动态计算其他圆角：

```scss
:root {
  --custom-radius: 12px; // 基础圆角值

  // 基于基础值计算
  --el-border-radius-base: calc(var(--custom-radius) / 3 + 2px);  // = 6px
  --el-border-radius-small: calc(var(--custom-radius) / 3 + 4px); // = 8px
}
```

### 使用示例

```scss
.card {
  border-radius: var(--radius-md);
}

.tag {
  border-radius: var(--radius-sm);
}

.avatar {
  border-radius: var(--radius-round);
}

// 对话框使用动态计算的圆角
.el-dialog {
  border-radius: calc(var(--custom-radius) / 1.5 + 2px) !important;
}
```

## 背景色层级系统

背景色层级系统是主题设计的核心，提供 5 个层级的背景色，从浅到深逐级加深。

### 亮色主题背景色

```scss
:root {
  --bg-base: #fafbfc;      /* 最浅层：应用主背景 */
  --bg-level-1: #ffffff;   /* 一级：卡片、侧边栏基础背景 */
  --bg-level-2: #f8f9fa;   /* 二级：轻微悬停、子区域 */
  --bg-level-3: #f5f7fa;   /* 三级：明显悬停、表格行悬停 */
  --bg-level-4: #e9ecef;   /* 四级：选中、激活状态 */
}
```

### 暗色主题背景色

```scss
html.dark {
  --bg-base: #111113;      /* 最深层：应用主背景 */
  --bg-level-1: #161618;   /* 一级：卡片、侧边栏基础背景 */
  --bg-level-2: #1f1f23;   /* 二级：轻微悬停、子区域 */
  --bg-level-3: #262727;   /* 三级：明显悬停、表格行悬停 */
  --bg-level-4: #2d2d30;   /* 四级：选中、激活状态 */
}
```

### 层级使用指南

| 层级 | 变量名 | 亮色值 | 暗色值 | 典型用途 |
|------|--------|--------|--------|----------|
| 基础层 | `--bg-base` | `#fafbfc` | `#111113` | 应用主背景 |
| 一级 | `--bg-level-1` | `#ffffff` | `#161618` | 卡片、侧边栏、弹窗 |
| 二级 | `--bg-level-2` | `#f8f9fa` | `#1f1f23` | 轻微悬停、子区域 |
| 三级 | `--bg-level-3` | `#f5f7fa` | `#262727` | 明显悬停、表格行悬停 |
| 四级 | `--bg-level-4` | `#e9ecef` | `#2d2d30` | 选中、激活状态 |

### 使用示例

```scss
// 应用主背景
.app-wrapper {
  background-color: var(--app-bg);  // 等同于 var(--bg-base)
}

// 卡片背景
.card {
  background-color: var(--bg-level-1);

  &:hover {
    background-color: var(--bg-level-2);
  }
}

// 下拉菜单项
.dropdown-item {
  &:hover {
    background-color: var(--bg-level-2);
  }

  &.is-selected {
    background-color: var(--bg-level-3);
  }
}

// 表格行悬停
.el-table__body .el-table__row:hover > td {
  background-color: var(--bg-level-3) !important;
}
```

## 应用级变量

应用级变量定义全局的文字、背景、边框等样式：

### 亮色主题

```scss
:root {
  /* 应用整体背景色 */
  --app-bg: var(--bg-base);
  /* 应用主要文字颜色 */
  --app-text: #303133;
  /* 应用边框颜色 */
  --app-border: #dbdfe9;
}
```

### 暗色主题

```scss
html.dark {
  --app-bg: var(--bg-base);
  --app-text: #f1f5f9;
  --app-border: #363843;
}
```

### 使用示例

```scss
body {
  background-color: var(--app-bg);
  color: var(--app-text);
}

.divider {
  border-color: var(--app-border);
}
```

## 菜单变量

菜单变量控制侧边栏菜单的颜色和交互状态：

### 亮色主题菜单变量

```scss
:root {
  /* 侧边栏菜单背景色 */
  --menu-bg: #161618;
  /* 菜单普通文字颜色 */
  --menu-text: #bfcbd9;
  /* 菜单激活状态文字颜色 */
  --menu-text-active: #f4f4f5;

  /* 基础悬停背景色 */
  --menu-hover: #475569;
  /* 基础悬停文字色 */
  --menu-hover-text: #f4f4f5;
  /* 菜单悬停背景色 */
  --menu-hover-color: var(--menu-hover);
  /* 菜单悬停文字色 */
  --menu-hover-text-color: var(--menu-hover-text);
  /* 菜单激活背景色 */
  --menu-active-bg: var(--el-menu-active-bg-color);
  /* 菜单激活文字色 */
  --menu-active-text: var(--el-menu-active-text-color);

  /* 子菜单背景色 */
  --submenu-bg: #1f2d3d;
  /* 子菜单激活文字色 */
  --submenu-text-active: #f4f4f5;
  /* 子菜单悬停背景色 */
  --submenu-hover: var(--menu-hover-color);
  /* 子菜单标题悬停背景色 */
  --submenu-title-hover: var(--menu-hover-color);
}
```

### 暗色主题菜单变量

```scss
html.dark {
  --menu-bg: var(--bg-level-1);
  --menu-text: #cbd5e1;
  --menu-text-active: #f4f4f5;

  --menu-hover: var(--bg-level-2);
  --menu-hover-text: #f4f4f5;
  --menu-hover-color: var(--menu-hover);
  --menu-hover-text-color: var(--menu-hover-text);
  --menu-active-bg: var(--el-menu-active-bg-color);
  --menu-active-text: var(--el-menu-active-text-color);

  --submenu-bg: var(--bg-level-2);
  --submenu-text-active: #f4f4f5;
  --submenu-hover: var(--menu-hover-color);
  --submenu-title-hover: var(--menu-hover-color);
}
```

### 使用示例

```scss
.sidebar-container {
  background-color: var(--menu-bg);

  .el-menu-item {
    color: var(--menu-text);

    &:hover {
      background-color: var(--menu-hover-color);
      color: var(--menu-hover-text-color);
    }

    &.is-active {
      background-color: var(--menu-active-bg);
      color: var(--menu-active-text);
    }
  }

  .el-sub-menu {
    background-color: var(--submenu-bg);

    &:hover {
      background-color: var(--submenu-hover);
    }
  }
}
```

## 头部变量

头部变量控制顶部导航栏的样式：

### 变量定义

```scss
:root {
  --header-bg: var(--app-bg);
  --header-text: #303133;
  --header-border: #e4e7ed;
}

html.dark {
  --header-bg: var(--app-bg);
  --header-text: #f1f5f9;
  --header-border: #334155;
}
```

### 使用示例

```scss
.navbar {
  background-color: var(--header-bg);
  color: var(--header-text);
  border-bottom: 1px solid var(--header-border);
}
```

## 表格变量

表格变量控制表格组件的样式：

### 变量定义

```scss
:root {
  --table-header-bg: #f8f8f9;
  --table-header-text: #6b7785;
}

html.dark {
  --table-header-bg: var(--el-bg-color);
  --table-header-text: var(--el-text-color);
}
```

### 使用示例

```scss
.el-table {
  .el-table__header-wrapper th {
    background-color: var(--table-header-bg) !important;
    color: var(--table-header-text);
  }
}
```

## 标签页变量

标签页变量控制 TagsView 组件的样式：

### 变量定义

```scss
:root {
  --tags-view-active-bg: var(--el-color-primary);
  --tags-view-active-border: var(--el-color-primary);
}

html.dark {
  --tags-view-active-bg: var(--el-color-primary-dark-6);
  --tags-view-active-border: var(--el-color-primary-light-2);
}
```

### 使用示例

```scss
.tags-view-item {
  &.active {
    background-color: var(--tags-view-active-bg);
    border-color: var(--tags-view-active-border);
  }
}
```

## Element Plus 变量映射

项目对 Element Plus 的 CSS 变量进行了扩展和覆盖：

### 主色变量

```scss
:root {
  --el-color-primary: #409eff;
  --el-color-primary-light-3: #79bbff;
  --el-color-primary-light-2: #409eff;
}

html.dark {
  --el-color-primary: #3b82f6;
  --el-color-primary-light-3: #60a5fa;
  --el-color-primary-light-2: #3b82f6;
}
```

### 背景和边框变量

```scss
:root {
  --el-bg-color-overlay: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
  --el-border-color-light: #e4e7ed;
}

html.dark {
  --el-bg-color-overlay: var(--bg-level-1);
  --el-bg-color: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
  --el-border-color-light: #475569;
}
```

## JavaScript 中使用 CSS 变量

### 获取 CSS 变量值

使用 `getCssVar` 工具函数获取 CSS 变量值：

```typescript
import { getCssVar } from '@/utils/colors'

// 获取主色
const primaryColor = getCssVar('--el-color-primary')
console.log(primaryColor) // '#409eff'

// 获取背景色
const bgColor = getCssVar('--app-bg')
```

### 动态设置 CSS 变量

```typescript
// 设置单个变量
document.documentElement.style.setProperty('--el-color-primary', '#1890ff')

// 批量设置变量
const setThemeColors = (color: string) => {
  const root = document.documentElement
  root.style.setProperty('--el-color-primary', color)
  root.style.setProperty('--main-color', color)
}
```

### 在 Vue 组件中使用

```vue
<template>
  <div :style="customStyles">
    动态样式内容
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  color?: string
}>()

const customStyles = computed(() => ({
  '--custom-color': props.color || 'var(--el-color-primary)',
  backgroundColor: 'var(--custom-color)'
}))
</script>
```

## SCSS 变量导出到 JavaScript

通过 `exports.module.scss` 文件将 SCSS 变量导出给 JavaScript 使用：

```scss
// src/assets/styles/abstracts/exports.module.scss
:export {
  // 菜单颜色
  menuColor: $blue;
  menuLightColor: $light-blue;
  menuHover: #263445;

  // 子菜单颜色
  subMenuBackground: #1f2d3d;
  subMenuHover: #001528;

  // 侧边栏
  sideBarWidth: $base-sidebar-width;

  // Logo标题
  logoTitleColor: #ffffff;
  logoLightTitleColor: #001529;

  // 主题色
  primaryColor: $el-color-primary;
  successColor: $el-color-success;
  dangerColor: $el-color-danger;
}
```

### JavaScript 中导入使用

```typescript
import variables from '@/assets/styles/abstracts/exports.module.scss'

console.log(variables.menuColor)     // '#324157'
console.log(variables.sideBarWidth)  // '240px'
console.log(variables.primaryColor)  // '#409eff'
```

## 主题切换实现

### 切换机制

主题切换通过给 `<html>` 元素添加/移除 `dark` 类实现：

```typescript
// 切换到暗色主题
document.documentElement.classList.add('dark')

// 切换到亮色主题
document.documentElement.classList.remove('dark')

// 切换主题
document.documentElement.classList.toggle('dark')
```

### CSS 变量切换

```scss
// 亮色主题变量（默认）
:root {
  --app-bg: #fafbfc;
  --app-text: #303133;
}

// 暗色主题变量（通过 html.dark 选择器覆盖）
html.dark {
  --app-bg: #111113;
  --app-text: #f1f5f9;
}
```

### 使用 useLayout 管理主题

```typescript
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 获取当前是否为暗色主题
const isDark = computed(() => layout.isDark.value)

// 切换主题
const toggleTheme = () => {
  layout.toggleDark()
}
```

## 最佳实践

### 1. 优先使用语义化变量

```scss
// ✅ 推荐：使用语义化变量
.card {
  background-color: var(--bg-level-1);
  border-color: var(--app-border);
}

// ❌ 不推荐：直接使用颜色值
.card {
  background-color: #ffffff;
  border-color: #dbdfe9;
}
```

### 2. 利用层级系统表达视觉层次

```scss
// ✅ 推荐：使用层级系统
.dropdown-menu {
  background-color: var(--bg-level-1);

  .dropdown-item {
    &:hover {
      background-color: var(--bg-level-2);
    }

    &.is-active {
      background-color: var(--bg-level-3);
    }
  }
}
```

### 3. 使用变量引用而非硬编码

```scss
// ✅ 推荐：变量引用
:root {
  --menu-hover-color: var(--menu-hover);
}

// ❌ 不推荐：重复定义相同值
:root {
  --menu-hover: #475569;
  --menu-hover-color: #475569;
}
```

### 4. 为暗色主题提供适当的覆盖

```scss
// 默认（亮色）样式
.component {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

// 暗色主题覆盖
html.dark .component {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
```

### 5. 使用 calc() 进行动态计算

```scss
// ✅ 推荐：基于基础值计算
:root {
  --custom-radius: 12px;
  --dialog-radius: calc(var(--custom-radius) / 1.5 + 2px);
}

// 修改基础值即可影响所有相关组件
```

## 常见问题

### 1. CSS 变量不生效

**问题原因：**
- 变量名拼写错误
- 变量未在 `:root` 或相应选择器中定义
- 使用了 `!important` 但优先级不够

**解决方案：**

```scss
// 确保变量定义正确
:root {
  --my-color: #409eff;
}

// 使用时检查变量名
.element {
  color: var(--my-color);
}

// 如果需要覆盖，提高选择器优先级
html .element {
  color: var(--my-color) !important;
}
```

### 2. 主题切换不立即生效

**问题原因：**
- 组件使用了固定颜色而非 CSS 变量
- 缓存了旧的样式计算结果

**解决方案：**

```scss
// 确保使用 CSS 变量
.component {
  // ❌ 错误
  background-color: #ffffff;

  // ✅ 正确
  background-color: var(--bg-level-1);
}
```

### 3. JavaScript 获取变量值为空

**问题原因：**
- DOM 未完全加载
- 变量名格式错误

**解决方案：**

```typescript
import { onMounted } from 'vue'

onMounted(() => {
  // 确保 DOM 加载完成后获取
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--el-color-primary')
    .trim()
  console.log(color)
})
```

### 4. SCSS 变量与 CSS 变量混淆

**问题原因：**
- SCSS 变量（`$var`）在编译时替换
- CSS 变量（`--var`）在运行时解析

**解决方案：**

```scss
// SCSS 变量：用于编译时计算
$sidebar-width: 240px;

// CSS 变量：用于运行时动态修改
:root {
  --sidebar-width: #{$sidebar-width};
}

// 混合使用
.sidebar {
  width: var(--sidebar-width);  // 运行时可修改
  max-width: $sidebar-width;    // 编译时固定
}
```

### 5. Element Plus 变量覆盖无效

**问题原因：**
- Element Plus 的变量优先级较高
- 覆盖时机不正确

**解决方案：**

```scss
// 使用 !important 强制覆盖
:root {
  --el-color-primary: #1890ff !important;
}

// 或者使用更高优先级的选择器
html:root {
  --el-color-primary: #1890ff;
}
```

## 变量速查表

### 动画变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--duration-normal` | `0.3s` | 常规动画时长 |
| `--duration-slow` | `0.6s` | 慢速动画时长 |

### 层级变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--z-header` | `9` | 头部层级 |
| `--z-mask` | `999` | 遮罩层级 |
| `--z-sidebar` | `1001` | 侧边栏层级 |
| `--z-modal` | `1050` | 模态框层级 |

### 圆角变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--radius-sm` | `4px` | 小圆角 |
| `--radius-md` | `8px` | 中圆角 |
| `--radius-lg` | `12px` | 大圆角 |
| `--radius-round` | `20px` | 圆形/胶囊 |
| `--custom-radius` | `12px` | 基础圆角值 |

### 背景色变量

| 变量名 | 亮色值 | 暗色值 | 说明 |
|--------|--------|--------|------|
| `--bg-base` | `#fafbfc` | `#111113` | 应用背景 |
| `--bg-level-1` | `#ffffff` | `#161618` | 卡片背景 |
| `--bg-level-2` | `#f8f9fa` | `#1f1f23` | 悬停背景 |
| `--bg-level-3` | `#f5f7fa` | `#262727` | 激活背景 |
| `--bg-level-4` | `#e9ecef` | `#2d2d30` | 选中背景 |

### 应用变量

| 变量名 | 亮色值 | 暗色值 | 说明 |
|--------|--------|--------|------|
| `--app-bg` | `var(--bg-base)` | `var(--bg-base)` | 应用背景 |
| `--app-text` | `#303133` | `#f1f5f9` | 主文字色 |
| `--app-border` | `#dbdfe9` | `#363843` | 边框色 |

### 菜单变量

| 变量名 | 亮色值 | 暗色值 | 说明 |
|--------|--------|--------|------|
| `--menu-bg` | `#161618` | `var(--bg-level-1)` | 菜单背景色 |
| `--menu-text` | `#bfcbd9` | `#cbd5e1` | 菜单文字色 |
| `--menu-text-active` | `#f4f4f5` | `#f4f4f5` | 激活文字色 |
| `--menu-hover` | `#475569` | `var(--bg-level-2)` | 悬停背景色 |
| `--menu-hover-text` | `#f4f4f5` | `#f4f4f5` | 悬停文字色 |
| `--menu-active-bg` | `rgba(64, 158, 255, 0.1)` | `rgba(64, 158, 255, 0.1)` | 激活背景色 |
| `--menu-active-text` | `rgba(66, 161, 255, 1)` | `rgba(66, 161, 255, 1)` | 激活文字色 |
| `--submenu-bg` | `#1f2d3d` | `var(--bg-level-2)` | 子菜单背景 |

### 头部变量

| 变量名 | 亮色值 | 暗色值 | 说明 |
|--------|--------|--------|------|
| `--header-bg` | `var(--app-bg)` | `var(--app-bg)` | 头部背景色 |
| `--header-text` | `#303133` | `#f1f5f9` | 头部文字色 |
| `--header-border` | `#e4e7ed` | `#334155` | 头部边框色 |

### 表格变量

| 变量名 | 亮色值 | 暗色值 | 说明 |
|--------|--------|--------|------|
| `--table-header-bg` | `#f8f8f9` | `var(--el-bg-color)` | 表头背景色 |
| `--table-header-text` | `#6b7785` | `var(--el-text-color)` | 表头文字色 |

### 标签页变量

| 变量名 | 亮色值 | 暗色值 | 说明 |
|--------|--------|--------|------|
| `--tags-view-active-bg` | `var(--el-color-primary)` | `var(--el-color-primary-dark-6)` | 激活标签背景 |
| `--tags-view-active-border` | `var(--el-color-primary)` | `var(--el-color-primary-light-2)` | 激活标签边框 |

### 侧边栏变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--sidebar-collapsed-width` | `54px` | 折叠时侧边栏宽度 |

### 组件尺寸变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--el-component-custom-height` | `32px` | 组件统一高度 |
| `--el-component-size` | `var(--el-component-custom-height)` | 组件尺寸 |
| `--el-font-weight-primary` | `400` | 按钮字重 |
