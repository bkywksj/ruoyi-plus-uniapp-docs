---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/basic/resize
---

# Resize 尺寸监听

## 介绍

Resize 是 WD UI 提供的尺寸监听组件,用于监听元素尺寸变化并触发回调事件。当组件包裹的内容尺寸发生改变时,会自动触发 `resize` 事件,并返回详细的尺寸位置信息。

在移动端开发中,元素尺寸可能因为内容动态加载、用户交互、动画效果等原因发生变化。Resize 组件提供了一种简单可靠的方式来监听这些变化,帮助开发者在尺寸改变时执行相应的逻辑,如重新计算布局、更新图表、调整滚动位置等。

**核心特性:**

- **双滚动检测机制** - 使用两个 scroll-view 分别检测元素变大和变小,确保监听的准确性
- **全方位尺寸信息** - 提供 width、height、top、bottom、left、right 六个维度的详细尺寸位置数据
- **智能事件过滤** - 自动过滤初始化时的无效事件,避免不必要的回调触发
- **高性能实现** - 基于原生滚动事件,性能优异,适合高频尺寸变化场景
- **无侵入设计** - 通过插槽包裹内容,不影响原有布局和样式
- **自动尺寸适配** - 组件容器自动适配内容尺寸,支持宽高自定义
- **跨平台兼容** - 兼容 H5、小程序等多个平台,统一的 API 接口
- **TypeScript 支持** - 完整的类型定义,提供优秀的开发体验

参考: src/wd/components/wd-resize/wd-resize.vue:1-263

## 工作原理

Resize 组件采用独特的双滚动检测机制来监听元素尺寸变化:

### 扩展检测(变大)

使用一个 scroll-view 和极大的占位符(100000rpx × 100000rpx)来检测容器变大:
- 将滚动位置设置到远超当前尺寸的位置
- 当容器变大时,滚动位置相对减小,触发滚动事件

### 收缩检测(变小)

使用另一个 scroll-view 和相对大小的占位符(250% × 250%)来检测容器变小:
- 将滚动位置设置为当前尺寸的3倍
- 当容器变小时,滚动条自动调整到边界,触发滚动事件

### 事件过滤

组件会过滤掉初始化时的前3次无效滚动事件,只在真正的尺寸变化时触发回调。

参考: src/wd/components/wd-resize/wd-resize.vue:18-48,120-143

## 基本用法

### 基础监听

最基本的用法是监听元素尺寸变化,获取实时的尺寸信息:

```vue
<template>
  <view class="demo">
    <view class="info-box">
      <text class="info-title">当前尺寸信息:</text>
      <text class="info-item">宽度: {{ resizeInfo.width }}px</text>
      <text class="info-item">高度: {{ resizeInfo.height }}px</text>
      <text class="info-item">顶部: {{ resizeInfo.top }}px</text>
      <text class="info-item">左侧: {{ resizeInfo.left }}px</text>
    </view>

    <wd-resize @resize="handleResize">
      <view class="content-box" :style="{ width: contentWidth + 'px' }">
        <text>这是一个可变尺寸的内容区域</text>
        <text>点击按钮改变宽度</text>
      </view>
    </wd-resize>

    <view class="button-group">
      <wd-button size="small" @click="setWidth(200)">200px</wd-button>
      <wd-button size="small" @click="setWidth(300)">300px</wd-button>
      <wd-button size="small" @click="setWidth(400)">400px</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const contentWidth = ref(300)
const resizeInfo = ref({
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
})

const handleResize = (info: Record<string, any>) => {
  console.log('元素尺寸变化:', info)
  resizeInfo.value = info
}

const setWidth = (width: number) => {
  contentWidth.value = width
}
</script>

```

**使用说明:**
- 通过 `@resize` 事件监听尺寸变化
- 回调函数接收一个对象,包含 width、height、top、left、bottom、right 六个属性
- 组件会在内容尺寸变化时自动触发回调

参考: src/wd/components/wd-resize/wd-resize.vue:82-84,176-217

### 动态内容监听

监听动态加载内容导致的尺寸变化:

```vue
<template>
  <view class="demo">
    <view class="status-bar">
      <text>当前高度: {{ currentHeight }}px</text>
      <text>变化次数: {{ changeCount }}</text>
    </view>

    <wd-resize @resize="onResize">
      <view class="dynamic-content">
        <text class="title">动态内容列表</text>
        <view
          v-for="item in items"
          :key="item.id"
          class="content-item"
        >
          <text class="item-title">{{ item.title }}</text>
          <text class="item-desc">{{ item.description }}</text>
        </view>

        <wd-button
          v-if="items.length < 10"
          type="primary"
          @click="addItem"
        >
          添加内容
        </wd-button>
        <wd-button
          v-if="items.length > 0"
          type="error"
          @click="removeItem"
        >
          移除内容
        </wd-button>
      </view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Item {
  id: number
  title: string
  description: string
}

const items = ref<Item[]>([
  { id: 1, title: '项目 1', description: '这是第一个项目的描述信息' },
])

const currentHeight = ref(0)
const changeCount = ref(0)

const onResize = (info: Record<string, any>) => {
  currentHeight.value = Math.round(info.height)
  changeCount.value++
  console.log('内容高度变化:', info.height)
}

const addItem = () => {
  const id = items.value.length + 1
  items.value.push({
    id,
    title: `项目 ${id}`,
    description: `这是第${id}个项目的描述信息,包含一些动态加载的内容`,
  })
}

const removeItem = () => {
  items.value.pop()
}
</script>

```

**使用场景:**
- 列表内容动态增删
- 展开/折叠面板
- 加载更多内容
- 异步数据加载

参考: src/wd/components/wd-resize/wd-resize.vue:169-222

### 图表容器监听

监听图表容器尺寸变化,自动重绘图表:

```vue
<template>
  <view class="demo">
    <view class="toolbar">
      <wd-button size="small" @click="toggleFullscreen">
        {{ isFullscreen ? '退出全屏' : '全屏显示' }}
      </wd-button>
    </view>

    <wd-resize @resize="handleChartResize">
      <view
        :class="['chart-container', { fullscreen: isFullscreen }]"
      >
        <text class="chart-title">销售数据统计</text>
        <view class="chart-placeholder">
          <text>图表占位区域</text>
          <text class="chart-size">
            {{ chartSize.width }} × {{ chartSize.height }}
          </text>
        </view>
        <text class="chart-tip">
          实际项目中,这里会渲染 ECharts 等图表组件
        </text>
      </view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isFullscreen = ref(false)
const chartSize = ref({ width: 0, height: 0 })

const handleChartResize = (info: Record<string, any>) => {
  chartSize.value = {
    width: Math.round(info.width),
    height: Math.round(info.height),
  }

  // 实际项目中,这里会调用图表实例的 resize 方法
  // 例如: chartInstance.resize()
  console.log('图表容器尺寸变化,重新渲染图表:', chartSize.value)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}
</script>

```

**使用说明:**
- 图表容器尺寸改变时,需要调用图表实例的 resize 方法重新渲染
- 常见场景: 全屏切换、横竖屏切换、侧边栏展开/收起
- ECharts、uCharts 等图表库都支持 resize 方法

参考: src/wd/components/wd-resize/wd-resize.vue:176-217

### 响应式布局

根据容器尺寸动态调整布局:

```vue
<template>
  <view class="demo">
    <wd-resize @resize="handleLayoutResize">
      <view class="responsive-container">
        <text class="layout-mode">
          当前布局模式: {{ layoutMode }}
        </text>

        <view :class="['grid', layoutMode]">
          <view
            v-for="item in gridItems"
            :key="item.id"
            class="grid-item"
          >
            <wd-icon :name="item.icon" size="40" color="#667eea" />
            <text>{{ item.label }}</text>
          </view>
        </view>

        <view class="layout-info">
          <text>容器宽度: {{ containerWidth }}px</text>
          <text>• 小于 300px: 单列布局</text>
          <text>• 300-500px: 双列布局</text>
          <text>• 大于 500px: 三列布局</text>
        </view>
      </view>
    </wd-resize>

    <view class="controls">
      <wd-button size="small" @click="setContainerWidth(250)">
        窄屏 (250px)
      </wd-button>
      <wd-button size="small" @click="setContainerWidth(400)">
        中等 (400px)
      </wd-button>
      <wd-button size="small" @click="setContainerWidth(600)">
        宽屏 (600px)
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const layoutMode = ref('single')
const containerWidth = ref(0)

const gridItems = [
  { id: 1, icon: 'home', label: '首页' },
  { id: 2, icon: 'search', label: '搜索' },
  { id: 3, icon: 'user', label: '我的' },
  { id: 4, icon: 'setting', label: '设置' },
  { id: 5, icon: 'notification', label: '通知' },
  { id: 6, icon: 'star', label: '收藏' },
]

const handleLayoutResize = (info: Record<string, any>) => {
  containerWidth.value = Math.round(info.width)

  // 根据容器宽度切换布局模式
  if (info.width < 300) {
    layoutMode.value = 'single'
  } else if (info.width < 500) {
    layoutMode.value = 'double'
  } else {
    layoutMode.value = 'triple'
  }
}

const setContainerWidth = (width: number) => {
  // 实际项目中通过改变样式类或状态来改变容器宽度
  console.log('设置容器宽度:', width)
}
</script>

```

**使用场景:**
- 响应式网格布局
- 自适应卡片排列
- 根据容器宽度显示/隐藏元素
- 动态调整字体大小

参考: src/wd/components/wd-resize/wd-resize.vue:176-217

### 折叠面板监听

监听折叠面板展开/收起时的尺寸变化:

```vue
<template>
  <view class="demo">
    <wd-resize @resize="handlePanelResize">
      <view class="accordion-panel">
        <view
          v-for="(panel, index) in panels"
          :key="panel.id"
          class="panel-item"
        >
          <view class="panel-header" @click="togglePanel(index)">
            <text class="panel-title">{{ panel.title }}</text>
            <wd-icon
              :name="panel.expanded ? 'arrow-up' : 'arrow-down'"
              size="24"
            />
          </view>

          <view v-if="panel.expanded" class="panel-content">
            <text>{{ panel.content }}</text>
          </view>
        </view>
      </view>
    </wd-resize>

    <view class="resize-log">
      <text class="log-title">尺寸变化日志:</text>
      <text
        v-for="(log, index) in resizeLogs"
        :key="index"
        class="log-item"
      >
        {{ log }}
      </text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Panel {
  id: number
  title: string
  content: string
  expanded: boolean
}

const panels = ref<Panel[]>([
  {
    id: 1,
    title: '面板 1',
    content: '这是第一个面板的内容,可以展开和收起。面板内容变化时会触发 resize 事件。',
    expanded: false,
  },
  {
    id: 2,
    title: '面板 2',
    content: '这是第二个面板的内容。Resize 组件会自动检测内容高度的变化,并触发回调函数。',
    expanded: false,
  },
  {
    id: 3,
    title: '面板 3',
    content: '这是第三个面板的内容。通过监听尺寸变化,可以执行相应的逻辑,如更新滚动位置。',
    expanded: false,
  },
])

const resizeLogs = ref<string[]>([])

const togglePanel = (index: number) => {
  panels.value[index].expanded = !panels.value[index].expanded
}

const handlePanelResize = (info: Record<string, any>) => {
  const time = new Date().toLocaleTimeString()
  const log = `[${time}] 高度: ${Math.round(info.height)}px`
  resizeLogs.value.unshift(log)

  // 保留最近 5 条日志
  if (resizeLogs.value.length > 5) {
    resizeLogs.value.pop()
  }
}
</script>

```

**使用说明:**
- 折叠面板展开/收起时,内容高度会发生变化
- 通过监听尺寸变化,可以同步更新其他依赖高度的逻辑
- 适合需要精确知道内容高度的场景

参考: src/wd/components/wd-resize/wd-resize.vue:176-217

### 虚拟滚动容器

监听虚拟滚动容器尺寸,计算可视区域项目数量:

```vue
<template>
  <view class="demo">
    <view class="virtual-scroll-info">
      <text>容器高度: {{ containerHeight }}px</text>
      <text>可视项数: {{ visibleItemCount }}</text>
      <text>总项数: {{ totalItems }}</text>
    </view>

    <wd-resize @resize="handleScrollResize">
      <scroll-view
        :class="['virtual-scroll-container', { expanded }]"
        scroll-y
      >
        <view
          v-for="item in visibleItems"
          :key="item.id"
          class="scroll-item"
        >
          <text class="item-index">{{ item.id }}</text>
          <text class="item-label">{{ item.label }}</text>
        </view>
      </scroll-view>
    </wd-resize>

    <wd-button @click="toggleExpand">
      {{ expanded ? '收起容器' : '展开容器' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const expanded = ref(false)
const containerHeight = ref(0)
const itemHeight = 80 // 每项高度 80px
const totalItems = 100

const visibleItemCount = computed(() => {
  return Math.ceil(containerHeight.value / itemHeight)
})

const visibleItems = computed(() => {
  const count = Math.min(visibleItemCount.value + 2, totalItems) // +2 为缓冲
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    label: `列表项 ${i + 1}`,
  }))
})

const handleScrollResize = (info: Record<string, any>) => {
  containerHeight.value = Math.round(info.height)
  console.log('虚拟滚动容器高度:', containerHeight.value)
  console.log('可视项数:', visibleItemCount.value)
}

const toggleExpand = () => {
  expanded.value = !expanded.value
}
</script>

```

**使用场景:**
- 虚拟滚动列表
- 长列表性能优化
- 根据容器高度动态计算渲染项数
- 自适应可视区域

参考: src/wd/components/wd-resize/wd-resize.vue:176-217

## 高级用法

### 自定义容器尺寸

通过 `custom-style` 设置容器的初始尺寸:

```vue
<template>
  <view class="demo">
    <wd-resize
      custom-style="width: 500rpx; height: 400rpx;"
      @resize="handleResize"
    >
      <view class="custom-container">
        <text class="size-display">
          {{ Math.round(size.width) }} × {{ Math.round(size.height) }}
        </text>
        <text class="tip">容器尺寸由 custom-style 控制</text>
      </view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const size = ref({ width: 0, height: 0 })

const handleResize = (info: Record<string, any>) => {
  size.value = { width: info.width, height: info.height }
}
</script>

```

**使用说明:**
- `custom-style` 支持任意 CSS 样式
- 可以设置固定宽高或百分比
- 样式会应用到 Resize 组件的根元素

参考: src/wd/components/wd-resize/wd-resize.vue:5-8,70-71

### 自定义样式类

通过 `custom-class` 和 `custom-container-class` 自定义样式:

```vue
<template>
  <view class="demo">
    <wd-resize
      custom-class="resize-wrapper"
      custom-container-class="resize-content"
      @resize="handleResize"
    >
      <view class="styled-content">
        <text class="title">自定义样式示例</text>
        <text class="desc">
          通过 custom-class 和 custom-container-class 可以自定义组件样式
        </text>
        <text class="size">{{ Math.round(height) }}px</text>
      </view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const height = ref(0)

const handleResize = (info: Record<string, any>) => {
  height.value = info.height
}
</script>

```

**使用说明:**
- `custom-class`: 应用到根元素的自定义类名
- `custom-container-class`: 应用到容器元素的自定义类名
- 使用 `:deep()` 穿透组件样式隔离

参考: src/wd/components/wd-resize/wd-resize.vue:6,13,72-75

### 位置信息获取

获取元素的完整位置信息(top、left、bottom、right):

```vue
<template>
  <view class="demo">
    <view class="position-info">
      <text class="info-title">元素位置信息:</text>
      <view class="info-grid">
        <view class="info-item">
          <text class="label">顶部距离:</text>
          <text class="value">{{ position.top }}px</text>
        </view>
        <view class="info-item">
          <text class="label">左侧距离:</text>
          <text class="value">{{ position.left }}px</text>
        </view>
        <view class="info-item">
          <text class="label">底部距离:</text>
          <text class="value">{{ position.bottom }}px</text>
        </view>
        <view class="info-item">
          <text class="label">右侧距离:</text>
          <text class="value">{{ position.right }}px</text>
        </view>
      </view>
    </view>

    <wd-resize @resize="handlePositionResize">
      <view class="position-box" :style="boxStyle">
        <text>拖动滚动条查看位置变化</text>
      </view>
    </wd-resize>

    <view class="spacer"></view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const position = ref({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
})

const offsetTop = ref(0)

const boxStyle = computed(() => ({
  marginTop: `${offsetTop.value}px`,
}))

const handlePositionResize = (info: Record<string, any>) => {
  position.value = {
    top: Math.round(info.top),
    left: Math.round(info.left),
    bottom: Math.round(info.bottom),
    right: Math.round(info.right),
  }
}
</script>

```

**使用说明:**
- `top`: 元素顶部距离页面顶部的距离
- `left`: 元素左侧距离页面左侧的距离
- `bottom`: 元素底部距离页面顶部的距离
- `right`: 元素右侧距离页面左侧的距离
- 滚动页面时,top 和 bottom 值会实时变化

参考: src/wd/components/wd-resize/wd-resize.vue:180-182,213-215

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-container-class | 自定义容器样式类 | `string` | `''` |

参考: src/wd/components/wd-resize/wd-resize.vue:69-76,87-91

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| resize | 尺寸变化时触发 | `info: { width, height, top, left, bottom, right }` |

**回调参数说明:**
- `width`: 元素宽度(px)
- `height`: 元素高度(px)
- `top`: 元素顶部距离页面顶部的距离(px)
- `left`: 元素左侧距离页面左侧的距离(px)
- `bottom`: 元素底部距离页面顶部的距离(px)
- `right`: 元素右侧距离页面左侧的距离(px)

参考: src/wd/components/wd-resize/wd-resize.vue:81-84,180-182,213-215

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 默认插槽,需要监听尺寸变化的内容 |

参考: src/wd/components/wd-resize/wd-resize.vue:15

### 类型定义

```typescript
/**
 * 尺寸变化检测组件属性接口
 */
interface WdResizeProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义容器样式类 */
  customContainerClass?: string
}

/**
 * 尺寸变化检测组件事件接口
 */
interface WdResizeEmits {
  /** 尺寸变化时触发 */
  resize: [boundingClientRect: Record<string, any>]
}

/**
 * 尺寸信息对象
 */
interface ResizeInfo {
  /** 元素宽度 */
  width: number
  /** 元素高度 */
  height: number
  /** 顶部距离 */
  top: number
  /** 左侧距离 */
  left: number
  /** 底部距离 */
  bottom: number
  /** 右侧距离 */
  right: number
}
```

参考: src/wd/components/wd-resize/wd-resize.vue:66-84

## 技术原理

### 双滚动检测机制

Resize 组件采用两个 scroll-view 分别检测元素变大和变小:

**扩展检测(Expand Detection):**
```vue
<scroll-view
  class="wd-resize__wrapper"
  :scroll-y="true"
  :scroll-top="expandScrollTop"
  :scroll-x="true"
  :scroll-left="expandScrollLeft"
  @scroll="onScrollHandler"
>
  <view style="height: 100000rpx; width: 100000rpx"></view>
</scroll-view>
```

- 使用极大的占位符(100000rpx × 100000rpx)
- 滚动位置设置为 `100000 + lastHeight` 和 `100000 + lastWidth`
- 当容器变大时,滚动位置相对减小,触发滚动事件

**收缩检测(Shrink Detection):**
```vue
<scroll-view
  class="wd-resize__wrapper"
  :scroll-y="true"
  :scroll-top="shrinkScrollTop"
  :scroll-x="true"
  :scroll-left="shrinkScrollLeft"
  @scroll="onScrollHandler"
>
  <view style="height: 250%; width: 250%"></view>
</scroll-view>
```

- 使用相对大小的占位符(250% × 250%)
- 滚动位置设置为 `3 * height` 和 `3 * width`
- 当容器变小时,滚动条自动调整到边界,触发滚动事件

参考: src/wd/components/wd-resize/wd-resize.vue:21-48,135-143

### 滚动位置重置

每次检测到尺寸变化后,需要重置滚动位置以准备下一次检测:

```typescript
const scrollToBottom = ({ lastWidth, lastHeight }: { lastWidth: number; lastHeight: number }) => {
  // 扩展检测：设置一个极大的滚动位置来检测容器变大
  expandScrollTop.value = 100000 + lastHeight
  expandScrollLeft.value = 100000 + lastWidth

  // 收缩检测：设置为当前尺寸的3倍来检测容器变小
  shrinkScrollTop.value = 3 * height.value + lastHeight
  shrinkScrollLeft.value = 3 * width.value + lastWidth
}
```

- 使用闭包记录上次的宽高(`lastWidth`、`lastHeight`)
- 扩展检测滚动位置 = 极大值 + 上次尺寸
- 收缩检测滚动位置 = 当前尺寸 × 3 + 上次尺寸

参考: src/wd/components/wd-resize/wd-resize.vue:120-143

### 事件过滤机制

组件会过滤初始化时的无效事件,只在真正的尺寸变化时触发回调:

```typescript
// 滚动事件计数器
const scrollEventCount = ref<number>(0)

onScrollHandler = () => {
  // 第一次滚动事件：组件初始化完成，通知外部当前容器尺寸
  if (scrollEventCount.value++ === 0) {
    emit('resize', result)
  }

  // 过滤掉滚动条初始化时产生的无效事件（前3次）
  if (scrollEventCount.value < 3) return

  // 检测尺寸变化
  if (newHeight !== lastHeight || newWidth !== lastWidth) {
    emit('resize', result)
  }
}
```

- 第1次事件: 组件初始化完成,触发一次回调
- 第2-3次事件: 滚动条初始化,过滤掉
- 第4次及以后: 真正的尺寸变化,触发回调

参考: src/wd/components/wd-resize/wd-resize.vue:112-222

### 容器尺寸同步

为了防止父容器尺寸坍塌,组件会立即同步容器尺寸:

```typescript
// 立即更新组件状态，防止父容器尺寸坍塌
height.value = newHeight
width.value = newWidth
```

- 容器使用 `position: absolute` 脱离文档流
- 通过动态设置根元素的 `width` 和 `height` 样式保持布局
- 确保 Resize 组件不会影响原有布局

参考: src/wd/components/wd-resize/wd-resize.vue:7,109-111,165-166,194-195,238-242

## 最佳实践

### 1. 图表自动调整尺寸

使用 Resize 组件包裹图表容器,实现图表自动调整尺寸:

```vue
<template>
  <view class="chart-wrapper">
    <!-- ✅ 推荐: 监听容器尺寸变化,自动调整图表 -->
    <wd-resize @resize="handleChartResize">
      <view id="chart-container" class="chart-container"></view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
// import * as echarts from 'echarts'

let chartInstance: any = null

const handleChartResize = (info: Record<string, any>) => {
  // ✅ 推荐: 尺寸变化时调用图表的 resize 方法
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  // 初始化图表
  // chartInstance = echarts.init(document.getElementById('chart-container'))
  // chartInstance.setOption({ ... })
})

// ❌ 不推荐: 手动监听 window resize 事件
// window.addEventListener('resize', () => {
//   if (chartInstance) {
//     chartInstance.resize()
//   }
// })
</script>
```

**优点:**
- 自动响应容器尺寸变化
- 无需手动绑定/解绑事件
- 支持任意导致尺寸变化的情况(不仅是 window resize)

### 2. 虚拟滚动性能优化

结合虚拟滚动,根据容器高度动态计算渲染项数:

```vue
<template>
  <view class="virtual-list">
    <!-- ✅ 推荐: 监听容器高度,动态计算可视项数 -->
    <wd-resize @resize="handleListResize">
      <scroll-view class="list-container" scroll-y @scroll="handleScroll">
        <view :style="{ height: totalHeight + 'px' }">
          <view
            v-for="item in visibleItems"
            :key="item.id"
            :style="{ transform: `translateY(${item.offset}px)` }"
            class="list-item"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const containerHeight = ref(0)
const scrollTop = ref(0)
const itemHeight = 50
const totalItems = 10000

// ✅ 推荐: 根据容器高度计算可视项数
const visibleItemCount = computed(() => {
  return Math.ceil(containerHeight.value / itemHeight) + 2 // +2 为缓冲
})

const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / itemHeight) - 1)
})

const visibleItems = computed(() => {
  const items = []
  const endIndex = Math.min(totalItems, startIndex.value + visibleItemCount.value)

  for (let i = startIndex.value; i < endIndex; i++) {
    items.push({
      id: i,
      label: `项目 ${i}`,
      offset: i * itemHeight,
    })
  }

  return items
})

const totalHeight = computed(() => totalItems * itemHeight)

const handleListResize = (info: Record<string, any>) => {
  containerHeight.value = info.height
}

const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}

// ❌ 不推荐: 使用固定的容器高度
// const containerHeight = 500
</script>
```

**优点:**
- 容器高度变化时自动调整可视项数
- 性能优化,只渲染可视区域内的项目
- 适配不同屏幕尺寸

### 3. 响应式布局切换

根据容器宽度动态切换布局模式:

```vue
<template>
  <view class="responsive-layout">
    <!-- ✅ 推荐: 根据容器宽度切换布局 -->
    <wd-resize @resize="handleLayoutResize">
      <view :class="['content-grid', layoutMode]">
        <view v-for="item in items" :key="item.id" class="grid-item">
          {{ item.label }}
        </view>
      </view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const layoutMode = ref<'mobile' | 'tablet' | 'desktop'>('desktop')

const handleLayoutResize = (info: Record<string, any>) => {
  // ✅ 推荐: 基于容器宽度而非屏幕宽度
  if (info.width < 768) {
    layoutMode.value = 'mobile'
  } else if (info.width < 1024) {
    layoutMode.value = 'tablet'
  } else {
    layoutMode.value = 'desktop'
  }
}

// ❌ 不推荐: 基于屏幕宽度判断
// const layoutMode = computed(() => {
//   const screenWidth = uni.getSystemInfoSync().windowWidth
//   if (screenWidth < 768) return 'mobile'
//   if (screenWidth < 1024) return 'tablet'
//   return 'desktop'
// })
</script>

```

**优点:**
- 真正的容器查询(Container Query)效果
- 组件可以在任意容器中自适应
- 不依赖全局屏幕尺寸

### 4. 动态内容加载

监听内容区域尺寸,判断是否需要加载更多内容:

```vue
<template>
  <view class="content-wrapper">
    <!-- ✅ 推荐: 监听内容高度,自动加载更多 -->
    <wd-resize @resize="handleContentResize">
      <view class="content-list">
        <view v-for="item in items" :key="item.id" class="content-item">
          {{ item.content }}
        </view>
        <view v-if="loading" class="loading">加载中...</view>
      </view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const items = ref([{ id: 1, content: '内容1' }])
const loading = ref(false)
let lastHeight = 0

const handleContentResize = (info: Record<string, any>) => {
  const currentHeight = info.height

  // ✅ 推荐: 检测内容高度变化,判断是否触底
  if (currentHeight > lastHeight) {
    // 内容增加,检查是否需要加载更多
    checkLoadMore(info)
  }

  lastHeight = currentHeight
}

const checkLoadMore = (info: Record<string, any>) => {
  // 如果内容高度小于容器高度的2倍,加载更多
  if (info.height < window.innerHeight * 2 && !loading.value) {
    loadMore()
  }
}

const loadMore = async () => {
  loading.value = true
  // 模拟加载数据
  await new Promise(resolve => setTimeout(resolve, 1000))
  const newId = items.value.length + 1
  items.value.push({ id: newId, content: `内容${newId}` })
  loading.value = false
}

// ❌ 不推荐: 使用滚动事件判断
// onScroll((e) => {
//   if (scrollTop + containerHeight >= contentHeight - 100) {
//     loadMore()
//   }
// })
</script>
```

**优点:**
- 自动检测内容不足,提前加载
- 优化用户体验,减少等待时间
- 适合瀑布流、信息流等场景

### 5. 防抖处理

对于高频尺寸变化,使用防抖优化性能:

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐: 对高频操作进行防抖 -->
    <wd-resize @resize="handleResizeDebounced">
      <view class="content">
        <!-- 可能频繁变化的内容 -->
      </view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

let resizeTimer: NodeJS.Timeout | null = null

// ✅ 推荐: 使用防抖函数
const handleResizeDebounced = (info: Record<string, any>) => {
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }

  resizeTimer = setTimeout(() => {
    handleResize(info)
  }, 100) // 100ms 防抖
}

const handleResize = (info: Record<string, any>) => {
  console.log('尺寸变化:', info)
  // 执行实际的逻辑
}

// ❌ 不推荐: 不做任何防抖处理
// const handleResize = (info) => {
//   // 每次尺寸变化都执行,可能导致性能问题
//   console.log('尺寸变化:', info)
// }
</script>
```

**优点:**
- 减少不必要的函数调用
- 提升性能,特别是在复杂操作中
- 避免频繁触发导致的卡顿

参考: src/wd/components/wd-resize/wd-resize.vue:169-222

## 常见问题

### 1. 初始化时触发多次 resize 事件

**问题原因:**
- 组件初始化时会触发一次 resize 事件,通知外部当前容器尺寸
- 滚动条初始化会产生额外的滚动事件
- 内容异步加载导致多次尺寸变化

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐: 使用标志位过滤初始化事件 -->
    <wd-resize @resize="handleResize">
      <view class="content">内容</view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isInitialized = ref(false)

const handleResize = (info: Record<string, any>) => {
  if (!isInitialized.value) {
    // ✅ 第一次回调,记录初始尺寸
    isInitialized.value = true
    console.log('初始尺寸:', info)
    return
  }

  // ✅ 后续回调,处理尺寸变化
  console.log('尺寸变化:', info)
}

// ❌ 不推荐: 不做任何过滤
// const handleResize = (info) => {
//   // 初始化时也会执行,可能不符合预期
//   updateLayout(info)
// }
</script>
```

**技术原理:**
- 组件内部使用 `scrollEventCount` 计数器过滤前3次无效事件
- 第1次事件是组件初始化完成的通知
- 第2-3次事件是滚动条初始化产生的

参考: src/wd/components/wd-resize/wd-resize.vue:112-113,177-188

### 2. 尺寸变化但事件未触发

**问题原因:**
- 容器使用了 `position: fixed` 或 `position: absolute` 且未设置宽高
- 内容尺寸变化但容器被父元素限制
- 容器设置了 `overflow: hidden` 且固定尺寸

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ❌ 错误: 容器固定尺寸,内容变化不会触发 resize -->
    <view class="fixed-container">
      <wd-resize @resize="handleResize">
        <view class="content">
          <!-- 内容增加但容器尺寸不变 -->
        </view>
      </wd-resize>
    </view>

    <!-- ✅ 正确: 容器尺寸跟随内容变化 -->
    <wd-resize @resize="handleResize">
      <view class="dynamic-content">
        <!-- 内容增加,容器自动扩展 -->
      </view>
    </wd-resize>
  </view>
</template>

```

**解决建议:**
- 确保 Resize 组件的父容器尺寸可以随内容变化
- 避免使用固定宽高限制容器
- 如需限制尺寸,使用 `max-width`/`max-height` 而非 `width`/`height`

参考: src/wd/components/wd-resize/wd-resize.vue:238-242

### 3. 在滚动容器中位置信息不准确

**问题原因:**
- `boundingClientRect` 返回的是相对于视口的位置
- 滚动时元素相对于视口的位置会变化
- 需要结合滚动位置计算元素的绝对位置

**解决方案:**

```vue
<template>
  <scroll-view class="scroll-container" scroll-y @scroll="handleScroll">
    <wd-resize @resize="handleResize">
      <view class="content">内容</view>
    </wd-resize>
  </scroll-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const scrollTop = ref(0)

const handleScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop
}

const handleResize = (info: Record<string, any>) => {
  // ✅ 正确: 结合滚动位置计算绝对位置
  const absoluteTop = info.top + scrollTop.value
  const absoluteBottom = info.bottom + scrollTop.value

  console.log('相对位置:', info.top, info.bottom)
  console.log('绝对位置:', absoluteTop, absoluteBottom)
}

// ❌ 不推荐: 直接使用相对位置
// const handleResize = (info) => {
//   // 滚动后位置信息会不准确
//   console.log('位置:', info.top, info.bottom)
// }
</script>
```

**使用说明:**
- `top`、`bottom`、`left`、`right` 是相对于视口的位置
- 在滚动容器中,需要加上滚动偏移量获取绝对位置
- H5 端可以使用 `element.offsetTop` 获取相对于文档的位置

参考: src/wd/components/wd-resize/wd-resize.vue:153-158,170-175

### 4. 性能问题:频繁触发 resize 事件

**问题原因:**
- 内容快速变化导致高频触发 resize 事件
- 回调函数执行复杂操作(如图表重绘)
- 没有做防抖或节流处理

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐: 使用防抖优化性能 -->
    <wd-resize @resize="handleResizeDebounced">
      <view class="content">
        <!-- 可能频繁变化的内容 -->
      </view>
    </wd-resize>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

let resizeTimer: NodeJS.Timeout | null = null
const resizeCount = ref(0)

// ✅ 推荐: 防抖处理
const handleResizeDebounced = (info: Record<string, any>) => {
  resizeCount.value++

  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }

  resizeTimer = setTimeout(() => {
    // 只在最后一次变化后执行
    performExpensiveOperation(info)
  }, 150)
}

const performExpensiveOperation = (info: Record<string, any>) => {
  console.log(`触发 ${resizeCount.value} 次,实际执行 1 次`)
  // 执行复杂操作:图表重绘、布局计算等
}

// ❌ 不推荐: 不做任何优化
// const handleResize = (info) => {
//   // 每次尺寸变化都执行复杂操作
//   performExpensiveOperation(info)
// }

// ✅ 可选: 节流处理(适合需要实时反馈的场景)
// let lastExecuteTime = 0
// const handleResizeThrottled = (info) => {
//   const now = Date.now()
//   if (now - lastExecuteTime >= 100) {
//     lastExecuteTime = now
//     performExpensiveOperation(info)
//   }
// }
</script>
```

**优化建议:**
- 使用防抖(debounce)延迟执行,适合最终状态操作
- 使用节流(throttle)限制频率,适合需要实时反馈的场景
- 防抖延迟建议: 100-200ms
- 节流间隔建议: 100-150ms

参考: src/wd/components/wd-resize/wd-resize.vue:169-222

### 5. 在弹窗/抽屉中无法正常工作

**问题原因:**
- 弹窗/抽屉初始状态为隐藏,尺寸为 0
- 显示时内容还未渲染完成
- 动画过程中尺寸不稳定

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-button @click="showModal = true">打开弹窗</wd-button>

    <!-- ❌ 错误: 弹窗隐藏时 Resize 无法获取正确尺寸 -->
    <view v-if="showModal" class="modal">
      <wd-resize @resize="handleResize">
        <view class="modal-content">内容</view>
      </wd-resize>
    </view>

    <!-- ✅ 正确: 使用 v-show 或等待动画完成 -->
    <view v-show="showModal" class="modal">
      <wd-resize @resize="handleResize">
        <view class="modal-content">内容</view>
      </wd-resize>
    </view>

    <!-- ✅ 更好: 在 after-enter 回调中处理 -->
    <wd-transition :show="showModal" name="fade" @after-enter="onModalEntered">
      <view class="modal">
        <wd-resize v-if="isModalEntered" @resize="handleResize">
          <view class="modal-content">内容</view>
        </wd-resize>
      </view>
    </wd-transition>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showModal = ref(false)
const isModalEntered = ref(false)

const onModalEntered = () => {
  // ✅ 等待进入动画完成后再挂载 Resize
  isModalEntered.value = true
}

const handleResize = (info: Record<string, any>) => {
  console.log('弹窗内容尺寸:', info)
}

// ❌ 不推荐: 立即处理
// watch(showModal, (val) => {
//   if (val) {
//     // 此时弹窗可能还未渲染完成
//     handleResize()
//   }
// })
</script>
```

**解决建议:**
- 使用 `v-show` 而非 `v-if` 保持 DOM 存在
- 在动画完成后再挂载 Resize 组件
- 使用 `nextTick` 确保 DOM 更新完成
- 给予足够的延迟时间(如 100ms)等待渲染完成

参考: src/wd/components/wd-resize/wd-resize.vue:151-227

## 注意事项

1. **容器约束**
   - Resize 组件的容器需要脱离文档流(使用 `position: absolute`)
   - 确保父容器可以随内容尺寸变化
   - 避免给 Resize 组件的直接父容器设置固定宽高

2. **性能考虑**
   - 对于复杂的回调操作,建议使用防抖或节流
   - 避免在 resize 回调中执行同步的重度计算
   - 大量 Resize 组件同时存在时可能影响性能

3. **初始化行为**
   - 组件挂载后会触发一次 resize 事件,提供初始尺寸
   - 前3次滚动事件会被过滤,只有真正的尺寸变化才会触发回调
   - 如需区分初始化和变化,使用标志位判断

4. **尺寸信息准确性**
   - 返回的 top、left、bottom、right 是相对于视口的位置
   - 在滚动容器中需要结合滚动位置计算绝对位置
   - width 和 height 是元素的实际渲染尺寸(像素值)

5. **平台兼容性**
   - 组件基于 scroll-view 和 boundingClientRect 实现
   - 兼容 H5、微信小程序等主流平台
   - 不同平台的滚动事件触发时机可能略有差异

6. **使用场景限制**
   - 不适合监听 window 或 viewport 尺寸变化
   - 不适合监听固定尺寸的容器
   - 适合监听内容驱动的动态尺寸变化

参考: src/wd/components/wd-resize/wd-resize.vue:9-12,238-242
