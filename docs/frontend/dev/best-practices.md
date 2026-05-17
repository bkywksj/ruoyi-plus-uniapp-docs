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
<script lang="ts" setup>
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

```text
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
<script lang="ts" setup>
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

<script lang="ts" setup>
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

## 常见问题

### 1. 响应式数据在组件间传递时丢失响应性

**问题描述**

在将响应式数据从父组件传递给子组件时，子组件接收到的数据不再是响应式的，导致数据变化时视图不更新。

**问题原因**

- 在传递时对 reactive 对象进行了解构，丢失了响应式引用
- Props 接收后直接赋值给了普通变量而非响应式变量
- 使用了错误的方式复制响应式对象

**解决方案**

```vue
<!-- ❌ 错误：解构 Props 导致丢失响应性 -->
<script setup lang="ts">
interface Props {
  user: UserVo
}
const props = defineProps<Props>()

// 错误：user 不再是响应式的
const { user } = props

// 错误：直接访问嵌套属性
const userName = props.user.name // 不会响应更新
</script>

<!-- ✅ 正确：使用 toRef 或 toRefs 保持响应性 -->
<script setup lang="ts">
import { toRef, toRefs, computed } from 'vue'

interface Props {
  user: UserVo
  settings: SettingsVo
}
const props = defineProps<Props>()

// 方案1：使用 toRef 转换单个属性
const user = toRef(props, 'user')

// 方案2：使用 toRefs 转换所有属性
const { user, settings } = toRefs(props)

// 方案3：使用 computed 派生响应式值
const userName = computed(() => props.user.name)

// 方案4：在模板中直接使用 props
// <template>{{ props.user.name }}</template>
</script>

<!-- ✅ 正确：子组件正确接收并使用 Props -->
<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  modelValue: UserVo | null
}

const props = defineProps<Props>()

// 使用 computed 创建本地响应式副本
const localUser = computed(() => {
  // 深拷贝避免直接修改 props
  return props.modelValue ? { ...props.modelValue } : null
})

// 监听 props 变化
watch(
  () => props.modelValue,
  (newVal) => {
    console.log('用户数据已更新:', newVal)
  },
  { deep: true }
)
</script>
```

**响应式数据传递最佳实践**

```typescript
// ✅ 父组件：使用 ref 或 reactive 定义数据
const userInfo = ref<UserVo | null>(null)
const formData = reactive<FormData>({
  username: '',
  email: ''
})

// ✅ 传递给子组件
<ChildComponent
  :user="userInfo"
  :form="formData"
/>

// ✅ 子组件：正确处理响应式 Props
<script setup lang="ts">
const props = defineProps<{
  user: Ref<UserVo | null>  // 接收 ref
  form: FormData             // 接收 reactive
}>()

// 对于 ref 类型的 prop，直接使用即可
const userName = computed(() => props.user?.name ?? '')

// 对于需要修改的场景，使用 emit
const emit = defineEmits<{
  (e: 'update:user', value: UserVo): void
}>()

function updateUser(newData: Partial<UserVo>) {
  if (props.user) {
    emit('update:user', { ...props.user, ...newData })
  }
}
</script>
```

---

### 2. TypeScript 类型推断失败导致编译错误

**问题描述**

在使用泛型、联合类型或复杂对象时，TypeScript 无法正确推断类型，导致编译错误或需要频繁使用类型断言。

**问题原因**

- 泛型参数未正确传递或推断
- 联合类型的类型收窄不充分
- API 响应类型定义不完整
- 第三方库类型定义缺失或不准确

**解决方案**

```typescript
// ❌ 错误：泛型推断失败
async function fetchData(url: string) {
  const response = await http.get(url)
  return response.data // 类型为 unknown 或 any
}

// ✅ 正确：显式指定泛型类型
async function fetchData<T>(url: string): Promise<T> {
  const response = await http.get<T>(url)
  return response.data
}

// 使用时指定类型
const user = await fetchData<UserVo>('/api/user/1')
```

**联合类型的类型收窄**

```typescript
// ❌ 错误：直接访问联合类型的属性
type ApiResult = SuccessResult | ErrorResult

interface SuccessResult {
  success: true
  data: UserVo
}

interface ErrorResult {
  success: false
  error: string
}

function handleResult(result: ApiResult) {
  // 错误：不能直接访问 data，因为 ErrorResult 没有 data 属性
  console.log(result.data)
}

// ✅ 正确：使用类型守卫进行类型收窄
function handleResult(result: ApiResult) {
  if (result.success) {
    // TypeScript 知道这里是 SuccessResult
    console.log(result.data.name)
  } else {
    // TypeScript 知道这里是 ErrorResult
    console.error(result.error)
  }
}

// ✅ 使用自定义类型守卫
function isSuccessResult(result: ApiResult): result is SuccessResult {
  return result.success === true
}

function handleResult(result: ApiResult) {
  if (isSuccessResult(result)) {
    console.log(result.data.name)
  }
}
```

**复杂对象类型推断**

```typescript
// ❌ 问题：对象字面量类型推断过于宽泛
const config = {
  api: '/api',
  timeout: 3000,
  retry: true
}
// config 类型被推断为 { api: string; timeout: number; retry: boolean }

// ✅ 方案1：使用 as const 进行字面量类型推断
const config = {
  api: '/api',
  timeout: 3000,
  retry: true
} as const
// config 类型为 { readonly api: "/api"; readonly timeout: 3000; readonly retry: true }

// ✅ 方案2：定义接口约束类型
interface Config {
  api: string
  timeout: number
  retry: boolean
}

const config: Config = {
  api: '/api',
  timeout: 3000,
  retry: true
}

// ✅ 方案3：使用 satisfies 操作符（TypeScript 4.9+）
const config = {
  api: '/api',
  timeout: 3000,
  retry: true
} satisfies Config
// 保持字面量类型同时确保符合接口
```

**处理第三方库类型问题**

```typescript
// ✅ 为缺少类型的库创建声明文件
// types/my-library.d.ts
declare module 'my-library' {
  export interface Options {
    debug?: boolean
    timeout?: number
  }

  export function init(options: Options): void
  export function getData<T>(): Promise<T>
}

// ✅ 扩展已有类型定义
// types/vue-router.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    permission?: string[]
    hidden?: boolean
  }
}

// ✅ 使用类型断言处理不准确的类型
import { useRoute } from 'vue-router'

const route = useRoute()
// 如果 meta 类型不准确，使用断言
const title = (route.meta as { title?: string }).title ?? '默认标题'
```

---

### 3. 组件样式污染或样式不生效

**问题描述**

使用 scoped 样式时发现样式无法作用于子组件，或者不使用 scoped 时样式污染了全局。深度选择器使用不正确导致样式失效。

**问题原因**

- Scoped 样式默认只作用于当前组件元素
- 深度选择器语法使用错误（`:deep()` vs `::v-deep` vs `/deep/`）
- CSS 优先级冲突
- 第三方组件样式覆盖方式不正确

**解决方案**

```vue
<!-- ❌ 错误：scoped 样式无法穿透子组件 -->
<style scoped>
/* 这个样式不会作用于 ElInput 内部元素 */
.el-input__inner {
  border-color: red;
}
</style>

<!-- ✅ 正确：使用 :deep() 深度选择器 -->
<style scoped>
/* Vue 3 推荐语法 */
:deep(.el-input__inner) {
  border-color: red;
}

/* 或者使用在特定父元素下 */
.custom-input :deep(.el-input__inner) {
  border-color: red;
}
</style>
```

**样式隔离最佳实践**

```vue
<template>
  <div class="user-form">
    <el-form ref="formRef" :model="form">
      <el-form-item label="用户名">
        <el-input v-model="form.username" class="custom-input" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.user-form {
  padding: 20px;

  // ✅ 使用 :deep() 覆盖 Element Plus 组件样式
  :deep(.el-form-item__label) {
    font-weight: bold;
    color: var(--el-text-color-primary);
  }

  // ✅ 针对特定类名的深度选择
  .custom-input {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-border-color) inset;

      &:hover {
        box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }
    }
  }

  // ✅ 处理弹出层样式（弹出层不在组件 DOM 树内）
  // 需要使用全局样式或 :global()
}

// ✅ 使用 :global() 定义全局样式（慎用）
:global(.el-message-box) {
  max-width: 500px;
}

// ✅ 或者将全局样式放在单独的 style 块中
</style>

<style lang="scss">
/* 无 scoped 的全局样式 - 用于覆盖弹出层等 */
.user-form-dialog {
  .el-dialog__body {
    padding: 20px 30px;
  }
}
</style>
```

**CSS 变量覆盖组件库主题**

```vue
<style lang="scss" scoped>
.user-form {
  // ✅ 使用 CSS 变量覆盖 Element Plus 主题
  --el-color-primary: #409eff;
  --el-border-radius-base: 4px;
  --el-font-size-base: 14px;

  // 局部覆盖
  :deep(.el-button--primary) {
    --el-button-bg-color: var(--el-color-primary);
    --el-button-border-color: var(--el-color-primary);
  }
}

// ✅ 暗色模式适配
.dark .user-form {
  --el-bg-color: #1a1a1a;
  --el-text-color-primary: #e5e5e5;
}
</style>
```

**样式优先级处理**

```scss
// ✅ 提高选择器优先级
.user-form {
  // 方式1：增加选择器层级
  &.user-form :deep(.el-input__inner) {
    border-color: red;
  }

  // 方式2：使用 !important（最后手段）
  :deep(.el-input__inner) {
    border-color: red !important;
  }

  // 方式3：使用属性选择器增加特殊性
  :deep(.el-input__inner[type="text"]) {
    border-color: red;
  }
}
```

---

### 4. 异步操作导致组件已卸载时更新状态报错

**问题描述**

在组件中发起异步请求（如 API 调用），当请求完成时组件可能已经被卸载，此时更新状态会导致 Vue 警告："Cannot update a component that is already unmounted"。

**问题原因**

- 组件卸载前未取消进行中的异步操作
- 定时器在组件卸载后仍在执行
- 事件监听器未正确清理

**解决方案**

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const data = ref<UserVo | null>(null)
const loading = ref(false)
let isUnmounted = false // 标记组件是否已卸载

// ❌ 错误：未处理组件卸载情况
async function loadDataUnsafe() {
  loading.value = true
  const result = await fetchUser()
  // 如果此时组件已卸载，下面的赋值会导致警告
  data.value = result
  loading.value = false
}

// ✅ 正确：检查组件是否已卸载
async function loadData() {
  loading.value = true
  try {
    const result = await fetchUser()
    // 只在组件未卸载时更新状态
    if (!isUnmounted) {
      data.value = result
    }
  } finally {
    if (!isUnmounted) {
      loading.value = false
    }
  }
}

onMounted(() => {
  isUnmounted = false
  loadData()
})

onUnmounted(() => {
  isUnmounted = true
})
</script>
```

**使用 AbortController 取消请求**

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const data = ref<UserVo | null>(null)
const loading = ref(false)
let abortController: AbortController | null = null

async function loadData() {
  // 取消之前的请求
  if (abortController) {
    abortController.abort()
  }

  abortController = new AbortController()
  loading.value = true

  try {
    const result = await fetchUser({
      signal: abortController.signal
    })
    data.value = result
  } catch (error) {
    // 忽略取消请求的错误
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('请求已取消')
      return
    }
    throw error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  // 组件卸载时取消所有进行中的请求
  if (abortController) {
    abortController.abort()
  }
})
</script>
```

**封装为 Composable**

```typescript
// composables/useAsyncState.ts
import { ref, onUnmounted, Ref } from 'vue'

interface UseAsyncStateOptions<T> {
  immediate?: boolean
  initialValue?: T
  onError?: (error: Error) => void
}

export function useAsyncState<T>(
  asyncFn: (signal?: AbortSignal) => Promise<T>,
  options: UseAsyncStateOptions<T> = {}
) {
  const { immediate = true, initialValue, onError } = options

  const data = ref<T | undefined>(initialValue) as Ref<T | undefined>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let abortController: AbortController | null = null
  let isUnmounted = false

  async function execute() {
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    loading.value = true
    error.value = null

    try {
      const result = await asyncFn(abortController.signal)
      if (!isUnmounted) {
        data.value = result
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      if (!isUnmounted) {
        error.value = err as Error
        onError?.(err as Error)
      }
    } finally {
      if (!isUnmounted) {
        loading.value = false
      }
    }
  }

  function cancel() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  if (immediate) {
    execute()
  }

  onUnmounted(() => {
    isUnmounted = true
    cancel()
  })

  return {
    data,
    loading,
    error,
    execute,
    cancel
  }
}

// 使用示例
<script setup lang="ts">
import { useAsyncState } from '@/composables/useAsyncState'
import { getUserInfo } from '@/api/user'

const { data: user, loading, error, execute: refresh } = useAsyncState(
  (signal) => getUserInfo({ signal }),
  {
    immediate: true,
    onError: (err) => {
      msgError('加载用户信息失败')
    }
  }
)
</script>
```

---

### 5. Pinia Store 循环依赖导致初始化失败

**问题描述**

多个 Pinia Store 之间相互引用时，导致循环依赖错误，表现为 Store 为 undefined 或抛出初始化错误。

**问题原因**

- Store A 在模块顶层引用 Store B，而 Store B 又引用 Store A
- 在 Store 定义外部直接调用 `useStore()`
- 模块加载顺序导致的依赖问题

**解决方案**

```typescript
// ❌ 错误：在 Store 定义外部直接使用其他 Store
// stores/user.ts
import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

// 错误：这里 settings store 可能还未初始化
const settingsStore = useSettingsStore()

export const useUserStore = defineStore('user', {
  state: () => ({
    name: ''
  }),
  actions: {
    loadUser() {
      // 使用已经可能是 undefined 的 settingsStore
      console.log(settingsStore.theme)
    }
  }
})

// ✅ 正确：在 action 或 getter 内部使用其他 Store
// stores/user.ts
import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: ''
  }),
  getters: {
    welcomeMessage(): string {
      // ✅ 在 getter 内部获取其他 Store
      const settingsStore = useSettingsStore()
      return `${settingsStore.greeting}, ${this.name}`
    }
  },
  actions: {
    loadUser() {
      // ✅ 在 action 内部获取其他 Store
      const settingsStore = useSettingsStore()
      console.log('当前主题:', settingsStore.theme)
    }
  }
})
```

**使用 Setup Store 语法避免循环依赖**

```typescript
// ✅ 使用 Setup Store 语法更灵活地处理依赖
// stores/user.ts
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const name = ref('')
  const token = ref('')

  // 延迟获取其他 Store
  const getSettingsStore = () => {
    // 延迟导入，避免循环依赖
    const { useSettingsStore } = require('./settings')
    return useSettingsStore()
  }

  const welcomeMessage = computed(() => {
    const settingsStore = getSettingsStore()
    return `${settingsStore.greeting}, ${name.value}`
  })

  async function loadUser() {
    const settingsStore = getSettingsStore()
    console.log('主题:', settingsStore.theme)
  }

  return {
    name,
    token,
    welcomeMessage,
    loadUser
  }
})
```

**提取共享逻辑到独立模块**

```typescript
// ✅ 方案：提取共享状态到基础模块
// stores/shared.ts
import { ref } from 'vue'

// 共享的响应式状态
export const sharedState = {
  theme: ref('light'),
  locale: ref('zh-CN')
}

// stores/user.ts
import { defineStore } from 'pinia'
import { sharedState } from './shared'

export const useUserStore = defineStore('user', () => {
  const name = ref('')

  // 直接使用共享状态，不需要导入其他 Store
  const welcomeMessage = computed(() => {
    const greeting = sharedState.locale.value === 'zh-CN' ? '你好' : 'Hello'
    return `${greeting}, ${name.value}`
  })

  return { name, welcomeMessage }
})

// stores/settings.ts
import { defineStore } from 'pinia'
import { sharedState } from './shared'

export const useSettingsStore = defineStore('settings', () => {
  // 使用共享状态
  const theme = sharedState.theme
  const locale = sharedState.locale

  function setTheme(newTheme: string) {
    theme.value = newTheme
  }

  return { theme, locale, setTheme }
})
```

**Store 初始化顺序管理**

```typescript
// stores/index.ts
// ✅ 统一管理 Store 初始化顺序

import { createPinia } from 'pinia'
import type { App } from 'vue'

const pinia = createPinia()

// 存储初始化状态
let initialized = false

export function setupStore(app: App) {
  app.use(pinia)

  // 按依赖顺序初始化 Store
  if (!initialized) {
    initializeStores()
    initialized = true
  }
}

async function initializeStores() {
  // 1. 首先初始化基础 Store（无依赖）
  const { useSettingsStore } = await import('./settings')
  const settingsStore = useSettingsStore()
  await settingsStore.init()

  // 2. 然后初始化依赖基础 Store 的其他 Store
  const { useUserStore } = await import('./user')
  const userStore = useUserStore()
  await userStore.init()

  // 3. 最后初始化依赖多个 Store 的复杂 Store
  const { useAppStore } = await import('./app')
  const appStore = useAppStore()
  await appStore.init()
}

export { pinia }
export * from './user'
export * from './settings'
export * from './app'
```

---

### 6. 表单验证规则复杂导致维护困难

**问题描述**

表单验证规则散落在多个组件中，规则逻辑复杂且重复，难以维护和复用。自定义验证器代码冗长，错误提示不统一。

**问题原因**

- 验证规则直接定义在组件内部，未抽取复用
- 自定义验证器逻辑复杂，未模块化
- 错误提示信息硬编码，无法国际化
- 异步验证处理不规范

**解决方案**

```typescript
// ✅ 创建统一的验证规则工厂
// utils/validators.ts
import type { FormItemRule } from 'element-plus'

// 基础验证规则
export const required = (message = '此字段为必填项'): FormItemRule => ({
  required: true,
  message,
  trigger: 'blur'
})

export const minLength = (min: number, message?: string): FormItemRule => ({
  min,
  message: message ?? `长度不能少于 ${min} 个字符`,
  trigger: 'blur'
})

export const maxLength = (max: number, message?: string): FormItemRule => ({
  max,
  message: message ?? `长度不能超过 ${max} 个字符`,
  trigger: 'blur'
})

export const pattern = (
  regex: RegExp,
  message: string
): FormItemRule => ({
  pattern: regex,
  message,
  trigger: 'blur'
})

// 预设验证规则
export const email = (): FormItemRule => ({
  type: 'email',
  message: '请输入有效的邮箱地址',
  trigger: 'blur'
})

export const phone = (): FormItemRule =>
  pattern(
    /^1[3-9]\d{9}$/,
    '请输入有效的手机号码'
  )

export const url = (): FormItemRule => ({
  type: 'url',
  message: '请输入有效的URL地址',
  trigger: 'blur'
})

export const idCard = (): FormItemRule =>
  pattern(
    /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    '请输入有效的身份证号码'
  )

// 组合规则工厂
export function createRules(
  ...rules: (FormItemRule | FormItemRule[])[]
): FormItemRule[] {
  return rules.flat()
}

// 使用示例
export const usernameRules = createRules(
  required('请输入用户名'),
  minLength(3),
  maxLength(20),
  pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/, '用户名只能包含字母、数字和下划线，且必须以字母开头')
)

export const passwordRules = createRules(
  required('请输入密码'),
  minLength(8, '密码长度不能少于 8 位'),
  maxLength(32),
  pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '密码必须包含大小写字母和数字'
  )
)
```

**自定义异步验证器**

```typescript
// utils/validators.ts

// 异步验证器工厂
export function asyncValidator<T = string>(
  validatorFn: (value: T) => Promise<boolean>,
  message: string
): FormItemRule {
  return {
    asyncValidator: async (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }

      try {
        const isValid = await validatorFn(value)
        if (isValid) {
          callback()
        } else {
          callback(new Error(message))
        }
      } catch (error) {
        callback(new Error('验证服务异常，请稍后重试'))
      }
    },
    trigger: 'blur'
  }
}

// 使用示例：检查用户名是否已存在
export const uniqueUsername = (): FormItemRule =>
  asyncValidator(
    async (username: string) => {
      const [err, result] = await checkUsernameExists(username)
      return !err && !result.exists
    },
    '用户名已被占用'
  )

// 带防抖的异步验证器
export function debouncedAsyncValidator<T = string>(
  validatorFn: (value: T) => Promise<boolean>,
  message: string,
  delay = 300
): FormItemRule {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return {
    asyncValidator: (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(async () => {
        try {
          const isValid = await validatorFn(value)
          callback(isValid ? undefined : new Error(message))
        } catch {
          callback(new Error('验证服务异常'))
        }
      }, delay)
    },
    trigger: 'blur'
  }
}
```

**表单验证 Composable**

```typescript
// composables/useFormValidation.ts
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface UseFormValidationOptions<T extends Record<string, any>> {
  initialValues: T
  rules: FormRules
  onSubmit?: (values: T) => Promise<void>
}

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
) {
  const { initialValues, rules, onSubmit } = options

  const formRef = ref<FormInstance>()
  const form = reactive({ ...initialValues }) as T
  const loading = ref(false)
  const errors = ref<Record<string, string>>({})

  // 是否有验证错误
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  // 验证单个字段
  async function validateField(field: keyof T): Promise<boolean> {
    if (!formRef.value) return true

    try {
      await formRef.value.validateField(field as string)
      delete errors.value[field as string]
      return true
    } catch (error: any) {
      errors.value[field as string] = error.message || '验证失败'
      return false
    }
  }

  // 验证整个表单
  async function validate(): Promise<boolean> {
    if (!formRef.value) return false

    try {
      await formRef.value.validate()
      errors.value = {}
      return true
    } catch (error: any) {
      // 收集所有错误
      if (error && typeof error === 'object') {
        Object.entries(error).forEach(([field, fieldErrors]) => {
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            errors.value[field] = fieldErrors[0].message
          }
        })
      }
      return false
    }
  }

  // 提交表单
  async function submit(): Promise<boolean> {
    const isValid = await validate()
    if (!isValid) return false

    if (onSubmit) {
      loading.value = true
      try {
        await onSubmit(form)
        return true
      } catch (error) {
        console.error('表单提交失败:', error)
        return false
      } finally {
        loading.value = false
      }
    }

    return true
  }

  // 重置表单
  function reset() {
    Object.assign(form, initialValues)
    errors.value = {}
    formRef.value?.resetFields()
  }

  // 设置字段值
  function setFieldValue<K extends keyof T>(field: K, value: T[K]) {
    (form as T)[field] = value
  }

  // 设置多个字段值
  function setValues(values: Partial<T>) {
    Object.assign(form, values)
  }

  return {
    formRef,
    form,
    rules,
    loading,
    errors,
    hasErrors,
    validateField,
    validate,
    submit,
    reset,
    setFieldValue,
    setValues
  }
}

// 使用示例
<script setup lang="ts">
import { useFormValidation } from '@/composables/useFormValidation'
import { usernameRules, passwordRules, email, required } from '@/utils/validators'
import { createUser } from '@/api/user'

const {
  formRef,
  form,
  rules,
  loading,
  submit,
  reset
} = useFormValidation({
  initialValues: {
    username: '',
    password: '',
    email: '',
    nickname: ''
  },
  rules: {
    username: usernameRules,
    password: passwordRules,
    email: [required('请输入邮箱'), email()],
    nickname: [required('请输入昵称'), maxLength(50)]
  },
  onSubmit: async (values) => {
    await createUser(values)
    msgSuccess('创建成功')
  }
})
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" />
    </el-form-item>
    <el-form-item label="昵称" prop="nickname">
      <el-input v-model="form.nickname" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="submit">
        提交
      </el-button>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
</template>
```

---

### 7. 路由切换时组件状态未正确重置

**问题描述**

当使用相同组件渲染不同路由（如 `/user/1` 和 `/user/2`）时，组件状态未正确重置，显示的是上一个路由的数据。或者组件被 keep-alive 缓存后，再次访问时数据未更新。

**问题原因**

- Vue 默认会复用相同组件实例以提高性能
- keep-alive 缓存导致组件不重新创建
- 未正确监听路由参数变化
- 组件初始化逻辑只在 onMounted 中执行

**解决方案**

```vue
<!-- ❌ 错误：只在 onMounted 中加载数据 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = route.params.id as string
const user = ref<UserVo | null>(null)

// 问题：当路由参数变化时，这个钩子不会再次触发
onMounted(async () => {
  user.value = await fetchUser(userId)
})
</script>

<!-- ✅ 正确：监听路由参数变化 -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = ref<UserVo | null>(null)
const loading = ref(false)

// 提取数据加载逻辑
async function loadUser(id: string) {
  loading.value = true
  try {
    user.value = await fetchUser(id)
  } finally {
    loading.value = false
  }
}

// 方案1：监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadUser(newId as string)
    }
  },
  { immediate: true } // 立即执行，替代 onMounted
)
</script>
```

**使用 key 强制组件重新创建**

```vue
<!-- 在 router-view 上使用 key -->
<template>
  <router-view :key="$route.fullPath" />
</template>

<!-- 或者只对特定路由使用 key -->
<template>
  <router-view :key="shouldRerender ? $route.fullPath : undefined" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 需要重新渲染的路由
const rerenderRoutes = ['/user/:id', '/article/:id']

const shouldRerender = computed(() => {
  return rerenderRoutes.some(pattern => {
    const regex = new RegExp(pattern.replace(':id', '\\w+'))
    return regex.test(route.path)
  })
})
</script>
```

**处理 keep-alive 缓存问题**

```vue
<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = ref<UserVo | null>(null)
const lastUserId = ref<string>('')

async function loadUser(id: string) {
  // 避免重复加载相同数据
  if (id === lastUserId.value && user.value) {
    return
  }

  lastUserId.value = id
  user.value = await fetchUser(id)
}

// 首次挂载时加载
onMounted(() => {
  const id = route.params.id as string
  if (id) {
    loadUser(id)
  }
})

// keep-alive 激活时检查是否需要重新加载
onActivated(() => {
  const id = route.params.id as string
  if (id && id !== lastUserId.value) {
    loadUser(id)
  }
})

// 可选：在停用时清理状态
onDeactivated(() => {
  // 根据需要决定是否清理状态
})
</script>
```

**创建路由状态管理 Composable**

```typescript
// composables/useRouteState.ts
import { ref, watch, onActivated } from 'vue'
import { useRoute } from 'vue-router'

interface UseRouteStateOptions<T> {
  paramKey: string
  fetcher: (id: string) => Promise<T>
  initialValue?: T
}

export function useRouteState<T>(options: UseRouteStateOptions<T>) {
  const { paramKey, fetcher, initialValue } = options

  const route = useRoute()
  const data = ref<T | undefined>(initialValue) as Ref<T | undefined>
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const lastParamValue = ref<string>('')

  async function load(id: string) {
    if (!id) return

    // 避免重复加载
    if (id === lastParamValue.value && data.value !== undefined) {
      return
    }

    loading.value = true
    error.value = null
    lastParamValue.value = id

    try {
      data.value = await fetcher(id)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  function refresh() {
    const id = route.params[paramKey] as string
    if (id) {
      lastParamValue.value = '' // 强制重新加载
      load(id)
    }
  }

  // 监听路由参数变化
  watch(
    () => route.params[paramKey],
    (newId) => {
      if (newId) {
        load(newId as string)
      }
    },
    { immediate: true }
  )

  // keep-alive 激活时检查
  onActivated(() => {
    const id = route.params[paramKey] as string
    if (id && id !== lastParamValue.value) {
      load(id)
    }
  })

  return {
    data,
    loading,
    error,
    refresh
  }
}

// 使用示例
<script setup lang="ts">
import { useRouteState } from '@/composables/useRouteState'
import { getUserById } from '@/api/user'

const { data: user, loading, error, refresh } = useRouteState({
  paramKey: 'id',
  fetcher: getUserById
})
</script>

<template>
  <div v-loading="loading">
    <div v-if="error">加载失败：{{ error.message }}</div>
    <div v-else-if="user">
      <h1>{{ user.name }}</h1>
      <button @click="refresh">刷新</button>
    </div>
  </div>
</template>
```

---

### 8. 大型列表渲染导致页面卡顿

**问题描述**

当渲染包含大量数据（如数千条记录）的列表时，页面出现明显卡顿，滚动不流畅，甚至浏览器崩溃。

**问题原因**

- 一次性渲染所有 DOM 节点，占用大量内存
- 复杂的列表项组件导致渲染开销增大
- 未使用虚拟滚动技术
- 不必要的响应式数据导致频繁重渲染

**解决方案**

```vue
<!-- ❌ 错误：直接渲染大列表 -->
<template>
  <div class="list">
    <div v-for="item in largeList" :key="item.id" class="list-item">
      <ComplexItemComponent :data="item" />
    </div>
  </div>
</template>

<!-- ✅ 正确：使用虚拟滚动 -->
<template>
  <div class="list-container" ref="containerRef">
    <div class="list-content" :style="{ height: totalHeight + 'px' }">
      <div
        class="list-viewport"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="list-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <ItemComponent :data="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
  bufferSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  bufferSize: 5
})

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)

// 总高度
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 可见区域起始索引
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize
  return Math.max(0, index)
})

// 可见区域结束索引
const endIndex = computed(() => {
  const visibleCount = Math.ceil(containerHeight.value / props.itemHeight)
  const index = startIndex.value + visibleCount + props.bufferSize * 2
  return Math.min(props.items.length, index)
})

// 可见项
const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

// 偏移量
const offsetY = computed(() => startIndex.value * props.itemHeight)

// 滚动处理
function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
}

onMounted(() => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
    containerRef.value.addEventListener('scroll', handleScroll)

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver((entries) => {
      containerHeight.value = entries[0].contentRect.height
    })
    resizeObserver.observe(containerRef.value)
  }
})
</script>

<style scoped>
.list-container {
  height: 100%;
  overflow-y: auto;
}

.list-content {
  position: relative;
}

.list-viewport {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
</style>
```

**使用现成的虚拟滚动库**

```vue
<template>
  <!-- 使用 @vueuse/core 的 useVirtualList -->
  <div ref="containerRef" class="list-container">
    <div :style="{ height: `${totalSize}px`, position: 'relative' }">
      <div
        v-for="{ data, index } in virtualList"
        :key="data.id"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${index * itemHeight}px)`
        }"
      >
        <ItemComponent :data="data" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

interface Props {
  items: any[]
  itemHeight: number
}

const props = defineProps<Props>()

const { list: virtualList, containerProps, wrapperProps, totalSize } = useVirtualList(
  computed(() => props.items),
  {
    itemHeight: props.itemHeight,
    overscan: 5
  }
)

const containerRef = ref<HTMLElement>()
</script>
```

**列表项性能优化**

```vue
<script setup lang="ts">
import { shallowRef, shallowReactive, markRaw } from 'vue'

// ✅ 使用 shallowRef 避免深度响应式
const items = shallowRef<ItemVo[]>([])

// 更新时需要替换整个数组
function updateItems(newItems: ItemVo[]) {
  items.value = newItems
}

// ✅ 对于只读数据，使用 markRaw 跳过响应式
const staticConfig = markRaw({
  columns: [...],
  options: [...]
})

// ✅ 使用 shallowReactive 处理嵌套对象
const state = shallowReactive({
  items: [] as ItemVo[],
  selectedIds: new Set<string>()
})
</script>

<!-- ✅ 列表项组件优化 -->
<script setup lang="ts">
// 使用 v-once 渲染静态内容
// 使用 v-memo 缓存不常变化的内容
</script>

<template>
  <div class="item">
    <!-- 静态内容使用 v-once -->
    <div v-once class="item-static">
      {{ item.createdAt }}
    </div>

    <!-- 有条件更新的内容使用 v-memo -->
    <div v-memo="[item.status, item.name]" class="item-content">
      <span>{{ item.name }}</span>
      <span>{{ item.status }}</span>
    </div>

    <!-- 频繁更新的内容正常渲染 -->
    <div class="item-actions">
      <button @click="handleEdit">编辑</button>
    </div>
  </div>
</template>
```

**分页加载结合虚拟滚动**

```typescript
// composables/useInfiniteScroll.ts
import { ref, onMounted, onUnmounted } from 'vue'

interface UseInfiniteScrollOptions<T> {
  fetcher: (page: number, pageSize: number) => Promise<{ records: T[]; total: number }>
  pageSize?: number
  threshold?: number
}

export function useInfiniteScroll<T>(
  containerRef: Ref<HTMLElement | undefined>,
  options: UseInfiniteScrollOptions<T>
) {
  const { fetcher, pageSize = 20, threshold = 100 } = options

  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)
  const total = ref(0)

  async function loadMore() {
    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
      const result = await fetcher(currentPage.value, pageSize)
      items.value = [...items.value, ...result.records]
      total.value = result.total
      hasMore.value = items.value.length < total.value
      currentPage.value++
    } finally {
      loading.value = false
    }
  }

  function handleScroll() {
    if (!containerRef.value) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom < threshold) {
      loadMore()
    }
  }

  function reset() {
    items.value = []
    currentPage.value = 1
    hasMore.value = true
    loadMore()
  }

  onMounted(() => {
    loadMore()
    containerRef.value?.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('scroll', handleScroll)
  })

  return {
    items,
    loading,
    hasMore,
    total,
    loadMore,
    reset
  }
}

// 使用示例
<script setup lang="ts">
const containerRef = ref<HTMLElement>()

const { items, loading, hasMore, reset } = useInfiniteScroll(
  containerRef,
  {
    fetcher: async (page, pageSize) => {
      const [err, data] = await getUserList({ page, pageSize })
      if (err) throw err
      return data
    },
    pageSize: 50
  }
)
</script>

<template>
  <div ref="containerRef" class="list-container">
    <VirtualList :items="items" :item-height="60">
      <template #default="{ item }">
        <UserItem :user="item" />
      </template>
    </VirtualList>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!hasMore" class="no-more">没有更多数据</div>
  </div>
</template>
```

