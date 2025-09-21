# 用户管理 API

移动端用户相关的API接口，包括登录认证、用户信息管理、个人设置等功能。

## 📋 API 概览

### 接口列表

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 用户登录 | POST | `/auth/login` | 账号密码登录 |
| 短信登录 | POST | `/auth/smsLogin` | 手机验证码登录 |
| 微信登录 | POST | `/auth/wxLogin` | 微信授权登录 |
| 退出登录 | POST | `/auth/logout` | 退出登录 |
| 刷新Token | POST | `/auth/refresh` | 刷新访问令牌 |
| 获取用户信息 | GET | `/system/user/profile` | 获取当前用户信息 |
| 更新用户信息 | PUT | `/system/user/profile` | 更新用户基本信息 |
| 修改密码 | PUT | `/system/user/updatePwd` | 修改登录密码 |
| 绑定手机号 | POST | `/system/user/bindMobile` | 绑定手机号码 |
| 绑定邮箱 | POST | `/system/user/bindEmail` | 绑定邮箱地址 |
| 上传头像 | POST | `/system/user/avatar` | 上传用户头像 |
| 获取验证码 | GET | `/system/captcha` | 获取图形验证码 |
| 发送短信 | POST | `/system/sms/send` | 发送短信验证码 |

## 🔐 认证相关接口

### 用户登录

```typescript
// 账号密码登录
export interface LoginRequest {
  username: string
  password: string
  code?: string
  uuid?: string
  rememberMe?: boolean
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: UserInfo
}

export const login = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return http.post<LoginResponse>('/auth/login', data)
}

// 使用示例
const handleLogin = async () => {
  try {
    const response = await login({
      username: 'admin',
      password: '123456',
      code: captchaCode.value,
      uuid: captchaUuid.value
    })

    // 保存token和用户信息
    const userStore = useUserStore()
    userStore.setToken(response.data.access_token)
    userStore.setUserInfo(response.data.user)

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    })
  } catch (error) {
    console.error('登录失败:', error)
  }
}
```

### 短信登录

```typescript
// 短信登录
export interface SmsLoginRequest {
  mobile: string
  code: string
  smsType: 'login' | 'register' | 'resetPwd'
}

export const smsLogin = (data: SmsLoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return http.post<LoginResponse>('/auth/smsLogin', data)
}

// 发送短信验证码
export interface SendSmsRequest {
  mobile: string
  smsType: 'login' | 'register' | 'resetPwd' | 'bindMobile'
  scene?: string
}

export const sendSmsCode = (data: SendSmsRequest): Promise<ApiResponse<void>> => {
  return http.post<void>('/system/sms/send', data)
}

// 使用示例
const handleSmsLogin = async () => {
  try {
    // 先发送验证码
    await sendSmsCode({
      mobile: mobile.value,
      smsType: 'login'
    })

    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    })

    // 然后进行登录
    const response = await smsLogin({
      mobile: mobile.value,
      code: smsCode.value,
      smsType: 'login'
    })

    // 处理登录成功
    handleLoginSuccess(response.data)
  } catch (error) {
    console.error('短信登录失败:', error)
  }
}
```

### 微信登录

```typescript
// 微信登录
export interface WxLoginRequest {
  code: string
  encryptedData?: string
  iv?: string
  rawData?: string
  signature?: string
}

export const wxLogin = (data: WxLoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return http.post<LoginResponse>('/auth/wxLogin', data)
}

// 微信授权登录流程
const handleWxLogin = async () => {
  try {
    // 微信授权登录
    const loginRes = await uni.login({
      provider: 'weixin'
    })

    if (!loginRes.code) {
      throw new Error('微信授权失败')
    }

    // 获取用户信息
    const userInfoRes = await uni.getUserInfo({
      provider: 'weixin'
    })

    // 调用登录接口
    const response = await wxLogin({
      code: loginRes.code,
      encryptedData: userInfoRes.encryptedData,
      iv: userInfoRes.iv,
      rawData: userInfoRes.rawData,
      signature: userInfoRes.signature
    })

    handleLoginSuccess(response.data)
  } catch (error) {
    console.error('微信登录失败:', error)
    uni.showToast({
      title: '微信登录失败',
      icon: 'error'
    })
  }
}
```

### 退出登录

```typescript
// 退出登录
export const logout = (): Promise<ApiResponse<void>> => {
  return http.post<void>('/auth/logout')
}

// 使用示例
const handleLogout = async () => {
  try {
    await logout()

    // 清除本地数据
    const userStore = useUserStore()
    userStore.logout()

    uni.showToast({
      title: '退出成功',
      icon: 'success'
    })

    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    })
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
```

### Token 刷新

```typescript
// 刷新Token
export interface RefreshTokenRequest {
  refresh_token: string
}

export const refreshToken = (data: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> => {
  return http.post<LoginResponse>('/auth/refresh', data)
}

// 自动刷新Token
export const autoRefreshToken = async (): Promise<boolean> => {
  try {
    const userStore = useUserStore()
    const refreshToken = userStore.refreshToken

    if (!refreshToken) {
      return false
    }

    const response = await refreshToken({
      refresh_token: refreshToken
    })

    // 更新token
    userStore.setToken(response.data.access_token)
    userStore.setRefreshToken(response.data.refresh_token)

    return true
  } catch (error) {
    console.error('Token刷新失败:', error)
    return false
  }
}
```

## 👤 用户信息管理

### 获取用户信息

```typescript
// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  mobile?: string
  sex: '0' | '1' | '2' // 0未知 1男 2女
  birthday?: string
  province?: string
  city?: string
  address?: string
  signature?: string
  status: '0' | '1' // 0正常 1停用
  createTime: string
  loginTime?: string
  loginIp?: string
  roles?: Role[]
  permissions?: string[]
}

export const getUserProfile = (): Promise<ApiResponse<UserInfo>> => {
  return http.get<UserInfo>('/system/user/profile')
}

// 使用示例
const loadUserProfile = async () => {
  try {
    const response = await getUserProfile()
    const userStore = useUserStore()
    userStore.setUserInfo(response.data)
    return response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}
```

### 更新用户信息

```typescript
// 更新用户信息
export interface UpdateUserRequest {
  nickname?: string
  email?: string
  mobile?: string
  sex?: '0' | '1' | '2'
  birthday?: string
  province?: string
  city?: string
  address?: string
  signature?: string
}

export const updateUserProfile = (data: UpdateUserRequest): Promise<ApiResponse<void>> => {
  return http.put<void>('/system/user/profile', data)
}

// 使用示例
const handleUpdateProfile = async (updateData: UpdateUserRequest) => {
  try {
    await updateUserProfile(updateData)

    uni.showToast({
      title: '更新成功',
      icon: 'success'
    })

    // 重新获取用户信息
    await loadUserProfile()
  } catch (error) {
    console.error('更新用户信息失败:', error)
  }
}
```

### 修改密码

```typescript
// 修改密码
export interface UpdatePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export const updatePassword = (data: UpdatePasswordRequest): Promise<ApiResponse<void>> => {
  return http.put<void>('/system/user/updatePwd', data)
}

// 使用示例
const handleUpdatePassword = async (passwordData: UpdatePasswordRequest) => {
  try {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      uni.showToast({
        title: '两次密码输入不一致',
        icon: 'error'
      })
      return
    }

    await updatePassword(passwordData)

    uni.showToast({
      title: '密码修改成功',
      icon: 'success'
    })

    // 修改密码后重新登录
    handleLogout()
  } catch (error) {
    console.error('修改密码失败:', error)
  }
}
```

### 绑定手机号

```typescript
// 绑定手机号
export interface BindMobileRequest {
  mobile: string
  code: string
  password?: string
}

export const bindMobile = (data: BindMobileRequest): Promise<ApiResponse<void>> => {
  return http.post<void>('/system/user/bindMobile', data)
}

// 使用示例
const handleBindMobile = async () => {
  try {
    // 先发送验证码
    await sendSmsCode({
      mobile: mobile.value,
      smsType: 'bindMobile'
    })

    // 绑定手机号
    await bindMobile({
      mobile: mobile.value,
      code: smsCode.value,
      password: password.value
    })

    uni.showToast({
      title: '手机号绑定成功',
      icon: 'success'
    })

    // 更新用户信息
    await loadUserProfile()
  } catch (error) {
    console.error('绑定手机号失败:', error)
  }
}
```

### 绑定邮箱

```typescript
// 绑定邮箱
export interface BindEmailRequest {
  email: string
  code: string
  password?: string
}

export const bindEmail = (data: BindEmailRequest): Promise<ApiResponse<void>> => {
  return http.post<void>('/system/user/bindEmail', data)
}

// 发送邮箱验证码
export interface SendEmailCodeRequest {
  email: string
  emailType: 'bind' | 'unbind' | 'resetPwd'
}

export const sendEmailCode = (data: SendEmailCodeRequest): Promise<ApiResponse<void>> => {
  return http.post<void>('/system/email/send', data)
}
```

### 上传头像

```typescript
// 上传头像
export const uploadAvatar = (filePath: string): Promise<ApiResponse<string>> => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${import.meta.env.VITE_APP_BASE_API}/system/user/avatar`,
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${useUserStore().token}`
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data)
        } else {
          reject(new Error(data.msg))
        }
      },
      fail: reject
    })
  })
}

// 选择并上传头像
const handleChooseAvatar = async () => {
  try {
    const chooseImageRes = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const filePath = chooseImageRes.tempFilePaths[0]

    uni.showLoading({
      title: '上传中...'
    })

    const response = await uploadAvatar(filePath)

    uni.hideLoading()

    // 更新用户头像
    await updateUserProfile({
      avatar: response.data
    })

    uni.showToast({
      title: '头像更新成功',
      icon: 'success'
    })
  } catch (error) {
    uni.hideLoading()
    console.error('上传头像失败:', error)
    uni.showToast({
      title: '上传失败',
      icon: 'error'
    })
  }
}
```

## 🔒 验证码相关接口

### 图形验证码

```typescript
// 获取图形验证码
export interface CaptchaResponse {
  uuid: string
  img: string
  enabled: boolean
}

export const getCaptcha = (): Promise<ApiResponse<CaptchaResponse>> => {
  return http.get<CaptchaResponse>('/system/captcha')
}

// 使用示例
const loadCaptcha = async () => {
  try {
    const response = await getCaptcha()
    captchaUuid.value = response.data.uuid
    captchaImg.value = response.data.img
    captchaEnabled.value = response.data.enabled
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}
```

### 短信验证码

```typescript
// 验证短信验证码
export interface VerifySmsRequest {
  mobile: string
  code: string
  smsType: string
}

export const verifySmsCode = (data: VerifySmsRequest): Promise<ApiResponse<boolean>> => {
  return http.post<boolean>('/system/sms/verify', data)
}

// 获取短信发送记录
export const getSmsRecords = (mobile: string): Promise<ApiResponse<SmsRecord[]>> => {
  return http.get<SmsRecord[]>(`/system/sms/records/${mobile}`)
}

export interface SmsRecord {
  id: number
  mobile: string
  code: string
  smsType: string
  status: '0' | '1' // 0未使用 1已使用
  expireTime: string
  createTime: string
}
```

## 🔧 工具函数

### 登录状态检查

```typescript
// 检查登录状态
export const checkLoginStatus = (): boolean => {
  const userStore = useUserStore()
  return !!userStore.token && !!userStore.userInfo
}

// 需要登录的页面守卫
export const requireLogin = () => {
  if (!checkLoginStatus()) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: () => {
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    })
    return false
  }
  return true
}
```

### Token 有效性检查

```typescript
// 检查Token是否即将过期
export const isTokenExpiringSoon = (expiresIn: number, threshold = 5 * 60 * 1000): boolean => {
  return expiresIn < threshold
}

// 自动刷新Token的组合函数
export function useTokenRefresh() {
  const userStore = useUserStore()
  let refreshTimer: number | null = null

  const startAutoRefresh = (expiresIn: number) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    // 在token过期前5分钟自动刷新
    const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 0)

    refreshTimer = setTimeout(async () => {
      const success = await autoRefreshToken()
      if (success) {
        // 继续下一次自动刷新
        startAutoRefresh(userStore.expiresIn)
      } else {
        // 刷新失败，跳转登录页
        handleLogout()
      }
    }, refreshTime)
  }

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    startAutoRefresh,
    stopAutoRefresh
  }
}
```

### 用户权限检查

```typescript
// 检查用户权限
export const hasPermission = (permission: string): boolean => {
  const userStore = useUserStore()
  return userStore.permissions.includes(permission) || userStore.permissions.includes('*:*:*')
}

// 检查用户角色
export const hasRole = (role: string): boolean => {
  const userStore = useUserStore()
  return userStore.roles.some(r => r.roleKey === role) || userStore.roles.some(r => r.roleKey === 'admin')
}

// 权限指令
export const vPermission = {
  mounted(el: HTMLElement, binding: any) {
    const permission = binding.value
    if (!hasPermission(permission)) {
      el.style.display = 'none'
    }
  },
  updated(el: HTMLElement, binding: any) {
    const permission = binding.value
    if (!hasPermission(permission)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}
```

用户管理API为移动端提供了完整的用户认证和信息管理功能，支持多种登录方式和安全验证机制。