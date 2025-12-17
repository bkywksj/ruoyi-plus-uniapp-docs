---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/voiceRecorder
---

# VoiceRecorder 录音

## 介绍

VoiceRecorder 录音组件用于录制音频内容,基于小程序录音管理器实现。组件提供了完整的录音控制功能,包括开始、暂停、停止、播放、删除等操作,并支持自定义界面和丰富的配置选项。

**核心特性:**

- **完整录音控制** - 支持开始、暂停、恢复、停止录音
- **音频播放** - 支持录音完成后的试听功能
- **自定义配置** - 支持设置音频格式、采样率、声道数等
- **权限处理** - 内置录音权限检测和引导
- **自定义界面** - 支持通过插槽完全自定义界面

## 基本用法

### 基础录音

```vue
<template>
  <wd-voice-recorder v-model="audioPath" @complete="handleComplete" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)

const handleComplete = (result) => {
  console.log('录音完成:', result.filePath)
  console.log('时长:', result.duration, '秒')
}
</script>
```

### 设置最大时长

通过 `max-duration` 设置最大录音时长(秒)。

```vue
<template>
  <wd-voice-recorder v-model="audioPath" :max-duration="30" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)
</script>
```

### 音频格式配置

通过 `format`、`sample-rate`、`encode-bit-rate` 等属性配置音频参数。

```vue
<template>
  <wd-voice-recorder
    v-model="audioPath"
    format="aac"
    :sample-rate="44100"
    :encode-bit-rate="128000"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)
</script>
```

### 禁用和只读

```vue
<template>
  <!-- 禁用状态 -->
  <wd-voice-recorder v-model="audioPath" disabled />

  <!-- 只读状态 -->
  <wd-voice-recorder v-model="audioPath" readonly />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)
</script>
```

### 自定义界面

通过默认插槽完全自定义录音界面。

```vue
<template>
  <wd-voice-recorder v-model="audioPath">
    <template #default="{ recording, duration, status, start, stop, play }">
      <view class="custom-recorder">
        <text>状态: {{ status }}</text>
        <text>时长: {{ duration.toFixed(1) }}s</text>
        <wd-button v-if="!recording" @click="start">开始录音</wd-button>
        <wd-button v-else type="error" @click="stop">停止录音</wd-button>
        <wd-button v-if="status === 'completed'" @click="play">播放</wd-button>
      </view>
    </template>
  </wd-voice-recorder>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)
</script>
```

### 隐藏默认按钮

设置 `show-button` 为 `false` 隐藏默认界面,仅通过插槽自定义。

```vue
<template>
  <wd-voice-recorder v-model="audioPath" :show-button="false">
    <template #default="{ recording, start, stop }">
      <wd-button :type="recording ? 'error' : 'primary'" @click="recording ? stop() : start()">
        {{ recording ? '停止' : '录音' }}
      </wd-button>
    </template>
  </wd-voice-recorder>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)
</script>
```

### 组件方法调用

通过 ref 获取组件实例,调用组件方法。

```vue
<template>
  <wd-voice-recorder ref="recorderRef" v-model="audioPath" :show-button="false" />
  <view class="controls">
    <wd-button @click="handleStart">开始</wd-button>
    <wd-button @click="handleStop">停止</wd-button>
    <wd-button @click="handlePlay">播放</wd-button>
    <wd-button @click="handleDelete">删除</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const recorderRef = ref()
const audioPath = ref<string | null>(null)

const handleStart = () => recorderRef.value?.startRecord()
const handleStop = () => recorderRef.value?.stopRecord()
const handlePlay = () => recorderRef.value?.playAudio()
const handleDelete = () => recorderRef.value?.deleteRecord()
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 音频文件路径 | `string \| null` | `null` |
| max-duration | 最大录音时长(秒) | `number` | `60` |
| min-duration | 最小录音时长(秒) | `number` | `1` |
| format | 音频格式 | `'mp3' \| 'wav' \| 'aac'` | `mp3` |
| sample-rate | 采样率 | `number` | `16000` |
| number-of-channels | 声道数 | `number` | `1` |
| encode-bit-rate | 编码码率 | `number` | `96000` |
| show-button | 是否显示默认按钮 | `boolean` | `true` |
| auto-stop | 是否自动停止 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 只读模式 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| start | 录音开始时触发 | `{ duration: number }` |
| stop | 录音停止时触发 | `{ duration: number, fileSize: number, filePath: string }` |
| pause | 录音暂停时触发 | `{ duration: number }` |
| resume | 录音恢复时触发 | `{ duration: number }` |
| complete | 录音完成时触发 | `{ duration: number, fileSize: number, filePath: string }` |
| error | 录音错误时触发 | `{ errMsg: string, errCode: number }` |
| progress | 录音进度变化时触发 | `{ duration: number }` |
| play | 播放音频时触发 | - |
| delete | 删除录音时触发 | - |
| click | 点击组件时触发 | `event: MouseEvent` |

### Slots

| 名称 | 说明 | 参数 |
|------|------|------|
| default | 自定义录音界面 | `{ recording, paused, duration, audioFile, status, start, stop, pause, resume, play, delete, toggle }` |
| button | 自定义按钮区域 | `{ recording, paused, duration, status, start, stop, pause, resume, play, delete }` |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| startRecord | 开始录音 | - | - |
| stopRecord | 停止录音 | - | - |
| pauseRecord | 暂停录音 | - | - |
| resumeRecord | 恢复录音 | - | - |
| playAudio | 播放录音 | - | - |
| deleteRecord | 删除录音 | - | - |
| toggleRecord | 切换录音状态 | - | - |
| isRecording | 获取是否正在录音 | - | `boolean` |
| duration | 获取当前时长 | - | `number` |
| status | 获取当前状态 | - | `RecordStatus` |

### 类型定义

```typescript
/**
 * 录音状态类型
 */
type RecordStatus = 'idle' | 'recording' | 'paused' | 'completed' | 'error'

/**
 * 音频格式类型
 */
type AudioFormat = 'mp3' | 'wav' | 'aac'
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-voice-recorder-button-bg | 录音按钮背景 | 渐变蓝色 |
| --wd-voice-recorder-button-recording-bg | 录音中按钮背景 | 渐变红色 |
| --wd-voice-recorder-button-completed-bg | 完成状态按钮背景 | 渐变绿色 |

## 最佳实践

### 1. 语音消息录制

```vue
<template>
  <view class="voice-message">
    <wd-voice-recorder
      v-model="voiceUrl"
      :max-duration="60"
      format="mp3"
      @complete="handleComplete"
    />
    <wd-button v-if="voiceUrl" type="primary" @click="sendVoice">
      发送语音
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const voiceUrl = ref<string | null>(null)

const handleComplete = (result) => {
  console.log('录音时长:', result.duration, '秒')
}

const sendVoice = () => {
  if (voiceUrl.value) {
    // 上传语音文件
    uni.uploadFile({
      url: '/api/upload/voice',
      filePath: voiceUrl.value,
      name: 'voice',
      success: (res) => {
        console.log('语音发送成功')
      }
    })
  }
}
</script>
```

### 2. 表单中的录音字段

```vue
<template>
  <wd-form :model="form">
    <wd-cell-group>
      <wd-cell title="语音备注">
        <wd-voice-recorder v-model="form.voiceNote" :max-duration="30" />
      </wd-cell>
    </wd-cell-group>
  </wd-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  voiceNote: null
})
</script>
```

## 常见问题

### 1. 录音权限被拒绝?

组件内置了权限处理逻辑,当用户拒绝授权时会弹出提示框引导用户去设置页面开启权限。

### 2. 录音文件保存在哪里?

录音文件保存为临时文件,路径通过 `v-model` 或 `complete` 事件返回。如需永久保存,需要将文件上传到服务器。

### 3. 支持哪些音频格式?

支持 mp3、wav、aac 三种格式,不同平台支持情况可能略有不同。

### 4. 如何实现长按录音?

可以通过自定义插槽结合触摸事件实现:

```vue
<template>
  <wd-voice-recorder v-model="audioPath" :show-button="false">
    <template #default="{ start, stop }">
      <view
        class="hold-btn"
        @touchstart="start"
        @touchend="stop"
      >
        按住录音
      </view>
    </template>
  </wd-voice-recorder>
</template>
```
