# ColPicker 多列选择器

## 介绍

ColPicker 多列选择器是一个功能强大的级联选择组件,专为移动端设计,提供流畅的多列级联选择体验。组件支持无限级选择、内置中国省市区数据、动态列加载、自定义格式化等丰富功能,适用于地区选择、分类选择、关联数据选择等多种场景。

**核心特性:**

- **内置省市区数据** - 内置完整的中国省市区三级数据,无需额外配置即可使用
- **无限级联选择** - 支持任意层级的级联选择,通过 columnChange 回调动态加载下一级数据
- **智能自动补全** - 开启 autoComplete 后自动触发 columnChange 补全缺失的列数据
- **动态列加载** - 支持异步加载列数据,显示 loading 状态,优化大数据场景性能
- **自定义格式化** - 支持 displayFormat 自定义显示文本格式,灵活展示选中结果
- **确认前验证** - 提供 beforeConfirm 钩子,支持异步验证选中值是否有效
- **底部激活线条** - 当前选择列下方有动画线条指示,视觉反馈清晰
- **表单集成** - 完整支持表单验证、必填标识、错误提示等表单功能
- **自定义键名** - 支持自定义 valueKey、labelKey、tipKey,适配不同数据结构
- **多种状态** - 支持禁用、只读、错误、大尺寸等多种状态
- **灵活插槽** - 支持自定义 label 插槽和默认插槽,满足复杂 UI 需求
- **超出省略** - 支持选中值超出容器时自动省略显示

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:1-98

## 基本用法

### 使用内置省市区数据

ColPicker 内置了完整的中国省市区三级数据,当不传入 `columns` 时自动启用。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="region"
      label="所在地区"
      placeholder="请选择省市区"
    />
    <view class="result">选中值: {{ region }}</view>
    <view class="result">显示文本: {{ displayText }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// 省市区编码数组
const region = ref<(string | number)[]>(['110000', '110100', '110101'])

// 显示选中的地区文本
const displayText = computed(() => {
  // 组件内部会自动格式化为: 北京市 北京市 东城区
  return '北京市 北京市 东城区'
})
</script>

```

**使用说明:**
- 当不传入 `columns` 属性时,组件自动使用内置省市区数据
- `v-model` 绑定的是省市区编码数组,如 `['110000', '110100', '110101']`
- 组件内部会根据编码自动显示对应的省市区名称
- 内置数据包含全国所有省、市、区县信息

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:475-494

### 自定义列数据

传入 `columns` 属性提供自定义的二维数组数据,实现任意层级的级联选择。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="category"
      :columns="categoryColumns"
      label="商品分类"
      placeholder="请选择分类"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 分类值: [一级分类ID, 二级分类ID]
const category = ref<(string | number)[]>(['1', '101'])

// 静态二维数组:第一维是列,第二维是每列的选项
const categoryColumns = ref([
  // 第一列:一级分类
  [
    { label: '电子产品', value: '1' },
    { label: '服装鞋包', value: '2' },
    { label: '食品饮料', value: '3' },
  ],
  // 第二列:二级分类
  [
    { label: '手机', value: '101' },
    { label: '电脑', value: '102' },
    { label: '相机', value: '103' },
  ],
])

const handleConfirm = ({ value, selectedItems }) => {
  console.log('选中的值:', value)
  console.log('选中的项:', selectedItems)
}
</script>
```

**使用说明:**
- `columns` 是二维数组,第一维代表列,第二维代表该列的选项
- 每个选项默认需要 `label`(显示文本) 和 `value`(值) 字段
- `v-model` 绑定的值数组长度需要与列数一致
- 适用于数据结构简单、层级固定的场景

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:743-773

### 动态列加载(columnChange)

使用 `columnChange` 回调实现动态加载下一级数据,适用于数据量大或需要异步加载的场景。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="dynamicColumns"
      :column-change="handleColumnChange"
      label="部门选择"
      placeholder="请选择部门"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ColPickerColumnChangeOption } from '@/wd'

const selected = ref<(string | number)[]>([])

// 初始只提供第一列数据
const dynamicColumns = ref([
  [
    { label: '技术部', value: '1', children: true },
    { label: '市场部', value: '2', children: true },
    { label: '财务部', value: '3', children: false },
  ],
])

// 模拟后端数据
const departmentData = {
  '1': [
    { label: '前端组', value: '101' },
    { label: '后端组', value: '102' },
    { label: '测试组', value: '103' },
  ],
  '2': [
    { label: '营销组', value: '201' },
    { label: '策划组', value: '202' },
  ],
}

const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { selectedItem, index, resolve, finish } = option

  // 如果当前项有下一级
  if (selectedItem.children) {
    // 模拟异步加载
    setTimeout(() => {
      const nextColumn = departmentData[selectedItem.value] || []
      // 通过 resolve 传入下一列数据
      resolve(nextColumn)
    }, 300)
  } else {
    // 没有下一级,结束选择
    finish()
  }
}
</script>
```

**使用说明:**
- `columnChange` 接收 4 个参数:`selectedItem`(当前选中项)、`index`(列索引)、`resolve`(传入下一列数据)、`finish`(结束选择)
- 通过 `resolve(nextColumn)` 动态添加下一列数据
- 通过 `finish()` 或 `finish(true)` 完成选择并确认
- 通过 `finish(false)` 中断选择(不关闭弹窗)
- 适用于树形数据、异步加载、按需加载等场景

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:517-664

### 自动补全功能

开启 `autoComplete` 后,当 `columns` 长度小于 `v-model` 长度时,自动触发 `columnChange` 补全数据。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="partialColumns"
      :column-change="handleColumnChange"
      :auto-complete="true"
      label="级联选择"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ColPickerColumnChangeOption } from '@/wd'

// v-model 有3级,但 columns 只有1级
const selected = ref<(string | number)[]>(['1', '101', '10101'])

// 初始只提供第一列
const partialColumns = ref([
  [
    { label: '分类A', value: '1' },
    { label: '分类B', value: '2' },
  ],
])

const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { selectedItem, index, resolve, finish } = option

  // 根据当前列索引返回下一列数据
  if (index === -1 || index === 0) {
    // 第二列数据
    resolve([
      { label: '子分类A1', value: '101' },
      { label: '子分类A2', value: '102' },
    ])
  } else if (index === 1) {
    // 第三列数据
    resolve([
      { label: '子子分类A11', value: '10101' },
      { label: '子子分类A12', value: '10102' },
    ])
  } else {
    finish()
  }
}
</script>
```

**使用说明:**
- `autoComplete` 为 `true` 时,组件会自动补全缺失的列
- 当 `index` 为 `-1` 时表示初始补全,此时 `selectedItem` 为空对象
- 补全过程会根据 `v-model` 的值逐级调用 `columnChange`
- 适用于回显已选数据、深度链接等场景

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:685-705

### 自定义显示格式

使用 `displayFormat` 自定义选中值的显示格式。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="region"
      :display-format="formatDisplay"
      label="地区"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const region = ref<(string | number)[]>(['110000', '110100', '110101'])

// 自定义显示格式:省/市/区
const formatDisplay = (selectedItems: Record<string, any>[]) => {
  return selectedItems.map(item => item.label).join(' / ')
}
</script>
```

**使用说明:**
- `displayFormat` 接收选中项数组,返回格式化后的字符串
- `selectedItems` 是包含完整选项信息的对象数组
- 可以自由组合显示格式,如 `省-市-区`、`省>市>区` 等

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:440-469

### 确认前验证

使用 `beforeConfirm` 在确认选择前进行验证,支持异步校验。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="columns"
      :before-confirm="handleBeforeConfirm"
      label="库存检查"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { uni } from '@dcloudio/uni-app'

const selected = ref<(string | number)[]>([])

const columns = ref([
  [
    { label: '商品A', value: '1', stock: 100 },
    { label: '商品B', value: '2', stock: 0 },
    { label: '商品C', value: '3', stock: 50 },
  ],
])

const handleBeforeConfirm = (
  value: (string | number)[],
  selectedItems: Record<string, any>[],
  resolve: (isPass: boolean) => void,
) => {
  const item = selectedItems[0]

  // 检查库存
  if (item.stock === 0) {
    uni.showToast({
      title: '该商品暂无库存',
      icon: 'none',
    })
    // 验证失败,不关闭选择器
    resolve(false)
  } else {
    // 验证通过,确认选择
    resolve(true)
  }
}
</script>
```

**使用说明:**
- `beforeConfirm` 接收 3 个参数:`value`(选中值数组)、`selectedItems`(选中项数组)、`resolve`(确认回调)
- 调用 `resolve(true)` 通过验证并确认选择
- 调用 `resolve(false)` 验证失败,选择器保持打开状态
- 支持异步验证,如 API 请求校验

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:566-598

### 禁用和只读状态

通过 `disabled` 和 `readonly` 控制组件的可交互性。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="region1"
      label="禁用状态"
      :disabled="true"
    />

    <wd-col-picker
      v-model="region2"
      label="只读状态"
      :readonly="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const region1 = ref<(string | number)[]>(['110000', '110100', '110101'])
const region2 = ref<(string | number)[]>(['310000', '310100', '310101'])
</script>
```

**使用说明:**
- `disabled="true"` 禁用选择器,文字置灰,无法点击
- `readonly="true"` 只读模式,显示正常,但无法点击打开选择器
- 禁用和只读状态下不显示右侧箭头图标

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:885-890

### 错误状态

通过 `error` 属性显示错误状态。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="region"
      label="错误状态"
      :error="true"
      placeholder="请选择地区"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const region = ref<(string | number)[]>([])
</script>
```

**使用说明:**
- `error="true"` 时,选中值和箭头显示为红色
- 通常配合表单验证使用,手动设置较少

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:1082-1089

## 高级用法

### 自定义键名

使用 `valueKey`、`labelKey`、`tipKey` 适配不同的数据结构。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="customColumns"
      value-key="id"
      label-key="name"
      tip-key="description"
      label="自定义键名"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selected = ref<(string | number)[]>(['1'])

// 使用自定义字段名
const customColumns = ref([
  [
    {
      id: '1',
      name: '选项一',
      description: '这是选项一的说明',
    },
    {
      id: '2',
      name: '选项二',
      description: '这是选项二的说明',
    },
  ],
])
</script>
```

**使用说明:**
- `valueKey` 指定值字段名,默认 `'value'`
- `labelKey` 指定显示文本字段名,默认 `'label'`
- `tipKey` 指定提示文本字段名,默认 `'tip'`
- 提示文本会显示在选项名称下方,字体较小

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:205-210

### 选项禁用

在选项数据中设置 `disabled: true` 禁用某个选项。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="columns"
      label="选项禁用"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selected = ref<(string | number)[]>([])

const columns = ref([
  [
    { label: '可选项', value: '1' },
    { label: '禁用项', value: '2', disabled: true },
    { label: '可选项', value: '3' },
  ],
])
</script>
```

**使用说明:**
- 禁用的选项文字置灰,点击无效
- 禁用状态不影响其他选项的选择

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:78-80

### 带提示的选项

使用 `tip` 字段为选项添加辅助说明。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="columns"
      label="商品选择"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selected = ref<(string | number)[]>([])

const columns = ref([
  [
    {
      label: 'iPhone 15 Pro',
      value: '1',
      tip: '库存充足',
    },
    {
      label: 'iPhone 15',
      value: '2',
      tip: '仅剩3台',
    },
    {
      label: 'iPhone 14',
      value: '3',
      tip: '已售罄',
      disabled: true,
    },
  ],
])
</script>
```

**使用说明:**
- `tip` 字段内容显示在选项名称下方
- 提示文本使用较小字号和灰色文字
- 可以配合禁用状态使用,提示用户原因

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:85-87

### 加载状态自定义

自定义 loading 图标颜色。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="columns"
      :column-change="handleColumnChange"
      loading-color="#07c160"
      label="自定义加载色"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ColPickerColumnChangeOption } from '@/wd'

const selected = ref<(string | number)[]>([])

const columns = ref([
  [{ label: '选项', value: '1' }],
])

const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { resolve, finish } = option

  // 模拟异步加载
  setTimeout(() => {
    finish()
  }, 1000)
}
</script>
```

**使用说明:**
- `loadingColor` 设置 loading 图标的颜色
- 默认值为 `'#4D80F0'`(蓝色)

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:91-93

### 底部线条自定义

自定义底部激活线条的宽度和高度。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="columns"
      line-width="60"
      line-height="4"
      label="自定义线条"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selected = ref<(string | number)[]>([])

const columns = ref([
  [
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
  ],
  [
    { label: '子选项一', value: '11' },
    { label: '子选项二', value: '12' },
  ],
])
</script>
```

**使用说明:**
- `lineWidth` 设置线条宽度,单位 `rpx`,默认自适应列宽
- `lineHeight` 设置线条高度,单位 `rpx`,默认 `6rpx`
- 线条会随列切换进行平滑过渡动画

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:332-379

### 超出省略显示

开启 `ellipsis` 后,选中值超出容器宽度时自动省略。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="region"
      label="地区"
      :ellipsis="true"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 长文本:黑龙江省 哈尔滨市 南岗区
const region = ref<(string | number)[]>(['230000', '230100', '230103'])
</script>
```

**使用说明:**
- `ellipsis="true"` 时,超出部分显示 `...`
- 默认为 `false`,超出时换行显示

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:1134-1136

### 自定义弹窗配置

配置弹窗的层级、点击遮罩行为、底部安全距离等。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="columns"
      title="请选择"
      :close-on-click-modal="false"
      :z-index="200"
      :safe-area-inset-bottom="false"
      label="弹窗配置"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selected = ref<(string | number)[]>([])

const columns = ref([
  [
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
  ],
])
</script>
```

**使用说明:**
- `title` 设置弹窗标题,默认为 `'请选择'`
- `closeOnClickModal` 是否允许点击遮罩关闭,默认 `true`
- `zIndex` 弹窗层级,默认 `100`
- `safeAreaInsetBottom` 是否适配底部安全区域,默认 `true`

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:42-51

### 表单集成

配合 `wd-form` 组件使用,支持表单验证。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-col-picker
        v-model="formData.region"
        prop="region"
        label="所在地区"
        placeholder="请选择地区"
      />

      <wd-col-picker
        v-model="formData.category"
        :columns="categoryColumns"
        prop="category"
        label="商品分类"
        placeholder="请选择分类"
      />

      <view class="form-actions">
        <wd-button type="primary" @click="handleSubmit">提交</wd-button>
        <wd-button @click="handleReset">重置</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const formData = ref({
  region: [],
  category: [],
})

const rules = {
  region: [
    { required: true, message: '请选择所在地区' },
  ],
  category: [
    { required: true, message: '请选择商品分类' },
    {
      validator: (value: (string | number)[]) => {
        return value.length >= 2
      },
      message: '请选择完整的分类路径',
    },
  ],
}

const categoryColumns = ref([
  [
    { label: '电子产品', value: '1' },
    { label: '服装鞋包', value: '2' },
  ],
  [
    { label: '手机', value: '11' },
    { label: '电脑', value: '12' },
  ],
])

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('表单验证通过:', formData.value)
    }
  })
}

const handleReset = () => {
  formRef.value?.reset()
}
</script>

```

**使用说明:**
- `prop` 指定表单字段名,用于验证规则匹配
- 支持 `required` 必填验证
- 支持自定义 `validator` 函数验证
- 验证失败时自动显示错误提示和错误状态

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:826-879

### 自定义样式类

使用自定义样式类调整组件外观。

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="columns"
      label="自定义样式"
      custom-class="custom-picker"
      custom-label-class="custom-label"
      custom-value-class="custom-value"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selected = ref<(string | number)[]>(['1'])

const columns = ref([
  [
    { label: '选项一', value: '1' },
    { label: '选项二', value: '2' },
  ],
])
</script>

```

**使用说明:**
- `customClass` 自定义根节点样式类
- `customLabelClass` 自定义 label 样式类
- `customValueClass` 自定义 value 样式类
- 需要使用 `:deep()` 穿透组件样式隔离

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:166-169

### 使用插槽

使用 `label` 插槽或默认插槽自定义组件内容。

```vue
<template>
  <view class="demo">
    <!-- label 插槽 -->
    <wd-col-picker
      v-model="region1"
      use-label-slot
    >
      <template #label>
        <view class="custom-label">
          <wd-icon name="location" />
          <text>地区</text>
        </view>
      </template>
    </wd-col-picker>

    <!-- 默认插槽(完全自定义) -->
    <wd-col-picker
      v-model="region2"
      use-default-slot
    >
      <view class="custom-trigger" @click="handleOpen">
        <text>点击选择: {{ displayText }}</text>
        <wd-icon name="arrow-down" />
      </view>
    </wd-col-picker>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const region1 = ref<(string | number)[]>([])
const region2 = ref<(string | number)[]>([])

const displayText = computed(() => {
  return region2.value.length > 0 ? '已选择' : '未选择'
})

const handleOpen = () => {
  // 通过 ref 调用 open 方法
}
</script>

```

**使用说明:**
- 使用 `label` 插槽时,需要设置 `use-label-slot="true"`
- 使用默认插槽时,需要设置 `use-default-slot="true"`
- 默认插槽可以完全自定义触发器的样式和交互

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:7-41

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中项的值数组 | `Array<string \| number>` | - |
| columns | 选择器数据,二维数组 | `Array<Record<string, any>[]>` | `[]` |
| label | 选择器左侧文案 | `string` | - |
| label-width | 左侧标题宽度 | `string` | `'33%'` |
| use-label-slot | 是否使用 label 插槽 | `boolean` | `false` |
| use-default-slot | 是否使用默认插槽 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| placeholder | 选择器占位符 | `string` | `'请选择'` |
| title | 弹出层标题 | `string` | `'请选择'` |
| column-change | 列变化回调函数 | `ColPickerColumnChange` | - |
| display-format | 自定义展示文案的格式化函数 | `ColPickerDisplayFormat` | - |
| before-confirm | 确定前校验函数 | `ColPickerBeforeConfirm` | - |
| align-right | 选择器的值是否靠右展示 | `boolean` | `false` |
| error | 是否为错误状态 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| size | 选择器大小 | `string` | - |
| value-key | 选项对象中,value 对应的 key | `string` | `'value'` |
| label-key | 选项对象中,展示的文本对应的 key | `string` | `'label'` |
| tip-key | 选项对象中,提示文案对应的 key | `string` | `'tip'` |
| loading-color | loading 图标的颜色 | `string` | `'#4D80F0'` |
| close-on-click-modal | 点击遮罩是否关闭 | `boolean` | `true` |
| auto-complete | 自动触发 column-change 补全数据 | `boolean` | `false` |
| z-index | 弹窗层级 | `number` | `100` |
| safe-area-inset-bottom | 是否适配底部安全距离 | `boolean` | `true` |
| ellipsis | 是否超出隐藏 | `boolean` | `false` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| line-width | 底部条宽度,单位 rpx | `string \| number` | - |
| line-height | 底部条高度,单位 rpx | `string \| number` | `6` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-label-class | 自定义 label 样式类 | `string` | `''` |
| custom-value-class | 自定义 value 样式类 | `string` | `''` |

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:165-236

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中值变化时触发 | `value: (string \| number)[]` |
| confirm | 确认选择时触发 | `{ value: (string \| number)[], selectedItems: Record<string, any>[] }` |
| close | 关闭选择器时触发 | - |

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:241-249

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义默认内容,需设置 `use-default-slot` |
| label | 自定义左侧标题,需设置 `use-label-slot` |

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:8-24

### Methods

通过 ref 可以获取到 ColPicker 实例并调用实例方法。

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开选择器弹框 | - | - |
| close | 关闭选择器弹框 | - | - |

```vue
<template>
  <view class="demo">
    <wd-button @click="openPicker">打开选择器</wd-button>
    <wd-col-picker ref="pickerRef" v-model="selected" :columns="columns" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ColPickerInstance } from '@/wd'

const pickerRef = ref<ColPickerInstance>()
const selected = ref<(string | number)[]>([])
const columns = ref([[{ label: '选项', value: '1' }]])

const openPicker = () => {
  pickerRef.value?.open()
}
</script>
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:254-259, 928-937, 982-985

### 类型定义

```typescript
/**
 * 列变化回调选项类型
 */
export interface ColPickerColumnChangeOption {
  /** 当前选中的项 */
  selectedItem: Record<string, any>
  /** 当前列的索引(从0开始,-1表示初始化) */
  index: number
  /** 当前选中项在列中的索引 */
  rowIndex: number
  /** 传入下一列数据的函数 */
  resolve: (nextColumn: Record<string, any>[]) => void
  /** 完成选择的函数,传入 false 阻止确认 */
  finish: (isOk?: boolean) => void
}

/**
 * 列变化回调函数类型
 */
export type ColPickerColumnChange = (option: ColPickerColumnChangeOption) => void

/**
 * 显示格式化函数类型
 */
export type ColPickerDisplayFormat = (selectedItems: Record<string, any>[]) => string

/**
 * 确认前回调函数类型
 */
export type ColPickerBeforeConfirm = (
  value: (string | number)[],
  selectedItems: Record<string, any>[],
  resolve: (isPass: boolean) => void,
) => void

/**
 * 多列选择器组件实例类型
 */
export type ColPickerInstance = ComponentPublicInstance<WdColPickerProps, WdColPickerExpose>
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:133-161, 988

## 主题定制

### CSS 变量

ColPicker 组件提供了以下 CSS 变量用于主题定制:

```scss
// 选中项容器
--wd-col-picker-selected-height: 88rpx;
--wd-col-picker-selected-fs: 28rpx;
--wd-col-picker-selected-color: #333;
--wd-col-picker-selected-padding: 0 32rpx;
--wd-col-picker-selected-fw: 500;

// 底部激活线条
--wd-col-picker-line-width: 32rpx;
--wd-col-picker-line-height: 6rpx;
--wd-col-picker-line-color: #4d80f0;
--wd-col-picker-line-box-shadow: 0 0 8rpx rgba(77, 128, 240, 0.5);

// 列表容器
--wd-col-picker-list-height: 480rpx;
--wd-col-picker-list-padding-bottom: 32rpx;
--wd-col-picker-list-color: #333;
--wd-col-picker-list-fs: 28rpx;

// 列表项
--wd-col-picker-list-item-padding: 20rpx 32rpx;
--wd-col-picker-list-color-checked: #4d80f0;
--wd-col-picker-list-color-disabled: #c8c9cc;
--wd-col-picker-list-fs-tip: 24rpx;
--wd-col-picker-list-color-tip: #999;
--wd-col-picker-list-checked-icon-size: 32rpx;
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:991-1236

### 暗黑模式

ColPicker 组件支持暗黑模式,在 `wot-theme-dark` 类下自动应用暗色主题:

```vue
<template>
  <wd-config-provider theme="dark">
    <wd-col-picker v-model="selected" :columns="columns" />
  </wd-config-provider>
</template>
```

**暗黑模式变量:**

```scss
.wot-theme-dark {
  .wd-col-picker {
    // label 颜色
    --wd-col-picker-label-color: var(--wd-dark-color);

    // cell 背景和文字
    --wd-col-picker-cell-bg: var(--wd-dark-background2);
    --wd-col-picker-cell-color: var(--wd-dark-color);

    // 禁用状态
    --wd-col-picker-disabled-color: var(--wd-dark-color3);

    // value 颜色
    --wd-col-picker-value-color: var(--wd-dark-color);
    --wd-col-picker-placeholder-color: var(--wd-dark-color-gray);

    // 列表和选中项
    --wd-col-picker-list-color: var(--wd-dark-color);
    --wd-col-picker-selected-color: var(--wd-dark-color);

    // 提示文本
    --wd-col-picker-list-color-tip: var(--wd-dark-color-gray);
  }
}
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:997-1050

### 自定义主题示例

```vue
<template>
  <view class="demo">
    <wd-col-picker
      v-model="selected"
      :columns="columns"
      custom-class="custom-theme-picker"
      label="自定义主题"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selected = ref<(string | number)[]>([])
const columns = ref([[{ label: '选项', value: '1' }]])
</script>

<style lang="scss">
.custom-theme-picker {
  // 修改激活线条颜色和大小
  --wd-col-picker-line-color: #52c41a;
  --wd-col-picker-line-height: 8rpx;

  // 修改选中项颜色
  --wd-col-picker-list-color-checked: #52c41a;

  // 修改选中项字体
  --wd-col-picker-selected-fw: 600;
}
</style>
```

## 最佳实践

### 1. 合理选择数据加载方式

根据不同场景选择最合适的数据加载方式:

**静态数据场景:**

```vue
<script lang="ts" setup>
// ✅ 推荐:数据量小、层级固定
const staticColumns = ref([
  [
    { label: '男装', value: '1' },
    { label: '女装', value: '2' },
  ],
  [
    { label: 'T恤', value: '11' },
    { label: '衬衫', value: '12' },
  ],
])
</script>
```

**动态加载场景:**

```vue
<script lang="ts" setup>
// ✅ 推荐:数据量大、层级不固定、需要异步加载
const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { selectedItem, resolve, finish } = option

  // 异步加载下一级数据
  fetchSubCategories(selectedItem.value).then((data) => {
    if (data.length > 0) {
      resolve(data)
    } else {
      finish()
    }
  })
}
</script>
```

**省市区场景:**

```vue
<script lang="ts" setup>
// ✅ 推荐:直接使用内置省市区数据,无需配置
const region = ref([])
// 不传 columns,自动使用内置数据
</script>
```

### 2. 正确使用 columnChange 回调

在 `columnChange` 中务必调用 `resolve` 或 `finish`:

```vue
<script lang="ts" setup>
// ✅ 正确:有下级调用 resolve,无下级调用 finish
const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { selectedItem, resolve, finish } = option

  if (selectedItem.hasChildren) {
    loadChildren(selectedItem.id).then((children) => {
      resolve(children)
    })
  } else {
    finish()
  }
}

// ❌ 错误:没有调用 resolve 或 finish
const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { selectedItem } = option
  // 什么都不做,loading 会一直显示
}
</script>
```

### 3. beforeConfirm 验证的正确使用

在异步验证场景中,务必调用 `resolve`:

```vue
<script lang="ts" setup>
// ✅ 正确:异步验证后调用 resolve
const handleBeforeConfirm = (
  value: (string | number)[],
  selectedItems: Record<string, any>[],
  resolve: (isPass: boolean) => void,
) => {
  // 异步验证
  checkStock(selectedItems[0].id).then((hasStock) => {
    if (hasStock) {
      resolve(true) // 通过验证
    } else {
      uni.showToast({ title: '库存不足', icon: 'none' })
      resolve(false) // 验证失败
    }
  })
}

// ❌ 错误:没有调用 resolve
const handleBeforeConfirm = (
  value: (string | number)[],
  selectedItems: Record<string, any>[],
  resolve: (isPass: boolean) => void,
) => {
  if (selectedItems[0].stock === 0) {
    uni.showToast({ title: '库存不足', icon: 'none' })
    // 缺少 resolve(false),选择器无法关闭
  }
}
</script>
```

### 4. 自动补全功能的应用

在需要回显已选数据时使用 `autoComplete`:

```vue
<script lang="ts" setup>
// ✅ 推荐:编辑页面回显数据
const editData = ref({
  categoryPath: ['1', '101', '10101'], // 从后端获取的完整路径
})

// 设置 autoComplete,自动补全缺失的列数据
const autoComplete = ref(true)

const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { index, selectedItem, resolve, finish } = option

  // index 为 -1 表示初始化补全
  if (index === -1) {
    // 加载第一级数据
    loadFirstLevel().then(resolve)
  } else {
    // 根据当前选中项加载下一级
    loadNextLevel(selectedItem.value).then((data) => {
      if (data.length > 0) {
        resolve(data)
      } else {
        finish()
      }
    })
  }
}
</script>
```

### 5. 表单验证的完整配置

在表单中使用时,完整配置验证规则:

```vue
<template>
  <wd-form :model="formData" :rules="rules">
    <wd-col-picker
      v-model="formData.region"
      prop="region"
      label="所在地区"
    />
  </wd-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  region: [],
})

// ✅ 推荐:配置完整的验证规则
const rules = {
  region: [
    {
      required: true,
      message: '请选择所在地区',
    },
    {
      validator: (value: (string | number)[]) => {
        // 省市区必须选择完整(3级)
        return value.length === 3
      },
      message: '请选择完整的省市区',
    },
  ],
}
</script>
```

## 常见问题

### 1. 为什么点击选项后 loading 一直显示?

**问题原因:**
- 在 `columnChange` 回调中没有调用 `resolve` 或 `finish`
- 异步加载数据时出现错误,导致回调未执行

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 正确:确保一定会调用 resolve 或 finish
const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { selectedItem, resolve, finish } = option

  loadNextLevel(selectedItem.value)
    .then((data) => {
      if (data.length > 0) {
        resolve(data)
      } else {
        finish()
      }
    })
    .catch((error) => {
      console.error('加载失败:', error)
      // 即使出错也要调用 finish 关闭 loading
      finish(false)
    })
}
</script>
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:517-664

### 2. 为什么内置省市区数据不生效?

**问题原因:**
- 传入了空的 `columns` 数组:`columns="[]"`
- 在非内置数据模式下切换到内置数据

**解决方案:**

```vue
<template>
  <!-- ✅ 正确:不传 columns 属性 -->
  <wd-col-picker v-model="region" label="地区" />

  <!-- ❌ 错误:传入了空数组 -->
  <wd-col-picker v-model="region" :columns="[]" label="地区" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const region = ref<(string | number)[]>([])

// ✅ 如果需要动态切换,使用 undefined
const columns = ref<Record<string, any>[][] | undefined>(undefined)
</script>
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:475-494

### 3. 如何实现三级以上的级联选择?

**问题原因:**
- 对 `columnChange` 的 `resolve` 和 `finish` 理解不够

**解决方案:**

```vue
<script lang="ts" setup>
// ✅ 支持无限级联
const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { selectedItem, resolve, finish } = option

  // 根据 hasChildren 字段判断是否有下级
  if (selectedItem.hasChildren) {
    // 有下级,继续加载
    loadChildren(selectedItem.id).then((children) => {
      resolve(children)
    })
  } else {
    // 没有下级,结束选择
    finish()
  }
}

// 示例数据结构
const mockData = {
  '1': [
    { label: '二级A', value: '11', hasChildren: true },
    { label: '二级B', value: '12', hasChildren: true },
  ],
  '11': [
    { label: '三级A1', value: '111', hasChildren: true },
    { label: '三级A2', value: '112', hasChildren: false },
  ],
  '111': [
    { label: '四级A11', value: '1111', hasChildren: false },
  ],
}
</script>
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:517-664

### 4. 如何自定义选中值的显示格式?

**问题原因:**
- 不知道如何使用 `displayFormat` 属性

**解决方案:**

```vue
<template>
  <wd-col-picker
    v-model="region"
    :display-format="formatRegion"
    label="地区"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const region = ref<(string | number)[]>(['110000', '110100', '110101'])

// ✅ 自定义显示格式
const formatRegion = (selectedItems: Record<string, any>[]) => {
  // 方式1: 使用分隔符
  return selectedItems.map(item => item.label).join(' / ')
  // 结果: 北京市 / 北京市 / 东城区

  // 方式2: 只显示最后一级
  // return selectedItems[selectedItems.length - 1].label
  // 结果: 东城区

  // 方式3: 自定义格式
  // if (selectedItems.length === 3) {
  //   return `${selectedItems[0].label}-${selectedItems[2].label}`
  // }
  // 结果: 北京市-东城区
}
</script>
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:440-469

### 5. 为什么自动补全功能不工作?

**问题原因:**
- 忘记设置 `autoComplete="true"`
- `columnChange` 回调中没有正确处理 `index === -1` 的情况

**解决方案:**

```vue
<template>
  <wd-col-picker
    v-model="selected"
    :columns="columns"
    :column-change="handleColumnChange"
    :auto-complete="true"
    label="自动补全"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { ColPickerColumnChangeOption } from '@/wd'

// 已选值有3级,但 columns 只有1级
const selected = ref<(string | number)[]>(['1', '101', '10101'])

const columns = ref([
  [{ label: '一级', value: '1' }],
])

// ✅ 正确处理 index === -1 的初始化情况
const handleColumnChange = (option: ColPickerColumnChangeOption) => {
  const { index, selectedItem, resolve, finish } = option

  if (index === -1) {
    // 初始化,加载第一级的下级
    const firstValue = selected.value[0]
    loadChildren(firstValue).then(resolve)
  } else {
    // 正常流程
    if (selectedItem.hasChildren) {
      loadChildren(selectedItem.value).then(resolve)
    } else {
      finish()
    }
  }
}

const loadChildren = async (parentValue: string | number) => {
  // 根据父级值加载子级数据
  // ...
}
</script>
```

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:670-705

## 注意事项

### 1. v-model 值类型

- `v-model` 绑定的值必须是 `Array<string | number>` 类型
- 数组长度应该与选中的列数一致
- 使用内置省市区数据时,值为省市区编码数组,如 `['110000', '110100', '110101']`
- 使用自定义数据时,值为各列选中项的 `value` 值组成的数组

### 2. columns 数据格式

- `columns` 是二维数组,第一维是列,第二维是该列的选项
- 每个选项默认需要 `label` 和 `value` 字段
- 可以通过 `valueKey`、`labelKey`、`tipKey` 自定义字段名
- 当不传 `columns` 或传入空数组时,自动使用内置省市区数据

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:174

### 3. columnChange 回调规范

- 必须调用 `resolve(nextColumn)` 或 `finish()`
- `resolve` 传入下一列的数据数组
- `finish()` 或 `finish(true)` 完成选择并确认
- `finish(false)` 中断选择,不关闭选择器
- 异步加载时要处理错误情况,避免 loading 一直显示

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:517-664

### 4. autoComplete 使用场景

- 适用于编辑页面回显已选数据
- 适用于深度链接直接定位到具体选项
- 需要配合 `columnChange` 回调使用
- 当 `index === -1` 时表示初始化补全

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:685-705

### 5. beforeConfirm 验证规范

- 必须调用 `resolve(true)` 或 `resolve(false)`
- `resolve(true)` 通过验证,确认选择并关闭
- `resolve(false)` 验证失败,选择器保持打开
- 支持异步验证,如 API 请求

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:566-598

### 6. 表单集成注意事项

- 需要设置 `prop` 属性用于表单验证
- 可以在组件上设置 `rules`,也可以在 `wd-form` 上统一设置
- `required` 属性会自动显示必填星号
- 表单验证失败时自动显示错误提示和错误状态

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:826-879

### 7. 内置省市区数据说明

- 内置数据来源于 `useChinaRegions` 组合函数
- 包含全国所有省、市、区县信息
- 编码采用国家标准行政区划代码
- 自动处理直辖市、特别行政区等特殊情况
- 部分市辖区可能没有区县数据,此时选择市级即完成

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:292-294

### 8. 插槽使用注意

- 使用 `label` 插槽需要设置 `use-label-slot="true"`
- 使用默认插槽需要设置 `use-default-slot="true"`
- 默认插槽会完全替换内置的触发器UI
- 使用默认插槽时需要手动处理点击事件,调用 `open()` 方法

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:7-24, 179-182

### 9. 性能优化建议

- 大数据量场景使用 `columnChange` 动态加载,避免一次性加载全部数据
- 开启 `autoComplete` 时,确保 `columnChange` 响应速度足够快
- 使用内置省市区数据时无需担心性能,数据已优化
- 避免在 `displayFormat` 中进行复杂计算

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:517-664

### 10. 样式定制建议

- 优先使用 CSS 变量进行主题定制
- 使用 `custom-class`、`custom-label-class`、`custom-value-class` 添加自定义样式
- 需要穿透组件样式时使用 `:deep()` 选择器
- 暗黑模式下自动应用暗色主题,无需额外配置

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:991-1236

### 11. 事件处理注意

- `confirm` 事件在确认选择时触发,包含 `value` 和 `selectedItems`
- `close` 事件在关闭选择器时触发(无论是确认还是取消)
- 如果需要区分确认和取消,使用 `confirm` 事件
- `update:modelValue` 只在确认时触发,取消时不触发

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:500-512

### 12. 底部激活线条说明

- 底部线条会自动跟随当前激活的列移动
- 可以通过 `lineWidth` 和 `lineHeight` 自定义线条大小
- 线条移动有平滑过渡动画
- 线条颜色可以通过 CSS 变量 `--wd-col-picker-line-color` 修改

参考: src/wd/components/wd-col-picker/wd-col-picker.vue:332-379
