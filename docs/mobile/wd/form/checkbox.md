# Checkbox 复选框

## 介绍

Checkbox 复选框组件用于在一组备选项中进行多选。复选框是表单中最常用的组件之一,允许用户从一组选项中选择多个项目。组件提供了灵活的样式定制,支持圆形、方形、按钮三种形状,以及小、中、大三种尺寸。可以单独使用实现简单的开关功能,也可以与 CheckboxGroup 组件组合使用实现复杂的多选逻辑。

组件支持完整的主题定制,包括自定义选中颜色、禁用状态样式等,能够适配各种设计需求。在与 CheckboxGroup 配合使用时,支持最大最小选择数量限制、网格布局、内联显示等高级功能。组件内部实现了智能的状态管理和事件处理,确保在各种复杂场景下都能正常工作。

**核心特性:**

- **多种形状** - 支持圆形(circle)、方形(square)、按钮(button)三种视觉样式,满足不同设计需求
- **灵活尺寸** - 提供 small、default、large 三种尺寸规格,适应不同场景
- **单独使用** - 通过 trueValue/falseValue 实现简单的布尔值切换功能
- **组合使用** - 与 CheckboxGroup 配合实现多选功能,支持 max/min 限制
- **自定义颜色** - 支持自定义选中状态的颜色,实现品牌色适配
- **禁用状态** - 支持单个或全局禁用,提供完整的禁用样式
- **内联显示** - 支持水平排列显示,节省垂直空间
- **网格布局** - 支持 itemWidth 属性实现多列网格布局
- **状态管理** - 智能的选中状态计算和冲突检测机制
- **暗黑模式** - 完整支持暗黑主题,自动适配深色背景
- **方法暴露** - 提供 toggle 方法支持外部控制选中状态
- **TypeScript 支持** - 完整的类型定义,提供优秀的开发体验

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:1-620

## 基本用法

### 基础用法

最简单的用法是单独使用复选框,通过 v-model 绑定布尔值。

```vue
<template>
  <view class="demo">
    <wd-checkbox v-model="checked">同意用户协议</wd-checkbox>
    <view class="result">选中状态: {{ checked }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checked = ref(false)
</script>

```

**使用说明:**
- 单独使用时,v-model 绑定的值默认为 true/false
- 未选中时值为 false,选中时值为 true
- 点击复选框或标签文字都可以切换状态
- 组件会自动处理选中和未选中的视觉反馈

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:153-160

### 自定义选中值

通过 trueValue 和 falseValue 可以自定义选中和未选中时的值。

```vue
<template>
  <view class="demo">
    <wd-checkbox
      v-model="value"
      :true-value="1"
      :false-value="0"
    >
      接收推送通知
    </wd-checkbox>
    <view class="result">当前值: {{ value }} (类型: {{ typeof value }})</view>

    <wd-checkbox
      v-model="status"
      true-value="active"
      false-value="inactive"
      style="margin-top: 32rpx"
    >
      启用状态
    </wd-checkbox>
    <view class="result">当前状态: {{ status }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)
const status = ref('inactive')
</script>

```

**技术实现:**
- trueValue 和 falseValue 支持 string、number、boolean 三种类型
- 单独使用时必须同时设置 trueValue 和 falseValue
- 在 CheckboxGroup 中使用时,这两个属性无效
- 组件通过对比 modelValue 与 trueValue 判断是否选中

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:81-84,117-118,153-160

### 形状变体

复选框支持三种形状:圆形(circle)、方形(square)、按钮(button)。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">圆形(默认)</view>
      <wd-checkbox v-model="checked1" shape="circle">
        圆形复选框
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">方形</view>
      <wd-checkbox v-model="checked2" shape="square">
        方形复选框
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">按钮样式</view>
      <wd-checkbox v-model="checked3" shape="button">
        按钮复选框
      </wd-checkbox>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checked1 = ref(true)
const checked2 = ref(true)
const checked3 = ref(true)
</script>

```

**形状说明:**
- **circle**: 圆形复选框,边框圆角为 50%,视觉柔和友好
- **square**: 方形复选框,边框圆角较小,视觉规整严谨
- **button**: 按钮样式,选中时带边框和背景色,适合标签选择场景
- 按钮样式的选中图标显示在文字左侧
- 不同形状可以在同一个 CheckboxGroup 中混用

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:75-76,181-183,427-443,499-546

### 尺寸规格

提供三种尺寸:small(小)、default(默认)、large(大)。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">小尺寸</view>
      <wd-checkbox v-model="checked1" size="small">
        小号复选框
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">默认尺寸</view>
      <wd-checkbox v-model="checked2" size="default">
        默认复选框
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">大尺寸</view>
      <wd-checkbox v-model="checked3" size="large">
        大号复选框
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">不同尺寸对比</view>
      <wd-checkbox v-model="checked1" size="small" style="margin-right: 32rpx">
        小号
      </wd-checkbox>
      <wd-checkbox v-model="checked2" size="default" style="margin-right: 32rpx">
        默认
      </wd-checkbox>
      <wd-checkbox v-model="checked3" size="large">
        大号
      </wd-checkbox>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checked1 = ref(true)
const checked2 = ref(true)
const checked3 = ref(true)
</script>

```

**尺寸详情:**
- **small**: 图标尺寸 24rpx,标签字号 24rpx
- **default**: 图标尺寸 32rpx,标签字号 28rpx
- **large**: 图标尺寸 45rpx,标签字号 32rpx
- 尺寸影响复选框图标、勾选图标和标签文字的大小
- 在 CheckboxGroup 中可以统一设置尺寸

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:86-87,134-138,144-147,228-231,594-617

### 禁用状态

通过 disabled 属性禁用复选框。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">基础禁用</view>
      <wd-checkbox v-model="checked1" disabled>
        未选中禁用
      </wd-checkbox>
      <wd-checkbox v-model="checked2" disabled style="margin-top: 24rpx">
        选中禁用
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">方形禁用</view>
      <wd-checkbox v-model="checked3" disabled shape="square">
        方形禁用
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">按钮禁用</view>
      <wd-checkbox v-model="checked4" disabled shape="button">
        按钮禁用
      </wd-checkbox>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checked1 = ref(false)
const checked2 = ref(true)
const checked3 = ref(true)
const checked4 = ref(true)
</script>

```

**禁用规则:**
- 禁用后复选框变为灰色,无法点击切换状态
- 禁用状态保留当前选中或未选中的视觉效果
- 在 CheckboxGroup 中,可以通过组的 disabled 全局禁用
- 单个复选框的 disabled 优先级高于组的 disabled
- disabled 可以设置为 null,此时仅受组的 disabled 控制

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:79-80,196-215,315-316,558-591

### 自定义颜色

通过 checkedColor 属性自定义选中状态的颜色。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">自定义颜色</view>
      <wd-checkbox v-model="checked1" checked-color="#ff4444">
        红色
      </wd-checkbox>
      <wd-checkbox v-model="checked2" checked-color="#00C853" style="margin-top: 24rpx">
        绿色
      </wd-checkbox>
      <wd-checkbox v-model="checked3" checked-color="#FF6D00" style="margin-top: 24rpx">
        橙色
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">方形自定义颜色</view>
      <wd-checkbox v-model="checked4" checked-color="#9C27B0" shape="square">
        紫色方形
      </wd-checkbox>
    </view>

    <view class="section">
      <view class="title">按钮自定义颜色</view>
      <wd-checkbox v-model="checked5" checked-color="#00BCD4" shape="button">
        青色按钮
      </wd-checkbox>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checked1 = ref(true)
const checked2 = ref(true)
const checked3 = ref(true)
const checked4 = ref(true)
const checked5 = ref(true)
</script>

```

**颜色定制:**
- checkedColor 支持任何有效的 CSS 颜色值
- 颜色会应用到选中状态的边框、背景和图标
- 在 CheckboxGroup 中可以统一设置颜色
- 单个复选框的 checkedColor 优先级高于组的 checkedColor
- 禁用状态下自定义颜色不生效

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:77-78,187-191,483-497,537-544

### 文字最大宽度

通过 maxWidth 限制标签文字的最大宽度,超出部分显示省略号。

```vue
<template>
  <view class="demo">
    <wd-checkbox v-model="checked1" max-width="200rpx">
      这是一段很长的文字,会被限制最大宽度并显示省略号
    </wd-checkbox>

    <wd-checkbox v-model="checked2" max-width="300rpx" style="margin-top: 24rpx">
      这段文字稍微长一些,最大宽度设置为 300rpx
    </wd-checkbox>

    <wd-checkbox v-model="checked3" style="margin-top: 24rpx">
      不限制宽度的文字,会完整显示所有内容
    </wd-checkbox>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
</script>

```

**宽度控制:**
- maxWidth 支持任何有效的 CSS 宽度值
- 常用单位: rpx、px、%、vw
- 超出宽度的文字会显示省略号(...)
- 文字内容会使用 text-overflow: ellipsis 处理
- 适用于需要固定布局宽度的场景

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:88,35-37,460-465

### 自定义样式类

提供多个样式类属性,实现精细的样式控制。

```vue
<template>
  <view class="demo">
    <wd-checkbox
      v-model="checked1"
      custom-class="custom-checkbox"
      custom-label-class="custom-label"
      custom-shape-class="custom-shape"
    >
      自定义样式复选框
    </wd-checkbox>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checked1 = ref(true)
</script>

```

**样式类说明:**
- **customClass**: 应用到根元素,用于整体样式定制
- **customLabelClass**: 应用到标签元素,控制文字样式
- **customShapeClass**: 应用到形状元素(复选框图标),控制图标样式
- **customStyle**: 应用到根元素的内联样式
- 使用 :deep() 确保样式能够穿透组件作用域

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:64-71,110-114

## 高级用法

### 与 CheckboxGroup 组合

Checkbox 通常与 CheckboxGroup 组合使用,实现多选功能。

```vue
<template>
  <view class="demo">
    <wd-checkbox-group v-model="checkedList">
      <wd-checkbox :model-value="1">选项1</wd-checkbox>
      <wd-checkbox :model-value="2">选项2</wd-checkbox>
      <wd-checkbox :model-value="3">选项3</wd-checkbox>
      <wd-checkbox :model-value="4">选项4</wd-checkbox>
    </wd-checkbox-group>

    <view class="result">
      已选中: {{ checkedList }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checkedList = ref<number[]>([1, 3])
</script>

```

**组合使用规则:**
- CheckboxGroup 的 v-model 绑定一个数组
- Checkbox 的 model-value 必须设置且唯一
- 选中时,Checkbox 的 model-value 会添加到数组中
- 取消选中时,会从数组中移除对应的值
- 在组合使用时,Checkbox 的 trueValue/falseValue 无效

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:124-125,153-160,263-271,315-331

### 内联显示

通过 CheckboxGroup 的 inline 属性实现水平排列。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">垂直排列(默认)</view>
      <wd-checkbox-group v-model="list1">
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
      </wd-checkbox-group>
    </view>

    <view class="section">
      <view class="title">水平排列</view>
      <wd-checkbox-group v-model="list2" inline>
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
      </wd-checkbox-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list1 = ref<number[]>([1])
const list2 = ref<number[]>([1, 2])
</script>

```

**内联布局:**
- inline 为 false 时,复选框垂直排列,每个占一行
- inline 为 true 时,复选框水平排列,自动换行
- 内联显示适合选项较少且文字简短的场景
- 内联模式下保留右边距,最后一个元素右边距为 0

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:220-223,548-556

### 网格布局

通过 CheckboxGroup 的 itemWidth 属性实现多列网格布局。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">两列布局</view>
      <wd-checkbox-group v-model="list1" item-width="50%">
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
        <wd-checkbox :model-value="4">选项4</wd-checkbox>
      </wd-checkbox-group>
    </view>

    <view class="section">
      <view class="title">三列布局</view>
      <wd-checkbox-group v-model="list2" item-width="33.33%" shape="button">
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
        <wd-checkbox :model-value="4">选项4</wd-checkbox>
        <wd-checkbox :model-value="5">选项5</wd-checkbox>
        <wd-checkbox :model-value="6">选项6</wd-checkbox>
      </wd-checkbox-group>
    </view>

    <view class="section">
      <view class="title">固定宽度</view>
      <wd-checkbox-group v-model="list3" item-width="200rpx" shape="button">
        <wd-checkbox :model-value="1">短</wd-checkbox>
        <wd-checkbox :model-value="2">中等长度</wd-checkbox>
        <wd-checkbox :model-value="3">很长的选项文字</wd-checkbox>
        <wd-checkbox :model-value="4">选项</wd-checkbox>
      </wd-checkbox-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list1 = ref<number[]>([1, 3])
const list2 = ref<number[]>([1, 2])
const list3 = ref<number[]>([2])
</script>

```

**网格布局特性:**
- itemWidth 支持百分比(如 50%、33.33%)和固定宽度(如 200rpx)
- 设置后复选框会自动排列成多列网格
- 按钮模式下会自动减去 padding 和 margin
- 网格布局会自动换行,添加底部间距
- 适合标签选择、筛选条件等场景

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:237-258

### 选择数量限制

通过 CheckboxGroup 的 max 和 min 属性限制选择数量。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">最多选择 2 个</view>
      <wd-checkbox-group v-model="list1" :max="2">
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
        <wd-checkbox :model-value="4">选项4</wd-checkbox>
      </wd-checkbox-group>
      <view class="tip">已选 {{ list1.length }} 个,最多 2 个</view>
    </view>

    <view class="section">
      <view class="title">至少选择 1 个</view>
      <wd-checkbox-group v-model="list2" :min="1">
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
      </wd-checkbox-group>
      <view class="tip">已选 {{ list2.length }} 个,至少 1 个</view>
    </view>

    <view class="section">
      <view class="title">选择 2-3 个</view>
      <wd-checkbox-group v-model="list3" :min="2" :max="3">
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
        <wd-checkbox :model-value="4">选项4</wd-checkbox>
        <wd-checkbox :model-value="5">选项5</wd-checkbox>
      </wd-checkbox-group>
      <view class="tip">已选 {{ list3.length }} 个,需要 2-3 个</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list1 = ref<number[]>([1])
const list2 = ref<number[]>([1])
const list3 = ref<number[]>([1, 2])
</script>

```

**限制规则:**
- 达到 max 限制时,未选中的复选框自动禁用
- 达到 min 限制时,已选中的复选框自动禁用
- 限制状态下禁用的复选框显示禁用样式
- 取消选择或选择其他项后,禁用状态自动解除
- min 和 max 可以单独使用或组合使用

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:196-215

### 统一配置

通过 CheckboxGroup 统一配置所有子复选框的属性。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">统一形状和尺寸</view>
      <wd-checkbox-group
        v-model="list1"
        shape="square"
        size="large"
      >
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
      </wd-checkbox-group>
    </view>

    <view class="section">
      <view class="title">统一颜色</view>
      <wd-checkbox-group
        v-model="list2"
        checked-color="#ff4444"
        inline
      >
        <wd-checkbox :model-value="1">红色1</wd-checkbox>
        <wd-checkbox :model-value="2">红色2</wd-checkbox>
        <wd-checkbox :model-value="3">红色3</wd-checkbox>
      </wd-checkbox-group>
    </view>

    <view class="section">
      <view class="title">全局禁用</view>
      <wd-checkbox-group
        v-model="list3"
        disabled
      >
        <wd-checkbox :model-value="1">选项1</wd-checkbox>
        <wd-checkbox :model-value="2">选项2</wd-checkbox>
        <wd-checkbox :model-value="3">选项3</wd-checkbox>
      </wd-checkbox-group>
    </view>

    <view class="section">
      <view class="title">单个覆盖全局</view>
      <wd-checkbox-group
        v-model="list4"
        shape="square"
        checked-color="#00C853"
      >
        <wd-checkbox :model-value="1">默认方形绿色</wd-checkbox>
        <wd-checkbox :model-value="2" shape="circle" checked-color="#ff4444">
          圆形红色(覆盖)
        </wd-checkbox>
        <wd-checkbox :model-value="3">默认方形绿色</wd-checkbox>
      </wd-checkbox-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const list1 = ref<number[]>([1])
const list2 = ref<number[]>([1, 2])
const list3 = ref<number[]>([1, 2])
const list4 = ref<number[]>([1, 2])
</script>

```

**配置优先级:**
- 单个 Checkbox 的属性 > CheckboxGroup 的属性
- 支持统一配置的属性: shape、size、checkedColor、disabled、inline
- 单个复选框可以通过设置自己的属性覆盖组的配置
- 灵活的配置机制适应各种复杂需求

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:181-183,187-191,196-215,228-231

### 暴露方法

Checkbox 组件暴露了 toggle 方法,可以通过 ref 调用。

```vue
<template>
  <view class="demo">
    <wd-checkbox ref="checkboxRef" v-model="checked">
      可通过方法控制
    </wd-checkbox>

    <view class="actions">
      <wd-button type="primary" size="small" @click="handleToggle">
        切换状态
      </wd-button>
      <wd-button type="success" size="small" @click="handleCheck">
        选中
      </wd-button>
      <wd-button type="warning" size="small" @click="handleUncheck">
        取消选中
      </wd-button>
    </view>

    <view class="result">当前状态: {{ checked ? '选中' : '未选中' }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CheckboxInstance } from '@/wd'

const checkboxRef = ref<CheckboxInstance>()
const checked = ref(false)

// 切换状态
const handleToggle = () => {
  checkboxRef.value?.toggle()
}

// 选中
const handleCheck = () => {
  if (!checked.value) {
    checkboxRef.value?.toggle()
  }
}

// 取消选中
const handleUncheck = () => {
  if (checked.value) {
    checkboxRef.value?.toggle()
  }
}
</script>

```

**方法说明:**
- **toggle()**: 切换当前选中状态,选中变未选中,未选中变选中
- 方法调用受 disabled 状态限制,禁用时调用无效
- 在 CheckboxGroup 中使用时,toggle 会同步更新组的值
- 适合通过程序逻辑控制复选框状态的场景

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:103-107,315-331,334-336

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 复选框绑定的值,单独使用时为 true/false 或 trueValue/falseValue,与 CheckboxGroup 组合时为 modelValue | `string \| number \| boolean` | - |
| model-value | 复选框的标识值,在 CheckboxGroup 中使用时必填且唯一 | `string \| number \| boolean` | - |
| shape | 复选框形状,可选值: `circle` `square` `button` | `CheckShape` | `circle` |
| checked-color | 选中状态的颜色,支持任何有效的 CSS 颜色值 | `string` | - |
| disabled | 是否禁用,可设置为 null 以仅受 CheckboxGroup 控制 | `boolean \| null` | `null` |
| true-value | 选中时的值,仅在单独使用时有效,需与 false-value 配合使用 | `string \| number \| boolean` | `true` |
| false-value | 未选中时的值,仅在单独使用时有效,需与 true-value 配合使用 | `string \| number \| boolean` | `false` |
| size | 复选框尺寸,可选值: `small` `default` `large` | `'small' \| 'default' \| 'large'` | `'default'` |
| max-width | 标签文字的最大宽度,超出显示省略号 | `string` | - |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点内联样式 | `string` | `''` |
| custom-label-class | 自定义标签元素样式类 | `string` | `''` |
| custom-shape-class | 自定义形状元素(复选框图标)样式类 | `string` | `''` |

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:63-89,110-119

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | v-model 绑定值变化时触发 | `value: string \| number \| boolean` |
| change | 复选框状态变化时触发,在 CheckboxGroup 中传递的是是否选中的布尔值 | `{ value: string \| number \| boolean }` |

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:94-99,320-329

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 复选框的标签文字内容 |

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:34-37

### 暴露方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| toggle | 切换当前选中状态,禁用状态下调用无效 | - | `void` |

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:103-107,315-331

### 类型定义

```typescript
import type { ComponentPublicInstance } from 'vue'

/**
 * 复选框形状类型
 */
export type CheckShape = 'circle' | 'square' | 'button'

/**
 * 复选框组件属性接口
 */
interface WdCheckboxProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义标签样式类 */
  customLabelClass?: string
  /** 自定义形状样式类 */
  customShapeClass?: string

  /** 复选框选中时的值 */
  modelValue?: string | number | boolean
  /** 复选框形状,可选值：circle / square / button */
  shape?: CheckShape
  /** 选中的颜色 */
  checkedColor?: string
  /** 禁用 */
  disabled?: boolean | null
  /** 选中值,在 checkbox-group 中使用无效,需同 false-value 一块使用 */
  trueValue?: string | number | boolean
  /** 非选中时的值,在 checkbox-group 中使用无效,需同 true-value 一块使用 */
  falseValue?: string | number | boolean
  /** 设置大小,可选值：'default' small large */
  size?: 'default' | 'small' | 'large'
  /** 文字位置最大宽度 */
  maxWidth?: string
}

/**
 * 复选框组件事件接口
 */
interface WdCheckboxEmits {
  /** v-model 更新事件 */
  'update:modelValue': [value: string | number | boolean]
  /** 值变化时触发 */
  change: [value: { value: string | number | boolean }]
}

/**
 * 复选框组件暴露的方法接口
 */
interface WdCheckboxExpose {
  /** 切换当前选中状态 */
  toggle: () => void
}

/**
 * 复选框组件实例类型
 */
export type CheckboxInstance = ComponentPublicInstance<
  WdCheckboxProps,
  WdCheckboxExpose
>
```

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:42-107,338-339

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量,可用于自定义样式:

```scss
:root {
  // 复选框尺寸
  --wd-checkbox-size: 40rpx;
  --wd-checkbox-small-size: 32rpx;
  --wd-checkbox-large-size: 52rpx;

  // 边框和圆角
  --wd-checkbox-border-color: #dcdfe6;
  --wd-checkbox-square-radius: 4rpx;

  // 背景色
  --wd-checkbox-bg: #fff;
  --wd-checkbox-disabled-check-bg: #f5f5f5;

  // 选中颜色
  --wd-checkbox-checked-color: #0066ff;
  --wd-checkbox-check-color: #fff;

  // 标签文字
  --wd-checkbox-label-margin: 16rpx;
  --wd-checkbox-label-fs: 28rpx;
  --wd-checkbox-small-label-fs: 24rpx;
  --wd-checkbox-large-label-fs: 32rpx;
  --wd-checkbox-label-color: #262626;
  --wd-checkbox-disabled-label-color: #c8c9cc;

  // 图标尺寸
  --wd-checkbox-icon-size: 32rpx;

  // 间距
  --wd-checkbox-margin: 24rpx;

  // 按钮模式
  --wd-checkbox-button-min-width: 96rpx;
  --wd-checkbox-button-height: 60rpx;
  --wd-checkbox-button-font-size: 28rpx;
  --wd-checkbox-button-border: #dcdfe6;
  --wd-checkbox-button-bg: #fff;
  --wd-checkbox-button-radius: 8rpx;
  --wd-checkbox-button-disabled-border: rgba(0, 102, 255, 0.4);
  --wd-checkbox-disabled-color: #f5f5f5;
}
```

**使用示例:**

```vue
<template>
  <view class="custom-checkbox">
    <wd-checkbox v-model="checked">自定义主题</wd-checkbox>
  </view>
</template>

<style lang="scss">
.custom-checkbox {
  --wd-checkbox-checked-color: #ff4444;
  --wd-checkbox-label-color: #333;
  --wd-checkbox-size: 48rpx;
}
</style>
```

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:342-619

### 暗黑模式

组件支持暗黑模式,通过添加 `wot-theme-dark` 类名自动切换:

```vue
<template>
  <view :class="isDark ? 'wot-theme-dark' : ''">
    <wd-checkbox v-model="checked">暗黑模式复选框</wd-checkbox>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)
const checked = ref(true)
</script>
```

**暗黑模式特性:**
- 自动适配深色背景
- 边框颜色调整为浅色
- 文字颜色自动反转
- 禁用状态也有对应的暗色样式
- 按钮模式在暗色下有特殊适配

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:348-413

## 最佳实践

### 1. 合理设置 model-value

在 CheckboxGroup 中使用时,确保每个 Checkbox 的 model-value 唯一且有意义。

```vue
<!-- ✅ 推荐: 使用有意义的值 -->
<wd-checkbox-group v-model="permissions">
  <wd-checkbox model-value="read">读取权限</wd-checkbox>
  <wd-checkbox model-value="write">写入权限</wd-checkbox>
  <wd-checkbox model-value="delete">删除权限</wd-checkbox>
</wd-checkbox-group>

<!-- ❌ 不推荐: 使用无意义的序号 -->
<wd-checkbox-group v-model="list">
  <wd-checkbox :model-value="1">读取权限</wd-checkbox>
  <wd-checkbox :model-value="2">写入权限</wd-checkbox>
  <wd-checkbox :model-value="3">删除权限</wd-checkbox>
</wd-checkbox-group>
```

**原因:**
- 有意义的值提高代码可读性
- 便于后端接口对接
- 避免硬编码数字索引
- 更容易维护和扩展

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:263-271

### 2. 正确使用 trueValue/falseValue

单独使用时,trueValue 和 falseValue 必须同时设置。

```vue
<!-- ✅ 推荐: 同时设置 -->
<wd-checkbox
  v-model="status"
  true-value="enabled"
  false-value="disabled"
>
  启用功能
</wd-checkbox>

<!-- ❌ 不推荐: 只设置一个 -->
<wd-checkbox v-model="status" true-value="enabled">
  启用功能
</wd-checkbox>
```

**原因:**
- 只设置一个时,另一个使用默认值可能导致意外行为
- 明确的值定义避免类型混淆
- 在 TypeScript 中有更好的类型推断

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:81-84,117-118,153-160

### 3. 合理使用禁用状态

根据业务逻辑灵活使用全局禁用和单个禁用。

```vue
<template>
  <!-- 全局禁用: 表单提交中 -->
  <wd-checkbox-group v-model="list" :disabled="submitting">
    <wd-checkbox :model-value="1">选项1</wd-checkbox>
    <wd-checkbox :model-value="2">选项2</wd-checkbox>
    <wd-checkbox :model-value="3">选项3</wd-checkbox>
  </wd-checkbox-group>

  <!-- 单个禁用: 特定选项不可用 -->
  <wd-checkbox-group v-model="features">
    <wd-checkbox model-value="basic">基础功能</wd-checkbox>
    <wd-checkbox model-value="advanced" :disabled="!isPremium">
      高级功能(需付费)
    </wd-checkbox>
    <wd-checkbox model-value="pro" :disabled="!isVip">
      专业功能(需VIP)
    </wd-checkbox>
  </wd-checkbox-group>
</template>
```

**技巧:**
- 全局禁用适用于临时性状态(加载、提交等)
- 单个禁用适用于永久性限制(权限、等级等)
- 使用 null 值让单个复选框仅受组控制

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:196-215

### 4. 优化大量选项的性能

当选项数量较多时,使用合理的布局和渲染策略。

```vue
<template>
  <wd-checkbox-group
    v-model="selected"
    item-width="50%"
    shape="button"
  >
    <!-- 使用 v-for 渲染大量选项 -->
    <wd-checkbox
      v-for="item in options"
      :key="item.value"
      :model-value="item.value"
    >
      {{ item.label }}
    </wd-checkbox>
  </wd-checkbox-group>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const options = ref([
  // 大量选项数据
])

const selected = ref<string[]>([])

// 使用计算属性而不是在模板中处理复杂逻辑
const selectedCount = computed(() => selected.value.length)
</script>
```

**优化建议:**
- 使用 v-for 配合 :key 渲染列表
- 避免在模板中使用复杂表达式
- 使用 computed 缓存计算结果
- 考虑虚拟列表(选项数量 > 1000)

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:237-258

### 5. 监听变化事件

根据实际需求选择监听 v-model 还是 change 事件。

```vue
<template>
  <view class="demo">
    <!-- 方式1: 监听 v-model 变化(推荐用于简单场景) -->
    <wd-checkbox v-model="checked1">
      自动保存
    </wd-checkbox>

    <!-- 方式2: 监听 change 事件(推荐用于需要执行操作的场景) -->
    <wd-checkbox
      v-model="checked2"
      @change="handleChange"
    >
      接收通知
    </wd-checkbox>

    <!-- 组合使用: 同时监听值和事件 -->
    <wd-checkbox-group v-model="permissions" @change="handlePermissionChange">
      <wd-checkbox model-value="read">读取</wd-checkbox>
      <wd-checkbox model-value="write">写入</wd-checkbox>
    </wd-checkbox-group>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const checked1 = ref(false)
const checked2 = ref(false)
const permissions = ref<string[]>([])

// 方式1: 使用 watch 监听
watch(checked1, (newValue) => {
  console.log('自动保存:', newValue)
  // 执行自动保存逻辑
})

// 方式2: 使用 change 事件
const handleChange = ({ value }: { value: boolean }) => {
  console.log('接收通知:', value)
  if (value) {
    // 开启通知
  } else {
    // 关闭通知
  }
}

// 组合使用
const handlePermissionChange = ({ value }: { value: string[] }) => {
  console.log('权限变更:', value)
  // 同步权限设置到后端
}
</script>
```

**选择建议:**
- 简单的状态同步: 使用 v-model + watch
- 需要执行异步操作: 使用 change 事件
- 需要阻止状态变化: 在 change 事件中处理
- CheckboxGroup 中: 监听组的 change 事件更合理

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:315-331

## 常见问题

### 1. 为什么 Checkbox 的值没有更新?

**问题原因:**
- 在 CheckboxGroup 中使用时,忘记设置 model-value
- model-value 的值在多个 Checkbox 中重复
- v-model 绑定的初始值类型与 model-value 不匹配

**解决方案:**

```vue
<!-- ❌ 错误: 没有设置 model-value -->
<wd-checkbox-group v-model="list">
  <wd-checkbox>选项1</wd-checkbox>
  <wd-checkbox>选项2</wd-checkbox>
</wd-checkbox-group>

<!-- ✅ 正确: 设置唯一的 model-value -->
<wd-checkbox-group v-model="list">
  <wd-checkbox :model-value="1">选项1</wd-checkbox>
  <wd-checkbox :model-value="2">选项2</wd-checkbox>
</wd-checkbox-group>

<!-- ❌ 错误: model-value 重复 -->
<wd-checkbox-group v-model="list">
  <wd-checkbox :model-value="1">选项1</wd-checkbox>
  <wd-checkbox :model-value="1">选项2</wd-checkbox>
</wd-checkbox-group>

<!-- ✅ 正确: model-value 唯一 -->
<wd-checkbox-group v-model="list">
  <wd-checkbox :model-value="1">选项1</wd-checkbox>
  <wd-checkbox :model-value="2">选项2</wd-checkbox>
</wd-checkbox-group>
```

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:263-271,305-309

### 2. trueValue/falseValue 在 CheckboxGroup 中不生效?

**问题原因:**
- trueValue 和 falseValue 仅在单独使用时有效
- 在 CheckboxGroup 中使用时,这两个属性会被忽略
- CheckboxGroup 通过 model-value 管理选中状态

**解决方案:**

```vue
<!-- ✅ 单独使用: trueValue/falseValue 生效 -->
<wd-checkbox
  v-model="status"
  true-value="on"
  false-value="off"
>
  开关
</wd-checkbox>

<!-- ✅ 组合使用: 使用 model-value -->
<wd-checkbox-group v-model="list">
  <wd-checkbox model-value="item1">选项1</wd-checkbox>
  <wd-checkbox model-value="item2">选项2</wd-checkbox>
</wd-checkbox-group>

<!-- ❌ 错误: 在组中使用 trueValue/falseValue -->
<wd-checkbox-group v-model="list">
  <wd-checkbox true-value="item1">选项1</wd-checkbox>
  <wd-checkbox true-value="item2">选项2</wd-checkbox>
</wd-checkbox-group>
```

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:81-84,153-160

### 3. 如何实现全选功能?

**问题原因:**
- CheckboxGroup 没有内置全选功能
- 需要手动实现全选逻辑

**解决方案:**

```vue
<template>
  <view class="demo">
    <wd-checkbox
      v-model="checkAll"
      @change="handleCheckAll"
    >
      全选
    </wd-checkbox>

    <wd-checkbox-group v-model="checkedList" @change="handleGroupChange">
      <wd-checkbox :model-value="1">选项1</wd-checkbox>
      <wd-checkbox :model-value="2">选项2</wd-checkbox>
      <wd-checkbox :model-value="3">选项3</wd-checkbox>
      <wd-checkbox :model-value="4">选项4</wd-checkbox>
    </wd-checkbox-group>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const allOptions = [1, 2, 3, 4]
const checkedList = ref<number[]>([])

// 计算全选状态
const checkAll = computed({
  get: () => checkedList.value.length === allOptions.length,
  set: (value: boolean) => {
    checkedList.value = value ? [...allOptions] : []
  },
})

// 全选框变化
const handleCheckAll = ({ value }: { value: boolean }) => {
  checkedList.value = value ? [...allOptions] : []
}

// 组变化时更新全选状态
const handleGroupChange = () => {
  // checkAll 会自动通过 computed 更新
}
</script>
```

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:315-331

### 4. 禁用状态下颜色如何自定义?

**问题原因:**
- checkedColor 在禁用状态下不生效
- 禁用样式由 CSS 变量控制

**解决方案:**

```vue
<template>
  <view class="custom-disabled">
    <wd-checkbox v-model="checked" disabled checked-color="#ff4444">
      禁用状态
    </wd-checkbox>
  </view>
</template>

<style lang="scss">
.custom-disabled {
  // 自定义禁用状态的颜色
  --wd-checkbox-disabled-check-color: #ff999a;
  --wd-checkbox-disabled-check-bg: #ffe5e5;
  --wd-checkbox-disabled-label-color: #ff6666;
}
</style>
```

**注意事项:**
- checkedColor 仅对非禁用状态生效
- 禁用状态需要通过 CSS 变量定制
- 暗黑模式下禁用样式有单独的变量

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:558-591

### 5. 如何让复选框只读而不是禁用?

**问题原因:**
- Checkbox 没有 readonly 属性
- disabled 会显示灰色样式,不符合只读需求

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- 通过阻止事件实现只读 -->
    <wd-checkbox
      v-model="checked"
      @click.stop.prevent
    >
      只读复选框
    </wd-checkbox>

    <!-- 或者使用 disabled 但自定义样式 -->
    <view class="readonly-checkbox">
      <wd-checkbox v-model="checked" disabled>
        只读样式
      </wd-checkbox>
    </view>
  </view>
</template>

<style lang="scss">
.readonly-checkbox {
  // 让禁用状态看起来像正常状态
  --wd-checkbox-disabled-check-bg: var(--wd-checkbox-bg);
  --wd-checkbox-disabled-check-color: var(--wd-checkbox-checked-color);
  --wd-checkbox-disabled-label-color: var(--wd-checkbox-label-color);

  :deep(.wd-checkbox.is-disabled) {
    opacity: 1;
  }
}
</style>
```

**实现方式:**
1. 阻止点击事件: 视觉正常,但无法交互
2. 自定义禁用样式: 保留禁用功能,但样式正常
3. 根据场景选择合适的方式

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:315-316

## 注意事项

1. **modelValue 必须设置**: 在 CheckboxGroup 中使用时,每个 Checkbox 必须设置 model-value 属性,否则无法正确管理选中状态

2. **modelValue 唯一性**: 同一个 CheckboxGroup 中,所有 Checkbox 的 model-value 必须唯一,组件会在控制台输出重复值的错误提示

3. **trueValue/falseValue 限制**: 这两个属性仅在单独使用时有效,在 CheckboxGroup 中使用会被忽略,此时应使用 model-value

4. **shape 属性校验**: shape 属性只接受 'circle'、'square'、'button' 三个值,传入其他值会在控制台输出错误提示

5. **disabled 的三种状态**: disabled 可以是 true(禁用)、false(启用)、null(仅受 CheckboxGroup 控制),合理使用可以实现灵活的禁用逻辑

6. **max/min 限制**: 在 CheckboxGroup 中使用 max 和 min 时,达到限制后对应的复选框会自动禁用,这是正常行为

7. **自定义颜色限制**: checkedColor 仅对非禁用状态生效,禁用状态的颜色需要通过 CSS 变量定制

8. **按钮模式布局**: 使用 shape="button" 时,itemWidth 会自动减去 padding 和 margin,避免宽度计算错误

9. **内联显示注意**: 使用 inline 时,复选框会水平排列并自动换行,但不会像 itemWidth 那样严格控制宽度

10. **事件触发时机**: change 事件在值变化时触发,在 CheckboxGroup 中传递的是变化后的数组,而不是当前复选框的值

11. **toggle 方法限制**: 通过 ref 调用 toggle 方法时,如果复选框处于禁用状态,调用不会生效

12. **暗黑模式适配**: 使用暗黑模式时,需要在外层容器添加 wot-theme-dark 类名,组件会自动适配深色样式

参考: src/wd/components/wd-checkbox/wd-checkbox.vue:1-620
