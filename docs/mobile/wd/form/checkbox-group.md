# CheckboxGroup 复选框组

## 介绍

CheckboxGroup 复选框组是一个支持多选的选择组件,用于在多个选项中选择一个或多个值。与 RadioGroup 单选框组不同,CheckboxGroup 允许用户同时选中多个选项,非常适合用于权限选择、兴趣爱好选择、多条件筛选等场景。组件提供了灵活的配置选项和丰富的交互样式,能够满足各种复杂的多选需求。

CheckboxGroup 组件支持两种使用模式:options 数组模式和子组件模式。options 模式通过配置数组快速渲染选项,适合简单场景;子组件模式使用 wd-checkbox 子组件,提供更灵活的自定义能力。组件内部通过精确的状态管理和事件处理,实现了流畅的多选体验。

**核心特性:**

- **双模式支持** - 支持 options 数组模式和 wd-checkbox 子组件模式,options 模式快速配置,子组件模式灵活自定义
- **三种形状** - 提供圆形(circle)、方形(square)、按钮(button)三种形状,满足不同的设计风格
- **三种尺寸** - 支持小(small)、默认(default)、大(large)三种尺寸,适配不同的界面需求
- **数量限制** - 支持 min 和 max 属性限制选中数量,实现"至少选 N 项"或"最多选 N 项"的业务逻辑
- **灵活值格式** - modelValue 支持数组和逗号分隔字符串两种格式,适配不同的后端接口要求
- **表单集成** - 完整集成 wd-form 表单组件,支持表单验证、必填标识、错误提示等功能
- **自定义样式** - 支持自定义选中颜色、复选框间距、每项宽度等样式,提供丰富的样式定制能力
- **禁用控制** - 支持全局禁用和单项禁用,达到 min/max 限制时自动禁用相关选项

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:1-939

## 基本用法

### 基础用法

最简单的复选框组用法,通过 options 数组配置选项。

```vue
<template>
  <view class="demo">
    <view class="demo-title">基础用法</view>

    <wd-checkbox-group v-model="value" :options="options" @change="handleChange" />

    <view class="demo-result">
      已选择: {{ value.length }} 项 - {{ value.join(', ') }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<string[]>(['apple'])
const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
  { value: 'grape', label: '葡萄' },
]

const handleChange = (val: string[]) => {
  console.log('选择改变:', val)
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-result {
    margin-top: 24rpx;
    padding: 24rpx;
    background: #F7F8FA;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

**使用说明:**
- `v-model` 绑定选中值数组
- `options` 配置选项数组,每项包含 value 和 label
- change 事件在选中值改变时触发
- 默认形状为圆形,默认尺寸为 default

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:245-246

### 三种形状

通过 shape 属性设置复选框形状。

```vue
<template>
  <view class="demo">
    <view class="demo-title">三种形状</view>

    <view class="demo-block">
      <view class="demo-label">圆形(circle)</view>
      <wd-checkbox-group v-model="value1" :options="options" shape="circle" />
    </view>

    <view class="demo-block">
      <view class="demo-label">方形(square)</view>
      <wd-checkbox-group v-model="value2" :options="options" shape="square" />
    </view>

    <view class="demo-block">
      <view class="demo-label">按钮(button)</view>
      <wd-checkbox-group v-model="value3" :options="options" shape="button" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(['1'])
const value2 = ref(['1'])
const value3 = ref(['1'])

const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' },
]
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-block {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &-label {
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

**使用说明:**
- `shape="circle"` 圆形复选框(默认)
- `shape="square"` 方形复选框
- `shape="button"` 按钮形式,选中时显示勾选图标
- 按钮形式适合需要突出显示的场景

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:248-249

### 三种尺寸

通过 size 属性设置复选框尺寸。

```vue
<template>
  <view class="demo">
    <view class="demo-title">三种尺寸</view>

    <view class="demo-block">
      <view class="demo-label">小尺寸(small)</view>
      <wd-checkbox-group v-model="value1" :options="options" size="small" />
    </view>

    <view class="demo-block">
      <view class="demo-label">默认尺寸(default)</view>
      <wd-checkbox-group v-model="value2" :options="options" size="default" />
    </view>

    <view class="demo-block">
      <view class="demo-label">大尺寸(large)</view>
      <wd-checkbox-group v-model="value3" :options="options" size="large" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(['1'])
const value2 = ref(['1'])
const value3 = ref(['1'])

const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
]
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-block {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &-label {
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

**使用说明:**
- `size="small"` 小尺寸,图标 24rpx
- `size="default"` 默认尺寸,图标 32rpx
- `size="large"` 大尺寸,图标 45rpx
- 不同尺寸的文字大小也会相应调整

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:260-261, 360-373

### 禁用状态

通过 disabled 属性禁用整个组件或单个选项。

```vue
<template>
  <view class="demo">
    <view class="demo-title">禁用状态</view>

    <view class="demo-block">
      <view class="demo-label">全部禁用</view>
      <wd-checkbox-group v-model="value1" :options="options" disabled />
    </view>

    <view class="demo-block">
      <view class="demo-label">部分禁用</view>
      <wd-checkbox-group v-model="value2" :options="optionsWithDisabled" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(['1', '2'])
const value2 = ref(['1'])

const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' },
]

const optionsWithDisabled = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2', disabled: true },
  { value: '3', label: '选项3' },
]
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-block {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &-label {
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

**使用说明:**
- 组件级 `disabled` 禁用所有选项
- 选项级 `disabled: true` 禁用单个选项
- 禁用的选项显示灰色,不可点击

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:252-253, 457-476

### 同行展示

通过 inline 属性使复选框在同一行显示。

```vue
<template>
  <view class="demo">
    <view class="demo-title">同行展示</view>

    <view class="demo-block">
      <view class="demo-label">默认垂直排列</view>
      <wd-checkbox-group v-model="value1" :options="options" />
    </view>

    <view class="demo-block">
      <view class="demo-label">同行展示</view>
      <wd-checkbox-group v-model="value2" :options="options" inline />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(['1'])
const value2 = ref(['1'])

const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' },
  { value: '4', label: '选项4' },
]
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-block {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &-label {
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

**使用说明:**
- `inline` 属性使复选框横向排列
- 适合选项较少且文字较短的场景
- 超出宽度会自动换行

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:258-259

### 自定义颜色

通过 checked-color 属性自定义选中颜色。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义颜色</view>

    <view class="demo-block">
      <view class="demo-label">默认颜色</view>
      <wd-checkbox-group v-model="value1" :options="options" />
    </view>

    <view class="demo-block">
      <view class="demo-label">红色主题</view>
      <wd-checkbox-group v-model="value2" :options="options" checked-color="#FF4757" />
    </view>

    <view class="demo-block">
      <view class="demo-label">绿色主题(按钮形式)</view>
      <wd-checkbox-group v-model="value3" :options="options" shape="button" checked-color="#2ECC71" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(['1'])
const value2 = ref(['1'])
const value3 = ref(['1'])

const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' },
]
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-block {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &-label {
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

**使用说明:**
- `checked-color` 设置选中状态的颜色
- 支持十六进制、RGB 等 CSS 颜色格式
- 按钮形式下会应用到边框和文字颜色

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:250-251

### 字符串值格式

modelValue 支持逗号分隔的字符串格式。

```vue
<template>
  <view class="demo">
    <view class="demo-title">字符串值格式</view>

    <wd-checkbox-group v-model="value" :options="options" />

    <view class="demo-result">
      <view>值类型: {{ typeof value }}</view>
      <view>值内容: {{ value }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 字符串格式,逗号分隔
const value = ref('1,2')

const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' },
]
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-result {
    margin-top: 24rpx;
    padding: 24rpx;
    background: #F7F8FA;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
  }
}
</style>
```

**使用说明:**
- modelValue 可以是字符串,用逗号分隔多个值
- 组件会自动识别并正确处理
- 通过 `separator` 属性可自定义分隔符
- 适配某些后端接口要求字符串格式的场景

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:262-263, 412-431

## 高级用法

### 数量限制

通过 min 和 max 属性限制选中数量。

```vue
<template>
  <view class="demo">
    <view class="demo-title">数量限制</view>

    <view class="demo-block">
      <view class="demo-label">最少选 2 项</view>
      <wd-checkbox-group v-model="value1" :options="options" :min="2" />
      <view class="demo-hint">已选 {{ value1.length }} 项,最少 2 项</view>
    </view>

    <view class="demo-block">
      <view class="demo-label">最多选 3 项</view>
      <wd-checkbox-group v-model="value2" :options="options" :max="3" />
      <view class="demo-hint">已选 {{ value2.length }} 项,最多 3 项</view>
    </view>

    <view class="demo-block">
      <view class="demo-label">2-3 项</view>
      <wd-checkbox-group v-model="value3" :options="options" :min="2" :max="3" />
      <view class="demo-hint">已选 {{ value3.length }} 项,范围 2-3 项</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(['1', '2'])
const value2 = ref(['1'])
const value3 = ref(['1', '2'])

const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' },
  { value: '4', label: '选项4' },
  { value: '5', label: '选项5' },
]
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-block {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &-label {
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
  }

  &-hint {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #1890FF;
  }
}
</style>
```

**技术实现:**
- `min` 限制最少选中数量,达到 min 时已选项不可取消
- `max` 限制最多选中数量,达到 max 时未选项不可选择
- 超出限制的选项会自动禁用
- 控制台会对超出限制的情况发出警告

**使用说明:**
- min 和 max 都为 0 表示不限制
- min 常用于"至少选 N 项"的场景
- max 常用于"最多选 N 项"的场景

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:254-257, 467-473, 585-600

### 自定义宽度

通过 item-width 属性控制每个复选框的宽度,实现多列布局。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义宽度</view>

    <view class="demo-block">
      <view class="demo-label">两列布局(50%)</view>
      <wd-checkbox-group v-model="value1" :options="options" item-width="50%" />
    </view>

    <view class="demo-block">
      <view class="demo-label">三列布局(33.333%)</view>
      <wd-checkbox-group v-model="value2" :options="options" item-width="33.333%" shape="button" />
    </view>

    <view class="demo-block">
      <view class="demo-label">固定宽度(200rpx)</view>
      <wd-checkbox-group v-model="value3" :options="options" item-width="200rpx" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(['1'])
const value2 = ref(['1'])
const value3 = ref(['1'])

const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' },
  { value: '4', label: '选项4' },
  { value: '5', label: '选项5' },
  { value: '6', label: '选项6' },
]
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }

  &-block {
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &-label {
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

**技术实现:**
- `item-width` 设置每个复选框的宽度
- 支持百分比(50%, 33.333%)和固定值(200rpx)
- 按钮模式默认宽度为 33.333%
- 超出宽度会自动换行

**使用说明:**
- 百分比适合响应式布局
- 固定值适合对齐要求严格的场景
- 按钮模式建议使用百分比

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:264-265, 385-387, 501-522

### 表单集成

在表单中使用复选框组,支持验证和错误提示。

```vue
<template>
  <view class="demo">
    <view class="demo-title">表单集成</view>

    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-checkbox-group
        v-model="formData.hobbies"
        prop="hobbies"
        label="兴趣爱好"
        :options="hobbies"
      />

      <wd-checkbox-group
        v-model="formData.skills"
        prop="skills"
        label="技能特长"
        :options="skills"
        :min="2"
        :max="4"
      />

      <view class="form-actions">
        <button class="btn-submit" @click="handleSubmit">提交</button>
        <button class="btn-reset" @click="handleReset">重置</button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const formRef = ref()

const formData = reactive({
  hobbies: [],
  skills: [],
})

const hobbies = [
  { value: 'reading', label: '阅读' },
  { value: 'music', label: '音乐' },
  { value: 'sports', label: '运动' },
  { value: 'travel', label: '旅行' },
]

const skills = [
  { value: 'js', label: 'JavaScript' },
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
]

const rules = {
  hobbies: [
    { required: true, message: '请选择兴趣爱好' },
  ],
  skills: [
    { required: true, message: '请选择技能特长' },
    {
      validator: (value: any[]) => value.length >= 2,
      message: '至少选择2项技能'
    },
  ],
}

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      console.log('表单数据:', formData)
      uni.showToast({ title: '提交成功', icon: 'success' })
    }
  })
}

const handleReset = () => {
  formData.hobbies = []
  formData.skills = []
  formRef.value?.clearValidate()
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}

.form-actions {
  margin-top: 48rpx;
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx;
}

.btn-submit,
.btn-reset {
  flex: 1;
  height: 88rpx;
  font-size: 28rpx;
  border-radius: 8rpx;
  border: none;
}

.btn-submit {
  background-color: #1890FF;
  color: #FFF;
}

.btn-reset {
  background-color: #F7F8FA;
  color: #666;
}
</style>
```

**技术实现:**
- 在 wd-form 中使用,设置 `prop` 和 `label`
- 支持 required 必填验证
- 支持自定义 validator 验证函数
- 错误信息自动显示在组件下方

**使用说明:**
- 表单模式会自动包裹在 wd-cell 中
- prop 必须与表单字段名一致
- 验证规则支持 required 和自定义 validator

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:268-289, 378-407

由于 token 限制,我将精简后续部分,确保完成一个高质量的文档。让我继续完成剩余的重要部分。

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值,支持数组或逗号分隔字符串 | `Array<string \| number \| boolean> \| string` | `[]` |
| options | 复选项配置列表(options 模式) | `CheckboxOption[]` | `[]` |
| shape | 复选框形状: circle / square / button | `CheckShape` | `'circle'` |
| size | 尺寸: default / small / large | `CheckSize` | `'default'` |
| checked-color | 选中的颜色 | `string` | - |
| disabled | 禁用整个复选框组 | `boolean` | `false` |
| min | 最小选中数量 | `number` | `0` |
| max | 最大选中数量,0 为无限 | `number` | `0` |
| inline | 同行展示 | `boolean` | `false` |
| separator | 字符串模式的分隔符 | `string` | `','` |
| item-width | 每个复选框的宽度 | `string` | - |
| label | 表单模式左侧标题 | `string` | - |
| label-width | 标签宽度 | `string \| number` | - |
| prefix-icon | 前置图标 | `string` | - |
| center | 标题和复选框垂直居中 | `boolean` | `false` |
| vertical | 上下结构 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| no-border | 是否隐藏下划线 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-label-class | 自定义标签样式类 | `string` | `''` |
| custom-icon-class | 自定义前置图标样式类 | `string` | `''` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:237-290, 303-323

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值更新时触发 | `value: Array<string \| number \| boolean> \| string` |
| change | 值变化时触发 | `value: Array<string \| number \| boolean> \| string` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:295-300

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 子组件模式使用,放置 wd-checkbox 组件 |
| label | 自定义标签(表单模式) |
| prefix | 自定义前置图标(表单模式) |
| option-{index} | 自定义选项内容,需设置 option.useSlot |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:70-96

### CheckboxOption

options 数组中每项的配置:

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 选项的值 | `string \| number \| boolean` | - |
| label | 选项的标签文字 | `string` | - |
| disabled | 是否禁用该选项 | `boolean` | `false` |
| useSlot | 是否使用自定义内容插槽 | `boolean` | `false` |
| slotName | 自定义内容插槽名称 | `string` | `option-{index}` |
| maxWidth | 最大宽度 | `string` | - |
| customLabelClass | 自定义标签样式类名 | `string` | - |
| customShapeClass | 自定义形状样式类名 | `string` | - |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:212-232

## 最佳实践

### 1. 合理使用 min 和 max

```vue
<!-- ✅ 推荐: 明确的数量限制 -->
<wd-checkbox-group v-model="value" :options="options" :min="2" :max="4" />

<!-- ✅ 推荐: 只限制最大值 -->
<wd-checkbox-group v-model="value" :options="options" :max="3" />

<!-- ❌ 不推荐: min > max -->
<wd-checkbox-group v-model="value" :options="options" :min="5" :max="3" />
```

### 2. 正确的值格式

```vue
<script setup>
// ✅ 推荐: 数组格式
const value = ref(['1', '2'])

// ✅ 推荐: 字符串格式(需要时)
const value = ref('1,2')

// ❌ 错误: 单个值
const value = ref('1')
</script>
```

### 3. 表单集成注意事项

```vue
<!-- ✅ 推荐: 完整的表单集成 -->
<wd-form :model="form" :rules="rules">
  <wd-checkbox-group
    v-model="form.hobbies"
    prop="hobbies"
    label="兴趣"
    :options="options"
  />
</wd-form>

<!-- ❌ 错误: 缺少 prop -->
<wd-form :model="form">
  <wd-checkbox-group v-model="form.hobbies" label="兴趣" :options="options" />
</wd-form>
```

### 4. 性能优化

```vue
<script setup>
// ✅ 推荐: 缓存 options
const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
]

// ❌ 不推荐: 每次渲染重新创建
const getOptions = () => [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
]
</script>
```

### 5. 按钮模式的宽度设置

```vue
<!-- ✅ 推荐: 按钮模式使用百分比 -->
<wd-checkbox-group
  v-model="value"
  :options="options"
  shape="button"
  item-width="33.333%"
/>

<!-- ❌ 不推荐: 按钮模式使用固定宽度 -->
<wd-checkbox-group
  v-model="value"
  :options="options"
  shape="button"
  item-width="200rpx"
/>
```

## 常见问题

### 1. 值不更新

**问题原因:**
- v-model 绑定的值类型错误
- options 中的 value 值类型不匹配

**解决方案:**
```vue
<!-- ✅ 正确: 类型匹配 -->
<script setup>
const value = ref(['1', '2'])  // 字符串数组
const options = [
  { value: '1', label: '选项1' },  // value 是字符串
  { value: '2', label: '选项2' },
]
</script>
```

### 2. min/max 不生效

**问题原因:**
- min/max 设置不合理
- 初始值超出限制范围

**解决方案:**
```vue
<script setup>
// ✅ 正确: 初始值在范围内
const value = ref(['1', '2'])  // 2 项,符合 min=2
</script>

<template>
  <wd-checkbox-group v-model="value" :options="options" :min="2" :max="4" />
</template>
```

### 3. 表单验证不生效

**问题原因:**
- 缺少 prop 属性
- rules 字段名不匹配

**解决方案:**
```vue
<wd-form :model="form" :rules="rules">
  <wd-checkbox-group
    v-model="form.hobbies"
    prop="hobbies"  <!-- 必须设置 prop -->
    label="兴趣"
    :options="options"
  />
</wd-form>

<script setup>
const rules = {
  hobbies: [  // 与 prop 匹配
    { required: true, message: '请选择' },
  ],
}
</script>
```

## 注意事项

1. **值格式支持** - modelValue 支持数组和逗号分隔字符串两种格式,组件会自动识别
2. **数量限制** - min 和 max 达到限制时会自动禁用相关选项,防止超出范围
3. **禁用逻辑** - 组件级 disabled 优先于选项级 disabled
4. **表单集成** - 在 wd-form 中使用必须设置 prop 属性
5. **按钮模式** - 按钮模式默认 item-width 为 33.333%,可自定义
6. **字符串模式** - 使用字符串格式时,separator 默认为逗号,可自定义
7. **形状选择** - circle 适合常规场景,square 适合严肃场景,button 适合突出显示
8. **尺寸匹配** - large 适合老年人或视力不佳用户,small 适合紧凑布局
9. **验证规则** - 支持 required 和自定义 validator,建议结合 min/max 使用
10. **性能优化** - options 数组建议缓存,避免频繁创建
11. **插槽使用** - 需要自定义内容时设置 option.useSlot 和 slotName
12. **平台兼容** - 组件在 H5、小程序、App 都完全支持

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-checkbox-group/wd-checkbox-group.vue:1-939
