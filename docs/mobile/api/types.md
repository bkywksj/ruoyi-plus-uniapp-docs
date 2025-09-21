# API 类型定义

移动端应用中的所有API相关的TypeScript类型定义，包括请求参数、响应数据、业务对象等。

## 📋 类型体系概览

### 基础类型结构

```typescript
// 通用响应类型
interface ApiResponse<T = any> {
  code: number
  msg: string
  data?: T
}

// 分页响应类型
interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 分页查询参数
interface PageQuery {
  current?: number
  size?: number
  sort?: string
  order?: 'asc' | 'desc'
}
```

## 🔧 业务类型定义

### 用户相关类型

```typescript
// 用户信息
interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  sex: '0' | '1' | '2' // 0未知 1男 2女
  status: '0' | '1' // 0正常 1停用
  createTime: string
  roles?: Role[]
  permissions?: string[]
}

// 用户角色
interface Role {
  id: number
  roleName: string
  roleKey: string
  roleSort: number
  status: '0' | '1'
  remark?: string
}

// 登录请求
interface LoginRequest {
  username: string
  password: string
  code?: string
  uuid?: string
  rememberMe?: boolean
}

// 登录响应
interface LoginResponse {
  access_token: string
  expires_in: number
  user: UserInfo
}
```

### 系统相关类型

```typescript
// 字典数据
interface DictData {
  dictCode: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault: 'Y' | 'N'
  status: '0' | '1'
  remark?: string
}

// 字典类型
interface DictType {
  dictId: number
  dictName: string
  dictType: string
  status: '0' | '1'
  remark?: string
  createTime: string
}

// 参数配置
interface SysConfig {
  configId: number
  configName: string
  configKey: string
  configValue: string
  configType: 'Y' | 'N' // Y系统内置 N非系统内置
  remark?: string
}

// 通知公告
interface Notice {
  noticeId: number
  noticeTitle: string
  noticeType: '1' | '2' // 1通知 2公告
  noticeContent: string
  status: '0' | '1' // 0正常 1关闭
  createBy: string
  createTime: string
  updateBy?: string
  updateTime?: string
  remark?: string
}
```

### 业务对象类型

```typescript
// 基础业务对象
interface BaseBo {
  createTime?: string[]
  params?: Record<string, any>
}

// 广告配置
interface AdBo extends BaseBo {
  id?: number
  title: string
  content: string
  imgUrl?: string
  linkUrl?: string
  position: string
  sort: number
  status: '0' | '1'
  startTime?: string
  endTime?: string
}

interface AdVo {
  id: number
  title: string
  content: string
  imgUrl?: string
  linkUrl?: string
  position: string
  sort: number
  status: '0' | '1'
  startTime?: string
  endTime?: string
  createTime: string
  updateTime?: string
}

// 新闻资讯
interface NewsBo extends BaseBo {
  id?: number
  title: string
  content: string
  summary?: string
  coverImg?: string
  categoryId: number
  status: '0' | '1'
  sort: number
  isTop: 'Y' | 'N'
  isRecommend: 'Y' | 'N'
}

interface NewsVo {
  id: number
  title: string
  content: string
  summary?: string
  coverImg?: string
  categoryId: number
  categoryName?: string
  status: '0' | '1'
  sort: number
  isTop: 'Y' | 'N'
  isRecommend: 'Y' | 'N'
  viewCount: number
  createTime: string
  updateTime?: string
}
```

### 文件上传类型

```typescript
// 文件上传响应
interface UploadResponse {
  url: string
  fileName: string
  newFileName: string
  originalFilename: string
}

// 文件信息
interface FileInfo {
  name: string
  url: string
  size: number
  type: string
  createTime: string
}

// 上传配置
interface UploadConfig {
  url: string
  maxSize: number
  allowedTypes: string[]
  headers?: Record<string, string>
}
```

## 🎯 请求相关类型

### HTTP请求配置

```typescript
// 请求配置
interface RequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  method?: HttpMethod
  responseType?: 'json' | 'text' | 'arraybuffer'
}

// HTTP方法类型
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

// 请求拦截器配置
interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onRequestError?: (error: any) => any
}

// 响应拦截器配置
interface ResponseInterceptor {
  onResponse?: (response: any) => any
  onResponseError?: (error: any) => any
}
```

### 错误处理类型

```typescript
// API错误
interface ApiError {
  code: number
  message: string
  data?: any
  timestamp: string
  path: string
}

// 网络错误
interface NetworkError {
  type: 'timeout' | 'network' | 'abort' | 'unknown'
  message: string
  code?: number
}

// 业务错误
interface BusinessError {
  code: number
  message: string
  field?: string
  value?: any
}
```

## 🔐 权限相关类型

### 权限验证

```typescript
// 权限信息
interface Permission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId?: number
  path?: string
  component?: string
  icon?: string
  orderNum: number
  status: '0' | '1'
  children?: Permission[]
}

// 菜单权限
interface MenuPermission extends Permission {
  type: 'menu'
  path: string
  component: string
  redirect?: string
  meta?: {
    title: string
    icon?: string
    hidden?: boolean
    keepAlive?: boolean
  }
}

// 按钮权限
interface ButtonPermission extends Permission {
  type: 'button'
  action: string
}
```

## 📱 移动端特定类型

### 设备信息

```typescript
// 设备信息
interface DeviceInfo {
  platform: string
  system: string
  version: string
  model: string
  brand: string
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  windowWidth: number
  windowHeight: number
  safeArea: {
    left: number
    right: number
    top: number
    bottom: number
    width: number
    height: number
  }
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// 位置信息
interface LocationInfo {
  latitude: number
  longitude: number
  speed: number
  accuracy: number
  altitude: number
  verticalAccuracy: number
  horizontalAccuracy: number
  address?: {
    country?: string
    province?: string
    city?: string
    district?: string
    street?: string
    streetNum?: string
    poiName?: string
  }
}

// 网络状态
interface NetworkInfo {
  isConnected: boolean
  networkType: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'ethernet' | 'unknown' | 'none'
  signalStrength?: number
}
```

### 小程序相关类型

```typescript
// 小程序用户信息
interface MiniProgramUserInfo {
  avatarUrl: string
  city: string
  country: string
  gender: 0 | 1 | 2 // 0未知 1男性 2女性
  language: string
  nickName: string
  province: string
}

// 小程序登录
interface MiniProgramLogin {
  code: string
  encryptedData?: string
  iv?: string
  cloudID?: string
}

// 小程序支付
interface MiniProgramPayment {
  timeStamp: string
  nonceStr: string
  package: string
  signType: 'MD5' | 'HMAC-SHA256'
  paySign: string
}
```

## 🎨 UI组件类型

### 通用组件Props

```typescript
// 按钮Props
interface ButtonProps {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'medium' | 'small' | 'mini'
  plain?: boolean
  round?: boolean
  circle?: boolean
  loading?: boolean
  disabled?: boolean
  icon?: string
  autofocus?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  block?: boolean
  text?: boolean
  bg?: boolean
  color?: string
  dark?: boolean
}

// 输入框Props
interface InputProps {
  modelValue?: string | number
  type?: 'text' | 'number' | 'password' | 'tel' | 'email' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  showPassword?: boolean
  maxlength?: number
  minlength?: number
  showWordLimit?: boolean
  prefixIcon?: string
  suffixIcon?: string
  rows?: number
  autosize?: boolean | { minRows?: number; maxRows?: number }
  autocomplete?: string
  name?: string
  form?: string
  label?: string
  tabindex?: string | number
  validateEvent?: boolean
  inputStyle?: Record<string, string>
}
```

### 表单验证类型

```typescript
// 表单规则
interface FormRule {
  required?: boolean
  message?: string
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email'
  pattern?: RegExp
  min?: number
  max?: number
  len?: number
  enum?: any[]
  whitespace?: boolean
  trigger?: 'blur' | 'change' | 'submit'
  validator?: (rule: any, value: any, callback: any) => void
}

// 表单项配置
interface FormItem {
  prop: string
  label?: string
  labelWidth?: string | number
  required?: boolean
  rules?: FormRule | FormRule[]
  error?: string
  showMessage?: boolean
  inlineMessage?: boolean
  size?: 'large' | 'medium' | 'small' | 'mini'
}

// 表单配置
interface FormConfig {
  model: Record<string, any>
  rules?: Record<string, FormRule | FormRule[]>
  inline?: boolean
  labelPosition?: 'left' | 'right' | 'top'
  labelWidth?: string | number
  labelSuffix?: string
  hideRequiredAsterisk?: boolean
  showMessage?: boolean
  inlineMessage?: boolean
  statusIcon?: boolean
  validateOnRuleChange?: boolean
  size?: 'large' | 'medium' | 'small' | 'mini'
  disabled?: boolean
}
```

## 🔄 状态管理类型

### Store状态类型

```typescript
// 用户状态
interface UserState {
  userInfo: UserInfo | null
  token: string | null
  permissions: string[]
  roles: string[]
  isLogin: boolean
}

// 应用状态
interface AppState {
  language: string
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  layout: string
  sidebarCollapse: boolean
  showSettings: boolean
  showTagsView: boolean
  showLogo: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
}

// 系统状态
interface SystemState {
  dictData: Record<string, DictData[]>
  config: Record<string, string>
  loading: boolean
  networkStatus: NetworkInfo
  deviceInfo: DeviceInfo
}
```

## 🎯 使用示例

### 类型使用

```typescript
// API调用
import type { ApiResponse, PageResult, UserInfo } from '@/types/api'

const fetchUserList = async (): Promise<ApiResponse<PageResult<UserInfo>>> => {
  return await http.get<PageResult<UserInfo>>('/system/user/list')
}

// 组件Props
import type { ButtonProps } from '@/types/components'

const MyButton = defineComponent<ButtonProps>({
  props: {
    type: {
      type: String as PropType<ButtonProps['type']>,
      default: 'primary'
    },
    size: {
      type: String as PropType<ButtonProps['size']>,
      default: 'medium'
    }
  }
})

// 表单验证
import type { FormRule } from '@/types/form'

const rules: Record<string, FormRule[]> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}
```

### 类型断言和守卫

```typescript
// 类型守卫
function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return typeof obj === 'object' &&
         typeof obj.code === 'number' &&
         typeof obj.msg === 'string'
}

// 类型断言
const response = await api.getUser(id)
if (isApiResponse<UserInfo>(response)) {
  // TypeScript 知道 response 是 ApiResponse<UserInfo> 类型
  console.log(response.data?.username)
}

// 联合类型处理
function handleStatus(status: '0' | '1') {
  switch (status) {
    case '0':
      return '正常'
    case '1':
      return '停用'
    default:
      // TypeScript 知道这里是 never 类型
      const exhaustiveCheck: never = status
      return exhaustiveCheck
  }
}
```

## 📚 类型扩展

### 模块声明

```typescript
// 扩展 uni-app 类型
declare global {
  namespace UniApp {
    interface CustomTabBarItem {
      pagePath: string
      text: string
      iconPath?: string
      selectedIconPath?: string
      visible?: boolean
      badge?: string | number
      redDot?: boolean
    }
  }
}

// 扩展环境变量类型
declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'development' | 'production'
        VUE_APP_BASE_API: string
        VUE_APP_UPLOAD_URL: string
        VUE_APP_WEBSOCKET_URL: string
      }
    }
  }
}
```

### 工具类型

```typescript
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// 可选某些属性
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// 必需某些属性
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// 递归键路径
type KeyPath<T> = {
  [K in keyof T]: T[K] extends object
    ? K | `${K & string}.${KeyPath<T[K]> & string}`
    : K
}[keyof T]

// 根据键路径获取值类型
type GetByPath<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? GetByPath<T[K], R>
    : never
  : never
```

这些类型定义为移动端应用提供了完整的TypeScript支持，确保代码的类型安全和开发体验。使用时根据具体需求选择合适的类型定义。