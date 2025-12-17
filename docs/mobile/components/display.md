# 展示组件

展示组件用于数据展示，包括卡片、单元格、标签、进度条等组件。

## 组件列表

| 组件 | 说明 |
|------|------|
| Cell | 单元格，列表项展示 |
| Card | 卡片，内容容器 |
| Badge | 徽标，数字角标 |
| Tag | 标签，分类标记 |
| Progress | 进度条，进度展示 |
| Steps | 步骤条，流程展示 |
| Collapse | 折叠面板，内容折叠 |
| Swiper | 轮播图，图片轮播 |
| Skeleton | 骨架屏，加载占位 |
| Img | 图片，图片展示 |

---

## Cell 单元格

单元格为列表中的单个展示项。

### 基础用法

```vue
<template>
  <wd-cell-group>
    <wd-cell title="标题" value="内容" />
    <wd-cell title="带箭头" value="内容" is-link />
    <wd-cell title="带图标" icon="user" value="内容" />
    <wd-cell title="带描述" label="描述信息" value="内容" />
    <wd-cell title="跳转页面" is-link to="/pages/user/profile" />
  </wd-cell-group>
</template>
```

### 自定义样式

```vue
<template>
  <wd-cell-group>
    <wd-cell title="带竖线" value="内容" left-border icon-color="#1989fa" />
    <wd-cell title="重要信息" value="查看" title-color="#f56c6c" title-bold is-link />
    <wd-cell title="价格" value="¥99.00" value-color="#ee0a24" />
    <wd-cell title="收货地址" value="浙江省杭州市西湖区" vertical />
    <wd-cell title="大尺寸" label="描述" value="内容" size="large" is-link />
  </wd-cell-group>
</template>
```

### Cell Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题 | `string` | - |
| value | 右侧内容 | `string \| number` | `''` |
| icon | 左侧图标名称 | `string` | - |
| label | 描述信息 | `string` | - |
| is-link | 是否为跳转链接 | `boolean` | `false` |
| to | 跳转地址 | `string` | - |
| replace | 跳转时是否替换栈顶页面 | `boolean` | `false` |
| clickable | 开启点击反馈 | `boolean` | `false` |
| size | 单元格大小 | `'large'` | - |
| border | 是否展示边框线 | `boolean` | - |
| title-width | 左侧标题宽度 | `string` | - |
| center | 是否垂直居中 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| vertical | 是否上下结构 | `boolean` | `false` |
| left-border | 左侧竖线边框 | `boolean` | `false` |
| icon-color | 图标颜色 | `string` | `''` |
| title-color | 标题颜色 | `string` | `''` |
| title-bold | 标题是否加粗 | `boolean` | `false` |
| value-color | 右侧内容颜色 | `string` | `''` |

### Cell Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击单元格时触发 | - |

### Cell Slots

| 名称 | 说明 |
|------|------|
| default | 自定义右侧 value 内容 |
| title | 自定义标题 |
| label | 自定义描述信息 |
| icon | 自定义左侧图标 |
| right-icon | 自定义右侧图标 |

---

## Card 卡片

卡片容器组件，用于展示商品、内容等信息。

### 基础用法

```vue
<template>
  <wd-card title="卡片标题">
    <text>卡片内容区域</text>
  </wd-card>

  <wd-card title="矩形卡片" type="rectangle">
    <text>没有圆角和阴影</text>
  </wd-card>

  <wd-card title="商品详情">
    <view>商品信息</view>
    <template #footer>
      <wd-button size="small" plain>取消</wd-button>
      <wd-button size="small" type="primary">立即购买</wd-button>
    </template>
  </wd-card>
</template>
```

### Card Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 卡片标题 | `string` | - |
| type | 卡片类型 | `'rectangle'` | - |
| custom-title-class | 标题自定义样式类 | `string` | `''` |
| custom-content-class | 内容自定义样式类 | `string` | `''` |
| custom-footer-class | 底部自定义样式类 | `string` | `''` |

### Card Slots

| 名称 | 说明 |
|------|------|
| default | 卡片内容 |
| title | 自定义标题 |
| footer | 底部操作区域 |

---

## Badge 徽标

出现在按钮、图标旁的数字或状态标记。

### 基础用法

```vue
<template>
  <wd-badge :model-value="5">
    <wd-button>消息</wd-button>
  </wd-badge>

  <wd-badge :model-value="120" :max="99">
    <wd-button>购物车</wd-button>
  </wd-badge>

  <wd-badge is-dot>
    <wd-icon name="bell" size="48rpx" />
  </wd-badge>

  <wd-badge :model-value="5" type="success">
    <wd-button>成功</wd-button>
  </wd-badge>

  <wd-badge :model-value="8" bg-color="#7232dd">
    <wd-button>自定义</wd-button>
  </wd-badge>

  <wd-badge :model-value="0" show-zero>
    <wd-button>显示0</wd-button>
  </wd-badge>
</template>
```

### Badge Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value | 显示值 | `string \| number` | `''` |
| max | 最大值，超过显示 `{max}+` | `number` | - |
| is-dot | 是否为红色点状标注 | `boolean` | `false` |
| hidden | 是否隐藏徽标 | `boolean` | `false` |
| type | 徽标类型 | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | - |
| show-zero | 值为0时是否显示 | `boolean` | `false` |
| bg-color | 自定义背景颜色 | `string` | - |
| top | 向下偏移量 | `string \| number` | - |
| right | 向左偏移量 | `string \| number` | - |

---

## Tag 标签

用于标记状态或者概括主要内容。

### 基础用法

```vue
<template>
  <wd-tag>默认</wd-tag>
  <wd-tag type="primary">主要</wd-tag>
  <wd-tag type="success">成功</wd-tag>
  <wd-tag type="warning">警告</wd-tag>
  <wd-tag type="danger">危险</wd-tag>

  <!-- 朴素/圆角/标记 -->
  <wd-tag type="primary" plain>朴素</wd-tag>
  <wd-tag type="primary" round>圆角</wd-tag>
  <wd-tag type="primary" mark>标记</wd-tag>

  <!-- 带图标/可关闭 -->
  <wd-tag icon="check" type="success">已完成</wd-tag>
  <wd-tag round closable @close="handleClose">可关闭</wd-tag>

  <!-- 自定义颜色 -->
  <wd-tag color="#fff" bg-color="#7232dd">自定义</wd-tag>
</template>
```

### 字典自动映射

```vue
<template>
  <wd-tag :options="statusOptions" :value="status" />
</template>

<script lang="ts" setup>
const status = ref('1')
const statusOptions = [
  { label: '正常', value: '1', elTagType: 'success' },
  { label: '停用', value: '0', elTagType: 'danger' },
  { label: '待审核', value: '2', elTagType: 'warning' },
]
</script>
```

### 动态新增标签

```vue
<template>
  <wd-tag v-for="tag in tags" :key="tag" round closable @close="handleClose(tag)">
    {{ tag }}
  </wd-tag>
  <wd-tag type="primary" round dynamic @confirm="handleConfirm" />
</template>

<script lang="ts" setup>
const tags = ref(['标签一', '标签二'])

const handleClose = (tag: string) => {
  tags.value = tags.value.filter(t => t !== tag)
}

const handleConfirm = ({ value }: { value: string }) => {
  if (value && !tags.value.includes(value)) {
    tags.value.push(value)
  }
}
</script>
```

### Tag Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 标签类型 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| icon | 左侧图标 | `string` | `''` |
| closable | 是否可关闭 | `boolean` | `false` |
| plain | 是否为朴素类型 | `boolean` | `false` |
| round | 是否为圆角类型 | `boolean` | `false` |
| mark | 是否为标记类型 | `boolean` | `false` |
| dynamic | 是否为新增标签 | `boolean` | `false` |
| color | 文字颜色 | `string` | `''` |
| bg-color | 背景色和边框色 | `string` | `''` |
| value | 显示的值（支持字典翻译） | `string \| number` | - |
| options | 字典选项数组 | `DictItem[]` | `[]` |

### Tag Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击标签时触发 | `event: Event` |
| close | 点击关闭按钮时触发 | `event: Event` |
| confirm | 新增标签确认时触发 | `{ value: string }` |

---

## Progress 进度条

用于展示操作的当前进度。

### 基础用法

```vue
<template>
  <wd-progress :percentage="50" />
  <wd-progress :percentage="100" status="success" />
  <wd-progress :percentage="70" status="warning" />
  <wd-progress :percentage="60" hide-text />
  <wd-progress :percentage="50" color="#7232dd" />
</template>
```

### 自定义颜色

```vue
<template>
  <wd-progress :percentage="percentage" :color="colorSteps" />
</template>

<script lang="ts" setup>
const percentage = ref(50)

const colorSteps = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]
</script>
```

### Progress Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| percentage | 进度数值，最大值 100 | `number` | `0` |
| hide-text | 是否隐藏进度条上的文字 | `boolean` | `false` |
| color | 进度条颜色 | `string \| string[] \| ProgressColor[]` | - |
| duration | 进度增加 1% 所需毫秒数 | `number` | `30` |
| status | 进度条状态 | `'success' \| 'warning' \| 'danger'` | - |

### ProgressColor 类型

```typescript
interface ProgressColor {
  color: string
  percentage: number
}
```

---

## Steps 步骤条

用于引导用户按照流程完成任务。

### 基础用法

```vue
<template>
  <wd-steps :active="active">
    <wd-step title="步骤1" />
    <wd-step title="步骤2" />
    <wd-step title="步骤3" />
  </wd-steps>

  <!-- 带描述 -->
  <wd-steps :active="1">
    <wd-step title="已完成" description="2024-01-01 10:00" />
    <wd-step title="进行中" description="正在处理..." />
    <wd-step title="待完成" description="预计明天完成" />
  </wd-steps>

  <!-- 垂直/点状/居中 -->
  <wd-steps :active="1" vertical />
  <wd-steps :active="1" dot />
  <wd-steps :active="1" align-center />

  <!-- 自定义图标 -->
  <wd-steps :active="1">
    <wd-step title="购物车" icon="cart" />
    <wd-step title="支付" icon="pay" />
    <wd-step title="完成" icon="check" />
  </wd-steps>
</template>

<script lang="ts" setup>
const active = ref(0)
const nextStep = () => { active.value = (active.value + 1) % 4 }
</script>
```

### Steps Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| active | 当前激活的步骤进度 | `number` | `0` |
| vertical | 是否为垂直方向 | `boolean` | `false` |
| dot | 是否为点状步骤条 | `boolean` | `false` |
| space | 步骤条之间的间距 | `string` | - |
| align-center | 是否水平居中显示 | `boolean` | `false` |

### Step Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 步骤标题 | `string` | - |
| description | 步骤描述 | `string` | - |
| icon | 自定义图标 | `string` | - |
| status | 步骤状态 | `'wait' \| 'process' \| 'finish' \| 'error'` | - |

---

## Collapse 折叠面板

将一组内容放置在多个折叠面板中。

### 基础用法

```vue
<template>
  <wd-collapse v-model="activeNames">
    <wd-collapse-item title="标题1" name="1">内容1</wd-collapse-item>
    <wd-collapse-item title="标题2" name="2">内容2</wd-collapse-item>
    <wd-collapse-item title="标题3" name="3">内容3</wd-collapse-item>
  </wd-collapse>
</template>

<script lang="ts" setup>
const activeNames = ref(['1'])
</script>
```

### 手风琴模式

```vue
<template>
  <wd-collapse v-model="activeName" accordion>
    <wd-collapse-item title="标题1" name="1">内容1</wd-collapse-item>
    <wd-collapse-item title="标题2" name="2">内容2</wd-collapse-item>
    <wd-collapse-item title="标题3" name="3">内容3</wd-collapse-item>
  </wd-collapse>
</template>

<script lang="ts" setup>
// 手风琴模式下 value 类型为 string
const activeName = ref('1')
</script>
```

### 查看更多模式

```vue
<template>
  <wd-collapse v-model="expanded" viewmore :line-num="3">
    这是一段很长的文本内容...
  </wd-collapse>
</template>

<script lang="ts" setup>
// 查看更多模式下 value 类型为 boolean
const expanded = ref(false)
</script>
```

### 全部展开/收起

```vue
<template>
  <wd-button @click="collapseRef?.toggleAll(true)">全部展开</wd-button>
  <wd-button @click="collapseRef?.toggleAll(false)">全部收起</wd-button>

  <wd-collapse ref="collapseRef" v-model="activeNames">
    <wd-collapse-item title="标题1" name="1">内容1</wd-collapse-item>
    <wd-collapse-item title="标题2" name="2">内容2</wd-collapse-item>
    <wd-collapse-item title="标题3" name="3" disabled>内容3</wd-collapse-item>
  </wd-collapse>
</template>

<script lang="ts" setup>
const activeNames = ref<string[]>([])
const collapseRef = ref()
</script>
```

### Collapse Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value | 绑定值 | `string \| string[] \| boolean` | - |
| accordion | 是否为手风琴模式 | `boolean` | `false` |
| viewmore | 是否为查看更多模式 | `boolean` | `false` |
| line-num | 查看更多模式收起时显示行数 | `number` | `2` |

### Collapse Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| toggleAll | 切换所有面板展开状态 | `options?: boolean \| { expanded?: boolean; skipDisabled?: boolean }` |

### CollapseItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 唯一标识符 | `string` | - |
| title | 标题 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| before-expend | 展开前的回调函数 | `() => boolean \| Promise<boolean>` | - |

---

## Skeleton 骨架屏

用于等待加载内容所展示的占位图形组合。

### 基础用法

```vue
<template>
  <wd-skeleton :loading="loading">
    <view class="content">实际内容</view>
  </wd-skeleton>

  <!-- 主题类型 -->
  <wd-skeleton theme="text" :loading="true" />
  <wd-skeleton theme="avatar" :loading="true" />
  <wd-skeleton theme="paragraph" :loading="true" />
  <wd-skeleton theme="image" :loading="true" />

  <!-- 动画效果 -->
  <wd-skeleton animation="gradient" :loading="true" />
  <wd-skeleton animation="flashed" :loading="true" />
</template>
```

### 自定义布局

```vue
<template>
  <wd-skeleton :loading="loading" :row-col="rowCol">
    <view class="content">实际内容</view>
  </wd-skeleton>
</template>

<script lang="ts" setup>
const loading = ref(true)
const rowCol = [
  { type: 'circle', size: '96rpx' },
  [
    { width: '30%', height: '32rpx', marginRight: '16rpx' },
    { width: '70%', height: '32rpx' },
  ],
  1,
  { width: '55%' },
]
</script>
```

### Skeleton Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| loading | 是否为加载状态 | `boolean` | `true` |
| theme | 骨架图风格 | `'text' \| 'avatar' \| 'paragraph' \| 'image'` | `'text'` |
| row-col | 行列数量、宽度高度、间距等 | `SkeletonRowCol[]` | `[]` |
| animation | 动画效果 | `'gradient' \| 'flashed' \| ''` | `''` |

### SkeletonRowColObj 类型

```typescript
interface SkeletonRowColObj {
  type?: 'rect' | 'circle' | 'text'
  size?: string | number
  width?: string | number
  height?: string | number
  margin?: string | number
  marginLeft?: string | number
  marginRight?: string | number
  borderRadius?: string | number
  backgroundColor?: string
}
```

---

## Swiper 轮播图

用于创建轮播，支持水平和垂直方向。

### 基础用法

```vue
<template>
  <wd-swiper :list="imageList" />

  <!-- 对象数组 -->
  <wd-swiper :list="swiperList" value-key="url" text-key="title" />

  <!-- 垂直方向 -->
  <wd-swiper :list="imageList" direction="vertical" height="400" />

  <!-- 自动播放 -->
  <wd-swiper :list="imageList" :autoplay="true" :interval="3000" :loop="true" />
</template>

<script lang="ts" setup>
const imageList = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
]

const swiperList = [
  { url: 'https://example.com/image1.jpg', title: '图片1' },
  { url: 'https://example.com/image2.jpg', title: '图片2' },
]
</script>
```

### 指示器配置

```vue
<template>
  <wd-swiper :list="imageList" :indicator="{ type: 'dots' }" />
  <wd-swiper :list="imageList" :indicator="{ type: 'fraction' }" />
  <wd-swiper :list="imageList" :indicator="{ type: 'dots', showControls: true }" />
  <wd-swiper :list="imageList" :indicator="false" />
  <wd-swiper :list="imageList" indicator-position="bottom-left" />
</template>
```

### 卡片式轮播

```vue
<template>
  <wd-swiper
    :list="imageList"
    previous-margin="60"
    next-margin="60"
    :display-multiple-items="1"
  />
</template>
```

### Swiper Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| list | 图片/视频列表 | `string[] \| SwiperList[]` | `[]` |
| autoplay | 是否自动播放 | `boolean` | `true` |
| current | 当前滑块下标 | `number` | `0` |
| direction | 滑动方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| display-multiple-items | 同时显示的滑块数量 | `number` | `1` |
| duration | 滑动动画时长（毫秒） | `number` | `300` |
| height | 轮播高度 | `number \| string` | `'350'` |
| interval | 轮播间隔时间（毫秒） | `number` | `5000` |
| loop | 是否循环播放 | `boolean` | `true` |
| next-margin | 后边距 | `number \| string` | `'0'` |
| previous-margin | 前边距 | `number \| string` | `'0'` |
| indicator | 指示器配置 | `boolean \| WdSwiperNavProps` | `true` |
| indicator-position | 指示器位置 | `string` | `'bottom'` |
| image-mode | 图片裁剪模式 | `ImageMode` | `'aspectFill'` |
| value-key | value 对应的 key | `string` | `'value'` |

### Swiper Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击滑块时触发 | `{ index: number; item: string \| SwiperList }` |
| change | 轮播滑块切换时触发 | `{ current: number; source: string }` |

---

## Img 图片

增强版的 img 标签，支持单张和多张图片展示。

### 基础用法

```vue
<template>
  <wd-img src="https://example.com/image.jpg" width="200" height="200" />
  <wd-img src="https://example.com/avatar.jpg" width="100" height="100" round />
  <wd-img src="https://example.com/image.jpg" mode="aspectFit" />
  <wd-img src="https://example.com/image.jpg" lazy-load enable-preview />
</template>
```

### 多图片展示

```vue
<template>
  <!-- 多张图片用逗号分隔 -->
  <wd-img
    :src="imageUrls"
    width="100"
    height="100"
    :max-display="9"
    enable-preview
  />

  <!-- 单图模式：只显示第一张，右上角显示数量角标 -->
  <wd-img
    :src="imageUrls"
    width="200"
    height="200"
    single-mode
    enable-preview
  />
</template>

<script lang="ts" setup>
const imageUrls = 'https://example.com/1.jpg,https://example.com/2.jpg,https://example.com/3.jpg'
</script>
```

### Img Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 图片链接，多张用逗号分隔 | `string` | - |
| preview-src | 预览图片链接 | `string` | - |
| round | 是否显示为圆形 | `boolean` | `false` |
| mode | 图片填充模式 | `ImageMode` | `'scaleToFill'` |
| lazy-load | 是否懒加载 | `boolean` | `false` |
| width | 宽度 | `string \| number` | `200` |
| height | 高度 | `string \| number` | `200` |
| radius | 圆角大小 | `string \| number` | - |
| enable-preview | 是否允许预览 | `boolean` | `false` |
| max-display | 多图片最大显示数量 | `number` | `9` |
| single-mode | 是否启用单图模式 | `boolean` | `false` |
| enable-longpress | 是否启用长按功能 | `boolean` | `false` |

### ImageMode 类型

```typescript
type ImageMode =
  | 'scaleToFill'  // 不保持纵横比缩放
  | 'aspectFit'    // 保持纵横比，完整显示
  | 'aspectFill'   // 保持纵横比，短边完整显示
  | 'widthFix'     // 宽度不变，高度自动
  | 'heightFix'    // 高度不变，宽度自动
  | 'center'       // 不缩放，只显示中间区域
```

### Img Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| load | 图片加载成功时触发 | `event: any, index?: number` |
| error | 图片加载失败时触发 | `event: any, index?: number` |
| click | 点击图片时触发 | `event: MouseEvent, index?: number` |
| longpress | 长按图片时触发 | `event: Event, imageList: string[], currentIndex: number` |

### Img Slots

| 名称 | 说明 |
|------|------|
| loading | 自定义加载中状态 |
| error | 自定义加载失败状态 |

---

## 主题定制

### Cell 单元格

```scss
:root {
  --wd-cell-padding: 24rpx;
  --wd-cell-title-fs: 28rpx;
  --wd-cell-title-color: #333;
  --wd-cell-value-color: #969799;
  --wd-cell-arrow-color: #969799;
}
```

### Badge 徽标

```scss
:root {
  --wd-badge-height: 32rpx;
  --wd-badge-fs: 24rpx;
  --wd-badge-bg: #ee0a24;
  --wd-badge-color: #fff;
}
```

### Tag 标签

```scss
:root {
  --wd-tag-fs: 24rpx;
  --wd-tag-primary-color: #1989fa;
  --wd-tag-success-color: #07c160;
  --wd-tag-warning-color: #ff976a;
  --wd-tag-danger-color: #ee0a24;
}
```

---

## 最佳实践

### 1. 列表项使用 Cell 组件

```vue
<template>
  <wd-cell-group>
    <wd-cell
      v-for="item in list"
      :key="item.id"
      :title="item.title"
      :value="item.value"
      is-link
      @click="handleClick(item)"
    />
  </wd-cell-group>
</template>
```

### 2. 状态展示使用 Tag + 字典

```vue
<template>
  <wd-tag :options="statusDict" :value="row.status" />
</template>

<script lang="ts" setup>
const statusDict = [
  { label: '待处理', value: '0', elTagType: 'warning' },
  { label: '已完成', value: '2', elTagType: 'success' },
]
</script>
```

### 3. 加载状态使用 Skeleton

```vue
<template>
  <wd-skeleton :loading="loading" theme="paragraph" animation="gradient">
    <view class="content">实际内容</view>
  </wd-skeleton>
</template>
```

---

## 常见问题

### 1. Cell 组件点击无响应

需要设置 `is-link` 或 `clickable` 属性：

```vue
<wd-cell title="标题" is-link @click="handleClick" />
<wd-cell title="标题" clickable @click="handleClick" />
```

### 2. Badge 值为 0 时不显示

添加 `show-zero` 属性：

```vue
<wd-badge :model-value="0" show-zero>
  <wd-button>消息</wd-button>
</wd-badge>
```

### 3. Collapse 手风琴模式下 v-model 类型错误

手风琴模式下 `v-model` 应为 `string` 类型，普通模式下为 `string[]` 类型：

```typescript
// 手风琴模式
const activeName = ref<string>('1')
// 普通模式
const activeNames = ref<string[]>(['1', '2'])
```

### 4. Swiper 高度适配问题

设置固定高度或动态计算：

```vue
<template>
  <wd-swiper :list="imageList" height="400" />
  <wd-swiper :list="imageList" :height="swiperHeight" />
</template>

<script lang="ts" setup>
const swiperHeight = ref(uni.getSystemInfoSync().windowWidth * 9 / 16)
</script>
```

### 5. Img 组件多图片无法预览

需要启用 `enable-preview` 属性：

```vue
<wd-img :src="images" enable-preview width="100" height="100" />
```
