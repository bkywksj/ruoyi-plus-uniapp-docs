# 基础组件

基础组件是构建移动端界面的核心元素，提供了按钮、图标、文本、动画过渡、尺寸监听和全局配置等基础功能。

## 组件列表

| 组件 | 说明 | 特点 |
|------|------|------|
| Button | 按钮 | 8种类型、3种尺寸、开放能力 |
| Icon | 图标 | 字体图标、UnoCSS图标、图片图标 |
| Text | 文本 | 主题类型、脱敏、字典翻译 |
| Transition | 动画 | 12种内置动画效果 |
| Resize | 尺寸 | 元素尺寸监听 |
| ConfigProvider | 配置 | 主题定制、暗黑模式 |

---

## Button 按钮

按钮用于触发操作，支持多种类型、尺寸和状态，集成微信小程序开放能力。

### 按钮类型

```vue
<template>
  <!-- 实心按钮 -->
  <wd-button type="primary">主要按钮</wd-button>
  <wd-button type="success">成功按钮</wd-button>
  <wd-button type="warning">警告按钮</wd-button>
  <wd-button type="error">危险按钮</wd-button>
  <wd-button type="info">信息按钮</wd-button>
  <wd-button type="default">默认按钮</wd-button>

  <!-- 特殊类型 -->
  <wd-button type="text">文字按钮</wd-button>
  <wd-button type="icon" icon="setting" />
</template>
```

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| `primary` | 主要按钮 | 主操作、提交表单 |
| `success` | 成功按钮 | 确认、完成操作 |
| `warning` | 警告按钮 | 需要注意的操作 |
| `error` | 危险按钮 | 删除、危险操作 |
| `info` | 信息按钮 | 辅助操作 |
| `default` | 默认按钮 | 常规操作 |
| `text` | 文字按钮 | 次要操作 |
| `icon` | 图标按钮 | 图标操作 |

### 按钮样式

```vue
<template>
  <!-- 尺寸 -->
  <wd-button type="primary" size="large">大号按钮</wd-button>
  <wd-button type="primary" size="medium">中号按钮</wd-button>
  <wd-button type="primary" size="small">小号按钮</wd-button>

  <!-- 幽灵按钮 -->
  <wd-button type="primary" plain>朴素主要</wd-button>
  <wd-button type="primary" plain hairline>细边框按钮</wd-button>

  <!-- 状态 -->
  <wd-button type="primary" disabled>禁用按钮</wd-button>
  <wd-button type="primary" loading>加载中</wd-button>

  <!-- 块级与圆角 -->
  <wd-button type="primary" block>块级按钮</wd-button>
  <wd-button type="primary" round>圆角按钮</wd-button>
  <wd-button type="primary" :round="false">方形按钮</wd-button>

  <!-- 带图标 -->
  <wd-button type="primary" icon="add">新增</wd-button>
  <wd-button type="icon" icon="setting" />
</template>
```

### 隐形按钮

隐形按钮完全透明，用于覆盖在其他元素上捕获点击事件：

```vue
<template>
  <view class="card-container relative">
    <view class="card-content">卡片内容</view>
    <wd-button invisible open-type="share" @click="handleShare" />
  </view>
</template>
```

### 开放能力

```vue
<template>
  <wd-button type="primary" open-type="share">分享给好友</wd-button>
  <wd-button type="primary" open-type="getUserInfo" @getuserinfo="onGetUserInfo">获取用户信息</wd-button>
  <wd-button type="primary" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">获取手机号</wd-button>
  <wd-button type="primary" open-type="openSetting" @opensetting="onOpenSetting">打开设置</wd-button>
  <wd-button type="primary" open-type="contact" @contact="onContact">联系客服</wd-button>
  <wd-button type="primary" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">选择头像</wd-button>
</template>

<script lang="ts" setup>
const onGetUserInfo = (detail: any) => console.log('用户信息:', detail)
const onGetPhoneNumber = (detail: any) => console.log('手机号:', detail)
const onOpenSetting = (detail: any) => console.log('设置页:', detail)
const onContact = (detail: any) => console.log('客服消息:', detail)
const onChooseAvatar = (detail: any) => console.log('头像:', detail)
</script>
```

### Button Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 按钮类型 | `'primary' \| 'success' \| 'info' \| 'warning' \| 'error' \| 'default' \| 'text' \| 'icon'` | `'primary'` |
| size | 按钮尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| plain | 是否为幽灵按钮 | `boolean` | `false` |
| round | 是否为圆角按钮 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| hairline | 是否为细边框 | `boolean` | `false` |
| block | 是否为块级按钮 | `boolean` | `false` |
| invisible | 是否为隐形按钮 | `boolean` | `false` |
| loading | 是否为加载状态 | `boolean` | `false` |
| loadingColor | 加载图标颜色 | `string` | - |
| icon | 图标类名 | `IconName` | - |
| iconSize | 图标大小 | `string \| number` | - |
| iconColor | 图标颜色 | `string` | - |
| openType | 开放能力类型 | `ButtonOpenType` | - |
| hoverStopPropagation | 是否阻止祖先节点点击态 | `boolean` | `false` |
| stopClickPropagation | 是否阻止点击事件冒泡 | `boolean` | `false` |
| lang | 返回用户信息的语言 | `'zh_CN' \| 'zh_TW' \| 'en'` | - |
| sessionFrom | 会话来源 | `string` | - |

### Button Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击按钮时触发 | `event: Event` |
| getuserinfo | 获取用户信息回调 | `detail: any` |
| contact | 客服消息回调 | `detail: any` |
| getphonenumber | 获取手机号回调 | `detail: any` |
| error | 开放能力错误回调 | `detail: any` |
| launchapp | 打开APP成功回调 | `detail: any` |
| opensetting | 打开设置页回调 | `detail: any` |
| chooseavatar | 获取头像回调 | `detail: any` |

---

## Icon 图标

图标组件支持字体图标、UnoCSS图标和图片图标，提供200+内置图标。

### 字体图标

```vue
<template>
  <!-- 系统操作类 -->
  <wd-icon name="home" />
  <wd-icon name="search" />
  <wd-icon name="setting" />
  <wd-icon name="add" />
  <wd-icon name="edit" />
  <wd-icon name="delete" />

  <!-- 导航箭头类 -->
  <wd-icon name="chevron-left" />
  <wd-icon name="chevron-right" />
  <wd-icon name="chevron-up" />
  <wd-icon name="chevron-down" />

  <!-- 状态指示类 -->
  <wd-icon name="check" />
  <wd-icon name="close" />
  <wd-icon name="warn" />
  <wd-icon name="info" />

  <!-- 用户相关类 -->
  <wd-icon name="user" />
  <wd-icon name="user-fill" />
  <wd-icon name="team" />

  <!-- 商业功能类 -->
  <wd-icon name="cart" />
  <wd-icon name="shop" />
  <wd-icon name="payment" />
</template>
```

**图标分类：**

- **系统操作类：** `home`、`search`、`setting`、`add`、`edit`、`delete`、`copy`、`save`、`upload`、`download`、`share`、`scan`
- **导航箭头类：** `up`、`down`、`left`、`right`、`chevron-up`、`chevron-down`、`chevron-left`、`chevron-right`、`backtop`
- **状态指示类：** `check`、`close`、`warn`、`info`、`loading`、`star`、`heart`、`like`
- **用户相关类：** `user`、`user-add`、`team`、`contact`、`vip`
- **商业功能类：** `cart`、`payment`、`order`、`coupon`、`gift`、`wallet`、`shop`
- **平台品牌类：** `wechat`、`qq`、`weibo`、`alipay`、`github`

> 图标同时提供 `-fill` 实心版本，如 `home-fill`、`user-fill`、`heart-fill` 等

### UnoCSS 图标

```vue
<template>
  <!-- Element Plus 图标 -->
  <wd-icon name="i-ep-user" />
  <wd-icon name="i-ep-setting" />
  <wd-icon name="i-ep-search" />

  <!-- Carbon 图标 -->
  <wd-icon name="i-carbon-home" />

  <!-- Material Design 图标 -->
  <wd-icon name="i-mdi-account" />
  <wd-icon name="i-mdi-heart" />
</template>
```

### 图片图标

```vue
<template>
  <wd-icon name="/static/icons/custom.png" />
  <wd-icon name="https://example.com/icon.png" />
</template>
```

### 图标样式

```vue
<template>
  <!-- 尺寸 -->
  <wd-icon name="home" size="24" />
  <wd-icon name="home" size="32" />
  <wd-icon name="home" size="64rpx" />

  <!-- 颜色 -->
  <wd-icon name="heart" color="#4D80F0" />
  <wd-icon name="heart-fill" color="#fa4350" />

  <!-- 事件 -->
  <wd-icon name="star" @click="handleClick" />
</template>

<script lang="ts" setup>
const handleClick = (event: Event) => console.log('图标点击', event)
</script>
```

### Icon Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 图标名称 | `IconName` | - |
| color | 图标颜色 | `string` | - |
| size | 图标大小 | `string \| number` | `'40'` |
| classPrefix | 类名前缀 | `string` | `'wd-icon'` |

### Icon Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击图标时触发 | `event: Event` |
| touch | 触摸图标时触发 | `event: Event` |

---

## Text 文本

文本组件用于展示文本信息，支持主题类型、脱敏处理、字典翻译、图标组合等功能。

### 文本类型与模式

```vue
<template>
  <!-- 主题类型 -->
  <wd-text text="默认文本" />
  <wd-text type="primary" text="主要文本" />
  <wd-text type="success" text="成功文本" />
  <wd-text type="warning" text="警告文本" />
  <wd-text type="error" text="错误文本" />

  <!-- 文本模式 -->
  <wd-text mode="text" text="普通文本内容" />
  <wd-text mode="phone" text="13800138000" />
  <wd-text mode="phone" text="13800138000" format />  <!-- 脱敏 -->
  <wd-text mode="name" text="张小明" format />  <!-- 脱敏 -->
  <wd-text mode="date" :text="1699000000000" />
  <wd-text mode="price" text="12345.67" prefix="¥" />
</template>
```

### 字典翻译

```vue
<template>
  <wd-text :text="status" :options="statusOptions" />
</template>

<script lang="ts" setup>
const status = ref(1)
const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 }
]
</script>
```

### 文本样式

```vue
<template>
  <wd-text text="粗体文本" bold />
  <wd-text text="自定义颜色" color="#4D80F0" />
  <wd-text text="大号文字" size="36" />
  <wd-text text="下划线" decoration="underline" />
  <wd-text text="删除线" decoration="line-through" />
  <wd-text text="块级文本" block />
  <wd-text text="很长的文本内容..." :lines="2" block />
</template>
```

### 前后缀与图标

```vue
<template>
  <!-- 前后缀 -->
  <wd-text text="100.00" prefix="¥" />
  <wd-text text="50" suffix="%" />
  <wd-text text="1234" prefix="共" suffix="条记录" />

  <!-- 图标组合 -->
  <wd-text text="首页" icon="home" />
  <wd-text text="更多" icon="chevron-right" icon-position="right" />
  <wd-text text="设置" icon="setting" icon-position="top" />
  <wd-text text="收藏" icon="heart-fill" icon-color="#fa4350" icon-size="36" />
</template>
```

### Text Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| text | 文字内容 | `string \| number \| null` | `''` |
| type | 主题类型 | `'default' \| 'secondary' \| 'info' \| 'primary' \| 'success' \| 'warning' \| 'error'` | `'default'` |
| mode | 文本处理模式 | `'text' \| 'date' \| 'phone' \| 'name' \| 'price'` | `'text'` |
| format | 是否脱敏 | `boolean` | `false` |
| size | 字体大小 | `string \| number` | `''` |
| color | 文字颜色 | `string` | `''` |
| bold | 是否粗体 | `boolean` | `false` |
| decoration | 文本装饰 | `'underline' \| 'line-through' \| 'overline' \| 'none'` | `'none'` |
| lines | 显示行数，超出省略 | `number` | - |
| block | 是否块级元素 | `boolean` | `false` |
| prefix | 前缀内容 | `string` | - |
| suffix | 后缀内容 | `string` | - |
| call | 点击是否拨打电话 | `boolean` | `false` |
| options | 字典选项数组 | `Array<{ label: string; value: string \| number }>` | `[]` |
| icon | 图标名称 | `IconName` | - |
| iconPosition | 图标位置 | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` |
| iconSize | 图标大小 | `string \| number` | `'32'` |
| iconColor | 图标颜色 | `string` | - |
| iconSpacing | 图标与文字间距 | `string \| number` | `'8'` |

### Text Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击文本时触发 | `event: Event` |

### Text Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 前缀内容插槽 |
| suffix | 后缀内容插槽 |

---

## Transition 动画

过渡动画组件，为元素添加进入和离开的动画效果，支持12种内置动画。

### 基础用法

```vue
<template>
  <wd-button @click="show = !show">切换</wd-button>
  <wd-transition :show="show" name="fade">
    <view class="demo-block">淡入淡出</view>
  </wd-transition>
</template>

<script lang="ts" setup>
const show = ref(true)
</script>
```

### 动画类型

```vue
<template>
  <wd-transition :show="show" name="fade">淡入淡出</wd-transition>
  <wd-transition :show="show" name="fade-up">上滑淡入</wd-transition>
  <wd-transition :show="show" name="fade-down">下滑淡入</wd-transition>
  <wd-transition :show="show" name="fade-left">左滑淡入</wd-transition>
  <wd-transition :show="show" name="fade-right">右滑淡入</wd-transition>
  <wd-transition :show="show" name="slide-up">上滑进入</wd-transition>
  <wd-transition :show="show" name="slide-down">下滑进入</wd-transition>
  <wd-transition :show="show" name="slide-left">左滑进入</wd-transition>
  <wd-transition :show="show" name="slide-right">右滑进入</wd-transition>
  <wd-transition :show="show" name="zoom">缩放</wd-transition>
</template>
```

### 动画时长与事件

```vue
<template>
  <!-- 自定义时长 -->
  <wd-transition :show="show" name="fade" :duration="500">500ms</wd-transition>

  <!-- 分别设置进入和离开时长 -->
  <wd-transition :show="show" name="fade" :duration="{ enter: 300, leave: 500 }">不同时长</wd-transition>

  <!-- 动画事件 -->
  <wd-transition
    :show="show"
    name="fade"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    动画内容
  </wd-transition>
</template>

<script lang="ts" setup>
const onBeforeEnter = () => console.log('进入动画开始前')
const onEnter = () => console.log('进入动画开始')
const onAfterEnter = () => console.log('进入动画结束')
const onBeforeLeave = () => console.log('离开动画开始前')
const onLeave = () => console.log('离开动画开始')
const onAfterLeave = () => console.log('离开动画结束')
</script>
```

### Transition Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| show | 是否显示 | `boolean` | `false` |
| name | 动画类型 | `'fade' \| 'fade-up' \| 'fade-down' \| 'fade-left' \| 'fade-right' \| 'slide-up' \| 'slide-down' \| 'slide-left' \| 'slide-right' \| 'zoom'` | `'fade'` |
| duration | 动画时长(ms) | `number \| { enter: number; leave: number }` | `300` |

### Transition Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| before-enter | 进入动画开始前触发 | - |
| enter | 进入动画开始时触发 | - |
| after-enter | 进入动画结束时触发 | - |
| before-leave | 离开动画开始前触发 | - |
| leave | 离开动画开始时触发 | - |
| after-leave | 离开动画结束时触发 | - |

---

## Resize 尺寸监听

尺寸监听组件，用于监听容器元素的尺寸变化。

### 基础用法

```vue
<template>
  <wd-resize @resize="handleResize">
    <view class="container">
      <text>宽度: {{ containerSize.width }}px</text>
      <text>高度: {{ containerSize.height }}px</text>
    </view>
  </wd-resize>
</template>

<script lang="ts" setup>
const containerSize = ref({ width: 0, height: 0 })

const handleResize = (size: { width: number; height: number }) => {
  containerSize.value = size
}
</script>
```

### Resize Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义样式 | `string` | `''` |
| customClass | 自定义类名 | `string` | `''` |

### Resize Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| resize | 尺寸变化时触发 | `{ width: number; height: number }` |

---

## ConfigProvider 全局配置

全局配置组件，用于设置主题、语言等全局配置，支持深色模式和主题定制。

### 主题定制

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <wd-button type="primary">主要按钮</wd-button>
  </wd-config-provider>
</template>

<script lang="ts" setup>
const themeVars = {
  colorPrimary: '#07c160',
  colorSuccess: '#95d475',
  colorWarning: '#f0883a',
  colorDanger: '#fa4350',
  buttonRadius: '8rpx',
  fontSizeBase: '28rpx'
}
</script>
```

### 深色模式

```vue
<template>
  <wd-config-provider :theme="theme">
    <wd-button @click="toggleTheme">切换主题</wd-button>
    <wd-cell title="单元格" value="内容" />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const theme = ref<'light' | 'dark'>('light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>
```

### 跟随系统主题

```vue
<template>
  <wd-config-provider :theme="systemTheme">
    <view class="app-content">...</view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
const systemTheme = ref<'light' | 'dark'>('light')

onMounted(() => {
  const info = uni.getSystemInfoSync()
  systemTheme.value = info.theme || 'light'
  uni.onThemeChange((res) => {
    systemTheme.value = res.theme
  })
})
</script>
```

### ConfigProvider Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| theme | 主题模式 | `'light' \| 'dark'` | `'light'` |
| themeVars | 主题变量 | `Record<string, string>` | `{}` |

### 主题变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `colorPrimary` | 主题色 | `#4D80F0` |
| `colorSuccess` | 成功色 | `#34d19d` |
| `colorWarning` | 警告色 | `#f0883a` |
| `colorDanger` | 危险色 | `#fa4350` |
| `colorInfo` | 信息色 | `#909399` |
| `fontSizeBase` | 基础字号 | `28rpx` |
| `fontSizeSm` | 小号字号 | `24rpx` |
| `fontSizeLg` | 大号字号 | `32rpx` |
| `borderRadius` | 边框圆角 | `8rpx` |
| `borderColor` | 边框颜色 | `#ebedf0` |

---

## 最佳实践

### 1. 按钮使用规范

```vue
<template>
  <wd-button type="primary" @click="handleSubmit">提交</wd-button>
  <wd-button type="default" @click="handleCancel">取消</wd-button>
  <wd-button type="error" @click="handleDelete">删除</wd-button>
  <wd-button type="text" @click="handleMore">查看更多</wd-button>
</template>

<script lang="ts" setup>
const loading = ref(false)
const handleSubmit = async () => {
  loading.value = true
  try {
    await submitForm()
  } finally {
    loading.value = false
  }
}
</script>
```

### 2. 图标选择建议

```vue
<template>
  <!-- 操作类使用线性图标 -->
  <wd-icon name="edit" />
  <wd-icon name="delete" />

  <!-- 选中状态使用实心图标 -->
  <wd-icon :name="liked ? 'heart-fill' : 'heart'" @click="toggleLike" />

  <!-- 导航类使用 chevron 图标 -->
  <wd-icon name="chevron-right" />
</template>
```

### 3. 文本脱敏处理

```vue
<template>
  <wd-text mode="phone" :text="userInfo.phone" format />
  <wd-text mode="name" :text="userInfo.name" format />
  <wd-text mode="price" :text="orderInfo.amount" prefix="¥" />
</template>
```

### 4. 全局主题配置

```vue
<!-- App.vue -->
<template>
  <wd-config-provider :theme="currentTheme" :theme-vars="themeVars">
    <router-view />
  </wd-config-provider>
</template>

<script lang="ts" setup>
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.theme)
const themeVars = { colorPrimary: '#4D80F0' }
</script>
```

---

## 常见问题

### 1. 按钮点击无反应

检查按钮是否处于 `disabled` 或 `loading` 状态：

```vue
<template>
  <wd-button type="primary" :disabled="false" :loading="false" @click="handleClick">点击按钮</wd-button>
</template>
```

### 2. 图标不显示

确保图标名称正确：

```vue
<template>
  <wd-icon name="home" />           <!-- 字体图标 -->
  <wd-icon name="i-ep-user" />      <!-- UnoCSS 图标 -->
  <wd-icon name="/static/icon.png" /> <!-- 图片图标 -->
</template>
```

### 3. 文本脱敏不生效

确保设置 `format` 属性：

```vue
<template>
  <wd-text mode="phone" text="13800138000" format />
  <wd-text mode="name" text="张三" format />
</template>
```

### 4. 主题定制不生效

确保 `ConfigProvider` 包裹组件：

```vue
<template>
  <wd-config-provider :theme-vars="{ colorPrimary: '#07c160' }">
    <wd-button type="primary">按钮</wd-button>
  </wd-config-provider>
</template>
```

### 5. 过渡动画卡顿

使用适当的动画时长和简单内容：

```vue
<template>
  <wd-transition :show="show" name="fade" :duration="200">
    <view class="simple-content" style="will-change: transform, opacity;">简单内容</view>
  </wd-transition>
</template>
```
