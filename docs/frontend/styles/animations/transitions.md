# 过渡动画

过渡动画用于页面切换、元素显示隐藏等场景,提供流畅的视觉过渡效果。系统提供了完整的过渡动画体系,包括淡入淡出、位移变换、对话框缩放、图标悬停等多种动画效果,以及现代化的主题切换圆形扩散动画。

## 介绍

过渡动画是提升用户体验的重要手段,它能让界面变化更加自然流畅,避免突兀的视觉跳跃。RuoYi-Plus-UniApp 前端项目提供了一套完整的过渡动画系统,涵盖了各种常见的交互场景。

**核心特性:**

- **丰富的动画类型** - 包括淡入淡出、位移变换、缩放、旋转等多种效果
- **统一的时长规范** - 使用 CSS 变量统一管理动画时长,保持一致性
- **Vue 过渡集成** - 完美集成 Vue 3 的 Transition 和 TransitionGroup 组件
- **现代化主题切换** - 使用 View Transition API 实现圆形扩散效果
- **高性能优化** - 优先使用 transform 和 opacity,避免重排重绘
- **图标悬停动画** - 提供6种图标悬停效果,增强交互反馈
- **对话框动画** - 现代化的对话框缩放打开效果
- **自定义扩展** - 易于自定义和扩展新的动画效果

## 动画时长规范

系统使用 CSS 变量统一管理所有动画时长,确保动画效果的一致性。

### 时长定义

```scss
// CSS 变量定义
:root {
  --duration-normal: 0.3s;  // 常规动画时长
  --duration-slow: 0.5s;    // 慢速动画时长
  --duration-fast: 0.2s;    // 快速动画时长
}
```

### 使用场景

| 时长变量 | 值 | 使用场景 |
|---------|-----|---------|
| `--duration-fast` | 0.2s | 快速反馈(按钮点击、开关切换) |
| `--duration-normal` | 0.3s | 常规过渡(淡入淡出、元素显示隐藏) |
| `--duration-slow` | 0.5s | 慢速过渡(位移变换、复杂动画) |

**使用示例:**

```scss
// 使用统一时长变量
.my-element {
  transition: opacity var(--duration-normal);
}

.my-complex-animation {
  transition: all var(--duration-slow);
}
```

**最佳实践:**

- 优先使用预定义的时长变量,不要随意设置时长
- 简单动画使用 `--duration-fast` 或 `--duration-normal`
- 复杂动画或需要强调的效果使用 `--duration-slow`
- 避免超过 0.5s 的动画,会让用户感觉迟缓

## 基础过渡动画

### 淡入淡出

最常用的过渡效果,通过改变透明度实现元素的平滑显示和隐藏。

**动画实现:**

```scss
// 淡入淡出效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal);  // 0.3s
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

**使用示例:**

```vue
<template>
  <div class="demo">
    <el-button @click="visible = !visible">
      切换显示
    </el-button>

    <transition name="fade">
      <div v-if="visible" class="content">
        这是淡入淡出的内容
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(true)
</script>

<style lang="scss" scoped>
.content {
  margin-top: 16px;
  padding: 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
}
</style>
```

**技术实现:**

- `fade-enter-active`: 元素进入时的过渡状态,定义 transition 属性
- `fade-leave-active`: 元素离开时的过渡状态,定义 transition 属性
- `fade-enter-from`: 元素进入前的初始状态,设置 `opacity: 0`
- `fade-leave-to`: 元素离开后的最终状态,设置 `opacity: 0`

**应用场景:**

- 通知消息的显示和隐藏
- 下拉菜单的展开和收起
- 模态框的打开和关闭
- 提示信息的显示和消失

### 淡入淡出 + 水平位移

结合透明度变化和水平位移,创造更有层次感的过渡效果。

**动画实现:**

```scss
// 淡入淡出 + 位移变换效果
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all var(--duration-slow);  // 0.5s
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);  // 从左侧进入
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);   // 向右侧离开
}
```

**使用示例:**

```vue
<template>
  <div class="demo">
    <el-button @click="show = !show">
      切换显示
    </el-button>

    <transition name="fade-transform">
      <div v-if="show" class="card">
        <h3>带位移的淡入淡出</h3>
        <p>从左侧滑入,向右侧滑出</p>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(true)
</script>

<style lang="scss" scoped>
.card {
  margin-top: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
```

**技术实现:**

- 同时改变 `opacity` 和 `transform` 属性
- 进入时从左侧 `-30px` 位置滑入,同时透明度从 0 到 1
- 离开时向右侧 `30px` 位置滑出,同时透明度从 1 到 0
- 使用 `--duration-slow` 较慢的速度,让位移效果更明显

**应用场景:**

- 侧边栏的展开和收起
- 列表项的添加和删除
- 内容区域的切换
- 页面元素的动态加载

**自定义方向:**

```scss
// 从右侧进入
.fade-transform-right-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

// 从上方进入
.fade-transform-top-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

// 从下方进入
.fade-transform-bottom-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
```

### 面包屑过渡

专为面包屑导航设计的过渡效果,支持多个元素的列表过渡。

**动画实现:**

```scss
// 面包屑过渡
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all var(--duration-slow);
}

.breadcrumb-enter-from,
.breadcrumb-leave-to {
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

**使用示例:**

```vue
<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item
        v-for="(item, index) in levelList"
        :key="item.path"
      >
        <span
          v-if="item.redirect === 'noRedirect' || index === levelList.length - 1"
          class="no-redirect"
        >
          {{ item.meta.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">
          {{ item.meta.title }}
        </a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 面包屑列表
const levelList = computed(() => {
  if (route.path.startsWith('/redirect/')) return []

  let matched = route.matched.filter(
    item => item.meta && item.meta.title && item.meta.breadcrumb !== false
  )

  // 添加首页
  const first = matched[0]
  if (first && first.path !== '/index') {
    matched = [
      { path: '/index', meta: { title: '首页' } }
    ].concat(matched)
  }

  return matched
})

// 处理面包屑点击
const handleLink = (item: any) => {
  const { redirect, path } = item
  if (redirect) {
    router.push(redirect)
    return
  }
  router.push(path)
}
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  margin-left: 8px;

  .no-redirect {
    color: var(--el-text-color-secondary);
    cursor: text;
  }

  a {
    color: var(--el-text-color-regular);
    font-weight: normal;
    text-decoration: none;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
```

**技术实现:**

- 使用 `<transition-group>` 处理列表过渡
- `.breadcrumb-move` 定义元素位置变化时的过渡效果
- `.breadcrumb-leave-active` 使用绝对定位,避免影响其他元素布局
- 每个面包屑项需要唯一的 `key` 属性

**应用场景:**

- 面包屑导航的路由变化
- 标签页的添加和删除
- 列表项的动态更新
- 多步骤表单的导航

## 对话框动画

现代化的对话框打开和关闭动画,使用缩放效果提升视觉体验。

### 对话框缩放动画

**动画实现:**

```scss
// 对话框打开动画
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-open 0.2s cubic-bezier(0.32, 0.14, 0.15, 0.86);

    // 修复 el-dialog 动画后宽度不自适应问题
    .el-select__selected-item {
      display: inline-block;
    }
  }
}

// 对话框关闭动画
.dialog-fade-leave-active {
  animation: fade-out 0.2s linear;

  .el-dialog:not(.is-draggable) {
    animation: dialog-close 0.5s;
  }
}

// 对话框打开关键帧
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

// 对话框关闭关键帧
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

// 遮罩层淡出动画
@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
```

**使用示例:**

```vue
<template>
  <div class="demo">
    <el-button type="primary" @click="dialogVisible = true">
      打开对话框
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      title="对话框标题"
      width="500px"
    >
      <div class="dialog-content">
        <p>这是对话框内容</p>
        <p>打开时从中心缩放放大</p>
        <p>关闭时向中心缩放缩小</p>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleConfirm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)

const handleConfirm = () => {
  ElMessage.success('确认成功')
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.dialog-content {
  padding: 20px 0;

  p {
    margin: 10px 0;
    line-height: 1.6;
  }
}
</style>
```

**技术实现:**

- 打开时使用 `cubic-bezier(0.32, 0.14, 0.15, 0.86)` 缓动函数,创造弹性效果
- 从 `scale(0.2)` 缩放到 `scale(1)`,同时透明度从 0 到 1
- 关闭时反向播放动画,从 `scale(1)` 缩放到 `scale(0.2)`
- 遮罩层使用独立的淡出动画
- 排除可拖拽对话框 `.is-draggable`,避免拖拽冲突

**注意事项:**

- 对话框动画只应用于非可拖拽对话框
- 修复了 Element Plus 对话框动画后宽度不自适应的问题
- 打开动画较快 (0.2s),关闭动画较慢 (0.5s),符合用户预期

## 图标悬停动画

提供6种图标悬停效果,增强交互反馈。

### 抖动动画

鼠标悬停时图标左右抖动,适用于提示性图标。

**动画实现:**

```scss
// 抖动动画关键帧
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

// 悬停时应用抖动动画
.icon-hover-shake {
  &:hover {
    animation: shake 0.5s ease-in-out;
  }
}
```

**使用示例:**

```vue
<template>
  <div class="icon-demo">
    <el-icon class="icon-hover-shake" :size="32">
      <Bell />
    </el-icon>

    <el-icon class="icon-hover-shake" :size="32">
      <Warning />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
import { Bell, Warning } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  gap: 20px;

  .el-icon {
    cursor: pointer;
    color: var(--el-color-primary);
  }
}
</style>
```

### 180度旋转动画

鼠标悬停时图标旋转180度,适用于箭头、展开/收起图标。

**动画实现:**

```scss
// 180度旋转动画关键帧
@keyframes rotate180 {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(180deg);
  }
}

// 悬停时应用旋转动画
.icon-hover-rotate180 {
  transform-origin: 50% 50% !important;

  &:hover {
    animation: rotate180 0.4s cubic-bezier(0.4, 0, 0.6, 1);
  }
}
```

**使用示例:**

```vue
<template>
  <div class="icon-demo">
    <el-icon class="icon-hover-rotate180" :size="32">
      <ArrowDown />
    </el-icon>

    <el-icon class="icon-hover-rotate180" :size="32">
      <Refresh />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
import { ArrowDown, Refresh } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  gap: 20px;

  .el-icon {
    cursor: pointer;
    color: var(--el-color-success);
  }
}
</style>
```

### 上下移动动画

鼠标悬停时图标上下移动,适用于上传、下载图标。

**动画实现:**

```scss
// 上下移动动画关键帧
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

// 悬停时应用移动动画
.icon-hover-moveUp {
  &:hover {
    animation: moveUp 0.4s ease-in-out;
  }
}
```

**使用示例:**

```vue
<template>
  <div class="icon-demo">
    <el-icon class="icon-hover-moveUp" :size="32">
      <Upload />
    </el-icon>

    <el-icon class="icon-hover-moveUp" :size="32">
      <Download />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
import { Upload, Download } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  gap: 20px;

  .el-icon {
    cursor: pointer;
    color: var(--el-color-warning);
  }
}
</style>
```

### 放大动画

鼠标悬停时图标放大,适用于强调性图标。

**动画实现:**

```scss
// 放大动画关键帧
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

// 悬停时应用放大动画
.icon-hover-expand {
  &:hover {
    animation: expand 0.6s ease-in-out;
  }
}
```

**使用示例:**

```vue
<template>
  <div class="icon-demo">
    <el-icon class="icon-hover-expand" :size="32">
      <Star />
    </el-icon>

    <el-icon class="icon-hover-expand" :size="32">
      <Like />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
import { Star } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  gap: 20px;

  .el-icon {
    cursor: pointer;
    color: var(--el-color-danger);
  }
}
</style>
```

### 缩小动画

鼠标悬停时图标缩小再恢复,创造按压效果。

**动画实现:**

```scss
// 缩小动画关键帧
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

// 悬停时应用缩小动画
.icon-hover-shrink {
  &:hover {
    animation: shrink 0.6s ease-in-out;
  }
}
```

**使用示例:**

```vue
<template>
  <div class="icon-demo">
    <el-icon class="icon-hover-shrink" :size="32">
      <Delete />
    </el-icon>

    <el-icon class="icon-hover-shrink" :size="32">
      <Close />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
import { Delete, Close } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  gap: 20px;

  .el-icon {
    cursor: pointer;
    color: var(--el-color-info);
  }
}
</style>
```

### 呼吸动画

持续的呼吸效果,适用于状态指示图标。

**动画实现:**

```scss
// 呼吸动画关键帧
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

// 应用呼吸动画(无需悬停,持续播放)
.icon-hover-breathing {
  animation: breathing 1.5s ease-in-out infinite;
}
```

**使用示例:**

```vue
<template>
  <div class="icon-demo">
    <el-icon class="icon-hover-breathing" :size="32">
      <VideoPlay />
    </el-icon>

    <el-icon class="icon-hover-breathing" :size="32">
      <Position />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
import { VideoPlay, Position } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  gap: 20px;

  .el-icon {
    color: var(--el-color-success);
  }
}
</style>
```

### 图标动画对比

| 动画类名 | 效果 | 触发方式 | 时长 | 适用场景 |
|---------|------|---------|------|---------|
| `icon-hover-shake` | 左右抖动 | 悬停 | 0.5s | 通知、警告图标 |
| `icon-hover-rotate180` | 180度旋转 | 悬停 | 0.4s | 箭头、展开/收起 |
| `icon-hover-moveUp` | 上下移动 | 悬停 | 0.4s | 上传、下载图标 |
| `icon-hover-expand` | 放大 | 悬停 | 0.6s | 点赞、收藏图标 |
| `icon-hover-shrink` | 缩小 | 悬停 | 0.6s | 删除、关闭图标 |
| `icon-hover-breathing` | 呼吸效果 | 自动 | 1.5s | 状态指示、播放中 |

## 徽章呼吸动画

用于徽章数字的呼吸效果,吸引用户注意。

**动画实现:**

```scss
// 徽章呼吸动画关键帧
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
      <el-button>消息</el-button>
    </el-badge>

    <el-badge :value="3" class="item breathing-badge">
      <el-button>通知</el-button>
    </el-badge>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.badge-demo {
  display: flex;
  gap: 30px;

  .item {
    margin-top: 10px;
  }

  .breathing-badge {
    :deep(.el-badge__content) {
      animation: breathe 2s ease-in-out infinite;
    }
  }
}
</style>
```

**应用场景:**

- 未读消息数量徽章
- 待处理任务提醒
- 新功能提示
- 状态指示器

## 菜单动画优化

针对侧边栏菜单的动画优化,提升交互体验。

**动画实现:**

```scss
// 菜单展开/收起动画优化
.el-menu.el-menu--inline {
  transition: max-height 0.26s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

// 菜单项悬停动画优化(禁用背景色过渡,避免卡顿)
.el-sub-menu__title,
.el-menu-item {
  transition: background-color 0s !important;
}
```

**技术说明:**

- 子菜单展开/收起使用 `max-height` 过渡,配合 Material Design 缓动曲线
- 菜单项悬停背景色变化禁用过渡,避免大量菜单项同时悬停时的性能问题
- 使用 `!important` 覆盖 Element Plus 默认样式

**性能优化:**

- 只对子菜单的高度变化应用过渡
- 背景色变化即时生效,避免累积的过渡计算
- 适用于包含大量菜单项的侧边栏

## 主题切换动画

使用 View Transition API 实现现代化的圆形扩散主题切换效果。

### 圆形扩散动画

**动画实现:**

```scss
// 定义动画时长
$theme-animation-duration: 0.5s;

html {
  // View Transition 样式 - 重置默认动画
  &::view-transition-old(root),
  &::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }

  // 亮色模式 -> 暗黑模式: 新层(暗黑)从圆心扩散
  &::view-transition-new(root) {
    animation: theme-clip-in $theme-animation-duration ease-in both;
    z-index: 9999;
  }

  &::view-transition-old(root) {
    z-index: 1;
  }

  // 暗黑模式 -> 亮色模式: 旧层(暗黑)从外向圆心收缩
  &.dark {
    &::view-transition-old(root) {
      animation: theme-clip-out $theme-animation-duration ease-in both;
      z-index: 9999;
    }

    &::view-transition-new(root) {
      animation: none;
      z-index: 1;
    }
  }
}

// 定义圆形扩散动画 (从小到大)
@keyframes theme-clip-in {
  from {
    clip-path: circle(0% at var(--theme-x) var(--theme-y));
  }
  to {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }
}

// 定义圆形收缩动画 (从大到小)
@keyframes theme-clip-out {
  from {
    clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y));
  }
  to {
    clip-path: circle(0% at var(--theme-x) var(--theme-y));
  }
}
```

### JavaScript 实现

**主题切换逻辑:**

```typescript
/**
 * 切换主题(带动画效果)
 * @param isDark 是否切换为暗黑模式
 */
const toggleTheme = async (isDark: boolean) => {
  // 检查浏览器是否支持 View Transition API
  if (!document.startViewTransition) {
    // 不支持则直接切换,无动画
    applyTheme(isDark)
    return
  }

  // 获取点击位置作为动画圆心
  const x = event.clientX
  const y = event.clientY

  // 计算从圆心到页面最远角的距离作为动画半径
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // 设置 CSS 变量
  document.documentElement.style.setProperty('--theme-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-y', `${y}px`)
  document.documentElement.style.setProperty('--theme-r', `${endRadius}px`)

  // 执行 View Transition
  const transition = document.startViewTransition(() => {
    applyTheme(isDark)
  })

  await transition.ready
}

/**
 * 应用主题
 * @param isDark 是否为暗黑模式
 */
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
```

**使用示例:**

```vue
<template>
  <div class="theme-toggle">
    <el-button
      :icon="isDark ? Sunny : Moon"
      circle
      @click="handleToggleTheme"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

const isDark = ref(false)

const handleToggleTheme = (event: MouseEvent) => {
  // 获取点击位置
  const x = event.clientX
  const y = event.clientY

  // 计算动画半径
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // 设置 CSS 变量
  document.documentElement.style.setProperty('--theme-x', `${x}px`)
  document.documentElement.style.setProperty('--theme-y', `${y}px`)
  document.documentElement.style.setProperty('--theme-r', `${endRadius}px`)

  // 检查是否支持 View Transition API
  if (!document.startViewTransition) {
    isDark.value = !isDark.value
    applyTheme()
    return
  }

  // 执行主题切换动画
  const transition = document.startViewTransition(() => {
    isDark.value = !isDark.value
    applyTheme()
  })
}

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>

<style lang="scss" scoped>
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
```

**技术实现:**

- 使用 View Transition API 创建流畅的主题切换动画
- 通过 `clip-path: circle()` 实现圆形扩散效果
- 动画圆心为用户点击位置 (`--theme-x`, `--theme-y`)
- 动画半径计算到页面最远角的距离,确保完全覆盖
- 亮色→暗黑:新层从圆心扩散;暗黑→亮色:旧层向圆心收缩
- 不支持 API 的浏览器自动降级为无动画切换

**浏览器兼容性:**

- Chrome 111+
- Edge 111+
- Opera 97+
- Safari 18+
- Firefox 暂不支持(使用降级方案)

## 完整动画示例

### 综合过渡效果页面

演示多种过渡效果的综合应用。

```vue
<template>
  <div class="transitions-demo">
    <h2>过渡动画演示</h2>

    <!-- 淡入淡出 -->
    <section class="demo-section">
      <h3>淡入淡出</h3>
      <el-button @click="visible1 = !visible1">
        切换显示
      </el-button>
      <transition name="fade">
        <div v-if="visible1" class="demo-box">
          淡入淡出效果
        </div>
      </transition>
    </section>

    <!-- 淡入淡出 + 位移 -->
    <section class="demo-section">
      <h3>淡入淡出 + 位移</h3>
      <el-button @click="visible2 = !visible2">
        切换显示
      </el-button>
      <transition name="fade-transform">
        <div v-if="visible2" class="demo-box">
          从左侧滑入,向右侧滑出
        </div>
      </transition>
    </section>

    <!-- 面包屑过渡 -->
    <section class="demo-section">
      <h3>面包屑过渡</h3>
      <el-button @click="addBreadcrumb">
        添加
      </el-button>
      <el-button @click="removeBreadcrumb">
        删除
      </el-button>
      <div class="breadcrumb-list">
        <transition-group name="breadcrumb">
          <span
            v-for="item in breadcrumbs"
            :key="item.id"
            class="breadcrumb-item"
          >
            {{ item.name }}
          </span>
        </transition-group>
      </div>
    </section>

    <!-- 图标悬停动画 -->
    <section class="demo-section">
      <h3>图标悬停动画</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <el-icon class="icon-hover-shake" :size="32">
            <Bell />
          </el-icon>
          <span>抖动</span>
        </div>
        <div class="icon-item">
          <el-icon class="icon-hover-rotate180" :size="32">
            <Refresh />
          </el-icon>
          <span>旋转</span>
        </div>
        <div class="icon-item">
          <el-icon class="icon-hover-moveUp" :size="32">
            <Upload />
          </el-icon>
          <span>上移</span>
        </div>
        <div class="icon-item">
          <el-icon class="icon-hover-expand" :size="32">
            <Star />
          </el-icon>
          <span>放大</span>
        </div>
        <div class="icon-item">
          <el-icon class="icon-hover-shrink" :size="32">
            <Delete />
          </el-icon>
          <span>缩小</span>
        </div>
        <div class="icon-item">
          <el-icon class="icon-hover-breathing" :size="32">
            <VideoPlay />
          </el-icon>
          <span>呼吸</span>
        </div>
      </div>
    </section>

    <!-- 对话框动画 -->
    <section class="demo-section">
      <h3>对话框动画</h3>
      <el-button type="primary" @click="dialogVisible = true">
        打开对话框
      </el-button>
      <el-dialog
        v-model="dialogVisible"
        title="对话框标题"
        width="500px"
      >
        <p>这是对话框内容</p>
        <p>打开时从中心缩放放大</p>
        <p>关闭时向中心缩放缩小</p>
        <template #footer>
          <el-button @click="dialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="dialogVisible = false">
            确定
          </el-button>
        </template>
      </el-dialog>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  Bell,
  Refresh,
  Upload,
  Star,
  Delete,
  VideoPlay
} from '@element-plus/icons-vue'

// 淡入淡出状态
const visible1 = ref(true)
const visible2 = ref(true)

// 对话框状态
const dialogVisible = ref(false)

// 面包屑数据
const breadcrumbs = ref([
  { id: 1, name: '首页' },
  { id: 2, name: '系统管理' },
  { id: 3, name: '用户管理' }
])

let nextId = 4

// 添加面包屑
const addBreadcrumb = () => {
  breadcrumbs.value.push({
    id: nextId++,
    name: `菜单${nextId - 1}`
  })
}

// 删除面包屑
const removeBreadcrumb = () => {
  if (breadcrumbs.value.length > 1) {
    breadcrumbs.value.pop()
  }
}
</script>

<style lang="scss" scoped>
.transitions-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: 600;
  }

  .demo-section {
    margin-bottom: 40px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    h3 {
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .demo-box {
      margin-top: 16px;
      padding: 20px;
      background: var(--el-color-primary-light-9);
      border-radius: 4px;
      color: var(--el-color-primary);
      font-weight: 500;
    }

    .breadcrumb-list {
      margin-top: 16px;
      padding: 12px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
      min-height: 40px;

      .breadcrumb-item {
        display: inline-block;
        margin-right: 12px;
        padding: 6px 12px;
        background: white;
        border-radius: 4px;
        font-size: 14px;

        &::after {
          content: '/';
          margin-left: 12px;
          color: var(--el-text-color-secondary);
        }

        &:last-child::after {
          display: none;
        }
      }
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 20px;
      margin-top: 16px;

      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        background: var(--el-fill-color-light);
        border-radius: 8px;
        cursor: pointer;

        &:hover {
          background: var(--el-fill-color);
        }

        .el-icon {
          color: var(--el-color-primary);
        }

        span {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>
```

## 性能优化

### 动画性能最佳实践

1. **优先使用 transform 和 opacity**

```scss
// ✅ 推荐:使用 transform 和 opacity
.good-animation {
  transition: transform 0.3s, opacity 0.3s;

  &.active {
    transform: translateX(100px);
    opacity: 0.5;
  }
}

// ❌ 避免:使用会触发重排的属性
.bad-animation {
  transition: left 0.3s, width 0.3s;

  &.active {
    left: 100px;
    width: 200px;
  }
}
```

2. **使用 will-change 提示浏览器**

```scss
// 对于复杂动画,使用 will-change 提示浏览器优化
.complex-animation {
  will-change: transform, opacity;
  transition: transform 0.3s, opacity 0.3s;
}

// 动画结束后移除 will-change
.complex-animation.finished {
  will-change: auto;
}
```

3. **避免同时动画大量元素**

```vue
<template>
  <!-- ❌ 避免:同时动画所有列表项 -->
  <transition-group name="list">
    <div v-for="item in 1000" :key="item">
      {{ item }}
    </div>
  </transition-group>

  <!-- ✅ 推荐:使用虚拟滚动 + 有限动画 -->
  <virtual-list :items="items">
    <template #item="{ item }">
      <transition name="fade">
        <div :key="item.id">{{ item.name }}</div>
      </transition>
    </template>
  </virtual-list>
</template>
```

4. **使用 requestAnimationFrame**

```typescript
// ✅ 推荐:使用 RAF 控制动画时机
const animateElement = (element: HTMLElement) => {
  const animate = () => {
    // 更新动画状态
    element.style.transform = `translateX(${progress}px)`

    if (progress < 100) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}
```

5. **减少动画时长**

```scss
// 动画时长建议
:root {
  --duration-fast: 0.2s;    // 简单动画
  --duration-normal: 0.3s;  // 常规动画
  --duration-slow: 0.5s;    // 复杂动画
}

// ❌ 避免过长的动画
.slow-animation {
  transition: all 1s;  // 太慢,影响体验
}
```

### 性能监控

**使用 Chrome DevTools 监控动画性能:**

```typescript
// 开启 FPS 监控
const showFPS = () => {
  const stats = new Stats()
  stats.showPanel(0) // 0: fps, 1: ms, 2: mb
  document.body.appendChild(stats.dom)

  function animate() {
    stats.begin()
    // 动画代码
    stats.end()
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}
```

**检查动画触发的重排重绘:**

1. 打开 Chrome DevTools
2. 切换到 Performance 标签
3. 勾选 Screenshots 和 Enable advanced paint instrumentation
4. 录制动画过程
5. 查看 Frames 和 Paint 信息

### 降级策略

**为不支持高级特性的浏览器提供降级方案:**

```typescript
// 检查是否支持 View Transition API
const supportsViewTransition = () => {
  return 'startViewTransition' in document
}

// 主题切换降级
const toggleTheme = (isDark: boolean) => {
  if (supportsViewTransition()) {
    // 使用 View Transition API
    document.startViewTransition(() => {
      applyTheme(isDark)
    })
  } else {
    // 降级方案:直接切换,无动画
    applyTheme(isDark)
  }
}
```

```scss
// CSS 降级方案
@supports (clip-path: circle(0%)) {
  // 支持 clip-path 的现代浏览器
  .theme-transition {
    animation: theme-clip-in 0.5s;
  }
}

@supports not (clip-path: circle(0%)) {
  // 不支持 clip-path 的旧浏览器
  .theme-transition {
    animation: fade 0.5s;
  }
}
```

## 自定义动画

### 创建自定义过渡效果

**步骤1:定义动画关键帧**

```scss
// 定义自定义动画关键帧
@keyframes slide-in-right {
  0% {
    opacity: 0;
    transform: translateX(50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out-right {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(50px);
  }
}
```

**步骤2:定义 Vue 过渡类名**

```scss
// 定义 Vue 过渡类
.slide-right-enter-active {
  animation: slide-in-right var(--duration-normal);
}

.slide-right-leave-active {
  animation: slide-out-right var(--duration-normal);
}
```

**步骤3:在组件中使用**

```vue
<template>
  <transition name="slide-right">
    <div v-if="visible">
      从右侧滑入的内容
    </div>
  </transition>
</template>
```

### 组合多个动画效果

```scss
// 组合淡入 + 缩放 + 旋转
@keyframes fancy-enter {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-180deg);
  }
  50% {
    transform: scale(1.1) rotate(-90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.fancy-enter-active {
  animation: fancy-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 响应式动画

根据屏幕尺寸调整动画效果。

```scss
// 默认动画
.responsive-animation {
  transition: transform var(--duration-normal);

  &.active {
    transform: translateX(100px);
  }
}

// 移动端减小位移距离
@media (max-width: 768px) {
  .responsive-animation.active {
    transform: translateX(30px);
  }
}

// 移动端禁用复杂动画,提升性能
@media (max-width: 768px) {
  .complex-animation {
    animation: none !important;
  }
}
```

## 常见问题

### 1. 动画卡顿或不流畅

**问题原因:**
- 动画属性触发了重排(reflow)
- 同时动画大量元素
- 浏览器硬件加速未启用
- 动画时长过长

**解决方案:**

```scss
// ✅ 使用 transform 替代 left/top
.smooth-animation {
  // 启用硬件加速
  transform: translateZ(0);
  will-change: transform;
  transition: transform var(--duration-normal);

  &.active {
    transform: translate3d(100px, 0, 0);
  }
}

// ✅ 限制动画元素数量
<transition-group name="list" tag="div">
  <div v-for="item in limitedItems" :key="item.id">
    {{ item.name }}
  </div>
</transition-group>

<script lang="ts" setup>
// 限制同时显示的动画元素
const limitedItems = computed(() => items.value.slice(0, 50))
</script>
```

### 2. Vue 过渡不生效

**问题原因:**
- 忘记设置 `name` 属性
- 过渡类名拼写错误
- 元素没有 `v-if` 或 `v-show`
- CSS 优先级被覆盖

**解决方案:**

```vue
<template>
  <!-- ✅ 正确:设置 name 属性 -->
  <transition name="fade">
    <div v-if="visible">内容</div>
  </transition>

  <!-- ❌ 错误:没有 name 属性 -->
  <transition>
    <div v-if="visible">内容</div>
  </transition>
</template>

<style lang="scss" scoped>
// ✅ 正确:类名与 name 对应
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// ❌ 错误:类名拼写错误
.fade-enter,  // Vue 3 应使用 fade-enter-from
.fade-leave {  // Vue 3 应使用 fade-leave-to
  opacity: 0;
}
</style>
```

### 3. TransitionGroup 列表项位置混乱

**问题原因:**
- 列表项没有唯一的 `key`
- 忘记添加 `.move` 类
- `leave-active` 没有使用绝对定位

**解决方案:**

```vue
<template>
  <!-- ✅ 正确:每项都有唯一 key -->
  <transition-group name="list">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </transition-group>

  <!-- ❌ 错误:使用 index 作为 key -->
  <transition-group name="list">
    <div v-for="(item, index) in items" :key="index">
      {{ item.name }}
    </div>
  </transition-group>
</template>

<style lang="scss" scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// ✅ 关键:添加 move 类和绝对定位
.list-move {
  transition: all 0.5s;
}

.list-leave-active {
  position: absolute;
}
</style>
```

### 4. 主题切换动画不工作

**问题原因:**
- 浏览器不支持 View Transition API
- CSS 变量未正确设置
- 动画半径计算错误

**解决方案:**

```typescript
// ✅ 完整的主题切换实现(带降级)
const toggleTheme = (event: MouseEvent) => {
  // 检查浏览器支持
  if (!('startViewTransition' in document)) {
    // 降级方案:直接切换
    applyTheme(!isDark.value)
    return
  }

  // 获取点击位置
  const x = event.clientX
  const y = event.clientY

  // 计算动画半径(到最远角的距离)
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // 设置 CSS 变量
  const root = document.documentElement
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${endRadius}px`)

  // 执行过渡
  const transition = document.startViewTransition(() => {
    applyTheme(!isDark.value)
  })
}
```

### 5. 对话框动画与拖拽冲突

**问题原因:**
- 拖拽对话框时仍然应用缩放动画
- 动画影响拖拽性能

**解决方案:**

```scss
// ✅ 排除可拖拽对话框
.dialog-fade-enter-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-open 0.2s;
  }
}

.dialog-fade-leave-active {
  .el-dialog:not(.is-draggable) {
    animation: dialog-close 0.5s;
  }
}
```

### 6. 移动端动画性能差

**问题原因:**
- 移动设备性能较弱
- 复杂动画消耗过多资源
- 未启用硬件加速

**解决方案:**

```scss
// 移动端简化或禁用动画
@media (max-width: 768px) {
  // 简化动画效果
  .complex-animation {
    animation: simple-fade 0.2s !important;
  }

  // 或完全禁用
  .heavy-animation {
    animation: none !important;
    transition: none !important;
  }
}

// 启用硬件加速
.mobile-animation {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
```

## 最佳实践

### 1. 统一使用时长变量

```scss
// ✅ 推荐:使用统一的时长变量
.my-transition {
  transition: opacity var(--duration-normal);
}

// ❌ 避免:随意设置时长
.bad-transition {
  transition: opacity 0.32s;
}
```

### 2. 优先使用高性能属性

```scss
// ✅ 推荐:transform + opacity
.high-performance {
  transition: transform 0.3s, opacity 0.3s;
}

// ❌ 避免:触发重排的属性
.low-performance {
  transition: width 0.3s, height 0.3s, left 0.3s;
}
```

### 3. 合理选择缓动函数

```scss
// 进入动画:ease-out (快速开始,慢速结束)
.enter-animation {
  animation: slide-in 0.3s ease-out;
}

// 离开动画:ease-in (慢速开始,快速结束)
.leave-animation {
  animation: slide-out 0.3s ease-in;
}

// 循环动画:ease-in-out (两端慢速,中间快速)
.loop-animation {
  animation: breathe 2s ease-in-out infinite;
}
```

### 4. 移动端性能优化

```scss
// 移动端禁用复杂动画
@media (max-width: 768px) {
  .complex-animation {
    animation: none;
  }

  // 或使用简化版本
  .simplified-animation {
    animation-duration: 0.2s;  // 缩短时长
  }
}

// 检测用户偏好
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. 语义化动画命名

```scss
// ✅ 推荐:语义化命名
.sidebar-collapse-animation { }
.notification-fade-in { }
.menu-slide-down { }

// ❌ 避免:无意义命名
.animation1 { }
.anim { }
.trans { }
```

### 6. 动画可访问性

```vue
<template>
  <div class="animated-component">
    <!-- 提供禁用动画选项 -->
    <el-switch
      v-model="enableAnimations"
      active-text="启用动画"
    />

    <transition :name="enableAnimations ? 'fade' : ''">
      <div v-if="visible">内容</div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const enableAnimations = ref(true)
const visible = ref(true)
</script>

<style lang="scss" scoped>
// 响应用户的减少动画偏好设置
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
```

### 7. 测试动画效果

```typescript
// 使用 Vitest 测试动画类是否正确应用
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent.vue'

describe('Animation', () => {
  it('should apply fade transition', async () => {
    const wrapper = mount(MyComponent)

    // 触发显示
    await wrapper.find('button').trigger('click')

    // 检查过渡类是否应用
    expect(wrapper.find('.fade-enter-active').exists()).toBe(true)
  })
})
```

### 8. 文档化自定义动画

```scss
/**
 * 自定义动画:卡片翻转
 *
 * 用法:
 * <transition name="card-flip">
 *   <div v-if="visible">内容</div>
 * </transition>
 *
 * 特性:
 * - 3D 翻转效果
 * - 时长:0.6s
 * - 缓动:cubic-bezier(0.4, 0, 0.2, 1)
 */
@keyframes card-flip-in {
  0% {
    transform: perspective(1000px) rotateY(-90deg);
    opacity: 0;
  }
  100% {
    transform: perspective(1000px) rotateY(0);
    opacity: 1;
  }
}

.card-flip-enter-active {
  animation: card-flip-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```
