# useForm 表单管理

表单数据管理组合函数，提供表单验证、数据处理、提交等完整的表单操作功能。

## 📋 基础用法

### 简单表单

```vue
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="formData.username"
        placeholder="请输入用户名"
        clearable
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="formData.email"
        placeholder="请输入邮箱"
        clearable
      />
    </el-form-item>

    <el-form-item label="手机号" prop="phone">
      <el-input
        v-model="formData.phone"
        placeholder="请输入手机号"
        clearable
      />
    </el-form-item>

    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="formData.status">
        <el-radio value="0">正常</el-radio>
        <el-radio value="1">停用</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="角色" prop="roleIds">
      <el-select
        v-model="formData.roleIds"
        placeholder="请选择角色"
        multiple
        clearable
      >
        <el-option
          v-for="role in roleOptions"
          :key="role.value"
          :label="role.label"
          :value="role.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="formData.remark"
        type="textarea"
        :rows="4"
        placeholder="请输入备注"
      />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        提交
      </el-button>
      <el-button @click="handleReset">
        重置
      </el-button>
      <el-button @click="handleCancel">
        取消
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { useForm } from '@/composables/use-form'
import { addUser, updateUser } from '@/api/system/user'

// 表单数据类型
interface UserForm {
  id?: number
  username: string
  email: string
  phone: string
  status: string
  roleIds: number[]
  remark?: string
}

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const {
  // 表单状态
  formRef,
  formData,
  formRules: rules,
  submitLoading,

  // 表单方法
  handleSubmit,
  handleReset,
  validateForm,
  setFormData,
  resetFormData
} = useForm<UserForm>({
  // 默认数据
  defaultData: {
    username: '',
    email: '',
    phone: '',
    status: '0',
    roleIds: [],
    remark: ''
  },

  // 验证规则
  rules: formRules,

  // 提交处理
  onSubmit: async (data) => {
    if (data.id) {
      await updateUser(data)
    } else {
      await addUser(data)
    }
  },

  // 提交成功回调
  onSuccess: () => {
    ElMessage.success('操作成功')
    handleCancel()
  },

  // 提交失败回调
  onError: (error) => {
    ElMessage.error(error.message || '操作失败')
  }
})

// 角色选项
const roleOptions = ref([
  { label: '管理员', value: 1 },
  { label: '普通用户', value: 2 }
])

// 取消操作
const handleCancel = () => {
  console.log('取消操作')
}

// 如果是编辑模式，设置初始数据
onMounted(() => {
  const editData = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    phone: '13888888888',
    status: '0',
    roleIds: [1],
    remark: '管理员用户'
  }
  setFormData(editData)
})
</script>
```

## 🎯 核心功能

### useForm 实现

```typescript
// composables/use-form.ts
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

export interface FormConfig<T = any> {
  // 默认数据
  defaultData: T

  // 验证规则
  rules?: FormRules

  // 提交处理函数
  onSubmit?: (data: T) => Promise<any>

  // 成功回调
  onSuccess?: (result: any) => void

  // 失败回调
  onError?: (error: any) => void

  // 验证失败回调
  onValidateError?: (errors: any) => void

  // 提交前处理
  beforeSubmit?: (data: T) => T | Promise<T>

  // 自动重置
  autoReset?: boolean

  // 显示消息
  showMessage?: boolean
}

export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const {
    defaultData,
    rules,
    onSubmit,
    onSuccess,
    onError,
    onValidateError,
    beforeSubmit,
    autoReset = false,
    showMessage = true
  } = config

  // 表单引用
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<T>({ ...defaultData })

  // 提交状态
  const submitLoading = ref(false)

  // 验证状态
  const validating = ref(false)

  // 表单验证规则
  const formRules = computed(() => rules)

  // 表单是否有变更
  const isDirty = computed(() => {
    return JSON.stringify(formData) !== JSON.stringify(defaultData)
  })

  /**
   * 验证表单
   */
  const validateForm = async (): Promise<boolean> => {
    if (!formRef.value) return false

    validating.value = true

    try {
      await formRef.value.validate()
      return true
    } catch (errors) {
      if (showMessage) {
        ElMessage.error('表单验证失败，请检查输入')
      }
      onValidateError?.(errors)
      return false
    } finally {
      validating.value = false
    }
  }

  /**
   * 验证指定字段
   */
  const validateField = async (field: keyof T): Promise<boolean> => {
    if (!formRef.value) return false

    try {
      await formRef.value.validateField(field as string)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 清除验证结果
   */
  const clearValidate = (fields?: (keyof T)[]) => {
    if (!formRef.value) return

    if (fields) {
      formRef.value.clearValidate(fields as string[])
    } else {
      formRef.value.clearValidate()
    }
  }

  /**
   * 设置表单数据
   */
  const setFormData = (data: Partial<T>) => {
    Object.assign(formData, data)
  }

  /**
   * 重置表单数据
   */
  const resetFormData = () => {
    Object.assign(formData, defaultData)
    clearValidate()
  }

  /**
   * 重置表单
   */
  const handleReset = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    } else {
      resetFormData()
    }
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!onSubmit) {
      console.warn('未配置提交处理函数')
      return
    }

    // 验证表单
    const isValid = await validateForm()
    if (!isValid) return

    submitLoading.value = true

    try {
      // 处理提交前数据
      let submitData = { ...formData }
      if (beforeSubmit) {
        submitData = await beforeSubmit(submitData)
      }

      // 执行提交
      const result = await onSubmit(submitData)

      // 成功回调
      onSuccess?.(result)

      // 自动重置
      if (autoReset) {
        handleReset()
      }

      return result
    } catch (error) {
      console.error('表单提交失败:', error)
      onError?.(error)
      throw error
    } finally {
      submitLoading.value = false
    }
  }

  /**
   * 获取表单数据
   */
  const getFormData = (): T => {
    return { ...formData }
  }

  /**
   * 获取变更的字段
   */
  const getChangedFields = (): Partial<T> => {
    const changed: Partial<T> = {}

    Object.keys(formData).forEach(key => {
      if (formData[key] !== defaultData[key]) {
        changed[key] = formData[key]
      }
    })

    return changed
  }

  return {
    // 表单状态
    formRef,
    formData,
    formRules,
    submitLoading,
    validating,
    isDirty,

    // 验证方法
    validateForm,
    validateField,
    clearValidate,

    // 数据操作
    setFormData,
    resetFormData,
    getFormData,
    getChangedFields,

    // 表单操作
    handleSubmit,
    handleReset
  }
}
```

## 🔄 高级功能

### 动态表单

```typescript
// composables/use-dynamic-form.ts
export interface FormField {
  key: string
  label: string
  type: 'input' | 'select' | 'radio' | 'checkbox' | 'date' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  rules?: any[]
  props?: Record<string, any>
  visible?: boolean | ((formData: any) => boolean)
  disabled?: boolean | ((formData: any) => boolean)
}

export function useDynamicForm(fields: Ref<FormField[]>) {
  const formData = reactive<Record<string, any>>({})
  const formRules = computed(() => {
    const rules: Record<string, any> = {}

    fields.value.forEach(field => {
      if (field.required || field.rules) {
        rules[field.key] = [
          ...(field.required ? [{ required: true, message: `请输入${field.label}`, trigger: 'blur' }] : []),
          ...(field.rules || [])
        ]
      }
    })

    return rules
  })

  // 可见字段
  const visibleFields = computed(() => {
    return fields.value.filter(field => {
      if (typeof field.visible === 'function') {
        return field.visible(formData)
      }
      return field.visible !== false
    })
  })

  // 字段是否禁用
  const isFieldDisabled = (field: FormField) => {
    if (typeof field.disabled === 'function') {
      return field.disabled(formData)
    }
    return field.disabled === true
  }

  // 初始化表单数据
  const initFormData = () => {
    fields.value.forEach(field => {
      if (!(field.key in formData)) {
        formData[field.key] = getDefaultValue(field.type)
      }
    })
  }

  // 获取默认值
  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'checkbox':
        return []
      case 'radio':
      case 'select':
        return ''
      default:
        return ''
    }
  }

  // 监听字段变化，初始化新字段
  watch(fields, () => {
    initFormData()
  }, { immediate: true, deep: true })

  return {
    formData,
    formRules,
    visibleFields,
    isFieldDisabled,
    initFormData
  }
}
```

### 表单联动

```typescript
// composables/use-form-linkage.ts
export interface LinkageRule {
  trigger: string // 触发字段
  target: string // 目标字段
  condition: (value: any, formData: any) => boolean
  action: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'setOptions'
  value?: any
  options?: any[]
}

export function useFormLinkage(
  formData: any,
  rules: LinkageRule[]
) {
  const fieldStates = reactive<Record<string, {
    visible: boolean
    disabled: boolean
    options: any[]
  }>>({})

  // 初始化字段状态
  const initFieldStates = () => {
    rules.forEach(rule => {
      if (!fieldStates[rule.target]) {
        fieldStates[rule.target] = {
          visible: true,
          disabled: false,
          options: []
        }
      }
    })
  }

  // 执行联动规则
  const executeRules = (changedField?: string) => {
    rules.forEach(rule => {
      // 如果指定了变更字段，只处理相关规则
      if (changedField && rule.trigger !== changedField) {
        return
      }

      const triggerValue = formData[rule.trigger]
      const shouldExecute = rule.condition(triggerValue, formData)

      if (shouldExecute) {
        executeAction(rule)
      }
    })
  }

  // 执行动作
  const executeAction = (rule: LinkageRule) => {
    const targetState = fieldStates[rule.target]

    switch (rule.action) {
      case 'show':
        targetState.visible = true
        break
      case 'hide':
        targetState.visible = false
        break
      case 'enable':
        targetState.disabled = false
        break
      case 'disable':
        targetState.disabled = true
        break
      case 'setValue':
        formData[rule.target] = rule.value
        break
      case 'setOptions':
        targetState.options = rule.options || []
        break
    }
  }

  // 监听表单数据变化
  watch(formData, (newData, oldData) => {
    // 找出变更的字段
    const changedFields = Object.keys(newData).filter(
      key => newData[key] !== oldData?.[key]
    )

    changedFields.forEach(field => {
      executeRules(field)
    })
  }, { deep: true })

  // 初始化
  onMounted(() => {
    initFieldStates()
    executeRules()
  })

  return {
    fieldStates,
    executeRules
  }
}
```

### 表单步骤器

```typescript
// composables/use-form-steps.ts
export interface FormStep {
  key: string
  title: string
  description?: string
  fields: string[]
  rules?: Record<string, any>
  beforeNext?: (formData: any) => Promise<boolean> | boolean
  beforePrev?: (formData: any) => Promise<boolean> | boolean
}

export function useFormSteps(
  steps: FormStep[],
  formData: any,
  formRef: Ref<FormInstance | undefined>
) {
  const currentStep = ref(0)
  const stepStatuses = ref<Array<'wait' | 'process' | 'finish' | 'error'>>(
    steps.map((_, index) => index === 0 ? 'process' : 'wait')
  )

  // 当前步骤配置
  const currentStepConfig = computed(() => steps[currentStep.value])

  // 是否第一步
  const isFirstStep = computed(() => currentStep.value === 0)

  // 是否最后一步
  const isLastStep = computed(() => currentStep.value === steps.length - 1)

  // 可以下一步
  const canNext = computed(() => !isLastStep.value)

  // 可以上一步
  const canPrev = computed(() => !isFirstStep.value)

  /**
   * 验证当前步骤
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!formRef.value) return false

    const currentFields = currentStepConfig.value.fields

    try {
      await formRef.value.validateField(currentFields)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 下一步
   */
  const nextStep = async (): Promise<boolean> => {
    if (isLastStep.value) return false

    // 验证当前步骤
    const isValid = await validateCurrentStep()
    if (!isValid) {
      stepStatuses.value[currentStep.value] = 'error'
      return false
    }

    // 执行前置检查
    const beforeNext = currentStepConfig.value.beforeNext
    if (beforeNext) {
      const canProceed = await beforeNext(formData)
      if (!canProceed) return false
    }

    // 更新状态
    stepStatuses.value[currentStep.value] = 'finish'
    currentStep.value++
    stepStatuses.value[currentStep.value] = 'process'

    return true
  }

  /**
   * 上一步
   */
  const prevStep = async (): Promise<boolean> => {
    if (isFirstStep.value) return false

    // 执行前置检查
    const beforePrev = currentStepConfig.value.beforePrev
    if (beforePrev) {
      const canProceed = await beforePrev(formData)
      if (!canProceed) return false
    }

    // 更新状态
    stepStatuses.value[currentStep.value] = 'wait'
    currentStep.value--
    stepStatuses.value[currentStep.value] = 'process'

    return true
  }

  /**
   * 跳转到指定步骤
   */
  const goToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return false

    currentStep.value = stepIndex

    // 更新状态
    stepStatuses.value = steps.map((_, index) => {
      if (index < stepIndex) return 'finish'
      if (index === stepIndex) return 'process'
      return 'wait'
    })

    return true
  }

  /**
   * 重置步骤
   */
  const resetSteps = () => {
    currentStep.value = 0
    stepStatuses.value = steps.map((_, index) => index === 0 ? 'process' : 'wait')
  }

  return {
    currentStep,
    stepStatuses,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    canNext,
    canPrev,
    validateCurrentStep,
    nextStep,
    prevStep,
    goToStep,
    resetSteps
  }
}
```

## 📱 表单组件

### 动态表单渲染器

```vue
<!-- DynamicForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    :label-width="labelWidth"
    :label-position="labelPosition"
  >
    <template v-for="field in visibleFields" :key="field.key">
      <el-form-item
        :label="field.label"
        :prop="field.key"
        :required="field.required"
      >
        <!-- 输入框 -->
        <el-input
          v-if="field.type === 'input'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          :disabled="isFieldDisabled(field)"
          v-bind="field.props"
        />

        <!-- 文本域 -->
        <el-input
          v-else-if="field.type === 'textarea'"
          v-model="formData[field.key]"
          type="textarea"
          :placeholder="field.placeholder"
          :disabled="isFieldDisabled(field)"
          v-bind="field.props"
        />

        <!-- 选择器 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          :disabled="isFieldDisabled(field)"
          v-bind="field.props"
        >
          <el-option
            v-for="option in getFieldOptions(field)"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <!-- 单选框 -->
        <el-radio-group
          v-else-if="field.type === 'radio'"
          v-model="formData[field.key]"
          :disabled="isFieldDisabled(field)"
          v-bind="field.props"
        >
          <el-radio
            v-for="option in getFieldOptions(field)"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>

        <!-- 复选框 -->
        <el-checkbox-group
          v-else-if="field.type === 'checkbox'"
          v-model="formData[field.key]"
          :disabled="isFieldDisabled(field)"
          v-bind="field.props"
        >
          <el-checkbox
            v-for="option in getFieldOptions(field)"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </el-checkbox>
        </el-checkbox-group>

        <!-- 日期选择器 -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          :disabled="isFieldDisabled(field)"
          v-bind="field.props"
        />

        <!-- 自定义字段 -->
        <slot
          v-else
          :name="`field-${field.key}`"
          :field="field"
          :value="formData[field.key]"
          :disabled="isFieldDisabled(field)"
        />
      </el-form-item>
    </template>

    <slot name="footer" :form-data="formData" />
  </el-form>
</template>

<script setup lang="ts">
interface Props {
  fields: FormField[]
  modelValue?: Record<string, any>
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  linkageRules?: LinkageRule[]
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '100px',
  labelPosition: 'right'
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

// 动态表单hook
const { formData, formRules, visibleFields, isFieldDisabled } = useDynamicForm(
  toRef(props, 'fields')
)

// 表单联动hook
const { fieldStates } = useFormLinkage(
  formData,
  props.linkageRules || []
)

// 获取字段选项
const getFieldOptions = (field: FormField) => {
  const linkageState = fieldStates[field.key]
  if (linkageState?.options?.length) {
    return linkageState.options
  }
  return field.options || []
}

// 同步数据
watch(formData, (newData) => {
  emit('update:modelValue', newData)
}, { deep: true })

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    Object.assign(formData, newValue)
  }
}, { immediate: true, deep: true })

// 暴露表单方法
defineExpose({
  formRef,
  validate: () => formRef.value?.validate(),
  validateField: (field: string) => formRef.value?.validateField(field),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>
```

### 表单步骤组件

```vue
<!-- FormSteps.vue -->
<template>
  <div class="form-steps">
    <!-- 步骤指示器 -->
    <el-steps
      :active="currentStep"
      finish-status="success"
      align-center
    >
      <el-step
        v-for="(step, index) in steps"
        :key="step.key"
        :title="step.title"
        :description="step.description"
        :status="stepStatuses[index]"
      />
    </el-steps>

    <!-- 表单内容 -->
    <div class="step-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="currentStepRules"
        label-width="120px"
      >
        <slot
          :name="`step-${currentStepConfig.key}`"
          :step="currentStepConfig"
          :form-data="formData"
          :step-index="currentStep"
        />
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="step-actions">
      <el-button
        v-if="!isFirstStep"
        @click="handlePrevStep"
      >
        上一步
      </el-button>

      <el-button
        v-if="!isLastStep"
        type="primary"
        @click="handleNextStep"
      >
        下一步
      </el-button>

      <el-button
        v-if="isLastStep"
        type="primary"
        @click="handleSubmit"
      >
        提交
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  steps: FormStep[]
  modelValue: Record<string, any>
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'submit', value: Record<string, any>): void
  (e: 'step-change', step: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单步骤hook
const {
  currentStep,
  stepStatuses,
  currentStepConfig,
  isFirstStep,
  isLastStep,
  nextStep,
  prevStep
} = useFormSteps(props.steps, formData, formRef)

// 当前步骤验证规则
const currentStepRules = computed(() => {
  return currentStepConfig.value.rules || {}
})

// 处理下一步
const handleNextStep = async () => {
  const success = await nextStep()
  if (success) {
    emit('step-change', currentStep.value)
  }
}

// 处理上一步
const handlePrevStep = async () => {
  const success = await prevStep()
  if (success) {
    emit('step-change', currentStep.value)
  }
}

// 处理提交
const handleSubmit = async () => {
  const isValid = await validateCurrentStep()
  if (isValid) {
    emit('submit', formData.value)
  }
}
</script>

<style scoped>
.form-steps {
  .step-content {
    margin: 40px 0;
    min-height: 400px;
  }

  .step-actions {
    text-align: center;
    padding: 20px 0;
  }
}
</style>
```

useForm组合函数为Vue3应用提供了完整的表单管理解决方案，支持数据验证、动态表单、表单联动和步骤表单等高级功能。