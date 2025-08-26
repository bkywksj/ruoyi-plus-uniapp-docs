# 用户状态管理 (user)

## 功能概述

用户状态管理模块负责处理用户认证、权限控制和个人信息管理，是应用安全体系的核心组件。

## 核心职责

- **身份认证**：登录、注销、Token管理
- **权限管理**：角色和权限数据维护
- **用户信息**：个人资料存储与更新
- **会话管理**：认证状态持久化

## 状态定义

```typescript
// 核心状态
token: string                    // 访问令牌
userInfo: SysUserVo | null       // 用户信息
roles: string[]                  // 角色列表
permissions: string[]            // 权限列表
```

## 核心方法

### loginUser - 用户登录
```typescript
async loginUser(loginRequest: LoginRequest): Result<void>
```
处理用户登录流程：
1. 调用登录API验证凭据
2. 保存Token到本地存储
3. 更新Store中的Token状态

### fetchUserInfo - 获取用户信息
```typescript
async fetchUserInfo(): Result<void>
```
获取当前用户的完整信息：
- 用户基本资料（昵称、头像等）
- 分配的角色列表
- 拥有的权限集合

### logoutUser - 用户注销
```typescript
async logoutUser(): Result<void>
```
清理用户会话：
1. 调用注销API
2. 清空用户状态
3. 移除本地Token

### updateAvatar - 更新头像
```typescript
updateAvatar(avatarUrl: string): void
```
动态更新用户头像，立即生效无需重新登录。

## 使用示例

### 用户登录
```typescript
const userStore = useUserStore()

const [err, data] = await userStore.loginUser({
  userName: 'admin',
  password: '123456',
  code: captchaCode,
  uuid: captchaUuid
})

if (!err) {
  // 登录成功，跳转首页
  router.push('/')
}
```

### 权限判断
```typescript
// 在组件中判断权限
const hasEditPermission = computed(() => 
  userStore.permissions.includes('system:user:edit')
)

// 在路由守卫中验证角色
if (!userStore.roles.includes('admin')) {
  next('/403')
}
```

### 获取用户信息
```typescript
// 在应用初始化时获取
onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
})

// 在模板中使用
<el-avatar :src="userStore.userInfo?.avatar" />
<span>{{ userStore.userInfo?.nickName }}</span>
```

## Token 管理策略

Token通过专门的`useToken`工具类管理：

- **存储位置**：localStorage
- **过期处理**：自动计算过期时间
- **刷新机制**：支持无感刷新（如配置）
- **安全措施**：仅HTTPS环境下存储敏感信息

## 与其他模块协作

### 与 Permission Store
- 登录成功后触发路由权限加载
- 基于roles和permissions过滤路由

### 与 Dict Store
- 登录后加载用户相关字典数据
- 根据权限过滤可见字典项

### 与 Theme Store
- 加载用户的主题偏好设置
- 保存个性化配置

## 安全考虑

1. **Token安全**
    - 设置合理的过期时间
    - 支持主动失效机制
    - 避免在URL中传递Token

2. **权限验证**
    - 前端权限仅用于UI控制
    - 关键操作必须后端二次验证
    - 防止权限数据被篡改

3. **会话管理**
    - 支持单点登录
    - 异常登录检测
    - 多设备登录控制

## 最佳实践

1. **初始化时机**：在路由守卫中统一处理用户信息获取
2. **错误处理**：登录失败时清理残留状态
3. **状态同步**：多标签页共享登录状态
4. **性能优化**：缓存用户信息，避免重复请求
