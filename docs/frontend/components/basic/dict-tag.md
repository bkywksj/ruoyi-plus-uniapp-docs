# DictTag 字典标签组件

DictTag 是一个功能强大的字典标签组件，支持多种数据模式的标签显示，包括普通字典、地区代码和级联数据的转换显示。

## 基础用法

### 普通字典标签

最基础的字典标签用法，通过字典选项将值转换为可读的标签。

```vue
<template>
  <!-- 单个值 -->
  <DictTag :options="statusOptions" :value="1" />
  
  <!-- 多个值（数组形式） -->
  <DictTag :options="statusOptions" :value="[1, 3]" />
  
  <!-- 多个值（字符串形式） -->
  <DictTag :options="statusOptions" :value="'1,3'" />
</template>

<script setup>
const statusOptions = [
  { value: 1, label: '启用', elTagType: 'success' },
  { value: 2, label: '禁用', elTagType: 'danger' },
  { value: 3, label: '待审核', elTagType: 'warning' }
]
</script>
```

## 组件属性

### 通用属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'dict' \| 'region' \| 'cascader'` | `'dict'` | 组件模式 |
| `value` | `number \| string \| Array<number \| string> \| null \| undefined` | - | 要显示的值 |
| `showValue` | `boolean` | `true` | 是否显示未匹配的值 |
| `separator` | `string` | `','` | 值为字符串时的分割符 |
| `pathSeparator` | `string` | `' / '` | 路径连接符 |
| `tagType` | `ElTagType` | `'info'` | 统一标签类型 |
| `tagClass` | `string` | `''` | 统一标签样式类 |
| `size` | `ElSize` | - | 标签大小 |

### 字段映射属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `valueField` | `string` | `'value'` | 值字段名称 |
| `labelField` | `string` | `'label'` | 标签字段名称 |
| `childrenField` | `string` | `'children'` | 子节点字段名称（级联模式） |

### 模式特定属性

| 属性 | 类型 | 适用模式 | 说明 |
|------|------|----------|------|
| `options` | `Array<DictItem \| any>` | `dict`, `cascader` | 字典选项数组 |

## 使用模式

### 1. 字典模式（dict）

默认模式，用于普通的字典值转换。

```vue
<template>
  <!-- 基础用法 -->
  <DictTag :options="statusOptions" :value="1" />
  
  <!-- 自定义字段名 -->
  <DictTag 
    :options="customOptions" 
    :value="'active'" 
    value-field="status" 
    label-field="name" 
  />
  
  <!-- 多个值显示 -->
  <DictTag :options="typeOptions" :value="'1,2,3'" />
</template>

<script setup>
// 标准字典选项
const statusOptions = [
  { value: 1, label: '启用', elTagType: 'success' },
  { value: 2, label: '禁用', elTagType: 'danger' }
]

// 自定义字段名的选项
const customOptions = [
  { status: 'active', name: '激活', elTagType: 'success' },
  { status: 'inactive', name: '未激活', elTagType: 'info' }
]

const typeOptions = [
  { value: 1, label: '类型A', elTagType: 'primary' },
  { value: 2, label: '类型B', elTagType: 'warning' },
  { value: 3, label: '类型C', elTagType: 'info' }
]
</script>
```

### 2. 地区模式（region）

用于显示中国行政区域的完整路径。

```vue
<template>
  <!-- 单个地区 -->
  <DictTag mode="region" :value="'110101'" />
  <!-- 显示：北京市 / 市辖区 / 东城区 -->
  
  <!-- 多个地区 -->
  <DictTag mode="region" :value="['110101', '310101']" />
  
  <!-- 自定义路径分隔符 -->
  <DictTag 
    mode="region" 
    :value="'110101'" 
    path-separator=" → " 
  />
  <!-- 显示：北京市 → 市辖区 → 东城区 -->
</template>
```

### 3. 级联模式（cascader）

用于显示树形数据的完整路径。

```vue
<template>
  <!-- 部门树级联显示 -->
  <DictTag 
    mode="cascader" 
    :options="deptTree" 
    :value="'1-1-1'" 
    value-field="id" 
    label-field="name" 
    children-field="children" 
  />
  
  <!-- 多个级联路径 -->
  <DictTag 
    mode="cascader" 
    :options="categoryTree" 
    :value="['cat-1-1', 'cat-2-1']" 
  />
</template>

<script setup>
const deptTree = [
  {
    id: '1',
    name: '总公司',
    children: [
      {
        id: '1-1',
        name: '技术部',
        children: [
          { id: '1-1-1', name: '前端组' },
          { id: '1-1-2', name: '后端组' }
        ]
      }
    ]
  }
]

const categoryTree = [
  {
    value: 'cat-1',
    label: '电子产品',
    children: [
      { value: 'cat-1-1', label: '手机' },
      { value: 'cat-1-2', label: '电脑' }
    ]
  },
  {
    value: 'cat-2',
    label: '服装',
    children: [
      { value: 'cat-2-1', label: '男装' },
      { value: 'cat-2-2', label: '女装' }
    ]
  }
]
</script>
```

## 样式自定义

### 统一样式

```vue
<template>
  <!-- 统一标签类型 -->
  <DictTag 
    :options="statusOptions" 
    :value="[1, 2]" 
    tag-type="success" 
  />
  
  <!-- 统一样式类 -->
  <DictTag 
    :options="statusOptions" 
    :value="[1, 2]" 
    tag-class="custom-tag" 
  />
  
  <!-- 统一大小 -->
  <DictTag 
    :options="statusOptions" 
    :value="[1, 2]" 
    size="large" 
  />
</template>
```

### 选项级样式

选项中的 `elTagType` 和 `elTagClass` 会覆盖统一设置的样式。

```vue
<script setup>
const statusOptions = [
  { 
    value: 1, 
    label: '成功', 
    elTagType: 'success',
    elTagClass: 'success-tag'
  },
  { 
    value: 2, 
    label: '失败', 
    elTagType: 'danger',
    elTagClass: 'error-tag'
  },
  { 
    value: 3, 
    label: '处理中', 
    elTagType: 'warning'
  }
]
</script>
```

## 高级功能

### 处理未匹配值

当 `showValue` 为 `true` 时，未找到对应选项的值会以原始值显示。

```vue
<template>
  <!-- 显示未匹配的值 -->
  <DictTag 
    :options="statusOptions" 
    :value="'1,999'" 
    :show-value="true" 
  />
  <!-- 会显示 "启用" 标签 + "999" 文本 -->
  
  <!-- 隐藏未匹配的值 -->
  <DictTag 
    :options="statusOptions" 
    :value="'1,999'" 
    :show-value="false" 
  />
  <!-- 只显示 "启用" 标签 -->
</template>
```

### 自定义分隔符

```vue
<template>
  <!-- 使用管道符分隔 -->
  <DictTag 
    :options="statusOptions" 
    :value="'1|2|3'" 
    separator="|" 
  />
  
  <!-- 使用分号分隔 -->
  <DictTag 
    :options="statusOptions" 
    :value="'1;2;3'" 
    separator=";" 
  />
</template>
```

### 动态数据加载

地区模式会自动加载中国行政区域数据（已经包含 `element-china-area-data` 包）。


## 实际应用场景

### 用户状态标签

```vue
<template>
  <DictTag 
    :options="userStatusOptions" 
    :value="user.status" 
    size="small"
  />
</template>

<script setup>
const userStatusOptions = [
  { value: 1, label: '正常', elTagType: 'success' },
  { value: 2, label: '禁用', elTagType: 'danger' },
  { value: 3, label: '待验证', elTagType: 'warning' }
]
</script>
```

### 订单状态

```vue
<template>
  <DictTag 
    :options="orderStatusOptions" 
    :value="order.statusList" 
    tag-type="info"
  />
</template>

<script setup>
const orderStatusOptions = [
  { value: 'pending', label: '待支付', elTagType: 'warning' },
  { value: 'paid', label: '已支付', elTagType: 'primary' },
  { value: 'shipped', label: '已发货', elTagType: 'info' },
  { value: 'completed', label: '已完成', elTagType: 'success' },
  { value: 'cancelled', label: '已取消', elTagType: 'danger' }
]
</script>
```

### 地区选择显示

```vue
<template>
  <DictTag 
    mode="region" 
    :value="user.regionCode" 
    path-separator=" · "
  />
</template>
```

### 部门路径显示

```vue
<template>
  <DictTag 
    mode="cascader" 
    :options="departmentTree" 
    :value="employee.deptId" 
    value-field="id" 
    label-field="name"
  />
</template>
```

## 注意事项

1. **数据格式**：确保传入的 `value` 与选项中的值类型一致
2. **地区数据**：使用地区模式需要安装 `element-china-area-data` 依赖
3. **性能优化**：对于大量数据的级联模式，建议使用懒加载
4. **样式优先级**：选项中的 `elTagType` 和 `elTagClass` 优先级高于组件属性
5. **字段映射**：使用自定义字段名时，确保数据结构正确

## 依赖说明

- **Element Plus**：组件基于 El-Tag 构建
- **element-china-area-data**：地区模式的数据依赖（可选）

## 浏览器兼容性

支持所有现代浏览器，与 Vue 3 和 Element Plus 的兼容性要求一致。
