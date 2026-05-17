# Login 登录页

## 介绍

登录页是移动端应用的入口页面,提供用户身份认证功能。页面支持多种登录方式、多租户、验证码、记住密码等完整的登录体验。

**核心特性:**

- **多种登录方式** - 支持账号密码、短信验证码、小程序授权、公众号授权、第三方社交登录
- **多端适配** - 自动适配H5、微信小程序、App等多端环境,提供最佳登录体验
- **安全机制** - 图片验证码、短信验证码、密码加密传输等多重安全保护
- **多租户支持** - 支持租户选择器和域名自动识别租户
- **用户体验优化** - 记住密码、自动登录、表单验证等便捷功能
- **主题定制** - 支持CSS变量自定义主题样式

## 页面结构

登录页采用经典的移动端登录布局,分为四个主要区域:

```text
┌─────────────────────────┐
│       Logo + 标题        │  顶部区域
├─────────────────────────┤
│      租户选择器          │
│      登录方式切换        │
│      输入框表单          │  表单区域
│      记住密码/忘记密码   │
│      登录按钮           │
├─────────────────────────┤
│      第三方登录入口      │  社交登录区
├─────────────────────────┤
│      用户协议/注册入口   │  底部区域
└─────────────────────────┘
```

## 数据结构

### 表单数据

```typescript
/** 登录表单数据 */
interface LoginFormData {
  tenantId: string      // 租户ID
  username: string      // 用户名
  password: string      // 密码
  code: string          // 图片验证码
  uuid: string          // 验证码标识
  phoneNumber: string   // 手机号
  smsCode: string       // 短信验证码
}
```

### 验证码数据

```typescript
/** 图片验证码响应 */
interface CaptchaVo {
  captchaEnabled: boolean  // 是否启用验证码
  img?: string             // Base64图片
  uuid?: string            // 验证码标识
}
```

### 登录响应

```typescript
/** 认证令牌响应 */
interface AuthTokenVo {
  accessToken: string   // 访问令牌
  refreshToken: string  // 刷新令牌
  expiresIn: number     // 过期时间(秒)
}
```

### 租户数据

```typescript
/** 租户信息 */
interface TenantVo {
  tenantId: string      // 租户ID
  companyName: string   // 公司名称
  domain?: string       // 绑定域名
}

/** 租户配置响应 */
interface TenantConfigVo {
  tenantEnabled: boolean   // 是否启用多租户
  tenantList: TenantVo[]   // 租户列表
}
```

## 表单验证

### 验证规则配置

```typescript
import type { FormRules } from '@/wd/components/wd-form/types'

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '请输入4位验证码', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    { len: 6, message: '请输入6位验证码', trigger: 'blur' }
  ]
}
```

### 验证执行

```typescript
const formRef = ref<FormInstance | null>(null)

const handleLogin = async () => {
  // 执行表单验证
  const valid = await formRef.value?.validate()
  if (!valid) return

  // 验证通过,执行登录
  await doLogin()
}
```

## 验证码功能

### 图片验证码

```typescript
import { imgCode } from '@/api/system/auth/authApi'

const captchaEnabled = ref(false)
const captchaImg = ref('')
const uuid = ref('')

/** 获取图片验证码 */
const getCaptcha = async () => {
  try {
    const res = await imgCode()
    if (res.data) {
      captchaEnabled.value = res.data.captchaEnabled
      if (res.data.captchaEnabled && res.data.img) {
        captchaImg.value = `data:image/png;base64,${res.data.img}`
        uuid.value = res.data.uuid || ''
      }
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

/** 刷新验证码 */
const refreshCaptcha = () => {
  getCaptcha()
}
```

### 短信验证码

```typescript
import { smsCode as sendSms } from '@/api/system/auth/authApi'

const smsCountdown = ref(0)
let smsTimer: ReturnType<typeof setInterval> | null = null

// 按钮状态
const smsButtonText = computed(() => {
  return smsCountdown.value > 0 ? `${smsCountdown.value}s` : '获取验证码'
})

const smsDisabled = computed(() => {
  return smsCountdown.value > 0 || !formData.value.phoneNumber
})

/** 发送短信验证码 */
const sendSmsCode = async () => {
  if (smsDisabled.value) return

  // 验证手机号
  if (!/^1[3-9]\d{9}$/.test(formData.value.phoneNumber)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    await sendSms({ phoneNumber: formData.value.phoneNumber })
    uni.showToast({ title: '验证码已发送', icon: 'success' })

    // 开始倒计时
    smsCountdown.value = 60
    smsTimer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        clearInterval(smsTimer!)
        smsTimer = null
      }
    }, 1000)
  } catch (error: any) {
    uni.showToast({ title: error.message || '发送失败', icon: 'none' })
  }
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer)
    smsTimer = null
  }
})
```

## 记住密码

### 保存登录信息

```typescript
interface RememberInfo {
  username: string
  password: string
  rememberMe: boolean
}

const STORAGE_KEY = 'login_remember'

/** 保存记住密码信息 */
const saveRememberInfo = () => {
  const info: RememberInfo = {
    username: formData.value.username,
    password: btoa(formData.value.password), // Base64编码
    rememberMe: true
  }
  uni.setStorageSync(STORAGE_KEY, info)
}

/** 加载记住的登录信息 */
const loadRememberInfo = () => {
  try {
    const info = uni.getStorageSync(STORAGE_KEY)
    if (info) {
      const data = typeof info === 'string' ? JSON.parse(info) : info
      formData.value.username = data.username || ''
      formData.value.password = data.password ? atob(data.password) : ''
      rememberMe.value = data.rememberMe || false
    }
  } catch (error) {
    console.error('加载记住信息失败:', error)
  }
}

/** 清除记住的登录信息 */
const clearRememberInfo = () => {
  uni.removeStorageSync(STORAGE_KEY)
}
```

## 登录方式

### 账号密码登录

```typescript
import { userLogin } from '@/api/system/auth/authApi'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

/** 账号密码登录 */
const loginByPassword = async () => {
  try {
    const res = await userLogin({
      username: formData.value.username,
      password: formData.value.password,
      code: formData.value.code,
      uuid: formData.value.uuid,
      tenantId: formData.value.tenantId
    })

    if (res.data) {
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      // 保存记住密码
      if (rememberMe.value) {
        saveRememberInfo()
      }

      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
    }
  } catch (error: any) {
    await getCaptcha() // 刷新验证码
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  }
}
```

### 短信登录

```typescript
import { smsLogin } from '@/api/system/auth/authApi'

/** 短信验证码登录 */
const loginBySms = async () => {
  try {
    const res = await smsLogin({
      phoneNumber: formData.value.phoneNumber,
      smsCode: formData.value.smsCode,
      tenantId: formData.value.tenantId
    })

    if (res.data) {
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  }
}
```

### 小程序登录

小程序环境支持静默登录和手机号授权登录:

```typescript
import { miniappLogin, miniappPhoneLogin } from '@/api/system/auth/authApi'

/** 小程序静默登录 */
const loginByMiniapp = async () => {
  // #ifdef MP-WEIXIN
  try {
    // 获取微信登录code
    const loginResult = await uni.login({ provider: 'weixin' })

    const res = await miniappLogin({
      code: loginResult.code,
      tenantId: formData.value.tenantId
    })

    if (res.data) {
      await userStore.setToken(res.data)
      await userStore.getUserInfo()
      uni.switchTab({ url: '/pages/index/index' })
    }
  } catch (error: any) {
    console.error('小程序登录失败:', error)
    // 静默登录失败,需要用户手动登录
  }
  // #endif
}

/** 小程序手机号登录 */
const loginByMiniappPhone = async (e: any) => {
  // #ifdef MP-WEIXIN
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '授权失败', icon: 'none' })
    return
  }

  try {
    const loginResult = await uni.login({ provider: 'weixin' })

    const res = await miniappPhoneLogin({
      code: e.detail.code,
      loginCode: loginResult.code,
      tenantId: formData.value.tenantId
    })

    if (res.data) {
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  }
  // #endif
}
```

小程序端模板:

```vue
<template>
  <!-- #ifdef MP-WEIXIN -->
  <view class="miniapp-login">
    <button class="login-btn" open-type="getPhoneNumber" @getphonenumber="loginByMiniappPhone">
      微信一键登录
    </button>
    <view class="tips">授权手机号即可快速登录</view>
  </view>
  <!-- #endif -->
</template>
```

### 公众号登录

H5环境下的微信公众号授权登录:

```typescript
import { isWechatOfficialH5 } from '@/utils/platform'
import { mpLogin } from '@/api/system/auth/authApi'

/** 公众号登录 */
const loginByMp = async () => {
  // #ifdef H5
  if (!isWechatOfficialH5()) return

  // 获取URL中的授权code
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')

  if (!code) {
    // 跳转授权页面
    redirectToAuth()
    return
  }

  try {
    const res = await mpLogin({
      code,
      tenantId: formData.value.tenantId
    })

    if (res.data) {
      await userStore.setToken(res.data)
      await userStore.getUserInfo()
      uni.switchTab({ url: '/pages/index/index' })
    }
  } catch (error: any) {
    console.error('公众号登录失败:', error)
  }
  // #endif
}

/** 跳转微信授权页面 */
const redirectToAuth = () => {
  const appId = 'your-appid'
  const redirectUri = encodeURIComponent(window.location.href)
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
  window.location.href = authUrl
}
```

### 社交登录

支持微信、QQ、微博等第三方登录:

```typescript
import { socialAuthUrl, socialLogin } from '@/api/system/auth/authApi'

const socialList = [
  { type: 'wechat', icon: 'wechat', color: '#07c160', label: '微信' },
  { type: 'qq', icon: 'qq', color: '#12b7f5', label: 'QQ' },
  { type: 'weibo', icon: 'weibo', color: '#ff5722', label: '微博' }
]

/** 发起社交登录 */
const handleSocialLogin = async (type: string) => {
  // #ifdef H5
  try {
    const res = await socialAuthUrl({
      source: type,
      redirectUri: window.location.origin + '/auth/callback'
    })

    if (res.data?.authorizeUrl) {
      window.location.href = res.data.authorizeUrl
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  }
  // #endif
}

/** 处理社交登录回调 */
const handleSocialCallback = async (code: string, source: string) => {
  try {
    const res = await socialLogin({
      code,
      source,
      tenantId: formData.value.tenantId
    })

    if (res.data) {
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  }
}
```

## 自动登录

### 小程序自动登录

```typescript
import { onLoad } from '@dcloudio/uni-app'

onLoad(async () => {
  // #ifdef MP-WEIXIN
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    uni.switchTab({ url: '/pages/index/index' })
    return
  }

  // 尝试静默登录
  await loginByMiniapp()
  // #endif
})
```

### 公众号自动登录

```typescript
onLoad(async () => {
  // #ifdef H5
  if (isWechatOfficialH5()) {
    // 检查是否有授权code
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    if (code) {
      // 有code,执行登录
      await loginByMp()
    } else if (!userStore.isLoggedIn) {
      // 无code且未登录,跳转授权
      redirectToAuth()
    }
  }
  // #endif
})
```

## 多租户支持

### 租户选择器

```typescript
import { getTenantConfig } from '@/api/system/tenant/tenantApi'

const tenantEnabled = ref(false)
const tenantColumns = ref<{ value: string; label: string }[]>([])

/** 获取租户配置 */
const getTenant = async () => {
  try {
    const res = await getTenantConfig()
    if (res.data) {
      tenantEnabled.value = res.data.tenantEnabled
      if (res.data.tenantList?.length) {
        tenantColumns.value = res.data.tenantList.map(item => ({
          value: item.tenantId,
          label: item.companyName
        }))
        formData.value.tenantId = res.data.tenantList[0].tenantId
      }
    }
  } catch (error) {
    console.error('获取租户配置失败:', error)
  }
}
```

租户选择器模板:

```vue
<template>
  <view v-if="tenantEnabled" class="tenant-selector">
    <wd-picker
      v-model="formData.tenantId"
      :columns="tenantColumns"
      label="选择租户"
      label-width="80px"
    />
  </view>
</template>
```

### 域名自动识别

```typescript
/** 根据域名自动识别租户 */
const autoDetectTenant = async () => {
  // #ifdef H5
  try {
    const domain = window.location.hostname
    const res = await getTenantByDomain({ domain })

    if (res.data?.tenantId) {
      formData.value.tenantId = res.data.tenantId
      // 隐藏租户选择器
      tenantEnabled.value = false
    }
  } catch (error) {
    console.error('租户识别失败:', error)
  }
  // #endif
}
```

## 主题定制

### CSS变量

```scss
.login-page {
  // 背景
  --login-bg-color: #f5f5f5;
  --login-bg-image: none;

  // 卡片
  --login-card-bg: #ffffff;
  --login-card-radius: 16rpx;
  --login-card-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

  // 按钮
  --login-btn-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --login-btn-color: #ffffff;
  --login-btn-radius: 44rpx;

  // 文字
  --login-title-color: #333333;
  --login-subtitle-color: #999999;
  --login-link-color: #667eea;
}

// 暗黑模式
.dark .login-page {
  --login-bg-color: #1a1a1a;
  --login-card-bg: #2a2a2a;
  --login-title-color: #ffffff;
  --login-subtitle-color: #888888;
}
```

## API 接口

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /auth/login | 账号密码登录 |
| POST | /auth/smsLogin | 短信验证码登录 |
| POST | /auth/miniapp/login | 小程序静默登录 |
| POST | /auth/miniapp/phoneLogin | 小程序手机号登录 |
| POST | /auth/mp/login | 公众号登录 |
| POST | /auth/social/login | 社交登录 |
| GET | /auth/captcha | 获取图片验证码 |
| POST | /auth/smsCode | 发送短信验证码 |
| POST | /auth/logout | 退出登录 |
| POST | /auth/refreshToken | 刷新令牌 |

### 租户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /system/tenant/config | 获取租户配置 |
| GET | /system/tenant/byDomain | 根据域名获取租户 |

## 类型定义

```typescript
/** 登录请求参数 */
interface LoginParams {
  username: string
  password: string
  code?: string
  uuid?: string
  tenantId?: string
}

/** 短信登录请求参数 */
interface SmsLoginParams {
  phoneNumber: string
  smsCode: string
  tenantId?: string
}

/** 小程序登录请求参数 */
interface MiniappLoginParams {
  code: string
  tenantId?: string
}

/** 小程序手机号登录请求参数 */
interface MiniappPhoneLoginParams {
  code: string
  loginCode: string
  tenantId?: string
}

/** 公众号登录请求参数 */
interface MpLoginParams {
  code: string
  tenantId?: string
}

/** 社交登录请求参数 */
interface SocialLoginParams {
  code: string
  source: string
  tenantId?: string
}

/** 认证令牌响应 */
interface AuthTokenVo {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType?: string
}

/** 用户信息 */
interface UserInfo {
  userId: string
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  roles: string[]
  permissions: string[]
}

/** API响应格式 */
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}
```

## UserStore 状态管理

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthTokenVo, UserInfo } from '@/api/system/auth/types'
import { getUserInfo as fetchUserInfo, logout as doLogout } from '@/api/system/auth/authApi'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<AuthTokenVo | null>(null)
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value?.accessToken)
  const accessToken = computed(() => token.value?.accessToken || '')
  const roles = computed(() => userInfo.value?.roles || [])
  const permissions = computed(() => userInfo.value?.permissions || [])

  /** 设置Token */
  const setToken = async (tokenData: AuthTokenVo) => {
    token.value = tokenData
    uni.setStorageSync('token', tokenData)
  }

  /** 获取用户信息 */
  const getUserInfo = async () => {
    try {
      const res = await fetchUserInfo()
      if (res.data) {
        userInfo.value = res.data
        uni.setStorageSync('userInfo', res.data)
      }
      return res.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /** 退出登录 */
  const logout = async () => {
    try {
      await doLogout()
    } finally {
      token.value = null
      userInfo.value = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.reLaunch({ url: '/pages/auth/login' })
    }
  }

  /** 检查权限 */
  const hasPermission = (permission: string | string[]): boolean => {
    if (!permissions.value.length) return false
    if (permissions.value.includes('*:*:*')) return true

    const perms = Array.isArray(permission) ? permission : [permission]
    return perms.some(p => permissions.value.includes(p))
  }

  /** 检查角色 */
  const hasRole = (role: string | string[]): boolean => {
    if (!roles.value.length) return false
    if (roles.value.includes('admin')) return true

    const roleList = Array.isArray(role) ? role : [role]
    return roleList.some(r => roles.value.includes(r))
  }

  /** 初始化(从本地存储恢复) */
  const init = () => {
    const storedToken = uni.getStorageSync('token')
    const storedUserInfo = uni.getStorageSync('userInfo')

    if (storedToken) {
      token.value = storedToken
    }
    if (storedUserInfo) {
      userInfo.value = storedUserInfo
    }
  }

  // 初始化
  init()

  return {
    token,
    userInfo,
    isLoggedIn,
    accessToken,
    roles,
    permissions,
    setToken,
    getUserInfo,
    logout,
    hasPermission,
    hasRole
  }
})
```

## 最佳实践

### 1. 安全性

```typescript
// 密码加密传输(使用RSA或国密SM2)
import { encrypt } from '@/utils/crypto'

const encryptedPassword = encrypt(formData.value.password)

// 敏感数据不明文存储
const saveRememberInfo = () => {
  uni.setStorageSync('login_remember', {
    username: formData.value.username,
    password: btoa(formData.value.password), // Base64编码
    rememberMe: true
  })
}

// Token安全存储
const setToken = (tokenData: AuthTokenVo) => {
  // 使用安全存储
  uni.setStorageSync('token', tokenData)
  // 设置请求拦截器自动携带token
}
```

### 2. 用户体验优化

```typescript
// 表单预填充
onLoad(() => {
  loadRememberInfo()
})

// 登录状态检查
onLoad(async () => {
  if (userStore.isLoggedIn) {
    uni.switchTab({ url: '/pages/index/index' })
    return
  }
})

// 登录失败处理
const handleLoginError = async (error: any) => {
  // 刷新验证码
  await getCaptcha()

  // 友好提示
  const message = error.code === 'INVALID_CREDENTIALS'
    ? '用户名或密码错误'
    : (error.message || '登录失败')

  uni.showToast({ title: message, icon: 'none' })
}
```

### 3. 多端适配

```typescript
// 平台检测
import { isMp, isWechatOfficialH5, isApp } from '@/utils/platform'

onLoad(async () => {
  // 小程序环境
  // #ifdef MP-WEIXIN
  await loginByMiniapp()
  // #endif

  // H5公众号环境
  // #ifdef H5
  if (isWechatOfficialH5()) {
    await loginByMp()
  }
  // #endif

  // App环境
  // #ifdef APP-PLUS
  // App特有逻辑
  // #endif
})
```

## 常见问题

### 1. 验证码加载失败

**问题原因:** 网络问题或后端服务未启动。

**解决方案:**

```typescript
const getCaptcha = async () => {
  try {
    const res = await imgCode()
    // 处理验证码
  } catch (error) {
    console.error('获取验证码失败:', error)
    // 允许在验证码不可用时继续(如果后端允许)
    captchaEnabled.value = false
  }
}
```

### 2. 小程序登录无响应

**问题原因:** 未正确配置AppID或接口域名。

**解决方案:**
1. 检查 `manifest.json` 中的AppID配置
2. 在微信公众平台配置服务器域名
3. 确保后端接口支持小程序登录

### 3. Token过期处理

**问题原因:** 访问令牌过期,需要刷新。

**解决方案:**

```typescript
// 在请求拦截器中处理
const refreshTokenIfNeeded = async () => {
  const token = userStore.token
  if (!token?.refreshToken) return false

  // 检查是否即将过期(提前5分钟刷新)
  const expiresAt = token.expiresAt || 0
  const shouldRefresh = Date.now() > expiresAt - 5 * 60 * 1000

  if (shouldRefresh) {
    try {
      const res = await refreshToken({ refreshToken: token.refreshToken })
      await userStore.setToken(res.data)
      return true
    } catch {
      await userStore.logout()
      return false
    }
  }
  return true
}
```

### 4. 多租户切换问题

**问题原因:** 切换租户后数据未更新。

**解决方案:**

```typescript
const handleTenantChange = async (tenantId: string) => {
  formData.value.tenantId = tenantId

  // 清除之前租户的缓存数据
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  userStore.$reset()

  // 刷新验证码
  await getCaptcha()
}
```

### 5. 社交登录回调处理

**问题原因:** 授权回调URL参数丢失。

**解决方案:**

```typescript
// 在App.vue或登录页处理回调
onLoad((options) => {
  // #ifdef H5
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (code && state) {
    // 解析state获取登录来源
    const source = state.split('_')[0]
    handleSocialCallback(code, source)

    // 清理URL参数
    window.history.replaceState({}, '', window.location.pathname)
  }
  // #endif
})
```

## 完整示例

```vue
<template>
  <view class="login-page">
    <!-- Logo -->
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">RuoYi Mobile</text>
      <text class="subtitle">企业级移动端解决方案</text>
    </view>

    <!-- 表单区域 -->
    <view class="login-form-wrapper">
      <!-- 租户选择 -->
      <view v-if="tenantEnabled" class="tenant-selector">
        <wd-picker
          v-model="formData.tenantId"
          :columns="tenantColumns"
          label="选择租户"
          label-width="80px"
        />
      </view>

      <!-- 登录方式切换 -->
      <wd-tabs v-model="currentLoginType" :line-width="60">
        <wd-tab v-for="tab in loginTabs" :key="tab.value" :title="tab.label" :name="tab.value" />
      </wd-tabs>

      <wd-form ref="formRef" :model="formData" :rules="formRules">
        <!-- 密码登录表单 -->
        <template v-if="currentLoginType === 'password'">
          <wd-field name="username" label="用户名" placeholder="请输入用户名" v-model="formData.username" />
          <wd-field
            name="password"
            label="密码"
            placeholder="请输入密码"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            :suffix-icon="showPassword ? 'view' : 'eye-close'"
            @click-suffix-icon="showPassword = !showPassword"
          />
          <view v-if="captchaEnabled" class="captcha-row">
            <wd-field name="code" label="验证码" placeholder="请输入验证码" v-model="formData.code" />
            <image class="captcha-img" :src="captchaImg" mode="aspectFit" @click="getCaptcha" />
          </view>
        </template>

        <!-- 短信登录表单 -->
        <template v-else>
          <wd-field name="phoneNumber" label="手机号" placeholder="请输入手机号" v-model="formData.phoneNumber" />
          <view class="sms-row">
            <wd-field name="smsCode" label="验证码" placeholder="请输入验证码" v-model="formData.smsCode" />
            <wd-button size="small" :disabled="smsDisabled" @click="sendSmsCode">
              {{ smsButtonText }}
            </wd-button>
          </view>
        </template>

        <!-- 记住密码 -->
        <view v-if="currentLoginType === 'password'" class="login-options">
          <wd-checkbox v-model="rememberMe" size="small">记住密码</wd-checkbox>
          <text class="forget-link" @click="handleForgetPassword">忘记密码?</text>
        </view>

        <!-- 登录按钮 -->
        <wd-button type="primary" block :loading="loading" class="login-btn" @click="handleLogin">
          登录
        </wd-button>
      </wd-form>
    </view>

    <!-- 第三方登录 -->
    <view v-if="showSocialLogin" class="social-login">
      <view class="social-divider">
        <text>其他登录方式</text>
      </view>
      <view class="social-icons">
        <view
          v-for="item in socialList"
          :key="item.type"
          class="social-icon"
          @click="handleSocialLogin(item.type)"
        >
          <wd-icon :name="item.icon" :color="item.color" size="48rpx" />
        </view>
      </view>
    </view>

    <!-- 底部 -->
    <view class="login-footer">
      <view class="agreement">
        <wd-checkbox v-model="agreeTerms" size="small" />
        <text>我已阅读并同意</text>
        <text class="link" @click="goToTerms">《用户协议》</text>
        <text>和</text>
        <text class="link" @click="goToPrivacy">《隐私政策》</text>
      </view>
      <view v-if="registerEnabled" class="register-entry">
        <text>还没有账号?</text>
        <text class="link" @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { FormInstance, FormRules } from '@/wd/components/wd-form/types'
import { useUserStore } from '@/stores/user'
import { imgCode, userLogin, smsCode as sendSms, smsLogin } from '@/api/system/auth/authApi'
import { getTenantConfig } from '@/api/system/tenant/tenantApi'
import { isMp, isWechatOfficialH5 } from '@/utils/platform'

// 表单实例
const formRef = ref<FormInstance | null>(null)

// 用户Store
const userStore = useUserStore()

// 加载状态
const loading = ref(false)

// 登录类型
const currentLoginType = ref<'password' | 'sms'>('password')

// 登录方式选项
const loginTabs = [
  { label: '密码登录', value: 'password' },
  { label: '短信登录', value: 'sms' }
]

// 表单数据
const formData = ref({
  tenantId: '',
  username: '',
  password: '',
  code: '',
  uuid: '',
  phoneNumber: '',
  smsCode: ''
})

// 表单验证规则
const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  smsCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }]
}

// 显示密码
const showPassword = ref(false)

// 记住密码
const rememberMe = ref(false)

// 同意协议
const agreeTerms = ref(false)

// 验证码
const captchaEnabled = ref(false)
const captchaImg = ref('')

// 租户
const tenantEnabled = ref(false)
const tenantColumns = ref<{ value: string; label: string }[]>([])

// 短信验证码倒计时
const smsCountdown = ref(0)
let smsTimer: ReturnType<typeof setInterval> | null = null

const smsButtonText = computed(() => smsCountdown.value > 0 ? `${smsCountdown.value}s` : '获取验证码')
const smsDisabled = computed(() => smsCountdown.value > 0 || !formData.value.phoneNumber)

// 是否显示社交登录
const showSocialLogin = computed(() => {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
})

// 社交登录列表
const socialList = [{ type: 'wechat', icon: 'wechat', color: '#07c160' }]

// 是否开启注册
const registerEnabled = ref(true)

/** 获取验证码 */
const getCaptcha = async () => {
  try {
    const res = await imgCode()
    if (res.data) {
      captchaEnabled.value = res.data.captchaEnabled
      if (res.data.captchaEnabled && res.data.img) {
        captchaImg.value = `data:image/png;base64,${res.data.img}`
        formData.value.uuid = res.data.uuid || ''
      }
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

/** 获取租户配置 */
const getTenant = async () => {
  try {
    const res = await getTenantConfig()
    if (res.data) {
      tenantEnabled.value = res.data.tenantEnabled
      if (res.data.tenantList?.length) {
        tenantColumns.value = res.data.tenantList.map(item => ({
          value: item.tenantId,
          label: item.companyName
        }))
        formData.value.tenantId = res.data.tenantList[0].tenantId
      }
    }
  } catch (error) {
    console.error('获取租户配置失败:', error)
  }
}

/** 发送短信验证码 */
const sendSmsCode = async () => {
  if (smsDisabled.value) return
  if (!/^1[3-9]\d{9}$/.test(formData.value.phoneNumber)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  try {
    await sendSms({ phoneNumber: formData.value.phoneNumber })
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    smsCountdown.value = 60
    smsTimer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        clearInterval(smsTimer!)
        smsTimer = null
      }
    }, 1000)
  } catch (error: any) {
    uni.showToast({ title: error.message || '发送失败', icon: 'none' })
  }
}

/** 处理登录 */
const handleLogin = async () => {
  if (!agreeTerms.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }
  const valid = await formRef.value?.validate()
  if (!valid) return
  loading.value = true
  try {
    let res
    if (currentLoginType.value === 'password') {
      res = await userLogin({
        username: formData.value.username,
        password: formData.value.password,
        code: formData.value.code,
        uuid: formData.value.uuid,
        tenantId: formData.value.tenantId
      })
    } else {
      res = await smsLogin({
        phoneNumber: formData.value.phoneNumber,
        smsCode: formData.value.smsCode,
        tenantId: formData.value.tenantId
      })
    }
    if (res.data) {
      await userStore.setToken(res.data)
      await userStore.getUserInfo()
      if (rememberMe.value && currentLoginType.value === 'password') {
        saveRememberInfo()
      }
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500)
    }
  } catch (error: any) {
    await getCaptcha()
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/** 保存记住密码信息 */
const saveRememberInfo = () => {
  uni.setStorageSync('login_remember', {
    username: formData.value.username,
    password: btoa(formData.value.password),
    rememberMe: true
  })
}

/** 加载记住的登录信息 */
const loadRememberInfo = () => {
  try {
    const info = uni.getStorageSync('login_remember')
    if (info) {
      const data = typeof info === 'string' ? JSON.parse(info) : info
      formData.value.username = data.username || ''
      formData.value.password = data.password ? atob(data.password) : ''
      rememberMe.value = data.rememberMe || false
    }
  } catch (error) {
    console.error('加载记住信息失败:', error)
  }
}

const handleForgetPassword = () => uni.navigateTo({ url: '/pages/auth/forget-password' })
const handleSocialLogin = (type: string) => uni.showToast({ title: '暂未开放', icon: 'none' })
const goToTerms = () => uni.navigateTo({ url: '/pages/common/terms' })
const goToPrivacy = () => uni.navigateTo({ url: '/pages/common/privacy' })
const goToRegister = () => uni.navigateTo({ url: '/pages/auth/register' })

onLoad(async () => {
  if (userStore.isLoggedIn) {
    uni.switchTab({ url: '/pages/index/index' })
    return
  }
  loadRememberInfo()
  await getTenant()
  await getCaptcha()
})

onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer)
    smsTimer = null
  }
})
</script>
```

## 总结

登录页是移动端应用的核心页面,本文档涵盖了:

1. **页面结构** - 顶部Logo、表单区域、第三方登录、底部区域的布局设计
2. **数据结构** - 表单数据、验证码数据、登录响应等类型定义
3. **表单验证** - 完整的前端表单验证规则和实现
4. **验证码功能** - 图片验证码和短信验证码的实现
5. **记住密码** - 基于本地存储的记住密码功能
6. **多种登录方式** - 账号密码、短信、小程序、公众号、社交登录
7. **自动登录** - 小程序和公众号环境的自动登录机制
8. **多租户支持** - 租户选择器和域名自动识别
9. **主题定制** - CSS变量和暗黑模式支持
10. **最佳实践** - 安全性、用户体验、多端适配建议
