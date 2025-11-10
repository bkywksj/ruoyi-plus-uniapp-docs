# 业务组件总览

## 介绍

业务组件是 RuoYi-Plus-UniApp 前端项目中对 Element Plus 基础组件进行封装和扩展的高级组件库，专为企业级管理系统开发场景设计。这些组件遵循统一的命名规范（以 `A` 前缀开头），提供开箱即用的业务功能，极大地提高了开发效率和代码复用性。

业务组件不仅封装了常见的业务逻辑和交互模式，还提供了灵活的配置选项和丰富的扩展能力，让开发者能够快速构建功能完善、用户体验优秀的管理系统。所有组件都基于 Vue 3 Composition API 开发，使用 TypeScript 提供完整的类型支持，并与项目的状态管理、国际化、主题系统深度集成。

**核心特性:**

- **统一规范** - 所有业务组件使用 `A` 前缀命名，易于识别和管理
- **开箱即用** - 封装了常见的业务场景，提供默认配置即可快速使用
- **灵活配置** - 提供丰富的 Props 和事件，支持深度定制和扩展
- **类型安全** - 完整的 TypeScript 类型定义，开发时获得智能提示
- **响应式设计** - 自动适配不同屏幕尺寸，提供最佳的用户体验
- **主题集成** - 与项目主题系统深度集成，支持亮色/暗色模式切换
- **国际化支持** - 内置多语言支持，可轻松扩展到其他语言
- **性能优化** - 采用虚拟滚动、懒加载等技术，确保大数据场景下的流畅性

## 组件分类

### 表单类组件

表单类组件用于数据的输入、编辑和提交，是管理系统中最常用的组件类型。

- **ASearchForm** - 搜索表单，提供展开/收起、动画效果等功能
- **AForm** - 增强的表单组件集合，包含多种表单控件
  - **AFormInput** - 输入框（支持 AI 辅助输入）
  - **AFormInputWithAi** - 带 AI 辅助的输入框
  - **AFormSelect** - 下拉选择框
  - **AFormRadio** - 单选框组
  - **AFormCheckbox** - 复选框组
  - **AFormSwitch** - 开关
  - **AFormDate** - 日期选择器
  - **AFormCascader** - 级联选择器
  - **AFormTreeSelect** - 树形选择器
  - **AFormImgUpload** - 图片上传
  - **AFormFileUpload** - 文件上传
  - **AFormEditor** - 富文本编辑器
  - **AFormMap** - 地图选择器

### 数据展示类组件

数据展示类组件用于以各种形式展示业务数据，提供良好的可读性和交互性。

- **ADetail** - 详情展示组件，用于展示对象的详细信息
- **ACard** - 卡片容器，提供统一的卡片样式
- **AChart** - 图表组件，基于 ECharts 封装
- **DictTag** - 字典标签，用于显示字典数据
- **ASelectionTags** - 选择标签，显示已选中的项目列表

### 交互类组件

交互类组件提供用户与系统交互的界面，包括对话框、抽屉、消息提示等。

- **AModal** - 模态框/抽屉组件，支持对话框和抽屉两种模式
- **ImagePreview** - 图片预览组件，支持放大、缩小、旋转等操作

### 数据操作类组件

数据操作类组件用于数据的批量操作、导入导出等功能。

- **AImportExcel** - Excel 导入组件，支持模板下载和数据验证
- **TableToolbar** - 表格工具栏，提供搜索、筛选、导出等功能
- **Pagination** - 分页组件，提供多种分页模式

### AI 辅助类组件

AI 辅助类组件集成了 AI 能力，为用户提供智能化的辅助功能。

- **AAi** - AI 组件集合
  - **AAiAssistant** - AI 助手，提供对话式交互
  - **AAiTextOptimizer** - AI 文本优化，自动优化文本内容
  - **AAiDataGenerator** - AI 数据生成，自动生成测试数据
  - **AAiContentReviewer** - AI 内容审核，自动审核内容合规性

### 布局类组件

布局类组件用于页面布局和内容组织。

- **AResizablePanels** - 可调整大小的面板，支持拖拽调整尺寸
- **IFrameContainer** - iframe 容器，用于嵌入外部页面

### 业务专用类组件

业务专用类组件针对特定业务场景设计，提供完整的业务功能。

- **AOssMediaManager** - OSS 媒体管理器，管理云存储的文件
- **ARecharge** - 充值组件，处理充值相关业务
- **UserSelect** - 用户选择器，用于选择系统用户
- **ATheme** - 主题切换组件，提供主题设置界面

---

## ASearchForm 搜索表单

### 组件说明

`ASearchForm` 是一个增强的搜索表单组件，基于 Element Plus 的 `el-form` 和 `el-card` 封装，提供了优雅的动画效果、自动展开/收起功能，以及灵活的布局配置。该组件特别适合用于列表页面的搜索筛选场景。

**核心功能**:
- ✨ 支持展开/收起功能，当表单项超过2行时自动显示展开按钮
- 🎬 内置动画效果，提供流畅的显示/隐藏过渡
- 📱 响应式布局，自动适应不同屏幕尺寸
- 🔄 支持 v-model 双向绑定
- 🎨 可自定义标题、标签位置、标签宽度等样式属性

### 基础用法

```vue
<template>
  <div>
    <!-- 基础搜索表单 -->
    <ASearchForm v-model="queryParams" title="搜索条件">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </ASearchForm>
  </div>
</template>

<script lang="ts" setup>
const queryParams = ref({
  userName: '',
  phone: '',
  status: ''
})

const handleQuery = () => {
  console.log('查询参数:', queryParams.value)
  // 执行查询逻辑
}

const resetQuery = () => {
  queryParams.value = {
    userName: '',
    phone: '',
    status: ''
  }
}
</script>
```

### 展开/收起功能

当表单项超过 2 行时，组件会自动显示展开/收起按钮。收起状态下只显示第一行表单项，展开后显示所有表单项。

```vue
<template>
  <!-- 启用展开/收起功能（默认启用） -->
  <ASearchForm
    v-model="queryParams"
    title="高级搜索"
    :collapsible="true"
    :default-expanded="false"
  >
    <el-form-item label="用户名" prop="userName">
      <el-input v-model="queryParams.userName" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="昵称" prop="nickName">
      <el-input v-model="queryParams.nickName" placeholder="请输入昵称" />
    </el-form-item>
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="queryParams.phone" placeholder="请输入手机号" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="queryParams.email" placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item label="部门" prop="deptId">
      <el-tree-select v-model="queryParams.deptId" :data="deptOptions" placeholder="请选择部门" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-select v-model="queryParams.status" placeholder="请选择状态">
        <el-option label="正常" value="0" />
        <el-option label="停用" value="1" />
      </el-select>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-date-picker
        v-model="queryParams.createTime"
        type="daterange"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleQuery">搜索</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </el-form-item>
  </ASearchForm>
</template>

<script lang="ts" setup>
const queryParams = ref({
  userName: '',
  nickName: '',
  phone: '',
  email: '',
  deptId: null,
  status: '',
  createTime: []
})

const deptOptions = ref([
  { value: 1, label: '总公司' },
  { value: 2, label: '分公司A' },
  { value: 3, label: '分公司B' }
])

const handleQuery = () => {
  console.log('查询参数:', queryParams.value)
}

const resetQuery = () => {
  queryParams.value = {
    userName: '',
    nickName: '',
    phone: '',
    email: '',
    deptId: null,
    status: '',
    createTime: []
  }
}
</script>
```

**技术实现**:
- 组件通过 `MutationObserver` 监听表单内容变化，自动计算表单行数
- 使用 `ResizeObserver` 监听窗口大小变化，实时更新表单布局
- 收起状态使用 CSS `max-height` 和渐变遮罩实现平滑的视觉效果

### 自定义标签样式

```vue
<template>
  <!-- 自定义标签宽度和位置 -->
  <ASearchForm
    v-model="queryParams"
    title="自定义样式"
    label-width="100px"
    label-position="left"
  >
    <el-form-item label="用户名" prop="userName">
      <el-input v-model="queryParams.userName" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="queryParams.phone" placeholder="请输入手机号" />
    </el-form-item>
  </ASearchForm>
</template>

<script lang="ts" setup>
const queryParams = ref({
  userName: '',
  phone: ''
})
</script>
```

### 自定义头部

使用 `header` 插槽可以完全自定义卡片头部内容。

```vue
<template>
  <ASearchForm v-model="queryParams">
    <!-- 自定义头部插槽 -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <el-icon size="18"><Search /></el-icon>
          <span class="text-base font-semibold">高级搜索</span>
        </div>
        <el-button size="small" @click="saveSearchCondition">保存条件</el-button>
      </div>
    </template>

    <el-form-item label="关键词" prop="keyword">
      <el-input v-model="queryParams.keyword" placeholder="请输入关键词" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleQuery">搜索</el-button>
    </el-form-item>
  </ASearchForm>
</template>

<script lang="ts" setup>
const queryParams = ref({
  keyword: ''
})

const saveSearchCondition = () => {
  ElMessage.success('搜索条件已保存')
}

const handleQuery = () => {
  console.log('查询参数:', queryParams.value)
}
</script>
```

### 控制显示/隐藏

```vue
<template>
  <div>
    <el-button @click="showSearch = !showSearch">切换搜索框</el-button>

    <!-- 通过 visible 控制显示/隐藏 -->
    <ASearchForm v-model="queryParams" :visible="showSearch" title="搜索条件">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </ASearchForm>
  </div>
</template>

<script lang="ts" setup>
const showSearch = ref(true)
const queryParams = ref({
  userName: ''
})

const handleQuery = () => {
  console.log('查询参数:', queryParams.value)
}
</script>
```

### 调用组件方法

组件通过 `defineExpose` 暴露了一些实用方法，可以通过 `ref` 获取组件实例后调用。

```vue
<template>
  <div>
    <el-button @click="handleReset">重置表单</el-button>
    <el-button @click="handleExpand">展开表单</el-button>
    <el-button @click="handleCollapse">收起表单</el-button>

    <ASearchForm ref="searchFormRef" v-model="queryParams" title="搜索条件">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机号" />
      </el-form-item>
    </ASearchForm>
  </div>
</template>

<script lang="ts" setup>
const searchFormRef = ref()
const queryParams = ref({
  userName: '',
  phone: ''
})

// 重置表单
const handleReset = () => {
  searchFormRef.value?.resetFields()
}

// 展开表单
const handleExpand = () => {
  searchFormRef.value?.expand()
}

// 收起表单
const handleCollapse = () => {
  searchFormRef.value?.collapse()
}

// 重新计算表单行数
const recalculateRows = () => {
  searchFormRef.value?.calculateFormRows()
}
</script>
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 表单数据模型，支持 v-model | `Record<string, any>` | `{}` |
| visible | 控制表单显示/隐藏 | `boolean` | `true` |
| inline | 是否行内表单 | `boolean` | `true` |
| labelWidth | 标签宽度 | `string` | `'auto'` |
| labelPosition | 标签位置（left/right/top） | `'left' \| 'right' \| 'top'` | `'right'` |
| title | 卡片标题 | `string` | `''` |
| collapsible | 是否启用展开/收起功能 | `boolean` | `true` |
| defaultExpanded | 默认是否展开 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 表单数据更新时触发 | `value: Record<string, any>` |
| search | 搜索按钮点击时触发 | - |
| reset | 重置按钮点击时触发 | - |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 表单内容插槽 |
| header | 自定义卡片头部 |

### 暴露的方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| resetFields | 重置表单字段到初始值 | - |
| calculateFormRows | 重新计算表单行数 | - |
| expand | 展开表单 | - |
| collapse | 收起表单 | - |
| formRef | 获取 el-form 实例 | - |

---

## AModal 模态框/抽屉

### 组件说明

`AModal` 是一个统一封装的弹窗组件，支持对话框（Dialog）和抽屉（Drawer）两种模式。该组件基于 Element Plus 的 `el-dialog` 和 `el-drawer` 组件封装，提供了更丰富的功能和更灵活的配置选项，同时保持了统一的 API 接口。

**核心功能**:
- 🎭 支持对话框和抽屉两种显示模式
- 📏 提供 small、medium、large、xl 四种预设尺寸
- 🎨 支持自定义宽度和方向
- 🔄 支持 v-model 双向绑定
- ⌨️ 支持键盘 ESC 关闭
- 🖱️ 支持对话框拖拽移动
- 🎬 内置加载状态显示
- 🔒 支持关闭前确认
- 🎯 灵活的底部按钮配置

### 基础用法 - 对话框模式

```vue
<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true">打开对话框</el-button>

    <!-- 基础对话框 -->
    <AModal v-model="dialogVisible" title="新增用户" @confirm="handleSubmit" @cancel="handleCancel">
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
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const dialogVisible = ref(false)
const formData = ref({
  userName: '',
  nickName: '',
  email: ''
})

const handleSubmit = () => {
  console.log('提交数据:', formData.value)
  // 执行提交逻辑
  dialogVisible.value = false
}

const handleCancel = () => {
  console.log('取消操作')
}
</script>
```

### 基础用法 - 抽屉模式

```vue
<template>
  <div>
    <el-button type="primary" @click="drawerVisible = true">打开抽屉</el-button>

    <!-- 基础抽屉 -->
    <AModal
      v-model="drawerVisible"
      mode="drawer"
      title="用户详情"
      direction="rtl"
      size="large"
      :show-footer="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ userDetail.userName }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ userDetail.nickName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ userDetail.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userDetail.phone }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ userDetail.deptName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userDetail.status === '0' ? 'success' : 'danger'">
            {{ userDetail.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const drawerVisible = ref(false)
const userDetail = ref({
  userName: 'admin',
  nickName: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  deptName: '总公司',
  status: '0'
})
</script>
```

### 不同尺寸

组件提供了四种预设尺寸：small（600px）、medium（800px）、large（1000px）、xl（1200px）。

```vue
<template>
  <div class="space-x-2">
    <el-button @click="showDialog('small')">小尺寸</el-button>
    <el-button @click="showDialog('medium')">中等尺寸</el-button>
    <el-button @click="showDialog('large')">大尺寸</el-button>
    <el-button @click="showDialog('xl')">超大尺寸</el-button>

    <AModal v-model="dialogVisible" :size="currentSize" title="不同尺寸示例">
      <div class="p-4">
        <p>当前尺寸: {{ currentSize }}</p>
      </div>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const dialogVisible = ref(false)
const currentSize = ref<'small' | 'medium' | 'large' | 'xl'>('medium')

const showDialog = (size: 'small' | 'medium' | 'large' | 'xl') => {
  currentSize.value = size
  dialogVisible.value = true
}
</script>
```

### 自定义宽度

除了使用预设尺寸，还可以通过 `width` 属性自定义宽度。

```vue
<template>
  <div>
    <el-button @click="dialogVisible = true">自定义宽度</el-button>

    <!-- 使用具体数值 -->
    <AModal v-model="dialogVisible" width="900px" title="自定义宽度">
      <p>宽度为 900px</p>
    </AModal>

    <!-- 使用百分比 -->
    <AModal v-model="dialogVisible2" width="60%" title="自定义宽度">
      <p>宽度为 60%</p>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const dialogVisible = ref(false)
const dialogVisible2 = ref(false)
</script>
```

### 全屏对话框

```vue
<template>
  <div>
    <el-button @click="fullscreenVisible = true">全屏对话框</el-button>

    <AModal
      v-model="fullscreenVisible"
      title="全屏数据展示"
      :fullscreen="true"
    >
      <div class="h-full">
        <el-table :data="tableData" height="100%" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="姓名" width="180" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phone" label="电话" />
        </el-table>
      </div>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const fullscreenVisible = ref(false)
const tableData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', phone: '13800138001' },
  { id: 2, name: '李四', email: 'lisi@example.com', phone: '13800138002' },
  { id: 3, name: '王五', email: 'wangwu@example.com', phone: '13800138003' }
])
</script>
```

### 可拖动对话框

```vue
<template>
  <div>
    <el-button @click="movableVisible = true">可拖动对话框</el-button>

    <AModal
      v-model="movableVisible"
      title="可拖动对话框"
      :movable="true"
    >
      <p>可以拖动标题栏移动此对话框</p>
      <el-alert type="info" :closable="false">
        拖动对话框标题栏可以移动位置
      </el-alert>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const movableVisible = ref(false)
</script>
```

**技术实现**:
- 监听鼠标事件（mousedown、mousemove、mouseup）实现拖拽功能
- 限制对话框顶部不能拖出视口，防止用户无法操作
- 只在对话框模式且非全屏时启用拖拽功能

### 不同抽屉方向

```vue
<template>
  <div class="space-x-2">
    <el-button @click="showDrawer('rtl')">从右侧打开</el-button>
    <el-button @click="showDrawer('ltr')">从左侧打开</el-button>
    <el-button @click="showDrawer('ttb')">从顶部打开</el-button>
    <el-button @click="showDrawer('btt')">从底部打开</el-button>

    <AModal
      v-model="drawerVisible"
      mode="drawer"
      :direction="drawerDirection"
      title="不同方向的抽屉"
      size="medium"
    >
      <div class="p-4">
        <p>当前方向: {{ drawerDirection }}</p>
      </div>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const drawerVisible = ref(false)
const drawerDirection = ref<'ltr' | 'rtl' | 'ttb' | 'btt'>('rtl')

const showDrawer = (direction: 'ltr' | 'rtl' | 'ttb' | 'btt') => {
  drawerDirection.value = direction
  drawerVisible.value = true
}
</script>
```

### 加载状态

```vue
<template>
  <div>
    <el-button @click="loadingVisible = true">显示加载状态</el-button>

    <AModal
      v-model="loadingVisible"
      title="数据加载中"
      :loading="isLoading"
      @confirm="handleLoadData"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.desc" type="textarea" />
        </el-form-item>
      </el-form>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const loadingVisible = ref(false)
const isLoading = ref(false)
const formData = ref({
  name: '',
  desc: ''
})

const handleLoadData = async () => {
  isLoading.value = true
  try {
    // 模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('操作成功')
    loadingVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    isLoading.value = false
  }
}
</script>
```

### 自定义底部按钮

```vue
<template>
  <div>
    <el-button @click="customVisible = true">自定义底部</el-button>

    <!-- 自定义底部按钮 -->
    <AModal v-model="customVisible" title="自定义操作">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="formData.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="formData.content" type="textarea" />
        </el-form-item>
      </el-form>

      <!-- 自定义底部插槽 -->
      <template #footer>
        <el-button @click="customVisible = false">取消</el-button>
        <el-button type="warning" @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </template>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const customVisible = ref(false)
const formData = ref({
  title: '',
  content: ''
})

const handleSaveDraft = () => {
  console.log('保存草稿:', formData.value)
  ElMessage.success('草稿已保存')
}

const handlePublish = () => {
  console.log('发布内容:', formData.value)
  ElMessage.success('发布成功')
  customVisible.value = false
}
</script>
```

### 无底部按钮

```vue
<template>
  <div>
    <el-button @click="viewVisible = true">查看详情</el-button>

    <!-- 不显示底部按钮 -->
    <AModal
      v-model="viewVisible"
      title="用户详情"
      mode="drawer"
      :show-footer="false"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">admin</el-descriptions-item>
        <el-descriptions-item label="昵称">管理员</el-descriptions-item>
        <el-descriptions-item label="邮箱">admin@example.com</el-descriptions-item>
        <el-descriptions-item label="创建时间">2024-01-01 12:00:00</el-descriptions-item>
      </el-descriptions>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const viewVisible = ref(false)
</script>
```

### 仅关闭按钮

```vue
<template>
  <div>
    <el-button @click="infoVisible = true">查看信息</el-button>

    <!-- 仅显示关闭按钮 -->
    <AModal
      v-model="infoVisible"
      title="通知详情"
      footer-type="close-only"
    >
      <el-alert title="系统通知" type="info" :closable="false">
        这是一条系统通知消息，仅供查看。
      </el-alert>
      <div class="mt-4">
        <p>通知内容...</p>
      </div>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const infoVisible = ref(false)
</script>
```

### 关闭前确认

```vue
<template>
  <div>
    <el-button @click="confirmVisible = true">编辑内容</el-button>

    <AModal
      v-model="confirmVisible"
      title="编辑文档"
      :before-close="handleBeforeClose"
    >
      <el-input
        v-model="content"
        type="textarea"
        :rows="10"
        placeholder="请输入内容"
      />
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const confirmVisible = ref(false)
const content = ref('')

const handleBeforeClose = (done: () => void) => {
  if (content.value) {
    ElMessageBox.confirm('内容尚未保存，确定要关闭吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      done()
    }).catch(() => {
      // 取消关闭
    })
  } else {
    done()
  }
}
</script>
```

### 生命周期钩子

```vue
<template>
  <div>
    <el-button @click="dialogVisible = true">打开对话框</el-button>

    <AModal
      v-model="dialogVisible"
      title="生命周期示例"
      @open="handleOpen"
      @opened="handleOpened"
      @close="handleClose"
      @closed="handleClosed"
    >
      <p>对话框内容</p>
    </AModal>
  </div>
</template>

<script lang="ts" setup>
const dialogVisible = ref(false)

const handleOpen = () => {
  console.log('对话框开始打开')
}

const handleOpened = () => {
  console.log('对话框已完全打开')
  // 可以在这里执行数据加载等操作
}

const handleClose = () => {
  console.log('对话框开始关闭')
}

const handleClosed = () => {
  console.log('对话框已完全关闭')
  // 可以在这里清理数据
}
</script>
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 控制显示/隐藏，支持 v-model | `boolean` | `false` |
| mode | 模式（dialog-对话框/drawer-抽屉） | `'dialog' \| 'drawer'` | `'dialog'` |
| title | 标题 | `string` | `''` |
| width | 自定义宽度/尺寸 | `string \| number` | - |
| size | 预设尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `'medium'` |
| closable | 是否显示关闭按钮 | `boolean` | `true` |
| maskClosable | 是否可通过点击遮罩关闭 | `boolean` | `false` |
| keyboard | 是否可通过 ESC 键关闭 | `boolean` | `true` |
| destroyOnClose | 关闭时是否销毁内部元素 | `boolean` | `true` |
| appendToBody | 是否挂载到 body 元素下 | `boolean` | `true` |
| beforeClose | 关闭前的回调函数 | `(done: () => void) => void` | - |
| movable | 是否可拖动（仅对话框模式） | `boolean` | `false` |
| direction | 抽屉弹出方向 | `'ltr' \| 'rtl' \| 'ttb' \| 'btt'` | `'rtl'` |
| showFooter | 是否显示底部操作区 | `boolean` | `true` |
| footerType | 底部按钮类型 | `'default' \| 'close-only'` | `'default'` |
| footerAlign | 底部按钮对齐方式 | `'left' \| 'center' \| 'right'` | `'right'` |
| loading | 内容区是否显示加载状态 | `boolean` | `false` |
| fullscreen | 是否全屏显示（仅对话框模式） | `boolean` | `false` |
| confirmText | 确认按钮文本 | `string` | `'确定'` |
| cancelText | 取消按钮文本 | `string` | `'取消'` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | v-model 双向绑定更新 | `value: boolean` |
| confirm | 点击确认按钮时触发 | - |
| cancel | 点击取消按钮时触发 | - |
| open | 模态框开始打开时触发 | - |
| opened | 模态框完全打开后触发 | - |
| close | 模态框开始关闭时触发 | - |
| closed | 模态框完全关闭后触发 | - |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 主要内容区域 |
| header | 自定义头部 |
| footer | 自定义底部操作区 |

---

## ASelectionTags 选择标签

### 组件说明

`ASelectionTags` 是一个用于展示已选中项目的标签组件，基于 Element Plus 的 `el-tag` 封装。该组件常用于多选场景，以标签的形式显示已选中的项目列表，支持单个删除和一键清空操作。

**核心功能**:
- 🏷️ 以标签形式展示已选中的项目
- ❌ 支持单个标签的删除操作
- 🗑️ 支持一键清空所有选中项
- 🎨 支持自定义标签样式和尺寸
- 📝 支持自定义标签内容显示
- 🔧 灵活的数据格式支持

### 基础用法

```vue
<template>
  <div>
    <el-button @click="addUser">添加用户</el-button>

    <!-- 显示已选用户 -->
    <ASelectionTags
      :items="selectedUsers"
      @close="removeUser"
    />
  </div>
</template>

<script lang="ts" setup>
const selectedUsers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

const addUser = () => {
  const newId = selectedUsers.value.length + 1
  selectedUsers.value.push({
    id: newId,
    name: `用户${newId}`
  })
}

const removeUser = (key: number) => {
  selectedUsers.value = selectedUsers.value.filter(user => user.id !== key)
}
</script>
```

### 带清空按钮

```vue
<template>
  <div>
    <ASelectionTags
      :items="selectedItems"
      :on-clear="handleClear"
      @close="handleRemove"
    >
      <template #header>
        <span class="text-sm text-gray-500 mb-2 block">已选择 {{ selectedItems.length }} 项：</span>
      </template>
    </ASelectionTags>
  </div>
</template>

<script lang="ts" setup>
const selectedItems = ref([
  { id: 1, label: '选项1' },
  { id: 2, label: '选项2' },
  { id: 3, label: '选项3' }
])

const handleRemove = (key: number) => {
  selectedItems.value = selectedItems.value.filter(item => item.id !== key)
}

const handleClear = () => {
  ElMessageBox.confirm('确定要清空所有选择吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedItems.value = []
    ElMessage.success('已清空选择')
  })
}
</script>
```

### 不同样式

```vue
<template>
  <div class="space-y-4">
    <!-- Primary 类型 -->
    <ASelectionTags :items="items" type="primary" @close="handleClose" />

    <!-- Success 类型 -->
    <ASelectionTags :items="items" type="success" @close="handleClose" />

    <!-- Warning 类型 -->
    <ASelectionTags :items="items" type="warning" @close="handleClose" />

    <!-- Danger 类型 -->
    <ASelectionTags :items="items" type="danger" @close="handleClose" />

    <!-- Info 类型 -->
    <ASelectionTags :items="items" type="info" @close="handleClose" />
  </div>
</template>

<script lang="ts" setup>
const items = ref([
  { id: 1, name: '标签1' },
  { id: 2, name: '标签2' },
  { id: 3, name: '标签3' }
])

const handleClose = (key: number) => {
  items.value = items.value.filter(item => item.id !== key)
}
</script>
```

### 不同尺寸

```vue
<template>
  <div class="space-y-4">
    <!-- 大尺寸 -->
    <ASelectionTags :items="items" size="large" @close="handleClose" />

    <!-- 默认尺寸 -->
    <ASelectionTags :items="items" size="default" @close="handleClose" />

    <!-- 小尺寸 -->
    <ASelectionTags :items="items" size="small" @close="handleClose" />
  </div>
</template>

<script lang="ts" setup>
const items = ref([
  { id: 1, name: '标签1' },
  { id: 2, name: '标签2' }
])

const handleClose = (key: number) => {
  items.value = items.value.filter(item => item.id !== key)
}
</script>
```

### 自定义显示内容

```vue
<template>
  <div>
    <!-- 使用默认插槽自定义内容 -->
    <ASelectionTags :items="users" @close="handleRemove">
      <template #default="{ item }">
        <el-avatar :size="20" :src="item.avatar" class="mr-1" />
        <span>{{ item.name }}</span>
        <el-tag v-if="item.isOnline" type="success" size="small" class="ml-1">在线</el-tag>
      </template>
    </ASelectionTags>
  </div>
</template>

<script lang="ts" setup>
const users = ref([
  { id: 1, name: '张三', avatar: '/avatar/1.jpg', isOnline: true },
  { id: 2, name: '李四', avatar: '/avatar/2.jpg', isOnline: false },
  { id: 3, name: '王五', avatar: '/avatar/3.jpg', isOnline: true }
])

const handleRemove = (key: number) => {
  users.value = users.value.filter(user => user.id !== key)
}
</script>
```

### 自定义格式化函数

```vue
<template>
  <div>
    <!-- 使用 formatter 自定义文本 -->
    <ASelectionTags
      :items="departments"
      :formatter="formatDepartment"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
const departments = ref([
  { id: 1, code: 'DEPT001', name: '技术部', userCount: 15 },
  { id: 2, code: 'DEPT002', name: '市场部', userCount: 8 },
  { id: 3, code: 'DEPT003', name: '人事部', userCount: 5 }
])

const formatDepartment = (item: any) => {
  return `${item.name}（${item.userCount}人）`
}

const handleRemove = (key: number) => {
  departments.value = departments.value.filter(dept => dept.id !== key)
}
</script>
```

### 自定义主键字段

```vue
<template>
  <div>
    <!-- 使用 uuid 作为主键 -->
    <ASelectionTags
      :items="products"
      key-field="uuid"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
const products = ref([
  { uuid: 'a1b2c3', title: '产品A', price: 99 },
  { uuid: 'd4e5f6', title: '产品B', price: 199 },
  { uuid: 'g7h8i9', title: '产品C', price: 299 }
])

const handleRemove = (uuid: string) => {
  products.value = products.value.filter(product => product.uuid !== uuid)
}
</script>
```

### 不可关闭模式

```vue
<template>
  <div>
    <!-- 仅展示，不可关闭 -->
    <ASelectionTags
      :items="tags"
      :closable="false"
    />
  </div>
</template>

<script lang="ts" setup>
const tags = ref([
  { id: 1, name: 'Vue 3' },
  { id: 2, name: 'TypeScript' },
  { id: 3, name: 'Element Plus' }
])
</script>
```

### 控制显示/隐藏

```vue
<template>
  <div>
    <el-checkbox v-model="showTags">显示标签</el-checkbox>

    <ASelectionTags
      :items="items"
      :visible="showTags"
      @close="handleRemove"
    />
  </div>
</template>

<script lang="ts" setup>
const showTags = ref(true)
const items = ref([
  { id: 1, name: '标签1' },
  { id: 2, name: '标签2' }
])

const handleRemove = (key: number) => {
  items.value = items.value.filter(item => item.id !== key)
}
</script>
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | 要展示的选中项数组 | `any[]` | `[]` |
| closable | 是否可关闭 | `boolean` | `true` |
| visible | 是否显示组件 | `boolean` | `true` |
| type | 标签类型 | `'success' \| 'info' \| 'warning' \| 'danger'` | `'success'` |
| effect | 标签效果 | `'light' \| 'dark' \| 'plain'` | `'light'` |
| size | 标签大小 | `'large' \| 'default' \| 'small'` | `'default'` |
| color | 自定义标签颜色 | `string` | `''` |
| keyField | 主键字段名 | `string` | `'id'` |
| formatter | 文本格式化函数 | `(item: any) => string` | - |
| onClear | 清空选择的回调函数 | `() => void` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 点击标签关闭按钮时触发 | `key: any, item: any` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 自定义标签内容 | `{ item }` |
| header | 标签列表头部 | - |
| footer | 标签列表尾部 | - |

---

## AForm 表单组件集合

### 组件说明

`AForm` 是一个增强的表单组件集合，包含了多种常用的表单控件。这些组件基于 Element Plus 的表单组件封装，提供了更丰富的功能和更统一的 API 接口，特别适合用于复杂的表单场景。

**组件列表**:
- **AFormInput** - 增强的输入框组件
- **AFormInputWithAi** - 带 AI 辅助的输入框
- **AFormSelect** - 下拉选择框
- **AFormRadio** - 单选框组
- **AFormCheckbox** - 复选框组
- **AFormSwitch** - 开关组件
- **AFormDate** - 日期选择器
- **AFormCascader** - 级联选择器
- **AFormTreeSelect** - 树形选择器
- **AFormImgUpload** - 图片上传组件
- **AFormFileUpload** - 文件上传组件
- **AFormEditor** - 富文本编辑器
- **AFormMap** - 地图选择器

### AFormInput 输入框

提供了常见的输入类型和验证功能。

```vue
<template>
  <el-form :model="form" label-width="120px">
    <!-- 基础输入框 -->
    <el-form-item label="用户名" prop="userName">
      <AFormInput v-model="form.userName" placeholder="请输入用户名" clearable />
    </el-form-item>

    <!-- 密码输入框 -->
    <el-form-item label="密码" prop="password">
      <AFormInput v-model="form.password" type="password" placeholder="请输入密码" show-password />
    </el-form-item>

    <!-- 文本域 -->
    <el-form-item label="备注" prop="remark">
      <AFormInput v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const form = ref({
  userName: '',
  password: '',
  remark: ''
})
</script>
```

### AFormInputWithAi 带 AI 辅助的输入框

集成了 AI 辅助功能，可以自动优化用户输入的内容。

```vue
<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="产品描述" prop="description">
      <AFormInputWithAi
        v-model="form.description"
        type="textarea"
        :rows="6"
        placeholder="请输入产品描述，可使用 AI 辅助优化"
        ai-type="optimize"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const form = ref({
  description: ''
})
</script>
```

**技术实现**:
- 集成 AI 文本优化接口，支持文本优化、扩写、润色等功能
- 提供一键优化按钮，点击后调用 AI 接口处理文本
- 支持多种 AI 模式：优化、生成、审核等

### AFormSelect 下拉选择

```vue
<template>
  <el-form :model="form" label-width="120px">
    <!-- 单选 -->
    <el-form-item label="状态" prop="status">
      <AFormSelect v-model="form.status" :options="statusOptions" placeholder="请选择状态" clearable />
    </el-form-item>

    <!-- 多选 -->
    <el-form-item label="角色" prop="roles">
      <AFormSelect v-model="form.roles" :options="roleOptions" multiple placeholder="请选择角色" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const form = ref({
  status: '',
  roles: []
})

const statusOptions = ref([
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
])

const roleOptions = ref([
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
  { label: '访客', value: 'guest' }
])
</script>
```

### AFormDate 日期选择

```vue
<template>
  <el-form :model="form" label-width="120px">
    <!-- 日期选择 -->
    <el-form-item label="出生日期" prop="birthDate">
      <AFormDate v-model="form.birthDate" placeholder="请选择日期" />
    </el-form-item>

    <!-- 日期时间选择 -->
    <el-form-item label="创建时间" prop="createTime">
      <AFormDate v-model="form.createTime" type="datetime" placeholder="请选择日期时间" />
    </el-form-item>

    <!-- 日期范围选择 -->
    <el-form-item label="活动时间" prop="activityTime">
      <AFormDate
        v-model="form.activityTime"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const form = ref({
  birthDate: '',
  createTime: '',
  activityTime: []
})
</script>
```

### AFormImgUpload 图片上传

```vue
<template>
  <el-form :model="form" label-width="120px">
    <!-- 单张图片上传 -->
    <el-form-item label="头像" prop="avatar">
      <AFormImgUpload
        v-model="form.avatar"
        :limit="1"
        accept="image/*"
      />
    </el-form-item>

    <!-- 多张图片上传 -->
    <el-form-item label="产品图片" prop="images">
      <AFormImgUpload
        v-model="form.images"
        :limit="5"
        accept="image/*"
        multiple
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const form = ref({
  avatar: '',
  images: []
})
</script>
```

### AFormFileUpload 文件上传

```vue
<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="附件" prop="files">
      <AFormFileUpload
        v-model="form.files"
        :limit="3"
        accept=".pdf,.doc,.docx,.xlsx"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const form = ref({
  files: []
})
</script>
```

### AFormEditor 富文本编辑器

```vue
<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="文章内容" prop="content">
      <AFormEditor v-model="form.content" :height="400" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
const form = ref({
  content: ''
})
</script>
```

---

## AAi AI 辅助组件集合

### 组件说明

`AAi` 是一个 AI 辅助组件集合，集成了多种 AI 能力，为用户提供智能化的辅助功能。这些组件基于后端的 AI 服务接口封装，提供了友好的用户界面和交互体验。

**组件列表**:
- **AAiAssistant** - AI 助手，提供对话式交互
- **AAiTextOptimizer** - AI 文本优化器，自动优化文本内容
- **AAiDataGenerator** - AI 数据生成器，自动生成测试数据
- **AAiContentReviewer** - AI 内容审核器，自动审核内容合规性

### AAiAssistant AI 助手

提供对话式的 AI 交互界面，用户可以通过对话获取帮助和建议。

```vue
<template>
  <div>
    <el-button @click="assistantVisible = true">打开 AI 助手</el-button>

    <AAiAssistant v-model="assistantVisible" />
  </div>
</template>

<script lang="ts" setup>
const assistantVisible = ref(false)
</script>
```

### AAiTextOptimizer AI 文本优化

自动优化用户输入的文本，提供更专业、更流畅的表达。

```vue
<template>
  <div>
    <el-input v-model="text" type="textarea" :rows="5" placeholder="请输入文本" />
    <el-button @click="optimizeText" :loading="optimizing">AI 优化</el-button>
  </div>
</template>

<script lang="ts" setup>
const text = ref('')
const optimizing = ref(false)

const optimizeText = async () => {
  if (!text.value) {
    ElMessage.warning('请先输入文本')
    return
  }

  optimizing.value = true
  try {
    // 调用 AI 优化接口
    const result = await aiOptimize(text.value)
    text.value = result.data
    ElMessage.success('优化成功')
  } catch (error) {
    ElMessage.error('优化失败')
  } finally {
    optimizing.value = false
  }
}
</script>
```

### AAiDataGenerator AI 数据生成

根据用户的需求自动生成测试数据，提高测试效率。

```vue
<template>
  <div>
    <el-button @click="generateData">生成测试数据</el-button>

    <el-table :data="tableData" style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
const tableData = ref([])

const generateData = async () => {
  try {
    // 调用 AI 生成接口
    const result = await aiGenerate({
      type: 'user',
      count: 10
    })
    tableData.value = result.data
    ElMessage.success('数据生成成功')
  } catch (error) {
    ElMessage.error('数据生成失败')
  }
}
</script>
```

### AAiContentReviewer AI 内容审核

自动审核用户提交的内容，检测是否包含违规信息。

```vue
<template>
  <div>
    <el-input v-model="content" type="textarea" :rows="5" placeholder="请输入内容" />
    <el-button @click="reviewContent" :loading="reviewing">AI 审核</el-button>

    <el-alert v-if="reviewResult" :type="reviewResult.safe ? 'success' : 'error'" :closable="false" class="mt-4">
      {{ reviewResult.message }}
    </el-alert>
  </div>
</template>

<script lang="ts" setup>
const content = ref('')
const reviewing = ref(false)
const reviewResult = ref(null)

const reviewContent = async () => {
  if (!content.value) {
    ElMessage.warning('请先输入内容')
    return
  }

  reviewing.value = true
  try {
    // 调用 AI 审核接口
    const result = await aiReview(content.value)
    reviewResult.value = result.data
  } catch (error) {
    ElMessage.error('审核失败')
  } finally {
    reviewing.value = false
  }
}
</script>
```

---

## 其他业务组件

### ACard 卡片

提供统一的卡片容器样式。

```vue
<template>
  <ACard title="用户信息" shadow="hover">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="用户名">admin</el-descriptions-item>
      <el-descriptions-item label="昵称">管理员</el-descriptions-item>
      <el-descriptions-item label="邮箱">admin@example.com</el-descriptions-item>
      <el-descriptions-item label="手机号">13800138000</el-descriptions-item>
    </el-descriptions>
  </ACard>
</template>
```

### ADetail 详情展示

用于展示对象的详细信息，提供统一的布局和样式。

```vue
<template>
  <ADetail :data="userDetail" :columns="2" />
</template>

<script lang="ts" setup>
const userDetail = ref({
  userName: 'admin',
  nickName: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  deptName: '总公司',
  status: '正常'
})
</script>
```

### DictTag 字典标签

用于显示字典数据，自动从字典服务获取对应的标签文本和样式。

```vue
<template>
  <div>
    <!-- 显示用户状态 -->
    <DictTag dict-type="sys_normal_disable" :value="userStatus" />

    <!-- 显示性别 -->
    <DictTag dict-type="sys_user_sex" :value="userSex" />
  </div>
</template>

<script lang="ts" setup>
const userStatus = ref('0') // 0-正常 1-停用
const userSex = ref('1') // 0-男 1-女 2-未知
</script>
```

### AImportExcel Excel 导入

提供 Excel 文件导入功能，支持模板下载和数据验证。

```vue
<template>
  <div>
    <AImportExcel
      title="导入用户"
      template-url="/api/system/user/importTemplate"
      import-url="/api/system/user/import"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
const handleImportSuccess = (result: any) => {
  ElMessage.success(`成功导入 ${result.successCount} 条数据`)
  // 刷新列表
}
</script>
```

### TableToolbar 表格工具栏

提供表格的工具栏功能，包括刷新、列设置、导出等操作。

```vue
<template>
  <div>
    <TableToolbar
      :columns="columns"
      :show-search.sync="showSearch"
      @refresh="handleRefresh"
      @export="handleExport"
    />

    <el-table :data="tableData">
      <el-table-column v-for="col in visibleColumns" :key="col.prop" v-bind="col" />
    </el-table>
  </div>
</template>

<script lang="ts" setup>
const showSearch = ref(true)
const columns = ref([
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名' },
  { prop: 'email', label: '邮箱' }
])
const tableData = ref([])
const visibleColumns = computed(() => columns.value.filter(col => col.visible !== false))

const handleRefresh = () => {
  // 刷新表格数据
}

const handleExport = () => {
  // 导出数据
}
</script>
```

### AResizablePanels 可调整大小的面板

提供可拖拽调整尺寸的面板布局。

```vue
<template>
  <AResizablePanels>
    <template #left>
      <div class="p-4">
        <h3>左侧面板</h3>
        <p>可以拖拽中间的分隔线调整大小</p>
      </div>
    </template>
    <template #right>
      <div class="p-4">
        <h3>右侧面板</h3>
        <p>右侧内容区域</p>
      </div>
    </template>
  </AResizablePanels>
</template>
```

### AOssMediaManager OSS 媒体管理器

管理云存储（OSS）中的文件，提供文件上传、删除、预览等功能。

```vue
<template>
  <div>
    <el-button @click="managerVisible = true">打开媒体管理器</el-button>

    <AOssMediaManager
      v-model="managerVisible"
      @select="handleSelectFile"
    />
  </div>
</template>

<script lang="ts" setup>
const managerVisible = ref(false)

const handleSelectFile = (file: any) => {
  console.log('选中的文件:', file)
}
</script>
```

---

## 最佳实践

### 1. 统一使用业务组件

在项目中应优先使用业务组件而不是直接使用 Element Plus 的基础组件，这样可以保证项目的统一性和一致性。

```vue
<!-- ✅ 推荐：使用业务组件 -->
<ASearchForm v-model="queryParams" title="搜索条件">
  <el-form-item label="用户名">
    <el-input v-model="queryParams.userName" />
  </el-form-item>
</ASearchForm>

<!-- ❌ 不推荐：直接使用基础组件 -->
<el-card>
  <template #header>搜索条件</template>
  <el-form :model="queryParams">
    <el-form-item label="用户名">
      <el-input v-model="queryParams.userName" />
    </el-form-item>
  </el-form>
</el-card>
```

### 2. 合理使用组件通信

业务组件通过 `v-model`、事件和插槽提供了灵活的通信方式，应根据具体场景选择合适的方式。

```vue
<template>
  <!-- 使用 v-model 实现双向绑定 -->
  <AModal v-model="visible" title="编辑" @confirm="handleSubmit">
    <el-form :model="formData">
      <!-- 表单内容 -->
    </el-form>
  </AModal>
</template>

<script lang="ts" setup>
// 使用 v-model
const visible = ref(false)

// 监听事件
const handleSubmit = () => {
  // 处理提交逻辑
}
</script>
```

### 3. 充分利用插槽定制

所有业务组件都提供了丰富的插槽，用于定制组件的显示内容和样式。

```vue
<template>
  <ASearchForm v-model="queryParams">
    <!-- 使用 header 插槽自定义头部 -->
    <template #header>
      <div class="custom-header">
        <span>高级搜索</span>
        <el-button size="small">保存条件</el-button>
      </div>
    </template>

    <!-- 默认插槽放置表单项 -->
    <el-form-item label="关键词">
      <el-input v-model="queryParams.keyword" />
    </el-form-item>
  </ASearchForm>
</template>
```

### 4. 正确处理异步操作

在使用业务组件处理异步操作时，应该正确使用加载状态和错误处理。

```vue
<template>
  <AModal
    v-model="visible"
    title="提交数据"
    :loading="submitting"
    @confirm="handleSubmit"
  >
    <el-form :model="formData">
      <!-- 表单内容 -->
    </el-form>
  </AModal>
</template>

<script lang="ts" setup>
const visible = ref(false)
const submitting = ref(false)
const formData = ref({})

const handleSubmit = async () => {
  submitting.value = true
  try {
    await submitData(formData.value)
    ElMessage.success('提交成功')
    visible.value = false
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}
</script>
```

### 5. 合理使用 AI 辅助功能

AI 辅助组件可以显著提高用户的工作效率，但应该在合适的场景下使用，避免滥用。

```vue
<template>
  <!-- 适合使用 AI 的场景：需要文本优化的输入 -->
  <el-form-item label="产品描述">
    <AFormInputWithAi
      v-model="form.description"
      type="textarea"
      ai-type="optimize"
    />
  </el-form-item>

  <!-- 不适合使用 AI 的场景：固定格式的输入 -->
  <el-form-item label="手机号">
    <el-input v-model="form.phone" placeholder="请输入手机号" />
  </el-form-item>
</template>
```

---

## 常见问题

### 1. ASearchForm 展开/收起按钮不显示

**问题原因**:
- 表单项数量少于 2 行
- `inline` 属性设置为 `false`
- `collapsible` 属性设置为 `false`

**解决方案**:

```vue
<template>
  <!-- 确保 inline 为 true，collapsible 为 true -->
  <ASearchForm
    v-model="queryParams"
    :inline="true"
    :collapsible="true"
  >
    <!-- 添加足够多的表单项（至少 2 行） -->
    <el-form-item label="字段1">
      <el-input v-model="queryParams.field1" />
    </el-form-item>
    <el-form-item label="字段2">
      <el-input v-model="queryParams.field2" />
    </el-form-item>
    <el-form-item label="字段3">
      <el-input v-model="queryParams.field3" />
    </el-form-item>
    <el-form-item label="字段4">
      <el-input v-model="queryParams.field4" />
    </el-form-item>
  </ASearchForm>
</template>
```

### 2. AModal 对话框拖拽不生效

**问题原因**:
- `movable` 属性未设置为 `true`
- 使用了抽屉模式（抽屉不支持拖拽）
- 对话框处于全屏模式

**解决方案**:

```vue
<template>
  <!-- 确保是对话框模式且非全屏 -->
  <AModal
    v-model="visible"
    mode="dialog"
    :fullscreen="false"
    :movable="true"
    title="可拖动对话框"
  >
    <p>内容</p>
  </AModal>
</template>
```

### 3. ASelectionTags 标签内容不显示

**问题原因**:
- 数据对象中没有 `label`、`name`、`title` 等常见字段
- 没有提供 `formatter` 函数

**解决方案**:

```vue
<template>
  <!-- 方案1：提供 formatter 函数 -->
  <ASelectionTags
    :items="items"
    :formatter="item => item.customField"
  />

  <!-- 方案2：使用默认插槽自定义内容 -->
  <ASelectionTags :items="items">
    <template #default="{ item }">
      {{ item.customField }}
    </template>
  </ASelectionTags>
</template>
```

### 4. 业务组件样式与项目主题不匹配

**问题原因**:
- 组件使用了固定的颜色值
- 主题切换后组件没有重新渲染

**解决方案**:

所有业务组件都使用 CSS 变量定义样式，确保项目的主题配置正确：

```typescript
// 在 src/styles/theme.ts 中配置主题变量
export const lightTheme = {
  '--el-color-primary': '#409eff',
  '--el-color-success': '#67c23a',
  // ... 其他变量
}

export const darkTheme = {
  '--el-color-primary': '#409eff',
  '--el-color-success': '#67c23a',
  // ... 其他变量
}
```

### 5. 表单组件 v-model 绑定不生效

**问题原因**:
- 组件名称错误
- 没有正确使用 `v-model`
- 数据类型不匹配

**解决方案**:

```vue
<template>
  <el-form :model="form">
    <!-- ✅ 正确：使用 v-model -->
    <el-form-item label="用户名">
      <AFormInput v-model="form.userName" />
    </el-form-item>

    <!-- ❌ 错误：使用 :value 和 @input -->
    <el-form-item label="密码">
      <AFormInput :value="form.password" @input="form.password = $event" />
    </el-form-item>
  </el-form>
</template>
```

---

## 总结

业务组件是 RuoYi-Plus-UniApp 前端项目的核心组成部分，提供了丰富的功能和灵活的配置选项。通过合理使用这些组件，可以显著提高开发效率，减少重复代码，保证项目的一致性和可维护性。

**核心要点**:

1. **统一规范** - 所有业务组件使用 `A` 前缀，便于识别和管理
2. **灵活配置** - 提供丰富的 Props、Events 和 Slots，满足各种定制需求
3. **类型安全** - 完整的 TypeScript 类型定义，开发时获得智能提示
4. **性能优化** - 采用最佳实践，确保组件在各种场景下的流畅性
5. **易于扩展** - 基于 Composition API 开发，便于二次开发和功能扩展

在实际开发中，建议：
- 优先使用业务组件而不是基础组件
- 充分利用组件提供的插槽和事件进行定制
- 正确处理异步操作和错误状态
- 遵循项目的命名和编码规范
- 合理使用 AI 辅助功能提高效率

通过遵循这些最佳实践，可以充分发挥业务组件的优势，构建出高质量、易维护的企业级管理系统。
