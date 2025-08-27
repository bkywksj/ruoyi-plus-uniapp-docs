# 侧边栏(SideBar)

## 简介

侧边栏系统是后台管理界面的核心导航模块，由四个紧密协作的组件构成：`Sidebar.vue`（容器）、`SidebarItem.vue`（菜单项）、`Logo.vue`（应用标识）和 `AppLink.vue`（智能链接）。该系统提供了完整的菜单导航、权限控制、主题适配和响应式支持。

## 组件架构

```
Sidebar/
├── Sidebar.vue           # 侧边栏主容器
├── SidebarItem.vue       # 递归菜单项组件  
├── Logo.vue              # 应用Logo组件
└── AppLink.vue           # 智能链接组件
```

## 核心组件详解

### Sidebar.vue - 主容器

侧边栏的根容器组件，负责整体布局、主题控制和菜单渲染。

#### 组件结构

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
```

#### 关键特性

**权限路由处理**
```typescript
const authorizedSidebarRoutes = computed<RouteRecordRaw[]>(() => 
  permissionStore.getSidebarRoutes()
)
```

**主题颜色管理**
```typescript
const menuBackgroundColor = computed(() => 
  currentSideTheme.value === SideTheme.Dark ? 
    variables.menuBackground : variables.menuLightBackground
)
```

**当前激活菜单**
```typescript
const currentActiveMenu = computed(() => {
  const { meta, path } = currentRoute
  
  // 优先使用路由meta中的activeMenu配置
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  
  return path
})
```

### SidebarItem.vue - 菜单项组件

递归渲染的菜单项组件，支持多级嵌套和复杂的权限控制。

#### 组件Props

```typescript
interface SidebarItemProps {
  /** 当前菜单项的路由配置对象 */
  item: RouteRecordRaw
  /** 是否为嵌套子菜单项 */
  isNest?: boolean
  /** 父级路径前缀 */
  basePath?: string
}
```

#### 菜单渲染逻辑

**单级菜单渲染**
```vue
<template v-if="shouldRenderAsSingleItem && (!singleChildRoute.children || singleChildRoute.noShowingChildren) && !menuItem.alwaysShow">
  <AppLink v-if="singleChildRoute.meta" :to="buildRoutePath(singleChildRoute.path, singleChildRoute.query)">
    <el-menu-item :index="buildRoutePath(singleChildRoute.path)" :class="{ 'submenu-title-noDropdown': !isNestedItem }">
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
```

**多级菜单渲染**
```vue
<el-sub-menu v-else ref="subMenuRef" :index="buildRoutePath(menuItem.path)" teleported>
  <template v-if="menuItem.meta" #title>
    <Icon class="menu-item-icon" :class="stateStore.sidebar.opened ? '' : 'ml-[20px]'" :code="menuItem.meta ? menuItem.meta.icon : ''" />
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
```

#### 核心方法

**国际化标题处理**
```typescript
const getLocalizedMenuTitle = (item: any): string => {
  const meta = item?.meta
  const name = item?.name

  // 优先使用国际化键
  if (meta?.i18nKey) {
    const translatedTitle = t(meta.i18nKey)
    if (translatedTitle !== meta.i18nKey) {
      return translatedTitle
    }
  }

  // 使用名称转换的标题或者原始标题
  return t(nameToTitle(name), meta.title)
}
```

**单子菜单判断**
```typescript
const hasOnlyOneVisibleChild = (parentRoute: RouteRecordRaw, childRoutes?: RouteRecordRaw[]): boolean => {
  const children = childRoutes || []
  
  // 过滤出所有可显示的子路由
  const visibleChildren = children.filter((child) => {
    if (child.hidden) return false
    singleChildRoute.value = child
    return true
  })

  // 只有一个可见子路由时，直接显示该子路由
  if (visibleChildren.length === 1) {
    return true
  }

  return false
}
```

### Logo.vue - 应用标识

显示应用Logo和标题的组件，支持折叠状态的动态切换。

#### 组件结构

```vue
<template>
  <!-- 侧边栏Logo容器 -->
  <div class="sidebar-logo-container" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Logo切换动画 -->
    <transition :enter-active-class="logoTransition.enter" mode="out-in">
      <!-- 折叠状态：仅显示Logo图标 -->
      <router-link v-if="isCollapsed" key="collapsed" class="sidebar-logo-link" to="/" :title="appTitle">
        <img v-if="hasLogo" :src="logoImageSrc" :alt="appTitle" class="sidebar-logo" />
        <h1 v-else class="sidebar-title collapsed-title" :style="titleStyle">
          {{ appTitleFirstChar }}
        </h1>
      </router-link>

      <!-- 展开状态：显示Logo图标+标题 -->
      <router-link v-else key="expanded" class="sidebar-logo-link" to="/" :title="appTitle">
        <img v-if="hasLogo" :src="logoImageSrc" :alt="appTitle" class="sidebar-logo" />
        <h1 class="sidebar-title expanded-title" :style="titleStyle">
          {{ appTitle }}
        </h1>
      </router-link>
    </transition>
  </div>
</template>
```

#### 关键特性

**响应式Logo显示**
```typescript
const isCollapsed = computed(() => props.collapse)
const appTitle = computed(() => 'ryplus-uni')
const appTitleFirstChar = computed(() => appTitle.value.charAt(0).toUpperCase())
const hasLogo = computed(() => Boolean(logoImage))
```

### AppLink.vue - 智能链接

处理内部路由和外部链接的统一组件，提供灵活的链接跳转功能。

#### 组件Props

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
```

#### 智能渲染逻辑

```typescript
// 判断是否为外部链接
const isExternalLink = computed(() => {
  return typeof props.to === 'string' && isExternal(props.to)
})

// 渲染的组件类型
const linkComponentType = computed(() => {
  if (props.disabled) return 'span'
  return isExternalLink.value ? 'a' : 'router-link'
})
```

## 主题系统

### CSS变量架构

侧边栏使用完整的CSS变量系统支持主题切换：

```scss
:root {
  // 菜单背景色
  --menu-bg: #304156;
  --menu-light-bg: #ffffff;
  
  // 菜单文字色
  --menu-text: #bfcbd9;
  --menu-light-text: #303133;
  
  // 菜单悬停色
  --menu-hover-color: #263445;
  --menu-hover-text-color: #ffffff;
}
```

### 主题切换机制

```typescript
// 深色主题
const isDarkTheme = computed(() => 
  currentSideTheme.value === 'theme-dark'
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

## 权限控制

### 路由权限过滤

```typescript
// 获取用户有权限访问的侧边栏路由列表
const authorizedSidebarRoutes = computed<RouteRecordRaw[]>(() => 
  permissionStore.getSidebarRoutes()
)
```

### 菜单项权限判断

```typescript
// 在SidebarItem中的权限检查
<template v-if="!menuItem.hidden">
  <!-- 只渲染未被隐藏的菜单项 -->
</template>
```

## 响应式适配

### 折叠状态管理

```typescript
const isSidebarCollapsed = computed(() => !stateStore.sidebar.opened)
```

### 移动端适配

```scss
.sidebar-container {
  @media (max-width: 768px) {
    &.mobile {
      position: fixed;
      height: 100%;
      z-index: 998;
      
      &.hideSidebar {
        transform: translate3d(-$sideBarWidth, 0, 0);
      }
    }
  }
}
```

## 使用示例

### 基本配置

```typescript
// 路由配置示例
const routes = [
  {
    path: '/system',
    component: Layout,
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
      }
    ]
  }
]
```

### 菜单权限控制

```typescript
// 权限路由配置
{
  path: '/admin',
  meta: {
    title: '管理员功能',
    icon: 'admin',
    roles: ['admin'] // 只有admin角色可见
  }
}
```

### 外部链接配置

```typescript
{
  path: 'https://github.com',
  meta: {
    title: 'GitHub',
    icon: 'github'
  }
}
```

## 最佳实践

### ✅ 推荐做法

1. **合理的菜单层级**
   ```typescript
   // 建议最多3级菜单
   parent -> child -> grandchild
   ```

2. **语义化的路由命名**
   ```typescript
   {
     path: 'user-management',
     name: 'UserManagement',
     meta: { title: '用户管理' }
   }
   ```

3. **国际化支持**
   ```typescript
   {
     meta: {
       title: '用户管理',
       i18nKey: 'menu.user.management'
     }
   }
   ```

### ❌ 避免做法

1. **过深的菜单嵌套**
   ```typescript
   // ❌ 避免超过3级的深度嵌套
   parent -> child -> grandchild -> great-grandchild
   ```

2. **硬编码的权限判断**
   ```vue
   <!-- ❌ 硬编码权限 -->
   <el-menu-item v-if="userRole === 'admin'">
   
   <!-- ✅ 使用权限系统 -->
   <el-menu-item v-if="hasPermission('admin:user:list')">
   ```

## 故障排除

### 常见问题

1. **菜单不显示**
    - 检查路由权限配置
    - 确认 `hidden: true` 设置
    - 验证用户角色权限

2. **主题样式异常**
    - 检查CSS变量是否正确定义
    - 确认主题Store状态
    - 验证样式优先级

3. **国际化不生效**
    - 检查 `i18nKey` 配置
    - 确认语言包文件
    - 验证翻译函数调用

## 总结

侧边栏系统通过四个核心组件的协作，提供了功能完整、体验流畅的导航解决方案。系统支持多级菜单、权限控制、主题切换、国际化等企业级功能，是构建现代化后台管理系统的重要基础。
