---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/layout/rowCol
---

# Row-Col 行列布局

## 介绍

Row-Col (行列布局) 是一套基于 24 栅格系统的布局组件,通过 Row (行) 和 Col (列) 的组合,快速构建页面的栅格布局。该组件采用浮动布局方式,支持列宽度设置、列偏移、列间距等功能,可以灵活实现各种常见的页面布局需求。栅格系统将页面宽度分为 24 等份,通过设置列的 span 值来控制列的宽度占比。

**核心特性:**

- **24 栅格系统** - 将页面宽度平均分为 24 份,提供精细的布局控制
- **响应式布局** - 基于百分比宽度,自动适应不同屏幕尺寸
- **列间距控制** - Row 组件的 gutter 属性统一设置列之间的间距
- **列偏移** - Col 组件支持 offset 属性,实现列的左侧偏移
- **浮动布局** - 使用 float 实现列的水平排列,兼容性好
- **父子通信** - Row 和 Col 通过 useParent/useChildren 建立通信
- **自动清除浮动** - Row 组件自动清除浮动,保持布局稳定
- **灵活组合** - 可以嵌套使用,实现复杂的多层级布局

参考: src/wd/components/wd-row/wd-row.vue:1-71
参考: src/wd/components/wd-col/wd-col.vue:1-104

## 基本用法

### 基础布局

通过 Col 组件的 span 属性设置列的宽度,span 值为 1-24 的整数。

```vue
<template>
  <view class="demo">
    <!-- 单列布局 -->
    <wd-row>
      <wd-col :span="24">
        <view class="col-content bg-blue">span: 24</view>
      </wd-col>
    </wd-row>

    <!-- 两列布局 -->
    <wd-row>
      <wd-col :span="12">
        <view class="col-content bg-purple">span: 12</view>
      </wd-col>
      <wd-col :span="12">
        <view class="col-content bg-blue">span: 12</view>
      </wd-col>
    </wd-row>

    <!-- 三列布局 -->
    <wd-row>
      <wd-col :span="8">
        <view class="col-content bg-purple">span: 8</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-blue">span: 8</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-purple">span: 8</view>
      </wd-col>
    </wd-row>

    <!-- 四列布局 -->
    <wd-row>
      <wd-col :span="6">
        <view class="col-content bg-blue">span: 6</view>
      </wd-col>
      <wd-col :span="6">
        <view class="col-content bg-purple">span: 6</view>
      </wd-col>
      <wd-col :span="6">
        <view class="col-content bg-blue">span: 6</view>
      </wd-col>
      <wd-col :span="6">
        <view class="col-content bg-purple">span: 6</view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
// span 值为 1-24 的整数，表示占据的栅格数
</script>

```

**使用说明:**
- Row 组件作为行容器,包裹多个 Col 组件
- Col 组件的 span 属性控制列宽,值为 1-24
- 一行内所有列的 span 总和建议为 24,超过 24 会自动换行
- span 默认值为 24,即占满整行

参考: src/wd/components/wd-col/wd-col.vue:37-48, 88-102

### 不等宽列

通过设置不同的 span 值,实现不等宽的列布局。

```vue
<template>
  <view class="demo">
    <!-- 1:2 布局 -->
    <wd-row>
      <wd-col :span="8">
        <view class="col-content bg-blue">span: 8</view>
      </wd-col>
      <wd-col :span="16">
        <view class="col-content bg-purple">span: 16</view>
      </wd-col>
    </wd-row>

    <!-- 1:1:2 布局 -->
    <wd-row>
      <wd-col :span="6">
        <view class="col-content bg-purple">span: 6</view>
      </wd-col>
      <wd-col :span="6">
        <view class="col-content bg-blue">span: 6</view>
      </wd-col>
      <wd-col :span="12">
        <view class="col-content bg-purple">span: 12</view>
      </wd-col>
    </wd-row>

    <!-- 1:3:1 布局 -->
    <wd-row>
      <wd-col :span="5">
        <view class="col-content bg-blue">span: 5</view>
      </wd-col>
      <wd-col :span="14">
        <view class="col-content bg-purple">span: 14</view>
      </wd-col>
      <wd-col :span="5">
        <view class="col-content bg-blue">span: 5</view>
      </wd-col>
    </wd-row>

    <!-- 自由组合 -->
    <wd-row>
      <wd-col :span="4">
        <view class="col-content bg-purple">4</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-blue">8</view>
      </wd-col>
      <wd-col :span="6">
        <view class="col-content bg-purple">6</view>
      </wd-col>
      <wd-col :span="6">
        <view class="col-content bg-blue">6</view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
// 通过设置不同的 span 值实现不等宽布局
</script>

```

**使用说明:**
- 根据实际需求设置不同的 span 值
- 常见比例: 8:16 (1:2), 6:12:6 (1:2:1), 5:14:5 (1:3:1)
- 灵活组合可以实现各种复杂的布局需求

参考: src/wd/components/wd-col/wd-col.vue:92-94

### 列间距

通过 Row 组件的 gutter 属性设置列之间的间距,单位为 px。

```vue
<template>
  <view class="demo">
    <!-- 无间距 -->
    <view class="section-title">无间距 (gutter: 0)</view>
    <wd-row :gutter="0">
      <wd-col :span="8">
        <view class="col-content bg-blue">列 1</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-purple">列 2</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-blue">列 3</view>
      </wd-col>
    </wd-row>

    <!-- 小间距 -->
    <view class="section-title">小间距 (gutter: 10)</view>
    <wd-row :gutter="10">
      <wd-col :span="8">
        <view class="col-content bg-blue">列 1</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-purple">列 2</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-blue">列 3</view>
      </wd-col>
    </wd-row>

    <!-- 中等间距 -->
    <view class="section-title">中等间距 (gutter: 20)</view>
    <wd-row :gutter="20">
      <wd-col :span="8">
        <view class="col-content bg-blue">列 1</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-purple">列 2</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-blue">列 3</view>
      </wd-col>
    </wd-row>

    <!-- 大间距 -->
    <view class="section-title">大间距 (gutter: 40)</view>
    <wd-row :gutter="40">
      <wd-col :span="8">
        <view class="col-content bg-blue">列 1</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-purple">列 2</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-blue">列 3</view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
// gutter 单位为 px，默认值为 0
</script>

```

**使用说明:**
- gutter 属性设置列之间的间距,单位为 px
- gutter 默认值为 0,即无间距
- 间距通过 padding 实现,并设置 `background-clip: content-box` 避免背景色填充间距
- Row 组件会自动设置负的 margin 来抵消边缘列的 padding

**技术实现:**
- Row: `margin-left: -gutter/2; margin-right: -gutter/2;`
- Col: `padding-left: gutter; padding-right: gutter;`

参考: src/wd/components/wd-row/wd-row.vue:36, 6
参考: src/wd/components/wd-col/wd-col.vue:6

### 列偏移

通过 Col 组件的 offset 属性设置列的左侧偏移距离,单位为栅格数。

```vue
<template>
  <view class="demo">
    <!-- 左侧偏移 8 栅格 -->
    <wd-row>
      <wd-col :span="8">
        <view class="col-content bg-blue">span: 8</view>
      </wd-col>
      <wd-col :span="8" :offset="8">
        <view class="col-content bg-purple">span: 8, offset: 8</view>
      </wd-col>
    </wd-row>

    <!-- 左侧偏移 6 栅格 -->
    <wd-row>
      <wd-col :span="6" :offset="6">
        <view class="col-content bg-purple">span: 6, offset: 6</view>
      </wd-col>
      <wd-col :span="6" :offset="6">
        <view class="col-content bg-blue">span: 6, offset: 6</view>
      </wd-col>
    </wd-row>

    <!-- 居中布局 -->
    <wd-row>
      <wd-col :span="12" :offset="6">
        <view class="col-content bg-blue">span: 12, offset: 6 (居中)</view>
      </wd-col>
    </wd-row>

    <!-- 右对齐 -->
    <wd-row>
      <wd-col :span="8" :offset="16">
        <view class="col-content bg-purple">span: 8, offset: 16 (右对齐)</view>
      </wd-col>
    </wd-row>

    <!-- 复杂偏移 -->
    <wd-row>
      <wd-col :span="4">
        <view class="col-content bg-blue">4</view>
      </wd-col>
      <wd-col :span="4" :offset="4">
        <view class="col-content bg-purple">4, offset: 4</view>
      </wd-col>
      <wd-col :span="4" :offset="4">
        <view class="col-content bg-blue">4, offset: 4</view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
// offset 单位为栅格数，默认值为 0
</script>

```

**使用说明:**
- offset 属性设置列的左侧偏移距离,单位为栅格数
- offset 默认值为 0,即无偏移
- 可以通过 offset 实现居中、右对齐等布局效果
- offset 通过 `margin-left` 实现偏移

**常见用法:**
- 居中布局: `span="12" offset="6"` (12 栅格宽度,左侧偏移 6 栅格)
- 右对齐: `span="8" offset="16"` (8 栅格宽度,左侧偏移 16 栅格)

参考: src/wd/components/wd-col/wd-col.vue:39-40, 97-99

### 混合布局

结合 span、offset 和 gutter 实现复杂的混合布局。

```vue
<template>
  <view class="demo">
    <!-- 带间距的偏移布局 -->
    <wd-row :gutter="20">
      <wd-col :span="8">
        <view class="col-content bg-blue">span: 8</view>
      </wd-col>
      <wd-col :span="8" :offset="8">
        <view class="col-content bg-purple">span: 8, offset: 8</view>
      </wd-col>
    </wd-row>

    <!-- 复杂的列宽和偏移组合 -->
    <wd-row :gutter="15">
      <wd-col :span="4">
        <view class="col-content bg-purple">4</view>
      </wd-col>
      <wd-col :span="6" :offset="2">
        <view class="col-content bg-blue">6, offset: 2</view>
      </wd-col>
      <wd-col :span="8" :offset="4">
        <view class="col-content bg-purple">8, offset: 4</view>
      </wd-col>
    </wd-row>

    <!-- 不等宽 + 间距 -->
    <wd-row :gutter="20">
      <wd-col :span="6">
        <view class="col-content bg-blue">6</view>
      </wd-col>
      <wd-col :span="12">
        <view class="col-content bg-purple">12</view>
      </wd-col>
      <wd-col :span="6">
        <view class="col-content bg-blue">6</view>
      </wd-col>
    </wd-row>

    <!-- 多行混合布局 -->
    <wd-row :gutter="15">
      <wd-col :span="24">
        <view class="col-content bg-blue">全宽标题</view>
      </wd-col>
      <wd-col :span="8">
        <view class="col-content bg-purple">左侧</view>
      </wd-col>
      <wd-col :span="16">
        <view class="col-content bg-blue">右侧</view>
      </wd-col>
      <wd-col :span="12">
        <view class="col-content bg-blue">下左</view>
      </wd-col>
      <wd-col :span="12">
        <view class="col-content bg-purple">下右</view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
// 灵活组合 span、offset、gutter 实现各种布局
</script>

```

**使用说明:**
- 可以同时使用 span、offset 和 gutter
- 一行内列的 span + offset 总和不应超过 24
- 超过 24 栅格的列会自动换行显示

参考: src/wd/components/wd-row/wd-row.vue:1-71
参考: src/wd/components/wd-col/wd-col.vue:1-104

### 自定义样式

通过 custom-class 和 custom-style 自定义行和列的样式。

```vue
<template>
  <view class="demo">
    <!-- 自定义行样式 -->
    <wd-row
      :gutter="20"
      custom-class="custom-row"
      custom-style="background: #f5f5f5; padding: 20rpx; border-radius: 12rpx;"
    >
      <wd-col :span="12">
        <view class="col-content bg-blue">列 1</view>
      </wd-col>
      <wd-col :span="12">
        <view class="col-content bg-purple">列 2</view>
      </wd-col>
    </wd-row>

    <!-- 自定义列样式 -->
    <wd-row :gutter="15">
      <wd-col
        :span="8"
        custom-style="border: 2px solid #4d80f0; border-radius: 8rpx;"
      >
        <view class="col-content">边框列 1</view>
      </wd-col>
      <wd-col
        :span="8"
        custom-style="border: 2px solid #667eea; border-radius: 8rpx;"
      >
        <view class="col-content">边框列 2</view>
      </wd-col>
      <wd-col
        :span="8"
        custom-style="border: 2px solid #4d80f0; border-radius: 8rpx;"
      >
        <view class="col-content">边框列 3</view>
      </wd-col>
    </wd-row>

    <!-- 混合自定义样式 -->
    <wd-row :gutter="20" custom-style="margin-bottom: 40rpx;">
      <wd-col
        :span="12"
        custom-class="shadow-col"
      >
        <view class="col-content bg-blue">阴影列 1</view>
      </wd-col>
      <wd-col
        :span="12"
        custom-class="shadow-col"
      >
        <view class="col-content bg-purple">阴影列 2</view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
// 可通过 custom-class 和 custom-style 自定义样式
</script>

```

**使用说明:**
- Row 和 Col 组件都支持 `custom-class` 和 `custom-style`
- 可以添加边框、阴影、背景色等自定义效果
- 灵活实现各种视觉风格

参考: src/wd/components/wd-row/wd-row.vue:31-34
参考: src/wd/components/wd-col/wd-col.vue:33-36

## 进阶用法

### 响应式布局

通过动态设置 span 值,实现响应式布局效果。

```vue
<template>
  <view class="demo">
    <view class="info-panel">
      <text>屏幕宽度: {{ screenWidth }}px</text>
    </view>

    <!-- 根据屏幕宽度调整列数 -->
    <wd-row :gutter="20">
      <wd-col
        v-for="item in items"
        :key="item.id"
        :span="colSpan"
      >
        <view class="card">
          <image class="card-image" :src="item.image" mode="aspectFill" />
          <view class="card-title">{{ item.title }}</view>
          <view class="card-price">¥{{ item.price }}</view>
        </view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

const screenWidth = ref(375)

const items = ref([
  { id: 1, title: '商品 1', price: 99, image: 'https://via.placeholder.com/200' },
  { id: 2, title: '商品 2', price: 199, image: 'https://via.placeholder.com/200' },
  { id: 3, title: '商品 3', price: 299, image: 'https://via.placeholder.com/200' },
  { id: 4, title: '商品 4', price: 399, image: 'https://via.placeholder.com/200' },
])

// 根据屏幕宽度计算列宽
const colSpan = computed(() => {
  if (screenWidth.value < 400) {
    return 12 // 小屏幕: 2 列
  } else if (screenWidth.value < 600) {
    return 8 // 中等屏幕: 3 列
  } else {
    return 6 // 大屏幕: 4 列
  }
})

onMounted(() => {
  // 获取屏幕宽度
  uni.getSystemInfo({
    success: (res) => {
      screenWidth.value = res.screenWidth
    }
  })
})
</script>

```

**使用说明:**
- 通过 computed 动态计算 span 值
- 根据屏幕宽度自动调整列数
- 适用于商品列表、图片画廊等场景

参考: src/wd/components/wd-col/wd-col.vue:37-38, 92-94

### 嵌套布局

Row 和 Col 可以嵌套使用,实现复杂的多层级布局。

```vue
<template>
  <view class="demo">
    <wd-row :gutter="20">
      <!-- 左侧列 -->
      <wd-col :span="16">
        <view class="section left-section">
          <view class="section-title">主要内容区</view>

          <!-- 嵌套的行 -->
          <wd-row :gutter="15">
            <wd-col :span="24">
              <view class="content-box">文章标题</view>
            </wd-col>
            <wd-col :span="12">
              <view class="content-box">图片 1</view>
            </wd-col>
            <wd-col :span="12">
              <view class="content-box">图片 2</view>
            </wd-col>
            <wd-col :span="8">
              <view class="content-box">标签 1</view>
            </wd-col>
            <wd-col :span="8">
              <view class="content-box">标签 2</view>
            </wd-col>
            <wd-col :span="8">
              <view class="content-box">标签 3</view>
            </wd-col>
          </wd-row>
        </view>
      </wd-col>

      <!-- 右侧列 -->
      <wd-col :span="8">
        <view class="section right-section">
          <view class="section-title">侧边栏</view>

          <!-- 嵌套的行 -->
          <wd-row :gutter="10">
            <wd-col :span="24">
              <view class="sidebar-box">热门推荐</view>
            </wd-col>
            <wd-col :span="24">
              <view class="sidebar-box">最新文章</view>
            </wd-col>
            <wd-col :span="24">
              <view class="sidebar-box">标签云</view>
            </wd-col>
          </wd-row>
        </view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
// Row 和 Col 可以嵌套使用
</script>

```

**使用说明:**
- 在 Col 组件内部可以继续嵌套 Row 组件
- 嵌套的 Row 会创建新的栅格上下文
- 可以实现复杂的多层级布局结构

**技术说明:**
- 每个 Row 组件都是独立的栅格容器
- 嵌套的 Row 不会继承父级 Row 的 gutter 值
- 需要为每个 Row 单独设置 gutter

参考: src/wd/components/wd-row/wd-row.vue:46-48

### 卡片列表布局

使用栅格布局实现常见的卡片列表效果。

```vue
<template>
  <view class="demo">
    <wd-row :gutter="20">
      <wd-col
        v-for="card in cards"
        :key="card.id"
        :span="12"
      >
        <view class="card" @click="handleCardClick(card)">
          <view class="card-icon">
            <wd-icon :name="card.icon" size="64rpx" :color="card.color" />
          </view>
          <view class="card-title">{{ card.title }}</view>
          <view class="card-desc">{{ card.desc }}</view>
          <view class="card-count">{{ card.count }}</view>
        </view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Card {
  id: number
  icon: string
  color: string
  title: string
  desc: string
  count: number
}

const cards = ref<Card[]>([
  {
    id: 1,
    icon: 'home',
    color: '#4d80f0',
    title: '首页',
    desc: '系统首页',
    count: 1234
  },
  {
    id: 2,
    icon: 'user',
    color: '#19be6b',
    title: '用户',
    desc: '用户管理',
    count: 567
  },
  {
    id: 3,
    icon: 'setting',
    color: '#ff6b6b',
    title: '设置',
    desc: '系统设置',
    count: 89
  },
  {
    id: 4,
    icon: 'chart',
    color: '#f5a623',
    title: '统计',
    desc: '数据统计',
    count: 2345
  },
])

const handleCardClick = (card: Card) => {
  console.log('点击卡片:', card)
}
</script>

```

**使用说明:**
- 每个卡片占据 12 栅格 (2 列布局)
- 结合图标、文字、数字等元素
- 适用于功能入口、数据看板等场景

参考: src/wd/components/wd-col/wd-col.vue:1-104

### 表单布局

使用栅格布局实现响应式的表单布局。

```vue
<template>
  <view class="demo">
    <view class="form">
      <!-- 单列表单项 -->
      <wd-row :gutter="20">
        <wd-col :span="24">
          <view class="form-item">
            <view class="label">用户名</view>
            <input class="input" placeholder="请输入用户名" />
          </view>
        </wd-col>
      </wd-row>

      <!-- 两列表单项 -->
      <wd-row :gutter="20">
        <wd-col :span="12">
          <view class="form-item">
            <view class="label">姓名</view>
            <input class="input" placeholder="请输入姓名" />
          </view>
        </wd-col>
        <wd-col :span="12">
          <view class="form-item">
            <view class="label">年龄</view>
            <input class="input" type="number" placeholder="请输入年龄" />
          </view>
        </wd-col>
      </wd-row>

      <!-- 三列表单项 -->
      <wd-row :gutter="20">
        <wd-col :span="8">
          <view class="form-item">
            <view class="label">省份</view>
            <input class="input" placeholder="省份" />
          </view>
        </wd-col>
        <wd-col :span="8">
          <view class="form-item">
            <view class="label">城市</view>
            <input class="input" placeholder="城市" />
          </view>
        </wd-col>
        <wd-col :span="8">
          <view class="form-item">
            <view class="label">区县</view>
            <input class="input" placeholder="区县" />
          </view>
        </wd-col>
      </wd-row>

      <!-- 标签-输入框布局 -->
      <wd-row :gutter="20">
        <wd-col :span="6">
          <view class="form-label">详细地址</view>
        </wd-col>
        <wd-col :span="18">
          <input class="input" placeholder="请输入详细地址" />
        </wd-col>
      </wd-row>

      <!-- 提交按钮 -->
      <wd-row :gutter="20">
        <wd-col :span="12" :offset="6">
          <wd-button type="primary" block>提交</wd-button>
        </wd-col>
      </wd-row>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 使用栅格布局实现表单
</script>

```

**使用说明:**
- 根据表单项的重要性设置不同的列宽
- 结合 offset 实现标签-输入框的对齐
- 适用于各种表单布局场景

参考: src/wd/components/wd-row/wd-row.vue:1-71
参考: src/wd/components/wd-col/wd-col.vue:1-104

### 宫格导航

使用栅格布局实现宫格导航效果。

```vue
<template>
  <view class="demo">
    <wd-row :gutter="0">
      <wd-col
        v-for="nav in navList"
        :key="nav.id"
        :span="6"
      >
        <view class="nav-item" @click="handleNavClick(nav)">
          <view class="nav-icon">
            <wd-icon :name="nav.icon" size="48rpx" :color="nav.color" />
          </view>
          <view class="nav-text">{{ nav.text }}</view>
        </view>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface NavItem {
  id: number
  icon: string
  color: string
  text: string
  url: string
}

const navList = ref<NavItem[]>([
  { id: 1, icon: 'scan', color: '#4d80f0', text: '扫一扫', url: '/pages/scan/index' },
  { id: 2, icon: 'cart', color: '#19be6b', text: '购物车', url: '/pages/cart/index' },
  { id: 3, icon: 'coupon', color: '#ff6b6b', text: '优惠券', url: '/pages/coupon/index' },
  { id: 4, icon: 'service', color: '#f5a623', text: '客服', url: '/pages/service/index' },
  { id: 5, icon: 'location', color: '#667eea', text: '定位', url: '/pages/location/index' },
  { id: 6, icon: 'share', color: '#4ecdc4', text: '分享', url: '/pages/share/index' },
  { id: 7, icon: 'help', color: '#a29bfe', text: '帮助', url: '/pages/help/index' },
  { id: 8, icon: 'more', color: '#95a5a6', text: '更多', url: '/pages/more/index' },
])

const handleNavClick = (nav: NavItem) => {
  console.log('点击导航:', nav)
  uni.navigateTo({
    url: nav.url
  })
}
</script>

```

**使用说明:**
- 使用 `span="6"` 实现 4 列宫格布局
- 设置 `gutter="0"` 去除间距
- 添加边框实现分隔线效果

**常见宫格布局:**
- 4 列: `span="6"` (24 ÷ 6 = 4)
- 5 列: 需要自定义实现,栅格系统不支持
- 3 列: `span="8"` (24 ÷ 8 = 3)
- 2 列: `span="12"` (24 ÷ 12 = 2)

参考: src/wd/components/wd-col/wd-col.vue:92-94

### 图片画廊

使用栅格布局实现图片画廊效果。

```vue
<template>
  <view class="demo">
    <!-- 主图 -->
    <wd-row :gutter="10">
      <wd-col :span="24">
        <view class="image-wrapper main-image">
          <image
            class="image"
            src="https://via.placeholder.com/750x400"
            mode="aspectFill"
          />
        </view>
      </wd-col>
    </wd-row>

    <!-- 两列图片 -->
    <wd-row :gutter="10">
      <wd-col :span="12">
        <view class="image-wrapper">
          <image
            class="image"
            src="https://via.placeholder.com/400x300"
            mode="aspectFill"
          />
        </view>
      </wd-col>
      <wd-col :span="12">
        <view class="image-wrapper">
          <image
            class="image"
            src="https://via.placeholder.com/400x300"
            mode="aspectFill"
          />
        </view>
      </wd-col>
    </wd-row>

    <!-- 三列图片 -->
    <wd-row :gutter="10">
      <wd-col :span="8">
        <view class="image-wrapper">
          <image
            class="image"
            src="https://via.placeholder.com/300x200"
            mode="aspectFill"
          />
        </view>
      </wd-col>
      <wd-col :span="8">
        <view class="image-wrapper">
          <image
            class="image"
            src="https://via.placeholder.com/300x200"
            mode="aspectFill"
          />
        </view>
      </wd-col>
      <wd-col :span="8">
        <view class="image-wrapper">
          <image
            class="image"
            src="https://via.placeholder.com/300x200"
            mode="aspectFill"
          />
        </view>
      </wd-col>
    </wd-row>

    <!-- 混合布局 -->
    <wd-row :gutter="10">
      <wd-col :span="16">
        <view class="image-wrapper large-image">
          <image
            class="image"
            src="https://via.placeholder.com/500x400"
            mode="aspectFill"
          />
        </view>
      </wd-col>
      <wd-col :span="8">
        <wd-row :gutter="10">
          <wd-col :span="24">
            <view class="image-wrapper small-image">
              <image
                class="image"
                src="https://via.placeholder.com/250x195"
                mode="aspectFill"
              />
            </view>
          </wd-col>
          <wd-col :span="24">
            <view class="image-wrapper small-image">
              <image
                class="image"
                src="https://via.placeholder.com/250x195"
                mode="aspectFill"
              />
            </view>
          </wd-col>
        </wd-row>
      </wd-col>
    </wd-row>
  </view>
</template>

<script lang="ts" setup>
// 使用栅格布局实现图片画廊
</script>

```

**使用说明:**
- 通过不同的列宽组合实现各种画廊布局
- 结合嵌套布局实现复杂的图片排列
- 适用于相册、商品展示等场景

参考: src/wd/components/wd-row/wd-row.vue:1-71
参考: src/wd/components/wd-col/wd-col.vue:1-104

## API

### Row Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `gutter` | 列元素之间的间距,单位 px | `number` | `0` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-style` | 自定义根节点内联样式 | `string` | `''` |

参考: src/wd/components/wd-row/wd-row.vue:30-37, 40-44

### Col Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `span` | 列元素宽度,栅格数 (1-24) | `number` | `24` |
| `offset` | 列元素偏移距离,栅格数 (0-24) | `number` | `0` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-style` | 自定义根节点内联样式 | `string` | `''` |

参考: src/wd/components/wd-col/wd-col.vue:32-41, 44-49

### Row Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 行的内容,通常放置多个 Col 组件 |

参考: src/wd/components/wd-row/wd-row.vue:9

### Col Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 列的内容 |

参考: src/wd/components/wd-col/wd-col.vue:9

### 类型定义

```typescript
/**
 * 栅格行组件属性接口
 */
interface WdRowProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 列元素之间的间距（单位为px） */
  gutter?: number
}

/**
 * 栅格列组件属性接口
 */
interface WdColProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 列元素宽度（栅格数，总共24栅格） */
  span?: number
  /** 列元素偏移距离（栅格数） */
  offset?: number
}
```

参考: src/wd/components/wd-row/wd-row.vue:27-37
参考: src/wd/components/wd-col/wd-col.vue:29-41

## 主题定制

### CSS 变量

Row-Col 组件没有提供特定的 CSS 变量,可以通过 `custom-class` 和 `custom-style` 自定义样式。

### 自定义样式示例

```vue
<template>
  <!-- 自定义行样式 -->
  <wd-row
    :gutter="20"
    custom-class="custom-row"
    custom-style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20rpx; border-radius: 16rpx;"
  >
    <wd-col :span="12" custom-class="custom-col">
      <view class="content">列 1</view>
    </wd-col>
    <wd-col :span="12" custom-class="custom-col">
      <view class="content">列 2</view>
    </wd-col>
  </wd-row>
</template>

<style lang="scss">
.custom-row {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.custom-col {
  border-radius: 12rpx;
  overflow: hidden;
}

.content {
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  text-align: center;
  font-size: 28rpx;
}
</style>
```

参考: src/wd/components/wd-row/wd-row.vue:56-70
参考: src/wd/components/wd-col/wd-col.vue:77-86

## 最佳实践

### 1. 合理规划栅格数

<Ok/> **推荐做法:**
```vue
<template>
  <!-- 一行内栅格数总和为 24 或不超过 24 -->
  <wd-row>
    <wd-col :span="8">列 1</wd-col>
    <wd-col :span="8">列 2</wd-col>
    <wd-col :span="8">列 3</wd-col>
  </wd-row>

  <!-- 使用 offset 留白 -->
  <wd-row>
    <wd-col :span="12" :offset="6">居中列</wd-col>
  </wd-row>
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 一行内栅格数总和超过 24,会导致换行 -->
  <wd-row>
    <wd-col :span="10">列 1</wd-col>
    <wd-col :span="10">列 2</wd-col>
    <wd-col :span="10">列 3</wd-col>
  </wd-row>
</template>
```

**说明:**
- 一行内所有列的 span 总和建议为 24
- 超过 24 的列会自动换行
- 使用 offset 实现留白,而不是添加空列

### 2. 使用 gutter 而非 margin

<Ok/> **推荐做法:**
```vue
<template>
  <!-- 使用 Row 的 gutter 统一设置间距 -->
  <wd-row :gutter="20">
    <wd-col :span="12">
      <view class="content">列 1</view>
    </wd-col>
    <wd-col :span="12">
      <view class="content">列 2</view>
    </wd-col>
  </wd-row>
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 在列内容上添加 margin -->
  <wd-row>
    <wd-col :span="12">
      <view class="content" style="margin-right: 10px;">列 1</view>
    </wd-col>
    <wd-col :span="12">
      <view class="content" style="margin-left: 10px;">列 2</view>
    </wd-col>
  </wd-row>
</template>
```

**说明:**
- gutter 会自动处理边缘列的间距
- 手动添加 margin 会导致布局错乱
- gutter 实现更规范、更易维护

### 3. 嵌套时注意 gutter

<Ok/> **推荐做法:**
```vue
<template>
  <wd-row :gutter="20">
    <wd-col :span="12">
      <!-- 嵌套的 Row 设置自己的 gutter -->
      <wd-row :gutter="10">
        <wd-col :span="12">子列 1</wd-col>
        <wd-col :span="12">子列 2</wd-col>
      </wd-row>
    </wd-col>
  </wd-row>
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <wd-row :gutter="20">
    <wd-col :span="12">
      <!-- 嵌套的 Row 不设置 gutter,依赖父级 -->
      <wd-row>
        <wd-col :span="12">子列 1</wd-col>
        <wd-col :span="12">子列 2</wd-col>
      </wd-row>
    </wd-col>
  </wd-row>
</template>
```

**说明:**
- 每个 Row 都是独立的栅格容器
- 嵌套的 Row 不会继承父级的 gutter
- 需要为每个 Row 单独设置 gutter

### 4. 响应式布局动态计算

<Ok/> **推荐做法:**
```vue
<template>
  <wd-row :gutter="20">
    <wd-col
      v-for="item in list"
      :key="item.id"
      :span="colSpan"
    >
      <view class="item">{{ item.name }}</view>
    </wd-col>
  </wd-row>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

const screenWidth = ref(375)
const list = ref([...])

const colSpan = computed(() => {
  if (screenWidth.value < 400) return 12 // 2列
  if (screenWidth.value < 600) return 8  // 3列
  return 6 // 4列
})

onMounted(() => {
  uni.getSystemInfo({
    success: (res) => {
      screenWidth.value = res.screenWidth
    }
  })
})
</script>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 固定列宽,不考虑屏幕尺寸 -->
  <wd-row :gutter="20">
    <wd-col
      v-for="item in list"
      :key="item.id"
      :span="6"
    >
      <view class="item">{{ item.name }}</view>
    </wd-col>
  </wd-row>
</template>
```

**说明:**
- 根据屏幕宽度动态计算列宽
- 提供更好的跨设备体验
- 适用于商品列表、图片画廊等场景

### 5. 合理使用 offset

<Ok/> **推荐做法:**
```vue
<template>
  <!-- 使用 offset 实现居中 -->
  <wd-row>
    <wd-col :span="12" :offset="6">
      <view class="content">居中内容</view>
    </wd-col>
  </wd-row>

  <!-- 使用 offset 实现右对齐 -->
  <wd-row>
    <wd-col :span="8" :offset="16">
      <view class="content">右对齐内容</view>
    </wd-col>
  </wd-row>

  <!-- 使用 offset 创建间隔 -->
  <wd-row>
    <wd-col :span="6">左</wd-col>
    <wd-col :span="6" :offset="6">中</wd-col>
    <wd-col :span="6">右</wd-col>
  </wd-row>
</template>
```

<No/> **不推荐做法:**
```vue
<template>
  <!-- 使用空列实现留白 -->
  <wd-row>
    <wd-col :span="6"></wd-col>
    <wd-col :span="12">
      <view class="content">居中内容</view>
    </wd-col>
    <wd-col :span="6"></wd-col>
  </wd-row>
</template>
```

**说明:**
- offset 是实现留白的标准方式
- 避免使用空列,代码更简洁
- offset 语义更明确,易于维护

## 常见问题

### 1. 列之间出现间隙

**问题原因:**
- 浮动布局导致的空白字符问题
- Row 和 Col 之间有换行或空格

**解决方案:**

```vue
<template>
  <!-- 确保 Row 和 Col 之间没有多余的空白 -->
  <wd-row><wd-col :span="12">列1</wd-col><wd-col :span="12">列2</wd-col></wd-row>

  <!-- 或者使用 gutter 属性控制间距 -->
  <wd-row :gutter="20">
    <wd-col :span="12">列1</wd-col>
    <wd-col :span="12">列2</wd-col>
  </wd-row>
</template>
```

参考: src/wd/components/wd-row/wd-row.vue:62-68

### 2. gutter 设置无效

**问题原因:**
- gutter 值为负数
- Row 和 Col 之间没有正确建立父子通信

**解决方案:**

```vue
<template>
  <!-- 确保 gutter 为非负数 -->
  <wd-row :gutter="20">
    <!-- 确保 Col 是 Row 的直接子组件 -->
    <wd-col :span="12">
      <view class="content">内容</view>
    </wd-col>
  </wd-row>
</template>
```

**技术说明:**
```typescript
// Row 组件会验证 gutter 值
if (props.gutter < 0) {
  console.error('warning(wd-row): attribute gutter must be greater than or equal to 0')
}
```

参考: src/wd/components/wd-row/wd-row.vue:50-53

### 3. 列宽度不准确

**问题原因:**
- span 值超过 24
- 列内容设置了固定宽度
- box-sizing 设置不正确

**解决方案:**

```vue
<template>
  <!-- 确保 span 值在 1-24 范围内 -->
  <wd-row>
    <wd-col :span="8">
      <!-- 不要在列内容上设置固定宽度 -->
      <view class="content">内容</view>
    </wd-col>
  </wd-row>
</template>

```

**技术说明:**
```scss
// Col 组件使用 box-sizing: border-box
.wd-col {
  float: left;
  box-sizing: border-box;
}
```

参考: src/wd/components/wd-col/wd-col.vue:83-86

### 4. offset 偏移不生效

**问题原因:**
- offset 值为负数
- offset 值超过 24
- 前面的列已经占满一行

**解决方案:**

```vue
<template>
  <!-- 确保 offset 为非负数且 span + offset ≤ 24 -->
  <wd-row>
    <wd-col :span="12" :offset="6">
      <view class="content">正确的偏移</view>
    </wd-col>
  </wd-row>

  <!-- 错误示例: span + offset > 24 -->
  <!-- <wd-col :span="18" :offset="8">会换行</wd-col> -->
</template>
```

**技术说明:**
```typescript
// Col 组件会验证 span 和 offset 值
if (span < 0 || offset < 0) {
  console.error(
    '[wot-design] warning(wd-col): attribute span/offset must be greater than or equal to 0',
  )
}
```

参考: src/wd/components/wd-col/wd-col.vue:58-66

### 5. 嵌套布局 gutter 叠加

**问题原因:**
- 每个 Row 都会设置自己的 gutter
- 嵌套时 gutter 会叠加作用

**解决方案:**

```vue
<template>
  <wd-row :gutter="20">
    <wd-col :span="12">
      <!-- 嵌套的 Row 使用较小的 gutter -->
      <wd-row :gutter="10">
        <wd-col :span="12">子列 1</wd-col>
        <wd-col :span="12">子列 2</wd-col>
      </wd-row>
    </wd-col>
  </wd-row>
</template>
```

**说明:**
- 每个 Row 都是独立的栅格容器
- 嵌套时根据层级调整 gutter 值
- 外层 gutter 大,内层 gutter 小

参考: src/wd/components/wd-row/wd-row.vue:46-48

## 注意事项

1. **24 栅格系统**: Row-Col 组件基于 24 栅格系统,span 值范围为 1-24,超过 24 的列会自动换行。

2. **gutter 单位**: gutter 属性的单位为 px(像素),不是 rpx,设置时需注意单位转换。

3. **浮动布局**: 组件使用 float 实现列的水平排列,Row 组件会自动清除浮动,保持布局稳定。

4. **父子通信**: Row 和 Col 通过 useParent/useChildren 建立通信,Col 必须是 Row 的直接子组件才能正确获取 gutter 值。

5. **非负值验证**: gutter、span、offset 必须为非负数,组件会在开发环境输出警告信息。

6. **嵌套独立性**: 每个 Row 都是独立的栅格容器,嵌套的 Row 不会继承父级的 gutter,需要单独设置。

7. **响应式实现**: 组件本身不提供响应式断点功能,需要通过 computed 动态计算 span 值实现响应式布局。

8. **box-sizing**: Col 组件使用 `box-sizing: border-box`,padding 会包含在宽度内,不会影响布局。

9. **background-clip**: 设置 gutter 时,Col 会自动添加 `background-clip: content-box`,避免背景色填充 padding 区域。

10. **清除浮动**: Row 组件使用 `::after` 伪元素清除浮动,确保行容器能正确包含浮动的列元素。

11. **宽度计算**: 列宽度通过 `calc(100% / 24 * span)` 计算,offset 偏移通过 `margin-left: calc(100% / 24 * offset)` 实现。

12. **性能考虑**: 大量使用嵌套布局时,注意性能影响,建议合理规划布局层级,避免过度嵌套。

参考: src/wd/components/wd-row/wd-row.vue:1-71
参考: src/wd/components/wd-col/wd-col.vue:1-104
