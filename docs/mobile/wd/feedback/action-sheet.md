---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/actionSheet
---

# ActionSheet 动作面板

## 介绍

ActionSheet 是一个从底部弹出的动作菜单面板组件,用于让用户在多个选项中进行选择。该组件基于 Popup 弹出层实现,提供了菜单选项和面板项两种展示模式,广泛应用于分享、操作确认、功能选择等场景。

**核心特性:**

- **菜单选项模式** - 支持设置菜单选项列表,每个选项可配置名称、描述、颜色、禁用和加载状态
- **面板项模式** - 支持设置带图标的面板项,适用于分享到社交平台等场景
- **标题支持** - 可设置面板标题,标题区域带有关闭按钮
- **取消按钮** - 可配置取消按钮文案,点击后关闭面板
- **自定义内容** - 支持通过默认插槽自定义面板内容
- **加载状态** - 菜单选项支持显示加载中状态
- **禁用状态** - 菜单选项支持禁用,禁用后不可点击
- **点击关闭** - 支持配置点击选项或遮罩后是否关闭面板
- **安全区域** - 支持 iPhone X 等机型的底部安全区域适配
- **暗黑模式** - 内置暗黑模式样式适配

## 基本用法

### 基础用法

最基础的用法,显示菜单选项列表:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">打开动作面板</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '选项一' },
  { name: '选项二' },
  { name: '选项三' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name, '索引:', data.index)
}
</script>

```

**使用说明:**
- 使用 `v-model` 控制面板的显示和隐藏
- `actions` 属性设置菜单选项列表
- `select` 事件在选择选项时触发,返回选中的选项数据和索引

### 显示取消按钮

通过 `cancel-text` 属性设置取消按钮文案:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">带取消按钮</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      cancel-text="取消"
      @select="handleSelect"
      @cancel="handleCancel"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '选项一' },
  { name: '选项二' },
  { name: '选项三' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name)
}

const handleCancel = () => {
  console.log('点击了取消按钮')
}
</script>
```

**使用说明:**
- `cancel-text` 设置取消按钮的文案
- 点击取消按钮会触发 `cancel` 事件并关闭面板

### 显示标题

通过 `title` 属性设置面板标题:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">带标题</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      title="请选择操作"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '编辑' },
  { name: '删除' },
  { name: '分享' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name)
}
</script>
```

**使用说明:**
- 设置 `title` 后,面板顶部会显示标题栏
- 标题栏右侧有关闭按钮,点击可关闭面板

### 选项描述

通过 `subname` 属性为选项添加描述信息:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">带描述</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      title="请选择付款方式"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '微信支付', subname: '推荐使用' },
  { name: '支付宝支付', subname: '支持花呗' },
  { name: '银行卡支付', subname: '需验证短信' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name)
}
</script>
```

### 选项颜色

通过 `color` 属性设置选项的颜色:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">自定义颜色</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '确认', color: '#1890ff' },
  { name: '删除', color: '#ff4d4f' },
  { name: '取消操作' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name)
}
</script>
```

### 禁用选项

通过 `disabled` 属性禁用选项:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">禁用选项</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '选项一' },
  { name: '选项二', disabled: true },
  { name: '选项三' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name)
}
</script>
```

**使用说明:**
- 禁用的选项会显示灰色,点击无响应

### 加载状态

通过 `loading` 属性显示选项的加载状态:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">加载状态</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '选项一' },
  { name: '选项二', loading: true },
  { name: '选项三' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name)
}
</script>
```

**使用说明:**
- 加载中的选项会显示 Loading 图标,点击无响应

### 面板项模式

通过 `panels` 属性设置带图标的面板项,适用于分享等场景:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">分享面板</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :panels="panels"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const panels = ref([
  { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-wechat.png', title: '微信' },
  { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-weibo.png', title: '微博' },
  { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-link.png', title: '复制链接' },
  { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-poster.png', title: '生成海报' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.title)
}
</script>
```

**使用说明:**
- 面板项包含图标 `iconUrl` 和标题 `title`
- 面板项以横向滚动的方式展示

### 多行面板项

`panels` 支持传入二维数组实现多行展示:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">多行面板</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :panels="panels"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const panels = ref([
  [
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-wechat.png', title: '微信' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-weibo.png', title: '微博' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-qq.png', title: 'QQ' }
  ],
  [
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-link.png', title: '复制链接' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-poster.png', title: '生成海报' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-qrcode.png', title: '二维码' }
  ]
])

const handleSelect = (data: { item: any; index: number; rowIndex?: number }) => {
  console.log('选择了:', data.item.title, '行:', data.rowIndex, '列:', data.index)
}
</script>
```

**使用说明:**
- 传入二维数组时,每个子数组代表一行面板项
- select 事件返回的数据包含 `rowIndex` 和 `colIndex`

### 点击选项不关闭

通过 `close-on-click-action` 属性控制点击选项后是否关闭面板:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">点击不关闭</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      :close-on-click-action="false"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '选项一' },
  { name: '选项二' },
  { name: '选项三' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name)
  // 手动关闭面板
  setTimeout(() => {
    showSheet.value = false
  }, 1000)
}
</script>
```

### 禁止点击遮罩关闭

通过 `close-on-click-modal` 属性控制点击遮罩是否关闭面板:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">点击遮罩不关闭</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      :close-on-click-modal="false"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const actions = ref([
  { name: '选项一' },
  { name: '选项二' },
  { name: '选项三' }
])

const handleSelect = (data: { item: any; index: number }) => {
  console.log('选择了:', data.item.name)
}
</script>
```

### 自定义内容

通过默认插槽自定义面板内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">自定义内容</wd-button>

    <wd-action-sheet v-model="showSheet" title="自定义内容">
      <view class="custom-content">
        <text class="tip">确定要删除该项目吗?</text>
        <text class="desc">删除后将无法恢复,请谨慎操作</text>
        <view class="btns">
          <wd-button size="small" @click="showSheet = false">取消</wd-button>
          <wd-button type="danger" size="small" @click="handleConfirm">确认删除</wd-button>
        </view>
      </view>
    </wd-action-sheet>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const handleConfirm = () => {
  console.log('确认删除')
  showSheet.value = false
}
</script>

```

### 兼容字典数据

组件支持 DictItem 格式的数据,可以直接使用字典数据:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">字典数据</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="dictActions"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

// 使用 label/value 格式的字典数据
const dictActions = ref([
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' }
])

const handleSelect = (data: { item: any; index: number; value?: string; label?: string }) => {
  console.log('选择了:', data.label, '值:', data.value)
}
</script>
```

**使用说明:**
- 组件同时支持 `name` 和 `label` 字段作为显示文本
- select 事件返回的数据包含 `value` 和 `label` 字段

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 控制面板显示/隐藏 | `boolean` | `false` |
| actions | 菜单选项列表 | `Action[]` | `[]` |
| panels | 面板项列表,支持一维或二维数组 | `Panel[] \| Panel[][]` | `[]` |
| title | 面板标题 | `string` | - |
| cancel-text | 取消按钮文案 | `string` | - |
| close-on-click-action | 点击选项后是否关闭 | `boolean` | `true` |
| close-on-click-modal | 点击遮罩是否关闭 | `boolean` | `true` |
| duration | 动画持续时间,单位毫秒 | `number` | `200` |
| z-index | 面板层级 | `number` | `100` |
| lazy-render | 是否懒渲染 | `boolean` | `true` |
| safe-area-inset-bottom | 是否适配底部安全区域 | `boolean` | `true` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-header-class | 自定义头部样式类 | `string` | `''` |

### Action 数据结构

| 字段 | 说明 | 类型 |
|------|------|------|
| name | 选项名称 | `string` |
| label | 选项标签(兼容字典格式) | `string` |
| value | 选项值(兼容字典格式) | `string \| number` |
| subname | 描述信息 | `string` |
| color | 选项颜色 | `string` |
| disabled | 是否禁用 | `boolean` |
| loading | 是否显示加载状态 | `boolean` |

### Panel 数据结构

| 字段 | 说明 | 类型 |
|------|------|------|
| iconUrl | 图标图片地址 | `string` |
| title | 面板项标题 | `string` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| select | 选择选项或面板项时触发 | `SelectEventData` |
| cancel | 点击取消按钮时触发 | - |
| close | 面板关闭时触发 | - |
| closed | 面板关闭动画结束后触发 | - |
| open | 面板打开时触发 | - |
| opened | 面板打开动画结束后触发 | - |
| click-modal | 点击遮罩时触发 | - |

### SelectEventData 数据结构

| 字段 | 说明 | 类型 |
|------|------|------|
| item | 选中的选项或面板项数据 | `Action \| Panel` |
| index | 选项索引 | `number` |
| value | 选项值(兼容字典格式) | `string \| number` |
| label | 选项标签(兼容字典格式) | `string` |
| rowIndex | 行索引(多行面板时) | `number` |
| colIndex | 列索引(多行面板时) | `number` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义面板内容 |

### 类型定义

```typescript
/**
 * 菜单选项接口
 */
interface Action {
  /** 选项名称 */
  name?: string
  /** 选项标签(兼容字典格式) */
  label?: string
  /** 选项值(兼容字典格式) */
  value?: string | number
  /** 描述信息 */
  subname?: string
  /** 颜色 */
  color?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示加载状态 */
  loading?: boolean
}

/**
 * 面板项接口
 */
interface Panel {
  /** 图标图片地址 */
  iconUrl: string
  /** 面板项标题 */
  title: string
}

/**
 * 选择事件返回数据
 */
interface SelectEventData {
  /** 选中的选项或面板项数据 */
  item: Action | Panel
  /** 选项索引 */
  index: number
  /** 选项值 */
  value?: string | number
  /** 选项标签 */
  label?: string
  /** 行索引(多行面板时) */
  rowIndex?: number
  /** 列索引(多行面板时) */
  colIndex?: number
}
```

## 最佳实践

### 1. 根据场景选择模式

根据不同场景选择合适的展示模式:

```vue
<!-- ✅ 操作选择使用 actions 模式 -->
<wd-action-sheet
  v-model="show"
  :actions="[
    { name: '编辑' },
    { name: '删除', color: '#ff4d4f' }
  ]"
/>

<!-- ✅ 分享功能使用 panels 模式 -->
<wd-action-sheet
  v-model="show"
  :panels="[
    { iconUrl: '/icons/wechat.png', title: '微信' },
    { iconUrl: '/icons/weibo.png', title: '微博' }
  ]"
/>
```

### 2. 危险操作使用红色提示

```vue
<wd-action-sheet
  v-model="show"
  :actions="[
    { name: '编辑' },
    { name: '删除', color: '#ff4d4f' }
  ]"
  cancel-text="取消"
/>
```

### 3. 异步操作使用加载状态

```vue
<script lang="ts" setup>
const handleSelect = async (data: any) => {
  // 设置加载状态
  actions.value[data.index].loading = true

  try {
    await doSomething()
    showSheet.value = false
  } finally {
    actions.value[data.index].loading = false
  }
}
</script>
```

## 常见问题

### 1. 面板无法关闭

**问题原因:**
- 未正确使用 v-model
- closeOnClickAction 设置为 false 但未手动关闭

**解决方案:**
```vue
<!-- ✅ 使用 v-model 双向绑定 -->
<wd-action-sheet v-model="showSheet" />

<!-- 或手动控制关闭 -->
<wd-action-sheet
  :model-value="showSheet"
  @update:model-value="showSheet = $event"
/>
```

### 2. iPhone X 底部被遮挡

**解决方案:**
确保 `safe-area-inset-bottom` 属性为 `true`(默认值):
```vue
<wd-action-sheet v-model="show" :safe-area-inset-bottom="true" />
```

### 3. 面板项图标不显示

**问题原因:**
- 图片地址无效
- 网络图片跨域问题

**解决方案:**
```vue
<script lang="ts" setup>
// ✅ 使用有效的图片地址
const panels = ref([
  { iconUrl: 'https://valid-domain.com/icon.png', title: '分享' }
])

// ✅ 或使用本地图片
const panels = ref([
  { iconUrl: '/static/icons/share.png', title: '分享' }
])
</script>
```

### 4. 选项过多时滚动卡顿

**问题原因:**
- 选项数量过多导致渲染性能下降

**解决方案:**
```vue
<template>
  <!-- ✅ 限制选项数量,或使用虚拟滚动 -->
  <wd-action-sheet
    v-model="showSheet"
    :actions="limitedActions"
    cancel-text="取消"
  />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const allActions = ref([/* 大量选项 */])

// 限制显示数量
const limitedActions = computed(() => {
  return allActions.value.slice(0, 10)
})
</script>
```

### 5. 动画效果不流畅

**问题原因:**
- duration 设置过短
- 设备性能较低

**解决方案:**
```vue
<!-- ✅ 适当增加动画时长 -->
<wd-action-sheet
  v-model="showSheet"
  :actions="actions"
  :duration="300"
/>
```

### 6. 取消按钮样式异常

**问题原因:**
- 自定义样式覆盖了默认样式

**解决方案:**
```vue
<template>
  <wd-action-sheet
    v-model="showSheet"
    :actions="actions"
    cancel-text="取消"
    custom-class="my-action-sheet"
  />
</template>

<style lang="scss">
// ✅ 正确的样式覆盖方式
.my-action-sheet {
  :deep(.wd-action-sheet__cancel) {
    color: #333;
    background: #f5f5f5;
  }
}
</style>
```

## 主题定制

### CSS 变量

ActionSheet 组件支持以下 CSS 变量进行主题定制:

```scss
// 基础样式变量
$-action-sheet-radius: 32rpx !default;           // 圆角大小
$-action-sheet-bg: $-color-white !default;       // 背景色
$-action-sheet-color: $-color-title !default;    // 文字颜色
$-action-sheet-fs: 32rpx !default;               // 字体大小
$-action-sheet-weight: 500 !default;             // 字重

// 选项样式变量
$-action-sheet-action-height: 112rpx !default;   // 选项高度
$-action-sheet-active-color: $-color-bg !default; // 点击态背景色
$-action-sheet-disabled-color: $-color-content !default; // 禁用颜色

// 描述文字变量
$-action-sheet-subname-fs: 24rpx !default;       // 描述字体大小
$-action-sheet-subname-color: $-color-content !default; // 描述颜色

// 取消按钮变量
$-action-sheet-cancel-height: 100rpx !default;   // 取消按钮高度
$-action-sheet-cancel-color: $-color-title !default; // 取消按钮颜色
$-action-sheet-cancel-bg: $-color-bg !default;   // 取消按钮背景
$-action-sheet-cancel-radius: 56rpx !default;    // 取消按钮圆角

// 标题样式变量
$-action-sheet-title-height: 116rpx !default;    // 标题高度
$-action-sheet-title-fs: 32rpx !default;         // 标题字体大小

// 关闭按钮变量
$-action-sheet-close-top: 32rpx !default;        // 关闭按钮顶部距离
$-action-sheet-close-right: 32rpx !default;      // 关闭按钮右侧距离
$-action-sheet-close-color: $-color-content !default; // 关闭按钮颜色
$-action-sheet-close-fs: 44rpx !default;         // 关闭按钮大小

// 面板项变量
$-action-sheet-panel-padding: 0 24rpx !default;  // 面板项内边距
$-action-sheet-panel-img-fs: 96rpx !default;     // 面板图标大小
$-action-sheet-panel-img-radius: 12rpx !default; // 面板图标圆角

// 加载图标变量
$-action-sheet-loading-size: 40rpx !default;     // 加载图标大小
```

### 自定义主题示例

```vue
<template>
  <wd-action-sheet
    v-model="showSheet"
    :actions="actions"
    cancel-text="取消"
    custom-class="custom-action-sheet"
  />
</template>

<style lang="scss">
.custom-action-sheet {
  // 自定义圆角
  border-radius: 24rpx 24rpx 0 0;

  // 自定义选项样式
  :deep(.wd-action-sheet__action) {
    height: 120rpx;
    line-height: 120rpx;
    font-size: 34rpx;

    &:active {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  // 自定义取消按钮
  :deep(.wd-action-sheet__cancel) {
    height: 110rpx;
    line-height: 110rpx;
    font-size: 34rpx;
    color: #666;
    background: #f8f8f8;
    border-radius: 48rpx;
    margin: 24rpx 32rpx 32rpx;
    width: calc(100% - 64rpx);
  }

  // 自定义标题
  :deep(.wd-action-sheet__header) {
    height: 100rpx;
    line-height: 100rpx;
    font-size: 28rpx;
    color: #999;
  }
}
</style>
```

### 暗黑模式

组件内置暗黑模式支持,在暗黑模式下会自动应用对应样式:

```scss
// 暗黑模式下的样式
.wot-theme-dark {
  .wd-action-sheet {
    background-color: $-dark-background2;
    color: $-dark-color;

    .wd-action-sheet__action {
      color: $-dark-color;
      background: $-dark-background2;

      &:active {
        background: $-dark-background4;
      }

      &--disabled {
        color: $-dark-color-gray;
      }
    }

    .wd-action-sheet__cancel {
      color: $-dark-color;
      background: $-dark-background4;

      &:active {
        background: $-dark-background5;
      }
    }
  }
}
```

## 高级用法

### 动态更新选项

支持在运行时动态更新选项列表:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">动态选项</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="dynamicActions"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const showSheet = ref(false)
const dynamicActions = ref<any[]>([])

// 模拟异步加载选项
const loadActions = async () => {
  // 模拟接口请求
  await new Promise(resolve => setTimeout(resolve, 500))

  dynamicActions.value = [
    { name: '选项一', value: 1 },
    { name: '选项二', value: 2 },
    { name: '选项三', value: 3 }
  ]
}

onMounted(() => {
  loadActions()
})

const handleSelect = (data: any) => {
  console.log('选择了:', data)
}
</script>
```

### 异步选项加载

在打开面板时动态加载选项:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleOpen">异步加载</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      cancel-text="取消"
      @open="onSheetOpen"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)
const actions = ref<any[]>([])
const loading = ref(false)

const handleOpen = () => {
  showSheet.value = true
}

const onSheetOpen = async () => {
  if (actions.value.length > 0) return

  loading.value = true

  try {
    // 模拟接口请求
    const result = await fetchOptions()
    actions.value = result
  } finally {
    loading.value = false
  }
}

const fetchOptions = () => {
  return new Promise<any[]>(resolve => {
    setTimeout(() => {
      resolve([
        { name: '从相册选择', value: 'album' },
        { name: '拍照', value: 'camera' },
        { name: '从文件选择', value: 'file' }
      ])
    }, 500)
  })
}

const handleSelect = (data: any) => {
  console.log('选择了:', data.value)
}
</script>
```

### 联动选择

实现多级联动选择效果:

```vue
<template>
  <view class="demo">
    <wd-button @click="showFirst = true">联动选择</wd-button>

    <!-- 第一级选择 -->
    <wd-action-sheet
      v-model="showFirst"
      :actions="firstActions"
      title="选择省份"
      cancel-text="取消"
      @select="handleFirstSelect"
    />

    <!-- 第二级选择 -->
    <wd-action-sheet
      v-model="showSecond"
      :actions="secondActions"
      title="选择城市"
      cancel-text="返回"
      @select="handleSecondSelect"
      @cancel="handleSecondCancel"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showFirst = ref(false)
const showSecond = ref(false)
const selectedProvince = ref('')

const firstActions = ref([
  { name: '广东省', value: 'gd' },
  { name: '浙江省', value: 'zj' },
  { name: '江苏省', value: 'js' }
])

const secondActions = ref<any[]>([])

const cityMap: Record<string, any[]> = {
  gd: [
    { name: '广州市', value: 'gz' },
    { name: '深圳市', value: 'sz' },
    { name: '东莞市', value: 'dg' }
  ],
  zj: [
    { name: '杭州市', value: 'hz' },
    { name: '宁波市', value: 'nb' },
    { name: '温州市', value: 'wz' }
  ],
  js: [
    { name: '南京市', value: 'nj' },
    { name: '苏州市', value: 'suzhou' },
    { name: '无锡市', value: 'wx' }
  ]
}

const handleFirstSelect = (data: any) => {
  selectedProvince.value = data.value
  secondActions.value = cityMap[data.value] || []

  // 延迟显示第二级
  setTimeout(() => {
    showSecond.value = true
  }, 200)
}

const handleSecondSelect = (data: any) => {
  console.log('选择了:', selectedProvince.value, data.value)
}

const handleSecondCancel = () => {
  // 返回第一级
  setTimeout(() => {
    showFirst.value = true
  }, 200)
}
</script>
```

### 带确认的选择

选择后需要二次确认:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">带确认选择</wd-button>

    <wd-action-sheet
      v-model="showSheet"
      :actions="actions"
      :close-on-click-action="false"
      cancel-text="取消"
      @select="handleSelect"
    />

    <!-- 确认弹窗 -->
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useMessage } from '@/wd'

const showSheet = ref(false)
const { confirm } = useMessage()

const actions = ref([
  { name: '编辑', value: 'edit' },
  { name: '删除', value: 'delete', color: '#ff4d4f' }
])

const handleSelect = async (data: any) => {
  if (data.value === 'delete') {
    try {
      await confirm({
        title: '确认删除',
        msg: '删除后无法恢复,确定要删除吗?'
      })

      // 确认删除
      console.log('执行删除操作')
      showSheet.value = false
    } catch {
      // 取消删除,不关闭面板
    }
  } else {
    // 其他操作直接执行
    console.log('执行操作:', data.value)
    showSheet.value = false
  }
}
</script>
```

### 带图标的选项

通过自定义内容实现带图标的选项:

```vue
<template>
  <view class="demo">
    <wd-button @click="showSheet = true">带图标选项</wd-button>

    <wd-action-sheet v-model="showSheet" title="选择操作" cancel-text="取消">
      <view class="icon-actions">
        <view
          v-for="(item, index) in iconActions"
          :key="index"
          class="icon-action"
          @click="handleIconSelect(item)"
        >
          <wd-icon :name="item.icon" size="48rpx" :color="item.color" />
          <text class="icon-action__name">{{ item.name }}</text>
        </view>
      </view>
    </wd-action-sheet>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showSheet = ref(false)

const iconActions = ref([
  { name: '编辑', icon: 'edit', color: '#1890ff', value: 'edit' },
  { name: '复制', icon: 'copy', color: '#52c41a', value: 'copy' },
  { name: '分享', icon: 'share', color: '#722ed1', value: 'share' },
  { name: '删除', icon: 'delete', color: '#ff4d4f', value: 'delete' }
])

const handleIconSelect = (item: any) => {
  console.log('选择了:', item.value)
  showSheet.value = false
}
</script>

```

### 结合表单使用

在表单中使用 ActionSheet 进行选择:

```vue
<template>
  <view class="demo">
    <wd-cell-group>
      <wd-cell
        title="选择类型"
        :value="selectedLabel || '请选择'"
        is-link
        @click="showSheet = true"
      />
    </wd-cell-group>

    <wd-action-sheet
      v-model="showSheet"
      :actions="typeActions"
      title="选择类型"
      cancel-text="取消"
      @select="handleSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const showSheet = ref(false)
const selectedValue = ref('')

const typeActions = ref([
  { name: '个人用户', value: 'personal' },
  { name: '企业用户', value: 'enterprise' },
  { name: '政府机构', value: 'government' }
])

const selectedLabel = computed(() => {
  const item = typeActions.value.find(a => a.value === selectedValue.value)
  return item?.name || ''
})

const handleSelect = (data: any) => {
  selectedValue.value = data.value
}
</script>
```

## 注意事项

### 1. 性能优化

- 选项数量建议不超过 10 个,过多选项会影响用户体验
- 面板项图片建议使用压缩后的图片,避免大图加载慢
- 使用 `lazy-render` 属性可以延迟渲染,提升首次打开速度

### 2. 交互设计

- 危险操作(如删除)建议使用红色文字提示
- 禁用选项应该给出禁用原因的提示
- 取消按钮应该始终可见,方便用户退出

### 3. 无障碍

- 确保选项文字清晰易读
- 选项之间保持足够的间距,方便点击
- 考虑为视障用户提供语音提示

### 4. 多端兼容

- 微信小程序中,button 组件默认有边框,组件已处理
- 部分平台可能不支持 backdrop-filter,已做降级处理
- iOS 设备需要适配底部安全区域

### 5. 数据格式

- 支持 `name` 和 `label` 两种字段作为显示文本
- 支持 `value` 字段用于标识选项
- 面板项必须包含 `iconUrl` 和 `title` 字段

## 组件依赖

ActionSheet 组件内部依赖以下组件:

- **wd-popup** - 弹出层,提供底部弹出动画效果
- **wd-icon** - 图标,用于关闭按钮
- **wd-loading** - 加载,用于选项加载状态

## 完整示例

### 综合示例

```vue
<template>
  <view class="demo-page">
    <view class="demo-section">
      <view class="demo-title">基础用法</view>
      <wd-button @click="showBasic = true">基础面板</wd-button>
    </view>

    <view class="demo-section">
      <view class="demo-title">带标题和取消</view>
      <wd-button @click="showWithTitle = true">带标题</wd-button>
    </view>

    <view class="demo-section">
      <view class="demo-title">分享面板</view>
      <wd-button @click="showShare = true">分享</wd-button>
    </view>

    <view class="demo-section">
      <view class="demo-title">自定义内容</view>
      <wd-button @click="showCustom = true">自定义</wd-button>
    </view>

    <!-- 基础面板 -->
    <wd-action-sheet
      v-model="showBasic"
      :actions="basicActions"
      @select="handleBasicSelect"
    />

    <!-- 带标题面板 -->
    <wd-action-sheet
      v-model="showWithTitle"
      :actions="titleActions"
      title="请选择操作"
      cancel-text="取消"
      @select="handleTitleSelect"
    />

    <!-- 分享面板 -->
    <wd-action-sheet
      v-model="showShare"
      :panels="sharePanels"
      title="分享到"
      cancel-text="取消"
      @select="handleShareSelect"
    />

    <!-- 自定义内容面板 -->
    <wd-action-sheet v-model="showCustom" title="确认操作">
      <view class="custom-content">
        <view class="custom-content__icon">
          <wd-icon name="warning" size="80rpx" color="#faad14" />
        </view>
        <view class="custom-content__title">确定要执行此操作吗?</view>
        <view class="custom-content__desc">此操作不可撤销,请谨慎处理</view>
        <view class="custom-content__btns">
          <wd-button plain @click="showCustom = false">取消</wd-button>
          <wd-button type="danger" @click="handleConfirm">确认</wd-button>
        </view>
      </view>
    </wd-action-sheet>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 显示状态
const showBasic = ref(false)
const showWithTitle = ref(false)
const showShare = ref(false)
const showCustom = ref(false)

// 基础选项
const basicActions = ref([
  { name: '选项一' },
  { name: '选项二' },
  { name: '选项三' }
])

// 带标题选项
const titleActions = ref([
  { name: '编辑', value: 'edit' },
  { name: '复制', value: 'copy' },
  { name: '删除', value: 'delete', color: '#ff4d4f' }
])

// 分享面板
const sharePanels = ref([
  [
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-wechat.png', title: '微信' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-weibo.png', title: '微博' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-qq.png', title: 'QQ' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-qzone.png', title: 'QQ空间' }
  ],
  [
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-link.png', title: '复制链接' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-poster.png', title: '生成海报' },
    { iconUrl: 'https://img.yzcdn.cn/vant/share-sheet-qrcode.png', title: '二维码' }
  ]
])

// 事件处理
const handleBasicSelect = (data: any) => {
  console.log('基础选择:', data.item.name)
}

const handleTitleSelect = (data: any) => {
  console.log('标题选择:', data.value)
}

const handleShareSelect = (data: any) => {
  console.log('分享选择:', data.item.title)
}

const handleConfirm = () => {
  console.log('确认操作')
  showCustom.value = false
}
</script>

```

### 业务场景示例

#### 图片选择器

```vue
<template>
  <view class="demo">
    <wd-button @click="showImagePicker = true">选择图片</wd-button>

    <wd-action-sheet
      v-model="showImagePicker"
      :actions="imageActions"
      cancel-text="取消"
      @select="handleImageSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showImagePicker = ref(false)

const imageActions = ref([
  { name: '拍照', value: 'camera' },
  { name: '从相册选择', value: 'album' }
])

const handleImageSelect = async (data: any) => {
  if (data.value === 'camera') {
    // 调用相机
    uni.chooseImage({
      count: 1,
      sourceType: ['camera'],
      success: (res) => {
        console.log('拍照成功:', res.tempFilePaths)
      }
    })
  } else {
    // 从相册选择
    uni.chooseImage({
      count: 9,
      sourceType: ['album'],
      success: (res) => {
        console.log('选择成功:', res.tempFilePaths)
      }
    })
  }
}
</script>
```

#### 文件操作菜单

```vue
<template>
  <view class="demo">
    <view
      v-for="file in files"
      :key="file.id"
      class="file-item"
      @longpress="handleLongPress(file)"
    >
      <text>{{ file.name }}</text>
    </view>

    <wd-action-sheet
      v-model="showFileMenu"
      :actions="fileActions"
      :title="currentFile?.name"
      cancel-text="取消"
      @select="handleFileAction"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showFileMenu = ref(false)
const currentFile = ref<any>(null)

const files = ref([
  { id: 1, name: '文档1.pdf' },
  { id: 2, name: '图片1.png' },
  { id: 3, name: '视频1.mp4' }
])

const fileActions = ref([
  { name: '打开', value: 'open' },
  { name: '重命名', value: 'rename' },
  { name: '移动', value: 'move' },
  { name: '复制', value: 'copy' },
  { name: '删除', value: 'delete', color: '#ff4d4f' }
])

const handleLongPress = (file: any) => {
  currentFile.value = file
  showFileMenu.value = true
}

const handleFileAction = (data: any) => {
  const action = data.value
  const file = currentFile.value

  switch (action) {
    case 'open':
      console.log('打开文件:', file.name)
      break
    case 'rename':
      console.log('重命名文件:', file.name)
      break
    case 'move':
      console.log('移动文件:', file.name)
      break
    case 'copy':
      console.log('复制文件:', file.name)
      break
    case 'delete':
      console.log('删除文件:', file.name)
      break
  }
}
</script>

```

#### 支付方式选择

```vue
<template>
  <view class="demo">
    <view class="order-info">
      <text class="order-amount">¥ {{ amount }}</text>
    </view>

    <wd-button type="primary" block @click="showPayment = true">
      立即支付
    </wd-button>

    <wd-action-sheet
      v-model="showPayment"
      :actions="paymentActions"
      title="选择支付方式"
      cancel-text="取消"
      @select="handlePaymentSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPayment = ref(false)
const amount = ref('99.00')

const paymentActions = ref([
  {
    name: '微信支付',
    subname: '推荐',
    value: 'wechat',
    color: '#07c160'
  },
  {
    name: '支付宝支付',
    subname: '支持花呗',
    value: 'alipay',
    color: '#1677ff'
  },
  {
    name: '银行卡支付',
    value: 'bank'
  },
  {
    name: '余额支付',
    subname: '余额: ¥50.00',
    value: 'balance',
    disabled: true  // 余额不足时禁用
  }
])

const handlePaymentSelect = (data: any) => {
  console.log('选择支付方式:', data.value)

  // 调用支付接口
  switch (data.value) {
    case 'wechat':
      // 微信支付
      break
    case 'alipay':
      // 支付宝支付
      break
    case 'bank':
      // 银行卡支付
      break
  }
}
</script>

```
