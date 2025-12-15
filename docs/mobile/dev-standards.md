# 移动端开发规范

本文档规定了移动端 UniApp 项目的开发规范,包括代码风格、命名规范、文件组织、API设计、安全规范、条件编译、主题定制等方面的标准。遵循这些规范可以确保代码质量、提升开发效率和维护性。

## 目录

- [基础规范](#基础规范)
- [样式规范](#样式规范)
- [代码规范](#代码规范)
- [组件开发规范](#组件开发规范)
- [API规范](#api规范)
- [组合式函数规范](#组合式函数规范)
- [页面开发规范](#页面开发规范)
- [状态管理规范](#状态管理规范)
- [条件编译规范](#条件编译规范)
- [国际化规范](#国际化规范)
- [主题定制规范](#主题定制规范)
- [表单校验规范](#表单校验规范)
- [缓存策略规范](#缓存策略规范)
- [安全规范](#安全规范)
- [日志与调试规范](#日志与调试规范)
- [图片资源规范](#图片资源规范)
- [性能优化规范](#性能优化规范)
- [注释规范](#注释规范)
- [最佳实践](#最佳实践)

---

## 基础规范

### 文件命名

项目采用统一的文件命名规范,确保代码组织清晰、易于查找。

| 类型 | 命名规范 | 示例 |
|------|---------|------|
| 页面文件 | camelCase | `userProfile.vue`, `orderDetail.vue` |
| 组件文件 | PascalCase | `UserCard.vue`, `OrderItem.vue` |
| 工具文件 | camelCase | `httpUtils.ts`, `validators.ts` |
| 类型定义 | camelCase | `userTypes.ts`, `orderTypes.ts` |
| 常量文件 | camelCase | `constants.ts`, `enums.ts` |
| Composable | use前缀 + camelCase | `useAuth.ts`, `useTheme.ts` |
| Store | camelCase | `user.ts`, `dict.ts` |

### 目录结构

```
src/
├── api/                    # API接口
│   ├── system/            # 系统模块接口
│   │   ├── auth/          # 认证相关
│   │   ├── core/          # 核心功能
│   │   ├── dict/          # 字典管理
│   │   └── oss/           # OSS存储
│   └── business/          # 业务模块接口
├── components/            # 自定义组件
│   ├── business/          # 业务组件
│   └── common/            # 通用组件
├── composables/           # 组合式函数
│   ├── useAuth.ts         # 认证逻辑
│   ├── useTheme.ts        # 主题管理
│   ├── useI18n.ts         # 国际化
│   ├── useToken.ts        # Token管理
│   └── useWebSocket.ts    # WebSocket
├── layouts/               # 布局组件
│   ├── default.vue        # 默认布局
│   └── tabbar.vue         # 底部导航布局
├── locales/               # 国际化资源
│   ├── i18n.ts            # i18n配置
│   ├── zh-CN.ts           # 中文语言包
│   └── en-US.ts           # 英文语言包
├── pages/                 # 页面文件
│   ├── auth/              # 认证相关页面
│   ├── index/             # 首页
│   ├── my/                # 个人中心
│   └── common/            # 公共页面
├── static/                # 静态资源
│   ├── images/            # 图片资源
│   ├── icons/             # 图标资源
│   └── fonts/             # 字体资源
├── stores/                # 状态管理
│   ├── modules/           # 模块化Store
│   └── store.ts           # Store入口
├── types/                 # 类型定义
│   ├── global.d.ts        # 全局类型
│   ├── http.d.ts          # HTTP类型
│   └── env.d.ts           # 环境变量类型
├── utils/                 # 工具函数
│   ├── cache.ts           # 缓存工具
│   ├── crypto.ts          # 加密工具
│   ├── platform.ts        # 平台工具
│   ├── validators.ts      # 验证工具
│   └── route.ts           # 路由工具
├── wd/                    # WD UI组件库
│   ├── components/        # 组件实现
│   ├── locale/            # 组件国际化
│   └── index.ts           # 组件导出
├── main.ts                # 应用入口
├── systemConfig.ts        # 系统配置
├── App.vue                # 根组件
├── manifest.json          # 应用配置
├── pages.json             # 页面路由配置
└── uni.scss               # 全局样式变量
```

### 技术栈版本

| 技术 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0-4060620250520001 | 跨平台框架 |
| Vue | 3.4.21 | 响应式框架 |
| TypeScript | 5.7.2 | 类型系统 |
| Pinia | 2.0.36 | 状态管理 |
| Vite | 6.3.5 | 构建工具 |
| UnoCSS | 65.4.2 | 原子化CSS |
| WD UI | 自维护版本 | UI组件库 |

---

## 样式规范

### 单位使用

移动端统一使用 `rpx` 单位,确保不同设备上的一致性表现。

```vue
<template>
  <!-- ✅ 正确：使用rpx单位 -->
  <view class="container">
    <view class="card">
      <text class="title">标题文本</text>
    </view>
  </view>

  <!-- ✅ 正确：UnoCSS原子化类 -->
  <view class="w-full h-12 p-4 flex items-center">
    <text class="text-base text-primary">内容</text>
  </view>

  <!-- ❌ 错误：使用px单位 -->
  <view style="width: 375px; height: 50px;">
    错误示例
  </view>
</template>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
  margin: 16rpx;
}

.card {
  width: 710rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
}

.title {
  font-size: 32rpx;
  line-height: 44rpx;
  color: #333333;
}
</style>
```

### UnoCSS数值映射

UnoCSS中的数值类与rpx的对应关系:

| 数值类 | 对应rpx | 实际效果 |
|--------|---------|----------|
| `p-1` | 8rpx | 内边距 8rpx |
| `p-2` | 16rpx | 内边距 16rpx |
| `p-4` | 32rpx | 内边距 32rpx |
| `m-1` | 8rpx | 外边距 8rpx |
| `w-full` | 100% | 宽度100% |
| `h-12` | 96rpx | 高度 96rpx |
| `text-sm` | 24rpx | 小号字体 |
| `text-base` | 28rpx | 基础字体 |
| `text-lg` | 32rpx | 大号字体 |

### CSS注释规范

```scss
/* ========== 页面容器 ========== */
.page-container {
  min-height: 100vh;
  background-color: var(--bg-color);
}

/* 卡片组件 */
.card {
  padding: 24rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 按钮样式 - 主要按钮 */
.btn-primary {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
}

// ❌ 错误：避免使用行注释（可能导致编译问题）
```

### 样式优先级

1. **WD UI组件**: 优先使用WD UI组件库提供的组件
2. **UnoCSS工具类**: 使用原子化CSS实现简单布局
3. **CSS变量**: 使用主题CSS变量保持一致性
4. **自定义样式**: 仅在必要时编写自定义CSS

```vue
<template>
  <view class="page">
    <!-- 1. 优先使用WD UI组件 -->
    <wd-button type="primary" size="large" block>
      提交
    </wd-button>

    <!-- 2. 使用UnoCSS原子类 -->
    <view class="flex items-center justify-between p-4 mt-4">
      <text class="text-base text-gray-600">标签</text>
      <text class="text-sm text-primary">查看更多</text>
    </view>

    <!-- 3. 使用CSS变量 -->
    <view class="status-card">
      <text class="status-text">状态正常</text>
    </view>

    <!-- 4. 自定义复杂样式 -->
    <view class="gradient-header">
      <text class="header-title">自定义渐变头部</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 使用CSS变量保持主题一致性 */
.status-card {
  background-color: var(--color-success-light);
  border: 2rpx solid var(--color-success);
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
}

.status-text {
  color: var(--color-success);
  font-size: 28rpx;
}

/* 自定义复杂样式仅在必要时使用 */
.gradient-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 32rpx;
  border-radius: 0 0 32rpx 32rpx;
}

.header-title {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 600;
}
</style>
```

---

## 代码规范

### Vue组件结构

组件代码遵循统一的结构顺序:

```vue
<template>
  <!-- 使用语义化标签和清晰的结构 -->
  <view class="user-profile-page">
    <!-- 导航栏 -->
    <wd-navbar title="用户资料" />

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 表单区域 -->
      <wd-cell-group title="基本信息">
        <wd-input
          v-model="userForm.name"
          label="姓名"
          placeholder="请输入姓名"
          required
        />
        <wd-input
          v-model="userForm.phone"
          label="手机号"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
          required
        />
      </wd-cell-group>

      <!-- 操作按钮 -->
      <view class="button-section">
        <wd-button
          type="primary"
          block
          :loading="submitting"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          保存
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 用户资料页面
 * @description 用于编辑和保存用户基本信息
 */

// ==================== 1. 导入声明 ====================
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { updateUserProfile } from '@/api/system/core/user/userApi'
import type { UserProfileForm } from '@/types/user'

// ==================== 2. 接口定义 ====================
interface Props {
  /** 用户ID */
  userId?: string
}

interface Emits {
  /** 保存成功事件 */
  (e: 'save-success', userId: string): void
}

// ==================== 3. Props/Emits ====================
const props = withDefaults(defineProps<Props>(), {
  userId: ''
})

const emit = defineEmits<Emits>()

// ==================== 4. 组合式函数 ====================
const { t } = useI18n()

// ==================== 5. 响应式数据 ====================
const submitting = ref(false)
const userForm = reactive<UserProfileForm>({
  name: '',
  phone: '',
  email: ''
})

// ==================== 6. 计算属性 ====================
const isFormValid = computed(() => {
  return userForm.name.trim() !== '' &&
         userForm.phone.length === 11
})

// ==================== 7. 方法定义 ====================
/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!isFormValid.value) {
    uni.showToast({
      title: t('validation.fillRequired', '请填写必填信息'),
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    await updateUserProfile(userForm)

    uni.showToast({
      title: t('common.saveSuccess', '保存成功'),
      icon: 'success'
    })

    emit('save-success', props.userId)
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: t('common.saveFailed', '保存失败'),
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

/**
 * 加载用户数据
 */
const loadUserData = async () => {
  if (!props.userId) return

  try {
    // 加载用户数据逻辑
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

// ==================== 8. 生命周期 ====================
onMounted(() => {
  loadUserData()
})
</script>

<style lang="scss" scoped>
.user-profile-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.content {
  padding: 20rpx;
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

### TypeScript规范

```typescript
// ==================== 接口定义 ====================

/**
 * 用户信息接口
 */
interface UserInfo {
  /** 用户ID */
  id: number
  /** 用户名称 */
  name: string
  /** 用户头像 */
  avatar?: string
  /** 手机号码 */
  phone: string
  /** 邮箱地址 */
  email?: string
  /** 创建时间 */
  createTime: string
}

/**
 * 用户状态类型
 */
type UserStatus = 'active' | 'inactive' | 'pending'

/**
 * 用户角色枚举
 */
enum UserRole {
  /** 管理员 */
  ADMIN = 'admin',
  /** 普通用户 */
  USER = 'user',
  /** 访客 */
  GUEST = 'guest'
}

// ==================== API响应类型 ====================

/**
 * 通用API响应结构
 */
interface ApiResponse<T> {
  /** 响应码 */
  code: number
  /** 响应数据 */
  data: T
  /** 响应消息 */
  message: string
}

/**
 * 分页响应结构
 */
interface PageResponse<T> {
  /** 数据列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
}

// ==================== 函数类型定义 ====================

/**
 * 获取用户信息
 * @param id - 用户ID
 * @returns 用户信息Promise
 */
const getUserInfo = async (id: number): Promise<UserInfo> => {
  // 实现逻辑
}

/**
 * 带泛型的请求函数
 */
const request = async <T>(
  url: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> => {
  // 实现逻辑
}
```

---

## 组件开发规范

### 组件命名规范

```typescript
// ✅ 正确：组件名使用PascalCase
defineOptions({
  name: 'UserCard'
})

// ✅ 正确：WD UI组件使用Wd前缀
defineOptions({
  name: 'WdButton',
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared'
  }
})

// ❌ 错误：使用kebab-case或camelCase
defineOptions({
  name: 'user-card'  // 错误
})
```

### 组件Props规范

```vue
<script setup lang="ts">
/**
 * 用户卡片组件
 * @description 展示用户基本信息的卡片组件
 */

// Props类型定义
interface UserCardProps {
  /** 用户信息 */
  user: UserInfo
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 头像大小 */
  avatarSize?: 'small' | 'medium' | 'large'
  /** 是否可点击 */
  clickable?: boolean
  /** 自定义类名 */
  customClass?: string
}

// Props默认值
const props = withDefaults(defineProps<UserCardProps>(), {
  showAvatar: true,
  avatarSize: 'medium',
  clickable: false,
  customClass: ''
})

// 头像尺寸映射
const avatarSizeMap: Record<string, string> = {
  small: '64rpx',
  medium: '96rpx',
  large: '128rpx'
}

const avatarStyle = computed(() => ({
  width: avatarSizeMap[props.avatarSize],
  height: avatarSizeMap[props.avatarSize]
}))
</script>
```

### 组件事件规范

```vue
<script setup lang="ts">
// 事件类型定义
interface UserCardEmits {
  /** 点击事件 */
  (e: 'click', user: UserInfo): void
  /** 头像点击事件 */
  (e: 'avatar-click', userId: number): void
  /** 删除事件 */
  (e: 'delete', userId: number): void
}

const emit = defineEmits<UserCardEmits>()

// 事件处理
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.user)
  }
}

const handleAvatarClick = () => {
  emit('avatar-click', props.user.id)
}

const handleDelete = () => {
  emit('delete', props.user.id)
}
</script>
```

### 组件插槽规范

```vue
<template>
  <view class="user-card" @click="handleClick">
    <!-- 默认插槽 -->
    <slot>
      <view class="default-content">
        {{ user.name }}
      </view>
    </slot>

    <!-- 具名插槽：头部 -->
    <slot name="header">
      <view class="card-header">
        <wd-img v-if="showAvatar" :src="user.avatar" :style="avatarStyle" />
      </view>
    </slot>

    <!-- 作用域插槽：操作区 -->
    <slot name="actions" :user="user" :delete="handleDelete">
      <view class="card-actions">
        <wd-button size="small" @click.stop="handleDelete">删除</wd-button>
      </view>
    </slot>
  </view>
</template>
```

### 组件暴露方法

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 组件内部状态
const isExpanded = ref(false)
const contentRef = ref<HTMLElement | null>(null)

// 组件方法
const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  isExpanded.value = false
}

const toggle = () => {
  isExpanded.value = !isExpanded.value
}

const scrollToTop = () => {
  contentRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

// 暴露给父组件的方法和属性
defineExpose({
  expand,
  collapse,
  toggle,
  scrollToTop,
  isExpanded
})
</script>
```

---

## API规范

### 接口定义规范

```typescript
// api/system/core/user/userApi.ts
import { http } from '@/utils/http'
import type { UserInfo, UserProfileForm, UserQueryParams } from './userTypes'
import type { PageResponse } from '@/types/http'

/**
 * 用户相关API接口
 */

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getCurrentUser = (): Promise<UserInfo> => {
  return http.get<UserInfo>('/system/user/getInfo')
}

/**
 * 根据ID获取用户信息
 * @param id - 用户ID
 * @returns 用户信息
 */
export const getUserById = (id: number): Promise<UserInfo> => {
  return http.get<UserInfo>(`/system/user/${id}`)
}

/**
 * 获取用户列表（分页）
 * @param params - 查询参数
 * @returns 分页用户列表
 */
export const getUserList = (
  params: UserQueryParams
): Promise<PageResponse<UserInfo>> => {
  return http.get<PageResponse<UserInfo>>('/system/user/list', params)
}

/**
 * 更新用户资料
 * @param data - 用户资料表单
 * @returns 更新结果
 */
export const updateUserProfile = (data: UserProfileForm): Promise<void> => {
  return http.put<void>('/system/user/profile', data)
}

/**
 * 修改用户密码
 * @param oldPassword - 旧密码
 * @param newPassword - 新密码
 * @returns 修改结果
 */
export const updatePassword = (
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  return http.put<void>('/system/user/profile/updatePwd', {
    oldPassword,
    newPassword
  })
}

/**
 * 上传用户头像
 * @param file - 头像文件
 * @returns 头像URL
 */
export const uploadAvatar = (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('avatarfile', file)
  return http.post<{ url: string }>('/system/user/profile/avatar', formData)
}
```

### 类型定义规范

```typescript
// api/system/core/user/userTypes.ts

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  userId: number
  /** 用户账号 */
  userName: string
  /** 用户昵称 */
  nickName: string
  /** 用户邮箱 */
  email?: string
  /** 手机号码 */
  phonenumber?: string
  /** 用户性别 0=男 1=女 2=未知 */
  sex?: string
  /** 头像地址 */
  avatar?: string
  /** 帐号状态 0=正常 1=停用 */
  status: string
  /** 部门ID */
  deptId?: number
  /** 创建时间 */
  createTime: string
  /** 角色列表 */
  roles?: RoleInfo[]
}

/**
 * 用户资料表单
 */
export interface UserProfileForm {
  /** 用户昵称 */
  nickName: string
  /** 手机号码 */
  phonenumber: string
  /** 用户邮箱 */
  email?: string
  /** 用户性别 */
  sex?: string
}

/**
 * 用户查询参数
 */
export interface UserQueryParams {
  /** 页码 */
  pageNum: number
  /** 每页大小 */
  pageSize: number
  /** 用户名 */
  userName?: string
  /** 手机号 */
  phonenumber?: string
  /** 状态 */
  status?: string
  /** 部门ID */
  deptId?: number
}

/**
 * 角色信息
 */
export interface RoleInfo {
  /** 角色ID */
  roleId: number
  /** 角色名称 */
  roleName: string
  /** 角色权限字符串 */
  roleKey: string
}
```

### 错误处理规范

```typescript
// utils/apiHelper.ts
import { useI18n } from '@/composables/useI18n'

/**
 * 统一API调用包装器
 * @param apiCall - API调用函数
 * @param options - 配置选项
 */
export const callApi = async <T>(
  apiCall: () => Promise<T>,
  options: {
    /** 成功提示 */
    successMessage?: string
    /** 失败提示 */
    errorMessage?: string
    /** 是否显示加载 */
    showLoading?: boolean
    /** 加载提示文本 */
    loadingText?: string
  } = {}
): Promise<T | null> => {
  const { t } = useI18n()
  const {
    successMessage,
    errorMessage = t('common.operateFailed', '操作失败'),
    showLoading = false,
    loadingText = t('common.loading', '加载中...')
  } = options

  if (showLoading) {
    uni.showLoading({ title: loadingText })
  }

  try {
    const result = await apiCall()

    if (successMessage) {
      uni.showToast({
        title: successMessage,
        icon: 'success'
      })
    }

    return result
  } catch (error: any) {
    console.error('API调用失败:', error)

    // 根据错误类型显示不同提示
    const message = error.message || errorMessage
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })

    return null
  } finally {
    if (showLoading) {
      uni.hideLoading()
    }
  }
}

// 使用示例
const handleSave = async () => {
  const result = await callApi(
    () => updateUserProfile(userForm),
    {
      successMessage: '保存成功',
      errorMessage: '保存失败，请重试',
      showLoading: true,
      loadingText: '保存中...'
    }
  )

  if (result) {
    // 保存成功后的逻辑
    uni.navigateBack()
  }
}
```

---

## 组合式函数规范

### 基础模板

```typescript
// composables/useUserManagement.ts
import { ref, computed, readonly } from 'vue'
import { getUserList, deleteUser, updateUser } from '@/api/system/core/user/userApi'
import type { UserInfo, UserQueryParams } from '@/api/system/core/user/userTypes'

/**
 * 用户管理组合式函数
 * @description 提供用户列表的CRUD操作和状态管理
 */
export function useUserManagement() {
  // ==================== 响应式状态 ====================
  const users = ref<UserInfo[]>([])
  const loading = ref(false)
  const total = ref(0)
  const queryParams = ref<UserQueryParams>({
    pageNum: 1,
    pageSize: 20
  })

  // ==================== 计算属性 ====================
  const hasMore = computed(() => {
    return users.value.length < total.value
  })

  const isEmpty = computed(() => {
    return !loading.value && users.value.length === 0
  })

  // ==================== 方法定义 ====================

  /**
   * 加载用户列表
   * @param refresh - 是否刷新（重置页码）
   */
  const loadUsers = async (refresh = false) => {
    if (refresh) {
      queryParams.value.pageNum = 1
      users.value = []
    }

    loading.value = true

    try {
      const response = await getUserList(queryParams.value)

      if (refresh) {
        users.value = response.records
      } else {
        users.value.push(...response.records)
      }

      total.value = response.total
      queryParams.value.pageNum++
    } catch (error) {
      console.error('加载用户列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除用户
   * @param userId - 用户ID
   */
  const removeUser = async (userId: number) => {
    try {
      await deleteUser(userId)
      users.value = users.value.filter(user => user.userId !== userId)
      total.value--

      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('删除用户失败:', error)
      uni.showToast({
        title: '删除失败',
        icon: 'none'
      })
      throw error
    }
  }

  /**
   * 更新用户信息
   * @param userId - 用户ID
   * @param data - 更新数据
   */
  const updateUserInfo = async (userId: number, data: Partial<UserInfo>) => {
    try {
      await updateUser(userId, data)

      // 更新本地状态
      const index = users.value.findIndex(u => u.userId === userId)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...data }
      }

      uni.showToast({
        title: '更新成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  /**
   * 设置查询条件
   * @param params - 查询参数
   */
  const setQueryParams = (params: Partial<UserQueryParams>) => {
    queryParams.value = {
      ...queryParams.value,
      ...params,
      pageNum: 1 // 重置页码
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    users.value = []
    total.value = 0
    queryParams.value = {
      pageNum: 1,
      pageSize: 20
    }
  }

  // ==================== 返回公共接口 ====================
  return {
    // 只读状态
    users: readonly(users),
    loading: readonly(loading),
    total: readonly(total),

    // 计算属性
    hasMore,
    isEmpty,

    // 方法
    loadUsers,
    removeUser,
    updateUserInfo,
    setQueryParams,
    reset
  }
}
```

### Composable命名规范

| 功能类型 | 命名规范 | 示例 |
|---------|---------|------|
| 数据管理 | use + 数据名 | `useUser`, `useDict` |
| UI交互 | use + 功能名 | `useModal`, `useToast` |
| 工具功能 | use + 动作名 | `useScroll`, `useStorage` |
| 状态管理 | use + State后缀 | `useFormState`, `useListState` |

---

## 页面开发规范

### 页面路由配置

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "enablePullDownRefresh": true
      }
    },
    {
      "path": "pages/user/profile",
      "style": {
        "navigationBarTitleText": "用户资料",
        "navigationBarBackgroundColor": "#ffffff",
        "navigationBarTextStyle": "black",
        "backgroundColor": "#f8f8f8"
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages/order",
      "pages": [
        {
          "path": "list",
          "style": {
            "navigationBarTitleText": "订单列表"
          }
        },
        {
          "path": "detail",
          "style": {
            "navigationBarTitleText": "订单详情"
          }
        }
      ]
    }
  ]
}
```

### 页面传参规范

```typescript
// 页面跳转与传参

// 1. 简单参数传递
uni.navigateTo({
  url: `/pages/user/detail?id=${userId}`
})

// 2. 复杂参数传递（使用encodeURIComponent）
const params = encodeURIComponent(JSON.stringify({
  userId: 123,
  userName: '张三',
  extra: { type: 'vip' }
}))
uni.navigateTo({
  url: `/pages/user/detail?data=${params}`
})

// 3. 接收参数
<script setup lang="ts">
interface PageQuery {
  id?: string
  data?: string
}

// 使用 defineProps 接收 URL 参数
const props = defineProps<PageQuery>()

// 或使用 onLoad 生命周期
onLoad((options: PageQuery) => {
  if (options.id) {
    loadUserDetail(Number(options.id))
  }

  if (options.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data))
      // 处理复杂参数
    } catch (e) {
      console.error('参数解析失败:', e)
    }
  }
})
</script>
```

### 页面生命周期

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// ==================== Vue生命周期 ====================
onMounted(() => {
  console.log('组件挂载完成')
  initPageData()
})

onUnmounted(() => {
  console.log('组件卸载')
  cleanupResources()
})

// ==================== UniApp页面生命周期 ====================

// 页面加载时触发
onLoad((options) => {
  console.log('页面加载，参数:', options)
})

// 页面初次渲染完成时触发
onReady(() => {
  console.log('页面渲染完成')
})

// 页面显示时触发
onShow(() => {
  console.log('页面显示')
  refreshData()
})

// 页面隐藏时触发
onHide(() => {
  console.log('页面隐藏')
  pauseTimers()
})

// 页面卸载时触发
onUnload(() => {
  console.log('页面卸载')
})

// 下拉刷新
onPullDownRefresh(async () => {
  console.log('触发下拉刷新')
  await refreshData()
  uni.stopPullDownRefresh()
})

// 上拉加载更多
onReachBottom(() => {
  console.log('触发上拉加载')
  loadMoreData()
})

// 页面滚动
onPageScroll((e) => {
  console.log('页面滚动位置:', e.scrollTop)
})

// 分享给朋友
onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/pages/index/index'
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: '分享标题'
  }
})
</script>
```

---

## 状态管理规范

### Store定义规范

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cache } from '@/utils/cache'
import { getCurrentUser, logout as logoutApi } from '@/api/system/auth/authApi'
import type { UserInfo } from '@/api/system/core/user/userTypes'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // ==================== 状态定义 ====================
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>(cache.get<string>('token') || '')
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // ==================== 计算属性 ====================

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value)

  /** 用户名称 */
  const userName = computed(() => userInfo.value?.nickName || '')

  /** 用户头像 */
  const avatar = computed(() => userInfo.value?.avatar || '/static/images/default-avatar.png')

  /** 是否为管理员 */
  const isAdmin = computed(() => roles.value.includes('admin'))

  // ==================== 方法定义 ====================

  /**
   * 设置Token
   */
  const setToken = (newToken: string) => {
    token.value = newToken
    cache.set('token', newToken, 7 * 24 * 3600) // 7天过期
  }

  /**
   * 获取用户信息
   */
  const getUserInfo = async () => {
    if (!token.value) {
      throw new Error('未登录')
    }

    try {
      const data = await getCurrentUser()
      userInfo.value = data
      roles.value = data.roles?.map(r => r.roleKey) || []
      permissions.value = data.permissions || []
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 检查权限
   */
  const hasPermission = (permission: string | string[]): boolean => {
    if (isAdmin.value) return true

    if (Array.isArray(permission)) {
      return permission.some(p => permissions.value.includes(p))
    }
    return permissions.value.includes(permission)
  }

  /**
   * 检查角色
   */
  const hasRole = (role: string | string[]): boolean => {
    if (isAdmin.value) return true

    if (Array.isArray(role)) {
      return role.some(r => roles.value.includes(r))
    }
    return roles.value.includes(role)
  }

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      // 清除状态
      token.value = ''
      userInfo.value = null
      roles.value = []
      permissions.value = []

      // 清除缓存
      cache.remove('token')
      cache.remove('userInfo')

      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/auth/login'
      })
    }
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
  }

  return {
    // 状态
    userInfo,
    token,
    roles,
    permissions,

    // 计算属性
    isLoggedIn,
    userName,
    avatar,
    isAdmin,

    // 方法
    setToken,
    getUserInfo,
    hasPermission,
    hasRole,
    logout,
    resetState
  }
})
```

---

## 条件编译规范

### 平台检测

```typescript
// utils/platform.ts

/** 当前运行平台 */
export const platform = __UNI_PLATFORM__

/** 是否为App */
export const isApp = __UNI_PLATFORM__ === 'app'

/** 是否为小程序 */
export const isMp = __UNI_PLATFORM__.startsWith('mp-')

/** 是否为微信小程序 */
export const isMpWeixin = __UNI_PLATFORM__.startsWith('mp-weixin')

/** 是否为支付宝小程序 */
export const isMpAlipay = __UNI_PLATFORM__.startsWith('mp-alipay')

/** 是否为H5 */
export const isH5 = __UNI_PLATFORM__ === 'h5'

/** 是否在微信环境 */
export const isWechatEnvironment = (): boolean => {
  if (isMpWeixin) return true

  if (isH5) {
    const ua = navigator.userAgent.toLowerCase()
    return ua.includes('micromessenger')
  }

  return false
}
```

### 条件编译写法

```vue
<template>
  <view class="container">
    <!-- 仅在H5显示 -->
    <!-- #ifdef H5 -->
    <view class="h5-only">
      <web-view src="https://example.com"></web-view>
    </view>
    <!-- #endif -->

    <!-- 仅在微信小程序显示 -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="wechat-only">
      <button open-type="contact">联系客服</button>
    </view>
    <!-- #endif -->

    <!-- 仅在App显示 -->
    <!-- #ifdef APP-PLUS -->
    <view class="app-only">
      <button @click="scanCode">扫一扫</button>
    </view>
    <!-- #endif -->

    <!-- 在所有小程序平台显示 -->
    <!-- #ifdef MP -->
    <view class="mp-common">
      <button open-type="share">分享</button>
    </view>
    <!-- #endif -->

    <!-- 非H5平台显示 -->
    <!-- #ifndef H5 -->
    <view class="native-only">
      原生功能
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
// 条件编译 - 引入
// #ifdef APP-PLUS
import { scanCode } from '@/utils/native'
// #endif

// 条件编译 - 方法
const handleShare = () => {
  // #ifdef MP-WEIXIN
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
  // #endif

  // #ifdef H5
  // H5分享逻辑
  navigator.share?.({
    title: '分享标题',
    url: window.location.href
  })
  // #endif
}

// 条件编译 - 样式
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

/* #ifdef H5 */
.h5-only {
  /* H5特有样式 */
}
/* #endif */

/* #ifdef MP-WEIXIN */
.wechat-only {
  /* 微信小程序特有样式 */
}
/* #endif */
</style>
```

---

## 国际化规范

### 语言配置

```typescript
// locales/i18n.ts
import { ref, computed } from 'vue'
import { cache } from '@/utils/cache'
import zhCN from './zh-CN'
import enUS from './en-US'
import { LanguageCode } from '@/systemConfig'

// 语言包映射
const messages: Record<LanguageCode, typeof zhCN> = {
  [LanguageCode.zh_CN]: zhCN,
  [LanguageCode.en_US]: enUS
}

// 当前语言
const currentLanguage = ref<LanguageCode>(
  cache.get<LanguageCode>('language') || LanguageCode.zh_CN
)

/**
 * 获取当前语言
 */
export const getLanguage = (): LanguageCode => currentLanguage.value

/**
 * 设置语言
 */
export const setLanguage = (lang: LanguageCode): boolean => {
  if (!(lang in messages)) {
    console.warn(`不支持的语言: ${lang}`)
    return false
  }

  currentLanguage.value = lang
  cache.set('language', lang)
  return true
}

/**
 * 获取当前语言包
 */
export const getCurrentMessages = () => messages[currentLanguage.value]

/**
 * 语言状态（响应式）
 */
export const languageState = {
  current: computed(() => currentLanguage.value),
  currentName: computed(() => {
    const nameMap: Record<LanguageCode, string> = {
      [LanguageCode.zh_CN]: '简体中文',
      [LanguageCode.en_US]: 'English'
    }
    return nameMap[currentLanguage.value]
  }),
  options: computed(() => [
    { value: LanguageCode.zh_CN, label: '简体中文', name: 'Chinese' },
    { value: LanguageCode.en_US, label: 'English', name: 'English' }
  ]),
  isChinese: computed(() => currentLanguage.value === LanguageCode.zh_CN),
  isEnglish: computed(() => currentLanguage.value === LanguageCode.en_US)
}
```

### 语言包定义

```typescript
// locales/zh-CN.ts
export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '新增',
    search: '搜索',
    reset: '重置',
    loading: '加载中...',
    noData: '暂无数据',
    loadMore: '加载更多',
    noMore: '没有更多了',
    success: '操作成功',
    failed: '操作失败',
    networkError: '网络错误，请稍后重试'
  },
  validation: {
    required: '此项为必填项',
    email: '请输入有效的邮箱地址',
    phone: '请输入有效的手机号码',
    minLength: '最少输入 {min} 个字符',
    maxLength: '最多输入 {max} 个字符',
    password: '密码必须包含字母和数字',
    confirmPassword: '两次输入的密码不一致'
  },
  user: {
    login: '登录',
    logout: '退出登录',
    register: '注册',
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    phone: '手机号',
    email: '邮箱',
    avatar: '头像',
    nickname: '昵称',
    profile: '个人资料'
  },
  route: {
    home: '首页',
    my: '我的',
    setting: '设置',
    about: '关于'
  }
}
```

### 使用国际化

```vue
<template>
  <view class="page">
    <!-- 基础用法 -->
    <text>{{ t('common.confirm') }}</text>

    <!-- 带参数 -->
    <text>{{ t('validation.minLength', { min: 6 }) }}</text>

    <!-- 动态切换语言 -->
    <wd-picker
      :columns="languageOptions"
      v-model="currentLanguage"
      @change="handleLanguageChange"
    />
  </view>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t, currentLanguage, languageOptions, setLanguage } = useI18n()

const handleLanguageChange = ({ value }: { value: string }) => {
  setLanguage(value as LanguageCode)

  // 可选：重新加载页面以应用新语言
  uni.reLaunch({
    url: '/pages/index/index'
  })
}
</script>
```

---

## 主题定制规范

### 主题配置

```typescript
// composables/useTheme.ts
import { ref, computed } from 'vue'
import type { ConfigProviderThemeVars } from '@/wd'

// 默认主题配置
const DEFAULT_THEME: ConfigProviderThemeVars = {
  // 基础色彩
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C',

  // 组件配置
  loadingSize: '40rpx',
  navbarTitleFontSize: '32rpx',
  navbarTitleFontWeight: 'normal'
}

// 全局主题覆盖
const globalThemeOverrides = ref<Partial<ConfigProviderThemeVars>>({})

/**
 * 主题配置Hook
 */
export const useTheme = (localOverrides?: Partial<ConfigProviderThemeVars>) => {
  // 合并主题配置
  const themeVars = computed<ConfigProviderThemeVars>(() => ({
    ...DEFAULT_THEME,
    ...globalThemeOverrides.value,
    ...localOverrides
  }))

  /**
   * 设置全局主题
   */
  const setGlobalTheme = (overrides: Partial<ConfigProviderThemeVars>) => {
    globalThemeOverrides.value = {
      ...globalThemeOverrides.value,
      ...overrides
    }
  }

  /**
   * 重置主题
   */
  const resetGlobalTheme = () => {
    globalThemeOverrides.value = {}
  }

  return {
    themeVars,
    setGlobalTheme,
    resetGlobalTheme
  }
}
```

### 使用主题

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="app">
      <slot />
    </view>
  </wd-config-provider>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

// 基础使用
const { themeVars } = useTheme()

// 局部定制
const { themeVars: customTheme } = useTheme({
  colorTheme: '#FF6B6B',
  buttonPrimaryBgColor: '#FF6B6B'
})
</script>
```

---

## 表单校验规范

### 校验函数

```typescript
// utils/validators.ts

/**
 * 验证手机号
 */
export const isChinesePhoneNumber = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 */
export const isEmail = (email: string): boolean => {
  return /^[\w.-]+@[\w.-]+\.\w+$/.test(email)
}

/**
 * 验证身份证号
 */
export const isChineseIdCard = (id: string): boolean => {
  const reg = /^\d{15}$|^\d{18}$|^\d{17}[\dX]$/i
  if (!reg.test(id)) return false

  // 18位身份证校验码验证
  if (id.length === 18) {
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(id[i]) * factor[i]
    }
    return parity[sum % 11].toLowerCase() === id[17].toLowerCase()
  }

  return true
}

/**
 * 验证密码强度
 */
export const isPassword = (
  password: string,
  options: {
    minLength?: number
    requireLowercase?: boolean
    requireUppercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  } = {}
): boolean => {
  const {
    minLength = 8,
    requireLowercase = true,
    requireUppercase = false,
    requireNumbers = true,
    requireSpecialChars = false
  } = options

  if (password.length < minLength) return false
  if (requireLowercase && !/[a-z]/.test(password)) return false
  if (requireUppercase && !/[A-Z]/.test(password)) return false
  if (requireNumbers && !/\d/.test(password)) return false
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false

  return true
}
```

### 表单校验规则

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <wd-cell-group>
      <wd-input
        v-model="formData.phone"
        label="手机号"
        prop="phone"
        placeholder="请输入手机号"
        type="number"
        maxlength="11"
      />
      <wd-input
        v-model="formData.password"
        label="密码"
        prop="password"
        placeholder="请输入密码"
        type="password"
      />
    </wd-cell-group>

    <wd-button type="primary" block @click="handleSubmit">
      提交
    </wd-button>
  </wd-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { isChinesePhoneNumber, isPassword } from '@/utils/validators'
import type { FormRules, FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const formData = reactive({
  phone: '',
  password: ''
})

// 校验规则
const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: (value) => isChinesePhoneNumber(value),
      message: '请输入有效的手机号'
    }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 8, max: 20, message: '密码长度为8-20位' },
    {
      validator: (value) => isPassword(value, { minLength: 8, requireNumbers: true }),
      message: '密码必须包含字母和数字'
    }
  ]
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    // 提交逻辑
  }
}
</script>
```

---

## 缓存策略规范

### 缓存工具

```typescript
// utils/cache.ts

const KEY_PREFIX = 'ruoyi_app:'

/**
 * 缓存工具
 */
export const cache = {
  /**
   * 设置缓存
   * @param key - 缓存键
   * @param value - 缓存值
   * @param expireSeconds - 过期时间（秒）
   */
  set<T>(key: string, value: T, expireSeconds?: number): boolean {
    try {
      const data = {
        value,
        expire: expireSeconds ? Date.now() + expireSeconds * 1000 : undefined
      }
      uni.setStorageSync(`${KEY_PREFIX}${key}`, data)
      return true
    } catch (e) {
      console.error('缓存设置失败:', e)
      return false
    }
  },

  /**
   * 获取缓存
   * @param key - 缓存键
   */
  get<T>(key: string): T | null {
    try {
      const data = uni.getStorageSync(`${KEY_PREFIX}${key}`)
      if (!data) return null

      // 检查过期
      if (data.expire && data.expire < Date.now()) {
        this.remove(key)
        return null
      }

      return data.value as T
    } catch (e) {
      return null
    }
  },

  /**
   * 移除缓存
   */
  remove(key: string): void {
    uni.removeStorageSync(`${KEY_PREFIX}${key}`)
  },

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null
  },

  /**
   * 清除所有应用缓存
   */
  clearAll(): void {
    const info = uni.getStorageInfoSync()
    info.keys
      .filter(key => key.startsWith(KEY_PREFIX))
      .forEach(key => uni.removeStorageSync(key))
  }
}
```

### 缓存使用规范

| 数据类型 | 缓存键 | 过期时间 | 说明 |
|---------|--------|---------|------|
| Token | `token` | 7天 | 登录令牌 |
| 用户信息 | `userInfo` | 1天 | 基本信息 |
| 字典数据 | `dict:{type}` | 1小时 | 字典缓存 |
| 表单草稿 | `draft:{page}` | 7天 | 表单草稿 |
| 搜索历史 | `searchHistory` | 永久 | 搜索记录 |

---

## 安全规范

### 敏感数据处理

```typescript
// utils/crypto.ts
import CryptoJS from 'crypto-js'

/**
 * AES加密
 */
export const encryptWithAes = (
  message: string,
  key: CryptoJS.lib.WordArray
): string => {
  return CryptoJS.AES.encrypt(message, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString()
}

/**
 * AES解密
 */
export const decryptWithAes = (
  message: string,
  key: CryptoJS.lib.WordArray
): string => {
  return CryptoJS.AES.decrypt(message, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8)
}

/**
 * MD5哈希
 */
export const computeMd5Hash = (data: string): string => {
  return CryptoJS.MD5(data).toString(CryptoJS.enc.Hex)
}

/**
 * SHA256哈希
 */
export const computeSha256Hash = (data: string): string => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex)
}
```

### 安全规范清单

1. **敏感数据加密**: 密码、Token等敏感数据必须加密存储
2. **HTTPS通信**: 所有API请求必须使用HTTPS
3. **参数校验**: 前端必须对用户输入进行校验
4. **XSS防护**: 避免直接渲染用户输入的HTML内容
5. **Token安全**: Token必须设置过期时间，定期刷新

---

## 日志与调试规范

### 日志输出规范

```typescript
// utils/logger.ts

const isDev = import.meta.env.DEV

/**
 * 日志工具
 */
export const logger = {
  /**
   * 调试日志（仅开发环境）
   */
  debug(...args: any[]) {
    if (isDev) {
      console.log('[DEBUG]', ...args)
    }
  },

  /**
   * 信息日志
   */
  info(...args: any[]) {
    console.log('[INFO]', ...args)
  },

  /**
   * 警告日志
   */
  warn(...args: any[]) {
    console.warn('[WARN]', ...args)
  },

  /**
   * 错误日志
   */
  error(...args: any[]) {
    console.error('[ERROR]', ...args)

    // 生产环境上报错误
    if (!isDev) {
      // 上报到错误监控平台
      reportError(args)
    }
  }
}

/**
 * 错误上报
 */
const reportError = (error: any[]) => {
  // 实现错误上报逻辑
}
```

---

## 图片资源规范

### 命名规范

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| 图标 | `icon_{name}` | `icon_home.png` |
| 背景图 | `bg_{name}` | `bg_login.png` |
| 占位图 | `placeholder_{name}` | `placeholder_avatar.png` |
| 按钮图 | `btn_{name}_{state}` | `btn_submit_normal.png` |

### 图片优化

```vue
<template>
  <!-- 使用wd-img组件，支持懒加载和错误处理 -->
  <wd-img
    :src="imageSrc"
    width="200rpx"
    height="200rpx"
    mode="aspectFill"
    lazy-load
    :placeholder="'/static/images/placeholder.png'"
    :error="'/static/images/error.png'"
    @load="handleLoad"
    @error="handleError"
  />
</template>

<script setup lang="ts">
const handleLoad = () => {
  console.log('图片加载成功')
}

const handleError = () => {
  console.log('图片加载失败')
}
</script>
```

---

## 性能优化规范

### 列表优化

```vue
<template>
  <!-- 使用虚拟列表 -->
  <wd-virtual-list
    :data="longList"
    :item-height="100"
    :height="600"
    :buffer="5"
  >
    <template #default="{ item, index }">
      <view class="list-item" :key="item.id">
        {{ item.name }}
      </view>
    </template>
  </wd-virtual-list>
</template>
```

### 防抖节流

```typescript
// utils/common.ts

/**
 * 防抖函数
 */
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

/**
 * 节流函数
 */
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

---

## 注释规范

### 函数注释

```typescript
/**
 * 获取用户信息
 * @description 根据用户ID获取完整的用户信息
 * @param userId - 用户ID
 * @param options - 可选配置
 * @param options.includeRoles - 是否包含角色信息
 * @returns 用户信息对象
 * @throws {ApiError} 当用户不存在时抛出错误
 * @example
 * ```typescript
 * const user = await getUserInfo(123, { includeRoles: true })
 * console.log(user.name)
 * ```
 */
export async function getUserInfo(
  userId: number,
  options?: { includeRoles?: boolean }
): Promise<UserInfo> {
  // 实现逻辑
}
```

### 组件注释

```vue
<template>
  <!-- 用户卡片组件 - 展示用户基本信息 -->
  <view class="user-card">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <wd-img :src="user.avatar" class="avatar" />
    </view>

    <!-- 信息区域 -->
    <view class="info-section">
      <text class="name">{{ user.name }}</text>
      <text class="desc">{{ user.description }}</text>
    </view>

    <!-- 操作区域 -->
    <view class="action-section">
      <slot name="actions" />
    </view>
  </view>
</template>
```

---

## 最佳实践

### 开发原则

1. **代码复用**: 优先使用组合式函数实现逻辑复用
2. **类型安全**: 充分利用TypeScript类型检查
3. **性能优化**: 合理使用缓存、懒加载和虚拟滚动
4. **用户体验**: 提供及时的加载反馈和错误提示
5. **安全性**: 敏感数据加密，输入校验
6. **可维护性**: 遵循命名规范，编写清晰注释

### 常见问题避免

```typescript
// ❌ 避免：直接修改props
props.value = newValue

// ✅ 推荐：通过emit通知父组件
emit('update:value', newValue)

// ❌ 避免：在模板中使用复杂表达式
{{ list.filter(item => item.active).map(item => item.name).join(',') }}

// ✅ 推荐：使用计算属性
const activeNames = computed(() =>
  list.value.filter(item => item.active).map(item => item.name).join(',')
)

// ❌ 避免：频繁的DOM操作
for (let i = 0; i < 100; i++) {
  document.getElementById('list').innerHTML += `<li>${i}</li>`
}

// ✅ 推荐：批量更新
const items = Array.from({ length: 100 }, (_, i) => `<li>${i}</li>`).join('')
document.getElementById('list').innerHTML = items
```

遵循以上开发规范，可以确保代码质量、提升开发效率和维护性。
