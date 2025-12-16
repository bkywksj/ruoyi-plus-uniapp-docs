# 登录页 Login

## 介绍

登录页是应用的入口页面,负责用户身份认证和授权。该页面实现了完整的登录功能,包括账号密码登录、短信验证码登录、微信小程序登录、微信公众号登录、第三方社交账号登录等多种认证方式。同时支持验证码校验、记住密码、多租户选择、自动登录等功能。

**核心特性:**

- **多种登录方式** - 支持账号密码、短信验证码、微信小程序、微信公众号、第三方社交账号等多种登录方式
- **验证码安全** - 支持图片验证码和短信验证码,防止暴力破解和恶意攻击
- **记住密码** - 支持记住用户名和密码,下次自动填充,提升用户体验
- **自动登录** - 微信小程序和公众号环境下支持静默授权自动登录
- **多租户支持** - 支持租户选择,适用于 SaaS 多租户应用场景
- **表单验证** - 完整的前端表单验证,实时反馈输入错误
- **主题适配** - 支持亮色/暗色主题,通过 CSS 变量实现主题定制
- **多端适配** - 支持 H5、微信小程序、App 等多端运行

## 页面结构

### 整体布局

登录页采用纵向布局,主要包含以下区域:

```
┌─────────────────────────────────┐
│           顶部区域               │
│    Logo + 应用名称 + 描述        │
├─────────────────────────────────┤
│           表单区域               │
│    租户选择(可选)                │
│    用户名/手机号输入             │
│    密码输入                      │
│    验证码输入                    │
│    记住密码 + 忘记密码           │
│    登录按钮                      │
├─────────────────────────────────┤
│         第三方登录区域           │
│    社交账号登录图标              │
├─────────────────────────────────┤
│           底部区域               │
│    用户协议 + 注册入口           │
└─────────────────────────────────┘
```

### 页面组件结构

```vue
<template>
  <view class="login-container">
    <!-- 顶部 Logo 区域 -->
    <view class="login-header">
      <image class="login-logo" :src="logoUrl" mode="aspectFit" />
      <text class="login-title">{{ appName }}</text>
      <text class="login-desc">{{ appDesc }}</text>
    </view>

    <!-- 登录表单区域 -->
    <view class="login-form">
      <wd-form ref="formRef" :model="formData" :rules="formRules">
        <!-- 租户选择 -->
        <wd-cell-group v-if="tenantEnabled">
          <wd-form-item prop="tenantId">
            <wd-picker
              v-model="formData.tenantId"
              :columns="tenantList"
              label="租户"
              label-width="70px"
            />
          </wd-form-item>
        </wd-cell-group>

        <!-- 用户名/手机号 -->
        <wd-cell-group>
          <wd-form-item prop="username">
            <wd-input
              v-model="formData.username"
              placeholder="请输入用户名/手机号"
              prefix-icon="user"
              clearable
            />
          </wd-form-item>
        </wd-cell-group>

        <!-- 密码 -->
        <wd-cell-group>
          <wd-form-item prop="password">
            <wd-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="lock"
              show-password
              clearable
            />
          </wd-form-item>
        </wd-cell-group>

        <!-- 验证码 -->
        <wd-cell-group v-if="captchaEnabled">
          <wd-form-item prop="code">
            <view class="captcha-row">
              <wd-input
                v-model="formData.code"
                placeholder="请输入验证码"
                prefix-icon="shield"
                clearable
              />
              <image
                class="captcha-image"
                :src="captchaImg"
                @click="getCaptcha"
              />
            </view>
          </wd-form-item>
        </wd-cell-group>

        <!-- 记住密码 -->
        <view class="login-options">
          <wd-checkbox v-model="rememberMe">记住密码</wd-checkbox>
          <text class="forget-password" @click="handleForgetPassword">
            忘记密码?
          </text>
        </view>

        <!-- 登录按钮 -->
        <wd-button
          type="primary"
          block
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </wd-button>
      </wd-form>
    </view>

    <!-- 第三方登录 -->
    <view class="social-login" v-if="socialEnabled">
      <view class="social-divider">
        <text>其他方式登录</text>
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

    <!-- 底部区域 -->
    <view class="login-footer">
      <view class="agreement">
        <wd-checkbox v-model="agreeTerms" size="small" />
        <text>我已阅读并同意</text>
        <text class="link" @click="goToTerms">《用户协议》</text>
        <text>和</text>
        <text class="link" @click="goToPrivacy">《隐私政策》</text>
      </view>
      <view class="register-entry" v-if="registerEnabled">
        <text>还没有账号?</text>
        <text class="link" @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>
```

## 数据结构

### 表单数据

```typescript
/**
 * 登录表单数据接口
 */
interface LoginFormData {
  /** 租户ID */
  tenantId?: string
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  code?: string
  /** 验证码唯一标识 */
  uuid?: string
  /** 登录类型: password-密码登录, sms-短信登录 */
  loginType?: 'password' | 'sms'
  /** 手机号(短信登录时使用) */
  phoneNumber?: string
  /** 短信验证码(短信登录时使用) */
  smsCode?: string
}

/**
 * 登录表单默认值
 */
const defaultFormData: LoginFormData = {
  tenantId: '',
  username: '',
  password: '',
  code: '',
  uuid: '',
  loginType: 'password'
}
```

### 验证码数据

```typescript
/**
 * 验证码响应接口
 */
interface CaptchaVo {
  /** 是否开启验证码 */
  captchaEnabled: boolean
  /** 验证码图片(Base64) */
  img?: string
  /** 验证码唯一标识 */
  uuid?: string
}

/**
 * 短信验证码请求参数
 */
interface SmsCodeBody {
  /** 手机号 */
  phoneNumber: string
  /** 验证码类型 */
  type?: 'login' | 'register' | 'reset'
}
```

### 登录响应数据

```typescript
/**
 * 登录响应Token接口
 */
interface AuthTokenVo {
  /** 访问令牌 */
  access_token: string
  /** 刷新令牌 */
  refresh_token?: string
  /** 令牌类型 */
  token_type?: string
  /** 过期时间(秒) */
  expires_in?: number
  /** 用户ID */
  userId?: number | string
  /** 客户端ID */
  clientId?: string
}

/**
 * 租户配置接口
 */
interface TenantConfigVo {
  /** 是否开启租户 */
  tenantEnabled: boolean
  /** 租户列表 */
  tenantList?: TenantVo[]
}

/**
 * 租户信息接口
 */
interface TenantVo {
  /** 租户ID */
  tenantId: string
  /** 租户名称 */
  companyName: string
  /** 租户域名 */
  domain?: string
}
```

## 表单验证

### 验证规则配置

```typescript
import type { FormRules } from '@/wd/components/wd-form/types'

/**
 * 登录表单验证规则
 */
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为4位', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    { len: 6, message: '短信验证码为6位', trigger: 'blur' }
  ]
}
```

### 表单验证示例

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd/components/wd-form/types'

// 表单实例引用
const formRef = ref<FormInstance | null>(null)

// 表单数据
const formData = ref<LoginFormData>({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

/**
 * 处理登录
 */
const handleLogin = async () => {
  // 先验证表单
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) {
      uni.showToast({
        title: '请完善表单信息',
        icon: 'none'
      })
      return
    }

    // 验证通过,执行登录逻辑
    await doLogin()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields()
}
</script>
```

## 验证码功能

### 图片验证码

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { imgCode } from '@/api/system/auth/authApi'

// 验证码图片
const captchaImg = ref('')
// 验证码UUID
const captchaUuid = ref('')
// 是否开启验证码
const captchaEnabled = ref(false)

/**
 * 获取图片验证码
 */
const getCaptcha = async () => {
  try {
    const res = await imgCode()
    if (res.data) {
      captchaEnabled.value = res.data.captchaEnabled
      if (res.data.captchaEnabled) {
        captchaImg.value = `data:image/png;base64,${res.data.img}`
        captchaUuid.value = res.data.uuid || ''
        formData.value.uuid = captchaUuid.value
      }
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    uni.showToast({
      title: '获取验证码失败',
      icon: 'none'
    })
  }
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
})
</script>

<template>
  <!-- 验证码输入框 -->
  <view class="captcha-row" v-if="captchaEnabled">
    <wd-input
      v-model="formData.code"
      placeholder="请输入验证码"
      prefix-icon="shield"
      clearable
      class="captcha-input"
    />
    <view class="captcha-image-wrapper" @click="getCaptcha">
      <image
        v-if="captchaImg"
        class="captcha-image"
        :src="captchaImg"
        mode="aspectFit"
      />
      <view v-else class="captcha-placeholder">
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

```

### 短信验证码

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { smsCode } from '@/api/system/auth/authApi'

// 倒计时
const countdown = ref(0)
// 定时器
let timer: ReturnType<typeof setInterval> | null = null

// 发送按钮文字
const sendBtnText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}s后重发` : '发送验证码'
})

// 是否禁用发送按钮
const sendBtnDisabled = computed(() => {
  return countdown.value > 0 || !formData.value.phoneNumber
})

/**
 * 发送短信验证码
 */
const sendSmsCode = async () => {
  // 验证手机号
  if (!formData.value.phoneNumber) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }

  // 手机号格式验证
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(formData.value.phoneNumber)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  try {
    await smsCode({
      phoneNumber: formData.value.phoneNumber,
      type: 'login'
    })

    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    })

    // 开始倒计时
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
    uni.showToast({
      title: '发送验证码失败',
      icon: 'none'
    })
  }
}

/**
 * 开始倒计时
 */
const startCountdown = () => {
  countdown.value = 60

  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      timer = null
    }
  }, 1000)
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <view class="sms-row">
    <wd-input
      v-model="formData.phoneNumber"
      placeholder="请输入手机号"
      prefix-icon="phone"
      type="number"
      maxlength="11"
      clearable
      class="sms-input"
    />
    <wd-button
      size="small"
      :disabled="sendBtnDisabled"
      @click="sendSmsCode"
    >
      {{ sendBtnText }}
    </wd-button>
  </view>

  <view class="sms-code-row">
    <wd-input
      v-model="formData.smsCode"
      placeholder="请输入短信验证码"
      prefix-icon="shield"
      type="number"
      maxlength="6"
      clearable
    />
  </view>
</template>
```

## 记住密码功能

### 实现原理

记住密码功能通过本地存储实现,将用户名和加密后的密码存储在本地缓存中,下次打开登录页时自动填充。

```vue
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'

// 缓存Key
const REMEMBER_KEY = 'login_remember_info'

// 记住密码开关
const rememberMe = ref(false)

// 表单数据
const formData = ref<LoginFormData>({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

/**
 * 加密密码(简单加密,实际项目建议使用更安全的加密方式)
 */
const encryptPassword = (password: string): string => {
  return btoa(password) // Base64编码,仅作示例
}

/**
 * 解密密码
 */
const decryptPassword = (encrypted: string): string => {
  try {
    return atob(encrypted) // Base64解码
  } catch {
    return ''
  }
}

/**
 * 保存记住的登录信息
 */
const saveRememberInfo = () => {
  if (rememberMe.value) {
    const info = {
      username: formData.value.username,
      password: encryptPassword(formData.value.password),
      rememberMe: true
    }
    uni.setStorageSync(REMEMBER_KEY, JSON.stringify(info))
  } else {
    uni.removeStorageSync(REMEMBER_KEY)
  }
}

/**
 * 读取记住的登录信息
 */
const loadRememberInfo = () => {
  try {
    const infoStr = uni.getStorageSync(REMEMBER_KEY)
    if (infoStr) {
      const info = JSON.parse(infoStr)
      formData.value.username = info.username || ''
      formData.value.password = decryptPassword(info.password || '')
      rememberMe.value = info.rememberMe || false
    }
  } catch (error) {
    console.error('读取记住信息失败:', error)
  }
}

/**
 * 处理登录成功
 */
const handleLoginSuccess = () => {
  // 保存记住密码信息
  saveRememberInfo()

  // 跳转到首页
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 监听记住密码开关变化
watch(rememberMe, (newVal) => {
  if (!newVal) {
    // 关闭记住密码时清除存储
    uni.removeStorageSync(REMEMBER_KEY)
  }
})

// 页面加载时读取记住的信息
onMounted(() => {
  loadRememberInfo()
})
</script>

<template>
  <view class="login-options">
    <wd-checkbox v-model="rememberMe">记住密码</wd-checkbox>
    <text class="forget-password" @click="handleForgetPassword">
      忘记密码?
    </text>
  </view>
</template>

```

### 安全注意事项

**关于密码存储的安全建议:**

1. **不建议在前端存储明文密码** - 即使使用 Base64 编码也只是简单混淆,不是真正的加密

2. **推荐方案:**
   - 使用 Token 自动登录,而非存储密码
   - 如需存储密码,应使用加密存储
   - 设置存储有效期,定期清理

3. **实际项目建议:**

```typescript
/**
 * 推荐: 使用 Token 实现自动登录
 */
const handleRememberLogin = async () => {
  // 登录成功后,将 Token 存储到本地
  const saveToken = (tokenVo: AuthTokenVo) => {
    uni.setStorageSync('access_token', tokenVo.access_token)
    uni.setStorageSync('refresh_token', tokenVo.refresh_token)
    uni.setStorageSync('token_expires', Date.now() + (tokenVo.expires_in || 0) * 1000)
  }

  // 检查是否有有效的 Token
  const checkAutoLogin = (): boolean => {
    const token = uni.getStorageSync('access_token')
    const expires = uni.getStorageSync('token_expires')

    if (token && expires && Date.now() < expires) {
      return true
    }
    return false
  }

  // 使用 Refresh Token 刷新访问令牌
  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = uni.getStorageSync('refresh_token')
    if (!refreshToken) return false

    try {
      const res = await authApi.refreshToken({ refreshToken })
      if (res.data) {
        saveToken(res.data)
        return true
      }
    } catch {
      // 刷新失败,清除本地存储
      clearLoginInfo()
    }
    return false
  }

  // 清除登录信息
  const clearLoginInfo = () => {
    uni.removeStorageSync('access_token')
    uni.removeStorageSync('refresh_token')
    uni.removeStorageSync('token_expires')
  }
}
```

## 登录方式

### 账号密码登录

```typescript
import { userLogin } from '@/api/system/auth/authApi'
import type { LoginBody } from '@/api/system/auth/authTypes'
import { useUserStore } from '@/stores/user'

/**
 * 账号密码登录
 */
const handlePasswordLogin = async () => {
  const userStore = useUserStore()

  // 构建登录参数
  const loginBody: LoginBody = {
    username: formData.value.username,
    password: formData.value.password,
    code: formData.value.code,
    uuid: formData.value.uuid,
    loginType: 'password',
    tenantId: formData.value.tenantId
  }

  try {
    loading.value = true

    // 调用登录接口
    const res = await userLogin(loginBody)

    if (res.data) {
      // 保存Token
      await userStore.setToken(res.data)

      // 获取用户信息
      await userStore.getUserInfo()

      // 记住密码处理
      saveRememberInfo()

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }
  } catch (error: any) {
    console.error('登录失败:', error)

    // 刷新验证码
    await getCaptcha()

    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
```

### 短信验证码登录

```typescript
import { smsLogin } from '@/api/system/auth/authApi'
import type { SmsLoginBody } from '@/api/system/auth/authTypes'

/**
 * 短信验证码登录
 */
const handleSmsLogin = async () => {
  const userStore = useUserStore()

  // 验证手机号和验证码
  if (!formData.value.phoneNumber || !formData.value.smsCode) {
    uni.showToast({
      title: '请输入手机号和验证码',
      icon: 'none'
    })
    return
  }

  const loginBody: SmsLoginBody = {
    phoneNumber: formData.value.phoneNumber,
    smsCode: formData.value.smsCode,
    loginType: 'sms',
    tenantId: formData.value.tenantId
  }

  try {
    loading.value = true

    const res = await smsLogin(loginBody)

    if (res.data) {
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }
  } catch (error: any) {
    console.error('短信登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
```

### 微信小程序登录

```typescript
import { miniappLogin } from '@/api/system/auth/authApi'
import type { MiniappLoginBody } from '@/api/system/auth/authTypes'
import { isMp } from '@/utils/platform'

/**
 * 微信小程序登录
 */
const handleMiniappLogin = async () => {
  // 仅在小程序环境下执行
  if (!isMp()) {
    uni.showToast({
      title: '请在微信小程序中使用',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true

    // 获取微信登录凭证
    const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    if (!loginResult.code) {
      throw new Error('获取登录凭证失败')
    }

    // 调用后端小程序登录接口
    const loginBody: MiniappLoginBody = {
      code: loginResult.code,
      loginType: 'miniapp',
      tenantId: formData.value.tenantId
    }

    const res = await miniappLogin(loginBody)

    if (res.data) {
      const userStore = useUserStore()
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }
  } catch (error: any) {
    console.error('小程序登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 获取用户手机号(需要用户授权)
 */
const getPhoneNumber = async (e: any) => {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    console.log('用户拒绝授权手机号')
    return
  }

  try {
    // 获取手机号加密数据
    const { code } = e.detail

    // 调用后端解密接口获取手机号
    const res = await authApi.getPhoneNumber({ code })

    if (res.data?.phoneNumber) {
      formData.value.phoneNumber = res.data.phoneNumber
    }
  } catch (error) {
    console.error('获取手机号失败:', error)
  }
}
```

### 微信公众号登录

```typescript
import { mpLogin, getWechatAuthUrl } from '@/api/system/auth/authApi'
import type { MpLoginBody } from '@/api/system/auth/authTypes'
import { isWechatOfficialH5 } from '@/utils/platform'

/**
 * 微信公众号登录(H5)
 */
const handleMpLogin = async () => {
  // 仅在微信公众号H5环境下执行
  if (!isWechatOfficialH5()) {
    uni.showToast({
      title: '请在微信中打开',
      icon: 'none'
    })
    return
  }

  try {
    // 从URL获取授权code
    const code = getUrlParam('code')

    if (!code) {
      // 未获取到code,跳转到微信授权页
      redirectToWechatAuth()
      return
    }

    loading.value = true

    const loginBody: MpLoginBody = {
      code,
      loginType: 'mp',
      tenantId: formData.value.tenantId
    }

    const res = await mpLogin(loginBody)

    if (res.data) {
      const userStore = useUserStore()
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 清除URL中的code参数
      const cleanUrl = removeUrlParam(window.location.href, 'code')
      window.history.replaceState({}, '', cleanUrl)

      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }
  } catch (error: any) {
    console.error('公众号登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 跳转到微信授权页
 */
const redirectToWechatAuth = async () => {
  try {
    const res = await getWechatAuthUrl({
      redirectUri: window.location.href,
      scope: 'snsapi_userinfo' // 获取用户信息需要此scope
    })

    if (res.data?.authUrl) {
      window.location.href = res.data.authUrl
    }
  } catch (error) {
    console.error('获取授权地址失败:', error)
  }
}

/**
 * 获取URL参数
 */
const getUrlParam = (name: string): string | null => {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

/**
 * 移除URL参数
 */
const removeUrlParam = (url: string, param: string): string => {
  const urlObj = new URL(url)
  urlObj.searchParams.delete(param)
  return urlObj.toString()
}
```

### 第三方社交登录

```typescript
import { socialBindUrl, socialLogin } from '@/api/system/auth/authApi'
import type { SocialLoginBody } from '@/api/system/auth/authTypes'

/**
 * 社交登录类型
 */
type SocialType = 'wechat' | 'qq' | 'weibo' | 'alipay' | 'dingtalk' | 'github'

/**
 * 社交登录配置
 */
const socialConfig: Record<SocialType, { icon: string; color: string; name: string }> = {
  wechat: { icon: 'wechat', color: '#07c160', name: '微信' },
  qq: { icon: 'qq', color: '#12b7f5', name: 'QQ' },
  weibo: { icon: 'weibo', color: '#e6162d', name: '微博' },
  alipay: { icon: 'alipay', color: '#1677ff', name: '支付宝' },
  dingtalk: { icon: 'dingtalk', color: '#1677ff', name: '钉钉' },
  github: { icon: 'github', color: '#24292e', name: 'GitHub' }
}

/**
 * 处理社交登录
 */
const handleSocialLogin = async (type: SocialType) => {
  try {
    // 获取社交登录授权地址
    const res = await socialBindUrl({
      source: type,
      redirectUri: `${window.location.origin}/social/callback`
    })

    if (res.data?.authUrl) {
      // 跳转到第三方授权页
      window.location.href = res.data.authUrl
    }
  } catch (error) {
    console.error('获取授权地址失败:', error)
    uni.showToast({
      title: '获取授权地址失败',
      icon: 'none'
    })
  }
}

/**
 * 处理社交登录回调
 * 在回调页面调用此方法
 */
const handleSocialCallback = async () => {
  const code = getUrlParam('code')
  const state = getUrlParam('state')
  const source = getUrlParam('source')

  if (!code || !source) {
    uni.showToast({
      title: '授权失败',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true

    const loginBody: SocialLoginBody = {
      code,
      state: state || '',
      source,
      loginType: 'social',
      tenantId: formData.value.tenantId
    }

    const res = await socialLogin(loginBody)

    if (res.data) {
      const userStore = useUserStore()
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }
  } catch (error: any) {
    console.error('社交登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
```

## 自动登录

### 小程序自动登录

```typescript
import { onLoad } from '@dcloudio/uni-app'
import { isMp } from '@/utils/platform'
import { useUserStore } from '@/stores/user'

/**
 * 页面加载时检查自动登录
 */
onLoad(async () => {
  const userStore = useUserStore()

  // 检查是否已登录
  if (userStore.isLoggedIn) {
    // 已登录,跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    })
    return
  }

  // 微信小程序环境下尝试自动登录
  if (isMp()) {
    await tryAutoLogin()
  }

  // 获取验证码
  await getCaptcha()
})

/**
 * 尝试自动登录(小程序)
 */
const tryAutoLogin = async () => {
  try {
    // 检查是否有缓存的登录状态
    const token = uni.getStorageSync('access_token')
    if (!token) {
      // 无缓存Token,尝试静默登录
      await silentLogin()
    } else {
      // 有缓存Token,验证是否有效
      const userStore = useUserStore()
      const isValid = await userStore.checkToken()

      if (isValid) {
        // Token有效,跳转到首页
        uni.switchTab({
          url: '/pages/index/index'
        })
      } else {
        // Token无效,清除并尝试静默登录
        userStore.clearToken()
        await silentLogin()
      }
    }
  } catch (error) {
    console.log('自动登录失败,显示登录表单')
  }
}

/**
 * 静默登录(小程序)
 * 使用 wx.login 获取 code,后端校验并返回 Token
 */
const silentLogin = async () => {
  try {
    // 获取登录凭证
    const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    if (!loginResult.code) {
      throw new Error('获取登录凭证失败')
    }

    // 调用静默登录接口
    const res = await authApi.silentLogin({
      code: loginResult.code,
      loginType: 'miniapp'
    })

    if (res.data) {
      const userStore = useUserStore()
      await userStore.setToken(res.data)
      await userStore.getUserInfo()

      // 跳转到首页
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  } catch (error) {
    // 静默登录失败,需要用户手动登录
    console.log('静默登录失败:', error)
  }
}
```

### 公众号自动登录

```typescript
import { isWechatOfficialH5 } from '@/utils/platform'

/**
 * 公众号环境自动登录
 */
const handleAutoLoginInMp = async () => {
  if (!isWechatOfficialH5()) return

  // 检查URL中是否有授权code
  const code = getUrlParam('code')

  if (code) {
    // 有code,执行登录
    await handleMpLogin()
  } else {
    // 无code,检查是否需要静默授权
    const autoLogin = uni.getStorageSync('mp_auto_login')

    if (autoLogin) {
      // 用户之前选择了自动登录,执行静默授权
      await redirectToSilentAuth()
    }
  }
}

/**
 * 跳转到静默授权页
 */
const redirectToSilentAuth = async () => {
  try {
    const res = await getWechatAuthUrl({
      redirectUri: window.location.href,
      scope: 'snsapi_base' // 静默授权,不弹窗
    })

    if (res.data?.authUrl) {
      window.location.href = res.data.authUrl
    }
  } catch (error) {
    console.error('获取授权地址失败:', error)
  }
}
```

## 多租户支持

### 租户选择器

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getTenantList } from '@/api/system/tenant/tenantApi'
import type { TenantVo } from '@/api/system/tenant/tenantTypes'

// 是否开启租户
const tenantEnabled = ref(false)
// 租户列表
const tenantList = ref<TenantVo[]>([])
// 租户选择器列
const tenantColumns = ref<{ value: string; label: string }[]>([])
// 当前选中的租户ID
const currentTenantId = ref('')

/**
 * 获取租户列表
 */
const fetchTenantList = async () => {
  try {
    const res = await getTenantList()

    if (res.data) {
      tenantEnabled.value = res.data.tenantEnabled
      tenantList.value = res.data.tenantList || []

      // 转换为选择器格式
      tenantColumns.value = tenantList.value.map(item => ({
        value: item.tenantId,
        label: item.companyName
      }))

      // 设置默认租户
      if (tenantList.value.length > 0) {
        // 优先使用缓存的租户ID
        const cachedTenantId = uni.getStorageSync('tenantId')
        if (cachedTenantId && tenantList.value.find(t => t.tenantId === cachedTenantId)) {
          currentTenantId.value = cachedTenantId
        } else {
          currentTenantId.value = tenantList.value[0].tenantId
        }
        formData.value.tenantId = currentTenantId.value
      }
    }
  } catch (error) {
    console.error('获取租户列表失败:', error)
  }
}

/**
 * 租户变更处理
 */
const handleTenantChange = (value: string) => {
  currentTenantId.value = value
  formData.value.tenantId = value

  // 缓存租户ID
  uni.setStorageSync('tenantId', value)

  // 租户变更后刷新验证码
  getCaptcha()
}

onMounted(() => {
  fetchTenantList()
})
</script>

<template>
  <!-- 租户选择器 -->
  <view class="tenant-selector" v-if="tenantEnabled && tenantColumns.length > 1">
    <wd-picker
      v-model="currentTenantId"
      :columns="tenantColumns"
      label="租户"
      label-width="70px"
      @confirm="handleTenantChange"
    />
  </view>
</template>

```

### 域名自动识别租户

```typescript
/**
 * 根据域名自动识别租户
 */
const autoDetectTenant = async () => {
  // #ifdef H5
  const hostname = window.location.hostname

  // 查找匹配的租户
  const matchedTenant = tenantList.value.find(tenant => {
    if (tenant.domain) {
      return hostname === tenant.domain || hostname.endsWith(`.${tenant.domain}`)
    }
    return false
  })

  if (matchedTenant) {
    currentTenantId.value = matchedTenant.tenantId
    formData.value.tenantId = matchedTenant.tenantId

    // 自动识别的租户,隐藏选择器
    tenantEnabled.value = false
  }
  // #endif
}
```

## 主题定制

### CSS 变量

登录页支持通过 CSS 变量进行主题定制:

```scss
/* 登录页主题变量 */
.login-container {
  /* 背景色 */
  --login-bg: var(--bg-base, #f5f6f7);
  --login-card-bg: var(--bg-level-1, #ffffff);

  /* 文字颜色 */
  --login-title-color: var(--text-primary, #333333);
  --login-desc-color: var(--text-secondary, #666666);
  --login-link-color: var(--color-primary, #1890ff);

  /* 按钮颜色 */
  --login-btn-bg: var(--color-primary, #1890ff);
  --login-btn-color: #ffffff;

  /* 边框颜色 */
  --login-border-color: var(--border-color, #e5e5e5);

  /* 圆角 */
  --login-card-radius: 24rpx;
  --login-input-radius: 16rpx;
  --login-btn-radius: 16rpx;

  /* 间距 */
  --login-padding: 48rpx;
  --login-gap: 32rpx;
}
```

### 完整样式

```scss
```

### 自定义主题示例

```vue
<template>
  <!-- 品牌色主题 -->
  <view class="login-container brand-theme">
    <!-- 登录表单内容 -->
  </view>
</template>

```

## API 接口

### 登录相关接口

```typescript
// src/api/system/auth/authApi.ts

import { http } from '@/utils/http'
import type {
  LoginBody,
  SmsLoginBody,
  MiniappLoginBody,
  MpLoginBody,
  SocialLoginBody,
  AuthTokenVo,
  CaptchaVo
} from './authTypes'

/**
 * 用户登录(账号密码)
 */
export const userLogin = (data: LoginBody) => {
  return http.post<AuthTokenVo>('/auth/login', data)
}

/**
 * 短信验证码登录
 */
export const smsLogin = (data: SmsLoginBody) => {
  return http.post<AuthTokenVo>('/auth/smsLogin', data)
}

/**
 * 小程序登录
 */
export const miniappLogin = (data: MiniappLoginBody) => {
  return http.post<AuthTokenVo>('/auth/miniapp/login', data)
}

/**
 * 公众号登录
 */
export const mpLogin = (data: MpLoginBody) => {
  return http.post<AuthTokenVo>('/auth/mp/login', data)
}

/**
 * 社交登录
 */
export const socialLogin = (data: SocialLoginBody) => {
  return http.post<AuthTokenVo>('/auth/social/login', data)
}

/**
 * 获取图片验证码
 */
export const imgCode = () => {
  return http.get<CaptchaVo>('/auth/code')
}

/**
 * 发送短信验证码
 */
export const smsCode = (data: { phoneNumber: string; type?: string }) => {
  return http.post('/auth/smsCode', data)
}

/**
 * 用户登出
 */
export const userLogout = () => {
  return http.post('/auth/logout')
}

/**
 * 获取社交登录授权地址
 */
export const socialBindUrl = (data: { source: string; redirectUri: string }) => {
  return http.get<{ authUrl: string }>('/auth/social/authUrl', { params: data })
}

/**
 * 获取微信授权地址
 */
export const getWechatAuthUrl = (data: { redirectUri: string; scope?: string }) => {
  return http.get<{ authUrl: string }>('/auth/wechat/authUrl', { params: data })
}

/**
 * 获取租户配置
 */
export const getTenantConfig = () => {
  return http.get<TenantConfigVo>('/auth/tenant/config')
}
```

### 类型定义

```typescript
// src/api/system/auth/authTypes.ts

/**
 * 基础登录参数
 */
interface BaseLoginBody {
  /** 租户ID */
  tenantId?: string
  /** 登录类型 */
  loginType?: string
  /** 客户端ID */
  clientId?: string
}

/**
 * 账号密码登录参数
 */
export interface LoginBody extends BaseLoginBody {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  code?: string
  /** 验证码UUID */
  uuid?: string
  loginType?: 'password'
}

/**
 * 短信登录参数
 */
export interface SmsLoginBody extends BaseLoginBody {
  /** 手机号 */
  phoneNumber: string
  /** 短信验证码 */
  smsCode: string
  loginType?: 'sms'
}

/**
 * 小程序登录参数
 */
export interface MiniappLoginBody extends BaseLoginBody {
  /** 微信登录code */
  code: string
  /** 加密数据(获取手机号时使用) */
  encryptedData?: string
  /** 加密向量 */
  iv?: string
  loginType?: 'miniapp'
}

/**
 * 公众号登录参数
 */
export interface MpLoginBody extends BaseLoginBody {
  /** 微信授权code */
  code: string
  loginType?: 'mp'
}

/**
 * 社交登录参数
 */
export interface SocialLoginBody extends BaseLoginBody {
  /** 授权code */
  code: string
  /** 状态码 */
  state?: string
  /** 来源 */
  source: string
  loginType?: 'social'
}

/**
 * 验证码响应
 */
export interface CaptchaVo {
  /** 是否开启验证码 */
  captchaEnabled: boolean
  /** 验证码图片Base64 */
  img?: string
  /** 验证码唯一标识 */
  uuid?: string
}

/**
 * 登录响应Token
 */
export interface AuthTokenVo {
  /** 访问令牌 */
  access_token: string
  /** 刷新令牌 */
  refresh_token?: string
  /** 令牌类型 */
  token_type?: string
  /** 过期时间(秒) */
  expires_in?: number
  /** 用户ID */
  userId?: number | string
  /** 客户端ID */
  clientId?: string
}

/**
 * 租户配置
 */
export interface TenantConfigVo {
  /** 是否开启租户 */
  tenantEnabled: boolean
  /** 租户列表 */
  tenantList?: TenantVo[]
}

/**
 * 租户信息
 */
export interface TenantVo {
  /** 租户ID */
  tenantId: string
  /** 公司名称 */
  companyName: string
  /** 租户域名 */
  domain?: string
  /** 状态 */
  status?: string
}
```

## 状态管理

### UserStore

```typescript
// src/stores/user.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthTokenVo, UserInfo } from '@/api/system/auth/authTypes'
import { getUserInfo as fetchUserInfo, userLogout } from '@/api/system/auth/authApi'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const tokenExpires = ref<number>(0)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && Date.now() < tokenExpires.value)
  const userId = computed(() => userInfo.value?.userId)
  const userName = computed(() => userInfo.value?.userName)
  const avatar = computed(() => userInfo.value?.avatar)

  /**
   * 设置Token
   */
  const setToken = (tokenVo: AuthTokenVo) => {
    token.value = tokenVo.access_token
    refreshToken.value = tokenVo.refresh_token || ''
    tokenExpires.value = Date.now() + (tokenVo.expires_in || 7200) * 1000

    // 持久化存储
    uni.setStorageSync('access_token', token.value)
    uni.setStorageSync('refresh_token', refreshToken.value)
    uni.setStorageSync('token_expires', tokenExpires.value)
  }

  /**
   * 清除Token
   */
  const clearToken = () => {
    token.value = ''
    refreshToken.value = ''
    tokenExpires.value = 0
    userInfo.value = null

    uni.removeStorageSync('access_token')
    uni.removeStorageSync('refresh_token')
    uni.removeStorageSync('token_expires')
  }

  /**
   * 获取用户信息
   */
  const getUserInfo = async () => {
    try {
      const res = await fetchUserInfo()
      if (res.data) {
        userInfo.value = res.data
      }
      return res.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  /**
   * 检查Token是否有效
   */
  const checkToken = async (): Promise<boolean> => {
    if (!token.value || Date.now() >= tokenExpires.value) {
      return false
    }

    try {
      await getUserInfo()
      return true
    } catch {
      return false
    }
  }

  /**
   * 登出
   */
  const logout = async () => {
    try {
      await userLogout()
    } catch (error) {
      console.error('登出接口调用失败:', error)
    } finally {
      clearToken()

      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/auth/login'
      })
    }
  }

  /**
   * 初始化(从本地存储恢复)
   */
  const init = () => {
    token.value = uni.getStorageSync('access_token') || ''
    refreshToken.value = uni.getStorageSync('refresh_token') || ''
    tokenExpires.value = uni.getStorageSync('token_expires') || 0
  }

  // 初始化
  init()

  return {
    // 状态
    token,
    refreshToken,
    userInfo,
    tokenExpires,
    // 计算属性
    isLoggedIn,
    userId,
    userName,
    avatar,
    // 方法
    setToken,
    clearToken,
    getUserInfo,
    checkToken,
    logout,
    init
  }
})
```

## 最佳实践

### 1. 安全性建议

**密码传输:**

```typescript
// ✅ 推荐: 使用HTTPS传输,前端对敏感数据加密
import CryptoJS from 'crypto-js'

const encryptPassword = (password: string, publicKey: string): string => {
  // 使用RSA公钥加密
  return CryptoJS.AES.encrypt(password, publicKey).toString()
}

// ❌ 不推荐: 明文传输密码
const loginBody = {
  username: 'admin',
  password: '123456' // 明文密码
}
```

**Token 存储:**

```typescript
// ✅ 推荐: 设置Token过期时间,使用RefreshToken机制
const setToken = (tokenVo: AuthTokenVo) => {
  // 存储访问令牌
  uni.setStorageSync('access_token', tokenVo.access_token)
  // 存储刷新令牌(用于无感刷新)
  uni.setStorageSync('refresh_token', tokenVo.refresh_token)
  // 存储过期时间
  uni.setStorageSync('token_expires', Date.now() + tokenVo.expires_in * 1000)
}

// ❌ 不推荐: 永久存储Token,无过期机制
uni.setStorageSync('token', tokenVo.access_token)
```

### 2. 用户体验优化

**输入优化:**

```vue
<template>
  <!-- ✅ 推荐: 使用合适的输入类型和键盘 -->
  <wd-input
    v-model="formData.phoneNumber"
    type="number"
    inputmode="numeric"
    maxlength="11"
    placeholder="请输入手机号"
  />

  <!-- ✅ 推荐: 密码显示/隐藏切换 -->
  <wd-input
    v-model="formData.password"
    :type="showPassword ? 'text' : 'password'"
    placeholder="请输入密码"
  >
    <template #suffix>
      <wd-icon
        :name="showPassword ? 'eye' : 'eye-slash'"
        @click="showPassword = !showPassword"
      />
    </template>
  </wd-input>
</template>
```

**加载状态:**

```typescript
// ✅ 推荐: 显示加载状态,禁用重复提交
const handleLogin = async () => {
  if (loading.value) return // 防止重复提交

  loading.value = true
  try {
    await doLogin()
  } finally {
    loading.value = false
  }
}
```

### 3. 错误处理

```typescript
// ✅ 推荐: 详细的错误处理和用户提示
const handleLogin = async () => {
  try {
    const res = await userLogin(formData.value)
    // 成功处理
  } catch (error: any) {
    // 刷新验证码
    await getCaptcha()

    // 根据错误类型给出不同提示
    const errorCode = error.code || error.status
    const errorMap: Record<string, string> = {
      'A0201': '用户名或密码错误',
      'A0202': '验证码错误',
      'A0203': '账号已被锁定,请稍后重试',
      'A0204': '验证码已过期',
      'A0301': '账号不存在',
      'A0302': '账号已被禁用'
    }

    const message = errorMap[errorCode] || error.message || '登录失败,请重试'

    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }
}
```

### 4. 多端适配

```typescript
// ✅ 推荐: 根据平台显示不同的登录方式
import { isMp, isH5, isApp, isWechatOfficialH5 } from '@/utils/platform'

const loginMethods = computed(() => {
  const methods = ['password', 'sms']

  // 小程序环境添加小程序登录
  if (isMp()) {
    methods.push('miniapp')
  }

  // 微信公众号H5添加公众号登录
  if (isWechatOfficialH5()) {
    methods.push('wechat')
  }

  // App环境添加第三方登录
  if (isApp()) {
    methods.push('social')
  }

  return methods
})
```

## 常见问题

### 1. 验证码图片不显示

**问题原因:**
- 验证码接口返回的图片格式不正确
- Base64 编码问题
- 网络请求失败

**解决方案:**

```typescript
const getCaptcha = async () => {
  try {
    const res = await imgCode()

    if (res.data?.captchaEnabled && res.data?.img) {
      // 确保 Base64 前缀正确
      const img = res.data.img
      if (img.startsWith('data:image')) {
        captchaImg.value = img
      } else {
        captchaImg.value = `data:image/png;base64,${img}`
      }
      captchaUuid.value = res.data.uuid || ''
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    // 显示占位图或重试按钮
    captchaImg.value = '/static/images/captcha-error.png'
  }
}
```

### 2. 小程序登录失败

**问题原因:**
- `uni.login` 调用失败
- 后端 session_key 解密失败
- 小程序 AppId 配置错误

**解决方案:**

```typescript
const handleMiniappLogin = async () => {
  try {
    // 确保在小程序环境
    // #ifdef MP-WEIXIN
    const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          if (res.code) {
            resolve(res)
          } else {
            reject(new Error(res.errMsg))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg))
        }
      })
    })

    // 继续登录流程...
    // #endif
  } catch (error: any) {
    console.error('小程序登录失败:', error)

    // 检查错误类型
    if (error.message?.includes('session_key')) {
      uni.showToast({
        title: '登录凭证已过期,请重试',
        icon: 'none'
      })
    } else {
      uni.showToast({
        title: '登录失败,请检查网络',
        icon: 'none'
      })
    }
  }
}
```

### 3. 记住密码功能在某些平台不生效

**问题原因:**
- 小程序存储容量限制
- 浏览器隐私模式限制
- Storage API 调用失败

**解决方案:**

```typescript
/**
 * 安全的存储封装
 */
const safeStorage = {
  set(key: string, value: any): boolean {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value)
      uni.setStorageSync(key, data)
      return true
    } catch (error) {
      console.error('存储失败:', error)
      return false
    }
  },

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const data = uni.getStorageSync(key)
      if (!data) return defaultValue ?? null

      try {
        return JSON.parse(data) as T
      } catch {
        return data as T
      }
    } catch (error) {
      console.error('读取失败:', error)
      return defaultValue ?? null
    }
  },

  remove(key: string): boolean {
    try {
      uni.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('删除失败:', error)
      return false
    }
  }
}

// 使用安全存储
const saveRememberInfo = () => {
  const success = safeStorage.set(REMEMBER_KEY, {
    username: formData.value.username,
    password: encryptPassword(formData.value.password),
    rememberMe: true
  })

  if (!success) {
    uni.showToast({
      title: '无法保存登录信息',
      icon: 'none'
    })
  }
}
```

### 4. Token 过期后无法自动刷新

**问题原因:**
- RefreshToken 机制未实现
- 请求拦截器配置问题
- 并发请求导致多次刷新

**解决方案:**

```typescript
// utils/http.ts - 请求拦截器中实现Token刷新

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

// 将请求加入等待队列
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

// 通知所有等待的请求
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

// 响应拦截器
http.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Token过期(401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 正在刷新,将请求加入队列
        return new Promise(resolve => {
          subscribeTokenRefresh(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(http(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const userStore = useUserStore()
        const newToken = await userStore.refreshAccessToken()

        if (newToken) {
          onTokenRefreshed(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return http(originalRequest)
        }
      } catch (refreshError) {
        // 刷新失败,跳转登录
        const userStore = useUserStore()
        userStore.logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

### 5. 公众号授权后页面空白

**问题原因:**
- 授权回调URL配置错误
- code 参数解析失败
- 页面重复渲染

**解决方案:**

```typescript
// pages/auth/login.vue

onLoad(async () => {
  // 检查是否是授权回调
  const code = getUrlParam('code')
  const state = getUrlParam('state')

  if (code) {
    // 是授权回调,执行登录
    await handleMpLogin()

    // 清除URL参数,防止重复登录
    // #ifdef H5
    const cleanUrl = removeUrlParams(window.location.href, ['code', 'state'])
    window.history.replaceState({}, document.title, cleanUrl)
    // #endif
  } else {
    // 正常加载登录页
    await initLoginPage()
  }
})

/**
 * 移除URL参数
 */
const removeUrlParams = (url: string, params: string[]): string => {
  const urlObj = new URL(url)
  params.forEach(param => urlObj.searchParams.delete(param))
  return urlObj.toString()
}
```

## 完整代码示例

```vue
<!-- pages/auth/login.vue -->
<template>
  <view class="login-container">
    <!-- 顶部Logo -->
    <view class="login-header">
      <image class="login-logo" src="/static/logo.png" mode="aspectFit" />
      <text class="login-title">RuoYi Plus</text>
      <text class="login-desc">企业级快速开发框架</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <wd-form ref="formRef" :model="formData" :rules="formRules">
        <!-- 租户选择 -->
        <view v-if="tenantEnabled && tenantColumns.length > 1" class="form-item">
          <wd-picker
            v-model="formData.tenantId"
            :columns="tenantColumns"
            label="租户"
            label-width="70px"
          />
        </view>

        <!-- 登录方式切换 -->
        <view class="login-tabs">
          <view
            v-for="tab in loginTabs"
            :key="tab.value"
            class="login-tab"
            :class="{ active: currentLoginType === tab.value }"
            @click="currentLoginType = tab.value"
          >
            {{ tab.label }}
          </view>
        </view>

        <!-- 账号密码登录 -->
        <view v-if="currentLoginType === 'password'" class="login-fields">
          <wd-cell-group>
            <wd-form-item prop="username">
              <wd-input
                v-model="formData.username"
                placeholder="请输入用户名"
                prefix-icon="user"
                clearable
              />
            </wd-form-item>
          </wd-cell-group>

          <wd-cell-group>
            <wd-form-item prop="password">
              <wd-input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                prefix-icon="lock"
                clearable
              >
                <template #suffix>
                  <wd-icon
                    :name="showPassword ? 'eye' : 'eye-slash'"
                    size="40rpx"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </wd-input>
            </wd-form-item>
          </wd-cell-group>

          <view v-if="captchaEnabled" class="captcha-row">
            <wd-cell-group class="captcha-input">
              <wd-form-item prop="code">
                <wd-input
                  v-model="formData.code"
                  placeholder="请输入验证码"
                  prefix-icon="shield"
                  clearable
                  maxlength="4"
                />
              </wd-form-item>
            </wd-cell-group>
            <view class="captcha-image" @click="getCaptcha">
              <image v-if="captchaImg" :src="captchaImg" mode="aspectFit" />
              <text v-else>加载中</text>
            </view>
          </view>
        </view>

        <!-- 短信登录 -->
        <view v-if="currentLoginType === 'sms'" class="login-fields">
          <wd-cell-group>
            <wd-form-item prop="phoneNumber">
              <wd-input
                v-model="formData.phoneNumber"
                placeholder="请输入手机号"
                prefix-icon="phone"
                type="number"
                maxlength="11"
                clearable
              />
            </wd-form-item>
          </wd-cell-group>

          <view class="sms-row">
            <wd-cell-group class="sms-input">
              <wd-form-item prop="smsCode">
                <wd-input
                  v-model="formData.smsCode"
                  placeholder="请输入验证码"
                  prefix-icon="shield"
                  type="number"
                  maxlength="6"
                  clearable
                />
              </wd-form-item>
            </wd-cell-group>
            <wd-button
              size="small"
              :disabled="smsDisabled"
              @click="sendSmsCode"
            >
              {{ smsButtonText }}
            </wd-button>
          </view>
        </view>

        <!-- 记住密码 -->
        <view v-if="currentLoginType === 'password'" class="login-options">
          <wd-checkbox v-model="rememberMe" size="small">记住密码</wd-checkbox>
          <text class="forget-link" @click="handleForgetPassword">忘记密码?</text>
        </view>

        <!-- 登录按钮 -->
        <wd-button
          type="primary"
          block
          :loading="loading"
          class="login-btn"
          @click="handleLogin"
        >
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
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' }
  ]
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

// 短信按钮文字
const smsButtonText = computed(() => {
  return smsCountdown.value > 0 ? `${smsCountdown.value}s` : '获取验证码'
})

// 短信按钮禁用
const smsDisabled = computed(() => {
  return smsCountdown.value > 0 || !formData.value.phoneNumber
})

// 是否显示社交登录
const showSocialLogin = computed(() => {
  // H5环境显示社交登录
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
})

// 社交登录列表
const socialList = [
  { type: 'wechat', icon: 'wechat', color: '#07c160' }
]

// 是否开启注册
const registerEnabled = ref(true)

/**
 * 获取验证码
 */
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

/**
 * 获取租户配置
 */
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

/**
 * 发送短信验证码
 */
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

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!agreeTerms.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  // 验证表单
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

      // 保存记住密码
      if (rememberMe.value && currentLoginType.value === 'password') {
        saveRememberInfo()
      }

      uni.showToast({ title: '登录成功', icon: 'success' })

      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
    }
  } catch (error: any) {
    await getCaptcha()
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/**
 * 保存记住密码信息
 */
const saveRememberInfo = () => {
  uni.setStorageSync('login_remember', {
    username: formData.value.username,
    password: btoa(formData.value.password),
    rememberMe: true
  })
}

/**
 * 加载记住的登录信息
 */
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

/**
 * 处理忘记密码
 */
const handleForgetPassword = () => {
  uni.navigateTo({ url: '/pages/auth/forget-password' })
}

/**
 * 处理社交登录
 */
const handleSocialLogin = (type: string) => {
  uni.showToast({ title: '暂未开放', icon: 'none' })
}

/**
 * 跳转用户协议
 */
const goToTerms = () => {
  uni.navigateTo({ url: '/pages/common/terms' })
}

/**
 * 跳转隐私政策
 */
const goToPrivacy = () => {
  uni.navigateTo({ url: '/pages/common/privacy' })
}

/**
 * 跳转注册
 */
const goToRegister = () => {
  uni.navigateTo({ url: '/pages/auth/register' })
}

// 页面加载
onLoad(async () => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    uni.switchTab({ url: '/pages/index/index' })
    return
  }

  // 加载记住的登录信息
  loadRememberInfo()

  // 获取租户配置
  await getTenant()

  // 获取验证码
  await getCaptcha()
})

// 清除定时器
onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer)
    smsTimer = null
  }
})
</script>

```

## 总结

登录页是移动端应用的核心页面之一,本文档详细介绍了:

1. **页面结构** - 顶部Logo、表单区域、第三方登录、底部区域的布局设计
2. **数据结构** - 表单数据、验证码数据、登录响应等类型定义
3. **表单验证** - 完整的前端表单验证规则和实现
4. **验证码功能** - 图片验证码和短信验证码的实现
5. **记住密码** - 基于本地存储的记住密码功能
6. **多种登录方式** - 账号密码、短信、小程序、公众号、社交登录
7. **自动登录** - 小程序和公众号环境的自动登录机制
8. **多租户支持** - 租户选择器和域名自动识别
9. **主题定制** - CSS变量和多套主题样式
10. **最佳实践** - 安全性、用户体验、错误处理、多端适配
11. **常见问题** - 典型问题的原因分析和解决方案

通过本文档,开发者可以快速理解和定制登录页面功能,满足各种业务场景需求。
