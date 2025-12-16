# Progress 进度条

## 介绍

Progress 是一个进度条组件，用于展示操作的当前进度。该组件支持自定义颜色、渐变颜色、状态图标、动画过渡等特性，广泛应用于文件上传、任务进度、加载状态等场景。

**核心特性:**

- **百分比显示** - 支持 0-100 的进度值，自动显示百分比文本
- **自定义颜色** - 支持单色、多色数组、渐变分段等多种颜色配置方式
- **状态图标** - 支持 success、danger、warning 三种状态，自动显示对应图标
- **动画过渡** - 内置流畅的进度变化动画，可自定义动画时长
- **颜色分段** - 根据进度值自动切换对应区间的颜色
- **文本控制** - 支持显示或隐藏进度百分比文本
- **暗黑模式** - 内置暗黑模式样式适配

## 基本用法

### 基础用法

最基础的用法，显示一个带百分比的进度条：

```vue
<template>
  <view class="demo">
    <wd-progress :percentage="50" />
  </view>
</template>

```

**使用说明:**

- `percentage` 属性设置进度值，范围 0-100
- 默认显示百分比文本
- 默认使用主题色作为进度条颜色

### 动态进度

通过响应式数据动态更新进度：

```vue
<template>
  <view class="demo">
    <wd-progress :percentage="progress" />

    <view class="buttons">
      <wd-button size="small" @click="decrease">减少</wd-button>
      <wd-button size="small" @click="increase">增加</wd-button>
      <wd-button size="small" @click="reset">重置</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(30)

const increase = () => {
  progress.value = Math.min(100, progress.value + 10)
}

const decrease = () => {
  progress.value = Math.max(0, progress.value - 10)
}

const reset = () => {
  progress.value = 0
}
</script>

```

**使用说明:**

- 进度值变化时会自动触发动画过渡
- 进度值必须在 0-100 范围内
- 超出范围会在控制台输出错误信息

### 隐藏百分比文本

通过 `hide-text` 属性隐藏百分比文本：

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">显示文本:</text>
      <wd-progress :percentage="60" />
    </view>

    <view class="item">
      <text class="label">隐藏文本:</text>
      <wd-progress :percentage="60" hide-text />
    </view>
  </view>
</template>

```

## 自定义颜色

### 单色配置

通过 `color` 属性设置进度条颜色：

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">默认颜色:</text>
      <wd-progress :percentage="40" />
    </view>

    <view class="item">
      <text class="label">自定义蓝色:</text>
      <wd-progress :percentage="40" color="#1890ff" />
    </view>

    <view class="item">
      <text class="label">自定义绿色:</text>
      <wd-progress :percentage="60" color="#52c41a" />
    </view>

    <view class="item">
      <text class="label">自定义橙色:</text>
      <wd-progress :percentage="80" color="#fa8c16" />
    </view>

    <view class="item">
      <text class="label">自定义红色:</text>
      <wd-progress :percentage="100" color="#ff4d4f" />
    </view>
  </view>
</template>

```

### 颜色数组

通过颜色数组实现自动分段变色：

```vue
<template>
  <view class="demo">
    <wd-progress :percentage="progress" :color="colors" />

    <view class="slider">
      <wd-slider v-model="progress" :min="0" :max="100" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(20)

// 颜色数组，进度会根据区间自动切换颜色
// 0-25%: 红色
// 25-50%: 橙色
// 50-75%: 蓝色
// 75-100%: 绿色
const colors = ['#ff4d4f', '#fa8c16', '#1890ff', '#52c41a']
</script>

```

**使用说明:**

- 传入颜色数组时，进度条会根据进度值自动切换到对应区间的颜色
- 颜色数组会被平均分配到 0-100 的进度范围内
- 例如 4 个颜色会分别对应 0-25%、25-50%、50-75%、75-100%

### 自定义颜色分段

通过颜色配置对象数组实现精确的分段控制：

```vue
<template>
  <view class="demo">
    <wd-progress :percentage="progress" :color="colorSteps" />

    <view class="slider">
      <wd-slider v-model="progress" :min="0" :max="100" />
    </view>

    <view class="tips">
      <text>0-30%: 红色 (危险)</text>
      <text>30-70%: 橙色 (警告)</text>
      <text>70-100%: 绿色 (安全)</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(50)

// 自定义颜色分段
const colorSteps = [
  { color: '#ff4d4f', percentage: 30 },  // 0-30% 红色
  { color: '#fa8c16', percentage: 70 },  // 30-70% 橙色
  { color: '#52c41a', percentage: 100 }, // 70-100% 绿色
]
</script>

```

**使用说明:**

- 颜色配置对象包含 `color`（颜色值）和 `percentage`（百分比阈值）
- 进度值小于等于 percentage 时使用对应颜色
- 配置会按 percentage 从小到大自动排序

### 渐变效果示例

实现类似电池电量的渐变效果：

```vue
<template>
  <view class="demo">
    <view class="battery-wrapper">
      <view class="battery">
        <wd-progress
          :percentage="battery"
          :color="batteryColors"
          hide-text
        />
      </view>
      <view class="battery-head" />
    </view>

    <text class="battery-text">电量: {{ battery }}%</text>

    <view class="buttons">
      <wd-button size="small" @click="chargeBattery">充电</wd-button>
      <wd-button size="small" @click="useBattery">使用</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const battery = ref(75)

const batteryColors = [
  { color: '#ff4d4f', percentage: 20 },  // 低电量红色
  { color: '#fa8c16', percentage: 40 },  // 中低电量橙色
  { color: '#52c41a', percentage: 100 }, // 正常电量绿色
]

const chargeBattery = () => {
  battery.value = Math.min(100, battery.value + 20)
}

const useBattery = () => {
  battery.value = Math.max(0, battery.value - 15)
}
</script>

```

## 进度状态

### 状态类型

通过 `status` 属性设置进度条状态：

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">成功状态:</text>
      <wd-progress :percentage="100" status="success" />
    </view>

    <view class="item">
      <text class="label">警告状态:</text>
      <wd-progress :percentage="80" status="warning" />
    </view>

    <view class="item">
      <text class="label">危险状态:</text>
      <wd-progress :percentage="50" status="danger" />
    </view>
  </view>
</template>

```

**使用说明:**

- `success` - 成功状态，显示绿色进度条和对勾图标
- `warning` - 警告状态，显示橙色进度条和警告图标
- `danger` - 危险状态，显示红色进度条和关闭图标
- 设置状态后，如果同时设置了 `hide-text`，会显示状态图标

### 状态图标

结合 `hide-text` 显示状态图标：

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">成功 (带图标):</text>
      <wd-progress :percentage="100" status="success" hide-text />
    </view>

    <view class="item">
      <text class="label">警告 (带图标):</text>
      <wd-progress :percentage="80" status="warning" hide-text />
    </view>

    <view class="item">
      <text class="label">危险 (带图标):</text>
      <wd-progress :percentage="50" status="danger" hide-text />
    </view>

    <view class="item">
      <text class="label">成功 (带文本):</text>
      <wd-progress :percentage="100" status="success" />
    </view>
  </view>
</template>

```

**使用说明:**

- 当设置 `status` 且 `hide-text` 为 `true` 时，显示状态图标
- 如果不设置 `hide-text`，则显示百分比文本，不显示图标
- 状态图标: success→对勾、warning→警告、danger→关闭

### 动态状态切换

根据进度值动态切换状态：

```vue
<template>
  <view class="demo">
    <wd-progress
      :percentage="progress"
      :status="currentStatus"
      :hide-text="progress === 100"
    />

    <view class="info">
      <text class="status-text">当前状态: {{ statusText }}</text>
    </view>

    <view class="slider">
      <wd-slider v-model="progress" :min="0" :max="100" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { ProgressStatus } from '@/wd/components/wd-progress/wd-progress.vue'

const progress = ref(30)

// 根据进度值计算状态
const currentStatus = computed<ProgressStatus | undefined>(() => {
  if (progress.value === 100) return 'success'
  if (progress.value >= 80) return 'warning'
  if (progress.value < 30) return 'danger'
  return undefined
})

const statusText = computed(() => {
  if (progress.value === 100) return '完成'
  if (progress.value >= 80) return '即将完成'
  if (progress.value < 30) return '进度较低'
  return '进行中'
})
</script>

```

## 动画效果

### 自定义动画时长

通过 `duration` 属性控制动画速度：

```vue
<template>
  <view class="demo">
    <view class="item">
      <text class="label">快速 (10ms/1%):</text>
      <wd-progress :percentage="progress" :duration="10" />
    </view>

    <view class="item">
      <text class="label">默认 (30ms/1%):</text>
      <wd-progress :percentage="progress" :duration="30" />
    </view>

    <view class="item">
      <text class="label">慢速 (100ms/1%):</text>
      <wd-progress :percentage="progress" :duration="100" />
    </view>

    <view class="buttons">
      <wd-button @click="startProgress">开始动画</wd-button>
      <wd-button @click="resetProgress">重置</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const progress = ref(0)

const startProgress = () => {
  progress.value = 100
}

const resetProgress = () => {
  progress.value = 0
}
</script>

```

**使用说明:**

- `duration` 表示进度增加 1% 所需的毫秒数
- 默认值为 30ms，即从 0% 到 100% 需要 3000ms (3秒)
- 值越小动画越快，值越大动画越慢

### 模拟加载进度

模拟文件上传或数据加载的进度效果：

```vue
<template>
  <view class="demo">
    <wd-progress
      :percentage="uploadProgress"
      :status="uploadStatus"
      :hide-text="uploadStatus === 'success'"
    />

    <view class="info">
      <text v-if="uploadStatus === 'success'" class="success-text">上传完成!</text>
      <text v-else class="progress-text">正在上传: {{ uploadProgress }}%</text>
    </view>

    <wd-button
      :disabled="isUploading"
      :loading="isUploading"
      @click="startUpload"
    >
      {{ isUploading ? '上传中...' : '开始上传' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ProgressStatus } from '@/wd/components/wd-progress/wd-progress.vue'

const uploadProgress = ref(0)
const uploadStatus = ref<ProgressStatus | undefined>(undefined)
const isUploading = ref(false)

const startUpload = () => {
  if (isUploading.value) return

  // 重置状态
  uploadProgress.value = 0
  uploadStatus.value = undefined
  isUploading.value = true

  // 模拟上传进度
  const timer = setInterval(() => {
    // 随机增加进度
    const increment = Math.floor(Math.random() * 15) + 5
    uploadProgress.value = Math.min(100, uploadProgress.value + increment)

    if (uploadProgress.value >= 100) {
      clearInterval(timer)
      uploadStatus.value = 'success'
      isUploading.value = false
    }
  }, 500)
}
</script>

```

### 步进式进度

实现步骤式进度展示：

```vue
<template>
  <view class="demo">
    <wd-progress
      :percentage="stepProgress"
      :color="stepColor"
    />

    <view class="steps">
      <view
        v-for="(step, index) in steps"
        :key="index"
        :class="['step', { active: index <= currentStep }]"
      >
        <view class="step-icon">{{ index + 1 }}</view>
        <text class="step-text">{{ step }}</text>
      </view>
    </view>

    <view class="buttons">
      <wd-button
        size="small"
        :disabled="currentStep <= 0"
        @click="prevStep"
      >
        上一步
      </wd-button>
      <wd-button
        size="small"
        type="primary"
        :disabled="currentStep >= steps.length - 1"
        @click="nextStep"
      >
        下一步
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const steps = ['基本信息', '详细资料', '实名认证', '完成注册']
const currentStep = ref(0)

const stepProgress = computed(() => {
  return ((currentStep.value + 1) / steps.length) * 100
})

const stepColor = computed(() => {
  const colors = ['#ff4d4f', '#fa8c16', '#1890ff', '#52c41a']
  return colors[currentStep.value]
})

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}
</script>

```

## 实际应用场景

### 文件上传进度

```vue
<template>
  <view class="demo">
    <view class="file-list">
      <view
        v-for="(file, index) in files"
        :key="index"
        class="file-item"
      >
        <view class="file-info">
          <wd-icon name="file" size="40rpx" color="#666" />
          <view class="file-detail">
            <text class="file-name">{{ file.name }}</text>
            <text class="file-size">{{ file.size }}</text>
          </view>
        </view>

        <view class="file-progress">
          <wd-progress
            :percentage="file.progress"
            :status="file.status"
            :hide-text="file.status === 'success'"
          />
        </view>

        <view class="file-actions">
          <wd-icon
            v-if="file.status !== 'success'"
            name="close"
            size="32rpx"
            color="#999"
            @click="removeFile(index)"
          />
          <wd-icon
            v-else
            name="check"
            size="32rpx"
            color="#52c41a"
          />
        </view>
      </view>
    </view>

    <wd-button type="primary" @click="uploadAll">
      上传全部
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ProgressStatus } from '@/wd/components/wd-progress/wd-progress.vue'

interface FileItem {
  name: string
  size: string
  progress: number
  status?: ProgressStatus
}

const files = ref<FileItem[]>([
  { name: '文档.pdf', size: '2.5MB', progress: 0 },
  { name: '图片.jpg', size: '1.2MB', progress: 0 },
  { name: '视频.mp4', size: '15.8MB', progress: 0 },
])

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const uploadAll = () => {
  files.value.forEach((file, index) => {
    if (file.status === 'success') return

    // 模拟上传
    const timer = setInterval(() => {
      file.progress += Math.floor(Math.random() * 20) + 10

      if (file.progress >= 100) {
        file.progress = 100
        file.status = 'success'
        clearInterval(timer)
      }
    }, 300 + index * 100) // 错开上传时间
  })
}
</script>

```

### 任务完成度

```vue
<template>
  <view class="demo">
    <view class="task-card">
      <view class="task-header">
        <text class="task-title">今日任务</text>
        <text class="task-count">{{ completedCount }}/{{ tasks.length }}</text>
      </view>

      <wd-progress
        :percentage="completionRate"
        :color="progressColor"
        :status="isAllCompleted ? 'success' : undefined"
        :hide-text="isAllCompleted"
      />

      <view class="task-list">
        <view
          v-for="(task, index) in tasks"
          :key="index"
          :class="['task-item', { completed: task.completed }]"
          @click="toggleTask(index)"
        >
          <view class="task-checkbox">
            <wd-icon
              :name="task.completed ? 'check-circle-filled' : 'circle'"
              :color="task.completed ? '#52c41a' : '#ccc'"
              size="40rpx"
            />
          </view>
          <text class="task-text">{{ task.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Task {
  text: string
  completed: boolean
}

const tasks = ref<Task[]>([
  { text: '完成晨间日报', completed: true },
  { text: '参加团队会议', completed: true },
  { text: '代码审查', completed: false },
  { text: '提交周报', completed: false },
  { text: '整理文档', completed: false },
])

const completedCount = computed(() => {
  return tasks.value.filter(t => t.completed).length
})

const completionRate = computed(() => {
  return Math.round((completedCount.value / tasks.value.length) * 100)
})

const isAllCompleted = computed(() => {
  return completedCount.value === tasks.value.length
})

const progressColor = computed(() => {
  const rate = completionRate.value
  if (rate < 30) return '#ff4d4f'
  if (rate < 60) return '#fa8c16'
  if (rate < 100) return '#1890ff'
  return '#52c41a'
})

const toggleTask = (index: number) => {
  tasks.value[index].completed = !tasks.value[index].completed
}
</script>

```

### 技能熟练度

```vue
<template>
  <view class="demo">
    <view class="skill-card">
      <text class="card-title">技能熟练度</text>

      <view
        v-for="(skill, index) in skills"
        :key="index"
        class="skill-item"
      >
        <view class="skill-header">
          <text class="skill-name">{{ skill.name }}</text>
          <text class="skill-level">{{ skill.level }}%</text>
        </view>
        <wd-progress
          :percentage="skill.level"
          :color="skill.color"
          hide-text
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Skill {
  name: string
  level: number
  color: string
}

const skills = ref<Skill[]>([
  { name: 'Vue.js', level: 90, color: '#42b883' },
  { name: 'TypeScript', level: 85, color: '#3178c6' },
  { name: 'UniApp', level: 80, color: '#2b9939' },
  { name: 'React', level: 70, color: '#61dafb' },
  { name: 'Node.js', level: 65, color: '#539e43' },
])
</script>

```

### 数据加载骨架

```vue
<template>
  <view class="demo">
    <view v-if="loading" class="loading-wrapper">
      <view class="loading-content">
        <wd-icon name="loading" size="48rpx" color="#1890ff" />
        <text class="loading-text">正在加载数据...</text>
      </view>
      <wd-progress
        :percentage="loadProgress"
        :duration="20"
      />
    </view>

    <view v-else class="data-content">
      <text class="data-text">数据加载完成!</text>
      <wd-button @click="reloadData">重新加载</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const loadProgress = ref(0)

const loadData = () => {
  loading.value = true
  loadProgress.value = 0

  // 模拟分阶段加载
  const stages = [
    { progress: 20, delay: 300 },   // 初始化
    { progress: 45, delay: 500 },   // 请求数据
    { progress: 70, delay: 400 },   // 处理数据
    { progress: 90, delay: 300 },   // 渲染准备
    { progress: 100, delay: 200 },  // 完成
  ]

  let currentStage = 0

  const runStage = () => {
    if (currentStage < stages.length) {
      const stage = stages[currentStage]
      setTimeout(() => {
        loadProgress.value = stage.progress
        currentStage++
        runStage()
      }, stage.delay)
    } else {
      setTimeout(() => {
        loading.value = false
      }, 300)
    }
  }

  runStage()
}

const reloadData = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| percentage | 进度数值，最大值100 | `number` | `0` |
| hide-text | 是否隐藏进度条上的文字 | `boolean` | `false` |
| color | 进度条颜色 | `string \| string[] \| ProgressColor[]` | - |
| duration | 进度增加1%所需毫秒数 | `number` | `30` |
| status | 进度条状态 | `'success' \| 'danger' \| 'warning'` | - |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### ProgressColor 数据结构

| 字段 | 说明 | 类型 |
|------|------|------|
| color | 颜色值 | `string` |
| percentage | 百分比阈值 | `number` |

### 类型定义

```typescript
/**
 * 进度条状态类型
 */
export type ProgressStatus = 'success' | 'danger' | 'warning'

/**
 * 进度条颜色配置接口
 */
export interface ProgressColor {
  /** 颜色值 */
  color: string
  /** 百分比阈值 */
  percentage: number
}

/**
 * 进度条组件属性接口
 */
export interface WdProgressProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 进度数值，最大值100 */
  percentage?: number
  /** 是否隐藏进度条上的文字 */
  hideText?: boolean
  /** 进度条颜色，可以是字符串、字符串数组或颜色配置数组 */
  color?: string | string[] | ProgressColor[]
  /** 进度增加1%所需毫秒数 */
  duration?: number
  /** 进度条状态 */
  status?: ProgressStatus
}
```

## 主题定制

### CSS 变量

组件提供以下 CSS 变量，可用于自定义样式：

```scss
// 进度条高度
$-progress-height: 12rpx;
// 进度条内边距
$-progress-padding: 0;
// 进度条背景色
$-progress-bg: #e8e8e8;
// 进度条颜色(默认主题色)
$-progress-color: $-color-primary;

// 标签文字颜色
$-progress-label-color: $-color-content;
// 标签文字大小
$-progress-label-fs: 24rpx;

// 图标大小
$-progress-icon-fs: 28rpx;

// 状态颜色
$-progress-danger-color: $-color-danger;
$-progress-success-color: $-color-success;
$-progress-warning-color: $-color-warning;
```

### 自定义样式示例

```vue
<template>
  <view class="demo">
    <!-- 加粗进度条 -->
    <view class="progress-thick">
      <wd-progress :percentage="60" custom-class="thick-progress" />
    </view>

    <!-- 圆角进度条 -->
    <view class="progress-rounded">
      <wd-progress :percentage="70" custom-class="rounded-progress" />
    </view>
  </view>
</template>

<style lang="scss">
// 加粗进度条
.thick-progress {
  .wd-progress__outer {
    height: 24rpx !important;
    border-radius: 12rpx;
  }

  .wd-progress__inner {
    border-radius: 12rpx;
  }
}

// 方形进度条
.rounded-progress {
  .wd-progress__outer {
    border-radius: 0;
  }

  .wd-progress__inner {
    border-radius: 0;
  }
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持，在暗黑模式下会自动应用对应样式：

```scss
// 暗黑模式下的样式
.wot-theme-dark {
  .wd-progress {
    .wd-progress__label {
      color: $-dark-color3;
    }
  }
}
```

## 最佳实践

### 1. 合理设置动画时长

根据进度变化的幅度选择合适的动画时长：

```vue
<script lang="ts" setup>
// ✅ 小幅度变化用较快的动画
<wd-progress :percentage="5" :duration="10" />

// ✅ 大幅度变化用默认或较慢的动画
<wd-progress :percentage="80" :duration="30" />

// ❌ 避免使用过长的动画时长影响体验
<wd-progress :percentage="100" :duration="500" /> // 太慢了
</script>
```

### 2. 状态与颜色配合使用

```vue
<script lang="ts" setup>
import { computed } from 'vue'

const progress = ref(30)

// ✅ 根据进度自动设置状态和颜色
const status = computed(() => {
  if (progress.value >= 100) return 'success'
  if (progress.value < 20) return 'danger'
  return undefined
})

const color = computed(() => {
  if (progress.value < 30) return '#ff4d4f'
  if (progress.value < 70) return '#1890ff'
  return '#52c41a'
})
</script>

<template>
  <wd-progress
    :percentage="progress"
    :status="status"
    :color="color"
  />
</template>
```

### 3. 处理边界值

```vue
<script lang="ts" setup>
const setProgress = (value: number) => {
  // ✅ 确保进度值在有效范围内
  progress.value = Math.max(0, Math.min(100, value))
}

// ❌ 避免设置无效值
progress.value = -10  // 控制台会报错
progress.value = 150  // 控制台会报错
</script>
```

### 4. 颜色分段配置

```vue
<script lang="ts" setup>
// ✅ 推荐: 使用对象数组精确控制分段
const colorSteps = [
  { color: '#ff4d4f', percentage: 25 },
  { color: '#fa8c16', percentage: 50 },
  { color: '#1890ff', percentage: 75 },
  { color: '#52c41a', percentage: 100 },
]

// ✅ 简单场景: 使用颜色数组
const colors = ['#ff4d4f', '#fa8c16', '#1890ff', '#52c41a']

// ❌ 避免: 混合使用不同格式
const wrongColors = [
  '#ff4d4f',
  { color: '#52c41a', percentage: 100 }
] // 会报错
</script>
```

## 常见问题

### 1. 进度条不显示动画

**问题原因:**
- duration 设置为 0
- 进度值变化太小

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 确保 duration 大于 0
<wd-progress :percentage="progress" :duration="30" />

// ✅ 确保进度值有明显变化
const updateProgress = () => {
  // 至少变化 1%
  progress.value = Math.min(100, progress.value + 1)
}
</script>
```

### 2. 颜色配置不生效

**问题原因:**
- 颜色数组格式不正确
- 颜色对象缺少必要字段

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 正确的颜色数组格式
const colors = ['#ff4d4f', '#52c41a']

// ✅ 正确的颜色对象格式
const colorSteps = [
  { color: '#ff4d4f', percentage: 50 },
  { color: '#52c41a', percentage: 100 }
]

// ❌ 错误: 缺少 percentage 字段
const wrongSteps = [
  { color: '#ff4d4f' }  // 会报错
]

// ❌ 错误: percentage 不是数字
const wrongSteps2 = [
  { color: '#ff4d4f', percentage: 'fifty' }  // 会报错
]
</script>
```

### 3. 状态图标不显示

**问题原因:**
- 没有设置 hide-text 属性
- 没有设置 status 属性

**解决方案:**

```vue
<template>
  <!-- ✅ 同时设置 status 和 hide-text 才会显示图标 -->
  <wd-progress :percentage="100" status="success" hide-text />

  <!-- 只设置 status 会显示文本 -->
  <wd-progress :percentage="100" status="success" />

  <!-- 只设置 hide-text 不会显示任何内容 -->
  <wd-progress :percentage="100" hide-text />
</template>
```

### 4. 进度值超出范围

**问题原因:**
- 设置了小于 0 或大于 100 的值

**解决方案:**

```vue
<script lang="ts" setup>
const safeSetProgress = (value: number) => {
  // ✅ 始终确保值在 0-100 范围内
  const safeValue = Math.max(0, Math.min(100, value))

  if (value !== safeValue) {
    console.warn(`Progress value ${value} is out of range, using ${safeValue}`)
  }

  progress.value = safeValue
}
</script>
```

### 5. 颜色切换不平滑

**问题原因:**
- 颜色分段阈值设置不合理
- 进度变化速度过快

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 使用渐进的颜色阈值
const smoothColors = [
  { color: '#ff4d4f', percentage: 30 },
  { color: '#fa8c16', percentage: 60 },
  { color: '#1890ff', percentage: 80 },
  { color: '#52c41a', percentage: 100 },
]

// ❌ 避免阈值跨度过大
const abruptColors = [
  { color: '#ff4d4f', percentage: 10 },
  { color: '#52c41a', percentage: 100 },  // 跨度太大
]
</script>
```

### 6. 进度条在列表中卡顿

**问题原因:**
- 列表项过多，同时渲染多个动画
- duration 设置过长

**解决方案:**

```vue
<template>
  <view v-for="(item, index) in list" :key="item.id">
    <!-- ✅ 使用较短的 duration 减少动画开销 -->
    <wd-progress
      :percentage="item.progress"
      :duration="10"
      hide-text
    />
  </view>
</template>

<script lang="ts" setup>
// ✅ 考虑使用虚拟列表或分批更新
const updateProgressBatch = () => {
  list.value.forEach((item, index) => {
    setTimeout(() => {
      item.progress = targetProgress
    }, index * 50) // 错开更新时间
  })
}
</script>
```

## 注意事项

### 1. 性能优化

- 避免在短时间内频繁更新进度值
- 列表中使用时，考虑使用 `hide-text` 减少渲染
- 大量进度条同时显示时，使用较短的 `duration`

### 2. 无障碍

- 确保进度信息有其他方式传达（如文本说明）
- 对于重要进度，考虑添加语音提示

### 3. 多端兼容

- 组件在各端表现一致
- CSS 动画在低端设备可能不够流畅，可适当减少动画时长

### 4. 数据验证

- 始终验证进度值在 0-100 范围内
- 颜色配置数组格式需保持一致（全是字符串或全是对象）
