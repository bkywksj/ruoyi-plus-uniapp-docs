# 自定义规则

UnoCSS 的自定义规则功能允许我们创建无法用预设满足的特殊样式规则，扩展框架的能力边界。

## 🎯 规则系统概述

自定义规则通过正则表达式匹配类名，然后返回对应的 CSS 样式对象，提供了极大的灵活性。

### 基本语法
```typescript
// uno.config.ts
export default defineConfig({
  rules: [
    // 静态规则
    ['custom-class', { color: 'red' }],
    
    // 动态规则
    [/^m-(.+)$/, ([, num]) => ({ margin: `${num}px` })],
    
    // 复杂规则
    [/^grid-cols-(.+)$/, ([, cols]) => {
      return {
        'grid-template-columns': `repeat(${cols}, minmax(0, 1fr))`
      }
    }]
  ]
})
```

## 📐 布局相关规则

### 尺寸控制规则
```typescript
rules: [
  // 侧边栏宽度
  ['sidebar-width', { 'width': 'var(--sidebar-width)' }],
  
  // 头部高度
  ['header-height', { 'height': 'var(--header-height)' }],
  
  // 标签视图高度
  ['tags-view-height', { 'height': 'var(--tags-view-height)' }],
  
  // 动态宽度设置
  [/^w-custom-(.+)$/, ([, width]) => ({ width: `${width}px` })],
  
  // 动态高度设置
  [/^h-custom-(.+)$/, ([, height]) => ({ height: `${height}px` })]
]
```

**使用示例**：
```html
<!-- 系统布局尺寸 -->
<aside class="sidebar-width bg-gray-800 text-white">侧边栏</aside>
<header class="header-height bg-white shadow-sm">头部导航</header>
<div class="tags-view-height bg-gray-50 border-b">标签栏</div>

<!-- 自定义尺寸 -->
<div class="w-custom-350 h-custom-200 bg-blue-100">
  自定义尺寸容器 (350px × 200px)
</div>
```

### 滚动控制规则
```typescript
rules: [
  // 基础滚动
  ['scrollbar', { 'overflow': 'auto' }],
  ['scrollbar-none', { 'overflow': 'hidden' }],
  
  // 方向滚动
  ['scrollbar-x', { 'overflow-x': 'auto', 'overflow-y': 'hidden' }],
  ['scrollbar-y', { 'overflow-y': 'auto', 'overflow-x': 'hidden' }],
  
  // 平滑滚动
  ['scroll-smooth', { 'scroll-behavior': 'smooth' }],
  
  // 滚动条样式（webkit）
  ['scrollbar-thin', {
    '&::-webkit-scrollbar': {
      width: '4px',
      height: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.2)',
      'border-radius': '2px'
    }
  }],
  
  // 隐藏滚动条但保持滚动功能
  ['scrollbar-hide', {
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  }]
]
```

**使用示例**：
```html
<!-- 滚动容器 -->
<div class="h-80 scrollbar-y scrollbar-thin bg-white border rounded-lg">
  <div class="p-4">
    <p>这里是很长的内容...</p>
    <p>可以垂直滚动...</p>
    <!-- 更多内容 -->
  </div>
</div>

<!-- 水平滚动表格 -->
<div class="scrollbar-x scrollbar-hide">
  <table class="min-w-full whitespace-nowrap">
    <thead>
      <tr class="bg-gray-50">
        <th class="px-6 py-3">列1</th>
        <th class="px-6 py-3">列2</th>
        <th class="px-6 py-3">列3</th>
        <!-- 更多列 -->
      </tr>
    </thead>
    <tbody>
      <!-- 表格数据 -->
    </tbody>
  </table>
</div>

<!-- 平滑滚动容器 -->
<div class="h-96 overflow-y-auto scroll-smooth">
  <div id="section1" class="h-64 bg-red-100 flex items-center justify-center">
    <h2 class="text-2xl font-bold">第一部分</h2>
  </div>
  <div id="section2" class="h-64 bg-green-100 flex items-center justify-center">
    <h2 class="text-2xl font-bold">第二部分</h2>
  </div>
</div>
```

## 📝 文本处理规则

### 文本省略规则
```typescript
rules: [
  // 单行省略
  ['text-ellipsis', {
    'white-space': 'nowrap',
    'overflow': 'hidden',
    'text-overflow': 'ellipsis'
  }],
  
  // 多行省略
  [/^line-clamp-(\d+)$/, ([, lines]) => ({
    'overflow': 'hidden',
    'display': '-webkit-box',
    '-webkit-line-clamp': lines,
    '-webkit-box-orient': 'vertical'
  })],
  
  // 字符限制
  [/^char-limit-(\d+)$/, ([, chars]) => ({
    'max-width': `${chars}ch`,
    'overflow': 'hidden',
    'text-overflow': 'ellipsis',
    'white-space': 'nowrap'
  })]
]
```

**使用示例**：
```html
<!-- 单行文本省略 -->
<div class="w-48">
  <p class="text-ellipsis text-gray-700">
    这是一段很长的文本内容，会被截断并显示省略号
  </p>
</div>

<!-- 多行文本省略 -->
<div class="w-64">
  <p class="line-clamp-3 text-gray-600">
    这是一段很长的文本内容，会被限制在三行内显示。
    超出部分会被截断并显示省略号。
    这样可以保持布局的整齐性。
    多余的文本将被隐藏。
  </p>
</div>

<!-- 字符数限制 -->
<div>
  <p class="char-limit-20 text-sm">
    这段文本会被限制在20个字符宽度内
  </p>
</div>

<!-- 卡片中的文本处理 -->
<div class="max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
  <img src="image.jpg" alt="图片" class="w-full h-48 object-cover">
  <div class="p-4">
    <h3 class="text-ellipsis font-semibold text-lg mb-2">
      这是一个很长的卡片标题可能会被截断
    </h3>
    <p class="line-clamp-2 text-gray-600 text-sm">
      这是卡片的描述内容，可能会很长，
      所以我们使用两行省略来保持布局的整齐。
      多余的内容会被隐藏起来。
    </p>
  </div>
</div>
```

### 文本装饰规则
```typescript
rules: [
  // 文本阴影
  ['text-shadow', {
    'text-shadow': '1px 1px 2px rgba(0, 0, 0, 0.1)'
  }],
  ['text-shadow-lg', {
    'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.2)'
  }],
  
  // 文本描边
  [/^text-stroke-(.+)$/, ([, width]) => ({
    '-webkit-text-stroke': `${width}px currentColor`,
    'text-stroke': `${width}px currentColor`
  })],
  
  // 文本渐变
  ['text-gradient', {
    'background': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    '-webkit-background-clip': 'text',
    'background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    'color': 'transparent'
  }],
  
  // 打字机效果
  ['text-typing', {
    'border-right': '2px solid',
    'white-space': 'nowrap',
    'overflow': 'hidden',
    'animation': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite'
  }]
]
```

**使用示例**：
```html
<!-- 文本特效 -->
<div class="space-y-4">
  <h1 class="text-3xl font-bold text-shadow-lg">带阴影的标题</h1>
  
  <h2 class="text-2xl font-bold text-stroke-1 text-white bg-black p-4">
    描边文字效果
  </h2>
  
  <h3 class="text-4xl font-bold text-gradient">
    渐变色标题
  </h3>
  
  <div class="text-typing font-mono text-xl">
    打字机效果文本...
  </div>
</div>
```

## 🎨 视觉效果规则

### 定位和变换规则
```typescript
rules: [
  // 相对定位并填满容器
  ['relative-full', {
    'position': 'relative',
    'width': '100%',
    'height': '100%'
  }],
  
  // 绝对定位居中
  ['absolute-center', {
    'position': 'absolute',
    'top': '50%',
    'left': '50%',
    'transform': 'translate(-50%, -50%)'
  }],
  
  // 固定宽高比
  [/^aspect-(\d+)-(\d+)$/, ([, w, h]) => ({
    'aspect-ratio': `${w}/${h}`
  })],
  
  // 3D 变换
  ['transform-3d', {
    'transform-style': 'preserve-3d'
  }],
  
  // 硬件加速
  ['gpu-accelerated', {
    'transform': 'translateZ(0)',
    'backface-visibility': 'hidden',
    'perspective': '1000px'
  }]
]
```

**使用示例**：
```html
<!-- 定位布局 -->
<div class="relative-full bg-gray-100">
  <div class="absolute-center bg-white p-8 rounded-lg shadow-lg">
    <h2 class="text-xl font-semibold mb-4">居中弹窗</h2>
    <p>这是一个居中显示的内容块</p>
  </div>
</div>

<!-- 宽高比容器 -->
<div class="aspect-16-9 bg-gray-200 rounded-lg overflow-hidden">
  <img src="video-thumbnail.jpg" alt="视频缩略图" class="w-full h-full object-cover">
  <div class="absolute-center">
    <button class="bg-white bg-opacity-80 rounded-full p-4 hover:bg-opacity-100 transition-all">
      <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
      </svg>
    </button>
  </div>
</div>

<!-- 3D 卡片效果 -->
<div class="transform-3d gpu-accelerated perspective-1000">
  <div class="bg-white rounded-xl shadow-lg p-6 hover:rotateY-12 transition-transform duration-300">
    <h3 class="text-lg font-semibold mb-2">3D 卡片</h3>
    <p class="text-gray-600">鼠标悬停查看3D效果</p>
  </div>
</div>
```

### 滤镜效果规则
```typescript
rules: [
  // 模糊效果
  [/^blur-(\d+)$/, ([, amount]) => ({
    'filter': `blur(${amount}px)`
  })],
  
  // 亮度调节
  [/^brightness-(\d+)$/, ([, value]) => ({
    'filter': `brightness(${value}%)`
  })],
  
  // 对比度调节
  [/^contrast-(\d+)$/, ([, value]) => ({
    'filter': `contrast(${value}%)`
  })],
  
  // 饱和度调节
  [/^saturate-(\d+)$/, ([, value]) => ({
    'filter': `saturate(${value}%)`
  })],
  
  // 色相旋转
  [/^hue-rotate-(\d+)$/, ([, deg]) => ({
    'filter': `hue-rotate(${deg}deg)`
  })],
  
  // 投影效果
  [/^drop-shadow-(.+)$/, ([, shadow]) => ({
    'filter': `drop-shadow(${shadow.replace(/-/g, ' ')})`
  })],
  
  // 组合滤镜
  ['filter-vintage', {
    'filter': 'sepia(50%) contrast(120%) brightness(110%) saturate(90%)'
  }],
  
  ['filter-grayscale', {
    'filter': 'grayscale(100%)'
  }]
]
```

**使用示例**：
```html
<!-- 滤镜效果展示 -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <!-- 原图 -->
  <div class="text-center">
    <img src="sample.jpg" alt="原图" class="w-full h-32 object-cover rounded-lg">
    <p class="text-sm mt-2">原图</p>
  </div>
  
  <!-- 模糊效果 -->
  <div class="text-center">
    <img src="sample.jpg" alt="模糊" class="w-full h-32 object-cover rounded-lg blur-4">
    <p class="text-sm mt-2">模糊</p>
  </div>
  
  <!-- 复古效果 -->
  <div class="text-center">
    <img src="sample.jpg" alt="复古" class="w-full h-32 object-cover rounded-lg filter-vintage">
    <p class="text-sm mt-2">复古</p>
  </div>
  
  <!-- 灰度效果 -->
  <div class="text-center">
    <img src="sample.jpg" alt="灰度" class="w-full h-32 object-cover rounded-lg filter-grayscale">
    <p class="text-sm mt-2">灰度</p>
  </div>
</div>

<!-- 悬停滤镜效果 -->
<div class="group relative overflow-hidden rounded-lg">
  <img src="sample.jpg" alt="悬停效果" class="w-full h-48 object-cover transition-all duration-300 group-hover:brightness-110 group-hover:saturate-120">
  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
    <span class="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
      查看详情
    </span>
  </div>
</div>
```

## 🎭 动画和过渡规则

### 自定义动画规则
```typescript
rules: [
  // 呼吸动画
  ['animate-breathing', {
    'animation': 'breathing 2s ease-in-out infinite alternate'
  }],
  
  // 脉动动画
  ['animate-pulse-slow', {
    'animation': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  }],
  
  // 摇摆动画
  ['animate-wiggle', {
    'animation': 'wiggle 1s ease-in-out infinite'
  }],
  
  // 弹跳进入
  ['animate-bounce-in', {
    'animation': 'bounceIn 0.75s ease-out'
  }],
  
  // 淡入放大
  ['animate-zoom-in', {
    'animation': 'zoomIn 0.5s ease-out'
  }],
  
  // 滑入效果
  [/^animate-slide-in-(.+)$/, ([, direction]) => {
    const directions = {
      'left': 'slideInLeft',
      'right': 'slideInRight', 
      'up': 'slideInUp',
      'down': 'slideInDown'
    }
    return {
      'animation': `${directions[direction] || 'slideInLeft'} 0.5s ease-out`
    }
  }]
]
```

**使用示例**：
```html
<!-- 动画效果展示 -->
<div class="grid grid-cols-2 md:grid-cols-3 gap-6 p-8">
  <!-- 呼吸效果 -->
  <div class="text-center">
    <div class="w-16 h-16 bg-blue-500 rounded-full mx-auto animate-breathing"></div>
    <p class="mt-2 text-sm">呼吸动画</p>
  </div>
  
  <!-- 慢脉动 -->
  <div class="text-center">
    <div class="w-16 h-16 bg-green-500 rounded-full mx-auto animate-pulse-slow"></div>
    <p class="mt-2 text-sm">慢脉动</p>
  </div>
  
  <!-- 摇摆效果 -->
  <div class="text-center">
    <div class="w-16 h-16 bg-red-500 rounded-full mx-auto animate-wiggle"></div>
    <p class="mt-2 text-sm">摇摆动画</p>
  </div>
</div>

<!-- 页面进入动画 -->
<section class="animate-slide-in-up">
  <h2 class="text-2xl font-bold mb-4 animate-zoom-in">欢迎来到我们的网站</h2>
  <p class="text-gray-600 animate-slide-in-left" style="animation-delay: 0.2s;">
    这里是网站的介绍内容
  </p>
  <button class="mt-4 px-6 py-2 bg-blue-500 text-white rounded animate-bounce-in" style="animation-delay: 0.4s;">
    立即开始
  </button>
</section>
```

### 过渡效果规则
```typescript
rules: [
  // 自定义过渡时长
  [/^duration-(.+)$/, ([, time]) => ({
    'transition-duration': `${time}ms`
  })],
  
  // 自定义缓动函数
  ['ease-bounce', {
    'transition-timing-function': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }],
  
  ['ease-in-back', {
    'transition-timing-function': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)'
  }],
  
  ['ease-out-back', {
    'transition-timing-function': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }],
  
  // 多属性过渡
  ['transition-all-smooth', {
    'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }],
  
  ['transition-colors-fast', {
    'transition': 'background-color 0.15s ease, color 0.15s ease'
  }]
]
```

**使用示例**：
```html
<!-- 过渡效果按钮 -->
<div class="space-x-4">
  <button class="px-6 py-2 bg-blue-500 text-white rounded transition-all-smooth hover:bg-blue-600 hover:scale-105">
    平滑过渡
  </button>
  
  <button class="px-6 py-2 bg-green-500 text-white rounded duration-200 ease-bounce hover:bg-green-600 hover:scale-110">
    弹跳效果
  </button>
  
  <button class="px-6 py-2 bg-purple-500 text-white rounded duration-300 ease-out-back hover:bg-purple-600 hover:scale-105">
    回弹效果
  </button>
</div>

<!-- 卡片悬停效果 -->
<div class="max-w-sm bg-white rounded-lg shadow-md transition-all-smooth hover:shadow-xl hover:scale-102 cursor-pointer">
  <img src="card-image.jpg" alt="卡片图片" class="w-full h-48 object-cover rounded-t-lg">
  <div class="p-6">
    <h3 class="text-lg font-semibold mb-2 transition-colors-fast group-hover:text-blue-600">
      卡片标题
    </h3>
    <p class="text-gray-600">卡片描述内容...</p>
  </div>
</div>
```

## 🔧 实用工具规则

### 调试辅助规则
```typescript
rules: [
  // 边框调试
  ['debug-border', {
    'border': '1px solid red !important'
  }],
  
  ['debug-outline', {
    'outline': '2px solid lime !important',
    'outline-offset': '2px'
  }],
  
  // 网格调试
  ['debug-grid', {
    'background-image': 'linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px)',
    'background-size': '20px 20px'
  }],
  
  // 内容占位
  ['placeholder-content', {
    '&::before': {
      'content': '"Lorem ipsum dolor sit amet..."',
      'color': '#666',
      'font-style': 'italic'
    }
  }],
  
  // 开发环境显示
  ['dev-only', {
    '@media (prefers-reduced-motion: no-preference)': {
      'display': 'block'
    }
  }]
]
```

### 性能优化规则
```typescript
rules: [
  // 内容可见性优化
  ['content-visibility-auto', {
    'content-visibility': 'auto'
  }],
  
  // 图层提升
  ['will-change-transform', {
    'will-change': 'transform'
  }],
  
  ['will-change-opacity', {
    'will-change': 'opacity'
  }],
  
  // 字体渲染优化
  ['font-smooth', {
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale'
  }],
  
  // 触摸优化
  ['touch-manipulation', {
    'touch-action': 'manipulation'
  }]
]
```

**使用示例**：
```html
<!-- 调试模式 -->
<div class="debug-grid p-4">
  <div class="debug-border p-4 mb-4">
    <h2 class="debug-outline">调试标题</h2>
    <p class="placeholder-content"></p>
  </div>
</div>

<!-- 性能优化 -->
<div class="content-visibility-auto">
  <div class="will-change-transform hover:scale-105 transition-transform">
    <img src="large-image.jpg" alt="大图片" class="w-full font-smooth">
  </div>
</div>

<!-- 移动端优化 -->
<button class="touch-manipulation bg-blue-500 text-white px-6 py-3 rounded-lg active:scale-95 transition-transform">
  触摸按钮
</button>
```

## 📱 响应式自定义规则

### 容器查询规则
```typescript
rules: [
  // 容器查询支持
  [/^container-(.+)$/, ([, size]) => {
    const sizes = {
      'xs': '320px',
      'sm': '640px', 
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px'
    }
    return {
      'container-type': 'inline-size',
      '@container': `(min-width: ${sizes[size]}) { /* 样式 */ }`
    }
  }],
  
  // 视口单位
  ['vh-screen', { 'height': '100vh' }],
  ['vw-screen', { 'width': '100vw' }],
  ['dvh-screen', { 'height': '100dvh' }], // 动态视口高度
  ['svh-screen', { 'height': '100svh' }], // 小视口高度
  ['lvh-screen', { 'height': '100lvh' }], // 大视口高度
]
```

## 🎨 主题相关规则

### 主题切换规则
```typescript
rules: [
  // CSS变量绑定
  [/^var-(.+)$/, ([, varName]) => ({
    [varName.replace(/-/g, '_')]: `var(--${varName})`
  })],
  
  // 主题感知样式
  ['theme-bg', {
    'background-color': 'var(--bg-color)',
    'color': 'var(--text-color)'
  }],
  
  ['theme-border', {
    'border-color': 'var(--border-color)'
  }],
  
  // 系统主题检测
  ['prefer-dark', {
    '@media (prefers-color-scheme: dark)': {
      /* 暗色样式 */
    }
  }],
  
  ['prefer-light', {
    '@media (prefers-color-scheme: light)': {
      /* 亮色样式 */
    }
  }]
]
```

**使用示例**：
```html
<!-- 主题适配组件 -->
<div class="theme-bg theme-border border rounded-lg p-6">
  <h2 class="var-heading-color text-xl font-semibold">主题标题</h2>
  <p class="var-text-secondary">这是主题适配的文本内容</p>
</div>

<!-- 系统主题响应 -->
<div class="prefer-dark:bg-gray-900 prefer-light:bg-white p-4 rounded-lg">
  <p class="prefer-dark:text-white prefer-light:text-gray-900">
    根据系统主题自动调整的内容
  </p>
</div>
```

## 📊 使用建议

### 1. 规则命名规范
- 使用描述性名称：`text-ellipsis` 而不是 `te`
- 保持一致的命名模式：`animate-*`, `filter-*`
- 避免与现有工具类冲突

### 2. 性能考虑
- 优先使用静态规则
- 复杂动态规则考虑性能影响
- 合理使用正则表达式

### 3. 维护性原则
- 添加注释说明规则用途
- 定期review和优化规则
- 记录规则的使用场景

通过自定义规则，我们可以扩展 UnoCSS 的能力，满足项目的特殊需求，同时保持代码的简洁和可维护性。
