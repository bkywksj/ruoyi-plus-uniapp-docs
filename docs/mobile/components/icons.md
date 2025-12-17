# 图标使用

## 介绍

项目提供强大灵活的图标系统，支持三种图标类型：**内置字体图标**、**UnoCSS 图标**和**图片图标**。

**核心特性：**

- **内置字体图标** - 200+ 矢量图标，11 个类别，支持离线
- **UnoCSS 图标** - 集成 Iconify，支持数万图标
- **图片图标** - 支持本地和网络图片
- **样式定制** - 自定义颜色、尺寸、动画
- **类型安全** - 完整 TypeScript 类型定义

## 图标类型

### 内置字体图标

基于 iconfont 字体实现，风格统一：

```vue
<template>
  <view class="icon-demo">
    <wd-icon name="home" />
    <wd-icon name="search" />
    <wd-icon name="setting" />
    <!-- 填充版：名称后加 -fill -->
    <wd-icon name="home-fill" />
  </view>
</template>
```

### UnoCSS 图标

使用 Iconify 图标库，以 `i-` 为前缀：

```vue
<template>
  <view class="icon-demo">
    <!-- Element Plus -->
    <wd-icon name="i-ep-user" />
    <wd-icon name="i-ep-setting" />
    <!-- Carbon -->
    <wd-icon name="i-carbon-home" />
    <!-- Material Design -->
    <wd-icon name="i-mdi-account" />
  </view>
</template>
```

**常用图标集：**

| 前缀 | 图标集 | 说明 |
|------|--------|------|
| `i-ep-` | Element Plus | Element Plus 设计图标 |
| `i-carbon-` | Carbon | IBM Carbon 设计图标 |
| `i-mdi-` | Material Design Icons | Google Material 图标 |
| `i-tabler-` | Tabler Icons | 简洁线性图标 |
| `i-ri-` | Remix Icon | 中性风格图标 |
| `i-lucide-` | Lucide | Feather 扩展版 |

### 图片图标

使用本地或网络图片作为图标：

```vue
<template>
  <view class="icon-demo">
    <wd-icon name="/static/icons/custom.png" size="32" />
    <wd-icon name="https://example.com/icon.png" size="32" />
  </view>
</template>
```

## 图标属性

### 尺寸设置

通过 `size` 属性设置大小：

```vue
<template>
  <view class="icon-demo">
    <wd-icon name="user" size="24" />
    <wd-icon name="user" size="32" />
    <wd-icon name="user" size="48" />
    <wd-icon name="user" size="16px" />
  </view>
</template>
```

**尺寸规范：**

| 场景 | 推荐尺寸 |
|------|---------|
| 按钮图标 | 32-40 |
| 列表图标 | 40-48 |
| 导航图标 | 44-52 |
| 大图标 | 64-96 |

### 颜色设置

通过 `color` 属性设置颜色：

```vue
<template>
  <view class="icon-demo">
    <wd-icon name="heart" color="#1989fa" />
    <wd-icon name="heart" color="#07c160" />
    <wd-icon name="heart" color="var(--wd-color-primary)" />
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

### 旋转动画

为图标添加旋转动画：

```vue
<template>
  <wd-icon name="loading" custom-class="rotating" />
</template>

<style lang="scss" scoped>
.rotating {
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

## 内置图标分类

### 系统操作类

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `home` | `home-fill` | 首页 |
| `back` | `back-fill` | 返回 |
| `close` | `close-fill` | 关闭 |
| `check` | `check-fill` | 确认 |
| `menu` | `menu-fill` | 菜单 |
| `more` | `more-fill` | 更多 |
| `search` | `search-fill` | 搜索 |
| `filter` | `filter-fill` | 筛选 |
| `refresh` | `refresh-fill` | 刷新 |
| `setting` | `setting-fill` | 设置 |
| `help` | `help-fill` | 帮助 |
| `add` | `add-fill` | 添加 |
| `edit` | `edit-fill` | 编辑 |
| `delete` | `delete-fill` | 删除 |
| `copy` | `copy-fill` | 复制 |
| `save` | `save-fill` | 保存 |
| `upload` | `upload-fill` | 上传 |
| `download` | `download-fill` | 下载 |
| `share` | `share-fill` | 分享 |
| `scan` | `scan-fill` | 扫描 |
| `play` | `play-fill` | 播放 |
| `pause` | `pause-fill` | 暂停 |

### 导航箭头类

| 图标名 | 说明 |
|--------|------|
| `up` / `down` / `left` / `right` | 方向箭头 |
| `chevron-up/down/left/right` | V形箭头 |
| `caret-up/down/left/right` | 三角箭头 |
| `backtop` | 返回顶部 |
| `unfold-more` / `unfold-less` | 展开/收起 |

### 状态指示类

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `warn` | `warn-fill` | 警告 |
| `info` | `info-fill` | 信息 |
| `loading` | - | 加载中 |
| `locked` | `locked-fill` | 已锁定 |
| `visible` | `visible-fill` | 可见 |
| `hidden` | `hidden-fill` | 隐藏 |
| `star` | `star-fill` | 星标 |
| `heart` | `heart-fill` | 爱心 |
| `like` | `like-fill` | 点赞 |
| `notification` | `notification-fill` | 通知 |

### 用户相关类

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `user` | `user-fill` | 用户 |
| `user-add` | `user-add-fill` | 添加用户 |
| `team` | `team-fill` | 团队 |
| `contact` | `contact-fill` | 联系人 |
| `vip` | `vip-fill` | VIP |
| `male` | `male-fill` | 男性 |
| `female` | `female-fill` | 女性 |
| `crown` | `crown-fill` | 皇冠 |

### 通讯媒体类

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `call` | `call-fill` | 通话 |
| `phone` | `phone-fill` | 电话 |
| `message` | `message-fill` | 消息 |
| `mail` | `mail-fill` | 邮件 |
| `camera` | `camera-fill` | 相机 |
| `image` | `image-fill` | 图片 |
| `wifi` | `wifi-fill` | WiFi |
| `cloud` | `cloud-fill` | 云 |

### 商业功能类

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `cart` | `cart-fill` | 购物车 |
| `payment` | `payment-fill` | 支付 |
| `order` | `order-fill` | 订单 |
| `coupon` | `coupon-fill` | 优惠券 |
| `gift` | `gift-fill` | 礼物 |
| `wallet` | `wallet-fill` | 钱包 |
| `shop` | `shop-fill` | 商店 |
| `goods` | `goods-fill` | 商品 |
| `qrcode` | `qrcode-fill` | 二维码 |

### 文件管理类

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `file` | `file-fill` | 文件 |
| `folder` | `folder-fill` | 文件夹 |
| `file-word` | `file-word-fill` | Word |
| `file-excel` | `file-excel-fill` | Excel |
| `file-ppt` | `file-ppt-fill` | PPT |
| `file-pdf` | `file-pdf-fill` | PDF |
| `attach` | `attach-fill` | 附件 |

### 工具功能类

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `calendar` | `calendar-fill` | 日历 |
| `location` | `location-fill` | 位置 |
| `map` | `map-fill` | 地图 |
| `tools` | `tools-fill` | 工具 |
| `history` | `history-fill` | 历史 |
| `service` | `service-fill` | 客服 |

### 数据图表类

| 图标名 | 说明 |
|--------|------|
| `chart` / `chart-fill` | 折线图 |
| `chart-bar` / `chart-bar-fill` | 柱状图 |
| `trending-up` | 上升趋势 |
| `trending-down` | 下降趋势 |
| `asc` / `desc` | 升序/降序 |

### 平台品牌类

| 图标名 | 填充版 | 说明 |
|--------|--------|------|
| `wechat` | `wechat-fill` | 微信 |
| `qq` | `qq-fill` | QQ |
| `weibo` | `weibo-fill` | 微博 |
| `alipay` | `alipay-fill` | 支付宝 |
| `github` | `github-fill` | GitHub |
| `apple` | `apple-fill` | Apple |

## 图标与组件结合

### 图标按钮

```vue
<template>
  <wd-button icon="add">新增</wd-button>
  <wd-button icon="edit" type="primary">编辑</wd-button>
  <wd-button icon="search" round />
</template>
```

### 输入框图标

```vue
<template>
  <wd-input v-model="username" placeholder="请输入用户名">
    <template #prefix>
      <wd-icon name="user" size="36" color="#999" />
    </template>
  </wd-input>

  <wd-input v-model="password" :type="showPwd ? 'text' : 'password'">
    <template #suffix>
      <wd-icon
        :name="showPwd ? 'visible' : 'hidden'"
        @click="showPwd = !showPwd"
      />
    </template>
  </wd-input>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const username = ref('')
const password = ref('')
const showPwd = ref(false)
</script>
```

### 列表项图标

```vue
<template>
  <wd-cell-group>
    <wd-cell title="个人信息" is-link>
      <template #icon>
        <wd-icon name="user-fill" size="40" color="#1989fa" />
      </template>
    </wd-cell>
    <wd-cell title="账户安全" is-link>
      <template #icon>
        <wd-icon name="secured-fill" size="40" color="#07c160" />
      </template>
    </wd-cell>
  </wd-cell-group>
</template>
```

### 状态图标

```vue
<template>
  <!-- 收藏状态 -->
  <view @click="favorited = !favorited">
    <wd-icon
      :name="favorited ? 'star-fill' : 'star'"
      :color="favorited ? '#ffc107' : '#999'"
      size="48"
    />
  </view>

  <!-- 点赞状态 -->
  <view @click="liked = !liked">
    <wd-icon
      :name="liked ? 'heart-fill' : 'heart'"
      :color="liked ? '#ee0a24' : '#999'"
      size="48"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const favorited = ref(false)
const liked = ref(false)
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 图标名称 | `string` | - |
| color | 图标颜色 | `string` | - |
| size | 图标大小（默认rpx） | `string \| number` | `40` |
| class-prefix | 类名前缀 | `string` | `wd-icon` |
| custom-style | 自定义样式 | `string` | - |
| custom-class | 自定义类名 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击时触发 | `event: Event` |
| touch | 触摸时触发 | `event: Event` |

### 类型定义

```typescript
/** 字体图标名称 */
type FontIconName =
  | 'home' | 'home-fill'
  | 'back' | 'back-fill'
  | 'close' | 'close-fill'
  | 'check' | 'check-fill'
  | 'search' | 'search-fill'
  | 'setting' | 'setting-fill'
  | 'user' | 'user-fill'
  // ... 更多图标

/** UnoCSS 图标名称 */
type UnoIconName = `i-${string}`

/** 图标名称联合类型 */
type IconName = FontIconName | UnoIconName | string

/** 图标组件属性 */
interface WdIconProps {
  name: IconName
  color?: string
  size?: string | number
  classPrefix?: string
  customStyle?: string
  customClass?: string
}
```

## 主题定制

### CSS 变量

```scss
$wd-icon-size: 40rpx !default;
$wd-icon-color: inherit !default;
```

### 自定义图标字体

```vue
<template>
  <wd-icon name="custom-home" class-prefix="my-icon" size="40" />
</template>

<style lang="scss">
@font-face {
  font-family: 'my-icons';
  src: url('/static/fonts/my-icons.ttf') format('truetype');
}
.my-icon {
  font-family: 'my-icons' !important;
}
.my-icon-custom-home:before {
  content: '\e001';
}
</style>
```

## 最佳实践

### 1. 选择合适的图标类型

```vue
<template>
  <!-- 常用功能：内置字体图标 -->
  <wd-icon name="home" />

  <!-- 特殊图标：UnoCSS -->
  <wd-icon name="i-ep-document" />

  <!-- 品牌Logo：图片 -->
  <wd-icon name="/static/icons/brand.svg" />
</template>
```

### 2. 保持一致性

```vue
<template>
  <!-- 同一行图标使用相同尺寸 -->
  <view class="action-bar">
    <wd-icon name="like" size="40" />
    <wd-icon name="comment" size="40" />
    <wd-icon name="share" size="40" />
  </view>
</template>
```

### 3. 语义化颜色

```vue
<template>
  <wd-icon name="check-outline-fill" color="#07c160" /> <!-- 成功 -->
  <wd-icon name="warn-fill" color="#ff976a" />          <!-- 警告 -->
  <wd-icon name="close-outline-fill" color="#ee0a24" /> <!-- 错误 -->
</template>
```

### 4. 点击反馈

```vue
<template>
  <view class="icon-btn" @click="handleClick">
    <wd-icon name="star" size="48" />
  </view>
</template>

<style lang="scss" scoped>
.icon-btn {
  padding: 16rpx;
  border-radius: 50%;
  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
</style>
```

## 常见问题

### 1. 图标不显示

**原因：** 图标名称错误或字体未加载

**解决：**
```vue
<template>
  <wd-icon name="home" />      <!-- 正确 -->
  <wd-icon name="Home" />      <!-- 错误：大小写敏感 -->
  <wd-icon name="i-ep-user" /> <!-- 正确：UnoCSS需要i-前缀 -->
</template>
```

### 2. 图标颜色不变

**原因：** 图片图标不受 color 属性影响

**解决：**
```vue
<template>
  <!-- 字体图标：直接使用 color -->
  <wd-icon name="user" color="#1989fa" />

  <!-- 图片图标：使用 CSS filter -->
  <wd-icon
    name="/static/icons/user.png"
    custom-style="filter: invert(40%) sepia(90%) saturate(1000%);"
  />
</template>
```

### 3. UnoCSS 图标打包丢失

**原因：** 动态图标名称无法静态分析

**解决：**
```typescript
// uno.config.ts
export default defineConfig({
  safelist: [
    'i-ep-user',
    'i-ep-setting',
    // 添加需要的图标
  ],
})
```

### 4. 图标点击区域小

**解决：**
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
  width: 88rpx;
  height: 88rpx;
}
</style>
```

### 5. 平台显示差异

```vue
<script lang="ts" setup>
import { computed } from 'vue'

const iconSize = computed(() => {
  // #ifdef H5
  return 20
  // #endif
  // #ifdef MP-WEIXIN || APP-PLUS
  return 40
  // #endif
})
</script>
```
