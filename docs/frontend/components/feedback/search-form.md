# ASearchForm 搜索表单组件

通用搜索表单容器组件，提供带动画效果的表单显示隐藏、双向数据绑定和灵活的布局配置。

## 基础用法

最简单的使用方式，创建一个带标题的搜索表单：

```vue
<template>
  <ASearchForm v-model="queryParams" title="搜索条件">
    <el-form-item label="用户名">
      <el-input v-model="queryParams.username" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="queryParams.status" placeholder="请选择状态">
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </ASearchForm>
</template>

<script setup>
import { ref } from 'vue'

const queryParams = ref({
  username: '',
  status: ''
})

const handleSearch = () => {
  console.log('搜索参数:', queryParams.value)
}

const handleReset = () => {
  queryParams.value = {
    username: '',
    status: ''
  }
}
</script>
```

## 控制显示隐藏

通过 `visible` 属性控制表单的显示和隐藏，支持动画效果：

```vue
<template>
  <div>
    <el-button @click="toggleSearch">
      {{ showSearch ? '隐藏搜索' : '显示搜索' }}
    </el-button>
    
    <ASearchForm 
      v-model="queryParams" 
      :visible="showSearch"
      title="搜索条件"
    >
      <el-form-item label="关键词">
        <el-input v-model="queryParams.keyword" placeholder="请输入关键词" />
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="queryParams.dateRange"
          type="daterange"
          placeholder="选择日期范围"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </ASearchForm>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showSearch = ref(true)
const searchFormRef = ref()

const queryParams = ref({
  keyword: '',
  dateRange: []
})

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const resetForm = () => {
  searchFormRef.value?.resetFields()
}
</script>
```

## 自定义布局

配置不同的表单布局和标签样式：

```vue
<template>
  <!-- 垂直布局 -->
  <ASearchForm 
    v-model="queryParams" 
    :inline="false"
    label-width="120px"
    label-position="left"
    title="详细搜索"
  >
    <el-form-item label="商品名称">
      <el-input v-model="queryParams.productName" />
    </el-form-item>
    <el-form-item label="商品分类">
      <el-select v-model="queryParams.category" style="width: 100%">
        <el-option label="电子产品" value="electronics" />
        <el-option label="服装" value="clothing" />
      </el-select>
    </el-form-item>
    <el-form-item label="价格范围">
      <el-input-number v-model="queryParams.minPrice" :min="0" />
      <span class="mx-2">至</span>
      <el-input-number v-model="queryParams.maxPrice" :min="0" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary">搜索</el-button>
      <el-button>重置</el-button>
    </el-form-item>
  </ASearchForm>
</template>
```

## 自定义头部

使用 header 插槽自定义卡片头部内容：

```vue
<template>
  <ASearchForm v-model="queryParams">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <el-icon class="mr-2"><Search /></el-icon>
          <span class="font-medium">高级搜索</span>
        </div>
        <div>
          <el-button size="small" @click="saveSearchTemplate">保存模板</el-button>
          <el-button size="small" @click="loadSearchTemplate">加载模板</el-button>
        </div>
      </div>
    </template>
    
    <!-- 表单内容 -->
    <el-form-item label="标题">
      <el-input v-model="queryParams.title" />
    </el-form-item>
    <el-form-item label="作者">
      <el-input v-model="queryParams.author" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary">搜索</el-button>
    </el-form-item>
  </ASearchForm>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

const queryParams = ref({
  title: '',
  author: ''
})

const saveSearchTemplate = () => {
  console.log('保存搜索模板')
}

const loadSearchTemplate = () => {
  console.log('加载搜索模板')
}
</script>
```

## 复杂表单示例

结合表单验证和复杂布局的完整示例：

```vue
<template>
  <ASearchForm 
    ref="searchFormRef"
    v-model="queryParams" 
    :visible="showSearch"
    :inline="false"
    label-width="100px"
    title="用户搜索"
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="queryParams.username" 
            placeholder="支持模糊搜索"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="queryParams.email" 
            placeholder="请输入邮箱地址"
            clearable
          />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="角色" prop="role">
          <el-select v-model="queryParams.role" placeholder="选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="queryParams.status">
            <el-radio value="">全部</el-radio>
            <el-radio value="1">启用</el-radio>
            <el-radio value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="注册时间" prop="registerTime">
          <el-date-picker
            v-model="queryParams.registerTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-form-item>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><RefreshLeft /></el-icon>
        重置
      </el-button>
      <el-button type="info" @click="toggleSearch">
        <el-icon><ArrowUp /></el-icon>
        收起
      </el-button>
    </el-form-item>
  </ASearchForm>
</template>

<script setup>
import { ref } from 'vue'
import { Search, RefreshLeft, ArrowUp } from '@element-plus/icons-vue'

const searchFormRef = ref()
const showSearch = ref(true)

const queryParams = ref({
  username: '',
  email: '',
  role: '',
  status: '',
  registerTime: []
})

const handleSearch = () => {
  console.log('搜索参数:', queryParams.value)
  // 执行搜索逻辑
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model-value | 表单数据模型（支持 v-model） | `Record<string, any>` | — | `{}` |
| visible | 控制表单显示/隐藏 | `boolean` | — | `true` |
| inline | 是否为行内表单 | `boolean` | — | `true` |
| label-width | 标签宽度 | `string` | — | `'auto'` |
| label-position | 标签位置 | `string` | `left` / `right` / `top` | `'right'` |
| title | 卡片标题（未使用 header 插槽时显示） | `string` | — | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 表单数据变化时触发 | `(value: Record<string, any>)` |
| search | 搜索时触发（需手动调用） | — |
| reset | 重置时触发 | — |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| resetFields | 重置表单字段到初始值 | — | — |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 表单内容区域 | — |
| header | 自定义卡片头部 | — |

## 动画效果

组件内置了搜索表单的显示隐藏动画：

- **进入动画**：使用 `searchAnimate.enter` 类名
- **离开动画**：使用 `searchAnimate.leave` 类名
- **动画触发**：通过 `visible` 属性控制
- **平滑过渡**：提供优雅的视觉体验

动画类名来自 `@/composables/useAnimation` 组合式函数，具体效果包括：
- 淡入淡出效果
- 高度变化动画
- 平滑的过渡时间

## 标签位置说明

`label-position` 属性控制标签文本在标签区域内的对齐方式：

- **`right`**（默认）：标签文本右对齐，标签紧贴表单控件
- **`left`**：标签文本左对齐，标签远离表单控件
- **`top`**：标签显示在表单控件上方

## 特性

- **双向数据绑定**：完整支持 v-model 语法
- **动画过渡**：内置优雅的显示隐藏动画
- **灵活布局**：支持行内和块级布局
- **卡片容器**：使用 Element Plus 卡片组件包装
- **插槽支持**：可自定义头部和内容区域
- **方法暴露**：提供表单重置等常用方法
- **响应式友好**：适配不同屏幕尺寸

## 样式特点

- 卡片阴影效果：使用 `shadow="hover"` 提供悬停反馈
- 优化的内边距：卡片内容区域使用 `10px 20px 0 20px` 内边距
- 底部间距：容器使用 `mb-[10px]` 提供与下方内容的间距
- 灵活的头部布局：支持标题显示和自定义内容

## 最佳实践

1. **合理使用 `inline` 属性**：简单搜索使用行内布局，复杂搜索使用块级布局
2. **配合 TableToolbar 使用**：通过 TableToolbar 的搜索按钮控制 `visible` 属性
3. **使用 ref 调用方法**：通过组件 ref 调用 `resetFields` 方法重置表单
4. **自定义头部操作**：使用 header 插槽添加保存搜索条件、高级搜索等功能
5. **响应式布局**：在复杂表单中使用 `el-row` 和 `el-col` 实现响应式布局

## 注意事项

1. 组件基于 Element Plus 的 `el-form` 和 `el-card` 组件
2. 表单数据通过 `v-model` 进行双向绑定
3. `resetFields` 方法依赖于 Element Plus 表单的重置功能
4. 动画效果需要 `@/composables/useAnimation` 组合式函数支持
5. 卡片内边距已通过样式进行了优化
6. 组件会自动处理表单数据的响应式更新
