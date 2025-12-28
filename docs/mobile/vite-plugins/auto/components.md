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

## 基本用法

### 插件配置

在 `vite/plugins/components.ts` 中配置：

```typescript
import Components from '@uni-helper/vite-plugin-uni-components'

export default () => {
  return Components({
    extensions: ['vue'],
    deep: true,
    directoryAsNamespace: false,
    dts: 'src/types/components.d.ts',
  })
}
```

### 在插件入口中注册

```typescript
// vite/plugins/index.ts
import createComponents from './components'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 其他插件...

  // 组件自动导入插件
  vitePlugins.push(createComponents())

  return vitePlugins
}
```

## 配置选项

### extensions

- **类型**: `string[]`
- **默认值**: `['vue']`
- **说明**: 需要扫描的文件扩展名

```typescript
Components({
  extensions: ['vue'],  // 仅扫描 .vue 文件
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
│   └── AuthModal.vue      # ✅ 会被扫描
├── tabbar/
│   ├── Home.vue           # ✅ 会被扫描
│   ├── Menu.vue           # ✅ 会被扫描
│   └── My.vue             # ✅ 会被扫描
└── common/
    ├── Header.vue         # ✅ 会被扫描
    └── nested/
        └── DeepComp.vue   # ✅ deep=true 时会被扫描
```

### directoryAsNamespace

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否将目录名作为组件名前缀

```typescript
Components({
  directoryAsNamespace: false,  // 组件名不包含目录前缀
})
```

**组件命名对比：**

| 文件路径 | directoryAsNamespace: false | directoryAsNamespace: true |
|----------|----------------------------|---------------------------|
| `auth/AuthModal.vue` | `AuthModal` | `AuthAuthModal` |
| `tabbar/Home.vue` | `Home` | `TabbarHome` |
| `common/Header.vue` | `Header` | `CommonHeader` |

### dts

- **类型**: `string | false`
- **默认值**: `'src/types/components.d.ts'`
- **说明**: TypeScript 类型声明文件路径

```typescript
Components({
  dts: 'src/types/components.d.ts',  // 自动生成类型声明
})
```

### dirs

- **类型**: `string[]`
- **默认值**: `['src/components']`
- **说明**: 需要扫描的组件目录

```typescript
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
  include: [/\.vue$/, /\.vue\?vue/],
})
```

### exclude

- **类型**: `RegExp[]`
- **说明**: 需要排除的文件模式

```typescript
Components({
  exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
})
```

## 生成的类型声明

插件会自动生成组件类型声明文件，提供完整的类型支持：

```typescript
// src/types/components.d.ts
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
<!-- src/components/auth/AuthModal.vue -->
<template>
  <view v-if="visible" class="auth-modal">
    <view class="modal-mask" @click="handleClose" />
    <view class="modal-content">
      <slot />
      <button @click="handleConfirm">确认</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 定义组件名称（可选，用于调试）
defineOptions({
  name: 'AuthModal',
})

// Props 定义
interface Props {
  visible: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '认证',
})

// Emits 定义
const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
}>()

// 方法
const handleClose = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm')
  handleClose()
}
</script>

<style lang="scss" scoped>
.auth-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}
</style>
```

## 工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                   组件自动导入流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 构建启动                                                 │
│       ↓                                                     │
│  2. 扫描 dirs 配置的目录                                     │
│       ↓                                                     │
│  3. 递归查找 .vue 文件（deep: true）                         │
│       ↓                                                     │
│  4. 解析组件名称                                             │
│       │                                                     │
│       ├─ 文件名作为组件名                                    │
│       └─ 可选：目录名作为前缀                                │
│       ↓                                                     │
│  5. 生成组件映射表                                           │
│       ↓                                                     │
│  6. 生成类型声明文件                                         │
│       ↓                                                     │
│  7. 转换 Vue 文件                                            │
│       │                                                     │
│       ├─ 检测模板中使用的组件                                │
│       ├─ 自动注入 import 语句                                │
│       └─ 注册为局部组件                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 与其他插件配合

### 配合 auto-import 插件

```typescript
// vite/plugins/index.ts
export default async () => {
  const vitePlugins: any[] = []

  // 1. API 自动导入
  vitePlugins.push(createAutoImport())

  // 2. 组件自动导入
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
// API 自动导入：无需 import
const visible = ref(false)
const loading = ref(false)

const { login } = useAuth()

const handleConfirm = async () => {
  loading.value = true
  await login()
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
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
      // 项目自定义组件
      '^custom-(.*)': '@/components/custom/$1.vue',
    },
  },
})
```

**组件导入优先级：**

1. easycom 规则匹配的组件
2. vite-plugin-uni-components 扫描的组件
3. 手动导入的组件

## API

### 插件选项

```typescript
interface ComponentsOptions {
  /** 扫描的文件扩展名 */
  extensions?: string[]
  /** 是否递归扫描子目录 */
  deep?: boolean
  /** 是否将目录名作为命名空间前缀 */
  directoryAsNamespace?: boolean
  /** 类型声明文件路径 */
  dts?: string | false
  /** 扫描的目录列表 */
  dirs?: string[]
  /** 包含的文件模式 */
  include?: RegExp[]
  /** 排除的文件模式 */
  exclude?: RegExp[]
  /** 组件解析器 */
  resolvers?: any[]
}
```

### 选项说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| extensions | `string[]` | `['vue']` | 扫描的文件扩展名 |
| deep | `boolean` | `true` | 是否递归扫描 |
| directoryAsNamespace | `boolean` | `false` | 目录名作为前缀 |
| dts | `string \| false` | `'src/types/components.d.ts'` | 类型声明文件 |
| dirs | `string[]` | `['src/components']` | 扫描目录 |

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

### 2. 文件命名规范

```
src/components/
├── AuthModal.vue         # ✅ PascalCase
├── LoginForm.vue         # ✅ PascalCase
└── user-profile.vue      # ❌ 不推荐 kebab-case
```

### 3. 避免命名冲突

```typescript
// 当多个目录有同名组件时，启用命名空间
Components({
  directoryAsNamespace: true,
})
```

```
src/components/
├── auth/
│   └── Modal.vue    # → AuthModal
├── common/
│   └── Modal.vue    # → CommonModal
└── form/
    └── Modal.vue    # → FormModal
```

### 4. 组件分类组织

```
src/components/
├── business/        # 业务组件
│   ├── OrderCard.vue
│   └── ProductItem.vue
├── common/          # 通用组件
│   ├── Empty.vue
│   └── Loading.vue
├── form/            # 表单组件
│   ├── FormInput.vue
│   └── FormSelect.vue
└── layout/          # 布局组件
    ├── PageHeader.vue
    └── PageFooter.vue
```

## 常见问题

### 1. 组件未被自动识别

**问题原因：**
- 组件文件不在扫描目录中
- 文件扩展名不匹配
- 组件未正确导出

**解决方案：**

```typescript
// 确保组件在正确目录
Components({
  dirs: ['src/components'],  // 检查目录配置
  extensions: ['vue'],        // 检查扩展名
  deep: true,                 // 确保递归扫描
})
```

### 2. 类型提示不生效

**问题原因：**
- 类型声明文件未生成
- tsconfig.json 未包含类型文件

**解决方案：**

```json
// tsconfig.json
{
  "include": [
    "src/**/*.vue",
    "src/types/*.d.ts"  // 确保包含类型声明
  ]
}
```

### 3. 组件名冲突

**问题原因：**
- 多个目录存在同名组件

**解决方案：**

```typescript
// 启用命名空间
Components({
  directoryAsNamespace: true,
})
```

或重命名组件：

```
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

使用排除规则：

```typescript
Components({
  exclude: [
    /[\\/]node_modules[\\/]/,  // 排除 node_modules
  ],
})
```

或使用不同的组件名：

```vue
<!-- 使用前缀区分 -->
<MyButton />      <!-- 自定义组件 -->
<wd-button />     <!-- WD UI 组件 -->
```

### 5. 热更新不生效

**问题原因：**
- 新增组件后需要重新生成类型声明

**解决方案：**

1. 重启开发服务器
2. 删除 `src/types/components.d.ts` 后重新启动

