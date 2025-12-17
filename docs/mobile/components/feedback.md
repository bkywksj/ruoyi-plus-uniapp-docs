# 反馈组件

反馈组件用于用户交互反馈，包括轻提示、加载状态、弹出层、消息框、动作面板、通知栏、遮罩层、滑动操作等组件。

## 组件列表

| 组件 | 说明 |
|------|------|
| Toast | 轻提示，轻量消息提示 |
| Loading | 加载，加载状态展示 |
| Popup | 弹出层，弹出容器 |
| MessageBox | 消息框，对话框 |
| ActionSheet | 动作面板，底部操作菜单 |
| Notify | 消息通知，顶部通知 |
| NoticeBar | 通知栏，滚动公告 |
| Overlay | 遮罩层，背景遮罩 |
| SwipeAction | 滑动操作，左滑删除 |

## Toast 轻提示

轻量级消息提示组件，用于消息通知、加载提示、操作结果提示等场景。

### 基本用法

```vue
<template>
  <wd-toast />
  <wd-button @click="showToast">显示提示</wd-button>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const showToast = () => toast.show('这是一条提示消息')

// 提示类型
toast.success('操作成功')
toast.error('操作失败')
toast.warning('警告信息')
toast.info('普通信息')
toast.loading('加载中...')

// 自定义配置
toast.show({
  msg: '自定义时长',
  duration: 5000,
  position: 'top',
})

// 关闭提示
toast.close()
</script>
```

### Toast Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| msg | 提示信息 | `string` | `''` |
| direction | 排列方向 | `'vertical' \| 'horizontal'` | `'horizontal'` |
| iconName | 图标名称 | `'success' \| 'error' \| 'warning' \| 'loading' \| 'info' \| ''` | `''` |
| position | 显示位置 | `'top' \| 'middle-top' \| 'middle' \| 'bottom'` | `'middle-top'` |
| zIndex | 层级 | `number` | `1000` |
| cover | 是否显示遮罩层 | `boolean` | `false` |
| duration | 显示时长(ms) | `number` | `2000` |

### Toast 方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| show | 显示普通提示 | `(options: ToastOptions \| string) => void` |
| success | 显示成功提示 | `(options: ToastOptions \| string) => void` |
| error | 显示错误提示 | `(options: ToastOptions \| string) => void` |
| warning | 显示警告提示 | `(options: ToastOptions \| string) => void` |
| info | 显示信息提示 | `(options: ToastOptions \| string) => void` |
| loading | 显示加载提示 | `(options: ToastOptions \| string) => void` |
| close | 关闭提示 | `() => void` |

---

## Loading 加载

加载动画组件，用于表示加载中的过渡状态。

### 基本用法

```vue
<template>
  <!-- 默认加载 -->
  <wd-loading />

  <!-- 环形加载 -->
  <wd-loading type="ring" />

  <!-- 自定义颜色和大小 -->
  <wd-loading color="#1989fa" size="48" />
</template>
```

### Loading Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 加载指示器类型 | `'outline' \| 'ring'` | `'ring'` |
| color | 加载指示器颜色 | `string` | `'#4D80F0'` |
| size | 加载指示器大小 | `string \| number` | `'45'` |

---

## Popup 弹出层

弹出层组件，用于展示弹窗、信息提示等内容。

### 基本用法

```vue
<template>
  <wd-button @click="visible = true">显示弹出层</wd-button>

  <!-- 居中弹出 -->
  <wd-popup v-model="visible" position="center">
    <view class="popup-content">弹出层内容</view>
  </wd-popup>

  <!-- 底部弹出 -->
  <wd-popup v-model="showBottom" position="bottom" title="标题" closable>
    <view class="popup-content">底部弹出内容</view>
  </wd-popup>

  <!-- 圆角弹出 -->
  <wd-popup v-model="showRadius" position="bottom" :radius="32">
    <view class="popup-content">圆角弹出内容</view>
  </wd-popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const visible = ref(false)
const showBottom = ref(false)
const showRadius = ref(false)
</script>
```

### Popup Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 是否显示弹出层 | `boolean` | `false` |
| position | 弹出位置 | `'center' \| 'top' \| 'right' \| 'bottom' \| 'left'` | `'center'` |
| title | 标题文本 | `string` | `''` |
| radius | 圆角大小 | `string \| number` | `'16'` |
| closable | 是否显示关闭按钮 | `boolean` | `false` |
| closeOnClickModal | 点击遮罩是否关闭 | `boolean` | `true` |
| modal | 是否显示遮罩 | `boolean` | `true` |
| zIndex | 层级 | `number` | `100` |
| safeAreaInsetBottom | 是否设置底部安全距离 | `boolean` | `false` |
| lockScroll | 是否锁定滚动 | `boolean` | `true` |

### Popup Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 显示状态更新时触发 | `value: boolean` |
| before-enter | 进入动画开始前触发 | - |
| after-enter | 进入动画完成后触发 | - |
| before-leave | 离开动画开始前触发 | - |
| after-leave | 离开动画完成后触发 | - |
| click-modal | 点击遮罩时触发 | - |
| close | 关闭时触发 | - |

---

## MessageBox 消息框

消息框组件，用于显示确认框、提示框等对话框。

### 基本用法

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

// 确认框
const showConfirm = async () => {
  const result = await message.confirm({
    title: '提示',
    msg: '确认删除这条数据吗？'
  })
  if (result.action === 'confirm') {
    console.log('确认删除')
  }
}

// 提示框
const showAlert = () => {
  message.alert({
    title: '提示',
    msg: '操作已完成'
  })
}

// 输入框
const showPrompt = async () => {
  const result = await message.prompt({
    title: '请输入',
    inputPlaceholder: '请输入内容'
  })
  console.log('用户输入:', result.value)
}
</script>
```

### MessageBox 方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| alert | 显示提示框 | `(options: MessageOptions) => Promise<MessageResult>` |
| confirm | 显示确认框 | `(options: MessageOptions) => Promise<MessageResult>` |
| prompt | 显示输入框 | `(options: MessageOptions) => Promise<MessageResult>` |

### MessageOptions 类型

```typescript
interface MessageOptions {
  title?: string
  msg?: string
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  inputPlaceholder?: string
  inputType?: string
  inputValidate?: (value: string) => boolean | string
  beforeConfirm?: (action: string, value?: string) => boolean | Promise<boolean>
}

interface MessageResult {
  action: 'confirm' | 'cancel'
  value?: string
}
```

---

## ActionSheet 动作面板

从底部弹出的动作菜单面板，支持菜单选项和图标面板两种模式。

### 基本用法

```vue
<template>
  <wd-button @click="visible = true">显示动作面板</wd-button>

  <wd-action-sheet
    v-model="visible"
    :actions="actions"
    title="请选择操作"
    cancel-text="取消"
    @select="onSelect"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
const actions = [
  { name: '选项1' },
  { name: '选项2', color: '#ee0a24' },
  { name: '禁用选项', disabled: true },
]

// 字典格式
const dictActions = [
  { label: '正常', value: '1' },
  { label: '停用', value: '0' },
]

const onSelect = (data) => {
  console.log('选中:', data.value || data.name)
}
</script>
```

### 图标面板模式

```vue
<template>
  <wd-action-sheet v-model="visible" :panels="panels" @select="onSelect" />
</template>

<script lang="ts" setup>
const panels = [
  { iconUrl: '/static/icons/wechat.png', title: '微信' },
  { iconUrl: '/static/icons/alipay.png', title: '支付宝' },
]
</script>
```

### ActionSheet Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 是否显示动作面板 | `boolean` | `false` |
| actions | 菜单选项 | `Action[]` | `[]` |
| panels | 图标面板项 | `Panel[] \| Panel[][]` | `[]` |
| title | 标题 | `string` | - |
| cancelText | 取消按钮文案 | `string` | - |
| closeOnClickAction | 点击选项后是否关闭 | `boolean` | `true` |
| closeOnClickModal | 点击遮罩是否关闭 | `boolean` | `true` |
| safeAreaInsetBottom | 是否设置底部安全距离 | `boolean` | `true` |

### ActionSheet Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| select | 选择选项时触发 | `data: SelectEventData` |
| cancel | 点击取消按钮时触发 | - |
| close | 关闭时触发 | - |

### Action 类型

```typescript
interface Action {
  name?: string
  label?: string
  value?: string | number
  subname?: string
  color?: string
  disabled?: boolean
  loading?: boolean
}
```

---

## NoticeBar 通知栏

通知栏组件，用于在页面顶部展示通知提醒。

### 基本用法

```vue
<template>
  <!-- 基本用法 -->
  <wd-notice-bar text="这是一条通知公告" />

  <!-- 通知类型 -->
  <wd-notice-bar type="warning" text="警告类型通知" />
  <wd-notice-bar type="info" text="信息类型通知" />
  <wd-notice-bar type="danger" text="危险类型通知" />

  <!-- 滚动播放 -->
  <wd-notice-bar scrollable text="很长的通知内容..." />

  <!-- 垂直轮播 -->
  <wd-notice-bar direction="vertical" :text="noticeList" />

  <!-- 可关闭 -->
  <wd-notice-bar closable text="可关闭的通知" @close="onClose" />

  <!-- 自定义颜色 -->
  <wd-notice-bar color="#1989fa" background-color="#ecf9ff" text="自定义颜色" />
</template>

<script lang="ts" setup>
const noticeList = ['第一条通知', '第二条通知', '第三条通知']
const onClose = () => console.log('通知已关闭')
</script>
```

### NoticeBar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| text | 通知文案 | `string \| string[]` | `''` |
| type | 通知类型 | `'warning' \| 'info' \| 'danger' \| ''` | `'warning'` |
| scrollable | 是否可滚动 | `boolean` | `true` |
| delay | 滚动延迟时间（秒） | `number` | `1` |
| speed | 滚动速度（rpx/s） | `number` | `100` |
| closable | 是否可关闭 | `boolean` | `false` |
| wrapable | 是否换行显示 | `boolean` | `false` |
| prefix | 左侧图标名称 | `string` | - |
| color | 文字、图标颜色 | `string` | - |
| backgroundColor | 背景颜色 | `string` | - |
| direction | 滚动方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |

### NoticeBar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 关闭时触发 | - |
| next | 切换到下一条（垂直轮播） | `index: number` |
| click | 点击时触发 | `{ index: number, text: string }` |

---

## Overlay 遮罩层

遮罩层组件，用于强调特定的页面元素。

### 基本用法

```vue
<template>
  <wd-button @click="visible = true">显示遮罩层</wd-button>

  <wd-overlay :show="visible" @click="visible = false" />

  <!-- 嵌入内容 -->
  <wd-overlay :show="showContent" @click="showContent = false">
    <view class="overlay-content" @click.stop>
      <text>遮罩层上的内容</text>
      <wd-button @click="showContent = false">关闭</wd-button>
    </view>
  </wd-overlay>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const visible = ref(false)
const showContent = ref(false)
</script>
```

### Overlay Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| show | 是否展示遮罩层 | `boolean` | `false` |
| duration | 动画时长（毫秒） | `number` | `300` |
| lockScroll | 是否锁定滚动 | `boolean` | `true` |
| zIndex | 层级 | `number` | `100` |

### Overlay Events

| 事件名 | 说明 |
|--------|------|
| click | 点击遮罩层时触发 |

---

## SwipeAction 滑动操作

滑动操作组件，常用于单元格左右滑删除等手势操作。

### 基本用法

```vue
<template>
  <!-- 左滑操作 -->
  <wd-swipe-action>
    <wd-cell title="左滑操作" value="左滑试试" />
    <template #right>
      <view class="action-btn delete" @click="onDelete">删除</view>
    </template>
  </wd-swipe-action>

  <!-- 左右滑动 -->
  <wd-swipe-action>
    <template #left>
      <view class="action-btn collect">收藏</view>
    </template>
    <wd-cell title="左右滑动" />
    <template #right>
      <view class="action-btn delete">删除</view>
    </template>
  </wd-swipe-action>

  <!-- 受控模式 -->
  <wd-swipe-action v-model="status">
    <wd-cell title="受控模式" />
    <template #right>
      <view class="action-btn delete">删除</view>
    </template>
  </wd-swipe-action>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const status = ref<'left' | 'close' | 'right'>('close')
const onDelete = () => uni.showToast({ title: '删除成功', icon: 'success' })
</script>

<style lang="scss" scoped>
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 100%;
  color: #fff;
}
.delete { background-color: #ee0a24; }
.collect { background-color: #1989fa; }
</style>
```

### 关闭前钩子

```vue
<template>
  <wd-swipe-action :before-close="beforeClose">
    <wd-cell title="关闭前确认" />
    <template #right>
      <view class="action-btn delete">删除</view>
    </template>
  </wd-swipe-action>
</template>

<script lang="ts" setup>
const beforeClose = (reason, position) => {
  if (position === 'right' && reason === 'click') {
    uni.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          uni.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }
}
</script>
```

### SwipeAction Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / v-model | 滑动状态 | `'left' \| 'close' \| 'right'` | `'close'` |
| disabled | 是否禁用滑动 | `boolean` | `false` |
| beforeClose | 关闭前的钩子函数 | `(reason, position) => void` | - |

### SwipeAction Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 滑动状态更新时触发 | `value: SwipeActionStatus` |
| click | 点击内容区域时触发 | `{ value: SwipeActionPosition }` |

### SwipeAction Slots

| 名称 | 说明 |
|------|------|
| default | 单元格内容 |
| left | 左侧操作按钮 |
| right | 右侧操作按钮 |

---

## 最佳实践

### Toast 使用规范

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 操作反馈
const handleSubmit = async () => {
  toast.loading('提交中...')
  try {
    await submitForm()
    toast.success('提交成功')
  } catch (error) {
    toast.error('提交失败，请重试')
  }
}
</script>
```

### Popup 层级管理

```vue
<template>
  <!-- 使用不同层级避免冲突 -->
  <wd-popup v-model="showFirst" :z-index="100" />
  <wd-popup v-model="showSecond" :z-index="200" />
  <wd-toast /> <!-- 默认 z-index: 1000 -->
</template>
```

### SwipeAction 列表使用

```vue
<template>
  <view v-for="(item, index) in list" :key="item.id">
    <wd-swipe-action
      v-model="item.swipeStatus"
      :before-close="(reason, pos) => handleBeforeClose(reason, pos, index)"
    >
      <wd-cell :title="item.title" />
      <template #right>
        <view class="action-btn delete">删除</view>
      </template>
    </wd-swipe-action>
  </view>
</template>

<script lang="ts" setup>
const list = ref([
  { id: 1, title: '项目1', swipeStatus: 'close' },
  { id: 2, title: '项目2', swipeStatus: 'close' },
])

const handleBeforeClose = (reason, position, index) => {
  if (position === 'right' && reason === 'click') {
    uni.showModal({
      title: '确认删除',
      content: `确定要删除"${list.value[index].title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          list.value.splice(index, 1)
        }
      }
    })
  }
}
</script>
```

---

## 常见问题

### Toast 不显示

确保页面中有 `<wd-toast />` 组件：

```vue
<template>
  <view class="page">
    <wd-toast />
    <!-- 页面内容 -->
  </view>
</template>
```

### Popup 内容无法滚动

使用 scroll-view 包裹内容：

```vue
<wd-popup v-model="visible" position="bottom">
  <scroll-view scroll-y style="height: 600rpx;">
    <!-- 可滚动内容 -->
  </scroll-view>
</wd-popup>
```

### 多个反馈组件层级冲突

按显示顺序设置层级：

```vue
<wd-popup v-model="showPopup" :z-index="100" />
<wd-action-sheet v-model="showSheet" :z-index="150" />
<wd-toast /> <!-- 默认 z-index: 1000 -->
```

---

## 类型定义

```typescript
// Toast
type ToastIconType = 'success' | 'error' | 'warning' | 'loading' | 'info' | ''
type ToastPositionType = 'top' | 'middle-top' | 'middle' | 'bottom'

// Popup
type PopupType = 'center' | 'top' | 'right' | 'bottom' | 'left'

// ActionSheet
interface Action {
  name?: string
  label?: string
  value?: string | number
  subname?: string
  color?: string
  disabled?: boolean
  loading?: boolean
}

interface Panel {
  iconUrl: string
  title: string
}

// NoticeBar
type NoticeBarType = 'warning' | 'info' | 'danger' | ''

// SwipeAction
type SwipeActionStatus = 'left' | 'close' | 'right'
type SwipeActionReason = 'click' | 'swipe' | 'value'
type SwipeActionPosition = SwipeActionStatus | 'inside'
```
