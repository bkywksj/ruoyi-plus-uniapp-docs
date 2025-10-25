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
```
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

```
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

```
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
