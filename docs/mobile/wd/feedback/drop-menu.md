---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/dropMenu
---

# DropMenu 下拉菜单

## 介绍

DropMenu 下拉菜单是一个向下或向上弹出的菜单列表组件，常用于商品筛选、排序、分类切换等场景。组件由 `wd-drop-menu` 父容器和 `wd-drop-menu-item` 菜单项两部分组成，采用 provide/inject 模式实现父子组件通信，支持多个菜单项同时存在，点击某一菜单项时会自动关闭其他已展开的菜单。

组件基于 `wd-popup` 弹出层实现，支持向上(up)和向下(down)两种展开方向，提供了丰富的配置选项，包括自定义选项数据、禁用状态、切换前回调、自定义内容等功能，能够满足各种筛选场景的需求。组件还集成了队列管理系统(Queue)，确保多个下拉菜单之间的互斥显示。

**核心特性:**

- **双向展开** - 支持向上(up)和向下(down)两种展开方向，自动计算偏移位置
- **自动互斥** - 点击某一菜单时自动关闭其他已展开的菜单，基于队列系统管理
- **遮罩层** - 可配置是否显示遮罩层及点击遮罩关闭，支持自定义遮罩层级
- **禁用状态** - 支持禁用单个菜单项，禁用时样式置灰且不响应点击
- **切换回调** - 支持 beforeToggle 回调控制菜单展开/关闭，可用于权限校验等场景
- **自定义内容** - 支持通过默认插槽自定义菜单内容，实现复杂筛选界面
- **暗黑模式** - 完整支持暗黑模式主题切换，自动适配样式
- **动画效果** - 支持自定义展开收起动画时长，平滑过渡效果

## 组件架构

### 父子组件关系

DropMenu 采用父子组件分离设计，通过 Vue 3 的 provide/inject 机制实现通信：

```
wd-drop-menu (父容器)
├── 管理展开状态
├── 计算偏移位置
├── 控制遮罩层显示
└── 子组件
    ├── wd-drop-menu-item (菜单项1)
    ├── wd-drop-menu-item (菜单项2)
    └── wd-drop-menu-item (菜单项N)
```

**核心机制:**

1. **useChildren/useParent** - 父组件通过 `useChildren` 收集子组件实例，子组件通过 `useParent` 获取父组件引用
2. **linkChildren** - 父组件向子组件提供 props、fold 方法和 offset 响应式数据
3. **队列管理** - 通过 `queueKey` 注入队列管理器，确保全局菜单互斥

### 位置计算原理

组件通过 `getRect` 获取菜单容器的位置信息，根据展开方向计算弹出层偏移：

```typescript
// 向下展开：计算容器底部到窗口顶部的距离
if (direction === 'down') {
  offset.value = pxToRpx(Number(bottom))
}
// 向上展开：计算容器顶部到窗口底部的距离
else {
  offset.value = pxToRpx(windowHeight.value - Number(top))
}
```

## 基本用法

### 基础下拉菜单

通过 `options` 设置选项数据，`v-model` 绑定选中值。选项数据为对象数组，包含 `label`(显示文本)和 `value`(选项值)两个必要字段。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item v-model="value1" :options="options1" />
    <wd-drop-menu-item v-model="value2" :options="options2" />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(0)
const value2 = ref('a')

const options1 = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
  { label: '活动商品', value: 2 },
])

const options2 = ref([
  { label: '综合排序', value: 'a' },
  { label: '销量优先', value: 'b' },
  { label: '价格优先', value: 'c' },
])
</script>
```

**使用说明:**

- `v-model` 支持 `string` 或 `number` 类型的值
- 选项数据通过 `valueKey` 和 `labelKey` 可自定义字段名
- 选中值变化时会自动更新菜单标题显示

### 自定义菜单标题

设置 `title` 属性可以自定义菜单标题，设置后不再根据选中值自动显示对应的 label。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item v-model="value" title="商品分类" :options="options" />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)
const options = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
  { label: '活动商品', value: 2 },
])
</script>
```

**使用说明:**

- 设置 `title` 后，无论选中哪个选项，菜单标题始终显示设置的值
- 适用于筛选器等场景，标题固定显示"筛选"等文字

### 向上展开

设置 `direction="up"` 使菜单向上展开，适用于页面底部的筛选栏。

```vue
<template>
  <view class="page-container">
    <!-- 页面内容 -->
    <view class="content">商品列表区域</view>

    <!-- 底部筛选栏 -->
    <view class="bottom-filter">
      <wd-drop-menu direction="up">
        <wd-drop-menu-item v-model="value1" :options="options1" />
        <wd-drop-menu-item v-model="value2" :options="options2" />
      </wd-drop-menu>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(0)
const value2 = ref('a')

const options1 = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
])

const options2 = ref([
  { label: '综合排序', value: 'a' },
  { label: '销量优先', value: 'b' },
])
</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex: 1;
  overflow-y: auto;
}

.bottom-filter {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style>
```

**使用说明:**

- 向上展开时，弹出层从菜单栏上方弹出
- 确保菜单栏上方有足够空间显示选项列表
- 遮罩层会覆盖从菜单栏到页面顶部的区域

### 禁用菜单

设置 `disabled` 属性禁用菜单项，禁用后菜单项变灰且不响应点击事件。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item v-model="value1" :options="options1" />
    <wd-drop-menu-item v-model="value2" :options="options2" disabled />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(0)
const value2 = ref('a')

const options1 = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
])

const options2 = ref([
  { label: '综合排序', value: 'a' },
  { label: '销量优先', value: 'b' },
])
</script>
```

**使用说明:**

- 禁用状态下菜单项文字颜色变为 `--wot-drop-menu-disabled-color`
- 禁用状态下点击不会触发任何事件
- 可根据业务条件动态设置禁用状态

### 带提示文字的选项

通过 `tipKey` 设置选项提示文字的字段名，提示文字会显示在选项标签右侧。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item v-model="value" :options="options" tip-key="tip" />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)
const options = ref([
  { label: '全部商品', value: 0, tip: '共1000件' },
  { label: '新款商品', value: 1, tip: '共200件' },
  { label: '活动商品', value: 2, tip: '共50件' },
])
</script>
```

**使用说明:**

- 提示文字默认使用较小字号和灰色显示
- 适用于显示选项的附加信息，如商品数量、更新时间等
- 可通过 CSS 变量自定义提示文字样式

### 自定义选中图标

通过 `icon-name` 设置选中项的图标，支持 wd-icon 组件中的所有图标名称。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item v-model="value" :options="options" icon-name="success" />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)
const options = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
  { label: '活动商品', value: 2 },
])
</script>
```

**使用说明:**

- 默认使用 `check` 图标表示选中状态
- 图标颜色跟随选中项文字颜色
- 可通过 `custom-icon` 类名自定义图标样式

### 自定义菜单图标

通过 `icon` 和 `icon-size` 属性自定义菜单标题右侧的箭头图标。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item
      v-model="value"
      :options="options"
      icon="filter"
      icon-size="32rpx"
    />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)
const options = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
])
</script>
```

**使用说明:**

- 默认使用 `arrow-down` 箭头图标
- 展开状态下图标会旋转 180 度
- `icon-size` 支持数字或带单位的字符串

## 高级用法

### 切换前回调

通过 `before-toggle` 属性设置切换前回调，可以在菜单展开或关闭前执行异步操作或权限校验。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item
      v-model="value"
      :options="options"
      :before-toggle="handleBeforeToggle"
    />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DropMenuItemBeforeToggle } from '@/wd/components/wd-drop-menu-item/wd-drop-menu-item.vue'

const value = ref(0)
const options = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
  { label: '活动商品', value: 2 },
])

const handleBeforeToggle: DropMenuItemBeforeToggle = ({ status, resolve }) => {
  if (status) {
    // 打开前的逻辑，如权限校验
    checkPermission().then((hasPermission) => {
      if (hasPermission) {
        resolve(true) // 允许打开
      } else {
        uni.showToast({ title: '暂无权限', icon: 'none' })
        resolve(false) // 阻止打开
      }
    })
  } else {
    // 关闭前的逻辑，如确认提示
    resolve(true) // 允许关闭
  }
}

const checkPermission = async () => {
  // 模拟权限校验
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500)
  })
}
</script>
```

**使用说明:**

- `status` 为 `true` 表示即将打开，`false` 表示即将关闭
- 必须调用 `resolve(true)` 或 `resolve(false)` 来确定是否允许操作
- 支持异步操作，可用于网络请求等场景

### 自定义菜单内容

不传 `options` 时，可以通过默认插槽自定义菜单内容，实现复杂的筛选界面。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item v-model="value" :options="options" />
    <wd-drop-menu-item ref="filterRef" title="筛选">
      <view class="filter-content">
        <wd-cell title="包邮" center>
          <wd-switch v-model="filter.freeShipping" />
        </wd-cell>
        <wd-cell title="有货" center>
          <wd-switch v-model="filter.inStock" />
        </wd-cell>
        <wd-cell title="价格区间" center>
          <view class="price-range">
            <wd-input
              v-model="filter.minPrice"
              placeholder="最低价"
              type="number"
            />
            <text class="separator">-</text>
            <wd-input
              v-model="filter.maxPrice"
              placeholder="最高价"
              type="number"
            />
          </view>
        </wd-cell>
        <view class="filter-footer">
          <wd-button plain @click="handleReset">重置</wd-button>
          <wd-button type="primary" @click="handleConfirm">确定</wd-button>
        </view>
      </view>
    </wd-drop-menu-item>
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const value = ref(0)
const filterRef = ref()

const options = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
])

const filter = reactive({
  freeShipping: false,
  inStock: false,
  minPrice: '',
  maxPrice: '',
})

const handleReset = () => {
  filter.freeShipping = false
  filter.inStock = false
  filter.minPrice = ''
  filter.maxPrice = ''
}

const handleConfirm = () => {
  // 应用筛选条件
  console.log('筛选条件:', filter)
  // 关闭菜单
  filterRef.value?.close()
}
</script>

<style lang="scss" scoped>
.filter-content {
  padding: 24rpx;
  background: #fff;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .separator {
    color: #999;
  }
}

.filter-footer {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
  padding: 0 24rpx;
}
</style>
```

**使用说明:**

- 使用插槽时需要设置 `title` 属性指定菜单标题
- 通过 `ref` 获取组件实例，调用 `close()` 方法关闭菜单
- 自定义内容区域高度最大为视口的 80%

### 遮罩层配置

通过 `modal` 和 `close-on-click-modal` 属性配置遮罩层行为。

```vue
<template>
  <!-- 不显示遮罩层 -->
  <wd-drop-menu :modal="false">
    <wd-drop-menu-item v-model="value1" :options="options" />
  </wd-drop-menu>

  <!-- 显示遮罩层但点击不关闭 -->
  <wd-drop-menu :modal="true" :close-on-click-modal="false">
    <wd-drop-menu-item v-model="value2" :options="options" />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(0)
const value2 = ref(0)

const options = ref([
  { label: '选项一', value: 0 },
  { label: '选项二', value: 1 },
])
</script>
```

**使用说明:**

- `modal` 默认为 `true`，显示半透明遮罩层
- `close-on-click-modal` 默认为 `true`，点击遮罩层关闭所有菜单
- 不显示遮罩层时，需要点击其他菜单项或页面其他区域触发关闭

### 动画时长配置

通过 `duration` 属性配置菜单展开收起的动画时长。

```vue
<template>
  <wd-drop-menu :duration="300">
    <wd-drop-menu-item v-model="value" :options="options" />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)

const options = ref([
  { label: '选项一', value: 0 },
  { label: '选项二', value: 1 },
])
</script>
```

**使用说明:**

- `duration` 单位为毫秒，默认值为 200
- 动画时长同时应用于展开和收起
- 建议设置在 150-400ms 之间，过长会影响用户体验

### 自定义层级

通过 `z-index` 属性配置弹出层的层级。

```vue
<template>
  <wd-drop-menu :z-index="100">
    <wd-drop-menu-item v-model="value" :options="options" />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)

const options = ref([
  { label: '选项一', value: 0 },
  { label: '选项二', value: 1 },
])
</script>
```

**使用说明:**

- 默认层级为 12
- 需要确保层级高于页面其他浮层元素
- 遮罩层与弹出层使用相同的层级

### 监听事件

监听各种事件获取菜单状态变化。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item
      v-model="value"
      :options="options"
      @change="handleChange"
      @open="handleOpen"
      @opened="handleOpened"
      @close="handleClose"
      @closed="handleClosed"
    />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)
const options = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
  { label: '活动商品', value: 2 },
])

const handleChange = ({ value, selectedItem }) => {
  console.log('选中值:', value)
  console.log('选中项:', selectedItem)
  // 根据选中值执行业务逻辑
  fetchData(value)
}

const handleOpen = () => {
  console.log('菜单即将打开')
}

const handleOpened = () => {
  console.log('菜单已打开')
}

const handleClose = () => {
  console.log('菜单即将关闭')
}

const handleClosed = () => {
  console.log('菜单已关闭')
}

const fetchData = (category: number) => {
  // 加载数据
}
</script>
```

**使用说明:**

- `change` 事件在选中值改变时触发，携带新值和选中项对象
- `open`/`opened` 分别在打开前和打开后触发
- `close`/`closed` 分别在关闭前和关闭后触发
- 可利用这些事件做埋点统计、数据加载等操作

### 程序化控制

通过 ref 获取组件实例，调用方法控制菜单开关。

```vue
<template>
  <view class="control-buttons">
    <wd-button size="small" @click="openFirst">打开第一个</wd-button>
    <wd-button size="small" @click="openSecond">打开第二个</wd-button>
    <wd-button size="small" @click="closeAll">关闭所有</wd-button>
  </view>

  <wd-drop-menu>
    <wd-drop-menu-item ref="firstRef" v-model="value1" :options="options1" />
    <wd-drop-menu-item ref="secondRef" v-model="value2" :options="options2" />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const firstRef = ref()
const secondRef = ref()

const value1 = ref(0)
const value2 = ref('a')

const options1 = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
])

const options2 = ref([
  { label: '综合排序', value: 'a' },
  { label: '销量优先', value: 'b' },
])

const openFirst = () => {
  firstRef.value?.open()
}

const openSecond = () => {
  secondRef.value?.open()
}

const closeAll = () => {
  firstRef.value?.close()
  secondRef.value?.close()
}
</script>
```

**使用说明:**

- `open()` - 打开菜单
- `close()` - 关闭菜单
- `toggle()` - 切换菜单状态
- `getShowPop()` - 获取当前显示状态

### 自定义字段名

通过 `value-key`、`label-key`、`tip-key` 属性自定义选项数据的字段名。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item
      v-model="value"
      :options="options"
      value-key="id"
      label-key="name"
      tip-key="count"
    />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(1)

// 使用自定义字段名的数据结构
const options = ref([
  { id: 1, name: '手机数码', count: '1234件' },
  { id: 2, name: '家用电器', count: '856件' },
  { id: 3, name: '服装鞋包', count: '2341件' },
])
</script>
```

**使用说明:**

- 适用于后端返回的数据结构与默认字段名不一致的情况
- 避免数据转换，直接使用原始数据

### 自定义样式

通过 `custom-class`、`custom-style` 等属性自定义组件样式。

```vue
<template>
  <wd-drop-menu custom-class="my-drop-menu" custom-style="background: #f5f5f5;">
    <wd-drop-menu-item
      v-model="value"
      :options="options"
      custom-class="my-drop-item"
      custom-title="my-title"
      custom-icon="my-icon"
      custom-popup-class="my-popup"
    />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)

const options = ref([
  { label: '选项一', value: 0 },
  { label: '选项二', value: 1 },
])
</script>

<style lang="scss">
.my-drop-menu {
  border-radius: 16rpx;
}

.my-title {
  font-weight: bold;
}

.my-icon {
  color: #ff6600;
}

.my-popup {
  border-radius: 0 0 16rpx 16rpx;
}
</style>
```

**使用说明:**

- `custom-class` - 自定义根节点样式类
- `custom-style` - 自定义根节点内联样式
- `custom-title` - 自定义标题样式类
- `custom-icon` - 自定义图标样式类
- `custom-popup-class` - 自定义弹出层样式类
- `custom-popup-style` - 自定义弹出层内联样式

## API

### DropMenu Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| direction | 菜单展开方向 | `'up' \| 'down'` | `down` |
| modal | 是否显示遮罩层 | `boolean` | `true` |
| close-on-click-modal | 是否点击遮罩层关闭菜单 | `boolean` | `true` |
| duration | 菜单展开收起动画时间,单位 ms | `number` | `200` |
| z-index | 弹框层级 | `number` | `12` |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |

### DropMenuItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前选中项的 value | `string \| number` | - |
| options | 选项数据 | `Array<{label, value, tip?}>` | `[]` |
| title | 菜单标题 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| icon | 菜单图标 | `string` | `arrow-down` |
| icon-size | 菜单图标大小 | `string \| number` | - |
| icon-name | 选中项的图标名称 | `string` | `check` |
| value-key | 选项中 value 对应的 key | `string` | `value` |
| label-key | 选项中展示文本对应的 key | `string` | `label` |
| tip-key | 选项中提示文字对应的 key | `string` | `tip` |
| before-toggle | 切换前回调函数 | `DropMenuItemBeforeToggle` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-style | 自定义根节点样式 | `string` | - |
| custom-title | 自定义标题样式类 | `string` | - |
| custom-icon | 自定义图标样式类 | `string` | - |
| custom-popup-class | 自定义弹出层样式类 | `string` | - |
| custom-popup-style | 自定义弹出层样式 | `string` | - |
| popup-height | 弹出层高度，设置后选项区域会切换为 `scroll-view` 以支持内部滚动，避免与页面下拉刷新冲突（如 `'600rpx'`） | `string` | `''` |

### DropMenuItem Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中值改变时触发 | `{ value: string \| number, selectedItem: object }` |
| open | 菜单打开前触发 | - |
| opened | 菜单打开后触发 | - |
| close | 菜单关闭前触发 | - |
| closed | 菜单关闭后触发 | - |

### DropMenuItem Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开菜单 | - | - |
| close | 关闭菜单 | - | - |
| toggle | 切换菜单显示状态 | - | - |
| getShowPop | 获取菜单显示状态 | - | `boolean` |

### DropMenuItem Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义菜单内容,不传 options 时生效 |

### 类型定义

```typescript
/**
 * 下拉菜单方向类型
 */
type DropDirction = 'up' | 'down'

/**
 * 弹出层位置类型
 */
type PopupType = 'top' | 'bottom' | 'left' | 'right' | 'center'

/**
 * 切换前回调选项
 */
interface DropMenuItemBeforeToggleOption {
  /** 操作状态：true 打开，false 关闭 */
  status: boolean
  /** 回调函数，resolve(true) 允许操作，resolve(false) 阻止操作 */
  resolve: (isPass: boolean) => void
}

/**
 * 切换前回调函数类型
 */
type DropMenuItemBeforeToggle = (option: DropMenuItemBeforeToggleOption) => void

/**
 * 选项数据结构
 */
interface DropMenuOption {
  /** 选项标签 */
  label: string
  /** 选项值 */
  value: string | number
  /** 提示文字 */
  tip?: string
  /** 其他自定义字段 */
  [key: string]: any
}

/**
 * 下拉菜单组件属性接口
 */
interface WdDropMenuProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 弹框层级 */
  zIndex?: number
  /** 菜单展开方向 */
  direction?: DropDirction
  /** 是否展示蒙层 */
  modal?: boolean
  /** 是否点击蒙层时关闭 */
  closeOnClickModal?: boolean
  /** 菜单展开收起动画时间，单位ms */
  duration?: number
}

/**
 * 下拉菜单项组件属性接口
 */
interface WdDropMenuItemProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 左侧文字样式 */
  customTitle?: string
  /** 右侧 icon 样式 */
  customIcon?: string
  /** 当前选中项的 value */
  modelValue?: string | number
  /** 选项数据 */
  options?: DropMenuOption[]
  /** 禁用菜单 */
  disabled?: boolean
  /** 选中的图标名称 */
  iconName?: string
  /** 菜单标题 */
  title?: string
  /** 菜单图标 */
  icon?: string
  /** 菜单图标大小 */
  iconSize?: string | number
  /** 切换前回调 */
  beforeToggle?: DropMenuItemBeforeToggle
  /** value 对应的 key */
  valueKey?: string
  /** 展示文本对应的 key */
  labelKey?: string
  /** 提示文字对应的 key */
  tipKey?: string
  /** 自定义弹出层样式类 */
  customPopupClass?: string
  /** 自定义弹出层样式 */
  customPopupStyle?: string
}

/**
 * 下拉菜单项组件事件接口
 */
interface WdDropMenuItemEmits {
  /** 更新选中值时触发 */
  'update:modelValue': [value: string | number]
  /** 选中项改变时触发 */
  change: [event: { value: string | number; selectedItem: DropMenuOption }]
  /** 下拉菜单打开前触发 */
  open: []
  /** 下拉菜单打开后触发 */
  opened: []
  /** 下拉菜单关闭前触发 */
  close: []
  /** 下拉菜单关闭后触发 */
  closed: []
}

/**
 * 下拉菜单项组件暴露的方法
 */
interface WdDropMenuItemExpose {
  /** 获取弹出层显示状态 */
  getShowPop: () => boolean
  /** 打开下拉菜单 */
  open: () => void
  /** 关闭下拉菜单 */
  close: () => void
  /** 切换下拉菜单显示状态 */
  toggle: () => void
}

/**
 * 下拉菜单项组件实例类型
 */
type DropMenuItemInstance = ComponentPublicInstance<
  WdDropMenuItemProps,
  WdDropMenuItemExpose
>
```

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-drop-menu-height | 菜单栏高度 | `96rpx` |
| --wot-drop-menu-color | 菜单文字颜色 | `$-color-content` |
| --wot-drop-menu-fs | 菜单字体大小 | `$-fs-content` |
| --wot-drop-menu-arrow-fs | 箭头图标大小 | `$-fs-content` |
| --wot-drop-menu-side-padding | 菜单项内边距 | `$-size-side-padding` |
| --wot-drop-menu-disabled-color | 禁用状态颜色 | `rgba(0, 0, 0, 0.25)` |
| --wot-drop-menu-line-color | 激活状态下划线颜色 | `$-color-theme` |
| --wot-drop-menu-line-height | 激活状态下划线高度 | `6rpx` |
| --wot-drop-menu-item-height | 选项高度 | `96rpx` |
| --wot-drop-menu-item-color | 选项文字颜色 | `$-color-content` |
| --wot-drop-menu-item-fs | 选项字体大小 | `$-fs-content` |
| --wot-drop-menu-item-color-active | 选项激活状态颜色 | `$-color-theme` |
| --wot-drop-menu-item-color-tip | 提示文字颜色 | `rgba(0, 0, 0, 0.45)` |
| --wot-drop-menu-item-fs-tip | 提示文字字体大小 | `$-fs-secondary` |
| --wot-drop-menu-option-check-size | 选中图标大小 | `40rpx` |

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-drop-menu>
      <wd-drop-menu-item v-model="value" :options="options" />
    </wd-drop-menu>
  </view>
</template>

<style lang="scss" scoped>
.custom-theme {
  // 菜单栏样式
  --wot-drop-menu-height: 88rpx;
  --wot-drop-menu-color: #333;
  --wot-drop-menu-fs: 28rpx;

  // 激活状态样式
  --wot-drop-menu-line-color: #ff6600;
  --wot-drop-menu-item-color-active: #ff6600;

  // 选项样式
  --wot-drop-menu-item-height: 100rpx;
  --wot-drop-menu-item-fs: 30rpx;
}
</style>
```

### 暗黑模式

组件已适配暗黑模式，在暗黑主题下会自动切换样式:

- 菜单栏背景色切换为深色
- 文字颜色切换为浅色
- 禁用状态颜色适配暗黑主题
- 提示文字颜色适配暗黑主题

```scss
// 暗黑模式下的样式覆盖
.wot-theme-dark {
  .wd-drop-menu {
    color: $-dark-color;

    .wd-drop-menu__list {
      background-color: $-dark-background2;
    }

    .wd-drop-menu__item.is-disabled {
      color: $-dark-color-gray;
    }
  }

  .wd-drop-item {
    color: $-dark-color;

    .wd-drop-item__tip {
      color: $-dark-color3;
    }
  }
}
```

## 最佳实践

### 1. 商品筛选场景

```vue
<template>
  <view class="product-filter">
    <wd-drop-menu>
      <wd-drop-menu-item
        v-model="filter.category"
        :options="categoryOptions"
        @change="handleFilterChange"
      />
      <wd-drop-menu-item
        v-model="filter.sort"
        :options="sortOptions"
        @change="handleFilterChange"
      />
      <wd-drop-menu-item ref="filterRef" title="筛选">
        <view class="filter-panel">
          <view class="filter-section">
            <text class="filter-title">价格区间</text>
            <view class="price-inputs">
              <wd-input v-model="filter.minPrice" placeholder="最低价" type="number" />
              <text class="separator">-</text>
              <wd-input v-model="filter.maxPrice" placeholder="最高价" type="number" />
            </view>
          </view>
          <view class="filter-section">
            <text class="filter-title">商品属性</text>
            <view class="filter-tags">
              <wd-tag
                v-for="attr in attributes"
                :key="attr.value"
                :type="filter.attributes.includes(attr.value) ? 'primary' : 'default'"
                @click="toggleAttribute(attr.value)"
              >
                {{ attr.label }}
              </wd-tag>
            </view>
          </view>
          <view class="filter-actions">
            <wd-button plain block @click="handleReset">重置</wd-button>
            <wd-button type="primary" block @click="handleApply">确定</wd-button>
          </view>
        </view>
      </wd-drop-menu-item>
    </wd-drop-menu>

    <view class="product-list">
      <product-card
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'

const filterRef = ref()

const filter = reactive({
  category: 0,
  sort: 'default',
  minPrice: '',
  maxPrice: '',
  attributes: [] as string[],
})

const categoryOptions = ref([
  { label: '全部分类', value: 0 },
  { label: '手机数码', value: 1 },
  { label: '家用电器', value: 2 },
  { label: '服装鞋包', value: 3 },
])

const sortOptions = ref([
  { label: '综合排序', value: 'default' },
  { label: '销量优先', value: 'sales' },
  { label: '价格升序', value: 'price_asc' },
  { label: '价格降序', value: 'price_desc' },
  { label: '新品优先', value: 'new' },
])

const attributes = ref([
  { label: '包邮', value: 'free_shipping' },
  { label: '有货', value: 'in_stock' },
  { label: '促销', value: 'promotion' },
  { label: '自营', value: 'self_operated' },
])

const products = ref([])

const handleFilterChange = () => {
  fetchProducts()
}

const toggleAttribute = (value: string) => {
  const index = filter.attributes.indexOf(value)
  if (index > -1) {
    filter.attributes.splice(index, 1)
  } else {
    filter.attributes.push(value)
  }
}

const handleReset = () => {
  filter.minPrice = ''
  filter.maxPrice = ''
  filter.attributes = []
}

const handleApply = () => {
  filterRef.value?.close()
  fetchProducts()
}

const fetchProducts = async () => {
  // 根据筛选条件请求商品列表
  const params = {
    category: filter.category,
    sort: filter.sort,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    attributes: filter.attributes.join(','),
  }
  // const result = await api.getProducts(params)
  // products.value = result.data
}
</script>
```

### 2. 控制菜单开关

```vue
<template>
  <view class="menu-control">
    <wd-drop-menu>
      <wd-drop-menu-item
        ref="menuItemRef"
        v-model="value"
        :options="options"
        :before-toggle="handleBeforeToggle"
      />
    </wd-drop-menu>

    <view class="control-panel">
      <wd-button size="small" @click="openMenu">打开菜单</wd-button>
      <wd-button size="small" @click="closeMenu">关闭菜单</wd-button>
      <wd-button size="small" @click="toggleMenu">切换状态</wd-button>
      <wd-button size="small" @click="checkStatus">检查状态</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { DropMenuItemBeforeToggle } from '@/wd/components/wd-drop-menu-item/wd-drop-menu-item.vue'

const menuItemRef = ref()
const value = ref(0)

const options = ref([
  { label: '选项一', value: 0 },
  { label: '选项二', value: 1 },
  { label: '选项三', value: 2 },
])

const handleBeforeToggle: DropMenuItemBeforeToggle = ({ status, resolve }) => {
  // 可以在这里添加权限校验等逻辑
  console.log(status ? '即将打开' : '即将关闭')
  resolve(true)
}

const openMenu = () => {
  menuItemRef.value?.open()
}

const closeMenu = () => {
  menuItemRef.value?.close()
}

const toggleMenu = () => {
  menuItemRef.value?.toggle()
}

const checkStatus = () => {
  const isOpen = menuItemRef.value?.getShowPop()
  uni.showToast({
    title: isOpen ? '菜单已打开' : '菜单已关闭',
    icon: 'none',
  })
}
</script>
```

### 3. 异步加载选项数据

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item
      v-model="value"
      :options="options"
      :disabled="loading"
      @open="handleOpen"
    />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const value = ref<number>()
const options = ref<Array<{ label: string; value: number; tip?: string }>>([])
const loading = ref(true)

onMounted(async () => {
  await fetchOptions()
})

const fetchOptions = async () => {
  loading.value = true
  try {
    // 模拟异步请求
    const data = await new Promise<Array<{ label: string; value: number; tip: string }>>(
      (resolve) => {
        setTimeout(() => {
          resolve([
            { label: '全部商品', value: 0, tip: '1000件' },
            { label: '新款商品', value: 1, tip: '200件' },
            { label: '热销商品', value: 2, tip: '500件' },
          ])
        }, 1000)
      }
    )
    options.value = data
    // 设置默认选中第一项
    if (data.length > 0 && value.value === undefined) {
      value.value = data[0].value
    }
  } finally {
    loading.value = false
  }
}

const handleOpen = () => {
  // 每次打开时刷新数据
  fetchOptions()
}
</script>
```

### 4. 多级联动筛选

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item
      v-model="province"
      :options="provinceOptions"
      @change="handleProvinceChange"
    />
    <wd-drop-menu-item
      v-model="city"
      :options="cityOptions"
      :disabled="!province"
    />
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const province = ref<string>()
const city = ref<string>()

const provinceOptions = ref([
  { label: '请选择省份', value: '' },
  { label: '广东省', value: 'guangdong' },
  { label: '浙江省', value: 'zhejiang' },
  { label: '江苏省', value: 'jiangsu' },
])

const cityOptions = ref<Array<{ label: string; value: string }>>([])

const cityData: Record<string, Array<{ label: string; value: string }>> = {
  guangdong: [
    { label: '广州市', value: 'guangzhou' },
    { label: '深圳市', value: 'shenzhen' },
    { label: '东莞市', value: 'dongguan' },
  ],
  zhejiang: [
    { label: '杭州市', value: 'hangzhou' },
    { label: '宁波市', value: 'ningbo' },
    { label: '温州市', value: 'wenzhou' },
  ],
  jiangsu: [
    { label: '南京市', value: 'nanjing' },
    { label: '苏州市', value: 'suzhou' },
    { label: '无锡市', value: 'wuxi' },
  ],
}

const handleProvinceChange = ({ value }: { value: string }) => {
  // 清空已选城市
  city.value = undefined
  // 更新城市选项
  cityOptions.value = value ? cityData[value] || [] : []
}
</script>
```

### 5. 搭配搜索框使用

```vue
<template>
  <view class="search-filter">
    <view class="search-bar">
      <wd-search
        v-model="keyword"
        placeholder="搜索商品"
        @search="handleSearch"
      />
    </view>

    <wd-drop-menu>
      <wd-drop-menu-item
        v-model="category"
        :options="categoryOptions"
        @change="handleSearch"
      />
      <wd-drop-menu-item
        v-model="sort"
        :options="sortOptions"
        @change="handleSearch"
      />
    </wd-drop-menu>

    <view class="search-results">
      <!-- 搜索结果列表 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('')
const category = ref(0)
const sort = ref('default')

const categoryOptions = ref([
  { label: '全部', value: 0 },
  { label: '数码', value: 1 },
  { label: '服装', value: 2 },
])

const sortOptions = ref([
  { label: '综合', value: 'default' },
  { label: '销量', value: 'sales' },
  { label: '价格', value: 'price' },
])

const handleSearch = () => {
  // 执行搜索
  console.log('搜索:', {
    keyword: keyword.value,
    category: category.value,
    sort: sort.value,
  })
}
</script>

<style lang="scss" scoped>
.search-filter {
  .search-bar {
    padding: 16rpx 24rpx;
    background: #fff;
  }
}
</style>
```

## 常见问题

### 1. 菜单展开方向不对?

**问题原因:**
- `direction` 属性设置不正确
- 向上展开时上方空间不足

**解决方案:**

```vue
<template>
  <!-- 确保 direction 属性正确 -->
  <wd-drop-menu direction="up">
    <wd-drop-menu-item v-model="value" :options="options" />
  </wd-drop-menu>
</template>

<!-- 确保上方有足够空间 -->
<style lang="scss" scoped>
.bottom-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  // 上方需要有足够的空间显示选项
}
</style>
```

### 2. 如何异步加载选项数据?

**解决方案:**

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const options = ref<Array<{ label: string; value: number }>>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await fetchOptions()
    options.value = data
  } finally {
    loading.value = false
  }
})

// 也可以在菜单打开时加载
const handleOpen = async () => {
  if (options.value.length === 0) {
    const data = await fetchOptions()
    options.value = data
  }
}
</script>
```

### 3. 如何在选择后执行额外逻辑?

**解决方案:**

```vue
<template>
  <wd-drop-menu-item
    v-model="value"
    :options="options"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
const handleChange = ({ value, selectedItem }) => {
  // 执行额外逻辑
  console.log('选中值:', value)
  console.log('选中项:', selectedItem)

  // 请求数据
  fetchData(value)

  // 埋点上报
  trackEvent('filter_change', { value })
}
</script>
```

### 4. 自定义内容如何关闭菜单?

**问题原因:**
- 使用自定义内容时需要手动调用关闭方法

**解决方案:**

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item ref="menuRef" title="筛选">
      <view class="custom-content">
        <!-- 自定义内容 -->
        <wd-button @click="handleConfirm">确定</wd-button>
      </view>
    </wd-drop-menu-item>
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const menuRef = ref()

const handleConfirm = () => {
  // 处理业务逻辑
  // ...

  // 关闭菜单
  menuRef.value?.close()
}
</script>
```

### 5. 多个菜单同时打开?

**问题原因:**
- 组件默认行为是互斥的,只能打开一个
- 如果需要同时打开多个,需要禁用互斥逻辑

**解决方案:**

```vue
<!-- 使用多个独立的 wd-drop-menu 容器 -->
<template>
  <view class="menus">
    <wd-drop-menu>
      <wd-drop-menu-item v-model="value1" :options="options1" />
    </wd-drop-menu>
    <wd-drop-menu>
      <wd-drop-menu-item v-model="value2" :options="options2" />
    </wd-drop-menu>
  </view>
</template>
```

### 6. 选项数据字段名不匹配?

**问题原因:**
- 后端返回的数据结构与默认字段名不一致

**解决方案:**

```vue
<template>
  <wd-drop-menu-item
    v-model="value"
    :options="options"
    value-key="id"
    label-key="name"
    tip-key="count"
  />
</template>

<script lang="ts" setup>
// 使用后端返回的原始数据结构
const options = ref([
  { id: 1, name: '分类一', count: '100件' },
  { id: 2, name: '分类二', count: '200件' },
])
</script>
```

### 7. 菜单标题过长被截断?

**问题原因:**
- 菜单项宽度有限,标题过长会被截断

**解决方案:**

```vue
<style lang="scss">
// 方案1: 允许标题换行
.wd-drop-menu__item-title-text {
  white-space: normal;
  word-break: break-all;
}

// 方案2: 调整菜单项宽度
.wd-drop-menu__item {
  flex: none;
  min-width: 200rpx;
}

// 方案3: 使用 title 属性设置固定短标题
</style>

<template>
  <wd-drop-menu-item
    v-model="value"
    :options="options"
    title="分类"
  />
</template>
```

### 8. 遮罩层层级问题?

**问题原因:**
- 页面中有其他高层级元素覆盖了下拉菜单

**解决方案:**

```vue
<template>
  <wd-drop-menu :z-index="9999">
    <wd-drop-menu-item v-model="value" :options="options" />
  </wd-drop-menu>
</template>
```

### 9. 小程序端点击穿透?

**问题原因:**
- 小程序端遮罩层可能存在点击穿透问题

**解决方案:**

```vue
<template>
  <!-- 确保 modal 属性为 true -->
  <wd-drop-menu :modal="true" :close-on-click-modal="true">
    <wd-drop-menu-item v-model="value" :options="options" />
  </wd-drop-menu>
</template>

<!-- 如果仍有穿透问题,可以在遮罩层上添加 catch 事件 -->
```

### 10. 动态修改选项不生效?

**问题原因:**
- Vue 响应式更新问题

**解决方案:**

```vue
<script lang="ts" setup>
import { ref } from 'vue'

const options = ref([
  { label: '选项一', value: 0 },
])

// 正确: 使用 ref.value 赋值
const updateOptions = () => {
  options.value = [
    { label: '新选项一', value: 0 },
    { label: '新选项二', value: 1 },
  ]
}

// 错误: 直接修改数组元素可能不触发更新
// options.value[0].label = '新标题'

// 如需修改单个元素,使用 splice 或重新赋值整个数组
const updateSingleOption = () => {
  const newOptions = [...options.value]
  newOptions[0] = { ...newOptions[0], label: '新标题' }
  options.value = newOptions
}
</script>
```

## 性能优化

### 1. 避免频繁更新选项数据

```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'

// 使用 computed 缓存选项数据
const rawData = ref([...])

const options = computed(() => {
  return rawData.value.map(item => ({
    label: item.name,
    value: item.id,
    tip: `${item.count}件`,
  }))
})
</script>
```

### 2. 大量选项时使用虚拟滚动

对于选项数量较多的情况,建议使用自定义内容配合虚拟滚动组件:

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item ref="menuRef" title="选择城市">
      <virtual-list
        :data="cities"
        :item-height="88"
        @select="handleSelect"
      />
    </wd-drop-menu-item>
  </wd-drop-menu>
</template>
```

### 3. 合理使用 before-toggle

避免在 before-toggle 中执行耗时操作,如需异步校验,应显示加载状态:

```vue
<script lang="ts" setup>
const handleBeforeToggle: DropMenuItemBeforeToggle = async ({ status, resolve }) => {
  if (status) {
    uni.showLoading({ title: '加载中' })
    try {
      const hasPermission = await checkPermission()
      resolve(hasPermission)
    } finally {
      uni.hideLoading()
    }
  } else {
    resolve(true)
  }
}
</script>
```

## 无障碍访问

### 1. 语义化增强

```vue
<template>
  <wd-drop-menu aria-label="商品筛选">
    <wd-drop-menu-item
      v-model="value"
      :options="options"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    />
  </wd-drop-menu>
</template>
```

### 2. 键盘操作支持

组件已内置基本的触摸操作支持,在 H5 端也支持键盘操作:

- 点击/回车: 展开/收起菜单
- 上下键: 选择选项
- ESC: 关闭菜单

## 总结

DropMenu 下拉菜单组件核心要点:

1. **父子组件** - 由 `wd-drop-menu` 和 `wd-drop-menu-item` 组成
2. **双向展开** - 支持 `up` 和 `down` 两种展开方向
3. **自动互斥** - 多个菜单项自动互斥显示
4. **选项配置** - 通过 `options` 设置选项,支持自定义字段名
5. **自定义内容** - 使用默认插槽实现复杂筛选界面
6. **切换回调** - `before-toggle` 支持权限校验等场景
7. **程序化控制** - 通过 ref 调用 `open`/`close`/`toggle` 方法
8. **主题定制** - 提供完整的 CSS 变量支持主题定制
