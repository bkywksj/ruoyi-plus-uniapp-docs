# 组件导入插件

## 介绍

组件导入系统是 UniApp 的核心特性之一，通过 easycom 规范实现组件的自动扫描和注册。结合 `@uni-helper/vite-plugin-uni-components` 插件，可以获得更强大的组件自动导入能力，包括第三方组件库支持、TypeScript 类型生成等功能。

**核心特性：**

- **easycom 规范** - UniApp 原生的组件自动导入机制
- **自动扫描** - 自动扫描 components 目录下的组件
- **正则匹配** - 通过正则表达式自定义组件匹配规则
- **第三方组件** - 支持 WD UI、uView 等第三方组件库
- **Vite 集成** - 与 Vite 构建系统深度集成
- **类型支持** - 生成 TypeScript 类型声明文件

## easycom 配置

### 基本配置

在 `pages.config.ts` 中配置 easycom：

```typescript
// pages.config.ts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  // 组件自动导入配置
  easycom: {
    autoscan: true,  // 开启自动扫描 components 目录
    custom: {
      // 自定义组件匹配规则
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },
})
```

### 生成的 pages.json

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "@/wd/components/wd-$1/wd-$1.vue"
    }
  }
}
```

## 配置选项

### autoscan

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否开启自动扫描 components 目录

```typescript
easycom: {
  autoscan: true,  // 自动扫描 src/components 目录
}
```

**自动扫描规则：**

当 `autoscan: true` 时，框架会自动扫描 `src/components` 目录下符合以下规范的组件：

```
src/components/
├── MyButton/
│   └── MyButton.vue        # ✅ 组件名与目录名一致
├── user-card/
│   └── user-card.vue       # ✅ 组件名与目录名一致
├── Header.vue              # ❌ 根目录文件不被扫描
└── utils/
    └── helper.ts           # ❌ 非 .vue 文件不被扫描
```

### custom

- **类型**: `Record<string, string>`
- **说明**: 自定义组件匹配规则

```typescript
easycom: {
  custom: {
    // 正则表达式 -> 组件路径映射
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue',
    '^uv-(.*)': '@climblee/uv-ui/components/uv-$1/uv-$1.vue',
  },
}
```

**匹配规则说明：**

| 正则表达式 | 组件使用 | 匹配结果 |
|-----------|---------|---------|
| `^wd-(.*)` | `<wd-button>` | `@/wd/components/wd-button/wd-button.vue` |
| `^wd-(.*)` | `<wd-toast>` | `@/wd/components/wd-toast/wd-toast.vue` |
| `^uni-(.*)` | `<uni-icons>` | `@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue` |

## 第三方组件库配置

### WD UI（Wot Design Uni）

```typescript
easycom: {
  autoscan: true,
  custom: {
    // 本地 WD UI 组件
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
  },
}
```

### uni-ui 官方组件库

```typescript
easycom: {
  autoscan: true,
  custom: {
    // uni-ui 组件
    '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue',
  },
}
```

### uView UI

```typescript
easycom: {
  autoscan: true,
  custom: {
    // uView 2.x
    '^u-(.*)': 'uview-ui/components/u-$1/u-$1.vue',
    // uView Plus
    '^up-(.*)': 'uview-plus/components/u-$1/u-$1.vue',
  },
}
```

### uv-ui

```typescript
easycom: {
  autoscan: true,
  custom: {
    // uv-ui 组件
    '^uv-(.*)': '@climblee/uv-ui/components/uv-$1/uv-$1.vue',
  },
}
```

### TuniaoUI

```typescript
easycom: {
  autoscan: true,
  custom: {
    // TuniaoUI 组件
    '^tn-(.*)': '@tuniao/tnui-vue3-uniapp/components/$1/src/$1.vue',
  },
}
```

### 多组件库共存

```typescript
easycom: {
  autoscan: true,
  custom: {
    // WD UI
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    // uni-ui
    '^uni-(.*)': '@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue',
    // 自定义业务组件
    '^biz-(.*)': '@/components/business/$1/$1.vue',
  },
}
```

## Vite 插件配置

### @uni-helper/vite-plugin-uni-components

结合 Vite 插件获得更强大的功能：

```typescript
// vite/plugins/components.ts
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

### 插件与 easycom 的区别

| 特性 | easycom | vite-plugin-uni-components |
|------|---------|---------------------------|
| 配置位置 | pages.json | vite.config.ts |
| 类型生成 | ❌ 不支持 | ✅ 自动生成 .d.ts |
| IDE 提示 | 有限支持 | ✅ 完整类型提示 |
| 编译时机 | 运行时 | 构建时 |
| 自定义规则 | 正则匹配 | 正则+自定义解析器 |
| 按需导入 | ✅ 支持 | ✅ 支持 |

### 推荐配置

同时使用两种方式获得最佳体验：

```typescript
// pages.config.ts - easycom 配置
export default defineUniPages({
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
    },
  },
})
```

```typescript
// vite/plugins/components.ts - Vite 插件配置
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

## 组件目录结构

### 标准结构（推荐）

```
src/components/
├── auth/
│   ├── AuthModal/
│   │   └── AuthModal.vue     # 自动注册为 <AuthModal>
│   └── LoginForm/
│       └── LoginForm.vue     # 自动注册为 <LoginForm>
├── common/
│   ├── Empty/
│   │   └── Empty.vue         # 自动注册为 <Empty>
│   └── Loading/
│       └── Loading.vue       # 自动注册为 <Loading>
└── tabbar/
    ├── Home/
    │   └── Home.vue          # 自动注册为 <Home>
    └── My/
        └── My.vue            # 自动注册为 <My>
```

### 第三方组件库结构

```
src/wd/
└── components/
    ├── wd-button/
    │   └── wd-button.vue     # <wd-button>
    ├── wd-toast/
    │   └── wd-toast.vue      # <wd-toast>
    ├── wd-icon/
    │   └── wd-icon.vue       # <wd-icon>
    └── wd-cell/
        └── wd-cell.vue       # <wd-cell>
```

## 使用示例

### 使用 WD UI 组件

```vue
<template>
  <view class="page">
    <!-- WD UI 组件，无需 import -->
    <wd-button type="primary" @click="handleClick">
      点击按钮
    </wd-button>

    <wd-cell title="标题" value="内容" />

    <wd-icon name="check" size="48rpx" color="#0957DE" />
  </view>
</template>

<script lang="ts" setup>
// 无需 import，easycom 自动导入

const handleClick = () => {
  console.log('clicked')
}
</script>
```

### 使用自定义组件

```vue
<template>
  <view class="page">
    <!-- 自定义组件，无需 import -->
    <AuthModal v-model:visible="showAuth" />

    <Empty description="暂无数据" />

    <Loading v-if="loading" />
  </view>
</template>

<script lang="ts" setup>
const showAuth = ref(false)
const loading = ref(false)
</script>
```

### 混合使用

```vue
<template>
  <view class="page">
    <!-- WD UI 组件 -->
    <wd-navbar title="用户中心" />

    <!-- 自定义业务组件 -->
    <UserCard :user="userInfo" />

    <!-- uni-ui 组件（如果配置了） -->
    <uni-icons type="home" size="24" />

    <!-- WD UI 表单组件 -->
    <wd-form ref="formRef" :model="formData">
      <wd-input v-model="formData.name" label="姓名" />
      <wd-button type="primary" @click="submit">提交</wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
const userInfo = ref({ name: 'test' })
const formData = reactive({ name: '' })

const submit = () => {
  // 提交逻辑
}
</script>
```

## 类型声明

### 自动生成的类型文件

```typescript
// src/types/components.d.ts（由 Vite 插件自动生成）
export {}

declare module 'vue' {
  export interface GlobalComponents {
    // 自定义组件
    AuthModal: typeof import('./../components/auth/AuthModal/AuthModal.vue')['default']
    Empty: typeof import('./../components/common/Empty/Empty.vue')['default']
    Loading: typeof import('./../components/common/Loading/Loading.vue')['default']

    // WD UI 组件（如果配置了）
    WdButton: typeof import('./../wd/components/wd-button/wd-button.vue')['default']
    WdCell: typeof import('./../wd/components/wd-cell/wd-cell.vue')['default']
    WdIcon: typeof import('./../wd/components/wd-icon/wd-icon.vue')['default']
  }
}
```

### 手动声明类型

如果自动生成不完整，可以手动补充：

```typescript
// src/types/components.d.ts
export {}

declare module 'vue' {
  export interface GlobalComponents {
    // WD UI 组件
    'wd-button': typeof import('wot-design-uni')['WdButton']
    'wd-toast': typeof import('wot-design-uni')['WdToast']
    'wd-cell': typeof import('wot-design-uni')['WdCell']

    // 自定义组件
    AuthModal: typeof import('@/components/auth/AuthModal/AuthModal.vue')['default']
  }
}
```

## 工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                    组件导入工作流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 编译启动                                                 │
│       ↓                                                     │
│  2. 读取 easycom 配置                                        │
│       ├─ autoscan: true                                     │
│       └─ custom 规则                                        │
│       ↓                                                     │
│  3. 扫描组件目录                                             │
│       ├─ src/components/**                                  │
│       └─ 匹配 custom 规则的路径                              │
│       ↓                                                     │
│  4. 解析 Vue 模板                                            │
│       ├─ 识别使用的组件标签                                  │
│       └─ <wd-button>, <AuthModal> 等                        │
│       ↓                                                     │
│  5. 匹配组件                                                 │
│       ├─ 优先匹配 custom 规则                                │
│       └─ 然后匹配 autoscan 扫描结果                          │
│       ↓                                                     │
│  6. 自动注入导入                                             │
│       ├─ 生成 import 语句                                   │
│       └─ 注册为局部组件                                      │
│       ↓                                                     │
│  7. 输出编译结果                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 组件导入优先级

当存在多个匹配规则时，按以下优先级选择：

```
1. custom 规则（按配置顺序）
2. autoscan 扫描结果
3. 手动 import 的组件
```

### 示例

```typescript
easycom: {
  autoscan: true,
  custom: {
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',      // 优先级 1
    '^custom-(.*)': '@/components/custom/$1/$1.vue',    // 优先级 2
  },
}
```

```
使用 <wd-button>:
  1. 匹配 custom 规则 ^wd-(.*) ✓
  2. 解析为 @/wd/components/wd-button/wd-button.vue

使用 <MyComponent>:
  1. 不匹配 custom 规则
  2. autoscan 查找 src/components/MyComponent/MyComponent.vue ✓
```

## 最佳实践

### 1. 组件命名规范

```
# 自定义组件使用 PascalCase
src/components/
├── AuthModal/AuthModal.vue        # ✅ <AuthModal>
├── UserCard/UserCard.vue          # ✅ <UserCard>
└── my-button/my-button.vue        # ❌ 不推荐

# 第三方组件库保持原有命名
src/wd/components/
├── wd-button/wd-button.vue        # ✅ <wd-button>
└── wd-toast/wd-toast.vue          # ✅ <wd-toast>
```

### 2. 分类组织组件

```typescript
easycom: {
  autoscan: true,
  custom: {
    // UI 组件库
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',

    // 业务组件（按模块分类）
    '^order-(.*)': '@/components/order/$1/$1.vue',
    '^user-(.*)': '@/components/user/$1/$1.vue',
    '^product-(.*)': '@/components/product/$1/$1.vue',
  },
}
```

### 3. 避免命名冲突

```typescript
// 使用不同前缀区分来源
easycom: {
  custom: {
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',     // WD UI
    '^uv-(.*)': '@climblee/uv-ui/components/uv-$1/uv-$1.vue', // uv-ui
    '^biz-(.*)': '@/components/business/$1/$1.vue',    // 业务组件
  },
}
```

### 4. 开发时组件预览

```typescript
// 创建组件预览页面
// pages/dev/components.vue
<template>
  <view class="component-preview">
    <view class="section">
      <text class="title">WD UI 组件</text>
      <wd-button type="primary">Primary</wd-button>
      <wd-button type="success">Success</wd-button>
    </view>

    <view class="section">
      <text class="title">自定义组件</text>
      <AuthModal :visible="false" />
      <Empty description="预览" />
    </view>
  </view>
</template>
```

## 常见问题

### 1. 组件未被识别

**问题原因：**
- easycom 规则配置错误
- 组件文件路径不正确
- 组件命名不符合规范

**解决方案：**

```typescript
// 检查 easycom 配置
easycom: {
  autoscan: true,
  custom: {
    // 确保正则表达式正确
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',  // ✅
    'wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',   // ❌ 缺少 ^
  },
}

// 确保文件结构正确
src/wd/components/
├── wd-button/
│   └── wd-button.vue     # ✅ 目录名和文件名一致
└── wd-toast/
    └── toast.vue         # ❌ 文件名不一致
```

### 2. 类型提示不生效

**问题原因：**
- 未配置 Vite 插件
- 类型声明文件未生成

**解决方案：**

```typescript
// 1. 确保配置了 Vite 插件
import Components from '@uni-helper/vite-plugin-uni-components'

Components({
  dts: 'src/types/components.d.ts',  // 启用类型生成
})

// 2. 确保 tsconfig.json 包含类型文件
{
  "include": [
    "src/**/*.vue",
    "src/types/*.d.ts"  // 确保包含
  ]
}
```

### 3. 开发时组件热更新不生效

**问题原因：**
- 新增组件后未重启服务

**解决方案：**

```bash
# 新增组件后重启开发服务器
pnpm dev:h5
```

### 4. 同名组件冲突

**问题原因：**
- 多个组件库有同名组件
- 自定义组件与库组件同名

**解决方案：**

```typescript
// 使用不同前缀避免冲突
easycom: {
  custom: {
    // WD UI 的 Button
    '^wd-button': '@/wd/components/wd-button/wd-button.vue',
    // 自定义 Button
    '^my-button': '@/components/MyButton/MyButton.vue',
  },
}
```

```vue
<!-- 使用时区分 -->
<wd-button>WD 按钮</wd-button>
<my-button>自定义按钮</my-button>
```

### 5. 按需导入失效

**问题原因：**
- 组件被全局注册

**解决方案：**

```typescript
// 确保使用 easycom 而非全局注册
// ❌ 不推荐：全局注册
app.component('WdButton', WdButton)

// ✅ 推荐：使用 easycom 自动按需导入
easycom: {
  custom: {
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
  },
}
```

