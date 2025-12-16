# Steps 步骤条

## 介绍

Steps 步骤条组件用于引导用户按照流程完成任务或向用户展示当前状态。步骤条通过清晰的视觉反馈,帮助用户了解当前进度和剩余步骤,广泛应用于注册流程、订单跟踪、任务引导等场景。

**核心特性:**

- **多种布局** - 支持横向和纵向两种布局方式
- **状态展示** - 自动根据当前步骤显示完成、进行中、等待、错误四种状态
- **点状样式** - 提供简洁的点状步骤条样式
- **自定义图标** - 支持自定义每个步骤的图标
- **间距控制** - 可自定义步骤之间的间距
- **居中对齐** - 横向步骤条支持居中对齐
- **暗黑模式** - 自动适配暗黑主题

## 基本用法

### 横向步骤条

最基本的横向步骤条用法。

```vue
<template>
  <view class="demo">
    <wd-steps :active="active">
      <wd-step title="步骤一" />
      <wd-step title="步骤二" />
      <wd-step title="步骤三" />
      <wd-step title="步骤四" />
    </wd-steps>

    <view class="control-buttons">
      <wd-button size="small" @click="handlePrev" :disabled="active === 0">
        上一步
      </wd-button>
      <wd-button size="small" type="primary" @click="handleNext" :disabled="active === 3">
        下一步
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const active = ref(0)

const handlePrev = () => {
  if (active.value > 0) {
    active.value--
  }
}

const handleNext = () => {
  if (active.value < 3) {
    active.value++
  }
}
</script>

```

**使用说明:**
- `active` 属性设置当前激活的步骤索引,从 0 开始
- 当前步骤显示为进行中状态(蓝色)
- 已完成的步骤显示对勾图标
- 未开始的步骤显示为灰色等待状态

### 带描述的步骤条

通过 `description` 属性添加步骤描述。

```vue
<template>
  <view class="demo">
    <wd-steps :active="1">
      <wd-step title="填写信息" description="请填写您的个人信息" />
      <wd-step title="验证身份" description="验证手机号和身份证" />
      <wd-step title="完成注册" description="设置账号密码" />
    </wd-steps>
  </view>
</template>

```

**使用说明:**
- `description` 属性用于添加步骤的详细说明
- 描述文字显示在标题下方
- 描述文字颜色会根据步骤状态自动调整

### 纵向步骤条

通过 `vertical` 属性设置纵向布局。

```vue
<template>
  <view class="demo">
    <wd-steps :active="2" vertical>
      <wd-step title="订单提交" description="2024-01-01 10:30:00" />
      <wd-step title="商家接单" description="2024-01-01 10:35:00" />
      <wd-step title="配送中" description="2024-01-01 11:00:00" />
      <wd-step title="已送达" description="预计 11:30 送达" />
    </wd-steps>
  </view>
</template>

```

**使用说明:**
- 纵向步骤条适合移动端展示
- 内容区域在图标右侧显示
- 连接线变为竖线连接各步骤

### 点状步骤条

通过 `dot` 属性设置点状样式。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">横向点状</view>
      <wd-steps :active="1" dot>
        <wd-step title="步骤一" />
        <wd-step title="步骤二" />
        <wd-step title="步骤三" />
        <wd-step title="步骤四" />
      </wd-steps>
    </view>

    <view class="section">
      <view class="section-title">纵向点状</view>
      <wd-steps :active="2" dot vertical>
        <wd-step title="订单提交" description="2024-01-01 10:30" />
        <wd-step title="商家接单" description="2024-01-01 10:35" />
        <wd-step title="配送中" description="2024-01-01 11:00" />
        <wd-step title="已送达" description="预计 11:30" />
      </wd-steps>
    </view>
  </view>
</template>

```

**使用说明:**
- 点状样式更加简洁,适合信息密集的场景
- 进行中的点会有外层光圈效果
- 点状样式同时支持横向和纵向布局

### 自定义图标

通过 `icon` 属性或 `icon` 插槽自定义步骤图标。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">使用 icon 属性</view>
      <wd-steps :active="1">
        <wd-step title="登录" icon="user" />
        <wd-step title="验证" icon="security" />
        <wd-step title="完成" icon="check-circle" />
      </wd-steps>
    </view>

    <view class="section">
      <view class="section-title">使用 icon 插槽</view>
      <wd-steps :active="0">
        <wd-step title="购物车">
          <template #icon>
            <wd-icon name="shopping-cart" size="40" />
          </template>
        </wd-step>
        <wd-step title="确认订单">
          <template #icon>
            <wd-icon name="order" size="40" />
          </template>
        </wd-step>
        <wd-step title="支付">
          <template #icon>
            <wd-icon name="payment" size="40" />
          </template>
        </wd-step>
      </wd-steps>
    </view>
  </view>
</template>

```

**使用说明:**
- `icon` 属性接收图标名称字符串
- `icon` 插槽可以放置任意自定义内容
- 自定义图标会覆盖默认的数字和完成图标

### 自定义状态

通过 `status` 属性自定义单个步骤的状态。

```vue
<template>
  <view class="demo">
    <wd-steps :active="1">
      <wd-step title="步骤一" description="已完成" />
      <wd-step title="步骤二" description="进行中" />
      <wd-step title="步骤三" description="验证失败" status="error" />
      <wd-step title="步骤四" description="等待中" />
    </wd-steps>

    <view class="tip">
      步骤三设置了 status="error",显示为错误状态
    </view>
  </view>
</template>

```

**使用说明:**
- `status` 属性可选值:`finished`(完成)、`process`(进行中)、`error`(错误)、`wait`(等待)
- 自定义状态优先级高于 `active` 自动计算的状态
- 错误状态显示为红色,并使用叉号图标

### 自定义间距

通过 `space` 属性设置步骤之间的间距。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">默认间距</view>
      <wd-steps :active="1">
        <wd-step title="步骤一" />
        <wd-step title="步骤二" />
        <wd-step title="步骤三" />
      </wd-steps>
    </view>

    <view class="section">
      <view class="section-title">自定义横向间距</view>
      <wd-steps :active="1" space="200rpx">
        <wd-step title="步骤一" />
        <wd-step title="步骤二" />
        <wd-step title="步骤三" />
      </wd-steps>
    </view>

    <view class="section">
      <view class="section-title">自定义纵向间距</view>
      <wd-steps :active="2" vertical space="150rpx">
        <wd-step title="步骤一" description="描述信息" />
        <wd-step title="步骤二" description="描述信息" />
        <wd-step title="步骤三" description="描述信息" />
      </wd-steps>
    </view>
  </view>
</template>

```

**使用说明:**
- 横向步骤条 `space` 设置宽度(如 `200rpx`)
- 纵向步骤条 `space` 设置高度(如 `150rpx`)
- 不设置 `space` 时,横向步骤条会自动平均分配宽度

### 居中对齐

通过 `align-center` 属性设置横向步骤条居中对齐。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="section-title">默认左对齐</view>
      <wd-steps :active="1">
        <wd-step title="步骤一" description="描述信息" />
        <wd-step title="步骤二" description="描述信息" />
        <wd-step title="步骤三" description="描述信息" />
      </wd-steps>
    </view>

    <view class="section">
      <view class="section-title">居中对齐</view>
      <wd-steps :active="1" align-center>
        <wd-step title="步骤一" description="描述信息" />
        <wd-step title="步骤二" description="描述信息" />
        <wd-step title="步骤三" description="描述信息" />
      </wd-steps>
    </view>
  </view>
</template>

```

**使用说明:**
- `align-center` 属性仅对横向步骤条有效
- 居中对齐会调整标题和描述的文本对齐方式
- 连接线的位置也会相应调整

## 实战案例

### 案例1: 订单流程跟踪

实现电商订单的流程跟踪功能。

```vue
<template>
  <view class="order-track">
    <view class="order-header">
      <view class="order-no">订单号: {{ order.orderNo }}</view>
      <wd-tag :type="getStatusTagType(order.status)">
        {{ getStatusText(order.status) }}
      </wd-tag>
    </view>

    <wd-steps :active="order.currentStep" vertical>
      <wd-step
        v-for="(step, index) in order.steps"
        :key="index"
        :title="step.title"
        :description="step.time"
        :status="step.status"
      />
    </wd-steps>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface OrderStep {
  title: string
  time: string
  status?: 'finished' | 'process' | 'error' | 'wait'
}

interface Order {
  orderNo: string
  status: number
  currentStep: number
  steps: OrderStep[]
}

const order = ref<Order>({
  orderNo: '2024010112345',
  status: 3,
  currentStep: 2,
  steps: [
    { title: '提交订单', time: '2024-01-01 10:30:00' },
    { title: '商家接单', time: '2024-01-01 10:35:00' },
    { title: '配送中', time: '2024-01-01 11:00:00' },
    { title: '已送达', time: '预计 2024-01-01 11:30' },
  ],
})

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '待支付',
    2: '待发货',
    3: '配送中',
    4: '已完成',
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status: number) => {
  const typeMap: Record<number, any> = {
    1: 'warning',
    2: 'primary',
    3: 'info',
    4: 'success',
  }
  return typeMap[status] || 'default'
}
</script>

```

**功能说明:**
- 实时展示订单的处理进度
- 每个步骤显示操作时间
- 订单状态用标签高亮显示

### 案例2: 注册流程引导

实现用户注册的多步骤引导流程。

```vue
<template>
  <view class="register-page">
    <view class="page-header">
      <view class="page-title">用户注册</view>
    </view>

    <wd-steps :active="currentStep" align-center>
      <wd-step title="填写信息" />
      <wd-step title="验证手机" />
      <wd-step title="设置密码" />
      <wd-step title="完成注册" />
    </wd-steps>

    <view class="step-content">
      <!-- 步骤一: 填写信息 -->
      <view v-if="currentStep === 0" class="step-form">
        <view class="form-title">请填写基本信息</view>
        <wd-input v-model="formData.username" placeholder="请输入用户名" />
        <wd-input v-model="formData.email" placeholder="请输入邮箱" />
        <wd-button type="primary" block @click="handleNext">下一步</wd-button>
      </view>

      <!-- 步骤二: 验证手机 -->
      <view v-else-if="currentStep === 1" class="step-form">
        <view class="form-title">验证手机号</view>
        <wd-input v-model="formData.phone" placeholder="请输入手机号" />
        <view class="code-input">
          <wd-input v-model="formData.code" placeholder="请输入验证码" />
          <wd-button size="small" @click="handleSendCode">
            {{ codeText }}
          </wd-button>
        </view>
        <view class="button-group">
          <wd-button @click="handlePrev">上一步</wd-button>
          <wd-button type="primary" @click="handleNext">下一步</wd-button>
        </view>
      </view>

      <!-- 步骤三: 设置密码 -->
      <view v-else-if="currentStep === 2" class="step-form">
        <view class="form-title">设置账号密码</view>
        <wd-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
        />
        <wd-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请确认密码"
        />
        <view class="button-group">
          <wd-button @click="handlePrev">上一步</wd-button>
          <wd-button type="primary" @click="handleNext">完成注册</wd-button>
        </view>
      </view>

      <!-- 步骤四: 完成注册 -->
      <view v-else-if="currentStep === 3" class="step-success">
        <wd-icon name="check-circle" size="120" color="#52c41a" />
        <view class="success-title">注册成功!</view>
        <view class="success-desc">您的账号已创建成功</view>
        <wd-button type="primary" block @click="handleGoLogin">
          去登录
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/hooks/useToast'

const { showToast } = useToast()

const currentStep = ref(0)
const codeText = ref('发送验证码')

const formData = ref({
  username: '',
  email: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
})

const handleNext = () => {
  if (currentStep.value < 3) {
    // 这里应该添加表单验证
    currentStep.value++
  }
}

const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSendCode = () => {
  showToast('验证码已发送')
  let count = 60
  codeText.value = `${count}秒后重发`
  const timer = setInterval(() => {
    count--
    if (count <= 0) {
      clearInterval(timer)
      codeText.value = '发送验证码'
    } else {
      codeText.value = `${count}秒后重发`
    }
  }, 1000)
}

const handleGoLogin = () => {
  console.log('跳转到登录页')
}
</script>

```

**功能说明:**
- 多步骤表单引导用户完成注册
- 每步都有明确的操作提示
- 支持前进和后退导航
- 完成时显示成功反馈

### 案例3: 任务进度展示

实现项目任务的进度展示和管理。

```vue
<template>
  <view class="task-progress">
    <view class="task-header">
      <view class="task-title">项目开发进度</view>
      <view class="task-progress-text">{{ completedCount }}/{{ tasks.length }} 已完成</view>
    </view>

    <wd-steps :active="currentTaskIndex" vertical>
      <wd-step
        v-for="(task, index) in tasks"
        :key="index"
        :status="task.status"
      >
        <template #title>
          <view class="task-step-title">
            <text class="task-name">{{ task.name }}</text>
            <wd-tag
              v-if="task.status === 'finished'"
              type="success"
              size="small"
            >
              已完成
            </wd-tag>
            <wd-tag
              v-else-if="task.status === 'process'"
              type="primary"
              size="small"
            >
              进行中
            </wd-tag>
            <wd-tag v-else type="default" size="small" plain>
              待开始
            </wd-tag>
          </view>
        </template>
        <template #description>
          <view class="task-desc">
            <view class="task-info">
              <text class="info-label">负责人:</text>
              <text class="info-value">{{ task.owner }}</text>
            </view>
            <view class="task-info">
              <text class="info-label">预计完成:</text>
              <text class="info-value">{{ task.deadline }}</text>
            </view>
            <view v-if="task.completedTime" class="task-info">
              <text class="info-label">完成时间:</text>
              <text class="info-value">{{ task.completedTime }}</text>
            </view>
          </view>
        </template>
      </wd-step>
    </wd-steps>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Task {
  name: string
  owner: string
  deadline: string
  completedTime?: string
  status: 'finished' | 'process' | 'wait'
}

const tasks = ref<Task[]>([
  {
    name: '需求分析',
    owner: '张三',
    deadline: '2024-01-05',
    completedTime: '2024-01-05',
    status: 'finished',
  },
  {
    name: 'UI 设计',
    owner: '李四',
    deadline: '2024-01-10',
    completedTime: '2024-01-10',
    status: 'finished',
  },
  {
    name: '前端开发',
    owner: '王五',
    deadline: '2024-01-20',
    status: 'process',
  },
  {
    name: '后端开发',
    owner: '赵六',
    deadline: '2024-01-20',
    status: 'wait',
  },
  {
    name: '测试验收',
    owner: '钱七',
    deadline: '2024-01-25',
    status: 'wait',
  },
])

const currentTaskIndex = computed(() => {
  return tasks.value.findIndex((task) => task.status === 'process')
})

const completedCount = computed(() => {
  return tasks.value.filter((task) => task.status === 'finished').length
})
</script>

```

**功能说明:**
- 展示项目各阶段的任务进度
- 每个任务显示负责人和截止日期
- 已完成任务显示完成时间
- 统计整体完成进度

## API

### Steps Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| active | 当前激活的步骤索引,从 0 开始 | `number` | `0` |
| vertical | 是否为垂直方向 | `boolean` | `false` |
| dot | 是否为点状样式 | `boolean` | `false` |
| space | 步骤间距,横向为宽度,纵向为高度 | `string` | 自动计算 |
| align-center | 是否居中对齐(仅横向有效) | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点内联样式 | `string` | `''` |

### Step Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 步骤标题 | `string` | 根据状态自动生成 |
| description | 步骤描述 | `string` | `''` |
| icon | 步骤图标名称 | `string` | - |
| status | 步骤状态,可选值:`finished`、`process`、`error`、`wait` | `StepStatus` | 根据 active 自动计算 |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点内联样式 | `string` | `''` |

### Step Slots

| 插槽名 | 说明 |
|--------|------|
| icon | 自定义步骤图标 |
| title | 自定义步骤标题 |
| description | 自定义步骤描述 |

### 类型定义

```typescript
/**
 * 步骤状态类型
 */
type StepStatus = 'finished' | 'process' | 'error' | 'wait'

/**
 * 步骤条组件属性接口
 */
export interface WdStepsProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 当前激活的步骤进度 */
  active?: number
  /** 是否为垂直方向 */
  vertical?: boolean
  /** 是否为点状样式 */
  dot?: boolean
  /** 步骤条之间的间距 */
  space?: string
  /** 是否居中对齐 */
  alignCenter?: boolean
}

/**
 * 步骤组件属性接口
 */
interface WdStepProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 步骤标题 */
  title?: string
  /** 步骤描述 */
  description?: string
  /** 步骤图标 */
  icon?: IconName
  /** 步骤状态 */
  status?: StepStatus
}
```

## 主题定制

### CSS 变量

Steps 组件提供了以下 CSS 变量用于主题定制:

```scss
// 图标尺寸
$-steps-icon-size: 48rpx;              // 图标容器大小
$-steps-is-icon-width: auto;           // 自定义图标宽度
$-steps-icon-text-fs: 28rpx;           // 图标内数字字体大小
$-steps-dot-size: 16rpx;               // 点状样式圆点大小

// 颜色配置
$-steps-finished-color: #4d80f0;       // 完成状态颜色
$-steps-error-color: #fa4350;          // 错误状态颜色
$-steps-inactive-color: #c5c5c5;       // 未激活状态颜色
$-steps-line-color: #e8e8e8;           // 连接线颜色
$-steps-description-color: #999;       // 描述文字颜色

// 文字样式
$-steps-label-fs: 24rpx;               // 标签字体大小
$-steps-title-fs: 28rpx;               // 标题字体大小
$-steps-title-fw: 500;                 // 标题字重

// 暗黑模式
$-dark-background2: #1f1f1f;           // 暗黑模式背景色
$-dark-color3: #a8a8a8;                // 暗黑模式文字色
$-dark-color-gray: #6c6c6e;            // 暗黑模式灰色
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-steps :active="1" custom-class="custom-steps">
      <wd-step title="步骤一" />
      <wd-step title="步骤二" />
      <wd-step title="步骤三" />
    </wd-steps>
  </view>
</template>

```

### 暗黑模式

Steps 组件自动支持暗黑模式:

```scss
.wot-theme-dark {
  .wd-step {
    .wd-step__icon {
      background: #1f1f1f;
    }

    .wd-step__content {
      color: #a8a8a8;
    }

    .wd-step__line {
      background: #6c6c6e;
    }

    .wd-step__dot {
      background: #6c6c6e;
    }

    .wd-step__icon-outer,
    .wd-step__icon-inner {
      color: #a8a8a8;
      border-color: #6c6c6e;
    }
  }
}
```

## 最佳实践

### 1. 合理选择布局方向

```vue
<!-- ✅ 好的示例:根据内容选择布局 -->
<!-- 3-5个步骤使用横向布局 -->
<wd-steps :active="1">
  <wd-step title="步骤一" />
  <wd-step title="步骤二" />
  <wd-step title="步骤三" />
</wd-steps>

<!-- 多步骤或有详细描述使用纵向布局 -->
<wd-steps :active="2" vertical>
  <wd-step title="提交订单" description="2024-01-01 10:30" />
  <wd-step title="商家接单" description="2024-01-01 10:35" />
  <wd-step title="配送中" description="2024-01-01 11:00" />
  <wd-step title="已送达" description="预计 11:30" />
</wd-steps>

<!-- ❌ 不好的示例:步骤过多使用横向 -->
<wd-steps :active="3">
  <wd-step title="步骤一" />
  <wd-step title="步骤二" />
  <wd-step title="步骤三" />
  <wd-step title="步骤四" />
  <wd-step title="步骤五" />
  <wd-step title="步骤六" />
</wd-steps>
```

**说明:**
- 横向布局适合 3-5 个步骤的简单流程
- 纵向布局适合步骤较多或需要详细描述的场景
- 移动端优先使用纵向布局

### 2. 状态的使用场景

```vue
<!-- ✅ 好的示例:自动状态适合常规流程 -->
<wd-steps :active="currentStep">
  <wd-step title="填写信息" />
  <wd-step title="确认信息" />
  <wd-step title="完成" />
</wd-steps>

<!-- ✅ 好的示例:自定义状态适合异常情况 -->
<wd-steps :active="1">
  <wd-step title="提交订单" />
  <wd-step title="支付" status="error" description="支付失败" />
  <wd-step title="完成" />
</wd-steps>

<!-- ❌ 不好的示例:滥用自定义状态 -->
<wd-steps :active="1">
  <wd-step title="步骤一" status="finished" />
  <wd-step title="步骤二" status="process" />
  <wd-step title="步骤三" status="wait" />
</wd-steps>
```

**说明:**
- 优先使用 `active` 属性自动管理状态
- 仅在需要标记错误或特殊状态时使用 `status`
- 不要手动设置所有步骤的状态

### 3. 图标的使用原则

```vue
<!-- ✅ 好的示例:关键步骤使用有意义的图标 -->
<wd-steps :active="0">
  <wd-step title="选择商品" icon="shopping-cart" />
  <wd-step title="确认订单" icon="order" />
  <wd-step title="支付" icon="payment" />
  <wd-step title="完成" icon="check-circle" />
</wd-steps>

<!-- ✅ 好的示例:简单流程使用默认数字 -->
<wd-steps :active="1">
  <wd-step title="第一步" />
  <wd-step title="第二步" />
  <wd-step title="第三步" />
</wd-steps>

<!-- ❌ 不好的示例:图标与步骤含义不符 -->
<wd-steps :active="0">
  <wd-step title="填写信息" icon="delete" />
  <wd-step title="提交" icon="close" />
</wd-steps>
```

**说明:**
- 图标应与步骤含义相符
- 不是所有步骤都需要自定义图标
- 保持图标风格统一

### 4. 描述信息的展示

```vue
<!-- ✅ 好的示例:关键信息作为描述 -->
<wd-steps :active="1" vertical>
  <wd-step
    title="订单提交"
    description="2024-01-01 10:30:00"
  />
  <wd-step
    title="商家接单"
    description="预计5分钟内接单"
  />
</wd-steps>

<!-- ✅ 好的示例:无关键信息可不加描述 -->
<wd-steps :active="1">
  <wd-step title="填写信息" />
  <wd-step title="验证" />
  <wd-step title="完成" />
</wd-steps>

<!-- ❌ 不好的示例:描述与标题重复 -->
<wd-step
  title="填写信息"
  description="请填写信息"
/>
```

**说明:**
- 描述应提供额外的有价值信息
- 避免描述与标题重复
- 纵向布局更适合展示详细描述

## 常见问题

### 1. active 索引从几开始?

**问题原因:**
- 不清楚 active 的起始索引

**解决方案:**

```vue
<!-- ✅ 正确:active 从 0 开始 -->
<wd-steps :active="0">  <!-- 第一步 -->
  <wd-step title="步骤一" />
  <wd-step title="步骤二" />
  <wd-step title="步骤三" />
</wd-steps>

<!-- ❌ 错误:从 1 开始会导致第一步不高亮 -->
<wd-steps :active="1">  <!-- 实际上是第二步 -->
  <wd-step title="步骤一" />
  <wd-step title="步骤二" />
</wd-steps>
```

**说明:**
- `active` 属性从 0 开始计数
- `active="0"` 表示第一步为当前步骤
- `active="1"` 表示第二步为当前步骤

### 2. 横向步骤条宽度不均匀

**问题原因:**
- 没有设置 `space` 属性
- 步骤数量变化导致宽度自动调整

**解决方案:**

```vue
<!-- ✅ 方案1:使用固定间距 -->
<wd-steps :active="1" space="200rpx">
  <wd-step title="步骤一" />
  <wd-step title="步骤二" />
  <wd-step title="步骤三" />
</wd-steps>

<!-- ✅ 方案2:让步骤自动平均分配(默认) -->
<wd-steps :active="1">
  <wd-step title="步骤一" />
  <wd-step title="步骤二" />
  <wd-step title="步骤三" />
</wd-steps>
```

**说明:**
- 不设置 `space` 时,横向步骤会自动平均分配宽度
- 设置 `space` 可以固定每个步骤的宽度
- 步骤数量变化时建议使用自动平均

### 3. 纵向步骤条高度不够

**问题原因:**
- 内容较少时,纵向步骤条高度太小
- 没有设置 `space` 属性

**解决方案:**

```vue
<!-- ✅ 设置固定高度 -->
<wd-steps :active="2" vertical space="150rpx">
  <wd-step title="步骤一" description="描述" />
  <wd-step title="步骤二" description="描述" />
  <wd-step title="步骤三" description="描述" />
</wd-steps>

<!-- ✅ 或在内容区域添加最小高度 -->
<wd-steps :active="2" vertical>
  <wd-step title="步骤一">
    <template #description>
      <view style="min-height: 100rpx">
        详细描述内容
      </view>
    </template>
  </wd-step>
</wd-steps>
```

### 4. 点状样式连接线位置不对

**问题原因:**
- 点状样式的连接线位置计算与普通样式不同
- 可能是自定义样式覆盖了默认样式

**解决方案:**

```vue
<!-- ✅ 使用默认点状样式 -->
<wd-steps :active="1" dot>
  <wd-step title="步骤一" />
  <wd-step title="步骤二" />
  <wd-step title="步骤三" />
</wd-steps>

<!-- 如果需要自定义,注意保留关键样式 -->
<style>
:deep(.wd-step.is-vertical .wd-step__header.is-dot) {
  /* 不要修改这些关键定位属性 */
  top: 12rpx;
}

:deep(.wd-step.is-vertical .wd-step__header.is-dot .wd-step__line) {
  margin-left: -2rpx;
  margin-top: 0;
}
</style>
```

### 5. 自定义图标大小不统一

**问题原因:**
- 使用 icon 插槽时没有统一图标大小
- 自定义图标的尺寸与默认图标不一致

**解决方案:**

```vue
<!-- ✅ 正确:统一设置图标大小 -->
<wd-steps :active="0">
  <wd-step title="步骤一">
    <template #icon>
      <wd-icon name="check" size="40" />
    </template>
  </wd-step>
  <wd-step title="步骤二">
    <template #icon>
      <wd-icon name="user" size="40" />
    </template>
  </wd-step>
</wd-steps>

<!-- ❌ 错误:图标大小不统一 -->
<wd-steps :active="0">
  <wd-step title="步骤一">
    <template #icon>
      <wd-icon name="check" size="40" />
    </template>
  </wd-step>
  <wd-step title="步骤二">
    <template #icon>
      <wd-icon name="user" size="60" />  <!-- 尺寸不一致 -->
    </template>
  </wd-step>
</wd-steps>
```

**说明:**
- 自定义图标建议使用 40rpx 大小
- 所有自定义图标保持相同尺寸
- 可以通过 CSS 变量统一调整:`--steps-icon-size`
