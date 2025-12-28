# 移动端开发规范

## 介绍

本文档规定了移动端 UniApp 项目的开发规范，包括命名规范、代码风格、组件开发、API设计等方面的标准。这些规范基于 RuoYi-Plus-UniApp 项目的实际实践总结，旨在帮助开发者编写一致、可维护、高质量的代码。

**核心原则:**

- **类型安全** - 充分利用 TypeScript 类型检查，所有接口、函数参数和返回值都应有明确的类型定义
- **代码复用** - 使用组合式函数（Composables）实现逻辑复用，避免重复代码
- **性能优化** - 合理使用缓存、懒加载、防抖节流等优化技术
- **可维护性** - 统一命名规范，编写清晰注释，保持代码结构一致
- **安全性** - 实现数据加密、权限控制、防重复提交等安全机制

## 基础规范

### 文件命名

| 类型 | 命名规范 | 示例 | 说明 |
|------|---------|------|------|
| 页面文件 | camelCase | `userProfile.vue` | 页面使用小驼峰命名 |
| 组件文件 | PascalCase | `UserCard.vue` | 组件使用大驼峰命名 |
| 工具文件 | camelCase | `httpUtils.ts` | 工具函数使用小驼峰 |
| 类型定义 | camelCase | `userTypes.ts` | 类型文件使用小驼峰 |
| Composable | use前缀 | `useAuth.ts` | 组合式函数必须以use开头 |
| Store | camelCase | `user.ts` | 状态管理文件使用小驼峰 |
| API文件 | camelCase + Api后缀 | `userApi.ts` | API文件使用Api后缀 |
| 常量文件 | camelCase | `constants.ts` | 常量定义文件 |

### 目录结构

```
src/
├── api/                    # API接口定义
│   ├── system/            # 系统模块API
│   │   ├── auth/          # 认证相关
│   │   │   ├── authApi.ts
│   │   │   └── authTypes.ts
│   │   └── user/          # 用户相关
│   │       ├── userApi.ts
│   │       └── userTypes.ts
│   └── business/          # 业务模块API
├── components/            # 自定义组件
│   ├── auth/             # 认证组件
│   ├── common/           # 通用组件
│   └── business/         # 业务组件
├── composables/           # 组合式函数
│   ├── useAuth.ts        # 认证授权
│   ├── useHttp.ts        # HTTP请求
│   ├── useDict.ts        # 字典数据
│   └── useTheme.ts       # 主题切换
├── layouts/               # 布局组件
│   ├── default.vue       # 默认布局
│   └── capsule.vue       # 胶囊布局
├── locales/               # 国际化资源
│   ├── i18n.ts           # i18n配置
│   ├── zh-CN.ts          # 中文
│   └── en-US.ts          # 英文
├── pages/                 # 页面文件
│   ├── index/            # 首页
│   ├── auth/             # 认证页面
│   └── my/               # 我的页面
├── static/                # 静态资源
│   ├── images/           # 图片资源
│   └── fonts/            # 字体文件
├── stores/                # 状态管理
│   ├── modules/          # 状态模块
│   │   ├── user.ts       # 用户状态
│   │   ├── app.ts        # 应用状态
│   │   └── dict.ts       # 字典状态
│   └── index.ts          # Store入口
├── types/                 # 全局类型定义
│   ├── http.d.ts         # HTTP类型
│   ├── global.d.ts       # 全局类型
│   └── components.d.ts   # 组件类型
├── utils/                 # 工具函数
│   ├── cache.ts          # 缓存工具
│   ├── crypto.ts         # 加密工具
│   ├── date.ts           # 日期工具
│   ├── string.ts         # 字符串工具
│   └── validators.ts     # 验证工具
├── wd/                    # WD UI组件库
│   ├── components/       # 组件实现
│   └── index.ts          # 组件导出
├── main.ts                # 应用入口
├── systemConfig.ts        # 系统配置
├── App.vue                # 根组件
├── manifest.json          # 应用配置
├── pages.json             # 页面路由
└── uni.scss               # 全局样式变量
```

### 技术栈版本

| 技术 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0-4060620250520001 | 跨平台开发框架 |
| Vue | 3.4.21 | 前端框架 |
| TypeScript | 5.7.2 | 类型安全语言 |
| Pinia | 2.0.36 | 状态管理 |
| Vite | 6.3.5 | 构建工具 |
| UnoCSS | 65.4.2 | 原子化CSS |
| WD UI | 自维护版本 | UI组件库 |

## ESLint 配置规范

项目使用 `@uni-helper/eslint-config` 作为基础配置，专门为 UniApp 项目优化。

### 核心配置

```javascript
// eslint.config.mjs
import uniHelper from '@uni-helper/eslint-config'

export default uniHelper({
  // 功能开关
  unocss: true,      // 启用 UnoCSS 规则
  vue: true,         // 启用 Vue 3 规则
  markdown: false,   // 禁用 Markdown 检查

  // 忽略文件
  ignores: [
    'src/uni_modules/',     // 第三方插件
    'dist',                 // 构建输出
    'auto-imports.d.ts',    // 自动生成的类型
    'uni-pages.d.ts',       // 页面类型
    'src/pages.json',       // 页面配置
    'src/manifest.json',    // 应用配置
  ],

  // 自定义规则
  rules: {
    'no-console': 'off',                    // 允许 console
    'no-unused-vars': 'off',                // 允许未使用变量
    'vue/no-unused-refs': 'off',            // 允许未使用 ref
    'unused-imports/no-unused-vars': 'off', // 关闭导入检查
  },

  // 格式化配置
  formatters: {
    css: true,   // CSS 格式化
    html: true,  // HTML 格式化
  },
})
```

### ESLint 规则说明

| 规则 | 设置 | 说明 |
|------|------|------|
| `no-console` | off | 开发环境需要调试输出 |
| `vue/block-order` | off | 允许不同的代码块顺序 |
| `func-style` | off | 允许函数声明和表达式混用 |
| `style/brace-style` | off | 允许不同的大括号风格 |
| `style/quote-props` | off | 允许属性引号混用 |
| `perfectionist/sort-imports` | off | 不强制导入排序 |

## Prettier 配置规范

### 核心配置

```javascript
// .prettierrc.cjs
module.exports = {
  // 引号配置
  singleQuote: true,           // 使用单引号

  // 行宽配置
  printWidth: 100,             // 单行最大100字符
  semi: false,                 // 不使用分号
  endOfLine: 'auto',           // 自动检测换行符

  // 缩进配置
  tabWidth: 2,                 // 2个空格缩进
  useTabs: false,              // 使用空格缩进

  // 尾随逗号
  trailingComma: 'all',        // 所有地方添加尾随逗号

  // HTML配置
  htmlWhitespaceSensitivity: 'ignore', // 忽略HTML空白

  // 特定文件覆盖
  overrides: [
    {
      files: '*.json',
      options: {
        trailingComma: 'none', // JSON不使用尾随逗号
      },
    },
  ],
}
```

### 代码风格对比

```typescript
// ✅ 正确：符合Prettier规范
const getUserInfo = async (userId: string): Promise<UserInfo> => {
  const [err, data] = await http.get<UserInfo>(`/api/users/${userId}`)
  if (!err) {
    return data
  }
  throw new Error('获取用户信息失败')
}

// ❌ 错误：不符合规范
const getUserInfo = async (userId: string): Promise<UserInfo> => {
  const [err, data] = await http.get<UserInfo>("/api/users/" + userId);  // 双引号，分号
  if (!err) { return data; }  // 单行if
  throw new Error("获取用户信息失败");  // 双引号，分号
};
```

## TypeScript 配置规范

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "moduleResolution": "Node",
    "lib": ["esnext", "dom"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@img/*": ["./src/static/*"]
    },
    "types": [
      "@dcloudio/types",
      "@uni-helper/uni-types",
      "@types/wechat-miniprogram",
      "wot-design-uni/global.d.ts"
    ],
    "allowJs": true,
    "noImplicitThis": true,
    "sourceMap": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  },
  "vueCompilerOptions": {
    "plugins": ["@uni-helper/uni-types/volar-plugin"]
  }
}
```

### 类型定义规范

```typescript
// types/http.d.ts

/**
 * 自定义请求头接口
 */
export interface CustomHeaders {
  /** 是否需要认证，默认 true */
  auth?: boolean
  /** 是否需要租户ID，默认 true */
  tenant?: boolean
  /** 是否防止重复提交，默认 true */
  repeatSubmit?: boolean
  /** 是否加密请求数据 */
  isEncrypt?: boolean
  /** 其他自定义头部 */
  [key: string]: any
}

/**
 * 自定义请求选项
 */
export interface CustomRequestOptions extends Partial<UniApp.RequestOptions> {
  /** 查询参数 */
  query?: Record<string, any>
  /** 查询参数（别名） */
  params?: Record<string, any>
  /** 自定义头部 */
  header?: CustomHeaders
  /** 是否跳过等待应用初始化 */
  skipWait?: boolean
  /** 初始化超时时间（毫秒） */
  initTimeout?: number
}
```

### 类型命名规范

| 类型 | 命名规范 | 示例 |
|------|---------|------|
| 接口 | I前缀或直接名称 | `UserInfo`, `IUserService` |
| 类型别名 | 直接名称 | `UserStatus`, `ButtonType` |
| 枚举 | 大驼峰 | `UserRole`, `OrderStatus` |
| 泛型参数 | 单字母大写 | `T`, `K`, `V` |
| Props接口 | 组件名+Props | `UserCardProps` |
| Emits接口 | 组件名+Emits | `UserCardEmits` |

## 样式规范

### 单位使用

移动端统一使用 `rpx` 单位，1rpx = 0.5px（在750设计稿下）。

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

### UnoCSS 数值映射

| 数值类 | 对应rpx | 说明 |
|--------|---------|------|
| `p-1` | 8rpx | 内边距 |
| `p-2` | 16rpx | 内边距 |
| `p-4` | 32rpx | 内边距 |
| `p-8` | 64rpx | 内边距 |
| `text-xs` | 20rpx | 超小字体 |
| `text-sm` | 24rpx | 小号字体 |
| `text-base` | 28rpx | 基础字体 |
| `text-lg` | 32rpx | 大号字体 |
| `text-xl` | 36rpx | 超大字体 |

### 样式优先级

1. **WD UI组件** - 优先使用组件库提供的样式
2. **UnoCSS工具类** - 使用原子化CSS快速布局
3. **CSS变量** - 使用主题变量保持一致性
4. **自定义样式** - 最后考虑自定义样式

### 主题变量使用

```scss
// uni.scss - 全局样式变量
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #ff4d4f;
$text-color: #333333;
$text-secondary: #666666;
$border-color: #e8e8e8;
$bg-color: #f5f5f5;

// 使用示例
.custom-button {
  background-color: $primary-color;
  color: #ffffff;
  border: 1rpx solid $border-color;
}
```

## 代码规范

### Vue组件结构

```vue
<template>
  <view class="user-page">
    <!-- 导航栏 -->
    <wd-navbar title="用户资料" />

    <!-- 表单区域 -->
    <wd-cell-group title="基本信息">
      <wd-input v-model="form.name" label="姓名" required />
      <wd-input v-model="form.phone" label="手机号" type="tel" />
    </wd-cell-group>

    <!-- 操作按钮 -->
    <view class="actions">
      <wd-button type="primary" block :loading="submitting" @click="handleSubmit">
        保存
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
// ================================
// 1. 导入声明（按类型分组）
// ================================
// Vue核心
import { ref, reactive, computed, onMounted } from 'vue'
// API接口
import { updateUserProfile } from '@/api/system/user/userApi'
// 类型定义
import type { UserProfileForm } from '@/api/system/user/userTypes'
// Composables
import { useToast } from '@/wd'

// ================================
// 2. 组件配置
// ================================
defineOptions({
  name: 'UserProfile',
})

// ================================
// 3. Props/Emits 定义
// ================================
interface Props {
  userId?: string
}

const props = withDefaults(defineProps<Props>(), {
  userId: '',
})

const emit = defineEmits<{
  (e: 'save-success', userId: string): void
  (e: 'cancel'): void
}>()

// ================================
// 4. 组合式函数
// ================================
const toast = useToast()

// ================================
// 5. 响应式数据
// ================================
const submitting = ref(false)
const form = reactive<UserProfileForm>({
  name: '',
  phone: '',
})

// ================================
// 6. 计算属性
// ================================
const isFormValid = computed(() => {
  return form.name.trim() !== '' && form.phone.length === 11
})

// ================================
// 7. 方法定义
// ================================
const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.warning('请填写完整信息')
    return
  }

  submitting.value = true
  try {
    const [err] = await updateUserProfile(form)
    if (!err) {
      toast.success('保存成功')
      emit('save-success', props.userId)
    }
  } finally {
    submitting.value = false
  }
}

// ================================
// 8. 生命周期
// ================================
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.user-page {
  padding: 32rpx;

  .actions {
    margin-top: 48rpx;
    padding: 0 32rpx;
  }
}
</style>
```

### TypeScript 类型规范

```typescript
// ================================
// 接口定义
// ================================

/** 用户信息接口 */
interface UserInfo {
  id: number
  name: string
  avatar?: string
  phone: string
  email?: string
  status: UserStatus
  createTime: string
}

/** 用户状态类型 */
type UserStatus = 'active' | 'inactive' | 'pending' | 'banned'

/** 用户角色枚举 */
enum UserRole {
  SUPER_ADMIN = 'superadmin',
  TENANT_ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

/** 通用API响应 */
interface R<T> {
  code: number
  data: T
  msg: string
}

/** 分页响应 */
interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/** 分页查询参数 */
interface PageQuery {
  pageNum: number
  pageSize: number
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}
```

## 组件开发规范

### 组件命名

```typescript
// ✅ 正确：PascalCase + 语义化名称
defineOptions({
  name: 'UserCard',
})

// ✅ WD UI组件使用Wd前缀
defineOptions({
  name: 'WdButton',
  options: {
    addGlobalClass: true,      // 允许外部类覆盖
    virtualHost: true,         // 虚拟节点
    styleIsolation: 'shared',  // 样式共享
  },
})

// ❌ 错误：使用kebab-case
defineOptions({ name: 'user-card' })

// ❌ 错误：使用无意义名称
defineOptions({ name: 'Component1' })
```

### Props 规范

```vue
<script setup lang="ts">
// ================================
// Props 接口定义
// ================================
interface UserCardProps {
  /** 用户信息 */
  user: UserInfo
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 头像尺寸 */
  avatarSize?: 'small' | 'medium' | 'large'
  /** 是否可点击 */
  clickable?: boolean
  /** 自定义类名 */
  customClass?: string
}

// ================================
// Props 默认值
// ================================
const props = withDefaults(defineProps<UserCardProps>(), {
  showAvatar: true,
  avatarSize: 'medium',
  clickable: false,
  customClass: '',
})

// ================================
// 计算属性（基于Props）
// ================================
const avatarSizeMap = {
  small: '64rpx',
  medium: '96rpx',
  large: '128rpx',
}

const avatarStyle = computed(() => ({
  width: avatarSizeMap[props.avatarSize],
  height: avatarSizeMap[props.avatarSize],
}))
</script>
```

### Events 规范

```vue
<script setup lang="ts">
// ================================
// Emits 接口定义
// ================================
interface UserCardEmits {
  /** 点击事件 */
  (e: 'click', user: UserInfo): void
  /** 删除事件 */
  (e: 'delete', userId: number): void
  /** 编辑事件 */
  (e: 'edit', user: UserInfo): void
}

const emit = defineEmits<UserCardEmits>()

// ================================
// 事件处理方法
// ================================
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.user)
  }
}

const handleDelete = () => {
  emit('delete', props.user.id)
}

const handleEdit = () => {
  emit('edit', props.user)
}
</script>
```

### 暴露方法 (defineExpose)

```vue
<script setup lang="ts">
// ================================
// 内部状态
// ================================
const isExpanded = ref(false)
const isLoading = ref(false)

// ================================
// 暴露的方法
// ================================
const expand = () => {
  isExpanded.value = true
}

const collapse = () => {
  isExpanded.value = false
}

const toggle = () => {
  isExpanded.value = !isExpanded.value
}

const refresh = async () => {
  isLoading.value = true
  try {
    await fetchData()
  } finally {
    isLoading.value = false
  }
}

// ================================
// 暴露接口
// ================================
defineExpose({
  // 状态（只读）
  isExpanded: readonly(isExpanded),
  isLoading: readonly(isLoading),
  // 方法
  expand,
  collapse,
  toggle,
  refresh,
})
</script>
```

## HTTP 请求规范

### useHttp 组合式函数

```typescript
// composables/useHttp.ts
import { useHttp } from '@/composables/useHttp'

// 创建默认实例
export const http = useHttp()

// ================================
// 基本使用
// ================================

// GET 请求
const [err, users] = await http.get<User[]>('/api/users')
if (!err) {
  console.log(users)
}

// POST 请求
const [err, user] = await http.post<User>('/api/users', userData)

// PUT 请求
const [err, user] = await http.put<User>('/api/users/123', updatedData)

// DELETE 请求
const [err] = await http.del<void>('/api/users/123')
```

### 链式调用

```typescript
// ================================
// 链式调用示例
// ================================

// 禁用认证
const [err, data] = await http.noAuth().get('/api/public/info')

// 启用加密
const [err, token] = await http.encrypt().post('/api/login', credentials)

// 组合多个配置
const [err, result] = await http
  .noAuth()
  .encrypt()
  .skipWait()
  .timeout(30000)
  .post('/api/register', registerData)

// 禁用错误提示（自定义错误处理）
const [err, data] = await http.noMsgError().get('/api/data')
if (err) {
  // 自定义错误处理
  customErrorHandler(err)
}

// 禁用防重复提交
const [err, data] = await http.noRepeatSubmit().post('/api/batch', batchData)
```

### 文件上传下载

```typescript
// ================================
// 文件上传
// ================================
const [err, result] = await http.upload<UploadResult>({
  url: '/api/upload',
  filePath: tempFilePath,
  name: 'file',
  formData: {
    type: 'avatar',
    userId: '123',
  },
})

// ================================
// 文件下载
// ================================
const [err, result] = await http.download({
  url: '/api/download/file.pdf',
  filePath: `${uni.env.USER_DATA_PATH}/file.pdf`,
})
```

### API 接口定义规范

```typescript
// api/system/user/userApi.ts
import { http } from '@/composables/useHttp'
import type { UserInfo, UserQueryParams, UserProfileForm } from './userTypes'
import type { PageResult } from '@/types/http'

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return http.get<UserInfo>('/system/user/getInfo')
}

/**
 * 获取用户列表（分页）
 */
export const getUserList = (params: UserQueryParams) => {
  return http.get<PageResult<UserInfo>>('/system/user/list', params)
}

/**
 * 更新用户资料
 */
export const updateUserProfile = (data: UserProfileForm) => {
  return http.put<void>('/system/user/profile', data)
}

/**
 * 删除用户
 */
export const deleteUser = (userId: number) => {
  return http.del<void>(`/system/user/${userId}`)
}

/**
 * 用户登录（加密传输）
 */
export const login = (data: LoginForm) => {
  return http.noAuth().encrypt().post<LoginResult>('/auth/login', data)
}
```

### 类型定义规范

```typescript
// api/system/user/userTypes.ts

/**
 * 用户信息
 */
export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  email?: string
  phonenumber?: string
  avatar?: string
  status: string
  deptId?: number
  deptName?: string
  roles: string[]
  permissions: string[]
  createTime: string
}

/**
 * 用户查询参数
 */
export interface UserQueryParams {
  pageNum: number
  pageSize: number
  userName?: string
  phonenumber?: string
  status?: string
  deptId?: number
  beginTime?: string
  endTime?: string
}

/**
 * 用户资料表单
 */
export interface UserProfileForm {
  nickName: string
  email?: string
  phonenumber?: string
  sex?: string
}

/**
 * 登录表单
 */
export interface LoginForm {
  username: string
  password: string
  code?: string
  uuid?: string
}

/**
 * 登录结果
 */
export interface LoginResult {
  access_token: string
  expires_in: number
}
```

## 权限控制规范

### useAuth 组合式函数

```typescript
// composables/useAuth.ts
import { useAuth } from '@/composables/useAuth'

const {
  // 状态
  isLoggedIn,
  isSuperAdmin,
  isTenantAdmin,
  isAnyAdmin,
  // 权限检查
  hasPermission,
  hasTenantPermission,
  hasRole,
  hasAllPermissions,
  hasAllRoles,
  // 路由控制
  canAccessRoute,
  filterAuthorizedRoutes,
} = useAuth()
```

### 权限检查示例

```typescript
// ================================
// 单个权限检查
// ================================
const canAddUser = hasPermission('system:user:add')
const canEditUser = hasPermission('system:user:edit')
const canDeleteUser = hasPermission('system:user:remove')

// ================================
// 多个权限检查（OR逻辑）
// ================================
const canManageUsers = hasPermission([
  'system:user:add',
  'system:user:edit',
  'system:user:remove',
])

// ================================
// 多个权限检查（AND逻辑）
// ================================
const hasFullAccess = hasAllPermissions([
  'system:user:add',
  'system:user:edit',
  'system:user:remove',
])

// ================================
// 角色检查
// ================================
const isAdmin = hasRole('admin')
const isEditor = hasRole(['editor', 'author'])

// ================================
// 管理员判断
// ================================
if (isSuperAdmin()) {
  // 超级管理员逻辑
}

if (isTenantAdmin()) {
  // 租户管理员逻辑
}

if (isAnyAdmin()) {
  // 任意管理员逻辑
}
```

### 模板中使用权限

```vue
<template>
  <view class="user-management">
    <!-- 权限控制按钮显示 -->
    <wd-button v-if="canAddUser" type="primary" @click="handleAdd">
      新增用户
    </wd-button>

    <wd-button v-if="canEditUser" type="info" @click="handleEdit">
      编辑用户
    </wd-button>

    <wd-button v-if="canDeleteUser" type="error" @click="handleDelete">
      删除用户
    </wd-button>

    <!-- 管理员专属内容 -->
    <view v-if="isAnyAdmin()" class="admin-panel">
      <text>管理员面板</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { hasPermission, isAnyAdmin } = useAuth()

const canAddUser = hasPermission('system:user:add')
const canEditUser = hasPermission('system:user:edit')
const canDeleteUser = hasPermission('system:user:remove')
</script>
```

## 组合式函数规范

### 基本结构

```typescript
// composables/useUserManagement.ts
import { ref, computed, readonly } from 'vue'
import { getUserList, deleteUser } from '@/api/system/user/userApi'
import type { UserInfo, UserQueryParams } from '@/api/system/user/userTypes'
import { useToast } from '@/wd'

/**
 * 用户管理组合式函数
 */
export function useUserManagement() {
  // ================================
  // 依赖注入
  // ================================
  const toast = useToast()

  // ================================
  // 响应式状态
  // ================================
  const users = ref<UserInfo[]>([])
  const loading = ref(false)
  const total = ref(0)
  const queryParams = ref<UserQueryParams>({
    pageNum: 1,
    pageSize: 20,
  })

  // ================================
  // 计算属性
  // ================================
  const hasMore = computed(() => users.value.length < total.value)
  const isEmpty = computed(() => users.value.length === 0 && !loading.value)

  // ================================
  // 方法定义
  // ================================

  /**
   * 加载用户列表
   */
  const loadUsers = async (refresh = false) => {
    if (refresh) {
      queryParams.value.pageNum = 1
      users.value = []
    }

    loading.value = true
    try {
      const [err, response] = await getUserList(queryParams.value)
      if (!err && response) {
        users.value = refresh
          ? response.records
          : [...users.value, ...response.records]
        total.value = response.total
        queryParams.value.pageNum++
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除用户
   */
  const removeUser = async (userId: number) => {
    const [err] = await deleteUser(userId)
    if (!err) {
      toast.success('删除成功')
      // 从列表中移除
      users.value = users.value.filter(u => u.userId !== userId)
      total.value--
    }
  }

  /**
   * 刷新列表
   */
  const refresh = () => loadUsers(true)

  /**
   * 加载更多
   */
  const loadMore = () => {
    if (hasMore.value && !loading.value) {
      loadUsers(false)
    }
  }

  // ================================
  // 返回接口
  // ================================
  return {
    // 状态（只读）
    users: readonly(users),
    loading: readonly(loading),
    total: readonly(total),
    // 计算属性
    hasMore,
    isEmpty,
    // 方法
    loadUsers,
    removeUser,
    refresh,
    loadMore,
  }
}
```

### 使用规范

```vue
<script setup lang="ts">
import { useUserManagement } from '@/composables/useUserManagement'

// 解构获取状态和方法
const {
  users,
  loading,
  hasMore,
  isEmpty,
  loadUsers,
  removeUser,
  refresh,
  loadMore,
} = useUserManagement()

// 页面加载时获取数据
onMounted(() => {
  loadUsers(true)
})

// 下拉刷新
onPullDownRefresh(async () => {
  await refresh()
  uni.stopPullDownRefresh()
})

// 上拉加载
onReachBottom(() => {
  loadMore()
})
</script>
```

## 页面开发规范

### 页面路由配置

```typescript
// pages.config.ts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [
    {
      path: 'pages/index/index',
      style: {
        navigationBarTitleText: '首页',
        enablePullDownRefresh: true,
      },
    },
  ],
  subPackages: [
    {
      root: 'pages/order',
      pages: [
        {
          path: 'list',
          style: {
            navigationBarTitleText: '订单列表',
          },
        },
        {
          path: 'detail',
          style: {
            navigationBarTitleText: '订单详情',
          },
        },
      ],
    },
  ],
  globalStyle: {
    navigationBarTextStyle: 'black',
    navigationBarTitleText: 'RuoYi-Plus',
    navigationBarBackgroundColor: '#ffffff',
    backgroundColor: '#f8f8f8',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'static/tabbar/home.png',
        selectedIconPath: 'static/tabbar/home-active.png',
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'static/tabbar/my.png',
        selectedIconPath: 'static/tabbar/my-active.png',
      },
    ],
  },
})
```

### 页面生命周期

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import {
  onLoad,
  onShow,
  onHide,
  onUnload,
  onPullDownRefresh,
  onReachBottom,
  onShareAppMessage,
  onShareTimeline,
} from '@dcloudio/uni-app'

// ================================
// Vue 生命周期
// ================================
onMounted(() => {
  console.log('组件挂载')
  initPageData()
})

onUnmounted(() => {
  console.log('组件卸载')
  cleanupResources()
})

// ================================
// UniApp 页面生命周期
// ================================
onLoad((options) => {
  console.log('页面加载，参数:', options)
  // 处理页面参数
  if (options?.id) {
    loadDetail(options.id)
  }
})

onShow(() => {
  console.log('页面显示')
  refreshData()
})

onHide(() => {
  console.log('页面隐藏')
  pauseTimers()
})

onUnload(() => {
  console.log('页面卸载')
})

// ================================
// 下拉刷新
// ================================
onPullDownRefresh(async () => {
  console.log('下拉刷新')
  try {
    await refreshData()
  } finally {
    uni.stopPullDownRefresh()
  }
})

// ================================
// 上拉加载
// ================================
onReachBottom(() => {
  console.log('触底加载')
  loadMoreData()
})

// ================================
// 分享
// ================================
onShareAppMessage(() => ({
  title: '分享标题',
  path: '/pages/index/index',
  imageUrl: '/static/share.png',
}))

onShareTimeline(() => ({
  title: '朋友圈分享标题',
  query: 'id=123',
  imageUrl: '/static/share.png',
}))
</script>
```

## 状态管理规范

### Pinia Store 结构

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cache } from '@/utils/cache'
import { getCurrentUser, logout as logoutApi } from '@/api/system/auth/authApi'
import type { UserInfo } from '@/api/system/user/userTypes'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // ================================
  // 状态定义
  // ================================
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>(cache.get<string>('token') || '')
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // ================================
  // 计算属性
  // ================================
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickName || '')
  const avatar = computed(() => userInfo.value?.avatar || '/static/default-avatar.png')

  // ================================
  // 方法定义
  // ================================

  /**
   * 设置Token
   */
  const setToken = (newToken: string, expiresIn = 7 * 24 * 3600) => {
    token.value = newToken
    cache.set('token', newToken, expiresIn)
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async () => {
    const [err, data] = await getCurrentUser()
    if (!err && data) {
      userInfo.value = data
      roles.value = data.roles || []
      permissions.value = data.permissions || []
    }
    return data
  }

  /**
   * 登出
   */
  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      // 清理状态
      token.value = ''
      userInfo.value = null
      roles.value = []
      permissions.value = []
      cache.remove('token')
      // 跳转登录页
      uni.reLaunch({ url: '/pages/auth/login' })
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
  }

  // ================================
  // 返回接口
  // ================================
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
    // 方法
    setToken,
    fetchUserInfo,
    logout,
    reset,
  }
})
```

### Store 使用规范

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'

// ================================
// 获取Store实例
// ================================
const userStore = useUserStore()

// ================================
// 解构响应式状态（使用storeToRefs）
// ================================
const { userInfo, isLoggedIn, userName, avatar } = storeToRefs(userStore)

// ================================
// 解构方法（直接解构）
// ================================
const { fetchUserInfo, logout } = userStore

// ================================
// 使用
// ================================
const handleLogout = async () => {
  await logout()
}

// 监听状态变化
watch(isLoggedIn, (newValue) => {
  if (!newValue) {
    // 未登录时的处理
  }
})
</script>
```

## 条件编译规范

### 模板条件编译

```vue
<template>
  <view class="platform-demo">
    <!-- H5 专属 -->
    <!-- #ifdef H5 -->
    <view class="h5-only">
      <wd-button @click="copyToClipboard">复制链接</wd-button>
    </view>
    <!-- #endif -->

    <!-- 微信小程序专属 -->
    <!-- #ifdef MP-WEIXIN -->
    <wd-button open-type="contact">联系客服</wd-button>
    <wd-button open-type="share">分享给好友</wd-button>
    <!-- #endif -->

    <!-- App 专属 -->
    <!-- #ifdef APP-PLUS -->
    <wd-button @click="scanCode">扫一扫</wd-button>
    <wd-button @click="callPhone">拨打电话</wd-button>
    <!-- #endif -->

    <!-- 非 H5 平台 -->
    <!-- #ifndef H5 -->
    <view class="native-only">
      <text>原生平台专属内容</text>
    </view>
    <!-- #endif -->

    <!-- 多平台 -->
    <!-- #ifdef MP-WEIXIN || MP-ALIPAY -->
    <view class="mini-program">
      <text>小程序通用内容</text>
    </view>
    <!-- #endif -->
  </view>
</template>
```

### 脚本条件编译

```typescript
<script setup lang="ts">
// ================================
// 条件导入
// ================================

// #ifdef APP-PLUS
import { scanCode, callPhone } from '@/utils/native'
// #endif

// #ifdef H5
import { copyToClipboard } from '@/utils/clipboard'
// #endif

// ================================
// 条件方法
// ================================
const handleShare = () => {
  // #ifdef MP-WEIXIN
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  })
  // #endif

  // #ifdef H5
  if (navigator.share) {
    navigator.share({
      title: '分享标题',
      text: '分享描述',
      url: location.href,
    })
  }
  // #endif

  // #ifdef APP-PLUS
  plus.share.sendWithSystem({
    content: '分享内容',
    href: 'https://example.com',
  })
  // #endif
}

// ================================
// 平台检测
// ================================
const platform = __UNI_PLATFORM__
const isApp = __UNI_PLATFORM__ === 'app'
const isMp = __UNI_PLATFORM__.startsWith('mp-')
const isMpWeixin = __UNI_PLATFORM__ === 'mp-weixin'
const isH5 = __UNI_PLATFORM__ === 'h5'
</script>
```

## 缓存策略规范

### 缓存工具

```typescript
// utils/cache.ts
const KEY_PREFIX = 'ruoyi_app:'

export const cache = {
  /**
   * 设置缓存
   */
  set<T>(key: string, value: T, expireSeconds?: number): boolean {
    try {
      const data = {
        value,
        expire: expireSeconds ? Date.now() + expireSeconds * 1000 : undefined,
      }
      uni.setStorageSync(`${KEY_PREFIX}${key}`, data)
      return true
    } catch (error) {
      console.error('缓存设置失败:', error)
      return false
    }
  },

  /**
   * 获取缓存
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
    } catch (error) {
      console.error('缓存获取失败:', error)
      return null
    }
  },

  /**
   * 删除缓存
   */
  remove(key: string): void {
    try {
      uni.removeStorageSync(`${KEY_PREFIX}${key}`)
    } catch (error) {
      console.error('缓存删除失败:', error)
    }
  },

  /**
   * 清空所有缓存
   */
  clear(): void {
    try {
      uni.clearStorageSync()
    } catch (error) {
      console.error('缓存清空失败:', error)
    }
  },
}
```

### 缓存使用规范

| 数据类型 | 缓存键 | 过期时间 | 说明 |
|---------|--------|---------|------|
| Token | `token` | 7天 | 登录凭证 |
| 用户信息 | `userInfo` | 1天 | 基本用户信息 |
| 字典数据 | `dict:{type}` | 1小时 | 系统字典 |
| 租户ID | `tenantId` | 永久 | 多租户标识 |
| 语言设置 | `language` | 永久 | 国际化语言 |
| 主题设置 | `theme` | 永久 | 主题配置 |

## 表单校验规范

### 验证函数

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
 * 验证密码强度
 */
export const isPassword = (password: string, minLength = 8): boolean => {
  if (password.length < minLength) return false
  if (!/[a-z]/.test(password)) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/\d/.test(password)) return false
  return true
}

/**
 * 验证身份证号
 */
export const isIdCard = (idCard: string): boolean => {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard)
}

/**
 * 验证URL
 */
export const isUrl = (url: string): boolean => {
  return /^https?:\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(url)
}
```

### 表单校验示例

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <wd-input
      v-model="formData.phone"
      label="手机号"
      prop="phone"
      placeholder="请输入手机号"
    />
    <wd-input
      v-model="formData.password"
      label="密码"
      prop="password"
      type="password"
      placeholder="请输入密码"
    />
    <wd-input
      v-model="formData.confirmPassword"
      label="确认密码"
      prop="confirmPassword"
      type="password"
      placeholder="请再次输入密码"
    />
    <wd-button type="primary" block @click="handleSubmit">
      提交
    </wd-button>
  </wd-form>
</template>

<script setup lang="ts">
import { isChinesePhoneNumber, isPassword } from '@/utils/validators'
import type { FormRules } from '@/wd'

const formRef = ref()
const formData = reactive({
  phone: '',
  password: '',
  confirmPassword: '',
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: (value) => isChinesePhoneNumber(value),
      message: '请输入有效的手机号'
    },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 8, message: '密码至少8位' },
    {
      validator: (value) => isPassword(value),
      message: '密码需包含大小写字母和数字'
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (value) => value === formData.password,
      message: '两次输入的密码不一致',
    },
  ],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    // 提交表单
  }
}
</script>
```

## 性能优化规范

### 防抖节流

```typescript
// utils/function.ts

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
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
  delay: number,
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

// 使用示例
const handleSearch = debounce((keyword: string) => {
  searchUsers(keyword)
}, 300)

const handleScroll = throttle(() => {
  checkScrollPosition()
}, 100)
```

### 图片优化

```vue
<template>
  <!-- 使用 wd-img 组件 -->
  <wd-img
    :src="imageSrc"
    width="200rpx"
    height="200rpx"
    mode="aspectFill"
    lazy-load
    :placeholder="'/static/images/placeholder.png'"
    :error-src="'/static/images/error.png'"
    @error="handleImageError"
    @load="handleImageLoad"
  />

  <!-- 使用原生 image -->
  <image
    :src="imageSrc"
    mode="aspectFill"
    lazy-load
    @error="handleImageError"
  />
</template>

<script setup lang="ts">
const handleImageError = (e: Event) => {
  console.error('图片加载失败:', e)
}

const handleImageLoad = () => {
  console.log('图片加载成功')
}
</script>
```

### 列表优化

```vue
<template>
  <!-- 使用虚拟列表 -->
  <z-paging
    ref="paging"
    v-model="dataList"
    @query="queryList"
  >
    <template #default="{ item }">
      <UserCard :user="item" />
    </template>
  </z-paging>
</template>

<script setup lang="ts">
const paging = ref()
const dataList = ref<UserInfo[]>([])

const queryList = async (pageNo: number, pageSize: number) => {
  const [err, data] = await getUserList({
    pageNum: pageNo,
    pageSize,
  })

  if (!err && data) {
    paging.value.complete(data.records)
  } else {
    paging.value.complete(false)
  }
}
</script>
```

## 安全规范

### 数据加密

```typescript
// 使用加密请求
const [err, token] = await http.encrypt().post('/api/login', {
  username: 'admin',
  password: 'password123',
})

// 敏感数据传输
const [err, data] = await http
  .encrypt()
  .post('/api/sensitive/data', sensitivePayload)
```

### 权限控制

```typescript
// 检查权限后执行操作
const handleDelete = async (userId: number) => {
  if (!hasPermission('system:user:remove')) {
    toast.warning('没有删除权限')
    return
  }

  // 执行删除
  await deleteUser(userId)
}
```

### 防重复提交

```typescript
// 默认开启防重复提交
const [err] = await http.post('/api/order', orderData)

// 需要禁用时显式关闭
const [err] = await http.noRepeatSubmit().post('/api/batch', batchData)
```

## 最佳实践

### 推荐做法

```typescript
// ✅ 使用 Result 类型处理错误
const [err, data] = await http.get<User>('/api/user')
if (!err) {
  console.log(data)
}

// ✅ 使用计算属性
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ✅ 使用 emit 通知父组件
emit('update:value', newValue)

// ✅ 使用组合式函数复用逻辑
const { users, loading, loadUsers } = useUserManagement()

// ✅ 使用 TypeScript 类型
const user: UserInfo = await fetchUser()
```

### 避免做法

```typescript
// ❌ 直接修改 props
props.value = newValue

// ❌ 模板中使用复杂表达式
{{ list.filter(item => item.active).map(item => item.name).join(',') }}

// ❌ 忽略错误处理
const data = await http.get('/api/user') // 没有处理错误

// ❌ 使用 any 类型
const user: any = await fetchUser()

// ❌ 在 setup 外使用组合式函数
const http = useHttp() // 应在 setup 内调用
```

## 总结

移动端开发规范核心要点:

1. **命名规范** - 页面camelCase，组件PascalCase，Composable use前缀
2. **代码风格** - 遵循ESLint和Prettier配置，单引号、无分号、2空格缩进
3. **样式单位** - 统一使用rpx，优先使用UnoCSS原子化类
4. **组件开发** - TypeScript类型定义，Props/Emits规范，defineExpose暴露方法
5. **API设计** - useHttp链式调用，Result类型错误处理
6. **权限控制** - useAuth组合式函数，hasPermission/hasRole检查
7. **状态管理** - Pinia Setup Store风格，storeToRefs解构
8. **条件编译** - 合理使用 `#ifdef` 处理平台差异
9. **性能优化** - 防抖节流、懒加载、缓存策略、虚拟列表
10. **安全规范** - 数据加密、权限控制、防重复提交
