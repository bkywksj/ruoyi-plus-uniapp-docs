# 自定义组件开发

## 介绍

RuoYi-Plus 前端项目基于 Vue 3 和 Element Plus 构建，提供了完善的自定义组件开发框架和规范。通过本指南，你将学习如何在项目中创建高质量、可复用的自定义组件。

**核心特性：**

- **Vue 3 Composition API** - 使用最新的 Composition API 和 `<script setup>` 语法编写组件
- **TypeScript 类型安全** - 完整的 TypeScript 类型定义，提供出色的类型推导和开发体验
- **响应式设计** - 内置响应式栅格系统，支持多种屏幕尺寸适配
- **样式系统** - 基于 UnoCSS + SCSS，支持原子化 CSS 和组件样式
- **组件自动导入** - 无需手动导入，组件开箱即用
- **国际化支持** - 完整的 i18n 集成，支持多语言切换

**组件分类：**

项目中的自定义组件主要分为以下几类：

1. **基础组件** - Icon、DictTag 等基础工具组件
2. **表单组件** - AFormInput、AFormSelect 等表单相关组件
3. **数据展示组件** - ACard 系列、ADetail 等数据展示组件
4. **业务组件** - ASearchForm、TableToolbar 等业务场景组件
5. **功能组件** - AModal、AImportExcel 等功能性组件

## 快速开始

### 创建第一个组件

让我们创建一个简单的 `HelloWorld` 组件，了解基本的组件开发流程。

**步骤 1：创建组件文件**

在 `src/components` 目录下创建组件文件：

```
src/components/
└── HelloWorld/
    └── HelloWorld.vue
```

**步骤 2：编写组件代码**

```vue
<template>
  <div class="hello-world">
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <el-button @click="handleClick">点击我</el-button>
  </div>
</template>

<script setup lang="ts" name="HelloWorld">
/**
 * HelloWorld 组件属性接口
 */
interface HelloWorldProps {
  /** 标题 */
  title: string
  /** 消息内容 */
  message?: string
}

/**
 * 定义组件属性
 */
const props = withDefaults(defineProps<HelloWorldProps>(), {
  message: '欢迎使用 RuoYi-Plus!'
})

/**
 * 定义事件
 */
const emit = defineEmits<{
  click: [value: string]
}>()

/**
 * 点击处理函数
 */
const handleClick = () => {
  emit('click', 'Hello from HelloWorld')
}
</script>

<style lang="scss" scoped>
.hello-world {
  padding: 20px;
  text-align: center;

  h2 {
    color: var(--el-color-primary);
    margin-bottom: 10px;
  }

  p {
    color: var(--el-text-color-regular);
    margin-bottom: 20px;
  }
}
</style>
```

**步骤 3：在页面中使用**

组件会自动注册，无需手动导入，直接在模板中使用：

```vue
<template>
  <div class="page">
    <HelloWorld
      title="我的第一个组件"
      @click="handleHelloClick"
    />
  </div>
</template>

<script setup lang="ts">
const handleHelloClick = (value: string) => {
  console.log(value) // 输出: Hello from HelloWorld
}
</script>
```

**开发要点：**

- ✅ 使用 `<script setup lang="ts">` 语法
- ✅ 通过 `name` 选项定义组件名称
- ✅ 使用 TypeScript 接口定义 Props
- ✅ 使用 `defineEmits` 定义事件类型
- ✅ 使用 CSS 变量实现主题适配

## 组件开发基础

### 组件文件结构

推荐的组件目录结构：

```
src/components/
└── ComponentName/
    ├── ComponentName.vue      # 组件主文件
    ├── types.ts               # 类型定义（可选）
    ├── SubComponent.vue       # 子组件（可选）
    └── index.ts               # 导出文件（可选）
```

**示例：复杂组件结构**

```
src/components/
└── ACard/
    ├── ADataCard.vue          # 数据卡片
    ├── AStatsCard.vue         # 统计卡片
    ├── AChartCard.vue         # 图表卡片
    └── types.ts               # 共享类型定义
```

### 命名规范

**组件命名：**

1. **文件名** - 使用 PascalCase（大驼峰）
   ```
   ✅ HelloWorld.vue
   ✅ ADataCard.vue
   ❌ helloWorld.vue
   ❌ a-data-card.vue
   ```

2. **组件名** - 使用 `name` 选项定义，与文件名一致
   ```vue
   <script setup lang="ts" name="HelloWorld">
   </script>
   ```

3. **Props 接口命名** - `{ComponentName}Props`
   ```typescript
   interface HelloWorldProps {
     title: string
   }
   ```

4. **事件接口命名** - `{ComponentName}Emits`（可选）
   ```typescript
   interface HelloWorldEmits {
     click: [value: string]
   }
   ```

**变量命名：**

- 响应式变量：小驼峰（camelCase）
  ```typescript
  const isLoading = ref(false)
  const userInfo = ref({})
  ```

- 常量：大写下划线（SCREAMING_SNAKE_CASE）
  ```typescript
  const MAX_COUNT = 100
  const DEFAULT_SIZE = 'medium'
  ```

- 函数/方法：小驼峰 + 动词前缀
  ```typescript
  const handleClick = () => {}
  const getUserInfo = () => {}
  const formatDate = () => {}
  ```

### Props 定义

**基础 Props 定义：**

```vue
<script setup lang="ts" name="MyComponent">
interface MyComponentProps {
  /** 标题 */
  title: string
  /** 是否显示 */
  visible?: boolean
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 数据列表 */
  items?: Array<{ id: number; name: string }>
}

const props = withDefaults(defineProps<MyComponentProps>(), {
  visible: true,
  size: 'medium',
  items: () => []
})
</script>
```

**Props 类型示例：**

```typescript
interface ComponentProps {
  // 基础类型
  title: string
  count: number
  visible: boolean

  // 可选类型
  subtitle?: string
  maxCount?: number

  // 联合类型
  size?: 'small' | 'medium' | 'large'
  type?: 'primary' | 'success' | 'warning' | 'danger'

  // 数组类型
  tags?: string[]
  items?: Array<{ id: number; name: string }>

  // 对象类型
  config?: {
    width: number
    height: number
  }

  // 函数类型
  formatter?: (value: any) => string
  validator?: (value: any) => boolean

  // 任意类型
  data?: any
  customValue?: unknown
}
```

**Props 默认值：**

```typescript
const props = withDefaults(defineProps<MyComponentProps>(), {
  // 基础类型默认值
  title: '默认标题',
  count: 0,
  visible: true,

  // 联合类型默认值
  size: 'medium',
  type: 'primary',

  // 数组默认值（使用箭头函数）
  tags: () => [],
  items: () => [],

  // 对象默认值（使用箭头函数）
  config: () => ({
    width: 100,
    height: 100
  }),

  // 函数默认值
  formatter: (value: any) => String(value)
})
```

### Events 定义

**基础事件定义：**

```vue
<script setup lang="ts" name="MyComponent">
/**
 * 定义组件事件
 */
const emit = defineEmits<{
  // 无参数事件
  close: []

  // 单个参数
  change: [value: string]

  // 多个参数
  submit: [data: FormData, index: number]

  // 对象参数
  update: [{ id: number; name: string }]
}>()

// 触发事件
const handleClose = () => {
  emit('close')
}

const handleChange = (value: string) => {
  emit('change', value)
}

const handleSubmit = (data: FormData, index: number) => {
  emit('submit', data, index)
}
</script>
```

**v-model 事件：**

```vue
<script setup lang="ts" name="MyInput">
interface MyInputProps {
  modelValue: string
}

const props = defineProps<MyInputProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}
</script>

<template>
  <input
    :value="modelValue"
    @input="handleInput"
  />
</template>
```

**使用 v-model：**

```vue
<template>
  <MyInput v-model="searchText" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchText = ref('')
</script>
```

**多个 v-model：**

```vue
<script setup lang="ts" name="MyForm">
interface MyFormProps {
  title: string
  visible: boolean
}

const props = defineProps<MyFormProps>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:visible': [value: boolean]
}>()
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-input
      :model-value="title"
      @update:model-value="$emit('update:title', $event)"
    />
  </el-dialog>
</template>
```

**使用多个 v-model：**

```vue
<template>
  <MyForm v-model:title="formTitle" v-model:visible="dialogVisible" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formTitle = ref('表单标题')
const dialogVisible = ref(false)
</script>
```

### Slots 插槽

**基础插槽：**

```vue
<template>
  <div class="card">
    <div class="card-header">
      <!-- 具名插槽：头部 -->
      <slot name="header">
        <h3>{{ title }}</h3>
      </slot>
    </div>

    <div class="card-body">
      <!-- 默认插槽：内容 -->
      <slot>
        <p>默认内容</p>
      </slot>
    </div>

    <div class="card-footer">
      <!-- 具名插槽：底部 -->
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="MyCard">
interface MyCardProps {
  title?: string
}

const props = withDefaults(defineProps<MyCardProps>(), {
  title: '卡片标题'
})
</script>
```

**使用插槽：**

```vue
<template>
  <MyCard>
    <template #header>
      <h2>自定义标题</h2>
    </template>

    <!-- 默认插槽内容 -->
    <p>这是卡片内容</p>

    <template #footer>
      <el-button>确定</el-button>
    </template>
  </MyCard>
</template>
```

**作用域插槽：**

```vue
<template>
  <div class="list">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="list-item"
    >
      <!-- 作用域插槽：向外暴露数据 -->
      <slot
        name="item"
        :item="item"
        :index="index"
        :is-last="index === items.length - 1"
      >
        <!-- 默认显示 -->
        <span>{{ item.name }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="MyList">
interface ListItem {
  id: number
  name: string
}

interface MyListProps {
  items: ListItem[]
}

const props = defineProps<MyListProps>()
</script>
```

**使用作用域插槽：**

```vue
<template>
  <MyList :items="userList">
    <template #item="{ item, index, isLast }">
      <div class="user-item">
        <span>{{ index + 1 }}. {{ item.name }}</span>
        <el-tag v-if="isLast" type="success">最新</el-tag>
      </div>
    </template>
  </MyList>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])
</script>
```

**检查插槽是否存在：**

```vue
<template>
  <div class="card">
    <!-- 只在有插槽内容时渲染头部 -->
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <!-- 只在有插槽内容时渲染底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="MyCard">
import { useSlots } from 'vue'

// 获取插槽对象
const slots = useSlots()

// 检查插槽是否有内容
const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)
</script>
```

## 组件开发进阶

### 响应式设计

项目中的组件支持多种响应式设计方案，主要包括基于 Element Plus 的栅格系统和容器查询。

**Element Plus 栅格系统：**

```vue
<template>
  <el-row :gutter="16">
    <el-col
      :xs="24"   <!-- <768px: 全宽 -->
      :sm="12"   <!-- ≥768px: 半宽 -->
      :md="8"    <!-- ≥992px: 1/3宽 -->
      :lg="6"    <!-- ≥1200px: 1/4宽 -->
      :xl="4"    <!-- ≥1920px: 1/6宽 -->
    >
      <div class="content">内容</div>
    </el-col>
  </el-row>
</template>
```

**响应式配置接口：**

```typescript
/**
 * 响应式配置接口
 */
interface ResponsiveConfig {
  /** 超小屏幕 <768px */
  xs?: number
  /** 小屏幕 ≥768px */
  sm?: number
  /** 中等屏幕 ≥992px */
  md?: number
  /** 大屏幕 ≥1200px */
  lg?: number
  /** 超大屏幕 ≥1920px */
  xl?: number
}

interface MyCardProps {
  /** 列配置 */
  colConfig?: ResponsiveConfig
}

const props = withDefaults(defineProps<MyCardProps>(), {
  colConfig: () => ({
    xs: 24,
    sm: 12,
    md: 8,
    lg: 6,
    xl: 4
  })
})
```

**使用响应式配置：**

```vue
<template>
  <el-col
    :xs="colConfig.xs"
    :sm="colConfig.sm"
    :md="colConfig.md"
    :lg="colConfig.lg"
    :xl="colConfig.xl"
  >
    <slot></slot>
  </el-col>
</template>

<script setup lang="ts" name="ResponsiveCard">
interface ResponsiveConfig {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

interface ResponsiveCardProps {
  colConfig?: ResponsiveConfig
}

const props = withDefaults(defineProps<ResponsiveCardProps>(), {
  colConfig: () => ({
    xs: 24,
    sm: 12,
    md: 8,
    lg: 6,
    xl: 4
  })
})
</script>
```

### 样式定制

**使用 UnoCSS 原子类：**

```vue
<template>
  <div class="p-4 bg-white dark:bg-dark rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
      {{ title }}
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ content }}
    </p>
  </div>
</template>
```

**常用原子类：**

```scss
/* 间距 */
p-4      // padding: 1rem
m-2      // margin: 0.5rem
px-4     // padding-left/right: 1rem
mb-2     // margin-bottom: 0.5rem

/* 颜色 */
bg-white           // 白色背景
text-gray-800      // 灰色文字
bg-blue-500        // 蓝色背景

/* 暗黑模式 */
dark:bg-dark       // 暗黑模式下的背景色
dark:text-gray-200 // 暗黑模式下的文字色

/* 布局 */
flex               // display: flex
items-center       // align-items: center
justify-between    // justify-content: space-between

/* 尺寸 */
w-full             // width: 100%
h-20               // height: 5rem

/* 圆角 */
rounded            // border-radius: 0.25rem
rounded-lg         // border-radius: 0.5rem

/* 阴影 */
shadow-sm          // box-shadow: 0 1px 2px
shadow-md          // box-shadow: 0 4px 6px
```

**使用 SCSS 变量：**

```vue
<style lang="scss" scoped>
.my-component {
  // Element Plus 设计令牌
  color: var(--el-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);

  // 主题变量
  padding: var(--el-padding);
  border-radius: var(--el-border-radius);

  // 响应式断点
  @media (max-width: 768px) {
    padding: 10px;
  }
}
</style>
```

**常用 CSS 变量：**

```scss
/* 颜色变量 */
--el-color-primary      // 主题色
--el-color-success      // 成功色
--el-color-warning      // 警告色
--el-color-danger       // 危险色
--el-color-info         // 信息色

/* 背景色 */
--el-bg-color           // 主背景色
--el-bg-color-page      // 页面背景色
--bg-level-1            // 一级背景
--bg-level-2            // 二级背景
--bg-level-3            // 三级背景

/* 文字颜色 */
--el-text-color-primary    // 主要文字
--el-text-color-regular    // 常规文字
--el-text-color-secondary  // 次要文字
--el-text-color-placeholder // 占位文字

/* 边框 */
--el-border-color       // 边框颜色
--el-border-radius      // 圆角大小

/* 间距 */
--el-padding            // 内边距
--el-margin             // 外边距
```

**组件样式最佳实践：**

```vue
<template>
  <div class="my-component">
    <div class="my-component__header">
      <h2 class="my-component__title">{{ title }}</h2>
    </div>
    <div class="my-component__body">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 使用 BEM 命名规范
.my-component {
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: var(--el-border-radius);

  // 使用嵌套选择器
  &__header {
    margin-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color);
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__body {
    padding: 16px 0;
  }

  // 状态修饰符
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 12px;
  }
}
</style>
```

### 动画效果

**过渡动画：**

```vue
<template>
  <transition name="fade">
    <div v-if="visible" class="content">
      内容
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**列表过渡：**

```vue
<template>
  <transition-group name="list" tag="div">
    <div
      v-for="item in items"
      :key="item.id"
      class="list-item"
    >
      {{ item.name }}
    </div>
  </transition-group>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

**使用 UnoCSS 动画类：**

```vue
<template>
  <div
    class="hover:scale-105 transition-transform duration-300"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    卡片内容
  </div>
</template>
```

## TypeScript 类型定义

### Props 类型定义

**基础类型定义：**

```typescript
/**
 * 尺寸类型
 */
export type SizeType = '' | 'default' | 'small' | 'large'

/**
 * 按钮类型
 */
export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'

/**
 * 组件 Props 接口
 */
interface MyComponentProps {
  /** 尺寸 */
  size?: SizeType
  /** 类型 */
  type?: ButtonType
  /** 是否禁用 */
  disabled?: boolean
}
```

**复杂类型定义：**

```typescript
/**
 * 数据项接口
 */
export interface DataItem {
  /** 唯一标识 */
  id: number
  /** 名称 */
  name: string
  /** 值 */
  value: number | string
  /** 百分比变化 */
  percent?: number
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 响应式配置接口
 */
export interface ResponsiveConfig {
  /** 超小屏幕 <768px */
  xs?: number
  /** 小屏幕 ≥768px */
  sm?: number
  /** 中等屏幕 ≥992px */
  md?: number
  /** 大屏幕 ≥1200px */
  lg?: number
  /** 超大屏幕 ≥1920px */
  xl?: number
}

/**
 * 组件 Props 接口
 */
interface DataCardProps {
  /** 标题 */
  title: string
  /** 图标代码 */
  iconCode?: string
  /** 数据列表 */
  dataList: DataItem[]
  /** 列配置 */
  colConfig?: ResponsiveConfig
  /** 是否可点击 */
  clickable?: boolean
}
```

### 事件类型定义

```typescript
/**
 * 组件事件接口
 */
interface MyComponentEmits {
  /** 点击事件 */
  (e: 'click', event: MouseEvent): void
  /** 值变化事件 */
  (e: 'change', value: string, oldValue: string): void
  /** 提交事件 */
  (e: 'submit', data: FormData): void
  /** 项点击事件 */
  (e: 'item-click', item: DataItem, index: number): void
}

/**
 * 使用事件接口
 */
const emit = defineEmits<MyComponentEmits>()

// 触发事件
emit('click', event)
emit('change', newValue, oldValue)
emit('submit', formData)
emit('item-click', item, index)
```

### 计算属性类型

```typescript
import { computed, ComputedRef } from 'vue'

/**
 * 计算属性示例
 */
const formattedValue: ComputedRef<string> = computed(() => {
  return `${props.value}%`
})

const isValid: ComputedRef<boolean> = computed(() => {
  return props.value > 0 && props.value <= 100
})

const classList: ComputedRef<string[]> = computed(() => {
  return [
    'my-component',
    props.size && `my-component--${props.size}`,
    props.disabled && 'my-component--disabled'
  ].filter(Boolean) as string[]
})
```

### Ref 类型

```typescript
import { ref, Ref } from 'vue'

// 基础类型 Ref
const count: Ref<number> = ref(0)
const message: Ref<string> = ref('')
const isLoading: Ref<boolean> = ref(false)

// 对象类型 Ref
interface User {
  id: number
  name: string
  email: string
}

const user: Ref<User | null> = ref(null)
const userList: Ref<User[]> = ref([])

// DOM 引用类型
const inputRef: Ref<HTMLInputElement | null> = ref(null)
const dialogRef: Ref<InstanceType<typeof ElDialog> | null> = ref(null)
```

### 泛型组件

```vue
<script setup lang="ts" generic="T extends { id: number }">
/**
 * 泛型组件示例
 */
interface GenericListProps<T> {
  /** 数据列表 */
  items: T[]
  /** 获取唯一键 */
  keyField?: keyof T
}

const props = withDefaults(defineProps<GenericListProps<T>>(), {
  keyField: 'id' as keyof T
})

const emit = defineEmits<{
  select: [item: T]
  delete: [item: T, index: number]
}>()
</script>

<template>
  <div class="list">
    <div
      v-for="(item, index) in items"
      :key="item[keyField]"
      @click="emit('select', item)"
    >
      <slot :item="item" :index="index"></slot>
    </div>
  </div>
</template>
```

## 组件注册和使用

### 自动导入机制

项目配置了组件自动导入，无需手动注册即可使用。自动导入的组件包括：

1. **Element Plus 组件** - 如 `ElButton`、`ElDialog` 等
2. **项目自定义组件** - `src/components` 目录下的所有组件
3. **图标组件** - `Icon`、`IconSelect` 等

**自动导入原理：**

项目使用 `unplugin-vue-components` 插件实现自动导入功能。当在模板中使用组件时，插件会自动查找并导入对应的组件。

**直接使用组件：**

```vue
<template>
  <div>
    <!-- 无需导入，直接使用 -->
    <ADataCard :data-list="dataList" />
    <ASearchForm v-model="queryParams" />
    <Icon code="user" />
  </div>
</template>

<script setup lang="ts">
// 不需要 import 组件
const dataList = ref([])
const queryParams = ref({})
</script>
```

### 手动导入

某些情况下，你可能需要手动导入组件：

```vue
<template>
  <div>
    <MyCustomComponent />
  </div>
</template>

<script setup lang="ts">
import MyCustomComponent from '@/components/MyCustomComponent/MyCustomComponent.vue'
</script>
```

### 动态组件

```vue
<template>
  <component :is="currentComponent" v-bind="componentProps" />
</template>

<script setup lang="ts">
import { shallowRef, markRaw } from 'vue'
import ComponentA from '@/components/ComponentA.vue'
import ComponentB from '@/components/ComponentB.vue'

const currentComponent = shallowRef(markRaw(ComponentA))
const componentProps = ref({})

const switchComponent = () => {
  currentComponent.value = markRaw(ComponentB)
}
</script>
```

### 异步组件

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 简单的异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
)

// 带加载状态的异步组件
const AsyncComponentWithOptions = defineAsyncComponent({
  loader: () => import('@/components/HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
</script>

<template>
  <AsyncComponent />
  <AsyncComponentWithOptions />
</template>
```

## 最佳实践

### 1. 组件职责单一

每个组件应该只负责一个功能，避免组件过于复杂。

**❌ 不推荐：**

```vue
<!-- 一个组件做太多事情 -->
<template>
  <div>
    <el-form>...</el-form>
    <el-table>...</el-table>
    <el-pagination>...</el-pagination>
    <el-dialog>...</el-dialog>
  </div>
</template>
```

**✅ 推荐：**

```vue
<!-- 拆分为多个组件 -->
<template>
  <div>
    <UserSearchForm v-model="queryParams" @search="handleSearch" />
    <UserTable :data="userList" @edit="handleEdit" />
    <UserDialog v-model="dialogVisible" :user="currentUser" />
  </div>
</template>
```

### 2. Props 验证和文档

始终为 Props 添加类型定义和注释：

```typescript
interface MyComponentProps {
  /**
   * 用户ID
   * @required
   */
  userId: number

  /**
   * 用户名称
   * @default ''
   */
  userName?: string

  /**
   * 是否显示
   * @default true
   */
  visible?: boolean
}
```

### 3. 使用 Composition API 复用逻辑

将可复用的逻辑提取为 Composable 函数：

```typescript
// composables/useTableSelection.ts
export function useTableSelection<T>() {
  const selectedItems = ref<T[]>([])

  const handleSelectionChange = (selection: T[]) => {
    selectedItems.value = selection
  }

  const clearSelection = () => {
    selectedItems.value = []
  }

  return {
    selectedItems,
    handleSelectionChange,
    clearSelection
  }
}
```

**使用 Composable：**

```vue
<script setup lang="ts">
import { useTableSelection } from '@/composables/useTableSelection'

const { selectedItems, handleSelectionChange, clearSelection } = useTableSelection()
</script>

<template>
  <el-table @selection-change="handleSelectionChange">
    <!-- ... -->
  </el-table>
</template>
```

### 4. 优化性能

**使用 `v-once` 渲染静态内容：**

```vue
<template>
  <div v-once>
    <h1>{{ staticTitle }}</h1>
    <p>这段内容不会更新</p>
  </div>
</template>
```

**使用 `v-memo` 缓存列表项：**

```vue
<template>
  <div
    v-for="item in list"
    :key="item.id"
    v-memo="[item.id, item.status]"
  >
    {{ item.name }} - {{ item.status }}
  </div>
</template>
```

**使用 `shallowRef` 和 `shallowReactive`：**

```typescript
import { shallowRef, shallowReactive } from 'vue'

// 对于大型对象，使用 shallow 版本
const largeData = shallowRef({
  // 大量数据...
})

const config = shallowReactive({
  // 配置项...
})
```

### 5. 错误处理

添加适当的错误处理和边界条件检查：

```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue'

interface Props {
  data: any[]
}

const props = defineProps<Props>()

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err, info)
  return false // 阻止错误继续传播
})

// 安全的计算属性
const safeData = computed(() => {
  if (!Array.isArray(props.data)) {
    console.warn('data 应该是数组类型')
    return []
  }
  return props.data
})
</script>
```

## 常见问题

### 1. 组件无法自动导入

**问题原因：**
- 组件文件名与组件 name 不一致
- 组件未放在 `src/components` 目录下
- 组件文件名不符合 PascalCase 命名规范

**解决方案：**

```vue
<!-- 确保文件名和组件名一致 -->
<!-- 文件名: MyComponent.vue -->
<script setup lang="ts" name="MyComponent">
// 组件逻辑
</script>
```

```
<!-- 确保目录结构正确 -->
src/
└── components/
    └── MyComponent/
        └── MyComponent.vue  ✅
```

### 2. Props 类型推导错误

**问题原因：**
- 未使用 `defineProps` 的泛型语法
- Props 接口定义不完整

**解决方案：**

```typescript
// ❌ 错误：缺少类型定义
const props = defineProps({
  title: String,
  count: Number
})

// ✅ 正确：使用 TypeScript 接口
interface MyComponentProps {
  title: string
  count: number
}

const props = defineProps<MyComponentProps>()
```

### 3. 样式不生效

**问题原因：**
- 使用了 `scoped` 但样式未正确应用
- CSS 变量未定义或拼写错误
- 样式优先级问题

**解决方案：**

```vue
<style lang="scss" scoped>
// ✅ 使用深度选择器影响子组件
.my-component {
  :deep(.el-input__inner) {
    background-color: #f5f5f5;
  }
}

// ✅ 使用全局样式
:global(.global-class) {
  color: red;
}

// ✅ 使用 CSS 变量
.text {
  color: var(--el-text-color-primary);
}
</style>
```

### 4. 响应式数据失效

**问题原因：**
- 直接修改 Props
- 使用了非响应式的数据结构
- 错误的解构响应式对象

**解决方案：**

```typescript
// ❌ 错误：直接修改 Props
const props = defineProps<{ count: number }>()
props.count++ // 不允许

// ✅ 正确：使用本地状态
const localCount = ref(props.count)
localCount.value++

// ❌ 错误：解构丢失响应性
const { count } = toRefs(props)
const value = count.value // 只获取当前值

// ✅ 正确：保持响应性
const count = toRef(props, 'count')
watch(count, (newValue) => {
  console.log('count 变化:', newValue)
})
```

### 5. 事件未触发

**问题原因：**
- 事件名称大小写错误
- 使用了 `.native` 修饰符（Vue 3 已移除）
- 事件监听器绑定错误

**解决方案：**

```vue
<!-- ❌ 错误：事件名大小写 -->
<MyComponent @Click="handleClick" />

<!-- ✅ 正确：使用小写 -->
<MyComponent @click="handleClick" />

<!-- ❌ 错误：使用 .native（Vue 3 已移除） -->
<MyComponent @click.native="handleClick" />

<!-- ✅ 正确：直接绑定或使用 $attrs -->
<script setup lang="ts">
import { useAttrs } from 'vue'
const attrs = useAttrs()
</script>

<template>
  <div v-bind="attrs">
    <slot></slot>
  </div>
</template>
```

### 6. 组件卡顿或性能问题

**问题原因：**
- 大量数据渲染
- 频繁的响应式更新
- 未使用虚拟滚动

**解决方案：**

```vue
<script setup lang="ts">
import { computed } from 'vue'

// ✅ 使用计算属性缓存结果
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 'active')
})

// ✅ 使用 v-memo 优化列表渲染
</script>

<template>
  <div
    v-for="item in filteredList"
    :key="item.id"
    v-memo="[item.id, item.status]"
  >
    {{ item.name }}
  </div>
</template>
```

**使用虚拟滚动：**

```vue
<template>
  <el-table-v2
    :columns="columns"
    :data="largeDataList"
    :width="800"
    :height="600"
    fixed
  />
</template>
```

## 总结

通过本指南，你已经学习了：

1. ✅ **组件基础** - Props、Events、Slots 的定义和使用
2. ✅ **组件进阶** - 响应式设计、样式定制、动画效果
3. ✅ **TypeScript** - 完整的类型定义和类型安全
4. ✅ **组件注册** - 自动导入机制和手动注册方式
5. ✅ **最佳实践** - 组件设计原则和性能优化
6. ✅ **常见问题** - 开发中的常见问题和解决方案

**下一步建议：**

- 阅读项目中已有组件的源码，学习实际应用
- 尝试编写自己的组件，实践所学知识
- 关注 Vue 3 和 Element Plus 的官方文档，了解最新特性

开始创建你的第一个自定义组件吧！🚀
