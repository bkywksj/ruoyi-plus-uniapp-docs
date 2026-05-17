# 移动端开发规范

> 本文档详细介绍 RuoYi-Plus-UniApp 移动端项目（plus-uniapp / plus-app）的开发规范,涵盖项目结构、代码风格、组件开发、页面路由、状态管理、多端适配等方面的最佳实践。

## 简介

plus-uniapp 是 RuoYi-Plus-UniApp 体系的移动端实现,基于 UniApp + Vue 3 + TypeScript 构建,使用 Vite 作为构建工具,Pinia 进行状态管理,以自维护的 Wot Design Uni（WD UI）组件库作为基础 UI 层。该项目同时支持 H5、微信/支付宝/百度/抖音等十余个小程序平台和 App（Android/iOS/Harmony）三大端,通过统一的源码体系实现"一次开发、多端发布"。

本规范的目标是把分散在多端的差异收敛到一个清晰、可执行的标准里,既保证团队产出的一致性,也确保移动端代码可与 plus-ui 管理端、ruoyi-admin 后端在 API 层、命名层、类型层保持对齐。

**核心原则:**

- **一致性** - 全团队遵循统一的编码风格、命名约定、目录结构
- **多端兼容** - 编写代码时优先考虑跨端能力,避免不必要的平台特异
- **类型安全** - 充分利用 TypeScript 的类型系统,API 与 Store 必须类型化
- **性能优先** - 关注首屏加载、列表渲染、网络请求与渲染开销
- **WD 优先** - 基础 UI 必须使用 WD UI 组件,避免引入第二套移动端 UI 库
- **响应式单位** - 所有可变尺寸使用 `rpx`,固定细节(描边、阴影偏移)使用 `px`

**技术栈版本:**

| 技术 | 版本 | 说明 |
|------|------|------|
| UniApp | 3.0.0-4060620250520001 | DCloud 跨端框架 |
| Vue | 3.4.21 | 渐进式 JavaScript 框架 |
| TypeScript | ~5.7.2 | JavaScript 的超集 |
| Vite | 6.3.5 | 下一代前端构建工具 |
| Pinia | 2.0.36 | Vue 状态管理 |
| UnoCSS | 65.4.2 | 原子化 CSS 引擎 |
| Sass | 1.77.8 | CSS 预处理器 |
| Wot Design Uni (WD UI) | 自维护 | 内置移动端组件库,源码位于 `src/wd/` |
| ESLint | 9+ | 代码检查工具 |
| Crypto-JS | 4.2.0 | 加密工具(AES/SHA/Base64) |

**支持平台矩阵:**

| 平台分类 | 具体平台 | 编译命令 |
|---------|---------|---------|
| H5 | 浏览器 / WebView | `pnpm dev:h5` / `pnpm build:h5` |
| 小程序 | 微信、支付宝、百度、抖音、QQ、京东、快手、飞书、小红书、华为快应用 | `pnpm dev:mp-weixin` 等 |
| App | Android、iOS、Harmony | `pnpm dev:app` / `pnpm dev:app-android` 等 |

---

## 项目结构规范

### 目录结构

```text
plus-uniapp/
├── env/                         # 环境变量配置
│   ├── .env.development        # 开发环境
│   ├── .env.production         # 生产环境
│   └── .env.staging            # 测试环境
├── src/                        # 源代码目录
│   ├── api/                    # API 接口定义
│   │   ├── app/                # App/移动端专属接口
│   │   ├── common/             # 公共接口(登录、字典、上传等)
│   │   └── system/             # 系统模块接口
│   ├── components/             # 全局公共组件(业务相关)
│   ├── composables/            # 组合式函数
│   │   ├── useAuth.ts          # 鉴权
│   │   ├── useDict.ts          # 字典
│   │   ├── useHttp.ts          # HTTP 请求封装
│   │   ├── useI18n.ts          # 国际化
│   │   ├── usePayment.ts       # 支付
│   │   ├── useTheme.ts         # 主题
│   │   ├── useToken.ts         # Token 管理
│   │   ├── useWebSocket.ts     # WebSocket
│   │   └── ...
│   ├── layouts/                # 布局组件
│   ├── locales/                # 国际化资源(zh-CN / en-US 等)
│   ├── pages/                  # 主包页面
│   ├── pages-sub/              # 分包页面(小程序按需加载)
│   ├── static/                 # 静态资源(图片、字体、SVG)
│   ├── stores/                 # Pinia 状态管理
│   │   ├── modules/            # 状态模块
│   │   └── store.ts            # Store 入口
│   ├── types/                  # TypeScript 类型定义
│   ├── uni_modules/            # UniApp 插件市场组件
│   ├── utils/                  # 工具函数
│   │   ├── cache.ts            # 缓存封装
│   │   ├── crypto.ts           # 加密
│   │   ├── date.ts             # 日期
│   │   ├── platform.ts         # 平台判断
│   │   ├── route.ts            # 路由跳转封装
│   │   ├── tenant.ts           # 多租户
│   │   ├── validators.ts       # 校验
│   │   └── ...
│   ├── wd/                     # WD UI 组件库源码(自维护)
│   │   ├── components/         # 组件实现
│   │   ├── locale/             # 国际化资源
│   │   └── index.ts            # 导出入口
│   ├── App.vue                 # 应用根组件
│   ├── main.ts                 # 应用入口
│   ├── manifest.json           # 编译时生成的 manifest
│   ├── pages.json              # 编译时生成的 pages 路由
│   ├── systemConfig.ts         # 系统配置
│   ├── uni.scss                # UniApp 全局样式变量
│   └── ...
├── vite/                       # Vite 配置
├── eslint.config.mjs           # ESLint 配置
├── manifest.config.ts          # 应用配置(源,生成 manifest.json)
├── pages.config.mts            # 页面路由配置(源,生成 pages.json)
├── package.json                # 项目依赖
├── tsconfig.json               # TypeScript 配置
├── uno.config.mts              # UnoCSS 配置
└── vite.config.ts              # Vite 配置
```

### 目录命名规范

1. **全小写** - 目录名一律使用小写字母
2. **连字符分隔** - 多个单词使用连字符(kebab-case)分隔
3. **语义化** - 目录名应清晰表达其用途
4. **复数与单数** - 资源型目录用复数(`pages`、`components`、`stores`、`utils`),功能型目录用单数(`types`、`api`)

```text
✅ 正确
src/components/
src/pages/system/
src/api/system/auth/
src/composables/

❌ 错误
src/Components/         # 不应使用大写
src/pages/System/       # 不应使用大写
src/api/auth_login/     # 不应使用下划线
src/composable/         # 应使用复数
```

### 主包与分包

UniApp 在小程序场景下需要严格控制主包体积(默认 2MB),通过分包加载减少首屏负担:

- `src/pages/` - **主包**,放高频访问的核心页面(首页、登录、个人中心等)
- `src/pages-sub/` - **分包目录**,按业务域再分子目录,延迟加载

```text
src/
├── pages/                       # 主包(默认上限 2MB)
│   ├── index/index.vue         # 首页
│   ├── login/login.vue         # 登录
│   ├── mine/mine.vue           # 个人中心
│   └── ...
└── pages-sub/                   # 分包目录
    ├── system/                  # 系统分包
    │   ├── user/user.vue
    │   └── role/role.vue
    └── workflow/                # 工作流分包
        ├── todo/todo.vue
        └── done/done.vue
```

### API 目录结构规范

API 目录按业务模块组织,每个模块的接口与类型定义独立成文件:

```text
src/api/
├── system/                      # 系统模块
│   ├── auth/
│   │   ├── authApi.ts          # 接口定义
│   │   └── authTypes.ts        # 类型定义
│   ├── user/
│   │   ├── userApi.ts
│   │   └── userTypes.ts
│   └── dict/
│       ├── dictApi.ts
│       └── dictTypes.ts
├── common/                      # 公共接口
│   ├── upload/
│   │   ├── uploadApi.ts
│   │   └── uploadTypes.ts
│   └── captcha/
│       ├── captchaApi.ts
│       └── captchaTypes.ts
└── app/                         # 移动端专属接口
    └── home/
        ├── homeApi.ts
        └── homeTypes.ts
```

**命名约定:**

- 接口文件以 `xxxApi.ts` 结尾
- 类型文件以 `xxxTypes.ts` 结尾
- 与后端 `ruoyi-modules` 中的 Controller 路径保持对齐,便于追溯

---

## 代码风格规范

### ESLint 配置

项目使用 ESLint 9+ 的 flat config(`eslint.config.mjs`),集成 Vue 3、TypeScript、UnoCSS、UniApp 多端规则:

```javascript
import vue from 'eslint-plugin-vue'
import ts from '@typescript-eslint/eslint-plugin'

export default [
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: { vue, '@typescript-eslint': ts },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
]
```

**常用规则:**

| 规则 | 级别 | 说明 |
|------|------|------|
| `vue/multi-word-component-names` | off | 允许单词组件名(如 `Login.vue`) |
| `vue/no-v-html` | off | 允许 v-html(用于富文本场景) |
| `vue/component-definition-name-casing` | error | 组件定义名必须为 PascalCase |
| `@typescript-eslint/no-explicit-any` | warn | 警告显式 any |
| `@typescript-eslint/no-unused-vars` | error | 未使用变量报错(忽略下划线开头) |

### Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**关键约定:**

- 不使用分号
- 字符串使用单引号
- 不使用尾逗号
- 行宽 100 字符
- 2 空格缩进
- 箭头函数参数始终带括号
- 行尾使用 LF(避免 Windows CRLF 与小程序 IDE 冲突)

### 代码格式化命令

```bash
# ESLint 检查(含 60s 超时,首次扫描需要时间)
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# TypeScript 类型检查
pnpm type-check
```

---

## TypeScript 规范

### tsconfig.json 配置

```json
{
  "extends": "@vue/tsconfig/tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["@dcloudio/types", "@uni-helper/uni-app-types"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "src/**/*.d.ts"
  ]
}
```

**关键说明:**

- `strict: true` - 启用所有严格类型检查
- `paths['@/*']` - 路径别名,避免 `../../../` 嵌套
- `types` - 注入 UniApp 全局类型,获得 `uni.xxx` API 的智能提示

### 类型定义规范

业务实体类型与 API 响应类型必须显式定义,放在 `xxxTypes.ts` 中:

```typescript
// src/api/system/user/userTypes.ts

/** 用户信息 */
export interface UserInfo {
  /** 用户ID */
  userId: number
  /** 用户名 */
  userName: string
  /** 昵称 */
  nickName: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phonenumber?: string
  /** 性别(0男 1女 2未知) */
  sex?: '0' | '1' | '2'
  /** 头像 */
  avatar?: string
  /** 状态(0正常 1停用) */
  status?: '0' | '1'
  /** 创建时间 */
  createTime?: string
}

/** 用户查询参数 */
export interface UserQuery {
  pageNum: number
  pageSize: number
  userName?: string
  status?: string
  beginTime?: string
  endTime?: string
}

/** 分页响应 */
export interface PageResult<T> {
  rows: T[]
  total: number
  code: number
  msg: string
}
```

**类型规范要点:**

1. **JSDoc 注释** - 每个字段必须有 `/** 中文说明 */` 注释,小程序 IDE 与 Vue 工具链都依赖它显示提示
2. **可选字段标 `?`** - 后端可能不返回的字段必须可选,避免运行期 `undefined` 报错
3. **字面量联合替代枚举** - 优先使用 `'0' | '1' | '2'` 联合类型,小程序运行时无 `enum` 的额外开销
4. **泛型分页类型** - `PageResult<T>` 与后端 `PageQuery` 对齐,跨项目复用
5. **命名空间一致** - 与后端 BO/VO 的字段名严格一致(`userName` 不写成 `username`)

### 类型导入导出

`type` 导入与值导入分离,小程序构建后可减少冗余代码:

```typescript
// ✅ 推荐
import type { UserInfo, UserQuery } from '@/api/system/user/userTypes'
import { listUser, getUser } from '@/api/system/user/userApi'

// ❌ 不推荐(类型与值混在一起,Vite 编译时可能保留无用导入)
import { UserInfo, listUser } from '@/api/system/user'
```

---

## Vue 组件规范

### 组件结构

所有 `.vue` 文件统一遵循 SFC 结构:`<template>` → `<script setup lang="ts">` → `<style lang="scss" scoped>`,且 `script` 必须使用 `setup` 语法糖:

```vue
<template>
  <view class="user-card">
    <wd-img :src="userInfo.avatar" round width="80rpx" height="80rpx" />
    <view class="user-card__info">
      <text class="user-card__name">{{ userInfo.nickName }}</text>
      <text class="user-card__phone">{{ userInfo.phonenumber }}</text>
    </view>
    <wd-button v-if="canEdit" size="small" @click="handleEdit">编辑</wd-button>
  </view>
</template>

<script lang="ts" setup>
import type { UserInfo } from '@/api/system/user/userTypes'

interface Props {
  userInfo: UserInfo
  canEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false
})

const emit = defineEmits<{
  (e: 'edit', id: number): void
}>()

const handleEdit = () => {
  emit('edit', props.userInfo.userId)
}
</script>

<style lang="scss" scoped>
.user-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: var(--wot-color-bg);
  border-radius: 16rpx;

  &__info {
    flex: 1;
    margin-left: 24rpx;
  }

  &__name {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--wot-color-text);
  }

  &__phone {
    margin-top: 8rpx;
    font-size: 26rpx;
    color: var(--wot-color-text-secondary);
  }
}
</style>
```

### 组件命名规范

| 命名场景 | 规范 | 示例 |
|---------|------|------|
| 文件名 | kebab-case | `user-card.vue` / `order-detail.vue` |
| 模板中的标签 | kebab-case | `<user-card />` / `<wd-button />` |
| `defineOptions({ name })` | PascalCase | `UserCard` / `OrderDetail` |
| WD UI 组件标签 | `wd-` 前缀 + kebab-case | `<wd-button />` / `<wd-input />` |
| 业务组件 | 动宾或名词 | `OrderItem` / `LoginForm` |

```vue
<script lang="ts" setup>
defineOptions({
  // 用于 keep-alive、调试器、错误堆栈
  name: 'UserCard'
})
</script>
```

### Props 规范

使用基于类型的 `defineProps<T>()` 配合 `withDefaults()` 设置默认值:

```vue
<script lang="ts" setup>
interface Props {
  /** 用户ID */
  userId: number
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 列表数据 */
  list?: UserInfo[]
  /** 状态(默认 normal) */
  status?: 'normal' | 'disabled' | 'loading'
}

const props = withDefaults(defineProps<Props>(), {
  showAvatar: true,
  list: () => [],
  status: 'normal'
})
</script>
```

**注意事项:**

- 数组、对象类型的默认值必须用工厂函数 `() => []`,避免引用共享
- `boolean` 默认值优先 `false`,确保使用方写 `<comp prop />` 即视为 `true`
- 复杂类型从 `xxxTypes.ts` 导入,不在组件内重复定义

### Emits 规范

使用类型化 emits,事件名使用 kebab-case:

```vue
<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', payload: { id: number; remark: string }): void
  (e: 'cancel'): void
}>()

const handleSubmit = () => {
  emit('submit', { id: 1, remark: 'ok' })
}
</script>
```

模板中使用时:

```vue
<template>
  <user-form
    v-model="form.name"
    @submit="onSubmit"
    @cancel="onCancel"
  />
</template>
```

### 模板规范

UniApp 模板必须使用 UniApp 内置基础组件而非 HTML 标签,因为小程序不支持 div、span:

| ❌ HTML 标签 | ✅ UniApp 组件 | 用途 |
|-------------|--------------|------|
| `<div>` | `<view>` | 通用容器 |
| `<span>` / `<p>` | `<text>` | 文本 |
| `<img>` | `<image>` 或 `<wd-img>` | 图片 |
| `<button>` | `<button>`(UniApp 内置)或 `<wd-button>` | 按钮 |
| `<a href>` | `navigateTo` API | 跳转 |
| `<input>` | `<input>`(UniApp 内置)或 `<wd-input>` | 输入 |
| `<ul>` / `<ol>` | `<view>` + `v-for` | 列表 |

**优先级:**

1. WD UI 组件(`<wd-xxx>`) - 用于业务呈现,获得统一主题与多端适配
2. UniApp 基础组件(`<view>`、`<image>`、`<scroll-view>`)- 用于布局结构
3. UniApp 业务组件(`<picker>`、`<map>`)- 用于平台特定能力

```vue
<template>
  <!-- ✅ 正确 -->
  <view class="container">
    <wd-cell-group>
      <wd-cell title="用户名" :value="user.userName" />
      <wd-cell title="手机号" :value="user.phonenumber" />
    </wd-cell-group>
    <wd-button type="primary" block @click="handleSubmit">提交</wd-button>
  </view>

  <!-- ❌ 错误 -->
  <div class="container">
    <p>{{ user.userName }}</p>
    <button @click="handleSubmit">提交</button>
  </div>
</template>
```

---

## 页面与路由规范

### 页面文件组织

每个页面建议独占一个目录,目录名与文件名一致,便于平铺资源:

```text
src/pages/
├── login/
│   ├── login.vue              # 主文件
│   └── components/            # 页面专属子组件
│       └── login-form.vue
├── mine/
│   ├── mine.vue
│   └── components/
└── index/
    └── index.vue
```

### pages.config.mts 规范

UniApp 4 推荐使用 `pages.config.mts` 替代直接编辑 `pages.json`,带类型提示:

```typescript
// pages.config.mts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationBarTitleText: '若依移动端',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F8FA'
  },
  pages: [
    { path: 'pages/index/index', style: { navigationBarTitleText: '首页' } },
    { path: 'pages/login/login', style: { navigationStyle: 'custom' } },
    { path: 'pages/mine/mine', style: { navigationBarTitleText: '我的' } }
  ],
  subPackages: [
    {
      root: 'pages-sub/system',
      pages: [
        { path: 'user/user', style: { navigationBarTitleText: '用户管理' } }
      ]
    }
  ],
  tabBar: {
    color: '#999',
    selectedColor: '#0B6EF0',
    backgroundColor: '#FFFFFF',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/mine/mine', text: '我的' }
    ]
  }
})
```

### 路由跳转规范

统一使用 `src/utils/route.ts` 中封装的方法,避免直接散写 `uni.navigateTo`:

```typescript
import { navigateTo, switchTab, redirectTo, goBack } from '@/utils/route'

// 普通跳转(支持返回)
navigateTo('/pages/system/user/user', { id: 100, name: '张三' })

// tabBar 切换
switchTab('/pages/index/index')

// 重定向(关闭当前页)
redirectTo('/pages/login/login')

// 返回上一页或指定层级
goBack()
goBack(2)
```

**封装收益:**

- 统一处理 query 参数 URL 编码
- 跳转前可以做登录态、权限校验
- 失败时统一吐司提示
- 在 H5/小程序/App 各端做差异兜底

---

## API 接口规范

### 接口文件结构

每个业务域一个 `xxxApi.ts`,只导出函数,不在文件内部维护 baseURL/拦截器:

```typescript
// src/api/system/user/userApi.ts
import { http } from '@/composables/useHttp'
import type {
  UserInfo,
  UserQuery,
  UserForm,
  PageResult
} from './userTypes'

/** 查询用户列表 */
export const listUser = (query: UserQuery) => {
  return http<PageResult<UserInfo>>({
    url: '/system/user/list',
    method: 'GET',
    data: query
  })
}

/** 查询用户详情 */
export const getUser = (userId: number) => {
  return http<UserInfo>({
    url: `/system/user/${userId}`,
    method: 'GET'
  })
}

/** 新增用户 */
export const addUser = (data: UserForm) => {
  return http<void>({
    url: '/system/user',
    method: 'POST',
    data
  })
}

/** 更新用户 */
export const updateUser = (data: UserForm) => {
  return http<void>({
    url: '/system/user',
    method: 'PUT',
    data
  })
}

/** 删除用户 */
export const delUser = (userIds: number[]) => {
  return http<void>({
    url: `/system/user/${userIds.join(',')}`,
    method: 'DELETE'
  })
}
```

### 接口命名规范

与 plus-ui 管理端命名严格对齐,跨端检索方便:

| 操作 | 命名 | 示例 |
|------|------|------|
| 列表 | `listXxx` | `listUser` |
| 详情 | `getXxx` | `getUser` |
| 新增 | `addXxx` | `addUser` |
| 修改 | `updateXxx` | `updateUser` |
| 删除 | `delXxx` | `delUser` |
| 导出 | `exportXxx` | `exportUser` |
| 导入 | `importXxx` | `importUser` |

### useHttp 封装

`useHttp` 是项目内置的 HTTP 客户端,基于 `uni.request` 封装,自带 Token 注入、租户头、错误码处理:

```typescript
import { http } from '@/composables/useHttp'

interface LoginResp {
  token: string
  expireTime: number
}

const result = await http<LoginResp>({
  url: '/auth/login',
  method: 'POST',
  data: { username, password }
})

console.log(result.token)
```

**封装能力:**

- 自动注入 `Authorization` Token
- 自动注入多租户 `tenant-id` 头
- 自动注入国际化 `Accept-Language` 头
- 401 自动跳转登录
- 业务码非 200 自动吐司提示并 reject
- 支持 Loading 配置(`{ loading: true }` 显示加载浮层)

---

## 状态管理规范

### Store 定义

使用 Pinia 的 setup 风格,每个模块一个文件,放在 `stores/modules/`:

```typescript
// src/stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/api/system/user/userTypes'
import { getUserInfo as getUserInfoApi } from '@/api/system/auth/authApi'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<UserInfo | null>(null)
    const permissions = ref<string[]>([])
    const roles = ref<string[]>([])

    const isLoggedIn = computed(() => !!userInfo.value)
    const nickName = computed(() => userInfo.value?.nickName ?? '游客')

    /** 拉取用户信息 */
    const fetchUserInfo = async () => {
      const res = await getUserInfoApi()
      userInfo.value = res.user
      permissions.value = res.permissions
      roles.value = res.roles
    }

    /** 退出登录 */
    const logout = () => {
      userInfo.value = null
      permissions.value = []
      roles.value = []
    }

    /** 权限校验 */
    const hasPermission = (perm: string) => {
      return permissions.value.includes('*:*:*') || permissions.value.includes(perm)
    }

    return {
      userInfo,
      permissions,
      roles,
      isLoggedIn,
      nickName,
      fetchUserInfo,
      logout,
      hasPermission
    }
  },
  {
    persist: {
      key: 'plus-uniapp-user',
      paths: ['userInfo', 'permissions', 'roles']
    }
  }
)
```

### Store 命名规范

| 项 | 规范 | 示例 |
|-----|------|------|
| Store ID | kebab-case 或单词 | `'user'` / `'app-config'` |
| Composable | `use` + 模块名 + `Store` | `useUserStore` |
| 文件 | 模块名 kebab-case | `user.ts` / `app-config.ts` |
| State | 名词 | `userInfo` / `tokenList` |
| Action | 动词 | `fetchUserInfo` / `logout` |
| Getter | 计算式名词 | `isLoggedIn` / `displayName` |

### Store 使用

```vue
<script lang="ts" setup>
import { useUserStore } from '@/stores/modules/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 取响应式 state(必须用 storeToRefs,直接解构会失去响应式)
const { userInfo, isLoggedIn, nickName } = storeToRefs(userStore)

// 取 action(直接解构即可)
const { fetchUserInfo, logout } = userStore

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchUserInfo()
  }
})
</script>
```

### 持久化策略

小程序 storage 上限较低(微信约 10MB),持久化只保留必要字段:

- 用户信息、Token、租户、语言、主题等会话强相关数据
- 字典缓存、列表数据**不持久化**,通过组件挂载时重新拉取
- 大对象(完整菜单树、权限矩阵)放内存即可,登录后重新计算

---

## Composables 规范

### 组合式函数定义

`composables/` 集中存放跨组件复用的逻辑,以 `use` 前缀命名:

```typescript
// src/composables/useDict.ts
import { ref, computed } from 'vue'
import { listDictData } from '@/api/system/dict/dictApi'
import type { DictDataInfo } from '@/api/system/dict/dictTypes'

const cache = new Map<string, DictDataInfo[]>()

export const useDict = (...types: string[]) => {
  const result = ref<Record<string, DictDataInfo[]>>({})

  const load = async () => {
    for (const type of types) {
      if (cache.has(type)) {
        result.value[type] = cache.get(type)!
        continue
      }
      const res = await listDictData(type)
      cache.set(type, res)
      result.value[type] = res
    }
  }

  load()

  return result
}
```

使用时:

```vue
<script lang="ts" setup>
import { useDict } from '@/composables/useDict'

const dict = useDict('sys_normal_disable', 'sys_user_sex')
</script>

<template>
  <wd-radio-group v-model="status">
    <wd-radio
      v-for="item in dict.sys_normal_disable"
      :key="item.dictValue"
      :value="item.dictValue"
    >
      {{ item.dictLabel }}
    </wd-radio>
  </wd-radio-group>
</template>
```

### Composables 命名规范

| 用途 | 命名 | 返回结构 |
|------|------|---------|
| 资源/数据 | `useXxx` | `{ data, loading, error, ...methods }` |
| 行为/动作 | `useXxxAction` 或动词式 | 操作方法 |
| 全局单例 | `useXxxStore`(优先用 Pinia) | Store 实例 |
| 平台能力 | `useXxx` | 平台 API 包装 |

**项目内置 Composables 速查:**

| 名称 | 用途 |
|------|------|
| `useAppInit` | 应用初始化(权限、字典、配置预拉取) |
| `useAuth` | 登录/登出/Token 校验 |
| `useDict` | 字典数据获取与缓存 |
| `useEventBus` | 跨组件事件总线 |
| `useHttp` | HTTP 请求封装 |
| `useI18n` | 国际化切换 |
| `usePayment` | 支付能力(微信/支付宝/Apple Pay) |
| `useScroll` | 滚动监听与控制 |
| `useShare` | 分享(微信/朋友圈/H5 链接) |
| `useSubscribe` | 微信订阅消息 |
| `useTheme` | 主题切换(亮/暗) |
| `useToken` | Token 持久化与刷新 |
| `useWebSocket` | WebSocket 连接管理 |
| `useWxShare` | 微信公众号 JSSDK 分享(H5 场景) |

---

## 工具函数规范

### 文件组织

`utils/` 按职能拆分小文件,单个文件聚焦一个领域:

```text
src/utils/
├── boolean.ts       # 布尔类工具
├── cache.ts         # 缓存(uni.setStorage 包装)
├── crypto.ts        # 加密(AES/SHA/Base64)
├── date.ts          # 日期格式化、解析
├── function.ts      # 函数工具(防抖、节流、重试)
├── logger.ts        # 日志(分级、上传)
├── platform.ts      # 平台判断(isH5、isWeixin、isAndroid 等)
├── route.ts         # 路由跳转封装
├── rsa.ts           # RSA 加解密
├── string.ts        # 字符串
├── tenant.ts        # 多租户头
├── to.ts            # await 包装(go-style 错误处理)
├── validators.ts    # 校验(手机号、邮箱、身份证等)
└── ...
```

### 工具函数示例

```typescript
// src/utils/date.ts
import dayjs from 'dayjs'

export const formatDate = (date: string | Date | number, fmt = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(fmt)
}

export const fromNow = (date: string | Date | number) => {
  return dayjs(date).fromNow()
}
```

```typescript
// src/utils/platform.ts
export const isH5 = () => {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
}

export const isWeixin = () => {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

export const isApp = () => {
  // #ifdef APP-PLUS
  return true
  // #endif
  // #ifndef APP-PLUS
  return false
  // #endif
}
```

```typescript
// src/utils/to.ts
export const to = <T = any, E = Error>(
  promise: Promise<T>
): Promise<[E, undefined] | [null, T]> => {
  return promise
    .then<[null, T]>((data) => [null, data])
    .catch<[E, undefined]>((err: E) => [err, undefined])
}
```

使用 `to` 简化 await 错误处理:

```typescript
const [err, user] = await to(getUser(100))
if (err) {
  uni.showToast({ title: '加载失败', icon: 'none' })
  return
}
console.log(user.nickName)
```

---

## WD UI 组件使用规范

### 优先级原则

任何视觉元素都按以下顺序选择:

1. **WD UI 组件** - 已封装好的业务组件,统一主题、统一交互
2. **UniApp 内置组件** - WD 未覆盖的基础能力(`<scroll-view>`、`<map>`、`<canvas>`)
3. **uni_modules 插件** - WD/UniApp 都没有,且经过项目验证的插件
4. **自研组件** - 上述都没有,放在 `src/components/`

```vue
<!-- ✅ 推荐 -->
<wd-button type="primary" @click="submit">提交</wd-button>

<!-- ❌ 不推荐(失去 WD 主题、暗黑模式、无障碍) -->
<button @click="submit" style="background: #0B6EF0">提交</button>
```

### 全局注册

WD UI 通过 `unplugin-vue-components` 自动按需注册,无需手动 import:

```typescript
// vite/plugins/unplugin-vue-components.ts
import Components from 'unplugin-vue-components/vite'
import { WotResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'

export default Components({
  resolvers: [WotResolver()],
  dts: 'src/components.d.ts'
})
```

### 主题定制

WD UI 通过 CSS 变量统一主题,在 `App.vue` 或 `uni.scss` 中覆盖:

```scss
/* uni.scss */
:root,
page {
  --wot-color-theme: #0B6EF0;       /* 主色 */
  --wot-color-success: #34D399;
  --wot-color-warning: #F59E0B;
  --wot-color-danger: #EF4444;
  --wot-color-bg: #FFFFFF;
  --wot-color-text: #1F2937;
  --wot-color-text-secondary: #6B7280;
  --wot-radius-base: 12rpx;
}

/* 暗黑模式 */
page[data-theme='dark'] {
  --wot-color-bg: #1F2937;
  --wot-color-text: #F3F4F6;
  --wot-color-text-secondary: #9CA3AF;
}
```

主题切换通过 `useTheme` 触发:

```typescript
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
toggleTheme()
```

---

## 样式规范

### 单位选择

| 场景 | 单位 | 说明 |
|------|------|------|
| 字体大小、间距、宽高 | `rpx` | 响应式像素,UniApp 自动按屏幕宽度缩放(750rpx = 屏宽) |
| 1px 描边 | `1px` | rpx 在小屏会被缩到亚像素,描边失真 |
| 阴影偏移、模糊半径 | `rpx` 或 `px` | 视具体效果调试 |
| 屏幕宽度百分比 | `%` 或 `vw` | 整屏铺满布局 |
| 行高 | 数字 | `line-height: 1.5`,不带单位避免继承计算 |

### 全局样式结构

```scss
// uni.scss(全局变量,所有 .vue 文件自动引入)
$primary: #0B6EF0;
$success: #34D399;
$warning: #F59E0B;
$danger: #EF4444;

// 字号
$font-xs: 22rpx;
$font-sm: 26rpx;
$font-md: 28rpx;
$font-lg: 32rpx;
$font-xl: 36rpx;

// 间距
$gap-xs: 8rpx;
$gap-sm: 16rpx;
$gap-md: 24rpx;
$gap-lg: 32rpx;
$gap-xl: 48rpx;

// CSS 变量(主题相关)
:root,
page {
  --wot-color-theme: #{$primary};
  --wot-color-success: #{$success};
  // ...
}
```

### 组件样式规范

强制使用 `scoped`,使用 BEM 命名规避级联污染:

```vue
<style lang="scss" scoped>
.user-card {
  padding: $gap-md;
  background: var(--wot-color-bg);

  &__avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  &__info {
    margin-left: $gap-md;
  }

  &__name {
    font-size: $font-lg;
    font-weight: 600;
  }

  &--active {
    background: var(--wot-color-theme);
  }
}
</style>
```

### UnoCSS 使用

UnoCSS 用于快速布局与原子样式,但不应替代组件级样式:

```vue
<template>
  <!-- ✅ 适合使用 UnoCSS:布局、间距、对齐 -->
  <view class="flex items-center justify-between p-24rpx">
    <text class="text-32rpx font-600">{{ title }}</text>
    <wd-icon name="arrow-right" />
  </view>

  <!-- ⚠️ 不推荐:复杂、有交互状态的组件应该在 scoped 样式里写 -->
  <view class="bg-white rounded-16rpx shadow-md hover:shadow-lg transition-all duration-300">
    ...
  </view>
</template>
```

**取舍原则:**

- 一次性的容器布局 → UnoCSS
- 有 `:hover` / 状态切换 / 多层嵌套 → SCSS scoped
- 动画 / 复杂选择器 → SCSS scoped

---

## 多端适配规范

### 条件编译

UniApp 的条件编译是多端差异的核心解法,**必须**优先使用条件编译,避免运行时 `if (platform === 'h5')`:

```vue
<template>
  <view>
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="getPhoneNumber" @getphonenumber="onGetPhone">
      获取手机号
    </button>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <wd-input v-model="phone" placeholder="请输入手机号" />
    <!-- #endif -->

    <!-- #ifdef APP-PLUS -->
    <button @click="onAppLogin">一键登录</button>
    <!-- #endif -->
  </view>
</template>
```

```typescript
// 脚本中的条件编译
const getPlatformName = () => {
  // #ifdef H5
  return 'H5'
  // #endif
  // #ifdef MP-WEIXIN
  return '微信小程序'
  // #endif
  // #ifdef APP-PLUS
  return 'App'
  // #endif
}
```

### 常用条件编译指令

| 指令 | 平台 |
|------|------|
| `H5` | H5 浏览器 |
| `MP` | 所有小程序 |
| `MP-WEIXIN` | 微信小程序 |
| `MP-ALIPAY` | 支付宝小程序 |
| `MP-BAIDU` | 百度小程序 |
| `MP-TOUTIAO` | 抖音小程序 |
| `APP-PLUS` | App(Android/iOS) |
| `APP-PLUS-NVUE` | NVue 编译模式 |
| `APP-HARMONY` | 鸿蒙 App |

### 跨端 API 差异处理

部分 `uni.xxx` API 在不同端表现不一致,需要做兼容封装:

```typescript
// utils/share.ts
export const shareToFriend = (params: { title: string; path?: string }) => {
  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  return { ...params, success: true }
  // #endif

  // #ifdef H5
  if (navigator.share) {
    return navigator.share({
      title: params.title,
      url: location.href
    })
  }
  // 降级:复制链接
  uni.setClipboardData({ data: location.href })
  uni.showToast({ title: '链接已复制', icon: 'none' })
  // #endif

  // #ifdef APP-PLUS
  plus.share.sendWithSystem({
    type: 'text',
    content: params.title,
    href: params.path
  })
  // #endif
}
```

### 平台限制速查

| 限制 | 微信小程序 | 支付宝小程序 | App | H5 |
|------|----------|----------|-----|-----|
| 主包大小 | ≤ 2MB | ≤ 2MB | 无 | 无 |
| 总包大小 | ≤ 20MB | ≤ 16MB | 无 | 无 |
| storage 上限 | ~10MB | ~10MB | 受系统限制 | 5-10MB |
| 单次请求超时 | 60s | 60s | 可配 | 可配 |
| 域名白名单 | 必须配置 | 必须配置 | 无 | 同源策略 |
| WebSocket | ✅ | ✅ | ✅ | ✅ |
| 支付能力 | 微信支付 | 支付宝支付 | 全平台 | 微信 H5/支付宝 H5 |

---

## 最佳实践

### 1. 异步操作与 Loading

页面初始化的异步加载使用 `wd-loading` 或骨架屏,长时操作必须有反馈:

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listOrder } from '@/api/order/orderApi'

const loading = ref(false)
const list = ref<OrderInfo[]>([])

onLoad(async () => {
  loading.value = true
  try {
    list.value = await listOrder({ pageNum: 1, pageSize: 20 })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <wd-skeleton v-if="loading" :row-count="5" />
  <view v-else class="order-list">
    <order-item v-for="item in list" :key="item.id" :data="item" />
  </view>
</template>
```

### 2. 列表渲染与下拉刷新

下拉刷新与上拉加载使用 `onPullDownRefresh` / `onReachBottom` 生命周期:

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

const list = ref<OrderInfo[]>([])
const pageNum = ref(1)
const finished = ref(false)

const fetchList = async (reset = false) => {
  if (reset) {
    pageNum.value = 1
    finished.value = false
  }
  const res = await listOrder({ pageNum: pageNum.value, pageSize: 20 })
  list.value = reset ? res.rows : [...list.value, ...res.rows]
  if (res.rows.length < 20) finished.value = true
  pageNum.value++
}

onPullDownRefresh(async () => {
  await fetchList(true)
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!finished.value) fetchList()
})

fetchList(true)
</script>
```

并在 `pages.config.mts` 中开启下拉:

```typescript
{ path: 'pages/order/list', style: { enablePullDownRefresh: true } }
```

### 3. 表单校验

业务表单使用 `wd-form` + `wd-form-item` 配合 rules:

```vue
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { isPhone } from '@/utils/validators'

const formRef = ref()
const form = reactive({
  username: '',
  phone: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: (val: string) => isPhone(val),
      message: '手机号格式错误'
    }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交...
}
</script>

<template>
  <wd-form ref="formRef" :model="form" :rules="rules">
    <wd-cell-group>
      <wd-form-item prop="username">
        <wd-input v-model="form.username" placeholder="用户名" />
      </wd-form-item>
      <wd-form-item prop="phone">
        <wd-input v-model="form.phone" type="number" placeholder="手机号" />
      </wd-form-item>
    </wd-cell-group>
    <wd-button block type="primary" @click="handleSubmit">提交</wd-button>
  </wd-form>
</template>
```

### 4. 防抖与节流

输入搜索、滚动加载等高频事件必须防抖/节流:

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { debounce } from '@/utils/function'
import { searchProduct } from '@/api/product/productApi'

const keyword = ref('')
const list = ref<ProductInfo[]>([])

const onInput = debounce(async (val: string) => {
  if (!val) {
    list.value = []
    return
  }
  list.value = await searchProduct(val)
}, 300)
</script>

<template>
  <wd-search v-model="keyword" @change="onInput" />
</template>
```

### 5. 缓存与失效

业务字典、城市列表等低频更新数据使用 `cache` 工具,设置过期时间:

```typescript
import { setCache, getCache } from '@/utils/cache'

const CITY_KEY = 'app:city-list'
const CITY_TTL = 24 * 60 * 60 * 1000  // 24h

export const getCityList = async () => {
  const cached = getCache<CityInfo[]>(CITY_KEY)
  if (cached) return cached

  const list = await fetchCityList()
  setCache(CITY_KEY, list, CITY_TTL)
  return list
}
```

### 6. 性能优化要点

| 场景 | 实践 |
|------|------|
| 长列表 | 使用 `wd-virtual-list` 或分页加载,避免一次渲染 1000+ 节点 |
| 图片 | 列表图用 `mode="aspectFill"` + 懒加载 `lazy-load`,大图用 `wd-img` 配合 fit |
| 首屏 | 主包内仅放高频页面,业务模块下沉到分包 |
| WebView | App 内 H5 用 `nvue` + `web-view` 时启用预加载 |
| 渲染 | 避免在 `v-for` 中绑定函数调用 `:class="getClass(item)"`,改为 `computed` |
| 网络 | 同时发出多个独立请求时用 `Promise.all`,串行依赖才用 await |

---

## 常见问题

### Q1: 小程序提示主包超过 2MB 怎么办?

**优先级排查:**

1. 把非首屏页面下沉到 `pages-sub/` 分包
2. 静态资源(图片/字体)放 CDN,不要打包到小程序内
3. 检查是否误引入了大型工具库(如 lodash 全量、moment),改用 `lodash-es` + 按需 import 或 `dayjs`
4. 在 `manifest.json` 中开启 `optimization: { subPackages: true }`,允许分包独立加载
5. 资源压缩:开启 `vite-plugin-imagemin`,Tinify 处理 PNG

### Q2: H5 跨域怎么处理?

开发环境在 `vite.config.ts` 配 proxy:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

生产环境必须由 Nginx/网关层做反向代理,不要让小程序与 H5 直连后端。

### Q3: WD UI 组件样式覆盖不生效?

WD UI 组件内部使用 `scoped` + `::v-deep` 隔离,在外层组件中:

```vue
<style lang="scss" scoped>
/* ✅ 推荐:通过 CSS 变量覆盖 */
:deep(.wd-button) {
  --wd-button-primary-bg-color: #1890FF;
}

/* ⚠️ 谨慎:直接覆盖类(可能与 WD 升级冲突) */
:deep(.wd-button--primary) {
  background: #1890FF;
}
</style>
```

优先使用 WD 提供的 CSS 变量,文档中每个组件都列出可覆盖的变量列表。

### Q4: 小程序与 App 有差异的 API 怎么管理?

**三层封装策略:**

1. **基础层**:`utils/platform.ts` 暴露平台判断
2. **能力层**:`composables/usePayment.ts` 等针对单一能力做差异聚合,对外暴露统一签名
3. **业务层**:页面只关心业务逻辑,直接调用能力层方法

```typescript
// 业务层无需知道是哪个端
import { usePayment } from '@/composables/usePayment'

const { pay } = usePayment()
const result = await pay({ orderId: 100, amount: 99.9 })
```

### Q5: TypeScript 报 `uni` 找不到怎么办?

确保 `tsconfig.json` 中包含 UniApp 类型声明:

```json
{
  "compilerOptions": {
    "types": ["@dcloudio/types", "@uni-helper/uni-app-types"]
  }
}
```

并且 `pnpm install` 后没有删 `node_modules`。重启 IDE 或 `pnpm type-check` 触发重新解析。

### Q6: 编译到微信小程序后样式偏移?

常见原因:

1. **使用了 `vw` / `vh` 单位** - 小程序不全面支持,改用 `rpx`
2. **使用了 `position: fixed` + 100vh** - 小程序导航栏与系统栏占位需用 `getSystemInfoSync()` 计算
3. **CSS 选择器过深** - 小程序 CSS 选择器嵌套上限较低,把 BEM 写扁
4. **使用了 H5 特有 API**(`document.querySelector`)- 小程序无 DOM,改 `uni.createSelectorQuery()`

### Q7: Pinia 持久化数据过期了怎么处理?

Pinia 持久化默认无 TTL,业务数据建议自行管理:

```typescript
const userStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const updatedAt = ref(0)

  const fetchIfExpired = async () => {
    const TTL = 30 * 60 * 1000  // 30 分钟
    if (Date.now() - updatedAt.value < TTL && userInfo.value) {
      return userInfo.value
    }
    userInfo.value = await getUserInfoApi()
    updatedAt.value = Date.now()
  }

  return { userInfo, fetchIfExpired }
})
```

---

## 检查清单

### 提交前检查

- [ ] `pnpm lint` 无错误
- [ ] `pnpm type-check` 无错误
- [ ] 至少在 H5 与微信小程序两端冒烟测试通过
- [ ] 页面切换、返回、下拉刷新、上拉加载工作正常
- [ ] 暗黑模式下视觉无塌陷
- [ ] 国际化文案完整(zh-CN / en-US)
- [ ] 没有写死的颜色(优先 WD CSS 变量)
- [ ] 没有写死的接口地址(走 `useHttp`)
- [ ] 没有 console.log / debugger 残留

### 组件开发检查

- [ ] 文件名 kebab-case,组件名 PascalCase
- [ ] `defineOptions({ name })` 已声明
- [ ] Props 用 `defineProps<T>()` 类型化,数组/对象默认值用工厂函数
- [ ] Emits 用类型签名 `defineEmits<{ ... }>()`
- [ ] 事件名 kebab-case
- [ ] 模板用 UniApp 组件(`<view>` / `<text>`),不用 HTML 标签
- [ ] 样式 `scoped` + BEM 命名
- [ ] 单位优先 `rpx`,1px 描边除外
- [ ] 没有泄漏给外层的全局样式

### 页面开发检查

- [ ] 在 `pages.config.mts` 中注册
- [ ] 主包还是分包归属合理
- [ ] 页面 title、tabBar 配置正确
- [ ] 下拉刷新、上拉加载已配置(若需要)
- [ ] 加载、空态、错误态都有兜底 UI
- [ ] 离开页面前清理 setInterval / WebSocket 订阅

### API 开发检查

- [ ] 接口文件命名 `xxxApi.ts`,类型文件命名 `xxxTypes.ts`
- [ ] 路径与后端 Controller 对齐
- [ ] 请求/响应类型完整,JSDoc 注释中文
- [ ] 列表/详情/增/改/删命名遵循 `list/get/add/update/del`
- [ ] 错误处理走 `useHttp` 默认逻辑,业务码非 200 已自动吐司
- [ ] 敏感数据走 `crypto.ts` / `rsa.ts` 加密

### 状态管理检查

- [ ] Store ID 全局唯一
- [ ] `userInfo`、`token` 等会话数据持久化
- [ ] 字典、列表数据不持久化,挂载时重新拉取
- [ ] 取响应式 state 用 `storeToRefs()`,直接解构会失去响应式
- [ ] Action 是 async 函数时,组件中用 await 等待

### 多端兼容检查

- [ ] 平台差异通过条件编译处理,而非运行时判断
- [ ] 小程序主包大小未超 1.8MB(留余量)
- [ ] 没有使用 H5 特有 API(`document` / `window` / `localStorage`)
- [ ] 在最低支持版本的微信开发者工具中可正常运行
- [ ] App 端的 `nvue` 页面与 `vue` 页面样式有差异,需分别测试
