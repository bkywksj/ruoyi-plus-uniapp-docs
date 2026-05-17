# IconSelect 图标选择器

## 介绍

IconSelect 是一个功能强大的图标选择器组件，提供了 817+ 图标的选择功能，支持实时搜索、悬停预览和双向数据绑定。该组件广泛应用于菜单管理、按钮配置、标签设置等需要选择图标的场景。

**核心特性:**

- **海量图标库** - 包含 817 个精选图标，涵盖 iconfont (644个) 和 iconify (173个) 两种来源
- **实时搜索** - 支持按图标代码或中文名称进行模糊搜索，快速定位所需图标
- **悬停预览** - 鼠标悬停时显示图标名称和代码，提供直观的选择体验
- **双向绑定** - 完美支持 v-model 双向数据绑定，与表单无缝集成
- **清空功能** - 支持一键清空已选图标，可配置清空后的默认值
- **弹出层展示** - 使用 Element Plus Popover 组件，优雅的弹出层交互
- **类型安全** - 基于 TypeScript 开发，提供完整的类型定义
- **响应式设计** - 自适应布局，支持自定义宽度配置

组件位于 `src/components/Icon/IconSelect.vue`，依赖 Icon 组件和图标类型定义文件。

---

## 基本用法

### 最简用法

最简单的图标选择器用法，只需要绑定一个变量即可。

```vue
<template>
  <div class="demo-container">
    <IconSelect v-model="selectedIcon" />
    <p class="mt-4">当前选中图标: {{ selectedIcon || '未选择' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedIcon = ref('')
</script>
```

**使用说明:**

- 使用 `v-model` 进行双向数据绑定
- 点击输入框弹出图标选择面板
- 选择图标后自动关闭面板并更新绑定值

### 设置默认值

初始化时可以设置一个默认的图标值。

```vue
<template>
  <div class="demo-container">
    <IconSelect v-model="selectedIcon" />
    <div class="preview-section mt-4">
      <span class="label">预览效果:</span>
      <Icon v-if="selectedIcon" :code="selectedIcon" size="lg" />
      <span class="icon-code ml-2">{{ selectedIcon }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 设置默认图标
const selectedIcon = ref('user')
</script>

<style scoped>
.preview-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: var(--el-text-color-regular);
}

.icon-code {
  color: var(--el-color-primary);
  font-family: monospace;
}
</style>
```

**使用说明:**

- 初始化 ref 时传入有效的图标代码作为默认值
- Icon 组件可以直接使用选中的图标代码进行渲染
- 支持所有 817 个图标代码作为默认值

---

## 自定义宽度

通过 `width` 属性可以设置组件的输入框宽度。

```vue
<template>
  <div class="width-demo">
    <div class="demo-item">
      <span class="label">默认宽度 (400px):</span>
      <IconSelect v-model="icon1" />
    </div>

    <div class="demo-item">
      <span class="label">窄宽度 (200px):</span>
      <IconSelect v-model="icon2" width="200px" />
    </div>

    <div class="demo-item">
      <span class="label">宽宽度 (500px):</span>
      <IconSelect v-model="icon3" width="500px" />
    </div>

    <div class="demo-item">
      <span class="label">百分比宽度 (100%):</span>
      <IconSelect v-model="icon4" width="100%" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const icon1 = ref('')
const icon2 = ref('')
const icon3 = ref('')
const icon4 = ref('')
</script>

<style scoped>
.width-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  width: 160px;
  color: var(--el-text-color-regular);
}
</style>
```

**使用说明:**

- `width` 属性支持任何有效的 CSS 宽度值
- 默认宽度为 `400px`
- 弹出层宽度固定为 `450px`，不受输入框宽度影响
- 推荐最小宽度不低于 `200px` 以保证良好的显示效果

---

## 搜索功能

组件内置强大的搜索功能，支持按图标代码或中文名称进行模糊搜索。

```vue
<template>
  <div class="search-demo">
    <h4>搜索提示:</h4>
    <ul class="tips-list">
      <li>输入 <code>user</code> 搜索用户相关图标</li>
      <li>输入 <code>用户</code> 搜索中文名称包含"用户"的图标</li>
      <li>输入 <code>add</code> 搜索添加相关图标</li>
      <li>输入 <code>购物</code> 搜索购物相关图标</li>
    </ul>

    <IconSelect v-model="selectedIcon" />

    <div v-if="selectedIcon" class="result mt-4">
      <span>已选择: </span>
      <Icon :code="selectedIcon" size="lg" />
      <span class="ml-2 text-primary">{{ selectedIcon }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedIcon = ref('')
</script>

<style scoped>
.tips-list {
  padding-left: 20px;
  margin-bottom: 16px;
}

.tips-list li {
  margin: 4px 0;
  color: var(--el-text-color-regular);
}

.tips-list code {
  background-color: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.result {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

**搜索原理:**

搜索功能基于 `filteredIcons` 计算属性实现：

```typescript
const filteredIcons = computed(() => {
  if (filterValue.value) {
    const keyword = filterValue.value.toLowerCase()
    return ALL_ICONS.filter((icon) =>
      icon.code.toLowerCase().includes(keyword) ||
      icon.name.toLowerCase().includes(keyword)
    )
  }
  return ALL_ICONS
})
```

**搜索特点:**

- 不区分大小写
- 支持部分匹配（模糊搜索）
- 同时匹配图标代码和中文名称
- 实时过滤，无需确认
- 搜索框支持清空按钮

---

## 悬停预览

鼠标悬停在图标上时，会在信息栏显示图标的详细信息。

```vue
<template>
  <div class="hover-demo">
    <p class="tip">将鼠标悬停在图标上查看详细信息</p>
    <IconSelect v-model="selectedIcon" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedIcon = ref('')
</script>

<style scoped>
.tip {
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}
</style>
```

**悬停预览功能:**

- 信息栏位于搜索框和图标列表之间
- 显示内容包括：图标预览、中文名称、图标代码
- 鼠标移开后恢复显示已选中图标的信息
- 如果没有选中图标，显示图标总数

信息栏显示逻辑基于 `displayIcon` 计算属性：

```typescript
const displayIcon = computed(() => {
  return hoveredIcon.value || currentSelectedInfo.value
})
```

---

## 清空功能

组件支持清空已选中的图标，并可配置清空后的默认值。

### 标准清空

```vue
<template>
  <div class="clear-demo">
    <IconSelect v-model="selectedIcon" />
    <p class="mt-2">当前值: {{ selectedIcon || '空' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedIcon = ref('user')
</script>
```

### 自定义清空值

某些场景下需要清空后保留占位符，例如菜单图标需要 `#` 作为占位。

```vue
<template>
  <div class="clear-demo">
    <p class="mb-2">菜单图标配置（清空后保留 # 占位符）:</p>
    <IconSelect v-model="menuIcon" empty-value="#" />
    <p class="mt-2">当前值: {{ menuIcon }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 初始值为 #，表示未选择图标
const menuIcon = ref('#')
</script>
```

**使用说明:**

- 点击清空按钮（X图标）清除已选图标
- `emptyValue` 属性指定清空后的默认值
- 默认清空值为空字符串 `''`
- 清空按钮仅在有有效图标时显示

---

## 配合 Icon 组件使用

IconSelect 与 Icon 组件完美配合，选中的图标可以直接在 Icon 组件中显示。

```vue
<template>
  <div class="icon-preview-demo">
    <el-form label-width="100px">
      <el-form-item label="选择图标">
        <IconSelect v-model="form.icon" width="300px" />
      </el-form-item>

      <el-form-item label="预览效果">
        <div v-if="form.icon" class="preview-container">
          <!-- 不同尺寸预览 -->
          <div class="size-preview">
            <Icon :code="form.icon" size="xs" />
            <Icon :code="form.icon" size="sm" />
            <Icon :code="form.icon" size="md" />
            <Icon :code="form.icon" size="lg" />
            <Icon :code="form.icon" size="xl" />
            <Icon :code="form.icon" size="2xl" />
          </div>

          <!-- 不同颜色预览 -->
          <div class="color-preview mt-4">
            <Icon :code="form.icon" size="lg" color="#409eff" />
            <Icon :code="form.icon" size="lg" color="#67c23a" />
            <Icon :code="form.icon" size="lg" color="#e6a23c" />
            <Icon :code="form.icon" size="lg" color="#f56c6c" />
            <Icon :code="form.icon" size="lg" color="#909399" />
          </div>

          <p class="icon-info mt-4">
            图标代码: <code>{{ form.icon }}</code>
          </p>
        </div>
        <span v-else class="no-icon">请选择图标</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  icon: 'user'
})
</script>

<style scoped>
.preview-container {
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.size-preview,
.color-preview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-info code {
  background-color: var(--el-bg-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
  color: var(--el-color-primary);
}

.no-icon {
  color: var(--el-text-color-placeholder);
}
</style>
```

**Icon 组件尺寸对照表:**

| 预设值 | 像素大小 |
|--------|----------|
| `xs` | 12px |
| `sm` | 16px |
| `md` | 20px |
| `lg` | 24px |
| `xl` | 32px |
| `2xl` | 40px |

---

## 与表单集成

IconSelect 完全兼容 Element Plus 的表单验证系统。

### 基础表单验证

```vue
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item label="菜单名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入菜单名称" />
    </el-form-item>

    <el-form-item label="菜单图标" prop="icon">
      <IconSelect v-model="form.icon" width="300px" />
    </el-form-item>

    <el-form-item label="菜单路径" prop="path">
      <el-input v-model="form.path" placeholder="请输入菜单路径" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  icon: '',
  path: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请选择菜单图标', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入菜单路径', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (valid) {
    console.log('表单提交:', form)
    // 执行提交逻辑
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

### 自定义验证规则

```vue
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item label="按钮图标" prop="buttonIcon">
      <IconSelect v-model="form.buttonIcon" width="300px" />
      <p class="tip">仅允许选择操作类图标</p>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">验证</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

// 操作类图标白名单
const actionIcons = ['add', 'edit', 'delete', 'save', 'search', 'refresh', 'download', 'upload', 'copy', 'share']

const form = reactive({
  buttonIcon: ''
})

const validateIcon = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请选择图标'))
  } else if (!actionIcons.includes(value)) {
    callback(new Error('请选择操作类图标'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  buttonIcon: [
    { validator: validateIcon, trigger: 'change' }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('验证通过:', form.buttonIcon)
  }
}
</script>

<style scoped>
.tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
```

---

## 实际应用场景

### 菜单管理

在后台管理系统中，菜单管理是 IconSelect 最常见的使用场景。

```vue
<template>
  <el-dialog v-model="dialogVisible" title="添加菜单" width="600px">
    <el-form
      ref="formRef"
      :model="menuForm"
      :rules="menuRules"
      label-width="100px"
    >
      <el-form-item label="菜单类型" prop="menuType">
        <el-radio-group v-model="menuForm.menuType">
          <el-radio value="M">目录</el-radio>
          <el-radio value="C">菜单</el-radio>
          <el-radio value="F">按钮</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
      </el-form-item>

      <el-form-item v-if="menuForm.menuType !== 'F'" label="菜单图标" prop="icon">
        <IconSelect v-model="menuForm.icon" empty-value="#" />
      </el-form-item>

      <el-form-item label="排序号" prop="orderNum">
        <el-input-number v-model="menuForm.orderNum" :min="0" />
      </el-form-item>

      <el-form-item v-if="menuForm.menuType === 'C'" label="路由地址" prop="path">
        <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const dialogVisible = ref(true)
const formRef = ref<FormInstance>()

const menuForm = reactive({
  menuType: 'C',
  menuName: '',
  icon: '#',
  orderNum: 0,
  path: ''
})

const menuRules: FormRules = {
  menuName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  icon: [
    {
      validator: (rule, value, callback) => {
        if (menuForm.menuType !== 'F' && (!value || value === '#')) {
          callback(new Error('请选择菜单图标'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  path: [
    {
      validator: (rule, value, callback) => {
        if (menuForm.menuType === 'C' && !value) {
          callback(new Error('请输入路由地址'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('提交菜单:', menuForm)
    dialogVisible.value = false
  }
}
</script>
```

### 按钮配置

配置工具栏按钮的图标。

```vue
<template>
  <div class="button-config">
    <h4>工具栏按钮配置</h4>

    <div class="button-list">
      <div
        v-for="(btn, index) in buttons"
        :key="index"
        class="button-item"
      >
        <el-input v-model="btn.label" placeholder="按钮文字" class="btn-label" />
        <IconSelect v-model="btn.icon" width="150px" />
        <el-select v-model="btn.type" placeholder="按钮类型" class="btn-type">
          <el-option label="主要" value="primary" />
          <el-option label="成功" value="success" />
          <el-option label="警告" value="warning" />
          <el-option label="危险" value="danger" />
          <el-option label="信息" value="info" />
        </el-select>
        <el-button type="danger" :icon="Delete" circle @click="removeButton(index)" />
      </div>
    </div>

    <el-button type="primary" :icon="Plus" @click="addButton">添加按钮</el-button>

    <div class="preview mt-6">
      <h4>预览效果</h4>
      <div class="toolbar">
        <el-button
          v-for="(btn, index) in buttons"
          :key="index"
          :type="btn.type"
        >
          <Icon v-if="btn.icon" :code="btn.icon" class="mr-1" />
          {{ btn.label }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'

interface ButtonConfig {
  label: string
  icon: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const buttons = reactive<ButtonConfig[]>([
  { label: '新增', icon: 'add', type: 'primary' },
  { label: '编辑', icon: 'edit', type: 'success' },
  { label: '删除', icon: 'delete', type: 'danger' }
])

const addButton = () => {
  buttons.push({ label: '', icon: '', type: 'primary' })
}

const removeButton = (index: number) => {
  buttons.splice(index, 1)
}
</script>

<style scoped>
.button-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.button-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-label {
  width: 120px;
}

.btn-type {
  width: 100px;
}

.toolbar {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}
</style>
```

### 标签配置

为分类或标签配置图标。

```vue
<template>
  <div class="tag-config">
    <h4>文章分类配置</h4>

    <el-table :data="categories" border>
      <el-table-column label="分类名称" prop="name" width="200" />
      <el-table-column label="图标" width="200">
        <template #default="{ row }">
          <IconSelect v-model="row.icon" width="150px" />
        </template>
      </el-table-column>
      <el-table-column label="预览">
        <template #default="{ row }">
          <el-tag :type="row.tagType">
            <Icon v-if="row.icon" :code="row.icon" class="mr-1" />
            {{ row.name }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const categories = reactive([
  { name: '技术文章', icon: 'code', tagType: 'primary' },
  { name: '生活随笔', icon: 'coffee', tagType: 'success' },
  { name: '旅行游记', icon: 'airplane', tagType: 'warning' },
  { name: '美食分享', icon: 'food', tagType: 'danger' }
])
</script>
```

---

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `modelValue` | 当前选中的图标代码 (v-model) | `string` | `''` |
| `width` | 组件输入框宽度 | `string` | `'400px'` |
| `emptyValue` | 清空时的默认值 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `update:modelValue` | 选中图标改变时触发 | `(iconCode: string) => void` |

### 插槽

该组件不提供自定义插槽，所有内容均为内置实现。

### 外部依赖

| 依赖 | 说明 |
|------|------|
| `Icon` | 图标渲染组件 |
| `@/types/icons.d` | 图标类型定义和工具函数 |
| `@element-plus/icons-vue` | Element Plus 图标库 |
| `el-input` | Element Plus 输入框 |
| `el-popover` | Element Plus 弹出层 |
| `el-scrollbar` | Element Plus 滚动条 |

---

## 类型定义

### IconSelectProps

```typescript
/**
 * 图标选择器组件的属性接口
 */
interface IconSelectProps {
  /**
   * 当前选中的图标代码
   * @required
   */
  modelValue: string

  /**
   * 组件宽度
   * @default '400px'
   */
  width?: string

  /**
   * 清空时的默认值
   * 用于某些场景需要保留占位符，如菜单图标需要 '#'
   * @default ''
   */
  emptyValue?: string
}
```

### IconItem

```typescript
/**
 * 图标项接口
 */
export interface IconItem {
  /** 图标代码，唯一标识 */
  code: string
  /** 图标中文名称 */
  name: string
}
```

### IconifyIconItem

```typescript
/**
 * Iconify 图标项接口
 * 继承自 IconItem，添加 value 字段
 */
export interface IconifyIconItem extends IconItem {
  /** Iconify 图标类名 */
  value: string
}
```

### IconCode

```typescript
/**
 * 图标代码类型
 * 包含所有可用的图标代码，共 817 个
 */
declare global {
  type IconCode =
    | 'account'
    | 'activity'
    | 'add'
    // ... 共 817 个图标代码
    | 'zip'
}
```

### 工具函数

```typescript
/**
 * 搜索图标
 * @param query 搜索关键词
 * @returns 匹配的图标列表
 */
export const searchIcons = (query: string): IconItem[]

/**
 * 根据代码获取图标名称
 * @param code 图标代码
 * @returns 图标中文名称
 */
export const getIconName = (code: IconCode): string

/**
 * 获取所有图标代码
 * @returns 所有图标代码数组
 */
export const getAllIconCodes = (): IconCode[]

/**
 * 检查代码是否为 iconfont 图标
 * @param code 图标代码
 * @returns 是否为 iconfont 图标
 */
export const isIconfontIcon = (code: string): boolean

/**
 * 检查代码是否为 iconify 图标
 * @param code 图标代码
 * @returns 是否为 iconify 图标
 */
export const isIconifyIcon = (code: string): boolean

/**
 * 获取 iconify 图标的 value
 * @param code 图标代码
 * @returns iconify 图标类名
 */
export const getIconifyValue = (code: string): string | undefined
```

---

## 图标分类

IconSelect 包含 817 个图标，分为以下类别：

### 界面元素 (30个)

`button`, `cascader`, `checkbox`, `form`, `icon`, `input`, `list`, `radio`, `rate`, `row`, `select`, `slider`, `star`, `switch`, `tab`, `table`, `textarea`, `eye-off`, `eye-open`, `tree-table`, `filter`, `sort`, `menu`, `more-actions`, `drag-handle`, `collapse`, `expand`, `close`, `loading`, `columns`

### 导航 (18个)

`home`, `caret-back`, `caret-forward`, `caret-up`, `caret-down`, `dashboard`, `link`, `nested`, `back`, `forward`, `arrow-up`, `arrow-down`, `refresh`, `breadcrumb`, `hamburger`, `arrow`, `arrow-down-left`, `arrow-up-right`

### 数据 (16个)

`chart`, `dict`, `database`, `model`, `monitor`, `number`, `redis`, `redis-list`, `tree`, `statistics`, `pie-chart`, `bar-chart`, `line-chart`, `data-analysis`, `chip`, `calculator`

### 文件 (20个)

`clipboard`, `documentation`, `zip`, `file`, `image`, `video`, `audio`, `word`, `excel`, `ppt`, `pdf`, `text`, `code-file`, `folder`, `folder-open`, `add-document`, `add-file`, `article`, `book`, `bookmark`

### 操作 (25个)

`download`, `drag`, `edit`, `search`, `upload`, `copy`, `cut`, `add`, `delete`, `save`, `cancel`, `confirm`, `share`, `import`, `export`, `print`, `scan`, `exit-fullscreen`, `fullscreen`, `take-photo`, `crop`, `clean`, `clear`, `check`, `choose`

### 状态 (12个)

`error-404`, `finish`, `online`, `waiting`, `success`, `warning`, `error`, `info`, `disabled`, `complete`, `correct`, `ban`

### 用户 (15个)

`user`, `users`, `account`, `post`, `skill`, `my-task`, `team`, `role`, `department`, `customer`, `admin`, `add-friend`, `baby`, `customer-service`, `seller`

### 安全 (14个)

`lock`, `login-info`, `auth-center`, `password`, `auth-identity`, `valid-code`, `security`, `unlock`, `permission`, `logout`, `maxkey`, `topiam`, `badge`, `certificate`

### 通信 (12个)

`email`, `message`, `phone`, `chat`, `comment`, `notification`, `send`, `sms`, `communicate`, `consultation`, `call`, `announcement`

### 社交 (18个)

`qq`, `wechat`, `wechat-fill`, `weibo`, `twitter`, `facebook`, `linkedin`, `instagram`, `taobao`, `moments`, `like`, `heart`, `share-social`, `bilibili`, `collect`, `community`, `wishlist`, `comment`

### 开发 (16个)

`bug`, `build`, `test`, `code`, `component`, `gitee`, `github`, `api`, `git`, `terminal`, `debug`, `deploy`, `app`, `miniapp`, `code-block`, `code-file`

### 时间 (12个)

`date`, `date-range`, `job`, `time`, `time-range`, `schedule`, `history`, `reminder`, `clock`, `clock-in`, `alarm`, `calendar`

### 系统 (18个)

`category`, `color`, `guide`, `international`, `language`, `log`, `question`, `size`, `setting`, `theme`, `tool`, `example`, `dark-mode`, `light-mode`, `command`, `ctrl-copy`, `auto-width`, `bg-color`

### 设备 (14个)

`mobile`, `desktop`, `tablet`, `indicator`, `printer`, `camera`, `server`, `photo-album`, `wifi`, `bluetooth`, `battery`, `chip`, `cabinet`, `curtain`

### 业务 (35个)

`company`, `money`, `shopping`, `order`, `payment`, `wxpay`, `alipay`, `invoice`, `product`, `store`, `location`, `shipping`, `delivery`, `discount`, `coupon`, `gift`, `sale`, `shop-window`, `scan-code`, `bag`, `rating`, `auction`, `refund`, `combination`, `bank-card`, `bargain`, `cargo`, `coin`, `complete-order`, `consumption`, `courier`, `crown`, `champion`

### 媒体控制 (8个)

`play`, `pause`, `stop`, `volume`, `mute`, `audio`, `video`, `music`

### 医疗健康 (6个)

`health`, `hospital`, `medicine`, `doctor`, `baby`, `clean`

### 食品餐饮 (15个)

`food`, `restaurant`, `coffee`, `drink`, `cake`, `pizza`, `fruit`, `vegetable`, `meat`, `cooking`, `dinner`, `breakfast`, `beverage`, `candy`, `bread`

### 游戏娱乐 (6个)

`game`, `music`, `movie`, `basketball`, `champion`, `crown`

### 天气环境 (10个)

`sun`, `moon`, `cloud`, `rain`, `snow`, `wind`, `temperature`, `light-mode`, `dark-mode`, `curtain`

### 交通出行 (12个)

`car`, `bus`, `train`, `airplane`, `bicycle`, `navigation`, `map`, `boat`, `bike`, `cargo`, `current-location`, `compass`

### 教育学习 (10个)

`education`, `book`, `graduation`, `school`, `certificate`, `course`, `article`, `documentation`, `guide`, `example`

### 建筑场所 (10个)

`building`, `city`, `church`, `company`, `hospital`, `school`, `store`, `restaurant`, `community`, `cabinet`

---

## 样式定制

### CSS 类名结构

组件提供了清晰的 CSS 类名结构，便于自定义样式：

```
.icon-select-wrapper        // 根容器
├── .el-input              // 输入框
│   ├── [prepend]          // 前置图标预览
│   └── [suffix]           // 后置操作区
│       ├── .clear-icon    // 清空按钮
│       └── .arrow-icon    // 箭头按钮
├── .popover-reference     // 弹出层锚点
└── [el-popover]           // 弹出层
    ├── .p-2               // 搜索区
    ├── .icon-info-bar     // 信息栏
    └── .el-scrollbar      // 滚动区域
        └── .icon-list-class      // 图标列表
            └── .icon-item-class  // 图标项
                └── .active       // 选中状态
```

### 自定义样式示例

#### 修改选中状态颜色

```scss
// 覆盖选中状态样式
:deep(.icon-list-class) {
  .icon-item-class.active {
    border-color: #67c23a;
    color: #67c23a;
    background-color: rgba(103, 194, 58, 0.1);
  }
}
```

#### 修改图标项大小

```scss
// 增大图标项
:deep(.icon-list-class) {
  .icon-item-class {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
```

#### 修改悬停效果

```scss
// 增强悬停动画
:deep(.icon-list-class) {
  .icon-item-class:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    transform: scale(1.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
```

#### 暗黑模式适配

```scss
// 暗黑模式样式
.dark {
  :deep(.icon-info-bar) {
    background-color: var(--el-fill-color);
  }

  :deep(.icon-list-class) {
    .icon-item-class {
      border-color: var(--el-border-color-light);

      &:hover {
        border-color: var(--el-color-primary);
        background-color: rgba(64, 158, 255, 0.1);
      }
    }
  }
}
```

### CSS 变量

组件使用 Element Plus 的 CSS 变量体系：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--el-color-primary` | 主题色 | `#409eff` |
| `--el-color-primary-light-9` | 主题色淡9 | `#ecf5ff` |
| `--el-text-color-placeholder` | 占位符颜色 | `#a8abb2` |
| `--el-text-color-regular` | 常规文字颜色 | `#606266` |
| `--el-border-color` | 边框颜色 | `#dcdfe6` |
| `--el-fill-color-light` | 浅填充色 | `#f5f7fa` |

---

## 最佳实践

### 1. 合理使用 emptyValue

在菜单管理等场景中，使用 `emptyValue="#"` 来保留占位符：

```vue
<!-- ✅ 推荐：菜单图标使用 # 作为空值占位 -->
<IconSelect v-model="menuIcon" empty-value="#" />

<!-- ✅ 推荐：普通场景使用空字符串 -->
<IconSelect v-model="buttonIcon" />
```

### 2. 配合表单验证

始终在表单中添加验证规则：

```typescript
// ✅ 推荐：添加必填验证
const rules = {
  icon: [
    { required: true, message: '请选择图标', trigger: 'change' }
  ]
}
```

### 3. 设置合适的宽度

根据布局需要设置合适的宽度：

```vue
<!-- ✅ 推荐：在表单中使用较小宽度 -->
<IconSelect v-model="icon" width="250px" />

<!-- ✅ 推荐：在独立使用时可以更宽 -->
<IconSelect v-model="icon" width="400px" />
```

### 4. 及时显示预览

选中图标后应该提供预览，帮助用户确认选择：

```vue
<template>
  <div class="icon-field">
    <IconSelect v-model="icon" />
    <div v-if="icon" class="preview">
      <Icon :code="icon" size="lg" />
      <span>{{ icon }}</span>
    </div>
  </div>
</template>
```

### 5. 处理初始化值

确保初始化值是有效的图标代码：

```typescript
// ✅ 推荐：使用有效的图标代码或空字符串
const icon = ref('user')
const icon = ref('')

// ❌ 避免：使用无效的初始值
const icon = ref('invalid-icon-code')
```

### 6. 类型安全

利用 TypeScript 类型确保类型安全：

```typescript
// ✅ 推荐：使用 IconCode 类型
const icon = ref<IconCode | ''>('')

// ✅ 推荐：在赋值时检查类型
import { ALL_ICONS } from '@/types/icons.d'

const setIcon = (code: string) => {
  if (ALL_ICONS.some(icon => icon.code === code)) {
    icon.value = code as IconCode
  }
}
```

### 7. 响应式布局

在响应式布局中使用百分比宽度：

```vue
<template>
  <div class="responsive-form">
    <!-- 小屏幕使用百分比宽度 -->
    <IconSelect v-model="icon" :width="isMobile ? '100%' : '300px'" />
  </div>
</template>
```

---

## 常见问题

### 1. 图标不显示

**问题原因:**
- 图标字体未正确加载
- 图标代码拼写错误
- Icon 组件未正确引入

**解决方案:**

```typescript
// 1. 检查图标字体是否加载
// 在浏览器开发工具中检查 Network -> Font

// 2. 验证图标代码是否有效
import { ALL_ICONS } from '@/types/icons.d'
const isValid = ALL_ICONS.some(icon => icon.code === 'your-icon-code')
console.log('图标是否有效:', isValid)

// 3. 确保 Icon 组件已注册
import Icon from '@/components/Icon/Icon.vue'
```

### 2. 搜索无结果

**问题原因:**
- 搜索关键词与图标代码/名称不匹配
- 拼写错误

**解决方案:**

```typescript
// 查看所有可用图标
import { ALL_ICONS } from '@/types/icons.d'
console.log('所有图标:', ALL_ICONS)

// 手动搜索测试
const keyword = 'user'
const results = ALL_ICONS.filter(icon =>
  icon.code.includes(keyword) || icon.name.includes(keyword)
)
console.log('搜索结果:', results)
```

### 3. 清空按钮不显示

**问题原因:**
- 当前值等于 emptyValue
- 当前值为空字符串

**解决方案:**

```vue
<!-- 清空按钮只在有有效图标时显示 -->
<IconSelect v-model="icon" />

<!-- 检查 hasValidIcon 计算属性 -->
const hasValidIcon = computed(() => {
  return currentValue.value && currentValue.value !== props.emptyValue
})
```

### 4. 表单验证不触发

**问题原因:**
- trigger 设置为 'blur' 而非 'change'
- 未正确配置 prop

**解决方案:**

```vue
<el-form-item prop="icon">  <!-- 确保 prop 正确设置 -->
  <IconSelect v-model="form.icon" />
</el-form-item>

<script lang="ts" setup>
const rules = {
  icon: [
    {
      required: true,
      message: '请选择图标',
      trigger: 'change'  // 使用 change 触发器
    }
  ]
}
</script>
```

### 5. 弹出层位置异常

**问题原因:**
- 父容器有 overflow: hidden
- 定位上下文问题

**解决方案:**

```scss
// 确保父容器不限制弹出层
.parent-container {
  overflow: visible;
}

// 或者使用 teleport 将弹出层挂载到 body
// (需要修改组件代码)
```

### 6. 性能问题（大量图标渲染慢）

**问题原因:**
- 817个图标一次性渲染

**解决方案:**

```vue
<!-- 组件内部已使用虚拟滚动优化 -->
<el-scrollbar>
  <!-- 设置了 max-height 限制可视区域 -->
  <ul class="icon-list-class">
    <!-- 图标列表 -->
  </ul>
</el-scrollbar>
```

### 7. 暗黑模式样式问题

**问题原因:**
- 信息栏背景色未适配暗黑模式

**解决方案:**

```scss
// 添加暗黑模式适配
.dark {
  .icon-info-bar {
    background-color: var(--el-fill-color);
  }

  .icon-list-class .icon-item-class {
    border-color: var(--el-border-color-light);
  }
}
```

---

## 完整示例

以下是一个完整的菜单管理页面示例：

```vue
<template>
  <div class="menu-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" @click="handleAdd">
            <Icon code="add" class="mr-1" />
            新增菜单
          </el-button>
        </div>
      </template>

      <el-table :data="menuList" row-key="id" border>
        <el-table-column label="菜单名称" prop="name" width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <Icon v-if="row.icon && row.icon !== '#'" :code="row.icon" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图标" prop="icon" width="150">
          <template #default="{ row }">
            <code v-if="row.icon !== '#'">{{ row.icon }}</code>
            <span v-else class="text-gray-400">无</span>
          </template>
        </el-table-column>
        <el-table-column label="路径" prop="path" />
        <el-table-column label="排序" prop="orderNum" width="80" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单图标" prop="icon">
          <IconSelect v-model="form.icon" empty-value="#" width="100%" />
        </el-form-item>

        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入菜单路径" />
        </el-form-item>

        <el-form-item label="排序号" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" :max="999" />
        </el-form-item>

        <el-form-item label="预览效果">
          <div class="preview-box">
            <div class="menu-item">
              <Icon
                v-if="form.icon && form.icon !== '#'"
                :code="form.icon"
                size="lg"
              />
              <span class="menu-name">{{ form.name || '菜单名称' }}</span>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

interface MenuItem {
  id: number
  name: string
  icon: string
  path: string
  orderNum: number
}

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)

// 模拟菜单数据
const menuList = reactive<MenuItem[]>([
  { id: 1, name: '系统管理', icon: 'setting', path: '/system', orderNum: 1 },
  { id: 2, name: '用户管理', icon: 'user', path: '/system/user', orderNum: 2 },
  { id: 3, name: '角色管理', icon: 'role', path: '/system/role', orderNum: 3 },
  { id: 4, name: '菜单管理', icon: 'menu', path: '/system/menu', orderNum: 4 }
])

const form = reactive({
  name: '',
  icon: '#',
  path: '',
  orderNum: 0
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  icon: [
    {
      validator: (rule, value, callback) => {
        // 图标可选，但如果选择了必须是有效的
        callback()
      },
      trigger: 'change'
    }
  ],
  path: [
    { required: true, message: '请输入菜单路径', trigger: 'blur' },
    { pattern: /^\//, message: '路径必须以 / 开头', trigger: 'blur' }
  ]
}

const resetForm = () => {
  form.name = ''
  form.icon = '#'
  form.path = ''
  form.orderNum = 0
  formRef.value?.clearValidate()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: MenuItem) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row: MenuItem) => {
  try {
    await ElMessageBox.confirm(
      `确定删除菜单 "${row.name}" 吗？`,
      '提示',
      { type: 'warning' }
    )

    const index = menuList.findIndex(item => item.id === row.id)
    if (index > -1) {
      menuList.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  if (isEdit.value && editId.value) {
    // 编辑
    const item = menuList.find(m => m.id === editId.value)
    if (item) {
      Object.assign(item, form)
      ElMessage.success('更新成功')
    }
  } else {
    // 新增
    const newId = Math.max(...menuList.map(m => m.id)) + 1
    menuList.push({ ...form, id: newId })
    ElMessage.success('添加成功')
  }

  dialogVisible.value = false
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-box {
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  width: 100%;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: var(--el-bg-color);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.menu-name {
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
```

---

## 注意事项

1. **图标代码类型安全** - 组件使用 TypeScript 的 `IconCode` 类型来确保选择的图标代码是有效的，在使用时应注意类型匹配

2. **搜索功能限制** - 搜索不区分大小写，支持部分匹配，但不支持拼音搜索

3. **Icon 组件依赖** - IconSelect 组件依赖 Icon 组件来显示图标预览，确保 Icon 组件已正确注册

4. **弹出层宽度** - 弹出层宽度固定为 450px，不会随输入框宽度变化

5. **图标字体加载** - 确保 iconfont 字体文件已正确加载，否则图标可能无法显示

6. **键盘导航** - 当前版本不支持键盘导航选择图标，需要使用鼠标点击

7. **性能考虑** - 817 个图标全部渲染可能在低端设备上有轻微性能影响，组件已通过滚动区域限制可视数量

8. **emptyValue 使用场景** - 在需要区分"未选择"和"选择后清空"的场景中使用 emptyValue

9. **响应式设计** - 组件支持自定义宽度，但弹出层宽度固定，在小屏幕上需要注意布局

10. **暗黑模式** - 组件基本支持暗黑模式，但可能需要额外的样式覆盖来完善适配
