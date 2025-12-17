---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/display/card
---

# Card 卡片

## 介绍

Card 卡片组件是一个灵活的内容容器,用于承载图片、文字、列表等内容。卡片组件提供了清晰的内容层级结构,包含标题区域、内容区域和底部操作区域,支持普通卡片和矩形卡片两种样式。

**核心特性:**

- **分区布局** - 提供标题、内容、底部三个独立区域,结构清晰
- **两种类型** - 支持默认卡片(圆角、阴影)和矩形卡片(无圆角、分割线)
- **插槽支持** - 所有区域都支持插槽自定义,灵活度高
- **样式定制** - 每个区域都支持自定义样式类
- **暗黑模式** - 自动适配暗黑主题
- **开箱即用** - 无需复杂配置,简单易用

## 基本用法

### 基础卡片

最简单的卡片用法,通过默认插槽添加内容。

```vue
<template>
  <view class="demo">
    <wd-card title="卡片标题">
      <view class="card-content">
        这是卡片的内容区域,可以放置任意内容。
      </view>
    </wd-card>

    <wd-card title="商品卡片">
      <view class="card-content">
        <view class="product-name">iPhone 15 Pro Max</view>
        <view class="product-desc">全新 A17 Pro 芯片,钛金属设计</view>
        <view class="product-price">¥9999</view>
      </view>
    </wd-card>
  </view>
</template>

```

**使用说明:**
- `title` 属性设置卡片标题
- 默认插槽放置卡片主要内容
- 卡片默认带圆角和阴影效果
- 卡片之间自动添加 `24rpx` 底部间距

### 无标题卡片

卡片可以省略标题,仅显示内容区域。

```vue
<template>
  <view class="demo">
    <wd-card>
      <view class="card-content">
        <view class="message">
          <wd-icon name="notification" size="40" color="#1890ff" />
          <view class="message-text">
            <view class="message-title">系统通知</view>
            <view class="message-desc">您有一条新的系统消息</view>
          </view>
        </view>
      </view>
    </wd-card>
  </view>
</template>

```

**使用说明:**
- 不传入 `title` 属性时,标题区域不显示
- 内容区域会紧邻卡片顶部
- 适合简单的信息展示场景

### 标题插槽

通过 `title` 插槽自定义标题内容。

```vue
<template>
  <view class="demo">
    <wd-card>
      <template #title>
        <view class="custom-title">
          <wd-icon name="star-on" size="32" color="#faad14" />
          <text class="title-text">精选推荐</text>
          <wd-tag type="danger" size="small">HOT</wd-tag>
        </view>
      </template>
      <view class="card-content">
        这是使用自定义标题的卡片内容。
      </view>
    </wd-card>

    <wd-card>
      <template #title>
        <view class="title-with-extra">
          <text class="title-text">订单列表</text>
          <text class="title-extra" @click="handleMore">查看更多 ></text>
        </view>
      </template>
      <view class="card-content">
        订单内容...
      </view>
    </wd-card>
  </view>
</template>

<script lang="ts" setup>
const handleMore = () => {
  console.log('查看更多')
}
</script>

```

**使用说明:**
- 使用 `title` 插槽可以完全自定义标题内容
- 插槽内容可以包含图标、标签、按钮等元素
- 标题区域默认内边距为 `32rpx 0`

### 底部插槽

通过 `footer` 插槽添加底部操作区域。

```vue
<template>
  <view class="demo">
    <wd-card title="商品详情">
      <view class="card-content">
        <view class="product-info">
          <view class="product-name">无线蓝牙耳机</view>
          <view class="product-price">¥299.00</view>
        </view>
      </view>
      <template #footer>
        <view class="card-footer">
          <wd-button type="default" size="small">加入购物车</wd-button>
          <wd-button type="primary" size="small">立即购买</wd-button>
        </view>
      </template>
    </wd-card>

    <wd-card title="用户信息">
      <view class="card-content">
        <view class="user-info">
          <view class="info-item">
            <text class="label">姓名:</text>
            <text class="value">张三</text>
          </view>
          <view class="info-item">
            <text class="label">手机:</text>
            <text class="value">138****8888</text>
          </view>
        </view>
      </view>
      <template #footer>
        <view class="card-footer">
          <wd-button type="primary" size="small" plain>编辑</wd-button>
        </view>
      </template>
    </wd-card>
  </view>
</template>

```

**使用说明:**
- `footer` 插槽用于添加底部操作区域
- 底部区域默认右对齐 `text-align: right`
- 适合放置按钮、链接等操作元素
- 底部区域默认内边距根据卡片类型动态调整

### 矩形卡片

通过 `type="rectangle"` 设置矩形卡片样式。

```vue
<template>
  <view class="demo">
    <wd-card type="rectangle" title="矩形卡片标题">
      <view class="card-content">
        矩形卡片没有圆角和阴影,使用分割线区分区域。
      </view>
      <template #footer>
        <wd-button type="primary" size="small">操作按钮</wd-button>
      </template>
    </wd-card>

    <wd-card type="rectangle" title="订单信息">
      <view class="order-content">
        <view class="order-item">
          <text class="label">订单号:</text>
          <text class="value">2024010112345</text>
        </view>
        <view class="order-item">
          <text class="label">下单时间:</text>
          <text class="value">2024-01-01 10:30</text>
        </view>
        <view class="order-item">
          <text class="label">订单金额:</text>
          <text class="value price">¥299.00</text>
        </view>
      </view>
      <template #footer>
        <view class="order-footer">
          <wd-button type="default" size="small">取消订单</wd-button>
          <wd-button type="primary" size="small">去支付</wd-button>
        </view>
      </template>
    </wd-card>
  </view>
</template>

```

**使用说明:**
- 矩形卡片无左右边距 `margin-left: 0; margin-right: 0`
- 矩形卡片无圆角 `border-radius: 0`
- 矩形卡片无阴影 `box-shadow: none`
- 内容区域和底部区域使用 0.5px 边框线分隔
- 内容和底部区域有独立的内边距

**技术实现:**
- 矩形卡片通过 `is-rectangle` 类名应用样式
- 使用 `halfPixelBorder` mixin 实现 0.5px 分割线
- 暗黑模式下分割线颜色自动调整

### 自定义样式类

通过 `custom-*-class` 属性自定义各区域样式。

```vue
<template>
  <view class="demo">
    <wd-card
      title="自定义样式卡片"
      custom-class="custom-card"
      custom-title-class="custom-title"
      custom-content-class="custom-content"
      custom-footer-class="custom-footer"
    >
      <view class="card-content">
        这是使用自定义样式类的卡片内容。
      </view>
      <template #footer>
        <wd-button type="primary" size="small">确定</wd-button>
      </template>
    </wd-card>
  </view>
</template>

```

**使用说明:**
- `custom-class` - 自定义根节点样式类
- `custom-title-class` - 自定义标题区域样式类
- `custom-content-class` - 自定义内容区域样式类
- `custom-footer-class` - 自定义底部区域样式类
- `custom-style` - 自定义根节点内联样式

### 卡片组合

多个卡片组合使用的场景。

```vue
<template>
  <view class="demo">
    <wd-card title="数据统计">
      <view class="stats-content">
        <view class="stat-item">
          <view class="stat-value">1,234</view>
          <view class="stat-label">访问量</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">567</view>
          <view class="stat-label">订单数</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">89</view>
          <view class="stat-label">用户数</view>
        </view>
      </view>
    </wd-card>

    <wd-card title="快捷入口">
      <view class="shortcuts-content">
        <view class="shortcut-item">
          <wd-icon name="shopping-cart" size="48" color="#1890ff" />
          <text class="shortcut-text">购物车</text>
        </view>
        <view class="shortcut-item">
          <wd-icon name="order" size="48" color="#52c41a" />
          <text class="shortcut-text">我的订单</text>
        </view>
        <view class="shortcut-item">
          <wd-icon name="user" size="48" color="#faad14" />
          <text class="shortcut-text">个人中心</text>
        </view>
        <view class="shortcut-item">
          <wd-icon name="setting" size="48" color="#ff4d4f" />
          <text class="shortcut-text">设置</text>
        </view>
      </view>
    </wd-card>

    <wd-card title="最新动态">
      <view class="activity-content">
        <view
          v-for="(item, index) in activities"
          :key="index"
          class="activity-item"
        >
          <view class="activity-dot"></view>
          <view class="activity-info">
            <view class="activity-title">{{ item.title }}</view>
            <view class="activity-time">{{ item.time }}</view>
          </view>
        </view>
      </view>
    </wd-card>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activities = ref([
  { title: '完成了订单支付', time: '5分钟前' },
  { title: '添加了新商品', time: '1小时前' },
  { title: '发布了新评论', time: '2小时前' },
])
</script>

```

**使用说明:**
- 多个卡片垂直排列时会自动添加间距
- 可以在卡片内实现各种布局(网格、列表、时间轴等)
- 统一的卡片容器提供一致的视觉体验

## 实战案例

### 案例1: 商品卡片列表

实现电商场景的商品卡片展示。

```vue
<template>
  <view class="product-list">
    <wd-card v-for="product in products" :key="product.id">
      <view class="product-card">
        <image :src="product.image" class="product-image" mode="aspectFill" />
        <view class="product-info">
          <view class="product-name">{{ product.name }}</view>
          <view class="product-desc">{{ product.desc }}</view>
          <view class="product-tags">
            <wd-tag v-for="tag in product.tags" :key="tag" size="small" plain>
              {{ tag }}
            </wd-tag>
          </view>
          <view class="product-bottom">
            <view class="product-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ product.price }}</text>
            </view>
            <wd-button type="primary" size="small" round>
              加入购物车
            </wd-button>
          </view>
        </view>
      </view>
    </wd-card>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  desc: string
  price: number
  image: string
  tags: string[]
}

const products = ref<Product[]>([
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    desc: '钛金属设计 | A17 Pro芯片',
    price: 9999,
    image: '/images/product1.jpg',
    tags: ['新品', '热销'],
  },
  {
    id: 2,
    name: 'MacBook Pro 16',
    desc: 'M3 Max芯片 | 96GB内存',
    price: 19999,
    image: '/images/product2.jpg',
    tags: ['旗舰', '专业'],
  },
])
</script>

```

**功能说明:**
- 商品图片、名称、描述、标签、价格完整展示
- 使用卡片容器统一视觉风格
- 响应式布局,适配不同屏幕

### 案例2: 文章卡片

实现文章或新闻的卡片展示。

```vue
<template>
  <view class="article-list">
    <wd-card v-for="article in articles" :key="article.id">
      <template #title>
        <view class="article-header">
          <image :src="article.avatar" class="author-avatar" />
          <view class="author-info">
            <view class="author-name">{{ article.author }}</view>
            <view class="publish-time">{{ article.time }}</view>
          </view>
        </view>
      </template>
      <view class="article-content">
        <view class="article-title">{{ article.title }}</view>
        <view class="article-excerpt">{{ article.excerpt }}</view>
        <image
          v-if="article.cover"
          :src="article.cover"
          class="article-cover"
          mode="aspectFill"
        />
      </view>
      <template #footer>
        <view class="article-footer">
          <view class="article-stat">
            <wd-icon name="view" size="32" color="#999" />
            <text>{{ article.views }}</text>
          </view>
          <view class="article-stat">
            <wd-icon name="thumbs-up" size="32" color="#999" />
            <text>{{ article.likes }}</text>
          </view>
          <view class="article-stat">
            <wd-icon name="chat" size="32" color="#999" />
            <text>{{ article.comments }}</text>
          </view>
        </view>
      </template>
    </wd-card>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Article {
  id: number
  title: string
  excerpt: string
  cover?: string
  author: string
  avatar: string
  time: string
  views: number
  likes: number
  comments: number
}

const articles = ref<Article[]>([
  {
    id: 1,
    title: 'Vue 3.5 正式发布',
    excerpt: 'Vue 3.5 带来了响应式系统的重大优化...',
    cover: '/images/cover1.jpg',
    author: '技术小白',
    avatar: '/images/avatar1.jpg',
    time: '2小时前',
    views: 1234,
    likes: 56,
    comments: 12,
  },
])
</script>

```

**功能说明:**
- 作者信息在标题区域展示
- 文章标题、摘要、封面图在内容区域
- 统计数据(浏览、点赞、评论)在底部区域
- 完整的社交媒体卡片布局

### 案例3: 订单卡片

实现订单管理场景的卡片展示。

```vue
<template>
  <view class="order-list">
    <wd-card
      v-for="order in orders"
      :key="order.id"
      type="rectangle"
    >
      <template #title>
        <view class="order-header">
          <view class="order-no">订单号: {{ order.orderNo }}</view>
          <wd-tag :options="orderStatusDict" :value="order.status"></wd-tag>
        </view>
      </template>
      <view class="order-content">
        <view
          v-for="item in order.items"
          :key="item.id"
          class="order-item"
        >
          <image :src="item.image" class="item-image" mode="aspectFill" />
          <view class="item-info">
            <view class="item-name">{{ item.name }}</view>
            <view class="item-spec">{{ item.spec }}</view>
            <view class="item-bottom">
              <view class="item-price">¥{{ item.price }}</view>
              <view class="item-quantity">x{{ item.quantity }}</view>
            </view>
          </view>
        </view>
        <view class="order-total">
          <text>合计:</text>
          <text class="total-price">¥{{ order.totalPrice }}</text>
        </view>
      </view>
      <template #footer>
        <view class="order-footer">
          <wd-button
            v-if="order.status === 1"
            type="default"
            size="small"
          >
            取消订单
          </wd-button>
          <wd-button
            v-if="order.status === 1"
            type="primary"
            size="small"
          >
            去支付
          </wd-button>
          <wd-button
            v-if="order.status === 2"
            type="primary"
            size="small"
          >
            提醒发货
          </wd-button>
          <wd-button
            v-if="order.status === 3"
            type="primary"
            size="small"
          >
            确认收货
          </wd-button>
          <wd-button
            v-if="order.status === 4"
            type="default"
            size="small"
          >
            查看详情
          </wd-button>
        </view>
      </template>
    </wd-card>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface OrderItem {
  id: number
  name: string
  spec: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: number
  orderNo: string
  status: number
  items: OrderItem[]
  totalPrice: number
}

const orderStatusDict = ref([
  { label: '待付款', value: 1, elTagType: 'warning' },
  { label: '待发货', value: 2, elTagType: 'primary' },
  { label: '待收货', value: 3, elTagType: 'info' },
  { label: '已完成', value: 4, elTagType: 'success' },
])

const orders = ref<Order[]>([
  {
    id: 1,
    orderNo: '2024010112345',
    status: 1,
    totalPrice: 299,
    items: [
      {
        id: 1,
        name: '无线蓝牙耳机',
        spec: '黑色 | 标准版',
        price: 299,
        quantity: 1,
        image: '/images/product.jpg',
      },
    ],
  },
])
</script>

```

**功能说明:**
- 使用矩形卡片展示订单信息
- 订单状态使用字典自动映射颜色
- 根据订单状态显示不同的操作按钮
- 完整的订单管理流程支持

### 案例4: 用户信息卡片

实现个人中心的用户信息卡片。

```vue
<template>
  <view class="user-profile">
    <wd-card custom-class="profile-card">
      <view class="profile-content">
        <view class="profile-header">
          <image :src="userInfo.avatar" class="user-avatar" />
          <view class="user-basic">
            <view class="user-name">{{ userInfo.name }}</view>
            <view class="user-level">
              <wd-tag type="warning" size="small">
                VIP {{ userInfo.level }}
              </wd-tag>
            </view>
          </view>
        </view>
        <view class="profile-stats">
          <view class="stat-item">
            <view class="stat-value">{{ userInfo.following }}</view>
            <view class="stat-label">关注</view>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <view class="stat-value">{{ userInfo.followers }}</view>
            <view class="stat-label">粉丝</view>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <view class="stat-value">{{ userInfo.posts }}</view>
            <view class="stat-label">动态</view>
          </view>
        </view>
      </view>
      <template #footer>
        <view class="profile-footer">
          <wd-button type="primary" size="small" block>编辑资料</wd-button>
        </view>
      </template>
    </wd-card>

    <wd-card title="个人信息">
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">手机号</text>
          <text class="info-value">138****8888</text>
        </view>
        <view class="info-item">
          <text class="info-label">邮箱</text>
          <text class="info-value">user@example.com</text>
        </view>
        <view class="info-item">
          <text class="info-label">生日</text>
          <text class="info-value">1990-01-01</text>
        </view>
        <view class="info-item">
          <text class="info-label">地区</text>
          <text class="info-value">北京市 朝阳区</text>
        </view>
      </view>
    </wd-card>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const userInfo = ref({
  name: '张三',
  avatar: '/images/avatar.jpg',
  level: 3,
  following: 123,
  followers: 456,
  posts: 89,
})
</script>

```

**功能说明:**
- 使用渐变背景定制卡片样式
- 用户头像、昵称、等级展示
- 关注数、粉丝数、动态数统计
- 个人信息列表展示

### 案例5: 通知消息卡片

实现通知消息的卡片列表。

```vue
<template>
  <view class="notification-list">
    <wd-card
      v-for="notification in notifications"
      :key="notification.id"
      type="rectangle"
    >
      <view class="notification-content" @click="handleClick(notification)">
        <view class="notification-icon">
          <wd-icon
            :name="notification.icon"
            size="48"
            :color="notification.color"
          />
        </view>
        <view class="notification-info">
          <view class="notification-title">{{ notification.title }}</view>
          <view class="notification-desc">{{ notification.desc }}</view>
          <view class="notification-time">{{ notification.time }}</view>
        </view>
        <wd-icon
          v-if="!notification.read"
          name="notification-fill"
          size="24"
          color="#ff4d4f"
        />
      </view>
    </wd-card>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Notification {
  id: number
  title: string
  desc: string
  time: string
  icon: string
  color: string
  read: boolean
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    title: '系统通知',
    desc: '您的订单已发货,请注意查收',
    time: '5分钟前',
    icon: 'notification',
    color: '#1890ff',
    read: false,
  },
  {
    id: 2,
    title: '优惠活动',
    desc: '新人专享优惠券已到账',
    time: '1小时前',
    icon: 'coupon',
    color: '#ff4d4f',
    read: false,
  },
  {
    id: 3,
    title: '物流提醒',
    desc: '您的快递已签收',
    time: '昨天',
    icon: 'logistics',
    color: '#52c41a',
    read: true,
  },
])

const handleClick = (notification: Notification) => {
  notification.read = true
  console.log('点击通知:', notification.id)
}
</script>

```

**功能说明:**
- 通知图标、标题、描述、时间展示
- 未读状态使用红点标识
- 点击通知标记为已读
- 使用矩形卡片无缝衔接

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 卡片类型,可选值:`rectangle`(矩形卡片) | `'rectangle' \| undefined` | `undefined` |
| title | 卡片标题 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点内联样式 | `string` | `''` |
| custom-title-class | 自定义标题区域样式类 | `string` | `''` |
| custom-content-class | 自定义内容区域样式类 | `string` | `''` |
| custom-footer-class | 自定义底部区域样式类 | `string` | `''` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 卡片内容区域 |
| title | 卡片标题区域(优先级高于 title 属性) |
| footer | 卡片底部区域 |

### 类型定义

```typescript
/**
 * 卡片类型
 */
type CardType = 'rectangle'

/**
 * 卡片组件属性接口
 */
interface WdCardProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 卡片类型 */
  type?: CardType
  /** 卡片标题 */
  title?: string
  /** 标题自定义样式类 */
  customTitleClass?: string
  /** 内容自定义样式类 */
  customContentClass?: string
  /** 底部自定义样式类 */
  customFooterClass?: string
}
```

## 主题定制

### CSS 变量

Card 组件提供了以下 CSS 变量用于主题定制:

```scss
// 卡片布局
$-card-padding: 32rpx;              // 卡片内边距
$-card-margin: 24rpx 24rpx 0;      // 卡片外边距
$-card-radius: 16rpx;              // 卡片圆角
$-card-bg: #fff;                   // 卡片背景色
$-card-shadow-color: 0 2rpx 12rpx rgba(100, 101, 102, 0.12); // 卡片阴影

// 卡片内容
$-card-fs: 28rpx;                  // 卡片字体大小
$-card-line-height: 1.4;           // 卡片行高

// 标题区域
$-card-title-color: #323233;       // 标题颜色
$-card-title-fs: 32rpx;            // 标题字体大小

// 内容区域
$-card-content-color: #969799;     // 内容颜色
$-card-content-line-height: 1.6;   // 内容行高
$-card-content-border-color: #ebedf0; // 内容边框色(矩形卡片)

// 底部区域
$-card-footer-padding: 24rpx 0 0;  // 底部内边距

// 矩形卡片
$-card-rectangle-content-padding: 32rpx 32rpx; // 矩形卡片内容内边距
$-card-rectangle-footer-padding: 24rpx 32rpx;  // 矩形卡片底部内边距

// 暗黑模式
$-dark-background2: #1f1f1f;       // 暗黑模式背景色
$-dark-border-color: #3a3a3c;      // 暗黑模式边框色
$-dark-color: #e5e5e5;             // 暗黑模式文字色
$-dark-color3: #a8a8a8;            // 暗黑模式次要文字色
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-card title="自定义主题卡片" custom-class="custom-card">
      <view>这是自定义主题的卡片内容</view>
    </wd-card>
  </view>
</template>

```

### 暗黑模式

Card 组件自动支持暗黑模式,在暗黑主题下会应用暗色样式:

```scss
.wot-theme-dark {
  .wd-card {
    background-color: #1f1f1f;

    &.is-rectangle {
      .wd-card__content,
      .wd-card__footer {
        border-color: #3a3a3c;
      }
    }

    .wd-card__title-content {
      color: #e5e5e5;
    }

    .wd-card__content {
      color: #a8a8a8;
    }
  }
}
```

## 最佳实践

### 1. 合理使用卡片类型

```vue
<!-- ✅ 好的示例:根据场景选择类型 -->
<!-- 独立展示的信息卡片 -->
<wd-card title="商品详情">内容...</wd-card>

<!-- 列表形式的订单卡片 -->
<wd-card type="rectangle" title="订单信息">内容...</wd-card>

<!-- ❌ 不好的示例:类型选择不当 -->
<!-- 列表场景使用默认卡片,左右留白影响视觉 -->
<view v-for="item in list" :key="item.id">
  <wd-card>内容...</wd-card>
</view>
```

**说明:**
- 默认卡片适合独立展示、强调内容的场景
- 矩形卡片适合列表、无缝衔接的场景
- 矩形卡片占满屏幕宽度,适合移动端

### 2. 标题和标题插槽的选择

```vue
<!-- ✅ 好的示例:简单标题用属性 -->
<wd-card title="用户信息">
  <view>内容...</view>
</wd-card>

<!-- ✅ 好的示例:复杂标题用插槽 -->
<wd-card>
  <template #title>
    <view class="custom-title">
      <text>订单列表</text>
      <wd-button size="small" type="text">查看更多</wd-button>
    </view>
  </template>
  <view>内容...</view>
</wd-card>

<!-- ❌ 不好的示例:简单标题使用插槽 -->
<wd-card>
  <template #title>
    <text>用户信息</text>
  </template>
  <view>内容...</view>
</wd-card>
```

**说明:**
- 纯文本标题使用 `title` 属性更简洁
- 包含图标、按钮、标签等复杂内容时使用 `title` 插槽
- 标题插槽优先级高于 `title` 属性

### 3. 底部操作区域的布局

```vue
<!-- ✅ 好的示例:明确的操作布局 -->
<wd-card title="确认订单">
  <view>内容...</view>
  <template #footer>
    <view class="footer-actions">
      <wd-button type="default">取消</wd-button>
      <wd-button type="primary">确认</wd-button>
    </view>
  </template>
</wd-card>

<style>
.footer-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}
</style>

<!-- ❌ 不好的示例:操作按钮布局混乱 -->
<wd-card title="确认订单">
  <view>内容...</view>
  <template #footer>
    <wd-button type="default">取消</wd-button>
    <wd-button type="primary">确认</wd-button>
  </template>
</wd-card>
```

**说明:**
- 底部区域默认右对齐
- 多个按钮使用 flex 布局控制间距
- 主要操作按钮放在右侧

### 4. 内容区域的间距控制

```vue
<!-- ✅ 好的示例:统一的内容间距 -->
<wd-card title="商品信息">
  <view class="card-content">
    <view class="content-section">
      <text class="label">商品名称:</text>
      <text class="value">iPhone 15</text>
    </view>
    <view class="content-section">
      <text class="label">商品价格:</text>
      <text class="value">¥5999</text>
    </view>
  </view>
</wd-card>

<style>
.card-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx; /* 统一间距 */
}
</style>

<!-- ❌ 不好的示例:间距不统一 -->
<wd-card title="商品信息">
  <view>
    <view style="margin-bottom: 10rpx">内容1</view>
    <view style="margin-bottom: 20rpx">内容2</view>
    <view style="margin-bottom: 15rpx">内容3</view>
  </view>
</wd-card>
```

**说明:**
- 使用 flex 布局的 gap 属性统一间距
- 避免每个元素单独设置 margin
- 保持视觉节奏的一致性

## 常见问题

### 1. 卡片之间间距不一致

**问题原因:**
- 卡片默认有 `margin-bottom: 24rpx`
- 最后一个卡片也会有底部间距

**解决方案:**

```vue
<template>
  <view class="card-list">
    <wd-card v-for="item in list" :key="item.id">
      内容...
    </wd-card>
  </view>
</template>

```

### 2. 矩形卡片的分割线显示异常

**问题原因:**
- 矩形卡片使用 0.5px 边框线
- 某些设备或浏览器不支持 0.5px

**解决方案:**

```scss
/* 组件内部已使用 halfPixelBorder mixin */
/* 该 mixin 会自动处理不支持 0.5px 的情况 */

/* 如果仍有问题,可以使用自定义样式 */
.custom-divider {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1rpx;
    background: #ebedf0;
    transform: scaleY(0.5);
  }
}
```

### 3. 卡片内容溢出

**问题原因:**
- 内容宽度超出卡片宽度
- 图片未设置最大宽度

**解决方案:**

```vue
<template>
  <wd-card title="内容卡片">
    <view class="card-content">
      <!-- ✅ 文字溢出省略 -->
      <view class="text-overflow">
        这是一段很长的文字内容...
      </view>

      <!-- ✅ 图片自适应 -->
      <image src="/path/to/image.jpg" class="responsive-image" mode="widthFix" />
    </view>
  </wd-card>
</template>

```

### 4. 自定义样式不生效

**问题原因:**
- 样式隔离导致外部样式无法穿透
- 样式优先级不够

**解决方案:**

```vue
<template>
  <wd-card custom-class="my-card">
    内容...
  </wd-card>
</template>


<template>
  <wd-card custom-style="background: #f0f9ff; border: 2rpx solid #1890ff">
    内容...
  </wd-card>
</template>
```

### 5. 暗黑模式下卡片颜色异常

**问题原因:**
- 自定义背景色覆盖了暗黑模式样式
- 未考虑暗黑模式的颜色适配

**解决方案:**

```vue
<template>
  <wd-card custom-class="themed-card">
    内容...
  </wd-card>
</template>

```
