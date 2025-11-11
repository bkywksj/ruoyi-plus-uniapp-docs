# 状态管理概览

## 介绍

RuoYi-Plus-UniApp 前端项目采用 **Pinia** 作为状态管理解决方案，这是 Vue 3 官方推荐的状态管理库，提供了轻量、类型安全、开发者友好的全局状态管理能力。

**核心特性**：

- **类型安全** - 完整的 TypeScript 类型推导和智能提示
- **Composition API 风格** - 符合 Vue 3 开发规范，代码更简洁直观
- **模块化设计** - 每个 Store 职责单一，相互解耦，易于维护
- **开发体验** - 支持 Vue DevTools，便于调试和状态追踪
- **性能优化** - 自动的细粒度响应式更新，按需加载
- **持久化支持** - 灵活的状态持久化策略，支持自定义存储

本项目包含 6 个核心 Store 模块，覆盖用户认证、权限管理、字典数据、功能配置、通知管理、AI 聊天等业务场景。

---

## 目录结构

### 项目结构

```
plus-ui/src/stores/
├── store.ts                  # Pinia 实例创建和配置
└── modules/                  # Store 模块目录
    ├── user.ts              # 用户认证与权限管理
    ├── permission.ts        # 路由权限与菜单管理
    ├── dict.ts              # 字典数据管理
    ├── feature.ts           # 系统功能配置管理
    ├── notice.ts            # 通知消息管理
    └── aiChat.ts            # AI 聊天管理
```

### 模块职责

| 模块 | 职责 | 主要功能 | 状态持久化 |
|------|------|---------|-----------|
| **user** | 用户认证与权限 | 登录、注销、用户信息、角色权限 | Token 持久化 |
| **permission** | 路由权限管理 | 动态路由生成、菜单构建、权限过滤 | 否 |
| **dict** | 字典数据管理 | 字典存储、查询、标签转换 | 否 |
| **feature** | 功能配置管理 | 功能开关、配置初始化 | 否 |
| **notice** | 通知管理 | 通知添加、移除、已读标记 | 否 |
| **aiChat** | AI 聊天管理 | 会话管理、消息收发、流式响应 | 否 |

---

## Pinia 配置

### 实例创建

系统在 `stores/store.ts` 中创建 Pinia 实例：

```typescript
// stores/store.ts
import { createPinia } from 'pinia'

// 创建 Pinia 实例
const store = createPinia()

// 导出供 main.ts 使用
export default store
```

### 挂载到应用

在 `main.ts` 中挂载 Pinia 实例：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import store from './stores/store'

const app = createApp(App)

// 注册 Pinia
app.use(store)

app.mount('#app')
```

---

## Store 模块详解

### 1. User Store - 用户认证与权限

**职责**：管理用户登录、注销、个人信息、角色和权限等核心认证功能。

#### 状态定义

```typescript
interface State {
  token: string                    // 访问令牌
  userInfo: SysUserVo | null      // 用户基本信息
  roles: string[]                  // 用户角色编码集合
  permissions: string[]            // 用户权限编码集合
}
```

#### 核心方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `loginUser` | 用户登录 | `LoginRequest` | `Result<void>` |
| `logoutUser` | 用户注销 | - | `Result<void>` |
| `fetchUserInfo` | 获取用户信息 | - | `Result<void>` |
| `updateAvatar` | 更新用户头像 | `avatarUrl: string` | `void` |

#### 使用示例

**登录场景**：

```vue
<template>
  <div class="login-page">
    <el-form @submit.prevent="handleLogin">
      <el-form-item label="用户名">
        <el-input v-model="form.userName" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-button type="primary" @click="handleLogin">登录</el-button>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  userName: '',
  password: '',
  code: '',
  uuid: ''
})

const handleLogin = async () => {
  const [err] = await userStore.loginUser(form.value)
  if (err) {
    ElMessage.error('登录失败: ' + err.message)
    return
  }

  // 登录成功后获取用户信息
  await userStore.fetchUserInfo()

  ElMessage.success('登录成功')
  router.push('/')
}
</script>
```

**获取用户信息**：

```vue
<template>
  <div class="user-profile">
    <img :src="userStore.userInfo?.avatar" alt="头像" />
    <p>{{ userStore.userInfo?.nickName }}</p>
    <p>{{ userStore.userInfo?.phonenumber }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 使用计算属性访问用户信息
const nickname = computed(() => userStore.userInfo?.nickName || '未设置')
const avatar = computed(() => userStore.userInfo?.avatar || '')
</script>
```

**权限判断**：

```vue
<template>
  <div>
    <!-- 基于权限显示按钮 -->
    <el-button v-if="hasPermission('system:user:add')">新增</el-button>
    <el-button v-if="hasPermission('system:user:edit')">编辑</el-button>

    <!-- 基于角色显示内容 -->
    <div v-if="hasRole('admin')">管理员专属内容</div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 检查权限
const hasPermission = (permission: string) => {
  return userStore.permissions.includes(permission)
}

// 检查角色
const hasRole = (role: string) => {
  return userStore.roles.includes(role)
}
</script>
```

---

### 2. Permission Store - 路由权限管理

**职责**：负责动态路由生成、菜单构建、权限过滤和多布局路由管理。

#### 状态定义

```typescript
interface State {
  routes: RouteRecordRaw[]           // 所有路由配置集合
  addRoutes: RouteRecordRaw[]        // 动态添加的路由
  defaultRoutes: RouteRecordRaw[]    // 默认路由
  topbarRouters: RouteRecordRaw[]    // 顶部导航路由
  sidebarRouters: RouteRecordRaw[]   // 侧边栏菜单路由
}
```

#### 核心方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `generateRoutes` | 生成路由 | - | `Result<RouteRecordRaw[]>` |
| `getRoutes` | 获取所有路由 | - | `RouteRecordRaw[]` |
| `getSidebarRoutes` | 获取侧边栏路由 | - | `RouteRecordRaw[]` |
| `getTopbarRoutes` | 获取顶部栏路由 | - | `RouteRecordRaw[]` |
| `setRoutes` | 设置路由 | `routes: RouteRecordRaw[]` | `void` |
| `setSidebarRouters` | 设置侧边栏路由 | `routes: RouteRecordRaw[]` | `void` |

#### 使用示例

**路由初始化**：

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  if (userStore.token) {
    if (!userStore.roles.length) {
      // 获取用户信息
      await userStore.fetchUserInfo()

      // 生成动态路由
      const [err, routes] = await permissionStore.generateRoutes()
      if (err) {
        ElMessage.error('路由加载失败')
        return next('/login')
      }

      // 动态添加路由
      routes.forEach(route => {
        router.addRoute(route)
      })

      // 继续导航
      next({ ...to, replace: true })
    } else {
      next()
    }
  } else {
    next('/login')
  }
})
```

**侧边栏菜单**：

```vue
<template>
  <el-menu :default-active="activeMenu" :collapse="isCollapse">
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

const route = useRoute()
const permissionStore = usePermissionStore()

// 获取侧边栏路由
const sidebarRoutes = computed(() => permissionStore.getSidebarRoutes())

// 当前激活菜单
const activeMenu = computed(() => route.path)
</script>
```

---

### 3. Dict Store - 字典数据管理

**职责**：统一管理应用中的字典数据，提供字典查询、标签转换、值转换等功能。

#### 状态定义

```typescript
interface State {
  dict: Map<string, DictItem[]>  // 字典数据集合
}

interface DictItem {
  label: string           // 字典标签
  value: string | number  // 字典值
  dictType: string        // 字典类型
  cssClass?: string       // 样式类名
  listClass?: string      // 列表样式类名
}
```

#### 核心方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `getDict` | 获取字典 | `key: string` | `DictItem[] \| null` |
| `setDict` | 设置字典 | `key: string, value: DictItem[]` | `boolean` |
| `getDictLabel` | 获取字典标签 | `key: string, value: string` | `string` |
| `getDictLabels` | 批量获取标签 | `key: string, values: string[]` | `string[]` |
| `getDictValue` | 获取字典值 | `key: string, label: string` | `string \| number \| null` |
| `getDictItem` | 获取字典项对象 | `key: string, value: string` | `DictItem \| null` |
| `removeDict` | 删除字典 | `key: string` | `boolean` |
| `cleanDict` | 清空字典 | - | `void` |

#### 使用示例

**加载字典数据**：

```typescript
// composables/useDict.ts
import { ref, onMounted } from 'vue'
import { useDictStore } from '@/stores/modules/dict'
import { getDictData } from '@/api/system/dict/dictData/dictDataApi'

/**
 * 字典数据加载 Composable
 * @param dictTypes 字典类型数组
 */
export function useDict(...dictTypes: string[]) {
  const dictStore = useDictStore()
  const dictData = ref<Record<string, DictItem[]>>({})

  const loadDict = async () => {
    for (const dictType of dictTypes) {
      // 先从 Store 获取
      const cached = dictStore.getDict(dictType)
      if (cached) {
        dictData.value[dictType] = cached
        continue
      }

      // 从 API 获取
      const [err, data] = await getDictData(dictType)
      if (!err && data) {
        dictStore.setDict(dictType, data)
        dictData.value[dictType] = data
      }
    }
  }

  onMounted(() => {
    loadDict()
  })

  return { dictData }
}
```

**在表单中使用**：

```vue
<template>
  <el-form>
    <el-form-item label="用户性别">
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
      <el-radio-group v-model="form.status">
        <el-radio
          v-for="item in statusDict"
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
import { ref, computed } from 'vue'
import { useDict } from '@/composables/useDict'

const { dictData } = useDict('sys_user_gender', 'sys_enable_status')

const form = ref({
  gender: '',
  status: ''
})

const genderDict = computed(() => dictData.value['sys_user_gender'] || [])
const statusDict = computed(() => dictData.value['sys_enable_status'] || [])
</script>
```

**标签转换**：

```vue
<template>
  <el-table :data="tableData">
    <el-table-column label="性别" prop="gender">
      <template #default="{ row }">
        {{ dictStore.getDictLabel('sys_user_gender', row.gender) }}
      </template>
    </el-table-column>

    <el-table-column label="状态" prop="status">
      <template #default="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ dictStore.getDictLabel('sys_enable_status', row.status) }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { useDictStore } from '@/stores/modules/dict'

const dictStore = useDictStore()

const getStatusType = (status: string) => {
  return status === '0' ? 'success' : 'danger'
}
</script>
```

---

### 4. Feature Store - 系统功能配置管理

**职责**：管理系统功能开关，如 AI 聊天、WebSocket、SSE、OpenAPI 等功能的启用状态。

#### 状态定义

```typescript
interface SystemFeature {
  langchain4jEnabled: boolean      // LangChain4j AI 功能
  websocketEnabled: boolean        // WebSocket 功能
  sseEnabled: boolean              // SSE 服务端推送
  openApiEnabled: boolean          // OpenAPI 文档
  openApiAccessMode: string        // OpenAPI 访问模式
  openApiAllowedRoles: string[]    // OpenAPI 允许的角色
}
```

#### 核心方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `initFeatures` | 初始化功能配置 | - | `Promise<void>` |
| `canUseOpenApi` | 检查是否可使用 OpenAPI | `userRoles: string[]` | `boolean` |

#### 使用示例

**应用初始化**：

```typescript
// App.vue 或 main.ts
import { useFeatureStore } from '@/stores/modules/feature'

const initApp = async () => {
  const featureStore = useFeatureStore()

  // 初始化功能配置
  await featureStore.initFeatures()

  console.log('AI 功能状态:', featureStore.features.langchain4jEnabled)
  console.log('WebSocket 状态:', featureStore.features.websocketEnabled)
}

initApp()
```

**根据功能状态渲染**：

```vue
<template>
  <div class="app-container">
    <!-- AI 聊天入口 -->
    <el-button
      v-if="featureStore.features.langchain4jEnabled"
      @click="openAiChat"
    >
      AI 助手
    </el-button>

    <!-- OpenAPI 文档入口 -->
    <el-button
      v-if="canViewOpenApi"
      @click="openApiDoc"
    >
      API 文档
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

// 检查是否可以查看 OpenAPI 文档
const canViewOpenApi = computed(() => {
  return featureStore.canUseOpenApi(userStore.roles)
})
</script>
```

---

### 5. Notice Store - 通知消息管理

**职责**：管理系统通知消息的存储、添加、移除、已读标记等功能。

#### 状态定义

```typescript
interface NoticeItem {
  title?: string      // 通知标题
  read: boolean       // 是否已读
  message: any        // 通知内容
  time: string        // 通知时间
}

interface State {
  notices: NoticeItem[]  // 通知列表
}
```

#### 核心方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `addNotice` | 添加通知 | `notice: NoticeItem` | `void` |
| `removeNotice` | 移除通知 | `notice: NoticeItem` | `void` |
| `readAll` | 标记所有为已读 | - | `void` |
| `clearNotice` | 清空所有通知 | - | `void` |

#### 使用示例

**通知中心**：

```vue
<template>
  <el-popover placement="bottom" width="300" trigger="click">
    <template #reference>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0">
        <el-icon><Bell /></el-icon>
      </el-badge>
    </template>

    <div class="notice-list">
      <div class="notice-header">
        <span>通知中心</span>
        <el-button link @click="handleReadAll">全部已读</el-button>
      </div>

      <div
        v-for="(notice, index) in noticeStore.notices"
        :key="index"
        :class="['notice-item', { unread: !notice.read }]"
        @click="handleNoticeClick(notice)"
      >
        <div class="notice-title">{{ notice.title }}</div>
        <div class="notice-message">{{ notice.message }}</div>
        <div class="notice-time">{{ notice.time }}</div>
        <el-button link @click.stop="handleRemove(notice)">删除</el-button>
      </div>

      <el-empty v-if="noticeStore.notices.length === 0" description="暂无通知" />

      <div class="notice-footer">
        <el-button link @click="handleClearAll">清空所有</el-button>
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useNoticeStore } from '@/stores/modules/notice'

const noticeStore = useNoticeStore()

// 未读数量
const unreadCount = computed(() => {
  return noticeStore.notices.filter(n => !n.read).length
})

// 全部已读
const handleReadAll = () => {
  noticeStore.readAll()
}

// 点击通知
const handleNoticeClick = (notice: NoticeItem) => {
  notice.read = true
  // 处理通知点击逻辑
}

// 移除通知
const handleRemove = (notice: NoticeItem) => {
  noticeStore.removeNotice(notice)
}

// 清空所有
const handleClearAll = () => {
  noticeStore.clearNotice()
}
</script>

<style scoped>
.notice-list {
  max-height: 400px;
  overflow-y: auto;
}

.notice-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.notice-item.unread {
  background-color: #f0f9ff;
}

.notice-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.notice-message {
  color: #666;
  font-size: 14px;
}

.notice-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
```

**接收 WebSocket 通知**：

```typescript
// composables/useWebSocket.ts
import { useNoticeStore } from '@/stores/modules/notice'

export function useWebSocket() {
  const noticeStore = useNoticeStore()

  // WebSocket 消息处理
  const handleMessage = (message: any) => {
    if (message.type === 'notification') {
      // 添加到通知中心
      noticeStore.addNotice({
        title: message.title,
        message: message.content,
        time: new Date().toLocaleString(),
        read: false
      })

      // 显示浏览器通知
      if (Notification.permission === 'granted') {
        new Notification(message.title, {
          body: message.content
        })
      }
    }
  }

  return { handleMessage }
}
```

---

### 6. AI Chat Store - AI 聊天管理

**职责**：管理 AI 聊天会话、消息收发、流式响应处理等功能。

#### 状态定义

```typescript
interface AiChatMessage {
  id: string                    // 消息 ID
  role: 'user' | 'assistant'   // 消息角色
  content: string               // 消息内容
  timestamp: number             // 时间戳
  tokenUsage?: TokenUsage       // Token 使用情况
  status?: MessageStatus        // 消息状态
  error?: string                // 错误信息
}

interface AiChatSession {
  id: string                    // 会话 ID
  title: string                 // 会话标题
  messages: AiChatMessage[]     // 消息列表
  createdAt: number             // 创建时间
  updatedAt: number             // 更新时间
  provider?: string             // 模型提供商
  modelName?: string            // 模型名称
}

interface State {
  sessions: Map<string, AiChatSession>  // 会话集合
  currentSessionId: string | null       // 当前会话 ID
  streamingMessageId: string | null     // 流式生成消息 ID
  streamContentBuffer: string           // 流式内容缓冲区
}
```

#### 核心方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `createSession` | 创建新会话 | `options?` | `string` |
| `switchSession` | 切换会话 | `sessionId: string` | `boolean` |
| `deleteSession` | 删除会话 | `sessionId: string` | `boolean` |
| `clearAllSessions` | 清空所有会话 | - | `void` |
| `updateSessionTitle` | 更新会话标题 | `sessionId, title` | `boolean` |
| `sendMessage` | 发送消息 | `content: string, options?` | `boolean` |
| `regenerateLastMessage` | 重新生成消息 | - | `boolean` |
| `onChatStart` | 聊天开始回调 | `sessionId, messageId` | `void` |
| `appendStreamContent` | 追加流式内容 | `sessionId, messageId, content` | `void` |
| `onChatComplete` | 聊天完成回调 | `sessionId, messageId, tokenUsage` | `void` |
| `onChatError` | 聊天错误回调 | `sessionId, error` | `void` |

#### 使用示例

**AI 聊天界面**：

```vue
<template>
  <div class="ai-chat-container">
    <!-- 会话列表 -->
    <div class="session-list">
      <el-button @click="handleCreateSession">新建会话</el-button>

      <div
        v-for="session in aiChatStore.sessionList"
        :key="session.id"
        :class="['session-item', { active: session.id === aiChatStore.currentSessionId }]"
        @click="handleSwitchSession(session.id)"
      >
        <span>{{ session.title }}</span>
        <el-icon @click.stop="handleDeleteSession(session.id)">
          <Delete />
        </el-icon>
      </div>
    </div>

    <!-- 消息区域 -->
    <div class="message-area">
      <div
        v-for="message in aiChatStore.currentMessages"
        :key="message.id"
        :class="['message', message.role]"
      >
        <div class="message-content">{{ message.content }}</div>
        <div v-if="message.status === 'streaming'" class="typing-indicator">
          正在输入...
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :disabled="aiChatStore.isGenerating"
        @keydown.enter.prevent="handleSend"
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
const inputMessage = ref('')

// 创建会话
const handleCreateSession = () => {
  aiChatStore.createSession({
    title: '新对话',
    provider: 'deepseek',
    modelName: 'deepseek-chat'
  })
}

// 切换会话
const handleSwitchSession = (sessionId: string) => {
  aiChatStore.switchSession(sessionId)
}

// 删除会话
const handleDeleteSession = (sessionId: string) => {
  aiChatStore.deleteSession(sessionId)
}

// 发送消息
const handleSend = () => {
  if (!inputMessage.value.trim()) return

  aiChatStore.sendMessage(inputMessage.value, {
    temperature: 0.7
  })

  inputMessage.value = ''
}
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  height: 100vh;
}

.session-list {
  width: 250px;
  border-right: 1px solid #eee;
  padding: 16px;
}

.session-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.session-item.active {
  background-color: #e6f7ff;
}

.message-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.message {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
}

.message.user {
  background-color: #e6f7ff;
  margin-left: 20%;
}

.message.assistant {
  background-color: #f5f5f5;
  margin-right: 20%;
}

.input-area {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}
</style>
```

---

## 使用规范

### 1. 在组件中使用 Store

**基本使用**：

```vue
<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'

// 获取 Store 实例
const userStore = useUserStore()

// 访问状态
console.log(userStore.userInfo)
console.log(userStore.token)

// 调用方法
await userStore.fetchUserInfo()
</script>
```

**响应式访问**：

```vue
<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 使用 computed 确保响应式
const nickname = computed(() => userStore.userInfo?.nickName || '')
const isLogin = computed(() => !!userStore.token)
</script>
```

### 2. 跨 Store 协作

Store 之间可以相互调用：

```typescript
// stores/modules/permission.ts
import { useAuth } from '@/composables/useAuth'

export const usePermissionStore = defineStore('permission', () => {
  // 使用 auth composable 获取权限判断能力
  const { hasPermission, hasRole } = useAuth()

  const filterRoutes = (routes: Route[]) => {
    return routes.filter(route => {
      if (route.permissions) {
        return hasPermission(route.permissions)
      }
      if (route.roles) {
        return hasRole(route.roles)
      }
      return true
    })
  }

  return { filterRoutes }
})
```

### 3. 异步操作规范

**统一使用 Result 类型处理异步结果**：

```typescript
type Result<T> = [Error | null, T | null]

// Store 方法
const loginUser = async (loginRequest: LoginRequest): Result<void> => {
  const [err, data] = await userLogin(loginRequest)
  if (err) {
    return [err, null]
  }

  // 处理成功逻辑
  token.value = data.access_token
  return [null, null]
}

// 组件中使用
const handleLogin = async () => {
  const [err] = await userStore.loginUser(form.value)
  if (err) {
    ElMessage.error('登录失败: ' + err.message)
    return
  }

  ElMessage.success('登录成功')
}
```

### 4. TypeScript 类型支持

**定义完整的类型**：

```typescript
// types/store.ts
export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  avatar: string
  phonenumber: string
  email: string
}

// stores/modules/user.ts
import type { UserInfo } from '@/types/store'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  return { userInfo }
})
```

---

## 最佳实践

### 1. 避免直接修改状态

**❌ 错误做法**：

```typescript
// 直接修改 Store 状态
userStore.userInfo.nickName = '新昵称'
```

**✅ 正确做法**：

```typescript
// 通过 Store 提供的方法修改
userStore.updateUserInfo({ nickName: '新昵称' })
```

### 2. 合理使用计算属性

**派生状态使用 computed**：

```typescript
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  // ✅ 使用 computed 创建派生状态
  const isLogin = computed(() => !!userInfo.value)
  const nickname = computed(() => userInfo.value?.nickName || '游客')

  return { userInfo, isLogin, nickname }
})
```

### 3. 异步操作错误处理

**统一的错误处理机制**：

```typescript
const fetchUserInfo = async (): Result<void> => {
  try {
    const [err, data] = await getUserInfo()
    if (err) {
      console.error('获取用户信息失败:', err)
      return [err, null]
    }

    userInfo.value = data.user
    roles.value = data.roles
    permissions.value = data.permissions

    return [null, null]
  } catch (error) {
    console.error('未知错误:', error)
    return [new Error('获取用户信息失败'), null]
  }
}
```

### 4. 模块职责清晰

**每个 Store 职责单一，不跨界处理其他模块的业务**：

```typescript
// ❌ 错误：在 dict store 中处理用户逻辑
export const useDictStore = defineStore('dict', () => {
  const userStore = useUserStore()

  const loadDict = async () => {
    // ❌ 不应该在这里检查用户权限
    if (!userStore.token) return
  }
})

// ✅ 正确：职责分离
export const useDictStore = defineStore('dict', () => {
  const loadDict = async (dictType: string) => {
    // 只处理字典相关逻辑
    const [err, data] = await getDictData(dictType)
    // ...
  }
})
```

### 5. 类型定义完整

**确保 TypeScript 类型覆盖**：

```typescript
// ✅ 完整的类型定义
interface LoginRequest {
  userName: string
  password: string
  code: string
  uuid: string
}

interface LoginResponse {
  access_token: string
  expire_in: number
}

const loginUser = async (request: LoginRequest): Result<void> => {
  const [err, data] = await userLogin(request)
  // TypeScript 能够推导 data 的类型
  if (data) {
    token.value = data.access_token
  }
}
```

---

## 常见问题

### 1. Store 状态没有响应式更新？

**问题原因**：

- 直接修改了嵌套对象的属性
- 没有使用 computed 访问派生状态
- 使用了解构赋值丢失响应式

**解决方案**：

```typescript
// ❌ 错误：解构丢失响应式
const { userInfo } = useUserStore()

// ✅ 正确：保持响应式引用
const userStore = useUserStore()
const nickname = computed(() => userStore.userInfo?.nickName)

// ✅ 或使用 storeToRefs
import { storeToRefs } from 'pinia'
const { userInfo } = storeToRefs(useUserStore())
```

### 2. 如何在 Store 之间共享数据？

**解决方案**：

```typescript
// 方案 1: 通过 composable 共享逻辑
// composables/useAuth.ts
export function useAuth() {
  const userStore = useUserStore()

  const hasPermission = (permission: string) => {
    return userStore.permissions.includes(permission)
  }

  return { hasPermission }
}

// 方案 2: Store 之间直接调用
export const usePermissionStore = defineStore('permission', () => {
  const userStore = useUserStore()

  const filterRoutes = () => {
    // 使用 userStore 的数据
    const roles = userStore.roles
    // ...
  }
})
```

### 3. Store 数据持久化怎么做？

**解决方案**：

```typescript
// 使用 pinia-plugin-persistedstate 插件
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 在 Store 中配置持久化
export const useUserStore = defineStore('user', () => {
  // ...
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'userInfo']  // 只持久化这些字段
  }
})
```

### 4. 如何在 Pinia 中使用 Router？

**解决方案**：

```typescript
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  // ⚠️ 注意：不要在 setup 顶层直接调用 useRouter
  // const router = useRouter()  // ❌ 错误

  const logoutUser = async (): Result<void> => {
    // ✅ 正确：在方法内部调用
    const router = useRouter()

    await userLogout()
    token.value = ''
    userInfo.value = null

    router.push('/login')
    return [null, null]
  }

  return { logoutUser }
})
```

### 5. Store 方法报错 "Cannot read property of null"？

**问题原因**：

访问了可能为 null 的状态

**解决方案**：

```typescript
// ❌ 错误：没有检查 null
const nickname = userStore.userInfo.nickName

// ✅ 正确：使用可选链和默认值
const nickname = userStore.userInfo?.nickName || '未设置'

// ✅ 或在 computed 中处理
const nickname = computed(() => {
  return userStore.userInfo?.nickName || '游客'
})
```

---

## 总结

RuoYi-Plus-UniApp 前端项目的状态管理体系基于 Pinia 构建，具有以下特点：

**✅ 优势**：

1. **类型安全** - 完整的 TypeScript 支持，减少运行时错误
2. **模块化** - 6 个职责清晰的 Store 模块，易于维护
3. **开发体验** - Composition API 风格，代码简洁直观
4. **性能优化** - 细粒度响应式更新，按需加载
5. **扩展性强** - 易于添加新的 Store 模块

**📋 模块总结**：

- **User Store**: 用户认证、权限管理
- **Permission Store**: 动态路由、菜单生成
- **Dict Store**: 字典数据、标签转换
- **Feature Store**: 功能开关、配置管理
- **Notice Store**: 通知消息、已读管理
- **AI Chat Store**: AI 聊天、会话管理

**🎯 最佳实践**：

1. 通过 Store 提供的方法修改状态
2. 使用 computed 访问派生状态
3. 统一的异步错误处理机制
4. 保持模块职责单一
5. 完整的 TypeScript 类型定义

遵循这些规范和最佳实践，可以构建出健壮、可维护的状态管理系统。
