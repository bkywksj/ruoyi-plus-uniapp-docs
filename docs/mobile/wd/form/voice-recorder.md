---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/voiceRecorder
---

# VoiceRecorder 录音

## 介绍

VoiceRecorder 录音组件用于录制音频内容，基于小程序录音管理器 `RecorderManager` 实现。组件提供了完整的录音控制功能，包括开始、暂停、停止、播放、删除等操作，并支持自定义界面和丰富的配置选项。组件内置了权限处理逻辑、录音动画波纹效果，以及暗色主题支持。

**核心特性:**

- **完整录音控制** - 支持开始、暂停、恢复、停止录音，覆盖完整录音生命周期
- **音频播放** - 支持录音完成后的试听功能，可播放/暂停控制
- **多格式支持** - 支持 mp3、wav、aac 三种音频格式，可自定义采样率和码率
- **权限处理** - 内置录音权限检测和引导弹窗，自动处理授权失败场景
- **自定义界面** - 支持通过 default 和 button 两个插槽完全自定义界面
- **录音动画** - 内置录音波纹扩散动画效果，视觉反馈直观
- **暗色主题** - 完美支持暗色主题，自动适配背景和文字颜色
- **TypeScript** - 完整的类型定义，提供良好的开发体验

## 平台兼容性

| 平台 | 支持情况 | 说明 |
|------|----------|------|
| 微信小程序 | 是 完全支持 | 需要在 `app.json` 中配置 `requiredPrivateInfos` |
| 支付宝小程序 | 是 完全支持 | 需要申请录音权限 |
| 抖音小程序 | 是 完全支持 | - |
| H5 | 部分 部分支持 | 需要 HTTPS 环境，浏览器兼容性有差异 |
| App | 是 完全支持 | 需要在 `manifest.json` 中配置录音权限 |

## 基本用法

### 基础录音

最简单的使用方式，通过 `v-model` 双向绑定音频文件路径。

```vue
<template>
  <view class="demo-page">
    <wd-voice-recorder v-model="audioPath" @complete="handleComplete" />

    <!-- 显示录音结果 -->
    <view v-if="audioPath" class="result">
      <text>录音文件: {{ audioPath }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)

const handleComplete = (result: { duration: number; fileSize: number; filePath: string }) => {
  console.log('录音完成:', result.filePath)
  console.log('时长:', result.duration, '秒')
  console.log('文件大小:', result.fileSize, '字节')
}
</script>

<style lang="scss" scoped>
.demo-page {
  padding: 32rpx;
}

.result {
  margin-top: 32rpx;
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
}
</style>
```

**使用说明:**

- 组件默认显示录音按钮，点击开始录音，再次点击停止录音
- 录音完成后会显示试听、删除、重录三个操作按钮
- `v-model` 绑定的值为录音文件的临时路径

### 设置最大时长

通过 `max-duration` 设置最大录音时长（秒），超过时长会自动停止录音。

```vue
<template>
  <view class="demo-page">
    <!-- 最大录音 30 秒 -->
    <wd-voice-recorder
      v-model="audioPath"
      :max-duration="30"
      @complete="handleComplete"
    />

    <!-- 最大录音 2 分钟 -->
    <wd-voice-recorder
      v-model="audioPath2"
      :max-duration="120"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)
const audioPath2 = ref<string | null>(null)

const handleComplete = (result) => {
  console.log('录音完成，时长:', result.duration, '秒')
}
</script>
```

**时长设置说明:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `max-duration` | `number` | `60` | 最大录音时长（秒） |
| `min-duration` | `number` | `1` | 最小录音时长（秒），低于此时长不会保存 |
| `auto-stop` | `boolean` | `true` | 达到最大时长是否自动停止 |

### 音频格式配置

通过 `format`、`sample-rate`、`encode-bit-rate` 等属性配置音频参数。

```vue
<template>
  <view class="demo-page">
    <!-- 高质量录音配置 -->
    <view class="demo-item">
      <text class="demo-title">高质量录音 (AAC 44.1kHz)</text>
      <wd-voice-recorder
        v-model="audioHigh"
        format="aac"
        :sample-rate="44100"
        :encode-bit-rate="128000"
        :number-of-channels="2"
      />
    </view>

    <!-- 语音消息配置（平衡质量和文件大小） -->
    <view class="demo-item">
      <text class="demo-title">语音消息 (MP3 16kHz)</text>
      <wd-voice-recorder
        v-model="audioVoice"
        format="mp3"
        :sample-rate="16000"
        :encode-bit-rate="48000"
        :number-of-channels="1"
      />
    </view>

    <!-- 高保真录音配置 -->
    <view class="demo-item">
      <text class="demo-title">高保真录音 (WAV 48kHz)</text>
      <wd-voice-recorder
        v-model="audioWav"
        format="wav"
        :sample-rate="48000"
        :number-of-channels="2"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioHigh = ref<string | null>(null)
const audioVoice = ref<string | null>(null)
const audioWav = ref<string | null>(null)
</script>

<style lang="scss" scoped>
.demo-page {
  padding: 32rpx;
}

.demo-item {
  margin-bottom: 48rpx;
}

.demo-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}
</style>
```

**音频格式对比:**

| 格式 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| `mp3` | 兼容性好，文件小 | 有损压缩 | 语音消息、通用场景 |
| `aac` | 压缩率高，音质好 | 部分老设备不支持 | 高质量语音、音乐 |
| `wav` | 无损音质，编辑方便 | 文件体积大 | 专业录音、后期处理 |

**采样率说明:**

| 采样率 | 音质 | 文件大小 | 适用场景 |
|--------|------|----------|----------|
| 8000 Hz | 电话音质 | 最小 | 低带宽环境 |
| 16000 Hz | 语音质量 | 较小 | 语音消息（推荐） |
| 22050 Hz | AM 广播质量 | 中等 | 普通录音 |
| 44100 Hz | CD 音质 | 较大 | 音乐录制 |
| 48000 Hz | 专业音质 | 最大 | 专业录音 |

### 禁用和只读

```vue
<template>
  <view class="demo-page">
    <!-- 禁用状态：不能进行任何操作 -->
    <view class="demo-item">
      <text class="demo-title">禁用状态</text>
      <wd-voice-recorder v-model="audioPath" disabled />
    </view>

    <!-- 只读状态：可以查看和播放，不能录制新内容 -->
    <view class="demo-item">
      <text class="demo-title">只读状态</text>
      <wd-voice-recorder v-model="readonlyAudio" readonly />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)
// 预设一个已有的音频路径
const readonlyAudio = ref<string | null>('/static/audio/demo.mp3')
</script>
```

**状态说明:**

| 状态 | 可录音 | 可播放 | 可删除 | 视觉效果 |
|------|--------|--------|--------|----------|
| 正常 | 是 | 是 | 是 | 正常显示 |
| `disabled` | 否 | 否 | 否 | 半透明，禁用交互 |
| `readonly` | 否 | 是 | 否 | 正常显示，禁用编辑 |

### 自定义界面

通过默认插槽完全自定义录音界面，插槽提供了完整的状态和控制方法。

```vue
<template>
  <view class="demo-page">
    <wd-voice-recorder v-model="audioPath">
      <template #default="{ recording, paused, duration, status, start, stop, pause, resume, play, delete: deleteRecord }">
        <view class="custom-recorder">
          <!-- 状态指示 -->
          <view class="status-bar">
            <view class="status-dot" :class="{ 'is-recording': recording }" />
            <text class="status-text">{{ getStatusText(status) }}</text>
          </view>

          <!-- 时间显示 -->
          <view class="time-display">
            <text class="time-text">{{ formatTime(duration) }}</text>
          </view>

          <!-- 控制按钮组 -->
          <view class="control-bar">
            <!-- 未录音状态 -->
            <template v-if="status === 'idle'">
              <wd-button type="primary" round @click="start">
                <wd-icon name="audio" />
                开始录音
              </wd-button>
            </template>

            <!-- 录音中状态 -->
            <template v-else-if="status === 'recording'">
              <wd-button type="warning" round @click="pause">
                <wd-icon name="pause" />
                暂停
              </wd-button>
              <wd-button type="error" round @click="stop">
                <wd-icon name="check" />
                完成
              </wd-button>
            </template>

            <!-- 暂停状态 -->
            <template v-else-if="status === 'paused'">
              <wd-button type="primary" round @click="resume">
                <wd-icon name="play" />
                继续
              </wd-button>
              <wd-button type="error" round @click="stop">
                <wd-icon name="check" />
                完成
              </wd-button>
            </template>

            <!-- 完成状态 -->
            <template v-else-if="status === 'completed'">
              <wd-button round @click="play">
                <wd-icon name="play" />
                播放
              </wd-button>
              <wd-button type="error" round @click="deleteRecord">
                <wd-icon name="delete" />
                删除
              </wd-button>
              <wd-button type="primary" round @click="start">
                <wd-icon name="audio" />
                重录
              </wd-button>
            </template>
          </view>
        </view>
      </template>
    </wd-voice-recorder>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    idle: '准备录音',
    recording: '录音中...',
    paused: '已暂停',
    completed: '录音完成',
    error: '录音出错',
  }
  return statusMap[status] || '未知状态'
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`
}
</script>

<style lang="scss" scoped>
.custom-recorder {
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  margin-right: 12rpx;

  &.is-recording {
    background-color: #ff6b6b;
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  color: white;
  font-size: 28rpx;
}

.time-display {
  text-align: center;
  margin-bottom: 40rpx;
}

.time-text {
  font-size: 72rpx;
  font-weight: 200;
  color: white;
  font-family: 'Helvetica Neue', sans-serif;
  letter-spacing: 4rpx;
}

.control-bar {
  display: flex;
  justify-content: center;
  gap: 24rpx;
}
</style>
```

**插槽参数说明:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `recording` | `boolean` | 是否正在录音 |
| `paused` | `boolean` | 是否已暂停 |
| `duration` | `number` | 当前录音时长（秒） |
| `audioFile` | `string \| null` | 音频文件路径 |
| `status` | `RecordStatus` | 当前状态 |
| `start` | `() => void` | 开始录音方法 |
| `stop` | `() => void` | 停止录音方法 |
| `pause` | `() => void` | 暂停录音方法 |
| `resume` | `() => void` | 恢复录音方法 |
| `play` | `() => void` | 播放音频方法 |
| `delete` | `() => void` | 删除录音方法 |
| `toggle` | `() => void` | 切换录音状态方法 |

### 隐藏默认按钮

设置 `show-button` 为 `false` 隐藏默认界面，仅通过插槽自定义。

```vue
<template>
  <view class="demo-page">
    <wd-voice-recorder v-model="audioPath" :show-button="false">
      <template #default="{ recording, duration, start, stop }">
        <view class="simple-recorder">
          <text class="duration">{{ duration.toFixed(1) }}s</text>
          <wd-button
            :type="recording ? 'error' : 'primary'"
            round
            size="large"
            @click="recording ? stop() : start()"
          >
            {{ recording ? '停止录音' : '开始录音' }}
          </wd-button>
        </view>
      </template>
    </wd-voice-recorder>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const audioPath = ref<string | null>(null)
</script>

<style lang="scss" scoped>
.simple-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 40rpx;
}

.duration {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
}
</style>
```

### 组件方法调用

通过 ref 获取组件实例，调用组件方法进行精细控制。

```vue
<template>
  <view class="demo-page">
    <wd-voice-recorder
      ref="recorderRef"
      v-model="audioPath"
      :show-button="false"
      @progress="handleProgress"
      @error="handleError"
    />

    <!-- 自定义控制面板 -->
    <view class="control-panel">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: `${progress}%` }" />
      </view>
      <text class="progress-text">{{ duration.toFixed(1) }}s / 60s</text>

      <view class="button-group">
        <wd-button size="small" @click="handleStart">开始</wd-button>
        <wd-button size="small" @click="handlePause">暂停</wd-button>
        <wd-button size="small" @click="handleResume">继续</wd-button>
        <wd-button size="small" @click="handleStop">停止</wd-button>
        <wd-button size="small" @click="handlePlay">播放</wd-button>
        <wd-button size="small" type="error" @click="handleDelete">删除</wd-button>
      </view>

      <view class="status-info">
        <text>状态: {{ status }}</text>
        <text>正在录音: {{ isRecording }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const recorderRef = ref()
const audioPath = ref<string | null>(null)
const duration = ref(0)
const status = ref('idle')
const isRecording = ref(false)

const progress = computed(() => (duration.value / 60) * 100)

const handleProgress = (e: { duration: number }) => {
  duration.value = e.duration
}

const handleError = (e: { errMsg: string; errCode: number }) => {
  console.error('录音错误:', e.errMsg)
  uni.showToast({ title: e.errMsg, icon: 'none' })
}

const handleStart = () => {
  recorderRef.value?.startRecord()
  status.value = 'recording'
  isRecording.value = true
}

const handlePause = () => {
  recorderRef.value?.pauseRecord()
  status.value = 'paused'
}

const handleResume = () => {
  recorderRef.value?.resumeRecord()
  status.value = 'recording'
}

const handleStop = () => {
  recorderRef.value?.stopRecord()
  status.value = 'completed'
  isRecording.value = false
}

const handlePlay = () => recorderRef.value?.playAudio()

const handleDelete = () => {
  recorderRef.value?.deleteRecord()
  status.value = 'idle'
  duration.value = 0
}
</script>

<style lang="scss" scoped>
.control-panel {
  padding: 32rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  margin-top: 32rpx;
}

.progress-bar {
  height: 8rpx;
  background: #e9ecef;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4rpx;
  transition: width 0.1s linear;
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 24rpx;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
  margin-bottom: 24rpx;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
```

### 长按录音

实现微信语音消息风格的长按录音功能。

```vue
<template>
  <view class="demo-page">
    <wd-voice-recorder
      ref="recorderRef"
      v-model="audioPath"
      :show-button="false"
      @complete="handleComplete"
    >
      <template #default="{ recording, duration }">
        <view class="hold-recorder">
          <!-- 波纹动画 -->
          <view v-if="recording" class="wave-container">
            <view v-for="i in 5" :key="i" class="wave-bar" :style="{ animationDelay: `${i * 0.1}s` }" />
          </view>

          <!-- 时长显示 -->
          <text class="duration-text">{{ recording ? formatDuration(duration) : '按住说话' }}</text>

          <!-- 长按按钮 -->
          <view
            class="hold-button"
            :class="{ 'is-pressing': recording }"
            @touchstart.prevent="startRecording"
            @touchend.prevent="stopRecording"
            @touchcancel.prevent="stopRecording"
          >
            <wd-icon :name="recording ? 'audio' : 'audio'" size="60" color="white" />
          </view>

          <!-- 取消提示 -->
          <text v-if="recording" class="cancel-tip">松开发送，上滑取消</text>
        </view>
      </template>
    </wd-voice-recorder>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const recorderRef = ref()
const audioPath = ref<string | null>(null)

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const startRecording = () => {
  recorderRef.value?.startRecord()
}

const stopRecording = () => {
  recorderRef.value?.stopRecord()
}

const handleComplete = (result: { duration: number; filePath: string }) => {
  console.log('录音完成:', result)
  // 发送语音消息
  sendVoiceMessage(result.filePath, result.duration)
}

const sendVoiceMessage = async (filePath: string, duration: number) => {
  try {
    // 上传语音文件
    const uploadResult = await uni.uploadFile({
      url: '/api/upload/voice',
      filePath,
      name: 'file',
    })

    // 发送消息
    console.log('语音消息已发送', uploadResult)
  } catch (error) {
    console.error('发送失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.hold-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx;
}

.wave-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.wave-bar {
  width: 8rpx;
  height: 40rpx;
  background: #667eea;
  border-radius: 4rpx;
  animation: wave 0.5s ease-in-out infinite alternate;
}

@keyframes wave {
  from { height: 20rpx; }
  to { height: 60rpx; }
}

.duration-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 32rpx;
}

.hold-button {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &.is-pressing {
    transform: scale(1.1);
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  }
}

.cancel-tip {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
```

## 高级用法

### 语音消息场景

完整的语音消息发送流程，包含录音、预览、上传、发送。

```vue
<template>
  <view class="voice-message-page">
    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y>
      <view v-for="msg in messages" :key="msg.id" class="message-item">
        <view class="voice-bubble" @click="playMessage(msg)">
          <wd-icon name="audio" size="32" />
          <text class="voice-duration">{{ msg.duration }}″</text>
          <view v-if="playingId === msg.id" class="playing-indicator" />
        </view>
      </view>
    </scroll-view>

    <!-- 录音区域 -->
    <view class="record-area">
      <wd-voice-recorder
        ref="recorderRef"
        v-model="currentAudio"
        :max-duration="60"
        :show-button="false"
        @complete="handleRecordComplete"
      >
        <template #default="{ recording, duration, start, stop }">
          <view class="record-controls">
            <!-- 录音按钮 -->
            <view
              class="record-btn"
              :class="{ 'is-recording': recording }"
              @touchstart.prevent="start"
              @touchend.prevent="stop"
            >
              <wd-icon :name="recording ? 'pause' : 'audio'" size="48" color="white" />
            </view>

            <!-- 时长显示 -->
            <text v-if="recording" class="record-duration">{{ duration.toFixed(0) }}″</text>

            <!-- 发送按钮 -->
            <wd-button
              v-if="currentAudio && !recording"
              type="primary"
              size="small"
              @click="sendVoice"
            >
              发送
            </wd-button>
          </view>
        </template>
      </wd-voice-recorder>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

interface VoiceMessage {
  id: number
  url: string
  duration: number
}

const recorderRef = ref()
const currentAudio = ref<string | null>(null)
const currentDuration = ref(0)
const playingId = ref<number | null>(null)
const messages = reactive<VoiceMessage[]>([])

let audioContext: any = null

const handleRecordComplete = (result: { duration: number; filePath: string }) => {
  currentDuration.value = Math.round(result.duration)
}

const sendVoice = async () => {
  if (!currentAudio.value) return

  try {
    // 上传音频文件
    const uploadRes = await uni.uploadFile({
      url: '/api/upload/voice',
      filePath: currentAudio.value,
      name: 'file',
    })

    const data = JSON.parse(uploadRes.data)

    // 添加到消息列表
    messages.push({
      id: Date.now(),
      url: data.url,
      duration: currentDuration.value,
    })

    // 清空当前录音
    currentAudio.value = null
    currentDuration.value = 0
  } catch (error) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  }
}

const playMessage = (msg: VoiceMessage) => {
  if (!audioContext) {
    audioContext = uni.createInnerAudioContext()
    audioContext.onEnded(() => {
      playingId.value = null
    })
  }

  if (playingId.value === msg.id) {
    audioContext.stop()
    playingId.value = null
  } else {
    audioContext.src = msg.url
    audioContext.play()
    playingId.value = msg.id
  }
}
</script>
```

### 表单中使用

在表单中作为录音字段使用，配合表单验证。

```vue
<template>
  <wd-form ref="formRef" :model="form" :rules="rules">
    <wd-cell-group>
      <wd-cell title="用户名" required>
        <template #value>
          <wd-input v-model="form.username" placeholder="请输入用户名" />
        </template>
      </wd-cell>

      <wd-cell title="语音备注" required>
        <template #value>
          <wd-voice-recorder
            v-model="form.voiceNote"
            :max-duration="30"
            @complete="validateVoice"
          />
        </template>
      </wd-cell>

      <wd-cell title="文字备注">
        <template #value>
          <wd-textarea v-model="form.textNote" placeholder="可选的文字说明" />
        </template>
      </wd-cell>
    </wd-cell-group>

    <view class="form-actions">
      <wd-button type="primary" block @click="handleSubmit">提交</wd-button>
    </view>
  </wd-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const formRef = ref()

const form = reactive({
  username: '',
  voiceNote: null as string | null,
  textNote: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  voiceNote: [{ required: true, message: '请录制语音备注' }],
}

const validateVoice = () => {
  // 触发表单验证
  formRef.value?.validate('voiceNote')
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    // 上传语音文件
    if (form.voiceNote) {
      const uploadRes = await uni.uploadFile({
        url: '/api/upload/voice',
        filePath: form.voiceNote,
        name: 'voice',
      })

      const data = JSON.parse(uploadRes.data)

      // 提交表单
      await submitForm({
        ...form,
        voiceNote: data.url,
      })

      uni.showToast({ title: '提交成功' })
    }
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const submitForm = async (data: any) => {
  // 提交表单数据
  return uni.request({
    url: '/api/form/submit',
    method: 'POST',
    data,
  })
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 音频文件路径 | `string \| null` | `null` |
| max-duration | 最大录音时长（秒） | `number` | `60` |
| min-duration | 最小录音时长（秒） | `number` | `1` |
| format | 音频格式 | `'mp3' \| 'wav' \| 'aac'` | `'mp3'` |
| sample-rate | 采样率（Hz） | `number` | `16000` |
| number-of-channels | 声道数 | `number` | `1` |
| encode-bit-rate | 编码码率（bps） | `number` | `96000` |
| show-button | 是否显示默认按钮 | `boolean` | `true` |
| auto-stop | 达到最大时长是否自动停止 | `boolean` | `true` |
| quality-check | 是否进行质量检测 | `boolean` | `true` |
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
| progress | 录音进度变化时触发（每 100ms） | `{ duration: number }` |
| play | 播放音频时触发 | - |
| delete | 删除录音时触发 | - |
| click | 点击组件时触发 | `event: MouseEvent` |

### Slots

| 名称 | 说明 | 参数 |
|------|------|------|
| default | 自定义录音界面 | `{ recording, paused, duration, audioFile, status, start, stop, pause, resume, play, delete, toggle }` |
| button | 自定义按钮区域（在默认界面基础上） | `{ recording, paused, duration, status, start, stop, pause, resume, play, delete }` |

### Methods

通过 ref 获取组件实例后可调用以下方法：

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

/**
 * 录音组件属性接口
 */
interface WdVoiceRecorderProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 绑定值 - 音频文件路径 */
  modelValue?: string | null
  /** 最大录音时长（秒） */
  maxDuration?: number
  /** 最小录音时长（秒） */
  minDuration?: number
  /** 音频格式 */
  format?: AudioFormat
  /** 采样率 */
  sampleRate?: number
  /** 声道数 */
  numberOfChannels?: number
  /** 编码码率 */
  encodeBitRate?: number
  /** 是否显示默认按钮 */
  showButton?: boolean
  /** 是否自动停止 */
  autoStop?: boolean
  /** 是否进行质量检测 */
  qualityCheck?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 只读模式 */
  readonly?: boolean
}

/**
 * 录音完成事件参数
 */
interface RecordCompleteEvent {
  /** 录音时长（秒） */
  duration: number
  /** 文件大小（字节） */
  fileSize: number
  /** 文件临时路径 */
  filePath: string
}

/**
 * 录音错误事件参数
 */
interface RecordErrorEvent {
  /** 错误信息 */
  errMsg: string
  /** 错误码 */
  errCode: number
}
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--wd-voice-recorder-button-bg` | 录音按钮背景 | `linear-gradient(135deg, #86C9FF 0%, #5EA9FF 100%)` |
| `--wd-voice-recorder-button-recording-bg` | 录音中按钮背景 | `linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)` |
| `--wd-voice-recorder-button-completed-bg` | 完成状态按钮背景 | `linear-gradient(135deg, #00b894 0%, #00a085 100%)` |
| `--wd-voice-recorder-button-size` | 录音按钮大小 | `180rpx` |
| `--wd-voice-recorder-duration-color` | 时长文字颜色 | `#333` |
| `--wd-voice-recorder-status-color` | 状态文字颜色 | `#666` |

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-voice-recorder v-model="audioPath" />
  </view>
</template>

<style lang="scss" scoped>
.custom-theme {
  --wd-voice-recorder-button-bg: linear-gradient(135deg, #00b894 0%, #00a085 100%);
  --wd-voice-recorder-button-recording-bg: linear-gradient(135deg, #e17055 0%, #d63031 100%);
  --wd-voice-recorder-button-completed-bg: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
  --wd-voice-recorder-button-size: 200rpx;
}
</style>
```

## 最佳实践

### 1. 选择合适的音频参数

```vue
<script lang="ts" setup>
// ✅ 推荐：语音消息场景
// MP3 格式，16kHz 采样率，单声道，文件小
<wd-voice-recorder
  format="mp3"
  :sample-rate="16000"
  :number-of-channels="1"
  :encode-bit-rate="48000"
/>

// ✅ 推荐：高质量录音场景
// AAC 格式，44.1kHz 采样率，立体声
<wd-voice-recorder
  format="aac"
  :sample-rate="44100"
  :number-of-channels="2"
  :encode-bit-rate="128000"
/>

// ❌ 不推荐：语音消息使用高采样率
// 文件过大，传输慢
<wd-voice-recorder
  format="wav"
  :sample-rate="48000"
  :number-of-channels="2"
/>
</script>
```

### 2. 合理设置录音时长

```vue
<script lang="ts" setup>
// ✅ 推荐：语音消息限制 60 秒
<wd-voice-recorder :max-duration="60" :min-duration="1" />

// ✅ 推荐：语音备注限制 30 秒
<wd-voice-recorder :max-duration="30" :min-duration="2" />

// ❌ 不推荐：时长过长
// 文件过大，用户体验差
<wd-voice-recorder :max-duration="600" />
</script>
```

### 3. 处理录音权限

```vue
<template>
  <view>
    <wd-voice-recorder
      v-model="audioPath"
      @error="handleError"
    />
  </view>
</template>

<script lang="ts" setup>
const handleError = (e: { errMsg: string; errCode: number }) => {
  if (e.errCode === 12001) {
    // 用户拒绝授权，组件会自动显示引导弹窗
    // 也可以自定义处理逻辑
    console.log('用户拒绝录音权限')
  } else {
    // 其他错误
    uni.showToast({ title: e.errMsg, icon: 'none' })
  }
}
</script>
```

### 4. 录音文件及时上传

```vue
<script lang="ts" setup>
// ✅ 推荐：录音完成后立即上传
const handleComplete = async (result) => {
  try {
    const uploadRes = await uni.uploadFile({
      url: '/api/upload/voice',
      filePath: result.filePath,
      name: 'file',
    })
    // 保存服务器返回的 URL
    serverAudioUrl.value = JSON.parse(uploadRes.data).url
  } catch (error) {
    uni.showToast({ title: '上传失败', icon: 'none' })
  }
}

// ❌ 不推荐：使用临时文件路径
// 临时文件可能被系统清理
const handleComplete = (result) => {
  // 直接使用临时路径，可能会失效
  savedPath.value = result.filePath
}
</script>
```

## 常见问题

### 1. 录音权限被拒绝？

组件内置了权限处理逻辑，当用户拒绝授权时会弹出提示框引导用户去设置页面开启权限。

**微信小程序配置：**

在 `app.json` 中添加权限声明：

```json
{
  "requiredPrivateInfos": ["getRecorderManager"]
}
```

**App 端配置：**

在 `manifest.json` 中配置：

```json
{
  "app-plus": {
    "distribute": {
      "android": {
        "permissions": [
          "<uses-permission android:name=\"android.permission.RECORD_AUDIO\"/>"
        ]
      }
    }
  }
}
```

### 2. 录音文件保存在哪里？

录音文件保存为临时文件，路径通过 `v-model` 或 `complete` 事件返回。临时文件可能被系统清理，如需永久保存，需要将文件上传到服务器。

```vue
<script lang="ts" setup>
const handleComplete = async (result) => {
  // 上传到服务器获取永久 URL
  const uploadRes = await uni.uploadFile({
    url: '/api/upload/voice',
    filePath: result.filePath,
    name: 'file',
  })

  // 使用服务器返回的 URL
  permanentUrl.value = JSON.parse(uploadRes.data).url
}
</script>
```

### 3. 支持哪些音频格式？

支持 mp3、wav、aac 三种格式，不同平台支持情况：

| 格式 | 微信小程序 | 支付宝小程序 | H5 | App |
|------|------------|--------------|-----|-----|
| mp3 | 是 | 是 | 是 | 是 |
| aac | 是 | 是 | 部分 | 是 |
| wav | 是 | 是 | 是 | 是 |

### 4. 如何实现长按录音？

可以通过自定义插槽结合触摸事件实现：

```vue
<template>
  <wd-voice-recorder v-model="audioPath" :show-button="false">
    <template #default="{ start, stop }">
      <view
        class="hold-btn"
        @touchstart.prevent="start"
        @touchend.prevent="stop"
        @touchcancel.prevent="stop"
      >
        按住录音
      </view>
    </template>
  </wd-voice-recorder>
</template>
```

### 5. H5 端录音不工作？

H5 端录音需要满足以下条件：

1. **HTTPS 环境**：浏览器要求在安全上下文（HTTPS）中才能访问麦克风
2. **浏览器支持**：需要支持 MediaRecorder API
3. **用户授权**：需要用户明确授权麦克风访问

```javascript
// 检测浏览器支持
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.error('浏览器不支持录音功能')
}
```

### 6. 录音时长不准确？

组件通过定时器计算时长，可能存在轻微误差。如需精确时长，使用 `complete` 事件返回的 `duration` 值，该值来自录音管理器的回调。

```vue
<script lang="ts" setup>
const handleComplete = (result) => {
  // 使用回调中的精确时长
  const exactDuration = result.duration // 单位：秒
  console.log('精确时长:', exactDuration)
}
</script>
```

## 总结

VoiceRecorder 录音组件是一个功能完整的音频录制解决方案，核心要点：

1. **双向绑定** - 通过 `v-model` 绑定音频文件路径，方便表单集成
2. **完整生命周期** - 支持开始、暂停、恢复、停止、播放、删除等完整操作
3. **灵活配置** - 支持自定义音频格式、采样率、码率、时长等参数
4. **权限处理** - 内置权限检测和引导弹窗，用户体验友好
5. **自定义界面** - 通过插槽完全自定义录音界面，满足各种设计需求
6. **暗色主题** - 自动适配暗色主题，无需额外配置
7. **TypeScript** - 完整的类型定义，开发体验良好
