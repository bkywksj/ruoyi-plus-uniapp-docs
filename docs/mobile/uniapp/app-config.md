# 应用配置 (uni.scss)

## 概述

`uni.scss` 是 uni-app 的全局样式变量文件，定义了应用的主题色、字体大小、间距等样式变量。这些变量可以在整个项目中使用，无需手动导入。

## 文件位置

```
src/uni.scss
```

## 自动导入机制

`uni.scss` 中的变量会被自动注入到每个 `.vue` 组件的 `<style lang="scss">` 中，**无需手动导入**。

```vue
<style lang="scss" scoped>
.button {
  /* 直接使用 uni.scss 中的变量 */
  color: $uni-color-primary;
  font-size: $uni-font-size-base;
}
</style>
```

## 颜色变量

### 行为相关颜色

```scss
/* 主色调 */
$uni-color-primary: #007aff;      // 主色（品牌色）
$uni-color-success: #4cd964;      // 成功色
$uni-color-warning: #f0ad4e;      // 警告色
$uni-color-error: #dd524d;        // 错误色
```

**使用场景**：

| 变量 | 使用场景 | 示例 |
|------|---------|------|
| `$uni-color-primary` | 主按钮、链接、重要信息 | 提交按钮 |
| `$uni-color-success` | 成功提示、完成状态 | 支付成功 |
| `$uni-color-warning` | 警告提示、待处理状态 | 待审核 |
| `$uni-color-error` | 错误提示、危险操作 | 删除按钮 |

### 文字颜色

```scss
$uni-text-color: #333;                    // 基本文字颜色
$uni-text-color-inverse: #fff;            // 反色文字（用于深色背景）
$uni-text-color-grey: #999;               // 辅助灰色文字
$uni-text-color-placeholder: #808080;     // 占位符文字
$uni-text-color-disable: #c0c0c0;         // 禁用状态文字
```

**使用示例**：

```vue
<style lang="scss" scoped>
.title {
  color: $uni-text-color;           // 标题：深色
}

.subtitle {
  color: $uni-text-color-grey;      // 副标题：灰色
}

.disabled-text {
  color: $uni-text-color-disable;   // 禁用：浅灰
}
</style>
```

### 背景颜色

```scss
$uni-bg-color: #fff;                      // 主背景色（白色）
$uni-bg-color-grey: #f8f8f8;              // 灰色背景
$uni-bg-color-hover: #f1f1f1;             // 点击态背景
$uni-bg-color-mask: rgba(0, 0, 0, 0.4);   // 遮罩层背景
```

**使用场景**：

```scss
.page {
  background-color: $uni-bg-color;        // 页面背景
}

.card {
  background-color: $uni-bg-color-grey;   // 卡片背景
}

.item:active {
  background-color: $uni-bg-color-hover;  // 按下态
}

.modal-mask {
  background-color: $uni-bg-color-mask;   // 弹窗遮罩
}
```

### 边框颜色

```scss
$uni-border-color: #c8c7cc;               // 边框颜色
```

## 尺寸变量

### 文字尺寸

```scss
$uni-font-size-sm: 12px;                  // 小号字体
$uni-font-size-base: 14px;                // 基础字体
$uni-font-size-lg: 16px;                  // 大号字体
```

**字体使用规范**：

| 尺寸 | 使用场景 | rpx换算 |
|------|---------|---------|
| `12px` | 辅助文字、说明 | 24rpx |
| `14px` | 正文、列表 | 28rpx |
| `16px` | 标题、按钮 | 32rpx |

### 图片尺寸

```scss
$uni-img-size-sm: 20px;                   // 小图标
$uni-img-size-base: 26px;                 // 基础图标
$uni-img-size-lg: 40px;                   // 大图标
```

### 圆角半径

```scss
$uni-border-radius-sm: 2px;               // 小圆角
$uni-border-radius-base: 3px;             // 基础圆角
$uni-border-radius-lg: 6px;               // 大圆角
$uni-border-radius-circle: 50%;           // 圆形
```

**使用示例**：

```scss
.button {
  border-radius: $uni-border-radius-base;    // 按钮圆角
}

.card {
  border-radius: $uni-border-radius-lg;      // 卡片圆角
}

.avatar {
  border-radius: $uni-border-radius-circle;  // 圆形头像
}
```

### 间距变量

**水平间距（左右）**：

```scss
$uni-spacing-row-sm: 5px;                 // 小间距
$uni-spacing-row-base: 10px;              // 基础间距
$uni-spacing-row-lg: 15px;                // 大间距
```

**垂直间距（上下）**：

```scss
$uni-spacing-col-sm: 4px;                 // 小间距
$uni-spacing-col-base: 8px;               // 基础间距
$uni-spacing-col-lg: 12px;                // 大间距
```

**使用示例**：

```scss
.container {
  padding: $uni-spacing-row-base;          // 左右10px
  margin-top: $uni-spacing-col-lg;         // 上方12px
}

.item + .item {
  margin-top: $uni-spacing-col-base;       // 项目间距8px
}
```

## 文章场景变量

```scss
/* 标题 */
$uni-color-title: #2c405a;                // 文章标题颜色
$uni-font-size-title: 20px;               // 标题字号

/* 副标题 */
$uni-color-subtitle: #555;                // 二级标题颜色
$uni-font-size-subtitle: 18px;            // 副标题字号

/* 段落 */
$uni-color-paragraph: #3f536e;            // 段落文字颜色
$uni-font-size-paragraph: 15px;           // 段落字号
```

**使用示例**：

```vue
<style lang="scss" scoped>
.article {
  .title {
    color: $uni-color-title;
    font-size: $uni-font-size-title;
  }

  .subtitle {
    color: $uni-color-subtitle;
    font-size: $uni-font-size-subtitle;
  }

  .content {
    color: $uni-color-paragraph;
    font-size: $uni-font-size-paragraph;
    line-height: 1.6;
  }
}
</style>
```

## 其他变量

### 透明度

```scss
$uni-opacity-disabled: 0.3;               // 禁用态透明度
```

**使用示例**：

```scss
.button:disabled {
  opacity: $uni-opacity-disabled;          // 禁用按钮
}

.text-disabled {
  opacity: $uni-opacity-disabled;          // 禁用文字
}
```

## 自定义主题

### 修改全局变量

直接修改 `uni.scss` 中的变量值：

```scss
/* 修改主色调为绿色 */
$uni-color-primary: #4cd964;

/* 修改基础字号 */
$uni-font-size-base: 16px;
```

### 扩展自定义变量

在 `uni.scss` 中添加项目特定的变量：

```scss
/* ========== 项目自定义变量 ========== */

/* 品牌色 */
$brand-color-primary: #0957DE;            // 品牌主色
$brand-color-secondary: #FF6B6B;          // 品牌辅色

/* 自定义间距 */
$spacing-page: 32rpx;                     // 页面边距
$spacing-card: 24rpx;                     // 卡片内边距

/* 自定义圆角 */
$border-radius-card: 16rpx;               // 卡片圆角
$border-radius-button: 8rpx;              // 按钮圆角

/* 阴影 */
$box-shadow-card: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
```

## 变量使用示例

### 示例 1：按钮组件

```vue
<template>
  <button class="custom-button" :class="{ 'is-disabled': disabled }">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.custom-button {
  /* 使用 uni.scss 变量 */
  padding: $uni-spacing-col-base $uni-spacing-row-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color-inverse;
  background-color: $uni-color-primary;
  border-radius: $uni-border-radius-base;
  border: none;

  &:active {
    background-color: darken($uni-color-primary, 10%);
  }

  &.is-disabled {
    opacity: $uni-opacity-disabled;
    cursor: not-allowed;
  }
}
</style>
```

### 示例 2：卡片组件

```vue
<template>
  <view class="card">
    <view class="card-header">
      <text class="card-title">标题</text>
    </view>
    <view class="card-body">
      <slot />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  border: 1px solid $uni-border-color;
  overflow: hidden;

  .card-header {
    padding: $uni-spacing-col-base $uni-spacing-row-base;
    border-bottom: 1px solid $uni-border-color;

    .card-title {
      font-size: $uni-font-size-lg;
      color: $uni-text-color;
      font-weight: bold;
    }
  }

  .card-body {
    padding: $uni-spacing-col-lg $uni-spacing-row-base;
    color: $uni-text-color;
    font-size: $uni-font-size-base;
  }
}
</style>
```

### 示例 3：表单组件

```vue
<template>
  <view class="form-item">
    <text class="label">用户名</text>
    <input class="input" placeholder="请输入用户名" />
  </view>
</template>

<style lang="scss" scoped>
.form-item {
  margin-bottom: $uni-spacing-col-lg;

  .label {
    display: block;
    margin-bottom: $uni-spacing-col-sm;
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }

  .input {
    width: 100%;
    padding: $uni-spacing-col-base $uni-spacing-row-base;
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    background-color: $uni-bg-color;
    border: 1px solid $uni-border-color;
    border-radius: $uni-border-radius-base;

    &::placeholder {
      color: $uni-text-color-placeholder;
    }

    &:focus {
      border-color: $uni-color-primary;
    }

    &:disabled {
      background-color: $uni-bg-color-grey;
      color: $uni-text-color-disable;
    }
  }
}
</style>
```

## 与 CSS 变量结合

### 动态主题切换

可以结合 CSS 变量实现动态主题：

```scss
// uni.scss
$uni-color-primary: var(--primary-color, #007aff);

// 组件中
<style lang="scss" scoped>
.button {
  background-color: $uni-color-primary;
}
</style>

// JavaScript 动态修改
<script setup>
const changePrimaryColor = (color) => {
  document.documentElement.style.setProperty('--primary-color', color)
}
</script>
```

## rpx 与 px 转换

### 单位说明

- **rpx**：响应式 px，根据屏幕宽度自适应
- **px**：固定像素，不会随屏幕变化

### 转换关系

以 iPhone 6 为例（屏幕宽度 375px）：

```
750rpx = 375px（屏幕宽度）
1rpx = 0.5px
2rpx = 1px
```

### 使用建议

```scss
/* ✅ 推荐：移动端尺寸使用 rpx */
.container {
  width: 750rpx;           // 全屏宽度
  padding: 32rpx;          // 内边距
  font-size: 28rpx;        // 字体大小
}

/* ✅ 可以：边框使用 px */
.border {
  border: 1px solid #ddd;  // 1px 边框在所有屏幕都是 1px
}

/* ❌ 不推荐：混用不统一 */
.mixed {
  width: 375px;            // 固定宽度（小屏幕会超出）
  padding: 16rpx;          // 响应式内边距
}
```

## 最佳实践

### 1. 保持变量一致性

```scss
/* ✅ 好的做法：使用变量 */
.button {
  color: $uni-color-primary;
  font-size: $uni-font-size-base;
}

/* ❌ 不好的做法：硬编码 */
.button {
  color: #007aff;
  font-size: 14px;
}
```

### 2. 合理使用间距变量

```scss
/* ✅ 推荐：使用统一的间距 */
.container {
  padding: $uni-spacing-row-base;
  margin-bottom: $uni-spacing-col-lg;
}

/* ❌ 不推荐：随意的间距 */
.container {
  padding: 13px;
  margin-bottom: 17px;
}
```

### 3. 语义化使用颜色

```scss
/* ✅ 推荐：根据语义使用颜色 */
.success-text {
  color: $uni-color-success;
}

.error-text {
  color: $uni-color-error;
}

/* ❌ 不推荐：用途不明确 */
.text-green {
  color: #4cd964;
}
```

## 常见问题

### 1. 变量不生效？

**原因**：
- style 标签未添加 `lang="scss"`
- 变量名拼写错误

**解决方案**：
```vue
<!-- ✅ 正确 -->
<style lang="scss" scoped>
.button {
  color: $uni-color-primary;
}
</style>

<!-- ❌ 错误 -->
<style scoped>
.button {
  color: $uni-color-primary;  /* 无法识别 */
}
</style>
```

### 2. 如何在 JS 中使用这些变量？

**解决方案**：
```typescript
// 定义配置文件
// src/config/theme.ts
export const theme = {
  colorPrimary: '#007aff',
  colorSuccess: '#4cd964',
  colorWarning: '#f0ad4e',
  colorError: '#dd524d'
}

// 使用
import { theme } from '@/config/theme'
console.log(theme.colorPrimary)
```

### 3. 修改变量后不生效？

**解决方案**：
- 清除缓存
- 重启开发服务器
- 小程序需要重新编译

## 相关文档

- [页面配置 (pages.json)](./pages-config.md) - 页面路由配置
- [项目配置 (manifest.json)](./manifest-config.md) - 应用配置
- [样式系统](../styles/overview.md) - 完整样式系统文档
