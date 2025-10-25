# 组件类型

组件类型定义用于 Vue 组件的 Props、Emits 和内部状态的类型安全。

## 🎯 组件 Props 类型

### 基础 Props 定义

```typescript
// Icon 组件
interface IconProps {
  value?: string
  code?: IconCode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string | number
  color?: string
  animate?: 'shake' | 'rotate180' | 'moveUp' | 'expand' | 'shrink' | 'breathing'
}

// IconSelect 组件
interface IconSelectProps {
  modelValue: string
  width?: string
}
```

### 泛型 Props

```typescript
// 通用表格组件
interface TableProps<T = any> {
  data: PageResult<T>
  fields: FieldConfig[]
  loading?: boolean
  selection?: boolean
}

// 使用
<script setup lang="ts" generic="T">
const props = defineProps<TableProps<T>>()
</script>
```

## 📤 组件 Emits 类型

### 基础 Emits

```typescript
interface FormEmits {
  (e: 'update:modelValue', value: any): void
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}

const emit = defineEmits<FormEmits>()
```

### 泛型 Emits

```typescript
interface TableEmits<T> {
  (e: 'select', rows: T[]): void
  (e: 'row-click', row: T): void
  (e: 'update:query', query: PageQuery): void
}
```

## 🔧 组件类型使用示例

### 完整组件示例

```typescript
<script setup lang="ts">
// Props 接口
interface UserFormProps {
  modelValue: UserBo
  mode: 'add' | 'edit' | 'view'
  deptTree?: DeptVo[]
}

// Emits 接口
interface UserFormEmits {
  (e: 'update:modelValue', value: UserBo): void
  (e: 'submit', data: UserBo): void
}

// 定义 Props 和 Emits
const props = withDefaults(defineProps<UserFormProps>(), {
  mode: 'add',
  deptTree: () => []
})

const emit = defineEmits<UserFormEmits>()

// 内部状态类型
const formRef = ref<FormInstance>()
const loading = ref(false)

// 方法
async function handleSubmit() {
  await formRef.value?.validate()
  emit('submit', props.modelValue)
}
</script>
```
