# 主内容区(AppMain)系统

## 简介

主内容区系统是整个应用的核心内容渲染区域，负责根据当前路由动态加载和显示页面组件。该系统由 `AppMain.vue`（主内容容器）、`ParentView.vue`（父级视图容器）和 `iframe` 目录下的内嵌页面组件构成，提供了完整的内容渲染解决方案。

**核心特性：**

- **路由视图渲染** - 基于 Vue Router 的 `router-view` 组件，使用作用域插槽获取当前组件和路由信息，实现动态内容渲染
- **组件缓存机制** - 集成 Vue 的 `keep-alive` 组件，支持页面状态保持和快速切换，通过 `cachedViews` 精确控制缓存策略
- **页面切换动画** - 基于 Animate.css 的过渡动画系统，支持随机动画、固定动画和无动画模式
- **外部链接内嵌** - 完整的 iframe 管理系统，支持多标签页切换、URL 参数传递、响应式高度适配
- **滚动条美化** - 统一的滚动条样式处理，支持 Webkit 和 Firefox 浏览器，提供流畅的滚动体验
- **响应式布局** - 自动适配不同布局模式，支持固定头部、标签页视图等场景的高度计算

## 组件架构

```text
AppMain/
├── AppMain.vue             # 主内容容器组件
├── ParentView.vue          # 父级视图容器组件
└── iframe/                 # iframe内嵌页面系统
    ├── IframeToggle.vue    # iframe切换管理组件
    └── InnerLink.vue       # 内部链接渲染组件
```

### 架构设计图

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AppMain.vue                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          el-scrollbar                                  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        router-view                               │  │  │
│  │  │  ┌───────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                      transition                            │  │  │  │
│  │  │  │  ┌─────────────────────────────────────────────────────┐  │  │  │  │
│  │  │  │  │                    keep-alive                        │  │  │  │  │
│  │  │  │  │  ┌───────────────────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │              component :is                     │  │  │  │  │  │
│  │  │  │  │  │         (动态渲染当前路由组件)                  │  │  │  │  │  │
│  │  │  │  │  └───────────────────────────────────────────────┘  │  │  │  │  │
│  │  │  │  └─────────────────────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      IframeToggle                                │  │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │  │  │
│  │  │  │ InnerLink 1 │  │ InnerLink 2 │  │ InnerLink N │   ...        │  │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 核心组件详解

### AppMain.vue - 主内容容器

AppMain 是布局系统的核心组件，负责渲染当前激活路由对应的视图组件，实现页面切换动画、组件缓存和 iframe 处理等功能。

#### 组件模板结构

```vue
<template>
  <!--
  主内容区域组件 - 负责渲染当前激活路由的内容
  这是布局中最核心的内容展示区域
  -->
  <section class="app-main">
    <!-- 使用 el-scrollbar 替代原生滚动 -->
    <el-scrollbar class="p-4">
      <!-- 路由视图部分 -->
      <router-view v-slot="{ Component, route }">
        <transition :enter-active-class="animate" mode="out-in">
          <keep-alive :include="layout.cachedViews.value">
            <component :is="Component" v-if="!route.meta.link" :key="route.path" />
          </keep-alive>
        </transition>
      </router-view>
      <!-- iframe处理 -->
      <IframeToggle />
    </el-scrollbar>
  </section>
</template>
```

#### 脚本实现详解

```typescript
<script setup lang="ts" name="AppMain">
/**
 * 主内容区域组件
 *
 * 该组件是布局的核心部分，负责渲染当前激活路由对应的视图组件
 * 实现了页面切换动画、组件缓存和iframe处理等功能
 */
import IframeToggle from './iframe/IframeToggle.vue'

// 获取当前路由信息
const route = useRoute()

// 获取布局状态管理
const layout = useLayout()

// 初始化动画实例，避免重复创建
const animation = useAnimation()

/**
 * 过渡动画相关变量
 * animate: 当前使用的动画类名
 * animationEnable: 是否启用动画效果
 */
const animate = ref<string>('')
const animationEnable = ref(layout.animationEnable.value)

/**
 * 监听动画启用状态变化
 * 当animationEnable设置变化时:
 * - 如果启用，使用随机动画效果
 * - 如果禁用，使用默认动画或无动画
 */
watch(
  () => layout.animationEnable.value,
  (val: boolean) => {
    animationEnable.value = val
    animate.value = val ? animation.getRandomAnimation() : animation.defaultAnimate
  },
  { immediate: true } // 组件挂载时立即执行一次
)

/**
 * 处理外部链接类型的路由
 * 当路由包含meta.link属性时，将该路由添加到iframe视图列表中
 * 由IframeToggle组件负责渲染这些外部链接
 */
watchEffect(() => {
  if (route.meta.link) {
    layout.addIframeView(route)
  }
})
</script>
```

#### 路由视图渲染机制

AppMain 使用 Vue Router 的作用域插槽模式渲染路由组件：

```vue
<router-view v-slot="{ Component, route }">
  <!-- Component: 当前路由匹配的组件 -->
  <!-- route: 当前路由对象，包含 path、meta 等信息 -->
  <component :is="Component" :key="route.path" />
</router-view>
```

**作用域插槽解析：**

| 属性 | 类型 | 说明 |
|------|------|------|
| Component | `VNode` | 当前路由匹配的组件 VNode |
| route | `RouteLocationNormalized` | 当前路由对象 |

**渲染条件判断：**

```typescript
// 只有非外部链接的路由才渲染为组件
<component :is="Component" v-if="!route.meta.link" :key="route.path" />
```

- `v-if="!route.meta.link"` - 排除外部链接类型的路由，这些路由由 IframeToggle 处理
- `:key="route.path"` - 使用路由路径作为 key，确保路由切换时组件正确更新

### ParentView.vue - 父级视图容器

ParentView 是一个简洁的占位组件，用于嵌套路由场景，作为父级菜单的容器组件。

```vue
<template>
  <!--
    父级视图组件 - 用于嵌套路由
    这个组件作为一个简单的路由容器，不添加任何额外的UI元素
    它的主要作用是在嵌套路由结构中作为中间层，将子路由内容直接渲染出来
   -->
  <router-view />
</template>

<script setup lang="ts" name="ParentView">
/**
 * 父级视图组件
 *
 * 该组件用作路由占位符，不包含任何业务逻辑
 * 用于多级菜单中的父级菜单项，当父级菜单需要展示子菜单内容时使用
 *
 * 使用场景:
 * - 在路由配置中作为父级路由的组件
 * - 允许子路由内容直接渲染，不添加额外的包装元素
 * - 适用于需要多级路由但不需要父级组件添加UI的情况
 */
</script>
```

#### 路由配置示例

```typescript
// 使用 ParentView 的路由配置
const routes = [
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'setting' },
    children: [
      {
        path: 'user',
        component: ParentView,  // 使用 ParentView 作为中间层
        meta: { title: '用户管理' },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/system/user/index.vue'),
            meta: { title: '用户列表' }
          },
          {
            path: 'role',
            name: 'UserRole',
            component: () => import('@/views/system/user/role.vue'),
            meta: { title: '用户角色' }
          }
        ]
      }
    ]
  }
]
```

**使用场景说明：**

1. **多级菜单结构** - 当菜单有三级或更多层级时，中间层使用 ParentView
2. **菜单分组** - 将相关功能组织在同一父级下，但父级本身不需要页面内容
3. **权限隔离** - 通过父级路由控制一组子路由的访问权限

## 组件缓存机制

### keep-alive 集成

AppMain 通过 Vue 的 `keep-alive` 组件实现页面状态缓存，避免重复渲染和数据丢失。

```vue
<keep-alive :include="layout.cachedViews.value">
  <component :is="Component" v-if="!route.meta.link" :key="route.path" />
</keep-alive>
```

#### 缓存控制原理

```typescript
// useLayout.ts 中的缓存视图管理
const tagsViewMethods = {
  /**
   * 添加视图到缓存列表
   * @param view 路由视图对象
   * @description 只缓存有名称且未设置 noCache 的视图
   */
  addCachedView(view: RouteLocationNormalized) {
    const viewName = view.name as string
    // 检查是否已缓存
    if (!viewName || state.tagsView.cachedViews.includes(viewName)) return
    // 检查是否禁用缓存
    if (!view.meta?.noCache) {
      state.tagsView.cachedViews.push(viewName)
    }
  },

  /**
   * 从缓存列表中删除视图
   * @param view 要删除的路由视图
   */
  async delCachedView(view: RouteLocationNormalized) {
    const viewName = view.name as string
    const index = state.tagsView.cachedViews.indexOf(viewName)
    if (index > -1) {
      state.tagsView.cachedViews.splice(index, 1)
    }
    return [...state.tagsView.cachedViews]
  },

  /**
   * 删除所有缓存视图
   */
  delAllCachedViews() {
    state.tagsView.cachedViews = []
    return [...state.tagsView.cachedViews]
  }
}
```

#### 缓存策略配置

通过路由 `meta.noCache` 属性控制缓存行为：

```typescript
// 路由配置示例
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',  // 必须设置 name，用于 keep-alive 匹配
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: '仪表盘',
      noCache: false  // 启用缓存（默认）
    }
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('@/views/monitor/index.vue'),
    meta: {
      title: '实时监控',
      noCache: true  // 禁用缓存，每次访问都重新加载
    }
  }
]
```

**缓存配置说明：**

| meta.noCache | 行为 | 适用场景 |
|--------------|------|----------|
| `false` / 未设置 | 缓存组件状态 | 表单页面、列表页面 |
| `true` | 每次访问重新创建 | 实时数据、仪表盘 |

#### 组件名称要求

使用 `keep-alive` 的 `include` 属性时，必须确保组件正确声明了 `name`：

```vue
<!-- 方式一：script setup 中使用 defineOptions -->
<script setup lang="ts">
defineOptions({
  name: 'Dashboard'  // 必须与路由配置中的 name 一致
})
</script>

<!-- 方式二：使用 unplugin-vue-define-options 插件 -->
<script setup lang="ts" name="Dashboard">
// 通过 name 属性自动设置组件名称
</script>
```

### 缓存生命周期钩子

组件被缓存时，可以使用特殊的生命周期钩子：

```typescript
<script setup lang="ts">
import { onActivated, onDeactivated } from 'vue'

// 组件被激活时调用（从缓存中恢复）
onActivated(() => {
  console.log('页面被激活')
  // 可以在这里刷新数据
  fetchLatestData()
})

// 组件被停用时调用（进入缓存）
onDeactivated(() => {
  console.log('页面被停用')
  // 可以在这里清理资源
  clearTimers()
})
</script>
```

**生命周期对比：**

| 钩子 | 触发时机 | 用途 |
|------|----------|------|
| `onMounted` | 首次挂载 | 初始化数据、事件监听 |
| `onActivated` | 每次激活（包括首次） | 刷新数据、恢复状态 |
| `onDeactivated` | 离开页面时 | 暂停任务、保存状态 |
| `onUnmounted` | 从缓存中移除时 | 清理资源、取消订阅 |

## 页面切换动画系统

### useAnimation Composable

AppMain 使用 `useAnimation` 组合式函数管理页面切换动画，基于 Animate.css 库提供丰富的动画效果。

#### 动画效果库

```typescript
// 动画库的公共前缀，用于 Animate.css 类名
const ANIMATE_PREFIX = 'animate__animated '

/**
 * 预定义动画效果集合
 */
export const animationEffects = {
  // 无动画
  EMPTY: '',
  // 脉冲效果：轻微缩放和颤动
  PULSE: `${ANIMATE_PREFIX}animate__pulse`,
  // 橡皮筋效果：元素弹性拉伸
  RUBBER_BAND: `${ANIMATE_PREFIX}animate__rubberBand`,
  // 弹跳进入：从小变大
  BOUNCE_IN: `${ANIMATE_PREFIX}animate__bounceIn`,
  // 从左侧弹跳进入
  BOUNCE_IN_LEFT: `${ANIMATE_PREFIX}animate__bounceInLeft`,
  // 渐入效果：从透明到不透明
  FADE_IN: `${ANIMATE_PREFIX}animate__fadeIn`,
  // 从左侧渐入
  FADE_IN_LEFT: `${ANIMATE_PREFIX}animate__fadeInLeft`,
  // 从上方渐入
  FADE_IN_DOWN: `${ANIMATE_PREFIX}animate__fadeInDown`,
  // 从下方渐入
  FADE_IN_UP: `${ANIMATE_PREFIX}animate__fadeInUp`,
  // X轴翻转进入
  FLIP_IN_X: `${ANIMATE_PREFIX}animate__flipInX`,
  // 从左侧光速进入
  LIGHT_SPEED_IN_LEFT: `${ANIMATE_PREFIX}animate__lightSpeedInLeft`,
  // 从左下方旋转进入
  ROTATE_IN_DOWN_LEFT: `${ANIMATE_PREFIX}animate__rotateInDownLeft`,
  // 滚动进入
  ROLL_IN: `${ANIMATE_PREFIX}animate__rollIn`,
  // 缩放进入
  ZOOM_IN: `${ANIMATE_PREFIX}animate__zoomIn`,
  // 从上方缩放进入
  ZOOM_IN_DOWN: `${ANIMATE_PREFIX}animate__zoomInDown`,
  // 从左侧滑入
  SLIDE_IN_LEFT: `${ANIMATE_PREFIX}animate__slideInLeft`,
  // 光速进入
  LIGHT_SPEED_IN: `${ANIMATE_PREFIX}animate__lightSpeedIn`,
  // 渐出效果
  FADE_OUT: `${ANIMATE_PREFIX}animate__fadeOut`
}
```

#### 动画配置接口

```typescript
/**
 * 动画配置接口
 * 定义进入和离开动画的结构
 */
export interface AnimationConfig {
  // 进入时的动画
  enter: string
  // 离开时的动画
  leave: string
}

/**
 * 创建动画配置
 * @param enterAnimation 进入动画
 * @param leaveAnimation 离开动画
 * @returns 动画配置对象
 */
export const createAnimationConfig = (
  enterAnimation: string = animationEffects.FADE_IN,
  leaveAnimation: string = animationEffects.FADE_OUT
): AnimationConfig => {
  return {
    enter: enterAnimation,
    leave: leaveAnimation
  }
}

// 预定义的常用动画配置
export const searchAnimate = createAnimationConfig(animationEffects.EMPTY, animationEffects.EMPTY)
export const menuSearchAnimate = createAnimationConfig(animationEffects.FADE_IN, animationEffects.FADE_OUT)
export const logoAnimate = createAnimationConfig(animationEffects.FADE_IN, animationEffects.FADE_OUT)
```

#### useAnimation 组合式函数

```typescript
/**
 * 动画钩子函数
 * 提供动画相关功能和状态管理
 */
export const useAnimation = () => {
  // 当前启用的动画
  const currentAnimation = ref<string>(defaultAnimate)

  // 是否启用随机动画
  const isRandomAnimation = ref<boolean>(false)

  // 当前动画配置
  const currentConfig = ref<AnimationConfig>({
    enter: animationEffects.FADE_IN,
    leave: animationEffects.FADE_OUT
  })

  /**
   * 获取随机动画效果
   * @returns 随机动画类名
   */
  const getRandomAnimation = (): string => {
    const index = Math.floor(Math.random() * animateList.length)
    return animateList[index]
  }

  /**
   * 设置当前动画
   * @param animation 动画类名
   */
  const setAnimation = (animation: string): void => {
    currentAnimation.value = animation
  }

  /**
   * 切换随机动画模式
   * @param value 是否启用随机动画
   */
  const toggleRandomAnimation = (value?: boolean): void => {
    isRandomAnimation.value = value !== undefined ? value : !isRandomAnimation.value
  }

  /**
   * 获取下一个动画
   * 如果启用随机模式则返回随机动画，否则返回当前动画
   */
  const nextAnimation = computed(() => {
    if (isRandomAnimation.value) {
      return getRandomAnimation()
    }
    return currentAnimation.value
  })

  /**
   * 为元素应用动画
   * @param element DOM元素
   * @param animation 动画类名
   * @param callback 动画结束后的回调
   */
  const applyAnimation = (
    element: HTMLElement,
    animation: string = nextAnimation.value,
    callback?: () => void
  ): void => {
    // 移除可能存在的动画类
    element.classList.forEach((cls) => {
      if (cls.startsWith('animate__')) {
        element.classList.remove(cls)
      }
    })

    // 添加新动画类
    animation.split(' ').forEach((cls) => {
      if (cls) element.classList.add(cls)
    })

    // 动画结束后执行回调
    if (callback) {
      const handleAnimationEnd = () => {
        callback()
        element.removeEventListener('animationend', handleAnimationEnd)
      }
      element.addEventListener('animationend', handleAnimationEnd)
    }
  }

  return {
    // 状态
    currentAnimation,
    isRandomAnimation,
    currentConfig,
    nextAnimation,

    // 方法
    getRandomAnimation,
    setAnimation,
    toggleRandomAnimation,
    createAnimationConfig,
    setAnimationConfig,
    applyAnimation,

    // 预定义配置
    searchAnimate,
    menuSearchAnimate,
    logoAnimate,

    // 常量
    animationEffects,
    animateList,
    defaultAnimate
  }
}
```

### 动画集成实现

AppMain 中的动画集成代码：

```typescript
// 初始化动画实例
const animation = useAnimation()

// 当前使用的动画类名
const animate = ref<string>('')

// 监听动画启用状态变化
watch(
  () => layout.animationEnable.value,
  (val: boolean) => {
    // 启用时使用随机动画，禁用时使用默认动画
    animate.value = val ? animation.getRandomAnimation() : animation.defaultAnimate
  },
  { immediate: true }
)
```

模板中的动画应用：

```vue
<transition :enter-active-class="animate" mode="out-in">
  <keep-alive :include="layout.cachedViews.value">
    <component :is="Component" v-if="!route.meta.link" :key="route.path" />
  </keep-alive>
</transition>
```

**Transition 配置说明：**

| 属性 | 值 | 说明 |
|------|------|------|
| `:enter-active-class` | `animate` | 动态绑定进入动画类名 |
| `mode` | `"out-in"` | 先离开后进入，避免重叠 |

### 动画效果列表

| 效果名称 | 类名 | 描述 |
|----------|------|------|
| Pulse | `animate__pulse` | 脉冲效果，轻微缩放颤动 |
| Rubber Band | `animate__rubberBand` | 橡皮筋弹性拉伸 |
| Bounce In | `animate__bounceIn` | 弹跳进入，从小变大 |
| Bounce In Left | `animate__bounceInLeft` | 从左侧弹跳进入 |
| Fade In | `animate__fadeIn` | 渐入，透明到不透明 |
| Fade In Left | `animate__fadeInLeft` | 从左侧渐入 |
| Fade In Down | `animate__fadeInDown` | 从上方渐入 |
| Fade In Up | `animate__fadeInUp` | 从下方渐入 |
| Flip In X | `animate__flipInX` | X轴翻转进入 |
| Light Speed In Left | `animate__lightSpeedInLeft` | 从左侧光速进入 |
| Rotate In Down Left | `animate__rotateInDownLeft` | 从左下方旋转进入 |
| Roll In | `animate__rollIn` | 滚动进入 |
| Zoom In | `animate__zoomIn` | 缩放进入 |
| Zoom In Down | `animate__zoomInDown` | 从上方缩放进入 |
| Slide In Left | `animate__slideInLeft` | 从左侧滑入 |
| Light Speed In | `animate__lightSpeedIn` | 光速进入 |
| Fade Out | `animate__fadeOut` | 渐出效果 |

## iframe 内嵌页面系统

### IframeToggle.vue - iframe 切换管理

IframeToggle 组件负责管理多个 iframe 视图的显示和隐藏，根据当前路由路径匹配对应的 iframe。

#### 组件实现

```vue
<template>
  <!--
    iframe 视图切换组件
    根据当前路由显示对应的 iframe 页面，支持多标签页切换
  -->
  <InnerLink
    v-for="(item, index) in layout.iframeViews.value"
    v-show="route.path === item.path"
    :key="item.path"
    :iframe-id="`iframe${index}`"
    :src="buildIframeUrl(item.meta?.link, item.query)"
  />
</template>

<script setup lang="ts" name="IframeToggle">
import InnerLink from './InnerLink.vue'
import { objectToQuery } from '@/utils/object'

/**
 * iframe 视图切换组件
 *
 * 功能说明：
 * - 管理多个 iframe 标签页的显示和隐藏
 * - 根据当前路由路径匹配对应的 iframe 视图
 * - 支持 URL 参数拼接，将路由查询参数传递给 iframe
 *
 * 使用场景：
 * - 内嵌第三方系统页面
 * - 多标签页管理外部链接
 * - 保持 iframe 状态，避免重复加载
 */

// 当前路由信息
const route = useRoute()
// 布局状态管理
const layout = useLayout()

/**
 * 构建 iframe 的完整 URL
 *
 * @param baseUrl - 基础 URL，来自路由 meta.link
 * @param queryParams - 路由查询参数对象
 * @returns 拼接查询参数后的完整 URL
 *
 * @example
 * buildIframeUrl('https://example.com', { id: 1, type: 'user' })
 * // 返回: 'https://example.com?id=1&type=user'
 *
 * buildIframeUrl('https://example.com', {})
 * // 返回: 'https://example.com'
 */
const buildIframeUrl = (
  baseUrl: string | undefined,
  queryParams: Record<string, any>
): string | undefined => {
  // 如果基础 URL 为空，直接返回
  if (!baseUrl) {
    return baseUrl
  }

  // 使用工具类方法生成查询字符串
  const queryString = objectToQuery(queryParams || {})

  if (!queryString) {
    return baseUrl
  }

  // 检查原 URL 是否已包含查询参数
  const separator = baseUrl.includes('?') ? '&' : '?'

  return `${baseUrl}${separator}${queryString}`
}
</script>
```

#### v-show 与 v-if 的选择

```vue
<!-- 使用 v-show 而非 v-if -->
<InnerLink
  v-for="(item, index) in layout.iframeViews.value"
  v-show="route.path === item.path"
  ...
/>
```

**选择 v-show 的原因：**

| 特性 | v-show | v-if |
|------|--------|------|
| DOM 处理 | 始终渲染，CSS 控制显隐 | 条件渲染，销毁/创建 DOM |
| iframe 状态 | 保持加载状态和滚动位置 | 每次显示重新加载 |
| 性能 | 初始渲染开销大，切换成本低 | 初始渲染开销小，切换成本高 |
| 适用场景 | 频繁切换的内容 | 条件稀少变化的内容 |

### InnerLink.vue - iframe 渲染组件

InnerLink 是实际渲染 iframe 的组件，负责 iframe 的显示和响应式高度适配。

#### 组件实现

```vue
<template>
  <div :style="'height:' + height">
    <iframe
      :id="iframeId"
      style="width: 100%; height: 100%; border: 0"
      :src="src"
    ></iframe>
  </div>
</template>

<script setup lang="ts" name="InnerLink">
/**
 * IFrame 组件的 Props 接口定义
 */
interface IFrameProps {
  /**
   * iframe 的源地址 URL
   * @default '/'
   */
  src?: string

  /**
   * iframe 的唯一标识 ID
   * 必填，用于精确定位和操作特定的 iframe
   */
  iframeId: string
}

// 使用 withDefaults 定义 props，提供默认值和必填项
const props = withDefaults(defineProps<IFrameProps>(), {
  src: '/'
})

// 响应式计算高度
const height = ref('')

/**
 * 计算并设置 iframe 高度
 * 减去顶部导航栏等固定区域的高度
 */
const calculateHeight = () => {
  height.value = `${document.documentElement.clientHeight - 94.5}px`
}

// 在组件挂载时计算初始高度
onMounted(() => {
  calculateHeight()

  // 监听窗口大小变化，动态调整高度
  window.addEventListener('resize', calculateHeight)
})

// 组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('resize', calculateHeight)
})
</script>
```

#### 高度计算逻辑

```text
视口高度 (clientHeight)
├── 顶部导航栏: 50px
├── 标签页视图: 34px
├── 内边距: 10.5px (上下各约 5px)
└── iframe 内容区域: clientHeight - 94.5px
```

**高度计算公式：**

```typescript
// 94.5px = 顶部导航(50) + 标签页(34) + 内边距(10.5)
height.value = `${document.documentElement.clientHeight - 94.5}px`
```

### iframe 路由配置

配置外部链接路由以使用 iframe 系统：

```typescript
// 外部链接路由配置示例
const routes = [
  {
    path: '/external/docs',
    name: 'ExternalDocs',
    meta: {
      title: '外部文档',
      icon: 'document',
      link: 'https://docs.example.com'  // 设置 link 属性
    }
  },
  {
    path: '/external/monitor',
    name: 'ExternalMonitor',
    meta: {
      title: '监控系统',
      icon: 'monitor',
      link: 'https://monitor.example.com/dashboard'
    }
  }
]
```

**路由 meta 配置说明：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `link` | `string` | 外部链接 URL，设置后该路由使用 iframe 渲染 |
| `title` | `string` | 显示在标签页和菜单中的标题 |
| `icon` | `string` | 菜单图标 |

### iframe 视图状态管理

iframe 视图通过 useLayout 的 tagsViewMethods 进行管理：

```typescript
const tagsViewMethods = {
  /**
   * 添加 iframe 视图
   * @param view 路由视图对象
   */
  addIframeView(view: RouteLocationNormalized) {
    // 避免重复添加
    if (state.tagsView.iframeViews.some((v) => v.path === view.path)) return

    state.tagsView.iframeViews.push({
      ...view,
      title: view.meta?.title || 'no-name'
    })
  },

  /**
   * 删除 iframe 视图
   * @param view 要删除的路由视图
   */
  delIframeView(view: RouteLocationNormalized) {
    const index = state.tagsView.iframeViews.findIndex((v) => v.path === view.path)
    if (index > -1) {
      state.tagsView.iframeViews.splice(index, 1)
    }
    return [...state.tagsView.iframeViews]
  },

  /**
   * 删除所有 iframe 视图
   */
  delAllIframeViews() {
    state.tagsView.iframeViews = []
    return [...state.tagsView.iframeViews]
  }
}
```

## 样式系统

### 主内容区样式

```scss
.app-main {
  /* 计算内容区域高度: 视口高度减去顶部导航栏高度(50px) */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  z-index: 1;
  overflow: hidden; /* 防止app-main自身滚动 */
  background-color: var(--app-bg);

  /* 确保el-scrollbar占满可用空间 */
  .el-scrollbar {
    height: 100%;
  }
}

/* 当头部固定时的调整 */
.fixed-header + .app-main {
  padding-top: 50px;
}

/* 当启用标签页视图时的调整 */
.hasTagsView {
  .app-main {
    /* 调整高度: 视口高度减去导航栏(50px)和标签页(34px)的总高度 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
```

### 高度计算详解

```text
┌─────────────────────────────────────────────────────────────────┐
│                        视口 (100vh)                              │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                  Navbar (50px)                               │ │
│ │              固定头部时：position: fixed                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                 TagsView (34px)                              │ │
│ │            可选组件，通过 hasTagsView 控制                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                              │ │
│ │                     AppMain                                  │ │
│ │                                                              │ │
│ │  无 TagsView: min-height: calc(100vh - 50px)                │ │
│ │  有 TagsView: min-height: calc(100vh - 84px)                │ │
│ │                                                              │ │
│ │  固定头部时需要额外的 padding-top                            │ │
│ │                                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 滚动条美化

AppMain 提供了全局滚动条样式美化：

```scss
/* 统一设置滚动条基本样式 - 适用于 Webkit 浏览器 (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 6px;   /* 垂直滚动条宽度更细 */
  height: 6px;  /* 水平滚动条高度一致 */
}

::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-lighter);
  border-radius: var(--radius-round);

  &:hover {
    background-color: var(--el-border-color);
  }
}

::-webkit-scrollbar-track {
  background-color: transparent;
  border-radius: var(--radius-round);
}

/* 滚动条转角处理 */
::-webkit-scrollbar-corner {
  background-color: transparent;
}

/* 针对 Firefox */
html,
body {
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color-lighter) transparent;
  overflow: auto;
}
```

### Element Plus Scrollbar 优化

```scss
/* 优化el-scrollbar样式 */
.el-scrollbar {
  .el-scrollbar__bar.is-vertical {
    width: 6px;
    opacity: 1;

    &:hover {
      opacity: 1;
    }
  }

  .el-scrollbar__bar.is-horizontal {
    height: 6px;
    opacity: 1;

    &:hover {
      opacity: 1;
    }
  }

  .el-scrollbar__thumb {
    background-color: var(--el-border-color-dark);
    border-radius: var(--radius-round);
  }

  /* 修复滚动区域高度问题 */
  .el-scrollbar__wrap {
    max-height: 100%; /* 确保不超出容器高度 */
  }
}
```

### 对话框打开时的样式修复

```scss
/* 修复el-dialog打开时的CSS样式问题 */
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 0 !important; /* 防止对话框导致的padding变化 */
  }
}

/* 添加平滑滚动效果 */
html {
  scroll-behavior: smooth;
}
```

## API 文档

### AppMain Props

AppMain 组件没有 Props，所有状态通过 Composable 管理。

### useLayout 相关方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `addIframeView` | 添加 iframe 视图 | `view: RouteLocationNormalized` | `void` |
| `delIframeView` | 删除 iframe 视图 | `view: RouteLocationNormalized` | `string[]` |
| `delAllIframeViews` | 删除所有 iframe 视图 | - | `string[]` |
| `addCachedView` | 添加缓存视图 | `view: RouteLocationNormalized` | `void` |
| `delCachedView` | 删除缓存视图 | `view: RouteLocationNormalized` | `Promise<string[]>` |
| `delAllCachedViews` | 删除所有缓存视图 | - | `string[]` |

### useAnimation 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `currentAnimation` | `Ref<string>` | 当前动画类名 |
| `isRandomAnimation` | `Ref<boolean>` | 是否启用随机动画 |
| `nextAnimation` | `ComputedRef<string>` | 下一个动画类名 |
| `getRandomAnimation` | `() => string` | 获取随机动画 |
| `setAnimation` | `(animation: string) => void` | 设置当前动画 |
| `toggleRandomAnimation` | `(value?: boolean) => void` | 切换随机动画模式 |
| `applyAnimation` | `(el, animation, callback) => void` | 为元素应用动画 |
| `animationEffects` | `object` | 动画效果常量集合 |
| `animateList` | `string[]` | 所有可用动画列表 |
| `defaultAnimate` | `string` | 默认动画（FADE_IN） |

### InnerLink Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `src` | `string` | 否 | `'/'` | iframe 源地址 URL |
| `iframeId` | `string` | 是 | - | iframe 唯一标识 ID |

### 路由 Meta 配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 页面标题 |
| `noCache` | `boolean` | 禁用页面缓存 |
| `link` | `string` | 外部链接 URL（使用 iframe 渲染） |
| `affix` | `boolean` | 是否固定在标签栏 |

### 类型定义

```typescript
/**
 * 动画效果配置
 */
interface AnimationConfig {
  enter: string  // 进入动画类名
  leave: string  // 离开动画类名
}

/**
 * IFrame Props 接口
 */
interface IFrameProps {
  src?: string      // iframe 源地址
  iframeId: string  // iframe ID
}

/**
 * 标签视图状态
 */
interface TagsViewState {
  visitedViews: RouteLocationNormalized[]  // 已访问视图
  cachedViews: string[]                     // 缓存视图名称
  iframeViews: RouteLocationNormalized[]   // iframe 视图
}
```

## 最佳实践

### 1. 合理配置页面缓存

根据页面特性选择缓存策略：

```typescript
// ✅ 推荐：表单页面启用缓存
{
  path: '/form/edit',
  name: 'FormEdit',
  component: () => import('@/views/form/edit.vue'),
  meta: {
    title: '表单编辑',
    noCache: false  // 保持表单数据
  }
}

// ✅ 推荐：实时数据页面禁用缓存
{
  path: '/monitor/realtime',
  name: 'RealtimeMonitor',
  component: () => import('@/views/monitor/realtime.vue'),
  meta: {
    title: '实时监控',
    noCache: true  // 每次访问获取最新数据
  }
}
```

### 2. 使用 onActivated 刷新数据

```typescript
<script setup lang="ts">
import { onActivated } from 'vue'

const tableData = ref([])
const loading = ref(false)

// 首次加载
onMounted(() => {
  fetchData()
})

// 从缓存恢复时刷新
onActivated(() => {
  // 检查是否需要刷新
  if (shouldRefresh()) {
    fetchData()
  }
})

const fetchData = async () => {
  loading.value = true
  try {
    tableData.value = await api.getList()
  } finally {
    loading.value = false
  }
}

const shouldRefresh = () => {
  // 根据业务逻辑判断是否需要刷新
  return Date.now() - lastFetchTime > 60000 // 超过1分钟刷新
}
</script>
```

### 3. 正确设置组件名称

```vue
<!-- ✅ 推荐：使用 defineOptions 设置名称 -->
<script setup lang="ts">
defineOptions({
  name: 'UserList'  // 必须与路由的 name 一致
})
</script>

<!-- ✅ 推荐：使用 name 属性（需要插件支持） -->
<script setup lang="ts" name="UserList">
// 组件逻辑
</script>
```

### 4. iframe 安全配置

```typescript
// 外部链接配置时考虑安全性
const routes = [
  {
    path: '/external/safe',
    meta: {
      title: '安全外链',
      // 只允许可信域名
      link: 'https://trusted-domain.com/page'
    }
  }
]

// 在 InnerLink 中可以添加 sandbox 属性
<iframe
  :id="iframeId"
  :src="src"
  sandbox="allow-same-origin allow-scripts allow-forms"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

### 5. 动画性能优化

```typescript
// 根据设备性能调整动画
const shouldUseAnimation = computed(() => {
  // 检查用户是否偏好减少动画
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false
  }
  // 移动设备可能性能较低
  if (layout.device.value === 'mobile') {
    return false
  }
  return layout.animationEnable.value
})
```

## 常见问题

### 1. 页面缓存不生效

**问题描述：** 配置了 `noCache: false` 但页面仍然每次都重新加载。

**解决方案：**

1. 检查组件是否正确设置了 `name`：

```vue
<script setup lang="ts">
// 必须设置组件名称
defineOptions({
  name: 'UserList'  // 这个名称必须与路由的 name 一致
})
</script>
```

2. 检查路由配置：

```typescript
{
  path: '/user/list',
  name: 'UserList',  // 必须设置 name
  component: () => import('@/views/user/list.vue'),
  meta: { title: '用户列表' }  // 不设置 noCache 默认启用缓存
}
```

3. 确保组件名称与路由名称一致

### 2. iframe 页面高度不正确

**问题描述：** iframe 内容显示不完整或有滚动条。

**解决方案：**

```typescript
// InnerLink.vue 中调整高度计算
const calculateHeight = () => {
  // 根据实际布局调整减去的高度
  // 默认: 50(导航) + 34(标签页) + 10.5(边距) = 94.5
  const offset = document.querySelector('.hasTagsView') ? 94.5 : 60
  height.value = `${document.documentElement.clientHeight - offset}px`
}
```

### 3. 页面切换动画卡顿

**问题描述：** 切换页面时动画不流畅。

**解决方案：**

1. 禁用动画：

```typescript
// 在布局设置中关闭动画
layout.saveSettings({ animationEnable: false })
```

2. 使用简单动画：

```typescript
// 只使用 fadeIn 等简单动画
const simpleAnimations = [
  animationEffects.FADE_IN,
  animationEffects.FADE_IN_UP,
  animationEffects.FADE_IN_DOWN
]
```

3. 减少缓存页面数量：

```typescript
// 限制最大缓存页面数
const MAX_CACHED_VIEWS = 10

watch(
  () => state.tagsView.cachedViews,
  (views) => {
    if (views.length > MAX_CACHED_VIEWS) {
      state.tagsView.cachedViews = views.slice(-MAX_CACHED_VIEWS)
    }
  }
)
```

### 4. 外部链接无法加载

**问题描述：** iframe 中的外部链接显示空白或报错。

**解决方案：**

1. 检查目标网站是否允许嵌入：

```text
# 目标网站的响应头
X-Frame-Options: SAMEORIGIN  # 只允许同源嵌入
X-Frame-Options: DENY         # 禁止任何嵌入
```

2. 使用代理服务器转发请求

3. 改用新窗口打开：

```typescript
// 判断是否可嵌入，不可嵌入则新窗口打开
const handleExternalLink = (url: string) => {
  if (canBeEmbedded(url)) {
    router.push({ path: '/external', query: { link: url } })
  } else {
    window.open(url, '_blank')
  }
}
```

### 5. 多级路由渲染问题

**问题描述：** 三级或更多级路由无法正确渲染。

**解决方案：**

使用 ParentView 作为中间层：

```typescript
const routes = [
  {
    path: '/system',
    component: Layout,
    children: [
      {
        path: 'user',
        component: ParentView,  // 二级使用 ParentView
        redirect: '/system/user/list',
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/system/user/list.vue')
          },
          {
            path: 'detail/:id',
            name: 'UserDetail',
            component: () => import('@/views/system/user/detail.vue')
          }
        ]
      }
    ]
  }
]
```

### 6. 滚动位置未保存

**问题描述：** 返回缓存页面后滚动位置丢失。

**解决方案：**

```typescript
<script setup lang="ts">
const scrollTop = ref(0)
const scrollContainer = ref<HTMLElement>()

// 离开页面时保存滚动位置
onDeactivated(() => {
  if (scrollContainer.value) {
    scrollTop.value = scrollContainer.value.scrollTop
  }
})

// 激活时恢复滚动位置
onActivated(() => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollTop.value
    }
  })
})
</script>

<template>
  <div ref="scrollContainer" class="scroll-container">
    <!-- 页面内容 -->
  </div>
</template>
```

## 性能优化

### 1. 路由懒加载

```typescript
// ✅ 推荐：使用动态导入
component: () => import('@/views/user/index.vue')

// ❌ 避免：直接导入
import UserIndex from '@/views/user/index.vue'
component: UserIndex
```

### 2. 限制缓存数量

```typescript
// 清理超出限制的缓存
const cleanupCache = () => {
  const MAX_CACHE = 15
  const { cachedViews } = state.tagsView

  if (cachedViews.length > MAX_CACHE) {
    // 保留最近使用的页面
    state.tagsView.cachedViews = cachedViews.slice(-MAX_CACHE)
  }
}
```

### 3. 预加载关键页面

```typescript
// 预加载常用页面
const preloadPages = [
  () => import('@/views/dashboard/index.vue'),
  () => import('@/views/user/list.vue')
]

onMounted(() => {
  // 空闲时预加载
  requestIdleCallback(() => {
    preloadPages.forEach(load => load())
  })
})
```

### 4. 监控渲染性能

```typescript
// 监控组件渲染时间
const measureRenderTime = () => {
  const startTime = performance.now()

  nextTick(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    if (renderTime > 100) {
      console.warn(`Slow component render: ${renderTime}ms`)
    }
  })
}
```

## 总结

主内容区系统是整个应用的核心渲染区域，通过以下组件的协作提供完整的内容展示解决方案：

1. **AppMain.vue** - 主内容容器，集成路由视图、缓存机制和动画系统
2. **ParentView.vue** - 父级视图容器，支持多级路由嵌套
3. **IframeToggle.vue** - iframe 切换管理，支持多标签页外部链接
4. **InnerLink.vue** - iframe 渲染器，提供响应式高度适配

合理配置缓存策略、动画效果和安全策略，能够在保证用户体验的同时确保应用的性能和安全性。系统提供了完整的状态管理集成，通过 useLayout 和 useAnimation 组合式函数实现统一的状态控制和动画管理。
