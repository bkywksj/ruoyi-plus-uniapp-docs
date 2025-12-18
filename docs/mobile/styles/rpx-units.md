# RPX 单位系统

## 介绍

rpx（responsive pixel）是 UniApp 提供的响应式像素单位，可以根据屏幕宽度进行自适应。rpx 单位使得开发者无需针对不同设备编写多套样式，实现一套代码适配所有屏幕尺寸。

**核心特性:**

- **自动适配** - 根据屏幕宽度自动计算实际像素值
- **设计稿还原** - 以 750px 设计稿为基准，1:1 还原设计
- **跨平台统一** - 在各端表现一致
- **简化开发** - 无需媒体查询和多套样式

## 换算规则

### 基准说明

rpx 以 750px 宽度的设计稿为基准：

- 设计稿宽度：750px
- 屏幕宽度：750rpx
- 换算公式：`实际px = rpx值 × (屏幕宽度 / 750)`

### 常见设备换算

| 设备 | 屏幕宽度 | 1rpx 对应 px |
|------|---------|-------------|
| iPhone 5/SE | 320px | 0.42px |
| iPhone 6/7/8 | 375px | 0.5px |
| iPhone 6/7/8 Plus | 414px | 0.55px |
| iPhone X/XS/11 Pro | 375px | 0.5px |
| iPhone XR/11 | 414px | 0.55px |
| iPhone 12/13/14 | 390px | 0.52px |
| iPhone 12/13/14 Pro Max | 428px | 0.57px |

### 换算示例

在 750px 设计稿中：
- 设计稿标注 100px → 使用 100rpx
- 设计稿标注 32px → 使用 32rpx
- 设计稿标注 750px（全宽） → 使用 750rpx 或 100%

## 基本用法

### 尺寸设置

```scss
.container {
  width: 750rpx;        // 全屏宽度
  padding: 32rpx;       // 内边距
  margin: 24rpx 0;      // 外边距
}

.card {
  width: 690rpx;        // 卡片宽度(750-30*2)
  height: 200rpx;       // 卡片高度
  border-radius: 16rpx; // 圆角
}
```

### 字体大小

```scss
.title {
  font-size: 32rpx;     // 标题字号
  line-height: 48rpx;   // 行高
}

.content {
  font-size: 28rpx;     // 正文字号
  line-height: 40rpx;
}

.caption {
  font-size: 24rpx;     // 辅助文字
  line-height: 36rpx;
}

.small {
  font-size: 20rpx;     // 小号文字
  line-height: 28rpx;
}
```

### 间距系统

```scss
// 基础间距
$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-md: 24rpx;
$spacing-lg: 32rpx;
$spacing-xl: 48rpx;

// 使用示例
.list-item {
  padding: $spacing-md $spacing-lg;
  margin-bottom: $spacing-sm;
}
```

## 与其他单位配合

### rpx + px 混用

某些场景需要固定像素值，不随屏幕缩放：

```scss
.border-box {
  // 边框使用 px，保持 1 像素清晰
  border: 1px solid #eee;

  // 内边距使用 rpx，自适应屏幕
  padding: 24rpx;
}

.icon {
  // 小图标使用 px，避免模糊
  width: 16px;
  height: 16px;
}
```

### rpx + % 混用

```scss
.flex-container {
  display: flex;
  padding: 24rpx;
}

.flex-item {
  // 百分比实现等分
  width: 50%;
  // rpx 实现固定间距
  padding: 16rpx;
}
```

### rpx + vw/vh 混用

```scss
.full-screen {
  width: 100vw;
  height: 100vh;
  padding: 32rpx;
}

.header {
  height: 88rpx;
  // 安全区域适配
  padding-top: env(safe-area-inset-top);
}
```

## 常用尺寸规范

### 页面布局

```scss
// 页面边距
$page-padding: 30rpx;

// 安全区域
$safe-area-bottom: env(safe-area-inset-bottom);

// 导航栏高度
$navbar-height: 88rpx;

// 标签栏高度
$tabbar-height: 100rpx;
```

### 组件尺寸

```scss
// 按钮高度
$button-height-small: 48rpx;
$button-height-medium: 72rpx;
$button-height-large: 88rpx;

// 输入框高度
$input-height: 88rpx;

// 单元格高度
$cell-height: 96rpx;

// 头像尺寸
$avatar-size-small: 48rpx;
$avatar-size-medium: 64rpx;
$avatar-size-large: 96rpx;
```

### 圆角规范

```scss
$radius-xs: 4rpx;
$radius-sm: 8rpx;
$radius-md: 12rpx;
$radius-lg: 16rpx;
$radius-xl: 24rpx;
$radius-round: 999rpx;
$radius-circle: 50%;
```

### 图标尺寸

```scss
$icon-size-xs: 24rpx;
$icon-size-sm: 32rpx;
$icon-size-md: 40rpx;
$icon-size-lg: 48rpx;
$icon-size-xl: 64rpx;
```

## 设计稿适配

### 750px 设计稿

这是 UniApp 默认支持的设计稿宽度，直接使用标注值：

```scss
// 设计稿标注: width: 200px, height: 100px
.box {
  width: 200rpx;
  height: 100rpx;
}
```

### 其他宽度设计稿

如果设计稿不是 750px，需要进行换算：

```scss
// 375px 设计稿换算公式
// rpx值 = 设计稿标注px × 2

// 设计稿(375px)标注: width: 100px
.box {
  width: 200rpx; // 100 × 2 = 200
}
```

### 配置设计稿宽度

在 `pages.json` 中可以配置：

```json
{
  "globalStyle": {
    "rpxCalcMaxDeviceWidth": 960,
    "rpxCalcBaseDeviceWidth": 375,
    "rpxCalcIncludeWidth": 750
  }
}
```

## 响应式布局

### Flex 布局 + rpx

```scss
.card-list {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx;
  gap: 24rpx;
}

.card-item {
  width: calc(50% - 12rpx);
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
}
```

### Grid 布局 + rpx

```scss
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  padding: 24rpx;
}

.grid-item {
  height: 200rpx;
  border-radius: 12rpx;
}
```

### 自适应宽度

```scss
.adaptive-box {
  // 最小宽度
  min-width: 200rpx;

  // 最大宽度
  max-width: 600rpx;

  // 自适应宽度
  width: 100%;
}
```

## 平台差异

### H5 端

rpx 会被转换为 rem 或 vw 单位：

```scss
// 源码
.box {
  width: 200rpx;
}

// 编译后 (rem 方案)
.box {
  width: 5.33333rem;
}

// 编译后 (vw 方案)
.box {
  width: 26.66667vw;
}
```

### 小程序端

rpx 是小程序原生支持的单位，无需转换。

### App 端

App 端会根据屏幕宽度动态计算 rpx 对应的像素值。

## 最佳实践

### 1. 统一使用 rpx

```scss
// 推荐：统一使用 rpx
.component {
  width: 200rpx;
  height: 100rpx;
  padding: 24rpx;
  font-size: 28rpx;
  border-radius: 12rpx;
}

// 不推荐：混用多种单位
.component {
  width: 100px;
  height: 50px;
  padding: 12px;
  font-size: 14px;
}
```

### 2. 边框使用 px

```scss
// 推荐：边框使用 px 保持清晰
.card {
  border: 1px solid #eee;
  padding: 24rpx;
}

// 不推荐：边框使用 rpx 可能模糊
.card {
  border: 2rpx solid #eee;
}
```

### 3. 定义变量复用

```scss
// 定义尺寸变量
$page-padding: 30rpx;
$card-radius: 16rpx;
$font-size-base: 28rpx;

// 复用变量
.page {
  padding: $page-padding;
}

.card {
  margin: 0 $page-padding;
  border-radius: $card-radius;
  font-size: $font-size-base;
}
```

### 4. 避免过小的 rpx 值

```scss
// 推荐：使用 px 表示细线
.divider {
  height: 1px;
  background: #eee;
}

// 不推荐：过小的 rpx 值显示不稳定
.divider {
  height: 1rpx;
}
```

## 工具函数

### rpx 转 px

```typescript
/**
 * rpx 转 px
 * @param rpx rpx 值
 * @returns px 值
 */
export function rpx2px(rpx: number): number {
  const systemInfo = uni.getSystemInfoSync()
  return rpx * (systemInfo.windowWidth / 750)
}

// 使用示例
const pxValue = rpx2px(100) // 在 375px 宽屏幕上返回 50
```

### px 转 rpx

```typescript
/**
 * px 转 rpx
 * @param px px 值
 * @returns rpx 值
 */
export function px2rpx(px: number): number {
  const systemInfo = uni.getSystemInfoSync()
  return px * (750 / systemInfo.windowWidth)
}

// 使用示例
const rpxValue = px2rpx(50) // 在 375px 宽屏幕上返回 100
```

## 常见问题

### 1. 1rpx 边框显示问题

在某些设备上 1rpx 边框可能不显示或显示模糊。

**解决方案：**
```scss
// 使用 transform 缩放
.border-bottom {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: #eee;
    transform: scaleY(0.5);
  }
}
```

### 2. 字体大小限制

某些浏览器有最小字体限制（如 Chrome 最小 12px）。

**解决方案：**
```scss
// 使用 transform 缩放
.small-text {
  font-size: 24rpx;
  transform: scale(0.8);
  transform-origin: left center;
}
```

### 3. rpx 在 nvue 中的使用

nvue 页面中 rpx 的表现可能与 vue 页面略有差异。

**解决方案：**
```scss
// nvue 中使用 px 单位
// 750px 设计稿下，1px = 1rpx / 2
.nvue-box {
  width: 100px; // 相当于 vue 中的 200rpx
}
```

### 4. 动态计算 rpx

需要在 JS 中动态计算尺寸时：

```typescript
// 获取屏幕信息
const { windowWidth } = uni.getSystemInfoSync()

// 计算实际像素
const actualPx = (100 / 750) * windowWidth

// 设置样式
element.style.width = actualPx + 'px'
```
