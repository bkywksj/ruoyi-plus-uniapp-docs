# Iconify 配置

Iconify 是一个强大的图标框架，提供超过 200,000 个开源图标。项目通过 UnoCSS 的 presetIcons 预设集成 Iconify，实现按需加载的 SVG 图标系统，支持类型安全和智能提示。

## 核心特性

**完整的图标生态系统：**

- **海量图标资源** - 支持 150+ 图标集，包含 Element Plus、Material Design、Carbon、Heroicons 等主流图标库
- **按需加载** - 仅打包实际使用的图标 SVG，最小化构建体积
- **UnoCSS 原子化集成** - 通过 CSS 类名 `i-{collection}-{icon}` 即可使用图标
- **类型安全** - 自动生成 TypeScript 类型定义，提供完整的智能提示
- **预设管理** - 支持自定义预设图标集合，统一管理常用图标
- **热更新支持** - 开发时修改图标配置立即生效，无需重启服务

## 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Iconify 图标系统                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │   图标 JSON 源    │    │         UnoCSS 配置               │  │
│  │                  │    │                                  │  │
│  │  ├─ iconfont/    │    │  uno.config.ts                   │  │
│  │  │  └─ *.json    │───▶│  ├─ presetIcons({})             │  │
│  │  │               │    │  │   ├─ collections             │  │
│  │  └─ iconify/     │    │  │   ├─ extraProperties         │  │
│  │     └─ preset.json    │  │   └─ scale/unit              │  │
│  │                  │    │  │                              │  │
│  └────────┬─────────┘    │  └─ safelist: ICONIFY_ICONS     │  │
│           │              │                                  │  │
│           │              └──────────────────────────────────┘  │
│           ▼                                                    │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │ iconfont-types   │    │       icons.d.ts                 │  │
│  │   Vite 插件      │───▶│                                  │  │
│  │                  │    │  ├─ type IconCode               │  │
│  │  ├─ buildStart   │    │  ├─ ICONFONT_ICONS[]            │  │
│  │  └─ HMR 监听     │    │  ├─ ICONIFY_ICONS[]             │  │
│  │                  │    │  └─ 工具函数                     │  │
│  └──────────────────┘    └──────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │   Icon 组件      │    │        使用方式                   │  │
│  │                  │    │                                  │  │
│  │  Icon.vue        │    │  <i class="i-ep-home" />        │  │
│  │  ├─ code prop    │    │  <Icon code="dashboard" />      │  │
│  │  ├─ value prop   │    │  <Icon value="i-mdi-user" />    │  │
│  │  └─ 自动识别     │    │                                  │  │
│  └──────────────────┘    └──────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 文件结构

```
plus-ui/
├── uno.config.ts                    # UnoCSS 主配置（含 presetIcons）
├── vite/
│   └── plugins/
│       └── iconfont-types.ts        # 图标类型生成插件
└── src/
    ├── assets/
    │   └── icons/
    │       ├── system/
    │       │   └── iconfont.json    # Iconfont 图标定义
    │       └── iconify/
    │           └── preset.json      # Iconify 预设图标
    ├── types/
    │   └── icons.d.ts               # 自动生成的类型定义
    └── components/
        └── Icon/
            ├── Icon.vue             # 通用图标组件
            └── IconSelect.vue       # 图标选择器组件
```

## UnoCSS 配置详解

### 基础配置

项目通过 `uno.config.ts` 配置 Iconify 图标支持：

```typescript
// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

// 导入预设图标数组以添加到安全列表
import { ICONIFY_ICONS } from './src/types/icons.d'

export default defineConfig({
  /**
   * 预设配置
   * 激活UnoCSS的各种预设功能
   */
  presets: [
    // 默认预设：提供大多数常用的原子化CSS类
    presetUno(),

    // 属性化模式预设：允许将类转换为属性
    // 如 <div m="2" text="sm blue">
    presetAttributify(),

    // 图标预设：支持各种图标集成
    // 如 <div class="i-carbon-home">
    presetIcons({}),

    // 排版预设：提供丰富的文本排版相关样式
    presetTypography(),

    // Web字体预设：支持在线字体的便捷使用
    presetWebFonts({
      fonts: {
        // 可在此处添加自定义网络字体
      }
    })
  ],

  /**
   * 安全列表 - 确保所有图标类名都被包含
   * 即使未在代码中显式使用也会被生成
   */
  safelist: [
    // 添加所有预设图标的类名到安全列表
    ...ICONIFY_ICONS.map((icon) => icon.value)
  ],

  /**
   * 转换器配置
   * 扩展UnoCSS的语法功能
   */
  transformers: [
    // 指令转换器：支持@apply、@screen等指令
    transformerDirectives(),

    // 变体组转换器：简化多变体编写
    // 如 hover:(bg-blue text-white)
    transformerVariantGroup()
  ]
})
```

### presetIcons 高级配置

`presetIcons` 预设支持多种配置选项：

```typescript
// uno.config.ts - 高级图标配置
import { presetIcons } from 'unocss'

presetIcons({
  /**
   * 图标集合配置
   * 定义可用的图标集及其加载方式
   */
  collections: {
    // Element Plus 图标集（推荐）
    ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),

    // Material Design Icons
    mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),

    // Carbon Icons (IBM)
    carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),

    // Heroicons (Tailwind 团队)
    heroicons: () => import('@iconify-json/heroicons/icons.json').then(i => i.default),

    // Tabler Icons
    tabler: () => import('@iconify-json/tabler/icons.json').then(i => i.default),

    // Phosphor Icons
    ph: () => import('@iconify-json/ph/icons.json').then(i => i.default),

    // Fluent UI Icons
    fluent: () => import('@iconify-json/fluent/icons.json').then(i => i.default),

    // Lucide Icons
    lucide: () => import('@iconify-json/lucide/icons.json').then(i => i.default),

    // Solar Icons
    solar: () => import('@iconify-json/solar/icons.json').then(i => i.default),

    // 自定义图标集
    custom: {
      logo: '<svg>...</svg>',
      menu: '<svg>...</svg>'
    }
  },

  /**
   * 图标额外属性
   * 为所有图标添加默认的 CSS 属性
   */
  extraProperties: {
    'display': 'inline-block',
    'vertical-align': 'middle',
    'width': '1em',
    'height': '1em'
  },

  /**
   * 图标缩放比例
   * 默认为 1，可以全局调整图标大小
   */
  scale: 1.2,

  /**
   * 尺寸单位
   * 可选值: 'em' | 'px' | 'rem'
   */
  unit: 'em',

  /**
   * 图标模式
   * 'mask' - 使用 CSS mask（支持颜色自定义）
   * 'background' - 使用背景图片
   * 'auto' - 自动选择（默认）
   */
  mode: 'auto',

  /**
   * 自定义图标
   * 可以定义项目特有的图标
   */
  customizations: {
    // 图标变换
    transform(svg) {
      return svg.replace(/fill="[^"]*"/g, 'fill="currentColor"')
    },
    // 图标集合变换
    iconCustomizer(collection, icon, props) {
      // 为特定图标添加自定义属性
      if (collection === 'ep' && icon === 'loading') {
        props.class = 'animate-spin'
      }
    }
  },

  /**
   * 图标前缀
   * 默认为 'i-'，可以自定义
   */
  prefix: 'i-',

  /**
   * CDN 配置（可选）
   * 使用 CDN 加载图标，适用于在线环境
   */
  cdn: 'https://esm.sh/'
})
```

### 主题与颜色配置

在 `uno.config.ts` 中配置与图标相关的主题变量：

```typescript
// uno.config.ts - 主题配置
export default defineConfig({
  theme: {
    colors: {
      // 状态颜色（可用于图标着色）
      'primary': 'var(--el-color-primary)',
      'success': 'var(--color-success)',
      'warning': 'var(--color-warning)',
      'danger': 'var(--color-danger)',
      'info': 'var(--color-info)',

      // 文本颜色（可用于图标着色）
      'text-base': 'var(--text-color)',
      'text-secondary': 'var(--text-color-secondary)',
      'text-muted': 'var(--text-muted)'
    }
  },

  // 图标相关快捷方式
  shortcuts: {
    // 图标按钮基础样式
    'icon-btn': 'cursor-pointer text-lg hover:text-primary transition-colors',
    // 图标居中对齐
    'icon-center': 'inline-flex items-center justify-center',
    // 图标旋转动画
    'icon-spin': 'animate-spin'
  }
})
```

## 依赖安装

### 核心依赖

```bash
# UnoCSS 图标预设（必需）
pnpm add -D @unocss/preset-icons

# Iconify 工具包
pnpm add -D @iconify/utils
```

### 图标集安装

根据项目需求安装对应的图标集：

```bash
# Element Plus 图标集（项目默认使用）
pnpm add -D @iconify-json/ep

# 其他常用图标集
pnpm add -D @iconify-json/mdi        # Material Design Icons (7000+)
pnpm add -D @iconify-json/carbon     # Carbon Icons (2000+)
pnpm add -D @iconify-json/heroicons  # Heroicons (460)
pnpm add -D @iconify-json/tabler     # Tabler Icons (4200+)
pnpm add -D @iconify-json/ph         # Phosphor Icons (6000+)
pnpm add -D @iconify-json/lucide     # Lucide Icons (1200+)
pnpm add -D @iconify-json/solar      # Solar Icons (1000+)
pnpm add -D @iconify-json/fluent     # Fluent UI Icons (5000+)
pnpm add -D @iconify-json/ri         # Remix Icons (2400+)
pnpm add -D @iconify-json/ant-design # Ant Design Icons (789)

# 安装所有图标集（不推荐，体积较大）
pnpm add -D @iconify/json
```

### 图标集对照表

| 图标集 | 包名 | 图标数 | 前缀 | 说明 |
|--------|------|--------|------|------|
| Element Plus | `@iconify-json/ep` | 293 | `i-ep-` | Element Plus 官方图标 |
| Material Design | `@iconify-json/mdi` | 7000+ | `i-mdi-` | Google Material 图标 |
| Carbon | `@iconify-json/carbon` | 2000+ | `i-carbon-` | IBM Carbon 设计系统 |
| Heroicons | `@iconify-json/heroicons` | 460 | `i-heroicons-` | Tailwind 团队出品 |
| Tabler | `@iconify-json/tabler` | 4200+ | `i-tabler-` | 开源线性图标 |
| Phosphor | `@iconify-json/ph` | 6000+ | `i-ph-` | 灵活的图标族 |
| Lucide | `@iconify-json/lucide` | 1200+ | `i-lucide-` | Feather 图标分支 |
| Solar | `@iconify-json/solar` | 1000+ | `i-solar-` | 现代线性图标 |
| Fluent UI | `@iconify-json/fluent` | 5000+ | `i-fluent-` | 微软 Fluent 设计 |
| Remix | `@iconify-json/ri` | 2400+ | `i-ri-` | Remix Design 图标 |
| Ant Design | `@iconify-json/ant-design` | 789 | `i-ant-design-` | Ant Design 图标 |

## 图标命名规则

### 基本格式

Iconify 图标使用统一的命名格式：

```
i-{collection}-{icon-name}

格式说明：
- i-        : Iconify 图标前缀（固定）
- collection: 图标集名称（如 ep、mdi、carbon）
- icon-name : 图标名称（使用连字符分隔）
```

### 命名示例

```vue
<template>
  <!-- Element Plus 图标 -->
  <i class="i-ep-home" />           <!-- 首页 -->
  <i class="i-ep-user" />           <!-- 用户 -->
  <i class="i-ep-setting" />        <!-- 设置 -->
  <i class="i-ep-search" />         <!-- 搜索 -->
  <i class="i-ep-loading" />        <!-- 加载 -->

  <!-- Material Design 图标 -->
  <i class="i-mdi-account" />       <!-- 账户 -->
  <i class="i-mdi-home" />          <!-- 首页 -->
  <i class="i-mdi-cog" />           <!-- 齿轮 -->
  <i class="i-mdi-magnify" />       <!-- 放大镜 -->

  <!-- Carbon 图标 -->
  <i class="i-carbon-user" />       <!-- 用户 -->
  <i class="i-carbon-home" />       <!-- 首页 -->
  <i class="i-carbon-settings" />   <!-- 设置 -->

  <!-- Tabler 图标 -->
  <i class="i-tabler-home" />       <!-- 首页 -->
  <i class="i-tabler-user" />       <!-- 用户 -->
  <i class="i-tabler-settings" />   <!-- 设置 -->

  <!-- Phosphor 图标 -->
  <i class="i-ph-house" />          <!-- 房屋 -->
  <i class="i-ph-user" />           <!-- 用户 -->
  <i class="i-ph-gear" />           <!-- 齿轮 -->
</template>
```

### 图标变体

部分图标集支持多种变体：

```vue
<template>
  <!-- Heroicons 变体 -->
  <i class="i-heroicons-home" />              <!-- 默认 -->
  <i class="i-heroicons-home-solid" />        <!-- 实心 -->
  <i class="i-heroicons-home-outline" />      <!-- 轮廓 -->

  <!-- Phosphor 变体 -->
  <i class="i-ph-house" />                    <!-- 常规 -->
  <i class="i-ph-house-bold" />               <!-- 粗体 -->
  <i class="i-ph-house-fill" />               <!-- 填充 -->
  <i class="i-ph-house-thin" />               <!-- 细线 -->
  <i class="i-ph-house-light" />              <!-- 轻量 -->
  <i class="i-ph-house-duotone" />            <!-- 双色 -->

  <!-- Material Design 变体 -->
  <i class="i-mdi-account" />                 <!-- 默认 -->
  <i class="i-mdi-account-outline" />         <!-- 轮廓 -->
  <i class="i-mdi-account-circle" />          <!-- 圆形 -->
  <i class="i-mdi-account-box" />             <!-- 方形 -->
</template>
```

## 预设图标配置

### preset.json 文件结构

项目使用 `preset.json` 文件定义常用的 Iconify 预设图标：

```json
// src/assets/icons/iconify/preset.json
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
      "code": "users",
      "name": "用户组",
      "value": "i-lucide:users"
    },
    {
      "code": "setting",
      "name": "系统设置",
      "value": "i-ic:outline-settings"
    },
    {
      "code": "notification",
      "name": "通知",
      "value": "i-cuida:notification-bell-outline"
    },
    {
      "code": "workflow",
      "name": "工作流",
      "value": "i-hugeicons:workflow-square-01"
    }
  ]
}
```

### 预设图标分类

项目预设图标涵盖多个业务场景：

```json
{
  "icons": [
    // ===== 导航类图标 =====
    { "code": "dashboard", "name": "仪表盘", "value": "i-tabler:layout-dashboard" },
    { "code": "breadcrumb", "name": "面包屑", "value": "i-tdesign:component-breadcrumb" },
    { "code": "hamburger", "name": "汉堡包", "value": "i-ri:menu-fold-2-fill" },
    { "code": "nested", "name": "嵌套菜单", "value": "i-mdi:menu-open" },

    // ===== 箭头方向图标 =====
    { "code": "caret-back", "name": "后退箭头", "value": "i-mdi:chevron-left" },
    { "code": "caret-forward", "name": "前进箭头", "value": "i-mdi:chevron-right" },
    { "code": "caret-up", "name": "向上箭头", "value": "i-mdi:chevron-up" },
    { "code": "caret-down", "name": "向下箭头", "value": "i-mdi:chevron-down" },
    { "code": "arrow-up", "name": "向上箭头", "value": "i-mdi:arrow-up" },
    { "code": "arrow-down", "name": "向下箭头", "value": "i-mdi:arrow-down" },

    // ===== 表单类图标 =====
    { "code": "input", "name": "输入框", "value": "i-ph:textbox" },
    { "code": "textarea", "name": "文本域", "value": "i-bi:textarea-t" },
    { "code": "select", "name": "选择器", "value": "i-mdi:form-select" },
    { "code": "cascader", "name": "级联选择", "value": "i-ion:ios-arrow-dropdown" },
    { "code": "form", "name": "表单", "value": "i-fluent:form-28-regular" },
    { "code": "rate", "name": "评分", "value": "i-solar:medal-ribbons-star-bold" },
    { "code": "slider", "name": "滑块", "value": "i-stash:sliders-h" },

    // ===== 数据展示图标 =====
    { "code": "chart", "name": "图表", "value": "i-solar:chart-outline" },
    { "code": "pie-chart", "name": "饼图", "value": "i-hugeicons:pie-chart-02" },
    { "code": "bar-chart", "name": "柱状图", "value": "i-heroicons:chart-bar" },
    { "code": "line-chart", "name": "折线图", "value": "i-mdi:chart-line" },
    { "code": "tree", "name": "树形结构", "value": "i-tabler:binary-tree" },
    { "code": "tree-table", "name": "树形表格", "value": "i-mdi:file-tree" },

    // ===== 文件类图标 =====
    { "code": "folder", "name": "文件夹", "value": "i-ph:folder" },
    { "code": "folder-open", "name": "打开的文件夹", "value": "i-ph:folder-open" },
    { "code": "excel", "name": "表格文件", "value": "i-ph:file-xls" },
    { "code": "word", "name": "Word文档", "value": "i-ph:file-doc" },
    { "code": "pdf", "name": "PDF文件", "value": "i-tabler:file-type-pdf" },
    { "code": "ppt", "name": "PPT演示文稿", "value": "i-ph:file-ppt" },
    { "code": "zip", "name": "压缩包", "value": "i-ph:file-zip" },
    { "code": "code-file", "name": "代码文件", "value": "i-ph:file-code" },

    // ===== 用户权限图标 =====
    { "code": "users", "name": "用户组", "value": "i-lucide:users" },
    { "code": "role", "name": "角色", "value": "i-eos-icons:role-binding-outlined" },
    { "code": "department", "name": "部门", "value": "i-mingcute:department-line" },
    { "code": "permission", "name": "权限", "value": "i-ph:key" },
    { "code": "admin", "name": "管理员", "value": "i-clarity:administrator-line" },

    // ===== 操作类图标 =====
    { "code": "import", "name": "导入", "value": "i-ph:arrow-square-in" },
    { "code": "export", "name": "导出", "value": "i-ph:arrow-square-out" },
    { "code": "confirm", "name": "确认", "value": "i-ph:check" },
    { "code": "cancel", "name": "取消", "value": "i-ph:x" },
    { "code": "sort", "name": "排序", "value": "i-mdi:sort-bool-ascending-variant" },
    { "code": "drag", "name": "拖拽", "value": "i-hugeicons:drag-right-02" },

    // ===== 状态类图标 =====
    { "code": "loading", "name": "加载中", "value": "i-ep:loading" },
    { "code": "finish", "name": "完成", "value": "i-ph:check-circle" },
    { "code": "error", "name": "错误", "value": "i-ph:x-circle" },
    { "code": "warning", "name": "警告", "value": "i-ph:warning" },
    { "code": "info", "name": "信息", "value": "i-ph:info" },
    { "code": "disabled", "name": "禁用", "value": "i-ph:prohibit" },
    { "code": "online", "name": "在线", "value": "i-majesticons:status-online-line" },

    // ===== 系统设置图标 =====
    { "code": "setting", "name": "系统设置", "value": "i-ic:outline-settings" },
    { "code": "theme", "name": "主题", "value": "i-material-symbols:palette-outline" },
    { "code": "dark-mode", "name": "深色模式", "value": "i-mdi:weather-night" },
    { "code": "light-mode", "name": "浅色模式", "value": "i-mdi:weather-sunny" },
    { "code": "international", "name": "国际化", "value": "i-mdi:web" },
    { "code": "color", "name": "颜色", "value": "i-famicons:color-filter-outline" },

    // ===== 社交媒体图标 =====
    { "code": "wechat-fill", "name": "微信", "value": "i-ic:baseline-wechat" },
    { "code": "weibo", "name": "微博", "value": "i-simple-icons:sinaweibo" },
    { "code": "twitter", "name": "Twitter", "value": "i-tabler:brand-twitter" },
    { "code": "facebook", "name": "Facebook", "value": "i-proicons:facebook" },
    { "code": "linkedin", "name": "LinkedIn", "value": "i-tabler:brand-linkedin" },
    { "code": "gitee", "name": "码云", "value": "i-simple-icons:gitee" },

    // ===== 开发工具图标 =====
    { "code": "api", "name": "API", "value": "i-material-symbols-light:api-rounded" },
    { "code": "git", "name": "Git", "value": "i-ion:ios-git-branch" },
    { "code": "terminal", "name": "终端", "value": "i-ci:terminal" },
    { "code": "debug", "name": "调试", "value": "i-codicon:debug-alt-small" },
    { "code": "deploy", "name": "部署", "value": "i-material-symbols:deployed-code-outline" },
    { "code": "bug", "name": "故障", "value": "i-material-symbols:bug-report-outline-rounded" },
    { "code": "build", "name": "构建", "value": "i-qlementine-icons:build-16" },

    // ===== 电商类图标 =====
    { "code": "payment", "name": "支付", "value": "i-fluent:payment-32-regular" },
    { "code": "shipping", "name": "物流", "value": "i-hugeicons:shipping-truck-01" },
    { "code": "discount", "name": "折扣", "value": "i-ph:percent" },
    { "code": "gift", "name": "礼品", "value": "i-ph:gift" },
    { "code": "bag", "name": "购物袋", "value": "i-ph:shopping-bag" },
    { "code": "refund", "name": "退款", "value": "i-ph:arrow-counter-clockwise" }
  ]
}
```

## 类型定义生成

### iconfont-types 插件

项目使用自定义 Vite 插件自动生成图标类型定义：

```typescript
// vite/plugins/iconfont-types.ts
import type { Plugin } from 'vite'
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'

interface IconItem {
  code: string
  name: string
}

interface IconifyIconItem extends IconItem {
  value: string // iconify 图标还有 value 属性
}

export default (): Plugin => {
  const iconsDir = 'src/assets/icons'
  const outputPath = 'src/types/icons.d.ts'
  let projectRoot = ''

  /**
   * 解析 iconify JSON 文件
   */
  const parseIconifyJson = (jsonPath: string): IconifyIconItem[] => {
    try {
      const content = readFileSync(jsonPath, 'utf-8')
      const data = JSON.parse(content)

      if (data.type === 'iconify' && data.icons && Array.isArray(data.icons)) {
        return data.icons.map((icon) => ({
          code: icon.code,
          name: icon.name,
          value: icon.value
        }))
      }

      return []
    } catch (error) {
      console.warn(`解析 iconify 文件失败: ${jsonPath}`, error)
      return []
    }
  }

  /**
   * 递归扫描目录获取所有图标
   */
  const getAllIcons = (iconsPath: string) => {
    const iconfontIcons: IconItem[] = []
    const iconifyIcons: IconifyIconItem[] = []
    const seenCodes = new Set<string>()

    const scanDirectory = (dirPath: string) => {
      const items = readdirSync(dirPath)

      items.forEach((item) => {
        const itemPath = join(dirPath, item)

        if (statSync(itemPath).isDirectory()) {
          scanDirectory(itemPath) // 递归扫描子目录
        } else if (item.endsWith('.json')) {
          // 解析 JSON 文件
          const iconifyIconsFromFile = parseIconifyJson(itemPath)
          if (iconifyIconsFromFile.length > 0) {
            iconifyIcons.push(...iconifyIconsFromFile)
          }
        }
      })
    }

    scanDirectory(iconsPath)

    // 合并并去重
    const allIcons: IconItem[] = []
    iconifyIcons.forEach((icon) => {
      if (!seenCodes.has(icon.code)) {
        seenCodes.add(icon.code)
        allIcons.push({ code: icon.code, name: icon.name })
      }
    })

    return { iconfontIcons, iconifyIcons, allIcons }
  }

  return {
    name: 'iconfont-types',

    configResolved(config) {
      projectRoot = config.root
    },

    buildStart() {
      // 构建时生成类型文件
      writeTypeFile()
    },

    handleHotUpdate({ file }) {
      // 监听图标文件变化，热更新时重新生成
      const iconsPath = resolve(projectRoot, iconsDir)
      if (file.startsWith(iconsPath) && file.endsWith('.json')) {
        console.log(`检测到图标文件变化: ${relative(projectRoot, file)}`)
        writeTypeFile()
      }
    }
  }
}
```

### 生成的类型文件

插件自动生成的 `icons.d.ts` 文件结构：

```typescript
// src/types/icons.d.ts（自动生成）
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
    | 'dashboard'
    | 'users'
    | 'setting'
    | 'notification'
    | 'workflow'
    // ... 更多图标代码
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

/** iconify 预设图标列表 (包含 value 属性) */
export const ICONIFY_ICONS: IconifyIconItem[] = [
  { code: 'dashboard', name: '仪表盘', value: 'i-tabler:layout-dashboard' },
  { code: 'users', name: '用户组', value: 'i-lucide:users' },
  // ... 更多图标
]

/** 所有可用图标列表 (用于图标选择器) */
export const ALL_ICONS: IconItem[] = [
  { code: 'dashboard', name: '仪表盘' },
  { code: 'users', name: '用户组' },
  // ... 更多图标
]

/** 检查代码是否为 iconify 图标 */
export const isIconifyIcon = (code: string): boolean => {
  return ICONIFY_ICONS.some((icon) => icon.code === code)
}

/** 获取 iconify 图标的 value */
export const getIconifyValue = (code: string): string | undefined => {
  return ICONIFY_ICONS.find((icon) => icon.code === code)?.value
}

/** 搜索图标 */
export const searchIcons = (query: string): IconItem[] => {
  const searchTerm = query.toLowerCase()
  return ALL_ICONS.filter((icon) =>
    icon.code.toLowerCase().includes(searchTerm) ||
    icon.name.toLowerCase().includes(searchTerm)
  )
}

/** 获取所有图标代码 */
export const getAllIconCodes = (): IconCode[] => {
  return ALL_ICONS.map((icon) => icon.code as IconCode)
}

export {}
```

## 使用方式

### 基础用法

```vue
<template>
  <!-- 方式一：直接使用 CSS 类名 -->
  <i class="i-ep-home" />
  <i class="i-mdi-account" />
  <i class="i-carbon-user" />

  <!-- 方式二：使用 Icon 组件 + code 属性 -->
  <Icon code="dashboard" />
  <Icon code="users" />
  <Icon code="setting" />

  <!-- 方式三：使用 Icon 组件 + value 属性 -->
  <Icon value="i-ep-home" />
  <Icon value="i-tabler:layout-dashboard" />
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
</script>
```

### 尺寸控制

```vue
<template>
  <!-- 预设尺寸 -->
  <Icon code="dashboard" size="xs" />   <!-- 12px -->
  <Icon code="dashboard" size="sm" />   <!-- 16px -->
  <Icon code="dashboard" size="md" />   <!-- 20px -->
  <Icon code="dashboard" size="lg" />   <!-- 24px -->
  <Icon code="dashboard" size="xl" />   <!-- 32px -->
  <Icon code="dashboard" size="2xl" />  <!-- 40px -->

  <!-- 数字尺寸（px） -->
  <Icon code="dashboard" :size="18" />
  <Icon code="dashboard" :size="24" />

  <!-- 字符串尺寸 -->
  <Icon code="dashboard" size="1.5rem" />
  <Icon code="dashboard" size="2em" />

  <!-- CSS 类控制尺寸 -->
  <i class="i-ep-home text-20px" />
  <i class="i-ep-home text-2xl" />
  <i class="i-ep-home w-6 h-6" />
</template>
```

### 颜色定制

```vue
<template>
  <!-- 使用 color 属性 -->
  <Icon code="dashboard" color="#409eff" />
  <Icon code="users" color="var(--el-color-primary)" />
  <Icon code="warning" color="orange" />

  <!-- 使用 CSS 类 -->
  <i class="i-ep-home text-blue-500" />
  <i class="i-ep-home text-primary" />
  <i class="i-ep-home text-danger" />

  <!-- 使用内联样式 -->
  <i class="i-ep-home" style="color: #67c23a" />

  <!-- 继承父元素颜色 -->
  <div class="text-red-500">
    <i class="i-ep-warning" />  <!-- 继承红色 -->
  </div>
</template>
```

### 动画效果

```vue
<template>
  <!-- 使用 animate 属性 -->
  <Icon code="loading" animate="shake" />
  <Icon code="refresh" animate="rotate180" />
  <Icon code="notification" animate="breathing" />
  <Icon code="language" animate="moveUp" />
  <Icon code="fullscreen" animate="expand" />
  <Icon code="fullscreen-exit" animate="shrink" />

  <!-- 使用 CSS 类 -->
  <i class="i-ep-loading animate-spin" />
  <i class="i-ep-refresh hover:rotate-180 transition-transform" />
</template>
```

### 动态图标

```vue
<template>
  <Icon :code="currentIcon" />

  <el-button @click="toggleIcon">
    切换图标
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const icons = ['dashboard', 'users', 'setting', 'notification'] as const
const currentIndex = ref(0)
const currentIcon = computed(() => icons[currentIndex.value])

const toggleIcon = () => {
  currentIndex.value = (currentIndex.value + 1) % icons.length
}
</script>
```

### 条件渲染

```vue
<template>
  <!-- 状态图标 -->
  <Icon :code="status === 'success' ? 'finish' : 'error'" />

  <!-- 展开/折叠图标 -->
  <Icon :code="isExpanded ? 'caret-up' : 'caret-down'" />

  <!-- 主题图标 -->
  <Icon :code="isDark ? 'dark-mode' : 'light-mode'" />
</template>

<script setup lang="ts">
const status = ref<'success' | 'error'>('success')
const isExpanded = ref(false)
const isDark = ref(false)
</script>
```

## 性能优化

### 按需加载

Iconify 通过 UnoCSS 实现真正的按需加载：

```typescript
// ✅ 推荐：仅使用的图标会被打包
<i class="i-ep-home" />    // 仅加载 home 图标的 SVG
<i class="i-ep-user" />    // 仅加载 user 图标的 SVG

// ❌ 避免：导入整个图标集
import * as icons from '@iconify-json/ep'  // 会加载所有 293 个图标
```

### 预加载策略

对于动态使用的图标，需要添加到 safelist：

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 方式一：预加载所有预设图标
    ...ICONIFY_ICONS.map((icon) => icon.value),

    // 方式二：仅预加载常用图标
    'i-ep-home',
    'i-ep-user',
    'i-ep-setting',
    'i-ep-search',
    'i-ep-loading',

    // 方式三：使用正则匹配
    /^i-ep-/,  // 所有 Element Plus 图标
  ]
})
```

### 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 图标单独打包，利用浏览器缓存
        manualChunks: {
          'vendor-icons': ['@iconify-json/ep']
        }
      }
    }
  },

  // 依赖预构建优化
  optimizeDeps: {
    include: [
      '@iconify-json/ep'
    ]
  }
})
```

### 缓存策略

```typescript
// 启用持久化缓存
export default defineConfig({
  cacheDir: 'node_modules/.vite',

  build: {
    // 启用构建缓存
    cache: true
  }
})
```

## 图标搜索

### 在线搜索

- [Icônes](https://icones.js.org/) - 图标搜索和预览（推荐）
- [Iconify](https://icon-sets.iconify.design/) - 官方图标浏览器
- [Iconbuddy](https://iconbuddy.app/) - 免费图标搜索

### 本地搜索

```typescript
import { searchIcons, ALL_ICONS } from '@/types/icons.d'

// 搜索图标
const results = searchIcons('user')
// 返回: [{ code: 'users', name: '用户组' }, { code: 'admin', name: '管理员' }, ...]

// 按名称搜索
const results = searchIcons('设置')
// 返回: [{ code: 'setting', name: '系统设置' }, ...]

// 获取所有图标
console.log(ALL_ICONS.length)  // 817
```

### 图标选择器集成

```vue
<template>
  <IconSelect v-model="selectedIcon" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconSelect from '@/components/Icon/IconSelect.vue'

const selectedIcon = ref<string>('')
</script>
```

## 添加新图标

### 步骤一：更新 preset.json

```json
// src/assets/icons/iconify/preset.json
{
  "icons": [
    // 添加新图标
    {
      "code": "new-feature",
      "name": "新功能",
      "value": "i-mdi:new-box"
    }
  ]
}
```

### 步骤二：重启开发服务器

```bash
# 重启后会自动生成新的类型定义
pnpm dev
```

### 步骤三：使用新图标

```vue
<template>
  <Icon code="new-feature" />  <!-- 自动获得类型提示 -->
</template>
```

## 常见问题

### 1. 图标不显示

**问题原因：**
- 图标集未安装
- 图标名称错误
- 未添加到 safelist

**解决方案：**

```bash
# 1. 确认图标集已安装
pnpm add -D @iconify-json/ep

# 2. 检查图标名称是否正确
# 访问 https://icones.js.org/ 搜索确认

# 3. 动态图标需要添加到 safelist
# uno.config.ts
safelist: ['i-ep-home', 'i-ep-user']
```

### 2. 类型提示不生效

**问题原因：**
- icons.d.ts 未正确生成
- TypeScript 配置问题

**解决方案：**

```bash
# 1. 重新生成类型文件
pnpm dev  # 启动开发服务器会自动生成

# 2. 检查 tsconfig.json 配置
{
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts"
  ]
}

# 3. 重启 IDE
```

### 3. 图标尺寸不一致

**问题原因：**
- 不同图标集的默认尺寸不同
- 缺少统一的尺寸设置

**解决方案：**

```typescript
// uno.config.ts
presetIcons({
  extraProperties: {
    'width': '1em',
    'height': '1em',
    'display': 'inline-block',
    'vertical-align': 'middle'
  }
})
```

### 4. 图标颜色无法修改

**问题原因：**
- 图标 SVG 中硬编码了颜色值
- 使用了 background 模式而非 mask 模式

**解决方案：**

```typescript
// uno.config.ts
presetIcons({
  // 强制使用 mask 模式，支持颜色自定义
  mode: 'mask',

  // 或使用自定义转换
  customizations: {
    transform(svg) {
      return svg.replace(/fill="[^"]*"/g, 'fill="currentColor"')
    }
  }
})
```

### 5. 构建体积过大

**问题原因：**
- safelist 包含过多图标
- 导入了整个图标集

**解决方案：**

```typescript
// 1. 精简 safelist
safelist: [
  // 仅预加载必要的动态图标
  ...ICONIFY_ICONS.slice(0, 50).map(icon => icon.value)
]

// 2. 使用动态导入
collections: {
  ep: () => import('@iconify-json/ep/icons.json').then(i => i.default)
}

// 3. 分析构建产物
pnpm build --report
```

### 6. 热更新不生效

**问题原因：**
- iconfont-types 插件配置问题
- 文件监听路径不正确

**解决方案：**

```typescript
// vite.config.ts
import iconfontTypes from './vite/plugins/iconfont-types'

export default defineConfig({
  plugins: [
    iconfontTypes()  // 确保插件已添加
  ]
})
```

## API 参考

### presetIcons 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `collections` | `Record<string, IconifyJSON>` | `{}` | 图标集合配置 |
| `extraProperties` | `Record<string, string>` | `{}` | 额外 CSS 属性 |
| `scale` | `number` | `1` | 图标缩放比例 |
| `unit` | `'em' \| 'px' \| 'rem'` | `'em'` | 尺寸单位 |
| `mode` | `'mask' \| 'background' \| 'auto'` | `'auto'` | 图标渲染模式 |
| `prefix` | `string` | `'i-'` | 图标类名前缀 |
| `cdn` | `string` | `undefined` | CDN 地址 |
| `customizations` | `object` | `{}` | 自定义转换 |

### Icon 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `code` | `IconCode` | - | 图标代码 |
| `value` | `string` | - | 图标完整类名 |
| `size` | `SizePreset \| string \| number` | `'1.3em'` | 图标尺寸 |
| `color` | `string` | - | 图标颜色 |
| `animate` | `AnimateType` | - | 动画效果 |

### 导出的工具函数

| 函数 | 类型 | 说明 |
|------|------|------|
| `isIconifyIcon` | `(code: string) => boolean` | 检查是否为 Iconify 图标 |
| `getIconifyValue` | `(code: string) => string \| undefined` | 获取图标 value |
| `searchIcons` | `(query: string) => IconItem[]` | 搜索图标 |
| `getAllIconCodes` | `() => IconCode[]` | 获取所有图标代码 |
| `getIconName` | `(code: IconCode) => string` | 获取图标名称 |
| `isValidIconCode` | `(code: string) => code is IconCode` | 验证图标代码 |

Iconify 通过 UnoCSS 集成提供了现代、高效、类型安全的图标解决方案，是构建企业级应用的理想选择。
