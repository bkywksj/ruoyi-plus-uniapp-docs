---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/countTo
---

# CountTo 数字滚动

## 介绍

CountTo 数字滚动组件用于创建数字递增/递减动画效果,常用于数据统计、金额展示等场景。支持千分位分隔、小数位控制、缓动动画等功能。

**核心特性:**

- **数字动画** - 支持数字的递增和递减动画
- **缓动效果** - 内置缓动函数,动画更自然
- **格式化** - 支持千分位分隔符和小数点配置
- **前后缀** - 支持添加前缀后缀(如货币符号)
- **手动控制** - 提供开始、暂停、重置方法

## 基本用法

### 基础用法

设置 `end-val` 指定目标数字。

```vue
<template>
  <wd-count-to :end-val="2024" />
</template>
```

### 自定义起始值

通过 `start-val` 设置起始数字。

```vue
<template>
  <wd-count-to :start-val="100" :end-val="2024" />
</template>
```

### 动画时长

通过 `duration` 设置动画时长(毫秒)。

```vue
<template>
  <wd-count-to :end-val="9999" :duration="5000" />
</template>
```

### 小数位数

通过 `decimals` 设置保留的小数位数。

```vue
<template>
  <wd-count-to :end-val="99.99" :decimals="2" />
</template>
```

### 千分位分隔符

通过 `separator` 设置千分位分隔符。

```vue
<template>
  <wd-count-to :end-val="1234567" separator="," />
</template>
```

### 前缀和后缀

通过 `prefix` 和 `suffix` 添加前后缀。

```vue
<template>
  <!-- 金额展示 -->
  <wd-count-to :end-val="999.99" :decimals="2" prefix="¥" />

  <!-- 百分比展示 -->
  <wd-count-to :end-val="85" suffix="%" />
</template>
```

### 主题类型

通过 `type` 设置文字主题类型。

```vue
<template>
  <wd-count-to :end-val="100" type="primary" />
  <wd-count-to :end-val="100" type="success" />
  <wd-count-to :end-val="100" type="warning" />
  <wd-count-to :end-val="100" type="error" />
</template>
```

### 自定义颜色和大小

通过 `color` 和 `font-size` 自定义样式。

```vue
<template>
  <wd-count-to :end-val="8888" color="#ee0a24" :font-size="48" />
</template>
```

### 禁用缓动

设置 `use-easing` 为 `false` 禁用缓动效果。

```vue
<template>
  <wd-count-to :end-val="1000" :use-easing="false" />
</template>
```

### 手动控制

通过 ref 获取组件实例,调用 start、pause、reset 方法。

```vue
<template>
  <wd-count-to
    ref="countToRef"
    :end-val="9999"
    :auto-start="false"
    @finish="handleFinish"
  />
  <view class="controls">
    <wd-button @click="start">开始</wd-button>
    <wd-button @click="pause">暂停</wd-button>
    <wd-button @click="reset">重置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const countToRef = ref()

const start = () => countToRef.value?.start()
const pause = () => countToRef.value?.pause()
const reset = () => countToRef.value?.reset()

const handleFinish = () => {
  console.log('动画完成')
}
</script>
```

### 自定义插槽

通过插槽自定义显示内容。

```vue
<template>
  <wd-count-to :end-val="8888">
    <template #prefix>
      <wd-icon name="money" />
    </template>
  </wd-count-to>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| start-val | 起始值 | `number` | `0` |
| end-val | 目标值 | `number` | `2024` |
| duration | 动画时长(毫秒) | `number` | `3000` |
| auto-start | 是否自动开始 | `boolean` | `true` |
| decimals | 小数位数 | `number` | `0` |
| decimal | 小数点符号 | `string` | `.` |
| separator | 千分位分隔符 | `string` | `,` |
| prefix | 前缀 | `string` | - |
| suffix | 后缀 | `string` | - |
| use-easing | 是否使用缓动效果 | `boolean` | `true` |
| font-size | 字体大小 | `number` | `32` |
| color | 文字颜色 | `string` | - |
| type | 主题类型 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error'` | `default` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| mounted | 组件挂载完成时触发 | - |
| finish | 动画完成时触发 | - |

### Slots

| 名称 | 说明 |
|------|------|
| default | 自定义数字内容 |
| prefix | 自定义前缀 |
| suffix | 自定义后缀 |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| start | 开始动画 | - | - |
| pause | 暂停动画 | - | - |
| reset | 重置动画 | - | - |

## 主题定制

组件使用 wd-text 组件渲染文字,可通过 wd-text 的主题变量进行定制。

## 最佳实践

### 1. 数据统计卡片

```vue
<template>
  <view class="stat-card">
    <view class="stat-item">
      <wd-count-to
        :end-val="userCount"
        separator=","
        :font-size="48"
        type="primary"
      />
      <text class="stat-label">用户数</text>
    </view>
    <view class="stat-item">
      <wd-count-to
        :end-val="orderCount"
        separator=","
        :font-size="48"
        type="success"
      />
      <text class="stat-label">订单数</text>
    </view>
    <view class="stat-item">
      <wd-count-to
        :end-val="totalAmount"
        :decimals="2"
        prefix="¥"
        separator=","
        :font-size="48"
        type="warning"
      />
      <text class="stat-label">总金额</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const userCount = ref(12580)
const orderCount = ref(8888)
const totalAmount = ref(999999.99)
</script>
```

### 2. 金额展示

```vue
<template>
  <view class="amount-display">
    <text class="label">账户余额</text>
    <wd-count-to
      :end-val="balance"
      :decimals="2"
      prefix="¥"
      separator=","
      :font-size="64"
      color="#ee0a24"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const balance = ref(88888.88)
</script>
```

### 3. 进度展示

```vue
<template>
  <view class="progress-display">
    <wd-count-to
      :end-val="progress"
      suffix="%"
      :font-size="48"
      type="primary"
    />
    <wd-progress :percentage="progress" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(75)
</script>
```

## 常见问题

### 1. 数字不滚动?

检查 `auto-start` 是否为 `true`,以及 `start-val` 和 `end-val` 是否不同。

### 2. 小数位显示不正确?

确保 `decimals` 属性值大于等于 0,且 `end-val` 包含足够的小数位。

### 3. 如何实现从大到小递减?

设置 `start-val` 大于 `end-val` 即可:

```vue
<wd-count-to :start-val="1000" :end-val="0" />
```

### 4. 动画太快/太慢?

调整 `duration` 属性值(毫秒),值越大动画越慢。
