# SelectPicker 选择器

## 介绍

SelectPicker 选择器是一个功能强大的表单选择组件，支持单选、多选和自定义三种选择模式。组件基于 ActionSheet 弹出层实现，提供了丰富的配置选项和交互功能，能够满足各种复杂的选择场景需求。组件内部集成了 CheckboxGroup、RadioGroup 和自定义内容区域，支持搜索过滤、数量限制、自定义格式化等高级特性，是构建表单选择功能的理想选择。

**核心特性：**

- **三种选择模式** - 支持 checkbox（多选）、radio（单选）、custom（自定义）三种选择类型，适配不同业务场景
- **搜索过滤功能** - 提供本地搜索功能，支持关键词高亮显示，快速定位目标选项
- **数量限制控制** - 多选模式下支持最小/最大选中数量限制，灵活控制选择范围
- **自定义格式化** - 支持通过 displayFormat 函数自定义显示文本格式，满足个性化展示需求
- **确认前校验** - 提供 beforeConfirm 钩子函数，支持在确认前进行自定义校验逻辑
- **表单集成** - 完整支持表单验证，可与 Form 组件配合使用，实现字段级校验
- **滚动定位** - 自动滚动到选中项位置，提升大数据量下的用户体验
- **加载状态** - 支持加载状态显示，配合异步数据加载场景
- **清空功能** - 提供清空按钮，快速重置选择内容
- **自定义模式** - 完全自定义的选择内容，支持任意复杂的选择逻辑
- **暗黑模式** - 完整支持暗黑主题，自动适配系统主题切换
- **无障碍支持** - 提供必填标识、错误提示等无障碍特性，提升可访问性

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:1-174

## 基本用法

### 单选模式

单选模式下，用户只能选择一个选项。设置 `type="radio"` 启用单选模式，`modelValue` 为单个值（string/number/boolean）。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="单选选择器">
      <wd-select-picker
        v-model="value1"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        @confirm="handleConfirm"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 单选值
const value1 = ref('')

// 城市列表
const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' },
  { label: '成都', value: 'chengdu' },
  { label: '重庆', value: 'chongqing' },
  { label: '武汉', value: 'wuhan' }
])

// 确认回调
const handleConfirm = ({ value, selectedItems }: any) => {
  console.log('选中值:', value)
  console.log('选中项:', selectedItems)
}
</script>
```

**使用说明：**
- `type="radio"` 设置为单选模式
- `modelValue` 绑定单个值，类型与 columns 中的 value 类型一致
- `columns` 数组中的对象需包含 `label`（显示文本）和 `value`（实际值）字段
- 单选模式下默认显示确认按钮，可通过 `show-confirm="false"` 隐藏，选择后立即确认

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:207-216, 283-284

### 多选模式

多选模式下，用户可以选择多个选项。设置 `type="checkbox"` 启用多选模式，`modelValue` 为数组类型。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="多选选择器">
      <wd-select-picker
        v-model="value2"
        label="选择水果"
        placeholder="请选择"
        title="请选择水果"
        type="checkbox"
        :columns="fruitList"
        @confirm="handleConfirm"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 多选值（数组格式）
const value2 = ref<string[]>([])

// 水果列表
const fruitList = ref([
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '葡萄', value: 'grape' },
  { label: '西瓜', value: 'watermelon' },
  { label: '草莓', value: 'strawberry' },
  { label: '芒果', value: 'mango' },
  { label: '榴莲', value: 'durian' }
])

const handleConfirm = ({ value, selectedItems }: any) => {
  console.log('选中值:', value)
  console.log('选中项:', selectedItems)
}
</script>
```

**使用说明：**
- `type="checkbox"` 设置为多选模式
- `modelValue` 必须为数组类型，存储选中项的 value 值
- 支持字符串格式（逗号分隔）和数组格式两种数据格式
- 多选模式下始终显示确认按钮，用户需点击确认按钮完成选择

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:75-106, 394

### 数组或字符串格式

多选模式支持两种数据格式：数组格式（推荐）和字符串格式（逗号分隔）。组件会根据初始值自动识别格式。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="不同数据格式">
      <!-- 数组格式（推荐） -->
      <wd-select-picker
        v-model="arrayValue"
        label="数组格式"
        placeholder="请选择"
        title="选择标签"
        type="checkbox"
        :columns="tagList"
      />

      <!-- 字符串格式 -->
      <wd-select-picker
        v-model="stringValue"
        label="字符串格式"
        placeholder="请选择"
        title="选择标签"
        type="checkbox"
        :columns="tagList"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 数组格式（推荐使用）
const arrayValue = ref<string[]>(['tag1', 'tag2'])

// 字符串格式（逗号分隔）
const stringValue = ref('tag1,tag2')

const tagList = ref([
  { label: '标签1', value: 'tag1' },
  { label: '标签2', value: 'tag2' },
  { label: '标签3', value: 'tag3' },
  { label: '标签4', value: 'tag4' }
])
</script>
```

**技术实现：**
- 组件通过 `isInitialValueString` 计算属性判断初始值类型
- 内部统一使用数组格式处理，通过 `valueFormat` 函数转换输入值
- 输出时通过 `formatOutputValue` 函数转换为原始格式
- 字符串格式会自动去除空格，例如 `"tag1, tag2"` 会处理为 `["tag1", "tag2"]`

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:462-507

### 自定义字段名

默认情况下，组件使用 `label` 作为显示字段，`value` 作为值字段。可通过 `label-key` 和 `value-key` 自定义字段名。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义字段名">
      <wd-select-picker
        v-model="value3"
        label="选择员工"
        placeholder="请选择"
        title="选择员工"
        type="radio"
        :columns="employeeList"
        label-key="name"
        value-key="id"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value3 = ref('')

// 员工列表（自定义字段名）
const employeeList = ref([
  { name: '张三', id: 1001, department: '技术部' },
  { name: '李四', id: 1002, department: '产品部' },
  { name: '王五', id: 1003, department: '设计部' },
  { name: '赵六', id: 1004, department: '运营部' }
])
</script>
```

**使用说明：**
- `label-key="name"` 指定显示字段为 `name`
- `value-key="id"` 指定值字段为 `id`
- `modelValue` 存储的是 `id` 字段的值
- 组件内部通过 `getSelectedItem` 方法根据 value 查找对应的完整对象

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:285-288, 514-529

### 禁用状态

设置 `disabled` 属性禁用选择器，禁用后无法打开选择面板。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="禁用状态">
      <wd-select-picker
        v-model="value4"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        disabled
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value4 = ref('shanghai')

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
])
</script>
```

**使用说明：**
- `disabled` 为 `true` 时，选择器不可点击
- 禁用状态下，值显示为灰色（通过 CSS 类 `is-disabled` 控制）
- 禁用时 `open` 方法会直接返回，不会打开选择面板

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:246, 782

### 只读状态

设置 `readonly` 属性将选择器设为只读，只读状态下也无法打开选择面板。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="只读状态">
      <wd-select-picker
        v-model="value5"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        readonly
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value5 = ref('guangzhou')

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
])
</script>
```

**使用说明：**
- `readonly` 与 `disabled` 的区别在于样式表现不同
- 只读状态下显示为正常颜色（通过 CSS 类 `is-readonly` 控制）
- `open` 方法中会同时检查 `disabled` 和 `readonly` 状态

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:248, 782

### 错误状态

设置 `error` 属性将选择器标记为错误状态，通常用于表单验证失败时。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="错误状态">
      <wd-select-picker
        v-model="value6"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        error
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value6 = ref('')

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
])
</script>
```

**使用说明：**
- `error` 为 `true` 时，值和箭头显示为错误颜色（红色）
- 错误状态通过 CSS 类 `is-error` 控制样式
- 通常与表单验证配合使用，验证失败时自动设置错误状态

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:255-256, 1097-1104

### 必填标识

设置 `required` 属性显示必填标识（红色星号）。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="必填标识">
      <wd-select-picker
        v-model="value7"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        required
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value7 = ref('')

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
])
</script>
```

**使用说明：**
- `required` 为 `true` 时，label 前显示红色星号
- 必填样式通过 CSS 类 `is-required` 和伪元素 `::after` 实现
- `isRequired` 计算属性会同时检查组件自身的 `required` 属性、`rules` 规则和表单的 `rules` 规则

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:258, 896-913

### 尺寸大小

通过 `size` 属性控制选择器单元格的尺寸，支持 `large` 大尺寸。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="大尺寸">
      <wd-select-picker
        v-model="value8"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        size="large"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value8 = ref('')

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
])
</script>
```

**使用说明：**
- `size="large"` 设置为大尺寸，字体和图标都会相应增大
- 大尺寸样式通过 CSS 类 `is-large` 控制
- 还可以通过 `select-size` 属性控制弹出层内部选项的尺寸

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:264, 1105-1112

### 选中颜色

通过 `checked-color` 属性自定义选中项的颜色（单选和多选模式下有效）。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义选中颜色">
      <wd-select-picker
        v-model="value9"
        label="选择水果"
        placeholder="请选择"
        title="请选择水果"
        type="checkbox"
        :columns="fruitList"
        checked-color="#ff6b6b"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value9 = ref<string[]>([])

const fruitList = ref([
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' }
])
</script>
```

**使用说明：**
- `checked-color` 接收颜色值字符串，支持十六进制、RGB、颜色名称等格式
- 颜色会传递给内部的 CheckboxGroup 或 RadioGroup 组件
- 只在 `type="checkbox"` 或 `type="radio"` 模式下生效

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:266, 81, 113

## 高级用法

### 搜索过滤

设置 `filterable` 属性启用搜索功能，用户可以通过关键词快速筛选选项。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="搜索过滤">
      <wd-select-picker
        v-model="value10"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="allCityList"
        filterable
        filter-placeholder="输入城市名称搜索"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value10 = ref('')

// 大量城市数据
const allCityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' },
  { label: '成都', value: 'chengdu' },
  { label: '重庆', value: 'chongqing' },
  { label: '武汉', value: 'wuhan' },
  { label: '西安', value: 'xian' },
  { label: '天津', value: 'tianjin' },
  { label: '南京', value: 'nanjing' },
  { label: '苏州', value: 'suzhou' }
  // ... 更多城市
])
</script>
```

**技术实现：**
- 搜索框使用 `wd-search` 组件实现，通过 `filter-placeholder` 设置占位符
- 搜索逻辑在 `handleFilterChange` 方法中处理
- 通过 `formatFilterColumns` 方法过滤匹配项，并使用 `getFilterText` 方法高亮关键词
- 高亮部分通过 `wd-select-picker__text-active` 类应用主题色
- 搜索时 `filterColumns` 会实时更新，显示过滤后的选项列表

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:303-306, 537-568, 729-740

### 数量限制

多选模式下，通过 `min` 和 `max` 属性限制最小和最大选中数量。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="数量限制">
      <wd-select-picker
        v-model="value11"
        label="选择兴趣"
        placeholder="请选择"
        title="选择兴趣（最少1个，最多3个）"
        type="checkbox"
        :columns="hobbyList"
        :min="1"
        :max="3"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value11 = ref<string[]>(['reading'])

const hobbyList = ref([
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '音乐', value: 'music' },
  { label: '旅游', value: 'travel' },
  { label: '摄影', value: 'photography' },
  { label: '绘画', value: 'painting' }
])
</script>
```

**使用说明：**
- `min` 设置最少选中数量，达到最小值后其他已选中项不可取消
- `max` 设置最多选中数量，达到最大值后其他未选中项不可选择，设置为 0 表示无限制
- 数量限制会传递给内部的 `wd-checkbox-group` 组件
- CheckboxGroup 会根据数量限制自动禁用相应的选项

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:267-270, 82-83

### 自定义显示格式

通过 `display-format` 函数自定义选中值的显示文本。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义显示格式">
      <!-- 显示选中数量 -->
      <wd-select-picker
        v-model="value12"
        label="选择标签"
        placeholder="请选择"
        title="选择标签"
        type="checkbox"
        :columns="tagList"
        :display-format="displayTagCount"
      />

      <!-- 自定义分隔符 -->
      <wd-select-picker
        v-model="value13"
        label="选择水果"
        placeholder="请选择"
        title="选择水果"
        type="checkbox"
        :columns="fruitList"
        :display-format="displayWithSeparator"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value12 = ref<string[]>([])
const value13 = ref<string[]>([])

const tagList = ref([
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' },
  { label: '移动端', value: 'mobile' },
  { label: '测试', value: 'test' }
])

const fruitList = ref([
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' }
])

// 显示选中数量
const displayTagCount = (items: string[], columns: any[]) => {
  if (!items || items.length === 0) return ''
  return `已选择 ${items.length} 个标签`
}

// 自定义分隔符
const displayWithSeparator = (items: string[], columns: any[]) => {
  if (!items || items.length === 0) return ''
  const labels = items.map(value => {
    const item = columns.find(col => col.value === value)
    return item?.label || value
  })
  return labels.join(' | ')
}
</script>
```

**函数签名：**
```typescript
type SelectPickerDisplayFormat = (
  items: string | number | boolean | (string | number | boolean)[] | any,
  columns: Record<string, any>[]
) => string
```

**使用说明：**
- 函数接收两个参数：`items`（选中值）和 `columns`（选项列表）
- 必须返回字符串类型，用于显示在选择器中
- 函数在 `showValue` 计算属性中调用
- 组件会在初始化时验证函数类型，非函数类型会输出错误提示

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:210-216, 296, 799-858, 960-971

### 确认前校验

通过 `before-confirm` 函数在确认前执行自定义校验逻辑。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="确认前校验">
      <wd-select-picker
        v-model="value14"
        label="选择课程"
        placeholder="请选择"
        title="选择课程（至少选择2门）"
        type="checkbox"
        :columns="courseList"
        :before-confirm="validateCourseCount"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { showToast } from '@/utils/toast'

const value14 = ref<string[]>([])

const courseList = ref([
  { label: 'Vue 3', value: 'vue3' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' }
])

// 校验课程数量
const validateCourseCount = (value: string[], resolve: (isPass: boolean) => void) => {
  if (!value || value.length < 2) {
    showToast('请至少选择2门课程')
    resolve(false) // 校验失败，不执行确认
  } else {
    resolve(true) // 校验通过，执行确认
  }
}
</script>
```

**函数签名：**
```typescript
type SelectPickerBeforeConfirm = (
  value: string | number | boolean | (string | number | boolean)[] | any,
  resolve: (isPass: boolean) => void
) => void
```

**使用说明：**
- 函数接收两个参数：`value`（选中值）和 `resolve`（继续执行的回调）
- 必须调用 `resolve(true)` 才能继续执行确认操作
- 调用 `resolve(false)` 会阻止确认，不更新 modelValue
- 在 `onConfirm` 方法中调用，校验通过后才会执行 `handleConfirm`
- 组件会在初始化时验证函数类型

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:217-224, 297-298, 667-681, 974-987

### 加载状态

通过 `loading` 属性显示加载状态，配合异步数据加载使用。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="加载状态">
      <wd-select-picker
        v-model="value15"
        label="选择部门"
        placeholder="请选择"
        title="选择部门"
        type="radio"
        :columns="departmentList"
        :loading="isLoading"
        loading-color="#4D80F0"
        @open="loadDepartments"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value15 = ref('')
const isLoading = ref(false)
const departmentList = ref<any[]>([])

// 模拟异步加载部门数据
const loadDepartments = async () => {
  if (departmentList.value.length > 0) return

  isLoading.value = true

  // 模拟 API 请求
  setTimeout(() => {
    departmentList.value = [
      { label: '技术部', value: 'tech' },
      { label: '产品部', value: 'product' },
      { label: '设计部', value: 'design' },
      { label: '运营部', value: 'operation' }
    ]
    isLoading.value = false
  }, 1500)
}
</script>
```

**使用说明：**
- `loading` 为 `true` 时，选项列表上方显示加载动画
- 通过 `loading-color` 自定义加载图标颜色，必须使用完整的十六进制格式（如 `#4D80F0`）
- 加载状态下，滚动区域通过 `is-loading` 类禁用滚动
- 加载时点击确认按钮会直接关闭选择器，不执行确认逻辑

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:273-276, 138-140, 668-673

### 清空功能

设置 `clearable` 属性启用清空按钮，允许用户快速清空选择。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="清空功能">
      <wd-select-picker
        v-model="value16"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        clearable
        @clear="handleClear"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value16 = ref('shanghai')

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
])

const handleClear = () => {
  console.log('已清空选择')
}
</script>
```

**使用说明：**
- `clearable` 为 `true` 时，有值且非禁用/只读状态下显示清空按钮
- 清空按钮位于右侧，点击后会清空 modelValue
- 多选模式下清空为空数组（或空字符串，取决于初始值格式）
- 单选模式下清空为空字符串
- 清空操作会触发 `clear` 事件和 `update:modelValue` 事件

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:324, 745-759, 871-875

### 滚动定位

设置 `scroll-into-view` 属性（默认开启），打开选择器时自动滚动到选中项位置。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="滚动定位">
      <wd-select-picker
        v-model="value17"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="manyCityList"
        :scroll-into-view="true"
      />
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value17 = ref('city50') // 默认选中第50个城市

// 大量城市数据（用于演示滚动定位）
const manyCityList = ref(
  Array.from({ length: 100 }, (_, i) => ({
    label: `城市${i + 1}`,
    value: `city${i + 1}`
  }))
)
</script>
```

**技术实现：**
- 在 `opened` 事件中调用 `setScrollIntoView` 方法
- 通过 `getRect` 工具函数获取元素位置信息
- 单选模式下获取 `#radio{value}` 元素位置
- 多选模式下获取所有 `#check{value}` 元素位置
- 计算目标元素是否在可视区域内，不在则滚动到中心位置
- 使用 `scroll-top` 属性控制滚动位置，配合 `scroll-with-animation` 实现平滑滚动

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:310, 55, 571-610

### 自定义模式

设置 `type="custom"` 启用自定义模式，完全自定义选择内容和逻辑。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义模式">
      <wd-select-picker
        v-model="customValue"
        label="选择日期范围"
        placeholder="请选择"
        title="选择日期范围"
        type="custom"
        :display-format="formatDateRange"
        @open="handleOpen"
      >
        <template #content="{ value, updateValue, confirm, close }">
          <view class="custom-date-picker">
            <view class="date-input-group">
              <view class="date-input">
                <text class="label">开始日期:</text>
                <input
                  type="date"
                  :value="value?.startDate || ''"
                  @input="e => handleDateChange('startDate', e.detail.value, updateValue)"
                />
              </view>
              <view class="date-input">
                <text class="label">结束日期:</text>
                <input
                  type="date"
                  :value="value?.endDate || ''"
                  @input="e => handleDateChange('endDate', e.detail.value, updateValue)"
                />
              </view>
            </view>
            <view class="action-buttons">
              <wd-button size="small" type="default" @click="close">
                取消
              </wd-button>
              <wd-button size="small" type="primary" @click="confirm">
                确定
              </wd-button>
            </view>
          </view>
        </template>
      </wd-select-picker>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const customValue = ref<any>({
  startDate: '',
  endDate: ''
})

// 格式化显示
const formatDateRange = (value: any) => {
  if (!value || !value.startDate || !value.endDate) return ''
  return `${value.startDate} 至 ${value.endDate}`
}

// 处理日期变化
const handleDateChange = (
  field: 'startDate' | 'endDate',
  newValue: string,
  updateValue: (val: any) => void
) => {
  const newData = { ...customValue.value, [field]: newValue }
  updateValue(newData)
}

const handleOpen = () => {
  console.log('选择器已打开')
}
</script>

```

**content 插槽参数：**
- `value`: 当前值（internalValue）
- `updateValue(newValue)`: 更新值的方法
- `confirm()`: 确认选择的方法
- `close()`: 关闭选择器的方法

**使用说明：**
- 自定义模式下，`modelValue` 可以是任意类型（对象、数组、基本类型等）
- 通过 `content` 插槽完全自定义选择内容
- 使用插槽参数中的 `updateValue` 方法更新值
- 可以在内部调用 `confirm()` 确认或 `close()` 取消
- 也可以使用外部的确认按钮（通过 `show-confirm` 控制）

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:144-156, 473-475, 498-507, 686-702

### 自定义模式自动确认

自定义模式下，可以通过 `auto-confirm` 属性启用自动确认，值变化时立即确认。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自动确认">
      <wd-select-picker
        v-model="autoConfirmValue"
        label="选择数量"
        placeholder="请选择"
        title="选择数量"
        type="custom"
        :auto-confirm="true"
        :show-confirm="false"
        :display-format="formatCount"
      >
        <template #content="{ value, updateValue }">
          <view class="custom-stepper">
            <wd-button
              size="small"
              @click="updateValue((value || 0) - 1)"
            >
              -
            </wd-button>
            <text class="count">{{ value || 0 }}</text>
            <wd-button
              size="small"
              @click="updateValue((value || 0) + 1)"
            >
              +
            </wd-button>
          </view>
        </template>
      </wd-select-picker>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const autoConfirmValue = ref(0)

const formatCount = (value: number) => {
  return value ? `${value} 个` : ''
}
</script>

```

**使用说明：**
- `auto-confirm` 为 `true` 时，调用 `updateValue` 会自动触发确认
- 通常配合 `show-confirm="false"` 使用，隐藏底部确认按钮
- 自动确认通过 `nextTick` 延迟执行，确保值已更新
- 自动确认会触发 `custom-confirm` 和 `confirm` 事件

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:328, 696-701

### 表单验证

配合 Form 组件使用，支持表单验证功能。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-select-picker
        v-model="formData.city"
        label="选择城市"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        prop="city"
      />

      <wd-select-picker
        v-model="formData.hobbies"
        label="选择兴趣"
        placeholder="请选择"
        title="请选择兴趣"
        type="checkbox"
        :columns="hobbyList"
        prop="hobbies"
      />

      <view class="button-group">
        <wd-button type="primary" @click="handleSubmit">
          提交
        </wd-button>
        <wd-button @click="handleReset">
          重置
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd/components/wd-form/wd-form.vue'

const formRef = ref<FormInstance>()

const formData = ref({
  city: '',
  hobbies: []
})

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
])

const hobbyList = ref([
  { label: '阅读', value: 'reading' },
  { label: '运动', value: 'sports' },
  { label: '音乐', value: 'music' }
])

const rules = {
  city: [
    { required: true, message: '请选择城市' }
  ],
  hobbies: [
    { required: true, message: '请至少选择一个兴趣' }
  ]
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('表单验证通过:', formData.value)
    } else {
      console.log('表单验证失败')
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

**使用说明：**
- 必须设置 `prop` 属性，对应 form 的 model 字段名
- 可以通过 `rules` 属性设置组件级验证规则
- 也可以在 form 的 `rules` 中统一配置验证规则
- 验证失败时会自动显示错误信息（通过 `errorMessage` 计算属性）
- `isRequired` 计算属性会综合判断是否显示必填标识

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:312-314, 438-458, 886-913

### 自定义插槽

通过插槽自定义标签区域和整体内容。

```vue
<template>
  <view class="demo">
    <wd-cell-group title="自定义插槽">
      <!-- 自定义标签插槽 -->
      <wd-select-picker
        v-model="value18"
        placeholder="请选择"
        title="请选择城市"
        type="radio"
        :columns="cityList"
        use-label-slot
      >
        <template #label>
          <view class="custom-label">
            <wd-icon name="location" size="32rpx" />
            <text>城市</text>
          </view>
        </template>
      </wd-select-picker>

      <!-- 完全自定义 -->
      <wd-select-picker
        v-model="value19"
        title="请选择水果"
        type="checkbox"
        :columns="fruitList"
        use-default-slot
      >
        <view class="custom-field" @click="openPicker">
          <text class="label">选择水果</text>
          <text class="value">{{ displayValue || '请选择' }}</text>
          <wd-icon name="arrow-right" />
        </view>
      </wd-select-picker>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const value18 = ref('')
const value19 = ref<string[]>([])

const cityList = ref([
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
])

const fruitList = ref([
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' }
])

// 计算显示值
const displayValue = computed(() => {
  if (!value19.value || value19.value.length === 0) return ''
  return value19.value.map(v => {
    const item = fruitList.value.find(f => f.value === v)
    return item?.label
  }).join(', ')
})

const openPicker = () => {
  // 手动触发打开（需要通过 ref 调用）
}
</script>

```

**使用说明：**
- `use-label-slot` 为 `true` 时启用 `label` 插槽
- `use-default-slot` 为 `true` 时启用默认插槽，完全自定义显示内容
- 使用默认插槽时需要手动触发打开（通过 ref 调用 `open` 方法）
- label 插槽只替换标签部分，其他结构保持不变

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:8, 16-22, 259-262

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 选中项绑定值，`type` 为 `checkbox` 时为数组或字符串，`radio` 时为 string/number/boolean，`custom` 时为任意类型 | `string \| number \| boolean \| (string \| number \| boolean)[] \| any` | - |
| type | 选择器类型 | `SelectPickerType` | `'checkbox'` |
| columns | 选项列表数据 | `Record<string, any>[]` | `[]` |
| value-key | 选项对象中，value 对应的 key | `string` | `'value'` |
| label-key | 选项对象中，展示的文本对应的 key | `string` | `'label'` |
| label | 选择器左侧文案 | `string` | - |
| label-width | 设置左侧标题宽度 | `string` | - |
| placeholder | 选择器占位符 | `string` | `'请选择'` |
| title | 弹出层标题 | `string` | `'请选择'` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| required | 是否显示必填标识 | `boolean` | `false` |
| error | 是否为错误状态 | `boolean` | `false` |
| align-right | 选择器的值靠右展示 | `boolean` | `false` |
| size | 选择器单元格大小 | `string` | - |
| select-size | 选项组尺寸大小（单/复选框） | `CheckSize` | - |
| checked-color | 选中的颜色（单/复选框） | `string` | - |
| min | 最小选中数量（多选模式） | `number` | `0` |
| max | 最大选中数量，0 为无限制（多选模式） | `number` | `0` |
| filterable | 是否可搜索 | `boolean` | `false` |
| filter-placeholder | 搜索框占位符 | `string` | `'搜索'` |
| ellipsis | 是否超出隐藏 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |
| scroll-into-view | 重新打开是否滚动到选中项 | `boolean` | `true` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loading-color | 加载颜色（必须使用完整十六进制格式） | `string` | `'#4D80F0'` |
| display-format | 自定义展示文案的格式化函数 | `SelectPickerDisplayFormat` | - |
| before-confirm | 确认前校验函数 | `SelectPickerBeforeConfirm` | - |
| show-confirm | 是否显示确认按钮（radio/custom 类型生效） | `boolean` | `true` |
| confirm-button-text | 确认按钮文案 | `string` | `'确认'` |
| confirm-button-custom-class | 确认按钮自定义样式类 | `string` | - |
| confirm-button-custom-style | 确认按钮自定义样式 | `string` | - |
| close-on-click-modal | 点击遮罩是否关闭 | `boolean` | `true` |
| z-index | 弹窗层级 | `number` | `100` |
| safe-area-inset-bottom | 是否设置底部安全距离 | `boolean` | `true` |
| use-label-slot | 是否使用 label 插槽 | `boolean` | `false` |
| use-default-slot | 是否使用默认插槽 | `boolean` | `false` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| custom-style | 自定义根节点样式 | `string` | - |
| custom-class | 自定义根节点样式类 | `string` | - |
| custom-header-class | 自定义 header 头部样式类 | `string` | - |
| custom-content-class | 自定义内容样式类 | `string` | - |
| custom-label-class | 自定义标签样式类 | `string` | - |
| custom-value-class | 自定义值样式类 | `string` | - |
| auto-confirm | 是否自动确认（自定义模式） | `boolean` | `false` |
| on-custom-change | 自定义值变化回调函数（自定义模式） | `SelectPickerCustomChangeHandler` | - |

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:233-331, 377-412

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 选中值变化时触发 | `value: string \| number \| boolean \| (string \| number \| boolean)[] \| any` |
| change | 选择器值改变时触发（选择过程中） | `{ value: string \| number \| boolean \| (string \| number \| boolean)[] \| any }` |
| confirm | 确认选择时触发 | `{ value: string \| number \| boolean \| (string \| number \| boolean)[] \| any, selectedItems: Record<string, any> \| Record<string, any>[] \| any }` |
| cancel | 取消选择时触发（关闭但未确认） | - |
| clear | 清空选择时触发 | - |
| open | 打开选择器时触发 | - |
| close | 关闭选择器时触发 | - |
| custom-change | 自定义值变化时触发（自定义模式） | `{ value: any }` |
| custom-confirm | 自定义确认时触发（自定义模式） | `{ value: any }` |

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:336-360

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| default | 完全自定义选择器内容（需设置 `use-default-slot`） | - |
| label | 自定义标签内容（需设置 `use-label-slot`） | - |
| content | 自定义选择内容（`type="custom"` 时使用） | `{ value: any, updateValue: (value: any) => void, confirm: () => void, close: () => void }` |

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:8, 20-21, 144-156

### Methods

组件通过 ref 暴露以下方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开选择器弹框 | - | `void` |
| close | 关闭选择器弹框 | - | `void` |
| updateValue | 更新自定义值（自定义模式） | `value: any` | `void` |
| confirmCustom | 手动确认自定义选择（自定义模式） | - | `void` |

**使用示例：**

```vue
<template>
  <view>
    <wd-select-picker ref="pickerRef" v-model="value" :columns="columns" />
    <wd-button @click="openPicker">打开选择器</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SelectPickerInstance } from '@/wd/components/wd-select-picker/wd-select-picker.vue'

const pickerRef = ref<SelectPickerInstance>()
const value = ref('')
const columns = ref([
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' }
])

const openPicker = () => {
  pickerRef.value?.open()
}
</script>
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:364-374, 1002-1007

### 类型定义

```typescript
/**
 * 选择器类型
 */
export type SelectPickerType = 'checkbox' | 'radio' | 'custom'

/**
 * 显示格式化函数类型
 */
export type SelectPickerDisplayFormat = (
  items: string | number | boolean | (string | number | boolean)[] | any,
  columns: Record<string, any>[]
) => string

/**
 * 确认前校验函数类型
 */
export type SelectPickerBeforeConfirm = (
  value: string | number | boolean | (string | number | boolean)[] | any,
  resolve: (isPass: boolean) => void
) => void

/**
 * 自定义值变化回调函数类型
 */
export type SelectPickerCustomChangeHandler = (value: any) => void

/**
 * 选择器组件实例类型
 */
export type SelectPickerInstance = ComponentPublicInstance<
  WdSelectPickerProps,
  WdSelectPickerExpose
>
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:204-228, 1009-1013

## 主题定制

### CSS 变量

SelectPicker 组件使用了以下 CSS 变量，可以通过覆盖这些变量来定制样式：

```scss
// 单元格相关变量
$-cell-padding: 32rpx;                    // 单元格内边距
$-cell-wrapper-padding: 24rpx 0;          // 单元格包装器内边距
$-cell-title-color: #262626;              // 单元格标题颜色
$-cell-title-fs: 28rpx;                   // 单元格标题字号
$-cell-title-fs-large: 32rpx;             // 大尺寸标题字号
$-cell-line-height: 40rpx;                // 单元格行高
$-cell-value-color: #909399;              // 单元格值颜色
$-cell-icon-size: 32rpx;                  // 图标大小
$-cell-icon-size-large: 36rpx;            // 大尺寸图标大小
$-cell-arrow-color: #c5c5c5;              // 箭头颜色
$-cell-clear-color: #c5c5c5;              // 清除按钮颜色
$-cell-required-size: 28rpx;              // 必填标识大小
$-cell-required-color: #fa4350;           // 必填标识颜色

// 输入框相关变量
$-input-cell-label-width: 160rpx;         // 标签宽度
$-input-placeholder-color: #c5c5c5;       // 占位符颜色
$-input-disabled-color: #c5c5c5;          // 禁用颜色
$-input-error-color: #fa4350;             // 错误颜色

// 表单相关变量
$-form-item-error-message-color: #fa4350; // 错误信息颜色
$-form-item-error-message-font-size: 24rpx; // 错误信息字号
$-form-item-error-message-line-height: 1.2; // 错误信息行高

// 选择器相关变量
$-picker-loading-bg: rgba(255, 255, 255, 0.9); // 加载背景色
$-color-theme: #4D80F0;                   // 主题色（高亮文本）
$-color-white: #fff;                      // 白色背景
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:1017-1019

### 暗黑模式

SelectPicker 组件完整支持暗黑模式，在 `wot-theme-dark` 类下会自动应用暗黑主题样式：

```scss
.wot-theme-dark {
  .wd-select-picker {
    // 边框颜色
    &.is-border .wd-select-picker__cell {
      border-color: $-dark-border-color;
    }

    // 单元格背景和文字
    .wd-select-picker__cell {
      background-color: $-dark-background2;
      color: $-dark-color;

      &.is-disabled .wd-select-picker__value {
        color: $-dark-color3;
      }
    }

    // 标签和值颜色
    .wd-select-picker__label {
      color: $-dark-color;
    }

    .wd-select-picker__value {
      color: $-dark-color;

      &--placeholder {
        color: $-dark-color-gray;
      }
    }

    // 图标颜色
    .wd-select-picker__arrow,
    .wd-select-picker__close,
    .wd-select-picker__clear {
      color: $-dark-color;
    }

    // 自定义内容区域
    .wd-select-picker__custom-content {
      background-color: $-dark-background2;
    }

    .wd-select-picker__custom-placeholder {
      color: $-dark-color-gray;
    }
  }
}
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:1021-1065

### 自定义样式类

组件提供多个自定义样式类属性，便于精细化样式控制：

```vue
<template>
  <wd-select-picker
    v-model="value"
    :columns="columns"
    custom-class="my-picker"
    custom-header-class="my-header"
    custom-content-class="my-content"
    custom-label-class="my-label"
    custom-value-class="my-value"
    confirm-button-custom-class="my-confirm-btn"
  />
</template>

<style lang="scss">
.my-picker {
  // 自定义选择器根节点样式
}

.my-header {
  // 自定义头部样式
  font-weight: bold;
}

.my-content {
  // 自定义内容区域样式
}

.my-label {
  // 自定义标签样式
  color: #4D80F0;
}

.my-value {
  // 自定义值样式
  font-weight: 500;
}

.my-confirm-btn {
  // 自定义确认按钮样式
}
</style>
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:235-239, 315-320

## 最佳实践

### 1. 合理选择选择器类型

根据业务场景选择合适的选择器类型，避免类型滥用。

```vue
<!-- ✅ 推荐：单选场景使用 radio -->
<wd-select-picker
  v-model="gender"
  label="性别"
  type="radio"
  :columns="[
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
  ]"
/>

<!-- ✅ 推荐：多选场景使用 checkbox -->
<wd-select-picker
  v-model="skills"
  label="技能"
  type="checkbox"
  :columns="skillList"
/>

<!-- ✅ 推荐：复杂逻辑使用 custom -->
<wd-select-picker
  v-model="dateRange"
  label="日期范围"
  type="custom"
  :display-format="formatDateRange"
>
  <template #content="{ value, updateValue, confirm }">
    <!-- 自定义日期范围选择器 -->
  </template>
</wd-select-picker>

<!-- ❌ 不推荐：单选场景使用 checkbox -->
<wd-select-picker
  v-model="gender"
  label="性别"
  type="checkbox"
  :max="1"
  :columns="genderList"
/>
```

**原因：**
- 单选场景使用 radio 更符合用户认知，体验更好
- 多选场景使用 checkbox 能清晰表达多选语义
- custom 类型适用于标准选择器无法满足的复杂场景
- 不要通过限制 max=1 的方式将 checkbox 当作 radio 使用

### 2. 优化大数据量场景

大数据量场景下，合理使用搜索过滤功能提升用户体验。

```vue
<!-- ✅ 推荐：大数据量启用搜索 -->
<wd-select-picker
  v-model="city"
  label="选择城市"
  type="radio"
  :columns="allCityList"
  filterable
  filter-placeholder="输入城市名称"
  :scroll-into-view="true"
/>

<!-- ✅ 推荐：异步加载数据 -->
<wd-select-picker
  v-model="department"
  label="选择部门"
  type="radio"
  :columns="departmentList"
  :loading="isLoading"
  @open="loadDepartments"
/>

<!-- ❌ 不推荐：大数据量不提供搜索 -->
<wd-select-picker
  v-model="city"
  label="选择城市"
  type="radio"
  :columns="allCityList"
/>
```

**原因：**
- 大数据量场景下，滚动查找效率低，搜索功能必不可少
- `scroll-into-view` 确保打开时自动定位到选中项
- 异步加载避免初始化时加载大量数据，提升性能

### 3. 合理使用数量限制

多选场景下，使用 min/max 属性引导用户做出合理选择。

```vue
<!-- ✅ 推荐：明确数量限制并在标题中说明 -->
<wd-select-picker
  v-model="courses"
  label="选择课程"
  title="选择课程（最少2门，最多5门）"
  type="checkbox"
  :columns="courseList"
  :min="2"
  :max="5"
/>

<!-- ✅ 推荐：配合校验函数提供友好提示 -->
<wd-select-picker
  v-model="members"
  label="选择成员"
  title="选择成员"
  type="checkbox"
  :columns="memberList"
  :min="3"
  :max="10"
  :before-confirm="validateMembers"
/>

<script lang="ts" setup>
const validateMembers = (value: string[], resolve: (isPass: boolean) => void) => {
  if (value.length < 3) {
    showToast('至少选择3名成员')
    resolve(false)
  } else if (value.length > 10) {
    showToast('最多选择10名成员')
    resolve(false)
  } else {
    resolve(true)
  }
}
</script>

<!-- ❌ 不推荐：有限制但不告知用户 -->
<wd-select-picker
  v-model="courses"
  label="选择课程"
  type="checkbox"
  :columns="courseList"
  :min="2"
  :max="5"
/>
```

**原因：**
- 在标题或说明中明确告知用户数量限制，避免困惑
- 配合 `before-confirm` 提供友好的错误提示
- 限制规则应该对用户透明，提升体验

### 4. 自定义格式化显示

使用 `display-format` 提供更友好的显示格式，提升可读性。

```vue
<template>
  <view class="demo">
    <!-- ✅ 推荐：多选时显示选中数量 -->
    <wd-select-picker
      v-model="tags"
      label="选择标签"
      type="checkbox"
      :columns="tagList"
      :display-format="formatTagCount"
    />

    <!-- ✅ 推荐：自定义显示格式 -->
    <wd-select-picker
      v-model="members"
      label="选择成员"
      type="checkbox"
      :columns="memberList"
      :display-format="formatMembers"
    />

    <!-- ❌ 不推荐：超长文本不处理 -->
    <wd-select-picker
      v-model="longTags"
      label="选择标签"
      type="checkbox"
      :columns="tagList"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tags = ref<string[]>([])
const members = ref<string[]>([])
const longTags = ref<string[]>([])

const tagList = ref([
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' }
])

const memberList = ref([
  { label: '张三', value: 'user1' },
  { label: '李四', value: 'user2' },
  { label: '王五', value: 'user3' }
])

// 格式化：显示数量
const formatTagCount = (items: string[], columns: any[]) => {
  if (!items || items.length === 0) return ''
  return `已选择 ${items.length} 个标签`
}

// 格式化：限制显示数量
const formatMembers = (items: string[], columns: any[]) => {
  if (!items || items.length === 0) return ''

  const labels = items.slice(0, 3).map(value => {
    const item = columns.find(col => col.value === value)
    return item?.label || value
  })

  if (items.length > 3) {
    return `${labels.join(', ')} 等${items.length}人`
  }

  return labels.join(', ')
}
</script>
```

**原因：**
- 多选时默认显示所有选中项，可能导致文本过长
- 通过 `display-format` 自定义显示格式，提升可读性
- 可以显示数量、限制显示条数、使用自定义分隔符等

### 5. 表单验证最佳实践

配合 Form 组件使用时，充分利用表单验证功能。

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="formRules">
    <!-- ✅ 推荐：使用 prop 和 rules 进行验证 -->
    <wd-select-picker
      v-model="formData.city"
      label="选择城市"
      type="radio"
      :columns="cityList"
      prop="city"
    />

    <!-- ✅ 推荐：组件级 rules 进行特殊验证 -->
    <wd-select-picker
      v-model="formData.skills"
      label="选择技能"
      type="checkbox"
      :columns="skillList"
      prop="skills"
      :rules="[
        { required: true, message: '请至少选择一项技能' },
        {
          validator: validateSkillCount,
          message: '请选择2-5项技能'
        }
      ]"
    />

    <!-- ✅ 推荐：配合 before-confirm 进行业务验证 -->
    <wd-select-picker
      v-model="formData.members"
      label="项目成员"
      type="checkbox"
      :columns="memberList"
      prop="members"
      :before-confirm="validateMembers"
    />
  </wd-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd/components/wd-form/wd-form.vue'

const formRef = ref<FormInstance>()

const formData = ref({
  city: '',
  skills: [],
  members: []
})

// 表单级验证规则
const formRules = {
  city: [
    { required: true, message: '请选择城市' }
  ]
}

// 自定义验证器：技能数量
const validateSkillCount = (value: string[]) => {
  return value && value.length >= 2 && value.length <= 5
}

// 确认前验证：成员选择
const validateMembers = (value: string[], resolve: (isPass: boolean) => void) => {
  if (!value || value.length === 0) {
    showToast('请至少选择一名成员')
    resolve(false)
    return
  }

  if (value.length > 10) {
    showToast('项目成员不能超过10人')
    resolve(false)
    return
  }

  resolve(true)
}
</script>
```

**原因：**
- 使用 `prop` 属性将选择器绑定到表单字段
- 表单级 `rules` 用于通用验证（如必填）
- 组件级 `rules` 用于字段特定验证（如数量限制）
- `before-confirm` 用于业务逻辑验证（如权限检查、数据合法性等）

## 常见问题

### 1. 多选模式下初始值不生效

**问题描述：**

设置了初始值，但打开选择器后没有选中对应的选项。

```vue
<!-- 问题代码 -->
<wd-select-picker
  v-model="selectedTags"
  type="checkbox"
  :columns="tagList"
/>

<script lang="ts" setup>
// 初始值设置为字符串，但实际需要数组
const selectedTags = ref('tag1,tag2')

const tagList = ref([
  { label: '标签1', value: 'tag1' },
  { label: '标签2', value: 'tag2' }
])
</script>
```

**问题原因：**
- 多选模式下，`modelValue` 必须为数组类型或逗号分隔的字符串
- 组件通过 `isInitialValueString` 判断初始值类型，并据此决定输出格式
- 如果初始值格式错误，会导致内部值转换失败

**解决方案：**

方案一：使用数组格式（推荐）

```vue
<script lang="ts" setup>
// ✅ 使用数组格式
const selectedTags = ref<string[]>(['tag1', 'tag2'])
</script>
```

方案二：使用字符串格式

```vue
<script lang="ts" setup>
// ✅ 使用逗号分隔的字符串格式
const selectedTags = ref('tag1,tag2')
</script>
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:462-507, 918-937

### 2. 自定义字段名后显示异常

**问题描述：**

设置了 `label-key` 和 `value-key` 后，选项显示不正确或选中值异常。

```vue
<!-- 问题代码 -->
<wd-select-picker
  v-model="userId"
  type="radio"
  :columns="userList"
  label-key="userName"
  value-key="userId"
/>

<script lang="ts" setup>
const userId = ref('')

// 数据结构与字段名不匹配
const userList = ref([
  { name: '张三', id: 1 },  // ❌ 字段名不匹配
  { name: '李四', id: 2 }
])
</script>
```

**问题原因：**
- `label-key` 和 `value-key` 指定的字段名必须存在于 `columns` 数据中
- 如果字段名不匹配，`getSelectedItem` 方法无法正确查找选项
- 显示文本会为空，选中值也可能异常

**解决方案：**

```vue
<wd-select-picker
  v-model="userId"
  type="radio"
  :columns="userList"
  label-key="name"
  value-key="id"
/>

<script lang="ts" setup>
const userId = ref('')

// ✅ 字段名与 label-key、value-key 保持一致
const userList = ref([
  { name: '张三', id: 1 },
  { name: '李四', id: 2 }
])
</script>
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:285-288, 514-529

### 3. 自定义模式下值未更新

**问题描述：**

使用自定义模式时，修改了值但界面没有更新，或者确认后 `modelValue` 未变化。

```vue
<!-- 问题代码 -->
<template>
  <wd-select-picker
    v-model="customValue"
    type="custom"
    title="自定义选择"
  >
    <template #content="{ value }">
      <view @click="handleChange">
        {{ value }}
      </view>
    </template>
  </wd-select-picker>
</template>

<script lang="ts" setup>
const customValue = ref(0)

// ❌ 直接修改外部值，未调用 updateValue
const handleChange = () => {
  customValue.value++
}
</script>
```

**问题原因：**
- 自定义模式下，组件内部维护了一个 `internalValue`，与 `modelValue` 独立
- 直接修改外部 `modelValue` 不会触发内部状态更新
- 必须通过插槽参数中的 `updateValue` 方法更新值

**解决方案：**

```vue
<template>
  <wd-select-picker
    v-model="customValue"
    type="custom"
    title="自定义选择"
  >
    <template #content="{ value, updateValue, confirm }">
      <view @click="updateValue(value + 1)">
        当前值: {{ value }}
      </view>
      <wd-button @click="confirm">确认</wd-button>
    </template>
  </wd-select-picker>
</template>

<script lang="ts" setup>
const customValue = ref(0)
</script>
```

或者使用 `auto-confirm` 自动确认：

```vue
<wd-select-picker
  v-model="customValue"
  type="custom"
  :auto-confirm="true"
  :show-confirm="false"
>
  <template #content="{ value, updateValue }">
    <view @click="updateValue(value + 1)">
      当前值: {{ value }}
    </view>
  </template>
</wd-select-picker>
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:686-702, 328, 696-701

### 4. 搜索过滤不生效

**问题描述：**

设置了 `filterable` 但搜索功能不起作用，或者搜索结果不正确。

```vue
<!-- 问题代码 -->
<wd-select-picker
  v-model="city"
  type="radio"
  :columns="cityList"
  filterable
  label-key="name"
  value-key="id"
/>

<script lang="ts" setup>
const city = ref('')

// ❌ label-key 指定的字段不是字符串
const cityList = ref([
  { name: { zh: '北京' }, id: 1 },
  { name: { zh: '上海' }, id: 2 }
])
</script>
```

**问题原因：**
- 搜索功能通过字符串的 `includes` 方法进行匹配
- 如果 `label-key` 指定的字段不是字符串类型，`includes` 方法会失败
- 搜索逻辑在 `formatFilterColumns` 方法中实现

**解决方案：**

方案一：使用字符串字段作为 label-key

```vue
<script lang="ts" setup>
// ✅ 使用字符串字段
const cityList = ref([
  { name: '北京', id: 1 },
  { name: '上海', id: 2 }
])
</script>
```

方案二：添加专门的搜索字段

```vue
<wd-select-picker
  v-model="city"
  type="radio"
  :columns="cityList"
  filterable
  label-key="displayName"
  value-key="id"
/>

<script lang="ts" setup>
// ✅ 添加字符串格式的搜索字段
const cityList = ref([
  { displayName: '北京', name: { zh: '北京', en: 'Beijing' }, id: 1 },
  { displayName: '上海', name: { zh: '上海', en: 'Shanghai' }, id: 2 }
])
</script>
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:553-568, 729-740

### 5. 表单验证时机不正确

**问题描述：**

与 Form 组件配合使用时，验证时机不符合预期，或者验证消息显示异常。

```vue
<!-- 问题代码 -->
<wd-form :model="formData" :rules="rules">
  <!-- ❌ 缺少 prop 属性 -->
  <wd-select-picker
    v-model="formData.city"
    label="选择城市"
    type="radio"
    :columns="cityList"
  />
</wd-form>

<script lang="ts" setup>
const formData = ref({
  city: ''
})

const rules = {
  city: [
    { required: true, message: '请选择城市' }
  ]
}
</script>
```

**问题原因：**
- 缺少 `prop` 属性，组件无法与表单字段关联
- `errorMessage` 计算属性通过 `prop` 查找错误信息
- `isRequired` 计算属性也依赖 `prop` 判断是否必填

**解决方案：**

```vue
<wd-form ref="formRef" :model="formData" :rules="rules">
  <!-- ✅ 添加 prop 属性 -->
  <wd-select-picker
    v-model="formData.city"
    label="选择城市"
    type="radio"
    :columns="cityList"
    prop="city"
  />
</wd-form>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd/components/wd-form/wd-form.vue'

const formRef = ref<FormInstance>()

const formData = ref({
  city: ''
})

const rules = {
  city: [
    { required: true, message: '请选择城市' }
  ]
}

// 提交时验证
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('验证通过:', formData.value)
    } else {
      console.log('验证失败')
    }
  })
}
</script>
```

参考: src/wd/components/wd-select-picker/wd-select-picker.vue:312, 886-913

## 注意事项

1. **类型与值的匹配**：确保 `modelValue` 的类型与 `type` 属性匹配，`checkbox` 使用数组或字符串，`radio` 使用基本类型，`custom` 使用任意类型

2. **字段名一致性**：使用 `label-key` 和 `value-key` 时，确保字段名存在于 `columns` 数据中，否则显示和选中会异常

3. **数量限制范围**：`min` 和 `max` 仅在 `type="checkbox"` 时生效，`min` 不能大于 `max`，否则会导致所有选项不可选

4. **搜索字段类型**：启用 `filterable` 时，`label-key` 指定的字段必须是字符串类型，否则搜索功能会失败

5. **自定义模式更新**：`type="custom"` 时，必须通过插槽参数的 `updateValue` 方法更新值，不能直接修改外部 `modelValue`

6. **确认按钮显示**：`show-confirm` 仅在 `type="radio"` 或 `type="custom"` 时生效，`checkbox` 模式始终显示确认按钮

7. **表单验证关联**：与 Form 组件配合使用时，必须设置 `prop` 属性才能正确关联表单字段和验证规则

8. **加载颜色格式**：`loading-color` 必须使用完整的十六进制格式（如 `#4D80F0`），不支持缩写格式（如 `#48F`）

9. **禁用与只读**：`disabled` 和 `readonly` 都会阻止选择器打开，但样式表现不同，禁用显示灰色，只读显示正常颜色

10. **滚动定位性能**：大数据量场景下，`scroll-into-view` 可能影响打开速度，可以设置为 `false` 禁用自动滚动

11. **异步数据加载**：使用 `loading` 状态时，加载中点击确认会直接关闭选择器，不会更新 `modelValue`

12. **自定义格式化函数**：`display-format` 和 `before-confirm` 必须是函数类型，组件会在初始化时进行类型验证

---

SelectPicker 选择器组件提供了单选、多选、自定义三种选择模式，配合搜索过滤、数量限制、确认前校验等高级特性，能够满足各种复杂的选择场景需求。合理使用组件的各项功能，能够构建出功能强大、用户体验优秀的表单选择功能。
