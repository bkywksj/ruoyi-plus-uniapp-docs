# 目录结构详解

## 概述

RuoYi-Plus-UniApp 前端项目采用 **Vue 3 + TypeScript + Element Plus + Pinia + Vue Router + Vite** 技术栈构建，遵循现代化的前端工程规范，实现了清晰的分层架构和模块化组织。项目结构设计充分考虑了代码的可维护性、可扩展性和团队协作效率。

**核心特性：**
- **模块化组织** - 按功能和职责清晰划分目录结构
- **TypeScript 支持** - 完整的类型定义和类型安全
- **组件化开发** - 组件库与业务组件分离
- **状态集中管理** - 基于 Pinia 的状态管理方案
- **按需加载** - 自动导入和路由懒加载
- **样式工程化** - UnoCSS 原子化CSS + SCSS 预处理器
- **国际化支持** - 多语言配置和切换机制
- **插件化架构** - 可扩展的插件系统

## 整体目录结构

```
plus-ui/                           # 前端项目根目录
├── bin/                          # 脚本工具目录
│   ├── build.sh                 # 构建脚本
│   └── deploy.sh                # 部署脚本
├── env/                          # 环境配置目录
│   ├── .env.development         # 开发环境配置
│   ├── .env.production          # 生产环境配置
│   └── .env.test                # 测试环境配置
├── public/                       # 静态资源目录
│   ├── favicon.ico              # 网站图标
│   ├── robots.txt               # 爬虫规则
│   └── data/                    # 静态数据文件
├── src/                          # 源代码目录 ⭐
│   ├── api/                     # API 接口定义
│   ├── assets/                  # 资源文件
│   ├── components/              # 全局组件
│   ├── composables/             # 组合式函数
│   ├── directives/              # 自定义指令
│   ├── layouts/                 # 布局组件
│   ├── locales/                 # 国际化语言包
│   ├── plugins/                 # 插件配置
│   ├── router/                  # 路由配置
│   ├── stores/                  # 状态管理
│   ├── types/                   # TypeScript 类型定义
│   ├── utils/                   # 工具函数
│   ├── views/                   # 页面视图
│   ├── App.vue                  # 根组件
│   ├── main.ts                  # 应用入口
│   └── systemConfig.ts          # 系统配置
├── vite/                         # Vite 配置目录
│   └── plugins/                 # Vite 插件配置
├── .editorconfig                 # 编辑器配置
├── .eslintrc.js                  # ESLint 配置
├── .gitignore                    # Git 忽略配置
├── .npmrc                        # NPM 配置
├── .prettierrc.js                # Prettier 配置
├── eslint.config.ts              # ESLint 配置(新版)
├── index.html                    # HTML 入口文件
├── package.json                  # 项目依赖配置
├── README.md                     # 项目说明文档
├── tsconfig.json                 # TypeScript 配置
├── uno.config.ts                 # UnoCSS 配置
└── vite.config.ts                # Vite 构建配置
```

## 核心目录详解

### src/ - 源代码目录

项目的核心源代码目录，所有业务逻辑、组件、样式等都在此目录下组织。

#### 目录结构

```
src/
├── api/                          # API 接口定义
│   ├── business/                # 业务接口
│   │   ├── home/               # 首页相关接口
│   │   ├── order/              # 订单相关接口
│   │   └── product/            # 商品相关接口
│   ├── common/                  # 通用接口
│   │   ├── dict.ts             # 字典接口
│   │   ├── file.ts             # 文件接口
│   │   └── login.ts            # 登录接口
│   ├── system/                  # 系统接口
│   │   ├── user.ts             # 用户管理接口
│   │   ├── role.ts             # 角色管理接口
│   │   ├── menu.ts             # 菜单管理接口
│   │   └── dept.ts             # 部门管理接口
│   └── tool/                    # 工具接口
│       ├── gen.ts              # 代码生成接口
│       └── build.ts            # 构建接口
├── assets/                       # 资源文件
│   ├── icons/                   # 图标资源
│   │   └── svg/                # SVG 图标
│   ├── images/                  # 图片资源
│   │   ├── login/              # 登录页图片
│   │   └── common/             # 通用图片
│   ├── logo/                    # Logo 资源
│   │   ├── logo.svg            # 主 Logo
│   │   └── logo-dark.svg       # 暗黑模式 Logo
│   └── styles/                  # 样式文件
│       ├── index.scss          # 样式入口
│       ├── element/            # Element Plus 样式覆盖
│       ├── themes/             # 主题样式
│       │   ├── _light.scss    # 亮色主题
│       │   └── _dark.scss     # 暗黑主题
│       ├── variables.scss      # SCSS 变量
│       ├── mixins.scss         # SCSS 混入
│       ├── animations.scss     # 动画样式
│       └── utilities.scss      # 工具类样式
├── components/                   # 全局组件
│   ├── AAi/                     # AI 对话组件
│   ├── ACard/                   # 卡片组件
│   ├── AChart/                  # 图表组件
│   ├── ADetail/                 # 详情组件
│   ├── AForm/                   # 表单组件
│   ├── AImportExcel/            # Excel 导入组件
│   ├── AModal/                  # 模态框组件
│   ├── AOssMediaManager/        # OSS 媒体管理组件
│   ├── ARecharge/               # 充值组件
│   ├── AResizablePanels/        # 可调整面板组件
│   ├── ASearchForm/             # 搜索表单组件
│   ├── ASelectionTags/          # 选择标签组件
│   ├── ATheme/                  # 主题组件
│   ├── DictTag/                 # 字典标签组件
│   ├── Icon/                    # 图标组件
│   ├── IFrameContainer/         # IFrame 容器组件
│   ├── ImagePreview/            # 图片预览组件
│   ├── Pagination/              # 分页组件
│   ├── TableToolbar/            # 表格工具栏组件
│   └── UserSelect/              # 用户选择组件
├── composables/                  # 组合式函数
│   ├── useAiChat.ts             # AI 对话
│   ├── useAnimation.ts          # 动画效果
│   ├── useAuth.ts               # 权限认证
│   ├── useDialog.ts             # 对话框
│   ├── useDict.ts               # 字典数据
│   ├── useDownload.ts           # 文件下载
│   ├── useHttp.ts               # HTTP 请求
│   ├── useI18n.ts               # 国际化
│   ├── useLayout.ts             # 布局控制
│   ├── usePrint.ts              # 打印功能
│   ├── useResponsiveSpan.ts     # 响应式布局
│   ├── useSelection.ts          # 选择功能
│   ├── useSSE.ts                # SSE 连接
│   ├── useTableHeight.ts        # 表格高度计算
│   ├── useTheme.ts              # 主题切换
│   ├── useToken.ts              # Token 管理
│   └── useWS.ts                 # WebSocket 连接
├── directives/                   # 自定义指令
│   ├── index.ts                 # 指令注册入口
│   ├── auth.ts                  # 权限指令 v-auth
│   ├── copy.ts                  # 复制指令 v-copy
│   ├── debounce.ts              # 防抖指令 v-debounce
│   ├── draggable.ts             # 拖拽指令 v-draggable
│   ├── loading.ts               # 加载指令 v-loading
│   ├── permission.ts            # 权限指令 v-permission
│   ├── throttle.ts              # 节流指令 v-throttle
│   └── watermark.ts             # 水印指令 v-watermark
├── layouts/                      # 布局组件
│   ├── components/              # 布局子组件
│   │   ├── AppMain.vue         # 主内容区
│   │   ├── Navbar.vue          # 顶部导航栏
│   │   ├── Sidebar/            # 侧边栏
│   │   │   ├── index.vue      # 侧边栏主组件
│   │   │   ├── Logo.vue       # Logo 组件
│   │   │   ├── SidebarItem.vue# 菜单项组件
│   │   │   └── Link.vue       # 链接组件
│   │   ├── TagsView.vue        # 标签页视图
│   │   ├── Settings.vue        # 设置面板
│   │   └── RightPanel.vue      # 右侧面板
│   ├── index.vue                # 默认布局
│   ├── blank.vue                # 空白布局
│   └── iframe.vue               # IFrame 布局
├── locales/                      # 国际化语言包
│   ├── index.ts                 # 多语言配置入口
│   ├── zh-cn.ts                 # 简体中文
│   ├── zh-tw.ts                 # 繁体中文
│   └── en.ts                    # 英文
├── plugins/                      # 插件配置
│   ├── index.ts                 # 插件注册入口
│   ├── element.ts               # Element Plus 插件
│   ├── icons.ts                 # 图标插件
│   ├── i18n.ts                  # 国际化插件
│   └── directives.ts            # 指令插件
├── router/                       # 路由配置
│   ├── index.ts                 # 路由主文件
│   ├── modules/                 # 路由模块
│   │   ├── business.ts         # 业务路由
│   │   ├── system.ts           # 系统路由
│   │   ├── tool.ts             # 工具路由
│   │   └── common.ts           # 通用路由
│   └── utils/                   # 路由工具
│       ├── guards.ts           # 路由守卫
│       └── helpers.ts          # 路由辅助函数
├── stores/                       # 状态管理
│   ├── index.ts                 # Store 入口
│   └── modules/                 # Store 模块
│       ├── app.ts              # 应用状态
│       ├── user.ts             # 用户状态
│       ├── permission.ts       # 权限状态
│       ├── settings.ts         # 设置状态
│       ├── tagsView.ts         # 标签页状态
│       └── dict.ts             # 字典状态
├── types/                        # TypeScript 类型定义
│   ├── global.d.ts              # 全局类型
│   ├── auto-imports.d.ts        # 自动导入类型
│   ├── components.d.ts          # 组件类型
│   ├── api.d.ts                 # API 类型
│   ├── router.d.ts              # 路由类型
│   └── store.d.ts               # Store 类型
├── utils/                        # 工具函数
│   ├── boolean.ts               # 布尔工具
│   ├── cache.ts                 # 缓存工具
│   ├── class.ts                 # Class 工具
│   ├── colors.ts                # 颜色工具
│   ├── crypto.ts                # 加密工具
│   ├── date.ts                  # 日期工具
│   ├── format.ts                # 格式化工具
│   ├── function.ts              # 函数工具
│   ├── modal.ts                 # 模态框工具
│   ├── object.ts                # 对象工具
│   ├── rsa.ts                   # RSA 加密
│   ├── scroll.ts                # 滚动工具
│   ├── string.ts                # 字符串工具
│   ├── tab.ts                   # 标签页工具
│   ├── themeAnimation.ts        # 主题动画
│   ├── to.ts                    # 异步处理
│   ├── tree.ts                  # 树形数据工具
│   └── validators.ts            # 验证工具
├── views/                        # 页面视图
│   ├── business/                # 业务页面
│   │   ├── home/               # 首页
│   │   ├── order/              # 订单管理
│   │   └── product/            # 商品管理
│   ├── common/                  # 通用页面
│   │   ├── login.vue           # 登录页
│   │   ├── 404.vue             # 404 页面
│   │   └── 500.vue             # 500 页面
│   ├── system/                  # 系统页面
│   │   ├── user/               # 用户管理
│   │   ├── role/               # 角色管理
│   │   ├── menu/               # 菜单管理
│   │   └── dept/               # 部门管理
│   └── tool/                    # 工具页面
│       ├── gen/                # 代码生成
│       └── build/              # 构建工具
├── App.vue                       # 根组件
├── main.ts                       # 应用入口文件
└── systemConfig.ts               # 系统配置文件
```

## API 接口目录 (api/)

### 目录组织

API 接口按照业务模块进行组织，每个模块对应一个子目录。

```
api/
├── business/                     # 业务模块接口
│   ├── home/
│   │   ├── index.ts            # 首页接口定义
│   │   └── types.ts            # 首页类型定义
│   ├── order/
│   │   ├── index.ts            # 订单接口
│   │   └── types.ts            # 订单类型
│   └── product/
│       ├── index.ts            # 商品接口
│       └── types.ts            # 商品类型
├── common/                       # 通用接口
│   ├── dict.ts                  # 字典接口
│   ├── file.ts                  # 文件上传/下载接口
│   └── login.ts                 # 登录认证接口
├── system/                       # 系统管理接口
│   ├── user.ts                  # 用户管理
│   ├── role.ts                  # 角色管理
│   ├── menu.ts                  # 菜单管理
│   └── dept.ts                  # 部门管理
└── tool/                         # 工具接口
    ├── gen.ts                   # 代码生成
    └── build.ts                 # 构建工具
```

### 文件命名规范

- **接口文件**: 使用小写字母和连字符，如 `user-info.ts`
- **类型文件**: 统一命名为 `types.ts`
- **文件导出**: 每个模块提供 `index.ts` 作为统一导出

### 接口定义示例

```typescript
// api/system/user.ts
import { http } from '@/utils/http'
import type { UserInfo, UserQuery, UserForm } from './types'

/**
 * 查询用户列表
 */
export const listUsers = (params: UserQuery) => {
  return http.get<Page<UserInfo>>('/system/user/list', { params })
}

/**
 * 获取用户详情
 */
export const getUserInfo = (userId: number) => {
  return http.get<UserInfo>(`/system/user/${userId}`)
}

/**
 * 新增用户
 */
export const addUser = (data: UserForm) => {
  return http.post('/system/user', data)
}

/**
 * 更新用户
 */
export const updateUser = (data: UserForm) => {
  return http.put('/system/user', data)
}

/**
 * 删除用户
 */
export const deleteUser = (userIds: number[]) => {
  return http.delete('/system/user', { data: userIds })
}
```

### 类型定义示例

```typescript
// api/system/types.ts
/**
 * 用户信息
 */
export interface UserInfo {
  userId: number
  username: string
  nickname: string
  email: string
  phone: string
  gender: '0' | '1' | '2'
  avatar: string
  status: '0' | '1'
  createTime: string
}

/**
 * 用户查询参数
 */
export interface UserQuery extends PageQuery {
  username?: string
  phone?: string
  status?: string
  deptId?: number
  beginTime?: string
  endTime?: string
}

/**
 * 用户表单
 */
export interface UserForm {
  userId?: number
  username: string
  nickname: string
  email?: string
  phone?: string
  gender?: '0' | '1' | '2'
  status: '0' | '1'
  deptId: number
  roleIds: number[]
  password?: string
  remark?: string
}
```

## 组件目录 (components/)

### 组件分类

全局组件分为**基础组件**和**业务组件**两大类。

#### 基础组件

通用的UI组件，可在任何项目中复用：

- **DictTag** - 字典标签组件
- **Icon** - 图标组件
- **ImagePreview** - 图片预览
- **Pagination** - 分页组件
- **TableToolbar** - 表格工具栏

#### 业务组件

与业务逻辑紧密相关的组件，带有 `A` 前缀：

- **AAi** - AI 对话组件
- **ACard** - 卡片组件
- **AChart** - 图表组件
- **ADetail** - 详情展示组件
- **AForm** - 动态表单组件
- **AImportExcel** - Excel 导入组件
- **AModal** - 模态框组件
- **AOssMediaManager** - OSS 媒体管理
- **ARecharge** - 充值组件
- **AResizablePanels** - 可调整面板
- **ASearchForm** - 搜索表单组件
- **ASelectionTags** - 选择标签组件
- **ATheme** - 主题切换组件
- **UserSelect** - 用户选择组件

### 组件目录结构

每个组件独立一个目录，包含组件文件、样式文件、类型定义等：

```
AForm/
├── index.vue                     # 组件主文件
├── index.ts                      # 组件导出
├── types.ts                      # 类型定义
├── hooks.ts                      # 组件 Hooks
├── utils.ts                      # 工具函数
├── components/                   # 子组件
│   ├── FormItem.vue
│   └── FormActions.vue
└── styles.scss                   # 组件样式(可选)
```

### 组件注册

组件通过自动导入机制全局注册，无需手动引入：

```typescript
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    Components({
      // 自动导入 src/components 下的组件
      dirs: ['src/components'],
      // 自动导入 Element Plus 组件
      resolvers: [ElementPlusResolver()],
      // 生成类型定义
      dts: 'src/types/components.d.ts'
    })
  ]
})
```

### 组件使用示例

```vue
<template>
  <div class="page">
    <!-- 直接使用,无需导入 -->
    <ASearchForm
      :model="queryParams"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ACard title="用户列表">
      <template #extra>
        <el-button type="primary" @click="handleAdd">
          <Icon name="i-ep-plus" />
          新增用户
        </el-button>
      </template>

      <el-table :data="tableData">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <DictTag :value="row.status" dict-type="sys_normal_disable" />
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </ACard>

    <AModal
      v-model="dialogVisible"
      :title="dialogTitle"
      @confirm="handleSubmit"
    >
      <AForm
        ref="formRef"
        :model="formData"
        :fields="formFields"
      />
    </AModal>
  </div>
</template>

<script setup lang="ts">
// 组件自动导入,无需显式 import
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})
</script>
```

## 组合式函数目录 (composables/)

### 目录说明

`composables/` 目录存放 Vue 3 Composition API 的可复用逻辑函数，遵循 `useXxx` 命名约定。

### 核心 Composables

#### 认证与权限

**useAuth.ts** - 权限认证管理

```typescript
import { useUserStore } from '@/stores/modules/user'

export const useAuth = () => {
  const userStore = useUserStore()

  // 检查是否有权限
  const hasPermission = (permission: string | string[]) => {
    const permissions = userStore.permissions
    if (!permission) return true
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p))
    }
    return permissions.includes(permission)
  }

  // 检查是否有角色
  const hasRole = (role: string | string[]) => {
    const roles = userStore.roles
    if (!role) return true
    if (Array.isArray(role)) {
      return role.some(r => roles.includes(r))
    }
    return roles.includes(role)
  }

  return {
    hasPermission,
    hasRole
  }
}
```

**useToken.ts** - Token 管理

```typescript
import Cookies from 'js-cookie'

const TOKEN_KEY = 'Admin-Token'

export const useToken = () => {
  // 获取 Token
  const getToken = () => {
    return Cookies.get(TOKEN_KEY)
  }

  // 设置 Token
  const setToken = (token: string) => {
    return Cookies.set(TOKEN_KEY, token)
  }

  // 移除 Token
  const removeToken = () => {
    return Cookies.remove(TOKEN_KEY)
  }

  return {
    getToken,
    setToken,
    removeToken
  }
}
```

#### 数据管理

**useDict.ts** - 字典数据管理

```typescript
import { ref, onMounted } from 'vue'
import { getDictData } from '@/api/common/dict'

export const useDict = (...dictTypes: string[]) => {
  const dicts = ref<Record<string, DictItem[]>>({})

  // 加载字典数据
  const loadDicts = async () => {
    const promises = dictTypes.map(async (type) => {
      const { data } = await getDictData(type)
      dicts.value[type] = data
    })
    await Promise.all(promises)
  }

  // 根据 value 获取 label
  const getLabel = (dictType: string, value: string) => {
    const dict = dicts.value[dictType]
    if (!dict) return value
    const item = dict.find(d => d.value === value)
    return item?.label || value
  }

  onMounted(() => {
    loadDicts()
  })

  return {
    dicts,
    getLabel,
    loadDicts
  }
}

// 使用示例
const { dicts, getLabel } = useDict('sys_user_sex', 'sys_normal_disable')
```

#### UI 交互

**useDialog.ts** - 对话框管理

```typescript
import { ref } from 'vue'

export const useDialog = () => {
  const visible = ref(false)
  const title = ref('')
  const loading = ref(false)

  // 打开对话框
  const open = (dialogTitle: string) => {
    visible.value = true
    title.value = dialogTitle
  }

  // 关闭对话框
  const close = () => {
    visible.value = false
    loading.value = false
  }

  // 提交
  const submit = async (callback: () => Promise<void>) => {
    loading.value = true
    try {
      await callback()
      close()
    } finally {
      loading.value = false
    }
  }

  return {
    visible,
    title,
    loading,
    open,
    close,
    submit
  }
}
```

**useTableHeight.ts** - 表格高度自适应

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

export const useTableHeight = (offset = 200) => {
  const tableHeight = ref(600)

  const calculateHeight = () => {
    tableHeight.value = window.innerHeight - offset
  }

  onMounted(() => {
    calculateHeight()
    window.addEventListener('resize', calculateHeight)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', calculateHeight)
  })

  return {
    tableHeight
  }
}
```

#### 主题与样式

**useTheme.ts** - 主题切换

```typescript
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/modules/settings'

export const useTheme = () => {
  const settingsStore = useSettingsStore()
  const isDark = ref(settingsStore.theme === 'dark')

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    const theme = isDark.value ? 'dark' : 'light'
    settingsStore.setTheme(theme)

    // 更新 HTML class
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // 设置主题色
  const setThemeColor = (color: string) => {
    settingsStore.setThemeColor(color)
    document.documentElement.style.setProperty('--el-color-primary', color)
  }

  return {
    isDark,
    toggleTheme,
    setThemeColor
  }
}
```

#### 网络通信

**useHttp.ts** - HTTP 请求封装

```typescript
import { ref } from 'vue'
import type { AxiosRequestConfig } from 'axios'
import { http } from '@/utils/http'

export const useHttp = <T = any>() => {
  const data = ref<T>()
  const error = ref()
  const loading = ref(false)

  const execute = async (config: AxiosRequestConfig) => {
    loading.value = true
    error.value = null

    try {
      const response = await http.request<T>(config)
      data.value = response.data
      return response
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    execute
  }
}
```

**useWS.ts** - WebSocket 连接

```typescript
import { ref, onUnmounted } from 'vue'

export const useWS = (url: string) => {
  const ws = ref<WebSocket>()
  const connected = ref(false)
  const message = ref<any>()

  // 连接
  const connect = () => {
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      connected.value = true
    }

    ws.value.onmessage = (event) => {
      message.value = JSON.parse(event.data)
    }

    ws.value.onclose = () => {
      connected.value = false
    }
  }

  // 发送消息
  const send = (data: any) => {
    if (ws.value && connected.value) {
      ws.value.send(JSON.stringify(data))
    }
  }

  // 关闭连接
  const close = () => {
    ws.value?.close()
  }

  onUnmounted(() => {
    close()
  })

  return {
    connected,
    message,
    connect,
    send,
    close
  }
}
```

**useSSE.ts** - Server-Sent Events

```typescript
import { ref, onUnmounted } from 'vue'

export const useSSE = (url: string) => {
  const eventSource = ref<EventSource>()
  const connected = ref(false)
  const message = ref<string>('')

  // 连接
  const connect = () => {
    eventSource.value = new EventSource(url)

    eventSource.value.onopen = () => {
      connected.value = true
    }

    eventSource.value.onmessage = (event) => {
      message.value = event.data
    }

    eventSource.value.onerror = () => {
      connected.value = false
    }
  }

  // 关闭连接
  const close = () => {
    eventSource.value?.close()
    connected.value = false
  }

  onUnmounted(() => {
    close()
  })

  return {
    connected,
    message,
    connect,
    close
  }
}
```

#### 业务功能

**useAiChat.ts** - AI 对话功能

```typescript
import { ref } from 'vue'
import { aiChat } from '@/api/business/ai'

export const useAiChat = () => {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)

  // 发送消息
  const sendMessage = async (content: string) => {
    // 添加用户消息
    messages.value.push({
      role: 'user',
      content,
      timestamp: Date.now()
    })

    loading.value = true

    try {
      const { data } = await aiChat({ message: content })

      // 添加 AI 回复
      messages.value.push({
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      })
    } finally {
      loading.value = false
    }
  }

  // 清空对话
  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    loading,
    sendMessage,
    clearMessages
  }
}
```

**useDownload.ts** - 文件下载

```typescript
import { ElMessage } from 'element-plus'

export const useDownload = () => {
  // 下载文件
  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 下载 Blob
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    downloadFile(url, filename)
    URL.revokeObjectURL(url)
  }

  // 导出 Excel
  const exportExcel = async (api: () => Promise<Blob>, filename: string) => {
    try {
      const blob = await api()
      downloadBlob(blob, filename)
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
    }
  }

  return {
    downloadFile,
    downloadBlob,
    exportExcel
  }
}
```

### Composables 命名规范

1. **文件命名**: 使用小驼峰 + `use` 前缀，如 `useAuth.ts`
2. **函数命名**: 导出的函数名与文件名一致
3. **返回值**: 统一返回对象，包含响应式数据和方法
4. **类型定义**: 提供完整的 TypeScript 类型支持

## 状态管理目录 (stores/)

### 目录结构

状态管理采用 Pinia，按模块组织：

```
stores/
├── index.ts                      # Store 入口,初始化 Pinia
└── modules/                      # Store 模块
    ├── app.ts                   # 应用全局状态
    ├── user.ts                  # 用户状态
    ├── permission.ts            # 权限状态
    ├── settings.ts              # 设置状态
    ├── tagsView.ts              # 标签页状态
    └── dict.ts                  # 字典缓存状态
```

### Store 模块示例

#### User Store - 用户状态

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/api/system/types'
import { getUserInfo, login, logout } from '@/api/common/login'
import { useToken } from '@/composables/useToken'

export const useUserStore = defineStore('user', () => {
  const { setToken, removeToken } = useToken()

  // 状态
  const userInfo = ref<UserInfo>()
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // 登录
  const loginAction = async (username: string, password: string) => {
    const { data } = await login({ username, password })
    setToken(data.token)
    await getUserInfoAction()
  }

  // 获取用户信息
  const getUserInfoAction = async () => {
    const { data } = await getUserInfo()
    userInfo.value = data
    roles.value = data.roles
    permissions.value = data.permissions
  }

  // 登出
  const logoutAction = async () => {
    await logout()
    removeToken()
    userInfo.value = undefined
    roles.value = []
    permissions.value = []
  }

  return {
    userInfo,
    roles,
    permissions,
    loginAction,
    getUserInfoAction,
    logoutAction
  }
})
```

#### App Store - 应用状态

```typescript
// stores/modules/app.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏状态
  const sidebarOpened = ref(true)

  // 设备类型
  const device = ref<'desktop' | 'mobile'>('desktop')

  // 加载状态
  const loading = ref(false)

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarOpened.value = !sidebarOpened.value
  }

  // 关闭侧边栏
  const closeSidebar = () => {
    sidebarOpened.value = false
  }

  // 设置设备类型
  const setDevice = (type: 'desktop' | 'mobile') => {
    device.value = type
  }

  // 设置加载状态
  const setLoading = (status: boolean) => {
    loading.value = status
  }

  return {
    sidebarOpened,
    device,
    loading,
    toggleSidebar,
    closeSidebar,
    setDevice,
    setLoading
  }
})
```

#### Settings Store - 设置状态

```typescript
// stores/modules/settings.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCache } from '@/utils/cache'

const { local } = useCache()

export const useSettingsStore = defineStore('settings', () => {
  // 主题模式
  const theme = ref<'light' | 'dark'>(local.get('theme') || 'light')

  // 主题色
  const themeColor = ref(local.get('themeColor') || '#409EFF')

  // 布局模式
  const layout = ref<'vertical' | 'horizontal'>(local.get('layout') || 'vertical')

  // 是否固定头部
  const fixedHeader = ref(local.get('fixedHeader') ?? true)

  // 是否显示标签页
  const tagsView = ref(local.get('tagsView') ?? true)

  // 语言
  const language = ref(local.get('language') || 'zh-cn')

  // 设置主题
  const setTheme = (value: 'light' | 'dark') => {
    theme.value = value
    local.set('theme', value)
  }

  // 设置主题色
  const setThemeColor = (value: string) => {
    themeColor.value = value
    local.set('themeColor', value)
  }

  // 设置布局
  const setLayout = (value: 'vertical' | 'horizontal') => {
    layout.value = value
    local.set('layout', value)
  }

  // 设置固定头部
  const setFixedHeader = (value: boolean) => {
    fixedHeader.value = value
    local.set('fixedHeader', value)
  }

  // 设置标签页显示
  const setTagsView = (value: boolean) => {
    tagsView.value = value
    local.set('tagsView', value)
  }

  // 设置语言
  const setLanguage = (value: string) => {
    language.value = value
    local.set('language', value)
  }

  return {
    theme,
    themeColor,
    layout,
    fixedHeader,
    tagsView,
    language,
    setTheme,
    setThemeColor,
    setLayout,
    setFixedHeader,
    setTagsView,
    setLanguage
  }
})
```

#### TagsView Store - 标签页状态

```typescript
// stores/modules/tagsView.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface TagView {
  path: string
  name?: string
  title?: string
  meta?: any
  query?: Record<string, any>
  params?: Record<string, any>
}

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref<TagView[]>([])
  const cachedViews = ref<string[]>([])

  // 添加访问过的视图
  const addVisitedView = (route: RouteLocationNormalized) => {
    if (visitedViews.value.some(v => v.path === route.path)) return

    visitedViews.value.push({
      path: route.path,
      name: route.name as string,
      title: route.meta?.title || 'no-name',
      meta: route.meta,
      query: route.query,
      params: route.params
    })
  }

  // 添加缓存视图
  const addCachedView = (route: RouteLocationNormalized) => {
    if (!route.name || cachedViews.value.includes(route.name as string)) return
    if (route.meta?.noCache) return

    cachedViews.value.push(route.name as string)
  }

  // 删除视图
  const delView = (view: TagView) => {
    delVisitedView(view)
    delCachedView(view)
  }

  // 删除访问过的视图
  const delVisitedView = (view: TagView) => {
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  // 删除缓存视图
  const delCachedView = (view: TagView) => {
    if (!view.name) return
    const index = cachedViews.value.indexOf(view.name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  // 删除其他视图
  const delOthersViews = (view: TagView) => {
    visitedViews.value = visitedViews.value.filter(
      v => v.meta?.affix || v.path === view.path
    )

    if (view.name) {
      cachedViews.value = cachedViews.value.filter(name => name === view.name)
    }
  }

  // 删除所有视图
  const delAllViews = () => {
    visitedViews.value = visitedViews.value.filter(v => v.meta?.affix)
    cachedViews.value = []
  }

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    addCachedView,
    delView,
    delVisitedView,
    delCachedView,
    delOthersViews,
    delAllViews
  }
})
```

### Store 使用示例

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import { useSettingsStore } from '@/stores/modules/settings'

// 获取 Store 实例
const userStore = useUserStore()
const appStore = useAppStore()
const settingsStore = useSettingsStore()

// 使用状态
const username = computed(() => userStore.userInfo?.username)
const sidebarOpened = computed(() => appStore.sidebarOpened)
const theme = computed(() => settingsStore.theme)

// 调用 Action
const handleLogout = async () => {
  await userStore.logoutAction()
  router.push('/login')
}

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 切换主题
const toggleTheme = () => {
  const newTheme = settingsStore.theme === 'light' ? 'dark' : 'light'
  settingsStore.setTheme(newTheme)
}
</script>
```

## 路由目录 (router/)

### 目录结构

```
router/
├── index.ts                      # 路由主文件
├── modules/                      # 路由模块
│   ├── business.ts              # 业务路由
│   ├── system.ts                # 系统路由
│   ├── tool.ts                  # 工具路由
│   └── common.ts                # 通用路由
└── utils/                        # 路由工具
    ├── guards.ts                # 路由守卫
    └── helpers.ts               # 路由辅助函数
```

### 路由配置示例

#### 主路由文件

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { App } from 'vue'
import { setupRouterGuard } from './utils/guards'

// 静态路由
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/common/login.vue'),
    meta: { hidden: true }
  },
  {
    path: '/404',
    component: () => import('@/views/common/404.vue'),
    meta: { hidden: true }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 设置路由守卫
setupRouterGuard(router)

// 导出设置函数
export function setupRouter(app: App) {
  app.use(router)
}

export default router
```

#### 业务路由模块

```typescript
// router/modules/business.ts
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/index.vue'

const businessRoutes: RouteRecordRaw[] = [
  {
    path: '/business',
    component: Layout,
    redirect: '/business/home',
    meta: {
      title: '业务管理',
      icon: 'i-ep-briefcase',
      orderNo: 1
    },
    children: [
      {
        path: 'home',
        name: 'BusinessHome',
        component: () => import('@/views/business/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'i-ep-home-filled'
        }
      },
      {
        path: 'order',
        name: 'BusinessOrder',
        component: () => import('@/views/business/order/index.vue'),
        meta: {
          title: '订单管理',
          icon: 'i-ep-list',
          permission: ['business:order:list']
        }
      },
      {
        path: 'product',
        name: 'BusinessProduct',
        component: () => import('@/views/business/product/index.vue'),
        meta: {
          title: '商品管理',
          icon: 'i-ep-goods',
          permission: ['business:product:list']
        }
      }
    ]
  }
]

export default businessRoutes
```

#### 系统路由模块

```typescript
// router/modules/system.ts
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/index.vue'

const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'i-ep-setting',
      orderNo: 10
    },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'i-ep-user',
          permission: ['system:user:list']
        }
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'i-ep-avatar',
          permission: ['system:role:list']
        }
      },
      {
        path: 'menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'i-ep-menu',
          permission: ['system:menu:list']
        }
      },
      {
        path: 'dept',
        name: 'SystemDept',
        component: () => import('@/views/system/dept/index.vue'),
        meta: {
          title: '部门管理',
          icon: 'i-ep-office-building',
          permission: ['system:dept:list']
        }
      }
    ]
  }
]

export default systemRoutes
```

### 路由守卫

```typescript
// router/utils/guards.ts
import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import { useToken } from '@/composables/useToken'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const WHITE_LIST = ['/login', '/404', '/500']

export function setupRouterGuard(router: Router) {
  // 前置守卫
  router.beforeEach(async (to, from, next) => {
    NProgress.start()

    const { getToken } = useToken()
    const token = getToken()

    // 已登录
    if (token) {
      if (to.path === '/login') {
        next({ path: '/' })
        NProgress.done()
      } else {
        const userStore = useUserStore()
        const permissionStore = usePermissionStore()

        // 获取用户信息
        if (!userStore.userInfo) {
          try {
            await userStore.getUserInfoAction()
            // 生成动态路由
            const accessRoutes = await permissionStore.generateRoutes()
            accessRoutes.forEach(route => router.addRoute(route))
            next({ ...to, replace: true })
          } catch (error) {
            await userStore.logoutAction()
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        } else {
          next()
        }
      }
    } else {
      // 白名单直接放行
      if (WHITE_LIST.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  })

  // 后置守卫
  router.afterEach((to) => {
    // 设置页面标题
    document.title = `${to.meta.title || '页面'} - RuoYi-Plus-UniApp`
    NProgress.done()
  })

  // 错误守卫
  router.onError((error) => {
    console.error('路由错误:', error)
    NProgress.done()
  })
}
```

## 工具函数目录 (utils/)

### 目录说明

`utils/` 目录存放通用的工具函数，按功能分类组织。

### 核心工具模块

#### 缓存工具 (cache.ts)

```typescript
/**
 * 缓存工具
 * 提供 localStorage 和 sessionStorage 的封装
 */

interface CacheOptions {
  expire?: number // 过期时间(秒)
}

class Storage {
  private storage: globalThis.Storage

  constructor(storage: globalThis.Storage) {
    this.storage = storage
  }

  /**
   * 设置缓存
   */
  set(key: string, value: any, options?: CacheOptions) {
    const data = {
      value,
      expire: options?.expire ? Date.now() + options.expire * 1000 : null
    }
    this.storage.setItem(key, JSON.stringify(data))
  }

  /**
   * 获取缓存
   */
  get<T = any>(key: string): T | null {
    const item = this.storage.getItem(key)
    if (!item) return null

    try {
      const data = JSON.parse(item)

      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        this.remove(key)
        return null
      }

      return data.value
    } catch {
      return null
    }
  }

  /**
   * 移除缓存
   */
  remove(key: string) {
    this.storage.removeItem(key)
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.storage.clear()
  }
}

export const useCache = () => {
  return {
    local: new Storage(localStorage),
    session: new Storage(sessionStorage)
  }
}
```

#### 日期工具 (date.ts)

```typescript
import dayjs from 'dayjs'

/**
 * 格式化日期
 */
export const formatDate = (
  date: string | number | Date,
  format = 'YYYY-MM-DD HH:mm:ss'
) => {
  return dayjs(date).format(format)
}

/**
 * 获取相对时间
 */
export const getRelativeTime = (date: string | number | Date) => {
  return dayjs(date).fromNow()
}

/**
 * 获取时间范围
 */
export const getDateRange = (days: number) => {
  const end = dayjs().endOf('day')
  const start = dayjs().subtract(days, 'day').startOf('day')
  return [start.toDate(), end.toDate()]
}
```

#### 格式化工具 (format.ts)

```typescript
/**
 * 格式化文件大小
 */
export const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

/**
 * 格式化金额
 */
export const formatMoney = (amount: number, decimals = 2) => {
  return `¥${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * 格式化手机号
 */
export const formatPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化银行卡号
 */
export const formatBankCard = (card: string) => {
  return card.replace(/(.{4})/g, '$1 ').trim()
}
```

#### 验证工具 (validators.ts)

```typescript
/**
 * 验证手机号
 */
export const isPhone = (value: string) => {
  return /^1[3-9]\d{9}$/.test(value)
}

/**
 * 验证邮箱
 */
export const isEmail = (value: string) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
}

/**
 * 验证身份证号
 */
export const isIdCard = (value: string) => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)
}

/**
 * 验证 URL
 */
export const isUrl = (value: string) => {
  return /^https?:\/\/.+/.test(value)
}

/**
 * 验证密码强度
 * 至少8位,包含大小写字母、数字和特殊字符
 */
export const isStrongPassword = (value: string) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
}
```

## 视图目录 (views/)

### 目录组织

视图按业务模块组织，每个模块独立目录：

```
views/
├── business/                     # 业务模块页面
│   ├── home/                    # 首页
│   │   ├── index.vue
│   │   ├── components/
│   │   └── hooks.ts
│   ├── order/                   # 订单管理
│   │   ├── index.vue
│   │   ├── components/
│   │   └── hooks.ts
│   └── product/                 # 商品管理
│       ├── index.vue
│       ├── components/
│       └── hooks.ts
├── common/                       # 通用页面
│   ├── login.vue                # 登录页
│   ├── 404.vue                  # 404 页面
│   └── 500.vue                  # 500 页面
├── system/                       # 系统管理页面
│   ├── user/                    # 用户管理
│   ├── role/                    # 角色管理
│   ├── menu/                    # 菜单管理
│   └── dept/                    # 部门管理
└── tool/                         # 工具页面
    ├── gen/                     # 代码生成
    └── build/                   # 构建工具
```

### 页面组织规范

每个页面目录遵循统一的组织结构：

```
user/                             # 用户管理页面
├── index.vue                    # 主页面组件
├── components/                   # 页面子组件
│   ├── UserForm.vue            # 用户表单
│   ├── UserDetail.vue          # 用户详情
│   └── UserImport.vue          # 用户导入
├── hooks.ts                      # 页面 Hooks
├── types.ts                      # 页面类型定义
└── constants.ts                  # 页面常量
```

### 页面示例

```vue
<!-- views/system/user/index.vue -->
<template>
  <div class="app-container">
    <ASearchForm
      :model="queryParams"
      :fields="searchFields"
      @search="handleQuery"
      @reset="handleReset"
    />

    <ACard>
      <template #header>
        <el-button
          type="primary"
          @click="handleAdd"
          v-auth="'system:user:add'"
        >
          <Icon name="i-ep-plus" />
          新增用户
        </el-button>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        :height="tableHeight"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <DictTag :value="row.status" dict-type="sys_normal_disable" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              text
              type="primary"
              @click="handleEdit(row)"
              v-auth="'system:user:edit'"
            >
              编辑
            </el-button>
            <el-button
              text
              type="danger"
              @click="handleDelete(row)"
              v-auth="'system:user:remove'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </ACard>

    <!-- 表单对话框 -->
    <AModal
      v-model="dialog.visible"
      :title="dialog.title"
      @confirm="handleSubmit"
    >
      <UserForm ref="formRef" :user-id="formData.userId" />
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { listUsers, deleteUser } from '@/api/system/user'
import { useTable } from './hooks'
import UserForm from './components/UserForm.vue'

defineOptions({
  name: 'SystemUser'
})

// 使用页面 Hooks
const {
  loading,
  tableData,
  total,
  queryParams,
  searchFields,
  tableHeight,
  getList,
  handleQuery,
  handleReset
} = useTable()

// 对话框
const dialog = useDialog()
const formRef = ref()
const formData = ref({})

// 新增
const handleAdd = () => {
  formData.value = {}
  dialog.open('新增用户')
}

// 编辑
const handleEdit = (row: any) => {
  formData.value = { ...row }
  dialog.open('编辑用户')
}

// 删除
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确认删除该用户吗?', '警告', {
    type: 'warning'
  })
  await deleteUser([row.userId])
  ElMessage.success('删除成功')
  getList()
}

// 提交
const handleSubmit = async () => {
  await formRef.value?.submit()
  dialog.close()
  getList()
}

// 初始化
onMounted(() => {
  getList()
})
</script>
```

## 配置文件说明

### Vite 配置 (vite.config.ts)

```typescript
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import UnoCSS from 'unocss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: env.VITE_APP_BASE_URL || '/',

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '~': resolve(__dirname, 'src')
      }
    },

    plugins: [
      vue(),

      // 自动导入
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/types/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()]
      }),

      // 组件自动导入
      Components({
        dirs: ['src/components'],
        dts: 'src/types/components.d.ts',
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({ prefix: 'icon' })
        ]
      }),

      // 图标
      Icons({
        autoInstall: true,
        compiler: 'vue3'
      }),

      // UnoCSS
      UnoCSS()
    ],

    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_APP_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus'],
            'echarts': ['echarts']
          }
        }
      }
    }
  }
})
```

### TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "~/*": ["src/*"]
    },
    "types": ["vite/client", "element-plus/global"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### UnoCSS 配置 (uno.config.ts)

```typescript
import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle'
      }
    })
  ],

  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center'
  },

  theme: {
    colors: {
      primary: 'var(--el-color-primary)',
      success: 'var(--el-color-success)',
      warning: 'var(--el-color-warning)',
      danger: 'var(--el-color-danger)',
      info: 'var(--el-color-info)'
    }
  }
})
```

## 最佳实践

### 文件命名规范

1. **组件文件**: 大驼峰命名 `UserForm.vue`
2. **工具文件**: 小驼峰命名 `format.ts`
3. **常量文件**: 大写下划线 `API_CONFIG.ts`
4. **类型文件**: 统一命名 `types.ts`

### 代码组织原则

1. **单一职责**: 每个文件/模块只负责一个功能
2. **高内聚低耦合**: 相关代码放在一起，减少依赖
3. **可测试性**: 便于编写单元测试
4. **可维护性**: 代码清晰易懂，注释完善

### 性能优化建议

1. **路由懒加载**: 使用动态导入
2. **组件异步加载**: 按需加载组件
3. **图片懒加载**: 使用 `v-lazy` 指令
4. **合理使用缓存**: 缓存API响应和计算结果
5. **减少重渲染**: 使用 `v-memo`、`shallowRef` 等

### 安全注意事项

1. **XSS 防护**: 使用 `v-text` 而不是 `v-html`
2. **CSRF 防护**: API 请求携带 Token
3. **权限控制**: 使用 `v-auth` 指令和路由守卫
4. **敏感信息**: 不在前端存储敏感数据

## 扩展指南

### 添加新模块

1. 在 `src/views/` 下创建模块目录
2. 在 `src/api/` 下创建对应 API
3. 在 `src/router/modules/` 下创建路由
4. 根据需要添加Store模块

### 添加新组件

1. 在 `src/components/` 下创建组件目录
2. 编写组件代码和类型定义
3. 组件会自动注册，无需手动导入

### 添加新工具函数

1. 在 `src/utils/` 下创建工具文件
2. 导出工具函数
3. 在需要的地方导入使用

### 添加新的 Composable

1. 在 `src/composables/` 下创建文件
2. 使用 `use` 前缀命名
3. 返回对象包含状态和方法

## 常见问题

### Q1: 组件未自动导入?

**检查项**:
1. 组件是否在 `src/components` 目录下
2. 组件文件名是否符合规范
3. 检查 `unplugin-vue-components` 配置
4. 重启开发服务器

### Q2: API 请求跨域?

**解决方案**:
1. 配置 Vite 代理
2. 后端配置 CORS
3. 使用 Nginx 反向代理

### Q3: 路由守卫不生效?

**检查项**:
1. 路由守卫是否正确注册
2. Token 是否存在
3. 权限配置是否正确
4. 路由 meta 信息是否完整

### Q4: 样式不生效?

**检查项**:
1. UnoCSS 配置是否正确
2. 样式文件是否导入
3. CSS 选择器优先级
4. 浏览器缓存

## 总结

RuoYi-Plus-UniApp 前端项目采用现代化的技术栈和清晰的目录结构，为大型企业级应用提供了坚实的基础架构。通过合理的模块划分、规范的代码组织和完善的工程化配置，确保项目具有良好的可维护性和扩展性。

**关键特点**:
- ✅ 清晰的目录层次
- ✅ 模块化的代码组织
- ✅ 完善的类型定义
- ✅ 自动化的工具链
- ✅ 规范的命名约定
- ✅ 丰富的最佳实践

遵循本文档的规范和最佳实践，可以高效地进行项目开发和维护。
