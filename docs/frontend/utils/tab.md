# 标签页工具 (tab.ts)

标签页导航操作相关工具函数，提供完整的标签页管理功能，包括页面刷新、打开、关闭、更新等操作，适用于后台管理系统的多标签页场景。

## 概述

标签页工具库基于 Vue Router 和 Pinia 状态管理，提供以下核心功能：
- **页面刷新**：刷新当前打开的标签页
- **关闭并打开**：关闭当前标签页并打开新标签页
- **关闭操作**：关闭指定标签页或当前标签页
- **批量关闭**：关闭所有、左侧、右侧、其他标签页
- **页面操作**：打开新标签页、更新标签页信息

## 页面刷新

### refreshPage

刷新当前标签页，通过重定向机制实现页面刷新。

```typescript
refreshPage(obj?: RouteLocationNormalized): Promise<void>
```

**参数：**
- `obj` - 可选的路由对象，如果未提供则使用当前路由

**返回值：**
- `Promise<void>`

**示例：**
```typescript
// 刷新当前页面
await refreshPage()

// 刷新指定路由对象
const route = router.currentRoute.value
await refreshPage(route)

// 在组件中使用
export default {
  setup() {
    const handleRefresh = async () => {
      try {
        await refreshPage()
        ElMessage.success('页面已刷新')
      } catch (error) {
        ElMessage.error('页面刷新失败')
      }
    }
    
    return {
      handleRefresh
    }
  }
}
```

**工作原理：**
1. 自动识别当前路由的组件名称
2. 从缓存中移除视图
3. 通过 `/redirect` 路由重新加载页面

## 页面跳转与关闭

### closeOpenPage

关闭当前标签页并打开新标签页。

```typescript
closeOpenPage(obj: RouteLocationRaw): void
```

**参数：**
- `obj` - 要打开的新路由对象

**示例：**
```typescript
// 关闭当前页面并打开用户列表页
closeOpenPage({ path: '/system/user' })

// 关闭当前页面并打开带查询参数的页面
closeOpenPage({
  path: '/system/user/detail',
  query: { id: '123' }
})

// 在操作完成后跳转到新页面
const submitAndRedirect = async () => {
  try {
    await saveData()
    closeOpenPage({ path: '/dashboard' })
    ElMessage.success('保存成功，正在跳转...')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
```

**使用场景：**
- 表单提交后跳转到列表页
- 创建操作完成后跳转到详情页
- 编辑完成后跳转到查看页面

### openPage

打开新标签页。

```typescript
openPage(url: string, title?: string, query?: Record<string, any>): Promise<any>
```

**参数：**
- `url` - 路由地址
- `title` - 可选的标签页标题
- `query` - 可选的查询参数

**返回值：**
- `Promise` - 路由跳转的Promise结果

**示例：**
```typescript
// 打开基本页面
await openPage('/dashboard')

// 打开带标题和参数的页面
await openPage('/system/user/detail', '用户详情', { id: '123' })

// 在新标签页中打开编辑页面
const handleEdit = (id: string) => {
  openPage('/system/user/edit', '编辑用户', { id })
}

// 动态打开页面
const openDynamicPage = (type: string) => {
  const routes = {
    user: '/system/user',
    role: '/system/role',
    menu: '/system/menu'
  }
  
  const titles = {
    user: '用户管理',
    role: '角色管理', 
    menu: '菜单管理'
  }
  
  openPage(routes[type], titles[type])
}
```

## 关闭操作

### closePage

关闭指定标签页。如果没有指定页面，则关闭当前标签页。

```typescript
closePage(obj?: RouteLocationNormalized): Promise<any>
```

**参数：**
- `obj` - 可选的要关闭的标签页对象

**返回值：**
- `Promise` - 包含已访问视图和缓存视图的数组

**示例：**
```typescript
// 关闭当前页面
await closePage()

// 关闭指定路由页面
const route = { path: '/system/user', ... }
await closePage(route)

// 关闭当前页面并处理导航结果
const handleClose = async () => {
  try {
    const result = await closePage()
    console.log('已关闭页面，剩余页面数:', result.visitedViews.length)
    
    if (result.visitedViews.length === 0) {
      // 如果没有其他页面，跳转到首页
      await openPage('/dashboard')
    }
  } catch (error) {
    ElMessage.error('关闭页面失败')
  }
}

// 确认关闭操作
const confirmClose = async () => {
  try {
    await ElMessageBox.confirm('确定要关闭当前页面吗？', '提示')
    await closePage()
    ElMessage.success('页面已关闭')
  } catch {
    // 用户取消操作
  }
}
```

## 批量关闭操作

### closeAllPage

关闭所有标签页。

```typescript
closeAllPage(): Promise<TagsViewResult>
```

**返回值：**
- `Promise<TagsViewResult>` - 包含已访问视图和缓存视图的数组

**示例：**
```typescript
// 关闭所有标签页
await closeAllPage()

// 确认关闭所有页面
const confirmCloseAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要关闭所有标签页吗？', 
      '提示',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    await closeAllPage()
    ElMessage.success('所有标签页已关闭')
    
    // 跳转到首页
    await openPage('/dashboard')
  } catch {
    // 用户取消操作
  }
}
```

### closeLeftPage

关闭当前标签页左侧的所有标签页。

```typescript
closeLeftPage(obj?: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
```

**参数：**
- `obj` - 可选的参考标签页对象，默认为当前路由

**示例：**
```typescript
// 关闭当前页面左侧的所有标签页
await closeLeftPage()

// 关闭指定页面左侧的所有标签页
const targetRoute = { path: '/system/user', ... }
await closeLeftPage(targetRoute)
```

### closeRightPage

关闭当前标签页右侧的所有标签页。

```typescript
closeRightPage(obj?: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
```

**参数：**
- `obj` - 可选的参考标签页对象，默认为当前路由

**示例：**
```typescript
// 关闭当前页面右侧的所有标签页
await closeRightPage()

// 在特定条件下关闭右侧页面
const conditionalCloseRight = async () => {
  const currentTabs = useTagsViewStore().visitedViews
  
  if (currentTabs.length > 5) {
    await closeRightPage()
    ElMessage.info('已关闭右侧标签页以优化性能')
  }
}
```

### closeOtherPage

关闭除当前标签页外的所有其他标签页。

```typescript
closeOtherPage(obj?: RouteLocationNormalized): Promise<TagsViewResult>
```

**参数：**
- `obj` - 可选的要保留的标签页对象，默认为当前路由

**示例：**
```typescript
// 关闭除当前页面外的所有标签页
await closeOtherPage()

// 关闭除指定页面外的所有标签页
const importantRoute = router.currentRoute.value
await closeOtherPage(importantRoute)

// 智能清理标签页
const smartCleanTabs = async () => {
  const tagsStore = useTagsViewStore()
  
  if (tagsStore.visitedViews.length > 10) {
    await closeOtherPage()
    ElMessage.info('已清理多余的标签页')
  }
}
```

## 页面更新

### updatePage

更新标签页信息，如标题、参数等。

```typescript
updatePage(obj: RouteLocationNormalized): Promise<any>
```

**参数：**
- `obj` - 标签页对象

**示例：**
```typescript
// 更新当前页面标签信息
const route = {
  ...router.currentRoute.value,
  meta: { title: '新标题' }
}
await updatePage(route)

// 动态修改页面标题
const updateTitle = async (newTitle: string) => {
  const route = {
    ...router.currentRoute.value,
    meta: { 
      ...router.currentRoute.value.meta, 
      title: newTitle 
    }
  }
  
  await updatePage(route)
  ElMessage.success('标题已更新')
}

// 根据数据更新页面信息
const updatePageWithData = async (data: any) => {
  const route = {
    ...router.currentRoute.value,
    meta: {
      ...router.currentRoute.value.meta,
      title: `${data.name} - 详情页`
    },
    query: {
      ...router.currentRoute.value.query,
      lastUpdate: Date.now().toString()
    }
  }
  
  await updatePage(route)
}
```

## 实际应用场景

### 1. 标签页右键菜单

```typescript
class TabContextMenu {
  private contextMenu: HTMLElement
  private currentTab: HTMLElement | null = null
  
  constructor() {
    this.createContextMenu()
    this.bindEvents()
  }
  
  createContextMenu() {
    this.contextMenu = document.createElement('div')
    this.contextMenu.className = 'tab-context-menu'
    this.contextMenu.innerHTML = `
      <div class="menu-item" data-action="refresh">刷新页面</div>
      <div class="menu-item" data-action="close">关闭当前</div>
      <div class="menu-item" data-action="close-others">关闭其他</div>
      <div class="menu-item" data-action="close-left">关闭左侧</div>
      <div class="menu-item" data-action="close-right">关闭右侧</div>
      <div class="menu-item" data-action="close-all">关闭所有</div>
    `
    document.body.appendChild(this.contextMenu)
  }
  
  bindEvents() {
    // 右键菜单显示
    document.addEventListener('contextmenu', (e) => {
      const tab = (e.target as HTMLElement).closest('.tab-item')
      if (tab) {
        e.preventDefault()
        this.currentTab = tab as HTMLElement
        this.showContextMenu(e.clientX, e.clientY)
      }
    })
    
    // 菜单项点击
    this.contextMenu.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).dataset.action
      if (action) {
        this.handleMenuAction(action)
        this.hideContextMenu()
      }
    })
    
    // 点击其他地方隐藏菜单
    document.addEventListener('click', () => {
      this.hideContextMenu()
    })
  }
  
  showContextMenu(x: number, y: number) {
    this.contextMenu.style.display = 'block'
    this.contextMenu.style.left = `${x}px`
    this.contextMenu.style.top = `${y}px`
  }
  
  hideContextMenu() {
    this.contextMenu.style.display = 'none'
  }
  
  async handleMenuAction(action: string) {
    try {
      switch (action) {
        case 'refresh':
          await refreshPage()
          ElMessage.success('页面已刷新')
          break
          
        case 'close':
          await closePage()
          break
          
        case 'close-others':
          await closeOtherPage()
          ElMessage.info('已关闭其他标签页')
          break
          
        case 'close-left':
          await closeLeftPage()
          ElMessage.info('已关闭左侧标签页')
          break
          
        case 'close-right':
          await closeRightPage()
          ElMessage.info('已关闭右侧标签页')
          break
          
        case 'close-all':
          await this.confirmCloseAll()
          break
      }
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }
  
  async confirmCloseAll() {
    try {
      await ElMessageBox.confirm('确定要关闭所有标签页吗？', '提示')
      await closeAllPage()
      await openPage('/dashboard')
      ElMessage.success('所有标签页已关闭')
    } catch {
      // 用户取消
    }
  }
}

// 初始化右键菜单
const tabContextMenu = new TabContextMenu()
```

### 2. 标签页管理组件

```typescript
// TabManager.vue
export default defineComponent({
  name: 'TabManager',
  setup() {
    const route = useRoute()
    const tagsViewStore = useTagsViewStore()
    
    // 当前访问的标签页列表
    const visitedViews = computed(() => tagsViewStore.visitedViews)
    
    // 当前活动的标签页
    const activeTab = computed(() => route.path)
    
    // 标签页操作
    const tabActions = {
      // 刷新标签页
      async refresh(tab: RouteLocationNormalized) {
        if (tab.path === route.path) {
          await refreshPage()
        } else {
          // 如果不是当前页面，先跳转再刷新
          await router.push(tab.path)
          await refreshPage()
        }
      },
      
      // 关闭标签页
      async close(tab: RouteLocationNormalized) {
        await closePage(tab)
      },
      
      // 点击标签页
      async click(tab: RouteLocationNormalized) {
        if (tab.path !== route.path) {
          await router.push(tab.fullPath)
        }
      }
    }
    
    // 标签页右键菜单
    const contextMenuActions = {
      refresh: () => tabActions.refresh(route),
      close: () => tabActions.close(route),
      closeOthers: () => closeOtherPage(route),
      closeLeft: () => closeLeftPage(route),
      closeRight: () => closeRightPage(route),
      closeAll: async () => {
        await closeAllPage()
        await openPage('/dashboard')
      }
    }
    
    // 监听路由变化，自动添加标签页
    watch(route, (newRoute) => {
      if (newRoute.name && !newRoute.meta?.noCache) {
        tagsViewStore.addView(newRoute)
      }
    }, { immediate: true })
    
    return {
      visitedViews,
      activeTab,
      tabActions,
      contextMenuActions
    }
  }
})
```

### 3. 智能标签页管理

```typescript
class SmartTabManager {
  private maxTabs: number
  private autoCleanup: boolean
  private cleanupInterval: number
  
  constructor(options = {}) {
    this.maxTabs = options.maxTabs || 20
    this.autoCleanup = options.autoCleanup || true
    this.cleanupInterval = options.cleanupInterval || 30 * 60 * 1000 // 30分钟
    
    if (this.autoCleanup) {
      this.startAutoCleanup()
    }
    
    this.bindEvents()
  }
  
  // 智能添加标签页
  async addTab(route: RouteLocationNormalized) {
    const tagsStore = useTagsViewStore()
    
    // 检查是否超过最大数量
    if (tagsStore.visitedViews.length >= this.maxTabs) {
      await this.cleanupOldTabs()
    }
    
    tagsStore.addView(route)
  }
  
  // 清理旧的标签页
  async cleanupOldTabs() {
    const tagsStore = useTagsViewStore()
    const views = tagsStore.visitedViews
    const currentPath = useRoute().path
    
    // 保留最近访问的标签页和当前页面
    const recentViews = views
      .filter(view => view.path !== currentPath) // 排除当前页面
      .sort((a, b) => (b.meta?.lastVisited || 0) - (a.meta?.lastVisited || 0))
      .slice(this.maxTabs - 5) // 保留最近的几个
    
    // 关闭多余的标签页
    for (const view of recentViews.slice(this.maxTabs - 10)) {
      await closePage(view)
    }
    
    ElMessage.info(`已自动清理 ${recentViews.length - (this.maxTabs - 10)} 个标签页`)
  }
  
  // 自动清理定时器
  startAutoCleanup() {
    setInterval(() => {
      this.checkAndCleanup()
    }, this.cleanupInterval)
  }
  
  async checkAndCleanup() {
    const tagsStore = useTagsViewStore()
    
    if (tagsStore.visitedViews.length > this.maxTabs) {
      await this.cleanupOldTabs()
    }
  }
  
  // 绑定事件监听
  bindEvents() {
    // 监听页面刷新前的事件
    window.addEventListener('beforeunload', () => {
      this.saveTabsState()
    })
    
    // 页面加载时恢复标签页状态
    this.restoreTabsState()
  }
  
  // 保存标签页状态
  saveTabsState() {
    const tagsStore = useTagsViewStore()
    const state = {
      visitedViews: tagsStore.visitedViews,
      timestamp: Date.now()
    }
    
    localStorage.setItem('tabs-state', JSON.stringify(state))
  }
  
  // 恢复标签页状态
  restoreTabsState() {
    try {
      const state = JSON.parse(localStorage.getItem('tabs-state') || '{}')
      
      // 检查状态是否过期（超过1小时）
      if (state.timestamp && (Date.now() - state.timestamp) < 60 * 60 * 1000) {
        const tagsStore = useTagsViewStore()
        state.visitedViews?.forEach(view => {
          tagsStore.addView(view)
        })
      }
    } catch (error) {
      console.warn('恢复标签页状态失败:', error)
    }
  }
}

// 初始化智能标签页管理
const smartTabManager = new SmartTabManager({
  maxTabs: 15,
  autoCleanup: true,
  cleanupInterval: 20 * 60 * 1000 // 20分钟清理一次
})
```

### 4. 标签页状态持久化

```typescript
class TabsPersistence {
  private storageKey = 'vue-admin-tabs'
  
  // 保存标签页状态
  saveTabs() {
    const tagsStore = useTagsViewStore()
    const tabsData = {
      visitedViews: tagsStore.visitedViews.map(view => ({
        name: view.name,
        path: view.path,
        fullPath: view.fullPath,
        query: view.query,
        params: view.params,
        meta: view.meta
      })),
      cachedViews: tagsStore.cachedViews,
      timestamp: Date.now()
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(tabsData))
  }
  
  // 恢复标签页状态
  async restoreTabs() {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) return
      
      const tabsData = JSON.parse(data)
      
      // 检查数据是否过期（24小时）
      const isExpired = Date.now() - tabsData.timestamp > 24 * 60 * 60 * 1000
      if (isExpired) {
        this.clearTabs()
        return
      }
      
      const tagsStore = useTagsViewStore()
      
      // 恢复访问过的视图
      for (const view of tabsData.visitedViews || []) {
        try {
          // 验证路由是否仍然有效
          const route = router.resolve(view.fullPath)
          if (route.name !== 'NotFound') {
            tagsStore.addView(view)
          }
        } catch (error) {
          console.warn('恢复标签页失败:', view.path, error)
        }
      }
      
      // 恢复缓存视图
      if (tabsData.cachedViews) {
        tagsStore.setCachedViews(tabsData.cachedViews)
      }
      
    } catch (error) {
      console.error('恢复标签页状态失败:', error)
      this.clearTabs()
    }
  }
  
  // 清理标签页数据
  clearTabs() {
    localStorage.removeItem(this.storageKey)
  }
  
  // 监听标签页变化并自动保存
  watchTabsChange() {
    const tagsStore = useTagsViewStore()
    
    // 监听标签页变化
    watch(
      () => tagsStore.visitedViews,
      () => {
        this.saveTabs()
      },
      { deep: true }
    )
    
    // 页面卸载时保存
    window.addEventListener('beforeunload', () => {
      this.saveTabs()
    })
  }
}

// 使用标签页持久化
const tabsPersistence = new TabsPersistence()

// 在应用启动时恢复标签页
export const setupTabsPersistence = async () => {
  await tabsPersistence.restoreTabs()
  tabsPersistence.watchTabsChange()
}
```

## 最佳实践

### 1. 标签页性能优化

```typescript
// 限制同时打开的标签页数量
const MAX_TABS = 15

// 检查标签页数量
const checkTabsLimit = async () => {
  const tagsStore = useTagsViewStore()
  
  if (tagsStore.visitedViews.length > MAX_TABS) {
    ElMessageBox.confirm(
      `当前打开了 ${tagsStore.visitedViews.length} 个标签页，建议关闭一些以提升性能`,
      '提示',
      {
        confirmButtonText: '自动清理',
        cancelButtonText: '手动管理'
      }
    ).then(() => {
      // 自动关闭最老的标签页
      autoCleanupTabs()
    })
  }
}
```

### 2. 标签页状态管理

```typescript
// 标签页状态枚举
enum TabState {
  NORMAL = 'normal',
  LOADING = 'loading', 
  ERROR = 'error',
  CACHED = 'cached'
}

// 更新标签页状态
const updateTabState = (path: string, state: TabState) => {
  const tagsStore = useTagsViewStore()
  const view = tagsStore.visitedViews.find(v => v.path === path)
  
  if (view) {
    view.meta = {
      ...view.meta,
      state,
      lastUpdate: Date.now()
    }
    
    updatePage(view)
  }
}
```

### 3. 错误处理

```typescript
// 统一的错误处理
const handleTabError = (error: any, operation: string) => {
  console.error(`标签页操作失败 [${operation}]:`, error)
  
  ElMessage.error({
    message: `${operation}失败，请重试`,
    duration: 3000
  })
}

// 安全的标签页操作
const safeTabOperation = async (operation: () => Promise<any>, operationName: string) => {
  try {
    await operation()
  } catch (error) {
    handleTabError(error, operationName)
  }
}
```

## 注意事项

1. **路由依赖**：所有函数都依赖 Vue Router，确保在路由环境中使用
2. **状态管理**：需要配合 Pinia 的 TagsViewStore 使用
3. **缓存策略**：合理设置页面缓存，避免内存泄漏
4. **性能考虑**：限制同时打开的标签页数量
5. **用户体验**：提供合适的加载状态和错误提示

## 常见问题

### 1. 页面刷新后标签页数据丢失

**问题描述:** 刷新浏览器后，之前打开的标签页全部消失

**问题原因:**

- 标签页状态存储在内存中（Pinia Store）
- 页面刷新后 Pinia 状态会重置
- 未实现持久化存储机制

**解决方案:**

```typescript
// 在 TagsViewStore 中添加持久化支持
import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [] as RouteLocationNormalized[],
    cachedViews: [] as string[]
  }),

  actions: {
    // 初始化时从 localStorage 恢复
    initFromStorage() {
      try {
        const saved = localStorage.getItem('tagsView')
        if (saved) {
          const data = JSON.parse(saved)
          // 验证数据有效期（如24小时）
          if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
            this.visitedViews = data.visitedViews || []
            this.cachedViews = data.cachedViews || []
          }
        }
      } catch (e) {
        console.warn('恢复标签页失败:', e)
      }
    },

    // 保存到 localStorage
    saveToStorage() {
      const data = {
        visitedViews: this.visitedViews.map(v => ({
          path: v.path,
          fullPath: v.fullPath,
          name: v.name,
          meta: v.meta,
          query: v.query
        })),
        cachedViews: this.cachedViews,
        timestamp: Date.now()
      }
      localStorage.setItem('tagsView', JSON.stringify(data))
    }
  }
})

// 在 App.vue 中初始化
onMounted(() => {
  const tagsViewStore = useTagsViewStore()
  tagsViewStore.initFromStorage()
})

// 监听变化自动保存
watch(
  () => tagsViewStore.visitedViews,
  () => tagsViewStore.saveToStorage(),
  { deep: true }
)
```

### 2. refreshPage 刷新无效

**问题描述:** 调用 `refreshPage()` 后页面内容未更新

**问题原因:**

- 组件未设置 `name` 属性，导致无法正确从缓存中移除
- keep-alive 的 `include` 配置与组件名不匹配
- redirect 路由未正确配置

**解决方案:**

```typescript
// 1. 确保组件有正确的 name
// UserList.vue
<script lang="ts">
export default {
  name: 'UserList'  // 必须与路由配置的 name 一致
}
</script>

<script lang="ts" setup>
// setup 代码
</script>

// 2. 确保路由配置正确
{
  path: '/system/user',
  name: 'UserList',  // 与组件 name 一致
  component: () => import('@/views/system/user/index.vue'),
  meta: { title: '用户管理', noCache: false }
}

// 3. 确保 redirect 路由存在
{
  path: '/redirect/:path(.*)',
  component: () => import('@/views/redirect/index.vue'),
  hidden: true
}

// 4. redirect 组件实现
// views/redirect/index.vue
<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  const { params, query } = route
  const { path } = params
  router.replace({ path: '/' + path, query })
})
</script>
```

### 3. closePage 后跳转到错误页面

**问题描述:** 关闭当前标签页后，没有正确跳转到上一个标签页

**问题原因:**

- 关闭后未处理跳转逻辑
- 标签页列表为空时未跳转到默认页面

**解决方案:**

```typescript
// ❌ 错误：直接关闭不处理跳转
await closePage()

// ✅ 正确：关闭后智能跳转
const smartClosePage = async (targetRoute?: RouteLocationNormalized) => {
  const route = targetRoute || useRoute()
  const router = useRouter()
  const tagsViewStore = useTagsViewStore()

  // 获取当前页面在列表中的索引
  const index = tagsViewStore.visitedViews.findIndex(
    v => v.path === route.path
  )

  // 关闭页面
  const { visitedViews } = await closePage(route)

  // 智能跳转
  if (visitedViews.length === 0) {
    // 没有其他标签页，跳转首页
    await router.push('/dashboard')
  } else if (route.path === useRoute().path) {
    // 关闭的是当前页面，需要跳转
    // 优先跳转到右边的标签页，否则跳转左边
    const targetIndex = Math.min(index, visitedViews.length - 1)
    const targetView = visitedViews[targetIndex]
    await router.push(targetView.fullPath)
  }
}

// 使用
await smartClosePage()
```

### 4. 标签页缓存导致数据不更新

**问题描述:** 从列表页进入详情页编辑后返回，列表页数据未刷新

**问题原因:**

- keep-alive 缓存了列表页组件
- 返回时使用了缓存的旧数据

**解决方案:**

```typescript
// 方案1：使用 onActivated 钩子刷新数据
// UserList.vue
<script lang="ts" setup>
import { onActivated } from 'vue'

const loadData = async () => {
  // 加载列表数据
}

// 组件激活时刷新数据
onActivated(() => {
  loadData()
})
</script>

// 方案2：通过路由参数判断是否需要刷新
// 编辑页保存后跳转
closeOpenPage({
  path: '/system/user',
  query: { refresh: Date.now().toString() }
})

// 列表页监听
watch(
  () => route.query.refresh,
  (newVal) => {
    if (newVal) {
      loadData()
    }
  }
)

// 方案3：关闭列表页缓存后再跳转
const saveAndBack = async () => {
  await saveData()

  // 先删除列表页缓存
  const tagsViewStore = useTagsViewStore()
  tagsViewStore.delCachedView({ name: 'UserList' })

  // 再跳转回列表页
  closeOpenPage({ path: '/system/user' })
}
```

### 5. 动态路由标签页显示异常

**问题描述:** 同一个路由不同参数打开多个标签页时显示混乱

**问题原因:**

- 动态路由使用相同的 `path`，导致标签页去重
- 标签页 title 显示相同

**解决方案:**

```typescript
// 1. 使用 fullPath 作为标签页唯一标识
// TagsView.vue
<el-tag
  v-for="tag in visitedViews"
  :key="tag.fullPath"  // 使用 fullPath 而非 path
  :class="{ active: isActive(tag) }"
>
  {{ tag.meta?.title }}
</el-tag>

// 2. 动态设置标签页标题
// UserDetail.vue
<script lang="ts" setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 根据数据动态更新标题
watch(
  () => route.params.id,
  async (id) => {
    const user = await fetchUser(id)
    // 更新标签页标题
    await updatePage({
      ...route,
      meta: {
        ...route.meta,
        title: `用户详情 - ${user.name}`
      }
    })
  },
  { immediate: true }
)
</script>

// 3. 路由配置支持动态标题
{
  path: '/system/user/:id',
  name: 'UserDetail',
  component: () => import('@/views/system/user/detail.vue'),
  meta: {
    title: '用户详情',
    activeMenu: '/system/user',
    noCache: true  // 动态路由建议不缓存
  }
}
```

### 6. 标签页过多导致性能问题

**问题描述:** 打开大量标签页后，页面响应变慢，内存占用高

**问题原因:**

- keep-alive 缓存了过多组件实例
- 每个缓存的组件都占用内存
- DOM 节点过多影响渲染性能

**解决方案:**

```typescript
// 1. 限制缓存数量
// App.vue
<router-view v-slot="{ Component }">
  <keep-alive :max="10" :include="cachedViews">
    <component :is="Component" :key="route.fullPath" />
  </keep-alive>
</router-view>

// 2. 智能清理机制
class TabsMemoryManager {
  private maxTabs = 15
  private checkInterval = 5 * 60 * 1000 // 5分钟检查一次

  constructor() {
    this.startMonitoring()
  }

  startMonitoring() {
    setInterval(() => this.checkMemory(), this.checkInterval)
  }

  async checkMemory() {
    const tagsStore = useTagsViewStore()

    if (tagsStore.visitedViews.length > this.maxTabs) {
      // 获取最久未访问的标签页
      const sortedViews = [...tagsStore.visitedViews]
        .filter(v => !v.meta?.affix) // 排除固定标签
        .sort((a, b) =>
          (a.meta?.lastVisited || 0) - (b.meta?.lastVisited || 0)
        )

      // 关闭最久未访问的标签页
      const toClose = sortedViews.slice(0, sortedViews.length - this.maxTabs + 5)
      for (const view of toClose) {
        await closePage(view)
      }

      ElMessage.info(`已自动清理 ${toClose.length} 个闲置标签页`)
    }
  }
}

// 3. 记录标签页访问时间
router.afterEach((to) => {
  const tagsStore = useTagsViewStore()
  const view = tagsStore.visitedViews.find(v => v.path === to.path)
  if (view) {
    view.meta = { ...view.meta, lastVisited: Date.now() }
  }
})
```
