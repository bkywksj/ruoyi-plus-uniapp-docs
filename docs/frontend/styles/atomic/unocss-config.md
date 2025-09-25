# UnoCSS 配置

UnoCSS 是即时原子化 CSS 引擎，本项目通过详细配置实现高效的原子化样式开发。

## ⚙️ 配置文件结构

### uno.config.ts 完整配置

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
  // 快捷方式定义
  shortcuts: { },
  
  // 主题配置
  theme: { },
  
  // 安全列表
  safelist: [ ],
  
  // 自定义规则
  rules: [ ],
  
  // 预设配置
  presets: [ ],
  
  // 转换器
  transformers: [ ]
})
```

## 🚀 快捷方式 (Shortcuts)

将常用样式组合定义为简单类名：

### 面板组件样式
```typescript
shortcuts: {
  // 面板标题
  'panel-title': 'pb-[5px] font-sans leading-[1.1] font-medium text-base text-[#6379bb] border-b border-b-solid border-[var(--el-border-color-light)] mb-5 mt-0',
}
```

**使用示例**：
```html
<h3 class="panel-title">用户管理</h3>
<!-- 等同于 -->
<h3 class="pb-[5px] font-sans leading-[1.1] font-medium text-base text-[#6379bb] border-b border-b-solid border-[var(--el-border-color-light)] mb-5 mt-0">用户管理</h3>
```

### 布局快捷方式
```typescript
shortcuts: {
  // 居中对齐
  'flex-center': 'flex items-center justify-center',
  'flex-between': 'flex items-center justify-between',
  'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  
  // 容器样式
  'card': 'bg-white dark:bg-dark-800 rounded shadow p-4',
  'tag': 'inline-block px-2 py-1 text-xs rounded'
}
```

**使用示例**：
```html
<!-- 居中布局 -->
<div class="flex-center h-screen">
  <div class="card">卡片内容</div>
</div>

<!-- 两端对齐 -->
<div class="flex-between">
  <h2>标题</h2>
  <span class="tag">新</span>
</div>
```

## 🎨 主题配置 (Theme)

### 颜色系统
```typescript
theme: {
  colors: {
    // 状态颜色 - 与Element Plus保持一致
    'primary': 'var(--el-color-primary)',
    'primary_dark': 'var(--el-color-primary-light-5)',
    'success': 'var(--color-success)',
    'warning': 'var(--color-warning)',
    'danger': 'var(--color-danger)',
    'info': 'var(--color-info)',
    
    // 文本颜色层级
    'text-base': 'var(--text-color)',
    'text-secondary': 'var(--text-color-secondary)',
    'text-muted': 'var(--text-muted)',
    'heading': 'var(--heading-color)',
    
    // 边框颜色
    'border': 'var(--border-color)',
    'border-light': 'var(--border-color-light)',
    'border-lighter': 'var(--border-color-lighter)',
    
    // 背景颜色
    'bg-base': 'var(--bg-color)',
    'bg-page': 'var(--bg-color-page)',
    'bg-overlay': 'var(--bg-color-overlay)',
    
    // 菜单颜色
    'menu-bg': 'var(--menu-bg)',
    'menu-text': 'var(--menu-color)',
    'menu-active': 'var(--menu-active-text)',
    'menu-hover': 'var(--menu-hover)'
  }
}
```

**使用示例**：
```html
<!-- 状态颜色 -->
<button class="bg-primary text-white">主要按钮</button>
<div class="text-success">成功消息</div>
<span class="border-warning border-2">警告边框</span>

<!-- 语义颜色 -->
<h1 class="text-heading">页面标题</h1>
<p class="text-secondary">次要文本</p>
<div class="bg-page">页面背景</div>
```

### 间距系统
```typescript
theme: {
  spacing: {
    'sidebar': 'var(--sidebar-width)',      // 侧边栏宽度
    'header': 'var(--header-height)',       // 头部高度  
    'tags-view': 'var(--tags-view-height)'  // 标签视图高度
  }
}
```

**使用示例**：
```html
<aside class="w-sidebar">侧边栏</aside>
<header class="h-header">头部</header>
```

### 字体和阴影
```typescript
theme: {
  fontFamily: {
    'base': 'var(--font-family-base)'
  },
  boxShadow: {
    'base': 'var(--shadow-base)',
    'light': 'var(--shadow-light)'
  },
  borderRadius: {
    'base': 'var(--border-radius-base)',
    'small': 'var(--border-radius-small)'
  }
}
```

## 🛡️ 安全列表 (Safelist)

确保图标类名被包含，即使未直接使用：

```typescript
safelist: [
  // 添加所有预设图标的类名
  ...ICONIFY_ICONS.map((icon) => icon.value)
  // 例如: 'i-carbon-home', 'i-mdi-user', 'i-heroicons-settings'
]
```

**作用说明**：
- 防止未使用的图标类被清理
- 支持动态图标加载
- 确保打包后图标可用

## ⚡ 自定义规则 (Rules)

处理无法用预设满足的特殊样式：

### 布局规则
```typescript
rules: [
  // 布局相关
  ['sidebar-width', { 'width': 'var(--sidebar-width)' }],
  ['header-height', { 'height': 'var(--header-height)' }],
  
  // 滚动条控制
  ['scrollbar', { 'overflow': 'auto' }],
  ['scrollbar-y', { 'overflow-y': 'auto', 'overflow-x': 'hidden' }],
  ['scrollbar-x', { 'overflow-x': 'auto', 'overflow-y': 'hidden' }]
]
```

### 文本处理规则
```typescript
rules: [
  // 单行文本省略
  ['text-ellipsis', { 
    'white-space': 'nowrap', 
    'overflow': 'hidden', 
    'text-overflow': 'ellipsis' 
  }],
  
  // 多行文本省略
  ['line-clamp-2', {
    'overflow': 'hidden',
    'display': '-webkit-box',
    '-webkit-line-clamp': '2',
    '-webkit-box-orient': 'vertical'
  }]
]
```

### 定位规则
```typescript
rules: [
  // 填满容器的相对定位
  ['relative-full', { 
    'position': 'relative', 
    'width': '100%', 
    'height': '100%' 
  }]
]
```

**使用示例**：
```html
<!-- 布局控制 -->
<div class="sidebar-width">侧边栏宽度</div>
<div class="scrollbar-y h-80">垂直滚动</div>

<!-- 文本处理 -->
<p class="text-ellipsis w-40">这是一段很长的文本将会被省略...</p>
<div class="line-clamp-2">
  这是一段很长的文本
  会被限制在两行内显示
  超出部分用省略号代替
</div>

<!-- 定位布局 -->
<div class="relative-full">
  <div class="absolute top-0 left-0">左上角</div>
</div>
```

## 🔧 预设系统 (Presets)

### 预设配置详解
```typescript
presets: [
  // 1. 默认预设 - 提供基础原子化类
  presetUno(),
  
  // 2. 属性化模式 - 支持属性写法
  presetAttributify(),
  
  // 3. 图标预设 - 集成图标系统
  presetIcons({}),
  
  // 4. 排版预设 - 丰富文本样式
  presetTypography(),
  
  // 5. Web字体预设 - 在线字体支持
  presetWebFonts({
    fonts: {
      // 可添加自定义字体
      'custom': 'Inter'
    }
  })
]
```

### 预设使用示例

#### 1. 默认预设 (presetUno)
```html
<!-- 基础原子化类 -->
<div class="p-4 m-2 bg-blue-500 text-white rounded-lg">
  基础样式组合
</div>
```

#### 2. 属性化模式 (presetAttributify)
```html
<!-- 属性化写法 -->
<div 
  p="4" 
  m="2" 
  bg="blue-500" 
  text="white center" 
  border="rounded-lg"
>
  属性化样式
</div>
```

#### 3. 图标预设 (presetIcons)
```html
<!-- 图标使用 -->
<div class="i-carbon-home text-2xl"></div>
<span class="i-mdi-user text-lg text-blue-500"></span>
```

#### 4. 排版预设 (presetTypography)
```html
<!-- 排版样式 -->
<article class="prose prose-lg">
  <h1>标题</h1>
  <p>这是一段文本内容...</p>
</article>
```

## 🔄 转换器 (Transformers)

### 指令转换器
```typescript
transformers: [
  // 支持 @apply 等指令
  transformerDirectives()
]
```

**使用示例**：
```scss
.custom-button {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
```

### 变体组转换器
```typescript
transformers: [
  // 简化多变体写法
  transformerVariantGroup()
]
```

**使用示例**：
```html
<!-- 变体组简化 -->
<div class="hover:(bg-blue-500 text-white font-bold)">
  悬停效果组合
</div>

<!-- 等同于 -->
<div class="hover:bg-blue-500 hover:text-white hover:font-bold">
  悬停效果组合
</div>
```

## 🚀 性能优化配置

### 1. 按需生成
```typescript
// vite 插件配置
export default () => {
  return UnoCss({
    // 禁用顶层 await，提高兼容性
    hmrTopLevelAwait: false
  })
}
```

### 2. 构建优化
```typescript
export default defineConfig({
  // 开发模式配置
  mode: 'development',
  
  // 生产模式优化
  ...(process.env.NODE_ENV === 'production' && {
    // 启用压缩和优化
    minify: true,
    // 移除未使用的样式
    purge: {
      content: ['./src/**/*.{vue,ts,tsx}']
    }
  })
})
```

## 📋 使用最佳实践

### 1. 类名组织
```html
<!-- ✅ 推荐：按功能分组 -->
<div class="
  flex items-center justify-between
  p-4 m-2
  bg-white shadow-lg rounded-lg
  hover:shadow-xl transition-shadow
">
  内容
</div>
```

### 2. 响应式设计
```html
<!-- 响应式类名 -->
<div class="
  grid grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  响应式网格
</div>
```

### 3. 暗色模式支持
```html
<!-- 主题适配 -->
<div class="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
">
  主题适配内容
</div>
```

### 4. 状态管理
```html
<!-- 状态相关样式 -->
<button class="
  bg-primary text-white
  disabled:opacity-50 disabled:cursor-not-allowed
  hover:bg-primary_dark
  focus:outline-none focus:ring-2 focus:ring-primary
">
  交互按钮
</button>
```

通过这样的 UnoCSS 配置，我们实现了高效的原子化 CSS 开发体验，同时保持了与设计系统的一致性。
