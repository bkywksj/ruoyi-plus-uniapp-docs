# AImportExcel Excel导入组件

## 介绍

`AImportExcel` 是一个功能完善的Excel文件导入组件，提供Excel文件的上传、导入和模板下载功能。组件采用作用域插槽设计模式，通过插槽暴露 `openImportExcel` 方法，让开发者可以自定义触发按钮的样式和位置。

**核心特性:**

- **三种工作模式** - 支持完整导入（上传+模板）、仅导入、仅下载模板三种模式，根据配置自动切换
- **拖拽上传** - 支持将Excel文件拖拽到上传区域，提供更便捷的用户体验
- **格式验证** - 自动验证文件格式，仅允许上传 `.xls` 和 `.xlsx` 格式的Excel文件
- **参数传递** - 支持URL参数（`importParams`）和表单数据（`importData`）两种参数传递方式
- **自动授权** - 自动获取并添加认证头部信息，无需手动处理授权问题
- **进度反馈** - 显示文件上传进度，导入完成后展示详细的导入结果
- **事件通知** - 提供导入成功和导入失败事件，便于业务逻辑处理
- **作用域插槽** - 通过作用域插槽暴露控制方法，支持自定义触发按钮

组件内部集成了 `AModal` 对话框和 `el-upload` 上传组件，提供完整的导入工作流程。在导入过程中会显示友好的提示信息，导入完成后会展示详细的结果报告。

## 基础用法

### 完整导入功能

最常用的使用方式，同时提供导入功能和模板下载链接：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="用户数据"
    import-url="/system/user/importUsers"
    template-url="/system/user/templateUsers"
    @import-success="handleImportSuccess"
  >
    <el-button type="info" plain icon="Top" @click="openImportExcel">
      导入
    </el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
const handleImportSuccess = () => {
  console.log('导入成功')
  // 刷新列表数据
  getList()
}

const getList = () => {
  // 重新获取列表数据
}
</script>
```

**使用说明:**

- 通过 `v-slot="{ openImportExcel }"` 获取打开导入弹窗的方法
- `title` 属性设置导入弹窗的标题，如"用户数据"会显示为"用户数据导入"
- `import-url` 指定后端导入接口地址
- `template-url` 指定模板下载接口地址
- `@import-success` 监听导入成功事件，用于刷新数据

### 只提供导入功能

不提供模板下载，只显示上传功能：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="商品数据"
    import-url="/system/goods/import"
    @import-success="refreshData"
  >
    <el-button type="primary" @click="openImportExcel">
      <el-icon><Upload /></el-icon>
      导入商品
    </el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { Upload } from '@element-plus/icons-vue'

const refreshData = () => {
  // 刷新商品列表
}
</script>
```

**使用说明:**

- 当只提供 `import-url` 而不提供 `template-url` 时，弹窗中不会显示"下载模板"链接
- 适用于数据格式简单、用户已有标准模板的场景
- 仍然支持拖拽上传和文件格式验证

### 只提供模板下载

只提供模板下载功能，点击按钮直接下载模板文件：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="订单数据"
    template-url="/system/order/template"
  >
    <el-button type="success" plain @click="openImportExcel">
      <el-icon><Download /></el-icon>
      下载模板
    </el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { Download } from '@element-plus/icons-vue'
</script>
```

**使用说明:**

- 当只提供 `template-url` 而不提供 `import-url` 时，点击按钮会直接下载模板
- 不会弹出导入对话框
- 下载的文件名格式为：`{title}模板_{当前时间}.xlsx`
- 适用于只需要提供模板下载、导入在其他地方处理的场景

## 参数传递

### URL参数传递

通过 `importParams` 传递URL查询参数：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="部门用户"
    import-url="/system/user/import"
    template-url="/system/user/template"
    :import-params="{ deptId: currentDeptId, tenantId: tenantId }"
    @import-success="handleSuccess"
  >
    <el-button type="info" plain @click="openImportExcel">
      导入部门用户
    </el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentDeptId = ref(1)
const tenantId = ref('tenant001')

const handleSuccess = () => {
  ElMessage.success('导入成功')
  refreshUserList()
}

const refreshUserList = () => {
  // 刷新用户列表
}
</script>
```

**使用说明:**

- `importParams` 中的参数会被拼接到URL后面，如 `/system/user/import?deptId=1&tenantId=tenant001`
- 支持对象嵌套，会自动转换为查询字符串格式
- 适用于传递过滤条件、上下文信息等参数

### 表单数据传递

通过 `importData` 传递表单数据（form-data）：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="商品数据"
    import-url="/mall/goods/import"
    template-url="/mall/goods/template"
    :import-data="{ updateSupport: true, categoryId: currentCategoryId }"
    @import-success="handleSuccess"
    @import-error="handleError"
  >
    <el-button type="info" plain @click="openImportExcel">
      导入商品数据
    </el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentCategoryId = ref(100)

const handleSuccess = () => {
  ElMessage.success('商品导入成功')
  refreshGoodsList()
}

const handleError = (error: any) => {
  console.error('导入失败:', error)
  ElMessage.error('导入失败，请检查文件格式')
}

const refreshGoodsList = () => {
  // 刷新商品列表
}
</script>
```

**使用说明:**

- `importData` 中的数据会作为form-data随文件一起上传
- 常用于传递 `updateSupport`（是否更新已存在数据）等业务参数
- 与URL参数不同，表单数据在请求体中传递

### 组合参数传递

同时使用URL参数和表单数据：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="部门成员"
    import-url="/system/user/import"
    template-url="/system/user/template"
    :import-params="{ deptId: currentDeptId }"
    :import-data="{ updateSupport: true, roleIds: selectedRoles }"
    @import-success="handleSuccess"
  >
    <el-button type="info" plain @click="openImportExcel">
      批量导入成员
    </el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentDeptId = ref(1)
const selectedRoles = ref([1, 2, 3])

const handleSuccess = () => {
  ElMessage.success('成员导入成功')
  refreshMemberList()
}

const refreshMemberList = () => {
  // 刷新成员列表
}
</script>
```

**使用说明:**

- URL参数通过 `importParams` 传递，会拼接到请求URL
- 表单数据通过 `importData` 传递，会作为form-data上传
- 两种参数传递方式可以同时使用，互不影响

## 权限控制

### 结合权限指令使用

在实际项目中，通常需要结合权限指令控制导入按钮的显示：

```vue
<template>
  <el-col :span="1.5" v-permi="['system:user:import']">
    <AImportExcel
      v-slot="{ openImportExcel }"
      title="用户数据"
      import-url="/system/user/importUsers"
      template-url="/system/user/templateUsers"
      @import-success="getList"
    >
      <el-button type="info" plain icon="Top" @click="openImportExcel">
        {{ t('导入') }}
      </el-button>
    </AImportExcel>
  </el-col>
</template>

<script setup lang="ts">
const { t } = useI18n()

const getList = () => {
  // 刷新列表数据
}
</script>
```

**使用说明:**

- 使用 `v-permi` 指令控制导入按钮的显示权限
- 权限标识格式通常为 `模块:功能:操作`，如 `system:user:import`
- 可以结合国际化函数 `t()` 支持多语言

### 多权限组合

需要多个权限同时满足时的使用方式：

```vue
<template>
  <el-col :span="1.5" v-permi="['system:user:import', 'system:user:add']">
    <AImportExcel
      v-slot="{ openImportExcel }"
      title="用户数据"
      import-url="/system/user/importUsers"
      template-url="/system/user/templateUsers"
      :import-data="{ deptId: currentDeptId }"
      @import-success="handleImportSuccess"
    >
      <el-button type="info" plain @click="openImportExcel">
        <el-icon><Upload /></el-icon>
        批量导入
      </el-button>
    </AImportExcel>
  </el-col>
</template>

<script setup lang="ts">
import { Upload } from '@element-plus/icons-vue'
import { ref } from 'vue'

const currentDeptId = ref(1)

const handleImportSuccess = () => {
  ElMessage.success('批量导入成功')
  getList()
}

const getList = () => {
  // 刷新列表
}
</script>
```

## 工具栏集成

### 在表格工具栏中使用

典型的在数据表格页面工具栏中的使用场景：

```vue
<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb-3">
      <el-col :span="1.5" v-permi="['system:user:add']">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5" v-permi="['system:user:update']">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5" v-permi="['system:user:delete']">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5" v-permi="['system:user:import']">
        <AImportExcel
          v-slot="{ openImportExcel }"
          title="用户数据"
          import-url="/system/user/importUsers"
          template-url="/system/user/templateUsers"
          @import-success="getList"
        >
          <el-button type="info" plain icon="Top" @click="openImportExcel">导入</el-button>
        </AImportExcel>
      </el-col>
      <el-col :span="1.5" v-permi="['system:user:export']">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <TableToolbar
        v-model:showSearch="showSearch"
        v-model:columns="visibleColumns"
        :columns="columns"
        @reset-query="resetQuery"
        @query-table="getList"
      />
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="用户编号" prop="userId" width="100" />
      <el-table-column label="用户名称" prop="userName" />
      <el-table-column label="用户昵称" prop="nickName" />
      <el-table-column label="手机号码" prop="phonenumber" width="120" />
      <el-table-column label="状态" prop="status" width="80">
        <template #default="{ row }">
          <DictTag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleUpdate(row)">修改</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDict } from '@/composables/useDict'

const { sys_normal_disable } = useDict('sys_normal_disable')

const loading = ref(false)
const showSearch = ref(true)
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const userList = ref([])
const visibleColumns = ref([])
const columns = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: ''
})

const getList = () => {
  loading.value = true
  // 调用API获取用户列表
  listUser(queryParams).then((response) => {
    userList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.userName = ''
  queryParams.phonenumber = ''
  handleQuery()
}

const handleSelectionChange = (selection: any[]) => {
  single.value = selection.length !== 1
  multiple.value = selection.length === 0
}

const handleAdd = () => {
  // 新增用户
}

const handleUpdate = (row?: any) => {
  // 修改用户
}

const handleDelete = (row?: any) => {
  // 删除用户
}

const handleExport = () => {
  // 导出用户
}

// 页面加载时获取数据
getList()
</script>
```

### 商品管理导入示例

商城模块中的商品导入使用场景：

```vue
<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb-3">
      <el-col :span="1.5" v-permi="['mall:goods:add']">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">
          {{ t('新增') }}
        </el-button>
      </el-col>
      <el-col :span="1.5" v-permi="['mall:goods:update']">
        <el-button type="success" plain icon="Edit" :disabled="selectionItems.length !== 1" @click="handleUpdate()">
          {{ t('修改') }}
        </el-button>
      </el-col>
      <el-col :span="1.5" v-permi="['mall:goods:delete']">
        <el-button type="danger" plain icon="Delete" :disabled="selectionItems.length === 0" @click="handleDelete()">
          {{ t('删除') }}
        </el-button>
      </el-col>
      <el-col :span="1.5" v-permi="['mall:goods:import']">
        <AImportExcel
          v-slot="{ openImportExcel }"
          title="商品"
          templateUrl="/mall/goods/templateGoods"
          importUrl="/mall/goods/importGoods"
          @import-success="getList"
        >
          <el-button type="info" plain icon="Top" @click="openImportExcel">
            {{ t('导入') }}
          </el-button>
        </AImportExcel>
      </el-col>
      <el-col :span="1.5" v-permi="['mall:goods:export']">
        <el-button type="warning" plain icon="Download" @click="handleExport">
          {{ t('导出') }}
        </el-button>
      </el-col>
      <TableToolbar
        v-model:showSearch="showSearch"
        @reset-query="resetQuery"
        @query-table="getList"
      />
    </el-row>

    <!-- 商品表格 -->
    <el-table v-loading="loading" :data="goodsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="商品编号" prop="goodsId" width="100" />
      <el-table-column label="商品名称" prop="goodsName" min-width="200" />
      <el-table-column label="商品价格" prop="price" width="100">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column label="库存" prop="stock" width="80" />
      <el-table-column label="状态" prop="status" width="80">
        <template #default="{ row }">
          <DictTag :options="goods_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleUpdate(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDict } from '@/composables/useDict'

const { t } = useI18n()
const { goods_status } = useDict('goods_status')

const loading = ref(false)
const showSearch = ref(true)
const goodsList = ref([])
const selectionItems = ref([])

const getList = () => {
  loading.value = true
  // 调用API获取商品列表
  listGoods(queryParams).then((response) => {
    goodsList.value = response.rows
    loading.value = false
  })
}

const handleSelectionChange = (selection: any[]) => {
  selectionItems.value = selection
}

const handleAdd = () => {
  // 新增商品
}

const handleUpdate = (row?: any) => {
  // 修改商品
}

const handleDelete = (row?: any) => {
  // 删除商品
}

const handleExport = () => {
  // 导出商品
}

const resetQuery = () => {
  // 重置查询
  getList()
}

getList()
</script>
```

## 事件处理

### 导入成功事件

处理导入成功后的业务逻辑：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="用户数据"
    import-url="/system/user/import"
    template-url="/system/user/template"
    @import-success="handleImportSuccess"
  >
    <el-button type="info" plain @click="openImportExcel">导入</el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { ElMessage, ElNotification } from 'element-plus'

const handleImportSuccess = () => {
  // 显示成功提示
  ElMessage.success('数据导入成功')

  // 刷新数据列表
  getList()

  // 发送通知
  ElNotification({
    title: '导入完成',
    message: '用户数据已成功导入，请查看最新数据',
    type: 'success',
    duration: 3000
  })

  // 记录操作日志
  console.log('用户数据导入成功，时间:', new Date().toISOString())
}

const getList = () => {
  // 刷新数据列表
}
</script>
```

### 导入失败事件

处理导入失败时的错误处理：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="订单数据"
    import-url="/mall/order/import"
    template-url="/mall/order/template"
    @import-success="handleSuccess"
    @import-error="handleError"
  >
    <el-button type="info" plain @click="openImportExcel">导入订单</el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'

const handleSuccess = () => {
  ElMessage.success('订单导入成功')
  getList()
}

const handleError = (error: any) => {
  console.error('导入失败:', error)

  // 根据错误类型显示不同提示
  if (error.code === 'FILE_FORMAT_ERROR') {
    ElMessageBox.alert(
      '文件格式错误，请确保上传的是Excel文件（.xls或.xlsx格式）',
      '导入失败',
      { type: 'error' }
    )
  } else if (error.code === 'DATA_VALIDATION_ERROR') {
    ElMessageBox.alert(
      `数据验证失败：${error.message}`,
      '导入失败',
      { type: 'error' }
    )
  } else if (error.code === 'NETWORK_ERROR') {
    ElMessage.error('网络异常，请检查网络连接后重试')
  } else {
    ElMessage.error('导入失败：' + (error.message || '未知错误'))
  }
}

const getList = () => {
  // 刷新列表
}
</script>
```

### 组合事件处理

结合加载状态和事件处理：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="配置数据"
    import-url="/system/config/import"
    template-url="/system/config/template"
    @import-success="handleSuccess"
    @import-error="handleError"
  >
    <el-button type="info" plain :loading="importing" @click="openImportExcel">
      {{ importing ? '导入中...' : '导入配置' }}
    </el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const importing = ref(false)

const handleSuccess = () => {
  importing.value = false
  ElMessage.success('配置导入成功')

  // 刷新配置缓存
  refreshConfigCache()

  // 刷新列表
  getList()
}

const handleError = (error: any) => {
  importing.value = false
  ElMessage.error('导入失败：' + error.message)
}

const refreshConfigCache = () => {
  // 刷新系统配置缓存
}

const getList = () => {
  // 刷新配置列表
}
</script>
```

## 高级用法

### 动态URL配置

根据业务条件动态设置导入URL：

```vue
<template>
  <div>
    <!-- 选择导入类型 -->
    <el-radio-group v-model="importType" class="mb-4">
      <el-radio value="basic">基础数据</el-radio>
      <el-radio value="detail">详细数据</el-radio>
      <el-radio value="full">完整数据</el-radio>
    </el-radio-group>

    <AImportExcel
      v-slot="{ openImportExcel }"
      :title="importTitle"
      :import-url="importUrl"
      :template-url="templateUrl"
      @import-success="handleSuccess"
    >
      <el-button type="info" plain @click="openImportExcel">
        导入{{ importTitle }}
      </el-button>
    </AImportExcel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const importType = ref('basic')

const importTitle = computed(() => {
  const titles: Record<string, string> = {
    basic: '基础数据',
    detail: '详细数据',
    full: '完整数据'
  }
  return titles[importType.value] || '数据'
})

const importUrl = computed(() => {
  return `/system/data/import/${importType.value}`
})

const templateUrl = computed(() => {
  return `/system/data/template/${importType.value}`
})

const handleSuccess = () => {
  ElMessage.success(`${importTitle.value}导入成功`)
  getList()
}

const getList = () => {
  // 刷新列表
}
</script>
```

### 条件参数传递

根据表单选择动态传递导入参数：

```vue
<template>
  <div>
    <!-- 导入配置表单 -->
    <el-form :model="importConfig" label-width="120px" class="mb-4">
      <el-form-item label="目标部门">
        <el-tree-select
          v-model="importConfig.deptId"
          :data="deptOptions"
          check-strictly
          placeholder="请选择部门"
        />
      </el-form-item>
      <el-form-item label="默认角色">
        <el-select v-model="importConfig.roleIds" multiple placeholder="请选择角色">
          <el-option
            v-for="role in roleOptions"
            :key="role.roleId"
            :label="role.roleName"
            :value="role.roleId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="更新已存在">
        <el-switch v-model="importConfig.updateSupport" />
      </el-form-item>
    </el-form>

    <AImportExcel
      v-slot="{ openImportExcel }"
      title="用户数据"
      import-url="/system/user/import"
      template-url="/system/user/template"
      :import-params="{ deptId: importConfig.deptId }"
      :import-data="importFormData"
      @import-success="handleSuccess"
    >
      <el-button type="primary" @click="openImportExcel">
        <el-icon><Upload /></el-icon>
        开始导入
      </el-button>
    </AImportExcel>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Upload } from '@element-plus/icons-vue'

const deptOptions = ref([])
const roleOptions = ref([])

const importConfig = reactive({
  deptId: null,
  roleIds: [],
  updateSupport: false
})

const importFormData = computed(() => ({
  roleIds: importConfig.roleIds.join(','),
  updateSupport: importConfig.updateSupport
}))

const handleSuccess = () => {
  ElMessage.success('用户导入成功')
  // 重置配置
  importConfig.roleIds = []
  importConfig.updateSupport = false
  // 刷新列表
  getList()
}

const getList = () => {
  // 刷新用户列表
}

// 获取部门和角色数据
const initOptions = async () => {
  // 获取部门树
  const deptRes = await getDeptTree()
  deptOptions.value = deptRes.data

  // 获取角色列表
  const roleRes = await getRoleList()
  roleOptions.value = roleRes.rows
}

initOptions()
</script>
```

### 自定义触发按钮样式

完全自定义触发导入的按钮样式：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="产品数据"
    import-url="/product/import"
    template-url="/product/template"
    @import-success="handleSuccess"
  >
    <!-- 卡片式导入入口 -->
    <el-card class="import-card" shadow="hover" @click="openImportExcel">
      <div class="import-card-content">
        <el-icon :size="48" color="#409EFF">
          <Upload />
        </el-icon>
        <div class="import-card-text">
          <h4>Excel批量导入</h4>
          <p>支持 .xls、.xlsx 格式</p>
        </div>
      </div>
    </el-card>
  </AImportExcel>
</template>

<script setup lang="ts">
import { Upload } from '@element-plus/icons-vue'

const handleSuccess = () => {
  ElMessage.success('产品导入成功')
  getList()
}

const getList = () => {
  // 刷新产品列表
}
</script>

<style scoped lang="scss">
.import-card {
  width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .import-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px;

    .import-card-text {
      text-align: center;

      h4 {
        margin: 0 0 4px;
        font-size: 16px;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| title | 导入标题，用于弹窗标题和模板文件名 | `string` | — | — |
| import-url | 导入数据的接口URL路径 | `string` | — | — |
| template-url | 导入模板的下载URL路径 | `string` | — | — |
| import-params | 导入URL参数，将拼接到URL后面作为查询字符串 | `Record<string, any>` | — | `{}` |
| import-data | 导入请求体参数，作为form-data随文件一起上传 | `Record<string, any>` | — | `{}` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| import-success | 导入成功时触发 | `()` |
| import-error | 导入失败时触发 | `(error: any)` |

### Slots

| 插槽名 | 说明 | 作用域插槽参数 |
|--------|------|----------------|
| default | 触发按钮内容，通过作用域插槽暴露控制方法 | `{ openImportExcel: () => void }` |

### 类型定义

```typescript
/**
 * Excel导入组件的Props接口定义
 */
interface AExcelImportProps {
  /**
   * 导入标题
   * 用于弹窗标题显示，格式为"{title}导入"
   * 也用于模板文件名，格式为"{title}模板_{时间}.xlsx"
   * @required
   */
  title: string

  /**
   * 导入数据的完整URL路径
   * 如果不提供，则不显示上传功能
   * @optional
   */
  importUrl?: string

  /**
   * 导入模板的完整URL路径
   * 如果不提供，则不显示下载模板链接
   * @optional
   */
  templateUrl?: string

  /**
   * 导入URL参数，将拼接到URL后面
   * 例如: { deptId: 1 } 会拼接为 ?deptId=1
   * @optional
   */
  importParams?: Record<string, any>

  /**
   * 导入请求体参数，作为form-data上传
   * 例如: { updateSupport: true } 会作为表单字段上传
   * @optional
   */
  importData?: Record<string, any>
}

/**
 * 导入弹窗配置接口
 */
interface ImportExcelOption {
  /** 是否显示导入弹出层 */
  open: boolean
  /** 导入弹出层标题 */
  title: string
  /** 是否禁用上传按钮（通常在上传进行中时设置为true） */
  isUploading: boolean
  /** 设置上传的请求头部 */
  headers: { [key: string]: any }
  /** 上传的服务端地址 */
  url: string
}

/**
 * 作用域插槽参数
 */
interface SlotProps {
  /** 打开导入弹窗或下载模板的方法 */
  openImportExcel: () => void
}
```

## 工作模式

组件支持三种工作模式，根据 `importUrl` 和 `templateUrl` 的配置自动切换：

### 模式一：完整导入模式

同时提供 `importUrl` 和 `templateUrl` 时启用：

```vue
<AImportExcel
  v-slot="{ openImportExcel }"
  title="用户数据"
  import-url="/system/user/import"
  template-url="/system/user/template"
  @import-success="getList"
>
  <el-button @click="openImportExcel">导入</el-button>
</AImportExcel>
```

**行为:**
- 点击按钮打开导入对话框
- 对话框中显示上传区域和"下载模板"链接
- 支持拖拽上传和点击选择文件
- 文件上传成功后显示导入结果

### 模式二：仅导入模式

只提供 `importUrl` 时启用：

```vue
<AImportExcel
  v-slot="{ openImportExcel }"
  title="商品数据"
  import-url="/mall/goods/import"
  @import-success="getList"
>
  <el-button @click="openImportExcel">导入</el-button>
</AImportExcel>
```

**行为:**
- 点击按钮打开导入对话框
- 对话框中只显示上传区域，不显示"下载模板"链接
- 其他功能与完整模式相同

### 模式三：仅下载模式

只提供 `templateUrl` 时启用：

```vue
<AImportExcel
  v-slot="{ openImportExcel }"
  title="订单数据"
  template-url="/mall/order/template"
>
  <el-button @click="openImportExcel">下载模板</el-button>
</AImportExcel>
```

**行为:**
- 点击按钮直接下载模板文件
- 不会打开任何对话框
- 下载的文件名格式：`{title}模板_{当前时间}.xlsx`

## 文件上传流程

### 完整上传流程

```text
用户点击导入按钮
       ↓
打开导入对话框
       ↓
选择/拖拽Excel文件
       ↓
前端格式验证（.xls/.xlsx）
       ↓  ← 验证失败则提示并阻止上传
点击确认按钮
       ↓
添加认证头部信息
       ↓
拼接URL参数（importParams）
       ↓
附加表单数据（importData）
       ↓
上传文件到服务器
       ↓  ← 网络错误触发 import-error 事件
服务器解析Excel数据
       ↓
执行业务规则校验
       ↓
将数据写入数据库
       ↓
返回导入结果
       ↓
关闭对话框
       ↓
显示导入结果弹窗
       ↓
触发 import-success 事件
```

### 文件格式验证

组件会对上传的文件进行格式验证：

```typescript
// 验证逻辑
const isExcel =
  file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
  file.raw.type === 'application/vnd.ms-excel' ||
  file.name.endsWith('.xlsx') ||
  file.name.endsWith('.xls')

if (!isExcel) {
  showMsgWarning('只能上传 Excel 文件!')
  uploadRef.value?.handleRemove(file)
  return false
}
```

**支持的文件格式:**
- `.xlsx` - Excel 2007及以上版本（application/vnd.openxmlformats-officedocument.spreadsheetml.sheet）
- `.xls` - Excel 97-2003版本（application/vnd.ms-excel）

## 最佳实践

### 1. 合理配置权限

为导入功能配置独立的权限标识：

```vue
<!-- 推荐：为导入功能配置独立权限 -->
<el-col :span="1.5" v-permi="['system:user:import']">
  <AImportExcel ... />
</el-col>

<!-- 不推荐：与其他功能共用权限 -->
<el-col :span="1.5" v-permi="['system:user:add']">
  <AImportExcel ... />
</el-col>
```

### 2. 提供完整的导入模板

同时配置 `importUrl` 和 `templateUrl`，为用户提供完整的导入体验：

```vue
<!-- 推荐：提供模板下载 -->
<AImportExcel
  title="用户数据"
  import-url="/system/user/import"
  template-url="/system/user/template"
  ...
/>

<!-- 不推荐：缺少模板 -->
<AImportExcel
  title="用户数据"
  import-url="/system/user/import"
  ...
/>
```

### 3. 处理导入结果

正确处理导入成功和失败事件：

```vue
<template>
  <AImportExcel
    @import-success="handleSuccess"
    @import-error="handleError"
    ...
  />
</template>

<script setup lang="ts">
// 推荐：完整的事件处理
const handleSuccess = () => {
  ElMessage.success('导入成功')
  getList() // 刷新数据
}

const handleError = (error: any) => {
  console.error('导入失败:', error)
  ElMessage.error('导入失败：' + error.message)
}
</script>
```

### 4. 使用语义化的标题

为导入组件设置清晰的标题：

```vue
<!-- 推荐：语义化标题 -->
<AImportExcel title="用户数据" ... />
<AImportExcel title="商品信息" ... />
<AImportExcel title="订单数据" ... />

<!-- 不推荐：模糊的标题 -->
<AImportExcel title="数据" ... />
<AImportExcel title="导入" ... />
```

### 5. 合理使用参数传递

根据实际需求选择参数传递方式：

```vue
<!-- URL参数：用于过滤条件、上下文信息 -->
<AImportExcel
  :import-params="{ deptId: currentDeptId, tenantId: tenantId }"
  ...
/>

<!-- 表单数据：用于业务配置参数 -->
<AImportExcel
  :import-data="{ updateSupport: true, skipError: false }"
  ...
/>
```

### 6. 统一按钮样式

保持导入按钮与其他工具栏按钮样式一致：

```vue
<!-- 推荐：统一的按钮样式 -->
<el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
<AImportExcel v-slot="{ openImportExcel }" ...>
  <el-button type="info" plain icon="Top" @click="openImportExcel">导入</el-button>
</AImportExcel>
<el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
```

### 7. 配合国际化使用

支持多语言环境：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    :title="t('user.data')"
    import-url="/system/user/import"
    template-url="/system/user/template"
    @import-success="getList"
  >
    <el-button type="info" plain icon="Top" @click="openImportExcel">
      {{ t('common.import') }}
    </el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
```

## 常见问题

### 1. 导入文件格式错误

**问题描述:** 上传非Excel格式文件时提示格式错误

**问题原因:**
- 上传了非Excel格式的文件
- 文件扩展名被修改但实际不是Excel格式
- 文件损坏无法识别

**解决方案:**
```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="用户数据"
    import-url="/system/user/import"
    template-url="/system/user/template"
    @import-error="handleError"
  >
    <el-button @click="openImportExcel">导入</el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
const handleError = (error: any) => {
  if (error.type === 'format') {
    ElMessageBox.alert(
      '请上传正确的Excel文件格式（.xls 或 .xlsx）',
      '文件格式错误',
      { type: 'warning' }
    )
  }
}
</script>
```

### 2. 导入接口认证失败

**问题描述:** 上传时返回401未授权错误

**问题原因:**
- Token过期
- 认证头部信息缺失
- 接口权限配置错误

**解决方案:**

组件已自动处理认证头部，如果仍有问题，检查以下方面：

```typescript
// 组件内部自动添加认证头部
headers: useToken().getAuthHeaders()

// 如果认证失败，检查 Token 状态
const { getAuthHeaders, isTokenValid } = useToken()

// 确保 Token 有效
if (!isTokenValid()) {
  // 跳转到登录页
  router.push('/login')
}
```

### 3. 导入数据验证失败

**问题描述:** 导入时提示数据验证失败

**问题原因:**
- Excel数据格式不符合要求
- 必填字段为空
- 数据类型不匹配

**解决方案:**
```vue
<template>
  <div>
    <!-- 提示用户下载模板 -->
    <el-alert
      type="info"
      title="导入说明"
      description="请先下载导入模板，按照模板格式填写数据后再上传"
      show-icon
      :closable="false"
      class="mb-4"
    />

    <AImportExcel
      v-slot="{ openImportExcel }"
      title="用户数据"
      import-url="/system/user/import"
      template-url="/system/user/template"
      @import-success="handleSuccess"
    >
      <el-button @click="openImportExcel">导入</el-button>
    </AImportExcel>
  </div>
</template>
```

### 4. 大文件上传超时

**问题描述:** 上传大型Excel文件时请求超时

**问题原因:**
- 文件过大
- 网络速度慢
- 服务器处理时间长

**解决方案:**

```typescript
// 建议在后端配置中增加超时时间
// application.yml
spring:
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB

// 前端可以提示用户
const handleLargeFile = () => {
  ElMessage.info('大文件上传可能需要较长时间，请耐心等待')
}
```

### 5. 导入后数据未刷新

**问题描述:** 导入成功后页面数据未更新

**问题原因:**
- 未正确监听 `import-success` 事件
- 刷新方法调用错误
- 数据缓存问题

**解决方案:**
```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="用户数据"
    import-url="/system/user/import"
    template-url="/system/user/template"
    @import-success="handleImportSuccess"
  >
    <el-button @click="openImportExcel">导入</el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
const handleImportSuccess = () => {
  // 确保正确调用刷新方法
  nextTick(() => {
    getList()
  })
}

const getList = async () => {
  // 清除可能的缓存
  loading.value = true
  try {
    const res = await listUser(queryParams)
    userList.value = res.rows
    total.value = res.total
  } finally {
    loading.value = false
  }
}
</script>
```

### 6. 模板下载失败

**问题描述:** 点击下载模板无反应或下载失败

**问题原因:**
- 模板URL配置错误
- 后端接口异常
- 网络问题

**解决方案:**
```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="用户数据"
    :template-url="templateUrl"
    import-url="/system/user/import"
  >
    <el-button @click="openImportExcel">导入</el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 确保模板URL正确
const templateUrl = computed(() => {
  // 使用完整路径或确保相对路径正确
  return '/system/user/templateUsers'
})
</script>
```

### 7. 参数未正确传递

**问题描述:** 导入时后端未收到预期的参数

**问题原因:**
- 参数类型不正确
- 参数名拼写错误
- 参数值为 undefined

**解决方案:**
```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="用户数据"
    import-url="/system/user/import"
    :import-params="validParams"
    :import-data="validData"
  >
    <el-button @click="openImportExcel">导入</el-button>
  </AImportExcel>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const deptId = ref(1)
const updateSupport = ref(true)

// 确保参数有效
const validParams = computed(() => {
  const params: Record<string, any> = {}
  if (deptId.value) {
    params.deptId = deptId.value
  }
  return params
})

const validData = computed(() => ({
  updateSupport: updateSupport.value ?? false
}))
</script>
```

## 完整示例

### 综合使用示例

```vue
<template>
  <div class="user-management">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" class="mb-4">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="用户状态" clearable>
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门" prop="deptId">
        <el-tree-select
          v-model="queryParams.deptId"
          :data="deptOptions"
          check-strictly
          placeholder="请选择部门"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb-4">
      <el-col :span="1.5" v-permi="['system:user:add']">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5" v-permi="['system:user:update']">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="selectionItems.length !== 1"
          @click="handleUpdate()"
        >
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5" v-permi="['system:user:delete']">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="selectionItems.length === 0"
          @click="handleDelete()"
        >
          删除
        </el-button>
      </el-col>

      <!-- Excel导入组件 -->
      <el-col :span="1.5" v-permi="['system:user:import']">
        <AImportExcel
          v-slot="{ openImportExcel }"
          title="用户数据"
          import-url="/system/user/importUsers"
          template-url="/system/user/templateUsers"
          :import-params="importParams"
          :import-data="importData"
          @import-success="handleImportSuccess"
          @import-error="handleImportError"
        >
          <el-button type="info" plain icon="Top" @click="openImportExcel">导入</el-button>
        </AImportExcel>
      </el-col>

      <el-col :span="1.5" v-permi="['system:user:export']">
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-col>

      <TableToolbar
        v-model:showSearch="showSearch"
        v-model:columns="visibleColumns"
        :columns="columns"
        @reset-query="resetQuery"
        @query-table="getList"
      />
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="userList"
      @selection-change="handleSelectionChange"
      border
      stripe
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="用户编号" prop="userId" width="100" align="center" />
      <el-table-column label="用户名称" prop="userName" width="120" show-overflow-tooltip />
      <el-table-column label="用户昵称" prop="nickName" width="120" show-overflow-tooltip />
      <el-table-column label="部门" prop="dept.deptName" width="120" show-overflow-tooltip />
      <el-table-column label="手机号码" prop="phonenumber" width="130" />
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template #default="{ row }">
          <DictTag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="160" />
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <el-button v-permi="['system:user:update']" type="primary" link @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-permi="['system:user:delete']" type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
          <el-dropdown v-permi="['system:user:resetPwd', 'system:user:authRole']">
            <el-button type="primary" link>
              更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleResetPwd(row)">重置密码</el-dropdown-item>
                <el-dropdown-item @click="handleAuthRole(row)">分配角色</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 用户编辑对话框 -->
    <UserDialog ref="userDialogRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDict } from '@/composables/useDict'
import { listUser, delUser, exportUser } from '@/api/system/user'
import { getDeptTree } from '@/api/system/dept'
import UserDialog from './UserDialog.vue'

// 字典数据
const { sys_normal_disable } = useDict('sys_normal_disable')

// 状态管理
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const userList = ref<any[]>([])
const selectionItems = ref<any[]>([])
const deptOptions = ref<any[]>([])
const visibleColumns = ref<string[]>([])
const columns = ref<any[]>([])

// 对话框引用
const userDialogRef = ref()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: '',
  deptId: null as number | null
})

// 导入参数
const importParams = computed(() => {
  const params: Record<string, any> = {}
  if (queryParams.deptId) {
    params.deptId = queryParams.deptId
  }
  return params
})

const importData = computed(() => ({
  updateSupport: true
}))

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const res = await listUser(queryParams)
    userList.value = res.rows
    total.value = res.total
  } finally {
    loading.value = false
  }
}

// 获取部门树
const getDeptOptions = async () => {
  const res = await getDeptTree()
  deptOptions.value = res.data
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.userName = ''
  queryParams.status = ''
  queryParams.deptId = null
  handleQuery()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectionItems.value = selection
}

// 新增
const handleAdd = () => {
  userDialogRef.value?.open()
}

// 修改
const handleUpdate = (row?: any) => {
  const userId = row?.userId || selectionItems.value[0]?.userId
  userDialogRef.value?.open(userId)
}

// 删除
const handleDelete = async (row?: any) => {
  const userIds = row?.userId ? [row.userId] : selectionItems.value.map(item => item.userId)
  await ElMessageBox.confirm(`确认删除选中的${userIds.length}条用户吗？`, '提示', {
    type: 'warning'
  })
  await delUser(userIds.join(','))
  ElMessage.success('删除成功')
  getList()
}

// 导入成功
const handleImportSuccess = () => {
  ElMessage.success('用户数据导入成功')
  getList()
}

// 导入失败
const handleImportError = (error: any) => {
  console.error('导入失败:', error)
  ElMessage.error('导入失败：' + (error.message || '未知错误'))
}

// 导出
const handleExport = async () => {
  await exportUser(queryParams)
}

// 重置密码
const handleResetPwd = (row: any) => {
  // 实现重置密码逻辑
}

// 分配角色
const handleAuthRole = (row: any) => {
  // 实现分配角色逻辑
}

// 初始化
onMounted(() => {
  getList()
  getDeptOptions()
})
</script>

<style scoped lang="scss">
.user-management {
  padding: 20px;
}
</style>
```

该示例展示了 `AImportExcel` 组件在实际用户管理页面中的完整应用，包括：
- 查询条件表单
- 工具栏按钮（新增、修改、删除、导入、导出）
- 数据表格展示
- 分页组件
- 权限控制
- 事件处理
- 参数传递

通过这个综合示例，可以了解如何在实际业务场景中正确使用 Excel 导入功能。
