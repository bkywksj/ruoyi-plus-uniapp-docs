---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/navigation/tabs
---

# Tabs 标签页

## 介绍

Tabs 标签页组件是一个功能强大的内容切换组件，用于在多个平行内容区域之间切换展示。

**核心特性:**

- **双模式支持** - Items 数组模式和 WdTab 子组件模式
- **智能滑动** - 标签数量超过阈值时自动启用横向滚动
- **地图导航** - 标签过多时显示全部标签的宫格地图视图
- **粘性布局** - 支持吸顶效果
- **手势滑动** - 支持左右滑动切换标签页
- **懒加载机制** - 支持标签内容懒加载
- **徽标集成** - 内置 Badge 徽标组件
- **禁用状态** - 支持禁用特定标签

## 基本用法

### 子组件模式

```vue
<template>
  <wd-tabs v-model="activeTab">
    <wd-tab title="标签1">
      <view class="tab-content">标签1的内容</view>
    </wd-tab>
    <wd-tab title="标签2">
      <view class="tab-content">标签2的内容</view>
    </wd-tab>
    <wd-tab title="标签3">
      <view class="tab-content">标签3的内容</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>
```

**使用说明:**
- `v-model` 绑定激活的标签索引或 name 值
- 每个 `wd-tab` 通过 `title` 属性设置标签标题
- 子组件模式适合内容结构清晰、标签数量固定的场景

### Items 数组模式

```vue
<template>
  <wd-tabs v-model="activeTab" :items="tabItems">
    <template #default="{ item, index }">
      <view class="tab-content">
        {{ item.title }}的内容 (索引: {{ index }})
      </view>
    </template>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabItem } from '@/wd/components/wd-tabs/wd-tabs-key'

const activeTab = ref(0)

const tabItems: TabItem[] = [
  { title: '首页' },
  { title: '推荐' },
  { title: '热门' },
  { title: '关注' },
]
</script>
```

### 指定 name 标识

```vue
<template>
  <wd-tabs v-model="activeTab">
    <wd-tab name="home" title="首页">
      <view class="tab-content">首页内容</view>
    </wd-tab>
    <wd-tab name="category" title="分类">
      <view class="tab-content">分类内容</view>
    </wd-tab>
    <wd-tab name="cart" title="购物车">
      <view class="tab-content">购物车内容</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref('home')
</script>
```

### 禁用标签

```vue
<template>
  <wd-tabs v-model="activeTab" @disabled="handleDisabled">
    <wd-tab title="标签1">
      <view class="tab-content">标签1的内容</view>
    </wd-tab>
    <wd-tab title="标签2（禁用）" :disabled="true">
      <view class="tab-content">标签2的内容</view>
    </wd-tab>
    <wd-tab title="标签3">
      <view class="tab-content">标签3的内容</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)

const handleDisabled = (event: { index: number; name: string | number }) => {
  console.log(`标签 ${event.name} 已禁用`)
}
</script>
```

### 徽标提示

```vue
<template>
  <wd-tabs v-model="activeTab">
    <wd-tab title="消息" :badge-props="{ value: 5 }">
      <view class="tab-content">消息列表</view>
    </wd-tab>
    <wd-tab title="通知" :badge-props="{ isDot: true }">
      <view class="tab-content">通知列表</view>
    </wd-tab>
    <wd-tab title="待办" :badge-props="{ value: '99+' }">
      <view class="tab-content">待办事项</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>
```

### 自定义颜色和指示线

```vue
<template>
  <!-- 自定义颜色 -->
  <wd-tabs v-model="activeTab1" color="#07c160" inactive-color="#999">
    <wd-tab title="首页">内容</wd-tab>
    <wd-tab title="分类">内容</wd-tab>
  </wd-tabs>

  <!-- 自动宽度指示线 -->
  <wd-tabs v-model="activeTab2" :auto-line-width="true">
    <wd-tab title="首页">内容</wd-tab>
    <wd-tab title="分类导航">内容</wd-tab>
  </wd-tabs>

  <!-- 自定义指示线 -->
  <wd-tabs v-model="activeTab3" :line-width="60" :line-height="6">
    <wd-tab title="首页">内容</wd-tab>
    <wd-tab title="分类">内容</wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
</script>
```

## 高级用法

### 横向滚动

```vue
<template>
  <!-- 自动滚动（超过6个） -->
  <wd-tabs v-model="activeTab1" :slidable-num="6">
    <wd-tab v-for="i in 10" :key="i" :title="`标签${i}`">
      <view class="tab-content">标签 {{ i }} 的内容</view>
    </wd-tab>
  </wd-tabs>

  <!-- 始终滚动 -->
  <wd-tabs v-model="activeTab2" slidable="always">
    <wd-tab v-for="i in 4" :key="i" :title="`标签${i}`">
      <view class="tab-content">标签 {{ i }} 的内容</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
</script>
```

**使用说明:**
- `slidableNum` 设置触发滚动的标签数量阈值，默认为 6
- `slidable="always"` 强制启用滚动
- `slidable="auto"` 根据标签数量自动判断（默认）

### 地图导航

```vue
<template>
  <wd-tabs v-model="activeTab" :map-num="10" map-title="全部分类">
    <wd-tab v-for="i in 15" :key="i" :title="`分类${i}`">
      <view class="tab-content">分类 {{ i }} 的内容</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>
```

**使用说明:**
- `mapNum` 设置触发地图导航的标签数量阈值，默认为 10
- `mapTitle` 设置地图导航的标题文字
- 设置 `mapNum="0"` 可以禁用地图导航功能

### 粘性布局

```vue
<template>
  <view class="header">顶部内容区域</view>

  <wd-tabs v-model="activeTab" :sticky="true" :offset-top="0">
    <wd-tab title="商品详情">
      <view v-for="i in 20" :key="i" class="content-item">
        商品详情内容 {{ i }}
      </view>
    </wd-tab>
    <wd-tab title="商品参数">
      <view v-for="i in 20" :key="i" class="content-item">
        商品参数 {{ i }}
      </view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>
```

**使用说明:**
- `sticky` 属性启用粘性布局
- `offsetTop` 设置吸顶位置距离顶部的距离，单位 rpx

### 手势滑动

```vue
<template>
  <wd-tabs v-model="activeTab" :swipeable="true">
    <wd-tab title="首页">
      <view class="tab-content">向左滑动切换到下一页</view>
    </wd-tab>
    <wd-tab title="分类">
      <view class="tab-content">左右滑动切换页面</view>
    </wd-tab>
    <wd-tab title="我的">
      <view class="tab-content">向右滑动返回上一页</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>
```

**使用说明:**
- `swipeable` 属性启用手势滑动功能
- 最小滑动距离为 50px
- 手势滑动只在横向移动时触发

### 切换动画

```vue
<template>
  <wd-tabs v-model="activeTab" :animated="true" :duration="300">
    <wd-tab title="首页">
      <view class="tab-content">首页内容，带切换动画</view>
    </wd-tab>
    <wd-tab title="分类">
      <view class="tab-content">分类内容，带切换动画</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>
```

### 懒加载

```vue
<template>
  <wd-tabs v-model="activeTab">
    <wd-tab v-for="i in 10" :key="i" :title="`标签${i}`" :lazy="true">
      <view class="tab-content">
        标签 {{ i }} 的内容（懒加载）
      </view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>
```

**使用说明:**
- 子组件模式下通过 `lazy` prop 控制懒加载，默认为 `true`
- 懒加载模式下，标签内容在首次激活时才会渲染
- 配合动画模式时，动画模式会覆盖懒加载行为

### 事件监听

```vue
<template>
  <wd-tabs
    v-model="activeTab"
    @change="handleChange"
    @click="handleClick"
    @disabled="handleDisabled"
  >
    <wd-tab title="首页">内容</wd-tab>
    <wd-tab title="分类">内容</wd-tab>
    <wd-tab title="购物车（禁用）" :disabled="true">内容</wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)

const handleChange = (event: { index: number; name: string | number }) => {
  console.log('切换到:', event)
}

const handleClick = (event: { index: number; name: string | number }) => {
  console.log('点击:', event)
}

const handleDisabled = (event: { index: number; name: string | number }) => {
  console.log('点击禁用标签:', event)
}
</script>
```

### 实例方法调用

```vue
<template>
  <view class="btn-group">
    <wd-button @click="tabsRef?.setActive(1)">切换到标签2</wd-button>
    <wd-button @click="tabsRef?.scrollIntoView()">滚动到可视区域</wd-button>
    <wd-button @click="tabsRef?.updateLineStyle(true)">更新指示线</wd-button>
  </view>

  <wd-tabs ref="tabsRef" v-model="activeTab" :slidable-num="3">
    <wd-tab v-for="i in 10" :key="i" :name="`tab${i}`" :title="`标签${i}`">
      <view class="tab-content">标签 {{ i }} 的内容</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsInstance } from '@/wd/components/wd-tabs/wd-tabs.vue'

const activeTab = ref('tab1')
const tabsRef = ref<TabsInstance>()
</script>
```

## API

### Tabs Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| items | 标签页数据数组（Items 模式） | `TabItem[]` | `[]` |
| modelValue / v-model | 绑定值，可以是索引或 name | `string \| number` | `0` |
| slidableNum | 标签数超过此阈值时启用横向滚动 | `number` | `6` |
| mapNum | 标签数超过此阈值时显示地图导航 | `number` | `10` |
| mapTitle | 地图导航的标题文字 | `string` | `'全部'` |
| sticky | 是否启用粘性布局（吸顶） | `boolean` | `false` |
| offsetTop | 粘性布局吸顶位置，单位 rpx | `number` | `0` |
| swipeable | 是否开启手势滑动切换 | `boolean` | `false` |
| autoLineWidth | 是否自动调整底部条宽度 | `boolean` | `false` |
| lineWidth | 底部条宽度，单位 rpx | `string \| number` | - |
| lineHeight | 底部条高度，单位 rpx | `string \| number` | - |
| color | 激活状态的文字和指示线颜色 | `string` | - |
| inactiveColor | 非激活状态的文字颜色 | `string` | - |
| animated | 是否开启切换标签内容时的过渡动画 | `boolean` | `false` |
| duration | 切换动画过渡时间，单位毫秒 | `number` | `300` |
| slidable | 滚动导航模式 | `'auto' \| 'always'` | `'auto'` |
| showScrollbar | 横向滚动时是否显示原生滚动条（`false` 时自动隐藏 `::-webkit-scrollbar`） | `boolean` | `false` |

### Tab Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| name | 唯一标识符，用于 v-model 绑定 | `string \| number` | - |
| title | 标签标题 | `string` | `''` |
| disabled | 是否禁用，禁用后不可点击 | `boolean` | `false` |
| lazy | 是否懒加载 | `boolean` | `true` |
| badgeProps | 徽标属性，透传给 Badge 组件 | `Partial<WdBadgeProps>` | - |

### Tabs Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 绑定值变化时触发 | `value: string \| number` |
| change | 切换标签时触发 | `{ index: number, name: string \| number }` |
| disabled | 点击禁用标签时触发 | `{ index: number, name: string \| number }` |
| click | 点击标签时触发 | `{ index: number, name: string \| number }` |

### Tabs Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 子组件模式放置 `wd-tab`，Items 模式渲染内容 | `{ item: TabItem, index: number }` |
| item-${index} | Items 模式下的自定义内容插槽 | `{ item: TabItem, index: number }` |

### Tabs 实例方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| setActive | 设置激活的标签页 | `(value: string \| number, init?: boolean, setScroll?: boolean) => void` |
| scrollIntoView | 滚动到当前激活的标签页可视区域 | `() => void` |
| updateLineStyle | 更新底部指示线的样式 | `(animation?: boolean) => Promise<void>` |

### 类型定义

```typescript
/** 标签页滑动模式 */
export type TabsSlidable = 'auto' | 'always'

/** 标签项配置接口 */
export interface TabItem {
  /** 唯一标识符 */
  name?: string | number
  /** 标签标题 */
  title: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否懒加载 */
  lazy?: boolean
  /** 徽标属性 */
  badgeProps?: Partial<WdBadgeProps>
  /** 是否使用自定义内容插槽 */
  useSlot?: boolean
  /** 自定义内容插槽名称 */
  slotName?: string
  /** 自定义数据 */
  [key: string]: any
}

/** Tabs 组件属性接口 */
interface WdTabsProps {
  customStyle?: string
  customClass?: string
  items?: TabItem[]
  modelValue?: string | number
  slidableNum?: number
  mapNum?: number
  mapTitle?: string
  sticky?: boolean
  offsetTop?: number
  swipeable?: boolean
  autoLineWidth?: boolean
  lineWidth?: string | number
  lineHeight?: string | number
  color?: string
  inactiveColor?: string
  animated?: boolean
  duration?: number
  slidable?: TabsSlidable
}

/** Tab 组件属性接口 */
interface WdTabProps {
  customStyle?: string
  customClass?: string
  name?: string | number
  title?: string
  disabled?: boolean
  lazy?: boolean
  badgeProps?: Partial<WdBadgeProps>
}

/** Tabs 组件实例类型 */
export type TabsInstance = ComponentPublicInstance<WdTabsProps, WdTabsExpose>
```

## 主题定制

### CSS 变量

```scss
// 标签导航栏
$-tabs-nav-height: 88rpx;                    // 导航栏高度
$-tabs-nav-bg: #fff;                         // 导航栏背景色
$-tabs-nav-fs: 28rpx;                        // 标签文字大小
$-tabs-nav-color: #323233;                   // 标签文字颜色
$-tabs-nav-active-color: #4d80f0;            // 激活标签颜色
$-tabs-nav-disabled-color: #c8c9cc;          // 禁用标签颜色

// 底部指示线
$-tabs-nav-line-width: 40rpx;                // 指示线宽度
$-tabs-nav-line-height: 6rpx;                // 指示线高度
$-tabs-nav-line-bg-color: $-tabs-nav-active-color; // 指示线背景色

// 地图导航
$-tabs-nav-map-fs: 28rpx;                    // 地图导航文字大小
$-tabs-nav-map-color: #323233;               // 地图导航文字颜色
$-tabs-nav-map-modal-bg: rgba(0, 0, 0, 0.4); // 地图遮罩背景色

// 暗色主题
.wot-theme-dark {
  $-dark-background: #1a1a1a;
  $-dark-color: #e5e5e5;
}
```

## 最佳实践

### 1. 选择合适的使用模式

```vue
<!-- ✅ 标签固定且内容结构清晰 - 使用子组件模式 -->
<wd-tabs v-model="activeTab">
  <wd-tab title="商品详情">
    <ProductDetail />
  </wd-tab>
  <wd-tab title="用户评价">
    <ProductReviews />
  </wd-tab>
</wd-tabs>

<!-- ✅ 标签动态生成 - 使用 Items 模式 -->
<wd-tabs v-model="activeCategory" :items="categories">
  <template #default="{ item }">
    <CategoryList :category-id="item.id" />
  </template>
</wd-tabs>
```

### 2. 合理配置懒加载

```vue
<!-- ✅ 复杂内容启用懒加载 -->
<wd-tabs v-model="activeTab">
  <wd-tab title="推荐" :lazy="true">
    <HeavyComponent />
  </wd-tab>
  <wd-tab title="热门" :lazy="true">
    <LargeList />
  </wd-tab>
</wd-tabs>

<!-- ✅ 简单内容关闭懒加载 -->
<wd-tabs v-model="activeTab">
  <wd-tab title="基本信息" :lazy="false">
    <view>简单的文字内容</view>
  </wd-tab>
</wd-tabs>
```

### 3. 优化滚动性能

```vue
<!-- ✅ 合理设置滚动阈值 -->
<wd-tabs v-model="activeTab" :slidable-num="6" :map-num="10">
  <wd-tab v-for="i in 15" :key="i" :title="`分类${i}`">
    <CategoryContent />
  </wd-tab>
</wd-tabs>
```

### 4. 正确使用 name 标识

```vue
<!-- ✅ 使用语义化的 name 标识 -->
<wd-tabs v-model="activeTab">
  <wd-tab name="home" title="首页">
    <HomePage />
  </wd-tab>
  <wd-tab name="category" title="分类">
    <CategoryPage />
  </wd-tab>
</wd-tabs>
```

## 常见问题

### 1. 切换标签后内容没有更新

**问题原因:** 启用懒加载且内容未触发重新渲染

**解决方案:**

```vue
<template>
  <wd-tabs v-model="activeTab" @change="handleChange">
    <wd-tab title="列表1" :lazy="false">
      <ProductList :key="activeTab" :category="1" />
    </wd-tab>
    <wd-tab title="列表2" :lazy="false">
      <ProductList :key="activeTab" :category="2" />
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)

const handleChange = (event: { index: number }) => {
  console.log('切换到:', event)
}
</script>
```

### 2. 底部指示线位置不正确

**问题原因:** 动态修改标签后未更新指示线样式

**解决方案:**

```vue
<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import type { TabsInstance } from '@/wd/components/wd-tabs/wd-tabs.vue'

const tabsRef = ref<TabsInstance>()
const tabs = ref([...])

watch(
  () => tabs.value,
  async () => {
    await nextTick()
    await tabsRef.value?.updateLineStyle(true)
  },
  { deep: true }
)
</script>
```

### 3. 手势滑动不生效

**问题原因:** `swipeable` 未启用或滑动距离小于阈值

**解决方案:**
- 确保 `swipeable` 属性设置为 `true`
- 滑动距离需要超过 50px 才会触发切换
- 避免在内容区域阻止触摸事件冒泡
- 确保滑动方向是横向

### 4. 粘性布局吸顶位置不正确

**问题原因:** `offsetTop` 设置错误或未考虑状态栏高度

**解决方案:**

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const navHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  const navBarHeight = 88  // 导航栏高度
  navHeight.value = statusBarHeight + navBarHeight
})
</script>

<template>
  <wd-tabs :sticky="true" :offset-top="navHeight">
    <!-- ... -->
  </wd-tabs>
</template>
```

## 注意事项

1. **v-model 绑定值类型**: 绑定值可以是数字索引或字符串 name，但必须与标签的 name 类型一致

2. **name 唯一性检查**: 如果为标签设置了 name 属性，必须确保 name 值唯一

3. **懒加载与动画冲突**: 启用动画模式时，所有标签内容会同时渲染，懒加载会失效

4. **滚动阈值配置**: `slidableNum` 和 `mapNum` 必须是大于 0 的整数，设置为 0 时会禁用对应功能

5. **底部指示线宽度**: 设置了 `lineWidth` 后，`autoLineWidth` 会失效

6. **手势滑动触发条件**: 需要满足滑动方向为横向且滑动距离超过 50px

7. **动态修改标签**: 动态修改标签数量后，需要调用 `updateLineStyle` 方法更新底部指示线位置

## 总结

Tabs 标签页组件核心要点:

1. **使用模式** - 固定标签用子组件模式，动态标签用 Items 模式
2. **滚动配置** - 标签数量多时启用横向滚动和地图导航
3. **性能优化** - 复杂内容启用懒加载，简单内容可关闭
4. **交互体验** - 移动端场景启用手势滑动和动画效果
5. **粘性布局** - 商品详情等场景使用吸顶效果
