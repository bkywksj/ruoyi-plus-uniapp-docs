# 表单组件总览

## 介绍

RuoYi-Plus 前端项目提供了一套完整的表单组件体系，基于 Element Plus 进行二次封装，旨在简化表单开发、提供统一的交互体验。

**核心特性:**

- **统一封装** - 所有表单组件基于 Element Plus 二次封装，提供一致的 API 设计
- **响应式布局** - 支持基于屏幕尺寸、容器尺寸和模态框尺寸的智能响应式布局
- **开箱即用** - 内置表单项容器 `el-form-item`，支持标签、校验、提示等功能
- **国际化支持** - 集成 i18n，自动处理占位符和标签的多语言显示
- **防自动填充** - 密码输入框支持防浏览器自动填充功能
- **智能提示** - 支持 Tooltip 提示信息

**组件分类:**

表单组件体系包含 13 个核心组件:

1. **基础输入** - AFormInput (文本、数字、密码、文本域)
2. **选择器** - AFormSelect、AFormCascader、AFormTreeSelect
3. **日期时间** - AFormDate
4. **开关选择** - AFormRadio、AFormCheckbox、AFormSwitch
5. **文件上传** - AFormFileUpload、AFormImgUpload
6. **富文本编辑** - AFormEditor
7. **地图选点** - AFormMap
8. **AI 增强** - AFormInputWithAi

---

## 组件架构设计

### 统一 Props 设计

所有表单组件都遵循统一的 Props 命名规范:

```typescript
interface BaseFormComponentProps {
  modelValue: any                      // v-model 绑定值
  label?: string                       // 标签文本
  prop?: string                        // 表单域字段名
  labelWidth?: number | string         // 标签宽度
  span?: SpanType                      // 栅格列数(响应式)
  showFormItem?: boolean               // 是否显示 el-form-item 容器
  placeholder?: string                 // 占位符
  disabled?: boolean                   // 是否禁用
  clearable?: boolean                  // 是否可清除
  size?: ComponentSize                 // 组件尺寸
  tooltip?: string                     // 提示信息
  responsiveMode?: ResponsiveMode      // 响应式模式
}
```

**响应式布局属性:**

```typescript
// 三种 span 配置方式
span={12}  // 1. 固定值
span={{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }}  // 2. 响应式对象
span="auto"  // 3. 预设值

// 三种响应式模式
responsiveMode="screen"      // 基于屏幕尺寸(默认)
responsiveMode="container"   // 基于容器尺寸
responsiveMode="modal-size"  // 基于模态框尺寸
```

### 统一事件设计

```typescript
interface BaseFormComponentEmits {
  'update:modelValue': (value: any) => void
  'input': (value: any) => void
  'blur': (event: FocusEvent) => void
  'change': (value: any) => void
}
```

### 插槽设计

```vue
<AFormInput v-model="form.userName" label="用户名">
  <template #prepend><el-icon><User /></el-icon></template>
  <template #append><el-button>搜索</el-button></template>
  <template #prefix><el-icon><Search /></el-icon></template>
  <template #suffix><el-icon><Close /></el-icon></template>
</AFormInput>
```

---

## 核心组件详解

### 1. AFormInput - 输入框组件

`AFormInput` 支持文本、数字、密码、文本域等多种输入类型。

**文本输入:**

```vue
<template>
  <el-form :model="form" label-width="100px">
    <AFormInput v-model="form.userName" label="用户名" prop="userName" />
    <AFormInput v-model="form.nickName" label="昵称" prop="nickName" :clearable="true" />
    <AFormInput v-model="form.email" label="邮箱" prop="email" placeholder="请输入邮箱地址" />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({ userName: '', nickName: '', email: '' })
</script>
```

**密码输入:**

```vue
<AFormInput v-model="form.password" label="密码" type="password" show-password />
<AFormInput v-model="form.newPassword" label="新密码" type="password" show-password prevent-autofill />
```

**文本域输入:**

```vue
<AFormInput v-model="form.description" label="描述" type="textarea" :rows="3" />
<AFormInput v-model="form.content" label="内容" type="textarea" :autosize="{ minRows: 2, maxRows: 10 }" />
<AFormInput v-model="form.remark" label="备注" type="textarea" :maxlength="200" show-word-limit />
```

**数字输入:**

```vue
<AFormInput v-model="form.age" label="年龄" type="number" :min="0" :max="150" />
<AFormInput v-model="form.price" label="价格" type="number" :min="0" :step="0.01" :precision="2" />
<AFormInput v-model="form.count" label="计数" type="number" controls-position="right" />
```

**响应式布局:**

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <AFormInput v-model="form.userName" label="用户名" :span="12" />
      <AFormInput v-model="form.email" label="邮箱" :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }" />
      <AFormInput v-model="form.phone" label="电话" span="auto" />
    </el-row>
  </el-form>
</template>
```

**响应式断点:**

| 断点 | 尺寸 | 设备 |
|------|------|------|
| xs | <768px | 手机 |
| sm | ≥768px | 平板竖屏 |
| md | ≥992px | 平板横屏 |
| lg | ≥1200px | 普通电脑 |
| xl | ≥1920px | 大屏电脑 |

**API - Props:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number` | - |
| label | 标签文本 | `string` | - |
| prop | 表单域字段名 | `string` | - |
| type | 输入框类型 | `'text' \| 'textarea' \| 'number' \| 'password'` | `'text'` |
| placeholder | 占位符 | `string` | 自动生成 |
| span | 栅格列数 | `number \| ResponsiveSpan \| 'auto'` | - |
| showFormItem | 是否显示表单项容器 | `boolean` | `true` |
| clearable | 是否可清除 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| maxlength | 最大长度 | `number` | `255` |
| showPassword | 是否显示密码切换按钮 | `boolean` | `false` |
| preventAutofill | 防自动填充 | `boolean` | `false` |
| tooltip | 提示信息 | `string` | - |
| rows | 文本域行数 | `number` | `3` |
| autosize | 文本域自适应高度 | `object` | `{ minRows: 2, maxRows: 30 }` |
| min | 数字最小值 | `number` | - |
| max | 数字最大值 | `number` | - |
| step | 数字步长 | `number` | `1` |
| precision | 数字精度 | `number` | - |

**API - Events:**

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值更新时触发 | `(value: string \| number) => void` |
| input | 输入时触发 | `(value: string \| number) => void` |
| blur | 失焦时触发 | `(event: FocusEvent) => void` |
| change | 值改变时触发 | `(value: string \| number) => void` |
| enter | 按下回车时触发 | `(value: string \| number) => void` |

---

### 2. AFormSelect - 下拉选择组件

`AFormSelect` 支持单选、多选、搜索、远程搜索、字典数据等功能。

**基础用法:**

```vue
<template>
  <el-form :model="form">
    <!-- 单选 -->
    <AFormSelect v-model="form.status" label="状态" :options="statusOptions" />

    <!-- 多选 -->
    <AFormSelect v-model="form.roles" label="角色" multiple :options="roleOptions" />

    <!-- 可搜索 -->
    <AFormSelect v-model="form.city" label="城市" filterable :options="cityOptions" />

    <!-- 字典数据 -->
    <AFormSelect v-model="form.gender" label="性别" dict-type="sys_user_sex" />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({ status: '', roles: [], city: '', gender: '' })

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]
</script>
```

**远程搜索:**

```vue
<AFormSelect
  v-model="form.userId"
  label="用户"
  filterable
  remote
  :remote-method="remoteSearchUser"
  :loading="loading"
  :options="userOptions"
/>

<script setup lang="ts">
const remoteSearchUser = async (query: string) => {
  if (query) {
    loading.value = true
    const res = await getUserList({ userName: query })
    userOptions.value = res.rows.map(user => ({ label: user.userName, value: user.userId }))
    loading.value = false
  }
}
</script>
```

**API - Props:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number \| array` | - |
| options | 选项数据 | `Array<{ label: string, value: any }>` | `[]` |
| multiple | 是否多选 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `true` |
| filterable | 是否可搜索 | `boolean` | `false` |
| remote | 是否远程搜索 | `boolean` | `false` |
| remoteMethod | 远程搜索方法 | `(query: string) => void` | - |
| dictType | 字典类型 | `string` | - |

---

### 3. AFormDate - 日期选择组件

`AFormDate` 支持日期、日期范围、日期时间、日期时间范围等选择模式。

**基础用法:**

```vue
<template>
  <el-form :model="form">
    <AFormDate v-model="form.birthday" label="生日" type="date" />
    <AFormDate v-model="form.createTime" label="创建时间" type="datetime" />
    <AFormDate v-model="form.year" label="年份" type="year" />
    <AFormDate v-model="form.month" label="月份" type="month" />
  </el-form>
</template>
```

**日期范围选择:**

```vue
<AFormDate
  v-model="form.dateRange"
  label="日期范围"
  type="daterange"
  start-placeholder="开始日期"
  end-placeholder="结束日期"
/>

<AFormDate
  v-model="form.datetimeRange"
  label="时间范围"
  type="datetimerange"
/>
```

**日期格式化:**

```vue
<AFormDate v-model="form.date" label="日期" format="YYYY年MM月DD日" value-format="YYYY-MM-DD" />
```

**日期限制:**

```vue
<AFormDate v-model="form.futureDate" label="未来日期" :disabled-date="disablePastDate" />

<script setup lang="ts">
const disablePastDate = (time: Date) => time.getTime() < Date.now() - 24 * 60 * 60 * 1000
</script>
```

**快捷选项:**

```vue
<AFormDate v-model="form.dateRange" label="日期范围" type="daterange" :shortcuts="shortcuts" />

<script setup lang="ts">
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 7 * 24 * 60 * 60 * 1000)
      return [start, end]
    }
  }
]
</script>
```

---

### 4. AFormRadio - 单选框组件

```vue
<template>
  <el-form :model="form">
    <!-- 基础单选 -->
    <AFormRadio v-model="form.gender" label="性别" :options="genderOptions" />

    <!-- 按钮样式 -->
    <AFormRadio v-model="form.type" label="类型" button :options="typeOptions" />

    <!-- 字典数据 -->
    <AFormRadio v-model="form.status" label="状态" dict-type="sys_normal_disable" />
  </el-form>
</template>

<script setup lang="ts">
const genderOptions = [{ label: '男', value: '1' }, { label: '女', value: '2' }]
</script>
```

---

### 5. AFormCheckbox - 复选框组件

```vue
<template>
  <el-form :model="form">
    <!-- 基础复选 -->
    <AFormCheckbox v-model="form.hobbies" label="爱好" :options="hobbyOptions" />

    <!-- 按钮样式 -->
    <AFormCheckbox v-model="form.permissions" label="权限" button :options="permissionOptions" />

    <!-- 限制选择数量 -->
    <AFormCheckbox v-model="form.skills" label="技能" :min="1" :max="3" :options="skillOptions" />
  </el-form>
</template>
```

---

### 6. AFormSwitch - 开关组件

```vue
<template>
  <el-form :model="form">
    <AFormSwitch v-model="form.enabled" label="启用状态" />
    <AFormSwitch v-model="form.visible" label="是否显示" active-text="显示" inactive-text="隐藏" />
    <AFormSwitch v-model="form.status" label="状态" active-value="1" inactive-value="0" />
  </el-form>
</template>
```

---

### 7. AFormCascader - 级联选择组件

```vue
<template>
  <el-form :model="form">
    <AFormCascader v-model="form.region" label="地区" :options="regionOptions" />
    <AFormCascader v-model="form.dept" label="部门" filterable :options="deptOptions" />
    <AFormCascader v-model="form.category" label="分类" :show-all-levels="false" :options="categoryOptions" />
  </el-form>
</template>

<script setup lang="ts">
const regionOptions = [
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      {
        label: '杭州市',
        value: 'hangzhou',
        children: [{ label: '西湖区', value: 'xihu' }]
      }
    ]
  }
]
</script>
```

---

### 8. AFormTreeSelect - 树形选择组件

```vue
<template>
  <el-form :model="form">
    <AFormTreeSelect
      v-model="form.deptId"
      label="部门"
      :data="deptTree"
      node-key="id"
      :props="{ label: 'name', children: 'children' }"
    />
    <AFormTreeSelect v-model="form.menuId" label="菜单" filterable :data="menuTree" />
    <AFormTreeSelect v-model="form.roleIds" label="角色" multiple :data="roleTree" />
  </el-form>
</template>
```

---

### 9. AFormFileUpload - 文件上传组件

```vue
<template>
  <el-form :model="form">
    <AFormFileUpload v-model="form.file" label="附件" />
    <AFormFileUpload v-model="form.files" label="多个附件" multiple :limit="5" />
    <AFormFileUpload v-model="form.document" label="文档" accept=".pdf,.doc,.docx" />
    <AFormFileUpload v-model="form.attachment" label="附件" :file-size="10" />
  </el-form>
</template>
```

---

### 10. AFormImgUpload - 图片上传组件

```vue
<template>
  <el-form :model="form">
    <AFormImgUpload v-model="form.avatar" label="头像" />
    <AFormImgUpload v-model="form.images" label="相册" multiple :limit="9" />
    <AFormImgUpload v-model="form.banner" label="横幅图" :width="1920" :height="500" />
  </el-form>
</template>
```

---

### 11. AFormEditor - 富文本编辑器组件

```vue
<template>
  <el-form :model="form">
    <AFormEditor v-model="form.content" label="内容" :height="400" />
  </el-form>
</template>
```

---

### 12. AFormMap - 地图选点组件

```vue
<template>
  <el-form :model="form">
    <AFormMap v-model="form.location" label="地址" />
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({ location: { lng: 120.153576, lat: 30.287459 } })
</script>
```

---

### 13. AFormInputWithAi - AI 增强输入组件

```vue
<template>
  <el-form :model="form">
    <AFormInputWithAi
      v-model="form.description"
      label="描述"
      type="textarea"
      ai-prompt="请根据关键词生成产品描述"
    />
  </el-form>
</template>
```

---

## 最佳实践

### 1. 表单布局设计

**栅格布局:**

```vue
<template>
  <el-form :model="form" label-width="100px">
    <el-row :gutter="20">
      <AFormInput v-model="form.userName" label="用户名" :span="12" />
      <AFormInput v-model="form.nickName" label="昵称" :span="12" />
      <AFormInput v-model="form.phone" label="电话" :span="8" />
      <AFormInput v-model="form.email" label="邮箱" :span="8" />
      <AFormSelect v-model="form.gender" label="性别" :span="8" :options="genderOptions" />
      <AFormInput v-model="form.address" label="地址" :span="24" />
    </el-row>
  </el-form>
</template>
```

**响应式布局:**

```vue
<template>
  <el-form :model="form">
    <el-row :gutter="20">
      <!-- 手机:1列, 平板:2列, 桌面:3列 -->
      <AFormInput v-model="form.field1" :span="{ xs: 24, sm: 12, md: 8 }" />
      <AFormInput v-model="form.field2" :span="{ xs: 24, sm: 12, md: 8 }" />
      <AFormInput v-model="form.field3" :span="{ xs: 24, sm: 24, md: 8 }" />
    </el-row>
  </el-form>
</template>
```

### 2. 表单校验

**基础校验:**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormInput v-model="form.userName" label="用户名" prop="userName" />
    <AFormInput v-model="form.email" label="邮箱" prop="email" />
    <AFormInput v-model="form.phone" label="电话" prop="phone" />
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const form = reactive({ userName: '', email: '', phone: '' })

const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  // 提交逻辑
}
</script>
```

**自定义校验:**

```vue
<script setup lang="ts">
const validatePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于 6 位'))
  } else if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    callback()
  }
}

const rules = {
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }]
}
</script>
```

### 3. 表单联动

**选项联动:**

```vue
<template>
  <el-form :model="form">
    <AFormSelect v-model="form.provinceId" label="省份" :options="provinceOptions" @change="handleProvinceChange" />
    <AFormSelect v-model="form.cityId" label="城市" :options="cityOptions" :disabled="!form.provinceId" />
  </el-form>
</template>

<script setup lang="ts">
const handleProvinceChange = async (provinceId: string) => {
  form.cityId = ''
  cityOptions.value = await getCityList(provinceId)
}
</script>
```

**显示/隐藏联动:**

```vue
<template>
  <el-form :model="form">
    <AFormRadio v-model="form.type" label="类型" :options="typeOptions" />
    <AFormInput v-if="form.type === '1'" v-model="form.option1" label="选项1" />
    <AFormInput v-if="form.type === '2'" v-model="form.option2" label="选项2" />
  </el-form>
</template>
```

### 4. 表单重置和回显

```vue
<template>
  <el-form :model="form" ref="formRef">
    <AFormInput v-model="form.userName" label="用户名" prop="userName" />
    <el-button @click="handleReset">重置</el-button>
  </el-form>
</template>

<script setup lang="ts">
const formRef = ref<FormInstance>()
const form = reactive({ userName: '', email: '' })

// 重置表单
const handleReset = () => formRef.value?.resetFields()

// 编辑时回显数据
const handleEdit = async (userId: string) => {
  const data = await getUserInfo(userId)
  Object.assign(form, data)
}
</script>
```

---

## 常见问题

### 1. 表单项不显示

**问题:** 使用表单组件后，页面上不显示任何内容。

**原因:** 没有设置 `span` 属性且没有包裹在 `el-row` 中。

**解决:**

```vue
<!-- ❌ 错误 -->
<el-form :model="form">
  <AFormInput v-model="form.userName" label="用户名" />
</el-form>

<!-- ✅ 正确 -->
<el-form :model="form">
  <el-row :gutter="20">
    <AFormInput v-model="form.userName" label="用户名" :span="24" />
  </el-row>
</el-form>
```

### 2. 响应式布局不生效

**问题:** 设置了响应式 `span`，但在不同屏幕尺寸下没有变化。

**原因:** 在弹窗中使用了 `screen` 模式。

**解决:**

```vue
<!-- ❌ 错误 -->
<el-dialog v-model="visible">
  <AFormInput v-model="form.userName" :span="{ md: 12 }" responsive-mode="screen" />
</el-dialog>

<!-- ✅ 正确 -->
<el-dialog v-model="visible" width="800px">
  <AFormInput v-model="form.userName" :span="{ md: 12 }" responsive-mode="container" />
</el-dialog>
```

### 3. v-model 双向绑定失效

**问题:** 修改表单值后，界面不更新。

**原因:** 使用了普通对象而不是响应式对象。

**解决:**

```vue
<script setup lang="ts">
// ❌ 错误
let form = { userName: '' }

// ✅ 正确
const form = reactive({ userName: '' })
</script>
```

### 4. 表单校验不触发

**问题:** 设置了校验规则，但提交时不进行校验。

**原因:** `prop` 属性未设置或与 `rules` 中的键名不匹配。

**解决:**

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <!-- ❌ 错误：没有 prop -->
    <AFormInput v-model="form.userName" label="用户名" />

    <!-- ✅ 正确：添加 prop -->
    <AFormInput v-model="form.userName" label="用户名" prop="userName" />
  </el-form>
</template>

<script setup lang="ts">
const rules: FormRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  // 提交数据
}
</script>
```

### 5. 密码被浏览器自动填充

**问题:** 密码输入框被浏览器自动填充。

**解决:**

```vue
<AFormInput
  v-model="form.password"
  label="密码"
  type="password"
  show-password
  prevent-autofill
/>
```

### 6. 下拉选择选项不显示

**问题:** AFormSelect 组件下拉列表为空。

**原因:** `options` 数据格式错误。

**解决:**

```vue
<!-- ❌ 错误 -->
<AFormSelect v-model="form.status" :options="['选项1', '选项2']" />

<!-- ✅ 正确 -->
<AFormSelect v-model="form.status" :options="[{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]" />

<!-- ✅ 或使用字典 -->
<AFormSelect v-model="form.status" dict-type="sys_normal_disable" />
```

---

## 总结

### 核心优势

1. **统一封装** - 基于 Element Plus 二次封装，API 设计一致
2. **响应式布局** - 支持多种响应式模式，适应不同场景
3. **开箱即用** - 内置表单项容器，自动处理标签、校验、提示
4. **功能丰富** - 支持字典数据、国际化、AI 增强等功能
5. **灵活扩展** - 支持插槽、自定义模板、事件监听等扩展方式

### 使用建议

1. **合理使用响应式** - 根据场景选择合适的响应式模式
2. **统一表单校验** - 使用 FormRules 统一管理校验规则
3. **规范属性配置** - 保持 prop、label 等属性命名一致性
4. **注重用户体验** - 合理使用提示信息、防自动填充等功能
