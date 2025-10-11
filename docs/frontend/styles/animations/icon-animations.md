# 图标动画

图标动画为用户交互提供即时的视觉反馈,增强界面的生动性和交互体验。

## 🎯 动画类型

### 1. 抖动动画 (Shake)

```scss
@keyframes shake {
  0% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0); }
}

.icon-hover-shake {
  &:hover {
    animation: shake 0.5s ease-in-out;
  }
}
```

**使用场景**: 通知图标、警告提示

### 2. 旋转动画 (Rotate)

```scss
@keyframes rotate180 {
  0% { transform: rotate(0); }
  100% { transform: rotate(180deg); }
}

.icon-hover-rotate180 {
  transform-origin: 50% 50% !important;

  &:hover {
    animation: rotate180 0.4s cubic-bezier(0.4, 0, 0.6, 1);
  }
}
```

**使用场景**: 刷新按钮、折叠展开图标

### 3. 上下移动 (Move Up)

```scss
@keyframes moveUp {
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}

.icon-hover-moveUp {
  &:hover {
    animation: moveUp 0.4s ease-in-out;
  }
}
```

**使用场景**: 上传图标、提交按钮

### 4. 放大动画 (Expand)

```scss
@keyframes expand {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.icon-hover-expand {
  &:hover {
    animation: expand 0.6s ease-in-out;
  }
}
```

**使用场景**: 重要操作图标、主要按钮

### 5. 缩小动画 (Shrink)

```scss
@keyframes shrink {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.icon-hover-shrink {
  &:hover {
    animation: shrink 0.6s ease-in-out;
  }
}
```

**使用场景**: 点击反馈、收藏按钮

### 6. 呼吸动画 (Breathing)

```scss
@keyframes breathing {
  0% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.4;
    transform: scale(0.9);
  }
}

.icon-hover-breathing {
  animation: breathing 1.5s ease-in-out infinite;
}
```

**使用场景**: 在线状态、实时提醒

## 🔧 使用示例

### 单个图标

```html
<div class="icon-hover-shake">
  <i class="i-ep-bell"></i>
</div>
```

### 组合使用

```html
<div class="toolbar">
  <button class="icon-hover-rotate180">
    <i class="i-ep-refresh"></i>
  </button>
  <button class="icon-hover-expand">
    <i class="i-ep-upload"></i>
  </button>
  <button class="icon-hover-shake">
    <i class="i-ep-delete"></i>
  </button>
</div>
```

### Vue 组件中使用

```vue
<template>
  <el-button class="icon-hover-expand">
    <el-icon><Upload /></el-icon>
    上传文件
  </el-button>
</template>

<style scoped>
.icon-hover-expand:hover :deep(.el-icon) {
  animation: expand 0.6s ease-in-out;
}
</style>
```

## ✅ 最佳实践

1. **适度使用** - 避免过度动画影响体验
2. **统一风格** - 同类图标使用相同动画
3. **性能优化** - 使用 `transform` 而非 `position`
4. **无障碍性** - 支持 `prefers-reduced-motion`

```scss
@media (prefers-reduced-motion: reduce) {
  .icon-hover-shake,
  .icon-hover-rotate180,
  .icon-hover-moveUp,
  .icon-hover-expand,
  .icon-hover-shrink,
  .icon-hover-breathing {
    animation: none !important;
  }
}
```

图标动画为用户交互提供了生动的视觉反馈,提升了界面的交互体验。
