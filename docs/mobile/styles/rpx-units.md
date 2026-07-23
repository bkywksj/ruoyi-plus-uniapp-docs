# RPX 单位系统

## 介绍

rpx（responsive pixel）是 UniApp 提供的响应式像素单位，可以根据屏幕宽度进行自适应。rpx 单位使得开发者无需针对不同设备编写多套样式，实现一套代码适配所有屏幕尺寸。在 RuoYi-Plus-UniApp 项目中，rpx 是移动端样式开发的核心单位，结合 SCSS 变量系统和 WD UI 组件库，构建了完整的响应式布局体系。

**核心特性:**

- **自动适配** - 根据屏幕宽度自动计算实际像素值，无需手动适配
- **设计稿还原** - 以 750px 设计稿为基准，1:1 还原设计稿标注
- **跨平台统一** - 在 H5、小程序、App 各端表现一致
- **简化开发** - 无需编写媒体查询和多套样式代码
- **变量集成** - 与项目 SCSS 变量系统深度集成

## 架构设计

### 单位转换体系

```text
┌─────────────────────────────────────────────────────────────────┐
│                      RPX 单位转换体系                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  设计稿标注   │───▶│   rpx 值     │───▶│   实际像素   │       │
│  │   750px      │    │   750rpx     │    │   动态计算   │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │               平台编译转换                             │       │
│  ├──────────────────────────────────────────────────────┤       │
│  │  H5:      rpx → rem/vw (postcss 转换)                │       │
│  │  小程序:  rpx → 原生 rpx (直接支持)                   │       │
│  │  App:     rpx → px (运行时计算)                       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 响应式布局层次

```text
┌─────────────────────────────────────────────────────────────────┐
│                      响应式布局层次                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: 屏幕尺寸                                               │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  320px ~ 428px (手机) | 768px+ (平板) | 1024px+ (PC) │        │
│  └─────────────────────────────────────────────────────┘        │
│                              │                                   │
│                              ▼                                   │
│  Layer 2: rpx 换算                                               │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  实际px = rpx值 × (屏幕宽度 / 750)                    │        │
│  └─────────────────────────────────────────────────────┘        │
│                              │                                   │
│                              ▼                                   │
│  Layer 3: 组件尺寸                                               │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  按钮、输入框、卡片等 UI 组件自适应渲染               │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 换算规则

### 基准说明

rpx 以 750px 宽度的设计稿为基准：

- 设计稿宽度：750px
- 屏幕宽度：750rpx
- 换算公式：`实际px = rpx值 × (屏幕宽度 / 750)`

### 常见设备换算

| 设备 | 屏幕宽度 | 物理像素 | DPR | 1rpx 对应 px |
|------|---------|---------|-----|-------------|
| iPhone SE (1st) | 320px | 640px | 2 | 0.427px |
| iPhone 6/7/8 | 375px | 750px | 2 | 0.500px |
| iPhone 6/7/8 Plus | 414px | 1242px | 3 | 0.552px |
| iPhone X/XS/11 Pro | 375px | 1125px | 3 | 0.500px |
| iPhone XR/11 | 414px | 828px | 2 | 0.552px |
| iPhone 12/13/14 | 390px | 1170px | 3 | 0.520px |
| iPhone 12/13/14 Pro | 393px | 1179px | 3 | 0.524px |
| iPhone 12/13/14 Pro Max | 428px | 1284px | 3 | 0.571px |
| iPhone 15/16 | 393px | 1179px | 3 | 0.524px |
| iPhone 15/16 Pro Max | 430px | 1290px | 3 | 0.573px |
| Android 常见 | 360px | 1080px | 3 | 0.480px |
| Android 常见 | 375px | 1125px | 3 | 0.500px |
| Android 常见 | 412px | 1236px | 3 | 0.549px |
| 小程序开发工具 | 375px | 750px | 2 | 0.500px |

### 换算公式表

| 设计稿标注 | rpx 值 | iPhone 6 (375px) | iPhone 12 (390px) | iPhone Pro Max (428px) |
|-----------|--------|-----------------|-------------------|----------------------|
| 10px | 10rpx | 5px | 5.2px | 5.7px |
| 20px | 20rpx | 10px | 10.4px | 11.4px |
| 32px | 32rpx | 16px | 16.6px | 18.3px |
| 48px | 48rpx | 24px | 24.9px | 27.4px |
| 64px | 64rpx | 32px | 33.3px | 36.6px |
| 100px | 100rpx | 50px | 52px | 57px |
| 200px | 200rpx | 100px | 104px | 114px |
| 375px | 375rpx | 187.5px | 195px | 214px |
| 750px | 750rpx | 375px | 390px | 428px |

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
// WD UI 组件库字号变量
$-fs-big: 48rpx;           // 大型标题
$-fs-important: 38rpx;     // 重要数据
$-fs-title: 32rpx;         // 标题字号
$-fs-content: 28rpx;       // 正文字号
$-fs-secondary: 24rpx;     // 次要信息
$-fs-aid: 20rpx;           // 辅助文字

// 使用示例
.title {
  font-size: 32rpx;        // 标题字号
  line-height: 48rpx;      // 行高(1.5倍)
}

.content {
  font-size: 28rpx;        // 正文字号
  line-height: 40rpx;
}

.caption {
  font-size: 24rpx;        // 辅助文字
  line-height: 36rpx;
}

.small {
  font-size: 20rpx;        // 小号文字
  line-height: 28rpx;
}
```

### 间距系统

```scss
// 项目间距变量
$spacing-xs: 8rpx;      // 超小间距
$spacing-sm: 16rpx;     // 小间距
$spacing-md: 24rpx;     // 中等间距
$spacing-lg: 32rpx;     // 大间距
$spacing-xl: 48rpx;     // 超大间距

// WD UI 边距变量
$-size-side-padding: 30rpx;        // 屏幕两边留白
$-size-side-padding-small: 12rpx;  // 屏幕两边留白小值

// 使用示例
.list-item {
  padding: $spacing-md $spacing-lg;
  margin-bottom: $spacing-sm;
}

.page {
  padding: $-size-side-padding;
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

.fine-line {
  // 细线使用 px
  height: 1px;
  background: #eee;
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

.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;  // rpx 间距
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

.footer {
  height: 100rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
```

### rpx + calc() 混用

```scss
.sidebar-layout {
  display: flex;
}

.sidebar {
  width: 200rpx;
  flex-shrink: 0;
}

.main-content {
  // 减去侧边栏宽度
  width: calc(100% - 200rpx);
}

.card-with-margin {
  // 全宽减去两边边距
  width: calc(750rpx - 60rpx);
  margin: 0 30rpx;
}
```

## 常用尺寸规范

### 页面布局

```scss
// 页面边距
$page-padding: 30rpx;

// 安全区域
$safe-area-top: env(safe-area-inset-top);
$safe-area-bottom: env(safe-area-inset-bottom);

// 导航栏高度
$navbar-height: 88rpx;
$navbar-height-with-status: calc(88rpx + env(safe-area-inset-top));

// 标签栏高度
$tabbar-height: 100rpx;
$tabbar-height-with-safe: calc(100rpx + env(safe-area-inset-bottom));

// 内容区域高度
$content-height: calc(100vh - $navbar-height - $tabbar-height);
```

### 组件尺寸

```scss
// 按钮高度
$button-height-small: 48rpx;    // 小型按钮
$button-height-medium: 72rpx;   // 中型按钮
$button-height-large: 88rpx;    // 大型按钮

// 按钮内边距
$button-padding-small: 0 24rpx;
$button-padding-medium: 0 32rpx;
$button-padding-large: 0 72rpx;

// 输入框高度
$input-height: 88rpx;
$input-height-small: 64rpx;

// 单元格高度
$cell-height: 96rpx;
$cell-height-large: 112rpx;

// 头像尺寸
$avatar-size-small: 48rpx;
$avatar-size-medium: 64rpx;
$avatar-size-large: 96rpx;
$avatar-size-xlarge: 128rpx;

// 列表项高度
$list-item-height: 96rpx;
$list-item-height-compact: 80rpx;
```

### 圆角规范

```scss
$radius-xs: 4rpx;       // 超小圆角 - 标签、徽章
$radius-sm: 8rpx;       // 小圆角 - 小型按钮
$radius-md: 12rpx;      // 中等圆角 - 卡片
$radius-lg: 16rpx;      // 大圆角 - 大型按钮、弹窗
$radius-xl: 24rpx;      // 超大圆角 - 底部弹出层
$radius-xxl: 32rpx;     // 特大圆角 - 特殊场景
$radius-round: 999rpx;  // 圆角胶囊
$radius-circle: 50%;    // 正圆
```

### 图标尺寸

```scss
$icon-size-xs: 24rpx;   // 超小图标 - 标签内
$icon-size-sm: 32rpx;   // 小图标 - 列表右箭头
$icon-size-md: 40rpx;   // 中等图标 - 输入框图标
$icon-size-lg: 48rpx;   // 大图标 - 按钮图标
$icon-size-xl: 64rpx;   // 超大图标 - 空状态
$icon-size-xxl: 96rpx;  // 特大图标 - 结果页
```

### 阴影规范

```scss
// 浅阴影 - 卡片悬浮
$shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

// 中等阴影 - 弹出层
$shadow-md: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);

// 深阴影 - 模态框
$shadow-lg: 0 8rpx 32rpx rgba(0, 0, 0, 0.16);

// 按钮阴影
$button-shadow-medium: 0 4rpx 8rpx 0;
$button-shadow-large: 0 8rpx 16rpx 0;
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

### 375px 设计稿

如果设计稿是 375px，需要进行换算：

```scss
// 375px 设计稿换算公式
// rpx值 = 设计稿标注px × 2

// 设计稿(375px)标注: width: 100px
.box {
  width: 200rpx; // 100 × 2 = 200
}

// 也可以使用 SCSS 函数自动转换
@function px375($px) {
  @return $px * 2rpx;
}

.box {
  width: px375(100);  // 输出 200rpx
  height: px375(50);  // 输出 100rpx
}
```

### 640px 设计稿

```scss
// 640px 设计稿换算公式
// rpx值 = 设计稿标注px × 1.171875

@function px640($px) {
  @return $px * 1.171875rpx;
}

// 或者更精确的计算
@function px640($px) {
  @return $px * (750 / 640) * 1rpx;
}
```

### 配置设计稿宽度

在 `pages.json` 中可以配置 rpx 计算规则：

```json
{
  "globalStyle": {
    "rpxCalcMaxDeviceWidth": 960,
    "rpxCalcBaseDeviceWidth": 375,
    "rpxCalcIncludeWidth": 750
  }
}
```

**配置说明：**

| 配置项 | 说明 | 默认值 |
|-------|------|-------|
| `rpxCalcMaxDeviceWidth` | rpx 计算使用的最大设备宽度 | 960 |
| `rpxCalcBaseDeviceWidth` | rpx 计算使用的基准设备宽度 | 375 |
| `rpxCalcIncludeWidth` | 设计稿宽度 | 750 |

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

// 三列布局
.grid-three {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 0 30rpx;

  .item {
    width: calc((100% - 40rpx) / 3);
  }
}

// 四列布局
.grid-four {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0 24rpx;

  .item {
    width: calc((100% - 48rpx) / 4);
  }
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

// 自适应列数
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200rpx, 1fr));
  gap: 20rpx;
}

// 固定首列宽度
.fixed-first-grid {
  display: grid;
  grid-template-columns: 200rpx 1fr;
  gap: 24rpx;
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

// 响应式容器
.responsive-container {
  width: 100%;
  max-width: 750rpx;
  margin: 0 auto;
  padding: 0 30rpx;
  box-sizing: border-box;
}
```

## 平台差异

### H5 端

rpx 会被 postcss 转换为 rem 或 vw 单位：

```scss
// 源码
.box {
  width: 200rpx;
  font-size: 28rpx;
}

// 编译后 (rem 方案)
.box {
  width: 5.33333rem;
  font-size: 0.74667rem;
}

// 编译后 (vw 方案)
.box {
  width: 26.66667vw;
  font-size: 3.73333vw;
}
```

**H5 配置 (vite.config.ts):**

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  css: {
    postcss: {
      plugins: [
        // rpx 转换配置
        require('postcss-rpx-transform')({
          viewportWidth: 750,
        }),
      ],
    },
  },
})
```

### 小程序端

rpx 是小程序原生支持的单位，无需转换：

```scss
// 源码和编译后相同
.box {
  width: 200rpx;
  font-size: 28rpx;
}
```

**小程序 rpx 特性:**
- 微信小程序完全支持 rpx
- 支付宝小程序支持 rpx
- 百度/字节小程序支持 rpx
- QQ 小程序支持 rpx

### App 端

App 端会根据屏幕宽度动态计算 rpx 对应的像素值：

```scss
// 源码
.box {
  width: 200rpx;
}

// 运行时计算（假设屏幕宽度 375px）
// 实际渲染: width: 100px
```

**App 端注意事项:**
- nvue 页面中 rpx 表现可能略有差异
- 建议在 nvue 中使用 px 或 upx
- App 端 rpx 计算更精确

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

// 四舍五入版本
export function rpx2pxRound(rpx: number): number {
  const systemInfo = uni.getSystemInfoSync()
  return Math.round(rpx * (systemInfo.windowWidth / 750))
}
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

// 四舍五入版本
export function px2rpxRound(px: number): number {
  const systemInfo = uni.getSystemInfoSync()
  return Math.round(px * (750 / systemInfo.windowWidth))
}
```

### 动态设置样式

```typescript
/**
 * 获取 rpx 对应的实际像素字符串
 * @param rpx rpx 值
 * @returns 带 px 单位的字符串
 */
export function getRpxStyle(rpx: number): string {
  return `${rpx2px(rpx)}px`
}

// 使用示例
const style = {
  width: getRpxStyle(200),
  height: getRpxStyle(100),
}
```

### 批量转换

```typescript
/**
 * 批量转换 rpx 值
 * @param values rpx 值对象
 * @returns px 值对象
 */
export function batchRpx2px<T extends Record<string, number>>(
  values: T
): Record<keyof T, number> {
  const result = {} as Record<keyof T, number>
  for (const key in values) {
    result[key] = rpx2px(values[key])
  }
  return result
}

// 使用示例
const sizes = batchRpx2px({
  width: 200,
  height: 100,
  padding: 24,
})
```

### 缓存优化版本

```typescript
// 缓存系统信息，避免频繁调用
let cachedWindowWidth: number | null = null

function getWindowWidth(): number {
  if (cachedWindowWidth === null) {
    cachedWindowWidth = uni.getSystemInfoSync().windowWidth
  }
  return cachedWindowWidth
}

// 监听屏幕旋转，更新缓存
uni.onWindowResize(() => {
  cachedWindowWidth = uni.getSystemInfoSync().windowWidth
})

export function rpx2pxCached(rpx: number): number {
  return rpx * (getWindowWidth() / 750)
}
```

## 最佳实践

### 1. 统一使用 rpx

```scss
// ✅ 推荐：统一使用 rpx
.component {
  width: 200rpx;
  height: 100rpx;
  padding: 24rpx;
  font-size: 28rpx;
  border-radius: 12rpx;
}

// ❌ 不推荐：混用多种单位
.component {
  width: 100px;
  height: 50px;
  padding: 12px;
  font-size: 14px;
}
```

### 2. 边框使用 px

```scss
// ✅ 推荐：边框使用 px 保持清晰
.card {
  border: 1px solid #eee;
  padding: 24rpx;
}

// ❌ 不推荐：边框使用 rpx 可能模糊
.card {
  border: 2rpx solid #eee;
}

// ✅ 推荐：使用 0.5px 边框技巧
.fine-border {
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

### 3. 定义变量复用

```scss
// 定义尺寸变量
$page-padding: 30rpx;
$card-radius: 16rpx;
$font-size-base: 28rpx;
$spacing-md: 24rpx;

// 复用变量
.page {
  padding: $page-padding;
}

.card {
  margin: 0 $page-padding;
  border-radius: $card-radius;
  font-size: $font-size-base;
}

.list-item {
  padding: $spacing-md $page-padding;
}
```

### 4. 避免过小的 rpx 值

```scss
// ✅ 推荐：使用 px 表示细线
.divider {
  height: 1px;
  background: #eee;
}

// ❌ 不推荐：过小的 rpx 值显示不稳定
.divider {
  height: 1rpx;
}

// ✅ 推荐：最小使用 2rpx
.thin-line {
  height: 2rpx;
  background: #eee;
}
```

### 5. 使用 SCSS 变量系统

```scss
// 引用 WD UI 变量
@import '@/wd/components/common/abstracts/variable.scss';

.my-component {
  // 使用组件库变量
  font-size: $-fs-content;
  color: $-color-content;
  padding: $-size-side-padding;

  // 使用主题色
  background: $-color-theme;
  border-radius: $-button-medium-radius;
}
```

### 6. 响应式断点处理

```scss
// 定义断点
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;

// 响应式混合宏
@mixin respond-to($breakpoint) {
  @media screen and (min-width: $breakpoint) {
    @content;
  }
}

.container {
  width: 750rpx;
  padding: 30rpx;

  @include respond-to($breakpoint-md) {
    max-width: 750px;
    margin: 0 auto;
  }
}
```

### 7. 安全区域适配

```scss
// 底部按钮安全区域
.bottom-button {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
}

// 顶部导航安全区域
.custom-navbar {
  height: 88rpx;
  padding-top: env(safe-area-inset-top);
  box-sizing: content-box;
}
```

### 8. 动画尺寸处理

```scss
// 动画中使用 rpx 需注意性能
.animate-box {
  width: 200rpx;
  height: 200rpx;
  transition: transform 0.3s ease;

  // ✅ 推荐：使用 transform 进行动画
  &:active {
    transform: scale(0.95);
  }

  // ❌ 不推荐：直接修改 rpx 尺寸
  // &:active {
  //   width: 190rpx;
  //   height: 190rpx;
  // }
}
```

## 常见问题

### 1. 1rpx 边框显示问题

在某些设备上 1rpx 边框可能不显示或显示模糊。

**问题原因：**
- 1rpx 在某些设备上计算后小于 1 物理像素
- DPR 为 2 或 3 的设备显示效果不一致

**解决方案：**

```scss
// 方案一：使用 transform 缩放
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

// 方案二：使用固定 px
.border-box {
  border: 1px solid #eee;
}

// 方案三：使用 box-shadow
.border-shadow {
  box-shadow: 0 1px 0 0 #eee;
}
```

### 2. 字体大小限制

某些浏览器有最小字体限制（如 Chrome 最小 12px）。

**问题原因：**
- H5 端浏览器限制最小字体
- 20rpx 在某些设备上可能小于 12px

**解决方案：**

```scss
// 方案一：使用 transform 缩放
.small-text {
  font-size: 24rpx;
  transform: scale(0.8);
  transform-origin: left center;
}

// 方案二：设置最小字体
.text {
  font-size: max(20rpx, 10px);
}

// 方案三：使用 -webkit-text-size-adjust
.small-text-container {
  -webkit-text-size-adjust: none;
}
```

### 3. rpx 在 nvue 中的使用

nvue 页面中 rpx 的表现可能与 vue 页面略有差异。

**问题原因：**
- nvue 使用原生渲染引擎
- rpx 计算方式与 webview 不同

**解决方案：**

```scss
// nvue 中使用 px 单位
// 750px 设计稿下，1px = 1rpx / 2
.nvue-box {
  width: 100px; // 相当于 vue 中的 200rpx
}

// 或使用 upx (仅 nvue)
.nvue-box {
  width: 200upx;
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

// 或使用工具函数
import { rpx2px } from '@/utils/rpx'
element.style.width = rpx2px(100) + 'px'
```

### 5. CSS 变量与 rpx

```scss
// ❌ CSS 变量中不能直接使用 rpx 计算
:root {
  --button-height: 88rpx;
  --button-padding: 24rpx;
}

// ✅ 直接赋值可以
.button {
  height: var(--button-height);
  padding: var(--button-padding);
}

// ✅ calc 中使用 CSS 变量
.content {
  height: calc(100vh - var(--button-height));
}
```

### 6. 图片尺寸适配

```scss
// 固定宽高比的图片
.image-container {
  width: 200rpx;
  height: 200rpx;

  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 宽度自适应的图片
.responsive-image {
  width: 100%;
  height: auto;
}

// 使用 padding-top 技巧保持比例
.aspect-ratio-box {
  position: relative;
  width: 100%;
  padding-top: 56.25%; // 16:9 比例

  image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
```

### 7. 滚动容器高度计算

```scss
// 固定头部和底部的滚动区域
.scroll-container {
  height: calc(100vh - 88rpx - 100rpx); // 减去导航栏和标签栏
  overflow-y: auto;
}

// 带安全区域的滚动容器
.scroll-with-safe {
  height: calc(
    100vh - 88rpx - 100rpx -
    env(safe-area-inset-top) -
    env(safe-area-inset-bottom)
  );
}

// 使用 scroll-view 组件
// template
// <scroll-view :style="{ height: scrollHeight + 'px' }" scroll-y>
// script
const systemInfo = uni.getSystemInfoSync()
const scrollHeight = systemInfo.windowHeight - rpx2px(188)
```

### 8. 弹窗位置计算

```typescript
// 计算弹窗居中位置
function calculatePopupPosition(
  popupWidth: number,
  popupHeight: number
): { left: string; top: string } {
  const { windowWidth, windowHeight } = uni.getSystemInfoSync()

  const actualWidth = rpx2px(popupWidth)
  const actualHeight = rpx2px(popupHeight)

  const left = (windowWidth - actualWidth) / 2
  const top = (windowHeight - actualHeight) / 2

  return {
    left: `${left}px`,
    top: `${top}px`,
  }
}
```

### 9. Canvas 绑定 rpx

```typescript
// Canvas 需要使用实际像素
const canvasWidth = rpx2px(600)
const canvasHeight = rpx2px(400)

// 绘制时使用转换后的像素值
ctx.fillRect(0, 0, canvasWidth, canvasHeight)

// 文字大小也需要转换
ctx.font = `${rpx2px(28)}px sans-serif`
```

### 10. 横屏适配

```typescript
// 监听屏幕旋转
uni.onWindowResize((res) => {
  const { windowWidth, windowHeight } = res.size

  // 判断横竖屏
  const isLandscape = windowWidth > windowHeight

  if (isLandscape) {
    // 横屏样式调整
    // 可能需要使用不同的 rpx 计算基准
  }
})

// 横屏时限制最大宽度
.landscape-container {
  max-width: 750rpx;
  margin: 0 auto;
}
```

## 总结

### rpx 使用要点

| 场景 | 推荐单位 | 说明 |
|------|---------|------|
| 组件尺寸 | rpx | 宽度、高度、内边距、外边距 |
| 字体大小 | rpx | 统一使用变量定义的字号 |
| 圆角 | rpx | 与组件尺寸保持一致 |
| 边框 | px | 保持 1 像素清晰 |
| 图标 | rpx | 与文字字号协调 |
| 阴影 | rpx | 与组件尺寸成比例 |
| 动画 | transform | 避免直接修改 rpx 尺寸 |
| Canvas | px | 需要转换为实际像素 |

### 设计稿换算表

| 设计稿宽度 | 换算公式 | 示例 |
|-----------|---------|------|
| 750px | 直接使用 | 100px → 100rpx |
| 375px | ×2 | 50px → 100rpx |
| 640px | ×1.171875 | 85px → 100rpx |

### 平台兼容性

| 平台 | rpx 支持 | 转换方式 |
|------|---------|---------|
| H5 | 是 | postcss 转 rem/vw |
| 微信小程序 | 是 | 原生支持 |
| 支付宝小程序 | 是 | 原生支持 |
| App (vue) | 是 | 运行时计算 |
| App (nvue) | 部分 | 建议使用 px/upx |
