# 移动端开发规范

本文档规定了移动端 uni-app 项目的开发规范，包括代码风格、命名规范、文件组织、API设计等方面的标准。

## 📋 基础规范

### 文件命名

- **页面文件**: 使用 camelCase，如 `userProfile.vue`
- **组件文件**: 使用 PascalCase，如 `UserCard.vue`
- **工具文件**: 使用 camelCase，如 `httpUtils.ts`
- **常量文件**: 使用 UPPER_SNAKE_CASE，如 `API_CONSTANTS.ts`

### 目录结构

```
src/
├── api/                    # API接口
│   ├── business/          # 业务接口
│   └── system/            # 系统接口
├── components/            # 自定义组件
│   ├── business/          # 业务组件
│   └── common/            # 通用组件
├── composables/           # 组合式函数
├── layouts/               # 布局组件
├── pages/                 # 页面文件
│   ├── auth/              # 认证相关页面
│   ├── index/             # 首页
│   └── my/                # 个人中心
├── static/                # 静态资源
├── stores/                # 状态管理
├── types/                 # 类型定义
├── utils/                 # 工具函数
└── wd/                    # WD UI组件库
```

## 🎨 样式规范

### 单位使用

- **移动端尺寸**: 统一使用 `rpx` 单位
- **边框线条**: 使用 `1rpx` 或 `2rpx`
- **UnoCSS数值**: 直接使用数值，1 = 8rpx

```vue
<template>
  <!-- ✅ 正确：使用rpx -->
  <view class="w-750rpx h-100rpx p-20rpx">
    <!-- ✅ 正确：UnoCSS数值类 -->
    <view class="w-full h-12 p-4">
      内容
    </view>
  </view>

  <!-- ❌ 错误：使用px -->
  <view class="width: 375px; height: 50px;">
    错误示例
  </view>
</template>
```

### CSS注释规范

```scss
/* ✅ 正确：使用块注释 */
.user-card {
  padding: 20rpx;
  margin: 16rpx;
}

// ❌ 错误：不要使用行注释
.user-card {
  padding: 20rpx;
}
```

### 组件样式优先级

1. **WD UI组件**: 优先使用WD UI组件
2. **UnoCSS工具类**: 使用原子化CSS类
3. **自定义样式**: 最后考虑自定义CSS

```vue
<template>
  <!-- 1. 优先使用WD UI -->
  <wd-button type="primary">按钮</wd-button>

  <!-- 2. 使用UnoCSS -->
  <view class="flex items-center justify-between p-4">
    <!-- 3. 自定义样式 -->
    <view class="custom-element">
      内容
    </view>
  </view>
</template>

<style lang="scss" scoped>
.custom-element {
  /* 自定义样式 */
  background: linear-gradient(45deg, #ff6b6b, #feca57);
}
</style>
```

## 💻 代码规范

### Vue组件规范

```vue
<template>
  <!-- 使用语义化标签 -->
  <view class="user-profile-page">
    <wd-navbar title="用户资料" />

    <!-- 表单区域 -->
    <view class="form-section">
      <wd-cell-group title="基本信息">
        <wd-input
          v-model="userForm.name"
          label="姓名"
          placeholder="请输入姓名"
          required
        />
      </wd-cell-group>
    </view>

    <!-- 操作按钮 -->
    <view class="button-section">
      <wd-button
        type="primary"
        block
        :loading="submitting"
        @click="handleSubmit"
      >
        保存
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
// 1. 导入区域
import { ref, reactive } from 'vue'
import type { UserProfileForm } from '@/types/user'

// 2. 接口定义
interface Props {
  userId?: string
}

// 3. Props定义
const props = withDefaults(defineProps<Props>(), {
  userId: ''
})

// 4. 响应式数据
const submitting = ref(false)
const userForm = reactive<UserProfileForm>({
  name: '',
  phone: '',
  email: ''
})

// 5. 计算属性
const isFormValid = computed(() => {
  return userForm.name && userForm.phone
})

// 6. 方法定义
const handleSubmit = async () => {
  if (!isFormValid.value) {
    uni.showToast({
      title: '请填写必填信息',
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    // API调用
    await submitUserProfile(userForm)

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

// 7. 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style lang="scss" scoped>
.user-profile-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.form-section {
  margin: 20rpx;
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

### TypeScript规范

```typescript
// ✅ 正确：使用interface定义类型
interface UserInfo {
  id: number
  name: string
  avatar?: string
  createTime: string
}

// ✅ 正确：使用type定义联合类型
type UserStatus = 'active' | 'inactive' | 'pending'

// ✅ 正确：泛型使用
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// ✅ 正确：枚举定义
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// ✅ 正确：函数类型定义
const getUserInfo = async (id: number): Promise<UserInfo> => {
  // 实现逻辑
}
```

## 📡 API规范

### 接口定义

```typescript
// api/user/userApi.ts
import { http } from '@/utils/http'
import type { UserInfo, UpdateUserRequest } from '@/types/user'

/**
 * 获取用户信息
 * @param id 用户ID
 */
export const getUserInfo = (id: number): Promise<UserInfo> => {
  return http.get<UserInfo>(`/api/user/${id}`)
}

/**
 * 更新用户信息
 * @param data 用户信息
 */
export const updateUserInfo = (data: UpdateUserRequest): Promise<void> => {
  return http.put<void>('/api/user/update', data)
}

/**
 * 获取用户列表
 * @param params 查询参数
 */
export const getUserList = (params: {
  page: number
  size: number
  keyword?: string
}): Promise<PageResult<UserInfo>> => {
  return http.get<PageResult<UserInfo>>('/api/user/list', params)
}
```

### 错误处理

```typescript
// 统一错误处理
const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorMessage = '操作失败'
): Promise<T | null> => {
  try {
    return await apiCall()
  } catch (error) {
    console.error('API调用失败:', error)

    uni.showToast({
      title: errorMessage,
      icon: 'none'
    })

    return null
  }
}

// 使用示例
const handleSave = async () => {
  const result = await handleApiCall(
    () => updateUserInfo(userForm),
    '保存失败，请重试'
  )

  if (result) {
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  }
}
```

## 🎣 组合式函数规范

### 基础模板

```typescript
// composables/useUserManagement.ts
import { ref, computed } from 'vue'
import { getUserList, deleteUser } from '@/api/user/userApi'
import type { UserInfo } from '@/types/user'

export function useUserManagement() {
  // 响应式状态
  const users = ref<UserInfo[]>([])
  const loading = ref(false)
  const searchKeyword = ref('')

  // 计算属性
  const filteredUsers = computed(() => {
    if (!searchKeyword.value) return users.value

    return users.value.filter(user =>
      user.name.includes(searchKeyword.value) ||
      user.email.includes(searchKeyword.value)
    )
  })

  // 方法
  const loadUsers = async () => {
    loading.value = true

    try {
      const response = await getUserList({
        page: 1,
        size: 20,
        keyword: searchKeyword.value
      })

      users.value = response.records
    } catch (error) {
      console.error('加载用户列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const removeUser = async (id: number) => {
    try {
      await deleteUser(id)
      users.value = users.value.filter(user => user.id !== id)

      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      uni.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  }

  // 返回公共接口
  return {
    // 状态
    users: readonly(users),
    loading: readonly(loading),
    searchKeyword,

    // 计算属性
    filteredUsers,

    // 方法
    loadUsers,
    removeUser
  }
}
```

## 📱 页面开发规范

### 页面路由

```javascript
// pages.json
{
  "path": "pages/user/profile",
  "style": {
    "navigationBarTitleText": "用户资料",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f8f8f8"
  }
}
```

### 页面传参

```typescript
// 页面跳转
uni.navigateTo({
  url: `/pages/user/detail?id=${userId}&name=${encodeURIComponent(userName)}`
})

// 接收参数
interface DetailPageProps {
  id?: string
  name?: string
}

const props = withDefaults(defineProps<DetailPageProps>(), {
  id: '',
  name: ''
})

// 或使用onLoad
onLoad((options) => {
  const { id, name } = options
  // 处理参数
})
```

### 生命周期使用

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

// ✅ 正确：使用Composition API
onMounted(() => {
  console.log('页面挂载')
  // 初始化逻辑
})

onUnmounted(() => {
  console.log('页面销毁')
  // 清理逻辑
})

// ✅ 正确：使用uni-app生命周期
onShow(() => {
  console.log('页面显示')
  // 页面显示时的逻辑
})

onHide(() => {
  console.log('页面隐藏')
  // 页面隐藏时的逻辑
})
</script>
```

## 🏪 状态管理规范

### Store定义

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const token = ref('')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '')

  // 方法
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    // 持久化存储
    uni.setStorageSync('token', newToken)
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    uni.removeStorageSync('token')
  }

  return {
    // 状态
    userInfo: readonly(userInfo),
    token: readonly(token),

    // 计算属性
    isLoggedIn,
    userName,

    // 方法
    setUserInfo,
    setToken,
    logout
  }
})
```

## 🛠️ 工具函数规范

### 通用工具

```typescript
// utils/common.ts

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param delay 间隔时间（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
```

## 📝 注释规范

### 函数注释

```typescript
/**
 * 获取用户信息
 * @param userId 用户ID
 * @param includeProfile 是否包含详细资料
 * @returns 用户信息
 * @throws {ApiError} 当用户不存在时抛出错误
 * @example
 * ```typescript
 * const user = await getUserInfo(123, true)
 * console.log(user.name)
 * ```
 */
export async function getUserInfo(
  userId: number,
  includeProfile = false
): Promise<UserInfo> {
  // 实现逻辑
}
```

### 组件注释

```vue
<template>
  <!-- 用户卡片组件：显示用户基本信息和操作按钮 -->
  <view class="user-card">
    <!-- 用户头像区域 -->
    <view class="avatar-section">
      <wd-img :src="user.avatar" class="avatar" />
    </view>

    <!-- 用户信息区域 -->
    <view class="info-section">
      <text class="name">{{ user.name }}</text>
      <text class="email">{{ user.email }}</text>
    </view>
  </view>
</template>
```

## ⚠️ 注意事项

### 平台兼容性

```typescript
// ✅ 正确：检查平台支持
const platform = uni.getSystemInfoSync().platform

if (platform === 'mp-weixin') {
  // 微信小程序特有功能
  wx.requestSubscribeMessage({
    tmplIds: ['template_id']
  })
} else if (platform === 'h5') {
  // H5特有功能
  window.location.href = 'https://example.com'
}

// ❌ 错误：直接使用平台特有API
wx.requestSubscribeMessage({
  tmplIds: ['template_id']
})
```

### 性能优化

```vue
<template>
  <!-- ✅ 正确：使用v-show而非v-if进行频繁切换 -->
  <view v-show="isVisible" class="content">
    频繁切换的内容
  </view>

  <!-- ✅ 正确：长列表使用虚拟滚动 -->
  <wd-virtual-list
    :data="longList"
    :item-height="100"
    :height="600"
  >
    <template #default="{ item }">
      <UserItem :user="item" />
    </template>
  </wd-virtual-list>

  <!-- ❌ 错误：渲染大量DOM -->
  <view v-for="item in longList" :key="item.id">
    {{ item.name }}
  </view>
</template>
```

### 错误边界

```vue
<script setup>
import { onErrorCaptured } from 'vue'

// 错误捕获
onErrorCaptured((error, instance, info) => {
  console.error('组件错误:', error)
  console.error('错误信息:', info)

  // 上报错误
  reportError(error, {
    component: instance?.type?.name,
    info
  })

  return false // 阻止错误继续传播
})
</script>
```

## 🎯 最佳实践

1. **代码复用**: 优先使用组合式函数实现逻辑复用
2. **类型安全**: 充分利用TypeScript类型检查
3. **性能优化**: 合理使用缓存和懒加载
4. **用户体验**: 及时的加载反馈和错误提示
5. **无障碍**: 考虑无障碍访问需求
6. **测试**: 重要功能编写单元测试

遵循这些规范可以确保代码质量、提升开发效率和维护性。
