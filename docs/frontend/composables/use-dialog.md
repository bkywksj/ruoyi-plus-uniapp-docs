# useDialog

对话框管理组合函数，提供对话框状态管理和操作的统一解决方案。

## 📋 功能特性

- **状态管理**: 对话框可见性控制
- **标题管理**: 动态设置对话框标题
- **简洁API**: 提供简单易用的操作方法
- **类型安全**: 完整的 TypeScript 支持

## 🎯 基础用法

### 基本对话框控制

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-button @click="openDialog">打开对话框</el-button>
    
    <!-- 对话框 -->
    <el-dialog 
      v-model="visible" 
      :title="title"
      width="600px">
      <p>这是对话框内容</p>
      
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useDialog } from '@/composables/useDialog'

// 基础用法
const { title, visible, openDialog, closeDialog } = useDialog({
  title: '默认标题'
})

const handleConfirm = () => {
  // 处理确认逻辑
  console.log('用户点击了确认')
  closeDialog()
}
</script>
```

### 动态标题

```vue
<template>
  <div>
    <el-button @click="openAddDialog">新增用户</el-button>
    <el-button @click="openEditDialog">编辑用户</el-button>
    
    <el-dialog v-model="visible" :title="title">
      <el-form v-if="visible">
        <el-form-item label="用户名">
          <el-input v-model="userForm.name" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog()

const userForm = reactive({
  name: ''
})

// 新增用户对话框
const openAddDialog = () => {
  title.value = '新增用户'
  userForm.name = ''
  openDialog()
}

// 编辑用户对话框
const openEditDialog = () => {
  title.value = '编辑用户'
  userForm.name = '现有用户名'
  openDialog()
}

const handleSave = () => {
  // 保存逻辑
  console.log('保存用户:', userForm.name)
  closeDialog()
}
</script>
```

## 🔄 多对话框管理

### 管理多个对话框

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-button @click="openUserDialog">用户管理</el-button>
    <el-button @click="openSettingDialog">设置</el-button>
    <el-button @click="openConfirmDialog">确认对话框</el-button>
    
    <!-- 用户管理对话框 -->
    <el-dialog v-model="userDialog.visible" :title="userDialog.title">
      <p>用户管理内容</p>
      <template #footer>
        <el-button @click="userDialog.closeDialog">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 设置对话框 -->
    <el-dialog v-model="settingDialog.visible" :title="settingDialog.title">
      <p>设置内容</p>
      <template #footer>
        <el-button @click="settingDialog.closeDialog">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 确认对话框 -->
    <el-dialog v-model="confirmDialog.visible" :title="confirmDialog.title">
      <p>确认要执行此操作吗？</p>
      <template #footer>
        <el-button @click="confirmDialog.closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useDialog } from '@/composables/useDialog'

// 创建多个对话框实例
const userDialog = useDialog({ title: '用户管理' })
const settingDialog = useDialog({ title: '系统设置' })
const confirmDialog = useDialog({ title: '确认操作' })

const openUserDialog = () => {
  userDialog.openDialog()
}

const openSettingDialog = () => {
  settingDialog.openDialog()
}

const openConfirmDialog = () => {
  confirmDialog.openDialog()
}

const handleConfirm = () => {
  console.log('执行确认操作')
  confirmDialog.closeDialog()
}
</script>
```

## 🎨 高级用法

### 表单对话框封装

```vue
<template>
  <div>
    <el-button @click="openFormDialog">打开表单</el-button>
    
    <FormDialog
      v-model:visible="formDialog.visible"
      :title="formDialog.title"
      @confirm="handleFormSubmit"
      @cancel="formDialog.closeDialog"
    />
  </div>
</template>

<script setup>
import { useDialog } from '@/composables/useDialog'
import FormDialog from './components/FormDialog.vue'

const formDialog = useDialog({ title: '表单对话框' })

const openFormDialog = () => {
  formDialog.openDialog()
}

const handleFormSubmit = (formData) => {
  console.log('表单数据:', formData)
  formDialog.closeDialog()
}
</script>
```

### 条件式对话框

```vue
<template>
  <div>
    <el-button @click="openConditionalDialog">条件对话框</el-button>
    
    <el-dialog v-model="visible" :title="title">
      <div v-if="userRole === 'admin'">
        <p>管理员专用内容</p>
        <el-button type="danger">危险操作</el-button>
      </div>
      
      <div v-else>
        <p>普通用户内容</p>
      </div>
      
      <template #footer>
        <el-button @click="closeDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog()

const userRole = ref('admin') // 模拟用户角色

const openConditionalDialog = () => {
  // 根据用户角色设置不同标题
  title.value = userRole.value === 'admin' ? '管理员面板' : '用户面板'
  openDialog()
}
</script>
```

### 异步数据加载

```vue
<template>
  <div>
    <el-button @click="openDataDialog">加载数据对话框</el-button>
    
    <el-dialog v-model="visible" :title="title">
      <div v-loading="loading">
        <div v-if="data.length > 0">
          <el-table :data="data">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="email" label="邮箱" />
          </el-table>
        </div>
        <div v-else-if="!loading">
          暂无数据
        </div>
      </div>
      
      <template #footer>
        <el-button @click="closeDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog({
  title: '数据列表'
})

const loading = ref(false)
const data = ref([])

// 模拟异步数据加载
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    data.value = [
      { name: '张三', email: 'zhangsan@example.com' },
      { name: '李四', email: 'lisi@example.com' }
    ]
  } catch (error) {
    console.error('数据加载失败:', error)
  } finally {
    loading.value = false
  }
}

const openDataDialog = () => {
  openDialog()
  loadData() // 打开对话框时加载数据
}
</script>
```

## 🔧 自定义配置

### 扩展对话框配置

```vue
<template>
  <div>
    <el-button @click="openCustomDialog">自定义对话框</el-button>
    
    <el-dialog 
      v-model="visible" 
      :title="title"
      :width="dialogConfig.width"
      :modal="dialogConfig.modal"
      :close-on-click-modal="dialogConfig.closeOnClickModal">
      
      <p>自定义配置的对话框</p>
      
      <template #footer>
        <el-button @click="closeDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog({
  title: '自定义对话框'
})

// 对话框额外配置
const dialogConfig = reactive({
  width: '800px',
  modal: true,
  closeOnClickModal: false
})

const openCustomDialog = () => {
  openDialog()
}
</script>
```

## 📚 API 参考

### useDialog 参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| options.title | string | '' | 对话框默认标题 |

### 返回值

| 属性/方法 | 类型 | 描述 |
|----------|------|------|
| title | Ref\<string\> | 对话框标题（响应式） |
| visible | Ref\<boolean\> | 对话框可见状态（响应式） |
| openDialog | () => void | 打开对话框方法 |
| closeDialog | () => void | 关闭对话框方法 |

### 类型定义

```typescript
interface Options {
  title?: string  // 对话框标题
}

interface Return {
  title: Ref<string>           // 对话框标题
  visible: Ref<boolean>        // 对话框可见状态
  openDialog: () => void       // 打开对话框方法
  closeDialog: () => void      // 关闭对话框方法
}
```

## 🎯 最佳实践

### 状态管理

1. **独立实例**: 为每个对话框创建独立的 `useDialog` 实例
2. **状态重置**: 关闭对话框时及时重置相关状态
3. **内存清理**: 组件卸载时确保对话框已关闭

### 用户体验

1. **加载状态**: 异步操作时显示适当的加载状态
2. **错误处理**: 妥善处理可能的错误情况
3. **键盘支持**: 支持 ESC 键关闭对话框

### 性能优化

1. **懒加载**: 对话框内容可考虑懒加载
2. **条件渲染**: 使用 `v-if` 而非 `v-show` 避免不必要的渲染
3. **事件清理**: 及时清理事件监听器

### 代码组织

```vue
<script setup>
// 推荐的组织方式
import { useDialog } from '@/composables/useDialog'

// 1. 创建对话框实例
const userDialog = useDialog({ title: '用户管理' })

// 2. 定义相关状态
const formData = reactive({})
const loading = ref(false)

// 3. 定义操作方法
const openUserDialog = () => {
  // 初始化数据
  formData.value = {}
  userDialog.openDialog()
}

const handleSave = async () => {
  loading.value = true
  try {
    // 保存逻辑
    await saveUser(formData)
    userDialog.closeDialog()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
```
