# ADetailDialog 通用详情弹窗组件

用于显示详细信息的弹窗组件，支持字段配置、密码字段显示/隐藏、分组显示、自定义格式化等功能。

## 基础用法

最简单的使用方式：

```vue
<template>
  <ADetailDialog
    v-model="visible"
    title="用户详情"
    :data="userData"
    :fields="userFields"
  />
</template>

<script setup>
import type { FieldConfig } from '@/components/ADetailDialog/types'

const visible = ref(false)

const userData = ref({
  id: 1001,
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  status: 1,
  createTime: '2024-01-15 10:30:00'
})

// 正确的 TypeScript 类型声明方式
const userFields = ref<FieldConfig[]>([
  { prop: 'id', label: '用户ID' },
  { prop: 'name', label: '姓名' },
  { prop: 'email', label: '邮箱' },
  { prop: 'phone', label: '手机号' },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: userStatusOptions },
  { prop: 'createTime', label: '创建时间', type: 'datetime' }
])
</script>
```

## 密码字段显示

对于敏感信息如密钥、密码等，支持显示/隐藏功能：

```vue
<template>
  <ADetailDialog
    v-model="visible"
    title="平台配置详情"
    :data="platformData"
    :fields="platformFields"
  />
</template>

<script setup>
const platformData = ref({
  name: '微信小程序',
  appId: 'wx1234567890abcdef',
  secret: 'abcdef1234567890abcdef1234567890',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
})

const platformFields = ref<FieldConfig[]>([
  { prop: 'name', label: '平台名称' },
  { prop: 'appId', label: 'App ID' },
  { prop: 'secret', label: '应用密钥', type: 'password' },
  { prop: 'token', label: '接口Token', type: 'password' }
])
</script>
```

## 分组显示

当字段较多时，可以按逻辑分组显示：

```vue
<template>
  <ADetailDialog
    v-model="visible"
    title="支付配置详情"
    :data="paymentData"
    :fields="paymentFields"
  />
</template>

<script setup>
const paymentData = ref({
  name: '微信支付',
  merchantId: 'mch1234567890',
  appId: 'wx1234567890abcdef',
  mchKey: 'abcdef1234567890abcdef1234567890',
  certPath: '/path/to/cert.p12',
  notifyUrl: 'https://api.example.com/notify',
  isEnabled: true,
  createTime: '2024-01-15 10:30:00'
})

const paymentFields = ref<FieldConfig[]>([
  { prop: 'name', label: '支付名称', group: '基本信息' },
  { prop: 'merchantId', label: '商户号', group: '基本信息' },
  { prop: 'appId', label: 'App ID', group: '基本信息' },
  { prop: 'isEnabled', label: '启用状态', type: 'boolean', group: '基本信息' },
  
  { prop: 'mchKey', label: '商户密钥', type: 'password', group: '密钥信息' },
  { prop: 'certPath', label: '证书路径', group: '密钥信息' },
  
  { prop: 'notifyUrl', label: '回调地址', group: '配置信息' },
  { prop: 'createTime', label: '创建时间', type: 'datetime', group: '配置信息' }
])
</script>
```

## 图片字段显示

支持图片预览功能：

```vue
<template>
  <ADetailDialog
    v-model="visible"
    title="商品详情"
    :data="productData"
    :fields="productFields"
  />
</template>

<script setup>
const productData = ref({
  name: 'iPhone 15 Pro',
  price: 7999,
  mainImage: 'https://example.com/iphone15-pro.jpg',
  thumbnail: 'https://example.com/iphone15-pro-thumb.jpg',
  description: '全新 iPhone 15 Pro，搭载 A17 Pro 芯片'
})

const productFields = ref<FieldConfig[]>([
  { prop: 'name', label: '商品名称' },
  { prop: 'price', label: '价格', type: 'currency' },
  { 
    prop: 'mainImage', 
    label: '主图', 
    type: 'image',
    imageConfig: { width: 100, height: 100 }
  },
  { 
    prop: 'thumbnail', 
    label: '缩略图', 
    type: 'image',
    imageConfig: { width: 60, height: 60 }
  },
  { prop: 'description', label: '商品描述' }
])
</script>
```

## 富文本内容显示

支持 HTML 内容显示和复制功能：

```vue
<template>
  <ADetailDialog
    v-model="visible"
    title="文章详情"
    :data="articleData"
    :fields="articleFields"
  />
</template>

<script setup>
const articleData = ref({
  title: '技术分享：Vue 3 组件设计',
  author: '张三',
  content: '<h2>介绍</h2><p>Vue 3 带来了许多新特性...</p><ul><li>组合式 API</li><li>更好的性能</li></ul>',
  publishTime: '2024-01-15 10:30:00'
})

const articleFields = ref<FieldConfig[]>([
  { prop: 'title', label: '文章标题' },
  { prop: 'author', label: '作者' },
  { prop: 'content', label: '文章内容', type: 'html' },
  { prop: 'publishTime', label: '发布时间', type: 'datetime' }
])
</script>
```

## 自定义插槽

使用插槽添加自定义内容和操作按钮：

```vue
<template>
  <ADetailDialog
    v-model="visible"
    title="订单详情"
    :data="orderData"
    :fields="orderFields"
  >
    <!-- 自定义内容区域 -->
    <template #content>
      <h4>订单商品</h4>
      <el-table :data="orderData.items" border style="margin-top: 16px;">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="单价" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="total" label="小计" />
      </el-table>
    </template>

    <!-- 自定义页脚 -->
    <template #footer="{ close }">
      <el-button @click="close">关闭</el-button>
      <el-button type="warning" @click="handleRefund">申请退款</el-button>
      <el-button type="primary" @click="handleEdit">编辑订单</el-button>
    </template>
  </ADetailDialog>
</template>

<script setup>
const orderData = ref({
  orderNo: 'ORD20240115001',
  customerName: '李四',
  totalAmount: 299.00,
  status: 'paid',
  createTime: '2024-01-15 14:30:00',
  items: [
    { name: '商品A', price: 199.00, quantity: 1, total: 199.00 },
    { name: '商品B', price: 100.00, quantity: 1, total: 100.00 }
  ]
})

const orderFields = ref<FieldConfig[]>([
  { prop: 'orderNo', label: '订单号' },
  { prop: 'customerName', label: '客户姓名' },
  { prop: 'totalAmount', label: '订单金额', type: 'currency' },
  { prop: 'status', label: '订单状态', type: 'dict', dictOptions: orderStatusOptions },
  { prop: 'createTime', label: '下单时间', type: 'datetime' }
])

const handleRefund = () => {
  // 退款逻辑
}

const handleEdit = () => {
  // 编辑逻辑
}
</script>
```

## 自定义字段插槽

对特定字段使用自定义插槽：

```vue
<template>
  <ADetailDialog
    v-model="visible"
    title="用户详情"
    :data="userData"
    :fields="userFields"
  >
    <!-- 自定义头像字段显示 -->
    <template #avatar="{ value }">
      <el-avatar :src="value" :size="60">
        <img src="/default-avatar.png" />
      </el-avatar>
    </template>

    <!-- 自定义权限字段显示 -->
    <template #permissions="{ value }">
      <el-tag 
        v-for="permission in value" 
        :key="permission" 
        style="margin-right: 8px;"
      >
        {{ permission }}
      </el-tag>
    </template>
  </ADetailDialog>
</template>

<script setup>
const userData = ref({
  name: '张三',
  avatar: 'https://example.com/avatar.jpg',
  permissions: ['user:read', 'user:write', 'admin:read']
})

const userFields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名' },
  { prop: 'avatar', label: '头像', slot: 'avatar' },
  { prop: 'permissions', label: '权限', slot: 'permissions' }
])
</script>
```

## 条件显示字段

根据数据动态显示或隐藏字段：

```vue
<script setup>
const userData = ref({
  name: '张三',
  type: 'vip', // 或 'normal'
  vipLevel: 'gold',
  vipExpiry: '2024-12-31'
})

const userFields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名' },
  { prop: 'type', label: '用户类型', type: 'dict', dictOptions: userTypeOptions },
  { 
    prop: 'vipLevel', 
    label: 'VIP等级', 
    type: 'dict', 
    dictOptions: vipLevelOptions,
    hidden: (data) => data.type !== 'vip' // 只有VIP用户才显示
  },
  { 
    prop: 'vipExpiry', 
    label: 'VIP到期时间', 
    type: 'date',
    hidden: (data) => data.type !== 'vip' // 只有VIP用户才显示
  }
])
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model-value / v-model | 弹窗显示状态 | `boolean` | — | — |
| title | 弹窗标题 | `string` | — | `'详情'` |
| data | 要显示的数据对象 | `Record<string, any>` | — | `{}` |
| fields | 字段配置数组 | `FieldConfig[]` | — | — |
| width | 弹窗宽度 | `string \| number` | — | `'800px'` |
| close-text | 关闭按钮文本 | `string` | — | `'关闭'` |
| column | 每行显示的列数 | `number` | — | `1` |
| border | 是否显示边框 | `boolean` | — | `true` |
| size | 组件尺寸 | `string` | `large` / `default` / `small` | `'default'` |
| label-width | 标签宽度 | `string` | — | `'120px'` |
| close-on-click-modal | 点击遮罩关闭弹窗 | `boolean` | — | `true` |

### FieldConfig 接口

```typescript
interface FieldConfig {
  /** 字段属性名，支持嵌套如 'user.profile.name' */
  prop: string
  /** 字段显示标签 */
  label: string
  /** 字段类型 */
  type?: 'text' | 'password' | 'dict' | 'image' | 'html' | 'date' | 'datetime' | 'currency' | 'boolean' | 'array'
  /** 字段分组 */
  group?: string
  /** 字典选项（type 为 'dict' 时使用） */
  dictOptions?: Array<{ label: string; value: any; [key: string]: any }>
  /** 图片配置（type 为 'image' 时使用） */
  imageConfig?: { width?: number; height?: number; [key: string]: any }
  /** 自定义格式化函数 */
  formatter?: (value: any, data: Record<string, any>) => string
  /** 自定义插槽名称 */
  slot?: string
  /** 是否隐藏字段 */
  hidden?: boolean | ((data: Record<string, any>) => boolean)
  /** 字段跨列数 */
  span?: number
}
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 弹窗显示状态变化 | `(value: boolean)` |
| close | 弹窗关闭时触发 | — |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| content | 自定义内容区域 | `{ data, fields }` |
| footer | 自定义页脚区域 | `{ data, close }` |
| [field.slot] | 自定义字段插槽 | `{ data, field, value }` |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| open | 打开弹窗 | — |
| close | 关闭弹窗 | — |

## 字段类型说明

### 基础类型
- **text**：普通文本显示（默认）
- **date**：日期格式化显示
- **datetime**：日期时间格式化显示
- **currency**：货币格式显示
- **boolean**：布尔值显示为"是/否"
- **array**：数组用逗号分隔显示

### 特殊类型
- **password**：密码字段，支持显示/隐藏切换
- **dict**：字典类型，需配合 `dictOptions` 使用
- **image**：图片预览，需配合 `imageConfig` 配置尺寸
- **html**：富文本内容，支持复制功能

## 注意事项

1. **类型提示**：使用 `ref<FieldConfig[]>` 声明字段配置可获得完整的类型提示
2. **分组显示**：当任一字段配置了 `group` 属性时，自动启用分组模式
3. **密码字段**：弹窗关闭时会自动重置所有密码字段为隐藏状态
4. **嵌套属性**：`prop` 支持嵌套属性访问，如 `'user.profile.avatar'`
5. **条件显示**：`hidden` 可以是布尔值或返回布尔值的函数
6. **自定义插槽**：字段级插槽命名为 `field.slot` 的值
7. **图片组件**：需要确保项目中有 `ImagePreview` 组件
8. **字典组件**：需要确保项目中有 `DictTag` 组件

## 实际应用示例

```vue
<template>
  <div>
    <el-button @click="showDetail">查看详情</el-button>
    
    <ADetailDialog
      v-model="detailVisible"
      title="广告详情"
      :data="adData"
      :fields="detailFields"
    >
      <template #footer="{ close }">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </template>
    </ADetailDialog>
  </div>
</template>

<script setup>
// 正确的类型声明方式
const detailFields = ref<FieldConfig[]>([
  { prop: 'id', label: '主键ID' },
  { prop: 'appid', label: 'App ID' },
  { prop: 'adUnitId', label: '广告位ID' },
  { prop: 'adName', label: '广告名称' },
  { prop: 'adType', label: '广告类型' },
  { prop: 'position', label: '投放位置' },
  { prop: 'img', label: '广告图片', type: 'image' },
  { prop: 'description', label: '描述' },
  { prop: 'jumpAppid', label: '跳转App ID' },
  { prop: 'jumpPath', label: '跳转路径' },
  { prop: 'styleConfig', label: '样式配置' },
  { prop: 'sortOrder', label: '排序值' },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: sys_enable_status },
  { prop: 'createTime', label: '创建时间', type: 'datetime' },
  { prop: 'updateTime', label: '更新时间', type: 'datetime' },
  { prop: 'remark', label: '备注' }
])

const detailVisible = ref(false)
const adData = ref({})

const showDetail = () => {
  // 获取数据...
  detailVisible.value = true
}

const handleEdit = () => {
  // 编辑逻辑...
}
</script>
```
