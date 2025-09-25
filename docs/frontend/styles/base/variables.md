# 全局变量

全局变量系统是样式架构的核心，通过 SCSS 变量和 CSS 自定义属性的结合，为项目提供统一的设计标准和主题切换能力。

## 🎨 变量分类体系

### 1. SCSS 变量 (编译时)
用于构建时的静态值，不可动态修改

### 2. CSS 变量 (运行时)
支持主题切换和动态修改的响应式变量

## 🌈 基础颜色变量

### 语义化颜色 (SCSS)
```scss
/* 基础颜色变量 */
$blue: #324157;                    // 深蓝色 - 用于专业感设计
$light-blue: #3a71a8;             // 浅蓝色 - 用于辅助元素
$red: #c03639;                     // 红色 - 用于错误和警告
$pink: #e65d6e;                    // 粉色 - 用于强调和点缀
$green: #30b08f;                   // 绿色 - 用于成功状态
$tiffany: #4ab7bd;                 // 蒂芙尼蓝 - 用于特殊强调
$yellow: #fec171;                  // 黄色 - 用于警告提示
$panGreen: #30b08f;                // 泛绿色 - 统一的绿色系
```

**颜色选择原则**：
- 符合品牌调性的主色调
- 良好的对比度和可访问性
- 支持深浅主题的适配性

### Element UI 主题色
```scss
/* Element UI 主题色变量 */
$el-color-primary: #409eff;        // 主色 - 蓝色系
$el-color-success: #67c23a;        // 成功 - 绿色系
$el-color-warning: #e6a23c;        // 警告 - 橙色系
$el-color-danger: #f56c6c;         // 危险 - 红色系
$el-color-info: #909399;           // 信息 - 灰色系
```

**集成说明**：
- 与 Element Plus 组件库颜色保持一致
- 确保组件样式的统一性
- 便于主题定制和品牌化

## 📏 布局尺寸变量

### 侧边栏尺寸
```scss
/* 布局尺寸变量 */
$base-sidebar-width: 240px;        // 侧边栏展开宽度
```

### 响应式断点
```scss
/* 响应式断点变量 */
$sm: 768px;                        // 小屏幕断点 (平板)
$md: 992px;                        // 中等屏幕断点 (小桌面)
$lg: 1200px;                       // 大屏幕断点 (桌面)
$xl: 1920px;                       // 超大屏幕断点 (宽屏)
```

**断点设计思路**：
- 基于主流设备分辨率
- 与 Bootstrap 断点体系兼容
- 覆盖移动端到桌面端全场景

### 设备特定断点
```scss
/* 设备断点变量 */
$device-notebook: 1600px;          // 笔记本电脑
$device-ipad-pro: 1180px;          // iPad Pro
$device-ipad: 800px;               // 标准 iPad
$device-ipad-vertical: 900px;      // iPad 竖屏
$device-phone: 500px;               // 手机设备
```

**设备断点应用场景**：
- 精确的设备适配
- 特殊交互优化
- 性能敏感的样式调整

### 断点映射系统
```scss
/* 断点映射 */
$breakpoints: (
  'sm': $sm,
  'md': $md,
  'lg': $lg,
  'xl': $xl
) !default;
```

## ⚙️ CSS 变量系统

### 动画时长统一
```scss
:root {
  // 动画时长统一（解决不一致问题）
  --duration-normal: 0.3s;          // 标准过渡时长
  --duration-slow: 0.6s;            // 慢速过渡时长
}
```

**时长选择依据**：
- 符合用户感知的自然节奏
- 既不会太快导致突兀，也不会太慢影响体验
- 与 Material Design 规范一致

### Z-index 层级管理
```scss
:root {
  // Z-index层级统一（解决混乱问题）
  --z-sidebar: 1001;               // 侧边栏层级
  --z-header: 9;                   // 头部层级
  --z-mask: 999;                   // 遮罩层级
  --z-modal: 1050;                 // 模态框层级
}
```

**层级管理原则**：
- 避免任意数值造成的层级冲突
- 预留足够的数值空间
- 语义化的层级命名

### 尺寸规范化
```scss
:root {
  // 侧边栏尺寸统一
  --sidebar-collapsed-width: 54px;  // 折叠状态宽度
  
  // 边框圆角统一
  --radius-sm: 4px;                // 小圆角
  --radius-md: 8px;                // 中等圆角
  --radius-lg: 12px;               // 大圆角
  --radius-round: 20px;            // 圆形边角
}
```

### 设计系统化变量
```scss
:root {
  // 主色系
  --main-color: var(--el-color-primary);  // 主题色引用
  
  // 组件统一高度系统
  --el-component-custom-height: 32px !important;
  --el-component-size: var(--el-component-custom-height) !important;
}
```

## 🎯 动态圆角系统

### 基于变量的计算系统
```scss
:root {
  // 动态圆角系统 - 基于自定义圆角变量计算
  --custom-radius: 12px;           // 基础圆角值，可通过主题切换
  
  // Element UI 圆角覆盖
  --el-border-radius-base: calc(var(--custom-radius) / 3 + 2px) !important;
  --el-border-radius-small: calc(var(--custom-radius) / 3 + 4px) !important;
  --el-messagebox-border-radius: calc(var(--custom-radius) / 3 + 4px) !important;
  --el-popover-border-radius: calc(var(--custom-radius) / 3 + 4px) !important;
}
```

**动态计算优势**：
- 一处修改，全局生效
- 保持比例关系的一致性
- 支持主题间的平滑切换

### 按钮样式规范
```scss
:root {
  // 按钮样式
  --el-font-weight-primary: 400 !important;  // 按钮字体权重标准化
}
```

## 🎨 菜单主题变量

### Element UI 菜单映射
```scss
:root {
  /* 自定义菜单颜色变量 */
  --custom-active-bg-color: rgba(64, 158, 255, 0.1);     // 激活背景色
  --cutsom-active-text-color: rgba(66, 161, 255, 1);     // 激活文字色
  
  /* Element UI 菜单颜色映射 */
  --el-menu-active-bg-color: rgba(64, 158, 255, 0.1);    // 菜单激活背景
  --el-menu-active-text-color: rgba(66, 161, 255, 1);    // 菜单激活文字
}
```

## 📤 JavaScript 导出系统

### 变量导出配置
```scss
// exports.module.scss
:export {
  menuColor: var(--menu-text);              // 菜单文字色
  menuLightColor: #333;                     // 亮色菜单文字
  menuColorActive: var(--menu-text-active); // 激活文字色
  menuBackground: var(--menu-bg);           // 菜单背景色
  menuLightBackground: white;               // 亮色菜单背景
  menuHover: var(--menu-hover);             // 悬停背景色
  menuLightHover: #f5f7fa;                  // 亮色悬停背景
  menuHoverText: var(--menu-text);          // 悬停文字色
  menuLightHoverText: #333;                 // 亮色悬停文字
  subMenuBackground: var(--submenu-bg);     // 子菜单背景
  subMenuHover: var(--submenu-hover);       // 子菜单悬停
  sideBarWidth: $base-sidebar-width;        // 侧边栏宽度
  logoTitleColor: var(--menu-text-active);  // Logo标题颜色
  logoLightTitleColor: #333;                // 亮色Logo颜色
  primaryColor: $el-color-primary;          // 主色
  successColor: $el-color-success;          // 成功色
  dangerColor: $el-color-danger;            // 危险色
  infoColor: $el-color-info;                // 信息色
  warningColor: $el-color-warning;          // 警告色
}
```

**导出变量的用途**：
- JavaScript 中读取样式变量
- 动态主题切换计算
- 组件与样式的数据同步

## 🔧 变量使用最佳实践

### 1. 变量命名规范
```scss
// ✅ 推荐的命名方式
$component-element-property: value;
--semantic-category-property: value;

// 具体示例
$button-primary-background: #409eff;
--menu-item-hover-bg: rgba(0, 0, 0, 0.05);
```

### 2. 变量组织层次
```scss
// 第一层：全局基础变量
$primary-color: #409eff;

// 第二层：组件变量（基于全局变量）
$button-primary-bg: $primary-color;

// 第三层：CSS变量（运行时可变）
:root {
  --button-bg: #{$button-primary-bg};
}

// 第四层：组件应用
.button {
  background: var(--button-bg);
}
```

### 3. 主题兼容性设计
```scss
// ✅ 良好的主题兼容性
:root {
  --text-primary: #333333;
}

html.dark {
  --text-primary: #ffffff;
}

.component {
  color: var(--text-primary);  // 自动适配主题
}

// ❌ 避免硬编码颜色
.component {
  color: #333333;  // 无法适配深色主题
}
```

### 4. 性能优化考虑
```scss
// ✅ 减少重复计算
:root {
  --base-spacing: 8px;
  --spacing-sm: calc(var(--base-spacing) * 0.5);
  --spacing-md: var(--base-spacing);
  --spacing-lg: calc(var(--base-spacing) * 2);
}

// ❌ 避免复杂的嵌套计算
.component {
  margin: calc(calc(var(--base-spacing) * 2) + calc(var(--other-spacing) / 2));
}
```

## 📊 变量监控和调试

### 开发模式调试
```scss
// 调试模式下显示变量值
@if $debug-mode {
  body:before {
    content: 'Primary Color: #{$primary-color}';
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    font-size: 12px;
    z-index: 9999;
  }
}
```

### 变量文档生成
```scss
// 使用注释生成变量文档
/// 主要品牌色，用于按钮、链接等关键元素
/// @type Color
/// @example scss - 使用示例
///   .button { background: $primary-color; }
$primary-color: #409eff;
```

## 🚀 扩展和维护

### 添加新变量的流程
1. **评估需求**：确认是否需要新变量
2. **选择类型**：SCSS 变量 vs CSS 变量
3. **命名规范**：遵循既定的命名约定
4. **文档更新**：添加使用说明和示例
5. **测试验证**：确保在不同主题下正常工作

### 变量重构策略
```scss
// 渐进式重构示例
// 第一步：添加新变量
:root {
  --button-padding-new: 12px 24px;
}

// 第二步：同时保留旧变量（向后兼容）
:root {
  --button-padding: var(--button-padding-new);  // 兼容性别名
}

// 第三步：逐步替换使用
.button {
  padding: var(--button-padding-new);
}

// 第四步：移除旧变量
```

### 主题扩展示例
```scss
// 添加新主题的变量结构
html.theme-corporate {
  --primary-color: #1a365d;          // 企业蓝
  --secondary-color: #2d3748;        // 深灰色
  --accent-color: #ed8936;           // 橙色强调
  
  // 继承通用变量
  --radius-md: 4px;                  // 更方正的设计
  --duration-normal: 0.2s;           // 更快的动画
}
```

这套全局变量系统为项目提供了统一的设计语言和灵活的主题切换能力，确保了样式的一致性和可维护性。
