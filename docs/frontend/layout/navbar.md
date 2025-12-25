# 顶部导航(NavBar)系统

## 简介

顶部导航系统是后台管理界面的核心组成部分,提供了丰富的导航功能和工具集。该系统由核心导航组件和丰富的工具组件构成,支持水平导航、混合导航、面包屑导航、全局搜索、通知消息、AI智能助手等功能,为用户提供便捷高效的操作体验。

**核心特性:**

- **三种布局模式** - 支持垂直(Vertical)、混合(Mixed)、水平(Horizontal)三种菜单布局模式
- **响应式设计** - 根据屏幕宽度自动调整工具栏显示项目和菜单数量
- **智能搜索** - 基于 Fuse.js 的模糊搜索引擎,支持菜单快速定位
- **通知系统** - 集成消息通知中心,支持未读计数和消息详情查看
- **AI 智能助手** - 集成 LangChain4j 的 AI 对话功能
- **多租户支持** - 超级管理员可动态切换租户
- **国际化** - 完整的多语言支持

## 组件架构

```
Navbar/
├── Navbar.vue              # 导航栏主容器(226行)
├── TopNav.vue              # 水平导航菜单(481行)
├── Breadcrumb.vue          # 面包屑导航(167行)
├── Hamburger.vue           # 汉堡菜单按钮(54行)
└── tools/                  # 导航工具集
    ├── NavbarSearch.vue    # 导航搜索(365行)
    ├── Notice.vue          # 通知消息(695行)
    ├── UserDropdown.vue    # 用户下拉菜单(204行)
    ├── TenantSelect.vue    # 租户选择(187行)
    ├── FullscreenToggle.vue # 全屏切换(18行)
    ├── LangSelect.vue      # 语言选择(102行)
    ├── RefreshButton.vue   # 刷新按钮(36行)
    ├── LayoutSetting.vue   # 布局设置触发器(28行)
    └── AiChat.vue          # AI聊天助手(1189行)
```

## 核心组件详解

### Navbar.vue - 主容器

导航栏的根组件,统筹管理所有导航元素和工具组件的布局和交互。

#### 组件源码

```vue
<template>
  <div class="h-50px w-full flex items-center justify-between navbar-border">
    <!-- 左侧区域：Logo(水平模式) / 汉堡菜单 + 面包屑/TopNav -->
    <div class="h-full flex items-center navbar-left">
      <!-- 水平模式下显示Logo -->
      <div v-if="isHorizontalLayout" class="flex items-center h-full navbar-logo">
        <Logo v-if="layout.sidebarLogo.value" :collapse="width < 768" />
        <RefreshButton />
      </div>

      <!-- 非水平模式下显示汉堡菜单和刷新按钮 -->
      <div v-else class="flex items-center h-full ml-2">
        <Hamburger :is-active="layout.sidebar.value.opened" @toggle-click="toggleSideBar" />
        <RefreshButton />
      </div>

      <!-- 根据模式显示面包屑或顶部导航 -->
      <div class="navbar-content flex-1 min-w-0">
        <TopNav v-if="layout.topNav.value" />
        <div v-else class="h-full flex items-center">
          <Breadcrumb />
        </div>
      </div>
    </div>

    <!-- 右侧工具栏 - 始终在右侧 -->
    <div class="h-full flex items-center navbar-tools">
      <template v-if="layout.device.value !== 'mobile'">
        <!-- 租户选择组件 - 只在大屏幕显示 -->
        <TenantSelect v-if="width > 1200" @tenant-change="onTenantChange" />

        <!-- 搜索菜单 - 中等屏幕以上显示 -->
        <NavbarSearch v-if="width > 768" />

        <!-- 全屏切换 - 大屏幕显示 -->
        <FullscreenToggle v-if="width > 1024" />

        <!-- 消息通知 - 中等屏幕以上显示 -->
        <Notice v-if="width > 768" />

        <!-- AI 聊天助手 - 中等屏幕以上显示 -->
        <AiChat v-if="width > 768" />

        <!-- 语言选择 - 大屏幕显示 -->
        <LangSelect v-if="width > 1024" />

        <!-- 布局设置 - 始终显示 -->
        <LayoutSetting @set-layout="setLayout" />
      </template>

      <!-- 移动端简化工具栏 -->
      <template v-else>
        <LayoutSetting @set-layout="setLayout" />
      </template>

      <!-- 用户头像和下拉菜单 - 始终显示 -->
      <UserDropdown :is-dynamic-tenant="isDynamicTenant" />
    </div>
  </div>
</template>
```

#### 核心逻辑

```typescript
<script setup lang="ts">
// 左侧组件
import Hamburger from './Hamburger.vue'
import Logo from '../Sidebar/Logo.vue'
import RefreshButton from './tools/RefreshButton.vue'
import TopNav from './TopNav.vue'
import Breadcrumb from './Breadcrumb.vue'
import NavbarSearch from './tools/NavbarSearch.vue'
import { MenuLayoutMode, SideTheme } from '@/systemConfig'

// 右侧工具栏组件 - 按功能逻辑顺序排列
// 核心功能
import TenantSelect from './tools/TenantSelect.vue'
// 通知功能
import Notice from './tools/Notice.vue'
// AI 聊天功能
import AiChat from './tools/AiChat.vue'
// 显示偏好设置
import FullscreenToggle from './tools/FullscreenToggle.vue'
import LangSelect from './tools/LangSelect.vue'
import SizeSelect from './tools/SizeSelect.vue'
// 系统设置
import LayoutSetting from './tools/LayoutSetting.vue'
// 用户相关
import UserDropdown from './tools/UserDropdown.vue'

// 获取布局状态管理
const layout = useLayout()
const { width } = useWindowSize()

// 是否处于动态租户模式
const isDynamicTenant = ref(false)

// 计算属性：是否为水平布局模式
const isHorizontalLayout = computed(() => {
  return layout.menuLayout.value === MenuLayoutMode.Horizontal
})

// 切换侧边栏
const toggleSideBar = () => {
  layout.toggleSideBar(false)
}

// 租户变化事件处理
const onTenantChange = (dynamic: boolean) => {
  isDynamicTenant.value = dynamic
}

// 设置布局事件处理
const emits = defineEmits(['setLayout'])
const setLayout = () => {
  emits('setLayout')
}

// 监听布局模式变化，水平模式下自动切换为浅色菜单
watch(
  () => layout.menuLayout.value,
  (newLayout) => {
    if (newLayout === MenuLayoutMode.Horizontal) {
      // 水平模式下强制切换为浅色菜单主题
      layout.sideTheme.value = SideTheme.Light
    }
  },
  { immediate: false }
)
</script>
```

#### 响应式布局策略

Navbar 使用 CSS Flexbox 和媒体查询实现响应式布局:

```scss
/* Navbar整体布局 */
.navbar-border {
  overflow: hidden;
}

/* 左侧区域样式 */
.navbar-left {
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 200px); /* 为右侧工具栏留出最小空间 */
}

/* 右侧工具栏样式 */
.navbar-tools {
  flex-shrink: 0;

  > *:last-child {
    margin-left: 12px;
  }
}

/* 导航内容区域 */
.navbar-content {
  overflow: hidden;

  :deep(.el-menu) {
    overflow: hidden;
  }
}

/* 响应式样式 */
@media (max-width: 768px) {
  .navbar-left {
    max-width: calc(100% - 120px);
  }
}

@media (max-width: 480px) {
  .navbar-left {
    max-width: calc(100% - 80px);
  }

  .navbar-tools {
    > * {
      margin-left: 2px;
    }
  }
}
```

### TopNav.vue - 水平导航菜单

提供水平布局的导航菜单,支持混合模式和纯水平模式两种展示方式。

#### 组件模板

```vue
<template>
  <el-menu
    class="h-[50px]! overflow-hidden"
    :default-active="activeMenu"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
    :style="{ backgroundColor: 'transparent', borderBottom: 'none' }"
  >
    <!-- 混合模式：只显示一级菜单 -->
    <template v-if="menuLayout === MenuLayoutMode.Mixed">
      <template v-for="(item, index) in topMenus">
        <el-menu-item
          v-if="index < visibleNumber"
          :key="index"
          :style="{ '--theme': theme }"
          :index="item.path"
        >
          <Icon
            class="mr-1"
            v-if="item.meta && item.meta.icon && item.meta.icon !== ('#' as IconCode)"
            :code="item.meta ? (item.meta.icon as IconCode) : null"
          />
          {{ item.meta?.title }}
        </el-menu-item>
      </template>

      <!-- 超出数量的菜单项折叠到"更多菜单"中 -->
      <el-sub-menu
        v-if="topMenus.length > visibleNumber"
        :style="{ '--theme': theme }"
        index="more"
        class="more-menu-item"
        popper-class="topnav-more-menu-dropdown"
      >
        <template #title>更多菜单</template>
        <template v-for="(item, index) in topMenus">
          <el-menu-item v-if="index >= visibleNumber" :key="index" :index="item.path">
            <Icon class="mr-1 menu-item-icon" :code="item.meta ? (item.meta.icon as IconCode) : null" />
            {{ item.meta?.title }}
          </el-menu-item>
        </template>
      </el-sub-menu>
    </template>

    <!-- 水平模式：显示完整的菜单层级 -->
    <template v-else-if="menuLayout === MenuLayoutMode.Horizontal">
      <!-- 省略详细模板代码... -->
    </template>
  </el-menu>
</template>
```

#### 动态菜单数量计算

根据屏幕宽度动态调整可显示的菜单数量:

```typescript
const setVisibleNumber = (): void => {
  const clientWidth = document.body.getBoundingClientRect().width
  const isHorizontal = menuLayout.value === MenuLayoutMode.Horizontal

  if (clientWidth > 1600) {
    visibleNumber.value = isHorizontal ? 6 : 5
  } else if (clientWidth > 1400) {
    visibleNumber.value = isHorizontal ? 5 : 4
  } else if (clientWidth > 1200) {
    visibleNumber.value = isHorizontal ? 4 : sidebar.value.opened ? 1 : 2
  } else if (clientWidth > 1000) {
    visibleNumber.value = isHorizontal ? 3 : sidebar.value.opened ? 1 : 2
  } else if (clientWidth > 800) {
    visibleNumber.value = isHorizontal ? 2 : 3
  } else if (clientWidth > 600) {
    visibleNumber.value = isHorizontal ? 1 : 2
  } else {
    visibleNumber.value = 1
  }
}
```

#### 菜单数据处理

TopNav 处理两种模式的菜单数据:

```typescript
// 顶部菜单列表（混合模式使用）
const topMenus = computed(() => {
  const topMenus: RouteRecordRaw[] = []
  routers.value.map((menu) => {
    if (menu.hidden !== true) {
      // 兼容顶部栏一级菜单内部跳转
      if (menu.path === '/' && menu.children) {
        topMenus.push(menu.children ? menu.children[0] : menu)
      } else {
        topMenus.push(menu)
      }
    }
  })
  return topMenus
})

// 处理菜单路径拼接（水平模式使用）
const processMenuPaths = (menus: any[], basePath = ''): any[] => {
  return menus.map((menu) => {
    const fullPath = basePath ? `${basePath}/${menu.path}` : menu.path
    const processedMenu = {
      ...menu,
      fullPath: fullPath
    }

    if (menu.children && menu.children.length > 0) {
      processedMenu.children = processMenuPaths(
        menu.children.filter((child: any) => !child.hidden),
        fullPath
      )
    }

    return processedMenu
  })
}

// 水平模式的完整菜单列表
const horizontalMenus = computed(() => {
  if (menuLayout.value !== MenuLayoutMode.Horizontal) {
    return []
  }

  const allRoutes = permissionStore.getSidebarRoutes()

  // 过滤掉隐藏的菜单项和系统路由
  const filteredMenus = allRoutes.filter((menu: any) => {
    if (menu.hidden === true) return false
    const systemPaths = ['/redirect', '/login', '/register', '/401', '/user', '/index']
    if (systemPaths.includes(menu.path)) return false
    if (menu.path === '/') return false
    return true
  })

  return processMenuPaths(filteredMenus)
})
```

#### 菜单选择处理

```typescript
const handleSelect = (key: string): void => {
  currentIndex.value = key

  if (isHttp(key)) {
    window.open(key, '_blank')
    return
  }

  // 水平模式：直接跳转
  if (menuLayout.value === MenuLayoutMode.Horizontal) {
    const routeMenu = findRouteInMenus(key, horizontalMenus.value)
    if (routeMenu && routeMenu.query) {
      const query = JSON.parse(routeMenu.query)
      router.push({ path: key, query: query })
    } else {
      router.push({ path: key })
    }
    return
  }

  // 混合模式：处理侧边栏联动
  const route = routers.value.find((item) => item.path === key)
  if (!route || !route.children) {
    // 无子路由直接跳转
    const routeMenu = childrenMenus.value.find((item) => item.path === key)
    if (routeMenu && routeMenu.query) {
      const query = JSON.parse(routeMenu.query)
      router.push({ path: key, query: query })
    } else {
      router.push({ path: key })
    }
    layout.toggleSideBarHide(true)
  } else {
    // 有子路由显示侧边栏
    activeRoutes(key)
    layout.toggleSideBarHide(false)
  }
}
```

### Breadcrumb.vue - 面包屑导航

显示当前页面的层级路径,帮助用户了解当前位置并快速导航。

#### 核心算法

```typescript
/**
 * 计算面包屑数据
 */
const breadcrumbData = computed(() => {
  if (route.path.startsWith('/redirect/')) return []

  let matched: any[] = []
  const pathNum = findPathNum(route.path)

  // 处理多级菜单路径
  if (pathNum > 2) {
    const pathList = route.path
      .match(/\/\w+/gi)
      ?.map((item, index) => (index !== 0 ? item.slice(1) : item)) || []
    getMatched(pathList, permissionStore.defaultRoutes, matched)
  } else {
    // 使用常规路由匹配
    matched = route.matched.filter((item) => item.meta?.title)
  }

  // 判断是否为首页
  if (!isDashboard(matched[0])) {
    matched = [{ path: '/index', meta: { title: '首页', i18nKey: 'menu.index' } }].concat(matched)
  }

  return matched.filter(
    (item) => item.meta && item.meta.title && item.meta.breadcrumb !== false
  )
})
```

#### 迭代查找算法

使用迭代替代递归提高性能:

```typescript
/**
 * 迭代查找匹配的路由
 */
const getMatched = (pathList: string[], routeList: any[], matched: any[]) => {
  const currentList = [...pathList]
  let currentRoutes = routeList

  while (currentList.length > 0) {
    const currentPath = currentList[0]
    const data = currentRoutes.find(
      (item) => item.path == currentPath ||
      (item.name && item.name.toString().toLowerCase() == currentPath)
    )

    if (!data) break

    matched.push(data)
    if (data.children && data.children.length > 0) {
      currentRoutes = data.children
      currentList.shift()
    } else {
      break
    }
  }
}
```

#### 国际化标题处理

```typescript
/**
 * 获取国际化菜单标题
 */
const getMenuTitle = (item: any) => {
  const meta = item?.meta
  const name = item?.name

  if (!meta && !name) return ''

  // 优先使用国际化键
  if (meta?.i18nKey) {
    const i18nTitle = t(meta.i18nKey)
    if (i18nTitle !== meta.i18nKey) {
      return i18nTitle
    }
  }

  // 使用名称转换的标题或原始标题
  return t(nameToTitle(name), meta.title)
}

/**
 * 将name转换为英文标题
 */
const nameToTitle = (name: string) => {
  if (!name) return ''
  // 去掉末尾的数字，保留英文部分
  const cleanName = name.replace(/\d+$/, '')
  // 首字母大写
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
}
```

### Hamburger.vue - 汉堡菜单按钮

控制侧边栏展开收起的按钮组件,支持动画效果。

```vue
<template>
  <div
    class="navbar-tool-item flex-center w-9 h-9 rounded-2 cursor-pointer
           dark:(text-white hover:text-primary) transition-all duration-300"
    @click="toggleClick"
  >
    <Icon
      code="hamburger"
      size="md"
      class="transition-transform duration-300 ease-out"
      :class="isActive ? 'scale-x-[-1]' : ''"
    />
  </div>
</template>

<script setup lang="ts" name="Hamburger">
interface HamburgerProps {
  /** 菜单是否处于激活状态 */
  isActive?: boolean
}

const props = withDefaults(defineProps<HamburgerProps>(), {
  isActive: false
})

const emit = defineEmits(['toggleClick'])

const toggleClick = () => {
  emit('toggleClick')
}
</script>
```

## 工具组件详解

### NavbarSearch.vue - 导航搜索

基于 Fuse.js 的模糊搜索组件,支持菜单快速定位。

#### Fuse.js 搜索引擎配置

```typescript
/**
 * 路由搜索项接口
 */
interface RouterItem {
  path: string
  title: string[]  // 层级标题数组
  icon?: IconCode
  query?: string
}

/**
 * 初始化Fuse.js搜索引擎
 */
const initFuse = (list: RouterItem[]) => {
  fuse.value = new Fuse(list, {
    shouldSort: true,        // 对结果进行排序
    threshold: 0.4,          // 匹配阈值：0完全匹配，1匹配任何内容
    location: 0,             // 预期匹配位置
    distance: 100,           // 匹配位置的最大距离
    minMatchCharLength: 1,   // 最小匹配字符长度
    keys: [
      {
        name: 'title',       // 搜索路由标题，权重更高
        weight: 0.7
      },
      {
        name: 'path',        // 搜索路由路径，权重较低
        weight: 0.3
      }
    ]
  })
}
```

#### 路由数据扁平化处理

```typescript
/**
 * 递归生成可搜索的路由列表
 */
const generateRoutes = (
  routes: RouteRecordRaw[],
  basePath = '',
  prefixTitle: string[] = [],
  parentIcon?: string
): RouterItem[] => {
  let res: RouterItem[] = []

  routes.forEach((r) => {
    // 跳过隐藏的路由
    if (r.hidden) return

    // 构建完整路径
    const p = r.path.length > 0 && r.path[0] === '/' ? r.path : '/' + r.path
    const data: RouterItem = {
      path: !isHttp(r.path) ? normalizePath(basePath + p) : r.path,
      title: [...prefixTitle]
    }

    // 处理路由元信息
    if (r.meta?.title) {
      data.title = [...data.title, r.meta.title]

      // 图标优先级：当前路由图标 > 父级图标
      if (r.meta.icon) {
        data.icon = r.meta.icon
      } else if (parentIcon) {
        data.icon = parentIcon as IconCode
      }

      // 只添加有标题且不是重定向占位符的路由
      if (r.redirect !== 'noRedirect') {
        res.push(data)
      }
    }

    // 添加查询参数
    if (r.query) {
      data.query = r.query
    }

    // 递归处理子路由
    if (r.children && r.children.length > 0) {
      const currentIcon = r.meta?.icon || parentIcon
      const tempRoutes = generateRoutes(r.children, data.path, data.title, currentIcon)
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes]
      }
    }
  })

  return res
}
```

#### 搜索结果处理

```typescript
/**
 * 执行搜索查询
 */
const querySearch = (query: string) => {
  if (query !== '' && fuse.value) {
    options.value = fuse.value.search(query)
  } else {
    options.value = []
  }
}

/**
 * 处理菜单项选择
 */
const handleSelect = (val: RouterItem) => {
  if (!val) return

  const path = val.path
  const query = val.query

  try {
    if (isHttp(path)) {
      // 外部链接在新窗口打开
      const httpIndex = path.indexOf('http')
      window.open(path.substring(httpIndex), '_blank')
    } else {
      // 内部路由导航
      if (query) {
        router.push({ path: path, query: JSON.parse(query) })
      } else {
        router.push(path)
      }
    }
  } catch (error) {
    console.error('路由跳转失败:', error)
    router.push(path)
  }

  closeSearch()
}
```

### Notice.vue - 通知消息

系统通知组件,支持通知列表、未读计数、详情查看等功能。

#### 核心数据结构

```typescript
import {
  pageUserNotices,
  markNoticeAsRead,
  markAllNoticesAsRead,
  getUserNoticeDetail
} from '@/api/system/config/notice/noticeApi'
import { type UserNoticeVo } from '@/api/system/config/notice/noticeTypes'

// 使用通知 Store
const noticeStore = useNoticeStore()

// 响应式数据
const isLoading = ref(false)
const unreadCount = computed(() => noticeStore.unreadCount)
const noticeList = ref<UserNoticeVo[]>([])
const total = ref(0)
const detailDialogVisible = ref(false)
const currentNotice = ref<UserNoticeVo | null>(null)

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 5
})
```

#### 通知类型样式映射

```typescript
/**
 * 根据通知类型获取图标
 */
const getNoticeTypeIcon = (noticeType: string): string => {
  const iconMap: Record<string, string> = {
    '1': 'notification',    // 通知
    '2': 'announcement',    // 公告
    '3': 'message-info',    // 消息
    'notice': 'notification',
    'announcement': 'announcement',
    'message': 'message-info'
  }
  return iconMap[noticeType] || 'notification'
}

/**
 * 根据通知类型获取样式
 */
const getNoticeTypeStyle = (noticeType: string) => {
  const styleMap: Record<string, { backgroundColor: string; color: string }> = {
    '1': {
      backgroundColor: 'rgba(64, 158, 255, 0.1)',
      color: 'var(--el-color-primary)'
    },
    '2': {
      backgroundColor: 'rgba(230, 162, 60, 0.1)',
      color: 'var(--el-color-warning)'
    },
    '3': {
      backgroundColor: 'rgba(103, 194, 58, 0.1)',
      color: 'var(--el-color-success)'
    }
  }
  return styleMap[noticeType] || styleMap['1']
}
```

#### 通知操作方法

```typescript
/**
 * 加载通知列表
 */
const loadNoticeList = async () => {
  isLoading.value = true
  const [err, data] = await pageUserNotices(queryParams.value)
  if (!err) {
    noticeList.value = data.records || []
    total.value = data.total || 0
  }
  isLoading.value = false
}

/**
 * 点击通知项
 */
const handleNoticeClick = async (notice: UserNoticeVo) => {
  const [err, data] = await getUserNoticeDetail(notice.noticeId)
  if (!err) {
    currentNotice.value = data
    detailDialogVisible.value = true

    // 自动标记为已读
    if (!notice.isRead) {
      await handleMarkAsRead(notice.noticeId)
    }
  }
}

/**
 * 标记所有通知为已读
 */
const handleMarkAllAsRead = async () => {
  const [err] = await markAllNoticesAsRead()
  if (!err) {
    noticeList.value.forEach((notice) => {
      notice.isRead = true
    })
    noticeStore.refreshUnreadCount()
    showMsgSuccess('已全部标记为已读')
  }
}
```

### UserDropdown.vue - 用户下拉菜单

用户相关操作的下拉菜单,包含个人中心、文档链接、退出登录等功能。

```typescript
// 下拉菜单命令与处理方法的映射
const commandHandlers: Record<string, () => void | Promise<void>> = {
  profile: handleProfileNavigation,
  document: handleDocumentNavigation,
  git: handleGitNavigation,
  logout: handleUserLogout
}

/**
 * 处理个人中心导航
 */
function handleProfileNavigation(): void {
  router.push('/user/profile')
}

/**
 * 处理用户退出登录
 */
async function handleUserLogout(): Promise<void> {
  const [confirmErr] = await showConfirm({
    message: t('Confirm logout?', '确定注销并退出系统吗？'),
    title: t('Tip', '提示'),
    confirmButtonText: t('确定'),
    cancelButtonText: t('取消'),
    type: 'warning'
  })

  if (confirmErr) {
    console.debug('用户取消退出')
    return
  }

  showLoading('正在退出系统...')
  const [logoutErr] = await userStore.logoutUser()
  hideLoading()

  if (logoutErr) {
    showMsgError(`退出失败: ${logoutErr.message}`)
    return
  }

  // 跳转到登录页
  const [routerErr] = await to(
    router.replace({
      path: '/login',
      query: {
        redirect: encodeURIComponent(router.currentRoute.value.fullPath || '/')
      }
    })
  )
}

/**
 * 处理下拉菜单命令选择
 */
function handleDropdownCommand(command: string): void {
  const handler = commandHandlers[command]
  if (handler) {
    handler()
  } else {
    console.warn(`未知的下拉菜单命令: ${command}`)
  }
}
```

### TenantSelect.vue - 租户选择

多租户系统的租户切换组件,仅对超级管理员可见。

```typescript
// 超级管理员用户ID
const SUPER_ADMIN_USER_ID = 1

// 判断当前用户是否为超级管理员
const isSuperAdmin = computed(() => userStore.userInfo?.userId === SUPER_ADMIN_USER_ID)

/**
 * 处理租户选择
 */
const handleTenantSelect = async (tenantId: string): Promise<void> => {
  if (!tenantId) return

  const [switchErr] = await switchToDynamicTenant(tenantId)
  if (switchErr) {
    console.error('切换租户失败:', switchErr)
    selectedTenantId.value = undefined
    return
  }
  await refreshPage()
}

/**
 * 切换到动态租户模式
 */
const switchToDynamicTenant = async (tenantId: string): Result<any> => {
  const [err, data] = await setDynamicTenant(tenantId)
  if (err) {
    return [err, null]
  }

  updateTenantModeStatus(true)
  return [null, data]
}

/**
 * 初始化组件
 */
const initializeComponent = async (): Promise<void> => {
  if (!isSuperAdmin.value) {
    tenantEnabled.value = false
    return
  }

  const [err, data] = await getTenantConfig()
  if (err) {
    tenantEnabled.value = false
    tenantOptions.value = []
    return
  }

  tenantEnabled.value = data.tenantEnabled ?? true

  if (tenantEnabled.value) {
    tenantOptions.value = data.voList || []
    const currentTenantId = userStore.userInfo?.tenantId
    if (currentTenantId) {
      selectedTenantId.value = currentTenantId
    }
  }
}
```

### LangSelect.vue - 语言选择

多语言切换组件,支持中英文切换。

```typescript
interface LangSelectProps {
  /** 是否显示提示框 */
  showTooltip?: boolean
  /** 是否显示动画效果 */
  showAnimate?: boolean
  /** 是否显示背景悬停效果 */
  showBackground?: boolean
}

const props = withDefaults(defineProps<LangSelectProps>(), {
  showTooltip: true,
  showAnimate: true,
  showBackground: true
})

// 语言切换成功的消息
const messages = {
  [LanguageCode.zh_CN]: '切换语言成功！',
  [LanguageCode.en_US]: 'Switch Language Successful!'
}

/**
 * 处理语言切换
 */
const handleLanguageChange = (lang: LanguageCode) => {
  setLanguage(lang)
  showMsgSuccess(messages[lang] || '切换语言成功！')
}
```

### FullscreenToggle.vue - 全屏切换

使用 VueUse 的 `useFullscreen` 实现全屏功能。

```vue
<template>
  <el-tooltip
    :content="isFullscreen ? t('navbar.exitFull') : t('navbar.full')"
    effect="dark"
    placement="bottom"
  >
    <div class="flex-center h-full px-1">
      <div
        class="navbar-tool-item flex-center w-9 h-9 rounded-2 cursor-pointer"
        @click="toggle"
      >
        <Icon
          :code="isFullscreen ? 'exit-fullscreen' : 'expand'"
          size="md"
          :animate="isFullscreen ? 'shrink' : 'expand'"
        />
      </div>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts" name="FullscreenToggle">
const { isFullscreen, toggle } = useFullscreen()
const { t } = useI18n()
</script>
```

### RefreshButton.vue - 刷新按钮

页面刷新按钮组件。

```vue
<template>
  <div
    class="navbar-tool-item ml-1 flex-center w-9 h-9 rounded-2 cursor-pointer transition-all duration-300"
    @click="handleRefresh"
  >
    <Icon code="refresh" size="md" animate="rotate180" />
  </div>
</template>

<script setup lang="ts" name="RefreshButton">
import { refreshPage } from '@/utils/tab'

const route = useRoute()

const handleRefresh = () => {
  refreshPage(route)
}
</script>
```

### AiChat.vue - AI 智能助手

集成 LangChain4j 的 AI 对话组件,支持多会话、消息编辑、流式响应等功能。

#### 核心数据结构

```typescript
// Store
const aiChatStore = useAiChatStore()
const {
  currentSessionId,
  currentSession,
  currentMessages,
  isGenerating,
  sessionList
} = storeToRefs(aiChatStore)

// 功能配置 Store（判断是否启用 AI）
const featureStore = useFeatureStore()

// 输入相关
const inputMessage = ref('')
const showSettings = ref(false)
const settingsForm = ref({
  provider: 'deepseek',
  temperature: 0.7,
  maxTokens: 2048
})

// 编辑相关
const editingMessageId = ref<string | null>(null)
const editingContent = ref('')
```

#### WebSocket 连接检查

```typescript
const checkWebSocketConnection = () => {
  if (!webSocket.isConnected) {
    showMsgError('WebSocket 未连接，请刷新页面重试')
    return false
  }
  return true
}
```

#### 消息发送与处理

```typescript
/**
 * 处理发送消息
 */
const handleSendMessage = () => {
  if (!inputMessage.value.trim() || isGenerating.value) return

  if (!checkWebSocketConnection()) return

  // 发送消息时允许自动滚动
  allowAutoScroll.value = true

  aiChatStore.sendMessage(inputMessage.value, {
    provider: settingsForm.value.provider,
    temperature: settingsForm.value.temperature,
    maxTokens: settingsForm.value.maxTokens
  })

  inputMessage.value = ''
  scrollToBottom()
}

/**
 * 处理重新生成
 */
const handleRegenerate = () => {
  allowAutoScroll.value = true
  aiChatStore.regenerateLastMessage()
}

/**
 * 渲染 Markdown
 */
const renderMarkdown = (content: string) => {
  if (!content) return ''
  return marked(content)
}
```

#### 会话管理

```typescript
/**
 * 创建新会话
 */
const handleCreateSession = () => {
  aiChatStore.createSession({
    provider: settingsForm.value.provider
  })
  showMsgSuccess('已创建新对话')
}

/**
 * 切换会话
 */
const handleSwitchSession = (sessionId: string) => {
  aiChatStore.switchSession(sessionId)
}

/**
 * 删除会话
 */
const handleDeleteSession = async (sessionId: string) => {
  const [err] = await showConfirm('确定要删除这个对话吗？')
  if (err) return

  aiChatStore.deleteSession(sessionId)
  showMsgSuccess('已删除对话')
}
```

## 响应式设计

### 屏幕宽度断点

Navbar 使用以下断点控制工具栏项目显示:

| 宽度 | 显示的工具 |
|------|-----------|
| > 1200px | 租户选择、搜索、全屏、通知、AI、语言、布局设置、用户 |
| > 1024px | 搜索、全屏、通知、AI、语言、布局设置、用户 |
| > 768px | 搜索、通知、AI、布局设置、用户 |
| ≤ 768px | 布局设置、用户 |

### 工具栏响应式配置

```vue
<template v-if="layout.device.value !== 'mobile'">
  <!-- 租户选择 - 只在大屏幕显示 -->
  <TenantSelect v-if="width > 1200" @tenant-change="onTenantChange" />

  <!-- 搜索菜单 - 中等屏幕以上显示 -->
  <NavbarSearch v-if="width > 768" />

  <!-- 全屏切换 - 大屏幕显示 -->
  <FullscreenToggle v-if="width > 1024" />

  <!-- 消息通知 - 中等屏幕以上显示 -->
  <Notice v-if="width > 768" />

  <!-- AI 聊天助手 - 中等屏幕以上显示 -->
  <AiChat v-if="width > 768" />

  <!-- 语言选择 - 大屏幕显示 -->
  <LangSelect v-if="width > 1024" />

  <!-- 布局设置 - 始终显示 -->
  <LayoutSetting @set-layout="setLayout" />
</template>
```

### TopNav 菜单数量响应式

```typescript
const setVisibleNumber = (): void => {
  const clientWidth = document.body.getBoundingClientRect().width
  const isHorizontal = menuLayout.value === MenuLayoutMode.Horizontal

  // 根据屏幕宽度和布局模式动态调整
  if (clientWidth > 1600) {
    visibleNumber.value = isHorizontal ? 6 : 5
  } else if (clientWidth > 1400) {
    visibleNumber.value = isHorizontal ? 5 : 4
  } else if (clientWidth > 1200) {
    visibleNumber.value = isHorizontal ? 4 : sidebar.value.opened ? 1 : 2
  }
  // ... 更多断点配置
}
```

## 布局模式详解

### 垂直模式 (Vertical)

默认模式,左侧显示侧边栏菜单,顶部显示面包屑导航:

- 侧边栏显示完整菜单树
- 顶部显示面包屑导航
- 支持侧边栏折叠/展开

### 混合模式 (Mixed)

顶部显示一级菜单,侧边栏显示子菜单:

- 顶部 TopNav 显示一级菜单
- 点击一级菜单后,侧边栏显示对应子菜单
- 支持"更多菜单"折叠

### 水平模式 (Horizontal)

纯水平布局,所有菜单在顶部展示:

- 侧边栏隐藏
- Logo 显示在顶部导航左侧
- 支持多级下拉菜单
- 自动切换为浅色主题

```typescript
// 监听布局模式变化
watch(
  () => layout.menuLayout.value,
  (newLayout) => {
    if (newLayout === MenuLayoutMode.Horizontal) {
      // 水平模式下强制切换为浅色菜单主题
      layout.sideTheme.value = SideTheme.Light
    }
  },
  { immediate: false }
)
```

## 工具项统一样式

所有工具项使用统一的样式类 `navbar-tool-item`:

```scss
.navbar-tool-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }
}
```

## API 文档

### Navbar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| - | 无外部 Props | - | - |

### Navbar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| setLayout | 打开布局设置 | `() => void` |

### TopNav 计算属性

| 属性 | 说明 | 类型 |
|------|------|------|
| topMenus | 混合模式顶部菜单列表 | `RouteRecordRaw[]` |
| horizontalMenus | 水平模式完整菜单列表 | `RouteRecordRaw[]` |
| activeMenu | 当前激活的菜单路径 | `string` |
| visibleNumber | 可显示的菜单数量 | `number` |

### Hamburger Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| isActive | 是否激活状态 | `boolean` | `false` |

### Hamburger Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| toggleClick | 点击切换 | `() => void` |

### NavbarSearch 接口

```typescript
interface RouterItem {
  path: string
  title: string[]
  icon?: IconCode
  query?: string
}

interface FuseResult {
  item: RouterItem
  refIndex: number
}
```

### Notice 接口

```typescript
interface UserNoticeVo {
  noticeId: number
  noticeTitle: string
  noticeType: string
  noticeContent: string
  createByName: string
  createTime: string
  isRead: boolean
}
```

### UserDropdown Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| isDynamicTenant | 是否动态租户模式 | `boolean` | `false` |

### TenantSelect Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| tenant-change | 租户变化 | `(isDynamic: boolean) => void` |

### LangSelect Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| showTooltip | 显示提示框 | `boolean` | `true` |
| showAnimate | 显示动画 | `boolean` | `true` |
| showBackground | 显示背景 | `boolean` | `true` |

## 主题定制

### CSS 变量

导航栏使用以下 CSS 变量:

```scss
:root {
  // 背景色
  --el-bg-color: #ffffff;
  --el-fill-color-light: #f5f7fa;

  // 文字颜色
  --el-text-color-primary: #303133;
  --el-text-color-regular: #606266;
  --el-text-color-secondary: #909399;

  // 主题色
  --el-color-primary: #409eff;
  --el-color-warning: #e6a23c;
  --el-color-success: #67c23a;
  --el-color-danger: #f56c6c;

  // 边框
  --el-border-color-lighter: #ebeef5;
}
```

### 暗黑模式适配

```scss
.dark {
  .notice-container {
    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .notice-item {
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    &.notice-item--unread {
      background-color: rgba(64, 158, 255, 0.05);

      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
      }
    }
  }
}
```

## 最佳实践

### 1. 响应式工具栏配置

根据实际需求配置工具栏显示:

```vue
<!-- ✅ 推荐：按重要性和使用频率配置 -->
<template v-if="device !== 'mobile'">
  <TenantSelect v-if="width > 1200 && isSuperAdmin" />
  <NavbarSearch v-if="width > 768" />
  <Notice v-if="width > 768" />
  <FullscreenToggle v-if="width > 1024" />
  <LangSelect v-if="width > 1024 && enableI18n" />
  <LayoutSetting />
</template>
<UserDropdown />
```

### 2. 权限控制

正确使用权限控制显示工具项:

```vue
<!-- ✅ 推荐：结合权限和配置 -->
<TenantSelect v-if="isSuperAdmin && tenantEnabled" />

<!-- ❌ 避免：硬编码显示 -->
<TenantSelect />
```

### 3. 国际化支持

确保所有文本使用国际化:

```typescript
// ✅ 推荐
const { t } = useI18n()
:content="t('navbar.searchMenu')"

// ❌ 避免
:content="'搜索菜单'"
```

### 4. 搜索性能优化

合理配置 Fuse.js 参数:

```typescript
// ✅ 推荐：根据数据量调整阈值
new Fuse(list, {
  threshold: 0.4,      // 较低阈值提高精确度
  distance: 100,       // 限制匹配距离
  minMatchCharLength: 1
})
```

### 5. 通知轮询优化

使用 Store 管理通知状态,避免重复请求:

```typescript
// ✅ 推荐：使用 Store 统一管理
const unreadCount = computed(() => noticeStore.unreadCount)

onMounted(() => {
  noticeStore.refreshUnreadCount()
})

// ❌ 避免：组件内独立请求
onMounted(() => {
  fetchUnreadCount()
})
```

## 常见问题

### 1. 菜单数量显示不正确

**问题原因:**
- 窗口大小改变时未重新计算
- 侧边栏状态影响计算

**解决方案:**

```typescript
onMounted(() => {
  window.addEventListener('resize', setVisibleNumber)
  setVisibleNumber()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setVisibleNumber)
})
```

### 2. 搜索无结果

**问题原因:**
- 路由权限配置不正确
- 搜索索引未正确生成
- Fuse.js 阈值设置过低

**解决方案:**

```typescript
// 确保正确过滤隐藏路由
routes.forEach((r) => {
  if (r.hidden) return  // 跳过隐藏路由
  // ...
})

// 调整搜索阈值
new Fuse(list, {
  threshold: 0.4,  // 适当调高阈值
})
```

### 3. 通知未读数不同步

**问题原因:**
- Store 状态未及时刷新
- 组件间状态不同步

**解决方案:**

```typescript
// 使用全局 Store 管理
const noticeStore = useNoticeStore()
const unreadCount = computed(() => noticeStore.unreadCount)

// 操作后刷新状态
const handleMarkAsRead = async (noticeId: number) => {
  await markNoticeAsRead(noticeId)
  noticeStore.refreshUnreadCount()  // 刷新全局状态
}
```

### 4. AI 助手 WebSocket 连接失败

**问题原因:**
- WebSocket 未建立连接
- 网络不稳定

**解决方案:**

```typescript
const checkWebSocketConnection = () => {
  if (!webSocket.isConnected) {
    showMsgError('WebSocket 未连接，请刷新页面重试')
    return false
  }
  return true
}

const handleOpenChat = () => {
  if (!checkWebSocketConnection()) {
    return
  }
  drawerVisible.value = true
}
```

### 5. 面包屑路径不正确

**问题原因:**
- 多级路由路径解析错误
- 权限路由配置问题

**解决方案:**

```typescript
// 使用迭代算法替代递归
const getMatched = (pathList: string[], routeList: any[], matched: any[]) => {
  const currentList = [...pathList]
  let currentRoutes = routeList

  while (currentList.length > 0) {
    const currentPath = currentList[0]
    const data = currentRoutes.find(
      (item) => item.path == currentPath ||
      (item.name && item.name.toString().toLowerCase() == currentPath)
    )

    if (!data) break

    matched.push(data)
    if (data.children && data.children.length > 0) {
      currentRoutes = data.children
      currentList.shift()
    } else {
      break
    }
  }
}
```

### 6. 水平模式菜单样式异常

**问题原因:**
- 主题色未正确切换
- 样式覆盖问题

**解决方案:**

```typescript
// 水平模式自动切换浅色主题
watch(
  () => layout.menuLayout.value,
  (newLayout) => {
    if (newLayout === MenuLayoutMode.Horizontal) {
      layout.sideTheme.value = SideTheme.Light
    }
  }
)
```

## 总结

顶部导航系统是后台管理界面的核心交互组件,通过模块化设计实现了:

1. **灵活的布局模式** - 支持垂直、混合、水平三种布局
2. **丰富的工具集** - 搜索、通知、AI助手、多语言等功能
3. **完善的响应式** - 自动适配不同屏幕尺寸
4. **企业级特性** - 多租户、权限控制、国际化支持

合理使用这些组件和配置,可以构建出高效、易用的后台管理界面导航系统。
