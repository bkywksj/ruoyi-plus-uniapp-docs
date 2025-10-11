# 主题概述

本项目实现了一套完整的主题系统,支持亮色和暗色两种模式,通过 CSS 变量实现动态切换,为用户提供个性化的视觉体验。

## 🎨 主题架构

### 核心设计理念

1. **CSS 变量驱动** - 所有主题相关样式使用 CSS 自定义属性
2. **语义化命名** - 变量名称具有明确的语义,易于理解和维护
3. **分层设计** - 背景色、文字色、边框色等分层管理
4. **动态切换** - 运行时无刷新切换主题

### 主题文件组织

```
styles/themes/
├── _light.scss          # 亮色主题变量定义
└── _dark.scss           # 暗色主题变量定义
```

## 🌓 主题模式

### 亮色主题 (默认)
- 清新明亮的视觉效果
- 高对比度,适合日间使用
- 菜单采用深色背景,内容区域白色背景

### 暗色主题
- 深色背景减少眼睛疲劳
- 适合夜间或低光环境使用
- 统一的深色调,整体协调

## 📊 变量分层系统

### 1. 背景色层级

项目采用 5 层背景色系统:

```scss
:root {
  --bg-base: #fafbfc;        // 最浅层:应用主背景
  --bg-level-1: #ffffff;     // 一级:卡片、侧边栏基础背景
  --bg-level-2: #f8f9fa;     // 二级:轻微悬停、子区域
  --bg-level-3: #f5f7fa;     // 三级:明显悬停、表格行悬停
  --bg-level-4: #e9ecef;     // 四级:选中、激活状态
}
```

**设计优势**:
- 清晰的视觉层次
- 统一的深浅关系
- 易于扩展和调整

### 2. 语义化颜色

```scss
:root {
  // 应用级别
  --app-bg: var(--bg-base);           // 应用背景
  --app-text: #303133;                 // 应用文字
  --app-border: #dbdfe9;               // 应用边框

  // 菜单相关
  --menu-bg: #161618;                  // 菜单背景
  --menu-text: #bfcbd9;                // 菜单文字
  --menu-text-active: #f4f4f5;         // 菜单激活文字
  --menu-hover: #475569;               // 菜单悬停背景

  // 头部相关
  --header-bg: var(--app-bg);          // 头部背景
  --header-text: #303133;              // 头部文字
  --header-border: #e4e7ed;            // 头部边框
}
```

### 3. Element Plus 集成

```scss
:root {
  // Element Plus 颜色映射
  --el-color-primary: #409eff;
  --el-bg-color-overlay: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
}
```

## 🔄 主题切换机制

### 1. HTML 类名控制

```html
<!-- 亮色主题 (默认) -->
<html>

<!-- 暗色主题 -->
<html class="dark">
```

### 2. CSS 选择器

```scss
// 亮色主题样式
:root {
  --app-bg: #fafbfc;
}

// 暗色主题样式
html.dark {
  --app-bg: #111113;
}
```

### 3. JavaScript 切换

```typescript
// 切换到暗色模式
document.documentElement.classList.add('dark')

// 切换到亮色模式
document.documentElement.classList.remove('dark')
```

## 🎯 主题变量使用

### 在 SCSS 中使用

```scss
.custom-component {
  background: var(--bg-level-1);
  color: var(--app-text);
  border: 1px solid var(--app-border);

  &:hover {
    background: var(--bg-level-2);
  }
}
```

### 在 Vue 组件中使用

```vue
<template>
  <div class="component" :style="styles">
    内容
  </div>
</template>

<script setup lang="ts">
const styles = {
  backgroundColor: 'var(--bg-level-1)',
  color: 'var(--app-text)'
}
</script>
```

### 在 UnoCSS 中使用

```html
<!-- 使用主题变量 -->
<div class="bg-[var(--bg-level-1)] text-[var(--app-text)]">
  内容
</div>
```

## 🛠️ 主题定制

### 1. 添加自定义变量

```scss
// 在 _light.scss 中添加
:root {
  --custom-highlight: #ffeb3b;
  --custom-shadow: rgba(0, 0, 0, 0.1);
}

// 在 _dark.scss 中添加对应的暗色值
html.dark {
  --custom-highlight: #ffd54f;
  --custom-shadow: rgba(0, 0, 0, 0.3);
}
```

### 2. 扩展颜色层级

```scss
:root {
  --bg-level-5: #dee2e6;  // 添加第五层背景
}

html.dark {
  --bg-level-5: #343a40;  // 暗色主题对应值
}
```

### 3. 创建主题变体

```scss
// 蓝色主题变体
html.theme-blue {
  --el-color-primary: #1976d2;
  --menu-bg: #0d47a1;
}

// 绿色主题变体
html.theme-green {
  --el-color-primary: #4caf50;
  --menu-bg: #1b5e20;
}
```

## 📋 主题最佳实践

### 1. 始终使用变量

```scss
// ✅ 推荐
.component {
  background: var(--bg-level-1);
}

// ❌ 避免硬编码
.component {
  background: #ffffff;
}
```

### 2. 保持变量语义化

```scss
// ✅ 语义清晰
--menu-hover-bg: var(--bg-level-2);

// ❌ 命名模糊
--color-1: #f5f5f5;
```

### 3. 考虑对比度

```scss
// 确保亮色和暗色主题都有足够的对比度
:root {
  --text-on-primary: #ffffff;  // 白色文字在主色上
}

html.dark {
  --text-on-primary: #000000;  // 可能需要深色文字
}
```

### 4. 测试主题切换

```typescript
// 测试组件在两种主题下的表现
describe('Component Theme', () => {
  it('should work in light theme', () => {
    // 测试亮色主题
  })

  it('should work in dark theme', () => {
    document.documentElement.classList.add('dark')
    // 测试暗色主题
  })
})
```

## 🔍 调试技巧

### 1. 检查当前主题变量

```javascript
// 在浏览器控制台
getComputedStyle(document.documentElement)
  .getPropertyValue('--app-bg')
```

### 2. 动态修改变量

```javascript
// 临时修改主题变量测试效果
document.documentElement.style
  .setProperty('--app-bg', '#f0f0f0')
```

### 3. 查看所有主题变量

```javascript
// 获取所有 CSS 变量
const styles = getComputedStyle(document.documentElement)
const cssVars = Array.from(styles)
  .filter(key => key.startsWith('--'))
  .map(key => `${key}: ${styles.getPropertyValue(key)}`)
```

## 🎨 设计系统集成

### 与 Element Plus 保持一致

```scss
:root {
  // 使用 Element Plus 的颜色系统
  --main-color: var(--el-color-primary);
  --success-color: var(--el-color-success);
  --warning-color: var(--el-color-warning);
  --danger-color: var(--el-color-danger);
}
```

### 响应式主题

```scss
// 移动端可能需要不同的主题设置
@media (max-width: 768px) {
  :root {
    --menu-bg: var(--bg-level-1);  // 移动端浅色菜单
  }

  html.dark {
    --menu-bg: var(--bg-level-1);  // 保持一致
  }
}
```

通过这套主题系统,项目实现了灵活、可维护的视觉定制能力,为用户提供了优秀的使用体验。
