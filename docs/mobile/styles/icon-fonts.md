# 图标字体

## 概述

RuoYi-Plus-UniApp 移动端项目的 WD UI 组件库提供了完整的图标字体系统，支持三种图标使用方式：字体图标、UnoCSS 图标和图片图标。图标系统采用阿里巴巴 iconfont 字体库，提供了 300+ 精心设计的图标，覆盖系统操作、导航、状态、用户、通讯、商业、文件、工具、数据、社交和平台品牌等多个分类。

**图标字体系统特点:**

- **三种图标类型** - 支持字体图标、UnoCSS 图标和图片图标三种方式
- **300+ 内置图标** - 覆盖常见业务场景的丰富图标集
- **11 大分类** - 系统操作、导航箭头、状态指示、用户相关等分类清晰
- **双风格设计** - 每个图标提供线性和填充两种风格
- **跨平台兼容** - 支持 H5、小程序、App 等多端一致显示
- **按需加载** - UnoCSS 图标支持按需加载，减少包体积
- **自定义支持** - 支持自定义图标字体和图标前缀

## 图标类型

### 字体图标

字体图标是 WD UI 内置的图标类型，使用 iconfont 字体实现，所有图标以 Unicode 编码存储在字体文件中。

```vue
<template>
  <view class="icon-demo">
    <!-- 基本使用 -->
    <wd-icon name="home" />
    <wd-icon name="search" />
    <wd-icon name="setting" />

    <!-- 填充风格 -->
    <wd-icon name="home-fill" />
    <wd-icon name="search-fill" />
    <wd-icon name="setting-fill" />

    <!-- 自定义大小 -->
    <wd-icon name="user" size="48" />

    <!-- 自定义颜色 -->
    <wd-icon name="heart" color="#ff4d4f" />
    <wd-icon name="heart-fill" color="#ff4d4f" />
  </view>
</template>
```

**字体图标特点:**

- 使用 `wd-icons` 字体族
- 支持 CSS 控制颜色、大小
- 所有图标都有线性和填充两种风格
- 填充风格图标名称以 `-fill` 结尾

### UnoCSS 图标

UnoCSS 图标通过图标名称以 `i-` 前缀开头来识别，支持 Iconify 生态中的海量图标。

```vue
<template>
  <view class="unocss-icon-demo">
    <!-- UnoCSS 图标使用 i- 前缀 -->
    <wd-icon name="i-carbon-home" />
    <wd-icon name="i-mdi-account" />
    <wd-icon name="i-ph-heart-bold" />

    <!-- 自定义大小和颜色 -->
    <wd-icon name="i-carbon-search" size="32" color="#1890ff" />
  </view>
</template>
```

**UnoCSS 图标特点:**

- 以 `i-` 前缀开头
- 支持 Iconify 图标库中的所有图标
- 按需加载，只打包使用的图标
- 图标命名格式: `i-{collection}-{icon-name}`

**常用图标集:**

| 图标集 | 前缀 | 说明 |
|--------|------|------|
| Carbon | `i-carbon-` | IBM Carbon Design 图标 |
| Material Design Icons | `i-mdi-` | Google Material Design 图标 |
| Phosphor | `i-ph-` | Phosphor 图标 |
| Tabler Icons | `i-tabler-` | Tabler 图标集 |
| Heroicons | `i-heroicons-` | Tailwind CSS 官方图标 |
| Lucide | `i-lucide-` | Lucide 图标 |
| Font Awesome | `i-fa-` | Font Awesome 图标 |

### 图片图标

当图标名称包含 `/` 时，会被识别为图片路径，使用图片方式显示。

```vue
<template>
  <view class="image-icon-demo">
    <!-- 本地图片 -->
    <wd-icon name="/static/icons/custom-icon.png" size="40" />

    <!-- 网络图片 -->
    <wd-icon name="https://example.com/icon.png" size="40" />

    <!-- 相对路径 -->
    <wd-icon name="@/static/icons/logo.svg" size="48" />
  </view>
</template>
```

**图片图标特点:**

- 图标名称包含 `/` 即识别为图片
- 支持本地图片和网络图片
- 支持 PNG、JPG、SVG 等格式
- 图片会保持比例填充

## 图标分类

### 系统操作类

系统操作类图标用于常见的界面操作，如导航、编辑、删除等。

```vue
<template>
  <view class="icon-category">
    <!-- 首页和导航 -->
    <wd-icon name="home" />
    <wd-icon name="home-fill" />
    <wd-icon name="back" />
    <wd-icon name="back-fill" />
    <wd-icon name="menu" />
    <wd-icon name="menu-fill" />
    <wd-icon name="more" />
    <wd-icon name="more-fill" />

    <!-- 搜索和筛选 -->
    <wd-icon name="search" />
    <wd-icon name="search-fill" />
    <wd-icon name="filter" />
    <wd-icon name="filter-fill" />

    <!-- 关闭和确认 -->
    <wd-icon name="close" />
    <wd-icon name="close-fill" />
    <wd-icon name="close-outline" />
    <wd-icon name="close-outline-fill" />
    <wd-icon name="check" />
    <wd-icon name="check-fill" />
    <wd-icon name="check-outline" />
    <wd-icon name="check-outline-fill" />

    <!-- 编辑操作 -->
    <wd-icon name="add" />
    <wd-icon name="add-fill" />
    <wd-icon name="minus" />
    <wd-icon name="minus-fill" />
    <wd-icon name="edit" />
    <wd-icon name="edit-fill" />
    <wd-icon name="delete" />
    <wd-icon name="delete-fill" />
    <wd-icon name="copy" />
    <wd-icon name="copy-fill" />
    <wd-icon name="save" />
    <wd-icon name="save-fill" />

    <!-- 文件操作 -->
    <wd-icon name="upload" />
    <wd-icon name="upload-fill" />
    <wd-icon name="download" />
    <wd-icon name="download-fill" />
    <wd-icon name="print" />
    <wd-icon name="print-fill" />
    <wd-icon name="share" />
    <wd-icon name="share-fill" />
    <wd-icon name="link" />
    <wd-icon name="link-fill" />

    <!-- 系统操作 -->
    <wd-icon name="refresh" />
    <wd-icon name="refresh-fill" />
    <wd-icon name="setting" />
    <wd-icon name="setting-fill" />
    <wd-icon name="help" />
    <wd-icon name="help-fill" />
    <wd-icon name="clear" />
    <wd-icon name="clear-fill" />
    <wd-icon name="scan" />
    <wd-icon name="scan-fill" />

    <!-- 登录登出 -->
    <wd-icon name="login" />
    <wd-icon name="login-fill" />
    <wd-icon name="logout" />
    <wd-icon name="logout-fill" />
    <wd-icon name="poweroff" />
    <wd-icon name="poweroff-fill" />

    <!-- 播放控制 -->
    <wd-icon name="play" />
    <wd-icon name="play-fill" />
    <wd-icon name="pause" />
    <wd-icon name="pause-fill" />
    <wd-icon name="stop" />
    <wd-icon name="stop-fill" />
    <wd-icon name="next" />
    <wd-icon name="next-fill" />
    <wd-icon name="previous" />
    <wd-icon name="previous-fill" />
    <wd-icon name="forward" />
    <wd-icon name="forward-fill" />
    <wd-icon name="backward" />
    <wd-icon name="backward-fill" />

    <!-- 视图操作 -->
    <wd-icon name="fullscreen" />
    <wd-icon name="fullscreen-fill" />
    <wd-icon name="exit-fullscreen" />
    <wd-icon name="exit-fullscreen-fill" />
    <wd-icon name="zoom-in" />
    <wd-icon name="zoom-in-fill" />
    <wd-icon name="zoom-out" />
    <wd-icon name="zoom-out-fill" />
    <wd-icon name="rotate" />
    <wd-icon name="rotate-fill" />

    <!-- 其他 -->
    <wd-icon name="enter" />
    <wd-icon name="enter-fill" />
    <wd-icon name="jump" />
    <wd-icon name="jump-fill" />
    <wd-icon name="swap" />
    <wd-icon name="swap-fill" />
    <wd-icon name="translate" />
    <wd-icon name="translate-fill" />
    <wd-icon name="keywords" />
    <wd-icon name="keywords-fill" />
    <wd-icon name="rollback" />
    <wd-icon name="rollback-fill" />
  </view>
</template>
```

**系统操作类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `home` | `home-fill` | 首页 |
| `back` | `back-fill` | 返回 |
| `close` | `close-fill` | 关闭 |
| `close-outline` | `close-outline-fill` | 圆形关闭 |
| `check` | `check-fill` | 勾选 |
| `check-outline` | `check-outline-fill` | 圆形勾选 |
| `menu` | `menu-fill` | 菜单 |
| `more` | `more-fill` | 更多 |
| `search` | `search-fill` | 搜索 |
| `filter` | `filter-fill` | 筛选 |
| `refresh` | `refresh-fill` | 刷新 |
| `setting` | `setting-fill` | 设置 |
| `help` | `help-fill` | 帮助 |
| `add` | `add-fill` | 添加 |
| `minus` | `minus-fill` | 减少 |
| `edit` | `edit-fill` | 编辑 |
| `delete` | `delete-fill` | 删除 |
| `copy` | `copy-fill` | 复制 |
| `save` | `save-fill` | 保存 |
| `upload` | `upload-fill` | 上传 |
| `download` | `download-fill` | 下载 |
| `print` | `print-fill` | 打印 |
| `share` | `share-fill` | 分享 |
| `link` | `link-fill` | 链接 |
| `clear` | `clear-fill` | 清除 |
| `login` | `login-fill` | 登录 |
| `logout` | `logout-fill` | 登出 |
| `scan` | `scan-fill` | 扫描 |
| `play` | `play-fill` | 播放 |
| `pause` | `pause-fill` | 暂停 |
| `stop` | `stop-fill` | 停止 |
| `next` | `next-fill` | 下一个 |
| `previous` | `previous-fill` | 上一个 |
| `forward` | `forward-fill` | 快进 |
| `backward` | `backward-fill` | 快退 |
| `enter` | `enter-fill` | 进入 |
| `jump` | `jump-fill` | 跳转 |
| `swap` | `swap-fill` | 交换 |
| `rotate` | `rotate-fill` | 旋转 |
| `fullscreen` | `fullscreen-fill` | 全屏 |
| `exit-fullscreen` | `exit-fullscreen-fill` | 退出全屏 |
| `zoom-in` | `zoom-in-fill` | 放大 |
| `zoom-out` | `zoom-out-fill` | 缩小 |
| `translate` | `translate-fill` | 翻译 |
| `keywords` | `keywords-fill` | 关键词 |
| `rollback` | `rollback-fill` | 回滚 |
| `poweroff` | `poweroff-fill` | 关机 |

### 导航箭头类

导航箭头类图标用于指示方向和导航操作。

```vue
<template>
  <view class="arrow-icons">
    <!-- 简单方向 -->
    <wd-icon name="up" />
    <wd-icon name="down" />
    <wd-icon name="left" />
    <wd-icon name="right" />

    <!-- Chevron 箭头 -->
    <wd-icon name="chevron-up" />
    <wd-icon name="chevron-up-fill" />
    <wd-icon name="chevron-down" />
    <wd-icon name="chevron-down-fill" />
    <wd-icon name="chevron-left" />
    <wd-icon name="chevron-left-fill" />
    <wd-icon name="chevron-right" />
    <wd-icon name="chevron-right-fill" />

    <!-- Caret 三角 -->
    <wd-icon name="caret-up" />
    <wd-icon name="caret-up-fill" />
    <wd-icon name="caret-down" />
    <wd-icon name="caret-down-fill" />
    <wd-icon name="caret-left" />
    <wd-icon name="caret-left-fill" />
    <wd-icon name="caret-right" />
    <wd-icon name="caret-right-fill" />

    <!-- 分页导航 -->
    <wd-icon name="backtop" />
    <wd-icon name="backtop-fill" />
    <wd-icon name="page-first" />
    <wd-icon name="page-first-fill" />
    <wd-icon name="page-last" />
    <wd-icon name="page-last-fill" />

    <!-- 展开收起 -->
    <wd-icon name="unfold-more" />
    <wd-icon name="unfold-less" />
  </view>
</template>
```

**导航箭头类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `up` | - | 向上 |
| `down` | - | 向下 |
| `left` | - | 向左 |
| `right` | - | 向右 |
| `chevron-up` | `chevron-up-fill` | V形向上 |
| `chevron-down` | `chevron-down-fill` | V形向下 |
| `chevron-left` | `chevron-left-fill` | V形向左 |
| `chevron-right` | `chevron-right-fill` | V形向右 |
| `caret-up` | `caret-up-fill` | 三角向上 |
| `caret-down` | `caret-down-fill` | 三角向下 |
| `caret-left` | `caret-left-fill` | 三角向左 |
| `caret-right` | `caret-right-fill` | 三角向右 |
| `backtop` | `backtop-fill` | 返回顶部 |
| `page-first` | `page-first-fill` | 第一页 |
| `page-last` | `page-last-fill` | 最后一页 |
| `unfold-more` | - | 展开更多 |
| `unfold-less` | - | 收起 |

### 状态指示类

状态指示类图标用于显示各种状态、提示和反馈。

```vue
<template>
  <view class="status-icons">
    <!-- 提示状态 -->
    <wd-icon name="warn" />
    <wd-icon name="warn-fill" />
    <wd-icon name="info" />
    <wd-icon name="info-fill" />
    <wd-icon name="tips" />
    <wd-icon name="tips-fill" />

    <!-- 加载 -->
    <wd-icon name="loading" />
    <wd-icon name="loading-fill" />

    <!-- 锁定状态 -->
    <wd-icon name="locked" />
    <wd-icon name="locked-fill" />
    <wd-icon name="unlocked" />
    <wd-icon name="unlocked-fill" />

    <!-- 可见性 -->
    <wd-icon name="visible" />
    <wd-icon name="visible-fill" />
    <wd-icon name="hidden" />
    <wd-icon name="hidden-fill" />

    <!-- 时间 -->
    <wd-icon name="time" />
    <wd-icon name="time-fill" />
    <wd-icon name="clock" />
    <wd-icon name="clock-fill" />

    <!-- 收藏喜欢 -->
    <wd-icon name="star" />
    <wd-icon name="star-fill" />
    <wd-icon name="heart" />
    <wd-icon name="heart-fill" />
    <wd-icon name="favorite" />
    <wd-icon name="favorite-fill" />
    <wd-icon name="like" />
    <wd-icon name="like-fill" />
    <wd-icon name="dislike" />
    <wd-icon name="dislike-fill" />

    <!-- 标记 -->
    <wd-icon name="flag" />
    <wd-icon name="flag-fill" />
    <wd-icon name="pin" />
    <wd-icon name="pin-fill" />

    <!-- 安全通知 -->
    <wd-icon name="secured" />
    <wd-icon name="secured-fill" />
    <wd-icon name="notification" />
    <wd-icon name="notification-fill" />
  </view>
</template>
```

**状态指示类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `warn` | `warn-fill` | 警告 |
| `info` | `info-fill` | 信息 |
| `tips` | `tips-fill` | 提示 |
| `loading` | `loading-fill` | 加载中 |
| `locked` | `locked-fill` | 已锁定 |
| `unlocked` | `unlocked-fill` | 未锁定 |
| `visible` | `visible-fill` | 可见 |
| `hidden` | `hidden-fill` | 隐藏 |
| `time` | `time-fill` | 时间 |
| `clock` | `clock-fill` | 时钟 |
| `star` | `star-fill` | 星星 |
| `heart` | `heart-fill` | 心形 |
| `favorite` | `favorite-fill` | 收藏 |
| `like` | `like-fill` | 点赞 |
| `dislike` | `dislike-fill` | 踩 |
| `flag` | `flag-fill` | 旗帜 |
| `pin` | `pin-fill` | 图钉 |
| `secured` | `secured-fill` | 安全 |
| `notification` | `notification-fill` | 通知 |

### 用户相关类

用户相关类图标用于用户、团队和权限管理场景。

```vue
<template>
  <view class="user-icons">
    <!-- 用户基础 -->
    <wd-icon name="user" />
    <wd-icon name="user-fill" />
    <wd-icon name="user-add" />
    <wd-icon name="user-add-fill" />
    <wd-icon name="user-circle" />
    <wd-icon name="user-circle-fill" />

    <!-- 团队组织 -->
    <wd-icon name="team" />
    <wd-icon name="team-fill" />
    <wd-icon name="user-group" />
    <wd-icon name="user-group-fill" />
    <wd-icon name="contact" />
    <wd-icon name="contact-fill" />

    <!-- 权限角色 -->
    <wd-icon name="admin" />
    <wd-icon name="admin-fill" />
    <wd-icon name="vip" />
    <wd-icon name="vip-fill" />

    <!-- 用户互动 -->
    <wd-icon name="user-talk" />
    <wd-icon name="user-talk-fill" />

    <!-- 性别 -->
    <wd-icon name="male" />
    <wd-icon name="male-fill" />
    <wd-icon name="female" />
    <wd-icon name="female-fill" />

    <!-- 等级徽章 -->
    <wd-icon name="crown" />
    <wd-icon name="crown-fill" />
    <wd-icon name="diamon" />
    <wd-icon name="diamon-fill" />
  </view>
</template>
```

**用户相关类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `user` | `user-fill` | 用户 |
| `user-add` | `user-add-fill` | 添加用户 |
| `user-circle` | `user-circle-fill` | 用户头像 |
| `team` | `team-fill` | 团队 |
| `user-group` | `user-group-fill` | 用户组 |
| `contact` | `contact-fill` | 联系人 |
| `admin` | `admin-fill` | 管理员 |
| `vip` | `vip-fill` | VIP |
| `user-talk` | `user-talk-fill` | 用户交流 |
| `male` | `male-fill` | 男性 |
| `female` | `female-fill` | 女性 |
| `crown` | `crown-fill` | 皇冠 |
| `diamon` | `diamon-fill` | 钻石 |

### 通讯媒体类

通讯媒体类图标用于通讯、多媒体和设备相关场景。

```vue
<template>
  <view class="media-icons">
    <!-- 通讯 -->
    <wd-icon name="call" />
    <wd-icon name="call-fill" />
    <wd-icon name="phone" />
    <wd-icon name="phone-fill" />
    <wd-icon name="message" />
    <wd-icon name="message-fill" />
    <wd-icon name="mail" />
    <wd-icon name="mail-fill" />
    <wd-icon name="chat" />
    <wd-icon name="chat-fill" />

    <!-- 多媒体 -->
    <wd-icon name="video" />
    <wd-icon name="video-fill" />
    <wd-icon name="audio" />
    <wd-icon name="audio-fill" />
    <wd-icon name="camera" />
    <wd-icon name="camera-fill" />
    <wd-icon name="image" />
    <wd-icon name="image-fill" />

    <!-- 设备 -->
    <wd-icon name="mobile" />
    <wd-icon name="mobile-fill" />
    <wd-icon name="iphone" />
    <wd-icon name="iphone-fill" />
    <wd-icon name="vibrate" />
    <wd-icon name="vibrate-fill" />

    <!-- 声音网络 -->
    <wd-icon name="sound" />
    <wd-icon name="sound-fill" />
    <wd-icon name="wifi" />
    <wd-icon name="wifi-fill" />
    <wd-icon name="wifi-error" />
    <wd-icon name="wifi-error-fill" />
    <wd-icon name="bluetooth" />
    <wd-icon name="bluetooth-fill" />
    <wd-icon name="signal" />
    <wd-icon name="signal-fill" />

    <!-- 电池云服务 -->
    <wd-icon name="battery" />
    <wd-icon name="battery-fill" />
    <wd-icon name="cloud" />
    <wd-icon name="cloud-fill" />
    <wd-icon name="cloud-upload" />
    <wd-icon name="cloud-upload-fill" />
    <wd-icon name="cloud-download" />
    <wd-icon name="cloud-download-fill" />

    <!-- 网络检测 -->
    <wd-icon name="internet" />
    <wd-icon name="internet-fill" />
    <wd-icon name="detection" />
    <wd-icon name="detection-fill" />
  </view>
</template>
```

**通讯媒体类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `call` | `call-fill` | 拨打 |
| `phone` | `phone-fill` | 电话 |
| `message` | `message-fill` | 消息 |
| `mail` | `mail-fill` | 邮件 |
| `chat` | `chat-fill` | 聊天 |
| `video` | `video-fill` | 视频 |
| `audio` | `audio-fill` | 音频 |
| `camera` | `camera-fill` | 相机 |
| `image` | `image-fill` | 图片 |
| `mobile` | `mobile-fill` | 手机 |
| `iphone` | `iphone-fill` | iPhone |
| `vibrate` | `vibrate-fill` | 振动 |
| `sound` | `sound-fill` | 声音 |
| `wifi` | `wifi-fill` | WiFi |
| `wifi-error` | `wifi-error-fill` | WiFi错误 |
| `bluetooth` | `bluetooth-fill` | 蓝牙 |
| `signal` | `signal-fill` | 信号 |
| `battery` | `battery-fill` | 电池 |
| `cloud` | `cloud-fill` | 云 |
| `cloud-upload` | `cloud-upload-fill` | 云上传 |
| `cloud-download` | `cloud-download-fill` | 云下载 |
| `internet` | `internet-fill` | 互联网 |
| `detection` | `detection-fill` | 检测 |

### 商业功能类

商业功能类图标用于电商、支付、订单等商业场景。

```vue
<template>
  <view class="business-icons">
    <!-- 购物 -->
    <wd-icon name="cart" />
    <wd-icon name="cart-fill" />
    <wd-icon name="bag" />
    <wd-icon name="bag-fill" />
    <wd-icon name="goods" />
    <wd-icon name="goods-fill" />
    <wd-icon name="shop" />
    <wd-icon name="shop-fill" />

    <!-- 支付金融 -->
    <wd-icon name="payment" />
    <wd-icon name="payment-fill" />
    <wd-icon name="wallet" />
    <wd-icon name="wallet-fill" />
    <wd-icon name="card" />
    <wd-icon name="card-fill" />
    <wd-icon name="money" />
    <wd-icon name="money-fill" />

    <!-- 订单优惠 -->
    <wd-icon name="order" />
    <wd-icon name="order-fill" />
    <wd-icon name="coupon" />
    <wd-icon name="coupon-fill" />
    <wd-icon name="discount" />
    <wd-icon name="discount-fill" />
    <wd-icon name="gift" />
    <wd-icon name="gift-fill" />

    <!-- 物流服务 -->
    <wd-icon name="delivery" />
    <wd-icon name="delivery-fill" />
    <wd-icon name="qrcode" />
    <wd-icon name="qrcode-fill" />

    <!-- 阅读订阅 -->
    <wd-icon name="subscribe" />
    <wd-icon name="subscribe-fill" />
    <wd-icon name="read" />
    <wd-icon name="read-fill" />
    <wd-icon name="company" />
    <wd-icon name="company-fill" />
  </view>
</template>
```

**商业功能类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `cart` | `cart-fill` | 购物车 |
| `bag` | `bag-fill` | 购物袋 |
| `goods` | `goods-fill` | 商品 |
| `shop` | `shop-fill` | 店铺 |
| `payment` | `payment-fill` | 支付 |
| `wallet` | `wallet-fill` | 钱包 |
| `card` | `card-fill` | 银行卡 |
| `money` | `money-fill` | 金钱 |
| `order` | `order-fill` | 订单 |
| `coupon` | `coupon-fill` | 优惠券 |
| `discount` | `discount-fill` | 折扣 |
| `gift` | `gift-fill` | 礼物 |
| `delivery` | `delivery-fill` | 配送 |
| `qrcode` | `qrcode-fill` | 二维码 |
| `subscribe` | `subscribe-fill` | 订阅 |
| `read` | `read-fill` | 阅读 |
| `company` | `company-fill` | 公司 |

### 文件管理类

文件管理类图标用于文件、文件夹和文档操作场景。

```vue
<template>
  <view class="file-icons">
    <!-- 文件基础 -->
    <wd-icon name="file" />
    <wd-icon name="file-fill" />
    <wd-icon name="file-add" />
    <wd-icon name="file-add-fill" />
    <wd-icon name="file-copy" />
    <wd-icon name="file-copy-fill" />
    <wd-icon name="file-paste" />
    <wd-icon name="file-paste-fill" />

    <!-- 文件夹 -->
    <wd-icon name="folder" />
    <wd-icon name="folder-fill" />
    <wd-icon name="folder-open" />
    <wd-icon name="folder-open-fill" />
    <wd-icon name="folder-add" />
    <wd-icon name="folder-add-fill" />

    <!-- 文档类型 -->
    <wd-icon name="file-word" />
    <wd-icon name="file-word-fill" />
    <wd-icon name="file-excel" />
    <wd-icon name="file-excel-fill" />
    <wd-icon name="file-ppt" />
    <wd-icon name="file-ppt-fill" />
    <wd-icon name="file-pdf" />
    <wd-icon name="file-pdf-fill" />
    <wd-icon name="file-unknown" />
    <wd-icon name="file-unknown-fill" />

    <!-- 其他 -->
    <wd-icon name="attach" />
    <wd-icon name="attach-fill" />
    <wd-icon name="book" />
    <wd-icon name="book-fill" />
  </view>
</template>
```

**文件管理类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `file` | `file-fill` | 文件 |
| `file-add` | `file-add-fill` | 新建文件 |
| `file-copy` | `file-copy-fill` | 复制文件 |
| `file-paste` | `file-paste-fill` | 粘贴文件 |
| `folder` | `folder-fill` | 文件夹 |
| `folder-open` | `folder-open-fill` | 打开文件夹 |
| `folder-add` | `folder-add-fill` | 新建文件夹 |
| `file-word` | `file-word-fill` | Word文档 |
| `file-excel` | `file-excel-fill` | Excel文档 |
| `file-ppt` | `file-ppt-fill` | PPT文档 |
| `file-pdf` | `file-pdf-fill` | PDF文档 |
| `file-unknown` | `file-unknown-fill` | 未知文件 |
| `attach` | `attach-fill` | 附件 |
| `book` | `book-fill` | 书籍 |

### 工具功能类

工具功能类图标用于日历、地图、工具等通用功能场景。

```vue
<template>
  <view class="tool-icons">
    <!-- 时间位置 -->
    <wd-icon name="calendar" />
    <wd-icon name="calendar-fill" />
    <wd-icon name="location" />
    <wd-icon name="location-fill" />
    <wd-icon name="map" />
    <wd-icon name="map-fill" />

    <!-- 工具设备 -->
    <wd-icon name="tools" />
    <wd-icon name="tools-fill" />
    <wd-icon name="laptop" />
    <wd-icon name="laptop-fill" />
    <wd-icon name="desktop" />
    <wd-icon name="desktop-fill" />

    <!-- 应用服务 -->
    <wd-icon name="app" />
    <wd-icon name="app-fill" />
    <wd-icon name="history" />
    <wd-icon name="history-fill" />
    <wd-icon name="service" />
    <wd-icon name="service-fill" />

    <!-- 界面交互 -->
    <wd-icon name="layers" />
    <wd-icon name="layers-fill" />
    <wd-icon name="fork" />
    <wd-icon name="fork-fill" />
    <wd-icon name="cursor" />
    <wd-icon name="cursor-fill" />
    <wd-icon name="pointing-hand" />
    <wd-icon name="pointing-hand-fill" />

    <!-- 输入 -->
    <wd-icon name="keyboard" />
    <wd-icon name="keyboard-fill" />
    <wd-icon name="keyboard-delete" />
    <wd-icon name="keyboard-delete-fill" />
    <wd-icon name="ellipsis" />
    <wd-icon name="ellipsis-fill" />
  </view>
</template>
```

**工具功能类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `calendar` | `calendar-fill` | 日历 |
| `location` | `location-fill` | 位置 |
| `map` | `map-fill` | 地图 |
| `tools` | `tools-fill` | 工具 |
| `laptop` | `laptop-fill` | 笔记本 |
| `desktop` | `desktop-fill` | 桌面电脑 |
| `app` | `app-fill` | 应用 |
| `history` | `history-fill` | 历史 |
| `service` | `service-fill` | 服务 |
| `layers` | `layers-fill` | 图层 |
| `fork` | `fork-fill` | 分叉 |
| `cursor` | `cursor-fill` | 光标 |
| `pointing-hand` | `pointing-hand-fill` | 指向手 |
| `keyboard` | `keyboard-fill` | 键盘 |
| `keyboard-delete` | `keyboard-delete-fill` | 删除键 |
| `ellipsis` | `ellipsis-fill` | 省略号 |

### 数据图表类

数据图表类图标用于数据展示、图表和排序场景。

```vue
<template>
  <view class="chart-icons">
    <!-- 图表 -->
    <wd-icon name="chart" />
    <wd-icon name="chart-fill" />
    <wd-icon name="chart-bar" />
    <wd-icon name="chart-bar-fill" />

    <!-- 趋势 -->
    <wd-icon name="trending-up" />
    <wd-icon name="trending-down" />

    <!-- 数据操作 -->
    <wd-icon name="data" />
    <wd-icon name="data-fill" />
    <wd-icon name="asc" />
    <wd-icon name="desc" />
    <wd-icon name="move" />
    <wd-icon name="move-fill" />

    <!-- 图形 -->
    <wd-icon name="rectangle" />
    <wd-icon name="rectangle-fill" />
    <wd-icon name="demo" />
    <wd-icon name="demo-fill" />
  </view>
</template>
```

**数据图表类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `chart` | `chart-fill` | 图表 |
| `chart-bar` | `chart-bar-fill` | 柱状图 |
| `trending-up` | - | 上升趋势 |
| `trending-down` | - | 下降趋势 |
| `data` | `data-fill` | 数据 |
| `asc` | - | 升序 |
| `desc` | - | 降序 |
| `move` | `move-fill` | 移动 |
| `rectangle` | `rectangle-fill` | 矩形 |
| `demo` | `demo-fill` | 演示 |

### 社交功能类

社交功能类图标用于评论、分享、关注等社交互动场景。

```vue
<template>
  <view class="social-icons">
    <!-- 评论互动 -->
    <wd-icon name="comment" />
    <wd-icon name="comment-fill" />
    <wd-icon name="reply" />
    <wd-icon name="reply-fill" />
    <wd-icon name="mention" />
    <wd-icon name="mention-fill" />
    <wd-icon name="hashtag" />
    <wd-icon name="hashtag-fill" />

    <!-- 关注好友 -->
    <wd-icon name="follow" />
    <wd-icon name="follow-fill" />
    <wd-icon name="unfollow" />
    <wd-icon name="unfollow-fill" />
    <wd-icon name="follower" />
    <wd-icon name="follower-fill" />
    <wd-icon name="friend-add" />
    <wd-icon name="friend-add-fill" />

    <!-- 群聊表情 -->
    <wd-icon name="group-chat" />
    <wd-icon name="group-chat-fill" />
    <wd-icon name="emoji" />
    <wd-icon name="emoji-fill" />
    <wd-icon name="moments" />
    <wd-icon name="moments-fill" />
  </view>
</template>
```

**社交功能类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `comment` | `comment-fill` | 评论 |
| `reply` | `reply-fill` | 回复 |
| `mention` | `mention-fill` | @提及 |
| `hashtag` | `hashtag-fill` | 话题标签 |
| `follow` | `follow-fill` | 关注 |
| `unfollow` | `unfollow-fill` | 取消关注 |
| `follower` | `follower-fill` | 粉丝 |
| `friend-add` | `friend-add-fill` | 添加好友 |
| `group-chat` | `group-chat-fill` | 群聊 |
| `emoji` | `emoji-fill` | 表情 |
| `moments` | `moments-fill` | 朋友圈 |

### 平台品牌类

平台品牌类图标用于显示各大平台和品牌标识。

```vue
<template>
  <view class="brand-icons">
    <!-- 社交平台 -->
    <wd-icon name="wechat" />
    <wd-icon name="wechat-fill" />
    <wd-icon name="qq" />
    <wd-icon name="qq-fill" />
    <wd-icon name="weibo" />
    <wd-icon name="weibo-fill" />
    <wd-icon name="tiktok" />
    <wd-icon name="tiktok-fill" />

    <!-- 支付平台 -->
    <wd-icon name="alipay" />
    <wd-icon name="alipay-fill" />

    <!-- 技术平台 -->
    <wd-icon name="github" />
    <wd-icon name="github-fill" />

    <!-- 操作系统 -->
    <wd-icon name="apple" />
    <wd-icon name="apple-fill" />
    <wd-icon name="android" />
    <wd-icon name="android-fill" />
    <wd-icon name="windows" />
    <wd-icon name="windows-fill" />

    <!-- 浏览器 -->
    <wd-icon name="chrome" />
    <wd-icon name="chrome-fill" />
  </view>
</template>
```

**平台品牌类图标列表:**

| 图标名 | 填充风格 | 说明 |
|--------|----------|------|
| `wechat` | `wechat-fill` | 微信 |
| `qq` | `qq-fill` | QQ |
| `weibo` | `weibo-fill` | 微博 |
| `tiktok` | `tiktok-fill` | 抖音 |
| `alipay` | `alipay-fill` | 支付宝 |
| `github` | `github-fill` | GitHub |
| `apple` | `apple-fill` | 苹果 |
| `android` | `android-fill` | 安卓 |
| `windows` | `windows-fill` | Windows |
| `chrome` | `chrome-fill` | Chrome |

## 字体文件配置

### @font-face 定义

WD UI 图标字体使用 `@font-face` 规则定义，支持多种字体格式以确保跨浏览器兼容性：

```scss
// 在线字体（H5 和小程序）
@font-face {
  font-family: 'wd-icons';
  src:
    url('//at.alicdn.com/t/c/font_4969054_f8a6ngjhuv.woff2?t=1754381253362') format('woff2'),
    url('//at.alicdn.com/t/c/font_4969054_f8a6ngjhuv.woff?t=1754381253362') format('woff'),
    url('//at.alicdn.com/t/c/font_4969054_f8a6ngjhuv.ttf?t=1754381253362') format('truetype');
  font-weight: normal;
  font-style: normal;
}

// APP 端本地字体
/* #ifdef APP-PLUS */
@font-face {
  font-family: 'wd-icons';
  src: url('./wd-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
/* #endif */
```

**字体格式说明:**

| 格式 | 文件扩展名 | 浏览器支持 | 说明 |
|------|-----------|-----------|------|
| WOFF2 | `.woff2` | 现代浏览器 | 最佳压缩，推荐使用 |
| WOFF | `.woff` | IE9+、现代浏览器 | 良好压缩 |
| TrueType | `.ttf` | 所有浏览器 | 通用格式，兼容性最好 |

### 字体加载优化

```scss
// 使用 font-display 控制字体加载行为
@font-face {
  font-family: 'wd-icons';
  src: url('...') format('...');
  font-display: block; // 短暂阻塞，然后无限等待字体
  // font-display: swap;  // 立即显示后备字体，加载完成后替换
  // font-display: fallback; // 短暂阻塞，短时间等待，超时用后备
  // font-display: optional; // 短暂阻塞，如果字体未缓存则用后备
}
```

**font-display 值说明:**

| 值 | 行为 | 适用场景 |
|-----|------|---------|
| `auto` | 浏览器默认 | 默认行为 |
| `block` | 阻塞期长，交换期无限 | 图标等必须使用特定字体的场景 |
| `swap` | 阻塞期极短，交换期无限 | 正文字体，允许 FOUT |
| `fallback` | 阻塞期短，交换期短 | 平衡方案 |
| `optional` | 阻塞期短，无交换期 | 可选装饰字体 |

## 图标组件实现

### 组件结构

```vue
<template>
  <view :class="iconClass" :style="iconStyle" @click="handleClick">
    <image v-if="isImageIcon" class="wd-icon__image" :src="name" />
  </view>
</template>
```

### 类型定义

```typescript
/**
 * 字体图标名称类型
 */
type FontIconName =
  | 'home'
  | 'home-fill'
  | 'back'
  | 'back-fill'
  // ... 300+ 图标名称
  | 'tiktok'
  | 'tiktok-fill'

/**
 * UnoCSS 图标名称类型 (以 i- 开头)
 */
type UnoIconName = `i-${string}`

/**
 * 图标名称联合类型
 * - FontIconName: 预定义的字体图标名称
 * - UnoIconName: 以 i- 开头的 UnoCSS 图标
 * - string: 图片路径或其他自定义图标
 */
export type IconName = FontIconName | UnoIconName | ImageSrc

/**
 * 图标组件属性接口
 */
interface WdIconProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 使用的图标名字，可以使用字体图标名、UnoCSS图标类名或链接图片 */
  name: IconName
  /** 图标的颜色 */
  color?: string
  /** 图标的字体大小 */
  size?: string | number
  /** 类名前缀，用于使用自定义图标 */
  classPrefix?: string
}

/**
 * 图标组件事件接口
 */
interface WdIconEmits {
  /** 点击图标时触发 */
  click: [event: Event]
  /** 触摸图标时触发 */
  touch: [event: Event]
}
```

### 图标类型判断

```typescript
/**
 * 判断是否为图片图标
 */
const isImageIcon = computed(() => {
  return isDef(props.name) && props.name.includes('/')
})

/**
 * 判断是否为 UnoCSS 图标
 */
const isUnoCSS = computed(() => {
  // 如果以 i- 开头，认为是 UnoCSS 图标
  return props.name.startsWith('i-')
})

/**
 * 计算图标类名
 */
const iconClass = computed(() => {
  const classes = [props.classPrefix, props.customClass]

  if (isImageIcon.value) {
    // 图片图标
    classes.push('wd-icon--image')
  } else if (isUnoCSS.value) {
    // UnoCSS 图标
    classes.push('wd-icon--unocss', props.name)
  } else {
    // 字体图标
    classes.push(`${props.classPrefix}-${props.name}`)
  }

  return classes.filter(Boolean).join(' ')
})
```

### 图标样式计算

```typescript
/**
 * 计算图标样式
 */
const iconStyle = computed(() => {
  const styles = []

  if (props.color) {
    styles.push(`color: ${props.color};`)
  }

  if (props.size) {
    styles.push(`font-size: ${addUnit(props.size)};`)
  }

  if (props.customStyle) {
    styles.push(props.customStyle)
  }

  return styles.join(' ')
})
```

## 图标样式实现

### 基础样式

```scss
@include b(icon) {
  display: inline-block;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  // 字体图标样式
  &:not(.wd-icon--image):not(.wd-icon--unocss) {
    font-family: 'wd-icons' !important;
  }
}
```

### UnoCSS 图标样式

```scss
@include b(icon) {
  @include m(unocss) {
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: middle;
  }
}
```

### 图片图标样式

```scss
@include b(icon) {
  // 图片类型图标容器样式
  @include m(image) {
    width: 1em;
    height: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden; // 防止图片溢出
  }

  // 图片元素样式
  @include e(image) {
    width: 100%;
    height: 100%;
    object-fit: cover; // 保持图片比例，填充容器
    object-position: center; // 图片居中显示
    border-radius: inherit; // 继承父元素的圆角
    display: block; // 避免 inline 元素的底部间隙
  }
}
```

### 图标 Unicode 定义

每个字体图标通过伪元素的 `content` 属性设置 Unicode 编码:

```scss
// 系统操作类
.wd-icon-home:before {
  content: '\e65f';
}

.wd-icon-home-fill:before {
  content: '\e631';
}

.wd-icon-search:before {
  content: '\e603';
}

.wd-icon-search-fill:before {
  content: '\e601';
}

// ... 更多图标定义
```

## 自定义图标字体

### 创建自定义图标

1. **使用 iconfont.cn 创建项目**
   - 访问 [iconfont.cn](https://www.iconfont.cn/)
   - 创建新项目并添加图标
   - 生成字体文件

2. **下载字体文件**
   - 下载生成的字体文件（ttf、woff、woff2）
   - 将字体文件放入项目静态资源目录

3. **定义 @font-face**

```scss
// src/static/fonts/custom-icons.scss
@font-face {
  font-family: 'custom-icons';
  src:
    url('/static/fonts/custom-icons.woff2') format('woff2'),
    url('/static/fonts/custom-icons.woff') format('woff'),
    url('/static/fonts/custom-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

// 定义图标基础样式
.custom-icon {
  font-family: 'custom-icons' !important;
  font-style: normal;
  font-weight: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// 定义各个图标
.custom-icon-logo:before {
  content: '\e001';
}

.custom-icon-brand:before {
  content: '\e002';
}

// ... 更多自定义图标
```

### 使用自定义图标

```vue
<template>
  <view class="custom-icon-demo">
    <!-- 使用 classPrefix 指定自定义前缀 -->
    <wd-icon name="logo" class-prefix="custom-icon" size="48" />
    <wd-icon name="brand" class-prefix="custom-icon" size="48" color="#1890ff" />
  </view>
</template>

<style lang="scss">
// 引入自定义图标字体
@import '@/static/fonts/custom-icons.scss';
</style>
```

### 混合使用多种图标

```vue
<template>
  <view class="mixed-icons">
    <!-- WD UI 内置图标 -->
    <wd-icon name="home" size="32" />

    <!-- 自定义字体图标 -->
    <wd-icon name="logo" class-prefix="custom-icon" size="32" />

    <!-- UnoCSS 图标 -->
    <wd-icon name="i-carbon-settings" size="32" />

    <!-- 图片图标 -->
    <wd-icon name="/static/icons/special.png" size="32" />
  </view>
</template>
```

## 最佳实践

### 1. 选择合适的图标类型

```vue
<template>
  <view class="icon-selection">
    <!-- ✅ 常用图标使用内置字体图标 -->
    <wd-icon name="home" />
    <wd-icon name="search" />
    <wd-icon name="user" />

    <!-- ✅ 特殊图标使用 UnoCSS 按需加载 -->
    <wd-icon name="i-carbon-carbon" />

    <!-- ✅ 品牌 Logo 使用图片 -->
    <wd-icon name="/static/logo/company.png" />

    <!-- ❌ 避免对简单图标使用图片 -->
    <!-- <wd-icon name="/static/icons/arrow.png" /> -->
  </view>
</template>
```

### 2. 统一图标风格

```vue
<template>
  <view class="icon-style">
    <!-- ✅ 同一模块使用统一风格 -->
    <view class="toolbar">
      <wd-icon name="home" />
      <wd-icon name="search" />
      <wd-icon name="user" />
      <wd-icon name="setting" />
    </view>

    <!-- ✅ 强调状态使用填充风格 -->
    <view class="active-tab">
      <wd-icon name="home-fill" color="#1890ff" />
    </view>

    <!-- ❌ 避免混用风格 -->
    <!-- <view class="mixed">
      <wd-icon name="home" />
      <wd-icon name="search-fill" />
      <wd-icon name="user" />
    </view> -->
  </view>
</template>
```

### 3. 合理设置图标大小

```vue
<template>
  <view class="icon-sizing">
    <!-- ✅ 根据场景设置合理大小 -->
    <!-- 列表图标 -->
    <wd-icon name="file" size="32" />

    <!-- 按钮图标 -->
    <wd-icon name="add" size="24" />

    <!-- 大图标展示 -->
    <wd-icon name="check-outline-fill" size="64" color="#52c41a" />

    <!-- ✅ 使用相对单位保持一致 -->
    <wd-icon name="user" size="1.2em" />

    <!-- ❌ 避免图标过小或过大 -->
    <!-- <wd-icon name="info" size="12" /> -->
    <!-- <wd-icon name="home" size="200" /> -->
  </view>
</template>
```

### 4. 图标颜色与语义一致

```vue
<template>
  <view class="icon-colors">
    <!-- ✅ 成功状态使用绿色 -->
    <wd-icon name="check-outline-fill" color="#52c41a" />

    <!-- ✅ 警告状态使用橙色 -->
    <wd-icon name="warn-fill" color="#faad14" />

    <!-- ✅ 错误状态使用红色 -->
    <wd-icon name="close-outline-fill" color="#ff4d4f" />

    <!-- ✅ 信息提示使用蓝色 -->
    <wd-icon name="info-fill" color="#1890ff" />

    <!-- ✅ 使用 CSS 变量保持主题一致 -->
    <wd-icon name="heart-fill" color="var(--wot-color-danger)" />
  </view>
</template>
```

### 5. 图标可访问性

```vue
<template>
  <view class="icon-accessibility">
    <!-- ✅ 添加语义化说明 -->
    <view class="action-button" aria-label="删除">
      <wd-icon name="delete" />
    </view>

    <!-- ✅ 图标与文字配合使用 -->
    <view class="button-with-text">
      <wd-icon name="add" />
      <text>新建</text>
    </view>

    <!-- ✅ 重要操作添加确认提示 -->
    <view class="danger-action" @click="confirmDelete">
      <wd-icon name="delete-fill" color="#ff4d4f" />
      <text>删除</text>
    </view>
  </view>
</template>
```

## 常见问题

### 1. 图标不显示

**问题原因:**
- 字体文件未加载
- 图标名称拼写错误
- 网络问题导致字体加载失败

**解决方案:**

```vue
<template>
  <view class="icon-debug">
    <!-- 检查图标名称是否正确 -->
    <wd-icon name="home" />  <!-- ✅ 正确 -->
    <wd-icon name="Home" />  <!-- ❌ 区分大小写 -->

    <!-- 检查是否正确使用 classPrefix -->
    <wd-icon name="custom" class-prefix="my-icon" />
  </view>
</template>

<script lang="ts" setup>
// 检查字体加载状态
onMounted(() => {
  // 等待字体加载完成
  document.fonts.ready.then(() => {
    console.log('字体加载完成')
  })
})
</script>

<style lang="scss">
// 确保字体定义正确引入
@font-face {
  font-family: 'wd-icons';
  src: url('...') format('...');
  font-display: block;
}
</style>
```

### 2. 图标显示为方块或乱码

**问题原因:**
- 字体文件损坏或不完整
- Unicode 编码不匹配
- 浏览器不支持该字体格式

**解决方案:**

```scss
// 提供多种字体格式作为后备
@font-face {
  font-family: 'wd-icons';
  src:
    url('...woff2') format('woff2'),  // 现代浏览器首选
    url('...woff') format('woff'),    // 广泛支持
    url('...ttf') format('truetype'); // 最后的后备
  font-weight: normal;
  font-style: normal;
}

// 检查伪元素内容是否正确
.wd-icon-home:before {
  content: '\e65f'; // 确保 Unicode 编码正确
}
```

### 3. UnoCSS 图标不生效

**问题原因:**
- 未安装对应的图标集
- UnoCSS 配置不正确
- 图标名称格式错误

**解决方案:**

```typescript
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      // 启用图标预设
      scale: 1.2,
      warn: true,
      collections: {
        // 配置需要使用的图标集
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      },
    }),
  ],
})
```

```bash
# 安装需要的图标集
pnpm add -D @iconify-json/carbon @iconify-json/mdi
```

### 4. 图片图标加载失败

**问题原因:**
- 图片路径错误
- 图片文件不存在
- 跨域问题

**解决方案:**

```vue
<template>
  <view class="image-icon-fix">
    <!-- ✅ 使用正确的路径格式 -->
    <!-- 静态资源使用绝对路径 -->
    <wd-icon name="/static/icons/logo.png" />

    <!-- 使用 @ 别名 -->
    <wd-icon :name="logoPath" />

    <!-- 网络图片确保 CORS 配置正确 -->
    <wd-icon name="https://cdn.example.com/icon.png" />
  </view>
</template>

<script lang="ts" setup>
// 动态引入图片
const logoPath = new URL('@/static/icons/logo.png', import.meta.url).href
</script>
```

### 5. 图标在 App 端显示异常

**问题原因:**
- App 端不支持网络字体
- 字体文件未打包到 App

**解决方案:**

```scss
// 使用条件编译为 App 端提供本地字体
/* #ifdef APP-PLUS */
@font-face {
  font-family: 'wd-icons';
  src: url('./wd-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
/* #endif */

/* #ifndef APP-PLUS */
@font-face {
  font-family: 'wd-icons';
  src:
    url('//at.alicdn.com/t/...woff2') format('woff2'),
    url('//at.alicdn.com/t/...woff') format('woff'),
    url('//at.alicdn.com/t/...ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
/* #endif */
```

### 6. 图标点击区域过小

**问题原因:**
- 图标尺寸过小
- 没有添加足够的点击区域

**解决方案:**

```vue
<template>
  <view class="clickable-icon">
    <!-- ✅ 包装容器扩大点击区域 -->
    <view class="icon-wrapper" @click="handleClick">
      <wd-icon name="close" size="24" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.icon-wrapper {
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  // 最小点击区域 44x44
  min-width: 88rpx;
  min-height: 88rpx;
}
</style>
```

## API 参考

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `name` | 图标名称，支持字体图标名、UnoCSS 图标类名或图片路径 | `IconName` | - |
| `size` | 图标大小，默认单位为 rpx | `string \| number` | `40` |
| `color` | 图标颜色 | `string` | - |
| `classPrefix` | 类名前缀，用于使用自定义图标 | `string` | `wd-icon` |
| `customClass` | 自定义根节点样式类 | `string` | - |
| `customStyle` | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `click` | 点击图标时触发 | `event: Event` |
| `touch` | 触摸图标时触发 | `event: Event` |

### 类型定义

```typescript
// 字体图标名称类型
type FontIconName =
  | 'home' | 'home-fill'
  | 'back' | 'back-fill'
  | 'close' | 'close-fill'
  // ... 300+ 图标
  | 'chrome' | 'chrome-fill'
  | 'tiktok' | 'tiktok-fill'

// UnoCSS 图标名称类型
type UnoIconName = `i-${string}`

// 图片路径类型
type ImageSrc = string

// 图标名称联合类型
type IconName = FontIconName | UnoIconName | ImageSrc

// 图标组件属性
interface WdIconProps {
  customStyle?: string
  customClass?: string
  name: IconName
  color?: string
  size?: string | number
  classPrefix?: string
}

// 图标组件事件
interface WdIconEmits {
  click: [event: Event]
  touch: [event: Event]
}
```

本文档详细介绍了 WD UI 图标字体系统的使用方法、图标分类、自定义配置和最佳实践。通过合理使用图标系统，可以提升应用的视觉效果和用户体验，同时保持良好的跨平台兼容性。

