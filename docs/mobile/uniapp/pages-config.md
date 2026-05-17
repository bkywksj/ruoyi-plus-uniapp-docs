# 页面配置 (pages.json)

## 概述

`pages.json` 是 uni-app 的页面路由配置文件，用于配置页面路径、窗口样式、原生导航栏、底部 tabBar 等。本项目使用 `pages.config.ts` 以 TypeScript 的方式管理配置，由 `@uni-helper/vite-plugin-uni-pages` 插件自动生成 `pages.json`。

## 配置文件位置

- **源配置文件**：`pages.config.ts`（根目录）
- **生成文件**：`src/pages.json`（自动生成，不要手动修改）

## 全局样式配置

### globalStyle

全局窗口样式配置，作用于所有页面：

```typescript
globalStyle: {
  navigationBarTitleText: 'ryplus-uni',  // 默认导航栏标题
  navigationStyle: 'custom',             // 导航栏样式: default | custom

  // 支付宝小程序特殊配置
  'mp-alipay': {
    transparentTitle: 'always',          // 透明标题栏
    titlePenetrate: 'YES'                // 标题栏点击穿透
  },

  // H5端配置
  h5: {
    titleNView: false                    // 不显示原生标题栏
  },

  // APP端配置
  'app-plus': {
    bounce: 'none'                       // 禁用页面弹性效果
  }
}
```

### 配置说明

#### navigationStyle

导航栏样式：

- **`default`**: 使用原生导航栏
- **`custom`**: 自定义导航栏（本项目使用）

**使用自定义导航栏的优势**：
- ✅ 样式完全可控
- ✅ 可以实现复杂的导航栏效果
- ✅ 跨平台统一体验

**注意事项**：
- 需要自己处理状态栏高度
- 需要自己实现返回按钮逻辑
- 各平台需要适配安全区域

#### 平台特殊配置

**支付宝小程序**：
```typescript
'mp-alipay': {
  transparentTitle: 'always',  // 标题栏透明（always | auto | none）
  titlePenetrate: 'YES'        // 标题栏区域可点击（YES | NO）
}
```

**H5**：
```typescript
h5: {
  titleNView: false            // 不显示原生导航栏
}
```

**App**：
```typescript
'app-plus': {
  bounce: 'none'               // 禁用页面弹性效果（防止下拉露出白屏）
}
```

## 组件自动导入（easycom）

### 配置

```typescript
easycom: {
  autoscan: true,              // 自动扫描 components 目录
  custom: {
    // WotUI 组件库自动导入规则
    '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue'
  }
}
```

### 工作原理

**自动扫描**：
```text
src/
├── components/
│   ├── UserCard/
│   │   └── UserCard.vue      // 自动识别为 <UserCard>
│   └── MyButton/
│       └── MyButton.vue      // 自动识别为 <MyButton>
```

**自定义规则**：
```typescript
custom: {
  // 匹配 wd-button、wd-input 等
  '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue'
}
```

使用时无需导入：
```vue
<template>
  <!-- 自动导入，无需 import -->
  <wd-button>按钮</wd-button>
  <UserCard :user="userInfo" />
</template>
```

### easycom 规则优先级

1. **pages.json 的 easycom.custom**
2. **components 目录自动扫描**
3. **uni_modules 目录扫描**

## 页面路由配置

### pages 数组

主包页面配置，数组第一项为应用入口页：

```json
{
  "pages": [
    {
      "path": "pages/index/index",       // 页面路径（入口页）
      "type": "home",                    // 页面类型
      "layout": "default"                // 布局模板
    },
    {
      "path": "pages/auth/login",        // 登录页
      "type": "page",
      "layout": "default"
    },
    {
      "path": "pages/my/settings",       // 设置页
      "type": "page",
      "layout": "default"
    }
  ]
}
```

### 页面独立配置

每个页面可以有独立的窗口样式：

```typescript
{
  path: 'pages/index/index',
  style: {
    navigationBarTitleText: '首页',      // 覆盖全局标题
    enablePullDownRefresh: true,        // 启用下拉刷新
    onReachBottomDistance: 50,          // 上拉触发距离
    backgroundTextStyle: 'dark',        // 下拉背景字体颜色
    navigationBarBackgroundColor: '#fff', // 导航栏背景色
    navigationBarTextStyle: 'black'     // 导航栏文字颜色
  }
}
```

### 常用页面配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `navigationBarTitleText` | String | 无 | 导航栏标题 |
| `navigationBarBackgroundColor` | HexColor | #000000 | 导航栏背景颜色 |
| `navigationBarTextStyle` | String | white | 导航栏标题颜色（white/black） |
| `backgroundColor` | HexColor | #ffffff | 窗口背景色 |
| `backgroundTextStyle` | String | dark | 下拉背景字体、loading 图的样式 |
| `enablePullDownRefresh` | Boolean | false | 是否开启下拉刷新 |
| `onReachBottomDistance` | Number | 50 | 上拉触发距离（px） |
| `disableScroll` | Boolean | false | 禁止页面滚动 |

## 分包配置

### subPackages

分包可以优化小程序首次加载速度：

```json
{
  "subPackages": [
    {
      "root": "pages-sub/admin",         // 分包根目录
      "pages": [
        {
          "path": "user/user",           // 完整路径: pages-sub/admin/user/user
          "type": "page",
          "layout": "default"
        }
      ]
    },
    {
      "root": "pages-sub/demo",
      "pages": [
        {
          "path": "components/button",
          "type": "page"
        }
      ]
    }
  ]
}
```

### 分包加载规则

**主包**：
- 启动时加载
- 包含 tabBar 页面
- 包含公共资源

**分包**：
- 按需加载
- 独立的页面和资源
- 可以引用主包资源

### 分包大小限制

**微信小程序**：
- 整个小程序所有分包大小不超过 **20MB**
- 单个分包/主包大小不超过 **2MB**

**支付宝小程序**：
- 整个小程序所有分包大小不超过 **16MB**
- 单个分包/主包大小不超过 **2MB**

### 分包预下载

```typescript
{
  preloadRule: {
    'pages/index/index': {              // 在首页时
      network: 'all',                   // 预下载网络类型
      packages: ['pages-sub/admin']     // 预下载分包
    }
  }
}
```

**network 取值**：
- `all`: 不限网络
- `wifi`: 仅 wifi 下预下载

## TabBar 配置

### 配置示例

注意：本项目使用自定义 TabBar，不使用原生 TabBar 配置。

如需使用原生 TabBar，配置如下：

```typescript
{
  tabBar: {
    color: '#999999',                   // 未选中文字颜色
    selectedColor: '#0957DE',           // 选中文字颜色
    backgroundColor: '#ffffff',         // 背景色
    borderStyle: 'black',               // 上边框颜色
    list: [
      {
        pagePath: 'pages/index/index',  // 页面路径
        text: '首页',                   // 按钮文字
        iconPath: 'static/tabbar/home.png',      // 未选中图标
        selectedIconPath: 'static/tabbar/home-active.png'  // 选中图标
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'static/tabbar/my.png',
        selectedIconPath: 'static/tabbar/my-active.png'
      }
    ]
  }
}
```

### TabBar 配置项

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `color` | HexColor | 是 | 未选中时文字颜色 |
| `selectedColor` | HexColor | 是 | 选中时文字颜色 |
| `backgroundColor` | HexColor | 是 | 背景色 |
| `borderStyle` | String | 否 | 上边框颜色（black/white） |
| `list` | Array | 是 | tab 列表（最少2个，最多5个） |

### TabBar item 配置

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `pagePath` | String | 是 | 页面路径 |
| `text` | String | 是 | 按钮文字 |
| `iconPath` | String | 否 | 未选中图标 |
| `selectedIconPath` | String | 否 | 选中图标 |

## 条件编译

### 全局样式条件编译

```typescript
globalStyle: {
  navigationBarTitleText: 'ryplus-uni',

  // #ifdef MP-WEIXIN
  navigationBarBackgroundColor: '#007AFF',
  // #endif

  // #ifdef H5
  navigationBarBackgroundColor: '#ffffff',
  // #endif
}
```

### 页面配置条件编译

```typescript
{
  path: 'pages/index/index',
  style: {
    // #ifdef MP-WEIXIN
    enablePullDownRefresh: true,
    // #endif

    // #ifdef H5
    enablePullDownRefresh: false,
    // #endif
  }
}
```

## 自动路由生成

本项目使用 `@uni-helper/vite-plugin-uni-pages` 插件，支持文件系统路由：

### 自动扫描

在 `src/pages/` 目录下创建页面，自动生成路由配置：

```text
src/pages/
├── index/
│   └── index.vue          → pages/index/index
├── auth/
│   ├── login.vue          → pages/auth/login
│   └── register.vue       → pages/auth/register
└── my/
    └── settings.vue       → pages/my/settings
```

### 页面元信息

在 Vue 文件中通过 `definePage` 配置页面：

```vue
<script setup lang="ts">
definePage({
  name: 'login',                        // 路由名称
  style: {
    navigationBarTitleText: '登录',     // 页面标题
    enablePullDownRefresh: false
  }
})
</script>
```

## 实际应用示例

### 示例 1：普通页面

```vue
<!-- pages/user/profile.vue -->
<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '个人资料',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
})
</script>

<template>
  <view class="profile-page">
    <text>用户资料</text>
  </view>
</template>
```

### 示例 2：启用下拉刷新

```vue
<!-- pages/index/index.vue -->
<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '首页',
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark'
  }
})

const onPullDownRefresh = () => {
  // 刷新逻辑
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
}
</script>
```

### 示例 3：禁用滚动

```vue
<!-- pages/map/index.vue -->
<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '地图',
    disableScroll: true               // 禁用页面滚动
  }
})
</script>
```

## 最佳实践

### 1. 合理使用分包

**主包放置**：
- TabBar 页面
- 高频访问页面
- 公共资源

**分包放置**：
- 低频功能页面
- 管理功能
- 独立业务模块

### 2. 使用预加载

```typescript
preloadRule: {
  'pages/index/index': {
    network: 'wifi',                    // wifi 下预加载
    packages: ['pages-sub/common']      // 预加载常用分包
  }
}
```

### 3. 图标资源优化

TabBar 图标建议：
- 使用 PNG 格式
- 图标尺寸：81x81 像素（3倍图）
- 文件大小：每个图标 < 40KB

### 4. 页面路径规范

```text
✅ 推荐：
pages/user/profile
pages/order/list
pages/product/detail

❌ 不推荐：
pages/userProfile
pages/orderList
pages/productDetail
```

## 常见问题

### 1. 修改 pages.config.ts 不生效？

**解决方案**：
- 确认修改的是 `pages.config.ts` 而非 `src/pages.json`
- 重启开发服务器
- 删除 `src/pages.json` 后重新启动

### 2. 分包页面跳转报错？

**解决方案**：
- 确认分包路径包含 root
- 使用完整路径：`/pages-sub/admin/user/user`
- 不要在 TabBar 页面使用分包

### 3. 自定义导航栏高度不对？

**解决方案**：
```typescript
// 获取系统信息
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const navigationBarHeight = 44  // 导航栏高度

const totalHeight = statusBarHeight + navigationBarHeight
```

### 4. easycom 组件不生效？

**解决方案**：
- 确认组件路径正确
- 组件名使用 PascalCase
- 重启开发服务器

### 5. 类型提示不正确？

**解决方案**：
- 检查 `src/types/uni-pages.d.ts` 是否存在
- 确认 `tsconfig.json` 包含类型文件
- 重新运行开发命令生成类型

### 6. 分包路径跳转失败？

**解决方案**：
```typescript
// ❌ 错误：缺少分包根目录前缀
uni.navigateTo({ url: '/user/user' })

// ✅ 正确：包含完整分包路径
uni.navigateTo({ url: '/pages-sub/admin/user/user' })
```

### 7. 热更新后页面配置丢失？

**解决方案**：
- 确保修改 `pages.config.ts` 而非生成的 `pages.json`
- 配置正确的 `dts` 输出路径
- 检查 Vite 插件顺序

## 插件高级配置

### UniPages 插件配置

本项目使用 `@uni-helper/vite-plugin-uni-pages` 插件自动生成路由配置。

#### 完整配置示例

```typescript
// vite/plugins/uni-pages.ts
import UniPages from '@uni-helper/vite-plugin-uni-pages'

export default (mode: string) => {
  return UniPages({
    // 直接设置主页
    homePage: 'pages/index/index',

    // 排除的组件路径
    exclude: ['**/components/**/**.*'],

    // 路由配置块语言
    routeBlockLang: 'json5',

    // 分包配置
    subPackages: [
      'src/pages-sub/admin',
      // 根据环境条件加载分包
      ...(mode === 'production' ? [] : ['src/pages-sub/demo']),
    ],

    // 类型声明文件输出路径
    dts: 'src/types/uni-pages.d.ts',

    // 页面元数据处理钩子
    onAfterMergePageMetaData(ctx) {
      // 处理主包页面
      ctx.pageMetaData.forEach((page) => {
        page.layout = 'default'
      })

      // 处理分包页面
      if (ctx.subPageMetaData) {
        ctx.subPageMetaData.forEach((subPackage) => {
          subPackage.pages.forEach((page) => {
            // 根据分包根目录设置布局
            if (subPackage.root === 'pages-sub/admin') {
              page.layout = 'default'
            }
          })
        })
      }
    },
  })
}
```

#### 配置项说明

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `homePage` | String | 首页路径，对应入口页面 |
| `exclude` | String[] | 排除的文件路径模式 |
| `routeBlockLang` | String | 路由配置块语言（json/json5/yaml） |
| `subPackages` | String[] | 分包目录列表 |
| `dts` | String | 类型声明文件输出路径 |
| `onAfterMergePageMetaData` | Function | 页面元数据合并后的钩子函数 |

### 布局系统集成

#### 布局模板定义

```vue
<!-- src/layouts/default.vue -->
<template>
  <view class="layout-default">
    <slot />
  </view>
</template>
```

#### 布局分配策略

通过 `onAfterMergePageMetaData` 钩子动态分配布局：

```typescript
onAfterMergePageMetaData(ctx) {
  ctx.pageMetaData.forEach((page) => {
    // 根据路径模式分配布局
    if (page.path.includes('auth/')) {
      page.layout = 'auth'        // 认证页面布局
    } else if (page.path.includes('admin/')) {
      page.layout = 'admin'       // 管理页面布局
    } else {
      page.layout = 'default'     // 默认布局
    }
  })
}
```

### 类型声明自动生成

插件会自动生成页面路由类型声明文件：

```typescript
// src/types/uni-pages.d.ts（自动生成）
interface NavigateToOptions {
  url: "/pages/index/index" |
       "/pages/auth/login" |
       "/pages/auth/register" |
       "/pages/my/settings" |
       "/pages-sub/admin/user/user";
}

interface RedirectToOptions extends NavigateToOptions {}
interface SwitchTabOptions {}
type ReLaunchOptions = NavigateToOptions | SwitchTabOptions;

declare interface Uni {
  navigateTo(options: UniNamespace.NavigateToOptions & NavigateToOptions): void;
  redirectTo(options: UniNamespace.RedirectToOptions & RedirectToOptions): void;
  switchTab(options: UniNamespace.SwitchTabOptions & SwitchTabOptions): void;
  reLaunch(options: UniNamespace.ReLaunchOptions & ReLaunchOptions): void;
}
```

**类型安全导航**：

```typescript
// ✅ IDE 自动补全和类型检查
uni.navigateTo({ url: '/pages/auth/login' })

// ❌ 类型错误：不存在的路径
uni.navigateTo({ url: '/pages/not-exist' })
```

## 页面生命周期配置

### 生命周期钩子

在页面中使用 UniApp 生命周期：

```vue
<script setup lang="ts">
import { onLoad, onShow, onHide, onUnload, onPullDownRefresh } from '@dcloudio/uni-app'

// 页面加载
onLoad((options) => {
  console.log('页面参数:', options)
})

// 页面显示
onShow(() => {
  console.log('页面显示')
})

// 页面隐藏
onHide(() => {
  console.log('页面隐藏')
})

// 页面卸载
onUnload(() => {
  console.log('页面卸载')
})

// 下拉刷新
onPullDownRefresh(() => {
  // 刷新逻辑
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
})
</script>
```

### 分享配置

在页面中配置分享功能：

```vue
<script lang="ts" setup>
const { handleShareAppMessage, handleShareTimeline } = useShare()

defineExpose({
  onShareAppMessage: handleShareAppMessage,
  onShareTimeline: handleShareTimeline,
})
</script>
```

## 路由参数处理

### 传递参数

```typescript
// 传递单个参数
uni.navigateTo({
  url: '/pages/user/detail?id=123'
})

// 传递多个参数
uni.navigateTo({
  url: `/pages/order/detail?orderId=${orderId}&type=${type}`
})

// 传递复杂对象（需编码）
const params = encodeURIComponent(JSON.stringify({ id: 1, name: 'test' }))
uni.navigateTo({
  url: `/pages/detail?params=${params}`
})
```

### 接收参数

```vue
<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

// 方式一：通过 onLoad 接收
onLoad((options) => {
  const id = options?.id
  const type = options?.type
})

// 方式二：通过 defineProps 接收（需配合插件）
const props = defineProps<{
  id?: string
  type?: string
}>()
</script>
```

### 复杂参数处理

```typescript
// 页面 A：传递复杂参数
const data = { userId: 123, filters: ['a', 'b'] }
uni.navigateTo({
  url: `/pages/list?data=${encodeURIComponent(JSON.stringify(data))}`
})

// 页面 B：接收并解析
onLoad((options) => {
  if (options?.data) {
    const data = JSON.parse(decodeURIComponent(options.data))
    console.log(data.userId)     // 123
    console.log(data.filters)    // ['a', 'b']
  }
})
```

## 路由守卫实现

### 全局路由拦截

```typescript
// utils/router-guard.ts
import { useAuth } from '@/composables/useAuth'

// 需要登录的页面路径
const authPages = [
  '/pages/my/settings',
  '/pages/order/list',
  '/pages-sub/admin/user/user'
]

// 路由拦截器
export const setupRouterGuard = () => {
  // 拦截 navigateTo
  const originalNavigateTo = uni.navigateTo
  uni.navigateTo = (options) => {
    if (authPages.some(path => options.url.startsWith(path))) {
      const auth = useAuth()
      if (!auth.isLoggedIn.value) {
        uni.navigateTo({
          url: `/pages/auth/login?redirect=${encodeURIComponent(options.url)}`
        })
        return
      }
    }
    return originalNavigateTo(options)
  }
}
```

### 页面级权限控制

```vue
<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

const auth = useAuth()

onLoad(() => {
  // 检查登录状态
  if (!auth.isLoggedIn.value) {
    uni.redirectTo({ url: '/pages/auth/login' })
    return
  }

  // 检查权限
  if (!auth.hasPermission('user:view')) {
    uni.showToast({ title: '无权限访问', icon: 'none' })
    uni.navigateBack()
    return
  }
})
</script>
```

## 路由动画配置

### 页面切换动画

```typescript
// 自定义页面切换动画
uni.navigateTo({
  url: '/pages/detail/index',
  animationType: 'slide-in-right',   // 动画类型
  animationDuration: 300             // 动画时长
})
```

### 常用动画类型

| 动画类型 | 说明 |
|----------|------|
| `slide-in-right` | 从右侧滑入（默认） |
| `slide-in-left` | 从左侧滑入 |
| `slide-in-top` | 从顶部滑入 |
| `slide-in-bottom` | 从底部滑入 |
| `fade-in` | 淡入 |
| `zoom-in` | 缩放进入 |
| `zoom-fade-in` | 缩放淡入 |
| `pop-in` | 弹出进入 |

### 返回动画

```typescript
uni.navigateBack({
  delta: 1,                          // 返回层数
  animationType: 'slide-out-right',  // 动画类型
  animationDuration: 300             // 动画时长
})
```

## 多窗口模式

### 页面栈管理

```typescript
// 获取当前页面栈
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]

// 获取上一页面
const prevPage = pages[pages.length - 2]

// 向上一页面传递数据
if (prevPage) {
  prevPage.$vm.receiveData = { id: 123 }
}
```

### 页面栈操作

```typescript
// 关闭当前页面，返回上一级
uni.navigateBack({ delta: 1 })

// 关闭当前页面，跳转到指定页面
uni.redirectTo({ url: '/pages/home/index' })

// 关闭所有页面，打开指定页面
uni.reLaunch({ url: '/pages/index/index' })

// 跳转到 tabBar 页面（关闭其他非 tabBar 页面）
uni.switchTab({ url: '/pages/index/index' })
```

## 性能优化

### 分包加载优化

**1. 合理划分分包**

```typescript
// 按业务模块划分
subPackages: [
  'src/pages-sub/admin',     // 管理模块
  'src/pages-sub/order',     // 订单模块
  'src/pages-sub/product',   // 商品模块
]
```

**2. 配置预加载**

```typescript
{
  preloadRule: {
    'pages/index/index': {
      network: 'wifi',
      packages: ['pages-sub/order']  // 在首页预加载订单分包
    },
    'pages/product/list': {
      network: 'all',
      packages: ['pages-sub/product'] // 在商品列表预加载商品分包
    }
  }
}
```

### 页面加载优化

**1. 懒加载组件**

```vue
<template>
  <view>
    <!-- 条件渲染重组件 -->
    <HeavyComponent v-if="showHeavy" />
  </view>
</template>

<script setup lang="ts">
const showHeavy = ref(false)

onMounted(() => {
  // 延迟加载重组件
  setTimeout(() => {
    showHeavy.value = true
  }, 100)
})
</script>
```

**2. 骨架屏优化**

```vue
<template>
  <view>
    <!-- 骨架屏 -->
    <wd-skeleton v-if="loading" :count="5" />
    <!-- 实际内容 -->
    <view v-else>
      <ContentList :data="list" />
    </view>
  </view>
</template>
```

### 资源加载优化

**1. 图片懒加载**

```vue
<template>
  <scroll-view scroll-y>
    <wd-img
      v-for="item in images"
      :key="item.id"
      :src="item.url"
      lazy-load
    />
  </scroll-view>
</template>
```

**2. 按需加载分包资源**

```typescript
// 分包内的图片资源
// ✅ 推荐：放在分包目录下
// pages-sub/admin/static/logo.png

// ❌ 避免：放在主包公共目录
// static/admin/logo.png
```

## 调试技巧

### 路由调试

```typescript
// 打印当前页面栈
const logPageStack = () => {
  const pages = getCurrentPages()
  console.log('页面栈:', pages.map(p => p.route))
}

// 打印页面参数
onLoad((options) => {
  console.log('页面路径:', getCurrentPages().slice(-1)[0].route)
  console.log('页面参数:', options)
})
```

### 配置验证

```bash
# 查看生成的 pages.json
cat src/pages.json

# 验证分包配置
npm run dev:mp-weixin
# 在微信开发者工具中查看"详情" -> "代码依赖分析"
```

### 常见调试命令

```bash
# 重新生成路由配置
rm src/pages.json && npm run dev:h5

# 清除缓存重启
rm -rf node_modules/.vite && npm run dev:h5

# 检查类型声明
cat src/types/uni-pages.d.ts
```

## 迁移指南

### 从 pages.json 迁移

**1. 创建 pages.config.ts**

```typescript
// pages.config.ts
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    // 从 pages.json 复制全局样式配置
  },
  easycom: {
    // 从 pages.json 复制 easycom 配置
  }
})
```

**2. 迁移页面配置**

```vue
<!-- 在页面文件中添加 definePage -->
<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '页面标题',
    // 其他样式配置
  }
})
</script>
```

**3. 删除原 pages.json**

```bash
rm src/pages.json
```

### 从其他路由方案迁移

**vue-router 风格迁移**：

```typescript
// ❌ vue-router 风格
const routes = [
  { path: '/user/:id', component: UserDetail }
]

// ✅ uni-app 风格
// 1. 创建 pages/user/detail.vue
// 2. 使用查询参数传递 id
uni.navigateTo({ url: `/pages/user/detail?id=${id}` })
```

## 与 TypeScript 集成

### 路由参数类型

```typescript
// types/router.ts
export interface UserDetailParams {
  id: string
  type?: 'view' | 'edit'
}

export interface OrderListParams {
  status?: string
  page?: number
}
```

### 类型安全导航函数

```typescript
// utils/router.ts
import type { UserDetailParams, OrderListParams } from '@/types/router'

export const router = {
  toUserDetail(params: UserDetailParams) {
    const query = new URLSearchParams(params as any).toString()
    uni.navigateTo({ url: `/pages/user/detail?${query}` })
  },

  toOrderList(params?: OrderListParams) {
    const query = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : ''
    uni.navigateTo({ url: `/pages/order/list${query}` })
  }
}

// 使用
router.toUserDetail({ id: '123', type: 'edit' })
router.toOrderList({ status: 'pending', page: 1 })
```

### Props 类型定义

```vue
<script setup lang="ts">
interface PageProps {
  id?: string
  type?: 'view' | 'edit'
  redirect?: string
}

const props = withDefaults(defineProps<PageProps>(), {
  type: 'view'
})

// 使用 props
console.log(props.id, props.type)
</script>
```

## 安全配置

### 路由白名单

```typescript
// 免登录页面白名单
const whiteList = [
  '/pages/index/index',
  '/pages/auth/login',
  '/pages/auth/register',
  '/pages/about/index'
]

// 检查是否需要登录
const needAuth = (url: string) => {
  return !whiteList.some(path => url.startsWith(path))
}
```

### 敏感页面保护

```typescript
// 敏感页面配置
const sensitivePages = [
  '/pages/my/settings',
  '/pages/my/security',
  '/pages-sub/admin/user/user'
]

// 访问敏感页面时重新验证身份
const checkSensitivePage = async (url: string) => {
  if (sensitivePages.some(path => url.startsWith(path))) {
    const verified = await verifyIdentity()
    if (!verified) {
      uni.showToast({ title: '身份验证失败', icon: 'none' })
      return false
    }
  }
  return true
}
```

## 配置示例汇总

### 完整 pages.config.ts 示例

```typescript
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationBarTitleText: 'RuoYi Plus',
    navigationStyle: 'custom',
    backgroundColor: '#f5f5f5',

    'mp-alipay': {
      transparentTitle: 'always',
      titlePenetrate: 'YES'
    },

    'h5': {
      titleNView: false
    },

    'app-plus': {
      bounce: 'none'
    }
  },

  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue',
      '^Custom(.*)': '@/components/Custom$1/Custom$1.vue'
    }
  }
})
```

### 完整插件配置示例

```typescript
// vite/plugins/uni-pages.ts
import UniPages from '@uni-helper/vite-plugin-uni-pages'

export default (mode: string) => {
  const isDev = mode === 'development'

  return UniPages({
    homePage: 'pages/index/index',
    exclude: ['**/components/**/**.*'],
    routeBlockLang: 'json5',

    subPackages: [
      'src/pages-sub/admin',
      ...(isDev ? ['src/pages-sub/demo'] : []),
    ],

    dts: 'src/types/uni-pages.d.ts',

    onAfterMergePageMetaData(ctx) {
      // 设置默认布局
      ctx.pageMetaData.forEach((page) => {
        page.layout = page.layout || 'default'
      })

      // 处理分包
      ctx.subPageMetaData?.forEach((sub) => {
        sub.pages.forEach((page) => {
          page.layout = page.layout || 'default'
        })
      })
    },
  })
}
```
