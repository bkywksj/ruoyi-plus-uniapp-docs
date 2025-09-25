# 快捷方式定义

UnoCSS 的快捷方式功能允许我们将复杂的样式组合定义为简单的类名，提高开发效率并保持样式一致性。

## 🎯 快捷方式概述

快捷方式 (Shortcuts) 是 UnoCSS 的核心功能之一，它允许将多个原子化类组合成一个语义化的类名。

### 基本语法
```typescript
// uno.config.ts
export default defineConfig({
  shortcuts: {
    // 静态快捷方式
    'btn': 'px-4 py-2 rounded cursor-pointer',
    
    // 动态快捷方式
    'btn-variant': (params) => `btn ${params[0] || 'primary'}`,
    
    // 数组形式
    'flex-center': ['flex', 'items-center', 'justify-center']
  }
})
```

## 📐 布局快捷方式

### 弹性布局组合
```typescript
shortcuts: {
  // 居中对齐
  'flex-center': 'flex items-center justify-center',
  'flex-between': 'flex items-center justify-between',
  'flex-around': 'flex items-center justify-around',
  'flex-evenly': 'flex items-center justify-evenly',
  
  // 垂直布局
  'flex-col-center': 'flex flex-col items-center justify-center',
  'flex-col-between': 'flex flex-col justify-between',
  
  // 对齐变体
  'flex-start': 'flex items-center justify-start',
  'flex-end': 'flex items-center justify-end'
}
```

**使用示例**：
```html
<!-- 水平居中 -->
<div class="flex-center h-screen">
  <div class="p-8 bg-white rounded-lg shadow">
    居中内容
  </div>
</div>

<!-- 两端对齐的导航栏 -->
<nav class="flex-between px-6 py-4 bg-white shadow">
  <div class="flex items-center">
    <img src="logo.png" alt="Logo" class="h-8">
    <span class="ml-3 font-semibold">项目名称</span>
  </div>
  <div class="flex items-center space-x-4">
    <a href="#" class="text-gray-600 hover:text-gray-900">链接1</a>
    <a href="#" class="text-gray-600 hover:text-gray-900">链接2</a>
  </div>
</nav>

<!-- 垂直居中布局 -->
<div class="flex-col-center min-h-screen bg-gray-50">
  <h1 class="text-3xl font-bold mb-8">欢迎页面</h1>
  <button class="px-6 py-3 bg-blue-500 text-white rounded-lg">
    开始使用
  </button>
</div>
```

### 绝对定位组合
```typescript
shortcuts: {
  // 绝对定位居中
  'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  'absolute-full': 'absolute top-0 left-0 right-0 bottom-0',
  
  // 定位变体
  'absolute-top-center': 'absolute top-0 left-1/2 transform -translate-x-1/2',
  'absolute-bottom-center': 'absolute bottom-0 left-1/2 transform -translate-x-1/2',
  'absolute-left-center': 'absolute left-0 top-1/2 transform -translate-y-1/2',
  'absolute-right-center': 'absolute right-0 top-1/2 transform -translate-y-1/2'
}
```

**使用示例**：
```html
<!-- 模态框遮罩 -->
<div class="fixed absolute-full bg-black bg-opacity-50 z-50">
  <div class="absolute-center bg-white rounded-lg p-8 max-w-md w-full mx-4">
    <h2 class="text-xl font-semibold mb-4">确认对话框</h2>
    <p class="text-gray-600 mb-6">确定要执行此操作吗？</p>
    <div class="flex justify-end space-x-3">
      <button class="px-4 py-2 text-gray-500 hover:text-gray-700">取消</button>
      <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">确定</button>
    </div>
  </div>
</div>

<!-- 悬浮标签 -->
<div class="relative">
  <img src="image.jpg" alt="图片" class="w-full h-48 object-cover rounded-lg">
  <span class="absolute-top-center mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
    新品
  </span>
</div>
```

## 🧱 组件快捷方式

### 卡片组件
```typescript
shortcuts: {
  // 基础卡片
  'card': 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6',
  'card-hover': 'card hover:shadow-lg transition-shadow duration-300',
  
  // 卡片变体
  'card-bordered': 'card border border-gray-200 dark:border-gray-700',
  'card-flat': 'bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6',
  
  // 卡片头部
  'card-header': 'flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-4'
}
```

**使用示例**：
```html
<!-- 产品卡片 -->
<div class="card-hover max-w-sm">
  <div class="card-header">
    <h3 class="text-lg font-semibold">产品名称</h3>
    <span class="text-sm text-green-600 font-medium">￥199</span>
  </div>
  <img src="product.jpg" alt="产品图片" class="w-full h-48 object-cover rounded mb-4">
  <p class="text-gray-600 dark:text-gray-300 mb-4">产品描述信息...</p>
  <button class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
    立即购买
  </button>
</div>

<!-- 统计卡片 -->
<div class="card-flat">
  <div class="flex items-center">
    <div class="p-3 bg-blue-100 rounded-full mr-4">
      <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
      </svg>
    </div>
    <div>
      <p class="text-sm text-gray-500">总用户数</p>
      <p class="text-2xl font-semibold">1,234</p>
    </div>
  </div>
</div>
```

### 按钮组件
```typescript
shortcuts: {
  // 按钮基础
  'btn-base': 'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  // 按钮变体
  'btn-primary': 'btn-base bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
  'btn-secondary': 'btn-base bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
  'btn-success': 'btn-base bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
  'btn-danger': 'btn-base bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  'btn-warning': 'btn-base bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  
  // 按钮尺寸
  'btn-sm': 'px-3 py-1.5 text-sm',
  'btn-lg': 'px-6 py-3 text-lg',
  'btn-xl': 'px-8 py-4 text-xl',
  
  // 按钮样式
  'btn-outline': 'bg-transparent border-2',
  'btn-ghost': 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
  'btn-round': 'rounded-full',
  'btn-square': 'p-2 w-10 h-10'
}
```

**使用示例**：
```html
<!-- 按钮组合 -->
<div class="space-x-4">
  <button class="btn-primary">主要按钮</button>
  <button class="btn-secondary">次要按钮</button>
  <button class="btn-success btn-sm">成功</button>
  <button class="btn-danger btn-lg">删除</button>
</div>

<!-- 轮廓按钮 -->
<div class="space-x-4">
  <button class="btn-base btn-outline border-blue-500 text-blue-500 hover:bg-blue-50">
    轮廓按钮
  </button>
  <button class="btn-ghost text-gray-700">
    幽灵按钮
  </button>
</div>

<!-- 圆形图标按钮 -->
<div class="space-x-2">
  <button class="btn-square btn-primary btn-round">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
    </svg>
  </button>
  <button class="btn-square btn-secondary btn-round">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
    </svg>
  </button>
</div>
```

### 表单组件
```typescript
shortcuts: {
  // 输入框
  'input-base': 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
  'input-error': 'input-base border-red-500 focus:ring-red-500 focus:border-red-500',
  'input-success': 'input-base border-green-500 focus:ring-green-500 focus:border-green-500',
  
  // 标签
  'label-base': 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
  'label-required': 'label-base after:content-["*"] after:text-red-500 after:ml-1'
}
```

**使用示例**：
```html
<!-- 表单组合 -->
<form class="space-y-6">
  <div>
    <label class="label-required">用户名</label>
    <input type="text" class="input-base" placeholder="请输入用户名">
  </div>
  
  <div>
    <label class="label-base">邮箱</label>
    <input type="email" class="input-success" value="user@example.com" readonly>
    <p class="text-sm text-green-600 mt-1">邮箱验证通过</p>
  </div>
  
  <div>
    <label class="label-base">密码</label>
    <input type="password" class="input-error" placeholder="请输入密码">
    <p class="text-sm text-red-600 mt-1">密码至少8位字符</p>
  </div>
</form>
```

## 🏷️ 标签和徽章快捷方式

### 标签组件
```typescript
shortcuts: {
  // 基础标签
  'tag': 'inline-block px-2 py-1 text-xs rounded',
  'tag-sm': 'inline-block px-1.5 py-0.5 text-xs rounded',
  'tag-lg': 'inline-block px-3 py-1.5 text-sm rounded',
  
  // 状态标签
  'tag-primary': 'tag bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'tag-success': 'tag bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'tag-warning': 'tag bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'tag-danger': 'tag bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'tag-info': 'tag bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  
  // 徽章
  'badge': 'inline-flex items-center justify-center min-w-6 h-6 text-xs font-medium rounded-full',
  'badge-dot': 'w-2 h-2 rounded-full',
  'badge-count': 'badge bg-red-500 text-white'
}
```

**使用示例**：
```html
<!-- 状态标签 -->
<div class="space-x-2 mb-4">
  <span class="tag-success">已完成</span>
  <span class="tag-warning">进行中</span>
  <span class="tag-danger">已取消</span>
  <span class="tag-info">草稿</span>
</div>

<!-- 通知徽章 -->
<div class="relative inline-block">
  <button class="p-2 text-gray-500 hover:text-gray-700">
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
    </svg>
  </button>
  <span class="badge-count absolute -top-1 -right-1">5</span>
</div>

<!-- 状态点 -->
<div class="flex items-center space-x-2">
  <span class="badge-dot bg-green-400"></span>
  <span class="text-sm">在线状态</span>
</div>
```

## 📱 响应式快捷方式

### 响应式布局
```typescript
shortcuts: {
  // 响应式网格
  'grid-responsive': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  'grid-auto': 'grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4',
  
  // 响应式弹性布局
  'flex-responsive': 'flex flex-col md:flex-row',
  'flex-wrap-responsive': 'flex flex-wrap -mx-2',
  
  // 响应式间距
  'p-responsive': 'p-4 md:p-6 lg:p-8',
  'm-responsive': 'm-4 md:m-6 lg:m-8',
  
  // 响应式文本
  'text-responsive': 'text-sm md:text-base lg:text-lg',
  'heading-responsive': 'text-xl md:text-2xl lg:text-3xl xl:text-4xl'
}
```

**使用示例**：
```html
<!-- 响应式产品网格 -->
<div class="grid-responsive p-responsive">
  <div class="card">产品 1</div>
  <div class="card">产品 2</div>
  <div class="card">产品 3</div>
  <div class="card">产品 4</div>
</div>

<!-- 响应式文章布局 -->
<article class="flex-responsive gap-8">
  <div class="flex-1">
    <h1 class="heading-responsive font-bold mb-4">文章标题</h1>
    <p class="text-responsive text-gray-600">文章内容...</p>
  </div>
  <aside class="w-full md:w-80">
    <div class="card">侧边栏内容</div>
  </aside>
</article>
```

## 🎨 主题快捷方式

### 主题适配
```typescript
shortcuts: {
  // 主题感知的背景
  'bg-base': 'bg-white dark:bg-gray-900',
  'bg-surface': 'bg-gray-50 dark:bg-gray-800',
  'bg-elevated': 'bg-white dark:bg-gray-800',
  
  // 主题感知的文本
  'text-base': 'text-gray-900 dark:text-gray-100',
  'text-muted': 'text-gray-500 dark:text-gray-400',
  'text-inverse': 'text-white dark:text-gray-900',
  
  // 主题感知的边框
  'border-base': 'border-gray-200 dark:border-gray-700',
  'border-light': 'border-gray-100 dark:border-gray-800',
  
  // 主题感知的阴影
  'shadow-base': 'shadow-lg dark:shadow-2xl dark:shadow-black/20'
}
```

**使用示例**：
```html
<!-- 主题适配的导航栏 -->
<nav class="bg-base border-b border-base px-6 py-4">
  <div class="flex-between">
    <h1 class="text-base font-semibold">应用标题</h1>
    <div class="flex items-center space-x-4">
      <span class="text-muted">欢迎，用户</span>
      <button class="btn-base bg-surface text-base hover:bg-elevated">
        设置
      </button>
    </div>
  </div>
</nav>

<!-- 主题适配的卡片 -->
<div class="bg-elevated border-base shadow-base rounded-lg p-6">
  <h2 class="text-base font-semibold mb-2">卡片标题</h2>
  <p class="text-muted">这是一个主题适配的卡片组件</p>
</div>
```

## 🔧 动态快捷方式

### 参数化快捷方式
```typescript
shortcuts: [
  // 动态按钮生成
  [/^btn-(.+)$/, ([, color]) => `btn-base bg-${color}-500 text-white hover:bg-${color}-600`],
  
  // 动态间距
  [/^gap-grid-(.+)$/, ([, size]) => `gap-${size}`],
  
  // 动态圆角
  [/^rounded-(.+)$/, ([, size]) => `rounded-${size}`]
]
```

**使用示例**：
```html
<!-- 动态颜色按钮 -->
<button class="btn-purple">紫色按钮</button>
<button class="btn-pink">粉色按钮</button>
<button class="btn-indigo">靛蓝按钮</button>

<!-- 动态网格间距 -->
<div class="grid grid-cols-3 gap-grid-6">
  <div>内容1</div>
  <div>内容2</div>
  <div>内容3</div>
</div>
```

## 📈 性能优化快捷方式

### 优化相关
```typescript
shortcuts: {
  // 硬件加速
  'gpu': 'transform-gpu',
  'gpu-hover': 'hover:transform-gpu hover:scale-105',
  
  // 平滑滚动
  'scroll-smooth': 'scroll-smooth overflow-y-auto',
  'scroll-hidden': 'overflow-hidden',
  
  // 过渡动画
  'transition-base': 'transition-all duration-200 ease-in-out',
  'transition-fast': 'transition-all duration-100 ease-in-out',
  'transition-slow': 'transition-all duration-500 ease-in-out'
}
```

## 📋 使用建议

### 1. 命名规范
- 使用语义化命名：`btn-primary` 而不是 `blue-button`
- 保持简洁：`flex-center` 而不是 `flex-items-center-justify-center`
- 分层命名：`card`, `card-hover`, `card-bordered`

### 2. 组织结构
```typescript
shortcuts: {
  // 1. 基础布局
  'flex-center': '...',
  'grid-responsive': '...',
  
  // 2. 基础组件
  'btn-base': '...',
  'card': '...',
  
  // 3. 状态变体
  'btn-primary': '...',
  'card-hover': '...',
  
  // 4. 响应式变体
  'p-responsive': '...',
  
  // 5. 主题变体
  'bg-base': '...'
}
```

### 3. 性能考虑
- 避免过度复杂的快捷方式
- 合理使用动态快捷方式
- 优先使用静态定义

通过合理使用快捷方式，我们可以在保持代码简洁的同时，确保样式的一致性和可维护性。
