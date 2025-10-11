# 布局组件样式

布局组件样式定义了应用的整体结构,包括侧边栏、头部、主内容区等核心布局元素。

## 📁 文件位置

布局样式定义在 `styles/layout/_layout.scss`。

## 🎯 核心布局样式

### 侧边栏容器

```scss
.sidebar-container {
  background: var(--menu-bg);
  width: $base-sidebar-width;  // 240px
  transition: width var(--duration-normal);

  // 边框样式
  border-right: 0.5px solid var(--app-border);

  // 折叠状态
  &.collapsed {
    width: var(--sidebar-collapsed-width);  // 54px
  }
}
```

### 主内容区

```scss
.app-main {
  background-color: var(--app-bg);
  min-height: calc(100vh - var(--header-height));
  padding: 16px;
}
```

### 头部容器

```scss
.header-container {
  background: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  height: var(--header-height);
}
```

## 🎨 主题适配

### 亮色主题

```scss
html:not(.dark) {
  .sidebar-container {
    box-shadow: none;
    border-right: 0.5px solid var(--app-border);
  }
}
```

### 暗色主题

```scss
html.dark {
  .sidebar-container {
    box-shadow: none;
    border-right: 0.5px solid var(--app-border);
  }
}
```

## ✅ 使用说明

布局组件样式确保了应用在不同主题下的一致性和美观性。所有布局相关样式都使用 CSS 变量,自动适配主题切换。
