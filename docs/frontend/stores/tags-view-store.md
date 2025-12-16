# 标签视图管理 (tagsView)

## 介绍

标签视图管理模块是前端框架的核心导航组件,提供类似浏览器多标签页的页面管理体验。该模块通过 `useLayout` Composable 中的 `tagsViewMethods` 实现,支持标签的添加、删除、批量操作、keep-alive 缓存管理和 iframe 页面支持,为用户提供流畅的多页面切换和状态保持能力。

标签视图系统采用三种状态管理策略:已访问视图列表 (`visitedViews`) 用于标签栏展示,缓存视图列表 (`cachedViews`) 用于 keep-alive 组件缓存,iframe 视图列表 (`iframeViews`) 用于管理外部链接页面。通过路由监听、生命周期钩子和状态同步机制,系统能够自动管理页面缓存、优化内存使用,并提供固定标签、动态路由识别、批量关闭等高级功能。

**核心特性:**

- **多标签导航** - 类似浏览器的多标签页体验,支持标签的添加、删除、切换和右键菜单操作
- **智能缓存** - 基于 keep-alive 的页面状态缓存,自动管理组件生命周期,优化性能和用户体验
- **固定标签** - 支持重要页面设置为固定标签,不可关闭且始终显示,确保核心页面访问便捷
- **批量操作** - 提供关闭其他、关闭左侧、关闭右侧、关闭全部等批量操作,快速管理大量标签
- **动态路由支持** - 智能识别带参数的动态路由,避免错误清理缓存,确保路由参数变化时正常工作
- **iframe 集成** - 支持内嵌外部页面,独立管理 iframe 生命周期,提供无缝的第三方系统集成
- **状态持久化** - 标签状态与缓存状态实时同步,确保页面刷新后恢复正确的标签和缓存状态

## 状态定义

### TagsViewState 接口

标签视图状态通过 `TagsViewState` 接口定义,包含三个核心数组:

```typescript
/**
 * 标签视图状态接口
 * @description 多标签页功能的状态管理
 */
interface TagsViewState {
  /** 已访问的视图列表 - 标签栏显示的所有页面 */
  visitedViews: RouteLocationNormalized[]

  /** 缓存的视图名称列表 - keep-alive 缓存的组件名称 */
  cachedViews: string[]

  /** iframe 视图列表 - 内嵌外部链接的页面 */
  iframeViews: RouteLocationNormalized[]
}
```

### visitedViews - 已访问视图

存储用户访问过的所有页面路由信息,用于标签栏渲染:

```typescript
/**
 * 已访问视图数组
 * @type RouteLocationNormalized[]
 * @description 存储完整的路由信息对象
 */
visitedViews: RouteLocationNormalized[]

/**
 * RouteLocationNormalized 类型 (Vue Router 提供)
 */
interface RouteLocationNormalized {
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name: string | symbol
  /** 路由参数 */
  params: Record<string, string>
  /** 查询参数 */
  query: Record<string, string>
  /** 路由元信息 */
  meta: {
    /** 页面标题 */
    title?: string
    /** 是否固定标签 */
    affix?: boolean
    /** 是否缓存页面 */
    noCache?: boolean
    /** iframe 链接 */
    link?: string
    [key: string]: any
  }
  /** 匹配的路由记录 */
  matched: RouteRecordNormalized[]
  // ... 其他路由属性
}
```

**特点:**

- 包含完整的路由信息(路径、参数、查询、元信息等)
- 支持固定标签 (`meta.affix = true`)
- 自动去重,同一路径只存在一个标签
- 按访问顺序排列

### cachedViews - 缓存视图

存储需要 keep-alive 缓存的组件名称列表:

```typescript
/**
 * 缓存视图名称数组
 * @type string[]
 * @description 存储组件名称字符串,供 keep-alive 使用
 */
cachedViews: string[]

/**
 * 示例值
 */
cachedViews: [
  'UserManagement',    // 用户管理组件名
  'RoleManagement',    // 角色管理组件名
  'MenuManagement'     // 菜单管理组件名
]
```

**缓存规则:**

1. 组件必须定义 `name` 属性
2. 组件 `name` 必须与路由 `name` 一致
3. 路由 `meta.noCache` 为 `true` 时不缓存
4. 动态路由特殊处理,避免缓存冲突

### iframeViews - Iframe 视图

存储内嵌外部链接的页面信息:

```typescript
/**
 * iframe 视图数组
 * @type RouteLocationNormalized[]
 * @description 管理内嵌外部页面的路由信息
 */
iframeViews: RouteLocationNormalized[]

/**
 * iframe 视图示例
 */
{
  path: '/external/system',
  name: 'ExternalSystem',
  meta: {
    title: '外部系统',
    link: 'https://example.com'  // 外部链接地址
  }
}
```

**使用场景:**

- 嵌入第三方管理系统
- 集成外部文档或帮助页面
- 内嵌数据可视化平台
- 对接其他业务系统

### 初始化状态

标签视图状态在 `useLayout` 初始化时创建:

```typescript
/**
 * 创建标签视图初始状态
 * @returns 标签视图状态对象，包含三个空数组
 */
const createTagsViewState = (): TagsViewState => ({
  visitedViews: [],  // 已访问的视图
  cachedViews: [],   // 缓存的视图名称
  iframeViews: []    // iframe 视图
})

/**
 * 布局状态初始化
 */
const state = reactive<LayoutState>({
  // ... 其他状态
  tagsView: createTagsViewState(),
  // ...
})
```

## 核心方法

### addView - 添加视图

同时添加视图到已访问列表和缓存列表,这是最常用的添加方法:

```typescript
/**
 * 添加视图到已访问和缓存列表
 * @param view 路由视图对象
 *
 * 技术实现:
 * 1. 调用 addVisitedView 添加到标签栏
 * 2. 调用 addCachedView 添加到 keep-alive 缓存
 * 3. 两个操作互不影响,即使缓存添加失败也会显示标签
 */
addView(view: RouteLocationNormalized) {
  this.addVisitedView(view)
  this.addCachedView(view)
}
```

**使用场景:**

- 路由切换时自动添加新页面
- 用户访问新页面时创建标签
- 恢复页面刷新前的标签状态

**示例:**

```typescript
import { useLayout } from '@/composables/useLayout'
import { useRoute } from 'vue-router'

const layout = useLayout()
const route = useRoute()

// 监听路由变化,自动添加标签
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

### addVisitedView - 添加已访问视图

将视图添加到已访问列表,在标签栏显示:

```typescript
/**
 * 添加视图到已访问列表
 * @param view 路由视图对象
 * @description 如果视图已存在则不重复添加
 *
 * 技术实现:
 * 1. 检查 visitedViews 中是否已存在相同 path 的视图
 * 2. 如果不存在,则添加新视图到数组末尾
 * 3. 设置视图标题为 meta.title 或 'no-name'
 */
addVisitedView(view: RouteLocationNormalized) {
  // 检查是否已存在
  if (state.tagsView.visitedViews.some((v) => v.path === view.path)) {
    return
  }

  // 添加新视图
  state.tagsView.visitedViews.push({
    ...view,
    title: view.meta?.title || 'no-name'
  })
}
```

**去重机制:**

系统通过 `path` 进行去重,即使路由参数不同,只要 `path` 相同就认为是同一个视图。

**标题处理:**

- 优先使用 `meta.title`
- 如果没有 `title`,使用 `'no-name'` 作为默认值
- 可以通过 `updateVisitedView` 动态更新标题

### addCachedView - 添加缓存视图

将视图添加到 keep-alive 缓存列表:

```typescript
/**
 * 添加视图到缓存列表
 * @param view 路由视图对象
 * @description 只缓存有名称且未设置 noCache 的视图
 *
 * 技术实现:
 * 1. 获取路由的 name 属性作为组件名称
 * 2. 检查 name 是否存在且未在缓存列表中
 * 3. 检查 meta.noCache 是否为 true
 * 4. 满足条件则添加到 cachedViews 数组
 */
addCachedView(view: RouteLocationNormalized) {
  const viewName = view.name as string

  // name 不存在或已缓存,直接返回
  if (!viewName || state.tagsView.cachedViews.includes(viewName)) {
    return
  }

  // 检查是否禁用缓存
  if (!view.meta?.noCache) {
    state.tagsView.cachedViews.push(viewName)
  }
}
```

**缓存条件:**

1. **必要条件**: 路由必须有 `name` 属性
2. **排除条件**: `meta.noCache` 为 `true` 时不缓存
3. **去重条件**: 已存在的组件名不重复添加

**组件命名要求:**

```vue
<!-- ✅ 正确: 组件 name 与路由 name 一致 -->
<script lang="ts" setup>
defineOptions({
  name: 'UserManagement'  // 与路由 name 相同
})
</script>

<!-- 路由配置 -->
{
  path: '/user',
  name: 'UserManagement',  // 与组件 name 相同
  component: UserManagement
}
```

### addIframeView - 添加 Iframe 视图

添加内嵌外部链接的页面:

```typescript
/**
 * 添加 iframe 视图
 * @param view 路由视图对象
 * @description 管理外部链接页面的路由信息
 *
 * 技术实现:
 * 1. 检查 iframeViews 中是否已存在相同 path 的视图
 * 2. 如果不存在,则添加新视图到数组末尾
 * 3. 设置视图标题为 meta.title 或 'no-name'
 * 4. iframe 的 src 从 meta.link 获取
 */
addIframeView(view: RouteLocationNormalized) {
  // 检查是否已存在
  if (state.tagsView.iframeViews.some((v) => v.path === view.path)) {
    return
  }

  // 添加新 iframe 视图
  state.tagsView.iframeViews.push({
    ...view,
    title: view.meta?.title || 'no-name'
  })
}
```

**路由配置示例:**

```typescript
{
  path: '/external/docs',
  name: 'ExternalDocs',
  component: () => import('@/views/system/InnerLink.vue'),
  meta: {
    title: '在线文档',
    link: 'https://docs.example.com',  // 外部链接
    icon: 'link'
  }
}
```

### delView - 删除视图

删除指定视图及其缓存:

```typescript
/**
 * 删除指定视图
 * @param view 要删除的路由视图
 * @returns Promise 包含删除后的视图列表
 *
 * 技术实现:
 * 1. 调用 delVisitedView 从标签栏移除
 * 2. 如果不是动态路由,调用 delCachedView 清理缓存
 * 3. 返回更新后的 visitedViews 和 cachedViews
 */
async delView(view: RouteLocationNormalized) {
  await this.delVisitedView(view)

  // 动态路由不删除缓存,避免参数变化导致缓存丢失
  if (!this.isDynamicRoute(view)) {
    await this.delCachedView(view)
  }

  return {
    visitedViews: this.getVisitedViews(),
    cachedViews: this.getCachedViews()
  }
}
```

**动态路由特殊处理:**

动态路由 (如 `/user/:id`) 的缓存不会被删除,因为同一组件可能服务多个不同参数的路由。

**使用示例:**

```typescript
/**
 * 关闭当前标签
 */
const closeCurrentTag = async () => {
  const route = useRoute()
  const router = useRouter()
  const layout = useLayout()

  // 删除视图
  const { visitedViews } = await layout.delView(route)

  // 如果关闭的是当前页,跳转到最后一个标签
  if (isActive(route)) {
    const latestView = visitedViews[visitedViews.length - 1]
    if (latestView) {
      router.push(latestView)
    } else {
      router.push('/')
    }
  }
}
```

### delVisitedView - 删除已访问视图

从已访问列表中删除视图:

```typescript
/**
 * 从已访问列表中删除视图
 * @param view 要删除的路由视图
 * @returns Promise 包含更新后的已访问视图列表
 *
 * 技术实现:
 * 1. 在 visitedViews 中查找匹配 path 的视图索引
 * 2. 如果找到,使用 splice 从数组中移除
 * 3. 返回更新后的视图列表副本
 */
async delVisitedView(view: RouteLocationNormalized) {
  const index = state.tagsView.visitedViews.findIndex(
    (v) => v.path === view.path
  )

  if (index > -1) {
    state.tagsView.visitedViews.splice(index, 1)
  }

  return this.getVisitedViews()
}
```

### delCachedView - 删除缓存视图

从缓存列表中删除视图:

```typescript
/**
 * 从缓存列表中删除视图
 * @param view 要删除的路由视图，为空则清空所有缓存
 * @returns Promise 包含更新后的缓存视图列表
 *
 * 技术实现:
 * 1. 如果提供 view,从 cachedViews 中移除对应的组件名
 * 2. 如果不提供 view,清空整个 cachedViews 数组
 * 3. 返回更新后的缓存列表副本
 */
async delCachedView(view?: RouteLocationNormalized) {
  if (view) {
    const viewName = view.name as string
    const index = state.tagsView.cachedViews.indexOf(viewName)

    if (index > -1) {
      state.tagsView.cachedViews.splice(index, 1)
    }
  } else {
    // 清空所有缓存
    state.tagsView.cachedViews = []
  }

  return this.getCachedViews()
}
```

**清空所有缓存:**

```typescript
// 清空所有页面缓存
await layout.delCachedView()

// keep-alive 组件会销毁所有缓存的组件实例
```

### delIframeView - 删除 Iframe 视图

删除 iframe 视图:

```typescript
/**
 * 删除 iframe 视图
 * @param view 要删除的路由视图
 * @returns Promise 包含更新后的 iframe 视图列表
 *
 * 技术实现:
 * 1. 使用 filter 过滤掉匹配 path 的视图
 * 2. 更新 iframeViews 数组
 * 3. 返回更新后的 iframe 视图列表副本
 */
async delIframeView(view: RouteLocationNormalized) {
  state.tagsView.iframeViews = state.tagsView.iframeViews.filter(
    (item) => item.path !== view.path
  )

  return this.getIframeViews()
}
```

### delOthersViews - 关闭其他视图

保留当前视图和固定视图,关闭其他所有视图:

```typescript
/**
 * 删除除指定视图外的其他所有视图
 * @param view 要保留的路由视图
 * @returns Promise 包含删除后的视图列表
 * @description 保留固定的视图（meta.affix=true）和指定视图
 *
 * 技术实现:
 * 1. 调用 delOthersVisitedViews 保留指定视图和固定视图
 * 2. 调用 delOthersCachedViews 清理其他缓存
 * 3. 返回更新后的视图和缓存列表
 */
async delOthersViews(view: RouteLocationNormalized) {
  await this.delOthersVisitedViews(view)
  await this.delOthersCachedViews(view)

  return {
    visitedViews: this.getVisitedViews(),
    cachedViews: this.getCachedViews()
  }
}
```

**使用场景:**

- 右键菜单 "关闭其他" 功能
- 快速清理大量无用标签
- 聚焦当前工作页面

**示例:**

```typescript
/**
 * 右键菜单 - 关闭其他
 */
const handleCloseOthers = async (tag: RouteLocationNormalized) => {
  const layout = useLayout()
  const router = useRouter()

  // 删除其他视图
  await layout.delOthersViews(tag)

  // 如果当前不在这个标签,跳转过去
  if (route.path !== tag.path) {
    router.push(tag)
  }
}
```

### delOthersVisitedViews - 删除其他已访问视图

从已访问列表中删除其他视图:

```typescript
/**
 * 删除除指定视图外的其他已访问视图
 * @param view 要保留的路由视图
 * @returns Promise 包含更新后的已访问视图列表
 * @description 保留固定的视图（meta.affix=true）和指定视图
 *
 * 技术实现:
 * 1. 使用 filter 过滤 visitedViews 数组
 * 2. 保留条件: meta.affix 为 true 或 path 匹配指定视图
 * 3. 更新 visitedViews 数组
 * 4. 返回更新后的视图列表副本
 */
async delOthersVisitedViews(view: RouteLocationNormalized) {
  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (v) => v.meta?.affix || v.path === view.path
  )

  return this.getVisitedViews()
}
```

### delOthersCachedViews - 删除其他缓存视图

从缓存列表中删除其他视图:

```typescript
/**
 * 删除除指定视图外的其他缓存视图
 * @param view 要保留的路由视图
 * @returns Promise 包含更新后的缓存视图列表
 *
 * 技术实现:
 * 1. 查找指定视图的组件名在 cachedViews 中的索引
 * 2. 如果找到,使用 slice 只保留该组件
 * 3. 如果没找到,清空整个缓存数组
 * 4. 返回更新后的缓存列表副本
 */
async delOthersCachedViews(view: RouteLocationNormalized) {
  const viewName = view.name as string
  const index = state.tagsView.cachedViews.indexOf(viewName)

  if (index > -1) {
    // 只保留当前视图的缓存
    state.tagsView.cachedViews = state.tagsView.cachedViews.slice(
      index,
      index + 1
    )
  } else {
    // 当前视图不在缓存中,清空所有缓存
    state.tagsView.cachedViews = []
  }

  return this.getCachedViews()
}
```

### delAllViews - 删除所有视图

删除所有视图和缓存,但保留固定视图:

```typescript
/**
 * 删除所有视图
 * @returns Promise 包含删除后的视图列表
 * @description 保留固定的已访问视图，清空所有缓存
 *
 * 技术实现:
 * 1. 调用 delAllVisitedViews 删除所有非固定的已访问视图
 * 2. 调用 delAllCachedViews 清空所有缓存
 * 3. 返回更新后的视图和缓存列表
 */
async delAllViews() {
  await this.delAllVisitedViews()
  await this.delAllCachedViews()

  return {
    visitedViews: this.getVisitedViews(),
    cachedViews: this.getCachedViews()
  }
}
```

**使用场景:**

- 右键菜单 "关闭全部" 功能
- 用户登出时清理所有标签
- 系统重置或切换工作区

### delAllVisitedViews - 删除所有已访问视图

从已访问列表中删除所有视图,但保留固定视图:

```typescript
/**
 * 删除所有已访问视图
 * @returns Promise 包含更新后的已访问视图列表
 * @description 只保留固定的视图（meta.affix=true）
 *
 * 技术实现:
 * 1. 使用 filter 过滤 visitedViews 数组
 * 2. 只保留 meta.affix 为 true 的视图
 * 3. 更新 visitedViews 数组
 * 4. 返回更新后的视图列表副本
 */
async delAllVisitedViews() {
  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (tag) => tag.meta?.affix
  )

  return this.getVisitedViews()
}
```

### delAllCachedViews - 清空所有缓存视图

清空所有 keep-alive 缓存:

```typescript
/**
 * 清空所有缓存视图
 * @returns Promise 包含空的缓存视图列表
 *
 * 技术实现:
 * 1. 直接将 cachedViews 赋值为空数组
 * 2. keep-alive 组件会销毁所有缓存的组件实例
 * 3. 返回空数组
 */
async delAllCachedViews() {
  state.tagsView.cachedViews = []

  return this.getCachedViews()
}
```

### delRightTags - 删除右侧标签

删除指定视图右侧的所有标签:

```typescript
/**
 * 删除指定视图右侧的所有标签
 * @param view 基准视图，该视图右侧的标签将被删除
 * @returns Promise 包含更新后的已访问视图列表
 * @description 保留指定视图及其左侧的视图，删除右侧的视图和对应缓存
 *
 * 技术实现:
 * 1. 查找指定视图在 visitedViews 中的索引
 * 2. 如果未找到,直接返回当前视图列表
 * 3. 使用 filter 保留索引 <= index 的视图或固定视图
 * 4. 同时从 cachedViews 中移除被删除视图的缓存
 * 5. 返回更新后的视图列表副本
 */
async delRightTags(view: RouteLocationNormalized) {
  const index = state.tagsView.visitedViews.findIndex(
    (v) => v.path === view.path
  )

  if (index === -1) {
    return this.getVisitedViews()
  }

  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (item, idx) => {
      // 保留左侧视图和固定视图
      if (idx <= index || item.meta?.affix) {
        return true
      }

      // 删除右侧视图的缓存
      const cacheIndex = state.tagsView.cachedViews.indexOf(
        item.name as string
      )
      if (cacheIndex > -1) {
        state.tagsView.cachedViews.splice(cacheIndex, 1)
      }

      return false
    }
  )

  return this.getVisitedViews()
}
```

**使用场景:**

- 右键菜单 "关闭右侧" 功能
- 快速清理右侧大量标签
- 按工作流程清理标签

### delLeftTags - 删除左侧标签

删除指定视图左侧的所有标签:

```typescript
/**
 * 删除指定视图左侧的所有标签
 * @param view 基准视图，该视图左侧的标签将被删除
 * @returns Promise 包含更新后的已访问视图列表
 * @description 保留指定视图及其右侧的视图，删除左侧的视图和对应缓存
 *
 * 技术实现:
 * 1. 查找指定视图在 visitedViews 中的索引
 * 2. 如果未找到,直接返回当前视图列表
 * 3. 使用 filter 保留索引 >= index 的视图或固定视图
 * 4. 同时从 cachedViews 中移除被删除视图的缓存
 * 5. 返回更新后的视图列表副本
 */
async delLeftTags(view: RouteLocationNormalized) {
  const index = state.tagsView.visitedViews.findIndex(
    (v) => v.path === view.path
  )

  if (index === -1) {
    return this.getVisitedViews()
  }

  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (item, idx) => {
      // 保留右侧视图和固定视图
      if (idx >= index || item.meta?.affix) {
        return true
      }

      // 删除左侧视图的缓存
      const cacheIndex = state.tagsView.cachedViews.indexOf(
        item.name as string
      )
      if (cacheIndex > -1) {
        state.tagsView.cachedViews.splice(cacheIndex, 1)
      }

      return false
    }
  )

  return this.getVisitedViews()
}
```

### updateVisitedView - 更新访问视图

更新已存在的视图信息:

```typescript
/**
 * 更新已访问视图的信息
 * @param view 包含新信息的路由视图
 * @description 根据路径查找并更新对应的已访问视图
 *
 * 技术实现:
 * 1. 在 visitedViews 中查找匹配 path 的视图
 * 2. 如果找到,使用 Object.assign 更新视图信息
 * 3. 保留原有的固定标签等元信息
 */
updateVisitedView(view: RouteLocationNormalized) {
  const target = state.tagsView.visitedViews.find(
    (v) => v.path === view.path
  )

  if (target) {
    Object.assign(target, view)
  }
}
```

**使用场景:**

- 路由参数变化时更新标签标题
- 动态更新标签显示的信息
- 更新页面元数据

**示例:**

```typescript
/**
 * 更新标签标题
 */
watch(() => userDetail.value, (detail) => {
  if (detail) {
    const newView = {
      ...route,
      meta: {
        ...route.meta,
        title: `用户详情 - ${detail.name}`
      }
    }
    layout.updateVisitedView(newView)
  }
})
```

### isDynamicRoute - 判断动态路由

检查路由是否包含动态参数:

```typescript
/**
 * 判断是否为动态路由
 * @param view 路由视图对象
 * @returns true 如果是动态路由，false 否则
 * @description 检查路由路径是否包含动态参数（如 :id）
 *
 * 技术实现:
 * 1. 遍历 view.matched 数组(所有匹配的路由记录)
 * 2. 检查每个记录的 path 是否包含 ':' 字符
 * 3. 只要有一个记录包含动态参数,就返回 true
 */
isDynamicRoute(view: RouteLocationNormalized): boolean {
  return view.matched.some((m) => m.path.includes(':'))
}
```

**动态路由示例:**

```typescript
// ✅ 动态路由 (包含参数)
{
  path: '/user/:id',           // 包含 :id 参数
  name: 'UserDetail'
}

{
  path: '/product/:category/:id',  // 包含多个参数
  name: 'ProductDetail'
}

// ❌ 静态路由 (不包含参数)
{
  path: '/user',
  name: 'UserList'
}
```

**为什么需要识别动态路由?**

动态路由的同一个组件可能服务多个不同参数的页面,不应该随意删除缓存:

```typescript
// 访问 /user/1 和 /user/2 使用同一个组件 UserDetail
// 如果删除 /user/1 的标签时清理缓存,会导致 /user/2 也失去缓存
// 因此动态路由的缓存不会被 delView 自动删除
```

### getVisitedViews / getCachedViews / getIframeViews - 获取视图列表

获取视图列表的副本:

```typescript
/**
 * 获取已访问视图列表的副本
 * @returns 已访问视图数组的浅拷贝
 * @description 返回副本避免外部直接修改原数组
 */
getVisitedViews: () => [...state.tagsView.visitedViews]

/**
 * 获取 iframe 视图列表的副本
 * @returns iframe 视图数组的浅拷贝
 */
getIframeViews: () => [...state.tagsView.iframeViews]

/**
 * 获取缓存视图名称列表的副本
 * @returns 缓存视图名称数组的浅拷贝
 */
getCachedViews: () => [...state.tagsView.cachedViews]
```

**为什么返回副本?**

返回浅拷贝可以防止外部代码直接修改状态数组,保护数据的封装性:

```typescript
// ❌ 错误: 直接修改可能破坏状态
const views = layout.visitedViews.value
views.push(newView)  // 不推荐

// ✅ 正确: 使用提供的方法修改
layout.addView(newView)
```

## 缓存机制

### Keep-Alive 集成

标签视图系统与 Vue 的 `keep-alive` 组件深度集成,实现页面状态保持:

```vue
<template>
  <div class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

/**
 * 缓存的组件名称列表
 * @description 传递给 keep-alive 的 include 属性
 */
const cachedViews = computed(() => layout.cachedViews.value)
</script>
```

**Keep-Alive 工作原理:**

1. `keep-alive` 组件监听 `include` 属性
2. 当组件名在 `include` 列表中时,组件被缓存
3. 切换回该组件时,使用缓存的实例而非重新创建
4. 触发 `activated` 钩子而非 `mounted` 钩子

### 缓存规则

要正确使用 keep-alive 缓存,必须遵循以下规则:

#### 1. 组件必须设置 name 属性

```vue
<!-- ✅ 正确: 使用 defineOptions 设置 name -->
<script lang="ts" setup>
defineOptions({
  name: 'UserManagement'  // 必须设置 name
})
</script>

<!-- ❌ 错误: 没有设置 name -->
<script lang="ts" setup>
// 组件没有 name,无法被 keep-alive 缓存
</script>
```

#### 2. 组件 name 需与路由 name 一致

```typescript
// 路由配置
{
  path: '/user',
  name: 'UserManagement',  // 路由 name
  component: () => import('@/views/user/index.vue'),
  meta: {
    title: '用户管理'
  }
}

// 组件配置 (views/user/index.vue)
defineOptions({
  name: 'UserManagement'  // 组件 name,必须与路由 name 相同
})
```

**为什么必须一致?**

`cachedViews` 存储的是路由 `name`,`keep-alive` 的 `include` 匹配的是组件 `name`,两者必须一致才能正确缓存。

#### 3. meta.noCache 控制缓存

```typescript
// 不缓存的页面
{
  path: '/user/create',
  name: 'UserCreate',
  component: () => import('@/views/user/create.vue'),
  meta: {
    title: '创建用户',
    noCache: true  // 不缓存此页面
  }
}

// 缓存的页面 (默认)
{
  path: '/user/list',
  name: 'UserList',
  component: () => import('@/views/user/list.vue'),
  meta: {
    title: '用户列表'
    // noCache 默认为 false,会被缓存
  }
}
```

**哪些页面应该设置 noCache?**

- 表单页面 (创建/编辑)
- 实时数据页面 (监控/仪表盘)
- 敏感信息页面
- 短暂停留的页面

#### 4. 动态路由特殊处理

```typescript
// 动态路由示例
{
  path: '/user/:id',
  name: 'UserDetail',
  component: () => import('@/views/user/detail.vue')
}

// 访问 /user/1, /user/2, /user/3 都使用同一个组件
// cachedViews 中只存在一个 'UserDetail'
// 但可以服务多个不同 id 的页面
```

**动态路由缓存策略:**

- 删除动态路由标签时,不自动清理缓存
- 需要手动调用 `delCachedView` 清理
- 避免参数变化导致缓存丢失

### 缓存生命周期

使用 keep-alive 后,组件的生命周期会发生变化:

```vue
<script lang="ts" setup>
import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

/**
 * 首次进入页面
 * @description 只在组件首次创建时调用一次
 */
onMounted(() => {
  console.log('Component mounted - 首次进入')
  initData()
})

/**
 * 页面激活
 * @description 每次切换回该页面时调用 (包括首次)
 */
onActivated(() => {
  console.log('Component activated - 页面激活')
  refreshData()  // 刷新数据
})

/**
 * 页面停用
 * @description 每次离开该页面时调用
 */
onDeactivated(() => {
  console.log('Component deactivated - 页面停用')
  // 可以在这里保存表单草稿等
})

/**
 * 组件销毁
 * @description 只在组件被销毁时调用 (缓存清理或标签关闭)
 */
onUnmounted(() => {
  console.log('Component unmounted - 组件销毁')
  cleanup()
})
</script>
```

**生命周期调用顺序:**

```
首次进入页面:
onMounted → onActivated

切换到其他页面:
onDeactivated

切换回该页面:
onActivated

关闭标签 (清理缓存):
onDeactivated → onUnmounted
```

### 缓存数据刷新策略

在 `activated` 钩子中实现数据刷新:

```vue
<script lang="ts" setup>
import { ref, onActivated } from 'vue'

const list = ref([])
const lastFetchTime = ref(0)
const REFRESH_INTERVAL = 5 * 60 * 1000  // 5分钟

/**
 * 页面激活时检查是否需要刷新数据
 */
onActivated(() => {
  const now = Date.now()
  const elapsed = now - lastFetchTime.value

  // 超过5分钟则重新获取数据
  if (elapsed > REFRESH_INTERVAL || list.value.length === 0) {
    fetchList()
  }
})

/**
 * 获取列表数据
 */
const fetchList = async () => {
  const [err, data] = await getUserList()
  if (!err) {
    list.value = data
    lastFetchTime.value = Date.now()
  }
}
</script>
```

## 固定标签

### 配置方式

通过路由 `meta.affix` 属性配置固定标签:

```typescript
/**
 * 固定标签路由配置
 */
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/views/dashboard/index.vue'),
  meta: {
    title: '首页',
    affix: true,  // 设置为固定标签
    icon: 'dashboard'
  }
}
```

### 固定标签特性

固定标签具有以下特殊行为:

#### 1. 不可关闭

```vue
<template>
  <div class="tags-view-item">
    <span>{{ tag.meta.title }}</span>
    <!-- 固定标签不显示关闭按钮 -->
    <el-icon
      v-if="!isAffix(tag)"
      class="close-icon"
      @click.prevent.stop="closeTag(tag)"
    >
      <Close />
    </el-icon>
  </div>
</template>

<script lang="ts" setup>
/**
 * 判断是否为固定标签
 */
const isAffix = (tag: RouteLocationNormalized) => {
  return tag.meta?.affix === true
}
</script>
```

#### 2. 始终显示在标签栏

固定标签在应用启动时自动添加到标签栏:

```typescript
/**
 * 初始化固定标签
 */
const initAffixTags = () => {
  const layout = useLayout()
  const permissionStore = usePermissionStore()

  // 获取所有路由
  const routes = permissionStore.routes

  // 过滤出固定标签
  const affixTags = filterAffixTags(routes)

  // 添加到标签栏
  affixTags.forEach(tag => {
    if (tag.name) {
      layout.addVisitedView(tag)
    }
  })
}

/**
 * 过滤固定标签
 */
const filterAffixTags = (routes: RouteRecordRaw[], basePath = '/'): RouteLocationNormalized[] => {
  let tags: RouteLocationNormalized[] = []

  routes.forEach(route => {
    if (route.meta?.affix) {
      const tagPath = path.resolve(basePath, route.path)
      tags.push({
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      } as RouteLocationNormalized)
    }

    if (route.children) {
      const childTags = filterAffixTags(route.children, route.path)
      tags = tags.concat(childTags)
    }
  })

  return tags
}
```

#### 3. 关闭全部时保留

批量删除操作会自动跳过固定标签:

```typescript
// delAllVisitedViews 实现
async delAllVisitedViews() {
  // 只保留 affix 为 true 的视图
  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (tag) => tag.meta?.affix
  )

  return this.getVisitedViews()
}

// delOthersVisitedViews 实现
async delOthersVisitedViews(view: RouteLocationNormalized) {
  // 保留固定视图和指定视图
  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (v) => v.meta?.affix || v.path === view.path
  )

  return this.getVisitedViews()
}
```

### 固定标签推荐使用场景

- **首页/仪表盘**: 用户最常访问的页面
- **工作台**: 核心工作页面
- **个人中心**: 常用设置页面
- **帮助文档**: 快速访问帮助

## Iframe 视图管理

### 配置 Iframe 路由

```typescript
/**
 * Iframe 路由配置
 */
{
  path: '/external',
  name: 'External',
  component: Layout,
  meta: {
    title: '外部系统',
    icon: 'link'
  },
  children: [
    {
      path: 'docs',
      name: 'ExternalDocs',
      component: () => import('@/views/system/InnerLink.vue'),
      meta: {
        title: '在线文档',
        link: 'https://docs.example.com'  // 外部链接
      }
    },
    {
      path: 'monitor',
      name: 'ExternalMonitor',
      component: () => import('@/views/system/InnerLink.vue'),
      meta: {
        title: '监控系统',
        link: 'https://monitor.example.com'
      }
    }
  ]
}
```

### InnerLink 组件实现

```vue
<template>
  <div class="inner-link-container">
    <iframe
      v-if="iframeSrc"
      :src="iframeSrc"
      frameborder="0"
      width="100%"
      height="100%"
      scrolling="auto"
      @load="handleLoad"
    />
    <div v-else class="loading">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLayout } from '@/composables/useLayout'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const layout = useLayout()

/**
 * Iframe 源地址
 */
const iframeSrc = computed(() => route.meta?.link as string)

/**
 * 组件挂载时添加到 iframe 视图列表
 */
onMounted(() => {
  if (iframeSrc.value) {
    layout.addIframeView(route)
  }
})

/**
 * Iframe 加载完成
 */
const handleLoad = () => {
  console.log('Iframe loaded:', iframeSrc.value)
}
</script>

```

### Iframe 生命周期管理

```typescript
/**
 * Iframe 视图管理示例
 */
// 添加 iframe 视图
layout.addIframeView(route)

// 删除 iframe 视图 (关闭标签时)
layout.delIframeView(route)

// 获取所有 iframe 视图
const iframeViews = layout.iframeViews.value
```

### Iframe 跨域通信

使用 `postMessage` 实现父子页面通信:

```typescript
/**
 * 父页面发送消息到 iframe
 */
const sendMessageToIframe = (message: any) => {
  const iframe = document.querySelector('iframe')
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(message, '*')
  }
}

/**
 * 父页面接收 iframe 消息
 */
window.addEventListener('message', (event) => {
  // 验证来源
  if (event.origin !== 'https://example.com') {
    return
  }

  // 处理消息
  console.log('Received message from iframe:', event.data)
})
```

## 基本用法

### 1. 标签栏组件

完整的标签栏组件实现:

```vue
<template>
  <div class="tags-view-container">
    <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        :class="isActive(tag) ? 'active' : ''"
        class="tags-view-item"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <span>{{ tag.meta.title }}</span>
        <el-icon
          v-if="!isAffix(tag)"
          class="el-icon-close"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </scroll-pane>

    <!-- 右键菜单 -->
    <context-menu
      v-if="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      :tag="selectedTag"
      @close="closeMenu"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import { useLayout } from '@/composables/useLayout'
import { Close } from '@element-plus/icons-vue'
import ScrollPane from './ScrollPane.vue'
import ContextMenu from './ContextMenu.vue'

const route = useRoute()
const router = useRouter()
const layout = useLayout()

// 滚动面板引用
const scrollPaneRef = ref()

// 右键菜单状态
const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref<RouteLocationNormalized>()

/**
 * 访问视图列表
 */
const visitedViews = computed(() => layout.visitedViews.value)

/**
 * 判断标签是否激活
 */
const isActive = (tag: RouteLocationNormalized) => {
  return tag.path === route.path
}

/**
 * 判断是否为固定标签
 */
const isAffix = (tag: RouteLocationNormalized) => {
  return tag.meta?.affix === true
}

/**
 * 关闭选中的标签
 */
const closeSelectedTag = async (tag: RouteLocationNormalized) => {
  const { visitedViews } = await layout.delView(tag)

  // 如果关闭的是当前激活的标签,跳转到最后一个标签
  if (isActive(tag)) {
    toLastView(visitedViews, tag)
  }
}

/**
 * 跳转到最后一个标签
 */
const toLastView = (visitedViews: RouteLocationNormalized[], view: RouteLocationNormalized) => {
  const latestView = visitedViews.slice(-1)[0]

  if (latestView) {
    router.push(latestView)
  } else {
    // 如果没有标签了,跳转到首页
    if (view.name === 'Dashboard') {
      // 重新加载首页
      router.replace({ path: '/redirect' + view.path })
    } else {
      router.push('/')
    }
  }
}

/**
 * 打开右键菜单
 */
const openMenu = (tag: RouteLocationNormalized, e: MouseEvent) => {
  const menuMinWidth = 105
  const offsetLeft = scrollPaneRef.value?.$el.getBoundingClientRect().left
  const offsetWidth = scrollPaneRef.value?.$el.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth

  left.value = e.clientX - offsetLeft + 15
  if (left.value > maxLeft) {
    left.value = maxLeft
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

/**
 * 关闭右键菜单
 */
const closeMenu = () => {
  visible.value = false
}

/**
 * 监听路由变化,添加标签
 */
watch(
  () => route.path,
  () => {
    if (route.name) {
      layout.addView(route)
      nextTick(() => {
        // 滚动到当前标签
        scrollPaneRef.value?.moveToTarget(route)
      })
    }
  },
  { immediate: true }
)

/**
 * 点击其他地方关闭右键菜单
 */
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})
</script>

```

### 2. 右键菜单组件

```vue
<template>
  <ul class="contextmenu">
    <li @click="refresh">
      <el-icon><Refresh /></el-icon>
      刷新
    </li>
    <li v-if="!isAffix" @click="closeSelectedTag">
      <el-icon><Close /></el-icon>
      关闭
    </li>
    <li @click="closeOthersTags">
      <el-icon><CircleClose /></el-icon>
      关闭其他
    </li>
    <li v-if="!isFirstView" @click="closeLeftTags">
      <el-icon><Back /></el-icon>
      关闭左侧
    </li>
    <li v-if="!isLastView" @click="closeRightTags">
      <el-icon><Right /></el-icon>
      关闭右侧
    </li>
    <li @click="closeAllTags">
      <el-icon><CircleCloseFilled /></el-icon>
      关闭全部
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import { useLayout } from '@/composables/useLayout'
import { Refresh, Close, CircleClose, Back, Right, CircleCloseFilled } from '@element-plus/icons-vue'

interface Props {
  tag: RouteLocationNormalized
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const router = useRouter()
const layout = useLayout()

/**
 * 是否为固定标签
 */
const isAffix = computed(() => props.tag.meta?.affix === true)

/**
 * 是否为第一个标签
 */
const isFirstView = computed(() => {
  const views = layout.visitedViews.value
  return views.findIndex(v => v.path === props.tag.path) === 0
})

/**
 * 是否为最后一个标签
 */
const isLastView = computed(() => {
  const views = layout.visitedViews.value
  return views.findIndex(v => v.path === props.tag.path) === views.length - 1
})

/**
 * 刷新当前页面
 */
const refresh = () => {
  // 通过 redirect 页面实现刷新
  router.replace({
    path: '/redirect' + props.tag.path,
    query: props.tag.query
  })
  emit('close')
}

/**
 * 关闭选中标签
 */
const closeSelectedTag = async () => {
  const { visitedViews } = await layout.delView(props.tag)

  if (isActive()) {
    toLastView(visitedViews)
  }

  emit('close')
}

/**
 * 关闭其他标签
 */
const closeOthersTags = async () => {
  await layout.delOthersViews(props.tag)

  if (!isActive()) {
    router.push(props.tag)
  }

  emit('close')
}

/**
 * 关闭左侧标签
 */
const closeLeftTags = async () => {
  await layout.delLeftTags(props.tag)

  if (!isActive()) {
    router.push(props.tag)
  }

  emit('close')
}

/**
 * 关闭右侧标签
 */
const closeRightTags = async () => {
  await layout.delRightTags(props.tag)

  if (!isActive()) {
    router.push(props.tag)
  }

  emit('close')
}

/**
 * 关闭全部标签
 */
const closeAllTags = async () => {
  const { visitedViews } = await layout.delAllViews()

  // 如果当前标签被关闭,跳转到最后一个标签或首页
  if (!props.tag.meta?.affix) {
    toLastView(visitedViews)
  }

  emit('close')
}

/**
 * 判断是否为当前激活标签
 */
const isActive = () => {
  return props.tag.path === route.path
}

/**
 * 跳转到最后一个标签
 */
const toLastView = (visitedViews: RouteLocationNormalized[]) => {
  const latestView = visitedViews.slice(-1)[0]

  if (latestView) {
    router.push(latestView)
  } else {
    router.push('/')
  }
}
</script>

```

### 3. 滚动面板组件

支持标签横向滚动:

```vue
<template>
  <div class="scroll-pane" @wheel.prevent="handleScroll">
    <div ref="scrollWrapper" class="scroll-wrapper">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

const scrollWrapper = ref<HTMLDivElement>()

/**
 * 鼠标滚轮滚动
 */
const handleScroll = (e: WheelEvent) => {
  const eventDelta = (e as any).wheelDelta || -e.deltaY * 40
  const wrapper = scrollWrapper.value

  if (wrapper) {
    wrapper.scrollLeft = wrapper.scrollLeft + eventDelta / 4
  }
}

/**
 * 滚动到目标标签
 */
const moveToTarget = (currentTag: RouteLocationNormalized) => {
  const wrapper = scrollWrapper.value
  if (!wrapper) return

  const tagList = wrapper.querySelectorAll('.tags-view-item')

  tagList.forEach((tag: Element) => {
    if ((tag as HTMLElement).dataset.path === currentTag.path) {
      (tag as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  })
}

defineExpose({
  moveToTarget
})
</script>

```

### 4. 路由监听

在根组件或路由守卫中监听路由变化:

```typescript
/**
 * App.vue 或 Layout.vue
 */
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLayout } from '@/composables/useLayout'

const route = useRoute()
const layout = useLayout()

/**
 * 监听路由变化,自动添加标签
 */
watch(
  () => route.path,
  () => {
    if (route.name) {
      // 添加到访问历史和缓存
      layout.addView(route)

      // 如果是 iframe 页面,添加到 iframe 视图列表
      if (route.meta?.link) {
        layout.addIframeView(route)
      }
    }
  },
  { immediate: true }
)
```

### 5. 页面刷新功能

通过重定向页面实现页面刷新:

```vue
<!-- views/redirect/index.vue -->
<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  const { params, query } = route
  const { path } = params

  // 重定向到目标页面
  router.replace({
    path: '/' + (path as string[]).join('/'),
    query
  })
})
</script>

<template>
  <div />
</template>
```

**路由配置:**

```typescript
{
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [
    {
      path: '/redirect/:path(.*)',
      component: () => import('@/views/redirect/index.vue')
    }
  ]
}
```

## 性能优化

### 1. 标签数量限制

限制最大标签数量,自动清理最早的标签:

```typescript
/**
 * 标签数量配置
 */
const MAX_TAGS_COUNT = 10  // 最大标签数

/**
 * 添加视图时检查数量
 */
const addViewWithLimit = (view: RouteLocationNormalized) => {
  const layout = useLayout()
  const visitedViews = layout.visitedViews.value

  // 添加新标签
  layout.addView(view)

  // 检查数量限制
  if (visitedViews.length > MAX_TAGS_COUNT) {
    // 找到第一个非固定标签并删除
    const firstNonAffixTag = visitedViews.find(v => !v.meta?.affix)

    if (firstNonAffixTag) {
      layout.delView(firstNonAffixTag)
    }
  }
}
```

### 2. 缓存上限控制

控制 keep-alive 缓存的组件数量:

```vue
<template>
  <keep-alive :include="cachedViews" :max="10">
    <router-view />
  </keep-alive>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

/**
 * 缓存的组件名称列表
 * @description max 属性限制最多缓存 10 个组件
 */
const cachedViews = computed(() => layout.cachedViews.value)
</script>
```

**max 属性说明:**

- 限制 keep-alive 最多缓存的组件实例数
- 超出数量时,最早缓存的组件会被销毁
- 建议设置为 5-15 个,根据应用复杂度调整

### 3. 虚拟滚动优化

标签数量过多时使用虚拟滚动:

```typescript
/**
 * 虚拟滚动配置
 */
interface VirtualScrollConfig {
  itemWidth: number      // 每个标签宽度
  visibleCount: number   // 可见标签数量
  bufferCount: number    // 缓冲标签数量
}

/**
 * 计算可见标签范围
 */
const getVisibleRange = (
  scrollLeft: number,
  config: VirtualScrollConfig
) => {
  const start = Math.floor(scrollLeft / config.itemWidth)
  const end = start + config.visibleCount + config.bufferCount

  return { start, end }
}

/**
 * 渲染可见标签
 */
const visibleTags = computed(() => {
  const { start, end } = getVisibleRange(scrollLeft.value, config)
  return visitedViews.value.slice(start, end)
})
```

### 4. 防抖滚动事件

优化标签滚动性能:

```typescript
import { useDebounceFn } from '@vueuse/core'

/**
 * 防抖滚动处理
 */
const handleScrollDebounced = useDebounceFn((e: WheelEvent) => {
  const eventDelta = (e as any).wheelDelta || -e.deltaY * 40
  const wrapper = scrollWrapper.value

  if (wrapper) {
    wrapper.scrollLeft = wrapper.scrollLeft + eventDelta / 4
  }
}, 16)  // 约 60fps
```

### 5. 标签预加载

预加载常用页面:

```typescript
/**
 * 预加载常用页面
 */
const preloadCommonPages = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // 预加载首页、工作台等常用页面
      const commonRoutes = [
        '/dashboard',
        '/workbench',
        '/user/profile'
      ]

      commonRoutes.forEach(path => {
        router.resolve(path)  // 预解析路由
      })
    })
  }
}

onMounted(() => {
  preloadCommonPages()
})
```

## API 文档

### useLayout (标签视图相关部分)

**状态属性:**

| 属性 | 类型 | 说明 |
|------|------|------|
| `visitedViews` | `Ref<RouteLocationNormalized[]>` | 已访问的视图列表 (只读) |
| `cachedViews` | `Ref<string[]>` | 缓存的视图名称列表 (只读) |
| `iframeViews` | `Ref<RouteLocationNormalized[]>` | iframe 视图列表 (只读) |

**标签管理方法:**

| 方法 | 类型 | 说明 |
|------|------|------|
| `addView` | `(view: RouteLocationNormalized) => void` | 添加视图到已访问和缓存列表 |
| `addVisitedView` | `(view: RouteLocationNormalized) => void` | 添加视图到已访问列表 |
| `addCachedView` | `(view: RouteLocationNormalized) => void` | 添加视图到缓存列表 |
| `addIframeView` | `(view: RouteLocationNormalized) => void` | 添加 iframe 视图 |

**删除方法:**

| 方法 | 类型 | 说明 |
|------|------|------|
| `delView` | `(view: RouteLocationNormalized) => Promise<ViewsResult>` | 删除指定视图 |
| `delVisitedView` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除已访问视图 |
| `delCachedView` | `(view?: RouteLocationNormalized) => Promise<string[]>` | 删除缓存视图 |
| `delIframeView` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除 iframe 视图 |

**批量操作方法:**

| 方法 | 类型 | 说明 |
|------|------|------|
| `delOthersViews` | `(view: RouteLocationNormalized) => Promise<ViewsResult>` | 删除其他视图 |
| `delOthersVisitedViews` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除其他已访问视图 |
| `delOthersCachedViews` | `(view: RouteLocationNormalized) => Promise<string[]>` | 删除其他缓存视图 |
| `delAllViews` | `() => Promise<ViewsResult>` | 删除所有视图 |
| `delAllVisitedViews` | `() => Promise<RouteLocationNormalized[]>` | 删除所有已访问视图 |
| `delAllCachedViews` | `() => Promise<string[]>` | 清空所有缓存视图 |
| `delRightTags` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除右侧标签 |
| `delLeftTags` | `(view: RouteLocationNormalized) => Promise<RouteLocationNormalized[]>` | 删除左侧标签 |

**工具方法:**

| 方法 | 类型 | 说明 |
|------|------|------|
| `updateVisitedView` | `(view: RouteLocationNormalized) => void` | 更新已访问视图信息 |
| `isDynamicRoute` | `(view: RouteLocationNormalized) => boolean` | 判断是否为动态路由 |
| `getVisitedViews` | `() => RouteLocationNormalized[]` | 获取已访问视图列表副本 |
| `getCachedViews` | `() => string[]` | 获取缓存视图列表副本 |
| `getIframeViews` | `() => RouteLocationNormalized[]` | 获取 iframe 视图列表副本 |

**类型定义:**

```typescript
/**
 * 视图操作结果
 */
interface ViewsResult {
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}

/**
 * 路由位置规范化类型 (Vue Router 提供)
 */
interface RouteLocationNormalized {
  path: string
  name: string | symbol
  params: Record<string, string>
  query: Record<string, string>
  meta: Record<string, any>
  matched: RouteRecordNormalized[]
  // ...
}
```

## 最佳实践

### 1. 组件命名规范

确保组件 name 与路由 name 一致:

```vue
<!-- ✅ 正确: 组件 name 与路由 name 一致 -->
<script lang="ts" setup>
defineOptions({
  name: 'UserManagement'  // 与路由 name 相同
})
</script>

<!-- 路由配置 -->
{
  path: '/user',
  name: 'UserManagement',  // 与组件 name 相同
  component: UserManagement
}

<!-- ❌ 错误: 组件 name 与路由 name 不一致 -->
<script lang="ts" setup>
defineOptions({
  name: 'User'  // 与路由 name 不同
})
</script>

<!-- 路由配置 -->
{
  path: '/user',
  name: 'UserManagement',  // 不一致,缓存不生效
  component: User
}
```

### 2. 合理使用固定标签

重要页面设置为固定标签:

```typescript
// ✅ 推荐: 首页、工作台等核心页面设为固定
{
  path: '/dashboard',
  name: 'Dashboard',
  meta: {
    title: '首页',
    affix: true  // 固定标签
  }
}

{
  path: '/workbench',
  name: 'Workbench',
  meta: {
    title: '工作台',
    affix: true
  }
}

// ❌ 不推荐: 过多固定标签
// 固定标签过多会占用标签栏空间
// 建议不超过 2-3 个
```

### 3. 缓存控制策略

合理使用 noCache 控制缓存:

```typescript
// ✅ 推荐: 表单页面不缓存
{
  path: '/user/create',
  name: 'UserCreate',
  meta: {
    title: '创建用户',
    noCache: true  // 表单页不缓存
  }
}

// ✅ 推荐: 列表页面缓存
{
  path: '/user/list',
  name: 'UserList',
  meta: {
    title: '用户列表'
    // 默认缓存,保持筛选条件和滚动位置
  }
}

// ✅ 推荐: 实时数据页面不缓存
{
  path: '/monitor',
  name: 'Monitor',
  meta: {
    title: '系统监控',
    noCache: true  // 实时数据不缓存
  }
}
```

### 4. 生命周期管理

正确使用激活/停用钩子:

```vue
<script lang="ts" setup>
import { ref, onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

/**
 * 组件首次挂载
 */
onMounted(() => {
  console.log('Component mounted')
  initData()  // 初始化数据
})

/**
 * 页面激活 (每次切换回来都调用)
 */
onActivated(() => {
  console.log('Page activated')
  refreshData()  // 刷新数据
})

/**
 * 页面停用 (每次离开都调用)
 */
onDeactivated(() => {
  console.log('Page deactivated')
  saveFormDraft()  // 保存表单草稿
})

/**
 * 组件销毁
 */
onUnmounted(() => {
  console.log('Component unmounted')
  cleanup()  // 清理资源
})
</script>
```

### 5. 状态持久化

页面刷新后恢复标签状态:

```typescript
/**
 * 持久化标签状态
 */
import { watch } from 'vue'
import { useLayout } from '@/composables/useLayout'
import { localCache } from '@/utils/cache'

const layout = useLayout()

// 监听标签变化,保存到 localStorage
watch(
  () => layout.visitedViews.value,
  (views) => {
    const savedViews = views.map(v => ({
      path: v.path,
      name: v.name,
      query: v.query,
      meta: v.meta
    }))
    localCache.setJSON('visited-views', savedViews)
  },
  { deep: true }
)

// 应用启动时恢复标签
const restoreViews = () => {
  const savedViews = localCache.getJSON<RouteLocationNormalized[]>('visited-views')

  if (savedViews) {
    savedViews.forEach(view => {
      layout.addVisitedView(view)
    })
  }
}

onMounted(() => {
  restoreViews()
})
```

### 6. 动态路由处理

正确处理带参数的动态路由:

```typescript
// 动态路由配置
{
  path: '/user/:id',
  name: 'UserDetail',
  component: UserDetail,
  meta: {
    title: '用户详情'
  }
}

// 组件中更新标签标题
watch(() => route.params.id, async (id) => {
  if (id) {
    const [err, user] = await getUserDetail(id)
    if (!err) {
      // 更新标签标题显示用户名
      layout.updateVisitedView({
        ...route,
        meta: {
          ...route.meta,
          title: `用户详情 - ${user.name}`
        }
      })
    }
  }
})
```

### 7. 标签数量优化

避免标签数量过多:

```typescript
/**
 * 标签数量配置
 */
const TAGS_CONFIG = {
  max: 10,        // 最大标签数
  warning: 8      // 警告阈值
}

/**
 * 检查标签数量
 */
const checkTagsCount = () => {
  const count = layout.visitedViews.value.length

  if (count >= TAGS_CONFIG.warning) {
    ElMessage.warning({
      message: `当前打开了 ${count} 个标签,建议关闭一些不常用的标签`,
      duration: 5000
    })
  }
}

// 定期检查
setInterval(checkTagsCount, 60000)  // 每分钟检查一次
```

### 8. 内存泄漏预防

及时清理事件监听和定时器:

```vue
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'

let timer: number | null = null

onMounted(() => {
  // 启动定时器
  timer = setInterval(() => {
    fetchData()
  }, 5000)

  // 添加事件监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})
</script>
```

### 9. 标签滚动优化

自动滚动到当前标签:

```typescript
/**
 * 滚动到当前标签
 */
const scrollToCurrentTag = (tag: RouteLocationNormalized) => {
  nextTick(() => {
    const tagEl = document.querySelector(`[data-path="${tag.path}"]`)

    if (tagEl) {
      tagEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  })
}

// 路由变化时自动滚动
watch(() => route.path, () => {
  scrollToCurrentTag(route)
})
```

### 10. 错误处理

处理标签操作错误:

```typescript
/**
 * 安全的删除视图
 */
const safeDelView = async (view: RouteLocationNormalized) => {
  try {
    const result = await layout.delView(view)

    // 检查结果
    if (!result.visitedViews || !result.cachedViews) {
      throw new Error('删除视图失败')
    }

    ElMessage.success('标签已关闭')
    return result
  } catch (error) {
    console.error('删除视图错误:', error)
    ElMessage.error('关闭标签失败,请重试')
    return null
  }
}
```

## 常见问题

### 1. 页面缓存不生效

**问题现象:**

切换标签后,页面状态丢失,每次都重新加载。

**问题原因:**

- 组件没有设置 `name` 属性
- 组件 `name` 与路由 `name` 不一致
- 路由设置了 `meta.noCache = true`
- `cachedViews` 数组为空

**解决方案:**

```vue
<!-- 1. 检查组件是否有 name -->
<script lang="ts" setup>
defineOptions({
  name: 'UserManagement'  // 必须设置 name
})
</script>

<!-- 2. 检查路由配置 -->
{
  path: '/user',
  name: 'UserManagement',  // 与组件 name 一致
  component: UserManagement,
  meta: {
    // noCache: true  // 检查是否设置了 noCache
  }
}

<!-- 3. 检查 cachedViews -->
<template>
  <keep-alive :include="cachedViews">
    <router-view />
  </keep-alive>
</template>

<script lang="ts" setup>
const layout = useLayout()
const cachedViews = computed(() => {
  console.log('Cached views:', layout.cachedViews.value)
  return layout.cachedViews.value
})
</script>
```

### 2. 动态路由参数变化时缓存失效

**问题现象:**

访问 `/user/1` 和 `/user/2` 时,切换回来数据丢失。

**问题原因:**

- 动态路由使用同一个组件实例
- 关闭标签时错误地清理了缓存
- 路由 `key` 设置不当

**解决方案:**

```vue
<!-- 1. 使用 route.path 作为 key -->
<template>
  <keep-alive :include="cachedViews">
    <router-view :key="route.path" />
  </keep-alive>
</template>

<!-- 2. 动态路由不删除缓存 -->
<script lang="ts" setup>
// delView 方法已经实现了动态路由判断
// 动态路由的缓存不会被自动删除
const closeTag = async (tag: RouteLocationNormalized) => {
  await layout.delView(tag)  // 自动识别动态路由
}
</script>

<!-- 3. 手动清理动态路由缓存 -->
<script lang="ts" setup>
// 需要清理缓存时手动调用
const clearDynamicRouteCache = async () => {
  const view = route  // 当前动态路由
  await layout.delCachedView(view)  // 明确删除缓存
}
</script>
```

### 3. 标签栏显示但缓存未生效

**问题现象:**

标签栏显示正常,但切换回来页面还是重新加载。

**问题原因:**

- `addView` 和 `addCachedView` 逻辑不一致
- `keep-alive` 的 `include` 未正确绑定
- 组件名称不在 `cachedViews` 列表中

**解决方案:**

```vue
<!-- 1. 检查 addView 调用 -->
<script lang="ts" setup>
watch(() => route.path, () => {
  if (route.name) {
    // 确保调用了 addView
    layout.addView(route)

    // 验证是否添加成功
    console.log('Visited views:', layout.visitedViews.value)
    console.log('Cached views:', layout.cachedViews.value)
  }
})
</script>

<!-- 2. 检查 keep-alive 绑定 -->
<template>
  <keep-alive :include="cachedViews">
    <router-view />
  </keep-alive>
</template>

<script lang="ts" setup>
const cachedViews = computed(() => {
  const views = layout.cachedViews.value
  console.log('Keep-alive include:', views)
  return views
})
</script>
```

### 4. 关闭标签后路由跳转错误

**问题现象:**

关闭当前标签后,页面跳转到错误的路由或空白页。

**问题原因:**

- 没有判断是否关闭的是当前激活标签
- `toLastView` 逻辑错误
- 所有标签都关闭了

**解决方案:**

```typescript
/**
 * 正确的关闭标签逻辑
 */
const closeSelectedTag = async (tag: RouteLocationNormalized) => {
  const router = useRouter()
  const route = useRoute()
  const layout = useLayout()

  // 删除视图
  const { visitedViews } = await layout.delView(tag)

  // 如果关闭的是当前激活的标签
  if (tag.path === route.path) {
    // 跳转到最后一个标签
    const latestView = visitedViews[visitedViews.length - 1]

    if (latestView) {
      // 有其他标签,跳转过去
      router.push(latestView)
    } else {
      // 没有标签了,跳转到首页
      router.push('/')
    }
  }
}
```

### 5. 固定标签被意外关闭

**问题现象:**

设置了 `affix: true` 的标签还是被关闭了。

**问题原因:**

- 批量删除方法未正确过滤固定标签
- 手动修改了 `visitedViews` 数组
- 路由元信息配置错误

**解决方案:**

```typescript
// 1. 检查路由配置
{
  path: '/dashboard',
  name: 'Dashboard',
  meta: {
    title: '首页',
    affix: true  // 确保设置为 true
  }
}

// 2. 检查删除方法实现
// delAllVisitedViews 应该过滤固定标签
async delAllVisitedViews() {
  state.tagsView.visitedViews = state.tagsView.visitedViews.filter(
    (tag) => tag.meta?.affix === true  // 只保留固定标签
  )
  return this.getVisitedViews()
}

// 3. 不要直接修改 visitedViews
// ❌ 错误
layout.visitedViews.value = []

// ✅ 正确
layout.delAllViews()
```

## 总结

标签视图管理系统是前端框架的核心导航组件,通过 `useLayout` Composable 提供完整的多标签页管理能力。系统支持标签的添加、删除、批量操作、keep-alive 缓存管理、固定标签、动态路由识别和 iframe 集成等功能,为用户提供流畅的多页面切换体验。

**核心优势:**

- **完整的标签管理**: 15+ 个标签操作方法,覆盖所有使用场景
- **智能缓存系统**: 基于 keep-alive 的页面状态保持,支持动态路由识别
- **灵活的批量操作**: 关闭其他、关闭左侧、关闭右侧、关闭全部等功能
- **固定标签支持**: 重要页面设置为固定标签,提升用户体验
- **Iframe 集成**: 无缝集成第三方系统,独立管理生命周期
- **性能优化**: 标签数量限制、缓存上限控制、虚拟滚动、防抖优化
- **类型安全**: 完整的 TypeScript 类型定义

通过合理使用标签视图系统,可以构建出类似浏览器的多标签页导航体验,提升用户的操作效率和使用体验。建议开发者遵循命名规范、合理控制缓存、正确使用生命周期钩子,确保系统稳定高效运行。
