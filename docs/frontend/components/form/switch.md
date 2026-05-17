# AFormSwitch 开关组件

AFormSwitch 是一个功能完善的开关组件，基于 Element Plus 的 ElSwitch 封装，适用于布尔值的快速切换操作，支持自定义文本、颜色和加载状态。

## 基础用法

### 基本开关

```vue
<template>
  <!-- 搜索栏中使用 -->
  <AFormSwitch 
    v-model="queryParams.enabled" 
    label="启用状态" 
    prop="enabled" 
    @change="handleQuery" 
  />
  
  <!-- 表单中使用 -->
  <AFormSwitch 
    v-model="form.isPublic" 
    label="是否公开" 
    prop="isPublic" 
    :span="12" 
  />
</template>

<script lang="ts" setup>
const queryParams = reactive({
  enabled: true
})

const form = reactive({
  isPublic: false
})
</script>
```

### 带文本的开关

```vue
<template>
  <AFormSwitch 
    v-model="form.autoSave" 
    label="自动保存" 
    prop="autoSave"
    active-text="开启" 
    inactive-text="关闭" 
    :span="12" 
  />
</template>
```

## 组件属性

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| boolean` | - | 绑定值 |
| `label` | `string` | `''` | 表单标签 |
| `prop` | `string` | `''` | 表单字段名 |
| `span` | `number` | - | 栅格占比 |
| `showFormItem` | `boolean` | `true` | 是否显示表单项包装 |

### 开关属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `activeValue` | `string \| number \| boolean` | `'1'` | 开关打开时的值 |
| `inactiveValue` | `string \| number \| boolean` | `'0'` | 开关关闭时的值 |
| `activeText` | `string` | `''` | 开关打开时显示的文字 |
| `inactiveText` | `string` | `''` | 开关关闭时显示的文字 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 是否显示加载中 |
| `size` | `ElSize` | `''` | 开关尺寸 |

### 样式属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `activeColor` | `string` | `'#409eff'` | 开关打开时的背景色 |
| `inactiveColor` | `string` | `'#dcdfe6'` | 开关关闭时的背景色 |
| `width` | `number` | - | 开关的宽度（像素） |
| `inlinePrompt` | `boolean` | `false` | 是否在按钮内显示文字 |

### 高级属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `beforeChange` | `Function` | - | 切换前的钩子函数 |
| `validateEvent` | `boolean` | `true` | 是否触发表单验证 |
| `preventInitialChange` | `boolean` | `true` | 是否阻止初始化时的 change 事件 |
| `labelWidth` | `string \| number` | - | 标签宽度 |
| `tooltip` | `string` | `''` | 提示信息 |

## 使用示例

### 布尔值开关

```vue
<template>
  <AFormSwitch 
    v-model="form.isEnabled" 
    label="功能开关" 
    prop="isEnabled"
    :active-value="true" 
    :inactive-value="false" 
    :span="12" 
  />
</template>

<script lang="ts" setup>
const form = reactive({
  isEnabled: false // 布尔类型
})
</script>
```

### 字符串值开关

```vue
<template>
  <AFormSwitch 
    v-model="form.status" 
    label="状态" 
    prop="status"
    active-value="active" 
    inactive-value="inactive" 
    active-text="启用" 
    inactive-text="禁用"
    :span="12" 
  />
</template>

<script lang="ts" setup>
const form = reactive({
  status: 'inactive' // 字符串类型
})
</script>
```

### 数字值开关

```vue
<template>
  <AFormSwitch 
    v-model="form.priority" 
    label="优先级" 
    prop="priority"
    :active-value="1" 
    :inactive-value="0" 
    active-text="高优先级" 
    inactive-text="普通优先级"
    :span="12" 
  />
</template>

<script lang="ts" setup>
const form = reactive({
  priority: 0 // 数字类型
})
</script>
```

### 自定义颜色开关

```vue
<template>
  <AFormSwitch 
    v-model="form.dangerMode" 
    label="危险模式" 
    prop="dangerMode"
    active-color="#ff4949" 
    inactive-color="#13ce66" 
    active-text="危险" 
    inactive-text="安全"
    :span="12" 
  />
</template>
```

### 带提示信息的开关

```vue
<template>
  <AFormSwitch 
    v-model="form.allowNotifications" 
    label="通知权限" 
    prop="allowNotifications"
    tooltip="开启后将接收系统通知消息" 
    :span="12" 
  />
</template>
```

### 内联文字开关

```vue
<template>
  <AFormSwitch 
    v-model="form.darkMode" 
    label="主题模式" 
    prop="darkMode"
    inline-prompt 
    active-text="暗" 
    inactive-text="亮" 
    :span="12" 
  />
</template>
```

### 加载状态开关

```vue
<template>
  <AFormSwitch 
    v-model="form.serviceEnabled" 
    label="服务状态" 
    prop="serviceEnabled"
    :loading="switchLoading" 
    @change="handleServiceToggle"
    :span="12" 
  />
</template>

<script lang="ts" setup>
const switchLoading = ref(false)

const handleServiceToggle = async (value) => {
  switchLoading.value = true
  try {
    // 模拟 API 调用
    await toggleService(value)
    showMsgSuccess('服务状态更新成功')
  } catch (error) {
    // 失败时恢复原状态
    form.serviceEnabled = !value
    showMsgError('服务状态更新失败')
  } finally {
    switchLoading.value = false
  }
}
</script>
```

### 不含表单项的纯开关

```vue
<template>
  <div class="flex items-center">
    <span class="mr-2">实时更新</span>
    <AFormSwitch 
      v-model="realtimeUpdate" 
      :show-form-item="false" 
      @change="handleRealtimeToggle"
    />
  </div>
</template>
```

## 事件处理

### 基础事件

```vue
<template>
  <AFormSwitch 
    v-model="form.notifications"
    label="通知设置"
    @change="handleNotificationChange"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script lang="ts" setup>
const handleNotificationChange = (value) => {
  console.log('通知设置变更:', value)
  
  if (value) {
    // 开启通知相关逻辑
    enableNotifications()
  } else {
    // 关闭通知相关逻辑
    disableNotifications()
  }
}

const handleFocus = (event) => {
  console.log('开关获得焦点')
}

const handleBlur = (event) => {
  console.log('开关失去焦点')
}
</script>
```

### 带确认的开关

```vue
<template>
  <AFormSwitch 
    v-model="form.deleteMode" 
    label="删除模式" 
    prop="deleteMode"
    :before-change="confirmToggle" 
    active-text="批量删除" 
    inactive-text="单个删除"
    active-color="#f56c6c"
    :span="12" 
  />
</template>

<script lang="ts" setup>
const confirmToggle = () => {
  return new Promise((resolve) => {
    showConfirm('确定要切换删除模式吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then(() => {
      resolve(true)
    }).catch(() => {
      resolve(false)
    })
  })
}
</script>
```

### 联动控制

```vue
<template>
  <el-row :gutter="20">
    <AFormSwitch 
      v-model="form.autoBackup" 
      label="自动备份" 
      prop="autoBackup"
      @change="handleAutoBackupChange"
      :span="12" 
    />
    
    <AFormSwitch 
      v-model="form.backupEncryption" 
      label="备份加密" 
      prop="backupEncryption"
      :disabled="!form.autoBackup"
      :span="12" 
    />
  </el-row>
</template>

<script lang="ts" setup>
const handleAutoBackupChange = (enabled) => {
  if (!enabled) {
    // 关闭自动备份时，同时关闭加密
    form.backupEncryption = false
  }
}
</script>
```

## 高级用法

### 动态禁用

```vue
<template>
  <AFormSwitch 
    v-model="form.advancedMode" 
    label="高级模式" 
    prop="advancedMode"
    :disabled="!canUseAdvancedMode" 
    tooltip="需要高级权限才能使用"
    :span="12" 
  />
</template>

<script lang="ts" setup>
const canUseAdvancedMode = computed(() => {
  return user.value?.level >= 5
})
</script>
```

### 批量开关控制

```vue
<template>
  <div>
    <!-- 主控开关 -->
    <AFormSwitch 
      v-model="masterSwitch" 
      label="总开关" 
      @change="handleMasterToggle"
      :show-form-item="false"
    />
    
    <el-divider />
    
    <!-- 子开关组 -->
    <el-row :gutter="20">
      <AFormSwitch 
        v-model="form.email" 
        label="邮件通知" 
        :disabled="!masterSwitch"
        :span="8" 
      />
      <AFormSwitch 
        v-model="form.sms" 
        label="短信通知" 
        :disabled="!masterSwitch"
        :span="8" 
      />
      <AFormSwitch 
        v-model="form.push" 
        label="推送通知" 
        :disabled="!masterSwitch"
        :span="8" 
      />
    </el-row>
  </div>
</template>

<script lang="ts" setup>
const masterSwitch = ref(true)

const handleMasterToggle = (enabled) => {
  if (!enabled) {
    // 关闭主开关时，关闭所有子开关
    form.email = false
    form.sms = false
    form.push = false
  }
}
</script>
```

### 条件渲染开关

```vue
<template>
  <div>
    <AFormSwitch 
      v-model="form.useCustomConfig" 
      label="使用自定义配置" 
      @change="handleConfigModeChange"
    />
    
    <template v-if="form.useCustomConfig">
      <AFormSwitch 
        v-model="form.enableCache" 
        label="启用缓存" 
        class="mt-4"
      />
      <AFormSwitch 
        v-model="form.enableCompression" 
        label="启用压缩" 
        class="mt-2"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
const handleConfigModeChange = (useCustom) => {
  if (!useCustom) {
    // 恢复默认配置
    resetToDefaultConfig()
  }
}
</script>
```

## 表单验证

### 基础验证

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <AFormSwitch 
      v-model="form.agreement" 
      label="用户协议" 
      prop="agreement"
      :active-value="true"
      :inactive-value="false"
      active-text="已同意"
      inactive-text="未同意"
    />
  </el-form>
</template>

<script lang="ts" setup>
const rules = {
  agreement: [
    { 
      required: true, 
      message: '请同意用户协议', 
      trigger: 'change' 
    },
    {
      validator: (rule, value, callback) => {
        if (value !== true) {
          callback(new Error('必须同意用户协议'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}
</script>
```

### 条件验证

```vue
<template>
  <el-form :model="form" :rules="rules">
    <AFormSwitch 
      v-model="form.enableSSL" 
      label="启用SSL" 
      prop="enableSSL" 
    />
    
    <AFormInput 
      v-if="form.enableSSL"
      v-model="form.sslCertPath" 
      label="证书路径" 
      prop="sslCertPath" 
    />
  </el-form>
</template>

<script lang="ts" setup>
const rules = computed(() => ({
  enableSSL: [
    { required: true, message: '请选择是否启用SSL', trigger: 'change' }
  ],
  sslCertPath: form.enableSSL ? [
    { required: true, message: '启用SSL时必须提供证书路径', trigger: 'blur' }
  ] : []
}))
</script>
```

## 样式定制

### 自定义样式

```vue
<template>
  <AFormSwitch 
    v-model="form.theme"
    label="暗黑主题"
    class="custom-switch"
    active-color="#1f2937"
    inactive-color="#f3f4f6"
  />
</template>

<style scoped>
.custom-switch :deep(.el-switch) {
  --el-switch-border-radius: 20px;
}

.custom-switch :deep(.el-switch__core) {
  height: 24px;
  min-width: 48px;
}

.custom-switch :deep(.el-switch__action) {
  width: 20px;
  height: 20px;
}
</style>
```

### 响应式尺寸

```vue
<template>
  <AFormSwitch 
    v-model="form.enabled"
    label="启用状态"
    :size="isMobile ? 'small' : 'default'"
    :span="isMobile ? 24 : 12"
  />
</template>

<script lang="ts" setup>
import { useBreakpoint } from '@/composables/useBreakpoint'
const { isMobile } = useBreakpoint()
</script>
```

## 实际应用场景

### 系统设置

```vue
<template>
  <el-card header="系统设置">
    <el-row :gutter="20">
      <AFormSwitch 
        v-model="settings.maintenance" 
        label="维护模式" 
        prop="maintenance"
        active-color="#f56c6c"
        tooltip="开启后系统将进入维护模式"
        :span="12" 
      />
      
      <AFormSwitch 
        v-model="settings.registration" 
        label="开放注册" 
        prop="registration"
        :span="12" 
      />
      
      <AFormSwitch 
        v-model="settings.guestAccess" 
        label="游客访问" 
        prop="guestAccess"
        :span="12" 
      />
      
      <AFormSwitch 
        v-model="settings.apiEnabled" 
        label="API接口" 
        prop="apiEnabled"
        :span="12" 
      />
    </el-row>
  </el-card>
</template>

<script lang="ts" setup>
const settings = reactive({
  maintenance: false,
  registration: true,
  guestAccess: false,
  apiEnabled: true
})
</script>
```

### 权限控制

```vue
<template>
  <el-card header="权限设置">
    <AFormSwitch 
      v-model="permissions.canEdit" 
      label="编辑权限" 
      @change="handlePermissionChange('edit', $event)"
    />
    
    <AFormSwitch 
      v-model="permissions.canDelete" 
      label="删除权限" 
      :disabled="!permissions.canEdit"
      @change="handlePermissionChange('delete', $event)"
    />
    
    <AFormSwitch 
      v-model="permissions.canExport" 
      label="导出权限" 
      @change="handlePermissionChange('export', $event)"
    />
  </el-card>
</template>

<script lang="ts" setup>
const permissions = reactive({
  canEdit: false,
  canDelete: false,
  canExport: false
})

const handlePermissionChange = async (type, enabled) => {
  try {
    await updateUserPermission(type, enabled)
    showMsgSuccess('权限更新成功')
  } catch (error) {
    showMsgError('权限更新失败')
    // 恢复原状态
    permissions[`can${type.charAt(0).toUpperCase() + type.slice(1)}`] = !enabled
  }
}
</script>
```

### 功能开关

```vue
<template>
  <div class="feature-toggles">
    <h3>实验性功能</h3>
    
    <AFormSwitch 
      v-for="feature in features" 
      :key="feature.key"
      v-model="feature.enabled"
      :label="feature.name"
      :tooltip="feature.description"
      :loading="feature.loading"
      @change="toggleFeature(feature)"
      class="mb-3"
    />
  </div>
</template>

<script lang="ts" setup>
const features = ref([
  {
    key: 'ai_assistant',
    name: 'AI助手',
    description: '智能助手功能，帮助提升工作效率',
    enabled: false,
    loading: false
  },
  {
    key: 'dark_mode',
    name: '暗黑模式',
    description: '切换到暗黑主题界面',
    enabled: false,
    loading: false
  },
  {
    key: 'real_time_sync',
    name: '实时同步',
    description: '数据实时同步到云端',
    enabled: true,
    loading: false
  }
])

const toggleFeature = async (feature) => {
  feature.loading = true
  try {
    await updateFeatureFlag(feature.key, feature.enabled)
    showMsgSuccess(`${feature.name}功能${feature.enabled ? '已启用' : '已禁用'}`)
  } catch (error) {
    feature.enabled = !feature.enabled
    showMsgError('功能切换失败')
  } finally {
    feature.loading = false
  }
}
</script>
```

### 通知设置

```vue
<template>
  <el-card header="通知设置">
    <div class="notification-settings">
      <div v-for="category in notificationCategories" :key="category.key" class="mb-4">
        <h4 class="mb-2">{{ category.name }}</h4>
        <el-row :gutter="20">
          <el-col :span="8" v-for="type in category.types" :key="type.key">
            <AFormSwitch 
              v-model="notifications[category.key][type.key]"
              :label="type.name"
              :show-form-item="false"
              @change="saveNotificationSetting(category.key, type.key, $event)"
            />
          </el-col>
        </el-row>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
const notificationCategories = [
  {
    key: 'system',
    name: '系统通知',
    types: [
      { key: 'email', name: '邮件' },
      { key: 'sms', name: '短信' },
      { key: 'push', name: '推送' }
    ]
  },
  {
    key: 'social',
    name: '社交通知',
    types: [
      { key: 'comment', name: '评论' },
      { key: 'like', name: '点赞' },
      { key: 'follow', name: '关注' }
    ]
  }
]

const notifications = reactive({
  system: {
    email: true,
    sms: false,
    push: true
  },
  social: {
    comment: true,
    like: false,
    follow: true
  }
})

const saveNotificationSetting = async (category, type, enabled) => {
  try {
    await updateNotificationSetting(category, type, enabled)
    console.log(`${category}.${type} 设置为 ${enabled}`)
  } catch (error) {
    notifications[category][type] = !enabled
    showMsgError('设置保存失败')
  }
}
</script>
```

## 最佳实践

### 1. 明确的状态表示

```vue
<template>
  <!-- 好的做法 - 状态清晰明确 -->
  <AFormSwitch 
    v-model="form.isPublic"
    label="文章可见性"
    active-text="公开"
    inactive-text="私有"
    :active-value="true"
    :inactive-value="false"
  />
  
  <!-- 避免的做法 - 状态含糊不清 -->
  <AFormSwitch 
    v-model="form.status"
    label="状态"
  />
</template>
```

### 2. 合适的默认值

```vue
<template>
  <AFormSwitch 
    v-model="form.allowNotifications"
    label="接收通知"
    tooltip="默认开启，您可以随时关闭"
  />
</template>

<script lang="ts" setup>
const form = reactive({
  allowNotifications: true // 合理的默认值
})
</script>
```

### 3. 提供反馈

```vue
<template>
  <AFormSwitch 
    v-model="form.autoSave"
    label="自动保存"
    :loading="savingSettings"
    @change="handleAutoSaveToggle"
  />
</template>

<script lang="ts" setup>
const savingSettings = ref(false)

const handleAutoSaveToggle = async (enabled) => {
  savingSettings.value = true
  try {
    await saveUserSetting('autoSave', enabled)
    showMsgSuccess(`自动保存已${enabled ? '开启' : '关闭'}`)
  } catch (error) {
    form.autoSave = !enabled
    showMsgError('设置保存失败')
  } finally {
    savingSettings.value = false
  }
}
</script>
```

### 4. 谨慎使用危险操作

```vue
<template>
  <AFormSwitch 
    v-model="form.dangerousFeature"
    label="危险功能"
    active-color="#f56c6c"
    :before-change="confirmDangerousAction"
    tooltip="此功能可能对系统造成影响，请谨慎使用"
  />
</template>

<script lang="ts" setup>
const confirmDangerousAction = async () => {
  try {
    await showConfirm(
      '此操作可能对系统造成不可逆的影响，确定要继续吗？',
      '警告',
      { type: 'warning' }
    )
    return true
  } catch {
    return false
  }
}
</script>
```

## 注意事项

1. **数据类型一致性**：确保 `activeValue` 和 `inactiveValue` 与绑定值类型一致
2. **用户体验**：重要的开关操作应该提供确认机制
3. **状态反馈**：异步操作时使用 `loading` 状态给用户反馈
4. **默认值**：为开关设置合理的默认状态
5. **文本描述**：使用 `activeText` 和 `inactiveText` 让状态更清晰
6. **无障碍访问**：确保开关有明确的标签和描述信息

## 常见问题

### 1. 开关值类型不匹配

**问题描述:** 开关切换后值不正确，或者表单提交时值类型错误

**问题原因:**

- `activeValue` 和 `inactiveValue` 类型与绑定值类型不一致
- 默认值为字符串 `'1'` 和 `'0'`，而表单期望布尔值或数字

**解决方案:**

```vue
<template>
  <!-- ❌ 错误：类型不匹配 -->
  <AFormSwitch
    v-model="form.enabled"
    label="启用"
  />
  <!-- form.enabled 期望布尔值，但默认 activeValue='1' 是字符串 -->

  <!-- ✅ 正确：明确指定类型 -->
  <AFormSwitch
    v-model="form.enabled"
    label="启用"
    :active-value="true"
    :inactive-value="false"
  />
</template>

<script lang="ts" setup>
const form = reactive({
  enabled: false  // 布尔类型，需要配合布尔类型的 activeValue/inactiveValue
})
</script>
```

### 2. 初始化时触发 change 事件

**问题描述:** 组件加载时自动触发了 change 事件，导致不必要的接口调用

**问题原因:**

- 默认行为会在值初始化时触发 change 事件
- 未启用 `preventInitialChange` 属性

**解决方案:**

```vue
<template>
  <!-- ✅ 阻止初始化时的 change 事件 -->
  <AFormSwitch
    v-model="form.autoUpdate"
    label="自动更新"
    :prevent-initial-change="true"
    @change="handleAutoUpdateChange"
  />
</template>

<script lang="ts" setup>
// 或者在事件处理中判断是否首次加载
const isFirstLoad = ref(true)

const handleAutoUpdateChange = (value) => {
  if (isFirstLoad.value) {
    isFirstLoad.value = false
    return
  }
  // 正常的变更处理
  updateSettings(value)
}
</script>
```

### 3. beforeChange 返回值处理不当

**问题描述:** 使用 `beforeChange` 钩子后开关状态异常，取消操作后状态仍然改变

**问题原因:**

- `beforeChange` 需要返回 `Promise` 或布尔值
- 未正确处理取消情况

**解决方案:**

```vue
<template>
  <AFormSwitch
    v-model="form.dangerous"
    label="危险操作"
    :before-change="handleBeforeChange"
  />
</template>

<script lang="ts" setup>
// ❌ 错误：没有返回值
const handleBeforeChange = () => {
  showConfirm('确定吗？')
}

// ✅ 正确：返回 Promise<boolean>
const handleBeforeChange = (): Promise<boolean> => {
  return new Promise((resolve) => {
    showConfirm('确定执行此操作吗？', '提示')
      .then(() => resolve(true))   // 确认，允许切换
      .catch(() => resolve(false)) // 取消，阻止切换
  })
}

// ✅ 正确：async/await 写法
const handleBeforeChange = async (): Promise<boolean> => {
  try {
    await showConfirm('确定执行此操作吗？', '提示')
    return true
  } catch {
    return false
  }
}
</script>
```

### 4. 开关联动时状态错乱

**问题描述:** 多个开关联动控制时，子开关状态与父开关不同步

**问题原因:**

- 未正确监听父开关状态变化
- 子开关状态未及时重置

**解决方案:**

```vue
<template>
  <AFormSwitch
    v-model="masterEnabled"
    label="总开关"
    @change="handleMasterChange"
  />

  <AFormSwitch
    v-model="form.feature1"
    label="功能1"
    :disabled="!masterEnabled"
  />

  <AFormSwitch
    v-model="form.feature2"
    label="功能2"
    :disabled="!masterEnabled"
  />
</template>

<script lang="ts" setup>
const masterEnabled = ref(true)
const form = reactive({
  feature1: false,
  feature2: false
})

// ✅ 正确：关闭主开关时重置子开关
const handleMasterChange = (enabled: boolean) => {
  if (!enabled) {
    form.feature1 = false
    form.feature2 = false
  }
}

// ✅ 使用 watch 确保状态同步
watch(masterEnabled, (enabled) => {
  if (!enabled) {
    Object.keys(form).forEach(key => {
      form[key] = false
    })
  }
})
</script>
```
