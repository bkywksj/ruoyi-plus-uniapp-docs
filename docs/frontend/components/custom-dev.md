# 自定义组件开发指南

## 介绍

RuoYi-Plus-UniApp 前端管理端提供了一套完整的组件开发规范和工具链,帮助开发者快速构建高质量的自定义业务组件。本指南详细介绍了组件开发的完整流程、最佳实践、设计模式和常见问题解决方案。

**核心特性:**

- **标准化架构** - 统一的组件结构和代码组织方式
- **TypeScript 支持** - 完整的类型定义和类型检查
- **响应式设计** - 内置响应式布局支持
- **国际化集成** - 自动处理多语言
- **主题适配** - 支持暗黑模式和自定义主题
- **性能优化** - 组件懒加载、虚拟滚动等优化手段
- **测试友好** - 易于编写单元测试和集成测试
- **文档生成** - 自动生成组件文档

## 开发环境准备

### 必要工具

```bash
# Node.js 版本要求
node -v  # >= 18.0.0

# pnpm 版本要求
pnpm -v  # >= 8.0.0

# Vue DevTools (浏览器扩展)
# Chrome/Edge: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org
```

### 项目结构

```
plus-ui/src/
├── components/              # 组件目录
│   ├── AForm/              # 表单组件系列
│   │   ├── AFormInput.vue  # 输入框组件
│   │   ├── AFormSelect.vue # 下拉选择组件
│   │   └── ...
│   ├── ACard/              # 卡片组件系列
│   ├── AChart/             # 图表组件系列
│   ├── DictTag/            # 字典标签组件
│   │   └── DictTag.vue
│   └── ...
├── composables/            # 组合式函数
│   ├── useTable.ts
│   ├── useForm.ts
│   └── ...
├── utils/                  # 工具函数
├── types/                  # 类型定义
└── styles/                 # 样式文件
```

### VS Code 配置

推荐安装以下扩展:

```json
{
  "recommendations": [
    "Vue.volar",              // Vue 3 语言支持
    "dbaeumer.vscode-eslint", // ESLint
    "esbenp.prettier-vscode", // Prettier
    "stylelint.vscode-stylelint", // StyleLint
    "lokalise.i18n-ally"      // 国际化辅助
  ]
}
```

## 组件开发规范

### 命名规范

#### 文件命名

```bash
# 组件文件名使用大驼峰 (PascalCase)
AFormInput.vue        # ✅ 正确
AFormSelect.vue       # ✅ 正确
a-form-input.vue      # ❌ 错误
aFormInput.vue        # ❌ 错误
```

#### 组件命名

```vue
<script setup lang="ts">
// 组件名称使用大驼峰,包含 A 前缀(表示 Admin)
defineOptions({
  name: 'AFormInput'  // ✅ 正确
})

// 错误示例
defineOptions({
  name: 'formInput'   // ❌ 错误: 小驼峰
  name: 'FormInput'   // ❌ 错误: 缺少 A 前缀
})
</script>
```

#### Props 命名

```typescript
interface ComponentProps {
  // 使用小驼峰命名
  modelValue: string      // ✅ 正确
  maxLength: number       // ✅ 正确
  showPassword: boolean   // ✅ 正确

  // 错误示例
  ModelValue: string      // ❌ 错误: 大驼峰
  max_length: number      // ❌ 错误: 下划线
  'show-password': boolean // ❌ 错误: 短横线
}
```

#### Events 命名

```typescript
const emit = defineEmits<{
  // 使用小驼峰命名
  'update:modelValue': [value: string]     // ✅ 正确
  'change': [value: string]                // ✅ 正确
  'beforeClose': [done: () => void]        // ✅ 正确

  // 错误示例
  'UpdateModelValue': [value: string]      // ❌ 错误: 大驼峰
  'on-change': [value: string]             // ❌ 错误: 短横线
}>()
```

### 组件结构模板

```vue
<template>
  <div :class="rootClass" :style="rootStyle">
    <!-- 组件内容 -->
    <slot />
  </div>
</template>

<script setup lang="ts" name="ComponentName">
/**
 * 组件名称 - 组件简要说明
 *
 * 详细描述组件的功能和使用场景
 *
 * @example
 * ```vue
 * <ComponentName
 *   v-model="value"
 *   :option="option"
 *   @change="handleChange"
 * />
 * ```
 */

// ========== 导入依赖 ==========
import { computed, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

// ========== 类型定义 ==========
interface ComponentProps {
  /** Props 属性说明 */
  modelValue?: string
  /** 是否禁用 */
  disabled?: boolean
}

// ========== Props 定义 ==========
const props = withDefaults(defineProps<ComponentProps>(), {
  modelValue: '',
  disabled: false
})

// ========== Emits 定义 ==========
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

// ========== 组合式函数 ==========
const { t } = useI18n()

// ========== 响应式数据 ==========
const internalValue = ref(props.modelValue)

// ========== 计算属性 ==========
const rootClass = computed(() => ({
  'component-name': true,
  'is-disabled': props.disabled
}))

const rootStyle = computed(() => ({}))

// ========== 方法 ==========
const handleChange = (value: string) => {
  internalValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

// ========== 监听器 ==========
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

// ========== 生命周期 ==========
onMounted(() => {
  // 初始化逻辑
})

// ========== 对外暴露 ==========
defineExpose({
  // 暴露给父组件的方法和属性
})
</script>

<style lang="scss" scoped>
.component-name {
  // 组件样式

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
```

## 开发流程

### 1. 创建组件文件

```bash
# 在 components 目录下创建组件
cd src/components

# 创建组件目录(如果需要多个文件)
mkdir AMyComponent

# 创建组件文件
touch AMyComponent/AMyComponent.vue
touch AMyComponent/types.ts
touch AMyComponent/index.ts
```

### 2. 定义组件接口

```typescript
// types.ts
/**
 * 组件属性接口
 */
export interface AMyComponentProps {
  /** 绑定值 */
  modelValue?: string
  /** 标签文本 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符 */
  placeholder?: string
}

/**
 * 组件事件接口
 */
export interface AMyComponentEmits {
  /** 值更新事件 */
  (e: 'update:modelValue', value: string): void
  /** 值变化事件 */
  (e: 'change', value: string): void
  /** 失去焦点事件 */
  (e: 'blur', event: FocusEvent): void
}

/**
 * 组件暴露的方法接口
 */
export interface AMyComponentExpose {
  /** 聚焦输入框 */
  focus: () => void
  /** 失焦输入框 */
  blur: () => void
  /** 清空输入 */
  clear: () => void
}
```

### 3. 实现组件逻辑

```vue
<template>
  <el-form-item :label="computedLabel" :required="required">
    <el-input
      ref="inputRef"
      v-model="internalValue"
      :placeholder="computedPlaceholder"
      :disabled="disabled"
      :clearable="clearable"
      @change="handleChange"
      @blur="handleBlur"
    />
  </el-form-item>
</template>

<script setup lang="ts" name="AMyComponent">
import type { AMyComponentProps, AMyComponentEmits, AMyComponentExpose } from './types'

const props = withDefaults(defineProps<AMyComponentProps>(), {
  modelValue: '',
  required: false,
  disabled: false,
  clearable: true
})

const emit = defineEmits<AMyComponentEmits>()

const { t } = useI18n()

// 输入框引用
const inputRef = ref<ElInputInstance>()

// 内部值
const internalValue = ref(props.modelValue)

// 计算标签
const computedLabel = computed(() => {
  return props.label || t('defaultLabel')
})

// 计算占位符
const computedPlaceholder = computed(() => {
  return props.placeholder || `${t('placeholder.input')}${computedLabel.value}`
})

// 值变化处理
const handleChange = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 失焦处理
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// 聚焦方法
const focus = () => {
  inputRef.value?.focus()
}

// 失焦方法
const blur = () => {
  inputRef.value?.blur()
}

// 清空方法
const clear = () => {
  internalValue.value = ''
  handleChange('')
}

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

// 暴露方法
defineExpose<AMyComponentExpose>({
  focus,
  blur,
  clear
})
</script>

<style lang="scss" scoped>
// 组件样式
</style>
```

### 4. 导出组件

```typescript
// index.ts
import AMyComponent from './AMyComponent.vue'
import type { AMyComponentProps, AMyComponentEmits, AMyComponentExpose } from './types'

export { AMyComponent }
export type { AMyComponentProps, AMyComponentEmits, AMyComponentExpose }
export default AMyComponent
```

### 5. 注册组件

```typescript
// main.ts 或组件注册文件
import { createApp } from 'vue'
import AMyComponent from '@/components/AMyComponent'

const app = createApp(App)

// 全局注册
app.component('AMyComponent', AMyComponent)

// 或在需要的组件中局部引入
// import AMyComponent from '@/components/AMyComponent'
```

## 高级特性

### 响应式布局

实现响应式 span 属性:

```vue
<script setup lang="ts">
import { useResponsive } from '@/composables/useResponsive'

interface Props {
  /** 栅格占据列数 */
  span?: number | SpanType
}

const props = withDefaults(defineProps<Props>(), {
  span: 24
})

// 使用响应式 composable
const { computedSpan } = useResponsive(props)

// computedSpan 会根据屏幕尺寸自动计算
</script>

<template>
  <el-col :span="computedSpan">
    <!-- 组件内容 -->
  </el-col>
</template>
```

### 国际化支持

```vue
<script setup lang="ts">
const { t } = useI18n()

interface Props {
  label?: string
  prop?: string
}

const props = defineProps<Props>()

// 自动国际化标签
const computedLabel = computed(() => {
  // 优先使用 prop 字段作为国际化 key
  // 如果翻译不存在,回退到 label
  return t(props.prop || props.label || '', props.label || '')
})

// 占位符国际化
const placeholder = computed(() => {
  return `${t('placeholder.input')}${computedLabel.value}`
})
</script>

<template>
  <el-form-item :label="computedLabel">
    <el-input :placeholder="placeholder" />
  </el-form-item>
</template>
```

### 主题适配

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, theme } = useTheme()

const rootStyle = computed(() => ({
  '--component-bg': isDark.value ? theme.value.colors.dark.bg : theme.value.colors.light.bg,
  '--component-text': isDark.value ? theme.value.colors.dark.text : theme.value.colors.light.text
}))
</script>

<template>
  <div class="my-component" :style="rootStyle">
    <!-- 组件内容 -->
  </div>
</template>

<style lang="scss" scoped>
.my-component {
  background-color: var(--component-bg);
  color: var(--component-text);
}
</style>
```

### 表单集成

```vue
<script setup lang="ts">
import { inject } from 'vue'
import type { FormContext } from 'element-plus'

interface Props {
  prop?: string
}

const props = defineProps<Props>()

// 注入表单上下文
const formContext = inject<FormContext | undefined>('formContext', undefined)

// 触发表单验证
const validate = () => {
  if (formContext && props.prop) {
    formContext.validateField([props.prop])
  }
}

// 值变化时触发验证
const handleChange = (value: any) => {
  emit('update:modelValue', value)
  emit('change', value)

  nextTick(() => {
    validate()
  })
}
</script>
```

### 性能优化

#### 1. 使用 v-memo 优化渲染

```vue
<template>
  <div v-memo="[value, disabled]">
    <!-- 只有 value 或 disabled 变化时才重新渲染 -->
    <el-input v-model="value" :disabled="disabled" />
  </div>
</template>
```

#### 2. 懒加载子组件

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 懒加载重型子组件
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<template>
  <Suspense>
    <template #default>
      <HeavyComponent />
    </template>
    <template #fallback>
      <el-skeleton :rows="5" />
    </template>
  </Suspense>
</template>
```

#### 3. 虚拟滚动

```vue
<script setup lang="ts">
import { VirtualList } from '@/components/VirtualList'

const items = ref(new Array(10000).fill(0).map((_, i) => ({ id: i, text: `Item ${i}` })))
</script>

<template>
  <VirtualList
    :items="items"
    :item-height="48"
    :buffer="5"
  >
    <template #default="{ item }">
      <div class="list-item">{{ item.text }}</div>
    </template>
  </VirtualList>
</template>
```

## 实战案例

### 案例 1: 开发一个用户选择器组件

#### 需求分析

- 支持单选/多选
- 支持搜索过滤
- 支持分页
- 支持部门树过滤
- 支持显示已选用户标签

#### 实现步骤

**Step 1: 定义类型**

```typescript
// UserPicker/types.ts
export interface UserPickerProps {
  /** 绑定值 */
  modelValue?: string | string[]
  /** 是否多选 */
  multiple?: boolean
  /** 是否显示内联标签 */
  showInlineTags?: boolean
  /** 限制可选用户范围 */
  userIds?: string[]
}

export interface UserPickerEmits {
  (e: 'update:modelValue', value: string | string[]): void
  (e: 'change', value: string | string[]): void
}

export interface User {
  userId: string
  userName: string
  nickName: string
  deptName: string
}
```

**Step 2: 实现组件**

```vue
<template>
  <div class="user-picker">
    <!-- 已选标签 -->
    <div v-if="showInlineTags && displayUsers.length > 0" class="selected-tags">
      <el-tag
        v-for="user in displayUsers"
        :key="user.userId"
        closable
        @close="removeUser(user.userId)"
      >
        {{ user.nickName || user.userName }}
      </el-tag>
    </div>

    <!-- 选择按钮 -->
    <el-button @click="openDialog">
      选择用户
    </el-button>

    <!-- 选择对话框 -->
    <AModal v-model="dialogVisible" title="选择用户" size="large" @confirm="confirm">
      <el-row :gutter="20">
        <!-- 左侧部门树 -->
        <el-col :span="6">
          <el-input v-model="deptFilter" placeholder="搜索部门" clearable />
          <el-tree
            ref="deptTreeRef"
            :data="deptTree"
            :filter-node-method="filterDeptNode"
            @node-click="handleDeptClick"
          />
        </el-col>

        <!-- 右侧用户列表 -->
        <el-col :span="18">
          <!-- 搜索条件 -->
          <ASearchForm v-model="queryParams">
            <AFormInput label="用户名" v-model="queryParams.userName" />
            <AFormInput label="手机号" v-model="queryParams.phone" />
          </ASearchForm>

          <!-- 用户表格 -->
          <el-table
            ref="tableRef"
            :data="userList"
            @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="multiple" type="selection" width="50" />
            <el-table-column v-else width="50">
              <template #default="{ row }">
                <el-radio v-model="selectedUserId" :value="row.userId" />
              </template>
            </el-table-column>
            <el-table-column label="用户名" prop="userName" />
            <el-table-column label="昵称" prop="nickName" />
            <el-table-column label="部门" prop="deptName" />
          </el-table>

          <!-- 分页 -->
          <Pagination
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            @pagination="getList"
          />
        </el-col>
      </el-row>
    </AModal>
  </div>
</template>

<script setup lang="ts" name="UserPicker">
import type { UserPickerProps, UserPickerEmits, User } from './types'
import { pageUsers } from '@/api/system/user'
import { getDeptTree } from '@/api/system/dept'

const props = withDefaults(defineProps<UserPickerProps>(), {
  multiple: false,
  showInlineTags: false
})

const emit = defineEmits<UserPickerEmits>()

// 对话框可见性
const dialogVisible = ref(false)

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phone: '',
  deptId: ''
})

// 用户列表
const userList = ref<User[]>([])
const total = ref(0)

// 部门树
const deptTree = ref([])
const deptFilter = ref('')

// 选中的用户
const selectedUsers = ref<User[]>([])
const selectedUserId = ref('')

// 表格引用
const tableRef = ref()

// 显示的用户标签
const displayUsers = computed(() => {
  return selectedUsers.value
})

// 打开对话框
const openDialog = () => {
  dialogVisible.value = true
  getList()
  loadDeptTree()
}

// 获取用户列表
const getList = async () => {
  const [err, data] = await pageUsers(queryParams.value)
  if (!err) {
    userList.value = data.records
    total.value = data.total

    // 恢复选中状态
    nextTick(() => {
      syncSelection()
    })
  }
}

// 加载部门树
const loadDeptTree = async () => {
  const [err, data] = await getDeptTree()
  if (!err) {
    deptTree.value = data
  }
}

// 部门树过滤
const filterDeptNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

// 部门节点点击
const handleDeptClick = (data: any) => {
  queryParams.value.deptId = data.id
  getList()
}

// 选择变化
const handleSelectionChange = (selection: User[]) => {
  if (props.multiple) {
    selectedUsers.value = selection
  }
}

// 单选变化
watch(selectedUserId, (userId) => {
  if (!props.multiple && userId) {
    const user = userList.value.find(u => u.userId === userId)
    if (user) {
      selectedUsers.value = [user]
    }
  }
})

// 同步选中状态
const syncSelection = () => {
  selectedUsers.value.forEach(user => {
    const row = userList.value.find(u => u.userId === user.userId)
    if (row) {
      tableRef.value?.toggleRowSelection(row, true)
    }
  })

  if (!props.multiple && selectedUsers.value.length > 0) {
    selectedUserId.value = selectedUsers.value[0].userId
  }
}

// 移除用户
const removeUser = (userId: string) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.userId !== userId)
  updateModelValue()
}

// 确认选择
const confirm = () => {
  updateModelValue()
  dialogVisible.value = false
}

// 更新 modelValue
const updateModelValue = () => {
  if (props.multiple) {
    const userIds = selectedUsers.value.map(u => u.userId)
    emit('update:modelValue', userIds)
    emit('change', userIds)
  } else {
    const userId = selectedUsers.value[0]?.userId || ''
    emit('update:modelValue', userId)
    emit('change', userId)
  }
}

// 监听部门过滤
watch(deptFilter, (val) => {
  // 触发树过滤
})

// 初始化选中用户
watch(() => props.modelValue, (val) => {
  if (val) {
    // 根据 modelValue 加载用户信息
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.user-picker {
  .selected-tags {
    margin-bottom: 8px;

    .el-tag {
      margin-right: 8px;
      margin-bottom: 4px;
    }
  }
}
</style>
```

### 案例 2: 开发一个统计卡片组件

```vue
<template>
  <el-card class="stats-card" shadow="hover">
    <div class="stats-content">
      <!-- 图标区域 -->
      <div class="icon-wrapper" :style="iconStyle">
        <Icon :code="icon" :size="32" />
      </div>

      <!-- 数据区域 -->
      <div class="data-wrapper">
        <div class="title">{{ title }}</div>
        <div class="value">
          <count-to :start-val="0" :end-val="value" :duration="1000" />
          <span v-if="unit" class="unit">{{ unit }}</span>
        </div>
        <div class="trend" :class="trendClass">
          <Icon :code="trendIcon" :size="14" />
          <span>{{ trend }}</span>
          <span class="label">{{ trendLabel }}</span>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div v-if="$slots.footer" class="stats-footer">
      <slot name="footer" />
    </div>
  </el-card>
</template>

<script setup lang="ts" name="AStatsCard">
import CountTo from '@/components/CountTo'

interface Props {
  /** 标题 */
  title: string
  /** 数值 */
  value: number
  /** 单位 */
  unit?: string
  /** 图标 */
  icon: string
  /** 图标颜色 */
  iconColor?: string
  /** 趋势值 */
  trend?: number
  /** 趋势标签 */
  trendLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  iconColor: '#409eff',
  trend: 0,
  trendLabel: '较上周'
})

// 图标样式
const iconStyle = computed(() => ({
  backgroundColor: `${props.iconColor}20`,
  color: props.iconColor
}))

// 趋势类名
const trendClass = computed(() => ({
  'trend-up': props.trend > 0,
  'trend-down': props.trend < 0,
  'trend-flat': props.trend === 0
}))

// 趋势图标
const trendIcon = computed(() => {
  if (props.trend > 0) return 'arrow-up'
  if (props.trend < 0) return 'arrow-down'
  return 'minus'
})
</script>

<style lang="scss" scoped>
.stats-card {
  .stats-content {
    display: flex;
    gap: 16px;

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .data-wrapper {
      flex: 1;

      .title {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }

      .value {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);

        .unit {
          font-size: 14px;
          margin-left: 4px;
        }
      }

      .trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        margin-top: 8px;

        &.trend-up {
          color: var(--el-color-success);
        }

        &.trend-down {
          color: var(--el-color-danger);
        }

        &.trend-flat {
          color: var(--el-color-info);
        }

        .label {
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .stats-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
```

## 测试

### 单元测试

```typescript
// AMyComponent.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import AMyComponent from './AMyComponent.vue'

describe('AMyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(AMyComponent, {
      props: {
        modelValue: 'test'
      }
    })

    expect(wrapper.find('input').element.value).toBe('test')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(AMyComponent)
    const input = wrapper.find('input')

    await input.setValue('new value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
  })

  it('applies disabled state', () => {
    const wrapper = mount(AMyComponent, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.find('input').element.disabled).toBe(true)
  })
})
```

### 集成测试

```typescript
// UserPicker.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import UserPicker from './UserPicker.vue'
import * as userApi from '@/api/system/user'

vi.mock('@/api/system/user')

describe('UserPicker Integration', () => {
  it('loads and displays users', async () => {
    const mockUsers = [
      { userId: '1', userName: 'user1', nickName: '用户1' },
      { userId: '2', userName: 'user2', nickName: '用户2' }
    ]

    vi.spyOn(userApi, 'pageUsers').mockResolvedValue([null, {
      records: mockUsers,
      total: 2
    }])

    const wrapper = mount(UserPicker)

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('.el-table__row')
    expect(rows).toHaveLength(2)
  })
})
```

## 最佳实践

### 1. Props 设计原则

**单一职责**

```typescript
// ❌ 不好: Props 过多,职责不清
interface BadProps {
  value: string
  label: string
  placeholder: string
  type: string
  size: string
  disabled: boolean
  readonly: boolean
  clearable: boolean
  showPassword: boolean
  prefixIcon: string
  suffixIcon: string
  // ... 更多
}

// ✅ 好: 拆分为多个专注的组件
interface GoodInputProps {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}

interface GoodFormItemProps {
  label: string
  prop: string
  required?: boolean
}
```

**默认值合理**

```typescript
// ✅ 提供合理的默认值
const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  clearable: true,
  disabled: false,
  placeholder: '请输入'
})
```

**类型明确**

```typescript
// ❌ 不好: 类型过于宽泛
interface BadProps {
  value: any
  options: any[]
}

// ✅ 好: 类型明确
interface GoodProps {
  modelValue: string | number
  options: Array<{ label: string; value: string | number }>
}
```

### 2. 事件设计原则

**命名清晰**

```typescript
// ✅ 清晰的事件命名
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'clear': []
}>()
```

**参数完整**

```typescript
// ❌ 不好: 参数不完整
emit('change', newValue)

// ✅ 好: 提供完整上下文
emit('change', {
  value: newValue,
  oldValue: oldValue,
  event: originalEvent
})
```

### 3. 插槽设计原则

**命名语义化**

```vue
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

**提供作用域插槽**

```vue
<template>
  <div class="list">
    <div v-for="item in items" :key="item.id">
      <slot :item="item" :index="index">
        {{ item.label }}
      </slot>
    </div>
  </div>
</template>
```

### 4. 样式隔离

**使用 scoped**

```vue
<style lang="scss" scoped>
.my-component {
  // 样式只作用于当前组件
}
</style>
```

**CSS Variables 传递主题**

```vue
<script setup lang="ts">
const rootStyle = computed(() => ({
  '--primary-color': theme.value.primary,
  '--border-radius': '4px'
}))
</script>

<template>
  <div class="component" :style="rootStyle">
    <!-- 内容 -->
  </div>
</template>

<style scoped>
.component {
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius);
}
</style>
```

### 5. 性能优化

**避免不必要的响应式**

```typescript
// ❌ 不好: 不需要响应式的数据也用 ref
const staticConfig = ref({ a: 1, b: 2 })

// ✅ 好: 静态数据直接定义
const staticConfig = { a: 1, b: 2 }
```

**使用 computed 缓存计算结果**

```typescript
// ❌ 不好: 每次渲染都重新计算
const getLabel = () => {
  return props.options.find(o => o.value === props.modelValue)?.label
}

// ✅ 好: 使用 computed 缓存
const label = computed(() => {
  return props.options.find(o => o.value === props.modelValue)?.label
})
```

**合理使用 watch**

```typescript
// ❌ 不好: 不必要的 deep watch
watch(
  () => props.config,
  () => { /* ... */ },
  { deep: true }
)

// ✅ 好: 只监听需要的属性
watch(
  () => props.config.enabled,
  () => { /* ... */ }
)
```

## 常见问题

### 1. v-model 不工作

**问题原因**:
- 没有正确实现 `update:modelValue` 事件
- Props 和 emit 命名不一致

**解决方案**:

```vue
<script setup lang="ts">
// ✅ 正确的 v-model 实现
interface Props {
  modelValue: string  // 必须是 modelValue
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]  // 必须是 update:modelValue
}>()

// 内部值
const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <el-input v-model="internalValue" />
</template>
```

### 2. 组件样式被覆盖

**问题原因**:
- 没有使用 scoped
- 样式优先级不够

**解决方案**:

```vue
<style lang="scss" scoped>
/* 使用 scoped 隔离样式 */
.my-component {
  // 组件样式
}

/* 如果需要覆盖子组件样式,使用 :deep() */
:deep(.el-input__inner) {
  border-color: red;
}
</style>
```

### 3. 组件不响应 props 变化

**问题原因**:
- 没有监听 props 变化
- 使用了错误的引用

**解决方案**:

```typescript
// ✅ 使用 watch 监听 props
watch(
  () => props.modelValue,
  (newVal) => {
    internalValue.value = newVal
  }
)

// 或使用 computed
const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
```

### 4. 插槽内容不显示

**问题原因**:
- 插槽名称错误
- 条件渲染导致插槽不可见

**解决方案**:

```vue
<template>
  <!-- 确保插槽容器始终渲染 -->
  <div class="slot-container">
    <slot />
  </div>

  <!-- 使用 v-if 时,确保条件正确 -->
  <div v-if="$slots.footer">
    <slot name="footer" />
  </div>
</template>
```

### 5. 组件内存泄漏

**问题原因**:
- 事件监听器未移除
- 定时器未清除
- DOM 引用未释放

**解决方案**:

```typescript
// ✅ 正确清理副作用
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)

  // 清除定时器
  if (timer) {
    clearTimeout(timer)
  }

  // 释放 DOM 引用
  element = null
})
```

## 总结

自定义组件开发是前端开发中的重要技能。遵循本指南的规范和最佳实践,可以帮助你:

1. **提高代码质量** - 统一的结构和命名规范
2. **提升开发效率** - 复用组件模板和工具函数
3. **减少 Bug** - 完善的类型定义和测试
4. **优化性能** - 合理的响应式设计和优化手段
5. **便于维护** - 清晰的文档和注释

**核心要点:**

- ✅ 遵循命名规范,保持一致性
- ✅ 完善的 TypeScript 类型定义
- ✅ 合理的 Props、Events、Slots 设计
- ✅ 响应式布局和国际化支持
- ✅ 性能优化和内存管理
- ✅ 完整的单元测试和文档

记住:优秀的组件不仅要功能完整,更要易于使用、易于维护、易于扩展。
