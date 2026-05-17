# 组件封装规范

## 介绍

本文档定义了 RuoYi-Plus-UniApp 项目中组件封装的规范标准，包括命名规则、代码组织、类型定义、样式规范等内容，确保团队开发的一致性和代码质量。组件封装是构建可维护、可复用、高质量应用的基础，遵循统一的规范能够大幅提升开发效率和代码可读性。

**核心规范要点:**

- **命名规范** - 统一的文件、组件、变量、CSS 类名命名规则
- **代码组织** - 规范的代码结构和模块顺序
- **类型规范** - TypeScript 类型定义标准
- **样式规范** - SCSS、BEM 命名和主题变量约定
- **文档规范** - 组件文档和注释标准
- **通信规范** - 组件间通信模式和最佳实践
- **性能规范** - 组件性能优化指南
- **测试规范** - 组件测试标准

## 架构设计

### 组件系统架构图

```text
┌─────────────────────────────────────────────────────────────┐
│                    组件系统架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    应用层                             │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │    │
│  │  │  页面   │  │  页面   │  │  页面   │  ...        │    │
│  │  └────┬────┘  └────┬────┘  └────┬────┘             │    │
│  └───────┼───────────┼───────────┼─────────────────────┘    │
│          │           │           │                          │
│  ┌───────▼───────────▼───────────▼─────────────────────┐    │
│  │                  业务组件层                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │AuthModal │  │UserCard  │  │OrderList │  ...     │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │    │
│  └───────┼─────────────┼─────────────┼─────────────────┘    │
│          │             │             │                      │
│  ┌───────▼─────────────▼─────────────▼─────────────────┐    │
│  │                  基础组件层 (WD UI)                  │    │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │    │
│  │  │ Button │  │ Input  │  │  Form  │  │ Popup  │    │    │
│  │  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘    │    │
│  └──────┼───────────┼───────────┼───────────┼──────────┘    │
│         │           │           │           │               │
│  ┌──────▼───────────▼───────────▼───────────▼──────────┐    │
│  │                  工具函数层                          │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │    │
│  │  │Composables│ │ Utils  │  │ Stores │              │    │
│  │  └─────────┘  └─────────┘  └─────────┘             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  平台适配层                          │    │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │    │
│  │  │   H5   │  │ 微信   │  │ 支付宝 │  │  App   │    │    │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 组件生命周期流程

```text
┌──────────────────────────────────────────────────────────────┐
│                    组件生命周期流程                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│    ┌─────────┐                                               │
│    │ 创建阶段 │                                               │
│    └────┬────┘                                               │
│         │                                                     │
│         ▼                                                     │
│    ┌─────────────────────────────────────────┐               │
│    │ setup() - 组合式 API 入口                │               │
│    │   ├─ defineProps() - 定义属性           │               │
│    │   ├─ defineEmits() - 定义事件           │               │
│    │   ├─ ref/reactive - 响应式数据          │               │
│    │   ├─ computed - 计算属性                │               │
│    │   └─ watch/watchEffect - 侦听器         │               │
│    └────────────────┬────────────────────────┘               │
│                     │                                         │
│                     ▼                                         │
│    ┌─────────────────────────────────────────┐               │
│    │ onBeforeMount() - 挂载前                │               │
│    │   └─ 初始化逻辑                         │               │
│    └────────────────┬────────────────────────┘               │
│                     │                                         │
│                     ▼                                         │
│    ┌─────────────────────────────────────────┐               │
│    │ onMounted() - 挂载完成                  │               │
│    │   ├─ DOM 操作                           │               │
│    │   ├─ 异步数据请求                       │               │
│    │   └─ 事件监听注册                       │               │
│    └────────────────┬────────────────────────┘               │
│                     │                                         │
│         ┌───────────┴───────────┐                            │
│         │      更新阶段          │                            │
│         ▼                       ▼                            │
│    ┌─────────┐           ┌──────────────┐                    │
│    │ 数据变化 │◄─────────►│ onUpdated()  │                    │
│    └─────────┘           └──────────────┘                    │
│                                                               │
│                     │                                         │
│                     ▼                                         │
│    ┌─────────────────────────────────────────┐               │
│    │ onBeforeUnmount() - 卸载前              │               │
│    │   ├─ 清理定时器                         │               │
│    │   ├─ 取消事件监听                       │               │
│    │   └─ 取消网络请求                       │               │
│    └────────────────┬────────────────────────┘               │
│                     │                                         │
│                     ▼                                         │
│    ┌─────────────────────────────────────────┐               │
│    │ onUnmounted() - 卸载完成                │               │
│    └─────────────────────────────────────────┘               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 命名规范

### 文件命名

```text
# 组件文件：小写连字符 (kebab-case)
user-card.vue          ✅ 正确
UserCard.vue           ❌ 错误 - 不使用 PascalCase
userCard.vue           ❌ 错误 - 不使用 camelCase

# 组件目录结构
components/
├── user-card/
│   ├── user-card.vue      # 组件主文件
│   ├── types.ts           # 类型定义文件
│   ├── index.ts           # 导出文件
│   └── README.md          # 组件文档（可选）

# 类型文件命名
types.ts               ✅ 通用类型文件
user-card.types.ts     ✅ 组件专用类型文件
UserCard.types.ts      ❌ 错误

# 导出文件
index.ts               ✅ 标准导出文件名

# Composable 文件命名
use-user.ts            ✅ 正确 - 以 use 开头
useUser.ts             ❌ 不推荐
user-composable.ts     ❌ 不推荐
```

### 组件名称

```typescript
// 组件名使用 PascalCase，在 defineOptions 中声明
defineOptions({
  name: 'UserCard',        // ✅ 正确 - PascalCase
  // name: 'user-card',    // ❌ 错误 - 不使用 kebab-case
  // name: 'userCard',     // ❌ 错误 - 不使用 camelCase
})

// WD UI 组件命名规范：以 Wd 为前缀
defineOptions({
  name: 'WdButton',        // ✅ 正确 - WD UI 组件
  name: 'WdInput',         // ✅ 正确
})

// 业务组件命名规范：语义化命名
defineOptions({
  name: 'AuthModal',       // ✅ 正确 - 认证弹窗
  name: 'UserSelect',      // ✅ 正确 - 用户选择器
  name: 'OrderCard',       // ✅ 正确 - 订单卡片
})
```

### Props 接口命名

```typescript
// 接口名：组件名 + Props
interface UserCardProps { }     // ✅ 正确
interface IUserCardProps { }    // ❌ 错误 - 不使用 I 前缀
interface UserCardPropsType { } // ❌ 错误 - 不需要 Type 后缀

// WD UI 组件 Props 命名
interface WdButtonProps { }     // ✅ 正确
interface WdInputProps { }      // ✅ 正确

// 复杂 Props 拆分
interface UserCardBaseProps {
  userId: string
  name?: string
}

interface UserCardStyleProps {
  customClass?: string
  customStyle?: string | Record<string, string>
}

// 组合 Props
interface UserCardProps extends UserCardBaseProps, UserCardStyleProps {
  showBadge?: boolean
}
```

### Emits 接口命名

```typescript
// 接口名：组件名 + Emits
interface UserCardEmits {       // ✅ 正确
  (e: 'click', userId: string): void
  (e: 'load', data: UserInfo): void
}

// 替代方案：使用 Events 后缀（不推荐）
interface UserCardEvents { }    // ❌ 不推荐，统一使用 Emits

// 简单事件定义
type UserCardEmits = {
  click: [userId: string]
  load: [data: UserInfo]
  error: [error: Error]
}
```

### 变量命名

```typescript
// 响应式变量：camelCase
const isLoading = ref(false)    // ✅ 正确
const currentUser = ref(null)   // ✅ 正确
const is_loading = ref(false)   // ❌ 错误 - 不使用下划线

// 常量：SCREAMING_SNAKE_CASE
const MAX_COUNT = 100           // ✅ 正确 - 模块级常量
const DEFAULT_PAGE_SIZE = 20    // ✅ 正确
const API_BASE_URL = '/api'     // ✅ 正确
const maxCount = 100            // ❌ 错误 - 常量应使用大写

// 函数：camelCase + 动词前缀
const handleClick = () => { }   // ✅ 正确 - 事件处理函数
const onClick = () => { }       // ✅ 正确 - 事件处理函数
const fetchUserData = () => { } // ✅ 正确 - 数据获取函数
const computeTotal = () => { }  // ✅ 正确 - 计算函数
const validateForm = () => { }  // ✅ 正确 - 验证函数
const click = () => { }         // ❌ 错误 - 缺少动词前缀

// 私有方法：下划线前缀（可选）
const _internalHelper = () => { } // ✅ 可选 - 内部辅助函数

// 布尔值命名
const isVisible = ref(true)     // ✅ is 前缀
const hasError = ref(false)     // ✅ has 前缀
const canSubmit = ref(true)     // ✅ can 前缀
const shouldRefresh = ref(false)// ✅ should 前缀
```

### CSS 类名

```scss
// BEM 命名规范
.user-card { }                  // Block - 块
.user-card__header { }          // Element - 元素
.user-card__title { }           // Element
.user-card__avatar { }          // Element
.user-card--large { }           // Modifier - 修饰符
.user-card--small { }           // Modifier
.user-card.is-active { }        // State - 状态类
.user-card.is-disabled { }      // State
.user-card.is-loading { }       // State

// 组合使用示例
.user-card {
  &__header {
    &--sticky { }               // Element + Modifier
  }

  &--large {
    .user-card__title { }       // Block Modifier 影响 Element
  }
}

// 工具类命名
.u-flex { }                     // u- 前缀表示工具类
.u-text-center { }
.u-mb-20 { }
```

## 代码组织

### 组件结构顺序

```vue
<template>
  <!-- 1. 模板内容 - 保持清晰的层级结构 -->
  <view :class="rootClass" :style="rootStyle">
    <!-- 条件渲染放在前面 -->
    <view v-if="loading" class="user-card__loading">
      <wd-loading />
    </view>

    <!-- 主要内容 -->
    <template v-else>
      <view class="user-card__header">
        <slot name="header" />
      </view>

      <view class="user-card__content">
        <slot />
      </view>

      <view class="user-card__footer">
        <slot name="footer" />
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
// ==================== 1. 导入语句 ====================
// 按以下顺序分组，每组之间空一行

// 1.1 Vue 核心
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// 1.2 类型导入（单独分组）
import type { PropType, CSSProperties } from 'vue'
import type { UserInfo } from '@/types'

// 1.3 第三方库
import dayjs from 'dayjs'

// 1.4 项目内部模块
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'

// 1.5 组件导入
import WdButton from '@/wd/components/wd-button/wd-button.vue'
import UserAvatar from '../user-avatar/user-avatar.vue'

// 1.6 本地模块
import type { UserCardProps, UserCardEmits } from './types'
import { USER_CARD_DEFAULTS } from './constants'

// ==================== 2. 组件配置 ====================
defineOptions({
  name: 'UserCard',
  options: {
    addGlobalClass: true,      // 允许使用全局样式
    virtualHost: true,         // 虚拟主机节点
    styleIsolation: 'shared',  // 样式隔离模式
  },
})

// ==================== 3. Props 定义 ====================
const props = withDefaults(defineProps<UserCardProps>(), {
  size: 'medium',
  showBadge: false,
  customClass: '',
})

// ==================== 4. Emits 定义 ====================
const emit = defineEmits<UserCardEmits>()

// ==================== 5. 响应式状态 ====================
// 5.1 本地状态
const isLoading = ref(false)
const currentIndex = ref(0)
const userData = ref<UserInfo | null>(null)

// 5.2 Store 引用
const userStore = useUserStore()

// ==================== 6. 计算属性 ====================
const rootClass = computed(() => {
  return [
    'user-card',
    `user-card--${props.size}`,
    props.customClass,
    {
      'is-loading': isLoading.value,
      'is-active': props.showBadge,
    },
  ]
})

const rootStyle = computed(() => {
  const style: CSSProperties = {}
  if (props.customStyle) {
    Object.assign(style, props.customStyle)
  }
  return style
})

const displayName = computed(() => {
  return userData.value?.name || props.name || '未知用户'
})

// ==================== 7. 侦听器 ====================
watch(
  () => props.userId,
  (newId) => {
    if (newId) {
      loadUserData(newId)
    }
  },
  { immediate: true }
)

watch(
  () => userStore.currentUser,
  (user) => {
    if (user?.id === props.userId) {
      userData.value = user
    }
  }
)

// ==================== 8. 方法定义 ====================
// 8.1 事件处理方法
const handleClick = (event: Event) => {
  if (isLoading.value) return
  emit('click', props.userId)
}

const handleError = (error: Error) => {
  console.error('[UserCard] Error:', error)
  emit('error', error)
}

// 8.2 业务逻辑方法
const loadUserData = async (userId: string) => {
  try {
    isLoading.value = true
    const data = await userStore.fetchUser(userId)
    userData.value = data
    emit('load', data)
  } catch (error) {
    handleError(error as Error)
  } finally {
    isLoading.value = false
  }
}

const refresh = () => {
  if (props.userId) {
    loadUserData(props.userId)
  }
}

// ==================== 9. 生命周期 ====================
onMounted(() => {
  // 组件挂载后的初始化逻辑
})

onUnmounted(() => {
  // 组件卸载前的清理逻辑
})

// ==================== 10. 暴露方法 ====================
defineExpose({
  refresh,
  userData,
})
</script>

<style lang="scss" scoped>
// ==================== 11. 样式定义 ====================
@import '@/styles/variables';

.user-card {
  // 基础样式
  display: flex;
  padding: 24rpx;
  background: $-color-white;
  border-radius: 16rpx;

  // Element 样式
  &__header { }
  &__content { }
  &__footer { }

  // Modifier 样式
  &--small { }
  &--large { }

  // State 样式
  &.is-loading { }
  &.is-active { }
}
</style>
```

### 导入语句分组规范

```typescript
// ==================== 导入顺序规范 ====================

// 1. Vue 核心 API
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 2. 类型导入（使用 type 关键字）
import type { PropType, ComputedRef, Ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { UserInfo, ApiResponse } from '@/types'

// 3. 第三方库
import dayjs from 'dayjs'
import { debounce, throttle } from 'lodash-es'

// 4. 项目公共模块
import { useUserStore } from '@/stores/user'
import { useRequest } from '@/composables/use-request'
import { formatDate, formatMoney } from '@/utils/format'
import { userApi } from '@/api/user'

// 5. 相对路径组件导入
import WdButton from '@/wd/components/wd-button/wd-button.vue'
import UserAvatar from '../user-avatar/user-avatar.vue'
import InfoCard from './components/info-card.vue'

// 6. 当前模块文件
import type { UserCardProps, UserCardEmits } from './types'
import { DEFAULT_CONFIG, SIZE_MAP } from './constants'
import { useUserCard } from './composables'
```

## UniApp 组件配置

### defineOptions 配置详解

```typescript
defineOptions({
  name: 'WdButton',
  options: {
    /**
     * addGlobalClass - 允许组件使用全局样式
     *
     * 设置为 true 时，组件可以使用页面中定义的全局 CSS 类
     * 这对于主题定制和样式覆盖非常有用
     */
    addGlobalClass: true,

    /**
     * virtualHost - 虚拟主机节点
     *
     * 设置为 true 时，组件不会在 DOM 中创建额外的包装元素
     * 好处：
     * - 减少 DOM 层级
     * - 样式穿透更容易
     * - 性能更好
     */
    virtualHost: true,

    /**
     * styleIsolation - 样式隔离模式
     *
     * 可选值：
     * - 'isolated': 完全隔离，组件样式不受外部影响
     * - 'apply-shared': 应用共享样式，可使用页面样式
     * - 'shared': 共享样式，组件和页面样式互通
     *
     * 推荐使用 'shared' 以便主题定制
     */
    styleIsolation: 'shared',

    /**
     * multipleSlots - 启用多插槽支持（微信小程序）
     *
     * 设置为 true 时，组件可以使用多个具名插槽
     */
    multipleSlots: true,
  },
})
```

### 组件配置最佳实践

```typescript
// ✅ 推荐的 WD UI 组件配置
defineOptions({
  name: 'WdInput',
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

// ✅ 推荐的业务组件配置
defineOptions({
  name: 'UserCard',
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared',
  },
})

// ✅ 需要完全隔离的组件（如弹窗）
defineOptions({
  name: 'ConfirmDialog',
  options: {
    addGlobalClass: false,
    virtualHost: false,        // 弹窗需要包装元素
    styleIsolation: 'isolated',
  },
})
```

## 类型规范

### Props 类型定义

```typescript
// types.ts - 组件类型定义文件

/**
 * 用户卡片尺寸类型
 */
export type UserCardSize = 'small' | 'medium' | 'large'

/**
 * 用户卡片主题类型
 */
export type UserCardTheme = 'light' | 'dark' | 'primary'

/**
 * 用户卡片属性接口
 *
 * @description 定义 UserCard 组件的所有可配置属性
 */
export interface UserCardProps {
  /**
   * 用户 ID
   * @description 用于获取用户信息的唯一标识
   */
  userId: string

  /**
   * 用户名称
   * @description 直接显示的用户名，优先级高于 userId 获取的名称
   * @default undefined
   */
  name?: string

  /**
   * 头像地址
   * @description 用户头像的 URL 地址
   * @default undefined
   */
  avatar?: string

  /**
   * 卡片尺寸
   * @description 控制卡片的大小
   * @default 'medium'
   */
  size?: UserCardSize

  /**
   * 卡片主题
   * @description 控制卡片的主题风格
   * @default 'light'
   */
  theme?: UserCardTheme

  /**
   * 是否显示徽章
   * @description 在头像上显示状态徽章
   * @default false
   */
  showBadge?: boolean

  /**
   * 徽章内容
   * @description 徽章显示的文本或数字
   * @default undefined
   */
  badgeContent?: string | number

  /**
   * 是否可点击
   * @description 设置卡片是否响应点击事件
   * @default true
   */
  clickable?: boolean

  /**
   * 自定义类名
   * @description 添加到根元素的自定义 CSS 类名
   * @default ''
   */
  customClass?: string

  /**
   * 自定义样式
   * @description 添加到根元素的自定义内联样式
   * @default undefined
   */
  customStyle?: string | Record<string, string>
}
```

### Emits 类型定义

```typescript
/**
 * 用户卡片事件接口
 *
 * @description 定义 UserCard 组件触发的所有事件
 */
export interface UserCardEmits {
  /**
   * 点击事件
   * @description 用户点击卡片时触发
   * @param userId - 被点击用户的 ID
   */
  (e: 'click', userId: string): void

  /**
   * 数据加载完成事件
   * @description 用户数据加载成功时触发
   * @param data - 加载的用户信息
   */
  (e: 'load', data: UserInfo): void

  /**
   * 错误事件
   * @description 发生错误时触发
   * @param error - 错误对象
   */
  (e: 'error', error: Error): void

  /**
   * 值更新事件（v-model 支持）
   * @description 内部值变化时触发
   * @param value - 新的值
   */
  (e: 'update:modelValue', value: string): void
}

// 替代写法：使用类型别名
export type UserCardEmits = {
  click: [userId: string]
  load: [data: UserInfo]
  error: [error: Error]
  'update:modelValue': [value: string]
}
```

### 内部类型定义

```typescript
/**
 * 组件内部状态类型
 * @internal
 */
interface ComponentState {
  loading: boolean
  error: Error | null
  data: UserInfo | null
}

/**
 * 加载选项类型
 * @internal
 */
interface LoadOptions {
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
  /** 是否强制刷新 */
  refresh?: boolean
  /** 是否显示加载状态 */
  showLoading?: boolean
}

/**
 * 组件实例类型
 * 用于 ref 引用时的类型推断
 */
export type UserCardInstance = InstanceType<typeof UserCard>

/**
 * 组件暴露的方法类型
 */
export interface UserCardExpose {
  /** 刷新用户数据 */
  refresh: () => Promise<void>
  /** 重置组件状态 */
  reset: () => void
  /** 获取当前用户数据 */
  getUserData: () => UserInfo | null
}
```

### 类型导出规范

```typescript
// types.ts - 类型导出文件

// 导出所有类型
export interface UserCardProps { ... }
export interface UserCardEmits { ... }
export type UserCardSize = 'small' | 'medium' | 'large'
export type UserCardTheme = 'light' | 'dark' | 'primary'
export type UserCardInstance = InstanceType<typeof UserCard>

// index.ts - 组件导出文件

// 导出组件
export { default as UserCard } from './user-card.vue'

// 重新导出所有类型
export * from './types'

// 导出 Composable（如果有）
export { useUserCard } from './composables'
```

## 组件通信规范

### 父子组件通信

```typescript
// ==================== 1. Props/Emits 模式（推荐） ====================

// 父组件
<template>
  <user-card
    :user-id="userId"
    :name="userName"
    @click="handleUserClick"
    @load="handleUserLoad"
  />
</template>

<script lang="ts" setup>
const userId = ref('123')
const userName = ref('张三')

const handleUserClick = (id: string) => {
  console.log('Clicked user:', id)
}

const handleUserLoad = (data: UserInfo) => {
  console.log('User loaded:', data)
}
</script>

// 子组件
<script lang="ts" setup>
const props = defineProps<{
  userId: string
  name?: string
}>()

const emit = defineEmits<{
  click: [userId: string]
  load: [data: UserInfo]
}>()

const handleClick = () => {
  emit('click', props.userId)
}
</script>
```

### v-model 双向绑定

```typescript
// ==================== 2. v-model 模式 ====================

// 父组件
<template>
  <user-select v-model="selectedUserId" />
  <!-- 多个 v-model -->
  <date-range-picker
    v-model:start="startDate"
    v-model:end="endDate"
  />
</template>

// 子组件 - 单个 v-model
<script lang="ts" setup>
interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 创建计算属性简化使用
const innerValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

// 子组件 - 多个 v-model
<script lang="ts" setup>
interface Props {
  start: string
  end: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:start': [value: string]
  'update:end': [value: string]
}>()
</script>
```

### Provide/Inject 模式

```typescript
// ==================== 3. Provide/Inject 模式 ====================

// types.ts - 定义注入键和类型
import type { InjectionKey, Ref } from 'vue'

export interface FormContext {
  /** 表单模型数据 */
  model: Ref<Record<string, any>>
  /** 验证规则 */
  rules: Ref<Record<string, any>>
  /** 验证方法 */
  validate: () => Promise<boolean>
  /** 重置方法 */
  resetFields: () => void
  /** 注册表单项 */
  registerField: (field: FormFieldContext) => void
  /** 注销表单项 */
  unregisterField: (field: FormFieldContext) => void
}

export const FORM_KEY: InjectionKey<FormContext> = Symbol('form')

// 父组件 (Form)
<script lang="ts" setup>
import { provide, ref, reactive } from 'vue'
import { FORM_KEY, type FormContext } from './types'

const model = ref<Record<string, any>>({})
const rules = ref<Record<string, any>>({})
const fields = reactive<FormFieldContext[]>([])

const validate = async () => {
  const results = await Promise.all(
    fields.map(field => field.validate())
  )
  return results.every(Boolean)
}

const resetFields = () => {
  fields.forEach(field => field.reset())
}

const registerField = (field: FormFieldContext) => {
  fields.push(field)
}

const unregisterField = (field: FormFieldContext) => {
  const index = fields.indexOf(field)
  if (index > -1) {
    fields.splice(index, 1)
  }
}

// 提供上下文给子组件
provide<FormContext>(FORM_KEY, {
  model,
  rules,
  validate,
  resetFields,
  registerField,
  unregisterField,
})
</script>

// 子组件 (FormItem)
<script lang="ts" setup>
import { inject, onMounted, onUnmounted } from 'vue'
import { FORM_KEY, type FormContext } from './types'

const formContext = inject<FormContext>(FORM_KEY, null)

if (!formContext) {
  console.warn('[FormItem] 必须在 Form 组件内使用')
}

const fieldContext: FormFieldContext = {
  validate: () => { ... },
  reset: () => { ... },
}

onMounted(() => {
  formContext?.registerField(fieldContext)
})

onUnmounted(() => {
  formContext?.unregisterField(fieldContext)
})
</script>
```

### useParent/useChildren 模式

```typescript
// ==================== 4. useParent/useChildren 模式（WD UI） ====================

// 父组件使用 useChildren
import { useChildren } from '@/wd/components/composables/useChildren'

const TABS_KEY: InjectionKey<TabsContext> = Symbol('tabs')

const { children, linkChildren } = useChildren<TabInstance>(TABS_KEY)

// 建立父子组件链接，并提供上下文数据
linkChildren({
  activeIndex,
  setActiveIndex,
  scrollable,
})

// 子组件使用 useParent
import { useParent } from '@/wd/components/composables/useParent'

const { parent, index } = useParent<TabsContext>(TABS_KEY)

if (parent) {
  // 可以访问父组件提供的数据和方法
  const isActive = computed(() => parent.activeIndex.value === index.value)
}
```

### 事件总线模式

```typescript
// ==================== 5. 事件总线模式（跨组件通信） ====================

// 使用 mitt 或自定义事件总线
import { useEventBus } from '@/composables/use-event-bus'

// 组件 A - 发送事件
const eventBus = useEventBus()

const notifyUpdate = () => {
  eventBus.emit('user:updated', { userId: '123', name: '张三' })
}

// 组件 B - 监听事件
const eventBus = useEventBus()

onMounted(() => {
  eventBus.on('user:updated', (data) => {
    console.log('User updated:', data)
    // 处理更新
  })
})

onUnmounted(() => {
  eventBus.off('user:updated')
})
```

## 样式规范

### BEM 命名规范

```scss
// ==================== BEM 命名规范 ====================

// Block - 块级元素，代表一个独立的组件
.user-card {
  display: flex;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

// Element - 元素，块的组成部分
.user-card {
  &__avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  &__content {
    flex: 1;
    margin-left: 16rpx;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
  }

  &__desc {
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }

  &__actions {
    display: flex;
    gap: 16rpx;
  }
}

// Modifier - 修饰符，表示块或元素的状态/变体
.user-card {
  // 尺寸修饰符
  &--small {
    padding: 16rpx;

    .user-card__avatar {
      width: 60rpx;
      height: 60rpx;
    }

    .user-card__title {
      font-size: 28rpx;
    }
  }

  &--large {
    padding: 32rpx;

    .user-card__avatar {
      width: 100rpx;
      height: 100rpx;
    }

    .user-card__title {
      font-size: 36rpx;
    }
  }

  // 主题修饰符
  &--primary {
    background: linear-gradient(135deg, #4D80F0, #3366CC);

    .user-card__title,
    .user-card__desc {
      color: #fff;
    }
  }

  &--dark {
    background: #1a1a1a;

    .user-card__title {
      color: #fff;
    }

    .user-card__desc {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// State - 状态类（使用 is- 前缀）
.user-card {
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.is-loading {
    .user-card__content {
      visibility: hidden;
    }
  }

  &.is-active {
    border: 2rpx solid #4D80F0;
  }

  &.is-selected {
    background: rgba(77, 128, 240, 0.1);
  }
}
```

### 变量系统使用

```scss
// ==================== 项目样式变量 ====================

// 引入项目变量
@import '@/styles/variables';

.user-card {
  // 颜色变量
  color: $-color-content;           // 内容文字颜色
  background: $-color-white;        // 白色背景
  border-color: $-color-border;     // 边框颜色

  &__title {
    color: $-color-title;           // 标题颜色
    font-size: $-fs-title;          // 标题字号
  }

  &__desc {
    color: $-color-aid;             // 辅助文字颜色
    font-size: $-fs-secondary;      // 次要字号
  }

  // 使用主题色
  &--primary {
    background: $-color-theme;      // 主题色
    color: $-color-white;
  }

  // 功能色
  &__success {
    color: $-color-success;         // 成功色
  }

  &__warning {
    color: $-color-warning;         // 警告色
  }

  &__error {
    color: $-color-danger;          // 危险色
  }
}

// ==================== 尺寸变量 ====================
.user-card {
  // 间距
  padding: $-gap-medium;            // 中等间距
  margin: $-gap-small 0;            // 小间距

  // 圆角
  border-radius: $-radius-medium;   // 中等圆角

  // 阴影
  box-shadow: $-shadow-light;       // 浅阴影
}
```

### 响应式单位规范

```scss
// ==================== 响应式单位规范 ====================

.user-card {
  // 尺寸：使用 rpx 实现响应式
  width: 690rpx;                    // 宽度
  min-height: 160rpx;               // 最小高度
  padding: 24rpx 32rpx;             // 内边距
  margin: 24rpx 0;                  // 外边距
  border-radius: 16rpx;             // 圆角

  // 边框：使用 px 保持 1 像素清晰
  border: 1px solid #eee;           // 1像素边框
  border-bottom: 1px solid #f5f5f5;

  // 字号：使用 rpx
  font-size: 28rpx;                 // 正文字号
  line-height: 40rpx;               // 行高

  &__title {
    font-size: 32rpx;               // 标题字号
    line-height: 44rpx;
  }

  &__desc {
    font-size: 24rpx;               // 次要字号
    line-height: 36rpx;
  }

  // 图标：使用 rpx 或 px（取决于图标库）
  &__icon {
    width: 40rpx;
    height: 40rpx;
  }
}

// ==================== 安全区域适配 ====================
.user-card {
  // 底部安全区域
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);

  // 带固定高度的底部安全区
  margin-bottom: calc(100rpx + constant(safe-area-inset-bottom));
  margin-bottom: calc(100rpx + env(safe-area-inset-bottom));
}
```

### 层级管理

```scss
// ==================== Z-Index 层级规范 ====================

// 定义层级常量
$zindex-base: 0;
$zindex-dropdown: 1000;
$zindex-sticky: 1020;
$zindex-fixed: 1030;
$zindex-modal-backdrop: 1040;
$zindex-modal: 1050;
$zindex-popover: 1060;
$zindex-tooltip: 1070;
$zindex-toast: 1080;
$zindex-loading: 1090;

// 使用示例
.user-card {
  position: relative;
  z-index: $zindex-base;

  &__dropdown {
    position: absolute;
    z-index: $zindex-dropdown;
  }
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: $zindex-sticky;
}

.modal {
  position: fixed;
  z-index: $zindex-modal;

  &__backdrop {
    z-index: $zindex-modal-backdrop;
  }
}
```

## 文档规范

### 组件文档结构

````markdown
# 组件名称

## 介绍

组件功能的详细描述，包括使用场景和核心特性。

## 基本用法

### 默认用法

```vue
<template>
  <user-card :user-id="userId" @click="handleClick" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const userId = ref('123')

const handleClick = (id: string) => {
  console.log('Clicked:', id)
}
</script>
```text

### 自定义内容

```vue
<template>
  <user-card :user-id="userId">
    <template #header>
      <text>自定义头部</text>
    </template>
    <template #default>
      <text>自定义内容</text>
    </template>
  </user-card>
</template>
```text

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| userId | 用户 ID | `string` | - |
| name | 用户名称 | `string` | - |
| size | 卡片尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击卡片时触发 | `(userId: string) => void` |
| load | 数据加载完成时触发 | `(data: UserInfo) => void` |

## Slots

| 名称 | 说明 |
|------|------|
| default | 默认内容 |
| header | 头部内容 |
| footer | 底部内容 |

## Methods

通过 ref 获取组件实例后可调用以下方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| refresh | 刷新数据 | - | `Promise<void>` |
| reset | 重置状态 | - | `void` |

## 类型定义

```typescript
interface UserCardProps {
  userId: string
  name?: string
  size?: 'small' | 'medium' | 'large'
}

interface UserCardEmits {
  (e: 'click', userId: string): void
  (e: 'load', data: UserInfo): void
}
```text
````

### 代码注释规范

```typescript
/**
 * 用户卡片组件
 *
 * @description 用于展示用户基本信息的卡片组件，支持头像、名称、描述等信息展示，
 *              可配置尺寸、主题，支持点击交互。
 *
 * @example
 * ```vue
 * <user-card
 *   :user-id="userId"
 *   size="large"
 *   @click="handleClick"
 * />
 * ```
 *
 * @see {@link https://docs.example.com/components/user-card 文档链接}
 */

/**
 * 加载用户数据
 *
 * @description 根据用户 ID 从服务端获取用户详细信息
 *
 * @param userId - 用户唯一标识
 * @param options - 加载选项
 * @param options.refresh - 是否强制刷新缓存
 * @param options.showLoading - 是否显示加载状态
 * @returns 返回用户信息对象
 * @throws {Error} 当用户不存在或网络错误时抛出异常
 *
 * @example
 * ```typescript
 * const user = await loadUserData('123', { refresh: true })
 * ```
 */
const loadUserData = async (
  userId: string,
  options?: LoadOptions
): Promise<UserInfo> => {
  // 实现代码
}

/**
 * 计算显示名称
 *
 * @description 根据优先级返回用户显示名称：
 *              1. props.name（如果提供）
 *              2. userData.name（从服务端获取）
 *              3. 默认值 '未知用户'
 */
const displayName = computed(() => {
  return props.name || userData.value?.name || '未知用户'
})
```

## Props 设计原则

### 1. 使用语义化命名

```typescript
// ✅ 好的命名 - 清晰表达意图
interface Props {
  /** 是否显示头部区域 */
  showHeader: boolean
  /** 是否启用拖拽功能 */
  enableDrag: boolean
  /** 最大输入长度 */
  maxLength: number
  /** 占位提示文字 */
  placeholder: string
  /** 是否只读 */
  readonly: boolean
}

// ❌ 不好的命名 - 含义不清
interface Props {
  sh: boolean        // 不清晰，无法理解含义
  flag1: boolean     // 无意义的命名
  num: number        // 不明确具体用途
  str: string        // 过于通用
  b: boolean         // 单字母命名
}
```

### 2. 提供合理默认值

```typescript
const props = withDefaults(defineProps<Props>(), {
  // 常用默认值
  size: 'medium',           // 尺寸默认中等
  disabled: false,          // 默认不禁用
  loading: false,           // 默认不加载
  readonly: false,          // 默认可编辑

  // 数组和对象使用工厂函数（避免引用共享）
  list: () => [],
  config: () => ({}),
  options: () => [],

  // 函数默认值
  formatter: (val: string) => val,
  validator: () => true,

  // 复杂对象默认值
  pagination: () => ({
    page: 1,
    pageSize: 20,
    total: 0,
  }),
})
```

### 3. 布尔值命名约定

```typescript
interface Props {
  // is 前缀 - 表示状态
  isActive: boolean        // 是否激活
  isVisible: boolean       // 是否可见
  isValid: boolean         // 是否有效

  // has 前缀 - 表示拥有
  hasHeader: boolean       // 是否有头部
  hasBorder: boolean       // 是否有边框
  hasIcon: boolean         // 是否有图标

  // can 前缀 - 表示能力
  canEdit: boolean         // 是否可编辑
  canDelete: boolean       // 是否可删除
  canScroll: boolean       // 是否可滚动

  // show 前缀 - 表示显示
  showFooter: boolean      // 显示底部
  showClose: boolean       // 显示关闭按钮
  showArrow: boolean       // 显示箭头

  // 省略前缀使用形容词（常用属性）
  disabled: boolean        // 禁用
  loading: boolean         // 加载中
  readonly: boolean        // 只读
  required: boolean        // 必填
  clearable: boolean       // 可清除
  closable: boolean        // 可关闭
  filterable: boolean      // 可筛选
  sortable: boolean        // 可排序
}
```

### 4. 避免过度 Props

```typescript
// ❌ Props 过多 - 难以维护
interface BadProps {
  title: string
  titleColor: string
  titleSize: number
  titleWeight: string
  titleAlign: string
  titleLineHeight: number
  titleMaxLines: number
  // ... 更多 title 相关属性
  subtitle: string
  subtitleColor: string
  // ... 20+ props
}

// ✅ 使用对象聚合 - 更清晰
interface GoodProps {
  /** 标题文本 */
  title: string
  /** 标题样式配置 */
  titleStyle?: TitleStyleConfig
  /** 副标题文本 */
  subtitle?: string
  /** 副标题样式配置 */
  subtitleStyle?: TextStyleConfig
}

interface TitleStyleConfig {
  color?: string
  size?: number
  weight?: string | number
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
  maxLines?: number
}

// 使用方式
<user-card
  title="张三"
  :title-style="{ color: '#333', size: 32, weight: 'bold' }"
/>
```

### 5. 支持自定义样式

```typescript
interface Props {
  /**
   * 自定义根元素类名
   * @description 会添加到组件根元素上
   */
  customClass?: string

  /**
   * 自定义根元素样式
   * @description 支持字符串或对象格式
   */
  customStyle?: string | Record<string, string>
}

// 使用示例
<user-card
  custom-class="my-card"
  :custom-style="{ marginTop: '20rpx', background: '#f5f5f5' }"
/>
```

## 最佳实践

### 1. 保持组件纯净

```typescript
// ✅ 好的做法：通过 props 和 events 通信
const props = defineProps<{ value: string }>()
const emit = defineEmits<{ change: [value: string] }>()

const handleInput = (val: string) => {
  // 通过事件向上传递变化
  emit('change', val)
}

// ❌ 不好的做法：直接操作外部状态
const store = useStore()
const handleClick = () => {
  // 组件内部不应直接修改 store
  store.setValue('xxx')
}

// ✅ 改进：通过事件让父组件处理
const emit = defineEmits<{ submit: [value: string] }>()
const handleClick = () => {
  emit('submit', currentValue.value)
}
// 父组件监听事件并修改 store
```

### 2. 合理拆分组件

```text
# 组件粒度指南

何时抽取组件：
- 重复使用 2 次以上 → 抽取为公共组件
- 逻辑复杂度高 → 拆分为子组件
- 代码行数超过 300 行 → 考虑拆分
- 可独立测试的单元 → 抽取为组件
- 不同团队成员负责 → 拆分便于协作

何时不拆分：
- 只在一处使用的简单逻辑
- 拆分后增加不必要的通信成本
- 拆分后破坏语义完整性
```

```typescript
// ✅ 合理拆分示例
// user-card/
// ├── user-card.vue           # 主组件
// ├── components/
// │   ├── avatar.vue          # 头像子组件
// │   ├── info.vue            # 信息子组件
// │   └── actions.vue         # 操作按钮子组件
// ├── composables/
// │   └── use-user-card.ts    # 组合式函数
// ├── types.ts                # 类型定义
// └── index.ts                # 导出

// 主组件只负责组合
<template>
  <view class="user-card">
    <Avatar :src="avatar" :size="avatarSize" />
    <Info :name="name" :desc="desc" />
    <Actions @edit="handleEdit" @delete="handleDelete" />
  </view>
</template>
```

### 3. 统一错误处理

```typescript
// 定义错误处理工具
const handleError = (error: Error, context: string) => {
  // 记录错误日志
  console.error(`[UserCard] ${context}:`, error)

  // 可选：上报错误监控
  // errorReporter.capture(error, { context })

  // 触发错误事件
  emit('error', error)
}

// 在异步操作中使用
const loadData = async () => {
  try {
    isLoading.value = true
    const data = await api.getData()
    return data
  } catch (error) {
    handleError(error as Error, 'loadData')
    return null
  } finally {
    isLoading.value = false
  }
}

// 全局错误边界
const setupErrorHandler = () => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.appContext.config.errorHandler = (err, vm, info) => {
      console.error('Component Error:', err, info)
    }
  }
}
```

### 4. 性能优化实践

```typescript
// ==================== 1. 避免不必要的响应式 ====================
// ✅ 静态数据不需要 ref
const OPTIONS = ['选项1', '选项2', '选项3']

// ❌ 不必要的响应式
const options = ref(['选项1', '选项2', '选项3'])

// ==================== 2. 使用 shallowRef 处理大型对象 ====================
import { shallowRef } from 'vue'

// ✅ 大型列表使用 shallowRef
const largeList = shallowRef<DataItem[]>([])

const updateList = (newList: DataItem[]) => {
  largeList.value = newList // 整体替换触发更新
}

// ==================== 3. 计算属性缓存 ====================
// ✅ 使用计算属性缓存复杂计算
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})

// ❌ 避免在模板中进行复杂计算
// <view v-for="item in list.filter(i => i.active)" />

// ==================== 4. 事件处理函数优化 ====================
import { debounce, throttle } from 'lodash-es'

// 搜索输入防抖
const handleSearch = debounce((keyword: string) => {
  searchApi(keyword)
}, 300)

// 滚动事件节流
const handleScroll = throttle((e: Event) => {
  updateScrollPosition(e)
}, 16)

// ==================== 5. 条件渲染优化 ====================
// ✅ 使用 v-show 处理频繁切换
<view v-show="isVisible">频繁切换的内容</view>

// ✅ 使用 v-if 处理不常切换或初始隐藏
<view v-if="isLoaded">加载后才显示的内容</view>

// ==================== 6. 列表渲染优化 ====================
// ✅ 使用唯一且稳定的 key
<view v-for="item in list" :key="item.id">{{ item.name }}</view>

// ❌ 避免使用 index 作为 key
<view v-for="(item, index) in list" :key="index">{{ item.name }}</view>
```

### 5. 组件懒加载

```typescript
// ==================== 异步组件加载 ====================
import { defineAsyncComponent } from 'vue'

// 基本用法
const AsyncUserCard = defineAsyncComponent(() =>
  import('./user-card.vue')
)

// 带加载状态和错误处理
const AsyncHeavyComponent = defineAsyncComponent({
  loader: () => import('./heavy-component.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,      // 显示加载组件前的延迟
  timeout: 10000,  // 超时时间
})

// 条件加载
const DynamicComponent = computed(() => {
  if (props.type === 'simple') {
    return SimpleCard
  }
  return defineAsyncComponent(() => import('./complex-card.vue'))
})
```

### 6. 暴露组件方法

```typescript
// ==================== defineExpose 使用规范 ====================

// 子组件
<script lang="ts" setup>
import { ref } from 'vue'

const isLoading = ref(false)
const data = ref<UserInfo | null>(null)

// 刷新数据
const refresh = async () => {
  isLoading.value = true
  try {
    data.value = await fetchData()
  } finally {
    isLoading.value = false
  }
}

// 重置状态
const reset = () => {
  data.value = null
  isLoading.value = false
}

// 获取当前数据
const getData = () => data.value

// 只暴露需要的方法和数据
defineExpose({
  refresh,
  reset,
  getData,
  // 可以暴露响应式数据（只读）
  isLoading: readonly(isLoading),
})
</script>

// 父组件使用
<template>
  <user-card ref="userCardRef" />
  <button @click="handleRefresh">刷新</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { UserCardInstance } from './user-card'

const userCardRef = ref<UserCardInstance | null>(null)

const handleRefresh = async () => {
  await userCardRef.value?.refresh()
}
</script>
```

### 7. 插槽使用规范

```vue
<template>
  <view class="user-card">
    <!-- 具名插槽：头部 -->
    <view v-if="$slots.header" class="user-card__header">
      <slot name="header" />
    </view>

    <!-- 默认插槽：内容区域 -->
    <view class="user-card__content">
      <slot>
        <!-- 默认内容 -->
        <text>{{ defaultContent }}</text>
      </slot>
    </view>

    <!-- 作用域插槽：传递数据给父组件 -->
    <view class="user-card__info">
      <slot
        name="info"
        :user="userData"
        :loading="isLoading"
        :refresh="refresh"
      >
        <!-- 默认渲染 -->
        <text>{{ userData?.name }}</text>
      </slot>
    </view>

    <!-- 条件插槽：只在有数据时显示 -->
    <view v-if="$slots.footer && userData" class="user-card__footer">
      <slot name="footer" :data="userData" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

// 获取插槽信息
const slots = useSlots()

// 检查插槽是否存在
const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)
</script>

<!-- 父组件使用 -->
<template>
  <user-card :user-id="userId">
    <template #header>
      <text class="title">自定义头部</text>
    </template>

    <template #info="{ user, loading, refresh }">
      <view v-if="loading">加载中...</view>
      <view v-else>
        <text>{{ user.name }}</text>
        <button @click="refresh">刷新</button>
      </view>
    </template>

    <template #footer="{ data }">
      <text>创建于：{{ data.createTime }}</text>
    </template>
  </user-card>
</template>
```

### 8. 平台兼容性处理

```typescript
// ==================== 条件编译 ====================

// 平台判断
// #ifdef H5
const isH5 = true
// #endif

// #ifdef MP-WEIXIN
const isWeixin = true
// #endif

// #ifdef APP-PLUS
const isApp = true
// #endif

// ==================== 平台差异处理 ====================
const handleClick = () => {
  // #ifdef H5
  // H5 特定逻辑
  window.open(url)
  // #endif

  // #ifdef MP-WEIXIN
  // 微信小程序特定逻辑
  wx.navigateTo({ url })
  // #endif

  // #ifdef APP-PLUS
  // App 特定逻辑
  plus.runtime.openURL(url)
  // #endif
}

// ==================== 样式条件编译 ====================
<style lang="scss" scoped>
.user-card {
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */

  /* #ifdef MP-WEIXIN */
  // 微信小程序特定样式
  /* #endif */
}
</style>
```

## 常见问题

### 1. 何时使用 setup 语法糖？

推荐始终使用 `<script setup>`，它更简洁且性能更好。

```vue
<!-- ✅ 推荐：setup 语法糖 -->
<script lang="ts" setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- ❌ 不推荐：Options API -->
<script lang="ts">
import { defineComponent, ref } from 'vue'
export default defineComponent({
  setup() {
    const count = ref(0)
    return { count }
  }
})
</script>
```

### 2. Props 解构会丢失响应式？

是的，不要直接解构 props：

```typescript
// ❌ 失去响应式
const { value, name } = props

// ✅ 保持响应式 - 方法 1：使用 computed
const value = computed(() => props.value)
const name = computed(() => props.name)

// ✅ 保持响应式 - 方法 2：使用 toRefs
const { value, name } = toRefs(props)

// ✅ 保持响应式 - 方法 3：直接使用 props
watch(() => props.value, (newVal) => { ... })
```

### 3. 组件需要暴露方法给父组件？

使用 `defineExpose`：

```typescript
const refresh = async () => { ... }
const reset = () => { ... }
const validate = () => { ... }

// 暴露给父组件
defineExpose({
  refresh,
  reset,
  validate,
})

// 定义实例类型（供父组件使用）
export type UserCardInstance = {
  refresh: () => Promise<void>
  reset: () => void
  validate: () => boolean
}
```

### 4. 如何处理复杂的组件状态？

使用 Composable 抽离逻辑：

```typescript
// composables/use-user-card.ts
export const useUserCard = (props: UserCardProps) => {
  const isLoading = ref(false)
  const userData = ref<UserInfo | null>(null)
  const error = ref<Error | null>(null)

  const fetchUser = async () => {
    try {
      isLoading.value = true
      error.value = null
      userData.value = await userApi.get(props.userId)
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  watch(() => props.userId, fetchUser, { immediate: true })

  return {
    isLoading,
    userData,
    error,
    refresh: fetchUser,
  }
}

// 在组件中使用
<script lang="ts" setup>
import { useUserCard } from './composables'

const props = defineProps<UserCardProps>()
const { isLoading, userData, error, refresh } = useUserCard(props)
</script>
```

### 5. 如何实现组件的 v-model？

```typescript
// 单个 v-model
<script lang="ts" setup>
interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 方法 1：使用计算属性
const innerValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 方法 2：直接在事件中 emit
const handleChange = (val: string) => {
  emit('update:modelValue', val)
}
</script>

// 多个 v-model
<script lang="ts" setup>
interface Props {
  visible: boolean
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:title': [value: string]
}>()

const updateVisible = (val: boolean) => emit('update:visible', val)
const updateTitle = (val: string) => emit('update:title', val)
</script>

// 父组件使用
<template>
  <my-dialog v-model:visible="showDialog" v-model:title="dialogTitle" />
</template>
```

### 6. 如何避免组件重复渲染？

```typescript
// 1. 使用 v-memo 缓存列表项
<template>
  <view v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    {{ item.name }}
  </view>
</template>

// 2. 使用 computed 缓存计算结果
const expensiveResult = computed(() => {
  return heavyComputation(props.data)
})

// 3. 使用 watchEffect 的 flush: 'post' 避免不必要的更新
watchEffect(() => {
  // 副作用逻辑
}, { flush: 'post' })

// 4. 合理使用 shallowRef
const bigData = shallowRef<BigDataType>(null)
```

### 7. 如何处理组件的异步初始化？

```typescript
// 使用 Suspense（实验性）
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

// 在组件内使用 async setup
<script lang="ts" setup>
// 顶层 await（需要 Suspense 支持）
const data = await fetchInitialData()

// 或者使用 onMounted
onMounted(async () => {
  await initializeComponent()
})
</script>
```

### 8. 如何处理循环依赖？

```typescript
// 问题：A 组件引用 B，B 组件引用 A
// 解决方案 1：使用异步组件
const ComponentB = defineAsyncComponent(() => import('./ComponentB.vue'))

// 解决方案 2：使用 provide/inject 避免直接引用
// 在父组件中
provide('componentA', ComponentA)

// 在子组件中
const ComponentA = inject('componentA')

// 解决方案 3：重构组件关系，提取公共逻辑到 Composable
```

## 组件测试规范

### 单元测试示例

```typescript
// user-card.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import UserCard from './user-card.vue'

describe('UserCard', () => {
  // 测试 Props
  it('renders with default props', () => {
    const wrapper = mount(UserCard, {
      props: { userId: '123' },
    })
    expect(wrapper.classes()).toContain('user-card')
    expect(wrapper.classes()).toContain('user-card--medium')
  })

  it('applies size modifier class', () => {
    const wrapper = mount(UserCard, {
      props: { userId: '123', size: 'large' },
    })
    expect(wrapper.classes()).toContain('user-card--large')
  })

  // 测试 Events
  it('emits click event with userId', async () => {
    const wrapper = mount(UserCard, {
      props: { userId: '123' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')![0]).toEqual(['123'])
  })

  // 测试 Slots
  it('renders header slot content', () => {
    const wrapper = mount(UserCard, {
      props: { userId: '123' },
      slots: {
        header: '<div class="custom-header">Header</div>',
      },
    })
    expect(wrapper.find('.custom-header').exists()).toBe(true)
  })

  // 测试异步行为
  it('shows loading state while fetching data', async () => {
    const wrapper = mount(UserCard, {
      props: { userId: '123' },
    })
    expect(wrapper.classes()).toContain('is-loading')
    await flushPromises()
    expect(wrapper.classes()).not.toContain('is-loading')
  })

  // 测试暴露的方法
  it('exposes refresh method', async () => {
    const wrapper = mount(UserCard, {
      props: { userId: '123' },
    })
    const refreshSpy = vi.spyOn(wrapper.vm, 'refresh')
    await wrapper.vm.refresh()
    expect(refreshSpy).toHaveBeenCalled()
  })
})
```

## 总结

本规范涵盖了 RuoYi-Plus-UniApp 项目中组件封装的各个方面：

1. **命名规范** - 确保代码风格一致
2. **代码组织** - 保持代码结构清晰
3. **类型规范** - 充分利用 TypeScript 类型系统
4. **样式规范** - BEM 命名和变量系统
5. **通信规范** - 多种组件通信模式
6. **性能优化** - 实用的性能优化技巧
7. **测试规范** - 保证代码质量

遵循这些规范能够：
- 提高代码可读性和可维护性
- 减少 Bug 和重构成本
- 便于团队协作和代码审查
- 提升应用性能和用户体验
