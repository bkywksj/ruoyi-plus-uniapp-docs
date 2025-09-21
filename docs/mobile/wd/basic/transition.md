# Transition 动画

WD UI 过渡动画组件，用于在组件显示/隐藏时添加过渡效果。

## 基本使用

### 基础动画

```vue
<template>
  <view class="demo-block">
    <wd-button @click="showTransition = !showTransition">
      切换显示
    </wd-button>
    
    <wd-transition :show="showTransition">
      <view class="content">
        这是一个带动画的内容
      </view>
    </wd-transition>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const showTransition = ref(false)
</script>
```

### 动画类型

```vue
<template>
  <view class="demo-block">
    <!-- 淡入淡出 -->
    <wd-transition name="fade" :show="show1">
      <view class="content">淡入淡出</view>
    </wd-transition>
    
    <!-- 向上滑入 -->
    <wd-transition name="slide-up" :show="show2">
      <view class="content">向上滑入</view>
    </wd-transition>
    
    <!-- 向下滑入 -->
    <wd-transition name="slide-down" :show="show3">
      <view class="content">向下滑入</view>
    </wd-transition>
    
    <!-- 向左滑入 -->
    <wd-transition name="slide-left" :show="show4">
      <view class="content">向左滑入</view>
    </wd-transition>
    
    <!-- 向右滑入 -->
    <wd-transition name="slide-right" :show="show5">
      <view class="content">向右滑入</view>
    </wd-transition>
  </view>
</template>
```

### 缩放动画

```vue
<template>
  <view class="demo-block">
    <!-- 从中心缩放 -->
    <wd-transition name="zoom" :show="show1">
      <view class="content">从中心缩放</view>
    </wd-transition>
    
    <!-- 从上方缩放 -->
    <wd-transition name="zoom-top" :show="show2">
      <view class="content">从上方缩放</view>
    </wd-transition>
    
    <!-- 从下方缩放 -->
    <wd-transition name="zoom-bottom" :show="show3">
      <view class="content">从下方缩放</view>
    </wd-transition>
  </view>
</template>
```

### 旋转动画

```vue
<template>
  <view class="demo-block">
    <!-- 旋转动画 -->
    <wd-transition name="rotate" :show="showRotate">
      <view class="content">旋转动画</view>
    </wd-transition>
    
    <!-- 3D翻转 -->
    <wd-transition name="flip" :show="showFlip">
      <view class="content">3D翻转</view>
    </wd-transition>
  </view>
</template>
```

## 自定义动画

### 自定义持续时间

```vue
<template>
  <view class="demo-block">
    <!-- 设置动画持续时间 -->
    <wd-transition 
      name="fade" 
      :show="show" 
      :duration="{ enter: 500, leave: 300 }"
    >
      <view class="content">自定义持续时间</view>
    </wd-transition>
  </view>
</template>
```

### 自定义缓动函数

```vue
<template>
  <view class="demo-block">
    <!-- 设置缓动函数 -->
    <wd-transition 
      name="slide-up" 
      :show="show" 
      timing-function="cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    >
      <view class="content">自定义缓动函数</view>
    </wd-transition>
  </view>
</template>
```

### 自定义CSS类名

```vue
<template>
  <view class="demo-block">
    <!-- 使用自定义CSS类名 -->
    <wd-transition 
      :show="show"
      enter-class="my-enter"
      enter-active-class="my-enter-active"
      enter-to-class="my-enter-to"
      leave-class="my-leave"
      leave-active-class="my-leave-active"
      leave-to-class="my-leave-to"
    >
      <view class="content">自定义动画</view>
    </wd-transition>
  </view>
</template>

<style>
/* 入场动画 */
.my-enter {
  opacity: 0;
  transform: scale(0.5);
}

.my-enter-active {
  transition: all 0.3s ease;
}

.my-enter-to {
  opacity: 1;
  transform: scale(1);
}

/* 离场动画 */
.my-leave {
  opacity: 1;
  transform: scale(1);
}

.my-leave-active {
  transition: all 0.3s ease;
}

.my-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| show | 是否显示 | boolean | true/false | false |
| name | 动画名称 | string | fade/slide-up/slide-down/slide-left/slide-right/zoom/zoom-top/zoom-bottom/rotate/flip | fade |
| duration | 动画持续时间 | number/object | — | 300 |
| timing-function | 缓动函数 | string | — | ease |
| appear | 是否在初始渲染时启用动画 | boolean | true/false | false |
| enter-class | 入场动画开始类名 | string | — | — |
| enter-active-class | 入场过渡类名 | string | — | — |
| enter-to-class | 入场动画结束类名 | string | — | — |
| leave-class | 离场动画开始类名 | string | — | — |
| leave-active-class | 离场过渡类名 | string | — | — |
| leave-to-class | 离场动画结束类名 | string | — | — |
| custom-class | 自定义类名 | string | — | — |
| custom-style | 自定义样式 | string | — | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| before-enter | 入场动画开始前 | — |
| enter | 入场动画开始 | — |
| after-enter | 入场动画结束 | — |
| enter-cancelled | 入场动画取消 | — |
| before-leave | 离场动画开始前 | — |
| leave | 离场动画开始 | — |
| after-leave | 离场动画结束 | — |
| leave-cancelled | 离场动画取消 | — |

### Slots

| 名称 | 说明 |
|------|------|
| default | 需要添加动画的内容 |

## 内置动画类型

### 淡入淡出
- `fade`: 淡入淡出效果

### 滑动效果
- `slide-up`: 向上滑入
- `slide-down`: 向下滑入
- `slide-left`: 向左滑入
- `slide-right`: 向右滑入

### 缩放效果
- `zoom`: 从中心缩放
- `zoom-top`: 从上方缩放
- `zoom-bottom`: 从下方缩放

### 旋转效果
- `rotate`: 旋转动画
- `flip`: 3D翻转效果

## 注意事项

1. 在小程序中，部分复杂动画可能性能不佳，建议优先使用简单动画
2. 动画持续时间不宜过长，建议在300-500ms之间
3. 在iOS设备上，3D变换可能会导致闪烁，可以添加`-webkit-backface-visibility: hidden`修复
4. 自定义动画时，请确保初始状态和结束状态的样式定义正确
5. 建议在实际设备上测试动画效果，不同平台可能有细微差异