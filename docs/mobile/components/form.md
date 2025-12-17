# 表单组件

表单组件用于数据录入，支持与 `wd-form` 配合使用实现表单校验功能。

## 组件列表

| 组件 | 说明 |
|------|------|
| Form | 表单容器，数据校验 |
| Input | 输入框，文本输入 |
| Textarea | 文本域，多行文本 |
| Picker | 选择器，滚动选择 |
| DatetimePicker | 时间选择器 |
| Calendar | 日历选择器 |
| Checkbox | 复选框 |
| Radio | 单选框 |
| Switch | 开关 |
| Slider | 滑块 |
| Rate | 评分 |
| Search | 搜索框 |
| Upload | 文件上传 |

## Form 表单

表单容器组件，用于收集、校验和提交数据。

### 基本用法

```vue
<template>
  <wd-form ref="formRef" :model="form" :rules="rules">
    <wd-cell-group>
      <wd-input v-model="form.name" label="姓名" prop="name" />
      <wd-input v-model="form.phone" label="手机号" prop="phone" />
    </wd-cell-group>
    <wd-button type="primary" block @click="submit">提交</wd-button>
  </wd-form>
</template>

<script lang="ts" setup>
const formRef = ref()
const form = reactive({ name: '', phone: '' })

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ]
}

const submit = async () => {
  const { valid, errors } = await formRef.value.validate()
  if (valid) console.log('表单验证通过', form)
}
</script>
```

### 校验规则

```typescript
const rules = {
  // 必填校验
  name: [{ required: true, message: '请输入姓名' }],

  // 正则校验
  email: [{ pattern: /^[\w-]+@[\w-]+\.\w+$/, message: '邮箱格式不正确' }],

  // 长度校验
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码不少于6位' },
    { max: 20, message: '密码不超过20位' }
  ],

  // 自定义校验函数
  confirmPassword: [{
    required: true,
    message: '请确认密码',
    validator: (value) => {
      if (value !== form.password) return Promise.reject('两次密码不一致')
      return Promise.resolve()
    }
  }]
}
```

### 错误提示方式

```vue
<!-- 在输入框下方显示错误信息（默认） -->
<wd-form :model="form" :rules="rules" error-type="message" />

<!-- Toast 提示 -->
<wd-form :model="form" :rules="rules" error-type="toast" />

<!-- 不提示 -->
<wd-form :model="form" :rules="rules" error-type="none" />
```

### Form Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model | 表单数据对象 | `Record<string, any>` | - |
| rules | 表单验证规则 | `FormRules` | `{}` |
| reset-on-change | 输入时重置校验信息 | `boolean` | `true` |
| error-type | 错误提示类型 | `'toast' \| 'message' \| 'none'` | `'message'` |
| label-width | 统一设置标签宽度 | `string \| number` | - |

### Form Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate | 表单校验 | `(prop?: string \| string[]) => Promise<{ valid, errors }>` |
| reset | 重置表单校验状态 | `() => void` |

### 校验规则类型

```typescript
interface FormItemRule {
  required?: boolean
  message: string
  pattern?: RegExp
  min?: number
  max?: number
  validator?: (value: any) => boolean | Promise<string> | Promise<boolean>
}

interface FormRules {
  [key: string]: FormItemRule[]
}
```

## Input 输入框

### 基本用法

```vue
<template>
  <wd-input v-model="value" placeholder="请输入" />
  <wd-input v-model="value" label="用户名" placeholder="请输入用户名" />
  <wd-input v-model="password" type="password" show-password label="密码" />
  <wd-input v-model="value" clearable placeholder="可清除" />
</template>
```

### 输入类型

```vue
<wd-input v-model="value" type="text" label="文本" />
<wd-input v-model="value" type="number" label="数字" />
<wd-input v-model="value" type="idcard" label="身份证" />
<wd-input v-model="value" type="digit" label="小数" />
<wd-input v-model="value" type="tel" label="电话" />
```

### 前后置图标

```vue
<wd-input v-model="value" prefix-icon="user" placeholder="用户名" />
<wd-input v-model="value" suffix-icon="search" placeholder="搜索" />

<wd-input v-model="value" placeholder="金额">
  <template #prefix><text>￥</text></template>
  <template #suffix><text>.00</text></template>
</wd-input>
```

### Input Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `string \| number` | `''` |
| type | 输入框类型 | `'text' \| 'number' \| 'digit' \| 'idcard' \| 'tel' \| 'password'` | `'text'` |
| placeholder | 占位文本 | `string` | - |
| label | 左侧标题 | `string` | - |
| label-width | 标签宽度 | `string \| number` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| clearable | 显示清除按钮 | `boolean` | `false` |
| show-password | 显示密码切换按钮 | `boolean` | `false` |
| maxlength | 最大输入长度 | `number` | `-1` |
| show-word-limit | 显示字数统计 | `boolean` | `false` |
| prefix-icon | 前置图标 | `string` | - |
| suffix-icon | 后置图标 | `string` | - |
| error | 错误状态 | `boolean` | `false` |
| required | 是否必填 | `boolean` | `false` |
| prop | 表单字段名 | `string` | - |
| rules | 验证规则 | `FormItemRule[]` | `[]` |

### Input Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| input | 输入时触发 | `detail: any` |
| change | 值变化时触发 | `value` |
| focus | 聚焦时触发 | `detail: any` |
| blur | 失焦时触发 | `{ value }` |
| clear | 点击清除时触发 | - |
| confirm | 点击键盘确认时触发 | `detail: any` |

### Input Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 前置内容 |
| suffix | 后置内容 |
| label | 自定义标签 |

## Picker 选择器

### 基本用法

```vue
<template>
  <wd-picker v-model="value" :columns="columns" label="选择城市" @confirm="onConfirm" />
</template>

<script lang="ts" setup>
const value = ref('')
const columns = ['北京', '上海', '广州', '深圳']

const onConfirm = ({ value, selectedItems }) => {
  console.log('选中值:', value)
}
</script>
```

### 对象数组

```vue
<template>
  <wd-picker v-model="value" :columns="columns" value-key="id" label-key="name" label="选择" />
</template>

<script lang="ts" setup>
const value = ref(1)
const columns = [
  { id: 1, name: '北京' },
  { id: 2, name: '上海' },
  { id: 3, name: '广州' }
]
</script>
```

### 多列选择

```vue
<template>
  <wd-picker v-model="value" :columns="columns" label="选择日期" />
</template>

<script lang="ts" setup>
const value = ref(['2024', '01', '01'])
const columns = [
  ['2023', '2024', '2025'],
  ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
  ['01', '02', '03', '...', '31']
]
</script>
```

### 联动选择

```vue
<template>
  <wd-picker v-model="value" :columns="columns" :column-change="onColumnChange" label="选择地区" />
</template>

<script lang="ts" setup>
const columns = ref([
  [{ label: '北京', value: '110000' }, { label: '广东', value: '440000' }],
  [{ label: '北京市', value: '110100' }]
])

const onColumnChange = ({ picker, selectedItem, resolve }) => {
  if (selectedItem.value === '440000') {
    picker.setColumnData(1, [
      { label: '广州市', value: '440100' },
      { label: '深圳市', value: '440300' }
    ])
  }
  resolve()
}
</script>
```

### Picker Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `string \| number \| Array` | `''` |
| columns | 选择器数据 | `Array` | `[]` |
| label | 左侧标题 | `string` | - |
| placeholder | 占位文本 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| loading | 加载状态 | `boolean` | `false` |
| title | 弹出层标题 | `string` | - |
| value-key | 选项值字段名 | `string` | `'value'` |
| label-key | 选项文本字段名 | `string` | `'label'` |
| display-format | 自定义显示格式 | `Function` | - |
| column-change | 联动回调 | `Function` | - |
| clearable | 是否可清空 | `boolean` | `false` |

### Picker Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 确认选择时触发 | `{ value, selectedItems }` |
| cancel | 取消选择时触发 | - |
| open | 打开选择器时触发 | - |
| clear | 清空时触发 | - |

### Picker Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| open | 打开选择器 | - |
| close | 关闭选择器 | - |

## DatetimePicker 日期时间选择器

### 基本用法

```vue
<template>
  <wd-datetime-picker v-model="date" type="date" label="选择日期" />
  <wd-datetime-picker v-model="time" type="time" label="选择时间" />
  <wd-datetime-picker v-model="datetime" type="datetime" label="日期时间" />
  <wd-datetime-picker v-model="yearMonth" type="year-month" label="选择年月" />
</template>

<script lang="ts" setup>
const date = ref(Date.now())
const time = ref('12:00')
const datetime = ref(Date.now())
const yearMonth = ref(Date.now())
</script>
```

### 限制日期范围

```vue
<template>
  <wd-datetime-picker v-model="date" type="date" :min-date="minDate" :max-date="maxDate" label="选择日期" />
</template>

<script lang="ts" setup>
const date = ref(Date.now())
const minDate = new Date('2020-01-01').getTime()
const maxDate = new Date('2030-12-31').getTime()
</script>
```

### 自定义格式化

```vue
<script lang="ts" setup>
const formatter = (type, value) => {
  if (type === 'year') return `${value}年`
  if (type === 'month') return `${value}月`
  if (type === 'date') return `${value}日`
  return value
}
</script>
```

### DatetimePicker Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `string \| number \| Array` | - |
| type | 选择器类型 | `'date' \| 'time' \| 'datetime' \| 'year-month' \| 'year'` | `'datetime'` |
| label | 左侧标题 | `string` | - |
| placeholder | 占位文本 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| min-date | 最小日期 | `number` | 十年前 |
| max-date | 最大日期 | `number` | 十年后 |
| min-hour | 最小小时 | `number` | `0` |
| max-hour | 最大小时 | `number` | `23` |
| use-second | 启用秒选择 | `boolean` | `false` |
| formatter | 选项格式化 | `Function` | - |
| display-format | 显示格式化 | `Function` | - |

### DatetimePicker Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 确认选择时触发 | `{ value }` |
| cancel | 取消选择时触发 | - |
| change | 值变化时触发 | `{ value }` |

## Checkbox 复选框

### 基本用法

```vue
<template>
  <!-- 单独使用 -->
  <wd-checkbox v-model="checked">复选框</wd-checkbox>

  <!-- 复选框组 -->
  <wd-checkbox-group v-model="checkedList">
    <wd-checkbox :model-value="1">选项1</wd-checkbox>
    <wd-checkbox :model-value="2">选项2</wd-checkbox>
    <wd-checkbox :model-value="3">选项3</wd-checkbox>
  </wd-checkbox-group>
</template>

<script lang="ts" setup>
const checked = ref(false)
const checkedList = ref([1])
</script>
```

### 形状

```vue
<!-- 圆形（默认） -->
<wd-checkbox-group v-model="list" shape="circle">...</wd-checkbox-group>

<!-- 方形 -->
<wd-checkbox-group v-model="list" shape="square">...</wd-checkbox-group>

<!-- 按钮形 -->
<wd-checkbox-group v-model="list" shape="button">...</wd-checkbox-group>
```

### 限制选择数量

```vue
<wd-checkbox-group v-model="list" :min="1" :max="3">
  <wd-checkbox :model-value="1">选项1</wd-checkbox>
  <wd-checkbox :model-value="2">选项2</wd-checkbox>
  <wd-checkbox :model-value="3">选项3</wd-checkbox>
  <wd-checkbox :model-value="4">选项4</wd-checkbox>
</wd-checkbox-group>
```

### Checkbox Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `string \| number \| boolean` | - |
| shape | 形状 | `'circle' \| 'square' \| 'button'` | `'circle'` |
| checked-color | 选中颜色 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| true-value | 选中值 | `string \| number \| boolean` | `true` |
| false-value | 非选中值 | `string \| number \| boolean` | `false` |

### CheckboxGroup Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `Array` | `[]` |
| shape | 形状 | `'circle' \| 'square' \| 'button'` | `'circle'` |
| checked-color | 选中颜色 | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| min | 最小选择数量 | `number` | - |
| max | 最大选择数量 | `number` | - |
| inline | 行内排列 | `boolean` | `false` |

## Switch 开关

### 基本用法

```vue
<template>
  <wd-switch v-model="active" />
  <wd-switch v-model="active" active-color="#07c160" inactive-color="#ee0a24" />
  <wd-switch v-model="value" :active-value="1" :inactive-value="0" />
  <wd-switch v-model="active" size="40" />
  <wd-switch v-model="active" disabled />
</template>
```

### 异步变更

```vue
<template>
  <wd-switch v-model="active" :before-change="beforeChange" />
</template>

<script lang="ts" setup>
const beforeChange = ({ value, resolve }) => {
  uni.showModal({
    title: '提示',
    content: `确定要${value ? '打开' : '关闭'}吗？`,
    success: (res) => resolve(res.confirm)
  })
}
</script>
```

### Switch Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `boolean \| string \| number` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| active-value | 激活值 | `boolean \| string \| number` | `true` |
| inactive-value | 非激活值 | `boolean \| string \| number` | `false` |
| active-color | 激活颜色 | `string` | - |
| inactive-color | 非激活颜色 | `string` | - |
| size | 开关大小 | `string \| number` | - |
| before-change | 变更前回调 | `Function` | - |

### Switch Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 状态变化时触发 | `{ value }` |

## Upload 文件上传

### 基本用法

```vue
<template>
  <wd-upload v-model="fileList" :limit="3" />
</template>

<script lang="ts" setup>
const fileList = ref([])
</script>
```

### 上传类型

```vue
<wd-upload v-model="images" accept="image" />   <!-- 图片上传（默认） -->
<wd-upload v-model="videos" accept="video" />   <!-- 视频上传 -->
<wd-upload v-model="medias" accept="media" />   <!-- 图片和视频 -->
<wd-upload v-model="files" accept="file" />     <!-- 文件上传 -->
```

### 配置上传

```vue
<template>
  <wd-upload
    v-model="fileList"
    action="/api/upload"
    :header="{ Authorization: 'Bearer xxx' }"
    :form-data="{ type: 'avatar' }"
    :max-size="5 * 1024 * 1024"
    @success="onSuccess"
    @fail="onFail"
    @oversize="onOversize"
  />
</template>

<script lang="ts" setup>
const onSuccess = ({ file, fileList }) => console.log('上传成功', file)
const onFail = ({ error, file }) => console.log('上传失败', error)
const onOversize = () => uni.showToast({ title: '文件大小超限', icon: 'none' })
</script>
```

### 上传钩子

```vue
<template>
  <wd-upload
    v-model="fileList"
    :before-choose="beforeChoose"
    :before-upload="beforeUpload"
    :before-remove="beforeRemove"
  />
</template>

<script lang="ts" setup>
const beforeChoose = ({ fileList, resolve }) => {
  if (fileList.length >= 5) {
    uni.showToast({ title: '最多上传5个文件', icon: 'none' })
    resolve(false)
  } else {
    resolve(true)
  }
}

const beforeUpload = ({ files, resolve }) => resolve(true)

const beforeRemove = ({ file, resolve }) => {
  uni.showModal({
    title: '提示',
    content: '确定删除该文件吗？',
    success: (res) => resolve(res.confirm)
  })
}
</script>
```

### Upload Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `UploadFile[] \| string` | - |
| action | 上传地址 | `string` | - |
| header | 请求头 | `Record<string, any>` | `{}` |
| form-data | 额外表单数据 | `Record<string, any>` | `{}` |
| name | 文件字段名 | `string` | `'file'` |
| accept | 文件类型 | `'image' \| 'video' \| 'media' \| 'file' \| 'all'` | `'image'` |
| multiple | 是否多选 | `boolean` | `false` |
| limit | 最大上传数量 | `number` | - |
| max-size | 文件大小限制 | `number` | `Number.MAX_VALUE` |
| disabled | 是否禁用 | `boolean` | `false` |
| auto-upload | 自动上传 | `boolean` | `true` |
| source-type | 选择来源 | `('album' \| 'camera')[]` | `['album', 'camera']` |
| label | 标签 | `string` | - |
| prop | 表单字段名 | `string` | - |
| rules | 验证规则 | `FormItemRule[]` | `[]` |
| before-choose | 选择前回调 | `Function` | - |
| before-upload | 上传前回调 | `Function` | - |
| before-remove | 删除前回调 | `Function` | - |

### Upload Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| success | 上传成功时触发 | `{ file, fileList, formData }` |
| fail | 上传失败时触发 | `{ error, file, formData }` |
| progress | 上传进度变化时触发 | `{ response, file }` |
| change | 文件列表变化时触发 | `{ fileList }` |
| remove | 删除文件时触发 | `{ file }` |
| oversize | 文件超出大小限制时触发 | `{ file }` |

### Upload Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| submit | 手动触发上传 | - |
| abort | 取消上传 | `(task?: UploadTask) => void` |
| clear | 清空所有文件 | - |

### Upload Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义上传按钮 |
| preview-cover | 自定义预览样式 |

## 最佳实践

### 1. 表单校验

```vue
<template>
  <wd-form ref="formRef" :model="form" :rules="rules">
    <wd-input v-model="form.username" label="用户名" prop="username" />
    <wd-input v-model="form.password" type="password" label="密码" prop="password" />
    <wd-button type="primary" block @click="onSubmit">注册</wd-button>
  </wd-form>
</template>

<script lang="ts" setup>
const formRef = ref()
const form = reactive({ username: '', password: '' })

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名至少3个字符' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' }
  ]
}

const onSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) { /* 提交表单 */ }
}
</script>
```

### 2. 动态表单

```vue
<template>
  <wd-form ref="formRef" :model="form" :rules="dynamicRules">
    <wd-input
      v-for="(item, index) in form.items"
      :key="index"
      v-model="form.items[index].value"
      :label="`选项${index + 1}`"
      :prop="`items.${index}.value`"
    />
    <wd-button @click="addItem">添加选项</wd-button>
  </wd-form>
</template>

<script lang="ts" setup>
const form = reactive({ items: [{ value: '' }] })

const dynamicRules = computed(() => {
  const rules = {}
  form.items.forEach((_, index) => {
    rules[`items.${index}.value`] = [{ required: true, message: '请输入选项值' }]
  })
  return rules
})

const addItem = () => form.items.push({ value: '' })
</script>
```

### 3. 表单重置

```vue
<script lang="ts" setup>
const formRef = ref()
const initialForm = { name: '' }
const form = reactive({ ...initialForm })

const onReset = () => {
  Object.assign(form, initialForm)
  formRef.value.reset()
}
</script>
```

## 常见问题

### 1. 表单校验不生效

**解决方案：** 确保 prop 与 rules key 一致

```vue
<wd-form :model="form" :rules="rules">
  <wd-input v-model="form.name" prop="name" />  <!-- prop="name" -->
</wd-form>

<script setup>
const rules = {
  name: [{ required: true, message: '请输入' }]  // key 也是 "name"
}
</script>
```

### 2. 选择器显示值不正确

**解决方案：** 确保 value 类型与 columns 中 value-key 字段类型一致

```vue
<wd-picker v-model="value" :columns="columns" value-key="id" label-key="name" />

<script setup>
const value = ref(1)  // number 类型
const columns = [
  { id: 1, name: '选项1' },  // id 也是 number 类型
  { id: 2, name: '选项2' }
]
</script>
```

### 3. 上传失败

**解决方案：** 检查上传地址、认证信息和文件限制

```vue
<wd-upload
  v-model="fileList"
  :action="uploadUrl"
  :header="{ Authorization: `Bearer ${token}` }"
  :max-size="10 * 1024 * 1024"
  @fail="onUploadFail"
/>
```

### 4. Switch 状态不更新

**解决方案：** 使用 before-change 时必须调用 resolve

```vue
<script setup>
const beforeChange = ({ value, resolve }) => {
  setTimeout(() => {
    resolve(true)  // 必须调用 resolve
  }, 1000)
}
</script>
```

## 主题定制

```scss
// Input 相关变量
$-input-bg: #fff;
$-input-color: #333;
$-input-placeholder-color: #c0c4cc;
$-input-error-color: #f56c6c;
$-input-fs: 28rpx;

// Picker 相关变量
$-picker-toolbar-height: 100rpx;
$-picker-toolbar-fs: 32rpx;

// Checkbox 相关变量
$-checkbox-size: 40rpx;
$-checkbox-checked-color: #4D80F0;
$-checkbox-label-fs: 28rpx;

// Switch 相关变量
$-switch-width: 92rpx;
$-switch-height: 52rpx;
$-switch-active-color: #4D80F0;

// Upload 相关变量
$-upload-size: 160rpx;
$-upload-evoke-bg: #f7f8fa;
```
