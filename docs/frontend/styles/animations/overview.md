# 动画系统概述

项目实现了完整的动画系统,包括过渡动画、关键帧动画和专门的组件动画,为用户界面带来流畅自然的交互体验。

## 🎬 动画分类

### 1. 过渡动画(Transitions)
- 页面切换动画
- 元素淡入淡出
- 位移变换效果

### 2. 关键帧动画(Keyframes)
- 对话框开关动画
- 图标交互动画
- 呼吸动画效果

### 3. 组件动画
- Element Plus 组件动画覆盖
- 自定义组件动画

## 📁 文件位置

动画样式定义在 `styles/components/_animations.scss`。

## ⏱️ 动画时长规范

```scss
:root {
  --duration-normal: 0.3s;   // 标准过渡时长
  --duration-slow: 0.6s;     // 慢速过渡时长
}
```

## 🎯 核心动画

### 1. 淡入淡出

```scss
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal);
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
```

### 2. 淡入淡出+位移

```scss
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all var(--duration-slow);
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
```

### 3. 对话框动画

```scss
@keyframes dialog-open {
  0% {
    opacity: 0;
    transform: scale(0.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dialog-close {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.2);
  }
}
```

### 4. 图标动画

```scss
// 抖动动画
@keyframes shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
}

// 旋转动画
@keyframes rotate180 {
  0% { transform: rotate(0); }
  100% { transform: rotate(180deg); }
}

// 上下移动
@keyframes moveUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
```

## 🔧 使用示例

### Vue 过渡组件

```vue
<template>
  <transition name="fade">
    <div v-if="show">内容</div>
  </transition>
</template>
```

### 图标悬停动画

```html
<div class="icon-hover-shake">
  <i class="icon"></i>
</div>
```

### 对话框动画

```html
<el-dialog
  v-model="visible"
  transition-name="dialog-fade"
>
  <!-- 对话框内容 -->
</el-dialog>
```

## 🎨 动画工具类

```scss
.icon-hover-shake { &:hover { animation: shake 0.5s; } }
.icon-hover-rotate180 { &:hover { animation: rotate180 0.4s; } }
.icon-hover-moveUp { &:hover { animation: moveUp 0.4s; } }
.icon-hover-expand { &:hover { animation: expand 0.6s; } }
.icon-hover-breathing { animation: breathing 1.5s infinite; }
```

## ✅ 最佳实践

1. **使用统一时长** - 遵循 `--duration-normal` 和 `--duration-slow`
2. **性能优化** - 优先使用 `transform` 和 `opacity`
3. **适度使用** - 避免过度动画影响用户体验
4. **可访问性** - 支持 `prefers-reduced-motion`

项目动画系统为用户界面带来了生动自然的交互体验。
