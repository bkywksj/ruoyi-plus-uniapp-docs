---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/picker
---

# Picker 选择器

## 介绍

Picker 选择器是一个功能强大的底部弹出式选择组件,结合了 Popup 弹出层和 PickerView 选择器视图的功能。通过滚动选择的方式,用户可以从预设的数据列表中快速选择一个或多个值,广泛应用于城市选择、日期选择、级联选择等场景。组件提供了丰富的配置选项和交互能力,能够满足各种复杂的选择需求。

Picker 组件采用声明式配置的方式,通过 columns 属性传入数据源,支持字符串数组、数字数组、对象数组等多种数据格式。组件内部通过精确的状态管理和事件处理,实现了流畅的滚动选择体验。无论是简单的单列选择还是复杂的多级联动,Picker 组件都能提供优秀的用户体验。

**核心特性:**

- **单列和多列** - 支持单列选择器和多列选择器,通过 columns 数组结构自动识别,满足不同的选择场景
- **灵活数据源** - 支持字符串数组、数字数组、对象数组等多种数据格式,通过 valueKey 和 labelKey 灵活配置
- **列联动功能** - 提供 columnChange 回调,支持根据选中项动态修改其他列的数据源,实现省市区级联等复杂场景
- **自定义展示** - 通过 displayFormat 函数自定义选中值的展示格式,满足各种展示需求
- **确认前校验** - 提供 beforeConfirm 钩子,支持在确认前进行数据校验或异步处理,防止无效选择
- **表单集成** - 完整集成 wd-form 表单组件,支持表单验证、必填标识、错误提示等功能
- **清空功能** - 支持清空已选值,通过 clearable 属性启用,点击清空图标快速重置选择
- **加载状态** - 支持加载中状态,适用于异步获取数据、列联动加载等场景,提供良好的加载反馈

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:1-1059

## 基本用法

### 基础单列选择

最简单的单列选择器,传入字符串或数字数组。

```vue
<template>
  <view class="demo">
    <view class="demo-title">基础单列选择</view>

    <wd-picker
      v-model="value"
      label="选择水果"
      :columns="fruits"
      @confirm="handleConfirm"
    />

    <view class="demo-result">
      <view class="result-label">已选择:</view>
      <view class="result-value">{{ value || '未选择' }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const fruits = ['苹果', '香蕉', '橙子', '葡萄', '西瓜', '芒果', '草莓']

const handleConfirm = ({ value, selectedItems }: any) => {
  console.log('确认选择:', value, selectedItems)
}
</script>

```

**使用说明:**
- 使用 `v-model` 绑定当前选中值
- `columns` 传入字符串或数字数组作为选项列表
- `label` 设置选择器左侧的标签文案
- 点击选择器会弹出底部选择面板
- confirm 事件返回选中值和选中项对象

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:212-214

### 多列选择

通过传入二维数组实现多列选择器。

```vue
<template>
  <view class="demo">
    <view class="demo-title">多列选择</view>

    <wd-picker
      v-model="value"
      label="选择时间"
      :columns="timeColumns"
      @confirm="handleConfirm"
    />

    <view class="demo-result">
      <view class="result-label">已选择:</view>
      <view class="result-value">
        {{ Array.isArray(value) ? value.join(' : ') : '未选择' }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref<string[]>([])
const timeColumns = [
  // 第一列: 小时
  Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
  // 第二列: 分钟
  Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
  // 第三列: 秒钟
  Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
]

const handleConfirm = ({ value }: any) => {
  console.log('选择时间:', value)
}
</script>

```

**使用说明:**
- 当 `columns` 为二维数组时,自动启用多列选择模式
- `v-model` 绑定的值也应该是数组类型
- 每个子数组代表一列的数据
- confirm 事件返回的 value 为数组,包含每列选中的值

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:213

### 对象数组选择

使用对象数组作为数据源,通过 valueKey 和 labelKey 指定字段。

```vue
<template>
  <view class="demo">
    <view class="demo-title">对象数组选择</view>

    <wd-picker
      v-model="selectedCity"
      label="选择城市"
      :columns="cities"
      value-key="code"
      label-key="name"
      @confirm="handleConfirm"
    />

    <view class="demo-result">
      <view class="result-label">城市代码:</view>
      <view class="result-value">{{ selectedCity || '未选择' }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selectedCity = ref('')
const cities = [
  { code: '110000', name: '北京市', pinyin: 'beijing' },
  { code: '310000', name: '上海市', pinyin: 'shanghai' },
  { code: '440100', name: '广州市', pinyin: 'guangzhou' },
  { code: '440300', name: '深圳市', pinyin: 'shenzhen' },
  { code: '330100', name: '杭州市', pinyin: 'hangzhou' },
  { code: '320100', name: '南京市', pinyin: 'nanjing' },
]

const handleConfirm = ({ value, selectedItems }: any) => {
  console.log('选择城市:', value, selectedItems)
}
</script>

```

**使用说明:**
- `value-key` 指定对象中作为值的字段,默认为 'value'
- `label-key` 指定对象中作为显示文本的字段,默认为 'label'
- `v-model` 绑定的是 valueKey 对应的字段值
- selectedItems 返回完整的对象数据

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:207-210, 284-285

### 禁用和只读

通过 disabled 和 readonly 属性控制选择器状态。

```vue
<template>
  <view class="demo">
    <view class="demo-title">禁用和只读</view>

    <wd-picker
      v-model="value1"
      label="正常状态"
      :columns="fruits"
    />

    <wd-picker
      v-model="value2"
      label="禁用状态"
      :columns="fruits"
      disabled
    />

    <wd-picker
      v-model="value3"
      label="只读状态"
      :columns="fruits"
      readonly
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('苹果')
const value2 = ref('香蕉')
const value3 = ref('橙子')
const fruits = ['苹果', '香蕉', '橙子', '葡萄', '西瓜']
</script>

```

**使用说明:**
- `disabled` 属性禁用选择器,点击无反应,文本显示灰色
- `readonly` 属性设置只读,点击无反应,但文本保持正常颜色
- 禁用和只读状态都不会打开选择面板

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:168-171, 652-653

### 自定义展示格式

通过 displayFormat 函数自定义选中值的展示格式。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义展示格式</view>

    <wd-picker
      v-model="value"
      label="选择日期"
      :columns="dateColumns"
      :display-format="formatDate"
    />

    <wd-picker
      v-model="cityValue"
      label="选择城市"
      :columns="cities"
      value-key="code"
      label-key="name"
      :display-format="formatCity"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(['2025', '11', '15'])
const dateColumns = [
  Array.from({ length: 10 }, (_, i) => String(2020 + i)),
  Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
  Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')),
]

const cityValue = ref('440300')
const cities = [
  { code: '110000', name: '北京市', level: '直辖市' },
  { code: '310000', name: '上海市', level: '直辖市' },
  { code: '440300', name: '深圳市', level: '地级市' },
]

// 日期格式化函数
const formatDate = (items: any) => {
  if (Array.isArray(items)) {
    const [year, month, day] = items
    return `${year}年${month}月${day}日`
  }
  return ''
}

// 城市格式化函数
const formatCity = (item: any, { labelKey }: any) => {
  return `${item[labelKey]} (${item.level})`
}
</script>

```

**使用说明:**
- `display-format` 接收一个函数,返回格式化后的展示文本
- 函数参数为选中项数据,单列为对象,多列为数组
- 第二个参数包含 valueKey 和 labelKey 配置
- 可以根据需求自定义任意格式的展示文本

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:217-218, 428-434, 703-714

### 必填标识和验证

结合表单使用,支持必填标识和错误提示。

```vue
<template>
  <view class="demo">
    <view class="demo-title">必填标识和验证</view>

    <wd-picker
      v-model="value1"
      label="选择水果"
      :columns="fruits"
      required
    />

    <wd-picker
      v-model="value2"
      label="选择城市"
      :columns="cities"
      required
      error
      placeholder="请选择城市"
    />

    <view class="demo-tips">
      required 属性会在标签前显示红色星号
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const fruits = ['苹果', '香蕉', '橙子']
const cities = ['北京', '上海', '深圳']
</script>

```

**使用说明:**
- `required` 属性会在标签前显示红色星号(*)
- `error` 属性会将值和箭头显示为红色
- 结合 wd-form 使用时,会自动显示验证错误信息

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:183-194, 369-387

### 清空功能

启用清空按钮,快速清除已选值。

```vue
<template>
  <view class="demo">
    <view class="demo-title">清空功能</view>

    <wd-picker
      v-model="value"
      label="选择水果"
      :columns="fruits"
      clearable
      @clear="handleClear"
    />

    <view class="demo-tips">
      选择后会显示清空图标,点击可清空选择
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('苹果')
const fruits = ['苹果', '香蕉', '橙子', '葡萄', '西瓜']

const handleClear = () => {
  console.log('已清空')
}
</script>

```

**使用说明:**
- `clearable` 属性启用清空功能
- 有值时会显示清空图标,替代右侧箭头
- 点击清空图标会触发 clear 事件
- 清空后 v-model 值会被重置为空字符串或空数组

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:228, 392-401, 622-639

## 高级用法

### 列联动选择

通过 columnChange 回调实现列之间的联动,适用于省市区选择等场景。

```vue
<template>
  <view class="demo">
    <view class="demo-title">省市区联动</view>

    <wd-picker
      ref="pickerRef"
      v-model="region"
      label="选择地区"
      :columns="regionColumns"
      value-key="code"
      label-key="name"
      :column-change="handleColumnChange"
      :display-format="formatRegion"
      @confirm="handleConfirm"
    />

    <view class="demo-result">
      <view class="result-label">已选择:</view>
      <view class="result-value">
        {{ Array.isArray(region) ? region.join(' / ') : '未选择' }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const pickerRef = ref()
const region = ref<string[]>([])

// 模拟省市区数据
const provinces = [
  { code: '110000', name: '北京市' },
  { code: '310000', name: '上海市' },
  { code: '440000', name: '广东省' },
  { code: '330000', name: '浙江省' },
]

const cities: Record<string, any[]> = {
  '110000': [{ code: '110100', name: '北京市' }],
  '310000': [{ code: '310100', name: '上海市' }],
  '440000': [
    { code: '440100', name: '广州市' },
    { code: '440300', name: '深圳市' },
    { code: '440600', name: '佛山市' },
  ],
  '330000': [
    { code: '330100', name: '杭州市' },
    { code: '330200', name: '宁波市' },
  ],
}

const districts: Record<string, any[]> = {
  '440100': [
    { code: '440103', name: '荔湾区' },
    { code: '440104', name: '越秀区' },
  ],
  '440300': [
    { code: '440303', name: '罗湖区' },
    { code: '440304', name: '福田区' },
  ],
  '330100': [
    { code: '330102', name: '上城区' },
    { code: '330103', name: '下城区' },
  ],
}

// 初始化三列数据
const regionColumns = ref([
  provinces,
  cities['440000'] || [],
  districts['440100'] || [],
])

// 列变化回调
const handleColumnChange = (
  pickerView: any,
  value: any,
  columnIndex: number,
  resolve: any,
) => {
  console.log('列变化:', columnIndex, value)

  if (columnIndex === 0) {
    // 省份改变,更新市和区
    const selectedProvince = value[0]
    const newCities = cities[selectedProvince] || []
    const firstCity = newCities[0]?.code || ''
    const newDistricts = districts[firstCity] || []

    // 使用 setColumnData 方法更新列数据
    pickerView.setColumnData(1, newCities)
    pickerView.setColumnData(2, newDistricts)
  } else if (columnIndex === 1) {
    // 市改变,更新区
    const selectedCity = value[1]
    const newDistricts = districts[selectedCity] || []
    pickerView.setColumnData(2, newDistricts)
  }

  resolve()
}

// 格式化显示
const formatRegion = (items: any[]) => {
  return items.map((item) => item.name).join(' / ')
}

const handleConfirm = ({ value, selectedItems }: any) => {
  console.log('确认选择:', value, selectedItems)
}
</script>

```

**技术实现:**
- `column-change` 回调接收 pickerView 实例、当前值、列索引、resolve 函数
- 通过 `pickerView.setColumnData(columnIndex, data)` 更新指定列的数据
- 必须调用 `resolve()` 完成列更新流程
- 可以根据当前列的选中值动态修改其他列的数据

**使用说明:**
- 列联动适用于省市区、品牌型号等有层级关系的数据
- setColumnData 方法可以动态更新任意列的数据源
- resolve 必须调用,否则会阻塞后续操作

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:215-216

### 确认前校验

通过 beforeConfirm 钩子在确认前进行校验或异步处理。

```vue
<template>
  <view class="demo">
    <view class="demo-title">确认前校验</view>

    <wd-picker
      v-model="value"
      label="选择数量"
      :columns="quantities"
      :before-confirm="handleBeforeConfirm"
      @confirm="handleConfirm"
    />

    <view class="demo-tips">
      尝试选择大于 100 的数量,会提示库存不足
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { uni } from '@dcloudio/uni-app'

const value = ref('')
const quantities = Array.from({ length: 200 }, (_, i) => i + 1)

const handleBeforeConfirm = (
  value: any,
  resolve: (isPass: boolean) => void,
  picker: any,
) => {
  console.log('确认前校验:', value)

  // 模拟库存检查
  const selectedQuantity = Number(value)

  if (selectedQuantity > 100) {
    uni.showToast({
      title: '库存不足,最多只能选择 100 件',
      icon: 'none',
    })
    resolve(false) // 不通过,不关闭选择器
  } else {
    // 通过校验,关闭选择器
    resolve(true)
  }
}

const handleConfirm = ({ value }: any) => {
  console.log('确认选择:', value)
}
</script>

```

**技术实现:**
- `before-confirm` 接收 value、resolve、picker 三个参数
- value 为当前选中的值
- resolve 函数控制是否关闭选择器,传入 true 关闭,false 保持打开
- picker 为组件实例,可以调用组件方法

**使用说明:**
- 适用于需要校验、异步检查、二次确认等场景
- 可以在 beforeConfirm 中进行网络请求、数据校验等
- resolve(false) 会阻止选择器关闭,用户可以重新选择

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:197-198, 575-596

### 加载状态

使用 loading 状态显示加载中,适用于异步加载数据的场景。

```vue
<template>
  <view class="demo">
    <view class="demo-title">加载状态</view>

    <wd-picker
      ref="pickerRef"
      v-model="selectedCity"
      label="选择城市"
      :columns="cities"
      :loading="isLoading"
      loading-color="#FF6B6B"
      @open="handleOpen"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const pickerRef = ref()
const selectedCity = ref('')
const cities = ref<string[]>([])
const isLoading = ref(false)

const handleOpen = async () => {
  console.log('打开选择器,开始加载数据')

  // 设置加载状态
  pickerRef.value?.setLoading(true)
  // 或者直接使用 isLoading
  // isLoading.value = true

  try {
    // 模拟异步加载数据
    await new Promise((resolve) => setTimeout(resolve, 2000))
    cities.value = ['北京', '上海', '广州', '深圳', '杭州', '南京']
  } finally {
    // 关闭加载状态
    pickerRef.value?.setLoading(false)
    // isLoading.value = false
  }
}

const handleConfirm = ({ value }: any) => {
  console.log('确认选择:', value)
}
</script>

```

**技术实现:**
- 通过 `loading` 属性或 `setLoading` 方法控制加载状态
- 加载中时选择器显示加载动画
- `loading-color` 可以自定义加载动画颜色
- 加载中时确认按钮不可点击

**使用说明:**
- 适用于打开选择器时异步加载数据的场景
- 可以在 open 事件中加载数据
- setLoading 方法可以在任意时机调用

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:172-175, 261, 645-647

### 自定义插槽

使用插槽自定义选择器的触发区域。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义插槽</view>

    <wd-picker
      v-model="value"
      :columns="fruits"
      use-default-slot
    >
      <view class="custom-trigger">
        <wd-icon name="apple" size="40" color="#FF6B6B" />
        <view class="trigger-text">
          <view class="trigger-label">选择水果</view>
          <view class="trigger-value">
            {{ value || '请选择' }}
          </view>
        </view>
        <wd-icon name="right" size="32" color="#C8C9CC" />
      </view>
    </wd-picker>

    <wd-picker
      v-model="city"
      :columns="cities"
      use-label-slot
    >
      <template #label>
        <view class="custom-label">
          <wd-icon name="location" size="32" color="#1890FF" />
          <text class="label-text">所在城市</text>
        </view>
      </template>
    </wd-picker>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const city = ref('')
const fruits = ['苹果', '香蕉', '橙子']
const cities = ['北京', '上海', '深圳']
</script>

```

**使用说明:**
- `use-default-slot` 启用默认插槽,完全自定义触发区域
- `use-label-slot` 启用标签插槽,仅自定义标签部分
- 自定义插槽提供了更灵活的样式定制能力

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:189-192

### 表单集成

在表单中使用 Picker,支持验证和错误提示。

```vue
<template>
  <view class="demo">
    <view class="demo-title">表单集成</view>

    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-picker
        v-model="formData.city"
        prop="city"
        label="所在城市"
        :columns="cities"
        placeholder="请选择城市"
      />

      <wd-picker
        v-model="formData.industry"
        prop="industry"
        label="所属行业"
        :columns="industries"
        placeholder="请选择行业"
      />

      <wd-picker
        v-model="formData.level"
        prop="level"
        label="用户等级"
        :columns="levels"
        value-key="value"
        label-key="label"
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
  city: '',
  industry: '',
  level: '',
})

const cities = ['北京', '上海', '广州', '深圳']
const industries = ['互联网', '金融', '教育', '医疗', '制造']
const levels = [
  { value: '1', label: '普通会员' },
  { value: '2', label: '高级会员' },
  { value: '3', label: 'VIP 会员' },
]

const rules = {
  city: [
    { required: true, message: '请选择所在城市' },
  ],
  industry: [
    { required: true, message: '请选择所属行业' },
  ],
  level: [
    { required: true, message: '请选择用户等级' },
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
  formData.city = ''
  formData.industry = ''
  formData.level = ''
  formRef.value?.clearValidate()
}
</script>

```

**技术实现:**
- Picker 组件完整集成 wd-form 组件
- 通过 `prop` 属性指定表单字段名
- 通过 `rules` 或表单的 rules 配置验证规则
- 必填规则会自动显示红色星号

**使用说明:**
- 在 wd-form 中使用时必须指定 prop 属性
- 验证错误信息会自动显示在选择器下方
- 支持表单的 validate、clearValidate 等方法

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:221-224, 302-303, 358-364

### 方法调用

通过 ref 获取组件实例,调用组件方法。

```vue
<template>
  <view class="demo">
    <view class="demo-title">方法调用</view>

    <wd-picker
      ref="pickerRef"
      v-model="value"
      label="选择水果"
      :columns="fruits"
    />

    <view class="demo-actions">
      <button class="btn" @click="handleOpen">打开选择器</button>
      <button class="btn" @click="handleClose">关闭选择器</button>
      <button class="btn" @click="handleSetLoading">切换加载</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const pickerRef = ref()
const value = ref('')
const fruits = ['苹果', '香蕉', '橙子']
const isLoadingState = ref(false)

const handleOpen = () => {
  pickerRef.value?.open()
}

const handleClose = () => {
  pickerRef.value?.close()
}

const handleSetLoading = () => {
  isLoadingState.value = !isLoadingState.value
  pickerRef.value?.setLoading(isLoadingState.value)
}
</script>

```

**使用说明:**
- `open()` - 打开选择器弹框
- `close()` - 关闭选择器弹框
- `setLoading(loading)` - 设置加载状态

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:255-262, 686-695, 795-799

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 选中项的值,单列为 string/number,多列为数组 | `string \| number \| Array<string \| number>` | `''` |
| columns | 选择器数据,字符串/数字/对象数组,二维数组表示多列 | `Array<string \| number \| ColumnItem \| Array>` | `[]` |
| label | 选择器左侧文案 | `string` | - |
| placeholder | 占位符 | `string` | `'请选择'` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |
| value-key | 选项值对应的键名 | `string` | `'value'` |
| label-key | 选项文本对应的键名 | `string` | `'label'` |
| title | 弹出层标题 | `string` | - |
| cancel-button-text | 取消按钮文案 | `string` | `'取消'` |
| confirm-button-text | 确认按钮文案 | `string` | `'完成'` |
| loading | 加载中 | `boolean` | `false` |
| loading-color | 加载中颜色 | `string` | `'#4D80F0'` |
| before-confirm | 确认前校验函数 | `PickerBeforeConfirm` | - |
| column-change | 列变化回调 | `PickerViewColumnChange` | - |
| display-format | 自定义展示格式化函数 | `PickerDisplayFormat` | - |
| close-on-click-modal | 点击蒙层关闭 | `boolean` | `true` |
| safe-area-inset-bottom | 底部安全区域 | `boolean` | `true` |
| ellipsis | 文本溢出显示省略号 | `boolean` | `false` |
| size | 尺寸,可选 large | `string` | - |
| label-width | 标签宽度 | `string` | - |
| align-right | 右对齐 | `boolean` | `false` |
| error | 错误状态 | `boolean` | `false` |
| columns-height | 选项总高度 | `number` | `434` |
| z-index | 自定义层级 | `number` | `100` |
| use-default-slot | 使用默认插槽 | `boolean` | `false` |
| use-label-slot | 使用标签插槽 | `boolean` | `false` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| immediate-change | 是否在手指松开时立即触发 change 事件 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-label-class | 自定义标签样式类 | `string` | `''` |
| custom-value-class | 自定义值样式类 | `string` | `''` |
| custom-view-class | 自定义选择器视图样式类 | `string` | `''` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:152-229, 265-293

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值更新时触发 | `value: string \| number \| Array<string \| number>` |
| confirm | 确认选择时触发 | `{ value, selectedItems }` |
| open | 打开选择器时触发 | - |
| cancel | 取消选择时触发 | - |
| clear | 清空选择时触发 | - |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:234-250

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义触发区域,需设置 use-default-slot 为 true |
| label | 自定义标签,需设置 use-label-slot 为 true |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:10-24

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开选择器弹框 | - | `void` |
| close | 关闭选择器弹框 | - | `void` |
| setLoading | 设置加载状态 | `loading: boolean` | `void` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:255-262, 686-695, 795-799

### 类型定义

```typescript
/**
 * 列项类型
 */
interface ColumnItem {
  [key: string]: any
}

/**
 * 选择器值类型
 */
type PickerValue = string | number | boolean | Array<string | number | boolean>

/**
 * 选择器展示格式化函数类型
 */
type PickerDisplayFormat = (
  item: ColumnItem | ColumnItem[],
  vl: {
    valueKey: string
    labelKey: string
  },
) => string

/**
 * 选择器确认前校验函数类型
 */
type PickerBeforeConfirm = (
  value: PickerValue,
  resolve: (isPass: boolean) => void,
  picker: any,
) => void

/**
 * 列变化回调类型
 */
type PickerViewColumnChange = (
  pickerView: any,
  value: any,
  columnIndex: number,
  resolve: () => void,
) => void
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:124-148

## 主题定制

### CSS 变量

Picker 组件提供了丰富的 CSS 变量用于主题定制:

```scss
// 单元格相关
$-cell-padding: 30rpx;
$-cell-wrapper-padding: 20rpx;
$-cell-line-height: 48rpx;
$-cell-title-fs: 28rpx;
$-cell-title-fs-large: 32rpx;
$-cell-title-color: #262626;
$-cell-value-color: #262626;
$-cell-icon-size: 40rpx;
$-cell-icon-size-large: 48rpx;
$-cell-arrow-color: #C5C5C5;
$-cell-clear-color: #C5C5C5;
$-cell-required-size: 28rpx;
$-cell-required-color: #FA4350;

// 选择器相关
$-picker-toolbar-fs: 28rpx;
$-picker-toolbar-height: 96rpx;
$-picker-action-height: 96rpx;
$-picker-toolbar-title-color: #262626;
$-picker-toolbar-cancel-color: #666;
$-picker-toolbar-finish-color: #0084FF;
$-picker-loading-button-color: #C5C5C5;
$-picker-column-disabled-color: #C5C5C5;

// 输入框相关
$-input-cell-label-width: 33%;
$-input-placeholder-color: #BFBFBF;
$-input-disabled-color: #C5C5C5;
$-input-error-color: #FA4350;

// 表单相关
$-form-item-error-message-color: #FA4350;
$-form-item-error-message-font-size: 24rpx;
$-form-item-error-message-line-height: 32rpx;
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:807-1058

### 暗色主题

组件内置暗色主题支持:

```scss
.wot-theme-dark {
  .wd-picker {
    // 标题和标签
    &__title,
    &__label,
    &__value {
      color: $-dark-color;
    }

    // 占位符
    &__placeholder {
      color: $-dark-color-gray;
    }

    // 单元格
    &__cell {
      background-color: $-dark-background2;
      color: $-dark-color;
    }

    // 禁用状态
    &.is-disabled {
      .wd-picker__value {
        color: $-dark-color3;
      }
    }

    // 操作按钮
    &__action--cancel {
      color: $-dark-color;
    }

    &__action.is-loading {
      color: $-dark-color3;
    }
  }
}
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:810-874

## 最佳实践

### 1. 数据源格式选择

根据场景选择合适的数据源格式。

```vue
<!-- ✅ 推荐: 简单列表使用字符串数组 -->
<wd-picker
  v-model="fruit"
  :columns="['苹果', '香蕉', '橙子']"
/>

<!-- ✅ 推荐: 需要额外数据时使用对象数组 -->
<wd-picker
  v-model="cityCode"
  :columns="cities"
  value-key="code"
  label-key="name"
/>
<script setup>
const cities = [
  { code: '110000', name: '北京市', pinyin: 'beijing' },
  // ...
]
</script>

<!-- ❌ 不推荐: 简单列表使用对象数组 -->
<wd-picker
  v-model="fruit"
  :columns="[
    { value: '苹果', label: '苹果' },
    { value: '香蕉', label: '香蕉' },
  ]"
/>
```

**说明:**
- 简单列表优先使用字符串或数字数组,代码更简洁
- 需要额外数据(如拼音、编码)时才使用对象数组
- 避免不必要的对象嵌套,影响性能

### 2. 列联动的正确处理

列联动时正确处理数据更新和 resolve 调用。

```vue
<script setup>
// ✅ 推荐: 正确的列联动处理
const handleColumnChange = (
  pickerView,
  value,
  columnIndex,
  resolve
) => {
  if (columnIndex === 0) {
    const newData = getDataByProvince(value[0])
    pickerView.setColumnData(1, newData)
  }
  resolve() // ✅ 必须调用
}

// ❌ 错误: 忘记调用 resolve
const handleColumnChange = (
  pickerView,
  value,
  columnIndex,
  resolve
) => {
  if (columnIndex === 0) {
    pickerView.setColumnData(1, newData)
  }
  // ❌ 忘记调用 resolve(),会导致卡死
}

// ❌ 错误: 在 resolve 前执行异步操作
const handleColumnChange = async (
  pickerView,
  value,
  columnIndex,
  resolve
) => {
  resolve() // ❌ 不应该在异步操作前调用
  const data = await fetchData()
  pickerView.setColumnData(1, data)
}
</script>
```

**说明:**
- columnChange 回调中必须调用 resolve()
- 异步操作应该在 resolve() 之前完成
- 可以使用 setLoading 显示加载状态

### 3. beforeConfirm 的使用场景

正确使用 beforeConfirm 进行校验。

```vue
<script setup>
// ✅ 推荐: 同步校验
const handleBeforeConfirm = (value, resolve) => {
  if (value > 100) {
    uni.showToast({ title: '数量不能超过100', icon: 'none' })
    resolve(false)
  } else {
    resolve(true)
  }
}

// ✅ 推荐: 异步校验
const handleBeforeConfirm = async (value, resolve, picker) => {
  picker.setLoading(true)
  try {
    const isValid = await checkStock(value)
    if (isValid) {
      resolve(true)
    } else {
      uni.showToast({ title: '库存不足', icon: 'none' })
      resolve(false)
    }
  } finally {
    picker.setLoading(false)
  }
}

// ❌ 错误: 异步操作后没有处理 resolve
const handleBeforeConfirm = async (value, resolve) => {
  const isValid = await checkStock(value)
  // ❌ 如果异步操作失败,没有调用 resolve
}
</script>
```

**说明:**
- 同步校验直接调用 resolve(true/false)
- 异步校验时使用 setLoading 显示加载状态
- 无论成功失败都要调用 resolve

### 4. 表单集成的注意事项

在表单中正确使用 Picker。

```vue
<template>
  <!-- ✅ 推荐: 完整的表单集成 -->
  <wd-form :model="form" :rules="rules">
    <wd-picker
      v-model="form.city"
      prop="city"
      label="城市"
      :columns="cities"
    />
  </wd-form>

  <!-- ❌ 错误: 缺少 prop 属性 -->
  <wd-form :model="form" :rules="rules">
    <wd-picker
      v-model="form.city"
      label="城市"
      :columns="cities"
    />
  </wd-form>
</template>

<script setup>
// ✅ 推荐: 规则定义正确
const rules = {
  city: [
    { required: true, message: '请选择城市' },
  ],
}

// ❌ 错误: 规则字段名与 prop 不匹配
// const rules = {
//   cityCode: [  // ❌ 与 prop="city" 不匹配
//     { required: true, message: '请选择城市' },
//   ],
// }
</script>
```

**说明:**
- 在表单中使用必须指定 prop 属性
- prop 值必须与表单数据字段名一致
- 规则字段名必须与 prop 一致

### 5. 性能优化建议

优化大数据量场景的性能。

```vue
<script setup>
// ❌ 不推荐: 每次都重新生成数组
const getColumns = () => {
  return Array.from({ length: 10000 }, (_, i) => i)
}

// ✅ 推荐: 缓存数据
const columns = Array.from({ length: 10000 }, (_, i) => i)

// ✅ 推荐: 使用 computed 缓存计算结果
const dateColumns = computed(() => [
  Array.from({ length: 10 }, (_, i) => 2020 + i),
  Array.from({ length: 12 }, (_, i) => i + 1),
  Array.from({ length: 31 }, (_, i) => i + 1),
])

// ❌ 不推荐: 在列联动中执行耗时操作
const handleColumnChange = (pickerView, value, index, resolve) => {
  // ❌ 复杂计算
  const newData = heavyComputation(value)
  pickerView.setColumnData(1, newData)
  resolve()
}

// ✅ 推荐: 提前准备好数据
const dataMap = preComputeData()
const handleColumnChange = (pickerView, value, index, resolve) => {
  const newData = dataMap[value[0]] // ✅ 直接查表
  pickerView.setColumnData(1, newData)
  resolve()
}
</script>
```

**说明:**
- 大数据量时缓存 columns 数据
- 列联动中避免复杂计算,提前准备数据
- 使用 computed 缓存计算结果

## 常见问题

### 1. 多列选择器值不更新

**问题原因:**
- v-model 绑定的值类型错误,应该是数组但传入了字符串
- columns 为二维数组,但 v-model 绑定的不是数组
- 数组引用未改变,Vue 未检测到变化

**解决方案:**
```vue
<!-- ❌ 错误: 多列选择器使用字符串 -->
<wd-picker
  v-model="value"
  :columns="[['A', 'B'], ['1', '2']]"
/>
<script setup>
const value = ref('')  // ❌ 应该是数组
</script>

<!-- ✅ 正确: 使用数组 -->
<script setup>
const value = ref([])  // ✅ 数组类型
</script>

<!-- ❌ 错误: 直接修改数组元素 -->
<script setup>
value.value[0] = 'A'  // ❌ Vue 2 可能检测不到
</script>

<!-- ✅ 正确: 替换整个数组 -->
<script setup>
value.value = ['A', '1']  // ✅ 替换整个数组
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:720-734

### 2. 列联动不生效

**问题原因:**
- 忘记调用 resolve() 函数
- setColumnData 参数错误
- 异步操作时机不对

**解决方案:**
```vue
<script setup>
// ❌ 错误: 忘记调用 resolve
const handleColumnChange = (pickerView, value, index, resolve) => {
  pickerView.setColumnData(1, newData)
  // ❌ 忘记调用 resolve()
}

// ✅ 正确: 调用 resolve
const handleColumnChange = (pickerView, value, index, resolve) => {
  pickerView.setColumnData(1, newData)
  resolve()  // ✅ 必须调用
}

// ❌ 错误: 列索引错误
const handleColumnChange = (pickerView, value, index, resolve) => {
  if (index === 0) {
    pickerView.setColumnData(0, newData)  // ❌ 不应该修改当前列
  }
  resolve()
}

// ✅ 正确: 修改其他列
const handleColumnChange = (pickerView, value, index, resolve) => {
  if (index === 0) {
    pickerView.setColumnData(1, newData)  // ✅ 修改下一列
  }
  resolve()
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:215-216

### 3. displayFormat 不生效

**问题原因:**
- displayFormat 函数返回值类型错误
- 函数中访问了错误的属性
- 单列和多列判断错误

**解决方案:**
```vue
<script setup>
// ❌ 错误: 未返回字符串
const formatValue = (items) => {
  console.log(items)  // ❌ 没有 return
}

// ✅ 正确: 返回字符串
const formatValue = (items) => {
  return items.map(item => item.label).join(' / ')
}

// ❌ 错误: 单列时访问数组方法
const formatValue = (items) => {
  return items.join(' / ')  // ❌ 单列时 items 是对象,不是数组
}

// ✅ 正确: 区分单列和多列
const formatValue = (items, { labelKey }) => {
  if (Array.isArray(items)) {
    return items.map(item => item[labelKey]).join(' / ')
  }
  return items[labelKey]
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:428-434, 703-714

### 4. beforeConfirm 阻塞问题

**问题原因:**
- 异步操作后忘记调用 resolve
- resolve 参数传错
- 异步错误未捕获

**解决方案:**
```vue
<script setup>
// ❌ 错误: 异步后忘记 resolve
const handleBeforeConfirm = async (value, resolve) => {
  const result = await check(value)
  // ❌ 忘记调用 resolve
}

// ✅ 正确: 正确处理异步
const handleBeforeConfirm = async (value, resolve) => {
  try {
    const result = await check(value)
    resolve(result)
  } catch (error) {
    console.error(error)
    resolve(false)  // ✅ 错误时也要 resolve
  }
}

// ❌ 错误: resolve 参数错误
const handleBeforeConfirm = (value, resolve) => {
  if (value > 100) {
    resolve('error')  // ❌ 应该传 boolean
  }
}

// ✅ 正确: resolve 传布尔值
const handleBeforeConfirm = (value, resolve) => {
  if (value > 100) {
    resolve(false)  // ✅ 传 false
  } else {
    resolve(true)   // ✅ 传 true
  }
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:575-596

### 5. 表单验证不生效

**问题原因:**
- 缺少 prop 属性
- prop 值与表单字段不匹配
- rules 配置错误

**解决方案:**
```vue
<!-- ❌ 错误: 缺少 prop -->
<wd-form :model="form" :rules="rules">
  <wd-picker
    v-model="form.city"
    label="城市"
    :columns="cities"
  />
</wd-form>

<!-- ✅ 正确: 添加 prop -->
<wd-form :model="form" :rules="rules">
  <wd-picker
    v-model="form.city"
    prop="city"
    label="城市"
    :columns="cities"
  />
</wd-form>

<script setup>
// ❌ 错误: rules 字段名不匹配
const rules = {
  cityCode: [  // ❌ 与 prop="city" 不匹配
    { required: true, message: '请选择' },
  ],
}

// ✅ 正确: 字段名匹配
const rules = {
  city: [  // ✅ 与 prop="city" 匹配
    { required: true, message: '请选择城市' },
  ],
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:221-224, 358-387

## 注意事项

1. **数据源类型**
   - columns 支持字符串数组、数字数组、对象数组
   - 二维数组表示多列选择器
   - 对象数组需要配合 valueKey 和 labelKey 使用

2. **值绑定类型**
   - 单列选择器 v-model 绑定字符串或数字
   - 多列选择器 v-model 绑定数组
   - 类型必须与 columns 结构匹配

3. **列联动限制**
   - columnChange 回调中必须调用 resolve()
   - 不能修改当前列的数据,只能修改其他列
   - 异步操作建议使用 setLoading 显示加载状态

4. **beforeConfirm 钩子**
   - 必须调用 resolve(true/false)
   - resolve(true) 关闭选择器
   - resolve(false) 保持选择器打开

5. **表单集成要求**
   - 必须指定 prop 属性
   - prop 值必须与表单字段名一致
   - rules 配置的字段名必须与 prop 一致

6. **清空功能**
   - clearable 启用清空按钮
   - 清空后值为空字符串或空数组
   - 清空会触发 clear 事件

7. **禁用和只读**
   - disabled 完全禁用,颜色变灰
   - readonly 只读,不打开选择器但颜色正常
   - 两者都不会触发 confirm 事件

8. **自定义展示**
   - displayFormat 接收选中项和配置对象
   - 单列时参数为对象,多列时为数组
   - 必须返回字符串

9. **加载状态**
   - loading 属性或 setLoading 方法控制
   - 加载中时确认按钮不可点击
   - loadingColor 可自定义加载动画颜色

10. **插槽使用**
    - use-default-slot 完全自定义触发区域
    - use-label-slot 仅自定义标签部分
    - 启用插槽后相关 Props 不生效

11. **性能优化**
    - 大数据量时缓存 columns
    - 列联动避免复杂计算
    - 使用 computed 缓存计算结果

12. **平台兼容性**
    - 组件在 H5、小程序、App 都支持
    - immediateChange 仅微信和支付宝小程序支持
    - 暗色主题需要配合主题切换使用

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-picker/wd-picker.vue:1-1059
