# 按钮组件样式

项目提供了丰富的按钮样式系统,包括基于颜色的按钮变体和带动画效果的特殊按钮。

## 📁 文件位置

按钮样式定义在 `styles/components/_buttons.scss`。

## 🎨 颜色按钮系统

### colorBtn Mixin

```scss
@mixin colorBtn($color) {
  background: $color;

  &:hover {
    color: $color;

    &:before,
    &:after {
      background: $color;
    }
  }
}
```

**功能说明**:
- 默认:背景为指定颜色,白色文字
- 悬停:白色背景,文字变为指定颜色
- 伪元素边框动画效果

### 预定义颜色按钮

```scss
.blue-btn {
  @include colorBtn($blue);           // 蓝色按钮
}

.light-blue-btn {
  @include colorBtn($light-blue);     // 浅蓝色按钮
}

.red-btn {
  @include colorBtn($red);            // 红色按钮
}

.pink-btn {
  @include colorBtn($pink);           // 粉色按钮
}

.green-btn {
  @include colorBtn($green);          // 绿色按钮
}

.tiffany-btn {
  @include colorBtn($tiffany);        // 蒂芙尼蓝按钮
}

.yellow-btn {
  @include colorBtn($yellow);         // 黄色按钮
}
```

## 🎭 Pan 按钮(带动画)

### 基础样式

```scss
.pan-btn {
  font-size: 14px;
  color: #fff;
  padding: 14px 36px;
  border-radius: 8px;
  border: none;
  outline: none;
  transition: 600ms ease all;
  position: relative;
  display: inline-block;
}
```

### 悬停效果

```scss
.pan-btn {
  &:hover {
    background: #fff;

    &:before,
    &:after {
      width: 100%;
      transition: 600ms ease all;
    }
  }
}
```

### 边框线动画

```scss
.pan-btn {
  // 上边框线
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 2px;
    width: 0;
    transition: 400ms ease all;
  }

  // 下边框线
  &::after {
    content: '';
    position: absolute;
    right: inherit;
    top: inherit;
    left: 0;
    bottom: 0;
    height: 2px;
    width: 0;
    transition: 400ms ease all;
  }
}
```

**动画效果**:
- 初始状态:边框线宽度为0
- 悬停时:边框线从左右两端向中间延伸至100%
- 形成独特的上下边框扫描效果

## 🔘 Custom Button

### 基础按钮样式

```scss
.custom-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  color: #fff;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 4px;
}
```

## 🔧 使用示例

### 颜色按钮

```html
<button class="blue-btn pan-btn">蓝色按钮</button>
<button class="green-btn pan-btn">绿色按钮</button>
<button class="red-btn pan-btn">红色按钮</button>
```

### 自定义颜色按钮

```vue
<template>
  <button class="custom-color-btn pan-btn">
    自定义颜色
  </button>
</template>

<style scoped lang="scss">
.custom-color-btn {
  @include colorBtn(#ff6b6b);  // 使用自定义颜色
}
</style>
```

### 基础按钮

```html
<button class="custom-button">自定义按钮</button>
```

## 🎨 主题集成

### 使用主题变量

```scss
.theme-btn {
  @include colorBtn(var(--el-color-primary));

  &:hover {
    color: var(--el-color-primary);
  }
}
```

### 暗色主题适配

```scss
html.dark {
  .pan-btn {
    &:hover {
      background: var(--bg-level-2);  // 暗色主题下的悬停背景
    }
  }
}
```

## 🎯 按钮变体

### 大小变体

```scss
.pan-btn {
  &--small {
    padding: 8px 20px;
    font-size: 12px;
  }

  &--large {
    padding: 18px 48px;
    font-size: 16px;
  }
}
```

### 状态变体

```scss
.pan-btn {
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--loading {
    position: relative;
    pointer-events: none;

    &::before {
      content: '';
      // 加载动画
    }
  }
}
```

## 📐 响应式按钮

```scss
@media (max-width: 768px) {
  .pan-btn {
    padding: 10px 24px;
    font-size: 13px;
  }
}
```

## ✅ 最佳实践

1. **使用 Mixin** - 复用颜色按钮样式
2. **保持一致性** - 遵循项目按钮尺寸规范
3. **主题兼容** - 确保按钮在多主题下正常显示
4. **无障碍性** - 提供清晰的焦点状态和禁用状态

按钮组件样式系统为项目提供了丰富多样的按钮选择,满足各种UI设计需求。
