# 组件样式

## 介绍

RuoYi-Plus-UniApp 前端项目的组件样式系统提供了一套统一的组件样式规范和实现,确保所有UI组件保持一致的视觉风格和交互体验。组件样式基于模块化设计,支持主题切换、响应式适配和自定义扩展。

**核心特性:**

- **按钮样式系统** - 提供多种按钮样式和交互效果,包括彩色按钮、动画按钮等
- **过渡动画系统** - 统一的过渡动画效果,包括淡入淡出、位移、缩放等
- **组件动画** - 对话框、菜单、徽章等组件的专属动画
- **图标动画** - 丰富的图标悬停动画效果
- **主题集成** - 所有组件样式与主题系统无缝集成
- **可复用混合宏** - 提供混合宏简化组件样式编写

## 按钮组件样式

### colorBtn 混合宏

`colorBtn` 混合宏用于快速创建带有特定颜色主题的按钮,提供统一的悬停效果。

#### 混合宏定义

```scss
/**
 * 颜色按钮混合宏
 * 根据传入的颜色参数创建一个带有该背景色的按钮
 * 鼠标悬停时会变成白色背景，传入的颜色作为文字和边框颜色
 * @param {Color} $color - 按钮的主题颜色
 */
@mixin colorBtn($color) {
  background: $color;

  &:hover {
    color: $color;

    &:before,
    &:after {
      background: $color;
    }
  }
}
```

**设计理念:**
- 默认状态: 使用传入颜色作为背景色
- 悬停状态: 背景变为白色,颜色作为文字和边框色
- 伪元素支持: 可配合 `:before` 和 `:after` 创建边框动画

#### 预定义按钮样式

项目提供了7种预定义的彩色按钮样式:

```scss
.blue-btn {
  @include colorBtn($blue);        // 蓝色按钮 #324157
}

.light-blue-btn {
  @include colorBtn($light-blue);  // 浅蓝色 #3a71a8
}

.red-btn {
  @include colorBtn($red);         // 红色按钮 #c03639
}

.pink-btn {
  @include colorBtn($pink);        // 粉色按钮 #e65d6e
}

.green-btn {
  @include colorBtn($green);       // 绿色按钮 #30b08f
}

.tiffany-btn {
  @include colorBtn($tiffany);     // 蒂芙尼蓝 #4ab7bd
}

.yellow-btn {
  @include colorBtn($yellow);      // 黄色按钮 #fec171
}
```

#### 使用示例

```vue
<template>
  <div class="button-group">
    <button class="pan-btn blue-btn">蓝色按钮</button>
    <button class="pan-btn light-blue-btn">浅蓝色按钮</button>
    <button class="pan-btn red-btn">红色按钮</button>
    <button class="pan-btn pink-btn">粉色按钮</button>
    <button class="pan-btn green-btn">绿色按钮</button>
    <button class="pan-btn tiffany-btn">蒂芙尼蓝按钮</button>
    <button class="pan-btn yellow-btn">黄色按钮</button>
  </div>
</template>

<style lang="scss" scoped>
.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
```

### pan-btn 动画按钮

`pan-btn` 是一个带有上下边框动画效果的按钮基础类,提供独特的交互体验。

#### 样式定义

```scss
/**
 * 基础按钮样式类
 * 定义了所有按钮的共同样式属性和悬停效果
 * 包含独特的上下边框动画效果
 */
.pan-btn {
  font-size: 14px;
  color: #fff;
  padding: 14px 36px;
  border-radius: 8px;
  border: none;
  outline: none;
  transition: 600ms ease all;
  position: relative;
  display: inline-block;

  &:hover {
    background: #fff;

    &:before,
    &:after {
      width: 100%;
      transition: 600ms ease all;
    }
  }

  // 上边框线伪元素
  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 2px;
    width: 0;
    transition: 400ms ease all;
  }

  // 下边框线伪元素
  &::after {
    right: inherit;
    top: inherit;
    left: 0;
    bottom: 0;
  }
}
```

#### 动画原理

1. **初始状态**:
   - 按钮显示背景色
   - 上下伪元素宽度为0(不可见)

2. **悬停状态**:
   - 背景变为白色
   - 上边框从右向左展开
   - 下边框从左向右展开
   - 形成动态边框效果

3. **时间曲线**:
   - 背景过渡: 600ms
   - 边框展开: 600ms
   - 使用 `ease` 缓动函数

#### 使用示例

```vue
<template>
  <div class="demo-container">
    <button class="pan-btn blue-btn">
      悬停查看动画效果
    </button>

    <button class="pan-btn green-btn" @click="handleClick">
      点击执行操作
    </button>
  </div>
</template>

<script lang="ts" setup>
const handleClick = () => {
  console.log('按钮被点击')
}
</script>

<style lang="scss" scoped>
.demo-container {
  padding: 40px;
  background: var(--bg-level-1);
  display: flex;
  gap: 20px;
}
</style>
```

### custom-button 简洁按钮

`custom-button` 提供更简单的按钮样式,不带动画效果,适用于需要简洁风格的场景。

#### 样式定义

```scss
/**
 * 自定义按钮基础样式
 * 提供更简单的按钮样式，不带动画效果
 */
.custom-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;

  &:hover {
    color: var(--primary-color);
    border-color: var(--primary-color-light);
    background: var(--primary-color-lighter);
  }

  &:active {
    color: var(--primary-color-active);
    border-color: var(--primary-color-active);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
```

#### 使用场景

- 表单提交按钮
- 工具栏按钮
- 对话框操作按钮
- 简洁风格的界面

#### 使用示例

```vue
<template>
  <div class="toolbar">
    <button class="custom-button">新增</button>
    <button class="custom-button">编辑</button>
    <button class="custom-button">删除</button>
    <button class="custom-button" disabled>禁用</button>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--bg-level-1);
  border-radius: 4px;
}
</style>
```

### 自定义按钮样式

基于混合宏创建自定义按钮:

```scss
// 创建紫色按钮
.purple-btn {
  @include colorBtn(#9c27b0);
}

// 创建橙色按钮
.orange-btn {
  @include colorBtn(#ff9800);
}

// 创建渐变按钮
.gradient-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px 36px;
  border-radius: 8px;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
}
```

## 过渡动画

### fade 淡入淡出

基础的淡入淡出效果,适用于大多数元素的显示/隐藏:

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

**使用示例:**

```vue
<template>
  <transition name="fade">
    <div v-if="visible" class="content">
      淡入淡出的内容
    </div>
  </transition>

  <button @click="visible = !visible">切换显示</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(true)
</script>
```

### fade-transform 淡入淡出+位移

结合淡入淡出和水平位移的过渡效果:

```scss
.fade-transform-move,
.fade-transform-leave-active,
.fade-transform-enter-active {
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

**动画特点:**
- 进入: 从左侧30px淡入
- 离开: 向右侧30px淡出
- 时长: 0.6s (慢速)

**使用示例:**

```vue
<template>
  <transition name="fade-transform">
    <div v-if="show" class="message">
      <el-icon><InfoFilled /></el-icon>
      <span>这是一条提示消息</span>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(true)

setTimeout(() => {
  show.value = false
}, 3000)
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-level-1);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
```

### breadcrumb 面包屑动画

专为面包屑导航设计的过渡效果:

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
  position: absolute;
}
```

**设计说明:**
- 新项进入时从右侧20px淡入
- 旧项离开时向右侧20px淡出
- 使用绝对定位避免布局抖动
- 支持列表项移动动画

**使用示例:**

```vue
<template>
  <div class="breadcrumb-container">
    <transition-group name="breadcrumb" tag="div" class="breadcrumb-list">
      <span
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
        class="breadcrumb-item"
      >
        <span @click="handleClick(item)">{{ item.title }}</span>
        <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
      </span>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Breadcrumb {
  path: string
  title: string
}

const breadcrumbs = ref<Breadcrumb[]>([
  { path: '/', title: '首页' },
  { path: '/system', title: '系统管理' },
  { path: '/system/user', title: '用户管理' }
])

const handleClick = (item: Breadcrumb) => {
  const index = breadcrumbs.value.findIndex(b => b.path === item.path)
  breadcrumbs.value = breadcrumbs.value.slice(0, index + 1)
}
</script>

<style lang="scss" scoped>
.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-item {
  cursor: pointer;
  color: var(--text-color-regular);

  &:last-child {
    color: var(--text-color-primary);
    font-weight: 500;
  }

  .separator {
    margin: 0 8px;
    color: var(--text-color-placeholder);
  }
}
</style>
```

## 对话框动画

### 现代化缩放效果

对话框使用现代化的缩放动画,提供流畅的打开/关闭体验:

```scss
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-open 0.2s cubic-bezier(0.32, 0.14, 0.15, 0.86);

    .el-select__selected-item {
      display: inline-block;
    }
  }
}

.dialog-fade-leave-active {
  animation: fade-out 0.2s linear;

  .el-dialog:not(.is-draggable) {
    animation: dialog-close 0.5s;
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

@keyframes fade-out {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
```

**动画特点:**
- 打开: 从0.2倍缩放到正常大小,同时淡入
- 关闭: 从正常大小缩放到0.2倍,同时淡出
- 使用三次贝塞尔曲线实现流畅效果
- 遮罩层独立淡出动画

**使用示例:**

```vue
<template>
  <el-dialog
    v-model="dialogVisible"
    title="提示"
    width="500px"
    :before-close="handleClose"
  >
    <div class="dialog-content">
      <p>这是一个使用现代化缩放动画的对话框</p>
      <p>打开和关闭时会有流畅的缩放效果</p>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>

  <el-button type="primary" @click="dialogVisible = true">
    打开对话框
  </el-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dialogVisible = ref(false)

const handleClose = (done: () => void) => {
  // 关闭前的确认逻辑
  done()
}

const handleConfirm = () => {
  dialogVisible.value = false
  // 确认操作
}
</script>

<style lang="scss" scoped>
.dialog-content {
  padding: 20px 0;

  p {
    margin-bottom: 12px;
    color: var(--text-color-regular);
    line-height: 1.6;
  }
}
</style>
```

## 菜单动画

### 菜单展开/收起

```scss
.el-menu.el-menu--inline {
  transition: max-height 0.26s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.el-sub-menu__title,
.el-menu-item {
  transition: background-color 0s !important;
}
```

**优化说明:**
- 使用 `max-height` 过渡实现平滑展开
- 使用 `cubic-bezier` 曲线优化动画曲线
- 禁用菜单项背景色过渡,提升性能

## 图标动画

### 关键帧动画定义

项目提供了多种图标动画关键帧:

#### shake 抖动动画

```scss
@keyframes shake {
  0% {
    transform: rotate(0);
  }

  25% {
    transform: rotate(-5deg);
  }

  50% {
    transform: rotate(5deg);
  }

  75% {
    transform: rotate(-5deg);
  }

  100% {
    transform: rotate(0);
  }
}
```

#### rotate180 旋转动画

```scss
@keyframes rotate180 {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(180deg);
  }
}
```

#### moveUp 上下移动动画

```scss
@keyframes moveUp {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }

  100% {
    transform: translateY(0);
  }
}
```

#### expand 放大动画

```scss
@keyframes expand {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
```

#### shrink 缩小动画

```scss
@keyframes shrink {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}
```

#### breathing 呼吸动画

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

### 图标悬停动画类

预定义的图标悬停动画类,可直接应用于图标元素:

```scss
.icon-hover-shake {
  &:hover {
    animation: shake 0.5s ease-in-out;
  }
}

.icon-hover-rotate180 {
  transform-origin: 50% 50% !important;

  &:hover {
    animation: rotate180 0.4s cubic-bezier(0.4, 0, 0.6, 1);
  }
}

.icon-hover-moveUp {
  &:hover {
    animation: moveUp 0.4s ease-in-out;
  }
}

.icon-hover-expand {
  &:hover {
    animation: expand 0.6s ease-in-out;
  }
}

.icon-hover-shrink {
  &:hover {
    animation: shrink 0.6s ease-in-out;
  }
}

.icon-hover-breathing {
  animation: breathing 1.5s ease-in-out infinite;
}
```

### 使用示例

```vue
<template>
  <div class="icon-demo">
    <el-icon class="icon-hover-shake" :size="24">
      <Bell />
    </el-icon>

    <el-icon class="icon-hover-rotate180" :size="24">
      <RefreshRight />
    </el-icon>

    <el-icon class="icon-hover-moveUp" :size="24">
      <Upload />
    </el-icon>

    <el-icon class="icon-hover-expand" :size="24">
      <Search />
    </el-icon>

    <el-icon class="icon-hover-shrink" :size="24">
      <Close />
    </el-icon>

    <el-icon class="icon-hover-breathing" :size="24">
      <Loading />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
import { Bell, RefreshRight, Upload, Search, Close, Loading } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  gap: 32px;
  padding: 40px;
  background: var(--bg-level-1);
  border-radius: 8px;

  .el-icon {
    cursor: pointer;
    color: var(--text-color-primary);
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>
```

## 徽章动画

### breathe 呼吸动画

用于徽章的呼吸效果,吸引用户注意:

```scss
@keyframes breathe {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }

  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}
```

**使用示例:**

```vue
<template>
  <div class="badge-demo">
    <el-badge :value="12" class="item">
      <el-button>评论</el-button>
    </el-badge>

    <el-badge :value="3" class="item breathing-badge">
      <el-button>新消息</el-button>
    </el-badge>
  </div>
</template>

<style lang="scss" scoped>
.badge-demo {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.breathing-badge {
  :deep(.el-badge__content) {
    animation: breathe 2s ease-in-out infinite;
  }
}
</style>
```

## 组件样式最佳实践

### 1. 使用混合宏创建一致的组件

```scss
// 定义卡片混合宏
@mixin card-base {
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all var(--duration-normal);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

// 应用到不同组件
.info-card {
  @include card-base;
}

.user-card {
  @include card-base;
  display: flex;
  align-items: center;
}
```

### 2. 结合主题变量

```scss
.themed-button {
  background: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  border: none;
  transition: all var(--duration-normal);

  &:hover {
    background: var(--primary-color-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-color), 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}
```

### 3. 响应式组件样式

```scss
.responsive-card {
  padding: 12px;
  font-size: 14px;

  @media (min-width: $sm) {
    padding: 16px;
  }

  @media (min-width: $md) {
    padding: 20px;
    font-size: 16px;
  }

  @media (min-width: $lg) {
    padding: 24px;
  }
}
```

### 4. 组件状态管理

```scss
.stateful-component {
  // 默认状态
  background: var(--bg-level-1);
  border: 1px solid var(--border-color);

  // 悬停状态
  &:hover {
    border-color: var(--primary-color-light);
  }

  // 激活状态
  &.is-active {
    background: var(--primary-color-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  // 禁用状态
  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  // 加载状态
  &.is-loading {
    position: relative;
    color: transparent;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid var(--primary-color);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### 5. 动画性能优化

```scss
.optimized-animation {
  // 使用 transform 而不是 position
  transform: translateX(0);
  transition: transform var(--duration-normal);
  will-change: transform;  // 提示浏览器优化

  &:hover {
    transform: translateX(10px);
  }

  // 动画完成后移除 will-change
  &:not(:hover) {
    will-change: auto;
  }
}
```

## 常见问题

### 1. 按钮动画不流畅?

**问题原因:**
- 使用了 `left`/`top` 等触发回流的属性
- 动画时间过长或过短
- 未使用硬件加速

**解决方案:**

```scss
/* ❌ 不推荐 - 触发回流 */
.button {
  &:hover {
    left: 10px;
  }
}

/* ✅ 推荐 - 使用 transform */
.button {
  transition: transform 0.3s ease;
  will-change: transform;

  &:hover {
    transform: translateX(10px);
  }
}
```

### 2. 对话框动画卡顿?

**问题原因:**
- 同时动画化多个属性
- 遮罩层和对话框动画冲突

**解决方案:**

```scss
/* ✅ 分离遮罩和对话框动画 */
.dialog-mask {
  animation: fade-out 0.2s linear;  // 快速淡出
}

.dialog-content {
  animation: dialog-close 0.5s;  // 稍慢的缩放
}
```

### 3. 图标动画重复触发?

**问题原因:**
- 鼠标快速移入移出
- 动画未完成就重新触发

**解决方案:**

```scss
.icon {
  animation: none;  // 重置动画

  &:hover {
    animation: shake 0.5s ease-in-out;
    animation-fill-mode: both;  // 保持结束状态
  }

  // 防止快速重复触发
  &:not(:hover) {
    animation: none;
  }
}
```

### 4. 过渡动画不生效?

**问题原因:**
- 未设置过渡属性
- display 属性变化
- 初始值和结束值相同

**解决方案:**

```vue
<template>
  <!-- ❌ 错误 - display 变化无过渡 -->
  <div v-show="visible" class="content">内容</div>

  <!-- ✅ 正确 - 使用 transition 组件 -->
  <transition name="fade">
    <div v-if="visible" class="content">内容</div>
  </transition>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## 总结

RuoYi-Plus-UniApp 的组件样式系统提供了完整的组件样式解决方案:

### 核心优势

1. **统一的按钮系统** - colorBtn混合宏、pan-btn动画按钮、custom-button简洁按钮
2. **丰富的过渡动画** - fade、fade-transform、breadcrumb等多种过渡效果
3. **现代化对话框动画** - 流畅的缩放动画,提升用户体验
4. **多样的图标动画** - 6种预定义动画效果,增强交互反馈
5. **性能优化** - 使用transform、合理使用will-change、避免回流
6. **主题集成** - 所有组件样式支持主题切换

### 开发建议

1. **优先使用混合宏** - 复用通用组件样式,保持一致性
2. **性能第一** - 使用transform代替position,避免触发回流
3. **主题集成** - 使用CSS变量支持主题切换
4. **适度动画** - 动画时长控制在0.2-0.6s之间
5. **响应式考虑** - 移动端简化或禁用复杂动画
6. **语义化类名** - 使用BEM命名规范,提高可维护性

通过合理使用组件样式系统,可以快速构建交互流畅、视觉统一的用户界面组件。
