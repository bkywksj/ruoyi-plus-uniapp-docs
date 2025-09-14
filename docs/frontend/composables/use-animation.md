# useAnimation

动画工具组合函数，基于 Animate.css 提供了丰富的动画效果和管理功能。

## 📋 功能特性

- **动画效果库**: 提供多种预定义的动画效果
- **动画配置**: 创建和管理进入/离开动画配置
- **预设配置**: 常用场景的动画预设
- **动画控制**: 设置、切换和应用动画
- **随机动画**: 支持随机动画效果
- **DOM操作**: 为DOM元素应用动画效果
- **状态管理**: 跟踪和控制当前动画状态

## 🎯 基础用法

### 基本使用

```vue
<template>
  <div ref="elementRef" class="animate-target">
    动画元素
  </div>
  <button @click="triggerAnimation">播放动画</button>
</template>

<script setup>
import { useAnimation } from '@/composables/useAnimation'

const elementRef = ref(null)
const { applyAnimation, animationEffects } = useAnimation()

const triggerAnimation = () => {
  applyAnimation(elementRef.value, animationEffects.BOUNCE_IN)
}
</script>
```

### 随机动画模式

```vue
<template>
  <div ref="elementRef">随机动画元素</div>
  <button @click="toggleRandom">{{ isRandomAnimation ? '关闭' : '开启' }}随机动画</button>
  <button @click="playRandomAnimation">播放随机动画</button>
</template>

<script setup>
import { useAnimation } from '@/composables/useAnimation'

const elementRef = ref(null)
const { 
  isRandomAnimation, 
  toggleRandomAnimation, 
  nextAnimation, 
  applyAnimation 
} = useAnimation()

const toggleRandom = () => {
  toggleRandomAnimation()
}

const playRandomAnimation = () => {
  applyAnimation(elementRef.value, nextAnimation.value)
}
</script>
```

## 🎨 动画效果库

### 基础动画

| 效果名称 | 类名 | 描述 |
|---------|------|------|
| EMPTY | '' | 无动画 |
| PULSE | animate__animated animate__pulse | 脉冲效果：轻微缩放和颤动 |
| RUBBER_BAND | animate__animated animate__rubberBand | 橡皮筋效果：元素弹性拉伸 |

### 进入动画

| 效果名称 | 类名 | 描述 |
|---------|------|------|
| BOUNCE_IN | animate__animated animate__bounceIn | 弹跳进入：从小变大 |
| BOUNCE_IN_LEFT | animate__animated animate__bounceInLeft | 从左侧弹跳进入 |
| FADE_IN | animate__animated animate__fadeIn | 渐入效果：从透明到不透明 |
| FADE_IN_LEFT | animate__animated animate__fadeInLeft | 从左侧渐入 |
| FADE_IN_DOWN | animate__animated animate__fadeInDown | 从上方渐入 |
| FADE_IN_UP | animate__animated animate__fadeInUp | 从下方渐入 |
| FLIP_IN_X | animate__animated animate__flipInX | X轴翻转进入 |
| LIGHT_SPEED_IN_LEFT | animate__animated animate__lightSpeedInLeft | 从左侧光速进入 |
| ROTATE_IN_DOWN_LEFT | animate__animated animate__rotateInDownLeft | 从左下方旋转进入 |
| ROLL_IN | animate__animated animate__rollIn | 滚动进入 |
| ZOOM_IN | animate__animated animate__zoomIn | 缩放进入 |
| ZOOM_IN_DOWN | animate__animated animate__zoomInDown | 从上方缩放进入 |
| SLIDE_IN_LEFT | animate__animated animate__slideInLeft | 从左侧滑入 |
| LIGHT_SPEED_IN | animate__animated animate__lightSpeedIn | 光速进入 |

### 离开动画

| 效果名称 | 类名 | 描述 |
|---------|------|------|
| FADE_OUT | animate__animated animate__fadeOut | 渐出效果 |

## ⚙️ 动画配置

### 创建动画配置

```javascript
import { useAnimation } from '@/composables/useAnimation'

const { 
  createAnimationConfig, 
  animationEffects,
  setAnimationConfig 
} = useAnimation()

// 创建自定义动画配置
const customConfig = createAnimationConfig(
  animationEffects.FADE_IN,      // 进入动画
  animationEffects.FADE_OUT      // 离开动画
)

// 设置为当前配置
setAnimationConfig(customConfig)
```

### 预定义配置

```javascript
import { useAnimation } from '@/composables/useAnimation'

const { 
  searchAnimate,      // 搜索动画配置（无动画）
  menuSearchAnimate,  // 菜单搜索动画配置
  logoAnimate        // Logo动画配置
} = useAnimation()

// 使用预定义配置
setAnimationConfig(menuSearchAnimate)
```

## 🎮 动画控制

### 状态管理

```vue
<template>
  <div>
    <p>当前动画: {{ currentAnimation }}</p>
    <p>随机模式: {{ isRandomAnimation ? '开启' : '关闭' }}</p>
    <p>下一个动画: {{ nextAnimation }}</p>
    
    <button @click="setAnimation(animationEffects.BOUNCE_IN)">
      设置弹跳动画
    </button>
    <button @click="toggleRandomAnimation()">
      切换随机模式
    </button>
  </div>
</template>

<script setup>
import { useAnimation } from '@/composables/useAnimation'

const {
  currentAnimation,
  isRandomAnimation,
  nextAnimation,
  setAnimation,
  toggleRandomAnimation,
  animationEffects
} = useAnimation()
</script>
```

### 应用动画

```vue
<template>
  <div ref="boxRef" class="animated-box">
    点击按钮播放动画
  </div>
  <button @click="playAnimationWithCallback">播放带回调的动画</button>
</template>

<script setup>
import { useAnimation } from '@/composables/useAnimation'

const boxRef = ref(null)
const { applyAnimation, animationEffects } = useAnimation()

const playAnimationWithCallback = () => {
  applyAnimation(
    boxRef.value, 
    animationEffects.BOUNCE_IN,
    () => {
      console.log('动画播放完成！')
      // 可以在这里执行动画结束后的逻辑
    }
  )
}
</script>
```

## 🔄 高级用法

### 链式动画

```vue
<template>
  <div ref="elementRef" class="chain-animate">
    链式动画演示
  </div>
  <button @click="playChainAnimation">播放链式动画</button>
</template>

<script setup>
import { useAnimation } from '@/composables/useAnimation'

const elementRef = ref(null)
const { applyAnimation, animationEffects } = useAnimation()

const playChainAnimation = () => {
  // 第一个动画
  applyAnimation(
    elementRef.value, 
    animationEffects.FADE_IN,
    () => {
      // 第一个动画结束后播放第二个动画
      applyAnimation(
        elementRef.value,
        animationEffects.BOUNCE_IN,
        () => {
          console.log('链式动画完成！')
        }
      )
    }
  )
}
</script>
```

### 条件动画

```vue
<template>
  <div ref="conditionRef" class="condition-animate">
    条件动画元素
  </div>
  <button @click="playConditionalAnimation">根据条件播放动画</button>
</template>

<script setup>
import { useAnimation } from '@/composables/useAnimation'

const conditionRef = ref(null)
const someCondition = ref(true)

const { 
  applyAnimation, 
  animationEffects,
  nextAnimation 
} = useAnimation()

const playConditionalAnimation = () => {
  const animation = someCondition.value 
    ? animationEffects.BOUNCE_IN 
    : nextAnimation.value
    
  applyAnimation(conditionRef.value, animation)
}
</script>
```

## 📚 API 参考

### 返回值

| 属性/方法 | 类型 | 描述 |
|----------|------|------|
| currentAnimation | Ref\<string\> | 当前启用的动画 |
| isRandomAnimation | Ref\<boolean\> | 是否启用随机动画 |
| currentConfig | Ref\<AnimationConfig\> | 当前动画配置 |
| nextAnimation | ComputedRef\<string\> | 获取下一个动画 |
| getRandomAnimation | () => string | 获取随机动画效果 |
| setAnimation | (animation: string) => void | 设置当前动画 |
| toggleRandomAnimation | (value?: boolean) => void | 切换随机动画模式 |
| createAnimationConfig | (enter?: string, leave?: string) => AnimationConfig | 创建动画配置 |
| setAnimationConfig | (config: AnimationConfig) => void | 设置当前动画配置 |
| applyAnimation | (element: HTMLElement, animation?: string, callback?: Function) => void | 为元素应用动画 |
| animationEffects | object | 动画效果常量 |
| animateList | string[] | 随机动画列表 |
| defaultAnimate | string | 默认动画效果 |

### 类型定义

```typescript
interface AnimationConfig {
  enter: string   // 进入时的动画
  leave: string   // 离开时的动画
}
```
