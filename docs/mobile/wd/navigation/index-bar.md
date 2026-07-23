---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/navigation/indexBar
---

# IndexBar 索引栏

## 介绍

IndexBar 索引栏是一个用于列表索引分类显示和快速定位的导航组件。通过右侧的字母索引栏，用户可以快速跳转到对应的内容区域，常用于通讯录、城市列表、商品分类等需要按字母或分类快速检索的场景。组件支持吸顶效果、触摸滑动、自动高亮等功能，提供流畅的交互体验。

**核心特性:**

- **双组件配合** - IndexBar 容器组件配合 IndexAnchor 锚点组件使用，结构清晰
- **快速定位** - 点击或滑动右侧索引栏，内容区域快速滚动到对应位置
- **吸顶效果** - 支持锚点标题吸顶，滚动时当前分类标题固定在顶部
- **触摸交互** - 支持在索引栏上滑动手指连续切换索引，操作流畅自然
- **自动高亮** - 滚动内容时，右侧索引栏自动高亮当前所在位置的索引
- **位置计算** - 自动计算各个锚点的位置，实现精准的滚动定位
- **暗色主题** - 内置暗色模式支持，自动适配深色界面风格

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:1-50

---

## 基本用法

### 基础使用

最简单的使用方式，IndexBar 包裹 IndexAnchor 锚点组件。

```vue
<template>
  <view class="demo-index-bar">
    <wd-index-bar>
      <view v-for="letter in letters" :key="letter">
        <wd-index-anchor :index="letter" />
        <view v-for="item in getContactsByLetter(letter)" :key="item.id" class="contact-item">
          <text class="contact-name">{{ item.name }}</text>
        </view>
      </view>
    </wd-index-bar>
  </view>
</template>

<script lang="ts" setup>
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

// 模拟联系人数据
const contacts = [
  { id: 1, name: 'Allen', letter: 'A' },
  { id: 2, name: 'Amy', letter: 'A' },
  { id: 3, name: 'Bob', letter: 'B' },
  { id: 4, name: 'Bill', letter: 'B' },
  { id: 5, name: 'Chris', letter: 'C' },
  { id: 6, name: 'Cindy', letter: 'C' },
  { id: 7, name: 'David', letter: 'D' },
  { id: 8, name: 'Diana', letter: 'D' },
]

const getContactsByLetter = (letter: string) => {
  return contacts.filter(c => c.letter === letter)
}
</script>

```

**使用说明:**
- `wd-index-bar` 作为外层容器，控制滚动和索引
- `wd-index-anchor` 标记每个分组的开始位置
- `index` 属性设置锚点的索引值，显示在右侧索引栏
- IndexBar 会自动收集所有 IndexAnchor 生成右侧索引栏

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:2-34, src/wd/components/wd-index-anchor/wd-index-anchor.vue:6-14, 46

### 吸顶效果

启用吸顶效果后，滚动时当前分类标题会固定在顶部。

```vue
<template>
  <view class="demo-index-bar">
    <wd-index-bar :sticky="true">
      <view v-for="letter in letters" :key="letter">
        <wd-index-anchor :index="letter" />
        <view v-for="item in getContactsByLetter(letter)" :key="item.id" class="contact-item">
          <image class="contact-avatar" :src="item.avatar" mode="aspectFill" />
          <view class="contact-info">
            <text class="contact-name">{{ item.name }}</text>
            <text class="contact-phone">{{ item.phone }}</text>
          </view>
        </view>
      </view>
    </wd-index-bar>
  </view>
</template>

<script lang="ts" setup>
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

// 模拟联系人数据
const contacts = [
  { id: 1, name: 'Allen Wang', phone: '138****1234', avatar: '/static/avatar.png', letter: 'A' },
  { id: 2, name: 'Amy Chen', phone: '139****5678', avatar: '/static/avatar.png', letter: 'A' },
  { id: 3, name: 'Bob Li', phone: '136****9012', avatar: '/static/avatar.png', letter: 'B' },
  { id: 4, name: 'Bill Zhang', phone: '137****3456', avatar: '/static/avatar.png', letter: 'B' },
  { id: 5, name: 'Chris Liu', phone: '135****7890', avatar: '/static/avatar.png', letter: 'C' },
  // ... 更多数据
]

const getContactsByLetter = (letter: string) => {
  return contacts.filter(c => c.letter === letter)
}
</script>

```

**使用说明:**
- `sticky` 属性启用吸顶效果
- 吸顶模式下，当前激活的锚点会固定在顶部
- 适用于内容较多、需要明确分类标识的场景
- 吸顶元素使用 `position: sticky` 实现

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:62, src/wd/components/wd-index-anchor/wd-index-anchor.vue:82-84, 150-156

### 自定义锚点内容

使用插槽自定义锚点的显示内容。

```vue
<template>
  <view class="demo-index-bar">
    <wd-index-bar :sticky="true">
      <view v-for="group in cityGroups" :key="group.letter">
        <wd-index-anchor :index="group.letter">
          <view class="custom-anchor">
            <wd-icon name="location" size="32" />
            <text class="anchor-text">{{ group.name }}</text>
          </view>
        </wd-index-anchor>
        <view v-for="city in group.cities" :key="city.id" class="city-item">
          <text class="city-name">{{ city.name }}</text>
          <text class="city-code">{{ city.code }}</text>
        </view>
      </view>
    </wd-index-bar>
  </view>
</template>

<script lang="ts" setup>
const cityGroups = [
  {
    letter: 'A',
    name: 'A 字母城市',
    cities: [
      { id: 1, name: '安庆', code: 'AQ' },
      { id: 2, name: '安阳', code: 'AY' },
    ],
  },
  {
    letter: 'B',
    name: 'B 字母城市',
    cities: [
      { id: 3, name: '北京', code: 'BJ' },
      { id: 4, name: '保定', code: 'BD' },
    ],
  },
  {
    letter: 'C',
    name: 'C 字母城市',
    cities: [
      { id: 5, name: '成都', code: 'CD' },
      { id: 6, name: '重庆', code: 'CQ' },
    ],
  },
]
</script>

```

**使用说明:**
- IndexAnchor 支持默认插槽自定义内容
- 不使用插槽时，默认显示 `index` 属性的值
- 自定义内容可以包含图标、文字、样式等
- 适合需要丰富视觉效果的场景

参考: src/wd/components/wd-index-anchor/wd-index-anchor.vue:11-13

---

## 高级用法

### 通讯录列表

实现一个完整的通讯录功能，包括搜索和分组。

```vue
<template>
  <view class="contact-list">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-search v-model="searchQuery" placeholder="搜索联系人" @search="handleSearch" />
    </view>

    <!-- 索引栏 -->
    <wd-index-bar :sticky="true">
      <!-- 常用联系人 -->
      <template v-if="!searchQuery && favoriteContacts.length > 0">
        <wd-index-anchor index="★">
          <view class="anchor-title">
            <wd-icon name="star-fill" size="32" color="#ff9500" />
            <text>常用联系人</text>
          </view>
        </wd-index-anchor>
        <view
          v-for="contact in favoriteContacts"
          :key="contact.id"
          class="contact-item"
          @click="handleContactClick(contact)"
        >
          <image class="contact-avatar" :src="contact.avatar" mode="aspectFill" />
          <view class="contact-info">
            <text class="contact-name">{{ contact.name }}</text>
            <text class="contact-company">{{ contact.company }}</text>
          </view>
          <wd-icon name="arrow-right" size="32" color="#999" />
        </view>
      </template>

      <!-- 字母分组 -->
      <view v-for="letter in displayLetters" :key="letter">
        <wd-index-anchor :index="letter" />
        <view
          v-for="contact in getContactsByLetter(letter)"
          :key="contact.id"
          class="contact-item"
          @click="handleContactClick(contact)"
        >
          <image class="contact-avatar" :src="contact.avatar" mode="aspectFill" />
          <view class="contact-info">
            <text class="contact-name">{{ contact.name }}</text>
            <text class="contact-phone">{{ contact.phone }}</text>
          </view>
          <wd-icon name="arrow-right" size="32" color="#999" />
        </view>
      </view>
    </wd-index-bar>

    <!-- 空状态 -->
    <view v-if="filteredContacts.length === 0" class="empty-state">
      <wd-icon name="search" size="120" color="#ccc" />
      <text class="empty-text">未找到联系人</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Contact {
  id: number
  name: string
  phone: string
  avatar: string
  company?: string
  letter: string
  isFavorite?: boolean
}

const searchQuery = ref('')

// 模拟联系人数据
const allContacts: Contact[] = [
  { id: 1, name: 'Allen Wang', phone: '138****1234', avatar: '/static/avatar.png', company: '科技公司', letter: 'A', isFavorite: true },
  { id: 2, name: 'Amy Chen', phone: '139****5678', avatar: '/static/avatar.png', letter: 'A' },
  { id: 3, name: 'Bob Li', phone: '136****9012', avatar: '/static/avatar.png', letter: 'B', isFavorite: true },
  // ... 更多数据
]

// 常用联系人
const favoriteContacts = computed(() => {
  return allContacts.filter(c => c.isFavorite)
})

// 过滤后的联系人
const filteredContacts = computed(() => {
  if (!searchQuery.value) {
    return allContacts
  }
  return allContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.phone.includes(searchQuery.value)
  )
})

// 显示的字母索引
const displayLetters = computed(() => {
  const letters = new Set(filteredContacts.value.map(c => c.letter))
  return Array.from(letters).sort()
})

const getContactsByLetter = (letter: string) => {
  return filteredContacts.value.filter(c => c.letter === letter)
}

const handleSearch = (value: string) => {
  console.log('搜索:', value)
}

const handleContactClick = (contact: Contact) => {
  uni.showToast({
    title: `点击了 ${contact.name}`,
    icon: 'none',
  })
}
</script>

```

**使用说明:**
- 结合搜索功能实现联系人筛选
- 常用联系人使用特殊索引标识（<Icon icon="lucide:star" />）
- 点击联系人可以跳转到详情页
- 空状态提示用户未找到内容

### 城市选择器

实现一个城市选择功能，包括热门城市和字母索引。

```vue
<template>
  <view class="city-selector">
    <view class="header">
      <text class="title">选择城市</text>
      <wd-icon name="close" size="40" @click="handleClose" />
    </view>

    <wd-index-bar :sticky="true">
      <!-- 当前定位 -->
      <wd-index-anchor index="#">
        <view class="section-title">当前定位</view>
      </wd-index-anchor>
      <view class="current-city" @click="handleCityClick(currentCity)">
        <wd-icon name="location" size="32" color="#4d80f0" />
        <text class="city-name">{{ currentCity.name }}</text>
      </view>

      <!-- 热门城市 -->
      <wd-index-anchor index="🔥">
        <view class="section-title">热门城市</view>
      </wd-index-anchor>
      <view class="hot-cities">
        <view
          v-for="city in hotCities"
          :key="city.id"
          class="hot-city-item"
          @click="handleCityClick(city)"
        >
          {{ city.name }}
        </view>
      </view>

      <!-- 字母分组 -->
      <view v-for="letter in letters" :key="letter">
        <wd-index-anchor :index="letter" />
        <view
          v-for="city in getCitiesByLetter(letter)"
          :key="city.id"
          class="city-item"
          @click="handleCityClick(city)"
        >
          <text class="city-name">{{ city.name }}</text>
        </view>
      </view>
    </wd-index-bar>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface City {
  id: number
  name: string
  code: string
  letter: string
}

const currentCity = ref<City>({
  id: 0,
  name: '北京',
  code: 'BJ',
  letter: 'B',
})

const hotCities: City[] = [
  { id: 1, name: '北京', code: 'BJ', letter: 'B' },
  { id: 2, name: '上海', code: 'SH', letter: 'S' },
  { id: 3, name: '广州', code: 'GZ', letter: 'G' },
  { id: 4, name: '深圳', code: 'SZ', letter: 'S' },
  { id: 5, name: '杭州', code: 'HZ', letter: 'H' },
  { id: 6, name: '成都', code: 'CD', letter: 'C' },
]

const cities: City[] = [
  { id: 7, name: '安庆', code: 'AQ', letter: 'A' },
  { id: 8, name: '安阳', code: 'AY', letter: 'A' },
  { id: 9, name: '保定', code: 'BD', letter: 'B' },
  // ... 更多城市数据
]

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const getCitiesByLetter = (letter: string) => {
  return cities.filter(c => c.letter === letter)
}

const handleCityClick = (city: City) => {
  uni.showToast({
    title: `已选择 ${city.name}`,
    icon: 'success',
  })
  // 这里可以通过事件或路由传递选中的城市
  setTimeout(() => {
    handleClose()
  }, 1000)
}

const handleClose = () => {
  uni.navigateBack()
}
</script>

```

**使用说明:**
- 使用特殊字符作为索引（# 表示定位，<Icon icon="lucide:flame" /> 表示热门）
- 热门城市使用宫格布局，方便快速选择
- 当前定位和热门城市不参与字母索引
- 选择城市后自动返回上一页

### 商品分类

实现商品分类列表，支持多级分类和图片展示。

```vue
<template>
  <view class="product-category">
    <wd-index-bar :sticky="true">
      <view v-for="category in categories" :key="category.letter">
        <wd-index-anchor :index="category.letter" />

        <view
          v-for="item in category.items"
          :key="item.id"
          class="category-item"
          @click="handleCategoryClick(item)"
        >
          <image class="category-icon" :src="item.icon" mode="aspectFill" />
          <view class="category-info">
            <text class="category-name">{{ item.name }}</text>
            <text class="category-count">{{ item.count }} 件商品</text>
          </view>
          <wd-icon name="arrow-right" size="32" color="#999" />
        </view>
      </view>
    </wd-index-bar>
  </view>
</template>

<script lang="ts" setup>
interface CategoryItem {
  id: number
  name: string
  icon: string
  count: number
}

interface Category {
  letter: string
  items: CategoryItem[]
}

const categories: Category[] = [
  {
    letter: 'A',
    items: [
      { id: 1, name: 'Apple 苹果', icon: '/static/category/apple.png', count: 120 },
    ],
  },
  {
    letter: 'B',
    items: [
      { id: 2, name: 'Book 图书', icon: '/static/category/book.png', count: 800 },
      { id: 3, name: 'Beauty 美妆', icon: '/static/category/beauty.png', count: 350 },
    ],
  },
  {
    letter: 'C',
    items: [
      { id: 4, name: 'Computer 电脑', icon: '/static/category/computer.png', count: 200 },
      { id: 5, name: 'Clothing 服装', icon: '/static/category/clothing.png', count: 1500 },
    ],
  },
]

const handleCategoryClick = (item: CategoryItem) => {
  uni.navigateTo({
    url: `/pages/category/list?id=${item.id}&name=${item.name}`,
  })
}
</script>

```

**使用说明:**
- 商品分类按首字母分组
- 每个分类显示图标、名称和商品数量
- 点击分类跳转到对应的商品列表页

---

## API

### IndexBar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| sticky | 索引锚点是否吸顶 | `boolean` | `false` |

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:60-63, 66-68

### IndexAnchor Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| index | 索引值，显示在右侧索引栏 | `number \| string` | - |

参考: src/wd/components/wd-index-anchor/wd-index-anchor.vue:40-47, 64-68

### IndexBar Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 默认插槽，放置 IndexAnchor 和内容 | - |

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:13

### IndexAnchor Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 自定义锚点内容，不使用时显示 index 值 | - |

参考: src/wd/components/wd-index-anchor/wd-index-anchor.vue:11-13

### IndexAnchor 实例方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| getInfo | 获取锚点位置信息 | `() => void` | - |

参考: src/wd/components/wd-index-anchor/wd-index-anchor.vue:52-61, 90-96, 106-111

### 类型定义

```typescript
/**
 * 锚点索引类型
 */
export type AnchorIndex = number | string

/**
 * 索引栏组件属性接口
 */
export interface WdIndexBarProps {
  /** 索引是否吸顶 */
  sticky?: boolean
}

/**
 * 索引锚点组件属性接口
 */
export interface WdIndexAnchorProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 索引值 */
  index: AnchorIndex
}

/**
 * 索引锚点组件暴露方法接口
 */
export interface WdIndexAnchorExpose {
  /** 锚点距离顶部的位置 */
  top: Ref<number>
  /** 获取锚点位置信息的方法 */
  getInfo: () => void
  /** 锚点唯一ID */
  indexAnchorId: Ref<string>
  /** 是否处于吸顶状态（计算属性） */
  isSticky: ComputedRef<boolean>
}

/** 索引锚点组件实例类型 */
export type WdIndexAnchorInstance = ComponentPublicInstance<WdIndexAnchorProps, WdIndexAnchorExpose>
```

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:55-63, src/wd/components/wd-index-anchor/wd-index-anchor.vue:22, 40-61, 114

---

## 主题定制

### CSS 变量

IndexBar 组件提供了以下 CSS 变量用于主题定制:

```scss
// 索引栏容器
// (容器样式主要通过 position 和尺寸控制，无特定 CSS 变量)

// 右侧索引项
// 索引项样式（文字大小、颜色、内边距等）

// 索引锚点
$-color-gray-2: #f5f7fa;                                 // 锚点背景色
$-color-title: #1d1d1f;                                  // 锚点文字颜色
// 锚点字体大小: 28rpx
// 锚点内边距: 20rpx

// 右侧索引
// 索引字体大小: 24rpx
$-color-theme: #4d80f0;                                  // 激活索引颜色

// 暗色主题
.wot-theme-dark {
  $-color-white: #ffffff;                                // 索引文字颜色（暗色）
  $-color-gray-8: #48484a;                              // 锚点背景色（暗色）
}
```

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:233-276, src/wd/components/wd-index-anchor/wd-index-anchor.vue:117-157

### 自定义样式

**基础样式定制:**

```vue
<template>
  <view class="custom-index-bar">
    <wd-index-bar :sticky="true">
      <view v-for="letter in letters" :key="letter">
        <wd-index-anchor :index="letter" custom-class="custom-anchor" />
        <view v-for="i in 3" :key="i" class="list-item">
          项目 {{ letter }}{{ i }}
        </view>
      </view>
    </wd-index-bar>
  </view>
</template>

<script lang="ts" setup>
const letters = ['A', 'B', 'C', 'D', 'E']
</script>

```

**深色主题:**

```vue
<template>
  <view class="dark-index-bar wot-theme-dark">
    <wd-index-bar :sticky="true">
      <view v-for="letter in letters" :key="letter">
        <wd-index-anchor :index="letter" />
        <view v-for="i in 3" :key="i" class="list-item">
          项目 {{ letter }}{{ i }}
        </view>
      </view>
    </wd-index-bar>
  </view>
</template>

<script lang="ts" setup>
const letters = ['A', 'B', 'C', 'D', 'E']
</script>

```

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:238-245, src/wd/components/wd-index-anchor/wd-index-anchor.vue:122-128

---

## 最佳实践

### 1. 合理设置索引值

**推荐做法:**

```vue
<script lang="ts" setup>
// ✅ 使用简洁明了的索引值
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

// ✅ 特殊分组使用有意义的符号
const specialIndexes = {
  location: '#',    // 当前定位
  hot: '🔥',        // 热门
  favorite: '★',   // 收藏
  recent: '⏱',     // 最近
}
</script>

<template>
  <wd-index-bar>
    <!-- 特殊分组 -->
    <wd-index-anchor :index="specialIndexes.hot" />

    <!-- 字母分组 -->
    <view v-for="letter in letters" :key="letter">
      <wd-index-anchor :index="letter" />
    </view>
  </wd-index-bar>
</template>
```

**不推荐做法:**

```vue
<script lang="ts" setup>
// ❌ 索引值过长
const indexes = ['Section A', 'Section B', 'Section C']

// ❌ 索引值无意义
const indexes2 = ['1', '2', '3', '4', '5']
</script>
```

**说明:**
- 索引值应该简短，通常为 1-2 个字符
- 字母索引使用大写字母
- 特殊分组可以使用符号或 Emoji
- 避免使用过长或无意义的索引值

### 2. 优化大数据列表性能

**推荐做法:**

```vue
<template>
  <wd-index-bar :sticky="true">
    <view v-for="letter in letters" :key="letter">
      <wd-index-anchor :index="letter" />

      <!-- ✅ 使用虚拟列表渲染大量数据 -->
      <view
        v-for="item in getItemsByLetter(letter)"
        :key="item.id"
        class="list-item"
      >
        {{ item.name }}
      </view>
    </view>
  </wd-index-bar>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// ✅ 使用 computed 缓存分组结果
const getItemsByLetter = (letter: string) => {
  return computed(() => {
    return allItems.filter(item => item.letter === letter)
  }).value
}
</script>
```

**不推荐做法:**

```vue
<template>
  <wd-index-bar :sticky="true">
    <!-- ❌ 直接渲染所有数据，不分组 -->
    <view v-for="item in allItems" :key="item.id">
      <wd-index-anchor :index="item.letter" />
      <view class="list-item">{{ item.name }}</view>
    </view>
  </wd-index-bar>
</template>
```

**说明:**
- 大数据列表使用 computed 缓存分组结果
- 按字母分组，避免重复渲染锚点
- 考虑使用虚拟列表优化性能
- 避免在列表项中执行复杂计算

### 3. 正确处理吸顶效果

**推荐做法:**

```vue
<template>
  <view class="page">
    <!-- ✅ 为 IndexBar 设置明确的高度 -->
    <wd-index-bar :sticky="true" class="index-bar-container">
      <view v-for="letter in letters" :key="letter">
        <wd-index-anchor :index="letter" />
        <view v-for="i in 5" :key="i" class="list-item">
          项目 {{ letter }}{{ i }}
        </view>
      </view>
    </wd-index-bar>
  </view>
</template>

```

**不推荐做法:**

```vue
```

**说明:**
- IndexBar 必须设置明确的高度
- 吸顶效果依赖固定的容器高度
- 推荐使用 `100vh` 或固定像素值
- 避免使用 `auto` 或不设置高度

### 4. 结合搜索功能

**推荐做法:**

```vue
<template>
  <view class="page">
    <view class="search-bar">
      <wd-search v-model="searchQuery" />
    </view>

    <!-- ✅ 搜索时隐藏索引栏 -->
    <wd-index-bar v-if="!searchQuery" :sticky="true">
      <view v-for="letter in letters" :key="letter">
        <wd-index-anchor :index="letter" />
        <view v-for="item in getItemsByLetter(letter)" :key="item.id">
          {{ item.name }}
        </view>
      </view>
    </wd-index-bar>

    <!-- 搜索结果 -->
    <view v-else class="search-results">
      <view v-for="item in searchResults" :key="item.id" class="result-item">
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  return allItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>
```

**说明:**
- 搜索时隐藏索引栏，避免布局冲突
- 搜索结果单独渲染，不使用索引分组
- 提供清晰的视觉切换反馈

### 5. 移动端触摸优化

**推荐做法:**

```vue
<template>
  <wd-index-bar :sticky="true">
    <view v-for="letter in letters" :key="letter">
      <wd-index-anchor :index="letter" />

      <!-- ✅ 列表项添加点击态 -->
      <view
        v-for="item in getItemsByLetter(letter)"
        :key="item.id"
        class="list-item"
        @click="handleItemClick(item)"
      >
        {{ item.name }}
      </view>
    </view>
  </wd-index-bar>
</template>

```

**说明:**
- 为列表项添加点击态，提升触摸反馈
- 索引栏支持滑动手势，无需额外处理
- 避免在触摸事件中阻止默认行为

---

## 常见问题

### 1. 为什么索引栏没有显示？

**问题原因:**
- IndexAnchor 组件未正确渲染
- index 属性未设置或重复
- IndexBar 容器高度为 0

**解决方案:**

```vue
<template>
  <!-- ✅ 确保 IndexBar 有明确的高度 -->
  <view class="page">
    <wd-index-bar :sticky="true" class="index-bar-wrapper">
      <view v-for="letter in letters" :key="letter">
        <!-- ✅ 确保每个 IndexAnchor 都有唯一的 index -->
        <wd-index-anchor :index="letter" />
        <view class="content">内容</view>
      </view>
    </wd-index-bar>
  </view>
</template>

<script lang="ts" setup>
// ✅ 确保 letters 数组不为空
const letters = ['A', 'B', 'C', 'D', 'E']
</script>

```

**说明:**
- 检查 IndexBar 容器是否有高度
- 检查 IndexAnchor 的 index 是否唯一
- 确保 letters 数组有数据

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:22-29, src/wd/components/wd-index-anchor/wd-index-anchor.vue:46

### 2. 吸顶效果不生效怎么办？

**问题原因:**
- sticky 属性未设置为 true
- 父容器没有滚动
- 浏览器不支持 position: sticky

**解决方案:**

```vue
<template>
  <wd-index-bar :sticky="true">
    <view v-for="letter in letters" :key="letter">
      <wd-index-anchor :index="letter" />

      <!-- 确保每个分组有足够的内容，能够滚动 -->
      <view v-for="i in 10" :key="i" class="list-item">
        项目 {{ letter }}{{ i }}
      </view>
    </view>
  </wd-index-bar>
</template>

```

**说明:**
- 确保 `sticky` 属性设置为 `true`
- 确保内容足够多，可以滚动
- 吸顶依赖 `position: sticky`，部分旧浏览器不支持

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:62, src/wd/components/wd-index-anchor/wd-index-anchor.vue:82-84, 150-156

### 3. 点击索引栏没有跳转？

**问题原因:**
- 锚点位置未正确计算
- 内容未正确渲染
- 索引值与锚点 index 不匹配

**解决方案:**

```vue
<template>
  <wd-index-bar>
    <view v-for="letter in letters" :key="letter">
      <!-- ✅ 确保 index 值与右侧索引栏一致 -->
      <wd-index-anchor :index="letter" />

      <!-- ✅ 确保每个分组都有内容 -->
      <view v-if="getItemsByLetter(letter).length > 0">
        <view
          v-for="item in getItemsByLetter(letter)"
          :key="item.id"
          class="list-item"
        >
          {{ item.name }}
        </view>
      </view>
    </view>
  </wd-index-bar>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

// ✅ 页面加载后等待DOM渲染完成
onMounted(() => {
  setTimeout(() => {
    // 确保锚点位置计算完成
  }, 300)
})
</script>
```

**说明:**
- 确保每个索引对应的分组都有内容
- 确保 DOM 渲染完成后再计算位置
- 检查 index 值是否正确

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:126-138, 211-218

### 4. 如何实现索引栏的自定义样式？

**问题原因:**
- 不清楚如何覆盖默认样式
- 深度选择器使用不正确

**解决方案:**

```vue
<template>
  <view class="custom-wrapper">
    <wd-index-bar :sticky="true">
      <view v-for="letter in letters" :key="letter">
        <wd-index-anchor :index="letter" custom-class="my-anchor" />
        <view class="content">内容</view>
      </view>
    </wd-index-bar>
  </view>
</template>

```

**说明:**
- 使用 `:deep()` 深度选择器修改组件内部样式
- 通过 `custom-class` 为锚点添加自定义类名
- 注意样式优先级，必要时使用 `!important`

参考: src/wd/components/wd-index-anchor/wd-index-anchor.vue:42-44

### 5. 如何监听当前激活的索引？

**问题原因:**
- IndexBar 组件未提供 change 事件
- 需要通过其他方式获取当前索引

**解决方案:**

```vue
<template>
  <wd-index-bar :sticky="true">
    <view v-for="letter in letters" :key="letter">
      <wd-index-anchor :index="letter" />

      <!-- 使用 Intersection Observer 或滚动事件监听 -->
      <view
        v-for="item in getItemsByLetter(letter)"
        :key="item.id"
        class="list-item"
      >
        {{ item.name }}
      </view>
    </view>
  </wd-index-bar>

  <!-- 显示当前索引 -->
  <view class="current-index">
    当前: {{ currentIndex }}
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const currentIndex = ref('A')

// 方案1: 通过自定义逻辑跟踪当前索引
const handleScroll = (event: any) => {
  // 根据滚动位置计算当前索引
  // 这需要自己实现逻辑
}

// 方案2: 使用 IndexBar 内部状态（不推荐，组件未暴露）
// IndexBar 内部通过 state.activeIndex 管理当前索引
</script>

```

**说明:**
- IndexBar 组件内部管理激活索引，未暴露事件
- 可以通过滚动监听自行实现索引跟踪
- 或在列表项中使用 Intersection Observer API

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:77-79, 151-172

---

## 注意事项

1. **容器高度必须设置**：IndexBar 组件依赖固定高度的容器才能正常工作，必须为其设置 `height: 100vh` 或固定的像素值，否则索引栏可能无法显示或功能异常。

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:250-252

2. **index 值必须唯一**：每个 IndexAnchor 的 `index` 属性值必须唯一，重复的 index 会导致索引栏显示异常和跳转错误。

参考: src/wd/components/wd-index-anchor/wd-index-anchor.vue:46

3. **吸顶依赖 sticky 定位**：吸顶效果使用 CSS `position: sticky` 实现，部分旧版本浏览器或小程序可能不支持，使用前请确认兼容性。

参考: src/wd/components/wd-index-anchor/wd-index-anchor.vue:150-156

4. **初始化时机**：组件在 `onMounted` 后会计算各个锚点的位置，如果内容是异步加载的，需要在数据加载完成后手动调用 `getInfo` 方法更新位置。

参考: src/wd/components/wd-index-anchor/wd-index-anchor.vue:90-103

5. **触摸事件的阻止**：索引栏的触摸事件使用了 `.stop.prevent` 修饰符，阻止了事件冒泡和默认行为，避免在自定义逻辑中再次阻止。

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:17-20

6. **滚动性能优化**：大数据列表建议按字母分组渲染，避免一次性渲染所有数据导致性能问题。可以考虑使用虚拟列表优化。

7. **index 类型**：index 支持 `number` 和 `string` 类型，可以使用字母、数字、符号或 Emoji 作为索引值，但建议保持简洁（1-2个字符）。

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:55, src/wd/components/wd-index-anchor/wd-index-anchor.vue:22, 46

8. **钉钉小程序特殊处理**：组件对钉钉小程序做了特殊兼容处理，使用了额外的包裹层，其他平台无需关注。

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:4-6, 31-33, src/wd/components/wd-index-anchor/wd-index-anchor.vue:3-5, 15-17, 131-141

9. **自动高亮**：滚动内容时，右侧索引栏会自动高亮当前所在位置的索引，这是通过计算滚动位置和锚点位置实现的。

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:151-172, 265-274

10. **暗色主题**：组件内置暗色主题支持，在根元素添加 `wot-theme-dark` 类名即可启用，索引和锚点颜色会自动适配。

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:238-245, src/wd/components/wd-index-anchor/wd-index-anchor.vue:122-128

11. **位置计算延迟**：组件初始化时会延迟 100ms 计算位置信息，如果页面渲染较慢，可能需要手动调整延迟时间。

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:126-138

12. **滚动容器**：IndexBar 内部使用 `scroll-view` 组件实现滚动，滚动容器的高度自动继承 IndexBar 的高度。

参考: src/wd/components/wd-index-bar/wd-index-bar.vue:7-14, 253-256

---

## 总结

IndexBar 索引栏组件是一个功能完善的列表索引导航组件。通过右侧索引栏和锚点标记，可以实现快速定位和分类展示，提供流畅的触摸交互体验。

**使用建议:**

- 容器必须设置明确的高度
- index 值保持简洁且唯一
- 大数据列表按字母分组渲染
- 合理使用吸顶效果
- 结合搜索功能提升体验

**适用场景:**

- 通讯录列表
- 城市选择器
- 商品分类列表
- 地区选择
- 任何需要字母索引的列表

**性能优化:**

- 使用 computed 缓存分组数据
- 避免一次性渲染大量数据
- 合理使用虚拟列表
- 优化列表项的渲染逻辑

**最佳体验:**

- 提供清晰的视觉层次
- 添加点击态反馈
- 索引栏支持滑动连续切换
- 配合搜索功能使用
- 空状态友好提示
