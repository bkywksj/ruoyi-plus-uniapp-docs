# Default 默认布局

## 介绍

Default 布局是 RuoYi-Plus-UniApp 框架中最基础、最常用的页面布局模板。它通过 UniLayouts 插件实现,为应用提供了统一的布局容器,内置了主题系统、全局组件和页面配置能力。

Default 布局采用极简设计理念,只包含必要的全局组件(Toast、Notify、MessageBox、AuthModal),并通过插槽将页面内容完全交由页面组件控制。这种设计使得页面具有最大的灵活性,适用于各类业务场景。

**核心特性:**

- **主题集成** - 内置 `wd-config-provider`,提供全局主题配置能力,支持亮色/暗色模式切换
- **全局组件** - 统一管理 Toast(轻提示)、Notify(消息通知)、MessageBox(确认弹窗)、AuthModal(授权弹窗)
- **灵活插槽** - 使用 `<slot />` 提供完全的内容自由度,页面可以自定义任意布局
- **路由块配置** - 支持通过 `<route>` 块配置页面样式、元数据、预加载规则等
- **平台适配** - 支持 App、H5、微信小程序、支付宝小程序等多平台特定配置
- **零侵入设计** - 布局对页面内容零侵入,页面无需关心全局组件的存在

Default 布局是应用中使用最广泛的布局,适用于登录页、详情页、表单页、列表页等绝大多数场景。

## 布局结构

### 基本结构

Default 布局采用三层嵌套结构:

```
wd-config-provider (主题容器)
  └─ slot (页面内容插槽)
  └─ wd-toast (轻提示)
  └─ wd-notify (消息通知)
  └─ wd-message-box (确认弹窗)
  └─ AuthModal (授权弹窗)
```

**结构说明:**

1. **wd-config-provider**: 最外层的主题提供者,负责向所有子组件注入主题变量
2. **slot**: 页面内容插槽,页面组件的内容会被插入到这里
3. **全局组件**: 四个全局组件始终存在,通过响应式状态控制显示/隐藏

### 源码实现

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!--  内容插槽  -->
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

**技术实现:**

- 使用 `useTheme` Composable 获取主题配置
- 通过 `:theme-vars` 属性将主题变量注入到 `wd-config-provider`
- 全局组件无需传递 props,通过内部状态管理控制

## 全局组件

Default 布局内置了四个全局组件,提供应用级别的交互反馈能力。

### 1. wd-toast 轻提示

用于显示操作反馈、加载状态等轻量级提示信息。

**使用方式:**

```vue
<template>
  <view class="page">
    <wd-button @click="showToast">显示提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showToast = () => {
  toast.success('操作成功!')
}
</script>
```

**常用方法:**

- `toast.success(message)` - 成功提示
- `toast.error(message)` - 错误提示
- `toast.warning(message)` - 警告提示
- `toast.info(message)` - 信息提示
- `toast.loading(message)` - 加载提示
- `toast.close()` - 关闭提示

### 2. wd-notify 消息通知

用于显示系统通知、重要消息等需要用户注意的信息。

**使用方式:**

```vue
<template>
  <view class="page">
    <wd-button @click="showNotify">显示通知</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useNotify } from '@/wd'

const notify = useNotify()

const showNotify = () => {
  notify({
    type: 'success',
    message: '你有一条新消息',
    duration: 3000,
  })
}
</script>
```

**配置选项:**

- `type` - 通知类型: `'primary'` | `'success'` | `'warning'` | `'error'` | `'info'`
- `message` - 通知内容
- `duration` - 显示时长(毫秒),默认 3000
- `position` - 显示位置: `'top'` | `'bottom'`

### 3. wd-message-box 确认弹窗

用于需要用户确认的操作,如删除、退出登录等。

**使用方式:**

```vue
<template>
  <view class="page">
    <wd-button @click="confirmDelete">删除</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessageBox } from '@/wd'

const messageBox = useMessageBox()

const confirmDelete = () => {
  messageBox.confirm({
    title: '确认删除',
    message: '删除后将无法恢复,确定要删除吗?',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
  }).then(() => {
    // 用户点击确定
    console.log('执行删除操作')
  }).catch(() => {
    // 用户点击取消
    console.log('取消删除')
  })
}
</script>
```

**常用方法:**

- `messageBox.confirm(options)` - 确认对话框
- `messageBox.alert(options)` - 提示对话框
- `messageBox.prompt(options)` - 输入对话框

### 4. AuthModal 授权弹窗

用于微信小程序等平台的用户信息授权,包括头像、昵称、手机号授权。

**使用方式:**

```vue
<template>
  <view class="page">
    <wd-button @click="openAuthModal">授权登录</wd-button>
  </view>
</template>

<script lang="ts" setup>
const userStore = useUserStore()

const openAuthModal = () => {
  // 打开授权弹窗
  userStore.authModalVisible = true
}
</script>
```

**功能特性:**

- 支持头像选择(微信小程序使用 `open-type="chooseAvatar"`,其他平台使用文件上传)
- 支持昵称输入(使用 `type="nickname"` 的输入框)
- 支持手机号授权(微信小程序使用 `open-type="getPhoneNumber"`)
- 自动上传头像到服务器
- 自动更新用户信息到 Store

**平台差异:**

```typescript
// 微信小程序 - 使用原生授权按钮
// #ifdef MP-WEIXIN
<wd-button
  open-type="chooseAvatar"
  @chooseavatar="chooseavatar"
/>
<wd-button
  open-type="getPhoneNumber"
  @getphonenumber="handlePhoneAuth"
/>
// #endif

// 其他平台 - 使用文件上传
// #ifndef MP-WEIXIN
const res = await upload.chooseFile({ accept: 'image', maxCount: 1 })
upload.fastUpload(res[0].path, { ... })
// #endif
```

## 主题配置

Default 布局通过 `useTheme` Composable 提供全局主题配置能力。

### 基本用法

```vue
<script lang="ts" setup>
// 使用默认主题
const { themeVars } = useTheme()
</script>
```

### 局部主题定制

在 `default.vue` 中可以传递局部覆盖配置:

```vue
<script lang="ts" setup>
const { themeVars } = useTheme({
  // 覆盖主题色
  colorTheme: '#751937',
  // 覆盖成功色
  colorSuccess: '#52C41A',
  // 覆盖 Toast 样式
  toastPadding: '24rpx 32rpx',
  toastFontSize: '28rpx',
  // 覆盖 MessageBox 样式
  messageBoxTitleColor: '#333333',
  messageBoxContentColor: '#666666',
})
</script>
```

### 全局主题管理

在应用初始化时设置全局主题:

```typescript
// src/main.ts
import { useTheme } from '@/composables/useTheme'

const { setGlobalTheme } = useTheme()

// 设置全局主题
setGlobalTheme({
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
  colorWarning: '#FFBA00',
  colorDanger: '#F56C6C',
})
```

### 主题变量列表

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `colorTheme` | 主题色调 | `'#409EFF'` |
| `colorSuccess` | 成功色调 | `'#52C41A'` |
| `colorWarning` | 警告色调 | `'#FFBA00'` |
| `colorDanger` | 危险色调 | `'#F56C6C'` |
| `loadingSize` | Loading 大小 | `'40rpx'` |
| `messageBoxTitleColor` | MessageBox 标题颜色 | `'#333333'` |
| `messageBoxContentColor` | MessageBox 内容颜色 | `'#666666'` |
| `notifyPadding` | Notify 内边距 | `'24rpx 32rpx'` |
| `notifyFontSize` | Notify 字体大小 | `'28rpx'` |
| `navbarTitleFontSize` | 导航栏标题字体大小 | `'32rpx'` |
| `navbarTitleFontWeight` | 导航栏标题字体粗细 | `'normal'` |

### 主题优先级

主题配置按以下优先级合并(从低到高):

1. **默认主题** - `DEFAULT_THEME` 中定义的默认配置
2. **全局覆盖** - 通过 `setGlobalTheme()` 设置的全局配置
3. **局部覆盖** - 通过 `useTheme(localOverrides)` 传递的局部配置

```typescript
// 最终生效的主题配置
const themeVars = {
  ...DEFAULT_THEME,        // 默认主题(优先级最低)
  ...globalThemeOverrides, // 全局覆盖(优先级中)
  ...localOverrides,       // 局部覆盖(优先级最高)
}
```

## 路由块配置

Default 布局支持通过 `<route>` 块在页面文件中配置页面属性、样式和元数据。

### 基本配置

```vue
<route lang="json5">
{
  // 指定使用的布局
  layout: 'default',

  // 页面类型
  type: 'page',

  // 页面样式配置
  style: {
    navigationBarTitleText: '页面标题',
    navigationStyle: 'default',
    enablePullDownRefresh: false,
  },
}
</route>

<template>
  <view class="page">
    <!-- 页面内容 -->
  </view>
</template>

<script lang="ts" setup>
// 页面逻辑
</script>
```

### 完整配置示例

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
      colorType: 1 // 0-无阴影, 1-有阴影
    },

    // 窗口配置
    backgroundColor: '#ffffff',
    backgroundTextStyle: 'dark', // 'dark' | 'light'
    backgroundColorTop: '#ffffff', // 仅iOS
    backgroundColorBottom: '#ffffff', // 仅iOS

    // 下拉刷新
    enablePullDownRefresh: false,
    onReachBottomDistance: 50,

    // 其他配置
    disableScroll: false,
    titlePenetrate: 'NO', // 'YES' | 'NO'
  },

  // ===== 自定义数据 =====
  meta: {
    auth: true, // 是否需要登录
    title: '自定义标题',
    roles: ['admin', 'user'], // 权限控制
    keepAlive: true, // 是否缓存页面
  },
}
</route>
```

### 导航栏配置

#### 默认导航栏

使用系统默认的导航栏样式:

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '用户信息',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
}
</route>
```

#### 自定义导航栏

隐藏系统导航栏,使用自定义导航组件:

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <wd-navbar title="自定义标题" :fixed="true" />

    <!-- 页面内容 -->
    <view class="content">
      <!-- ... -->
    </view>
  </view>
</template>
```

**注意事项:**

- 使用 `navigationStyle: 'custom'` 后,需要自行处理导航栏高度和状态栏安全区
- 自定义导航栏建议使用 `wd-navbar` 组件,已处理好各平台适配

### 下拉刷新配置

#### 启用下拉刷新

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    enablePullDownRefresh: true,
    backgroundTextStyle: 'dark',
  },
}
</route>

<template>
  <view class="page">
    <!-- 页面内容 -->
  </view>
</template>

<script lang="ts" setup>
import { onPullDownRefresh } from '@dcloudio/uni-app'

// 监听下拉刷新事件
onPullDownRefresh(() => {
  console.log('触发下拉刷新')

  // 执行刷新逻辑
  loadData().then(() => {
    // 停止下拉刷新动画
    uni.stopPullDownRefresh()
  })
})

const loadData = async () => {
  // 加载数据
}
</script>
```

#### H5 平台自定义下拉刷新样式

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    enablePullDownRefresh: true,
    h5: {
      pullToRefresh: {
        color: '#2bd009', // 下拉圈颜色
      },
    },
  },
}
</route>
```

### 上拉加载配置

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    onReachBottomDistance: 50, // 距底部50px触发
  },
}
</route>

<script lang="ts" setup>
import { onReachBottom } from '@dcloudio/uni-app'

const hasMore = ref(true)
const loading = ref(false)

// 监听上拉触底事件
onReachBottom(() => {
  if (!hasMore.value || loading.value) return

  console.log('触发上拉加载')
  loadMore()
})

const loadMore = async () => {
  loading.value = true

  try {
    // 加载更多数据
    const res = await fetchMoreData()

    if (res.list.length === 0) {
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}
</script>
```

### 页面元数据配置

通过 `meta` 字段可以存储任意自定义数据,在组件中通过路由对象访问。

```vue
<route lang="json5">
{
  layout: 'default',
  meta: {
    // 权限控制
    auth: true,
    roles: ['admin', 'user'],

    // 页面信息
    title: '用户管理',
    description: '用户信息管理页面',
    keywords: 'user,admin,management',

    // 缓存配置
    keepAlive: true,

    // 页面动画
    transition: 'slide-left',

    // 页面层级
    level: 2,

    // 分析追踪
    analytics: {
      track: true,
      category: 'user',
    },
  },
}
</route>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  // 访问页面元数据
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const meta = currentPage.$route?.meta

  console.log('页面标题:', meta?.title)
  console.log('需要登录:', meta?.auth)
  console.log('权限角色:', meta?.roles)
})
</script>
```

### 平台特定配置

#### App 平台配置

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    'app-plus': {
      // 页面回弹效果
      bounce: 'vertical', // 'none' | 'vertical' | 'horizontal'

      // 滚动条显示
      scrollIndicator: 'none', // 'none' | 'default'

      // 窗口动画
      animationType: 'slide-in-right',
      animationDuration: 300,

      // 原生导航栏按钮
      titleNView: {
        buttons: [
          {
            text: '分享',
            fontSize: '16px',
            color: '#333333',
            float: 'right',
          },
        ],
      },

      // 原生子窗体(subNVue)
      subNVues: [
        {
          id: 'drawer',
          path: 'pages/drawer',
          style: {
            position: 'popup',
            width: '50%',
          },
        },
      ],
    },
  },
}
</route>
```

#### H5 平台配置

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    h5: {
      // 下拉刷新
      pullToRefresh: {
        color: '#2bd009',
      },

      // 导航栏
      titleNView: {
        backgroundColor: '#f7f7f7',
        buttons: [
          {
            text: '分享',
            type: 'share',
          },
        ],
      },
    },
  },
}
</route>
```

#### 微信小程序配置

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    'mp-weixin': {
      // 页面间共享元素
      shareElement: 'element-id',
    },
  },
}
</route>
```

#### 支付宝小程序配置

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    'mp-alipay': {
      // 允许垂直回弹
      allowsBounceVertical: 'YES',

      // 透明标题
      transparentTitle: 'always',

      // 标题穿透
      titlePenetrate: 'YES',
    },
  },
}
</route>
```

## 使用场景

### 1. 登录页

登录页通常使用自定义导航栏,隐藏系统导航:

```vue
<route lang="json5">
{
  layout: 'default',
  type: 'page',
  style: {
    navigationStyle: 'custom',
    backgroundColor: '#ffffff',
  },
  meta: {
    auth: false, // 无需登录
  },
}
</route>

<template>
  <view class="login-page">
    <!-- 自定义导航栏 -->
    <wd-navbar :fixed="false" title="登录" />

    <!-- 登录表单 -->
    <view class="form-container">
      <wd-form ref="formRef" :model="form">
        <wd-input
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
        />
        <wd-input
          v-model="form.password"
          label="密码"
          type="password"
          placeholder="请输入密码"
        />
      </wd-form>

      <wd-button type="primary" block @click="handleLogin">
        登录
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const form = ref({
  username: '',
  password: '',
})

const handleLogin = async () => {
  toast.loading('登录中...')

  try {
    // 执行登录逻辑
    await login(form.value)
    toast.success('登录成功!')

    // 跳转到首页
    uni.switchTab({
      url: '/pages/index/index',
    })
  } catch (error) {
    toast.error('登录失败,请重试')
  }
}
</script>
```

### 2. 列表页(带下拉刷新和上拉加载)

```vue
<route lang="json5">
{
  layout: 'default',
  type: 'page',
  style: {
    navigationBarTitleText: '用户列表',
    enablePullDownRefresh: true,
    onReachBottomDistance: 50,
  },
  meta: {
    auth: true,
    roles: ['admin'],
  },
}
</route>

<template>
  <view class="list-page">
    <!-- 列表内容 -->
    <view v-for="item in list" :key="item.id" class="list-item">
      {{ item.name }}
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <wd-loading />
    </view>

    <!-- 没有更多 -->
    <view v-if="!hasMore" class="no-more">
      没有更多数据了
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

const list = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

// 页面加载
onLoad(() => {
  loadData()
})

// 下拉刷新
onPullDownRefresh(() => {
  page.value = 1
  hasMore.value = true
  loadData().then(() => {
    uni.stopPullDownRefresh()
  })
})

// 上拉加载
onReachBottom(() => {
  if (!hasMore.value || loading.value) return
  page.value++
  loadData()
})

// 加载数据
const loadData = async () => {
  loading.value = true

  try {
    const res = await fetchList({
      page: page.value,
      size: 20,
    })

    if (page.value === 1) {
      list.value = res.list
    } else {
      list.value.push(...res.list)
    }

    hasMore.value = res.list.length === 20
  } finally {
    loading.value = false
  }
}
</script>
```

### 3. 详情页

```vue
<route lang="json5">
{
  layout: 'default',
  type: 'page',
  style: {
    navigationBarTitleText: '用户详情',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
  meta: {
    auth: true,
    keepAlive: false, // 不缓存,每次进入重新加载
  },
}
</route>

<template>
  <view class="detail-page">
    <!-- 用户信息 -->
    <view class="user-info">
      <image :src="userInfo.avatar" class="avatar" />
      <text class="name">{{ userInfo.name }}</text>
      <text class="bio">{{ userInfo.bio }}</text>
    </view>

    <!-- 详细信息 -->
    <view class="detail-info">
      <wd-cell-group>
        <wd-cell title="手机号" :value="userInfo.phone" />
        <wd-cell title="邮箱" :value="userInfo.email" />
        <wd-cell title="地址" :value="userInfo.address" />
      </wd-cell-group>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <wd-button type="primary" block @click="handleEdit">
        编辑
      </wd-button>
      <wd-button type="error" block @click="handleDelete">
        删除
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMessageBox, useToast } from '@/wd'

const messageBox = useMessageBox()
const toast = useToast()
const userInfo = ref({})

// 页面加载
onLoad((options) => {
  const userId = options.id
  loadUserInfo(userId)
})

// 加载用户信息
const loadUserInfo = async (userId: string) => {
  toast.loading('加载中...')

  try {
    const [err, data] = await getUserInfo(userId)
    if (!err) {
      userInfo.value = data
      toast.close()
    }
  } catch (error) {
    toast.error('加载失败')
  }
}

// 编辑
const handleEdit = () => {
  uni.navigateTo({
    url: `/pages/user/edit?id=${userInfo.value.id}`,
  })
}

// 删除
const handleDelete = () => {
  messageBox.confirm({
    title: '确认删除',
    message: '删除后将无法恢复,确定要删除吗?',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
  }).then(async () => {
    toast.loading('删除中...')

    try {
      await deleteUser(userInfo.value.id)
      toast.success('删除成功!')

      // 返回上一页
      uni.navigateBack()
    } catch (error) {
      toast.error('删除失败')
    }
  })
}
</script>
```

### 4. 表单页

```vue
<route lang="json5">
{
  layout: 'default',
  type: 'page',
  style: {
    navigationBarTitleText: '编辑资料',
    navigationStyle: 'default',
  },
  meta: {
    auth: true,
  },
}
</route>

<template>
  <view class="form-page">
    <wd-form ref="formRef" :model="form" :rules="rules">
      <wd-input
        v-model="form.name"
        label="姓名"
        prop="name"
        placeholder="请输入姓名"
        required
      />

      <wd-input
        v-model="form.phone"
        label="手机号"
        prop="phone"
        type="number"
        placeholder="请输入手机号"
        required
      />

      <wd-input
        v-model="form.email"
        label="邮箱"
        prop="email"
        placeholder="请输入邮箱"
      />

      <wd-textarea
        v-model="form.bio"
        label="个人简介"
        placeholder="请输入个人简介"
        :maxlength="200"
        show-word-limit
      />
    </wd-form>

    <!-- 提交按钮 -->
    <view class="submit-btn">
      <wd-button type="primary" block @click="handleSubmit">
        保存
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from '@/wd'

const toast = useToast()
const formRef = ref()
const form = ref({
  name: '',
  phone: '',
  email: '',
  bio: '',
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名' },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
  ],
  email: [
    { pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '邮箱格式不正确' },
  ],
}

// 提交表单
const handleSubmit = async () => {
  // 验证表单
  const valid = await formRef.value.validate()
  if (!valid) return

  toast.loading('保存中...')

  try {
    await updateUserProfile(form.value)
    toast.success('保存成功!')

    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (error) {
    toast.error('保存失败')
  }
}
</script>
```

## 最佳实践

### 1. 合理使用导航栏配置

**推荐做法:**

- 大多数页面使用默认导航栏 (`navigationStyle: 'default'`)
- 只在需要特殊样式的页面(如登录页、欢迎页)使用自定义导航栏
- 使用自定义导航栏时,优先使用 `wd-navbar` 组件

**示例:**

```vue
<!-- ✅ 推荐: 普通页面使用默认导航栏 -->
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '用户列表',
  },
}
</route>

<!-- ✅ 推荐: 特殊页面使用自定义导航栏 -->
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="page">
    <wd-navbar title="自定义标题" :fixed="true" />
    <!-- 页面内容 -->
  </view>
</template>
```

**避免:**

```vue
<!-- ❌ 避免: 不必要的自定义导航栏 -->
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="page">
    <!-- 手动实现导航栏,没有必要 -->
    <view class="custom-navbar">
      <text>用户列表</text>
    </view>
  </view>
</template>
```

### 2. 统一使用全局组件

**推荐做法:**

使用 Default 布局内置的全局组件,通过 Composable API 调用:

```vue
<script lang="ts" setup>
import { useToast, useNotify, useMessageBox } from '@/wd'

const toast = useToast()
const notify = useNotify()
const messageBox = useMessageBox()

// ✅ 推荐: 使用全局 Toast
const handleSuccess = () => {
  toast.success('操作成功!')
}

// ✅ 推荐: 使用全局 Notify
const showNotification = () => {
  notify({
    type: 'info',
    message: '你有一条新消息',
  })
}

// ✅ 推荐: 使用全局 MessageBox
const confirmAction = () => {
  messageBox.confirm({
    title: '确认操作',
    message: '确定要执行此操作吗?',
  }).then(() => {
    // 确认操作
  })
}
</script>
```

**避免:**

```vue
<!-- ❌ 避免: 在页面中单独使用组件 -->
<template>
  <view class="page">
    <!-- 不要在页面中重复声明这些组件 -->
    <wd-toast ref="toastRef" />
    <wd-notify ref="notifyRef" />
    <wd-message-box ref="messageBoxRef" />
  </view>
</template>

<script lang="ts" setup>
// ❌ 避免: 通过 ref 操作组件
const toastRef = ref()
const handleSuccess = () => {
  toastRef.value.show('操作成功!')
}
</script>
```

### 3. 合理配置页面元数据

**推荐做法:**

充分利用 `meta` 字段存储页面元数据,用于权限控制、页面缓存等:

```vue
<route lang="json5">
{
  layout: 'default',
  meta: {
    // ✅ 推荐: 明确标注是否需要登录
    auth: true,

    // ✅ 推荐: 配置权限角色
    roles: ['admin', 'user'],

    // ✅ 推荐: 配置页面缓存策略
    keepAlive: true, // 列表页缓存

    // ✅ 推荐: 添加页面描述信息
    title: '用户管理',
    description: '用户信息管理页面',
  },
}
</route>
```

**避免:**

```vue
<!-- ❌ 避免: 元数据配置不完整 -->
<route lang="json5">
{
  layout: 'default',
  // 缺少 meta 配置,无法进行权限控制
}
</route>

<!-- ❌ 避免: 在代码中硬编码权限逻辑 -->
<script lang="ts" setup>
onLoad(() => {
  // 不推荐在代码中判断权限
  const userStore = useUserStore()
  if (!userStore.isLogin) {
    uni.navigateTo({ url: '/pages/auth/login' })
  }
})
</script>
```

### 4. 平台特定配置分离

**推荐做法:**

将平台特定配置集中在 `style` 的平台字段中:

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    // ✅ 推荐: 通用配置
    navigationBarTitleText: '页面标题',
    enablePullDownRefresh: true,

    // ✅ 推荐: App 平台特定配置
    'app-plus': {
      bounce: 'vertical',
      animationType: 'slide-in-right',
    },

    // ✅ 推荐: H5 平台特定配置
    h5: {
      pullToRefresh: {
        color: '#2bd009',
      },
    },

    // ✅ 推荐: 小程序平台特定配置
    'mp-weixin': {
      shareElement: 'element-id',
    },
  },
}
</route>
```

**避免:**

```vue
<!-- ❌ 避免: 在代码中使用条件编译处理平台差异 -->
<script lang="ts" setup>
onLoad(() => {
  // #ifdef APP-PLUS
  // App 特定逻辑
  // #endif

  // #ifdef H5
  // H5 特定逻辑
  // #endif
})
</script>
```

### 5. 主题配置层级化

**推荐做法:**

- 在应用入口设置**全局主题**
- 在布局文件设置**布局级主题**(如果需要)
- 在特定页面设置**页面级主题覆盖**(极少使用)

```typescript
// ✅ 推荐: src/main.ts - 全局主题配置
import { useTheme } from '@/composables/useTheme'

const { setGlobalTheme } = useTheme()
setGlobalTheme({
  colorTheme: '#409EFF',
  colorSuccess: '#52C41A',
})

// ✅ 推荐: src/layouts/default.vue - 布局级主题(通常不需要)
const { themeVars } = useTheme({
  // 只在需要时覆盖
})

// ⚠️ 谨慎: 页面级主题覆盖(极少使用)
// 只在特定页面需要完全不同的主题时使用
```

**避免:**

```vue
<!-- ❌ 避免: 在每个页面都配置主题 -->
<template>
  <wd-config-provider :theme-vars="customTheme">
    <!-- 页面内容 -->
  </wd-config-provider>
</template>

<script lang="ts" setup>
// ❌ 避免: 重复配置主题
const customTheme = {
  colorTheme: '#409EFF',
  // ...
}
</script>
```

## 常见问题

### 1. 为什么全局组件不显示?

**问题原因:**

全局组件(Toast、Notify、MessageBox)都是通过响应式状态控制显示,如果使用方式不正确会导致组件不显示。

**解决方案:**

确保使用正确的 Composable API:

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

// ✅ 正确: 使用 Composable API
const toast = useToast()
toast.success('操作成功!')

// ❌ 错误: 直接调用 uni.showToast
uni.showToast({ title: '操作成功' })

// ❌ 错误: 在页面中单独声明组件
// <wd-toast ref="toastRef" />
</script>
```

### 2. 如何在 Default 布局中使用自定义导航栏?

**问题原因:**

使用 `navigationStyle: 'custom'` 后,系统导航栏被隐藏,需要自行处理导航栏高度和状态栏。

**解决方案:**

使用 `wd-navbar` 组件,已处理好各平台适配:

```vue
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
  },
}
</route>

<template>
  <view class="page">
    <!-- ✅ 推荐: 使用 wd-navbar 组件 -->
    <wd-navbar
      title="页面标题"
      :fixed="true"
      left-arrow
      @click-left="handleBack"
    />

    <!-- 页面内容需要预留导航栏高度 -->
    <view :style="{ paddingTop: navbarHeight + 'px' }">
      <!-- 内容 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// 计算导航栏高度(状态栏高度 + 导航栏高度)
const navbarHeight = computed(() => {
  const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
  return statusBarHeight + 44 // 44px 是导航栏固定高度
})

const handleBack = () => {
  uni.navigateBack()
}
</script>
```

### 3. 下拉刷新和上拉加载同时使用时出现冲突?

**问题原因:**

下拉刷新和上拉加载同时触发,导致重复请求或状态混乱。

**解决方案:**

使用加载状态标志,避免同时触发:

```vue
<script lang="ts" setup>
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

const loading = ref(false) // 加载状态标志
const hasMore = ref(true)
const page = ref(1)

// 下拉刷新
onPullDownRefresh(() => {
  // ✅ 检查加载状态
  if (loading.value) {
    uni.stopPullDownRefresh()
    return
  }

  page.value = 1
  hasMore.value = true
  loadData().then(() => {
    uni.stopPullDownRefresh()
  })
})

// 上拉加载
onReachBottom(() => {
  // ✅ 检查加载状态和是否有更多数据
  if (!hasMore.value || loading.value) return

  page.value++
  loadData()
})

const loadData = async () => {
  loading.value = true

  try {
    const res = await fetchList({
      page: page.value,
      size: 20,
    })

    // 更新列表
    if (page.value === 1) {
      list.value = res.list
    } else {
      list.value.push(...res.list)
    }

    // 判断是否有更多
    hasMore.value = res.list.length === 20
  } finally {
    loading.value = false
  }
}
</script>
```

### 4. 路由块配置不生效?

**问题原因:**

- 路由块配置语法错误(JSON5 格式)
- 配置位置不正确
- UniLayouts 插件未正确配置

**解决方案:**

检查配置格式和位置:

```vue
<!-- ✅ 正确: 路由块在文件顶部 -->
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '页面标题', // ✅ 使用单引号
    enablePullDownRefresh: true, // ✅ 布尔值不加引号
  },
  meta: {
    auth: true,
  }, // ✅ 注意逗号使用
}
</route>

<template>
  <!-- 模板内容 -->
</template>

<!-- ❌ 错误: 路由块位置错误 -->
<template>
  <!-- 模板内容 -->
</template>

<route lang="json5">
{
  // 路由块应该在文件顶部,不在底部
}
</route>

<!-- ❌ 错误: JSON 格式错误 -->
<route lang="json5">
{
  layout: 'default',
  style: {
    navigationBarTitleText: "页面标题", // ❌ 应该使用单引号
    enablePullDownRefresh: "true", // ❌ 布尔值不应该加引号
  }
}
</route>
```

### 5. AuthModal 授权弹窗不显示?

**问题原因:**

AuthModal 通过 `userStore.authModalVisible` 状态控制显示,需要手动设置状态。

**解决方案:**

通过 userStore 控制弹窗显示:

```vue
<script lang="ts" setup>
const userStore = useUserStore()

// ✅ 正确: 设置 authModalVisible 为 true
const openAuthModal = () => {
  userStore.authModalVisible = true
}

// ✅ 正确: 检查用户信息是否完整,决定是否显示授权弹窗
onLoad(() => {
  const user = userStore.userInfo

  // 如果用户缺少头像或昵称,显示授权弹窗
  if (!user.avatar || !user.nickName) {
    userStore.authModalVisible = true
  }
})

// ❌ 错误: 直接使用 wd-popup
// 不要在页面中单独使用 AuthModal 或 wd-popup
</script>
```

## 扩展开发

### 自定义全局组件

如果需要在 Default 布局中添加自定义的全局组件:

**步骤 1: 创建全局组件**

```vue
<!-- src/components/global/CustomModal.vue -->
<template>
  <wd-popup v-model="visible" position="center">
    <view class="custom-modal">
      <text>{{ message }}</text>
      <wd-button @click="close">关闭</wd-button>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
const visible = ref(false)
const message = ref('')

const show = (msg: string) => {
  message.value = msg
  visible.value = true
}

const close = () => {
  visible.value = false
}

// 暴露方法给外部调用
defineExpose({
  show,
  close,
})
</script>
```

**步骤 2: 在 Default 布局中引入**

```vue
<!-- src/layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
    <wd-toast />
    <wd-notify />
    <wd-message-box />
    <AuthModal />

    <!-- 添加自定义全局组件 -->
    <CustomModal />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import CustomModal from '@/components/global/CustomModal.vue'

const { themeVars } = useTheme()
</script>
```

**步骤 3: 创建 Composable API**

```typescript
// src/composables/useCustomModal.ts
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')

export const useCustomModal = () => {
  const show = (msg: string) => {
    message.value = msg
    visible.value = true
  }

  const close = () => {
    visible.value = false
  }

  return {
    visible,
    message,
    show,
    close,
  }
}
```

**步骤 4: 在页面中使用**

```vue
<script lang="ts" setup>
import { useCustomModal } from '@/composables/useCustomModal'

const customModal = useCustomModal()

const handleClick = () => {
  customModal.show('这是自定义弹窗!')
}
</script>
```

### 修改布局源码

如果需要修改 Default 布局的核心功能:

**示例: 添加全局错误边界**

```vue
<!-- src/layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 添加错误边界 -->
    <ErrorBoundary>
      <slot />
    </ErrorBoundary>

    <wd-toast />
    <wd-notify />
    <wd-message-box />
    <AuthModal />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import ErrorBoundary from '@/components/ErrorBoundary.vue'

const { themeVars } = useTheme()
</script>
```

**示例: 添加全局加载状态**

```vue
<!-- src/layouts/default.vue -->
<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- 全局加载状态 -->
    <wd-overlay :show="globalLoading">
      <wd-loading type="spinner" />
    </wd-overlay>

    <slot />
    <wd-toast />
    <wd-notify />
    <wd-message-box />
    <AuthModal />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const { themeVars } = useTheme()
const appStore = useAppStore()
const globalLoading = computed(() => appStore.loading)
</script>
```

## 总结

Default 布局是 RuoYi-Plus-UniApp 框架的核心布局,具有以下特点:

1. **简洁高效** - 极简设计,只包含必要的全局组件,页面拥有最大自由度
2. **主题集成** - 内置主题系统,支持全局和局部主题定制
3. **全局组件** - 统一管理 Toast、Notify、MessageBox、AuthModal
4. **灵活配置** - 支持路由块配置,可自定义导航栏、下拉刷新、页面元数据等
5. **平台适配** - 支持多平台特定配置,轻松处理平台差异
6. **易于扩展** - 可添加自定义全局组件,满足特殊业务需求

通过合理使用 Default 布局,可以快速构建统一风格、功能完善的移动应用。
