# 前端项目简介

RuoYi-Plus-UniApp 前端是一个基于 Vue 3 + TypeScript 的现代化企业级 Web 管理系统,遵循"代码即文档"、"全栈统一"、"开发友好"的核心理念。项目采用组合式 API 架构,注重开发体验和可维护性。

**核心特性:**

- **组合式API优先** - 全面采用 Vue 3 Composition API,通过 Composables 替代传统 utils 工具类
- **类型安全保障** - 完整的 TypeScript 类型支持,提供智能提示和编译时检查
- **权限精细控制** - 提供 10 种自定义权限指令,支持权限、角色、租户多维度控制
- **国际化就绪** - 增强的国际化系统,支持字段级别的多语言配置
- **主题定制能力** - 完善的主题系统,支持动态主题切换和暗黑模式
- **企业级组件库** - 24 个业务组件目录,覆盖表单、表格、图表、AI 等场景

## 技术栈

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.13 | 渐进式 JavaScript 框架 |
| TypeScript | 5.8.3 | 类型安全的 JavaScript 超集 |
| Vite | 6.3.2 | 下一代前端构建工具 |
| Vue Router | 4.5.0 | Vue.js 官方路由管理器 |

### UI 与样式

| 技术 | 版本 | 说明 |
|------|------|------|
| Element Plus | 2.9.8 | 基于 Vue 3 的组件库 |
| UnoCSS | 66.5.2 | 原子化 CSS 引擎 |
| Sass | 1.87.0 | CSS 预处理器 |
| Animate.css | 4.1.1 | CSS 动画库 |

### 状态管理与通信

| 技术 | 版本 | 说明 |
|------|------|------|
| Pinia | 3.0.2 | Vue 官方状态管理库 |
| Axios | 1.8.4 | HTTP 请求库 |
| Vue I18n | 11.1.3 | 国际化解决方案 |

### 工具库

| 技术 | 版本 | 说明 |
|------|------|------|
| @vueuse/core | 13.1.0 | Vue 组合式函数集合 |
| ECharts | 5.6.0 | 数据可视化图表库 |
| WangEditor | 5.1.23 | 富文本编辑器 |
| CryptoJS | 4.2.0 | 加密算法库 |
| JSEncrypt | 3.3.2 | RSA 加密库 |
| Fuse.js | 7.0.0 | 模糊搜索库 |
| file-saver | 2.0.5 | 文件保存工具 |
| qrcode | 1.5.4 | 二维码生成 |
| vue-cropper | 1.1.1 | 图片裁剪工具 |
| vue-draggable-plus | 0.6.0 | 拖拽排序库 |
| DataV Vue3 | 1.7.4 | 大屏数据可视化 |

### 开发工具

| 技术 | 版本 | 说明 |
|------|------|------|
| ESLint | 9.21.0 | 代码质量检查 |
| Prettier | 3.5.2 | 代码格式化 |
| unplugin-auto-import | 19.1.2 | 自动导入 |
| unplugin-vue-components | 28.5.0 | 组件自动注册 |
| unplugin-icons | 22.1.0 | 图标自动导入 |
| Vitest | 3.1.2 | 单元测试框架 |

## 架构设计

### 目录结构

```
src/
├── api/                    # 接口集中管理
│   ├── business/          # 业务模块接口
│   ├── common/            # 通用接口
│   ├── system/            # 系统管理接口
│   ├── tool/              # 工具接口
│   └── workflow/          # 工作流接口
├── assets/                 # 静态资源
│   ├── icons/             # 图标资源
│   ├── images/            # 图片资源
│   └── styles/            # 全局样式
├── components/             # 自定义组件(24个目录)
│   ├── AAi/               # AI 相关组件
│   ├── ACard/             # 卡片组件集
│   ├── AChart/            # 图表组件集
│   ├── ADetail/           # 详情展示组件
│   ├── AForm/             # 表单组件集
│   ├── AImportExcel/      # Excel 导入组件
│   ├── AModal/            # 模态框组件
│   ├── AOssMediaManager/  # OSS 媒体管理
│   ├── ARecharge/         # 充值组件
│   ├── AResizablePanels/  # 可调整面板
│   ├── ASearchForm/       # 搜索表单
│   ├── ASelectionTags/    # 选择标签
│   ├── ATable/            # 表格组件
│   ├── ATableColumnSettings/ # 表格列设置
│   ├── ATheme/            # 主题组件
│   ├── DictTag/           # 字典标签
│   ├── Icon/              # 图标组件
│   ├── IFrameContainer/   # iframe 容器
│   ├── ImagePreview/      # 图片预览
│   ├── Pagination/        # 分页组件
│   ├── TableToolbar/      # 表格工具栏
│   └── UserSelect/        # 用户选择器
├── composables/            # 组合式函数(17个)
│   ├── useHttp.ts         # HTTP 请求封装
│   ├── useAuth.ts         # 认证与授权
│   ├── useDict.ts         # 字典数据管理
│   ├── useTheme.ts        # 主题管理
│   ├── useI18n.ts         # 国际化增强
│   ├── useSelection.ts    # 表格选择管理
│   ├── useToken.ts        # Token 管理
│   ├── useAnimation.ts    # 动画效果
│   ├── useDialog.ts       # 对话框管理
│   ├── useDownload.ts     # 文件下载
│   ├── usePrint.ts        # 打印功能
│   ├── useWS.ts           # WebSocket 通信
│   ├── useSSE.ts          # SSE 实时通信
│   ├── useTableHeight.ts  # 表格高度自适应
│   ├── useLayout.ts       # 布局状态管理
│   ├── useAiChat.ts       # AI 对话功能
│   └── useResponsiveSpan.ts # 响应式布局
├── directives/             # 自定义指令
│   ├── directives.ts      # 指令注册
│   └── permission.ts      # 权限指令(10个)
├── layouts/                # 布局组件
│   ├── HomeLayout.vue     # 主布局
│   └── components/        # 布局子组件
│       ├── AppMain/       # 主内容区
│       ├── Navbar/        # 导航栏
│       ├── Sidebar/       # 侧边栏
│       └── TagsView/      # 标签页
├── locales/                # 国际化配置
│   ├── i18n.ts            # i18n 配置
│   ├── zh_CN/             # 中文语言包
│   └── en_US/             # 英文语言包
├── plugins/                # 插件配置
├── router/                 # 路由配置
│   ├── router.ts          # 路由实例
│   └── routes.ts          # 路由定义
├── stores/                 # Pinia 状态管理
│   ├── user.ts            # 用户状态
│   ├── dict.ts            # 字典状态
│   ├── permission.ts      # 权限状态
│   └── tagsView.ts        # 标签页状态
├── types/                  # 类型定义
│   ├── global.d.ts        # 全局类型
│   ├── env.d.ts           # 环境变量类型
│   └── components.d.ts    # 组件类型
├── utils/                  # 工具函数
│   ├── cache.ts           # 缓存工具
│   ├── crypto.ts          # 加密工具
│   ├── date.ts            # 日期工具
│   ├── modal.ts           # 弹窗工具
│   ├── string.ts          # 字符串工具
│   ├── colors.ts          # 颜色工具
│   ├── rsa.ts             # RSA 加密
│   └── to.ts              # Promise 包装
├── views/                  # 页面文件
│   ├── business/          # 业务页面
│   ├── common/            # 公共页面
│   ├── system/            # 系统管理
│   ├── tool/              # 工具页面
│   └── workflow/          # 工作流页面
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
└── systemConfig.ts         # 系统全局配置
```

### 组合式架构设计

项目全面采用 Vue 3 组合式 API,将传统的工具函数重构为 Composables 组合函数,充分发挥 Vue 3 的响应式优势。

#### Composables 设计原则

```typescript
/**
 * Composable 命名规范:
 * - 统一使用 use 前缀
 * - 采用小驼峰命名
 * - 返回对象包含状态和方法
 */

// 示例: useAuth 组合函数结构
export const useAuth = () => {
  // 获取用户状态管理
  const userStore = useUserStore()

  // 状态定义
  const isLoggedIn = computed(() => {
    return userStore.token && userStore.token.length > 0
  })

  // 方法定义
  const hasPermission = (permission: string | string[]): boolean => {
    // 权限检查逻辑
  }

  // 返回状态和方法
  return {
    isLoggedIn,
    hasPermission,
    // ...
  }
}
```

#### 与传统 Utils 的对比

| 特性 | 传统 Utils | Composables |
|------|-----------|-------------|
| 响应式 | ❌ 需手动处理 | ✅ 原生支持 |
| 状态共享 | ❌ 需额外配置 | ✅ 天然支持 |
| 生命周期 | ❌ 无法感知 | ✅ 可集成 |
| 依赖注入 | ❌ 不支持 | ✅ 支持 provide/inject |
| 类型推导 | ⚠️ 有限支持 | ✅ 完整支持 |
| 代码复用 | ⚠️ 函数级别 | ✅ 逻辑级别 |

## 核心功能

### 🔐 权限管理系统

项目提供完善的权限管理解决方案,包括权限检查组合函数和自定义指令两种使用方式。

#### useAuth 组合函数

```typescript
import { useAuth } from '@/composables/useAuth'

const {
  // 状态
  isLoggedIn,        // 登录状态
  isSuperAdmin,      // 是否超级管理员
  isTenantAdmin,     // 是否租户管理员
  isAnyAdmin,        // 是否任意管理员

  // 权限检查
  hasPermission,     // 单个/多个权限检查 (OR)
  hasAllPermissions, // 所有权限检查 (AND)
  hasTenantPermission, // 租户权限检查

  // 角色检查
  hasRole,           // 单个/多个角色检查 (OR)
  hasAllRoles,       // 所有角色检查 (AND)

  // 路由访问控制
  canAccessRoute,    // 检查路由访问权限
  filterAuthorizedRoutes // 过滤授权路由
} = useAuth()

// 示例: 权限检查
const canAddUser = hasPermission('system:user:add')
const canManageUsers = hasPermission(['system:user:add', 'system:user:update'])
const hasFullAccess = hasAllPermissions(['system:user:add', 'system:user:update', 'system:user:delete'])
```

#### 权限指令集

项目提供 10 种权限控制指令,覆盖各种权限控制场景:

**基础权限指令:**

```vue
<!-- v-permi: 操作权限控制 (OR逻辑) -->
<button v-permi="'system:user:add'">添加用户</button>
<button v-permi="['system:user:add', 'system:user:update']">用户管理</button>

<!-- v-role: 角色权限控制 (OR逻辑) -->
<button v-role="'editor'">编辑内容</button>
<button v-role="['admin', 'editor']">内容管理</button>

<!-- v-admin: 仅管理员可见 -->
<button v-admin>管理员功能</button>

<!-- v-superadmin: 仅超级管理员可见 -->
<button v-superadmin>超级管理员功能</button>
```

**高级权限指令:**

```vue
<!-- v-permi-all: 必须满足所有权限 (AND逻辑) -->
<button v-permi-all="['system:user:add', 'system:user:update']">
  高级用户管理
</button>

<!-- v-role-all: 必须满足所有角色 (AND逻辑) -->
<button v-role-all="['admin', 'editor']">高级内容管理</button>

<!-- v-tenant: 租户权限控制 -->
<button v-tenant="'system:user:add'">租户用户管理</button>
<button v-tenant="{ permi: 'system:user:add', tenantId: '12345' }">
  指定租户操作
</button>
```

**反向权限指令:**

```vue
<!-- v-no-permi: 有权限时隐藏 -->
<button v-no-permi="'system:user:add'">普通用户操作</button>

<!-- v-no-role: 有角色时隐藏 -->
<button v-no-role="'admin'">非管理员功能</button>
```

**自定义控制指令:**

```vue
<!-- v-auth: 灵活的权限控制 -->
<button v-auth="{ permi: 'system:user:add', action: 'disable' }">
  添加用户(无权限时禁用)
</button>
<button v-auth="{ role: 'editor', action: 'hide' }">
  编辑内容(无角色时隐藏)
</button>
<button v-auth="{ permi: 'system:user:add', action: 'class', className: 'no-permission' }">
  添加用户(无权限时添加类名)
</button>
```

### 🌍 国际化系统

项目提供增强的国际化系统,支持传统 i18n 键值翻译和字段级多语言配置。

#### useI18n 组合函数

```typescript
import { useI18n } from '@/composables/useI18n'

const {
  // 翻译函数
  t,                    // 增强的翻译函数
  translateRouteTitle,  // 路由标题翻译

  // 语言管理
  currentLanguage,      // 当前语言
  currentLanguageName,  // 当前语言名称
  languages,            // 可用语言列表
  setLanguage,          // 设置语言
  initLanguage,         // 初始化语言

  // 语言状态
  isChinese,            // 是否中文环境
  isEnglish,            // 是否英文环境

  // Vue I18n 原生功能
  locale,               // 当前语言 (响应式)
  d,                    // 日期格式化
  n,                    // 数字格式化
  te,                   // 检查键是否存在
} = useI18n()
```

#### 多语言翻译模式

```vue
<template>
  <!-- 模式1: 传统 i18n 键 -->
  <el-table-column :label="t('user.userName')" prop="userName" />

  <!-- 模式2: 简化用法 t(英文, 中文) -->
  <el-table-column :label="t('UserName', '用户名')" prop="userName" />

  <!-- 模式3: 字段信息对象 -->
  <el-table-column
    :label="t('', { field: 'UserName', comment: '用户名' })"
    prop="userName"
  />

  <!-- 模式4: 语言特定翻译 -->
  <el-table-column
    :label="t('', {
      [LanguageCode.zh_CN]: '用户名',
      [LanguageCode.en_US]: 'UserName'
    })"
    prop="userName"
  />
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()
</script>
```

#### 语言配置

系统支持的语言通过枚举定义:

```typescript
export enum LanguageCode {
  /** 中文(简体) */
  zh_CN = 'zh_CN',
  /** 英文(美国) */
  en_US = 'en_US'
}
```

### 🎨 主题系统

项目提供完善的主题管理功能,支持动态主题切换、颜色变体生成和暗黑模式。

#### useTheme 组合函数

```typescript
import { useTheme } from '@/composables/useTheme'

const {
  // 状态
  currentTheme,       // 当前主题色

  // 主题操作
  setTheme,           // 设置主题色
  resetTheme,         // 重置为默认主题

  // 颜色工具
  getLightColor,      // 生成亮色变体
  getDarkColor,       // 生成暗色变体
  generateThemeColors, // 生成完整主题色系
  addAlphaToHex,      // 添加透明度
} = useTheme()

// 设置主题色
setTheme('#1890ff')

// 生成颜色变体
const lightBlue = getLightColor('#1890ff', 0.3)
const darkBlue = getDarkColor('#1890ff', 0.2)

// 生成完整主题色系
const themeColors = generateThemeColors('#1890ff')
// 返回: { primary: '#1890ff', lightColors: [...], darkColors: [...] }
```

#### 预定义主题色

```typescript
export const PREDEFINED_THEME_COLORS = [
  '#5D87FF', // 默认蓝色
  '#B48DF3', // 紫色
  '#1D84FF', // 深蓝
  '#60C041', // 绿色
  '#38C0FC', // 青色
  '#F9901F', // 橙色
  '#FF80C8'  // 粉色
] as const
```

#### 侧边栏主题

```typescript
export enum SideTheme {
  /** 深色主题 */
  Dark = 'theme-dark',
  /** 浅色主题 */
  Light = 'theme-light'
}
```

### 📊 HTTP 请求封装

项目提供基于 Axios 的完整 HTTP 请求封装,支持链式调用配置、请求加密、防重复提交等功能。

#### useHttp 组合函数

```typescript
import { useHttp, http } from '@/composables/useHttp'

// 方式1: 使用全局默认实例
const [err, data] = await http.get<User[]>('/api/users')
if (!err) {
  console.log(data)
}

// 方式2: 创建自定义实例
const customHttp = useHttp({ timeout: 30000 })
const [err, user] = await customHttp.post<User>('/api/users', userData)
```

#### 请求方法

```typescript
// GET 请求
const [err, users] = await http.get<User[]>('/api/users', { page: 1, size: 10 })

// POST 请求
const [err, user] = await http.post<User>('/api/users', { name: '张三', age: 25 })

// PUT 请求
const [err, user] = await http.put<User>('/api/users/123', { name: '李四' })

// DELETE 请求
const [err] = await http.del<void>('/api/users/123')

// 自定义请求
const [err, data] = await http.request<User>({
  method: 'PATCH',
  url: '/api/users/123',
  data: { status: 1 }
})
```

#### 链式调用配置

```typescript
// 禁用认证
const [err, data] = await http.noAuth().get('/api/public/data')

// 启用加密
const [err, data] = await http.encrypt().post('/api/secure', sensitiveData)

// 禁用防重复提交
const [err, data] = await http.noRepeatSubmit().post('/api/batch', batchData)

// 禁用租户信息
const [err, data] = await http.noTenant().get('/api/global/config')

// 禁用错误提示 (用于自定义错误处理)
const [err, data] = await http.noMsgError().post('/api/users', userData)
if (err) {
  // 自定义错误处理
  handleCustomError(err)
}

// 设置超时时间
const [err, data] = await http.timeout(60000).get('/api/slow-operation')

// 组合使用
const [err, data] = await http
  .noAuth()
  .encrypt()
  .timeout(30000)
  .post('/api/public/encrypted', data)
```

#### 统一返回格式

所有请求统一返回 `[Error | null, T | null]` 元组格式,简化错误处理:

```typescript
type Result<T> = Promise<[Error | null, T | null]>

// 使用示例
const [err, data] = await http.get<User>('/api/users/123')

if (err) {
  // 处理错误
  console.error('请求失败:', err.message)
  return
}

// 安全使用数据
console.log('用户名:', data.name)
```

### 📋 字典数据管理

项目提供便捷的字典数据管理,支持缓存、批量加载和类型安全。

#### useDict 组合函数

```typescript
import { useDict, DictTypes } from '@/composables/useDict'

// 获取多个字典类型
const {
  sys_user_gender,
  sys_enable_status,
  dictLoading
} = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status
)

// dictLoading 为 false 时表示加载完成
```

#### 在模板中使用

```vue
<template>
  <el-select v-model="form.gender" :loading="dictLoading">
    <el-option
      v-for="dict in sys_user_gender"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
    />
  </el-select>

  <!-- 使用 DictTag 组件展示字典标签 -->
  <dict-tag :options="sys_enable_status" :value="row.status" />
</template>
```

#### 预定义字典类型

```typescript
export enum DictTypes {
  sys_audit_status = 'sys_audit_status',       // 审核状态
  sys_boolean_flag = 'sys_boolean_flag',       // 逻辑标志
  sys_display_setting = 'sys_display_setting', // 显示设置
  sys_enable_status = 'sys_enable_status',     // 启用状态
  sys_file_type = 'sys_file_type',             // 文件类型
  sys_message_type = 'sys_message_type',       // 消息类型
  sys_notice_status = 'sys_notice_status',     // 通知状态
  sys_notice_type = 'sys_notice_type',         // 通知类型
  sys_oper_result = 'sys_oper_result',         // 操作结果
  sys_oper_type = 'sys_oper_type',             // 业务操作类型
  sys_payment_method = 'sys_payment_method',   // 支付方式
  sys_order_status = 'sys_order_status',       // 订单状态
  sys_platform_type = 'sys_platform_type',     // 平台类型
  sys_user_gender = 'sys_user_gender',         // 用户性别
  sys_data_scope = 'sys_data_scope',           // 数据权限类型
}
```

### 📝 表格选择管理

项目提供专为 Element Plus 表格设计的选择管理方案,支持单选、多选和跨页选择。

#### useSelection 组合函数

```typescript
import { useSelection } from '@/composables/useSelection'

const tableRef = ref()
const dataList = ref<User[]>([])
const multiple = ref(true)

const {
  selectionItems,       // 选中的完整对象数组
  selectionIsRestoring, // 是否正在恢复选中状态
  selectionChange,      // 处理选择变化
  selectionSync,        // 同步表格选中状态
  selectionRemove,      // 移除选中项
  selectionClear,       // 清空所有选中
  selectionInit,        // 初始化选中项
} = useSelection('userId', tableRef, dataList, multiple)
```

#### 在表格中使用

```vue
<template>
  <el-table
    ref="tableRef"
    :data="dataList"
    @selection-change="selectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column prop="userName" label="用户名" />
    <el-table-column prop="nickName" label="昵称" />
  </el-table>

  <!-- 选中标签展示 -->
  <a-selection-tags
    :items="selectionItems"
    label-key="userName"
    value-key="userId"
    @close="selectionRemove"
  />
</template>

<script setup lang="ts">
import { useSelection } from '@/composables/useSelection'

const tableRef = ref()
const dataList = ref<User[]>([])

const {
  selectionItems,
  selectionChange,
  selectionRemove
} = useSelection('userId', tableRef, dataList)
</script>
```

#### 核心特性

- **跨页选择**: 切换页面时自动保持选中状态
- **智能同步**: 自动同步内部状态与表格 UI
- **灵活移除**: 支持标签移除、批量移除等多种方式
- **模式切换**: 支持运行时动态切换单选/多选模式
- **类型安全**: 完整的 TypeScript 泛型支持

## 系统配置

项目通过 `systemConfig.ts` 集中管理所有配置,提供类型安全的配置访问。

### 配置结构

```typescript
export const SystemConfig: SystemConfigType = {
  // 应用基础信息
  app: {
    id: 'ryplus_uni_workflow',      // 应用唯一ID
    title: 'ryplus-uni后台管理',    // 应用名称
    env: 'development',             // 运行环境
    contextPath: '/',               // 访问路径前缀
    enableFrontend: false,          // 是否启用前台首页
  },

  // API 配置
  api: {
    baseUrl: '/dev-api',            // API 基础路径
    port: 5500,                     // 后端服务端口
    timeout: 10000,                 // 请求超时时间(ms)
  },

  // 安全配置
  security: {
    apiEncrypt: false,              // 接口加密开关
    rsaPublicKey: '',               // RSA 公钥
    rsaPrivateKey: '',              // RSA 私钥
  },

  // 外部服务地址
  services: {
    monitor: '',                    // 监控系统地址
    snailJob: '',                   // SnailJob 控制台
    gitUrl: '',                     // 仓库地址
    docUrl: '',                     // 文档地址
  },

  // UI 及布局设置
  ui: {
    title: 'ryplus-uni后台管理',
    theme: '#5d87ff',               // 主题色
    sideTheme: SideTheme.Dark,      // 侧边栏主题
    showSettings: true,             // 显示设置面板
    topNav: false,                  // 显示顶部导航
    menuLayout: MenuLayoutMode.Vertical, // 菜单布局模式
    tagsView: true,                 // 显示多标签导航
    fixedHeader: true,              // 固定头部
    sidebarLogo: true,              // 显示侧边栏 Logo
    dynamicTitle: true,             // 动态标题
    animationEnable: false,         // 启用动画
    dark: false,                    // 暗黑模式
    size: 'default',                // 布局大小
    language: LanguageCode.zh_CN,   // 语言设置
    watermark: false,               // 显示水印
  },
}
```

### 菜单布局模式

```typescript
export enum MenuLayoutMode {
  /** 垂直布局（左侧边栏） */
  Vertical = 'vertical',
  /** 混合布局（顶部+左侧） */
  Mixed = 'mixed',
  /** 水平布局（纯顶部） */
  Horizontal = 'horizontal'
}
```

### 环境变量

配置项通过 Vite 环境变量注入:

```bash
# .env.development
VITE_APP_ID=ryplus_uni_workflow
VITE_APP_TITLE=ryplus-uni后台管理
VITE_APP_ENV=development
VITE_APP_BASE_API=/dev-api
VITE_APP_BASE_API_PORT=5500
VITE_APP_API_ENCRYPT=false
VITE_APP_RSA_PUBLIC_KEY=
VITE_APP_RSA_PRIVATE_KEY=
VITE_APP_MONITOR_ADMIN=
VITE_APP_SNAILJOB_ADMIN=
VITE_APP_GIT_URL=
VITE_APP_DOC_URL=
VITE_ENABLE_FRONTEND=false
```

## 组件系统

### 组件命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 业务组件 | A 前缀 + 大驼峰 | `AFormInput`, `ATable`, `AChart` |
| 基础组件 | 大驼峰 | `DictTag`, `Pagination`, `Icon` |
| 页面组件 | 小驼峰 | `user.vue`, `role.vue` |
| 布局组件 | 大驼峰 | `HomeLayout`, `AppMain` |

### 核心组件目录

#### AAi - AI 组件集

| 组件 | 说明 |
|------|------|
| `AAiAssistant` | AI 助手对话组件 |
| `AAiContentReviewer` | AI 内容审核 |
| `AAiDataGenerator` | AI 数据生成 |
| `AAiTextOptimizer` | AI 文本优化 |

#### AForm - 表单组件集

| 组件 | 说明 |
|------|------|
| `AFormInput` | 输入框表单项 |
| `AFormSelect` | 下拉选择表单项 |
| `AFormInputWithAi` | AI 增强输入框 |
| ... | 更多表单组件 |

#### AChart - 图表组件集

| 组件 | 说明 |
|------|------|
| `ABarChart` | 柱状图 |
| `ALineChart` | 折线图 |
| `APieChart` | 饼图 |
| `ARadarChart` | 雷达图 |
| `AMapChart` | 地图图表 |
| `AScatterChart` | 散点图 |
| `ACandlestickChart` | K线图 |
| `ABarHorizontalChart` | 水平柱状图 |
| `ABarBidirectionalChart` | 双向柱状图 |

#### ACard - 卡片组件集

| 组件 | 说明 |
|------|------|
| `ADataCard` | 数据统计卡片 |
| `AInfoCard` | 信息展示卡片 |
| `AProfileCard` | 用户资料卡片 |
| `AUserCard` | 用户卡片 |
| `ASocialCard` | 社交卡片 |
| `APricingCard` | 定价卡片 |
| `AImageCard` | 图片卡片 |
| `AWeatherCard` | 天气卡片 |
| `AActivityCard` | 活动卡片 |
| `ATimelineListCard` | 时间线卡片 |
| `ATableCard` | 表格卡片 |
| `AFormCard` | 表单卡片 |
| `AEmptyCard` | 空状态卡片 |
| `ABarChartCard` | 柱状图卡片 |
| `ALineChartCard` | 折线图卡片 |
| `APieChartCard` | 饼图卡片 |
| `ARadarChartCard` | 雷达图卡片 |
| `AMapChartCard` | 地图图表卡片 |
| `ABarStatsCard` | 柱状统计卡片 |
| `ALineStatsCard` | 折线统计卡片 |

### 组件自动导入

项目使用 `unplugin-vue-components` 实现组件自动导入,无需手动 import:

```vue
<template>
  <!-- 组件自动导入,无需手动 import -->
  <a-form-input v-model="form.name" label="姓名" />
  <a-table :data="tableData" :columns="columns" />
  <dict-tag :options="dictOptions" :value="status" />
</template>
```

## 开发规范

### TypeScript 规范

#### 接口定义

```typescript
/**
 * 用户信息接口
 */
interface UserInfo {
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
  /** 头像 */
  avatar?: string
  /** 状态 (0: 正常, 1: 停用) */
  status: '0' | '1'
}

/**
 * 分页结果接口
 */
interface PageResult<T> {
  /** 数据列表 */
  rows: T[]
  /** 总记录数 */
  total: number
}

/**
 * 统一响应接口
 */
interface R<T> {
  /** 状态码 */
  code: number
  /** 消息 */
  msg: string
  /** 数据 */
  data: T
}
```

#### Props 定义

```typescript
interface Props {
  /** 表单数据 */
  modelValue: UserInfo
  /** 是否禁用 */
  disabled?: boolean
  /** 表单标签宽度 */
  labelWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  labelWidth: '100px',
})
```

#### Emits 定义

```typescript
interface Emits {
  (e: 'update:modelValue', value: UserInfo): void
  (e: 'submit', data: UserInfo): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()
```

### Vue 组件规范

#### 单文件组件结构

```vue
<template>
  <div class="user-form">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
// 1. 导入
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

// 2. 组件选项
defineOptions({
  name: 'UserForm',
})

// 3. Props 和 Emits
interface Props {
  modelValue: UserInfo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: UserInfo): void
}>()

// 4. 组合函数
const { t } = useI18n()

// 5. 响应式状态
const loading = ref(false)

// 6. 计算属性
const fullName = computed(() => {
  return props.modelValue.userName + props.modelValue.nickName
})

// 7. 监听器
watch(
  () => props.modelValue,
  (newVal) => {
    // 处理变化
  },
  { deep: true }
)

// 8. 方法
const handleSubmit = () => {
  // 处理提交
}

// 9. 生命周期
onMounted(() => {
  // 初始化
})

// 10. 暴露方法
defineExpose({
  validate: () => { /* ... */ },
})
</script>

<style lang="scss" scoped>
.user-form {
  // 样式
}
</style>
```

### 命名规范

#### 文件命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | 大驼峰 | `UserForm.vue` |
| 页面文件 | 小驼峰 | `user.vue` |
| 组合函数 | use 前缀 + 小驼峰 | `useAuth.ts` |
| 工具函数 | 小驼峰 | `string.ts` |
| 类型文件 | 小驼峰 | `types.ts` |
| 常量文件 | 小驼峰 | `constants.ts` |

#### 变量命名

```typescript
// 响应式变量: 小驼峰
const isLoading = ref(false)
const userList = ref<User[]>([])

// 常量: 大写下划线
const MAX_PAGE_SIZE = 100
const DEFAULT_AVATAR = '/images/avatar.png'

// 函数/方法: 小驼峰 + 动词前缀
const handleClick = () => {}
const getUserInfo = async () => {}
const formatDate = (date: Date) => {}
```

## 路由与导航

### 路由配置

```typescript
// router/routes.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/common/login.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/common/home.vue'),
        meta: { title: '首页', icon: 'home', affix: true },
      },
    ],
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'setting' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/core/user/user.vue'),
        meta: {
          title: '用户管理',
          icon: 'user',
          permissions: ['system:user:list'],
        },
      },
    ],
  },
]
```

### 路由元信息

```typescript
interface RouteMeta {
  /** 页面标题 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 是否隐藏菜单 */
  hidden?: boolean
  /** 是否固定在标签页 */
  affix?: boolean
  /** 是否缓存页面 */
  keepAlive?: boolean
  /** 访问权限 */
  permissions?: string[]
  /** 访问角色 */
  roles?: string[]
}
```

### 动态路由

```typescript
// 根据后端返回的菜单数据动态添加路由
const addDynamicRoutes = async () => {
  const { filterAuthorizedRoutes } = useAuth()
  const menuStore = useMenuStore()

  // 获取菜单数据
  const [err, menuData] = await http.get<MenuData[]>('/api/menu/routes')
  if (err) return

  // 转换为路由配置
  const routes = convertMenuToRoutes(menuData)

  // 过滤有权限的路由
  const authorizedRoutes = filterAuthorizedRoutes(routes)

  // 动态添加路由
  authorizedRoutes.forEach((route) => {
    router.addRoute(route)
  })

  // 存储菜单数据
  menuStore.setMenus(authorizedRoutes)
}
```

## 状态管理

### Pinia Store 结构

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.userName || '')

  // Actions
  const loginUser = async (loginData: LoginData) => {
    const [err, data] = await http.post<LoginResult>('/auth/login', loginData)
    if (err) throw err

    token.value = data.access_token
    await fetchUserInfo()
  }

  const fetchUserInfo = async () => {
    const [err, data] = await http.get<UserInfo>('/system/user/getInfo')
    if (err) throw err

    userInfo.value = data.user
    roles.value = data.roles
    permissions.value = data.permissions
  }

  const logoutUser = async () => {
    await http.post('/auth/logout')
    token.value = ''
    userInfo.value = null
    roles.value = []
    permissions.value = []
  }

  return {
    // 状态
    token,
    userInfo,
    roles,
    permissions,

    // Getters
    isLoggedIn,
    userName,

    // Actions
    loginUser,
    fetchUserInfo,
    logoutUser,
  }
})
```

### Store 持久化

```typescript
// 使用 pinia-plugin-persistedstate 持久化
export const useUserStore = defineStore('user', () => {
  // ...
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token'], // 只持久化 token
  },
})
```

## 开发工具

### 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build:prod

# 构建开发版本
pnpm build:dev

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint:eslint

# 代码检查并修复
pnpm lint:eslint:fix

# 代码格式化
pnpm prettier
```

### 环境要求

```json
{
  "engines": {
    "node": ">=18.18.0",
    "npm": ">=8.9.0",
    "pnpm": ">=7.30"
  }
}
```

### 浏览器支持

```json
{
  "browserslist": [
    "Chrome >= 87",
    "Edge >= 88",
    "Safari >= 14",
    "Firefox >= 78"
  ]
}
```

## 最佳实践

### 1. 组合函数优先

优先使用 Composables 封装可复用逻辑:

```typescript
// ✅ 推荐: 使用 Composable
const { hasPermission, hasRole } = useAuth()
const { t, setLanguage } = useI18n()
const { setTheme, currentTheme } = useTheme()

// ❌ 避免: 直接调用工具函数
import { checkPermission } from '@/utils/auth'
const hasAccess = checkPermission('system:user:add')
```

### 2. 类型安全

始终使用 TypeScript 类型注解:

```typescript
// ✅ 推荐: 完整类型注解
interface Props {
  modelValue: UserInfo
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

// ❌ 避免: 缺少类型
const props = defineProps({
  modelValue: Object,
  disabled: Boolean,
})
```

### 3. 错误处理

统一使用元组返回格式处理错误:

```typescript
// ✅ 推荐: 使用 [err, data] 模式
const [err, data] = await http.get<User>('/api/users/123')
if (err) {
  showMsgError(err.message)
  return
}
// 安全使用 data

// ❌ 避免: try-catch 嵌套
try {
  const response = await axios.get('/api/users/123')
  // 处理响应
} catch (error) {
  // 处理错误
}
```

### 4. 响应式数据

正确使用响应式 API:

```typescript
// ✅ 推荐: 根据场景选择 API
const count = ref(0)                    // 基础类型
const user = ref<User | null>(null)     // 可能为 null 的对象
const userInfo = reactive<UserInfo>({}) // 确定的对象结构
const fullName = computed(() => {})     // 派生状态

// ❌ 避免: 过度使用 reactive
const state = reactive({
  count: 0,
  user: null,
  loading: false,
})
```

### 5. 组件通信

遵循单向数据流:

```typescript
// ✅ 推荐: Props + Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const handleChange = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// ❌ 避免: 直接修改 Props
props.modelValue = newValue // 错误!
```

## 常见问题

### 1. 权限指令不生效

**问题原因:**
- 权限值为空或格式错误
- 用户权限数据未加载完成
- 使用了错误的指令

**解决方案:**

```vue
<!-- 确保权限值正确 -->
<button v-permi="'system:user:add'">添加</button>

<!-- 等待权限加载完成 -->
<template v-if="!loading">
  <button v-permi="'system:user:add'">添加</button>
</template>
```

### 2. 跨页选择丢失

**问题原因:**
- 未使用 `useSelection` 组合函数
- 切换页面后未调用 `selectionSync`

**解决方案:**

```typescript
const { selectionItems, selectionSync } = useSelection('id', tableRef, dataList)

// 页面切换时同步选中状态
watch(dataList, async () => {
  await nextTick()
  selectionSync()
})
```

### 3. 主题色不生效

**问题原因:**
- CSS 变量未正确应用
- 组件样式覆盖了主题色

**解决方案:**

```typescript
// 确保在应用启动时初始化主题
const { setTheme } = useTheme()

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    setTheme(savedTheme)
  }
})
```

### 4. 国际化翻译未更新

**问题原因:**
- 未使用响应式的翻译函数
- 语言切换后未刷新组件

**解决方案:**

```vue
<template>
  <!-- 使用 t 函数确保响应式更新 -->
  <span>{{ t('user.userName') }}</span>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
const { t } = useI18n()
</script>
```

### 5. HTTP 请求重复提交

**问题原因:**
- 快速连续点击按钮
- 未启用防重复提交

**解决方案:**

```typescript
// 方式1: 使用默认防重复提交
const [err, data] = await http.post('/api/users', userData)

// 方式2: 禁用按钮
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    const [err, data] = await http.post('/api/users', userData)
    // 处理结果
  } finally {
    loading.value = false
  }
}
```

## 项目优势

1. **开发体验优秀** - 完整的 TypeScript 类型支持和智能提示
2. **代码质量高** - 统一的命名规范和完善的注释文档
3. **功能丰富** - 覆盖企业级应用的各种场景需求
4. **扩展性强** - 模块化设计,易于定制和扩展
5. **多端支持** - Web 端 + 移动端一体化解决方案
6. **权限完善** - 多维度权限控制,满足复杂业务需求
7. **国际化就绪** - 内置完善的多语言支持
8. **主题灵活** - 支持动态主题切换和暗黑模式

## 适用场景

- 企业级 Web 管理系统
- SaaS 多租户管理平台
- 内容管理系统后台
- 需要权限管理的业务系统
- 中后台管理界面
- 工作流审批系统
- 数据可视化大屏
- AI 智能应用平台

RuoYi-Plus-UniApp 前端通过现代化的技术栈和精心设计的架构,为开发者提供了一个高效、可维护的企业级 Web 管理系统解决方案。
