# 样式最佳实践

## 概述

本文档总结了 RuoYi-Plus-UniApp 移动端项目中的样式最佳实践，涵盖 CSS 变量使用、主题定制、响应式设计、组件样式规范等核心内容。遵循这些最佳实践可以确保代码的一致性、可维护性和跨平台兼容性。

**核心原则:**

- **一致性** - 统一的命名规范和样式约定
- **可维护性** - 模块化组织，易于修改和扩展
- **性能优化** - 避免不必要的样式计算和重绘
- **跨平台兼容** - 确保 H5、小程序、App 表现一致
- **主题友好** - 支持主题切换和暗黑模式

## CSS 变量体系

### WD UI 变量命名规范

WD UI 组件库采用统一的 CSS 变量命名规范，所有变量以 `--wot-` 前缀开头:

```scss
// 变量命名格式: --wot-{category}-{property}
// 或: --wot-{component}-{property}

// 全局颜色变量
--wot-color-theme      // 主题色
--wot-color-success    // 成功色
--wot-color-warning    // 警告色
--wot-color-danger     // 危险色

// 组件变量
--wot-button-primary-bg-color   // 按钮主色背景
--wot-input-border-color        // 输入框边框色
--wot-tabs-nav-height           // 标签页导航高度
```

### 主题色变量定义

系统提供完整的主题色变量体系:

```scss
// src/wd/components/common/abstracts/variable.scss

// 主题色系统
$-color-theme: var(--wot-color-theme, #4d80f0) !default;
$-color-success: var(--wot-color-success, #34d19d) !default;
$-color-warning: var(--wot-color-warning, #f0883a) !default;
$-color-danger: var(--wot-color-danger, #fa4350) !default;
$-color-info: var(--wot-color-info, #0091ff) !default;

// 派生颜色 - 通过透明度变化生成
$-color-theme-light: var(--wot-color-theme-light, rgba($color-theme, 0.1)) !default;
$-color-success-light: var(--wot-color-success-light, rgba($color-success, 0.1)) !default;
$-color-warning-light: var(--wot-color-warning-light, rgba($color-warning, 0.1)) !default;
$-color-danger-light: var(--wot-color-danger-light, rgba($color-danger, 0.1)) !default;

// 禁用状态颜色
$-color-theme-disabled: var(--wot-color-theme-disabled, #a0bef8) !default;
$-color-success-disabled: var(--wot-color-success-disabled, #8fe9c8) !default;
$-color-warning-disabled: var(--wot-color-warning-disabled, #f8c493) !default;
$-color-danger-disabled: var(--wot-color-danger-disabled, #faa6ab) !default;
```

**使用说明:**

- 主题色用于主要操作按钮、链接、选中状态等
- 派生颜色（light 后缀）用于背景、hover 状态等
- 禁用状态颜色自动处理组件禁用时的视觉反馈

### 文本颜色变量

```scss
// 文本颜色层级
$-color-title: var(--wot-color-title, #262626) !default;      // 标题文字
$-color-content: var(--wot-color-content, #595959) !default;  // 正文内容
$-color-secondary: var(--wot-color-secondary, #8c8c8c) !default; // 次要文字
$-color-aid: var(--wot-color-aid, #bfbfbf) !default;          // 辅助文字
$-color-tips: var(--wot-color-tips, #d9d9d9) !default;        // 提示文字

// 使用示例
.page-title {
  color: $-color-title;
  font-size: $-fs-title;
}

.description {
  color: $-color-content;
  font-size: $-fs-content;
}

.hint-text {
  color: $-color-aid;
  font-size: $-fs-secondary;
}
```

**最佳实践:**

1. **标题文字**: 使用 `$-color-title`，最深的文字颜色
2. **正文内容**: 使用 `$-color-content`，适中的灰度
3. **次要信息**: 使用 `$-color-secondary`，如副标题、描述
4. **辅助提示**: 使用 `$-color-aid` 或 `$-color-tips`

### 字体大小变量

```scss
// 字体大小层级
$-fs-title: var(--wot-fs-title, 32rpx) !default;          // 标题 - 最大
$-fs-big: var(--wot-fs-big, 30rpx) !default;              // 大号
$-fs-content: var(--wot-fs-content, 28rpx) !default;      // 正文 - 标准
$-fs-secondary: var(--wot-fs-secondary, 26rpx) !default;  // 次要
$-fs-aid: var(--wot-fs-aid, 24rpx) !default;              // 辅助
$-fs-small: var(--wot-fs-small, 22rpx) !default;          // 小号

// 实际应用示例
.page-header {
  .title {
    font-size: $-fs-title;
    font-weight: 600;
  }

  .subtitle {
    font-size: $-fs-content;
    margin-top: 8rpx;
  }
}

.list-item {
  .name {
    font-size: $-fs-content;
  }

  .desc {
    font-size: $-fs-secondary;
    color: $-color-secondary;
  }

  .time {
    font-size: $-fs-aid;
    color: $-color-aid;
  }
}
```

### 边框和圆角变量

```scss
// 边框颜色
$-color-border: var(--wot-color-border, #e8e8e8) !default;
$-color-border-light: var(--wot-color-border-light, #f5f5f5) !default;
$-color-border-dark: var(--wot-color-border-dark, #d9d9d9) !default;

// 边框宽度
$-border-width: 1px !default;

// 圆角大小
$-radius-small: var(--wot-radius-small, 4rpx) !default;    // 小圆角
$-radius: var(--wot-radius, 8rpx) !default;                // 标准圆角
$-radius-large: var(--wot-radius-large, 16rpx) !default;   // 大圆角
$-radius-round: var(--wot-radius-round, 999rpx) !default;  // 圆形

// 应用示例
.card {
  border: $-border-width solid $-color-border;
  border-radius: $-radius-large;

  &:hover {
    border-color: $-color-border-dark;
  }
}

.tag {
  border-radius: $-radius-small;
  padding: 4rpx 12rpx;
}

.avatar {
  border-radius: $-radius-round;
  overflow: hidden;
}
```

## 暗黑模式支持

### 暗黑模式变量体系

WD UI 提供完整的暗黑模式变量支持:

```scss
// 暗黑模式背景色
$-dark-background: var(--wot-dark-background, #131313) !default;   // 主背景
$-dark-background2: var(--wot-dark-background2, #1b1b1b) !default; // 次级背景
$-dark-background3: var(--wot-dark-background3, #262626) !default; // 卡片背景
$-dark-background4: var(--wot-dark-background4, #323232) !default; // 悬浮背景
$-dark-background5: var(--wot-dark-background5, #3c3c3c) !default; // 分割线背景

// 暗黑模式文字颜色
$-dark-color: var(--wot-dark-color, rgba(255, 255, 255, 0.95)) !default;
$-dark-color2: var(--wot-dark-color2, rgba(255, 255, 255, 0.7)) !default;
$-dark-color3: var(--wot-dark-color3, rgba(255, 255, 255, 0.5)) !default;
$-dark-color4: var(--wot-dark-color4, rgba(255, 255, 255, 0.35)) !default;
$-dark-color-gray: var(--wot-dark-color-gray, rgba(255, 255, 255, 0.1)) !default;

// 暗黑模式边框颜色
$-dark-border-color: var(--wot-dark-border-color, #3c3c3c) !default;
```

### 暗黑模式切换实现

```vue
<template>
  <view class="page" :class="{ 'dark-mode': isDark }">
    <wd-config-provider :theme-vars="themeVars">
      <view class="content">
        <!-- 页面内容 -->
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()

// 根据主题动态计算变量
const themeVars = computed(() => {
  if (isDark.value) {
    return {
      colorTheme: '#5a8ef0',
      buttonPrimaryBgColor: '#5a8ef0',
      cardBackground: '#1b1b1b',
      colorTitle: 'rgba(255, 255, 255, 0.95)',
      colorContent: 'rgba(255, 255, 255, 0.7)',
    }
  }
  return {}
})
</script>

```

### 组件暗黑模式适配

```scss
// 在组件样式中适配暗黑模式
.custom-card {
  background-color: #fff;
  border: 1px solid $-color-border;

  .title {
    color: $-color-title;
  }

  .desc {
    color: $-color-content;
  }

  // 暗黑模式适配
  .dark-mode & {
    background-color: $-dark-background3;
    border-color: $-dark-border-color;

    .title {
      color: $-dark-color;
    }

    .desc {
      color: $-dark-color2;
    }
  }
}

// 使用 CSS 变量实现自动切换
.adaptive-card {
  background-color: var(--card-bg, #fff);
  color: var(--card-text, #{$-color-content});
  border-color: var(--card-border, #{$-color-border});
}

// 在根元素定义变量
:root {
  --card-bg: #fff;
  --card-text: #595959;
  --card-border: #e8e8e8;
}

.dark-mode {
  --card-bg: #1b1b1b;
  --card-text: rgba(255, 255, 255, 0.7);
  --card-border: #3c3c3c;
}
```

## 主题定制

### 全局主题配置

在 `src/static/style/index.scss` 中配置全局主题:

```scss
// src/static/style/index.scss
:root, page {
  // 主题色定制
  --wot-color-theme: #1890ff;
  --wot-color-success: #52c41a;
  --wot-color-warning: #faad14;
  --wot-color-danger: #ff4d4f;

  // 派生颜色会自动计算，也可以手动覆盖
  --wot-color-theme-light: rgba(24, 144, 255, 0.1);
  --wot-color-theme-disabled: #91caff;

  // 按钮定制
  --wot-button-primary-bg-color: #1890ff;
  --wot-button-primary-border-color: #1890ff;
  --wot-button-medium-height: 88rpx;
  --wot-button-medium-font-size: 32rpx;

  // 输入框定制
  --wot-input-bg-color: #f5f5f5;
  --wot-input-border-color: transparent;
  --wot-input-focus-border-color: #1890ff;

  // 导航栏定制
  --wot-navbar-height: 88rpx;
  --wot-navbar-bg-color: #1890ff;
  --wot-navbar-title-color: #fff;
}
```

### 使用 ConfigProvider 组件

```vue
<template>
  <wd-config-provider :theme-vars="customTheme">
    <view class="app">
      <!-- 应用内容 -->
      <wd-button type="primary">主题按钮</wd-button>
      <wd-input placeholder="主题输入框" />
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import type { ConfigProviderThemeVars } from '@/wd'

const customTheme = reactive<ConfigProviderThemeVars>({
  // 颜色主题
  colorTheme: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorDanger: '#ff4d4f',

  // 按钮样式
  buttonPrimaryBgColor: '#1890ff',
  buttonPrimaryBorderColor: '#1890ff',
  buttonMediumHeight: '88rpx',
  buttonMediumFontSize: '32rpx',
  buttonMediumPadding: '0 40rpx',

  // 输入框样式
  inputBgColor: '#f5f5f5',
  inputBorderColor: 'transparent',
  inputFocusBorderColor: '#1890ff',
  inputHeight: '88rpx',
  inputFontSize: '28rpx',

  // 单元格样式
  cellPadding: '24rpx 32rpx',
  cellFontSize: '28rpx',
  cellTitleColor: '#262626',
  cellValueColor: '#8c8c8c',

  // 标签页样式
  tabsNavHeight: '88rpx',
  tabsFontSize: '28rpx',
  tabsActiveColor: '#1890ff',
})
</script>
```

### 动态主题切换

```vue
<template>
  <view class="theme-demo">
    <wd-config-provider :theme-vars="currentTheme">
      <view class="content">
        <wd-button type="primary">当前主题</wd-button>

        <view class="theme-selector">
          <view
            v-for="theme in themes"
            :key="theme.name"
            class="theme-item"
            :style="{ backgroundColor: theme.primary }"
            @click="switchTheme(theme)"
          >
            <text class="theme-name">{{ theme.name }}</text>
          </view>
        </view>
      </view>
    </wd-config-provider>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// 预设主题列表
const themes = [
  {
    name: '默认蓝',
    primary: '#4d80f0',
    success: '#34d19d',
    warning: '#f0883a',
    danger: '#fa4350',
  },
  {
    name: '科技蓝',
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
  },
  {
    name: '优雅紫',
    primary: '#722ed1',
    success: '#389e0d',
    warning: '#d48806',
    danger: '#cf1322',
  },
  {
    name: '活力橙',
    primary: '#fa8c16',
    success: '#52c41a',
    warning: '#eb2f96',
    danger: '#f5222d',
  },
]

const currentThemeIndex = ref(0)

const currentTheme = computed(() => {
  const theme = themes[currentThemeIndex.value]
  return {
    colorTheme: theme.primary,
    colorSuccess: theme.success,
    colorWarning: theme.warning,
    colorDanger: theme.danger,
    buttonPrimaryBgColor: theme.primary,
    buttonPrimaryBorderColor: theme.primary,
  }
})

const switchTheme = (theme: typeof themes[0]) => {
  currentThemeIndex.value = themes.indexOf(theme)

  // 可选: 持久化主题选择
  uni.setStorageSync('selected-theme', currentThemeIndex.value)
}
</script>

```

## 响应式设计

### rpx 单位使用规范

UniApp 使用 rpx 作为响应式单位，在不同设备上自动换算:

```scss
// rpx 基准: 750rpx = 屏幕宽度
// iPhone 6/7/8 (375px): 1rpx = 0.5px
// iPhone 6/7/8 Plus (414px): 1rpx ≈ 0.552px

// 常用尺寸规范
$spacing-xs: 8rpx;    // 超小间距
$spacing-sm: 16rpx;   // 小间距
$spacing-md: 24rpx;   // 中等间距
$spacing-lg: 32rpx;   // 大间距
$spacing-xl: 48rpx;   // 超大间距

// 使用示例
.card {
  padding: $spacing-lg;
  margin-bottom: $spacing-md;

  .title {
    margin-bottom: $spacing-sm;
  }

  .content {
    padding: $spacing-md 0;
  }
}
```

### 安全区域适配

```scss
// 底部安全区域适配（iPhone X 及以上机型）
.bottom-bar {
  padding-bottom: constant(safe-area-inset-bottom); // iOS 11.0-11.2
  padding-bottom: env(safe-area-inset-bottom);      // iOS 11.2+
}

// 组合使用
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

// 顶部状态栏适配
.status-bar {
  height: var(--status-bar-height, 44px);
  width: 100%;
}

// 导航栏适配
.custom-navbar {
  padding-top: var(--status-bar-height, 44px);
  height: calc(88rpx + var(--status-bar-height, 44px));
}
```

### 屏幕尺寸适配

```vue
<template>
  <view class="responsive-layout" :class="screenClass">
    <view class="main-content">
      <!-- 主要内容 -->
    </view>
    <view v-if="isLargeScreen" class="side-panel">
      <!-- 大屏幕显示侧边栏 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

const windowWidth = ref(375)
const windowHeight = ref(667)

// 屏幕尺寸分类
const screenClass = computed(() => {
  const width = windowWidth.value
  if (width >= 768) return 'screen-lg'
  if (width >= 414) return 'screen-md'
  return 'screen-sm'
})

const isLargeScreen = computed(() => windowWidth.value >= 768)

onMounted(() => {
  const info = uni.getSystemInfoSync()
  windowWidth.value = info.windowWidth
  windowHeight.value = info.windowHeight

  // 监听窗口变化（H5端）
  // #ifdef H5
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  })
  // #endif
})
</script>

```

## 组件样式规范

### 组件类名命名规范

采用 BEM (Block Element Modifier) 命名规范:

```scss
// Block: 组件块
.wd-button {
  // Element: 组件内的元素，使用 __ 连接
  &__text {
    font-size: 28rpx;
  }

  &__icon {
    margin-right: 8rpx;
  }

  &__loading {
    animation: rotate 1s linear infinite;
  }

  // Modifier: 组件的状态/变体，使用 -- 连接
  &--primary {
    background-color: $-color-theme;
    color: #fff;
  }

  &--success {
    background-color: $-color-success;
    color: #fff;
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--loading {
    pointer-events: none;
  }

  // 尺寸修饰符
  &--small {
    height: 64rpx;
    font-size: 24rpx;
  }

  &--medium {
    height: 80rpx;
    font-size: 28rpx;
  }

  &--large {
    height: 96rpx;
    font-size: 32rpx;
  }
}
```

### 组件样式隔离

```vue
<script lang="ts" setup>
defineOptions({
  name: 'WdCustomButton',
  options: {
    // 启用虚拟节点，优化性能
    virtualHost: true,
    // 允许外部样式类生效
    addGlobalClass: true,
    // 样式隔离模式
    styleIsolation: 'shared',
  },
})
</script>


<style lang="scss">
// 无 scoped 的样式可被外部覆盖
// 用于暴露可定制的样式钩子
.wd-custom-button {
  // 使用 CSS 变量允许外部定制
  --button-bg-color: #{$-color-theme};
  --button-text-color: #fff;
  --button-border-radius: #{$-radius};

  background-color: var(--button-bg-color);
  color: var(--button-text-color);
  border-radius: var(--button-border-radius);
}
</style>
```

### 外部样式类

```vue
<!-- 组件定义 -->
<template>
  <view :class="['wd-card', customClass]" :style="customStyle">
    <view :class="['wd-card__header', headerClass]">
      <slot name="header" />
    </view>
    <view class="wd-card__body">
      <slot />
    </view>
    <view :class="['wd-card__footer', footerClass]">
      <slot name="footer" />
    </view>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  customClass?: string
  customStyle?: string
  headerClass?: string
  footerClass?: string
}

withDefaults(defineProps<Props>(), {
  customClass: '',
  customStyle: '',
  headerClass: '',
  footerClass: '',
})
</script>

<!-- 使用组件 -->
<template>
  <wd-card
    custom-class="my-card"
    custom-style="margin-bottom: 24rpx;"
    header-class="my-card-header"
  >
    <template #header>
      <text>卡片标题</text>
    </template>
    <text>卡片内容</text>
  </wd-card>
</template>

```

## UnoCSS 原子化样式

### UnoCSS 配置最佳实践

```typescript
// uno.config.ts
import { defineConfig, presetUno, presetAttributify } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetRemToPx({
      baseFontSize: 4, // 1rem = 4px，适配 rpx
    }),
  ],

  // 自定义规则
  rules: [
    // rpx 单位规则
    [/^m-(\d+)$/, ([, d]) => ({ margin: `${d}rpx` })],
    [/^p-(\d+)$/, ([, d]) => ({ padding: `${d}rpx` })],
    [/^mt-(\d+)$/, ([, d]) => ({ 'margin-top': `${d}rpx` })],
    [/^mb-(\d+)$/, ([, d]) => ({ 'margin-bottom': `${d}rpx` })],
    [/^ml-(\d+)$/, ([, d]) => ({ 'margin-left': `${d}rpx` })],
    [/^mr-(\d+)$/, ([, d]) => ({ 'margin-right': `${d}rpx` })],
    [/^mx-(\d+)$/, ([, d]) => ({ 'margin-left': `${d}rpx`, 'margin-right': `${d}rpx` })],
    [/^my-(\d+)$/, ([, d]) => ({ 'margin-top': `${d}rpx`, 'margin-bottom': `${d}rpx` })],
    [/^pt-(\d+)$/, ([, d]) => ({ 'padding-top': `${d}rpx` })],
    [/^pb-(\d+)$/, ([, d]) => ({ 'padding-bottom': `${d}rpx` })],
    [/^pl-(\d+)$/, ([, d]) => ({ 'padding-left': `${d}rpx` })],
    [/^pr-(\d+)$/, ([, d]) => ({ 'padding-right': `${d}rpx` })],
    [/^px-(\d+)$/, ([, d]) => ({ 'padding-left': `${d}rpx`, 'padding-right': `${d}rpx` })],
    [/^py-(\d+)$/, ([, d]) => ({ 'padding-top': `${d}rpx`, 'padding-bottom': `${d}rpx` })],

    // 宽高规则
    [/^w-(\d+)$/, ([, d]) => ({ width: `${d}rpx` })],
    [/^h-(\d+)$/, ([, d]) => ({ height: `${d}rpx` })],
    [/^min-w-(\d+)$/, ([, d]) => ({ 'min-width': `${d}rpx` })],
    [/^min-h-(\d+)$/, ([, d]) => ({ 'min-height': `${d}rpx` })],
    [/^max-w-(\d+)$/, ([, d]) => ({ 'max-width': `${d}rpx` })],
    [/^max-h-(\d+)$/, ([, d]) => ({ 'max-height': `${d}rpx` })],

    // 字体大小规则
    [/^text-(\d+)$/, ([, d]) => ({ 'font-size': `${d}rpx` })],

    // 圆角规则
    [/^rounded-(\d+)$/, ([, d]) => ({ 'border-radius': `${d}rpx` })],

    // 行高规则
    [/^leading-(\d+)$/, ([, d]) => ({ 'line-height': `${d}rpx` })],

    // gap 规则
    [/^gap-(\d+)$/, ([, d]) => ({ gap: `${d}rpx` })],
  ],

  // 快捷方式
  shortcuts: {
    // 布局快捷方式
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-around': 'flex items-center justify-around',
    'flex-start': 'flex items-center justify-start',
    'flex-end': 'flex items-center justify-end',
    'flex-col': 'flex flex-col',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'flex-wrap': 'flex flex-wrap',

    // 文本快捷方式
    'text-ellipsis': 'overflow-hidden whitespace-nowrap text-ellipsis',
    'text-ellipsis-2': 'overflow-hidden line-clamp-2',
    'text-ellipsis-3': 'overflow-hidden line-clamp-3',

    // 定位快捷方式
    'absolute-center': 'absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'absolute-full': 'absolute left-0 top-0 right-0 bottom-0',
    'fixed-bottom': 'fixed left-0 right-0 bottom-0',
    'fixed-top': 'fixed left-0 right-0 top-0',

    // 常用组合
    'btn-base': 'inline-flex items-center justify-center rounded-8 cursor-pointer',
    'card-base': 'bg-white rounded-16 p-32 shadow-sm',
    'input-base': 'w-full h-88 px-24 rounded-8 bg-gray-50',
  },

  // 主题配置
  theme: {
    colors: {
      primary: '#4d80f0',
      success: '#34d19d',
      warning: '#f0883a',
      danger: '#fa4350',
      info: '#0091ff',
    },
  },
})
```

### UnoCSS 使用示例

```vue
<template>
  <view class="p-32">
    <!-- 使用原子类布局 -->
    <view class="flex-between mb-24">
      <text class="text-32 font-bold text-gray-800">标题</text>
      <text class="text-24 text-gray-400">查看全部</text>
    </view>

    <!-- 卡片样式 -->
    <view class="card-base mb-24">
      <view class="flex items-center gap-16">
        <image class="w-80 h-80 rounded-full" src="/avatar.png" />
        <view class="flex-1">
          <text class="text-28 font-medium text-ellipsis">用户名称</text>
          <text class="text-24 text-gray-500 mt-8">这是一段描述文字</text>
        </view>
      </view>
    </view>

    <!-- 按钮组 -->
    <view class="flex gap-24">
      <view class="btn-base flex-1 h-88 bg-primary text-white text-28">
        确认
      </view>
      <view class="btn-base flex-1 h-88 bg-gray-100 text-gray-600 text-28">
        取消
      </view>
    </view>

    <!-- 列表项 -->
    <view class="flex-between py-24 border-b border-gray-100">
      <view class="flex items-center gap-16">
        <view class="w-40 h-40 rounded-8 bg-primary/10 flex-center">
          <wd-icon name="setting" size="24" color="#4d80f0" />
        </view>
        <text class="text-28">设置选项</text>
      </view>
      <wd-icon name="arrow-right" size="24" color="#c0c4cc" />
    </view>
  </view>
</template>
```

## 布局系统

### Flex 布局最佳实践

```vue
<template>
  <!-- 水平布局 -->
  <view class="flex-row">
    <view class="flex-item">项目1</view>
    <view class="flex-item">项目2</view>
    <view class="flex-item">项目3</view>
  </view>

  <!-- 垂直布局 -->
  <view class="flex-col">
    <view class="flex-item">项目1</view>
    <view class="flex-item">项目2</view>
    <view class="flex-item">项目3</view>
  </view>

  <!-- 网格布局 -->
  <view class="grid-layout">
    <view v-for="i in 9" :key="i" class="grid-item">
      {{ i }}
    </view>
  </view>

  <!-- 等分布局 -->
  <view class="equal-layout">
    <view class="equal-item">1/3</view>
    <view class="equal-item">1/3</view>
    <view class="equal-item">1/3</view>
  </view>
</template>

```

### 滚动容器布局

```vue
<template>
  <!-- 横向滚动 -->
  <scroll-view scroll-x class="scroll-x-container">
    <view class="scroll-x-content">
      <view v-for="i in 10" :key="i" class="scroll-item">
        项目{{ i }}
      </view>
    </view>
  </scroll-view>

  <!-- 纵向滚动（需要固定高度） -->
  <scroll-view
    scroll-y
    class="scroll-y-container"
    :style="{ height: scrollHeight + 'px' }"
    @scrolltolower="loadMore"
  >
    <view v-for="item in list" :key="item.id" class="list-item">
      {{ item.name }}
    </view>
    <view v-if="loading" class="loading-more">
      <wd-loading />
      <text>加载中...</text>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const scrollHeight = ref(500)
const list = ref<{ id: number; name: string }[]>([])
const loading = ref(false)

onMounted(() => {
  // 动态计算滚动区域高度
  const info = uni.getSystemInfoSync()
  scrollHeight.value = info.windowHeight - 200 // 减去顶部固定区域
})

const loadMore = async () => {
  if (loading.value) return
  loading.value = true

  // 模拟加载数据
  await new Promise(resolve => setTimeout(resolve, 1000))

  const newItems = Array.from({ length: 10 }, (_, i) => ({
    id: list.value.length + i + 1,
    name: `项目${list.value.length + i + 1}`,
  }))

  list.value.push(...newItems)
  loading.value = false
}
</script>

```

### 固定布局

```vue
<template>
  <view class="page">
    <!-- 固定头部 -->
    <view class="fixed-header">
      <wd-navbar title="页面标题" />
    </view>

    <!-- 可滚动内容区域 -->
    <view class="scroll-content">
      <view v-for="i in 50" :key="i" class="content-item">
        内容项 {{ i }}
      </view>
    </view>

    <!-- 固定底部 -->
    <view class="fixed-footer">
      <wd-button type="primary" block>底部按钮</wd-button>
    </view>
  </view>
</template>

```

## 动画效果

### 过渡动画

```scss
// 通用过渡变量
$transition-fast: 0.15s ease;
$transition-normal: 0.3s ease;
$transition-slow: 0.5s ease;

// 常用过渡效果
.fade-transition {
  transition: opacity $transition-normal;

  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;
  }
}

.slide-up-transition {
  transition: transform $transition-normal, opacity $transition-normal;

  &.slide-up-enter,
  &.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.scale-transition {
  transition: transform $transition-fast, opacity $transition-fast;

  &.scale-enter,
  &.scale-leave-to {
    transform: scale(0.9);
    opacity: 0;
  }
}
```

### 关键帧动画

```scss
// 旋转动画（用于 Loading）
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

// 脉冲动画（用于提示效果）
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.pulse-effect {
  animation: pulse 2s ease-in-out infinite;
}

// 弹跳动画（用于按钮点击）
@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
}

.bounce-effect {
  &:active {
    animation: bounce 0.2s ease;
  }
}

// 渐入动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease forwards;
}

// 列表交错动画
.list-item {
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}

// 骨架屏闪烁动画
@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f2f2f2 25%,
    #e6e6e6 50%,
    #f2f2f2 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease infinite;
}
```

### Vue 过渡组件

```vue
<template>
  <view class="animation-demo">
    <!-- 单元素过渡 -->
    <Transition name="fade">
      <view v-if="show" class="box">淡入淡出</view>
    </Transition>

    <!-- 列表过渡 -->
    <TransitionGroup name="list" tag="view" class="list-container">
      <view v-for="item in items" :key="item.id" class="list-item">
        {{ item.name }}
      </view>
    </TransitionGroup>

    <!-- 自定义过渡 -->
    <Transition
      name="custom"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <view v-if="showCustom" class="custom-box">自定义动画</view>
    </Transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(true)
const showCustom = ref(false)
const items = ref([
  { id: 1, name: '项目1' },
  { id: 2, name: '项目2' },
  { id: 3, name: '项目3' },
])

// 自定义过渡钩子
const onBeforeEnter = (el: Element) => {
  (el as HTMLElement).style.opacity = '0'
  ;(el as HTMLElement).style.transform = 'scale(0.8)'
}

const onEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  // 触发重排
  void htmlEl.offsetHeight

  htmlEl.style.transition = 'all 0.3s ease'
  htmlEl.style.opacity = '1'
  htmlEl.style.transform = 'scale(1)'

  setTimeout(done, 300)
}

const onLeave = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.transition = 'all 0.3s ease'
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'scale(0.8)'

  setTimeout(done, 300)
}
</script>

```

## 性能优化

### 样式性能最佳实践

```scss
// ✅ 好的实践

// 1. 避免深层嵌套选择器（最多3层）
.card {
  .card__header {
    .title {
      // 最多到这里
    }
  }
}

// ❌ 避免
.page .content .card .card__header .title .text {
  // 选择器太深
}

// 2. 使用 transform 代替 top/left 做动画
// ✅
.animate-box {
  transform: translateX(100rpx);
  transition: transform 0.3s ease;
}

// ❌
.animate-box {
  left: 100rpx;
  transition: left 0.3s ease;
}

// 3. 使用 will-change 提示浏览器优化
.will-animate {
  will-change: transform, opacity;
}

// 4. 避免触发重排的属性变化
// ✅ 这些属性只触发重绘
.good {
  opacity: 0.5;
  transform: scale(1.1);
  filter: blur(2px);
}

// ❌ 这些属性触发重排
.bad {
  width: 100rpx;
  height: 100rpx;
  padding: 20rpx;
  margin: 20rpx;
}

// 5. 使用 contain 属性隔离布局
.isolated-component {
  contain: layout style paint;
}
```

### 条件样式优化

```vue
<template>
  <!-- 使用计算属性而非内联样式计算 -->
  <view :class="computedClass" :style="computedStyle">
    内容
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  type: 'primary' | 'success' | 'warning' | 'danger'
  size: 'small' | 'medium' | 'large'
  disabled: boolean
}

const props = defineProps<Props>()

// ✅ 使用计算属性缓存类名
const computedClass = computed(() => {
  return [
    'button',
    `button--${props.type}`,
    `button--${props.size}`,
    {
      'button--disabled': props.disabled,
    },
  ]
})

// ✅ 使用计算属性缓存样式
const computedStyle = computed(() => {
  const styles: Record<string, string> = {}

  if (props.disabled) {
    styles.opacity = '0.6'
    styles.cursor = 'not-allowed'
  }

  return styles
})
</script>

```

### 样式复用

```scss
// 创建可复用的 mixin
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin ellipsis($lines: 1) {
  overflow: hidden;
  @if $lines == 1 {
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
  }
}

@mixin safe-area-bottom($padding: 0) {
  padding-bottom: calc(#{$padding} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$padding} + env(safe-area-inset-bottom));
}

@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// 使用 mixin
.button {
  @include flex-center;
  height: 88rpx;
}

.text-overflow {
  @include ellipsis(2);
}

.bottom-bar {
  @include safe-area-bottom(24rpx);
}
```

## 跨平台兼容

### 平台差异处理

```scss
// 使用条件编译处理平台差异
/* #ifdef H5 */
.h5-only {
  // 仅 H5 生效的样式
  cursor: pointer;
  user-select: none;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.weixin-only {
  // 仅微信小程序生效的样式
}
/* #endif */

/* #ifdef APP-PLUS */
.app-only {
  // 仅 App 生效的样式
}
/* #endif */

/* #ifndef H5 */
.not-h5 {
  // 除 H5 外的平台生效
}
/* #endif */
```

### 常见兼容问题解决

```scss
// 1. 滚动条样式（仅 H5 支持）
/* #ifdef H5 */
.scroll-container {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c0c4cc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
}
/* #endif */

// 2. 点击高亮（移除小程序默认效果）
/* #ifdef MP */
.clickable {
  -webkit-tap-highlight-color: transparent;
}
/* #endif */

// 3. 输入框样式重置（小程序）
/* #ifdef MP */
.input-reset {
  // 移除小程序输入框默认样式
  background-color: transparent;

  &::placeholder {
    color: #c0c4cc;
  }
}
/* #endif */

// 4. 固定定位兼容（小程序某些场景不支持 fixed）
.fixed-element {
  position: fixed;

  /* #ifdef MP-ALIPAY */
  // 支付宝小程序某些场景使用 absolute
  position: absolute;
  /* #endif */
}

// 5. 安全区域兼容
.safe-area-bottom {
  // iOS 11.0-11.2
  padding-bottom: constant(safe-area-inset-bottom);
  // iOS 11.2+
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 字体适配

```scss
// 跨平台字体栈
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
              'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
              'Noto Color Emoji';

// 数字等宽字体
$font-family-mono: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono',
                   Menlo, Courier, monospace;

body, page {
  font-family: $font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.number {
  font-family: $font-family-mono;
  font-variant-numeric: tabular-nums;
}
```

## 代码组织规范

### SCSS 文件结构

```scss
// 推荐的 SCSS 文件结构

// 1. 变量和导入
@import '../common/abstracts/variable.scss';
@import '../common/abstracts/mixin.scss';

// 2. 组件容器样式
.wd-button {
  // 2.1 布局属性
  display: inline-flex;
  align-items: center;
  justify-content: center;

  // 2.2 盒模型属性
  padding: 0 32rpx;
  margin: 0;

  // 2.3 尺寸属性
  height: 80rpx;
  min-width: 64rpx;

  // 2.4 边框和背景
  border: none;
  border-radius: $-radius;
  background-color: #fff;

  // 2.5 文字属性
  font-size: 28rpx;
  font-weight: 400;
  color: $-color-content;

  // 2.6 其他视觉属性
  opacity: 1;
  cursor: pointer;

  // 2.7 过渡动画
  transition: all 0.3s ease;

  // 3. 元素样式（Element）
  &__text {
    // ...
  }

  &__icon {
    // ...
  }

  // 4. 修饰符样式（Modifier）
  &--primary {
    // ...
  }

  &--disabled {
    // ...
  }

  // 5. 状态样式
  &:hover {
    // ...
  }

  &:active {
    // ...
  }
}
```

### 样式变量文件组织

```scss
// src/styles/variables/index.scss - 变量入口文件

// 颜色变量
@import './colors';

// 字体变量
@import './typography';

// 间距变量
@import './spacing';

// 边框变量
@import './borders';

// 阴影变量
@import './shadows';

// 动画变量
@import './animations';

// 断点变量
@import './breakpoints';

// src/styles/variables/colors.scss
$color-primary: #4d80f0;
$color-success: #34d19d;
$color-warning: #f0883a;
$color-danger: #fa4350;

$color-text-primary: #262626;
$color-text-regular: #595959;
$color-text-secondary: #8c8c8c;
$color-text-placeholder: #c0c4cc;

$color-bg-base: #ffffff;
$color-bg-page: #f5f5f5;
$color-bg-light: #fafafa;

$color-border-base: #e8e8e8;
$color-border-light: #f0f0f0;

// src/styles/variables/spacing.scss
$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-md: 24rpx;
$spacing-lg: 32rpx;
$spacing-xl: 48rpx;
$spacing-xxl: 64rpx;

// src/styles/variables/typography.scss
$font-size-xs: 20rpx;
$font-size-sm: 24rpx;
$font-size-md: 28rpx;
$font-size-lg: 32rpx;
$font-size-xl: 36rpx;
$font-size-xxl: 40rpx;

$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-loose: 1.75;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

## 调试技巧

### 样式调试工具

```vue
<template>
  <!-- 开发时添加调试边框 -->
  <view :class="{ 'debug-mode': isDebug }">
    <view class="layout-container">
      <!-- 内容 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
// 开发环境启用调试模式
const isDebug = import.meta.env.DEV && false // 手动控制开关
</script>

```

### 样式问题排查清单

```markdown
## 样式问题排查清单

### 1. 样式不生效
- [ ] 检查选择器是否正确
- [ ] 检查是否有更高优先级的样式覆盖
- [ ] 检查 scoped 是否影响子组件样式
- [ ] 检查是否需要使用 :deep() 穿透
- [ ] 检查类名是否拼写正确

### 2. 布局问题
- [ ] 检查父元素是否有固定高度/宽度
- [ ] 检查 flex 属性是否正确
- [ ] 检查是否有 overflow 隐藏内容
- [ ] 检查盒模型（border-box vs content-box）

### 3. 跨平台问题
- [ ] 检查是否使用了平台特定的属性
- [ ] 检查条件编译是否正确
- [ ] 在各平台分别测试

### 4. 性能问题
- [ ] 检查是否有过深的选择器嵌套
- [ ] 检查是否有不必要的重排属性
- [ ] 检查动画是否使用 transform
- [ ] 检查是否有大量内联样式
```

## 常见问题

### 1. 组件样式穿透

**问题**: 使用 scoped 后无法修改子组件样式

**解决方案**:

```vue

<style lang="scss">
// 方法3: 单独的无 scoped 样式块
.container .wd-button {
  background-color: #1890ff;
}
</style>
```

### 2. rpx 单位在特定场景不生效

**问题**: 动态设置的样式中 rpx 不自动转换

**解决方案**:

```vue
<script lang="ts" setup>
import { computed } from 'vue'

// 获取 rpx 转 px 的比例
const rpxToPx = (rpx: number) => {
  const info = uni.getSystemInfoSync()
  return (rpx / 750) * info.windowWidth
}

// 动态样式使用 px
const dynamicStyle = computed(() => ({
  width: `${rpxToPx(200)}px`,
  height: `${rpxToPx(200)}px`,
}))
</script>
```

### 3. 安全区域适配失效

**问题**: constant/env 函数在某些设备不生效

**解决方案**:

```scss
// 使用 CSS 变量作为 fallback
:root {
  --safe-area-bottom: 0px;
  --safe-area-bottom: constant(safe-area-inset-bottom);
  --safe-area-bottom: env(safe-area-inset-bottom);
}

.bottom-bar {
  padding-bottom: calc(24rpx + var(--safe-area-bottom));
}
```

### 4. 小程序样式隔离问题

**问题**: 组件样式影响其他组件或被全局样式覆盖

**解决方案**:

```vue
<script lang="ts" setup>
defineOptions({
  options: {
    // 启用样式隔离
    styleIsolation: 'isolated',
    // 或使用共享模式（允许外部样式类）
    // styleIsolation: 'shared',
    // 允许使用全局样式类
    addGlobalClass: true,
  },
})
</script>
```

### 5. 暗黑模式切换闪烁

**问题**: 切换主题时页面闪烁

**解决方案**:

```vue
<template>
  <view class="app" :class="themeClass">
    <!-- 内容 -->
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const isDark = ref(false)
const themeClass = ref('')

// 使用 nextTick 避免闪烁
watch(isDark, async (newValue) => {
  // 先设置过渡
  document.documentElement.style.transition = 'background-color 0.3s, color 0.3s'

  // 切换类名
  themeClass.value = newValue ? 'dark-mode' : ''

  // 过渡完成后移除过渡属性
  setTimeout(() => {
    document.documentElement.style.transition = ''
  }, 300)
})
</script>

<style lang="scss">
// 全局过渡样式
.app {
  transition: background-color 0.3s ease, color 0.3s ease;
}

// 所有子元素也添加过渡
.app * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
```

## 附录: 完整样式变量参考

### WD UI 完整变量列表

```scss
// 主题色系统
$-color-theme: var(--wot-color-theme, #4d80f0);
$-color-success: var(--wot-color-success, #34d19d);
$-color-warning: var(--wot-color-warning, #f0883a);
$-color-danger: var(--wot-color-danger, #fa4350);
$-color-info: var(--wot-color-info, #0091ff);

// 文本颜色
$-color-title: var(--wot-color-title, #262626);
$-color-content: var(--wot-color-content, #595959);
$-color-secondary: var(--wot-color-secondary, #8c8c8c);
$-color-aid: var(--wot-color-aid, #bfbfbf);
$-color-tips: var(--wot-color-tips, #d9d9d9);

// 边框颜色
$-color-border: var(--wot-color-border, #e8e8e8);
$-color-border-light: var(--wot-color-border-light, #f5f5f5);
$-color-border-dark: var(--wot-color-border-dark, #d9d9d9);

// 背景颜色
$-color-bg: var(--wot-color-bg, #f5f5f5);
$-color-bg-light: var(--wot-color-bg-light, #fafafa);
$-color-white: var(--wot-color-white, #ffffff);

// 字体大小
$-fs-title: var(--wot-fs-title, 32rpx);
$-fs-big: var(--wot-fs-big, 30rpx);
$-fs-content: var(--wot-fs-content, 28rpx);
$-fs-secondary: var(--wot-fs-secondary, 26rpx);
$-fs-aid: var(--wot-fs-aid, 24rpx);
$-fs-small: var(--wot-fs-small, 22rpx);

// 圆角
$-radius-small: var(--wot-radius-small, 4rpx);
$-radius: var(--wot-radius, 8rpx);
$-radius-large: var(--wot-radius-large, 16rpx);
$-radius-round: var(--wot-radius-round, 999rpx);

// 暗黑模式
$-dark-background: var(--wot-dark-background, #131313);
$-dark-background2: var(--wot-dark-background2, #1b1b1b);
$-dark-background3: var(--wot-dark-background3, #262626);
$-dark-background4: var(--wot-dark-background4, #323232);
$-dark-background5: var(--wot-dark-background5, #3c3c3c);
$-dark-color: var(--wot-dark-color, rgba(255, 255, 255, 0.95));
$-dark-color2: var(--wot-dark-color2, rgba(255, 255, 255, 0.7));
$-dark-color3: var(--wot-dark-color3, rgba(255, 255, 255, 0.5));
$-dark-color4: var(--wot-dark-color4, rgba(255, 255, 255, 0.35));
$-dark-border-color: var(--wot-dark-border-color, #3c3c3c);
```

本文档总结了移动端项目中样式开发的核心最佳实践。遵循这些规范和模式，可以确保样式代码的质量、可维护性和跨平台兼容性。建议开发者在实际项目中灵活运用这些实践，并根据具体需求进行适当调整。
