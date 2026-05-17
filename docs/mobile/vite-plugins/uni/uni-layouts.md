# 页面布局插件

## 介绍

页面布局插件（@uni-helper/vite-plugin-uni-layouts）为 UniApp 项目提供类似 Nuxt 的布局系统，允许开发者创建可复用的页面布局模板。通过该插件，可以将通用的页面结构（如导航栏、底部栏、全局组件等）抽取到布局组件中，所有使用该布局的页面会自动继承这些结构，大幅减少重复代码。

**核心特性：**

- **布局复用** - 将公共页面结构抽取为布局组件，所有页面自动继承
- **默认布局** - 支持配置默认布局，无需在每个页面单独指定
- **多布局支持** - 支持创建多个布局模板，按需切换
- **插槽机制** - 页面内容通过插槽嵌入布局，灵活可控
- **全局组件** - 在布局中放置全局组件（Toast、Dialog 等），自动在所有页面生效
- **主题集成** - 与主题系统无缝集成，统一管理主题变量

## 基本用法

### 插件配置

在插件入口文件中注册：

```typescript
// vite/plugins/index.ts
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  // UniApp 相关插件配置
  vitePlugins.push(createUniPages(mode))
  vitePlugins.push(UniLayouts())  // 页面布局插件

  return vitePlugins
}
```

### 创建布局文件

在 `src/layouts/` 目录下创建布局组件：

```text
src/layouts/
└── default.vue    # 默认布局（必需）
```

**默认布局示例：**

```vue
<!-- src/layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!--  内容插槽 - 页面内容将渲染在这里  -->
    <slot />
    <!--  轻提示组件  -->
    <wd-toast />
    <!--  消息通知   -->
    <wd-notify />
    <!--  消息确认弹窗   -->
    <wd-message-box />
    <!--  授权头像昵称弹窗  -->
    <AuthModal />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme({
  // 需要覆盖的主题变量
})
</script>
```

## 布局组件详解

### 插槽机制

布局组件通过 `<slot />` 插槽接收页面内容：

```vue
<!-- src/layouts/default.vue -->
<template>
  <view class="layout">
    <!-- 页面头部 -->
    <view class="layout-header">
      <slot name="header" />
    </view>

    <!-- 页面主体（默认插槽） -->
    <view class="layout-main">
      <slot />
    </view>

    <!-- 页面底部 -->
    <view class="layout-footer">
      <slot name="footer" />
    </view>
  </view>
</template>
```

### 全局组件注册

布局是注册全局组件的理想位置：

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 页面内容 -->
    <slot />

    <!-- ===== 全局组件 ===== -->

    <!-- WD UI 反馈组件 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />

    <!-- 自定义全局组件 -->
    <AuthModal />
    <GlobalLoading />
    <NetworkStatus />
  </wd-config-provider>
</template>
```

**全局组件的优势：**

- 只需在布局中声明一次，所有页面自动可用
- 避免在每个页面重复引入
- 统一管理全局状态和样式

### 主题配置

布局组件与主题系统集成：

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme({
  // 自定义主题变量
  colorTheme: '#0957DE',
  buttonPrimaryBgColor: '#0957DE',
  buttonPrimaryColor: '#ffffff',
})
</script>
```

## 多布局支持

### 创建多个布局

```text
src/layouts/
├── default.vue    # 默认布局
├── blank.vue      # 空白布局（无全局组件）
├── admin.vue      # 管理后台布局
└── tabbar.vue     # Tabbar 页面布局
```

**空白布局示例：**

```vue
<!-- src/layouts/blank.vue -->
<template>
  <!-- 无任何包装，纯净页面 -->
  <slot />
</template>
```

**Tabbar 布局示例：**

```vue
<!-- src/layouts/tabbar.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 页面内容 -->
    <view class="tabbar-page">
      <slot />
    </view>

    <!-- 全局组件 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />

    <!-- 自定义 Tabbar -->
    <CustomTabbar />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme()
</script>

<style lang="scss" scoped>
.tabbar-page {
  padding-bottom: env(safe-area-inset-bottom);
  padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}
</style>
```

### 页面指定布局

在页面的 route 块中指定使用的布局：

```vue
<!-- pages/login/index.vue -->
<route lang="json5">
{
  layout: 'blank',  // 使用空白布局
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="login-page">
    <!-- 登录页面内容 -->
  </view>
</template>
```

```vue
<!-- pages/home/index.vue -->
<route lang="json5">
{
  layout: 'tabbar',  // 使用 Tabbar 布局
  style: {
    navigationBarTitleText: '首页',
  },
}
</route>

<template>
  <view class="home-page">
    <!-- 首页内容 -->
  </view>
</template>
```

## 配置选项

### 插件选项

```typescript
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'

UniLayouts({
  // 布局文件目录
  layoutsDirs: 'src/layouts',
  // 默认布局名称
  defaultLayout: 'default',
})
```

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| layoutsDirs | `string` | `'src/layouts'` | 布局文件所在目录 |
| defaultLayout | `string` | `'default'` | 默认使用的布局名称 |

### 页面 route 块配置

在页面中使用 `<route>` 块配置布局和样式：

```vue
<route lang="json5">
{
  // ===== UniLayouts 插件专用 =====
  layout: 'default',  // 指定布局：default、blank、admin、tabbar 等

  // ===== 页面类型 =====
  type: 'page',  // 页面类型：'page' | 'home' | 'tabbar'

  // ===== 页面样式配置 =====
  style: {
    // 导航栏配置
    navigationStyle: 'default',           // 'default' | 'custom'
    navigationBarTitleText: '页面标题',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',       // 'black' | 'white'

    // 下拉刷新
    enablePullDownRefresh: false,
    onReachBottomDistance: 50,

    // 窗口背景
    backgroundColor: '#f5f5f5',
  },

  // ===== 自定义元数据 =====
  meta: {
    auth: true,           // 是否需要登录
    roles: ['admin'],     // 权限角色
    keepAlive: true,      // 是否缓存
  },
}
</route>
```

## Route 块完整配置

### 导航栏配置

```json5
{
  style: {
    // 导航栏样式
    navigationStyle: 'default',           // 'default' 默认 | 'custom' 自定义
    navigationBarTitleText: '页面标题',    // 导航栏标题
    navigationBarBackgroundColor: '#000000', // 导航栏背景色
    navigationBarTextStyle: 'white',       // 标题颜色 'black' | 'white'
    navigationBarShadow: {
      colorType: 1  // 导航栏阴影 0-无 1-有
    },
  }
}
```

### 窗口配置

```json5
{
  style: {
    // 窗口背景
    backgroundColor: '#ffffff',           // 窗口背景色
    backgroundTextStyle: 'dark',          // 下拉loading样式 'dark' | 'light'
    backgroundColorTop: '#ffffff',        // 顶部背景色(仅iOS)
    backgroundColorBottom: '#ffffff',     // 底部背景色(仅iOS)

    // 滚动配置
    disableScroll: false,                 // 禁止页面滚动
    enablePullDownRefresh: false,         // 开启下拉刷新
    onReachBottomDistance: 50,            // 触底距离(px)
  }
}
```

### 平台特定配置

```json5
{
  style: {
    // App平台特有
    'app-plus': {
      bounce: 'vertical',              // 回弹效果 'none' | 'vertical' | 'horizontal'
      scrollIndicator: 'none',         // 滚动条 'none' | 'default'
      animationType: 'slide-in-right', // 窗口动画
      animationDuration: 300,          // 动画时长(ms)
      titleNView: {
        buttons: [
          {
            text: '分享',
            fontSize: '16px',
            color: '#333333',
            float: 'right'
          }
        ]
      }
    },

    // H5平台特有
    h5: {
      pullToRefresh: {
        color: '#2bd009'  // 下拉刷新颜色
      }
    },

    // 微信小程序特有
    'mp-weixin': {
      shareElement: 'element-id'  // 共享元素
    }
  }
}
```

### 自定义元数据

```json5
{
  meta: {
    // 权限控制
    auth: true,                    // 是否需要登录
    roles: ['admin', 'user'],      // 允许的角色

    // 页面信息
    title: '自定义标题',
    description: '页面描述',
    keywords: 'vue,uniapp',

    // 缓存控制
    keepAlive: true,               // 是否缓存页面

    // 动画配置
    transition: 'slide-left',      // 页面切换动画

    // 自定义数据
    level: 2,
    analytics: {
      track: true,
      category: 'user'
    }
  }
}
```

## 工作原理

```text
┌─────────────────────────────────────────────────────────────┐
│                    布局系统工作流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 插件启动                                                 │
│       ↓                                                     │
│  2. 扫描 src/layouts 目录                                   │
│       ├─ default.vue                                        │
│       ├─ blank.vue                                          │
│       └─ tabbar.vue                                         │
│       ↓                                                     │
│  3. 解析页面 route 块                                        │
│       ├─ 读取 layout 配置                                   │
│       └─ 未指定则使用 defaultLayout                          │
│       ↓                                                     │
│  4. 包装页面组件                                             │
│       │                                                     │
│       │  ┌─────────────────────┐                            │
│       │  │    Layout 组件       │                            │
│       │  │  ┌───────────────┐  │                            │
│       │  │  │   <slot />    │  │ ← 页面内容                  │
│       │  │  └───────────────┘  │                            │
│       │  │  全局组件...        │                            │
│       │  └─────────────────────┘                            │
│       ↓                                                     │
│  5. 输出包装后的页面                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 使用示例

### 项目默认布局

```vue
<!-- src/layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 页面内容 -->
    <slot />

    <!-- ===== WD UI 全局组件 ===== -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />

    <!-- ===== 业务全局组件 ===== -->
    <!-- 授权弹窗 -->
    <AuthModal />
  </wd-config-provider>
</template>

<script lang="ts" setup>
// 主题配置
const { themeVars } = useTheme({
  // 自定义主题变量
})
</script>
```

### 普通页面

使用默认布局，无需指定 layout：

```vue
<!-- pages/index/index.vue -->
<route lang="json5">
{
  style: {
    navigationBarTitleText: '首页',
  },
}
</route>

<template>
  <view class="page">
    <text>首页内容</text>
    <!-- 可以直接使用 Toast 等全局组件的 API -->
    <button @click="showToast">显示提示</button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'

const toast = useToast()

const showToast = () => {
  toast.show('操作成功')
}
</script>
```

### 自定义导航栏页面

```vue
<!-- pages/user/profile.vue -->
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',  // 自定义导航栏
  },
  meta: {
    auth: true,  // 需要登录
  },
}
</route>

<template>
  <view class="profile-page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <text class="title">个人中心</text>
    </view>

    <!-- 页面内容 -->
    <view class="content">
      <text>用户信息</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.profile-page {
  .custom-navbar {
    padding-top: env(safe-area-inset-top);
    height: calc(88rpx + env(safe-area-inset-top));
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .title {
      color: #fff;
      font-size: 36rpx;
      font-weight: bold;
    }
  }
}
</style>
```

### 空白布局页面

用于登录、启动页等不需要全局组件的页面：

```vue
<!-- pages/login/index.vue -->
<route lang="json5">
{
  layout: 'blank',  // 使用空白布局
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="login-page">
    <view class="logo">
      <image src="/static/logo.png" />
    </view>

    <view class="form">
      <input placeholder="请输入账号" />
      <input type="password" placeholder="请输入密码" />
      <button @click="handleLogin">登录</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleLogin = () => {
  // 登录逻辑
}
</script>
```

### Tabbar 页面布局

```vue
<!-- src/layouts/tabbar.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="tabbar-container">
      <!-- 页面内容区 -->
      <view class="page-content">
        <slot />
      </view>

      <!-- 底部 Tabbar 占位 -->
      <view class="tabbar-placeholder" />
    </view>

    <!-- 全局组件 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme()
</script>

<style lang="scss" scoped>
.tabbar-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .page-content {
    flex: 1;
    overflow-y: auto;
  }

  .tabbar-placeholder {
    height: calc(100rpx + env(safe-area-inset-bottom));
    flex-shrink: 0;
  }
}
</style>
```

## 最佳实践

### 1. 合理划分布局

```text
src/layouts/
├── default.vue    # 通用布局（大多数页面使用）
├── blank.vue      # 空白布局（登录、启动页）
├── tabbar.vue     # Tabbar 页面布局
├── modal.vue      # 弹窗页面布局（半屏页面）
└── webview.vue    # WebView 页面布局
```

### 2. 布局组件职责

```vue
<!-- 布局组件应该包含 -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 1. 页面插槽 -->
    <slot />

    <!-- 2. 全局 UI 组件 -->
    <wd-toast />
    <wd-notify />
    <wd-message-box />

    <!-- 3. 全局业务组件 -->
    <AuthModal />
    <UpdateModal />
  </wd-config-provider>
</template>

<!-- 布局组件不应该包含 -->
<!-- ❌ 具体业务逻辑 -->
<!-- ❌ 页面特定的 UI -->
<!-- ❌ 复杂的状态管理 -->
```

### 3. 避免布局嵌套

```vue
<!-- ❌ 不推荐：在页面中再次使用布局组件 -->
<template>
  <default-layout>
    <view>页面内容</view>
  </default-layout>
</template>

<!-- ✅ 推荐：通过 route 块配置布局 -->
<route lang="json5">
{
  layout: 'default',
}
</route>

<template>
  <view>页面内容</view>
</template>
```

### 4. 主题统一管理

```vue
<!-- 在布局中统一配置主题 -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme({
  // 所有使用该布局的页面都会应用这些主题变量
  colorTheme: '#0957DE',
  buttonPrimaryBgColor: '#0957DE',
})
</script>
```

## 常见问题

### 1. 布局不生效

**问题原因：**
- 布局文件名称错误
- 布局文件位置不正确
- route 块语法错误

**解决方案：**

```bash
# 确保布局文件在正确位置
src/layouts/default.vue

# 确保 route 块语法正确
<route lang="json5">
{
  layout: 'default',  // 布局名称对应文件名（不含 .vue）
}
</route>
```

### 2. 全局组件未生效

**问题原因：**
- 组件未在布局中注册
- 页面使用了空白布局

**解决方案：**

```vue
<!-- 确保在布局中声明全局组件 -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
    <wd-toast />      <!-- 必须声明 -->
    <wd-notify />     <!-- 必须声明 -->
    <wd-message-box /> <!-- 必须声明 -->
  </wd-config-provider>
</template>
```

### 3. 主题变量不生效

**问题原因：**
- 未使用 `wd-config-provider` 包裹
- 主题变量格式错误

**解决方案：**

```vue
<template>
  <!-- 必须使用 wd-config-provider 包裹 -->
  <wd-config-provider :theme-vars="themeVars">
    <slot />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme({
  // 使用正确的变量名格式
  colorTheme: '#0957DE',        // ✅ 驼峰命名
  'color-theme': '#0957DE',     // ❌ 不支持
})
</script>
```

### 4. 页面样式被布局影响

**问题原因：**
- 布局样式污染页面

**解决方案：**

```vue
<!-- 布局组件使用 scoped 样式 -->
<style lang="scss" scoped>
/* 样式只影响布局组件本身 */
</style>

<!-- 或使用 BEM 命名避免冲突 -->
<style lang="scss">
.layout {
  &__header { }
  &__main { }
  &__footer { }
}
</style>
```

### 5. 多布局切换问题

**问题原因：**
- 切换页面时布局状态未重置

**解决方案：**

```vue
<script lang="ts" setup>
import { onShow, onHide } from '@dcloudio/uni-app'

// 在布局组件中监听页面显示/隐藏
onShow(() => {
  // 页面显示时的逻辑
})

onHide(() => {
  // 页面隐藏时的逻辑
})
</script>
```

