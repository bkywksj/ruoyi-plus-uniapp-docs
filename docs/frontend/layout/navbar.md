# 顶部导航(NavBar)系统

## 简介

顶部导航系统是后台管理界面的重要组成部分，提供了丰富的导航功能和工具集。该系统由核心导航组件和丰富的工具组件构成，支持水平导航、面包屑导航、全局搜索、通知消息等功能，为用户提供便捷高效的操作体验。

## 组件架构

```
Navbar/
├── Navbar.vue              # 导航栏主容器
├── TopNav.vue              # 水平导航菜单
├── Breadcrumb.vue          # 面包屑导航
├── Hamburger.vue           # 汉堡菜单按钮
└── tools/                  # 导航工具集
    ├── DocLink.vue         # 文档链接
    ├── FullscreenToggle.vue # 全屏切换
    ├── GitLink.vue         # Git链接
    ├── LangSelect.vue      # 语言选择
    ├── NavbarSearch.vue    # 导航搜索
    ├── Notice.vue          # 通知消息
    ├── SizeSelect.vue      # 尺寸选择
    ├── TenantSelect.vue    # 租户选择
    └── UserDropdown.vue    # 用户下拉菜单
```

## 核心组件详解

### Navbar.vue - 主容器

导航栏的根组件，统筹管理所有导航元素和工具组件的布局和交互。

#### 组件结构

```vue
<template>
  <div class="h-50px w-full flex items-center justify-between shadow-md">
    <!-- 左侧区域：汉堡菜单 + 面包屑/TopNav -->
    <div class="h-full flex items-center">
      <!-- 汉堡菜单按钮 -->
      <Hamburger :is-active="stateStore.sidebar.opened" @toggle-click="toggleSideBar" />

      <!-- 根据模式显示面包屑或顶部导航 -->
      <TopNav v-if="themeStore.topNav" />
      <Breadcrumb v-else />
    </div>

    <!-- 右侧工具栏 - 始终在右侧 -->
    <div class="h-full flex items-center">
      <template v-if="stateStore.device !== 'mobile'">
        <!-- 核心功能区 -->
        <TenantSelect v-if="width > 1200" @tenant-change="onTenantChange" />
        <NavbarSearch />

        <!-- 通知区 -->
        <Notice />

        <!-- 显示偏好区 -->
        <FullscreenToggle />
        <LangSelect />
        <SizeSelect />

        <!-- 外部链接区 -->
        <DocLink />
        <GitLink />
      </template>

      <!-- 用户头像和下拉菜单 -->
      <UserDropdown :is-dynamic-tenant="isDynamicTenant" @set-layout="setLayout" />
    </div>
  </div>
</template>
```

#### 响应式布局策略

```typescript
const { width } = useWindowSize()

// 租户选择只在大屏幕显示
<TenantSelect v-if="width > 1200" />

// 移动端隐藏大部分工具
<template v-if="stateStore.device !== 'mobile'">
```

#### 事件处理

```typescript
// 切换侧边栏
const toggleSideBar = () => {
  stateStore.toggleSideBar(false)
}

// 租户变化事件处理
const onTenantChange = (dynamic: boolean) => {
  isDynamicTenant.value = dynamic
}
```

### TopNav.vue - 水平导航菜单

提供水平布局的导航菜单，支持菜单项的动态显示和折叠。

#### 核心特性

**动态菜单数量计算**
```typescript
const setVisibleNumber = (): void => {
  const clientWidth = document.body.getBoundingClientRect().width
  if (clientWidth > 1600) {
    visibleNumber.value = 5
  } else if (clientWidth > 1400) {
    visibleNumber.value = 4
  } else if (clientWidth > 1000) {
    visibleNumber.value = sidebar ? 1 : 2
  } else {
    visibleNumber.value = 1
  }
}
```

**菜单结构处理**
```typescript
// 顶部菜单列表（过滤隐藏菜单，处理根路径）
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
```

### Breadcrumb.vue - 面包屑导航

显示当前页面的层级路径，帮助用户了解当前位置。

#### 核心算法

```typescript
const breadcrumbData = computed(() => {
  if (route.path.startsWith('/redirect/')) return []

  let matched: any[] = []
  const pathNum = findPathNum(route.path)

  // 处理多级菜单路径
  if (pathNum > 2) {
    const pathList = route.path.match(/\/\w+/gi)?.map((item, index) => 
      (index !== 0 ? item.slice(1) : item)) || []
    getMatched(pathList, permissionStore.defaultRoutes, matched)
  } else {
    // 使用常规路由匹配
    matched = route.matched.filter((item) => item.meta?.title)
  }

  // 判断是否为首页
  if (!isDashboard(matched[0])) {
    matched = [{ path: '/index', meta: { title: '首页', i18nKey: 'menu.index' } }].concat(matched)
  }

  return matched.filter((item) => item.meta && item.meta.title && item.meta.breadcrumb !== false)
})
```

### Hamburger.vue - 汉堡菜单按钮

控制侧边栏展开收起的按钮组件。

```vue
<template>
  <div class="h-full w-[50px] flex-center cursor-pointer duration-300 hover:bg-gray-100" @click="toggleClick">
    <Icon code="hamburger" class="text-[16px] transition-transform duration-300" 
          :class="isActive ? 'scale-x-[-1]' : ''" />
  </div>
</template>

<script setup lang="ts">
interface HamburgerProps {
  isActive?: boolean
}

const emit = defineEmits(['toggleClick'])

const toggleClick = () => {
  emit('toggleClick')
}
</script>
```

## 工具组件详解

### NavbarSearch.vue - 导航搜索

提供全局菜单搜索功能，支持模糊匹配和快捷跳转。

#### 搜索引擎配置

**Fuse.js 搜索引擎初始化**
```typescript
const initFuse = (list: RouterItem[]) => {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: [
      {
        name: 'title',
        weight: 0.7
      },
      {
        name: 'path',
        weight: 0.3
      }
    ]
  })
}
```

#### 搜索功能实现

```typescript
const querySearch = (query: string) => {
  if (query !== '' && fuse.value) {
    options.value = fuse.value.search(query)
  } else {
    options.value = []
  }
}

const handleSelect = (val: RouterItem) => {
  if (!val) return

  try {
    if (isHttp(val.path)) {
      window.open(val.path, '_blank')
    } else {
      if (val.query) {
        router.push({ path: val.path, query: JSON.parse(val.query) })
      } else {
        router.push(val.path)
      }
    }
  } catch (error) {
    console.error('路由跳转失败:', error)
  }

  closeSearch()
}
```

### Notice.vue - 通知消息

显示系统通知和消息的组件，支持未读数量提醒和消息详情查看。

```typescript
const loadNoticeList = async () => {
  isLoading.value = true
  const [err, data] = await pageUserNotices(queryParams.value)
  if (!err) {
    noticeList.value = data.records || []
    total.value = data.total || 0
  }
  isLoading.value = false
}

// 使用全局未读数量
const unreadCount = globalUnreadCount
```

### LangSelect.vue - 语言选择

支持多语言切换的下拉选择组件。

```typescript
const handleLanguageChange = (lang: LanguageCode) => {
  setLanguage(lang)
  showMsgSuccess(messages[lang] || '切换语言成功！')
}
```

### FullscreenToggle.vue - 全屏切换

提供全屏模式切换功能。

```typescript
const { isFullscreen, toggle } = useFullscreen()
```

### SizeSelect.vue - 尺寸选择

允许用户选择界面元素的显示尺寸。

```typescript
const handleSetSize = (size: ElSize) => {
  stateStore.setSize(size)
  showMsgSuccess(t('navbar.sizeChangeSuccess'))
}
```

### TenantSelect.vue - 租户选择

多租户系统的租户切换组件。

```typescript
const handleTenantSelect = async (tenantId: string): Promise<void> => {
  if (!tenantId) return

  const [switchErr] = await switchToDynamicTenant(tenantId)
  if (switchErr) {
    selectedTenantId.value = undefined
    return
  }
  await refreshPage()
}
```

### UserDropdown.vue - 用户下拉菜单

用户相关操作的下拉菜单组件。

```vue
<template>
  <el-dropdown trigger="click" @command="handleDropdownCommand">
    <div class="flex items-center cursor-pointer">
      <img class="w-10 h-10 rounded-md object-cover" :src="userAvatar" />
      <el-icon class="ml-1 text-xs">
        <CaretBottom />
      </el-icon>
    </div>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-if="!isDynamicTenant" command="profile">
          <Icon code="user" class="mr-2" />
          {{ t('navbar.personalCenter') }}
        </el-dropdown-item>

        <el-dropdown-item v-if="isLayoutSettingVisible" command="setLayout">
          <Icon code="theme" class="mr-2" />
          {{ t('navbar.layoutSetting') }}
        </el-dropdown-item>

        <el-dropdown-item divided command="logout">
          <Icon code="logout" class="mr-2" />
          {{ t('navbar.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
```

### DocLink.vue / GitLink.vue - 外部链接

提供文档和代码仓库的快捷访问。

```typescript
const gotoDoc = () => {
  window.open(SystemConfig.services.docUrl)
}

const gotoGit = () => {
  window.open(SystemConfig.services.gitUrl)
}
```

## 响应式适配

### 移动端优化

```typescript
// 移动端隐藏大部分工具
<template v-if="stateStore.device !== 'mobile'">
  <!-- 工具组件 -->
</template>

// 宽度阈值控制
<TenantSelect v-if="width > 1200" />
```

### 动态布局调整

```typescript
// 根据屏幕宽度调整菜单数量
const setVisibleNumber = (): void => {
  const clientWidth = document.body.getBoundingClientRect().width
  // 动态计算可显示菜单数量
}
```

## 最佳实践

### 推荐做法

1. **响应式优先**
   ```vue
   <template v-if="stateStore.device !== 'mobile'">
     <!-- 桌面端工具 -->
   </template>
   ```

2. **权限控制**
   ```vue
   <TenantSelect v-if="isSuperAdmin && tenantEnabled" />
   ```

3. **国际化支持**
   ```typescript
   const { t } = useI18n()
   :content="t('navbar.searchMenu')"
   ```

### 避免做法

1. **硬编码尺寸**
   ```scss
   /* ❌ 硬编码 */
   .navbar { width: 1200px; }
   
   /* ✅ 响应式 */
   .navbar { width: 100%; }
   ```

2. **忽略权限控制**
   ```vue
   <!-- ❌ 无权限控制 -->
   <AdminTool />
   
   <!-- ✅ 权限控制 -->
   <AdminTool v-if="hasAdminPermission" />
   ```

## 自定义开发

### 添加新工具组件

1. **创建工具组件**
   ```vue
   <!-- CustomTool.vue -->
   <template>
     <el-tooltip content="自定义工具">
       <div class="navbar-tool-item" @click="handleClick">
         <Icon code="custom" />
       </div>
     </el-tooltip>
   </template>
   ```

2. **集成到Navbar**
   ```vue
   <CustomTool />
   ```

## 故障排除

### 常见问题

1. **搜索无结果**
    - 检查路由权限配置
    - 确认搜索索引生成
    - 验证Fuse.js配置

2. **工具组件不显示**
    - 检查响应式条件
    - 确认权限配置
    - 验证设备类型检测

3. **主题样式异常**
    - 检查CSS变量定义
    - 确认主题Store状态
    - 验证样式优先级

## 总结

顶部导航系统通过主容器和丰富的工具组件，为用户提供了全面的导航和操作功能。系统支持响应式适配、权限控制、主题切换等企业级特性，是构建现代化后台管理系统的重要组成部分。
