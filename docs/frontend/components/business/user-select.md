# UserSelect 用户选择组件

用户选择组件，基于 `useSelection` 组合函数实现的用户选择器，提供弹窗式的用户选择功能。支持部门树过滤、搜索筛选、分页查询和单选/多选模式。

## 基础用法

### 多选模式（默认）

```vue
<template>
  <UserSelect v-model="selectedUsers" @confirm-call-back="handleUserSelect" />
</template>

<script setup>
import { ref } from 'vue'

const selectedUsers = ref([])

const handleUserSelect = (users) => {
  console.log('选中的用户：', users)
}
</script>
```

### 单选模式

```vue
<template>
  <UserSelect 
    v-model="selectedUser" 
    :multiple="false" 
    @confirm-call-back="handleUserSelect" 
  />
</template>

<script setup>
const selectedUser = ref(null)

const handleUserSelect = (user) => {
  console.log('选中的用户：', user)
}
</script>
```

## 自定义按钮样式

自定义选择按钮的外观：

```vue
<template>
  <UserSelect 
    v-model="selectedUsers" 
    button-text="选择项目成员" 
    button-type="success" 
    :button-plain="false"
    button-size="large"
  />
</template>
```

## 编辑模式

传入初始用户名数据，用于编辑场景：

```vue
<template>
  <UserSelect 
    v-model="userIds" 
    :initial-user-names="userNamesString" 
    :multiple="true" 
  />
</template>

<script setup>
const userIds = ref(['1', '2', '3'])
const userNamesString = ref('张三,李四,王五')
</script>
```

## 限制用户范围

限制可选择的用户范围：

```vue
<template>
  <UserSelect 
    v-model="selectedUsers" 
    :user-ids="allowedUserIds" 
    :multiple="true" 
  />
</template>

<script setup>
const allowedUserIds = ref(['1', '2', '3', '4', '5'])
const selectedUsers = ref([])
</script>
```

## 使用预设数据

使用 data 属性预设激活的用户：

```vue
<template>
  <UserSelect 
    v-model="selectedUsers" 
    :data="presetUsers" 
    :multiple="true" 
  />
</template>

<script setup>
const selectedUsers = ref([])
const presetUsers = ref([
  { userId: '1', userName: '张三', nickName: '小张' },
  { userId: '2', userName: '李四', nickName: '小李' }
])
</script>
```

## 控制返回类型

控制默认返回用户ID还是用户对象：

```vue
<template>
  <!-- 返回用户ID -->
  <UserSelect 
    v-model="userIds" 
    :multiple="true" 
    default-return-type="id" 
  />

  <!-- 返回用户对象 -->
  <UserSelect 
    v-model="userObjects" 
    :multiple="true" 
    default-return-type="object" 
  />
</template>

<script setup>
const userIds = ref([])        // ['1', '2', '3']
const userObjects = ref([])    // [{ userId: '1', userName: '张三' }, ...]
</script>
```

## 隐藏内置标签

仅使用弹窗选择，不显示内置标签：

```vue
<template>
  <div>
    <el-button @click="openUserSelect">选择用户</el-button>
    <UserSelect 
      ref="userSelectRef"
      v-model="selectedUsers" 
      :show-inline-tags="false" 
    />
  </div>
</template>

<script setup>
const userSelectRef = ref()
const selectedUsers = ref([])

const openUserSelect = () => {
  userSelectRef.value.open()
}
</script>
```

## 只读模式

禁用标签删除功能：

```vue
<template>
  <UserSelect 
    v-model="selectedUsers" 
    :readonly="true" 
    :multiple="true" 
  />
</template>
```

## 在表单中使用

在表单验证中使用用户选择组件：

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="负责人" prop="managerId">
      <UserSelect 
        v-model="form.managerId" 
        :multiple="false"
        button-text="选择负责人"
      />
    </el-form-item>
    
    <el-form-item label="项目成员" prop="memberIds">
      <UserSelect 
        v-model="form.memberIds" 
        :multiple="true"
        button-text="选择项目成员"
      />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
const formRef = ref()
const form = ref({
  managerId: '',
  memberIds: []
})

const rules = {
  managerId: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ],
  memberIds: [
    { type: 'array', min: 1, message: '请至少选择一个项目成员', trigger: 'change' }
  ]
}

const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    console.log('表单数据：', form.value)
    // 提交表单
  }
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model-value | 选中项的双向绑定值 | `string \| number \| (string \| number)[] \| SysUserVo \| SysUserVo[]` | — | `undefined` |
| multiple | 是否为多选模式 | `boolean` | — | `false` |
| data | 预设激活的用户数据 | `string \| number \| (string \| number)[] \| SysUserVo \| SysUserVo[]` | — | `undefined` |
| user-ids | 限制可选的用户ID范围 | `string \| number \| (string \| number)[]` | — | `undefined` |
| default-return-type | 当 modelValue 为空时的默认返回类型 | `'object' \| 'id'` | `object` / `id` | `'object'` |
| show-inline-tags | 是否显示内置标签选择器 | `boolean` | — | `true` |
| button-text | 选择按钮的文本 | `string` | — | `'选择用户'` |
| button-type | 选择按钮的类型 | `string` | `primary` / `success` / `warning` / `danger` / `info` / `text` / `''` | `'primary'` |
| button-plain | 选择按钮是否为朴素按钮 | `boolean` | — | `true` |
| button-size | 选择按钮的尺寸 | `string` | `large` / `default` / `small` | `'small'` |
| tag-size | 标签的尺寸 | `string` | `large` / `default` / `small` | `'small'` |
| show-count | 是否显示选中数量 | `boolean` | — | `true` |
| disabled | 是否禁用（禁用删除标签功能） | `boolean` | — | `false` |
| readonly | 是否只读（只读删除标签功能） | `boolean` | — | `false` |
| initial-user-names | 初始用户名数据 | `string \| string[]` | — | `undefined` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 选中值变化 | `(value: any)` |
| confirm-call-back | 确认选择回调 | `(users: SysUserVo \| SysUserVo[])` |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| open | 打开用户选择对话框 | — |
| close | 关闭用户选择对话框 | — |

### 用户对象接口

```typescript
interface SysUserVo {
  /** 用户ID */
  userId: string | number
  /** 用户名 */
  userName: string
  /** 用户昵称 */
  nickName: string
  /** 部门名称 */
  deptName: string
  /** 手机号码 */
  phone: string
  /** 用户状态 */
  status: string
  /** 创建时间 */
  createTime: string
}
```

## 功能特性

### 用户筛选
- **部门树过滤**：通过左侧部门树快速定位部门用户
- **关键词搜索**：支持按用户名、手机号等条件搜索
- **状态筛选**：可根据用户状态进行筛选
- **实时过滤**：搜索条件实时生效

### 选择模式
- **单选模式**：使用单选按钮，只能选择一个用户
- **多选模式**：使用复选框，可选择多个用户
- **跨页选择**：多选模式下支持跨分页保持选中状态
- **智能返回**：根据绑定值类型智能返回ID或对象

### 用户体验
- **标签显示**：内置用户标签显示，支持删除操作
- **数量统计**：显示已选用户数量
- **响应式布局**：适配不同屏幕尺寸
- **键盘导航**：支持键盘操作

### 数据处理
- **类型智能**：自动识别绑定值类型，智能返回对应格式
- **预设支持**：支持通过 data 属性预设选中用户
- **范围限制**：可限制可选用户的范围
- **编辑模式**：支持传入用户名进行编辑时显示
