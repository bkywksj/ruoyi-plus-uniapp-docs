# 关键帧动画

关键帧动画通过 `@keyframes` 定义复杂的动画序列,提供丰富的视觉效果。

## 🎭 对话框动画

### 打开动画

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
```

### 关闭动画

```scss
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

### 遮罩层动画

```scss
@keyframes fade-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

## 📈 图标动画

### 抖动动画

```scss
@keyframes shake {
  0% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0); }
}
```

### 旋转动画

```scss
@keyframes rotate180 {
  0% { transform: rotate(0); }
  100% { transform: rotate(180deg); }
}
```

### 上下移动

```scss
@keyframes moveUp {
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}
```

### 缩放动画

```scss
@keyframes expand {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes shrink {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
```

### 呼吸动画

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
```

## 🔧 使用示例

### 对话框

```scss
.dialog-fade-enter-active {
  .el-dialog {
    animation: dialog-open 0.2s cubic-bezier(0.32, 0.14, 0.15, 0.86);
  }
}

.dialog-fade-leave-active {
  animation: fade-out 0.2s linear;

  .el-dialog {
    animation: dialog-close 0.5s;
  }
}
```

### 图标悬停

```scss
.icon-hover-shake {
  &:hover {
    animation: shake 0.5s ease-in-out;
  }
}

.icon-hover-breathing {
  animation: breathing 1.5s ease-in-out infinite;
}
```

## ✅ 最佳实践

1. **合理设置时长** - 避免动画过快或过慢
2. **使用缓动函数** - `cubic-bezier()` 创建自然效果
3. **性能优化** - 优先使用 `transform` 和 `opacity`
