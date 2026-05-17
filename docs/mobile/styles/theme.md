# 主题定制

## 概述

RuoYi-Plus-UniApp 移动端提供了完整的主题定制系统,支持全局主题配置、深色模式、CSS 变量定制等功能。主题系统基于 WD UI 组件库的 ConfigProvider 组件实现,提供了超过 2000 个主题变量,覆盖所有组件的样式定制需求。

### 核心特性

- **响应式主题管理** - 通过 Vue 3 Composition API 实现响应式主题配置
- **三层优先级机制** - 支持默认主题、全局覆盖、局部覆盖三层优先级
- **CSS 变量系统** - 完整的 `--wot-*` CSS 变量体系,支持运行时动态切换
- **深色模式支持** - 内置深色主题变量,支持自动和手动切换
- **SCSS 变量回退** - 所有 SCSS 变量支持 CSS 变量回退机制
- **持久化存储** - 使用 UniApp 存储 API 实现主题配置持久化
- **UnoCSS 集成** - 原子化 CSS 框架集成,支持主题色引用
- **TypeScript 支持** - 完整的类型定义,提供开发时类型检查

## 架构设计

### 主题系统架构

```text
┌─────────────────────────────────────────────────────────────┐
│                      应用层 (App.vue)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ConfigProvider 组件                      │   │
│  │  ┌─────────────┬─────────────┬─────────────────┐    │   │
│  │  │ theme       │ themeVars   │ CSS Variables   │    │   │
│  │  │ 'light'     │ 主题变量对象 │ --wot-*        │    │   │
│  │  │ 'dark'      │             │                 │    │   │
│  │  └─────────────┴─────────────┴─────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              useTheme Composable                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │ 默认主题 < 全局覆盖 < 局部覆盖               │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SCSS/CSS 变量系统                        │   │
│  │  variable.scss → CSS Variables → 组件样式           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心文件结构

```text
plus-uniapp/src/
├── composables/
│   └── useTheme.ts              # 主题管理 Composable
├── wd/
│   ├── components/
│   │   ├── wd-config-provider/  # 全局配置组件
│   │   │   └── wd-config-provider.vue
│   │   └── common/
│   │       └── abstracts/
│   │           └── variable.scss # SCSS 变量定义
│   └── index.ts                 # 类型导出
├── utils/
│   └── cache.ts                 # 缓存工具(主题存储)
├── App.vue                      # 全局样式入口
└── uno.config.ts                # UnoCSS 主题配置
```

## ConfigProvider 全局配置

### 基础用法

ConfigProvider 是 WD UI 组件库的全局配置提供者,用于配置主题、深色模式等全局属性。

```vue
<template>
  <wd-config-provider :theme="theme" :theme-vars="themeVars">
    <!-- 应用内容 -->
    <router-view />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ConfigProviderThemeVars } from '@/wd'

const theme = ref<'light' | 'dark'>('light')

const themeVars = ref<ConfigProviderThemeVars>({
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C',
})
</script>
```

### Props 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `theme` | 主题风格,设置为 dark 开启深色模式 | `'light' \| 'dark'` | `'light'` |
| `themeVars` | 自定义主题变量对象 | `ConfigProviderThemeVars` | `{}` |
| `customStyle` | 自定义根节点样式 | `string` | `''` |
| `customClass` | 自定义根节点样式类 | `string` | `''` |

### 深色模式

通过设置 `theme` 属性为 `'dark'` 开启深色模式:

```vue
<template>
  <wd-config-provider :theme="isDark ? 'dark' : 'light'">
    <view class="app">
      <wd-button @click="toggleTheme">切换主题</wd-button>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>
```

### 主题变量定制

通过 `themeVars` 属性自定义组件样式:

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-button type="primary">主题按钮</wd-button>
    <wd-cell title="单元格" value="内容" />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ConfigProviderThemeVars } from '@/wd'

const themeVars = ref<ConfigProviderThemeVars>({
  // 基础色彩
  colorTheme: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorDanger: '#ff4d4f',

  // 按钮样式
  buttonPrimaryBgColor: '#1890ff',
  buttonPrimaryColor: '#ffffff',
  buttonMediumHeight: '80rpx',
  buttonMediumFontSize: '28rpx',

  // 单元格样式
  cellPadding: '24rpx 32rpx',
  cellTitleFontSize: '28rpx',
  cellValueFontSize: '26rpx',

  // 导航栏
  navbarTitleFontSize: '32rpx',
  navbarTitleFontWeight: '500',
})
</script>
```

## useTheme Composable

### 概述

`useTheme` 是一个用于管理主题配置的 Composable,提供了全局主题状态管理和便捷的主题操作方法。

### 基础用法

```typescript
import { useTheme } from '@/composables/useTheme'

const { themeVars, setGlobalTheme, resetGlobalTheme, getCurrentTheme } = useTheme()

// 获取当前主题配置
const currentTheme = getCurrentTheme()

// 设置全局主题覆盖
setGlobalTheme({
  colorTheme: '#ff6b6b',
  buttonPrimaryBgColor: '#ff6b6b',
})

// 重置全局主题覆盖
resetGlobalTheme()
```

### API 说明

```typescript
interface UseThemeReturn {
  /**
   * 计算属性,返回合并后的完整主题配置
   * 优先级: 默认主题 < 全局覆盖 < 局部覆盖
   */
  themeVars: ComputedRef<ConfigProviderThemeVars>

  /**
   * 设置全局主题覆盖
   * @param overrides - 要覆盖的主题变量
   */
  setGlobalTheme: (overrides: Partial<ConfigProviderThemeVars>) => void

  /**
   * 重置全局主题覆盖
   */
  resetGlobalTheme: () => void

  /**
   * 获取当前生效的主题配置
   */
  getCurrentTheme: () => ConfigProviderThemeVars
}
```

### 优先级机制

主题系统采用三层优先级机制:

```typescript
// 优先级: 默认主题 < 全局覆盖 < 局部覆盖

// 1. 默认主题 (最低优先级)
const DEFAULT_THEME: ConfigProviderThemeVars = {
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  // ...
}

// 2. 全局覆盖 (中等优先级)
setGlobalTheme({
  colorTheme: '#1890ff',  // 会覆盖默认值
})

// 3. 局部覆盖 (最高优先级)
const localTheme = {
  colorTheme: '#ff6b6b',  // 会覆盖全局和默认值
}
```

### 完整示例

```vue
<template>
  <view class="theme-demo">
    <view class="section">
      <text class="title">当前主题色: {{ currentColor }}</text>
      <view class="color-picker">
        <view
          v-for="color in colors"
          :key="color"
          class="color-item"
          :style="{ backgroundColor: color }"
          @click="changeTheme(color)"
        />
      </view>
    </view>

    <view class="section">
      <wd-button type="primary" block>主题按钮</wd-button>
    </view>

    <view class="section">
      <wd-button @click="resetTheme">重置主题</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { themeVars, setGlobalTheme, resetGlobalTheme, getCurrentTheme } = useTheme()

const colors = ['#409EFF', '#1890ff', '#ff6b6b', '#52c41a', '#722ed1']

const currentColor = computed(() => getCurrentTheme().colorTheme)

const changeTheme = (color: string) => {
  setGlobalTheme({
    colorTheme: color,
    buttonPrimaryBgColor: color,
  })
}

const resetTheme = () => {
  resetGlobalTheme()
}
</script>

```

## CSS 变量系统

### 变量命名规范

WD UI 组件库的所有 CSS 变量都以 `--wot-` 前缀开头,变量名采用短横线分隔(kebab-case)命名:

```text
JavaScript 属性名         →    CSS 变量名
colorTheme               →    --wot-color-theme
buttonPrimaryBgColor     →    --wot-button-primary-bg-color
navbarTitleFontSize      →    --wot-navbar-title-font-size
```

### 基础色彩变量

```scss
/* 主题颜色 */
--wot-color-theme: #409EFF;         /* 主题色 */
--wot-color-white: rgb(255, 255, 255);
--wot-color-black: rgb(0, 0, 0);

/* 功能色 */
--wot-color-success: #34d19d;       /* 成功色 */
--wot-color-warning: #f0883a;       /* 警告色 */
--wot-color-danger: #fa4350;        /* 危险色 */
--wot-color-purple: #8268de;        /* 紫色 */
--wot-color-yellow: #f0cd1d;        /* 黄色 */
--wot-color-blue: #2bb3ed;          /* 蓝色 */

/* 灰色系统 - 8个等级 */
--wot-color-gray-1: #f9f9f9;        /* 最浅灰 */
--wot-color-gray-2: #f2f3f5;
--wot-color-gray-3: #e5e6eb;
--wot-color-gray-4: #c9cdd4;
--wot-color-gray-5: #a9aeb8;
--wot-color-gray-6: #86909c;
--wot-color-gray-7: #6b7785;
--wot-color-gray-8: #4e5969;        /* 最深灰 */
```

### 文字颜色变量

```scss
/* 字体灰色（透明度级别） */
--wot-font-gray-1: rgba(0, 0, 0, 0.9);   /* 主要文字 */
--wot-font-gray-2: rgba(0, 0, 0, 0.6);   /* 次要文字 */
--wot-font-gray-3: rgba(0, 0, 0, 0.4);   /* 辅助文字 */
--wot-font-gray-4: rgba(0, 0, 0, 0.26);  /* 禁用文字 */

/* 白色字体 */
--wot-font-white-1: rgba(255, 255, 255, 1);     /* 主要白字 */
--wot-font-white-2: rgba(255, 255, 255, 0.55);  /* 次要白字 */

/* 语义化文字颜色 */
--wot-color-title: #000000;         /* 标题颜色 */
--wot-color-content: #262626;       /* 内容颜色 */
--wot-color-secondary: #595959;     /* 次要内容 */
--wot-color-aid: #8c8c8c;           /* 辅助内容 */
--wot-color-tip: #bfbfbf;           /* 提示内容 */
```

### 边框和背景变量

```scss
/* 边框颜色 */
--wot-color-border: #d9d9d9;        /* 默认边框 */
--wot-color-border-light: #e8e8e8;  /* 浅色边框 */

/* 背景颜色 */
--wot-color-bg: #f5f5f5;            /* 页面背景 */
```

### 字体尺寸变量

```scss
/* 字体大小 */
--wot-fs-big: 48rpx;                /* 大型标题 */
--wot-fs-important: 38rpx;          /* 重要标题 */
--wot-fs-title: 32rpx;              /* 常规标题 */
--wot-fs-content: 28rpx;            /* 正文内容 */
--wot-fs-secondary: 24rpx;          /* 次要内容 */
--wot-fs-aid: 20rpx;                /* 辅助文字 */

/* 字重 */
--wot-fw-medium: 500;               /* 中等粗细 */
--wot-fw-semibold: 600;             /* 半粗体 */
```

### 间距变量

```scss
/* 基础间距 */
--wot-size-side-padding: 30rpx;     /* 页面边距 */
```

### 深色模式变量

```scss
/* 深色背景 */
--wot-dark-background: #131313;     /* 主背景 */
--wot-dark-background2: #1b1b1b;    /* 次级背景 */
--wot-dark-background3: #232323;    /* 卡片背景 */
--wot-dark-background4: #2b2b2b;    /* 悬浮背景 */
--wot-dark-background5: #333333;    /* 输入框背景 */
--wot-dark-background6: #3b3b3b;    /* 禁用背景 */
--wot-dark-background7: #434343;    /* 分割线 */

/* 深色文字 */
--wot-dark-color: rgba(255, 255, 255, 0.9);      /* 主要文字 */
--wot-dark-color2: rgba(255, 255, 255, 0.7);     /* 次要文字 */
--wot-dark-color3: rgba(255, 255, 255, 0.5);     /* 辅助文字 */
--wot-dark-color4: rgba(255, 255, 255, 0.35);    /* 禁用文字 */
```

## 组件主题变量

### Button 按钮

```scss
/* 按钮主题变量 */
--wot-button-primary-bg-color: var(--wot-color-theme);
--wot-button-primary-color: #ffffff;
--wot-button-success-bg-color: var(--wot-color-success);
--wot-button-warning-bg-color: var(--wot-color-warning);
--wot-button-danger-bg-color: var(--wot-color-danger);

/* 按钮尺寸 */
--wot-button-small-height: 56rpx;
--wot-button-small-padding: 0 20rpx;
--wot-button-small-font-size: 24rpx;

--wot-button-medium-height: 72rpx;
--wot-button-medium-padding: 0 30rpx;
--wot-button-medium-font-size: 28rpx;

--wot-button-large-height: 96rpx;
--wot-button-large-padding: 0 40rpx;
--wot-button-large-font-size: 32rpx;

/* 按钮圆角 */
--wot-button-border-radius: 8rpx;
--wot-button-round-border-radius: 999rpx;
```

### Cell 单元格

```scss
/* 单元格主题变量 */
--wot-cell-padding: 26rpx 30rpx;
--wot-cell-wrapper-padding: 0 30rpx;
--wot-cell-bg-color: #ffffff;
--wot-cell-title-font-size: 28rpx;
--wot-cell-title-color: var(--wot-color-title);
--wot-cell-value-font-size: 28rpx;
--wot-cell-value-color: var(--wot-color-content);
--wot-cell-label-font-size: 24rpx;
--wot-cell-label-color: var(--wot-color-tip);
--wot-cell-required-color: var(--wot-color-danger);
--wot-cell-border-color: var(--wot-color-border-light);
```

### Input 输入框

```scss
/* 输入框主题变量 */
--wot-input-padding: 18rpx;
--wot-input-font-size: 28rpx;
--wot-input-color: var(--wot-color-title);
--wot-input-placeholder-color: var(--wot-color-tip);
--wot-input-disabled-color: var(--wot-color-tip);
--wot-input-bg-color: #ffffff;
--wot-input-border-color: var(--wot-color-border);
--wot-input-focus-border-color: var(--wot-color-theme);
--wot-input-error-border-color: var(--wot-color-danger);
--wot-input-clear-color: var(--wot-color-tip);
```

### Navbar 导航栏

```scss
/* 导航栏主题变量 */
--wot-navbar-height: 88rpx;
--wot-navbar-bg-color: #ffffff;
--wot-navbar-title-font-size: 32rpx;
--wot-navbar-title-font-weight: normal;
--wot-navbar-title-color: var(--wot-color-title);
--wot-navbar-icon-color: var(--wot-color-title);
--wot-navbar-icon-size: 40rpx;
--wot-navbar-capsule-bg-color: rgba(0, 0, 0, 0.04);
--wot-navbar-capsule-border-color: rgba(0, 0, 0, 0.08);
```

### Toast 轻提示

```scss
/* Toast 主题变量 */
--wot-toast-padding: 24rpx 30rpx;
--wot-toast-font-size: 28rpx;
--wot-toast-color: #ffffff;
--wot-toast-bg-color: rgba(0, 0, 0, 0.8);
--wot-toast-border-radius: 16rpx;
--wot-toast-icon-size: 72rpx;
--wot-toast-loading-size: 60rpx;
```

### Modal 模态框

```scss
/* 模态框主题变量 */
--wot-modal-width: 560rpx;
--wot-modal-padding: 48rpx 40rpx 32rpx;
--wot-modal-bg-color: #ffffff;
--wot-modal-border-radius: 24rpx;
--wot-modal-title-font-size: 34rpx;
--wot-modal-title-color: var(--wot-color-title);
--wot-modal-content-font-size: 28rpx;
--wot-modal-content-color: var(--wot-color-content);
--wot-modal-btn-font-size: 32rpx;
--wot-modal-confirm-btn-color: var(--wot-color-theme);
--wot-modal-cancel-btn-color: var(--wot-color-content);
```

## SCSS 变量系统

### 变量回退机制

WD UI 的 SCSS 变量系统支持 CSS 变量回退,确保在不支持 CSS 变量的环境下仍能正常显示:

```scss
// variable.scss 中的定义
$default-theme: #0957DE;  // 默认主题色

// SCSS 变量定义,支持 CSS 变量回退
$-color-theme: var(--wot-color-theme, $default-theme) !default;
$-color-success: var(--wot-color-success, #34d19d) !default;
$-color-warning: var(--wot-color-warning, #f0883a) !default;
$-color-danger: var(--wot-color-danger, #fa4350) !default;
```

### 在组件中使用

```scss
// 组件样式文件
@import '../common/abstracts/variable';

.my-component {
  // 使用 SCSS 变量
  color: $-color-theme;
  background-color: $-color-bg;
  font-size: $-fs-content;
  padding: $-size-side-padding;

  &__title {
    color: $-color-title;
    font-size: $-fs-title;
    font-weight: $-fw-medium;
  }

  &__content {
    color: $-color-content;
    font-size: $-fs-content;
  }

  &__tip {
    color: $-color-tip;
    font-size: $-fs-aid;
  }
}
```

### 变量覆盖

在组件或页面中覆盖 SCSS 变量:

```scss
// 方式1: 直接覆盖 CSS 变量
:root {
  --wot-color-theme: #1890ff;
  --wot-button-primary-bg-color: #1890ff;
}

// 方式2: 在组件内覆盖
.my-page {
  --wot-color-theme: #ff6b6b;

  // 组件会使用覆盖后的变量值
  .wd-button--primary {
    // 按钮背景色会变成 #ff6b6b
  }
}
```

## UnoCSS 主题集成

### 配置说明

项目使用 UnoCSS 作为原子化 CSS 框架,在 `uno.config.ts` 中配置了与主题系统的集成:

```typescript
// uno.config.ts
import { defineConfig } from 'unocss'
import presetUni from '@dcloudio/uni-preset-uno'
import { presetIcons, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUni({
      attributify: {
        prefixedOnly: true,
      },
    }),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetAttributify(),
  ],

  // 主题配置
  theme: {
    colors: {
      // 引用 CSS 变量,实现主题联动
      primary: 'var(--wot-color-theme, #0957DE)',
      success: 'var(--wot-color-success, #34d19d)',
      warning: 'var(--wot-color-warning, #f0883a)',
      danger: 'var(--wot-color-danger, #fa4350)',
    },
    fontSize: {
      '2xs': ['20rpx', '28rpx'],
      '3xs': ['18rpx', '26rpx'],
    },
  },
})
```

### 使用主题色

```vue
<template>
  <view class="demo">
    <!-- 使用主题色 -->
    <text class="text-primary">主题色文字</text>
    <text class="text-success">成功色文字</text>
    <text class="text-warning">警告色文字</text>
    <text class="text-danger">危险色文字</text>

    <!-- 背景色 -->
    <view class="bg-primary p-4 text-white">主题色背景</view>

    <!-- 边框色 -->
    <view class="border border-primary p-4">主题色边框</view>
  </view>
</template>

```

## 主题持久化

### 使用缓存工具

通过 `cache.ts` 工具实现主题配置的持久化存储:

```typescript
import { cache } from '@/utils/cache'
import type { ConfigProviderThemeVars } from '@/wd'

// 存储主题模式
cache.set('themeMode', 'dark')

// 存储主题配置对象
cache.set('themeConfig', {
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
})

// 读取主题模式
const themeMode = cache.get<string>('themeMode')

// 读取主题配置
const themeConfig = cache.get<ConfigProviderThemeVars>('themeConfig')

// 设置过期时间(7天)
cache.set('themeMode', 'dark', 7 * 24 * 3600)
```

### 完整的主题持久化方案

```typescript
// composables/useThemePersist.ts
import { ref, watch, onMounted } from 'vue'
import { cache } from '@/utils/cache'
import type { ConfigProviderThemeVars } from '@/wd'

const THEME_MODE_KEY = 'app_theme_mode'
const THEME_CONFIG_KEY = 'app_theme_config'

export function useThemePersist() {
  const themeMode = ref<'light' | 'dark'>('light')
  const themeConfig = ref<ConfigProviderThemeVars>({})

  // 初始化时从缓存读取
  onMounted(() => {
    const savedMode = cache.get<'light' | 'dark'>(THEME_MODE_KEY)
    const savedConfig = cache.get<ConfigProviderThemeVars>(THEME_CONFIG_KEY)

    if (savedMode) {
      themeMode.value = savedMode
    }

    if (savedConfig) {
      themeConfig.value = savedConfig
    }
  })

  // 监听变化并自动保存
  watch(themeMode, (newMode) => {
    cache.set(THEME_MODE_KEY, newMode)
  })

  watch(themeConfig, (newConfig) => {
    cache.set(THEME_CONFIG_KEY, newConfig)
  }, { deep: true })

  // 切换主题模式
  const toggleThemeMode = () => {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
  }

  // 设置主题配置
  const setThemeConfig = (config: Partial<ConfigProviderThemeVars>) => {
    themeConfig.value = { ...themeConfig.value, ...config }
  }

  // 重置主题
  const resetTheme = () => {
    themeMode.value = 'light'
    themeConfig.value = {}
    cache.remove(THEME_MODE_KEY)
    cache.remove(THEME_CONFIG_KEY)
  }

  return {
    themeMode,
    themeConfig,
    toggleThemeMode,
    setThemeConfig,
    resetTheme,
  }
}
```

### 在 App.vue 中使用

```vue
<template>
  <wd-config-provider :theme="themeMode" :theme-vars="themeConfig">
    <slot />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useThemePersist } from '@/composables/useThemePersist'

const { themeMode, themeConfig } = useThemePersist()
</script>
```

## 跟随系统主题

### 监听系统主题变化

```typescript
// composables/useSystemTheme.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useSystemTheme() {
  const systemTheme = ref<'light' | 'dark'>('light')

  // 获取系统主题
  const getSystemTheme = (): 'light' | 'dark' => {
    const res = uni.getSystemInfoSync()
    return res.theme || 'light'
  }

  // 监听系统主题变化
  const handleThemeChange = (res: { theme: 'light' | 'dark' }) => {
    systemTheme.value = res.theme
  }

  onMounted(() => {
    // 初始化系统主题
    systemTheme.value = getSystemTheme()

    // 监听系统主题变化
    // #ifdef MP-WEIXIN
    uni.onThemeChange(handleThemeChange)
    // #endif
  })

  onUnmounted(() => {
    // #ifdef MP-WEIXIN
    uni.offThemeChange(handleThemeChange)
    // #endif
  })

  return {
    systemTheme,
    getSystemTheme,
  }
}
```

### 自动跟随系统主题

```vue
<template>
  <wd-config-provider :theme="currentTheme">
    <view class="app">
      <wd-cell title="跟随系统" center>
        <template #value>
          <wd-switch v-model="followSystem" />
        </template>
      </wd-cell>

      <wd-cell v-if="!followSystem" title="深色模式" center>
        <template #value>
          <wd-switch v-model="isDark" />
        </template>
      </wd-cell>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useSystemTheme } from '@/composables/useSystemTheme'
import { cache } from '@/utils/cache'

const { systemTheme } = useSystemTheme()

const followSystem = ref(cache.get<boolean>('followSystem') ?? true)
const isDark = ref(cache.get<boolean>('isDark') ?? false)

const currentTheme = computed(() => {
  if (followSystem.value) {
    return systemTheme.value
  }
  return isDark.value ? 'dark' : 'light'
})

// 保存设置
watch(followSystem, (val) => cache.set('followSystem', val))
watch(isDark, (val) => cache.set('isDark', val))
</script>
```

## 主题切换动画

### 基础过渡动画

```vue
<template>
  <wd-config-provider :theme="theme" :theme-vars="themeVars">
    <view class="app" :class="{ 'theme-transitioning': isTransitioning }">
      <slot />
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const theme = ref<'light' | 'dark'>('light')
const isTransitioning = ref(false)

const toggleTheme = () => {
  isTransitioning.value = true

  // 延迟切换主题,让过渡动画生效
  setTimeout(() => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }, 50)

  // 动画结束后移除过渡类
  setTimeout(() => {
    isTransitioning.value = false
  }, 350)
}
</script>

<style lang="scss">
.app {
  transition: none;

  &.theme-transitioning {
    transition: background-color 0.3s ease, color 0.3s ease;

    * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
  }
}
</style>
```

## 主题配置示例

### 品牌主题配置

```typescript
// themes/brand.ts
import type { ConfigProviderThemeVars } from '@/wd'

// 默认品牌主题
export const defaultBrandTheme: ConfigProviderThemeVars = {
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C',
}

// 蓝色主题
export const blueTheme: ConfigProviderThemeVars = {
  colorTheme: '#1890ff',
  buttonPrimaryBgColor: '#1890ff',
  navbarBgColor: '#1890ff',
}

// 绿色主题
export const greenTheme: ConfigProviderThemeVars = {
  colorTheme: '#52c41a',
  buttonPrimaryBgColor: '#52c41a',
  navbarBgColor: '#52c41a',
}

// 紫色主题
export const purpleTheme: ConfigProviderThemeVars = {
  colorTheme: '#722ed1',
  buttonPrimaryBgColor: '#722ed1',
  navbarBgColor: '#722ed1',
}

// 红色主题
export const redTheme: ConfigProviderThemeVars = {
  colorTheme: '#f5222d',
  buttonPrimaryBgColor: '#f5222d',
  navbarBgColor: '#f5222d',
}
```

### 主题选择器组件

```vue
<template>
  <view class="theme-selector">
    <view class="theme-list">
      <view
        v-for="(item, index) in themes"
        :key="index"
        class="theme-item"
        :class="{ active: currentIndex === index }"
        @click="selectTheme(index)"
      >
        <view
          class="theme-preview"
          :style="{ backgroundColor: item.config.colorTheme }"
        />
        <text class="theme-name">{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import {
  defaultBrandTheme,
  blueTheme,
  greenTheme,
  purpleTheme,
  redTheme,
} from '@/themes/brand'

const { setGlobalTheme } = useTheme()

const themes = [
  { name: '默认', config: defaultBrandTheme },
  { name: '蓝色', config: blueTheme },
  { name: '绿色', config: greenTheme },
  { name: '紫色', config: purpleTheme },
  { name: '红色', config: redTheme },
]

const currentIndex = ref(0)

const selectTheme = (index: number) => {
  currentIndex.value = index
  setGlobalTheme(themes[index].config)
}
</script>

```

## 类型定义

### ConfigProviderThemeVars

```typescript
/**
 * 主题变量类型定义
 */
export interface ConfigProviderThemeVars {
  // 基础色彩
  colorTheme?: string
  colorWhite?: string
  colorBlack?: string
  colorSuccess?: string
  colorWarning?: string
  colorDanger?: string
  colorPurple?: string
  colorYellow?: string
  colorBlue?: string

  // 灰色系统
  colorGray1?: string
  colorGray2?: string
  colorGray3?: string
  colorGray4?: string
  colorGray5?: string
  colorGray6?: string
  colorGray7?: string
  colorGray8?: string

  // 字体颜色
  fontGray1?: string
  fontGray2?: string
  fontGray3?: string
  fontGray4?: string
  fontWhite1?: string
  fontWhite2?: string

  // 语义化颜色
  colorTitle?: string
  colorContent?: string
  colorSecondary?: string
  colorAid?: string
  colorTip?: string
  colorBorder?: string
  colorBorderLight?: string
  colorBg?: string

  // 深色模式
  darkBackground?: string
  darkBackground2?: string
  darkBackground3?: string
  darkBackground4?: string
  darkBackground5?: string
  darkBackground6?: string
  darkBackground7?: string
  darkColor?: string
  darkColor2?: string
  darkColor3?: string
  darkColor4?: string

  // 字体尺寸
  fsBig?: string
  fsImportant?: string
  fsTitle?: string
  fsContent?: string
  fsSecondary?: string
  fsAid?: string

  // 字重
  fwMedium?: number | string
  fwSemibold?: number | string

  // 间距
  sizeSidePadding?: string

  // 组件特定变量
  // Button
  buttonPrimaryBgColor?: string
  buttonPrimaryColor?: string
  buttonSuccessBgColor?: string
  buttonWarningBgColor?: string
  buttonDangerBgColor?: string
  buttonSmallHeight?: string
  buttonMediumHeight?: string
  buttonLargeHeight?: string
  buttonBorderRadius?: string

  // Cell
  cellPadding?: string
  cellBgColor?: string
  cellTitleFontSize?: string
  cellTitleColor?: string
  cellValueFontSize?: string
  cellValueColor?: string

  // Input
  inputPadding?: string
  inputFontSize?: string
  inputColor?: string
  inputPlaceholderColor?: string
  inputBorderColor?: string
  inputFocusBorderColor?: string

  // Navbar
  navbarHeight?: string
  navbarBgColor?: string
  navbarTitleFontSize?: string
  navbarTitleFontWeight?: string | number
  navbarTitleColor?: string

  // Toast
  toastPadding?: string
  toastFontSize?: string
  toastColor?: string
  toastBgColor?: string
  toastBorderRadius?: string

  // Modal
  modalWidth?: string
  modalPadding?: string
  modalBgColor?: string
  modalBorderRadius?: string
  modalTitleFontSize?: string
  modalTitleColor?: string
  modalContentFontSize?: string
  modalContentColor?: string

  // Loading
  loadingSize?: string

  // MessageBox
  messageBoxTitleColor?: string
  messageBoxContentColor?: string

  // Notify
  notifyPadding?: string
  notifyFontSize?: string

  // ... 更多组件变量
  [key: string]: string | number | undefined
}
```

## 最佳实践

### 1. 统一主题入口

建议在 App.vue 中统一配置 ConfigProvider,避免在多处重复配置:

```vue
<!-- App.vue -->
<template>
  <wd-config-provider :theme="theme" :theme-vars="themeVars">
    <router-view />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useThemePersist } from '@/composables/useThemePersist'

const { themeMode: theme, themeConfig: themeVars } = useThemePersist()
</script>
```

### 2. 按需定制变量

只覆盖需要修改的变量,保持默认值的一致性:

```typescript
// 推荐: 只覆盖需要的变量
const themeVars = {
  colorTheme: '#1890ff',
  buttonPrimaryBgColor: '#1890ff',
}

// 不推荐: 覆盖所有变量
const themeVars = {
  colorTheme: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorDanger: '#ff4d4f',
  // ... 大量不需要修改的变量
}
```

### 3. 使用语义化命名

为自定义主题使用语义化的命名:

```typescript
// 推荐: 语义化命名
const themes = {
  brand: { colorTheme: '#1890ff' },
  dark: { colorTheme: '#177ddc' },
  festival: { colorTheme: '#f5222d' },  // 节日主题
}

// 不推荐: 无意义命名
const themes = {
  theme1: { colorTheme: '#1890ff' },
  theme2: { colorTheme: '#177ddc' },
}
```

### 4. 深色模式适配

确保自定义样式同时适配深色模式:

```scss
.my-component {
  // 亮色模式
  background-color: var(--wot-color-bg);
  color: var(--wot-color-content);

  // 深色模式自动适配
  // ConfigProvider 会自动应用深色变量
}
```

## 常见问题

### 1. 主题变量不生效

**问题**: 设置了 themeVars 但组件样式没有变化

**解决方案**:
- 确保 ConfigProvider 包裹了目标组件
- 检查变量名是否正确(使用驼峰命名)
- 确认组件支持该主题变量

```vue
<!-- 正确用法 -->
<wd-config-provider :theme-vars="{ colorTheme: '#1890ff' }">
  <wd-button type="primary">按钮</wd-button>
</wd-config-provider>

<!-- 错误: ConfigProvider 没有包裹组件 -->
<wd-config-provider :theme-vars="{ colorTheme: '#1890ff' }" />
<wd-button type="primary">按钮</wd-button>
```

### 2. 深色模式闪烁

**问题**: 页面加载时深色模式出现闪烁

**解决方案**:
- 在 App.vue 中同步读取缓存的主题设置
- 使用 CSS 变量提前设置默认值

```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { cache } from '@/utils/cache'

// 同步读取,避免闪烁
const theme = ref(cache.get<'light' | 'dark'>('theme') || 'light')
</script>
```

### 3. 主题变量类型错误

**问题**: TypeScript 报类型错误

**解决方案**:
- 使用 ConfigProviderThemeVars 类型
- 确保值类型正确(字符串/数字)

```typescript
import type { ConfigProviderThemeVars } from '@/wd'

const themeVars: ConfigProviderThemeVars = {
  colorTheme: '#1890ff',        // 正确: 字符串
  fwMedium: 500,                // 正确: 数字
  buttonMediumHeight: '80rpx',  // 正确: 字符串(带单位)
}
```

### 4. UnoCSS 主题色不同步

**问题**: UnoCSS 的主题色与 WD UI 不一致

**解决方案**:
确保 UnoCSS 配置引用了 CSS 变量:

```typescript
// uno.config.ts
theme: {
  colors: {
    primary: 'var(--wot-color-theme, #0957DE)',
  },
}
```
