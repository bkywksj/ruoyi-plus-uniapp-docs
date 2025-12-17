---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/layout/sticky
---

# Sticky 吸顶布局

## 介绍

Sticky (吸顶布局) 是一个粘性定位组件,用于在页面滚动时将元素固定在指定位置。该组件通过监听页面滚动事件,当目标元素到达指定位置时自动将其固定在顶部,常用于导航栏、筛选条、操作栏等需要保持可见的场景。组件支持独立使用或配合 StickyBox 容器使用,提供灵活的吸顶定位能力。

**核心特性:**

- **智能吸顶** - 自动监听滚动位置,到达指定距离时触发吸顶效果
- **可调偏移** - 支持自定义吸顶时距离顶部的偏移距离,适配不同场景
- **层级控制** - 可设置 z-index 层级,避免与其他悬浮元素冲突
- **容器边界** - 配合 StickyBox 使用时,吸顶元素会在容器底部边界处停止固定
- **自适应尺寸** - 使用 Resize 组件监听内容尺寸变化,自动更新布局
- **跨平台兼容** - 针对 H5、小程序、App 等不同平台进行了兼容处理
- **IntersectionObserver** - 使用交叉观察器 API 实现高性能的滚动监听
- **状态暴露** - 暴露粘性状态和方法,便于外部组件进行控制和交互

参考: src/wd/components/wd-sticky/wd-sticky.vue:1-263

## 基本用法

### 基础吸顶

最简单的用法,将内容包裹在 Sticky 组件中,滚动到顶部时自动吸顶固定。

```vue
<template>
  <view class="demo">
    <view class="content">
      <view class="placeholder">向下滚动查看吸顶效果</view>

      <wd-sticky>
        <wd-button type="primary" block>吸顶按钮</wd-button>
      </wd-sticky>

      <view v-for="item in 50" :key="item" class="list-item">
        列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 无需额外配置
</script>

```

**使用说明:**
- Sticky 组件会自动监听页面滚动
- 当内容滚动到顶部时,自动切换为 `position: fixed` 固定定位
- 脱离吸顶状态时,自动恢复为 `position: absolute` 绝对定位

参考: src/wd/components/wd-sticky/wd-sticky.vue:136-160

### 设置偏移距离

通过 `offset-top` 属性设置吸顶时距离顶部的偏移距离,单位为 px。

```vue
<template>
  <view class="demo">
    <view class="content">
      <view class="placeholder">向下滚动查看吸顶效果</view>

      <!-- 距离顶部 80px 时吸顶 -->
      <wd-sticky :offset-top="80">
        <view class="sticky-bar">
          <text>距离顶部 80px</text>
        </view>
      </wd-sticky>

      <!-- 距离顶部 160px 时吸顶 -->
      <wd-sticky :offset-top="160">
        <view class="sticky-bar" style="background: #19be6b;">
          <text>距离顶部 160px</text>
        </view>
      </wd-sticky>

      <view v-for="item in 50" :key="item" class="list-item">
        列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// offset-top 单位为 px
</script>

```

**使用说明:**
- `offset-top` 属性指定吸顶时距离顶部的距离,单位为 px
- 多个 Sticky 组件可以设置不同的 `offset-top` 值,形成层叠吸顶效果
- H5 端会自动加上导航栏高度(44px)进行计算

参考: src/wd/components/wd-sticky/wd-sticky.vue:42-44, 120-131

### 设置层级

通过 `z-index` 属性设置吸顶元素的层级,避免与其他悬浮元素冲突。

```vue
<template>
  <view class="demo">
    <view class="content">
      <view class="placeholder">向下滚动查看吸顶效果</view>

      <!-- 较低层级 -->
      <wd-sticky :z-index="10">
        <view class="sticky-bar" style="background: #ff6b6b;">
          <text>层级 10</text>
        </view>
      </wd-sticky>

      <!-- 较高层级 -->
      <wd-sticky :z-index="100" :offset-top="50">
        <view class="sticky-bar" style="background: #4d80f0;">
          <text>层级 100</text>
        </view>
      </wd-sticky>

      <view v-for="item in 50" :key="item" class="list-item">
        列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// z-index 默认值为 1
</script>

```

**使用说明:**
- `z-index` 属性控制吸顶元素的层叠顺序
- 多个吸顶元素重叠时,z-index 值较大的会显示在上层
- 默认 z-index 为 1,可根据实际需求调整

参考: src/wd/components/wd-sticky/wd-sticky.vue:41, 69, 200-210, 215-225

### 配合容器使用

配合 StickyBox 容器使用,吸顶元素会在容器底部边界处停止固定,实现更精细的吸顶控制。

```vue
<template>
  <view class="demo">
    <view class="content">
      <view class="placeholder">向下滚动查看吸顶效果</view>

      <!-- StickyBox 容器 -->
      <wd-sticky-box>
        <wd-sticky>
          <view class="sticky-bar">
            <text>在容器内吸顶</text>
          </view>
        </wd-sticky>

        <view class="box-content">
          <view v-for="item in 20" :key="item" class="content-item">
            容器内容 {{ item }}
          </view>
        </view>
      </wd-sticky-box>

      <view v-for="item in 30" :key="item" class="list-item">
        外部列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// StickyBox 为 Sticky 提供边界容器
</script>

```

**使用说明:**
- StickyBox 为 Sticky 提供相对定位的边界容器
- 吸顶元素滚动到容器底部时,会自动停止固定
- 适用于需要限制吸顶范围的场景,如列表分组、模块区域等

**技术实现:**
- StickyBox 使用 `useChildren` 和 `useParent` 建立父子组件通信
- 通过 IntersectionObserver 监听容器与视口的交叉状态
- 当容器底部到达视口顶部时,将 Sticky 切换为绝对定位

参考: src/wd/components/wd-sticky/wd-sticky.vue:86, 136-142
参考: src/wd/components/wd-sticky-box/wd-sticky-box.vue:1-187

### 自定义样式

通过 `custom-class` 和 `custom-style` 自定义吸顶元素的样式。

```vue
<template>
  <view class="demo">
    <view class="content">
      <view class="placeholder">向下滚动查看吸顶效果</view>

      <wd-sticky
        custom-class="custom-sticky"
        custom-style="border-radius: 16rpx; overflow: hidden;"
      >
        <view class="sticky-card">
          <view class="card-title">自定义样式</view>
          <view class="card-content">
            <text>这是一个圆角卡片样式的吸顶元素</text>
          </view>
        </view>
      </wd-sticky>

      <view v-for="item in 50" :key="item" class="list-item">
        列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 可通过 custom-class 和 custom-style 自定义样式
</script>

```

**使用说明:**
- `custom-class` 添加自定义 CSS 类名
- `custom-style` 添加内联样式
- 可实现圆角、阴影、渐变等各种视觉效果

参考: src/wd/components/wd-sticky/wd-sticky.vue:35-38, 200-210

### 筛选条吸顶

实现常见的商品筛选条吸顶效果,包含多个筛选项。

```vue
<template>
  <view class="demo">
    <view class="content">
      <!-- 顶部区域 -->
      <view class="header">
        <image
          class="banner"
          src="https://via.placeholder.com/750x300"
          mode="widthFix"
        />
      </view>

      <!-- 吸顶筛选条 -->
      <wd-sticky :z-index="10">
        <view class="filter-bar">
          <view
            v-for="item in filters"
            :key="item.id"
            class="filter-item"
            :class="{ active: activeFilter === item.id }"
            @click="handleFilterClick(item.id)"
          >
            <text>{{ item.label }}</text>
            <wd-icon v-if="item.hasArrow" name="arrow-down" size="20rpx" />
          </view>
        </view>
      </wd-sticky>

      <!-- 商品列表 -->
      <view class="goods-list">
        <view v-for="item in 20" :key="item" class="goods-item">
          <image
            class="goods-image"
            src="https://via.placeholder.com/200"
            mode="aspectFill"
          />
          <view class="goods-info">
            <view class="goods-name">商品名称 {{ item }}</view>
            <view class="goods-price">¥99.00</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeFilter = ref('default')

const filters = [
  { id: 'default', label: '综合', hasArrow: false },
  { id: 'sales', label: '销量', hasArrow: true },
  { id: 'price', label: '价格', hasArrow: true },
  { id: 'filter', label: '筛选', hasArrow: false },
]

const handleFilterClick = (id: string) => {
  activeFilter.value = id
}
</script>

```

**使用说明:**
- 筛选条包含多个筛选项,可切换激活状态
- 结合图标组件实现更丰富的视觉效果
- 适用于电商、内容平台等需要筛选功能的场景

参考: src/wd/components/wd-sticky/wd-sticky.vue:1-263

## 进阶用法

### 多个吸顶元素

在 StickyBox 容器中使用多个 Sticky 元素,实现层叠吸顶效果。

```vue
<template>
  <view class="demo">
    <view class="content">
      <view class="placeholder">向下滚动查看多个吸顶效果</view>

      <wd-sticky-box>
        <!-- 第一个吸顶元素 -->
        <wd-sticky>
          <view class="sticky-bar bar-1">
            <text>第一个吸顶元素</text>
          </view>
        </wd-sticky>

        <view class="section">
          <view v-for="item in 10" :key="`section1-${item}`" class="section-item">
            第一部分内容 {{ item }}
          </view>
        </view>

        <!-- 第二个吸顶元素 -->
        <wd-sticky :offset-top="44">
          <view class="sticky-bar bar-2">
            <text>第二个吸顶元素</text>
          </view>
        </wd-sticky>

        <view class="section">
          <view v-for="item in 10" :key="`section2-${item}`" class="section-item">
            第二部分内容 {{ item }}
          </view>
        </view>

        <!-- 第三个吸顶元素 -->
        <wd-sticky :offset-top="88">
          <view class="sticky-bar bar-3">
            <text>第三个吸顶元素</text>
          </view>
        </wd-sticky>

        <view class="section">
          <view v-for="item in 10" :key="`section3-${item}`" class="section-item">
            第三部分内容 {{ item }}
          </view>
        </view>
      </wd-sticky-box>

      <view v-for="item in 20" :key="item" class="list-item">
        外部列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 多个 Sticky 元素通过设置不同的 offset-top 形成层叠效果
</script>

```

**使用说明:**
- 在 StickyBox 中可以放置多个 Sticky 元素
- 每个 Sticky 可以设置不同的 `offset-top` 值
- 滚动时会依次吸顶,到达容器底部时会依次释放

**技术实现:**
- StickyBox 使用 Map 存储对每个子 Sticky 的观察器
- 每个 Sticky 都会向 StickyBox 注册,并建立独立的监听
- 通过 `uid` 标识不同的 Sticky 实例

参考: src/wd/components/wd-sticky-box/wd-sticky-box.vue:50, 59-80, 111-140

### 暴露状态和方法

使用组件实例暴露的状态和方法,实现更灵活的控制。

```vue
<template>
  <view class="demo">
    <view class="content">
      <!-- 状态显示面板 -->
      <view class="status-panel">
        <view class="status-item">
          <text class="label">位置状态:</text>
          <text class="value">{{ stickyState.position }}</text>
        </view>
        <view class="status-item">
          <text class="label">吸顶状态:</text>
          <text class="value">{{ stickyState.state || 'normal' }}</text>
        </view>
        <view class="status-item">
          <text class="label">顶部距离:</text>
          <text class="value">{{ stickyState.top }}px</text>
        </view>
        <view class="status-item">
          <text class="label">元素高度:</text>
          <text class="value">{{ stickyState.height }}px</text>
        </view>
      </view>

      <view class="placeholder">向下滚动查看吸顶效果</view>

      <!-- 吸顶元素 -->
      <wd-sticky ref="stickyRef">
        <view class="sticky-bar">
          <text>监听我的状态变化</text>
        </view>
      </wd-sticky>

      <view v-for="item in 50" :key="item" class="list-item">
        列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { StickyInstance } from '@/wd/components/wd-sticky/wd-sticky.vue'

const stickyRef = ref<StickyInstance>()

// 吸顶状态
const stickyState = ref({
  position: 'absolute',
  state: '',
  top: 0,
  height: 0,
})

// 获取吸顶状态
const getStickyState = () => {
  if (stickyRef.value) {
    const state = stickyRef.value.stickyState
    stickyState.value = {
      position: state.position,
      state: state.state,
      top: state.top,
      height: state.height,
    }
  }
}

onMounted(() => {
  // 定时获取状态
  setInterval(() => {
    getStickyState()
  }, 100)
})
</script>

```

**使用说明:**
- 通过 `ref` 获取组件实例
- `stickyState` 包含当前的粘性状态信息
- `setPosition` 方法可手动设置粘性位置

**暴露的属性和方法:**
- `stickyState.position`: 定位方式 ('absolute' | 'fixed')
- `stickyState.state`: 吸顶状态 ('normal' | 'sticky')
- `stickyState.top`: 顶部距离
- `stickyState.height`: 元素高度
- `stickyState.width`: 元素宽度
- `stickyState.boxLeaved`: 是否离开容器
- `setPosition(boxLeaved, position, top)`: 手动设置位置

参考: src/wd/components/wd-sticky/wd-sticky.vue:49-63, 77-84, 114-118, 239-243

### 导航栏吸顶

实现商品详情页的导航栏吸顶效果,包含多个 Tab 切换。

```vue
<template>
  <view class="demo">
    <view class="content">
      <!-- 商品信息区域 -->
      <view class="product-info">
        <image
          class="product-image"
          src="https://via.placeholder.com/750x750"
          mode="widthFix"
        />
        <view class="info-box">
          <view class="product-name">高品质商品名称</view>
          <view class="product-price">¥199.00</view>
          <view class="product-desc">这是一段商品描述信息</view>
        </view>
      </view>

      <!-- 吸顶导航栏 -->
      <wd-sticky :z-index="10">
        <view class="tab-bar">
          <view
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-item"
            :class="{ active: activeTab === tab.id }"
            @click="handleTabClick(tab.id)"
          >
            <text>{{ tab.label }}</text>
          </view>
        </view>
      </wd-sticky>

      <!-- 内容区域 -->
      <view class="tab-content">
        <view v-if="activeTab === 'detail'" class="detail-section">
          <view class="section-title">商品详情</view>
          <view v-for="item in 10" :key="item" class="detail-item">
            <text>详情内容 {{ item }}</text>
          </view>
        </view>

        <view v-if="activeTab === 'params'" class="params-section">
          <view class="section-title">规格参数</view>
          <view v-for="item in 8" :key="item" class="param-item">
            <text class="param-label">参数名称 {{ item }}</text>
            <text class="param-value">参数值 {{ item }}</text>
          </view>
        </view>

        <view v-if="activeTab === 'reviews'" class="reviews-section">
          <view class="section-title">用户评价</view>
          <view v-for="item in 6" :key="item" class="review-item">
            <view class="review-user">用户 {{ item }}</view>
            <view class="review-content">这是一条用户评价内容</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref('detail')

const tabs = [
  { id: 'detail', label: '商品详情' },
  { id: 'params', label: '规格参数' },
  { id: 'reviews', label: '用户评价' },
]

const handleTabClick = (id: string) => {
  activeTab.value = id
}
</script>

```

**使用说明:**
- 适用于商品详情、文章详情等页面的导航吸顶
- Tab 栏吸顶后保持可见,方便切换内容
- 结合条件渲染实现内容切换

参考: src/wd/components/wd-sticky/wd-sticky.vue:1-263

### 列表分组吸顶

实现通讯录列表的分组标题吸顶效果。

```vue
<template>
  <view class="demo">
    <view class="content">
      <view class="header">
        <view class="search-bar">
          <wd-icon name="search" size="32rpx" />
          <text>搜索联系人</text>
        </view>
      </view>

      <wd-sticky-box>
        <view v-for="group in contactGroups" :key="group.letter" class="contact-group">
          <wd-sticky>
            <view class="group-title">
              <text>{{ group.letter }}</text>
            </view>
          </wd-sticky>

          <view class="contact-list">
            <view
              v-for="contact in group.contacts"
              :key="contact.id"
              class="contact-item"
              @click="handleContactClick(contact)"
            >
              <image
                class="avatar"
                :src="contact.avatar"
                mode="aspectFill"
              />
              <view class="contact-info">
                <view class="contact-name">{{ contact.name }}</view>
                <view class="contact-phone">{{ contact.phone }}</view>
              </view>
            </view>
          </view>
        </view>
      </wd-sticky-box>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Contact {
  id: number
  name: string
  phone: string
  avatar: string
}

const contactGroups = ref([
  {
    letter: 'A',
    contacts: [
      { id: 1, name: 'Alice', phone: '138****1234', avatar: 'https://via.placeholder.com/80' },
      { id: 2, name: 'Andy', phone: '138****5678', avatar: 'https://via.placeholder.com/80' },
    ]
  },
  {
    letter: 'B',
    contacts: [
      { id: 3, name: 'Bob', phone: '139****1234', avatar: 'https://via.placeholder.com/80' },
      { id: 4, name: 'Ben', phone: '139****5678', avatar: 'https://via.placeholder.com/80' },
    ]
  },
  {
    letter: 'C',
    contacts: [
      { id: 5, name: 'Cathy', phone: '136****1234', avatar: 'https://via.placeholder.com/80' },
      { id: 6, name: 'Chris', phone: '136****5678', avatar: 'https://via.placeholder.com/80' },
    ]
  },
  // ... 更多分组
])

const handleContactClick = (contact: Contact) => {
  console.log('点击联系人:', contact)
}
</script>

```

**使用说明:**
- 每个分组标题使用单独的 Sticky 包裹
- 滚动时,当前分组标题吸顶显示
- 适用于通讯录、城市列表等分组列表场景

参考: src/wd/components/wd-sticky/wd-sticky.vue:1-263

### 响应式尺寸变化

Sticky 组件集成了 Resize 组件,自动响应内容尺寸变化。

```vue
<template>
  <view class="demo">
    <view class="content">
      <view class="placeholder">向下滚动查看吸顶效果</view>

      <wd-sticky>
        <view class="sticky-bar" :style="{ height: barHeight + 'rpx' }">
          <text>动态高度吸顶元素</text>
          <wd-button
            size="small"
            @click="toggleHeight"
          >
            切换高度
          </wd-button>
        </view>
      </wd-sticky>

      <view v-for="item in 50" :key="item" class="list-item">
        列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const barHeight = ref(88)

const toggleHeight = () => {
  barHeight.value = barHeight.value === 88 ? 120 : 88
}
</script>

```

**使用说明:**
- Sticky 内部使用 Resize 组件监听尺寸变化
- 当内容高度或宽度改变时,自动重新计算吸顶位置
- 无需手动处理尺寸变化

**技术实现:**
- `handleResize` 方法在尺寸变化时触发
- 更新 `stickyState` 的宽高值
- 重新调用 `observerContentScroll` 更新监听器

参考: src/wd/components/wd-sticky/wd-sticky.vue:6-8, 188-195

### 平台兼容处理

Sticky 组件针对不同平台进行了兼容处理,确保跨平台一致性。

```vue
<template>
  <view class="demo">
    <view class="content">
      <!-- H5 端会自动加上导航栏高度 44px -->
      <view class="platform-info">
        <view class="info-item">
          <text class="label">当前平台:</text>
          <text class="value">{{ platform }}</text>
        </view>
        <view class="info-item">
          <text class="label">导航栏高度:</text>
          <text class="value">{{ navBarHeight }}px</text>
        </view>
      </view>

      <view class="placeholder">向下滚动查看吸顶效果</view>

      <!-- 组件会自动处理平台差异 -->
      <wd-sticky :offset-top="0">
        <view class="sticky-bar">
          <text>跨平台兼容的吸顶元素</text>
        </view>
      </wd-sticky>

      <view v-for="item in 50" :key="item" class="list-item">
        列表项 {{ item }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const platform = ref('')
const navBarHeight = ref(0)

onMounted(() => {
  // #ifdef H5
  platform.value = 'H5'
  navBarHeight.value = 44
  // #endif

  // #ifdef MP-WEIXIN
  platform.value = '微信小程序'
  navBarHeight.value = 0
  // #endif

  // #ifdef APP-PLUS
  platform.value = 'App'
  navBarHeight.value = 0
  // #endif
})
</script>

```

**平台差异处理:**
- **H5 端**: 导航栏为普通元素,需要加上导航栏高度 44px
- **小程序**: 导航栏不占据页面空间,无需额外处理
- **App**: 使用原生导航栏,无需额外处理

**兼容代码:**
```typescript
// #ifdef H5
// H5端,导航栏为普通元素,需要将组件移动到导航栏的下边沿
// H5的导航栏高度为44px
top = 44
// #endif
```

参考: src/wd/components/wd-sticky/wd-sticky.vue:124-130, 145-147, 177-180

## API

### Sticky Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `offset-top` | 吸顶时距离顶部的偏移距离,单位 px | `number` | `0` |
| `z-index` | 吸顶时的层级 | `number` | `1` |
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-style` | 自定义根节点内联样式 | `string` | `''` |

参考: src/wd/components/wd-sticky/wd-sticky.vue:34-44, 66-71

### StickyBox Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `custom-class` | 自定义根节点样式类 | `string` | `''` |
| `custom-style` | 自定义根节点内联样式 | `string` | `''` |

参考: src/wd/components/wd-sticky-box/wd-sticky-box.vue:34-40, 43-46

### Sticky Expose

| 属性/方法 | 说明 | 类型 |
|-----------|------|------|
| `stickyState` | 粘性状态对象 | `object` |
| `stickyState.position` | 定位方式 | `'absolute' \| 'fixed'` |
| `stickyState.state` | 吸顶状态 | `'normal' \| 'sticky' \| ''` |
| `stickyState.top` | 顶部距离,单位 px | `number` |
| `stickyState.height` | 元素高度,单位 px | `number` |
| `stickyState.width` | 元素宽度,单位 px | `number` |
| `stickyState.boxLeaved` | 是否离开容器 | `boolean` |
| `offsetTop` | 偏移顶部距离,单位 px | `number` |
| `setPosition` | 手动设置位置 | `(boxLeaved: boolean, position: string, top: number) => void` |

参考: src/wd/components/wd-sticky/wd-sticky.vue:49-63, 77-84, 114-118, 239-243

### 类型定义

```typescript
/**
 * 粘性布局组件属性接口
 */
interface WdStickyProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 层级 */
  zIndex?: number
  /** 吸顶距离 */
  offsetTop?: number
}

/**
 * 粘性定位组件暴露方法接口
 */
interface WdStickyExpose {
  /** 设置位置 */
  setPosition: (boxLeaved: boolean, position: string, top: number) => void
  /** 粘性状态 */
  stickyState: {
    position: string
    boxLeaved: boolean
    top: number
    height: number
    width: number
    state: string
  }
  /** 偏移顶部距离 */
  offsetTop: number
}

/**
 * 吸顶容器组件属性接口
 */
interface WdStickyBoxProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
}

/** 粘性定位组件实例类型 */
type StickyInstance = ComponentPublicInstance<WdStickyProps, WdStickyExpose>
```

参考: src/wd/components/wd-sticky/wd-sticky.vue:31-63, 245-246
参考: src/wd/components/wd-sticky-box/wd-sticky-box.vue:32-40

## 主题定制

### CSS 变量

Sticky 组件支持通过 CSS 变量进行主题定制:

```scss
// 粘性布局组件没有特定的 CSS 变量
// 可以通过 custom-class 和 custom-style 自定义样式
```

### 自定义样式示例

```vue
<template>
  <wd-sticky
    custom-class="custom-sticky"
    custom-style="box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
  >
    <view class="custom-content">
      自定义样式的吸顶元素
    </view>
  </wd-sticky>
</template>

<style lang="scss">
.custom-sticky {
  border-radius: 16rpx;
  overflow: hidden;
  margin: 0 32rpx;
}

.custom-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 32rpx;
  font-size: 32rpx;
}
</style>
```

参考: src/wd/components/wd-sticky/wd-sticky.vue:249-262

## 最佳实践

### 1. 合理设置层级

✅ **推荐做法:**
```vue
<template>
  <!-- 导航栏层级较高 -->
  <wd-sticky :z-index="100">
    <view class="navbar">导航栏</view>
  </wd-sticky>

  <!-- 筛选条层级适中 -->
  <wd-sticky :z-index="10">
    <view class="filter">筛选条</view>
  </wd-sticky>
</template>
```

❌ **不推荐做法:**
```vue
<template>
  <!-- 所有吸顶元素使用相同层级,可能导致遮挡问题 -->
  <wd-sticky>
    <view class="navbar">导航栏</view>
  </wd-sticky>

  <wd-sticky>
    <view class="filter">筛选条</view>
  </wd-sticky>
</template>
```

**说明:**
- 根据元素重要性设置不同的 z-index
- 避免所有吸顶元素使用相同层级
- 预留足够的层级空间,避免与其他悬浮元素冲突

### 2. 配合容器限制范围

✅ **推荐做法:**
```vue
<template>
  <!-- 使用 StickyBox 限制吸顶范围 -->
  <wd-sticky-box>
    <wd-sticky>
      <view class="section-title">分组标题</view>
    </wd-sticky>
    <view class="section-content">
      <!-- 分组内容 -->
    </view>
  </wd-sticky-box>
</template>
```

❌ **不推荐做法:**
```vue
<template>
  <!-- 不使用容器,吸顶元素会一直固定在顶部 -->
  <wd-sticky>
    <view class="section-title">分组标题</view>
  </wd-sticky>
  <view class="section-content">
    <!-- 分组内容 -->
  </view>
</template>
```

**说明:**
- 需要限制吸顶范围时,使用 StickyBox 容器
- 适用于列表分组、模块区域等场景
- 可以实现更精细的吸顶控制

### 3. 避免频繁切换

✅ **推荐做法:**
```vue
<template>
  <wd-sticky>
    <!-- 保持结构稳定 -->
    <view class="stable-bar">
      <text>{{ dynamicText }}</text>
    </view>
  </wd-sticky>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dynamicText = ref('初始文本')

// 只更新文本内容,不改变结构
const updateText = () => {
  dynamicText.value = '更新后的文本'
}
</script>
```

❌ **不推荐做法:**
```vue
<template>
  <!-- 频繁添加/移除吸顶元素 -->
  <wd-sticky v-if="showSticky">
    <view class="unstable-bar">
      <text>{{ dynamicText }}</text>
    </view>
  </wd-sticky>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSticky = ref(true)

// 频繁切换会导致性能问题
const toggleSticky = () => {
  showSticky.value = !showSticky.value
}
</script>
```

**说明:**
- 保持 Sticky 组件结构稳定,避免频繁添加/移除
- 通过更新内容而非切换组件来实现动态效果
- 频繁切换会导致监听器的反复创建和销毁,影响性能

### 4. 注意内容高度

✅ **推荐做法:**
```vue
<template>
  <wd-sticky-box>
    <!-- 吸顶元素高度小于容器高度 -->
    <wd-sticky>
      <view class="small-bar" style="height: 88rpx;">
        标题栏
      </view>
    </wd-sticky>

    <view class="large-content" style="min-height: 800rpx;">
      <!-- 足够的内容高度 -->
    </view>
  </wd-sticky-box>
</template>
```

❌ **不推荐做法:**
```vue
<template>
  <wd-sticky-box>
    <!-- 吸顶元素高度大于容器高度,吸顶无意义 -->
    <wd-sticky>
      <view class="large-bar" style="height: 800rpx;">
        超大标题栏
      </view>
    </wd-sticky>

    <view class="small-content" style="height: 100rpx;">
      内容
    </view>
  </wd-sticky-box>
</template>
```

**说明:**
- 使用 StickyBox 时,确保吸顶元素高度小于容器高度
- 吸顶元素高度 ≥ 容器高度时,会自动切换为绝对定位
- 确保容器有足够的内容高度,否则吸顶效果不明显

### 5. 优化滚动性能

✅ **推荐做法:**
```vue
<template>
  <view class="demo">
    <!-- 合理的吸顶元素数量 -->
    <wd-sticky-box>
      <wd-sticky>
        <view class="group-1">分组1</view>
      </wd-sticky>
      <view class="content-1"><!-- 内容 --></view>

      <wd-sticky>
        <view class="group-2">分组2</view>
      </wd-sticky>
      <view class="content-2"><!-- 内容 --></view>
    </wd-sticky-box>
  </view>
</template>
```

❌ **不推荐做法:**
```vue
<template>
  <view class="demo">
    <!-- 过多的吸顶元素会影响性能 -->
    <wd-sticky-box>
      <view v-for="item in 100" :key="item">
        <wd-sticky>
          <view class="group">分组 {{ item }}</view>
        </wd-sticky>
        <view class="content"><!-- 内容 --></view>
      </view>
    </wd-sticky-box>
  </view>
</template>
```

**说明:**
- 控制吸顶元素数量,避免创建过多监听器
- 每个 Sticky 都会创建 IntersectionObserver,过多会影响性能
- 对于大量分组,考虑使用虚拟列表或其他优化方案

## 常见问题

### 1. 吸顶效果不生效

**问题原因:**
- 页面没有滚动容器
- 滚动容器高度设置不正确
- 内容高度不足,无法触发滚动

**解决方案:**

```vue
<template>
  <!-- 确保有滚动容器 -->
  <view class="page" style="height: 100vh; overflow-y: auto;">
    <wd-sticky>
      <view class="sticky-bar">吸顶元素</view>
    </wd-sticky>

    <!-- 确保内容高度足够 -->
    <view class="content" style="min-height: 2000rpx;">
      <!-- 内容 -->
    </view>
  </view>
</template>
```

参考: src/wd/components/wd-sticky/wd-sticky.vue:102-106, 165-183

### 2. H5 端吸顶位置不准确

**问题原因:**
- H5 端导航栏为普通元素,占据页面空间
- 组件已自动加上导航栏高度 44px,但自定义偏移时需注意

**解决方案:**

```vue
<template>
  <!-- H5 端会自动加上导航栏高度 -->
  <wd-sticky :offset-top="0">
    <view class="sticky-bar">
      这会距离顶部 44px (H5端)
    </view>
  </wd-sticky>

  <!-- 如果需要更大偏移,在原有基础上增加 -->
  <wd-sticky :offset-top="50">
    <view class="sticky-bar">
      这会距离顶部 94px (H5端: 44 + 50)
    </view>
  </wd-sticky>
</template>
```

**技术说明:**
```typescript
// H5端自动加上导航栏高度
// #ifdef H5
top = 44
// #endif
return top + props.offsetTop
```

参考: src/wd/components/wd-sticky/wd-sticky.vue:122-131

### 3. 在容器中吸顶元素一直是绝对定位

**问题原因:**
- 吸顶元素高度大于或等于 StickyBox 容器高度
- 此时吸顶无意义,自动切换为绝对定位

**解决方案:**

```vue
<template>
  <wd-sticky-box>
    <!-- 确保吸顶元素高度小于容器高度 -->
    <wd-sticky>
      <view class="small-bar" style="height: 88rpx;">
        吸顶元素(高度: 88rpx)
      </view>
    </wd-sticky>

    <!-- 确保容器有足够的内容 -->
    <view class="content" style="min-height: 1200rpx;">
      容器内容
    </view>
  </wd-sticky-box>
</template>
```

**技术说明:**
```typescript
// sticky 高度大于或等于 wd-sticky-box,使用 wd-sticky-box 无任何意义
if (stickyBox && stickyBox.boxStyle && stickyState.height >= stickyBox.boxStyle.height) {
  stickyState.position = 'absolute'
  stickyState.top = 0
  return
}
```

参考: src/wd/components/wd-sticky/wd-sticky.vue:136-142

### 4. 多个吸顶元素层叠显示不正确

**问题原因:**
- 多个吸顶元素的 z-index 设置不合理
- offset-top 设置冲突导致重叠

**解决方案:**

```vue
<template>
  <wd-sticky-box>
    <!-- 第一个吸顶元素: z-index较高, offset-top为0 -->
    <wd-sticky :z-index="10" :offset-top="0">
      <view class="bar-1" style="height: 88rpx;">
        第一个(高度88rpx, 距顶0px)
      </view>
    </wd-sticky>

    <view class="section-1"><!-- 内容1 --></view>

    <!-- 第二个吸顶元素: z-index较低, offset-top为88 -->
    <wd-sticky :z-index="9" :offset-top="88">
      <view class="bar-2" style="height: 88rpx;">
        第二个(高度88rpx, 距顶88px)
      </view>
    </wd-sticky>

    <view class="section-2"><!-- 内容2 --></view>
  </wd-sticky-box>
</template>
```

**注意事项:**
- 第二个元素的 `offset-top` 应该 ≥ 第一个元素的高度
- 先吸顶的元素 z-index 应该更高
- 计算偏移时要考虑前面元素的累计高度

参考: src/wd/components/wd-sticky/wd-sticky.vue:200-210, 215-225

### 5. 内容尺寸变化后吸顶位置错乱

**问题原因:**
- 虽然 Sticky 集成了 Resize 组件,但某些情况下可能需要手动触发更新
- 异步加载内容导致尺寸计算时机不对

**解决方案:**

```vue
<template>
  <wd-sticky ref="stickyRef">
    <view class="dynamic-bar">
      <image
        v-if="showImage"
        src="https://via.placeholder.com/750x200"
        mode="widthFix"
        @load="handleImageLoad"
      />
      <text>动态内容</text>
    </view>
  </wd-sticky>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import type { StickyInstance } from '@/wd/components/wd-sticky/wd-sticky.vue'

const stickyRef = ref<StickyInstance>()
const showImage = ref(false)

// 图片加载完成后,等待下一帧
const handleImageLoad = async () => {
  await nextTick()
  // Resize 组件会自动触发 handleResize
  // 通常不需要手动处理
}

// 异步加载内容
setTimeout(() => {
  showImage.value = true
}, 1000)
</script>
```

**技术说明:**
- Sticky 内部使用 Resize 组件监听尺寸变化
- 尺寸变化时会自动调用 `handleResize` 方法
- 该方法会重新计算吸顶位置并更新监听器

参考: src/wd/components/wd-sticky/wd-sticky.vue:6-8, 188-195

## 注意事项

1. **滚动容器**: Sticky 需要在有滚动能力的容器中使用,确保页面或父容器设置了 `overflow-y: auto` 和固定高度。

2. **IntersectionObserver**: 组件使用 IntersectionObserver API 进行滚动监听,部分旧版浏览器可能不支持。

3. **平台差异**: H5 端会自动加上导航栏高度 44px,设置 `offset-top` 时需注意实际偏移量为 `44 + offsetTop`。

4. **容器高度**: 使用 StickyBox 时,确保吸顶元素高度小于容器高度,否则吸顶功能无效。

5. **层级管理**: 多个吸顶元素需要合理设置 z-index,避免层叠显示错乱。

6. **性能优化**: 避免创建过多 Sticky 实例,每个实例都会创建独立的监听器,过多会影响性能。

7. **offset-top 单位**: `offset-top` 属性的单位为 px(像素),不是 rpx。

8. **尺寸自适应**: 组件会自动监听内容尺寸变化,无需手动处理,但异步加载内容时要确保在内容加载完成后再显示。

9. **状态暴露**: 可以通过组件实例的 `stickyState` 获取当前吸顶状态,用于实现自定义交互逻辑。

10. **父子通信**: Sticky 和 StickyBox 通过 `useParent` 和 `useChildren` 建立通信,修改源码时需注意保持通信机制完整。

11. **监听器管理**: 组件内部会自动管理 IntersectionObserver 的创建和销毁,无需手动干预。

12. **绝对定位**: 非吸顶状态下使用 `position: absolute`,需要确保父容器有相对定位(`position: relative`)。

参考: src/wd/components/wd-sticky/wd-sticky.vue:1-263
参考: src/wd/components/wd-sticky-box/wd-sticky-box.vue:1-187
