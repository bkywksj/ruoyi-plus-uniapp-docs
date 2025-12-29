# 组件自动导入插件

## 介绍

组件自动导入插件（@uni-helper/vite-plugin-uni-components）用于自动扫描和注册 Vue 组件，无需手动导入和注册即可直接在模板中使用组件。该插件专为 UniApp 项目优化，支持递归扫描组件目录，自动生成 TypeScript 类型声明，提供完整的 IDE 智能提示支持。

**核心特性：**

- **自动组件注册** - 扫描组件目录，自动全局注册组件，无需手动 import
- **递归扫描** - 支持深层目录扫描，自动发现嵌套组件
- **TypeScript 支持** - 自动生成组件类型声明文件，提供完整的类型提示
- **命名空间支持** - 可选择将目录名作为组件名前缀
- **按需加载** - 仅导入实际使用的组件，优化打包体积
- **UniApp 兼容** - 专为 UniApp 项目设计，完美兼容各平台
- **自定义解析器** - 支持第三方 UI 库组件解析
- **热更新支持** - 开发时新增组件自动识别

## 架构设计

### 插件系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vite 构建流程                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  configResolved │ → │  buildStart   │ → │  transform    │      │
│  │    (配置解析)   │    │   (构建开始)   │    │   (代码转换)   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         ↓                    ↓                    ↓            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  读取插件配置  │    │  扫描组件目录  │    │  注入 import  │      │
│  │  解析目录路径  │    │  生成类型声明  │    │  注册组件     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 组件发现流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    组件发现与注册流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 目录扫描阶段                                                 │
│     ┌─────────────────────────────────────────────┐             │
│     │ src/components/                              │             │
│     │ ├── auth/                                    │             │
│     │ │   └── AuthModal.vue  ──────────────────┐  │             │
│     │ ├── tabbar/                              │  │             │
│     │ │   ├── Home.vue  ───────────────────────┼──│─→ 组件映射表 │
│     │ │   ├── Menu.vue  ───────────────────────┤  │             │
│     │ │   └── My.vue  ─────────────────────────┘  │             │
│     │ └── common/                                  │             │
│     │     └── Loading.vue ─────────────────────────│─→ 组件映射表 │
│     └─────────────────────────────────────────────┘             │
│                              ↓                                  │
│  2. 映射表生成阶段                                               │
│     ┌─────────────────────────────────────────────┐             │
│     │ {                                           │             │
│     │   'AuthModal': 'src/components/auth/AuthModal.vue',       │
│     │   'Home': 'src/components/tabbar/Home.vue', │             │
│     │   'Menu': 'src/components/tabbar/Menu.vue', │             │
│     │   'My': 'src/components/tabbar/My.vue',     │             │
│     │   'Loading': 'src/components/common/Loading.vue'          │
│     │ }                                           │             │
│     └─────────────────────────────────────────────┘             │
│                              ↓                                  │
│  3. 类型声明生成阶段                                             │
│     ┌─────────────────────────────────────────────┐             │
│     │ // src/types/components.d.ts                │             │
│     │ declare module 'vue' {                      │             │
│     │   export interface GlobalComponents {       │             │
│     │     AuthModal: typeof import(...)['default']│             │
│     │     Home: typeof import(...)['default']     │             │
│     │     ...                                     │             │
│     │   }                                         │             │
│     │ }                                           │             │
│     └─────────────────────────────────────────────┘             │
│                              ↓                                  │
│  4. 代码转换阶段（按需）                                         │
│     ┌─────────────────────────────────────────────┐             │
│     │ // 原始代码                                 │             │
│     │ <template>                                  │             │
│     │   <AuthModal />                             │             │
│     │ </template>                                 │             │
│     │                     ↓                       │             │
│     │ // 转换后代码                               │             │
│     │ import AuthModal from './auth/AuthModal.vue'│             │
│     │ <template>                                  │             │
│     │   <AuthModal />                             │             │
│     │ </template>                                 │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 与 easycom 机制对比

UniApp 提供两种组件自动导入机制，理解它们的差异有助于正确配置项目：

| 特性 | vite-plugin-uni-components | easycom |
|------|---------------------------|---------|
| **配置位置** | vite.config.ts | pages.json / pages.config.ts |
| **扫描时机** | Vite 构建时 | UniApp 编译时 |
| **类型支持** | 自动生成 .d.ts 文件 | 需手动配置 |
| **规则灵活性** | 基于目录扫描 | 基于正则匹配 |
| **自定义解析器** | ✅ 支持 | ❌ 不支持 |
| **适用场景** | 项目自定义组件 | UI 库组件 |
| **优先级** | 低 | 高 |

**推荐配置方案：**

```typescript
// 1. easycom 用于 UI 库组件（优先级高）
// pages.config.ts
export default defineUniPages({
  easycom: {
    autoscan: true,
    custom: {
      // WD UI 组件库
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },
})

// 2. vite-plugin-uni-components 用于项目组件
// vite/plugins/components.ts
export default () => {
  return Components({
    dirs: ['src/components'],
    dts: 'src/types/components.d.ts',
  })
}
```

## 基本用法

### 插件配置

在 `vite/plugins/components.ts` 中配置：

```typescript
import Components from '@uni-helper/vite-plugin-uni-components'

/**
 * 组件自动导入插件配置
 * 自动导入组件，无需手动注册
 */
export default () => {
  return Components({
    extensions: ['vue'],
    deep: true, // 是否递归扫描子目录
    directoryAsNamespace: false, // 是否把目录名作为命名空间前缀
    dts: 'src/types/components.d.ts', // 自动生成的组件类型声明文件路径
  })
}
```

### 在插件入口中注册

```typescript
// vite/plugins/index.ts
import createComponents from './components'
import createAutoImport from './auto-imports'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 其他插件...

  // 自动导入相关插件（注意顺序）
  vitePlugins.push(createAutoImport())   // API 自动导入
  vitePlugins.push(createComponents())   // 组件自动导入

  return vitePlugins
}
```

**加载顺序说明：**

1. **createAutoImport()** - API 自动导入（ref、computed 等）
2. **createComponents()** - 组件自动导入
3. **Uni()** - UniApp 核心插件（必须最后）

## 配置选项详解

### extensions

- **类型**: `string[]`
- **默认值**: `['vue']`
- **说明**: 需要扫描的文件扩展名

```typescript
Components({
  // 仅扫描 .vue 文件
  extensions: ['vue'],
})

// 如果项目中使用 JSX/TSX
Components({
  extensions: ['vue', 'jsx', 'tsx'],
})
```

### deep

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否递归扫描子目录

```typescript
Components({
  deep: true,  // 启用递归扫描
})
```

**目录结构示例：**

```
src/components/
├── auth/
│   └── AuthModal.vue      # ✅ deep=true 时会被扫描
├── tabbar/
│   ├── Home.vue           # ✅ 会被扫描
│   ├── Menu.vue           # ✅ 会被扫描
│   └── My.vue             # ✅ 会被扫描
└── common/
    ├── Header.vue         # ✅ 会被扫描
    └── nested/
        └── DeepComp.vue   # ✅ deep=true 时会被扫描
                           # ❌ deep=false 时不会被扫描
```

### directoryAsNamespace

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否将目录名作为组件名前缀

```typescript
// 项目配置：不使用目录前缀
Components({
  directoryAsNamespace: false,
})
```

**组件命名对比：**

| 文件路径 | directoryAsNamespace: false | directoryAsNamespace: true |
|----------|----------------------------|---------------------------|
| `auth/AuthModal.vue` | `AuthModal` | `AuthAuthModal` |
| `tabbar/Home.vue` | `Home` | `TabbarHome` |
| `common/Header.vue` | `Header` | `CommonHeader` |
| `form/Input.vue` | `Input` | `FormInput` |

**使用场景建议：**

```typescript
// 场景1：组件名已包含分类前缀（推荐）
// 目录结构：auth/AuthModal.vue, form/FormInput.vue
Components({
  directoryAsNamespace: false, // 组件名：AuthModal, FormInput
})

// 场景2：组件名简短，需要避免冲突
// 目录结构：auth/Modal.vue, common/Modal.vue
Components({
  directoryAsNamespace: true, // 组件名：AuthModal, CommonModal
})
```

### dts

- **类型**: `string | false`
- **默认值**: `'src/types/components.d.ts'`
- **说明**: TypeScript 类型声明文件路径

```typescript
// 默认配置
Components({
  dts: 'src/types/components.d.ts',
})

// 自定义路径
Components({
  dts: 'types/components.d.ts',
})

// 禁用类型声明生成
Components({
  dts: false,
})
```

### dirs

- **类型**: `string[]`
- **默认值**: `['src/components']`
- **说明**: 需要扫描的组件目录

```typescript
// 单目录扫描（默认）
Components({
  dirs: ['src/components'],
})

// 多目录扫描
Components({
  dirs: [
    'src/components',      // 主组件目录
    'src/layouts',         // 布局组件
    'src/pages-components', // 页面级组件
  ],
})
```

### include

- **类型**: `RegExp[]`
- **说明**: 需要包含的文件模式

```typescript
Components({
  include: [
    /\.vue$/,
    /\.vue\?vue/,  // 处理 vue 文件的 query 参数
  ],
})
```

### exclude

- **类型**: `RegExp[]`
- **说明**: 需要排除的文件模式

```typescript
Components({
  exclude: [
    /[\\/]node_modules[\\/]/,  // 排除 node_modules
    /[\\/]\.git[\\/]/,          // 排除 .git
    /[\\/]__tests__[\\/]/,      // 排除测试目录
  ],
})
```

### resolvers

- **类型**: `ComponentResolver[]`
- **说明**: 自定义组件解析器，用于第三方 UI 库

```typescript
import { VantResolver } from '@vant/auto-import-resolver'

Components({
  resolvers: [
    // Vant UI 解析器
    VantResolver(),

    // 自定义解析器
    (componentName) => {
      if (componentName.startsWith('My')) {
        return {
          name: componentName,
          from: `@/components/${componentName}.vue`,
        }
      }
    },
  ],
})
```

### collapseSamePrefixes

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 当 directoryAsNamespace 为 true 时，是否折叠相同的前缀

```typescript
Components({
  directoryAsNamespace: true,
  collapseSamePrefixes: true,
})
```

**效果对比：**

```
// 文件：form/FormInput.vue

// collapseSamePrefixes: false
组件名：FormFormInput

// collapseSamePrefixes: true
组件名：FormInput  // 折叠重复的 Form 前缀
```

### version

- **类型**: `number`
- **默认值**: `3`
- **说明**: Vue 版本号

```typescript
Components({
  version: 3, // Vue 3
})
```

## 生成的类型声明

插件会自动生成组件类型声明文件，提供完整的类型支持：

```typescript
// src/types/components.d.ts
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by vite-plugin-uni-components
// Read more: https://github.com/vuejs/core/pull/3399
export {}

declare module 'vue' {
  export interface GlobalComponents {
    AuthModal: typeof import('./../components/auth/AuthModal.vue')['default']
    Home: typeof import('./../components/tabbar/Home.vue')['default']
    Menu: typeof import('./../components/tabbar/Menu.vue')['default']
    My: typeof import('./../components/tabbar/My.vue')['default']
  }
}
```

**类型声明的作用：**

1. **组件名提示** - 在模板中输入组件名时自动补全
2. **Props 类型检查** - 检查组件属性类型是否正确
3. **事件类型检查** - 检查组件事件参数类型
4. **插槽类型支持** - 提供插槽的类型信息
5. **IDE 智能导航** - 支持 Ctrl+Click 跳转到组件定义

**tsconfig.json 配置：**

```json
{
  "compilerOptions": {
    "types": ["@dcloudio/types", "@uni-helper/uni-app-types"]
  },
  "include": [
    "src/**/*.vue",
    "src/**/*.ts",
    "src/types/*.d.ts"  // 确保包含类型声明
  ]
}
```

## 使用示例

### 直接使用组件

无需导入，直接在模板中使用：

```vue
<template>
  <view class="page">
    <!-- 直接使用 AuthModal 组件 -->
    <AuthModal v-model:visible="showAuth" />

    <!-- 直接使用 Tabbar 组件 -->
    <Home />
    <Menu />
    <My />
  </view>
</template>

<script lang="ts" setup>
// 无需 import AuthModal from '@/components/auth/AuthModal.vue'
const showAuth = ref(false)
</script>
```

### 项目实际组件示例

以项目中的 `AuthModal` 组件为例：

```vue
<!-- src/components/auth/AuthModal.vue -->
<template>
  <wd-popup
    v-model="userStore.authModalVisible"
    custom-class="rounded-t-4"
    position="bottom"
    closable
  >
    <view class="p-4">
      <!-- 标题 -->
      <wd-text text="授权" size="38" color="#751937" />

      <!-- 表单区域 -->
      <wd-form ref="formRef" :model="form">
        <!-- 头像选择 -->
        <view class="mt-8">
          <wd-cell title="头像" custom-title-class="text-#751937 text-4">
            <wd-button
              custom-class="w-15! h-15! bg-#f9f9f9! -mt-5"
              type="icon"
              :icon="avatarPreviewUrl || 'camera'"
              :icon-size="avatarPreviewUrl ? 120 : 40"
              icon-color="#999999"
              open-type="chooseAvatar"
              @chooseavatar="chooseavatar"
              @click="manualChooseAvatar"
            />
          </wd-cell>
          <!-- 昵称输入 -->
          <wd-input
            v-model="form.nickName"
            label="昵称"
            custom-label-class="text-#751937 text-4!"
            input-align="right"
            align-right
            type="nickname"
          />
        </view>
      </wd-form>

      <!-- 操作按钮 -->
      <view class="mt-8 flex items-center justify-center gap-8 px-4 pb-8">
        <wd-button
          custom-class="bg-#f9f9f9! border-0! text-#888888!"
          type="info"
          plain
          @click="reject"
        >
          残忍拒绝
        </wd-button>
        <view class="relative">
          <wd-button type="success" @click="agree">立即授权</wd-button>
          <wd-button
            v-if="needPhoneAuth"
            invisible
            open-type="getPhoneNumber"
            @getphonenumber="handlePhoneAuth"
          />
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<script setup lang="ts" name="AuthModal">
import type { UserProfileUpdateBo } from '@/api/system/auth/authTypes'
import { ref, watch } from 'vue'
import { updateUserProfile } from '@/api/system/auth/authApi'
import { bindPhone } from '@/api/app/phone/phoneApi'
import { useUpload, useToast } from '@/wd'
import PLATFORM from '@/utils/platform'

// 组合式API
const toast = useToast()
const userStore = useUserStore()
const upload = useUpload()

// 响应式数据
const formRef = ref<UserProfileUpdateBo>()
const form = ref({
  avatar: '',
  nickName: '',
})
const avatarPreviewUrl = ref('')

// 手机号授权开关
const needPhoneAuth = computed(() => {
  return (
    userStore.requirePhoneAuth &&
    PLATFORM.isMpWeixin &&
    !userStore.userInfo?.phone
  )
})

/** 选择头像 */
const chooseavatar = (detail) => {
  // #ifdef MP-WEIXIN
  toast.loading('正在上传头像...')
  upload.fastUpload(detail.avatarUrl, {
    onSuccess(res, file) {
      toast.close()
      avatarPreviewUrl.value = res.url
      form.value.avatar = res.originalUrl!
    },
    onError(err, file) {
      toast.close()
      toast.error(`头像上传失败:${err.errMsg}，请重试`)
    },
  })
  // #endif
}

// 其他方法...
</script>
```

**使用该组件：**

```vue
<template>
  <view>
    <!-- 无需导入，直接使用 -->
    <AuthModal />
  </view>
</template>

<script lang="ts" setup>
// 组件会自动注入，无需手动导入
</script>
```

### 组件目录结构

推荐的组件目录结构：

```
src/components/
├── auth/                    # 认证相关组件
│   ├── AuthModal.vue        # 认证弹窗
│   ├── LoginForm.vue        # 登录表单
│   └── RegisterForm.vue     # 注册表单
├── common/                  # 通用组件
│   ├── Empty.vue            # 空状态
│   ├── Loading.vue          # 加载中
│   └── ErrorTip.vue         # 错误提示
├── form/                    # 表单组件
│   ├── FormItem.vue         # 表单项
│   ├── FormInput.vue        # 输入框
│   └── FormSelect.vue       # 选择器
├── list/                    # 列表组件
│   ├── ListItem.vue         # 列表项
│   ├── ListHeader.vue       # 列表头部
│   └── ListFooter.vue       # 列表底部
└── tabbar/                  # Tabbar 组件
    ├── Home.vue             # 首页 Tab
    ├── Menu.vue             # 菜单 Tab
    └── My.vue               # 我的 Tab
```

### 组件开发规范

```vue
<!-- src/components/common/Loading.vue -->
<template>
  <view v-if="visible" class="loading-container">
    <wd-loading :size="size" :color="color" />
    <text v-if="text" class="loading-text">{{ text }}</text>
  </view>
</template>

<script lang="ts" setup>
// 定义组件名称（可选，用于调试）
defineOptions({
  name: 'Loading',
})

// Props 定义
interface Props {
  visible?: boolean
  text?: string
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  text: '加载中...',
  size: 32,
  color: '#1989fa',
})

// Emits 定义
const emit = defineEmits<{
  close: []
}>()
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.loading-text {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

## 工作原理

### 核心实现机制

```
┌─────────────────────────────────────────────────────────────────┐
│                   组件自动导入流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 构建启动（buildStart 钩子）                                  │
│       ↓                                                         │
│  2. 扫描 dirs 配置的目录                                         │
│       ↓                                                         │
│  3. 递归查找 .vue 文件（deep: true）                             │
│       ↓                                                         │
│  4. 解析组件名称                                                 │
│       │                                                         │
│       ├─ 文件名作为组件名                                        │
│       └─ 可选：目录名作为前缀                                    │
│       ↓                                                         │
│  5. 生成组件映射表                                               │
│       ↓                                                         │
│  6. 生成类型声明文件（.d.ts）                                    │
│       ↓                                                         │
│  7. 转换 Vue 文件（transform 钩子）                              │
│       │                                                         │
│       ├─ 解析模板，检测使用的组件                                │
│       ├─ 查询组件映射表                                          │
│       ├─ 自动注入 import 语句                                    │
│       └─ 注册为局部组件                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 插件生命周期

```typescript
// 插件内部伪代码
const plugin = {
  name: 'vite-plugin-uni-components',

  // 1. 配置解析完成后
  configResolved(config) {
    // 获取项目根目录
    // 解析 dirs 相对路径为绝对路径
  },

  // 2. 构建开始时
  buildStart() {
    // 扫描组件目录
    // 生成组件映射表
    // 写入类型声明文件
  },

  // 3. 代码转换时
  transform(code, id) {
    // 检查是否是 Vue 文件
    // 解析模板中使用的组件
    // 注入必要的 import 语句
  },

  // 4. 热更新时
  handleHotUpdate({ file }) {
    // 检查是否是组件文件变化
    // 更新组件映射表
    // 重新生成类型声明
  },
}
```

### 按需加载原理

```typescript
// 原始 Vue 文件
// page.vue
<template>
  <AuthModal v-model="show" />
  <Loading v-if="loading" />
</template>

// 转换后（仅导入使用的组件）
import AuthModal from '@/components/auth/AuthModal.vue'
import Loading from '@/components/common/Loading.vue'

<template>
  <AuthModal v-model="show" />
  <Loading v-if="loading" />
</template>

// 注意：未使用的组件（如 Menu.vue）不会被导入
// 这样可以减少打包体积，实现按需加载
```

## 与其他插件配合

### 配合 auto-import 插件

```typescript
// vite/plugins/index.ts
export default async () => {
  const vitePlugins: any[] = []

  // 1. API 自动导入（ref、computed、useXxx 等）
  vitePlugins.push(createAutoImport())

  // 2. 组件自动导入（Vue 组件）
  vitePlugins.push(createComponents())

  return vitePlugins
}
```

**效果：**

```vue
<template>
  <!-- 组件自动导入：无需 import -->
  <AuthModal v-model:visible="visible" @confirm="handleConfirm" />
  <Loading v-if="loading" />
</template>

<script lang="ts" setup>
// API 自动导入：无需 import ref, computed
const visible = ref(false)
const loading = ref(false)

// Store 自动导入：无需 import useUserStore
const userStore = useUserStore()

const handleConfirm = async () => {
  loading.value = true
  await userStore.login()
  loading.value = false
}
</script>
```

### 配合 easycom 规范

项目同时支持 easycom 自动导入：

```typescript
// pages.config.ts
export default defineUniPages({
  easycom: {
    autoscan: true,
    custom: {
      // WD UI 组件
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
      // 项目自定义组件（可选，vite 插件已处理）
      // '^custom-(.*)': '@/components/custom/$1.vue',
    },
  },
})
```

**组件导入优先级：**

1. **easycom 规则匹配** - 优先级最高（WD UI 组件）
2. **vite-plugin-uni-components** - 次优先级（项目组件）
3. **手动导入** - 优先级最低

### 配合 TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@dcloudio/types", "@uni-helper/uni-app-types"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*.vue",
    "src/**/*.ts",
    "src/types/*.d.ts"
  ],
  "vueCompilerOptions": {
    "nativeTags": ["block", "component", "template", "slot"]
  }
}
```

## API 参考

### 插件选项完整定义

```typescript
interface ComponentsOptions {
  /** 扫描的文件扩展名 */
  extensions?: string[]

  /** 是否递归扫描子目录 */
  deep?: boolean

  /** 是否将目录名作为命名空间前缀 */
  directoryAsNamespace?: boolean

  /** 折叠相同前缀 */
  collapseSamePrefixes?: boolean

  /** 类型声明文件路径，false 禁用 */
  dts?: string | false

  /** 扫描的目录列表 */
  dirs?: string[]

  /** 包含的文件模式 */
  include?: RegExp[]

  /** 排除的文件模式 */
  exclude?: RegExp[]

  /** 组件解析器 */
  resolvers?: ComponentResolver[]

  /** Vue 版本 */
  version?: number

  /** 组件名转换函数 */
  transformName?: (name: string) => string

  /** 自定义目录过滤函数 */
  dirFilter?: (path: string) => boolean
}
```

### 选项说明表

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| extensions | `string[]` | `['vue']` | 扫描的文件扩展名 |
| deep | `boolean` | `true` | 是否递归扫描 |
| directoryAsNamespace | `boolean` | `false` | 目录名作为前缀 |
| collapseSamePrefixes | `boolean` | `false` | 折叠相同前缀 |
| dts | `string \| false` | `'src/types/components.d.ts'` | 类型声明文件 |
| dirs | `string[]` | `['src/components']` | 扫描目录 |
| include | `RegExp[]` | `[/\.vue$/]` | 包含模式 |
| exclude | `RegExp[]` | `[/node_modules/]` | 排除模式 |
| resolvers | `ComponentResolver[]` | `[]` | 自定义解析器 |
| version | `number` | `3` | Vue 版本 |

### 解析器接口

```typescript
type ComponentResolver = (
  componentName: string
) => ComponentInfo | undefined | null | void

interface ComponentInfo {
  /** 组件名称 */
  name: string
  /** 导入来源 */
  from: string
  /** 是否默认导出 */
  default?: boolean
  /** 附加导入 */
  sideEffects?: string[]
}

// 使用示例
const MyResolver: ComponentResolver = (name) => {
  if (name.startsWith('My')) {
    return {
      name,
      from: `my-component-lib`,
      default: true,
    }
  }
}
```

## 最佳实践

### 1. 组件命名规范

```vue
<!-- ✅ 推荐：PascalCase 命名 -->
<AuthModal />
<LoginForm />
<UserProfile />

<!-- ❌ 不推荐：kebab-case -->
<auth-modal />
<login-form />
```

**文件命名规范：**

```
src/components/
├── AuthModal.vue         # ✅ PascalCase
├── LoginForm.vue         # ✅ PascalCase
└── user-profile.vue      # ❌ 不推荐 kebab-case
```

### 2. 组件分类组织

```
src/components/
├── auth/                # 认证模块
│   ├── AuthModal.vue    # 认证弹窗
│   └── LoginForm.vue    # 登录表单
├── business/            # 业务组件
│   ├── OrderCard.vue    # 订单卡片
│   └── ProductItem.vue  # 商品项
├── common/              # 通用组件
│   ├── Empty.vue        # 空状态
│   └── Loading.vue      # 加载中
├── form/                # 表单组件
│   ├── FormInput.vue    # 输入框
│   └── FormSelect.vue   # 选择器
└── layout/              # 布局组件
    ├── PageHeader.vue   # 页面头部
    └── PageFooter.vue   # 页面底部
```

### 3. 避免命名冲突

```typescript
// 方案1：组件名包含分类前缀（推荐）
src/components/
├── auth/
│   └── AuthModal.vue      # 组件名：AuthModal
└── common/
    └── CommonModal.vue    # 组件名：CommonModal

// 方案2：启用命名空间
Components({
  directoryAsNamespace: true,
  collapseSamePrefixes: true,
})

// 此时 auth/Modal.vue → AuthModal
// 此时 common/Modal.vue → CommonModal
```

### 4. 组件类型定义

```vue
<script lang="ts" setup>
// 明确定义 Props 接口
interface Props {
  visible: boolean
  title?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '默认标题',
  loading: false,
})

// 明确定义 Emits 接口
const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [data: any]
  cancel: []
}>()

// 暴露方法给父组件
defineExpose({
  open: () => { /* ... */ },
  close: () => { /* ... */ },
})
</script>
```

### 5. 组件懒加载

对于大型组件，可以使用动态导入：

```vue
<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'

// 异步加载大型组件
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/heavy/HeavyComponent.vue')
)
</script>

<template>
  <HeavyComponent v-if="showHeavy" />
</template>
```

### 6. 开发调试技巧

```typescript
// 开发时启用详细日志
Components({
  dts: 'src/types/components.d.ts',
  // 检查生成的类型文件确认组件是否被正确识别
})

// 检查组件映射
// 查看 src/types/components.d.ts 文件内容
// 确认所有组件都被正确列出
```

## 常见问题

### 1. 组件未被自动识别

**问题原因：**
- 组件文件不在扫描目录中
- 文件扩展名不匹配
- 组件未正确导出

**解决方案：**

```typescript
// 1. 确保组件在正确目录
Components({
  dirs: ['src/components'],  // 检查目录配置
  extensions: ['vue'],        // 检查扩展名
  deep: true,                 // 确保递归扫描
})

// 2. 检查组件文件
// src/components/MyComponent.vue
<template>
  <view>内容</view>
</template>

<script lang="ts" setup>
// 使用 setup 语法，组件自动导出
</script>

// 3. 重启开发服务器
// 删除 src/types/components.d.ts 后重启
```

### 2. 类型提示不生效

**问题原因：**
- 类型声明文件未生成
- tsconfig.json 未包含类型文件
- IDE 缓存问题

**解决方案：**

```json
// tsconfig.json
{
  "include": [
    "src/**/*.vue",
    "src/**/*.ts",
    "src/types/*.d.ts"  // 确保包含类型声明
  ]
}
```

```bash
# 重新生成类型声明
rm src/types/components.d.ts
pnpm dev
```

### 3. 组件名冲突

**问题原因：**
- 多个目录存在同名组件

**解决方案：**

```typescript
// 方案1：启用命名空间
Components({
  directoryAsNamespace: true,
})

// 方案2：重命名组件
src/components/
├── auth/
│   └── AuthModal.vue      # 添加前缀区分
└── common/
    └── CommonModal.vue    # 添加前缀区分
```

### 4. 第三方组件库冲突

**问题原因：**
- 自动扫描的组件与第三方组件库同名

**解决方案：**

```typescript
// 使用排除规则
Components({
  exclude: [
    /[\\/]node_modules[\\/]/,  // 排除 node_modules
  ],
})

// 或使用不同的组件名
<template>
  <MyButton />      <!-- 自定义组件 -->
  <wd-button />     <!-- WD UI 组件（通过 easycom）-->
</template>
```

### 5. 热更新不生效

**问题原因：**
- 新增组件后需要重新生成类型声明

**解决方案：**

1. 重启开发服务器
2. 删除 `src/types/components.d.ts` 后重新启动

```bash
rm src/types/components.d.ts
pnpm dev
```

### 6. 与 easycom 优先级冲突

**问题原因：**
- easycom 和 vite 插件都匹配了同一组件

**解决方案：**

```typescript
// pages.config.ts - easycom 用于 UI 库
export default defineUniPages({
  easycom: {
    custom: {
      // 仅配置 UI 库组件
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },
})

// components.ts - vite 插件用于项目组件
Components({
  dirs: ['src/components'],  // 仅扫描项目组件
})
```

### 7. 构建后组件丢失

**问题原因：**
- 组件未被正确识别和打包

**解决方案：**

```typescript
// 检查构建配置
Components({
  include: [/\.vue$/, /\.vue\?vue/],
  // 确保 include 模式正确
})

// 检查类型声明文件是否包含该组件
// src/types/components.d.ts
```

### 8. 循环依赖问题

**问题原因：**
- 组件 A 引用组件 B，组件 B 又引用组件 A

**解决方案：**

```vue
<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'

// 使用异步组件打破循环
const ComponentB = defineAsyncComponent(() =>
  import('@/components/ComponentB.vue')
)
</script>
```

## 性能优化

### 1. 减少扫描范围

```typescript
Components({
  dirs: ['src/components'],  // 仅扫描必要目录
  exclude: [
    /[\\/]__tests__[\\/]/,   // 排除测试目录
    /[\\/]\.stories\./,      // 排除 Storybook 文件
  ],
})
```

### 2. 使用缓存

插件内部会缓存组件映射表，但可以通过以下方式优化：

```typescript
// 避免在热更新时频繁重建
Components({
  dts: 'src/types/components.d.ts',
  // 类型文件仅在组件变化时更新
})
```

### 3. 按需扫描

```typescript
// 只扫描需要的目录
Components({
  dirs: [
    'src/components/common',   // 通用组件
    'src/components/business', // 业务组件
  ],
  // 不扫描不需要自动导入的目录
})
```

## 调试技巧

### 1. 查看生成的类型声明

```bash
# 检查类型声明文件
cat src/types/components.d.ts
```

### 2. 验证组件是否被识别

```typescript
// 查看 components.d.ts 是否包含目标组件
// 如果缺少，检查：
// 1. 组件文件位置是否在 dirs 配置的目录中
// 2. 文件扩展名是否在 extensions 中
// 3. 是否被 exclude 规则排除
```

### 3. 开发环境调试

```bash
# 重启开发服务器以重新扫描
pnpm dev

# 或清除缓存后重启
rm -rf node_modules/.vite
pnpm dev
```

### 4. 构建时调试

```bash
# 构建时查看详细信息
pnpm build --debug

# 检查构建产物
ls -la dist/
```

## 版本兼容性

| 插件版本 | Vite 版本 | Vue 版本 | UniApp 版本 |
|---------|----------|---------|-------------|
| 0.1.x | 4.x | 3.3+ | 3.0+ |
| 0.2.x | 5.x | 3.4+ | 3.0+ |
| 0.3.x | 6.x | 3.4+ | 3.0+ |

**项目当前版本：**

```json
{
  "@uni-helper/vite-plugin-uni-components": "^0.1.0",
  "vite": "^6.3.5",
  "vue": "^3.4.21"
}
```

## 扩展阅读

### 相关技术

1. **unplugin-vue-components** - 通用 Vue 组件自动导入插件
2. **unplugin-auto-import** - API 自动导入插件
3. **Vue 3 组件系统** - Vue 3 组件注册机制
4. **Vite 插件开发** - Vite 插件 API

### 官方资源

- **GitHub**: https://github.com/uni-helper/vite-plugin-uni-components
- **uni-helper**: https://uni-helper.js.org/
- **Vite 插件 API**: https://vitejs.dev/guide/api-plugin.html

