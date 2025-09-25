# 工具类使用

本文档详细介绍项目中原子化CSS工具类的使用方法、最佳实践和实际案例，帮助开发者高效地进行样式开发。

## 🎯 工具类概述

工具类是单一用途的CSS类，每个类只负责一个样式属性。通过组合多个工具类，可以快速构建复杂的界面样式。

### 基本原则
- **单一职责**：每个类只做一件事
- **可预测性**：类名直接反映样式效果
- **可组合性**：通过组合实现复杂效果
- **响应式**：支持不同屏幕尺寸

## 📐 布局工具类

### Flexbox 布局
```html
<!-- 基础flex布局 -->
<div class="flex">
  <div>项目1</div>
  <div>项目2</div>
  <div>项目3</div>
</div>

<!-- 水平居中对齐 -->
<div class="flex justify-center">
  <button class="px-4 py-2 bg-blue-500 text-white rounded">居中按钮</button>
</div>

<!-- 垂直居中对齐 -->
<div class="flex items-center h-64">
  <div class="bg-gray-200 p-4 rounded">垂直居中内容</div>
</div>

<!-- 完美居中 -->
<div class="flex-center h-64 bg-gray-100">
  <div class="bg-white p-6 rounded shadow">完美居中的内容</div>
</div>

<!-- 两端对齐 -->
<nav class="flex-between p-4 bg-white shadow">
  <div class="flex items-center">
    <img src="logo.svg" alt="Logo" class="h-8 w-8 mr-3">
    <span class="font-semibold">品牌名称</span>
  </div>
  <div class="flex space-x-4">
    <a href="#" class="text-gray-600 hover:text-gray-900">首页</a>
    <a href="#" class="text-gray-600 hover:text-gray-900">关于</a>
  </div>
</nav>

<!-- 响应式flex方向 -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1 bg-blue-100 p-4 rounded">主内容</div>
  <div class="w-full md:w-64 bg-green-100 p-4 rounded">侧边栏</div>
</div>
```

### Grid 布局
```html
<!-- 基础网格 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white p-4 rounded shadow">卡片1</div>
  <div class="bg-white p-4 rounded shadow">卡片2</div>
  <div class="bg-white p-4 rounded shadow">卡片3</div>
</div>

<!-- 自适应网格 -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  <div class="bg-white p-6 rounded-lg shadow-md">自适应卡片1</div>
  <div class="bg-white p-6 rounded-lg shadow-md">自适应卡片2</div>
</div>

<!-- 复杂网格布局 -->
<div class="grid grid-cols-4 grid-rows-3 gap-4 h-96">
  <div class="col-span-2 row-span-2 bg-blue-100 p-4 rounded">主要内容</div>
  <div class="bg-green-100 p-4 rounded">内容1</div>
  <div class="bg-yellow-100 p-4 rounded">内容2</div>
  <div class="col-span-2 bg-purple-100 p-4 rounded">底部内容</div>
</div>
```

## 🎨 颜色和主题工具类

### 文本颜色
```html
<!-- 语义化颜色 -->
<div class="space-y-2">
  <p class="text-primary">主要文本颜色</p>
  <p class="text-success">成功状态文本</p>
  <p class="text-warning">警告状态文本</p>
  <p class="text-danger">错误状态文本</p>
  <p class="text-info">信息状态文本</p>
</div>

<!-- 主题自适应文本 -->
<div class="space-y-2">
  <p class="text-base">基础文本颜色</p>
  <p class="text-text-secondary">次要文本颜色</p>
  <p class="text-text-muted">弱化文本颜色</p>
  <p class="text-heading">标题文本颜色</p>
</div>

<!-- 灰度文本 -->
<div class="space-y-2">
  <p class="text-gray-900 dark:text-gray-100">主要文本</p>
  <p class="text-gray-600 dark:text-gray-300">次要文本</p>
  <p class="text-gray-400 dark:text-gray-500">弱化文本</p>
</div>
```

### 背景颜色
```html
<!-- 状态背景 -->
<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
  <div class="bg-primary text-white p-4 rounded text-center">主要背景</div>
  <div class="bg-success text-white p-4 rounded text-center">成功背景</div>
  <div class="bg-warning text-white p-4 rounded text-center">警告背景</div>
  <div class="bg-danger text-white p-4 rounded text-center">错误背景</div>
</div>

<!-- 主题背景 -->
<div class="space-y-4">
  <div class="bg-bg-base p-4 rounded border">基础背景</div>
  <div class="bg-bg-page p-4 rounded border">页面背景</div>
  <div class="bg-bg-overlay p-4 rounded shadow">覆盖层背景</div>
</div>
```

## 📝 文字排版工具类

### 字体大小和权重
```html
<!-- 字体大小层级 -->
<div class="space-y-4">
  <h1 class="text-4xl font-bold">一级标题 (text-4xl)</h1>
  <h2 class="text-3xl font-bold">二级标题 (text-3xl)</h2>
  <h3 class="text-2xl font-semibold">三级标题 (text-2xl)</h3>
  <h4 class="text-xl font-semibold">四级标题 (text-xl)</h4>
  <h5 class="text-lg font-medium">五级标题 (text-lg)</h5>
  <h6 class="text-base font-medium">六级标题 (text-base)</h6>
</div>

<!-- 响应式字体 -->
<h1 class="text-2xl md:text-4xl lg:text-5xl font-bold">响应式大标题</h1>
<p class="text-sm md:text-base lg:text-lg">响应式段落文本</p>
```

### 文本处理
```html
<!-- 文本省略 -->
<div class="w-48 border rounded p-2">
  <p class="text-ellipsis">这是一段很长的文本将会被截断</p>
</div>

<!-- 多行省略 -->
<div class="w-64 border rounded p-2">
  <p class="line-clamp-2">
    这是一段很长的文本内容，会被限制在两行内显示。
    超出部分会被截断并显示省略号。
  </p>
</div>

<!-- 文本对齐 -->
<div class="space-y-4">
  <p class="text-left">左对齐文本</p>
  <p class="text-center">居中对齐文本</p>
  <p class="text-right">右对齐文本</p>
  <p class="text-justify">两端对齐的长文本内容</p>
</div>
```

## 📦 间距工具类

### 内外边距
```html
<!-- 基础内边距 -->
<div class="space-y-4">
  <div class="bg-blue-100 p-4 rounded">所有方向 4 单位内边距</div>
  <div class="bg-green-100 px-6 py-2 rounded">水平6单位 垂直2单位</div>
</div>

<!-- 响应式内边距 -->
<div class="bg-purple-100 p-2 md:p-6 lg:p-8 rounded">
  响应式内边距: 小屏2 中屏6 大屏8
</div>

<!-- 外边距和自动居中 -->
<div class="mx-auto max-w-4xl p-6">
  <div class="bg-white rounded shadow p-4 mb-6">自动居中的容器</div>
</div>
```

## 🖼️ 边框和圆角

### 边框样式
```html
<!-- 基础边框 -->
<div class="space-y-4">
  <div class="border p-4 rounded">默认边框</div>
  <div class="border-2 border-blue-500 p-4 rounded">蓝色粗边框</div>
  <div class="border-dashed border-gray-400 p-4 rounded">虚线边框</div>
  <div class="border-dotted border-red-500 p-4 rounded">点线边框</div>
</div>

<!-- 单侧边框 -->
<div class="space-y-4">
  <div class="border-l-4 border-blue-500 pl-4">左侧蓝色边框</div>
  <div class="border-t-2 border-green-500 pt-4">顶部绿色边框</div>
  <div class="border-r-4 border-red-500 pr-4">右侧红色边框</div>
  <div class="border-b-2 border-yellow-500 pb-4">底部黄色边框</div>
</div>
```

### 圆角样式
```html
<!-- 圆角变化 -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div class="bg-blue-200 p-4 rounded-none text-center">无圆角</div>
  <div class="bg-green-200 p-4 rounded-sm text-center">小圆角</div>
  <div class="bg-yellow-200 p-4 rounded text-center">默认圆角</div>
  <div class="bg-purple-200 p-4 rounded-lg text-center">大圆角</div>
  <div class="bg-pink-200 p-4 rounded-xl text-center">超大圆角</div>
  <div class="bg-indigo-200 p-4 rounded-2xl text-center">巨大圆角</div>
  <div class="bg-red-200 p-4 rounded-full text-center w-20 h-20 flex items-center justify-center">圆形</div>
</div>

<!-- 单侧圆角 -->
<div class="space-y-4">
  <div class="bg-blue-200 p-4 rounded-t-lg">顶部圆角</div>
  <div class="bg-green-200 p-4 rounded-b-lg">底部圆角</div>
  <div class="bg-yellow-200 p-4 rounded-l-lg">左侧圆角</div>
  <div class="bg-purple-200 p-4 rounded-r-lg">右侧圆角</div>
</div>
```

## ✨ 阴影和效果

### 阴影效果
```html
<!-- 阴影层级 -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
  <div class="bg-white p-6 rounded-lg shadow-sm text-center">
    <h3 class="font-semibold mb-2">浅阴影</h3>
    <p class="text-gray-600">shadow-sm</p>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow text-center">
    <h3 class="font-semibold mb-2">标准阴影</h3>
    <p class="text-gray-600">shadow</p>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow-md text-center">
    <h3 class="font-semibold mb-2">中等阴影</h3>
    <p class="text-gray-600">shadow-md</p>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow-lg text-center">
    <h3 class="font-semibold mb-2">大阴影</h3>
    <p class="text-gray-600">shadow-lg</p>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow-xl text-center">
    <h3 class="font-semibold mb-2">超大阴影</h3>
    <p class="text-gray-600">shadow-xl</p>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow-2xl text-center">
    <h3 class="font-semibold mb-2">巨大阴影</h3>
    <p class="text-gray-600">shadow-2xl</p>
  </div>
</div>

<!-- 内阴影 -->
<div class="bg-gray-100 p-8 rounded-lg shadow-inner">
  <p class="text-center text-gray-700">内阴影效果 (shadow-inner)</p>
</div>

<!-- 彩色阴影 -->
<div class="space-y-6">
  <div class="bg-white p-6 rounded-lg shadow-lg shadow-blue-500/25">
    蓝色阴影效果
  </div>
  <div class="bg-white p-6 rounded-lg shadow-lg shadow-green-500/25">
    绿色阴影效果
  </div>
</div>
```

## 🎭 过渡和动画

### 过渡效果
```html
<!-- 基础过渡 -->
<div class="space-y-4">
  <button class="bg-blue-500 text-white px-6 py-2 rounded transition hover:bg-blue-600">
    悬停变色按钮
  </button>
  
  <button class="bg-green-500 text-white px-6 py-2 rounded transition-transform hover:scale-105">
    悬停放大按钮
  </button>
  
  <button class="bg-purple-500 text-white px-6 py-2 rounded transition-all duration-300 hover:bg-purple-600 hover:scale-105 hover:shadow-lg">
    综合效果按钮
  </button>
</div>

<!-- 过渡时长 -->
<div class="space-x-4">
  <button class="bg-red-500 text-white px-4 py-2 rounded transition-colors duration-75 hover:bg-red-600">
    快速过渡 (75ms)
  </button>
  <button class="bg-red-500 text-white px-4 py-2 rounded transition-colors duration-300 hover:bg-red-600">
    正常过渡 (300ms)
  </button>
  <button class="bg-red-500 text-white px-4 py-2 rounded transition-colors duration-700 hover:bg-red-600">
    慢速过渡 (700ms)
  </button>
</div>
```

### 变换效果
```html
<!-- 缩放效果 -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div class="bg-blue-200 p-4 rounded text-center transition-transform hover:scale-105 cursor-pointer">
    悬停放大 5%
  </div>
  <div class="bg-green-200 p-4 rounded text-center transition-transform hover:scale-110 cursor-pointer">
    悬停放大 10%
  </div>
  <div class="bg-yellow-200 p-4 rounded text-center transition-transform hover:scale-95 cursor-pointer">
    悬停缩小 5%
  </div>
  <div class="bg-purple-200 p-4 rounded text-center transition-transform hover:-rotate-6 cursor-pointer">
    悬停旋转
  </div>
</div>

<!-- 平移效果 -->
<div class="space-y-4">
  <div class="bg-indigo-200 p-4 rounded transition-transform hover:translate-x-2">
    悬停右移
  </div>
  <div class="bg-pink-200 p-4 rounded transition-transform hover:-translate-y-1">
    悬停上移
  </div>
</div>
```

## 🔧 交互状态

### 悬停效果
```html
<!-- 按钮悬停效果 -->
<div class="space-x-4 mb-8">
  <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition">
    背景变化
  </button>
  
  <button class="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-6 py-2 rounded transition">
    填充效果
  </button>
  
  <button class="bg-purple-500 text-white px-6 py-2 rounded transition transform hover:scale-105 hover:shadow-lg">
    立体效果
  </button>
</div>

<!-- 卡片悬停效果 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
    <h3 class="font-semibold mb-2">阴影提升</h3>
    <p class="text-gray-600">悬停时阴影加深</p>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
    <h3 class="font-semibold mb-2">上浮效果</h3>
    <p class="text-gray-600">悬停时向上浮动</p>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow transition-all hover:bg-blue-50 hover:border-blue-200 border border-transparent cursor-pointer">
    <h3 class="font-semibold mb-2">背景变化</h3>
    <p class="text-gray-600">悬停时背景色改变</p>
  </div>
</div>
```

### 焦点状态
```html
<!-- 表单焦点效果 -->
<div class="space-y-4 max-w-md">
  <input 
    type="text" 
    placeholder="默认输入框"
    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
  >
  
  <input 
    type="email" 
    placeholder="邮箱地址"
    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
  >
  
  <textarea 
    placeholder="文本区域"
    rows="3"
    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
  ></textarea>
</div>
```

## 📱 响应式工具类

### 断点前缀
```html
<!-- 响应式布局 -->
<div class="flex flex-col md:flex-row lg:flex-row xl:flex-row gap-4">
  <div class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 bg-blue-100 p-4 rounded">
    响应式宽度盒子
  </div>
</div>

<!-- 响应式显示/隐藏 -->
<div class="space-y-4">
  <div class="block md:hidden bg-red-100 p-4 rounded">
    只在移动端显示
  </div>
  
  <div class="hidden md:block lg:hidden bg-green-100 p-4 rounded">
    只在平板端显示
  </div>
  
  <div class="hidden lg:block bg-blue-100 p-4 rounded">
    只在桌面端显示
  </div>
</div>

<!-- 响应式文本大小 -->
<h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
  响应式标题文字
</h1>
```

## 🎨 自定义快捷方式

基于 UnoCSS 配置，项目提供了一些自定义的快捷方式：

```html
<!-- 快捷方式示例 -->
<div class="flex-center h-64 bg-gray-100">
  <div class="card p-6">
    <h3 class="panel-title">面板标题</h3>
    <p>这里使用了自定义的快捷方式类名</p>
  </div>
</div>

<!-- 布局快捷方式 -->
<div class="flex-between p-4 border-b">
  <span>左侧内容</span>
  <span>右侧内容</span>
</div>

<!-- 绝对居中 -->
<div class="relative h-64 bg-gray-200">
  <div class="absolute-center bg-white p-4 rounded shadow">
    绝对定位居中
  </div>
</div>
```

## 💡 最佳实践

### 1. 类名组合原则
```html
<!-- ✅ 推荐：逻辑清晰的分组 -->
<button class="
  bg-blue-500 text-white 
  px-6 py-2 
  rounded-lg shadow-md 
  hover:bg-blue-600 hover:shadow-lg 
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-blue-500
">
  组织良好的按钮
</button>

<!-- ❌ 避免：杂乱无序的类名 -->
<button class="bg-blue-500 px-6 text-white hover:bg-blue-600 py-2 rounded-lg focus:outline-none transition-all shadow-md hover:shadow-lg duration-200 focus:ring-2 focus:ring-blue-500">
  杂乱的类名
</button>
```

### 2. 响应式优先
```html
<!-- ✅ 移动端优先设计 -->
<div class="
  grid grid-cols-1 gap-4
  sm:grid-cols-2 sm:gap-6
  lg:grid-cols-3 lg:gap-8
">
  <!-- 内容 -->
</div>
```

### 3. 语义化命名
```html
<!-- ✅ 使用语义化的自定义类 -->
<article class="blog-post">
  <header class="blog-post__header">
    <h1 class="blog-post__title text-3xl font-bold text-gray-900">文章标题</h1>
  </header>
  <div class="blog-post__content prose prose-lg">
    <!-- 文章内容 -->
  </div>
</article>
```

### 4. 性能优化
```html
<!-- ✅ 避免不必要的类名 -->
<div class="bg-white rounded shadow p-4">
  简洁高效
</div>

<!-- ❌ 避免冗余的类名 -->
<div class="bg-white bg-opacity-100 rounded-md rounded shadow-sm shadow p-4 px-4 py-4">
  冗余的类名
</div>
```

通过合理使用这些工具类，你可以快速构建现代化、响应式的用户界面，同时保持代码的简洁和可维护性。
