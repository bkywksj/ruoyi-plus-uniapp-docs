# 亮色主题

亮色主题是项目的默认主题,提供清新明亮的视觉效果,适合日间使用和高对比度阅读场景。

## 🎨 配置文件

亮色主题定义在 `styles/themes/_light.scss` 文件中。

## 📊 颜色系统

### 背景色层级

亮色主题采用 5 层背景色系统,从浅到深递进:

```scss
:root {
  /* === 背景色层级系统 === */
  --bg-base: #fafbfc;           /* 最浅层:应用主背景 */
  --bg-level-1: #ffffff;        /* 一级:卡片、侧边栏基础背景 */
  --bg-level-2: #f8f9fa;        /* 二级:轻微悬停、子区域 */
  --bg-level-3: #f5f7fa;        /* 三级:明显悬停、表格行悬停 */
  --bg-level-4: #e9ecef;        /* 四级:选中、激活状态 */
}
```

**设计说明**:
- `bg-base` - 应用最外层背景,淡灰色提供舒适感
- `bg-level-1` - 纯白色,用于卡片等主要内容区
- `bg-level-2` ~ `bg-level-4` - 渐变加深,用于交互状态

### 应用级颜色

```scss
:root {
  /* 应用整体背景色 */
  --app-bg: var(--bg-base);

  /* 应用主要文字颜色 */
  --app-text: #303133;

  /* 应用边框颜色 */
  --app-border: #dbdfe9;
}
```

### 菜单配色方案

```scss
:root {
  /* 侧边栏菜单背景色 - 深色菜单提供对比 */
  --menu-bg: #161618;

  /* 菜单普通文字颜色 */
  --menu-text: #bfcbd9;

  /* 菜单激活状态文字颜色 */
  --menu-text-active: #f4f4f5;

  /* 基础悬停背景色 */
  --menu-hover: #475569;

  /* 基础悬停文字色 */
  --menu-hover-text: #f4f4f5;

  /* 菜单激活背景色 */
  --menu-active-bg: var(--el-menu-active-bg-color);

  /* 菜单激活文字色 */
  --menu-active-text: var(--el-menu-active-text-color);

  /* 子菜单背景色 */
  --submenu-bg: #1f2d3d;

  /* 子菜单激活文字色 */
  --submenu-text-active: #f4f4f5;

  /* 子菜单悬停背景色 */
  --submenu-hover: var(--menu-hover-color);
}
```

**菜单设计理念**:
- 深色侧边栏与浅色内容区形成鲜明对比
- 提高菜单的视觉聚焦度
- 符合现代应用设计趋势

### 头部配色

```scss
:root {
  /* 头部背景色 */
  --header-bg: var(--app-bg);

  /* 头部文字色 */
  --header-text: #303133;

  /* 头部边框色*/
  --header-border: #e4e7ed;

  /* 表格头部背景色 */
  --table-header-bg: #f8f8f9;

  /* 表格头部文字色 */
  --table-header-text: #6b7785;
}
```

### 标签页配色

```scss
:root {
  /* 标签页激活背景色 */
  --tags-view-active-bg: var(--el-color-primary);

  /* 标签页激活边框色 */
  --tags-view-active-border: var(--el-color-primary);
}
```

## 🎯 Element Plus 集成

### 颜色映射

```scss
:root {
  /* Element UI 颜色映射 */
  --el-color-primary: #409eff;
  --el-color-primary-light-3: #79bbff;
  --el-color-primary-light-2: #409eff;
  --el-bg-color-overlay: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
  --el-border-color-light: #e4e7ed;
}
```

**集成说明**:
- Element Plus 组件自动使用这些变量
- 确保组件样式与主题一致
- 便于统一调整组件外观

## 🎨 特定样式覆盖

### 侧边栏边框

```scss
html:not(.dark) {
  .sidebar-container {
    box-shadow: none;
    border-right: 0.5px solid var(--app-border);
  }
}
```

**说明**: 亮色主题下使用边框而非阴影,保持视觉清爽。

### 表格悬停效果

```scss
html:not(.dark) {
  .el-table__body .el-table__row:hover > td {
    background-color: var(--bg-level-3) !important;
  }
}
```

**说明**: 表格行悬停使用三级背景色,提供适度的视觉反馈。

## 🔧 使用示例

### 在组件中使用

```vue
<template>
  <div class="light-card">
    <h3 class="light-title">标题</h3>
    <p class="light-content">内容文本</p>
  </div>
</template>

<style scoped lang="scss">
.light-card {
  background: var(--bg-level-1);
  border: 1px solid var(--app-border);
  padding: 16px;
  border-radius: 8px;
}

.light-title {
  color: var(--app-text);
  margin-bottom: 12px;
}

.light-content {
  color: var(--app-text);
  opacity: 0.8;
}
</style>
```

### 使用 UnoCSS 工具类

```html
<!-- 使用主题变量 -->
<div class="bg-[var(--bg-level-1)] text-[var(--app-text)] border-[var(--app-border)]">
  亮色主题卡片
</div>
```

## 🎭 视觉特点

### 1. 高对比度

- 深色菜单 + 浅色内容 = 清晰的区域划分
- 深色文字 + 白色背景 = 优秀的可读性

### 2. 清爽明亮

- 以白色和浅灰色为主
- 营造专业、整洁的视觉感受

### 3. 柔和过渡

- 使用多层次背景色
- 交互状态变化自然流畅

## 🌈 配色建议

### 主色调

- 使用 Element Plus 默认蓝色 `#409eff`
- 可根据品牌色调整 `--el-color-primary`

### 辅助色

```scss
// 可添加自定义辅助色
:root {
  --accent-color: #00d4aa;      // 强调色
  --highlight-bg: #fff3cd;       // 高亮背景
}
```

### 文字对比度

确保符合 WCAG AA 标准 (对比度 ≥ 4.5:1):

```scss
:root {
  --app-text: #303133;           // 对比度 12.6:1 (与白色背景)
  --table-header-text: #6b7785;  // 对比度 5.2:1
}
```

## 📱 响应式适配

```scss
// 移动端调整
@media (max-width: 768px) {
  :root {
    --menu-bg: var(--bg-level-1);  // 移动端使用浅色菜单
    --menu-text: var(--app-text);
  }
}
```

## 🔍 调试技巧

### 查看当前亮色主题变量

```javascript
// 浏览器控制台
const root = document.documentElement
const bg = getComputedStyle(root).getPropertyValue('--bg-base')
console.log('亮色主题背景:', bg)  // #fafbfc
```

### 临时调整颜色

```javascript
// 临时修改变量测试效果
document.documentElement.style.setProperty('--app-bg', '#f0f0f0')
```

## ✅ 最佳实践

1. **优先使用变量** - 避免硬编码颜色值
2. **保持层级清晰** - 合理使用 5 层背景色系统
3. **注意对比度** - 确保文字可读性
4. **测试边缘情况** - 检查所有交互状态的视觉效果

亮色主题为用户提供了清晰、专业的视觉体验,是日常使用的理想选择。
