# 过渡动画

过渡动画用于页面切换、元素显示隐藏等场景,提供流畅的视觉过渡效果。

## 🎬 淡入淡出

### 基础淡入淡出

```scss
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal);  // 0.3s
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
```

**使用示例**:
```vue
<transition name="fade">
  <div v-if="show">淡入淡出内容</div>
</transition>
```

## 🚀 淡入淡出+位移

### 水平位移动画

```scss
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all var(--duration-slow);  // 0.6s
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);  // 从左侧进入
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);   // 向右侧离开
}
```

**使用示例**:
```vue
<transition name="fade-transform">
  <div v-if="show">带位移的淡入淡出</div>
</transition>
```

## 🍞 面包屑动画

### 面包屑过渡

```scss
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all var(--duration-slow);
}

.breadcrumb-enter,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all var(--duration-slow);
}

.breadcrumb-leave-active {
  position: absolute;  // 离开时使用绝对定位
}
```

**使用示例**:
```vue
<transition-group name="breadcrumb">
  <span v-for="item in breadcrumbs" :key="item.id">
    {{ item.name }}
  </span>
</transition-group>
```

## ✅ 最佳实践

1. **使用统一时长** - 遵循 `--duration-normal` 和 `--duration-slow`
2. **合理选择动画** - 根据场景选择合适的过渡效果
3. **性能优化** - 优先使用 `transform` 和 `opacity`
