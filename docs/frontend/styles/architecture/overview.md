# 样式架构概述

本项目采用现代化的样式架构设计，结合 SCSS 预处理器和 UnoCSS 原子化 CSS，为前端应用提供高效、可维护的样式解决方案。

## 🏗️ 整体架构

### 双重样式系统

项目采用 **SCSS + UnoCSS** 的混合架构：

```
样式系统
├── SCSS 系统 (主要样式)
│   ├── 抽象层 (variables, mixins)
│   ├── 基础层 (reset, typography)
│   ├── 主题层 (light, dark)
│   ├── 布局层 (layout)
│   ├── 组件层 (buttons, animations)
│   └── 第三方库覆盖 (element-plus)
│
└── UnoCSS 系统 (原子化工具)
    ├── 预设配置
    ├── 快捷方式
    ├── 自定义规则
    └── 主题变量
```

## 📁 文件结构

```
src/styles/
├── main.scss                 # 主入口文件
├── abstracts/                 # 抽象层
│   ├── _variables.scss       # 全局变量
│   ├── _mixins.scss          # 混合器工具
│   └── exports.module.scss   # JS导出变量
├── base/                     # 基础样式
│   ├── _reset.scss           # 样式重置
│   └── _typography.scss      # 排版系统
├── themes/                   # 主题系统
│   ├── _light.scss           # 亮色主题
│   └── _dark.scss            # 暗色主题
├── layout/                   # 布局样式
│   └── _layout.scss          # 主布局
├── components/               # 组件样式
│   ├── _buttons.scss         # 按钮组件
│   └── _animations.scss      # 动画组件
└── vendors/                  # 第三方库
    └── _element-plus.scss    # Element Plus覆盖
```

## 🎨 设计原则

### 1. 模块化设计
- 每个功能模块独立成文件
- 使用 `@use` 导入，避免全局污染
- 清晰的依赖关系

### 2. 层级化架构
```scss
// 7-1 架构模式的简化版本
@use './abstracts/variables' as *;  // 抽象层
@use './base/reset';                 // 基础层
@use './themes/light';               // 主题层
@use './layout/layout';              // 布局层
@use './components/buttons';         // 组件层
@use './vendors/element-plus';       // 第三方层
```

### 3. CSS 变量系统
利用 CSS 自定义属性实现动态主题：

```scss
:root {
  // 设计系统变量
  --main-color: var(--el-color-primary);
  --duration-normal: 0.3s;
  --radius-md: 8px;
  
  // 语义化颜色
  --app-bg: var(--bg-base);
  --app-text: #303133;
  --menu-bg: #161618;
}
```

### 4. 响应式断点
统一的断点系统：

```scss
$sm: 768px;   // 小屏幕
$md: 992px;   // 中等屏幕  
$lg: 1200px;  // 大屏幕
$xl: 1920px;  // 超大屏幕
```

## ⚡ 性能优化

### 1. 按需加载
- 组件样式独立打包
- 主题样式动态切换
- 第三方库样式按需导入

### 2. 构建优化
- SCSS 编译时变量计算
- CSS 自动压缩和优化
- 死代码消除

### 3. 运行时优化
- CSS 变量减少重绘
- 硬件加速动画
- 合理的层叠上下文

## 🔧 开发工具

### 1. SCSS 特性
- **变量**: 颜色、尺寸的统一管理
- **混合器**: 可复用的样式片段
- **函数**: 动态计算和处理
- **模块化**: `@use` 和 `@forward` 导入

### 2. UnoCSS 集成
- **原子化类**: 快速样式编写
- **预设系统**: 常用样式组合
- **按需生成**: 减少最终包体积
- **IDE 支持**: 智能提示和补全

### 3. 开发辅助
```scss
// 开发模式的调试工具
@mixin debug-outline($color: red) {
  @if $env == 'development' {
    outline: 1px solid $color;
  }
}
```

## 📋 最佳实践

### 1. 命名规范
- **变量**: `$component-element-modifier`
- **类名**: `component__element--modifier` (BEM)
- **CSS变量**: `--semantic-property`

### 2. 代码组织
```scss
// 1. 外部导入
@use 'abstracts/variables' as *;

// 2. 局部变量
$local-spacing: 16px;

// 3. 混合器定义
@mixin component-style { }

// 4. 样式规则
.component { }
```

### 3. 主题兼容
```scss
// 使用 CSS 变量确保主题兼容性
.button {
  background: var(--button-bg);
  color: var(--button-text);
  border: 1px solid var(--button-border);
}
```

## 🚀 扩展指南

### 添加新主题
1. 在 `themes/` 目录创建新主题文件
2. 定义主题的 CSS 变量
3. 在主入口文件中导入

### 自定义组件样式
1. 在 `components/` 目录创建组件样式文件
2. 使用统一的变量和混合器
3. 遵循响应式设计原则

### 集成新的 CSS 框架
1. 在 `vendors/` 目录添加覆盖样式
2. 使用 CSS 变量保持主题一致性
3. 确保不冲突的选择器优先级

这种架构设计确保了样式系统的可维护性、可扩展性和高性能，为项目的长期发展奠定了坚实的基础。
