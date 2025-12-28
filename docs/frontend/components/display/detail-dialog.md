# ADetail 通用详情弹窗组件

## 介绍

ADetail 是 Plus-UI 框架中的通用详情展示组件，基于 Element Plus 的 `el-descriptions` 和自定义 `AModal` 组件封装，提供了一套完整的数据详情展示解决方案。该组件支持多种字段类型渲染、分组显示、密码字段保护、图片预览、富文本展示、地区编码解析、打印功能等特性，是后台管理系统中查看详情的核心组件。

**核心特性:**

- **多模式展示** - 支持对话框 (Dialog) 和抽屉 (Drawer) 两种弹出模式
- **丰富字段类型** - 支持文本、密码、字典、图片、HTML、文件、地区等 12 种字段类型
- **智能分组** - 通过 group 属性自动将字段按分组展示，提升信息组织性
- **密码保护** - 敏感字段默认隐藏，支持点击切换显示/隐藏
- **JSON 智能检测** - 自动检测 JSON 字符串并格式化显示，支持一键复制
- **嵌套属性** - 支持 `user.profile.name` 形式的嵌套属性访问
- **条件显示** - 支持根据数据动态显示/隐藏字段
- **打印功能** - 内置打印支持，可直接打印详情内容
- **插槽扩展** - 提供 header、content、footer 及字段级自定义插槽

## 基本用法

### 最简使用

最基础的详情弹窗使用方式，只需传入数据和字段配置：

```vue
<template>
  <el-button @click="visible = true">查看详情</el-button>

  <ADetail
    v-model="visible"
    title="用户详情"
    :data="userData"
    :fields="userFields"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

const userData = ref({
  id: 1001,
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  status: 1,
  createTime: '2024-01-15 10:30:00'
})

const userFields = ref<FieldConfig[]>([
  { prop: 'id', label: '用户ID' },
  { prop: 'name', label: '姓名' },
  { prop: 'email', label: '邮箱' },
  { prop: 'phone', label: '手机号' },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: statusOptions },
  { prop: 'createTime', label: '创建时间', type: 'datetime' }
])

const statusOptions = [
  { label: '启用', value: 1, elTagType: 'success' },
  { label: '禁用', value: 0, elTagType: 'danger' }
]
</script>
```

**使用说明:**

- 使用 `v-model` 控制弹窗的显示和隐藏
- `data` 属性传入要展示的数据对象
- `fields` 属性配置要显示的字段列表
- 默认使用对话框模式，单列显示

### 抽屉模式

通过 `mode="drawer"` 切换为抽屉模式展示：

```vue
<template>
  <ADetail
    v-model="visible"
    title="订单详情"
    :data="orderData"
    :fields="orderFields"
    mode="drawer"
    direction="rtl"
    size="large"
  />
</template>

<script setup lang="ts">
const orderData = ref({
  orderNo: 'ORD20240115001',
  customerName: '李四',
  totalAmount: 299.00,
  status: 'paid',
  createTime: '2024-01-15 14:30:00'
})

const orderFields = ref<FieldConfig[]>([
  { prop: 'orderNo', label: '订单号' },
  { prop: 'customerName', label: '客户姓名' },
  { prop: 'totalAmount', label: '订单金额', type: 'currency' },
  { prop: 'status', label: '订单状态', type: 'dict', dictOptions: orderStatusOptions },
  { prop: 'createTime', label: '下单时间', type: 'datetime' }
])
</script>
```

**抽屉模式特点:**

- `direction` 支持四个方向：`rtl`(右侧)、`ltr`(左侧)、`ttb`(顶部)、`btt`(底部)
- `size` 预设尺寸：`small`、`medium`、`large`、`xl`
- 抽屉模式适合展示大量信息或需要保持页面上下文的场景

### 多列布局

通过 `column` 属性设置每行显示的列数：

```vue
<template>
  <ADetail
    v-model="visible"
    title="产品详情"
    :data="productData"
    :fields="productFields"
    :column="2"
  />
</template>

<script setup lang="ts">
const productData = ref({
  name: 'iPhone 15 Pro',
  category: '电子产品',
  brand: 'Apple',
  price: 7999,
  stock: 100,
  unit: '台',
  weight: '187g',
  createTime: '2024-01-15 10:30:00'
})

const productFields = ref<FieldConfig[]>([
  { prop: 'name', label: '产品名称' },
  { prop: 'category', label: '分类' },
  { prop: 'brand', label: '品牌' },
  { prop: 'price', label: '价格', type: 'currency' },
  { prop: 'stock', label: '库存' },
  { prop: 'unit', label: '单位' },
  { prop: 'weight', label: '重量' },
  { prop: 'createTime', label: '创建时间', type: 'datetime' }
])
</script>
```

**布局说明:**

- `column` 默认值为 1，即单列布局
- 可设置为 2、3、4 等实现多列布局
- 单个字段可通过 `span` 属性跨多列显示

## 字段类型

### 文本类型 (text)

默认类型，直接显示字段值：

```vue
<script setup lang="ts">
const fields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名' },  // 默认 type: 'text'
  { prop: 'name', label: '姓名', type: 'text' }  // 显式指定
])
</script>
```

### 密码类型 (password)

敏感信息显示为星号，支持点击切换显示：

```vue
<template>
  <ADetail
    v-model="visible"
    title="平台配置详情"
    :data="platformData"
    :fields="platformFields"
  />
</template>

<script setup lang="ts">
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

**密码字段特性:**

- 默认显示为 `******`
- 提供"显示/隐藏"切换按钮
- 弹窗关闭时自动重置为隐藏状态
- 打印时自动隐藏切换按钮

### 可复制类型 (copyable)

支持一键复制的文本字段：

```vue
<script setup lang="ts">
const fields = ref<FieldConfig[]>([
  { prop: 'accessKey', label: 'Access Key', type: 'copyable' },
  { prop: 'secretKey', label: 'Secret Key', type: 'copyable' },
  { prop: 'apiEndpoint', label: 'API 地址', type: 'copyable' }
])
</script>
```

**智能 JSON 检测:**

组件会自动检测字段值是否为 JSON 字符串：
- 如果是 JSON，自动格式化显示并提供复制功能
- 格式化后的 JSON 使用缩进便于阅读

### 字典类型 (dict)

配合 `dictOptions` 显示字典标签：

```vue
<script setup lang="ts">
const statusOptions = [
  { label: '待审核', value: 0, elTagType: 'warning' },
  { label: '已通过', value: 1, elTagType: 'success' },
  { label: '已拒绝', value: 2, elTagType: 'danger' }
]

const fields = ref<FieldConfig[]>([
  {
    prop: 'status',
    label: '审核状态',
    type: 'dict',
    dictOptions: statusOptions
  }
])
</script>
```

**字典选项配置:**

| 属性 | 说明 | 类型 |
|------|------|------|
| label | 显示文本 | `string` |
| value | 实际值 | `any` |
| elTagType | Element Tag 类型 | `'success' \| 'warning' \| 'danger' \| 'info'` |
| elTagClass | 自定义类名 | `string` |

### 图片类型 (image)

支持图片预览：

```vue
<template>
  <ADetail
    v-model="visible"
    title="商品详情"
    :data="productData"
    :fields="productFields"
  />
</template>

<script setup lang="ts">
const productData = ref({
  name: 'iPhone 15 Pro',
  mainImage: 'https://example.com/iphone15-pro.jpg',
  thumbnail: 'https://example.com/iphone15-pro-thumb.jpg'
})

const productFields = ref<FieldConfig[]>([
  { prop: 'name', label: '商品名称' },
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
    imageConfig: { width: 60, height: 60, showAll: true }
  }
])
</script>
```

**图片配置选项:**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| width | 图片宽度 | `number \| string` | 60 |
| height | 图片高度 | `number \| string` | 60 |
| showAll | 显示所有图片 | `boolean` | false |
| layout | 布局方式 | `'flex' \| 'grid'` | 'flex' |
| columns | 网格列数 | `number` | 3 |
| maxShow | 最大显示数量 | `number` | 9 |
| gap | 图片间距 | `number` | 4 |

### HTML 类型 (html)

富文本内容显示，支持复制：

```vue
<script setup lang="ts">
const articleData = ref({
  title: '技术分享：Vue 3 组件设计',
  content: '<h2>介绍</h2><p>Vue 3 带来了许多新特性...</p><ul><li>组合式 API</li><li>更好的性能</li></ul>'
})

const articleFields = ref<FieldConfig[]>([
  { prop: 'title', label: '文章标题' },
  { prop: 'content', label: '文章内容', type: 'html' }
])
</script>
```

**HTML 类型特性:**

- 支持渲染 HTML 标签
- 内容区域最大高度 320px，超出滚动
- 右上角提供复制按钮
- 打印时隐藏复制按钮

### 文件类型 (file)

文件下载链接：

```vue
<script setup lang="ts">
const fields = ref<FieldConfig[]>([
  { prop: 'contractFile', label: '合同文件', type: 'file' },
  { prop: 'attachments', label: '附件', type: 'file' }
])
</script>
```

**文件类型说明:**

- 显示为"查看附件"链接
- 点击在新标签页打开文件
- 自动从 URL 提取文件名

### 地区类型 (region)

地区编码自动解析：

```vue
<script setup lang="ts">
const userData = ref({
  name: '张三',
  areaCode: '110101'  // 地区编码
})

const userFields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名' },
  { prop: 'areaCode', label: '所在地区', type: 'region' }
])
// areaCode 会自动显示为 '北京市 / 市辖区 / 东城区'
</script>
```

### 日期时间类型

```vue
<script setup lang="ts">
const fields = ref<FieldConfig[]>([
  { prop: 'birthday', label: '出生日期', type: 'date' },        // 2024/1/15
  { prop: 'createTime', label: '创建时间', type: 'datetime' }   // 2024/1/15 10:30:00
])
</script>
```

### 货币类型 (currency)

```vue
<script setup lang="ts">
const fields = ref<FieldConfig[]>([
  { prop: 'price', label: '单价', type: 'currency' },      // ¥199
  { prop: 'total', label: '总金额', type: 'currency' }     // ¥1,999
])
</script>
```

### 布尔类型 (boolean)

```vue
<script setup lang="ts">
const fields = ref<FieldConfig[]>([
  { prop: 'isEnabled', label: '启用状态', type: 'boolean' },  // 是/否
  { prop: 'isVip', label: 'VIP用户', type: 'boolean' }
])
</script>
```

### 数组类型 (array)

```vue
<script setup lang="ts">
const fields = ref<FieldConfig[]>([
  { prop: 'tags', label: '标签', type: 'array' }  // 显示为逗号分隔
])
// tags: ['前端', 'Vue', 'TypeScript'] → '前端, Vue, TypeScript'
</script>
```

## 分组显示

通过 `group` 属性将字段按分组展示，适合字段较多的详情页面：

```vue
<template>
  <ADetail
    v-model="visible"
    title="支付配置详情"
    :data="paymentData"
    :fields="paymentFields"
    mode="drawer"
    size="large"
  />
</template>

<script setup lang="ts">
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
  // 基本信息分组
  { prop: 'name', label: '支付名称', group: '基本信息' },
  { prop: 'merchantId', label: '商户号', group: '基本信息' },
  { prop: 'appId', label: 'App ID', group: '基本信息' },
  { prop: 'isEnabled', label: '启用状态', type: 'boolean', group: '基本信息' },

  // 密钥信息分组
  { prop: 'mchKey', label: '商户密钥', type: 'password', group: '密钥信息' },
  { prop: 'certPath', label: '证书路径', group: '密钥信息' },

  // 配置信息分组
  { prop: 'notifyUrl', label: '回调地址', group: '配置信息' },
  { prop: 'createTime', label: '创建时间', type: 'datetime', group: '配置信息' }
])
</script>
```

**分组显示特性:**

- 当任一字段配置了 `group` 属性时，自动启用分组模式
- 未设置 `group` 的字段归入"基本信息"分组
- 每个分组显示为独立的卡片，带有分组标题
- 分组按字段配置顺序出现

## 条件显示

使用 `hidden` 属性根据数据动态显示/隐藏字段：

```vue
<script setup lang="ts">
const userData = ref({
  name: '张三',
  type: 'vip',          // 'vip' 或 'normal'
  vipLevel: 'gold',
  vipExpiry: '2024-12-31',
  normalPoints: 100
})

const userFields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名' },
  {
    prop: 'type',
    label: '用户类型',
    type: 'dict',
    dictOptions: userTypeOptions
  },
  // 仅 VIP 用户显示
  {
    prop: 'vipLevel',
    label: 'VIP等级',
    type: 'dict',
    dictOptions: vipLevelOptions,
    hidden: (data) => data.type !== 'vip'
  },
  {
    prop: 'vipExpiry',
    label: 'VIP到期时间',
    type: 'date',
    hidden: (data) => data.type !== 'vip'
  },
  // 仅普通用户显示
  {
    prop: 'normalPoints',
    label: '积分',
    hidden: (data) => data.type === 'vip'
  }
])
</script>
```

**hidden 属性说明:**

- 值为 `true` 时字段隐藏
- 值为 `false` 时字段显示
- 值为函数时，根据函数返回值决定显示/隐藏
- 函数参数为完整的数据对象

## 自定义格式化

使用 `formatter` 函数自定义字段显示格式：

```vue
<script setup lang="ts">
const orderData = ref({
  amount: 1999.99,
  discount: 0.85,
  payType: 1,
  tags: ['urgent', 'vip', 'express']
})

const orderFields = ref<FieldConfig[]>([
  {
    prop: 'amount',
    label: '订单金额',
    formatter: (value) => `¥${value.toFixed(2)}`
  },
  {
    prop: 'discount',
    label: '折扣',
    formatter: (value) => `${(value * 100).toFixed(0)}%`
  },
  {
    prop: 'payType',
    label: '支付方式',
    formatter: (value, data) => {
      const map: Record<number, string> = {
        1: '微信支付',
        2: '支付宝',
        3: '银行卡'
      }
      return map[value] || '未知'
    }
  },
  {
    prop: 'tags',
    label: '标签',
    formatter: (value) => value.map((tag: string) => `#${tag}`).join(' ')
  }
])
</script>
```

**formatter 函数参数:**

- `value`: 当前字段的值
- `data`: 完整的数据对象

## 自定义插槽

### 字段插槽

对特定字段使用自定义渲染：

```vue
<template>
  <ADetail
    v-model="visible"
    title="用户详情"
    :data="userData"
    :fields="userFields"
  >
    <!-- 自定义头像字段 -->
    <template #avatar="{ value }">
      <el-avatar :src="value" :size="60">
        <img src="/default-avatar.png" />
      </el-avatar>
    </template>

    <!-- 自定义权限字段 -->
    <template #permissions="{ value, data }">
      <el-tag
        v-for="permission in value"
        :key="permission"
        style="margin-right: 8px; margin-bottom: 4px;"
        :type="getPermissionType(permission)"
      >
        {{ permission }}
      </el-tag>
    </template>

    <!-- 自定义状态字段 -->
    <template #status="{ value, field }">
      <el-badge :value="value === 1 ? '在线' : '离线'" :type="value === 1 ? 'success' : 'info'" />
    </template>
  </ADetail>
</template>

<script setup lang="ts">
const userData = ref({
  name: '张三',
  avatar: 'https://example.com/avatar.jpg',
  permissions: ['user:read', 'user:write', 'admin:read'],
  status: 1
})

const userFields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名' },
  { prop: 'avatar', label: '头像', slot: 'avatar' },
  { prop: 'permissions', label: '权限', slot: 'permissions' },
  { prop: 'status', label: '状态', slot: 'status' }
])

const getPermissionType = (permission: string) => {
  if (permission.startsWith('admin')) return 'danger'
  if (permission.includes('write')) return 'warning'
  return 'info'
}
</script>
```

**插槽参数:**

| 参数 | 说明 | 类型 |
|------|------|------|
| value | 当前字段的值 | `any` |
| data | 完整数据对象 | `Record<string, any>` |
| field | 字段配置 | `FieldConfig` |

### content 插槽

自定义内容区域，显示在字段列表之后：

```vue
<template>
  <ADetail
    v-model="visible"
    title="订单详情"
    :data="orderData"
    :fields="orderFields"
  >
    <template #content="{ data }">
      <h4 style="margin: 16px 0 8px;">订单商品</h4>
      <el-table :data="data.items" border size="small">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="total" label="小计" width="100">
          <template #default="{ row }">¥{{ row.total }}</template>
        </el-table-column>
      </el-table>
    </template>
  </ADetail>
</template>

<script setup lang="ts">
const orderData = ref({
  orderNo: 'ORD20240115001',
  totalAmount: 299.00,
  items: [
    { name: '商品A', price: 199.00, quantity: 1, total: 199.00 },
    { name: '商品B', price: 100.00, quantity: 1, total: 100.00 }
  ]
})
</script>
```

### footer 插槽

自定义底部按钮区域：

```vue
<template>
  <ADetail
    v-model="visible"
    title="订单详情"
    :data="orderData"
    :fields="orderFields"
  >
    <template #footer="{ data, close }">
      <el-button @click="close">关闭</el-button>
      <el-button type="warning" @click="handleRefund(data)">申请退款</el-button>
      <el-button type="primary" @click="handleEdit(data)">编辑订单</el-button>
    </template>
  </ADetail>
</template>

<script setup lang="ts">
const handleRefund = (data: any) => {
  console.log('申请退款:', data.orderNo)
}

const handleEdit = (data: any) => {
  console.log('编辑订单:', data.orderNo)
}
</script>
```

### header 插槽

自定义标题区域：

```vue
<template>
  <ADetail
    v-model="visible"
    :data="userData"
    :fields="userFields"
  >
    <template #header>
      <div class="custom-header">
        <el-avatar :src="userData.avatar" :size="40" />
        <span class="user-name">{{ userData.name }}</span>
        <el-tag size="small" type="success">VIP</el-tag>
      </div>
    </template>
  </ADetail>
</template>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-name {
  font-size: 18px;
  font-weight: 500;
}
</style>
```

## 嵌套属性

支持访问嵌套对象的属性：

```vue
<script setup lang="ts">
const data = ref({
  user: {
    profile: {
      name: '张三',
      avatar: 'https://example.com/avatar.jpg'
    },
    settings: {
      theme: 'dark',
      language: 'zh-CN'
    }
  },
  order: {
    shipping: {
      address: '北京市朝阳区xxx街道',
      phone: '13800138000'
    }
  }
})

const fields = ref<FieldConfig[]>([
  { prop: 'user.profile.name', label: '用户名' },
  { prop: 'user.profile.avatar', label: '头像', type: 'image' },
  { prop: 'user.settings.theme', label: '主题' },
  { prop: 'user.settings.language', label: '语言' },
  { prop: 'order.shipping.address', label: '收货地址' },
  { prop: 'order.shipping.phone', label: '联系电话' }
])
</script>
```

## 打印功能

启用打印功能并打印详情内容：

```vue
<template>
  <ADetail
    ref="detailRef"
    v-model="visible"
    title="订单详情"
    :data="orderData"
    :fields="orderFields"
    :show-print="true"
    @print="handlePrint"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const detailRef = ref()

// 通过事件监听
const handlePrint = (elementId: string) => {
  console.log('打印完成, 元素ID:', elementId)
}

// 也可以通过 ref 调用
const printDetail = () => {
  detailRef.value?.print()
}
</script>
```

**打印功能特性:**

- 设置 `showPrint: true` 在底部显示打印按钮
- 密码字段的显示/隐藏按钮在打印时自动隐藏
- HTML 内容的复制按钮在打印时自动隐藏
- 可通过 `print` 方法或按钮触发打印

## 与业务集成

### 表格行详情查看

与表格组件配合使用：

```vue
<template>
  <div>
    <!-- 数据表格 -->
    <ATable
      :data="tableData"
      :columns="tableColumns"
    >
      <template #actions="{ row }">
        <el-button link type="primary" @click="showDetail(row)">
          查看详情
        </el-button>
      </template>
    </ATable>

    <!-- 详情弹窗 -->
    <ADetail
      v-model="detailVisible"
      title="用户详情"
      :data="currentRow"
      :fields="detailFields"
      mode="drawer"
      size="large"
    >
      <template #footer="{ close }">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </template>
    </ADetail>
  </div>
</template>

<script setup lang="ts">
const detailVisible = ref(false)
const currentRow = ref({})

const showDetail = (row: any) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleEdit = () => {
  // 跳转到编辑页面或打开编辑弹窗
}

const handleDelete = () => {
  // 删除逻辑
}
</script>
```

### API 数据加载

异步加载详情数据：

```vue
<template>
  <ADetail
    v-model="visible"
    title="订单详情"
    :data="detailData"
    :fields="detailFields"
    :loading="loading"
    @open="loadDetail"
  />
</template>

<script setup lang="ts">
import { getOrderDetail } from '@/api/order'

const visible = ref(false)
const loading = ref(false)
const detailData = ref({})
const orderId = ref<number>()

const loadDetail = async () => {
  if (!orderId.value) return

  loading.value = true
  try {
    const response = await getOrderDetail(orderId.value)
    detailData.value = response.data
  } catch (error) {
    console.error('加载详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开详情
const openDetail = (id: number) => {
  orderId.value = id
  visible.value = true
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model-value / v-model | 弹窗显示状态 | `boolean` | - |
| title | 弹窗标题 | `string` | `'详情'` |
| data | 要显示的数据对象 | `Record<string, any>` | `{}` |
| fields | 字段配置数组 | `FieldConfig[]` | - |
| mode | 弹窗模式 | `'dialog' \| 'drawer'` | `'dialog'` |
| size | 预设尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `'large'` |
| width | 自定义宽度 | `string \| number` | - |
| direction | 抽屉弹出方向 | `'ltr' \| 'rtl' \| 'ttb' \| 'btt'` | `'rtl'` |
| closable | 是否显示关闭按钮 | `boolean` | `true` |
| mask-closable | 点击遮罩关闭 | `boolean` | `true` |
| keyboard | ESC 键关闭 | `boolean` | `true` |
| destroy-on-close | 关闭时销毁内容 | `boolean` | `true` |
| append-to-body | 挂载到 body | `boolean` | `true` |
| before-close | 关闭前回调 | `(done: () => void) => void` | - |
| fullscreen | 是否全屏 | `boolean` | `false` |
| show-footer | 显示底部区域 | `boolean` | `true` |
| footer-type | 底部按钮类型 | `'default' \| 'close-only'` | `'close-only'` |
| footer-align | 底部对齐方式 | `'left' \| 'center' \| 'right'` | `'right'` |
| loading | 内容加载状态 | `boolean` | `false` |
| confirm-text | 确认按钮文本 | `string` | `'确定'` |
| cancel-text | 取消按钮文本 | `string` | `'关闭'` |
| column | 每行列数 | `number` | `1` |
| border | 显示边框 | `boolean` | `true` |
| description-size | 描述列表尺寸 | `'large' \| 'default' \| 'small'` | `'default'` |
| label-width | 标签宽度 | `string` | `'120px'` |
| show-print | 显示打印按钮 | `boolean` | `false` |

### FieldConfig 接口

```typescript
interface FieldConfig {
  /** 字段属性名，支持嵌套如 'user.profile.name' */
  prop: string
  /** 字段显示标签 */
  label: string
  /** 字段占用列数 */
  span?: number
  /** 自定义插槽名称 */
  slot?: string
  /** 自定义格式化函数 */
  formatter?: (value: any, data: any) => string
  /** 数据类型 */
  type?: 'text' | 'copyable' | 'date' | 'datetime' | 'currency'
       | 'boolean' | 'array' | 'dict' | 'image' | 'password'
       | 'html' | 'file' | 'region'
  /** 字典选项 (type 为 dict 时使用) */
  dictOptions?: DictItem[]
  /** 图片配置 (type 为 image 时使用) */
  imageConfig?: {
    width?: number | string
    height?: number | string
    showAll?: boolean
    layout?: 'flex' | 'grid'
    columns?: number
    maxShow?: number
    gap?: number
  }
  /** 字段分组名称 */
  group?: string
  /** 是否隐藏字段 */
  hidden?: boolean | ((data: Record<string, any>) => boolean)
  /** 是否不参与打印 */
  noPrint?: boolean
}
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:model-value | 弹窗状态变化 | `(value: boolean)` |
| open | 弹窗打开时 | - |
| opened | 弹窗打开动画结束 | - |
| close | 弹窗关闭时 | - |
| closed | 弹窗关闭动画结束 | - |
| confirm | 确认按钮点击 | - |
| cancel | 取消按钮点击 | - |
| print | 打印完成 | `(elementId: string)` |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| header | 自定义标题区域 | - |
| content | 自定义内容区域 | `{ data, fields }` |
| footer | 自定义底部区域 | `{ data, close }` |
| [field.slot] | 字段自定义插槽 | `{ data, field, value }` |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开弹窗 | - | `void` |
| close | 关闭弹窗 | - | `void` |
| print | 打印详情 | - | `Promise<void>` |

## 最佳实践

### 1. 字段配置复用

对于多个页面使用相同字段配置的场景，可以提取为公共配置：

```typescript
// config/detail-fields.ts
export const userDetailFields: FieldConfig[] = [
  { prop: 'id', label: '用户ID' },
  { prop: 'username', label: '用户名' },
  { prop: 'email', label: '邮箱' },
  { prop: 'phone', label: '手机号' },
  { prop: 'status', label: '状态', type: 'dict', dictOptions: userStatusOptions },
  { prop: 'createTime', label: '创建时间', type: 'datetime' }
]

// 使用
import { userDetailFields } from '@/config/detail-fields'

const fields = ref<FieldConfig[]>([
  ...userDetailFields,
  // 添加页面特定字段
  { prop: 'remark', label: '备注' }
])
```

### 2. 动态字段配置

根据用户权限或数据状态动态生成字段配置：

```typescript
const getDetailFields = (data: any, hasAdminPermission: boolean): FieldConfig[] => {
  const baseFields: FieldConfig[] = [
    { prop: 'id', label: 'ID' },
    { prop: 'name', label: '名称' }
  ]

  // 管理员可见字段
  if (hasAdminPermission) {
    baseFields.push(
      { prop: 'createdBy', label: '创建者' },
      { prop: 'internalNote', label: '内部备注' }
    )
  }

  // VIP 用户可见字段
  if (data.isVip) {
    baseFields.push(
      { prop: 'vipLevel', label: 'VIP等级' },
      { prop: 'vipExpiry', label: '到期时间', type: 'date' }
    )
  }

  return baseFields
}
```

### 3. 合理使用分组

对于字段较多的详情页面，使用分组提升可读性：

```typescript
// ✅ 好的实践：逻辑分组
const fields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名', group: '基本信息' },
  { prop: 'idCard', label: '身份证', group: '基本信息' },
  { prop: 'company', label: '公司', group: '工作信息' },
  { prop: 'position', label: '职位', group: '工作信息' },
  { prop: 'bankName', label: '开户行', group: '银行信息' },
  { prop: 'bankAccount', label: '银行卡号', group: '银行信息' }
])

// ❌ 不好的实践：字段过少不需要分组
const fields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名', group: '信息' },
  { prop: 'age', label: '年龄', group: '信息' }
])
```

### 4. 敏感信息处理

对敏感信息使用 password 类型或适当脱敏：

```typescript
const fields = ref<FieldConfig[]>([
  { prop: 'username', label: '用户名' },
  { prop: 'password', label: '密码', type: 'password' },
  { prop: 'apiKey', label: 'API密钥', type: 'password' },
  {
    prop: 'phone',
    label: '手机号',
    formatter: (value) => value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },
  {
    prop: 'idCard',
    label: '身份证',
    formatter: (value) => value.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
  }
])
```

## 常见问题

### 1. 字段值显示为 undefined

**问题原因:**
- `prop` 属性名拼写错误
- 数据对象中没有对应的属性
- 嵌套属性路径不正确

**解决方案:**

```typescript
// 确保 prop 与数据属性名一致
const data = ref({
  userName: '张三',  // 注意大小写
  user: {
    profile: {
      name: '张三'
    }
  }
})

const fields = ref<FieldConfig[]>([
  { prop: 'userName', label: '用户名' },              // ✅ 正确
  { prop: 'username', label: '用户名' },              // ❌ 错误：大小写不一致
  { prop: 'user.profile.name', label: '姓名' },       // ✅ 正确的嵌套路径
  { prop: 'user.name', label: '姓名' }                // ❌ 错误：路径不完整
])
```

### 2. 字典类型不显示标签

**问题原因:**
- 未配置 `dictOptions`
- `dictOptions` 中的 value 类型与数据不匹配

**解决方案:**

```typescript
const data = ref({
  status: 1  // 数字类型
})

// 确保 value 类型匹配
const statusOptions = [
  { label: '启用', value: 1 },      // ✅ 数字类型
  { label: '禁用', value: 0 }
]

// 如果数据是字符串类型
const data2 = ref({
  status: '1'  // 字符串类型
})

const statusOptions2 = [
  { label: '启用', value: '1' },    // ✅ 字符串类型
  { label: '禁用', value: '0' }
]
```

### 3. 分组不生效

**问题原因:**
- 所有字段都没有设置 `group` 属性

**解决方案:**

```typescript
// 至少一个字段设置 group 才会启用分组模式
const fields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名', group: '基本信息' },  // 设置 group
  { prop: 'age', label: '年龄' }  // 未设置 group 的归入"基本信息"
])
```

### 4. 自定义插槽不渲染

**问题原因:**
- 插槽名称与 `field.slot` 值不匹配
- 忘记在字段配置中设置 `slot` 属性

**解决方案:**

```vue
<template>
  <ADetail :fields="fields">
    <!-- 插槽名称必须与 slot 属性值一致 -->
    <template #customAvatar="{ value }">
      <el-avatar :src="value" />
    </template>
  </ADetail>
</template>

<script setup lang="ts">
const fields = ref<FieldConfig[]>([
  {
    prop: 'avatar',
    label: '头像',
    slot: 'customAvatar'  // 必须设置 slot 属性
  }
])
</script>
```

### 5. 打印样式异常

**问题原因:**
- 某些样式在打印模式下不兼容
- 动态内容未完全渲染

**解决方案:**

```vue
<style scoped>
/* 打印时隐藏某些元素 */
@media print {
  .no-print {
    display: none !important;
  }

  /* 调整打印样式 */
  .detail-content {
    padding: 0;
  }
}
</style>
```

使用 `noPrint: true` 标记不需要打印的字段：

```typescript
const fields = ref<FieldConfig[]>([
  { prop: 'name', label: '姓名' },
  { prop: 'operationLog', label: '操作记录', noPrint: true }  // 不打印
])
```
