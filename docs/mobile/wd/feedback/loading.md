---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/loading
---

# Loading 加载指示器

## 介绍

Loading 加载指示器是一个轻量级的加载动画组件,用于表示数据加载、异步操作等过渡状态。组件基于 SVG 图形和 CSS3 动画实现,支持多种样式和自定义配置,可以灵活应用于各种业务场景。

**核心特性:**

- **双类型支持** - 提供 outline(外边框)和 ring(环形)两种加载样式,满足不同视觉需求
- **SVG 矢量图形** - 基于 SVG 实现,支持任意尺寸缩放而不失真,保证在不同设备上的显示效果
- **流畅旋转动画** - 使用 CSS3 @keyframes 动画,旋转速度为 2 秒/圈,视觉效果流畅自然
- **自定义颜色** - 支持自定义主色调,ring 类型自动计算渐变中间色,实现丰富的视觉层次
- **灵活尺寸控制** - 支持数字和字符串两种尺寸格式,自动单位转换(rpx/px)
- **Base64 编码优化** - SVG 内容转换为 base64 格式,减少 HTTP 请求,提升加载性能
- **唯一 ID 机制** - 每个组件实例生成独立的 SVG 定义 ID,避免多实例渲染冲突
- **响应式更新** - 监听 type、color、size 属性变化,自动重新构建 SVG 内容
- **渐变色计算** - ring 类型自动计算主色到白色的渐变中间色,无需手动配置
- **组件配置灵活** - 支持 virtualHost、addGlobalClass、shared 样式隔离等 UniApp 高级特性
- **样式隔离友好** - 使用 shared 模式,支持全局样式覆盖和自定义主题
- **轻量级实现** - 核心代码不到 200 行,打包体积小,性能开销低

参考: src/wd/components/wd-loading/wd-loading.vue:1-193

## 基本用法

### 基础加载指示器

最简单的使用方式,不传入任何参数使用默认配置:默认为 ring 类型、蓝色(#4D80F0)、45rpx 尺寸。

```vue
<template>
  <view class="demo">
    <wd-loading />
  </view>
</template>

<script lang="ts" setup>
</script>

```

**默认配置:**
- **类型**: ring(环形加载器)
- **颜色**: #4D80F0(蓝色)
- **尺寸**: 45rpx
- **动画**: 2 秒/圈旋转

参考: src/wd/components/wd-loading/wd-loading.vue:50-56

### 加载类型

Loading 组件提供两种加载指示器类型,通过 `type` 属性设置:
- `ring`: 环形加载器,带有渐变效果和圆点装饰,视觉层次丰富
- `outline`: 外边框加载器,简洁清晰,适合极简风格

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <text class="demo-label">ring 环形</text>
      <wd-loading type="ring" />
    </view>

    <view class="demo-item">
      <text class="demo-label">outline 外边框</text>
      <wd-loading type="outline" />
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**类型说明:**

| 类型 | 视觉效果 | 适用场景 |
|------|---------|---------|
| ring | 环形渐变 + 圆点 | 数据加载、页面刷新、内容等待 |
| outline | 双环边框 | 按钮加载、简约场景、小尺寸显示 |

**技术实现:**
- ring 类型使用双 linearGradient 渐变,从主色渐变到中间色,再从透明渐变到中间色
- outline 类型使用单 linearGradient,从透明渐变到白色,叠加在实心圆环上
- 顶部圆点(ring)使用 `<circle>` 元素,坐标 (100, 10),半径 10

参考: src/wd/components/wd-loading/wd-loading.vue:72-91

### 自定义颜色

通过 `color` 属性自定义加载指示器的主色调。ring 类型会自动计算渐变中间色,无需手动配置。

```vue
<template>
  <view class="demo">
    <view class="demo-row">
      <view class="demo-item">
        <text class="demo-label">默认蓝色</text>
        <wd-loading color="#4D80F0" />
      </view>

      <view class="demo-item">
        <text class="demo-label">成功绿色</text>
        <wd-loading color="#00C851" />
      </view>
    </view>

    <view class="demo-row">
      <view class="demo-item">
        <text class="demo-label">警告橙色</text>
        <wd-loading color="#FF8800" />
      </view>

      <view class="demo-item">
        <text class="demo-label">错误红色</text>
        <wd-loading color="#FF4444" />
      </view>
    </view>

    <view class="demo-row">
      <view class="demo-item">
        <text class="demo-label">紫色</text>
        <wd-loading color="#AA66CC" />
      </view>

      <view class="demo-item">
        <text class="demo-label">深灰色</text>
        <wd-loading color="#666666" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**颜色处理机制:**
- 支持任意合法的 CSS 颜色值(HEX、RGB、RGBA、颜色名称等)
- ring 类型会调用 `gradient()` 函数计算主色到白色的中间渐变色
- 渐变色用于两个 linearGradient 定义,实现平滑的颜色过渡效果
- 颜色变化会触发 SVG 重新构建,实时更新显示

**渐变色计算:**
```typescript
// 生成从 color 到 #ffffff 的 2 级渐变色
intermediateColor.value = gradient(props.color, '#ffffff', 2)[1]
```

参考: src/wd/components/wd-loading/wd-loading.vue:144-148

### 自定义尺寸

通过 `size` 属性设置加载指示器的尺寸,支持数字(默认 rpx)和字符串(带单位)两种格式。

```vue
<template>
  <view class="demo">
    <view class="demo-row">
      <view class="demo-item">
        <text class="demo-label">小尺寸 30rpx</text>
        <wd-loading :size="30" />
      </view>

      <view class="demo-item">
        <text class="demo-label">默认 45rpx</text>
        <wd-loading :size="45" />
      </view>

      <view class="demo-item">
        <text class="demo-label">大尺寸 60rpx</text>
        <wd-loading :size="60" />
      </view>
    </view>

    <view class="demo-row">
      <view class="demo-item">
        <text class="demo-label">超大 80rpx</text>
        <wd-loading :size="80" />
      </view>

      <view class="demo-item">
        <text class="demo-label">像素 40px</text>
        <wd-loading size="40px" />
      </view>

      <view class="demo-item">
        <text class="demo-label">百分比 100%</text>
        <wd-loading size="100%" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**尺寸格式:**
- **数字**: 直接传数字,自动添加 rpx 单位,如 `:size="45"` → `45rpx`
- **字符串**: 传带单位的字符串,如 `size="40px"` `size="2em"` `size="100%"`

**单位转换逻辑:**
```typescript
// addUnit 函数处理单位
iconSize.value = addUnit(newVal)
// 数字 → 添加 rpx
// 已带单位的字符串 → 直接使用
```

参考: src/wd/components/wd-loading/wd-loading.vue:97-106

### 类型与颜色组合

将不同的类型和颜色组合使用,创建丰富的视觉效果。

```vue
<template>
  <view class="demo">
    <view class="demo-section">
      <text class="demo-title">Ring 环形类型</text>
      <view class="demo-row">
        <view class="demo-item">
          <wd-loading type="ring" color="#4D80F0" />
          <text class="demo-label">蓝色</text>
        </view>
        <view class="demo-item">
          <wd-loading type="ring" color="#00C851" />
          <text class="demo-label">绿色</text>
        </view>
        <view class="demo-item">
          <wd-loading type="ring" color="#FF8800" />
          <text class="demo-label">橙色</text>
        </view>
        <view class="demo-item">
          <wd-loading type="ring" color="#FF4444" />
          <text class="demo-label">红色</text>
        </view>
      </view>
    </view>

    <view class="demo-section">
      <text class="demo-title">Outline 外边框类型</text>
      <view class="demo-row">
        <view class="demo-item">
          <wd-loading type="outline" color="#4D80F0" />
          <text class="demo-label">蓝色</text>
        </view>
        <view class="demo-item">
          <wd-loading type="outline" color="#00C851" />
          <text class="demo-label">绿色</text>
        </view>
        <view class="demo-item">
          <wd-loading type="outline" color="#FF8800" />
          <text class="demo-label">橙色</text>
        </view>
        <view class="demo-item">
          <wd-loading type="outline" color="#FF4444" />
          <text class="demo-label">红色</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**组合说明:**
- ring 类型颜色丰富,适合强调状态(成功/警告/错误等)
- outline 类型简洁清晰,适合按钮或小区域加载提示
- 颜色建议与业务状态对应:蓝色(信息)、绿色(成功)、橙色(警告)、红色(错误)

参考: src/wd/components/wd-loading/wd-loading.vue:78-90

### 内联使用

Loading 组件默认为 `display: inline-block`,可以直接内联在文本或其他元素中使用。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <text class="demo-text">加载中</text>
      <wd-loading :size="30" />
    </view>

    <view class="demo-item">
      <wd-loading :size="30" />
      <text class="demo-text">正在提交...</text>
    </view>

    <view class="demo-item">
      <text class="demo-text">数据同步中</text>
      <wd-loading :size="30" color="#00C851" />
      <text class="demo-text">请稍候</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**内联特性:**
- 组件设置了 `vertical-align: middle`,与文本垂直居中对齐
- `font-size: 0` 和 `line-height: 0` 消除内联元素的空白间隙
- 通过调整 size 属性匹配文本大小,建议文本 28rpx 对应 loading 30rpx

参考: src/wd/components/wd-loading/wd-loading.vue:157-163

### 在按钮中使用

将 Loading 组件集成到按钮中,实现加载状态的按钮效果。

```vue
<template>
  <view class="demo">
    <view class="demo-section">
      <text class="demo-title">普通按钮加载</text>
      <button class="custom-button" :disabled="isLoading" @click="handleSubmit">
        <wd-loading v-if="isLoading" :size="30" color="#ffffff" />
        <text class="button-text">{{ isLoading ? '提交中...' : '提交' }}</text>
      </button>
    </view>

    <view class="demo-section">
      <text class="demo-title">主要按钮加载</text>
      <button class="primary-button" :disabled="isLoadingPrimary" @click="handlePrimaryClick">
        <wd-loading v-if="isLoadingPrimary" :size="30" color="#ffffff" />
        <text class="button-text">{{ isLoadingPrimary ? '保存中...' : '保存' }}</text>
      </button>
    </view>

    <view class="demo-section">
      <text class="demo-title">成功按钮加载</text>
      <button class="success-button" :disabled="isLoadingSuccess" @click="handleSuccessClick">
        <wd-loading v-if="isLoadingSuccess" :size="30" color="#ffffff" />
        <text class="button-text">{{ isLoadingSuccess ? '上传中...' : '上传' }}</text>
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isLoading = ref(false)
const isLoadingPrimary = ref(false)
const isLoadingSuccess = ref(false)

const handleSubmit = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

const handlePrimaryClick = () => {
  isLoadingPrimary.value = true
  setTimeout(() => {
    isLoadingPrimary.value = false
  }, 2000)
}

const handleSuccessClick = () => {
  isLoadingSuccess.value = true
  setTimeout(() => {
    isLoadingSuccess.value = false
  }, 2000)
}
</script>

```

**实现要点:**
- 使用 `v-if` 控制 loading 显示/隐藏
- 加载时禁用按钮,防止重复点击
- Loading 颜色设置为白色,与按钮背景形成对比
- 文本动态切换,提示当前操作状态

参考: src/wd/components/wd-loading/wd-loading.vue:157-163

### 自定义样式

通过 `customClass` 和 `customStyle` 属性自定义组件样式。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <text class="demo-label">自定义类名</text>
      <wd-loading custom-class="my-loading" />
    </view>

    <view class="demo-item">
      <text class="demo-label">自定义样式</text>
      <wd-loading custom-style="opacity: 0.5; border-radius: 50%;" />
    </view>

    <view class="demo-item">
      <text class="demo-label">背景色 + 边框</text>
      <wd-loading
        custom-style="background-color: #f5f5f5; padding: 20rpx; border-radius: 8rpx;"
        color="#4D80F0"
      />
    </view>

    <view class="demo-item">
      <text class="demo-label">阴影效果</text>
      <wd-loading
        custom-style="box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1); padding: 16rpx; background: #fff; border-radius: 50%;"
        :size="50"
        color="#FF8800"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**样式自定义说明:**
- `customClass`: 添加自定义 CSS 类,需要使用 `:deep()` 穿透样式隔离
- `customStyle`: 内联样式字符串,直接应用到根元素
- 可以添加背景、边框、阴影等装饰效果
- 注意保持 Loading 区域足够大,避免动画被裁剪

参考: src/wd/components/wd-loading/wd-loading.vue:4-6

## 高级用法

### 全屏加载遮罩

结合遮罩层实现全屏加载效果,常用于页面初始化或重要操作。

```vue
<template>
  <view class="demo">
    <button class="demo-button" @click="showFullLoading">显示全屏加载</button>

    <!-- 全屏加载遮罩 -->
    <view v-if="isFullLoading" class="loading-overlay" @click="hideFullLoading">
      <view class="loading-container">
        <wd-loading :size="80" color="#ffffff" />
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isFullLoading = ref(false)

const showFullLoading = () => {
  isFullLoading.value = true

  // 模拟异步操作
  setTimeout(() => {
    isFullLoading.value = false
  }, 3000)
}

const hideFullLoading = () => {
  isFullLoading.value = false
}
</script>

```

**实现要点:**
- 使用 `position: fixed` 实现全屏覆盖
- 背景半透明黑色 `rgba(0, 0, 0, 0.7)` 突出加载状态
- Loading 颜色设置为白色,与深色背景形成对比
- `z-index: 9999` 确保遮罩层在最上层
- 点击遮罩层可关闭(根据业务需求决定是否允许)

参考: src/wd/components/wd-loading/wd-loading.vue:157-163

### 局部加载遮罩

在特定区域内显示加载状态,不影响其他区域的交互。

```vue
<template>
  <view class="demo">
    <view class="content-card">
      <view class="card-header">
        <text class="card-title">数据列表</text>
        <button class="refresh-button" @click="refreshData">刷新</button>
      </view>

      <view class="card-body">
        <view v-if="!isLoading" class="data-list">
          <view v-for="item in dataList" :key="item.id" class="data-item">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-desc">{{ item.description }}</text>
          </view>
        </view>

        <!-- 局部加载遮罩 -->
        <view v-if="isLoading" class="local-loading">
          <wd-loading :size="60" color="#4D80F0" />
          <text class="loading-tip">数据加载中...</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface DataItem {
  id: number
  title: string
  description: string
}

const isLoading = ref(false)
const dataList = ref<DataItem[]>([
  { id: 1, title: '数据项 1', description: '这是第一条数据' },
  { id: 2, title: '数据项 2', description: '这是第二条数据' },
  { id: 3, title: '数据项 3', description: '这是第三条数据' },
])

const refreshData = () => {
  isLoading.value = true

  setTimeout(() => {
    dataList.value = [
      { id: 1, title: '数据项 1(已更新)', description: '数据已刷新' },
      { id: 2, title: '数据项 2(已更新)', description: '数据已刷新' },
      { id: 3, title: '数据项 3(已更新)', description: '数据已刷新' },
    ]
    isLoading.value = false
  }, 2000)
}
</script>

```

**实现要点:**
- 父容器设置 `position: relative`,遮罩层设置 `position: absolute`
- 遮罩层背景半透明白色,保持与页面整体风格一致
- 使用 `v-if` 切换数据列表和加载状态,避免内容叠加
- 设置 `min-height` 保证遮罩层有足够的显示空间

参考: src/wd/components/wd-loading/wd-loading.vue:157-163

### 列表加载更多

在列表底部显示加载状态,实现下拉加载更多功能。

```vue
<template>
  <view class="demo">
    <scroll-view
      class="scroll-container"
      scroll-y
      @scrolltolower="loadMore"
    >
      <view class="list">
        <view v-for="item in list" :key="item.id" class="list-item">
          <text class="item-number">{{ item.id }}</text>
          <text class="item-content">{{ item.content }}</text>
        </view>
      </view>

      <!-- 加载更多状态 -->
      <view v-if="hasMore" class="load-more">
        <wd-loading v-if="isLoadingMore" :size="40" color="#4D80F0" />
        <text class="load-more-text">
          {{ isLoadingMore ? '加载中...' : '上拉加载更多' }}
        </text>
      </view>

      <!-- 没有更多数据 -->
      <view v-else class="no-more">
        <text class="no-more-text">没有更多数据了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface ListItem {
  id: number
  content: string
}

const list = ref<ListItem[]>([])
const isLoadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)

// 初始化数据
const initData = () => {
  for (let i = 1; i <= 10; i++) {
    list.value.push({
      id: i,
      content: `列表项 ${i} 的内容描述`,
    })
  }
}

initData()

// 加载更多
const loadMore = () => {
  if (isLoadingMore.value || !hasMore.value) return

  isLoadingMore.value = true

  setTimeout(() => {
    const start = page.value * 10 + 1
    const end = start + 9

    for (let i = start; i <= end; i++) {
      list.value.push({
        id: i,
        content: `列表项 ${i} 的内容描述`,
      })
    }

    page.value++

    // 模拟数据加载完毕
    if (page.value >= 5) {
      hasMore.value = false
    }

    isLoadingMore.value = false
  }, 1500)
}
</script>

```

**实现要点:**
- 使用 `scroll-view` 组件的 `scrolltolower` 事件监听滚动到底部
- 通过 `isLoadingMore` 和 `hasMore` 标志位控制加载状态
- 防止重复触发:加载中或无更多数据时直接返回
- 数据加载完成后显示"没有更多数据"提示

参考: src/wd/components/wd-loading/wd-loading.vue:157-163

### 骨架屏占位

在首次加载时使用 Loading 作为骨架屏占位,提升用户体验。

```vue
<template>
  <view class="demo">
    <view v-if="!isDataLoaded" class="skeleton-container">
      <view class="skeleton-header">
        <view class="skeleton-avatar">
          <wd-loading :size="80" color="#e0e0e0" />
        </view>
        <view class="skeleton-info">
          <view class="skeleton-line">
            <wd-loading :size="30" color="#e0e0e0" type="outline" />
          </view>
          <view class="skeleton-line">
            <wd-loading :size="30" color="#e0e0e0" type="outline" />
          </view>
        </view>
      </view>

      <view class="skeleton-content">
        <view v-for="index in 3" :key="index" class="skeleton-card">
          <wd-loading :size="40" color="#e0e0e0" />
          <text class="skeleton-text">加载中...</text>
        </view>
      </view>
    </view>

    <view v-else class="content-loaded">
      <view class="user-header">
        <image class="user-avatar" src="/static/avatar.png" mode="aspectFill" />
        <view class="user-info">
          <text class="user-name">用户名称</text>
          <text class="user-desc">这是用户的个人描述</text>
        </view>
      </view>

      <view class="user-content">
        <view v-for="index in 3" :key="index" class="content-card">
          <text class="card-title">内容卡片 {{ index }}</text>
          <text class="card-desc">这是内容卡片的描述信息</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const isDataLoaded = ref(false)

onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    isDataLoaded.value = true
  }, 3000)
})
</script>

```

**实现要点:**
- 骨架屏背景色使用浅灰色(#f0f0f0),Loading 颜色使用深一点的灰色(#e0e0e0)
- 骨架屏结构与真实内容布局保持一致,减少加载完成后的跳变
- 使用 `v-if` 切换骨架屏和真实内容
- 在 `onMounted` 中加载数据,完成后隐藏骨架屏

参考: src/wd/components/wd-loading/wd-loading.vue:157-163

### 动态切换类型

根据业务状态动态切换 Loading 的类型和颜色。

```vue
<template>
  <view class="demo">
    <view class="control-panel">
      <text class="panel-title">控制面板</text>

      <view class="control-group">
        <text class="control-label">类型:</text>
        <button
          class="control-button"
          :class="{ active: loadingType === 'ring' }"
          @click="loadingType = 'ring'"
        >
          Ring
        </button>
        <button
          class="control-button"
          :class="{ active: loadingType === 'outline' }"
          @click="loadingType = 'outline'"
        >
          Outline
        </button>
      </view>

      <view class="control-group">
        <text class="control-label">颜色:</text>
        <button
          v-for="item in colorOptions"
          :key="item.value"
          class="color-button"
          :style="`background-color: ${item.value};`"
          :class="{ active: loadingColor === item.value }"
          @click="loadingColor = item.value"
        >
          {{ item.label }}
        </button>
      </view>

      <view class="control-group">
        <text class="control-label">尺寸:</text>
        <button
          v-for="item in sizeOptions"
          :key="item.value"
          class="control-button"
          :class="{ active: loadingSize === item.value }"
          @click="loadingSize = item.value"
        >
          {{ item.label }}
        </button>
      </view>
    </view>

    <view class="preview-area">
      <text class="preview-title">效果预览</text>
      <view class="preview-content">
        <wd-loading
          :type="loadingType"
          :color="loadingColor"
          :size="loadingSize"
        />
        <text class="preview-info">
          类型: {{ loadingType }} / 颜色: {{ loadingColor }} / 尺寸: {{ loadingSize }}rpx
        </text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { LoadingType } from '@/wd/components/wd-loading/wd-loading.vue'

const loadingType = ref<LoadingType>('ring')
const loadingColor = ref('#4D80F0')
const loadingSize = ref(60)

const colorOptions = [
  { label: '蓝色', value: '#4D80F0' },
  { label: '绿色', value: '#00C851' },
  { label: '橙色', value: '#FF8800' },
  { label: '红色', value: '#FF4444' },
  { label: '紫色', value: '#AA66CC' },
]

const sizeOptions = [
  { label: '小', value: 40 },
  { label: '中', value: 60 },
  { label: '大', value: 80 },
  { label: '超大', value: 100 },
]
</script>

```

**实现要点:**
- 使用 `ref` 管理 type、color、size 三个状态
- 按钮组使用 `:class="{ active: condition }"` 高亮当前选中项
- Loading 组件绑定响应式变量,实时更新显示效果
- 预览区域显示当前配置信息,方便调试

参考: src/wd/components/wd-loading/wd-loading.vue:97-138

### SVG 自定义与扩展

理解组件的 SVG 生成机制,实现自定义加载动画(高级用法)。

```vue
<template>
  <view class="demo">
    <view class="demo-section">
      <text class="demo-title">默认 SVG 动画</text>
      <view class="demo-row">
        <wd-loading type="ring" :size="60" />
        <wd-loading type="outline" :size="60" />
      </view>
    </view>

    <view class="demo-section">
      <text class="demo-title">SVG 渐变色分析</text>
      <view class="gradient-info">
        <view class="gradient-item">
          <view class="gradient-box ring-gradient" />
          <text class="gradient-label">Ring 渐变: 主色 → 中间色</text>
        </view>
        <view class="gradient-item">
          <view class="gradient-box outline-gradient" />
          <text class="gradient-label">Outline 渐变: 透明 → 白色</text>
        </view>
      </view>
    </view>

    <view class="demo-section">
      <text class="demo-title">动画参数说明</text>
      <view class="params-info">
        <view class="param-item">
          <text class="param-label">动画名称:</text>
          <text class="param-value">wd-rotate</text>
        </view>
        <view class="param-item">
          <text class="param-label">动画时长:</text>
          <text class="param-value">2s (2秒/圈)</text>
        </view>
        <view class="param-item">
          <text class="param-label">动画曲线:</text>
          <text class="param-value">linear(线性)</text>
        </view>
        <view class="param-item">
          <text class="param-label">动画循环:</text>
          <text class="param-value">infinite(无限循环)</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

**SVG 生成机制:**

1. **唯一 ID 生成:**
   ```typescript
   const svgDefineId = context.id++   // 主渐变 ID
   const svgDefineId1 = context.id++  // ring 渐变1 ID
   const svgDefineId2 = context.id++  // ring 渐变2 ID
   ```
   每个组件实例生成独立的 ID,避免多实例时 SVG 定义冲突

2. **Ring SVG 结构:**
   - 两个 `linearGradient` 定义:从主色到中间色、从透明到中间色
   - 两个 `path` 元素:分别应用两个渐变
   - 一个 `circle` 元素:顶部圆点装饰

3. **Outline SVG 结构:**
   - 一个 `linearGradient` 定义:从透明到白色
   - 两个 `path` 元素:实心圆环 + 渐变圆环

4. **Base64 编码:**
   ```typescript
   const svgStr = `"data:image/svg+xml;base64,${encode(svgContent)}"`
   ```
   将 SVG 字符串编码为 base64 格式,通过 `background-image` 应用

参考: src/wd/components/wd-loading/wd-loading.vue:58-123

### 响应式加载状态

根据数据加载的不同阶段显示不同的 Loading 样式。

```vue
<template>
  <view class="demo">
    <view class="demo-section">
      <text class="demo-title">数据加载阶段</text>
      <view class="stage-buttons">
        <button class="stage-button" @click="setStage('init')">初始化</button>
        <button class="stage-button" @click="setStage('loading')">加载中</button>
        <button class="stage-button" @click="setStage('success')">加载成功</button>
        <button class="stage-button" @click="setStage('error')">加载失败</button>
      </view>
    </view>

    <view class="content-area">
      <!-- 初始化状态 -->
      <view v-if="stage === 'init'" class="stage-content">
        <wd-loading :size="60" color="#999999" />
        <text class="stage-text">等待加载...</text>
      </view>

      <!-- 加载中状态 -->
      <view v-else-if="stage === 'loading'" class="stage-content">
        <wd-loading :size="80" color="#4D80F0" />
        <text class="stage-text loading">正在加载数据...</text>
      </view>

      <!-- 加载成功状态 -->
      <view v-else-if="stage === 'success'" class="stage-content success">
        <view class="success-icon">✓</view>
        <text class="stage-text">加载成功!</text>
      </view>

      <!-- 加载失败状态 -->
      <view v-else-if="stage === 'error'" class="stage-content error">
        <view class="error-icon">✗</view>
        <text class="stage-text">加载失败</text>
        <button class="retry-button" @click="setStage('loading')">重试</button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

type Stage = 'init' | 'loading' | 'success' | 'error'

const stage = ref<Stage>('init')

const setStage = (newStage: Stage) => {
  stage.value = newStage

  // 模拟自动状态转换
  if (newStage === 'loading') {
    setTimeout(() => {
      // 随机成功或失败
      stage.value = Math.random() > 0.5 ? 'success' : 'error'
    }, 2000)
  }
}
</script>

```

**实现要点:**
- 使用 `stage` 状态管理加载的不同阶段
- 不同阶段使用不同的 Loading 颜色和尺寸
- 成功/失败状态使用静态图标替代 Loading 动画
- 失败状态提供重试按钮,触发重新加载

参考: src/wd/components/wd-loading/wd-loading.vue:97-138

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 加载指示器类型，`spinner` 为一圈辐条状旋转指示器，适合工具类场景 | `'ring' \| 'outline' \| 'spinner'` | `'ring'` |
| color | 加载指示器颜色,支持任意 CSS 颜色值 | `string` | `'#4D80F0'` |
| size | 加载指示器尺寸,数字默认 rpx,支持带单位字符串 | `string \| number` | `45` |
| custom-style | 自定义根节点内联样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-loading/wd-loading.vue:35-47

### Events

Loading 组件无事件。

### Slots

Loading 组件无插槽。

### 方法

Loading 组件无外部方法。

### 类型定义

```typescript
/**
 * 加载指示器类型
 */
export type LoadingType = 'outline' | 'ring'

/**
 * 加载组件属性接口
 */
export interface WdLoadingProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 加载指示器类型，可选值：'outline' | 'ring' */
  type?: LoadingType
  /** 设置加载指示器颜色 */
  color?: string
  /** 设置加载指示器大小 */
  size?: string | number
}
```

参考: src/wd/components/wd-loading/wd-loading.vue:27-47

## 主题定制

### CSS 变量

Loading 组件支持以下 CSS 变量进行主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `$-loading-size` | 加载指示器默认尺寸 | `90rpx` |

参考: src/wd/components/wd-loading/wd-loading.vue:162-163

### 自定义主题

通过覆盖 CSS 变量或使用 props 自定义主题:

```vue
<template>
  <view class="demo">
    <!-- 方式1: 使用 Props 自定义 -->
    <wd-loading
      type="ring"
      color="#8B5CF6"
      :size="60"
      custom-style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24rpx; border-radius: 16rpx;"
    />

    <!-- 方式2: 使用 customClass 自定义 -->
    <wd-loading
      custom-class="theme-loading"
      type="outline"
      color="#10B981"
      :size="60"
    />

    <!-- 方式3: 全局 CSS 变量覆盖 -->
    <view class="custom-theme">
      <wd-loading />
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

```

参考: src/wd/components/wd-loading/wd-loading.vue:151-181

### 暗黑模式

Loading 组件暂不支持暗黑模式自动适配,建议通过 `color` 属性手动设置颜色:

```vue
<template>
  <view :class="{ 'dark-theme': isDark }">
    <wd-loading :color="isDark ? '#60A5FA' : '#4D80F0'" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)
</script>
```

## 最佳实践

### 1. 选择合适的类型

根据使用场景选择 Loading 类型:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 页面级加载使用 ring,视觉丰富 -->
    <view class="page-loading">
      <wd-loading type="ring" :size="80" />
    </view>

    <!-- ✅ 好的做法: 按钮加载使用 outline,简洁清晰 -->
    <button class="btn">
      <wd-loading type="outline" :size="30" color="#fff" />
      <text>加载中...</text>
    </button>

    <!-- ❌ 不好的做法: 按钮中使用 ring,视觉过于复杂 -->
    <button class="btn">
      <wd-loading type="ring" :size="30" color="#fff" />
      <text>加载中...</text>
    </button>
  </view>
</template>
```

**建议:**
- 页面级、卡片级加载:使用 ring 类型,视觉层次丰富
- 按钮内、小区域加载:使用 outline 类型,简洁不喧宾夺主
- 列表加载更多:使用 ring 类型,尺寸 40-50rpx

参考: src/wd/components/wd-loading/wd-loading.vue:72-91

### 2. 合理设置尺寸

根据容器大小和视觉层级设置合适的 Loading 尺寸:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 全屏加载使用大尺寸 -->
    <view class="fullscreen-loading">
      <wd-loading :size="80" />
    </view>

    <!-- ✅ 好的做法: 卡片加载使用中等尺寸 -->
    <view class="card-loading">
      <wd-loading :size="60" />
    </view>

    <!-- ✅ 好的做法: 按钮加载使用小尺寸 -->
    <button class="btn-loading">
      <wd-loading :size="30" />
      <text>加载中</text>
    </button>

    <!-- ✅ 好的做法: 内联文本使用超小尺寸 -->
    <text class="inline-text">
      加载中<wd-loading :size="28" />
    </text>

    <!-- ❌ 不好的做法: 按钮中使用过大尺寸 -->
    <button class="btn-loading">
      <wd-loading :size="60" />
      <text>加载中</text>
    </button>
  </view>
</template>
```

**尺寸建议:**
- 全屏/页面级加载: 70-100rpx
- 卡片/区块级加载: 50-70rpx
- 按钮/小区域加载: 28-40rpx
- 内联文本加载: 与文本字号一致或略小

参考: src/wd/components/wd-loading/wd-loading.vue:97-106

### 3. 颜色与品牌一致

Loading 颜色应与品牌主题或业务状态保持一致:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 默认加载使用品牌色 -->
    <wd-loading color="#4D80F0" />

    <!-- ✅ 好的做法: 成功状态使用绿色 -->
    <wd-loading v-if="isSuccess" color="#00C851" />

    <!-- ✅ 好的做法: 警告状态使用橙色 -->
    <wd-loading v-if="isWarning" color="#FF8800" />

    <!-- ✅ 好的做法: 错误状态使用红色 -->
    <wd-loading v-if="isError" color="#FF4444" />

    <!-- ✅ 好的做法: 白色背景按钮使用深色 Loading -->
    <button class="white-btn">
      <wd-loading color="#4D80F0" :size="30" />
      <text>提交</text>
    </button>

    <!-- ✅ 好的做法: 深色背景按钮使用白色 Loading -->
    <button class="primary-btn">
      <wd-loading color="#ffffff" :size="30" />
      <text>提交</text>
    </button>

    <!-- ❌ 不好的做法: 深色背景使用深色 Loading,无对比度 -->
    <button class="primary-btn">
      <wd-loading color="#0066cc" :size="30" />
      <text>提交</text>
    </button>
  </view>
</template>
```

**颜色建议:**
- 品牌主色: 用于默认加载状态
- 状态色: 成功(绿)、警告(橙)、错误(红)
- 对比色: 确保 Loading 与背景有足够对比度
- 避免使用过于鲜艳或刺眼的颜色

参考: src/wd/components/wd-loading/wd-loading.vue:144-148

### 4. 防止重复触发

加载过程中禁用交互,防止重复触发:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 加载时禁用按钮 -->
    <button
      class="submit-btn"
      :disabled="isLoading"
      @click="handleSubmit"
    >
      <wd-loading v-if="isLoading" :size="30" color="#fff" />
      <text>{{ isLoading ? '提交中...' : '提交' }}</text>
    </button>

    <!-- ✅ 好的做法: 加载时禁用列表滚动触发 -->
    <scroll-view
      scroll-y
      @scrolltolower="loadMore"
    >
      <view class="list">...</view>
      <view v-if="isLoadingMore" class="load-more">
        <wd-loading :size="40" />
      </view>
    </scroll-view>

    <!-- ❌ 不好的做法: 加载时仍可点击 -->
    <button class="submit-btn" @click="handleSubmit">
      <wd-loading v-if="isLoading" :size="30" color="#fff" />
      <text>{{ isLoading ? '提交中...' : '提交' }}</text>
    </button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isLoading = ref(false)
const isLoadingMore = ref(false)

const handleSubmit = () => {
  if (isLoading.value) return // ✅ 加载中直接返回

  isLoading.value = true
  // 异步操作...
}

const loadMore = () => {
  if (isLoadingMore.value) return // ✅ 加载中直接返回

  isLoadingMore.value = true
  // 异步操作...
}
</script>
```

**防重复触发要点:**
- 加载时禁用按钮 `:disabled="isLoading"`
- 加载时添加 loading 标志位判断,直接返回
- 使用 `v-if` 而非 `v-show`,减少不必要的渲染
- 加载完成后及时重置 loading 状态

参考: src/wd/components/wd-loading/wd-loading.vue:1-193

### 5. 提供加载反馈

加载时提供明确的文字提示,提升用户体验:

```vue
<template>
  <view class="demo">
    <!-- ✅ 好的做法: 加载时显示操作提示 -->
    <view class="loading-container">
      <wd-loading :size="60" />
      <text class="loading-text">正在提交数据...</text>
    </view>

    <!-- ✅ 好的做法: 显示加载进度(如果有) -->
    <view class="loading-container">
      <wd-loading :size="60" />
      <text class="loading-text">上传中: {{ progress }}%</text>
    </view>

    <!-- ✅ 好的做法: 区分不同加载阶段 -->
    <view class="loading-container">
      <wd-loading :size="60" color="#4D80F0" />
      <text class="loading-text">{{ loadingStage }}</text>
    </view>

    <!-- ❌ 不好的做法: 只有 Loading 无文字说明 -->
    <view class="loading-container">
      <wd-loading :size="60" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const progress = ref(0)
const currentStage = ref<'init' | 'uploading' | 'processing'>('init')

const loadingStage = computed(() => {
  switch (currentStage.value) {
    case 'uploading':
      return '正在上传文件...'
    case 'processing':
      return '正在处理数据...'
    default:
      return '初始化中...'
  }
})
</script>
```

**文字提示建议:**
- 明确说明正在进行的操作(提交、上传、加载等)
- 有进度时显示具体百分比
- 复杂操作可显示当前阶段
- 文字简洁明了,避免过长描述

参考: src/wd/components/wd-loading/wd-loading.vue:157-163

## 常见问题

### 1. Loading 在某些平台不显示或不旋转

**问题原因:**
- SVG 背景图片在部分小程序平台可能不支持
- CSS 动画在某些低版本系统上可能被禁用
- `background-image` 的 base64 数据过长导致解析失败

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- 方式1: 增加容器尺寸,确保有足够空间显示 -->
    <view class="loading-wrapper">
      <wd-loading :size="60" />
    </view>

    <!-- 方式2: 使用内联样式强制显示 -->
    <wd-loading
      :size="60"
      custom-style="display: inline-block !important;"
    />

    <!-- 方式3: 检查父元素是否隐藏 -->
    <view class="parent" style="visibility: visible;">
      <wd-loading :size="60" />
    </view>
  </view>
</template>

```

**检查清单:**
- 确认父容器有足够的宽高显示 Loading
- 检查父元素是否设置了 `display: none` 或 `visibility: hidden`
- 在真机上测试,部分模拟器可能无法正确显示 SVG
- 检查是否有全局 CSS 覆盖了 Loading 的样式

参考: src/wd/components/wd-loading/wd-loading.vue:166-171

### 2. 多个 Loading 实例颜色错乱

**问题原因:**
- SVG 定义使用固定 ID,多个实例时 ID 冲突
- 组件未正确生成唯一 ID,导致 SVG 引用错误

**解决方案:**

组件已通过 `context.id++` 机制为每个实例生成唯一 ID,无需额外处理:

```typescript
// 组件内部自动处理唯一 ID
const svgDefineId = context.id++
const svgDefineId1 = context.id++
const svgDefineId2 = context.id++
```

如果仍然出现问题,检查是否有以下情况:

```vue
<template>
  <view class="demo">
    <!-- ✅ 正确: 每个实例独立配置 -->
    <wd-loading color="#4D80F0" />
    <wd-loading color="#00C851" />
    <wd-loading color="#FF8800" />

    <!-- ❌ 错误: 不要使用相同的 ref 复用组件 -->
    <wd-loading v-for="item in list" :key="item.id" :color="item.color" />
  </view>
</template>
```

参考: src/wd/components/wd-loading/wd-loading.vue:58-61

### 3. Loading 尺寸设置无效

**问题原因:**
- 父容器设置了固定宽高,限制了 Loading 的尺寸
- 使用了错误的单位格式
- CSS 优先级导致样式被覆盖

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- ✅ 正确: 使用数字,自动添加 rpx -->
    <wd-loading :size="80" />

    <!-- ✅ 正确: 使用带单位的字符串 -->
    <wd-loading size="80rpx" />
    <wd-loading size="40px" />

    <!-- ✅ 正确: 容器不限制尺寸 -->
    <view class="flex-container">
      <wd-loading :size="100" />
    </view>

    <!-- ❌ 错误: 父容器限制了尺寸 -->
    <view class="fixed-size">
      <wd-loading :size="100" />
    </view>
  </view>
</template>

```

**检查要点:**
- 确认父容器没有设置 `width` 和 `height` 限制
- 检查是否有全局样式覆盖了组件样式
- 使用浏览器开发工具检查实际应用的样式

参考: src/wd/components/wd-loading/wd-loading.vue:97-106

### 4. Loading 颜色变化不生效

**问题原因:**
- SVG 构建未监听 `color` 属性变化
- 组件实际上已监听,但可能是缓存或渲染问题

**解决方案:**

组件已通过 `watch` 监听 `type` 变化并重新构建 SVG:

```typescript
watch(
  () => props.type,
  () => {
    buildSvg()  // 重新构建 SVG
  },
  { deep: true, immediate: true }
)
```

但 `color` 变化是在 `onBeforeMount` 中计算的,如果需要动态切换颜色:

```vue
<template>
  <view class="demo">
    <!-- ✅ 解决方案: 使用 key 强制重新渲染 -->
    <wd-loading
      :key="loadingColor"
      :color="loadingColor"
      :size="60"
    />

    <button @click="changeColor">切换颜色</button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loadingColor = ref('#4D80F0')
const colors = ['#4D80F0', '#00C851', '#FF8800', '#FF4444']
let colorIndex = 0

const changeColor = () => {
  colorIndex = (colorIndex + 1) % colors.length
  loadingColor.value = colors[colorIndex]
}
</script>
```

参考: src/wd/components/wd-loading/wd-loading.vue:129-148

### 5. Loading 动画不流畅或卡顿

**问题原因:**
- 页面渲染负载过重,导致 CSS 动画掉帧
- 设备性能较低,无法流畅执行动画
- 同时存在过多动画元素

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- 方式1: 减少同时显示的 Loading 数量 -->
    <view v-if="isLoading" class="single-loading">
      <wd-loading :size="60" />
    </view>

    <!-- 方式2: 避免在复杂列表中使用过多 Loading -->
    <view class="list">
      <view v-for="item in list" :key="item.id" class="item">
        <!-- ❌ 不好: 每个列表项都有 Loading -->
        <wd-loading v-if="item.loading" :size="30" />

        <!-- ✅ 更好: 统一在列表底部显示 -->
      </view>
      <view v-if="isListLoading" class="list-loading">
        <wd-loading :size="40" />
      </view>
    </view>

    <!-- 方式3: 使用 CSS 优化(已内置,无需额外处理) -->
    <wd-loading :size="60" />
  </view>
</template>
```

**优化建议:**
- 避免同时显示多个 Loading 动画
- 减少页面其他复杂动画和渲染
- 在低端设备上使用较小的 Loading 尺寸
- 组件已使用硬件加速(`transform`)优化动画性能

参考: src/wd/components/wd-loading/wd-loading.vue:166-191

## 注意事项

1. **类型选择**: Loading 组件提供 `ring` 和 `outline` 两种类型,`ring` 适合页面级加载,`outline` 适合按钮或小区域加载,根据场景选择合适类型。参考: src/wd/components/wd-loading/wd-loading.vue:72-91

2. **尺寸单位**: `size` 属性支持数字(默认 rpx)和字符串(带单位)两种格式,数字会自动转换为 rpx,字符串需包含单位如 `"40px"` `"2em"`。参考: src/wd/components/wd-loading/wd-loading.vue:97-106

3. **颜色对比度**: 设置 `color` 时务必确保 Loading 颜色与背景有足够对比度,深色背景使用浅色 Loading,浅色背景使用深色 Loading,否则可能看不清。参考: src/wd/components/wd-loading/wd-loading.vue:144-148

4. **SVG 唯一 ID**: 组件内部通过 `context.id++` 为每个实例生成唯一的 SVG 定义 ID,避免多实例时 ID 冲突导致颜色错乱,开发者无需手动处理。参考: src/wd/components/wd-loading/wd-loading.vue:58-61

5. **Base64 编码**: SVG 内容会转换为 base64 格式并通过 `background-image` 应用,这种方式减少了 HTTP 请求,但在某些低版本小程序平台可能存在兼容性问题,建议真机测试。参考: src/wd/components/wd-loading/wd-loading.vue:112-123

6. **渐变色计算**: `ring` 类型会自动调用 `gradient()` 函数计算主色到白色的中间渐变色,无需手动配置,但如果需要自定义渐变色,目前组件不支持,只能通过修改源码实现。参考: src/wd/components/wd-loading/wd-loading.vue:144-148

7. **动画性能**: 旋转动画使用 CSS3 `@keyframes` 和 `transform`,硬件加速性能较好,但在低端设备或页面渲染负载过重时可能出现卡顿,建议减少同时显示的 Loading 数量。参考: src/wd/components/wd-loading/wd-loading.vue:166-191

8. **响应式更新**: 组件通过 `watch` 监听 `type` 和 `size` 属性变化并自动更新,但 `color` 变化可能需要添加 `:key` 强制重新渲染才能生效,这是组件设计的局限性。参考: src/wd/components/wd-loading/wd-loading.vue:129-148

9. **内联对齐**: 组件设置了 `vertical-align: middle` 和 `display: inline-block`,可以直接内联在文本或其他元素中使用,与文本垂直居中对齐,无需额外调整。参考: src/wd/components/wd-loading/wd-loading.vue:157-163

10. **样式隔离**: 组件使用 `styleIsolation: 'shared'` 模式,支持全局样式和 `customClass` 穿透,可以通过 `:deep()` 或全局 CSS 覆盖组件样式,但注意不要影响其他组件。参考: src/wd/components/wd-loading/wd-loading.vue:18-25

11. **默认尺寸**: 组件默认尺寸为 45rpx(通过 `size` prop 默认值),但 SCSS 变量 `$-loading-size` 定义为 90rpx,这是一个不一致的设计,实际使用时以 prop 默认值为准。参考: src/wd/components/wd-loading/wd-loading.vue:50-56

12. **无事件无插槽**: Loading 组件是纯展示组件,不提供任何事件和插槽,如需交互或自定义内容,建议自行封装容器组件包裹 Loading。参考: src/wd/components/wd-loading/wd-loading.vue:1-193
