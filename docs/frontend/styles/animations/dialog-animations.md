# 对话框动画

对话框动画提供了现代化的缩放效果,替代了 Element Plus 默认的淡入淡出,带来更好的视觉体验。

## 🎬 动画实现

### 打开动画

```scss
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-open 0.2s cubic-bezier(0.32, 0.14, 0.15, 0.86);

    // 修复动画后宽度不自适应问题
    .el-select__selected-item {
      display: inline-block;
    }
  }
}

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

**效果说明**:
- 从中心缩放到正常大小
- 同时透明度从0到1
- 使用缓动函数实现平滑效果

### 关闭动画

```scss
.dialog-fade-leave-active {
  animation: fade-out 0.2s linear;

  .el-dialog:not(.is-draggable) {
    animation: dialog-close 0.5s;
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

**效果说明**:
- 从正常大小缩放到中心
- 透明度从1到0
- 遮罩层同步淡出

### 遮罩层动画

```scss
@keyframes fade-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

## 🔧 使用示例

### 基础用法

```vue
<template>
  <el-dialog
    v-model="visible"
    title="提示"
  >
    <p>对话框内容</p>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>
```

### 禁用动画(拖拽对话框)

```vue
<template>
  <el-dialog
    v-model="visible"
    class="is-draggable"
    draggable
  >
    <!-- 拖拽对话框不应用缩放动画 -->
  </el-dialog>
</template>
```

## 🎨 自定义动画

### 修改动画时长

```scss
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-open 0.3s cubic-bezier(0.32, 0.14, 0.15, 0.86);
  }
}
```

### 修改缩放起始大小

```scss
@keyframes dialog-open {
  0% {
    opacity: 0;
    transform: scale(0.5);  // 从50%缩放
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

### 添加弹性效果

```scss
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
}

@keyframes dialog-bounce {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

## 🐛 已知问题修复

### 宽度自适应问题

对话框动画后可能出现宽度不自适应的问题,已通过以下方式修复:

```scss
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    // 修复 el-dialog 动画后宽度不自适应问题
    .el-select__selected-item {
      display: inline-block;
    }
  }
}
```

## 📱 响应式处理

```scss
@media (max-width: 768px) {
  // 移动端使用更快的动画
  .dialog-fade-enter-active {
    .el-dialog:not(.is-draggable) {
      animation: dialog-open 0.15s cubic-bezier(0.32, 0.14, 0.15, 0.86);
    }
  }
}
```

## 🎯 动画优化

### 性能优化

```scss
.el-dialog {
  // 启用硬件加速
  will-change: transform, opacity;

  // 提高渲染性能
  transform: translateZ(0);
}
```

### 无障碍性支持

```scss
@media (prefers-reduced-motion: reduce) {
  .dialog-fade-enter-active,
  .dialog-fade-leave-active {
    animation: none !important;

    .el-dialog {
      animation: none !important;
    }
  }
}
```

## ✅ 最佳实践

1. **保持动画流畅** - 使用合适的时长和缓动函数
2. **避免过度动画** - 不要让动画过于夸张
3. **考虑性能** - 使用 `transform` 和 `opacity`
4. **测试多端** - 确保在不同设备上表现良好
5. **支持无障碍** - 尊重用户的动画偏好设置

对话框动画为用户提供了现代化、流畅的交互体验,提升了整体UI质感。
