# 认证接口

## 介绍

认证接口(authApi)是RuoYi-Plus-UniApp移动端应用的核心API模块,负责处理用户身份认证、授权验证、会话管理等安全相关功能。该模块提供了完整的用户认证解决方案,包括传统的用户名密码登录、短信验证码登录、图形验证码验证、第三方社交登录绑定等多种认证方式,并集成了多租户系统配置、RSA加密传输、Token自动管理等企业级安全特性。

**核心特性:**

- **多种认证方式** - 支持用户名密码登录、短信验证码登录、第三方社交登录等多种认证方式
- **安全加密传输** - 敏感数据(如密码)使用RSA非对称加密,确保传输安全
- **验证码防护** - 提供图形验证码和短信验证码,有效防止暴力破解和机器人攻击
- **Token自动管理** - 自动处理Token的存储、刷新、过期检测,简化开发流程
- **多租户支持** - 集成多租户配置,支持SaaS模式的租户隔离
- **社交登录集成** - 支持微信、QQ、支付宝等第三方平台的社交登录绑定
- **会话状态同步** - 自动同步登录状态到Pinia Store,实现全局状态管理
- **错误统一处理** - 统一的错误处理机制,提供友好的错误提示
- **请求配置灵活** - 支持自定义请求头、超时时间、重复提交控制等配置
- **TypeScript类型安全** - 完整的TypeScript类型定义,提供智能提示和类型检查

参考: src/api/system/auth/authApi.ts:1-167

## API列表

### 1. userLogin - 用户登录

用户登录接口,支持用户名密码登录。该接口会自动使用RSA加密传输密码,确保安全性。登录成功后返回访问令牌(accessToken)和刷新令牌(refreshToken),并自动存储到缓存中。

**请求方法:** POST

**请求路径:** `/auth/userLogin`

**请求参数:**

```typescript
interface LoginRequest {
  /** 用户名 */
  username: string
  /** 密码(明文,将自动加密) */
  password: string
  /** 图形验证码(可选) */
  captcha?: string
  /** 验证码UUID(可选) */
  uuid?: string
  /** 租户ID(多租户模式下必填) */
  tenantId?: string
}
```

**响应数据:**

```typescript
interface AuthTokenVo {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken: string
  /** 令牌类型,默认为 Bearer */
  tokenType: string
  /** 访问令牌过期时间(秒) */
  expiresIn: number
  /** 用户ID */
  userId: number
  /** 用户名 */
  username: string
  /** 用户昵称 */
  nickname: string
  /** 用户头像 */
  avatar?: string
}
```

**使用示例:**

```vue
<template>
  <view class="login-page">
    <view class="login-form">
      <wd-input
        v-model="formData.username"
        label="用户名"
        placeholder="请输入用户名"
        required
      />

      <wd-input
        v-model="formData.password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        required
      />

      <view class="captcha-row" v-if="captchaRequired">
        <wd-input
          v-model="formData.captcha"
          label="验证码"
          placeholder="请输入验证码"
        />
        <image
          :src="captchaImage"
          class="captcha-image"
          @click="refreshCaptcha"
        />
      </view>

      <wd-button
        type="primary"
        block
        :loading="loading"
        @click="handleLogin"
      >
        登录
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { userLogin, imgCode } from '@/api/system/auth/authApi'
import { useUserStore } from '@/stores/user'
import { to } from '@/utils/to'

const userStore = useUserStore()

const loading = ref(false)
const captchaRequired = ref(true)
const captchaImage = ref('')

const formData = reactive({
  username: '',
  password: '',
  captcha: '',
  uuid: '',
  tenantId: ''
})

// 获取图形验证码
const getCaptcha = async () => {
  const [error, data] = await to(imgCode())
  if (error) {
    console.error('获取验证码失败:', error)
    return
  }

  captchaImage.value = `data:image/png;base64,${data.img}`
  formData.uuid = data.uuid
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

// 登录处理
const handleLogin = async () => {
  // 表单验证
  if (!formData.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }

  if (!formData.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  if (captchaRequired.value && !formData.captcha) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }

  loading.value = true

  // 调用登录接口
  const [error, data] = await to(userLogin({
    username: formData.username,
    password: formData.password,
    captcha: formData.captcha,
    uuid: formData.uuid,
    tenantId: formData.tenantId
  }))

  loading.value = false

  if (error) {
    // 登录失败,刷新验证码
    if (captchaRequired.value) {
      refreshCaptcha()
    }
    uni.showToast({
      title: error.msg || '登录失败',
      icon: 'none'
    })
    return
  }

  // 登录成功
  uni.showToast({
    title: '登录成功',
    icon: 'success'
  })

  // 存储用户信息到Store
  await userStore.setUserInfo(data)

  // 跳转到首页
  uni.switchTab({
    url: '/pages/index/index'
  })
}

onMounted(() => {
  // 页面加载时获取验证码
  if (captchaRequired.value) {
    getCaptcha()
  }
})
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  padding: 40rpx;
  background-color: #f8f8f8;
}

.login-form {
  margin-top: 120rpx;
  padding: 40rpx;
  background-color: white;
  border-radius: 16rpx;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 20rpx;

  .captcha-image {
    width: 200rpx;
    height: 80rpx;
    cursor: pointer;
  }
}
</style>
```

**技术实现:**

- 密码自动RSA加密,无需手动调用加密函数
- 使用`withHeaders`函数配置请求头,设置`auth: false`(无需Token)和`isEncrypt: true`(启用加密)
- `repeatSubmit: false`允许快速重试登录
- 登录成功后Token会自动存储到缓存中

参考: src/api/system/auth/authApi.ts:18-31

### 2. userRegister - 用户注册

用户注册接口,创建新用户账号。支持手机号注册和用户名注册两种方式,可配置是否需要短信验证码验证。

**请求方法:** POST

**请求路径:** `/auth/userRegister`

**请求参数:**

```typescript
interface RegisterRequest {
  /** 用户名 */
  username: string
  /** 密码(明文,将自动加密) */
  password: string
  /** 确认密码 */
  confirmPassword: string
  /** 手机号 */
  phone?: string
  /** 短信验证码 */
  smsCode?: string
  /** 邮箱 */
  email?: string
  /** 用户昵称 */
  nickname?: string
  /** 租户ID(多租户模式下必填) */
  tenantId?: string
}
```

**响应数据:**

```typescript
interface RegisterResult {
  /** 注册是否成功 */
  success: boolean
  /** 用户ID */
  userId: number
  /** 提示信息 */
  message: string
}
```

**使用示例:**

```vue
<template>
  <view class="register-page">
    <wd-cell-group title="注册信息">
      <wd-input
        v-model="formData.username"
        label="用户名"
        placeholder="请输入用户名"
        required
      />

      <wd-input
        v-model="formData.password"
        type="password"
        label="密码"
        placeholder="请输入密码(6-20位)"
        required
      />

      <wd-input
        v-model="formData.confirmPassword"
        type="password"
        label="确认密码"
        placeholder="请再次输入密码"
        required
      />

      <wd-input
        v-model="formData.phone"
        type="number"
        label="手机号"
        placeholder="请输入手机号"
      />

      <view class="sms-code-row">
        <wd-input
          v-model="formData.smsCode"
          label="验证码"
          placeholder="请输入短信验证码"
        />
        <wd-button
          size="small"
          :disabled="countdown > 0"
          @click="sendSmsCode"
        >
          {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
        </wd-button>
      </view>

      <wd-input
        v-model="formData.nickname"
        label="昵称"
        placeholder="请输入昵称(可选)"
      />
    </wd-cell-group>

    <view class="button-section">
      <wd-button
        type="primary"
        block
        :loading="loading"
        @click="handleRegister"
      >
        注册
      </wd-button>

      <wd-button
        block
        custom-style="margin-top: 16rpx"
        @click="goToLogin"
      >
        已有账号,去登录
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { userRegister, smsCode } from '@/api/system/auth/authApi'
import { isChinesePhoneNumber, isPassword } from '@/utils/validators'
import { to } from '@/utils/to'

const loading = ref(false)
const countdown = ref(0)
let timer: number | null = null

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  smsCode: '',
  nickname: '',
  tenantId: ''
})

// 发送短信验证码
const sendSmsCode = async () => {
  if (!formData.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }

  if (!isChinesePhoneNumber(formData.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  const [error] = await to(smsCode(formData.phone))

  if (error) {
    uni.showToast({
      title: error.msg || '发送失败',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '验证码已发送',
    icon: 'success'
  })

  // 开始倒计时
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      timer = null
    }
  }, 1000)
}

// 注册处理
const handleRegister = async () => {
  // 表单验证
  if (!formData.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }

  if (formData.username.length < 4 || formData.username.length > 20) {
    uni.showToast({ title: '用户名长度为4-20位', icon: 'none' })
    return
  }

  if (!formData.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  if (!isPassword(formData.password, { minLength: 6, maxLength: 20 })) {
    uni.showToast({
      title: '密码长度为6-20位,且包含字母和数字',
      icon: 'none'
    })
    return
  }

  if (formData.password !== formData.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  if (formData.phone && !isChinesePhoneNumber(formData.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  if (formData.phone && !formData.smsCode) {
    uni.showToast({ title: '请输入短信验证码', icon: 'none' })
    return
  }

  loading.value = true

  const [error, data] = await to(userRegister({
    username: formData.username,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    phone: formData.phone,
    smsCode: formData.smsCode,
    nickname: formData.nickname,
    tenantId: formData.tenantId
  }))

  loading.value = false

  if (error) {
    uni.showToast({
      title: error.msg || '注册失败',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '注册成功',
    content: '账号注册成功,请登录',
    showCancel: false,
    success: () => {
      goToLogin()
    }
  })
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;
}

.sms-code-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

**技术实现:**

- 密码自动RSA加密
- 短信验证码倒计时防止频繁发送
- 完整的表单验证逻辑
- 使用validators工具函数验证手机号和密码强度

参考: src/api/system/auth/authApi.ts:33-46

### 3. userLogout - 用户登出

用户登出接口,清除服务端会话和本地缓存的Token信息。

**请求方法:** POST

**请求路径:** `/auth/userLogout`

**请求参数:** 无

**响应数据:**

```typescript
interface LogoutResult {
  /** 登出是否成功 */
  success: boolean
  /** 提示信息 */
  message: string
}
```

**使用示例:**

```vue
<template>
  <view class="user-center">
    <view class="user-info">
      <image :src="userInfo.avatar" class="avatar" />
      <text class="nickname">{{ userInfo.nickname }}</text>
    </view>

    <wd-button type="danger" block @click="handleLogout">
      退出登录
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { userLogout } from '@/api/system/auth/authApi'
import { useUserStore } from '@/stores/user'
import { to } from '@/utils/to'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗?',
    success: async (res) => {
      if (!res.confirm) return

      // 调用登出接口
      const [error] = await to(userLogout())

      if (error) {
        console.error('登出失败:', error)
      }

      // 无论接口是否成功,都清除本地数据
      await userStore.logout()

      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })

      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.user-center {
  padding: 40rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;

  .avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    margin-bottom: 20rpx;
  }

  .nickname {
    font-size: 32rpx;
    font-weight: bold;
  }
}
</style>
```

**技术实现:**

- 登出后自动清除本地Token和用户信息
- 即使接口调用失败也会清除本地数据,确保安全性
- 使用`uni.reLaunch`跳转到登录页,清除页面栈

参考: src/api/system/auth/authApi.ts:48-54

### 4. updateUserProfile - 更新用户资料

更新当前登录用户的个人资料信息。

**请求方法:** PUT

**请求路径:** `/auth/updateUserProfile`

**请求参数:**

```typescript
interface UpdateProfileRequest {
  /** 用户昵称 */
  nickname?: string
  /** 用户头像URL */
  avatar?: string
  /** 手机号 */
  phone?: string
  /** 邮箱 */
  email?: string
  /** 性别(0-未知,1-男,2-女) */
  sex?: 0 | 1 | 2
  /** 生日 */
  birthday?: string
  /** 个性签名 */
  signature?: string
}
```

**响应数据:**

```typescript
interface UpdateProfileResult {
  /** 更新是否成功 */
  success: boolean
  /** 提示信息 */
  message: string
}
```

**使用示例:**

```vue
<template>
  <view class="profile-edit-page">
    <wd-cell-group title="基本信息">
      <wd-cell title="头像" is-link @click="chooseAvatar">
        <template #value>
          <image :src="formData.avatar" class="avatar-preview" />
        </template>
      </wd-cell>

      <wd-input
        v-model="formData.nickname"
        label="昵称"
        placeholder="请输入昵称"
      />

      <wd-picker
        v-model="formData.sex"
        label="性别"
        :columns="sexOptions"
      />

      <wd-datetime-picker
        v-model="formData.birthday"
        type="date"
        label="生日"
      />

      <wd-input
        v-model="formData.phone"
        type="number"
        label="手机号"
        placeholder="请输入手机号"
      />

      <wd-input
        v-model="formData.email"
        label="邮箱"
        placeholder="请输入邮箱"
      />

      <wd-textarea
        v-model="formData.signature"
        label="个性签名"
        placeholder="请输入个性签名"
        maxlength="100"
      />
    </wd-cell-group>

    <view class="button-section">
      <wd-button
        type="primary"
        block
        :loading="loading"
        @click="handleSave"
      >
        保存
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { updateUserProfile } from '@/api/system/auth/authApi'
import { uploadFile } from '@/api/system/file/fileApi'
import { useUserStore } from '@/stores/user'
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'
import { to } from '@/utils/to'

const userStore = useUserStore()
const loading = ref(false)

const sexOptions = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

const formData = reactive({
  nickname: '',
  avatar: '',
  phone: '',
  email: '',
  sex: 0,
  birthday: '',
  signature: ''
})

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      // 上传图片
      uni.showLoading({ title: '上传中...' })

      const [error, data] = await to(uploadFile(tempFilePath, 'avatar'))

      uni.hideLoading()

      if (error) {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        return
      }

      formData.avatar = data.url
      uni.showToast({
        title: '上传成功',
        icon: 'success'
      })
    }
  })
}

// 保存资料
const handleSave = async () => {
  // 表单验证
  if (formData.phone && !isChinesePhoneNumber(formData.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  if (formData.email && !isEmail(formData.email)) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return
  }

  loading.value = true

  const [error] = await to(updateUserProfile({
    nickname: formData.nickname,
    avatar: formData.avatar,
    phone: formData.phone,
    email: formData.email,
    sex: formData.sex,
    birthday: formData.birthday,
    signature: formData.signature
  }))

  loading.value = false

  if (error) {
    uni.showToast({
      title: error.msg || '保存失败',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })

  // 更新Store中的用户信息
  await userStore.getUserInfo()

  // 返回上一页
  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}

// 初始化表单数据
onMounted(() => {
  const userInfo = userStore.userInfo
  formData.nickname = userInfo.nickname || ''
  formData.avatar = userInfo.avatar || ''
  formData.phone = userInfo.phone || ''
  formData.email = userInfo.email || ''
  formData.sex = userInfo.sex || 0
  formData.birthday = userInfo.birthday || ''
  formData.signature = userInfo.signature || ''
})
</script>

<style lang="scss" scoped>
.profile-edit-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.avatar-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

**技术实现:**

- 集成文件上传功能,支持头像更新
- 使用validators工具函数验证邮箱和手机号
- 更新成功后自动刷新Store中的用户信息

参考: src/api/system/auth/authApi.ts:56-68

### 5. imgCode - 获取图形验证码

获取图形验证码,用于登录、注册等场景的安全验证。

**请求方法:** GET

**请求路径:** `/auth/imgCode`

**请求参数:** 无

**响应数据:**

```typescript
interface CaptchaVo {
  /** 验证码图片(Base64编码) */
  img: string
  /** 验证码唯一标识 */
  uuid: string
  /** 验证码有效期(秒) */
  expireTime: number
}
```

**使用示例:**

```vue
<template>
  <view class="captcha-container">
    <wd-input
      v-model="captchaValue"
      label="验证码"
      placeholder="请输入验证码"
    />

    <image
      :src="captchaImage"
      class="captcha-image"
      @click="refreshCaptcha"
    />

    <text class="refresh-tip" @click="refreshCaptcha">
      看不清?点击刷新
    </text>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { imgCode } from '@/api/system/auth/authApi'
import { to } from '@/utils/to'

const captchaValue = ref('')
const captchaImage = ref('')
const captchaUuid = ref('')

// 获取验证码
const getCaptcha = async () => {
  const [error, data] = await to(imgCode())

  if (error) {
    uni.showToast({
      title: '获取验证码失败',
      icon: 'none'
    })
    return
  }

  // 转换Base64图片
  captchaImage.value = `data:image/png;base64,${data.img}`
  captchaUuid.value = data.uuid

  console.log(`验证码有效期: ${data.expireTime}秒`)
}

// 刷新验证码
const refreshCaptcha = () => {
  captchaValue.value = ''
  getCaptcha()
}

// 对外暴露方法和数据
defineExpose({
  captchaValue,
  captchaUuid,
  refreshCaptcha
})

onMounted(() => {
  getCaptcha()
})
</script>

<style lang="scss" scoped>
.captcha-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.captcha-image {
  width: 200rpx;
  height: 80rpx;
  cursor: pointer;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
}

.refresh-tip {
  font-size: 24rpx;
  color: #999;
  text-decoration: underline;
  cursor: pointer;
}
</style>
```

**技术实现:**

- 图片使用Base64编码,无需额外请求
- 超时时间设置为20秒,避免验证码加载超时
- 验证码UUID用于服务端验证

参考: src/api/system/auth/authApi.ts:70-75

### 6. smsCode - 发送短信验证码

发送短信验证码到指定手机号,用于注册、登录、修改密码等场景。

**请求方法:** GET

**请求路径:** `/auth/smsCode`

**请求参数:**

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| phone | 手机号 | `string` | 是 |

**响应数据:**

```typescript
interface SmsCodeResult {
  /** 是否发送成功 */
  success: boolean
  /** 提示信息 */
  message: string
  /** 验证码有效期(秒) */
  expireTime?: number
}
```

**使用示例:**

```vue
<template>
  <view class="sms-code-section">
    <wd-input
      v-model="phone"
      type="number"
      label="手机号"
      placeholder="请输入手机号"
    />

    <wd-button
      type="primary"
      :disabled="countdown > 0"
      @click="sendCode"
    >
      {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
    </wd-button>

    <wd-input
      v-model="code"
      label="验证码"
      placeholder="请输入验证码"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { smsCode } from '@/api/system/auth/authApi'
import { isChinesePhoneNumber } from '@/utils/validators'
import { to } from '@/utils/to'

const phone = ref('')
const code = ref('')
const countdown = ref(0)

let timer: number | null = null

// 发送验证码
const sendCode = async () => {
  // 验证手机号
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }

  if (!isChinesePhoneNumber(phone.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  // 调用发送接口
  const [error, data] = await to(smsCode(phone.value))

  if (error) {
    uni.showToast({
      title: error.msg || '发送失败',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '验证码已发送',
    icon: 'success'
  })

  // 开始倒计时(默认60秒)
  countdown.value = data?.expireTime || 60

  if (timer) {
    clearInterval(timer)
  }

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
  }
})

// 对外暴露
defineExpose({
  phone,
  code
})
</script>

<style lang="scss" scoped>
.sms-code-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
```

**技术实现:**

- 倒计时防止频繁发送
- 手机号格式验证
- 自动清理定时器

参考: src/api/system/auth/authApi.ts:77-82

### 7. socialBindUrl - 获取社交登录绑定URL

获取第三方社交平台的授权登录URL,用于跳转到第三方平台进行授权。

**请求方法:** GET

**请求路径:** `/auth/socialBindUrl/{source}`

**请求参数:**

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| source | 社交平台类型(wechat/qq/alipay等) | `string` | 是 |

**响应数据:**

```typescript
interface SocialBindUrlResult {
  /** 授权URL */
  authorizeUrl: string
  /** 状态码(用于回调验证) */
  state: string
}
```

**使用示例:**

```vue
<template>
  <view class="social-login">
    <text class="title">第三方登录</text>

    <view class="social-buttons">
      <view
        class="social-item"
        v-for="item in socialList"
        :key="item.source"
        @click="handleSocialLogin(item.source)"
      >
        <wd-icon :name="item.icon" size="48" />
        <text>{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { socialBindUrl } from '@/api/system/auth/authApi'
import { to } from '@/utils/to'

const socialList = ref([
  { source: 'wechat', name: '微信', icon: 'wechat' },
  { source: 'qq', name: 'QQ', icon: 'qq' },
  { source: 'alipay', name: '支付宝', icon: 'alipay' }
])

// 社交登录
const handleSocialLogin = async (source: string) => {
  uni.showLoading({ title: '获取授权中...' })

  const [error, data] = await to(socialBindUrl(source))

  uni.hideLoading()

  if (error) {
    uni.showToast({
      title: '获取授权失败',
      icon: 'none'
    })
    return
  }

  // 保存state到缓存,用于回调验证
  uni.setStorageSync(`social_state_${source}`, data.state)

  // H5端直接跳转
  // #ifdef H5
  window.location.href = data.authorizeUrl
  // #endif

  // 小程序端
  // #ifdef MP-WEIXIN
  if (source === 'wechat') {
    uni.navigateTo({
      url: `/pages/webview/index?url=${encodeURIComponent(data.authorizeUrl)}`
    })
  }
  // #endif

  // APP端
  // #ifdef APP-PLUS
  plus.runtime.openURL(data.authorizeUrl)
  // #endif
}
</script>

<style lang="scss" scoped>
.social-login {
  padding: 40rpx;

  .title {
    font-size: 28rpx;
    color: #999;
    text-align: center;
    margin-bottom: 40rpx;
  }

  .social-buttons {
    display: flex;
    justify-content: center;
    gap: 60rpx;
  }

  .social-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    cursor: pointer;

    text {
      font-size: 24rpx;
      color: #666;
    }
  }
}
</style>
```

**技术实现:**

- 支持多平台(H5、小程序、APP)跳转授权页
- 保存state用于回调验证,防止CSRF攻击
- 不同平台使用不同的跳转方式

参考: src/api/system/auth/authApi.ts:84-89

### 8. socialBind - 社交账号绑定回调

处理第三方社交平台授权回调,完成账号绑定或登录。

**请求方法:** POST

**请求路径:** `/auth/socialBind`

**请求参数:**

```typescript
interface SocialBindRequest {
  /** 社交平台类型 */
  source: string
  /** 授权码 */
  code: string
  /** 状态码(用于验证) */
  state: string
}
```

**响应数据:**

```typescript
interface SocialBindResult {
  /** 是否绑定成功 */
  success: boolean
  /** 是否为新用户(需要完善信息) */
  isNewUser: boolean
  /** Token信息(已绑定用户直接返回) */
  token?: AuthTokenVo
  /** 社交用户信息(新用户返回) */
  socialUserInfo?: {
    openId: string
    nickname: string
    avatar: string
  }
}
```

**使用示例:**

```vue
<template>
  <view class="social-callback">
    <wd-loading v-if="loading" type="ring">处理中...</wd-loading>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { socialBind } from '@/api/system/auth/authApi'
import { useUserStore } from '@/stores/user'
import { to } from '@/utils/to'

const userStore = useUserStore()
const loading = ref(true)

// 处理社交登录回调
const handleCallback = async () => {
  // 获取URL参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options

  const { code, state, source } = options

  if (!code || !state || !source) {
    uni.showToast({
      title: '授权参数缺失',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  // 验证state
  const savedState = uni.getStorageSync(`social_state_${source}`)
  if (state !== savedState) {
    uni.showToast({
      title: '授权验证失败',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  // 调用绑定接口
  const [error, data] = await to(socialBind({
    source,
    code,
    state
  }))

  loading.value = false

  if (error) {
    uni.showToast({
      title: error.msg || '绑定失败',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  // 清除保存的state
  uni.removeStorageSync(`social_state_${source}`)

  if (data.isNewUser) {
    // 新用户,跳转到完善信息页
    uni.redirectTo({
      url: `/pages/complete-profile/index?socialInfo=${encodeURIComponent(JSON.stringify(data.socialUserInfo))}`
    })
  } else {
    // 已绑定用户,直接登录
    await userStore.setUserInfo(data.token!)

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1000)
  }
}

onMounted(() => {
  handleCallback()
})
</script>

<style lang="scss" scoped>
.social-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
```

**技术实现:**

- 验证state防止CSRF攻击
- 区分新用户和已绑定用户
- 新用户需要跳转完善信息
- 已绑定用户直接登录

参考: src/api/system/auth/authApi.ts:91-103

### 9. socialUnbind - 解绑社交账号

解除与第三方社交账号的绑定关系。

**请求方法:** DELETE

**请求路径:** `/auth/socialUnbind/{source}`

**请求参数:**

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| source | 社交平台类型 | `string` | 是 |

**响应数据:**

```typescript
interface SocialUnbindResult {
  /** 是否解绑成功 */
  success: boolean
  /** 提示信息 */
  message: string
}
```

**使用示例:**

```vue
<template>
  <view class="social-bindings">
    <wd-cell-group title="已绑定账号">
      <wd-cell
        v-for="item in bindingList"
        :key="item.source"
        :title="item.name"
        :label="`已绑定: ${item.nickname}`"
      >
        <template #icon>
          <wd-icon :name="item.icon" size="32" />
        </template>

        <template #right-icon>
          <wd-button
            size="small"
            type="danger"
            @click="handleUnbind(item.source)"
          >
            解绑
          </wd-button>
        </template>
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { socialUnbind } from '@/api/system/auth/authApi'
import { getUserSocialBindings } from '@/api/system/user/userApi'
import { to } from '@/utils/to'

interface SocialBinding {
  source: string
  name: string
  icon: string
  nickname: string
  openId: string
  bindTime: string
}

const bindingList = ref<SocialBinding[]>([])

// 获取已绑定列表
const getBindings = async () => {
  const [error, data] = await to(getUserSocialBindings())

  if (error) {
    console.error('获取绑定列表失败:', error)
    return
  }

  bindingList.value = data
}

// 解绑
const handleUnbind = (source: string) => {
  uni.showModal({
    title: '确认解绑',
    content: '解绑后将无法使用该账号登录,确定要解绑吗?',
    success: async (res) => {
      if (!res.confirm) return

      uni.showLoading({ title: '解绑中...' })

      const [error] = await to(socialUnbind(source))

      uni.hideLoading()

      if (error) {
        uni.showToast({
          title: error.msg || '解绑失败',
          icon: 'none'
        })
        return
      }

      uni.showToast({
        title: '解绑成功',
        icon: 'success'
      })

      // 刷新列表
      getBindings()
    }
  })
}

onMounted(() => {
  getBindings()
})
</script>

<style lang="scss" scoped>
.social-bindings {
  padding: 20rpx;
}
</style>
```

**技术实现:**

- 解绑前二次确认
- 解绑成功后刷新绑定列表
- 使用DELETE方法符合RESTful规范

参考: src/api/system/auth/authApi.ts:105-110

### 10. getTenantConfig - 获取租户配置

获取多租户系统的租户配置信息,用于租户选择和配置。

**请求方法:** GET

**请求路径:** `/auth/getTenantConfig`

**请求参数:** 无

**响应数据:**

```typescript
interface TenantConfigVo {
  /** 是否启用多租户 */
  tenantEnabled: boolean
  /** 租户列表 */
  tenantList: Array<{
    /** 租户ID */
    tenantId: string
    /** 租户名称 */
    tenantName: string
    /** 租户Logo */
    logo?: string
    /** 租户域名 */
    domain?: string
  }>
  /** 默认租户ID */
  defaultTenantId?: string
}
```

**使用示例:**

```vue
<template>
  <view class="tenant-selector">
    <view v-if="tenantConfig.tenantEnabled">
      <wd-picker
        v-model="selectedTenant"
        label="选择租户"
        :columns="tenantOptions"
        @confirm="handleTenantChange"
      />
    </view>

    <view v-else>
      <text class="tip">单租户模式</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getTenantConfig } from '@/api/system/auth/authApi'
import { cache } from '@/utils/cache'
import { to } from '@/utils/to'

const tenantConfig = reactive({
  tenantEnabled: false,
  tenantList: [],
  defaultTenantId: ''
})

const selectedTenant = ref('')

// 租户选项
const tenantOptions = computed(() => {
  return tenantConfig.tenantList.map(item => ({
    label: item.tenantName,
    value: item.tenantId
  }))
})

// 获取租户配置
const loadTenantConfig = async () => {
  const [error, data] = await to(getTenantConfig())

  if (error) {
    console.error('获取租户配置失败:', error)
    return
  }

  Object.assign(tenantConfig, data)

  // 从缓存读取已选择的租户
  const cachedTenantId = cache.get<string>('tenantId')

  if (cachedTenantId && tenantConfig.tenantList.some(t => t.tenantId === cachedTenantId)) {
    selectedTenant.value = cachedTenantId
  } else if (tenantConfig.defaultTenantId) {
    selectedTenant.value = tenantConfig.defaultTenantId
  } else if (tenantConfig.tenantList.length > 0) {
    selectedTenant.value = tenantConfig.tenantList[0].tenantId
  }

  // 保存到缓存
  if (selectedTenant.value) {
    cache.set('tenantId', selectedTenant.value)
  }
}

// 租户切换
const handleTenantChange = (value: string) => {
  selectedTenant.value = value
  cache.set('tenantId', value)

  uni.showToast({
    title: '租户已切换',
    icon: 'success'
  })

  // 刷新页面或重新加载数据
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/index/index'
    })
  }, 1000)
}

onMounted(() => {
  loadTenantConfig()
})

// 对外暴露
defineExpose({
  selectedTenant,
  tenantConfig
})
</script>

<style lang="scss" scoped>
.tenant-selector {
  padding: 20rpx;
}

.tip {
  font-size: 24rpx;
  color: #999;
}
</style>
```

**技术实现:**

- 判断是否启用多租户模式
- 优先使用缓存的租户ID
- 租户切换后刷新应用
- 租户ID会在所有API请求中自动携带

参考: src/api/system/auth/authApi.ts:112-117

## 类型定义

### 完整类型定义

```typescript
/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户名 */
  username: string
  /** 密码(明文,将自动加密) */
  password: string
  /** 图形验证码 */
  captcha?: string
  /** 验证码UUID */
  uuid?: string
  /** 租户ID */
  tenantId?: string
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 确认密码 */
  confirmPassword: string
  /** 手机号 */
  phone?: string
  /** 短信验证码 */
  smsCode?: string
  /** 邮箱 */
  email?: string
  /** 昵称 */
  nickname?: string
  /** 租户ID */
  tenantId?: string
}

/**
 * 用户资料更新请求
 */
export interface UpdateProfileRequest {
  /** 昵称 */
  nickname?: string
  /** 头像URL */
  avatar?: string
  /** 手机号 */
  phone?: string
  /** 邮箱 */
  email?: string
  /** 性别(0-未知,1-男,2-女) */
  sex?: 0 | 1 | 2
  /** 生日 */
  birthday?: string
  /** 个性签名 */
  signature?: string
}

/**
 * 社交账号绑定请求
 */
export interface SocialBindRequest {
  /** 社交平台类型 */
  source: string
  /** 授权码 */
  code: string
  /** 状态码 */
  state: string
}

/**
 * 认证Token响应
 */
export interface AuthTokenVo {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken: string
  /** 令牌类型 */
  tokenType: string
  /** 过期时间(秒) */
  expiresIn: number
  /** 用户ID */
  userId: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 头像 */
  avatar?: string
}

/**
 * 图形验证码响应
 */
export interface CaptchaVo {
  /** 验证码图片(Base64) */
  img: string
  /** 验证码UUID */
  uuid: string
  /** 有效期(秒) */
  expireTime: number
}

/**
 * 租户配置响应
 */
export interface TenantConfigVo {
  /** 是否启用多租户 */
  tenantEnabled: boolean
  /** 租户列表 */
  tenantList: Array<{
    tenantId: string
    tenantName: string
    logo?: string
    domain?: string
  }>
  /** 默认租户ID */
  defaultTenantId?: string
}

/**
 * 社交登录URL响应
 */
export interface SocialBindUrlResult {
  /** 授权URL */
  authorizeUrl: string
  /** 状态码 */
  state: string
}

/**
 * 社交账号绑定响应
 */
export interface SocialBindResult {
  /** 是否成功 */
  success: boolean
  /** 是否新用户 */
  isNewUser: boolean
  /** Token信息 */
  token?: AuthTokenVo
  /** 社交用户信息 */
  socialUserInfo?: {
    openId: string
    nickname: string
    avatar: string
  }
}
```

参考: src/api/system/auth/authApi.ts:1-167

## 请求配置

### withHeaders 配置说明

authApi中使用`withHeaders`函数配置请求头和请求选项,常用配置项:

```typescript
/**
 * 请求头配置选项
 */
interface RequestHeaders {
  /** 是否需要认证Token(默认true) */
  auth?: boolean
  /** 是否启用加密传输(默认false) */
  isEncrypt?: boolean
  /** 是否防止重复提交(默认true) */
  repeatSubmit?: boolean
  /** 请求超时时间(毫秒,默认10000) */
  timeout?: number
  /** 是否显示Loading(默认true) */
  loading?: boolean
  /** 是否显示错误提示(默认true) */
  showError?: boolean
}
```

**使用示例:**

```typescript
// 登录接口 - 无需Token,启用加密,允许快速重试
export const userLogin = (data: LoginRequest): Result<AuthTokenVo> => {
  return http.post<AuthTokenVo>('/auth/userLogin', data, withHeaders({
    auth: false,           // 登录接口不需要Token
    isEncrypt: true,       // 密码需要加密
    repeatSubmit: false    // 允许快速重试
  }))
}

// 图形验证码 - 无需Token,较长超时时间
export const imgCode = (): Result<CaptchaVo> => {
  return http.get<CaptchaVo>('/auth/imgCode', {}, withHeaders({
    auth: false,           // 无需Token
    timeout: 20000         // 20秒超时
  }))
}

// 更新资料 - 需要Token,启用加密
export const updateUserProfile = (data: UpdateProfileRequest): Result<void> => {
  return http.put<void>('/auth/updateUserProfile', data, withHeaders({
    auth: true,            // 需要Token(默认)
    isEncrypt: true        // 敏感数据加密
  }))
}
```

参考: src/api/system/auth/authApi.ts:18-167

## 错误处理

### 统一错误码

authApi接口返回的错误遵循统一的错误码规范:

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 401 | 未认证或Token过期 | 清除Token,跳转登录页 |
| 403 | 权限不足 | 提示无权限 |
| 500 | 服务器内部错误 | 提示系统错误 |
| 1001 | 用户名或密码错误 | 提示错误并刷新验证码 |
| 1002 | 验证码错误 | 刷新验证码 |
| 1003 | 验证码已过期 | 刷新验证码 |
| 1004 | 账号已被禁用 | 提示账号状态 |
| 1005 | 短信验证码错误 | 提示重新获取 |

### 错误处理示例

```typescript
import { to } from '@/utils/to'

// 方式1: 使用to工具函数
const handleLogin = async () => {
  const [error, data] = await to(userLogin(formData))

  if (error) {
    // 统一错误处理
    switch (error.code) {
      case 1001:
        uni.showToast({ title: '用户名或密码错误', icon: 'none' })
        refreshCaptcha()
        break
      case 1002:
      case 1003:
        uni.showToast({ title: '验证码错误或已过期', icon: 'none' })
        refreshCaptcha()
        break
      case 1004:
        uni.showModal({
          title: '账号已被禁用',
          content: '请联系管理员解除禁用',
          showCancel: false
        })
        break
      default:
        uni.showToast({
          title: error.msg || '登录失败',
          icon: 'none'
        })
    }
    return
  }

  // 登录成功逻辑
  console.log('登录成功:', data)
}

// 方式2: 使用try-catch
const handleLoginV2 = async () => {
  try {
    const data = await userLogin(formData)
    console.log('登录成功:', data)
  } catch (error: any) {
    if (error.code === 1001) {
      uni.showToast({ title: '用户名或密码错误', icon: 'none' })
      refreshCaptcha()
    } else {
      uni.showToast({
        title: error.msg || '登录失败',
        icon: 'none'
      })
    }
  }
}
```

参考: src/api/system/auth/authApi.ts:1-167

## 最佳实践

### 1. Token自动管理

系统会自动管理Token的存储、刷新和过期检测,无需手动处理:

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ✅ 推荐: 登录成功后使用Store管理Token
const handleLogin = async () => {
  const [error, data] = await to(userLogin(formData))
  if (error) return

  // 自动存储Token到缓存
  await userStore.setUserInfo(data)

  // Token会在所有需要认证的请求中自动携带
}

// ❌ 不推荐: 手动管理Token
const handleLoginBad = async () => {
  const data = await userLogin(formData)

  // 不要手动存储Token
  cache.set('token', data.accessToken)
  cache.set('refreshToken', data.refreshToken)
}
```

**优势:**
- Token自动存储到缓存
- 请求拦截器自动携带Token
- Token过期自动刷新
- 刷新失败自动跳转登录

参考: src/stores/user.ts:1-200

### 2. 密码加密传输

敏感数据(如密码)会自动使用RSA加密,无需手动调用加密函数:

```typescript
// ✅ 推荐: 使用withHeaders启用加密
export const userLogin = (data: LoginRequest): Result<AuthTokenVo> => {
  return http.post<AuthTokenVo>('/auth/userLogin', data, withHeaders({
    isEncrypt: true  // 自动加密密码字段
  }))
}

// ❌ 不推荐: 手动加密
import { encryptByRsa } from '@/utils/rsa'

export const userLoginBad = (data: LoginRequest): Result<AuthTokenVo> => {
  // 不要手动加密
  const encryptedData = {
    ...data,
    password: encryptByRsa(data.password)
  }
  return http.post<AuthTokenVo>('/auth/userLogin', encryptedData)
}
```

**加密字段:**
- `password` - 密码
- `oldPassword` - 旧密码
- `newPassword` - 新密码
- `confirmPassword` - 确认密码

参考: src/api/system/auth/authApi.ts:18-68

### 3. 验证码刷新策略

登录失败时应自动刷新验证码,防止验证码被破解:

```typescript
// ✅ 推荐: 登录失败后刷新验证码
const handleLogin = async () => {
  const [error, data] = await to(userLogin({
    username: formData.username,
    password: formData.password,
    captcha: formData.captcha,
    uuid: formData.uuid
  }))

  if (error) {
    // 登录失败,刷新验证码
    await refreshCaptcha()

    uni.showToast({
      title: error.msg || '登录失败',
      icon: 'none'
    })
    return
  }

  // 登录成功逻辑...
}

// 刷新验证码
const refreshCaptcha = async () => {
  formData.captcha = ''  // 清空输入
  const [error, data] = await to(imgCode())
  if (error) return

  captchaImage.value = `data:image/png;base64,${data.img}`
  formData.uuid = data.uuid
}
```

**要点:**
- 登录失败立即刷新
- 清空已输入的验证码
- 自动获取新的验证码图片和UUID

参考: src/api/system/auth/authApi.ts:70-75

### 4. 社交登录安全验证

社交登录必须验证state参数,防止CSRF攻击:

```typescript
// ✅ 推荐: 完整的社交登录流程
// 步骤1: 获取授权URL
const getSocialUrl = async (source: string) => {
  const [error, data] = await to(socialBindUrl(source))
  if (error) return

  // 保存state到缓存
  cache.set(`social_state_${source}`, data.state)

  // 跳转授权页
  window.location.href = data.authorizeUrl
}

// 步骤2: 处理回调
const handleCallback = async (code: string, state: string, source: string) => {
  // 验证state
  const savedState = cache.get(`social_state_${source}`)
  if (state !== savedState) {
    uni.showToast({ title: '授权验证失败', icon: 'none' })
    return
  }

  // 调用绑定接口
  const [error, data] = await to(socialBind({ source, code, state }))
  if (error) return

  // 清除state
  cache.remove(`social_state_${source}`)

  // 处理登录结果...
}

// ❌ 不推荐: 不验证state
const handleCallbackBad = async (code: string, source: string) => {
  // 直接调用绑定接口,不验证state - 存在CSRF风险
  const data = await socialBind({ source, code, state: '' })
}
```

**安全要点:**
- 保存state到缓存
- 回调时验证state一致性
- 验证通过后立即清除state
- state不匹配拒绝绑定

参考: src/api/system/auth/authApi.ts:84-110

### 5. 多租户模式处理

多租户模式下,必须正确设置租户ID:

```typescript
// ✅ 推荐: 自动读取租户配置
const handleLogin = async () => {
  // 获取租户配置
  const [error, config] = await to(getTenantConfig())
  if (error) {
    console.error('获取租户配置失败:', error)
  }

  // 从缓存读取租户ID
  let tenantId = cache.get<string>('tenantId')

  // 如果启用多租户且缓存中没有,使用默认租户
  if (config?.tenantEnabled && !tenantId) {
    tenantId = config.defaultTenantId || config.tenantList[0]?.tenantId
    cache.set('tenantId', tenantId)
  }

  // 登录时携带租户ID
  const [loginError, data] = await to(userLogin({
    username: formData.username,
    password: formData.password,
    tenantId: tenantId
  }))

  // 处理登录结果...
}

// ❌ 不推荐: 忽略租户配置
const handleLoginBad = async () => {
  // 直接登录,不处理租户ID - 多租户模式下会失败
  const data = await userLogin({
    username: formData.username,
    password: formData.password
  })
}
```

**要点:**
- 应用启动时获取租户配置
- 缓存用户选择的租户ID
- 所有认证接口携带租户ID
- 租户切换后刷新应用状态

参考: src/api/system/auth/authApi.ts:112-117

## 注意事项

### 1. Token有效期管理

访问Token(accessToken)的有效期通常为2小时,刷新Token(refreshToken)的有效期为7天:

- 访问Token过期后,系统会自动使用refreshToken刷新
- refreshToken过期后,需要用户重新登录
- 建议在用户活跃时定期刷新Token,避免突然失效

### 2. 密码复杂度要求

默认密码规则:

- 长度: 6-20位
- 必须包含字母和数字
- 可包含特殊字符

可使用`isPassword`工具函数验证:

```typescript
import { isPassword } from '@/utils/validators'

const validatePassword = (password: string): boolean => {
  return isPassword(password, {
    minLength: 6,
    maxLength: 20,
    requireLowercase: true,
    requireNumbers: true
  })
}
```

参考: src/utils/validators.ts:653-679

### 3. 验证码有效期

- 图形验证码: 5分钟
- 短信验证码: 5分钟
- 超过有效期后需要重新获取

### 4. RSA加密密钥管理

RSA公钥从服务端动态获取,存储在缓存中:

- 首次请求时获取公钥
- 公钥缓存24小时
- 公钥过期后自动重新获取

不要将公钥硬编码到代码中。

参考: src/utils/rsa.ts:1-156

### 5. 社交登录平台限制

不同平台的社交登录有不同限制:

**H5端:**
- 支持所有社交平台
- 直接跳转授权页

**微信小程序:**
- 只支持微信登录
- 使用wx.login获取code

**支付宝小程序:**
- 只支持支付宝登录
- 使用my.getAuthCode获取code

**APP端:**
- 需要配置各平台SDK
- 使用原生API获取授权

参考: src/api/system/auth/authApi.ts:84-110

### 6. 短信验证码发送频率

为防止短信轰炸和恶意攻击,短信验证码有以下限制:

- 同一手机号60秒内只能发送1次
- 同一手机号1小时内最多发送5次
- 同一IP 1小时内最多发送10次

建议在前端实现倒计时,避免频繁请求。

参考: src/api/system/auth/authApi.ts:77-82

### 7. 会话并发控制

系统支持配置会话并发数:

- **单会话模式**: 一个账号只能在一个设备登录,新登录会踢掉旧会话
- **多会话模式**: 一个账号可在多个设备登录,但有数量限制(默认5个)

用户被踢出时,会收到`401`错误并自动跳转登录页。

### 8. 登录失败次数限制

连续登录失败5次后,账号会被锁定15分钟:

- 锁定期间无法登录
- 锁定时间到期后自动解锁
- 管理员可手动解锁

建议在登录页面显示剩余尝试次数和锁定时间。

---

通过合理使用认证接口API,可以实现安全可靠的用户认证和授权功能。
