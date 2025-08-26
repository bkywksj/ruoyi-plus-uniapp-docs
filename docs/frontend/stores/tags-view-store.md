# 标签视图管理 (tagsView)

## 功能概述

标签视图管理模块提供类似浏览器的多标签页导航体验，支持页面快速切换和状态缓存。

## 核心职责

- **标签管理**：添加、删除、更新页面标签
- **批量操作**：关闭其他、左侧、右侧、全部标签
- **状态缓存**：管理页面keep-alive缓存
- **iframe支持**：管理内嵌的外部页面

## 状态定义

```typescript
// 访问的视图
visitedViews: RouteLocationNormalized[]   // 标签栏显示的页面
cachedViews: string[]                      // keep-alive缓存的组件名
iframeViews: RouteLocationNormalized[]    // iframe页面列表
```

## 核心方法

### addView - 添加视图
```typescript
addView(view: RouteLocationNormalized): void
```
同时添加到访问历史和缓存列表，最常用的添加方法。

### delView - 删除视图
```typescript
delView(view: RouteLocationNormalized): Promise<{
  visitedViews: RouteLocationNormalized[]
  cachedViews: string[]
}>
```
删除指定标签和缓存：
- 从标签栏移除
- 清理keep-alive缓存
- 动态路由特殊处理

### delOthersViews - 关闭其他
```typescript
delOthersViews(view: RouteLocationNormalized): Promise<{...}>
```
保留当前标签和固定标签，关闭其他所有标签。

### delLeftTags / delRightTags - 批量关闭
```typescript
delLeftTags(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
delRightTags(view: RouteLocationNormalized): Promise<RouteLocationNormalized[]>
```
关闭左侧或右侧的所有标签（固定标签除外）。

### delAllViews - 关闭全部
```typescript
delAllViews(): Promise<{...}>
```
清空所有标签和缓存（固定标签除外）。

### updateVisitedView - 更新视图
```typescript
updateVisitedView(view: RouteLocationNormalized): void
```
更新已存在的视图信息，用于路由参数变化的场景。

## 缓存机制

### Keep-Alive集成
```vue
<keep-alive :include="cachedViews">
  <router-view />
</keep-alive>
```

### 缓存规则
1. 组件必须设置name属性
2. name需与路由name一致
3. meta.noCache为true时不缓存
4. 动态路由特殊处理

### 动态路由处理
```typescript
isDynamicRoute(view: RouteLocationNormalized): boolean
```
检测包含参数的动态路由，避免错误清理缓存。

## 固定标签

### 配置方式
```typescript
// 路由配置中设置
{
  path: '/dashboard',
  meta: {
    title: '首页',
    affix: true  // 固定标签
  }
}
```

### 固定标签特性
- 不可关闭
- 始终显示在标签栏
- 关闭全部时保留

## iframe视图管理

### 添加iframe
```typescript
addIframeView(view: RouteLocationNormalized): void
```
管理外部链接页面：
- 在路由meta中配置link
- 支持多个iframe并存
- 独立的生命周期管理

### 使用示例
```typescript
// 路由配置
{
  path: '/external-link',
  component: InnerLink,
  meta: {
    title: '外部系统',
    link: 'https://example.com'
  }
}
```

## 使用示例

### 标签栏组件
```vue
<template>
  <div class="tags-view-container">
    <router-link
      v-for="tag in visitedViews"
      :key="tag.path"
      :to="tag"
      :class="isActive(tag) ? 'active' : ''"
      @contextmenu.prevent="openMenu(tag, $event)"
    >
      {{ tag.meta.title }}
      <span 
        v-if="!isAffix(tag)" 
        @click.prevent.stop="closeTag(tag)"
      >×</span>
    </router-link>
  </div>
</template>

<script setup>
const tagsViewStore = useTagsViewStore()
const visitedViews = computed(() => tagsViewStore.getVisitedViews())

const closeTag = async (tag) => {
  await tagsViewStore.delView(tag)
  if (isActive(tag)) {
    toLastView()
  }
}
</script>
```

### 右键菜单
```typescript
// 右键菜单选项
const menuOptions = [
  { label: '刷新', command: 'refresh' },
  { label: '关闭', command: 'close' },
  { label: '关闭其他', command: 'closeOthers' },
  { label: '关闭左侧', command: 'closeLeft' },
  { label: '关闭右侧', command: 'closeRight' },
  { label: '关闭全部', command: 'closeAll' }
]

// 处理菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'closeOthers':
      await tagsViewStore.delOthersViews(currentTag)
      break
    case 'closeLeft':
      await tagsViewStore.delLeftTags(currentTag)
      break
    // ...
  }
}
```

### 路由监听
```typescript
// 监听路由变化，自动添加标签
watch(
  () => route.path,
  () => {
    if (route.name) {
      tagsViewStore.addView(route)
    }
  },
  { immediate: true }
)
```

## 与其他模块协作

### 与Permission Store
- 获取可访问的路由列表
- 验证路由访问权限

### 与Theme Store
- 根据tagsView设置显示/隐藏
- 响应布局模式变化

### 与路由系统
- 监听路由变化
- 管理路由缓存
- 处理路由跳转

## 性能优化

1. **缓存策略**
    - 合理设置缓存上限
    - 及时清理无用缓存
    - 避免重复缓存

2. **标签数量控制**
    - 设置最大标签数
    - 自动清理最早的标签
    - 保留重要页面

3. **动画优化**
    - 标签切换动画
    - 滚动定位优化
    - 减少重绘重排

## 最佳实践

1. **组件命名规范**：确保组件name与路由name一致
2. **固定标签设置**：重要页面设置为固定标签
3. **缓存控制**：合理使用noCache控制缓存
4. **生命周期管理**：正确处理组件激活/停用事件
5. **状态保持**：页面刷新后恢复标签状态
