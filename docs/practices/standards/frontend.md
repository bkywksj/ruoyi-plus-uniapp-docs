# 前端开发规范

> 本文档详细介绍 RuoYi-Plus-UniApp 前端项目的开发规范,涵盖项目结构、代码风格、组件开发、状态管理等方面的最佳实践。

## 简介

RuoYi-Plus-UniApp 前端项目基于 Vue 3 + TypeScript + Element Plus 技术栈构建,采用 Vite 作为构建工具,Pinia 进行状态管理。本规范旨在统一团队开发标准,提高代码质量和可维护性。

**核心原则:**

- **一致性** - 全团队遵循统一的编码风格和约定
- **可读性** - 代码清晰易懂,便于维护和协作
- **可维护性** - 模块化设计,职责分离清晰
- **类型安全** - 充分利用 TypeScript 的类型系统
- **性能优先** - 关注运行时性能和构建产物体积

**技术栈版本:**

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.13 | 渐进式 JavaScript 框架 |
| TypeScript | ~5.8.3 | JavaScript 的超集 |
| Element Plus | 2.9.8 | Vue 3 组件库 |
| Pinia | 3.0.2 | Vue 状态管理 |
| Vue Router | 4.5.0 | Vue 路由管理 |
| Vite | 6.3.2 | 下一代前端构建工具 |
| UnoCSS | 66.5.2 | 原子化 CSS 引擎 |
| ESLint | 9.21.0 | 代码检查工具 |
| Prettier | 3.5.2 | 代码格式化工具 |

---

## 项目结构规范

### 目录结构

```
plus-ui/
├── .vscode/                    # VS Code 配置
├── bin/                        # 脚本文件
├── env/                        # 环境变量配置
│   ├── .env.development       # 开发环境
│   ├── .env.production        # 生产环境
│   └── .env.staging           # 测试环境
├── node_modules/              # 依赖包
├── public/                    # 静态资源
│   ├── favicon.ico
│   └── ...
├── src/                       # 源代码目录
│   ├── api/                   # API 接口定义
│   │   ├── business/          # 业务模块 API
│   │   ├── common/            # 公共 API
│   │   ├── system/            # 系统模块 API
│   │   ├── tool/              # 工具模块 API
│   │   └── workflow/          # 工作流模块 API
│   ├── assets/                # 静态资源
│   │   ├── icons/             # 图标资源
│   │   ├── images/            # 图片资源
│   │   └── styles/            # 样式文件
│   ├── components/            # 全局公共组件
│   ├── composables/           # 组合式函数
│   ├── directives/            # 自定义指令
│   ├── layouts/               # 布局组件
│   ├── locales/               # 国际化资源
│   ├── plugins/               # 插件配置
│   ├── router/                # 路由配置
│   ├── stores/                # Pinia 状态管理
│   │   ├── modules/           # 状态模块
│   │   └── store.ts           # Store 入口
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   ├── views/                 # 页面组件
│   ├── App.vue                # 根组件
│   ├── main.ts                # 应用入口
│   └── systemConfig.ts        # 系统配置
├── vite/                      # Vite 配置
├── .editorconfig              # 编辑器配置
├── .eslintrc-auto-import.json # ESLint 自动导入配置
├── .gitignore                 # Git 忽略配置
├── .npmrc                     # npm 配置
├── .prettierignore            # Prettier 忽略配置
├── .prettierrc.js             # Prettier 配置
├── eslint.config.ts           # ESLint 配置
├── index.html                 # HTML 入口
├── package.json               # 项目依赖配置
├── tsconfig.json              # TypeScript 配置
├── uno.config.ts              # UnoCSS 配置
└── vite.config.ts             # Vite 配置
```

### 目录命名规范

1. **全小写**: 目录名称一律使用小写字母
2. **连字符分隔**: 多个单词使用连字符分隔
3. **语义化**: 目录名称应清晰表达其用途

```
✅ 正确
src/components/
src/views/system/
src/api/business/base/

❌ 错误
src/Components/          # 不应使用大写
src/views/System/        # 不应使用大写
src/api/Business_Base/   # 不应使用下划线
```

### API 目录结构规范

API 目录按业务模块组织,每个模块包含接口文件和类型定义文件:

```
src/api/
├── system/                    # 系统模块
│   ├── auth/                  # 认证相关
│   │   ├── authApi.ts        # 接口定义
│   │   ├── authTypes.ts      # 类型定义
│   │   └── socialConfig.ts   # 社交登录配置
│   ├── config/               # 配置管理
│   │   └── config/
│   │       ├── configApi.ts
│   │       └── configTypes.ts
│   ├── core/                 # 核心功能
│   │   ├── user/
│   │   ├── role/
│   │   └── menu/
│   └── dict/                 # 字典管理
├── business/                 # 业务模块
│   └── base/
│       ├── ad/
│       │   ├── adApi.ts
│       │   └── adTypes.ts
│       └── goods/
└── workflow/                 # 工作流模块
```

---

## 代码风格规范

### ESLint 配置

项目使用 ESLint 9.x 的 Flat Config 格式,集成 Vue 和 TypeScript 支持:

```typescript
// eslint.config.ts
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import prettier from 'eslint-plugin-prettier'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  // 检查文件类型
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,cjs,ts,mts,tsx,vue}']
  },

  // 忽略文件
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/locales/**/*.ts']
  },

  // 语言选项
  {
    languageOptions: {
      globals: globals.browser
    }
  },

  // Vue 基本规则
  pluginVue.configs['flat/essential'],

  // TypeScript 推荐规则
  vueTsConfigs.recommended,

  // Prettier 配置
  skipFormatting,

  // 自定义规则
  {
    plugins: { prettier },
    rules: {
      // TypeScript 规则
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      // Vue 规则
      'vue/multi-word-component-names': 'off',
      'vue/valid-define-props': 'off',
      'vue/no-v-model-argument': 'off',

      // 其他规则
      'prefer-rest-params': 'off',
      'prettier/prettier': 'error'
    }
  }
)
```

### Prettier 配置

项目使用 Prettier 进行代码格式化,配置如下:

```javascript
// .prettierrc.js
export default {
  // 单行最大宽度 150 字符
  printWidth: 150,

  // 缩进宽度 2 个空格
  tabWidth: 2,

  // 使用空格缩进
  useTabs: false,

  // 不使用分号
  semi: false,

  // 使用单引号
  singleQuote: true,

  // 保持对象属性引号原样
  quoteProps: 'preserve',

  // JSX 中使用双引号
  jsxSingleQuote: false,

  // 闭合括号另起一行
  bracketSameLine: false,

  // 不使用尾随逗号
  trailingComma: 'none',

  // 大括号内添加空格
  bracketSpacing: true,

  // 箭头函数参数总是使用括号
  arrowParens: 'always',

  // 保持文本换行方式
  proseWrap: 'preserve',

  // HTML 空白符敏感度
  htmlWhitespaceSensitivity: 'css',

  // Vue 文件不缩进 script 和 style
  vueIndentScriptAndStyle: false,

  // 自动检测换行符
  endOfLine: 'auto'
}
```

### 代码格式化命令

```bash
# ESLint 检查
pnpm lint:eslint

# ESLint 自动修复
pnpm lint:eslint:fix

# Prettier 格式化
pnpm prettier
```

---

## TypeScript 规范

### tsconfig.json 配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // 基本配置
    "baseUrl": ".",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],

    // 严格模式
    "strict": true,
    "noImplicitAny": false,
    "strictFunctionTypes": false,
    "strictNullChecks": false,

    // 模块配置
    "allowJs": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    // 输出配置
    "noEmit": true,
    "sourceMap": true,
    "removeComments": true,

    // 路径别名
    "paths": {
      "@/*": ["./src/*"]
    },

    // 类型定义
    "types": ["node", "vite/client"],

    // 其他配置
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "vite.config.ts",
    "vitest.config.ts",
    "eslint.config.ts",
    "src/**/*.d.ts"
  ],
  "exclude": ["node_modules", "dist", "src/**/__tests__/*"]
}
```

### 类型定义规范

#### 接口定义

```typescript
// ✅ 正确 - 使用 interface 定义对象类型
/**
 * 验证码信息
 */
export interface CaptchaVo {
  /** 是否开启多租户 */
  tenantEnabled: boolean
  /** 租户ID */
  tenantId: string
  /** 是否开启验证码 */
  captchaEnabled: boolean
  /** 验证码唯一标识 */
  uuid: string
  /** 验证码图片（Base64编码） */
  img: string
}

// ❌ 错误 - 接口名使用 I 前缀（本项目不使用）
export interface ICaptchaVo { }

// ❌ 错误 - 缺少注释
export interface CaptchaVo {
  tenantEnabled: boolean
  tenantId: string
}
```

#### 类型别名

```typescript
// ✅ 正确 - 使用 type 定义联合类型
export type AuthType = 'password' | 'email' | 'sms' | 'social'

// ✅ 正确 - 使用 type 定义复合类型
export type LoginRequest = PasswordLoginBody | EmailLoginBody | SmsLoginBody | SocialLoginBody

// ✅ 正确 - 使用 type 定义函数类型
export type Result<T> = Promise<[Error | null, T | null]>
```

#### 枚举定义

```typescript
// ✅ 正确 - 字典类型枚举
export enum DictTypes {
  /** 审核状态 */
  sys_audit_status = 'sys_audit_status',
  /** 逻辑标志 */
  sys_boolean_flag = 'sys_boolean_flag',
  /** 启用状态 */
  sys_enable_status = 'sys_enable_status',
  /** 用户性别 */
  sys_user_gender = 'sys_user_gender'
}

// 使用示例
const { sys_user_gender, dictLoading } = useDict(DictTypes.sys_user_gender)
```

#### 泛型使用

```typescript
// ✅ 正确 - 响应式引用类型
const userInfo = ref<SysUserVo | null>(null)
const roles = ref<Array<string>>([])

// ✅ 正确 - API 返回类型
export const userLogin = (data: LoginRequest): Result<AuthTokenVo> => {
  return http.post<AuthTokenVo>('/auth/userLogin', data)
}

// ✅ 正确 - 缓存包装类型
interface CacheWrapper<T = any> {
  data: T
  expire: number
}
```

### 类型导入导出

```typescript
// ✅ 正确 - 使用 type 关键字导入类型
import type { CaptchaVo, LoginRequest, AuthTokenVo } from './authTypes'

// ✅ 正确 - 混合导入（值和类型）
import { userLogin, userLogout } from '@/api/system/auth/authApi'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

// ✅ 正确 - 导出类型
export type { CaptchaVo, LoginRequest }
export interface AuthTokenVo { }
```

---

## Vue 组件规范

### 组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
/**
 * 组件说明
 * @description 组件功能描述
 */

// ==================== 导入 ====================
import { ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'

// ==================== 类型定义 ====================
interface Props {
  // Props 类型
}

// ==================== Props ====================
const props = withDefaults(defineProps<Props>(), {
  // 默认值
})

// ==================== Emits ====================
const emit = defineEmits<{
  change: [value: string]
  submit: [data: FormData]
}>()

// ==================== 响应式数据 ====================
const loading = ref(false)
const formData = reactive({})

// ==================== 计算属性 ====================
const isValid = computed(() => {})

// ==================== 方法 ====================
const handleSubmit = () => {}

// ==================== 生命周期 ====================
onMounted(() => {})

// ==================== 暴露方法 ====================
defineExpose({
  reset: () => {}
})
</script>

```

### 组件命名规范

#### 文件命名

```
✅ 正确
AAiAssistant.vue          # 业务组件（A 前缀）
ASearchForm.vue           # 业务组件
DictTag.vue               # 基础组件
Icon.vue                  # 基础组件
Pagination.vue            # 基础组件
index.vue                 # 页面入口组件

❌ 错误
ai-assistant.vue          # 应使用大驼峰
aAiAssistant.vue          # 首字母应大写
AiAssistant.Vue           # 扩展名应小写
```

#### 组件名称

```typescript
// ✅ 正确 - 使用 defineOptions 定义组件名
defineOptions({
  name: 'UserManagement'
})

// ✅ 正确 - 业务组件使用 A 前缀
defineOptions({
  name: 'AAiAssistant'
})
```

### Props 规范

```typescript
// ✅ 正确 - 使用 TypeScript 接口定义
interface Props {
  /** 用户ID */
  userId: number
  /** 用户名 */
  userName?: string
  /** 状态 */
  status?: 'active' | 'inactive'
}

const props = withDefaults(defineProps<Props>(), {
  userName: '',
  status: 'active'
})

// ❌ 错误 - 使用运行时声明
const props = defineProps({
  userId: Number,
  userName: String
})
```

### Emits 规范

```typescript
// ✅ 正确 - 使用 TypeScript 定义
const emit = defineEmits<{
  /** 值变化事件 */
  change: [value: string]
  /** 提交事件 */
  submit: [data: FormData]
  /** 取消事件 */
  cancel: []
}>()

// 触发事件
emit('change', newValue)
emit('submit', formData)
emit('cancel')

// ❌ 错误 - 使用数组声明
const emit = defineEmits(['change', 'submit'])
```

### 模板规范

```vue
<template>
  <!-- ✅ 正确 - 使用语义化标签 -->
  <div class="user-management">
    <header class="user-management__header">
      <h1>{{ title }}</h1>
    </header>
    <main class="user-management__content">
      <el-table :data="tableData" v-loading="loading">
        <!-- 表格列 -->
      </el-table>
    </main>
    <footer class="user-management__footer">
      <el-pagination />
    </footer>
  </div>
</template>

<!-- ❌ 错误 - 过度嵌套和不清晰的结构 -->
<template>
  <div>
    <div>
      <div>
        <div>内容</div>
      </div>
    </div>
  </div>
</template>
```

---

## API 接口规范

### 接口文件结构

每个 API 模块包含两个文件:

- `xxxApi.ts` - 接口定义
- `xxxTypes.ts` - 类型定义

```typescript
// authApi.ts - 接口定义
import type { CaptchaVo, LoginRequest, AuthTokenVo } from './authTypes'
import { withHeaders } from '@/utils/function'

// ==================== 基础认证相关接口 ====================

/**
 * 用户登录接口
 * @param data 登录数据对象，包含用户名、密码等信息
 * @returns 返回登录结果，包含token等用户认证信息
 */
export const userLogin = (data: LoginRequest): Result<AuthTokenVo> => {
  const params = {
    ...data,
    authType: data.authType || 'password'
  }
  return http.post<AuthTokenVo>(
    '/auth/userLogin',
    params,
    withHeaders({
      auth: false,
      isEncrypt: true,
      repeatSubmit: false
    })
  )
}

/**
 * 用户注销接口
 * @returns 返回注销结果
 */
export const userLogout = (): Result<void> => {
  return http.noMsgError().post<void>('/auth/userLogout', {}, withHeaders({ repeatSubmit: false }))
}
```

### 接口命名规范

```typescript
// ✅ 正确 - 查询类
export const pageUsers = (query?: UserQuery): Result<PageResult<UserVo>> => {}
export const listUsers = (query?: UserQuery): Result<UserVo[]> => {}
export const getUser = (id: number): Result<UserVo> => {}
export const getUserInfo = (): Result<UserInfoVo> => {}

// ✅ 正确 - 操作类
export const addUser = (data: UserBo): Result<number> => {}
export const updateUser = (data: UserBo): Result<void> => {}
export const deleteUsers = (ids: number[]): Result<void> => {}

// ✅ 正确 - 特殊操作
export const exportUsers = (query?: UserQuery): Result<Blob> => {}
export const importUsers = (file: File): Result<void> => {}
export const resetPassword = (userId: number): Result<void> => {}

// ❌ 错误
export const PageUsers = () => {}        // 首字母不应大写
export const user_list = () => {}        // 不应使用下划线
export const queryUsers = () => {}       // 应使用 page/list/get
```

### 类型定义规范

```typescript
// xxxTypes.ts - 类型定义

/**
 * 用户查询参数
 */
export interface UserQuery {
  /** 用户名 */
  userName?: string
  /** 手机号 */
  phone?: string
  /** 状态 */
  status?: string
  /** 部门ID */
  deptId?: number
  /** 页码 */
  pageNum?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 用户业务对象
 */
export interface UserBo {
  /** 用户ID */
  userId?: number
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 密码 */
  password?: string
  /** 状态 */
  status?: string
  /** 角色ID列表 */
  roleIds?: number[]
}

/**
 * 用户视图对象
 */
export interface UserVo {
  /** 用户ID */
  userId: number
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone: string
  /** 头像 */
  avatar: string
  /** 状态 */
  status: string
  /** 创建时间 */
  createTime: string
}
```

---

## 状态管理规范

### Store 定义

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'

/**
 * 用户状态管理
 * @description 管理用户认证、权限和个人信息等状态
 */

const USER_MODULE = 'user'

export const useUserStore = defineStore(USER_MODULE, () => {
  // ==================== 状态 ====================

  /**
   * 用户令牌
   */
  const token = ref('')

  /**
   * 用户基本信息
   */
  const userInfo = ref<SysUserVo | null>(null)

  /**
   * 用户角色编码集合
   */
  const roles = ref<Array<string>>([])

  /**
   * 用户权限编码集合
   */
  const permissions = ref<Array<string>>([])

  // ==================== Getters ====================

  /**
   * 是否已登录
   */
  const isLoggedIn = computed(() => !!token.value)

  /**
   * 用户头像
   */
  const avatar = computed(() => userInfo.value?.avatar || defaultAvatar)

  // ==================== Actions ====================

  /**
   * 用户登录
   * @param loginRequest 登录信息
   */
  const loginUser = async (loginRequest: LoginRequest): Result<void> => {
    const [err, data] = await userLogin(loginRequest)
    if (err) {
      return [err, null]
    }
    token.value = data.access_token
    return [null, null]
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async (): Result<void> => {
    const [err, data] = await getUserInfo()
    if (err) {
      return [err, null]
    }
    userInfo.value = data.user
    roles.value = data.roles || []
    permissions.value = data.permissions || []
    return [null, null]
  }

  /**
   * 用户注销
   */
  const logoutUser = async (): Result<void> => {
    await userLogout()
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
    return [null, null]
  }

  // ==================== 返回 ====================

  return {
    // 状态
    token,
    userInfo,
    roles,
    permissions,

    // Getters
    isLoggedIn,
    avatar,

    // Actions
    loginUser,
    fetchUserInfo,
    logoutUser
  }
})
```

### Store 命名规范

```typescript
// ✅ 正确
export const useUserStore = defineStore('user', () => {})
export const useDictStore = defineStore('dict', () => {})
export const usePermissionStore = defineStore('permission', () => {})

// ❌ 错误
export const userStore = defineStore('user', () => {})      // 缺少 use 前缀
export const useUser = defineStore('user', () => {})        // 缺少 Store 后缀
export const useUserStorage = defineStore('user', () => {}) // 应为 Store 不是 Storage
```

### Store 使用

```typescript
// 在组件中使用
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 访问状态
const userName = computed(() => userStore.userInfo?.userName)

// 调用方法
const handleLogin = async () => {
  const [err] = await userStore.loginUser(loginForm)
  if (!err) {
    router.push('/')
  }
}
```

---

## Composables 规范

### 组合式函数定义

```typescript
// composables/useDict.ts

/**
 * 字典数据钩子函数
 *
 * 功能说明：
 * - 字典获取: 支持同时获取多个字典类型的数据
 * - 缓存利用: 优先从缓存获取数据
 * - 自动缓存: 自动将API获取的字典数据存入缓存
 * - 状态跟踪: 提供加载状态指示器
 */

interface DataResult {
  dictLoading: Ref<boolean>
  [key: string]: DictItem[]
}

/**
 * 获取字典数据的组合式API
 * @param args 需要获取的字典类型数组
 * @returns 包含所有请求字典类型的响应式对象以及加载状态
 *
 * @example
 * const { sys_user_gender, sys_enable_status, dictLoading } = useDict(
 *   DictTypes.sys_user_gender,
 *   DictTypes.sys_enable_status
 * )
 */
export const useDict = (...args: string[]): DataResult => {
  const dictStore = useDictStore()
  const dictObject = reactive<Record<string, DictItem[]>>({})
  const dictLoading = ref(true)

  const promises: Promise<void>[] = []

  args.forEach((dictType) => {
    dictObject[dictType] = []

    const cachedDict = dictStore.getDict(dictType)
    let promise: Promise<void>

    if (cachedDict) {
      dictObject[dictType] = cachedDict
      promise = Promise.resolve()
    } else {
      promise = listDictDatasByDictType(dictType).then(([err, data]) => {
        if (err) {
          console.error(`获取字典[${dictType}]失败:`, err)
          return
        }
        const dictData = data.map((p): DictItem => ({
          label: p.dictLabel,
          value: p.dictValue,
          status: p.status,
          elTagType: p.listClass,
          elTagClass: p.cssClass
        }))
        dictObject[dictType] = dictData
        dictStore.setDict(dictType, dictData)
      })
    }

    promises.push(promise)
  })

  Promise.all(promises).finally(() => {
    dictLoading.value = false
  })

  return {
    ...toRefs(dictObject),
    dictLoading
  } as DataResult
}
```

### Composables 命名规范

```typescript
// ✅ 正确 - 文件命名
useDict.ts
useAuth.ts
useDialog.ts
useDownload.ts

// ✅ 正确 - 函数命名
export const useDict = () => {}
export const useAuth = () => {}
export const useDialog = () => {}
export const useTableHeight = () => {}

// ❌ 错误
Dict.ts                    // 缺少 use 前缀
usedict.ts                 // Dict 首字母应大写
export const dict = () => {} // 缺少 use 前缀
```

### Composables 使用

```typescript
// 在组件中使用
import { useDict } from '@/composables/useDict'
import { DictTypes } from '@/composables/useDict'

// 获取字典数据
const { sys_user_gender, sys_enable_status, dictLoading } = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status
)

// 在模板中使用
// <el-select v-model="form.gender" :loading="dictLoading">
//   <el-option
//     v-for="dict in sys_user_gender"
//     :key="dict.value"
//     :label="dict.label"
//     :value="dict.value"
//   />
// </el-select>
```

---

## 工具函数规范

### 文件组织

```
src/utils/
├── boolean.ts      # 布尔值处理
├── cache.ts        # 缓存工具
├── class.ts        # CSS 类名处理
├── colors.ts       # 颜色处理
├── crypto.ts       # 加密解密
├── date.ts         # 日期处理
├── format.ts       # 格式化工具
├── function.ts     # 通用函数
├── modal.ts        # 弹窗工具
├── object.ts       # 对象处理
├── rsa.ts          # RSA 加密
├── scroll.ts       # 滚动工具
├── string.ts       # 字符串处理
├── tab.ts          # 标签页工具
├── to.ts           # 异步处理
├── tree.ts         # 树形数据处理
└── validators.ts   # 验证器
```

### 工具函数示例

```typescript
// utils/format.ts

/**
 * 格式化金额
 * @param value 金额数值
 * @param decimals 小数位数
 * @returns 格式化后的金额字符串
 */
export const formatMoney = (value: number, decimals = 2): string => {
  if (isNaN(value)) return '0.00'
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param format 格式字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  // 实现
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
```

---

## 样式规范

### 全局样式结构

```
src/assets/styles/
├── main.scss           # 样式入口
├── variables.scss      # CSS 变量
├── mixins.scss         # SCSS 混入
├── reset.scss          # 样式重置
├── element-plus.scss   # Element Plus 覆盖
└── utilities.scss      # 工具类
```

### 组件样式规范

```vue

```

### UnoCSS 使用

```vue
<template>
  <!-- ✅ 正确 - 使用原子化 CSS -->
  <div class="flex items-center justify-between p-4">
    <span class="text-lg font-bold text-primary">标题</span>
    <el-button class="ml-2">操作</el-button>
  </div>

  <!-- ✅ 正确 - 复杂样式使用组件样式 -->
  <div class="user-card">
    <div class="user-card__avatar">
      <img :src="avatar" alt="avatar" />
    </div>
  </div>
</template>
```

---

## 最佳实践

### 1. 异步操作处理

```typescript
// ✅ 正确 - 使用统一的错误处理模式
const handleSubmit = async () => {
  const [err, data] = await userLogin(loginForm)
  if (err) {
    ElMessage.error(err.message)
    return
  }
  ElMessage.success('登录成功')
  router.push('/')
}

// ❌ 错误 - try-catch 嵌套过深
const handleSubmit = async () => {
  try {
    const data = await userLogin(loginForm)
    try {
      await getUserInfo()
      router.push('/')
    } catch (e) {
      console.error(e)
    }
  } catch (e) {
    console.error(e)
  }
}
```

### 2. 响应式数据使用

```typescript
// ✅ 正确 - 基本类型使用 ref
const loading = ref(false)
const count = ref(0)
const userName = ref('')

// ✅ 正确 - 对象类型使用 reactive
const formData = reactive({
  userName: '',
  password: '',
  rememberMe: false
})

// ✅ 正确 - 复杂对象可以使用 ref
const userInfo = ref<UserVo | null>(null)

// ❌ 错误 - 不必要的 reactive 包装基本类型
const loading = reactive({ value: false })
```

### 3. 计算属性使用

```typescript
// ✅ 正确 - 派生状态使用 computed
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

const isFormValid = computed(() => {
  return formData.userName.length > 0 && formData.password.length >= 6
})

// ❌ 错误 - 在 watch 中手动同步
const fullName = ref('')
watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`
})
```

### 4. 组件通信

```typescript
// ✅ 正确 - Props 向下传递
// 父组件
<UserCard :user="currentUser" @edit="handleEdit" />

// 子组件
const props = defineProps<{ user: UserVo }>()
const emit = defineEmits<{ edit: [userId: number] }>()

// ✅ 正确 - 复杂状态使用 Store
const userStore = useUserStore()
const currentUser = computed(() => userStore.userInfo)

// ❌ 错误 - 滥用 provide/inject 进行简单数据传递
```

### 5. 列表渲染

```vue
<template>
  <!-- ✅ 正确 - 使用唯一 key -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>

  <!-- ✅ 正确 - 使用 v-show 控制频繁切换 -->
  <div v-show="isVisible">频繁切换的内容</div>

  <!-- ✅ 正确 - 使用 v-if 控制不常切换 -->
  <div v-if="hasPermission">需要权限的内容</div>

  <!-- ❌ 错误 - 使用 index 作为 key -->
  <div v-for="(item, index) in list" :key="index">
    {{ item.name }}
  </div>
</template>
```

### 6. 防抖和节流

```typescript
// ✅ 正确 - 搜索输入防抖
import { useDebounceFn } from '@vueuse/core'

const handleSearch = useDebounceFn((value: string) => {
  fetchSearchResults(value)
}, 300)

// ✅ 正确 - 滚动事件节流
import { useThrottleFn } from '@vueuse/core'

const handleScroll = useThrottleFn(() => {
  checkScrollPosition()
}, 100)
```

---

## 常见问题

### Q1: 如何组织大型组件？

**A:** 对于复杂组件,建议拆分为多个子组件和组合式函数:

```
components/UserManagement/
├── index.vue           # 主组件
├── UserTable.vue       # 表格组件
├── UserForm.vue        # 表单组件
├── UserSearch.vue      # 搜索组件
├── useUserTable.ts     # 表格逻辑
└── types.ts            # 类型定义
```

### Q2: API 请求应该放在哪里调用？

**A:**
- **简单页面**: 直接在组件中调用
- **复杂页面**: 在 Composables 中封装
- **全局状态**: 在 Store 中调用

### Q3: 如何处理表单验证？

**A:** 使用 Element Plus 的表单验证:

```typescript
const rules = reactive<FormRules>({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
})
```

### Q4: 如何优化组件性能？

**A:**
- 使用 `v-show` 替代频繁切换的 `v-if`
- 大列表使用虚拟滚动
- 避免在模板中使用复杂表达式
- 使用 `shallowRef` 和 `shallowReactive` 处理大对象
- 合理使用 `computed` 缓存计算结果

### Q5: TypeScript 类型报错如何处理？

**A:**
- 优先修复类型定义
- 使用类型断言 `as`
- 必要时使用 `@ts-expect-error` 注释
- 复杂类型可以使用 `any`（但应尽量避免）

---

## 检查清单

### 代码提交前检查

- [ ] 运行 `pnpm lint:eslint` 无错误
- [ ] 运行 `pnpm prettier` 格式化代码
- [ ] TypeScript 无类型错误
- [ ] 组件有完整的 Props 类型定义
- [ ] API 接口有完整的类型定义
- [ ] 关键函数有 JSDoc 注释
- [ ] 无 `console.log` 调试代码（除非有意保留）
- [ ] 敏感信息未硬编码

### 组件开发检查

- [ ] 组件名称符合命名规范
- [ ] Props 和 Emits 有类型定义
- [ ] 使用 `scoped` 样式
- [ ] 样式使用 BEM 命名
- [ ] 响应式数据使用正确
- [ ] 生命周期钩子使用正确

### API 开发检查

- [ ] 接口函数命名符合规范
- [ ] 类型定义完整
- [ ] 有 JSDoc 注释
- [ ] 错误处理正确

---

*本文档基于 RuoYi-Plus-UniApp 实际源码整理,涵盖前端开发的核心规范和最佳实践。*
