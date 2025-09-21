# API概览

移动端 API 接口文档，包含系统接口和业务接口。

## 接口分类

### 系统接口
- **认证接口 (auth)**: 登录、注册、退出登录
- **用户接口 (user)**: 用户信息、个人资料管理
- **角色接口 (role)**: 角色权限查询
- **字典接口 (dict)**: 数据字典查询
- **岗位接口 (post)**: 岗位信息查询

### 业务接口
- **首页接口 (home)**: 首页数据、轮播图等
- **电话接口 (phone)**: 短信验证码、电话登录
- **广告接口 (ad)**: 广告位展示
- **商城接口 (mall)**: 商品、订单管理
- **订单接口 (order)**: 订单操作
- **商品接口 (goods)**: 商品信息

## 接口规范

### 请求基础信息
```javascript
// 基础URL
const BASE_URL = 'https://api.example.com'

// 请求头
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + token,
  'X-Tenant-Id': tenantId
}
```

### 响应格式
```javascript
// 成功响应
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 响应数据
  },
  "timestamp": 1635724800000
}

// 错误响应
{
  "code": 400,
  "message": "参数错误",
  "data": null,
  "timestamp": 1635724800000
}
```

### 状态码
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权或token过期
- `403`: 没有权限
- `404`: 资源不存在
- `500`: 服务器内部错误

## 请求封装

项目中使用 `@/utils/request.js` 进行统一的请求封装：

```javascript
import request from '@/utils/request'

// GET请求
export const getUserInfo = () => {
  return request.get('/system/user/profile')
}

// POST请求
export const login = (data) => {
  return request.post('/auth/login', data)
}

// PUT请求
export const updateUser = (data) => {
  return request.put('/system/user', data)
}

// DELETE请求
export const deleteUser = (id) => {
  return request.delete(`/system/user/${id}`)
}
```

## 错误处理

接口请求失败时，项目会自动处理常见错误：

```javascript
// 请求拦截器处理
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 200) {
      return data
    } else {
      // 显示错误信息
      uni.showToast({
        title: message,
        icon: 'none'
      })
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    // 网络错误处理
    const message = error.message || '请求失败'
    uni.showToast({
      title: message,
      icon: 'none'
    })
    return Promise.reject(error)
  }
)
```

## 注意事项

1. **认证**: 除了登录接口，其他接口都需要携带token
2. **多租户**: 部分接口需要携带租户ID
3. **分页**: 列表接口通常支持分页查询
4. **缓存**: 部分数据会进行本地缓存，注意缓存更新
5. **平台差异**: 小程序和H5在网络请求上可能有细微差异
