# themeAnimation 主题切换动画

## 介绍

`themeAnimation` 模块提供了基于 View Transition API 的主题切换动画效果，实现从点击位置向外扩散的圆形切换动画。该工具为用户在切换亮色/暗黑模式时提供流畅、直观的视觉反馈体验。

**核心特性：**

- **圆形扩散动画** - 从点击位置向外扩散的圆形切换效果，视觉效果流畅自然
- **View Transition API** - 使用现代浏览器原生 API 实现无闪烁的主题切换
- **自动降级处理** - 不支持 View Transition API 的浏览器自动降级为即时切换
- **动态半径计算** - 自动计算从点击点到视窗最远角的距离，确保动画完整覆盖屏幕
- **CSS 变量驱动** - 通过 CSS 变量传递动画参数，便于自定义动画样式

## 基础用法

### 基本使用

在主题切换按钮中使用 `toggleThemeWithAnimation`：

```vue
<template>
  <div class="theme-switch">
    <el-button
      :icon="isDark ? 'Moon' : 'Sunny'"
      circle
      @click="handleThemeToggle"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

const layout = useLayout()

const isDark = computed(() => layout.isDark.value)

const handleThemeToggle = (event: MouseEvent) => {
  toggleThemeWithAnimation(event, isDark.value)
}
</script>
```

**使用说明：**
- 必须传入鼠标点击事件对象 `MouseEvent`，用于获取点击位置
- 必须传入当前的暗黑模式状态 `isDark`
- 函数会自动调用 `useLayout().toggleDark()` 切换主题

### 在导航栏中使用

```vue
<template>
  <header class="navbar">
    <div class="navbar-right">
      <!-- 主题切换按钮 -->
      <div
        class="theme-toggle"
        @click="onThemeClick"
      >
        <i :class="isDark ? 'icon-moon' : 'icon-sun'" />
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

const layout = useLayout()
const isDark = computed(() => layout.isDark.value)

const onThemeClick = (event: MouseEvent) => {
  toggleThemeWithAnimation(event, isDark.value)
}
</script>

<style lang="scss" scoped>
.theme-toggle {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>
```

## 动画原理

### View Transition API

View Transition API 是现代浏览器提供的原生页面过渡动画 API，可以在 DOM 更新时创建平滑的视觉过渡效果。

**工作流程：**

1. 调用 `document.startViewTransition()` 开始过渡
2. 浏览器捕获当前页面快照
3. 执行回调函数更新 DOM（切换主题）
4. 浏览器捕获新页面快照
5. 使用 CSS 动画在两个快照之间过渡

```typescript
// 核心实现逻辑
if (document.startViewTransition) {
  document.startViewTransition(() => {
    layout.toggleDark(!isDark)
  })
} else {
  // 降级处理：直接切换
  layout.toggleDark(!isDark)
}
```

### 圆形扩散效果

通过 CSS 变量和 `clip-path` 实现圆形扩散效果：

```typescript
// 获取点击位置
const x = event.clientX
const y = event.clientY

// 计算最大半径（点击位置到视窗最远角的距离）
const endRadius = Math.hypot(
  Math.max(x, innerWidth - x),
  Math.max(y, innerHeight - y)
)

// 设置 CSS 变量
const root = document.documentElement
root.style.setProperty('--theme-x', `${x}px`)
root.style.setProperty('--theme-y', `${y}px`)
root.style.setProperty('--theme-r', `${endRadius}px`)
```

**半径计算说明：**
- 使用 `Math.hypot()` 计算斜边长度
- 取点击位置到四个角的最大距离作为最终半径
- 确保圆形动画能完整覆盖整个视窗

### CSS 动画定义

在全局样式中定义过渡动画：

```scss
/* 主题切换动画 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 9999;
}

/* 暗黑模式：圆形扩散 */
.dark::view-transition-old(root) {
  z-index: 9999;
}

.dark::view-transition-new(root) {
  z-index: 1;
}

/* 圆形裁剪动画 */
::view-transition-old(root) {
  animation: theme-circle-out 0.5s ease-in-out;
}

::view-transition-new(root) {
  animation: theme-circle-in 0.5s ease-in-out;
}

@keyframes theme-circle-in {
  from {
    clip-path: circle(0 at var(--theme-x) var(--theme-y));
  }
  to {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }
}

@keyframes theme-circle-out {
  from {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }
  to {
    clip-path: circle(0 at var(--theme-x) var(--theme-y));
  }
}
```

## API

### toggleThemeWithAnimation

主题切换动画函数。

#### 函数签名

```typescript
function toggleThemeWithAnimation(event: MouseEvent, isDark: boolean): void
```

#### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| event | `MouseEvent` | 是 | 鼠标点击事件对象 |
| isDark | `boolean` | 是 | 当前是否为暗黑模式 |

#### 返回值

无返回值。

#### 使用示例

```typescript
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

// 在点击事件中使用
const handleClick = (event: MouseEvent) => {
  const currentIsDark = document.documentElement.classList.contains('dark')
  toggleThemeWithAnimation(event, currentIsDark)
}
```

### CSS 变量

动画过程中会设置以下 CSS 变量：

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--theme-x` | `string` | 点击位置的 X 坐标（如 `'150px'`） |
| `--theme-y` | `string` | 点击位置的 Y 坐标（如 `'200px'`） |
| `--theme-r` | `string` | 动画最大半径（如 `'1200px'`） |

## 自定义动画

### 修改动画时长

```scss
::view-transition-old(root),
::view-transition-new(root) {
  // 修改动画时长为 0.8 秒
  animation-duration: 0.8s;
}
```

### 修改动画缓动函数

```scss
::view-transition-old(root),
::view-transition-new(root) {
  // 使用弹性缓动
  animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 实现其他动画效果

**淡入淡出效果：**

```scss
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-in;
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**滑动效果：**

```scss
::view-transition-old(root) {
  animation: slide-out 0.4s ease-in-out;
}

::view-transition-new(root) {
  animation: slide-in 0.4s ease-in-out;
}

@keyframes slide-out {
  to {
    transform: translateX(-100%);
  }
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
}
```

## 浏览器兼容性

### 支持情况

| 浏览器 | 版本要求 | 支持状态 |
|--------|----------|----------|
| Chrome | 111+ | 是 完全支持 |
| Edge | 111+ | 是 完全支持 |
| Safari | 18+ | 是 完全支持 |
| Firefox | 暂不支持 | 部分 自动降级 |
| IE | 不支持 | 部分 自动降级 |

### 特性检测

```typescript
// 检测浏览器是否支持 View Transition API
const supportsViewTransitions = (): boolean => {
  return 'startViewTransition' in document
}

// 使用示例
if (supportsViewTransitions()) {
  console.log('浏览器支持 View Transition API')
} else {
  console.log('浏览器不支持，将使用即时切换')
}
```

### 降级处理

当浏览器不支持 View Transition API 时，会自动降级为即时切换：

```typescript
if (document.startViewTransition) {
  // 支持：使用动画切换
  document.startViewTransition(() => {
    layout.toggleDark(!isDark)
  })
} else {
  // 不支持：直接切换
  layout.toggleDark(!isDark)
}
```

## 最佳实践

### 1. 确保传入正确的事件对象

```typescript
// ✅ 正确：使用原生 MouseEvent
const handleClick = (event: MouseEvent) => {
  toggleThemeWithAnimation(event, isDark.value)
}

// ❌ 错误：未传入事件对象
const handleClick = () => {
  toggleThemeWithAnimation(null, isDark.value) // 会报错
}
```

### 2. 避免动画期间的状态冲突

```typescript
import { ref } from 'vue'

const isAnimating = ref(false)

const handleThemeToggle = (event: MouseEvent) => {
  // 防止动画期间重复点击
  if (isAnimating.value) return

  isAnimating.value = true

  toggleThemeWithAnimation(event, isDark.value)

  // 动画结束后重置状态
  setTimeout(() => {
    isAnimating.value = false
  }, 500) // 与动画时长一致
}
```

### 3. 配合 prefers-color-scheme

```typescript
import { onMounted } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

onMounted(() => {
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  mediaQuery.addEventListener('change', (e) => {
    // 系统主题变化时直接切换，不使用动画
    layout.toggleDark(e.matches)
  })
})
```

### 4. 优化移动端体验

```vue
<template>
  <div
    class="theme-toggle"
    @click="handleClick"
    @touchstart.prevent="handleTouch"
  >
    <i :class="themeIcon" />
  </div>
</template>

<script lang="ts" setup>
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

const handleClick = (event: MouseEvent) => {
  toggleThemeWithAnimation(event, isDark.value)
}

const handleTouch = (event: TouchEvent) => {
  // 将 touch 事件转换为类似 mouse 事件的格式
  const touch = event.touches[0]
  const mouseEvent = {
    clientX: touch.clientX,
    clientY: touch.clientY
  } as MouseEvent

  toggleThemeWithAnimation(mouseEvent, isDark.value)
}
</script>
```

## 常见问题

### 1. 动画不生效

**问题原因：**
- 浏览器不支持 View Transition API
- CSS 动画样式未正确定义
- CSS 变量未正确设置

**解决方案：**

```typescript
// 1. 检查浏览器支持
console.log('View Transition 支持:', 'startViewTransition' in document)

// 2. 检查 CSS 变量是否设置
const root = document.documentElement
console.log('--theme-x:', root.style.getPropertyValue('--theme-x'))
console.log('--theme-y:', root.style.getPropertyValue('--theme-y'))
console.log('--theme-r:', root.style.getPropertyValue('--theme-r'))

// 3. 确保全局样式中包含动画定义
```

### 2. 动画卡顿

**问题原因：**
- 页面元素过多
- 存在大量重绘操作
- 动画时长过短

**解决方案：**

```scss
// 1. 使用 will-change 优化性能
::view-transition-old(root),
::view-transition-new(root) {
  will-change: clip-path;
}

// 2. 适当延长动画时长
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.6s;
}

// 3. 减少动画复杂度
@keyframes theme-circle-in {
  from {
    clip-path: circle(0 at var(--theme-x) var(--theme-y));
  }
  to {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }
}
```

### 3. 点击位置偏移

**问题原因：**
- 页面有滚动偏移
- 使用了 transform 缩放
- 事件对象不正确

**解决方案：**

```typescript
const handleClick = (event: MouseEvent) => {
  // 确保使用 clientX/clientY（视窗坐标）
  // 而不是 pageX/pageY（文档坐标）
  console.log('点击位置:', event.clientX, event.clientY)

  toggleThemeWithAnimation(event, isDark.value)
}
```

### 4. 与其他动画冲突

**问题原因：**
- 页面中有其他 CSS 动画正在执行
- 存在 transition 属性干扰

**解决方案：**

```scss
// 在主题切换期间禁用其他过渡
.theme-transitioning * {
  transition: none !important;
}

// JavaScript 中添加类名
document.body.classList.add('theme-transitioning')
toggleThemeWithAnimation(event, isDark.value)
setTimeout(() => {
  document.body.classList.remove('theme-transitioning')
}, 500)
```

### 5. 多次快速点击问题

**问题原因：**
- 用户快速多次点击切换按钮
- 动画未完成就开始下一次切换

**解决方案：**

```typescript
import { ref } from 'vue'
import { toggleThemeWithAnimation } from '@/utils/themeAnimation'

// 使用节流
const isThrottled = ref(false)
const THROTTLE_DELAY = 600

const handleThemeToggle = (event: MouseEvent) => {
  if (isThrottled.value) return

  isThrottled.value = true
  toggleThemeWithAnimation(event, isDark.value)

  setTimeout(() => {
    isThrottled.value = false
  }, THROTTLE_DELAY)
}
```
