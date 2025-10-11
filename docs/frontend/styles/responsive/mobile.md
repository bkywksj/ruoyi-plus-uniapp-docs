# 移动端适配

移动端适配确保应用在手机和小屏设备上提供良好的用户体验。

## 📱 移动端断点

```scss
$device-phone: 500px;               // 手机设备
$sm: 768px;                         // 小屏幕断点
```

## 🎯 移动端优化

### 1. 布局调整

```scss
@include respond-to('sm') {
  .sidebar {
    width: 100%;
    position: fixed;
    z-index: var(--z-sidebar);
  }

  .app-main {
    padding: 8px;
  }
}
```

### 2. 字体调整

```scss
@media (max-width: 768px) {
  body {
    font-size: 16px;           // 移动端基础字号增大
    line-height: 1.6;          // 增加行高提升可读性
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.5rem; }
}
```

### 3. 触摸优化

```scss
@media (max-width: 768px) {
  button,
  .clickable {
    min-height: 44px;          // iOS 推荐的最小触摸目标
    min-width: 44px;
  }

  .el-button {
    padding: 12px 20px;        // 增大触摸区域
  }
}
```

## 📐 响应式组件

### 导航栏

```scss
.navbar {
  @include respond-to('sm') {
    flex-direction: column;

    .nav-item {
      width: 100%;
      border-bottom: 1px solid var(--app-border);
    }
  }
}
```

### 表格

```scss
.el-table {
  @include respond-to('sm') {
    // 移动端横向滚动
    overflow-x: auto;

    .el-table__header {
      white-space: nowrap;
    }
  }
}
```

### 表单

```scss
.form-container {
  @include respond-to('sm') {
    .el-form-item {
      margin-bottom: 16px;

      .el-form-item__label {
        display: block;
        width: 100%;
        text-align: left;
        margin-bottom: 4px;
      }
    }
  }
}
```

## 🎨 移动端主题

```scss
@media (max-width: 768px) {
  :root {
    --menu-bg: var(--bg-level-1);     // 移动端使用浅色菜单
    --menu-text: var(--app-text);
  }
}
```

## ✅ 移动端检查清单

- [ ] 触摸目标至少 44x44px
- [ ] 字体大小至少 16px
- [ ] 横向滚动的表格和列表
- [ ] 折叠的侧边栏菜单
- [ ] 适当的间距和留白
- [ ] 禁用 hover 效果(使用 `@media (hover: hover)`)

移动端适配确保了应用在小屏设备上的可用性和美观性。
