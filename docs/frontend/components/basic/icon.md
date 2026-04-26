# Icon 图标组件

## 介绍

Icon 图标组件是 RuoYi-Plus 前端框架中的核心 UI 组件,提供统一的图标展示能力。该组件整合了 Iconfont 字体图标、Iconify SVG 图标与本地 SVG sprite 三种图标源,支持类型安全的图标代码、灵活的尺寸设置、自定义颜色以及丰富的动画效果。

**核心特性:**

- **三种图标源** - 同时支持 Iconfont 字体图标、Iconify SVG 图标(共计 800+ 预设图标)和本地 SVG sprite(放置 `.svg` 文件即可使用),覆盖通用图标、海量图标集与品牌 logo 三类场景
- **优先级匹配** - 同一个 `code` 按 `iconfont > iconify > svg sprite` 顺序匹配,可通过 `value="i-xxx"` 强制走 iconify
- **类型安全** - 通过自动生成的 TypeScript 类型定义,提供完整的图标代码智能提示和类型检查(包含 `isSvgIcon()` 判定)
- **灵活尺寸** - 支持预设尺寸(xs/sm/md/lg/xl/2xl)、数字像素值和自定义 CSS 尺寸
- **动画效果** - 内置 6 种悬停动画效果,包括抖动、旋转、移动、缩放和呼吸等
- **自动识别** - 组件自动识别图标类型,无需手动指定使用 Iconfont、Iconify 还是 SVG sprite
- **图标选择器** - 提供可视化的图标选择组件,支持搜索过滤和实时预览

## 基本用法

### 使用图标代码

最常用的方式是通过 `code` 属性指定图标代码,组件会自动识别图标类型并正确渲染:

```vue
<template>
  <div class="demo">
    <!-- 使用 iconfont 图标 -->
    <Icon code="user" />
    <Icon code="search" />
    <Icon code="settings" />

    <!-- 使用 iconify 预设图标 -->
    <Icon code="button" />
    <Icon code="input" />
    <Icon code="select" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**使用说明:**

- `code` 属性接受 `IconCode` 类型,包含所有预设图标的代码
- 组件首先检查图标是否存在于 Iconfont 图标库中
- 如果不在 Iconfont 中,则尝试从 Iconify 预设图标中查找
- 输入时会获得完整的 TypeScript 智能提示

### 使用完整图标值

对于非预设图标或自定义图标,可以使用 `value` 属性直接指定完整的图标类名:

```vue
<template>
  <div class="demo">
    <!-- Iconify 格式的图标值 -->
    <Icon value="i-carbon-user" />
    <Icon value="i-mdi-home" />
    <Icon value="i-tabler-settings" />

    <!-- 自定义 CSS 类 -->
    <Icon value="custom-icon my-icon" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**技术实现:**

- 以 `i-` 开头的值被识别为 Iconify 图标格式
- 其他值作为普通 CSS 类名处理
- `value` 属性的优先级高于 `code` 属性

### 使用本地 SVG sprite

将任意 `.svg` 文件放入 `src/assets/icons/svg/` 目录,文件名即图标 `code`,无需任何额外注册即可在 `<Icon />` 中使用,适合 iconfont 找不到的品牌 logo 与单色自定义图标:

```vue
<template>
  <div class="demo">
    <!-- 对应 src/assets/icons/svg/dingtalk.svg -->
    <Icon code="dingtalk" color="#0089FF" size="lg" />

    <!-- 对应 src/assets/icons/svg/maxkey.svg -->
    <Icon code="maxkey" :size="32" />

    <!-- 通过 currentColor 继承父元素颜色 -->
    <Icon code="topiam" color="currentColor" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**使用说明:**

- 直接把 `xxx.svg` 放到 `src/assets/icons/svg/` 根目录,文件名(去掉扩展名)即 `code`
- 构建时由 `vite-plugin-svg-icons-ng` 自动合并为 SVG sprite,运行时通过 `<use xlink:href="#icon-xxx">` 引用
- SVG 源文件内必须使用 `fill="currentColor"` 或 `stroke="currentColor"`,组件会自动把 `color` 属性映射到 `currentColor` 实现变色
- 优先级低于 iconfont 与 iconify,如需强制使用 sprite 须确保 `code` 不在前两者中存在
- HMR 监听 svg 目录变化,新增/修改 SVG 文件自动重建类型,免重启
- 内置三个示例品牌 logo:`dingtalk`(钉钉)、`maxkey`(MaxKey)、`topiam`(TopIAM)

### 图标尺寸

Icon 组件提供多种方式设置图标尺寸:

```vue
<template>
  <div class="demo">
    <!-- 预设尺寸 -->
    <Icon code="search" size="xs" />  <!-- 12px -->
    <Icon code="search" size="sm" />  <!-- 16px -->
    <Icon code="search" size="md" />  <!-- 20px -->
    <Icon code="search" size="lg" />  <!-- 24px -->
    <Icon code="search" size="xl" />  <!-- 32px -->
    <Icon code="search" size="2xl" /> <!-- 40px -->

    <!-- 数字尺寸(单位: px) -->
    <Icon code="search" :size="18" />
    <Icon code="search" :size="28" />

    <!-- 字符串尺寸 -->
    <Icon code="search" size="1.5rem" />
    <Icon code="search" size="2em" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**尺寸预设映射:**

| 预设值 | 像素大小 | Tailwind CSS 类 |
|--------|----------|-----------------|
| `xs` | 12px | `w-3 h-3` |
| `sm` | 16px | `w-4 h-4` |
| `md` | 20px | `w-5 h-5` |
| `lg` | 24px | `w-6 h-6` |
| `xl` | 32px | `w-8 h-8` |
| `2xl` | 40px | `w-10 h-10` |

**技术说明:**

- Iconfont 图标通过 `font-size` 控制尺寸
- Iconify 图标通过 `width/height` 控制尺寸
- 预设尺寸对 Iconify 图标使用 Tailwind CSS 类,对 Iconfont 图标使用内联样式

### 图标颜色

通过 `color` 属性自定义图标颜色:

```vue
<template>
  <div class="demo">
    <!-- 颜色名称 -->
    <Icon code="star" color="red" />
    <Icon code="star" color="blue" />
    <Icon code="star" color="green" />

    <!-- 十六进制颜色 -->
    <Icon code="heart" color="#ff6b6b" />
    <Icon code="heart" color="#4ecdc4" />

    <!-- RGB/RGBA 颜色 -->
    <Icon code="bell" color="rgb(102, 126, 234)" />
    <Icon code="bell" color="rgba(102, 126, 234, 0.8)" />

    <!-- CSS 变量 -->
    <Icon code="check" color="var(--el-color-primary)" />
    <Icon code="check" color="var(--el-color-success)" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**使用说明:**

- 支持所有有效的 CSS 颜色值
- 通过内联样式的 `color` 属性实现
- 不设置时继承父元素颜色

### 动画效果

Icon 组件内置 6 种悬停动画效果:

```vue
<template>
  <div class="demo">
    <!-- 抖动效果 -->
    <Icon code="notification" animate="shake" />

    <!-- 旋转 180 度 -->
    <Icon code="refresh" animate="rotate180" />

    <!-- 向上移动 -->
    <Icon code="arrow-up" animate="moveUp" />

    <!-- 放大效果 -->
    <Icon code="fullscreen" animate="expand" />

    <!-- 缩小效果 -->
    <Icon code="fullscreen-exit" animate="shrink" />

    <!-- 呼吸效果 -->
    <Icon code="heart" animate="breathing" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**动画类型说明:**

| 动画类型 | 效果描述 | 适用场景 |
|----------|----------|----------|
| `shake` | 水平抖动 | 通知、警告提示 |
| `rotate180` | 旋转 180 度 | 刷新、加载状态 |
| `moveUp` | 向上移动 | 箭头、导航指示 |
| `expand` | 放大 | 全屏、展开操作 |
| `shrink` | 缩小 | 退出全屏、收起 |
| `breathing` | 透明度呼吸 | 关注、重要提示 |

## 图标选择器

### 基本使用

IconSelect 组件提供可视化的图标选择功能:

```vue
<template>
  <div class="demo">
    <IconSelect v-model="selectedIcon" width="300px" />

    <div class="mt-4">
      当前选中: <Icon :code="selectedIcon as IconCode" /> {{ selectedIcon }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'
import Icon from '@/components/Icon/Icon.vue'

const selectedIcon = ref('user')
</script>
```

**功能特性:**

- 支持关键词搜索(图标代码和名称)
- 实时预览悬停图标信息
- 显示图标总数统计
- 高亮显示当前选中图标

### 表单集成

在表单中使用图标选择器:

```vue
<template>
  <el-form :model="formData" label-width="100px">
    <el-form-item label="菜单图标">
      <IconSelect v-model="formData.icon" width="100%" />
    </el-form-item>

    <el-form-item label="预览">
      <Icon :code="formData.icon as IconCode" size="lg" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'
import Icon from '@/components/Icon/Icon.vue'

const formData = reactive({
  icon: 'menu'
})
</script>
```

### 自定义宽度

```vue
<template>
  <div class="demo">
    <!-- 固定宽度 -->
    <IconSelect v-model="icon1" width="200px" />

    <!-- 百分比宽度 -->
    <IconSelect v-model="icon2" width="100%" />

    <!-- 默认宽度 400px -->
    <IconSelect v-model="icon3" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const icon1 = ref('user')
const icon2 = ref('search')
const icon3 = ref('settings')
</script>
```

## 图标类型系统

### 类型定义

项目通过自动化插件生成完整的图标类型定义:

```typescript
/**
 * 图标代码类型
 * 包含所有可用的图标代码
 */
declare global {
  type IconCode =
    | 'account'
    | 'activity'
    | 'add'
    | 'admin'
    | 'alarm'
    // ... 共 817 个图标
}

/**
 * 图标项接口
 */
interface IconItem {
  /** 图标代码 */
  code: string
  /** 图标名称 */
  name: string
  /** 图标类型 */
  type: 'iconfont' | 'iconify' | 'svg'
  /** Iconify 图标的完整值,svg 类型则为 sprite symbolId(`icon-[name]`) */
  value?: string
}
```

### 工具函数

图标系统提供一系列工具函数:

```typescript
import {
  isIconfontIcon,
  isIconifyIcon,
  isSvgIcon,
  getIconifyValue,
  getIconName,
  searchIcons,
  ALL_ICONS,
  ICONFONT_ICONS,
  ICONIFY_ICONS,
  SVG_ICONS
} from '@/types/icons.d'

// 检查是否为 Iconfont 图标
const isFont = isIconfontIcon('user')      // true

// 检查是否为 Iconify 图标
const isIconify = isIconifyIcon('button')  // true

// 检查是否为本地 SVG sprite 图标
const isSvg = isSvgIcon('dingtalk')        // true

// 获取 Iconify 图标的完整值
const value = getIconifyValue('button')    // 'i-fluent:button-16-regular'

// 获取图标名称
const name = getIconName('user')           // '用户'

// 搜索图标
const results = searchIcons('user')        // 返回匹配的图标数组

// 访问图标列表(数量随项目实际资源动态变化)
console.log(ALL_ICONS.length)
console.log(ICONFONT_ICONS.length)
console.log(ICONIFY_ICONS.length)
console.log(SVG_ICONS.length)              // 本地 svg/ 目录扫描得到
```

### 使用类型检查

```vue
<template>
  <div class="demo">
    <!-- 类型安全的图标代码 -->
    <Icon :code="iconCode" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Icon from '@/components/Icon/Icon.vue'

// 使用 IconCode 类型确保类型安全
const iconCode = ref<IconCode>('user')

// 类型错误示例(TypeScript 会报错)
// const wrongCode: IconCode = 'not-exist-icon'

// 动态设置图标
const setIcon = (code: IconCode) => {
  iconCode.value = code
}
</script>
```

## 图标库分类

### Iconfont 图标 (644个)

Iconfont 图标来自阿里巴巴图标库,涵盖以下分类:

**用户与账户:**
- `user`, `admin`, `account`, `avatar`, `profile`
- `login`, `logout`, `register`, `password`

**导航与菜单:**
- `menu`, `home`, `back`, `forward`, `arrow-up`, `arrow-down`
- `breadcrumb`, `sidebar`, `navbar`, `tabs`

**操作与编辑:**
- `add`, `delete`, `edit`, `save`, `cancel`
- `copy`, `paste`, `cut`, `undo`, `redo`
- `search`, `filter`, `sort`, `refresh`

**状态与反馈:**
- `success`, `warning`, `error`, `info`
- `loading`, `complete`, `pending`

**文件与文档:**
- `file`, `folder`, `document`, `image`, `video`, `audio`
- `upload`, `download`, `export`, `import`

**系统与设置:**
- `settings`, `config`, `system`, `monitor`
- `database`, `server`, `api`, `code`

### Iconify 图标 (173个)

Iconify 预设图标来自多个知名图标库:

**Fluent UI 图标:**
```typescript
// 表单组件图标
'button'      // i-fluent:button-16-regular
'input'       // i-fluent:textbox-16-regular
'select'      // i-fluent:options-16-regular
'checkbox'    // i-fluent:checkbox-checked-16-regular
'radio'       // i-fluent:radio-button-16-regular
```

**Ionicons 图标:**
```typescript
// 状态图标
'success'     // i-ion:checkmark-circle
'warning'     // i-ion:warning
'error'       // i-ion:close-circle
'info'        // i-ion:information-circle
```

**Material Design 图标:**
```typescript
// 文件类型图标
'file-pdf'    // i-mdi:file-pdf-box
'file-word'   // i-mdi:file-word-box
'file-excel'  // i-mdi:file-excel-box
'file-image'  // i-mdi:file-image
```

**Tabler 图标:**
```typescript
// 社交媒体图标
'github'      // i-tabler:brand-github
'twitter'     // i-tabler:brand-twitter
'wechat'      // i-tabler:brand-wechat
```

**Phosphor 图标:**
```typescript
// 业务模块图标
'dashboard'   // i-ph:chart-line
'user-list'   // i-ph:users-three
'settings'    // i-ph:gear
```

## API

### Icon Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| code | 图标代码,用于标识图标 | `IconCode` | - |
| value | 完整图标类名,用于 Iconify 或自定义类 | `string` | - |
| size | 图标尺寸 | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| string \| number` | `'1.3em'` |
| color | 图标颜色 | `string` | - |
| animate | 动画效果类型 | `'shake' \| 'rotate180' \| 'moveUp' \| 'expand' \| 'shrink' \| 'breathing'` | - |

### IconSelect Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 当前选中的图标代码 | `string` | `''` |
| width | 组件宽度 | `string` | `'400px'` |

### IconSelect Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中图标变化时触发 | `(value: string) => void` |

### 类型定义

```typescript
/**
 * 尺寸预设类型
 */
type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * 动画类型
 */
type AnimateType =
  | 'shake'
  | 'rotate180'
  | 'moveUp'
  | 'expand'
  | 'shrink'
  | 'breathing'

/**
 * Icon 组件属性接口
 */
interface IconProps {
  /** 图标值,可以是完整的图标类名 */
  value?: string
  /** 图标代码 */
  code?: IconCode
  /** 图标大小 */
  size?: SizePreset | string | number
  /** 图标颜色 */
  color?: string
  /** 动画效果 */
  animate?: AnimateType
}

/**
 * IconSelect 组件属性接口
 */
interface IconSelectProps {
  /** 当前选中的图标代码 */
  modelValue: string
  /** 组件宽度 */
  width?: string
}

/**
 * 图标项接口
 */
interface IconItem {
  /** 图标代码 */
  code: string
  /** 图标名称 */
  name: string
  /** 图标类型 */
  type: 'iconfont' | 'iconify'
  /** Iconify 图标的完整值 */
  value?: string
}
```

### 工具函数

```typescript
/**
 * 检查是否为 Iconfont 图标
 * @param code 图标代码
 * @returns 是否为 Iconfont 图标
 */
function isIconfontIcon(code: string): boolean

/**
 * 检查是否为 Iconify 预设图标
 * @param code 图标代码
 * @returns 是否为 Iconify 图标
 */
function isIconifyIcon(code: string): boolean

/**
 * 检查是否为本地 SVG sprite 图标
 * @param code 图标代码(对应 src/assets/icons/svg/<code>.svg 文件名)
 * @returns 是否为本地 SVG 图标
 */
function isSvgIcon(code: string): boolean

/**
 * 获取 Iconify 图标的完整值
 * @param code 图标代码
 * @returns Iconify 图标值,如 'i-fluent:button-16-regular'
 */
function getIconifyValue(code: string): string | undefined

/**
 * 获取图标名称
 * @param code 图标代码
 * @returns 图标名称
 */
function getIconName(code: string): string

/**
 * 搜索图标
 * @param query 搜索关键词
 * @returns 匹配的图标数组
 */
function searchIcons(query: string): IconItem[]

/**
 * 图标列表常量
 */
const ALL_ICONS: IconItem[]       // 所有图标(三种来源合并)
const ICONFONT_ICONS: IconItem[]  // Iconfont 图标
const ICONIFY_ICONS: IconItem[]   // Iconify 图标
const SVG_ICONS: IconItem[]       // 本地 SVG sprite 图标(扫描 src/assets/icons/svg/*.svg)
```

## 自动化类型生成

### Vite 插件配置

项目使用两个协同的 Vite 插件:

1. **`createSvgIcon`** - 基于 `vite-plugin-svg-icons-ng`,扫描 `src/assets/icons/svg/*.svg` 并合并为 SVG sprite,运行时通过 `<use xlink:href="#icon-xxx">` 引用,sprite 注入位置 `body-first` 避免被 App 挂载前的空 DOM 覆盖
2. **`createIconfontTypes`** - 自定义插件,扫描三个图标资源目录并自动生成 TypeScript 类型定义,包含 `SVG_ICONS` 列表与 `isSvgIcon()` 类型守卫

```typescript
// vite/plugins/svg-icon.ts
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng'
import path from 'node:path'

export default () => {
  return createSvgIconsPlugin({
    // 仅扫描 svg/ 根目录,避免误收 custom/iconify 等图标的残留 svg
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/svg')],
    // symbolId 规则:去掉 [dir],只用文件名(与移动端 SOCIAL_CONFIGS 的 icon 字段对齐)
    symbolId: 'icon-[name]',
    // 注入到 body 之前,避免被 App 挂载前的空 DOM 覆盖
    inject: 'body-first'
  })
}
```

```typescript
// vite/plugins/iconfont-types.ts
import { Plugin } from 'vite'

export function createIconfontTypes(): Plugin {
  return {
    name: 'vite-plugin-iconfont-types',

    buildStart() {
      // 扫描 src/assets/icons 三个目录:system / iconify / svg
      // 解析 iconfont.json、preset.json 与 svg/*.svg 文件名
      // 生成 src/types/icons.d.ts(含 SVG_ICONS、isSvgIcon)
    },

    handleHotUpdate({ file }) {
      // 监听图标资源变化,新增/删除/修改 .svg 自动重建类型
      if (file.includes('assets/icons')) {
        this.buildStart()
      }
    }
  }
}
```

### 图标资源结构

```
src/assets/icons/
├── system/                    # Iconfont 系统图标
│   ├── iconfont.json         # 图标数据(从 iconfont.cn 导出)
│   ├── iconfont.css          # 图标样式
│   ├── iconfont.ttf          # 字体文件
│   ├── iconfont.woff         # 字体文件
│   └── iconfont.woff2        # 字体文件
├── iconify/                   # Iconify 预设图标
│   └── preset.json           # 预设图标配置
└── svg/                       # 本地静态 SVG 源
    ├── README.md             # 使用说明
    ├── dingtalk.svg          # 钉钉 logo 示例
    ├── maxkey.svg            # MaxKey logo 示例
    └── topiam.svg            # TopIAM logo 示例
```

### 添加新图标

**添加 Iconfont 图标:**

1. 在 iconfont.cn 项目中添加图标
2. 下载项目到 `src/assets/icons/system/`
3. 运行 `pnpm dev` 自动生成类型

**添加 Iconify 图标:**

1. 编辑 `src/assets/icons/iconify/preset.json`
2. 添加新图标配置:

```json
{
  "icons": [
    {
      "code": "my-icon",
      "name": "我的图标",
      "value": "i-carbon:my-icon"
    }
  ]
}
```

3. 运行 `pnpm dev` 自动生成类型

**添加本地 SVG sprite 图标:**

1. 把 `xxx.svg` 文件放到 `src/assets/icons/svg/` 根目录(子目录中的 SVG 不会被收集,避免误收 iconfont/iconify 残留 svg)
2. 文件名即 `code`,例如 `feishu.svg` → `<Icon code="feishu" />`
3. SVG 内使用 `fill="currentColor"` 或 `stroke="currentColor"` 才能响应 `color` 属性变色
4. HMR 自动监听新增/修改,无需重启 dev server,类型也会同步刷新

## 主题定制

### CSS 变量

图标组件使用项目主题 CSS 变量:

```scss
// 主要颜色
--el-color-primary: #409eff;
--el-color-success: #67c23a;
--el-color-warning: #e6a23c;
--el-color-danger: #f56c6c;
--el-color-info: #909399;

// 图标选择器样式
--el-color-primary-light-9: #ecf5ff;
```

### 自定义动画

可以通过 CSS 自定义图标动画:

```scss
// 自定义抖动动画
.icon-hover-shake:hover {
  animation: icon-shake 0.5s ease-in-out;
}

@keyframes icon-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

// 自定义旋转动画
.icon-hover-rotate180:hover {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

// 自定义呼吸动画
.icon-hover-breathing:hover {
  animation: icon-breathing 1s ease-in-out infinite;
}

@keyframes icon-breathing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 暗黑模式适配

图标选择器支持暗黑模式:

```scss
// 暗黑模式样式
.dark {
  .icon-info-bar {
    background-color: #2a2a2a;
  }

  .icon-item-class {
    border-color: #3a3a3a;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}
```

## 最佳实践

### 1. 优先使用 code 属性

```vue
<!-- ✅ 推荐: 使用 code 属性,获得类型检查 -->
<Icon code="user" />
<Icon code="search" />

<!-- ❌ 不推荐: 使用 value 属性,失去类型检查 -->
<Icon value="iconfont icon-user" />
```

### 2. 使用预设尺寸保持一致性

```vue
<!-- ✅ 推荐: 使用预设尺寸 -->
<Icon code="user" size="sm" />
<Icon code="user" size="md" />
<Icon code="user" size="lg" />

<!-- ❌ 不推荐: 随意的数字尺寸 -->
<Icon code="user" :size="17" />
<Icon code="user" :size="23" />
```

### 3. 利用动画增强交互体验

```vue
<template>
  <div class="actions">
    <!-- 刷新按钮使用旋转动画 -->
    <el-button @click="refresh">
      <Icon code="refresh" animate="rotate180" />
      刷新
    </el-button>

    <!-- 通知按钮使用抖动动画 -->
    <el-button @click="notify">
      <Icon code="notification" animate="shake" />
      通知
    </el-button>
  </div>
</template>
```

### 4. 结合 CSS 变量设置主题色

```vue
<template>
  <div class="status-icons">
    <Icon code="check" color="var(--el-color-success)" />
    <Icon code="warning" color="var(--el-color-warning)" />
    <Icon code="close" color="var(--el-color-danger)" />
    <Icon code="info" color="var(--el-color-info)" />
  </div>
</template>
```

### 5. 在表单中使用图标选择器

```vue
<template>
  <el-form :model="form" :rules="rules">
    <el-form-item label="菜单图标" prop="icon">
      <IconSelect v-model="form.icon" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  icon: ''
})

const rules = {
  icon: [
    { required: true, message: '请选择菜单图标', trigger: 'change' }
  ]
}
</script>
```

## 常见问题

### 1. 图标不显示

**问题原因:**

- 图标代码拼写错误
- 图标资源文件未正确加载
- CSS 样式被覆盖

**解决方案:**

```vue
<template>
  <!-- 1. 检查图标代码是否正确 -->
  <Icon code="user" />  <!-- ✅ 正确 -->
  <Icon code="User" />  <!-- ❌ 大小写错误 -->

  <!-- 2. 使用工具函数检查图标是否存在 -->
  <div v-if="iconExists">
    <Icon :code="iconCode" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { isIconfontIcon, isIconifyIcon } from '@/types/icons.d'

const iconCode = 'user'
const iconExists = computed(() => {
  return isIconfontIcon(iconCode) || isIconifyIcon(iconCode)
})
</script>
```

### 2. 图标尺寸不生效

**问题原因:**

- 父元素设置了 `font-size` 覆盖了图标尺寸
- 使用了无效的尺寸值

**解决方案:**

```vue
<template>
  <!-- 1. 使用数字或带单位的尺寸 -->
  <Icon code="user" :size="24" />     <!-- ✅ 24px -->
  <Icon code="user" size="24px" />    <!-- ✅ 24px -->
  <Icon code="user" size="24" />      <!-- ❌ 无效,被当作字符串 -->

  <!-- 2. 确保父元素不干扰 -->
  <div style="font-size: inherit;">
    <Icon code="user" size="lg" />
  </div>
</template>
```

### 3. 图标颜色不生效

**问题原因:**

- SVG 图标使用了 `fill` 而非 `color`
- 图标内部样式优先级更高

**解决方案:**

```vue
<template>
  <!-- Icon 组件已处理此问题,直接使用 color 属性 -->
  <Icon code="user" color="red" />
</template>

<style>
/* 如果仍有问题,可添加以下样式 */
.iconfont {
  color: inherit !important;
}

/* Iconify 图标使用 fill */
[class*="i-"] {
  fill: currentColor !important;
}
</style>
```

### 4. 图标选择器弹窗位置异常

**问题原因:**

- 父容器设置了 `overflow: hidden`
- 弹窗被裁剪

**解决方案:**

```vue
<template>
  <!-- 确保父容器允许溢出 -->
  <div style="overflow: visible;">
    <IconSelect v-model="icon" />
  </div>
</template>

<style>
/* 或使用 Teleport 将弹窗挂载到 body */
.el-popover {
  z-index: 2000;
}
</style>
```

### 5. TypeScript 类型错误

**问题原因:**

- `IconCode` 类型未正确导入
- 类型定义文件未生成

**解决方案:**

```typescript
// 1. 确保类型文件已生成
// 运行 pnpm dev 会自动生成 src/types/icons.d.ts

// 2. 正确使用类型
import type { IconCode } from '@/types/icons.d'

const icon = ref<IconCode>('user')

// 3. 如果使用动态值,进行类型断言
const dynamicIcon = 'user' as IconCode
```

### 6. 自定义图标不生效

**问题原因:**

- 图标未添加到预设文件
- 类型未重新生成

**解决方案:**

1. 添加图标到 `src/assets/icons/iconify/preset.json`:

```json
{
  "icons": [
    {
      "code": "custom",
      "name": "自定义图标",
      "value": "i-carbon:custom"
    }
  ]
}
```

2. 重启开发服务器或重新构建:

```bash
pnpm dev
# 或
pnpm build
```

3. 使用新图标:

```vue
<Icon code="custom" />
```

## 性能优化

### 按需加载 Iconify 图标

项目通过 UnoCSS 实现 Iconify 图标的按需加载:

```typescript
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
```

### 图标字体预加载

```html
<!-- index.html -->
<link rel="preload" href="/fonts/iconfont.woff2" as="font" type="font/woff2" crossorigin>
```

### 减少图标数量

对于大型项目,可以精简不需要的图标:

1. 移除未使用的 Iconfont 图标
2. 减少 Iconify 预设图标
3. 使用构建分析工具检查图标使用情况

## 迁移指南

### 从旧版 SvgIcon 迁移

如果项目之前使用的是 `SvgIcon` 组件,可以按以下步骤迁移:

```vue
<!-- 旧版写法 -->
<SvgIcon icon-class="user" />
<SvgIcon icon-class="search" class-name="custom" />

<!-- 新版写法 -->
<Icon code="user" />
<Icon code="search" class="custom" />
```

**迁移对照表:**

| 旧属性 | 新属性 | 说明 |
|--------|--------|------|
| `icon-class` | `code` | 图标代码 |
| `class-name` | `class` | 自定义类名 |
| - | `value` | 完整图标值 |
| - | `size` | 尺寸设置 |
| - | `color` | 颜色设置 |
| - | `animate` | 动画效果 |

### 批量替换脚本

```javascript
// scripts/migrate-icons.js
const fs = require('fs')
const glob = require('glob')

const files = glob.sync('src/**/*.vue')

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8')

  // 替换组件名
  content = content.replace(/<SvgIcon/g, '<Icon')
  content = content.replace(/<\/SvgIcon>/g, '</Icon>')

  // 替换属性
  content = content.replace(/icon-class=/g, 'code=')
  content = content.replace(/class-name=/g, 'class=')

  fs.writeFileSync(file, content)
})

console.log('Migration completed!')
```

## 总结

Icon 图标组件是 RuoYi-Plus 前端框架的核心 UI 组件,提供了强大而灵活的图标展示能力:

1. **统一的图标体系** - 整合 Iconfont 和 Iconify 两大图标库
2. **类型安全** - 完整的 TypeScript 类型支持
3. **丰富的功能** - 支持尺寸、颜色、动画等多种配置
4. **开发友好** - 提供图标选择器和工具函数
5. **自动化** - 通过 Vite 插件自动生成类型定义

合理使用 Icon 组件可以大大提升开发效率和用户体验,建议在项目中统一使用此组件来管理所有图标。
