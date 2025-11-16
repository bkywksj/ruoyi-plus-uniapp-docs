# Store 状态类型

## 介绍

Store 状态类型系统是基于 Pinia 的状态管理类型定义集合，为前端应用提供类型安全的全局状态管理能力。系统涵盖用户认证、权限控制、字典数据、通知管理、功能配置、AI 聊天等核心业务场景，通过 TypeScript 类型系统确保状态访问和操作的类型安全。

**核心特性:**

- **类型安全** - 基于 TypeScript 的完整类型定义，编译时检查状态访问和修改
- **模块化设计** - 按业务领域划分 Store 模块，职责清晰便于维护
- **响应式状态** - 利用 Vue 3 响应式系统，自动追踪状态变化并更新视图
- **组合式 API** - 采用 Pinia Setup Store 风格，使用 Composition API 定义状态
- **统一规范** - 所有 Store 遵循相同的命名和结构规范，降低学习成本
- **全局访问** - 通过依赖注入机制，在任何组件中都可方便访问 Store 实例

## Store 模块架构

### 模块总览

系统包含 6 个核心 Store 模块，每个模块负责特定的业务领域：

| Store 模块 | 模块名称 | 主要职责 | 状态数量 |
|-----------|---------|---------|---------|
| User Store | `user` | 用户认证与权限管理 | 4 个状态 |
| Dict Store | `dict` | 字典数据集中管理 | 1 个状态 |
| Permission Store | `permission` | 动态路由与权限控制 | 5 个状态 |
| Notice Store | `notice` | 系统通知消息管理 | 1 个状态 |
| Feature Store | `feature` | 系统功能开关配置 | 2 个状态 |
| AiChat Store | `aiChat` | AI 聊天会话管理 | 4 个状态 |

### Store 初始化

所有 Store 模块通过 Pinia 实例进行统一管理，在应用入口处初始化：

```typescript
import { createPinia } from 'pinia'

// 创建 Pinia 实例
const store = createPinia()

export default store
```

在 Vue 应用中注册：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import store from './stores/store'

const app = createApp(App)

// 注册 Pinia
app.use(store)

app.mount('#app')
```

## User Store 类型

### 状态类型定义

User Store 负责用户认证和权限管理，包含以下核心状态类型：

```typescript
// 用户信息类型
interface SysUserVo {
  userId: number
  userName: string
  nickName: string
  email?: string
  phoneNumber?: string
  sex?: string
  avatar?: string
  status?: string
  loginDate?: string
  remark?: string
  deptId?: number
  postIds?: number[]
  roleIds?: number[]
}

// 登录请求类型
interface LoginRequest {
  userName: string
  password: string
  code: string
  uuid: string
}

// User Store 状态类型
interface UserStoreState {
  // 访问令牌
  token: Ref<string>
  // 用户基本信息
  userInfo: Ref<SysUserVo | null>
  // 用户角色编码集合
  roles: Ref<Array<string>>
  // 用户权限编码集合
  permissions: Ref<Array<string>>
}
```

### Actions 方法类型

User Store 提供的操作方法类型定义：

```typescript
interface UserStoreActions {
  /**
   * 用户登录
   * @param loginRequest 登录信息
   * @returns Result<void> 登录结果
   */
  loginUser(loginRequest: LoginRequest): Result<void>

  /**
   * 获取用户信息
   * @returns Result<void> 获取结果
   */
  fetchUserInfo(): Result<void>

  /**
   * 用户注销
   * @returns Result<void> 注销结果
   */
  logoutUser(): Result<void>

  /**
   * 更新用户头像
   * @param avatarUrl 新头像地址
   */
  updateAvatar(avatarUrl: string): void
}
```

### 使用示例

在组件中使用 User Store：

```vue
<template>
  <div class="user-info">
    <el-avatar :src="avatar" :size="40" />
    <span>{{ nickname }}</span>
    <el-button @click="handleLogout" type="danger" size="small">
      退出登录
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 计算属性获取用户信息
const nickname = computed(() => userStore.userInfo?.nickName || '未登录')
const avatar = computed(() => userStore.userInfo?.avatar || '')

// 注销方法
const handleLogout = async () => {
  const [err] = await userStore.logoutUser()
  if (!err) {
    router.push('/login')
  }
}
</script>
```

登录表单示例：

```vue
<template>
  <el-form :model="loginForm" :rules="rules" ref="formRef">
    <el-form-item prop="userName">
      <el-input v-model="loginForm.userName" placeholder="用户名" />
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="密码"
      />
    </el-form-item>
    <el-form-item prop="code">
      <el-input v-model="loginForm.code" placeholder="验证码" />
    </el-form-item>
    <el-button @click="handleLogin" type="primary" :loading="loading">
      登录
    </el-button>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import type { LoginRequest } from '@/api/system/auth/authTypes'
import type { FormInstance, FormRules } from 'element-plus'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginRequest>({
  userName: '',
  password: '',
  code: '',
  uuid: ''
})

const rules: FormRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    const [err] = await userStore.loginUser(loginForm)
    loading.value = false

    if (!err) {
      // 登录成功，跳转到首页
      await userStore.fetchUserInfo()
      window.location.href = '/'
    }
  })
}
</script>
```

## Dict Store 类型

### 状态类型定义

Dict Store 负责字典数据的集中管理，使用 `Map<string, DictItem[]>` 结构存储多个字典：

```typescript
// 字典项类型（全局定义）
interface DictItem {
  // 显示标签文本
  label: string
  // 实际存储的值
  value: string
  // 状态标识
  status?: string
  // Element UI Tag 组件的类型
  elTagType?: ElTagType
  // Element UI Tag 组件的自定义类名
  elTagClass?: string
}

// Dict Store 状态类型
interface DictStoreState {
  // 字典数据集合，key 为字典类型，value 为字典项数组
  dict: Ref<Map<string, DictItem[]>>
}
```

### Actions 方法类型

```typescript
interface DictStoreActions {
  /**
   * 获取字典数据
   * @param key 字典类型
   * @returns 字典项数组或 null
   */
  getDict(key: string): DictItem[] | null

  /**
   * 设置字典数据
   * @param key 字典类型
   * @param value 字典项数组
   * @returns 是否设置成功
   */
  setDict(key: string, value: DictItem[]): boolean

  /**
   * 获取字典标签
   * @param keyOrData 字典类型或字典数据
   * @param value 字典值
   * @returns 对应的标签名
   */
  getDictLabel(keyOrData: string | Ref<DictItem[]> | DictItem[], value: string | number): string

  /**
   * 批量获取字典标签
   * @param keyOrData 字典类型或字典数据
   * @param values 字典值数组
   * @returns 对应的标签数组
   */
  getDictLabels(keyOrData: string | Ref<DictItem[]>, values: (string | number)[]): string[]

  /**
   * 获取字典项对象
   * @param keyOrData 字典类型或字典数据
   * @param value 字典值
   * @returns 完整的字典项对象或 null
   */
  getDictItem(keyOrData: string | DictItem[], value: string | number): DictItem | null

  /**
   * 根据标签获取字典值
   * @param key 字典类型
   * @param label 字典标签
   * @returns 对应的字典值
   */
  getDictValue(key: string, label: string): string | number | null

  /**
   * 删除字典
   * @param key 字典类型
   * @returns 是否删除成功
   */
  removeDict(key: string): boolean

  /**
   * 清空所有字典
   */
  cleanDict(): void
}
```

### 使用示例

字典数据在表单中的应用：

```vue
<template>
  <el-form :model="form">
    <!-- 性别选择 -->
    <el-form-item label="性别">
      <el-select v-model="form.gender">
        <el-option
          v-for="item in sys_user_gender"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <!-- 状态选择 -->
    <el-form-item label="状态">
      <el-radio-group v-model="form.status">
        <el-radio
          v-for="item in sys_enable_status"
          :key="item.value"
          :label="item.value"
        >
          {{ item.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useDict } from '@/composables/useDict'
import { DictTypes } from '@/composables/useDict'

// 获取多个字典数据
const { sys_user_gender, sys_enable_status, dictLoading } = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status
)

const form = reactive({
  gender: '',
  status: ''
})
</script>
```

在表格中显示字典标签：

```vue
<template>
  <el-table :data="tableData">
    <el-table-column label="性别" prop="gender">
      <template #default="{ row }">
        <el-tag :type="getGenderTagType(row.gender)">
          {{ dictStore.getDictLabel('sys_user_gender', row.gender) }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="状态" prop="status">
      <template #default="{ row }">
        <dict-tag :options="sys_enable_status" :value="row.status" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { useDict, DictTypes } from '@/composables/useDict'

const dictStore = useDictStore()
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

const tableData = ref([
  { id: 1, name: '张三', gender: '0', status: '0' },
  { id: 2, name: '李四', gender: '1', status: '1' }
])

const getGenderTagType = (value: string) => {
  const item = dictStore.getDictItem('sys_user_gender', value)
  return item?.elTagType || 'info'
}
</script>
```

## Permission Store 类型

### 状态类型定义

Permission Store 负责动态路由和权限控制：

```typescript
import type { RouteRecordRaw } from 'vue-router'

// 路由接口
interface Route {
  name?: string | symbol
  path: string
  children?: Route[]
}

// Permission Store 状态类型
interface PermissionStoreState {
  // 所有路由配置的集合
  routes: Ref<RouteRecordRaw[]>
  // 动态添加的路由配置
  addRoutes: Ref<RouteRecordRaw[]>
  // 默认路由配置
  defaultRoutes: Ref<RouteRecordRaw[]>
  // 顶部导航栏路由
  topbarRouters: Ref<RouteRecordRaw[]>
  // 侧边栏菜单路由
  sidebarRouters: Ref<RouteRecordRaw[]>
}
```

### Actions 方法类型

```typescript
interface PermissionStoreActions {
  /**
   * 获取所有路由
   * @returns 完整的路由记录数组
   */
  getRoutes(): RouteRecordRaw[]

  /**
   * 获取默认路由
   * @returns 默认路由数组
   */
  getDefaultRoutes(): RouteRecordRaw[]

  /**
   * 获取侧边栏路由
   * @returns 侧边栏路由数组
   */
  getSidebarRoutes(): RouteRecordRaw[]

  /**
   * 获取顶部栏路由
   * @returns 顶部栏路由数组
   */
  getTopbarRoutes(): RouteRecordRaw[]

  /**
   * 设置路由
   * @param newRoutes 新路由数组
   */
  setRoutes(newRoutes: RouteRecordRaw[]): void

  /**
   * 设置默认路由
   * @param routes 路由数组
   */
  setDefaultRoutes(routes: RouteRecordRaw[]): void

  /**
   * 设置顶部栏路由
   * @param routes 路由数组
   */
  setTopbarRoutes(routes: RouteRecordRaw[]): void

  /**
   * 设置侧边栏路由
   * @param routes 路由数组
   */
  setSidebarRouters(routes: RouteRecordRaw[]): void

  /**
   * 生成路由
   * @returns Result<RouteRecordRaw[]> 处理后的路由数组
   */
  generateRoutes(): Result<RouteRecordRaw[]>
}
```

### 使用示例

在路由守卫中生成动态路由：

```typescript
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import router from '@/router/router'

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 已登录且有 token
  if (userStore.token) {
    if (to.path === '/login') {
      // 已登录，跳转到首页
      next({ path: '/' })
    } else {
      // 检查是否已获取用户信息
      if (userStore.roles.length === 0) {
        try {
          // 获取用户信息
          await userStore.fetchUserInfo()
          // 生成动态路由
          const [err, accessRoutes] = await permissionStore.generateRoutes()

          if (err) {
            // 路由生成失败，跳转到登录页
            await userStore.logoutUser()
            next({ path: '/login' })
            return
          }

          // 动态添加路由
          accessRoutes?.forEach((route) => {
            router.addRoute(route)
          })

          // 继续访问
          next({ ...to, replace: true })
        } catch (error) {
          // 清除 token 并跳转到登录页
          await userStore.logoutUser()
          next({ path: '/login' })
        }
      } else {
        next()
      }
    }
  } else {
    // 未登录
    if (to.path === '/login') {
      next()
    } else {
      next({ path: '/login' })
    }
  }
})
```

在侧边栏组件中使用路由：

```vue
<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    mode="vertical"
  >
    <sidebar-item
      v-for="route in sidebarRoutes"
      :key="route.path"
      :item="route"
      :base-path="route.path"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores/modules/permission'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const permissionStore = usePermissionStore()

// 获取侧边栏路由
const sidebarRoutes = computed(() => permissionStore.getSidebarRoutes())

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})

const isCollapse = ref(false)
</script>
```

## Notice Store 类型

### 状态类型定义

Notice Store 负责系统通知的管理：

```typescript
// 通知项类型
interface NoticeItem {
  // 通知标题
  title?: string
  // 是否已读
  read: boolean
  // 通知内容
  message: any
  // 通知时间
  time: string
}

// Notice Store 状态类型
interface NoticeStoreState {
  // 通知列表
  notices: Ref<NoticeItem[]>
}
```

### Actions 方法类型

```typescript
interface NoticeStoreActions {
  /**
   * 添加通知
   * @param notice 通知项
   */
  addNotice(notice: NoticeItem): void

  /**
   * 移除通知
   * @param notice 要移除的通知项
   */
  removeNotice(notice: NoticeItem): void

  /**
   * 将所有通知标记为已读
   */
  readAll(): void

  /**
   * 清空所有通知
   */
  clearNotice(): void
}
```

### 使用示例

通知组件示例：

```vue
<template>
  <el-badge :value="unreadCount" :hidden="unreadCount === 0">
    <el-button icon="Bell" circle @click="showNoticeDrawer = true" />
  </el-badge>

  <el-drawer v-model="showNoticeDrawer" title="系统通知" size="400px">
    <div class="notice-list">
      <div
        v-for="(item, index) in noticeStore.notices"
        :key="index"
        class="notice-item"
        :class="{ unread: !item.read }"
      >
        <div class="notice-header">
          <span class="notice-title">{{ item.title }}</span>
          <span class="notice-time">{{ item.time }}</span>
        </div>
        <div class="notice-content">{{ item.message }}</div>
        <div class="notice-actions">
          <el-button
            size="small"
            text
            @click="noticeStore.removeNotice(item)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="noticeStore.readAll()">全部已读</el-button>
      <el-button @click="noticeStore.clearNotice()" type="danger">
        清空通知
      </el-button>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useNoticeStore } from '@/stores/modules/notice'

const noticeStore = useNoticeStore()
const showNoticeDrawer = ref(false)

// 计算未读通知数量
const unreadCount = computed(() => {
  return noticeStore.notices.filter((item) => !item.read).length
})
</script>

<style scoped>
.notice-item {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.notice-item.unread {
  background-color: var(--el-color-primary-light-9);
}

.notice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.notice-title {
  font-weight: bold;
}

.notice-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.notice-content {
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.notice-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
```

WebSocket 接收通知示例：

```typescript
import { useNoticeStore } from '@/stores/modules/notice'
import type { NoticeItem } from '@/stores/modules/notice'

const noticeStore = useNoticeStore()

// WebSocket 消息处理
const handleWebSocketMessage = (event: MessageEvent) => {
  try {
    const data = JSON.parse(event.data)

    if (data.type === 'notice') {
      const notice: NoticeItem = {
        title: data.title,
        read: false,
        message: data.message,
        time: new Date().toLocaleString()
      }

      // 添加到通知列表
      noticeStore.addNotice(notice)

      // 显示桌面通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notice.title || '系统通知', {
          body: notice.message,
          icon: '/logo.png'
        })
      }
    }
  } catch (error) {
    console.error('处理 WebSocket 消息失败:', error)
  }
}
```

## Feature Store 类型

### 状态类型定义

Feature Store 负责系统功能配置的管理：

```typescript
// 系统功能配置类型
interface SystemFeature {
  // Langchain4j 是否启用
  langchain4jEnabled: boolean
  // WebSocket 是否启用
  websocketEnabled: boolean
  // SSE 是否启用
  sseEnabled: boolean
  // OpenAPI 是否启用
  openApiEnabled: boolean
  // OpenAPI 访问模式
  openApiAccessMode: 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'ROLES'
  // OpenAPI 允许的角色列表
  openApiAllowedRoles: string[]
}

// Feature Store 状态类型
interface FeatureStoreState {
  // 系统功能配置
  features: Ref<SystemFeature>
  // 配置是否已初始化
  initialized: Ref<boolean>
}
```

### Actions 方法类型

```typescript
interface FeatureStoreActions {
  /**
   * 初始化功能配置
   * @returns Promise<void>
   */
  initFeatures(): Promise<void>

  /**
   * 检查当前用户是否可以使用开放API
   * @param userRoles 用户角色数组
   * @returns 是否可以使用
   */
  canUseOpenApi(userRoles: string[]): boolean
}
```

### 使用示例

在应用启动时初始化功能配置：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { useFeatureStore } from '@/stores/modules/feature'

const app = createApp(App)

// 初始化应用
const initApp = async () => {
  const featureStore = useFeatureStore()

  // 初始化功能配置
  await featureStore.initFeatures()

  // 挂载应用
  app.mount('#app')
}

initApp()
```

根据功能配置显示/隐藏菜单：

```vue
<template>
  <el-menu>
    <!-- AI 聊天菜单，仅在 Langchain4j 启用时显示 -->
    <el-menu-item v-if="featureStore.features.langchain4jEnabled" index="/ai-chat">
      <el-icon><ChatDotRound /></el-icon>
      <span>AI 聊天</span>
    </el-menu-item>

    <!-- WebSocket 监控，仅在 WebSocket 启用时显示 -->
    <el-menu-item v-if="featureStore.features.websocketEnabled" index="/websocket-monitor">
      <el-icon><Connection /></el-icon>
      <span>WebSocket 监控</span>
    </el-menu-item>

    <!-- OpenAPI 文档，根据权限判断是否显示 -->
    <el-menu-item v-if="canAccessOpenApi" index="/openapi">
      <el-icon><Document /></el-icon>
      <span>API 文档</span>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

// 判断当前用户是否可以访问 OpenAPI
const canAccessOpenApi = computed(() => {
  return featureStore.canUseOpenApi(userStore.roles)
})
</script>
```

## AiChat Store 类型

### 状态类型定义

AiChat Store 负责 AI 聊天会话的管理：

```typescript
// AI 聊天消息类型
interface AiChatMessage {
  // 消息唯一标识
  id: string
  // 消息角色：user-用户 | assistant-AI助手 | system-系统
  role: 'user' | 'assistant' | 'system'
  // 消息内容
  content: string
  // 消息时间戳
  timestamp: number
  // Token 使用情况
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  // 引用的文档列表
  references?: any[]
  // 消息状态：sending-发送中 | streaming-生成中 | complete-完成 | error-错误
  status?: 'sending' | 'streaming' | 'complete' | 'error'
  // 错误信息
  error?: string
}

// AI 聊天会话类型
interface AiChatSession {
  // 会话唯一标识
  id: string
  // 会话标题
  title: string
  // 消息列表
  messages: AiChatMessage[]
  // 创建时间
  createdAt: number
  // 更新时间
  updatedAt: number
  // 模型提供商
  provider?: string
  // 模型名称
  modelName?: string
}

// AiChat Store 状态类型
interface AiChatStoreState {
  // 会话集合，使用 Map 存储
  sessions: Ref<Map<string, AiChatSession>>
  // 当前活跃的会话 ID
  currentSessionId: Ref<string | null>
  // 当前正在流式生成的消息 ID
  streamingMessageId: Ref<string | null>
  // 流式内容缓冲区
  streamContentBuffer: Ref<string>
}
```

### Getters 计算属性类型

```typescript
interface AiChatStoreGetters {
  // 获取当前会话
  currentSession: ComputedRef<AiChatSession | null>
  // 获取当前会话的消息列表
  currentMessages: ComputedRef<AiChatMessage[]>
  // 是否正在生成中
  isGenerating: ComputedRef<boolean>
  // 获取所有会话列表（按更新时间倒序）
  sessionList: ComputedRef<AiChatSession[]>
}
```

### Actions 方法类型

```typescript
interface AiChatStoreActions {
  // 会话管理
  createSession(options?: {
    title?: string
    provider?: string
    modelName?: string
  }): string
  switchSession(sessionId: string): boolean
  deleteSession(sessionId: string): boolean
  clearAllSessions(): void
  updateSessionTitle(sessionId: string, title: string): boolean

  // 消息管理
  sendMessage(
    content: string,
    options?: {
      sessionId?: string
      provider?: string
      modelName?: string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
    }
  ): boolean
  regenerateLastMessage(): boolean

  // WebSocket 回调
  onChatStart(sessionId: string, messageId?: string): void
  appendStreamContent(sessionId: string, messageId: string, content: string): void
  onChatComplete(sessionId: string, messageId: string, tokenUsage?: any): void
  onChatError(sessionId: string, error: string): void
}
```

### 使用示例

AI 聊天界面组件：

```vue
<template>
  <div class="ai-chat">
    <!-- 会话列表 -->
    <div class="session-list">
      <el-button @click="createNewSession" type="primary" class="w-full">
        新建对话
      </el-button>
      <div
        v-for="session in aiChatStore.sessionList"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === aiChatStore.currentSessionId }"
        @click="aiChatStore.switchSession(session.id)"
      >
        <span>{{ session.title }}</span>
        <el-icon @click.stop="handleDeleteSession(session.id)">
          <Delete />
        </el-icon>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <div
        v-for="message in aiChatStore.currentMessages"
        :key="message.id"
        class="message-item"
        :class="message.role"
      >
        <div class="message-avatar">
          <el-avatar v-if="message.role === 'user'" :src="userAvatar" />
          <el-avatar v-else>AI</el-avatar>
        </div>
        <div class="message-content">
          <div class="message-text" v-html="renderMarkdown(message.content)" />
          <div v-if="message.tokenUsage" class="message-meta">
            Tokens: {{ message.tokenUsage.totalTokens }}
          </div>
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="aiChatStore.isGenerating" class="generating-indicator">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>AI 正在思考...</span>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="input-area">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="输入消息..."
        @keydown.enter.exact="handleSend"
        :disabled="aiChatStore.isGenerating"
      />
      <div class="input-actions">
        <el-button
          @click="handleSend"
          type="primary"
          :loading="aiChatStore.isGenerating"
          :disabled="!inputMessage.trim()"
        >
          发送
        </el-button>
        <el-button
          v-if="aiChatStore.currentMessages.length > 0"
          @click="handleRegenerate"
          :disabled="aiChatStore.isGenerating"
        >
          重新生成
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAiChatStore } from '@/stores/modules/aiChat'
import { useUserStore } from '@/stores/modules/user'
import { marked } from 'marked'

const aiChatStore = useAiChatStore()
const userStore = useUserStore()

const inputMessage = ref('')
const userAvatar = computed(() => userStore.userInfo?.avatar || '')

// 创建新会话
const createNewSession = () => {
  aiChatStore.createSession({
    title: '新对话',
    provider: 'deepseek',
    modelName: 'deepseek-chat'
  })
}

// 发送消息
const handleSend = () => {
  if (!inputMessage.value.trim()) return

  aiChatStore.sendMessage(inputMessage.value.trim(), {
    temperature: 0.7,
    maxTokens: 2000
  })

  inputMessage.value = ''
}

// 重新生成
const handleRegenerate = () => {
  aiChatStore.regenerateLastMessage()
}

// 删除会话
const handleDeleteSession = (sessionId: string) => {
  ElMessageBox.confirm('确定删除此对话？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    aiChatStore.deleteSession(sessionId)
  })
}

// 渲染 Markdown
const renderMarkdown = (content: string) => {
  return marked(content)
}
</script>

<style scoped>
.ai-chat {
  display: flex;
  height: 100vh;
}

.session-list {
  width: 250px;
  border-right: 1px solid var(--el-border-color-light);
  padding: 16px;
  overflow-y: auto;
}

.session-item {
  padding: 12px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.session-item:hover {
  background-color: var(--el-fill-color-light);
}

.session-item.active {
  background-color: var(--el-color-primary-light-9);
}

.message-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  margin-bottom: 24px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 12px;
}

.message-content {
  max-width: 70%;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--el-fill-color-light);
}

.message-item.user .message-content {
  background-color: var(--el-color-primary-light-9);
}

.message-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.generating-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.input-area {
  border-top: 1px solid var(--el-border-color-light);
  padding: 16px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>
```

## 类型导出规范

### Store 类型导出

为了让组件能够访问 Store 的类型定义，需要正确导出类型：

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<SysUserVo | null>(null)
  const roles = ref<Array<string>>([])
  const permissions = ref<Array<string>>([])

  // ... actions

  return {
    token,
    userInfo,
    roles,
    permissions,
    // ... actions
  }
})

// 导出 Store 实例类型
export type UserStore = ReturnType<typeof useUserStore>

// 导出 Store 状态类型
export type UserStoreState = {
  token: string
  userInfo: SysUserVo | null
  roles: Array<string>
  permissions: Array<string>
}
```

### 在组件中使用导出的类型

```typescript
import { useUserStore, type UserStore, type UserStoreState } from '@/stores/modules/user'
import type { Ref } from 'vue'

// 使用 Store 实例类型
const userStore: UserStore = useUserStore()

// 使用 Store 状态类型
const storeState: UserStoreState = {
  token: '',
  userInfo: null,
  roles: [],
  permissions: []
}

// 在函数参数中使用
const handleUserUpdate = (state: UserStoreState) => {
  console.log('用户状态更新:', state)
}
```

## 最佳实践

### 1. Store 模块职责单一

每个 Store 模块应该只负责一个明确的业务领域，避免职责混乱：

```typescript
// ✅ 好的做法：职责明确
const useUserStore = defineStore('user', () => {
  // 只管理用户相关状态
  const userInfo = ref(null)
  const roles = ref([])
  return { userInfo, roles }
})

const useDictStore = defineStore('dict', () => {
  // 只管理字典相关状态
  const dict = ref(new Map())
  return { dict }
})

// ❌ 不好的做法：职责混乱
const useAppStore = defineStore('app', () => {
  // 混合了用户、字典、设置等多种状态
  const userInfo = ref(null)
  const dict = ref(new Map())
  const theme = ref('light')
  return { userInfo, dict, theme }
})
```

### 2. 使用计算属性派生状态

对于需要计算的状态，使用 `computed` 而不是在组件中计算：

```typescript
// ✅ 好的做法：在 Store 中定义计算属性
const useUserStore = defineStore('user', () => {
  const userInfo = ref<SysUserVo | null>(null)

  // 计算属性：是否为管理员
  const isAdmin = computed(() => {
    return userInfo.value?.roles?.includes('admin') || false
  })

  // 计算属性：用户显示名称
  const displayName = computed(() => {
    return userInfo.value?.nickName || userInfo.value?.userName || '未登录'
  })

  return { userInfo, isAdmin, displayName }
})

// ❌ 不好的做法：在每个组件中都计算
const userStore = useUserStore()
const isAdmin = computed(() => {
  return userStore.userInfo?.roles?.includes('admin') || false
})
```

### 3. 状态持久化

对于需要持久化的状态，使用 Pinia 持久化插件：

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref(null)

    return { token, userInfo }
  },
  {
    // 配置持久化
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'user-store',
          storage: localStorage,
          // 只持久化 token
          paths: ['token']
        }
      ]
    }
  }
)
```

### 4. 异步操作错误处理

所有异步操作都应该返回 `Result<T>` 类型，统一错误处理：

```typescript
const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)

  // ✅ 好的做法：返回 Result 类型
  const fetchUserInfo = async (): Result<void> => {
    const [err, data] = await getUserInfo()
    if (err) {
      return [err, null]
    }
    userInfo.value = data.user
    return [null, null]
  }

  // ❌ 不好的做法：直接抛出错误
  const fetchUserInfoBad = async () => {
    const data = await getUserInfo() // 可能抛出错误
    userInfo.value = data.user
  }

  return { userInfo, fetchUserInfo }
})

// 在组件中使用
const userStore = useUserStore()
const [err] = await userStore.fetchUserInfo()
if (err) {
  ElMessage.error('获取用户信息失败')
}
```

### 5. 避免直接修改 Store 状态

在组件中不要直接修改 Store 的状态，应该通过 actions 方法：

```typescript
const useUserStore = defineStore('user', () => {
  const userInfo = ref<SysUserVo | null>(null)

  // 提供修改方法
  const updateAvatar = (avatarUrl: string) => {
    if (userInfo.value) {
      userInfo.value.avatar = avatarUrl
    }
  }

  return { userInfo, updateAvatar }
})

// ✅ 好的做法：通过 action 修改
const userStore = useUserStore()
userStore.updateAvatar('https://example.com/avatar.jpg')

// ❌ 不好的做法：直接修改状态
const userStore = useUserStore()
if (userStore.userInfo) {
  userStore.userInfo.avatar = 'https://example.com/avatar.jpg'
}
```

### 6. Store 之间的依赖

当一个 Store 需要使用另一个 Store 时，在方法内部调用，而不是在模块顶层：

```typescript
// ✅ 好的做法：在方法内部调用
const usePermissionStore = defineStore('permission', () => {
  const routes = ref([])

  const generateRoutes = async () => {
    // 在方法内部获取其他 Store
    const userStore = useUserStore()
    const roles = userStore.roles

    // 根据角色生成路由
    const accessRoutes = filterRoutes(routes.value, roles)
    return accessRoutes
  }

  return { routes, generateRoutes }
})

// ❌ 不好的做法：在模块顶层调用（可能导致循环依赖）
const userStore = useUserStore()

const usePermissionStore = defineStore('permission', () => {
  const routes = ref([])

  const generateRoutes = async () => {
    // 使用顶层的 userStore
    const roles = userStore.roles
    const accessRoutes = filterRoutes(routes.value, roles)
    return accessRoutes
  }

  return { routes, generateRoutes }
})
```

## 常见问题

### 1. Store 状态未响应式更新

**问题描述:**

修改了 Store 中的状态，但组件视图没有更新。

**可能原因:**

- 直接替换了整个响应式对象而不是修改属性
- 使用了非响应式的数据结构

**解决方案:**

```typescript
// ❌ 错误：直接替换整个对象
const userStore = defineStore('user', () => {
  let userInfo = ref({ name: '张三' })

  const updateUser = (newInfo: any) => {
    // 这样会破坏响应性
    userInfo = newInfo
  }

  return { userInfo, updateUser }
})

// ✅ 正确：修改对象属性
const userStore = defineStore('user', () => {
  const userInfo = ref({ name: '张三' })

  const updateUser = (newInfo: any) => {
    // 方式1：使用 Object.assign
    Object.assign(userInfo.value, newInfo)

    // 方式2：修改 value 属性
    userInfo.value = { ...userInfo.value, ...newInfo }
  }

  return { userInfo, updateUser }
})
```

### 2. Map 类型状态更新不触发视图更新

**问题描述:**

使用 `Map` 类型存储数据时，调用 `set`、`delete` 等方法后视图不更新。

**解决方案:**

强制触发响应式更新：

```typescript
const useDictStore = defineStore('dict', () => {
  const dict = ref<Map<string, DictItem[]>>(new Map())

  const setDict = (key: string, value: DictItem[]) => {
    dict.value.set(key, value)

    // ✅ 方式1：创建新的 Map 实例触发更新
    dict.value = new Map(dict.value)

    // ✅ 方式2：使用 triggerRef 强制触发更新
    // triggerRef(dict)
  }

  return { dict, setDict }
})
```

### 3. Store 中的异步方法没有等待完成

**问题描述:**

调用 Store 的异步方法后立即访问状态，但状态还未更新。

**解决方案:**

确保正确使用 `await` 等待异步操作完成：

```typescript
// ❌ 错误：没有等待异步操作
const handleLogin = () => {
  userStore.loginUser(loginForm)
  // 这里 token 可能还是空的
  console.log(userStore.token)
}

// ✅ 正确：等待异步操作完成
const handleLogin = async () => {
  const [err] = await userStore.loginUser(loginForm)
  if (!err) {
    // 这里 token 已经更新
    console.log(userStore.token)
  }
}
```

### 4. 在 Setup 顶层调用 Store 导致的问题

**问题描述:**

在 Vue 组件 `setup` 函数顶层调用 Store，但在某些情况下 Store 未初始化。

**解决方案:**

确保 Pinia 已经注册后再调用 Store：

```typescript
// ✅ 正确：在 setup 函数内部调用
export default defineComponent({
  setup() {
    const userStore = useUserStore()

    onMounted(() => {
      userStore.fetchUserInfo()
    })

    return { userStore }
  }
})

// ❌ 错误：在模块顶层调用（Pinia 可能还未注册）
const userStore = useUserStore()

export default defineComponent({
  setup() {
    onMounted(() => {
      userStore.fetchUserInfo()
    })
  }
})
```

### 5. Store 类型推导不准确

**问题描述:**

TypeScript 无法正确推导 Store 返回的类型。

**解决方案:**

明确导出 Store 类型：

```typescript
// 定义 Store
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<SysUserVo | null>(null)

  const login = async (form: LoginRequest) => {
    // ...
  }

  return { token, userInfo, login }
})

// ✅ 导出 Store 类型
export type UserStore = ReturnType<typeof useUserStore>

// 在其他文件中使用
import { useUserStore, type UserStore } from '@/stores/modules/user'

const userStore: UserStore = useUserStore()
// TypeScript 现在可以正确推导所有属性和方法的类型
```

### 6. Store 数据在页面刷新后丢失

**问题描述:**

Store 中的数据在页面刷新后全部丢失。

**解决方案:**

使用持久化插件或手动实现持久化：

```typescript
// 方式1：使用 pinia-plugin-persistedstate 插件
import { defineStore } from 'pinia'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    return { token }
  },
  {
    persist: true // 启用持久化
  }
)

// 方式2：手动实现持久化
export const useUserStore = defineStore('user', () => {
  // 从 localStorage 读取初始值
  const token = ref(localStorage.getItem('token') || '')

  // 监听变化并保存到 localStorage
  watch(
    token,
    (newToken) => {
      if (newToken) {
        localStorage.setItem('token', newToken)
      } else {
        localStorage.removeItem('token')
      }
    },
    { immediate: true }
  )

  return { token }
})
```
