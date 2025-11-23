# 前端安全

> **文档状态**: ✅ 已完成

本文档详细介绍 RuoYi-Plus-UniApp 前端应用的安全防护策略和最佳实践,涵盖 XSS 防护、数据加密、权限控制、安全存储等核心安全机制。

---

## 概述

### 前端安全的重要性

前端作为用户直接交互的层面,面临多种安全威胁:

- **XSS (跨站脚本攻击)**: 攻击者注入恶意脚本,窃取用户数据
- **CSRF (跨站请求伪造)**: 诱导用户执行非预期操作
- **敏感数据泄露**: Token、密码等敏感信息被截获
- **权限绕过**: 未授权访问受保护资源
- **中间人攻击**: 传输数据被篡改或窃听

### 安全架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                     前端安全架构                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 输入安全    │  │ 传输安全    │  │ 存储安全    │         │
│  │ - XSS防护   │  │ - HTTPS     │  │ - 安全存储  │         │
│  │ - 输入验证  │  │ - 加密传输  │  │ - Token管理 │         │
│  │ - 编码处理  │  │ - 签名验证  │  │ - 敏感脱敏  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 权限控制    │  │ 请求安全    │  │ 构建安全    │         │
│  │ - 路由守卫  │  │ - 防重提交  │  │ - 依赖安全  │         │
│  │ - 指令权限  │  │ - Token认证 │  │ - 代码混淆  │         │
│  │ - 菜单过滤  │  │ - 请求追踪  │  │ - 环境隔离  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 核心安全特性

| 安全领域 | 实现方式 | 关键文件 |
|---------|---------|---------|
| 数据加密 | AES + RSA 混合加密 | `crypto.ts`, `rsa.ts` |
| 权限控制 | 路由守卫 + 指令权限 | `guard.ts`, `useAuth.ts` |
| Token管理 | 安全存储 + 过期处理 | `useToken.ts`, `cache.ts` |
| 请求安全 | 加密传输 + 防重提交 | `useHttp.ts` |
| 缓存安全 | 前缀隔离 + 过期清理 | `cache.ts` |

---

## 数据加密

### AES 加密

系统使用 AES (高级加密标准) 进行对称加密,适用于大量数据的加密场景。

#### 核心实现

```typescript
import CryptoJS from 'crypto-js'

/**
 * 随机生成32位的字符串
 * 用于生成AES密钥
 */
export const generateRandomString = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * 随机生成AES密钥
 */
export const generateAesKey = (): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf8.parse(generateRandomString())
}

/**
 * 使用AES密钥加密数据
 * @param message 要加密的消息
 * @param aesKey AES密钥
 */
export const encryptWithAes = (
  message: string,
  aesKey: CryptoJS.lib.WordArray
): string => {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

/**
 * 使用AES密钥解密数据
 * @param message 加密的消息
 * @param aesKey AES密钥
 */
export const decryptWithAes = (
  message: string,
  aesKey: CryptoJS.lib.WordArray
): string => {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}
```

#### 自动密钥管理

```typescript
/**
 * 一步完成加密过程 - 生成密钥、加密数据并返回结果
 * @param data 要加密的数据
 */
export const encryptWithAutoKey = (
  data: string | object
): { encryptedData: string; key: CryptoJS.lib.WordArray } => {
  const key = generateAesKey()
  const message = typeof data === 'object' ? JSON.stringify(data) : data
  const encryptedData = encryptWithAes(message, key)

  return {
    encryptedData,
    key
  }
}

/**
 * 使用提供的密钥解密数据
 * @param encryptedData 加密的数据
 * @param key 解密密钥
 * @param parseJson 是否将结果解析为JSON对象
 */
export const decryptWithParsing = (
  encryptedData: string,
  key: CryptoJS.lib.WordArray,
  parseJson: boolean = false
): string | object => {
  const decryptedStr = decryptWithAes(encryptedData, key)

  if (parseJson) {
    try {
      return JSON.parse(decryptedStr)
    } catch (e) {
      console.error('Failed to parse decrypted data as JSON:', e)
      return decryptedStr
    }
  }

  return decryptedStr
}
```

### RSA 加密

RSA 非对称加密用于密钥交换和数字签名,确保 AES 密钥的安全传输。

#### RSA 加密实现

```typescript
import JSEncrypt from 'jsencrypt/bin/jsencrypt.min.js'
import { SystemConfig } from '@/systemConfig'

// 从环境变量获取默认密钥
const defaultPublicKey = SystemConfig.security.rsaPublicKey
const defaultPrivateKey = SystemConfig.security.rsaPrivateKey

/**
 * 创建加密器实例
 */
const createEncryptor = (): JSEncrypt => {
  return new JSEncrypt()
}

/**
 * 使用RSA公钥加密文本
 * @param txt 要加密的文本
 * @param pubKey 可选的自定义公钥
 */
export const rsaEncrypt = (txt: string, pubKey?: string): string | null => {
  try {
    if (!txt) {
      return null
    }

    const encryptor = createEncryptor()
    const keyToUse = pubKey || defaultPublicKey

    encryptor.setPublicKey(keyToUse)
    return encryptor.encrypt(txt)
  } catch (err) {
    console.error('RSA加密失败:', err)
    return null
  }
}

/**
 * 使用RSA私钥解密文本
 * @param txt 要解密的文本
 * @param privKey 可选的自定义私钥
 */
export const rsaDecrypt = (txt: string, privKey?: string): string | null => {
  try {
    if (!txt) {
      return null
    }

    const encryptor = createEncryptor()
    const keyToUse = privKey || defaultPrivateKey

    encryptor.setPrivateKey(keyToUse)
    return encryptor.decrypt(txt)
  } catch (err) {
    console.error('RSA解密失败:', err)
    return null
  }
}
```

#### RSA 签名验证

```typescript
/**
 * 使用RSA私钥签名文本
 * @param txt 要签名的文本
 * @param privKey 可选的私钥
 */
export const rsaSign = (txt: string, privKey?: string): string | null => {
  try {
    const encryptor = createEncryptor()
    const keyToUse = privKey || defaultPrivateKey

    encryptor.setPrivateKey(keyToUse)
    // 使用SHA256哈希算法
    return encryptor.sign(txt, CryptoJS.SHA256, 'sha256')
  } catch (err) {
    console.error('RSA签名失败:', err)
    return null
  }
}

/**
 * 验证RSA签名
 * @param txt 原始文本
 * @param signature 签名
 * @param pubKey 可选的公钥
 */
export const rsaVerify = (
  txt: string,
  signature: string,
  pubKey?: string
): boolean => {
  try {
    const encryptor = createEncryptor()
    const keyToUse = pubKey || defaultPublicKey

    encryptor.setPublicKey(keyToUse)
    return encryptor.verify(txt, signature, CryptoJS.SHA256)
  } catch (err) {
    console.error('RSA签名验证失败:', err)
    return false
  }
}
```

### 哈希计算

哈希函数用于数据完整性校验和唯一标识生成。

```typescript
/**
 * 计算字符串的SHA-256哈希值
 * @param data 要计算哈希的数据
 */
export const computeSha256Hash = (data: string): string => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex)
}

/**
 * 计算字符串的MD5哈希值
 * @param data 要计算哈希的数据
 */
export const computeMd5Hash = (data: string): string => {
  return CryptoJS.MD5(data).toString(CryptoJS.enc.Hex)
}

/**
 * 生成图片的唯一哈希标识
 * @param base64Data 图片的Base64编码数据
 */
export const generateImageHash = (base64Data: string): string => {
  return computeSha256Hash(base64Data)
}

/**
 * 异步生成文件的哈希标识
 * @param file 文件或数据流
 */
export const generateFileHash = async (
  file: Blob | File | ArrayBuffer
): Promise<string> => {
  let arrayBuffer: ArrayBuffer

  if (file instanceof Blob || file instanceof File) {
    arrayBuffer = await file.arrayBuffer()
  } else {
    arrayBuffer = file
  }

  const uint8Array = new Uint8Array(arrayBuffer)
  let binaryString = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i])
  }

  return computeSha256Hash(binaryString)
}
```

### 安全配置

加密功能通过系统配置进行统一管理:

```typescript
// systemConfig.ts
export const SystemConfig: SystemConfigType = {
  // ...其他配置

  /**
   * 安全配置
   */
  security: {
    /** 接口加密功能开关 */
    apiEncrypt: import.meta.env.VITE_APP_API_ENCRYPT === 'true',
    /** RSA公钥 - 用于加密传输 */
    rsaPublicKey: import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '',
    /** RSA私钥 - 用于解密响应 */
    rsaPrivateKey: import.meta.env.VITE_APP_RSA_PRIVATE_KEY || ''
  }
}

/**
 * 安全配置接口
 */
export interface SecurityConfig {
  /** 接口加密功能开关 */
  apiEncrypt: boolean
  /** RSA公钥 - 用于加密传输 */
  rsaPublicKey: string
  /** RSA私钥 - 用于解密响应 */
  rsaPrivateKey: string
}
```

---

## 权限控制

### 路由守卫

路由守卫是前端权限控制的核心,实现基于用户登录状态和权限的路由访问控制。

#### 路由守卫配置

```typescript
import NProgress from 'nprogress'
import { isHttp, isPathMatch } from '@/utils/validators'
import { type Router } from 'vue-router'

// 进度条配置
NProgress.configure({ showSpinner: false })

// 白名单列表 - 不需要登录就可以访问的页面
const WHITE_LIST = [
  '/login',
  '/register',
  '/forgotPassword',
  '/socialCallback',
  '/register*',
  '/register/*',
  '/401',
  '/home'
]

// 路由守卫内部状态 - 防止重复获取用户信息
let isFetchingUserInfo = false

// 是否在白名单中的辅助函数
const isInWhiteList = (path: string) => {
  return WHITE_LIST.some((pattern) => isPathMatch(pattern, path))
}

/**
 * 初始化路由守卫
 * @param router 路由实例
 */
export const setupRouteGuards = (router: Router): void => {
  // 路由前置守卫
  router.beforeEach(async (to, from, next) => {
    // 开始进度条
    NProgress.start()

    // 获取store实例
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    // 获取权限钩子
    const { canAccessRoute, isLoggedIn } = useAuth()

    // 没有token的情况
    if (!isLoggedIn.value) {
      isFetchingUserInfo = false

      // 白名单直接通过
      if (isInWhiteList(to.path)) {
        return next()
      }
      // 非白名单重定向到登录页
      const redirect = encodeURIComponent(to.fullPath || '/')
      return next(`/login?redirect=${redirect}`)
    }

    // 有token的情况
    // 已登录用户访问登录页，重定向到首页
    if (to.path === '/login') {
      return next({ path: '/' })
    }

    // 白名单页面直接通过
    if (isInWhiteList(to.path)) {
      return next()
    }

    // 已加载用户信息，检查路由访问权限
    if (userStore.roles.length > 0) {
      if (canAccessRoute(to)) {
        return next()
      } else {
        return next('/403') // 无权限访问
      }
    }

    // 防止重复获取用户信息
    if (isFetchingUserInfo) {
      return next()
    }

    isFetchingUserInfo = true
    isReLogin.show = true

    // 获取用户信息
    const [fetchUserErr] = await userStore.fetchUserInfo()
    if (fetchUserErr) {
      isReLogin.show = false
      showMsgError('登录状态已过期，请重新登录')

      const [logoutErr] = await userStore.logoutUser()
      if (!logoutErr) {
        const redirect = encodeURIComponent(to.fullPath || '/')
        return next(`/login?redirect=${redirect}`)
      }
      return next()
    }

    isReLogin.show = false

    // 生成动态路由
    const [generateRoutesErr, accessRoutes] = await permissionStore.generateRoutes()
    if (generateRoutesErr) {
      showMsgError(generateRoutesErr)
      return next('/403')
    }

    // 添加动态路由
    accessRoutes.forEach((route) => {
      if (!isHttp(route.path)) {
        router.addRoute(route)
      }
    })

    // 检查目标路由是否有权限访问
    if (!canAccessRoute(to)) {
      return next('/403')
    }

    next({
      path: to.path,
      replace: true,
      params: to.params,
      query: to.query,
      hash: to.hash,
      name: to.name as string
    })
  })

  // 路由后置守卫
  router.afterEach((to) => {
    NProgress.done()

    const layout = useLayout()
    if (to.meta.title) {
      layout.setTitle(to.meta.title as string)
    }
  })
}
```

### 权限认证钩子

`useAuth` 钩子提供完整的权限检查功能。

#### 核心实现

```typescript
/**
 * 认证与授权钩子 (useAuth)
 * 提供用户认证与权限检查功能
 */
export const useAuth = () => {
  const userStore = useUserStore()

  // 角色标识常量
  const SUPER_ADMIN = 'superadmin'
  const TENANT_ADMIN = 'admin'
  const ALL_PERMISSION = '*:*:*'

  /**
   * 当前用户登录状态
   */
  const isLoggedIn = computed(() => {
    return userStore.token && userStore.token.length > 0
  })

  /**
   * 检查当前用户是否为超级管理员
   * @param roleToCheck 要检查的超级管理员角色标识
   */
  const isSuperAdmin = (roleToCheck?: string): boolean => {
    const targetRole = roleToCheck || SUPER_ADMIN
    return userStore.roles.includes(targetRole)
  }

  /**
   * 检查当前用户是否为租户管理员
   * @param roleToCheck 要检查的租户管理员角色标识
   */
  const isTenantAdmin = (roleToCheck?: string): boolean => {
    const targetRole = roleToCheck || TENANT_ADMIN
    return userStore.roles.includes(targetRole)
  }

  /**
   * 检查是否拥有指定权限
   * @param permission 权限标识或权限标识数组
   * @param superAdminRole 超级管理员角色标识
   */
  const hasPermission = (
    permission: string | string[],
    superAdminRole?: string
  ): boolean => {
    if (!permission || permission.length === 0) {
      console.warn('权限参数不能为空')
      return false
    }

    const userPermissions = userStore.permissions

    // 超级管理员拥有所有权限
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    // 通配符权限检查
    if (userPermissions.includes(ALL_PERMISSION)) {
      return true
    }

    // 数组权限检查 (OR逻辑)
    if (Array.isArray(permission)) {
      return permission.some((perm) => userPermissions.includes(perm))
    }

    // 单个权限检查
    return userPermissions.includes(permission)
  }

  /**
   * 检查是否拥有指定角色
   * @param role 角色标识或角色标识数组
   * @param superAdminRole 超级管理员角色标识
   */
  const hasRole = (
    role: string | string[],
    superAdminRole?: string
  ): boolean => {
    if (!role || role.length === 0) {
      console.warn('角色参数不能为空')
      return false
    }

    const userRoles = userStore.roles

    // 超级管理员默认拥有所有角色
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    // 数组角色检查 (OR逻辑)
    if (Array.isArray(role)) {
      return role.some((r) => userRoles.includes(r))
    }

    // 单个角色检查
    return userRoles.includes(role)
  }

  /**
   * 检查是否拥有所有指定权限 (AND逻辑)
   * @param permissions 权限标识数组
   */
  const hasAllPermissions = (
    permissions: string[],
    superAdminRole?: string
  ): boolean => {
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    const userPermissions = userStore.permissions

    if (userPermissions.includes(ALL_PERMISSION)) {
      return true
    }

    return permissions.every((perm) => userPermissions.includes(perm))
  }

  /**
   * 检查是否拥有所有指定角色 (AND逻辑)
   * @param roles 角色标识数组
   */
  const hasAllRoles = (
    roles: string[],
    superAdminRole?: string
  ): boolean => {
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    const userRoles = userStore.roles
    return roles.every((role) => userRoles.includes(role))
  }

  /**
   * 检查是否有权限访问某个路由
   * @param route 路由对象
   */
  const canAccessRoute = (route: any, superAdminRole?: string): boolean => {
    if (!route) {
      return false
    }

    // 无权限要求则允许访问
    if (!route.meta || (!route.meta.roles && !route.meta.permissions)) {
      return true
    }

    // 超级管理员可以访问任何路由
    if (isSuperAdmin(superAdminRole)) {
      return true
    }

    // 检查角色权限
    if (route.meta.roles && route.meta.roles.length > 0) {
      if (!hasRole(route.meta.roles, superAdminRole)) {
        return false
      }
    }

    // 检查操作权限
    if (route.meta.permissions && route.meta.permissions.length > 0) {
      if (!hasPermission(route.meta.permissions, superAdminRole)) {
        return false
      }
    }

    return true
  }

  return {
    isLoggedIn,
    isSuperAdmin,
    isTenantAdmin,
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAllRoles,
    canAccessRoute
  }
}
```

### 权限指令

系统提供丰富的权限指令用于控制 UI 元素的显示。

#### 指令注册

```typescript
import { App } from 'vue'
import {
  permi, role, admin, superadmin,
  permiAll, roleAll, tenant,
  noPermi, noRole, auth
} from './permission'

/**
 * 全局注册自定义指令
 */
export default (app: App) => {
  // ===== 基础权限指令 =====

  /** 基于权限控制元素显示(OR逻辑) */
  app.directive('permi', permi)

  /** 基于角色控制元素显示(OR逻辑) */
  app.directive('role', role)

  /** 仅管理员可见 */
  app.directive('admin', admin)

  /** 仅超级管理员可见 */
  app.directive('superadmin', superadmin)

  // ===== 高级权限指令 =====

  /** 必须满足所有权限才显示(AND逻辑) */
  app.directive('permiAll', permiAll)

  /** 必须满足所有角色才显示(AND逻辑) */
  app.directive('roleAll', roleAll)

  /** 基于租户权限控制元素显示 */
  app.directive('tenant', tenant)

  // ===== 反向权限指令 =====

  /** 反向权限控制 - 有权限则隐藏 */
  app.directive('noPermi', noPermi)

  /** 反向角色控制 - 有角色则隐藏 */
  app.directive('noRole', noRole)

  // ===== 高级控制指令 =====

  /** 支持自定义处理方式 */
  app.directive('auth', auth)
}
```

#### 指令使用示例

```vue
<template>
  <!-- 权限控制 (OR逻辑) -->
  <el-button v-permi="['system:user:add']">新增用户</el-button>

  <!-- 多权限控制 -->
  <el-button v-permi="['system:user:edit', 'system:user:update']">
    编辑用户
  </el-button>

  <!-- 角色控制 -->
  <el-button v-role="['admin']">管理员按钮</el-button>

  <!-- 仅超级管理员可见 -->
  <el-button v-superadmin>超管专属</el-button>

  <!-- 必须满足所有权限 (AND逻辑) -->
  <el-button v-permiAll="['system:user:add', 'system:user:edit']">
    需要多个权限
  </el-button>

  <!-- 反向控制 - 有权限则隐藏 -->
  <div v-noPermi="['system:user:delete']">
    无删除权限时显示的内容
  </div>
</template>
```

### 动态路由权限

权限路由管理模块实现动态路由生成和权限过滤。

```typescript
/**
 * 动态路由遍历，验证是否具备权限
 * @param routes 路由数组
 */
const filterDynamicRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
  const res: RouteRecordRaw[] = []
  const { hasPermission, hasRole } = useAuth()

  routes.forEach((route) => {
    if (route.permissions) {
      // 检查是否有任一所需权限
      if (hasPermission(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      // 检查是否有任一所需角色
      if (hasRole(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

/**
 * 生成路由
 * 从后端获取路由数据并处理成可用的路由配置
 */
const generateRoutes = async (): Result<RouteRecordRaw[]> => {
  // 从后端API获取路由数据
  const [err, data] = await getRouters()
  if (err) {
    return [err, null]
  }

  // 处理不同场景的路由格式
  const sidebarRoutes = filterAsyncRouter(sdata)
  const rewriteRoutes = filterAsyncRouter(rdata, undefined, true)
  const defaultRoutes = filterAsyncRouter(defaultData)

  // 处理动态权限路由
  const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
  asyncRoutes.forEach((route) => {
    router.addRoute(route)
  })

  // 设置各类路由到store
  setRoutes(rewriteRoutes)
  setSidebarRouters(constantRoutes.concat(sidebarRoutes))
  setDefaultRoutes(sidebarRoutes)
  setTopbarRoutes(defaultRoutes)

  // 路由name重复检查
  duplicateRouteChecker(asyncRoutes, sidebarRoutes)

  return [null, rewriteRoutes]
}
```

---

## 请求安全

### HTTP 请求封装

`useHttp` 提供完整的请求安全机制。

#### 请求拦截器

```typescript
// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 设置国际化
    config.headers['Content-Language'] = getLanguage()

    // 添加请求ID用于日志链路追踪
    config.headers['X-Request-Id'] = formatDate(new Date(), 'yyyyMMddHHmmssSSS')

    // 是否需要认证
    if (config.headers?.auth !== false) {
      Object.assign(config.headers, useToken().getAuthHeaders())
    }

    // 是否需要附加租户id
    if (config.headers?.tenant !== false) {
      const tenantId = getTenantId()
      if (tenantId) {
        config.headers['X-Tenant-Id'] = tenantId
      }
    }

    // 防止数据重复提交
    if (config.headers?.repeatSubmit !== false &&
        (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object'
          ? JSON.stringify(config.data)
          : config.data,
        time: new Date().getTime()
      }

      const repeatSubmitCache = sessionCache.getJSON('repeatSubmitCache')
      if (!repeatSubmitCache) {
        sessionCache.setJSON('repeatSubmitCache', requestObj)
      } else {
        const s_url = repeatSubmitCache.url
        const s_data = repeatSubmitCache.data
        const s_time = repeatSubmitCache.time
        const interval = 5000 // 5秒内视为重复提交

        if (s_data === requestObj.data &&
            requestObj.time - s_time < interval &&
            s_url === requestObj.url) {
          console.warn(`[${s_url}]: 数据正在处理，请勿重复提交`)
          return Promise.reject(new Error('数据正在处理，请勿重复提交'))
        } else {
          sessionCache.setJSON('repeatSubmitCache', requestObj)
        }
      }
    }

    // 参数加密处理
    if (SystemConfig.security.apiEncrypt) {
      if (config.headers?.isEncrypt === 'true' &&
          (config.method === 'post' || config.method === 'put')) {
        // 生成AES密钥
        const aesKey = generateAesKey()
        // RSA加密AES密钥
        config.headers[encryptHeader] = rsaEncrypt(encodeBase64(aesKey))
        // AES加密请求数据
        config.data = typeof config.data === 'object'
          ? encryptWithAes(JSON.stringify(config.data), aesKey)
          : encryptWithAes(config.data, aesKey)
      }
    }

    return config
  }
)
```

#### 响应拦截器

```typescript
// 响应拦截器
instance.interceptors.response.use(
  (res: AxiosResponse) => {
    // 加密数据解密
    if (SystemConfig.security.apiEncrypt) {
      const keyStr = res.headers[encryptHeader]
      if (keyStr != null && keyStr != '') {
        try {
          const data = res.data
          // RSA解密AES密钥
          const base64Str = rsaDecrypt(keyStr)
          const aesKey = decodeBase64(base64Str.toString())
          // AES解密响应数据
          const decryptData = decryptWithAes(data as any, aesKey)
          res.data = JSON.parse(decryptData)
        } catch (err) {
          console.error(`响应解密失败:${err}`)
          return Promise.reject(new Error(`响应数据解密失败:${err}`))
        }
      }
    }

    // 二进制数据处理
    if (res.request.responseType === 'blob' ||
        res.request.responseType === 'arraybuffer') {
      return Promise.resolve(res)
    }

    const code = res.data.code || 200
    const msg = res.data.msg || ''
    const data = res.data.data
    const noMsgError = (res.config as any)?.noMsgError === true

    // 处理不同状态码
    if (code === 200) {
      return Promise.resolve(data)
    }

    if (code === 401) {
      if (!noMsgError) {
        handleUnauthorized()
      }
      return Promise.reject(new Error('无效的会话，或者会话已过期'))
    }

    if (code === 500) {
      const errorMsg = msg || '网络错误'
      if (!noMsgError) {
        showMsgError(errorMsg)
      }
      return Promise.reject(new Error(errorMsg))
    }

    if (code === 601) {
      const warnMsg = msg || '网络错误'
      if (!noMsgError) {
        showMsgError({ message: warnMsg, type: 'warning' })
      }
      return Promise.reject(new Error(warnMsg))
    }

    const errorMsg = msg || '网络错误'
    if (!noMsgError) {
      showNotifyError(errorMsg)
    }
    return Promise.reject(new Error(errorMsg))
  }
)
```

### 链式调用配置

```typescript
/**
 * HTTP请求钩子
 * 支持链式调用配置
 */
export const useHttp = (initialConfig?: AxiosRequestConfig) => {
  let chainConfig: AxiosRequestConfig = {}

  /** 禁用认证 */
  const noAuth = () => {
    chainConfig.headers = { ...chainConfig.headers, auth: false }
    return httpInstance
  }

  /** 启用加密 */
  const encrypt = () => {
    chainConfig.headers = { ...chainConfig.headers, isEncrypt: true }
    return httpInstance
  }

  /** 禁用防重复提交 */
  const noRepeatSubmit = () => {
    chainConfig.headers = { ...chainConfig.headers, repeatSubmit: false }
    return httpInstance
  }

  /** 禁用租户信息 */
  const noTenant = () => {
    chainConfig.headers = { ...chainConfig.headers, tenant: false }
    return httpInstance
  }

  /** 禁用错误提示 */
  const noMsgError = () => {
    (chainConfig as any).noMsgError = true
    return httpInstance
  }

  /** 设置超时时间 */
  const timeout = (ms: number) => {
    chainConfig.timeout = ms
    return httpInstance
  }

  return httpInstance
}
```

#### 使用示例

```typescript
// 普通请求
const [err, data] = await http.get<User[]>('/api/users')

// 加密请求
const [err, data] = await http.encrypt().post('/api/login', loginData)

// 禁用认证的请求
const [err, data] = await http.noAuth().get('/api/public/info')

// 组合配置
const [err, data] = await http
  .encrypt()
  .timeout(30000)
  .noRepeatSubmit()
  .post('/api/submit', formData)
```

---

## Token 管理

### Token 存储

```typescript
/**
 * Token 管理钩子 (useToken)
 * 基于封装的 cache 工具实现 token 的本地持久化管理
 */
export const useToken = () => {
  const TOKEN_KEY = 'token'

  /**
   * 获取 token
   */
  const getToken = (): string | null => {
    return localCache.get(TOKEN_KEY)
  }

  /**
   * 设置 token
   * @param accessToken 要存储的 token
   * @param expireSeconds 过期时间（秒）
   */
  const setToken = (accessToken: string, expireSeconds?: number): void => {
    localCache.set(TOKEN_KEY, accessToken, expireSeconds)
  }

  /**
   * 移除 token
   */
  const removeToken = (): void => {
    localCache.remove(TOKEN_KEY)
  }

  /**
   * 获取认证头部 (Record 格式)
   */
  const getAuthHeaders = (): Record<string, string> => {
    const tokenValue = getToken()
    if (!tokenValue) {
      return {}
    }

    return {
      Authorization: `Bearer ${tokenValue}`
    }
  }

  /**
   * 获取认证头部 (查询字符串格式)
   */
  const getAuthQuery = (): string => {
    const headers = getAuthHeaders()
    return objectToQuery(headers)
  }

  return {
    getToken,
    setToken,
    removeToken,
    getAuthHeaders,
    getAuthQuery
  }
}
```

### 会话过期处理

```typescript
/**
 * 处理未授权情况
 */
const handleUnauthorized = async () => {
  // 避免重复处理
  if (isReLogin.show) {
    return
  }

  isReLogin.show = true

  // 弹出确认框
  const [err] = await showConfirm(
    '登录状态已过期，您可以继续留在该页面，或者重新登录',
    '系统提示',
    {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )

  if (!err) {
    // 用户点击了重新登录
    isReLogin.show = false
    const userStore = useUserStore()
    await userStore.logoutUser()
    resetRouter()

    router.replace({
      path: '/login',
      query: {
        redirect: encodeURIComponent(router.currentRoute.value.fullPath || '/')
      }
    })
  } else {
    isReLogin.show = false
  }
}
```

---

## 安全存储

### 缓存工具

系统提供安全的缓存工具,支持前缀隔离和过期管理。

#### 缓存前缀隔离

```typescript
import { SystemConfig } from '@/systemConfig'

// 缓存键前缀，防止多应用冲突
const KEY_PREFIX = `${SystemConfig.app.id}:`

/**
 * 为缓存键添加应用前缀
 */
const getPrefixedKey = (key: string): string => {
  return `${KEY_PREFIX}${key}`
}
```

#### 过期时间管理

```typescript
/**
 * 数据包装器，用于本地缓存支持过期时间
 */
interface CacheWrapper<T = any> {
  data: T
  _expire?: number // 过期时间戳（毫秒）
}

/**
 * 本地缓存工具
 */
export const localCache = {
  /**
   * 设置本地缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param expireSeconds 过期时间（秒）
   */
  set<T>(key: string, value: T, expireSeconds?: number): void {
    if (!localStorage || key == null || value == null) {
      return
    }
    try {
      const prefixedKey = getPrefixedKey(key)
      const wrapper: CacheWrapper<T> = {
        data: value,
        _expire: expireSeconds ? Date.now() + expireSeconds * 1000 : undefined
      }
      localStorage.setItem(prefixedKey, JSON.stringify(wrapper))
    } catch (e) {
      console.error('缓存设置失败:', e)
    }
  },

  /**
   * 获取本地缓存
   * @param key 缓存键
   */
  get<T = any>(key: string): T | null {
    if (!localStorage || key == null) {
      return null
    }
    try {
      const prefixedKey = getPrefixedKey(key)
      const value = localStorage.getItem(prefixedKey)
      if (value == null) {
        return null
      }
      const wrapper: CacheWrapper<T> = JSON.parse(value)
      if (!wrapper || typeof wrapper !== 'object') {
        this.remove(key)
        return null
      }
      // 检查是否过期
      if (wrapper._expire && wrapper._expire < Date.now()) {
        this.remove(key)
        return null
      }
      return wrapper.data as T
    } catch (e) {
      console.error(`缓存获取失败 [${key}]:`, e)
      this.remove(key)
      return null
    }
  }
}
```

#### 自动清理机制

```typescript
/**
 * 自动清理过期或损坏的本地缓存
 */
const autoCleanup = (): void => {
  if (!localStorage) {
    return
  }
  try {
    const keysToRemove: string[] = []
    const now = Date.now()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(KEY_PREFIX)) {
        try {
          const wrapper: CacheWrapper = JSON.parse(localStorage.getItem(key)!)
          if (wrapper && wrapper._expire && wrapper._expire < now) {
            keysToRemove.push(key)
          }
        } catch (e) {
          keysToRemove.push(key) // 删除损坏的缓存
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
    if (keysToRemove.length > 0) {
      console.log(`清理了 ${keysToRemove.length} 个过期缓存项`)
    }
  } catch (e) {
    console.warn('自动清理失败:', e)
  }
}

// 应用启动时清理过期缓存
if (typeof localStorage !== 'undefined') {
  setTimeout(() => autoCleanup(), 1000)
  // 每小时清理一次过期缓存
  setInterval(autoCleanup, 60 * 60 * 1000)
}
```

#### 存储统计

```typescript
/**
 * 获取本地缓存统计信息
 */
getStats(): {
  totalKeys: number
  appKeys: number
  usagePercent: number
} | null {
  if (!localStorage) {
    return null
  }
  try {
    const appKeys = Array.from({ length: localStorage.length })
      .map((_, i) => localStorage.key(i))
      .filter((key) => key && key.startsWith(KEY_PREFIX))
    const totalSize = JSON.stringify(localStorage).length
    const limitSize = 5 * 1024 * 1024 // 5MB限制
    return {
      totalKeys: localStorage.length,
      appKeys: appKeys.length,
      usagePercent: Math.min(100, Math.round((totalSize / limitSize) * 100))
    }
  } catch (e) {
    console.error('获取存储统计失败:', e)
    return null
  }
}
```

---

## XSS 防护

### 输入验证

#### 验证工具函数

```typescript
/**
 * 验证是否为有效URL
 */
export const isHttp = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * 路径匹配检查
 * 支持通配符匹配
 */
export const isPathMatch = (pattern: string, path: string): boolean => {
  if (pattern === path) {
    return true
  }

  // 支持通配符 *
  if (pattern.includes('*')) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    return regex.test(path)
  }

  return false
}
```

### 内容安全策略

#### HTML 转义

```typescript
/**
 * HTML特殊字符转义
 * 防止XSS攻击
 */
export const escapeHtml = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char])
}

/**
 * 反转义HTML字符
 */
export const unescapeHtml = (str: string): string => {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  }

  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => htmlUnescapes[entity])
}
```

### Vue 安全绑定

```vue
<template>
  <!-- ✅ 安全: 使用文本插值 -->
  <div>{{ userInput }}</div>

  <!-- ❌ 危险: 直接渲染HTML (需要确保内容安全) -->
  <div v-html="sanitizedHtml"></div>

  <!-- ✅ 安全: 使用转义后的内容 -->
  <div v-html="escapeHtml(userInput)"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { escapeHtml } from '@/utils/string'

const props = defineProps<{
  userInput: string
}>()

// 如果必须使用v-html，确保内容经过清理
const sanitizedHtml = computed(() => {
  // 使用DOMPurify或类似库清理HTML
  return DOMPurify.sanitize(props.userInput)
})
</script>
```

---

## 最佳实践

### 1. 敏感数据处理

**原则**: 敏感数据应加密存储和传输。

```typescript
// ✅ 正确: 加密存储敏感数据
const storeUserCredentials = async (username: string, password: string) => {
  const { encryptedData, key } = encryptWithAutoKey({ username, password })
  // 仅存储加密后的数据
  localCache.set('credentials', encryptedData, 3600)
}

// ❌ 错误: 明文存储密码
const badStore = (password: string) => {
  localCache.set('password', password) // 不安全!
}
```

### 2. Token 安全管理

**原则**: Token 应有过期时间,并在合适时机清理。

```typescript
// ✅ 正确: 设置Token过期时间
const login = async (token: string, expiresIn: number) => {
  const { setToken } = useToken()
  setToken(token, expiresIn) // 设置过期时间
}

// ✅ 正确: 登出时清理所有敏感数据
const logout = async () => {
  const { removeToken } = useToken()
  removeToken()
  localCache.clearAll()
  sessionCache.clearAll()
}
```

### 3. 权限检查前置

**原则**: 在数据请求前进行权限检查。

```typescript
// ✅ 正确: 先检查权限再请求数据
const loadUserData = async () => {
  const { hasPermission } = useAuth()

  if (!hasPermission('system:user:list')) {
    showMsgError('您没有查看用户列表的权限')
    return
  }

  const [err, data] = await http.get('/api/users')
  if (!err) {
    users.value = data
  }
}

// ❌ 错误: 先请求数据再检查权限
const badLoad = async () => {
  const [err, data] = await http.get('/api/users')
  // 请求已发出,即使没有权限也已经暴露了接口
}
```

### 4. 防重提交使用场景

**原则**: 重要操作必须防止重复提交。

```typescript
// ✅ 正确: 重要操作启用防重提交
const submitOrder = async (orderData: Order) => {
  // 默认启用防重提交
  const [err, data] = await http.post('/api/orders', orderData)
  return [err, data]
}

// ✅ 正确: 查询类操作可禁用防重提交
const searchUsers = async (keyword: string) => {
  const [err, data] = await http
    .noRepeatSubmit()
    .get('/api/users/search', { keyword })
  return [err, data]
}
```

### 5. 错误处理安全

**原则**: 不要向用户暴露敏感错误信息。

```typescript
// ✅ 正确: 友好的错误提示
const handleError = (error: Error) => {
  // 记录详细错误到日志
  console.error('详细错误:', error)

  // 向用户显示友好提示
  showMsgError('操作失败，请稍后重试')
}

// ❌ 错误: 暴露详细错误信息
const badErrorHandle = (error: Error) => {
  showMsgError(error.stack) // 可能暴露敏感信息
}
```

---

## 常见问题

### 1. Token 无故失效

**问题原因**:
- Token 过期时间设置过短
- 缓存被意外清理
- 跨域请求未携带认证头

**解决方案**:

```typescript
// 1. 检查Token过期时间设置
const setToken = (token: string) => {
  const { setToken } = useToken()
  // 设置合理的过期时间 (如7天)
  setToken(token, 7 * 24 * 3600)
}

// 2. 确保请求携带认证头
const secureRequest = async () => {
  // 默认会自动添加认证头
  const [err, data] = await http.get('/api/protected')

  // 如果需要手动添加
  const { getAuthHeaders } = useToken()
  const headers = getAuthHeaders()
  console.log('认证头:', headers)
}

// 3. 监听存储变化
window.addEventListener('storage', (e) => {
  if (e.key?.includes('token') && !e.newValue) {
    console.warn('Token被清除,可能需要重新登录')
  }
})
```

### 2. 加密数据解密失败

**问题原因**:
- RSA 密钥配置错误
- 前后端密钥不匹配
- 数据传输过程中被篡改

**解决方案**:

```typescript
// 1. 验证密钥配置
const checkKeyConfig = () => {
  const { rsaPublicKey, rsaPrivateKey } = SystemConfig.security

  if (!rsaPublicKey || !rsaPrivateKey) {
    console.error('RSA密钥未配置')
    return false
  }

  // 测试加解密
  const testData = 'test'
  const encrypted = rsaEncrypt(testData)
  const decrypted = rsaDecrypt(encrypted!)

  if (decrypted !== testData) {
    console.error('RSA密钥配对验证失败')
    return false
  }

  return true
}

// 2. 添加解密错误处理
const safeDecrypt = (encryptedData: string, key: CryptoJS.lib.WordArray) => {
  try {
    return decryptWithAes(encryptedData, key)
  } catch (error) {
    console.error('解密失败:', error)
    // 返回原始数据或null
    return null
  }
}
```

### 3. 权限指令不生效

**问题原因**:
- 指令未正确注册
- 权限数据未加载
- 权限标识拼写错误

**解决方案**:

```typescript
// 1. 确保指令已注册
// main.ts
import directives from '@/directives/directives'

const app = createApp(App)
directives(app) // 注册指令

// 2. 检查权限数据
const { hasPermission } = useAuth()
const userStore = useUserStore()

console.log('用户权限:', userStore.permissions)
console.log('是否有权限:', hasPermission('system:user:add'))

// 3. 使用计算属性动态控制
const canAddUser = computed(() => {
  return hasPermission('system:user:add')
})
```

### 4. 缓存数据丢失

**问题原因**:
- localStorage 被清理
- 存储空间不足
- 跨域隔离

**解决方案**:

```typescript
// 1. 检查存储空间
const checkStorage = () => {
  const stats = localCache.getStats()
  if (stats && stats.usagePercent > 80) {
    console.warn('存储空间不足,正在清理...')
    localCache.cleanup()
  }
}

// 2. 添加存储异常处理
const safeSet = <T>(key: string, value: T) => {
  try {
    localCache.set(key, value)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('存储空间已满')
      localCache.cleanup()
      // 重试
      localCache.set(key, value)
    }
  }
}

// 3. 使用sessionStorage作为备份
const setWithBackup = <T>(key: string, value: T) => {
  localCache.set(key, value)
  sessionCache.setJSON(key, value) // 备份到会话存储
}
```

### 5. 重复提交检测误报

**问题原因**:
- 时间间隔设置过长
- 数据序列化不一致
- 正常的连续操作被阻止

**解决方案**:

```typescript
// 1. 特定请求禁用防重提交
const quickSubmit = async (data: any) => {
  const [err, result] = await http
    .noRepeatSubmit()
    .post('/api/quick-action', data)
  return [err, result]
}

// 2. 自定义重复检测逻辑
const customRepeatCheck = (url: string, data: any) => {
  const key = `${url}_${JSON.stringify(data)}`
  const lastTime = sessionCache.getNumber(`repeat_${key}`)
  const now = Date.now()

  // 自定义间隔时间
  const interval = 1000 // 1秒

  if (lastTime && now - lastTime < interval) {
    return true // 是重复提交
  }

  sessionCache.set(`repeat_${key}`, String(now))
  return false
}
```

---

## 安全检查清单

### 开发阶段

- [ ] 所有敏感数据使用加密存储
- [ ] Token 设置合理的过期时间
- [ ] 所有 API 请求添加认证头
- [ ] 重要操作启用防重提交
- [ ] 用户输入经过验证和转义
- [ ] 权限指令正确使用
- [ ] 错误信息不暴露敏感内容

### 测试阶段

- [ ] 测试 Token 过期处理
- [ ] 测试权限控制是否生效
- [ ] 测试加密解密功能
- [ ] 测试 XSS 防护
- [ ] 测试重复提交防护
- [ ] 测试会话过期处理

### 部署阶段

- [ ] 生产环境禁用调试信息
- [ ] 配置正确的 RSA 密钥
- [ ] 启用 HTTPS
- [ ] 配置 CSP 头
- [ ] 移除 console 输出
- [ ] 开启代码混淆

### 运维阶段

- [ ] 定期检查依赖安全
- [ ] 监控异常登录行为
- [ ] 定期更新密钥
- [ ] 检查存储使用情况
- [ ] 审计敏感操作日志

---

## 总结

RuoYi-Plus-UniApp 前端安全体系通过多层次的安全机制,为应用提供全面的安全防护:

1. **数据加密**: AES + RSA 混合加密,确保数据传输安全
2. **权限控制**: 路由守卫 + 指令权限,实现细粒度访问控制
3. **Token 管理**: 安全存储 + 过期处理,保护用户会话
4. **请求安全**: 防重提交 + 请求追踪,防止恶意请求
5. **存储安全**: 前缀隔离 + 过期清理,保护本地数据

通过遵循本文档的安全实践和检查清单,可以有效提升前端应用的安全性,保护用户数据和系统资源。
