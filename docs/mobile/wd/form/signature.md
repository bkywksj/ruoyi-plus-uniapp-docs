---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/signature
---

# Signature 签名

## 介绍

Signature 签名组件用于签名场景,基于 Canvas 实现。组件提供了基础签名、历史记录、撤销/恢复、笔锋效果等功能,适用于电子签名、手写板等业务场景。

**核心特性:**

- **Canvas 绑定** - 基于原生 Canvas 实现,性能优异
- **笔锋效果** - 支持压感模式,模拟真实书写效果
- **历史记录** - 支持撤销/恢复操作
- **自定义样式** - 支持设置画笔颜色、宽度、背景色等
- **图片导出** - 支持导出为图片文件

## 基本用法

### 基础签名

```vue
<template>
  <wd-signature @confirm="handleConfirm" />
</template>

<script lang="ts" setup>
import type { SignatureResult } from '@/wd/components/wd-signature/wd-signature.vue'

const handleConfirm = (result: SignatureResult) => {
  if (result.success) {
    console.log('签名图片路径:', result.tempFilePath)
  }
}
</script>
```

### 自定义画笔

通过 `pen-color` 和 `line-width` 设置画笔颜色和宽度。

```vue
<template>
  <wd-signature pen-color="#1989fa" :line-width="4" />
</template>
```

### 自定义背景色

通过 `background-color` 设置签名板背景色。

```vue
<template>
  <wd-signature background-color="#f5f5f5" />
</template>
```

### 自定义尺寸

通过 `width` 和 `height` 设置签名板尺寸。

```vue
<template>
  <wd-signature width="100%" height="300rpx" />
</template>
```

### 历史记录

设置 `enable-history` 开启历史记录功能,支持撤销和恢复。

```vue
<template>
  <wd-signature enable-history />
</template>
```

### 笔锋效果

设置 `pressure` 开启压感模式,模拟真实书写的笔锋效果。

```vue
<template>
  <wd-signature pressure :min-width="2" :max-width="6" />
</template>
```

### 自定义按钮文字

通过属性自定义各按钮的文字。

```vue
<template>
  <wd-signature
    clear-text="重写"
    confirm-text="完成"
    revoke-text="撤回"
    restore-text="恢复"
    enable-history
  />
</template>
```

### 自定义底部按钮

通过 `footer` 插槽自定义底部按钮区域。

```vue
<template>
  <wd-signature>
    <template #footer="{ clear, confirm, revoke, restore, canUndo, canRedo }">
      <view class="custom-footer">
        <wd-button size="small" plain @click="revoke" :disabled="!canUndo">
          撤销
        </wd-button>
        <wd-button size="small" plain @click="restore" :disabled="!canRedo">
          恢复
        </wd-button>
        <wd-button size="small" plain @click="clear">清空</wd-button>
        <wd-button size="small" type="primary" @click="confirm">
          确认
        </wd-button>
      </view>
    </template>
  </wd-signature>
</template>
```

### 导出设置

通过 `file-type`、`quality`、`export-scale` 设置导出图片的格式和质量。

```vue
<template>
  <wd-signature
    file-type="jpg"
    :quality="0.8"
    :export-scale="2"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts" setup>
const handleConfirm = (result) => {
  // 导出的图片分辨率为画布的2倍
  console.log('图片尺寸:', result.width, result.height)
}
</script>
```

### 禁用签名板

设置 `disabled` 禁用签名功能。

```vue
<template>
  <wd-signature disabled />
</template>
```

### 获取组件实例

通过 ref 获取组件实例,调用组件方法。

```vue
<template>
  <wd-signature ref="signatureRef" />
  <wd-button @click="handleClear">清空</wd-button>
  <wd-button @click="handleConfirm">确认</wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const signatureRef = ref()

const handleClear = () => {
  signatureRef.value?.clear()
}

const handleConfirm = () => {
  signatureRef.value?.confirm()
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| pen-color | 签名笔颜色 | `string` | `#000` |
| line-width | 签名笔宽度 | `number` | `3` |
| background-color | 画板背景色 | `string` | - |
| width | 画布宽度 | `string \| number` | - |
| height | 画布高度 | `string \| number` | - |
| disabled | 是否禁用签名板 | `boolean` | `false` |
| disable-scroll | 是否禁用画布滚动 | `boolean` | `true` |
| file-type | 导出图片的类型 | `string` | `png` |
| quality | 导出图片的质量 | `number` | `1` |
| export-scale | 导出图片的缩放比例 | `number` | `1` |
| enable-history | 是否开启历史记录 | `boolean` | `false` |
| step | 撤回和恢复的步长 | `number` | `1` |
| pressure | 是否启用压感模式(笔锋) | `boolean` | `false` |
| min-width | 压感模式下笔画最小宽度 | `number` | `2` |
| max-width | 压感模式下笔画最大宽度 | `number` | `6` |
| min-speed | 最小速度阈值 | `number` | `1.5` |
| clear-text | 清空按钮文本 | `string` | `清空` |
| confirm-text | 确认按钮文本 | `string` | `确认` |
| revoke-text | 撤回按钮文本 | `string` | `撤回` |
| restore-text | 恢复按钮文本 | `string` | `恢复` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| start | 开始绘制时触发 | `event: TouchEvent` |
| end | 结束绘制时触发 | `event: TouchEvent` |
| signing | 绘制过程中触发 | `event: TouchEvent` |
| confirm | 确认签名时触发 | `result: SignatureResult` |
| clear | 清空签名时触发 | - |

### Slots

| 名称 | 说明 | 参数 |
|------|------|------|
| footer | 自定义底部按钮区域 | `{ clear, confirm, revoke, restore, canUndo, canRedo, historyList, currentStep }` |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| init | 初始化签名板 | `forceUpdate?: boolean` | - |
| clear | 清空签名 | - | - |
| confirm | 确认签名并导出图片 | - | - |
| revoke | 撤回上一步 | - | - |
| restore | 恢复上一步 | - | - |

### 类型定义

```typescript
/**
 * 签名结果类型
 */
interface SignatureResult {
  /** 生成图片的临时路径 */
  tempFilePath: string
  /** 是否成功生成图片 */
  success: boolean
  /** 生成图片的宽度 */
  width: number
  /** 生成图片的高度 */
  height: number
}
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-signature-bg | 签名板背景色 | `#ffffff` |
| --wd-signature-radius | 签名板圆角 | `8rpx` |
| --wd-signature-border | 签名板边框 | `1px dashed #eee` |
| --wd-signature-footer-margin-top | 底部按钮区域上边距 | `16rpx` |
| --wd-signature-button-margin-left | 按钮左边距 | `16rpx` |

## 最佳实践

### 1. 电子签名场景

```vue
<template>
  <view class="signature-container">
    <view class="signature-tip">请在下方区域签名</view>
    <wd-signature
      ref="signatureRef"
      height="400rpx"
      background-color="#fafafa"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const signatureRef = ref()

const handleConfirm = (result) => {
  if (result.success) {
    // 上传签名图片
    uni.uploadFile({
      url: '/api/upload',
      filePath: result.tempFilePath,
      name: 'signature',
      success: (res) => {
        console.log('签名上传成功')
      }
    })
  }
}
</script>
```

### 2. 带笔锋的手写板

```vue
<template>
  <wd-signature
    pressure
    :min-width="1"
    :max-width="8"
    pen-color="#333"
    enable-history
  />
</template>
```

## 常见问题

### 1. 签名图片导出失败?

确保在调用 `confirm` 方法之前已经有签名内容。可以通过监听 `end` 事件来判断是否有签名。

### 2. 如何提高导出图片的清晰度?

设置 `export-scale` 属性,例如设置为 2 可以导出2倍分辨率的图片:

```vue
<wd-signature :export-scale="2" />
```

### 3. 微信小程序中签名不清晰?

组件已自动处理设备像素比,如果仍有问题,可以尝试增大 `line-width` 属性值。

### 4. 如何实现签名预览?

通过 `confirm` 事件获取图片路径后,使用 `wd-img` 组件展示:

```vue
<template>
  <wd-signature @confirm="handleConfirm" />
  <wd-img v-if="signatureUrl" :src="signatureUrl" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const signatureUrl = ref('')

const handleConfirm = (result) => {
  if (result.success) {
    signatureUrl.value = result.tempFilePath
  }
}
</script>
```
