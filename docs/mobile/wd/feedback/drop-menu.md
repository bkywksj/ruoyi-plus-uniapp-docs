---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/dropMenu
---

# DropMenu 下拉菜单

## 介绍

DropMenu 下拉菜单是一个向下或向上弹出的菜单列表组件,常用于筛选、排序等场景。组件由 `wd-drop-menu` 和 `wd-drop-menu-item` 两部分组成,支持多个菜单项同时存在,点击某一菜单项时会自动关闭其他已展开的菜单。

组件支持向上和向下两种展开方向,提供了丰富的配置选项,包括自定义选项数据、禁用状态、切换前回调等功能,能够满足各种筛选场景的需求。

**核心特性:**

- **双向展开** - 支持向上(up)和向下(down)两种展开方向
- **自动互斥** - 点击某一菜单时自动关闭其他已展开的菜单
- **遮罩层** - 可配置是否显示遮罩层及点击遮罩关闭
- **禁用状态** - 支持禁用单个菜单项
- **切换回调** - 支持 beforeToggle 回调控制菜单展开/关闭
- **自定义内容** - 支持通过插槽自定义菜单内容

## 基本用法

### 基础下拉菜单

通过 `options` 设置选项数据,`v-model` 绑定选中值。

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

### 自定义菜单标题

设置 `title` 属性可以自定义菜单标题,不再根据选中值自动显示。

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

### 向上展开

设置 `direction="up"` 使菜单向上展开。

```vue
<template>
  <wd-drop-menu direction="up">
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
])

const options2 = ref([
  { label: '综合排序', value: 'a' },
  { label: '销量优先', value: 'b' },
])
</script>
```

### 禁用菜单

设置 `disabled` 属性禁用菜单项。

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

### 带提示文字的选项

通过 `tipKey` 设置选项提示文字的字段名。

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

### 自定义选中图标

通过 `icon-name` 设置选中项的图标。

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

### 切换前回调

通过 `before-toggle` 属性设置切换前回调,可以阻止菜单展开或关闭。

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
    // 打开前的逻辑,如权限校验
    console.log('即将打开菜单')
  } else {
    // 关闭前的逻辑
    console.log('即将关闭菜单')
  }
  // 调用 resolve(true) 允许操作,resolve(false) 阻止操作
  resolve(true)
}
</script>
```

### 自定义菜单内容

不传 `options` 时,可以通过默认插槽自定义菜单内容。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item v-model="value" :options="options" />
    <wd-drop-menu-item title="筛选">
      <view class="custom-content">
        <wd-cell title="包邮" center>
          <wd-switch v-model="freeShipping" />
        </wd-cell>
        <wd-cell title="有货" center>
          <wd-switch v-model="inStock" />
        </wd-cell>
        <view class="custom-content__footer">
          <wd-button type="primary" block @click="handleConfirm">确定</wd-button>
        </view>
      </view>
    </wd-drop-menu-item>
  </wd-drop-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(0)
const freeShipping = ref(false)
const inStock = ref(false)

const options = ref([
  { label: '全部商品', value: 0 },
  { label: '新款商品', value: 1 },
])

const handleConfirm = () => {
  // 关闭菜单的逻辑
}
</script>

<style lang="scss" scoped>
.custom-content {
  padding: 24rpx;

  &__footer {
    margin-top: 24rpx;
  }
}
</style>
```

### 监听事件

监听 `change` 事件获取选中值变化。

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item
      v-model="value"
      :options="options"
      @change="handleChange"
      @open="handleOpen"
      @close="handleClose"
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
}

const handleOpen = () => {
  console.log('菜单打开')
}

const handleClose = () => {
  console.log('菜单关闭')
}
</script>
```

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
}
```

## 主题定制

### CSS 变量

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-drop-menu-color | 菜单文字颜色 | `#333333` |
| --wd-drop-menu-fs | 菜单字体大小 | `28rpx` |
| --wd-drop-menu-height | 菜单高度 | `88rpx` |
| --wd-drop-menu-disabled-color | 禁用状态颜色 | `#c0c4cc` |
| --wd-drop-menu-side-padding | 菜单项内边距 | `32rpx` |
| --wd-drop-menu-arrow-fs | 箭头图标大小 | `40rpx` |
| --wd-drop-menu-line-color | 激活状态下划线颜色 | 主题色 |
| --wd-drop-menu-line-height | 激活状态下划线高度 | `6rpx` |
| --wd-drop-menu-item-fs | 选项字体大小 | `28rpx` |
| --wd-drop-menu-item-color | 选项文字颜色 | `#333333` |
| --wd-drop-menu-item-height | 选项高度 | `88rpx` |
| --wd-drop-menu-item-color-active | 选项激活状态颜色 | 主题色 |
| --wd-drop-menu-item-color-tip | 提示文字颜色 | `#909399` |
| --wd-drop-menu-item-fs-tip | 提示文字字体大小 | `24rpx` |

### 暗黑模式

组件已适配暗黑模式,在暗黑主题下会自动切换样式。

## 最佳实践

### 1. 商品筛选场景

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item v-model="category" :options="categoryOptions" />
    <wd-drop-menu-item v-model="sort" :options="sortOptions" />
    <wd-drop-menu-item title="筛选" @open="handleFilterOpen">
      <view class="filter-content">
        <!-- 自定义筛选内容 -->
      </view>
    </wd-drop-menu-item>
  </wd-drop-menu>
</template>
```

### 2. 控制菜单开关

```vue
<template>
  <wd-drop-menu>
    <wd-drop-menu-item ref="menuItemRef" v-model="value" :options="options" />
  </wd-drop-menu>
  <wd-button @click="openMenu">打开菜单</wd-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const menuItemRef = ref()

const openMenu = () => {
  menuItemRef.value?.open()
}
</script>
```

## 常见问题

### 1. 菜单展开方向不对?

确保 `direction` 属性设置正确,`down` 向下展开,`up` 向上展开。向上展开时,组件需要有足够的上方空间。

### 2. 如何异步加载选项数据?

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const options = ref([])

onMounted(async () => {
  const data = await fetchOptions()
  options.value = data
})
</script>
```

### 3. 如何在选择后执行额外逻辑?

监听 `change` 事件:

```vue
<wd-drop-menu-item
  v-model="value"
  :options="options"
  @change="({ value, selectedItem }) => {
    // 执行额外逻辑,如请求数据
    fetchData(value)
  }"
/>
```
