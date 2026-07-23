# UnoCSS 配置

## 介绍

RuoYi-Plus-UniApp 前端项目使用 **UnoCSS** 作为原子化 CSS 引擎,提供即时、按需的原子化 CSS 工具类生成能力。UnoCSS 是一个极快且灵活的 CSS 引擎,支持自定义规则、快捷方式、主题配置和多种预设,为项目提供了强大的样式开发体验。

**核心特性:**

- **即时生成** - 按需生成 CSS,只包含使用到的样式,极大减小CSS体积
- **高度可配置** - 完全可自定义的规则、快捷方式、主题和预设
- **原子化优先** - 提倡使用原子化CSS类,提高开发效率和代码复用
- **多预设支持** - 内置多种预设(Uno、Attributify、Icons、Typography等)
- **完整的 TypeScript 支持** - 类型安全的配置和使用
- **与主题系统集成** - 通过 CSS 变量与项目主题系统无缝对接

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:1-213

## 配置文件

UnoCSS 的配置文件位于项目根目录,文件名为 `uno.config.ts`。该文件使用 TypeScript 编写,提供完整的类型提示和检查。

### 配置文件结构

```typescript
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

import { ICONIFY_ICONS } from './src/types/icons.d'

export default defineConfig({
  shortcuts: {
    // 快捷方式定义
  },
  theme: {
    // 主题配置
  },
  safelist: [
    // 安全列表
  ],
  rules: [
    // 自定义规则
  ],
  presets: [
    // 预设配置
  ],
  transformers: [
    // 转换器配置
  ]
})
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:1-22

## 快捷方式

快捷方式(`shortcuts`)允许将常用的样式组合定义为简单的类名,提高开发效率,避免重复编写相同的类名组合。

### 面板标题样式

```typescript
shortcuts: {
  'panel-title':
    'pb-[5px] font-sans leading-[1.1] font-medium text-base text-[#6379bb] border-b border-b-solid border-[var(--el-border-color-light)] mb-5 mt-0'
}
```

**使用示例:**

```vue
<template>
  <div class="panel">
    <h3 class="panel-title">用户管理</h3>
    <div class="content">
      <!-- 面板内容 -->
    </div>
  </div>
</template>
```

**实现说明:**
- `pb-[5px]`: 底部内边距 5px
- `font-sans`: 无衬线字体
- `leading-[1.1]`: 行高 1.1
- `font-medium`: 字重 500
- `text-base`: 基础文字大小
- `text-[#6379bb]`: 自定义文字颜色
- `border-b border-b-solid border-[var(--el-border-color-light)]`: 底部边框
- `mb-5 mt-0`: 外边距设置

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:33-35

### 布局快捷方式

#### 居中对齐布局

```typescript
'flex-center': 'flex items-center justify-center'
```

**使用示例:**

```vue
<template>
  <!-- 水平垂直居中 -->
  <div class="flex-center h-screen">
    <div class="card">
      <h2>登录</h2>
      <form>...</form>
    </div>
  </div>

  <!-- 按钮图标居中 -->
  <button class="flex-center w-32 h-10 bg-primary text-white rounded">
    <i class="i-carbon-user mr-2"></i>
    <span>登录</span>
  </button>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:38

#### 两端对齐布局

```typescript
'flex-between': 'flex items-center justify-between'
```

**使用示例:**

```vue
<template>
  <!-- 页面头部 -->
  <header class="flex-between px-4 h-16 bg-white shadow">
    <h1 class="text-xl font-bold">系统管理</h1>
    <nav class="flex gap-4">
      <a href="#">首页</a>
      <a href="#">设置</a>
      <a href="#">退出</a>
    </nav>
  </header>

  <!-- 表单项 -->
  <div class="flex-between mb-4">
    <label>用户名:</label>
    <input type="text" class="flex-1 ml-4" />
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:39

#### 绝对定位居中

```typescript
'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
```

**使用示例:**

```vue
<template>
  <!-- 加载动画居中 -->
  <div class="relative h-screen">
    <div class="absolute-center">
      <div class="loading-spinner"></div>
      <p class="mt-4 text-center">加载中...</p>
    </div>
  </div>

  <!-- 图片水印居中 -->
  <div class="relative">
    <img src="image.jpg" class="w-full" />
    <div class="absolute-center opacity-30">
      <span class="text-4xl font-bold text-gray-500">WATERMARK</span>
    </div>
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:40

### 容器快捷方式

#### 卡片容器

```typescript
'card': 'bg-white dark:bg-dark-800 rounded shadow p-4'
```

**使用示例:**

```vue
<template>
  <!-- 信息卡片 -->
  <div class="card">
    <h3 class="text-lg font-bold mb-4">用户信息</h3>
    <div class="space-y-2">
      <p>姓名: 张三</p>
      <p>邮箱: zhangsan@example.com</p>
      <p>角色: 管理员</p>
    </div>
  </div>

  <!-- 统计卡片 -->
  <div class="grid grid-cols-4 gap-4">
    <div class="card text-center">
      <div class="text-3xl font-bold text-primary">128</div>
      <div class="text-sm text-gray-500 mt-2">总用户数</div>
    </div>
    <div class="card text-center">
      <div class="text-3xl font-bold text-success">45</div>
      <div class="text-sm text-gray-500 mt-2">在线用户</div>
    </div>
    <!-- 更多卡片... -->
  </div>
</template>
```

**技术实现:**
- `bg-white`: 亮色主题白色背景
- `dark:bg-dark-800`: 暗色主题深色背景
- `rounded`: 圆角边框
- `shadow`: 阴影效果
- `p-4`: 内边距 16px

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:43

### 标签快捷方式

```typescript
'tag': 'inline-block px-2 py-1 text-xs rounded'
```

**使用示例:**

```vue
<template>
  <!-- 状态标签 -->
  <div class="flex gap-2">
    <span class="tag bg-green-100 text-green-700">已完成</span>
    <span class="tag bg-blue-100 text-blue-700">进行中</span>
    <span class="tag bg-red-100 text-red-700">已取消</span>
  </div>

  <!-- 分类标签 -->
  <div class="flex flex-wrap gap-2">
    <span class="tag bg-gray-100 text-gray-700">Vue</span>
    <span class="tag bg-gray-100 text-gray-700">TypeScript</span>
    <span class="tag bg-gray-100 text-gray-700">Element Plus</span>
    <span class="tag bg-gray-100 text-gray-700">UnoCSS</span>
  </div>
</template>

<style scoped>
/* 可以在组件中扩展标签样式 */
.tag {
  cursor: pointer;
  transition: all 0.3s;
}

.tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:46

## 主题配置

主题配置定义了项目的颜色、间距、字体、阴影、圆角等主题变量。这些变量与 CSS 变量系统集成,支持亮色/暗色模式自动切换。

### 颜色系统

#### 状态颜色

```typescript
theme: {
  colors: {
    // 状态颜色
    'primary': 'var(--el-color-primary)',
    'primary_dark': 'var(--el-color-primary-light-5)',
    'success': 'var(--color-success)',
    'warning': 'var(--color-warning)',
    'danger': 'var(--color-danger)',
    'info': 'var(--color-info)'
  }
}
```

**使用示例:**

```vue
<template>
  <!-- 按钮颜色 -->
  <div class="flex gap-4">
    <button class="px-4 py-2 bg-primary text-white rounded">主要按钮</button>
    <button class="px-4 py-2 bg-success text-white rounded">成功按钮</button>
    <button class="px-4 py-2 bg-warning text-white rounded">警告按钮</button>
    <button class="px-4 py-2 bg-danger text-white rounded">危险按钮</button>
    <button class="px-4 py-2 bg-info text-white rounded">信息按钮</button>
  </div>

  <!-- 带悬停效果 -->
  <button class="px-4 py-2 bg-primary hover:bg-primary_dark text-white rounded transition">
    悬停变深
  </button>

  <!-- 文字颜色 -->
  <div class="space-y-2">
    <p class="text-primary">主色调文字</p>
    <p class="text-success">成功状态文字</p>
    <p class="text-warning">警告状态文字</p>
    <p class="text-danger">错误状态文字</p>
    <p class="text-info">信息状态文字</p>
  </div>

  <!-- 边框颜色 -->
  <div class="border-2 border-primary rounded p-4">
    主色调边框
  </div>
</template>
```

**颜色说明:**
- `primary`: 主色调,用于品牌色和关键元素(亮色: #409eff, 暗色: #3b82f6)
- `primary_dark`: 主色调深色变体,用于悬停状态
- `success`: 成功状态颜色(绿色)
- `warning`: 警告状态颜色(黄色)
- `danger`: 危险/错误状态颜色(红色)
- `info`: 信息/提示状态颜色(灰色)

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:62-67

#### 文本颜色

```typescript
colors: {
  // 文本颜色
  'text-base': 'var(--text-color)',
  'text-secondary': 'var(--text-color-secondary)',
  'text-muted': 'var(--text-muted)',
  'heading': 'var(--heading-color)'
}
```

**使用示例:**

```vue
<template>
  <!-- 标题和正文 -->
  <article>
    <h1 class="text-3xl font-bold text-heading mb-4">
      文章标题
    </h1>
    <p class="text-base leading-relaxed mb-4">
      这是正文内容,使用基础文本颜色,确保良好的可读性。
    </p>
    <p class="text-secondary text-sm mb-2">
      这是次要文本,用于补充信息或提示文字。
    </p>
    <p class="text-muted text-xs">
      这是弱化文本,用于不太重要的信息。
    </p>
  </article>

  <!-- 表单标签 -->
  <form class="space-y-4">
    <div>
      <label class="text-base font-medium block mb-2">用户名</label>
      <input type="text" class="w-full" />
      <span class="text-muted text-xs mt-1 block">请输入4-16个字符</span>
    </div>
  </form>
</template>
```

**颜色层级:**
1. `heading`: 标题文本,对比度最高
2. `text-base`: 基础文本,正文内容
3. `text-secondary`: 次要文本,补充说明
4. `text-muted`: 弱化文本,不重要信息

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:70-73

#### 边框颜色

```typescript
colors: {
  // 边框颜色
  'border': 'var(--border-color)',
  'border-light': 'var(--border-color-light)',
  'border-lighter': 'var(--border-color-lighter)'
}
```

**使用示例:**

```vue
<template>
  <!-- 标准边框 -->
  <div class="border border-border rounded p-4">
    标准边框容器
  </div>

  <!-- 浅色边框 -->
  <div class="border border-border-light rounded p-4">
    浅色边框容器
  </div>

  <!-- 更浅边框 -->
  <div class="border border-border-lighter rounded p-4">
    更浅边框容器
  </div>

  <!-- 分割线 -->
  <div class="border-t border-border my-4"></div>

  <!-- 表格边框 -->
  <table class="w-full border-collapse">
    <thead>
      <tr class="border-b border-border">
        <th class="p-2 text-left">姓名</th>
        <th class="p-2 text-left">邮箱</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-border-light">
        <td class="p-2">张三</td>
        <td class="p-2">zhangsan@example.com</td>
      </tr>
    </tbody>
  </table>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:76-78

#### 背景颜色

```typescript
colors: {
  // 背景颜色
  'bg-base': 'var(--bg-color)',
  'bg-page': 'var(--bg-color-page)',
  'bg-overlay': 'var(--bg-color-overlay)'
}
```

**使用示例:**

```vue
<template>
  <!-- 页面背景 -->
  <div class="min-h-screen bg-page">
    <!-- 主要内容区 -->
    <div class="container mx-auto py-8">
      <!-- 内容卡片 -->
      <div class="bg-base rounded shadow p-6">
        <h2 class="text-2xl font-bold mb-4">内容区域</h2>
        <p>这是主要内容...</p>
      </div>
    </div>
  </div>

  <!-- 弹出层覆盖 -->
  <div class="fixed inset-0 bg-overlay bg-opacity-50 flex-center">
    <div class="bg-base rounded-lg shadow-lg p-6 max-w-md">
      <h3 class="text-lg font-bold mb-4">对话框标题</h3>
      <p class="mb-4">这是对话框内容...</p>
      <div class="flex-between">
        <button class="px-4 py-2 rounded">取消</button>
        <button class="px-4 py-2 bg-primary text-white rounded">确定</button>
      </div>
    </div>
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:81-83

#### 菜单颜色

```typescript
colors: {
  // 菜单颜色
  'menu-bg': 'var(--menu-bg)',
  'menu-text': 'var(--menu-color)',
  'menu-active': 'var(--menu-active-text)',
  'menu-hover': 'var(--menu-hover)',

  // 子菜单颜色
  'submenu-bg': 'var(--submenu-bg)',
  'submenu-active': 'var(--submenu-active-text)',
  'submenu-hover': 'var(--submenu-hover)'
}
```

**使用示例:**

```vue
<template>
  <!-- 侧边栏菜单 -->
  <aside class="w-64 bg-menu-bg h-screen">
    <nav>
      <!-- 一级菜单 -->
      <div class="p-4">
        <a
          href="#"
          class="flex items-center px-4 py-3 text-menu-text hover:bg-menu-hover hover:text-white rounded transition"
        >
          <i class="i-carbon-home mr-3"></i>
          <span>首页</span>
        </a>

        <a
          href="#"
          class="flex items-center px-4 py-3 bg-menu-hover text-menu-active rounded"
        >
          <i class="i-carbon-user mr-3"></i>
          <span>用户管理</span>
        </a>
      </div>

      <!-- 二级菜单 -->
      <div class="bg-submenu-bg">
        <a
          href="#"
          class="flex items-center px-8 py-2 text-menu-text hover:bg-submenu-hover transition"
        >
          用户列表
        </a>
        <a
          href="#"
          class="flex items-center px-8 py-2 text-submenu-active bg-submenu-hover"
        >
          角色管理
        </a>
      </div>
    </nav>
  </aside>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:86-94

### 间距系统

```typescript
theme: {
  spacing: {
    'sidebar': 'var(--sidebar-width)',
    'header': 'var(--header-height)',
    'tags-view': 'var(--tags-view-height)'
  }
}
```

**使用示例:**

```vue
<template>
  <!-- 布局结构 -->
  <div class="min-h-screen">
    <!-- 头部 -->
    <header class="fixed top-0 left-0 right-0 h-header bg-white shadow z-10">
      <div class="flex-between px-6 h-full">
        <h1 class="text-xl font-bold">系统名称</h1>
        <nav>菜单</nav>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="flex pt-header">
      <!-- 侧边栏 -->
      <aside class="fixed top-header bottom-0 left-0 w-sidebar bg-menu-bg overflow-y-auto">
        <!-- 菜单内容 -->
      </aside>

      <!-- 内容区 -->
      <main class="flex-1 ml-sidebar">
        <!-- 标签视图 -->
        <div class="h-tags-view bg-white border-b border-border">
          <!-- 标签列表 -->
        </div>

        <!-- 页面内容 -->
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>
```

**间距变量说明:**
- `sidebar`: 侧边栏宽度(默认 240px)
- `header`: 头部高度(默认 50px)
- `tags-view`: 标签视图高度(默认 34px)

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:98-102

### 字体配置

```typescript
theme: {
  fontFamily: {
    'base': 'var(--font-family-base)'
  }
}
```

**使用示例:**

```vue
<template>
  <!-- 使用基础字体 -->
  <div class="font-base">
    <h1 class="text-3xl font-bold">标题文字</h1>
    <p class="text-base leading-relaxed">
      正文内容使用项目统一的基础字体族,确保在不同平台和设备上都有良好的显示效果。
    </p>
  </div>

  <!-- 结合其他字体工具类 -->
  <div class="font-base">
    <p class="font-light">轻字重文字 (300)</p>
    <p class="font-normal">常规字重文字 (400)</p>
    <p class="font-medium">中等字重文字 (500)</p>
    <p class="font-semibold">半粗字重文字 (600)</p>
    <p class="font-bold">粗体字重文字 (700)</p>
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:105-107

### 阴影配置

```typescript
theme: {
  boxShadow: {
    'base': 'var(--shadow-base)',
    'light': 'var(--shadow-light)'
  }
}
```

**使用示例:**

```vue
<template>
  <!-- 基础阴影 -->
  <div class="card shadow-base">
    <h3 class="text-lg font-bold mb-4">基础阴影卡片</h3>
    <p>这个卡片使用基础阴影效果...</p>
  </div>

  <!-- 轻微阴影 -->
  <div class="card shadow-light">
    <h3 class="text-lg font-bold mb-4">轻微阴影卡片</h3>
    <p>这个卡片使用轻微阴影效果...</p>
  </div>

  <!-- 悬停增强阴影 -->
  <div class="card shadow-light hover:shadow-base transition-shadow cursor-pointer">
    <h3 class="text-lg font-bold mb-4">交互卡片</h3>
    <p>悬停时阴影增强...</p>
  </div>

  <!-- 按钮阴影 -->
  <button class="px-6 py-3 bg-primary text-white rounded shadow-base hover:shadow-light transition">
    立即购买
  </button>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:110-113

### 圆角配置

```typescript
theme: {
  borderRadius: {
    'base': 'var(--border-radius-base)',
    'small': 'var(--border-radius-small)'
  }
}
```

**使用示例:**

```vue
<template>
  <!-- 基础圆角 -->
  <div class="card rounded-base">
    基础圆角容器
  </div>

  <!-- 小圆角 -->
  <div class="card rounded-small">
    小圆角容器
  </div>

  <!-- 按钮圆角 -->
  <button class="px-4 py-2 bg-primary text-white rounded-small">
    提交
  </button>

  <!-- 输入框圆角 -->
  <input
    type="text"
    class="w-full px-4 py-2 border border-border rounded-base"
    placeholder="请输入内容"
  />

  <!-- 标签圆角 -->
  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-small text-xs">
    标签
  </span>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:116-119

## 安全列表

安全列表(`safelist`)确保某些类名即使未在代码中显式使用也会被包含在最终生成的CSS中。这对于动态生成的类名特别有用。

```typescript
safelist: [
  // 添加所有预设图标的类名到安全列表
  ...ICONIFY_ICONS.map((icon) => icon.value)
]
```

**使用场景:**

```vue
<template>
  <!-- 动态图标类名 -->
  <div v-for="item in menuItems" :key="item.id">
    <i :class="item.icon"></i>
    <span>{{ item.title }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const menuItems = ref([
  { id: 1, title: '首页', icon: 'i-carbon-home' },
  { id: 2, title: '用户', icon: 'i-carbon-user' },
  { id: 3, title: '设置', icon: 'i-carbon-settings' }
])
</script>
```

**说明:**
- 由于图标类名是动态绑定的,UnoCSS 无法在静态分析时识别
- 通过将所有图标类名添加到安全列表,确保它们被包含在最终CSS中
- `ICONIFY_ICONS` 是项目中预定义的图标列表

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:125-128

## 自定义规则

自定义规则(`rules`)允许定义 UnoCSS 预设无法满足的特殊样式规则。

### 布局规则

#### 侧边栏宽度

```typescript
rules: [
  ['sidebar-width', { 'width': 'var(--sidebar-width)' }]
]
```

**使用示例:**

```vue
<template>
  <aside class="sidebar-width h-screen bg-menu-bg">
    <!-- 侧边栏内容 -->
  </aside>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:141

#### 头部高度

```typescript
['header-height', { 'height': 'var(--header-height)' }]
```

**使用示例:**

```vue
<template>
  <header class="header-height bg-white shadow">
    <!-- 头部内容 -->
  </header>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:142

### 滚动条规则

```typescript
rules: [
  // 双向滚动条
  ['scrollbar', { 'overflow': 'auto' }],
  // 仅垂直滚动条
  ['scrollbar-y', { 'overflow-y': 'auto', 'overflow-x': 'hidden' }],
  // 仅水平滚动条
  ['scrollbar-x', { 'overflow-x': 'auto', 'overflow-y': 'hidden' }]
]
```

**使用示例:**

```vue
<template>
  <!-- 垂直滚动容器 -->
  <div class="scrollbar-y h-96 border border-border rounded p-4">
    <div class="space-y-4">
      <div v-for="i in 50" :key="i" class="p-4 bg-gray-100 rounded">
        项目 {{ i }}
      </div>
    </div>
  </div>

  <!-- 水平滚动容器 -->
  <div class="scrollbar-x w-full border border-border rounded p-4">
    <div class="flex gap-4 min-w-max">
      <div v-for="i in 20" :key="i" class="w-48 h-32 bg-gray-100 rounded"></div>
    </div>
  </div>

  <!-- 双向滚动 -->
  <div class="scrollbar h-96 w-full border border-border rounded">
    <div class="min-w-[1200px] min-h-[800px] p-4">
      大尺寸内容...
    </div>
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:145-147

### 文本处理规则

#### 单行文本省略

```typescript
['text-ellipsis', {
  'white-space': 'nowrap',
  'overflow': 'hidden',
  'text-overflow': 'ellipsis'
}]
```

**使用示例:**

```vue
<template>
  <!-- 标题省略 -->
  <h3 class="text-ellipsis text-lg font-bold" style="max-width: 300px">
    这是一个非常长的标题文本,超出容器宽度时会自动省略显示...
  </h3>

  <!-- 表格单元格省略 -->
  <table class="w-full">
    <tr>
      <td class="text-ellipsis" style="max-width: 200px">
        非常长的单元格内容会被省略...
      </td>
    </tr>
  </table>

  <!-- 列表项省略 -->
  <ul>
    <li v-for="item in items" :key="item.id" class="text-ellipsis" style="max-width: 250px">
      {{ item.title }}
    </li>
  </ul>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:150

#### 多行文本省略

```typescript
['line-clamp-2', {
  'overflow': 'hidden',
  'display': '-webkit-box',
  '-webkit-line-clamp': '2',
  '-webkit-box-orient': 'vertical'
}]
```

**使用示例:**

```vue
<template>
  <!-- 文章摘要 -->
  <div class="card">
    <h3 class="text-lg font-bold mb-2">文章标题</h3>
    <p class="line-clamp-2 text-secondary text-sm">
      这是文章的摘要内容。当内容超过两行时,会自动省略并显示省略号。
      这样可以保持页面布局的整洁和一致性,同时给用户提供足够的信息预览。
      这段文字会被限制在两行以内显示。
    </p>
    <button class="mt-4 text-primary text-sm">阅读更多 →</button>
  </div>

  <!-- 商品描述 -->
  <div class="product-card">
    <img src="product.jpg" class="w-full rounded" />
    <h4 class="font-bold mt-2">商品名称</h4>
    <p class="line-clamp-2 text-sm text-secondary mt-1">
      商品的详细描述信息,包括特点、规格、适用场景等内容...
    </p>
    <div class="mt-2 flex-between">
      <span class="text-danger font-bold">¥99.00</span>
      <button class="px-4 py-1 bg-primary text-white rounded-small text-sm">
        加入购物车
      </button>
    </div>
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:151-159

### 定位规则

```typescript
['relative-full', {
  'position': 'relative',
  'width': '100%',
  'height': '100%'
}]
```

**使用示例:**

```vue
<template>
  <!-- 图片容器 -->
  <div class="relative-full">
    <img src="image.jpg" class="w-full h-full object-cover" />
    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
      <h3 class="text-lg font-bold">图片标题</h3>
      <p class="text-sm">图片描述</p>
    </div>
  </div>

  <!-- 加载状态覆盖层 -->
  <div class="relative-full">
    <div class="content">
      <!-- 页面内容 -->
    </div>
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-80 flex-center">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:163

## 预设配置

预设(`presets`)提供预定义的工具类集合,激活不同的功能模块。

### presetUno

默认预设,提供大多数常用的原子化 CSS 类。

```typescript
presets: [
  presetUno()
]
```

**功能特性:**
- 完整的工具类支持(颜色、间距、布局、字体等)
- 响应式断点
- 暗黑模式支持
- 伪类支持(hover、focus、active等)
- 变体组合

**使用示例:**

```vue
<template>
  <!-- 基础样式 -->
  <div class="w-full max-w-screen-lg mx-auto p-4">
    <!-- 响应式网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-white p-6 rounded shadow">卡片 1</div>
      <div class="bg-white p-6 rounded shadow">卡片 2</div>
      <div class="bg-white p-6 rounded shadow">卡片 3</div>
    </div>

    <!-- 颜色和间距 -->
    <div class="mt-8 p-4 bg-blue-500 text-white rounded-lg">
      <h2 class="text-2xl font-bold mb-4">标题</h2>
      <p class="text-sm leading-relaxed">内容文本</p>
    </div>

    <!-- 交互状态 -->
    <button class="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded transition">
      点击按钮
    </button>
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:178

### presetAttributify

属性化模式预设,允许将类转换为属性形式。

```typescript
presets: [
  presetAttributify()
]
```

**使用示例:**

```vue
<template>
  <!-- 传统方式 -->
  <div class="bg-blue-500 text-white p-4 rounded shadow">
    传统类名方式
  </div>

  <!-- 属性化方式 -->
  <div
    bg="blue-500"
    text="white"
    p="4"
    rounded
    shadow
  >
    属性化方式
  </div>

  <!-- 更复杂的例子 -->
  <button
    px="6"
    py="3"
    bg="primary hover:primary_dark"
    text="white sm"
    rounded="base"
    shadow="base"
    transition
  >
    提交表单
  </button>

  <!-- 响应式属性化 -->
  <div
    grid
    grid-cols="1 md:2 lg:3"
    gap="4"
  >
    <div>项目 1</div>
    <div>项目 2</div>
    <div>项目 3</div>
  </div>
</template>
```

**优势:**
- 更清晰的代码结构
- 避免类名过长
- 更好的可读性
- IDE 自动补全支持更好

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:181

### presetIcons

图标预设,支持各种图标集成。

```typescript
presets: [
  presetIcons({})
]
```

**支持的图标集:**
- Carbon Icons (i-carbon-*)
- Material Design Icons (i-mdi-*)
- Font Awesome (i-fa-*)
- Heroicons (i-heroicons-*)
- 等 100+ 图标集

**使用示例:**

```vue
<template>
  <!-- 基础图标 -->
  <div class="flex items-center gap-2">
    <i class="i-carbon-home text-2xl"></i>
    <span>首页</span>
  </div>

  <!-- 带颜色的图标 -->
  <div class="flex gap-4">
    <i class="i-carbon-checkmark-filled text-2xl text-success"></i>
    <i class="i-carbon-warning-filled text-2xl text-warning"></i>
    <i class="i-carbon-error-filled text-2xl text-danger"></i>
  </div>

  <!-- 按钮中的图标 -->
  <button class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded">
    <i class="i-carbon-add"></i>
    <span>新增</span>
  </button>

  <!-- 不同大小的图标 -->
  <div class="flex items-center gap-4">
    <i class="i-carbon-user text-sm"></i>
    <i class="i-carbon-user text-base"></i>
    <i class="i-carbon-user text-lg"></i>
    <i class="i-carbon-user text-xl"></i>
    <i class="i-carbon-user text-2xl"></i>
    <i class="i-carbon-user text-3xl"></i>
  </div>

  <!-- 菜单图标 -->
  <nav class="space-y-2">
    <a href="#" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded">
      <i class="i-carbon-dashboard"></i>
      <span>仪表盘</span>
    </a>
    <a href="#" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded">
      <i class="i-carbon-user-multiple"></i>
      <span>用户管理</span>
    </a>
    <a href="#" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded">
      <i class="i-carbon-settings"></i>
      <span>系统设置</span>
    </a>
  </nav>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:184

### presetTypography

排版预设,提供丰富的文本排版相关样式。

```typescript
presets: [
  presetTypography()
]
```

**使用示例:**

```vue
<template>
  <!-- 文章排版 -->
  <article class="prose prose-sm md:prose-base lg:prose-lg max-w-none">
    <h1>文章标题</h1>
    <p class="lead">
      这是文章的引言部分,使用较大的字号和行高,引导读者进入正文。
    </p>

    <h2>章节标题</h2>
    <p>
      这是正文内容。prose 类会自动为文章中的各种元素添加合适的样式,
      包括标题、段落、列表、引用块、代码块等。
    </p>

    <ul>
      <li>列表项 1</li>
      <li>列表项 2</li>
      <li>列表项 3</li>
    </ul>

    <blockquote>
      这是一段引用文字,会有特殊的样式显示。
    </blockquote>

    <pre><code>const hello = 'world'</code></pre>

    <h3>子标题</h3>
    <p>
      更多内容...
    </p>
  </article>

  <!-- 不同尺寸的排版 -->
  <div class="prose prose-sm">小号排版</div>
  <div class="prose">默认排版</div>
  <div class="prose prose-lg">大号排版</div>
  <div class="prose prose-xl">特大号排版</div>

  <!-- 暗黑模式排版 -->
  <article class="prose dark:prose-invert">
    <h1>暗黑模式下的文章</h1>
    <p>文字会自动适配暗黑模式的颜色</p>
  </article>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:187

### presetWebFonts

Web 字体预设,支持在线字体的便捷使用。

```typescript
presets: [
  presetWebFonts({
    fonts: {
      // 可在此处添加自定义网络字体
    }
  })
]
```

**使用示例:**

```typescript
// 配置自定义字体
presetWebFonts({
  fonts: {
    // Google Fonts
    sans: 'Roboto',
    serif: 'Roboto Slab',
    mono: 'Fira Code'
  }
})
```

```vue
<template>
  <!-- 使用自定义字体 -->
  <div class="font-sans">
    Roboto 字体文本
  </div>

  <div class="font-serif">
    Roboto Slab 衬线字体文本
  </div>

  <div class="font-mono">
    <code>Fira Code 等宽字体代码</code>
  </div>
</template>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:190-195

## 转换器配置

转换器(`transformers`)扩展 UnoCSS 的语法功能。

### transformerDirectives

指令转换器,支持 `@apply`、`@screen` 等指令。

```typescript
transformers: [
  transformerDirectives()
]
```

**@apply 指令:**

```vue
<template>
  <button class="btn-custom">自定义按钮</button>
</template>

<style scoped>
.btn-custom {
  @apply px-6 py-3 bg-primary text-white rounded shadow hover:bg-primary_dark transition;
}
</style>
```

**@screen 指令:**

```vue
<style scoped>
.container {
  @apply px-4;

  @screen md {
    @apply px-6;
  }

  @screen lg {
    @apply px-8 max-w-screen-lg mx-auto;
  }
}
</style>
```

**@variants 指令:**

```vue
<style scoped>
.link {
  @apply text-primary;

  @variants hover, focus {
    @apply text-primary_dark underline;
  }
}
</style>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:208

### transformerVariantGroup

变体组转换器,简化多变体编写。

```typescript
transformers: [
  transformerVariantGroup()
]
```

**使用示例:**

```vue
<template>
  <!-- 传统写法 -->
  <div class="hover:bg-blue-500 hover:text-white hover:font-bold">
    悬停效果
  </div>

  <!-- 变体组写法 -->
  <div class="hover:(bg-blue-500 text-white font-bold)">
    悬停效果(简化写法)
  </div>

  <!-- 多个变体组 -->
  <button class="
    px-4 py-2 rounded
    bg-primary text-white
    hover:(bg-primary_dark shadow-lg)
    active:(scale-95)
    disabled:(opacity-50 cursor-not-allowed)
  ">
    提交
  </button>

  <!-- 响应式变体组 -->
  <div class="
    grid
    grid-cols-1
    md:(grid-cols-2 gap-6)
    lg:(grid-cols-3 gap-8)
  ">
    <!-- 网格内容 -->
  </div>

  <!-- 暗黑模式变体组 -->
  <div class="
    bg-white text-gray-900
    dark:(bg-gray-900 text-white)
  ">
    自适应主题内容
  </div>
</template>
```

**优势:**
- 减少重复的变体前缀
- 提高代码可读性
- 更容易维护

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:211

## 最佳实践

### 1. 优先使用快捷方式

对于常用的样式组合,定义快捷方式可以提高开发效率。

**推荐做法** <Ok/>:

```vue
<template>
  <div class="flex-center">居中内容</div>
  <div class="flex-between">两端对齐</div>
  <div class="card">卡片容器</div>
</template>
```

**不推荐** <No/>:

```vue
<template>
  <div class="flex items-center justify-center">居中内容</div>
  <div class="flex items-center justify-between">两端对齐</div>
  <div class="bg-white dark:bg-dark-800 rounded shadow p-4">卡片容器</div>
</template>
```

### 2. 使用主题颜色变量

通过主题颜色变量实现暗黑模式自动适配。

**推荐做法** <Ok/>:

```vue
<template>
  <div class="bg-bg-base text-text-base border-border">
    使用主题变量,自动适配暗黑模式
  </div>
</template>
```

**不推荐** <No/>:

```vue
<template>
  <div class="bg-white text-gray-900 border-gray-200">
    固定颜色,不支持主题切换
  </div>
</template>
```

### 3. 合理使用变体组

对于复杂的交互状态,使用变体组可以提高可读性。

**推荐做法** <Ok/>:

```vue
<template>
  <button class="
    px-4 py-2
    bg-primary text-white
    hover:(bg-primary_dark shadow-lg)
    active:(scale-95)
  ">
    按钮
  </button>
</template>
```

**不推荐** <No/>:

```vue
<template>
  <button class="px-4 py-2 bg-primary text-white hover:bg-primary_dark hover:shadow-lg active:scale-95">
    按钮
  </button>
</template>
```

### 4. 响应式设计

使用响应式断点实现多端适配。

**推荐做法** <Ok/>:

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- 移动端1列,平板2列,桌面3列 -->
  </div>
</template>
```

### 5. 使用 @apply 提取重复样式

对于组件内部的重复样式,使用 `@apply` 提取。

**推荐做法** <Ok/>:

```vue
<template>
  <div class="form-item">
    <label>用户名</label>
    <input type="text" />
  </div>
  <div class="form-item">
    <label>密码</label>
    <input type="password" />
  </div>
</template>

<style scoped>
.form-item {
  @apply mb-4;

  label {
    @apply block mb-2 font-medium text-sm;
  }

  input {
    @apply w-full px-4 py-2 border border-border rounded-base;
  }
}
</style>
```

## 常见问题

### 1. 样式不生效

**问题原因:**
- 类名拼写错误
- 动态类名未添加到安全列表
- 样式被其他 CSS 覆盖
- 需要清理缓存

**解决方案:**

```bash
# 清理缓存重新构建
pnpm clean
pnpm dev
```

```vue
<template>
  <!-- 检查类名拼写 -->
  <div class="flex-center">✅ 正确</div>
  <div class="flex-cnter">❌ 拼写错误</div>

  <!-- 动态类名添加到安全列表 -->
  <div :class="dynamicClass"></div>
</template>
```

### 2. 主题颜色不生效

**问题原因:**
- CSS 变量未正确定义
- 主题文件未正确导入
- 变量名称错误

**解决方案:**

```typescript
// 检查 uno.config.ts 中的颜色配置
theme: {
  colors: {
    'primary': 'var(--el-color-primary)', // 确保变量名正确
  }
}
```

```scss
// 检查主题文件中的变量定义
:root {
  --el-color-primary: #409eff;
}
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:62

### 3. 图标不显示

**问题原因:**
- 图标类名错误
- 图标集未安装
- 动态图标未添加到安全列表

**解决方案:**

```vue
<template>
  <!-- 检查图标类名格式 -->
  <i class="i-carbon-home"></i> ✅ 正确
  <i class="carbon-home"></i> ❌ 缺少 i- 前缀
  <i class="i-carbon:home"></i> ❌ 错误的分隔符

  <!-- 动态图标添加到安全列表 -->
  <i :class="iconClass"></i>
</template>

<script lang="ts" setup>
// 确保图标在安全列表中
const iconClass = 'i-carbon-user' // 需要在 uno.config.ts safelist 中
</script>
```

参考: ruoyi-plus-uniapp-workflow/plus-ui/uno.config.ts:125-128

### 4. 响应式断点不生效

**问题原因:**
- 断点语法错误
- 浏览器窗口未调整到对应尺寸
- 样式被覆盖

**解决方案:**

```vue
<template>
  <!-- 正确的响应式语法 -->
  <div class="text-sm md:text-base lg:text-lg">✅</div>

  <!-- 错误的语法 -->
  <div class="text-sm md-text-base lg-text-lg">❌ 缺少冒号</div>
</template>
```

### 5. @apply 指令报错

**问题原因:**
- 语法错误
- 使用了不存在的工具类
- transformerDirectives 未配置

**解决方案:**

```vue
<style scoped>
/* 正确用法 */
.button {
  @apply px-4 py-2 bg-primary text-white rounded;
}

/* 错误用法 */
.button {
  @apply px-4 py-2 bg-not-exist rounded; /* ❌ 不存在的工具类 */
}
</style>
```

确保在 `uno.config.ts` 中配置了转换器:

```typescript
transformers: [
  transformerDirectives()
]
```
