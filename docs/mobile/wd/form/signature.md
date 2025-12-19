---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/signature
---

# Signature 签名

## 介绍

Signature 签名组件是一个基于 Canvas 实现的高性能手写签名组件,专为电子签名、手写板、合同签署等业务场景设计。组件采用原生 Canvas 2D API 实现,在各端都有良好的性能表现。

**核心特性:**

- **Canvas 2D 渲染** - 基于原生 Canvas 2D API 实现,性能优异,支持微信小程序的新版 Canvas 2D 接口
- **笔锋效果** - 支持压感模式,基于书写速度动态调整线宽,模拟真实毛笔书写效果
- **贝塞尔曲线** - 压感模式下使用二次贝塞尔曲线绘制,线条更加平滑自然
- **历史记录** - 支持多步撤销/恢复操作,可配置步长,方便用户修正签名
- **高清导出** - 支持自定义导出图片格式、质量和缩放比例,生成高清签名图片
- **自适应像素比** - 自动适配设备像素比(devicePixelRatio),确保各设备清晰显示
- **自定义样式** - 支持设置画笔颜色、宽度、背景色、画布尺寸等多种样式属性
- **国际化** - 内置多语言支持,按钮文字可自动根据语言环境切换
- **插槽定制** - 提供 footer 插槽,可完全自定义底部按钮区域

## 平台兼容性

| 平台 | 支持情况 | Canvas API | 说明 |
|------|----------|-----------|------|
| 微信小程序 | ✅ | Canvas 2D | 使用新版 Canvas 2D 接口,需开启 `type="2d"` |
| 支付宝小程序 | ✅ | Canvas | 使用标准 Canvas API |
| 百度小程序 | ✅ | Canvas | 使用标准 Canvas API |
| 字节小程序 | ✅ | Canvas | 使用标准 Canvas API |
| QQ小程序 | ✅ | Canvas | 使用标准 Canvas API |
| H5 | ✅ | Canvas | 使用标准 Canvas API |
| App | ✅ | Canvas | 使用标准 Canvas API |
| 钉钉小程序 | ✅ | Canvas | 导出路径字段为 `filePath` |

## 基本用法

### 基础签名

最简单的签名组件使用方式,只需监听 `confirm` 事件获取签名结果即可。

```vue
<template>
  <view class="page">
    <view class="signature-container">
      <wd-signature @confirm="handleConfirm" />
    </view>

    <!-- 签名预览 -->
    <view v-if="signatureUrl" class="preview">
      <text class="preview-title">签名预览:</text>
      <image :src="signatureUrl" mode="aspectFit" class="preview-image" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SignatureResult } from '@/wd/components/wd-signature/wd-signature.vue'

const signatureUrl = ref('')

const handleConfirm = (result: SignatureResult) => {
  if (result.success) {
    console.log('签名图片路径:', result.tempFilePath)
    console.log('图片尺寸:', result.width, 'x', result.height)
    signatureUrl.value = result.tempFilePath
  } else {
    uni.showToast({
      title: '签名导出失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding: 32rpx;
}

.signature-container {
  margin-bottom: 32rpx;
}

.preview {
  margin-top: 32rpx;

  &-title {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
    display: block;
  }

  &-image {
    width: 100%;
    height: 200rpx;
    border: 1px solid #eee;
    border-radius: 8rpx;
  }
}
</style>
```

**使用说明:**

- 组件默认提供清空和确认按钮
- 点击确认按钮后,组件会将 Canvas 内容导出为图片并触发 `confirm` 事件
- 签名结果包含临时文件路径、图片尺寸和成功状态

### 自定义画笔

通过 `pen-color` 设置画笔颜色,`line-width` 设置画笔粗细。

```vue
<template>
  <view class="pen-demo">
    <!-- 蓝色细笔 -->
    <view class="demo-item">
      <text class="demo-label">蓝色细笔 (2px)</text>
      <wd-signature pen-color="#1989fa" :line-width="2" />
    </view>

    <!-- 红色中等笔 -->
    <view class="demo-item">
      <text class="demo-label">红色中等笔 (4px)</text>
      <wd-signature pen-color="#ee0a24" :line-width="4" />
    </view>

    <!-- 黑色粗笔 -->
    <view class="demo-item">
      <text class="demo-label">黑色粗笔 (6px)</text>
      <wd-signature pen-color="#333333" :line-width="6" />
    </view>
  </view>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.pen-demo {
  .demo-item {
    margin-bottom: 32rpx;

    .demo-label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 16rpx;
      display: block;
    }
  }
}
</style>
```

**常用颜色推荐:**

| 场景 | 颜色值 | 说明 |
|------|--------|------|
| 标准签名 | `#000000` | 黑色,正式文档常用 |
| 电子印章 | `#ee0a24` | 红色,模拟印章效果 |
| 批注签名 | `#1989fa` | 蓝色,用于批注标记 |
| 草稿签名 | `#666666` | 灰色,临时草稿 |

### 自定义背景色

通过 `background-color` 设置签名板背景色。

```vue
<template>
  <view class="bg-demo">
    <!-- 浅灰背景 -->
    <view class="demo-item">
      <text class="demo-label">浅灰背景</text>
      <wd-signature background-color="#f5f5f5" />
    </view>

    <!-- 浅黄背景(仿牛皮纸) -->
    <view class="demo-item">
      <text class="demo-label">牛皮纸效果</text>
      <wd-signature background-color="#fef9e7" pen-color="#8b4513" />
    </view>

    <!-- 深色背景(白色画笔) -->
    <view class="demo-item">
      <text class="demo-label">深色背景</text>
      <wd-signature background-color="#2c3e50" pen-color="#ffffff" />
    </view>
  </view>
</template>
```

**技术说明:**

- 背景色会在 Canvas 初始化时填充整个画布
- 导出图片时会保留背景色
- 不设置背景色时,导出的图片背景为透明(PNG 格式)

### 自定义尺寸

通过 `width` 和 `height` 设置签名板尺寸,支持数字(rpx)和字符串(带单位)。

```vue
<template>
  <view class="size-demo">
    <!-- 固定宽高 -->
    <view class="demo-item">
      <text class="demo-label">固定尺寸 (600rpx × 300rpx)</text>
      <wd-signature width="600rpx" height="300rpx" />
    </view>

    <!-- 百分比宽度 -->
    <view class="demo-item">
      <text class="demo-label">全宽签名板 (100% × 400rpx)</text>
      <wd-signature width="100%" height="400rpx" />
    </view>

    <!-- 正方形签名板 -->
    <view class="demo-item">
      <text class="demo-label">正方形签名板 (400rpx × 400rpx)</text>
      <wd-signature :width="400" :height="400" />
    </view>
  </view>
</template>
```

**尺寸建议:**

| 场景 | 推荐尺寸 | 说明 |
|------|----------|------|
| 电子签名 | 100% × 300rpx | 宽度适应容器,高度适中 |
| 合同签署 | 100% × 400rpx | 留足书写空间 |
| 手写板 | 100% × 600rpx | 大面积书写区域 |
| 印章区域 | 300rpx × 300rpx | 正方形,适合盖章 |

### 历史记录

设置 `enable-history` 开启历史记录功能,支持撤销和恢复操作。

```vue
<template>
  <view class="history-demo">
    <wd-signature
      enable-history
      :step="1"
      @confirm="handleConfirm"
    />

    <view class="tips">
      <text class="tip-item">• 点击「撤回」可撤销上一笔画</text>
      <text class="tip-item">• 点击「恢复」可恢复被撤销的笔画</text>
      <text class="tip-item">• 新的笔画会清空恢复记录</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleConfirm = (result) => {
  if (result.success) {
    console.log('签名完成')
  }
}
</script>
```

**历史记录机制:**

1. 每完成一笔画(手指抬起),当前笔画会被保存到历史记录
2. 撤销操作会将最近的笔画移动到"恢复队列"
3. 恢复操作会将"恢复队列"中的笔画重新添加到画布
4. 当用户开始新的绘制时,恢复队列会被清空
5. 可通过 `step` 属性设置每次撤销/恢复的步数(默认为 1)

### 多步撤销

通过 `step` 属性可以设置每次撤销/恢复的笔画数量。

```vue
<template>
  <view class="step-demo">
    <!-- 每次撤销2笔 -->
    <wd-signature
      enable-history
      :step="2"
      revoke-text="撤销2笔"
      restore-text="恢复2笔"
    />
  </view>
</template>
```

### 笔锋效果

设置 `pressure` 开启压感模式,模拟真实书写的笔锋效果。组件会根据书写速度动态调整线宽,快速书写时线条变细,慢速书写时线条变粗,模拟毛笔书写的效果。

```vue
<template>
  <view class="pressure-demo">
    <!-- 默认笔锋效果 -->
    <view class="demo-item">
      <text class="demo-label">默认笔锋效果</text>
      <wd-signature pressure enable-history />
    </view>

    <!-- 自定义笔锋宽度范围 -->
    <view class="demo-item">
      <text class="demo-label">大笔锋 (1-10px)</text>
      <wd-signature
        pressure
        :min-width="1"
        :max-width="10"
        enable-history
      />
    </view>

    <!-- 细腻笔锋 -->
    <view class="demo-item">
      <text class="demo-label">细腻笔锋 (1-4px)</text>
      <wd-signature
        pressure
        :min-width="1"
        :max-width="4"
        :min-speed="2"
        enable-history
      />
    </view>
  </view>
</template>
```

**笔锋算法说明:**

笔锋效果的核心是根据书写速度动态计算线宽:

1. **速度计算**: 根据相邻两点的距离和时间差计算书写速度
2. **线宽映射**: 将速度映射到 `[minWidth, maxWidth]` 范围内
3. **平滑过渡**: 限制相邻点的线宽变化率(最大 20%),避免线宽突变
4. **曲线绘制**: 使用二次贝塞尔曲线连接各点,使线条更加平滑

**参数配置建议:**

| 参数 | 默认值 | 推荐范围 | 说明 |
|------|--------|----------|------|
| `min-width` | 2 | 1-3 | 快速书写时的最小线宽 |
| `max-width` | 6 | 4-10 | 慢速书写时的最大线宽 |
| `min-speed` | 1.5 | 1-3 | 速度阈值,影响笔锋灵敏度 |

### 自定义按钮文字

通过属性自定义各按钮的文字,支持国际化场景。

```vue
<template>
  <view class="text-demo">
    <!-- 中文自定义 -->
    <view class="demo-item">
      <text class="demo-label">中文自定义</text>
      <wd-signature
        clear-text="重新签名"
        confirm-text="提交签名"
        revoke-text="撤销"
        restore-text="恢复"
        enable-history
      />
    </view>

    <!-- 英文按钮 -->
    <view class="demo-item">
      <text class="demo-label">English Buttons</text>
      <wd-signature
        clear-text="Clear"
        confirm-text="Submit"
        revoke-text="Undo"
        restore-text="Redo"
        enable-history
      />
    </view>
  </view>
</template>
```

### 自定义底部按钮

通过 `footer` 插槽完全自定义底部按钮区域,插槽提供了丰富的方法和状态。

```vue
<template>
  <view class="footer-demo">
    <wd-signature enable-history>
      <template #footer="{ clear, confirm, revoke, restore, canUndo, canRedo, historyList, currentStep }">
        <view class="custom-footer">
          <!-- 左侧:历史操作 -->
          <view class="footer-left">
            <wd-button
              size="small"
              plain
              icon="undo"
              :disabled="!canUndo"
              @click="revoke"
            >
              撤销 ({{ historyList.length }})
            </wd-button>
            <wd-button
              size="small"
              plain
              icon="redo"
              :disabled="!canRedo"
              @click="restore"
            >
              恢复
            </wd-button>
          </view>

          <!-- 右侧:主要操作 -->
          <view class="footer-right">
            <wd-button size="small" plain type="error" @click="clear">
              清空重写
            </wd-button>
            <wd-button size="small" type="primary" @click="confirm">
              确认签名
            </wd-button>
          </view>
        </view>
      </template>
    </wd-signature>
  </view>
</template>

<style lang="scss" scoped>
.custom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24rpx;

  .footer-left,
  .footer-right {
    display: flex;
    gap: 16rpx;
  }
}
</style>
```

**插槽参数说明:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `clear` | `() => void` | 清空签名方法 |
| `confirm` | `() => void` | 确认签名方法 |
| `revoke` | `() => void` | 撤销方法 |
| `restore` | `() => void` | 恢复方法 |
| `canUndo` | `boolean` | 是否可撤销(历史记录不为空) |
| `canRedo` | `boolean` | 是否可恢复(恢复队列不为空) |
| `historyList` | `Line[]` | 当前历史记录数组 |
| `currentStep` | `number` | 当前步骤索引 |

### 导出设置

通过 `file-type`、`quality`、`export-scale` 设置导出图片的格式和质量。

```vue
<template>
  <view class="export-demo">
    <!-- PNG 格式(默认,支持透明背景) -->
    <view class="demo-item">
      <text class="demo-label">PNG 格式(透明背景)</text>
      <wd-signature
        file-type="png"
        :export-scale="2"
        @confirm="handleConfirm"
      />
    </view>

    <!-- JPG 格式(较小文件体积) -->
    <view class="demo-item">
      <text class="demo-label">JPG 格式(白色背景)</text>
      <wd-signature
        file-type="jpg"
        :quality="0.8"
        background-color="#ffffff"
        @confirm="handleConfirm"
      />
    </view>

    <!-- 高清导出 -->
    <view class="demo-item">
      <text class="demo-label">高清导出 (3倍分辨率)</text>
      <wd-signature
        file-type="png"
        :export-scale="3"
        @confirm="handleHighResConfirm"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleConfirm = (result) => {
  console.log('标准导出:', result)
}

const handleHighResConfirm = (result) => {
  console.log('高清导出:', result)
  console.log('实际尺寸:', result.width, 'x', result.height)
}
</script>
```

**导出格式对比:**

| 格式 | 特点 | 适用场景 | 文件大小 |
|------|------|----------|----------|
| `png` | 支持透明背景,无损压缩 | 正式签名、需要透明背景 | 较大 |
| `jpg` | 有损压缩,不支持透明 | 临时签名、预览展示 | 较小 |

**缩放比例说明:**

- `export-scale` 设置导出图片相对于画布的缩放比例
- 设置为 2 表示导出 2 倍分辨率的图片
- 高分辨率图片适合打印或放大查看
- 建议值:普通使用 1-2,打印用途 2-3

### 禁用签名板

设置 `disabled` 禁用签名功能,用于只读展示场景。

```vue
<template>
  <view class="disabled-demo">
    <!-- 禁用状态 -->
    <view class="demo-item">
      <text class="demo-label">禁用状态(不可编辑)</text>
      <wd-signature disabled />
    </view>

    <!-- 动态控制禁用 -->
    <view class="demo-item">
      <text class="demo-label">动态控制</text>
      <wd-signature :disabled="isDisabled" />
      <wd-button @click="isDisabled = !isDisabled" style="margin-top: 16rpx;">
        {{ isDisabled ? '启用签名' : '禁用签名' }}
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDisabled = ref(true)
</script>
```

### 获取组件实例

通过 ref 获取组件实例,可以调用组件暴露的方法进行编程式控制。

```vue
<template>
  <view class="ref-demo">
    <wd-signature ref="signatureRef" enable-history @confirm="handleConfirm" />

    <view class="control-buttons">
      <wd-button size="small" @click="handleInit">重新初始化</wd-button>
      <wd-button size="small" @click="handleUndo">撤销</wd-button>
      <wd-button size="small" @click="handleRedo">恢复</wd-button>
      <wd-button size="small" @click="handleClear">清空</wd-button>
      <wd-button size="small" type="primary" @click="handleConfirmClick">确认</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SignatureInstance } from '@/wd/components/wd-signature/wd-signature.vue'

const signatureRef = ref<SignatureInstance>()

// 重新初始化画布
const handleInit = () => {
  signatureRef.value?.init(true) // true 表示强制重新初始化
}

// 撤销
const handleUndo = () => {
  signatureRef.value?.revoke()
}

// 恢复
const handleRedo = () => {
  signatureRef.value?.restore()
}

// 清空
const handleClear = () => {
  signatureRef.value?.clear()
}

// 确认
const handleConfirmClick = () => {
  signatureRef.value?.confirm()
}

// 确认回调
const handleConfirm = (result) => {
  if (result.success) {
    uni.showToast({
      title: '签名成功',
      icon: 'success'
    })
  }
}
</script>

<style lang="scss" scoped>
.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
}
</style>
```

### 监听绘制事件

组件提供了完整的绘制生命周期事件。

```vue
<template>
  <view class="events-demo">
    <wd-signature
      @start="handleStart"
      @signing="handleSigning"
      @end="handleEnd"
      @clear="handleClear"
      @confirm="handleConfirm"
    />

    <view class="event-log">
      <text class="log-title">事件日志:</text>
      <scroll-view scroll-y class="log-content">
        <text v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </text>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const logs = ref<string[]>([])

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${message}`)
  if (logs.value.length > 20) {
    logs.value.pop()
  }
}

const handleStart = (event) => {
  const { x, y } = event.touches[0]
  addLog(`开始绘制 - 位置: (${x.toFixed(0)}, ${y.toFixed(0)})`)
}

const handleSigning = (event) => {
  // 绘制过程中会频繁触发,可选择性记录
}

const handleEnd = (event) => {
  addLog('结束绘制 - 一笔完成')
}

const handleClear = () => {
  addLog('清空签名')
}

const handleConfirm = (result) => {
  if (result.success) {
    addLog(`导出成功 - 尺寸: ${result.width}x${result.height}`)
  } else {
    addLog('导出失败')
  }
}
</script>

<style lang="scss" scoped>
.event-log {
  margin-top: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 16rpx;

  .log-title {
    font-size: 28rpx;
    font-weight: 500;
    margin-bottom: 12rpx;
    display: block;
  }

  .log-content {
    height: 200rpx;
  }

  .log-item {
    font-size: 24rpx;
    color: #666;
    line-height: 1.6;
    display: block;
  }
}
</style>
```

## 高级用法

### 电子合同签名

完整的电子合同签名场景实现,包含签名验证、上传和预览功能。

```vue
<template>
  <view class="contract-demo">
    <view class="contract-header">
      <text class="title">电子合同签署</text>
      <text class="desc">请在下方区域签名确认</text>
    </view>

    <view class="signature-area">
      <wd-signature
        ref="signatureRef"
        height="400rpx"
        background-color="#fafafa"
        pressure
        :min-width="1"
        :max-width="6"
        enable-history
        @end="handleSignEnd"
        @confirm="handleConfirm"
      >
        <template #footer="{ clear, confirm, canUndo, revoke }">
          <view class="contract-footer">
            <view class="footer-left">
              <wd-button size="small" plain :disabled="!canUndo" @click="revoke">
                撤销
              </wd-button>
              <wd-button size="small" plain @click="clear">
                重签
              </wd-button>
            </view>
            <view class="footer-right">
              <wd-button
                size="small"
                type="primary"
                :disabled="!hasSignature"
                @click="confirm"
              >
                确认签名
              </wd-button>
            </view>
          </view>
        </template>
      </wd-signature>
    </view>

    <!-- 签名状态 -->
    <view class="signature-status" v-if="signatureUrl">
      <view class="status-header">
        <text class="status-title">✓ 签名完成</text>
        <wd-button size="small" @click="handleResign">重新签名</wd-button>
      </view>
      <image :src="signatureUrl" mode="aspectFit" class="signature-preview" />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-area">
      <wd-button
        type="primary"
        block
        :disabled="!signatureUrl"
        :loading="submitting"
        @click="handleSubmit"
      >
        提交合同
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SignatureInstance, SignatureResult } from '@/wd/components/wd-signature/wd-signature.vue'

const signatureRef = ref<SignatureInstance>()
const hasSignature = ref(false)
const signatureUrl = ref('')
const submitting = ref(false)

// 签名结束时更新状态
const handleSignEnd = () => {
  hasSignature.value = true
}

// 确认签名
const handleConfirm = (result: SignatureResult) => {
  if (result.success) {
    signatureUrl.value = result.tempFilePath
    uni.showToast({
      title: '签名已保存',
      icon: 'success'
    })
  }
}

// 重新签名
const handleResign = () => {
  signatureUrl.value = ''
  hasSignature.value = false
  signatureRef.value?.clear()
}

// 提交合同
const handleSubmit = async () => {
  if (!signatureUrl.value) {
    uni.showToast({
      title: '请先签名',
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    // 上传签名图片
    const uploadResult = await new Promise((resolve, reject) => {
      uni.uploadFile({
        url: '/api/upload/signature',
        filePath: signatureUrl.value,
        name: 'signature',
        success: resolve,
        fail: reject
      })
    })

    console.log('签名上传成功:', uploadResult)

    uni.showToast({
      title: '合同提交成功',
      icon: 'success'
    })

    // 跳转到成功页面
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('上传失败:', error)
    uni.showToast({
      title: '提交失败,请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.contract-demo {
  padding: 32rpx;

  .contract-header {
    margin-bottom: 32rpx;

    .title {
      font-size: 36rpx;
      font-weight: 600;
      display: block;
      margin-bottom: 8rpx;
    }

    .desc {
      font-size: 28rpx;
      color: #666;
    }
  }

  .signature-area {
    margin-bottom: 32rpx;
  }

  .contract-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24rpx;

    .footer-left {
      display: flex;
      gap: 16rpx;
    }
  }

  .signature-status {
    background: #f0f9eb;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 32rpx;

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .status-title {
        font-size: 28rpx;
        color: #67c23a;
        font-weight: 500;
      }
    }

    .signature-preview {
      width: 100%;
      height: 150rpx;
      background: #fff;
      border-radius: 8rpx;
    }
  }

  .submit-area {
    margin-top: 48rpx;
  }
}
</style>
```

### 多签名场景

支持多个签名位置的场景,如甲乙双方签字。

```vue
<template>
  <view class="multi-sign-demo">
    <view class="sign-section">
      <text class="section-title">甲方签字</text>
      <wd-signature
        ref="signARef"
        height="250rpx"
        :disabled="signAUrl !== ''"
        @confirm="handleSignAConfirm"
      />
      <view class="sign-status" v-if="signAUrl">
        <image :src="signAUrl" mode="aspectFit" class="mini-preview" />
        <wd-button size="small" @click="resetSignA">重签</wd-button>
      </view>
    </view>

    <view class="sign-section">
      <text class="section-title">乙方签字</text>
      <wd-signature
        ref="signBRef"
        height="250rpx"
        :disabled="signBUrl !== ''"
        @confirm="handleSignBConfirm"
      />
      <view class="sign-status" v-if="signBUrl">
        <image :src="signBUrl" mode="aspectFit" class="mini-preview" />
        <wd-button size="small" @click="resetSignB">重签</wd-button>
      </view>
    </view>

    <view class="action-area">
      <wd-button
        type="primary"
        block
        :disabled="!signAUrl || !signBUrl"
        @click="handleComplete"
      >
        双方签字完成
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const signARef = ref()
const signBRef = ref()
const signAUrl = ref('')
const signBUrl = ref('')

const handleSignAConfirm = (result) => {
  if (result.success) {
    signAUrl.value = result.tempFilePath
  }
}

const handleSignBConfirm = (result) => {
  if (result.success) {
    signBUrl.value = result.tempFilePath
  }
}

const resetSignA = () => {
  signAUrl.value = ''
  signARef.value?.clear()
}

const resetSignB = () => {
  signBUrl.value = ''
  signBRef.value?.clear()
}

const handleComplete = () => {
  uni.showToast({
    title: '签字完成',
    icon: 'success'
  })
}
</script>
```

### 手写批注

在图片上进行手写批注的场景。

```vue
<template>
  <view class="annotation-demo">
    <view class="toolbar">
      <view class="color-picker">
        <view
          v-for="color in colors"
          :key="color"
          :class="['color-item', { active: currentColor === color }]"
          :style="{ backgroundColor: color }"
          @click="currentColor = color"
        />
      </view>
      <view class="width-picker">
        <view
          v-for="width in widths"
          :key="width"
          :class="['width-item', { active: currentWidth === width }]"
          @click="currentWidth = width"
        >
          <view class="width-dot" :style="{ width: width * 4 + 'rpx', height: width * 4 + 'rpx' }" />
        </view>
      </view>
    </view>

    <wd-signature
      ref="signatureRef"
      height="600rpx"
      :pen-color="currentColor"
      :line-width="currentWidth"
      enable-history
      background-color="#ffffff"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const signatureRef = ref()
const currentColor = ref('#ee0a24')
const currentWidth = ref(3)

const colors = ['#000000', '#ee0a24', '#1989fa', '#07c160', '#ff976a']
const widths = [1, 2, 3, 4, 6]
</script>

<style lang="scss" scoped>
.annotation-demo {
  .toolbar {
    display: flex;
    justify-content: space-between;
    padding: 24rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    margin-bottom: 24rpx;

    .color-picker {
      display: flex;
      gap: 16rpx;

      .color-item {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        border: 4rpx solid transparent;

        &.active {
          border-color: #333;
        }
      }
    }

    .width-picker {
      display: flex;
      gap: 16rpx;
      align-items: center;

      .width-item {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8rpx;
        background: #fff;

        &.active {
          background: #e6e6e6;
        }

        .width-dot {
          background: #333;
          border-radius: 50%;
        }
      }
    }
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| pen-color | 签名笔颜色 | `string` | `#000` |
| line-width | 签名笔宽度(px) | `number` | `3` |
| background-color | 画板背景色,不设置则为透明 | `string` | - |
| width | 画布宽度,支持 rpx/px/% 等单位 | `string \| number` | - |
| height | 画布高度,支持 rpx/px/% 等单位 | `string \| number` | - |
| disabled | 是否禁用签名板 | `boolean` | `false` |
| disable-scroll | 是否禁用画布滚动(防止签名时页面滚动) | `boolean` | `true` |
| file-type | 导出图片的类型(png/jpg) | `string` | `png` |
| quality | 导出图片的质量(0-1) | `number` | `1` |
| export-scale | 导出图片的缩放比例 | `number` | `1` |
| enable-history | 是否开启历史记录(撤销/恢复) | `boolean` | `false` |
| step | 撤回和恢复的步长 | `number` | `1` |
| pressure | 是否启用压感模式(笔锋效果) | `boolean` | `false` |
| min-width | 压感模式下笔画最小宽度 | `number` | `2` |
| max-width | 压感模式下笔画最大宽度 | `number` | `6` |
| min-speed | 最小速度阈值,影响笔锋灵敏度 | `number` | `1.5` |
| clear-text | 清空按钮文本 | `string` | `清空` |
| confirm-text | 确认按钮文本 | `string` | `确认` |
| revoke-text | 撤回按钮文本 | `string` | `撤回` |
| restore-text | 恢复按钮文本 | `string` | `恢复` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| start | 开始绘制时触发(手指按下) | `event: TouchEvent` |
| signing | 绘制过程中触发(手指移动) | `event: TouchEvent` |
| end | 结束绘制时触发(手指抬起) | `event: TouchEvent` |
| confirm | 确认签名时触发(导出完成) | `result: SignatureResult` |
| clear | 清空签名时触发 | - |

### Slots

| 名称 | 说明 | 参数 |
|------|------|------|
| footer | 自定义底部按钮区域 | `{ clear, confirm, revoke, restore, canUndo, canRedo, historyList, currentStep }` |

**footer 插槽参数详解:**

| 参数 | 类型 | 说明 |
|------|------|------|
| clear | `() => void` | 清空签名方法 |
| confirm | `() => void` | 确认签名并导出图片方法 |
| revoke | `() => void` | 撤销上一笔画方法 |
| restore | `() => void` | 恢复被撤销的笔画方法 |
| canUndo | `boolean` | 是否可以撤销(历史记录是否为空) |
| canRedo | `boolean` | 是否可以恢复(恢复队列是否为空) |
| historyList | `Line[]` | 当前所有笔画的历史记录数组 |
| currentStep | `number` | 当前步骤索引 |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| init | 初始化签名板 | `forceUpdate?: boolean` | `void` |
| clear | 清空签名并重置历史记录 | - | `void` |
| confirm | 确认签名并导出图片 | - | `void` |
| revoke | 撤回上一步(受 step 属性影响) | - | `void` |
| restore | 恢复上一步(受 step 属性影响) | - | `void` |

**方法使用示例:**

```typescript
import { ref } from 'vue'
import type { SignatureInstance } from '@/wd/components/wd-signature/wd-signature.vue'

const signatureRef = ref<SignatureInstance>()

// 强制重新初始化画布
signatureRef.value?.init(true)

// 清空签名
signatureRef.value?.clear()

// 编程式确认签名
signatureRef.value?.confirm()

// 撤销
signatureRef.value?.revoke()

// 恢复
signatureRef.value?.restore()
```

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
  /** 生成图片的宽度(px) */
  width: number
  /** 生成图片的高度(px) */
  height: number
}

/**
 * 签名点位类型
 * 用于记录每个触摸点的信息
 */
interface Point {
  /** 点的横坐标 */
  x: number
  /** 点的纵坐标 */
  y: number
  /** 点的时间戳(毫秒) */
  t: number
  /** 当前点的绘制速度 */
  speed?: number
  /** 与上一个点的距离 */
  distance?: number
  /** 当前点的线宽(用于笔锋模式) */
  lineWidth?: number
  /** 贝塞尔曲线第一个控制点的x坐标 */
  lastX1?: number
  /** 贝塞尔曲线第一个控制点的y坐标 */
  lastY1?: number
  /** 贝塞尔曲线第二个控制点的x坐标 */
  lastX2?: number
  /** 贝塞尔曲线第二个控制点的y坐标 */
  lastY2?: number
  /** 是否为线条的第一个点 */
  isFirstPoint?: boolean
}

/**
 * 签名线条类型
 * 代表一次完整的笔画(从按下到抬起)
 */
interface Line {
  /** 线条所包含的所有点的数组 */
  points: Point[]
  /** 线条颜色 */
  color: string
  /** 线条宽度 */
  width: number
  /** 线条背景色 */
  backgroundColor?: string
  /** 是否为笔锋模式的线条 */
  isPressure?: boolean
}

/**
 * 签名组件属性接口
 */
interface WdSignatureProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 签名笔颜色 */
  penColor?: string
  /** 签名笔宽度 */
  lineWidth?: number
  /** 清空按钮的文本 */
  clearText?: string
  /** 撤回按钮的文本 */
  revokeText?: string
  /** 恢复按钮的文本 */
  restoreText?: string
  /** 确认按钮的文本 */
  confirmText?: string
  /** 目标文件的类型 */
  fileType?: string
  /** 目标文件的质量 */
  quality?: number
  /** 导出图片的缩放比例 */
  exportScale?: number
  /** 是否禁用签名板 */
  disabled?: boolean
  /** 画布的高度 */
  height?: string | number
  /** 画布的宽度 */
  width?: string | number
  /** 画板的背景色 */
  backgroundColor?: string
  /** 是否禁用画布滚动 */
  disableScroll?: boolean
  /** 是否开启历史记录 */
  enableHistory?: boolean
  /** 撤回和恢复的步长 */
  step?: number
  /** 是否启用压感模式(笔锋) */
  pressure?: boolean
  /** 压感模式下笔画最小宽度 */
  minWidth?: number
  /** 压感模式下笔画最大宽度 */
  maxWidth?: number
  /** 最小速度阈值 */
  minSpeed?: number
}

/**
 * 签名组件事件接口
 */
interface WdSignatureEmits {
  /** 开始绘制时触发 */
  start: [event: TouchEvent]
  /** 结束绘制时触发 */
  end: [event: TouchEvent]
  /** 绘制过程中触发 */
  signing: [event: TouchEvent]
  /** 确认签名时触发 */
  confirm: [result: SignatureResult]
  /** 清空签名时触发 */
  clear: []
}

/**
 * 签名组件暴露方法接口
 */
interface WdSignatureExpose {
  /** 初始化签名板 */
  init: (forceUpdate?: boolean) => void
  /** 点击清除按钮清除签名 */
  clear: () => void
  /** 点击确定按钮 */
  confirm: () => void
  /** 点击恢复 */
  restore: () => void
  /** 点击撤回 */
  revoke: () => void
}

/** 签名组件实例类型 */
type SignatureInstance = ComponentPublicInstance<WdSignatureProps, WdSignatureExpose>
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

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-signature />
  </view>
</template>

<style lang="scss" scoped>
.custom-theme {
  // 圆角签名板
  --wd-signature-radius: 16rpx;

  // 实线边框
  --wd-signature-border: 2px solid #1989fa;

  // 调整按钮间距
  --wd-signature-footer-margin-top: 24rpx;
  --wd-signature-button-margin-left: 24rpx;
}
</style>
```

### 暗黑模式适配

```vue
<template>
  <view :class="['signature-wrapper', { dark: isDark }]">
    <wd-signature
      :pen-color="isDark ? '#ffffff' : '#000000'"
      :background-color="isDark ? '#1a1a1a' : '#ffffff'"
    />
  </view>
</template>

<style lang="scss" scoped>
.signature-wrapper {
  &.dark {
    --wd-signature-bg: #1a1a1a;
    --wd-signature-border: 1px dashed #333;
  }
}
</style>
```

## 最佳实践

### 1. 签名验证

确保用户已经签名后再允许提交:

```vue
<template>
  <view class="sign-validate">
    <wd-signature ref="signatureRef" @end="hasSignature = true" />
    <wd-button :disabled="!hasSignature" @click="submit">提交</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const signatureRef = ref()
const hasSignature = ref(false)

const submit = () => {
  signatureRef.value?.confirm()
}
</script>
```

### 2. 图片压缩

对于大尺寸签名,建议进行压缩以减少上传时间:

```vue
<template>
  <wd-signature
    file-type="jpg"
    :quality="0.7"
    :export-scale="1"
    background-color="#ffffff"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts" setup>
const handleConfirm = async (result) => {
  if (result.success) {
    // 对于非常大的图片,可以进一步压缩
    const compressedPath = await compressImage(result.tempFilePath)
    // 上传压缩后的图片
  }
}

const compressImage = (filePath: string): Promise<string> => {
  return new Promise((resolve) => {
    uni.compressImage({
      src: filePath,
      quality: 60,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(filePath) // 压缩失败则使用原图
    })
  })
}
</script>
```

### 3. 签名回显

在编辑场景中回显已有签名:

```vue
<template>
  <view class="edit-sign">
    <!-- 已有签名展示 -->
    <view v-if="existingSignature && !editing" class="existing">
      <image :src="existingSignature" mode="aspectFit" class="sign-image" />
      <wd-button size="small" @click="editing = true">重新签名</wd-button>
    </view>

    <!-- 签名编辑 -->
    <wd-signature v-else @confirm="handleConfirm" />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const existingSignature = ref('')
const editing = ref(false)

onMounted(async () => {
  // 加载已有签名
  existingSignature.value = await fetchExistingSignature()
})

const handleConfirm = (result) => {
  if (result.success) {
    existingSignature.value = result.tempFilePath
    editing.value = false
  }
}

const fetchExistingSignature = async () => {
  // 从服务器获取已有签名
  return '/api/signature/user123.png'
}
</script>
```

### 4. 签名区域适配

针对不同设备屏幕尺寸进行自适应:

```vue
<template>
  <wd-signature
    width="100%"
    :height="signatureHeight"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const signatureHeight = ref('400rpx')

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  const screenHeight = systemInfo.screenHeight

  // 根据屏幕高度动态调整签名区域
  if (screenHeight < 600) {
    signatureHeight.value = '300rpx' // 小屏设备
  } else if (screenHeight > 800) {
    signatureHeight.value = '500rpx' // 大屏设备
  }
})
</script>
```

### 5. 防抖处理

对于频繁触发的事件进行防抖处理:

```vue
<template>
  <wd-signature @signing="handleSigning" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

let lastTime = 0
const throttleInterval = 50 // 50ms 节流

const handleSigning = (event) => {
  const now = Date.now()
  if (now - lastTime < throttleInterval) return
  lastTime = now

  // 处理签名数据,如实时同步
  console.log('签名中...', event.touches[0])
}
</script>
```

## 常见问题

### 1. 签名图片导出失败?

**问题原因:**
- 画布未初始化完成就调用导出
- 画布尺寸为 0
- 内存不足(画布过大)

**解决方案:**

```vue
<template>
  <wd-signature ref="signatureRef" @confirm="handleConfirm" />
  <wd-button @click="safeConfirm">安全导出</wd-button>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'

const signatureRef = ref()

const safeConfirm = async () => {
  // 确保画布已初始化
  await nextTick()

  // 延迟执行,确保渲染完成
  setTimeout(() => {
    signatureRef.value?.confirm()
  }, 100)
}

const handleConfirm = (result) => {
  if (!result.success) {
    // 导出失败,尝试重新初始化后再导出
    signatureRef.value?.init(true)
    setTimeout(() => {
      signatureRef.value?.confirm()
    }, 200)
  }
}
</script>
```

### 2. 如何提高导出图片的清晰度?

**解决方案:**

设置 `export-scale` 属性增加导出分辨率:

```vue
<template>
  <!-- 2倍分辨率,适合一般显示 -->
  <wd-signature :export-scale="2" />

  <!-- 3倍分辨率,适合打印 -->
  <wd-signature :export-scale="3" />
</template>
```

**注意:** 过高的缩放比例会增加内存占用和处理时间,建议不超过 3。

### 3. 微信小程序中签名不清晰?

**问题原因:**
- 设备像素比未正确处理

**解决方案:**

组件已自动处理设备像素比,如果仍有问题:

```vue
<template>
  <!-- 增加线宽 -->
  <wd-signature :line-width="4" />

  <!-- 或使用笔锋模式 -->
  <wd-signature pressure :min-width="2" :max-width="8" />
</template>
```

### 4. 如何实现签名预览?

**解决方案:**

通过 `confirm` 事件获取图片路径后展示:

```vue
<template>
  <wd-signature @confirm="handleConfirm" />

  <!-- 预览区域 -->
  <view v-if="signatureUrl" class="preview">
    <image :src="signatureUrl" mode="aspectFit" />
    <wd-button size="small" @click="previewImage">查看大图</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const signatureUrl = ref('')

const handleConfirm = (result) => {
  if (result.success) {
    signatureUrl.value = result.tempFilePath
  }
}

const previewImage = () => {
  uni.previewImage({
    urls: [signatureUrl.value],
    current: signatureUrl.value
  })
}
</script>
```

### 5. 签名时页面跟着滚动?

**问题原因:**
- `disable-scroll` 未生效
- 外层容器存在滚动

**解决方案:**

```vue
<template>
  <!-- 确保 disable-scroll 为 true(默认) -->
  <wd-signature :disable-scroll="true" />
</template>

<style lang="scss" scoped>
// 签名时禁止页面滚动
page {
  overflow: hidden;
}
</style>
```

### 6. 如何保存签名到本地相册?

**解决方案:**

```vue
<template>
  <wd-signature @confirm="handleConfirm" />
</template>

<script lang="ts" setup>
const handleConfirm = async (result) => {
  if (result.success) {
    try {
      await uni.saveImageToPhotosAlbum({
        filePath: result.tempFilePath
      })
      uni.showToast({
        title: '已保存到相册',
        icon: 'success'
      })
    } catch (error) {
      // 用户拒绝授权
      uni.showModal({
        title: '提示',
        content: '需要您授权保存图片到相册',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting()
          }
        }
      })
    }
  }
}
</script>
```

### 7. 笔锋效果不明显?

**问题原因:**
- `min-width` 和 `max-width` 差值太小
- `min-speed` 设置不合适

**解决方案:**

```vue
<template>
  <!-- 增加宽度差值,降低速度阈值 -->
  <wd-signature
    pressure
    :min-width="1"
    :max-width="10"
    :min-speed="1"
  />
</template>
```

### 8. 钉钉小程序导出路径问题?

**问题原因:**
- 钉钉小程序返回的字段名与其他平台不同

**解决方案:**

组件已内部处理,钉钉小程序返回的 `filePath` 会被正确映射到 `tempFilePath`。直接使用即可:

```vue
<script lang="ts" setup>
const handleConfirm = (result) => {
  // 无需特殊处理,tempFilePath 在各平台统一
  console.log('签名路径:', result.tempFilePath)
}
</script>
```
