# 图标系统概述

项目采用双图标系统架构，结合 Iconify 和 Iconfont 两种图标方案，提供丰富的图标资源和灵活的使用方式。通过自动化类型生成系统，确保图标使用的类型安全和智能提示。

## 系统架构

### 图标资源统计

项目总共集成了 817 个图标，分布在两个图标系统中：

```
总计: 817 个图标
├── Iconfont: 644 个 (项目自定义图标)
│   ├── 业务功能图标
│   ├── 界面交互图标
│   ├── 文件类型图标
│   └── 状态指示图标
└── Iconify:  173 个 (第三方图标集预设)
    ├── Element Plus 图标
    ├── Material Design 图标
    ├── Phosphor Icons
    └── Tabler Icons
```

### 技术栈集成

图标系统基于以下技术栈构建：

| 技术 | 版本 | 作用 |
|-----|------|-----|
| UnoCSS | 最新版 | 原子化 CSS 引擎，提供按需加载的图标支持 |
| Iconify | - | 开源图标集合，提供 15万+ 图标资源 |
| Iconfont | - | 阿里巴巴图标库，支持自定义上传 |
| TypeScript | 5.x | 提供完整的类型定义和智能提示 |
| Vite Plugin | 自定义 | 自动扫描并生成图标类型定义 |

### 核心设计理念

1. **类型安全优先** - 所有图标代码都有对应的 TypeScript 类型
2. **按需加载** - Iconify 图标仅在使用时加载，减小包体积
3. **自动化生成** - 类型定义自动生成，无需手动维护
4. **统一管理** - 双图标系统通过统一接口管理
5. **语义化命名** - 图标命名清晰表达其用途

## 目录结构

```
plus-ui/
├── src/
│   ├── assets/
│   │   └── icons/
│   │       ├── system/
│   │       │   ├── iconfont.css          # Iconfont 字体样式定义
│   │       │   ├── iconfont.json         # Iconfont 图标元数据(644个)
│   │       │   ├── iconfont.ttf          # TrueType 字体文件
│   │       │   ├── iconfont.woff         # WOFF 字体文件
│   │       │   └── iconfont.woff2        # WOFF2 字体文件(优先加载)
│   │       └── iconify/
│   │           └── preset.json           # Iconify 预设图标配置(173个)
│   └── types/
│       └── icons.d.ts                    # 自动生成的图标类型文件
├── vite/
│   └── plugins/
│       └── iconfont-types.ts             # 图标类型生成 Vite 插件
└── uno.config.ts                         # UnoCSS 配置(含图标预设)
```

## Vite 插件工作原理

### 插件架构

图标类型生成插件 `iconfont-types.ts` 在 Vite 构建启动时自动执行，完成以下工作：

```typescript
// 插件核心接口定义
interface IconItem {
  code: string    // 图标代码
  name: string    // 图标名称(中文)
}

interface IconifyIconItem extends IconItem {
  value: string   // Iconify CSS 类名 (如: i-ep-home)
}

interface IconfontGlyph {
  font_class: string       // CSS 类名
  name: string             // 图标名称
  unicode: string          // Unicode 编码
  unicode_decimal: number  // Unicode 十进制值
}
```

### 扫描流程

插件会递归扫描 `src/assets/icons` 目录下的所有 JSON 文件：

```typescript
// 扫描目录下的文件
const scanDirectory = (dirPath: string) => {
  const items = readdirSync(dirPath)

  items.forEach((item) => {
    const itemPath = join(dirPath, item)

    if (statSync(itemPath).isDirectory()) {
      scanDirectory(itemPath)  // 递归扫描子目录
    } else if (item.endsWith('.json')) {
      // 优先尝试解析为 iconify 格式
      const iconifyIcons = parseIconifyJson(itemPath)
      if (iconifyIcons.length > 0) {
        // 记录为 Iconify 图标
      } else {
        // 按 iconfont 格式解析
        const iconfontIcons = parseIconfontJson(itemPath)
      }
    }
  })
}
```

### Iconfont JSON 解析

Iconfont 格式的 JSON 文件包含 `glyphs` 数组：

```json
{
  "id": "5022572",
  "name": "plus-ui",
  "font_family": "iconfont",
  "css_prefix_text": "icon-",
  "description": "ruoyi-plus-uniapp图标库",
  "glyphs": [
    {
      "icon_id": "25331853",
      "name": "电梯",
      "font_class": "elevator3",
      "unicode": "e8b9",
      "unicode_decimal": 59577
    },
    {
      "icon_id": "32102715",
      "name": "电量",
      "font_class": "battery",
      "unicode": "e6e5",
      "unicode_decimal": 59109
    }
  ]
}
```

解析函数提取 `font_class` 和 `name` 字段：

```typescript
const parseIconfontJson = (jsonPath: string): IconItem[] => {
  const content = readFileSync(jsonPath, 'utf-8')
  const data: IconfontJson = JSON.parse(content)

  if (data.glyphs && Array.isArray(data.glyphs)) {
    return data.glyphs.map((glyph) => ({
      code: glyph.font_class || glyph.name,
      name: glyph.name
    }))
  }

  return []
}
```

### Iconify JSON 解析

Iconify 格式的 JSON 文件使用 `type: "iconify"` 标识：

```json
{
  "name": "iconify-preset",
  "description": "iconify 预设图标集合",
  "type": "iconify",
  "icons": [
    {
      "code": "dashboard",
      "name": "仪表盘",
      "value": "i-tabler:layout-dashboard"
    },
    {
      "code": "setting",
      "name": "系统设置",
      "value": "i-ic:outline-settings"
    }
  ]
}
```

解析函数保留 `value` 属性用于 CSS 类名：

```typescript
const parseIconifyJson = (jsonPath: string): IconifyIconItem[] => {
  const content = readFileSync(jsonPath, 'utf-8')
  const data: IconifyJson = JSON.parse(content)

  if (data.type === 'iconify' && data.icons && Array.isArray(data.icons)) {
    return data.icons.map((icon) => ({
      code: icon.code,
      name: icon.name,
      value: icon.value
    }))
  }

  return []
}
```

### 类型文件生成

扫描完成后，插件生成 `src/types/icons.d.ts` 文件：

```typescript
/**
 * 图标类型声明文件
 *
 * 此文件由 iconfont-types 插件自动生成
 * 扫描目录: src/assets/icons
 * 图标数量: 817 个图标 (iconfont: 644, iconify: 173)
 *
 * 请勿手动修改此文件，所有修改将在下次构建时被覆盖
 */

declare global {
  /** 图标代码类型 */
  type IconCode =
    | 'elevator3'
    | 'battery'
    | 'dashboard'
    | 'setting'
    // ... 更多图标
}

/** 图标项接口 */
export interface IconItem {
  code: string
  name: string
}

/** iconify 图标项接口 */
export interface IconifyIconItem extends IconItem {
  value: string
}

/** iconfont 图标列表 */
export const ICONFONT_ICONS: IconItem[] = [
  { code: 'elevator3', name: '电梯' },
  { code: 'battery', name: '电量' },
  // ...
]

/** iconify 预设图标列表 */
export const ICONIFY_ICONS: IconifyIconItem[] = [
  { code: 'dashboard', name: '仪表盘', value: 'i-tabler:layout-dashboard' },
  { code: 'setting', name: '系统设置', value: 'i-ic:outline-settings' },
  // ...
]

/** 所有可用图标列表 */
export const ALL_ICONS: IconItem[] = [
  // iconfont + iconify 合并
]
```

### 热更新支持

插件监听图标文件变化，自动重新生成类型：

```typescript
handleHotUpdate({ file }) {
  const iconsPath = resolve(projectRoot, iconsDir)

  if (file.startsWith(iconsPath) && file.endsWith('.json')) {
    console.log(`检测到图标文件变化: ${relative(projectRoot, file)}`)
    writeTypeFile()
  }
}
```

## UnoCSS 图标配置

### 预设配置

项目使用 UnoCSS 的 `presetIcons` 预设来支持 Iconify 图标：

```typescript
// uno.config.ts
import {
  defineConfig,
  presetIcons,
  presetUno,
  // ...其他预设
} from 'unocss'

import { ICONIFY_ICONS } from './src/types/icons.d'

export default defineConfig({
  presets: [
    presetUno(),

    // 图标预设配置
    presetIcons({
      // 可自定义图标集合
    }),
  ],

  // 安全列表 - 确保所有预设图标被打包
  safelist: [
    ...ICONIFY_ICONS.map((icon) => icon.value)
  ],
})
```

### 安全列表机制

由于 UnoCSS 是按需加载的，动态生成的类名可能不会被包含在构建产物中。通过 `safelist` 配置，确保所有预设图标的 CSS 类始终被包含：

```typescript
safelist: [
  // 从类型定义中获取所有 iconify 图标
  ...ICONIFY_ICONS.map((icon) => icon.value)
  // 例如: 'i-tabler:layout-dashboard', 'i-ic:outline-settings', ...
]
```

### 自定义规则

UnoCSS 配置中还包含与主题相关的自定义样式：

```typescript
shortcuts: {
  // 布局快捷方式
  'flex-center': 'flex items-center justify-center',
  'flex-between': 'flex items-center justify-between',

  // 定位快捷方式
  'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
},

theme: {
  colors: {
    'primary': 'var(--el-color-primary)',
    'success': 'var(--color-success)',
    'warning': 'var(--color-warning)',
    'danger': 'var(--color-danger)',
  },
}
```

## 双图标系统对比

### 功能特性对比

| 特性 | Iconfont | Iconify |
|------|----------|---------|
| **图标数量** | 644 个 | 173 个(预设) |
| **加载方式** | 字体文件一次性加载 | SVG 按需加载 |
| **文件大小** | 约 100KB (woff2) | 每个图标 1-3KB |
| **自定义能力** | 完全自定义设计 | 使用第三方图标集 |
| **颜色控制** | CSS `color` 属性 | `currentColor` 继承 |
| **多色支持** | 不支持 | 支持多色 SVG |
| **性能特点** | 首次加载较大 | 极小的初始加载 |
| **适用场景** | 项目专属图标 | 通用 UI 图标 |
| **缩放效果** | 字体抗锯齿 | 矢量无损缩放 |
| **离线支持** | 字体缓存后可用 | 需要网络请求(可预加载) |

### 技术原理对比

**Iconfont 工作原理：**

```css
/* 字体定义 */
@font-face {
  font-family: 'iconfont';
  src: url('./iconfont.woff2') format('woff2'),
       url('./iconfont.woff') format('woff'),
       url('./iconfont.ttf') format('truetype');
  font-display: swap;
}

/* 图标样式 */
.icon-elevator3::before {
  content: '\e8b9';
  font-family: 'iconfont';
  font-style: normal;
}
```

**Iconify 工作原理：**

```css
/* UnoCSS 生成的样式 */
.i-tabler\:layout-dashboard {
  --un-icon: url("data:image/svg+xml,...");
  -webkit-mask: var(--un-icon) no-repeat;
  mask: var(--un-icon) no-repeat;
  background-color: currentColor;
  width: 1em;
  height: 1em;
}
```

### 选择建议

**使用 Iconfont 的场景：**

```vue
<template>
  <!-- 业务专属图标 -->
  <i class="icon-elevator3" />        <!-- 电梯图标 -->
  <i class="icon-floating-bottle" />  <!-- 漂流瓶图标 -->
  <i class="icon-custom-logo" />      <!-- 自定义 Logo -->

  <!-- 需要统一视觉风格的场景 -->
  <i class="icon-business-feature" /> <!-- 业务功能图标 -->
</template>
```

**使用 Iconify 的场景：**

```vue
<template>
  <!-- 通用 UI 图标 -->
  <i class="i-tabler:layout-dashboard" />  <!-- 仪表盘 -->
  <i class="i-ic:outline-settings" />      <!-- 设置 -->
  <i class="i-ph:user" />                  <!-- 用户 -->

  <!-- 常见操作图标 -->
  <i class="i-ph:arrow-square-in" />       <!-- 导入 -->
  <i class="i-ph:arrow-square-out" />      <!-- 导出 -->
  <i class="i-ph:check-circle" />          <!-- 完成 -->
</template>
```

## Iconify 图标分类

### 导航与布局 (25个)

用于页面导航、菜单、面包屑等场景：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `dashboard` | 仪表盘 | `i-tabler:layout-dashboard` |
| `nested` | 嵌套菜单 | `i-mdi:menu-open` |
| `breadcrumb` | 面包屑 | `i-tdesign:component-breadcrumb` |
| `hamburger` | 汉堡包 | `i-ri:menu-fold-2-fill` |
| `forward` | 前进 | `i-mdi:arrow-right` |
| `caret-back` | 后退箭头 | `i-mdi:chevron-left` |
| `caret-forward` | 前进箭头 | `i-mdi:chevron-right` |
| `caret-up` | 向上箭头 | `i-mdi:chevron-up` |
| `caret-down` | 向下箭头 | `i-mdi:chevron-down` |
| `arrow-up` | 向上箭头 | `i-mdi:arrow-up` |
| `arrow-down` | 向下箭头 | `i-mdi:arrow-down` |

使用示例：

```vue
<template>
  <div class="sidebar">
    <!-- 侧边栏菜单 -->
    <div class="menu-item" @click="toggleMenu">
      <i class="i-tabler:layout-dashboard" />
      <span>仪表盘</span>
    </div>

    <!-- 子菜单展开/收起 -->
    <i :class="isExpanded ? 'i-mdi:chevron-up' : 'i-mdi:chevron-down'" />

    <!-- 面包屑导航 -->
    <nav class="breadcrumb">
      <span>首页</span>
      <i class="i-mdi:chevron-right" />
      <span>系统管理</span>
    </nav>
  </div>
</template>
```

### 表单组件 (15个)

用于表单元素和交互控件：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `button` | 按钮 | `i-fluent:button-16-regular` |
| `form` | 表单 | `i-fluent:form-28-regular` |
| `input` | 输入框 | `i-ph:textbox` |
| `textarea` | 文本域 | `i-bi:textarea-t` |
| `select` | 选择器 | `i-mdi:form-select` |
| `cascader` | 级联选择 | `i-ion:ios-arrow-dropdown` |
| `slider` | 滑块 | `i-stash:sliders-h` |
| `rate` | 评分 | `i-solar:medal-ribbons-star-bold` |
| `star` | 星标 | `i-material-symbols:star-rounded` |
| `tab` | 标签页 | `i-mdi:tab` |
| `icon` | 图标 | `i-tabler:favicon` |

使用示例：

```vue
<template>
  <el-form>
    <el-form-item>
      <template #label>
        <i class="i-ph:textbox mr-1" />
        <span>用户名</span>
      </template>
      <el-input v-model="form.username" />
    </el-form-item>

    <el-form-item>
      <template #label>
        <i class="i-mdi:form-select mr-1" />
        <span>选择角色</span>
      </template>
      <el-select v-model="form.role" />
    </el-form-item>
  </el-form>
</template>
```

### 文件与文档 (20个)

用于文件类型展示和文档相关场景：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `folder` | 文件夹 | `i-ph:folder` |
| `folder-open` | 打开的文件夹 | `i-ph:folder-open` |
| `documentation` | 文档 | `i-ph:book-open-text-bold` |
| `code-file` | 代码文件 | `i-ph:file-code` |
| `word` | Word文档 | `i-ph:file-doc` |
| `excel` | 表格文件 | `i-ph:file-xls` |
| `ppt` | PPT演示文稿 | `i-ph:file-ppt` |
| `pdf` | PDF文件 | `i-tabler:file-type-pdf` |
| `zip` | 压缩包 | `i-ph:file-zip` |
| `audio` | 音频 | `i-ph:music-notes` |
| `photo-album` | 相册 | `i-ph:images` |

使用示例：

```vue
<template>
  <!-- 文件类型图标映射 -->
  <div class="file-item">
    <i :class="getFileIcon(file.type)" />
    <span>{{ file.name }}</span>
  </div>
</template>

<script setup lang="ts">
const getFileIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'folder': 'i-ph:folder',
    'doc': 'i-ph:file-doc',
    'docx': 'i-ph:file-doc',
    'xls': 'i-ph:file-xls',
    'xlsx': 'i-ph:file-xls',
    'pdf': 'i-tabler:file-type-pdf',
    'zip': 'i-ph:file-zip',
    'rar': 'i-ph:file-zip',
  }
  return iconMap[type] || 'i-ph:file'
}
</script>
```

### 用户与权限 (15个)

用于用户管理、权限控制相关场景：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `users` | 用户组 | `i-lucide:users` |
| `role` | 角色 | `i-eos-icons:role-binding-outlined` |
| `department` | 部门 | `i-mingcute:department-line` |
| `post` | 岗位 | `i-ph:briefcase` |
| `admin` | 管理员 | `i-clarity:administrator-line` |
| `customer` | 客户 | `i-streamline:information-desk-customer` |
| `permission` | 权限 | `i-ph:key` |
| `auth-center` | 认证中心 | `i-ph:shield-check` |
| `auth-identity` | 身份认证 | `i-hugeicons:identity-card` |
| `login-info` | 登录信息 | `i-cuida:login-outline` |
| `maxkey` | MaxKey | `i-ph:identification-card` |
| `topiam` | TopIAM | `i-ph:shield-star` |

使用示例：

```vue
<template>
  <!-- 系统管理菜单 -->
  <el-menu>
    <el-sub-menu index="system">
      <template #title>
        <i class="i-ic:outline-settings mr-2" />
        <span>系统管理</span>
      </template>

      <el-menu-item index="/system/user">
        <i class="i-lucide:users mr-2" />
        <span>用户管理</span>
      </el-menu-item>

      <el-menu-item index="/system/role">
        <i class="i-eos-icons:role-binding-outlined mr-2" />
        <span>角色管理</span>
      </el-menu-item>

      <el-menu-item index="/system/dept">
        <i class="i-mingcute:department-line mr-2" />
        <span>部门管理</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
```

### 数据与图表 (18个)

用于数据可视化、图表展示场景：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `chart` | 图表 | `i-solar:chart-outline` |
| `pie-chart` | 饼图 | `i-hugeicons:pie-chart-02` |
| `bar-chart` | 柱状图 | `i-heroicons:chart-bar` |
| `line-chart` | 折线图 | `i-mdi:chart-line` |
| `data-analysis` | 数据分析 | `i-icon-park-solid:market-analysis` |
| `database` | 数据库 | `i-solar:database-broken` |
| `tree` | 树形结构 | `i-tabler:binary-tree` |
| `tree-table` | 树形表格 | `i-mdi:file-tree` |
| `dict` | 字典 | `i-streamline:dictionary-language-book` |
| `model` | 模型 | `i-carbon:model-alt` |
| `number` | 数字 | `i-mdi:numeric` |
| `redis` | Redis | `i-devicon-plain:redis` |
| `redis-list` | Redis列表 | `i-icon-park-outline:database-time` |

使用示例：

```vue
<template>
  <!-- 数据概览卡片 -->
  <el-row :gutter="16">
    <el-col :span="6">
      <el-card>
        <i class="i-hugeicons:pie-chart-02 text-4xl text-primary" />
        <div class="stat-value">{{ stats.orders }}</div>
        <div class="stat-label">订单统计</div>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card>
        <i class="i-mdi:chart-line text-4xl text-success" />
        <div class="stat-value">{{ stats.revenue }}</div>
        <div class="stat-label">营收趋势</div>
      </el-card>
    </el-col>
  </el-row>
</template>
```

### 状态与提示 (15个)

用于状态指示、消息提示场景：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `loading` | 加载中 | `i-ep:loading` |
| `finish` | 完成 | `i-ph:check-circle` |
| `error` | 错误 | `i-ph:x-circle` |
| `warning` | 警告 | `i-ph:warning` |
| `info` | 信息 | `i-ph:info` |
| `online` | 在线 | `i-majesticons:status-online-line` |
| `waiting` | 等待 | `i-ph:hourglass-high` |
| `disabled` | 禁用 | `i-ph:prohibit` |
| `confirm` | 确认 | `i-ph:check` |
| `cancel` | 取消 | `i-ph:x` |
| `eye-off` | 隐藏 | `i-iconamoon:eye-off` |
| `eye-open` | 显示 | `i-iconamoon:eye` |

使用示例：

```vue
<template>
  <!-- 状态标签 -->
  <el-tag :type="getStatusType(row.status)">
    <i :class="getStatusIcon(row.status)" class="mr-1" />
    {{ getStatusText(row.status) }}
  </el-tag>
</template>

<script setup lang="ts">
const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    'success': 'i-ph:check-circle',
    'error': 'i-ph:x-circle',
    'warning': 'i-ph:warning',
    'info': 'i-ph:info',
    'loading': 'i-ep:loading animate-spin',
    'waiting': 'i-ph:hourglass-high',
  }
  return iconMap[status] || 'i-ph:info'
}
</script>
```

### 操作与交互 (20个)

用于常见操作按钮和交互场景：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `import` | 导入 | `i-ph:arrow-square-in` |
| `export` | 导出 | `i-ph:arrow-square-out` |
| `drag` | 拖拽 | `i-hugeicons:drag-right-02` |
| `drag-handle` | 拖拽手柄 | `i-hugeicons:drag-right-04` |
| `cut` | 剪切 | `i-ph:scissors` |
| `clipboard` | 剪贴板 | `i-tabler:clipboard-check` |
| `sort` | 排序 | `i-mdi:sort-bool-ascending-variant` |
| `more-actions` | 更多操作 | `i-mingcute:dots-vertical-fill` |
| `take-photo` | 拍照 | `i-ph:camera` |
| `scan-code` | 扫码购 | `i-ph:qr-code` |
| `send` | 发送 | `i-streamline:mail-send-email-send-email-paper-airplane` |

使用示例：

```vue
<template>
  <!-- 工具栏操作按钮 -->
  <div class="toolbar">
    <el-button type="primary" @click="handleImport">
      <i class="i-ph:arrow-square-in mr-1" />
      导入
    </el-button>

    <el-button @click="handleExport">
      <i class="i-ph:arrow-square-out mr-1" />
      导出
    </el-button>

    <el-dropdown trigger="click">
      <el-button>
        <i class="i-mingcute:dots-vertical-fill" />
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <i class="i-ph:scissors mr-2" />
            剪切
          </el-dropdown-item>
          <el-dropdown-item>
            <i class="i-tabler:clipboard-check mr-2" />
            复制
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
```

### 社交与通讯 (18个)

用于社交平台、通讯相关场景：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `chat` | 聊天 | `i-ph:chats` |
| `notification` | 通知 | `i-cuida:notification-bell-outline` |
| `sms` | 短信 | `i-tabler:message-chatbot` |
| `wechat-fill` | 微信 | `i-ic:baseline-wechat` |
| `weibo` | 微博 | `i-simple-icons:sinaweibo` |
| `twitter` | Twitter | `i-tabler:brand-twitter` |
| `facebook` | Facebook | `i-proicons:facebook` |
| `linkedin` | LinkedIn | `i-tabler:brand-linkedin` |
| `instagram` | Instagram | `i-mdi:instagram` |
| `taobao` | 淘宝 | `i-ri:taobao-line` |
| `moments` | 朋友圈 | `i-mingcute:moment-line` |
| `heart` | 喜欢 | `i-ph:heart` |
| `share-social` | 社交分享 | `i-ph:share-network` |

使用示例：

```vue
<template>
  <!-- 社交登录按钮 -->
  <div class="social-login">
    <el-button class="wechat-btn" @click="loginWithWechat">
      <i class="i-ic:baseline-wechat text-xl" />
    </el-button>

    <el-button class="weibo-btn" @click="loginWithWeibo">
      <i class="i-simple-icons:sinaweibo text-xl" />
    </el-button>

    <el-button class="github-btn" @click="loginWithGithub">
      <i class="i-ion:ios-git-branch text-xl" />
    </el-button>
  </div>

  <!-- 分享按钮 -->
  <div class="share-actions">
    <el-button circle @click="shareToWeibo">
      <i class="i-simple-icons:sinaweibo" />
    </el-button>
    <el-button circle @click="shareToMoments">
      <i class="i-mingcute:moment-line" />
    </el-button>
  </div>
</template>
```

### 电商与交易 (20个)

用于商城、支付、物流等电商场景：

| 代码 | 名称 | CSS 类名 |
|-----|------|---------|
| `payment` | 支付 | `i-fluent:payment-32-regular` |
| `wxpay` | 微信支付 | `i-mingcute-wechat-pay-fill` |
| `alipay` | 支付宝支付 | `i-ri-alipay-fill` |
| `shipping` | 物流 | `i-hugeicons:shipping-truck-01` |
| `bag` | 购物袋 | `i-ph:shopping-bag` |
| `shop-window` | 橱窗 | `i-ph:storefront` |
| `discount` | 折扣 | `i-ph:percent` |
| `gift` | 礼品 | `i-ph:gift` |
| `sale` | 促销 | `i-ph:tag` |
| `wishlist` | 收藏夹 | `i-ph:bookmark` |
| `rating` | 评价 | `i-ph:star` |
| `seller` | 卖家 | `i-ph:user-gear` |
| `auction` | 拍卖 | `i-ph:gavel` |
| `refund` | 退款 | `i-ph:arrow-counter-clockwise` |
| `combination` | 套餐 | `i-tdesign:combination` |

使用示例：

```vue
<template>
  <!-- 支付方式选择 -->
  <div class="payment-methods">
    <div class="payment-item" :class="{ active: payMethod === 'wechat' }"
         @click="payMethod = 'wechat'">
      <i class="i-mingcute-wechat-pay-fill text-2xl text-green-500" />
      <span>微信支付</span>
    </div>

    <div class="payment-item" :class="{ active: payMethod === 'alipay' }"
         @click="payMethod = 'alipay'">
      <i class="i-ri-alipay-fill text-2xl text-blue-500" />
      <span>支付宝</span>
    </div>
  </div>

  <!-- 订单状态 -->
  <el-steps :active="orderStep">
    <el-step>
      <template #icon>
        <i class="i-ph:shopping-bag" />
      </template>
      已下单
    </el-step>
    <el-step>
      <template #icon>
        <i class="i-fluent:payment-32-regular" />
      </template>
      已支付
    </el-step>
    <el-step>
      <template #icon>
        <i class="i-hugeicons:shipping-truck-01" />
      </template>
      配送中
    </el-step>
  </el-steps>
</template>
```

## Iconfont 图标分类

### 图标总览

Iconfont 库包含 644 个项目定制图标，采用统一的设计语言，确保视觉一致性：

```
Iconfont 图标库: plus-ui
├── 字体系列: iconfont
├── CSS 前缀: icon-
├── 图标数量: 644 个
└── 字体格式: woff2 / woff / ttf
```

### 常用图标速查

以下是 Iconfont 库中的常用图标：

| 图标类名 | 名称 | Unicode |
|---------|------|---------|
| `icon-elevator3` | 电梯 | `\e8b9` |
| `icon-battery` | 电量 | `\e6e5` |
| `icon-floating-bottle` | 漂流瓶 | `\e7eb` |
| `icon-image` | 图片 | `\e634` |
| `icon-exit-fullscreen` | 退出全屏 | `\e62d` |
| `icon-music` | 音乐 | `\e7ec` |
| `icon-italic` | 斜体 | `\e638` |
| `icon-expand` | 扩展 | `\e8ce` |
| `icon-magic` | 魔术 | `\e7ed` |
| `icon-link-break` | 链接 | `\e63a` |
| `icon-globe` | 地球 | `\e611` |
| `icon-webpage` | 网页 | `\e7ee` |
| `icon-list-remove` | 移除列表 | `\e63e` |

### 使用方式

Iconfont 图标使用 CSS 类名直接引用：

```vue
<template>
  <!-- 基本使用 -->
  <i class="icon-elevator3" />

  <!-- 设置大小和颜色 -->
  <i class="icon-battery text-2xl text-primary" />

  <!-- 结合按钮使用 -->
  <el-button>
    <i class="icon-image mr-1" />
    上传图片
  </el-button>
</template>

<style scoped>
/* 自定义样式 */
.icon-elevator3 {
  font-size: 24px;
  color: var(--el-color-primary);
}
</style>
```

## 工具函数 API

### 类型检查函数

```typescript
import { isValidIconCode, isIconfontIcon, isIconifyIcon } from '@/types/icons'

// 检查是否为有效图标代码
isValidIconCode('elevator3')        // true
isValidIconCode('invalid-icon')     // false

// 检查是否为 Iconfont 图标
isIconfontIcon('elevator3')         // true
isIconfontIcon('dashboard')         // false

// 检查是否为 Iconify 图标
isIconifyIcon('dashboard')          // true
isIconifyIcon('elevator3')          // false
```

### 图标信息获取

```typescript
import { getIconName, getIconifyValue, searchIcons, getAllIconCodes } from '@/types/icons'

// 获取图标名称
getIconName('elevator3')    // '电梯'
getIconName('dashboard')    // '仪表盘'

// 获取 Iconify 图标的 CSS 类名
getIconifyValue('dashboard')   // 'i-tabler:layout-dashboard'
getIconifyValue('elevator3')   // undefined

// 搜索图标
const results = searchIcons('电梯')
// [{ code: 'elevator3', name: '电梯' }]

// 获取所有图标代码
const allCodes = getAllIconCodes()
// ['elevator3', 'battery', 'dashboard', ...]
```

### 图标列表常量

```typescript
import { ICONFONT_ICONS, ICONIFY_ICONS, ALL_ICONS } from '@/types/icons'

// Iconfont 图标列表
console.log(ICONFONT_ICONS.length)  // 644
console.log(ICONFONT_ICONS[0])      // { code: 'elevator3', name: '电梯' }

// Iconify 图标列表（包含 value）
console.log(ICONIFY_ICONS.length)   // 173
console.log(ICONIFY_ICONS[0])       // { code: 'dashboard', name: '仪表盘', value: 'i-tabler:layout-dashboard' }

// 所有图标列表
console.log(ALL_ICONS.length)       // 817
```

## 图标选择器组件

### 组件实现

项目提供图标选择器组件，支持搜索和分页：

```vue
<template>
  <div class="icon-picker">
    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="搜索图标..."
      clearable
      @input="handleSearch"
    >
      <template #prefix>
        <i class="i-ep:search" />
      </template>
    </el-input>

    <!-- 图标网格 -->
    <div class="icon-grid">
      <div
        v-for="icon in filteredIcons"
        :key="icon.code"
        class="icon-item"
        :class="{ active: selectedIcon === icon.code }"
        @click="selectIcon(icon)"
      >
        <i :class="getIconClass(icon)" />
        <span class="icon-name">{{ icon.name }}</span>
      </div>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="totalIcons"
      layout="prev, pager, next"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ALL_ICONS, searchIcons, isIconfontIcon, getIconifyValue } from '@/types/icons'
import type { IconItem } from '@/types/icons'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 60
const selectedIcon = ref('')

const filteredIcons = computed(() => {
  const icons = searchQuery.value
    ? searchIcons(searchQuery.value)
    : ALL_ICONS

  const start = (currentPage.value - 1) * pageSize
  return icons.slice(start, start + pageSize)
})

const totalIcons = computed(() => {
  return searchQuery.value
    ? searchIcons(searchQuery.value).length
    : ALL_ICONS.length
})

const getIconClass = (icon: IconItem) => {
  if (isIconfontIcon(icon.code)) {
    return `icon-${icon.code}`
  }
  return getIconifyValue(icon.code) || ''
}

const selectIcon = (icon: IconItem) => {
  selectedIcon.value = icon.code
  emit('select', icon)
}

const emit = defineEmits<{
  select: [icon: IconItem]
}>()
</script>
```

### 使用示例

```vue
<template>
  <div class="menu-form">
    <el-form-item label="菜单图标">
      <el-popover trigger="click" width="400">
        <template #reference>
          <el-input v-model="form.icon" readonly placeholder="选择图标">
            <template #prefix>
              <i :class="getDisplayIcon(form.icon)" />
            </template>
          </el-input>
        </template>

        <IconPicker @select="handleIconSelect" />
      </el-popover>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import IconPicker from '@/components/IconPicker/index.vue'
import { isIconfontIcon, getIconifyValue } from '@/types/icons'
import type { IconItem } from '@/types/icons'

const form = ref({
  icon: ''
})

const getDisplayIcon = (code: string) => {
  if (!code) return ''
  if (isIconfontIcon(code)) return `icon-${code}`
  return getIconifyValue(code) || ''
}

const handleIconSelect = (icon: IconItem) => {
  form.value.icon = icon.code
}
</script>
```

## 性能优化

### Iconify 按需加载

Iconify 图标采用按需加载策略，仅在使用时加载对应的 SVG 数据：

```vue
<template>
  <!-- 仅加载 home 图标的 SVG -->
  <i class="i-ep:home" />
</template>
```

### Iconfont 字体优化

字体文件使用 `font-display: swap` 优化加载体验：

```css
@font-face {
  font-family: 'iconfont';
  src: url('./iconfont.woff2') format('woff2'),
       url('./iconfont.woff') format('woff'),
       url('./iconfont.ttf') format('truetype');
  font-display: swap;  /* 字体加载时先显示系统字体 */
}
```

### 预加载关键图标

对于关键路径上的图标，可以添加到 safelist 确保预加载：

```typescript
// uno.config.ts
safelist: [
  // 预加载常用图标
  'i-tabler:layout-dashboard',
  'i-ic:outline-settings',
  'i-lucide:users',
  'i-ph:folder',
  // ...
]
```

### 图标缓存策略

对于字体文件和 SVG 数据，浏览器会自动缓存。可以通过 Service Worker 进一步优化：

```typescript
// sw.js
const iconCache = 'icons-v1'

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/icons/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          caches.open(iconCache).then((cache) => {
            cache.put(event.request, fetchResponse.clone())
          })
          return fetchResponse
        })
      })
    )
  }
})
```

## 最佳实践

### 1. 优先使用 Iconify

对于通用 UI 图标，优先选择 Iconify 图标集，享受按需加载的优势：

```vue
<!-- ✅ 推荐：使用 Iconify -->
<i class="i-ph:check-circle" />

<!-- ⚠️ 仅在需要自定义图标时使用 Iconfont -->
<i class="icon-custom-logo" />
```

### 2. 类型安全

始终使用 TypeScript 类型确保图标代码正确：

```typescript
import type { IconCode } from '@/types/icons'

// ✅ 类型安全
const icon: IconCode = 'dashboard'

// ❌ 类型错误
const icon: IconCode = 'not-exist'  // TypeScript 报错
```

### 3. 语义化命名

图标名称应清晰表达其用途：

```vue
<!-- ✅ 语义化命名 -->
<i class="i-ph:check-circle" />  <!-- 完成状态 -->
<i class="i-ph:x-circle" />      <!-- 错误状态 -->

<!-- ❌ 避免无意义命名 -->
<i class="icon-abc123" />
```

### 4. 封装图标组件

对于常用的图标+文本组合，建议封装为组件：

```vue
<!-- components/StatusIcon.vue -->
<template>
  <span class="status-icon" :class="type">
    <i :class="iconClass" />
    <span v-if="text">{{ text }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'success' | 'error' | 'warning' | 'info'
  text?: string
}>()

const iconClass = computed(() => {
  const iconMap = {
    success: 'i-ph:check-circle',
    error: 'i-ph:x-circle',
    warning: 'i-ph:warning',
    info: 'i-ph:info',
  }
  return iconMap[props.type]
})
</script>
```

### 5. 定期维护

定期清理未使用的图标，保持代码库整洁：

```bash
# 查找未使用的图标
grep -r "icon-" src/ | grep -v "node_modules"
grep -r "i-" src/ | grep -v "node_modules"
```

## 常见问题

### 1. 图标不显示

**问题原因：**
- Iconfont 字体文件未正确加载
- Iconify 图标类名拼写错误
- CSS 未正确引入

**解决方案：**

```vue
<script setup lang="ts">
// 1. 确认字体样式已引入
import '@/assets/icons/system/iconfont.css'

// 2. 检查图标类名
import { isValidIconCode } from '@/types/icons'

const iconCode = 'dashboard'
if (!isValidIconCode(iconCode)) {
  console.warn(`无效的图标代码: ${iconCode}`)
}
</script>
```

### 2. 类型提示不生效

**问题原因：**
- 类型文件未生成
- IDE 缓存问题

**解决方案：**

```bash
# 重新构建以生成类型
pnpm dev

# 或手动触发类型生成
pnpm build
```

### 3. 图标颜色无法修改

**问题原因：**
- Iconfont 图标需要使用 `color` 属性
- Iconify 图标使用 `currentColor`

**解决方案：**

```vue
<template>
  <!-- Iconfont 修改颜色 -->
  <i class="icon-elevator3" style="color: red;" />

  <!-- Iconify 修改颜色(继承父元素) -->
  <span style="color: red;">
    <i class="i-ph:check-circle" />
  </span>

  <!-- 或使用 UnoCSS 类 -->
  <i class="i-ph:check-circle text-red-500" />
</template>
```

### 4. 图标大小不一致

**问题原因：**
- 不同图标系统的默认大小不同

**解决方案：**

```css
/* 统一图标大小 */
.icon-wrapper i {
  width: 1em;
  height: 1em;
  font-size: inherit;
}

/* 或使用 UnoCSS */
```

```vue
<template>
  <i class="icon-elevator3 text-xl" />
  <i class="i-ph:check-circle text-xl" />
</template>
```

### 5. 新增图标后类型未更新

**问题原因：**
- Vite 热更新可能未触发

**解决方案：**

```bash
# 重启开发服务器
pnpm dev

# 检查 JSON 文件格式是否正确
cat src/assets/icons/system/iconfont.json | jq .
```

## 扩展图标库

### 添加 Iconfont 图标

1. 在 [iconfont.cn](https://www.iconfont.cn/) 管理项目图标
2. 下载更新后的字体文件和 JSON
3. 替换 `src/assets/icons/system/` 下的文件
4. 重启开发服务器，类型自动更新

### 添加 Iconify 预设

1. 编辑 `src/assets/icons/iconify/preset.json`
2. 添加新图标配置：

```json
{
  "icons": [
    // ... 现有图标
    {
      "code": "new-icon",
      "name": "新图标",
      "value": "i-ph:new-icon"
    }
  ]
}
```

3. 保存后类型自动更新

### 添加新图标集

1. 安装图标集包：

```bash
pnpm add @iconify-json/heroicons
```

2. 在 `uno.config.ts` 中配置：

```typescript
presetIcons({
  collections: {
    heroicons: () => import('@iconify-json/heroicons/icons.json').then(i => i.default),
  }
})
```

3. 使用新图标：

```vue
<i class="i-heroicons:home" />
```

掌握图标系统能够高效管理和使用项目中的所有图标资源，提升开发效率和用户体验。
