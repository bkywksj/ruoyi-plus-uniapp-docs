# 开发最佳实践

前端项目的开发规范和最佳实践指南。

## 🎯 编码规范

### 命名规范

#### 文件命名

```typescript
// ✅ 组件：PascalCase
UserList.vue
UserDetail.vue
IconButton.vue

// ✅ 工具类：camelCase
stringUtils.ts
dateUtils.ts
httpRequest.ts

// ✅ Store：camelCase
userStore.ts
settingsStore.ts

// ✅ API：camelCase
userApi.ts
systemApi.ts
```

#### 变量命名

```typescript
// ✅ camelCase
const userName = 'John'
const isVisible = true
const userList = []

// ✅ 常量：UPPER_SNAKE_CASE
const MAX_COUNT = 100
const API_BASE_URL = 'https://api.example.com'

// ✅ 接口/类型：PascalCase
interface UserInfo {}
type UserStatus = 'active' | 'inactive'

// ❌ 避免
const UserName = 'John' // 变量不用 PascalCase
const user_name = 'John' // 避免下划线
```

#### 函数命名

```typescript
// ✅ 动词开头
function getUser() {}
function setToken() {}
function fetchData() {}
function handleClick() {}

// ✅ 布尔值：is/has/can 开头
const isVisible = true
const hasPermission = false
const canEdit = true

// ❌ 避免
function user() {} // 不清晰
function data() {} // 太通用
```

### 代码组织

#### Vue 组件结构

```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import type { UserVo } from '@/api/user'

// 2. Props
interface Props {
  userId: string
}
const props = defineProps<Props>()

// 3. Emits
interface Emits {
  (e: 'update', value: string): void
}
const emit = defineEmits<Emits>()

// 4. 响应式数据
const count = ref(0)
const userInfo = ref<UserVo | null>(null)

// 5. 计算属性
const doubleCount = computed(() => count.value * 2)

// 6. 方法
function increment() {
  count.value++
}

// 7. 生命周期
onMounted(() => {
  loadData()
})

// 8. Watch
watch(() => props.userId, (newVal) => {
  loadUser(newVal)
})
</script>

<style lang="scss" scoped>
/* 样式 */
</style>
```

#### TypeScript 文件结构

```typescript
// 1. 类型导入
import type { UserVo, UserBo } from './types'

// 2. 值导入
import { http } from '@/utils/http'

// 3. 类型定义
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 4. 常量
const API_PREFIX = '/api/user'

// 5. 函数实现
export function getUser(id: string): Result<UserVo> {
  return http.get<UserVo>(`${API_PREFIX}/${id}`)
}
```

### 注释规范

#### 文件注释

```typescript
/**
 * 用户管理 API
 * @author John Doe
 * @date 2024-01-01
 */
```

#### 函数注释

```typescript
/**
 * 获取用户信息
 * @param id 用户ID
 * @returns 用户信息
 * @throws {Error} 当用户不存在时抛出错误
 */
export async function getUser(id: string): Result<UserVo> {
  return http.get<UserVo>(`/api/user/${id}`)
}
```

#### 复杂逻辑注释

```typescript
// ✅ 解释为什么这样做
// 需要延迟 300ms 避免频繁请求
const debouncedSearch = debounce(search, 300)

// ✅ 解释复杂算法
// 使用二分查找提高性能，时间复杂度 O(log n)
function binarySearch(arr: number[], target: number) {
  // ...
}

// ❌ 避免无用注释
// 设置用户名
const userName = 'John' // 这行设置用户名
```

## 📝 Vue 最佳实践

### 组件设计

#### Props 设计

```vue
<script setup lang="ts">
// ✅ 明确类型和默认值
interface Props {
  title?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'medium',
  disabled: false
})

// ❌ 避免
defineProps({
  title: String, // 没有类型安全
  size: String // 没有限制可选值
})
</script>
```

#### Emits 设计

```vue
<script setup lang="ts">
// ✅ 明确事件类型
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string, oldValue: string): void
  (e: 'error', error: Error): void
}

const emit = defineEmits<Emits>()

// ✅ 提供事件说明
/**
 * 更新值
 * @event update:modelValue
 * @param {string} value - 新值
 */
emit('update:modelValue', newValue)
</script>
```

#### 组件通信

```vue
<!-- ✅ 父子通信：Props + Emits -->
<UserForm
  :user="userInfo"
  @update="handleUpdate"
  @cancel="handleCancel"
/>

<!-- ✅ 跨组件通信：Pinia Store -->
<script setup>
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
</script>

<!-- ✅ 兄弟组件通信：通过父组件 -->
<!-- 或使用 provide/inject -->

<!-- ❌ 避免：直接操作父组件 -->
<!-- 违反单向数据流 -->
```

### 响应式数据

#### ref vs reactive

```typescript
// ✅ 基本类型用 ref
const count = ref(0)
const message = ref('Hello')
const isVisible = ref(true)

// ✅ 对象用 reactive
const form = reactive({
  username: '',
  password: ''
})

// ✅ 需要替换整个对象时用 ref
const userInfo = ref<UserVo | null>(null)
userInfo.value = newUser // 可以替换

// ❌ 避免：对象解构丢失响应式
const { username, password } = reactive({ username: '', password: '' })
// username 和 password 不再是响应式

// ✅ 正确：使用 toRefs
const form = reactive({ username: '', password: '' })
const { username, password } = toRefs(form)
```

#### watch vs watchEffect

```typescript
// ✅ watch：明确依赖
watch(() => props.userId, (newVal, oldVal) => {
  console.log('userId changed:', oldVal, '->', newVal)
  loadUser(newVal)
})

// ✅ watchEffect：自动追踪依赖
watchEffect(() => {
  console.log('count:', count.value)
  console.log('message:', message.value)
  // 自动追踪 count 和 message
})

// ✅ 立即执行用 watchEffect
watchEffect(() => {
  document.title = `${title.value} - My App`
})

// ✅ 需要旧值用 watch
watch(count, (newVal, oldVal) => {
  console.log('changed from', oldVal, 'to', newVal)
})
```

### 性能优化

#### 计算属性缓存

```typescript
// ✅ 使用 computed 缓存
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 'active')
})

// ❌ 避免：每次渲染都重新计算
<div v-for="item in list.filter(i => i.status === 'active')">
```

#### v-if vs v-show

```vue
<!-- ✅ 不频繁切换用 v-if -->
<div v-if="isAdmin">管理员功能</div>

<!-- ✅ 频繁切换用 v-show -->
<div v-show="isVisible">内容</div>

<!-- ❌ 避免：同时使用 -->
<div v-if="condition" v-show="visible">内容</div>
```

#### 列表渲染优化

```vue
<!-- ✅ 使用唯一 key -->
<div v-for="item in list" :key="item.id">

<!-- ❌ 避免：使用 index -->
<div v-for="(item, index) in list" :key="index">

<!-- ✅ 大列表使用虚拟滚动 -->
<VirtualScroll :items="largeList" :item-height="50">
  <template #default="{ item }">
    <div>{{ item.name }}</div>
  </template>
</VirtualScroll>
```

## 🔄 TypeScript 最佳实践

### 类型定义

#### 接口 vs 类型别名

```typescript
// ✅ 接口：可扩展的对象类型
interface User {
  id: string
  name: string
}

interface Admin extends User {
  permissions: string[]
}

// ✅ 类型别名：联合类型、工具类型
type Status = 'active' | 'inactive' | 'pending'
type UserOrAdmin = User | Admin
type PartialUser = Partial<User>

// 建议：对象类型优先使用 interface，其他使用 type
```

#### 泛型使用

```typescript
// ✅ API 响应泛型
interface Result<T = any> {
  code: number
  data: T
  message: string
}

function request<T>(url: string): Promise<Result<T>> {
  return http.get<T>(url)
}

// 使用
const result = await request<UserVo>('/api/user/1')
// result.data 类型为 UserVo

// ✅ 组件泛型
interface ListProps<T> {
  items: T[]
  onSelect: (item: T) => void
}
```

### 类型断言

```typescript
// ✅ as 断言（推荐）
const value = input as string

// ✅ 非空断言（确定不为 null）
const user = userInfo!

// ❌ 避免：过度使用 any
const data: any = response.data // 失去类型安全

// ✅ 正确：使用 unknown 然后类型守卫
const data: unknown = response.data
if (typeof data === 'object' && data !== null) {
  // 类型守卫
}
```

### 类型守卫

```typescript
// ✅ 类型守卫函数
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}

// 使用
if (isUser(data)) {
  console.log(data.name) // 类型安全
}

// ✅ in 操作符
if ('admin' in user) {
  // user 是 Admin 类型
}

// ✅ typeof 类型守卫
if (typeof value === 'string') {
  console.log(value.toUpperCase())
}
```

## 🎨 CSS 最佳实践

### 命名规范

```scss
// ✅ BEM 命名
.user-card {
  &__header {}
  &__body {}
  &__footer {}
  &--active {}
  &--disabled {}
}

// 生成
.user-card {}
.user-card__header {}
.user-card__body {}
.user-card--active {}
```

### Scoped 样式

```vue
<style lang="scss" scoped>
/* ✅ Scoped 避免样式污染 */
.container {
  padding: 20px;
}

/* ✅ 深度选择器 */
:deep(.el-input__inner) {
  border-radius: 8px;
}

/* ✅ 全局选择器 */
:global(.global-class) {
  color: red;
}

/* ❌ 避免：不加 scoped 污染全局 */
</style>
```

### CSS 变量

```scss
// ✅ 使用 CSS 变量
:root {
  --primary-color: #409eff;
  --border-radius: 4px;
  --spacing: 16px;
}

.button {
  background: var(--primary-color);
  border-radius: var(--border-radius);
  padding: var(--spacing);
}

// ✅ 暗色模式
[data-theme='dark'] {
  --primary-color: #66b1ff;
}
```

## 📦 项目结构

### 目录组织

```
src/
├── api/              # API 接口
│   ├── user.ts
│   └── system.ts
├── assets/           # 静态资源
│   ├── icons/
│   └── images/
├── components/       # 公共组件
│   ├── Button/
│   └── Input/
├── composables/      # 组合式函数
│   ├── usePermission.ts
│   └── useUser.ts
├── router/           # 路由配置
│   └── index.ts
├── stores/           # 状态管理
│   ├── user.ts
│   └── settings.ts
├── styles/           # 全局样式
│   ├── variables.scss
│   └── mixins.scss
├── types/            # 类型定义
│   ├── global.d.ts
│   └── api.d.ts
├── utils/            # 工具函数
│   ├── http.ts
│   └── string.ts
├── views/            # 页面组件
│   ├── Home.vue
│   └── system/
│       └── user/
│           ├── UserList.vue
│           └── UserDetail.vue
├── App.vue
└── main.ts
```

### 文件职责

```typescript
// ✅ API 文件：只负责接口定义
export function getUser(id: string): Result<UserVo> {
  return http.get<UserVo>(`/api/user/${id}`)
}

// ✅ Store：业务逻辑和状态管理
export const useUserStore = defineStore('user', {
  state: () => ({ users: [] }),
  actions: {
    async loadUsers() {
      const [err, data] = await getUserList()
      if (!err) {
        this.users = data.records
      }
    }
  }
})

// ✅ 组件：只负责展示和交互
<script setup>
const userStore = useUserStore()
onMounted(() => {
  userStore.loadUsers()
})
</script>

// ❌ 避免：组件直接调用 API
// 业务逻辑应该在 Store 中
```

## 🔒 安全最佳实践

### XSS 防护

```vue
<!-- ✅ 默认转义 -->
<div>{{ userInput }}</div>

<!-- ⚠️ v-html 慎用 -->
<div v-html="sanitize(htmlContent)"></div>

<script setup>
import DOMPurify from 'dompurify'

function sanitize(html: string) {
  return DOMPurify.sanitize(html)
}
</script>
```

### 敏感信息

```typescript
// ✅ 环境变量
const apiKey = import.meta.env.VITE_API_KEY

// ❌ 避免：硬编码
const apiKey = 'sk-1234567890abcdef'

// ✅ Token 存储
import { setStorage, getStorage } from '@/utils/cache'
setStorage('token', token) // 加密存储

// ❌ 避免：明文存储敏感信息
localStorage.setItem('password', password)
```

### 权限控制

```typescript
// ✅ 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

// ✅ 权限指令
<button v-permission="'system:user:delete'">删除</button>

// ✅ 权限判断
import { hasPermission } from '@/utils/permission'
if (hasPermission('system:user:delete')) {
  // 允许删除
}
```

## 🐛 错误处理

### 统一错误处理

```typescript
// ✅ Result 模式
const [err, data] = await getUser(id)
if (err) {
  console.error('获取用户失败:', err)
  return
}
console.log('用户信息:', data)

// ✅ Try-Catch
try {
  await updateUser(user)
  msgSuccess('更新成功')
} catch (error) {
  msgError('更新失败')
  console.error(error)
}

// ✅ 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  // 上报错误
}
```

### 用户友好提示

```typescript
// ✅ 友好的错误提示
if (!form.username) {
  msgWarning('请输入用户名')
  return
}

// ✅ 网络错误提示
const [err, data] = await getUser(id)
if (err) {
  if (err.message.includes('Network')) {
    msgError('网络连接失败，请检查网络')
  } else {
    msgError('获取用户信息失败')
  }
  return
}

// ❌ 避免：技术性错误
msgError('Failed to fetch user: 500 Internal Server Error')
```

## 📋 开发检查清单

### 代码提交前
- [ ] 代码格式化（Prettier）
- [ ] 代码检查（ESLint）
- [ ] 类型检查（TypeScript）
- [ ] 单元测试通过
- [ ] 无 console.log 调试代码
- [ ] 注释完整清晰

### 功能开发
- [ ] 需求理解正确
- [ ] API 接口对接
- [ ] 错误处理完善
- [ ] 加载状态展示
- [ ] 权限控制实现
- [ ] 响应式适配

### 性能优化
- [ ] 路由懒加载
- [ ] 组件按需加载
- [ ] 图片懒加载
- [ ] 列表分页/虚拟滚动
- [ ] 防抖节流优化
- [ ] 缓存策略

### 用户体验
- [ ] 加载动画
- [ ] 错误提示友好
- [ ] 操作反馈及时
- [ ] 空状态提示
- [ ] 表单验证完善
- [ ] 键盘快捷键
