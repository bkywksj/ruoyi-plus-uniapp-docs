# 侧边栏(SideBar)

## 简介

侧边栏系统是后台管理界面的核心导航模块，由四个紧密协作的组件构成：`Sidebar.vue`（容器）、`SidebarItem.vue`（菜单项）、`Logo.vue`（应用标识）和 `AppLink.vue`（智能链接）。该系统提供了完整的菜单导航、权限控制、主题适配和响应式支持，是企业级后台管理系统不可或缺的核心组件。

**核心特性:**

- **递归菜单渲染** - 支持无限层级的菜单嵌套，通过递归组件实现灵活的多级菜单结构
- **权限路由过滤** - 集成权限Store，自动过滤无权访问的菜单项，确保菜单安全可控
- **双主题支持** - 内置深色(theme-dark)和浅色(theme-light)两种侧边栏主题，可独立切换
- **智能链接处理** - 自动识别内部路由和外部链接，提供统一的跳转体验
- **折叠状态管理** - 完整的展开/折叠状态支持，包含图标居中、工具提示等优化
- **国际化集成** - 菜单标题支持i18n国际化，通过i18nKey配置实现多语言
- **动画过渡效果** - 集成Animate.css动画系统，提供流畅的菜单展开/折叠动画
- **CSS变量主题** - 基于CSS变量的主题系统，支持动态切换和自定义

## 组件架构

```text
Sidebar/
├── Sidebar.vue           # 侧边栏主容器组件
├── SidebarItem.vue       # 递归菜单项组件
├── Logo.vue              # 应用Logo组件
└── AppLink.vue           # 智能链接组件
```

### 组件职责划分

| 组件 | 职责 | 依赖 |
|------|------|------|
| Sidebar.vue | 容器布局、主题控制、菜单渲染入口 | useLayout, permissionStore |
| SidebarItem.vue | 递归渲染菜单项、处理单级/多级菜单逻辑 | i18n, stateStore |
| Logo.vue | 显示应用Logo和标题、处理折叠状态 | useLayout, useAnimation |
| AppLink.vue | 内外链接统一处理、路由跳转封装 | vue-router, isExternal |

### 数据流向

```text
                    ┌─────────────────┐
                    │  permissionStore │
                    │  (权限路由数据)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Sidebar.vue    │
                    │  (容器+主题控制) │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  Logo.vue   │  │SidebarItem  │  │el-scrollbar │
    │ (Logo显示)  │  │ (菜单递归)  │  │ (滚动容器)  │
    └─────────────┘  └──────┬──────┘  └─────────────┘
                            │
                            ▼
                    ┌─────────────────┐
                    │  AppLink.vue    │
                    │  (链接跳转)     │
                    └─────────────────┘
```

## 核心组件详解

### Sidebar.vue - 主容器

侧边栏的根容器组件，负责整体布局、主题控制、滚动管理和菜单渲染入口。

#### 完整组件源码

```vue
<template>
  <div :class="{ 'has-logo': isLogoVisible }" :style="sidebarStyles" class="sidebar-container h-full">
    <!-- 应用logo -->
    <logo v-if="isLogoVisible" :collapse="isSidebarCollapsed" />

    <!-- 菜单滚动容器 -->
    <el-scrollbar :class="currentSideTheme" class="scrollbar-wrapper">
      <transition :enter-active-class="menuSearchAnimate.enter" mode="out-in">
        <el-menu
          :default-active="currentActiveMenu"
          :collapse="isSidebarCollapsed"
          :background-color="menuBackgroundColor"
          :text-color="menuTextColor"
          :unique-opened="true"
          :active-text-color="currentThemeColor"
          :collapse-transition="false"
          mode="vertical"
          class="h-full w-full border-none"
        >
          <!-- 递归渲染侧边栏菜单项 -->
          <SidebarItem
            v-for="(route, index) in authorizedSidebarRoutes"
            :key="route.path + index"
            :item="route"
            :base-path="route.path"
          />
        </el-menu>
      </transition>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts" name="Sidebar">
import variables from '@/assets/styles/abstracts/exports.module.scss'
import type { RouteRecordRaw } from 'vue-router'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import { usePermissionStore } from '@/stores/modules/permission'
import { menuSearchAnimate } from '@/composables/useAnimation'
import { SideTheme } from '@/systemConfig'

// 布局Composable
const layout = useLayout()

// 路由实例
const { currentRoute } = useRouter()

// 权限Store
const permissionStore = usePermissionStore()

/**
 * 获取用户有权限访问的侧边栏路由列表
 */
const authorizedSidebarRoutes = computed<RouteRecordRaw[]>(() =>
  permissionStore.getSidebarRoutes()
)

/**
 * 当前激活的菜单项
 * 优先使用路由meta中的activeMenu配置，否则使用当前路径
 */
const currentActiveMenu = computed(() => {
  const { meta, path } = currentRoute.value

  // 优先使用路由meta中的activeMenu配置
  if (meta.activeMenu) {
    return meta.activeMenu
  }

  return path
})

/**
 * 侧边栏是否折叠
 */
const isSidebarCollapsed = computed(() => !layout.sidebar.value.opened)

/**
 * 是否显示Logo
 */
const isLogoVisible = computed(() => layout.sidebarLogo.value)

/**
 * 当前主题色
 */
const currentThemeColor = computed(() => layout.themeColor.value)

/**
 * 当前侧边栏主题
 */
const currentSideTheme = computed(() => layout.sideTheme.value)

/**
 * 菜单背景色
 * 根据当前侧边栏主题返回对应的背景色
 */
const menuBackgroundColor = computed(() =>
  currentSideTheme.value === SideTheme.Dark
    ? variables.menuBackground
    : variables.menuLightBackground
)

/**
 * 菜单文字色
 * 根据当前侧边栏主题返回对应的文字色
 */
const menuTextColor = computed(() =>
  currentSideTheme.value === SideTheme.Dark
    ? variables.menuColor
    : variables.menuLightColor
)

/**
 * 菜单悬停背景色
 */
const menuHoverColor = computed(() =>
  currentSideTheme.value === SideTheme.Dark
    ? variables.menuHover
    : variables.menuLightHover
)

/**
 * 菜单悬停文字色
 */
const menuHoverTextColor = computed(() =>
  currentSideTheme.value === SideTheme.Dark
    ? variables.menuHoverText
    : variables.menuLightHoverText
)

/**
 * 侧边栏样式
 */
const sidebarStyles = computed(() => ({}))

/**
 * 监听主题变化，动态更新CSS变量
 * 由于Element Plus的el-menu不支持直接设置hover色，
 * 需要通过CSS变量动态更新实现主题切换
 */
watch(
  [menuHoverColor, menuHoverTextColor],
  ([hoverColor, hoverTextColor]) => {
    document.documentElement.style.setProperty('--menu-hover-color', hoverColor)
    document.documentElement.style.setProperty('--menu-hover-text-color', hoverTextColor)
  },
  { immediate: true }
)
</script>
```

#### 关键特性分析

**1. 权限路由过滤**

侧边栏通过`permissionStore.getSidebarRoutes()`获取用户有权限访问的路由列表，该方法在用户登录后由权限Store自动处理：

```typescript
const authorizedSidebarRoutes = computed<RouteRecordRaw[]>(() =>
  permissionStore.getSidebarRoutes()
)
```

权限路由的生成过程：
1. 用户登录后，后端返回用户可访问的菜单列表
2. 权限Store将菜单列表转换为Vue Router路由格式
3. 同时生成侧边栏专用的路由列表（过滤hidden路由）
4. Sidebar组件通过计算属性获取最新的授权路由

**2. 激活菜单计算**

当前激活的菜单项通过`currentActiveMenu`计算属性确定：

```typescript
const currentActiveMenu = computed(() => {
  const { meta, path } = currentRoute.value

  // 优先使用路由meta中的activeMenu配置
  if (meta.activeMenu) {
    return meta.activeMenu
  }

  return path
})
```

`activeMenu`元数据的使用场景：
- 详情页需要高亮列表页菜单
- 子路由需要高亮父级菜单
- 非菜单页面需要高亮相关菜单

**3. 主题颜色管理**

侧边栏支持深色和浅色两种主题，通过`SideTheme`枚举控制：

```typescript
// 系统配置中的主题枚举
export enum SideTheme {
  Dark = 'theme-dark',
  Light = 'theme-light'
}

// 根据主题返回对应颜色
const menuBackgroundColor = computed(() =>
  currentSideTheme.value === SideTheme.Dark
    ? variables.menuBackground
    : variables.menuLightBackground
)
```

**4. CSS变量动态更新**

由于Element Plus的`el-menu`组件不直接支持悬停颜色的Props配置，需要通过CSS变量动态更新：

```typescript
watch(
  [menuHoverColor, menuHoverTextColor],
  ([hoverColor, hoverTextColor]) => {
    document.documentElement.style.setProperty('--menu-hover-color', hoverColor)
    document.documentElement.style.setProperty('--menu-hover-text-color', hoverTextColor)
  },
  { immediate: true }
)
```

### SidebarItem.vue - 菜单项组件

递归渲染的菜单项组件，支持多级嵌套，是侧边栏系统中最复杂的组件。

#### 组件Props定义

```typescript
interface SidebarItemProps {
  /** 当前菜单项的路由配置对象 */
  item: RouteRecordRaw
  /** 是否为嵌套子菜单项 */
  isNest?: boolean
  /** 父级路径前缀，用于构建完整路径 */
  basePath?: string
}

const props = withDefaults(defineProps<SidebarItemProps>(), {
  isNest: false,
  basePath: ''
})
```

#### 核心渲染逻辑

SidebarItem组件的核心在于判断菜单项应该渲染为单级菜单还是多级子菜单：

```vue
<template>
  <!-- 隐藏菜单不渲染 -->
  <template v-if="!menuItem.hidden">
    <!-- 单级菜单渲染 -->
    <template v-if="shouldRenderAsSingleItem &&
      (!singleChildRoute.children || singleChildRoute.noShowingChildren) &&
      !menuItem.alwaysShow">
      <AppLink
        v-if="singleChildRoute.meta"
        :to="buildRoutePath(singleChildRoute.path, singleChildRoute.query)"
      >
        <el-menu-item
          :index="buildRoutePath(singleChildRoute.path)"
          :class="{ 'submenu-title-noDropdown': !isNestedItem }"
        >
          <Icon
            class="menu-item-icon"
            :class="stateStore.sidebar.opened ? '' : 'icon-collapsed'"
            :code="singleChildRoute.meta.icon || (menuItem.meta && menuItem.meta.icon)"
          />
          <template #title>
            <span class="menu-title" :title="getTooltipTitle(getLocalizedMenuTitle(singleChildRoute))">
              {{ getLocalizedMenuTitle(singleChildRoute) }}
            </span>
          </template>
        </el-menu-item>
      </AppLink>
    </template>

    <!-- 多级菜单渲染 -->
    <el-sub-menu v-else ref="subMenuRef" :index="buildRoutePath(menuItem.path)" teleported>
      <template v-if="menuItem.meta" #title>
        <Icon
          class="menu-item-icon"
          :class="stateStore.sidebar.opened ? '' : 'ml-[20px]'"
          :code="menuItem.meta ? menuItem.meta.icon : ''"
        />
        <span class="menu-title" :title="getTooltipTitle(getLocalizedMenuTitle(menuItem))">
          {{ getLocalizedMenuTitle(menuItem) }}
        </span>
      </template>

      <!-- 递归渲染子菜单项 -->
      <SidebarItem
        v-for="(childRoute, index) in menuItem.children"
        :key="childRoute.path + index"
        :is-nest="true"
        :item="childRoute"
        :base-path="buildRoutePath(childRoute.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </template>
</template>
```

#### 单子菜单判断逻辑

`hasOnlyOneVisibleChild`函数用于判断当前菜单是否只有一个可见的子路由：

```typescript
/**
 * 判断路由是否只有一个可见子路由
 * @param parentRoute 父级路由配置
 * @param childRoutes 子路由列表
 * @returns 是否只有一个可见子路由
 */
const hasOnlyOneVisibleChild = (
  parentRoute: RouteRecordRaw,
  childRoutes?: RouteRecordRaw[]
): boolean => {
  const children = childRoutes || []

  // 过滤出所有可显示的子路由（排除hidden为true的）
  const visibleChildren = children.filter((child) => {
    if (child.hidden) return false
    singleChildRoute.value = child
    return true
  })

  // 只有一个可见子路由时，直接显示该子路由
  if (visibleChildren.length === 1) {
    return true
  }

  // 没有可见子路由时，显示父路由自身
  if (visibleChildren.length === 0) {
    singleChildRoute.value = {
      ...parentRoute,
      path: '',
      noShowingChildren: true
    }
    return true
  }

  return false
}
```

这个逻辑的作用：
- 当父菜单只有一个可见子菜单时，直接显示子菜单，避免不必要的层级
- 当父菜单没有可见子菜单时，显示父菜单本身
- 当父菜单有多个可见子菜单时，渲染为可展开的子菜单结构

#### 国际化标题处理

```typescript
/**
 * 获取菜单项的本地化标题
 * 优先使用i18nKey配置，回退到title配置
 */
const getLocalizedMenuTitle = (item: any): string => {
  const meta = item?.meta
  const name = item?.name

  // 优先使用国际化键
  if (meta?.i18nKey) {
    const translatedTitle = t(meta.i18nKey)
    // 如果翻译成功（不等于key本身），返回翻译结果
    if (translatedTitle !== meta.i18nKey) {
      return translatedTitle
    }
  }

  // 使用名称转换的标题或者原始标题
  return t(nameToTitle(name), meta.title)
}

/**
 * 将路由名称转换为标题格式
 * 例如: UserManagement -> user.management
 */
const nameToTitle = (name: string): string => {
  if (!name) return ''
  // 将大驼峰转换为点分隔的小写格式
  return name.replace(/([A-Z])/g, '.$1').toLowerCase().slice(1)
}
```

#### 路径构建方法

```typescript
/**
 * 构建完整的路由路径
 * @param routePath 当前路由路径
 * @param routeQuery 路由查询参数
 * @returns 完整的路由路径或路由对象
 */
const buildRoutePath = (routePath: string, routeQuery?: any) => {
  // 处理外部链接
  if (isExternal(routePath)) {
    return routePath
  }

  // 处理外部链接（basePath形式）
  if (isExternal(props.basePath)) {
    return props.basePath
  }

  // 拼接基础路径和当前路径
  const fullPath = path.resolve(props.basePath, routePath)

  // 如果有查询参数，返回路由对象
  if (routeQuery) {
    return {
      path: fullPath,
      query: routeQuery
    }
  }

  return fullPath
}
```

### Logo.vue - 应用标识

显示应用Logo和标题的组件，支持折叠状态的动态切换，并根据不同主题调整样式。

#### 完整组件实现

```vue
<template>
  <!-- 侧边栏Logo容器 -->
  <div class="sidebar-logo-container" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Logo切换动画 -->
    <transition :enter-active-class="logoTransition.enter" mode="out-in">
      <!-- 折叠状态：仅显示Logo图标 -->
      <router-link
        v-if="isCollapsed"
        key="collapsed"
        class="sidebar-logo-link"
        to="/"
        :title="appTitle"
      >
        <img v-if="hasLogo" :src="logoImageSrc" :alt="appTitle" class="sidebar-logo" />
        <h1 v-else class="sidebar-title collapsed-title" :style="titleStyle">
          {{ appTitleFirstChar }}
        </h1>
      </router-link>

      <!-- 展开状态：显示Logo图标+标题 -->
      <router-link
        v-else
        key="expanded"
        class="sidebar-logo-link"
        to="/"
        :title="appTitle"
      >
        <img v-if="hasLogo" :src="logoImageSrc" :alt="appTitle" class="sidebar-logo" />
        <h1 class="sidebar-title expanded-title" :style="titleStyle">
          {{ appTitle }}
        </h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts" name="Logo">
import variables from '@/assets/styles/abstracts/exports.module.scss'
import logoImage from '@/assets/logo/logo.png'
import { logoAnimate } from '@/composables/useAnimation'
import { MenuLayoutMode } from '@/systemConfig'

/**
 * 组件Props定义
 */
interface LogoProps {
  /** 侧边栏是否折叠 */
  collapse: boolean
}

const props = withDefaults(defineProps<LogoProps>(), {
  collapse: false
})

// 应用标题常量
const APP_TITLE = 'ryplus_uni_workflow'

// 布局Composable
const layout = useLayout()

// 侧边栏是否折叠
const isCollapsed = computed(() => props.collapse)

// 当前侧边栏主题
const currentSideTheme = computed(() => layout.sideTheme.value)

// 是否为水平布局模式
const isHorizontalLayout = computed(() =>
  layout.menuLayout.value === MenuLayoutMode.Horizontal
)

// 是否为深色主题
const isDarkTheme = computed(() => currentSideTheme.value === 'theme-dark')

// 应用标题
const appTitle = computed(() => APP_TITLE)

// 应用标题首字符（折叠时显示）
const appTitleFirstChar = computed(() =>
  appTitle.value.charAt(0).toUpperCase()
)

// 是否有Logo图片
const hasLogo = computed(() => Boolean(logoImage))

// Logo图片源
const logoImageSrc = computed(() => logoImage)

// Logo动画配置
const logoTransition = computed(() => logoAnimate)

/**
 * 标题文字样式
 * 根据布局模式和主题动态计算
 */
const titleStyle = computed(() => {
  // 水平布局模式下，使用CSS变量以适应主题切换
  if (isHorizontalLayout.value) {
    return { color: 'var(--el-text-color-primary)' }
  }
  // 侧边栏模式下，根据侧边栏主题决定颜色
  return {
    color: isDarkTheme.value
      ? variables.logoTitleColor
      : variables.logoLightTitleColor
  }
})
</script>

<style lang="scss" scoped>
/* Logo容器基础样式 */
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-align: left;
  overflow: hidden;
  transition: all var(--duration-normal) ease;

  /* Logo链接样式 */
  .sidebar-logo-link {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
    width: 100%;
    padding-left: 24px;
    text-decoration: none;
    transition: all var(--duration-normal) ease;

    &:hover {
      opacity: 0.8;
    }
  }

  /* Logo图片样式 */
  .sidebar-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
    transition: all var(--duration-normal) ease;
    flex-shrink: 0;
  }

  /* 标题文字基础样式 */
  .sidebar-title {
    margin: 0;
    line-height: 1;
    font-size: 18px;
    font-family: 'PingFang SC', 'Helvetica Neue', Helvetica,
                 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
    transition: all var(--duration-normal) ease;
    white-space: nowrap;
    overflow: hidden;
  }

  /* 展开状态标题样式 */
  .expanded-title {
    margin-left: 12px;
    text-overflow: ellipsis;
  }

  /* 折叠状态标题样式 */
  .collapsed-title {
    font-size: 18px;
    font-weight: 700;
  }

  /* 折叠状态样式调整 */
  &.is-collapsed {
    .sidebar-logo {
      margin-right: 0;
    }

    .sidebar-logo-link {
      justify-content: center;
      padding-left: 0;
    }
  }
}
</style>
```

#### Logo组件特性

**1. 折叠状态适配**

Logo组件根据侧边栏折叠状态显示不同内容：
- 展开状态：显示Logo图片 + 应用标题
- 折叠状态：仅显示Logo图片（或标题首字母）

**2. 动画过渡**

使用`logoAnimate`配置的动画效果，在折叠/展开切换时提供平滑过渡：

```typescript
// useAnimation.ts中的Logo动画配置
export const logoAnimate: AnimationConfig = {
  enter: 'animate__animated animate__fadeIn',
  leave: 'animate__animated animate__fadeOut'
}
```

**3. 主题适配**

Logo标题颜色根据当前主题和布局模式动态计算：
- 水平布局：使用CSS变量`--el-text-color-primary`
- 侧边栏深色主题：使用`logoTitleColor`（浅色文字）
- 侧边栏浅色主题：使用`logoLightTitleColor`（深色文字）

### AppLink.vue - 智能链接

处理内部路由和外部链接的统一组件，提供灵活的链接跳转功能。

#### 组件Props定义

```typescript
interface AppLinkProps {
  /** 链接地址 - 支持内部路由对象或外部URL字符串 */
  to: string | RouteLocationRaw
  /** 外部链接打开方式 */
  target?: '_blank' | '_self' | '_parent' | '_top'
  /** 外部链接rel属性 */
  rel?: string
  /** 是否禁用链接 */
  disabled?: boolean
  /** 自定义CSS类名 */
  customClass?: string
  /** 是否阻止默认行为 */
  preventDefault?: boolean
}

const props = withDefaults(defineProps<AppLinkProps>(), {
  target: '_blank',
  rel: 'noopener noreferrer',
  disabled: false,
  customClass: '',
  preventDefault: false
})
```

#### 智能渲染逻辑

```typescript
/**
 * 判断是否为外部链接
 * 外部链接以 http://, https://, mailto:, tel: 等协议开头
 */
const isExternalLink = computed(() => {
  return typeof props.to === 'string' && isExternal(props.to)
})

/**
 * 渲染的组件类型
 * - 禁用状态：渲染为span
 * - 外部链接：渲染为a标签
 * - 内部路由：渲染为router-link
 */
const linkComponentType = computed(() => {
  if (props.disabled) return 'span'
  return isExternalLink.value ? 'a' : 'router-link'
})

/**
 * 链接属性
 * 根据链接类型返回对应的属性对象
 */
const linkProps = computed(() => {
  if (props.disabled) {
    return {
      class: ['app-link', 'is-disabled', props.customClass]
    }
  }

  if (isExternalLink.value) {
    return {
      href: props.to,
      target: props.target,
      rel: props.rel,
      class: ['app-link', props.customClass]
    }
  }

  return {
    to: props.to,
    class: ['app-link', props.customClass]
  }
})
```

#### 外部链接判断工具函数

```typescript
/**
 * 判断路径是否为外部链接
 * @param path 路径字符串
 * @returns 是否为外部链接
 */
export function isExternal(path: string): boolean {
  const externalReg = /^(https?:|mailto:|tel:|ftp:)/i
  return externalReg.test(path)
}
```

#### 完整组件实现

```vue
<template>
  <component
    :is="linkComponentType"
    v-bind="linkProps"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts" name="AppLink">
import { isExternal } from '@/utils/validate'
import type { RouteLocationRaw } from 'vue-router'

// Props定义
interface AppLinkProps {
  to: string | RouteLocationRaw
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  disabled?: boolean
  customClass?: string
  preventDefault?: boolean
}

const props = withDefaults(defineProps<AppLinkProps>(), {
  target: '_blank',
  rel: 'noopener noreferrer',
  disabled: false,
  customClass: '',
  preventDefault: false
})

// 事件定义
const emit = defineEmits<{
  click: [event: MouseEvent, linkType: 'internal' | 'external' | 'disabled']
}>()

// 计算属性
const isExternalLink = computed(() => {
  return typeof props.to === 'string' && isExternal(props.to)
})

const linkComponentType = computed(() => {
  if (props.disabled) return 'span'
  return isExternalLink.value ? 'a' : 'router-link'
})

const linkProps = computed(() => {
  if (props.disabled) {
    return {
      class: ['app-link', 'is-disabled', props.customClass]
    }
  }

  if (isExternalLink.value) {
    return {
      href: props.to,
      target: props.target,
      rel: props.rel,
      class: ['app-link', props.customClass]
    }
  }

  return {
    to: props.to,
    class: ['app-link', props.customClass]
  }
})

/**
 * 点击事件处理
 */
const handleClick = (event: MouseEvent) => {
  // 阻止默认行为
  if (props.preventDefault) {
    event.preventDefault()
  }

  // 禁用状态阻止点击
  if (props.disabled) {
    event.preventDefault()
    emit('click', event, 'disabled')
    return
  }

  // 触发点击事件
  const linkType = isExternalLink.value ? 'external' : 'internal'
  emit('click', event, linkType)
}
</script>

<style lang="scss" scoped>
.app-link {
  display: inline-block;
  text-decoration: none;
  color: inherit;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  }
}
</style>
```

## 主题系统

### CSS变量架构

侧边栏使用完整的CSS变量系统支持主题切换，所有颜色值都通过CSS变量定义：

#### 亮色主题变量

```scss
:root {
  /* 侧边栏菜单背景色（亮色主题默认使用深色侧边栏） */
  --menu-bg: #161618;
  /* 菜单普通文字颜色 */
  --menu-text: #bfcbd9;
  /* 菜单激活状态文字颜色 */
  --menu-text-active: #f4f4f5;

  /* 基础悬停背景色 */
  --menu-hover: #475569;
  /* 基础悬停文字色 */
  --menu-hover-text: #f4f4f5;
  /* 菜单悬停背景色（由JS动态设置） */
  --menu-hover-color: var(--menu-hover);
  /* 菜单悬停文字色（由JS动态设置） */
  --menu-hover-text-color: var(--menu-hover-text);

  /* 菜单激活背景色 */
  --menu-active-bg: var(--el-menu-active-bg-color);
  /* 菜单激活文字色 */
  --menu-active-text: var(--el-menu-active-text-color);

  /* 子菜单背景色 */
  --submenu-bg: #1f2d3d;
  /* 子菜单激活文字色 */
  --submenu-text-active: #f4f4f5;
  /* 子菜单悬停背景色 */
  --submenu-hover: var(--menu-hover-color);
}
```

#### 暗色主题变量

```scss
html.dark {
  /* 侧边栏菜单背景色 */
  --menu-bg: var(--bg-level-1); /* #161618 */
  /* 菜单普通文字颜色 */
  --menu-text: #cbd5e1;
  /* 菜单激活状态文字颜色 */
  --menu-text-active: #f4f4f5;

  /* 基础悬停背景色 */
  --menu-hover: var(--bg-level-2); /* #1f1f23 */
  /* 基础悬停文字色 */
  --menu-hover-text: #f4f4f5;

  /* 子菜单背景色 */
  --submenu-bg: var(--bg-level-2);
}
```

### SCSS变量导出

通过Webpack的`:export`指令，SCSS变量可以在JavaScript中使用：

```scss
// exports.module.scss
@use './variables' as *;

:export {
  menuColor: var(--menu-text);
  menuLightColor: #333;
  menuColorActive: var(--menu-text-active);
  menuBackground: var(--menu-bg);
  menuLightBackground: white;
  menuHover: var(--menu-hover);
  menuLightHover: #f5f7fa;
  menuHoverText: var(--menu-text);
  menuLightHoverText: #333;
  subMenuBackground: var(--submenu-bg);
  subMenuHover: var(--submenu-hover);
  sideBarWidth: $base-sidebar-width;
  logoTitleColor: var(--menu-text-active);
  logoLightTitleColor: #333;
}
```

在组件中使用：

```typescript
import variables from '@/assets/styles/abstracts/exports.module.scss'

// 使用导出的变量
const menuBackground = variables.menuBackground
const sideBarWidth = variables.sideBarWidth
```

### 主题切换机制

侧边栏主题通过`SideTheme`枚举控制，与全局暗色模式独立：

```typescript
// 系统配置中的主题枚举
export enum SideTheme {
  Dark = 'theme-dark',
  Light = 'theme-light'
}

// 侧边栏组件中的主题切换
const isDarkTheme = computed(() =>
  currentSideTheme.value === SideTheme.Dark
)

// 动态CSS变量更新
watch(
  [menuHoverColor, menuHoverTextColor],
  ([hoverColor, hoverTextColor]) => {
    document.documentElement.style.setProperty('--menu-hover-color', hoverColor)
    document.documentElement.style.setProperty('--menu-hover-text-color', hoverTextColor)
  },
  { immediate: true }
)
```

## 布局样式系统

### 侧边栏容器样式

```scss
.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: var(--z-sidebar); /* 1001 */
  width: $base-sidebar-width !important; /* 240px */
  height: 100%;
  background-color: var(--menu-bg);
  transition: width var(--duration-normal); /* 0.3s */
  font-size: 0;
  overflow: hidden;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);

  /* 带logo时的滚动区域高度调整 */
  &.has-logo {
    .el-scrollbar {
      height: calc(100% - 50px);
    }
  }
}
```

### 菜单项层级样式

系统支持四级菜单嵌套，每级菜单有独立的样式配置：

```scss
.sidebar-container .el-menu {
  border: none;
  height: 100%;
  width: 100% !important;
  padding: 4px 0;

  /* 一级菜单项 */
  .el-menu-item {
    margin: 2px 8px;
    border-radius: 8px;
    height: 44px;
    line-height: 44px;
    transition: all 0.2s ease;

    &:hover:not(.is-active) {
      background-color: var(--menu-hover-color) !important;
      color: var(--menu-hover-text-color) !important;
      transform: translateX(2px);
    }

    &.is-active {
      background-color: var(--menu-active-bg) !important;
      color: var(--menu-active-text) !important;
    }
  }

  /* 二级菜单 */
  .el-sub-menu .el-menu .el-menu-item {
    margin: 1px 8px;
    padding-left: 36px !important;
    height: 40px;
    line-height: 40px;
    font-size: 13px;
  }

  /* 三级菜单 */
  .el-sub-menu .el-menu .el-sub-menu .el-menu .el-menu-item {
    padding-left: 56px !important;
    height: 36px;
    line-height: 36px;
    font-size: 12px;
  }

  /* 四级菜单 */
  .el-sub-menu .el-menu .el-sub-menu .el-menu .el-sub-menu .el-menu .el-menu-item {
    padding-left: 76px !important;
    height: 32px;
    line-height: 32px;
    font-size: 11px;
  }
}
```

### 折叠状态样式

```scss
/* 折叠状态的侧边栏宽度 */
.hideSidebar .sidebar-container {
  width: var(--sidebar-collapsed-width) !important; /* 54px */
}

/* 折叠状态下的菜单项居中 */
.hideSidebar .el-menu--collapse {
  .el-menu-item {
    padding: 0 !important;
    margin: 2px 4px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    height: 44px !important;

    /* 图标居中 */
    .icon-collapsed {
      margin: 0 !important;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    /* 隐藏文字 */
    .menu-title {
      display: none !important;
    }

    /* 悬停效果 */
    &:hover:not(.is-active) {
      background-color: var(--menu-hover-color) !important;
      transform: scale(1.05);
    }
  }
}
```

### 响应式适配

```scss
/* 中等屏幕及以下的移动端适配 */
@include respond-to('md') { /* 992px */
  .app-wrapper {
    &.mobile {
      .main-container {
        margin-left: 0px;
      }

      .fixed-header {
        width: 100%;
      }

      /* 移动端侧边栏隐藏状态 */
      &.hideSidebar {
        .sidebar-container {
          pointer-events: none;
          transition-duration: var(--duration-normal);
          transform: translate3d(-$base-sidebar-width, 0, 0);
        }
      }
    }
  }
}
```

## 权限控制

### 路由权限过滤

权限Store负责处理用户权限和路由过滤：

```typescript
// stores/modules/permission.ts
export const usePermissionStore = defineStore('permission', () => {
  // 完整的权限路由列表
  const routes = ref<RouteRecordRaw[]>([])

  // 侧边栏专用路由（过滤hidden路由）
  const sidebarRoutes = ref<RouteRecordRaw[]>([])

  /**
   * 获取侧边栏路由
   * 过滤hidden为true的路由
   */
  const getSidebarRoutes = (): RouteRecordRaw[] => {
    return sidebarRoutes.value
  }

  /**
   * 生成权限路由
   * 在用户登录后调用
   */
  const generateRoutes = async () => {
    // 获取后端返回的菜单数据
    const { data } = await getRouters()

    // 转换为Vue Router格式
    const asyncRoutes = filterAsyncRouter(data)

    // 设置路由
    routes.value = constantRoutes.concat(asyncRoutes)

    // 生成侧边栏路由（过滤hidden）
    sidebarRoutes.value = filterHiddenRoutes(routes.value)

    return asyncRoutes
  }

  return {
    routes,
    sidebarRoutes,
    getSidebarRoutes,
    generateRoutes
  }
})
```

### 菜单项权限判断

在SidebarItem组件中，通过`hidden`属性控制菜单显示：

```vue
<template>
  <!-- 隐藏菜单不渲染 -->
  <template v-if="!menuItem.hidden">
    <!-- 菜单内容 -->
  </template>
</template>
```

### 路由权限配置示例

```typescript
// 路由配置中的权限控制
{
  path: '/system',
  component: Layout,
  meta: {
    title: '系统管理',
    icon: 'system',
    roles: ['admin', 'system'] // 角色权限
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: () => import('@/views/system/user/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'user',
        permissions: ['system:user:list'] // 按钮权限
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: () => import('@/views/system/role/index.vue'),
      meta: {
        title: '角色管理',
        icon: 'role',
        hidden: false // 显示在菜单中
      }
    }
  ]
}
```

## 使用示例

### 基本路由配置

```typescript
// router/modules/system.ts
import Layout from '@/layouts/index.vue'

export default {
  path: '/system',
  component: Layout,
  redirect: '/system/user',
  meta: {
    title: '系统管理',
    icon: 'system',
    alwaysShow: true // 总是显示父菜单
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: () => import('@/views/system/user/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'user'
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: () => import('@/views/system/role/index.vue'),
      meta: {
        title: '角色管理',
        icon: 'role'
      }
    },
    {
      path: 'menu',
      name: 'Menu',
      component: () => import('@/views/system/menu/index.vue'),
      meta: {
        title: '菜单管理',
        icon: 'menu'
      }
    }
  ]
}
```

### 多级嵌套菜单

```typescript
{
  path: '/nested',
  component: Layout,
  meta: {
    title: '多级菜单',
    icon: 'nested'
  },
  children: [
    {
      path: 'menu1',
      name: 'Menu1',
      component: () => import('@/views/nested/menu1/index.vue'),
      meta: { title: '菜单1' },
      children: [
        {
          path: 'menu1-1',
          name: 'Menu1-1',
          component: () => import('@/views/nested/menu1/menu1-1/index.vue'),
          meta: { title: '菜单1-1' }
        },
        {
          path: 'menu1-2',
          name: 'Menu1-2',
          component: () => import('@/views/nested/menu1/menu1-2/index.vue'),
          meta: { title: '菜单1-2' },
          children: [
            {
              path: 'menu1-2-1',
              name: 'Menu1-2-1',
              component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1/index.vue'),
              meta: { title: '菜单1-2-1' }
            }
          ]
        }
      ]
    },
    {
      path: 'menu2',
      name: 'Menu2',
      component: () => import('@/views/nested/menu2/index.vue'),
      meta: { title: '菜单2' }
    }
  ]
}
```

### 外部链接配置

```typescript
{
  path: '/external-link',
  component: Layout,
  children: [
    {
      path: 'https://github.com',
      meta: {
        title: 'GitHub',
        icon: 'github'
      }
    }
  ]
}
```

### 隐藏菜单配置

```typescript
{
  path: '/user',
  component: Layout,
  hidden: true, // 整个模块隐藏
  children: [
    {
      path: 'profile',
      name: 'Profile',
      component: () => import('@/views/user/profile/index.vue'),
      meta: {
        title: '个人中心',
        activeMenu: '/dashboard' // 高亮仪表盘菜单
      }
    }
  ]
}

// 或者只隐藏某个子菜单
{
  path: '/system',
  component: Layout,
  children: [
    {
      path: 'user/detail/:id',
      name: 'UserDetail',
      component: () => import('@/views/system/user/detail.vue'),
      hidden: true, // 只隐藏这个菜单项
      meta: {
        title: '用户详情',
        activeMenu: '/system/user' // 高亮用户管理菜单
      }
    }
  ]
}
```

### 国际化配置

```typescript
{
  path: '/system',
  component: Layout,
  meta: {
    title: '系统管理',
    i18nKey: 'menu.system.title', // 国际化key
    icon: 'system'
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: () => import('@/views/system/user/index.vue'),
      meta: {
        title: '用户管理',
        i18nKey: 'menu.system.user', // 国际化key
        icon: 'user'
      }
    }
  ]
}
```

语言包配置：

```typescript
// locales/zh-CN.ts
export default {
  menu: {
    system: {
      title: '系统管理',
      user: '用户管理',
      role: '角色管理',
      menu: '菜单管理'
    }
  }
}

// locales/en-US.ts
export default {
  menu: {
    system: {
      title: 'System Management',
      user: 'User Management',
      role: 'Role Management',
      menu: 'Menu Management'
    }
  }
}
```

## API

### Sidebar Props

由于Sidebar组件通过Composable和Store获取数据，没有外部Props。

### Sidebar 依赖注入

| 名称 | 说明 | 来源 |
|------|------|------|
| permissionStore | 权限Store实例 | `usePermissionStore()` |
| layout | 布局Composable | `useLayout()` |
| currentRoute | 当前路由信息 | `useRouter()` |

### SidebarItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| item | 路由配置对象 | `RouteRecordRaw` | - |
| isNest | 是否为嵌套子菜单项 | `boolean` | `false` |
| basePath | 父级路径前缀 | `string` | `''` |

### Logo Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| collapse | 侧边栏是否折叠 | `boolean` | `false` |

### AppLink Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| to | 链接地址 | `string \| RouteLocationRaw` | - |
| target | 外部链接打开方式 | `'_blank' \| '_self' \| '_parent' \| '_top'` | `'_blank'` |
| rel | 外部链接rel属性 | `string` | `'noopener noreferrer'` |
| disabled | 是否禁用链接 | `boolean` | `false` |
| customClass | 自定义CSS类名 | `string` | `''` |
| preventDefault | 是否阻止默认行为 | `boolean` | `false` |

### AppLink Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击链接时触发 | `(event: MouseEvent, linkType: 'internal' \| 'external' \| 'disabled')` |

### 路由Meta配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 菜单标题 | `string` | - |
| icon | 菜单图标 | `string` | - |
| hidden | 是否隐藏菜单 | `boolean` | `false` |
| alwaysShow | 是否总是显示父菜单 | `boolean` | `false` |
| activeMenu | 激活的菜单路径 | `string` | - |
| i18nKey | 国际化键名 | `string` | - |
| roles | 角色权限 | `string[]` | - |
| permissions | 按钮权限 | `string[]` | - |
| link | 是否为外链 | `boolean` | `false` |
| query | 路由查询参数 | `object` | - |

### 类型定义

```typescript
/**
 * 侧边栏主题枚举
 */
export enum SideTheme {
  /** 深色主题 */
  Dark = 'theme-dark',
  /** 浅色主题 */
  Light = 'theme-light'
}

/**
 * 菜单布局模式枚举
 */
export enum MenuLayoutMode {
  /** 垂直布局（左侧边栏） */
  Vertical = 'vertical',
  /** 混合布局（顶部+左侧） */
  Mixed = 'mixed',
  /** 水平布局（纯顶部） */
  Horizontal = 'horizontal'
}

/**
 * 路由Meta扩展接口
 */
interface RouteMeta {
  /** 菜单标题 */
  title?: string
  /** 菜单图标 */
  icon?: string
  /** 是否隐藏 */
  hidden?: boolean
  /** 总是显示父菜单 */
  alwaysShow?: boolean
  /** 激活的菜单路径 */
  activeMenu?: string
  /** 国际化键名 */
  i18nKey?: string
  /** 角色权限 */
  roles?: string[]
  /** 按钮权限 */
  permissions?: string[]
  /** 是否为外链 */
  link?: boolean
  /** 路由查询参数 */
  query?: Record<string, any>
}

/**
 * SCSS导出变量接口
 */
interface ScssVariables {
  menuColor: string
  menuLightColor: string
  menuColorActive: string
  menuBackground: string
  menuLightBackground: string
  menuHover: string
  menuLightHover: string
  menuHoverText: string
  menuLightHoverText: string
  subMenuBackground: string
  subMenuHover: string
  sideBarWidth: string
  logoTitleColor: string
  logoLightTitleColor: string
}
```

## 最佳实践

### 1. 合理的菜单层级

建议最多使用3级菜单，过深的嵌套会影响用户体验：

```typescript
// ✅ 推荐：最多3级
parent -> child -> grandchild

// ❌ 避免：超过3级
parent -> child -> grandchild -> great-grandchild
```

### 2. 语义化的路由命名

使用清晰的路由命名有助于国际化和维护：

```typescript
// ✅ 推荐
{
  path: 'user-management',
  name: 'UserManagement', // 大驼峰命名
  meta: { title: '用户管理' }
}

// ❌ 避免
{
  path: 'um',
  name: 'um',
  meta: { title: '用户管理' }
}
```

### 3. 使用权限系统控制菜单

通过权限系统控制菜单显示，而非硬编码：

```vue
<!-- ❌ 硬编码权限判断 -->
<el-menu-item v-if="userRole === 'admin'">

<!-- ✅ 使用权限系统 -->
<el-menu-item v-if="hasPermission('admin:user:list')">
```

### 4. 合理配置activeMenu

详情页使用`activeMenu`高亮对应列表菜单：

```typescript
// 用户详情页配置
{
  path: 'user/detail/:id',
  name: 'UserDetail',
  hidden: true,
  meta: {
    title: '用户详情',
    activeMenu: '/system/user' // 高亮用户管理
  }
}
```

### 5. 外链使用安全属性

外部链接应添加安全属性：

```typescript
// AppLink组件已内置安全属性
{
  target: '_blank',
  rel: 'noopener noreferrer' // 防止钓鱼攻击
}
```

## 常见问题

### 1. 菜单不显示

**问题原因:**
- 路由配置了`hidden: true`
- 用户没有该菜单的权限
- 路由未正确注册到权限Store
- 父路由设置了`hidden`导致子路由也被隐藏

**解决方案:**

```typescript
// 检查路由配置
{
  path: '/system',
  hidden: false, // 确保未隐藏
  meta: {
    roles: ['admin', 'user'] // 确保当前用户有权限
  }
}

// 检查权限Store
const permissionStore = usePermissionStore()
console.log('侧边栏路由:', permissionStore.getSidebarRoutes())
```

### 2. 主题样式异常

**问题原因:**
- CSS变量未正确定义
- 主题Store状态异常
- 样式优先级问题
- SCSS变量导出失败

**解决方案:**

```typescript
// 检查CSS变量
console.log(getComputedStyle(document.documentElement)
  .getPropertyValue('--menu-bg'))

// 检查主题状态
const layout = useLayout()
console.log('当前侧边栏主题:', layout.sideTheme.value)

// 确保样式文件正确导入
import variables from '@/assets/styles/abstracts/exports.module.scss'
console.log('SCSS变量:', variables)
```

### 3. 国际化不生效

**问题原因:**
- `i18nKey`配置错误
- 语言包文件缺失
- 翻译函数未正确调用

**解决方案:**

```typescript
// 检查i18nKey配置
{
  meta: {
    i18nKey: 'menu.system.user' // 确保key正确
  }
}

// 检查语言包
// locales/zh-CN.ts
export default {
  menu: {
    system: {
      user: '用户管理' // 确保翻译存在
    }
  }
}

// 检查翻译函数
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
console.log(t('menu.system.user'))
```

### 4. 折叠状态图标不居中

**问题原因:**
- 折叠状态下的CSS样式未正确应用
- 图标容器样式冲突

**解决方案:**

确保折叠状态样式正确：

```scss
.hideSidebar .el-menu--collapse {
  .el-menu-item {
    padding: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;

    .icon-collapsed {
      margin: 0 !important;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
```

### 5. 外部链接无法跳转

**问题原因:**
- 链接格式不正确
- `isExternal`判断失败
- 被浏览器安全策略阻止

**解决方案:**

```typescript
// 确保链接格式正确
{
  path: 'https://github.com', // 完整URL
  // 不是: path: 'github.com'
}

// 检查isExternal函数
import { isExternal } from '@/utils/validate'
console.log(isExternal('https://github.com')) // true
console.log(isExternal('/dashboard')) // false
```

### 6. 子菜单展开后无法收起

**问题原因:**
- `unique-opened`属性设置问题
- 点击事件未正确处理

**解决方案:**

```vue
<el-menu
  :unique-opened="true"  <!-- 确保只展开一个子菜单 -->
  :collapse-transition="false"
>
```

## 总结

侧边栏系统通过四个核心组件的协作，提供了功能完整、体验流畅的导航解决方案。系统支持多级菜单、权限控制、主题切换、国际化等企业级功能，是构建现代化后台管理系统的重要基础。

核心技术点：
- **递归组件**：SidebarItem实现无限层级菜单渲染
- **CSS变量**：实现主题切换的核心机制
- **权限过滤**：通过Store实现菜单权限控制
- **智能链接**：AppLink统一处理内外链接
- **响应式设计**：完整的移动端适配方案

开发建议：
- 控制菜单层级在3级以内
- 使用权限系统而非硬编码控制菜单
- 合理配置activeMenu提升用户体验
- 使用国际化支持多语言场景
