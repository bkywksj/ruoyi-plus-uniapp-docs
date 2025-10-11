# 平板适配

平板适配针对 iPad 等中等尺寸设备,提供介于移动端和桌面端之间的优化体验。

## 📱 平板断点

```scss
$md: 992px;                         // 中等屏幕断点
$device-ipad: 800px;                // 标准 iPad
$device-ipad-pro: 1180px;           // iPad Pro
$device-ipad-vertical: 900px;       // iPad 竖屏
```

## 🎯 平板优化

### 1. 布局调整

```scss
@include respond-to('md') {
  .sidebar {
    width: 200px;              // 缩小侧边栏
  }

  .app-main {
    padding: 12px;
  }
}
```

### 2. 网格布局

```scss
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  @include respond-to('md') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to('sm') {
    grid-template-columns: 1fr;
  }
}
```

### 3. 字体调整

```scss
@media (max-width: $md) {
  h1 { font-size: 2.25rem; }
  h2 { font-size: 1.875rem; }
}
```

## ✅ iPad 特定优化

### iPad 横屏

```scss
@media (min-width: $device-ipad) and (max-width: $device-ipad-pro) and (orientation: landscape) {
  .content {
    max-width: 90%;
    margin: 0 auto;
  }
}
```

### iPad 竖屏

```scss
@media (max-width: $device-ipad-vertical) and (orientation: portrait) {
  .sidebar {
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
}
```

平板适配确保了应用在中等尺寸设备上的最佳显示效果。
