# 图标系统 Icon System

## 介绍

RuoYi-Plus 前端项目采用三图标源架构，整合 Iconfont 字体图标、Iconify 图标方案与本地 SVG sprite，800+ 内置图标加上"放文件即用"的本地 SVG 通道,可覆盖系统管理、用户权限、文件操作、状态指示与品牌 logo 等所有场景。图标系统基于 TypeScript 构建，提供完整的类型安全支持，配合 Vite 插件实现类型定义自动生成，开发者可获得智能代码提示和编译期类型检查。

**核心特性:**

- **三种图标源** - 同时支持 Iconfont 字体图标、Iconify SVG 图标与本地 SVG sprite,按 `iconfont > iconify > svg` 优先级自动匹配
- **类型安全** - 基于 TypeScript 的完整类型定义，`IconCode` 类型包含全部预设图标代码,并提供 `isSvgIcon()` 等类型守卫
- **自动类型生成** - Vite 插件自动扫描三个图标资源目录并生成 `icons.d.ts` 类型定义文件,svg 文件新增/修改触发 HMR 重建
- **丰富尺寸系统** - 6 种预设尺寸 (xs/sm/md/lg/xl/2xl)，支持自定义数值和 CSS 单位
- **内置动画效果** - 6 种 CSS 动画 (shake/rotate180/moveUp/expand/shrink/breathing)，适用于各种交互场景
- **图标选择器** - 支持关键词搜索、中文名称搜索和实时预览的 IconSelect 组件
- **智能图标识别** - 自动识别 Iconfont、Iconify 与本地 SVG sprite,统一使用 `code` 属性

## 架构设计

### 三种图标源对比

系统采用 Iconfont + Iconify + 本地 SVG sprite 的三源架构，三种方案各有侧重，互为补充。

| 特性 | Iconfont | Iconify | 本地 SVG sprite |
|------|----------|---------|----------------|
| 来源 | `src/assets/icons/system/` 字体文件 | `src/assets/icons/iconify/preset.json` | `src/assets/icons/svg/*.svg` |
| 用法 | `<Icon code="user" />` | `<Icon value="i-mdi:github" />` | `<Icon code="dingtalk" />` |
| 加载方式 | 字体文件一次性加载 | SVG 按需渲染（UnoCSS 编译） | 构建时合并为 sprite |
| 颜色支持 | 单色（继承 color） | 多色支持 | 单色（需 `fill="currentColor"`） |
| 浏览器兼容 | IE9+ 极好 | 现代浏览器 | 现代浏览器 |
| 渲染方式 | 字体渲染 | SVG 渲染 | SVG `<use>` 引用 |
| 新增成本 | 去 iconfont.cn 项目更新字体 | 直接写 `i-xxx` 即可 | 把 `.svg` 文件放进 svg/ 目录 |
| 使用场景 | 常用系统图标 | 海量图标集 / 多色图标 | 品牌 logo / 自定义单色矢量 |

**选择建议:**

1. **优先使用 Iconfont** - 性能好、兼容性强、首屏加载后无额外请求
2. **Iconfont 无合适图标时使用 Iconify** - 图标库更丰富，支持多色
3. **需要多色图标时使用 Iconify** - Iconfont 仅支持单色
4. **品牌 logo / iconify 无对应图源时用本地 SVG sprite** - 拷贝 `.svg` 文件即可,无需注册

### 优先级匹配规则

同一个 `code` 在三种图标源中可能同时存在,组件按 `iconfont > iconify > svg sprite` 顺序自动匹配第一个命中的源:

```typescript
// 1. value 属性以 'i-' 开头 → 强制 Iconify(用于规避优先级)
// 2. code 在 Iconfont 列表 → Iconfont 字体渲染
// 3. code 在 Iconify 预设 → Iconify(UnoCSS 类)
// 4. code 在 SVG sprite 清单 → <use xlink:href="#icon-xxx">
// 5. 其他情况 → 兜底尝试作为 Iconify 处理(i-{code})
```

### 文件结构

图标系统的核心文件组织如下：

```text
src/
├── assets/icons/
│   ├── system/                    # 系统 Iconfont 图标
│   │   ├── iconfont.css          # 字体图标样式定义
│   │   ├── iconfont.json         # 图标元数据（代码、名称）
│   │   ├── iconfont.woff2        # 字体文件（主要）
│   │   └── iconfont.ttf          # 字体文件（兼容）
│   ├── iconify/
│   │   └── preset.json           # Iconify 预设图标配置
│   └── svg/                       # 本地 SVG sprite 源目录
│       ├── README.md             # 使用说明
│       ├── dingtalk.svg          # 钉钉 logo 示例
│       ├── maxkey.svg            # MaxKey logo 示例
│       └── topiam.svg            # TopIAM logo 示例
├── components/Icon/
│   ├── Icon.vue                  # 图标渲染组件
│   └── IconSelect.vue            # 图标选择器组件
├── types/
│   └── icons.d.ts                # 自动生成的类型定义(三种来源合并)
└── plugins/
    └── elementIcons.ts           # Element Plus 图标注册插件
```

### 图标识别机制

Icon 组件通过智能识别机制自动判断图标类型：

```typescript
// 识别优先级
// 1. value 属性以 'i-' 开头 → Iconify 图标(强制走 iconify)
// 2. code 属性在 Iconfont 列表中 → Iconfont 字体图标
// 3. code 属性在 Iconify 预设中 → Iconify SVG 图标
// 4. code 属性在本地 SVG sprite 列表中 → SVG sprite 渲染
// 5. 其他情况 → 兜底尝试作为 Iconify 图标处理(i-{code})

// Iconfont 图标渲染
<div class="iconfont icon-{code}"></div>

// Iconify 图标渲染
<div class="i-{iconify-value}"></div>

// 本地 SVG sprite 渲染(symbolId='icon-[name]')
<svg class="icon-svg-sprite">
  <use xlink:href="#icon-{code}" fill="currentColor" />
</svg>
```

### 类型系统架构

类型定义文件 `src/types/icons.d.ts` 由 Vite 插件自动生成，包含完整的类型支持：

```typescript
// 图标代码类型(三种来源合并的联合类型)
declare type IconCode =
  | 'account' | 'activity' | 'add' | 'admin' | 'alarm'
  | 'announcement' | 'application' | 'arrow-down' | 'arrow-left'
  // ... 省略大量 iconfont/iconify 图标代码
  | 'dingtalk' | 'maxkey' | 'topiam'  // 本地 SVG sprite 图标
  | 'zip'

// 图标项接口
interface IconItem {
  code: string                            // 图标代码（如 'user'）
  name: string                            // 中文名称（如 '用户'）
  type: 'iconfont' | 'iconify' | 'svg'    // 图标类型(svg 表示本地 sprite)
}

// 带有完整信息的 Iconify 图标项
interface IconifyPresetItem {
  code: string              // 图标代码
  name: string              // 中文名称
  value: string             // Iconify 完整值（如 'i-ep-user'）
}

// 工具函数类型
declare const ALL_ICONS: readonly IconItem[]
declare const SVG_ICONS: readonly IconItem[]   // 本地 svg/ 目录扫描得到
declare function isValidIconCode(code: string): code is IconCode
declare function isIconfontIcon(code: string): boolean
declare function isIconifyIcon(code: string): boolean
declare function isSvgIcon(code: string): boolean         // SVG sprite 类型守卫
declare function getIconifyValue(code: string): string | undefined
declare function getIconName(code: IconCode): string
declare function searchIcons(query: string): IconItem[]
declare function getAllIconCodes(): IconCode[]
```

## Icon 组件

Icon 组件是图标系统的核心渲染组件，支持 Iconfont 和 Iconify 两种图标类型，提供统一的使用接口。

### 基本用法

**使用 code 属性（推荐）:**

`code` 属性是类型安全的，IDE 会提供 817 个图标代码的智能提示：

```vue
<template>
  <div class="icon-demo">
    <!-- 用户相关图标 -->
    <Icon code="user" />
    <Icon code="users" />
    <Icon code="admin" />

    <!-- 系统操作图标 -->
    <Icon code="setting" />
    <Icon code="dashboard" />
    <Icon code="menu" />

    <!-- 文件操作图标 -->
    <Icon code="folder" />
    <Icon code="file" />
    <Icon code="upload" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

<style scoped>
.icon-demo {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
```

**使用说明:**
- `code` 属性接受 `IconCode` 类型，提供完整的类型检查
- 组件自动识别图标类型（Iconfont 或 Iconify）
- 默认尺寸为 `1.3em`，继承父元素字体大小
- 默认颜色继承父元素的 `color` 属性

**使用 value 属性:**

`value` 属性适用于动态图标或需要直接指定 CSS 类名的场景：

```vue
<template>
  <div class="icon-demo">
    <!-- Iconfont 图标 - 直接使用代码 -->
    <Icon value="user" />

    <!-- Iconfont 图标 - 带 icon- 前缀 -->
    <Icon value="icon-setting" />

    <!-- Iconify 图标 - 使用 i- 前缀 -->
    <Icon value="i-ep-user" />
    <Icon value="i-mdi-home" />
    <Icon value="i-carbon-settings" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>
```

**使用说明:**
- `value` 属性为字符串类型，不进行类型检查
- 以 `i-` 开头的值会被识别为 Iconify 图标
- 其他值会被识别为 Iconfont 图标类名
- 适用于从后端动态获取图标代码的场景

### 尺寸系统

Icon 组件提供 6 种预设尺寸和自定义尺寸支持：

**预设尺寸对照表:**

| 预设值 | 像素大小 | 使用场景 |
|--------|----------|----------|
| `xs` | 12px | 表格内图标、辅助信息 |
| `sm` | 16px | 按钮内图标、表单图标 |
| `md` | 20px | 常规图标（推荐默认） |
| `lg` | 24px | 标题图标、卡片图标 |
| `xl` | 32px | 页面图标、强调图标 |
| `2xl` | 40px | Logo、大型展示图标 |

```vue
<template>
  <div class="size-demo">
    <!-- 预设尺寸 -->
    <div class="size-row">
      <Icon code="user" size="xs" />
      <span>xs (12px) - 表格内图标</span>
    </div>
    <div class="size-row">
      <Icon code="user" size="sm" />
      <span>sm (16px) - 按钮图标</span>
    </div>
    <div class="size-row">
      <Icon code="user" size="md" />
      <span>md (20px) - 常规图标</span>
    </div>
    <div class="size-row">
      <Icon code="user" size="lg" />
      <span>lg (24px) - 标题图标</span>
    </div>
    <div class="size-row">
      <Icon code="user" size="xl" />
      <span>xl (32px) - 页面图标</span>
    </div>
    <div class="size-row">
      <Icon code="user" size="2xl" />
      <span>2xl (40px) - Logo</span>
    </div>

    <!-- 自定义尺寸 -->
    <div class="size-row">
      <Icon code="user" :size="18" />
      <span>数字 18 → 18px</span>
    </div>
    <div class="size-row">
      <Icon code="user" size="1.5rem" />
      <span>CSS 单位 1.5rem</span>
    </div>
    <div class="size-row">
      <Icon code="user" size="2em" />
      <span>相对单位 2em</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

<style scoped>
.size-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.size-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
```

**尺寸渲染机制:**

```typescript
// Iconfont 图标使用 font-size 控制尺寸
<div class="iconfont icon-user" style="font-size: 20px"></div>

// Iconify 图标使用 width/height 控制尺寸
<div class="i-ep-user" style="width: 20px; height: 20px"></div>
```

### 颜色配置

Icon 组件支持多种颜色配置方式：

```vue
<template>
  <div class="color-demo">
    <!-- 十六进制颜色 -->
    <Icon code="user" color="#409eff" />
    <Icon code="user" color="#67c23a" />
    <Icon code="user" color="#e6a23c" />
    <Icon code="user" color="#f56c6c" />

    <!-- CSS 变量 -->
    <Icon code="success" color="var(--el-color-success)" />
    <Icon code="warning" color="var(--el-color-warning)" />
    <Icon code="error" color="var(--el-color-danger)" />
    <Icon code="info" color="var(--el-color-info)" />

    <!-- RGB/RGBA 颜色 -->
    <Icon code="user" color="rgb(64, 158, 255)" />
    <Icon code="user" color="rgba(64, 158, 255, 0.6)" />

    <!-- 继承父元素颜色 -->
    <div style="color: purple">
      <Icon code="user" />
      <span>继承紫色</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

<style scoped>
.color-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}
</style>
```

**颜色实现原理:**
- Iconfont 图标通过 CSS `color` 属性控制颜色
- Iconify 单色图标同样支持 `color` 属性
- Iconify 多色图标不受 `color` 属性影响，保持原有配色
- 不设置 `color` 时，图标继承父元素的文字颜色

### 动画效果

Icon 组件内置 6 种 CSS 动画效果，适用于不同的交互场景：

| 动画类型 | 效果描述 | 使用场景 |
|----------|----------|----------|
| `shake` | 左右抖动 | 错误提示、警告状态 |
| `rotate180` | 旋转 180 度 | 展开/收起、切换状态 |
| `moveUp` | 向上移动并渐显 | 加载完成、新内容出现 |
| `expand` | 放大效果 | 强调、聚焦状态 |
| `shrink` | 缩小效果 | 淡出、取消状态 |
| `breathing` | 呼吸缩放 | 加载中、等待状态 |

```vue
<template>
  <div class="animate-demo">
    <!-- 抖动动画 - 错误/警告 -->
    <div class="animate-item">
      <Icon code="warning" animate="shake" color="#e6a23c" size="lg" />
      <span>shake - 抖动警告</span>
    </div>

    <!-- 旋转动画 - 展开/收起 -->
    <div class="animate-item">
      <Icon code="caret-down" animate="rotate180" size="lg" />
      <span>rotate180 - 展开收起</span>
    </div>

    <!-- 上移动画 - 加载完成 -->
    <div class="animate-item">
      <Icon code="success" animate="moveUp" color="#67c23a" size="lg" />
      <span>moveUp - 完成提示</span>
    </div>

    <!-- 放大动画 - 强调 -->
    <div class="animate-item">
      <Icon code="notification" animate="expand" color="#409eff" size="lg" />
      <span>expand - 新消息</span>
    </div>

    <!-- 缩小动画 - 淡出 -->
    <div class="animate-item">
      <Icon code="close" animate="shrink" size="lg" />
      <span>shrink - 关闭效果</span>
    </div>

    <!-- 呼吸动画 - 加载中 -->
    <div class="animate-item">
      <Icon code="loading" animate="breathing" color="#409eff" size="lg" />
      <span>breathing - 加载中</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue'
</script>

<style scoped>
.animate-demo {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.animate-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>
```

**条件动画示例:**

```vue
<template>
  <div class="conditional-animate">
    <!-- 加载状态切换 -->
    <el-button :loading="isLoading" @click="handleRefresh">
      <Icon
        code="refresh"
        :animate="isLoading ? 'breathing' : undefined"
      />
      {{ isLoading ? '加载中' : '刷新' }}
    </el-button>

    <!-- 展开收起状态 -->
    <div class="expandable" @click="isExpanded = !isExpanded">
      <span>更多选项</span>
      <Icon
        code="caret-down"
        :animate="isExpanded ? 'rotate180' : undefined"
        :style="{ transform: isExpanded ? 'rotate(180deg)' : 'none' }"
      />
    </div>

    <!-- 错误状态 -->
    <div v-if="hasError" class="error-tip">
      <Icon code="error" animate="shake" color="#f56c6c" />
      <span>请检查输入内容</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Icon from '@/components/Icon/Icon.vue'

const isLoading = ref(false)
const isExpanded = ref(false)
const hasError = ref(false)

const handleRefresh = async () => {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  isLoading.value = false
}
</script>
```

### Props API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `code` | 图标代码（类型安全，推荐使用） | `IconCode` | - |
| `value` | 图标类名或 Iconify 图标值 | `string` | - |
| `size` | 图标尺寸，支持预设值、数字或 CSS 单位 | `SizePreset \| string \| number` | `'1.3em'` |
| `color` | 图标颜色，支持任意 CSS 颜色值 | `string` | 继承父元素 |
| `animate` | 动画效果类型 | `AnimateType` | - |

**属性优先级:**
- 当同时设置 `code` 和 `value` 时，`value` 的非 Iconify 值优先
- `code` 会先在 Iconfont 中查找，找不到再查找 Iconify 预设

## IconSelect 组件

IconSelect 是一个功能完整的图标选择器组件，支持搜索、预览、选择图标，适用于菜单配置、表单项等场景。

### 基本用法

```vue
<template>
  <div class="icon-select-demo">
    <h4>选择图标</h4>
    <IconSelect v-model="selectedIcon" />

    <div v-if="selectedIcon" class="preview">
      <span>当前选中：</span>
      <Icon :code="selectedIcon as IconCode" size="xl" />
      <span>{{ selectedIcon }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'
import Icon from '@/components/Icon/Icon.vue'
import type { IconCode } from '@/types/icons.d'

const selectedIcon = ref('')
</script>

<style scoped>
.icon-select-demo {
  max-width: 500px;
}
.preview {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
```

### 在表单中使用

IconSelect 组件支持 `v-model` 双向绑定，可无缝集成到表单中：

```vue
<template>
  <el-form :model="formData" :rules="rules" label-width="100px">
    <el-form-item label="菜单名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入菜单名称" />
    </el-form-item>

    <el-form-item label="菜单图标" prop="icon">
      <IconSelect v-model="formData.icon" width="100%" />
    </el-form-item>

    <el-form-item label="路由地址" prop="path">
      <el-input v-model="formData.path" placeholder="请输入路由地址" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

interface MenuForm {
  name: string
  icon: string
  path: string
}

const formData = reactive<MenuForm>({
  name: '',
  icon: 'dashboard',
  path: ''
})

const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择菜单图标', trigger: 'change' }],
  path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
}

const handleSubmit = () => {
  console.log('提交数据:', formData)
}

const handleReset = () => {
  formData.name = ''
  formData.icon = 'dashboard'
  formData.path = ''
}
</script>
```

### 搜索功能

IconSelect 支持按图标代码和中文名称进行搜索：

```vue
<template>
  <div class="search-demo">
    <h4>搜索示例</h4>

    <!-- 默认搜索 -->
    <div class="demo-item">
      <label>按代码搜索：输入 "user"</label>
      <IconSelect v-model="icon1" />
    </div>

    <!-- 中文搜索 -->
    <div class="demo-item">
      <label>按名称搜索：输入 "用户"</label>
      <IconSelect v-model="icon2" />
    </div>

    <!-- 分类搜索 -->
    <div class="demo-item">
      <label>分类搜索：输入 "文件"</label>
      <IconSelect v-model="icon3" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const icon1 = ref('')
const icon2 = ref('')
const icon3 = ref('')
</script>
```

**搜索功能特点:**

1. **代码搜索** - 输入 `user` 可匹配 `user`、`users`、`user-add` 等
2. **中文搜索** - 输入 `用户` 可匹配 `用户`、`用户组`、`用户设置` 等
3. **实时过滤** - 输入时即时过滤显示匹配结果
4. **悬停预览** - 鼠标悬停显示图标名称和代码
5. **选中高亮** - 已选中的图标高亮显示

### 自定义宽度

```vue
<template>
  <div class="width-demo">
    <!-- 固定宽度 -->
    <IconSelect v-model="icon1" width="300px" />

    <!-- 自适应宽度 -->
    <IconSelect v-model="icon2" width="100%" />

    <!-- 最小宽度 -->
    <IconSelect v-model="icon3" width="200px" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const icon1 = ref('')
const icon2 = ref('')
const icon3 = ref('')
</script>
```

### 空值处理

某些场景需要特殊的空值处理，如菜单图标使用 `#` 表示无图标：

```vue
<template>
  <div class="empty-value-demo">
    <!-- 默认空值为空字符串 -->
    <IconSelect v-model="icon1" />

    <!-- 自定义空值为 # -->
    <IconSelect v-model="icon2" empty-value="#" />

    <div class="result">
      <p>icon1 值: "{{ icon1 }}"</p>
      <p>icon2 值: "{{ icon2 }}"</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const icon1 = ref('')
const icon2 = ref('#')
</script>
```

### Props API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `modelValue` | 选中的图标代码（v-model 绑定） | `string` | `''` |
| `width` | 组件宽度 | `string` | `'400px'` |
| `emptyValue` | 清空时的默认值 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `update:modelValue` | 选中图标变化时触发 | `(value: string) => void` |

## 图标库

### Iconfont 图标分类

系统内置 644 个 Iconfont 图标，按功能分为以下类别：

#### 用户权限类 (约 35 个)

用于用户管理、权限控制、角色配置等场景。

| 图标代码 | 中文名称 | 说明 |
|----------|----------|------|
| `user` | 用户 | 单个用户图标 |
| `users` | 用户组 | 多用户/团队图标 |
| `admin` | 管理员 | 管理员专用图标 |
| `role` | 角色 | 角色管理图标 |
| `permission` | 权限 | 权限配置图标 |
| `department` | 部门 | 组织架构图标 |
| `account` | 账户 | 账户管理图标 |
| `password` | 密码 | 密码相关图标 |
| `security` | 安全 | 安全设置图标 |
| `lock` | 锁定 | 锁定状态图标 |
| `unlock` | 解锁 | 解锁状态图标 |

```vue
<template>
  <div class="icon-category">
    <Icon code="user" />
    <Icon code="users" />
    <Icon code="admin" />
    <Icon code="role" />
    <Icon code="permission" />
    <Icon code="department" />
  </div>
</template>
```

#### 系统操作类 (约 50 个)

用于系统功能、操作按钮、工具栏等场景。

| 图标代码 | 中文名称 | 说明 |
|----------|----------|------|
| `add` | 新增 | 添加/创建操作 |
| `edit` | 编辑 | 修改/编辑操作 |
| `delete` | 删除 | 删除/移除操作 |
| `search` | 搜索 | 搜索/查询操作 |
| `refresh` | 刷新 | 刷新/重载操作 |
| `setting` | 设置 | 系统设置图标 |
| `config` | 配置 | 配置管理图标 |
| `download` | 下载 | 文件下载图标 |
| `upload` | 上传 | 文件上传图标 |
| `import` | 导入 | 数据导入图标 |
| `export` | 导出 | 数据导出图标 |
| `copy` | 复制 | 复制操作图标 |
| `paste` | 粘贴 | 粘贴操作图标 |
| `cut` | 剪切 | 剪切操作图标 |
| `undo` | 撤销 | 撤销操作图标 |
| `redo` | 重做 | 重做操作图标 |

```vue
<template>
  <div class="toolbar">
    <el-button type="primary">
      <Icon code="add" size="sm" /> 新增
    </el-button>
    <el-button type="success">
      <Icon code="edit" size="sm" /> 编辑
    </el-button>
    <el-button type="danger">
      <Icon code="delete" size="sm" /> 删除
    </el-button>
    <el-button>
      <Icon code="refresh" size="sm" /> 刷新
    </el-button>
    <el-button>
      <Icon code="export" size="sm" /> 导出
    </el-button>
  </div>
</template>
```

#### 文件文档类 (约 30 个)

用于文件管理、文档处理、资源管理等场景。

| 图标代码 | 中文名称 | 说明 |
|----------|----------|------|
| `folder` | 文件夹 | 目录/文件夹图标 |
| `folder-open` | 打开文件夹 | 展开的文件夹 |
| `file` | 文件 | 通用文件图标 |
| `file-text` | 文本文件 | 文本文档图标 |
| `word` | Word | Word 文档图标 |
| `excel` | Excel | Excel 表格图标 |
| `pdf` | PDF | PDF 文档图标 |
| `ppt` | PPT | PPT 演示文档 |
| `image` | 图片 | 图片文件图标 |
| `video` | 视频 | 视频文件图标 |
| `audio` | 音频 | 音频文件图标 |
| `zip` | 压缩包 | 压缩文件图标 |
| `code` | 代码 | 代码文件图标 |

```vue
<template>
  <div class="file-list">
    <div class="file-item">
      <Icon code="folder" size="lg" color="#e6a23c" />
      <span>项目文件夹</span>
    </div>
    <div class="file-item">
      <Icon code="word" size="lg" color="#409eff" />
      <span>需求文档.docx</span>
    </div>
    <div class="file-item">
      <Icon code="excel" size="lg" color="#67c23a" />
      <span>数据报表.xlsx</span>
    </div>
    <div class="file-item">
      <Icon code="pdf" size="lg" color="#f56c6c" />
      <span>用户手册.pdf</span>
    </div>
  </div>
</template>
```

#### 状态指示类 (约 25 个)

用于状态展示、消息提示、结果反馈等场景。

| 图标代码 | 中文名称 | 说明 |
|----------|----------|------|
| `success` | 成功 | 操作成功状态 |
| `error` | 错误 | 操作失败状态 |
| `warning` | 警告 | 警告提示状态 |
| `info` | 信息 | 信息提示状态 |
| `question` | 疑问 | 帮助/疑问状态 |
| `finish` | 完成 | 任务完成状态 |
| `pending` | 待处理 | 等待处理状态 |
| `processing` | 处理中 | 正在处理状态 |
| `loading` | 加载中 | 数据加载状态 |
| `empty` | 空数据 | 无数据状态 |

```vue
<template>
  <div class="status-demo">
    <el-tag type="success">
      <Icon code="success" size="xs" /> 审批通过
    </el-tag>
    <el-tag type="danger">
      <Icon code="error" size="xs" /> 审批驳回
    </el-tag>
    <el-tag type="warning">
      <Icon code="warning" size="xs" /> 待审批
    </el-tag>
    <el-tag type="info">
      <Icon code="info" size="xs" /> 已撤回
    </el-tag>
  </div>
</template>
```

#### 导航菜单类 (约 40 个)

用于侧边栏菜单、功能导航、系统模块等场景。

| 图标代码 | 中文名称 | 说明 |
|----------|----------|------|
| `dashboard` | 仪表盘 | 首页/概览页面 |
| `menu` | 菜单 | 菜单管理图标 |
| `home` | 首页 | 返回首页图标 |
| `system` | 系统 | 系统管理图标 |
| `monitor` | 监控 | 系统监控图标 |
| `log` | 日志 | 日志管理图标 |
| `tool` | 工具 | 系统工具图标 |
| `guide` | 引导 | 新手引导图标 |
| `link` | 链接 | 外部链接图标 |
| `chart` | 图表 | 数据图表图标 |
| `form` | 表单 | 表单管理图标 |
| `table` | 表格 | 表格管理图标 |
| `tree` | 树形 | 树形结构图标 |

```vue
<template>
  <el-menu>
    <el-menu-item index="1">
      <Icon code="dashboard" />
      <span>仪表盘</span>
    </el-menu-item>
    <el-sub-menu index="2">
      <template #title>
        <Icon code="system" />
        <span>系统管理</span>
      </template>
      <el-menu-item index="2-1">
        <Icon code="user" />
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="2-2">
        <Icon code="role" />
        <span>角色管理</span>
      </el-menu-item>
      <el-menu-item index="2-3">
        <Icon code="menu" />
        <span>菜单管理</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
```

#### 业务功能类 (约 60 个)

用于各类业务功能模块的图标展示。

| 图标代码 | 中文名称 | 说明 |
|----------|----------|------|
| `order` | 订单 | 订单管理图标 |
| `product` | 商品 | 商品管理图标 |
| `shop` | 店铺 | 店铺管理图标 |
| `cart` | 购物车 | 购物车图标 |
| `payment` | 支付 | 支付相关图标 |
| `wallet` | 钱包 | 钱包/余额图标 |
| `coupon` | 优惠券 | 优惠券图标 |
| `gift` | 礼品 | 礼品/赠品图标 |
| `message` | 消息 | 消息通知图标 |
| `notification` | 通知 | 系统通知图标 |
| `calendar` | 日历 | 日期选择图标 |
| `clock` | 时钟 | 时间相关图标 |
| `location` | 位置 | 地理位置图标 |
| `phone` | 电话 | 联系电话图标 |
| `email` | 邮箱 | 邮件相关图标 |

### Iconify 图标分类

系统预设 173 个 Iconify 图标，主要来自 Element Plus、MDI、Carbon 等图标库：

#### 组件类图标

| 图标代码 | Iconify 值 | 说明 |
|----------|------------|------|
| `button` | `i-ep-button` | 按钮组件 |
| `form` | `i-ep-form` | 表单组件 |
| `input` | `i-ep-input` | 输入框组件 |
| `select` | `i-ep-select` | 选择器组件 |
| `checkbox` | `i-ep-checkbox` | 复选框组件 |
| `radio` | `i-ep-radio` | 单选框组件 |
| `switch` | `i-ep-switch` | 开关组件 |
| `slider` | `i-ep-slider` | 滑块组件 |
| `upload` | `i-ep-upload` | 上传组件 |
| `table` | `i-ep-table` | 表格组件 |

#### 图表类图标

| 图标代码 | Iconify 值 | 说明 |
|----------|------------|------|
| `chart` | `i-ep-chart` | 通用图表 |
| `pie-chart` | `i-ep-pie-chart` | 饼图 |
| `bar-chart` | `i-ep-bar-chart` | 柱状图 |
| `line-chart` | `i-ep-line-chart` | 折线图 |
| `trend-charts` | `i-ep-trend-charts` | 趋势图 |
| `data-analysis` | `i-ep-data-analysis` | 数据分析 |

#### 导航类图标

| 图标代码 | Iconify 值 | 说明 |
|----------|------------|------|
| `breadcrumb` | `i-ep-breadcrumb` | 面包屑 |
| `hamburger` | `i-ep-hamburger` | 汉堡菜单 |
| `menu` | `i-ep-menu` | 菜单 |
| `back` | `i-ep-back` | 返回 |
| `right` | `i-ep-right` | 向右 |
| `arrow-down` | `i-ep-arrow-down` | 向下箭头 |
| `arrow-up` | `i-ep-arrow-up` | 向上箭头 |

#### 社交类图标

| 图标代码 | Iconify 值 | 说明 |
|----------|------------|------|
| `wechat-fill` | `i-ri-wechat-fill` | 微信（填充） |
| `weibo` | `i-ri-weibo-fill` | 微博 |
| `qq` | `i-ri-qq-fill` | QQ |
| `github` | `i-mdi-github` | GitHub |
| `twitter` | `i-mdi-twitter` | Twitter |
| `facebook` | `i-mdi-facebook` | Facebook |

### 自定义图标

#### 添加 Iconfont 图标

1. **从 Iconfont 官网下载图标**
   - 访问 [iconfont.cn](https://www.iconfont.cn/)
   - 选择需要的图标添加到项目
   - 下载项目（选择 Font class 格式）

2. **放置到自定义目录**
   ```
   src/assets/icons/custom/
   ├── iconfont.css
   ├── iconfont.json      # 包含图标代码和名称
   ├── iconfont.woff2
   └── iconfont.ttf
   ```

3. **在 main.ts 导入样式**
   ```typescript
   // main.ts
   import '@/assets/icons/custom/iconfont.css'
   ```

4. **重启开发服务器**
   ```bash
   pnpm dev
   ```

   Vite 插件会自动扫描 `iconfont.json` 并更新 `icons.d.ts` 类型定义。

#### 添加 Iconify 图标

1. **编辑预设文件**
   ```json
   // src/assets/icons/iconify/preset.json
   {
     "icons": [
       // 现有图标...
       {
         "code": "my-icon",
         "name": "我的图标",
         "value": "i-carbon-my-icon"
       }
     ]
   }
   ```

2. **确保安装了对应的图标集**
   ```bash
   pnpm add -D @iconify-json/carbon
   ```

3. **重启开发服务器**

#### 添加本地 SVG sprite 图标

1. **放置 SVG 文件**
   ```
   src/assets/icons/svg/
   ├── feishu.svg       # 文件名即 code
   └── wecom.svg
   ```

2. **确保 SVG 内使用 currentColor**
   ```xml
   <!-- ✅ 正确:可响应 color 属性 -->
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
     <path d="M..." fill="currentColor" />
   </svg>

   <!-- ❌ 错误:固定 fill 颜色无法变色 -->
   <svg><path d="M..." fill="#0089FF" /></svg>
   ```

3. **无需重启,HMR 自动重建类型**
   - `iconfont-types` 插件监听 `assets/icons` 变化
   - `vite-plugin-svg-icons-ng` 实时合并新 sprite

#### 使用自定义图标

```vue
<template>
  <!-- 自定义 Iconfont 图标 -->
  <Icon code="my-custom-icon" />

  <!-- 自定义 Iconify 图标 -->
  <Icon code="my-icon" />

  <!-- 自定义 SVG sprite 图标 -->
  <Icon code="feishu" color="#00D6B9" />
</template>
```

## 类型定义

### 完整类型定义

```typescript
// 尺寸预设类型
type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 动画类型
type AnimateType =
  | 'shake'      // 抖动
  | 'rotate180'  // 旋转180度
  | 'moveUp'     // 上移渐显
  | 'expand'     // 放大
  | 'shrink'     // 缩小
  | 'breathing'  // 呼吸缩放

// 图标代码类型（817 个图标的联合类型）
type IconCode =
  | 'account' | 'activity' | 'add' | 'admin' | 'alarm'
  | 'announcement' | 'application' | 'arrow-down' | 'arrow-left'
  // ... 省略 800+ 个图标代码
  | 'zip'

// 图标项接口
interface IconItem {
  /** 图标代码 */
  code: string
  /** 中文名称 */
  name: string
  /** 图标类型 */
  type: 'iconfont' | 'iconify'
}

// Iconify 预设图标项
interface IconifyPresetItem {
  /** 图标代码 */
  code: string
  /** 中文名称 */
  name: string
  /** Iconify 完整值 */
  value: string
}

// Icon 组件属性
interface IconProps {
  /** 图标代码（类型安全） */
  code?: IconCode
  /** 图标值（用于动态图标） */
  value?: string
  /** 图标尺寸 */
  size?: SizePreset | string | number
  /** 图标颜色 */
  color?: string
  /** 动画效果 */
  animate?: AnimateType
}

// IconSelect 组件属性
interface IconSelectProps {
  /** 选中的图标代码 */
  modelValue: string
  /** 组件宽度 */
  width?: string
  /** 清空时的默认值 */
  emptyValue?: string
}
```

### 工具函数

```typescript
// 导入工具函数
import {
  ALL_ICONS,
  isValidIconCode,
  isIconfontIcon,
  isIconifyIcon,
  getIconifyValue,
  getIconName,
  searchIcons,
  getAllIconCodes
} from '@/types/icons.d'

// 验证图标代码是否有效
const isValid = isValidIconCode('user')  // true
const isInvalid = isValidIconCode('invalid-icon')  // false

// 判断是否为 Iconfont 图标
const isFont = isIconfontIcon('user')  // true
const isNotFont = isIconfontIcon('wechat-fill')  // false

// 判断是否为 Iconify 图标
const isIconify = isIconifyIcon('wechat-fill')  // true

// 获取 Iconify 图标的完整值
const value = getIconifyValue('wechat-fill')  // 'i-ri-wechat-fill'

// 获取图标中文名称
const name = getIconName('user')  // '用户'

// 搜索图标
const results = searchIcons('用户')
// [
//   { code: 'user', name: '用户', type: 'iconfont' },
//   { code: 'users', name: '用户组', type: 'iconfont' },
//   ...
// ]

// 获取所有图标代码
const allCodes = getAllIconCodes()  // ['account', 'activity', ...]

// 全部图标列表
console.log(ALL_ICONS.length)  // 817
```

### 在组件中使用类型

```vue
<template>
  <div class="icon-demo">
    <Icon
      v-for="icon in icons"
      :key="icon"
      :code="icon"
      size="lg"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Icon from '@/components/Icon/Icon.vue'
import type { IconCode } from '@/types/icons.d'

// 使用 IconCode 类型定义图标数组
const icons = ref<IconCode[]>(['user', 'setting', 'dashboard', 'menu'])

// 图标映射表
const iconMap: Record<string, IconCode> = {
  user: 'user',
  admin: 'admin',
  role: 'role',
  menu: 'menu'
}

// 根据类型获取图标
const getIconByType = (type: string): IconCode => {
  return iconMap[type] || 'question'
}
</script>
```

## 最佳实践

### 1. 优先使用 code 属性

`code` 属性提供类型安全，IDE 会给出智能提示，避免拼写错误：

```vue
<!-- ✅ 推荐：类型安全，有智能提示 -->
<Icon code="user" />

<!-- ❌ 不推荐：无类型检查，容易拼错 -->
<Icon value="user" />
```

### 2. 预定义图标映射

在需要动态使用图标的场景，建议预先定义图标映射：

```typescript
import type { IconCode } from '@/types/icons.d'

// 定义状态图标映射
const statusIconMap: Record<string, IconCode> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  pending: 'pending'
}

// 定义文件类型图标映射
const fileIconMap: Record<string, IconCode> = {
  folder: 'folder',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  pdf: 'pdf',
  zip: 'zip',
  rar: 'zip',
  default: 'file'
}

// 使用
<Icon :code="statusIconMap[status]" />
<Icon :code="fileIconMap[file.ext] || fileIconMap.default" />
```

### 3. 合理使用动画

动画应该有明确的语义，避免过度使用：

```vue
<!-- ✅ 推荐：有明确语义的动画 -->
<Icon code="refresh" :animate="isLoading ? 'breathing' : undefined" />
<Icon code="warning" :animate="hasError ? 'shake' : undefined" />

<!-- ❌ 不推荐：无意义的持续动画 -->
<Icon code="user" animate="breathing" />

<!-- ❌ 不推荐：大量图标同时动画 -->
<div v-for="item in 100" :key="item">
  <Icon code="loading" animate="breathing" />
</div>
```

### 4. IconSelect 懒加载

IconSelect 组件包含 817 个图标，建议使用懒加载：

```typescript
// ✅ 推荐：懒加载
const IconSelect = defineAsyncComponent(() =>
  import('@/components/Icon/IconSelect.vue')
)

// 或在路由中配置
const routes = [
  {
    path: '/menu',
    component: () => import('@/views/system/menu/index.vue'),
    // IconSelect 在 menu 页面中使用
  }
]
```

### 5. 保持尺寸一致

同一区域的图标应该使用相同的尺寸：

```vue
<!-- ✅ 推荐：同一列表统一尺寸 -->
<ul class="menu-list">
  <li><Icon code="user" size="md" /> 用户管理</li>
  <li><Icon code="role" size="md" /> 角色管理</li>
  <li><Icon code="menu" size="md" /> 菜单管理</li>
</ul>

<!-- ❌ 不推荐：尺寸不统一 -->
<ul class="menu-list">
  <li><Icon code="user" size="sm" /> 用户管理</li>
  <li><Icon code="role" size="lg" /> 角色管理</li>
  <li><Icon code="menu" size="md" /> 菜单管理</li>
</ul>
```

### 6. 按钮中的图标用法

```vue
<!-- ✅ 推荐：图标在文字左侧，使用小尺寸 -->
<el-button type="primary">
  <Icon code="add" size="sm" />
  新增
</el-button>

<!-- ✅ 推荐：纯图标按钮使用 md 尺寸 -->
<el-button type="primary" circle>
  <Icon code="search" size="md" />
</el-button>

<!-- ❌ 不推荐：图标过大 -->
<el-button type="primary">
  <Icon code="add" size="xl" />
  新增
</el-button>
```

### 7. 使用 CSS 变量保持主题一致

```vue
<template>
  <div class="status-icons">
    <Icon code="success" color="var(--el-color-success)" />
    <Icon code="warning" color="var(--el-color-warning)" />
    <Icon code="error" color="var(--el-color-danger)" />
    <Icon code="info" color="var(--el-color-info)" />
  </div>
</template>
```

## 常见问题

### 1. 图标不显示

**问题描述:** 使用 Icon 组件但图标不显示，显示空白或方块。

**问题原因:**
- 字体文件未正确加载
- 图标代码拼写错误
- CSS 样式被覆盖
- Iconify 图标集未安装

**解决方案:**

```typescript
// 1. 确保导入了字体样式
// main.ts
import '@/assets/icons/system/iconfont.css'

// 2. 检查图标代码是否正确
import { isValidIconCode } from '@/types/icons.d'
console.log(isValidIconCode('user'))  // 应该返回 true

// 3. 检查浏览器 Network 面板
// 确认 iconfont.woff2 文件已加载成功

// 4. 检查 CSS 样式
// 确保没有 `font-family: xxx !important` 覆盖
```

### 2. 类型提示不生效

**问题描述:** 使用 `code` 属性时没有智能提示，或者 TypeScript 报错。

**解决方案:**

```bash
# 1. 重启 TypeScript 服务
# VS Code: Ctrl+Shift+P → TypeScript: Restart TS Server

# 2. 检查类型文件是否存在
ls src/types/icons.d.ts

# 3. 重启开发服务器触发类型生成
pnpm dev

# 4. 检查 tsconfig.json 是否包含类型目录
{
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"]
}
```

### 3. 动画不生效

**问题描述:** 设置了 `animate` 属性但图标没有动画效果。

**问题原因:**
- 动画样式未加载
- CSS 被 `animation: none !important` 覆盖
- 系统启用了"减少动画"偏好设置

**解决方案:**

```vue
<template>
  <!-- 检查动画类名是否正确添加 -->
  <Icon code="loading" animate="breathing" class="debug-icon" />
</template>

<style>
/* 确保没有禁用动画 */
.debug-icon {
  animation-duration: 1s !important;
  animation-iteration-count: infinite !important;
}

/* 如果系统启用了减少动画，可以覆盖 */
@media (prefers-reduced-motion: reduce) {
  .force-animation {
    animation: breathing 1.5s ease-in-out infinite !important;
  }
}
</style>
```

### 4. 图标颜色无法修改

**问题描述:** 设置 `color` 属性但图标颜色没有变化。

**问题原因:**
- Iconify 多色图标不支持单色修改
- 父元素设置了 `color` 且优先级更高

**解决方案:**

```vue
<template>
  <!-- 方案1：使用 style 提高优先级 -->
  <Icon code="user" :style="{ color: '#409eff' }" />

  <!-- 方案2：包裹一层并设置颜色 -->
  <span style="color: #409eff">
    <Icon code="user" />
  </span>

  <!-- 方案3：多色图标使用 Iconify 原生颜色 -->
  <!-- 无法修改颜色是正常的 -->
  <Icon code="wechat-fill" />
</template>
```

### 5. 自定义图标类型未更新

**问题描述:** 添加了自定义图标，但类型定义没有更新。

**解决方案:**

```bash
# 1. 确保 iconfont.json 格式正确
cat src/assets/icons/custom/iconfont.json
# {
#   "glyphs": [
#     { "font_class": "my-icon", "name": "我的图标" }
#   ]
# }

# 2. 重启开发服务器
pnpm dev

# 3. 检查类型文件是否更新
grep "my-icon" src/types/icons.d.ts

# 4. 确保图标代码不与系统图标重复
```

### 6. IconSelect 搜索无结果

**问题描述:** 在 IconSelect 中搜索图标但显示空列表。

**解决方案:**

```vue
<template>
  <IconSelect v-model="icon" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ALL_ICONS, searchIcons } from '@/types/icons.d'

const icon = ref('')

onMounted(() => {
  // 检查图标列表是否正确加载
  console.log('图标总数:', ALL_ICONS.length)  // 应该是 817

  // 测试搜索功能
  const results = searchIcons('user')
  console.log('搜索结果:', results)
})
</script>
```

### 7. 图标在暗黑模式下不可见

**问题描述:** 切换到暗黑模式后，图标颜色与背景色接近，不可见。

**解决方案:**

```vue
<template>
  <!-- 使用 CSS 变量确保主题适配 -->
  <Icon code="user" color="var(--el-text-color-primary)" />

  <!-- 或在样式中处理 -->
  <Icon code="user" class="theme-icon" />
</template>

<style>
.theme-icon {
  color: var(--el-text-color-regular);
}

/* 暗黑模式特殊处理 */
html.dark .theme-icon {
  color: var(--el-text-color-primary);
}
</style>
```

## 总结

图标系统核心要点:

1. **双系统架构** - Iconfont (644) + Iconify (173) = 817 个图标，满足各类场景需求
2. **类型安全** - 使用 `code` 属性获得完整类型提示，避免拼写错误
3. **智能识别** - 组件自动识别 Iconfont 和 Iconify 图标类型
4. **尺寸系统** - xs/sm/md/lg/xl/2xl 六种预设，支持自定义数值
5. **动画效果** - shake/rotate180/moveUp/expand/shrink/breathing 六种内置动画
6. **图标选择器** - IconSelect 组件支持搜索、预览、选择
7. **工具函数** - 提供 isValidIconCode、searchIcons、getIconName 等实用函数
8. **自动生成** - Vite 插件自动生成类型定义，开发体验友好

开发建议:
- 优先使用 `code` 属性保证类型安全
- 优先使用 Iconfont 图标（性能好、兼容性强）
- 合理使用动画效果，避免过度使用
- 同一区域保持图标尺寸一致
- 使用 CSS 变量保持主题一致性
