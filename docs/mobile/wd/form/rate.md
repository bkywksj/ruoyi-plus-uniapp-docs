---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/rate
---

# Rate 评分

## 介绍

Rate 评分组件是一个用于快速评分操作和评分展示的交互式组件。通过直观的星级显示方式,用户可以轻松地对内容、服务或产品进行评价打分。组件不仅支持基础的点击评分功能,还提供了丰富的交互方式和自定义选项,能够满足各种评分场景的需求。

Rate 组件采用图标渲染的方式实现评分显示,默认使用星形图标,同时支持自定义任意图标。组件内部通过精确的状态计算和事件处理,实现了流畅的评分体验。无论是作为评价输入控件,还是仅用于展示已有评分,Rate 组件都能提供优秀的视觉效果和用户体验。

**核心特性:**

- **基础评分** - 支持点击评分,通过 v-model 实现双向数据绑定,自动同步评分值
- **半星评分** - 提供 allowHalf 属性支持半星评分,实现更精确的评分粒度
- **滑动评分** - 支持触摸滑动快速评分,通过手指滑动即可完成评分操作
- **只读禁用** - 提供 readonly 和 disabled 两种状态,分别用于展示和完全禁用场景
- **自定义图标** - 支持通过 icon 和 activeIcon 属性自定义未选中和选中状态的图标
- **颜色定制** - 支持自定义图标颜色,activeColor 可传入单色或渐变,甚至支持颜色数组实现分段颜色
- **灵活配置** - 可自定义评分数量、图标尺寸、图标间距等多个视觉参数
- **分段颜色** - activeColor 支持传入颜色数组,根据评分值自动切换不同颜色段,适用于优良中差等分级场景

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:1-290

## 基本用法

### 基础评分

最简单的评分用法,通过 v-model 绑定评分值。

```vue
<template>
  <view class="demo">
    <view class="demo-title">基础评分</view>
    <wd-rate v-model="score" />
    <view class="demo-text">当前评分: {{ score }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(3)
</script>

```

**使用说明:**
- 使用 `v-model` 绑定当前评分值
- 评分值为数字类型,范围为 0 到 num(默认为 5)
- 点击星星可以进行评分,点击第 n 个星星表示评 n 分
- 组件默认显示 5 个星星,可通过 num 属性自定义

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:64-65

### 只读状态

将组件设置为只读状态,用于纯展示场景。

```vue
<template>
  <view class="demo">
    <view class="demo-title">只读状态</view>
    <wd-rate v-model="score" readonly />
    <view class="demo-text">商品评分: {{ score }} 分</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(4.5)
</script>

```

**使用说明:**
- 设置 `readonly` 属性后,组件不响应点击和滑动事件
- 只读状态通常用于展示已有评分,如商品评价、用户评级等
- 只读状态下组件颜色和样式保持正常,与可编辑状态视觉上无差异
- 只读状态不会触发 change 事件

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:67

### 禁用状态

禁用评分组件,显示特殊的禁用颜色。

```vue
<template>
  <view class="demo">
    <view class="demo-title">禁用状态</view>
    <wd-rate v-model="score" disabled />
    <view class="demo-text">该评分已禁用</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(3)
</script>

```

**使用说明:**
- 设置 `disabled` 属性后,组件不可交互
- 禁用状态下,选中的星星显示灰色渐变(disabledColor)
- 禁用状态适用于评分已关闭、暂不可用等场景
- 可通过 disabledColor 属性自定义禁用颜色

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:81-82

### 自定义评分数量

通过 num 属性自定义评分的最大值。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义评分数量</view>

    <view class="demo-block">
      <view class="demo-label">3 星评分</view>
      <wd-rate v-model="score1" :num="3" />
    </view>

    <view class="demo-block">
      <view class="demo-label">5 星评分(默认)</view>
      <wd-rate v-model="score2" :num="5" />
    </view>

    <view class="demo-block">
      <view class="demo-label">10 星评分</view>
      <wd-rate v-model="score3" :num="10" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score1 = ref(2)
const score2 = ref(3)
const score3 = ref(7)
</script>

```

**使用说明:**
- `num` 属性控制评分的最大值,即显示的星星数量
- 默认值为 5,表示 5 星评分系统
- 可以设置为任意正整数,常见的有 3 星、5 星、10 星等
- 评分值的范围为 0 到 num

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:62-63

### 自定义尺寸和间距

自定义图标的尺寸和间距。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义尺寸和间距</view>

    <view class="demo-block">
      <view class="demo-label">小尺寸 (size="24", space="4")</view>
      <wd-rate v-model="score" size="24" space="4" />
    </view>

    <view class="demo-block">
      <view class="demo-label">默认尺寸 (size="32", space="8")</view>
      <wd-rate v-model="score" size="32" space="8" />
    </view>

    <view class="demo-block">
      <view class="demo-label">大尺寸 (size="48", space="12")</view>
      <wd-rate v-model="score" size="48" space="12" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(3)
</script>

```

**使用说明:**
- `size` 属性控制图标的尺寸,单位为 rpx,默认值为 32
- `space` 属性控制图标之间的间距,单位为 rpx,默认值为 8
- size 和 space 支持传入数字或字符串,会自动转换为 rpx 单位
- 建议 space 值设置为 size 的 1/4 到 1/8,保持良好的视觉比例

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:68-71

### 自定义颜色

自定义未选中和选中状态的颜色。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义颜色</view>

    <view class="demo-block">
      <view class="demo-label">红色主题</view>
      <wd-rate
        v-model="score1"
        color="#FFE0E0"
        active-color="linear-gradient(180deg, #FF6B6B 0%, #FF4757 100%)"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">绿色主题</view>
      <wd-rate
        v-model="score2"
        color="#E0FFE0"
        active-color="linear-gradient(180deg, #5FD068 0%, #2ECC71 100%)"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">蓝色主题</view>
      <wd-rate
        v-model="score3"
        color="#E0E8FF"
        active-color="linear-gradient(180deg, #4A90E2 0%, #2E5C8A 100%)"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">纯色(无渐变)</view>
      <wd-rate
        v-model="score4"
        color="#F0F0F0"
        active-color="#FF9500"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score1 = ref(3)
const score2 = ref(4)
const score3 = ref(5)
const score4 = ref(2)
</script>

```

**使用说明:**
- `color` 属性设置未选中星星的颜色,默认为 `#E8E8E8`
- `activeColor` 属性设置选中星星的颜色,默认为金黄色渐变
- activeColor 支持纯色值(如 `#FF9500`)或 CSS 渐变(如 `linear-gradient(...)`)
- 颜色通过 CSS 的 background-clip 技术应用到图标上
- 建议 color 使用浅色,activeColor 使用鲜艳颜色,保持良好对比度

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:72-75

### 自定义图标

使用不同的图标替换默认的星形图标。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义图标</view>

    <view class="demo-block">
      <view class="demo-label">爱心图标</view>
      <wd-rate
        v-model="score1"
        icon="heart"
        active-icon="heart-fill"
        active-color="linear-gradient(180deg, #FF6B9D 0%, #C44569 100%)"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">笑脸图标</view>
      <wd-rate
        v-model="score2"
        icon="smile"
        active-icon="smile-fill"
        active-color="linear-gradient(180deg, #FFA502 0%, #FF6348 100%)"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">拇指图标</view>
      <wd-rate
        v-model="score3"
        icon="thumb-up"
        active-icon="thumb-up-fill"
        active-color="linear-gradient(180deg, #4A90E2 0%, #357ABD 100%)"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score1 = ref(4)
const score2 = ref(5)
const score3 = ref(3)
</script>

```

**使用说明:**
- `icon` 属性设置未选中状态的图标,默认为 `star`
- `activeIcon` 属性设置选中状态的图标,默认为 `star-fill`
- 图标名称来自 WdIcon 组件支持的图标库
- 建议 icon 使用线框图标,activeIcon 使用填充图标,保持视觉一致性
- 可以使用任意 IconName 类型的图标,包括字体图标和 UnoCSS 图标

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:76-79

## 高级用法

### 半星评分

启用半星评分功能,实现更精确的评分粒度。

```vue
<template>
  <view class="demo">
    <view class="demo-title">半星评分</view>

    <view class="demo-block">
      <view class="demo-label">点击左半边为半星,右半边为整星</view>
      <wd-rate v-model="score" allow-half />
      <view class="demo-text">当前评分: {{ score }}</view>
    </view>

    <view class="demo-block">
      <view class="demo-label">半星展示示例</view>
      <wd-rate v-model="score1" allow-half readonly />
      <wd-rate v-model="score2" allow-half readonly />
      <wd-rate v-model="score3" allow-half readonly />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(3.5)
const score1 = ref(2.5)
const score2 = ref(3.5)
const score3 = ref(4.5)
</script>

```

**技术实现:**
- 设置 `allow-half` 属性启用半星评分功能
- 组件会在每个星星图标上覆盖一个半宽的点击区域
- 点击左半边区域评分增加 0.5,点击右半边评分增加 1
- 半星通过绝对定位和 overflow: hidden 实现视觉效果
- 评分值支持小数,如 2.5、3.5 等

**使用说明:**
- 半星评分适用于需要更精确评分的场景
- 滑动评分时也支持半星,会自动判断触摸位置
- 半星状态通过 CSS 裁剪实现,不需要额外的半星图标

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:85-86, 281-288

### 滑动评分

支持滑动手势快速评分。

```vue
<template>
  <view class="demo">
    <view class="demo-title">滑动评分</view>
    <view class="demo-desc">在星星上滑动即可快速评分</view>

    <wd-rate v-model="score" @change="handleChange" />

    <view class="demo-info">
      <view class="demo-text">当前评分: {{ score }}</view>
      <view class="demo-text">最后操作: {{ lastAction }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(0)
const lastAction = ref('未操作')

const handleChange = ({ value }: { value: number }) => {
  lastAction.value = `滑动评分至 ${value} 分`
  console.log('评分改变:', value)
}
</script>

```

**技术实现:**
- 组件通过监听 `touchmove` 事件实现滑动评分
- 在滑动过程中,实时计算触摸点位置对应的评分值
- 使用 `getRect` 获取每个星星元素的位置信息
- 根据触摸点的 clientX 坐标判断落在哪个星星上
- 如果启用了半星,还会判断触摸点在星星的左半边还是右半边
- 滑动评分同样会触发 change 事件

**使用说明:**
- 滑动评分提供了更流畅的评分体验
- 在移动端设备上,滑动比点击更自然
- 滑动评分支持半星,会根据滑动位置自动判断
- 只读和禁用状态下滑动评分不生效

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:234-253

### 监听评分变化

通过 change 事件监听评分变化。

```vue
<template>
  <view class="demo">
    <view class="demo-title">监听评分变化</view>

    <wd-rate v-model="score" @change="handleChange" />

    <view class="demo-log">
      <view class="demo-log-title">操作日志:</view>
      <view
        v-for="(log, index) in logs"
        :key="index"
        class="demo-log-item"
      >
        {{ log }}
      </view>
      <view v-if="!logs.length" class="demo-log-empty">
        暂无操作记录
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(0)
const logs = ref<string[]>([])

const handleChange = ({ value }: { value: number }) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] 评分变更为 ${value} 分`)

  // 限制日志数量
  if (logs.value.length > 5) {
    logs.value = logs.value.slice(0, 5)
  }
}
</script>

```

**技术实现:**
- 组件在评分值改变时触发 `change` 事件
- change 事件的参数为对象,包含 value 字段表示新的评分值
- 同时也会触发 `update:modelValue` 事件更新 v-model 绑定的值
- 只读和禁用状态下不会触发 change 事件

**使用说明:**
- change 事件在每次评分改变时都会触发
- 无论是点击还是滑动评分,都会触发 change 事件
- 可以在 change 事件中执行业务逻辑,如提交评分、记录日志等
- 事件参数是解构对象 `{ value: number }`,需要通过解构获取评分值

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:92-96, 227-228

### 分段颜色

根据评分值显示不同的颜色,实现优良中差分级效果。

```vue
<template>
  <view class="demo">
    <view class="demo-title">分段颜色</view>
    <view class="demo-desc">评分 ≤ 3 分显示红色,> 3 分显示绿色</view>

    <view class="demo-block">
      <wd-rate
        v-model="score"
        :active-color="['#FF6B6B', '#2ECC71']"
        @change="handleChange"
      />
      <view class="demo-text">
        当前评分: {{ score }} 分 - {{ getRatingLevel(score) }}
      </view>
    </view>

    <view class="demo-examples">
      <view class="demo-example">
        <view class="demo-label">1 分 - 差评</view>
        <wd-rate v-model="score1" :active-color="['#FF6B6B', '#2ECC71']" readonly />
      </view>

      <view class="demo-example">
        <view class="demo-label">3 分 - 中评</view>
        <wd-rate v-model="score2" :active-color="['#FF6B6B', '#2ECC71']" readonly />
      </view>

      <view class="demo-example">
        <view class="demo-label">5 分 - 好评</view>
        <wd-rate v-model="score3" :active-color="['#FF6B6B', '#2ECC71']" readonly />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score = ref(3)
const score1 = ref(1)
const score2 = ref(3)
const score3 = ref(5)

const handleChange = ({ value }: { value: number }) => {
  console.log('评分变更:', value, getRatingLevel(value))
}

const getRatingLevel = (value: number): string => {
  if (value <= 2) return '差评'
  if (value <= 3) return '中评'
  return '好评'
}
</script>

```

**技术实现:**
- `activeColor` 支持传入颜色数组,数组长度为 2
- 当 `评分值 <= 总分数 * 0.6` 时,使用 activeColor[0] 的颜色
- 当 `评分值 > 总分数 * 0.6` 时,使用 activeColor[1] 的颜色
- 例如 5 星评分,临界值为 5 * 0.6 = 3,即 ≤3 分用第一个颜色,>3 分用第二个颜色
- 如果 activeColor[1] 不存在,则都使用 activeColor[0]
- 颜色计算逻辑在 computeActiveValue 方法中实现

**使用说明:**
- 分段颜色常用于区分评分等级,如差评、中评、好评
- activeColor 数组第一个元素通常为较暗或警告色(红色、橙色)
- activeColor 数组第二个元素通常为较亮或成功色(绿色、蓝色)
- 分段颜色仍然支持渐变,可以传入 linear-gradient 字符串

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:74-75, 130-143

### 禁用颜色定制

自定义禁用状态下的星星颜色。

```vue
<template>
  <view class="demo">
    <view class="demo-title">禁用颜色定制</view>

    <view class="demo-block">
      <view class="demo-label">默认禁用颜色(灰色渐变)</view>
      <wd-rate v-model="score1" disabled />
    </view>

    <view class="demo-block">
      <view class="demo-label">自定义禁用颜色(浅蓝色)</view>
      <wd-rate
        v-model="score2"
        disabled
        disabled-color="#B0D4F1"
      />
    </view>

    <view class="demo-block">
      <view class="demo-label">自定义禁用颜色(渐变紫色)</view>
      <wd-rate
        v-model="score3"
        disabled
        disabled-color="linear-gradient(180deg, #C4A3E8 0%, #9B59B6 100%)"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const score1 = ref(3)
const score2 = ref(4)
const score3 = ref(5)
</script>

```

**技术实现:**
- 通过 `disabled-color` 属性自定义禁用状态的颜色
- 默认禁用颜色为灰色渐变: `linear-gradient(315deg, rgba(177,177,177,1) 0%, rgba(199,199,199,1) 100%)`
- 禁用颜色同样支持纯色和渐变
- 禁用状态下,选中的星星使用 disabledColor,未选中的星星使用 color

**使用说明:**
- 禁用颜色可以根据设计规范自定义
- 建议使用较浅的颜色,视觉上表示不可用状态
- 禁用颜色不影响只读状态,只读状态仍然使用 activeColor

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:82-83, 112

### 表单场景应用

在表单中使用评分组件,结合验证和提交。

```vue
<template>
  <view class="demo">
    <view class="demo-title">商品评价表单</view>

    <view class="demo-form">
      <view class="form-item">
        <view class="form-label">
          <text class="form-required">*</text>
          商品质量
        </view>
        <wd-rate v-model="formData.quality" />
        <view v-if="errors.quality" class="form-error">{{ errors.quality }}</view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="form-required">*</text>
          服务态度
        </view>
        <wd-rate v-model="formData.service" />
        <view v-if="errors.service" class="form-error">{{ errors.service }}</view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="form-required">*</text>
          物流速度
        </view>
        <wd-rate v-model="formData.logistics" allow-half />
        <view v-if="errors.logistics" class="form-error">{{ errors.logistics }}</view>
      </view>

      <view class="form-item">
        <view class="form-label">评价内容</view>
        <textarea
          v-model="formData.comment"
          class="form-textarea"
          placeholder="请输入您的评价内容"
          maxlength="200"
        />
        <view class="form-hint">{{ formData.comment.length }}/200</view>
      </view>

      <view class="form-actions">
        <button class="btn-submit" @click="handleSubmit">提交评价</button>
        <button class="btn-reset" @click="handleReset">重置</button>
      </view>
    </view>

    <view v-if="submitResult" class="demo-result">
      <view class="result-title">提交成功!</view>
      <view class="result-content">
        <view>商品质量: {{ submitResult.quality }} 分</view>
        <view>服务态度: {{ submitResult.service }} 分</view>
        <view>物流速度: {{ submitResult.logistics }} 分</view>
        <view>评价内容: {{ submitResult.comment || '无' }}</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

interface FormData {
  quality: number
  service: number
  logistics: number
  comment: string
}

const formData = reactive<FormData>({
  quality: 0,
  service: 0,
  logistics: 0,
  comment: '',
})

const errors = reactive({
  quality: '',
  service: '',
  logistics: '',
})

const submitResult = ref<FormData | null>(null)

const validateForm = (): boolean => {
  let isValid = true

  // 清空错误信息
  errors.quality = ''
  errors.service = ''
  errors.logistics = ''

  // 验证商品质量
  if (formData.quality === 0) {
    errors.quality = '请为商品质量评分'
    isValid = false
  }

  // 验证服务态度
  if (formData.service === 0) {
    errors.service = '请为服务态度评分'
    isValid = false
  }

  // 验证物流速度
  if (formData.logistics === 0) {
    errors.logistics = '请为物流速度评分'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  // 模拟提交
  submitResult.value = { ...formData }
  console.log('提交评价:', submitResult.value)
}

const handleReset = () => {
  formData.quality = 0
  formData.service = 0
  formData.logistics = 0
  formData.comment = ''
  errors.quality = ''
  errors.service = ''
  errors.logistics = ''
  submitResult.value = null
}
</script>

```

**技术实现:**
- 使用 v-model 双向绑定评分值到表单数据对象
- 在提交前进行表单验证,检查评分是否为 0
- 使用 reactive 创建响应式表单数据和错误信息对象
- 表单验证失败时显示错误提示信息
- 提交成功后展示提交结果

**使用说明:**
- Rate 组件可以很好地集成到表单中
- 建议为必填的评分项添加验证提示
- 可以结合 allow-half 实现更精确的评分
- 评分初始值为 0 表示未评分,可用于验证逻辑

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:64-65, 223-229

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前分数,支持双向绑定 | `number \| null` | `null` |
| num | 评分最大值,即星星数量 | `number` | `5` |
| readonly | 是否只读,只读状态下不响应点击和滑动 | `boolean` | `false` |
| disabled | 是否禁用,禁用状态下显示禁用颜色 | `boolean` | `false` |
| size | 图标大小,单位 rpx | `string` | `'32'` |
| space | 图标间距,单位 rpx | `string` | `'8'` |
| color | 未选中的图标颜色 | `string` | `'#E8E8E8'` |
| active-color | 选中的图标颜色,支持传入颜色数组实现分段颜色 | `string \| string[]` | `'linear-gradient(180deg, rgba(255,238,0,1) 0%,rgba(250,176,21,1) 100%)'` |
| disabled-color | 禁用状态的图标颜色 | `string` | `'linear-gradient(315deg, rgba(177,177,177,1) 0%,rgba(199,199,199,1) 100%)'` |
| icon | 未选中的图标名称 | `IconName` | `'star'` |
| active-icon | 选中的图标名称 | `IconName` | `'star-fill'` |
| allow-half | 是否允许半选 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:56-86, 99-114

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 评分值更新时触发 | `value: number` |
| change | 评分变化时触发 | `{ value: number }` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:91-96

### Slots

Rate 组件不提供插槽。

### 类型定义

```typescript
/**
 * 评分组件属性接口
 */
interface WdRateProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 评分最大值 */
  num?: number
  /** 当前分数,使用v-model进行双向绑定 */
  modelValue?: string | number | null
  /** 是否只读 */
  readonly?: boolean
  /** 图标大小 */
  size?: string
  /** 图标间距 */
  space?: string
  /** 未选中的图标颜色 */
  color?: string
  /** 选中的图标颜色,支持传颜色数组(用于分段颜色) */
  activeColor?: string | Array<string>
  /** 未选中的图标类名 */
  icon?: IconName
  /** 选中的图标类名 */
  activeIcon?: IconName
  /** 是否禁用 */
  disabled?: boolean
  /** 禁用的图标颜色 */
  disabledColor?: string
  /** 是否允许半选 */
  allowHalf?: boolean
}

/**
 * 评分组件事件接口
 */
interface WdRateEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: number]
  /** 评分变化时触发 */
  change: [{ value: number }]
}
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:56-96

## 主题定制

### CSS 变量

Rate 组件使用图标渲染,颜色通过 Props 控制,不提供 CSS 变量定制。如需自定义样式,请使用以下 Props:

- `color` - 未选中图标颜色
- `active-color` - 选中图标颜色
- `disabled-color` - 禁用图标颜色
- `size` - 图标尺寸
- `space` - 图标间距

### 自定义样式

通过 `custom-class` 和 `custom-style` 可以为组件根节点添加自定义样式。

```vue
<template>
  <wd-rate
    v-model="score"
    custom-class="my-rate"
    custom-style="margin: 20rpx 0;"
  />
</template>

<style>
.my-rate {
  padding: 10rpx;
  background-color: #F7F8FA;
  border-radius: 8rpx;
}
</style>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:57-60

## 最佳实践

### 1. 合理设置评分数量

根据应用场景选择合适的评分数量。

```vue
<!-- ✅ 推荐: 简单快速评价使用 3 星 -->
<wd-rate v-model="simpleScore" :num="3" />

<!-- ✅ 推荐: 常规评价使用 5 星 -->
<wd-rate v-model="normalScore" :num="5" />

<!-- ✅ 推荐: 专业详细评价使用 10 星 -->
<wd-rate v-model="detailScore" :num="10" />

<!-- ❌ 不推荐: 星星数量过多影响体验 -->
<wd-rate v-model="badScore" :num="20" />
```

**说明:**
- 3 星评分适用于简单的好中差评价
- 5 星评分是最常见的评分系统,适用于大多数场景
- 10 星评分适用于需要更精细评分的专业场景
- 避免星星数量过多,会增加用户的认知负担

### 2. 区分只读和禁用状态

根据不同场景正确使用 readonly 和 disabled。

```vue
<!-- ✅ 推荐: 展示已有评分使用 readonly -->
<wd-rate v-model="displayScore" readonly />

<!-- ✅ 推荐: 评分功能暂时关闭使用 disabled -->
<wd-rate v-model="closedScore" disabled />

<!-- ❌ 不推荐: 展示评分使用 disabled,颜色会变灰 -->
<wd-rate v-model="displayScore" disabled />
```

**说明:**
- readonly 用于纯展示场景,保持正常的选中颜色
- disabled 用于功能禁用场景,显示灰色表示不可用
- 两者都不响应点击和滑动,但视觉效果不同

### 3. 半星评分的使用场景

半星评分适用于需要更精确评分的场景。

```vue
<!-- ✅ 推荐: 商品评分展示使用半星 -->
<wd-rate v-model="productScore" allow-half readonly />

<!-- ✅ 推荐: 精确评价使用半星输入 -->
<wd-rate v-model="preciseScore" allow-half />

<!-- ❌ 不推荐: 简单快速评价不需要半星 -->
<wd-rate v-model="quickScore" :num="3" allow-half />
```

**说明:**
- 半星评分提供更精确的评分粒度
- 适用于展示平均分,如 4.5 分
- 对于简单的快速评价,半星可能增加操作复杂度
- 3 星评分系统通常不需要半星功能

### 4. 分段颜色的合理应用

使用分段颜色直观展示评分等级。

```vue
<!-- ✅ 推荐: 差评红色,好评绿色 -->
<wd-rate
  v-model="score"
  :active-color="['#FF6B6B', '#2ECC71']"
/>

<!-- ✅ 推荐: 单一主题色 -->
<wd-rate
  v-model="score"
  active-color="#1890FF"
/>

<!-- ❌ 不推荐: 颜色区分度不够 -->
<wd-rate
  v-model="score"
  :active-color="['#FFD700', '#FFA500']"
/>
```

**说明:**
- 分段颜色应该有明显的视觉区分度
- 第一个颜色通常表示较低评分,第二个颜色表示较高评分
- 颜色选择应符合用户认知,如红色表示差,绿色表示好
- 如果不需要分段,直接使用单一颜色即可

### 5. 表单验证的正确处理

在表单中使用评分组件时,正确处理验证逻辑。

```vue
<script setup>
import { ref } from 'vue'

const score = ref(0)  // ✅ 推荐: 初始值为 0 表示未评分
const error = ref('')

const validate = () => {
  if (score.value === 0) {
    error.value = '请进行评分'  // ✅ 推荐: 提供明确的错误提示
    return false
  }
  error.value = ''
  return true
}

// ❌ 不推荐: 使用 null 或 undefined 作为初始值
// const score = ref(null)

// ❌ 不推荐: 没有验证评分是否为 0
// const validate = () => {
//   if (!score.value) {  // 这样会把 0 也当成未评分
//     return false
//   }
//   return true
// }
</script>
```

**说明:**
- 评分初始值应该设置为 0,表示未评分状态
- 验证时明确检查评分是否为 0,而不是使用 ! 运算符
- 提供清晰的错误提示信息
- 区分 0 分(已评分但评为 0)和未评分的场景

## 常见问题

### 1. 评分值不更新

**问题原因:**
- 未使用 v-model 进行双向绑定
- 评分值类型错误,传入了字符串而不是数字
- readonly 或 disabled 状态下点击不会更新评分

**解决方案:**
```vue
<!-- ❌ 错误: 未使用 v-model -->
<wd-rate :model-value="score" />

<!-- ✅ 正确: 使用 v-model 双向绑定 -->
<wd-rate v-model="score" />

<!-- ❌ 错误: 评分值为字符串 -->
<script setup>
const score = ref('3')  // 字符串类型
</script>

<!-- ✅ 正确: 评分值为数字 -->
<script setup>
const score = ref(3)  // 数字类型
</script>

<!-- ❌ 错误: 只读状态下尝试修改评分 -->
<wd-rate v-model="score" readonly />

<!-- ✅ 正确: 可编辑状态 -->
<wd-rate v-model="score" />
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:173-176

### 2. 半星不显示

**问题原因:**
- 未设置 allow-half 属性
- 评分值不是小数(如 3 而不是 3.5)
- 评分值的小数部分不是 0.5

**解决方案:**
```vue
<!-- ❌ 错误: 未启用半星功能 -->
<wd-rate v-model="score" />  <!-- score = 3.5,但不会显示半星 -->

<!-- ✅ 正确: 启用半星功能 -->
<wd-rate v-model="score" allow-half />  <!-- score = 3.5,正常显示半星 -->

<script setup>
import { ref } from 'vue'

// ✅ 正确: 评分值为 .5 结尾的小数
const score1 = ref(3.5)  // 显示 3 个半星
const score2 = ref(4.5)  // 显示 4 个半星

// ❌ 注意: 非 .5 的小数会被忽略
const score3 = ref(3.7)  // 只显示 3 个整星,0.7 被忽略
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:184-185

### 3. 分段颜色不生效

**问题原因:**
- activeColor 传入的不是数组
- activeColor 数组为空
- 分段阈值理解错误,以为是按评分绝对值分段

**解决方案:**
```vue
<!-- ❌ 错误: activeColor 不是数组 -->
<wd-rate v-model="score" active-color="#FF6B6B" />

<!-- ✅ 正确: activeColor 传入数组 -->
<wd-rate v-model="score" :active-color="['#FF6B6B', '#2ECC71']" />

<!-- ❌ 错误: 空数组 -->
<wd-rate v-model="score" :active-color="[]" />

<!-- ✅ 正确: 至少包含一个颜色 -->
<wd-rate v-model="score" :active-color="['#FF6B6B']" />

<script setup>
// 分段规则说明:
// 5 星评分,分段阈值为 5 * 0.6 = 3
// 评分 <= 3: 使用 activeColor[0] (红色)
// 评分 > 3: 使用 activeColor[1] (绿色)

const score = ref(3)  // 3 分,显示红色
// const score = ref(4)  // 4 分,显示绿色
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:134-143, 152-154

### 4. 滑动评分不响应

**问题原因:**
- 组件处于 readonly 或 disabled 状态
- 页面有其他滚动容器干扰触摸事件
- 在某些平台上触摸事件被拦截

**解决方案:**
```vue
<!-- ❌ 错误: 只读状态不响应滑动 -->
<wd-rate v-model="score" readonly />

<!-- ❌ 错误: 禁用状态不响应滑动 -->
<wd-rate v-model="score" disabled />

<!-- ✅ 正确: 正常状态支持滑动 -->
<wd-rate v-model="score" />

<!-- ✅ 正确: 如果在滚动容器中,使用 catchtouchmove -->
<scroll-view scroll-y>
  <view @touchmove.stop>
    <wd-rate v-model="score" />
  </view>
</scroll-view>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:224, 271

### 5. 自定义图标不显示

**问题原因:**
- 图标名称拼写错误
- 使用的图标在 WdIcon 组件中不存在
- 图标颜色与背景色相同,导致看不见

**解决方案:**
```vue
<!-- ❌ 错误: 图标名称拼写错误 -->
<wd-rate v-model="score" icon="star-outline" active-icon="star" />

<!-- ✅ 正确: 使用正确的图标名称 -->
<wd-rate v-model="score" icon="star" active-icon="star-fill" />

<!-- ❌ 错误: 图标不存在 -->
<wd-rate v-model="score" icon="custom-icon" active-icon="custom-icon-fill" />

<!-- ✅ 正确: 使用 WdIcon 支持的图标 -->
<wd-rate v-model="score" icon="heart" active-icon="heart-fill" />

<!-- ❌ 错误: 图标颜色与背景色相同 -->
<view style="background: #FFD700;">
  <wd-rate
    v-model="score"
    active-color="#FFD700"  <!-- 金色图标在金色背景上看不见 -->
  />
</view>

<!-- ✅ 正确: 确保图标颜色与背景有足够对比度 -->
<view style="background: #F7F8FA;">
  <wd-rate
    v-model="score"
    active-color="#FFD700"
  />
</view>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:42, 76-79

## 注意事项

1. **评分值类型**
   - modelValue 必须是 number 类型
   - 不支持字符串类型的评分值
   - 初始值可以为 null,表示未评分

2. **半星评分限制**
   - 半星评分只支持 .5 的小数,其他小数部分会被忽略
   - 例如 3.7 会显示为 3 颗星,3.5 会显示为 3 颗半星
   - 半星通过 CSS 裁剪实现,部分平台可能有兼容性问题

3. **分段颜色规则**
   - 分段阈值为 `总分数 * 0.6`,不可自定义
   - 5 星评分的阈值为 3 分,10 星评分的阈值为 6 分
   - activeColor 数组为空会触发控制台错误

4. **只读和禁用的区别**
   - readonly 只是不响应交互,颜色保持正常
   - disabled 不仅不响应交互,还显示灰色禁用状态
   - 两种状态都不会触发 change 事件

5. **图标要求**
   - 图标必须是 WdIcon 组件支持的图标名称
   - 建议使用成对的线框和填充图标,如 star 和 star-fill
   - 自定义图标需要确保在图标库中存在

6. **颜色设置**
   - 颜色支持 CSS 颜色值、十六进制、RGB、渐变等
   - 渐变使用 CSS background 语法,如 linear-gradient(...)
   - 颜色通过 background-clip: text 应用到图标

7. **尺寸和间距**
   - size 和 space 支持数字或字符串,会自动添加 rpx 单位
   - 建议 space 为 size 的 1/4 到 1/8
   - 尺寸过大或过小都会影响视觉效果

8. **滑动评分**
   - 滑动评分在所有移动端平台都支持
   - 滑动时会实时更新评分值和触发 change 事件
   - 在滚动容器中可能需要阻止事件冒泡

9. **事件触发时机**
   - change 事件在评分值改变时立即触发
   - 点击和滑动都会触发 change 事件
   - update:modelValue 事件与 change 事件同时触发

10. **表单集成**
    - 可以直接在表单中使用,通过 v-model 绑定
    - 初始值为 0 表示未评分,用于表单验证
    - 验证时注意区分 0 分和未评分

11. **性能优化**
    - 避免在列表中渲染大量 Rate 组件
    - 列表展示评分时建议使用只读状态
    - 不需要交互的评分展示可以考虑使用图片替代

12. **平台兼容性**
    - 组件在 H5、小程序、App 等平台都支持
    - 滑动评分在小程序中需要注意触摸事件兼容性
    - 渐变颜色在某些旧版本小程序可能不支持

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-rate/wd-rate.vue:1-290
