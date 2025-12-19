---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/tooltip
---

# Tooltip 文字提示

## 介绍

Tooltip 文字提示组件用于展示简短的提示信息,常用于解释图标、按钮等元素的含义。组件基于 `usePopover` Composable 实现智能定位,支持 12 种弹出位置和自定义内容,提供了灵活的提示展示方案。

**核心特性:**

- **智能定位系统** - 基于 usePopover Composable 实现 12 种弹出位置的精确计算
- **箭头指示器** - 使用 CSS triangleArrow mixin 生成三角形箭头,自动跟随位置调整方向
- **队列管理机制** - 通过 clickoutside 模块实现互斥显示,同一时间只显示一个 Tooltip
- **平滑过渡动画** - 基于 wd-transition 组件实现 200ms 淡入淡出效果
- **毛玻璃背景效果** - 使用 backdrop-filter 实现 20rpx 高斯模糊效果
- **受控与非受控模式** - 支持 v-model 双向绑定和 open/close 方法调用
- **灵活的偏移配置** - offset 支持数字、数组、对象三种格式

**技术实现:**

组件内部通过 `usePopover` 处理弹出层定位,核心计算逻辑:

```typescript
// 箭头尺寸计算
const arrowSize = visibleArrow ? 9 : 0

// 纵轴位置计算
const verticalX = width.value / 2  // 水平居中
const verticalY = arrowSize + height.value + 5  // 垂直偏移

// 横轴位置计算
const horizontalX = width.value + arrowSize + 5  // 水平偏移
const horizontalY = height.value / 2  // 垂直居中
```

## 基本用法

### 基础用法

通过 `content` 属性设置提示内容,点击触发元素即可显示提示框。

```vue
<template>
  <wd-tooltip content="这是一段提示文字">
    <wd-button>点击显示提示</wd-button>
  </wd-tooltip>
</template>
```

**工作原理:**

- 点击 default 插槽中的元素触发 toggle 方法
- 组件内部通过 `showTooltip` ref 控制显示状态
- 使用 `wd-transition` 实现 fade 动画效果

### 弹出位置

通过 `placement` 设置弹出位置,支持 12 种方向。

```vue
<template>
  <view class="placement-demo">
    <!-- 顶部方向 -->
    <view class="row">
      <wd-tooltip content="top-start" placement="top-start">
        <wd-button size="small">上左</wd-button>
      </wd-tooltip>
      <wd-tooltip content="top" placement="top">
        <wd-button size="small">上</wd-button>
      </wd-tooltip>
      <wd-tooltip content="top-end" placement="top-end">
        <wd-button size="small">上右</wd-button>
      </wd-tooltip>
    </view>

    <!-- 左右方向 -->
    <view class="middle-row">
      <view class="left-col">
        <wd-tooltip content="left-start" placement="left-start">
          <wd-button size="small">左上</wd-button>
        </wd-tooltip>
        <wd-tooltip content="left" placement="left">
          <wd-button size="small">左</wd-button>
        </wd-tooltip>
        <wd-tooltip content="left-end" placement="left-end">
          <wd-button size="small">左下</wd-button>
        </wd-tooltip>
      </view>
      <view class="right-col">
        <wd-tooltip content="right-start" placement="right-start">
          <wd-button size="small">右上</wd-button>
        </wd-tooltip>
        <wd-tooltip content="right" placement="right">
          <wd-button size="small">右</wd-button>
        </wd-tooltip>
        <wd-tooltip content="right-end" placement="right-end">
          <wd-button size="small">右下</wd-button>
        </wd-tooltip>
      </view>
    </view>

    <!-- 底部方向 -->
    <view class="row">
      <wd-tooltip content="bottom-start" placement="bottom-start">
        <wd-button size="small">下左</wd-button>
      </wd-tooltip>
      <wd-tooltip content="bottom" placement="bottom">
        <wd-button size="small">下</wd-button>
      </wd-tooltip>
      <wd-tooltip content="bottom-end" placement="bottom-end">
        <wd-button size="small">下右</wd-button>
      </wd-tooltip>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.placement-demo {
  padding: 100rpx 32rpx;

  .row {
    display: flex;
    justify-content: center;
    gap: 24rpx;
  }

  .middle-row {
    display: flex;
    justify-content: space-between;
    margin: 32rpx 0;
  }

  .left-col,
  .right-col {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }
}
</style>
```

**位置计算原理:**

| 位置 | 弹出层定位 | 箭头方向 |
|------|-----------|---------|
| `top` | 上方居中 | 向下 |
| `top-start` | 上方靠左 | 向下 |
| `top-end` | 上方靠右 | 向下 |
| `bottom` | 下方居中 | 向上 |
| `bottom-start` | 下方靠左 | 向上 |
| `bottom-end` | 下方靠右 | 向上 |
| `left` | 左侧居中 | 向右 |
| `left-start` | 左侧靠上 | 向右 |
| `left-end` | 左侧靠下 | 向右 |
| `right` | 右侧居中 | 向左 |
| `right-start` | 右侧靠上 | 向左 |
| `right-end` | 右侧靠下 | 向左 |

### 受控模式

通过 `v-model` 控制提示的显示状态,实现外部控制。

```vue
<template>
  <view class="control-demo">
    <wd-tooltip v-model="show" content="受控模式下的提示内容">
      <wd-button>{{ show ? '点击隐藏' : '点击显示' }}</wd-button>
    </wd-tooltip>

    <view class="control-buttons">
      <wd-button type="success" @click="show = true">显示</wd-button>
      <wd-button type="error" @click="show = false">隐藏</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)
</script>

<style lang="scss" scoped>
.control-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.control-buttons {
  display: flex;
  gap: 24rpx;
}
</style>
```

**状态同步机制:**

```typescript
// 监听 modelValue 变化,同步到内部状态
watch(
  () => props.modelValue,
  (newValue) => {
    showTooltip.value = newValue
  },
)

// 更新时同时修改内部状态和触发事件
const updateModelValue = (value: boolean) => {
  showTooltip.value = value
  emit('update:modelValue', value)
}
```

### 显示关闭按钮

设置 `show-close` 显示关闭按钮,方便用户手动关闭提示。

```vue
<template>
  <wd-tooltip
    content="这是一段较长的提示信息,点击右上角按钮可以关闭"
    show-close
  >
    <wd-button>显示带关闭按钮的提示</wd-button>
  </wd-tooltip>
</template>
```

**关闭按钮样式:**

关闭按钮使用 `wd-icon` 组件渲染,样式定义:

```scss
@include edeep(close-icon) {
  font-size: 24rpx;
  position: absolute;
  right: -16rpx;
  top: -20rpx;
  transform: scale(0.5);  // 缩小显示
  padding: 20rpx;  // 扩大点击区域
}
```

### 隐藏箭头

设置 `visible-arrow` 为 `false` 隐藏箭头指示器。

```vue
<template>
  <view class="arrow-demo">
    <wd-tooltip content="带箭头的提示">
      <wd-button>默认(有箭头)</wd-button>
    </wd-tooltip>

    <wd-tooltip content="无箭头的提示" :visible-arrow="false">
      <wd-button>无箭头</wd-button>
    </wd-tooltip>
  </view>
</template>

<style lang="scss" scoped>
.arrow-demo {
  display: flex;
  gap: 24rpx;
}
</style>
```

**箭头尺寸影响:**

当 `visibleArrow` 为 false 时,定位计算中箭头尺寸为 0:

```typescript
const arrowSize = visibleArrow ? 9 : 0
```

### 偏移量

通过 `offset` 设置弹出位置的偏移量,支持三种格式。

```vue
<template>
  <view class="offset-demo">
    <!-- 数字偏移:统一偏移 -->
    <wd-tooltip content="偏移 10px" :offset="10">
      <wd-button>数字偏移</wd-button>
    </wd-tooltip>

    <!-- 数组偏移:[x, y] -->
    <wd-tooltip content="X轴20, Y轴10" :offset="[20, 10]">
      <wd-button>数组偏移</wd-button>
    </wd-tooltip>

    <!-- 对象偏移:{ x, y } -->
    <wd-tooltip content="X轴30, Y轴5" :offset="{ x: 30, y: 5 }">
      <wd-button>对象偏移</wd-button>
    </wd-tooltip>
  </view>
</template>

<style lang="scss" scoped>
.offset-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}
</style>
```

**偏移量计算逻辑:**

```typescript
let offsetX = 0
let offsetY = 0

if (Array.isArray(offset)) {
  // 数组格式:[x, y] 或 [xy]
  offsetX = (verticalX - 17 > 0 ? 0 : verticalX - 25) + offset[0]
  offsetY = (horizontalY - 17 > 0 ? 0 : horizontalY - 25) +
            (offset[1] ? offset[1] : offset[0])
} else if (isObj(offset)) {
  // 对象格式:{ x, y }
  offsetX = (verticalX - 17 > 0 ? 0 : verticalX - 25) + offset.x
  offsetY = (horizontalY - 17 > 0 ? 0 : horizontalY - 25) + offset.y
} else {
  // 数字格式:统一偏移
  offsetX = (verticalX - 17 > 0 ? 0 : verticalX - 25) + offset
  offsetY = (horizontalY - 17 > 0 ? 0 : horizontalY - 25) + offset
}
```

### 自定义内容

通过 `content` 插槽自定义提示内容,需要设置 `use-content-slot` 为 true。

```vue
<template>
  <wd-tooltip use-content-slot>
    <template #content>
      <view class="custom-content">
        <wd-icon name="info-circle" color="#fff" />
        <text class="content-text">自定义图标提示</text>
      </view>
    </template>
    <wd-button>自定义内容</wd-button>
  </wd-tooltip>
</template>

<style lang="scss" scoped>
.custom-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 0;

  .content-text {
    color: #fff;
    font-size: 28rpx;
  }
}
</style>
```

**复杂内容示例:**

```vue
<template>
  <wd-tooltip use-content-slot show-close placement="right">
    <template #content>
      <view class="rich-content">
        <view class="rich-title">
          <wd-icon name="star-fill" color="#ffc107" />
          <text>产品特性</text>
        </view>
        <view class="rich-list">
          <view class="rich-item">✓ 高性能渲染引擎</view>
          <view class="rich-item">✓ 跨平台兼容</view>
          <view class="rich-item">✓ TypeScript 支持</view>
        </view>
      </view>
    </template>
    <wd-button type="primary">查看特性</wd-button>
  </wd-tooltip>
</template>

<style lang="scss" scoped>
.rich-content {
  padding: 16rpx 8rpx;
  min-width: 200rpx;

  .rich-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 16rpx;
  }

  .rich-list {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .rich-item {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
```

### 禁用状态

设置 `disabled` 禁用 Tooltip,点击不会触发显示。

```vue
<template>
  <view class="disabled-demo">
    <wd-tooltip content="正常状态的提示">
      <wd-button>正常</wd-button>
    </wd-tooltip>

    <wd-tooltip content="禁用状态下不会显示" disabled>
      <wd-button>禁用</wd-button>
    </wd-tooltip>
  </view>
</template>

<style lang="scss" scoped>
.disabled-demo {
  display: flex;
  gap: 24rpx;
}
</style>
```

**禁用逻辑:**

```typescript
const toggle = () => {
  if (props.disabled) return  // 禁用时直接返回
  updateModelValue(!showTooltip.value)
}
```

### 方法调用

通过 ref 获取组件实例,调用 open/close 方法进行程序化控制。

```vue
<template>
  <view class="method-demo">
    <wd-tooltip ref="tooltipRef" content="通过方法控制的提示">
      <wd-button>目标元素</wd-button>
    </wd-tooltip>

    <view class="method-buttons">
      <wd-button type="success" size="small" @click="handleOpen">
        打开
      </wd-button>
      <wd-button type="error" size="small" @click="handleClose">
        关闭
      </wd-button>
      <wd-button type="primary" size="small" @click="handleToggle">
        切换
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TooltipInstance } from '@/wd'

const tooltipRef = ref<TooltipInstance>()

const handleOpen = () => {
  tooltipRef.value?.open()
}

const handleClose = () => {
  tooltipRef.value?.close()
}

const handleToggle = () => {
  // 通过检查 DOM 状态或使用 v-model 来判断当前状态
  // 这里演示直接调用方法
  tooltipRef.value?.open()
}
</script>

<style lang="scss" scoped>
.method-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.method-buttons {
  display: flex;
  gap: 16rpx;
}
</style>
```

### 事件监听

监听 Tooltip 的打开、关闭和状态变化事件。

```vue
<template>
  <view class="event-demo">
    <wd-tooltip
      content="监听事件的提示"
      @open="handleOpen"
      @close="handleClose"
      @change="handleChange"
    >
      <wd-button>事件监听</wd-button>
    </wd-tooltip>

    <view class="event-log">
      <text>事件日志:</text>
      <text v-for="(log, index) in logs" :key="index">{{ log }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const logs = ref<string[]>([])

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${msg}`)
  if (logs.value.length > 5) {
    logs.value.pop()
  }
}

const handleOpen = () => {
  addLog('open 事件触发')
}

const handleClose = () => {
  addLog('close 事件触发')
}

const handleChange = (data: { show: boolean }) => {
  addLog(`change 事件: show = ${data.show}`)
}
</script>

<style lang="scss" scoped>
.event-demo {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.event-log {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}
</style>
```

## 高级用法

### 动态内容更新

根据不同状态动态更新提示内容。

```vue
<template>
  <view class="dynamic-demo">
    <wd-tooltip :content="tooltipContent">
      <wd-button @click="handleClick">
        {{ buttonText }}
      </wd-button>
    </wd-tooltip>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const clickCount = ref(0)

const tooltipContent = computed(() => {
  if (clickCount.value === 0) {
    return '点击按钮开始计数'
  } else if (clickCount.value < 5) {
    return `已点击 ${clickCount.value} 次,继续加油!`
  } else {
    return `太棒了!已点击 ${clickCount.value} 次`
  }
})

const buttonText = computed(() => `点击次数: ${clickCount.value}`)

const handleClick = () => {
  clickCount.value++
}
</script>
```

### 异步内容加载

结合异步数据加载显示动态提示。

```vue
<template>
  <view class="async-demo">
    <wd-tooltip
      v-model="showTip"
      use-content-slot
      @open="loadUserInfo"
    >
      <template #content>
        <view class="user-card">
          <template v-if="loading">
            <wd-loading size="24" color="#fff" />
            <text class="loading-text">加载中...</text>
          </template>
          <template v-else-if="userInfo">
            <image :src="userInfo.avatar" class="user-avatar" />
            <view class="user-info">
              <text class="user-name">{{ userInfo.name }}</text>
              <text class="user-email">{{ userInfo.email }}</text>
            </view>
          </template>
        </view>
      </template>
      <wd-button>查看用户信息</wd-button>
    </wd-tooltip>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface UserInfo {
  avatar: string
  name: string
  email: string
}

const showTip = ref(false)
const loading = ref(false)
const userInfo = ref<UserInfo | null>(null)

const loadUserInfo = async () => {
  if (userInfo.value) return  // 已加载过,不重复请求

  loading.value = true

  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 1000))

  userInfo.value = {
    avatar: 'https://example.com/avatar.png',
    name: '张三',
    email: 'zhangsan@example.com'
  }

  loading.value = false
}
</script>

<style lang="scss" scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx;
  min-width: 280rpx;

  .loading-text {
    color: #fff;
    font-size: 26rpx;
  }

  .user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .user-name {
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
  }

  .user-email {
    color: rgba(255, 255, 255, 0.8);
    font-size: 24rpx;
  }
}
</style>
```

### 条件触发显示

根据特定条件决定是否显示提示。

```vue
<template>
  <view class="condition-demo">
    <wd-cell title="启用提示">
      <wd-switch v-model="enableTip" />
    </wd-cell>

    <wd-tooltip
      :content="tipContent"
      :disabled="!enableTip"
    >
      <wd-button>{{ enableTip ? '提示已启用' : '提示已禁用' }}</wd-button>
    </wd-tooltip>

    <!-- 根据输入内容显示不同提示 -->
    <wd-input
      v-model="inputValue"
      placeholder="输入内容查看验证提示"
    />
    <wd-tooltip
      v-model="showValidation"
      :content="validationMessage"
      placement="bottom"
    >
      <wd-button @click="validateInput">验证</wd-button>
    </wd-tooltip>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const enableTip = ref(true)
const tipContent = ref('这是一个可控制的提示')

const inputValue = ref('')
const showValidation = ref(false)

const validationMessage = computed(() => {
  if (!inputValue.value) {
    return '请输入内容'
  }
  if (inputValue.value.length < 3) {
    return '内容长度不能少于3个字符'
  }
  return '验证通过!'
})

const validateInput = () => {
  showValidation.value = true
  setTimeout(() => {
    showValidation.value = false
  }, 2000)
}
</script>

<style lang="scss" scoped>
.condition-demo {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
</style>
```

### 表单字段帮助提示

为表单字段提供帮助说明。

```vue
<template>
  <view class="form-help-demo">
    <wd-cell-group title="注册信息">
      <!-- 用户名字段 -->
      <wd-cell>
        <template #title>
          <view class="cell-title-with-tip">
            <text>用户名</text>
            <wd-tooltip content="用户名长度为4-16个字符,支持字母、数字、下划线">
              <wd-icon name="help-circle" size="32rpx" color="#999" />
            </wd-tooltip>
          </view>
        </template>
        <wd-input v-model="form.username" placeholder="请输入用户名" />
      </wd-cell>

      <!-- 密码字段 -->
      <wd-cell>
        <template #title>
          <view class="cell-title-with-tip">
            <text>密码</text>
            <wd-tooltip
              use-content-slot
              placement="right"
            >
              <template #content>
                <view class="password-rules">
                  <text class="rule-title">密码要求:</text>
                  <text class="rule-item">• 长度 8-20 个字符</text>
                  <text class="rule-item">• 包含大小写字母</text>
                  <text class="rule-item">• 包含数字</text>
                  <text class="rule-item">• 可包含特殊字符</text>
                </view>
              </template>
              <wd-icon name="help-circle" size="32rpx" color="#999" />
            </wd-tooltip>
          </view>
        </template>
        <wd-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
        />
      </wd-cell>

      <!-- 邮箱字段 -->
      <wd-cell>
        <template #title>
          <view class="cell-title-with-tip">
            <text>邮箱</text>
            <wd-tooltip content="用于接收验证码和找回密码">
              <wd-icon name="help-circle" size="32rpx" color="#999" />
            </wd-tooltip>
          </view>
        </template>
        <wd-input v-model="form.email" placeholder="请输入邮箱" />
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
  email: ''
})
</script>

<style lang="scss" scoped>
.cell-title-with-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.password-rules {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 8rpx;

  .rule-title {
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
  }

  .rule-item {
    color: rgba(255, 255, 255, 0.9);
    font-size: 24rpx;
  }
}
</style>
```

### 功能按钮说明

为工具栏按钮添加功能说明。

```vue
<template>
  <view class="toolbar-demo">
    <view class="toolbar">
      <wd-tooltip content="撤销操作" placement="bottom">
        <view class="toolbar-btn" @click="handleUndo">
          <wd-icon name="undo" size="40rpx" />
        </view>
      </wd-tooltip>

      <wd-tooltip content="重做操作" placement="bottom">
        <view class="toolbar-btn" @click="handleRedo">
          <wd-icon name="redo" size="40rpx" />
        </view>
      </wd-tooltip>

      <view class="toolbar-divider" />

      <wd-tooltip content="复制选中内容" placement="bottom">
        <view class="toolbar-btn" @click="handleCopy">
          <wd-icon name="copy" size="40rpx" />
        </view>
      </wd-tooltip>

      <wd-tooltip content="粘贴内容" placement="bottom">
        <view class="toolbar-btn" @click="handlePaste">
          <wd-icon name="paste" size="40rpx" />
        </view>
      </wd-tooltip>

      <view class="toolbar-divider" />

      <wd-tooltip
        use-content-slot
        placement="bottom"
      >
        <template #content>
          <view class="shortcut-tip">
            <text class="shortcut-title">删除</text>
            <text class="shortcut-key">Delete</text>
          </view>
        </template>
        <view class="toolbar-btn toolbar-btn--danger" @click="handleDelete">
          <wd-icon name="delete" size="40rpx" />
        </view>
      </wd-tooltip>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleUndo = () => toast.info('撤销')
const handleRedo = () => toast.info('重做')
const handleCopy = () => toast.info('复制')
const handlePaste = () => toast.info('粘贴')
const handleDelete = () => toast.info('删除')
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  transition: background 0.2s;

  &:active {
    background: #e0e0e0;
  }

  &--danger {
    color: #f56c6c;
  }
}

.toolbar-divider {
  width: 2rpx;
  height: 40rpx;
  background: #e0e0e0;
}

.shortcut-tip {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .shortcut-title {
    color: #fff;
    font-size: 26rpx;
  }

  .shortcut-key {
    padding: 4rpx 12rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8rpx;
    color: #fff;
    font-size: 22rpx;
  }
}
</style>
```

### 数据状态说明

为数据状态图标添加说明。

```vue
<template>
  <view class="status-demo">
    <view class="data-table">
      <view class="table-header">
        <text class="col-name">名称</text>
        <text class="col-status">状态</text>
        <text class="col-action">操作</text>
      </view>

      <view
        v-for="item in dataList"
        :key="item.id"
        class="table-row"
      >
        <text class="col-name">{{ item.name }}</text>
        <view class="col-status">
          <wd-tooltip :content="item.statusDesc">
            <view class="status-badge" :class="`status-${item.status}`">
              <view class="status-dot" />
              <text>{{ item.statusText }}</text>
            </view>
          </wd-tooltip>
        </view>
        <view class="col-action">
          <wd-tooltip
            v-if="item.status === 'error'"
            use-content-slot
            placement="left"
          >
            <template #content>
              <view class="error-detail">
                <text class="error-title">错误信息</text>
                <text class="error-msg">{{ item.errorMsg }}</text>
              </view>
            </template>
            <wd-icon name="warning" color="#f56c6c" />
          </wd-tooltip>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface DataItem {
  id: number
  name: string
  status: 'success' | 'pending' | 'error'
  statusText: string
  statusDesc: string
  errorMsg?: string
}

const dataList = ref<DataItem[]>([
  {
    id: 1,
    name: '订单 #1001',
    status: 'success',
    statusText: '已完成',
    statusDesc: '订单已于 2024-01-15 10:30 完成'
  },
  {
    id: 2,
    name: '订单 #1002',
    status: 'pending',
    statusText: '处理中',
    statusDesc: '订单正在处理,预计 30 分钟内完成'
  },
  {
    id: 3,
    name: '订单 #1003',
    status: 'error',
    statusText: '异常',
    statusDesc: '订单处理失败,请查看详情',
    errorMsg: '库存不足,无法完成发货'
  }
])
</script>

<style lang="scss" scoped>
.data-table {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.table-header,
.table-row {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
}

.table-header {
  background: #f5f5f5;
  font-weight: bold;
  font-size: 28rpx;
}

.table-row {
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

.col-name {
  flex: 1;
  font-size: 28rpx;
}

.col-status {
  width: 160rpx;
}

.col-action {
  width: 80rpx;
  display: flex;
  justify-content: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.status-success {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;

  .status-dot {
    background: #67c23a;
  }
}

.status-pending {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;

  .status-dot {
    background: #e6a23c;
  }
}

.status-error {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;

  .status-dot {
    background: #f56c6c;
  }
}

.error-detail {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  max-width: 400rpx;

  .error-title {
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
  }

  .error-msg {
    color: rgba(255, 255, 255, 0.9);
    font-size: 24rpx;
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 是否显示 Tooltip | `boolean` | `false` |
| content | 提示内容 | `string \| Array<Record<string, any>>` | - |
| placement | 弹出位置 | `PlacementType` | `'bottom'` |
| offset | 偏移量 | `number \| number[] \| { x: number, y: number }` | `0` |
| visible-arrow | 是否显示箭头 | `boolean` | `true` |
| use-content-slot | 是否使用 content 插槽 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| show-close | 是否显示关闭按钮 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-arrow | 自定义箭头样式类 | `string` | `''` |
| custom-pop | 自定义弹出层样式类 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 显示状态变化时触发 | `value: boolean` |
| change | 显示状态变化时触发 | `{ show: boolean }` |
| open | 打开时触发 | - |
| close | 关闭时触发 | - |
| menuclick | 菜单点击时触发(内部使用) | - |

### Slots

| 名称 | 说明 |
|------|------|
| default | 触发提示的元素 |
| content | 自定义提示内容,需设置 `use-content-slot` 为 true |

### Methods

通过 ref 获取组件实例后可调用的方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开提示 | - | `void` |
| close | 关闭提示 | - | `void` |

### 类型定义

```typescript
/**
 * 弹出位置类型
 */
type PlacementType =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/**
 * Tooltip 组件属性接口
 */
interface WdTooltipProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义箭头样式类 */
  customArrow?: string
  /** 自定义弹出层样式类 */
  customPop?: string
  /** 是否显示箭头 */
  visibleArrow?: boolean
  /** 提示内容 */
  content?: string | Array<Record<string, any>>
  /** 弹出位置 */
  placement?: PlacementType
  /** 偏移量 */
  offset?: number | number[] | Record<'x' | 'y', number>
  /** 是否使用 content 插槽 */
  useContentSlot?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示(v-model) */
  modelValue?: boolean
}

/**
 * Tooltip 组件事件接口
 */
interface WdTooltipEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: boolean]
  /** 菜单点击事件 */
  menuclick: []
  /** 状态变化事件 */
  change: [data: { show: boolean }]
  /** 打开事件 */
  open: []
  /** 关闭事件 */
  close: []
}

/**
 * Tooltip 组件暴露的方法接口
 */
interface WdTooltipExpose {
  /** 打开 tooltip */
  open: () => void
  /** 关闭 tooltip */
  close: () => void
}

/**
 * Tooltip 组件实例类型
 */
type TooltipInstance = ComponentPublicInstance<WdTooltipProps, WdTooltipExpose>
```

### usePopover Composable

Tooltip 内部使用的定位计算组合式函数:

```typescript
/**
 * 弹出层定位组合式函数
 * @param visibleArrow - 是否显示箭头
 * @returns 定位相关的响应式状态和方法
 */
function usePopover(visibleArrow?: boolean): {
  /** 弹出层样式 */
  popStyle: Ref<string>
  /** 箭头样式 */
  arrowStyle: Ref<string>
  /** 显示样式 */
  showStyle: Ref<string>
  /** 箭头类名 */
  arrowClass: Ref<string>
  /** 初始化方法 */
  init: (placement: PlacementType, visibleArrow: boolean, selector: string) => void
  /** 位置控制方法 */
  control: (placement: PlacementType, offset: number | number[] | Record<'x' | 'y', number>) => void
  /** 空操作方法 */
  noop: () => void
}
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-tooltip-bg | 背景颜色 | `rgba(38, 39, 40, 0.8)` |
| --wot-tooltip-color | 文字颜色 | `#ffffff` |
| --wot-tooltip-radius | 圆角大小 | `16rpx` |
| --wot-tooltip-arrow-size | 箭头大小 | `10rpx` |
| --wot-tooltip-fs | 字体大小 | `$-fs-content` |
| --wot-tooltip-blur | 高斯模糊效果 | `20rpx` |
| --wot-tooltip-padding | 内边距 | `18rpx 40rpx` |
| --wot-tooltip-close-size | 关闭按钮大小 | `12rpx` |
| --wot-tooltip-z-index | 层级 | `500` |
| --wot-tooltip-line-height | 行高 | `36rpx` |

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <!-- 亮色主题 -->
    <view class="light-tooltip">
      <wd-tooltip content="亮色主题提示">
        <wd-button>亮色主题</wd-button>
      </wd-tooltip>
    </view>

    <!-- 品牌色主题 -->
    <view class="brand-tooltip">
      <wd-tooltip content="品牌色主题提示">
        <wd-button type="primary">品牌主题</wd-button>
      </wd-tooltip>
    </view>

    <!-- 成功主题 -->
    <view class="success-tooltip">
      <wd-tooltip content="操作成功提示">
        <wd-button type="success">成功主题</wd-button>
      </wd-tooltip>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.light-tooltip {
  --wot-tooltip-bg: rgba(255, 255, 255, 0.95);
  --wot-tooltip-color: #333;
  --wot-tooltip-radius: 8rpx;
}

.brand-tooltip {
  --wot-tooltip-bg: rgba(77, 128, 240, 0.95);
  --wot-tooltip-color: #fff;
  --wot-tooltip-radius: 12rpx;
}

.success-tooltip {
  --wot-tooltip-bg: rgba(103, 194, 58, 0.95);
  --wot-tooltip-color: #fff;
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持,在 `wot-theme-dark` 类下自动切换样式:

```scss
.wot-theme-dark {
  @include b(tooltip) {
    @include e(pos) {
      background: $-dark-background4;
      color: $-tooltip-color;
    }
  }
}
```

## 最佳实践

### 1. 提示内容简洁明了

```vue
<!-- ✅ 好的做法:简洁的提示 -->
<wd-tooltip content="复制链接">
  <wd-icon name="copy" />
</wd-tooltip>

<!-- ❌ 不好的做法:冗长的提示 -->
<wd-tooltip content="点击此按钮可以将当前页面的链接复制到剪贴板中,以便您分享给其他人">
  <wd-icon name="copy" />
</wd-tooltip>
```

### 2. 合理选择弹出位置

```vue
<!-- ✅ 根据元素位置选择合适的弹出方向 -->
<!-- 顶部元素用 bottom -->
<view class="header">
  <wd-tooltip content="返回首页" placement="bottom">
    <wd-icon name="home" />
  </wd-tooltip>
</view>

<!-- 底部元素用 top -->
<view class="footer">
  <wd-tooltip content="联系客服" placement="top">
    <wd-icon name="service" />
  </wd-tooltip>
</view>

<!-- 边缘元素避免被裁剪 -->
<view class="left-edge">
  <wd-tooltip content="菜单" placement="right">
    <wd-icon name="menu" />
  </wd-tooltip>
</view>
```

### 3. 避免 Tooltip 嵌套

```vue
<!-- ✅ 好的做法:扁平结构 -->
<view class="toolbar">
  <wd-tooltip content="编辑">
    <wd-icon name="edit" />
  </wd-tooltip>
  <wd-tooltip content="删除">
    <wd-icon name="delete" />
  </wd-tooltip>
</view>

<!-- ❌ 不好的做法:嵌套 Tooltip -->
<wd-tooltip content="工具栏">
  <view class="toolbar">
    <wd-tooltip content="编辑">
      <wd-icon name="edit" />
    </wd-tooltip>
  </view>
</wd-tooltip>
```

### 4. 长内容使用插槽

```vue
<!-- ✅ 好的做法:复杂内容使用插槽 -->
<wd-tooltip use-content-slot show-close>
  <template #content>
    <view class="rule-content">
      <view class="rule-title">使用规则</view>
      <view class="rule-item">1. 有效期 30 天</view>
      <view class="rule-item">2. 不可叠加使用</view>
    </view>
  </template>
  <wd-button>查看规则</wd-button>
</wd-tooltip>

<!-- ❌ 不好的做法:过长的 content 字符串 -->
<wd-tooltip
  content="使用规则:1. 有效期 30 天;2. 不可叠加使用;3. 仅限本人使用..."
>
  <wd-button>查看规则</wd-button>
</wd-tooltip>
```

### 5. 正确使用受控模式

```vue
<script lang="ts" setup>
import { ref, watch } from 'vue'

const showTip = ref(false)

// ✅ 好的做法:监听变化并记录
watch(showTip, (value) => {
  console.log('Tooltip 状态:', value)
})

// ✅ 好的做法:延迟关闭
const showWithDelay = () => {
  showTip.value = true
  setTimeout(() => {
    showTip.value = false
  }, 3000)
}
</script>
```

## 常见问题

### 1. Tooltip 不显示?

**可能原因:**
- 设置了 `disabled` 属性
- `content` 为空或 undefined
- 触发元素被隐藏或宽高为 0

**解决方案:**

```vue
<!-- 检查是否禁用 -->
<wd-tooltip content="提示" :disabled="false">
  <wd-button>按钮</wd-button>
</wd-tooltip>

<!-- 确保 content 有值 -->
<wd-tooltip :content="content || '暂无提示'">
  <wd-button>按钮</wd-button>
</wd-tooltip>

<!-- 确保触发元素可见 -->
<wd-tooltip content="提示">
  <view style="width: 100rpx; height: 100rpx;">
    <wd-icon name="info" />
  </view>
</wd-tooltip>
```

### 2. 位置偏移不正确?

**可能原因:**
- 父容器设置了 `overflow: hidden`
- 父容器有 `transform` 变换
- 触发元素尺寸获取不准确

**解决方案:**

```vue
<!-- 避免父容器裁剪 -->
<view style="overflow: visible;">
  <wd-tooltip content="提示">
    <wd-button>按钮</wd-button>
  </wd-tooltip>
</view>

<!-- 使用 offset 手动调整 -->
<wd-tooltip content="提示" :offset="{ x: 10, y: 5 }">
  <wd-button>按钮</wd-button>
</wd-tooltip>

<!-- 确保触发元素有固定尺寸 -->
<wd-tooltip content="提示">
  <view class="fixed-size-wrapper">
    <wd-icon name="info" />
  </view>
</wd-tooltip>

<style lang="scss" scoped>
.fixed-size-wrapper {
  display: inline-flex;
  width: 48rpx;
  height: 48rpx;
  align-items: center;
  justify-content: center;
}
</style>
```

### 3. 如何在点击外部时关闭?

组件内置了点击外部关闭的功能,通过 `clickoutside` 模块实现:

```typescript
// 队列管理机制
import { closeOther, pushToQueue, removeFromQueue } from '../common/clickoutside'

// 组件挂载时加入队列
onBeforeMount(() => {
  pushToQueue(proxy)
})

// 组件卸载时移除队列
onBeforeUnmount(() => {
  removeFromQueue(proxy)
})

// 显示时关闭其他 Tooltip
watch(showTooltip, (newValue) => {
  if (newValue) {
    closeOther(proxy)
  }
})
```

### 4. 多个 Tooltip 同时显示?

默认情况下,组件内置队列管理,同一时间只显示一个 Tooltip。如需同时显示多个,可以使用 `useQueue` 创建独立队列:

```vue
<template>
  <wd-config-provider :use-queue="customQueue">
    <!-- 这些 Tooltip 可以独立显示 -->
    <wd-tooltip content="提示1">
      <wd-button>按钮1</wd-button>
    </wd-tooltip>
    <wd-tooltip content="提示2">
      <wd-button>按钮2</wd-button>
    </wd-tooltip>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import { useQueue } from '@/wd'

const customQueue = useQueue()
</script>
```

### 5. 小程序平台层级问题?

**原因:** 小程序原生组件(map、video、camera 等)层级高于普通元素。

**解决方案:**

```vue
<template>
  <!-- 使用 cover-view 或提高 z-index -->
  <wd-tooltip content="提示" custom-style="--wot-tooltip-z-index: 9999;">
    <wd-button>按钮</wd-button>
  </wd-tooltip>
</template>
```

### 6. TypeScript 类型支持?

```typescript
import { ref } from 'vue'
import type { TooltipInstance } from '@/wd'

// 正确的类型定义
const tooltipRef = ref<TooltipInstance>()

// 调用方法
const openTooltip = () => {
  tooltipRef.value?.open()
}

const closeTooltip = () => {
  tooltipRef.value?.close()
}
```

## 总结

Tooltip 文字提示组件核心要点:

1. **智能定位** - 基于 usePopover 实现 12 种精确定位
2. **队列管理** - 通过 clickoutside 实现互斥显示
3. **双向绑定** - 支持 v-model 和 open/close 方法
4. **主题定制** - 10 个 CSS 变量支持样式自定义
5. **平滑动画** - 200ms 淡入淡出和毛玻璃效果
