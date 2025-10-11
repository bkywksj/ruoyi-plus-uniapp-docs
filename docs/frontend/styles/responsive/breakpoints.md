# 断点系统

断点系统定义了项目的响应式设计规范,确保应用在不同设备上都能提供良好的用户体验。

## 📏 断点定义

### SCSS 变量

```scss
/* 响应式断点变量 */
$sm: 768px;                        // 小屏幕断点 (平板)
$md: 992px;                        // 中等屏幕断点 (小桌面)
$lg: 1200px;                       // 大屏幕断点 (桌面)
$xl: 1920px;                       // 超大屏幕断点 (宽屏)

/* 设备断点变量 */
$device-notebook: 1600px;          // 笔记本电脑
$device-ipad-pro: 1180px;          // iPad Pro
$device-ipad: 800px;               // 标准 iPad
$device-ipad-vertical: 900px;      // iPad 竖屏
$device-phone: 500px;              // 手机设备
```

### 断点映射

```scss
$breakpoints: (
  'sm': $sm,
  'md': $md,
  'lg': $lg,
  'xl': $xl
) !default;
```

## 🔧 响应式 Mixin

### respond-to Mixin

```scss
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (max-width: #{$sm}) {
      @content;
    }
  } @else if $breakpoint == 'md' {
    @media (max-width: #{$md}) {
      @content;
    }
  } @else if $breakpoint == 'lg' {
    @media (max-width: #{$lg}) {
      @content;
    }
  } @else if $breakpoint == 'xl' {
    @media (max-width: #{$xl}) {
      @content;
    }
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}
```

## 🎯 使用示例

### 基础用法

```scss
.component {
  width: 100%;

  @include respond-to('md') {
    width: 80%;
  }

  @include respond-to('sm') {
    width: 100%;
  }
}
```

### 侧边栏响应式

```scss
.sidebar {
  width: 240px;

  @include respond-to('md') {
    width: 200px;
  }

  @include respond-to('sm') {
    width: 100%;
  }
}
```

### 字体大小响应式

```scss
h1 {
  font-size: 2.5rem;

  @include respond-to('md') {
    font-size: 2rem;
  }

  @include respond-to('sm') {
    font-size: 1.75rem;
  }
}
```

## 📱 设备特定断点

### 笔记本

```scss
@media (max-width: $device-notebook) {
  // 笔记本特定样式
}
```

### iPad Pro

```scss
@media (max-width: $device-ipad-pro) {
  // iPad Pro 特定样式
}
```

### 移动端

```scss
@media (max-width: $device-phone) {
  // 手机特定样式
}
```

## 🎨 UnoCSS 响应式

### 使用 UnoCSS 断点

```html
<!-- 移动端 -->
<div class="sm:hidden">桌面端显示</div>

<!-- 桌面端 -->
<div class="hidden sm:block">移动端显示</div>

<!-- 响应式布局 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 内容 -->
</div>
```

## ✅ 最佳实践

1. **移动优先** - 先设计移动端,再适配桌面端
2. **使用 Mixin** - 统一使用 `respond-to` mixin
3. **避免硬编码** - 使用预定义的断点变量
4. **测试多端** - 确保在所有断点下正常显示

断点系统为项目提供了灵活的响应式设计能力,确保了良好的多端适配。
