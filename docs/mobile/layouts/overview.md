# 布局系统概述

## 介绍

布局系统是 RuoYi-Plus-UniApp 移动端应用的核心架构组件之一，基于 `@uni-helper/vite-plugin-uni-layouts` 插件实现，提供了灵活、强大且易于扩展的页面布局管理能力。通过布局系统，开发者可以统一管理应用中所有页面的布局结构，实现全局组件的复用、主题配置的集中管理以及页面样式的标准化配置。

布局系统采用了分层架构设计，将应用的布局层与页面内容层完全分离，使得每个页面可以专注于业务逻辑的实现，而无需关心通用的布局结构和全局组件。系统默认提供了一套完整的布局模板，包含主题配置、全局反馈组件（Toast、Notify、MessageBox）、授权组件等核心功能，同时支持开发者根据业务需求创建自定义布局模板。

**核心特性：**

- **插件化架构** - 基于 UniLayouts 插件实现，与 UniApp 生态无缝集成，提供开箱即用的布局管理能力
- **灵活配置** - 支持在 pages.json 和页面文件的 route 块中配置布局，支持全局配置和页面级配置
- **主题系统集成** - 内置主题配置提供者（ConfigProvider），通过 useTheme 组合式函数实现全局主题管理
- **全局组件复用** - 统一管理 Toast、Notify、MessageBox 等全局反馈组件，避免在每个页面重复引入
- **授权流程管理** - 集成 AuthModal 组件，支持头像、昵称、手机号等用户信息授权流程
- **Route 块配置** - 支持在页面文件中通过 `<route>` 块配置布局类型、页面样式、元数据等信息
- **多平台支持** - 完整支持 H5、微信小程序、App 等多个平台的特定配置和样式定制
- **开发体验优化** - 提供详细的配置注释和完整的 TypeScript 类型支持，提升开发效率

## 架构设计

### 整体架构

布局系统采用三层架构设计：

```
┌─────────────────────────────────────────┐
│           Vite Plugin Layer             │
│    (UniLayouts 插件 - 构建时处理)        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Layout Template Layer           │
│    (布局模板 - 运行时容器)               │
│  - default.vue (默认布局)                │
│  - custom.vue (自定义布局)               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│            Page Content Layer           │
│       (页面内容 - 业务逻辑)              │
└─────────────────────────────────────────┘
```

### 插件层（Vite Plugin Layer）

插件层负责在构建时处理布局配置，将 pages.json 中的 layout 字段和页面文件中的 `<route>` 块配置解析并注入到最终的页面组件中。

**插件配置：**

```typescript
// vite/plugins/index.ts
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // UniLayouts 插件配置
  vitePlugins.push(UniLayouts())

  // ... 其他插件

  return vitePlugins
}
```

**工作流程：**

1. **解析配置** - 读取 pages.json 中的 `layout` 字段和页面文件中的 `<route>` 块
2. **模板匹配** - 根据 `layout` 值查找对应的布局模板文件（如 `layouts/default.vue`）
3. **组件包装** - 将页面组件包装到布局模板的插槽中
4. **路由注册** - 将处理后的组件注册到 UniApp 路由系统

### 布局模板层（Layout Template Layer）

布局模板层定义了应用的整体布局结构，是所有页面的容器。每个布局模板都是一个 Vue 组件，通过插槽（slot）渲染具体的页面内容。

**默认布局结构：**

```vue
<!-- layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 页面内容插槽 -->
    <slot />

    <!-- 全局反馈组件 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />

    <!-- 授权组件 -->
    <AuthModal />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme({
  // 主题变量覆盖
})
</script>
```

**布局模板职责：**

1. **主题配置** - 通过 `wd-config-provider` 组件提供全局主题变量
2. **全局组件** - 渲染 Toast、Notify、MessageBox 等全局反馈组件
3. **业务组件** - 渲染 AuthModal 等业务相关的全局组件
4. **内容插槽** - 提供 `<slot />` 插槽渲染具体页面内容

### 页面内容层（Page Content Layer）

页面内容层是具体的业务页面组件，专注于业务逻辑的实现，无需关心布局结构和全局组件。

**页面配置方式：**

**方式一：在 pages.json 中配置**

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "type": "home",
      "layout": "default"
    }
  ]
}
```

**方式二：在页面文件中使用 route 块配置**

```vue
<template>
  <view class="page">
    <!-- 页面内容 -->
  </view>
</template>

<route lang="json5">
{
  layout: 'default',
  type: 'page',
  style: {
    navigationStyle: 'custom'
  }
}
</route>
```

## 布局类型

### Default 布局

默认布局是应用中最常用的布局模板，提供了完整的主题配置和全局组件支持。适用于大部分业务页面。

**布局组成：**

1. **ConfigProvider** - 主题配置提供者
2. **Toast** - 轻提示组件
3. **Notify** - 消息通知组件
4. **MessageBox** - 确认弹窗组件
5. **AuthModal** - 授权弹窗组件

**使用场景：**

- 普通业务页面
- 列表页面
- 详情页面
- 表单页面
- 需要全局反馈组件的页面

**配置示例：**

```json
{
  "path": "pages/user/profile",
  "type": "page",
  "layout": "default"
}
```

### Custom 布局

自定义布局允许开发者根据特定业务需求创建专属的布局模板。适用于需要特殊布局结构的页面。

**创建自定义布局：**

```vue
<!-- layouts/custom.vue -->
<template>
  <view class="custom-layout">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <slot name="navbar" />
    </view>

    <!-- 主内容区域 -->
    <view class="custom-content">
      <slot />
    </view>

    <!-- 自定义底部栏 -->
    <view class="custom-footer">
      <slot name="footer" />
    </view>
  </view>
</template>
```

**使用自定义布局：**

```vue
<template>
  <template #navbar>
    <view>自定义导航栏内容</view>
  </template>

  <view>页面主内容</view>

  <template #footer>
    <view>自定义底部内容</view>
  </template>
</template>

<route lang="json5">
{
  layout: 'custom'
}
</route>
```

## 核心组件

### ConfigProvider 主题配置

`wd-config-provider` 组件是 WD UI 组件库的全局配置提供者，用于统一管理主题变量、深色模式等全局配置。

**主要功能：**

1. **主题变量定制** - 支持覆盖组件库默认的主题变量
2. **深色模式** - 支持 light/dark 两种主题模式
3. **全局样式** - 为所有子组件提供统一的样式配置

**基本用法：**

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useTheme } from '@/composables/useTheme'

const { themeVars } = useTheme({
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C'
})
</script>
```

**主题变量类型：**

```typescript
interface ConfigProviderThemeVars {
  // 基础色彩
  colorTheme?: string        // 主题色
  colorSuccess?: string      // 成功色
  colorWarning?: string      // 警告色
  colorDanger?: string       // 危险色

  // Loading 组件
  loadingSize?: string       // Loading 大小

  // MessageBox 组件
  messageBoxTitleColor?: string    // 标题颜色
  messageBoxContentColor?: string  // 内容颜色

  // Notify 组件
  notifyPadding?: string     // 内边距
  notifyFontSize?: string    // 字体大小

  // 导航栏
  navbarTitleFontSize?: string    // 标题字体大小
  navbarTitleFontWeight?: string  // 标题字体粗细

  // ... 更多变量
}
```

### Toast 轻提示

`wd-toast` 组件用于显示轻量级的提示信息，支持成功、失败、警告、加载等多种状态。

**使用方式：**

```typescript
import { useToast } from '@/wd'

const toast = useToast()

// 成功提示
toast.success('操作成功')

// 失败提示
toast.error('操作失败')

// 警告提示
toast.warning('请注意')

// 普通提示
toast.info('提示信息')

// 加载提示
toast.loading('加载中...')

// 关闭提示
toast.close()
```

**特点：**

- 自动关闭（默认 2000ms）
- 支持自定义持续时间
- 支持图标和纯文本模式
- 支持多种提示类型

### Notify 消息通知

`wd-notify` 组件用于显示顶部通知栏消息，适用于需要用户注意但不打断操作的场景。

**使用方式：**

```typescript
import { useNotify } from '@/wd'

const notify = useNotify()

// 成功通知
notify.success('操作成功')

// 失败通知
notify.error('操作失败')

// 警告通知
notify.warning('请注意')

// 普通通知
notify.info('通知消息')
```

**特点：**

- 从顶部滑入
- 支持自动关闭
- 支持多种通知类型
- 不阻断用户操作

### MessageBox 确认弹窗

`wd-message-box` 组件用于显示需要用户确认的重要操作弹窗。

**使用方式：**

```typescript
import { useMessageBox } from '@/wd'

const messageBox = useMessageBox()

// 确认对话框
messageBox.confirm('确定要删除这条数据吗？')
  .then(() => {
    console.log('用户点击了确定')
  })
  .catch(() => {
    console.log('用户点击了取消')
  })

// 警告对话框
messageBox.alert('这是一条警告信息')
  .then(() => {
    console.log('用户确认了警告')
  })
```

**特点：**

- 支持确认和取消操作
- 支持自定义标题和内容
- 支持 Promise 回调
- 阻断用户操作，强制用户做出选择

### AuthModal 授权弹窗

`AuthModal` 组件是项目自定义的授权组件，用于获取用户的头像、昵称、手机号等信息。

**主要功能：**

1. **头像授权** - 支持用户选择和上传头像
2. **昵称授权** - 支持用户设置昵称
3. **手机号授权** - 支持微信小程序手机号快捷授权
4. **灵活控制** - 支持控制是否需要手机号授权

**组件实现：**

```vue
<template>
  <wd-popup
    v-model="userStore.authModalVisible"
    position="bottom"
    closable
  >
    <view class="p-4">
      <!-- 标题 -->
      <wd-text text="授权" size="38" />

      <!-- 表单区域 -->
      <wd-form ref="formRef" :model="form">
        <!-- 头像选择 -->
        <wd-cell title="头像">
          <wd-button
            type="icon"
            :icon="form.avatar || 'camera'"
            open-type="chooseAvatar"
            @chooseavatar="chooseavatar"
          />
        </wd-cell>

        <!-- 昵称输入 -->
        <wd-input
          v-model="form.nickName"
          label="昵称"
          type="nickname"
        />
      </wd-form>

      <!-- 操作按钮 -->
      <view class="mt-8">
        <wd-button @click="reject">残忍拒绝</wd-button>
        <wd-button type="success" @click="agree">立即授权</wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const toast = useToast()

const form = ref({
  avatar: '',
  nickName: ''
})

// 选择头像
const chooseavatar = (detail) => {
  // 上传头像逻辑
  upload.fastUpload(detail.avatarUrl, {
    onSuccess(res) {
      form.value.avatar = res.url
    }
  })
}

// 同意授权
const agree = async () => {
  const [err] = await updateUserProfile({
    avatar: form.value.avatar,
    nickName: form.value.nickName
  })

  if (!err) {
    userStore.updateUserInfo(form.value)
    userStore.authModalVisible = false
    toast.success('授权成功！')
  }
}

// 拒绝授权
const reject = () => {
  userStore.authModalVisible = false
  toast.warning('你拒绝了授权')
}
</script>
```

**使用场景：**

- 用户首次登录
- 用户信息不完整时
- 需要更新用户信息时
- 特定功能需要授权时

**控制授权弹窗：**

```typescript
// 显示授权弹窗
userStore.authModalVisible = true

// 设置是否需要手机号授权
userStore.requirePhoneAuth = true
```

## 主题系统

### useTheme 组合式函数

`useTheme` 是项目提供的主题管理组合式函数，用于统一管理应用的主题配置。

**核心功能：**

1. **默认主题** - 提供组件库的默认主题配置
2. **全局覆盖** - 支持全局主题变量覆盖
3. **局部定制** - 支持页面级主题变量定制
4. **响应式更新** - 主题变量变化时自动更新所有组件

**基本用法：**

```typescript
import { useTheme } from '@/composables/useTheme'

// 使用默认主题
const { themeVars } = useTheme()

// 局部定制主题
const { themeVars } = useTheme({
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A'
})

// 全局主题管理
const { setGlobalTheme, resetGlobalTheme, getCurrentTheme } = useTheme()

// 设置全局主题
setGlobalTheme({
  colorTheme: '#ff4757'
})

// 重置全局主题
resetGlobalTheme()

// 获取当前主题
const currentTheme = getCurrentTheme()
```

**实现原理：**

```typescript
// composables/useTheme.ts
import type { ConfigProviderThemeVars } from '@/wd'

// 全局主题覆盖状态
const globalThemeOverrides = ref<Partial<ConfigProviderThemeVars>>({})

// 默认主题配置
const DEFAULT_THEME: ConfigProviderThemeVars = {
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C',
  loadingSize: '40rpx',
  // ... 更多默认配置
}

export const useTheme = (localOverrides?: Partial<ConfigProviderThemeVars>) => {
  // 按优先级合并配置：默认主题 < 全局覆盖 < 局部覆盖
  const themeVars = computed<ConfigProviderThemeVars>(() => ({
    ...DEFAULT_THEME,
    ...globalThemeOverrides.value,
    ...localOverrides
  }))

  const setGlobalTheme = (overrides: Partial<ConfigProviderThemeVars>) => {
    globalThemeOverrides.value = {
      ...globalThemeOverrides.value,
      ...overrides
    }
  }

  const resetGlobalTheme = () => {
    globalThemeOverrides.value = {}
  }

  const getCurrentTheme = () => themeVars.value

  return {
    themeVars,
    setGlobalTheme,
    resetGlobalTheme,
    getCurrentTheme
  }
}
```

**主题优先级：**

```
局部覆盖 (最高) > 全局覆盖 > 默认主题 (最低)
```

**使用示例：**

```vue
<!-- 页面级主题定制 -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="page">
      <wd-button type="primary">主题按钮</wd-button>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme({
  // 仅在此页面生效的主题变量
  colorTheme: '#ff6b6b',
  navbarTitleFontSize: '36rpx'
})
</script>
```

```typescript
// 全局主题切换
import { useTheme } from '@/composables/useTheme'

const { setGlobalTheme } = useTheme()

// 切换到暗黑主题
const switchToDarkTheme = () => {
  setGlobalTheme({
    colorTheme: '#2d2d2d',
    colorSuccess: '#4ade80',
    colorWarning: '#fbbf24',
    colorDanger: '#ef4444'
  })
}

// 切换到亮色主题
const switchToLightTheme = () => {
  setGlobalTheme({
    colorTheme: '#409EFF',
    colorSuccess: '#52C41A',
    colorWarning: '#FFBA00',
    colorDanger: '#F56C6C'
  })
}
```

## 页面配置

### pages.json 配置

在 pages.json 中配置页面的布局类型、页面类型等基本信息。

**基础配置：**

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "type": "home",
      "layout": "default"
    },
    {
      "path": "pages/user/profile",
      "type": "page",
      "layout": "default"
    }
  ]
}
```

**配置字段说明：**

- `path` - 页面路径（必填）
- `type` - 页面类型：`page`（普通页面）、`home`（首页）、`tabbar`（标签页）
- `layout` - 布局类型：`default`（默认布局）、`custom`（自定义布局）等

**全局样式配置：**

```json
{
  "globalStyle": {
    "navigationBarTitleText": "应用标题",
    "navigationStyle": "custom",
    "mp-alipay": {
      "transparentTitle": "always",
      "titlePenetrate": "YES"
    },
    "h5": {
      "titleNView": false
    },
    "app-plus": {
      "bounce": "none"
    }
  }
}
```

### Route 块配置

在页面文件中使用 `<route>` 块可以更灵活地配置页面布局和样式。

**基础配置：**

```vue
<template>
  <view class="page">页面内容</view>
</template>

<route lang="json5">
{
  // 布局类型
  layout: 'default',

  // 页面类型
  type: 'page',

  // 页面样式配置
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '页面标题'
  }
}
</route>
```

**完整配置示例：**

```vue
<route lang="json5">
{
  // ===== UniLayouts 插件专用 =====
  layout: 'default', // 指定使用的布局模板

  // ===== 页面类型 =====
  type: 'page', // 'page' | 'home' | 'tabbar'

  // ===== 页面样式配置 =====
  style: {
    // 导航栏配置
    navigationStyle: 'default', // 'default' | 'custom'
    navigationBarTitleText: '页面标题',
    navigationBarBackgroundColor: '#000000',
    navigationBarTextStyle: 'white', // 'black' | 'white'
    navigationBarShadow: {
      colorType: 1 // 0-无阴影，1-有阴影
    },

    // 窗口配置
    backgroundColor: '#ffffff',
    backgroundTextStyle: 'dark', // 'dark' | 'light'
    backgroundColorTop: '#ffffff',
    backgroundColorBottom: '#ffffff',

    // 下拉刷新
    enablePullDownRefresh: false,
    onReachBottomDistance: 50,

    // 其他配置
    disableScroll: false,
    titlePenetrate: 'NO', // 'YES' | 'NO'

    // App 平台特有
    'app-plus': {
      bounce: 'vertical', // 'none' | 'vertical' | 'horizontal'
      scrollIndicator: 'none', // 'none' | 'default'
      animationType: 'slide-in-right',
      animationDuration: 300,
      titleNView: {
        buttons: [
          {
            text: '按钮',
            fontSize: '16px',
            color: '#333333',
            float: 'right'
          }
        ]
      }
    },

    // H5 平台特有
    h5: {
      pullToRefresh: {
        color: '#2bd009'
      },
      titleNView: {
        backgroundColor: '#f7f7f7',
        buttons: [
          {
            text: '分享',
            type: 'share'
          }
        ]
      }
    },

    // 小程序平台特有
    'mp-weixin': {
      shareElement: 'element-id' // 页面间共享元素
    }
  },

  // ===== 自定义数据 =====
  meta: {
    auth: true, // 是否需要登录
    title: '自定义标题',
    description: '页面描述',
    roles: ['admin', 'user'], // 权限控制
    keepAlive: true, // 是否缓存页面
    transition: 'slide-left' // 页面切换动画
  }
}
</route>
```

**配置优先级：**

```
页面 route 块配置 > pages.json 页面配置 > globalStyle 全局配置
```

## 导航栏集成

### 自定义导航栏

项目默认使用自定义导航栏，通过 `wd-navbar` 组件实现。

**基础用法：**

```vue
<template>
  <view class="page">
    <wd-navbar title="页面标题" />
    <view class="content">页面内容</view>
  </view>
</template>
```

**导航栏配置：**

```vue
<template>
  <wd-navbar
    title="页面标题"
    :fixed="true"
    :safe-area-inset-top="true"
    left-arrow
    @click-left="handleBack"
  >
    <!-- 左侧插槽 -->
    <template #left>
      <wd-icon name="arrow-left" />
    </template>

    <!-- 右侧插槽 -->
    <template #right>
      <wd-icon name="more" />
    </template>
  </wd-navbar>
</template>

<script lang="ts" setup>
const handleBack = () => {
  uni.navigateBack()
}
</script>
```

**导航栏样式定制：**

```vue
<template>
  <wd-navbar
    title="页面标题"
    :custom-style="{
      backgroundColor: '#409EFF',
      color: '#ffffff'
    }"
  />
</template>
```

### 胶囊导航栏

针对微信小程序等平台，项目提供了 `wd-navbar-capsule` 组件，用于实现原生胶囊按钮的导航栏布局。

**基础用法：**

```vue
<template>
  <wd-navbar-capsule title="页面标题" />
</template>
```

**特点：**

- 自动适配微信小程序胶囊按钮位置
- 支持安全区域适配
- 支持自定义标题和背景色

## 底部标签栏集成

### Tabbar 组件

底部标签栏使用 `wd-tabbar` 组件实现，支持图标、文字、徽标等多种形式。

**基础用法：**

```vue
<template>
  <view class="tabbar-page">
    <view class="content">页面内容</view>

    <wd-tabbar v-model="active">
      <wd-tabbar-item
        v-for="item in tabbarItems"
        :key="item.value"
        :icon="item.icon"
        :title="item.title"
        :value="item.value"
        @click="handleTabClick(item)"
      />
    </wd-tabbar>
  </view>
</template>

<script lang="ts" setup>
const active = ref('home')

const tabbarItems = ref([
  { value: 'home', title: '首页', icon: 'home' },
  { value: 'menu', title: '菜单', icon: 'menu' },
  { value: 'my', title: '我的', icon: 'user' }
])

const handleTabClick = (item) => {
  uni.switchTab({
    url: `/pages/${item.value}/${item.value}`
  })
}
</script>
```

**项目中的 Tabbar 实现：**

项目将 Tabbar 的每个标签页拆分为独立的 Vue 组件，便于维护和管理。

```
src/components/tabbar/
├── Home.vue    # 首页标签内容
├── Menu.vue    # 菜单标签内容
└── My.vue      # 我的标签内容
```

**Home.vue 示例：**

```vue
<template>
  <view class="min-h-[100vh]">
    <wd-navbar title="首页" />

    <!-- 轮播图 -->
    <wd-swiper :list="swiperList" />

    <!-- 金刚区 -->
    <wd-row :gutter="16">
      <wd-col v-for="item in menuList" :key="item.title" :span="6">
        <view class="menu-item" @click="handleMenuClick(item)">
          <wd-icon :name="item.icon" :color="item.color" />
          <wd-text :text="item.title" />
        </view>
      </wd-col>
    </wd-row>

    <!-- 商品列表 -->
    <wd-paging :fetch="pageGoods">
      <template #item="{ item }">
        <wd-card>
          <!-- 商品卡片内容 -->
        </wd-card>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
const swiperList = ref<string[]>([])
const menuList = ref([
  { title: '外卖', icon: 'goods', color: '#ff6b6b' },
  { title: '超市', icon: 'cart', color: '#4ecdc4' },
  { title: '水果', icon: 'apple', color: '#45b7d1' },
  { title: '药店', icon: 'bag-fill', color: '#96ceb4' }
])
</script>
```

## 布局与路由

### 布局切换

不同的页面可以使用不同的布局模板，通过配置 `layout` 字段实现布局切换。

**场景一：普通页面使用默认布局**

```json
{
  "path": "pages/user/profile",
  "layout": "default"
}
```

**场景二：登录页使用自定义布局**

```json
{
  "path": "pages/auth/login",
  "layout": "custom"
}
```

**场景三：页面内动态切换布局**

虽然 UniLayouts 不支持运行时动态切换布局，但可以通过条件渲染实现类似效果：

```vue
<template>
  <component :is="currentLayout">
    <view class="content">页面内容</view>
  </component>
</template>

<script lang="ts" setup>
import DefaultLayout from '@/layouts/default.vue'
import CustomLayout from '@/layouts/custom.vue'

const layoutType = ref('default')

const currentLayout = computed(() => {
  return layoutType.value === 'default' ? DefaultLayout : CustomLayout
})
</script>
```

### 分包配置

对于大型应用，可以使用分包功能将不同模块的页面分离，每个分包可以使用不同的布局。

**分包配置：**

```json
{
  "subPackages": [
    {
      "root": "pages-sub/admin",
      "pages": [
        {
          "path": "user/user",
          "type": "page",
          "layout": "default"
        }
      ]
    },
    {
      "root": "pages-sub/customer",
      "pages": [
        {
          "path": "order/list",
          "type": "page",
          "layout": "custom"
        }
      ]
    }
  ]
}
```

**分包布局优化：**

为不同分包创建专属的布局模板，减少不必要的全局组件加载：

```
layouts/
├── default.vue      # 主包默认布局
├── admin.vue        # 管理分包布局
└── customer.vue     # 客户分包布局
```

## API 文档

### UniLayouts 配置

**插件配置接口：**

```typescript
interface UniLayoutsOptions {
  // 布局文件目录，默认为 'src/layouts'
  layoutsDir?: string

  // 默认布局，当页面未指定布局时使用
  defaultLayout?: string

  // 是否排除特定页面
  exclude?: string[]
}
```

**使用示例：**

```typescript
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'

vitePlugins.push(
  UniLayouts({
    layoutsDir: 'src/layouts',
    defaultLayout: 'default',
    exclude: ['pages/auth/login']
  })
)
```

### Route 块配置接口

**Route 块类型定义：**

```typescript
interface RouteConfig {
  // 布局类型
  layout?: string

  // 页面类型
  type?: 'page' | 'home' | 'tabbar'

  // 页面样式配置
  style?: PageStyle

  // 自定义元数据
  meta?: Record<string, any>

  // 预加载规则
  preloadRule?: PreloadRule

  // 窗口表现
  window?: WindowConfig

  // 平台特定配置
  'mp-alipay'?: Record<string, any>
  'mp-baidu'?: Record<string, any>
  'mp-toutiao'?: Record<string, any>
}

interface PageStyle {
  // 导航栏配置
  navigationStyle?: 'default' | 'custom'
  navigationBarTitleText?: string
  navigationBarBackgroundColor?: string
  navigationBarTextStyle?: 'black' | 'white'

  // 窗口配置
  backgroundColor?: string
  backgroundTextStyle?: 'dark' | 'light'
  enablePullDownRefresh?: boolean
  onReachBottomDistance?: number

  // 平台特定样式
  'app-plus'?: AppPlusStyle
  h5?: H5Style
  'mp-weixin'?: MpWeixinStyle
}
```

### useTheme API

**函数签名：**

```typescript
function useTheme(
  localOverrides?: Partial<ConfigProviderThemeVars>
): UseThemeReturn

interface UseThemeReturn {
  // 响应式主题配置变量
  themeVars: ComputedRef<ConfigProviderThemeVars>

  // 设置全局主题覆盖
  setGlobalTheme: (overrides: Partial<ConfigProviderThemeVars>) => void

  // 重置全局主题覆盖
  resetGlobalTheme: () => void

  // 获取当前完整主题配置
  getCurrentTheme: () => ConfigProviderThemeVars
}
```

**使用示例：**

```typescript
import { useTheme } from '@/composables/useTheme'

// 基础使用
const { themeVars } = useTheme()

// 局部定制
const { themeVars } = useTheme({
  colorTheme: '#ff4757',
  loadingSize: '48rpx'
})

// 全局主题管理
const { setGlobalTheme, resetGlobalTheme, getCurrentTheme } = useTheme()

// 设置全局主题
setGlobalTheme({
  colorTheme: '#2d2d2d'
})

// 获取当前主题
const theme = getCurrentTheme()
console.log('当前主题配置:', theme)

// 重置主题
resetGlobalTheme()
```

## 最佳实践

### 1. 合理选择布局模板

根据页面的实际需求选择合适的布局模板，避免加载不必要的全局组件。

**推荐做法：**

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "layout": "default"  // 普通页面使用默认布局
    },
    {
      "path": "pages/auth/login",
      "layout": "custom"   // 登录页使用简洁的自定义布局
    }
  ]
}
```

**不推荐做法：**

```json
{
  "pages": [
    {
      "path": "pages/auth/login",
      "layout": "default"  // 登录页不需要 Toast、Notify 等全局组件
    }
  ]
}
```

### 2. 主题配置分层管理

将主题配置分为全局配置和局部配置，实现灵活的主题管理。

**全局主题配置：**

```typescript
// composables/useAppTheme.ts
import { useTheme } from '@/composables/useTheme'

export const useAppTheme = () => {
  const { setGlobalTheme } = useTheme()

  // 亮色主题
  const lightTheme = {
    colorTheme: '#409EFF',
    colorSuccess: '#52C41A',
    colorWarning: '#FFBA00',
    colorDanger: '#F56C6C'
  }

  // 暗黑主题
  const darkTheme = {
    colorTheme: '#2d2d2d',
    colorSuccess: '#4ade80',
    colorWarning: '#fbbf24',
    colorDanger: '#ef4444'
  }

  const switchTheme = (theme: 'light' | 'dark') => {
    setGlobalTheme(theme === 'light' ? lightTheme : darkTheme)
  }

  return { switchTheme }
}
```

**页面级主题定制：**

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="special-page">
      <!-- 使用特殊主题色的页面 -->
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme({
  colorTheme: '#ff6b6b'  // 仅在此页面生效
})
</script>
```

### 3. 优化全局组件使用

合理使用全局组件，避免在每个页面重复引入。

**推荐做法：**

```vue
<!-- layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />

    <!-- 全局组件统一在布局中引入 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />
  </wd-config-provider>
</template>
```

```vue
<!-- pages/xxx/xxx.vue -->
<template>
  <view class="page">
    <!-- 直接使用全局组件的方法 -->
    <wd-button @click="showToast">显示提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showToast = () => {
  toast.success('操作成功')  // 无需在页面引入组件
}
</script>
```

**不推荐做法：**

```vue
<!-- 每个页面都引入全局组件 -->
<template>
  <view class="page">
    <view class="content">内容</view>
    <wd-toast />  <!-- ❌ 不推荐 -->
    <wd-notify />  <!-- ❌ 不推荐 -->
  </view>
</template>
```

### 4. Route 块配置规范

使用 Route 块配置时，保持配置的一致性和可读性。

**推荐做法：**

```vue
<template>
  <view class="page">页面内容</view>
</template>

<route lang="json5">
{
  // 分组注释，提高可读性

  // ===== 布局配置 =====
  layout: 'default',
  type: 'page',

  // ===== 导航栏配置 =====
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '页面标题',
    navigationBarBackgroundColor: '#ffffff'
  },

  // ===== 权限配置 =====
  meta: {
    auth: true,
    roles: ['admin']
  }
}
</route>
```

**不推荐做法：**

```vue
<route lang="json5">
{
  layout: 'default',
  type: 'page',
  style: { navigationStyle: 'custom', navigationBarTitleText: '页面标题', navigationBarBackgroundColor: '#ffffff' },
  meta: { auth: true, roles: ['admin'] }
}
</route>
```

### 5. 自定义布局的命名规范

创建自定义布局时，使用清晰的命名，便于维护和理解。

**推荐命名：**

```
layouts/
├── default.vue       # 默认布局（包含所有全局组件）
├── simple.vue        # 简洁布局（仅包含主题配置）
├── admin.vue         # 管理后台布局
├── customer.vue      # 客户端布局
└── auth.vue          # 认证页面布局
```

**不推荐命名：**

```
layouts/
├── default.vue
├── layout1.vue      # ❌ 命名不明确
├── layout2.vue      # ❌ 命名不明确
└── custom.vue       # ❌ 过于通用
```

### 6. 分包布局优化

为不同分包使用专属布局，减少主包体积。

**推荐做法：**

```json
{
  "subPackages": [
    {
      "root": "pages-sub/admin",
      "pages": [
        {
          "path": "user/list",
          "layout": "admin"  // 使用管理后台专属布局
        }
      ]
    }
  ]
}
```

```vue
<!-- layouts/admin.vue -->
<template>
  <wd-config-provider :theme-vars="adminThemeVars">
    <slot />
    <!-- 仅包含管理后台需要的组件 -->
  </wd-config-provider>
</template>
```

## 常见问题

### 1. 布局不生效

**问题描述：**

配置了 `layout` 字段，但页面仍然没有使用指定的布局模板。

**可能原因：**

1. UniLayouts 插件未正确配置
2. 布局文件路径错误
3. 布局文件命名错误
4. 缓存未清除

**解决方案：**

**检查插件配置：**

```typescript
// vite/plugins/index.ts
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'

vitePlugins.push(UniLayouts())  // 确保插件已添加
```

**检查布局文件：**

```
src/layouts/
├── default.vue    # ✅ 正确：文件名小写，.vue 后缀
├── custom.vue     # ✅ 正确
└── Default.vue    # ❌ 错误：首字母大写
```

**清除缓存并重新构建：**

```bash
# 删除缓存目录
rm -rf .vite
rm -rf node_modules/.vite

# 重新安装依赖
pnpm install

# 重新构建
pnpm dev:h5
```

### 2. 主题变量不生效

**问题描述：**

配置了主题变量，但组件样式没有改变。

**可能原因：**

1. `theme-vars` 属性绑定错误
2. 主题变量名称错误
3. ConfigProvider 组件未包裹目标组件
4. 组件不支持该主题变量

**解决方案：**

**检查 ConfigProvider 包裹：**

```vue
<!-- ✅ 正确 -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-button type="primary">按钮</wd-button>
  </wd-config-provider>
</template>

<!-- ❌ 错误：Button 不在 ConfigProvider 内 -->
<template>
  <view>
    <wd-config-provider :theme-vars="themeVars" />
    <wd-button type="primary">按钮</wd-button>
  </view>
</template>
```

**检查主题变量名称：**

```typescript
// ✅ 正确
const { themeVars } = useTheme({
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A'
})

// ❌ 错误：变量名错误
const { themeVars } = useTheme({
  primaryColor: '#409EFF',  // 应该是 colorTheme
  successColor: '#52C41A'   // 应该是 colorSuccess
})
```

**检查组件支持的主题变量：**

查阅组件文档，确认组件支持的主题变量列表。不是所有组件都支持所有主题变量。

### 3. 全局组件方法调用失败

**问题描述：**

调用 `toast.success()` 等方法时报错或无效果。

**可能原因：**

1. 全局组件未在布局中引入
2. 组件方法导入错误
3. 组件未正确初始化

**解决方案：**

**确保布局中引入了全局组件：**

```vue
<!-- layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />

    <!-- 必须引入这些全局组件 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />
  </wd-config-provider>
</template>
```

**正确导入组件方法：**

```typescript
// ✅ 正确
import { useToast, useNotify, useMessageBox } from '@/wd'

const toast = useToast()
const notify = useNotify()
const messageBox = useMessageBox()

toast.success('成功')
notify.info('通知')

// ❌ 错误
import { Toast } from '@/wd'  // 不存在的导出
Toast.success('成功')
```

### 4. Route 块配置不生效

**问题描述：**

在页面文件中配置了 `<route>` 块，但配置没有生效。

**可能原因：**

1. route 块语法错误
2. route 块位置错误
3. UniPages 插件配置问题
4. JSON5 格式错误

**解决方案：**

**检查 route 块语法：**

```vue
<!-- ✅ 正确 -->
<template>
  <view>内容</view>
</template>

<route lang="json5">
{
  layout: 'default',
  type: 'page'
}
</route>

<script setup>
// 脚本内容
</script>

<!-- ❌ 错误：route 块必须在 script 之前 -->
<template>
  <view>内容</view>
</template>

<script setup>
// 脚本内容
</script>

<route lang="json5">
{
  layout: 'default'
}
</route>
```

**检查 JSON5 格式：**

```vue
<!-- ✅ 正确 -->
<route lang="json5">
{
  layout: 'default',  // JSON5 支持单引号和尾随逗号
  type: 'page',
}
</route>

<!-- ❌ 错误：JSON 不支持尾随逗号 -->
<route lang="json">
{
  "layout": "default",
  "type": "page",
}
</route>
```

**确保 UniPages 插件配置正确：**

```typescript
// vite/plugins/index.ts
import createUniPages from './uni-pages'

vitePlugins.push(createUniPages(mode))  // 确保 UniPages 插件在 UniLayouts 之前
vitePlugins.push(UniLayouts())
```

### 5. 授权弹窗不显示

**问题描述：**

设置了 `userStore.authModalVisible = true`，但授权弹窗没有显示。

**可能原因：**

1. AuthModal 组件未在布局中引入
2. userStore 状态未正确初始化
3. 弹窗被其他元素遮挡
4. Popup 组件配置问题

**解决方案：**

**确保 AuthModal 在布局中引入：**

```vue
<!-- layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
    <wd-toast />
    <wd-notify />
    <wd-message-box />

    <!-- 必须引入 AuthModal -->
    <AuthModal />
  </wd-config-provider>
</template>

<script setup>
import AuthModal from '@/components/auth/AuthModal.vue'
</script>
```

**检查 userStore 状态：**

```typescript
// 使用前确保 store 已初始化
const userStore = useUserStore()

// 显示授权弹窗
userStore.authModalVisible = true

// 检查状态是否正确设置
console.log('授权弹窗状态:', userStore.authModalVisible)
```

**检查 Popup 组件配置：**

```vue
<!-- AuthModal.vue -->
<template>
  <wd-popup
    v-model="userStore.authModalVisible"
    position="bottom"
    closable
    :z-index="9999"  <!-- 确保 z-index 足够高 -->
  >
    <!-- 弹窗内容 -->
  </wd-popup>
</template>
```

### 6. 页面样式配置冲突

**问题描述：**

同时在 pages.json 和 route 块中配置了页面样式，但实际生效的配置不符合预期。

**可能原因：**

配置优先级不清楚，导致配置被覆盖。

**解决方案：**

**理解配置优先级：**

```
页面 route 块配置（最高）> pages.json 页面配置 > globalStyle 全局配置（最低）
```

**推荐只在一处配置：**

```vue
<!-- 推荐：统一使用 route 块配置 -->
<template>
  <view class="page">内容</view>
</template>

<route lang="json5">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '页面标题'
  }
}
</route>
```

```json
// 或统一使用 pages.json 配置
{
  "pages": [
    {
      "path": "pages/index/index",
      "layout": "default",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "页面标题"
      }
    }
  ]
}
```

**避免重复配置：**

```vue
<!-- ❌ 不推荐：同时在两处配置 -->
<route lang="json5">
{
  style: {
    navigationBarTitleText: '标题A'  // 这个会生效
  }
}
</route>
```

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "标题B"  // 这个会被覆盖
      }
    }
  ]
}
```
