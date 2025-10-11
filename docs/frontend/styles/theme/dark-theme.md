# 暗色主题

暗色主题为用户提供护眼的深色视觉体验,减少眼睛疲劳,适合夜间使用和长时间工作场景。

## 🎨 配置文件

暗色主题定义在 `styles/themes/_dark.scss` 文件中,通过 `html.dark` 选择器激活。

## 🌙 启用暗色主题

```html
<html class="dark">
  <!-- 整个应用切换到暗色主题 -->
</html>
```

## 📊 颜色系统

### 背景色层级

暗色主题同样采用 5 层背景色系统,但整体色调偏深:

```scss
html.dark {
  /* === 背景色层级系统 === */
  --bg-base: #111113;           /* 最深层:应用主背景 */
  --bg-level-1: #161618;        /* 一级:卡片、侧边栏基础背景 */
  --bg-level-2: #1f1f23;        /* 二级:轻微悬停、子区域 */
  --bg-level-3: #262727;        /* 三级:明显悬停、表格行悬停 */
  --bg-level-4: #2d2d30;        /* 四级:选中、激活状态 */
}
```

**设计特点**:
- 最深背景 `#111113` 接近纯黑,减少屏幕亮度
- 层级间差异适中,保持清晰的视觉层次
- 避免纯黑色,使用略带灰度的深色更柔和

### 应用级颜色

```scss
html.dark {
  /* 应用整体背景色 */
  --app-bg: var(--bg-base);

  /* 应用主要文字颜色 */
  --app-text: #f1f5f9;

  /* 应用边框颜色 */
  --app-border: #363843;
}
```

**文字颜色选择**:
- 使用 `#f1f5f9` 而非纯白,降低刺眼感
- 边框颜色加深,保持暗色氛围

### 菜单配色方案

```scss
html.dark {
  /* 侧边栏菜单背景色 */
  --menu-bg: var(--bg-level-1);

  /* 菜单普通文字颜色 */
  --menu-text: #cbd5e1;

  /* 菜单激活状态文字颜色 */
  --menu-text-active: #f4f4f5;

  /* 基础悬停背景色 */
  --menu-hover: var(--bg-level-2);

  /* 基础悬停文字色 */
  --menu-hover-text: #f4f4f5;

  /* 子菜单背景色 */
  --submenu-bg: var(--bg-level-2);

  /* 子菜单激活文字色 */
  --submenu-text-active: #f4f4f5;
}
```

**暗色菜单特点**:
- 与内容区统一使用深色背景
- 通过文字颜色和悬停效果区分状态
- 整体视觉更加沉浸

### 头部配色

```scss
html.dark {
  /* 头部背景色 */
  --header-bg: var(--app-bg);

  /* 头部文字色 */
  --header-text: #f1f5f9;

  /* 头部边框色 */
  --header-border: #334155;

  /* 表格头部背景色 */
  --table-header-bg: var(--el-bg-color);

  /* 表格头部文字色 */
  --table-header-text: var(--el-text-color);
}
```

### 标签页配色

```scss
html.dark {
  /* 标签页激活背景色 */
  --tags-view-active-bg: var(--el-color-primary-dark-6);

  /* 标签页激活边框色 */
  --tags-view-active-border: var(--el-color-primary-light-2);
}
```

## 🎯 Element Plus 集成

### 颜色映射

```scss
html.dark {
  /* Element UI 颜色映射 */
  --el-color-primary: #3b82f6;
  --el-color-primary-light-3: #60a5fa;
  --el-color-primary-light-2: #3b82f6;
  --el-bg-color-overlay: var(--bg-level-1);
  --el-bg-color: var(--bg-level-1);
  --el-text-color-primary: var(--app-text);
  --el-border-color: var(--app-border);
  --el-border-color-light: #475569;
}
```

**暗色主题调整**:
- 主色调整为略深的蓝色 `#3b82f6`
- 边框颜色使用深灰,避免过于刺眼

### Element Plus 组件样式覆盖

```scss
html.dark {
  /* 树节点内容背景色 */
  .el-tree-node__content {
    --el-color-primary-light-9: var(--bg-level-3);
  }

  /* 主要按钮背景色 */
  .el-button--primary {
    --el-button-bg-color: var(--el-color-primary-dark-6);
    --el-button-border-color: var(--el-color-primary-light-2);
  }

  /* 开关开启状态颜色 */
  .el-switch {
    --el-switch-on-color: var(--el-color-primary-dark-6);
    --el-switch-border-color: var(--el-color-primary-light-2);
  }

  /* 主要标签背景色 */
  .el-tag--primary {
    --el-tag-bg-color: var(--el-color-primary-dark-6);
    --el-tag-border-color: var(--el-color-primary-light-2);
  }
}
```

## 🎨 特定样式覆盖

### 布局相关样式

```scss
html.dark {
  /* 主内容区背景色 */
  .app-main {
    background-color: var(--app-bg);
  }

  /* 侧边栏右侧边框 */
  .sidebar-container {
    box-shadow: none;
    border-right: 0.5px solid var(--app-border);
  }

  /* 标签页容器背景色 */
  .tags-view-container {
    background-color: var(--header-bg);
    border-color: var(--header-border);
  }
}
```

### 卡片阴影效果

```scss
html.dark {
  /* 卡片类组件阴影 - 暗色主题下使用更深的阴影 */
  .search, .panel, .el-card {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  }
}
```

### 表格悬停效果

```scss
html.dark {
  /* 表格悬停颜色 */
  .el-table__body .el-table__row:hover > td {
    background-color: var(--bg-level-3) !important;
  }
}
```

### SVG 图标颜色

```scss
html.dark {
  /* SVG图标填充色 */
  .svg-icon, svg {
    fill: var(--app-text);
  }
}
```

## 🔧 使用示例

### 在组件中使用

```vue
<template>
  <div class="dark-card">
    <h3 class="dark-title">暗色主题标题</h3>
    <p class="dark-content">暗色主题内容</p>
  </div>
</template>

<style scoped lang="scss">
.dark-card {
  background: var(--bg-level-1);
  border: 1px solid var(--app-border);
  padding: 16px;
  border-radius: 8px;

  // 自动适配主题
  color: var(--app-text);
}
</style>
```

### 主题感知组件

```vue
<script setup lang="ts">
import { useDark } from '@vueuse/core'

const isDark = useDark()
</script>

<template>
  <div :class="{ 'dark-mode': isDark }">
    <!-- 根据主题显示不同内容 -->
    <span v-if="isDark">🌙 暗色模式</span>
    <span v-else>☀️ 亮色模式</span>
  </div>
</template>
```

## 🎭 视觉特点

### 1. 护眼设计

- 深色背景减少蓝光刺激
- 降低屏幕整体亮度
- 适合长时间使用

### 2. 沉浸体验

- 统一的深色调
- 弱化边界,内容更聚焦
- 现代化的视觉感受

### 3. 柔和对比

- 避免纯黑纯白的强烈对比
- 使用中性灰度保持舒适度

## 🌈 配色建议

### 主色调整

```scss
html.dark {
  // 暗色主题下可使用更明亮的主色
  --el-color-primary: #3b82f6;  // 比亮色主题更亮的蓝色
}
```

### 辅助色

```scss
html.dark {
  --accent-color: #14b8a6;       // 青色强调
  --warning-bg: #78350f;          // 暗色警告背景
}
```

### 对比度优化

```scss
html.dark {
  // 确保暗色主题下的对比度
  --text-on-dark: #f1f5f9;       // 对比度 15.8:1
  --text-secondary: #cbd5e1;      // 对比度 11.2:1
}
```

## 📱 响应式适配

```scss
@media (max-width: 768px) {
  html.dark {
    // 移动端可能需要稍微提亮
    --bg-base: #1a1a1c;
  }
}
```

## 🔍 调试技巧

### 切换到暗色主题

```javascript
// 激活暗色主题
document.documentElement.classList.add('dark')

// 取消暗色主题
document.documentElement.classList.remove('dark')
```

### 检查暗色变量

```javascript
// 在暗色主题下检查变量
const bg = getComputedStyle(document.documentElement)
  .getPropertyValue('--bg-base')
console.log('暗色主题背景:', bg)  // #111113
```

## ✅ 最佳实践

1. **保持一致性** - 所有组件都应支持暗色主题
2. **避免纯黑** - 使用略带灰度的深色更舒适
3. **测试对比度** - 确保文字在深色背景上清晰可读
4. **提供切换选项** - 让用户自由选择主题模式
5. **考虑系统偏好** - 可响应操作系统的暗色模式设置

```javascript
// 响应系统暗色模式
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
darkModeQuery.addEventListener('change', (e) => {
  if (e.matches) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
```

暗色主题为用户提供了舒适、护眼的视觉体验,是夜间使用和长时间工作的理想选择。
