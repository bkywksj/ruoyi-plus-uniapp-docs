# WD UI 快速开始

## 介绍

WD UI (Wot Design Uni) 是一套基于 Vue 3 和 UniApp 的高质量移动端 UI 组件库，提供 78+ 组件，覆盖移动端开发的各种场景。组件库采用 TypeScript 编写，提供完整的类型定义，支持 15 种语言的国际化。

**核心特性:**

- **组件丰富** - 78+ 高质量组件，覆盖基础、布局、导航、表单、展示、反馈六大类
- **多平台支持** - 同时支持 H5、微信小程序、支付宝小程序、App 等多端
- **TypeScript** - 完整的类型定义，提供优秀的开发体验
- **国际化** - 内置 15 种语言支持，轻松实现多语言应用
- **主题定制** - 基于 CSS 变量的主题系统，支持深色模式
- **按需引入** - 支持按需加载，减小打包体积
- **Easycom** - 支持 UniApp Easycom 规范，无需手动注册组件

## 环境要求

### 基础环境

| 依赖 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 16.0.0 | 20.0.0+ | LTS 版本 |
| npm | 7.0.0 | 10.0.0+ | 或使用 pnpm/yarn |
| pnpm | 7.0.0 | 9.0.0+ | 推荐使用 |
| Vue | 3.2.0 | 3.4.0+ | Vue 3 Composition API |
| UniApp | 3.0.0 | 最新版 | HBuilderX 或 CLI |
| TypeScript | 4.0.0 | 5.0.0+ | 可选但推荐 |

### 开发工具

**IDE 选择:**

1. **VS Code (推荐)** - 配合 Volar 扩展
2. **HBuilderX** - DCloud 官方 IDE
3. **WebStorm** - JetBrains IDE

**VS Code 推荐扩展:**

```json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "antfu.unocss"
  ]
}
```

### 浏览器兼容性

| 浏览器/平台 | 最低版本 |
|------------|---------|
| Chrome | 61+ |
| Safari | 11+ |
| Firefox | 52+ |
| Edge | 16+ |
| iOS Safari | 11+ |
| Android WebView | 61+ |
| 微信小程序 | 基础库 2.10.0+ |
| 支付宝小程序 | 基础库 1.22.0+ |

## 安装

### npm 安装

```bash
# 使用 npm
npm install wot-design-uni

# 使用 yarn
yarn add wot-design-uni

# 使用 pnpm (推荐)
pnpm add wot-design-uni
```

### 依赖说明

WD UI 对 Vue 版本有要求，确保项目中 Vue 版本满足条件：

```json
{
  "dependencies": {
    "vue": "^3.2.0"
  },
  "peerDependencies": {
    "vue": ">=3.2.0"
  }
}
```

### 版本选择

| WD UI 版本 | Vue 版本 | UniApp 版本 | 说明 |
|-----------|---------|------------|------|
| 1.x | 3.2+ | 3.0+ | 稳定版 |
| 0.x | 3.0+ | 2.0+ | 旧版本 |

## 配置

### Easycom 配置 (推荐)

在 `pages.json` 中配置 easycom，实现组件自动导入：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "wot-design-uni/components/wd-$1/wd-$1.vue"
    }
  }
}
```

配置后可以直接在模板中使用组件，无需手动 import：

```vue
<template>
  <view>
    <!-- 无需手动导入，直接使用 -->
    <wd-button type="primary">按钮</wd-button>
    <wd-cell title="标题" value="值" />
    <wd-input v-model="value" placeholder="请输入" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>
```

### 本地组件别名配置

如果将 WD UI 源码放在项目中，需要配置路径别名：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "@/wd/components/wd-$1/wd-$1.vue"
    }
  }
}
```

同时在 `vite.config.ts` 中配置别名：

```typescript
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(process.cwd(), './src'),
    },
  },
})
```

### 全局样式引入

在 `App.vue` 中引入组件库样式：

```vue
<style lang="scss">
/* 引入 WD UI 基础样式 */
@import 'wot-design-uni/index.scss';

/* 如果使用本地源码 */
/* @import '@/wd/index.scss'; */
</style>
```

### 按需引入配置

如果不使用 easycom，可以手动按需引入组件：

```vue
<template>
  <view class="container">
    <WdButton type="primary" @click="handleClick">
      主要按钮
    </WdButton>

    <WdCell title="单元格" value="内容" />

    <WdInput v-model="value" placeholder="请输入内容" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// 按需引入组件
import WdButton from 'wot-design-uni/components/wd-button/wd-button.vue'
import WdCell from 'wot-design-uni/components/wd-cell/wd-cell.vue'
import WdInput from 'wot-design-uni/components/wd-input/wd-input.vue'

const value = ref('')

const handleClick = () => {
  uni.showToast({
    title: '按钮被点击',
    icon: 'success'
  })
}
</script>
```

### TypeScript 配置

在 `tsconfig.json` 中添加类型声明：

```json
{
  "compilerOptions": {
    "types": [
      "@dcloudio/types",
      "wot-design-uni/global"
    ],
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "vue"
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ]
}
```

### Vite 插件配置

完整的 `vite.config.ts` 配置示例：

```typescript
import type { ConfigEnv, UserConfig } from 'vite'
import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import UniPages from '@uni-helper/vite-plugin-uni-pages'
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'
import Components from '@uni-helper/vite-plugin-uni-components'
import AutoImport from 'unplugin-auto-import/vite'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  const { UNI_PLATFORM } = process.env
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  const { VITE_DELETE_CONSOLE, VITE_SHOW_SOURCEMAP, VITE_APP_PUBLIC_PATH } = env

  return defineConfig({
    base: VITE_APP_PUBLIC_PATH || '/',
    envDir: './env',

    plugins: [
      // UniApp 页面路由自动生成
      UniPages({
        dts: 'src/uni-pages.d.ts',
        subPackages: ['src/pages-sub'],
      }),

      // UniApp 布局系统
      UniLayouts(),

      // 组件自动导入
      Components({
        dts: 'src/components.d.ts',
        resolvers: [
          // WD UI 组件解析器
          (componentName) => {
            if (componentName.startsWith('Wd')) {
              const name = componentName.slice(2).replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)
              return {
                name: componentName,
                from: `wot-design-uni/components/wd-${name}/wd-${name}.vue`,
              }
            }
          },
        ],
      }),

      // API 自动导入
      AutoImport({
        imports: [
          'vue',
          'uni-app',
          'pinia',
        ],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/composables/**', 'src/stores/**'],
        vueTemplate: true,
      }),

      // UniApp 插件
      uni(),
    ],

    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM),
    },

    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src'),
      },
    },

    server: {
      host: '0.0.0.0',
      hmr: true,
      strictPort: false,
      open: true,
    },

    esbuild: {
      drop: VITE_DELETE_CONSOLE === 'true' ? ['console', 'debugger'] : ['debugger'],
    },

    optimizeDeps: {
      include: ['jsencrypt/bin/jsencrypt.min.js', 'crypto-js'],
    },

    build: {
      sourcemap: VITE_SHOW_SOURCEMAP === 'true',
      target: 'es6',
      minify: mode === 'development' ? false : 'esbuild',
    },
  })
}
```

## 主题定制

### CSS 变量体系

WD UI 基于 CSS 变量实现主题定制，可以通过覆盖变量实现自定义主题。

**主题色变量:**

```scss
:root {
  /* 品牌色 */
  --wd-color-theme: #4D7FFF;
  --wd-color-primary: #4D7FFF;
  --wd-color-success: #00C853;
  --wd-color-warning: #FFB300;
  --wd-color-danger: #FA2C19;
  --wd-color-info: #909399;

  /* 品牌色变体 */
  --wd-color-theme-light: rgba(77, 127, 255, 0.1);
  --wd-color-theme-light-2: rgba(77, 127, 255, 0.2);
  --wd-color-success-light: rgba(0, 200, 83, 0.1);
  --wd-color-warning-light: rgba(255, 179, 0, 0.1);
  --wd-color-danger-light: rgba(250, 44, 25, 0.1);
}
```

**文本色变量:**

```scss
:root {
  /* 文本色 */
  --wd-color-title: #262626;
  --wd-color-content: #595959;
  --wd-color-secondary: #8C8C8C;
  --wd-color-placeholder: #BFBFBF;
  --wd-color-disabled: #C0C4CC;

  /* 链接色 */
  --wd-color-link: #4D7FFF;
}
```

**背景色变量:**

```scss
:root {
  /* 背景色 */
  --wd-color-bg: #FFFFFF;
  --wd-color-bg-page: #F5F7FA;
  --wd-color-bg-secondary: #F8F8F8;
  --wd-color-bg-light: #FAFAFA;

  /* 边框色 */
  --wd-color-border: #E4E7ED;
  --wd-color-border-light: #EBEEF5;
  --wd-color-border-lighter: #F2F6FC;
}
```

**间距与圆角变量:**

```scss
:root {
  /* 圆角 */
  --wd-radius-xs: 4rpx;
  --wd-radius-sm: 8rpx;
  --wd-radius-md: 12rpx;
  --wd-radius-lg: 16rpx;
  --wd-radius-xl: 24rpx;
  --wd-radius-round: 999rpx;

  /* 间距 */
  --wd-spacing-xs: 8rpx;
  --wd-spacing-sm: 16rpx;
  --wd-spacing-md: 24rpx;
  --wd-spacing-lg: 32rpx;
  --wd-spacing-xl: 48rpx;
}
```

**字体变量:**

```scss
:root {
  /* 字体大小 */
  --wd-font-size-xs: 20rpx;
  --wd-font-size-sm: 24rpx;
  --wd-font-size-md: 28rpx;
  --wd-font-size-lg: 32rpx;
  --wd-font-size-xl: 36rpx;
  --wd-font-size-xxl: 40rpx;

  /* 行高 */
  --wd-line-height-xs: 1.3;
  --wd-line-height-sm: 1.4;
  --wd-line-height-md: 1.5;
  --wd-line-height-lg: 1.6;
}
```

### 创建自定义主题

**1. 创建主题文件:**

```scss
// theme.scss - 自定义主题配置

:root {
  /* 自定义品牌色 */
  --wd-color-theme: #6366F1;
  --wd-color-primary: #6366F1;
  --wd-color-success: #22C55E;
  --wd-color-warning: #F59E0B;
  --wd-color-danger: #EF4444;

  /* 自定义文本色 */
  --wd-color-title: #1F2937;
  --wd-color-content: #4B5563;
  --wd-color-secondary: #9CA3AF;

  /* 自定义圆角 */
  --wd-radius-md: 16rpx;
  --wd-radius-lg: 24rpx;
}
```

**2. 在 App.vue 中引入:**

```vue
<style lang="scss">
/* 先引入自定义主题 */
@import './theme.scss';
/* 再引入组件库样式 */
@import 'wot-design-uni/index.scss';
</style>
```

### 深色模式

**1. 系统深色模式自动切换:**

```scss
/* 系统深色模式自动适配 */
@media (prefers-color-scheme: dark) {
  :root {
    /* 背景色 */
    --wd-color-bg: #1A1A1A;
    --wd-color-bg-page: #0D0D0D;
    --wd-color-bg-secondary: #262626;

    /* 文本色 */
    --wd-color-title: #FFFFFF;
    --wd-color-content: #E5E5E5;
    --wd-color-secondary: #A3A3A3;
    --wd-color-placeholder: #737373;

    /* 边框色 */
    --wd-color-border: #404040;
    --wd-color-border-light: #525252;

    /* 品牌色调整 */
    --wd-color-theme: #818CF8;
    --wd-color-theme-light: rgba(129, 140, 248, 0.15);
  }
}
```

**2. 手动切换深色模式:**

```scss
/* 通过类名控制深色模式 */
.wot-theme-dark,
.dark-theme {
  /* 背景色 */
  --wd-color-bg: #1A1A1A;
  --wd-color-bg-page: #0D0D0D;
  --wd-color-bg-secondary: #262626;

  /* 文本色 */
  --wd-color-title: #FFFFFF;
  --wd-color-content: #E5E5E5;
  --wd-color-secondary: #A3A3A3;

  /* 边框色 */
  --wd-color-border: #404040;
}
```

**3. 动态切换主题:**

```vue
<template>
  <view :class="{ 'dark-theme': isDark }">
    <wd-button @click="toggleTheme">
      {{ isDark ? '切换浅色' : '切换深色' }}
    </wd-button>
    <!-- 页面内容 -->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  // 持久化主题设置
  uni.setStorageSync('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  // 恢复主题设置
  const savedTheme = uni.getStorageSync('theme')
  isDark.value = savedTheme === 'dark'
})
</script>
```

### ConfigProvider 组件

使用 `wd-config-provider` 组件可以更精细地控制组件主题：

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-button type="primary">主题按钮</wd-button>
    <wd-cell title="主题单元格" />
  </wd-config-provider>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { ConfigProviderThemeVars } from 'wot-design-uni'

const themeVars = reactive<ConfigProviderThemeVars>({
  colorTheme: '#6366F1',
  buttonPrimaryBgColor: '#6366F1',
  cellTitleColor: '#1F2937',
})
</script>
```

## 国际化

WD UI 内置 15 种语言支持，开箱即用。

### 支持的语言

| 语言代码 | 语言名称 | 文件 |
|---------|---------|------|
| `zh-CN` | 简体中文 | 默认 |
| `zh-TW` | 繁体中文(台湾) | zh-TW.ts |
| `zh-HK` | 繁体中文(香港) | zh-HK.ts |
| `en-US` | 英语 | en-US.ts |
| `ja-JP` | 日语 | ja-JP.ts |
| `ko-KR` | 韩语 | ko-KR.ts |
| `de-DE` | 德语 | de-DE.ts |
| `fr-FR` | 法语 | fr-FR.ts |
| `es-ES` | 西班牙语 | es-ES.ts |
| `pt-PT` | 葡萄牙语 | pt-PT.ts |
| `ru-RU` | 俄语 | ru-RU.ts |
| `th-TH` | 泰语 | th-TH.ts |
| `vi-VN` | 越南语 | vi-VN.ts |
| `tr-TR` | 土耳其语 | tr-TR.ts |
| `ar-SA` | 阿拉伯语 | ar-SA.ts |

### 基本用法

```typescript
import { Locale } from 'wot-design-uni'

// 切换到英语
Locale.use('en-US')

// 切换到日语
Locale.use('ja-JP')

// 获取当前语言的消息
const messages = Locale.messages()
```

### 在组件中使用

```vue
<template>
  <view class="i18n-demo">
    <wd-picker
      v-model="lang"
      label="语言"
      :columns="langOptions"
      @confirm="handleLangChange"
    />

    <!-- 组件会自动使用当前语言 -->
    <wd-calendar />
    <wd-datetime-picker />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Locale, useCurrentLang } from 'wot-design-uni'

const currentLang = useCurrentLang()
const lang = ref(currentLang.value)

const langOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
  { label: '日本語', value: 'ja-JP' },
  { label: '한국어', value: 'ko-KR' },
]

const handleLangChange = ({ value }: { value: string }) => {
  Locale.use(value)
}
</script>
```

### 添加自定义语言

```typescript
import { Locale } from 'wot-design-uni'

// 添加自定义语言包
Locale.add({
  'my-lang': {
    calendar: {
      title: '选择日期',
      placeholder: '请选择',
      confirm: '确认',
      cancel: '取消',
      // ... 其他翻译
    },
    // ... 其他组件翻译
  }
})

// 使用自定义语言
Locale.use('my-lang')
```

### 扩展现有语言

```typescript
import { Locale } from 'wot-design-uni'

// 扩展或修改现有语言包
Locale.add({
  'zh-CN': {
    calendar: {
      title: '请选择日期', // 修改默认文案
    },
    // 添加自定义文案
    myComponent: {
      title: '我的组件',
      placeholder: '请输入...',
    }
  }
})
```

### 响应式语言切换

```vue
<script setup lang="ts">
import { computed, watch } from 'vue'
import { Locale, useCurrentLang } from 'wot-design-uni'

// 获取当前语言的响应式引用
const currentLang = useCurrentLang()

// 计算属性：根据语言显示不同内容
const welcomeText = computed(() => {
  switch (currentLang.value) {
    case 'en-US':
      return 'Welcome'
    case 'ja-JP':
      return 'ようこそ'
    default:
      return '欢迎'
  }
})

// 监听语言变化
watch(currentLang, (newLang) => {
  console.log('语言已切换到:', newLang)
})
</script>
```

## 基础使用示例

### 创建第一个页面

```vue
<!-- pages/demo/index.vue -->
<template>
  <view class="demo-page">
    <!-- 自定义导航栏 -->
    <wd-navbar
      title="WD UI 示例"
      left-arrow
      @click-left="handleBack"
    />

    <!-- 表单区域 -->
    <view class="form-section">
      <wd-cell-group title="基础信息">
        <wd-input
          v-model="formData.name"
          label="姓名"
          placeholder="请输入姓名"
          required
          clearable
        />

        <wd-input
          v-model="formData.phone"
          label="手机号"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
        />

        <wd-picker
          v-model="formData.city"
          label="城市"
          :columns="cityOptions"
          placeholder="请选择城市"
        />

        <wd-datetime-picker
          v-model="formData.birthday"
          label="生日"
          type="date"
          placeholder="请选择生日"
        />

        <wd-switch
          v-model="formData.notification"
          label="接收通知"
        />
      </wd-cell-group>
    </view>

    <!-- 按钮区域 -->
    <view class="button-section">
      <wd-button
        type="primary"
        block
        :loading="loading"
        @click="handleSubmit"
      >
        提交
      </wd-button>

      <wd-button
        block
        custom-style="margin-top: 16rpx"
        @click="handleReset"
      >
        重置
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from 'wot-design-uni'

const toast = useToast()

// 表单数据
const formData = reactive({
  name: '',
  phone: '',
  city: '',
  birthday: Date.now(),
  notification: false
})

// 城市选项
const cityOptions = ref([
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉'
])

// 加载状态
const loading = ref(false)

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}

// 表单验证
const validateForm = (): boolean => {
  if (!formData.name.trim()) {
    toast.error('请输入姓名')
    return false
  }
  if (!formData.phone || formData.phone.length !== 11) {
    toast.error('请输入正确的手机号')
    return false
  }
  if (!formData.city) {
    toast.error('请选择城市')
    return false
  }
  return true
}

// 提交处理
const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('提交成功')

    // 跳转到结果页
    uni.navigateTo({
      url: '/pages/result/success'
    })
  } catch (error) {
    toast.error('提交失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置处理
const handleReset = () => {
  formData.name = ''
  formData.phone = ''
  formData.city = ''
  formData.birthday = Date.now()
  formData.notification = false

  toast.info('已重置')
}
</script>

<style lang="scss" scoped>
.demo-page {
  min-height: 100vh;
  background-color: var(--wd-color-bg-page);
}

.form-section {
  padding: 24rpx;
}

.button-section {
  padding: 32rpx 24rpx;
}
</style>
```

### 列表页面示例

```vue
<!-- pages/list/index.vue -->
<template>
  <view class="list-page">
    <wd-navbar title="用户列表" />

    <!-- 搜索栏 -->
    <wd-search
      v-model="searchValue"
      placeholder="搜索用户名或邮箱"
      show-action
      @search="handleSearch"
      @clear="handleClear"
      @cancel="handleCancel"
    />

    <!-- 下拉筛选 -->
    <wd-drop-menu>
      <wd-drop-menu-item
        v-model="filter.department"
        :options="departmentOptions"
        title="部门"
        @change="handleFilterChange"
      />
      <wd-drop-menu-item
        v-model="filter.status"
        :options="statusOptions"
        title="状态"
        @change="handleFilterChange"
      />
    </wd-drop-menu>

    <!-- 用户列表 -->
    <scroll-view
      scroll-y
      class="user-list"
      @scrolltolower="loadMore"
    >
      <wd-cell-group>
        <wd-swipe-action
          v-for="user in filteredUsers"
          :key="user.id"
        >
          <wd-cell
            :title="user.name"
            :value="user.department"
            :label="user.email"
            is-link
            @click="handleUserClick(user)"
          >
            <template #icon>
              <wd-img
                :src="user.avatar"
                width="80rpx"
                height="80rpx"
                round
              />
            </template>

            <template #right-icon>
              <wd-badge
                v-if="user.unread > 0"
                :value="user.unread"
                type="danger"
              />
            </template>
          </wd-cell>

          <template #right>
            <view class="swipe-actions">
              <wd-button
                type="warning"
                size="small"
                @click="handleEdit(user)"
              >
                编辑
              </wd-button>
              <wd-button
                type="danger"
                size="small"
                @click="handleDelete(user)"
              >
                删除
              </wd-button>
            </view>
          </template>
        </wd-swipe-action>
      </wd-cell-group>

      <!-- 加载状态 -->
      <wd-loadmore
        :state="loadState"
        @reload="handleReload"
      />
    </scroll-view>

    <!-- 新增按钮 -->
    <wd-fab
      type="primary"
      :active-icon="'add'"
      @click="handleAdd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useMessage, useToast } from 'wot-design-uni'

interface User {
  id: number
  name: string
  department: string
  email: string
  avatar: string
  unread: number
  status: string
}

const message = useMessage()
const toast = useToast()

// 搜索值
const searchValue = ref('')

// 筛选条件
const filter = reactive({
  department: '',
  status: ''
})

// 加载状态
const loadState = ref<'loading' | 'finished' | 'error'>('loading')

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 部门选项
const departmentOptions = [
  { label: '全部', value: '' },
  { label: '技术部', value: 'tech' },
  { label: '市场部', value: 'marketing' },
  { label: '设计部', value: 'design' },
  { label: '运营部', value: 'operation' }
]

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '在职', value: 'active' },
  { label: '离职', value: 'inactive' }
]

// 用户列表
const users = ref<User[]>([])

// 过滤后的用户列表
const filteredUsers = computed(() => {
  let result = users.value

  // 按搜索条件过滤
  if (searchValue.value) {
    const keyword = searchValue.value.toLowerCase()
    result = result.filter(user =>
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    )
  }

  // 按部门过滤
  if (filter.department) {
    result = result.filter(user => user.department === filter.department)
  }

  // 按状态过滤
  if (filter.status) {
    result = result.filter(user => user.status === filter.status)
  }

  return result
})

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadUsers()
}

// 清空搜索
const handleClear = () => {
  searchValue.value = ''
  handleSearch()
}

// 取消搜索
const handleCancel = () => {
  searchValue.value = ''
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadUsers()
}

// 用户点击
const handleUserClick = (user: User) => {
  uni.navigateTo({
    url: `/pages/user/detail?id=${user.id}`
  })
}

// 编辑用户
const handleEdit = (user: User) => {
  uni.navigateTo({
    url: `/pages/user/edit?id=${user.id}`
  })
}

// 删除用户
const handleDelete = async (user: User) => {
  const result = await message.confirm({
    title: '确认删除',
    msg: `确定要删除用户 ${user.name} 吗？`
  })

  if (result === 'confirm') {
    try {
      // 模拟删除请求
      await new Promise(resolve => setTimeout(resolve, 500))

      // 从列表中移除
      const index = users.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
      }

      toast.success('删除成功')
    } catch (error) {
      toast.error('删除失败')
    }
  }
}

// 新增用户
const handleAdd = () => {
  uni.navigateTo({
    url: '/pages/user/add'
  })
}

// 加载更多
const loadMore = () => {
  if (loadState.value !== 'finished') {
    pagination.page++
    loadUsers()
  }
}

// 重新加载
const handleReload = () => {
  pagination.page = 1
  users.value = []
  loadUsers()
}

// 加载用户数据
const loadUsers = async () => {
  try {
    loadState.value = 'loading'

    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newUsers: User[] = Array.from({ length: 10 }, (_, i) => ({
      id: (pagination.page - 1) * 10 + i + 1,
      name: `用户${(pagination.page - 1) * 10 + i + 1}`,
      department: ['技术部', '市场部', '设计部'][i % 3],
      email: `user${(pagination.page - 1) * 10 + i + 1}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      unread: Math.floor(Math.random() * 10),
      status: i % 5 === 0 ? 'inactive' : 'active'
    }))

    if (pagination.page === 1) {
      users.value = newUsers
    } else {
      users.value.push(...newUsers)
    }

    // 模拟分页结束
    if (pagination.page >= 3) {
      loadState.value = 'finished'
    } else {
      loadState.value = 'loading'
    }
  } catch (error) {
    loadState.value = 'error'
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--wd-color-bg-page);
}

.user-list {
  flex: 1;
  overflow: hidden;
}

.swipe-actions {
  display: flex;
  height: 100%;

  .wd-button {
    height: 100%;
    border-radius: 0;
  }
}
</style>
```

### 表单验证示例

```vue
<!-- pages/form/index.vue -->
<template>
  <view class="form-page">
    <wd-navbar title="表单验证" />

    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-cell-group title="账户信息">
        <wd-input
          v-model="formData.username"
          label="用户名"
          prop="username"
          placeholder="4-16位字母、数字或下划线"
          required
          clearable
        />

        <wd-input
          v-model="formData.password"
          label="密码"
          prop="password"
          type="password"
          placeholder="6-20位密码"
          required
          show-password
          clearable
        />

        <wd-input
          v-model="formData.confirmPassword"
          label="确认密码"
          prop="confirmPassword"
          type="password"
          placeholder="再次输入密码"
          required
          show-password
          clearable
        />
      </wd-cell-group>

      <wd-cell-group title="个人信息">
        <wd-input
          v-model="formData.email"
          label="邮箱"
          prop="email"
          type="text"
          placeholder="请输入邮箱"
          required
          clearable
        />

        <wd-input
          v-model="formData.phone"
          label="手机号"
          prop="phone"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          required
          clearable
        />

        <wd-picker
          v-model="formData.gender"
          label="性别"
          prop="gender"
          :columns="genderOptions"
          placeholder="请选择性别"
          required
        />

        <wd-datetime-picker
          v-model="formData.birthday"
          label="生日"
          prop="birthday"
          type="date"
          :max-date="maxDate"
          placeholder="请选择生日"
        />
      </wd-cell-group>

      <wd-cell-group title="其他信息">
        <wd-textarea
          v-model="formData.intro"
          label="个人简介"
          prop="intro"
          placeholder="请输入个人简介"
          :maxlength="200"
          show-word-limit
          auto-height
        />

        <wd-checkbox
          v-model="formData.agree"
          prop="agree"
        >
          我已阅读并同意《用户协议》和《隐私政策》
        </wd-checkbox>
      </wd-cell-group>

      <view class="form-actions">
        <wd-button
          type="primary"
          block
          :loading="submitting"
          @click="handleSubmit"
        >
          提交
        </wd-button>

        <wd-button
          block
          custom-style="margin-top: 16rpx"
          @click="handleReset"
        >
          重置
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'wot-design-uni'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  gender: '',
  birthday: null as number | null,
  intro: '',
  agree: false
})

// 性别选项
const genderOptions = ['男', '女', '保密']

// 最大日期（18岁以上）
const maxDate = Date.now() - 18 * 365 * 24 * 60 * 60 * 1000

// 验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { pattern: /^[a-zA-Z0-9_]{4,16}$/, message: '用户名格式不正确' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '密码长度为6-20位' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (value: string) => {
        return value === formData.password
      },
      message: '两次输入的密码不一致'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '邮箱格式不正确' }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ],
  gender: [
    { required: true, message: '请选择性别' }
  ],
  agree: [
    {
      validator: (value: boolean) => value === true,
      message: '请阅读并同意协议'
    }
  ]
}

// 提交表单
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    submitting.value = true

    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('提交成功')

    // 跳转到成功页
    uni.redirectTo({
      url: '/pages/result/success'
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  toast.info('已重置')
}
</script>

<style lang="scss" scoped>
.form-page {
  min-height: 100vh;
  background-color: var(--wd-color-bg-page);
}

.form-actions {
  padding: 32rpx 24rpx;
}
</style>
```

## 平台配置

### 微信小程序配置

**manifest.json 配置:**

```json
{
  "mp-weixin": {
    "appid": "你的小程序AppID",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true,
      "newFeature": true
    },
    "usingComponents": true,
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序位置接口的效果展示"
      }
    },
    "requiredPrivateInfos": [
      "getLocation",
      "chooseLocation"
    ],
    "lazyCodeLoading": "requiredComponents"
  }
}
```

**分包配置:**

```json
{
  "subPackages": [
    {
      "root": "pages-sub/user",
      "pages": [
        { "path": "profile", "type": "page" },
        { "path": "settings", "type": "page" }
      ]
    },
    {
      "root": "pages-sub/order",
      "pages": [
        { "path": "list", "type": "page" },
        { "path": "detail", "type": "page" }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/user"]
    }
  }
}
```

### H5 配置

**manifest.json 配置:**

```json
{
  "h5": {
    "title": "应用标题",
    "router": {
      "mode": "history",
      "base": "/"
    },
    "devServer": {
      "port": 5173,
      "proxy": {
        "/api": {
          "target": "http://localhost:8080",
          "changeOrigin": true,
          "pathRewrite": {
            "^/api": ""
          }
        }
      }
    },
    "optimization": {
      "prefetch": true,
      "preload": true
    }
  }
}
```

**Nginx 配置:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 支持 history 模式路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api {
        proxy_pass http://backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### App 配置

**manifest.json 配置:**

```json
{
  "app-plus": {
    "distribute": {
      "android": {
        "minSdkVersion": 21,
        "targetSdkVersion": 30,
        "permissions": [
          "<uses-permission android:name=\"android.permission.CAMERA\"/>",
          "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>"
        ]
      },
      "ios": {
        "UIBackgroundModes": ["audio", "fetch"],
        "idfa": false,
        "privacyDescription": {
          "NSCameraUsageDescription": "需要使用相机拍照",
          "NSPhotoLibraryUsageDescription": "需要访问相册选择图片"
        }
      }
    },
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "modules": {
      "Geolocation": {},
      "Camera": {}
    }
  }
}
```

## 工具函数导出

WD UI 还导出了一些实用的工具函数和组合式函数：

```typescript
// 组件实例类型
import type {
  FormInstance,
  PickerInstance,
  CalendarInstance,
  UploadInstance,
  TabsInstance,
  // ... 更多实例类型
} from 'wot-design-uni'

// 工具函数
import {
  dayjs,           // 日期处理
  CommonUtil,      // 通用工具
  clickOut,        // 点击外部关闭
} from 'wot-design-uni'

// 组合式函数
import {
  useToast,        // 轻提示
  useMessage,      // 消息弹窗
  useNotify,       // 通知
  useQueue,        // 队列管理
  useTouch,        // 触摸事件
  useUpload,       // 文件上传
} from 'wot-design-uni'

// 国际化
import {
  Locale,          // 语言管理器
  useCurrentLang,  // 当前语言
} from 'wot-design-uni'
```

### useToast 使用

```typescript
import { useToast } from 'wot-design-uni'

const toast = useToast()

// 基础用法
toast.show('提示信息')

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败')

// 警告提示
toast.warning('请注意')

// 信息提示
toast.info('温馨提示')

// 加载提示
toast.loading('加载中...')

// 关闭提示
toast.close()
```

### useMessage 使用

```typescript
import { useMessage } from 'wot-design-uni'

const message = useMessage()

// 确认弹窗
const result = await message.confirm({
  title: '提示',
  msg: '确定要删除吗？'
})

if (result === 'confirm') {
  // 用户点击确认
}

// 输入弹窗
const inputResult = await message.prompt({
  title: '请输入',
  inputPlaceholder: '请输入内容'
})

if (inputResult.action === 'confirm') {
  console.log('用户输入:', inputResult.value)
}

// 提示弹窗
await message.alert({
  title: '提示',
  msg: '这是一条提示信息'
})
```

## 性能优化

### 按需引入

使用 easycom 或手动按需引入组件，避免全量引入：

```javascript
// ❌ 不推荐：全量引入
import WotDesign from 'wot-design-uni'
app.use(WotDesign)

// ✅ 推荐：配置 easycom 自动按需引入
// pages.json
{
  "easycom": {
    "custom": {
      "^wd-(.*)": "wot-design-uni/components/wd-$1/wd-$1.vue"
    }
  }
}
```

### 图片懒加载

```vue
<template>
  <view class="image-list">
    <wd-img
      v-for="item in images"
      :key="item.id"
      :src="item.url"
      lazy-load
      width="200rpx"
      height="200rpx"
    />
  </view>
</template>
```

### 虚拟列表

对于大量数据的列表，使用虚拟滚动：

```vue
<template>
  <scroll-view
    scroll-y
    class="virtual-list"
    :scroll-top="scrollTop"
    @scroll="handleScroll"
  >
    <view :style="{ height: totalHeight + 'px' }">
      <view
        v-for="item in visibleItems"
        :key="item.id"
        :style="{
          position: 'absolute',
          top: item.top + 'px',
          height: itemHeight + 'px'
        }"
      >
        <wd-cell :title="item.title" />
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const itemHeight = 100
const visibleCount = 10
const scrollTop = ref(0)

// 计算可见项
const visibleItems = computed(() => {
  const startIndex = Math.floor(scrollTop.value / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount, items.value.length)

  return items.value.slice(startIndex, endIndex).map((item, i) => ({
    ...item,
    top: (startIndex + i) * itemHeight
  }))
})

const totalHeight = computed(() => items.value.length * itemHeight)

const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}
</script>
```

### 分包加载

将不常用的页面放入分包，减小主包体积：

```json
{
  "pages": [
    { "path": "pages/index/index" },
    { "path": "pages/my/index" }
  ],
  "subPackages": [
    {
      "root": "pages-sub/settings",
      "pages": [
        { "path": "about" },
        { "path": "privacy" },
        { "path": "agreement" }
      ]
    }
  ]
}
```

## 最佳实践

### 1. 组件复用

将常用的组件组合封装为业务组件：

```vue
<!-- components/user-card/index.vue -->
<template>
  <wd-cell
    :title="user.name"
    :label="user.email"
    is-link
    @click="handleClick"
  >
    <template #icon>
      <wd-img :src="user.avatar" width="80rpx" height="80rpx" round />
    </template>
    <template #right-icon>
      <wd-badge v-if="user.unread" :value="user.unread" />
    </template>
  </wd-cell>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  avatar: string
  unread?: number
}

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  click: [user: User]
}>()

const handleClick = () => {
  emit('click', props.user)
}
</script>
```

### 2. 统一表单处理

封装表单处理逻辑为组合式函数：

```typescript
// composables/useForm.ts
import { ref, reactive } from 'vue'
import type { FormInstance } from 'wot-design-uni'
import { useToast } from 'wot-design-uni'

export function useForm<T extends Record<string, any>>(
  initialData: T,
  submitFn: (data: T) => Promise<void>
) {
  const formRef = ref<FormInstance>()
  const formData = reactive<T>({ ...initialData })
  const submitting = ref(false)
  const toast = useToast()

  const submit = async () => {
    try {
      const valid = await formRef.value?.validate()
      if (!valid) return false

      submitting.value = true
      await submitFn(formData as T)
      toast.success('提交成功')
      return true
    } catch (error) {
      toast.error('提交失败')
      return false
    } finally {
      submitting.value = false
    }
  }

  const reset = () => {
    formRef.value?.resetFields()
    Object.assign(formData, initialData)
  }

  return {
    formRef,
    formData,
    submitting,
    submit,
    reset
  }
}
```

### 3. 错误边界处理

```vue
<template>
  <view v-if="error" class="error-boundary">
    <wd-icon name="warning" size="64rpx" color="#fa2c19" />
    <text class="error-message">{{ error.message }}</text>
    <wd-button type="primary" size="small" @click="retry">
      重试
    </wd-button>
  </view>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false // 阻止错误继续传播
})

const retry = () => {
  error.value = null
}
</script>
```

### 4. 主题跟随系统

```typescript
// composables/useTheme.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useSystemTheme() {
  const isDark = ref(false)

  const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
    isDark.value = e.matches
  }

  onMounted(() => {
    // #ifdef H5
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDark.value = mediaQuery.matches
    mediaQuery.addEventListener('change', updateTheme)
    // #endif

    // #ifdef MP-WEIXIN
    const systemInfo = uni.getSystemInfoSync()
    isDark.value = systemInfo.theme === 'dark'

    uni.onThemeChange?.((result) => {
      isDark.value = result.theme === 'dark'
    })
    // #endif
  })

  onUnmounted(() => {
    // #ifdef H5
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.removeEventListener('change', updateTheme)
    // #endif
  })

  return { isDark }
}
```

## 常见问题

### 1. 组件无法正常显示

**可能原因:**

- 未正确引入样式文件
- easycom 配置错误
- 组件名称拼写错误

**解决方案:**

```vue
<!-- 1. 确保在 App.vue 中引入样式 -->
<style lang="scss">
@import 'wot-design-uni/index.scss';
</style>

<!-- 2. 检查 pages.json 中的 easycom 配置 -->
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "wot-design-uni/components/wd-$1/wd-$1.vue"
    }
  }
}

<!-- 3. 确保组件名称正确 -->
<wd-button>正确</wd-button>
<WdButton>错误（easycom 不支持大驼峰）</WdButton>
```

### 2. 样式不生效

**可能原因:**

- CSS 变量优先级问题
- 样式隔离导致无法穿透
- 平台差异

**解决方案:**

```scss
/* 1. 使用 !important 提升优先级 */
:root {
  --wd-color-theme: #6366F1 !important;
}

/* 2. 使用 :deep() 穿透样式 */
.custom-button {
  :deep(.wd-button__text) {
    font-weight: bold;
  }
}

/* 3. 使用 custom-class 或 custom-style */
<wd-button custom-class="my-button" custom-style="font-size: 32rpx">
  自定义样式
</wd-button>
```

### 3. TypeScript 类型报错

**可能原因:**

- 未配置类型声明
- 类型版本不匹配

**解决方案:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": [
      "@dcloudio/types",
      "wot-design-uni/global"
    ],
    "skipLibCheck": true
  }
}
```

### 4. 小程序包体积过大

**解决方案:**

1. 使用分包加载
2. 移除未使用的组件
3. 压缩图片资源
4. 开启代码压缩

```json
// manifest.json
{
  "mp-weixin": {
    "setting": {
      "minified": true,
      "es6": true,
      "postcss": true
    },
    "optimization": {
      "subPackages": true
    }
  }
}
```

### 5. 表单验证不触发

**解决方案:**

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <!-- 确保 prop 与 formData 中的字段对应 -->
    <wd-input
      v-model="formData.username"
      prop="username"
      label="用户名"
    />
  </wd-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'wot-design-uni'

const formRef = ref<FormInstance>()
const formData = reactive({
  username: ''
})

// 确保规则字段与 prop 一致
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名' }
  ]
}

// 手动触发验证
const validate = async () => {
  const valid = await formRef.value?.validate()
  return valid
}
</script>
```

### 6. 弹窗层级问题

**解决方案:**

```vue
<!-- 使用 z-index 属性控制层级 -->
<wd-popup v-model="show" :z-index="1000">
  内容
</wd-popup>

<!-- 或者使用 CSS 变量 -->
<style lang="scss">
:root {
  --wd-popup-z-index: 1000;
}
</style>
```

### 7. 图片加载失败

**解决方案:**

```vue
<wd-img
  :src="imageUrl"
  @error="handleError"
>
  <template #error>
    <view class="error-placeholder">
      <wd-icon name="image-error" size="48rpx" color="#999" />
      <text>加载失败</text>
    </view>
  </template>
</wd-img>

<script setup lang="ts">
const handleError = () => {
  console.log('图片加载失败')
  // 可以设置默认图片
}
</script>
```

### 8. 滚动穿透问题

**解决方案:**

```vue
<template>
  <wd-popup
    v-model="show"
    :lock-scroll="true"
    :close-on-click-modal="true"
  >
    <scroll-view scroll-y class="popup-content">
      <!-- 弹窗内容 -->
    </scroll-view>
  </wd-popup>
</template>

<style lang="scss">
.popup-content {
  max-height: 60vh;
  overflow: hidden;
}
</style>
```

### 9. 键盘遮挡输入框

**解决方案:**

```vue
<template>
  <view class="form-page" :style="{ paddingBottom: keyboardHeight + 'px' }">
    <wd-input
      v-model="value"
      :adjust-position="true"
      :cursor-spacing="20"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const keyboardHeight = ref(0)

onMounted(() => {
  uni.onKeyboardHeightChange((res) => {
    keyboardHeight.value = res.height
  })
})
</script>
```

### 10. 多端样式差异

**解决方案:**

```scss
/* 使用条件编译处理平台差异 */
.my-component {
  padding: 24rpx;

  /* #ifdef H5 */
  padding-top: 48rpx; /* H5 需要额外的顶部间距 */
  /* #endif */

  /* #ifdef MP-WEIXIN */
  padding-bottom: env(safe-area-inset-bottom); /* 小程序安全区域 */
  /* #endif */
}
```

## 总结

WD UI 是一个功能完善、易于使用的 UniApp 组件库，本文档介绍了：

1. **环境要求** - Node.js 16+、Vue 3.2+、UniApp 3.0+
2. **安装配置** - npm 安装、easycom 配置、TypeScript 支持
3. **主题定制** - CSS 变量体系、深色模式、ConfigProvider
4. **国际化** - 15 种语言支持、动态切换、自定义语言包
5. **基础示例** - 表单页面、列表页面、表单验证
6. **平台配置** - 微信小程序、H5、App 配置
7. **工具函数** - useToast、useMessage、Locale 等
8. **性能优化** - 按需引入、懒加载、虚拟列表、分包
9. **最佳实践** - 组件复用、表单处理、错误边界
10. **常见问题** - 10 个常见问题及解决方案

通过本文档，你可以快速上手 WD UI，构建高质量的移动端应用。
