# AImportExcel Excel导入组件

Excel导入组件，提供Excel文件的上传、导入和模板下载功能。支持拖拽上传、文件格式验证和导入结果展示。

## 基础用法

最简单的使用方式：

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

<script setup>
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

## 只提供导入功能

不提供模板下载，只有导入功能：

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
```

## 只提供模板下载

只提供模板下载功能，点击直接下载：

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
```

## 带权限控制

结合权限指令使用：

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
```

## 带请求参数

传递URL参数和表单数据：

```vue
<template>
  <AImportExcel
    v-slot="{ openImportExcel }"
    title="部门用户"
    import-url="/system/user/import"
    template-url="/system/user/template"
    :import-params="{ deptId: currentDeptId }"
    :import-data="{ updateSupport: true }"
    @import-success="handleSuccess"
    @import-error="handleError"
  >
    <el-button type="info" plain @click="openImportExcel">
      导入部门用户
    </el-button>
  </AImportExcel>
</template>

<script setup>
const currentDeptId = ref(1)

const handleSuccess = () => {
  ElMessage.success('导入成功')
  refreshUserList()
}

const handleError = (error) => {
  console.error('导入失败:', error)
  ElMessage.error('导入失败，请检查文件格式')
}
</script>
```

## 在表格工具栏中使用

典型的在数据表格页面中的使用场景：

```vue
<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <!-- 查询条件表单项 -->
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb-3">
      <el-col :span="1.5">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <AImportExcel
          v-slot="{ openImportExcel }"
          title="用户数据"
          import-url="/system/user/importUsers"
          template-url="/system/user/templateUsers"
          @import-success="getList"
        >
          <el-button type="info" plain icon="Top" @click="openImportExcel">
            导入
          </el-button>
        </AImportExcel>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="userList">
      <!-- 表格列定义 -->
    </el-table>
  </div>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| title | 导入标题 | `string` | — | — |
| import-url | 导入数据的URL路径 | `string` | — | — |
| template-url | 导入模板的URL路径 | `string` | — | — |
| import-params | 导入URL参数 | `Record<string, any>` | — | — |
| import-data | 导入请求体参数 | `Record<string, any>` | — | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| import-success | 导入成功 | `()` |
| import-error | 导入失败 | `(error: any)` |

### Slots

| 插槽名 | 说明 | 作用域插槽参数 |
|--------|------|----------------|
| default | 触发按钮内容 | `{ openImportExcel: Function }` |

## 功能特性

### 文件上传
- **拖拽上传**：支持将Excel文件拖拽到上传区域
- **点击选择**：点击上传区域选择文件
- **格式验证**：自动验证文件格式（仅支持.xls和.xlsx）
- **进度显示**：显示文件上传进度

### 导入处理
- **自动更新**：导入时自动更新已存在的数据
- **结果展示**：详细的导入结果展示
- **错误提示**：清晰的错误信息和处理建议

### 模板管理
- **模板下载**：提供标准的Excel导入模板
- **格式指导**：模板中包含格式说明和示例数据
- **动态命名**：下载的模板文件包含时间戳

## 文件格式要求

### 支持的文件格式
- `.xlsx` - Excel 2007及以上版本
- `.xls` - Excel 97-2003版本

### 文件内容要求
- **表头规范**：第一行为字段名称，需与后端接口对应
- **数据格式**：每列数据格式需符合字段要求
- **必填字段**：必填字段不能为空
- **数据校验**：数据需通过后端业务校验

## 导入流程

1. **选择文件**：用户选择或拖拽Excel文件
2. **格式验证**：前端验证文件格式
3. **上传文件**：将文件上传到服务器
4. **数据解析**：服务器解析Excel数据
5. **业务校验**：执行业务规则校验
6. **数据导入**：将数据写入数据库
7. **结果返回**：返回导入结果详情

## 错误处理

### 常见错误场景
- **文件格式错误**：上传非Excel格式文件
- **文件损坏**：Excel文件无法正常解析
- **数据格式错误**：单元格数据格式不符合要求
- **必填字段缺失**：必填字段为空或缺失
- **数据校验失败**：数据不符合业务规则
- **网络异常**：上传过程中网络中断

### 错误提示
组件会显示详细的错误信息，帮助用户快速定位和解决问题：

```javascript
// 导入结果示例
{
  code: 200,
  msg: "导入结果：成功导入 10 条数据，失败 2 条数据。<br/>第3行：手机号格式错误<br/>第7行：邮箱已存在"
}
```
