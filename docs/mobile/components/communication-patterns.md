# 组件通信模式

## 介绍

本文档介绍 RuoYi-Plus-UniApp 项目中组件间通信的各种模式和最佳实践。良好的组件通信设计是构建可维护、可扩展应用的基础。

**核心模式:**

- **Props/Events** - 父子组件间的标准通信方式
- **v-model** - 双向绑定的语法糖
- **Provide/Inject** - 跨层级组件通信
- **EventBus** - 任意组件间的事件通信
- **Pinia Store** - 全局状态管理

## Props 向下传递

### 基本用法

```vue
<!-- 父组件 -->
<template>
  <user-card
    :user-id="userId"
    :name="userName"
    :avatar="userAvatar"
    :is-vip="isVip"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const userId = ref('123')
const userName = ref('张三')
const userAvatar = ref('/static/avatar.png')
const isVip = ref(true)
</script>
```

```vue
<!-- 子组件 user-card.vue -->
<template>
  <view class="user-card">
    <image :src="avatar" class="user-card__avatar" />
    <view class="user-card__info">
      <text class="user-card__name">{{ name }}</text>
      <text v-if="isVip" class="user-card__vip">VIP</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  userId: string
  name: string
  avatar?: string
  isVip?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatar: '/static/default-avatar.png',
  isVip: false
})
</script>
```

### 动态 Props

```vue
<!-- 动态传递多个属性 -->
<template>
  <user-card v-bind="userProps" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const user = ref({
  id: '123',
  name: '张三',
  avatar: '/static/avatar.png',
  isVip: true
})

// 转换为 Props 格式
const userProps = computed(() => ({
  userId: user.value.id,
  name: user.value.name,
  avatar: user.value.avatar,
  isVip: user.value.isVip
}))
</script>
```

### Props 验证

```typescript
interface Props {
  // 必填属性
  id: string

  // 可选属性
  title?: string

  // 联合类型
  type?: 'primary' | 'success' | 'warning' | 'error'

  // 复杂类型
  config?: {
    width: number
    height: number
  }

  // 数组类型
  list?: string[]

  // 函数类型
  formatter?: (value: any) => string
}

const props = withDefaults(defineProps<Props>(), {
  title: '默认标题',
  type: 'primary',
  config: () => ({ width: 100, height: 100 }),
  list: () => [],
  formatter: (v) => String(v)
})
```

## Events 向上传递

### 基本事件

```vue
<!-- 子组件 -->
<template>
  <view @click="handleClick">
    <slot />
  </view>
</template>

<script lang="ts" setup>
interface Emits {
  (e: 'click', event: Event): void
}

const emit = defineEmits<Emits>()

const handleClick = (event: Event) => {
  emit('click', event)
}
</script>
```

```vue
<!-- 父组件 -->
<template>
  <my-button @click="onButtonClick">
    点击按钮
  </my-button>
</template>

<script lang="ts" setup>
const onButtonClick = (event: Event) => {
  console.log('按钮被点击', event)
}
</script>
```

### 带参数的事件

```vue
<!-- 子组件 -->
<script lang="ts" setup>
interface UserInfo {
  id: string
  name: string
}

interface Emits {
  (e: 'select', user: UserInfo): void
  (e: 'delete', id: string): void
  (e: 'change', value: string, oldValue: string): void
}

const emit = defineEmits<Emits>()

// 触发事件
const selectUser = (user: UserInfo) => {
  emit('select', user)
}

const deleteUser = (id: string) => {
  emit('delete', id)
}

const changeValue = (newVal: string, oldVal: string) => {
  emit('change', newVal, oldVal)
}
</script>
```

### 事件命名规范

```typescript
// 推荐的事件命名
interface Emits {
  // 交互事件：动词
  (e: 'click'): void
  (e: 'focus'): void
  (e: 'blur'): void

  // 状态变化：on + 动词
  (e: 'change', value: string): void
  (e: 'update', data: any): void
  (e: 'load', result: any): void

  // 生命周期：before/after + 动词
  (e: 'before-close'): void
  (e: 'after-close'): void
  (e: 'before-enter'): void
  (e: 'after-leave'): void

  // v-model 事件
  (e: 'update:modelValue', value: string): void
  (e: 'update:visible', value: boolean): void
}
```

## v-model 双向绑定

### 基本 v-model

```vue
<!-- 子组件 -->
<template>
  <input
    :value="modelValue"
    @input="handleInput"
  />
</template>

<script lang="ts" setup>
interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<Emits>()

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
}
</script>
```

```vue
<!-- 父组件 -->
<template>
  <my-input v-model="inputValue" />
  <!-- 等价于 -->
  <my-input
    :model-value="inputValue"
    @update:model-value="inputValue = $event"
  />
</template>
```

### 多个 v-model

```vue
<!-- 子组件 -->
<script lang="ts" setup>
interface Props {
  modelValue?: string
  visible?: boolean
  title?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:visible', value: boolean): void
  (e: 'update:title', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
```

```vue
<!-- 父组件 -->
<template>
  <my-dialog
    v-model="content"
    v-model:visible="showDialog"
    v-model:title="dialogTitle"
  />
</template>
```

### 计算属性实现 v-model

```vue
<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用计算属性简化双向绑定
const innerValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <!-- 直接绑定计算属性 -->
  <input v-model="innerValue" />
</template>
```

## Provide/Inject 跨级通信

### 基本用法

```vue
<!-- 祖先组件 -->
<script lang="ts" setup>
import { provide, ref } from 'vue'

const theme = ref('light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// 提供数据
provide('theme', theme)
provide('toggleTheme', toggleTheme)
</script>
```

```vue
<!-- 后代组件（任意层级） -->
<script lang="ts" setup>
import { inject } from 'vue'
import type { Ref } from 'vue'

// 注入数据
const theme = inject<Ref<string>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
</script>

<template>
  <view :class="['container', `theme-${theme}`]">
    <button @click="toggleTheme">切换主题</button>
  </view>
</template>
```

### 类型安全的 Provide/Inject

```typescript
// keys.ts - 定义注入键
import type { InjectionKey, Ref } from 'vue'

export interface ThemeContext {
  theme: Ref<string>
  toggleTheme: () => void
  setTheme: (theme: string) => void
}

export const ThemeKey: InjectionKey<ThemeContext> = Symbol('theme')
```

```vue
<!-- 祖先组件 -->
<script lang="ts" setup>
import { provide, ref } from 'vue'
import { ThemeKey } from './keys'

const theme = ref('light')

provide(ThemeKey, {
  theme,
  toggleTheme: () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  },
  setTheme: (t: string) => {
    theme.value = t
  }
})
</script>
```

```vue
<!-- 后代组件 -->
<script lang="ts" setup>
import { inject } from 'vue'
import { ThemeKey } from './keys'

// 类型安全的注入
const themeContext = inject(ThemeKey)

if (themeContext) {
  console.log(themeContext.theme.value)
  themeContext.toggleTheme()
}
</script>
```

### 提供默认值

```typescript
// 带默认值的注入
const theme = inject('theme', 'light')

// 工厂函数默认值（延迟创建）
const config = inject('config', () => ({
  color: '#000',
  size: 14
}), true)
```

## EventBus 事件总线

### 创建 EventBus

```typescript
// eventBus.ts
import mitt from 'mitt'

type Events = {
  'user:login': { userId: string; name: string }
  'user:logout': void
  'cart:update': { count: number }
  'message:new': { id: string; content: string }
}

export const eventBus = mitt<Events>()
```

### 发送事件

```vue
<script lang="ts" setup>
import { eventBus } from '@/utils/eventBus'

// 登录成功后发送事件
const handleLogin = async () => {
  const user = await login()
  eventBus.emit('user:login', {
    userId: user.id,
    name: user.name
  })
}

// 退出登录
const handleLogout = () => {
  eventBus.emit('user:logout')
}

// 更新购物车
const updateCart = (count: number) => {
  eventBus.emit('cart:update', { count })
}
</script>
```

### 监听事件

```vue
<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { eventBus } from '@/utils/eventBus'

// 事件处理函数
const onUserLogin = (data: { userId: string; name: string }) => {
  console.log('用户登录:', data.name)
}

const onCartUpdate = (data: { count: number }) => {
  console.log('购物车数量:', data.count)
}

onMounted(() => {
  // 注册监听
  eventBus.on('user:login', onUserLogin)
  eventBus.on('cart:update', onCartUpdate)
})

onUnmounted(() => {
  // 移除监听（重要！防止内存泄漏）
  eventBus.off('user:login', onUserLogin)
  eventBus.off('cart:update', onCartUpdate)
})
</script>
```

### useEventBus 组合函数

```typescript
// composables/useEventBus.ts
import { onUnmounted } from 'vue'
import { eventBus } from '@/utils/eventBus'

export function useEventBus() {
  const listeners: Array<{ event: string; handler: Function }> = []

  const on = <T>(event: string, handler: (data: T) => void) => {
    eventBus.on(event, handler as any)
    listeners.push({ event, handler })
  }

  const emit = <T>(event: string, data?: T) => {
    eventBus.emit(event, data as any)
  }

  // 自动清理
  onUnmounted(() => {
    listeners.forEach(({ event, handler }) => {
      eventBus.off(event, handler as any)
    })
  })

  return { on, emit }
}
```

```vue
<script lang="ts" setup>
import { useEventBus } from '@/composables/useEventBus'

const { on, emit } = useEventBus()

// 自动在组件卸载时清理
on('user:login', (data) => {
  console.log('用户登录:', data)
})
</script>
```

## Pinia 状态管理

### 定义 Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const token = ref('')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '游客')

  // 方法
  const login = async (username: string, password: string) => {
    const res = await api.login({ username, password })
    token.value = res.token
    userInfo.value = res.user
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    userName,
    login,
    logout
  }
})
```

### 在组件中使用

```vue
<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 解构响应式属性（使用 storeToRefs 保持响应式）
const { userInfo, isLoggedIn, userName } = storeToRefs(userStore)

// 方法可以直接解构
const { login, logout } = userStore

// 使用
const handleLogin = async () => {
  await login('admin', '123456')
}
</script>

<template>
  <view v-if="isLoggedIn">
    <text>欢迎, {{ userName }}</text>
    <button @click="logout">退出</button>
  </view>
  <view v-else>
    <button @click="handleLogin">登录</button>
  </view>
</template>
```

### 跨组件状态共享

```vue
<!-- 组件 A -->
<script lang="ts" setup>
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

const addToCart = (item: Product) => {
  cartStore.addItem(item)
}
</script>
```

```vue
<!-- 组件 B（任意位置） -->
<script lang="ts" setup>
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'

const cartStore = useCartStore()
const { items, totalCount, totalPrice } = storeToRefs(cartStore)
</script>

<template>
  <view class="cart-badge">
    {{ totalCount }}
  </view>
</template>
```

## Refs 获取子组件实例

### 基本用法

```vue
<!-- 子组件 -->
<script lang="ts" setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

const reset = () => {
  count.value = 0
}

// 暴露给父组件的方法和属性
defineExpose({
  count,
  increment,
  reset
})
</script>
```

```vue
<!-- 父组件 -->
<template>
  <counter ref="counterRef" />
  <button @click="handleIncrement">增加</button>
  <button @click="handleReset">重置</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 定义 ref 类型
const counterRef = ref<{
  count: number
  increment: () => void
  reset: () => void
} | null>(null)

const handleIncrement = () => {
  counterRef.value?.increment()
}

const handleReset = () => {
  counterRef.value?.reset()
}
</script>
```

### 类型安全的组件引用

```typescript
// 子组件类型定义
export interface CounterInstance {
  count: number
  increment: () => void
  reset: () => void
}
```

```vue
<!-- 父组件 -->
<script lang="ts" setup>
import { ref } from 'vue'
import type { CounterInstance } from './Counter.vue'

const counterRef = ref<CounterInstance | null>(null)
</script>
```

## 模式对比与选择

### 通信模式对比

| 模式 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| Props/Events | 父子组件 | 清晰、可追溯 | 多层传递繁琐 |
| v-model | 双向绑定 | 简洁、直观 | 仅适合简单数据 |
| Provide/Inject | 跨级组件 | 避免 props drilling | 来源不明确 |
| EventBus | 任意组件 | 灵活、解耦 | 难以追踪 |
| Pinia | 全局状态 | 集中管理、DevTools | 增加复杂度 |
| Refs | 访问实例 | 直接操作 | 破坏封装 |

### 选择建议

```typescript
// 1. 父子通信 → Props/Events
<child-component :value="data" @change="handleChange" />

// 2. 双向绑定 → v-model
<form-input v-model="inputValue" />

// 3. 跨多层组件 → Provide/Inject
provide('theme', theme)
const theme = inject('theme')

// 4. 兄弟组件/任意组件 → EventBus 或 Pinia
eventBus.emit('event', data)
// 或
const store = useStore()

// 5. 全局状态 → Pinia
const userStore = useUserStore()

// 6. 需要调用子组件方法 → Refs
childRef.value?.method()
```

## 最佳实践

### 1. Props 单向数据流

```typescript
// ✅ 正确：通过事件通知父组件
const handleChange = (newValue: string) => {
  emit('update:modelValue', newValue)
}

// ❌ 错误：直接修改 Props
const handleChange = (newValue: string) => {
  props.modelValue = newValue // 会报错
}
```

### 2. 避免过深的 Props 传递

```typescript
// ❌ 不好：props drilling
<grandparent>
  <parent :data="data">
    <child :data="data">
      <grandchild :data="data" />
    </child>
  </parent>
</grandparent>

// ✅ 好：使用 Provide/Inject 或 Pinia
provide('data', data)
const data = inject('data')
```

### 3. EventBus 必须清理

```typescript
// ✅ 正确：在 onUnmounted 中清理
onUnmounted(() => {
  eventBus.off('event', handler)
})

// ❌ 错误：忘记清理导致内存泄漏
onMounted(() => {
  eventBus.on('event', handler)
})
// 没有清理...
```

### 4. 合理使用 Pinia

```typescript
// ✅ 适合放入 Pinia 的状态
// - 用户信息
// - 全局配置
// - 购物车数据
// - 主题设置

// ❌ 不适合放入 Pinia 的状态
// - 表单临时数据
// - UI 状态（如 loading）
// - 组件内部状态
```

## 常见问题

### 1. Props 解构失去响应式？

使用 `toRefs` 保持响应式：

```typescript
// ❌ 失去响应式
const { value } = props

// ✅ 保持响应式
const { value } = toRefs(props)
// 或
const value = computed(() => props.value)
```

### 2. Inject 获取不到值？

确保 Provide 在组件树上层：

```typescript
// 提供默认值防止 undefined
const theme = inject('theme', 'light')

// 或检查是否存在
const theme = inject('theme')
if (!theme) {
  console.warn('Theme not provided')
}
```

### 3. EventBus 事件未触发？

检查事件名称是否一致：

```typescript
// 发送
eventBus.emit('user:login', data)

// 监听（事件名必须完全一致）
eventBus.on('user:login', handler)  // ✅
eventBus.on('userLogin', handler)   // ❌ 事件名不匹配
```
