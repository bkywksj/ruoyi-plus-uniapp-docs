# UserSelect 用户选择组件

## 介绍

UserSelect 用户选择组件是一个功能强大的业务组件，基于 `useSelection` 组合函数实现，提供弹窗式的用户选择功能。该组件集成了部门树过滤、搜索筛选、分页查询、单选/多选模式等核心功能，是后台管理系统中人员选择场景的最佳解决方案。

**核心特性：**

- **🌳 部门树过滤** - 支持通过左侧部门树快速定位和筛选用户，层级清晰，交互便捷
- **🔍 多维度搜索** - 支持按用户名称、手机号码、创建时间等条件进行搜索筛选
- **📄 跨页选择** - 多选模式下支持跨分页保持选中状态，使用 `useSelection` 组合函数实现
- **🎯 智能模式** - 同时支持单选和多选两种模式，满足不同业务场景需求
- **⚡ 智能绑定** - v-model 支持用户ID或用户对象，自动跟踪和返回对应类型
- **📄 预设激活** - data 属性可预设激活项，优先级高于 v-model
- **🏷️ 内置标签** - 可直接在组件上显示已选用户的标签列表，支持删除操作
- **💡 用户名显示** - 支持传入初始用户名数据，用于编辑模式下的用户名显示
- **🔧 高度可配置** - 按钮样式、标签大小、占位符等均可自定义
- **📋 可拖拽面板** - 使用 `AResizablePanels` 组件实现左右面板可拖拽调整宽度
- **📱 响应式设计** - 适配不同屏幕尺寸，在移动端也有良好体验

该组件广泛应用于审批流程指定审批人、任务分配责任人、项目成员管理、工单指派处理人等业务场景。

## 基本用法

### 多选模式（默认）

多选模式允许选择多个用户，选中的用户会以标签形式显示，适用于需要指定多个人员的场景：

```vue
<template>
  <div class="user-select-demo">
    <UserSelect
      v-model="selectedUsers"
      :multiple="true"
      @confirm-call-back="handleUserSelect"
    />

    <!-- 显示选中结果 -->
    <div v-if="selectedUsers.length > 0" class="mt-4">
      <h4>已选用户：</h4>
      <ul>
        <li v-for="user in selectedUsers" :key="user.userId">
          {{ user.nickName || user.userName }} (ID: {{ user.userId }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

// 选中的用户列表（对象数组形式）
const selectedUsers = ref<SysUserVo[]>([])

// 确认选择回调
const handleUserSelect = (users: SysUserVo[]) => {
  console.log('选中的用户：', users)
  // 可以在这里进行后续业务处理
}
</script>

<style scoped>
.user-select-demo {
  padding: 20px;
}
</style>
```

**使用说明：**
- 多选模式下，v-model 绑定的是用户对象数组或用户ID数组
- 点击"选择用户"按钮打开选择弹窗
- 在弹窗中可以通过复选框选择多个用户
- 选择完成后点击确认按钮，触发 `confirm-call-back` 事件

### 单选模式

单选模式只允许选择一个用户，适用于指定单个负责人的场景：

```vue
<template>
  <div class="user-select-demo">
    <h4>选择项目负责人：</h4>
    <UserSelect
      v-model="selectedUser"
      :multiple="false"
      button-text="选择负责人"
      @confirm-call-back="handleUserSelect"
    />

    <!-- 显示选中结果 -->
    <div v-if="selectedUser" class="mt-4">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ selectedUser.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ selectedUser.userName }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ selectedUser.nickName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ selectedUser.deptName }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ selectedUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ selectedUser.status }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

// 选中的用户（单个对象）
const selectedUser = ref<SysUserVo | null>(null)

const handleUserSelect = (user: SysUserVo) => {
  console.log('选中的用户：', user)
}
</script>
```

**使用说明：**
- 单选模式下，v-model 绑定的是单个用户对象或用户ID
- 在弹窗中使用单选按钮（Radio）进行选择
- 只能选择一个用户，选择新用户会自动替换之前的选择

### 使用用户ID绑定

有些场景下，后端接口只需要用户ID而非完整用户对象，可以使用 `default-return-type` 属性控制返回类型：

```vue
<template>
  <div class="user-select-demo">
    <!-- 返回用户ID数组 -->
    <div class="mb-4">
      <h4>返回用户ID（多选）：</h4>
      <UserSelect
        v-model="userIds"
        :multiple="true"
        default-return-type="id"
        button-text="选择审批人"
      />
      <div class="mt-2">
        <span>选中的用户ID：</span>
        <el-tag v-for="id in userIds" :key="id" class="ml-2">{{ id }}</el-tag>
      </div>
    </div>

    <!-- 返回单个用户ID -->
    <div>
      <h4>返回用户ID（单选）：</h4>
      <UserSelect
        v-model="userId"
        :multiple="false"
        default-return-type="id"
        button-text="选择经办人"
      />
      <div class="mt-2">
        <span>选中的用户ID：{{ userId || '未选择' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 多选模式下的用户ID数组
const userIds = ref<(string | number)[]>([])

// 单选模式下的用户ID
const userId = ref<string | number>('')
</script>
```

**使用说明：**
- 设置 `default-return-type="id"` 时，组件返回用户ID而非用户对象
- 多选模式返回 `(string | number)[]` 类型
- 单选模式返回 `string | number` 类型
- 这种方式适合只需要传递用户ID给后端的场景

## 自定义样式

### 自定义按钮样式

通过 `button-text`、`button-type`、`button-plain`、`button-size` 等属性可以自定义选择按钮的外观：

```vue
<template>
  <div class="button-style-demo">
    <!-- 默认样式 -->
    <div class="demo-item">
      <span class="label">默认样式：</span>
      <UserSelect v-model="users1" :multiple="true" />
    </div>

    <!-- 成功样式 -->
    <div class="demo-item">
      <span class="label">成功样式：</span>
      <UserSelect
        v-model="users2"
        :multiple="true"
        button-text="选择项目成员"
        button-type="success"
        :button-plain="false"
      />
    </div>

    <!-- 警告样式 -->
    <div class="demo-item">
      <span class="label">警告样式：</span>
      <UserSelect
        v-model="users3"
        :multiple="true"
        button-text="指定审批人"
        button-type="warning"
        button-size="large"
      />
    </div>

    <!-- 危险样式 -->
    <div class="demo-item">
      <span class="label">危险样式：</span>
      <UserSelect
        v-model="users4"
        :multiple="true"
        button-text="移交处理人"
        button-type="danger"
        :button-plain="true"
      />
    </div>

    <!-- 信息样式 -->
    <div class="demo-item">
      <span class="label">信息样式：</span>
      <UserSelect
        v-model="users5"
        :multiple="true"
        button-text="选择抄送人"
        button-type="info"
        button-size="small"
      />
    </div>

    <!-- 文本样式 -->
    <div class="demo-item">
      <span class="label">文本样式：</span>
      <UserSelect
        v-model="users6"
        :multiple="true"
        button-text="点击选择"
        button-type="text"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

const users1 = ref<SysUserVo[]>([])
const users2 = ref<SysUserVo[]>([])
const users3 = ref<SysUserVo[]>([])
const users4 = ref<SysUserVo[]>([])
const users5 = ref<SysUserVo[]>([])
const users6 = ref<SysUserVo[]>([])
</script>

<style scoped>
.button-style-demo {
  .demo-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .label {
      width: 100px;
      flex-shrink: 0;
    }
  }
}
</style>
```

**按钮属性说明：**
- `button-text`：按钮显示文本，默认为"选择用户"
- `button-type`：按钮类型，支持 primary/success/warning/danger/info/text
- `button-plain`：是否为朴素按钮，默认 true
- `button-size`：按钮尺寸，支持 large/default/small

### 自定义标签样式

通过 `tag-size` 属性可以调整已选用户标签的尺寸，同时支持隐藏选择数量：

```vue
<template>
  <div class="tag-style-demo">
    <!-- 大标签 -->
    <div class="demo-item">
      <span class="label">大标签：</span>
      <UserSelect
        v-model="users1"
        :multiple="true"
        tag-size="large"
        :show-count="true"
      />
    </div>

    <!-- 默认标签 -->
    <div class="demo-item">
      <span class="label">默认标签：</span>
      <UserSelect
        v-model="users2"
        :multiple="true"
        tag-size="default"
        :show-count="true"
      />
    </div>

    <!-- 小标签 -->
    <div class="demo-item">
      <span class="label">小标签：</span>
      <UserSelect
        v-model="users3"
        :multiple="true"
        tag-size="small"
        :show-count="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

const users1 = ref<SysUserVo[]>([
  { userId: '1', userName: 'admin', nickName: '管理员' } as SysUserVo
])
const users2 = ref<SysUserVo[]>([
  { userId: '2', userName: 'test', nickName: '测试用户' } as SysUserVo
])
const users3 = ref<SysUserVo[]>([
  { userId: '3', userName: 'user', nickName: '普通用户' } as SysUserVo
])
</script>
```

## 编辑模式

### 使用预设数据

在编辑场景中，需要显示已有的用户选择。可以通过 `data` 属性预设激活的用户：

```vue
<template>
  <div class="edit-mode-demo">
    <h4>编辑任务分配</h4>

    <!-- 方式一：使用用户对象数组预设 -->
    <div class="demo-item">
      <span class="label">使用对象预设：</span>
      <UserSelect
        v-model="selectedUsers"
        :data="presetUsers"
        :multiple="true"
      />
    </div>

    <!-- 方式二：使用用户ID数组预设 -->
    <div class="demo-item">
      <span class="label">使用ID预设：</span>
      <UserSelect
        v-model="selectedIds"
        :data="presetIds"
        :multiple="true"
        default-return-type="id"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

// 方式一：使用用户对象预设
const selectedUsers = ref<SysUserVo[]>([])
const presetUsers = ref<SysUserVo[]>([
  {
    userId: '1',
    userName: 'zhangsan',
    nickName: '张三',
    deptName: '研发部',
    phone: '13800138001',
    status: '1',
    createTime: '2024-01-01 10:00:00'
  } as SysUserVo,
  {
    userId: '2',
    userName: 'lisi',
    nickName: '李四',
    deptName: '产品部',
    phone: '13800138002',
    status: '1',
    createTime: '2024-01-02 10:00:00'
  } as SysUserVo
])

// 方式二：使用用户ID预设
const selectedIds = ref<(string | number)[]>([])
const presetIds = ref<(string | number)[]>(['1', '2', '3'])

// 模拟从API加载编辑数据
onMounted(async () => {
  // 从后端获取任务详情，包含已分配的用户
  // const taskDetail = await getTaskDetail(taskId)
  // presetUsers.value = taskDetail.assignees
})
</script>
```

**使用说明：**
- `data` 属性的优先级高于 `modelValue`
- 组件会自动识别 `data` 的类型（对象数组或ID数组）
- 如果传入的是ID数组，组件会通过API自动获取用户详细信息

### 使用用户名显示

当只有用户ID而没有用户对象时，可以通过 `initial-user-names` 属性传入用户名用于显示：

```vue
<template>
  <div class="username-demo">
    <!-- 使用字符串形式的用户名（逗号分隔） -->
    <div class="demo-item">
      <span class="label">字符串形式：</span>
      <UserSelect
        v-model="userIds1"
        :initial-user-names="userNamesString"
        :multiple="true"
      />
    </div>

    <!-- 使用数组形式的用户名 -->
    <div class="demo-item">
      <span class="label">数组形式：</span>
      <UserSelect
        v-model="userIds2"
        :initial-user-names="userNamesArray"
        :multiple="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 使用字符串形式
const userIds1 = ref(['1', '2', '3'])
const userNamesString = ref('张三,李四,王五')

// 使用数组形式
const userIds2 = ref(['4', '5', '6'])
const userNamesArray = ref(['赵六', '钱七', '孙八'])
</script>
```

**使用说明：**
- `initial-user-names` 支持字符串（逗号分隔）或字符串数组
- 用户名会与用户ID按顺序一一对应显示
- 这在编辑模式下非常有用，避免额外的API调用获取用户信息

## 限制用户范围

### 使用 userIds 限制

通过 `user-ids` 属性可以限制用户只能从指定的范围内选择：

```vue
<template>
  <div class="limit-users-demo">
    <h4>限制用户选择范围</h4>

    <!-- 只能选择指定部门的用户 -->
    <div class="demo-item">
      <span class="label">研发部成员：</span>
      <UserSelect
        v-model="selectedDevUsers"
        :user-ids="devUserIds"
        :multiple="true"
        button-text="选择研发人员"
      />
    </div>

    <!-- 只能选择有权限的用户 -->
    <div class="demo-item">
      <span class="label">审批权限用户：</span>
      <UserSelect
        v-model="selectedApprovers"
        :user-ids="approverIds"
        :multiple="false"
        button-text="选择审批人"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

const selectedDevUsers = ref<SysUserVo[]>([])
const devUserIds = ref<(string | number)[]>([])

const selectedApprovers = ref<SysUserVo | null>(null)
const approverIds = ref<(string | number)[]>([])

// 模拟从API获取可选用户范围
onMounted(async () => {
  // 获取研发部用户ID列表
  // const devUsers = await getDeptUsers('dev')
  // devUserIds.value = devUsers.map(u => u.userId)
  devUserIds.value = ['1', '2', '3', '4', '5']

  // 获取有审批权限的用户ID列表
  // const approvers = await getApproverUsers()
  // approverIds.value = approvers.map(u => u.userId)
  approverIds.value = ['10', '11', '12']
})
</script>
```

**使用说明：**
- 传入 `user-ids` 后，用户列表只显示指定ID范围内的用户
- 可以配合角色、部门等条件动态获取可选用户范围
- 适用于需要限制选择范围的业务场景

## 内置标签控制

### 隐藏内置标签

有时候需要自定义用户展示方式，可以隐藏内置标签，通过 ref 手动控制弹窗：

```vue
<template>
  <div class="custom-display-demo">
    <h4>自定义用户展示</h4>

    <!-- 隐藏内置标签 -->
    <UserSelect
      ref="userSelectRef"
      v-model="selectedUsers"
      :show-inline-tags="false"
      :multiple="true"
      @confirm-call-back="handleConfirm"
    />

    <!-- 自定义展示区域 -->
    <div class="custom-display">
      <el-button type="primary" @click="openUserSelect">
        <el-icon><Plus /></el-icon>
        添加成员
      </el-button>

      <div v-if="selectedUsers.length > 0" class="user-list">
        <div
          v-for="user in selectedUsers"
          :key="user.userId"
          class="user-item"
        >
          <el-avatar :size="32">
            {{ user.nickName?.charAt(0) || user.userName?.charAt(0) }}
          </el-avatar>
          <div class="user-info">
            <div class="name">{{ user.nickName || user.userName }}</div>
            <div class="dept">{{ user.deptName }}</div>
          </div>
          <el-button
            type="danger"
            text
            size="small"
            @click="removeUser(user.userId)"
          >
            移除
          </el-button>
        </div>
      </div>

      <el-empty v-else description="暂未添加成员" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

const userSelectRef = ref()
const selectedUsers = ref<SysUserVo[]>([])

// 手动打开选择弹窗
const openUserSelect = () => {
  userSelectRef.value?.open()
}

// 确认选择
const handleConfirm = (users: SysUserVo[]) => {
  console.log('已选择用户：', users)
}

// 移除用户
const removeUser = (userId: string | number) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.userId !== userId)
}
</script>

<style scoped>
.custom-display {
  margin-top: 16px;
  padding: 16px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;

  .user-list {
    margin-top: 16px;

    .user-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 8px;
      background: var(--el-fill-color-light);
      border-radius: 6px;

      .user-info {
        flex: 1;
        margin-left: 12px;

        .name {
          font-weight: 500;
        }

        .dept {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>
```

### 只读与禁用模式

通过 `readonly` 和 `disabled` 属性控制标签的交互状态：

```vue
<template>
  <div class="readonly-demo">
    <!-- 只读模式：不能删除标签 -->
    <div class="demo-item">
      <span class="label">只读模式：</span>
      <UserSelect
        v-model="users1"
        :multiple="true"
        :readonly="true"
      />
    </div>

    <!-- 禁用模式：不能删除标签 -->
    <div class="demo-item">
      <span class="label">禁用模式：</span>
      <UserSelect
        v-model="users2"
        :multiple="true"
        :disabled="true"
      />
    </div>

    <!-- 正常模式：可以删除标签 -->
    <div class="demo-item">
      <span class="label">正常模式：</span>
      <UserSelect
        v-model="users3"
        :multiple="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

const createUser = (id: string, name: string): SysUserVo => ({
  userId: id,
  userName: name,
  nickName: name,
  deptName: '技术部',
  phone: '13800138000',
  status: '1',
  createTime: '2024-01-01'
} as SysUserVo)

const users1 = ref([createUser('1', '张三'), createUser('2', '李四')])
const users2 = ref([createUser('3', '王五'), createUser('4', '赵六')])
const users3 = ref([createUser('5', '钱七'), createUser('6', '孙八')])
</script>
```

## 在表单中使用

### 基础表单集成

在 Element Plus 表单中使用 UserSelect 组件：

```vue
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="任务名称" prop="taskName">
      <el-input v-model="form.taskName" placeholder="请输入任务名称" />
    </el-form-item>

    <el-form-item label="负责人" prop="managerId">
      <UserSelect
        v-model="form.managerId"
        :multiple="false"
        default-return-type="id"
        button-text="选择负责人"
      />
    </el-form-item>

    <el-form-item label="项目成员" prop="memberIds">
      <UserSelect
        v-model="form.memberIds"
        :multiple="true"
        default-return-type="id"
        button-text="选择项目成员"
      />
    </el-form-item>

    <el-form-item label="抄送人员" prop="ccUserIds">
      <UserSelect
        v-model="form.ccUserIds"
        :multiple="true"
        default-return-type="id"
        button-text="选择抄送人"
        button-type="info"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  taskName: '',
  managerId: '',
  memberIds: [] as (string | number)[],
  ccUserIds: [] as (string | number)[]
})

const rules: FormRules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  managerId: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ],
  memberIds: [
    {
      type: 'array',
      required: true,
      min: 1,
      message: '请至少选择一个项目成员',
      trigger: 'change'
    }
  ]
}

const submitForm = async () => {
  try {
    await formRef.value?.validate()
    console.log('表单数据：', form)
    // 调用API提交表单
    // await createTask(form)
    ElMessage.success('提交成功')
  } catch (error) {
    console.error('表单验证失败：', error)
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
}
</script>
```

### 与 AModal 对话框集成

在弹窗表单中使用 UserSelect：

```vue
<template>
  <div>
    <el-button type="primary" @click="handleAdd">新增任务</el-button>
    <el-button type="primary" @click="handleEdit">编辑任务</el-button>

    <AModal
      v-model="dialog.visible.value"
      :title="dialog.title.value"
      mode="dialog"
      size="md"
      @confirm="handleSubmit"
      @cancel="handleCancel"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="执行人" prop="executorId">
          <UserSelect
            v-model="form.executorId"
            :multiple="false"
            default-return-type="id"
          />
        </el-form-item>

        <el-form-item label="协作人" prop="collaboratorIds">
          <UserSelect
            v-model="form.collaboratorIds"
            :multiple="true"
            default-return-type="id"
          />
        </el-form-item>
      </el-form>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const dialog = useDialog({ title: '任务管理' })
const formRef = ref<FormInstance>()

const form = reactive({
  id: '',
  name: '',
  executorId: '',
  collaboratorIds: [] as (string | number)[]
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  executorId: [{ required: true, message: '请选择执行人', trigger: 'change' }]
}

const handleAdd = () => {
  Object.assign(form, { id: '', name: '', executorId: '', collaboratorIds: [] })
  dialog.openDialog('新增任务')
}

const handleEdit = () => {
  // 模拟加载编辑数据
  Object.assign(form, {
    id: '1',
    name: '示例任务',
    executorId: '101',
    collaboratorIds: ['102', '103']
  })
  dialog.openDialog('编辑任务')
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    console.log('提交数据：', form)
    dialog.closeDialog()
    ElMessage.success('操作成功')
  } catch (error) {
    console.error('验证失败')
  }
}

const handleCancel = () => {
  formRef.value?.resetFields()
}
</script>
```

### 与工作流集成

在审批流程中使用 UserSelect 指定审批人：

```vue
<template>
  <div class="workflow-demo">
    <h4>审批流程配置</h4>

    <el-steps :active="activeStep" finish-status="success" class="mb-4">
      <el-step title="发起申请" />
      <el-step title="部门审批" />
      <el-step title="总经理审批" />
      <el-step title="完成" />
    </el-steps>

    <el-form :model="approvalConfig" label-width="120px">
      <!-- 步骤1：部门审批人 -->
      <el-form-item label="部门审批人">
        <UserSelect
          v-model="approvalConfig.deptApprover"
          :multiple="false"
          :user-ids="deptManagerIds"
          button-text="选择部门经理"
        />
        <div class="form-tip">仅显示部门经理级别用户</div>
      </el-form-item>

      <!-- 步骤2：总经理审批人 -->
      <el-form-item label="总经理审批">
        <UserSelect
          v-model="approvalConfig.gmApprover"
          :multiple="false"
          :user-ids="gmUserIds"
          button-text="选择总经理"
        />
      </el-form-item>

      <!-- 抄送人员 -->
      <el-form-item label="抄送人员">
        <UserSelect
          v-model="approvalConfig.ccUsers"
          :multiple="true"
          button-text="选择抄送人"
          button-type="info"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitApproval">提交审批</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

const activeStep = ref(0)

const approvalConfig = reactive({
  deptApprover: null as SysUserVo | null,
  gmApprover: null as SysUserVo | null,
  ccUsers: [] as SysUserVo[]
})

// 可选的部门经理ID列表
const deptManagerIds = ref<(string | number)[]>([])
// 可选的总经理ID列表
const gmUserIds = ref<(string | number)[]>([])

onMounted(async () => {
  // 获取部门经理列表
  // const managers = await getDeptManagers(currentDeptId)
  // deptManagerIds.value = managers.map(m => m.userId)
  deptManagerIds.value = ['10', '11', '12']

  // 获取总经理列表
  // const gms = await getGMUsers()
  // gmUserIds.value = gms.map(g => g.userId)
  gmUserIds.value = ['1', '2']
})

const submitApproval = () => {
  console.log('审批配置：', approvalConfig)
  // 提交审批流程
}
</script>

<style scoped>
.workflow-demo {
  padding: 20px;

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
}
</style>
```

## 高级用法

### 动态控制选择范围

根据业务条件动态控制可选用户范围：

```vue
<template>
  <div class="dynamic-range-demo">
    <el-form label-width="100px">
      <!-- 先选择部门 -->
      <el-form-item label="选择部门">
        <el-tree-select
          v-model="selectedDeptId"
          :data="deptTree"
          :props="{ label: 'label', value: 'id' }"
          placeholder="请选择部门"
          check-strictly
          @change="handleDeptChange"
        />
      </el-form-item>

      <!-- 根据部门动态加载用户 -->
      <el-form-item label="选择用户">
        <UserSelect
          v-model="selectedUsers"
          :multiple="true"
          :user-ids="deptUserIds"
          :key="selectedDeptId"
          button-text="选择部门成员"
        />
        <div v-if="!selectedDeptId" class="form-tip">
          请先选择部门
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

// 部门树数据
const deptTree = ref([
  {
    id: '1',
    label: '总公司',
    children: [
      { id: '2', label: '研发部' },
      { id: '3', label: '产品部' },
      { id: '4', label: '市场部' }
    ]
  }
])

const selectedDeptId = ref<string>('')
const selectedUsers = ref<SysUserVo[]>([])
const deptUserIds = ref<(string | number)[]>([])

// 部门变更时，重新加载部门用户
const handleDeptChange = async (deptId: string) => {
  if (!deptId) {
    deptUserIds.value = []
    selectedUsers.value = []
    return
  }

  // 模拟根据部门获取用户ID列表
  // const users = await getDeptUsers(deptId)
  // deptUserIds.value = users.map(u => u.userId)

  const mockUsersByDept: Record<string, string[]> = {
    '1': ['1', '2', '3', '4', '5'],
    '2': ['10', '11', '12'],
    '3': ['20', '21', '22'],
    '4': ['30', '31', '32']
  }

  deptUserIds.value = mockUsersByDept[deptId] || []
  selectedUsers.value = [] // 清空之前的选择
}
</script>
```

### 自定义用户列表查询

通过监听组件事件自定义查询逻辑：

```vue
<template>
  <div class="custom-query-demo">
    <h4>自定义用户查询</h4>

    <!-- 额外的筛选条件 -->
    <div class="extra-filters mb-4">
      <el-select
        v-model="roleFilter"
        placeholder="按角色筛选"
        clearable
        @change="handleRoleChange"
      >
        <el-option label="管理员" value="admin" />
        <el-option label="普通用户" value="user" />
        <el-option label="访客" value="guest" />
      </el-select>

      <el-select
        v-model="statusFilter"
        placeholder="按状态筛选"
        clearable
        class="ml-2"
        @change="handleStatusChange"
      >
        <el-option label="正常" value="1" />
        <el-option label="停用" value="0" />
      </el-select>
    </div>

    <UserSelect
      v-model="selectedUsers"
      :multiple="true"
      :user-ids="filteredUserIds"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

const roleFilter = ref('')
const statusFilter = ref('')
const selectedUsers = ref<SysUserVo[]>([])

// 模拟用户数据
const allUsers = ref([
  { userId: '1', role: 'admin', status: '1' },
  { userId: '2', role: 'admin', status: '1' },
  { userId: '3', role: 'user', status: '1' },
  { userId: '4', role: 'user', status: '0' },
  { userId: '5', role: 'guest', status: '1' }
])

// 根据筛选条件过滤用户ID
const filteredUserIds = computed(() => {
  return allUsers.value
    .filter(user => {
      if (roleFilter.value && user.role !== roleFilter.value) return false
      if (statusFilter.value && user.status !== statusFilter.value) return false
      return true
    })
    .map(user => user.userId)
})

const handleRoleChange = () => {
  selectedUsers.value = [] // 清空选择
}

const handleStatusChange = () => {
  selectedUsers.value = [] // 清空选择
}
</script>
```

### 与表格批量操作集成

在表格中实现批量分配用户功能：

```vue
<template>
  <div class="table-batch-demo">
    <el-table
      ref="tableRef"
      :data="tableData"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="任务名称" />
      <el-table-column prop="assignee" label="负责人">
        <template #default="{ row }">
          <el-tag v-if="row.assignee">{{ row.assignee.nickName }}</el-tag>
          <span v-else class="text-gray-400">未分配</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="assignSingle(row)">分配</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量操作按钮 -->
    <div class="batch-actions mt-4">
      <el-button
        type="primary"
        :disabled="selectedRows.length === 0"
        @click="batchAssign"
      >
        批量分配 ({{ selectedRows.length }})
      </el-button>
    </div>

    <!-- 用户选择器（隐藏内置标签） -->
    <UserSelect
      ref="userSelectRef"
      v-model="selectedUser"
      :multiple="false"
      :show-inline-tags="false"
      @confirm-call-back="handleUserConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SysUserVo } from '@/api/system/core/user/userTypes'

interface TaskRow {
  id: string
  name: string
  assignee: SysUserVo | null
}

const tableRef = ref()
const userSelectRef = ref()
const selectedRows = ref<TaskRow[]>([])
const selectedUser = ref<SysUserVo | null>(null)
const currentRow = ref<TaskRow | null>(null)
const isBatchMode = ref(false)

const tableData = ref<TaskRow[]>([
  { id: '1', name: '任务一', assignee: null },
  { id: '2', name: '任务二', assignee: null },
  { id: '3', name: '任务三', assignee: null }
])

const handleSelectionChange = (rows: TaskRow[]) => {
  selectedRows.value = rows
}

// 单个分配
const assignSingle = (row: TaskRow) => {
  currentRow.value = row
  isBatchMode.value = false
  userSelectRef.value?.open()
}

// 批量分配
const batchAssign = () => {
  isBatchMode.value = true
  userSelectRef.value?.open()
}

// 用户确认选择
const handleUserConfirm = (user: SysUserVo) => {
  if (isBatchMode.value) {
    // 批量分配
    selectedRows.value.forEach(row => {
      row.assignee = user
    })
    tableRef.value?.clearSelection()
    ElMessage.success(`已为 ${selectedRows.value.length} 个任务分配负责人`)
  } else if (currentRow.value) {
    // 单个分配
    currentRow.value.assignee = user
    ElMessage.success('分配成功')
  }

  currentRow.value = null
  isBatchMode.value = false
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model-value / v-model | 选中项的双向绑定值 | `string \| number \| (string \| number)[] \| SysUserVo \| SysUserVo[]` | — | `undefined` |
| multiple | 是否为多选模式 | `boolean` | `true` / `false` | `false` |
| data | 预设激活的用户数据，优先级高于 modelValue | `string \| number \| (string \| number)[] \| SysUserVo \| SysUserVo[]` | — | `undefined` |
| user-ids | 限制可选的用户ID范围 | `string \| number \| (string \| number)[]` | — | `undefined` |
| default-return-type | 当 modelValue 为空时的默认返回类型 | `'object' \| 'id'` | `object` / `id` | `'object'` |
| show-inline-tags | 是否显示内置标签选择器 | `boolean` | `true` / `false` | `false` |
| button-text | 选择按钮的文本 | `string` | — | `'选择用户'` |
| button-type | 选择按钮的类型 | `string` | `primary` / `success` / `warning` / `danger` / `info` / `text` / `''` | `'primary'` |
| button-plain | 选择按钮是否为朴素按钮 | `boolean` | `true` / `false` | `true` |
| button-size | 选择按钮的尺寸 | `string` | `large` / `default` / `small` | `'small'` |
| tag-size | 标签的尺寸 | `string` | `large` / `default` / `small` | `'small'` |
| show-count | 是否在按钮上显示选中数量 | `boolean` | `true` / `false` | `true` |
| disabled | 是否禁用（禁用删除标签功能） | `boolean` | `true` / `false` | `false` |
| readonly | 是否只读（只读删除标签功能） | `boolean` | `true` / `false` | `false` |
| initial-user-names | 初始用户名数据，用于编辑时显示 | `string \| string[]` | — | `undefined` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 选中值变化时触发 | `value: string \| number \| (string \| number)[] \| SysUserVo \| SysUserVo[] \| null` |
| confirm-call-back | 确认选择时触发 | `users: SysUserVo \| SysUserVo[] \| null` |

### Methods

通过 ref 可以调用组件的方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开用户选择对话框 | — | `void` |
| close | 关闭用户选择对话框 | — | `void` |

**使用示例：**

```vue
<template>
  <UserSelect ref="userSelectRef" v-model="users" :show-inline-tags="false" />
  <el-button @click="userSelectRef?.open()">选择用户</el-button>
</template>

<script setup lang="ts">
const userSelectRef = ref()
const users = ref([])
</script>
```

### 类型定义

```typescript
/**
 * 用户选择组件 Props 接口
 */
interface UserSelectProps {
  /** 选中项的双向绑定值 */
  modelValue?: string | number | (string | number)[] | SysUserVo | SysUserVo[] | undefined
  /** 是否为多选模式 */
  multiple?: boolean
  /** 预设激活的用户数据 */
  data?: string | number | (string | number)[] | SysUserVo | SysUserVo[] | undefined
  /** 限制可选的用户ID范围 */
  userIds?: string | number | (string | number)[] | undefined
  /** 当 modelValue 为空时的默认返回类型 */
  defaultReturnType?: 'object' | 'id'
  /** 是否显示内置标签选择器 */
  showInlineTags?: boolean
  /** 选择按钮的文本 */
  buttonText?: string
  /** 选择按钮的类型 */
  buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | ''
  /** 选择按钮是否为朴素按钮 */
  buttonPlain?: boolean
  /** 选择按钮的尺寸 */
  buttonSize?: 'large' | 'default' | 'small'
  /** 标签的尺寸 */
  tagSize?: 'large' | 'default' | 'small'
  /** 是否显示选中数量 */
  showCount?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 初始用户名数据 */
  initialUserNames?: string | string[]
}

/**
 * 系统用户视图对象
 */
interface SysUserVo {
  /** 用户ID */
  userId: string | number
  /** 用户名 */
  userName: string
  /** 用户昵称 */
  nickName: string
  /** 部门名称 */
  deptName: string
  /** 手机号码 */
  phone: string
  /** 用户状态：1-正常，0-停用 */
  status: string
  /** 创建时间 */
  createTime: string
}

/**
 * 用户查询参数
 */
interface SysUserQuery {
  /** 当前页码 */
  pageNum: number
  /** 每页条数 */
  pageSize: number
  /** 用户名 */
  userName?: string
  /** 手机号 */
  phone?: string
  /** 状态 */
  status?: string
  /** 部门ID */
  deptId?: string | number
  /** 角色ID */
  roleId?: string | number
  /** 用户ID列表（用于限制范围） */
  userIds?: string | (string | number)[]
  /** 扩展参数 */
  params?: Record<string, any>
}
```

### 依赖组件

UserSelect 组件内部使用了以下组件和函数：

| 依赖 | 说明 |
|------|------|
| `AModal` | 弹窗容器组件 |
| `AResizablePanels` | 可拖拽调整宽度的面板组件 |
| `ASearchForm` | 搜索表单组件 |
| `ASelectionTags` | 已选标签显示组件 |
| `useSelection` | 选择状态管理组合函数 |
| `useDialog` | 弹窗状态管理组合函数 |
| `useDict` | 字典数据管理组合函数 |
| `DictTag` | 字典标签显示组件 |
| `Pagination` | 分页组件 |

## 主题定制

### CSS 变量

UserSelect 组件使用 Element Plus 的主题变量，可通过以下方式定制：

```scss
// 自定义主题变量
:root {
  // 按钮颜色
  --el-color-primary: #409eff;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
  --el-color-info: #909399;

  // 标签颜色
  --el-tag-bg-color: var(--el-color-primary-light-9);
  --el-tag-border-color: var(--el-color-primary-light-8);
  --el-tag-text-color: var(--el-color-primary);

  // 边框颜色
  --el-border-color: #dcdfe6;
  --el-border-color-light: #e4e7ed;

  // 填充颜色
  --el-fill-color-light: #f5f7fa;
}
```

### 自定义样式

```vue
<template>
  <div class="custom-user-select">
    <UserSelect v-model="users" :multiple="true" />
  </div>
</template>

<style scoped>
.custom-user-select {
  /* 自定义容器样式 */
  :deep(.user-selector-container) {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }

  /* 自定义标签样式 */
  :deep(.el-tag) {
    border-radius: 16px;
    padding: 0 12px;
  }

  /* 自定义按钮样式 */
  :deep(.el-button) {
    border-radius: 20px;
  }
}
</style>
```

### 响应式适配

组件内置了响应式处理，在小屏幕上会自动调整布局：

```scss
// 组件内置的响应式样式
@media (max-width: 768px) {
  .user-selector-container {
    .flex {
      flex-direction: column;
      align-items: stretch;
    }

    .el-button {
      margin-bottom: 8px;
    }
  }
}
```

## 最佳实践

### 1. 正确处理返回类型

根据后端接口需求选择合适的返回类型：

```vue
<template>
  <!-- ✅ 推荐：后端需要用户ID时使用 id 类型 -->
  <UserSelect
    v-model="form.assigneeId"
    default-return-type="id"
  />

  <!-- ✅ 推荐：需要用户详细信息时使用 object 类型 -->
  <UserSelect
    v-model="form.assignee"
    default-return-type="object"
  />

  <!-- ❌ 不推荐：类型不匹配可能导致问题 -->
  <UserSelect
    v-model="stringId"  <!-- string 类型 -->
    default-return-type="object"  <!-- 返回 object -->
  />
</template>

<script setup lang="ts">
// ✅ 类型定义与 default-return-type 保持一致
const form = reactive({
  assigneeId: '' as string,  // id 类型返回 string
  assignee: null as SysUserVo | null  // object 类型返回 SysUserVo
})
</script>
```

### 2. 编辑模式下的数据初始化

编辑表单时，正确初始化用户选择组件：

```vue
<template>
  <el-form :model="form">
    <el-form-item label="负责人">
      <!-- 使用 data 属性预设选中用户 -->
      <UserSelect
        v-model="form.managerId"
        :data="initialManager"
        :multiple="false"
        default-return-type="id"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const props = defineProps<{ taskId: string }>()

const form = reactive({
  managerId: ''
})

// 初始用户数据
const initialManager = ref<SysUserVo | null>(null)

// 加载编辑数据
onMounted(async () => {
  const [err, data] = await getTaskDetail(props.taskId)
  if (!err && data) {
    form.managerId = data.managerId
    // 设置初始用户对象，用于显示用户名
    initialManager.value = data.manager
  }
})
</script>
```

### 3. 表单验证集成

正确配置表单验证规则：

```vue
<script setup lang="ts">
const rules: FormRules = {
  // 单选必填验证
  managerId: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ],

  // 多选至少选择一个
  memberIds: [
    {
      type: 'array',
      required: true,
      min: 1,
      message: '请至少选择一个成员',
      trigger: 'change'
    }
  ],

  // 多选数量限制
  reviewerIds: [
    {
      type: 'array',
      min: 2,
      max: 5,
      message: '请选择 2-5 个评审人',
      trigger: 'change'
    }
  ]
}
</script>
```

### 4. 性能优化

处理大量用户数据时的优化建议：

```vue
<template>
  <!-- 使用 user-ids 限制查询范围 -->
  <UserSelect
    v-model="selectedUsers"
    :user-ids="allowedUserIds"
    :multiple="true"
  />
</template>

<script setup lang="ts">
// ✅ 推荐：预先加载允许选择的用户ID
const allowedUserIds = ref<string[]>([])

onMounted(async () => {
  // 获取当前项目的成员ID列表
  const members = await getProjectMembers(projectId)
  allowedUserIds.value = members.map(m => m.userId)
})

// ❌ 不推荐：不加限制加载所有用户
// 当系统用户量大时会影响性能
</script>
```

### 5. 多实例场景处理

同一页面使用多个 UserSelect 实例时：

```vue
<template>
  <el-form :model="form">
    <!-- 每个实例使用独立的 ref -->
    <el-form-item label="申请人">
      <UserSelect
        ref="applicantRef"
        v-model="form.applicantId"
        :multiple="false"
      />
    </el-form-item>

    <el-form-item label="审批人">
      <UserSelect
        ref="approverRef"
        v-model="form.approverId"
        :multiple="false"
      />
    </el-form-item>

    <el-form-item label="抄送人">
      <UserSelect
        ref="ccRef"
        v-model="form.ccIds"
        :multiple="true"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
// 独立的 ref 引用
const applicantRef = ref()
const approverRef = ref()
const ccRef = ref()

// 可以独立控制每个选择器
const openApplicantSelect = () => applicantRef.value?.open()
const openApproverSelect = () => approverRef.value?.open()
const openCcSelect = () => ccRef.value?.open()
</script>
```

## 常见问题

### 1. 选中用户后标签不显示用户名

**问题原因：**
- 使用了用户ID绑定但没有传入用户对象
- 初始数据只有ID没有用户信息

**解决方案：**

```vue
<template>
  <!-- 方案一：使用 initial-user-names 属性 -->
  <UserSelect
    v-model="userIds"
    :initial-user-names="userNames"
    :multiple="true"
  />

  <!-- 方案二：使用 data 属性传入完整用户对象 -->
  <UserSelect
    v-model="userIds"
    :data="userObjects"
    :multiple="true"
  />
</template>

<script setup lang="ts">
// 方案一：传入用户名
const userIds = ref(['1', '2'])
const userNames = ref('张三,李四')

// 方案二：传入用户对象
const userObjects = ref([
  { userId: '1', userName: 'zhangsan', nickName: '张三' },
  { userId: '2', userName: 'lisi', nickName: '李四' }
])
</script>
```

### 2. 表单验证不触发

**问题原因：**
- 表单项 prop 名称与 v-model 绑定的字段不一致
- 验证规则的 trigger 设置不正确

**解决方案：**

```vue
<template>
  <el-form :model="form" :rules="rules">
    <!-- ✅ prop 与 v-model 绑定字段一致 -->
    <el-form-item label="负责人" prop="managerId">
      <UserSelect v-model="form.managerId" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  managerId: ''  // 与 prop 名称一致
})

const rules = {
  managerId: [
    { required: true, message: '请选择负责人', trigger: 'change' }  // 使用 change 触发
  ]
}
</script>
```

### 3. 跨页选择后数据丢失

**问题原因：**
- 没有正确使用 `useSelection` 的跨页保持功能
- 分页切换时重置了选择状态

**解决方案：**

UserSelect 组件内置了跨页选择保持功能，确保：
- 使用多选模式 `:multiple="true"`
- 不要手动清空 v-model 绑定的值

```vue
<template>
  <!-- 组件已内置跨页选择保持 -->
  <UserSelect
    v-model="selectedUsers"
    :multiple="true"
  />
</template>

<script setup lang="ts">
// 不要在分页切换时重置 selectedUsers
const selectedUsers = ref<SysUserVo[]>([])
</script>
```

### 4. 单选模式返回了数组

**问题原因：**
- `multiple` 属性设置为 `true`
- 绑定的变量类型与模式不匹配

**解决方案：**

```vue
<template>
  <!-- ✅ 单选模式 -->
  <UserSelect
    v-model="singleUser"
    :multiple="false"
  />
</template>

<script setup lang="ts">
// 单选模式使用单个对象或ID
const singleUser = ref<SysUserVo | null>(null)
// 或
const singleUserId = ref<string | number>('')
</script>
```

### 5. 限制用户范围后查询不到用户

**问题原因：**
- `user-ids` 传入的是空数组
- `user-ids` 中的 ID 在系统中不存在

**解决方案：**

```vue
<script setup lang="ts">
const userIds = ref<string[]>([])

onMounted(async () => {
  // 确保获取到有效的用户ID列表
  const [err, data] = await getAvailableUsers()
  if (!err && data.length > 0) {
    userIds.value = data.map(u => u.userId)
  } else {
    // 如果没有可用用户，可以给用户提示
    ElMessage.warning('没有可选择的用户')
  }
})
</script>
```

### 6. 弹窗打开后数据为空

**问题原因：**
- API 接口请求失败
- 网络问题或权限问题

**解决方案：**

组件内部会自动处理请求错误，但建议检查：
- 网络连接是否正常
- 用户是否有查询用户列表的权限
- API 地址是否正确配置

```vue
<script setup lang="ts">
// 可以通过开发者工具的 Network 面板检查 API 请求
// 确保 pageUsers 和 getDeptTreeOptions 接口正常响应
</script>
```

### 7. 编辑模式下用户名和ID不匹配

**问题原因：**
- `initial-user-names` 的顺序与 `v-model` 绑定的 ID 顺序不一致

**解决方案：**

```vue
<script setup lang="ts">
// 确保用户名和ID的顺序一一对应
const userIds = ref(['1', '2', '3'])
const userNames = ref('用户1,用户2,用户3')  // 顺序对应

// 或者使用 data 属性传入完整对象，更加可靠
const userData = ref([
  { userId: '1', nickName: '用户1' },
  { userId: '2', nickName: '用户2' },
  { userId: '3', nickName: '用户3' }
])
</script>
```

## 功能特性总结

### 用户筛选
- **部门树过滤**：通过左侧部门树快速定位部门用户，支持树节点搜索
- **关键词搜索**：支持按用户名、手机号等条件实时搜索
- **状态筛选**：可根据用户状态进行筛选
- **日期范围**：支持按创建时间范围筛选

### 选择模式
- **单选模式**：使用单选按钮，只能选择一个用户
- **多选模式**：使用复选框，可选择多个用户
- **跨页选择**：多选模式下支持跨分页保持选中状态
- **智能返回**：根据绑定值类型智能返回ID或对象

### 用户体验
- **标签显示**：内置用户标签显示，支持删除操作
- **数量统计**：按钮上显示已选用户数量
- **可拖拽面板**：左右面板宽度可拖拽调整
- **响应式布局**：适配不同屏幕尺寸
- **键盘导航**：支持键盘操作

### 数据处理
- **类型智能**：自动识别绑定值类型，智能返回对应格式
- **预设支持**：支持通过 data 属性预设选中用户
- **范围限制**：可限制可选用户的范围
- **编辑模式**：支持传入用户名进行编辑时显示
