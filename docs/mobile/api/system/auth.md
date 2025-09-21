# 认证接口 (auth)

移动端认证相关接口。

## 登录

### 账号密码登录

```javascript
// POST /auth/login
export const login = (data) => {
  return request.post('/auth/login', data)
}

// 请求参数
const loginData = {
  username: 'admin',     // 用户名
  password: '123456',    // 密码
  tenantId: '000000',    // 租户ID
  captcha: '1234',       // 验证码
  uuid: 'uuid-123'       // 验证码UUID
}

// 返回数据
{
  access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
  expires_in: 7200,
  user_info: {
    user_id: 1,
    username: 'admin',
    nickname: '管理员',
    avatar: 'https://example.com/avatar.jpg',
    email: 'admin@example.com',
    mobile: '13888888888'
  }
}
```

### 手机短信登录

```javascript
// POST /auth/sms-login
export const smsLogin = (data) => {
  return request.post('/auth/sms-login', data)
}

// 请求参数
const smsLoginData = {
  mobile: '13888888888',  // 手机号
  smsCode: '123456',      // 短信验证码
  tenantId: '000000'      // 租户ID
}
```

## 注册

### 用户注册

```javascript
// POST /auth/register
export const register = (data) => {
  return request.post('/auth/register', data)
}

// 请求参数
const registerData = {
  username: 'newuser',    // 用户名
  password: '123456',     // 密码
  confirmPassword: '123456', // 确认密码
  mobile: '13888888888',  // 手机号
  smsCode: '123456',      // 短信验证码
  nickname: '新用户',    // 昵称
  email: 'user@example.com' // 邮箱
}
```

## 退出登录

```javascript
// POST /auth/logout
export const logout = () => {
  return request.post('/auth/logout')
}
```

## 令牌刷新

```javascript
// POST /auth/refresh-token
export const refreshToken = (refreshToken) => {
  return request.post('/auth/refresh-token', {
    refresh_token: refreshToken
  })
}
```

## 验证码

### 获取图片验证码

```javascript
// GET /auth/captcha
export const getCaptcha = () => {
  return request.get('/auth/captcha')
}

// 返回数据
{
  uuid: 'uuid-123',
  img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
}
```

### 获取短信验证码

```javascript
// POST /auth/sms-code
export const getSmsCode = (mobile, scene = 'login') => {
  return request.post('/auth/sms-code', {
    mobile,
    scene  // login|登录, register|注册, reset|重置密码
  })
}
```

## 密码重置

### 发送重置邮件

```javascript
// POST /auth/forgot-password
export const forgotPassword = (email) => {
  return request.post('/auth/forgot-password', { email })
}
```

### 重置密码

```javascript
// POST /auth/reset-password
export const resetPassword = (data) => {
  return request.post('/auth/reset-password', data)
}

// 请求参数
const resetData = {
  token: 'reset-token',   // 重置令牌
  password: 'newpassword', // 新密码
  confirmPassword: 'newpassword' // 确认密码
}
```

## 第三方登录

### 微信登录

```javascript
// POST /auth/wechat-login
export const wechatLogin = (code) => {
  return request.post('/auth/wechat-login', { code })
}
```

### QQ登录

```javascript
// POST /auth/qq-login
export const qqLogin = (code) => {
  return request.post('/auth/qq-login', { code })
}
```

## 使用示例

```javascript
// 登录流程
export default {
  async login(loginForm) {
    try {
      // 1. 获取验证码
      const captcha = await getCaptcha()
      
      // 2. 用户输入验证码后提交登录
      const loginData = {
        ...loginForm,
        uuid: captcha.uuid
      }
      
      // 3. 执行登录
      const result = await login(loginData)
      
      // 4. 存储token和用户信息
      uni.setStorageSync('token', result.access_token)
      uni.setStorageSync('userInfo', result.user_info)
      
      // 5. 跳转到首页
      uni.switchTab({
        url: '/pages/index/index'
      })
      
    } catch (error) {
      console.error('登录失败:', error)
    }
  },
  
  async logout() {
    try {
      await logout()
      
      // 清理本地数据
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/auth/login'
      })
      
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }
}
```