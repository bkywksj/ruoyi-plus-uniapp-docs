# Icon 图标

## 介绍

Icon 图标组件为应用提供统一的图标展示方案,支持三种图标类型:字体图标、UnoCSS图标和图片图标。WD UI 内置了300+精心设计的字体图标,涵盖系统操作、导航箭头、状态指示、用户相关、通讯媒体、商业功能、文件管理、工具功能、数据图表、社交功能和平台品牌等11个分类,满足各类业务场景需求。

**核心特性:**

- **三种图标类型支持** - 内置字体图标、UnoCSS 原子化图标、自定义图片图标
- **丰富图标库** - 提供 300+ 个高质量字体图标,每个图标都有线性和填充两种风格
- **灵活样式定制** - 支持自定义颜色、大小,可通过 CSS 变量进行主题定制
- **多平台兼容** - 完美支持 H5、微信小程序、支付宝小程序、APP 等多端
- **TypeScript 支持** - 完整的类型定义,所有图标名称都有类型提示
- **轻量级实现** - 使用 Web 字体技术,体积小、性能高、缩放不失真
- **事件支持** - 支持点击和触摸事件,可作为交互元素使用

参考: src/wd/components/wd-icon/wd-icon.vue:1-2156

## 基本用法

### 字体图标

使用内置的 300+ 字体图标,通过 `name` 属性指定图标名称。每个图标都提供线性和填充两种风格,填充样式的图标名称以 `-fill` 结尾。

```vue
<template>
  <view class="demo">
    <!-- 系统操作类图标 -->
    <wd-icon name="home" />
    <wd-icon name="home-fill" />
    <wd-icon name="search" />
    <wd-icon name="search-fill" />
    <wd-icon name="add" />
    <wd-icon name="add-fill" />

    <!-- 导航箭头类图标 -->
    <wd-icon name="left" />
    <wd-icon name="right" />
    <wd-icon name="chevron-down" />
    <wd-icon name="chevron-down-fill" />

    <!-- 状态指示类图标 -->
    <wd-icon name="check" />
    <wd-icon name="check-fill" />
    <wd-icon name="close" />
    <wd-icon name="close-fill" />
  </view>
</template>

```

**使用说明:**
- 字体图标使用 Alipay CDN 托管的 Web 字体文件(woff2/woff/ttf 格式)
- APP 平台会自动加载本地 TTF 字体文件以提升性能
- 图标会自动继承父元素的字体大小和颜色
- 所有图标名称都有 TypeScript 类型提示,避免拼写错误

参考: src/wd/components/wd-icon/wd-icon.vue:24-420, 544-606

### UnoCSS 图标

支持使用 UnoCSS 原子化图标,图标名称以 `i-` 开头。这种方式需要项目中配置了 UnoCSS。

```vue
<template>
  <view class="demo">
    <!-- UnoCSS 图标示例 -->
    <wd-icon name="i-carbon-user" size="24" />
    <wd-icon name="i-carbon-settings" size="24" />
    <wd-icon name="i-carbon-home" size="24" />
    <wd-icon name="i-mdi-github" size="24" />
    <wd-icon name="i-heroicons-heart-solid" size="24" />
  </view>
</template>
```

**技术实现:**
- 组件自动识别以 `i-` 开头的 name 作为 UnoCSS 图标
- UnoCSS 图标使用 SVG 或背景图方式渲染,支持 1em x 1em 尺寸
- 通过 vertical-align: middle 实现垂直居中对齐
- 颜色和大小继承父元素样式

参考: src/wd/components/wd-icon/wd-icon.vue:422-424, 482-486, 497-499, 579-585

### 图片图标

支持使用自定义图片作为图标,`name` 属性传入图片路径(包含 `/` 字符)。

```vue
<template>
  <view class="demo">
    <!-- 本地图片 -->
    <wd-icon name="/static/icons/custom.png" size="32" />

    <!-- 网络图片 -->
    <wd-icon name="https://example.com/icon.png" size="32" />

    <!-- 支持各种图片格式 -->
    <wd-icon name="/static/icons/logo.svg" size="32" />
    <wd-icon name="/static/icons/avatar.jpg" size="32" />
  </view>
</template>
```

**图片处理特性:**
- 使用 `<image>` 组件渲染,支持所有 UniApp 支持的图片格式
- `object-fit: cover` 保持图片比例,填充整个容器
- `object-position: center` 确保图片居中显示
- 继承父元素的 border-radius 圆角样式
- 自动处理图片溢出,防止布局错乱

参考: src/wd/components/wd-icon/wd-icon.vue:4, 475-478, 494-496, 587-605

## 图标样式

### 图标颜色

通过 `color` 属性设置图标颜色,支持所有 CSS 颜色值格式。

```vue
<template>
  <view class="demo">
    <!-- 十六进制颜色 -->
    <wd-icon name="heart-fill" color="#ff0000" size="32" />

    <!-- RGB/RGBA 颜色 -->
    <wd-icon name="star-fill" color="rgb(255, 165, 0)" size="32" />
    <wd-icon name="like-fill" color="rgba(24, 144, 255, 0.8)" size="32" />

    <!-- CSS 颜色名称 -->
    <wd-icon name="check-fill" color="green" size="32" />

    <!-- CSS 变量 -->
    <wd-icon name="warn-fill" color="var(--wd-color-warning)" size="32" />

    <!-- 语义化颜色示例 -->
    <wd-icon name="check-outline-fill" color="#52c41a" size="32" />  <!-- 成功 -->
    <wd-icon name="close-outline-fill" color="#f5222d" size="32" />  <!-- 错误 -->
    <wd-icon name="warn-fill" color="#faad14" size="32" />          <!-- 警告 -->
    <wd-icon name="info-fill" color="#1890ff" size="32" />          <!-- 信息 -->
  </view>
</template>
```

**颜色应用说明:**
- 字体图标通过 CSS `color` 属性控制颜色
- UnoCSS 图标同样支持 color 属性
- 图片图标不受 color 属性影响
- 未设置 color 时,图标继承父元素的文本颜色

参考: src/wd/components/wd-icon/wd-icon.vue:445, 514-516

### 图标大小

通过 `size` 属性设置图标大小,支持数字(单位 rpx)和字符串(带单位)。

```vue
<template>
  <view class="demo">
    <!-- 数字格式(自动转换为 rpx) -->
    <wd-icon name="home-fill" :size="16" />   <!-- 16rpx -->
    <wd-icon name="home-fill" :size="24" />   <!-- 24rpx -->
    <wd-icon name="home-fill" :size="32" />   <!-- 32rpx -->
    <wd-icon name="home-fill" :size="48" />   <!-- 48rpx -->
    <wd-icon name="home-fill" :size="64" />   <!-- 64rpx -->

    <!-- 字符串格式(保留原始单位) -->
    <wd-icon name="search-fill" size="1em" />
    <wd-icon name="search-fill" size="1.5rem" />
    <wd-icon name="search-fill" size="20px" />
    <wd-icon name="search-fill" size="100%" />
  </view>
</template>

```

**尺寸处理逻辑:**
- 传入数字时,自动通过 `addUnit()` 工具函数转换为 rpx 单位
- 传入字符串时,保持原始单位不变
- 默认大小为 40rpx(约 20px)
- 图标使用 font-size 控制大小,缩放不失真
- 推荐使用 rpx 单位以适配不同屏幕尺寸

参考: src/wd/components/wd-icon/wd-icon.vue:447-448, 467, 518-520

### 自定义样式

通过 `custom-style` 和 `custom-class` 属性添加自定义样式。

```vue
<template>
  <view class="demo">
    <!-- 使用 custom-style 内联样式 -->
    <wd-icon
      name="heart-fill"
      size="32"
      custom-style="color: #ff0000; transform: rotate(45deg);"
    />

    <!-- 使用 custom-class 样式类 -->
    <wd-icon
      name="star-fill"
      size="32"
      custom-class="animated-icon"
    />

    <!-- 组合使用 -->
    <wd-icon
      name="loading-fill"
      size="32"
      color="#1890ff"
      custom-class="spinning-icon"
      custom-style="opacity: 0.8;"
    />
  </view>
</template>

```

**样式优先级:**
- `custom-style` 会被直接合并到组件的 style 属性中
- `custom-class` 会被添加到组件的 class 列表中
- 样式合并顺序: 基础样式 → color/size → customStyle
- 支持所有 CSS 属性,包括 transform、animation、filter 等

参考: src/wd/components/wd-icon/wd-icon.vue:439-440, 491-493, 522-524

## 图标分类

### 系统操作类(54个)

常用的系统功能操作图标,涵盖导航、编辑、管理等场景。

```vue
<template>
  <view class="icon-category">
    <!-- 导航类 -->
    <view class="category-section">
      <text class="category-title">导航</text>
      <wd-icon name="home" />
      <wd-icon name="back" />
      <wd-icon name="close" />
      <wd-icon name="menu" />
      <wd-icon name="more" />
    </view>

    <!-- 操作类 -->
    <view class="category-section">
      <text class="category-title">操作</text>
      <wd-icon name="add" />
      <wd-icon name="minus" />
      <wd-icon name="edit" />
      <wd-icon name="delete" />
      <wd-icon name="copy" />
      <wd-icon name="save" />
    </view>

    <!-- 功能类 -->
    <view class="category-section">
      <text class="category-title">功能</text>
      <wd-icon name="search" />
      <wd-icon name="filter" />
      <wd-icon name="refresh" />
      <wd-icon name="setting" />
      <wd-icon name="help" />
      <wd-icon name="scan" />
    </view>

    <!-- 媒体类 -->
    <view class="category-section">
      <text class="category-title">媒体</text>
      <wd-icon name="upload" />
      <wd-icon name="download" />
      <wd-icon name="share" />
      <wd-icon name="print" />
      <wd-icon name="play" />
      <wd-icon name="pause" />
      <wd-icon name="stop" />
    </view>

    <!-- 屏幕类 -->
    <view class="category-section">
      <text class="category-title">屏幕</text>
      <wd-icon name="fullscreen" />
      <wd-icon name="exit-fullscreen" />
      <wd-icon name="zoom-in" />
      <wd-icon name="zoom-out" />
      <wd-icon name="rotate" />
    </view>
  </view>
</template>
```

**完整图标列表:**
- 导航: home, home-fill, back, back-fill, close, close-fill, close-outline, close-outline-fill, menu, menu-fill, more, more-fill
- 确认: check, check-fill, check-outline, check-outline-fill
- 搜索筛选: search, search-fill, filter, filter-fill
- 刷新设置: refresh, refresh-fill, setting, setting-fill, help, help-fill
- 增删改: add, add-fill, minus, minus-fill, edit, edit-fill, delete, delete-fill
- 复制保存: copy, copy-fill, save, save-fill, clear, clear-fill
- 上传下载: upload, upload-fill, download, download-fill, share, share-fill, print, print-fill
- 链接: link, link-fill, jump, jump-fill
- 登录: login, login-fill, logout, logout-fill, poweroff, poweroff-fill
- 扫描: scan, scan-fill
- 媒体控制: play, play-fill, pause, pause-fill, stop, stop-fill, next, next-fill, previous, previous-fill, forward, forward-fill, backward, backward-fill
- 操作流程: enter, enter-fill, swap, swap-fill, rotate, rotate-fill, rollback, rollback-fill
- 屏幕控制: fullscreen, fullscreen-fill, exit-fullscreen, exit-fullscreen-fill, zoom-in, zoom-in-fill, zoom-out, zoom-out-fill
- 其他: translate, translate-fill, keywords, keywords-fill

参考: src/wd/components/wd-icon/wd-icon.vue:25-119

### 导航箭头类(28个)

各种方向和样式的箭头图标,用于导航、分页、展开收起等场景。

```vue
<template>
  <view class="icon-category">
    <!-- 基础方向箭头 -->
    <view class="category-section">
      <text class="category-title">基础箭头</text>
      <wd-icon name="up" />
      <wd-icon name="down" />
      <wd-icon name="left" />
      <wd-icon name="right" />
    </view>

    <!-- V 形箭头 -->
    <view class="category-section">
      <text class="category-title">V 形箭头</text>
      <wd-icon name="chevron-up" />
      <wd-icon name="chevron-up-fill" />
      <wd-icon name="chevron-down" />
      <wd-icon name="chevron-down-fill" />
      <wd-icon name="chevron-left" />
      <wd-icon name="chevron-left-fill" />
      <wd-icon name="chevron-right" />
      <wd-icon name="chevron-right-fill" />
    </view>

    <!-- 三角箭头 -->
    <view class="category-section">
      <text class="category-title">三角箭头</text>
      <wd-icon name="caret-up" />
      <wd-icon name="caret-up-fill" />
      <wd-icon name="caret-down" />
      <wd-icon name="caret-down-fill" />
      <wd-icon name="caret-left" />
      <wd-icon name="caret-left-fill" />
      <wd-icon name="caret-right" />
      <wd-icon name="caret-right-fill" />
    </view>

    <!-- 分页导航 -->
    <view class="category-section">
      <text class="category-title">分页</text>
      <wd-icon name="page-first" />
      <wd-icon name="page-first-fill" />
      <wd-icon name="page-last" />
      <wd-icon name="page-last-fill" />
      <wd-icon name="backtop" />
      <wd-icon name="backtop-fill" />
    </view>

    <!-- 展开收起 -->
    <view class="category-section">
      <text class="category-title">展开收起</text>
      <wd-icon name="unfold-more" />
      <wd-icon name="unfold-less" />
    </view>
  </view>
</template>
```

**使用场景:**
- up/down/left/right: 基础方向指示,适用于简单导航
- chevron-*: V 形箭头,适用于下拉菜单、手风琴面板
- caret-*: 三角箭头,适用于排序、下拉选择
- page-*: 分页控件的首页/尾页跳转
- backtop: 返回顶部按钮
- unfold-*: 展开/收起更多内容

参考: src/wd/components/wd-icon/wd-icon.vue:121-148

### 状态指示类(38个)

表示各种状态的图标,包括提示、锁定、可见性、收藏等。

```vue
<template>
  <view class="icon-category">
    <!-- 提示状态 -->
    <view class="category-section">
      <text class="category-title">提示</text>
      <wd-icon name="warn-fill" color="#faad14" />
      <wd-icon name="info-fill" color="#1890ff" />
      <wd-icon name="loading-fill" color="#1890ff" custom-class="spinning" />
      <wd-icon name="tips-fill" color="#52c41a" />
      <wd-icon name="notification-fill" color="#ff4d4f" />
    </view>

    <!-- 锁定状态 -->
    <view class="category-section">
      <text class="category-title">锁定</text>
      <wd-icon name="locked" />
      <wd-icon name="locked-fill" />
      <wd-icon name="unlocked" />
      <wd-icon name="unlocked-fill" />
      <wd-icon name="secured" />
      <wd-icon name="secured-fill" />
    </view>

    <!-- 可见性 -->
    <view class="category-section">
      <text class="category-title">可见性</text>
      <wd-icon name="visible" />
      <wd-icon name="visible-fill" />
      <wd-icon name="hidden" />
      <wd-icon name="hidden-fill" />
    </view>

    <!-- 时间 -->
    <view class="category-section">
      <text class="category-title">时间</text>
      <wd-icon name="time" />
      <wd-icon name="time-fill" />
      <wd-icon name="clock" />
      <wd-icon name="clock-fill" />
    </view>

    <!-- 收藏喜欢 -->
    <view class="category-section">
      <text class="category-title">收藏</text>
      <wd-icon name="star" color="#faad14" />
      <wd-icon name="star-fill" color="#faad14" />
      <wd-icon name="heart" color="#ff4d4f" />
      <wd-icon name="heart-fill" color="#ff4d4f" />
      <wd-icon name="favorite" color="#1890ff" />
      <wd-icon name="favorite-fill" color="#1890ff" />
      <wd-icon name="like" />
      <wd-icon name="like-fill" />
      <wd-icon name="dislike" />
      <wd-icon name="dislike-fill" />
    </view>

    <!-- 标记 -->
    <view class="category-section">
      <text class="category-title">标记</text>
      <wd-icon name="flag" />
      <wd-icon name="flag-fill" />
      <wd-icon name="pin" />
      <wd-icon name="pin-fill" />
    </view>
  </view>
</template>

```

**完整图标列表:**
warn, warn-fill, info, info-fill, loading, loading-fill, locked, locked-fill, unlocked, unlocked-fill, visible, visible-fill, hidden, hidden-fill, time, time-fill, clock, clock-fill, star, star-fill, heart, heart-fill, favorite, favorite-fill, like, like-fill, dislike, dislike-fill, flag, flag-fill, pin, pin-fill, secured, secured-fill, notification, notification-fill, tips, tips-fill

参考: src/wd/components/wd-icon/wd-icon.vue:150-187

### 用户相关类(24个)

用户、团队、权限等人员相关图标。

```vue
<template>
  <view class="icon-category">
    <!-- 用户 -->
    <wd-icon name="user" />
    <wd-icon name="user-fill" />
    <wd-icon name="user-circle" />
    <wd-icon name="user-circle-fill" />
    <wd-icon name="user-add" />
    <wd-icon name="user-add-fill" />

    <!-- 团队 -->
    <wd-icon name="team" />
    <wd-icon name="team-fill" />
    <wd-icon name="user-group" />
    <wd-icon name="user-group-fill" />

    <!-- 角色 -->
    <wd-icon name="admin" />
    <wd-icon name="admin-fill" />
    <wd-icon name="vip" color="#faad14" />
    <wd-icon name="vip-fill" color="#faad14" />
    <wd-icon name="crown" color="#faad14" />
    <wd-icon name="crown-fill" color="#faad14" />

    <!-- 性别 -->
    <wd-icon name="male" color="#1890ff" />
    <wd-icon name="male-fill" color="#1890ff" />
    <wd-icon name="female" color="#ff4d4f" />
    <wd-icon name="female-fill" color="#ff4d4f" />
  </view>
</template>
```

**完整图标列表:**
user, user-fill, user-add, user-add-fill, user-circle, user-circle-fill, user-talk, user-talk-fill, user-group, user-group-fill, team, team-fill, contact, contact-fill, admin, admin-fill, vip, vip-fill, crown, crown-fill, diamon, diamon-fill, male, male-fill, female, female-fill

参考: src/wd/components/wd-icon/wd-icon.vue:189-214

### 通讯媒体类(46个)

电话、消息、多媒体、设备、网络等通讯相关图标。

```vue
<template>
  <view class="icon-category">
    <!-- 通讯 -->
    <view class="category-section">
      <text class="category-title">通讯</text>
      <wd-icon name="call" />
      <wd-icon name="phone" />
      <wd-icon name="message" />
      <wd-icon name="mail" />
      <wd-icon name="chat" />
    </view>

    <!-- 多媒体 -->
    <view class="category-section">
      <text class="category-title">多媒体</text>
      <wd-icon name="video" />
      <wd-icon name="audio" />
      <wd-icon name="camera" />
      <wd-icon name="image" />
      <wd-icon name="sound" />
    </view>

    <!-- 设备 -->
    <view class="category-section">
      <text class="category-title">设备</text>
      <wd-icon name="mobile" />
      <wd-icon name="iphone" />
      <wd-icon name="vibrate" />
      <wd-icon name="battery" />
    </view>

    <!-- 网络 -->
    <view class="category-section">
      <text class="category-title">网络</text>
      <wd-icon name="wifi" />
      <wd-icon name="wifi-error" />
      <wd-icon name="bluetooth" />
      <wd-icon name="signal" />
      <wd-icon name="internet" />
      <wd-icon name="detection" />
    </view>

    <!-- 云服务 -->
    <view class="category-section">
      <text class="category-title">云服务</text>
      <wd-icon name="cloud" />
      <wd-icon name="cloud-upload" />
      <wd-icon name="cloud-download" />
    </view>
  </view>
</template>
```

**完整图标列表:**
call, call-fill, phone, phone-fill, message, message-fill, mail, mail-fill, chat, chat-fill, video, video-fill, audio, audio-fill, camera, camera-fill, image, image-fill, mobile, mobile-fill, vibrate, vibrate-fill, sound, sound-fill, wifi, wifi-fill, wifi-error, wifi-error-fill, bluetooth, bluetooth-fill, signal, signal-fill, battery, battery-fill, cloud, cloud-fill, cloud-upload, cloud-upload-fill, cloud-download, cloud-download-fill, internet, internet-fill, detection, detection-fill, iphone, iphone-fill

参考: src/wd/components/wd-icon/wd-icon.vue:216-261

### 商业功能类(32个)

电商、支付、订单等商业场景图标。

```vue
<template>
  <view class="icon-category">
    <!-- 购物 -->
    <view class="category-section">
      <text class="category-title">购物</text>
      <wd-icon name="cart" />
      <wd-icon name="cart-fill" />
      <wd-icon name="shop" />
      <wd-icon name="shop-fill" />
      <wd-icon name="goods" />
      <wd-icon name="goods-fill" />
      <wd-icon name="bag" />
      <wd-icon name="bag-fill" />
    </view>

    <!-- 支付 -->
    <view class="category-section">
      <text class="category-title">支付</text>
      <wd-icon name="payment" />
      <wd-icon name="payment-fill" />
      <wd-icon name="wallet" />
      <wd-icon name="wallet-fill" />
      <wd-icon name="card" />
      <wd-icon name="card-fill" />
      <wd-icon name="money" />
      <wd-icon name="money-fill" />
    </view>

    <!-- 订单 -->
    <view class="category-section">
      <text class="category-title">订单</text>
      <wd-icon name="order" />
      <wd-icon name="order-fill" />
      <wd-icon name="delivery" />
      <wd-icon name="delivery-fill" />
    </view>

    <!-- 营销 -->
    <view class="category-section">
      <text class="category-title">营销</text>
      <wd-icon name="coupon" />
      <wd-icon name="coupon-fill" />
      <wd-icon name="gift" />
      <wd-icon name="gift-fill" />
      <wd-icon name="discount" />
      <wd-icon name="discount-fill" />
    </view>

    <!-- 其他 -->
    <view class="category-section">
      <text class="category-title">其他</text>
      <wd-icon name="qrcode" />
      <wd-icon name="subscribe" />
      <wd-icon name="read" />
      <wd-icon name="company" />
    </view>
  </view>
</template>
```

**完整图标列表:**
cart, cart-fill, payment, payment-fill, order, order-fill, coupon, coupon-fill, gift, gift-fill, wallet, wallet-fill, card, card-fill, shop, shop-fill, goods, goods-fill, money, money-fill, discount, discount-fill, qrcode, qrcode-fill, bag, bag-fill, delivery, delivery-fill, subscribe, subscribe-fill, read, read-fill, company, company-fill

参考: src/wd/components/wd-icon/wd-icon.vue:263-296

### 文件管理类(36个)

文件、文件夹、各类文档格式图标。

```vue
<template>
  <view class="icon-category">
    <!-- 文件 -->
    <view class="category-section">
      <text class="category-title">文件</text>
      <wd-icon name="file" />
      <wd-icon name="file-fill" />
      <wd-icon name="file-add" />
      <wd-icon name="file-add-fill" />
      <wd-icon name="file-copy" />
      <wd-icon name="file-paste" />
    </view>

    <!-- 文件夹 -->
    <view class="category-section">
      <text class="category-title">文件夹</text>
      <wd-icon name="folder" />
      <wd-icon name="folder-fill" />
      <wd-icon name="folder-open" />
      <wd-icon name="folder-open-fill" />
      <wd-icon name="folder-add" />
      <wd-icon name="folder-add-fill" />
    </view>

    <!-- 文档类型 -->
    <view class="category-section">
      <text class="category-title">文档</text>
      <wd-icon name="file-word" color="#2b579a" />
      <wd-icon name="file-word-fill" color="#2b579a" />
      <wd-icon name="file-excel" color="#207245" />
      <wd-icon name="file-excel-fill" color="#207245" />
      <wd-icon name="file-ppt" color="#d24726" />
      <wd-icon name="file-ppt-fill" color="#d24726" />
      <wd-icon name="file-pdf" color="#f40f02" />
      <wd-icon name="file-pdf-fill" color="#f40f02" />
      <wd-icon name="file-unknown" />
      <wd-icon name="file-unknown-fill" />
    </view>

    <!-- 其他 -->
    <view class="category-section">
      <text class="category-title">其他</text>
      <wd-icon name="attach" />
      <wd-icon name="book" />
      <wd-icon name="book-fill" />
    </view>
  </view>
</template>
```

**完整图标列表:**
file, file-fill, file-add, file-add-fill, file-copy, file-copy-fill, file-paste, file-paste-fill, folder, folder-fill, folder-open, folder-open-fill, folder-add, folder-add-fill, file-word, file-word-fill, file-excel, file-excel-fill, file-ppt, file-ppt-fill, file-pdf, file-pdf-fill, file-unknown, file-unknown-fill, attach, attach-fill, book, book-fill

参考: src/wd/components/wd-icon/wd-icon.vue:298-325

### 工具功能类(34个)

日历、地图、工具、设备等功能性图标。

```vue
<template>
  <view class="icon-category">
    <!-- 日期位置 -->
    <wd-icon name="calendar" />
    <wd-icon name="calendar-fill" />
    <wd-icon name="location" />
    <wd-icon name="location-fill" />
    <wd-icon name="map" />
    <wd-icon name="map-fill" />

    <!-- 设备 -->
    <wd-icon name="tools" />
    <wd-icon name="laptop" />
    <wd-icon name="desktop" />
    <wd-icon name="app" />

    <!-- 服务 -->
    <wd-icon name="history" />
    <wd-icon name="service" />
    <wd-icon name="layers" />

    <!-- 输入 -->
    <wd-icon name="keyboard" />
    <wd-icon name="keyboard-delete" />
    <wd-icon name="cursor" />
    <wd-icon name="pointing-hand" />

    <!-- 其他 -->
    <wd-icon name="fork" />
    <wd-icon name="ellipsis" />
  </view>
</template>
```

**完整图标列表:**
calendar, calendar-fill, location, location-fill, map, map-fill, tools, tools-fill, laptop, laptop-fill, desktop, desktop-fill, app, app-fill, history, history-fill, service, service-fill, layers, layers-fill, fork, fork-fill, cursor, cursor-fill, pointing-hand, pointing-hand-fill, keyboard, keyboard-fill, keyboard-delete, keyboard-delete-fill, ellipsis, ellipsis-fill

参考: src/wd/components/wd-icon/wd-icon.vue:327-358

### 数据图表类(20个)

图表、数据、趋势等数据可视化相关图标。

```vue
<template>
  <view class="icon-category">
    <!-- 图表 -->
    <wd-icon name="chart" />
    <wd-icon name="chart-fill" />
    <wd-icon name="chart-bar" />
    <wd-icon name="chart-bar-fill" />

    <!-- 趋势 -->
    <wd-icon name="trending-up" color="#52c41a" />
    <wd-icon name="trending-down" color="#f5222d" />

    <!-- 数据 -->
    <wd-icon name="data" />
    <wd-icon name="data-fill" />

    <!-- 排序 -->
    <wd-icon name="asc" />
    <wd-icon name="desc" />

    <!-- 其他 -->
    <wd-icon name="move" />
    <wd-icon name="rectangle" />
    <wd-icon name="demo" />
  </view>
</template>
```

**完整图标列表:**
chart, chart-fill, chart-bar, chart-bar-fill, trending-up, trending-down, data, data-fill, asc, desc, move, move-fill, rectangle, rectangle-fill, demo, demo-fill

参考: src/wd/components/wd-icon/wd-icon.vue:360-375

### 社交功能类(26个)

评论、回复、关注等社交互动图标。

```vue
<template>
  <view class="icon-category">
    <!-- 交流 -->
    <wd-icon name="comment" />
    <wd-icon name="comment-fill" />
    <wd-icon name="reply" />
    <wd-icon name="reply-fill" />
    <wd-icon name="mention" />
    <wd-icon name="hashtag" />

    <!-- 关注 -->
    <wd-icon name="follow" />
    <wd-icon name="follow-fill" />
    <wd-icon name="unfollow" />
    <wd-icon name="follower" />
    <wd-icon name="friend-add" />

    <!-- 互动 -->
    <wd-icon name="group-chat" />
    <wd-icon name="emoji" />
    <wd-icon name="moments" />
  </view>
</template>
```

**完整图标列表:**
comment, comment-fill, reply, reply-fill, mention, mention-fill, hashtag, hashtag-fill, follow, follow-fill, unfollow, unfollow-fill, follower, follower-fill, friend-add, friend-add-fill, group-chat, group-chat-fill, emoji, emoji-fill, moments, moments-fill

参考: src/wd/components/wd-icon/wd-icon.vue:377-398

### 平台品牌类(20个)

各大平台和操作系统的品牌图标。

```vue
<template>
  <view class="icon-category">
    <!-- 社交平台 -->
    <wd-icon name="wechat" color="#09bb07" size="32" />
    <wd-icon name="wechat-fill" color="#09bb07" size="32" />
    <wd-icon name="qq" color="#12b7f5" size="32" />
    <wd-icon name="weibo" color="#e6162d" size="32" />
    <wd-icon name="tiktok" size="32" />

    <!-- 支付 -->
    <wd-icon name="alipay" color="#1678ff" size="32" />
    <wd-icon name="alipay-fill" color="#1678ff" size="32" />

    <!-- 开发平台 -->
    <wd-icon name="github" size="32" />
    <wd-icon name="github-fill" size="32" />

    <!-- 操作系统 -->
    <wd-icon name="apple" size="32" />
    <wd-icon name="apple-fill" size="32" />
    <wd-icon name="android" color="#3ddc84" size="32" />
    <wd-icon name="android-fill" color="#3ddc84" size="32" />
    <wd-icon name="windows" color="#0078d4" size="32" />
    <wd-icon name="windows-fill" color="#0078d4" size="32" />

    <!-- 浏览器 -->
    <wd-icon name="chrome" size="32" />
    <wd-icon name="chrome-fill" size="32" />
  </view>
</template>
```

**完整图标列表:**
wechat, wechat-fill, qq, qq-fill, weibo, weibo-fill, alipay, alipay-fill, github, github-fill, apple, apple-fill, android, android-fill, windows, windows-fill, chrome, chrome-fill, tiktok, tiktok-fill

参考: src/wd/components/wd-icon/wd-icon.vue:400-419

## 事件处理

### 点击事件

图标组件支持点击事件,可作为按钮或交互元素使用。

```vue
<template>
  <view class="demo">
    <!-- 基础点击 -->
    <wd-icon
      name="delete"
      size="24"
      color="#f5222d"
      @click="handleDelete"
    />

    <!-- 传递参数 -->
    <wd-icon
      v-for="item in list"
      :key="item.id"
      name="close"
      size="20"
      @click="handleRemove(item.id)"
    />

    <!-- 阻止冒泡 -->
    <view @click="handleParentClick">
      <wd-icon
        name="edit"
        size="24"
        @click.stop="handleEdit"
      />
    </view>

    <!-- 禁用状态 -->
    <view :class="{ disabled: isDisabled }">
      <wd-icon
        name="save"
        size="24"
        :color="isDisabled ? '#d9d9d9' : '#1890ff'"
        @click="handleSave"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDisabled = ref(false)
const list = ref([
  { id: 1, name: '项目 1' },
  { id: 2, name: '项目 2' },
])

// 基础点击处理
const handleDelete = (event: Event) => {
  console.log('点击删除图标', event)
  uni.showModal({
    title: '确认删除',
    content: '确定要删除吗?',
    success: (res) => {
      if (res.confirm) {
        console.log('确认删除')
      }
    },
  })
}

// 传递参数
const handleRemove = (id: number) => {
  list.value = list.value.filter(item => item.id !== id)
}

// 阻止冒泡
const handleParentClick = () => {
  console.log('父元素被点击')
}

const handleEdit = (event: Event) => {
  console.log('编辑图标被点击,不会触发父元素点击')
}

// 禁用状态处理
const handleSave = () => {
  if (isDisabled.value) {
    return // 禁用时不执行
  }
  console.log('保存')
}
</script>

```

**事件处理说明:**
- click 事件会传递原始的 Event 对象
- 支持 Vue 事件修饰符(.stop, .prevent 等)
- 图标本身没有禁用状态,需要通过样式和逻辑控制
- 可以在父容器上添加 pointer-events: none 禁用点击

参考: src/wd/components/wd-icon/wd-icon.vue:456-457, 533-535

## 高级用法

### 自定义图标字体

使用自己的图标字体库,通过 `class-prefix` 属性指定类名前缀。

```vue
<template>
  <view class="demo">
    <!-- 使用自定义图标字体 -->
    <wd-icon
      name="custom-home"
      class-prefix="my-icon"
      size="24"
    />

    <wd-icon
      name="custom-user"
      class-prefix="my-icon"
      size="24"
      color="#1890ff"
    />
  </view>
</template>

<style lang="scss">
// 引入自定义图标字体
@font-face {
  font-family: 'MyIconFont';
  src: url('/static/fonts/my-icons.woff2') format('woff2'),
       url('/static/fonts/my-icons.woff') format('woff'),
       url('/static/fonts/my-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

// 设置类名前缀
.my-icon {
  font-family: 'MyIconFont' !important;
}

// 定义图标样式
.my-icon-custom-home:before {
  content: '\e001';
}

.my-icon-custom-user:before {
  content: '\e002';
}
</style>
```

**实现原理:**
- `class-prefix` 默认值为 'wd-icon'
- 组件会生成 `${classPrefix}-${name}` 格式的类名
- 通过 CSS `@font-face` 加载自定义字体文件
- 使用 `:before` 伪元素设置字体图标内容

参考: src/wd/components/wd-icon/wd-icon.vue:449, 466, 500-502

### 动画效果

为图标添加各种动画效果。

```vue
<template>
  <view class="demo">
    <!-- 旋转动画(加载中) -->
    <wd-icon
      name="loading-fill"
      size="32"
      color="#1890ff"
      custom-class="spinning"
    />

    <!-- 心跳动画 -->
    <wd-icon
      name="heart-fill"
      size="32"
      color="#ff4d4f"
      custom-class="pulse"
    />

    <!-- 摇摆动画(提示) -->
    <wd-icon
      name="notification-fill"
      size="32"
      color="#faad14"
      custom-class="shake"
    />

    <!-- 弹跳动画 -->
    <wd-icon
      name="arrow-down"
      size="32"
      custom-class="bounce"
    />

    <!-- 渐变闪烁 -->
    <wd-icon
      name="star-fill"
      size="32"
      color="#faad14"
      custom-class="blink"
    />
  </view>
</template>

```

**动画使用建议:**
- 加载状态使用旋转动画
- 重要通知使用心跳或摇摆动画
- 引导用户注意使用弹跳动画
- 谨慎使用动画,避免过度影响性能
- 在小程序中测试动画兼容性

### 图标按钮组合

将图标与按钮、徽标等组件组合使用。

```vue
<template>
  <view class="demo">
    <!-- 图标按钮 -->
    <wd-button type="primary">
      <wd-icon name="search" size="16" custom-style="margin-right: 8rpx;" />
      搜索
    </wd-button>

    <!-- 纯图标按钮 -->
    <wd-button type="icon" size="medium">
      <wd-icon name="setting" size="20" />
    </wd-button>

    <!-- 带徽标的图标 -->
    <view class="icon-badge">
      <wd-icon name="notification" size="24" />
      <view class="badge">5</view>
    </view>

    <!-- 图标组 -->
    <view class="icon-group">
      <view class="icon-item" @click="handleLike">
        <wd-icon :name="liked ? 'heart-fill' : 'heart'" :color="liked ? '#ff4d4f' : '#8c8c8c'" size="20" />
        <text>{{ likeCount }}</text>
      </view>
      <view class="icon-item" @click="handleShare">
        <wd-icon name="share" size="20" />
        <text>分享</text>
      </view>
      <view class="icon-item" @click="handleComment">
        <wd-icon name="comment" size="20" />
        <text>{{ commentCount }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const liked = ref(false)
const likeCount = ref(128)
const commentCount = ref(45)

const handleLike = () => {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
}

const handleShare = () => {
  uni.showShareMenu()
}

const handleComment = () => {
  console.log('打开评论')
}
</script>

```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 图标名称,支持字体图标名、UnoCSS 图标(i- 开头)或图片路径 | `IconName` | - |
| color | 图标颜色,支持所有 CSS 颜色值 | `string` | - |
| size | 图标大小,数字自动转换为 rpx,字符串保持原单位 | `string \| number` | `40` |
| class-prefix | 图标类名前缀,用于自定义图标字体 | `string` | `'wd-icon'` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: src/wd/components/wd-icon/wd-icon.vue:437-450

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击图标时触发 | `event: Event` |
| touch | 触摸图标时触发(已声明但未实现) | `event: Event` |

参考: src/wd/components/wd-icon/wd-icon.vue:455-460, 533-535

### 类型定义

```typescript
/**
 * 字体图标名称类型(300+ 个预定义图标)
 */
type FontIconName =
  | 'home' | 'home-fill'
  | 'search' | 'search-fill'
  // ... 300+ 图标名称

/**
 * UnoCSS 图标名称类型(以 i- 开头)
 */
type UnoIconName = `i-${string}`

/**
 * 图标名称联合类型
 */
export type IconName = FontIconName | UnoIconName | string

/**
 * 图标组件属性接口
 */
interface WdIconProps {
  customStyle?: string
  customClass?: string
  name: IconName
  color?: string
  size?: string | number
  classPrefix?: string
}

/**
 * 图标组件事件接口
 */
interface WdIconEmits {
  click: [event: Event]
  touch: [event: Event]
}
```

参考: src/wd/components/wd-icon/wd-icon.vue:24-460

## 主题定制

Icon 组件通过继承父元素的 color 和 font-size 实现主题定制,也支持通过 CSS 变量统一管理。

```scss
// 全局样式定制
:root {
  // 默认图标颜色
  --wd-icon-color: #333333;

  // 默认图标大小
  --wd-icon-size: 40rpx;

  // 主题色图标
  --wd-icon-primary: #1890ff;
  --wd-icon-success: #52c41a;
  --wd-icon-warning: #faad14;
  --wd-icon-danger: #f5222d;
  --wd-icon-info: #8c8c8c;
}

// 暗黑模式
.dark {
  --wd-icon-color: #e8e8e8;
  --wd-icon-primary: #177ddc;
  --wd-icon-success: #49aa19;
  --wd-icon-warning: #d89614;
  --wd-icon-danger: #d32029;
  --wd-icon-info: #bfbfbf;
}
```

```vue
<template>
  <view class="demo">
    <!-- 使用 CSS 变量 -->
    <wd-icon name="check-fill" :color="'var(--wd-icon-success)'" />
    <wd-icon name="warn-fill" :color="'var(--wd-icon-warning)'" />
    <wd-icon name="close-fill" :color="'var(--wd-icon-danger)'" />
    <wd-icon name="info-fill" :color="'var(--wd-icon-info)'" />
  </view>
</template>
```

**自定义字体加载路径:**

如果需要修改字体文件加载路径(如使用本地字体或私有 CDN):

```scss
// 覆盖默认字体定义
@font-face {
  font-family: 'wd-icons';
  src:
    url('/static/fonts/wd-icons.woff2') format('woff2'),
    url('/static/fonts/wd-icons.woff') format('woff'),
    url('/static/fonts/wd-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
```

参考: src/wd/components/wd-icon/wd-icon.vue:544-562

## 最佳实践

### 1. 图标选择建议

**线性 vs 填充样式:**
- 线性图标(默认):适用于次要操作、列表项、导航等
- 填充图标(-fill):适用于强调、选中状态、主要操作

**示例:**
```vue
<template>
  <!-- 未选中状态使用线性图标 -->
  <wd-icon v-if="!isFavorite" name="star" @click="toggleFavorite" />

  <!-- 选中状态使用填充图标 -->
  <wd-icon v-else name="star-fill" color="#faad14" @click="toggleFavorite" />
</template>
```

### 2. 尺寸规范

推荐的图标尺寸规范:

- **超小图标**: 16-20rpx (用于表格、密集列表)
- **小图标**: 24-28rpx (用于按钮、输入框)
- **常规图标**: 32-40rpx (用于列表项、卡片)
- **大图标**: 48-64rpx (用于标签页、空状态)
- **超大图标**: 96rpx+ (用于启动页、引导页)

```vue
<template>
  <view class="demo">
    <!-- 表格行内图标 -->
    <wd-icon name="edit" :size="16" />

    <!-- 按钮图标 -->
    <wd-icon name="search" :size="24" />

    <!-- 列表图标 -->
    <wd-icon name="user" :size="32" />

    <!-- Tab 图标 -->
    <wd-icon name="home" :size="48" />
  </view>
</template>
```

### 3. 颜色语义化

使用语义化颜色提升用户体验:

```vue
<template>
  <view class="demo">
    <!-- 成功状态 -->
    <wd-icon name="check-outline-fill" color="#52c41a" />

    <!-- 警告状态 -->
    <wd-icon name="warn-fill" color="#faad14" />

    <!-- 错误状态 -->
    <wd-icon name="close-outline-fill" color="#f5222d" />

    <!-- 信息状态 -->
    <wd-icon name="info-fill" color="#1890ff" />

    <!-- 禁用状态 -->
    <wd-icon name="locked" color="#d9d9d9" />
  </view>
</template>
```

### 4. 性能优化

**减少动画使用:**
```vue
<template>
  <!-- ❌ 不推荐:页面中大量使用动画 -->
  <view v-for="item in 100">
    <wd-icon name="loading" custom-class="spinning" />
  </view>

  <!-- ✅ 推荐:仅在必要时使用动画 -->
  <wd-icon v-if="isLoading" name="loading" custom-class="spinning" />
</template>
```

**图片图标优化:**
```vue
<template>
  <!-- ❌ 不推荐:使用大尺寸原图 -->
  <wd-icon name="/static/icons/large-icon.png" size="24" />

  <!-- ✅ 推荐:使用适配尺寸的图片 -->
  <wd-icon name="/static/icons/icon-48.png" size="24" />
</template>
```

### 5. 无障碍支持

为图标添加语义化说明:

```vue
<template>
  <view class="demo">
    <!-- 纯图标按钮需要添加 aria-label -->
    <view
      role="button"
      aria-label="删除"
      @click="handleDelete"
    >
      <wd-icon name="delete" size="24" />
    </view>

    <!-- 带文字说明的图标无需额外处理 -->
    <view class="icon-text">
      <wd-icon name="search" size="20" />
      <text>搜索</text>
    </view>
  </view>
</template>
```

## 常见问题

### 1. 图标不显示

**问题原因:**
- 字体文件加载失败
- 图标名称拼写错误
- 网络问题导致 CDN 资源加载失败

**解决方案:**
```vue
<script setup>
// 1. 检查图标名称是否正确(使用 TypeScript 可自动提示)
const iconName: IconName = 'home' // ✅ 正确
const iconName = 'homes' // ❌ 拼写错误

// 2. APP 平台使用本地字体
// 组件已自动处理,会加载 src/wd/components/wd-icon/wd-icons.ttf

// 3. 检查网络和 CDN
// 打开浏览器控制台查看字体文件是否加载成功
// 如果 CDN 不可用,下载字体文件放到本地
</script>
```

参考: src/wd/components/wd-icon/wd-icon.vue:544-562

### 2. 图标大小不准确

**问题原因:**
- 使用了不同的单位(px vs rpx)
- 父元素的 font-size 影响

**解决方案:**
```vue
<template>
  <!-- ✅ 推荐:使用数字,自动转换为 rpx -->
  <wd-icon name="home" :size="32" />

  <!-- ⚠️ 注意:使用 px 在不同设备上大小不同 -->
  <wd-icon name="home" size="16px" />

  <!-- ✅ 使用 em 实现响应式 -->
  <view style="font-size: 32rpx;">
    <wd-icon name="home" size="1em" />
  </view>
</template>
```

参考: src/wd/components/wd-icon/wd-icon.vue:518-520

### 3. UnoCSS 图标不显示

**问题原因:**
- 项目未配置 UnoCSS
- 图标集合未安装

**解决方案:**
```bash
# 1. 安装 UnoCSS 和图标集合
npm install -D unocss @iconify/json

# 2. 配置 uno.config.ts
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
})

# 3. 使用图标
<wd-icon name="i-carbon-home" size="24" />
```

参考: src/wd/components/wd-icon/wd-icon.vue:482-486, 497-499

### 4. 图标颜色无法修改

**问题原因:**
- 使用了图片图标(不支持 color 属性)
- CSS 样式优先级问题

**解决方案:**
```vue
<template>
  <!-- ❌ 图片图标不支持 color -->
  <wd-icon name="/static/icon.png" color="#ff0000" />

  <!-- ✅ 使用滤镜改变图片颜色 -->
  <wd-icon
    name="/static/icon.png"
    custom-style="filter: brightness(0) saturate(100%) invert(27%) sepia(98%) saturate(7471%) hue-rotate(356deg);"
  />

  <!-- ✅ 字体图标使用 color -->
  <wd-icon name="home" color="#ff0000" />

  <!-- ✅ 使用 !important 提升优先级 -->
  <wd-icon
    name="home"
    custom-style="color: #ff0000 !important;"
  />
</template>
```

参考: src/wd/components/wd-icon/wd-icon.vue:514-516

### 5. 小程序中图标锯齿

**问题原因:**
- 字体渲染引擎差异
- 图标大小非整数

**解决方案:**
```vue
<template>
  <!-- ❌ 避免使用小数或非标准尺寸 -->
  <wd-icon name="home" :size="23.5" />

  <!-- ✅ 使用偶数尺寸 -->
  <wd-icon name="home" :size="24" />

  <!-- ✅ 添加抗锯齿样式 -->
  <wd-icon
    name="home"
    :size="24"
    custom-style="-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;"
  />
</template>
```

参考: src/wd/components/wd-icon/wd-icon.vue:568-572
