# Radio 单选框

## 介绍

Radio 单选框组件用于在一组备选项中进行单选。单选框是表单中最常用的组件之一,允许用户从一组互斥的选项中选择一个项目。组件提供了灵活的样式定制,支持勾选、圆点、按钮三种形状,以及小、中、大三种尺寸。Radio 必须与 RadioGroup 组件组合使用才能实现单选功能。

组件支持完整的主题定制,包括自定义选中颜色、禁用状态样式、图标位置等,能够适配各种设计需求。在与 RadioGroup 配合使用时,支持网格布局、内联显示等高级功能。组件内部实现了智能的状态管理和事件处理,确保在各种复杂场景下都能正常工作。

**核心特性:**

- **多种形状** - 支持勾选(check)、圆点(dot)、按钮(button)三种视觉样式,满足不同设计需求
- **灵活尺寸** - 提供 small、default、large 三种尺寸规格,适应不同场景
- **图标位置** - 支持图标在左侧、右侧或自动定位,灵活控制布局
- **组合使用** - 必须与 RadioGroup 配合实现单选功能,确保互斥选择
- **自定义颜色** - 支持自定义选中状态的颜色,实现品牌色适配
- **禁用状态** - 支持单个或全局禁用,提供完整的禁用样式
- **内联显示** - 支持水平排列显示,节省垂直空间
- **网格布局** - 支持 itemWidth 属性实现多列网格布局
- **状态管理** - 智能的选中状态计算和属性继承机制
- **暗黑模式** - 完整支持暗黑主题,自动适配深色背景
- **文字控制** - 支持最大宽度限制,超出显示省略号
- **TypeScript 支持** - 完整的类型定义,提供优秀的开发体验

参考: src/wd/components/wd-radio/wd-radio.vue:1-544

## 基本用法

### 基础用法

Radio 必须与 RadioGroup 组合使用,通过 v-model 绑定选中的值。

```vue
<template>
  <view class="demo">
    <wd-radio-group v-model="value">
      <wd-radio :value="1">选项1</wd-radio>
      <wd-radio :value="2">选项2</wd-radio>
      <wd-radio :value="3">选项3</wd-radio>
    </wd-radio-group>

    <view class="result">当前选中: {{ value }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.result {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**使用说明:**
- Radio 必须放在 RadioGroup 内使用
- RadioGroup 的 v-model 绑定当前选中的值
- Radio 的 value 属性标识该选项的值
- 同一组内只能有一个 Radio 被选中
- 点击任何 Radio 都会更新 RadioGroup 的值

参考: src/wd/components/wd-radio/wd-radio.vue:81-86,205-210

### 形状变体

单选框支持三种形状:勾选(check)、圆点(dot)、按钮(button)。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">勾选样式(默认)</view>
      <wd-radio-group v-model="value1" shape="check">
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">圆点样式</view>
      <wd-radio-group v-model="value2" shape="dot">
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">按钮样式</view>
      <wd-radio-group v-model="value3" shape="button">
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref(2)
const value3 = ref(3)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**形状说明:**
- **check**: 勾选样式,选中时显示勾选图标,适合常规表单场景
- **dot**: 圆点样式,选中时圆圈内显示实心圆点,视觉简洁
- **button**: 按钮样式,选中时带边框和背景色,适合标签选择场景
- 不同形状可以在同一个 RadioGroup 中混用
- 按钮样式支持响应式尺寸调整

参考: src/wd/components/wd-radio/wd-radio.vue:49-50,92-94,331-363,365-414

### 尺寸规格

提供三种尺寸:small(小)、default(默认)、large(大)。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">小尺寸</view>
      <wd-radio-group v-model="value1" size="small" shape="dot">
        <wd-radio :value="1">小号单选框</wd-radio>
        <wd-radio :value="2">小号单选框</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">默认尺寸</view>
      <wd-radio-group v-model="value2" size="default" shape="dot">
        <wd-radio :value="1">默认单选框</wd-radio>
        <wd-radio :value="2">默认单选框</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">大尺寸</view>
      <wd-radio-group v-model="value3" size="large" shape="dot">
        <wd-radio :value="1">大号单选框</wd-radio>
        <wd-radio :value="2">大号单选框</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">按钮尺寸</view>
      <wd-radio-group v-model="value4" size="small" shape="button" inline>
        <wd-radio :value="1">小号</wd-radio>
        <wd-radio :value="2">中号</wd-radio>
        <wd-radio :value="3">大号</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref(1)
const value3 = ref(1)
const value4 = ref(2)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**尺寸详情:**
- **small**: 图标尺寸较小,标签字号 24rpx,按钮高度 52rpx
- **default**: 图标尺寸标准,标签字号 28rpx,按钮高度 60rpx
- **large**: 图标尺寸较大,标签字号 32rpx,按钮高度 68rpx
- 尺寸影响单选框图标、标签文字和按钮的大小
- 在 RadioGroup 中可以统一设置尺寸

参考: src/wd/components/wd-radio/wd-radio.vue:55-56,130-132,396-413,498-541

### 禁用状态

通过 disabled 属性禁用单选框。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">基础禁用</view>
      <wd-radio-group v-model="value1">
        <wd-radio :value="1">正常选项</wd-radio>
        <wd-radio :value="2" disabled>禁用未选中</wd-radio>
        <wd-radio :value="3" disabled>禁用已选中</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">全局禁用</view>
      <wd-radio-group v-model="value2" disabled shape="dot">
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">按钮禁用</view>
      <wd-radio-group v-model="value3" shape="button" inline>
        <wd-radio :value="1">正常</wd-radio>
        <wd-radio :value="2" disabled>禁用</wd-radio>
        <wd-radio :value="3">正常</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(3)
const value2 = ref(2)
const value3 = ref(2)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**禁用规则:**
- 禁用后单选框变为灰色,无法点击切换状态
- 禁用状态保留当前选中或未选中的视觉效果
- 在 RadioGroup 中,可以通过组的 disabled 全局禁用
- 单个单选框的 disabled 优先级高于组的 disabled
- disabled 可以设置为 null,此时仅受组的 disabled 控制

参考: src/wd/components/wd-radio/wd-radio.vue:53-54,108-113,207,460-496

### 自定义颜色

通过 checkedColor 属性自定义选中状态的颜色。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">勾选样式颜色</view>
      <wd-radio-group v-model="value1" checked-color="#ff4444" shape="check">
        <wd-radio :value="1">红色</wd-radio>
        <wd-radio :value="2">红色</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">圆点样式颜色</view>
      <wd-radio-group v-model="value2" checked-color="#00C853" shape="dot">
        <wd-radio :value="1">绿色</wd-radio>
        <wd-radio :value="2">绿色</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">按钮样式颜色</view>
      <wd-radio-group v-model="value3" checked-color="#9C27B0" shape="button" inline>
        <wd-radio :value="1">紫色</wd-radio>
        <wd-radio :value="2">紫色</wd-radio>
        <wd-radio :value="3">紫色</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">单个自定义</view>
      <wd-radio-group v-model="value4" shape="dot">
        <wd-radio :value="1" checked-color="#ff4444">红色</wd-radio>
        <wd-radio :value="2" checked-color="#00C853">绿色</wd-radio>
        <wd-radio :value="3" checked-color="#FF6D00">橙色</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref(2)
const value3 = ref(1)
const value4 = ref(2)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**颜色定制:**
- checkedColor 支持任何有效的 CSS 颜色值
- 颜色会应用到选中状态的边框、背景和图标
- 在 RadioGroup 中可以统一设置颜色
- 单个单选框的 checkedColor 优先级高于组的 checkedColor
- 禁用状态下自定义颜色不生效

参考: src/wd/components/wd-radio/wd-radio.vue:51-52,100-102,319-329,353-362,387-393

### 图标位置

通过 iconPlacement 属性控制图标在文字的左侧或右侧。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">图标在右侧(默认)</view>
      <wd-radio-group v-model="value1" shape="dot" icon-placement="right">
        <wd-radio :value="1">图标在右侧</wd-radio>
        <wd-radio :value="2">图标在右侧</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">图标在左侧</view>
      <wd-radio-group v-model="value2" shape="dot" icon-placement="left">
        <wd-radio :value="1">图标在左侧</wd-radio>
        <wd-radio :value="2">图标在左侧</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">自动定位</view>
      <wd-radio-group v-model="value3" shape="check" icon-placement="auto">
        <wd-radio :value="1">自动定位</wd-radio>
        <wd-radio :value="2">自动定位</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">单个覆盖</view>
      <wd-radio-group v-model="value4" shape="dot" icon-placement="right">
        <wd-radio :value="1">图标右侧</wd-radio>
        <wd-radio :value="2" icon-placement="left">图标左侧</wd-radio>
        <wd-radio :value="3">图标右侧</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref(2)
const value3 = ref(1)
const value4 = ref(2)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**图标位置说明:**
- **left**: 图标显示在文字左侧
- **right**: 图标显示在文字右侧(默认)
- **auto**: 自动根据形状决定位置
- 通过 CSS flex-direction 实现位置切换
- 按钮样式不受此属性影响

参考: src/wd/components/wd-radio/wd-radio.vue:61-62,138-143,416-418,451-457

### 文字最大宽度

通过 maxWidth 限制标签文字的最大宽度,超出部分显示省略号。

```vue
<template>
  <view class="demo">
    <wd-radio-group v-model="value" shape="dot">
      <wd-radio :value="1" max-width="200rpx">
        这是一段很长的文字,会被限制最大宽度并显示省略号
      </wd-radio>
      <wd-radio :value="2" max-width="300rpx">
        这段文字稍微长一些,最大宽度设置为 300rpx
      </wd-radio>
      <wd-radio :value="3">
        不限制宽度的文字,会完整显示所有内容
      </wd-radio>
    </wd-radio-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}
</style>
```

**宽度控制:**
- maxWidth 支持任何有效的 CSS 宽度值
- 常用单位: rpx、px、%、vw
- 超出宽度的文字会显示省略号(...)
- 文字内容会使用 word-break: break-all 换行
- 适用于需要固定布局宽度的场景

参考: src/wd/components/wd-radio/wd-radio.vue:59-60,10,310-317

## 高级用法

### 内联显示

通过 RadioGroup 的 inline 属性实现水平排列。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">垂直排列(默认)</view>
      <wd-radio-group v-model="value1" shape="dot">
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">水平排列</view>
      <wd-radio-group v-model="value2" shape="dot" inline>
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">按钮内联</view>
      <wd-radio-group v-model="value3" shape="button" inline>
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
        <wd-radio :value="4">选项4</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref(2)
const value3 = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**内联布局:**
- inline 为 false 时,单选框垂直排列,每个占一行
- inline 为 true 时,单选框水平排列,自动换行
- 内联显示适合选项较少且文字简短的场景
- 内联模式下保留右边距,自动调整间距

参考: src/wd/components/wd-radio/wd-radio.vue:57-58,119-124,420-458

### 网格布局

通过 RadioGroup 的 itemWidth 属性实现多列网格布局。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">两列布局</view>
      <wd-radio-group v-model="value1" item-width="50%" shape="dot">
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
        <wd-radio :value="4">选项4</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">三列布局</view>
      <wd-radio-group v-model="value2" item-width="33.33%" shape="button">
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
        <wd-radio :value="4">选项4</wd-radio>
        <wd-radio :value="5">选项5</wd-radio>
        <wd-radio :value="6">选项6</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">固定宽度</view>
      <wd-radio-group v-model="value3" item-width="200rpx" shape="button">
        <wd-radio :value="1">短</wd-radio>
        <wd-radio :value="2">中等长度</wd-radio>
        <wd-radio :value="3">很长的选项文字</wd-radio>
        <wd-radio :value="4">选项</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref(2)
const value3 = ref(3)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**网格布局特性:**
- itemWidth 支持百分比(如 50%、33.33%)和固定宽度(如 200rpx)
- 设置后单选框会自动排列成多列网格
- 按钮模式下会自动减去 margin
- 网格布局会自动换行
- 适合标签选择、筛选条件等场景

参考: src/wd/components/wd-radio/wd-radio.vue:149-169

### 统一配置

通过 RadioGroup 统一配置所有子单选框的属性。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">统一形状和尺寸</view>
      <wd-radio-group
        v-model="value1"
        shape="dot"
        size="large"
      >
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">统一颜色和布局</view>
      <wd-radio-group
        v-model="value2"
        checked-color="#ff4444"
        shape="button"
        inline
      >
        <wd-radio :value="1">红色1</wd-radio>
        <wd-radio :value="2">红色2</wd-radio>
        <wd-radio :value="3">红色3</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">全局禁用</view>
      <wd-radio-group
        v-model="value3"
        disabled
        shape="dot"
      >
        <wd-radio :value="1">选项1</wd-radio>
        <wd-radio :value="2">选项2</wd-radio>
        <wd-radio :value="3">选项3</wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">单个覆盖全局</view>
      <wd-radio-group
        v-model="value4"
        shape="dot"
        checked-color="#00C853"
      >
        <wd-radio :value="1">默认绿色</wd-radio>
        <wd-radio :value="2" checked-color="#ff4444">
          红色(覆盖)
        </wd-radio>
        <wd-radio :value="3">默认绿色</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref(2)
const value3 = ref(2)
const value4 = ref(2)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**配置优先级:**
- 单个 Radio 的属性 > RadioGroup 的属性
- 支持统一配置的属性: shape、size、checkedColor、disabled、inline、iconPlacement
- 单个单选框可以通过设置自己的属性覆盖组的配置
- 灵活的配置机制适应各种复杂需求

参考: src/wd/components/wd-radio/wd-radio.vue:92-94,100-102,108-113,119-124,130-132,138-143

### 动态选项

通过 v-for 渲染动态选项列表。

```vue
<template>
  <view class="demo">
    <view class="section">
      <view class="title">基础列表</view>
      <wd-radio-group v-model="selected" shape="dot">
        <wd-radio
          v-for="item in options"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </wd-radio>
      </wd-radio-group>
    </view>

    <view class="section">
      <view class="title">带禁用状态</view>
      <wd-radio-group v-model="selected2" shape="button" inline>
        <wd-radio
          v-for="item in optionsWithDisabled"
          :key="item.value"
          :value="item.value"
          :disabled="item.disabled"
        >
          {{ item.label }}
        </wd-radio>
      </wd-radio-group>
    </view>

    <view class="result">
      当前选中: {{ selected }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Option {
  label: string
  value: number
  disabled?: boolean
}

const options = ref<Option[]>([
  { label: '选项1', value: 1 },
  { label: '选项2', value: 2 },
  { label: '选项3', value: 3 },
  { label: '选项4', value: 4 },
])

const optionsWithDisabled = ref<Option[]>([
  { label: '普通选项', value: 1 },
  { label: '禁用选项', value: 2, disabled: true },
  { label: '普通选项', value: 3 },
  { label: '禁用选项', value: 4, disabled: true },
])

const selected = ref(1)
const selected2 = ref(1)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;
}

.section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.result {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**动态渲染说明:**
- 使用 v-for 渲染动态选项列表
- 必须为每个选项设置唯一的 :key
- 可以动态控制每个选项的属性(如 disabled)
- 适合从接口获取选项数据的场景
- 支持响应式数据更新

参考: src/wd/components/wd-radio/wd-radio.vue:47-48

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 单选框的标识值,必填且在同组内唯一 | `string \| number \| boolean` | - |
| shape | 单选框形状,可选值: `check` `dot` `button` | `RadioShape` | `'check'` |
| checked-color | 选中状态的颜色,支持任何有效的 CSS 颜色值 | `string` | - |
| disabled | 是否禁用,可设置为 null 以仅受 RadioGroup 控制 | `boolean \| null` | `null` |
| size | 单选框尺寸,可选值: `small` `default` `large` | `'small' \| 'default' \| 'large'` | `'default'` |
| inline | 是否内联显示,可设置为 null 以仅受 RadioGroup 控制 | `boolean \| null` | `null` |
| max-width | 标签文字的最大宽度,超出显示省略号 | `string` | - |
| icon-placement | 图标位置,可选值: `left` `right` `auto` | `RadioIconPlacement` | `'auto'` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点内联样式 | `string` | `''` |

参考: src/wd/components/wd-radio/wd-radio.vue:41-63,66-72

### Events

Radio 组件本身不直接触发事件,所有事件都由 RadioGroup 统一管理。请参考 RadioGroup 组件的 Events 文档。

参考: src/wd/components/wd-radio/wd-radio.vue:205-210

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 单选框的标签文字内容 |

参考: src/wd/components/wd-radio/wd-radio.vue:8-13

### 类型定义

```typescript
/**
 * 单选框形状类型
 */
export type RadioShape = 'check' | 'dot' | 'button'

/**
 * 图标位置类型
 */
export type RadioIconPlacement = 'left' | 'right' | 'auto'

/**
 * 单选框组件属性接口
 */
interface WdRadioProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 选中时的值 */
  value: string | number | boolean
  /** 单选框的形状 */
  shape?: RadioShape
  /** 选中的颜色 */
  checkedColor?: string
  /** 禁用 */
  disabled?: boolean | null
  /** 大小,可选值：'default' | 'small' | 'large' */
  size?: 'default' | 'small' | 'large'
  /** 内联 */
  inline?: boolean | null
  /** 最大宽度 */
  maxWidth?: string
  /** 图标位置,可选值: 'left' | 'right' | 'auto' */
  iconPlacement?: RadioIconPlacement
}
```

参考: src/wd/components/wd-radio/wd-radio.vue:22,41-63

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量,可用于自定义样式:

```scss
:root {
  // 单选框尺寸
  --wd-radio-size: 40rpx;
  --wd-radio-small-size: 32rpx;
  --wd-radio-large-size: 52rpx;

  // 选中颜色
  --wd-radio-checked-color: #0066ff;
  --wd-radio-bg: #fff;

  // 标签文字
  --wd-radio-label-fs: 28rpx;
  --wd-radio-small-label-fs: 24rpx;
  --wd-radio-large-label-fs: 32rpx;
  --wd-radio-label-color: #262626;
  --wd-radio-disabled-label-color: #c8c9cc;

  // 圆点样式
  --wd-radio-dot-border-color: #dcdfe6;
  --wd-radio-dot-size: 16rpx;
  --wd-radio-dot-small-size: 12rpx;
  --wd-radio-dot-large-size: 20rpx;
  --wd-radio-dot-disabled-bg: #f5f5f5;
  --wd-radio-dot-disabled-border: #dcdfe6;

  // 按钮样式
  --wd-radio-button-height: 60rpx;
  --wd-radio-button-min-width: 96rpx;
  --wd-radio-button-max-width: 320rpx;
  --wd-radio-button-fs: 28rpx;
  --wd-radio-button-bg: #fff;
  --wd-radio-button-border: #dcdfe6;
  --wd-radio-button-radius: 8rpx;
  --wd-radio-button-small-height: 52rpx;
  --wd-radio-button-small-min-width: 80rpx;
  --wd-radio-button-small-fs: 24rpx;
  --wd-radio-button-large-height: 68rpx;
  --wd-radio-button-large-min-width: 112rpx;
  --wd-radio-button-large-fs: 32rpx;
  --wd-radio-button-disabled-border: rgba(0, 102, 255, 0.4);

  // 间距
  --wd-radio-margin: 24rpx;

  // 禁用颜色
  --wd-radio-disabled-color: #f5f5f5;
}
```

**使用示例:**

```vue
<template>
  <view class="custom-radio">
    <wd-radio-group v-model="value" shape="dot">
      <wd-radio :value="1">自定义主题</wd-radio>
      <wd-radio :value="2">自定义主题</wd-radio>
    </wd-radio-group>
  </view>
</template>

<style lang="scss">
.custom-radio {
  --wd-radio-checked-color: #ff4444;
  --wd-radio-label-color: #333;
  --wd-radio-size: 48rpx;
}
</style>
```

参考: src/wd/components/wd-radio/wd-radio.vue:213-543

### 暗黑模式

组件支持暗黑模式,通过添加 `wot-theme-dark` 类名自动切换:

```vue
<template>
  <view :class="isDark ? 'wot-theme-dark' : ''">
    <wd-radio-group v-model="value" shape="dot">
      <wd-radio :value="1">暗黑模式单选框</wd-radio>
      <wd-radio :value="2">暗黑模式单选框</wd-radio>
    </wd-radio-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isDark = ref(false)
const value = ref(1)
</script>
```

**暗黑模式特性:**
- 自动适配深色背景
- 边框颜色调整为浅色
- 文字颜色自动反转
- 禁用状态也有对应的暗色样式
- 按钮模式在暗色下有特殊适配

参考: src/wd/components/wd-radio/wd-radio.vue:218-275

## 最佳实践

### 1. 合理设置 value

确保每个 Radio 的 value 唯一且有意义。

```vue
<!-- ✅ 推荐: 使用有意义的值 -->
<wd-radio-group v-model="gender">
  <wd-radio value="male">男</wd-radio>
  <wd-radio value="female">女</wd-radio>
  <wd-radio value="other">其他</wd-radio>
</wd-radio-group>

<!-- ❌ 不推荐: 使用无意义的序号 -->
<wd-radio-group v-model="gender">
  <wd-radio :value="1">男</wd-radio>
  <wd-radio :value="2">女</wd-radio>
  <wd-radio :value="3">其他</wd-radio>
</wd-radio-group>
```

**原因:**
- 有意义的值提高代码可读性
- 便于后端接口对接
- 避免硬编码数字索引
- 更容易维护和扩展

参考: src/wd/components/wd-radio/wd-radio.vue:47-48,81-86

### 2. 选择合适的形状

根据使用场景选择合适的形状样式。

```vue
<!-- 表单场景: 使用 check 或 dot -->
<wd-radio-group v-model="form.type" shape="dot">
  <wd-radio value="type1">类型1</wd-radio>
  <wd-radio value="type2">类型2</wd-radio>
</wd-radio-group>

<!-- 标签选择场景: 使用 button -->
<wd-radio-group v-model="filter.category" shape="button" inline>
  <wd-radio value="all">全部</wd-radio>
  <wd-radio value="tech">科技</wd-radio>
  <wd-radio value="life">生活</wd-radio>
</wd-radio-group>

<!-- 问卷调查场景: 使用 check -->
<wd-radio-group v-model="answer" shape="check">
  <wd-radio value="A">选项 A</wd-radio>
  <wd-radio value="B">选项 B</wd-radio>
  <wd-radio value="C">选项 C</wd-radio>
  <wd-radio value="D">选项 D</wd-radio>
</wd-radio-group>
```

**选择建议:**
- 常规表单: check 或 dot
- 标签筛选: button + inline
- 问卷调查: check
- 设置选项: dot

参考: src/wd/components/wd-radio/wd-radio.vue:92-94,331-414

### 3. 合理使用禁用状态

根据业务逻辑灵活使用全局禁用和单个禁用。

```vue
<template>
  <!-- 全局禁用: 表单提交中 -->
  <wd-radio-group v-model="value" :disabled="submitting" shape="dot">
    <wd-radio value="option1">选项1</wd-radio>
    <wd-radio value="option2">选项2</wd-radio>
  </wd-radio-group>

  <!-- 单个禁用: 特定选项不可用 -->
  <wd-radio-group v-model="plan" shape="button" inline>
    <wd-radio value="free">免费版</wd-radio>
    <wd-radio value="pro" :disabled="!isPremium">
      专业版(需付费)
    </wd-radio>
    <wd-radio value="enterprise" :disabled="!isEnterprise">
      企业版(需授权)
    </wd-radio>
  </wd-radio-group>
</template>
```

**技巧:**
- 全局禁用适用于临时性状态(加载、提交等)
- 单个禁用适用于永久性限制(权限、等级等)
- 使用 null 值让单个单选框仅受组控制

参考: src/wd/components/wd-radio/wd-radio.vue:108-113,207

### 4. 优化大量选项的性能

当选项数量较多时,使用合理的布局和渲染策略。

```vue
<template>
  <wd-radio-group
    v-model="selected"
    item-width="50%"
    shape="button"
  >
    <!-- 使用 v-for 渲染大量选项 -->
    <wd-radio
      v-for="item in options"
      :key="item.value"
      :value="item.value"
    >
      {{ item.label }}
    </wd-radio>
  </wd-radio-group>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const options = ref([
  // 大量选项数据
])

const selected = ref('')

// 使用计算属性而不是在模板中处理复杂逻辑
const selectedLabel = computed(() => {
  return options.value.find(item => item.value === selected.value)?.label || ''
})
</script>
```

**优化建议:**
- 使用 v-for 配合 :key 渲染列表
- 避免在模板中使用复杂表达式
- 使用 computed 缓存计算结果
- 考虑虚拟列表(选项数量 > 1000)

参考: src/wd/components/wd-radio/wd-radio.vue:149-169

### 5. 监听变化事件

通过 RadioGroup 监听值的变化。

```vue
<template>
  <view class="demo">
    <wd-radio-group
      v-model="value"
      shape="dot"
      @change="handleChange"
    >
      <wd-radio value="option1">选项1</wd-radio>
      <wd-radio value="option2">选项2</wd-radio>
      <wd-radio value="option3">选项3</wd-radio>
    </wd-radio-group>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const value = ref('option1')

// 方式1: 使用 watch 监听
watch(value, (newValue, oldValue) => {
  console.log('值变化:', oldValue, '->', newValue)
  // 执行业务逻辑
})

// 方式2: 使用 change 事件
const handleChange = ({ value }: { value: string }) => {
  console.log('选中:', value)
  // 执行异步操作
  if (value === 'option2') {
    // 加载相关数据
  }
}
</script>
```

**选择建议:**
- 简单的状态同步: 使用 v-model + watch
- 需要执行异步操作: 使用 change 事件
- 需要访问旧值: 使用 watch
- 需要阻止状态变化: 在 change 事件中处理

参考: src/wd/components/wd-radio/wd-radio.vue:205-210

## 常见问题

### 1. 为什么 Radio 的值没有更新?

**问题原因:**
- Radio 没有放在 RadioGroup 内
- Radio 的 value 属性未设置
- RadioGroup 的 v-model 初始值类型与 value 不匹配

**解决方案:**

```vue
<!-- ❌ 错误: 没有 RadioGroup -->
<wd-radio :value="1">选项1</wd-radio>
<wd-radio :value="2">选项2</wd-radio>

<!-- ✅ 正确: 使用 RadioGroup -->
<wd-radio-group v-model="value">
  <wd-radio :value="1">选项1</wd-radio>
  <wd-radio :value="2">选项2</wd-radio>
</wd-radio-group>

<!-- ❌ 错误: 没有设置 value -->
<wd-radio-group v-model="value">
  <wd-radio>选项1</wd-radio>
  <wd-radio>选项2</wd-radio>
</wd-radio-group>

<!-- ✅ 正确: 设置唯一的 value -->
<wd-radio-group v-model="value">
  <wd-radio :value="1">选项1</wd-radio>
  <wd-radio :value="2">选项2</wd-radio>
</wd-radio-group>
```

参考: src/wd/components/wd-radio/wd-radio.vue:74-75,81-86

### 2. 如何设置默认选中项?

**问题原因:**
- RadioGroup 的 v-model 未设置初始值
- 初始值与任何 Radio 的 value 都不匹配

**解决方案:**

```vue
<template>
  <wd-radio-group v-model="value" shape="dot">
    <wd-radio :value="1">选项1</wd-radio>
    <wd-radio :value="2">选项2</wd-radio>
    <wd-radio :value="3">选项3</wd-radio>
  </wd-radio-group>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// ✅ 正确: 设置初始值为某个选项的 value
const value = ref(2) // 默认选中选项2

// ❌ 错误: 初始值与任何选项都不匹配
// const value = ref(null)
// const value = ref(4) // 没有 value 为 4 的选项
</script>
```

参考: src/wd/components/wd-radio/wd-radio.vue:81-86

### 3. 按钮样式如何自定义宽度?

**问题原因:**
- 按钮样式有默认的最小和最大宽度限制
- 直接设置 width 样式可能不生效

**解决方案:**

```vue
<template>
  <view class="custom-button">
    <wd-radio-group v-model="value" shape="button" inline>
      <wd-radio :value="1">短</wd-radio>
      <wd-radio :value="2">中等长度</wd-radio>
      <wd-radio :value="3">很长的文字内容</wd-radio>
    </wd-radio-group>
  </view>
</template>

<style lang="scss">
.custom-button {
  // 通过 CSS 变量自定义宽度
  --wd-radio-button-min-width: 120rpx;
  --wd-radio-button-max-width: 400rpx;

  // 或者直接覆盖样式
  :deep(.wd-radio.is-button .wd-radio__label) {
    min-width: 120rpx;
    max-width: 400rpx;
  }
}
</style>
```

**注意事项:**
- 按钮样式有默认的 min-width 和 max-width
- 使用 CSS 变量更推荐
- 也可以通过 itemWidth 统一控制

参考: src/wd/components/wd-radio/wd-radio.vue:373-386,395-413

### 4. 如何实现单选框的只读状态?

**问题原因:**
- Radio 没有 readonly 属性
- disabled 会显示灰色样式,不符合只读需求

**解决方案:**

```vue
<template>
  <view class="demo">
    <!-- 方式1: 通过阻止事件实现只读 -->
    <wd-radio-group
      v-model="value"
      shape="dot"
      @click.stop.prevent
    >
      <wd-radio :value="1">只读选项1</wd-radio>
      <wd-radio :value="2">只读选项2</wd-radio>
    </wd-radio-group>

    <!-- 方式2: 使用 disabled 但自定义样式 -->
    <view class="readonly-radio">
      <wd-radio-group v-model="value" shape="dot" disabled>
        <wd-radio :value="1">只读选项1</wd-radio>
        <wd-radio :value="2">只读选项2</wd-radio>
      </wd-radio-group>
    </view>
  </view>
</template>

<style lang="scss">
.readonly-radio {
  // 让禁用状态看起来像正常状态
  --wd-radio-disabled-label-color: var(--wd-radio-label-color);

  :deep(.wd-radio.is-disabled) {
    opacity: 1;

    .wd-radio__shape {
      color: var(--wd-radio-checked-color);
    }
  }
}
</style>
```

**实现方式:**
1. 阻止点击事件: 视觉正常,但无法交互
2. 自定义禁用样式: 保留禁用功能,但样式正常
3. 根据场景选择合适的方式

参考: src/wd/components/wd-radio/wd-radio.vue:205-210,460-496

### 5. 图标位置切换不生效?

**问题原因:**
- 按钮样式不支持图标位置切换
- iconPlacement 设置错误

**解决方案:**

```vue
<!-- ❌ 错误: 按钮样式不支持图标位置 -->
<wd-radio-group v-model="value" shape="button" icon-placement="left">
  <wd-radio :value="1">选项1</wd-radio>
  <wd-radio :value="2">选项2</wd-radio>
</wd-radio-group>

<!-- ✅ 正确: 只在 check 和 dot 样式下有效 -->
<wd-radio-group v-model="value" shape="dot" icon-placement="left">
  <wd-radio :value="1">选项1</wd-radio>
  <wd-radio :value="2">选项2</wd-radio>
</wd-radio-group>

<!-- ✅ 正确: 使用 inline 模式 -->
<wd-radio-group v-model="value" shape="dot" icon-placement="left" inline>
  <wd-radio :value="1">选项1</wd-radio>
  <wd-radio :value="2">选项2</wd-radio>
</wd-radio-group>
```

**注意事项:**
- iconPlacement 仅对 check 和 dot 样式有效
- 按钮样式不显示图标,因此该属性无效
- 需要配合 inline 或非按钮样式使用

参考: src/wd/components/wd-radio/wd-radio.vue:138-143,416-457

## 注意事项

1. **必须与 RadioGroup 组合**: Radio 组件必须放在 RadioGroup 内使用,单独使用无法实现单选功能

2. **value 必须设置**: 每个 Radio 必须设置 value 属性,否则无法正确管理选中状态

3. **value 唯一性**: 同一个 RadioGroup 中,所有 Radio 的 value 必须唯一

4. **shape 属性校验**: shape 属性只接受 'check'、'dot'、'button' 三个值,传入其他值会在控制台输出错误提示

5. **size 属性校验**: size 属性只接受 'small'、'default'、'large' 三个值,传入其他值会在控制台输出错误提示

6. **disabled 的三种状态**: disabled 可以是 true(禁用)、false(启用)、null(仅受 RadioGroup 控制),合理使用可以实现灵活的禁用逻辑

7. **自定义颜色限制**: checkedColor 仅对非禁用状态生效,禁用状态的颜色需要通过 CSS 变量定制

8. **按钮模式布局**: 使用 shape="button" 时,iconPlacement 属性无效,因为按钮样式不显示独立的图标

9. **图标位置限制**: iconPlacement 仅对 check 和 dot 样式有效,且需要配合 inline 或非按钮样式使用

10. **内联显示注意**: 使用 inline 时,单选框会水平排列并自动换行,但不会像 itemWidth 那样严格控制宽度

11. **事件处理**: Radio 组件本身不触发事件,所有事件由 RadioGroup 统一管理,需要在 RadioGroup 上监听 change 事件

12. **暗黑模式适配**: 使用暗黑模式时,需要在外层容器添加 wot-theme-dark 类名,组件会自动适配深色样式

参考: src/wd/components/wd-radio/wd-radio.vue:1-544
