# 状态管理概览

## 介绍

RuoYi-Plus-UniApp 前端项目采用 Pinia 作为官方状态管理方案,基于 Composition API 风格组织代码,提供类型安全的全局状态管理。Pinia 是 Vue 3 官方推荐的状态管理库,相比传统的 Vuex,它提供了更简洁的 API、更好的 TypeScript 支持、更灵活的模块化设计,以及更小的体积和更优的性能。

本项目的状态管理架构遵循模块化、类型安全、职责单一的设计原则,将应用状态按照业务领域划分为多个独立的 Store 模块,每个模块专注于特定的功能领域,通过统一的 API 提供状态访问和操作方法。

**核心特性:**

- **Composition API 风格** - 使用 `defineStore` + 组合式函数风格,代码结构清晰,易于维护和测试
- **完整的 TypeScript 支持** - 所有 Store 模块都提供完整的类型定义,实现编译时类型检查和智能提示
- **模块化设计** - 按照业务领域划分为 7 个核心模块,职责清晰,易于扩展
- **灵活的持久化策略** - 支持基于 localStorage 的状态持久化,可按需配置持久化策略
- **跨 Store 协作** - 支持在不同 Store 之间相互调用,实现复杂的业务逻辑
- **统一的错误处理** - 采用 Result 模式处理异步操作,统一错误处理流程
- **响应式数据流** - 基于 Vue 3 响应式系统,自动追踪依赖,高效更新视图

## 架构设计

### Pinia 实例创建

项目在 `src/stores/store.ts` 中创建全局 Pinia 实例,在应用启动时注册到 Vue 应用:

```typescript
// src/stores/store.ts
import { createPinia } from 'pinia'

// 创建一个 pinia 存储实例
const store = createPinia()

// 导出这个存储实例以便在应用程序的其他部分使用
export default store
```

在 `main.ts` 中注册:

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import store from './stores/store'

const app = createApp(App)
app.use(store)
app.mount('#app')
```

### Store 模块划分

项目状态管理模块按照业务领域划分为以下 7 个核心模块:

```
stores/
├── store.ts          # Pinia 实例创建
└── modules/
    ├── user.ts           # 用户认证与权限
    ├── permission.ts     # 路由权限管理
    ├── dict.ts           # 字典数据管理
    ├── notice.ts         # 通知消息管理
    ├── feature.ts        # 系统功能配置管理
    └── aiChat.ts         # AI 聊天管理
```

每个模块都遵循统一的代码组织结构:

```typescript
/**
 * 模块文档注释
 * 包含功能说明、职责描述、使用示例
 */

/** 模块名称常量 */
const MODULE_NAME = 'moduleName'

/** 类型定义 */
export interface ModuleState {
  // 状态类型定义
}

/** 导出 Store */
export const useModuleStore = defineStore(MODULE_NAME, () => {
  // 响应式状态
  const state = ref<ModuleState>()

  // 计算属性
  const getter = computed(() => {
    return state.value
  })

  // 业务方法
  const action = async (): Result<void> => {
    // 异步操作实现
  }

  // 统一导出
  return {
    // 状态
    state,
    // 计算属性
    getter,
    // 方法
    action
  }
})
```

## 设计原则

### 1. 模块化组织

每个 Store 负责独立的业务领域,职责单一,相互解耦。这种设计带来以下优势:

- **职责清晰**: 每个模块只处理特定领域的状态和逻辑
- **易于维护**: 修改某个功能时只需关注对应的 Store 模块
- **便于测试**: 可以独立测试每个 Store 模块的功能
- **支持懒加载**: 可以按需导入需要的 Store 模块

示例:

```typescript
// user.ts - 只负责用户认证相关
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)
  const roles = ref([])
  const permissions = ref([])

  return { token, userInfo, roles, permissions }
})

// permission.ts - 只负责路由权限相关
export const usePermissionStore = defineStore('permission', () => {
  const routes = ref([])
  const sidebarRouters = ref([])

  return { routes, sidebarRouters }
})
```

### 2. Composition API 风格

采用 Composition API 风格定义 Store,使用 `ref`、`computed`、`watch` 等组合式 API,代码结构清晰,更接近 Vue 3 组件的开发方式:

```typescript
export const useExampleStore = defineStore('example', () => {
  // 响应式状态 - 使用 ref
  const count = ref(0)
  const name = ref('admin')

  // 计算属性 - 使用 computed
  const doubleCount = computed(() => count.value * 2)
  const displayName = computed(() => `用户: ${name.value}`)

  // 业务方法 - 普通函数
  const increment = () => {
    count.value++
  }

  const updateName = (newName: string) => {
    name.value = newName
  }

  // 异步方法
  const fetchData = async (): Result<void> => {
    const [err, data] = await api.getData()
    if (err) return [err, null]
    // 更新状态
    return [null, null]
  }

  // 统一导出
  return {
    // 状态
    count,
    name,
    // 计算属性
    doubleCount,
    displayName,
    // 方法
    increment,
    updateName,
    fetchData
  }
})
```

### 3. TypeScript 类型支持

所有 Store 模块都提供完整的类型定义,确保类型安全和开发体验:

- **完整的类型定义和接口声明**: 为状态、参数、返回值提供详细的类型注解
- **自动的类型推导和智能提示**: 利用 TypeScript 的类型推导,提供准确的代码补全
- **编译时类型检查**: 在编译阶段发现类型错误,减少运行时错误

示例:

```typescript
/**
 * 用户信息接口
 */
export interface SysUserVo {
  userId: number
  userName: string
  nickName: string
  email: string
  phoneNumber: string
  sex: string
  avatar: string
  status: string
  delFlag: string
  loginIp: string
  loginDate: string
  createTime: string
  remark: string
}

/**
 * 登录请求接口
 */
export interface LoginRequest {
  userName: string
  password: string
  code: string
  uuid: string
}

export const useUserStore = defineStore('user', () => {
  // 使用类型注解
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<Array<string>>([])
  const permissions = ref<Array<string>>([])

  // 参数和返回值都有类型
  const loginUser = async (loginRequest: LoginRequest): Result<void> => {
    // 实现
  }

  return {
    userInfo,
    roles,
    permissions,
    loginUser
  }
})
```

### 4. 持久化策略

项目采用灵活的持久化策略,不同的数据根据业务需求选择合适的持久化方式:

- **Token 管理**: 使用专门的 `useToken` 工具类管理,支持 localStorage 持久化
- **用户信息**: 登录后从服务器获取,不持久化,通过 Token 重新获取
- **主题配置**: 使用 `localCache` 工具持久化到 localStorage
- **应用状态**: 部分状态(如侧边栏折叠状态)自动同步到 localStorage
- **临时数据**: 字典、通知等数据仅存储在内存中,页面刷新后重新加载

示例:

```typescript
// Token 持久化 - 使用专门的工具类
import { useToken } from '@/composables/useToken'

export const useUserStore = defineStore('user', () => {
  const tokenUtils = useToken()
  const token = ref(tokenUtils.getToken())

  const loginUser = async (loginRequest: LoginRequest): Result<void> => {
    const [err, data] = await userLogin(loginRequest)
    if (err) return [err, null]

    // 保存到 localStorage 和 store
    tokenUtils.setToken(data.access_token, data.expire_in)
    token.value = data.access_token

    return [null, null]
  }

  return { token, loginUser }
})
```

### 5. Result 模式错误处理

项目采用 Result 模式处理异步操作,统一错误处理流程,避免 try-catch 嵌套:

```typescript
/**
 * Result 类型定义
 * [error, data] 元组
 * - error 为 null 时表示成功,data 包含结果
 * - error 不为 null 时表示失败,data 为 null
 */
type Result<T> = [Error | null, T | null]

// 在 Store 中使用
export const useUserStore = defineStore('user', () => {
  const fetchUserInfo = async (): Result<void> => {
    // 调用 API,返回 Result 类型
    const [err, data] = await getUserInfo()

    // 错误处理
    if (err) {
      console.error('获取用户信息失败:', err)
      return [err, null]
    }

    // 成功处理
    userInfo.value = data.user
    roles.value = data.roles
    permissions.value = data.permissions

    return [null, null]
  }

  return { fetchUserInfo }
})

// 在组件中使用
const handleGetUserInfo = async () => {
  const [err] = await userStore.fetchUserInfo()
  if (err) {
    ElMessage.error('获取用户信息失败')
    return
  }
  ElMessage.success('获取成功')
}
```

## 核心 Store 模块详解

### 1. User Store (用户认证与权限)

用户认证管理模块,负责用户登录、注销、用户信息获取、权限管理等核心认证功能。

#### 状态定义

```typescript
export const useUserStore = defineStore('user', () => {
  /**
   * 用户令牌
   * 用户登录后的访问令牌,用于 API 请求认证
   */
  const token = ref(tokenUtils.getToken())

  /**
   * 用户基本信息
   * 用户的基本信息(账号、昵称、头像等)
   */
  const userInfo = ref<SysUserVo | null>(null)

  /**
   * 用户角色编码集合
   * 用于判断路由权限和功能权限
   */
  const roles = ref<Array<string>>([])

  /**
   * 用户权限编码集合
   * 用于判断按钮权限等细粒度权限控制
   */
  const permissions = ref<Array<string>>([])

  return {
    token,
    userInfo,
    roles,
    permissions
  }
})
```

#### 核心方法

**用户登录**

```typescript
const loginUser = async (loginRequest: LoginRequest): Result<void> => {
  const [err, data] = await userLogin(loginRequest)
  if (err) {
    return [err, null]
  }

  // 保存 token 到 localStorage 和 store
  tokenUtils.setToken(data.access_token, data.expire_in)
  token.value = data.access_token

  return [null, null]
}
```

**获取用户信息**

```typescript
const fetchUserInfo = async (): Result<void> => {
  const [err, data] = await getUserInfo()
  if (err) {
    return [err, null]
  }

  const user = data.user

  // 处理用户头像
  if (!user.avatar) {
    user.avatar = defAva
  }

  // 设置用户基本信息
  userInfo.value = user

  // 设置角色和权限
  roles.value = data.roles || []
  permissions.value = data.permissions || []

  return [null, null]
}
```

**用户注销**

```typescript
const logoutUser = async (): Result<void> => {
  // 调用注销 API
  const [err] = await userLogout()

  // 清除状态
  token.value = ''
  userInfo.value = null
  roles.value = []
  permissions.value = []

  // 移除 localStorage 中的 token
  tokenUtils.removeToken()

  return [err, null]
}
```

**更新用户头像**

```typescript
const updateAvatar = (avatarUrl: string): void => {
  if (userInfo.value) {
    userInfo.value.avatar = avatarUrl
  }
}
```

#### 使用示例

```vue
<template>
  <div class="user-info">
    <el-avatar :src="avatar" />
    <span>{{ nickname }}</span>
    <el-button @click="handleLogout">退出登录</el-button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 获取用户信息
const nickname = computed(() => userStore.userInfo?.nickName || '')
const avatar = computed(() => userStore.userInfo?.avatar || '')

// 退出登录
const handleLogout = async () => {
  const [err] = await userStore.logoutUser()
  if (err) {
    ElMessage.error('退出失败')
    return
  }

  // 跳转到登录页
  router.push('/login')
}

// 组件挂载时获取用户信息
onMounted(async () => {
  if (userStore.token && !userStore.roles.length) {
    await userStore.fetchUserInfo()
  }
})
</script>
```

### 2. Permission Store (路由权限管理)

权限路由管理模块,负责从后端获取路由配置,动态构建应用路由结构,并提供多布局路由管理功能。

#### 状态定义

```typescript
export const usePermissionStore = defineStore('permission', () => {
  /**
   * 路由记录
   * 所有路由配置的集合,包含静态路由和动态添加的路由
   */
  const routes = ref<RouteRecordRaw[]>([])

  /**
   * 动态添加的路由
   * 从后端获取并动态添加的路由配置
   */
  const addRoutes = ref<RouteRecordRaw[]>([])

  /**
   * 默认路由
   * 用于基础布局的路由配置
   */
  const defaultRoutes = ref<RouteRecordRaw[]>([])

  /**
   * 顶部栏路由
   * 用于顶部导航栏显示的路由配置
   */
  const topbarRouters = ref<RouteRecordRaw[]>([])

  /**
   * 侧边栏路由
   * 用于侧边栏菜单显示的路由配置
   */
  const sidebarRouters = ref<RouteRecordRaw[]>([])

  return {
    routes,
    addRoutes,
    defaultRoutes,
    topbarRouters,
    sidebarRouters
  }
})
```

#### 核心方法

**生成路由**

从后端获取路由数据并处理成可用的路由配置:

```typescript
const generateRoutes = async (): Result<RouteRecordRaw[]> => {
  // 从后端 API 获取路由数据
  const [err, data] = await getRouters()
  if (err) {
    return [err, null]
  }

  // 深拷贝路由数据用于不同处理场景
  const sdata = JSON.parse(JSON.stringify(data))
  const rdata = JSON.parse(JSON.stringify(data))
  const defaultData = JSON.parse(JSON.stringify(data))

  // 处理不同场景的路由格式
  const sidebarRoutes = filterAsyncRouter(sdata)
  const rewriteRoutes = filterAsyncRouter(rdata, undefined, true)
  const defaultRoutes = filterAsyncRouter(defaultData)

  // 处理动态权限路由
  const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
  asyncRoutes.forEach((route) => {
    router.addRoute(route)
  })

  // 设置各类路由到 store
  setRoutes(rewriteRoutes)
  setSidebarRouters(constantRoutes.concat(sidebarRoutes))
  setDefaultRoutes(sidebarRoutes)
  setTopbarRoutes(defaultRoutes)

  // 路由 name 重复检查,避免 404 问题
  duplicateRouteChecker(asyncRoutes, sidebarRoutes)

  return [null, rewriteRoutes]
}
```

**过滤异步路由**

将后台传来的路由字符串转换为组件对象:

```typescript
const filterAsyncRouter = (
  asyncRouterMap: RouteRecordRaw[],
  lastRouter?: RouteRecordRaw,
  type = false
): RouteRecordRaw[] => {
  return asyncRouterMap.filter((route) => {
    if (type && route.children) {
      route.children = filterChildren(route.children, undefined)
    }

    // Layout ParentView 组件特殊处理
    if (route.component?.toString() === 'Layout') {
      route.component = Layout
    } else if (route.component?.toString() === 'ParentView') {
      route.component = ParentView
    } else if (route.component?.toString() === 'InnerLink') {
      route.component = InnerLink
    } else {
      route.component = loadView(route.component, route.name as string)
    }

    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route.children
      delete route.redirect
    }

    return true
  })
}
```

**动态路由权限过滤**

遍历动态路由,验证是否具备权限:

```typescript
const filterDynamicRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = []
  const { hasPermission, hasRole } = useAuth()

  routes.forEach((route) => {
    if (route.permissions) {
      // 检查是否有任一所需权限
      if (hasPermission(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      // 检查是否有任一所需角色
      if (hasRole(route.roles)) {
        res.push(route)
      }
    }
  })

  return res
}
```

#### 使用示例

```vue
<template>
  <el-menu :default-active="activeMenu" mode="horizontal">
    <sidebar-item
      v-for="route in topbarRouters"
      :key="route.path"
      :item="route"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { usePermissionStore } from '@/stores/modules/permission'
import { useRoute } from 'vue-router'

const permissionStore = usePermissionStore()
const route = useRoute()

// 获取顶部导航栏路由
const topbarRouters = computed(() => permissionStore.getTopbarRoutes())

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 在路由守卫中生成路由
import { useRouter } from 'vue-router'

const router = useRouter()

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  if (userStore.token) {
    // 已登录,检查是否已生成路由
    if (permissionStore.routes.length === 0) {
      // 获取用户信息
      await userStore.fetchUserInfo()

      // 生成路由
      const [err] = await permissionStore.generateRoutes()
      if (err) {
        ElMessage.error('获取路由失败')
        next('/login')
        return
      }

      // 重定向到目标路由
      next({ ...to, replace: true })
    } else {
      next()
    }
  } else {
    // 未登录,跳转登录页
    next('/login')
  }
})
</script>
```

### 3. Dict Store (字典数据管理)

字典数据管理模块,提供统一的字典数据存储、访问和转换功能,用于下拉选项、数据映射等场景。

#### 状态定义

```typescript
export const useDictStore = defineStore('dict', () => {
  /**
   * 字典数据集合
   * 使用 Map 存储多个字典数据,key 为字典类型,value 为字典选项数组
   * @example
   * {
   *   'sys_user_gender': [
   *     { label: '男', value: '0' ... },
   *     { label: '女', value: '1' ... }
   *   ],
   *   'sys_enable_status': [
   *     { label: '正常', value: '0' ... },
   *     { label: '停用', value: '1' ... }
   *   ]
   * }
   */
  const dict = ref<Map<string, DictItem[]>>(new Map())

  return { dict }
})
```

#### 核心方法

**获取字典**

```typescript
const getDict = (key: string): DictItem[] | null => {
  if (!key) {
    return null
  }
  return dict.value.get(key) || null
}
```

**设置字典**

```typescript
const setDict = (key: string, value: DictItem[]): boolean => {
  if (!key) {
    return false
  }
  try {
    dict.value.set(key, value)
    return true
  } catch (e) {
    console.error('设置字典时发生错误:', e)
    return false
  }
}
```

**获取字典标签**

根据字典类型或字典数据和值获取标签:

```typescript
const getDictLabel = (
  keyOrData: string | Ref<DictItem[]> | DictItem[],
  value: string | number
): string => {
  let dictData: Ref<DictItem[]> | undefined

  if (typeof keyOrData === 'string') {
    dictData = ref(getDict(keyOrData))
  } else if (isRef(keyOrData)) {
    dictData = keyOrData
  } else {
    dictData = ref(keyOrData)
  }

  if (!dictData) return ''
  const item = dictData.value.find((item) => item.value === String(value))
  return item ? item.label : ''
}
```

**批量获取字典标签**

```typescript
const getDictLabels = (
  keyOrData: string | Ref<DictItem[]>,
  values: (string | number)[]
): string[] => {
  if (!values || values.length === 0) return []

  let dictData: Ref<DictItem[]> | undefined

  if (typeof keyOrData === 'string') {
    dictData = ref(getDict(keyOrData))
  } else {
    dictData = keyOrData
  }

  if (!dictData) return values.map(() => '')

  return values.map((value) => {
    const item = dictData.value.find((item) => item.value === value)
    return item ? item.label : ''
  })
}
```

#### 使用示例

```vue
<template>
  <el-form :model="form">
    <el-form-item label="性别">
      <el-select v-model="form.gender">
        <el-option
          v-for="item in genderDict"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="状态">
      <span>{{ statusLabel }}</span>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { getDict } from '@/api/system/dict/data'

const dictStore = useDictStore()

const form = ref({
  gender: '0',
  status: '1'
})

// 获取性别字典
const genderDict = computed(() => dictStore.getDict('sys_user_gender'))

// 获取状态标签
const statusLabel = computed(() =>
  dictStore.getDictLabel('sys_enable_status', form.value.status)
)

// 初始化字典数据
onMounted(async () => {
  // 加载性别字典
  const [err1, genderData] = await getDict('sys_user_gender')
  if (!err1) {
    dictStore.setDict('sys_user_gender', genderData)
  }

  // 加载状态字典
  const [err2, statusData] = await getDict('sys_enable_status')
  if (!err2) {
    dictStore.setDict('sys_enable_status', statusData)
  }
})
</script>
```

### 4. Notice Store (通知消息管理)

通知管理中心模块,提供系统通知的集中存储和处理能力。

#### 状态定义

```typescript
/**
 * 通知项接口
 */
interface NoticeItem {
  title?: string
  read: boolean
  message: any
  time: string
}

export const useNoticeStore = defineStore('notice', () => {
  /**
   * 通知列表
   */
  const notices = ref<NoticeItem[]>([])

  return { notices }
})
```

#### 核心方法

**添加通知**

```typescript
const addNotice = (notice: NoticeItem): void => {
  notices.value.push(notice)
}
```

**移除通知**

```typescript
const removeNotice = (notice: NoticeItem): void => {
  const index = notices.value.indexOf(notice)
  if (index !== -1) {
    notices.value.splice(index, 1)
  }
}
```

**全部标记为已读**

```typescript
const readAll = () => {
  notices.value.forEach((item: NoticeItem) => {
    item.read = true
  })
}
```

**清空所有通知**

```typescript
const clearNotice = (): void => {
  notices.value = []
}
```

#### 使用示例

```vue
<template>
  <el-dropdown>
    <el-badge :value="unreadCount">
      <el-icon><Bell /></el-icon>
    </el-badge>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="notice in noticeStore.notices"
          :key="notice.time"
          @click="handleNoticeClick(notice)"
        >
          <div :class="{ 'is-read': notice.read }">
            <div class="title">{{ notice.title }}</div>
            <div class="message">{{ notice.message }}</div>
            <div class="time">{{ notice.time }}</div>
          </div>
        </el-dropdown-item>

        <el-dropdown-item divided>
          <el-button link @click="noticeStore.readAll()">全部已读</el-button>
          <el-button link @click="noticeStore.clearNotice()">清空通知</el-button>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useNoticeStore } from '@/stores/modules/notice'

const noticeStore = useNoticeStore()

// 未读通知数量
const unreadCount = computed(() =>
  noticeStore.notices.filter(n => !n.read).length
)

// 点击通知
const handleNoticeClick = (notice: NoticeItem) => {
  notice.read = true
  // 处理通知点击逻辑
}

// 模拟添加通知
const addNewNotice = () => {
  noticeStore.addNotice({
    title: '系统通知',
    read: false,
    message: '您有一条新消息',
    time: new Date().toLocaleString()
  })
}
</script>
```

### 5. Feature Store (系统功能配置管理)

系统功能配置管理模块,提供统一的功能开关管理,支持从服务端动态获取功能配置。

#### 状态定义

```typescript
export const useFeatureStore = defineStore('feature', () => {
  /**
   * 系统功能配置
   * 存储所有功能的启用状态
   */
  const features = ref<SystemFeature>({
    langchain4jEnabled: false,
    websocketEnabled: false,
    sseEnabled: false,
    openApiEnabled: false,
    openApiAccessMode: 'ALL',
    openApiAllowedRoles: []
  })

  /**
   * 配置是否已初始化
   */
  const initialized = ref(false)

  return {
    features,
    initialized
  }
})
```

#### 核心方法

**初始化功能配置**

从服务端获取功能配置,应在应用启动时调用一次:

```typescript
const initFeatures = async (): Promise<void> => {
  if (initialized.value) {
    return
  }

  const [err, data] = await getSystemFeatures()
  if (err) {
    features.value = {
      langchain4jEnabled: false,
      websocketEnabled: false,
      sseEnabled: false,
      openApiEnabled: false,
      openApiAccessMode: 'ALL',
      openApiAllowedRoles: []
    }
  } else {
    features.value = data
  }
  initialized.value = true
}
```

**检查 OpenAPI 访问权限**

检查当前用户是否可以使用开放 API:

```typescript
const canUseOpenApi = (userRoles: string[]): boolean => {
  if (!features.value.openApiEnabled) {
    return false
  }

  const mode = features.value.openApiAccessMode
  const allowedRoles = features.value.openApiAllowedRoles || []

  switch (mode) {
    case 'ALL':
      return true

    case 'SUPER_ADMIN':
      return userRoles.includes('superadmin')

    case 'ADMIN':
      return userRoles.includes('superadmin') || userRoles.includes('admin')

    case 'ROLES':
      if (allowedRoles.length === 0) {
        return false
      }
      return userRoles.some((role) => allowedRoles.includes(role))

    default:
      return false
  }
}
```

#### 使用示例

```vue
<template>
  <div>
    <!-- 根据功能开关显示不同内容 -->
    <div v-if="featureStore.features.websocketEnabled">
      <websocket-chat />
    </div>

    <div v-if="canShowOpenApi">
      <open-api-docs />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

// 检查是否可以显示 OpenAPI 文档
const canShowOpenApi = computed(() =>
  featureStore.canUseOpenApi(userStore.roles)
)

// 应用启动时初始化功能配置
onMounted(async () => {
  await featureStore.initFeatures()
})
</script>
```

### 6. AI Chat Store (AI 聊天管理)

AI 聊天数据管理模块,提供统一的会话管理和消息处理功能,支持 WebSocket 实时通信和流式响应。

#### 状态定义

```typescript
/**
 * AI 聊天消息接口
 */
export interface AiChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  references?: any[]
  status?: 'sending' | 'streaming' | 'complete' | 'error'
  error?: string
}

/**
 * AI 聊天会话接口
 */
export interface AiChatSession {
  id: string
  title: string
  messages: AiChatMessage[]
  createdAt: number
  updatedAt: number
  provider?: string
  modelName?: string
}

export const useAiChatStore = defineStore('aiChat', () => {
  /**
   * 会话集合
   * 使用 Map 存储多个会话,key 为会话 ID,value 为会话对象
   */
  const sessions = ref<Map<string, AiChatSession>>(new Map())

  /**
   * 当前活跃的会话 ID
   */
  const currentSessionId = ref<string | null>(null)

  /**
   * 当前正在流式生成的消息 ID
   */
  const streamingMessageId = ref<string | null>(null)

  /**
   * 流式内容缓冲区
   */
  const streamContentBuffer = ref<string>('')

  return {
    sessions,
    currentSessionId,
    streamingMessageId,
    streamContentBuffer
  }
})
```

#### 计算属性

```typescript
/**
 * 获取当前会话
 */
const currentSession = computed((): AiChatSession | null => {
  if (!currentSessionId.value) return null
  return sessions.value.get(currentSessionId.value) || null
})

/**
 * 获取当前会话的消息列表
 */
const currentMessages = computed((): AiChatMessage[] => {
  return currentSession.value?.messages || []
})

/**
 * 是否正在生成中
 */
const isGenerating = computed((): boolean => {
  return streamingMessageId.value !== null
})

/**
 * 获取所有会话列表(按更新时间倒序)
 */
const sessionList = computed((): AiChatSession[] => {
  return Array.from(sessions.value.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
})
```

#### 核心方法

**创建新会话**

```typescript
const createSession = (options?: {
  title?: string
  provider?: string
  modelName?: string
}): string => {
  const sessionId = generateSessionId()
  const now = Date.now()

  const newSession: AiChatSession = {
    id: sessionId,
    title: options?.title || `新对话 ${new Date().toLocaleString()}`,
    messages: [],
    createdAt: now,
    updatedAt: now,
    provider: options?.provider || 'deepseek',
    modelName: options?.modelName || 'deepseek-chat'
  }

  sessions.value.set(sessionId, newSession)
  currentSessionId.value = sessionId

  return sessionId
}
```

**发送消息到 AI**

```typescript
const sendMessage = (
  content: string,
  options?: {
    sessionId?: string
    provider?: string
    modelName?: string
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }
): boolean => {
  // 确保有会话
  let sessionId = options?.sessionId || currentSessionId.value
  if (!sessionId) {
    sessionId = createSession()
  }

  const session = sessions.value.get(sessionId)
  if (!session) {
    console.error(`会话不存在: ${sessionId}`)
    return false
  }

  // 添加用户消息
  const userMessage: AiChatMessage = {
    id: generateMessageId(),
    role: 'user',
    content: content,
    timestamp: Date.now(),
    status: 'complete'
  }
  session.messages.push(userMessage)

  // 添加一个空的助手消息,用于接收流式内容
  const assistantMessage: AiChatMessage = {
    id: '',
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
    status: 'sending'
  }
  session.messages.push(assistantMessage)
  streamingMessageId.value = sessionId
  streamContentBuffer.value = ''

  // 更新会话时间
  session.updatedAt = Date.now()

  // 通过 WebSocket 发送消息
  const request = {
    type: 'ai_chat',
    sessionId: sessionId,
    message: content,
    provider: options?.provider || session.provider || 'deepseek',
    modelName: options?.modelName || session.modelName || 'deepseek-chat',
    mode: 'CONTINUOUS',
    systemPrompt: options?.systemPrompt,
    temperature: options?.temperature,
    maxTokens: options?.maxTokens
  }

  const success = webSocket.send(request)
  if (!success) {
    assistantMessage.status = 'error'
    assistantMessage.error = 'WebSocket 未连接,无法发送消息'
    streamingMessageId.value = null
    return false
  }

  return true
}
```

**WebSocket 回调 - 追加流式内容**

```typescript
const appendStreamContent = (
  sessionId: string,
  messageId: string,
  content: string
): void => {
  const session = sessions.value.get(sessionId)
  if (!session) {
    console.error('AI聊天: 找不到 session')
    return
  }

  // 查找对应的消息
  let message = session.messages.find((msg) => msg.id === messageId)

  if (!message) {
    // 如果找不到,使用最后一条助手消息
    const assistantMessages = session.messages.filter(
      (msg) => msg.role === 'assistant'
    )
    message = assistantMessages[assistantMessages.length - 1]

    // 回填 messageId
    if (message && !message.id) {
      message.id = messageId
    }
  }

  if (message) {
    message.content += content
    message.status = 'streaming'

    // 强制触发响应式更新
    sessions.value.set(sessionId, { ...session })
  } else {
    // 追加到缓冲区
    streamContentBuffer.value += content
  }
}
```

#### 使用示例

```vue
<template>
  <div class="ai-chat">
    <!-- 会话列表 -->
    <div class="session-list">
      <el-button @click="createNewSession">新建对话</el-button>
      <div
        v-for="session in aiChatStore.sessionList"
        :key="session.id"
        :class="{ active: session.id === aiChatStore.currentSessionId }"
        @click="switchToSession(session.id)"
      >
        {{ session.title }}
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <div
        v-for="message in aiChatStore.currentMessages"
        :key="message.id"
        :class="['message', message.role]"
      >
        <div class="content">{{ message.content }}</div>
        <div v-if="message.status === 'streaming'" class="streaming-indicator">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="input-area">
      <el-input
        v-model="inputContent"
        type="textarea"
        :disabled="aiChatStore.isGenerating"
        @keydown.enter="handleSend"
      />
      <el-button
        type="primary"
        :loading="aiChatStore.isGenerating"
        @click="handleSend"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAiChatStore } from '@/stores/modules/aiChat'

const aiChatStore = useAiChatStore()
const inputContent = ref('')

// 创建新会话
const createNewSession = () => {
  aiChatStore.createSession({
    title: '新对话',
    provider: 'deepseek',
    modelName: 'deepseek-chat'
  })
}

// 切换会话
const switchToSession = (sessionId: string) => {
  aiChatStore.switchSession(sessionId)
}

// 发送消息
const handleSend = () => {
  if (!inputContent.value.trim() || aiChatStore.isGenerating) {
    return
  }

  aiChatStore.sendMessage(inputContent.value, {
    temperature: 0.7,
    maxTokens: 2000
  })

  inputContent.value = ''
}

// 初始化
onMounted(() => {
  if (aiChatStore.sessionList.length === 0) {
    createNewSession()
  }
})
</script>
```

## 使用规范

### 1. 在组件中使用 Store

在 Vue 组件中导入并使用 Store 模块:

```typescript
import { useUserStore } from '@/stores/modules/user'

export default defineComponent({
  setup() {
    const userStore = useUserStore()

    // 访问状态
    console.log(userStore.userInfo)

    // 调用方法
    await userStore.fetchUserInfo()

    // 使用计算属性访问状态
    const nickname = computed(() => userStore.userInfo?.nickName || '')

    return { nickname }
  }
})
```

使用 `<script lang="ts" setup>` 语法:

```vue
<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 访问状态
const userInfo = computed(() => userStore.userInfo)

// 调用方法
const handleFetchUserInfo = async () => {
  await userStore.fetchUserInfo()
}
</script>
```

### 2. 跨 Store 协作

在一个 Store 中使用另一个 Store:

```typescript
import { useUserStore } from '@/stores/modules/user'

export const usePermissionStore = defineStore('permission', () => {
  const generateRoutes = async (): Result<RouteRecordRaw[]> => {
    // 使用 useAuth Composable 获取权限信息
    const { hasPermission, hasRole } = useAuth()

    // 过滤路由
    routes.forEach((route) => {
      if (route.permissions && !hasPermission(route.permissions)) {
        // 移除无权限路由
      }
    })

    return [null, routes]
  }

  return { generateRoutes }
})
```

在组件中组合多个 Store:

```vue
<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import { useDictStore } from '@/stores/modules/dict'

const userStore = useUserStore()
const permissionStore = usePermissionStore()
const dictStore = useDictStore()

// 组合使用多个 Store
const initApp = async () => {
  // 1. 获取用户信息
  await userStore.fetchUserInfo()

  // 2. 生成路由
  await permissionStore.generateRoutes()

  // 3. 加载字典
  const [err, dictData] = await getDict('sys_user_gender')
  if (!err) {
    dictStore.setDict('sys_user_gender', dictData)
  }
}
</script>
```

### 3. 异步操作规范

统一使用 Result 类型处理异步结果,避免 try-catch 嵌套:

```typescript
// ✅ 推荐写法
const fetchData = async (): Result<Data> => {
  const [err, data] = await api.getData()
  if (err) {
    console.error('获取数据失败:', err)
    return [err, null]
  }

  // 处理数据
  state.value = data

  return [null, data]
}

// 在组件中使用
const handleFetch = async () => {
  const [err, data] = await store.fetchData()
  if (err) {
    ElMessage.error('操作失败')
    return
  }
  ElMessage.success('操作成功')
}
```

```typescript
// ❌ 不推荐写法
const fetchData = async () => {
  try {
    const data = await api.getData()
    state.value = data
    return data
  } catch (error) {
    console.error('获取数据失败:', error)
    throw error
  }
}

// 组件中需要再次 try-catch
const handleFetch = async () => {
  try {
    await store.fetchData()
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}
```

### 4. 响应式状态解构

由于 Pinia 的 Store 是响应式对象,直接解构会丢失响应性。使用 `storeToRefs` 保持响应性:

```typescript
// ❌ 错误写法 - 丢失响应性
const { userInfo, roles } = useUserStore()

// ✅ 正确写法 - 保持响应性
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { userInfo, roles } = storeToRefs(userStore)

// 方法可以直接解构
const { fetchUserInfo, logoutUser } = userStore
```

### 5. Store 重置

Pinia 提供 `$reset` 方法重置 Store 到初始状态:

```typescript
const userStore = useUserStore()

// 重置 Store
userStore.$reset()
```

对于 Composition API 风格的 Store,需要手动实现重置逻辑:

```typescript
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)
  const roles = ref([])
  const permissions = ref([])

  // 重置方法
  const reset = () => {
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    reset
  }
})
```

## 最佳实践

### 1. 避免直接修改状态

通过定义的方法修改状态,而不是直接修改:

```typescript
// ❌ 不推荐 - 直接修改
userStore.userInfo.nickName = '新昵称'

// ✅ 推荐 - 通过方法修改
const updateNickName = (nickName: string) => {
  if (userInfo.value) {
    userInfo.value.nickName = nickName
  }
}
```

### 2. 合理使用计算属性

派生状态使用 `computed`,避免冗余数据:

```typescript
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<SysUserVo | null>(null)

  // ✅ 使用计算属性
  const displayName = computed(() => {
    return userInfo.value?.nickName || userInfo.value?.userName || '未知用户'
  })

  const isAdmin = computed(() => {
    return roles.value.includes('admin')
  })

  return {
    userInfo,
    displayName,
    isAdmin
  }
})
```

### 3. 异步操作错误处理

统一的错误处理机制,提供友好的错误提示:

```typescript
const fetchUserInfo = async (): Result<void> => {
  const [err, data] = await getUserInfo()
  if (err) {
    console.error('获取用户信息失败:', err)
    ElMessage.error(err.message || '获取用户信息失败')
    return [err, null]
  }

  userInfo.value = data.user
  roles.value = data.roles
  permissions.value = data.permissions

  return [null, null]
}
```

### 4. 模块职责清晰

不跨界处理其他模块的业务,保持职责单一:

```typescript
// ❌ 不推荐 - 在 user store 中处理路由
export const useUserStore = defineStore('user', () => {
  const loginUser = async (loginRequest: LoginRequest): Result<void> => {
    const [err, data] = await userLogin(loginRequest)
    if (err) return [err, null]

    // ❌ 不应该在这里处理路由
    const permissionStore = usePermissionStore()
    await permissionStore.generateRoutes()
    router.push('/dashboard')

    return [null, null]
  }
})

// ✅ 推荐 - 在组件或路由守卫中协调
const handleLogin = async () => {
  const [err] = await userStore.loginUser(loginForm)
  if (err) {
    ElMessage.error('登录失败')
    return
  }

  // 在组件中协调多个 Store
  await permissionStore.generateRoutes()
  router.push('/dashboard')
}
```

### 5. 类型定义完整

确保 TypeScript 类型覆盖所有状态和方法:

```typescript
// ✅ 完整的类型定义
export interface LoginRequest {
  userName: string
  password: string
  code: string
  uuid: string
}

export interface SysUserVo {
  userId: number
  userName: string
  nickName: string
  email: string
  phoneNumber: string
  avatar: string
  status: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<Array<string>>([])

  const loginUser = async (loginRequest: LoginRequest): Result<void> => {
    // 实现
  }

  return {
    userInfo,
    roles,
    loginUser
  }
})
```

### 6. 合理使用持久化

根据数据特性选择合适的持久化策略:

- **敏感数据**: Token 使用专门的工具类管理,支持加密存储
- **用户偏好**: 主题、语言等配置持久化到 localStorage
- **临时状态**: 字典、通知等数据不持久化,页面刷新后重新加载
- **大量数据**: 考虑使用 IndexedDB 而不是 localStorage

```typescript
// Token 持久化
const tokenUtils = useToken()
tokenUtils.setToken(token, expireIn)

// 主题配置持久化
import { localCache } from '@/utils/cache'
localCache.setCache('theme', themeConfig)
```

### 7. Store 模块命名规范

- **Store 文件**: 小写连字符,如 `user.ts`、`permission.ts`
- **Store 名称**: 小写连字符,如 `'user'`、`'permission'`
- **Composable**: 驼峰命名,如 `useUserStore`、`usePermissionStore`

```typescript
// ✅ 推荐命名
const USER_MODULE = 'user'
export const useUserStore = defineStore(USER_MODULE, () => {
  // ...
})

// ❌ 不推荐命名
const userModule = 'User'
export const UserStore = defineStore(userModule, () => {
  // ...
})
```

## 常见问题

### 1. Store 状态丢失响应性

**问题描述:**

直接解构 Store 导致状态丢失响应性,页面不更新。

**原因分析:**

Pinia 的 Store 是响应式对象,直接解构会丢失响应性。

**解决方案:**

使用 `storeToRefs` 保持响应性:

```typescript
// ❌ 错误 - 丢失响应性
const { userInfo } = useUserStore()

// ✅ 正确 - 保持响应性
import { storeToRefs } from 'pinia'
const { userInfo } = storeToRefs(useUserStore())
```

### 2. 跨 Store 调用导致循环依赖

**问题描述:**

Store A 导入 Store B,Store B 又导入 Store A,导致循环依赖错误。

**原因分析:**

TypeScript/JavaScript 模块系统不支持循环依赖。

**解决方案:**

在方法内部按需导入,而不是在模块顶部导入:

```typescript
// ❌ 错误 - 顶部导入导致循环依赖
import { usePermissionStore } from './permission'

export const useUserStore = defineStore('user', () => {
  const permissionStore = usePermissionStore()
  // ...
})

// ✅ 正确 - 方法内按需导入
export const useUserStore = defineStore('user', () => {
  const afterLogin = () => {
    // 在需要时导入
    const permissionStore = usePermissionStore()
    permissionStore.generateRoutes()
  }

  return { afterLogin }
})
```

### 3. Store 在路由守卫中无法访问

**问题描述:**

在路由守卫中访问 Store 时报错或获取不到数据。

**原因分析:**

路由守卫执行时 Pinia 实例可能还未完全初始化。

**解决方案:**

确保在 Vue 应用创建后再设置路由守卫,或者在守卫内部访问 Store:

```typescript
// ✅ 正确 - 在守卫内部访问
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (userStore.token) {
    // 已登录逻辑
  } else {
    // 未登录逻辑
  }

  next()
})
```

### 4. 异步操作后状态未更新

**问题描述:**

调用 Store 的异步方法后,状态没有更新,页面不刷新。

**原因分析:**

可能是直接修改了对象属性,而不是替换整个响应式对象。

**解决方案:**

确保使用 `.value` 更新 ref,或使用响应式 API:

```typescript
// ❌ 可能无效
const updateUserInfo = (newInfo: SysUserVo) => {
  Object.assign(userInfo.value, newInfo)
}

// ✅ 推荐
const updateUserInfo = (newInfo: SysUserVo) => {
  userInfo.value = { ...userInfo.value, ...newInfo }
}

// ✅ 或者直接替换
const updateUserInfo = (newInfo: SysUserVo) => {
  userInfo.value = newInfo
}
```

### 5. Store 数据在页面刷新后丢失

**问题描述:**

页面刷新后 Store 中的数据全部丢失。

**原因分析:**

默认情况下 Pinia Store 的数据存储在内存中,页面刷新后会重置。

**解决方案:**

使用持久化插件或手动实现持久化:

```typescript
// 方案 1: 使用 pinia-plugin-persistedstate
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const useUserStore = defineStore('user', () => {
  // ...
}, {
  persist: true
})

// 方案 2: 手动实现持久化
export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  return { token, setToken }
})
```

## 总结

RuoYi-Plus-UniApp 项目的状态管理架构基于 Pinia,遵循模块化、类型安全、职责单一的设计原则。通过合理的 Store 模块划分、统一的错误处理机制、灵活的持久化策略,为应用提供了可靠的全局状态管理能力。

在实际开发中,应遵循以下原则:

1. **模块化设计** - 按业务领域划分 Store 模块
2. **类型安全** - 提供完整的 TypeScript 类型定义
3. **职责单一** - 每个 Store 只负责特定领域
4. **统一错误处理** - 使用 Result 模式处理异步操作
5. **合理持久化** - 根据数据特性选择持久化策略
6. **响应式解构** - 使用 `storeToRefs` 保持响应性
7. **计算属性优化** - 派生状态使用 `computed`

通过遵循这些规范和最佳实践,可以构建出高质量、易维护的前端应用。
