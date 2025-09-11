# ASelectionTags 选择标签组件

可选中的标签组件，用于展示已选择的项目，支持关闭、清空操作和自定义显示内容。

## 基础用法

最简单的使用方式，展示已选择的用户列表：

```vue
<template>
  <div>
    <!-- 用户选择器 -->
    <el-select v-model="selectedUserIds" multiple placeholder="选择用户">
      <el-option
        v-for="user in allUsers"
        :key="user.id"
        :label="user.name"
        :value="user.id"
      />
    </el-select>
    
    <!-- 已选择的用户标签 -->
    <ASelectionTags
      :items="selectedUsers"
      @close="removeUser"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedUserIds = ref([1, 2])

const allUsers = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' }
])

// 根据选中的ID计算已选择的用户
const selectedUsers = computed(() => {
  return allUsers.value.filter(user => selectedUserIds.value.includes(user.id))
})

const removeUser = (userId) => {
  selectedUserIds.value = selectedUserIds.value.filter(id => id !== userId)
}
</script>
```

## 带清空功能

添加清空所有选择的功能：

```vue
<template>
  <ASelectionTags
    :items="selectedItems"
    :on-clear="clearAllSelections"
    @close="removeItem"
  >
    <template #header>
      <span class="text-sm text-gray-500 mb-2 block">已选择商品：</span>
    </template>
  </ASelectionTags>
</template>

<script setup>
import { ref } from 'vue'

const selectedItems = ref([
  { id: 1, name: 'iPhone 15', price: 5999 },
  { id: 2, name: 'MacBook Pro', price: 12999 },
  { id: 3, name: 'AirPods Pro', price: 1899 }
])

const removeItem = (itemId) => {
  selectedItems.value = selectedItems.value.filter(item => item.id !== itemId)
}

const clearAllSelections = () => {
  selectedItems.value = []
}
</script>
```

## 自定义显示内容

使用默认插槽自定义标签的显示内容：

```vue
<template>
  <ASelectionTags
    :items="selectedProducts"
    type="warning"
    effect="dark"
    @close="removeProduct"
  >
    <template #header>
      <div class="flex items-center mb-2">
        <el-icon class="mr-1"><ShoppingCart /></el-icon>
        <span class="text-sm font-medium">购物车商品</span>
      </div>
    </template>
    
    <!-- 自定义标签内容 -->
    <template #default="{ item }">
      <div class="flex items-center">
        <span>{{ item.name }}</span>
        <el-divider direction="vertical" />
        <span class="text-red-500 font-bold">¥{{ item.price }}</span>
      </div>
    </template>
    
    <template #footer>
      <div class="mt-2 text-sm text-gray-600">
        共 {{ selectedProducts.length }} 件商品，
        总价：¥{{ totalPrice }}
      </div>
    </template>
  </ASelectionTags>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ShoppingCart } from '@element-plus/icons-vue'

const selectedProducts = ref([
  { id: 1, name: 'iPhone 15', price: 5999, category: '手机' },
  { id: 2, name: 'MacBook Pro', price: 12999, category: '电脑' }
])

const totalPrice = computed(() => {
  return selectedProducts.value.reduce((sum, item) => sum + item.price, 0)
})

const removeProduct = (productId) => {
  selectedProducts.value = selectedProducts.value.filter(item => item.id !== productId)
}
</script>
```

## 自定义格式化函数

通过 formatter 属性自定义文本显示格式：

```vue
<template>
  <ASelectionTags
    :items="selectedTags"
    :formatter="formatTagText"
    type="info"
    size="small"
    @close="removeTag"
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedTags = ref([
  { id: 1, name: 'Vue.js', count: 150, category: 'frontend' },
  { id: 2, name: 'React', count: 200, category: 'frontend' },
  { id: 3, name: 'Node.js', count: 80, category: 'backend' }
])

// 自定义格式化函数
const formatTagText = (item) => {
  return `${item.name} (${item.count})`
}

const removeTag = (tagId) => {
  selectedTags.value = selectedTags.value.filter(tag => tag.id !== tagId)
}
</script>
```

## 不同样式和主键配置

使用不同的标签样式和自定义主键字段：

```vue
<template>
  <div class="space-y-4">
    <!-- 成功状态标签 -->
    <ASelectionTags
      :items="completedTasks"
      type="success"
      effect="plain"
      key-field="taskId"
      @close="removeTask"
    >
      <template #header>
        <span class="text-green-600 font-medium">已完成任务：</span>
      </template>
    </ASelectionTags>
    
    <!-- 警告状态标签 -->
    <ASelectionTags
      :items="pendingTasks"
      type="warning"
      effect="dark"
      size="large"
      key-field="taskId"
      @close="removeTask"
    >
      <template #header>
        <span class="text-orange-600 font-medium">待处理任务：</span>
      </template>
    </ASelectionTags>
    
    <!-- 自定义颜色标签 -->
    <ASelectionTags
      :items="urgentTasks"
      color="#ff4757"
      key-field="taskId"
      @close="removeTask"
    >
      <template #header>
        <span class="text-red-600 font-medium">紧急任务：</span>
      </template>
    </ASelectionTags>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const completedTasks = ref([
  { taskId: 1, title: '完成用户界面设计', priority: 'high' },
  { taskId: 2, title: '修复登录bug', priority: 'medium' }
])

const pendingTasks = ref([
  { taskId: 3, title: '编写API文档', priority: 'low' },
  { taskId: 4, title: '代码review', priority: 'medium' }
])

const urgentTasks = ref([
  { taskId: 5, title: '修复生产环境bug', priority: 'urgent' }
])

const removeTask = (taskId) => {
  completedTasks.value = completedTasks.value.filter(task => task.taskId !== taskId)
  pendingTasks.value = pendingTasks.value.filter(task => task.taskId !== taskId)
  urgentTasks.value = urgentTasks.value.filter(task => task.taskId !== taskId)
}
</script>
```

## 条件显示

根据业务逻辑控制组件的显示：

```vue
<template>
  <div>
    <el-switch v-model="showSelections" active-text="显示选择" />
    
    <ASelectionTags
      :items="selectedFiles"
      :visible="showSelections && selectedFiles.length > 0"
      :closable="!readonly"
      @close="removeFile"
    >
      <template #header>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-600">已选择文件：</span>
          <el-switch v-model="readonly" active-text="只读模式" size="small" />
        </div>
      </template>
    </ASelectionTags>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showSelections = ref(true)
const readonly = ref(false)

const selectedFiles = ref([
  { id: 1, name: 'document.pdf', size: 1024, type: 'pdf' },
  { id: 2, name: 'image.jpg', size: 2048, type: 'image' }
])

const removeFile = (fileId) => {
  if (!readonly.value) {
    selectedFiles.value = selectedFiles.value.filter(file => file.id !== fileId)
  }
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| items | 要展示的选中项数组 | `any[]` | — | — |
| closable | 是否可关闭 | `boolean` | — | `true` |
| visible | 是否显示 | `boolean` | — | `true` |
| type | 标签类型 | `ElTagType` | `success` / `info` / `warning` / `danger` | `'success'` |
| effect | 标签效果 | `ElEffect` | `dark` / `light` / `plain` | `'light'` |
| size | 标签大小 | `ElSize` | `large` / `default` / `small` | `'default'` |
| color | 自定义标签颜色 | `string` | — | `''` |
| key-field | 主键字段名 | `string` | — | `'id'` |
| formatter | 文本格式化函数 | `(item: any) => string` | — | 自动提取常见字段 |
| on-clear | 清空选择的回调函数 | `() => void` | — | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 点击标签关闭图标时触发 | `(key: any, item: any)` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 自定义标签内容 | `{ item }` |
| header | 头部内容，可用于添加标题或说明 | — |
| footer | 尾部内容，可用于添加操作按钮或额外信息 | — |

## 文本格式化规则

当未提供 `formatter` 属性时，组件会按以下优先级自动提取显示文本：

1. `item.label`
2. `item.name`
3. `item.title`
4. `item.value`
5. `item.text`
6. `item.key`
7. `item[keyField]`（使用 key-field 指定的字段）
8. `JSON.stringify(item)`（最后的兜底方案）

## 特性

- **灵活的数据格式**：支持任意对象结构的数组数据
- **自定义显示**：支持格式化函数和插槽自定义内容
- **多种样式**：支持 Element Plus 标签的所有样式选项
- **条件显示**：支持根据条件控制组件显示隐藏
- **清空功能**：可选的一键清空所有选择功能
- **自定义主键**：支持使用非 id 字段作为唯一标识
- **响应式设计**：自动换行和间距处理

## 样式说明

组件采用灵活的布局设计：

- **标签间距**：右边距 1 单位，下边距 1 单位（`mr-1 mb-1`）
- **容器间距**：顶部边距 2 单位（`mt-2`）
- **自动换行**：标签超出容器宽度时自动换行
- **响应式适配**：适配不同屏幕尺寸

## 最佳实践

1. **合理使用 key-field**：确保主键字段的唯一性
2. **提供有意义的格式化函数**：为复杂对象提供清晰的显示文本
3. **使用插槽增强交互**：通过 header 和 footer 插槽提供更多信息
4. **条件控制显示**：在没有选择项时隐藏组件
5. **配合选择器使用**：与 el-select、el-checkbox-group 等组件配合使用

## 注意事项

1. `items` 数组为空时组件会自动隐藏
2. `on-clear` 属性存在时才会显示清空按钮
3. `key-field` 指定的字段必须在每个 item 中存在且唯一
4. 自定义 `formatter` 函数应该返回字符串类型
5. `close` 事件同时返回主键和完整的 item 对象
6. 组件基于 Element Plus 的 `el-tag` 组件，继承其所有样式特性
