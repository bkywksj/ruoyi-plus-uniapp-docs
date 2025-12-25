# useDialog

对话框管理组合函数，提供对话框状态管理和操作的统一解决方案。useDialog 是一个轻量级的状态管理 Composable，专为管理对话框（Dialog）和抽屉（Drawer）的显示状态设计。它提供响应式的标题和可见性控制，可以与 Element Plus 的 `el-dialog`、`el-drawer` 或项目封装的 `AModal` 组件无缝配合使用。

## 核心概念

### 设计理念

useDialog 遵循 Vue 3 组合式 API 的最佳实践，将对话框的状态管理逻辑抽离为可复用的组合函数。这种设计带来以下优势：

1. **关注点分离** - 将对话框状态管理与业务逻辑分离
2. **状态复用** - 多个对话框可以共享相同的管理模式
3. **类型安全** - 完整的 TypeScript 类型支持
4. **轻量设计** - 仅包含必要的状态和方法

### 工作原理

```typescript
// useDialog 内部实现原理
export const useDialog = (ops?: Options): Return => {
  // 响应式的可见状态
  const visible = ref(false)

  // 响应式的标题
  const title = ref(ops?.title || '')

  // 打开对话框
  const openDialog = (): void => {
    visible.value = true
  }

  // 关闭对话框
  const closeDialog = (): void => {
    visible.value = false
  }

  return { title, visible, openDialog, closeDialog }
}
```

### 与其他组件的配合

useDialog 设计为与多种对话框组件配合使用：

| 组件 | 说明 | 推荐场景 |
|------|------|----------|
| `el-dialog` | Element Plus 原生对话框 | 简单对话框场景 |
| `el-drawer` | Element Plus 原生抽屉 | 侧边抽屉场景 |
| `AModal` | 项目封装的统一组件 | 推荐使用，功能更丰富 |

## 基础用法

### 基本对话框控制

最简单的用法是将 useDialog 与 `el-dialog` 配合使用：

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-button type="primary" @click="openDialog">打开对话框</el-button>

    <!-- 对话框 -->
    <el-dialog
      v-model="visible"
      :title="title"
      width="600px"
    >
      <p>这是对话框内容</p>

      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '@/composables/useDialog'

// 基础用法 - 解构获取状态和方法
const { title, visible, openDialog, closeDialog } = useDialog({
  title: '基础对话框'
})

const handleConfirm = () => {
  console.log('用户点击了确认')
  closeDialog()
}
</script>
```

**使用说明：**
- `visible` 是响应式的布尔值，控制对话框的显示/隐藏
- `title` 是响应式的字符串，可以动态修改标题
- `openDialog()` 将 `visible` 设为 `true`
- `closeDialog()` 将 `visible` 设为 `false`

### 动态标题

在新增/编辑场景中，经常需要根据操作类型动态设置对话框标题：

```vue
<template>
  <div>
    <el-button type="primary" @click="handleAdd">新增用户</el-button>
    <el-button type="warning" @click="handleEdit">编辑用户</el-button>

    <el-dialog v-model="visible" :title="title" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="formData.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="formData.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog()

// 编辑模式标识
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  userId: '',
  userName: '',
  nickName: '',
  email: ''
})

// 重置表单
const resetForm = () => {
  formData.userId = ''
  formData.userName = ''
  formData.nickName = ''
  formData.email = ''
}

// 新增操作
const handleAdd = () => {
  isEdit.value = false
  title.value = '新增用户'
  resetForm()
  openDialog()
}

// 编辑操作
const handleEdit = () => {
  isEdit.value = true
  title.value = '编辑用户'
  // 模拟加载编辑数据
  formData.userId = '1001'
  formData.userName = 'admin'
  formData.nickName = '管理员'
  formData.email = 'admin@example.com'
  openDialog()
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      console.log('更新用户:', formData)
      // await updateUser(formData)
    } else {
      console.log('创建用户:', formData)
      // await createUser(formData)
    }
    closeDialog()
  } catch (error) {
    console.error('操作失败:', error)
  }
}
</script>
```

**最佳实践：**
- 在打开对话框前设置标题，确保用户看到正确的信息
- 使用 `isEdit` 标识区分新增和编辑模式
- 新增时重置表单，编辑时加载现有数据

### 不带初始配置

如果不需要默认标题，可以不传入任何配置：

```vue
<script setup lang="ts">
import { useDialog } from '@/composables/useDialog'

// 不传入配置，title 默认为空字符串
const { title, visible, openDialog, closeDialog } = useDialog()

// 在需要时动态设置标题
const openWithTitle = (newTitle: string) => {
  title.value = newTitle
  openDialog()
}
</script>
```

## 与 AModal 组件配合

### AModal 简介

AModal 是项目封装的统一模态框组件，整合了 `el-dialog` 和 `el-drawer` 的功能，提供更丰富的特性：

- **双模式支持** - 对话框模式和抽屉模式切换
- **尺寸预设** - small/medium/large/xl 四种预设尺寸
- **拖动功能** - 支持拖拽移动对话框
- **全屏模式** - 一键切换全屏显示
- **加载状态** - 内置 loading 状态支持
- **关闭确认** - 支持关闭前确认回调
- **智能响应式** - 通过 provide/inject 向子组件传递尺寸信息

### 基本使用

```vue
<template>
  <div>
    <el-button type="primary" @click="openDialog">打开 AModal</el-button>

    <AModal
      v-model="visible"
      :title="title"
      size="medium"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog({
  title: '编辑信息'
})

const formData = reactive({
  name: '',
  description: ''
})

const handleConfirm = () => {
  console.log('确认:', formData)
  closeDialog()
}

const handleCancel = () => {
  console.log('取消')
  // AModal 会自动关闭，这里可以处理取消时的逻辑
}
</script>
```

### 抽屉模式

AModal 支持抽屉模式，适合展示详情或复杂表单：

```vue
<template>
  <div>
    <el-button @click="openDrawer">打开抽屉</el-button>

    <AModal
      v-model="visible"
      :title="title"
      mode="drawer"
      direction="rtl"
      size="large"
      :show-footer="false"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单编号">
          {{ orderDetail.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ orderDetail.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">
          ¥{{ orderDetail.amount }}
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="orderDetail.status === 'paid' ? 'success' : 'warning'">
            {{ orderDetail.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收货地址">
          {{ orderDetail.address }}
        </el-descriptions-item>
      </el-descriptions>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog } = useDialog({
  title: '订单详情'
})

const orderDetail = reactive({
  orderNo: 'ORD20241225001',
  createTime: '2024-12-25 10:30:00',
  amount: '299.00',
  status: 'paid',
  statusText: '已支付',
  address: '北京市朝阳区建国路88号'
})

const openDrawer = () => {
  // 可以在这里加载订单详情
  openDialog()
}
</script>
```

**抽屉方向选项：**
- `rtl` - 从右向左（默认，最常用）
- `ltr` - 从左向右
- `ttb` - 从上向下
- `btt` - 从下向上

### 尺寸预设

AModal 提供四种预设尺寸，自动适配对话框和抽屉模式：

```vue
<template>
  <div class="button-group">
    <el-button @click="openWithSize('small')">小尺寸 (600px)</el-button>
    <el-button @click="openWithSize('medium')">中等尺寸 (800px)</el-button>
    <el-button @click="openWithSize('large')">大尺寸 (1000px)</el-button>
    <el-button @click="openWithSize('xl')">超大尺寸 (1200px)</el-button>

    <AModal
      v-model="visible"
      :title="title"
      :size="currentSize"
    >
      <p>当前尺寸预设：{{ currentSize }}</p>
      <p>AModal 会根据尺寸自动设置合适的宽度。</p>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/composables/useDialog'

type ModalSize = 'small' | 'medium' | 'large' | 'xl'

const { title, visible, openDialog } = useDialog()
const currentSize = ref<ModalSize>('medium')

const openWithSize = (size: ModalSize) => {
  currentSize.value = size
  title.value = `${size} 尺寸对话框`
  openDialog()
}
</script>
```

**尺寸映射：**

| 尺寸 | 对话框宽度 | 抽屉宽度 |
|------|-----------|----------|
| small | 600px | 600px |
| medium | 800px | 800px |
| large | 1000px | 1000px |
| xl | 1200px | 1200px |

### 可拖动对话框

启用拖动功能后，用户可以通过拖拽标题栏移动对话框：

```vue
<template>
  <div>
    <el-button @click="openDialog">打开可拖动对话框</el-button>

    <AModal
      v-model="visible"
      :title="title"
      :movable="true"
      size="medium"
    >
      <el-alert
        title="拖动说明"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <p>您可以通过拖拽标题栏来移动此对话框。</p>
          <p>对话框顶部不会超出视口边界，但可以拖到其他方向的边缘。</p>
        </template>
      </el-alert>

      <div style="margin-top: 16px;">
        <p>拖动功能特点：</p>
        <ul>
          <li>仅在对话框模式下生效</li>
          <li>全屏模式下自动禁用</li>
          <li>关闭后位置会自动重置</li>
        </ul>
      </div>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog } = useDialog({
  title: '可拖动对话框'
})
</script>
```

### 全屏模式

适用于需要大面积展示内容的场景：

```vue
<template>
  <div>
    <el-button @click="openDialog">打开全屏对话框</el-button>

    <AModal
      v-model="visible"
      :title="title"
      :fullscreen="true"
    >
      <div class="fullscreen-content">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="date" label="日期" width="180" />
          <el-table-column prop="name" label="姓名" width="180" />
          <el-table-column prop="address" label="地址" />
        </el-table>
      </div>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog } = useDialog({
  title: '全屏数据展示'
})

const tableData = ref([
  { date: '2024-12-25', name: '张三', address: '北京市朝阳区' },
  { date: '2024-12-24', name: '李四', address: '上海市浦东新区' },
  { date: '2024-12-23', name: '王五', address: '广州市天河区' }
])
</script>
```

### 加载状态

在异步操作时显示加载状态：

```vue
<template>
  <div>
    <el-button @click="openWithLoading">加载数据</el-button>

    <AModal
      v-model="visible"
      :title="title"
      :loading="loading"
      @confirm="handleConfirm"
    >
      <template v-if="userData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            {{ userData.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="昵称">
            {{ userData.nickName }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ userData.email }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ userData.phone }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog({
  title: '用户信息'
})

const loading = ref(false)
const userData = ref<any>(null)

// 模拟加载数据
const loadUserData = async () => {
  loading.value = true
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    userData.value = {
      userName: 'admin',
      nickName: '系统管理员',
      email: 'admin@example.com',
      phone: '13800138000'
    }
  } finally {
    loading.value = false
  }
}

const openWithLoading = () => {
  userData.value = null
  openDialog()
  loadUserData()
}

const handleConfirm = async () => {
  loading.value = true
  try {
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    closeDialog()
  } finally {
    loading.value = false
  }
}
</script>
```

### 关闭前确认

使用 `before-close` 在关闭前进行确认：

```vue
<template>
  <div>
    <el-button @click="openDialog">编辑内容</el-button>

    <AModal
      v-model="visible"
      :title="title"
      :before-close="handleBeforeClose"
      :show-footer="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="formData.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="5"
          />
        </el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button @click="handleSave">保存</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </div>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog({
  title: '编辑文章'
})

const formData = reactive({
  title: '',
  content: ''
})

const hasUnsavedChanges = ref(false)

// 监听表单变化
const checkChanges = () => {
  hasUnsavedChanges.value = formData.title !== '' || formData.content !== ''
}

// 关闭前确认
const handleBeforeClose = (done: () => void) => {
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm('您有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定关闭',
      cancelButtonText: '继续编辑',
      type: 'warning'
    })
      .then(() => {
        done()
      })
      .catch(() => {
        // 用户选择继续编辑
      })
  } else {
    done()
  }
}

const handleSave = async () => {
  console.log('保存草稿:', formData)
  hasUnsavedChanges.value = false
}

const handlePublish = async () => {
  console.log('发布文章:', formData)
  hasUnsavedChanges.value = false
  closeDialog()
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
```

## 多对话框管理

### 独立实例管理

为每个对话框创建独立的 useDialog 实例：

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <el-space>
      <el-button @click="userDialog.openDialog()">用户管理</el-button>
      <el-button @click="roleDialog.openDialog()">角色管理</el-button>
      <el-button @click="settingDialog.openDialog()">系统设置</el-button>
    </el-space>

    <!-- 用户管理对话框 -->
    <AModal
      v-model="userDialog.visible"
      :title="userDialog.title"
      size="large"
    >
      <el-table :data="users">
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="nickName" label="昵称" />
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </AModal>

    <!-- 角色管理对话框 -->
    <AModal
      v-model="roleDialog.visible"
      :title="roleDialog.title"
      size="medium"
    >
      <el-table :data="roles">
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="roleKey" label="角色标识" />
      </el-table>
    </AModal>

    <!-- 系统设置对话框 -->
    <AModal
      v-model="settingDialog.visible"
      :title="settingDialog.title"
      mode="drawer"
      size="medium"
    >
      <el-form label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="settings.systemName" />
        </el-form-item>
        <el-form-item label="开启注册">
          <el-switch v-model="settings.enableRegister" />
        </el-form-item>
      </el-form>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDialog } from '@/composables/useDialog'

// 创建多个独立的对话框实例
const userDialog = useDialog({ title: '用户管理' })
const roleDialog = useDialog({ title: '角色管理' })
const settingDialog = useDialog({ title: '系统设置' })

// 模拟数据
const users = ref([
  { userName: 'admin', nickName: '管理员' },
  { userName: 'user1', nickName: '普通用户' }
])

const roles = ref([
  { roleName: '管理员', roleKey: 'admin' },
  { roleName: '普通用户', roleKey: 'user' }
])

const settings = reactive({
  systemName: 'RuoYi-Plus',
  enableRegister: true
})
</script>
```

### 嵌套对话框

在一个对话框中打开另一个对话框：

```vue
<template>
  <div>
    <el-button @click="mainDialog.openDialog()">用户列表</el-button>

    <!-- 主对话框：用户列表 -->
    <AModal
      v-model="mainDialog.visible"
      :title="mainDialog.title"
      size="large"
      :close-on-click-modal="false"
    >
      <el-table :data="users" @row-click="handleRowClick">
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="nickName" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" link @click.stop="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click.stop="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </AModal>

    <!-- 子对话框：用户详情 -->
    <AModal
      v-model="detailDialog.visible"
      :title="detailDialog.title"
      size="small"
      :show-footer="false"
    >
      <el-descriptions v-if="currentUser" :column="1" border>
        <el-descriptions-item label="用户名">
          {{ currentUser.userName }}
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
          {{ currentUser.nickName }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ currentUser.email }}
        </el-descriptions-item>
      </el-descriptions>
    </AModal>

    <!-- 子对话框：确认删除 -->
    <AModal
      v-model="confirmDialog.visible"
      :title="confirmDialog.title"
      size="small"
      @confirm="confirmDelete"
    >
      <el-alert
        :title="`确定要删除用户 ${currentUser?.userName} 吗？`"
        type="warning"
        :closable="false"
        show-icon
      />
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useDialog } from '@/composables/useDialog'

interface User {
  userId: string
  userName: string
  nickName: string
  email: string
}

// 三个独立的对话框实例
const mainDialog = useDialog({ title: '用户列表' })
const detailDialog = useDialog({ title: '用户详情' })
const confirmDialog = useDialog({ title: '确认删除' })

const users = ref<User[]>([
  { userId: '1', userName: 'admin', nickName: '管理员', email: 'admin@example.com' },
  { userId: '2', userName: 'user1', nickName: '用户1', email: 'user1@example.com' },
  { userId: '3', userName: 'user2', nickName: '用户2', email: 'user2@example.com' }
])

const currentUser = ref<User | null>(null)

const handleRowClick = (row: User) => {
  handleView(row)
}

const handleView = (user: User) => {
  currentUser.value = user
  detailDialog.title.value = `用户详情 - ${user.userName}`
  detailDialog.openDialog()
}

const handleEdit = (user: User) => {
  currentUser.value = user
  // 跳转到编辑页面或打开编辑对话框
  console.log('编辑用户:', user)
}

const handleDelete = (user: User) => {
  currentUser.value = user
  confirmDialog.openDialog()
}

const confirmDelete = () => {
  if (currentUser.value) {
    // 执行删除操作
    users.value = users.value.filter(u => u.userId !== currentUser.value?.userId)
    ElMessage.success('删除成功')
    confirmDialog.closeDialog()
  }
}
</script>
```

### 对话框通信

父子对话框之间的数据传递：

```vue
<template>
  <div>
    <el-button @click="openParentDialog">打开父对话框</el-button>

    <!-- 父对话框 -->
    <AModal
      v-model="parentDialog.visible"
      :title="parentDialog.title"
      size="medium"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="部门">
          <el-input
            v-model="formData.deptName"
            readonly
            placeholder="点击选择部门"
            @click="openDeptSelector"
          >
            <template #append>
              <el-button @click="openDeptSelector">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="formData.userName" />
        </el-form-item>
      </el-form>
    </AModal>

    <!-- 子对话框：部门选择器 -->
    <AModal
      v-model="deptDialog.visible"
      :title="deptDialog.title"
      size="small"
      @confirm="confirmDeptSelection"
    >
      <el-tree
        ref="deptTreeRef"
        :data="deptTree"
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        highlight-current
        @node-click="handleDeptClick"
      />
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDialog } from '@/composables/useDialog'

const parentDialog = useDialog({ title: '新增用户' })
const deptDialog = useDialog({ title: '选择部门' })

const formData = reactive({
  deptId: '',
  deptName: '',
  userName: ''
})

// 当前选中的部门
const selectedDept = ref<any>(null)

// 部门树数据
const deptTree = ref([
  {
    id: '1',
    name: '总公司',
    children: [
      { id: '101', name: '研发部' },
      { id: '102', name: '市场部' },
      { id: '103', name: '财务部' }
    ]
  }
])

const openParentDialog = () => {
  formData.deptId = ''
  formData.deptName = ''
  formData.userName = ''
  parentDialog.openDialog()
}

const openDeptSelector = () => {
  deptDialog.openDialog()
}

const handleDeptClick = (data: any) => {
  selectedDept.value = data
}

const confirmDeptSelection = () => {
  if (selectedDept.value) {
    formData.deptId = selectedDept.value.id
    formData.deptName = selectedDept.value.name
    deptDialog.closeDialog()
  }
}
</script>
```

## 高级用法

### 封装表单对话框组件

将表单对话框封装为可复用组件：

```vue
<!-- UserFormDialog.vue -->
<template>
  <AModal
    v-model="visible"
    :title="title"
    :loading="loading"
    size="medium"
    @confirm="handleSubmit"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="formData.userName" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="formData.nickName" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="0">正常</el-radio>
          <el-radio value="1">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </AModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface UserForm {
  userId?: string
  userName: string
  nickName: string
  email: string
  phone: string
  status: string
}

interface Props {
  visible: boolean
  userData?: UserForm
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

// 双向绑定 visible
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 是否为编辑模式
const isEdit = computed(() => !!props.userData?.userId)

// 对话框标题
const title = computed(() => isEdit.value ? '编辑用户' : '新增用户')

// 表单数据
const formData = reactive<UserForm>({
  userId: '',
  userName: '',
  nickName: '',
  email: '',
  phone: '',
  status: '0'
})

// 表单验证规则
const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 监听 userData 变化，初始化表单数据
watch(
  () => props.userData,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
    }
  },
  { immediate: true }
)

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (isEdit.value) {
      // await updateUser(formData)
      console.log('更新用户:', formData)
    } else {
      // await createUser(formData)
      console.log('创建用户:', formData)
    }
    emit('success')
    visible.value = false
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
}

// 对话框关闭后重置表单
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    userId: '',
    userName: '',
    nickName: '',
    email: '',
    phone: '',
    status: '0'
  })
}
</script>
```

**父组件使用：**

```vue
<template>
  <div>
    <el-button type="primary" @click="handleAdd">新增用户</el-button>
    <el-button type="warning" @click="handleEdit">编辑用户</el-button>

    <UserFormDialog
      v-model:visible="dialogVisible"
      :user-data="currentUser"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserFormDialog from './UserFormDialog.vue'

const dialogVisible = ref(false)
const currentUser = ref<any>(null)

const handleAdd = () => {
  currentUser.value = null
  dialogVisible.value = true
}

const handleEdit = () => {
  currentUser.value = {
    userId: '1001',
    userName: 'admin',
    nickName: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    status: '0'
  }
  dialogVisible.value = true
}

const handleSuccess = () => {
  console.log('操作成功，刷新列表')
}
</script>
```

### 异步数据加载模式

在对话框打开时自动加载数据：

```vue
<template>
  <div>
    <el-table :data="orderList">
      <el-table-column prop="orderNo" label="订单号" />
      <el-table-column prop="amount" label="金额" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row.orderId)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <AModal
      v-model="visible"
      :title="title"
      :loading="loading"
      mode="drawer"
      size="large"
      :show-footer="false"
    >
      <template v-if="orderDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ orderDetail.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ orderDetail.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag>{{ orderDetail.statusText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ orderDetail.payMethod }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额" :span="2">
            <span class="price">¥{{ orderDetail.amount }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px;">商品列表</h4>
        <el-table :data="orderDetail.items" border>
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="price" label="单价" width="100" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="subtotal" label="小计" width="100" />
        </el-table>
      </template>

      <el-empty v-else-if="!loading" description="暂无数据" />
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog({
  title: '订单详情'
})

const loading = ref(false)
const orderDetail = ref<any>(null)

// 模拟订单列表
const orderList = ref([
  { orderId: '1', orderNo: 'ORD20241225001', amount: '299.00' },
  { orderId: '2', orderNo: 'ORD20241225002', amount: '599.00' }
])

// 查看订单详情
const viewDetail = async (orderId: string) => {
  orderDetail.value = null
  openDialog()

  loading.value = true
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    orderDetail.value = {
      orderId,
      orderNo: `ORD20241225${orderId.padStart(3, '0')}`,
      createTime: '2024-12-25 10:30:00',
      statusText: '已完成',
      payMethod: '微信支付',
      amount: '299.00',
      items: [
        { productName: '商品A', price: '99.00', quantity: 2, subtotal: '198.00' },
        { productName: '商品B', price: '101.00', quantity: 1, subtotal: '101.00' }
      ]
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}
</style>
```

### 条件渲染优化

使用 `v-if` 配合 `destroyOnClose` 优化性能：

```vue
<template>
  <div>
    <el-button @click="openDialog">打开复杂对话框</el-button>

    <AModal
      v-model="visible"
      :title="title"
      :destroy-on-close="true"
      size="large"
    >
      <!-- 使用 v-if 确保只在对话框打开时渲染内容 -->
      <template v-if="visible">
        <HeavyComponent :data="complexData" />
        <el-table :data="tableData">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="value" label="值" />
        </el-table>
        <EChartsComponent :options="chartOptions" />
      </template>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog({
  title: '数据分析'
})

// 复杂数据 - 只在需要时计算
const complexData = computed(() => {
  if (!visible.value) return null
  // 复杂计算...
  return { /* ... */ }
})

const tableData = ref([])
const chartOptions = ref({})
</script>
```

### 状态重置模式

确保每次打开对话框时状态正确重置：

```vue
<template>
  <div>
    <el-button @click="handleOpen">打开表单</el-button>

    <AModal
      v-model="visible"
      :title="title"
      @closed="handleClosed"
      @confirm="handleConfirm"
    >
      <el-form ref="formRef" :model="formData" :rules="rules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" />
        </el-form-item>
      </el-form>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useDialog } from '@/composables/useDialog'

const { title, visible, openDialog, closeDialog } = useDialog({
  title: '新增项目'
})

const formRef = ref<FormInstance>()

// 初始状态
const initialFormData = {
  name: '',
  description: ''
}

// 表单数据
const formData = reactive({ ...initialFormData })

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
}

// 重置表单到初始状态
const resetForm = () => {
  Object.assign(formData, initialFormData)
  formRef.value?.resetFields()
}

const handleOpen = () => {
  resetForm()
  openDialog()
}

// 对话框完全关闭后重置
const handleClosed = () => {
  resetForm()
}

const handleConfirm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  console.log('提交数据:', formData)
  closeDialog()
}
</script>
```

## 实际业务场景

### 用户选择器

参考项目中的 UserSelect 组件实现：

```vue
<template>
  <div>
    <el-input
      v-model="displayValue"
      readonly
      placeholder="请选择用户"
      @click="userDialog.openDialog()"
    >
      <template #append>
        <el-button @click="userDialog.openDialog()">选择</el-button>
      </template>
    </el-input>

    <AModal
      v-model="userDialog.visible"
      :title="userDialog.title"
      size="large"
      @confirm="handleConfirm"
    >
      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="用户名">
          <el-input v-model="queryParams.userName" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="nickName" label="昵称" />
        <el-table-column prop="deptName" label="部门" />
        <el-table-column prop="phone" label="手机号" />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="getList"
        @current-change="getList"
      />
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useDialog } from '@/composables/useDialog'

interface User {
  userId: string
  userName: string
  nickName: string
  deptName: string
  phone: string
}

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const userDialog = useDialog({ title: '用户选择' })

const loading = ref(false)
const userList = ref<User[]>([])
const total = ref(0)
const selectedUsers = ref<User[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: ''
})

// 显示值
const displayValue = computed(() => {
  return selectedUsers.value.map(u => u.nickName).join(', ')
})

// 加载用户列表
const getList = async () => {
  loading.value = true
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    userList.value = [
      { userId: '1', userName: 'admin', nickName: '管理员', deptName: '技术部', phone: '13800138001' },
      { userId: '2', userName: 'user1', nickName: '用户1', deptName: '市场部', phone: '13800138002' }
    ]
    total.value = 2
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.userName = ''
  handleQuery()
}

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const handleConfirm = () => {
  const userIds = selectedUsers.value.map(u => u.userId)
  emit('update:modelValue', userIds)
  userDialog.closeDialog()
}

// 打开对话框时加载数据
watch(
  () => userDialog.visible.value,
  (val) => {
    if (val) {
      getList()
    }
  }
)
</script>
```

### CRUD 操作对话框

完整的增删改查场景：

```vue
<template>
  <div class="crud-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增
      </el-button>
      <el-button type="danger" :disabled="!hasSelection" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="code" label="编码" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <AModal
      v-model="formDialog.visible"
      :title="formDialog.title"
      :loading="formLoading"
      @confirm="submitForm"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="formData.code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
    </AModal>

    <!-- 查看详情对话框 -->
    <AModal
      v-model="detailDialog.visible"
      :title="detailDialog.title"
      :show-footer="false"
      mode="drawer"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="名称">{{ currentRow.name }}</el-descriptions-item>
        <el-descriptions-item label="编码">{{ currentRow.code }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentRow.status === '0' ? 'success' : 'danger'">
            {{ currentRow.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentRow.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow.createTime }}</el-descriptions-item>
      </el-descriptions>
    </AModal>

    <!-- 删除确认对话框 -->
    <AModal
      v-model="deleteDialog.visible"
      :title="deleteDialog.title"
      @confirm="confirmDelete"
    >
      <el-alert
        :title="deleteMessage"
        type="warning"
        :closable="false"
        show-icon
      />
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useDialog } from '@/composables/useDialog'

interface DataItem {
  id: string
  name: string
  code: string
  status: string
  remark?: string
  createTime?: string
}

// 对话框实例
const formDialog = useDialog()
const detailDialog = useDialog({ title: '详情' })
const deleteDialog = useDialog({ title: '确认删除' })

// 表格状态
const tableLoading = ref(false)
const tableData = ref<DataItem[]>([
  { id: '1', name: '项目A', code: 'PA001', status: '0', remark: '测试项目', createTime: '2024-12-25 10:00:00' },
  { id: '2', name: '项目B', code: 'PB002', status: '1', remark: '', createTime: '2024-12-24 15:30:00' }
])
const selectedRows = ref<DataItem[]>([])
const hasSelection = computed(() => selectedRows.value.length > 0)

// 表单状态
const formRef = ref<FormInstance>()
const formLoading = ref(false)
const isEdit = ref(false)
const formData = reactive<DataItem>({
  id: '',
  name: '',
  code: '',
  status: '0',
  remark: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }]
}

// 当前操作的行
const currentRow = ref<DataItem | null>(null)
const deleteIds = ref<string[]>([])

const deleteMessage = computed(() => {
  const count = deleteIds.value.length
  return count === 1
    ? `确定要删除 "${currentRow.value?.name}" 吗？`
    : `确定要删除选中的 ${count} 条记录吗？`
})

// 选择变化
const handleSelectionChange = (selection: DataItem[]) => {
  selectedRows.value = selection
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  formDialog.title.value = '新增'
  formDialog.openDialog()
}

// 编辑
const handleEdit = (row: DataItem) => {
  isEdit.value = true
  formDialog.title.value = '编辑'
  Object.assign(formData, row)
  formDialog.openDialog()
}

// 查看
const handleView = (row: DataItem) => {
  currentRow.value = row
  detailDialog.title.value = `详情 - ${row.name}`
  detailDialog.openDialog()
}

// 单个删除
const handleDelete = (row: DataItem) => {
  currentRow.value = row
  deleteIds.value = [row.id]
  deleteDialog.openDialog()
}

// 批量删除
const handleBatchDelete = () => {
  currentRow.value = null
  deleteIds.value = selectedRows.value.map(r => r.id)
  deleteDialog.openDialog()
}

// 确认删除
const confirmDelete = async () => {
  formLoading.value = true
  try {
    // await deleteByIds(deleteIds.value)
    console.log('删除:', deleteIds.value)
    tableData.value = tableData.value.filter(r => !deleteIds.value.includes(r.id))
    ElMessage.success('删除成功')
    deleteDialog.closeDialog()
  } finally {
    formLoading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  formLoading.value = true
  try {
    if (isEdit.value) {
      // await updateData(formData)
      console.log('更新:', formData)
      const index = tableData.value.findIndex(r => r.id === formData.id)
      if (index > -1) {
        tableData.value[index] = { ...formData }
      }
    } else {
      // await createData(formData)
      console.log('创建:', formData)
      tableData.value.push({
        ...formData,
        id: String(Date.now()),
        createTime: new Date().toLocaleString()
      })
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    formDialog.closeDialog()
  } finally {
    formLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: '',
    name: '',
    code: '',
    status: '0',
    remark: ''
  })
}
</script>

<style scoped>
.crud-container {
  padding: 20px;
}

.toolbar {
  margin-bottom: 16px;
}
</style>
```

## API 参考

### useDialog 函数签名

```typescript
function useDialog(options?: Options): Return
```

### Options 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | `''` | 对话框默认标题 |

### Return 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| title | `Ref<string>` | 对话框标题，响应式引用 |
| visible | `Ref<boolean>` | 对话框可见状态，响应式引用 |
| openDialog | `() => void` | 打开对话框的方法 |
| closeDialog | `() => void` | 关闭对话框的方法 |

### 类型定义

```typescript
import { Ref } from 'vue'

/**
 * 对话框配置选项
 */
interface Options {
  /**
   * 对话框标题
   * @default ''
   */
  title?: string
}

/**
 * 对话框钩子返回值
 */
interface Return {
  /**
   * 对话框标题（响应式）
   */
  title: Ref<string>

  /**
   * 对话框可见状态（响应式）
   */
  visible: Ref<boolean>

  /**
   * 打开对话框
   * @description 将 visible 设为 true
   */
  openDialog: () => void

  /**
   * 关闭对话框
   * @description 将 visible 设为 false
   */
  closeDialog: () => void
}

/**
 * useDialog 函数类型
 */
type UseDialog = (options?: Options) => Return
```

### AModal 组件 Props

配合使用的 AModal 组件完整 Props 定义：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `boolean` | `false` | 控制模态框显示/隐藏 |
| mode | `'dialog' \| 'drawer'` | `'dialog'` | 模态框模式 |
| title | `string` | - | 模态框标题 |
| width | `string \| number` | - | 自定义宽度/尺寸 |
| size | `'small' \| 'medium' \| 'large' \| 'xl'` | `'medium'` | 预设尺寸 |
| closable | `boolean` | `true` | 是否显示关闭按钮 |
| maskClosable | `boolean` | `false` | 是否可点击遮罩关闭 |
| keyboard | `boolean` | `true` | 是否可通过 ESC 键关闭 |
| destroyOnClose | `boolean` | `true` | 关闭时是否销毁内部元素 |
| appendToBody | `boolean` | `true` | 是否挂载到 body 元素 |
| beforeClose | `(done: () => void) => void` | - | 关闭前的回调函数 |
| movable | `boolean` | `false` | 是否可拖动（仅对话框模式） |
| direction | `'ltr' \| 'rtl' \| 'ttb' \| 'btt'` | `'rtl'` | 抽屉弹出方向 |
| showFooter | `boolean` | `true` | 是否显示底部操作区域 |
| footerType | `'default' \| 'close-only'` | `'default'` | 底部按钮类型 |
| footerAlign | `'left' \| 'center' \| 'right'` | `'right'` | 底部按钮对齐方式 |
| loading | `boolean` | `false` | 内容区域加载状态 |
| fullscreen | `boolean` | `false` | 是否全屏显示 |
| confirmText | `string` | `'确定'` | 确认按钮文本 |
| cancelText | `string` | `'取消'` | 取消按钮文本 |

### AModal 组件 Events

| 事件名 | 回调参数 | 说明 |
|--------|----------|------|
| update:modelValue | `(value: boolean)` | 更新 modelValue，实现 v-model |
| confirm | - | 点击确认按钮时触发 |
| cancel | - | 点击取消按钮时触发 |
| open | - | 模态框开始打开时触发 |
| opened | - | 模态框完全打开后触发 |
| close | - | 模态框开始关闭时触发 |
| closed | - | 模态框完全关闭后触发 |

### AModal 组件 Slots

| 插槽名 | 说明 |
|--------|------|
| default | 模态框主体内容 |
| header | 自定义标题内容 |
| footer | 自定义底部操作区域 |

## 最佳实践

### 1. 状态管理原则

**独立实例**
为每个对话框创建独立的 useDialog 实例，避免状态冲突：

```typescript
// ✅ 推荐：独立实例
const userDialog = useDialog({ title: '用户管理' })
const roleDialog = useDialog({ title: '角色管理' })

// ❌ 避免：共享实例
const dialog = useDialog()
// 然后尝试复用于多个对话框
```

**及时重置状态**
关闭对话框时重置相关状态：

```typescript
// ✅ 推荐：在 closed 事件中重置
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, initialFormData)
}

// 或使用 destroyOnClose 自动清理
<AModal :destroy-on-close="true">
```

### 2. 性能优化

**条件渲染**
对于复杂内容，使用 `v-if` 避免不必要的渲染：

```vue
<AModal v-model="visible" :destroy-on-close="true">
  <!-- 只在对话框打开时渲染 -->
  <template v-if="visible">
    <HeavyComponent />
  </template>
</AModal>
```

**懒加载数据**
在对话框打开时再加载数据：

```typescript
watch(
  () => dialog.visible.value,
  (val) => {
    if (val) {
      loadData()
    }
  }
)
```

### 3. 用户体验

**加载状态反馈**
异步操作时显示加载状态：

```vue
<AModal :loading="loading">
  <!-- 内容 -->
</AModal>
```

**关闭确认**
有未保存更改时提示用户：

```typescript
const handleBeforeClose = (done: () => void) => {
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm('有未保存的更改，确定关闭？')
      .then(() => done())
      .catch(() => {})
  } else {
    done()
  }
}
```

**键盘支持**
确保支持 ESC 键关闭：

```vue
<AModal :keyboard="true">
```

### 4. 代码组织

推荐的代码组织方式：

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDialog } from '@/composables/useDialog'

// ==================== 对话框管理 ====================
const formDialog = useDialog({ title: '表单对话框' })

// ==================== 表单状态 ====================
const formRef = ref()
const formData = reactive({
  // ...
})
const formRules = {
  // ...
}

// ==================== 业务方法 ====================
const handleAdd = () => {
  resetForm()
  formDialog.title.value = '新增'
  formDialog.openDialog()
}

const handleEdit = (row: any) => {
  Object.assign(formData, row)
  formDialog.title.value = '编辑'
  formDialog.openDialog()
}

const handleSubmit = async () => {
  // ...
}

// ==================== 辅助方法 ====================
const resetForm = () => {
  formRef.value?.resetFields()
}
</script>
```

## 常见问题

### 1. 对话框关闭后表单数据未清空

**问题原因：**
- 未在关闭事件中重置表单状态
- `destroyOnClose` 为 false 导致 DOM 保留

**解决方案：**

```vue
<AModal
  v-model="visible"
  :destroy-on-close="true"
  @closed="handleClosed"
>
  <el-form ref="formRef" :model="formData">
    <!-- 表单内容 -->
  </el-form>
</AModal>

<script setup lang="ts">
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, initialFormData)
}
</script>
```

### 2. 嵌套对话框遮罩层问题

**问题原因：**
- 多个对话框的遮罩层叠加
- z-index 层级冲突

**解决方案：**

```vue
<!-- 子对话框使用 append-to-body -->
<AModal
  v-model="childDialog.visible"
  :append-to-body="true"
>
  <!-- 子对话框内容 -->
</AModal>
```

### 3. 点击遮罩意外关闭对话框

**问题原因：**
- `maskClosable` 默认可能为 true
- 用户误触遮罩区域

**解决方案：**

```vue
<AModal
  v-model="visible"
  :mask-closable="false"
  :close-on-click-modal="false"
>
  <!-- 重要表单内容 -->
</AModal>
```

### 4. 对话框内表单验证不生效

**问题原因：**
- 表单 ref 未正确获取
- 验证规则配置错误
- `destroyOnClose` 导致表单实例被销毁

**解决方案：**

```vue
<template>
  <AModal v-model="visible" @confirm="handleConfirm">
    <el-form ref="formRef" :model="formData" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
    </el-form>
  </AModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()

const handleConfirm = async () => {
  // 确保 formRef 存在
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  // 提交逻辑
}
</script>
```

### 5. 对话框打开时数据未更新

**问题原因：**
- 对话框打开前数据未正确设置
- 响应式数据更新时机问题

**解决方案：**

```typescript
// 先设置数据，再打开对话框
const handleEdit = async (row: any) => {
  // 先加载数据
  const data = await fetchDetail(row.id)

  // 设置数据
  Object.assign(formData, data)

  // 最后打开对话框
  openDialog()
}

// 或使用 watch 监听
watch(
  () => visible.value,
  (val) => {
    if (val && editId.value) {
      loadData(editId.value)
    }
  }
)
```

### 6. 拖动功能在某些情况下失效

**问题原因：**
- 抽屉模式不支持拖动
- 全屏模式自动禁用拖动
- 对话框 DOM 结构变化

**解决方案：**

```vue
<!-- 确保是对话框模式且非全屏 -->
<AModal
  v-model="visible"
  mode="dialog"
  :fullscreen="false"
  :movable="true"
>
  <!-- 内容 -->
</AModal>
```

### 7. 使用 v-model 和 useDialog 冲突

**问题原因：**
- 同时使用 v-model 绑定和 useDialog 的 visible
- 双向绑定来源不一致

**解决方案：**

```vue
<!-- 方式1：完全使用 useDialog -->
<AModal v-model="dialog.visible" :title="dialog.title">

<!-- 方式2：完全使用 v-model + ref -->
<AModal v-model="dialogVisible" title="标题">

<script setup lang="ts">
// 方式1
const dialog = useDialog({ title: '对话框' })

// 方式2
const dialogVisible = ref(false)
</script>
```

**推荐做法：** 选择一种方式并保持一致，useDialog 更适合需要复用对话框逻辑的场景。
