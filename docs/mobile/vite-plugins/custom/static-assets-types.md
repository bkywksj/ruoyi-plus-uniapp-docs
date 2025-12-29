# 静态资源类型生成插件

## 介绍

静态资源类型生成插件（static-assets-types）是项目自研的 Vite 插件，用于自动扫描静态资源目录并生成 TypeScript 类型声明文件。该插件为静态图片资源提供完整的类型安全支持，让开发者在使用图片路径时获得智能提示和编译时检查。

**核心特性：**

- **自动类型生成** - 扫描静态资源目录，自动生成类型声明文件
- **全局类型扩展** - 提供 `StaticImagePath` 全局类型，支持智能提示
- **常量对象导出** - 生成 `STATIC_IMAGES` 常量对象，便于引用
- **工具函数** - 提供 `getStaticImage`、`isValidStaticImage` 等实用函数
- **热更新支持** - 监听静态资源变化，自动重新生成类型文件
- **增量更新** - 内容对比避免不必要的文件写入
- **目录排除** - 支持配置排除特定目录
- **多格式支持** - 支持 PNG、JPG、SVG、WebP 等多种图片格式

## 基本用法

### 插件配置

在 `vite/plugins/index.ts` 中配置插件：

```typescript
import createStaticAssetsTypes from './static-assets-types'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // 静态资源类型生成插件（需要在早期运行）
  vitePlugins.push(
    createStaticAssetsTypes({
      enabled: true,
    }),
  )

  // 其他插件...
  return vitePlugins
}
```

### 生成的类型文件

插件会在 `src/types/static-assets.d.ts` 生成类型声明文件：

```typescript
/**
 * 静态资源类型声明文件
 *
 * 🤖 此文件由 static-assets-types 插件自动生成
 * 📁 扫描目录: src/static
 * 📊 资源数量: 5 个文件
 *
 * ⚠️ 请勿手动修改此文件，所有修改将在下次构建时被覆盖
 */

declare global {
  /** 全局静态图片资源路径类型 */
  type StaticImagePath =
    | '/static/logo.png'
    | '/static/icons/home.png'
    | '/static/icons/user.png'
    | '/static/banners/banner1.jpg'
    | '/static/banners/banner2.jpg'
}

/** 静态图片资源路径常量对象 */
export const STATIC_IMAGES = {
  LOGO: '/static/logo.png' as const,
  HOME: '/static/icons/home.png' as const,
  USER: '/static/icons/user.png' as const,
  BANNER1: '/static/banners/banner1.jpg' as const,
  BANNER2: '/static/banners/banner2.jpg' as const,
} as const
```

### 在组件中使用

```vue
<template>
  <view class="container">
    <!-- 方式1: 直接使用路径（有类型提示） -->
    <image :src="'/static/logo.png'" />

    <!-- 方式2: 使用常量对象 -->
    <image :src="STATIC_IMAGES.LOGO" />

    <!-- 方式3: 使用工具函数 -->
    <image :src="getStaticImage('LOGO')" />

    <!-- 方式4: 动态图片（类型安全） -->
    <image :src="currentImage" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { STATIC_IMAGES, getStaticImage } from '@/types/static-assets.d'

// 类型安全的图片路径
const currentImage = ref<StaticImagePath>('/static/logo.png')

// 切换图片
const changeImage = () => {
  currentImage.value = STATIC_IMAGES.BANNER1
}
</script>
```

## 配置选项

### 完整配置接口

```typescript
interface StaticAssetsTypesOptions {
  /** 静态资源目录，相对于项目根目录 */
  staticDir?: string

  /** 类型文件输出路径，相对于项目根目录 */
  outputPath?: string

  /** 支持的图片扩展名 */
  extensions?: string[]

  /** 路径前缀，用于生成正确的引用路径 */
  pathPrefix?: string

  /** 是否启用（可以根据环境控制） */
  enabled?: boolean

  /** 排除的目录列表，相对于静态资源目录 */
  excludeDirs?: string[]
}
```

### staticDir

- **类型**: `string`
- **默认值**: `'src/static'`
- **说明**: 静态资源目录，相对于项目根目录

```typescript
createStaticAssetsTypes({
  staticDir: 'src/static',  // 默认值
})
```

插件会递归扫描此目录下的所有图片文件。

### outputPath

- **类型**: `string`
- **默认值**: `'src/types/static-assets.d.ts'`
- **说明**: 类型文件输出路径

```typescript
createStaticAssetsTypes({
  outputPath: 'src/types/static-assets.d.ts',  // 默认值
})
```

生成的类型文件会自动创建所需的目录结构。

### extensions

- **类型**: `string[]`
- **默认值**: `['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'avif', 'bmp']`
- **说明**: 支持的图片扩展名

```typescript
createStaticAssetsTypes({
  // 仅处理 PNG 和 SVG 文件
  extensions: ['png', 'svg'],
})
```

### pathPrefix

- **类型**: `string`
- **默认值**: `'/static'`
- **说明**: 生成的路径前缀

```typescript
createStaticAssetsTypes({
  pathPrefix: '/static',  // 默认值
})
```

此配置会影响生成的路径格式：

| 文件位置 | 生成的路径 |
|---------|-----------|
| `src/static/logo.png` | `/static/logo.png` |
| `src/static/icons/home.png` | `/static/icons/home.png` |

### enabled

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用插件

```typescript
createStaticAssetsTypes({
  // 仅在开发环境启用
  enabled: process.env.NODE_ENV === 'development',
})
```

### excludeDirs

- **类型**: `string[]`
- **默认值**: `['app', 'styles']`
- **说明**: 排除的目录列表

```typescript
createStaticAssetsTypes({
  excludeDirs: ['app', 'styles', 'temp', 'backup'],
})
```

被排除的目录及其子目录下的所有文件都不会被扫描。

## 生成的类型文件详解

### 文件结构

生成的类型文件包含以下部分：

```typescript
/**
 * 静态资源类型声明文件
 *
 * 🤖 此文件由 static-assets-types 插件自动生成
 * 📁 扫描目录: src/static
 * 📊 资源数量: 10 个文件
 *
 * ⚠️ 请勿手动修改此文件，所有修改将在下次构建时被覆盖
 */

// ==================== 全局类型扩展 ====================

declare global {
  /** 静态资源相关的全局类型 */
  interface StaticAssets {
    /** 图片资源路径类型 */
    images: StaticImagePath
  }

  /** 全局图片源类型，包含静态资源路径和其他可能的路径 */
  type ImageSrc = StaticImagePath | string

  /** 全局静态图片资源路径类型 */
  type StaticImagePath =
    | '/static/logo.png'
    | '/static/icons/home.png'
    | '/static/icons/user.png'
}

// ==================== 常量定义 ====================

/** 静态图片资源路径常量对象 */
export const STATIC_IMAGES = {
  LOGO: '/static/logo.png' as const,
  HOME: '/static/icons/home.png' as const,
  USER: '/static/icons/user.png' as const,
} as const

/** 静态图片资源的键名类型 */
export type StaticImageKey = keyof typeof STATIC_IMAGES

// ==================== 工具函数 ====================

export const getStaticImage = (key: StaticImageKey): StaticImagePath => { ... }
export const isValidStaticImage = (path: string): path is StaticImagePath => { ... }
export const getAllStaticImages = (): StaticImagePath[] => { ... }
export const searchStaticImages = (fileName: string): StaticImagePath[] => { ... }

export {}
```

### 全局类型

插件会在全局作用域声明以下类型：

| 类型名 | 说明 |
|-------|------|
| `StaticAssets` | 静态资源相关的接口 |
| `ImageSrc` | 图片源类型（`StaticImagePath \| string`） |
| `StaticImagePath` | 静态图片资源路径的联合类型 |

使用全局类型无需导入：

```typescript
// 直接使用全局类型
const imagePath: StaticImagePath = '/static/logo.png'
const imageUrl: ImageSrc = '/static/logo.png'
```

### 常量对象命名规则

文件名会按以下规则转换为常量名：

| 文件名 | 常量名 |
|-------|-------|
| `logo.png` | `LOGO` |
| `home-icon.png` | `HOME_ICON` |
| `user_avatar.jpg` | `USER_AVATAR` |
| `123banner.png` | `_123BANNER` |
| `my.logo.svg` | `MY_LOGO` |

**转换规则：**

1. 移除文件扩展名
2. 非字母数字字符替换为下划线
3. 转换为大写
4. 如果以数字开头，添加下划线前缀

### 工具函数

#### getStaticImage

获取指定键名的静态图片路径：

```typescript
import { getStaticImage } from '@/types/static-assets.d'

// 获取 logo 图片路径
const logoPath = getStaticImage('LOGO')
// 返回: '/static/logo.png'
```

#### isValidStaticImage

检查路径是否为有效的静态图片资源：

```typescript
import { isValidStaticImage } from '@/types/static-assets.d'

const path = '/static/logo.png'

if (isValidStaticImage(path)) {
  // path 类型被收窄为 StaticImagePath
  console.log('有效的静态图片:', path)
}
```

#### getAllStaticImages

获取所有静态图片资源路径：

```typescript
import { getAllStaticImages } from '@/types/static-assets.d'

const allImages = getAllStaticImages()
// 返回: ['/static/logo.png', '/static/icons/home.png', ...]
```

#### searchStaticImages

根据文件名搜索静态图片：

```typescript
import { searchStaticImages } from '@/types/static-assets.d'

// 搜索包含 "banner" 的图片
const banners = searchStaticImages('banner')
// 返回: ['/static/banners/banner1.jpg', '/static/banners/banner2.jpg']
```

## 使用示例

### 基础使用

```vue
<template>
  <view class="page">
    <!-- 使用常量对象 -->
    <image class="logo" :src="STATIC_IMAGES.LOGO" mode="aspectFit" />

    <!-- 图标列表 -->
    <view class="icons">
      <image :src="STATIC_IMAGES.HOME" />
      <image :src="STATIC_IMAGES.USER" />
      <image :src="STATIC_IMAGES.SETTINGS" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { STATIC_IMAGES } from '@/types/static-assets.d'
</script>
```

### 动态图片

```vue
<template>
  <view class="carousel">
    <swiper>
      <swiper-item v-for="(banner, index) in banners" :key="index">
        <image :src="banner" mode="aspectFill" />
      </swiper-item>
    </swiper>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { STATIC_IMAGES } from '@/types/static-assets.d'

// 类型安全的轮播图数组
const banners = ref<StaticImagePath[]>([
  STATIC_IMAGES.BANNER1,
  STATIC_IMAGES.BANNER2,
  STATIC_IMAGES.BANNER3,
])
</script>
```

### 条件渲染

```vue
<template>
  <view class="status">
    <image :src="statusIcon" />
    <text>{{ statusText }}</text>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { STATIC_IMAGES } from '@/types/static-assets.d'

const props = defineProps<{
  status: 'success' | 'error' | 'warning'
}>()

const statusIcon = computed<StaticImagePath>(() => {
  switch (props.status) {
    case 'success':
      return STATIC_IMAGES.ICON_SUCCESS
    case 'error':
      return STATIC_IMAGES.ICON_ERROR
    case 'warning':
      return STATIC_IMAGES.ICON_WARNING
    default:
      return STATIC_IMAGES.ICON_INFO
  }
})

const statusText = computed(() => {
  const texts = {
    success: '操作成功',
    error: '操作失败',
    warning: '请注意',
  }
  return texts[props.status]
})
</script>
```

### 封装图片组件

```vue
<template>
  <image
    :src="resolvedSrc"
    :mode="mode"
    :lazy-load="lazyLoad"
    @error="handleError"
    @load="handleLoad"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { STATIC_IMAGES, isValidStaticImage } from '@/types/static-assets.d'

interface Props {
  /** 图片源（支持静态资源键名、路径或 URL） */
  src: StaticImageKey | StaticImagePath | string
  /** 图片模式 */
  mode?: 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix'
  /** 懒加载 */
  lazyLoad?: boolean
  /** 默认图片 */
  fallback?: StaticImagePath
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'aspectFill',
  lazyLoad: true,
  fallback: '/static/placeholder.png',
})

const emit = defineEmits<{
  error: [event: Event]
  load: [event: Event]
}>()

const hasError = ref(false)

const resolvedSrc = computed(() => {
  if (hasError.value) {
    return props.fallback
  }

  // 如果是静态资源键名
  if (props.src in STATIC_IMAGES) {
    return STATIC_IMAGES[props.src as StaticImageKey]
  }

  // 如果是有效的静态资源路径
  if (isValidStaticImage(props.src)) {
    return props.src
  }

  // 其他情况直接返回
  return props.src
})

const handleError = (event: Event) => {
  hasError.value = true
  emit('error', event)
}

const handleLoad = (event: Event) => {
  emit('load', event)
}
</script>
```

### 搭配 Composable 使用

```typescript
// composables/useStaticImage.ts
import { ref, computed } from 'vue'
import {
  STATIC_IMAGES,
  type StaticImageKey,
  type StaticImagePath,
  getStaticImage,
  isValidStaticImage,
} from '@/types/static-assets.d'

export function useStaticImage(initialKey?: StaticImageKey) {
  const currentKey = ref<StaticImageKey | null>(initialKey || null)

  const currentPath = computed<StaticImagePath | null>(() => {
    if (!currentKey.value) return null
    return getStaticImage(currentKey.value)
  })

  const setImage = (key: StaticImageKey) => {
    currentKey.value = key
  }

  const setImageByPath = (path: string) => {
    if (isValidStaticImage(path)) {
      // 反向查找键名
      const entry = Object.entries(STATIC_IMAGES).find(([_, value]) => value === path)
      if (entry) {
        currentKey.value = entry[0] as StaticImageKey
      }
    }
  }

  return {
    currentKey,
    currentPath,
    setImage,
    setImageByPath,
    STATIC_IMAGES,
  }
}
```

## 热更新机制

### 工作原理

插件会监听静态资源目录下的文件变化：

```
┌─────────────────────────────────────────────────────────┐
│                     热更新流程                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  文件变化（添加/删除/重命名）                              │
│       ↓                                                 │
│  检查是否在静态资源目录内                                  │
│       ↓                                                 │
│  检查扩展名是否在支持列表中                                │
│       ↓                                                 │
│  重新扫描目录，生成新的类型内容                            │
│       ↓                                                 │
│  对比现有文件内容                                         │
│       ↓                                                 │
│  内容变化？ ──否──> 跳过写入                              │
│       │                                                 │
│       是                                                │
│       ↓                                                 │
│  写入新的类型文件                                         │
│       ↓                                                 │
│  Vite 触发热更新                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 控制台输出

```
🔄 检测到静态资源变化: src/static/icons/new-icon.png
✨ 静态资源类型已生成: src/types/static-assets.d.ts (11 个文件)
```

### 避免热更新循环

插件在写入文件前会对比内容，只有当内容真正发生变化时才会写入：

```typescript
// 对比现有文件内容，避免不必要的写入触发热更新循环
if (existsSync(outputFilePath)) {
  const existingContent = readFileSync(outputFilePath, 'utf-8')
  if (existingContent === typeContent) {
    // 内容相同，跳过写入
    return
  }
}
```

## API

### 插件导出

```typescript
import createStaticAssetsTypes from './static-assets-types'

const plugin = createStaticAssetsTypes(options?: StaticAssetsTypesOptions): Plugin
```

### StaticAssetsTypesOptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| staticDir | 静态资源目录 | `string` | `'src/static'` |
| outputPath | 类型文件输出路径 | `string` | `'src/types/static-assets.d.ts'` |
| extensions | 支持的图片扩展名 | `string[]` | `['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'avif', 'bmp']` |
| pathPrefix | 路径前缀 | `string` | `'/static'` |
| enabled | 是否启用 | `boolean` | `true` |
| excludeDirs | 排除的目录 | `string[]` | `['app', 'styles']` |

### 生成的导出

| 导出项 | 类型 | 说明 |
|-------|------|------|
| `STATIC_IMAGES` | `const object` | 静态图片资源路径常量对象 |
| `StaticImageKey` | `type` | 常量对象的键名类型 |
| `getStaticImage` | `function` | 获取静态图片路径 |
| `isValidStaticImage` | `function` | 检查路径是否有效 |
| `getAllStaticImages` | `function` | 获取所有静态图片路径 |
| `searchStaticImages` | `function` | 搜索静态图片 |

### 全局类型

| 类型名 | 说明 |
|-------|------|
| `StaticAssets` | 静态资源接口 |
| `ImageSrc` | 图片源类型（`StaticImagePath \| string`） |
| `StaticImagePath` | 静态图片资源路径联合类型 |

## 最佳实践

### 1. 合理组织静态资源目录

```
src/static/
├── logo.png              # 应用 logo
├── icons/                # 图标目录
│   ├── home.png
│   ├── user.png
│   └── settings.png
├── banners/              # 轮播图目录
│   ├── banner1.jpg
│   └── banner2.jpg
├── placeholders/         # 占位图目录
│   ├── avatar.png
│   └── image.png
└── backgrounds/          # 背景图目录
    ├── login-bg.jpg
    └── home-bg.jpg
```

### 2. 排除不需要的目录

```typescript
createStaticAssetsTypes({
  excludeDirs: [
    'app',      // App 原生资源
    'styles',   // 样式相关资源
    'temp',     // 临时文件
    'raw',      // 原始素材
  ],
})
```

### 3. 使用常量而非字符串

```typescript
// ✅ 推荐：使用常量
<image :src="STATIC_IMAGES.LOGO" />

// ❌ 不推荐：硬编码路径
<image src="/static/logo.png" />
```

使用常量的好处：
- 编译时检查，避免路径拼写错误
- 重命名文件后，编译器会提示错误
- IDE 智能提示和跳转

### 4. 类型安全的图片属性

```typescript
interface ComponentProps {
  // ✅ 使用 StaticImagePath 类型
  icon: StaticImagePath

  // ✅ 使用 ImageSrc 允许更多类型
  image: ImageSrc

  // ✅ 使用 StaticImageKey 作为键名
  iconKey: StaticImageKey
}
```

### 5. 配合 Git 使用

将生成的类型文件纳入版本控制：

```txt
# 不要忽略这个文件，应该提交到仓库
# src/types/static-assets.d.ts
```

这样可以确保：
- CI/CD 环境不需要额外生成
- 团队成员拉取代码后立即可用
- 类型变更可以在 PR 中审查

## 常见问题

### 1. 类型文件未生成

**问题原因：**
- 插件未正确配置
- 静态资源目录不存在
- 插件被禁用

**解决方案：**

```typescript
// 确保插件正确配置
createStaticAssetsTypes({
  staticDir: 'src/static',  // 确保目录存在
  enabled: true,            // 确保启用
})
```

检查目录是否存在：

```bash
ls src/static
```

### 2. 新增图片后没有类型提示

**问题原因：**
- 热更新未触发
- 文件扩展名不在支持列表中
- 文件在排除目录中

**解决方案：**

```typescript
// 添加需要的扩展名
createStaticAssetsTypes({
  extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'avif', 'bmp', 'tiff'],
})

// 检查排除目录配置
createStaticAssetsTypes({
  excludeDirs: ['app', 'styles'],  // 确保新图片不在这些目录
})
```

手动重启开发服务器：

```bash
pnpm dev:h5
```

### 3. 常量名重复

**问题原因：**
- 不同目录下存在同名文件

例如：
- `src/static/icons/logo.png` → `LOGO`
- `src/static/banners/logo.png` → `LOGO`（冲突）

**解决方案：**

重命名文件以避免冲突：

```
src/static/
├── icons/
│   └── icon-logo.png     # 改为 ICON_LOGO
└── banners/
    └── banner-logo.png   # 改为 BANNER_LOGO
```

### 4. 路径前缀不正确

**问题原因：**
- `pathPrefix` 配置与实际部署路径不匹配

**解决方案：**

```typescript
// 根据实际部署情况配置
createStaticAssetsTypes({
  staticDir: 'src/static',
  pathPrefix: '/static',  // 确保与实际访问路径一致
})
```

### 5. 热更新循环

**问题原因：**
- 类型文件被其他工具修改
- 文件系统时间戳问题

**解决方案：**

插件已内置防循环机制，如果仍有问题：

1. 删除生成的类型文件
2. 重启开发服务器
3. 检查是否有其他工具在修改该文件

```bash
rm src/types/static-assets.d.ts
pnpm dev:h5
```

### 6. TypeScript 找不到全局类型

**问题原因：**
- `tsconfig.json` 未包含类型文件

**解决方案：**

确保 `tsconfig.json` 包含类型文件目录：

```json
{
  "compilerOptions": {
    "types": ["./src/types/static-assets.d"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.vue"
  ]
}
```

或者在入口文件中引用：

```typescript
// src/main.ts
/// <reference path="./types/static-assets.d.ts" />
```
