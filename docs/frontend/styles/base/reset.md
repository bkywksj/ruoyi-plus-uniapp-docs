# 样式重置

样式重置是现代CSS开发的基础，用于消除浏览器默认样式的差异，为项目提供一致的样式基线。

## 🎯 重置目标

### 解决的问题
- **浏览器兼容性**：不同浏览器的默认样式存在差异
- **盒模型统一**：确保所有元素使用一致的盒模型
- **默认间距清理**：移除不必要的默认margin和padding
- **表单元素统一**：统一表单控件的默认外观
- **字体继承**：确保字体样式正确继承

## 📋 重置策略

### 基础重置 (_reset.scss)

```scss
/**
 * 基础样式重置
 * 统一浏览器默认样式并设置项目基础风格
 */

/* HTML根元素样式 */
html {
  height: 100%; // 高度填满窗口
  box-sizing: border-box; // 使用border-box盒模型
}

/* 应用根容器 */
#app {
  height: 100%; // 应用容器高度填满
}

body {
  height: 100%; // 高度填满窗口
  margin: 0; // 移除默认外边距
}

/* 全局盒模型设置 */
*,
*:before,
*:after {
  box-sizing: inherit; // 继承父元素的盒模型设置
}

/* 链接样式重置 */
a:focus,
a:active {
  outline: none; // 移除焦点轮廓
}

a,
a:focus,
a:hover {
  cursor: pointer; // 鼠标指针样式
  color: inherit; // 继承父元素文字颜色
  text-decoration: none; // 移除下划线
}

/* 移除div的焦点样式 */
div:focus {
  outline: none; // 移除div元素焦点轮廓
}
```

### 详细分析

#### 1. 盒模型重置
```scss
// 设置根元素使用border-box盒模型
html {
  box-sizing: border-box;
}

// 所有元素继承盒模型设置
*,
*:before,
*:after {
  box-sizing: inherit;
}
```

**作用说明**：
- `box-sizing: border-box` 让元素的宽高包含padding和border
- 使用 `inherit` 允许局部覆盖盒模型设置
- 避免宽度计算问题

**实际效果对比**：
```html
<!-- 使用 border-box -->
<div class="w-200 p-20 border-10">
  <!-- 实际宽度 = 200px (包含padding和border) -->
</div>

<!-- 使用默认 content-box -->
<div class="w-200 p-20 border-10">
  <!-- 实际宽度 = 200px + 40px + 20px = 260px -->
</div>
```

#### 2. 高度和布局重置
```scss
html,
body {
  height: 100%;
  margin: 0;
}

#app {
  height: 100%;
}
```

**目的**：
- 确保应用可以占满整个视窗
- 为全屏布局提供基础
- 移除浏览器默认margin

**典型应用场景**：
```html
<!-- 全屏应用布局 -->
<div id="app">
  <header class="h-16">头部</header>
  <main class="flex-1">主内容区</main>
  <footer class="h-12">底部</footer>
</div>
```

#### 3. 链接重置
```scss
a {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  
  &:focus,
  &:active {
    outline: none;
  }
}
```

**重置内容**：
- 移除默认蓝色和下划线
- 继承父元素颜色
- 统一鼠标样式
- 移除焦点轮廓（需要自定义替代）

**使用示例**：
```html
<!-- 导航链接 -->
<nav class="text-gray-700">
  <a href="/" class="hover:text-blue-600">首页</a>
  <a href="/about" class="hover:text-blue-600">关于</a>
</nav>
```

## 🔧 扩展重置

### 表单元素重置
```scss
/* 表单控件重置 */
input,
button,
textarea,
select {
  font-family: inherit; // 继承字体
  font-size: inherit; // 继承字体大小
  line-height: inherit; // 继承行高
  color: inherit; // 继承颜色
  margin: 0; // 移除默认外边距
}

/* 按钮重置 */
button {
  background: none; // 移除默认背景
  border: none; // 移除默认边框
  padding: 0; // 移除默认内边距
  cursor: pointer; // 设置指针样式
  
  &:focus {
    outline: none; // 移除焦点轮廓
  }
}

/* 输入框重置 */
input {
  border: none; // 移除默认边框
  outline: none; // 移除焦点轮廓
  background: transparent; // 透明背景
  
  &::placeholder {
    color: inherit; // 占位符继承颜色
    opacity: 0.6; // 降低透明度
  }
}

/* 文本域重置 */
textarea {
  resize: vertical; // 只允许垂直调整大小
  border: none;
  outline: none;
  background: transparent;
}

/* 选择框重置 */
select {
  appearance: none; // 移除默认箭头
  background: transparent;
  border: none;
  outline: none;
}
```

### 列表重置
```scss
/* 列表重置 */
ul,
ol {
  margin: 0;
  padding: 0;
  list-style: none; // 移除默认列表样式
}

li {
  margin: 0;
  padding: 0;
}

/* 定义列表重置 */
dl,
dt,
dd {
  margin: 0;
  padding: 0;
}
```

### 表格重置
```scss
/* 表格重置 */
table {
  border-collapse: collapse; // 合并边框
  border-spacing: 0; // 移除单元格间距
  width: 100%;
}

th,
td {
  padding: 0;
  text-align: left; // 统一左对齐
  vertical-align: top; // 统一顶部对齐
}

th {
  font-weight: inherit; // 继承字体粗细
}
```

### 媒体元素重置
```scss
/* 媒体元素重置 */
img,
video,
canvas,
svg {
  display: block; // 消除底部间隙
  max-width: 100%; // 响应式图片
  height: auto; // 保持纵横比
}

/* 图片默认设置 */
img {
  border: 0; // 移除IE中的边框
  vertical-align: top; // 对齐方式
}

/* SVG设置 */
svg {
  fill: currentColor; // 使用当前文本颜色
}
```

## 🎨 现代化重置

### CSS自定义属性重置
```scss
/* CSS变量默认值 */
:root {
  // 确保关键变量有默认值
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --line-height-base: 1.5;
  --color-text: #333;
  --color-bg: #fff;
  
  // 动画默认设置
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  // 阴影默认设置
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 无障碍优化重置
```scss
/* 无障碍性优化 */

/* 跳转链接（屏幕阅读器用户） */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  :root {
    --color-text: #000;
    --color-bg: #fff;
    --border-width: 2px;
  }
}

/* 焦点可见性 */
*:focus-visible {
  outline: 2px solid var(--color-primary, #0066cc);
  outline-offset: 2px;
}
```

### 打印样式重置
```scss
/* 打印样式优化 */
@media print {
  *,
  *:before,
  *:after {
    background: transparent !important;
    color: #000 !important; // 黑色文字节省墨水
    box-shadow: none !important;
    text-shadow: none !important;
  }
  
  a,
  a:visited {
    text-decoration: underline;
  }
  
  // 显示链接URL
  a[href]:after {
    content: " (" attr(href) ")";
  }
  
  // 隐藏不必要的元素
  nav,
  .no-print {
    display: none !important;
  }
  
  // 分页控制
  h1, h2, h3 {
    page-break-after: avoid;
  }
  
  p {
    orphans: 3;
    widows: 3;
  }
}
```

## 🌐 浏览器特定重置

### Webkit 重置
```scss
/* Webkit浏览器特定重置 */

/* 移除点击高亮 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 滚动优化 */
* {
  -webkit-overflow-scrolling: touch; // iOS平滑滚动
}

/* 搜索框重置 */
input[type="search"] {
  -webkit-appearance: none;
  
  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
}

/* 数字输入框重置 */
input[type="number"] {
  -moz-appearance: textfield;
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
```

### 移动端特定重置
```scss
/* 移动端优化重置 */

/* 防止iOS缩放 */
html {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}

/* 移除iOS按钮样式 */
input[type="submit"],
input[type="button"],
button {
  -webkit-appearance: none;
  border-radius: 0;
}

/* 移除Android高亮 */
input,
textarea,
select,
button {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
```

## 🔍 调试和验证

### 重置效果验证
```scss
/* 开发模式调试 */
@if $environment == 'development' {
  /* 边框调试 */
  .debug-reset {
    * {
      outline: 1px solid red !important;
    }
  }
  
  /* 间距调试 */
  .debug-spacing {
    * {
      background: rgba(255, 0, 0, 0.1) !important;
    }
  }
}
```

### 常见问题检查
```html
<!-- 检查盒模型是否正确 -->
<div class="w-200 p-20 border-10 bg-blue-100">
  盒模型测试：宽度应该是200px
</div>

<!-- 检查链接重置 -->
<a href="#" class="text-blue-600">
  链接应该没有下划线，颜色为蓝色
</a>

<!-- 检查表单重置 -->
<form class="space-y-4">
  <input type="text" placeholder="输入框应该无边框" class="border p-2">
  <button class="bg-blue-500 text-white p-2">
    按钮应该无默认样式
  </button>
</form>

<!-- 检查列表重置 -->
<ul class="space-y-2">
  <li>列表项应该无默认标记</li>
  <li>列表项应该无默认间距</li>
</ul>
```

## ⚡ 性能优化

### 选择器性能
```scss
// ✅ 高效的重置
* {
  box-sizing: border-box;
}

// ❌ 低效的重置
div, p, span, a, img, button, input, select, textarea, h1, h2, h3, h4, h5, h6 {
  box-sizing: border-box;
}
```

### 渐进式重置
```scss
/* 基础重置 - 优先级最高 */
@layer reset {
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}

/* 组件重置 - 中等优先级 */
@layer components {
  .btn {
    border: none;
    background: none;
  }
}

/* 工具重置 - 最高优先级 */
@layer utilities {
  .m-0 {
    margin: 0 !important;
  }
}
```

## 📋 最佳实践

### 1. 渐进式重置
- 只重置确实需要的样式
- 保留有用的浏览器默认样式
- 考虑项目的具体需求

### 2. 文档化重置
```scss
/**
 * 样式重置说明
 * 
 * @description 重置浏览器默认样式
 * @affects 全局元素样式
 * @version 1.0.0
 * @author 团队名称
 */
```

### 3. 版本控制
- 重置文件单独维护
- 谨慎修改已有重置规则
- 新增重置时充分测试

### 4. 兼容性考虑
- 测试主流浏览器
- 考虑移动端表现
- 提供降级方案

通过合理的样式重置，我们为项目建立了一个稳定、一致的样式基础，为后续的样式开发提供了可靠的起点。
