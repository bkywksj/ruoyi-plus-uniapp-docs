# Button 按钮

按钮用于触发一个操作,如提交表单、打开链接或执行业务逻辑。

## 基本介绍

Button 组件是 WD UI 的基础组件之一,提供了丰富的样式和功能支持:

- 8种按钮类型(primary、success、info、warning、error、default、text、icon)
- 3种尺寸(small、medium、large)
- 支持图标、加载状态、禁用状态
- 支持块级按钮、圆角按钮、幽灵按钮
- 支持小程序开放能力(获取用户信息、手机号等)
- 完整的TypeScript类型支持

参考: src/wd/components/wd-button/wd-button.vue:1-827

## 基础用法

### 按钮类型

通过 `type` 属性可以设置按钮类型,支持8种类型。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">基础按钮</view>
    <view class="button-group">
      <wd-button>默认按钮</wd-button>
      <wd-button type="primary">主要按钮</wd-button>
      <wd-button type="success">成功按钮</wd-button>
    </view>

    <view class="button-group">
      <wd-button type="info">信息按钮</wd-button>
      <wd-button type="warning">警告按钮</wd-button>
      <wd-button type="error">错误按钮</wd-button>
    </view>

    <view class="button-group">
      <wd-button type="text">文本按钮</wd-button>
      <wd-button type="icon" icon="setting" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo-section {
  padding: 32rpx;
}

.demo-title {
  margin-bottom: 24rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.button-group {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}
</style>
```

**类型说明**:

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| `primary` | 主要按钮 | 主要操作、提交、确认 |
| `success` | 成功按钮 | 成功提示、保存成功 |
| `info` | 信息按钮 | 常规信息、普通操作 |
| `warning` | 警告按钮 | 警告提示、需谨慎操作 |
| `error` | 错误按钮 | 危险操作、删除、取消 |
| `default` | 默认按钮 | 次要操作、取消 |
| `text` | 文本按钮 | 轻量操作、链接式操作 |
| `icon` | 图标按钮 | 纯图标操作 |

参考: src/wd/components/wd-button/wd-button.vue:204

### 幽灵按钮

通过 `plain` 属性设置幽灵按钮,背景透明,显示边框。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">幽灵按钮</view>
    <view class="button-group">
      <wd-button plain>默认按钮</wd-button>
      <wd-button type="primary" plain>主要按钮</wd-button>
      <wd-button type="success" plain>成功按钮</wd-button>
    </view>

    <view class="button-group">
      <wd-button type="info" plain>信息按钮</wd-button>
      <wd-button type="warning" plain>警告按钮</wd-button>
      <wd-button type="error" plain>错误按钮</wd-button>
    </view>
  </view>
</template>
```

**特点**:
- 背景透明
- 文字和边框颜色与按钮类型对应
- 适用于浅色背景

参考: src/wd/components/wd-button/wd-button.vue:707-731

### 禁用状态

通过 `disabled` 属性禁用按钮,禁用后按钮不可点击。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">禁用状态</view>
    <view class="button-group">
      <wd-button disabled>默认按钮</wd-button>
      <wd-button type="primary" disabled>主要按钮</wd-button>
      <wd-button type="success" disabled>成功按钮</wd-button>
    </view>

    <view class="button-group">
      <wd-button type="primary" plain disabled>幽灵按钮</wd-button>
      <wd-button type="text" disabled>文本按钮</wd-button>
      <wd-button type="icon" icon="setting" disabled />
    </view>
  </view>
</template>
```

**注意**:
- 禁用状态下不会触发点击事件
- 禁用时不会显示 hover 效果
- 禁用时 loading 状态优先级更高

参考: src/wd/components/wd-button/wd-button.vue:372-376, 578-580

## 按钮尺寸

### 不同尺寸

通过 `size` 属性设置按钮尺寸,支持三种尺寸。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">按钮尺寸</view>

    <!-- Large 尺寸 -->
    <view class="button-group">
      <wd-button type="primary" size="large">大号按钮</wd-button>
      <wd-button type="success" size="large" plain>大号按钮</wd-button>
    </view>

    <!-- Medium 尺寸(默认) -->
    <view class="button-group">
      <wd-button type="primary" size="medium">中号按钮</wd-button>
      <wd-button type="success" size="medium" plain>中号按钮</wd-button>
    </view>

    <!-- Small 尺寸 -->
    <view class="button-group">
      <wd-button type="primary" size="small">小号按钮</wd-button>
      <wd-button type="success" size="small" plain>小号按钮</wd-button>
    </view>
  </view>
</template>
```

**尺寸规格**:

| 尺寸 | 高度 | 内边距 | 字体大小 | 圆角 |
|------|------|--------|---------|------|
| `large` | 88rpx | 0 40rpx | 32rpx | 16rpx |
| `medium` | 80rpx | 0 32rpx | 28rpx | 12rpx |
| `small` | 68rpx | 0 24rpx | 24rpx | 8rpx |

参考: src/wd/components/wd-button/wd-button.vue:622-675

### 块级按钮

通过 `block` 属性设置块级按钮,宽度100%。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">块级按钮</view>
    <wd-button type="primary" block>主要按钮</wd-button>
    <wd-button type="success" block custom-style="margin-top: 24rpx">
      成功按钮
    </wd-button>
    <wd-button type="warning" block plain custom-style="margin-top: 24rpx">
      警告按钮
    </wd-button>
  </view>
</template>
```

**使用场景**:
- 表单提交按钮
- 页面底部操作按钮
- 需要占满容器宽度的场景

参考: src/wd/components/wd-button/wd-button.vue:775-777

## 按钮形状

### 圆角按钮

通过 `round` 属性设置圆角按钮,默认为 `true`。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">圆角按钮</view>
    <view class="button-group">
      <wd-button type="primary" :round="false">默认圆角</wd-button>
      <wd-button type="primary" round>圆角按钮</wd-button>
    </view>
  </view>
</template>
```

**圆角值**:
- `round="false"`: 使用默认圆角(根据尺寸决定)
- `round="true"`: 圆角半径为 999rpx

参考: src/wd/components/wd-button/wd-button.vue:678-680

### 细边框

通过 `hairline` 属性设置细边框,边框宽度为 0.5px。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">细边框按钮</view>
    <view class="button-group">
      <wd-button type="primary" plain>普通边框</wd-button>
      <wd-button type="primary" plain hairline>细边框</wd-button>
    </view>
  </view>
</template>
```

**注意**:
- 仅在幽灵按钮(`plain`)时生效
- 使用 `0.5px` 边框实现 hairline 效果

参考: src/wd/components/wd-button/wd-button.vue:734-772

## 加载状态

### 加载中

通过 `loading` 属性设置加载状态,加载中不可点击。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">加载状态</view>
    <view class="button-group">
      <wd-button type="primary" loading>加载中...</wd-button>
      <wd-button type="success" loading>处理中...</wd-button>
      <wd-button type="info" loading plain>加载中...</wd-button>
    </view>

    <!-- 实际应用 -->
    <view class="button-group">
      <wd-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit">
        {{ submitting ? '提交中...' : '提交表单' }}
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const submitting = ref(false)

const handleSubmit = async () => {
  submitting.value = true

  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 2000))

    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '提交失败',
      icon: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>
```

**加载图标**:
- 加载图标会根据按钮类型自动调整颜色
- 幽灵按钮的加载图标为反色
- 可通过 `loadingColor` 属性自定义加载图标颜色

参考: src/wd/components/wd-button/wd-button.vue:310-354, 583-594

### 自定义加载颜色

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">自定义加载颜色</view>
    <view class="button-group">
      <wd-button type="primary" loading loading-color="#fff">
        加载中
      </wd-button>
      <wd-button type="success" loading loading-color="#00C853">
        处理中
      </wd-button>
    </view>
  </view>
</template>
```

参考: src/wd/components/wd-button/wd-button.vue:149

## 图标按钮

### 带图标的按钮

通过 `icon` 属性设置按钮图标。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">图标按钮</view>

    <!-- 前置图标 -->
    <view class="button-group">
      <wd-button type="primary" icon="add-circle">新增</wd-button>
      <wd-button type="success" icon="search">搜索</wd-button>
      <wd-button type="warning" icon="edit">编辑</wd-button>
      <wd-button type="error" icon="delete">删除</wd-button>
    </view>

    <!-- 自定义图标大小和颜色 -->
    <view class="button-group">
      <wd-button
        type="primary"
        icon="add-circle"
        icon-size="32rpx">
        大图标
      </wd-button>
      <wd-button
        type="success"
        plain
        icon="search"
        icon-color="#00C853">
        自定义颜色
      </wd-button>
    </view>
  </view>
</template>
```

**图标属性**:

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `icon` | 图标名称 | `string` | - |
| `iconSize` | 图标大小 | `string \| number` | - |
| `iconColor` | 图标颜色 | `string` | - |
| `classPrefix` | 图标类名前缀 | `string` | `'wd-icon'` |

参考: src/wd/components/wd-button/wd-button.vue:82-89, 139-143, 802-807

### 纯图标按钮

设置 `type="icon"` 可以创建圆形的纯图标按钮。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">纯图标按钮</view>
    <view class="button-group">
      <wd-button type="icon" icon="add-circle" />
      <wd-button type="icon" icon="search" />
      <wd-button type="icon" icon="edit" />
      <wd-button type="icon" icon="delete" />
      <wd-button type="icon" icon="setting" />
    </view>

    <!-- 禁用状态 -->
    <view class="button-group">
      <wd-button type="icon" icon="add-circle" disabled />
      <wd-button type="icon" icon="search" disabled />
    </view>
  </view>
</template>
```

**特点**:
- 固定宽高(88rpx × 88rpx)
- 圆形形状(border-radius: 50%)
- 无内边距
- 适合工具栏、操作栏等场景

参考: src/wd/components/wd-button/wd-button.vue:780-799

## 小程序开放能力

Button 组件支持小程序的开放能力,如获取用户信息、手机号等。

### 获取用户信息

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">获取用户信息</view>
    <wd-button
      type="primary"
      open-type="getUserInfo"
      @getuserinfo="handleGetUserInfo">
      获取用户信息
    </wd-button>
  </view>
</template>

<script setup lang="ts">
const handleGetUserInfo = (detail: any) => {
  console.log('用户信息:', detail)
  if (detail.userInfo) {
    uni.showToast({
      title: '获取成功',
      icon: 'success'
    })
  } else {
    uni.showToast({
      title: '用户拒绝授权',
      icon: 'none'
    })
  }
}
</script>
```

参考: src/wd/components/wd-button/wd-button.vue:152, 388-390

### 获取手机号

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">获取手机号</view>
    <wd-button
      type="primary"
      open-type="getPhoneNumber"
      @getphonenumber="handleGetPhoneNumber">
      获取手机号
    </wd-button>
  </view>
</template>

<script setup lang="ts">
const handleGetPhoneNumber = (detail: any) => {
  console.log('手机号信息:', detail)
  if (detail.code) {
    // 将 code 发送到后端获取手机号
    console.log('code:', detail.code)
  }
}
</script>
```

参考: src/wd/components/wd-button/wd-button.vue:381-383

### 打开客服会话

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">客服会话</view>
    <wd-button
      type="primary"
      open-type="contact"
      session-from="页面名称"
      send-message-title="咨询标题"
      send-message-path="/pages/index/index"
      send-message-img="/static/logo.png"
      :show-message-card="true"
      @contact="handleContact">
      联系客服
    </wd-button>
  </view>
</template>

<script setup lang="ts">
const handleContact = (detail: any) => {
  console.log('客服会话:', detail)
}
</script>
```

**客服相关属性**:

| 属性 | 说明 | 类型 |
|------|------|------|
| `sessionFrom` | 会话来源 | `string` |
| `sendMessageTitle` | 消息卡片标题 | `string` |
| `sendMessagePath` | 消息卡片路径 | `string` |
| `sendMessageImg` | 消息卡片图片 | `string` |
| `showMessageCard` | 是否显示消息卡片 | `boolean` |

参考: src/wd/components/wd-button/wd-button.vue:159-166, 407-409

### 支付宝小程序授权

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">支付宝授权</view>
    <!-- 获取手机号 -->
    <wd-button
      type="primary"
      open-type="getAuthorize"
      scope="phoneNumber"
      @getphonenumber="handleGetPhoneNumber">
      获取手机号(支付宝)
    </wd-button>

    <!-- 获取用户信息 -->
    <wd-button
      type="success"
      open-type="getAuthorize"
      scope="userInfo"
      @getuserinfo="handleGetUserInfo"
      custom-style="margin-top: 24rpx">
      获取用户信息(支付宝)
    </wd-button>
  </view>
</template>

<script setup lang="ts">
const handleGetPhoneNumber = (detail: any) => {
  console.log('手机号:', detail)
}

const handleGetUserInfo = (detail: any) => {
  console.log('用户信息:', detail)
}
</script>
```

**支付宝授权范围**:

| scope 值 | 说明 |
|---------|------|
| `phoneNumber` | 获取手机号 |
| `userInfo` | 获取用户信息 |

参考: src/wd/components/wd-button/wd-button.vue:174, 251, 396-402

### 其他开放能力

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">其他能力</view>

    <!-- 打开设置页 -->
    <wd-button
      type="primary"
      open-type="openSetting"
      @opensetting="handleOpenSetting">
      打开设置页
    </wd-button>

    <!-- 打开 APP -->
    <wd-button
      type="success"
      open-type="launchApp"
      app-parameter="customParam"
      @launchapp="handleLaunchApp"
      custom-style="margin-top: 24rpx">
      打开 APP
    </wd-button>

    <!-- 选择头像 -->
    <wd-button
      type="info"
      open-type="chooseAvatar"
      @chooseavatar="handleChooseAvatar"
      custom-style="margin-top: 24rpx">
      选择头像
    </wd-button>

    <!-- 分享 -->
    <wd-button
      type="warning"
      open-type="share"
      custom-style="margin-top: 24rpx">
      分享
    </wd-button>
  </view>
</template>

<script setup lang="ts">
const handleOpenSetting = (detail: any) => {
  console.log('设置结果:', detail)
}

const handleLaunchApp = (detail: any) => {
  console.log('打开 APP:', detail)
}

const handleChooseAvatar = (detail: any) => {
  console.log('选择头像:', detail.avatarUrl)
}
</script>
```

**所有支持的 open-type**:

| 值 | 说明 | 平台 |
|---|------|------|
| `feedback` | 打开"意见反馈"页面 | 微信小程序 |
| `share` | 触发分享 | 微信小程序 |
| `getUserInfo` | 获取用户信息 | 微信小程序 |
| `contact` | 打开客服会话 | 微信小程序 |
| `getPhoneNumber` | 获取用户手机号 | 微信小程序 |
| `launchApp` | 打开 APP | 微信小程序 |
| `openSetting` | 打开授权设置页 | 微信小程序 |
| `chooseAvatar` | 选择用户头像 | 微信小程序 |
| `getAuthorize` | 支付宝授权 | 支付宝小程序 |
| `agreePrivacyAuthorization` | 同意隐私协议 | 微信小程序 |

参考: src/wd/components/wd-button/wd-button.vue:219-246

## 高级用法

### 隐形按钮

通过 `invisible` 属性创建完全透明的覆盖层按钮,常用于实现点击区域扩展。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">隐形按钮</view>
    <view class="container">
      <view class="content">
        这是一个卡片内容
        <!-- 隐形按钮覆盖整个卡片 -->
        <wd-button invisible @click="handleCardClick" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const handleCardClick = () => {
  uni.showToast({
    title: '卡片被点击',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  padding: 32rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
}

.content {
  position: relative;
  padding: 48rpx;
  background: white;
  border-radius: 12rpx;
}
</style>
```

**特点**:
- 完全透明(background: transparent)
- 绝对定位,覆盖父元素
- z-index: 9999
- 无任何视觉效果(边框、阴影、hover效果)

参考: src/wd/components/wd-button/wd-button.vue:132, 545-575

### 阻止点击冒泡

通过 `stopClickPropagation` 属性阻止点击事件冒泡。

```vue
<template>
  <view class="demo-section" @click="handleParentClick">
    <view class="demo-title">阻止冒泡</view>

    <!-- 不阻止冒泡 -->
    <wd-button
      type="primary"
      @click="handleButtonClick">
      不阻止冒泡
    </wd-button>

    <!-- 阻止冒泡 -->
    <wd-button
      type="success"
      stop-click-propagation
      @click="handleButtonClick"
      custom-style="margin-top: 24rpx">
      阻止冒泡
    </wd-button>
  </view>
</template>

<script setup lang="ts">
const handleParentClick = () => {
  console.log('父元素被点击')
}

const handleButtonClick = () => {
  console.log('按钮被点击')
}
</script>
```

参考: src/wd/components/wd-button/wd-button.vue:4, 49, 156

### 自定义样式

通过 `customStyle` 和 `customClass` 属性自定义按钮样式。

```vue
<template>
  <view class="demo-section">
    <view class="demo-title">自定义样式</view>

    <!-- 渐变按钮 -->
    <wd-button
      type="primary"
      custom-style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border: none;">
      渐变按钮
    </wd-button>

    <!-- 阴影按钮 -->
    <wd-button
      type="success"
      custom-style="box-shadow: 0 8rpx 16rpx rgba(0,200,83,0.3);"
      custom-class="shadow-button">
      阴影按钮
    </wd-button>

    <!-- 自定义尺寸 -->
    <wd-button
      type="warning"
      custom-style="height: 100rpx; font-size: 32rpx; min-width: 300rpx;">
      超大按钮
    </wd-button>
  </view>
</template>

<style lang="scss">
.shadow-button {
  // 自定义类名样式
}
</style>
```

参考: src/wd/components/wd-button/wd-button.vue:116-119

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 按钮类型 | `'primary' \| 'success' \| 'info' \| 'warning' \| 'error' \| 'default' \| 'text' \| 'icon'` | `'primary'` |
| size | 按钮尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| plain | 是否为幽灵按钮 | `boolean` | `false` |
| round | 是否为圆角按钮 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| hairline | 是否细边框(仅幽灵按钮) | `boolean` | `false` |
| block | 是否为块级按钮 | `boolean` | `false` |
| invisible | 是否为隐形按钮 | `boolean` | `false` |
| icon | 图标名称 | `string` | - |
| classPrefix | 图标类名前缀 | `string` | `'wd-icon'` |
| iconSize | 图标大小 | `string \| number` | - |
| iconColor | 图标颜色 | `string` | - |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loadingColor | 加载图标颜色 | `string` | - |
| openType | 微信开放能力 | [见下表](#opentype-类型) | - |
| hoverStopPropagation | 是否阻止祖先节点点击态 | `boolean` | - |
| stopClickPropagation | 是否阻止点击事件冒泡 | `boolean` | `false` |
| lang | 返回用户信息的语言 | `'zh_CN' \| 'zh_TW' \| 'en'` | - |
| sessionFrom | 会话来源(open-type="contact"时) | `string` | - |
| sendMessageTitle | 消息卡片标题(open-type="contact"时) | `string` | - |
| sendMessagePath | 消息卡片路径(open-type="contact"时) | `string` | - |
| sendMessageImg | 消息卡片图片(open-type="contact"时) | `string` | - |
| appParameter | 打开APP传递的参数(open-type="launchApp"时) | `string` | - |
| showMessageCard | 是否显示会话消息卡片(open-type="contact"时) | `boolean` | - |
| buttonId | 按钮的唯一标识 | `string` | - |
| scope | 支付宝小程序授权范围 | `'phoneNumber' \| 'userInfo'` | - |
| customStyle | 自定义样式 | `string` | - |
| customClass | 自定义类名 | `string` | - |

参考: src/wd/components/wd-button/wd-button.vue:115-175, 254-267

#### openType 类型

| 值 | 说明 | 平台 |
|---|------|------|
| `feedback` | 打开"意见反馈"页面 | 微信 |
| `share` | 触发用户转发 | 微信 |
| `getUserInfo` | 获取用户信息 | 微信 |
| `contact` | 打开客服会话 | 微信 |
| `getPhoneNumber` | 获取用户手机号 | 微信 |
| `launchApp` | 打开 APP | 微信 |
| `openSetting` | 打开授权设置页 | 微信 |
| `chooseAvatar` | 获取用户头像 | 微信 |
| `getAuthorize` | 支付宝授权 | 支付宝 |
| `agreePrivacyAuthorization` | 同意隐私协议 | 微信 |

参考: src/wd/components/wd-button/wd-button.vue:219-246

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|
| click | 点击按钮时触发(禁用和加载时不触发) | `event: Event` |
| getuserinfo | 用户点击该按钮时,获取用户信息回调 | `detail: any` |
| contact | 客服消息回调 | `detail: any` |
| getphonenumber | 获取用户手机号回调 | `detail: any` |
| error | 使用开放能力时发生错误的回调 | `detail: any` |
| launchapp | 打开 APP 成功的回调 | `detail: any` |
| opensetting | 在打开授权设置页后回调 | `detail: any` |
| chooseavatar | 获取用户头像回调 | `detail: any` |
| agreeprivacyauthorization | 用户同意隐私协议事件回调 | `detail: any` |

参考: src/wd/components/wd-button/wd-button.vue:180-199, 372-444

### Slots

| 名称 | 说明 |
|------|------|
| default | 按钮文本内容 |

参考: src/wd/components/wd-button/wd-button.vue:44-46, 90-92

### 外部样式类

| 类名 | 说明 |
|------|------|
| custom-class | 根节点样式类 |

参考: src/wd/components/wd-button/wd-button.vue:119

## 主题定制

### CSS 变量

组件提供了下列 CSS 变量,可用于自定义样式。

```scss
:root {
  /* 按钮颜色 */
  --wd-button-primary-bg-color: #4D80F0;
  --wd-button-primary-color: #FFFFFF;
  --wd-button-success-bg-color: #34d19d;
  --wd-button-success-color: #FFFFFF;
  --wd-button-info-bg-color: #E8E8E8;
  --wd-button-info-color: #333333;
  --wd-button-warning-bg-color: #f0883a;
  --wd-button-warning-color: #FFFFFF;
  --wd-button-error-bg-color: #fa4350;
  --wd-button-error-color: #FFFFFF;

  /* 按钮尺寸 */
  --wd-button-large-height: 88rpx;
  --wd-button-large-padding: 0 40rpx;
  --wd-button-large-fs: 32rpx;
  --wd-button-large-radius: 16rpx;
  --wd-button-large-loading: 40rpx;

  --wd-button-medium-height: 80rpx;
  --wd-button-medium-padding: 0 32rpx;
  --wd-button-medium-fs: 28rpx;
  --wd-button-medium-radius: 12rpx;
  --wd-button-medium-loading: 36rpx;

  --wd-button-small-height: 68rpx;
  --wd-button-small-padding: 0 24rpx;
  --wd-button-small-fs: 24rpx;
  --wd-button-small-radius: 8rpx;
  --wd-button-small-loading: 32rpx;

  /* 图标按钮 */
  --wd-button-icon-size: 88rpx;
  --wd-button-icon-color: #333333;
  --wd-button-icon-disabled-color: #C8C8C8;
  --wd-button-icon-fs: 40rpx;

  /* 其他 */
  --wd-button-plain-bg-color: transparent;
  --wd-button-disabled-opacity: 0.6;
  --wd-button-text-hover-opacity: 0.6;
  --wd-button-info-plain-normal-color: #333333;
  --wd-button-info-plain-border-color: #E8E8E8;
  --wd-button-normal-color: #333333;
  --wd-button-normal-disabled-color: #C8C8C8;
}
```

参考: src/wd/components/common/abstracts/variable.scss

### 暗黑模式

组件支持暗黑模式,在暗黑主题下自动适配。

```scss
// 暗黑模式适配
.wot-theme-dark {
  .wd-button {
    // info 按钮暗黑模式适配
    &.is-info {
      background: var(--wot-dark-background4);
      color: var(--wot-dark-color3);
    }

    // 幽灵按钮暗黑模式适配
    &.is-plain.is-info {
      color: var(--wot-dark-color);
      border-color: var(--wot-dark-background5);
    }

    // 文本按钮暗黑模式适配
    &.is-text.is-disabled {
      color: var(--wot-dark-color-gray);
    }

    // 图标按钮暗黑模式适配
    &.is-icon {
      color: var(--wot-dark-color);
      &.is-disabled {
        color: var(--wot-dark-color-gray);
      }
    }
  }
}
```

参考: src/wd/components/wd-button/wd-button.vue:453-488

## 最佳实践

### 按钮类型选择

根据操作的重要性和场景选择合适的按钮类型:

1. **Primary(主要)**: 用于页面的主要操作
   - 表单提交
   - 确认操作
   - 重要的业务操作

2. **Success(成功)**: 用于表示成功的操作
   - 保存成功
   - 完成操作
   - 正向的业务操作

3. **Warning(警告)**: 用于需要谨慎的操作
   - 需要二次确认的操作
   - 可能产生风险的操作
   - 重置操作

4. **Error(错误)**: 用于危险操作
   - 删除操作
   - 注销账户
   - 清空数据

5. **Info(信息)**: 用于普通信息展示
   - 常规操作
   - 辅助操作

6. **Text(文本)**: 用于轻量级操作
   - 链接式操作
   - 辅助功能
   - 不需要强调的操作

7. **Icon(图标)**: 用于工具操作
   - 工具栏操作
   - 快捷操作
   - 空间有限的场景

### 加载状态使用

在异步操作时始终显示加载状态:

```typescript
const handleSubmit = async () => {
  // ✅ 推荐:显示加载状态
  loading.value = true

  try {
    await api.submit()
  } finally {
    // 确保加载状态被关闭
    loading.value = false
  }
}
```

### 防止重复点击

使用加载状态或禁用状态防止重复点击:

```vue
<template>
  <!-- 方案1:使用loading状态 -->
  <wd-button
    type="primary"
    :loading="submitting"
    @click="handleSubmit">
    提交
  </wd-button>

  <!-- 方案2:使用disabled状态 -->
  <wd-button
    type="primary"
    :disabled="submitting"
    @click="handleSubmit">
    提交
  </wd-button>
</template>
```

### 按钮尺寸规范

保持页面内按钮尺寸的一致性:

```vue
<template>
  <!-- 同一区域使用相同尺寸 -->
  <view class="button-group">
    <wd-button type="primary" size="medium">确认</wd-button>
    <wd-button size="medium">取消</wd-button>
  </view>
</template>
```

### 可访问性

为按钮提供清晰的文字描述:

```vue
<template>
  <!-- ✅ 推荐:文字描述清晰 -->
  <wd-button type="primary" icon="add">新增用户</wd-button>

  <!-- ❌ 不推荐:仅图标,不易理解 -->
  <wd-button type="icon" icon="add" />
</template>
```

### 注意事项

1. **点击区域**: 确保按钮有足够的点击区域(最小 48rpx × 48rpx)
2. **对比度**: 确保按钮文字与背景有足够的对比度
3. **响应速度**: 避免按钮点击后无响应
4. **状态反馈**: 及时显示操作结果
5. **防误触**: 重要操作需要二次确认

## 常见问题

### 1. 按钮点击无响应?

**原因**:
- 按钮处于禁用状态(`disabled="true"`)
- 按钮处于加载状态(`loading="true"`)
- 点击事件被父元素阻止

**解决方案**:

```vue
<template>
  <!-- 确保按钮未禁用且未加载 -->
  <wd-button
    type="primary"
    :disabled="false"
    :loading="false"
    @click="handleClick">
    点击按钮
  </wd-button>
</template>
```

参考: src/wd/components/wd-button/wd-button.vue:372-376

### 2. 小程序开放能力不生效?

**原因**:
- 按钮处于禁用或加载状态时,`open-type` 会被设置为 `undefined`
- 小程序配置未正确设置权限

**解决方案**:

```vue
<template>
  <!-- 确保按钮未禁用且未加载 -->
  <wd-button
    type="primary"
    open-type="getUserInfo"
    :disabled="false"
    :loading="false"
    @getuserinfo="handleGetUserInfo">
    获取用户信息
  </wd-button>
</template>
```

参考: src/wd/components/wd-button/wd-button.vue:11, 56

### 3. 自定义样式不生效?

**原因**:
- 样式优先级不够
- scoped 样式隔离

**解决方案**:

```vue
<template>
  <!-- 使用 customStyle 属性 -->
  <wd-button
    type="primary"
    custom-style="background: #667eea; border: none;">
    自定义按钮
  </wd-button>
</template>

<style lang="scss">
/* 使用深度选择器 */
:deep(.wd-button) {
  /* 自定义样式 */
}
</style>
```

### 4. 加载图标颜色不对?

**解决方案**:

使用 `loadingColor` 属性自定义加载图标颜色:

```vue
<template>
  <wd-button
    type="primary"
    loading
    loading-color="#FFFFFF">
    加载中
  </wd-button>
</template>
```

参考: src/wd/components/wd-button/wd-button.vue:149

### 5. 支付宝小程序授权失败?

**解决方案**:

使用 `getAuthorize` 类型和 `scope` 属性:

```vue
<template>
  <wd-button
    type="primary"
    open-type="getAuthorize"
    scope="phoneNumber"
    @getphonenumber="handleGetPhoneNumber">
    获取手机号
  </wd-button>
</template>
```

参考: src/wd/components/wd-button/wd-button.vue:396-402
