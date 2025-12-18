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

**原因:** 组件未设置 `name` 或与路由 `name` 不一致

**解决:** 确保组件 `defineOptions({ name: 'xxx' })` 与路由 `name` 相同

### 2. 动态路由参数变化时缓存失效

**原因:** 动态路由使用同一组件实例

**解决:** 使用 `route.path` 作为 key：`<router-view :key="route.path" />`

### 3. 关闭标签后路由跳转错误

**原因:** 未判断是否关闭的是当前激活标签

**解决:** 关闭当前标签后跳转到最后一个标签或首页

### 4. 固定标签被意外关闭

**原因:** 批量删除方法未正确过滤固定标签

**解决:** 使用提供的方法操作，不要直接修改 `visitedViews` 数组

## 总结

标签视图管理系统通过 `useLayout` Composable 提供完整的多标签页管理能力：

- **完整的标签管理**: 15+ 个标签操作方法
- **智能缓存系统**: 基于 keep-alive 的页面状态保持
- **灵活的批量操作**: 关闭其他、关闭左侧、关闭右侧、关闭全部
- **固定标签支持**: 重要页面不可关闭
- **Iframe 集成**: 无缝集成第三方系统

使用建议：遵循命名规范、合理控制缓存、正确使用生命周期钩子。
