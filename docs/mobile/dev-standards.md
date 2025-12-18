# 移动端开发规范

## 介绍

本文档规定了移动端 UniApp 项目的开发规范，包括命名规范、代码风格、组件开发、API设计等方面的标准。

**核心原则:**

- **类型安全** - 充分利用 TypeScript 类型检查
- **代码复用** - 使用组合式函数实现逻辑复用
- **性能优化** - 合理使用缓存、懒加载
- **可维护性** - 统一命名规范，编写清晰注释

## 基础规范

### 文件命名

| 类型 | 命名规范 | 示例 |
|------|---------|------|
| 页面文件 | camelCase | `userProfile.vue` |
| 组件文件 | PascalCase | `UserCard.vue` |
| 工具文件 | camelCase | `httpUtils.ts` |
| 类型定义 | camelCase | `userTypes.ts` |
| Composable | use前缀 | `useAuth.ts` |
| Store | camelCase | `user.ts` |

### 目录结构

```
src/
├── api/                    # API接口
│   ├── system/            # 系统模块
│   └── business/          # 业务模块
├── components/            # 自定义组件
├── composables/           # 组合式函数
├── layouts/               # 布局组件
├── locales/               # 国际化资源
├── pages/                 # 页面文件
├── static/                # 静态资源
├── stores/                # 状态管理
├── types/                 # 类型定义
├── utils/                 # 工具函数
├── wd/                    # WD UI组件库
├── main.ts                # 应用入口
├── systemConfig.ts        # 系统配置
├── App.vue                # 根组件
├── manifest.json          # 应用配置
├── pages.json             # 页面路由
└── uni.scss               # 全局样式变量
```

### 技术栈版本

| 技术 | 版本 |
|------|------|
| UniApp | 3.0.0-4060620250520001 |
| Vue | 3.4.21 |
| TypeScript | 5.7.2 |
| Pinia | 2.0.36 |
| Vite | 6.3.5 |
| UnoCSS | 65.4.2 |

## 样式规范

### 单位使用

移动端统一使用 `rpx` 单位。

```vue
<!-- ✅ 正确：使用rpx单位 -->
<view class="card" style="padding: 24rpx; margin: 20rpx;">
  <text class="title">标题</text>
</view>

<!-- ✅ 正确：UnoCSS原子化类 -->
<view class="w-full h-12 p-4 flex items-center">
  <text class="text-base text-primary">内容</text>
</view>

<!-- ❌ 错误：使用px单位 -->
<view style="width: 375px;">错误</view>
```

### UnoCSS数值映射

| 数值类 | 对应rpx | 说明 |
|--------|---------|------|
| `p-1` | 8rpx | 内边距 |
| `p-4` | 32rpx | 内边距 |
| `text-sm` | 24rpx | 小号字体 |
| `text-base` | 28rpx | 基础字体 |
| `text-lg` | 32rpx | 大号字体 |

### 样式优先级

1. WD UI组件
2. UnoCSS工具类
3. CSS变量
4. 自定义样式

## 代码规范

### Vue组件结构

```vue
<template>
  <view class="user-page">
    <wd-navbar title="用户资料" />
    <wd-cell-group title="基本信息">
      <wd-input v-model="form.name" label="姓名" required />
    </wd-cell-group>
    <wd-button type="primary" block @click="handleSubmit">保存</wd-button>
  </view>
</template>

<script setup lang="ts">
// 1. 导入声明
import { ref, computed, onMounted } from 'vue'
import { updateUserProfile } from '@/api/system/core/user/userApi'
import type { UserProfileForm } from '@/types/user'

// 2. 接口定义
interface Props {
  userId?: string
}

// 3. Props/Emits
const props = withDefaults(defineProps<Props>(), {
  userId: ''
})

const emit = defineEmits<{
  (e: 'save-success', userId: string): void
}>()

// 4. 响应式数据
const submitting = ref(false)
const form = reactive<UserProfileForm>({
  name: '',
  phone: ''
})

// 5. 计算属性
const isFormValid = computed(() => form.name.trim() !== '')

// 6. 方法定义
const handleSubmit = async () => {
  if (!isFormValid.value) return
  submitting.value = true
  try {
    await updateUserProfile(form)
    emit('save-success', props.userId)
  } finally {
    submitting.value = false
  }
}

// 7. 生命周期
onMounted(() => {
  // 初始化
})
</script>
```

### TypeScript规范

```typescript
/** 用户信息接口 */
interface UserInfo {
  id: number
  name: string
  avatar?: string
  phone: string
  createTime: string
}

/** 用户状态类型 */
type UserStatus = 'active' | 'inactive' | 'pending'

/** 用户角色枚举 */
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

/** 通用API响应 */
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
```

## 组件开发规范

### 组件命名

```typescript
// ✅ 正确：PascalCase
defineOptions({ name: 'UserCard' })

// ✅ WD UI组件使用Wd前缀
defineOptions({
  name: 'WdButton',
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared'
  }
})

// ❌ 错误：kebab-case
defineOptions({ name: 'user-card' })
```

### Props规范

```vue
<script setup lang="ts">
interface UserCardProps {
  user: UserInfo
  showAvatar?: boolean
  avatarSize?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<UserCardProps>(), {
  showAvatar: true,
  avatarSize: 'medium'
})
</script>
```

### Events规范

```vue
<script setup lang="ts">
interface UserCardEmits {
  (e: 'click', user: UserInfo): void
  (e: 'delete', userId: number): void
}

const emit = defineEmits<UserCardEmits>()

const handleClick = () => {
  emit('click', props.user)
}
</script>
```

### 暴露方法

```vue
<script setup lang="ts">
const isExpanded = ref(false)

const expand = () => { isExpanded.value = true }
const collapse = () => { isExpanded.value = false }

defineExpose({
  expand,
  collapse,
  isExpanded
})
</script>
```

## API规范

### 接口定义

```typescript
// api/system/core/user/userApi.ts
import { http } from '@/utils/http'
import type { UserInfo, UserQueryParams } from './userTypes'
import type { PageResponse } from '@/types/http'

/** 获取当前用户信息 */
export const getCurrentUser = (): Promise<UserInfo> => {
  return http.get<UserInfo>('/system/user/getInfo')
}

/** 获取用户列表（分页） */
export const getUserList = (params: UserQueryParams): Promise<PageResponse<UserInfo>> => {
  return http.get<PageResponse<UserInfo>>('/system/user/list', params)
}

/** 更新用户资料 */
export const updateUserProfile = (data: UserProfileForm): Promise<void> => {
  return http.put<void>('/system/user/profile', data)
}
```

### 类型定义

```typescript
// api/system/core/user/userTypes.ts

/** 用户信息 */
export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  email?: string
  phonenumber?: string
  avatar?: string
  status: string
  createTime: string
}

/** 用户查询参数 */
export interface UserQueryParams {
  pageNum: number
  pageSize: number
  userName?: string
  status?: string
}
```

## 组合式函数规范

```typescript
// composables/useUserManagement.ts
import { ref, computed, readonly } from 'vue'
import { getUserList } from '@/api/system/core/user/userApi'
import type { UserInfo, UserQueryParams } from '@/api/system/core/user/userTypes'

export function useUserManagement() {
  // 响应式状态
  const users = ref<UserInfo[]>([])
  const loading = ref(false)
  const total = ref(0)
  const queryParams = ref<UserQueryParams>({
    pageNum: 1,
    pageSize: 20
  })

  // 计算属性
  const hasMore = computed(() => users.value.length < total.value)

  // 方法
  const loadUsers = async (refresh = false) => {
    if (refresh) {
      queryParams.value.pageNum = 1
      users.value = []
    }

    loading.value = true
    try {
      const response = await getUserList(queryParams.value)
      users.value = refresh ? response.records : [...users.value, ...response.records]
      total.value = response.total
      queryParams.value.pageNum++
    } finally {
      loading.value = false
    }
  }

  return {
    users: readonly(users),
    loading: readonly(loading),
    hasMore,
    loadUsers
  }
}
```

## 页面开发规范

### 页面路由配置

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "enablePullDownRefresh": true
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages/order",
      "pages": [
        { "path": "list", "style": { "navigationBarTitleText": "订单列表" } },
        { "path": "detail", "style": { "navigationBarTitleText": "订单详情" } }
      ]
    }
  ]
}
```

### 页面生命周期

```vue
<script setup lang="ts">
// Vue生命周期
onMounted(() => { initPageData() })
onUnmounted(() => { cleanupResources() })

// UniApp页面生命周期
onLoad((options) => { console.log('页面加载，参数:', options) })
onShow(() => { refreshData() })
onHide(() => { pauseTimers() })

// 下拉刷新
onPullDownRefresh(async () => {
  await refreshData()
  uni.stopPullDownRefresh()
})

// 上拉加载
onReachBottom(() => { loadMoreData() })

// 分享
onShareAppMessage(() => ({
  title: '分享标题',
  path: '/pages/index/index'
}))
</script>
```

## 状态管理规范

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cache } from '@/utils/cache'
import type { UserInfo } from '@/api/system/core/user/userTypes'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>(cache.get<string>('token') || '')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickName || '')

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    cache.set('token', newToken, 7 * 24 * 3600)
  }

  const logout = async () => {
    token.value = ''
    userInfo.value = null
    cache.remove('token')
    uni.reLaunch({ url: '/pages/auth/login' })
  }

  return {
    userInfo, token,
    isLoggedIn, userName,
    setToken, logout
  }
})
```

## 条件编译规范

```vue
<template>
  <view>
    <!-- #ifdef H5 -->
    <view class="h5-only">H5专属内容</view>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <button open-type="contact">联系客服</button>
    <!-- #endif -->

    <!-- #ifdef APP-PLUS -->
    <button @click="scanCode">扫一扫</button>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
// #ifdef APP-PLUS
import { scanCode } from '@/utils/native'
// #endif

const handleShare = () => {
  // #ifdef MP-WEIXIN
  wx.showShareMenu({ menus: ['shareAppMessage'] })
  // #endif

  // #ifdef H5
  navigator.share?.({ title: '分享标题', url: location.href })
  // #endif
}
</script>
```

## 平台检测

```typescript
// utils/platform.ts
export const platform = __UNI_PLATFORM__
export const isApp = __UNI_PLATFORM__ === 'app'
export const isMp = __UNI_PLATFORM__.startsWith('mp-')
export const isMpWeixin = __UNI_PLATFORM__.startsWith('mp-weixin')
export const isH5 = __UNI_PLATFORM__ === 'h5'
```

## 缓存策略

```typescript
// utils/cache.ts
const KEY_PREFIX = 'ruoyi_app:'

export const cache = {
  set<T>(key: string, value: T, expireSeconds?: number): boolean {
    try {
      const data = {
        value,
        expire: expireSeconds ? Date.now() + expireSeconds * 1000 : undefined
      }
      uni.setStorageSync(`${KEY_PREFIX}${key}`, data)
      return true
    } catch { return false }
  },

  get<T>(key: string): T | null {
    try {
      const data = uni.getStorageSync(`${KEY_PREFIX}${key}`)
      if (!data) return null
      if (data.expire && data.expire < Date.now()) {
        this.remove(key)
        return null
      }
      return data.value as T
    } catch { return null }
  },

  remove(key: string): void {
    uni.removeStorageSync(`${KEY_PREFIX}${key}`)
  }
}
```

### 缓存使用规范

| 数据类型 | 缓存键 | 过期时间 |
|---------|--------|---------|
| Token | `token` | 7天 |
| 用户信息 | `userInfo` | 1天 |
| 字典数据 | `dict:{type}` | 1小时 |

## 表单校验

```typescript
// utils/validators.ts

/** 验证手机号 */
export const isChinesePhoneNumber = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}

/** 验证邮箱 */
export const isEmail = (email: string): boolean => {
  return /^[\w.-]+@[\w.-]+\.\w+$/.test(email)
}

/** 验证密码强度 */
export const isPassword = (password: string, minLength = 8): boolean => {
  if (password.length < minLength) return false
  if (!/[a-z]/.test(password)) return false
  if (!/\d/.test(password)) return false
  return true
}
```

### 表单校验示例

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <wd-input v-model="formData.phone" label="手机号" prop="phone" />
    <wd-input v-model="formData.password" label="密码" prop="password" type="password" />
    <wd-button type="primary" @click="handleSubmit">提交</wd-button>
  </wd-form>
</template>

<script setup lang="ts">
import { isChinesePhoneNumber, isPassword } from '@/utils/validators'
import type { FormRules } from '@/wd'

const formData = reactive({ phone: '', password: '' })

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号' },
    { validator: (v) => isChinesePhoneNumber(v), message: '请输入有效的手机号' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { validator: (v) => isPassword(v), message: '密码至少8位，包含字母和数字' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) { /* 提交逻辑 */ }
}
</script>
```

## 性能优化

### 防抖节流

```typescript
/** 防抖函数 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** 节流函数 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}
```

### 图片优化

```vue
<wd-img
  :src="imageSrc"
  width="200rpx"
  height="200rpx"
  mode="aspectFill"
  lazy-load
  :placeholder="'/static/images/placeholder.png'"
  @error="handleError"
/>
```

## 最佳实践

### 推荐做法

```typescript
// ✅ 通过emit通知父组件
emit('update:value', newValue)

// ✅ 使用计算属性
const activeNames = computed(() =>
  list.value.filter(item => item.active).map(item => item.name).join(',')
)
```

### 避免做法

```typescript
// ❌ 直接修改props
props.value = newValue

// ❌ 模板中使用复杂表达式
{{ list.filter(item => item.active).map(item => item.name).join(',') }}
```

## 总结

移动端开发规范核心要点:

1. **命名规范** - 页面camelCase，组件PascalCase，Composable use前缀
2. **样式单位** - 统一使用rpx，优先使用UnoCSS
3. **组件开发** - TypeScript类型定义，Props/Emits规范
4. **API设计** - 统一接口定义，完善类型声明
5. **状态管理** - Pinia Setup Store风格
6. **条件编译** - 合理使用 `#ifdef` 处理平台差异
7. **性能优化** - 防抖节流、懒加载、缓存策略
