# Element Plus 组件定制

## 概述

Element Plus 是 RuoYi-Plus-UI 管理端的核心 UI 组件库。为了实现统一的视觉风格和更好的用户体验，项目对 Element Plus 组件进行了深度定制。定制内容涵盖分页器、按钮、对话框、表格、表单等核心组件，实现了现代化的设计语言和一致的交互体验。

**核心定制特性：**

- **现代化设计** - 圆角、阴影、过渡动画等细节优化
- **层级背景色系统** - 使用 `--bg-level-*` 变量实现一致的层级效果
- **响应式适配** - 针对不同设备尺寸的自适应优化
- **暗黑模式支持** - 所有定制样式兼容暗黑主题
- **滚动条美化** - 统一的滚动条样式设计

## 设计系统集成

Element Plus 定制样式通过导入项目的设计系统变量和混合器来保持一致性：

```scss
@use '../abstracts/variables' as *;
@use '../abstracts/mixins' as *;
```

这确保了所有定制样式都使用统一的：
- 断点变量（`$device-phone`、`$device-ipad-pro`）
- CSS 变量（`--bg-level-*`、`--custom-radius`）
- SCSS 混合器（`respond-to`、`card-style`、`button-base`）

## 分页器定制

### 尺寸标准化

分页器采用统一的按钮尺寸，确保视觉一致性：

```scss
.el-pagination--default {
  & {
    --el-pagination-button-width: 32px !important;
    --el-pagination-button-height: var(--el-pagination-button-width) !important;
  }

  // 平板设备尺寸缩小
  @media (max-width: $device-ipad-pro) {
    & {
      --el-pagination-button-width: 28px !important;
    }
  }

  // 选择器高度同步
  .el-select--default .el-select__wrapper {
    min-height: var(--el-pagination-button-width) !important;
  }

  // 跳转输入框高度同步
  .el-pagination__jump .el-input {
    height: var(--el-pagination-button-width) !important;
  }
}
```

### 圆角优化

分页按钮和页码采用统一的圆角设计：

```scss
.el-pager li {
  padding: 0 10px !important;
}

.el-pagination.is-background .btn-next,
.el-pagination.is-background .btn-prev,
.el-pagination.is-background .el-pager li {
  border-radius: 6px;
}
```

### 容器样式

分页容器布局和间距优化：

```scss
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  padding: 10px 20px 0 20px !important;
}

// 移动端隐藏跳转和选择器
@include respond-to('sm') {
  .pagination-container .el-pagination > .el-pagination__jump,
  .pagination-container .el-pagination > .el-pagination__sizes {
    display: none !important;
  }
}
```

## 按钮定制

### 基础样式

按钮组件应用项目的 `button-base` 混合器，确保统一的基础样式：

```scss
.el-button {
  @include button-base;

  // 固定宽度迷你按钮
  &--mini.fixed-width {
    padding: 7px 10px;
    width: 60px;
  }

  // 文本按钮优化
  &.el-button--text {
    background-color: transparent !important;
    padding: 0 !important;

    span {
      margin-left: 0 !important;
    }
  }

  // 水波纹层级处理
  > span {
    position: relative;
    z-index: 10;
  }
}
```

### 单选按钮组

单选按钮组的选中状态颜色：

```scss
.region .el-radio-button__original-radio:checked + .el-radio-button__inner {
  color: var(--main-color);
}
```

## 弹窗和对话框

### 基础对话框样式

对话框采用动态圆角计算和优化的布局：

```scss
.el-dialog {
  border-radius: calc(var(--custom-radius) / 1.5 + 2px) !important;
  overflow: hidden;

  // 头部样式
  .el-dialog__header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0 32px 16px 8px !important;
    box-sizing: border-box !important;
    border-bottom: 1px solid var(--el-border-color) !important;
    margin-right: 0 !important;

    .el-dialog__title {
      font-size: 16px !important;
      margin: 0 !important;
      flex: 1 !important;
    }

    .el-dialog__headerbtn {
      margin-top: -8px !important;
    }
  }

  // 内容区样式
  .el-dialog__body {
    padding: 20px 0 !important;
    position: relative;
  }
}
```

### 边框装饰对话框

带有上下边框的对话框变体：

```scss
.el-dialog.el-dialog-border {
  .el-dialog__body {
    // 上边框和下边框
    &::before,
    &::after {
      content: '';
      position: absolute;
      left: -16px;
      width: calc(100% + 32px);
      height: 1px;
      background-color: var(--el-border-color-light);
    }

    &::before {
      top: 0;
    }

    &::after {
      bottom: 0;
    }
  }
}
```

### 对话框居中布局

确保对话框在遮罩层中居中显示：

```scss
.el-overlay {
  overflow: hidden;

  .el-overlay-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    .el-dialog {
      margin: 0 auto !important;

      // 非全屏状态限制最大高度
      &:not(.is-fullscreen) {
        .el-dialog__body {
          padding: 20px 15px 15px 0 !important;
          max-height: calc(90vh - 111px) !important;
          overflow-y: auto;
          overflow-x: hidden;
        }
      }
    }
  }
}
```

### 弹出框尺寸

Popover 组件最小宽度设置：

```scss
.el-popover {
  min-width: 80px;
}
```

## 消息和通知

### 消息组件

消息组件采用卡片式设计，移除边框，使用阴影提升层次：

```scss
.el-message {
  background-color: var(--el-bg-color) !important;
  border: 0 !important;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;

  p {
    color: #515a6e !important;
    font-size: 13px;
    margin-top: 1px;
  }
}
```

### 通知组件

通知图标尺寸优化：

```scss
.el-notification .el-notification__icon {
  font-size: 22px !important;
}
```

### 消息弹框

确认框等消息弹框的样式优化：

```scss
.el-message-box {
  padding: 25px 20px !important;
  border-radius: calc(var(--custom-radius) / 1.5 + 2px) !important;

  .el-message-box__message {
    word-break: break-word;
  }

  .el-message-box__title {
    font-weight: 500 !important;
  }

  .el-message-box__status {
    font-size: 24px !important;
  }
}
```

### 关闭按钮样式

对话框和消息框的关闭按钮统一样式：

```scss
.el-message-box__headerbtn .el-message-box__close,
.el-dialog__headerbtn .el-dialog__close {
  position: absolute !important;
  top: 14px !important;
  right: 13px !important;
  color: var(--el-text-color-regular) !important;
  width: 30px !important;
  height: 30px !important;
  padding: 7px !important;
  margin: 0 !important;
  border-radius: 5px !important;
  transition: all 0.2s ease !important;
  background-color: transparent !important;
  border: none !important;
  outline: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 18px !important;
  cursor: pointer !important;
  z-index: 1000 !important;

  &:hover {
    background-color: var(--bg-level-2) !important;
    color: var(--el-text-color-primary) !important;
  }
}
```

## 下拉菜单

### 菜单容器样式

下拉菜单采用圆角设计和内边距优化：

```scss
.el-dropdown-menu {
  padding: 6px !important;
  border-radius: 10px !important;
  border: none !important;

  .el-dropdown-menu__item {
    padding: 6px 16px !important;
    border-radius: 6px !important;

    // 悬停状态
    &:hover:not(.is-disabled) {
      color: var(--el-text-color-primary) !important;
      background-color: var(--bg-level-2) !important;
    }

    // 选中状态
    &.is-selected,
    &:focus {
      color: var(--el-text-color-primary) !important;
      background-color: var(--bg-level-3) !important;
    }

    // 选中但未悬停状态
    &.is-selected:not(:hover) {
      background-color: var(--bg-level-3) !important;
      color: var(--el-text-color-primary) !important;
    }
  }
}
```

### 隐藏下拉箭头

移除 Select 和 Dropdown 的三角箭头：

```scss
.el-select__popper,
.el-dropdown__popper {
  margin-top: -6px !important;

  .el-popper__arrow {
    display: none;
  }
}
```

### 焦点样式优化

移除下拉触发器的焦点边框：

```scss
.el-dropdown-selfdefine:focus {
  outline: none !important;
}

.el-tooltip__trigger:focus-visible {
  outline: unset;
}
```

## 选择器

### 普通选择器

Select 组件下拉列表的现代化样式：

```scss
.el-select__popper:not(.el-tree-select__popper) {
  .el-select-dropdown__list {
    padding: 5px !important;

    .el-select-dropdown__item {
      height: 34px !important;
      line-height: 34px !important;
      border-radius: 6px !important;
      transition: background-color 0.2s ease !important;

      // 默认状态
      &:not(.is-selected):not(.is-hovering) {
        background-color: transparent !important;
      }

      // 悬停状态 - 使用层级背景色
      &:not(.is-selected).is-hovering,
      &:not(.is-selected):hover {
        background-color: var(--bg-level-2) !important;
        color: var(--el-text-color-primary) !important;
      }

      // 选中状态
      &.is-selected {
        color: var(--el-color-primary) !important;
        font-weight: 500 !important;
      }
    }
  }
}
```

### 树形选择器

TreeSelect 组件的节点样式：

```scss
.el-tree-select__popper {
  .el-select-dropdown__list {
    padding: 5px !important;

    .el-tree-node {
      .el-tree-node__content {
        height: 36px !important;
        border-radius: 6px !important;

        &:hover {
          background-color: var(--bg-level-2) !important;
        }
      }
    }
  }
}
```

## 表单组件

### 表单布局

行内表单的标签和输入框宽度：

```scss
.el-form {
  &--inline {
    .el-form-item__label {
      width: 68px;
    }

    .el-input,
    .el-select {
      width: 240px;
    }
  }

  .el-form-item__label {
    font-weight: 400 !important;
  }
}
```

### 描述列表

描述列表标签样式：

```scss
.el-descriptions {
  .el-descriptions__label {
    font-weight: 400 !important;
  }
}
```

### 上传组件

文件上传组件隐藏原生输入框：

```scss
.el-upload input[type='file'] {
  display: none !important;
}

.el-upload__input {
  display: none;
}

.upload-container .el-upload {
  width: 100%;

  .el-upload-dragger {
    width: 100%;
    height: 200px;
  }
}
```

### 日期选择器

日期范围选择器布局优化：

```scss
.el-range-editor.el-input__inner {
  display: inline-flex !important;
}

.el-range-separator {
  box-sizing: content-box;
}
```

### 复选框样式

复选框尺寸和选中状态优化：

```scss
.el-checkbox {
  .el-checkbox__inner {
    border-radius: 2px !important;
  }
}

.el-checkbox--default {
  .el-checkbox__inner {
    width: 16px !important;
    height: 16px !important;
    border-radius: 4px !important;
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .is-checked {
    .el-checkbox__inner {
      &::after {
        content: '';
        width: 4px !important;
        height: 8px !important;
        border: 2px solid var(--el-checkbox-checked-icon-color) !important;
        border-left: 0 !important;
        border-top: 0 !important;
        transform: rotate(45deg) !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        margin-top: -5px !important;
        margin-left: -2px !important;
        box-sizing: border-box !important;
      }
    }
  }
}
```

### 单选框样式

单选框尺寸优化：

```scss
.el-radio--default {
  .el-radio__input {
    .el-radio__inner {
      width: 16px;
      height: 16px;

      &::after {
        width: 6px;
        height: 6px;
      }
    }
  }
}
```

### 颜色选择器

颜色选择器预览区圆角：

```scss
.el-color-picker__color {
  border-radius: 2px !important;
}
```

## 表格组件

### 边框移除

移除表格外围边框，实现简洁设计：

```scss
.el-table {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;

  &::before,
  &::after {
    display: none !important;
  }

  .el-table__border-left-patch,
  .el-table__border-right-patch {
    display: none !important;
  }
}
```

### 表头样式

表头背景色和字体优化：

```scss
.el-table {
  .el-table__header-wrapper th,
  .el-table__fixed-header-wrapper th {
    word-break: break-word;
    background-color: var(--table-header-bg) !important;
    color: var(--table-header-text);
    height: 40px !important;
    font-size: 13px;
  }
}
```

### 操作列按钮

表格操作列按钮的紧凑布局和悬停效果：

```scss
.el-table {
  // 操作列单元格 - 支持按钮换行时有间距
  .el-table__fixed-right .cell,
  .el-table__body tr > td:last-child .cell,
  .el-table__body tr > td[class*="is-right"] .cell {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 3px !important;
    align-items: center !important;
    justify-content: center !important;
  }

  // 链接按钮基础样式
  .el-table__fixed-right .el-button.is-link,
  .el-table__body tr > td:last-child .el-button.is-link,
  .el-table__body tr > td[class*="is-right"] .el-button.is-link {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 30px !important;
    height: 30px !important;
    padding: 0 7px !important;
    margin: 0 !important;
    border-radius: 6px !important;
    transition: all 0.2s ease-in-out !important;
    border: none !important;
    vertical-align: middle !important;

    .el-icon {
      margin: 0 !important;
      font-size: 14px !important;
    }
  }
}
```

### 操作按钮颜色变体

不同类型操作按钮的颜色定义：

```scss
.el-table {
  // Primary 蓝色（编辑）
  .el-button.is-link.el-button--primary {
    background-color: rgba(64, 158, 255, 0.1) !important;
    color: #409EFF !important;

    &:hover:not(:disabled):not(.is-disabled) {
      background-color: rgba(64, 158, 255, 0.15) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2) !important;
    }

    &:active:not(:disabled):not(.is-disabled) {
      transform: translateY(0) !important;
    }
  }

  // Danger 红色（删除）
  .el-button.is-link.el-button--danger {
    background-color: rgba(245, 108, 108, 0.1) !important;
    color: #F56C6C !important;

    &:hover:not(:disabled):not(.is-disabled) {
      background-color: rgba(245, 108, 108, 0.15) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 2px 4px rgba(245, 108, 108, 0.2) !important;
    }
  }

  // Success 绿色（重置密码等）
  .el-button.is-link.el-button--success {
    background-color: rgba(103, 194, 58, 0.1) !important;
    color: #67C23A !important;

    &:hover:not(:disabled):not(.is-disabled) {
      background-color: rgba(103, 194, 58, 0.15) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 2px 4px rgba(103, 194, 58, 0.2) !important;
    }
  }

  // Warning 橙色（分配角色等）
  .el-button.is-link.el-button--warning {
    background-color: rgba(230, 162, 60, 0.1) !important;
    color: #E6A23C !important;

    &:hover:not(:disabled):not(.is-disabled) {
      background-color: rgba(230, 162, 60, 0.15) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 2px 4px rgba(230, 162, 60, 0.2) !important;
    }
  }

  // Info 灰色（查看详情等）
  .el-button.is-link.el-button--info {
    background-color: rgba(144, 147, 153, 0.1) !important;
    color: #909399 !important;

    &:hover:not(:disabled):not(.is-disabled) {
      background-color: rgba(144, 147, 153, 0.15) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 2px 4px rgba(144, 147, 153, 0.2) !important;
    }
  }

  // 禁用状态
  .el-button.is-link:disabled,
  .el-button.is-link.is-disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
  }
}
```

### 表格滚动条

表格内滚动条颜色加深，提高可见性：

```scss
.el-table .el-scrollbar {
  --el-scrollbar-bg-color: rgba(0, 0, 0, 0.2) !important;
  --el-scrollbar-hover-bg-color: rgba(0, 0, 0, 0.4) !important;
  --el-scrollbar-opacity: 1 !important;
  --el-scrollbar-hover-opacity: 1 !important;
}

.el-table .el-scrollbar__thumb {
  background-color: rgba(0, 0, 0, 0.2) !important;
  opacity: 1 !important;
}

.el-table .el-scrollbar__thumb:hover {
  background-color: rgba(0, 0, 0, 0.4) !important;
  opacity: 1 !important;
}
```

### 表格辅助类

表格单元格的辅助样式类：

```scss
// 标签右边距
.cell .el-tag {
  margin-right: 0px;
}

// 小内边距
.small-padding .cell {
  padding-left: 5px;
  padding-right: 5px;
}

// 状态列
.status-col .cell {
  padding: 0 10px;
  text-align: center;

  .el-tag {
    margin-right: 0px;
  }
}
```

### 树形数据对齐

解决树形数据插槽内容与展开箭头不在同一行的问题：

```scss
.el-table {
  &__header tr th:first-child .cell {
    display: flex;
    align-items: center;
  }

  &__body tr td:first-child .cell {
    display: flex;
    align-items: center;
  }
}
```

### 溢出提示框

表格 `show-overflow-tooltip` 的提示框样式优化：

```scss
.el-popper.is-dark {
  max-width: 400px !important;
  word-break: break-all !important;
  word-wrap: break-word !important;
  white-space: normal !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

@media screen and (max-width: $device-phone) {
  .el-popper.is-dark {
    max-width: 280px !important;
  }
}
```

## 卡片组件

卡片组件应用项目的 `card-style` 混合器，并进行额外定制：

```scss
.el-card {
  @include card-style;

  // 边框样式与侧边栏一致
  border: 0.5px solid var(--app-border) !important;

  &__header {
    padding: 14px 15px 7px !important;
    min-height: 40px;
    border-bottom: none !important;
  }

  &__body {
    padding: 15px 20px 20px 20px !important;
  }
}
```

## 导航组件

### 菜单组件

菜单子菜单箭头颜色和折叠状态处理：

```scss
.el-menu {
  // 子菜单箭头颜色调淡
  .el-sub-menu__icon-arrow {
    color: var(--el-text-color-placeholder) !important;
    opacity: 0.8;
  }

  // 折叠状态隐藏箭头
  &--collapse > div > .el-submenu > .el-submenu__title .el-submenu__icon-arrow {
    display: none;
  }
}

.el-dropdown-menu a {
  display: block;
}
```

### 面包屑

面包屑字体粗细优化：

```scss
.el-breadcrumb__inner,
.el-breadcrumb__inner a {
  font-weight: 400 !important;
}
```

## 标签组件

标签组件的尺寸和样式统一：

```scss
.el-tag {
  height: 26px !important;
  line-height: 26px !important;
  border: 0 !important;
  border-radius: 6px !important;
  font-weight: 500;
  transition: all 0s !important;
}
```

## 抽屉组件

### 关闭按钮

抽屉关闭按钮的样式优化：

```scss
.el-drawer__header .el-icon {
  color: var(--el-text-color-regular) !important;
  width: 30px !important;
  height: 30px !important;
  padding: 7px !important;
  border-radius: 5px !important;
  transition: all 0.2s ease !important;
  background-color: transparent !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 18px !important;

  &:hover {
    background-color: var(--bg-level-2) !important;
    color: var(--el-text-color-primary) !important;
    transform: none !important;
  }

  &:focus {
    outline: none !important;
  }
}
```

### 阴影优化

抽屉阴影效果减淡：

```scss
.el-drawer {
  box-shadow: 0 8px 10px -5px rgba(0, 0, 0, 0.08),
    0 16px 24px 2px rgba(0, 0, 0, 0.06),
    0 6px 30px 5px rgba(0, 0, 0, 0.05) !important;
}
```

## 其他组件

### 折叠面板

折叠面板标题和内容样式：

```scss
.el-collapse {
  .collapse__title {
    font-weight: 600;
    padding: 0 8px;
    font-size: 1.2em;
    line-height: 1.1em;
  }

  .el-collapse-item__content {
    padding: 0 8px;
  }
}
```

### 树形控件

树节点复选框间距：

```scss
.el-tree-node__content > .el-checkbox {
  margin-right: 8px;
}
```

### 日期选择器面板

日期选择器面板底部圆角：

```scss
.el-picker-panel {
  .el-picker-panel__footer {
    border-radius: 0 0 var(--el-border-radius-base) var(--el-border-radius-base);
  }
}
```

### 表格过滤复选框

表格过滤器中的复选框样式：

```scss
.el-checkbox-group {
  &.el-table-filter__checkbox-group label.el-checkbox {
    height: 17px !important;

    .el-checkbox__label {
      font-weight: 400 !important;
    }
  }
}
```

### 布局组件

Row 组件宽度设置，避免水平滚动条：

```scss
.el-row {
  width: 100% !important;
}
```

## 滚动条美化

### 全局滚动条样式

非表格元素的滚动条统一样式：

```scss
*:not(.el-table):not(.el-table *) {
  // Webkit 浏览器滚动条
  &::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
  }

  &::-webkit-scrollbar-track {
    background: transparent !important;
    border-radius: 3px !important;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15) !important;
    border-radius: 3px !important;
    transition: background 0.2s ease !important;

    &:hover {
      background: rgba(0, 0, 0, 0.25) !important;
    }
  }

  // Firefox 滚动条
  scrollbar-width: thin !important;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent !important;
}
```

## 响应式适配

### 移动端适配

针对手机设备的样式调整：

```scss
@media screen and (max-width: $device-phone) {
  // 对话框和消息宽度
  .el-message-box,
  .el-message,
  .el-dialog {
    width: calc(100% - 24px) !important;
  }

  // 日期选择器
  .el-date-picker.has-sidebar.has-time {
    width: calc(100% - 24px);
    left: 12px !important;
  }

  // 隐藏日期选择器侧边栏
  .el-picker-panel *[slot='sidebar'],
  .el-picker-panel__sidebar {
    display: none;
  }

  .el-picker-panel *[slot='sidebar'] + .el-picker-panel__body,
  .el-picker-panel__sidebar + .el-picker-panel__body {
    margin-left: 0;
  }
}
```

### 平板适配

针对 iPad Pro 等平板设备的优化：

```scss
@media screen and (max-width: $device-ipad-pro) {
  .el-table-fixed-column--right {
    padding-right: 0 !important;

    .el-button {
      margin: 5px 10px 5px 0 !important;
    }
  }
}
```

## 最佳实践

### 1. 使用设计变量

始终使用项目定义的 CSS 变量，而不是硬编码颜色值：

```scss
// ✅ 推荐
background-color: var(--bg-level-2);
color: var(--el-text-color-primary);
border-color: var(--el-border-color);

// ❌ 避免
background-color: #f5f5f5;
color: #333;
border-color: #ddd;
```

### 2. 响应式断点

使用项目定义的断点变量进行响应式设计：

```scss
// ✅ 推荐
@media (max-width: $device-phone) { ... }
@media (max-width: $device-ipad-pro) { ... }

// 或使用混合器
@include respond-to('sm') { ... }

// ❌ 避免
@media (max-width: 768px) { ... }
```

### 3. 动态圆角

使用动态计算的圆角值，保持与全局设置一致：

```scss
// ✅ 推荐
border-radius: calc(var(--custom-radius) / 1.5 + 2px);
border-radius: var(--el-border-radius-base);

// ❌ 避免
border-radius: 8px;
```

### 4. 过渡动画

为交互元素添加平滑的过渡效果：

```scss
// ✅ 推荐
transition: all 0.2s ease;
transition: background-color 0.2s ease, transform 0.2s ease;

// 按钮悬停效果
&:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### 5. 避免过度使用 !important

仅在必要时使用 `!important` 覆盖 Element Plus 默认样式：

```scss
// 确实需要覆盖的场景
.el-dialog {
  border-radius: calc(var(--custom-radius) / 1.5 + 2px) !important;
}

// 可以不用 !important 的场景
.custom-button {
  background-color: var(--bg-level-2);
}
```

## 常见问题

### 1. 样式未生效

**问题原因：**
- CSS 选择器优先级不够
- 样式文件未正确导入
- 样式被其他规则覆盖

**解决方案：**

```scss
// 1. 提高选择器优先级
.el-dialog.el-dialog {
  border-radius: 12px;
}

// 2. 使用 !important（谨慎使用）
.el-dialog {
  border-radius: 12px !important;
}

// 3. 检查导入顺序
@use '../abstracts/variables' as *;
@use '../abstracts/mixins' as *;
// Element Plus 定制样式应在变量之后导入
```

### 2. 暗黑模式不兼容

**问题原因：**
- 使用了硬编码的颜色值
- 未使用 CSS 变量

**解决方案：**

```scss
// ✅ 使用 CSS 变量
.custom-element {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-color: var(--el-border-color);
}

// 使用层级背景色
.hover-item:hover {
  background-color: var(--bg-level-2);
}
```

### 3. 移动端布局问题

**问题原因：**
- 未考虑小屏幕设备
- 固定宽度导致溢出

**解决方案：**

```scss
// 使用响应式设计
.el-dialog {
  width: 600px;

  @media screen and (max-width: $device-phone) {
    width: calc(100% - 24px) !important;
  }
}

// 隐藏不必要的元素
@include respond-to('sm') {
  .pagination-container .el-pagination > .el-pagination__jump {
    display: none !important;
  }
}
```

### 4. 滚动条样式不一致

**问题原因：**
- 不同浏览器的默认滚动条样式不同
- 表格组件使用自定义滚动条

**解决方案：**

```scss
// 全局滚动条样式（排除表格）
*:not(.el-table):not(.el-table *) {
  &::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
  }

  scrollbar-width: thin !important;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent !important;
}

// 表格专用滚动条
.el-table .el-scrollbar__thumb {
  background-color: rgba(0, 0, 0, 0.2) !important;
}
```

### 5. 对话框内容溢出

**问题原因：**
- 内容高度超过视口
- 未设置最大高度限制

**解决方案：**

```scss
.el-overlay .el-overlay-dialog .el-dialog:not(.is-fullscreen) {
  .el-dialog__body {
    max-height: calc(90vh - 111px) !important;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
```

## API 参考

### CSS 变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--custom-radius` | 全局圆角基准值 | `12px` |
| `--bg-level-2` | 二级背景色 | 主题相关 |
| `--bg-level-3` | 三级背景色 | 主题相关 |
| `--table-header-bg` | 表头背景色 | 主题相关 |
| `--table-header-text` | 表头文字色 | 主题相关 |
| `--app-border` | 应用边框色 | 主题相关 |
| `--main-color` | 主题色 | `#409EFF` |

### 断点变量

| 变量名 | 说明 | 值 |
|--------|------|-----|
| `$device-phone` | 手机设备 | `768px` |
| `$device-ipad-pro` | 平板设备 | `1024px` |

### 辅助类

| 类名 | 说明 |
|------|------|
| `.el-dialog-border` | 对话框带边框装饰 |
| `.fixed-width` | 固定宽度按钮 |
| `.small-padding` | 小内边距单元格 |
| `.status-col` | 状态列样式 |
| `.pagination-container` | 分页容器 |
| `.upload-container` | 上传容器 |
