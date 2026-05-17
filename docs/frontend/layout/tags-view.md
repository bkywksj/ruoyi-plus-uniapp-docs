# 标签视图(TagsView)系统

## 简介

标签视图系统是现代后台管理界面的核心交互组件，提供类似浏览器多标签页的管理和导航功能。该系统采用模块化架构设计，由 `TagsView.vue`（标签管理主组件）、`ScrollPane.vue`（水平滚动容器）和 `tab.ts`（标签操作工具函数）三大核心模块构成，配合 `useLayout` Composable 实现响应式状态管理。

系统支持标签页的增删改查、右键上下文菜单、固定标签(Affix)、自动滚动定位、国际化标题、视图缓存联动、动态路由处理等丰富功能，是构建高效后台管理系统的重要组成部分。

**核心特性:**

- **多标签管理** - 支持标签的添加、关闭、刷新，自动去重和状态保持
- **固定标签(Affix)** - 重要页面设为固定标签，无法被关闭，始终可访问
- **右键菜单** - 提供刷新、关闭当前/其他/左侧/右侧/全部等丰富操作
- **智能滚动** - 鼠标滚轮水平滚动，新标签自动滚动到可视区域
- **缓存联动** - 与 keep-alive 深度集成，标签关闭时自动清理缓存
- **国际化支持** - 支持多语言标签标题，包含动态参数模板
- **深色模式适配** - 完美支持亮色/暗色主题切换
- **响应式布局** - 适配不同屏幕尺寸，移动端自动隐藏

## 组件架构

```text
TagsView/
├── TagsView.vue        # 标签页管理主组件(637行)
│   ├── 标签列表渲染
│   ├── 右键上下文菜单
│   ├── 固定标签初始化
│   ├── 路由监听和标签添加
│   └── 标签操作方法
├── ScrollPane.vue      # 水平滚动容器组件(322行)
│   ├── 鼠标滚轮处理
│   ├── 自动滚动定位
│   ├── 相邻标签检测
│   └── 最优滚动位置计算
└── (依赖)
    ├── useLayout.ts    # 布局状态管理(tagsViewMethods)
    └── tab.ts          # 标签操作工具函数
```

## 核心组件详解

### TagsView.vue - 标签页管理

标签页管理的核心组件，负责标签的显示、交互和生命周期管理。

#### 组件结构

```vue
<template>
  <div id="tags-view-container" class="tags-view-container" ref="containerRef">
    <!-- 标签页滚动容器 -->
    <ScrollPane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll">
      <!-- 遍历所有访问过的视图标签 -->
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="['tags-view-item', { 'active': isActive(tag) }]"
        :to="{ path: tag.path ? tag.path : '', query: tag.query }"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <!-- 标签图标 -->
        <div class="tag-icon">
          <Icon :code="tag.meta?.icon || 'nested'" />
        </div>

        <!-- 标签文本内容 -->
        <div class="tag-text">
          {{ getTagTitle(tag) }}
        </div>

        <!-- 关闭按钮 - 仅非固定标签显示 -->
        <span v-if="!isAffix(tag)" class="close-btn" @click.prevent.stop="closeSelectedTag(tag)">
          <svg class="close-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </span>
      </router-link>
    </ScrollPane>

    <!-- 右键上下文菜单 -->
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        <Icon code="refresh" />
        {{ t('tagsView.refresh') }}
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <Icon code="close" />
        {{ t('tagsView.close') }}
      </li>
      <li @click="closeOthersTags">
        <Icon code="close_circle" />
        {{ t('tagsView.closeOthers') }}
      </li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <Icon code="back" />
        {{ t('tagsView.closeLeft') }}
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
        <Icon code="right" />
        {{ t('tagsView.closeRight') }}
      </li>
      <li @click="closeAllTags(selectedTag)">
        <Icon code="close_circle" />
        {{ t('tagsView.closeAll') }}
      </li>
    </ul>
  </div>
</template>
```

#### 组件配置

```typescript
<script lang="ts" setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter, type RouteRecordRaw, type RouteLocationNormalized } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ScrollPane from './ScrollPane.vue'
import { routes } from '@/router/routeModules'
import { nameToTitle } from '@/utils/i18n'
import { normalizePath } from '@/utils/path'
import { refreshPage, closePage, closeOtherPage, closeLeftPage, closeRightPage, closeAllPage } from '@/utils/tab'

defineOptions({
  name: 'TagsView'
})
</script>
```

#### 核心功能实现

**标签状态管理**

```typescript
// 访问过的视图列表 - 从布局状态管理获取
const visitedViews = computed(() => useLayout().getVisitedViews())

// 检查标签是否为当前激活状态
const isActive = (r: RouteLocationNormalized): boolean => {
  return r.path === route.path
}

// 检查标签是否为固定标签（不可关闭）
const isAffix = (tag: RouteLocationNormalized | undefined) => {
  return tag?.meta && tag?.meta?.affix
}

// 检查是否是第一个标签（用于禁用"关闭左侧"菜单项）
const isFirstView = () => {
  try {
    return selectedTag.value?.path === visitedViews.value[0]?.path ||
      selectedTag.value?.path === '/index'
  } catch {
    return false
  }
}

// 检查是否是最后一个标签（用于禁用"关闭右侧"菜单项）
const isLastView = () => {
  try {
    return selectedTag.value?.path === visitedViews.value[visitedViews.value.length - 1]?.path
  } catch {
    return false
  }
}
```

**国际化标题处理**

系统支持多种标题格式，按优先级处理：

```typescript
/**
 * 获取标签标题
 * 优先级: i18nKey > 动态参数模板 > name转换 > 原始title
 */
const getTagTitle = (tag: RouteLocationNormalized) => {
  const meta = tag?.meta
  const name = tag?.name

  // 1. 优先使用国际化键进行翻译
  if (meta?.i18nKey) {
    const i18nTitle = t(meta.i18nKey)
    // 如果翻译成功（返回值不等于键名），使用翻译结果
    if (i18nTitle !== meta.i18nKey) {
      return i18nTitle
    }
  }

  // 2. 处理包含动态参数的标题模板
  // 支持格式: "用户详情-{name}" 配合 meta.titleParams
  if (meta?.title?.includes('{')) {
    try {
      return t(meta.title, meta.titleParams || {})
    } catch {
      // 解析失败时返回原始标题
      return meta.title
    }
  }

  // 3. 降级处理：使用名称转换的标题或者原始标题
  // nameToTitle 将路由名称转换为标题格式
  return t(nameToTitle(name?.toString() || ''), meta?.title)
}
```

**固定标签初始化**

系统启动时自动扫描路由配置，将设置了 `affix: true` 的路由添加为固定标签：

```typescript
/**
 * 过滤并提取固定标签
 * 递归遍历路由配置，收集所有 affix=true 的路由
 */
const filterAffixTags = (routes: RouteRecordRaw[], basePath = '') => {
  let tags: RouteLocationNormalized[] = []

  routes.forEach((route) => {
    // 检查当前路由是否为固定标签
    if (route.meta && route.meta.affix) {
      const tagPath = normalizePath(basePath + '/' + route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name as string,
        meta: { ...route.meta }
      } as RouteLocationNormalized)
    }

    // 递归处理子路由
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })

  return tags
}

/**
 * 初始化固定标签
 * 在组件挂载时调用，将固定标签添加到视图列表
 */
const initTags = () => {
  const affixTags = filterAffixTags(routes)
  for (const tag of affixTags) {
    // 只添加有名称的路由
    if (tag.name) {
      useLayout().addVisitedView(tag)
    }
  }
}
```

**标签添加和更新**

```typescript
/**
 * 添加当前路由为新标签
 * 路由变化时自动调用
 */
const addTags = () => {
  const { name } = route

  // 如果查询参数中包含标题，更新路由元信息
  // 支持动态标题: /user/detail?title=张三详情
  if (route.query.title) {
    route.meta.title = route.query.title as string
  }

  // 有效路由名称时添加到视图存储
  if (name) {
    useLayout().addView(route as any)
  }
}

/**
 * 滚动到当前激活的标签位置
 * 确保当前标签在可视区域内
 */
const moveToCurrentTag = async () => {
  await nextTick()
  for (const r of visitedViews.value) {
    if (r.path === route.path) {
      // 调用 ScrollPane 的滚动方法
      scrollPaneRef.value?.moveToTarget(r)
      // 如果完整路径不同则更新视图信息
      // 处理带不同查询参数的同一路由
      if (r.fullPath !== route.fullPath) {
        useLayout().updateVisitedView(route)
      }
    }
  }
}
```

#### 右键菜单系统

**菜单显示控制**

```typescript
// 菜单状态
const visible = ref(false)          // 菜单可见性
const top = ref(0)                  // 菜单Y位置
const left = ref(0)                 // 菜单X位置
const selectedTag = ref<RouteLocationNormalized>()  // 选中的标签

/**
 * 打开右键菜单
 * 计算菜单位置，防止超出容器边界
 */
const openMenu = (tag: RouteLocationNormalized, e: MouseEvent) => {
  const menuMinWidth = 105  // 菜单最小宽度
  const container = containerRef.value
  if (!container) return

  // 计算菜单位置 - 相对于容器
  const offsetLeft = container.getBoundingClientRect().left
  const offsetWidth = container.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth  // 最大左偏移，防止超出右边界

  // 计算实际左偏移，鼠标位置加15px偏移
  const l = e.clientX - offsetLeft + 15

  // 边界处理：如果超出右边界则使用最大值
  left.value = l > maxLeft ? maxLeft : l
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

// 点击其他区域关闭菜单
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})
```

**菜单操作实现**

```typescript
/**
 * 刷新选中的标签页
 * 使用 redirect 路由实现刷新
 */
const refreshSelectedTag = (view: RouteLocationNormalized | undefined) => {
  if (!view) return
  refreshPage(view)
}

/**
 * 关闭选中的标签页
 * 如果关闭的是当前激活标签，自动跳转到最后一个标签
 */
const closeSelectedTag = (view: RouteLocationNormalized | undefined) => {
  if (!view) return
  closePage(view).then(({ visitedViews }: any) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

/**
 * 关闭其他标签页
 * 保留当前选中的标签和固定标签
 */
const closeOthersTags = () => {
  if (selectedTag.value) {
    // 先导航到选中的标签
    router.push({
      path: selectedTag.value.path,
      query: selectedTag.value.query
    }).catch(() => {})
  }

  closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

/**
 * 关闭左侧标签页
 */
const closeLeftTags = () => {
  closeLeftPage(selectedTag.value).then((visitedViews: RouteLocationNormalized[]) => {
    // 如果当前路由不在剩余标签中，跳转到选中标签
    if (!visitedViews.find((i) => i.path === route.path)) {
      toLastView(visitedViews, selectedTag.value)
    }
  })
}

/**
 * 关闭右侧标签页
 */
const closeRightTags = () => {
  closeRightPage(selectedTag.value).then((visitedViews: RouteLocationNormalized[]) => {
    if (!visitedViews.find((i) => i.path === route.path)) {
      toLastView(visitedViews, selectedTag.value)
    }
  })
}

/**
 * 关闭所有标签页
 * 保留固定标签，如果当前标签是固定标签则保持，否则跳转
 */
const closeAllTags = (view: RouteLocationNormalized | undefined) => {
  closeAllPage().then(({ visitedViews }) => {
    // 如果固定标签中包含当前路由，不跳转
    if (affixTags.value.some((tag) => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}

/**
 * 跳转到最后一个标签
 * 用于关闭当前标签后的导航
 */
const toLastView = (
  visitedViews: RouteLocationNormalized[],
  view: RouteLocationNormalized | undefined
) => {
  // 获取最后一个标签
  const latestView = visitedViews.slice(-1)[0]

  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    // 没有其他标签时的处理
    if (view?.name === 'Dashboard') {
      // 首页刷新重定向
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      // 跳转到首页
      router.push('/')
    }
  }
}
```

### ScrollPane.vue - 滚动容器

提供标签页的水平滚动功能，支持鼠标滚轮操作和自动定位。

#### 组件模板

```vue
<template>
  <el-scrollbar
    ref="scrollContainerRef"
    :vertical="false"
    class="scroll-container"
    @wheel.prevent="handleMouseWheel"
  >
    <slot />
  </el-scrollbar>
</template>
```

#### 核心功能实现

**鼠标滚轮水平滚动**

```typescript
/**
 * 标签间距（px）
 * 用于计算滚动位置时的间距调整
 */
const TAG_SPACING = 4

/**
 * 获取滚动包装器的 DOM 元素
 */
const scrollWrapper = computed(() => {
  const wrapRef = scrollContainerRef.value?.$refs.wrapRef
  return wrapRef as HTMLElement | undefined
})

/**
 * 处理鼠标滚轮事件
 * 实现自定义的水平滚动行为
 *
 * 滚动方向映射:
 * - 往上滚动(deltaY < 0) → scrollLeft减少 → 向左移动
 * - 往下滚动(deltaY > 0) → scrollLeft增加 → 向右移动
 */
const handleMouseWheel = (e: WheelEvent): void => {
  // 获取滚轮的滚动量，兼容不同浏览器
  // wheelDelta 是旧版API，deltaY 是标准API
  const eventDelta = (e as any).wheelDelta || -e.deltaY * 40
  const wrapper = scrollWrapper.value

  if (wrapper) {
    // 除以4进行平滑处理，避免滚动过快
    wrapper.scrollLeft = wrapper.scrollLeft - eventDelta / 4
  }
}
```

**自动滚动定位**

当切换标签或新增标签时，自动将目标标签滚动到可视区域：

```typescript
/**
 * 将视图滚动到指定的目标标签位置
 *
 * 滚动策略:
 * 1. 如果目标是第一个标签，滚动到最左侧
 * 2. 如果目标是最后一个标签，滚动到最右侧
 * 3. 其他情况，确保目标标签及其前后标签都在视口内
 */
const moveToTarget = (currentTag: RouteLocationNormalized): void => {
  // 获取容器和包装器元素
  const container = scrollContainerRef.value?.$el as HTMLElement
  const wrapper = scrollWrapper.value

  // 基础验证
  if (!container || !wrapper) {
    console.warn('ScrollPane: 容器或包装器元素未找到')
    return
  }

  const containerWidth = container.offsetWidth
  const views = visitedViews.value

  // 处理空数组情况
  if (views.length === 0) {
    console.warn('ScrollPane: 没有可访问的视图')
    return
  }

  const firstTag = views[0]
  const lastTag = views[views.length - 1]

  // 边界情况：第一个标签 - 滚动到最左侧
  if (firstTag === currentTag) {
    wrapper.scrollLeft = 0
    return
  }

  // 边界情况：最后一个标签 - 滚动到最右侧
  if (lastTag === currentTag) {
    wrapper.scrollLeft = wrapper.scrollWidth - containerWidth
    return
  }

  // 计算目标标签的索引位置
  const currentIndex = views.findIndex((item) => item === currentTag)

  if (currentIndex !== -1) {
    // 查找相邻标签并计算最优滚动位置
    const { prevTagElement, nextTagElement } = findAdjacentTagElements(
      views as RouteLocationNormalized[],
      currentIndex
    )

    if (prevTagElement && nextTagElement) {
      calculateOptimalScrollPosition(wrapper, containerWidth, prevTagElement, nextTagElement)
    }
  }
}
```

**相邻标签检测**

```typescript
/**
 * 查找指定索引标签的前后相邻 DOM 元素
 * 通过 data-path 属性匹配标签
 */
const findAdjacentTagElements = (
  views: RouteLocationNormalized[],
  currentIndex: number
): { prevTagElement: HTMLElement | null; nextTagElement: HTMLElement | null } => {
  // 获取所有标签的 DOM 元素
  const tagListDom = document.getElementsByClassName('tags-view-item') as HTMLCollectionOf<HTMLElement>

  let prevTagElement: HTMLElement | null = null
  let nextTagElement: HTMLElement | null = null

  // 获取前后标签的路径用于匹配
  const prevTagPath = views[currentIndex - 1]?.path
  const nextTagPath = views[currentIndex + 1]?.path

  // 遍历 DOM 元素查找匹配的前后标签
  for (let i = 0; i < tagListDom.length; i++) {
    const tagDom = tagListDom[i]
    const tagPath = tagDom.dataset.path  // 读取 data-path 属性

    if (tagPath === prevTagPath) {
      prevTagElement = tagDom
    }
    if (tagPath === nextTagPath) {
      nextTagElement = tagDom
    }

    // 如果都找到了，提前退出循环（性能优化）
    if (prevTagElement && nextTagElement) {
      break
    }
  }

  return { prevTagElement, nextTagElement }
}
```

**最优滚动位置计算**

```typescript
/**
 * 计算并设置最佳滚动位置
 * 确保目标标签的前后标签都在视口范围内
 */
const calculateOptimalScrollPosition = (
  wrapper: HTMLElement,
  containerWidth: number,
  prevTagElement: HTMLElement,
  nextTagElement: HTMLElement
): void => {
  // 计算后一个标签右边界位置（包含间距）
  const afterNextTagOffsetLeft =
    nextTagElement.offsetLeft + nextTagElement.offsetWidth + TAG_SPACING

  // 计算前一个标签左边界位置（包含间距）
  const beforePrevTagOffsetLeft = prevTagElement.offsetLeft - TAG_SPACING

  // 判断是否需要向右滚动（后一个标签超出右边界）
  if (afterNextTagOffsetLeft > wrapper.scrollLeft + containerWidth) {
    wrapper.scrollLeft = afterNextTagOffsetLeft - containerWidth
  }
  // 判断是否需要向左滚动（前一个标签超出左边界）
  else if (beforePrevTagOffsetLeft < wrapper.scrollLeft) {
    wrapper.scrollLeft = beforePrevTagOffsetLeft
  }
}
```

#### 生命周期管理

```typescript
/**
 * 组件挂载时的初始化操作
 * 添加滚动事件监听器
 */
onMounted(() => {
  const wrapper = scrollWrapper.value
  if (wrapper) {
    wrapper.addEventListener('scroll', handleScrollEvent, true)
  }
})

/**
 * 组件卸载前的清理操作
 * 移除滚动事件监听器，防止内存泄漏
 */
onBeforeUnmount(() => {
  const wrapper = scrollWrapper.value
  if (wrapper) {
    wrapper.removeEventListener('scroll', handleScrollEvent)
  }
})
```

## 标签操作工具函数

`tab.ts` 提供了一组标签页导航操作的工具函数，封装了常用的标签管理逻辑。

### 函数列表

```typescript
import {
  refreshPage,      // 刷新当前标签页
  closeOpenPage,    // 关闭当前并打开新标签
  closePage,        // 关闭指定标签页
  closeAllPage,     // 关闭所有标签页
  closeLeftPage,    // 关闭左侧标签页
  closeRightPage,   // 关闭右侧标签页
  closeOtherPage,   // 关闭其他标签页
  openPage,         // 打开新标签页
  updatePage        // 更新标签页信息
} from '@/utils/tab'
```

### 刷新页面

```typescript
/**
 * 刷新当前标签页
 * 使用 redirect 路由实现刷新，保证缓存正确清理
 */
export const refreshPage = async (obj?: RouteLocationNormalized): Promise<void> => {
  const { path, query, matched } = router.currentRoute.value

  if (obj === undefined) {
    // 查找当前路由中的组件
    for (const m of matched) {
      if (m.components?.default?.name &&
          !['Layout', 'ParentView'].includes(m.components.default.name)) {
        obj = {
          name: m.components.default.name,
          path: path,
          query: query,
          // ... 其他属性设为 undefined
        }
        break
      }
    }
  }

  const targetQuery = obj?.query || {}
  const targetPath = obj?.path || ''

  // 1. 从缓存中移除视图
  await useLayout().delCachedView(obj)

  // 2. 使用 redirect 路由刷新页面
  // /redirect/xxx 路由会立即重定向回 /xxx
  await router.replace({
    path: '/redirect' + targetPath,
    query: targetQuery
  })
}
```

### 关闭并打开

```typescript
/**
 * 关闭当前标签页并打开新标签页
 * 常用于表单保存后跳转到列表页
 */
export const closeOpenPage = (obj: RouteLocationRaw): void => {
  useLayout().delView(router.currentRoute.value)
  if (obj !== undefined) {
    router.push(obj)
  }
}

// 使用示例
const submitAndRedirect = async () => {
  await saveData()
  // 关闭当前编辑页，打开列表页
  closeOpenPage({ path: '/system/user' })
}
```

### 关闭指定页面

```typescript
/**
 * 关闭指定标签页
 * 如果不传参数，关闭当前标签页并自动导航
 */
export const closePage = async (obj?: RouteLocationNormalized): Promise<TagsViewResult | any> => {
  if (obj === undefined) {
    const { visitedViews } = await useLayout().delView(router.currentRoute.value)
    // 获取最后一个标签页
    const latestView = visitedViews.slice(-1)[0]
    // 导航到最后一个标签页，或首页
    return router.push(latestView ? latestView.fullPath : '/')
  }
  return useLayout().delView(obj)
}
```

### 批量关闭

```typescript
/**
 * 关闭所有标签页（保留固定标签）
 */
export const closeAllPage = (): Promise<TagsViewResult> => {
  return useLayout().delAllViews()
}

/**
 * 关闭左侧标签页
 */
export const closeLeftPage = (obj?: RouteLocationNormalized): Promise<RouteLocationNormalized[]> => {
  return useLayout().delLeftTags(obj || router.currentRoute.value)
}

/**
 * 关闭右侧标签页
 */
export const closeRightPage = (obj?: RouteLocationNormalized): Promise<RouteLocationNormalized[]> => {
  return useLayout().delRightTags(obj || router.currentRoute.value)
}

/**
 * 关闭其他标签页（保留当前和固定标签）
 */
export const closeOtherPage = (obj?: RouteLocationNormalized): Promise<TagsViewResult> => {
  return useLayout().delOthersViews(obj || router.currentRoute.value)
}
```

### 打开和更新

```typescript
/**
 * 打开新标签页
 * 支持自定义标题和查询参数
 */
export const openPage = (url: string, title?: string, query: Record<string, any> = {}) => {
  const obj = {
    path: url,
    query: title ? { ...query, title } : query
  }
  return router.push(obj)
}

// 使用示例
openPage('/system/user/detail', '用户详情', { id: '123' })

/**
 * 更新标签页信息
 * 用于动态修改已打开标签的标题等信息
 */
export const updatePage = (obj: RouteLocationNormalized) => {
  return useLayout().updateVisitedView(obj)
}

// 使用示例：更新当前页面标题
const updateTitle = (newTitle: string) => {
  const route = {
    ...router.currentRoute.value,
    meta: { ...router.currentRoute.value.meta, title: newTitle }
  }
  updatePage(route)
}
```

## 状态管理集成

标签视图系统与 `useLayout` Composable 深度集成，实现响应式状态管理。

### TagsViewState 接口

```typescript
/**
 * 标签视图状态接口
 */
interface TagsViewState {
  /** 已访问的视图列表 - 显示在标签栏中 */
  visitedViews: RouteLocationNormalized[]

  /** 缓存的视图名称列表 - 用于 keep-alive */
  cachedViews: string[]

  /** iframe 视图列表 - 嵌入式页面特殊处理 */
  iframeViews: RouteLocationNormalized[]
}
```

### 标签管理方法

```typescript
const tagsViewMethods = {
  /**
   * 获取视图列表（返回副本，防止直接修改）
   */
  getVisitedViews: () => [...state.tagsView.visitedViews],
  getIframeViews: () => [...state.tagsView.iframeViews],
  getCachedViews: () => [...state.tagsView.cachedViews],

  /**
   * 添加视图到已访问和缓存列表
   * 同时处理显示和缓存
   */
  addView(view: RouteLocationNormalized) {
    this.addVisitedView(view)
    this.addCachedView(view)
  },

  /**
   * 添加视图到已访问列表
   * 相同路径的视图不重复添加
   */
  addVisitedView(view: RouteLocationNormalized) {
    if (state.tagsView.visitedViews.some((v) => v.path === view.path)) return

    state.tagsView.visitedViews.push({
      ...view,
      title: view.meta?.title || 'no-name'
    })
  },

  /**
   * 添加视图到缓存列表
   * 只缓存有名称且未设置 noCache 的视图
   */
  addCachedView(view: RouteLocationNormalized) {
    const viewName = view.name as string
    if (!viewName || state.tagsView.cachedViews.includes(viewName)) return

    // 检查路由元信息中的 noCache 设置
    if (!view.meta?.noCache) {
      state.tagsView.cachedViews.push(viewName)
    }
  },

  /**
   * 删除指定视图
   * 同时从显示列表和缓存列表中移除
   */
  async delView(view: RouteLocationNormalized) {
    await this.delVisitedView(view)
    // 动态路由不删除缓存（可能还有其他实例）
    if (!this.isDynamicRoute(view)) {
      await this.delCachedView(view)
    }
    return {
      visitedViews: this.getVisitedViews(),
      cachedViews: this.getCachedViews()
    }
  },

  /**
   * 判断是否为动态路由
   * 动态路由包含 :id 等参数
   */
  isDynamicRoute(view: RouteLocationNormalized): boolean {
    return view.matched.some((m) => m.path.includes(':'))
  },

  /**
   * 删除指定视图右侧的所有标签
   * 保留固定标签
   */
  async delRightTags(view: RouteLocationNormalized) {
    const index = state.tagsView.visitedViews.findIndex((v) => v.path === view.path)
    if (index === -1) return this.getVisitedViews()

    state.tagsView.visitedViews = state.tagsView.visitedViews.filter((item, idx) => {
      // 保留：索引小于等于当前 或 固定标签
      if (idx <= index || item.meta?.affix) return true

      // 同时移除缓存
      const cacheIndex = state.tagsView.cachedViews.indexOf(item.name as string)
      if (cacheIndex > -1) {
        state.tagsView.cachedViews.splice(cacheIndex, 1)
      }
      return false
    })

    return this.getVisitedViews()
  },

  // ... 更多方法
}
```

### 使用示例

```typescript
// 在组件中使用
const layout = useLayout()

// 获取已访问视图列表
const visitedViews = computed(() => layout.visitedViews.value)

// 添加视图
layout.addView(route)

// 删除视图
await layout.delView(route)

// 删除其他视图
await layout.delOthersViews(route)

// 更新视图信息
layout.updateVisitedView(route)
```

## 路由配置

### 固定标签配置

通过路由 meta 中的 `affix` 属性设置固定标签：

```typescript
// router/routes.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'dashboard',
          affix: true  // 设为固定标签
        }
      }
    ]
  }
]
```

### 禁用缓存

通过 `noCache` 属性禁用页面缓存：

```typescript
{
  path: 'add',
  name: 'UserAdd',
  component: () => import('@/views/user/add.vue'),
  meta: {
    title: '新增用户',
    noCache: true  // 禁用缓存，每次进入都重新渲染
  }
}
```

### 国际化标题

```typescript
{
  path: 'list',
  name: 'UserList',
  component: () => import('@/views/user/list.vue'),
  meta: {
    title: '用户管理',
    i18nKey: 'menu.system.user'  // 国际化键
  }
}

// 动态参数标题
{
  path: 'detail/:id',
  name: 'UserDetail',
  component: () => import('@/views/user/detail.vue'),
  meta: {
    title: '用户详情-{name}',
    titleParams: { name: '' }  // 运行时动态设置
  }
}
```

## 样式系统

### 标签容器样式

```scss
.tags-view-container {
  height: 34px;
  width: 100%;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
}
```

### 标签项样式

```scss
.tags-view-item {
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  padding: 0 8px;
  font-size: 12px;
  margin: 4px 2px;
  transition: all 0.3s;

  // 图标
  .tag-icon {
    margin-right: 4px;
    font-size: 14px;
  }

  // 文本
  .tag-text {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // 关闭按钮
  .close-btn {
    margin-left: 4px;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: var(--el-color-danger-light-7);
      color: var(--el-color-danger);
    }
  }

  // 激活状态
  &.active {
    background: var(--el-color-primary);
    color: #fff;
    border-color: var(--el-color-primary);

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
  }

  // 悬浮效果
  &:hover:not(.active) {
    border-color: var(--el-color-primary-light-5);
    color: var(--el-color-primary);
  }
}
```

### 右键菜单样式

```scss
.contextmenu {
  margin: 0;
  padding: 5px 0;
  position: fixed;
  background: var(--el-bg-color-overlay);
  z-index: 3000;
  list-style-type: none;
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-primary);

  li {
    padding: 7px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }
}
```

### 滚动容器样式

```scss
.scroll-container {
  white-space: nowrap;  // 防止标签换行
  position: relative;
  overflow: hidden;
  width: 100%;

  // 隐藏 Element UI 的滚动条
  :deep(.el-scrollbar__bar) {
    display: none !important;
  }

  :deep(.el-scrollbar__wrap) {
    height: 49px;
    overflow-x: auto;

    // 隐藏原生滚动条 - Webkit
    &::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }

    // 隐藏原生滚动条 - Firefox
    scrollbar-width: none !important;

    // 隐藏原生滚动条 - IE/Edge
    -ms-overflow-style: none !important;
  }
}
```

### 深色模式适配

```scss
// 深色模式下的样式调整
html.dark {
  .tags-view-container {
    background: var(--el-bg-color);
    border-bottom-color: var(--el-border-color);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  }

  .tags-view-item {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
    color: var(--el-text-color-regular);

    &.active {
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: #fff;
    }
  }

  .contextmenu {
    background: var(--el-bg-color-overlay);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.4);
  }
}
```

## 功能特性

### 多标签管理

- **自动添加** - 路由变化时自动添加新标签
- **智能去重** - 相同路径标签自动合并，查询参数不同时更新
- **状态保持** - 标签状态响应式管理，刷新后恢复
- **批量操作** - 支持关闭其他、左侧、右侧、全部标签
- **中键关闭** - 支持鼠标中键快速关闭标签

### 右键菜单

- **丰富操作** - 刷新、关闭、批量关闭等操作
- **智能显示** - 根据标签位置和类型动态显示菜单项
- **边界处理** - 菜单位置自动调整，防止超出边界
- **权限控制** - 固定标签不显示关闭选项

### 滚动支持

- **鼠标滚轮** - 支持水平滚动操作
- **自动定位** - 新标签/切换标签自动滚动到可视区域
- **智能计算** - 基于相邻标签的最佳滚动位置算法
- **边界处理** - 首尾标签的特殊定位处理

### 缓存联动

- **自动缓存** - 标签添加时自动加入 keep-alive 缓存
- **缓存清理** - 标签关闭时自动从缓存中移除
- **noCache 支持** - 尊重路由配置的 noCache 设置
- **动态路由处理** - 动态路由保留缓存，防止数据丢失

### 国际化支持

- **i18nKey** - 支持国际化键自动翻译
- **参数模板** - 支持动态参数的标题模板
- **降级处理** - 翻译失败时的兜底方案
- **实时更新** - 语言切换后标题自动更新

## 最佳实践

### 1. 合理设置固定标签

只对重要且高频访问的页面设置固定标签：

```typescript
// ✅ 好的做法 - 只有首页和工作台设为固定
{
  meta: { affix: true, title: '首页' }
}
{
  meta: { affix: true, title: '工作台' }
}

// ❌ 不好的做法 - 过多的固定标签
// 固定标签过多会占用空间，降低用户体验
```

### 2. 正确使用 noCache

根据页面特性决定是否缓存：

```typescript
// ✅ 需要缓存的场景
// - 列表页（保持滚动位置和筛选条件）
// - 表单页（保持已填写内容）
{
  meta: { title: '用户列表' }  // 默认缓存
}

// ✅ 不需要缓存的场景
// - 详情页（每次需要最新数据）
// - 新增页（每次需要空白表单）
{
  meta: { title: '新增用户', noCache: true }
}
```

### 3. 表单提交后关闭页面

```typescript
// ✅ 使用 closeOpenPage 关闭当前并跳转
const handleSubmit = async () => {
  await saveUser(form.value)

  ElMessage.success('保存成功')

  // 关闭当前编辑页，跳转到列表页
  closeOpenPage('/system/user')
}

// ✅ 或者使用 closePage 后手动导航
const handleSubmit = async () => {
  await saveUser(form.value)

  await closePage()  // 关闭当前页
  // 自动导航到最后一个标签
}
```

### 4. 动态更新标签标题

```typescript
// 详情页加载数据后更新标题
const loadUserDetail = async () => {
  const user = await getUserById(route.params.id)

  // 更新标签标题
  const newRoute = {
    ...route,
    meta: {
      ...route.meta,
      title: `用户详情 - ${user.name}`
    }
  }
  updatePage(newRoute)
}
```

### 5. 刷新页面保持参数

```typescript
// ✅ refreshPage 会保持查询参数
const handleRefresh = () => {
  refreshPage()  // 会保持当前的 query 参数
}

// ❌ 不要直接使用 location.reload
// 会丢失 Vue Router 的状态
```

## 常见问题

### 1. 标签不显示

**可能原因：**
- 路由配置中缺少 `name` 属性
- 路由配置了 `hidden: true`
- 系统设置中关闭了标签视图功能

**解决方案：**

```typescript
// 确保路由有 name 属性
{
  path: 'list',
  name: 'UserList',  // ✅ 必须有 name
  component: () => import('@/views/user/list.vue'),
  meta: {
    title: '用户列表',
    hidden: false  // 确保不是隐藏路由
  }
}

// 检查系统设置
const layout = useLayout()
console.log(layout.tagsView.value)  // 确保为 true
```

### 2. 缓存不生效

**可能原因：**
- 路由 name 与组件 name 不一致
- 组件没有定义 name
- 设置了 noCache: true

**解决方案：**

```typescript
// 路由配置
{
  name: 'UserList',  // 路由 name
  // ...
}

// 组件中必须定义相同的 name
<script lang="ts" setup>
defineOptions({
  name: 'UserList'  // ✅ 必须与路由 name 一致
})
</script>
```

### 3. 右键菜单位置错误

**可能原因：**
- 容器有 transform 或其他定位影响
- 页面滚动后位置计算错误

**解决方案：**

```typescript
// 确保使用 fixed 定位和正确的坐标计算
const openMenu = (tag: RouteLocationNormalized, e: MouseEvent) => {
  const container = containerRef.value
  if (!container) return

  const offsetLeft = container.getBoundingClientRect().left
  const offsetWidth = container.offsetWidth
  const maxLeft = offsetWidth - 105  // 菜单最小宽度

  left.value = Math.min(e.clientX - offsetLeft + 15, maxLeft)
  top.value = e.clientY  // 使用 clientY 而非 pageY

  visible.value = true
}
```

### 4. 滚动不工作

**可能原因：**
- 标签内容没有超出容器宽度
- 滚动条样式被隐藏但滚动功能也被禁用
- 事件监听器没有正确绑定

**解决方案：**

```scss
// 确保正确的样式配置
.scroll-container {
  overflow: hidden;  // 容器隐藏溢出

  :deep(.el-scrollbar__wrap) {
    overflow-x: auto;  // ✅ 允许水平滚动

    // 只隐藏滚动条样式，不禁用滚动功能
    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
  }
}
```

### 5. 固定标签被关闭

**可能原因：**
- affix 属性设置错误
- 调用了 delAllViews 等方法

**解决方案：**

```typescript
// 确保正确设置 affix
{
  meta: {
    affix: true  // ✅ 布尔值 true
  }
}

// delAllViews 会保留固定标签
await layout.delAllViews()  // 固定标签不会被删除
```

## 类型定义

### TagsViewResult

```typescript
/**
 * 标签操作返回类型
 */
type TagsViewResult = {
  /** 已访问视图列表 */
  visitedViews: RouteLocationNormalized[]
  /** 缓存视图名称列表 */
  cachedViews: string[]
}
```

### RouteLocationNormalized 扩展

```typescript
interface RouteLocationNormalized {
  // Vue Router 标准属性
  path: string
  fullPath: string
  name: string | symbol | null | undefined
  params: RouteParams
  query: LocationQuery
  hash: string
  matched: RouteRecordNormalized[]
  redirectedFrom: RouteLocation | undefined
  meta: RouteMeta
}

interface RouteMeta {
  /** 页面标题 */
  title?: string
  /** 国际化键 */
  i18nKey?: string
  /** 动态标题参数 */
  titleParams?: Record<string, string>
  /** 是否固定标签 */
  affix?: boolean
  /** 是否禁用缓存 */
  noCache?: boolean
  /** 是否隐藏标签 */
  hidden?: boolean
  /** 图标 */
  icon?: string
}
```

### ScrollPane 暴露方法

```typescript
/**
 * ScrollPane 组件暴露的方法
 */
interface ScrollPaneExpose {
  /**
   * 滚动到目标标签
   * @param currentTag 目标路由对象
   */
  moveToTarget: (currentTag: RouteLocationNormalized) => void
}
```

## 总结

标签视图系统通过 `TagsView`、`ScrollPane` 和 `tab.ts` 三个模块的协作，配合 `useLayout` 状态管理，为用户提供了功能完整、体验流畅的多标签页管理方案。系统支持丰富的交互功能、智能的滚动定位、完善的右键菜单、与缓存的深度联动等特性，是现代化后台管理系统的重要组成部分。

**核心要点:**

1. **模块化设计** - 职责分离，TagsView 管理标签，ScrollPane 处理滚动，tab.ts 提供工具函数
2. **响应式状态** - 通过 useLayout Composable 统一管理标签状态，与 keep-alive 联动
3. **用户体验** - 中键关闭、右键菜单、自动滚动等细节优化
4. **可配置性** - 支持固定标签、禁用缓存、国际化标题等丰富配置
5. **主题适配** - 完美支持亮色/暗色主题切换
