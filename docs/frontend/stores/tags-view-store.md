# 标签视图管理 (tagsView)

## 介绍

标签视图管理模块提供类似浏览器多标签页的页面管理体验。通过 `useLayout` Composable 中的 `tagsViewMethods` 实现，支持标签的添加、删除、批量操作、keep-alive 缓存管理和 iframe 页面支持。

**核心特性:**

- **多标签导航** - 类似浏览器的多标签页体验，支持标签添加、删除、切换和右键菜单操作
- **智能缓存** - 基于 keep-alive 的页面状态缓存，自动管理组件生命周期
- **固定标签** - 支持重要页面设置为固定标签，不可关闭且始终显示
- **批量操作** - 关闭其他、关闭左侧、关闭右侧、关闭全部等批量操作
- **动态路由支持** - 智能识别带参数的动态路由，避免错误清理缓存
- **iframe 集成** - 支持内嵌外部页面，独立管理 iframe 生命周期

## 状态定义

### TagsViewState 接口

```typescript
interface TagsViewState {
  /** 已访问的视图列表 - 标签栏显示的所有页面 */
  visitedViews: RouteLocationNormalized[]

  /** 缓存的视图名称列表 - keep-alive 缓存的组件名称 */
  cachedViews: string[]

  /** iframe 视图列表 - 内嵌外部链接的页面 */
  iframeViews: RouteLocationNormalized[]
}
```

### 三种状态数组

| 数组 | 类型 | 说明 |
|------|------|------|
| `visitedViews` | `RouteLocationNormalized[]` | 存储完整路由信息，用于标签栏渲染 |
| `cachedViews` | `string[]` | 存储组件名称，供 keep-alive 使用 |
| `iframeViews` | `RouteLocationNormalized[]` | 存储外部链接页面路由信息 |

**缓存规则:**

1. 组件必须定义 `name` 属性
2. 组件 `name` 必须与路由 `name` 一致
3. 路由 `meta.noCache` 为 `true` 时不缓存
4. 动态路由特殊处理，避免缓存冲突

## 核心方法

### 添加视图

```typescript
// 同时添加到已访问列表和缓存列表（最常用）
addView(view: RouteLocationNormalized)

// 仅添加到已访问列表（标签栏显示）
addVisitedView(view: RouteLocationNormalized)

// 仅添加到缓存列表（keep-alive）
addCachedView(view: RouteLocationNormalized)

// 添加 iframe 视图
addIframeView(view: RouteLocationNormalized)
```

**使用示例:**

```typescript
import { useLayout } from '@/composables/useLayout'
import { useRoute } from 'vue-router'

const layout = useLayout()
const route = useRoute()

// 监听路由变化，自动添加标签
watch(
  () => route.path,
  () => {
    if (route.name) {
      layout.addView(route)
    }
  },
  { immediate: true }
)
```

### 删除视图

```typescript
// 删除指定视图（标签 + 缓存）
async delView(view: RouteLocationNormalized): Promise<ViewsResult>

// 仅删除已访问视图
async delVisitedView(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>

// 删除缓存视图（不传参则清空所有）
async delCachedView(view?: RouteLocationNormalized): Promise<string[]>

// 删除 iframe 视图
async delIframeView(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
```

**关闭标签示例:**

```typescript
const closeCurrentTag = async () => {
  const { visitedViews } = await layout.delView(route)

  // 如果关闭的是当前页，跳转到最后一个标签
  if (route.path === currentRoute.path) {
    const latestView = visitedViews[visitedViews.length - 1]
    router.push(latestView || '/')
  }
}
```

### 批量操作

```typescript
// 删除其他视图（保留当前和固定标签）
async delOthersViews(view: RouteLocationNormalized): Promise<ViewsResult>

// 删除所有视图（保留固定标签）
async delAllViews(): Promise<ViewsResult>

// 删除右侧标签
async delRightTags(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>

// 删除左侧标签
async delLeftTags(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
```

### 工具方法

```typescript
// 更新已访问视图信息
updateVisitedView(view: RouteLocationNormalized)

// 判断是否为动态路由
isDynamicRoute(view: RouteLocationNormalized): boolean

// 获取视图列表副本
getVisitedViews(): RouteLocationNormalized[]
getCachedViews(): string[]
getIframeViews(): RouteLocationNormalized[]
```

## 缓存机制

### Keep-Alive 集成

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()
const cachedViews = computed(() => layout.cachedViews.value)
</script>
```

### 缓存生效条件

```vue
<!-- 组件必须设置 name，且与路由 name 一致 -->
<script lang="ts" setup>
defineOptions({
  name: 'UserManagement'  // 与路由 name 相同
})
</script>
```

```typescript
// 路由配置
{
  path: '/user',
  name: 'UserManagement',  // 与组件 name 相同
  component: () => import('@/views/user/index.vue'),
  meta: {
    title: '用户管理'
    // noCache: true  // 设为 true 则不缓存
  }
}
```

### 生命周期钩子

```vue
<script lang="ts" setup>
import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

// 首次进入（只调用一次）
onMounted(() => {
  initData()
})

// 每次切换回来都调用
onActivated(() => {
  refreshData()
})

// 每次离开都调用
onDeactivated(() => {
  saveFormDraft()
})

// 组件销毁（标签关闭时）
onUnmounted(() => {
  cleanup()
})
</script>
```

## 固定标签

### 配置方式

```typescript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/views/dashboard/index.vue'),
  meta: {
    title: '首页',
    affix: true  // 设置为固定标签
  }
}
```

### 固定标签特性

| 特性 | 说明 |
|------|------|
| 不可关闭 | 不显示关闭按钮，无法被用户关闭 |
| 始终显示 | 应用启动时自动添加到标签栏 |
| 批量保留 | 关闭全部/关闭其他时自动保留 |

**初始化固定标签:**

```typescript
const initAffixTags = () => {
  const routes = permissionStore.routes

  const filterAffixTags = (routes: RouteRecordRaw[]): RouteLocationNormalized[] => {
    return routes
      .filter(route => route.meta?.affix)
      .map(route => ({
        path: route.path,
        name: route.name,
        meta: { ...route.meta }
      } as RouteLocationNormalized))
  }

  filterAffixTags(routes).forEach(tag => {
    if (tag.name) layout.addVisitedView(tag)
  })
}
```

## Iframe 视图

### 配置示例

```typescript
{
  path: '/external/docs',
  name: 'ExternalDocs',
  component: () => import('@/views/system/InnerLink.vue'),
  meta: {
    title: '在线文档',
    link: 'https://docs.example.com'  // 外部链接
  }
}
```

### InnerLink 组件

```vue
<template>
  <iframe
    v-if="iframeSrc"
    :src="iframeSrc"
    frameborder="0"
    width="100%"
    height="100%"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const route = useRoute()
const layout = useLayout()

const iframeSrc = computed(() => route.meta?.link as string)

onMounted(() => {
  if (iframeSrc.value) {
    layout.addIframeView(route)
  }
})
</script>
```

## 使用示例

### 标签栏组件核心逻辑

```vue
<template>
  <div class="tags-view-container">
    <router-link
      v-for="tag in visitedViews"
      :key="tag.path"
      :to="{ path: tag.path, query: tag.query }"
      :class="{ active: isActive(tag) }"
      class="tags-view-item"
      @contextmenu.prevent="openMenu(tag, $event)"
    >
      <span>{{ tag.meta.title }}</span>
      <el-icon v-if="!isAffix(tag)" @click.prevent.stop="closeTag(tag)">
        <Close />
      </el-icon>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const route = useRoute()
const router = useRouter()
const layout = useLayout()

const visitedViews = computed(() => layout.visitedViews.value)

const isActive = (tag) => tag.path === route.path
const isAffix = (tag) => tag.meta?.affix === true

const closeTag = async (tag) => {
  const { visitedViews } = await layout.delView(tag)
  if (isActive(tag)) {
    const latestView = visitedViews.slice(-1)[0]
    router.push(latestView || '/')
  }
}
</script>
```

### 右键菜单操作

```typescript
// 刷新当前页面（通过 redirect 实现）
const refresh = () => {
  router.replace({ path: '/redirect' + tag.path, query: tag.query })
}

// 关闭其他
const closeOthers = async () => {
  await layout.delOthersViews(tag)
  if (route.path !== tag.path) router.push(tag)
}

// 关闭左侧
const closeLeft = async () => {
  await layout.delLeftTags(tag)
  if (route.path !== tag.path) router.push(tag)
}

// 关闭右侧
const closeRight = async () => {
  await layout.delRightTags(tag)
  if (route.path !== tag.path) router.push(tag)
}

// 关闭全部
const closeAll = async () => {
  const { visitedViews } = await layout.delAllViews()
  if (!tag.meta?.affix) {
    router.push(visitedViews.slice(-1)[0] || '/')
  }
}
```

## 性能优化

### 标签数量限制

```typescript
const MAX_TAGS = 10

const addViewWithLimit = (view) => {
  layout.addView(view)

  const views = layout.visitedViews.value
  if (views.length > MAX_TAGS) {
    const firstNonAffix = views.find(v => !v.meta?.affix)
    if (firstNonAffix) layout.delView(firstNonAffix)
  }
}
```

### 缓存上限控制

```vue
<!-- max 属性限制最多缓存的组件数 -->
<keep-alive :include="cachedViews" :max="10">
  <router-view />
</keep-alive>
```

### 数据刷新策略

```vue
<script lang="ts" setup>
const lastFetchTime = ref(0)
const REFRESH_INTERVAL = 5 * 60 * 1000  // 5分钟

onActivated(() => {
  const elapsed = Date.now() - lastFetchTime.value
  if (elapsed > REFRESH_INTERVAL) {
    fetchList()
    lastFetchTime.value = Date.now()
  }
})
</script>
```

## API 参考

### 状态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `visitedViews` | `Ref<RouteLocationNormalized[]>` | 已访问视图列表 |
| `cachedViews` | `Ref<string[]>` | 缓存视图名称列表 |
| `iframeViews` | `Ref<RouteLocationNormalized[]>` | iframe 视图列表 |

### 标签管理方法

| 方法 | 说明 |
|------|------|
| `addView(view)` | 添加视图到已访问和缓存列表 |
| `addVisitedView(view)` | 添加视图到已访问列表 |
| `addCachedView(view)` | 添加视图到缓存列表 |
| `addIframeView(view)` | 添加 iframe 视图 |

### 删除方法

| 方法 | 说明 |
|------|------|
| `delView(view)` | 删除指定视图 |
| `delVisitedView(view)` | 删除已访问视图 |
| `delCachedView(view?)` | 删除缓存视图 |
| `delIframeView(view)` | 删除 iframe 视图 |

### 批量操作方法

| 方法 | 说明 |
|------|------|
| `delOthersViews(view)` | 删除其他视图 |
| `delAllViews()` | 删除所有视图 |
| `delRightTags(view)` | 删除右侧标签 |
| `delLeftTags(view)` | 删除左侧标签 |

### 工具方法

| 方法 | 说明 |
|------|------|
| `updateVisitedView(view)` | 更新已访问视图信息 |
| `isDynamicRoute(view)` | 判断是否为动态路由 |
| `getVisitedViews()` | 获取已访问视图列表副本 |
| `getCachedViews()` | 获取缓存视图列表副本 |
| `getIframeViews()` | 获取 iframe 视图列表副本 |

### 类型定义

```typescript
interface ViewsResult {
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}
```

## 最佳实践

### 1. 组件命名规范

```vue
<!-- 组件 name 必须与路由 name 一致 -->
<script lang="ts" setup>
defineOptions({ name: 'UserManagement' })
</script>

<!-- 路由配置 -->
{ path: '/user', name: 'UserManagement', ... }
```

### 2. 缓存控制策略

```typescript
// 表单页面不缓存
{ path: '/user/create', meta: { noCache: true } }

// 列表页面缓存（保持筛选条件）
{ path: '/user/list', meta: { /* 默认缓存 */ } }

// 实时数据不缓存
{ path: '/monitor', meta: { noCache: true } }
```

### 3. 动态路由标题更新

```typescript
watch(() => userDetail.value, (detail) => {
  if (detail) {
    layout.updateVisitedView({
      ...route,
      meta: { ...route.meta, title: `用户详情 - ${detail.name}` }
    })
  }
})
```

### 4. 清理资源防止内存泄漏

```vue
<script lang="ts" setup>
let timer: number | null = null

onMounted(() => {
  timer = setInterval(fetchData, 5000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('resize', handleResize)
})
</script>
```

## 常见问题

### 1. 页面缓存不生效

**问题描述:**

页面已添加到标签栏，但切换回来时数据丢失，表单内容清空，滚动位置重置，组件重新初始化。

**问题原因:**

- 组件未定义 `name` 属性或名称不正确
- 组件 `name` 与路由 `name` 不一致
- 路由配置了 `meta.noCache: true`
- keep-alive 的 `include` 列表未正确配置
- 使用了异步组件但未正确处理

**解决方案:**

```vue
<!-- ❌ 错误：未定义组件名称 -->
<script lang="ts" setup>
// 缺少 defineOptions 或组件名
import { ref } from 'vue'
</script>

<!-- ✅ 正确：定义与路由一致的组件名称 -->
<script lang="ts" setup>
defineOptions({
  name: 'UserManagement'  // 必须与路由 name 完全一致
})

import { ref } from 'vue'
</script>
```

**路由配置检查:**

```typescript
// 路由配置
const routes = [
  {
    path: '/user/management',
    name: 'UserManagement',  // ✅ 与组件 name 一致
    component: () => import('@/views/user/management.vue'),
    meta: {
      title: '用户管理',
      // noCache: true  // ⚠️ 如果设为 true 则不缓存
    }
  }
]
```

**缓存调试工具:**

```typescript
// composables/useTagsViewDebug.ts
export function useTagsViewDebug() {
  const layout = useLayout()

  // 检查缓存状态
  const checkCacheStatus = (routeName: string) => {
    const isCached = layout.cachedViews.value.includes(routeName)
    const isVisited = layout.visitedViews.value.some(v => v.name === routeName)

    console.group(`[TagsView Debug] ${routeName}`)
    console.log('是否在已访问列表:', isVisited)
    console.log('是否在缓存列表:', isCached)
    console.log('当前缓存列表:', layout.cachedViews.value)
    console.groupEnd()

    return { isCached, isVisited }
  }

  // 验证组件名称配置
  const validateComponentName = (route: RouteLocationNormalized) => {
    const routeName = route.name as string
    const componentName = route.matched[route.matched.length - 1]?.components?.default?.name

    if (routeName !== componentName) {
      console.warn(
        `[TagsView] 组件名称不匹配!\n` +
        `路由 name: ${routeName}\n` +
        `组件 name: ${componentName || '未定义'}\n` +
        `请确保两者一致以启用缓存`
      )
      return false
    }
    return true
  }

  return { checkCacheStatus, validateComponentName }
}
```

**异步组件缓存处理:**

```typescript
// 异步组件需要确保正确导出名称
const UserManagement = defineAsyncComponent({
  loader: () => import('@/views/user/management.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 30000
})

// 或者在组件内部确保 name 被正确定义
// views/user/management.vue
<script lang="ts" setup>
defineOptions({
  name: 'UserManagement'
})
</script>
```

**keep-alive 配置验证:**

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViewNames">
        <component
          :is="Component"
          :key="getViewKey(route)"
        />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 确保返回的是组件名称数组
const cachedViewNames = computed(() => {
  const names = layout.cachedViews.value
  console.log('[keep-alive] 当前缓存组件:', names)
  return names
})

// 为动态路由生成唯一 key
const getViewKey = (route: RouteLocationNormalized) => {
  // 对于动态路由，使用完整路径作为 key
  if (route.meta?.dynamicRoute) {
    return route.fullPath
  }
  return route.path
}
</script>
```

### 2. 动态路由参数变化时缓存失效或状态混乱

**问题描述:**

访问 `/user/1` 后再访问 `/user/2`，两个标签页显示相同的数据；或者参数变化后页面没有刷新数据。

**问题原因:**

- 动态路由使用同一组件实例，Vue 会复用组件
- `router-view` 的 key 设置不当
- 缓存策略未考虑动态参数场景
- 组件内部未监听路由参数变化

**解决方案:**

```vue
<!-- 方案一：使用完整路径作为 key -->
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViews">
      <component
        :is="Component"
        :key="route.fullPath"
      />
    </keep-alive>
  </router-view>
</template>
```

```typescript
// 方案二：动态路由特殊处理的缓存逻辑
// stores/tagsView.ts
interface DynamicRouteCache {
  baseName: string
  instances: Map<string, { params: Record<string, string>, timestamp: number }>
}

const dynamicRouteCache = new Map<string, DynamicRouteCache>()

// 添加动态路由视图
const addDynamicView = (view: RouteLocationNormalized) => {
  const baseName = view.name as string
  const fullPath = view.fullPath
  const params = { ...view.params }

  // 生成唯一缓存名称
  const cacheName = `${baseName}_${Object.values(params).join('_')}`

  // 添加到缓存列表
  if (!cachedViews.value.includes(cacheName)) {
    cachedViews.value.push(cacheName)
  }

  // 更新动态路由缓存记录
  if (!dynamicRouteCache.has(baseName)) {
    dynamicRouteCache.set(baseName, {
      baseName,
      instances: new Map()
    })
  }

  dynamicRouteCache.get(baseName)!.instances.set(fullPath, {
    params,
    timestamp: Date.now()
  })

  return cacheName
}

// 清理动态路由缓存
const clearDynamicRouteCache = (baseName: string) => {
  const cache = dynamicRouteCache.get(baseName)
  if (cache) {
    cache.instances.forEach((_, key) => {
      const cacheName = `${baseName}_${key}`
      const index = cachedViews.value.indexOf(cacheName)
      if (index > -1) {
        cachedViews.value.splice(index, 1)
      }
    })
    dynamicRouteCache.delete(baseName)
  }
}
```

```vue
<!-- 方案三：在组件内监听路由变化 -->
<script lang="ts" setup>
import { watch, onActivated } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'UserDetail'
})

const route = useRoute()
const userId = computed(() => route.params.id as string)
const userData = ref<UserInfo | null>(null)

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await loadUserData(newId as string)
    }
  },
  { immediate: true }
)

// 从缓存恢复时也检查数据
onActivated(() => {
  // 检查当前显示的数据是否与路由参数匹配
  if (userData.value?.id !== userId.value) {
    loadUserData(userId.value)
  }
})

const loadUserData = async (id: string) => {
  try {
    userData.value = await userApi.getDetail(id)
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}
</script>
```

```typescript
// 方案四：动态路由标签标题个性化
const updateDynamicRouteTitle = (
  route: RouteLocationNormalized,
  title: string
) => {
  const layout = useLayout()

  // 更新标签标题
  layout.updateVisitedView({
    ...route,
    meta: {
      ...route.meta,
      title
    }
  })
}

// 使用示例
watch(userData, (user) => {
  if (user) {
    updateDynamicRouteTitle(route, `用户详情 - ${user.name}`)
  }
})
```

**动态路由缓存管理器:**

```typescript
// composables/useDynamicRouteCache.ts
export function useDynamicRouteCache() {
  const layout = useLayout()
  const route = useRoute()

  // 缓存实例数据
  const instanceCache = new Map<string, unknown>()

  // 保存当前实例状态
  const saveInstanceState = <T>(key: string, state: T) => {
    const cacheKey = `${route.name}_${route.fullPath}_${key}`
    instanceCache.set(cacheKey, state)
  }

  // 恢复实例状态
  const restoreInstanceState = <T>(key: string, defaultValue: T): T => {
    const cacheKey = `${route.name}_${route.fullPath}_${key}`
    return (instanceCache.get(cacheKey) as T) ?? defaultValue
  }

  // 清除当前实例缓存
  const clearInstanceState = () => {
    const prefix = `${route.name}_${route.fullPath}_`
    for (const key of instanceCache.keys()) {
      if (key.startsWith(prefix)) {
        instanceCache.delete(key)
      }
    }
  }

  return {
    saveInstanceState,
    restoreInstanceState,
    clearInstanceState
  }
}

// 使用示例
const { saveInstanceState, restoreInstanceState } = useDynamicRouteCache()

// 保存表单状态
watch(formData, (data) => {
  saveInstanceState('formData', data)
}, { deep: true })

// 恢复表单状态
onActivated(() => {
  const savedData = restoreInstanceState('formData', defaultFormData)
  Object.assign(formData, savedData)
})
```

### 3. 关闭标签后路由跳转异常或页面空白

**问题描述:**

关闭当前标签后页面变成空白，或者跳转到了错误的页面；有时关闭标签后页面闪烁或出现短暂的白屏。

**问题原因:**

- 未判断关闭的是否为当前激活标签
- 跳转目标计算错误
- 异步删除操作未正确等待
- 路由守卫与标签删除逻辑冲突
- 固定标签处理不当

**解决方案:**

```typescript
// 完善的标签关闭逻辑
const closeTag = async (targetView: RouteLocationNormalized) => {
  const layout = useLayout()
  const router = useRouter()
  const route = useRoute()

  try {
    // 1. 执行删除操作
    const { visitedViews } = await layout.delView(targetView)

    // 2. 判断是否关闭的是当前页面
    const isCurrentView = targetView.path === route.path

    if (isCurrentView) {
      // 3. 计算跳转目标
      const nextView = findNextView(visitedViews, targetView)

      // 4. 执行跳转
      if (nextView) {
        await router.push({
          path: nextView.path,
          query: nextView.query
        })
      } else {
        // 没有可跳转的页面，回到首页
        await router.push('/')
      }
    }
  } catch (error) {
    console.error('关闭标签失败:', error)
    // 错误恢复：刷新标签列表
    layout.refreshViews()
  }
}

// 查找下一个要显示的视图
const findNextView = (
  views: RouteLocationNormalized[],
  closedView: RouteLocationNormalized
): RouteLocationNormalized | null => {
  // 优先选择最后访问的非固定标签
  const lastView = views[views.length - 1]
  if (lastView) return lastView

  // 如果有固定标签，返回第一个固定标签
  const affixView = views.find(v => v.meta?.affix)
  if (affixView) return affixView

  return null
}
```

**批量关闭的跳转处理:**

```typescript
// 关闭其他标签
const closeOtherTags = async (currentView: RouteLocationNormalized) => {
  const layout = useLayout()
  const router = useRouter()
  const route = useRoute()

  const { visitedViews } = await layout.delOthersViews(currentView)

  // 如果当前路由不是保留的视图，跳转到保留视图
  const isCurrentRetained = visitedViews.some(v => v.path === route.path)
  if (!isCurrentRetained) {
    await router.push(currentView)
  }
}

// 关闭所有标签
const closeAllTags = async () => {
  const layout = useLayout()
  const router = useRouter()

  const { visitedViews } = await layout.delAllViews()

  // 找到要跳转的目标（固定标签或首页）
  const affixView = visitedViews.find(v => v.meta?.affix)
  await router.push(affixView || '/')
}

// 关闭左侧/右侧标签
const closeSideTags = async (
  direction: 'left' | 'right',
  baseView: RouteLocationNormalized
) => {
  const layout = useLayout()
  const router = useRouter()
  const route = useRoute()

  const result = direction === 'left'
    ? await layout.delLeftTags(baseView)
    : await layout.delRightTags(baseView)

  // 检查当前路由是否被关闭
  const isCurrentClosed = !result.some(v => v.path === route.path)
  if (isCurrentClosed) {
    await router.push(baseView)
  }
}
```

**防止页面闪烁的过渡处理:**

```vue
<template>
  <div class="tags-view-wrapper">
    <ScrollPane ref="scrollPane">
      <TransitionGroup name="tags-fade" tag="div" class="tags-container">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.fullPath"
          :to="{ path: tag.path, query: tag.query }"
          :class="['tag-item', { active: isActive(tag) }]"
          @click.middle="!isAffix(tag) && closeTag(tag)"
        >
          <span class="tag-title">{{ tag.meta?.title }}</span>
          <el-icon
            v-if="!isAffix(tag)"
            class="tag-close"
            @click.prevent.stop="closeTag(tag)"
          >
            <Close />
          </el-icon>
        </router-link>
      </TransitionGroup>
    </ScrollPane>
  </div>
</template>

<style lang="scss" scoped>
.tags-fade-enter-active,
.tags-fade-leave-active {
  transition: all 0.3s ease;
}

.tags-fade-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.tags-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// 防止删除时的布局抖动
.tags-fade-leave-active {
  position: absolute;
}
</style>
```

### 4. 固定标签被意外删除或不显示

**问题描述:**

设置了 `affix: true` 的固定标签被关闭了，或者刷新页面后固定标签消失不见。

**问题原因:**

- 批量删除方法实现不正确
- 直接操作 `visitedViews` 数组绕过了保护逻辑
- 应用初始化时未正确加载固定标签
- 路由配置变更导致固定标签失效

**解决方案:**

```typescript
// stores/tagsView.ts - 正确的批量删除实现
const delOthersViews = async (view: RouteLocationNormalized) => {
  // 保留固定标签和当前视图
  const retainedViews = visitedViews.value.filter(v => {
    return v.meta?.affix === true || v.path === view.path
  })

  // 更新已访问列表
  visitedViews.value = retainedViews

  // 清理缓存（固定标签和当前视图的缓存保留）
  const retainedNames = retainedViews
    .map(v => v.name as string)
    .filter(Boolean)

  cachedViews.value = cachedViews.value.filter(name =>
    retainedNames.includes(name)
  )

  return {
    visitedViews: [...visitedViews.value],
    cachedViews: [...cachedViews.value]
  }
}

const delAllViews = async () => {
  // 只保留固定标签
  const affixViews = visitedViews.value.filter(v => v.meta?.affix === true)

  visitedViews.value = affixViews

  // 只保留固定标签的缓存
  const affixNames = affixViews.map(v => v.name as string).filter(Boolean)
  cachedViews.value = cachedViews.value.filter(name =>
    affixNames.includes(name)
  )

  return {
    visitedViews: [...visitedViews.value],
    cachedViews: [...cachedViews.value]
  }
}
```

**初始化固定标签:**

```typescript
// composables/useTagsView.ts
export function useTagsViewInit() {
  const layout = useLayout()
  const permissionStore = usePermissionStore()
  const router = useRouter()

  // 初始化固定标签
  const initAffixTags = () => {
    const affixRoutes = findAffixRoutes(permissionStore.routes)

    affixRoutes.forEach(route => {
      // 确保有 name 才添加
      if (route.name) {
        const tag: RouteLocationNormalized = {
          path: route.path,
          name: route.name,
          fullPath: route.path,
          params: {},
          query: {},
          hash: '',
          matched: [],
          meta: { ...route.meta },
          redirectedFrom: undefined
        }
        layout.addVisitedView(tag)
      }
    })
  }

  // 递归查找所有固定路由
  const findAffixRoutes = (routes: RouteRecordRaw[], basePath = ''): RouteRecordRaw[] => {
    const affixRoutes: RouteRecordRaw[] = []

    routes.forEach(route => {
      const fullPath = basePath + '/' + route.path
      const normalizedPath = fullPath.replace(/\/+/g, '/').replace(/\/$/, '')

      if (route.meta?.affix) {
        affixRoutes.push({
          ...route,
          path: normalizedPath
        })
      }

      if (route.children?.length) {
        affixRoutes.push(...findAffixRoutes(route.children, normalizedPath))
      }
    })

    return affixRoutes
  }

  // 应用启动时初始化
  const initialize = () => {
    // 确保路由已加载完成
    router.isReady().then(() => {
      initAffixTags()
    })
  }

  return { initialize, initAffixTags }
}

// App.vue 中调用
const { initialize } = useTagsViewInit()
onMounted(() => {
  initialize()
})
```

**固定标签保护检查:**

```typescript
// 删除视图前的保护检查
const safeDelView = async (view: RouteLocationNormalized) => {
  // 检查是否为固定标签
  if (view.meta?.affix === true) {
    console.warn('[TagsView] 固定标签不可删除:', view.name)
    return null
  }

  return layout.delView(view)
}

// 右键菜单中禁用固定标签的关闭选项
const getContextMenuItems = (tag: RouteLocationNormalized) => {
  const isAffix = tag.meta?.affix === true

  return [
    {
      label: '刷新',
      icon: 'Refresh',
      action: () => refresh(tag),
      disabled: false
    },
    {
      label: '关闭',
      icon: 'Close',
      action: () => closeTag(tag),
      disabled: isAffix  // 固定标签禁用关闭
    },
    {
      label: '关闭其他',
      icon: 'Remove',
      action: () => closeOtherTags(tag),
      disabled: false
    },
    // ...
  ]
}
```

### 5. 标签页状态丢失或表单数据未保存

**问题描述:**

切换标签后返回，表单填写的内容消失了；编辑中的数据没有自动保存；页面滚动位置丢失。

**问题原因:**

- 组件未正确使用 keep-alive 缓存
- 表单数据存储在局部变量而非响应式状态
- 未使用 `onActivated`/`onDeactivated` 处理恢复逻辑
- 滚动位置未记录和恢复

**解决方案:**

```vue
<!-- 完善的表单状态保持 -->
<script lang="ts" setup>
import {
  ref,
  reactive,
  watch,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted
} from 'vue'

defineOptions({
  name: 'UserForm'
})

// 表单数据
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  department: '',
  remark: ''
})

// 表单草稿 key
const DRAFT_KEY = 'user_form_draft'

// 保存草稿到 sessionStorage
const saveDraft = () => {
  const draft = {
    data: { ...formData },
    timestamp: Date.now(),
    path: route.fullPath
  }
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

// 恢复草稿
const restoreDraft = () => {
  try {
    const draftStr = sessionStorage.getItem(DRAFT_KEY)
    if (draftStr) {
      const draft = JSON.parse(draftStr)
      // 检查是否为同一路径且未过期（1小时）
      if (
        draft.path === route.fullPath &&
        Date.now() - draft.timestamp < 3600000
      ) {
        Object.assign(formData, draft.data)
        return true
      }
    }
  } catch (error) {
    console.warn('恢复草稿失败:', error)
  }
  return false
}

// 清除草稿
const clearDraft = () => {
  sessionStorage.removeItem(DRAFT_KEY)
}

// 监听表单变化，自动保存草稿
watch(
  () => formData,
  () => {
    saveDraft()
  },
  { deep: true }
)

// 页面激活时恢复状态
onActivated(() => {
  // 如果是从缓存恢复，表单数据会自动保持
  // 额外检查是否需要从草稿恢复
  console.log('[UserForm] 页面激活')
})

// 页面离开时保存状态
onDeactivated(() => {
  saveDraft()
  console.log('[UserForm] 页面休眠，已保存草稿')
})

// 提交成功后清除草稿
const handleSubmit = async () => {
  try {
    await submitForm(formData)
    clearDraft()
    ElMessage.success('提交成功')
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

// 首次加载时尝试恢复草稿
onMounted(() => {
  if (restoreDraft()) {
    ElMessage.info('已恢复上次编辑的内容')
  }
})
</script>
```

**滚动位置保持:**

```typescript
// composables/useScrollRestore.ts
export function useScrollRestore(containerRef: Ref<HTMLElement | null>) {
  const route = useRoute()
  const scrollPositions = new Map<string, number>()

  // 保存滚动位置
  const saveScrollPosition = () => {
    if (containerRef.value) {
      scrollPositions.set(route.fullPath, containerRef.value.scrollTop)
    }
  }

  // 恢复滚动位置
  const restoreScrollPosition = () => {
    const position = scrollPositions.get(route.fullPath)
    if (containerRef.value && position !== undefined) {
      nextTick(() => {
        containerRef.value!.scrollTop = position
      })
    }
  }

  onDeactivated(() => {
    saveScrollPosition()
  })

  onActivated(() => {
    restoreScrollPosition()
  })

  return { saveScrollPosition, restoreScrollPosition }
}

// 使用示例
const containerRef = ref<HTMLElement | null>(null)
const { saveScrollPosition, restoreScrollPosition } = useScrollRestore(containerRef)
```

**表格选择状态保持:**

```typescript
// composables/useTableStateRestore.ts
export function useTableStateRestore(tableKey: string) {
  const route = useRoute()

  interface TableState {
    currentPage: number
    pageSize: number
    selectedKeys: string[]
    filters: Record<string, unknown>
    sorter: { field: string; order: 'asc' | 'desc' } | null
  }

  const stateKey = computed(() => `table_state_${tableKey}_${route.fullPath}`)

  const saveState = (state: Partial<TableState>) => {
    const existing = loadState()
    const merged = { ...existing, ...state }
    sessionStorage.setItem(stateKey.value, JSON.stringify(merged))
  }

  const loadState = (): TableState => {
    try {
      const stored = sessionStorage.getItem(stateKey.value)
      return stored ? JSON.parse(stored) : getDefaultState()
    } catch {
      return getDefaultState()
    }
  }

  const getDefaultState = (): TableState => ({
    currentPage: 1,
    pageSize: 10,
    selectedKeys: [],
    filters: {},
    sorter: null
  })

  const clearState = () => {
    sessionStorage.removeItem(stateKey.value)
  }

  return { saveState, loadState, clearState }
}
```

### 6. iframe 页面加载失败或显示空白

**问题描述:**

内嵌的 iframe 页面显示空白，或加载时报跨域错误；切换标签后 iframe 重新加载；iframe 页面无法与主应用通信。

**问题原因:**

- 目标网站设置了 `X-Frame-Options` 禁止嵌入
- iframe 的 `src` 设置时机不正确
- 跨域限制阻止了资源加载
- iframe 视图未正确管理导致重复创建

**解决方案:**

```vue
<!-- 增强的 InnerLink 组件 -->
<template>
  <div class="inner-link-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>正在加载...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-overlay">
      <el-icon class="error-icon"><WarningFilled /></el-icon>
      <h3>页面加载失败</h3>
      <p>{{ error }}</p>
      <el-button type="primary" @click="retry">重新加载</el-button>
      <el-button @click="openExternal">在新窗口打开</el-button>
    </div>

    <!-- iframe 内容 -->
    <iframe
      v-show="!loading && !error"
      ref="iframeRef"
      :src="iframeSrc"
      frameborder="0"
      width="100%"
      height="100%"
      @load="handleLoad"
      @error="handleError"
      :sandbox="sandboxRules"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

defineOptions({
  name: 'InnerLink'
})

const route = useRoute()
const layout = useLayout()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const loadAttempts = ref(0)
const MAX_ATTEMPTS = 3

// 从路由获取链接
const iframeSrc = computed(() => {
  const link = route.meta?.link as string
  if (!link) {
    error.value = '未配置有效链接'
    return ''
  }
  return link
})

// 沙箱规则（根据需要调整）
const sandboxRules = computed(() => {
  // 严格模式
  // return 'allow-scripts allow-same-origin'

  // 宽松模式（允许更多功能）
  return 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals'
})

const handleLoad = () => {
  loading.value = false
  error.value = null
  loadAttempts.value = 0

  // 注册到 iframe 视图列表
  layout.addIframeView(route)
}

const handleError = (e: Event) => {
  loadAttempts.value++

  if (loadAttempts.value < MAX_ATTEMPTS) {
    // 重试
    setTimeout(() => {
      if (iframeRef.value) {
        iframeRef.value.src = iframeSrc.value
      }
    }, 1000 * loadAttempts.value)
  } else {
    loading.value = false
    error.value = '页面加载失败，可能是网络问题或该网站禁止嵌入'
  }
}

const retry = () => {
  loading.value = true
  error.value = null
  loadAttempts.value = 0
  if (iframeRef.value) {
    iframeRef.value.src = ''
    nextTick(() => {
      iframeRef.value!.src = iframeSrc.value
    })
  }
}

const openExternal = () => {
  window.open(iframeSrc.value, '_blank')
}

// iframe 通信
const handleMessage = (event: MessageEvent) => {
  // 验证消息来源
  const trustedOrigins = ['https://trusted-site.com']
  if (!trustedOrigins.includes(event.origin)) return

  // 处理消息
  const { type, data } = event.data
  switch (type) {
    case 'NAVIGATION':
      // 处理导航请求
      break
    case 'NOTIFICATION':
      ElMessage.info(data.message)
      break
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
  // 清理 iframe 视图
  layout.delIframeView(route)
})
</script>

<style lang="scss" scoped>
.inner-link-container {
  position: relative;
  width: 100%;
  height: 100%;

  iframe {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
}

.loading-icon {
  font-size: 48px;
  animation: rotating 2s linear infinite;
}

.error-icon {
  font-size: 48px;
  color: var(--el-color-warning);
}
</style>
```

**iframe 视图管理优化:**

```typescript
// stores/tagsView.ts - iframe 视图特殊处理
const iframeViews = ref<RouteLocationNormalized[]>([])

// 添加 iframe 视图（避免重复）
const addIframeView = (view: RouteLocationNormalized) => {
  const exists = iframeViews.value.some(v => v.path === view.path)
  if (!exists && view.meta?.link) {
    iframeViews.value.push({ ...view })
  }
}

// 删除 iframe 视图
const delIframeView = async (view: RouteLocationNormalized) => {
  const index = iframeViews.value.findIndex(v => v.path === view.path)
  if (index > -1) {
    iframeViews.value.splice(index, 1)
  }
  return [...iframeViews.value]
}

// 获取 iframe 视图（用于多 iframe 同时显示）
const getIframeViews = () => [...iframeViews.value]

// iframe 预加载
const preloadIframe = (url: string) => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'document'
  link.href = url
  document.head.appendChild(link)
}
```

### 7. 标签页过多导致性能下降或内存泄漏

**问题描述:**

打开大量标签页后页面变卡顿，内存占用持续升高，切换标签变慢，浏览器崩溃。

**问题原因:**

- 无限制地添加标签和缓存
- 组件未正确清理定时器、事件监听等资源
- keep-alive 缓存过多组件
- 大数据组件（如大表格、图表）未释放内存

**解决方案:**

```typescript
// composables/useTagsViewLimit.ts
export function useTagsViewLimit(options: {
  maxTags?: number
  maxCache?: number
  excludeAffix?: boolean
} = {}) {
  const {
    maxTags = 15,
    maxCache = 10,
    excludeAffix = true
  } = options

  const layout = useLayout()

  // 添加视图时检查限制
  const addViewWithLimit = async (view: RouteLocationNormalized) => {
    // 先添加视图
    layout.addView(view)

    // 检查标签数量
    await checkTagsLimit()
    await checkCacheLimit()
  }

  // 检查并清理超出的标签
  const checkTagsLimit = async () => {
    const views = layout.visitedViews.value
    const closableViews = excludeAffix
      ? views.filter(v => !v.meta?.affix)
      : views

    if (closableViews.length > maxTags) {
      // 找出最早的非固定标签
      const oldestView = closableViews[0]
      await layout.delView(oldestView)

      // 提示用户
      ElMessage.info({
        message: `已自动关闭较早的标签「${oldestView.meta?.title}」`,
        duration: 2000
      })
    }
  }

  // 检查并清理超出的缓存
  const checkCacheLimit = async () => {
    const cached = layout.cachedViews.value
    if (cached.length > maxCache) {
      // 获取需要保留的缓存名称（当前显示的标签）
      const visibleNames = layout.visitedViews.value
        .map(v => v.name as string)
        .filter(Boolean)

      // 清理不在显示列表中的缓存
      const toRemove = cached.filter(name => !visibleNames.includes(name))

      toRemove.slice(0, cached.length - maxCache).forEach(name => {
        const index = layout.cachedViews.value.indexOf(name)
        if (index > -1) {
          layout.cachedViews.value.splice(index, 1)
        }
      })
    }
  }

  return { addViewWithLimit }
}
```

**组件资源清理模板:**

```vue
<script lang="ts" setup>
import {
  ref,
  onMounted,
  onUnmounted,
  onDeactivated,
  onActivated
} from 'vue'

defineOptions({
  name: 'HeavyComponent'
})

// 资源引用
let timer: ReturnType<typeof setInterval> | null = null
let observer: IntersectionObserver | null = null
let abortController: AbortController | null = null
const eventHandlers = new Map<string, EventListener>()

// 初始化资源
const initResources = () => {
  // 定时器
  timer = setInterval(refreshData, 30000)

  // 观察器
  observer = new IntersectionObserver(handleIntersection)

  // 事件监听
  const resizeHandler = debounce(handleResize, 200)
  window.addEventListener('resize', resizeHandler)
  eventHandlers.set('resize', resizeHandler)

  // AbortController 用于取消请求
  abortController = new AbortController()
}

// 清理资源
const cleanupResources = () => {
  // 清理定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // 清理观察器
  if (observer) {
    observer.disconnect()
    observer = null
  }

  // 清理事件监听
  eventHandlers.forEach((handler, event) => {
    window.removeEventListener(event, handler)
  })
  eventHandlers.clear()

  // 取消未完成的请求
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

// 暂停资源（标签切走时）
const pauseResources = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 恢复资源（标签切回时）
const resumeResources = () => {
  if (!timer) {
    timer = setInterval(refreshData, 30000)
  }
}

onMounted(() => {
  initResources()
})

onUnmounted(() => {
  cleanupResources()
})

onDeactivated(() => {
  // 标签切走时暂停，节省资源
  pauseResources()
})

onActivated(() => {
  // 标签切回时恢复
  resumeResources()
})
</script>
```

**内存监控工具:**

```typescript
// utils/memoryMonitor.ts
export function createMemoryMonitor() {
  let monitoring = false
  let lastHeapSize = 0

  const checkMemory = () => {
    if (!('memory' in performance)) {
      console.warn('Memory API 不可用')
      return
    }

    const memory = (performance as any).memory
    const heapSize = memory.usedJSHeapSize / 1024 / 1024

    // 检测内存增长
    const growth = heapSize - lastHeapSize
    if (growth > 50) {
      console.warn(`[Memory] 内存增长 ${growth.toFixed(2)} MB`)
    }

    // 检测内存过高
    if (heapSize > 500) {
      console.error(`[Memory] 内存使用过高: ${heapSize.toFixed(2)} MB`)
      // 触发清理
      triggerCleanup()
    }

    lastHeapSize = heapSize
  }

  const triggerCleanup = () => {
    // 清理过期缓存
    const layout = useLayout()
    const views = layout.visitedViews.value
    const cached = layout.cachedViews.value

    // 只保留当前显示的标签的缓存
    const visibleNames = views.map(v => v.name as string)
    cached.forEach(name => {
      if (!visibleNames.includes(name)) {
        const index = layout.cachedViews.value.indexOf(name)
        if (index > -1) {
          layout.cachedViews.value.splice(index, 1)
        }
      }
    })
  }

  const start = () => {
    if (monitoring) return
    monitoring = true
    setInterval(checkMemory, 10000)
  }

  const stop = () => {
    monitoring = false
  }

  return { start, stop, checkMemory }
}
```

### 8. 多浏览器窗口或标签下状态不同步

**问题描述:**

在浏览器新窗口/标签页打开应用，两个窗口的标签状态不同步；一个窗口关闭标签后另一个窗口仍然显示。

**问题原因:**

- Pinia 状态只存在于单个页面内存中
- 浏览器多窗口间无法共享 JavaScript 状态
- localStorage/sessionStorage 未用于持久化
- 未使用跨窗口通信机制

**解决方案:**

```typescript
// stores/tagsView.ts - 添加持久化支持
import { watch } from 'vue'

const STORAGE_KEY = 'tags_view_state'

// 保存状态到 localStorage
const persistState = () => {
  const state = {
    visitedViews: visitedViews.value.map(v => ({
      path: v.path,
      fullPath: v.fullPath,
      name: v.name,
      meta: v.meta,
      query: v.query
    })),
    cachedViews: cachedViews.value,
    timestamp: Date.now()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// 从 localStorage 恢复状态
const restoreState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const state = JSON.parse(stored)
      // 检查时效性（1小时内有效）
      if (Date.now() - state.timestamp < 3600000) {
        visitedViews.value = state.visitedViews
        cachedViews.value = state.cachedViews
        return true
      }
    }
  } catch (error) {
    console.warn('恢复标签状态失败:', error)
  }
  return false
}

// 监听状态变化并持久化
watch(
  [visitedViews, cachedViews],
  () => {
    persistState()
  },
  { deep: true }
)
```

**跨窗口同步 (BroadcastChannel):**

```typescript
// composables/useTagsViewSync.ts
export function useTagsViewSync() {
  const layout = useLayout()
  let channel: BroadcastChannel | null = null

  // 消息类型
  type SyncMessage =
    | { type: 'ADD_VIEW'; view: SerializedView }
    | { type: 'DEL_VIEW'; path: string }
    | { type: 'DEL_ALL'; affixPaths: string[] }
    | { type: 'SYNC_REQUEST' }
    | { type: 'SYNC_RESPONSE'; views: SerializedView[] }

  interface SerializedView {
    path: string
    fullPath: string
    name: string
    meta: Record<string, unknown>
    query: Record<string, string>
  }

  // 初始化同步
  const initSync = () => {
    if (!('BroadcastChannel' in window)) {
      console.warn('BroadcastChannel 不可用，跨窗口同步已禁用')
      return
    }

    channel = new BroadcastChannel('tags_view_sync')

    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      handleMessage(event.data)
    }

    // 请求同步现有状态
    channel.postMessage({ type: 'SYNC_REQUEST' })
  }

  // 处理同步消息
  const handleMessage = (message: SyncMessage) => {
    switch (message.type) {
      case 'ADD_VIEW':
        syncAddView(message.view)
        break
      case 'DEL_VIEW':
        syncDelView(message.path)
        break
      case 'DEL_ALL':
        syncDelAll(message.affixPaths)
        break
      case 'SYNC_REQUEST':
        respondWithState()
        break
      case 'SYNC_RESPONSE':
        mergeViews(message.views)
        break
    }
  }

  // 发送同步消息
  const broadcastAddView = (view: RouteLocationNormalized) => {
    channel?.postMessage({
      type: 'ADD_VIEW',
      view: serializeView(view)
    })
  }

  const broadcastDelView = (path: string) => {
    channel?.postMessage({
      type: 'DEL_VIEW',
      path
    })
  }

  // 序列化视图对象
  const serializeView = (view: RouteLocationNormalized): SerializedView => ({
    path: view.path,
    fullPath: view.fullPath,
    name: view.name as string,
    meta: { ...view.meta },
    query: { ...view.query } as Record<string, string>
  })

  // 同步添加视图
  const syncAddView = (serialized: SerializedView) => {
    const exists = layout.visitedViews.value.some(v => v.path === serialized.path)
    if (!exists) {
      layout.visitedViews.value.push(deserializeView(serialized))
    }
  }

  // 同步删除视图
  const syncDelView = (path: string) => {
    const index = layout.visitedViews.value.findIndex(v => v.path === path)
    if (index > -1) {
      layout.visitedViews.value.splice(index, 1)
    }
  }

  // 同步删除全部
  const syncDelAll = (affixPaths: string[]) => {
    layout.visitedViews.value = layout.visitedViews.value.filter(v =>
      affixPaths.includes(v.path)
    )
  }

  // 响应同步请求
  const respondWithState = () => {
    channel?.postMessage({
      type: 'SYNC_RESPONSE',
      views: layout.visitedViews.value.map(serializeView)
    })
  }

  // 合并其他窗口的视图
  const mergeViews = (views: SerializedView[]) => {
    views.forEach(view => {
      syncAddView(view)
    })
  }

  // 反序列化视图
  const deserializeView = (serialized: SerializedView): RouteLocationNormalized => ({
    path: serialized.path,
    fullPath: serialized.fullPath,
    name: serialized.name,
    meta: serialized.meta,
    query: serialized.query,
    params: {},
    hash: '',
    matched: [],
    redirectedFrom: undefined
  })

  // 清理
  const cleanup = () => {
    channel?.close()
    channel = null
  }

  return {
    initSync,
    cleanup,
    broadcastAddView,
    broadcastDelView
  }
}
```

**使用 SharedWorker 实现更强大的同步:**

```typescript
// workers/tagsViewWorker.ts
const connections: MessagePort[] = []
let sharedState: { visitedViews: unknown[]; cachedViews: string[] } = {
  visitedViews: [],
  cachedViews: []
}

self.onconnect = (event: MessageEvent) => {
  const port = event.ports[0]
  connections.push(port)

  port.onmessage = (e: MessageEvent) => {
    const { type, data } = e.data

    switch (type) {
      case 'UPDATE_STATE':
        sharedState = data
        // 广播到所有连接
        connections.forEach(conn => {
          if (conn !== port) {
            conn.postMessage({ type: 'STATE_UPDATED', data: sharedState })
          }
        })
        break

      case 'GET_STATE':
        port.postMessage({ type: 'CURRENT_STATE', data: sharedState })
        break
    }
  }

  port.start()

  // 发送当前状态给新连接
  port.postMessage({ type: 'CURRENT_STATE', data: sharedState })
}

// composables/useSharedTagsView.ts
export function useSharedTagsView() {
  let worker: SharedWorker | null = null

  const init = () => {
    if (!('SharedWorker' in window)) {
      console.warn('SharedWorker 不可用')
      return
    }

    worker = new SharedWorker(
      new URL('../workers/tagsViewWorker.ts', import.meta.url)
    )

    worker.port.onmessage = (event) => {
      const { type, data } = event.data
      if (type === 'STATE_UPDATED' || type === 'CURRENT_STATE') {
        // 更新本地状态
        applySharedState(data)
      }
    }

    worker.port.start()
  }

  const syncState = (state: unknown) => {
    worker?.port.postMessage({ type: 'UPDATE_STATE', data: state })
  }

  return { init, syncState }
}
```

## 总结

标签视图管理系统通过 `useLayout` Composable 提供完整的多标签页管理能力：

- **完整的标签管理**: 15+ 个标签操作方法
- **智能缓存系统**: 基于 keep-alive 的页面状态保持
- **灵活的批量操作**: 关闭其他、关闭左侧、关闭右侧、关闭全部
- **固定标签支持**: 重要页面不可关闭
- **Iframe 集成**: 无缝集成第三方系统

使用建议：遵循命名规范、合理控制缓存、正确使用生命周期钩子。
