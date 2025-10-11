# Element Plus 样式覆盖

本项目基于 Element Plus 组件库,通过样式覆盖实现了与项目主题的深度整合和定制化需求。

## 📁 文件位置

Element Plus 样式覆盖定义在 `styles/vendors/_element-plus.scss`。

## 🎯 覆盖策略

### 1. 使用 CSS 变量覆盖

```scss
:root {
  // Element Plus 颜色映射
  --el-color-primary: #409eff;
  --el-bg-color-overlay: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
}
```

**优势**:
- 与主题系统无缝集成
- 自动支持暗色模式
- 易于维护和扩展

### 2. 直接样式覆盖

```scss
// 针对特定组件的样式覆盖
.el-button {
  border-radius: var(--radius-md);
}

.el-input {
  border-radius: var(--radius-md);
}
```

### 3. 深度选择器覆盖

```scss
// 使用 :deep() 覆盖组件内部样式
:deep(.el-dialog__header) {
  background: var(--bg-level-1);
  border-bottom: 1px solid var(--app-border);
}
```

## 🎨 主题集成

### 亮色主题集成

```scss
:root {
  --el-color-primary: #409eff;
  --el-color-primary-light-3: #79bbff;
  --el-bg-color-overlay: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
}
```

### 暗色主题集成

```scss
html.dark {
  --el-color-primary: #3b82f6;
  --el-color-primary-light-3: #60a5fa;
  --el-bg-color-overlay: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);

  // 组件特定覆盖
  .el-button--primary {
    --el-button-bg-color: var(--el-color-primary-dark-6);
  }
}
```

## 🔧 常用组件覆盖

### 按钮组件

```scss
.el-button {
  border-radius: var(--radius-md);
  transition: all var(--duration-normal);

  &--primary {
    --el-button-bg-color: var(--el-color-primary);
    --el-button-border-color: var(--el-color-primary);
  }
}
```

### 输入框组件

```scss
.el-input {
  --el-input-border-radius: var(--radius-md);

  .el-input__inner {
    border-radius: var(--radius-md);
  }
}
```

### 对话框组件

```scss
.el-dialog {
  border-radius: var(--radius-lg);

  .el-dialog__header {
    background: var(--bg-level-1);
    border-bottom: 1px solid var(--app-border);
  }

  .el-dialog__body {
    background: var(--bg-level-1);
    color: var(--app-text);
  }
}
```

### 表格组件

```scss
.el-table {
  --el-table-border-color: var(--app-border);

  .el-table__header {
    background: var(--table-header-bg);
    color: var(--table-header-text);
  }

  .el-table__body .el-table__row:hover > td {
    background-color: var(--bg-level-3) !important;
  }
}
```

### 菜单组件

```scss
.el-menu {
  --el-menu-bg-color: var(--menu-bg);
  --el-menu-text-color: var(--menu-text);
  --el-menu-active-bg-color: var(--menu-active-bg);
  --el-menu-active-text-color: var(--menu-active-text);
}
```

## 📏 尺寸统一

```scss
:root {
  // 统一组件高度
  --el-component-custom-height: 32px !important;
  --el-component-size: var(--el-component-custom-height) !important;

  // 字体权重统一
  --el-font-weight-primary: 400 !important;
}
```

## 🎭 动画覆盖

```scss
// 对话框动画
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-open 0.2s cubic-bezier(0.32, 0.14, 0.15, 0.86);
  }
}

.dialog-fade-leave-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-close 0.5s;
  }
}

// 菜单动画
.el-menu.el-menu--inline {
  transition: max-height 0.26s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
```

## ✅ 最佳实践

1. **优先使用CSS变量** - 确保主题兼容性
2. **避免过度覆盖** - 保持Element Plus原有特性
3. **注意选择器优先级** - 使用适当的选择器权重
4. **测试多主题** - 确保在亮色和暗色主题下都正常显示

通过合理的样式覆盖,Element Plus组件完美融入项目主题系统。
