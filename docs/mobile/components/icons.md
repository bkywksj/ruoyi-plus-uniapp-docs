# 图标使用

## 介绍

项目提供强大灵活的图标系统，支持三种图标类型：**内置字体图标**、**UnoCSS 图标**和**图片图标**。图标系统采用统一的 API 设计，让开发者可以根据不同场景选择最合适的图标方案。内置字体图标基于 iconfont 技术实现，提供 200+ 精心设计的矢量图标，涵盖系统操作、导航箭头、状态指示、用户相关、通讯媒体、商业功能、文件管理、工具功能、数据图表、社交功能、平台品牌等 11 个类别，风格统一且支持离线使用。UnoCSS 图标集成了 Iconify 生态系统，支持数万个来自不同设计系统的图标，如 Element Plus、Carbon、Material Design Icons、Tabler、Remix Icon 等。图片图标则支持本地静态资源和网络图片，适用于品牌 Logo 等特殊场景。

**核心特性：**

- **内置字体图标** - 200+ 矢量图标，11 个类别，支持离线，风格统一
- **UnoCSS 图标** - 集成 Iconify 生态，支持数万图标，按需加载
- **图片图标** - 支持本地图片和网络图片，适用于品牌 Logo
- **样式定制** - 自定义颜色、尺寸、动画效果
- **类型安全** - 完整的 TypeScript 类型定义，智能提示
- **跨平台兼容** - 支持 H5、微信小程序、App 等多端运行
- **轻量高效** - 字体图标按需引入，UnoCSS 图标编译时优化

## 图标类型详解

### 内置字体图标

内置字体图标基于 iconfont 字体技术实现，所有图标通过字体文件加载，具有以下优势：

- **矢量无损** - 任意放大不失真
- **风格统一** - 同一设计语言，视觉一致
- **离线可用** - 字体文件本地化，无需网络
- **颜色可控** - 通过 CSS color 属性控制颜色
- **体积小** - 单个字体文件包含所有图标

**基本用法：**

```vue
<template>
  <view class="icon-demo">
    <!-- 线性图标 -->
    <wd-icon name="home" />
    <wd-icon name="search" />
    <wd-icon name="setting" />
    <wd-icon name="user" />

    <!-- 填充版图标：名称后加 -fill -->
    <wd-icon name="home-fill" />
    <wd-icon name="search-fill" />
    <wd-icon name="setting-fill" />
    <wd-icon name="user-fill" />
  </view>
</template>

<style lang="scss" scoped>
.icon-demo {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
}
</style>
```

**命名规则：**

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 线性图标 | `{name}` | `home`, `search`, `user` |
| 填充图标 | `{name}-fill` | `home-fill`, `search-fill` |
| 轮廓图标 | `{name}-outline` | `close-outline`, `check-outline` |
| 轮廓填充 | `{name}-outline-fill` | `close-outline-fill`, `check-outline-fill` |

### UnoCSS 图标

UnoCSS 图标集成了 Iconify 图标库，提供来自各大设计系统的数万个图标。使用 `i-` 前缀标识：

```vue
<template>
  <view class="icon-demo">
    <!-- Element Plus 图标 -->
    <wd-icon name="i-ep-user" />
    <wd-icon name="i-ep-setting" />
    <wd-icon name="i-ep-search" />
    <wd-icon name="i-ep-edit" />

    <!-- Carbon 设计系统图标 -->
    <wd-icon name="i-carbon-home" />
    <wd-icon name="i-carbon-user-avatar" />

    <!-- Material Design Icons -->
    <wd-icon name="i-mdi-account" />
    <wd-icon name="i-mdi-cog" />

    <!-- Tabler Icons -->
    <wd-icon name="i-tabler-brand-github" />
    <wd-icon name="i-tabler-settings" />
  </view>
</template>
```

**常用图标集前缀：**

| 前缀 | 图标集 | 说明 | 图标数量 |
|------|--------|------|----------|
| `i-ep-` | Element Plus | Element Plus 设计图标 | 300+ |
| `i-carbon-` | Carbon | IBM Carbon 设计系统图标 | 2000+ |
| `i-mdi-` | Material Design Icons | Google Material 图标 | 7000+ |
| `i-tabler-` | Tabler Icons | 简洁线性图标 | 4000+ |
| `i-ri-` | Remix Icon | 中性风格开源图标 | 2400+ |
| `i-lucide-` | Lucide | Feather 扩展版图标 | 1000+ |
| `i-heroicons-` | Heroicons | Tailwind CSS 官方图标 | 450+ |
| `i-ph-` | Phosphor Icons | 灵活多变图标库 | 6000+ |
| `i-ant-design-` | Ant Design Icons | 蚂蚁设计图标 | 800+ |
| `i-fa6-solid-` | Font Awesome 6 | Font Awesome 实心图标 | 1000+ |

**UnoCSS 配置：**

项目使用 `presetIcons` 预设配置图标支持：

```typescript
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.2,              // 图标缩放比例
      warn: true,              // 警告未找到的图标
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})
```

### 图片图标

使用本地或网络图片作为图标，适用于品牌 Logo、特殊图形等场景：

```vue
<template>
  <view class="icon-demo">
    <!-- 本地静态资源 -->
    <wd-icon name="/static/icons/logo.png" size="48" />
    <wd-icon name="/static/icons/custom.svg" size="40" />

    <!-- 网络图片 -->
    <wd-icon name="https://example.com/icon.png" size="32" />

    <!-- 带圆角的图片图标 -->
    <wd-icon
      name="/static/icons/avatar.png"
      size="64"
      custom-style="border-radius: 50%;"
    />
  </view>
</template>
```

**图片图标特点：**

- 支持 PNG、JPG、SVG、WebP 等常见图片格式
- 通过 `size` 属性控制尺寸
- 图片自动居中并保持比例（`object-fit: cover`）
- 可通过 `custom-style` 添加圆角等样式
- `color` 属性对图片图标无效

## 图标属性配置

### 尺寸设置

通过 `size` 属性设置图标大小，支持数字或带单位的字符串：

```vue
<template>
  <view class="size-demo">
    <!-- 数字：自动转换为 rpx -->
    <wd-icon name="user" size="24" />
    <wd-icon name="user" size="32" />
    <wd-icon name="user" size="48" />
    <wd-icon name="user" size="64" />

    <!-- 带单位的字符串 -->
    <wd-icon name="user" size="16px" />
    <wd-icon name="user" size="2rem" />
    <wd-icon name="user" size="1.5em" />
  </view>
</template>

<script lang="ts" setup>
// 动态尺寸
import { ref, computed } from 'vue'

const baseSize = ref(32)
const dynamicSize = computed(() => baseSize.value * 1.5)
</script>
```

**尺寸使用规范：**

| 场景 | 推荐尺寸 | 说明 |
|------|---------|------|
| 按钮内图标 | 32-40 | 与按钮文字协调 |
| 列表项图标 | 40-48 | 列表左侧引导图标 |
| 导航图标 | 44-52 | TabBar、导航栏图标 |
| 标题装饰 | 48-64 | 页面标题前的装饰图标 |
| 大型展示 | 64-128 | 空状态、结果页等大图标 |
| 徽标图标 | 24-32 | 小尺寸提示性图标 |

### 颜色设置

通过 `color` 属性设置图标颜色（仅对字体图标和 UnoCSS 图标有效）：

```vue
<template>
  <view class="color-demo">
    <!-- 十六进制颜色 -->
    <wd-icon name="heart" color="#1989fa" />
    <wd-icon name="heart" color="#07c160" />
    <wd-icon name="heart" color="#ff976a" />
    <wd-icon name="heart" color="#ee0a24" />

    <!-- 使用 CSS 变量 -->
    <wd-icon name="heart" color="var(--wd-color-primary)" />
    <wd-icon name="heart" color="var(--wd-color-success)" />
    <wd-icon name="heart" color="var(--wd-color-warning)" />
    <wd-icon name="heart" color="var(--wd-color-danger)" />

    <!-- RGB/RGBA 颜色 -->
    <wd-icon name="heart" color="rgb(25, 137, 250)" />
    <wd-icon name="heart" color="rgba(25, 137, 250, 0.6)" />
  </view>
</template>
```

**主题颜色变量：**

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `--wd-color-primary` | 主题色 | #1989fa |
| `--wd-color-success` | 成功色 | #07c160 |
| `--wd-color-warning` | 警告色 | #ff976a |
| `--wd-color-danger` | 危险色 | #ee0a24 |
| `--wd-color-info` | 信息色 | #909399 |
| `--wot-color-theme` | WD 主题色 | #0957DE |

### 自定义样式

通过 `custom-style` 和 `custom-class` 属性添加自定义样式：

```vue
<template>
  <view class="custom-demo">
    <!-- 自定义样式 -->
    <wd-icon
      name="star"
      size="48"
      custom-style="text-shadow: 0 2px 4px rgba(0,0,0,0.2);"
    />

    <!-- 自定义类名 -->
    <wd-icon name="heart" size="48" custom-class="gradient-icon" />

    <!-- 组合使用 -->
    <wd-icon
      name="notification"
      size="48"
      color="#1989fa"
      custom-style="opacity: 0.8;"
      custom-class="pulse-icon"
    />
  </view>
</template>

<style lang="scss" scoped>
.gradient-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pulse-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
```

## 图标动画效果

### 旋转动画

为加载图标添加旋转效果：

```vue
<template>
  <view class="animation-demo">
    <!-- 基础旋转 -->
    <wd-icon name="loading" custom-class="rotating" />

    <!-- 不同速度的旋转 -->
    <wd-icon name="refresh" custom-class="rotating-slow" />
    <wd-icon name="setting" custom-class="rotating-fast" />

    <!-- 反向旋转 -->
    <wd-icon name="sync" custom-class="rotating-reverse" />
  </view>
</template>

<style lang="scss" scoped>
// 标准旋转
.rotating {
  animation: rotate 1s linear infinite;
}

// 慢速旋转
.rotating-slow {
  animation: rotate 2s linear infinite;
}

// 快速旋转
.rotating-fast {
  animation: rotate 0.5s linear infinite;
}

// 反向旋转
.rotating-reverse {
  animation: rotate 1s linear infinite reverse;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

### 脉冲动画

用于提示和通知场景：

```vue
<template>
  <view class="pulse-demo">
    <wd-icon name="notification" size="48" custom-class="pulse" />
    <wd-icon name="heart" size="48" color="#ee0a24" custom-class="heartbeat" />
  </view>
</template>

<style lang="scss" scoped>
.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.heartbeat {
  animation: heartbeat 1.2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}
</style>
```

### 弹跳动画

用于引导注意力：

```vue
<template>
  <view class="bounce-demo">
    <wd-icon name="chevron-down" size="48" custom-class="bounce" />
    <wd-icon name="arrow-down" size="48" custom-class="float" />
  </view>
</template>

<style lang="scss" scoped>
.bounce {
  animation: bounce 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16rpx); }
}
</style>
```

### 摇摆动画

用于提醒和警告：

```vue
<template>
  <view class="shake-demo">
    <wd-icon name="notification-fill" size="48" color="#ff976a" custom-class="shake" />
    <wd-icon name="warn-fill" size="48" color="#ee0a24" custom-class="wiggle" />
  </view>
</template>

<style lang="scss" scoped>
.shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
}

.wiggle {
  animation: wiggle 0.3s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
</style>
```

## 内置图标完整分类

### 系统操作类（50+图标）

系统操作类图标用于常见的用户交互操作，如导航、编辑、确认等。

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `home` | `home-fill` | 首页 |
| `back` | `back-fill` | 返回 |
| `close` | `close-fill` | 关闭 |
| `close-outline` | `close-outline-fill` | 关闭（圆形） |
| `check` | `check-fill` | 确认 |
| `check-outline` | `check-outline-fill` | 确认（圆形） |
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
| `forward` | `forward-fill` | 前进 |
| `backward` | `backward-fill` | 后退 |
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

方向指示和导航类图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `up` | - | 向上箭头 |
| `down` | - | 向下箭头 |
| `left` | - | 向左箭头 |
| `right` | - | 向右箭头 |
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
| `page-last` | `page-last-fill` | 最后页 |
| `unfold-more` | - | 展开更多 |
| `unfold-less` | - | 收起 |

### 状态指示类

状态反馈和指示类图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `warn` | `warn-fill` | 警告 |
| `info` | `info-fill` | 信息 |
| `loading` | `loading-fill` | 加载中 |
| `locked` | `locked-fill` | 已锁定 |
| `unlocked` | `unlocked-fill` | 已解锁 |
| `visible` | `visible-fill` | 可见 |
| `hidden` | `hidden-fill` | 隐藏 |
| `time` | `time-fill` | 时间 |
| `clock` | `clock-fill` | 时钟 |
| `star` | `star-fill` | 星标 |
| `heart` | `heart-fill` | 爱心 |
| `favorite` | `favorite-fill` | 收藏 |
| `like` | `like-fill` | 点赞 |
| `dislike` | `dislike-fill` | 踩 |
| `flag` | `flag-fill` | 旗帜 |
| `pin` | `pin-fill` | 图钉 |
| `secured` | `secured-fill` | 安全 |
| `notification` | `notification-fill` | 通知 |
| `tips` | `tips-fill` | 提示 |

### 用户相关类

用户和社交类图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `user` | `user-fill` | 用户 |
| `user-add` | `user-add-fill` | 添加用户 |
| `team` | `team-fill` | 团队 |
| `contact` | `contact-fill` | 联系人 |
| `admin` | `admin-fill` | 管理员 |
| `vip` | `vip-fill` | VIP |
| `user-group` | `user-group-fill` | 用户组 |
| `user-circle` | `user-circle-fill` | 用户头像 |
| `user-talk` | `user-talk-fill` | 用户交谈 |
| `male` | `male-fill` | 男性 |
| `female` | `female-fill` | 女性 |
| `crown` | `crown-fill` | 皇冠 |
| `diamon` | `diamon-fill` | 钻石 |

### 通讯媒体类

通讯和媒体相关图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `call` | `call-fill` | 通话 |
| `phone` | `phone-fill` | 电话 |
| `message` | `message-fill` | 消息 |
| `mail` | `mail-fill` | 邮件 |
| `chat` | `chat-fill` | 聊天 |
| `video` | `video-fill` | 视频 |
| `audio` | `audio-fill` | 音频 |
| `camera` | `camera-fill` | 相机 |
| `image` | `image-fill` | 图片 |
| `mobile` | `mobile-fill` | 手机 |
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
| `iphone` | `iphone-fill` | iPhone |

### 商业功能类

电商和商业相关图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `cart` | `cart-fill` | 购物车 |
| `payment` | `payment-fill` | 支付 |
| `order` | `order-fill` | 订单 |
| `coupon` | `coupon-fill` | 优惠券 |
| `gift` | `gift-fill` | 礼物 |
| `wallet` | `wallet-fill` | 钱包 |
| `card` | `card-fill` | 银行卡 |
| `shop` | `shop-fill` | 商店 |
| `goods` | `goods-fill` | 商品 |
| `money` | `money-fill` | 金钱 |
| `discount` | `discount-fill` | 折扣 |
| `qrcode` | `qrcode-fill` | 二维码 |
| `bag` | `bag-fill` | 购物袋 |
| `delivery` | `delivery-fill` | 配送 |
| `subscribe` | `subscribe-fill` | 订阅 |
| `read` | `read-fill` | 阅读 |
| `company` | `company-fill` | 公司 |

### 文件管理类

文件和文档相关图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `file` | `file-fill` | 文件 |
| `file-add` | `file-add-fill` | 添加文件 |
| `file-copy` | `file-copy-fill` | 复制文件 |
| `file-paste` | `file-paste-fill` | 粘贴文件 |
| `folder` | `folder-fill` | 文件夹 |
| `folder-open` | `folder-open-fill` | 打开的文件夹 |
| `folder-add` | `folder-add-fill` | 添加文件夹 |
| `file-word` | `file-word-fill` | Word文档 |
| `file-excel` | `file-excel-fill` | Excel文档 |
| `file-ppt` | `file-ppt-fill` | PPT文档 |
| `file-pdf` | `file-pdf-fill` | PDF文档 |
| `file-unknown` | `file-unknown-fill` | 未知文件 |
| `attach` | `attach-fill` | 附件 |
| `book` | `book-fill` | 书籍 |

### 工具功能类

工具和功能相关图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `calendar` | `calendar-fill` | 日历 |
| `location` | `location-fill` | 位置 |
| `map` | `map-fill` | 地图 |
| `tools` | `tools-fill` | 工具 |
| `laptop` | `laptop-fill` | 笔记本 |
| `desktop` | `desktop-fill` | 桌面 |
| `app` | `app-fill` | 应用 |
| `history` | `history-fill` | 历史 |
| `service` | `service-fill` | 客服 |
| `layers` | `layers-fill` | 图层 |
| `fork` | `fork-fill` | 分叉 |
| `cursor` | `cursor-fill` | 光标 |
| `pointing-hand` | `pointing-hand-fill` | 指向手势 |
| `keyboard` | `keyboard-fill` | 键盘 |
| `keyboard-delete` | `keyboard-delete-fill` | 键盘删除 |
| `ellipsis` | `ellipsis-fill` | 省略号 |

### 数据图表类

数据和图表相关图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `chart` | `chart-fill` | 折线图 |
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

社交和互动相关图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `comment` | `comment-fill` | 评论 |
| `reply` | `reply-fill` | 回复 |
| `mention` | `mention-fill` | 提及@ |
| `hashtag` | `hashtag-fill` | 话题标签 |
| `follow` | `follow-fill` | 关注 |
| `unfollow` | `unfollow-fill` | 取消关注 |
| `follower` | `follower-fill` | 粉丝 |
| `friend-add` | `friend-add-fill` | 添加好友 |
| `group-chat` | `group-chat-fill` | 群聊 |
| `emoji` | `emoji-fill` | 表情 |
| `moments` | `moments-fill` | 朋友圈 |

### 平台品牌类

第三方平台品牌图标：

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `wechat` | `wechat-fill` | 微信 |
| `qq` | `qq-fill` | QQ |
| `weibo` | `weibo-fill` | 微博 |
| `alipay` | `alipay-fill` | 支付宝 |
| `github` | `github-fill` | GitHub |
| `apple` | `apple-fill` | Apple |
| `android` | `android-fill` | Android |
| `windows` | `windows-fill` | Windows |
| `chrome` | `chrome-fill` | Chrome |
| `tiktok` | `tiktok-fill` | 抖音 |

## 图标与组件结合

### 图标按钮

在按钮中使用图标：

```vue
<template>
  <view class="button-demo">
    <!-- 带图标的按钮 -->
    <wd-button icon="add">新增</wd-button>
    <wd-button icon="edit" type="primary">编辑</wd-button>
    <wd-button icon="delete" type="danger">删除</wd-button>

    <!-- 纯图标按钮 -->
    <wd-button icon="search" round />
    <wd-button icon="refresh" round type="primary" />

    <!-- 图标在右侧 -->
    <wd-button>
      下一步
      <template #icon>
        <wd-icon name="chevron-right" />
      </template>
    </wd-button>
  </view>
</template>
```

### 输入框图标

在输入框中添加图标：

```vue
<template>
  <view class="input-demo">
    <!-- 前置图标 -->
    <wd-input v-model="username" placeholder="请输入用户名">
      <template #prefix>
        <wd-icon name="user" size="36" color="#999" />
      </template>
    </wd-input>

    <!-- 后置图标（密码切换） -->
    <wd-input
      v-model="password"
      :type="showPwd ? 'text' : 'password'"
      placeholder="请输入密码"
    >
      <template #prefix>
        <wd-icon name="locked" size="36" color="#999" />
      </template>
      <template #suffix>
        <wd-icon
          :name="showPwd ? 'visible' : 'hidden'"
          size="36"
          color="#999"
          @click="showPwd = !showPwd"
        />
      </template>
    </wd-input>

    <!-- 搜索输入框 -->
    <wd-input v-model="keyword" placeholder="搜索">
      <template #prefix>
        <wd-icon name="search" size="36" color="#999" />
      </template>
      <template #suffix>
        <wd-icon
          v-if="keyword"
          name="clear-fill"
          size="36"
          color="#999"
          @click="keyword = ''"
        />
      </template>
    </wd-input>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const keyword = ref('')
const showPwd = ref(false)
</script>
```

### 列表项图标

在单元格列表中使用图标：

```vue
<template>
  <wd-cell-group>
    <wd-cell title="个人信息" is-link to="/pages/profile/info">
      <template #icon>
        <wd-icon name="user-fill" size="40" color="#1989fa" />
      </template>
    </wd-cell>

    <wd-cell title="账户安全" is-link to="/pages/profile/security">
      <template #icon>
        <wd-icon name="secured-fill" size="40" color="#07c160" />
      </template>
    </wd-cell>

    <wd-cell title="消息通知" is-link to="/pages/profile/notification">
      <template #icon>
        <wd-icon name="notification-fill" size="40" color="#ff976a" />
      </template>
      <template #value>
        <view class="badge">3</view>
      </template>
    </wd-cell>

    <wd-cell title="帮助中心" is-link to="/pages/help/index">
      <template #icon>
        <wd-icon name="help-fill" size="40" color="#909399" />
      </template>
    </wd-cell>
  </wd-cell-group>
</template>

<style lang="scss" scoped>
.badge {
  background: #ee0a24;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
}
</style>
```

### 状态图标

交互状态图标：

```vue
<template>
  <view class="status-demo">
    <!-- 收藏状态 -->
    <view class="status-item" @click="favorited = !favorited">
      <wd-icon
        :name="favorited ? 'star-fill' : 'star'"
        :color="favorited ? '#ffc107' : '#999'"
        size="48"
      />
      <text>{{ favorited ? '已收藏' : '收藏' }}</text>
    </view>

    <!-- 点赞状态 -->
    <view class="status-item" @click="liked = !liked">
      <wd-icon
        :name="liked ? 'heart-fill' : 'heart'"
        :color="liked ? '#ee0a24' : '#999'"
        size="48"
        :custom-class="liked ? 'liked-animation' : ''"
      />
      <text>{{ likeCount }}</text>
    </view>

    <!-- 关注状态 -->
    <view class="status-item" @click="followed = !followed">
      <wd-icon
        :name="followed ? 'check' : 'add'"
        :color="followed ? '#07c160' : '#1989fa'"
        size="48"
      />
      <text>{{ followed ? '已关注' : '关注' }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const favorited = ref(false)
const liked = ref(false)
const followed = ref(false)
const baseLikeCount = ref(128)

const likeCount = computed(() => {
  return liked.value ? baseLikeCount.value + 1 : baseLikeCount.value
})
</script>

<style lang="scss" scoped>
.status-demo {
  display: flex;
  justify-content: space-around;
  padding: 32rpx;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 24rpx;
    color: #666;
  }
}

.liked-animation {
  animation: liked 0.3s ease-out;
}

@keyframes liked {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
```

### TabBar 图标

底部导航栏图标：

```vue
<template>
  <view class="tabbar">
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tabbar-item"
      :class="{ active: activeIndex === index }"
      @click="switchTab(index)"
    >
      <wd-icon
        :name="activeIndex === index ? item.activeIcon : item.icon"
        :color="activeIndex === index ? '#1989fa' : '#999'"
        size="44"
      />
      <text>{{ item.text }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeIndex = ref(0)

const tabs = [
  { icon: 'home', activeIcon: 'home-fill', text: '首页' },
  { icon: 'search', activeIcon: 'search-fill', text: '发现' },
  { icon: 'cart', activeIcon: 'cart-fill', text: '购物车' },
  { icon: 'user', activeIcon: 'user-fill', text: '我的' }
]

const switchTab = (index: number) => {
  activeIndex.value = index
}
</script>

<style lang="scss" scoped>
.tabbar {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;

  text {
    font-size: 20rpx;
    color: #999;
  }

  &.active text {
    color: #1989fa;
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 图标名称（字体图标名/UnoCSS类名/图片路径） | `IconName` | - |
| color | 图标颜色（仅字体图标和UnoCSS图标有效） | `string` | - |
| size | 图标大小（数字默认为rpx单位） | `string \| number` | `40` |
| class-prefix | 类名前缀，用于自定义图标字体 | `string` | `wd-icon` |
| custom-style | 自定义根节点样式 | `string` | - |
| custom-class | 自定义根节点类名 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击图标时触发 | `event: Event` |
| touch | 触摸图标时触发 | `event: Event` |

### 类型定义

```typescript
/**
 * 字体图标名称类型
 * 包含所有内置字体图标的名称
 */
type FontIconName =
  // 系统操作类
  | 'home' | 'home-fill'
  | 'back' | 'back-fill'
  | 'close' | 'close-fill'
  | 'close-outline' | 'close-outline-fill'
  | 'check' | 'check-fill'
  | 'check-outline' | 'check-outline-fill'
  | 'menu' | 'menu-fill'
  | 'more' | 'more-fill'
  | 'search' | 'search-fill'
  | 'filter' | 'filter-fill'
  | 'refresh' | 'refresh-fill'
  | 'setting' | 'setting-fill'
  | 'help' | 'help-fill'
  | 'add' | 'add-fill'
  | 'minus' | 'minus-fill'
  | 'edit' | 'edit-fill'
  | 'delete' | 'delete-fill'
  // ... 更多图标名称
  // 完整类型定义见源码 wd-icon.vue

/**
 * UnoCSS 图标名称类型
 * 以 i- 开头的字符串
 */
type UnoIconName = `i-${string}`

/**
 * 图片路径类型
 * 包含 / 的字符串被识别为图片路径
 */
type ImageSrc = string

/**
 * 图标名称联合类型
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
  /** 图标名称 */
  name: IconName
  /** 图标颜色 */
  color?: string
  /** 图标大小 */
  size?: string | number
  /** 类名前缀 */
  classPrefix?: string
}

/**
 * 图标组件事件接口
 */
interface WdIconEmits {
  /** 点击事件 */
  click: [event: Event]
  /** 触摸事件 */
  touch: [event: Event]
}
```

## 主题定制

### CSS 变量

```scss
// 图标默认尺寸
$wd-icon-size: 40rpx !default;
// 图标默认颜色（继承父元素）
$wd-icon-color: inherit !default;
```

### 自定义图标字体

如果需要使用自己的图标字体，可以通过 `class-prefix` 属性配置：

```vue
<template>
  <!-- 使用自定义图标字体 -->
  <wd-icon name="custom-home" class-prefix="my-icon" size="40" />
  <wd-icon name="custom-user" class-prefix="my-icon" size="40" />
</template>

<style lang="scss">
// 定义自定义图标字体
@font-face {
  font-family: 'my-icons';
  src: url('/static/fonts/my-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

// 基础样式
.my-icon {
  font-family: 'my-icons' !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// 各图标的 content 值
.my-icon-custom-home:before {
  content: '\e001';
}

.my-icon-custom-user:before {
  content: '\e002';
}
</style>
```

### 图标样式覆盖

```scss
// 全局覆盖图标样式
.wd-icon {
  // 修改默认尺寸
  font-size: 36rpx;

  // 添加过渡效果
  transition: all 0.2s ease;

  // 悬停效果（仅 H5）
  &:hover {
    opacity: 0.8;
  }
}

// 特定图标样式
.wd-icon-heart {
  &:hover {
    color: #ee0a24;
  }
}
```

## 最佳实践

### 1. 选择合适的图标类型

```vue
<template>
  <!-- 常用功能图标：优先使用内置字体图标 -->
  <wd-icon name="home" />
  <wd-icon name="user" />
  <wd-icon name="setting" />

  <!-- 特殊设计系统图标：使用 UnoCSS 图标 -->
  <wd-icon name="i-ep-document" />
  <wd-icon name="i-carbon-analytics" />

  <!-- 品牌 Logo 和特殊图形：使用图片图标 -->
  <wd-icon name="/static/icons/brand-logo.svg" />
  <wd-icon name="/static/icons/special-shape.png" />
</template>
```

**选择建议：**

- **内置字体图标**：首选，体积小、风格统一、支持离线
- **UnoCSS 图标**：需要特定设计系统图标时使用
- **图片图标**：品牌 Logo 或复杂图形使用

### 2. 保持视觉一致性

```vue
<template>
  <!-- 同一区域使用相同尺寸和风格 -->
  <view class="action-bar">
    <!-- 使用填充版或线性版，不要混用 -->
    <wd-icon name="like" size="40" color="#999" />
    <wd-icon name="comment" size="40" color="#999" />
    <wd-icon name="share" size="40" color="#999" />
    <wd-icon name="star" size="40" color="#999" />
  </view>

  <!-- 激活状态使用填充版 -->
  <view class="action-bar">
    <wd-icon name="like-fill" size="40" color="#ee0a24" />
    <wd-icon name="comment" size="40" color="#999" />
    <wd-icon name="share" size="40" color="#999" />
    <wd-icon name="star-fill" size="40" color="#ffc107" />
  </view>
</template>
```

### 3. 语义化颜色使用

```vue
<template>
  <!-- 成功状态 -->
  <wd-icon name="check-outline-fill" color="#07c160" />

  <!-- 警告状态 -->
  <wd-icon name="warn-fill" color="#ff976a" />

  <!-- 错误/危险状态 -->
  <wd-icon name="close-outline-fill" color="#ee0a24" />

  <!-- 信息提示 -->
  <wd-icon name="info-fill" color="#1989fa" />

  <!-- 禁用状态 -->
  <wd-icon name="locked-fill" color="#c8c9cc" />
</template>
```

### 4. 提供足够的点击区域

```vue
<template>
  <!-- 为小图标包装可点击区域 -->
  <view class="icon-btn" @click="handleClick">
    <wd-icon name="close" size="32" />
  </view>
</template>

<style lang="scss" scoped>
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  // 至少 44x44 的点击区域
  width: 88rpx;
  height: 88rpx;

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
  }
}
</style>
```

### 5. 加载状态处理

```vue
<template>
  <wd-button :loading="isLoading" @click="handleSubmit">
    <template v-if="!isLoading" #icon>
      <wd-icon name="check" />
    </template>
    {{ isLoading ? '提交中...' : '提交' }}
  </wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isLoading = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  try {
    await submitData()
  } finally {
    isLoading.value = false
  }
}
</script>
```

### 6. 无障碍访问

```vue
<template>
  <!-- 为纯图标按钮添加无障碍标签 -->
  <view
    class="icon-btn"
    role="button"
    :aria-label="isFavorited ? '取消收藏' : '收藏'"
    @click="toggleFavorite"
  >
    <wd-icon
      :name="isFavorited ? 'star-fill' : 'star'"
      :color="isFavorited ? '#ffc107' : '#999'"
    />
  </view>

  <!-- 在按钮中同时显示图标和文字 -->
  <wd-button icon="delete" type="danger">
    删除
  </wd-button>
</template>
```

## 常见问题

### 1. 图标不显示

**问题原因：**
- 图标名称拼写错误
- 字体文件未正确加载
- UnoCSS 图标未包含在构建中

**解决方案：**

```vue
<template>
  <!-- 检查图标名称拼写，注意大小写敏感 -->
  <wd-icon name="home" />      <!-- 正确 -->
  <wd-icon name="Home" />      <!-- 错误：大小写敏感 -->

  <!-- UnoCSS 图标需要 i- 前缀 -->
  <wd-icon name="i-ep-user" /> <!-- 正确 -->
  <wd-icon name="ep-user" />   <!-- 错误：缺少前缀 -->

  <!-- 图片路径需要包含 / -->
  <wd-icon name="/static/icons/logo.png" />  <!-- 正确 -->
  <wd-icon name="static/icons/logo.png" />   <!-- 可能出问题 -->
</template>
```

### 2. 图标颜色不变化

**问题原因：**
- 图片图标不受 color 属性控制
- CSS 权重问题导致颜色被覆盖

**解决方案：**

```vue
<template>
  <!-- 字体图标：直接使用 color 属性 -->
  <wd-icon name="user" color="#1989fa" />

  <!-- 图片图标：使用 CSS filter 改变颜色 -->
  <wd-icon
    name="/static/icons/user.png"
    custom-style="filter: invert(40%) sepia(90%) saturate(1000%) hue-rotate(200deg);"
  />

  <!-- 或使用 SVG 图片并通过 CSS 控制 -->
  <image
    src="/static/icons/user.svg"
    class="svg-icon"
    style="fill: #1989fa;"
  />
</template>

<style lang="scss" scoped>
// 使用 !important 提高权重
.wd-icon {
  color: #1989fa !important;
}
</style>
```

### 3. UnoCSS 图标打包后丢失

**问题原因：**
- 动态图标名称无法被静态分析
- 图标集未安装

**解决方案：**

```typescript
// uno.config.ts
export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  // 将动态使用的图标添加到 safelist
  safelist: [
    'i-ep-user',
    'i-ep-setting',
    'i-ep-search',
    'i-carbon-home',
    // 添加所有动态使用的图标
  ],
})
```

```bash
# 安装需要的图标集
pnpm add -D @iconify-json/ep @iconify-json/carbon @iconify-json/mdi
```

### 4. 图标点击区域太小

**解决方案：**

```vue
<template>
  <view class="icon-wrapper" @click="handleClick">
    <wd-icon name="close" size="32" />
  </view>
</template>

<style lang="scss" scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  // 扩大点击区域到 44x44
  width: 88rpx;
  height: 88rpx;
  // 可选：添加点击反馈
  &:active {
    opacity: 0.7;
  }
}
</style>
```

### 5. 不同平台显示差异

**问题原因：**
- 各平台对字体渲染方式不同
- px 和 rpx 在不同设备上表现不同

**解决方案：**

```vue
<script lang="ts" setup>
import { computed } from 'vue'

// 根据平台设置不同的图标尺寸
const iconSize = computed(() => {
  // #ifdef H5
  return 20  // H5 使用 px
  // #endif
  // #ifdef MP-WEIXIN || APP-PLUS
  return 40  // 小程序和 App 使用 rpx
  // #endif
})

// 根据平台选择图标类型
const iconName = computed(() => {
  // #ifdef MP-ALIPAY
  // 支付宝小程序不支持某些图标，使用替代方案
  return 'i-ep-user'
  // #endif
  // #ifndef MP-ALIPAY
  return 'user'
  // #endif
})
</script>
```

### 6. 图标动画卡顿

**问题原因：**
- 使用了触发重排的属性
- 动画帧率过高

**解决方案：**

```scss
// 使用 transform 和 opacity 进行动画，避免重排
.rotating {
  // 好的做法：使用 transform
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 避免的做法：使用会触发重排的属性
// @keyframes bad-rotate {
//   from { left: 0; }
//   to { left: 100px; }
// }

// 开启硬件加速
.icon-animated {
  transform: translateZ(0);
  will-change: transform;
}
```

### 7. 自定义图标字体加载失败

**问题原因：**
- 字体文件路径错误
- 字体文件格式不支持
- 跨域问题（仅 H5）

**解决方案：**

```scss
@font-face {
  font-family: 'my-icons';
  // 提供多种格式以兼容不同平台
  src: url('/static/fonts/my-icons.woff2') format('woff2'),
       url('/static/fonts/my-icons.woff') format('woff'),
       url('/static/fonts/my-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap; // 字体加载策略
}
```

### 8. 图标与文字对齐问题

**解决方案：**

```vue
<template>
  <view class="icon-text">
    <wd-icon name="location" size="32" />
    <text>北京市朝阳区</text>
  </view>
</template>

<style lang="scss" scoped>
.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;

  // 确保图标垂直居中
  .wd-icon {
    vertical-align: middle;
    // 微调图标位置
    margin-top: -2rpx;
  }

  text {
    line-height: 1;
  }
}
</style>
```

## 性能优化

### 1. 按需引入图标集

```typescript
// 只安装需要的图标集，而不是全部
// package.json
{
  "devDependencies": {
    "@iconify-json/ep": "^1.0.0",  // Element Plus 图标
    "@iconify-json/carbon": "^1.0.0"  // Carbon 图标
    // 不要安装不需要的图标集
  }
}
```

### 2. 使用 safelist 优化打包

```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    // 只添加确实会动态使用的图标
    ...dynamicIcons,
  ],
})
```

### 3. 图片图标优化

```vue
<template>
  <!-- 使用合适的图片格式 -->
  <wd-icon name="/static/icons/logo.webp" />  <!-- WebP 格式更小 -->
  <wd-icon name="/static/icons/icon.svg" />   <!-- SVG 矢量图标 -->

  <!-- 避免使用过大的图片 -->
  <!-- 推荐：图标图片尺寸 <= 2x 显示尺寸 -->
</template>
```

### 4. 减少图标动画

```vue
<template>
  <!-- 只在必要时使用动画 -->
  <wd-icon
    name="loading"
    :custom-class="isLoading ? 'rotating' : ''"
  />
</template>
```
