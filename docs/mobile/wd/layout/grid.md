# Grid 宫格

## 介绍

Grid 宫格组件是一个强大的网格布局容器,用于在页面中展示等宽度的网格内容块。该组件常用于首页导航菜单、功能入口、图标列表等场景,支持灵活的列数配置、间距调整、边框显示等特性。

**核心特性:**

- **双模式支持** - 支持 items 数组模式和子组件模式两种使用方式,灵活满足不同场景需求
- **响应式列数** - 支持自定义列数(column),自动计算每项宽度,适配不同屏幕尺寸
- **间距控制** - 支持 gutter 属性设置网格间距,实现卡片式布局效果
- **正方形模式** - 支持 square 属性将网格项固定为正方形,保持视觉统一
- **边框样式** - 支持显示/隐藏边框,边框采用 0.5px 细线实现,支持暗黑模式
- **徽标集成** - 内置 Badge 徽标组件,支持小红点、数字徽标等多种样式
- **点击反馈** - 支持 clickable 属性开启点击高亮效果,提供良好的交互体验
- **页面跳转** - 支持配置 url 和 linkType 实现多种页面跳转方式(navigateTo/switchTab/reLaunch/redirectTo)
- **插槽扩展** - 支持内容插槽、图标插槽、文字插槽,实现高度自定义的内容展示
- **暗黑模式** - 完整支持暗黑主题,自动适配边框和背景色

参考: src/wd/components/wd-grid/wd-grid.vue:1-443

## 基本用法

### 基础宫格(子组件模式)

使用 `wd-grid` 和 `wd-grid-item` 组合实现基础宫格布局,默认4列显示。

```vue
<template>
  <view class="demo">
    <wd-grid>
      <wd-grid-item
        v-for="item in 8"
        :key="item"
        icon="home-outlined"
        :text="`选项${item}`"
      />
    </wd-grid>
  </view>
</template>

<script lang="ts" setup>
// 子组件模式无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `wd-grid` 是容器组件,负责管理网格布局
- `wd-grid-item` 是子项组件,展示具体内容
- 子组件模式通过父子组件通信自动计算布局样式
- 默认 column 为 4,即每行显示4个网格项

参考: src/wd/components/wd-grid/wd-grid.vue:71-73

### 基础宫格(items模式)

使用 `items` 数组属性快速渲染多个网格项,适合数据驱动的场景。

```vue
<template>
  <view class="demo">
    <wd-grid
      :items="gridItems"
      clickable
      @item-click="handleItemClick"
    />
  </view>
</template>

<script lang="ts" setup>
import type { GridItem } from '@/wd/components/wd-grid/wd-grid.vue'

const gridItems: GridItem[] = [
  { icon: 'home-outlined', text: '首页' },
  { icon: 'user-outlined', text: '用户' },
  { icon: 'setting-outlined', text: '设置' },
  { icon: 'search', text: '搜索' },
  { icon: 'bell-outlined', text: '通知' },
  { icon: 'star-on', text: '收藏' },
  { icon: 'cart-outlined', text: '购物车' },
  { icon: 'more', text: '更多' },
]

const handleItemClick = (item: GridItem, index: number) => {
  console.log('点击了:', item.text, '索引:', index)
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- items 模式通过数组数据驱动渲染,代码更简洁
- 每个 GridItem 对象包含 icon、text 等配置
- clickable 属性开启点击反馈效果
- item-click 事件返回当前项数据和索引

**技术实现:**
- 组件内部通过 `isItemsMode` 计算属性判断使用哪种模式
- items 模式下使用 v-for 循环渲染,子组件模式使用 slot 插槽

参考: src/wd/components/wd-grid/wd-grid.vue:7-74, 211-213

### 自定义列数

通过 `column` 属性设置每行显示的网格项数量,支持任意正整数。

```vue
<template>
  <view class="demo">
    <!-- 3列宫格 -->
    <view class="section">
      <text class="title">3列宫格</text>
      <wd-grid :column="3">
        <wd-grid-item
          v-for="item in 6"
          :key="item"
          icon="star-on"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 5列宫格 -->
    <view class="section">
      <text class="title">5列宫格</text>
      <wd-grid :column="5">
        <wd-grid-item
          v-for="item in 10"
          :key="item"
          icon="heart"
          :text="`选项${item}`"
          icon-size="20px"
        />
      </wd-grid>
    </view>

    <!-- 2列宫格 -->
    <view class="section">
      <text class="title">2列宫格</text>
      <wd-grid :column="2">
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="cart-outlined"
          :text="`选项${item}`"
          icon-size="32px"
        />
      </wd-grid>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 自定义列数无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  .title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}
</style>
```

**使用说明:**
- column 属性控制每行显示的列数,默认为 4
- 列数越多,每个网格项宽度越小,建议调整 icon-size 适配
- column 必须大于 0,否则会在控制台输出错误警告
- 宽度自动计算: `width = 100% / column`

**技术实现:**
- 组件监听 column 变化,自动重新计算子项宽度
- 子组件模式下通过 `updateItemStyle` 方法更新样式
- items 模式下通过 `getItemStyle` 方法计算样式

参考: src/wd/components/wd-grid/wd-grid.vue:166-167, 255-270, 342-363

### 显示边框

通过 `border` 属性控制网格项之间是否显示边框,边框采用 0.5px 细线实现。

```vue
<template>
  <view class="demo">
    <!-- 显示边框 -->
    <view class="section">
      <text class="title">显示边框</text>
      <wd-grid border>
        <wd-grid-item
          v-for="item in 8"
          :key="item"
          icon="home-outlined"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 不显示边框 -->
    <view class="section">
      <text class="title">不显示边框</text>
      <wd-grid :border="false">
        <wd-grid-item
          v-for="item in 8"
          :key="item"
          icon="user-outlined"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 边框配置无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  .title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}
</style>
```

**使用说明:**
- border 默认为 false,不显示边框
- 边框通过伪元素 `::before` 和 `::after` 实现
- 采用 `transform: scale(0.5)` 实现 0.5px 细线效果
- 自动处理首行、右侧、最后一个元素的边框显示/隐藏

**技术实现:**
- 边框样式通过 CSS 类名控制: `is-first`、`is-right`、`is-border`、`is-last`
- 组件监听 border 变化,自动更新子项的边框类名
- 暗黑模式下边框颜色自动切换为 `$-dark-border-color`

参考: src/wd/components/wd-grid/wd-grid.vue:167-168, 276-288, 501-551

### 设置间距

通过 `gutter` 属性设置网格项之间的间距,实现卡片式布局效果。

```vue
<template>
  <view class="demo">
    <!-- 无间距 -->
    <view class="section">
      <text class="title">无间距(默认)</text>
      <wd-grid :column="3">
        <wd-grid-item
          v-for="item in 6"
          :key="item"
          icon="star-on"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 10px 间距 -->
    <view class="section">
      <text class="title">10px 间距</text>
      <wd-grid :column="3" :gutter="10">
        <wd-grid-item
          v-for="item in 6"
          :key="item"
          icon="heart"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 20px 间距 -->
    <view class="section">
      <text class="title">20px 间距</text>
      <wd-grid :column="3" :gutter="20" bg-color="#fff">
        <wd-grid-item
          v-for="item in 6"
          :key="item"
          icon="cart-outlined"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 间距配置无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
  background-color: #f5f5f5;
}

.section {
  margin-bottom: 48rpx;

  .title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}
</style>
```

**使用说明:**
- gutter 默认为 0,不显示间距
- gutter 支持数字类型,默认单位为 px
- 设置间距后,网格容器会自动添加左侧和底部的 padding
- 每个网格项会添加右侧和顶部的 padding,实现均匀间距
- 建议配合 bg-color 使用,设置网格项背景色

**技术实现:**
- 容器样式: `padding-left: gutter; padding-bottom: gutter;`
- 网格项样式: `padding: gutter gutter 0 0; background-color: transparent;`
- 通过透明背景+内边距实现间距效果
- gutter 与 border 同时使用时,边框会自动添加圆角效果(is-round)

参考: src/wd/components/wd-grid/wd-grid.vue:172, 5, 349-353

### 正方形格子

通过 `square` 属性将网格项固定为正方形,保持宽高比为 1:1。

```vue
<template>
  <view class="demo">
    <!-- 非正方形(默认) -->
    <view class="section">
      <text class="title">非正方形(默认)</text>
      <wd-grid :column="4">
        <wd-grid-item
          v-for="item in 8"
          :key="item"
          icon="home-outlined"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 正方形格子 -->
    <view class="section">
      <text class="title">正方形格子</text>
      <wd-grid :column="4" square>
        <wd-grid-item
          v-for="item in 8"
          :key="item"
          icon="star-on"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 正方形格子 + 间距 -->
    <view class="section">
      <text class="title">正方形格子 + 间距</text>
      <wd-grid :column="3" square :gutter="12" bg-color="#fff">
        <wd-grid-item
          v-for="item in 6"
          :key="item"
          icon="heart"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 正方形配置无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  .title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}
</style>
```

**使用说明:**
- square 默认为 false,网格项高度由内容撑开
- square 为 true 时,使用 padding-top 撑开高度,实现正方形效果
- padding-top 的值等于网格项的宽度百分比,保持宽高比 1:1
- 正方形模式下,内容区域绝对定位,铺满整个网格项

**技术实现:**
- 网格项样式: `padding-top: width; padding-bottom: 0; background-color: transparent;`
- 内容区域样式: `position: absolute; top: 0; right: 0; left: 0; height: 100%;`
- square + gutter 组合时,内容区域需要调整 right 和 bottom 偏移

参考: src/wd/components/wd-grid/wd-grid.vue:163-164, 356-360, 570-578

### 点击反馈

通过 `clickable` 属性开启网格项的点击高亮效果,提供更好的交互体验。

```vue
<template>
  <view class="demo">
    <!-- 开启点击反馈 -->
    <view class="section">
      <text class="title">开启点击反馈</text>
      <wd-grid clickable>
        <wd-grid-item
          v-for="item in 8"
          :key="item"
          icon="home-outlined"
          :text="`选项${item}`"
          @itemclick="handleItemClick(item)"
        />
      </wd-grid>
    </view>

    <!-- 自定义 hover 样式 -->
    <view class="section">
      <text class="title">自定义 hover 样式</text>
      <wd-grid clickable hover-class="custom-hover">
        <wd-grid-item
          v-for="item in 8"
          :key="item"
          icon="star-on"
          :text="`选项${item}`"
          @itemclick="handleItemClick(item)"
        />
      </wd-grid>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { showToast } from '@/utils/common'

const handleItemClick = (item: number) => {
  showToast(`点击了选项${item}`)
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  .title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}

:deep(.custom-hover) {
  background-color: #e0f7fa !important;
}
</style>
```

**使用说明:**
- clickable 默认为 false,不开启点击反馈
- 开启后,点击网格项会显示高亮背景色
- 默认 hover 样式为 `wd-grid-item__content--hover`,背景色为 `$-grid-item-hover-bg`
- hover-class 属性可自定义高亮样式类名
- hover-stay-time 固定为 240ms,控制高亮持续时间

**技术实现:**
- 使用 UniApp 的 :hover-class 实现点击反馈
- 未开启 clickable 时,:hover-class 设置为 'none'
- 暗黑模式下自动切换为 `$-grid-item-hover-bg-dark`

参考: src/wd/components/wd-grid/wd-grid.vue:161-162, 174, 19-22

### 页面跳转

配置 `url` 和 `linkType` 实现点击网格项后的页面跳转功能。

```vue
<template>
  <view class="demo">
    <wd-grid clickable>
      <wd-grid-item
        icon="home-outlined"
        text="返回首页"
        url="/pages/index/index"
        link-type="switchTab"
      />
      <wd-grid-item
        icon="user-outlined"
        text="个人中心"
        url="/pages/profile/index"
        link-type="navigateTo"
      />
      <wd-grid-item
        icon="setting-outlined"
        text="系统设置"
        url="/pages/settings/index"
        link-type="navigateTo"
      />
      <wd-grid-item
        icon="bell-outlined"
        text="消息通知"
        url="/pages/notifications/index"
        link-type="navigateTo"
      />
      <wd-grid-item
        icon="cart-outlined"
        text="购物车"
        url="/pages/cart/index"
        link-type="navigateTo"
      />
      <wd-grid-item
        icon="order-outlined"
        text="我的订单"
        url="/pages/orders/index"
        link-type="navigateTo"
      />
      <wd-grid-item
        icon="shop-outlined"
        text="店铺首页"
        url="/pages/shop/index"
        link-type="reLaunch"
      />
      <wd-grid-item
        icon="more"
        text="更多功能"
        url="/pages/more/index"
        link-type="redirectTo"
      />
    </wd-grid>
  </view>
</template>

<script lang="ts" setup>
// 页面跳转无需额外逻辑,组件内部自动处理
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- url 属性配置跳转的页面路径
- linkType 属性指定跳转方式,支持4种类型:
  - `navigateTo`: 保留当前页面,跳转到应用内某个页面(默认)
  - `redirectTo`: 关闭当前页面,跳转到应用内某个页面
  - `reLaunch`: 关闭所有页面,跳转到应用内某个页面
  - `switchTab`: 跳转到 tabBar 页面,并关闭其他非 tabBar 页面
- 必须配合 clickable 属性使用,否则点击无效
- 跳转前会先触发 itemclick 事件,可在事件中添加自定义逻辑

**技术实现:**
- 点击处理函数 `handleClick` 内部调用 UniApp 的页面跳转 API
- 支持 items 模式和子组件模式两种跳转方式
- 无效的 linkType 会在控制台输出错误警告

参考: src/wd/components/wd-grid-item/wd-grid-item.vue:109-112, 292-321

### 徽标显示

通过 `value`、`is-dot`、`type`、`max` 等属性在网格项图标上显示徽标。

```vue
<template>
  <view class="demo">
    <wd-grid clickable>
      <!-- 数字徽标 -->
      <wd-grid-item
        icon="bell-outlined"
        text="消息"
        :value="10"
      />

      <!-- 小红点 -->
      <wd-grid-item
        icon="cart-outlined"
        text="购物车"
        is-dot
      />

      <!-- 最大值限制 -->
      <wd-grid-item
        icon="mail-outlined"
        text="邮件"
        :value="99"
        :max="99"
      />

      <!-- 带类型的徽标 -->
      <wd-grid-item
        icon="order-outlined"
        text="订单"
        :value="5"
        type="danger"
      />

      <wd-grid-item
        icon="star-on"
        text="收藏"
        :value="20"
        type="warning"
      />

      <wd-grid-item
        icon="coupon-outlined"
        text="优惠券"
        :value="3"
        type="success"
      />

      <!-- 自定义徽标属性 -->
      <wd-grid-item
        icon="gift-outlined"
        text="礼物"
        :badge-props="{
          value: 'NEW',
          bgColor: '#ff6b6b',
        }"
      />

      <wd-grid-item
        icon="more"
        text="更多"
      />
    </wd-grid>
  </view>
</template>

<script lang="ts" setup>
// 徽标配置无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**
- value 属性设置徽标显示的数字或文本
- is-dot 属性显示小红点,优先级高于 value
- type 属性设置徽标类型: primary/success/warning/danger/info
- max 属性设置最大数字,超过则显示 `{max}+`
- badge-props 属性透传给 Badge 组件,支持更多自定义配置

**技术实现:**
- 组件内部集成了 wd-badge 组件
- 徽标包裹在图标外层,通过绝对定位显示在右上角
- items 模式使用 `getBadgeProps` 方法合并徽标属性
- 子组件模式使用 `customBadgeProps` 计算属性合并徽标属性
- 使用 `deepAssign` 和 `omitBy` 工具函数处理属性合并

参考: src/wd/components/wd-grid-item/wd-grid-item.vue:121-130, 195-209

## 高级用法

### items 模式完整配置

items 模式支持更丰富的配置选项,包括自定义样式、徽标、跳转等。

```vue
<template>
  <view class="demo">
    <wd-grid
      :items="gridItems"
      :column="3"
      clickable
      border
      bg-color="#ffffff"
      @item-click="handleItemClick"
    />
  </view>
</template>

<script lang="ts" setup>
import type { GridItem } from '@/wd/components/wd-grid/wd-grid.vue'

const gridItems: GridItem[] = [
  {
    icon: 'home-outlined',
    iconSize: '28px',
    iconColor: '#4dabf7',
    text: '首页',
    customText: 'color: #4dabf7; font-weight: bold;',
    url: '/pages/index/index',
    linkType: 'switchTab',
  },
  {
    icon: 'bell-outlined',
    iconSize: '28px',
    iconColor: '#ff6b6b',
    text: '消息',
    value: 99,
    max: 99,
    type: 'danger',
    url: '/pages/notifications/index',
    linkType: 'navigateTo',
  },
  {
    icon: 'cart-outlined',
    iconSize: '28px',
    iconColor: '#51cf66',
    text: '购物车',
    isDot: true,
    url: '/pages/cart/index',
    linkType: 'navigateTo',
  },
  {
    icon: 'user-outlined',
    iconSize: '28px',
    iconColor: '#ffa94d',
    text: '个人中心',
    url: '/pages/profile/index',
    linkType: 'navigateTo',
  },
  {
    icon: 'star-on',
    iconSize: '28px',
    iconColor: '#ffd43b',
    text: '收藏',
    value: 20,
    type: 'warning',
    customIcon: 'custom-star-icon',
  },
  {
    icon: 'setting-outlined',
    iconSize: '28px',
    iconColor: '#868e96',
    text: '设置',
    customText: 'font-size: 24rpx;',
  },
]

const handleItemClick = (item: GridItem, index: number) => {
  console.log('点击了:', item.text, '索引:', index)
  // 自定义点击处理逻辑
  // 如果配置了 url,组件会自动处理页面跳转
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

:deep(.custom-star-icon) {
  animation: star-rotate 2s linear infinite;
}

@keyframes star-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
```

**使用说明:**
- items 数组中的每个对象都是 GridItem 类型
- 支持的配置项包括:
  - `icon`: 图标名称
  - `iconSize`: 图标大小
  - `iconColor`: 图标颜色
  - `customIcon`: 图标自定义样式类名
  - `text`: 文字内容
  - `customText`: 文字自定义样式
  - `url`: 跳转链接
  - `linkType`: 跳转方式
  - `value`: 徽标数字
  - `isDot`: 显示小红点
  - `type`: 徽标类型
  - `max`: 徽标最大值
  - `badgeProps`: 徽标自定义属性
- 可在对象中添加自定义字段,点击时会完整传递

**技术实现:**
- GridItem 接口使用索引签名 `[key: string]: any` 支持任意自定义字段
- 组件内部使用 v-for 循环渲染 items 数组
- 通过 `getItemClass`、`getItemStyle`、`getItemContentClass`、`getItemContentStyle` 方法计算样式

参考: src/wd/components/wd-grid/wd-grid.vue:106-148, 159-160

### 插槽自定义内容

使用默认插槽完全自定义网格项内容,适合复杂布局场景。

```vue
<template>
  <view class="demo">
    <wd-grid :column="2" clickable square :gutter="12" bg-color="#fff">
      <wd-grid-item
        v-for="item in products"
        :key="item.id"
        use-slot
        @itemclick="handleProductClick(item)"
      >
        <view class="product-card">
          <image :src="item.image" class="product-image" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <view class="product-price">
              <text class="price">¥{{ item.price }}</text>
              <text class="original-price">¥{{ item.originalPrice }}</text>
            </view>
            <view class="product-tags">
              <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
            </view>
          </view>
        </view>
      </wd-grid-item>
    </wd-grid>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  tags: string[]
}

const products = ref<Product[]>([
  {
    id: 1,
    name: '无线蓝牙耳机',
    price: 299,
    originalPrice: 499,
    image: 'https://via.placeholder.com/300',
    tags: ['热销', '包邮'],
  },
  {
    id: 2,
    name: '智能手环Pro',
    price: 199,
    originalPrice: 299,
    image: 'https://via.placeholder.com/300',
    tags: ['新品', '限时'],
  },
  {
    id: 3,
    name: '充电宝20000mAh',
    price: 89,
    originalPrice: 159,
    image: 'https://via.placeholder.com/300',
    tags: ['爆款'],
  },
  {
    id: 4,
    name: '无线充电器',
    price: 79,
    originalPrice: 129,
    image: 'https://via.placeholder.com/300',
    tags: ['包邮'],
  },
])

const handleProductClick = (item: Product) => {
  console.log('点击了商品:', item.name)
  // 跳转到商品详情页
  uni.navigateTo({
    url: `/pages/product/detail?id=${item.id}`,
  })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
  background-color: #f5f5f5;
}

.product-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 300rpx;
  background: #f0f0f0;
}

.product-info {
  padding: 16rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 8rpx;

  .price {
    font-size: 32rpx;
    color: #ff6b6b;
    font-weight: bold;
    margin-right: 8rpx;
  }

  .original-price {
    font-size: 24rpx;
    color: #999;
    text-decoration: line-through;
  }
}

.product-tags {
  display: flex;
  gap: 8rpx;

  .tag {
    padding: 4rpx 8rpx;
    font-size: 20rpx;
    color: #ff6b6b;
    background: #ffe3e3;
    border-radius: 4rpx;
  }
}
</style>
```

**使用说明:**
- 设置 use-slot 属性开启自定义内容插槽
- 默认插槽可放置任意内容,不受组件默认布局限制
- 适合实现商品卡片、信息卡片等复杂布局
- 建议配合 square 属性统一网格项高度

参考: src/wd/components/wd-grid-item/wd-grid-item.vue:19, 114-115

### 图标和文字插槽

使用具名插槽分别自定义图标和文字部分,保持默认布局结构。

```vue
<template>
  <view class="demo">
    <wd-grid :column="4" clickable>
      <!-- 自定义图标插槽 -->
      <wd-grid-item use-icon-slot text="自定义图标">
        <template #icon>
          <view class="custom-icon">
            <image
              src="https://via.placeholder.com/64"
              class="icon-image"
              mode="aspectFill"
            />
          </view>
        </template>
      </wd-grid-item>

      <!-- 自定义文字插槽 -->
      <wd-grid-item icon="star-on" use-text-slot>
        <template #text>
          <view class="custom-text">
            <text class="text-main">收藏</text>
            <text class="text-sub">128个</text>
          </view>
        </template>
      </wd-grid-item>

      <!-- 同时自定义图标和文字 -->
      <wd-grid-item use-icon-slot use-text-slot>
        <template #icon>
          <view class="gradient-icon">
            <wd-icon name="heart" size="28px" color="#fff" />
          </view>
        </template>
        <template #text>
          <view class="custom-text">
            <text class="text-main">点赞</text>
            <text class="text-sub">999+</text>
          </view>
        </template>
      </wd-grid-item>

      <!-- 普通网格项 -->
      <wd-grid-item icon="more" text="更多" />
    </wd-grid>
  </view>
</template>

<script lang="ts" setup>
// 插槽自定义无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.custom-icon {
  width: 64rpx;
  height: 64rpx;

  .icon-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.gradient-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-text {
  margin-top: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .text-main {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }

  .text-sub {
    font-size: 24rpx;
    color: #999;
    margin-top: 4rpx;
  }
}
</style>
```

**使用说明:**
- use-icon-slot 属性开启图标插槽,使用 `#icon` 具名插槽自定义图标
- use-text-slot 属性开启文字插槽,使用 `#text` 具名插槽自定义文字
- 可以同时开启两个插槽,实现完全自定义的布局
- 插槽模式仍保持默认的上下布局结构

参考: src/wd/components/wd-grid-item/wd-grid-item.vue:26-28, 38-41, 116-119

### items 模式使用插槽

items 模式同样支持插槽自定义,通过配置项控制是否使用插槽。

```vue
<template>
  <view class="demo">
    <wd-grid
      :items="gridItems"
      :column="3"
      clickable
      @item-click="handleItemClick"
    >
      <!-- 自定义内容插槽 item-0 -->
      <template #item-0="{ item, index }">
        <view class="custom-card">
          <view class="card-badge">热门</view>
          <wd-icon :name="item.icon" size="32px" color="#ff6b6b" />
          <text class="card-title">{{ item.text }}</text>
        </view>
      </template>

      <!-- 自定义图标插槽 icon-1 -->
      <template #icon-1="{ item, index }">
        <view class="rotating-icon">
          <wd-icon :name="item.icon" size="32px" color="#4dabf7" />
        </view>
      </template>

      <!-- 自定义文字插槽 text-2 -->
      <template #text-2="{ item, index }">
        <view class="multi-line-text">
          <text class="text-main">{{ item.text }}</text>
          <text class="text-sub">{{ item.subText }}</text>
        </view>
      </template>
    </wd-grid>
  </view>
</template>

<script lang="ts" setup>
import type { GridItem } from '@/wd/components/wd-grid/wd-grid.vue'

const gridItems: GridItem[] = [
  {
    icon: 'fire',
    text: '热门推荐',
    useSlot: true,
    slotName: 'item-0', // 可省略,默认为 item-0
  },
  {
    icon: 'setting-outlined',
    text: '系统设置',
    useIconSlot: true,
    iconSlotName: 'icon-1', // 可省略,默认为 icon-1
  },
  {
    icon: 'bell-outlined',
    text: '消息通知',
    subText: '5条未读',
    useTextSlot: true,
    textSlotName: 'text-2', // 可省略,默认为 text-2
  },
  { icon: 'star-on', text: '我的收藏' },
  { icon: 'cart-outlined', text: '购物车' },
  { icon: 'user-outlined', text: '个人中心' },
]

const handleItemClick = (item: GridItem, index: number) => {
  console.log('点击了:', item.text, '索引:', index)
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.custom-card {
  position: relative;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .card-badge {
    position: absolute;
    top: 0;
    right: 0;
    padding: 4rpx 8rpx;
    font-size: 20rpx;
    color: #fff;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
    border-radius: 0 0 0 8rpx;
  }

  .card-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

.rotating-icon {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.multi-line-text {
  margin-top: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .text-main {
    font-size: 28rpx;
    color: #333;
  }

  .text-sub {
    font-size: 24rpx;
    color: #999;
    margin-top: 4rpx;
  }
}
</style>
```

**使用说明:**
- useSlot: 开启自定义内容插槽,默认插槽名为 `item-{index}`
- slotName: 自定义内容插槽名称
- useIconSlot: 开启自定义图标插槽,默认插槽名为 `icon-{index}`
- iconSlotName: 自定义图标插槽名称
- useTextSlot: 开启自定义文字插槽,默认插槽名为 `text-{index}`
- textSlotName: 自定义文字插槽名称
- 插槽提供 item 和 index 作用域变量,可在插槽中使用

**技术实现:**
- 插槽使用 v-if 条件渲染,根据配置项决定是否使用插槽
- 作用域插槽通过 :item 和 :index 传递数据
- 插槽名称支持自定义,默认使用索引生成

参考: src/wd/components/wd-grid/wd-grid.vue:24-66

### 背景颜色定制

通过 `bg-color` 属性设置网格项的背景颜色,实现主题定制。

```vue
<template>
  <view class="demo">
    <!-- 默认背景 -->
    <view class="section">
      <text class="title">默认背景</text>
      <wd-grid :column="4" clickable>
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="home-outlined"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 自定义背景色 -->
    <view class="section">
      <text class="title">自定义背景色</text>
      <wd-grid :column="4" clickable bg-color="#e3f2fd" :gutter="10">
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="star-on"
          :text="`选项${item}`"
          icon-color="#1976d2"
        />
      </wd-grid>
    </view>

    <!-- 渐变背景 -->
    <view class="section">
      <text class="title">渐变背景</text>
      <wd-grid
        :column="4"
        clickable
        bg-color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        :gutter="12"
        square
      >
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="heart"
          :text="`选项${item}`"
          icon-color="#fff"
          custom-text="color: #fff; font-weight: bold;"
        />
      </wd-grid>
    </view>

    <!-- 透明背景 -->
    <view class="section gradient-bg">
      <text class="title">透明背景</text>
      <wd-grid :column="4" clickable bg-color="transparent" :gutter="10">
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="cart-outlined"
          :text="`选项${item}`"
          icon-color="#fff"
          custom-text="color: #fff;"
        />
      </wd-grid>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 背景色定制无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  .title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }

  &.gradient-bg {
    padding: 32rpx;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    border-radius: 16rpx;

    .title {
      color: #fff;
    }
  }
}
</style>
```

**使用说明:**
- bg-color 属性支持任何有效的 CSS 颜色值
- 支持十六进制、RGB、RGBA、HSL 等颜色格式
- 支持 CSS 渐变语法(linear-gradient、radial-gradient)
- 支持 transparent 透明背景
- 建议配合 gutter 使用,实现卡片式布局效果

**技术实现:**
- bg-color 直接设置到网格项内容区域的 background-color 样式
- 通过内联样式应用,不受主题变量影响
- 子组件模式通过 `gutterContentStyle` 计算属性应用
- items 模式通过 `getItemContentStyle` 方法应用

参考: src/wd/components/wd-grid/wd-grid.vue:169-170, 380-388

### 自定义 hover 样式

通过 `hover-class` 属性自定义网格项的点击高亮样式。

```vue
<template>
  <view class="demo">
    <!-- 默认 hover 样式 -->
    <view class="section">
      <text class="title">默认 hover 样式</text>
      <wd-grid clickable>
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="home-outlined"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 自定义 hover 样式 1 -->
    <view class="section">
      <text class="title">淡蓝色 hover</text>
      <wd-grid clickable hover-class="hover-blue">
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="star-on"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 自定义 hover 样式 2 -->
    <view class="section">
      <text class="title">缩放效果 hover</text>
      <wd-grid clickable hover-class="hover-scale" :gutter="12" bg-color="#fff">
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="heart"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>

    <!-- 自定义 hover 样式 3 -->
    <view class="section">
      <text class="title">渐变背景 hover</text>
      <wd-grid clickable hover-class="hover-gradient" border>
        <wd-grid-item
          v-for="item in 4"
          :key="item"
          icon="cart-outlined"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 自定义 hover 样式无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  .title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}

// 自定义 hover 样式
:deep(.hover-blue) {
  background-color: #e3f2fd !important;
}

:deep(.hover-scale) {
  transform: scale(0.95) !important;
  background-color: #f5f5f5 !important;
}

:deep(.hover-gradient) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;

  .wd-grid-item__text {
    color: #fff !important;
  }

  .wd-icon {
    color: #fff !important;
  }
}
</style>
```

**使用说明:**
- hover-class 属性指定自定义的 hover 样式类名
- 默认 hover 样式为 `wd-grid-item__content--hover`
- hover-stay-time 固定为 240ms,控制高亮持续时间
- 必须配合 clickable 属性使用
- 自定义样式需要使用 `:deep()` 深度选择器
- 自定义样式建议添加 `!important` 提高优先级

参考: src/wd/components/wd-grid/wd-grid.vue:174, 19-22

### 响应式列数

根据不同屏幕尺寸动态调整列数,实现响应式布局。

```vue
<template>
  <view class="demo">
    <wd-grid :column="columnCount" clickable border>
      <wd-grid-item
        v-for="item in 12"
        :key="item"
        icon="home-outlined"
        :text="`选项${item}`"
      />
    </wd-grid>

    <view class="info">
      <text>当前屏幕宽度: {{ screenWidth }}px</text>
      <text>当前列数: {{ columnCount }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const screenWidth = ref(0)
const columnCount = ref(4)

// 根据屏幕宽度计算列数
const calculateColumn = () => {
  const width = screenWidth.value

  if (width < 375) {
    columnCount.value = 3 // 小屏手机 3列
  } else if (width < 768) {
    columnCount.value = 4 // 普通手机 4列
  } else if (width < 1024) {
    columnCount.value = 5 // 平板竖屏 5列
  } else {
    columnCount.value = 6 // 平板横屏/桌面 6列
  }
}

onMounted(() => {
  // 获取屏幕信息
  const systemInfo = uni.getSystemInfoSync()
  screenWidth.value = systemInfo.screenWidth
  calculateColumn()

  // 监听窗口尺寸变化
  uni.onWindowResize((res) => {
    screenWidth.value = res.size.windowWidth
    calculateColumn()
  })
})
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.info {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  text {
    font-size: 28rpx;
    color: #666;
  }
}
</style>
```

**使用说明:**
- 使用 uni.getSystemInfoSync() 获取屏幕宽度
- 使用 uni.onWindowResize() 监听窗口尺寸变化
- 根据屏幕宽度设置不同的 column 值
- 建议的列数配置:
  - < 375px: 3列(小屏手机)
  - 375px - 768px: 4列(普通手机)
  - 768px - 1024px: 5列(平板竖屏)
  - ≥ 1024px: 6列(平板横屏/桌面)

**技术实现:**
- 组件内部监听 column 属性变化,自动重新计算布局
- 监听器使用 watch 实现,支持 deep 和 immediate 选项
- 列数变化时会触发 `initChildrenGridItems` 重新初始化

参考: src/wd/components/wd-grid/wd-grid.vue:255-270

## API

### Grid Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | 网格项数据数组(items 模式) | `GridItem[]` | `[]` |
| column | 列数 | `number` | `4` |
| border | 是否显示边框 | `boolean` | `false` |
| gutter | 格子之间的间距,默认单位为 px | `number` | `0` |
| square | 是否将格子固定为正方形 | `boolean` | `false` |
| clickable | 是否开启格子点击反馈 | `boolean` | `false` |
| bg-color | 背景颜色 | `string` | `''` |
| hover-class | 自定义内容区域 hover-class | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-grid/wd-grid.vue:153-175

### GridItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| icon | 图标名称,可选值见 Icon 组件 | `IconName` | `''` |
| icon-size | 图标大小 | `string` | `'26px'` |
| icon-color | 图标颜色 | `string` | `''` |
| custom-icon | 图标自定义样式类 | `string` | `''` |
| text | 文字 | `string` | `''` |
| custom-text | 文字自定义样式 | `string` | `''` |
| url | 点击后跳转的链接地址 | `string` | `''` |
| link-type | 页面跳转方式 | `LinkType` | `'navigateTo'` |
| use-slot | 是否开启内容插槽 | `boolean` | `false` |
| use-icon-slot | 是否开启图标插槽 | `boolean` | `false` |
| use-text-slot | 是否开启文字插槽 | `boolean` | `false` |
| is-dot | 是否显示图标右上角小红点 | `boolean` | `false` |
| type | 图标右上角 badge 类型 | `BadgeType` | `''` |
| value | 图标右上角 badge 显示值 | `string \| number` | `''` |
| max | 图标右上角 badge 最大值 | `number` | `''` |
| badge-props | 徽标属性,透传给 Badge 组件 | `Partial<BadgeProps>` | `{}` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-grid-item/wd-grid-item.vue:90-131

### Grid Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| item-click | 点击网格项时触发(仅 items 模式) | `item: GridItem, index: number` |

参考: src/wd/components/wd-grid/wd-grid.vue:180-183

### GridItem Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| itemclick | 点击网格项时触发(子组件模式) | `-` |

参考: src/wd/components/wd-grid-item/wd-grid-item.vue:136-139

### Grid Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| - | 默认插槽,放置 wd-grid-item 子组件(子组件模式) | `-` |

参考: src/wd/components/wd-grid/wd-grid.vue:72

### GridItem Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| - | 默认插槽,自定义网格项内容 | `-` |
| icon | 自定义图标内容 | `-` |
| text | 自定义文字内容 | `-` |

参考: src/wd/components/wd-grid-item/wd-grid-item.vue:19, 27, 38

### GridItem 实例方法

通过 ref 获取 GridItem 实例,调用实例方法。

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| setItemClass | 设置网格项样式类名 | `classes: string` | `-` |
| init | 初始化网格项 | `-` | `-` |

参考: src/wd/components/wd-grid-item/wd-grid-item.vue:144-151, 327-329, 252-279

### 类型定义

```typescript
/**
 * 徽标类型
 */
type BadgeType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * 链接跳转类型
 */
type LinkType = 'navigateTo' | 'switchTab' | 'reLaunch' | 'redirectTo'

/**
 * 网格项配置接口
 */
export interface GridItem {
  /** 图标名称 */
  icon?: string
  /** 图标大小 */
  iconSize?: string
  /** 图标颜色 */
  iconColor?: string
  /** 图标自定义样式 */
  customIcon?: string
  /** 文字内容 */
  text?: string
  /** 文字自定义样式 */
  customText?: string
  /** 点击跳转链接 */
  url?: string
  /** 链接跳转方式 */
  linkType?: LinkType
  /** 是否使用自定义内容插槽 */
  useSlot?: boolean
  /** 自定义内容插槽名称,默认为 item-{index} */
  slotName?: string
  /** 是否使用图标插槽 */
  useIconSlot?: boolean
  /** 自定义图标插槽名称,默认为 icon-{index} */
  iconSlotName?: string
  /** 是否使用文字插槽 */
  useTextSlot?: boolean
  /** 自定义文字插槽名称,默认为 text-{index} */
  textSlotName?: string
  /** 是否显示小红点 */
  isDot?: boolean
  /** 徽标类型 */
  type?: BadgeType
  /** 徽标显示值 */
  value?: string | number
  /** 徽标最大值 */
  max?: number
  /** 徽标自定义属性 */
  badgeProps?: Record<string, any>

  /** 自定义数据,点击时会传递 */
  [key: string]: any
}

/**
 * Badge 组件属性接口
 */
interface BadgeProps {
  modelValue?: string | number
  max?: number
  isDot?: boolean
  type?: BadgeType

  [key: string]: any
}

/**
 * 网格组件属性接口
 */
interface WdGridProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 网格项数据数组 */
  items?: GridItem[]
  /** 是否开启格子点击反馈 */
  clickable?: boolean
  /** 是否将格子固定为正方形 */
  square?: boolean
  /** 列数 */
  column?: number
  /** 是否显示边框 */
  border?: boolean
  /** 背景颜色 */
  bgColor?: string
  /** 格子之间的间距,默认单位为px */
  gutter?: number
  /** 自定义内容区域hover-class */
  hoverClass?: string
}

/**
 * 网格组件事件接口
 */
interface WdGridEmits {
  /** 点击网格项时触发 */
  'item-click': [item: GridItem, index: number]
}

/**
 * 网格项组件属性接口
 */
interface WdGridItemProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** GridItem 下方文字样式 */
  customText?: string
  /** GridItem 上方 icon 样式 */
  customIcon?: string

  /** 图标名称,可选值见 wd-icon 组件 */
  icon?: IconName
  /** 图标大小 */
  iconSize?: string
  /** 图标颜色 */
  iconColor?: string
  /** 文字 */
  text?: string
  /** 点击后跳转的链接地址 */
  url?: string
  /** 页面跳转方式,可选值:navigateTo / switchTab / reLaunch / redirectTo */
  linkType?: LinkType

  /** 是否开启 GridItem 内容插槽 */
  useSlot?: boolean
  /** 是否开启 GridItem icon 插槽 */
  useIconSlot?: boolean
  /** 是否开启 GridItem text 内容插槽 */
  useTextSlot?: boolean

  /** 是否显示图标右上角小红点 */
  isDot?: boolean
  /** 图标右上角显示的 badge 类型 */
  type?: BadgeType
  /** 图标右上角 badge 显示值 */
  value?: string | number
  /** 图标右上角 badge 最大值,超过最大值会显示 '{max}+' */
  max?: number
  /** 徽标属性,透传给 Badge 组件 */
  badgeProps?: Partial<BadgeProps>
}

/**
 * 网格项组件事件接口
 */
interface WdGridItemEmits {
  /** 点击网格项时触发 */
  itemclick: []
}

/**
 * 网格项组件暴露的方法和属性接口
 */
export interface WdGridItemExpose {
  /** 设置网格项样式类名 */
  setItemClass: (classes: string) => void
  /** 当前网格项的样式类名 */
  itemClass: Ref<string>
  /** 初始化网格项 */
  init: () => void
}
```

参考: src/wd/components/wd-grid/wd-grid.vue:94-184, src/wd/components/wd-grid-item/wd-grid-item.vue:68-151

## 主题定制

Grid 组件支持通过 CSS 变量进行主题定制。

### CSS 变量

```scss
:root {
  // 网格项字体大小
  --wot-grid-item-fs: 26rpx;

  // 网格项背景色
  --wot-grid-item-bg: #ffffff;

  // 网格项边框颜色
  --wot-grid-item-border-color: #ebedf0;

  // 网格项内边距
  --wot-grid-item-padding: 32rpx 16rpx;

  // 网格项 hover 背景色
  --wot-grid-item-hover-bg: rgba(0, 0, 0, 0.05);

  // 暗黑模式 - 网格项背景色
  --wot-grid-item-bg-dark: #1a1a1a;

  // 暗黑模式 - 边框颜色
  --wot-dark-border-color: #333333;

  // 暗黑模式 - 网格项 hover 背景色
  --wot-grid-item-hover-bg-dark: rgba(255, 255, 255, 0.1);
}
```

### 自定义主题示例

```vue
<template>
  <view class="demo">
    <!-- 自定义主题 -->
    <view class="custom-theme">
      <wd-grid :column="4" clickable border>
        <wd-grid-item
          v-for="item in 8"
          :key="item"
          icon="home-outlined"
          :text="`选项${item}`"
        />
      </wd-grid>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 主题定制无需额外逻辑
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.custom-theme {
  // 自定义主题变量
  --wot-grid-item-bg: #f0f9ff;
  --wot-grid-item-border-color: #bae6fd;
  --wot-grid-item-padding: 40rpx 20rpx;
  --wot-grid-item-fs: 28rpx;
  --wot-grid-item-hover-bg: rgba(14, 165, 233, 0.1);
}
</style>
```

参考: src/wd/components/wd-grid/wd-grid.vue:446-610

## 最佳实践

### 1. 选择合适的使用模式

items 模式适合数据驱动的场景,子组件模式适合需要复杂自定义的场景。

```vue
<!-- ✅ 推荐: 数据驱动场景使用 items 模式 -->
<template>
  <wd-grid :items="menuItems" clickable @item-click="handleItemClick" />
</template>

<script lang="ts" setup>
const menuItems = ref([
  { icon: 'home-outlined', text: '首页', url: '/pages/index/index' },
  { icon: 'user-outlined', text: '个人中心', url: '/pages/profile/index' },
  // ...更多菜单项
])
</script>

<!-- ✅ 推荐: 需要复杂自定义时使用子组件模式 -->
<template>
  <wd-grid :column="3" clickable>
    <wd-grid-item use-slot v-for="product in products" :key="product.id">
      <ProductCard :product="product" />
    </wd-grid-item>
  </wd-grid>
</template>

<!-- ❌ 不推荐: 简单场景使用子组件模式,代码冗余 -->
<template>
  <wd-grid>
    <wd-grid-item icon="home-outlined" text="首页" />
    <wd-grid-item icon="user-outlined" text="个人中心" />
    <!-- 重复大量相似代码 -->
  </wd-grid>
</template>
```

### 2. 合理设置列数

根据内容类型和屏幕尺寸选择合适的列数。

```vue
<!-- ✅ 推荐: 图标+文字导航使用 4-5 列 -->
<wd-grid :column="4">
  <wd-grid-item icon="home-outlined" text="首页" />
  <!-- ... -->
</wd-grid>

<!-- ✅ 推荐: 纯图标导航可使用 5-6 列 -->
<wd-grid :column="5">
  <wd-grid-item icon="home-outlined" />
  <!-- ... -->
</wd-grid>

<!-- ✅ 推荐: 复杂内容卡片使用 2-3 列 -->
<wd-grid :column="2" square :gutter="12">
  <wd-grid-item use-slot>
    <ComplexCard />
  </wd-grid-item>
  <!-- ... -->
</wd-grid>

<!-- ❌ 不推荐: 列数过多导致内容拥挤 -->
<wd-grid :column="8">
  <wd-grid-item icon="home-outlined" text="首页" icon-size="16px" />
  <!-- 图标和文字太小,难以点击 -->
</wd-grid>

<!-- ❌ 不推荐: 列数过少浪费空间 -->
<wd-grid :column="2">
  <wd-grid-item icon="home-outlined" text="首页" />
  <!-- 空间利用率低 -->
</wd-grid>
```

### 3. 正确使用边框和间距

边框和间距不能同时有效配合,需要选择其一。

```vue
<!-- ✅ 推荐: 使用边框实现紧密布局 -->
<wd-grid border clickable>
  <wd-grid-item icon="home-outlined" text="首页" />
  <!-- ... -->
</wd-grid>

<!-- ✅ 推荐: 使用间距实现卡片式布局 -->
<wd-grid :gutter="12" clickable bg-color="#fff">
  <wd-grid-item icon="home-outlined" text="首页" />
  <!-- ... -->
</wd-grid>

<!-- ⚠️ 注意: 边框和间距同时使用时,边框会添加圆角 -->
<wd-grid border :gutter="12" clickable bg-color="#fff">
  <wd-grid-item icon="home-outlined" text="首页" />
  <!-- 边框会变成圆角边框 -->
</wd-grid>

<!-- ❌ 不推荐: 间距太大,影响布局美观 -->
<wd-grid :gutter="40" clickable>
  <wd-grid-item icon="home-outlined" text="首页" />
  <!-- 间距过大,视觉分散 -->
</wd-grid>
```

### 4. 徽标使用规范

徽标应该用于提示重要信息,不宜滥用。

```vue
<!-- ✅ 推荐: 在需要提示的项目上使用徽标 -->
<template>
  <wd-grid clickable>
    <wd-grid-item icon="bell-outlined" text="消息" :value="unreadCount" />
    <wd-grid-item icon="cart-outlined" text="购物车" :is-dot="hasNewItem" />
    <wd-grid-item icon="home-outlined" text="首页" />
    <wd-grid-item icon="user-outlined" text="我的" />
  </wd-grid>
</template>

<!-- ❌ 不推荐: 在所有项目上都使用徽标 -->
<template>
  <wd-grid clickable>
    <wd-grid-item icon="home-outlined" text="首页" :value="1" />
    <wd-grid-item icon="search" text="搜索" :value="2" />
    <wd-grid-item icon="cart-outlined" text="购物车" :value="3" />
    <wd-grid-item icon="user-outlined" text="我的" :value="4" />
    <!-- 徽标失去了提示意义 -->
  </wd-grid>
</template>

<!-- ✅ 推荐: 数字徽标超过最大值显示 + 号 -->
<wd-grid-item icon="mail-outlined" text="邮件" :value="999" :max="99" />
<!-- 显示 99+ -->

<!-- ✅ 推荐: 使用不同类型区分徽标重要性 -->
<wd-grid-item icon="bell-outlined" text="消息" :value="5" type="danger" />
<wd-grid-item icon="order-outlined" text="订单" :value="2" type="warning" />
```

### 5. 性能优化

大量网格项时注意性能优化。

```vue
<!-- ✅ 推荐: 使用 items 模式提升渲染性能 -->
<template>
  <wd-grid :items="menuItems" clickable @item-click="handleClick" />
</template>

<script lang="ts" setup>
// items 模式减少了组件实例数量,性能更好
const menuItems = computed(() => {
  return menuList.value.map(item => ({
    icon: item.icon,
    text: item.text,
    url: item.url,
  }))
})
</script>

<!-- ✅ 推荐: 使用 v-show 而不是 v-if 切换显示 -->
<template>
  <view>
    <wd-grid v-show="activeTab === 1" :items="tab1Items" />
    <wd-grid v-show="activeTab === 2" :items="tab2Items" />
  </view>
</template>

<!-- ❌ 不推荐: 子组件模式 + 大量网格项 -->
<template>
  <wd-grid>
    <wd-grid-item
      v-for="item in 100"
      :key="item"
      :icon="items[item].icon"
      :text="items[item].text"
    />
    <!-- 创建100个组件实例,性能较差 -->
  </wd-grid>
</template>

<!-- ❌ 不推荐: 使用 v-if 频繁切换 -->
<template>
  <wd-grid v-if="show" :items="items" />
  <!-- 每次切换都会重新创建和销毁组件 -->
</template>
```

## 常见问题

### 1. column 属性不生效

**问题原因:**
- column 属性设置的值小于等于 0
- 在子组件模式下,子组件数量少于 column 值导致看不出效果
- 拼写错误或类型错误

**解决方案:**

```vue
<!-- ✅ 正确: column 必须大于 0 -->
<template>
  <wd-grid :column="4">
    <wd-grid-item
      v-for="item in 8"
      :key="item"
      icon="home-outlined"
      :text="`选项${item}`"
    />
  </wd-grid>
</template>

<!-- ❌ 错误: column 设置为 0 或负数 -->
<template>
  <wd-grid :column="0">
    <!-- 控制台会输出错误警告 -->
  </wd-grid>
</template>

<!-- ❌ 错误: column 类型错误 -->
<template>
  <wd-grid column="4">
    <!-- 应该使用 :column 而不是 column -->
  </wd-grid>
</template>
```

参考: src/wd/components/wd-grid/wd-grid.vue:255-270

### 2. 点击事件不触发

**问题原因:**
- 未设置 clickable 属性
- 在 items 模式下监听了错误的事件名
- 在子组件模式下监听了 Grid 的事件而不是 GridItem 的事件

**解决方案:**

```vue
<!-- ✅ 正确: items 模式监听 item-click 事件 -->
<template>
  <wd-grid :items="items" clickable @item-click="handleItemClick" />
</template>

<script lang="ts" setup>
const handleItemClick = (item: GridItem, index: number) => {
  console.log('点击了:', item.text)
}
</script>

<!-- ✅ 正确: 子组件模式监听 itemclick 事件 -->
<template>
  <wd-grid clickable>
    <wd-grid-item
      icon="home-outlined"
      text="首页"
      @itemclick="handleClick"
    />
  </wd-grid>
</template>

<script lang="ts" setup>
const handleClick = () => {
  console.log('点击了首页')
}
</script>

<!-- ❌ 错误: 未设置 clickable 属性 -->
<template>
  <wd-grid :items="items" @item-click="handleItemClick" />
  <!-- clickable 默认为 false,点击不会触发事件 -->
</template>

<!-- ❌ 错误: 事件名错误 -->
<template>
  <wd-grid :items="items" clickable @click="handleItemClick" />
  <!-- items 模式应该监听 item-click 而不是 click -->
</template>
```

参考: src/wd/components/wd-grid/wd-grid.vue:414-442, src/wd/components/wd-grid-item/wd-grid-item.vue:292-321

### 3. 边框显示不正确

**问题原因:**
- 边框显示逻辑复杂,涉及首行、右侧、最后一个元素的特殊处理
- border 和 gutter 同时使用时,边框样式会发生变化
- 暗黑模式下边框颜色未正确适配

**解决方案:**

```vue
<!-- ✅ 正确: 单独使用 border -->
<template>
  <wd-grid border>
    <wd-grid-item
      v-for="item in 8"
      :key="item"
      icon="home-outlined"
      :text="`选项${item}`"
    />
  </wd-grid>
</template>

<!-- ✅ 正确: border 和 gutter 同时使用(圆角边框) -->
<template>
  <wd-grid border :gutter="12" bg-color="#fff">
    <wd-grid-item
      v-for="item in 8"
      :key="item"
      icon="home-outlined"
      :text="`选项${item}`"
    />
  </wd-grid>
</template>

<!-- ✅ 正确: 暗黑模式自动适配边框颜色 -->
<template>
  <view class="wot-theme-dark">
    <wd-grid border>
      <wd-grid-item
        v-for="item in 8"
        :key="item"
        icon="home-outlined"
        :text="`选项${item}`"
      />
    </wd-grid>
  </view>
</template>

<!-- ⚠️ 注意: 边框是 0.5px 细线,部分设备可能显示不清晰 -->
<template>
  <wd-grid border>
    <!-- 边框使用 transform: scale(0.5) 实现 -->
  </wd-grid>
</template>
```

参考: src/wd/components/wd-grid/wd-grid.vue:230-246, 317-335, 501-551

### 4. 正方形模式高度异常

**问题原因:**
- 正方形模式使用 padding-top 撑开高度,与内容的实际高度无关
- square 和 gutter 同时使用时,需要调整内容区域的定位
- 内容区域使用了额外的 padding 或 margin 导致高度计算错误

**解决方案:**

```vue
<!-- ✅ 正确: 正方形模式基本用法 -->
<template>
  <wd-grid :column="4" square>
    <wd-grid-item
      v-for="item in 8"
      :key="item"
      icon="home-outlined"
      :text="`选项${item}`"
    />
  </wd-grid>
</template>

<!-- ✅ 正确: 正方形模式 + 间距 -->
<template>
  <wd-grid :column="3" square :gutter="12" bg-color="#fff">
    <wd-grid-item
      v-for="item in 6"
      :key="item"
      icon="star-on"
      :text="`选项${item}`"
    />
  </wd-grid>
</template>

<!-- ❌ 错误: 正方形模式下设置固定高度 -->
<template>
  <wd-grid :column="4" square>
    <wd-grid-item
      v-for="item in 8"
      :key="item"
      icon="home-outlined"
      :text="`选项${item}`"
      custom-style="height: 200rpx;"
    />
    <!-- 不要在正方形模式下设置固定高度 -->
  </wd-grid>
</template>

<!-- ⚠️ 注意: 正方形模式内容过多会溢出 -->
<template>
  <wd-grid :column="2" square>
    <wd-grid-item use-slot>
      <view style="padding: 40rpx;">
        <text>非常长的内容非常长的内容非常长的内容</text>
        <text>非常长的内容非常长的内容非常长的内容</text>
      </view>
      <!-- 内容过多会溢出正方形区域 -->
    </wd-grid-item>
  </wd-grid>
</template>
```

参考: src/wd/components/wd-grid/wd-grid.vue:356-360, 570-578

### 5. items 模式插槽不显示

**问题原因:**
- 未设置 useSlot、useIconSlot 或 useTextSlot 属性
- 插槽名称配置错误
- 插槽使用了错误的作用域变量

**解决方案:**

```vue
<!-- ✅ 正确: 使用自定义内容插槽 -->
<template>
  <wd-grid :items="items" clickable>
    <template #item-0="{ item, index }">
      <view class="custom-content">
        <text>{{ item.text }}</text>
      </view>
    </template>
  </wd-grid>
</template>

<script lang="ts" setup>
const items = [
  {
    icon: 'home-outlined',
    text: '首页',
    useSlot: true, // 必须设置
    slotName: 'item-0', // 可选,默认为 item-0
  },
  { icon: 'user-outlined', text: '个人中心' },
]
</script>

<!-- ✅ 正确: 使用自定义图标插槽 -->
<template>
  <wd-grid :items="items" clickable>
    <template #icon-0="{ item, index }">
      <image src="/static/custom-icon.png" class="custom-icon" />
    </template>
  </wd-grid>
</template>

<script lang="ts" setup>
const items = [
  {
    icon: 'home-outlined',
    text: '首页',
    useIconSlot: true, // 必须设置
    iconSlotName: 'icon-0', // 可选,默认为 icon-0
  },
]
</script>

<!-- ❌ 错误: 未设置 useSlot 属性 -->
<template>
  <wd-grid :items="items" clickable>
    <template #item-0>
      <!-- 不会显示,因为未设置 useSlot: true -->
    </template>
  </wd-grid>
</template>

<script lang="ts" setup>
const items = [
  { icon: 'home-outlined', text: '首页' },
]
</script>

<!-- ❌ 错误: 插槽名称不匹配 -->
<template>
  <wd-grid :items="items" clickable>
    <template #item-custom>
      <!-- 不会显示,因为插槽名称不匹配 -->
    </template>
  </wd-grid>
</template>

<script lang="ts" setup>
const items = [
  {
    icon: 'home-outlined',
    text: '首页',
    useSlot: true,
    slotName: 'item-0', // 实际插槽名是 item-0
  },
]
</script>
```

参考: src/wd/components/wd-grid/wd-grid.vue:24-66

## 注意事项

1. **column 属性验证**: column 必须大于 0,否则会在控制台输出错误警告。组件内部有完善的验证逻辑。

2. **两种使用模式**: Grid 支持 items 数组模式和子组件模式,两种模式不能混用。通过 `items.length > 0` 判断使用哪种模式。

3. **边框实现原理**: 边框使用伪元素 `::before` 和 `::after` 实现,采用 `transform: scale(0.5)` 实现 0.5px 细线效果。

4. **正方形模式原理**: 正方形模式使用 `padding-top: width` 撑开高度,内容区域绝对定位铺满。因此正方形模式下不要设置固定高度。

5. **事件命名差异**: items 模式使用 `item-click` 事件(kebab-case),子组件模式使用 `itemclick` 事件(camelCase)。注意区分。

6. **性能考虑**: items 模式减少了组件实例数量,在大量网格项场景下性能更好。子组件模式更灵活但性能略低。

7. **插槽优先级**: 当同时配置了属性和插槽时,插槽优先级更高。例如设置了 `use-icon-slot` 后,`icon` 属性将被忽略。

8. **徽标位置**: 徽标通过 Badge 组件包裹在图标外层实现,显示在图标的右上角。徽标不会超出网格项边界。

9. **暗黑模式支持**: 组件完整支持暗黑模式,通过 `.wot-theme-dark` 类名自动切换边框和背景色。

10. **跳转方式选择**:
    - `navigateTo`: 普通页面跳转,保留历史记录
    - `redirectTo`: 替换当前页面,不保留历史记录
    - `reLaunch`: 关闭所有页面,跳转到新页面
    - `switchTab`: 跳转到 tabBar 页面

11. **间距和边框**: 当 border 和 gutter 同时使用时,边框会自动添加圆角效果(is-round 类),实现卡片式布局。

12. **响应式适配**: 建议根据屏幕宽度动态调整 column 值,可使用 `uni.getSystemInfoSync()` 和 `uni.onWindowResize()` 实现响应式布局。
