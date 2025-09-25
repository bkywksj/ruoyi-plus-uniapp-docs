# 排版系统

排版系统定义了项目中所有文本元素的视觉呈现规则，包括字体、字号、行高、间距等，确保内容的可读性和视觉一致性。

## 🎯 设计原则

### 1. 可读性优先
- 合适的字体大小和行高比例
- 充分的段落间距
- 良好的对比度

### 2. 视觉层次
- 清晰的标题层级结构
- 主次分明的文本权重
- 合理的视觉节奏

### 3. 响应式适配
- 不同屏幕尺寸的字体缩放
- 移动端阅读体验优化
- 高分辨率屏幕适配

## 📝 基础排版设置

### 主体文本样式
```scss
body {
  // 字体栈：优先使用系统字体，提供良好的跨平台体验
  font-family: Helvetica Neue, Helvetica, PingFang SC, 
               Hiragino Sans GB, Microsoft YaHei, 
               Arial, sans-serif;
               
  font-size: 14px;                    // 基础字体大小
  line-height: 1.5;                   // 黄金比例行高
  
  // 字体渲染优化
  -moz-osx-font-smoothing: grayscale;      // Firefox 字体平滑
  -webkit-font-smoothing: antialiased;     // WebKit 字体平滑
  text-rendering: optimizeLegibility;      // 优化字体渲染
  
  color: var(--app-text);             // 使用主题变量
}
```

**字体选择说明**：
- **Helvetica Neue**: macOS 系统的现代字体
- **PingFang SC**: macOS 中文字体
- **Hiragino Sans GB**: 较老版本 macOS 中文字体
- **Microsoft YaHei**: Windows 中文字体
- **Arial**: 通用后备字体

### 标签元素样式
```scss
label {
  font-weight: 700;                   // 标签文字加粗，提高识别度
}
```

## 📐 标题层级系统

### 标题基础设置
```scss
h1, h2, h3, h4, h5, h6,
.h1, .h2, .h3, .h4, .h5, .h6 {
  margin-top: 0;                      // 移除默认上边距
  margin-bottom: 0.5rem;              // 统一下边距
  font-family: inherit;               // 继承字体
  font-weight: 500;                   // 适中的字体权重
  line-height: 1.1;                   // 紧凑的行高
  color: inherit;                     // 继承文字颜色
}
```

### 具体标题尺寸
```scss
// 主标题 - 用于页面主标题
h1, .h1 {
  font-size: 2.5rem;                  // 40px (基于 16px)
}

// 次标题 - 用于章节标题
h2, .h2 {
  font-size: 2rem;                    // 32px
}

// 三级标题 - 用于子章节
h3, .h3 {
  font-size: 1.75rem;                 // 28px
}

// 四级标题 - 用于小节
h4, .h4 {
  font-size: 1.5rem;                  // 24px
}

// 五级标题 - 用于段落标题
h5, .h5 {
  font-size: 1.25rem;                 // 20px
}

// 六级标题 - 用于子段落
h6, .h6 {
  font-size: 1rem;                    // 16px
}
```

**尺寸比例说明**：
- 使用 `rem` 单位确保可缩放性
- 1.25 倍递增比例，保持视觉和谐
- 提供对应的类名，便于非语义化使用

### 响应式标题
```scss
// 移动端标题适配
@media (max-width: 768px) {
  h1, .h1 { font-size: 2rem; }        // 缩小至 32px
  h2, .h2 { font-size: 1.75rem; }     // 缩小至 28px
  h3, .h3 { font-size: 1.5rem; }      // 缩小至 24px
  h4, .h4 { font-size: 1.25rem; }     // 缩小至 20px
  h5, .h5 { font-size: 1.125rem; }    // 缩小至 18px
  h6, .h6 { font-size: 1rem; }        // 保持 16px
}
```

## 📄 段落和文本

### 段落样式
```scss
p {
  margin-top: 0;                      // 移除顶部边距
  margin-bottom: 1rem;                // 段落间距
}
```

### 文本装饰
```scss
// 粗体文本
strong, b {
  font-weight: 700;                   // 明显的粗体效果
}

// 斜体文本
em, i {
  font-style: italic;                 // 标准斜体
}

// 小号文本
small {
  font-size: 80%;                     // 相对父元素 80% 大小
}
```

### 链接样式
```scss
a {
  color: var(--el-color-primary);     // 使用主题主色
  text-decoration: none;              // 移除默认下划线
  transition: color var(--duration-normal);  // 平滑过渡

  &:hover {
    color: var(--el-color-primary-light-3);  // 悬停时变亮
    text-decoration: none;            // 保持无下划线
  }
}
```

## 💻 代码文本

### 代码字体栈
```scss
code, pre {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
}
```

**等宽字体选择**：
- **Menlo**: macOS 默认等宽字体
- **Monaco**: 较老的 macOS 等宽字体
- **Consolas**: Windows 等宽字体
- **Courier New**: 通用等宽字体

### 内联代码
```scss
code {
  font-size: 0.875em;                 // 略小于正文
  color: #d63384;                     // 区分色彩
  word-wrap: break-word;              // 长代码换行
}
```

### 代码块
```scss
pre {
  display: block;                     // 块级显示
  margin-top: 0;                      // 移除顶部边距
  margin-bottom: 1rem;                // 底部间距
  overflow: auto;                     // 支持滚动
  font-size: 0.875em;                 // 适读的字体大小
}
```

## 📱 响应式排版

### 移动端优化
```scss
@media (max-width: 768px) {
  body {
    font-size: 16px;                  // 移动端基础字号增大
    line-height: 1.6;                 // 增加行高提升可读性
  }
  
  // 段落间距调整
  p {
    margin-bottom: 1.25rem;           // 增加段落间距
  }
}
```

### 高分辨率屏幕
```scss
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  body {
    // 高分辨率屏幕字体渲染优化
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

## 🎨 主题集成

### 文本颜色变量
```scss
// 在主题文件中定义
:root {
  --text-primary: #303133;           // 主要文本颜色
  --text-secondary: #606266;         // 次要文本颜色
  --text-placeholder: #a8abb2;       // 占位符文本
  --text-disabled: #c0c4cc;          // 禁用文本
}

// 暗色主题
html.dark {
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-placeholder: #64748b;
  --text-disabled: #475569;
}
```

### 主题应用
```scss
body {
  color: var(--text-primary);        // 使用主题变量
}

.text-secondary {
  color: var(--text-secondary);      // 次要文本工具类
}

.text-muted {
  color: var(--text-placeholder);    // 弱化文本工具类
}
```

## 🔧 工具类系统

### 字体大小工具类
```scss
.text-xs { font-size: 0.75rem; }     // 12px
.text-sm { font-size: 0.875rem; }    // 14px
.text-base { font-size: 1rem; }      // 16px
.text-lg { font-size: 1.125rem; }    // 18px
.text-xl { font-size: 1.25rem; }     // 20px
.text-2xl { font-size: 1.5rem; }     // 24px
.text-3xl { font-size: 1.875rem; }   // 30px
```

### 字体权重工具类
```scss
.font-thin { font-weight: 100; }
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
```

### 行高工具类
```scss
.leading-none { line-height: 1; }
.leading-tight { line-height: 1.25; }
.leading-snug { line-height: 1.375; }
.leading-normal { line-height: 1.5; }
.leading-relaxed { line-height: 1.625; }
.leading-loose { line-height: 2; }
```

### 文本对齐工具类
```scss
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }
```

## 📐 垂直韵律

### 基线网格系统
```scss
// 基础行高单位
$baseline: 1.5rem;

// 垂直间距规范
.mb-1 { margin-bottom: #{$baseline * 0.25}; }  // 0.375rem
.mb-2 { margin-bottom: #{$baseline * 0.5}; }   // 0.75rem
.mb-3 { margin-bottom: #{$baseline * 0.75}; }  // 1.125rem
.mb-4 { margin-bottom: $baseline; }             // 1.5rem
.mb-5 { margin-bottom: #{$baseline * 1.25}; }  // 1.875rem
.mb-6 { margin-bottom: #{$baseline * 1.5}; }   // 2.25rem
```

### 排版节奏
```scss
// 建立垂直节奏
h1 { margin-bottom: #{$baseline * 1}; }      // 24px
h2 { margin-bottom: #{$baseline * 0.75}; }   // 18px
h3 { margin-bottom: #{$baseline * 0.5}; }    // 12px
p  { margin-bottom: $baseline; }             // 24px

// 列表间距
ul, ol {
  margin-bottom: $baseline;
  
  li {
    margin-bottom: #{$baseline * 0.25};      // 6px
  }
}
```

## 🌐 国际化支持

### 中文排版优化
```scss
// 中文字体优化
:lang(zh) {
  font-family: PingFang SC, Hiragino Sans GB, 
               Microsoft YaHei, sans-serif;
  
  // 中文段落首行缩进
  p {
    text-indent: 2em;
  }
  
  // 中文引号样式
  q {
    quotes: '"' '"' ''' ''';
  }
}
```

### 英文排版优化
```scss
:lang(en) {
  font-family: -apple-system, BlinkMacSystemFont, 
               'Segoe UI', Roboto, sans-serif;
  
  // 英文连字符
  hyphens: auto;
  
  // 英文文本两端对齐
  text-align: justify;
}
```

## 📋 最佳实践

### 1. 字体加载优化
```scss
// 字体显示策略
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;               // 快速显示后备字体
}
```

### 2. 可访问性考虑
```scss
// 确保足够的对比度
body {
  color: #333;                      // 与白色背景对比度 > 4.5:1
}

// 支持用户字体大小偏好
@media (prefers-reduced-motion: no-preference) {
  html {
    font-size: calc(14px + 0.5vw);  // 响应用户设置
  }
}
```

### 3. 性能优化
```scss
// 避免不必要的字体变化
* {
  font-synthesis: none;             // 禁用浏览器合成字体样式
}

// 优化文本渲染
body {
  text-size-adjust: 100%;           // 防止移动端字体大小调整
}
```

这套排版系统为项目提供了完整的文本呈现规范，确保内容在各种设备和环境下都能获得最佳的阅读体验。
