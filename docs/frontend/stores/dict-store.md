# 字典状态管理 (dict)

## 功能概述

字典状态管理模块提供统一的字典数据存储、访问和转换功能，用于管理下拉选项、状态映射等键值对数据。

## 核心职责

- **字典存储**：集中管理所有字典数据
- **数据访问**：快速获取指定类型的字典
- **标签转换**：值与显示文本的相互转换
- **动态管理**：支持运行时添加和删除字典

## 状态定义

```typescript
// 字典集合
dict: Map<string, DictItem[]>

// 字典项结构
interface DictItem {
  label: string      // 显示文本
  value: string      // 实际值
  type?: string      // 字典类型
  cssClass?: string  // 样式类
  listClass?: string // 列表样式
  disabled?: boolean // 是否禁用
  [key: string]: any // 扩展属性
}
```

## 核心方法

### getDict - 获取字典
```typescript
getDict(key: string): DictItem[] | null
```
获取指定类型的完整字典数据。

### setDict - 设置字典
```typescript
setDict(key: string, value: DictItem[]): boolean
```
添加或更新字典数据：
- 支持动态添加新字典
- 覆盖已存在的字典
- 返回操作结果

### getDictLabel - 获取标签
```typescript
getDictLabel(
  keyOrData: string | Ref<DictItem[]> | DictItem[], 
  value: string | number
): string
```
根据值获取对应的显示标签：
- 支持字典key查询
- 支持直接传入字典数据
- 自动处理Ref类型

### getDictLabels - 批量获取标签
```typescript
getDictLabels(
  keyOrData: string | Ref<DictItem[]>, 
  values: (string | number)[]
): string[]
```
批量转换多个值为标签数组。

### getDictValue - 获取值
```typescript
getDictValue(key: string, label: string): string | number | null
```
根据标签反查对应的值。

### getDictItem - 获取完整项
```typescript
getDictItem(
  keyOrData: string | DictItem[], 
  value: string | number
): DictItem | null
```
获取完整的字典项对象，包含所有属性。

### removeDict - 删除字典
```typescript
removeDict(key: string): boolean
```
删除指定的字典数据。

### cleanDict - 清空字典
```typescript
cleanDict(): void
```
清空所有字典数据。

## 典型字典示例

### 用户性别
```typescript
setDict('sys_user_gender', [
  { label: '男', value: '0', cssClass: 'primary' },
  { label: '女', value: '1', cssClass: 'success' },
  { label: '未知', value: '2', cssClass: 'info' }
])
```

### 状态字典
```typescript
setDict('sys_status', [
  { label: '正常', value: '0', cssClass: 'success', listClass: 'text-success' },
  { label: '停用', value: '1', cssClass: 'danger', listClass: 'text-danger' },
  { label: '维护', value: '2', cssClass: 'warning', listClass: 'text-warning' }
])
```

## 使用示例

### 在表单中使用
```vue
<template>
  <el-select v-model="form.gender">
    <el-option
      v-for="dict in genderOptions"
      :key="dict.value"
      :label="dict.label"
      :value="dict.value"
      :disabled="dict.disabled"
    />
  </el-select>
</template>

<script setup>
const dictStore = useDictStore()
const genderOptions = computed(() => 
  dictStore.getDict('sys_user_gender') || []
)
</script>
```

### 在表格中显示
```vue
<el-table-column label="状态" prop="status">
  <template #default="{ row }">
    <el-tag :type="getStatusType(row.status)">
      {{ dictStore.getDictLabel('sys_status', row.status) }}
    </el-tag>
  </template>
</el-table-column>

<script setup>
const getStatusType = (status: string) => {
  const item = dictStore.getDictItem('sys_status', status)
  return item?.cssClass || 'info'
}
</script>
```

### 批量标签转换
```typescript
// 多选场景
const selectedRoles = ['1', '2', '3']
const roleLabels = dictStore.getDictLabels('sys_role', selectedRoles)
// ['管理员', '普通用户', '访客']
```

### 动态加载字典
```typescript
// 从API加载字典
const loadDictData = async () => {
  const [err, data] = await getDictData('sys_user_type')
  if (!err) {
    dictStore.setDict('sys_user_type', data)
  }
}

// 在应用初始化时批量加载
const initDicts = async () => {
  const dictTypes = ['sys_status', 'sys_gender', 'sys_yes_no']
  await Promise.all(
    dictTypes.map(type => loadDictByType(type))
  )
}
```

## 高级用法

### 级联字典
```typescript
// 省市区级联
const provinces = dictStore.getDict('provinces')
const cities = computed(() => {
  if (!selectedProvince.value) return []
  return dictStore.getDict(`city_${selectedProvince.value}`)
})
```

### 字典过滤
```typescript
// 根据条件过滤字典项
const activeStatus = computed(() => {
  const allStatus = dictStore.getDict('sys_status')
  return allStatus?.filter(item => !item.disabled)
})
```

### 字典扩展属性
```typescript
// 使用扩展属性
setDict('sys_menu_type', [
  { 
    label: '目录', 
    value: 'M',
    icon: 'folder',
    color: '#409eff'
  },
  { 
    label: '菜单', 
    value: 'C',
    icon: 'document',
    color: '#67c23a'
  }
])

// 获取扩展属性
const menuItem = dictStore.getDictItem('sys_menu_type', 'M')
console.log(menuItem.icon) // 'folder'
```

## 与其他模块协作

### 与User Store
- 用户登录后加载权限相关字典
- 根据角色过滤可见字典项

### 与API层
- 封装字典加载方法
- 实现字典缓存策略

### 与组件
- 提供useDict组合式函数
- 封装字典选择器组件

## 性能优化

1. **懒加载策略**
    - 按需加载字典数据
    - 避免初始化时加载全部

2. **缓存机制**
    - 使用Map提高查询性能
    - 避免重复请求相同字典

3. **批量操作**
    - 批量加载相关字典
    - 合并多个字典请求

## 最佳实践

1. **命名规范**：使用统一的字典key命名规则（如sys_前缀）
2. **类型安全**：为常用字典定义TypeScript类型
3. **错误处理**：字典不存在时提供默认值
4. **更新策略**：定期刷新动态字典数据
5. **扩展性**：预留扩展字段满足特殊需求
