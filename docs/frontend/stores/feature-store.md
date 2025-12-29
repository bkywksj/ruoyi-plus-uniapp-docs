# useFeatureStore 功能开关状态管理

## 介绍

`useFeatureStore` 是基于 Pinia 的系统功能配置管理模块，提供统一的功能开关管理。该模块从服务端获取系统功能配置，用于控制应用中各项功能的启用状态，实现功能的动态开关和权限控制。

**核心特性：**

- **集中管理** - 统一管理系统级功能开关，如 AI 功能、WebSocket、SSE、OpenAPI 等
- **服务端配置** - 功能配置从服务端获取，支持动态调整无需重新部署
- **权限控制** - OpenAPI 访问支持多种权限模式：全员、超管、管理员、指定角色
- **初始化保护** - 防止重复初始化，确保配置只加载一次
- **降级处理** - 服务端获取失败时自动使用默认配置

## 基础用法

### 初始化功能配置

在应用启动时初始化功能配置：

```typescript
// main.ts 或 App.vue
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

// 应用启动时初始化
await featureStore.initFeatures()
```

**在 App.vue 中初始化：**

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

onMounted(async () => {
  // 初始化系统功能配置
  await featureStore.initFeatures()
})
</script>
```

### 检查功能是否启用

```vue
<template>
  <div class="feature-demo">
    <!-- AI 功能入口 -->
    <div v-if="features.langchain4jEnabled" class="ai-feature">
      <el-button type="primary" @click="openAiChat">
        <el-icon><ChatDotRound /></el-icon>
        AI 助手
      </el-button>
    </div>

    <!-- WebSocket 功能 -->
    <div v-if="features.websocketEnabled" class="ws-feature">
      <span class="status-dot" :class="{ online: wsConnected }" />
      实时通讯已启用
    </div>

    <!-- SSE 功能 -->
    <div v-if="features.sseEnabled" class="sse-feature">
      <el-icon><Bell /></el-icon>
      消息推送已启用
    </div>

    <!-- OpenAPI 功能 -->
    <div v-if="canAccessOpenApi" class="openapi-feature">
      <el-button @click="openApiDocs">
        <el-icon><Document /></el-icon>
        API 文档
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

// 功能配置
const features = computed(() => featureStore.features)

// 检查当前用户是否可以访问 OpenAPI
const canAccessOpenApi = computed(() => {
  const userRoles = userStore.roles || []
  return featureStore.canUseOpenApi(userRoles)
})

const openAiChat = () => {
  // 打开 AI 聊天
}

const openApiDocs = () => {
  // 打开 API 文档
}
</script>
```

### 条件渲染组件

```vue
<template>
  <div class="app-container">
    <!-- 根据功能开关渲染不同组件 -->
    <AiChatPanel v-if="features.langchain4jEnabled" />
    <WebSocketProvider v-if="features.websocketEnabled">
      <NotificationCenter />
    </WebSocketProvider>
    <SseNotification v-if="features.sseEnabled" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()
const features = computed(() => featureStore.features)
</script>
```

## OpenAPI 权限控制

### 访问模式说明

OpenAPI 功能支持四种访问模式：

| 模式 | 说明 | 允许访问的用户 |
|------|------|----------------|
| `ALL` | 全员模式 | 所有已登录用户 |
| `SUPER_ADMIN` | 超级管理员模式 | 仅超级管理员 |
| `ADMIN` | 管理员模式 | 超级管理员和普通管理员 |
| `ROLES` | 指定角色模式 | 拥有指定角色的用户 |

### 检查访问权限

```typescript
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

// 获取用户角色
const userRoles = userStore.roles // ['admin', 'editor']

// 检查是否可以使用 OpenAPI
const canAccess = featureStore.canUseOpenApi(userRoles)

if (canAccess) {
  console.log('用户可以访问 OpenAPI')
} else {
  console.log('用户无权访问 OpenAPI')
}
```

### 在路由守卫中使用

```typescript
// router/guards/featureGuard.ts
import type { Router } from 'vue-router'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

export const createFeatureGuard = (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    const featureStore = useFeatureStore()
    const userStore = useUserStore()

    // 确保功能配置已初始化
    if (!featureStore.initialized) {
      await featureStore.initFeatures()
    }

    // 检查 AI 功能路由
    if (to.path.startsWith('/ai-chat') && !featureStore.features.langchain4jEnabled) {
      next({ path: '/403', query: { feature: 'AI' } })
      return
    }

    // 检查 OpenAPI 文档路由
    if (to.path.startsWith('/api-docs')) {
      const canAccess = featureStore.canUseOpenApi(userStore.roles)
      if (!canAccess) {
        next({ path: '/403', query: { feature: 'OpenAPI' } })
        return
      }
    }

    next()
  })
}
```

### 在菜单中过滤

```typescript
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

// 根据功能开关过滤菜单
const filteredMenus = computed(() => {
  const allMenus = [
    { path: '/dashboard', title: '仪表盘', feature: null },
    { path: '/ai-chat', title: 'AI 助手', feature: 'langchain4jEnabled' },
    { path: '/api-docs', title: 'API 文档', feature: 'openApiEnabled' },
    { path: '/notifications', title: '消息中心', feature: 'websocketEnabled' }
  ]

  return allMenus.filter(menu => {
    if (!menu.feature) return true

    // 检查功能是否启用
    const isEnabled = featureStore.features[menu.feature as keyof SystemFeature]
    if (!isEnabled) return false

    // OpenAPI 需要额外检查权限
    if (menu.feature === 'openApiEnabled') {
      return featureStore.canUseOpenApi(userStore.roles)
    }

    return true
  })
})
```

## API

### State

| 状态 | 类型 | 说明 |
|------|------|------|
| features | `Ref<SystemFeature>` | 系统功能配置 |
| initialized | `Ref<boolean>` | 是否已初始化 |

### SystemFeature

```typescript
interface SystemFeature {
  /** LangChain4j AI 功能是否启用 */
  langchain4jEnabled: boolean
  /** WebSocket 功能是否启用 */
  websocketEnabled: boolean
  /** SSE 功能是否启用 */
  sseEnabled: boolean
  /** OpenAPI 功能是否启用 */
  openApiEnabled: boolean
  /** OpenAPI 访问模式 */
  openApiAccessMode: 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'ROLES'
  /** OpenAPI 允许的角色列表（ROLES 模式下使用） */
  openApiAllowedRoles: string[]
}
```

### Actions

#### initFeatures

初始化功能配置，从服务端获取配置数据。

```typescript
async function initFeatures(): Promise<void>
```

**说明：**
- 该方法只会执行一次，重复调用会直接返回
- 服务端获取失败时会使用默认配置（所有功能禁用）

**使用示例：**

```typescript
const featureStore = useFeatureStore()

// 初始化（推荐在应用启动时调用）
await featureStore.initFeatures()

// 重复调用不会重新请求
await featureStore.initFeatures() // 直接返回，不会发起请求
```

#### canUseOpenApi

检查当前用户是否可以使用开放 API。

```typescript
function canUseOpenApi(userRoles: string[]): boolean
```

| 参数 | 类型 | 说明 |
|------|------|------|
| userRoles | `string[]` | 用户角色数组 |

**返回值：** 是否可以使用 OpenAPI

**使用示例：**

```typescript
const featureStore = useFeatureStore()

// 全员模式
featureStore.canUseOpenApi(['user']) // true

// 超管模式
featureStore.canUseOpenApi(['superadmin']) // true
featureStore.canUseOpenApi(['admin']) // false

// 管理员模式
featureStore.canUseOpenApi(['admin']) // true
featureStore.canUseOpenApi(['editor']) // false

// 指定角色模式（假设 allowedRoles = ['developer', 'tester']）
featureStore.canUseOpenApi(['developer']) // true
featureStore.canUseOpenApi(['editor']) // false
```

### 默认配置

当服务端获取失败时使用的默认配置：

```typescript
const defaultFeatures: SystemFeature = {
  langchain4jEnabled: false,
  websocketEnabled: false,
  sseEnabled: false,
  openApiEnabled: false,
  openApiAccessMode: 'ALL',
  openApiAllowedRoles: []
}
```

## 最佳实践

### 1. 应用启动时初始化

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useFeatureStore } from '@/stores/modules/feature'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 初始化功能配置
const featureStore = useFeatureStore()
await featureStore.initFeatures()

app.mount('#app')
```

### 2. 创建功能检查组合函数

```typescript
// composables/useFeatureCheck.ts
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

export function useFeatureCheck() {
  const featureStore = useFeatureStore()
  const userStore = useUserStore()

  /** AI 功能是否可用 */
  const isAiEnabled = computed(() => featureStore.features.langchain4jEnabled)

  /** WebSocket 是否可用 */
  const isWsEnabled = computed(() => featureStore.features.websocketEnabled)

  /** SSE 是否可用 */
  const isSseEnabled = computed(() => featureStore.features.sseEnabled)

  /** OpenAPI 是否可访问 */
  const canAccessOpenApi = computed(() => {
    return featureStore.canUseOpenApi(userStore.roles || [])
  })

  /** 检查指定功能是否启用 */
  const isFeatureEnabled = (feature: keyof SystemFeature): boolean => {
    return !!featureStore.features[feature]
  }

  return {
    isAiEnabled,
    isWsEnabled,
    isSseEnabled,
    canAccessOpenApi,
    isFeatureEnabled
  }
}
```

**使用：**

```vue
<template>
  <div>
    <AiChat v-if="isAiEnabled" />
    <ApiDocs v-if="canAccessOpenApi" />
  </div>
</template>

<script lang="ts" setup>
import { useFeatureCheck } from '@/composables/useFeatureCheck'

const { isAiEnabled, canAccessOpenApi } = useFeatureCheck()
</script>
```

### 3. 功能降级处理

```vue
<template>
  <div class="notification-center">
    <!-- 优先使用 WebSocket -->
    <WebSocketNotification v-if="features.websocketEnabled" />
    <!-- 降级使用 SSE -->
    <SseNotification v-else-if="features.sseEnabled" />
    <!-- 最终降级使用轮询 -->
    <PollingNotification v-else />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()
const features = computed(() => featureStore.features)
</script>
```

### 4. 动态加载组件

```typescript
import { defineAsyncComponent, computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

// 根据功能开关动态加载组件
const AiChatComponent = computed(() => {
  if (featureStore.features.langchain4jEnabled) {
    return defineAsyncComponent(() => import('@/components/AiChat/index.vue'))
  }
  return null
})

const WebSocketProvider = computed(() => {
  if (featureStore.features.websocketEnabled) {
    return defineAsyncComponent(() => import('@/components/WebSocket/Provider.vue'))
  }
  return null
})
```

### 5. 结合权限系统

```typescript
import { computed } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'

export function useFullAccessCheck() {
  const featureStore = useFeatureStore()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  /**
   * 检查是否有权限访问某个功能
   * @param feature 功能名称
   * @param permission 所需权限
   */
  const canAccess = (feature: string, permission?: string): boolean => {
    // 1. 检查功能是否启用
    const featureEnabled = featureStore.features[feature as keyof SystemFeature]
    if (!featureEnabled) return false

    // 2. 如果需要检查权限
    if (permission) {
      const hasPermission = permissionStore.hasPermission(permission)
      if (!hasPermission) return false
    }

    // 3. OpenAPI 特殊处理
    if (feature === 'openApiEnabled') {
      return featureStore.canUseOpenApi(userStore.roles || [])
    }

    return true
  }

  return { canAccess }
}
```

## 常见问题

### 1. 功能配置未生效

**问题原因：**
- 未调用 `initFeatures` 初始化
- 初始化时机过晚

**解决方案：**

```typescript
// 确保在使用功能前完成初始化
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

// 检查是否已初始化
if (!featureStore.initialized) {
  await featureStore.initFeatures()
}

// 现在可以安全使用功能配置
console.log('AI 功能:', featureStore.features.langchain4jEnabled)
```

### 2. OpenAPI 权限检查失败

**问题原因：**
- 用户角色数据未加载
- 角色名称不匹配

**解决方案：**

```typescript
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'

const featureStore = useFeatureStore()
const userStore = useUserStore()

// 确保用户信息已加载
await userStore.getUserInfo()

// 检查用户角色
console.log('用户角色:', userStore.roles)

// 检查配置的允许角色
console.log('允许角色:', featureStore.features.openApiAllowedRoles)

// 执行权限检查
const canAccess = featureStore.canUseOpenApi(userStore.roles || [])
console.log('可以访问:', canAccess)
```

### 3. 服务端配置获取失败

**问题原因：**
- 网络问题
- 接口异常
- 权限不足

**解决方案：**

```typescript
import { useFeatureStore } from '@/stores/modules/feature'
import { ElMessage } from 'element-plus'

const featureStore = useFeatureStore()

try {
  await featureStore.initFeatures()

  // 检查是否使用了默认配置
  if (!featureStore.features.langchain4jEnabled &&
      !featureStore.features.websocketEnabled &&
      !featureStore.features.sseEnabled) {
    console.warn('可能使用了默认配置，部分功能已禁用')
  }
} catch (error) {
  ElMessage.warning('功能配置加载失败，部分功能可能不可用')
}
```

### 4. 功能状态不同步

**问题原因：**
- 配置在运行时被修改
- 多标签页数据不一致

**解决方案：**

```typescript
import { watch } from 'vue'
import { useFeatureStore } from '@/stores/modules/feature'

const featureStore = useFeatureStore()

// 监听功能配置变化
watch(
  () => featureStore.features,
  (newFeatures, oldFeatures) => {
    // 检测变化并做出响应
    if (newFeatures.langchain4jEnabled !== oldFeatures.langchain4jEnabled) {
      console.log('AI 功能状态已变化')
      // 刷新相关组件或页面
    }
  },
  { deep: true }
)

// 跨标签页同步（可选）
window.addEventListener('storage', (event) => {
  if (event.key === 'feature_config_updated') {
    // 重新加载配置
    featureStore.initialized = false
    featureStore.initFeatures()
  }
})
```

### 5. 初始化顺序问题

**问题原因：**
- 功能配置依赖用户信息
- 需要特定的初始化顺序

**解决方案：**

```typescript
// 正确的初始化顺序
import { useUserStore } from '@/stores/modules/user'
import { useFeatureStore } from '@/stores/modules/feature'

const initApp = async () => {
  const userStore = useUserStore()
  const featureStore = useFeatureStore()

  // 1. 先获取用户信息
  await userStore.getUserInfo()

  // 2. 再初始化功能配置
  await featureStore.initFeatures()

  // 3. 最后进行权限检查
  const canAccessApi = featureStore.canUseOpenApi(userStore.roles)

  return { canAccessApi }
}
```
