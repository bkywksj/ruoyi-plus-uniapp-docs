# Text 文本

## 介绍

Text 文本组件是一个功能强大的文本展示组件,提供丰富的文本样式、格式化、脱敏和图标组合功能。相比原生 `<text>` 标签,WD Text 组件支持主题类型、多行省略、字典翻译、数据格式化(日期、价格、电话、姓名)、信息脱敏等高级特性,极大提升开发效率和用户体验。

**核心特性:**

- **主题类型** - 内置 7 种主题类型(default/secondary/info/primary/success/warning/error),支持自定义颜色
- **文本格式化** - 支持日期格式化、价格千分位、电话/姓名脱敏等 5 种模式
- **字典翻译** - 通过 options 配置实现文本值与显示标签的映射转换
- **多行省略** - 支持 1-5 行文本超出显示省略号,自动处理溢出
- **图标组合** - 支持在文本的左、右、上、下四个方向添加图标装饰
- **插槽扩展** - 提供 prefix/suffix 前后置插槽,灵活组合内容
- **TypeScript 支持** - 完整的类型定义,开发时享受类型提示和检查

参考: src/wd/components/wd-text/wd-text.vue:1-567

## 基本用法

### 文本类型

WD Text 组件提供 7 种预设主题类型,适用于不同的信息层级和语义场景。

```vue
<template>
  <view class="demo">
    <!-- 默认文本 - 普通正文 -->
    <wd-text type="default">默认文本 Default</wd-text>

    <!-- 次要文本 - 注释/补充信息 -->
    <wd-text type="secondary">次要文本 Secondary</wd-text>

    <!-- 辅助文本 - 引导性/弱化信息 -->
    <wd-text type="info">辅助文本 Info</wd-text>

    <!-- 主题色文本 - 强调/链接 -->
    <wd-text type="primary">主题文本 Primary</wd-text>

    <!-- 成功文本 - 成功状态提示 -->
    <wd-text type="success">成功文本 Success</wd-text>

    <!-- 警告文本 - 警告状态提示 -->
    <wd-text type="warning">警告文本 Warning</wd-text>

    <!-- 错误文本 - 错误状态提示 -->
    <wd-text type="error">错误文本 Error</wd-text>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx;
}
</style>
```

**使用说明:**
- `default`: 颜色 #262626,用于正文内容
- `secondary`: 颜色 #595959,用于次要信息、注释
- `info`: 颜色 #8c8c8c,用于辅助文字、引导性文字
- `primary`: 主题蓝色,用于链接、强调内容
- `success`: 成功绿色,用于成功提示
- `warning`: 警告橙色,用于警告提示
- `error`: 错误红色,用于错误提示

参考: src/wd/components/wd-text/wd-text.vue:100, 116-117, 219-226, 537-564

### 文本大小和颜色

通过 `size` 和 `color` 属性自定义文本大小和颜色。

```vue
<template>
  <view class="demo">
    <!-- 不同大小的文本 -->
    <view class="section">
      <text class="section-title">文本大小</text>
      <wd-text :size="24">小号文本 24rpx</wd-text>
      <wd-text :size="28">普通文本 28rpx</wd-text>
      <wd-text :size="32">中号文本 32rpx</wd-text>
      <wd-text :size="36">大号文本 36rpx</wd-text>
      <wd-text :size="48">特大文本 48rpx</wd-text>
    </view>

    <!-- 自定义颜色 -->
    <view class="section">
      <text class="section-title">自定义颜色</text>
      <wd-text color="#ff0000" :size="32">红色文本</wd-text>
      <wd-text color="#00ff00" :size="32">绿色文本</wd-text>
      <wd-text color="#0000ff" :size="32">蓝色文本</wd-text>
      <wd-text color="rgba(255, 0, 0, 0.5)" :size="32">半透明红色</wd-text>
    </view>

    <!-- 使用 CSS 变量 -->
    <view class="section">
      <text class="section-title">CSS 变量</text>
      <wd-text color="var(--wd-color-primary)" :size="32">主题色</wd-text>
      <wd-text color="var(--wd-color-success)" :size="32">成功色</wd-text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &-title {
    display: block;
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: bold;
    color: #262626;
  }
}
</style>
```

**样式应用说明:**
- `size` 属性支持数字(自动转换为 rpx)和字符串(保持原单位)
- `color` 属性优先级高于 `type`,设置后会覆盖主题颜色
- 支持所有 CSS 颜色值格式(十六进制、RGB、RGBA、CSS变量等)
- 颜色通过 inline style 直接应用,不受样式隔离影响

参考: src/wd/components/wd-text/wd-text.vue:121, 133, 5

### 粗体和文本装饰

通过 `bold` 和 `decoration` 属性控制文本的粗细和装饰线。

```vue
<template>
  <view class="demo">
    <!-- 粗体文本 -->
    <view class="section">
      <text class="section-title">粗体</text>
      <wd-text>普通文本</wd-text>
      <wd-text :bold="true">粗体文本</wd-text>
      <wd-text type="primary" :bold="true" :size="32">主题色粗体</wd-text>
    </view>

    <!-- 文本装饰线 -->
    <view class="section">
      <text class="section-title">文本装饰</text>
      <wd-text decoration="underline">下划线文本</wd-text>
      <wd-text decoration="line-through" type="secondary">删除线文本</wd-text>
      <wd-text decoration="overline">上划线文本</wd-text>
      <wd-text decoration="none">无装饰文本</wd-text>
    </view>

    <!-- 组合使用 -->
    <view class="section">
      <text class="section-title">组合使用</text>
      <wd-text :bold="true" decoration="underline" type="primary" :size="32">
        粗体下划线主题文本
      </wd-text>
      <wd-text :bold="true" decoration="line-through" type="error">
        粗体删除线错误文本
      </wd-text>
    </view>
  </view>
</template>
```

**装饰线说明:**
- `underline`: 下划线,常用于链接文本
- `line-through`: 删除线,常用于折扣前价格、已删除内容
- `overline`: 上划线,较少使用
- `none`: 无装饰线(默认值)

参考: src/wd/components/wd-text/wd-text.vue:129, 124, 234-236, 426-428

### 多行省略

通过 `lines` 属性控制文本显示行数,超出部分自动显示省略号。

```vue
<template>
  <view class="demo">
    <!-- 单行省略 -->
    <view class="section">
      <text class="section-title">单行省略</text>
      <wd-text :lines="1">
        这是一段很长的文本内容,当文本超出一行时,会自动显示省略号。这是一段很长的文本内容,当文本超出一行时,会自动显示省略号。
      </wd-text>
    </view>

    <!-- 两行省略 -->
    <view class="section">
      <text class="section-title">两行省略</text>
      <wd-text :lines="2">
        这是一段很长的文本内容,当文本超出两行时,会自动显示省略号。这是一段很长的文本内容,当文本超出两行时,会自动显示省略号。这是一段很长的文本内容,当文本超出两行时,会自动显示省略号。
      </wd-text>
    </view>

    <!-- 三行省略 -->
    <view class="section">
      <text class="section-title">三行省略</text>
      <wd-text :lines="3" type="secondary">
        这是一段很长的文本内容,当文本超出三行时,会自动显示省略号。这是一段很长的文本内容,当文本超出三行时,会自动显示省略号。这是一段很长的文本内容,当文本超出三行时,会自动显示省略号。这是一段很长的文本内容,当文本超出三行时,会自动显示省略号。
      </wd-text>
    </view>

    <!-- 商品卡片示例 -->
    <view class="product-card">
      <image class="product-image" src="/static/images/product.jpg" />
      <view class="product-info">
        <wd-text :lines="2" :bold="true" :size="32">
          Apple iPhone 15 Pro Max 256GB 深空黑色 5G手机
        </wd-text>
        <wd-text :lines="1" type="secondary" :size="24">
          A17 Pro芯片 | 钛金属设计 | 超长续航
        </wd-text>
        <wd-text type="error" :bold="true" :size="36">¥8999</wd-text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.product-card {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;

  .product-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
  }

  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }
}
</style>
```

**省略功能说明:**
- 支持 1-5 行的多行省略,超过 5 行无效
- 省略样式通过 CSS `-webkit-line-clamp` 实现
- 省略号自动添加在文本末尾
- 配合 `block` 属性可实现块级元素的多行省略

参考: src/wd/components/wd-text/wd-text.vue:139, 229-231, 436-443

### 块级显示

通过 `block` 属性将文本设置为块级元素,占据整行宽度。

```vue
<template>
  <view class="demo">
    <!-- 行内元素(默认) -->
    <view class="section">
      <text class="section-title">行内元素</text>
      <view class="container">
        <wd-text>行内文本1</wd-text>
        <wd-text type="primary">行内文本2</wd-text>
        <wd-text type="success">行内文本3</wd-text>
      </view>
    </view>

    <!-- 块级元素 -->
    <view class="section">
      <text class="section-title">块级元素</text>
      <view class="container">
        <wd-text :block="true">块级文本1</wd-text>
        <wd-text :block="true" type="primary">块级文本2</wd-text>
        <wd-text :block="true" type="success">块级文本3</wd-text>
      </view>
    </view>

    <!-- 列表场景 -->
    <view class="section">
      <text class="section-title">列表场景</text>
      <view class="list">
        <view v-for="item in 3" :key="item" class="list-item">
          <wd-text :block="true" :bold="true" :size="32">
            列表标题 {{ item }}
          </wd-text>
          <wd-text :block="true" type="secondary" :size="28">
            这是列表项的描述信息,使用块级显示
          </wd-text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  &-item {
    padding: 24rpx;
    background: #fff;
    border-radius: 12rpx;
  }
}
</style>
```

**块级显示说明:**
- 默认为 `display: inline-block`,不占据整行
- 设置 `block="true"` 后变为 `display: block; width: 100%;`
- 块级模式下配合 `lines` 属性可实现固定高度的多行省略
- 块级模式下带图标时,左右布局的文本会占据剩余空间(flex: 1)

参考: src/wd/components/wd-text/wd-text.vue:144, 239-241, 430-434, 476-501

## 文本格式化

### 日期格式化

通过 `mode="date"` 将时间戳格式化为日期字符串。

```vue
<template>
  <view class="demo">
    <!-- 基础日期格式化 -->
    <view class="section">
      <text class="section-title">日期格式化</text>
      <wd-text :text="1609459200000" mode="date">原始时间戳</wd-text>
      <wd-text :text="Date.now()" mode="date" type="primary">当前时间</wd-text>
    </view>

    <!-- 表格场景 -->
    <view class="section">
      <text class="section-title">订单列表</text>
      <view class="table">
        <view v-for="order in orders" :key="order.id" class="table-row">
          <wd-text :block="true" :bold="true">订单 #{{ order.id }}</wd-text>
          <wd-text :text="order.createTime" mode="date" type="secondary" :size="24">
            创建时间
          </wd-text>
          <wd-text :text="order.payTime" mode="date" type="success" :size="24">
            支付时间
          </wd-text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const orders = ref([
  { id: 1001, createTime: 1609459200000, payTime: 1609462800000 },
  { id: 1002, createTime: 1609545600000, payTime: 1609549200000 },
])
</script>
```

**日期格式化说明:**
- 接受时间戳(毫秒)作为输入
- 输出格式固定为 `YYYY-MM-DD`
- 使用 dayjs 库进行格式化
- 无效时间戳会返回原始文本

参考: src/wd/components/wd-text/wd-text.vue:122, 382-395

### 价格格式化

通过 `mode="price"` 将数字格式化为千分位分隔的价格格式。

```vue
<template>
  <view class="demo">
    <!-- 基础价格格式化 -->
    <view class="section">
      <text class="section-title">价格格式化</text>
      <wd-text :text="1234.56" mode="price" type="error" :bold="true" :size="36">
        ¥
      </wd-text>
      <wd-text :text="9999999" mode="price" type="error" :bold="true" :size="36">
        ¥
      </wd-text>
    </view>

    <!-- 商品价格对比 -->
    <view class="section">
      <text class="section-title">价格对比</text>
      <view class="price-compare">
        <wd-text prefix="¥" :text="8999.00" mode="price" type="error" :bold="true" :size="48" />
        <wd-text
          prefix="¥"
          :text="10999.00"
          mode="price"
          type="secondary"
          decoration="line-through"
          :size="28"
        />
      </view>
    </view>

    <!-- 价格列表 -->
    <view class="section">
      <text class="section-title">商品列表</text>
      <view class="product-list">
        <view v-for="product in products" :key="product.id" class="product-item">
          <wd-text :lines="1" :bold="true" :size="32">{{ product.name }}</wd-text>
          <view class="product-price">
            <wd-text
              prefix="¥"
              :text="product.price"
              mode="price"
              type="error"
              :bold="true"
              :size="36"
            />
            <wd-text
              v-if="product.originalPrice"
              prefix="¥"
              :text="product.originalPrice"
              mode="price"
              type="secondary"
              decoration="line-through"
              :size="24"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const products = ref([
  { id: 1, name: 'iPhone 15 Pro', price: 8999, originalPrice: 10999 },
  { id: 2, name: 'MacBook Pro', price: 15999, originalPrice: 18999 },
  { id: 3, name: 'AirPods Pro', price: 1899, originalPrice: null },
])
</script>

<style lang="scss" scoped>
.price-compare {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.product-item {
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 12rpx;
}
</style>
```

**价格格式化说明:**
- 自动添加千分位分隔符(1,234,567.89)
- 保留两位小数(如果输入是整数也会显示 .00)
- 支持字符串和数字类型输入
- 无效数字返回原始文本

参考: src/wd/components/wd-text/wd-text.vue:122, 398-400, 322-345

### 电话号码脱敏

通过 `mode="phone"` 和 `format="true"` 实现电话号码中间四位脱敏。

```vue
<template>
  <view class="demo">
    <!-- 基础电话脱敏 -->
    <view class="section">
      <text class="section-title">电话脱敏</text>
      <wd-text :text="'13800138000'" mode="phone" :format="false">
        不脱敏:
      </wd-text>
      <wd-text :text="'13800138000'" mode="phone" :format="true">
        已脱敏:
      </wd-text>
    </view>

    <!-- 用户信息列表 -->
    <view class="section">
      <text class="section-title">用户列表</text>
      <view class="user-list">
        <view v-for="user in users" :key="user.id" class="user-item">
          <view class="user-info">
            <wd-text :bold="true" :size="32">{{ user.name }}</wd-text>
            <wd-text
              :text="user.phone"
              mode="phone"
              :format="true"
              type="secondary"
              :size="28"
            />
          </view>
          <wd-text
            :text="user.phone"
            mode="phone"
            :format="false"
            type="primary"
            :size="28"
            @click="handleCall(user.phone)"
          >
            拨打
          </wd-text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const users = ref([
  { id: 1, name: '张三', phone: '13800138000' },
  { id: 2, name: '李四', phone: '13900139000' },
])

const handleCall = (phone: string) => {
  uni.makePhoneCall({
    phoneNumber: phone,
  })
}
</script>
```

**电话脱敏说明:**
- 格式: 138****8000 (保留前3位和后4位)
- 仅在 `mode="phone"` 且 `format="true"` 时生效
- 要求输入为 11 位数字
- 不符合格式的输入会报错或返回原文

参考: src/wd/components/wd-text/wd-text.vue:127, 131, 296-298, 290-315

### 姓名脱敏

通过 `mode="name"` 和 `format="true"` 实现姓名脱敏处理。

```vue
<template>
  <view class="demo">
    <!-- 基础姓名脱敏 -->
    <view class="section">
      <text class="section-title">姓名脱敏</text>
      <wd-text :text="'张三'" mode="name" :format="false">不脱敏: </wd-text>
      <wd-text :text="'张三'" mode="name" :format="true">已脱敏: </wd-text>

      <wd-text :text="'李小明'" mode="name" :format="false">不脱敏: </wd-text>
      <wd-text :text="'李小明'" mode="name" :format="true">已脱敏: </wd-text>

      <wd-text :text="'欧阳修文'" mode="name" :format="false">不脱敏: </wd-text>
      <wd-text :text="'欧阳修文'" mode="name" :format="true">已脱敏: </wd-text>
    </view>

    <!-- 评论列表场景 -->
    <view class="section">
      <text class="section-title">评论列表</text>
      <view class="comment-list">
        <view v-for="comment in comments" :key="comment.id" class="comment-item">
          <view class="comment-header">
            <wd-text
              :text="comment.userName"
              mode="name"
              :format="true"
              :bold="true"
              :size="32"
            />
            <wd-text :text="comment.createTime" mode="date" type="secondary" :size="24" />
          </view>
          <wd-text :lines="3" type="secondary" :size="28">
            {{ comment.content }}
          </wd-text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const comments = ref([
  { id: 1, userName: '张小明', createTime: Date.now(), content: '商品质量很好,物流也很快!' },
  { id: 2, userName: '李华', createTime: Date.now() - 86400000, content: '非常满意,值得推荐!' },
])
</script>
```

**姓名脱敏规则:**
- 两字姓名: 张三 → 张*
- 三字姓名: 李小明 → 李*明
- 四字姓名: 欧阳修文 → 欧**文
- 保留首尾字符,中间用星号替换

参考: src/wd/components/wd-text/wd-text.vue:127, 131, 299-309

## 图标组合

### 左右图标

在文本的左侧或右侧添加图标装饰。

```vue
<template>
  <view class="demo">
    <!-- 左侧图标 -->
    <view class="section">
      <text class="section-title">左侧图标</text>
      <wd-text icon="home" icon-position="left" type="primary">
        首页
      </wd-text>
      <wd-text icon="search" icon-position="left" type="primary" :icon-size="28">
        搜索
      </wd-text>
      <wd-text icon="user" icon-position="left" type="primary" :icon-spacing="12">
        个人中心
      </wd-text>
    </view>

    <!-- 右侧图标 -->
    <view class="section">
      <text class="section-title">右侧图标</text>
      <wd-text icon="chevron-right" icon-position="right" type="secondary">
        更多设置
      </wd-text>
      <wd-text icon="right" icon-position="right" type="secondary">
        查看详情
      </wd-text>
      <wd-text icon="caret-down" icon-position="right" type="secondary">
        展开菜单
      </wd-text>
    </view>

    <!-- 自定义图标颜色和大小 -->
    <view class="section">
      <text class="section-title">自定义图标</text>
      <wd-text
        icon="star-fill"
        icon-position="left"
        icon-color="#faad14"
        :icon-size="32"
        type="primary"
        :size="32"
      >
        收藏
      </wd-text>
      <wd-text
        icon="heart-fill"
        icon-position="left"
        icon-color="#ff4d4f"
        :icon-size="32"
        type="error"
        :size="32"
      >
        喜欢
      </wd-text>
    </view>
  </view>
</template>
```

**左右图标说明:**
- `icon-position="left"`: 图标在文本左侧
- `icon-position="right"`: 图标在文本右侧
- `icon-size`: 图标大小,默认 32rpx
- `icon-color`: 图标颜色,默认继承文本颜色
- `icon-spacing`: 图标与文字间距,默认 8rpx

参考: src/wd/components/wd-text/wd-text.vue:147-157, 45-72, 450-468

### 上下图标

在文本的上方或下方添加图标,实现垂直布局。

```vue
<template>
  <view class="demo">
    <!-- 上方图标 -->
    <view class="section">
      <text class="section-title">上方图标</text>
      <view class="icon-text-group">
        <wd-text icon="home-fill" icon-position="top" :icon-size="48" type="primary">
          首页
        </wd-text>
        <wd-text icon="cart-fill" icon-position="top" :icon-size="48" type="primary">
          购物车
        </wd-text>
        <wd-text icon="user-fill" icon-position="top" :icon-size="48" type="primary">
          我的
        </wd-text>
      </view>
    </view>

    <!-- 下方图标 -->
    <view class="section">
      <text class="section-title">下方图标</text>
      <view class="icon-text-group">
        <wd-text
          icon="trending-up"
          icon-position="bottom"
          icon-color="#52c41a"
          :icon-size="40"
          :bold="true"
          :size="48"
        >
          +12.5%
        </wd-text>
        <wd-text
          icon="trending-down"
          icon-position="bottom"
          icon-color="#f5222d"
          :icon-size="40"
          :bold="true"
          :size="48"
        >
          -8.3%
        </wd-text>
      </view>
    </view>

    <!-- TabBar 导航示例 -->
    <view class="section">
      <text class="section-title">TabBar 导航</text>
      <view class="tabbar">
        <view
          v-for="tab in tabs"
          :key="tab.name"
          class="tabbar-item"
          @click="activeTab = tab.name"
        >
          <wd-text
            :icon="activeTab === tab.name ? tab.iconActive : tab.icon"
            icon-position="top"
            :icon-color="activeTab === tab.name ? '#1890ff' : '#8c8c8c'"
            :icon-size="48"
            :type="activeTab === tab.name ? 'primary' : 'info'"
            :size="24"
          >
            {{ tab.label }}
          </wd-text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref('home')

const tabs = [
  { name: 'home', label: '首页', icon: 'home', iconActive: 'home-fill' },
  { name: 'category', label: '分类', icon: 'menu', iconActive: 'menu-fill' },
  { name: 'cart', label: '购物车', icon: 'cart', iconActive: 'cart-fill' },
  { name: 'user', label: '我的', icon: 'user', iconActive: 'user-fill' },
]
</script>

<style lang="scss" scoped>
.icon-text-group {
  display: flex;
  gap: 48rpx;
}

.tabbar {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0;
  background: #fff;
  border-top: 1rpx solid #e8e8e8;

  &-item {
    flex: 1;
    display: flex;
    justify-content: center;
  }
}
</style>
```

**上下图标说明:**
- `icon-position="top"`: 图标在文本上方,垂直居中对齐
- `icon-position="bottom"`: 图标在文本下方,垂直居中对齐
- 上下布局使用 flex 布局,图标和文字垂直排列
- 适用于 TabBar、数据展示、图标按钮等场景

参考: src/wd/components/wd-text/wd-text.vue:14-41, 504-519, 470-474

## 插槽扩展

### 前后置插槽

通过 `prefix` 和 `suffix` 插槽或属性添加前后置内容。

```vue
<template>
  <view class="demo">
    <!-- 使用属性 -->
    <view class="section">
      <text class="section-title">使用属性</text>
      <wd-text prefix="¥" :text="8999" mode="price" type="error" :bold="true" :size="36" />
      <wd-text :text="100" suffix="%" type="success" :size="32" />
      <wd-text prefix="总计: ¥" :text="12999.99" mode="price" type="error" />
    </view>

    <!-- 使用插槽 -->
    <view class="section">
      <text class="section-title">使用插槽</text>
      <wd-text type="primary" :size="32">
        <template #prefix>
          <wd-icon name="star-fill" color="#faad14" :size="32" />
        </template>
        VIP 会员
        <template #suffix>
          <wd-icon name="chevron-right" :size="28" />
        </template>
      </wd-text>
    </view>

    <!-- 价格标签 -->
    <view class="section">
      <text class="section-title">价格标签</text>
      <view class="price-tag">
        <wd-text prefix="¥" :text="8999" mode="price" type="error" :bold="true" :size="56" />
        <wd-text prefix="原价 ¥" :text="10999" mode="price" type="secondary" decoration="line-through" :size="28" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.price-tag {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
</style>
```

**插槽使用说明:**
- `prefix` 属性/插槽: 在文本前添加内容
- `suffix` 属性/插槽: 在文本后添加内容
- 插槽优先级高于属性
- 插槽内可以放置任意内容(文本、图标、组件等)

参考: src/wd/components/wd-text/wd-text.vue:9-11, 74-77, 136-137

## 字典翻译

### 选项映射

通过 `options` 配置实现文本值与显示标签的映射转换。

```vue
<template>
  <view class="demo">
    <!-- 基础字典翻译 -->
    <view class="section">
      <text class="section-title">状态翻译</text>
      <wd-text :text="0" :options="statusOptions" />
      <wd-text :text="1" :options="statusOptions" type="success" />
      <wd-text :text="2" :options="statusOptions" type="error" />
    </view>

    <!-- 订单状态 -->
    <view class="section">
      <text class="section-title">订单列表</text>
      <view class="order-list">
        <view v-for="order in orders" :key="order.id" class="order-item">
          <view class="order-header">
            <wd-text :bold="true" :size="32">订单 #{{ order.id }}</wd-text>
            <wd-text
              :text="order.status"
              :options="orderStatusOptions"
              :type="getOrderStatusType(order.status)"
            />
          </view>
          <wd-text :text="order.createTime" mode="date" type="secondary" :size="24" />
          <wd-text prefix="¥" :text="order.amount" mode="price" type="error" :bold="true" :size="36" />
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 状态字典
const statusOptions = [
  { label: '待处理', value: 0 },
  { label: '已完成', value: 1 },
  { label: '已取消', value: 2 },
]

// 订单状态字典
const orderStatusOptions = [
  { label: '待支付', value: 0 },
  { label: '待发货', value: 1 },
  { label: '待收货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 },
]

const orders = ref([
  { id: 1001, status: 0, createTime: Date.now(), amount: 8999 },
  { id: 1002, status: 1, createTime: Date.now() - 86400000, amount: 15999 },
  { id: 1003, status: 3, createTime: Date.now() - 172800000, amount: 1899 },
])

const getOrderStatusType = (status: number) => {
  const typeMap: Record<number, any> = {
    0: 'warning',
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'error',
  }
  return typeMap[status] || 'default'
}
</script>
```

**字典翻译说明:**
- `options` 数组格式: `[{ label: '显示文本', value: 匹配值 }]`
- 根据 `text` 的值在 `options` 中查找对应的 `label` 显示
- 未找到匹配项时直接显示 `text` 原值
- 支持数字和字符串类型的 value

参考: src/wd/components/wd-text/wd-text.vue:159, 351-364

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 主题类型 | `TextType` | `'default'` |
| text | 文字内容 | `string \| number \| null \| undefined` | `''` |
| size | 字体大小,数字自动转换为 rpx | `string \| number` | `''` |
| mode | 文本处理模式 | `'text' \| 'date' \| 'phone' \| 'name' \| 'price'` | `'text'` |
| decoration | 文字装饰线 | `'underline' \| 'line-through' \| 'overline' \| 'none'` | `'none'` |
| call | mode=phone 时,点击是否拨打电话 | `boolean` | `false` |
| bold | 是否粗体 | `boolean` | `false` |
| format | 是否脱敏(mode=phone/name 时生效) | `boolean` | `false` |
| color | 文本颜色,支持所有 CSS 颜色值 | `string` | `''` |
| prefix | 前置插槽内容 | `string` | - |
| suffix | 后置插槽内容 | `string` | - |
| lines | 显示行数(1-5),超出显示省略号 | `number` | - |
| line-height | 文本行高 | `string` | `''` |
| block | 是否块级元素 | `boolean` | `false` |
| icon | 图标名称 | `IconName` | - |
| icon-position | 图标位置 | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` |
| icon-size | 图标大小 | `string \| number` | `32` |
| icon-color | 图标颜色 | `string` | - |
| icon-spacing | 图标与文字间距 | `string \| number` | `8` |
| options | 字典选项数组 | `Array<{ label: string; value: string \| number }>` | `[]` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: src/wd/components/wd-text/wd-text.vue:110-160, 171-189

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击文本时触发 | `event: Event` |

参考: src/wd/components/wd-text/wd-text.vue:165-168, 410-412

### Slots

| 名称 | 说明 |
|------|------|
| prefix | 前置内容,优先级高于 prefix 属性 |
| suffix | 后置内容,优先级高于 suffix 属性 |

参考: src/wd/components/wd-text/wd-text.vue:9-11, 74-77

### 类型定义

```typescript
/**
 * 文本类型
 */
type TextType = 'default' | 'secondary' | 'info' | 'primary' | 'success' | 'warning' | 'error'

/**
 * 图标位置类型
 */
type IconPosition = 'left' | 'right' | 'top' | 'bottom'

/**
 * 文本组件属性接口
 */
interface WdTextProps {
  customStyle?: string
  customClass?: string
  type?: TextType
  text?: string | number | null | undefined
  size?: string | number
  mode?: string
  decoration?: string
  call?: boolean
  bold?: boolean
  format?: boolean
  color?: string
  prefix?: string
  suffix?: string
  lines?: number
  lineHeight?: string
  block?: boolean
  icon?: IconName
  iconPosition?: IconPosition
  iconSize?: string | number
  iconColor?: string
  iconSpacing?: string | number
  options?: Array<{ label: string; value: string | number }>
}

/**
 * 文本组件事件接口
 */
interface WdTextEmits {
  click: [event: Event]
}
```

参考: src/wd/components/wd-text/wd-text.vue:97-168

## 主题定制

Text 组件通过 SCSS 变量和 CSS 类名实现主题定制。

```scss
// 主题颜色变量(定义在 variable.scss 中)
$-color-content: #262626;     // default 类型
$-color-secondary: #595959;   // secondary 类型
$-color-aid: #8c8c8c;         // info 类型
$-text-primary-color: #1890ff;  // primary 类型
$-text-success-color: #52c41a;  // success 类型
$-text-warning-color: #faad14;  // warning 类型
$-text-error-color: #f5222d;    // error 类型

// 自定义主题色
:root {
  --wd-text-primary: #1890ff;
  --wd-text-success: #52c41a;
  --wd-text-warning: #faad14;
  --wd-text-error: #f5222d;
}

// 暗黑模式
.dark {
  --wd-text-primary: #177ddc;
  --wd-text-success: #49aa19;
  --wd-text-warning: #d89614;
  --wd-text-error: #d32029;
}
```

```vue
<template>
  <view class="demo">
    <!-- 使用 CSS 变量 -->
    <wd-text color="var(--wd-text-primary)" :size="32">主题色文本</wd-text>
    <wd-text color="var(--wd-text-success)" :size="32">成功色文本</wd-text>
  </view>
</template>
```

参考: src/wd/components/wd-text/wd-text.vue:537-564

## 最佳实践

### 1. 合理选择文本类型

根据信息层级选择合适的文本类型,提升界面信息层次。

```vue
<template>
  <!-- ✅ 推荐:明确的信息层级 -->
  <view class="article">
    <wd-text :block="true" :bold="true" :size="48">文章标题</wd-text>
    <wd-text :block="true" type="secondary" :size="28">作者 | 发布时间</wd-text>
    <wd-text :block="true" type="info" :size="24">阅读量: 1234</wd-text>
    <wd-text :block="true" :lines="3" :size="32">文章摘要内容...</wd-text>
  </view>

  <!-- ❌ 不推荐:信息层级不清晰 -->
  <view class="article">
    <text>文章标题</text>
    <text>作者 | 发布时间</text>
    <text>阅读量: 1234</text>
    <text>文章摘要内容...</text>
  </view>
</template>
```

### 2. 数据格式化统一处理

使用 mode 属性统一处理数据格式化,避免手动格式化。

```vue
<template>
  <!-- ✅ 推荐:使用 mode 自动格式化 -->
  <view>
    <wd-text :text="orderCreateTime" mode="date" />
    <wd-text :text="orderAmount" mode="price" prefix="¥" />
    <wd-text :text="userPhone" mode="phone" :format="true" />
  </view>

  <!-- ❌ 不推荐:手动格式化 -->
  <view>
    <text>{{ formatDate(orderCreateTime) }}</text>
    <text>¥{{ formatPrice(orderAmount) }}</text>
    <text>{{ formatPhone(userPhone) }}</text>
  </view>
</template>
```

### 3. 使用字典翻译代替条件渲染

使用 options 配置实现字典翻译,代码更简洁可维护。

```vue
<template>
  <!-- ✅ 推荐:使用字典翻译 -->
  <wd-text
    :text="order.status"
    :options="statusOptions"
    :type="statusTypeMap[order.status]"
  />

  <!-- ❌ 不推荐:多重条件判断 -->
  <text v-if="order.status === 0">待支付</text>
  <text v-else-if="order.status === 1">待发货</text>
  <text v-else-if="order.status === 2">待收货</text>
  <text v-else>已完成</text>
</template>

<script setup>
const statusOptions = [
  { label: '待支付', value: 0 },
  { label: '待发货', value: 1 },
  { label: '待收货', value: 2 },
  { label: '已完成', value: 3 },
]

const statusTypeMap = {
  0: 'warning',
  1: 'info',
  2: 'primary',
  3: 'success',
}
</script>
```

### 4. 图标与文本组合

合理使用图标增强文本的语义和可读性。

```vue
<template>
  <!-- ✅ 推荐:图标增强语义 -->
  <view class="stats">
    <wd-text icon="heart-fill" icon-color="#ff4d4f" icon-position="left" :size="28">
      {{ likeCount }}
    </wd-text>
    <wd-text icon="comment-fill" icon-color="#1890ff" icon-position="left" :size="28">
      {{ commentCount }}
    </wd-text>
    <wd-text icon="share-fill" icon-color="#52c41a" icon-position="left" :size="28">
      {{ shareCount }}
    </wd-text>
  </view>

  <!-- ❌ 不推荐:纯文本不够直观 -->
  <view class="stats">
    <text>喜欢 {{ likeCount }}</text>
    <text>评论 {{ commentCount }}</text>
    <text>分享 {{ shareCount }}</text>
  </view>
</template>
```

### 5. 多行省略配合块级显示

在列表、卡片等场景使用多行省略,提升布局美观性。

```vue
<template>
  <!-- ✅ 推荐:多行省略 + 块级显示 -->
  <view class="product-card">
    <wd-text :block="true" :lines="2" :bold="true" :size="32">
      {{ product.name }}
    </wd-text>
    <wd-text :block="true" :lines="3" type="secondary" :size="28">
      {{ product.description }}
    </wd-text>
  </view>

  <!-- ❌ 不推荐:文本溢出 -->
  <view class="product-card">
    <text>{{ product.name }}</text>
    <text>{{ product.description }}</text>
  </view>
</template>
```

## 常见问题

### 1. 多行省略不生效

**问题原因:**
- lines 属性值超过 5(组件仅支持 1-5 行)
- 文本容器没有明确宽度
- 文本内容为单个长单词(英文)无法换行

**解决方案:**
```vue
<template>
  <!-- ✅ 确保容器有明确宽度 -->
  <view style="width: 600rpx;">
    <wd-text :lines="2" :block="true">
      这是一段很长的文本内容,会在两行后显示省略号
    </wd-text>
  </view>

  <!-- ✅ 使用 block 属性自动占据父容器宽度 -->
  <wd-text :lines="3" :block="true">
    长文本内容
  </wd-text>

  <!-- ✅ 处理英文长单词 -->
  <wd-text :lines="2" :block="true" custom-style="word-break: break-all;">
    verylongwordwithoutspaceswillbewrappedproperly
  </wd-text>
</template>
```

参考: src/wd/components/wd-text/wd-text.vue:436-443, 531-535

### 2. 格式化不生效

**问题原因:**
- mode 和 format 配置不正确
- text 值不符合格式要求
- 输入为空值或无效值

**解决方案:**
```vue
<template>
  <!-- ✅ 正确的日期格式化 -->
  <wd-text :text="Date.now()" mode="date" />
  <wd-text :text="1609459200000" mode="date" />

  <!-- ❌ 错误:text 不是时间戳 -->
  <wd-text :text="'2021-01-01'" mode="date" />

  <!-- ✅ 正确的电话脱敏 -->
  <wd-text :text="'13800138000'" mode="phone" :format="true" />

  <!-- ❌ 错误:电话号码格式不正确 -->
  <wd-text :text="'138001380'" mode="phone" :format="true" />

  <!-- ✅ 处理空值 -->
  <wd-text :text="data || '暂无数据'" mode="date" />
</template>
```

参考: src/wd/components/wd-text/wd-text.vue:370-404

### 3. 图标位置不正确

**问题原因:**
- icon-position 拼写错误
- 上下布局时容器样式冲突
- 块级模式下布局异常

**解决方案:**
```vue
<template>
  <!-- ✅ 正确的图标位置 -->
  <wd-text icon="home" icon-position="left">首页</wd-text>
  <wd-text icon="chevron-right" icon-position="right">更多</wd-text>
  <wd-text icon="star-fill" icon-position="top">收藏</wd-text>

  <!-- ❌ 错误:拼写错误 -->
  <wd-text icon="home" icon-position="leftt">首页</wd-text>

  <!-- ✅ 上下布局使用块级显示 -->
  <wd-text :block="true" icon="home-fill" icon-position="top" :icon-size="48">
    首页
  </wd-text>
</template>
```

参考: src/wd/components/wd-text/wd-text.vue:268-281, 444-501

### 4. 字典翻译显示原值

**问题原因:**
- options 配置错误
- text 值在 options 中不存在
- value 类型不匹配(字符串 vs 数字)

**解决方案:**
```vue
<template>
  <!-- ✅ 确保 value 类型一致 -->
  <wd-text :text="1" :options="options" />

  <script setup>
  // value 为数字
  const options = [
    { label: '选项一', value: 1 },
    { label: '选项二', value: 2 },
  ]
  </script>

  <!-- ❌ 类型不匹配 -->
  <wd-text :text="'1'" :options="options" />  <!-- text 是字符串,options.value 是数字 -->

  <!-- ✅ 提供默认值 -->
  <wd-text :text="data || 0" :options="options" />
</template>
```

参考: src/wd/components/wd-text/wd-text.vue:351-364

### 5. 点击事件无响应

**问题原因:**
- 文本被父元素遮挡
- 事件冒泡被阻止
- 文本设置了 pointer-events: none

**解决方案:**
```vue
<template>
  <!-- ✅ 确保文本可点击 -->
  <wd-text type="primary" @click="handleClick">点击我</wd-text>

  <!-- ✅ 阻止事件冒泡 -->
  <view @click="handleParentClick">
    <wd-text type="primary" @click.stop="handleTextClick">点击文本</wd-text>
  </view>

  <!-- ✅ 添加视觉反馈 -->
  <wd-text
    type="primary"
    custom-style="cursor: pointer;"
    @click="handleClick"
  >
    可点击文本
  </wd-text>
</template>

<script setup>
const handleClick = () => {
  console.log('文本被点击')
}

const handleParentClick = () => {
  console.log('父元素被点击')
}

const handleTextClick = () => {
  console.log('文本被点击,不会触发父元素点击')
}
</script>
```

参考: src/wd/components/wd-text/wd-text.vue:410-412
