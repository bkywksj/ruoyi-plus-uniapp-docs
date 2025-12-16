# Tabs 标签页

## 介绍

Tabs 标签页组件是一个功能强大且灵活的内容切换组件，用于在多个平行的内容区域之间进行切换和展示。该组件提供了丰富的交互方式和视觉效果，支持横向滚动、地图导航、粘性布局、手势滑动等特性，适用于商城分类、新闻频道、个人中心等各类需要标签切换的场景。

**核心特性:**

- **双模式支持** - 提供 Items 数组模式和 WdTab 子组件模式两种使用方式，满足不同场景需求
- **智能滑动** - 标签数量超过阈值时自动启用横向滚动，支持手动配置滑动模式（auto/always）
- **地图导航** - 标签过多时显示全部标签的宫格地图视图，方便快速定位和切换
- **粘性布局** - 支持吸顶效果，标签栏滚动时固定在顶部，内容区域独立滚动
- **手势滑动** - 支持左右滑动手势切换标签页，提供流畅的移动端体验
- **懒加载机制** - 支持标签内容懒加载，只渲染激活和已访问的标签，优化性能
- **动画效果** - 支持平滑的切换动画，可自定义动画时长和过渡效果
- **自定义样式** - 支持自定义激活颜色、底部指示线宽度/高度、自动宽度适配等
- **徽标集成** - 内置 Badge 徽标组件，支持在标签上显示未读数、红点等提示
- **禁用状态** - 支持禁用特定标签，禁用标签不可点击且样式置灰

参考: src/wd/components/wd-tabs/wd-tabs.vue:1-453

---

## 基本用法

### 子组件模式

使用 `wd-tab` 子组件定义标签页，这是最常见和推荐的使用方式。

```vue
<template>
  <view class="demo-tabs">
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
      <wd-tab title="标签4">
        <view class="tab-content">标签4的内容</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**使用说明:**
- `v-model` 绑定激活的标签索引或 name 值
- 每个 `wd-tab` 通过 `title` 属性设置标签标题
- 默认激活第一个标签（索引为 0）
- 子组件模式适合内容结构清晰、标签数量固定的场景

参考: src/wd/components/wd-tabs/wd-tabs.vue:54-88, 274-308

### Items 数组模式

通过 `items` 数组配置标签页，适合动态标签场景。

```vue
<template>
  <view class="demo-tabs">
    <wd-tabs v-model="activeTab" :items="tabItems">
      <template #default="{ item, index }">
        <view class="tab-content">
          {{ item.title }}的内容 (索引: {{ index }})
        </view>
      </template>
    </wd-tabs>
  </view>
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

**使用说明:**
- Items 模式通过 `items` 数组传入标签配置
- 使用默认插槽接收 `item` 和 `index` 参数渲染内容
- 每个 item 必须包含 `title` 属性
- 适合标签数量动态变化、从后端获取数据的场景

参考: src/wd/components/wd-tabs/wd-tabs.vue:18-52, 238-271

### 指定 name 标识

通过 `name` 属性为标签指定唯一标识，v-model 可以绑定字符串值。

```vue
<template>
  <view class="demo-tabs">
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
      <wd-tab name="profile" title="我的">
        <view class="tab-content">个人中心内容</view>
      </wd-tab>
    </wd-tabs>

    <view class="current-tab">
      当前激活: {{ activeTab }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 使用 name 标识时，v-model 绑定字符串
const activeTab = ref('home')
</script>

```

**使用说明:**
- 子组件模式下通过 `name` 属性指定唯一标识
- Items 模式下在每个 item 对象中设置 `name` 属性
- `name` 支持字符串或数字类型
- 使用 name 标识时，v-model 绑定的是 name 值而非索引
- name 必须唯一，重复会在控制台输出警告

参考: src/wd/components/wd-tab/wd-tab.vue:42, 98-109

### 禁用标签

通过 `disabled` 属性禁用特定标签，禁用的标签不可点击。

```vue
<template>
  <view class="demo-tabs">
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
      <wd-tab title="标签4（禁用）" :disabled="true">
        <view class="tab-content">标签4的内容</view>
      </wd-tab>
    </wd-tabs>

    <view v-if="disabledTip" class="tip">
      {{ disabledTip }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
const disabledTip = ref('')

const handleDisabled = (event: { index: number; name: string | number }) => {
  disabledTip.value = `标签 ${event.name} 已禁用`
  setTimeout(() => {
    disabledTip.value = ''
  }, 2000)
}
</script>

```

**使用说明:**
- 子组件模式下通过 `disabled` prop 禁用标签
- Items 模式下在 item 对象中设置 `disabled: true`
- 禁用的标签样式置灰且不可点击
- 点击禁用标签会触发 `disabled` 事件
- 禁用标签不会被激活，切换会跳过禁用项

**技术实现:**
- 禁用标签添加 `is-disabled` 样式类
- 点击时检查 `disabled` 状态，禁用则触发 `disabled` 事件并 return
- 样式层通过 `$-tabs-nav-disabled-color` 变量控制禁用颜色

参考: src/wd/components/wd-tabs/wd-tabs.vue:59, 279, 806-815

### 徽标提示

使用 `badgeProps` 在标签上显示徽标，支持数字、圆点、自定义内容。

```vue
<template>
  <view class="demo-tabs">
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
      <wd-tab title="已读">
        <view class="tab-content">已读消息</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**Items 模式示例:**

```vue
<template>
  <view class="demo-tabs">
    <wd-tabs v-model="activeTab" :items="tabItems">
      <template #default="{ item }">
        <view class="tab-content">
          {{ item.title }}的内容
        </view>
      </template>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabItem } from '@/wd/components/wd-tabs/wd-tabs-key'

const activeTab = ref(0)

const tabItems: TabItem[] = [
  { title: '消息', badgeProps: { value: 5 } },
  { title: '通知', badgeProps: { isDot: true } },
  { title: '待办', badgeProps: { value: '99+' } },
  { title: '已读' },
]
</script>

```

**使用说明:**
- `badgeProps` 透传给 `wd-badge` 组件
- 支持所有 Badge 组件的属性：value、isDot、max、type 等
- 徽标显示在标签文字右上角
- 徽标会随着标签切换自动更新显示

参考: src/wd/components/wd-tabs/wd-tabs.vue:35-43, 71-79, 255-263, 291-299

### 自定义颜色

通过 `color` 和 `inactiveColor` 自定义标签颜色。

```vue
<template>
  <view class="demo-tabs">
    <wd-text title="主题色" />
    <wd-tabs v-model="activeTab1" color="#07c160" inactive-color="#999">
      <wd-tab title="首页">
        <view class="tab-content">首页内容</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容</view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">我的内容</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="紫色主题" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab2" color="#6200ea" inactive-color="#bbb">
      <wd-tab title="首页">
        <view class="tab-content">首页内容</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容</view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">我的内容</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="渐变主题" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab3" color="#ff6b6b" inactive-color="#aaa">
      <wd-tab title="首页">
        <view class="tab-content">首页内容</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容</view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">我的内容</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
</script>

```

**使用说明:**
- `color` 设置激活标签的文字颜色和底部指示线颜色
- `inactiveColor` 设置未激活标签的文字颜色
- 支持任意 CSS 颜色值（十六进制、RGB、颜色名称等）
- 不设置时使用默认主题色

参考: src/wd/components/wd-tabs/wd-tabs.vue:24-31, 60-67, 244-251, 280-287

### 自定义底部指示线

通过 `lineWidth`、`lineHeight`、`autoLineWidth` 自定义底部指示线样式。

```vue
<template>
  <view class="demo-tabs">
    <wd-text title="自动宽度" />
    <wd-tabs v-model="activeTab1" :auto-line-width="true">
      <wd-tab title="首页">
        <view class="tab-content">自动适应文字宽度</view>
      </wd-tab>
      <wd-tab title="分类导航">
        <view class="tab-content">指示线宽度跟随文字</view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">自动宽度模式</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="固定宽度" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab2" :line-width="60">
      <wd-tab title="首页">
        <view class="tab-content">指示线宽度 60rpx</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">固定宽度模式</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">统一宽度显示</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="自定义高度" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab3" :line-height="6" color="#ff6b6b">
      <wd-tab title="首页">
        <view class="tab-content">指示线高度 6rpx</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">更粗的指示线</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">视觉更突出</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="组合样式" custom-style="margin-top: 32rpx" />
    <wd-tabs
      v-model="activeTab4"
      :line-width="80"
      :line-height="8"
      color="#6200ea"
    >
      <wd-tab title="首页">
        <view class="tab-content">宽度 80rpx，高度 8rpx</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">自定义组合样式</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">个性化指示线</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
const activeTab4 = ref(0)
</script>

```

**使用说明:**
- `autoLineWidth` 为 `true` 时，指示线宽度自动适应标签文字宽度
- `lineWidth` 设置固定宽度，单位 rpx，优先级高于 `autoLineWidth`
- `lineHeight` 设置指示线高度，单位 rpx
- 指示线颜色跟随 `color` 属性
- 指示线支持圆角效果，圆角半径为高度的一半

**技术实现:**
- 通过 `getRect` 获取标签文字和标签项的尺寸信息
- `autoLineWidth` 模式下读取 `.wd-tabs__nav-item-text` 的宽度
- 使用 `transform: translateX()` 实现指示线平滑移动
- 指示线样式通过 `state.lineStyle` 动态计算和应用

参考: src/wd/components/wd-tabs/wd-tabs.vue:480-485, 669-704

---

## 高级用法

### 横向滚动

标签数量超过阈值时自动启用横向滚动，也可以手动配置。

```vue
<template>
  <view class="demo-tabs">
    <wd-text title="自动滚动（超过6个）" />
    <wd-tabs v-model="activeTab1" :slidable-num="6">
      <wd-tab v-for="i in 10" :key="i" :title="`标签${i}`">
        <view class="tab-content">标签 {{ i }} 的内容</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="始终滚动" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab2" slidable="always">
      <wd-tab v-for="i in 4" :key="i" :title="`标签${i}`">
        <view class="tab-content">标签 {{ i }} 的内容</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="自定义阈值（超过3个）" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab3" :slidable-num="3">
      <wd-tab v-for="i in 5" :key="i" :title="`标签${i}`">
        <view class="tab-content">标签 {{ i }} 的内容</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
</script>

```

**使用说明:**
- `slidableNum` 设置触发滚动的标签数量阈值，默认为 6
- `slidable="always"` 强制启用滚动，无论标签数量
- `slidable="auto"` 根据标签数量自动判断（默认）
- 滚动模式下标签不会平分宽度，而是根据内容自动适应
- 切换标签时自动滚动到可视区域中心

**技术实现:**
- 滚动模式下添加 `is-slide` 样式类
- 使用 `scroll-view` 组件实现横向滚动
- 通过 `scroll-left` 属性控制滚动位置
- `scrollIntoView` 方法计算目标位置并更新 `scrollLeft`

参考: src/wd/components/wd-tabs/wd-tabs.vue:468-469, 538-539, 602-606, 709-728

### 地图导航

标签数量超过阈值时显示地图按钮，展开后显示全部标签的宫格视图。

```vue
<template>
  <view class="demo-tabs">
    <wd-text title="地图导航（超过10个显示）" />
    <wd-tabs v-model="activeTab1" :map-num="10" map-title="全部分类">
      <wd-tab v-for="i in 15" :key="i" :title="`分类${i}`">
        <view class="tab-content">分类 {{ i }} 的内容</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="自定义阈值（超过5个显示）" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab2" :map-num="5" map-title="所有频道">
      <wd-tab v-for="i in 8" :key="i" :title="`频道${i}`">
        <view class="tab-content">频道 {{ i }} 的内容</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="禁用地图导航" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab3" :map-num="0">
      <wd-tab v-for="i in 12" :key="i" :title="`标签${i}`">
        <view class="tab-content">标签 {{ i }} 的内容，无地图导航</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
</script>

```

**使用说明:**
- `mapNum` 设置触发地图导航的标签数量阈值，默认为 10
- `mapTitle` 设置地图导航的标题文字
- 设置 `mapNum="0"` 可以禁用地图导航功能
- 地图导航显示为 3 列宫格布局
- 点击地图中的标签可以快速切换
- 点击遮罩层或再次点击地图按钮可以关闭地图

**技术实现:**
- 地图按钮固定在导航栏右侧，带有下拉箭头图标
- 地图展开时使用 `transform: scaleY()` 动画
- 遮罩层使用半透明背景，点击关闭地图
- 地图导航支持 Items 模式和子组件模式

参考: src/wd/components/wd-tabs/wd-tabs.vue:94-169, 314-368, 470-472, 540

### 粘性布局

启用粘性布局后，标签栏滚动到顶部时会固定吸顶。

```vue
<template>
  <view class="demo-tabs">
    <view class="header">顶部内容区域</view>

    <wd-tabs v-model="activeTab" :sticky="true" :offset-top="0">
      <wd-tab title="商品详情">
        <view class="tab-content">
          <view v-for="i in 20" :key="i" class="content-item">
            商品详情内容 {{ i }}
          </view>
        </view>
      </wd-tab>
      <wd-tab title="商品参数">
        <view class="tab-content">
          <view v-for="i in 20" :key="i" class="content-item">
            商品参数 {{ i }}
          </view>
        </view>
      </wd-tab>
      <wd-tab title="用户评价">
        <view class="tab-content">
          <view v-for="i in 20" :key="i" class="content-item">
            用户评价 {{ i }}
          </view>
        </view>
      </wd-tab>
      <wd-tab title="售后保障">
        <view class="tab-content">
          <view v-for="i in 20" :key="i" class="content-item">
            售后保障 {{ i }}
          </view>
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**自定义吸顶位置:**

```vue
<template>
  <view class="demo-tabs">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">自定义导航栏（高度 88rpx）</view>

    <view class="header">顶部内容区域</view>

    <!-- 吸顶位置为导航栏高度 -->
    <wd-tabs v-model="activeTab" :sticky="true" :offset-top="88">
      <wd-tab title="推荐">
        <view class="tab-content">
          <view v-for="i in 20" :key="i" class="content-item">
            推荐内容 {{ i }}
          </view>
        </view>
      </wd-tab>
      <wd-tab title="热门">
        <view class="tab-content">
          <view v-for="i in 20" :key="i" class="content-item">
            热门内容 {{ i }}
          </view>
        </view>
      </wd-tab>
      <wd-tab title="关注">
        <view class="tab-content">
          <view v-for="i in 20" :key="i" class="content-item">
            关注内容 {{ i }}
          </view>
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**使用说明:**
- `sticky` 属性启用粘性布局
- `offsetTop` 设置吸顶位置距离顶部的距离，单位 rpx
- 粘性布局依赖 `wd-sticky` 和 `wd-sticky-box` 组件实现
- 适用于商品详情、文章详情等需要固定标签栏的场景
- 吸顶后标签栏会固定在页面顶部，内容区域独立滚动

**技术实现:**
- 粘性布局使用两套不同的模板结构（sticky 和非 sticky）
- sticky 模式使用 `wd-sticky` 组件包裹导航栏
- `offsetTop` 透传给 `wd-sticky` 组件的 `offset-top` 属性

参考: src/wd/components/wd-tabs/wd-tabs.vue:3-223, 474-477, 542-543

### 手势滑动

启用手势滑动后，支持左右滑动切换标签页。

```vue
<template>
  <view class="demo-tabs">
    <wd-text title="手势滑动切换" />
    <wd-tabs v-model="activeTab" :swipeable="true">
      <wd-tab title="首页">
        <view class="tab-content">
          <view class="tip">👈 向左滑动切换到下一页</view>
          <view v-for="i in 10" :key="i" class="content-item">
            首页内容 {{ i }}
          </view>
        </view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">
          <view class="tip">👉 向右滑动返回上一页</view>
          <view class="tip">👈 向左滑动切换到下一页</view>
          <view v-for="i in 10" :key="i" class="content-item">
            分类内容 {{ i }}
          </view>
        </view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">
          <view class="tip">👉 向右滑动返回上一页</view>
          <view class="tip">👈 向左滑动切换到下一页</view>
          <view v-for="i in 10" :key="i" class="content-item">
            购物车内容 {{ i }}
          </view>
        </view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">
          <view class="tip">👉 向右滑动返回上一页</view>
          <view v-for="i in 10" :key="i" class="content-item">
            个人中心内容 {{ i }}
          </view>
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**使用说明:**
- `swipeable` 属性启用手势滑动功能
- 向左滑动切换到下一个标签页
- 向右滑动切换到上一个标签页
- 最小滑动距离为 50px，小于此距离不触发切换
- 第一个标签页不能再向右滑动，最后一个标签页不能再向左滑动
- 手势滑动只在横向移动时触发，纵向滑动不影响

**技术实现:**
- 使用 `useTouch` 组合式函数处理触摸事件
- 监听 `touchstart`、`touchmove`、`touchend` 事件
- 计算滑动方向（direction）和距离（offsetX、deltaX）
- 满足条件时调用 `setActive` 切换标签

参考: src/wd/components/wd-tabs/wd-tabs.vue:173-179, 371-377, 479, 544, 587, 828-858

### 切换动画

启用切换动画后，标签内容切换时带有平滑的滑动效果。

```vue
<template>
  <view class="demo-tabs">
    <wd-text title="默认动画（300ms）" />
    <wd-tabs v-model="activeTab1" :animated="true">
      <wd-tab title="首页">
        <view class="tab-content">首页内容，带切换动画</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容，带切换动画</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容，带切换动画</view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">我的内容，带切换动画</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="快速动画（150ms）" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab2" :animated="true" :duration="150">
      <wd-tab title="首页">
        <view class="tab-content">首页内容，快速切换</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容，快速切换</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容，快速切换</view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">我的内容，快速切换</view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="慢速动画（600ms）" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab3" :animated="true" :duration="600">
      <wd-tab title="首页">
        <view class="tab-content">首页内容，慢速切换</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容，慢速切换</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容，慢速切换</view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">我的内容，慢速切换</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
const activeTab3 = ref(0)
</script>

```

**使用说明:**
- `animated` 属性启用切换动画
- `duration` 设置动画时长，单位毫秒，默认 300ms
- 动画效果为左右滑动切换
- 配合 `swipeable` 使用体验更佳
- 动画模式下所有标签内容会同时渲染，不适合大量内容的场景

**技术实现:**
- 动画模式下标签内容使用 `display: flex` 横向排列
- 通过 `left` 属性控制偏移量：`-100% * activeIndex`
- 使用 CSS `transition` 实现平滑过渡
- 动画时长通过 `transition-duration` 设置

参考: src/wd/components/wd-tabs/wd-tabs.vue:180-183, 378-381, 491-493, 548-549, 611-621

### 懒加载

标签内容支持懒加载，只渲染激活和已访问过的标签，优化性能。

```vue
<template>
  <view class="demo-tabs">
    <wd-text title="懒加载模式（默认）" />
    <wd-tabs v-model="activeTab1">
      <wd-tab v-for="i in 10" :key="i" :title="`标签${i}`" :lazy="true">
        <view class="tab-content">
          <view class="tip">标签 {{ i }} 的内容（懒加载）</view>
          <view v-for="j in 20" :key="j" class="content-item">
            内容项 {{ j }}
          </view>
        </view>
      </wd-tab>
    </wd-tabs>

    <wd-text title="关闭懒加载" custom-style="margin-top: 32rpx" />
    <wd-tabs v-model="activeTab2">
      <wd-tab v-for="i in 10" :key="i" :title="`标签${i}`" :lazy="false">
        <view class="tab-content">
          <view class="tip">标签 {{ i }} 的内容（全部渲染）</view>
          <view v-for="j in 20" :key="j" class="content-item">
            内容项 {{ j }}
          </view>
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab1 = ref(0)
const activeTab2 = ref(0)
</script>

```

**Items 模式懒加载:**

```vue
<template>
  <view class="demo-tabs">
    <wd-tabs v-model="activeTab" :items="tabItems">
      <template #default="{ item, index }">
        <view class="tab-content">
          <view class="tip">{{ item.title }} 的内容（懒加载）</view>
          <view v-for="j in 20" :key="j" class="content-item">
            内容项 {{ j }}
          </view>
        </view>
      </template>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabItem } from '@/wd/components/wd-tabs/wd-tabs-key'

const activeTab = ref(0)

const tabItems: TabItem[] = [
  { title: '首页', lazy: true },
  { title: '分类', lazy: true },
  { title: '购物车', lazy: true },
  { title: '我的', lazy: true },
]
</script>

```

**使用说明:**
- 子组件模式下通过 `lazy` prop 控制懒加载，默认为 `true`
- Items 模式下在 item 对象中设置 `lazy` 属性
- 懒加载模式下，标签内容在首次激活时才会渲染
- 已渲染的标签内容会保留，切换回来时不会重新渲染
- 关闭懒加载（`lazy="false"`）会一次性渲染所有标签内容
- 懒加载模式适合标签数量多、内容复杂的场景
- 配合动画模式时，动画模式会覆盖懒加载行为

**技术实现:**
- 子组件模式使用 `painted` 状态标记是否已渲染
- 首次激活时设置 `painted = true`
- `shouldBeRender` 计算属性判断是否应该渲染：`!lazy || painted || active`
- Items 模式使用 `shouldTabRender` 方法判断

参考: src/wd/components/wd-tab/wd-tab.vue:48, 59, 69, 92, 114-116, 139-141

### 自定义内容插槽（Items 模式）

Items 模式支持为每个标签指定自定义内容插槽。

```vue
<template>
  <view class="demo-tabs">
    <wd-tabs v-model="activeTab" :items="tabItems">
      <!-- 默认插槽：未指定 useSlot 的标签使用此插槽 -->
      <template #default="{ item, index }">
        <view class="tab-content">
          <view class="default-content">
            {{ item.title }} 的默认内容（索引: {{ index }}）
          </view>
        </view>
      </template>

      <!-- 首页的自定义插槽 -->
      <template #item-0="{ item, index }">
        <view class="tab-content">
          <view class="custom-content">
            <wd-icon name="home" size="64" />
            <text class="title">{{ item.title }}</text>
            <text class="desc">这是首页的自定义插槽内容</text>
          </view>
        </view>
      </template>

      <!-- 分类的自定义插槽 -->
      <template #custom-category="{ item, index }">
        <view class="tab-content">
          <view class="custom-content">
            <wd-icon name="category" size="64" />
            <text class="title">{{ item.title }}</text>
            <text class="desc">这是分类的自定义插槽内容</text>
          </view>
        </view>
      </template>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabItem } from '@/wd/components/wd-tabs/wd-tabs-key'

const activeTab = ref(0)

const tabItems: TabItem[] = [
  { title: '首页', useSlot: true }, // 使用 item-0 插槽
  { title: '分类', useSlot: true, slotName: 'custom-category' }, // 使用自定义插槽名
  { title: '购物车' }, // 使用默认插槽
  { title: '我的' }, // 使用默认插槽
]
</script>

```

**使用说明:**
- 在 item 对象中设置 `useSlot: true` 启用自定义插槽
- 默认插槽名为 `item-${index}`，如 `item-0`、`item-1`
- 通过 `slotName` 自定义插槽名称
- 插槽接收 `item` 和 `index` 参数
- 未设置 `useSlot` 的标签使用默认插槽

参考: src/wd/components/wd-tabs/wd-tabs.vue:197-207, 396-405, 556-559

### 事件监听

监听标签切换、点击、禁用等事件。

```vue
<template>
  <view class="demo-tabs">
    <wd-tabs
      v-model="activeTab"
      @change="handleChange"
      @click="handleClick"
      @disabled="handleDisabled"
    >
      <wd-tab title="首页">
        <view class="tab-content">首页内容</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容</view>
      </wd-tab>
      <wd-tab title="购物车（禁用）" :disabled="true">
        <view class="tab-content">购物车内容</view>
      </wd-tab>
      <wd-tab title="我的">
        <view class="tab-content">我的内容</view>
      </wd-tab>
    </wd-tabs>

    <view class="event-log">
      <view class="log-title">事件日志:</view>
      <view v-for="(log, index) in eventLogs" :key="index" class="log-item">
        {{ log }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
const eventLogs = ref<string[]>([])

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${time}] ${message}`)
  if (eventLogs.value.length > 10) {
    eventLogs.value.pop()
  }
}

const handleChange = (event: { index: number; name: string | number }) => {
  addLog(`change 事件 - 切换到: index=${event.index}, name=${event.name}`)
}

const handleClick = (event: { index: number; name: string | number }) => {
  addLog(`click 事件 - 点击: index=${event.index}, name=${event.name}`)
}

const handleDisabled = (event: { index: number; name: string | number }) => {
  addLog(`disabled 事件 - 点击禁用标签: index=${event.index}, name=${event.name}`)
}
</script>

```

**使用说明:**
- `change` 事件：标签切换时触发，参数包含 `index` 和 `name`
- `click` 事件：点击标签时触发（包括禁用标签），参数包含 `index` 和 `name`
- `disabled` 事件：点击禁用标签时触发，参数包含 `index` 和 `name`
- `update:modelValue` 事件：v-model 绑定值变化时触发，参数为新的值
- 事件触发顺序：`click` → `disabled`（如果禁用）或 `change`（如果切换成功）→ `update:modelValue`

参考: src/wd/components/wd-tabs/wd-tabs.vue:501-510, 738-744, 806-822

### 实例方法调用

通过 ref 调用组件实例方法。

```vue
<template>
  <view class="demo-tabs">
    <view class="btn-group">
      <wd-button type="primary" size="small" @click="setActiveByIndex">
        切换到标签2（索引）
      </wd-button>
      <wd-button type="success" size="small" @click="setActiveByName">
        切换到标签3（name）
      </wd-button>
      <wd-button type="info" size="small" @click="scrollToView">
        滚动到可视区域
      </wd-button>
      <wd-button type="warning" size="small" @click="updateLine">
        更新指示线
      </wd-button>
    </view>

    <wd-tabs ref="tabsRef" v-model="activeTab" :slidable-num="3">
      <wd-tab v-for="i in 10" :key="i" :name="`tab${i}`" :title="`标签${i}`">
        <view class="tab-content">标签 {{ i }} 的内容</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsInstance } from '@/wd/components/wd-tabs/wd-tabs.vue'

const activeTab = ref('tab1')
const tabsRef = ref<TabsInstance>()

// 通过索引切换
const setActiveByIndex = () => {
  tabsRef.value?.setActive(1)
}

// 通过 name 切换
const setActiveByName = () => {
  tabsRef.value?.setActive('tab3')
}

// 滚动到可视区域
const scrollToView = () => {
  tabsRef.value?.scrollIntoView()
}

// 更新底部指示线
const updateLine = async () => {
  await tabsRef.value?.updateLineStyle(true)
}
</script>

```

**使用说明:**
- `setActive(value, init?, setScroll?)` - 设置激活的标签页
  - `value`: 标签索引或 name 值
  - `init`: 是否为初始化操作，默认 `false`
  - `setScroll`: 是否滚动到可视区域，默认 `true`
- `scrollIntoView()` - 滚动当前激活的标签到可视区域中心
- `updateLineStyle(animation?)` - 更新底部指示线的样式
  - `animation`: 是否启用动画，默认 `true`

参考: src/wd/components/wd-tabs/wd-tabs.vue:514-522, 780, 709-728, 669-704, 978-982

---

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
| slidable | 滚动导航模式：`'auto'` 自动判断，`'always'` 始终启用 | `'auto' \| 'always'` | `'auto'` |

参考: src/wd/components/wd-tabs/wd-tabs.vue:458-496, 533-550

### Tab Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customStyle | 自定义根节点样式 | `string` | `''` |
| customClass | 自定义根节点样式类 | `string` | `''` |
| name | 唯一标识符，用于 v-model 绑定 | `string \| number` | - |
| title | 标签标题 | `string` | `''` |
| disabled | 是否禁用，禁用后不可点击 | `boolean` | `false` |
| lazy | 是否懒加载，切换到该标签时才加载内容 | `boolean` | `true` |
| badgeProps | 徽标属性，透传给 Badge 组件 | `Partial<WdBadgeProps>` | - |

参考: src/wd/components/wd-tab/wd-tab.vue:35-51, 54-60

### TabItem 类型（Items 模式）

```typescript
interface TabItem {
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
  /** 自定义内容插槽名称，默认为 item-{index} */
  slotName?: string

  /** 自定义数据，点击时会传递 */
  [key: string]: any
}
```

参考: src/wd/components/wd-tabs/wd-tabs-key.ts:12-30

### Tabs Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 绑定值变化时触发 | `value: string \| number` |
| change | 切换标签时触发 | `{ index: number, name: string \| number }` |
| disabled | 点击禁用标签时触发 | `{ index: number, name: string \| number }` |
| click | 点击标签时触发（包括禁用标签） | `{ index: number, name: string \| number }` |

参考: src/wd/components/wd-tabs/wd-tabs.vue:501-510

### Tabs Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 默认插槽，子组件模式下放置 `wd-tab` 组件，Items 模式下渲染内容 | `{ item: TabItem, index: number }` |
| item-${index} | Items 模式下的自定义内容插槽，${index} 为标签索引 | `{ item: TabItem, index: number }` |
| [自定义插槽名] | Items 模式下通过 `slotName` 指定的自定义插槽 | `{ item: TabItem, index: number }` |

参考: src/wd/components/wd-tabs/wd-tabs.vue:199-206, 397-404, 556-559

### Tab Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 标签内容 | - |

参考: src/wd/components/wd-tab/wd-tab.vue:10

### Tabs 实例方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| setActive | 设置激活的标签页 | `(value: string \| number, init?: boolean, setScroll?: boolean) => void` | - |
| scrollIntoView | 滚动到当前激活的标签页可视区域 | `() => void` | - |
| updateLineStyle | 更新底部指示线的样式 | `(animation?: boolean) => Promise<void>` | `Promise<void>` |

参考: src/wd/components/wd-tabs/wd-tabs.vue:514-522, 978-982

### 类型定义

```typescript
/**
 * 标签页滑动模式
 */
export type TabsSlidable = 'auto' | 'always'

/**
 * 标签项配置接口
 */
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
  /** 自定义内容插槽名称，默认为 item-{index} */
  slotName?: string

  /** 自定义数据，点击时会传递 */
  [key: string]: any
}

/**
 * 标签页组件属性接口
 */
interface WdTabsProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 标签页数据数组 */
  items?: TabItem[]
  /** 绑定值 */
  modelValue?: string | number
  /** 标签数超过阈值可滑动 */
  slidableNum?: number
  /** 标签数超过阈值显示导航地图 */
  mapNum?: number
  /** 导航地图的标题 */
  mapTitle?: string
  /** 粘性布局 */
  sticky?: boolean
  /** 粘性布局吸顶位置 */
  offsetTop?: number
  /** 开启手势滑动 */
  swipeable?: boolean
  /** 自动调整底部条宽度，设置了 lineWidth 后无效 */
  autoLineWidth?: boolean
  /** 底部条宽度，单位像素 */
  lineWidth?: string | number
  /** 底部条高度，单位像素 */
  lineHeight?: string | number
  /** 颜色 */
  color?: string
  /** 非活动状态颜色 */
  inactiveColor?: string
  /** 是否开启切换标签内容时的过渡动画 */
  animated?: boolean
  /** 切换动画过渡时间，单位毫秒 */
  duration?: number
  /** 是否开启滚动导航 */
  slidable?: TabsSlidable
}

/**
 * 标签页组件事件接口
 */
interface WdTabsEmits {
  /** 绑定值变化时触发 */
  'update:modelValue': [value: string | number]
  /** 切换标签时触发 */
  change: [event: { index: number; name: string | number }]
  /** 点击禁用标签时触发 */
  disabled: [event: { index: number; name: string | number }]
  /** 点击标签时触发 */
  click: [event: { index: number; name: string | number }]
}

/**
 * Tabs 组件暴露的方法接口
 */
interface WdTabsExpose {
  /** 设置激活的标签页 */
  setActive: (value: string | number, init?: boolean, setScroll?: boolean) => void
  /** 滚动到当前激活的标签页可视区域 */
  scrollIntoView: () => void
  /** 更新底部指示线的样式 */
  updateLineStyle: (animation?: boolean) => Promise<void>
}

/**
 * 标签页组件属性接口
 */
interface WdTabProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 唯一标识符 */
  name?: string | number
  /** tab的标题 */
  title?: string
  /** 是否禁用，无法点击 */
  disabled?: boolean
  /** 是否懒加载，切换到该tab时才加载内容 */
  lazy?: boolean
  /** 徽标属性，透传给 Badge 组件 */
  badgeProps?: Partial<WdBadgeProps>
}

/** Tabs 组件实例类型 */
export type TabsInstance = ComponentPublicInstance<WdTabsProps, WdTabsExpose>
```

参考: src/wd/components/wd-tabs/wd-tabs-key.ts:1-86, src/wd/components/wd-tabs/wd-tabs.vue:458-522, 985, src/wd/components/wd-tab/wd-tab.vue:35-51

---

## 主题定制

### CSS 变量

Tabs 组件提供了以下 CSS 变量用于主题定制:

```scss
// 标签导航栏
$-tabs-nav-height: 88rpx;                              // 导航栏高度
$-tabs-nav-bg: #fff;                                   // 导航栏背景色
$-tabs-nav-fs: 28rpx;                                  // 标签文字大小
$-tabs-nav-color: #323233;                             // 标签文字颜色
$-tabs-nav-active-color: #4d80f0;                      // 激活标签颜色
$-tabs-nav-disabled-color: #c8c9cc;                    // 禁用标签颜色

// 底部指示线
$-tabs-nav-line-width: 40rpx;                          // 指示线宽度
$-tabs-nav-line-height: 6rpx;                          // 指示线高度
$-tabs-nav-line-bg-color: $-tabs-nav-active-color;     // 指示线背景色

// 地图导航
$-tabs-nav-map-fs: 28rpx;                              // 地图导航文字大小
$-tabs-nav-map-color: #323233;                         // 地图导航文字颜色
$-tabs-nav-map-arrow-color: #999;                      // 地图箭头颜色
$-tabs-nav-map-button-back-color: #f4f4f4;            // 地图按钮背景色
$-tabs-nav-map-button-radius: 8rpx;                    // 地图按钮圆角
$-tabs-nav-map-btn-before-bg: linear-gradient(        // 地图按钮渐变
  90deg,
  rgba(255, 255, 255, 0) 0%,
  rgba(255, 255, 255, 1) 100%
);
$-tabs-nav-map-modal-bg: rgba(0, 0, 0, 0.4);          // 地图遮罩背景色

// 暗色主题
.wot-theme-dark {
  $-dark-background: #1a1a1a;
  $-dark-background2: #232323;
  $-dark-background4: #383838;
  $-dark-color: #e5e5e5;
  $-dark-color3: #808080;
  $-dark-color-gray: #555;
}
```

参考: src/wd/components/wd-tabs/wd-tabs.vue:988-1312

### 自定义样式

**基础主题定制:**

```vue
<template>
  <view class="custom-tabs">
    <wd-tabs
      v-model="activeTab"
      color="#ff6b6b"
      inactive-color="#999"
      :line-height="8"
    >
      <wd-tab title="首页">
        <view class="tab-content">首页内容</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**深色主题:**

```vue
<template>
  <view class="dark-tabs wot-theme-dark">
    <wd-tabs v-model="activeTab">
      <wd-tab title="首页">
        <view class="tab-content">首页内容</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**圆角胶囊样式:**

```vue
<template>
  <view class="capsule-tabs">
    <wd-tabs
      v-model="activeTab"
      color="#fff"
      inactive-color="#666"
      :auto-line-width="true"
      :line-height="64"
      custom-class="capsule-style"
    >
      <wd-tab title="首页">
        <view class="tab-content">首页内容</view>
      </wd-tab>
      <wd-tab title="分类">
        <view class="tab-content">分类内容</view>
      </wd-tab>
      <wd-tab title="购物车">
        <view class="tab-content">购物车内容</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

参考: src/wd/components/wd-tabs/wd-tabs.vue:988-1312

---

## 最佳实践

### 1. 选择合适的使用模式

**推荐做法:**

```vue
<!-- ✅ 标签固定且内容结构清晰 - 使用子组件模式 -->
<wd-tabs v-model="activeTab">
  <wd-tab title="商品详情">
    <ProductDetail />
  </wd-tab>
  <wd-tab title="商品参数">
    <ProductParams />
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

**不推荐做法:**

```vue
<!-- ❌ 动态标签使用子组件模式，难以维护 -->
<wd-tabs v-model="activeTab">
  <wd-tab v-for="item in categories" :key="item.id" :title="item.name">
    <CategoryList :category-id="item.id" />
  </wd-tab>
</wd-tabs>

<!-- ❌ 固定标签使用 Items 模式，代码冗余 -->
<wd-tabs v-model="activeTab" :items="fixedTabs">
  <template #item-0>
    <ProductDetail />
  </template>
  <template #item-1>
    <ProductParams />
  </template>
  <template #item-2>
    <ProductReviews />
  </template>
</wd-tabs>
```

**说明:**
- 子组件模式适合标签数量固定、结构清晰的场景
- Items 模式适合标签数量动态变化、从后端获取数据的场景
- 根据实际需求选择合适的模式，避免过度设计

### 2. 合理配置懒加载

**推荐做法:**

```vue
<!-- ✅ 复杂内容启用懒加载 -->
<wd-tabs v-model="activeTab">
  <wd-tab title="推荐" :lazy="true">
    <HeavyComponent />  <!-- 组件较重，懒加载 -->
  </wd-tab>
  <wd-tab title="热门" :lazy="true">
    <LargeList />  <!-- 列表数据多，懒加载 -->
  </wd-tab>
</wd-tabs>

<!-- ✅ 简单内容关闭懒加载 -->
<wd-tabs v-model="activeTab">
  <wd-tab title="基本信息" :lazy="false">
    <view>简单的文字内容</view>
  </wd-tab>
  <wd-tab title="联系方式" :lazy="false">
    <view>联系方式内容</view>
  </wd-tab>
</wd-tabs>
```

**不推荐做法:**

```vue
<!-- ❌ 所有内容都关闭懒加载，初始渲染慢 -->
<wd-tabs v-model="activeTab">
  <wd-tab v-for="i in 20" :key="i" :title="`标签${i}`" :lazy="false">
    <HeavyComponent />
  </wd-tab>
</wd-tabs>

<!-- ❌ 简单内容也启用懒加载，用户体验差 -->
<wd-tabs v-model="activeTab">
  <wd-tab title="提示" :lazy="true">
    <view>一行文字</view>
  </wd-tab>
</wd-tabs>
```

**说明:**
- 内容复杂、数据量大的标签应启用懒加载（默认）
- 内容简单、立即可见的标签可以关闭懒加载
- 懒加载可以优化首屏性能，但会增加切换时的加载时间

### 3. 优化滚动性能

**推荐做法:**

```vue
<!-- ✅ 合理设置滚动阈值 -->
<wd-tabs v-model="activeTab" :slidable-num="6" :map-num="10">
  <wd-tab v-for="i in 15" :key="i" :title="`分类${i}`">
    <CategoryContent />
  </wd-tab>
</wd-tabs>

<!-- ✅ 标签少时强制平铺 -->
<wd-tabs v-model="activeTab" slidable="auto">
  <wd-tab title="全部" />
  <wd-tab title="推荐" />
  <wd-tab title="热门" />
</wd-tabs>
```

**不推荐做法:**

```vue
<!-- ❌ 标签多时不启用滚动，布局挤压 -->
<wd-tabs v-model="activeTab" :slidable-num="100">
  <wd-tab v-for="i in 20" :key="i" :title="`分类${i}`">
    <CategoryContent />
  </wd-tab>
</wd-tabs>

<!-- ❌ 标签少时强制滚动，浪费空间 -->
<wd-tabs v-model="activeTab" slidable="always">
  <wd-tab title="全部" />
  <wd-tab title="推荐" />
</wd-tabs>
```

**说明:**
- 标签数量超过 6 个时建议启用滚动
- 标签数量超过 10 个时建议启用地图导航
- 根据实际标签宽度调整阈值，避免布局问题

### 4. 正确使用 name 标识

**推荐做法:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'

// ✅ 使用语义化的 name 标识
const activeTab = ref('home')
</script>

<template>
  <wd-tabs v-model="activeTab">
    <wd-tab name="home" title="首页">
      <HomePage />
    </wd-tab>
    <wd-tab name="category" title="分类">
      <CategoryPage />
    </wd-tab>
    <wd-tab name="cart" title="购物车">
      <CartPage />
    </wd-tab>
  </wd-tabs>
</template>
```

**不推荐做法:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'

// ❌ name 标识不明确
const activeTab = ref('tab1')
</script>

<template>
  <wd-tabs v-model="activeTab">
    <wd-tab name="tab1" title="首页">
      <HomePage />
    </wd-tab>
    <wd-tab name="tab2" title="分类">
      <CategoryPage />
    </wd-tab>
    <!-- ❌ name 重复 -->
    <wd-tab name="tab1" title="购物车">
      <CartPage />
    </wd-tab>
  </wd-tabs>
</template>
```

**说明:**
- 使用语义化的 name 值，如 `'home'`、`'category'` 而非 `'tab1'`、`'tab2'`
- 确保 name 值唯一，避免冲突
- name 值应该稳定，不随标签顺序变化

### 5. 合理使用动画和手势

**推荐做法:**

```vue
<!-- ✅ 移动端场景启用手势和动画 -->
<wd-tabs v-model="activeTab" :swipeable="true" :animated="true" :duration="300">
  <wd-tab title="推荐">
    <RecommendList />
  </wd-tab>
  <wd-tab title="热门">
    <HotList />
  </wd-tab>
  <wd-tab title="关注">
    <FollowList />
  </wd-tab>
</wd-tabs>

<!-- ✅ 后台管理场景禁用动画 -->
<wd-tabs v-model="activeTab" :animated="false" :swipeable="false">
  <wd-tab title="基本信息">
    <BasicInfo />
  </wd-tab>
  <wd-tab title="详细配置">
    <DetailConfig />
  </wd-tab>
</wd-tabs>
```

**不推荐做法:**

```vue
<!-- ❌ 内容过多启用动画，性能差 -->
<wd-tabs v-model="activeTab" :animated="true">
  <wd-tab v-for="i in 20" :key="i" :title="`标签${i}`">
    <HeavyComponent />
  </wd-tab>
</wd-tabs>

<!-- ❌ PC端启用手势，操作不便 -->
<wd-tabs v-model="activeTab" :swipeable="true">
  <wd-tab title="数据统计">
    <DataChart />
  </wd-tab>
</wd-tabs>
```

**说明:**
- 移动端场景可以启用手势滑动和动画，提升用户体验
- 标签数量多或内容复杂时应禁用动画，避免性能问题
- 根据设备类型和使用场景选择合适的交互方式

---

## 常见问题

### 1. 为什么切换标签后内容没有更新？

**问题原因:**
- 启用了懒加载且内容未触发重新渲染
- v-model 绑定值未正确更新
- 内容组件没有监听标签切换事件

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

const handleChange = (event: { index: number; name: string | number }) => {
  console.log('切换到:', event)
  // 在这里可以执行数据刷新等操作
}
</script>
```

**说明:**
- 关闭懒加载或为子组件添加 `key` 属性强制重新渲染
- 监听 `change` 事件处理标签切换逻辑
- 检查 v-model 绑定是否正确

参考: src/wd/components/wd-tabs/wd-tabs.vue:738-744

### 2. 底部指示线位置不正确或不显示

**问题原因:**
- 组件初始化时标签元素尚未渲染完成
- 动态修改标签后未更新指示线样式
- 自定义样式覆盖了指示线

**解决方案:**

```vue
<template>
  <wd-tabs ref="tabsRef" v-model="activeTab">
    <wd-tab v-for="item in tabs" :key="item.id" :title="item.title">
      <view>{{ item.content }}</view>
    </wd-tab>
  </wd-tabs>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import type { TabsInstance } from '@/wd/components/wd-tabs/wd-tabs.vue'

const activeTab = ref(0)
const tabsRef = ref<TabsInstance>()
const tabs = ref([
  { id: 1, title: '标签1', content: '内容1' },
  { id: 2, title: '标签2', content: '内容2' },
])

// 监听tabs变化，更新指示线
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

**说明:**
- 动态修改标签后调用 `updateLineStyle` 方法更新指示线
- 使用 `nextTick` 确保 DOM 更新完成
- 检查是否有自定义样式覆盖了指示线的显示

参考: src/wd/components/wd-tabs/wd-tabs.vue:669-704, 978-982

### 3. 地图导航无法关闭

**问题原因:**
- 遮罩层点击事件被其他元素阻挡
- 动画状态管理异常
- 事件冒泡被阻止

**解决方案:**

```vue
<template>
  <view class="page">
    <!-- 确保 Tabs 组件的 z-index 正确 -->
    <wd-tabs
      v-model="activeTab"
      :map-num="5"
      custom-style="position: relative; z-index: 10;"
    >
      <wd-tab v-for="i in 10" :key="i" :title="`标签${i}`">
        <view class="tab-content">内容 {{ i }}</view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)
</script>

```

**说明:**
- 检查页面层级关系，确保遮罩层在最上层
- 避免在标签内容中设置过高的 z-index
- 确保遮罩层的点击事件没有被阻止冒泡

参考: src/wd/components/wd-tabs/wd-tabs.vue:785-797, 1260-1269

### 4. 手势滑动不生效

**问题原因:**
- `swipeable` 属性未启用
- 滑动距离小于最小阈值（50px）
- 触摸事件被其他元素拦截
- 滑动方向不是横向

**解决方案:**

```vue
<template>
  <view class="page">
    <wd-tabs v-model="activeTab" :swipeable="true">
      <wd-tab title="标签1">
        <!-- 避免在内容区域使用会拦截触摸事件的组件 -->
        <view class="tab-content" @touchstart.stop="handleTouchStart">
          <view>内容1</view>
        </view>
      </wd-tab>
      <wd-tab title="标签2">
        <view class="tab-content">
          <view>内容2</view>
        </view>
      </wd-tab>
      <wd-tab title="标签3">
        <view class="tab-content">
          <view>内容3</view>
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeTab = ref(0)

// 如果内容区域需要处理触摸事件，不要阻止冒泡
const handleTouchStart = (event: any) => {
  console.log('内容区域触摸', event)
  // 不要调用 event.stopPropagation()
}
</script>

```

**说明:**
- 确保 `swipeable` 属性设置为 `true`
- 滑动距离需要超过 50px 才会触发切换
- 避免在内容区域阻止触摸事件冒泡
- 确保滑动方向是横向（左右），纵向滑动不会触发

参考: src/wd/components/wd-tabs/wd-tabs.vue:828-858

### 5. 粘性布局吸顶位置不正确

**问题原因:**
- `offsetTop` 设置错误
- 自定义导航栏高度未考虑
- 页面布局影响了粘性定位
- 微信小程序兼容性问题

**解决方案:**

```vue
<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      导航栏（高度 88rpx + 状态栏高度）
    </view>

    <view class="content">
      <!-- offsetTop = 导航栏高度 + 状态栏高度 -->
      <wd-tabs
        v-model="activeTab"
        :sticky="true"
        :offset-top="navHeight"
      >
        <wd-tab title="标签1">
          <view class="tab-content">内容1</view>
        </wd-tab>
        <wd-tab title="标签2">
          <view class="tab-content">内容2</view>
        </wd-tab>
      </wd-tabs>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const activeTab = ref(0)
const navHeight = ref(0)

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  const navBarHeight = 88  // rpx 转 px

  // 计算总的导航栏高度（状态栏 + 导航栏）
  navHeight.value = statusBarHeight + navBarHeight
})
</script>

```

**说明:**
- 正确计算 `offsetTop` 值，包括状态栏高度
- 使用 `uni.getSystemInfoSync()` 获取状态栏高度
- 确保页面布局不影响粘性定位
- 测试不同设备和平台的兼容性

参考: src/wd/components/wd-tabs/wd-tabs.vue:3-223, 474-477, 542-543

---

## 注意事项

1. **v-model 绑定值类型**：绑定值可以是数字索引或字符串 name，但必须与标签的 name 类型一致。使用索引时从 0 开始，使用 name 时必须确保每个标签都设置了唯一的 name 属性。

参考: src/wd/components/wd-tabs/wd-tabs.vue:466-467, 637-663

2. **name 唯一性检查**：如果为标签设置了 name 属性，必须确保 name 值唯一。组件会在开发环境下检查 name 冲突并输出警告，重复的 name 会导致切换异常。

参考: src/wd/components/wd-tab/wd-tab.vue:98-109

3. **懒加载与动画冲突**：启用动画模式（`animated="true"`）时，所有标签内容会同时渲染以实现滑动效果，此时懒加载会失效。如果标签数量多且内容复杂，建议禁用动画或关闭懒加载。

参考: src/wd/components/wd-tabs/wd-tabs.vue:611-621

4. **Items 模式的插槽使用**：Items 模式下，默认插槽接收 `item` 和 `index` 参数。如果需要为特定标签自定义内容，需要在 item 中设置 `useSlot: true`，并可选设置 `slotName` 指定插槽名称。

参考: src/wd/components/wd-tabs/wd-tabs.vue:197-207, 396-405

5. **滚动阈值配置**：`slidableNum` 和 `mapNum` 必须是大于 0 的整数。设置为 0 时会禁用对应功能。建议根据标签标题的长度和屏幕宽度合理设置阈值，避免布局问题。

参考: src/wd/components/wd-tabs/wd-tabs.vue:468-469, 538-540, 950-965

6. **底部指示线宽度**：设置了 `lineWidth` 后，`autoLineWidth` 会失效。如果同时设置两个属性，优先使用 `lineWidth` 的值。建议只设置其中一个。

参考: src/wd/components/wd-tabs/wd-tabs.vue:669-704

7. **粘性布局的层级**：启用粘性布局时，标签栏的 z-index 较高。如果页面中有其他固定定位元素（如自定义导航栏、浮动按钮），需要注意层级关系，避免遮挡。

参考: src/wd/components/wd-tabs/wd-tabs.vue:3-223

8. **手势滑动的触发条件**：手势滑动需要满足两个条件：滑动方向为横向、滑动距离超过 50px。纵向滑动或距离不足都不会触发切换。在内容区域有横向滚动元素时，建议禁用手势滑动。

参考: src/wd/components/wd-tabs/wd-tabs.vue:845-858

9. **地图导航的布局**：地图导航使用 3 列宫格布局，标签按钮宽度固定为 214rpx。如果标签标题过长，会自动截断并显示省略号。可以通过 CSS 变量自定义按钮宽度。

参考: src/wd/components/wd-tabs/wd-tabs.vue:1218-1258

10. **动态修改标签**：动态修改标签数量或内容后，需要调用 `updateLineStyle` 方法更新底部指示线的位置。如果使用了横向滚动，还需要调用 `scrollIntoView` 方法调整滚动位置。

参考: src/wd/components/wd-tabs/wd-tabs.vue:669-704, 709-728, 924-945

11. **事件触发顺序**：点击标签时，事件触发顺序为：`click` → `disabled`（如果禁用）或 `change`（如果切换成功）→ `update:modelValue`。在处理事件时需要注意这个顺序。

参考: src/wd/components/wd-tabs/wd-tabs.vue:803-822

12. **子组件模式的性能**：子组件模式使用 `useChildren` 和 `useParent` 建立父子通信。如果标签数量很多（超过 50 个），建议使用 Items 模式以获得更好的性能。

参考: src/wd/components/wd-tabs/wd-tabs.vue:578, src/wd/components/wd-tab/wd-tab.vue:66

---

## 总结

Tabs 标签页组件是一个功能全面、使用灵活的内容切换组件。通过双模式支持、智能滑动、地图导航、粘性布局、手势滑动等特性，可以满足各类标签切换场景的需求。

**使用建议:**

- 固定标签场景优先使用子组件模式
- 动态标签场景使用 Items 模式
- 标签数量多时启用横向滚动和地图导航
- 移动端场景启用手势滑动和动画效果
- 复杂内容启用懒加载优化性能
- 商品详情、文章详情等场景使用粘性布局

**性能优化:**

- 合理使用懒加载，避免一次性渲染大量内容
- 标签数量超过 10 个时考虑分页或筛选
- 避免在动画模式下渲染大量复杂内容
- 动态标签场景及时清理不需要的标签

**最佳体验:**

- 标签标题保持简洁，避免过长
- 合理使用徽标提示未读消息
- 禁用状态给予明确的视觉反馈
- 粘性布局注意吸顶位置的准确性
- 手势滑动配合动画效果提升流畅度
