# useImageCompress 图片压缩

## 介绍

`useImageCompress` 是一个跨端统一封装的图片压缩 Composable，用于在图片上传前对图片进行体积压缩与尺寸缩放，从而降低上传流量、加快上传速度、减轻 OSS 存储压力。该组合式函数屏蔽了各端图片压缩 API 的差异，让开发者用同一套代码即可覆盖微信/抖音小程序、支付宝小程序、APP 与 H5。

不同平台对图片压缩的支持差异很大：微信小程序、抖音小程序、APP 端的 `uni.compressImage` 同时支持压缩质量与尺寸缩放；支付宝小程序的 `uni.compressImage` 只支持质量参数；H5 端则完全不支持 `uni.compressImage`，需要借助 Canvas 重绘实现；还有部分小程序平台对压缩支持不一致。`useImageCompress` 针对这些差异做了平台分支处理，并在不支持压缩的平台上自动降级为「原图直传」，保证业务流程不中断。

**核心特性:**

- **跨端统一封装** - 一套 API 覆盖微信/抖音小程序、支付宝小程序、APP、H5，自动按平台选择压缩实现
- **业务预设** - 内置 `avatar`、`thumbnail`、`content`、`receipt`、`hd` 五个常用业务预设，开箱即用
- **质量 + 尺寸双控** - 支持压缩质量（0-100）与最大宽高（按比例缩放）双重控制
- **小文件跳过** - 通过 `skipBelowKB` 阈值跳过过小图片的压缩，避免无意义的重复处理
- **失败安全降级** - 压缩失败或平台不支持时，自动回退为原图，`path` 字段始终可用
- **wd-upload 无缝接入** - 提供 `createBeforeCompressUpload` 生成 `:before-upload` 钩子，上传前自动压缩
- **H5 Canvas 实现** - H5 端使用 Canvas 重绘 + `toBlob` 实现压缩，支持 JPEG/PNG/WebP 输出
- **TypeScript 支持** - 完整的类型定义，提供智能提示与类型检查

## 平台兼容性

| 平台 | 支持情况 | 压缩实现 | 备注 |
|------|----------|----------|------|
| 微信小程序 (MP-WEIXIN) | ✅ 完全支持 | `uni.compressImage` | 支持 `quality` + `compressedWidth/compressHeight` |
| 抖音小程序 (MP-TOUTIAO) | ✅ 完全支持 | `uni.compressImage` | 支持 `quality` + 尺寸缩放 |
| APP (APP-PLUS) | ✅ 完全支持 | `uni.compressImage` | 支持 `quality` + 尺寸缩放 |
| 支付宝小程序 (MP-ALIPAY) | ⚠️ 部分支持 | `uni.compressImage` | 仅支持 `quality`，不支持尺寸缩放 |
| H5 | ✅ 完全支持 | Canvas 重绘 | 通过 `canvas.toBlob` 输出，支持 JPEG/PNG/WebP |
| 百度小程序 (MP-BAIDU) | ❌ 跳过压缩 | 原图直传 | 平台支持不一致，保守跳过 |
| QQ小程序 (MP-QQ) | ❌ 跳过压缩 | 原图直传 | 平台支持不一致，保守跳过 |
| 飞书小程序 (MP-LARK) | ❌ 跳过压缩 | 原图直传 | 平台支持不一致，保守跳过 |
| 快手小程序 (MP-KUAISHOU) | ❌ 跳过压缩 | 原图直传 | 平台支持不一致，保守跳过 |

::: tip 降级说明
在不支持压缩的平台上，`compressImage` 会返回 `compressed: false` 且 `path` 为原始路径，业务无需为此分支写额外代码，上传流程照常进行。
:::

## 业务预设

为减少重复配置，模块内置了 5 个常用业务预设 `COMPRESS_PRESETS`，覆盖头像、缩略图、内容图、票据、高清图等典型场景：

| 预设名 | 质量 | 最大宽高 | 跳过阈值 | 适用场景 |
|--------|------|---------|---------|---------|
| `avatar` | 70 | 200×200 | 30KB | 头像，强压缩、小尺寸 |
| `thumbnail` | 75 | 400×400 | 50KB | 列表缩略图 |
| `content` | 80 | 1280×1280 | 200KB | 文章/内容配图（默认预设） |
| `receipt` | 85 | 1920×1920 | 300KB | 票据/凭证，需保留可识别性 |
| `hd` | 90 | 2560×2560 | 500KB | 高清图，弱压缩、大尺寸 |

```typescript
import { COMPRESS_PRESETS } from '@/composables/useImageCompress'

// 头像预设
console.log(COMPRESS_PRESETS.avatar)
// { quality: 70, maxWidth: 200, maxHeight: 200, skipBelowKB: 30 }
```

**使用说明:**

- 预设值是经过场景调优的推荐参数，可直接使用，也可在此基础上覆盖个别字段
- `content` 是默认预设，调用 `useImageCompress()` 或 `createBeforeCompressUpload()` 不传参时即使用该预设
- 票据类（`receipt`）质量与尺寸都较高，因为发票/凭证需要保证文字可识别

## 基本用法

### 压缩单张图片

`compressImage` 是最基础的压缩入口，传入图片路径与选项，返回压缩结果。无论压缩成功与否，返回值的 `path` 字段始终可用：

```vue
<template>
  <view class="demo">
    <wd-button @click="handleChoose">选择并压缩图片</wd-button>
    <image v-if="imageSrc" :src="imageSrc" mode="widthFix" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { compressImage } from '@/composables/useImageCompress'

const imageSrc = ref('')

const handleChoose = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const src = res.tempFilePaths[0]
      // 压缩为内容图规格：1280x1280，80% 质量
      const result = await compressImage(src, {
        quality: 80,
        maxWidth: 1280,
        maxHeight: 1280,
      })
      console.log('是否压缩:', result.compressed)
      console.log('压缩后大小(字节):', result.size)
      imageSrc.value = result.path
    },
  })
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**使用说明:**

- `compressImage(src, options?)` 返回 `Promise<CompressResult>`
- `result.path` - 压缩后路径（小程序/APP）或 ObjectURL（H5），失败时为原 `src`
- `result.size` - 压缩后大小（字节），部分平台或失败时为 `undefined`
- `result.compressed` - 是否真正执行了压缩，`false` 表示跳过或平台不支持

### 使用业务预设

直接传入预设名即可应用对应规格，无需手写参数：

```vue
<script lang="ts" setup>
import { compressImage, COMPRESS_PRESETS } from '@/composables/useImageCompress'

const handleAvatar = async (src: string) => {
  // 使用头像预设
  const result = await compressImage(src, COMPRESS_PRESETS.avatar)
  return result.path
}
</script>
```

### Composable 形式

`useImageCompress` 提供组合式用法，在 `setup` 中按预设或自定义选项创建压缩器，返回 `compress`、`beforeUpload` 与 `presets`：

```vue
<template>
  <view class="demo">
    <wd-upload :before-upload="beforeUpload" :action="uploadUrl" />
  </view>
</template>

<script lang="ts" setup>
import { useImageCompress } from '@/composables/useImageCompress'

const uploadUrl = '/api/oss/upload'

// 按 content 预设创建压缩器
const { compress, beforeUpload } = useImageCompress('content')

// 也可手动压缩单张
const compressOne = async (src: string) => {
  const result = await compress(src)
  return result.path
}

// 临时覆盖个别选项
const compressHd = async (src: string) => {
  const result = await compress(src, { quality: 95 })
  return result.path
}
</script>
```

**使用说明:**

- `useImageCompress(presetOrOpts?)` - 入参可为预设名（如 `'content'`）或自定义 `CompressOptions`，缺省为 `'content'`
- 返回 `compress(src, override?)` - 压缩单张，可临时覆盖选项
- 返回 `beforeUpload` - 已绑定预设的 `wd-upload :before-upload` 钩子
- 返回 `presets` - 即 `COMPRESS_PRESETS`，方便就近取用

### wd-upload 上传前自动压缩

`createBeforeCompressUpload` 直接生成 `wd-upload` 的 `:before-upload` 钩子，在文件进入上传队列前自动压缩，无需手动处理路径替换：

```vue
<template>
  <view class="demo">
    <!-- 文章配图：上传前自动按 content 预设压缩 -->
    <wd-upload
      v-model="contentFiles"
      :before-upload="beforeContentUpload"
      :action="uploadUrl"
      multiple
    />

    <!-- 头像：上传前自动按 avatar 预设压缩 -->
    <wd-upload
      v-model="avatarFiles"
      :before-upload="beforeAvatarUpload"
      :action="uploadUrl"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { createBeforeCompressUpload } from '@/composables/useImageCompress'

const uploadUrl = '/api/oss/upload'
const contentFiles = ref([])
const avatarFiles = ref([])

// 用预设名
const beforeContentUpload = createBeforeCompressUpload('content')

// 用自定义选项
const beforeAvatarUpload = createBeforeCompressUpload({
  quality: 70,
  maxWidth: 200,
  maxHeight: 200,
})
</script>
```

**使用说明:**

- `createBeforeCompressUpload(presetOrOpts?)` - 入参为预设名或自定义选项，缺省为 `'content'`
- 仅处理 `type === 'image'` 的文件，视频与普通文件不会被压缩
- 当文件大小小于 `skipBelowKB` 阈值时跳过压缩
- 钩子内部就地修改 `files[i].path` 与 `files[i].size`，最终始终 `resolve(true)`
- 即使压缩过程抛错，也会捕获后继续上传原图，不阻塞上传流程

::: warning wd-upload beforeUpload 钩子的限制
`wd-upload` 的 `beforeUpload` 钩子 `resolve` 仅接受布尔值，无法返回新的文件对象。因此压缩结果必须**就地修改** `files[i].path` 与 `files[i].size`，再 `resolve(true)`，这正是 `createBeforeCompressUpload` 内部的处理方式。
:::

## 平台实现差异

### 小程序 / APP：uni.compressImage

微信小程序、抖音小程序与 APP 端调用 `uni.compressImage`。其中微信、抖音、APP 额外传入 `compressedWidth` 与 `compressHeight` 实现尺寸缩放，支付宝小程序仅传 `quality`：

```typescript
uni.compressImage({
  src,
  quality: options.quality,
  // #ifdef MP-WEIXIN || APP-PLUS || MP-TOUTIAO
  compressedWidth: options.maxWidth,
  compressHeight: options.maxHeight,
  // #endif
  success: (res) => {
    const path = res.tempFilePath
    // 部分平台 res 不带 size，需通过 getFileInfo 读取
    uni.getFileInfo({
      filePath: path,
      success: (info) => resolve({ path, size: info.size, compressed: true }),
      fail: () => resolve({ path, compressed: true }),
    })
  },
  fail: () => resolve({ path: src, compressed: false }),
})
```

**技术实现:**

- 压缩后通过 `uni.getFileInfo` 读取实际文件大小（部分平台 `success` 回调不带 `size`）
- 压缩失败时打印警告并返回原图（`compressed: false`），不抛出异常

### H5：Canvas 重绘

H5 端 `uni.compressImage` 不可用，改用 Canvas 重绘 + `toBlob` 实现压缩，流程为：加载图片 → 计算等比目标尺寸 → Canvas 绘制 → 导出 Blob → 生成 ObjectURL：

```typescript
// #ifdef H5
const img = await loadImage(src)
const { width, height } = calcTargetSize(
  img.naturalWidth, img.naturalHeight,
  options.maxWidth, options.maxHeight,
)
const canvas = document.createElement('canvas')
canvas.width = width
canvas.height = height
const ctx = canvas.getContext('2d')
ctx.drawImage(img, 0, 0, width, height)
const blob = await canvasToBlob(canvas, options.mimeType, options.quality / 100)
const url = URL.createObjectURL(blob)
// #endif
```

**技术实现:**

- 尺寸计算保持原图宽高比，原图小于目标尺寸时不放大
- 加载图片时设置 `crossOrigin = 'anonymous'`，避免跨域图片污染 Canvas 导致 `toBlob` 失败
- 输出格式由 `mimeType` 决定（`image/jpeg`、`image/png`、`image/webp`）
- Canvas 2D 上下文不可用或导出失败时，返回原图（`compressed: false`）

### 其他平台：跳过压缩

百度、QQ、飞书、快手小程序对 `compressImage` 支持不一致，为保证稳定性直接跳过压缩、原图直传：

```typescript
// #ifdef MP-BAIDU || MP-QQ || MP-LARK || MP-KUAISHOU
console.warn('[useImageCompress] 当前平台暂不支持图片压缩，使用原图')
return { path: src, compressed: false }
// #endif
```

## API

### 方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `compressImage(src, options?)` | 压缩单张图片（跨端） | `Promise<CompressResult>` |
| `createBeforeCompressUpload(presetOrOpts?)` | 生成 wd-upload `:before-upload` 钩子 | `(opt) => Promise<void>` |
| `useImageCompress(presetOrOpts?)` | 组合式用法，返回 `compress`/`beforeUpload`/`presets` | `object` |

### 常量

| 常量 | 说明 | 类型 |
|------|------|------|
| `COMPRESS_PRESETS` | 5 个业务预设集合 | `Record<string, CompressOptions>` |

### CompressOptions 压缩选项

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `quality` | 压缩质量（0-100） | `number` | `80` |
| `maxWidth` | 输出最大宽度（px），按比例缩放 | `number` | `1280` |
| `maxHeight` | 输出最大高度（px），按比例缩放 | `number` | `1280` |
| `skipBelowKB` | 文件小于此阈值（KB）时跳过压缩 | `number` | `100` |
| `mimeType` | H5 输出 MIME 类型 | `'image/jpeg' \| 'image/png' \| 'image/webp'` | `'image/jpeg'` |

### CompressResult 压缩结果

| 字段 | 说明 | 类型 |
|------|------|------|
| `path` | 压缩后路径（小程序/APP）或 ObjectURL（H5） | `string` |
| `size` | 压缩后大小（字节），失败/未知时为 `undefined` | `number \| undefined` |
| `compressed` | 是否真正执行了压缩（`false` 表示跳过/不支持） | `boolean` |

### 类型定义

```typescript
/** 压缩选项 */
export interface CompressOptions {
  /** 压缩质量（0-100），默认 80 */
  quality?: number
  /** 输出最大宽度（px），按比例缩放，默认 1280 */
  maxWidth?: number
  /** 输出最大高度（px），按比例缩放，默认 1280 */
  maxHeight?: number
  /** 文件小于此阈值（KB）时跳过压缩，默认 100KB */
  skipBelowKB?: number
  /** H5 输出 mime（小程序/APP 由 uni.compressImage 决定），默认 image/jpeg */
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp'
}

/** 压缩结果 */
export interface CompressResult {
  /** 压缩后路径（小程序/APP）或 ObjectURL（H5） */
  path: string
  /** 压缩后大小（字节），失败/未知时为 undefined */
  size?: number
  /** 是否真正执行了压缩（false 表示跳过/不支持） */
  compressed: boolean
}

/** 预设名称 */
export type CompressPresetName = keyof typeof COMPRESS_PRESETS
```

## 最佳实践

### 1. 按场景选择预设

不同业务场景对画质与体积的诉求不同，直接使用对应预设即可，无需逐项调参：

```typescript
// ✅ 推荐 - 用预设表达业务语义
const beforeAvatar = createBeforeCompressUpload('avatar')      // 头像：强压缩
const beforeContent = createBeforeCompressUpload('content')    // 内容图：均衡
const beforeReceipt = createBeforeCompressUpload('receipt')    // 票据：保清晰

// ❌ 不推荐 - 到处手写魔法数字
const before = createBeforeCompressUpload({ quality: 70, maxWidth: 200, maxHeight: 200 })
```

### 2. 优先用 beforeUpload 钩子接入上传

上传场景应优先用 `createBeforeCompressUpload` 而非手动压缩，钩子会自动处理文件路径替换、大小更新与异常兜底：

```vue
<template>
  <!-- ✅ 推荐 - 钩子自动压缩，业务零感知 -->
  <wd-upload :before-upload="beforeUpload" :action="uploadUrl" />
</template>

<script lang="ts" setup>
import { createBeforeCompressUpload } from '@/composables/useImageCompress'
const beforeUpload = createBeforeCompressUpload('content')
const uploadUrl = '/api/oss/upload'
</script>
```

### 3. 合理设置跳过阈值

对已经较小的图片再压缩往往得不偿失，甚至可能因二次编码导致体积反增。通过 `skipBelowKB` 跳过小图：

```typescript
// 列表缩略图：小于 50KB 直接跳过
const before = createBeforeCompressUpload({
  quality: 75,
  maxWidth: 400,
  maxHeight: 400,
  skipBelowKB: 50,
})
```

### 4. H5 端注意 ObjectURL 回收

H5 端压缩结果是 `URL.createObjectURL` 生成的 ObjectURL。若大量压缩图片且不上传（如仅预览后丢弃），应在不再使用时调用 `URL.revokeObjectURL` 释放内存：

```typescript
const result = await compressImage(src, { quality: 80 })
// 预览
previewSrc.value = result.path
// #ifdef H5
// 预览结束后释放
onUnmounted(() => {
  if (result.compressed) URL.revokeObjectURL(result.path)
})
// #endif
```

## 常见问题

### 1. 支付宝小程序压缩后尺寸没变小?

**问题原因:**

- 支付宝小程序的 `uni.compressImage` 仅支持 `quality` 参数，不支持 `compressedWidth/compressHeight`
- 因此在支付宝端 `maxWidth/maxHeight` 不会生效，只有质量被压缩

**解决方案:**

- 这是平台能力限制，属于预期行为。若必须控制尺寸，可在 H5 端用 Canvas 方案，或在服务端做二次缩放
- 业务上可接受时，依赖质量压缩即可显著降低体积

### 2. H5 端跨域图片压缩失败?

**问题原因:**

- Canvas 加载跨域图片后，若服务端未返回正确的 CORS 头，`canvas.toBlob` 会因 Canvas 被「污染」而失败

**解决方案:**

```typescript
// useImageCompress 已设置 crossOrigin，但仍需服务端配合返回 CORS 头
// img.crossOrigin = 'anonymous'

// 若服务端无法配置 CORS，压缩会自动降级为原图（compressed: false），上传不受影响
const result = await compressImage(remoteUrl, { quality: 80 })
if (!result.compressed) {
  console.warn('跨域图片未压缩，已使用原图')
}
```

### 3. 压缩后为什么读不到 size?

**问题原因:**

- 部分小程序平台的 `uni.compressImage` 成功回调不返回文件大小
- 此时模块会尝试 `uni.getFileInfo` 补读，若仍失败则 `size` 为 `undefined`

**解决方案:**

- `size` 仅用于展示或统计，业务不应强依赖它
- 需要精确大小时，可在上传完成后由服务端返回实际存储大小

### 4. wd-upload 上传的还是原图?

**问题原因:**

- 未将 `createBeforeCompressUpload` 的返回值绑定到 `:before-upload`
- 或文件大小小于 `skipBelowKB` 阈值被跳过
- 或当前平台不支持压缩（如百度/QQ/飞书/快手小程序）

**解决方案:**

```vue
<template>
  <!-- 确保绑定了 before-upload 钩子 -->
  <wd-upload :before-upload="beforeUpload" :action="uploadUrl" />
</template>

<script lang="ts" setup>
import { createBeforeCompressUpload } from '@/composables/useImageCompress'
// 降低跳过阈值，让更多图片进入压缩
const beforeUpload = createBeforeCompressUpload({ quality: 80, skipBelowKB: 50 })
const uploadUrl = '/api/oss/upload'
</script>
```

### 5. 如何同时压缩多张图片?

**问题原因:**

- `compressImage` 一次只处理单张图片

**解决方案:**

```typescript
import { compressImage } from '@/composables/useImageCompress'

// 并发压缩多张
const compressAll = async (srcList: string[]) => {
  const results = await Promise.all(
    srcList.map((src) => compressImage(src, { quality: 80 })),
  )
  return results.map((r) => r.path)
}
```

`createBeforeCompressUpload` 钩子内部已用 `Promise.all` 并发压缩 `wd-upload` 选中的多张图片，无需额外处理。
