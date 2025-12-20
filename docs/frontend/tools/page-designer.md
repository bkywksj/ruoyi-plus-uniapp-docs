# 页面设计器

页面设计器是一个功能强大的可视化低代码开发工具，通过拖拽组件、配置属性、AI 智能辅助，快速生成 Vue 页面代码。它采用三栏式设计界面，支持 50+ 组件，提供完整的表单、卡片、图表和布局组件，让开发者能够以所见即所得的方式快速构建管理后台页面。

**核心特性：**

- **可视化拖拽** - 三栏式界面设计，支持组件拖拽、嵌套容器、实时预览
- **50+ 组件库** - 涵盖表单、卡片、图表、布局等 9 大类组件
- **AI 智能辅助** - 通过自然语言描述需求，AI 自动生成组件配置
- **多模式代码生成** - 支持页面、弹窗、抽屉三种生成模式
- **历史记录管理** - 支持撤销/重做操作，最多保存 50 条历史记录
- **配置导入导出** - 支持 JSON 格式的配置导入导出，实现设计复用

## 功能特性

### 可视化拖拽设计

页面设计器采用经典的三栏式布局设计：

```
┌──────────────┬────────────────────────────┬──────────────────┐
│              │                            │                  │
│   组件面板    │         设计画布            │     属性面板      │
│   (200px)    │         (自适应)            │     (320px)      │
│              │                            │                  │
│  - 基础组件   │    [拖拽组件到这里]          │   - 基础属性      │
│  - 选择组件   │                            │   - 校验规则      │
│  - 日期组件   │                            │   - 样式配置      │
│  - 卡片组件   │                            │   - 特殊配置      │
│  - 图表组件   │                            │                  │
│  - 布局组件   │                            │                  │
│              │                            │                  │
└──────────────┴────────────────────────────┴──────────────────┘
```

**交互方式：**

- **拖拽添加** - 从左侧组件面板拖拽组件到设计画布
- **点击添加** - 点击组件面板中的组件图标直接添加
- **画布排序** - 在画布内拖拽组件调整顺序
- **嵌套容器** - 将组件拖入行容器/列容器实现嵌套布局
- **选中编辑** - 点击画布中的组件进行选中，右侧显示属性面板

**快捷键支持：**

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销上一步操作 |
| `Ctrl+Y` | 重做操作 |
| `Ctrl+Shift+Z` | 重做操作（备选） |
| `Delete` | 删除选中组件 |
| `Escape` | 取消选中 |

### 嵌套容器

页面设计器支持通过行容器（Row）和列容器（Col）实现复杂的页面布局：

```vue
<template>
  <!-- 使用行容器实现两列布局 -->
  <el-row :gutter="20">
    <el-col :span="12">
      <el-input v-model="form.username" placeholder="请输入用户名" />
    </el-col>
    <el-col :span="12">
      <el-input v-model="form.email" placeholder="请输入邮箱" />
    </el-col>
  </el-row>
</template>
```

**嵌套规则：**

- 行容器可以包含任意组件
- 列容器只能放在行容器内部
- 支持多层嵌套，但建议不超过 3 层
- 列容器的 `span` 值范围为 1-24

### 历史记录管理

页面设计器内置完善的历史记录管理功能：

```typescript
// 历史记录配置
const MAX_HISTORY = 50 // 最大历史记录数

interface HistoryRecord {
  schema: FormSchema    // 当前状态快照
  description: string   // 操作描述
  timestamp: number     // 时间戳
}
```

**功能特性：**

- **自动保存** - 每次操作自动保存到 SessionStorage
- **撤销/重做** - 支持最多 50 步撤销和重做
- **操作描述** - 每条历史记录都有操作描述
- **会话恢复** - 页面刷新后自动恢复上次设计状态

## 组件库

页面设计器提供 50+ 组件，分为 9 大类别：

### 基础组件

用于基础数据输入的表单组件。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `input` | 单行输入 | `Edit` | 文本输入框，支持前缀/后缀图标、清空按钮 |
| `textarea` | 多行输入 | `Document` | 文本域，支持自动高度、字数限制 |
| `number` | 数字输入 | `Coin` | 数字输入框，支持步进器、范围限制 |
| `password` | 密码输入 | `Lock` | 密码输入框，支持显示/隐藏切换 |

**单行输入组件属性：**

```typescript
interface InputProps {
  prop: string           // 字段名
  label: string          // 标签文本
  placeholder: string    // 占位符
  defaultValue: string   // 默认值
  prefixIcon: string     // 前缀图标
  suffixIcon: string     // 后缀图标
  clearable: boolean     // 是否可清空
  disabled: boolean      // 是否禁用
  readonly: boolean      // 是否只读
  maxlength: number      // 最大长度
  showWordLimit: boolean // 是否显示字数限制
  span: number           // 栅格占用 (1-24)
  required: boolean      // 是否必填
}
```

### 选择组件

用于选择类数据输入的表单组件。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `select` | 下拉选择 | `ArrowDown` | 下拉选择框，支持单选/多选、远程搜索 |
| `radio` | 单选框组 | `CircleCheck` | 单选按钮组，支持按钮样式 |
| `checkbox` | 多选框组 | `Check` | 复选框组，支持全选/反选 |
| `switch` | 开关 | `Open` | 开关切换，支持自定义文字 |
| `slider` | 滑块 | `Histogram` | 滑块选择，支持范围选择 |
| `rate` | 评分 | `Star` | 评分组件，支持半星、自定义图标 |
| `color` | 颜色选择 | `Brush` | 颜色选择器，支持预设颜色 |
| `transfer` | 穿梭框 | `Sort` | 穿梭框选择，支持搜索过滤 |
| `cascader` | 级联选择 | `Share` | 级联选择器，支持多级数据 |
| `tree-select` | 树形选择 | `SetUp` | 树形选择器，支持树形数据 |
| `icon-select` | 图标选择 | `PictureRounded` | 图标选择器，支持 Iconify 图标 |

**下拉选择组件属性：**

```typescript
interface SelectProps {
  prop: string                    // 字段名
  label: string                   // 标签文本
  placeholder: string             // 占位符
  multiple: boolean               // 是否多选
  clearable: boolean              // 是否可清空
  filterable: boolean             // 是否可搜索
  remote: boolean                 // 是否远程搜索
  collapseTags: boolean           // 多选时是否折叠标签
  collapseTagsTooltip: boolean    // 折叠标签是否显示 tooltip
  options: Array<{                // 选项数据
    label: string
    value: string | number
  }>
}
```

### 日期组件

用于日期时间选择的表单组件。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `date` | 日期选择 | `Calendar` | 日期选择器 |
| `datetime` | 日期时间 | `Timer` | 日期时间选择器 |
| `daterange` | 日期范围 | `DateRange` | 日期范围选择器 |
| `datetimerange` | 日期时间范围 | `Clock` | 日期时间范围选择器 |
| `time` | 时间选择 | `AlarmClock` | 时间选择器 |
| `timerange` | 时间范围 | `Watch` | 时间范围选择器 |
| `week` | 周选择 | `DataLine` | 周选择器 |
| `month` | 月选择 | `Memo` | 月份选择器 |
| `year` | 年选择 | `Files` | 年份选择器 |

**日期选择组件属性：**

```typescript
interface DateProps {
  prop: string           // 字段名
  label: string          // 标签文本
  placeholder: string    // 占位符
  format: string         // 显示格式，如 'YYYY-MM-DD'
  valueFormat: string    // 值格式，如 'YYYY-MM-DD'
  clearable: boolean     // 是否可清空
  readonly: boolean      // 是否只读
  disabled: boolean      // 是否禁用
  editable: boolean      // 是否可编辑
  startPlaceholder: string  // 范围选择开始占位符
  endPlaceholder: string    // 范围选择结束占位符
  rangeSeparator: string    // 范围分隔符
}
```

### 上传组件

用于文件上传的表单组件。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `upload` | 文件上传 | `Upload` | 通用文件上传 |
| `image-upload` | 图片上传 | `Picture` | 图片上传，支持预览 |

**上传组件属性：**

```typescript
interface UploadProps {
  prop: string           // 字段名
  label: string          // 标签文本
  action: string         // 上传地址
  accept: string         // 接受的文件类型
  limit: number          // 最大上传数量
  fileSize: number       // 文件大小限制 (MB)
  listType: 'text' | 'picture' | 'picture-card'  // 列表类型
  multiple: boolean      // 是否支持多选
  drag: boolean          // 是否支持拖拽上传
  showFileList: boolean  // 是否显示文件列表
  autoUpload: boolean    // 是否自动上传
  tip: string            // 提示文字
}
```

### 高级组件

用于复杂数据输入的高级表单组件。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `editor` | 富文本编辑器 | `Reading` | 基于 WangEditor 的富文本编辑器 |

**富文本编辑器属性：**

```typescript
interface EditorProps {
  prop: string           // 字段名
  label: string          // 标签文本
  placeholder: string    // 占位符
  height: number         // 编辑器高度
  readonly: boolean      // 是否只读
  toolbarConfig: object  // 工具栏配置
  editorConfig: object   // 编辑器配置
}
```

### 卡片组件

用于数据展示的卡片组件，不属于表单组件。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `stat-card` | 统计卡片 | `DataAnalysis` | 数据统计展示卡片 |
| `data-card` | 数据卡片 | `Grid` | 多行数据列表卡片 |
| `line-stat-card` | 折线统计卡片 | `TrendCharts` | 带迷你折线图的统计卡片 |
| `ring-stat-card` | 环形统计卡片 | `PieChart` | 带环形进度图的统计卡片 |
| `info-card` | 信息卡片 | `InfoFilled` | 提示信息展示卡片 |
| `empty-card` | 空状态卡片 | `FolderDelete` | 空数据状态卡片 |
| `table-card` | 表格卡片 | `List` | 表格数据展示卡片 |
| `list-card` | 数据列表卡片 | `Tickets` | 列表数据展示卡片 |
| `weather-card` | 天气卡片 | `Sunny` | 天气信息展示卡片 |
| `notice-card` | 通知卡片 | `Bell` | 通知消息列表卡片 |

**统计卡片属性：**

```typescript
interface StatCardProps {
  title: string          // 卡片标题
  value: number | string // 统计数值
  icon: string           // 图标名称
  iconColor: string      // 图标颜色
  trend: 'up' | 'down' | 'none'  // 趋势方向
  trendValue: string     // 趋势值，如 '+12%'
  trendText: string      // 趋势说明文字
  suffix: string         // 数值后缀
  prefix: string         // 数值前缀
  decimal: number        // 小数位数
  animation: boolean     // 是否启用数字动画
  duration: number       // 动画持续时间 (ms)
}
```

**数据卡片属性：**

```typescript
interface DataCardProps {
  title: string          // 卡片标题
  items: Array<{         // 数据项列表
    label: string        // 标签
    value: string | number  // 数值
    unit: string         // 单位
    percentage: number   // 百分比 (0-100)
    color: string        // 进度条颜色
  }>
  showProgress: boolean  // 是否显示进度条
}
```

### 图表组件

基于 ECharts 的图表组件，用于数据可视化。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `line-chart` | 折线图 | `TrendCharts` | 趋势展示，支持多系列、平滑曲线 |
| `bar-chart` | 柱状图 | `Histogram` | 对比展示，支持堆叠、分组 |
| `pie-chart` | 饼图 | `PieChart` | 占比展示，支持标签、图例 |
| `ring-chart` | 环形图 | `Odometer` | 占比展示，支持中心文字 |
| `radar-chart` | 雷达图 | `Aim` | 多维对比，支持多系列 |
| `funnel-chart` | 漏斗图 | `Filter` | 转化展示，支持排序、标签 |

**折线图组件属性：**

```typescript
interface LineChartProps {
  title: string          // 图表标题
  height: number         // 图表高度
  smooth: boolean        // 是否平滑曲线
  showSymbol: boolean    // 是否显示数据点
  showArea: boolean      // 是否显示区域填充
  xAxisData: string[]    // X 轴数据
  series: Array<{        // 系列数据
    name: string         // 系列名称
    data: number[]       // 数据数组
    color: string        // 线条颜色
  }>
  legend: boolean        // 是否显示图例
  tooltip: boolean       // 是否显示提示框
}
```

### 布局组件

用于页面布局的容器组件。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `row` | 行容器 | `Grid` | 水平布局容器，基于 Element Plus 的 Row |
| `col` | 列容器 | `Grid` | 栅格列，只能放在行容器内 |
| `divider` | 分割线 | `Minus` | 内容分隔线，支持文字位置配置 |

**行容器属性：**

```typescript
interface RowProps {
  gutter: number           // 栅格间距
  justify: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
  align: 'top' | 'middle' | 'bottom'
  tag: string              // 自定义元素标签
  children: FormItemSchema[]  // 子组件列表
}
```

**列容器属性：**

```typescript
interface ColProps {
  span: number             // 栅格占用列数 (1-24)
  offset: number           // 左侧偏移列数
  push: number             // 向右移动的列数
  pull: number             // 向左移动的列数
  xs: number | object      // <768px 响应式配置
  sm: number | object      // ≥768px 响应式配置
  md: number | object      // ≥992px 响应式配置
  lg: number | object      // ≥1200px 响应式配置
  xl: number | object      // ≥1920px 响应式配置
  children: FormItemSchema[]  // 子组件列表
}
```

### 展示组件

用于信息展示的组件，不属于表单组件。

| 组件类型 | 组件名称 | 图标 | 说明 |
|----------|----------|------|------|
| `text` | 文本 | `Document` | 静态文本展示 |
| `link` | 链接 | `Link` | 超链接组件 |
| `tag` | 标签 | `CollectionTag` | 标签组件 |
| `badge` | 徽章 | `Notification` | 徽章组件 |
| `avatar` | 头像 | `Avatar` | 头像组件 |
| `image` | 图片 | `Picture` | 图片展示组件 |
| `progress` | 进度条 | `Loading` | 进度条组件 |
| `result` | 结果 | `CircleCheckFilled` | 结果状态组件 |
| `alert` | 警告 | `Warning` | 警告提示组件 |
| `descriptions` | 描述列表 | `List` | 描述列表组件 |
| `timeline` | 时间线 | `Clock` | 时间线组件 |
| `steps` | 步骤条 | `Guide` | 步骤条组件 |
| `statistic` | 统计数值 | `DataLine` | 统计数值组件 |

## AI 智能辅助

页面设计器集成了 AI 智能辅助功能，通过自然语言描述需求，AI 自动生成组件配置。

### AI 生成组件

点击工具栏的「AI 生成」按钮，打开 AI 生成弹窗：

```vue
<template>
  <div class="ai-generate">
    <!-- 输入框 -->
    <el-input
      v-model="prompt"
      type="textarea"
      :rows="4"
      placeholder="请描述你想要生成的表单组件..."
    />

    <!-- 快捷示例 -->
    <div class="quick-examples">
      <el-tag
        v-for="example in examples"
        :key="example.label"
        @click="useExample(example)"
      >
        {{ example.label }}
      </el-tag>
    </div>

    <!-- 生成按钮 -->
    <el-button type="primary" @click="generate">
      生成组件
    </el-button>
  </div>
</template>
```

**使用示例：**

```
示例1：帮我生成一个用户注册表单，包含用户名、密码、确认密码、手机号、邮箱、性别选择

示例2：生成一个商品信息录入表单，需要商品名称、商品分类(下拉选择)、价格(数字输入)、库存数量、商品描述(多行文本)、商品图片(图片上传)

示例3：我需要一个订单查询表单，包含订单号、下单时间范围、订单状态(下拉选择)、支付方式、金额范围
```

**快捷示例：**

AI 生成弹窗内置 6 个常用场景示例：

| 示例 | 描述 |
|------|------|
| 用户注册表单 | 用户名、密码、手机号、邮箱等 |
| 商品发布表单 | 商品名称、价格、库存、描述、图片等 |
| 订单查询表单 | 订单号、时间范围、状态、金额等 |
| 员工信息录入 | 姓名、工号、部门、职位、入职日期等 |
| 活动报名表单 | 姓名、联系方式、人数、备注等 |
| 问卷调查表单 | 单选、多选、评分、文本等 |

**生成模式：**

- **追加模式** - 将生成的组件追加到现有组件后面
- **替换模式** - 用生成的组件替换现有所有组件

### AI 优化组件

选中已有组件后，点击「AI 优化」按钮，可以让 AI 对现有组件进行优化：

**优化内容：**

- **字段命名** - 将字段名规范化为小驼峰格式
- **占位文本** - 生成更友好的占位提示文本
- **校验规则** - 根据字段类型自动添加校验规则
- **标签文案** - 优化标签文本表述

**使用示例：**

```typescript
// 优化前
{
  type: 'input',
  prop: 'name',
  label: '名字',
  placeholder: '',
  rules: []
}

// AI 优化后
{
  type: 'input',
  prop: 'userName',
  label: '用户名',
  placeholder: '请输入用户名',
  rules: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}
```

### AI 系统提示词

AI 生成功能使用了精心设计的系统提示词，确保生成结果的准确性：

```typescript
const systemPrompt = `你是一个表单设计助手，请根据用户的描述生成表单组件配置。

可用的组件类型：
- input: 单行输入
- textarea: 多行输入
- number: 数字输入
- password: 密码输入
- select: 下拉选择
- radio: 单选框组
- checkbox: 多选框组
- switch: 开关
- date: 日期选择
- datetime: 日期时间选择
- daterange: 日期范围选择
- time: 时间选择
- upload: 文件上传
- image-upload: 图片上传
- editor: 富文本编辑器
...

请按照以下 JSON 格式返回组件配置：
{
  "items": [
    {
      "type": "组件类型",
      "prop": "字段名(小驼峰)",
      "label": "标签文本",
      "placeholder": "占位符",
      "required": true/false,
      ...
    }
  ]
}

注意事项：
1. 字段名必须使用小驼峰命名
2. 根据字段类型选择合适的组件
3. 必填字段设置 required: true
4. 选择类组件需要提供 options 配置
...`
```

## 代码生成

页面设计器支持将设计好的组件配置生成为可直接使用的 Vue 代码。

### 生成模式

支持三种代码生成模式：

#### 页面模式

生成独立的页面组件（.vue 文件）：

```vue
<template>
  <div class="page-container">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="formData.userName" placeholder="请输入用户名" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入手机号" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 更多表单项... -->
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 表单实例
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  userName: '',
  phone: '',
  // ...
})

// 校验规则
const formRules = reactive<FormRules>({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  // ...
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  // 提交逻辑...
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}
</style>
```

#### 弹窗模式

生成 AModal 弹窗组件，支持配置弹窗尺寸和标题：

```vue
<template>
  <AModal v-model="visible" :title="title" :size="size">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <!-- 表单内容 -->
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </AModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
  title?: string
  data?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  title: '表单弹窗',
  data: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单逻辑...
</script>
```

**弹窗尺寸配置：**

| 尺寸 | 宽度 |
|------|------|
| `small` | 400px |
| `medium` | 600px |
| `large` | 800px |
| `xl` | 1000px |

#### 抽屉模式

生成抽屉组件，支持配置抽屉方向和尺寸：

```vue
<template>
  <el-drawer
    v-model="visible"
    :title="title"
    :direction="direction"
    :size="drawerSize"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <!-- 表单内容 -->
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>
```

**抽屉方向配置：**

| 方向 | 说明 |
|------|------|
| `rtl` | 从右侧弹出（默认） |
| `ltr` | 从左侧弹出 |
| `ttb` | 从上方弹出 |
| `btt` | 从下方弹出 |

### 代码输出

代码弹窗提供多种代码查看和导出方式：

#### 完整代码

生成完整的 Vue 单文件组件（.vue），包含：

- `<template>` - 模板代码
- `<script setup lang="ts">` - 脚本代码
- `<style scoped lang="scss">` - 样式代码

#### 分离查看

支持分别查看和复制：

| 标签页 | 内容 |
|--------|------|
| 完整代码 | Vue 单文件组件完整代码 |
| 模板 | 纯 HTML 模板代码 |
| 脚本 | TypeScript 脚本代码 |
| 类型定义 | TypeScript 接口定义 |
| JSON 配置 | 组件配置 JSON 数据 |

#### 类型定义生成

自动生成 TypeScript 接口定义：

```typescript
/** 表单数据类型 */
export interface FormData {
  /** 用户名 */
  userName: string
  /** 手机号 */
  phone: string
  /** 邮箱 */
  email: string
  /** 性别 */
  gender: string
  /** 出生日期 */
  birthday: string
  /** 头像 */
  avatar: string[]
  /** 简介 */
  introduction: string
}

/** 表单默认值 */
export const defaultFormData: FormData = {
  userName: '',
  phone: '',
  email: '',
  gender: '',
  birthday: '',
  avatar: [],
  introduction: ''
}
```

#### JSON 配置导入导出

支持导入导出 JSON 配置，实现设计复用：

```json
{
  "name": "用户信息表单",
  "labelWidth": "100px",
  "layout": "page",
  "items": [
    {
      "id": "item_1",
      "type": "input",
      "prop": "userName",
      "label": "用户名",
      "placeholder": "请输入用户名",
      "required": true,
      "span": 12
    },
    {
      "id": "item_2",
      "type": "select",
      "prop": "gender",
      "label": "性别",
      "placeholder": "请选择性别",
      "options": [
        { "label": "男", "value": "male" },
        { "label": "女", "value": "female" }
      ],
      "span": 12
    }
  ]
}
```

**导入方式：**

1. 点击「导入JSON」按钮
2. 选择 JSON 配置文件
3. 确认导入（会覆盖当前设计）

**导出方式：**

1. 点击「复制配置」按钮复制到剪贴板
2. 或点击「下载JSON」按钮下载配置文件

## 状态管理

页面设计器使用 `useFormSchema` Composable 进行状态管理。

### 核心状态

```typescript
interface FormSchema {
  name: string                    // 表单名称
  labelWidth: string              // 标签宽度
  layout: 'page' | 'dialog' | 'drawer'  // 布局模式
  dialogSize: 'small' | 'medium' | 'large' | 'xl'  // 弹窗尺寸
  drawerDirection: 'rtl' | 'ltr' | 'ttb' | 'btt'   // 抽屉方向
  items: FormItemSchema[]         // 组件列表
}

interface FormItemSchema {
  id: string                      // 唯一标识
  type: FormItemType              // 组件类型
  prop: string                    // 字段名
  label: string                   // 标签
  placeholder: string             // 占位符
  required: boolean               // 是否必填
  span: number                    // 栅格占用
  [key: string]: any              // 其他属性
}
```

### 状态操作

```typescript
const {
  // 状态
  schema,              // 表单配置
  selectedId,          // 选中组件 ID
  selectedItem,        // 选中组件对象
  canUndo,             // 是否可撤销
  canRedo,             // 是否可重做
  hasItems,            // 是否有组件
  draggingItemType,    // 正在拖拽的组件类型

  // 拖拽状态
  setDraggingItemType, // 设置拖拽类型
  clearDraggingItemType, // 清除拖拽类型

  // 组件操作
  addItem,             // 添加组件
  addItemToContainer,  // 添加到容器
  batchAddItems,       // 批量添加
  batchUpdateItems,    // 批量更新
  removeItem,          // 删除组件
  copyItem,            // 复制组件
  moveItem,            // 移动组件
  selectItem,          // 选中组件
  clearItems,          // 清空组件

  // 历史操作
  undo,                // 撤销
  redo,                // 重做
  saveHistory,         // 保存历史

  // 导入导出
  importSchema         // 导入配置
} = useFormSchema()
```

### 自动保存

页面设计器会自动将当前设计状态保存到 SessionStorage：

```typescript
const STORAGE_KEY = 'page-designer-schema'

// 保存到 SessionStorage
const saveToStorage = () => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(schema.value))
}

// 从 SessionStorage 恢复
const loadFromStorage = () => {
  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved) {
    schema.value = JSON.parse(saved)
  }
}
```

**自动保存时机：**

- 添加组件
- 删除组件
- 移动组件
- 更新属性
- 导入配置

## 技术架构

页面设计器采用四层架构设计：

```
┌─────────────────────────────────────────┐
│              UI 层 (Components)          │
│  ComponentPanel / DesignCanvas /         │
│  PropertyPanel / PreviewDialog /         │
│  CodeDialog / AiGenerateDialog           │
├─────────────────────────────────────────┤
│            逻辑层 (Composables)           │
│  useFormSchema / useCodeGenerator /      │
│  useDragDrop / useHistory                │
├─────────────────────────────────────────┤
│            配置层 (Config)               │
│  componentConfig - 组件定义和属性配置     │
├─────────────────────────────────────────┤
│            渲染层 (Renderer)             │
│  FormItemRenderer - 组件渲染器           │
└─────────────────────────────────────────┘
```

### 目录结构

```
pageDesigner/
├── pageDesigner.vue              # 主页面组件
├── components/
│   ├── ComponentPanel.vue        # 左侧组件面板
│   ├── DesignCanvas.vue          # 中间设计画布
│   ├── PropertyPanel.vue         # 右侧属性面板
│   ├── FormItemRenderer.vue      # 组件渲染器
│   ├── PreviewDialog.vue         # 预览弹窗
│   ├── CodeDialog.vue            # 代码弹窗
│   ├── AiGenerateDialog.vue      # AI生成弹窗
│   └── AiOptimizeDialog.vue      # AI优化弹窗
├── composables/
│   ├── useFormSchema.ts          # Schema状态管理
│   └── useCodeGenerator.ts       # 代码生成逻辑
├── config/
│   └── componentConfig.ts        # 组件配置定义
└── types/
    └── index.ts                  # 类型定义
```

### 组件配置系统

组件配置定义在 `componentConfig.ts` 中：

```typescript
export interface ComponentConfig {
  type: FormItemType              // 组件类型
  name: string                    // 组件名称
  icon: string                    // 图标名称
  category: ComponentCategory     // 组件分类
  isContainer?: boolean           // 是否为容器组件
  isFormComponent?: boolean       // 是否为表单组件
  defaultProps: Record<string, any>  // 默认属性
  propertyConfig: PropertyConfig[]   // 属性配置
}

export interface PropertyConfig {
  key: string                     // 属性键名
  label: string                   // 属性标签
  type: 'input' | 'number' | 'select' | 'switch' | 'textarea' | 'options' | 'icon'
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
  placeholder?: string
  defaultValue?: any
}
```

### 代码生成器

代码生成器 `useCodeGenerator` 提供以下方法：

```typescript
const {
  // 生成模板代码
  generateTemplate,

  // 生成脚本代码
  generateScript,

  // 生成样式代码
  generateStyle,

  // 生成类型定义
  generateTypes,

  // 生成完整代码
  generateFullCode,

  // 生成 JSON 配置
  generateJsonConfig
} = useCodeGenerator()
```

**生成逻辑：**

1. **模板生成** - 根据组件配置生成 Vue 模板代码
2. **脚本生成** - 生成 script setup 代码，包含响应式数据和方法
3. **类型生成** - 根据字段配置生成 TypeScript 接口
4. **样式生成** - 生成基础的 SCSS 样式代码

## 使用场景

### 快速搭建管理后台页面

1. 使用布局组件创建页面结构
2. 拖入表单组件配置查询条件
3. 拖入表格卡片展示数据列表
4. 生成页面代码，集成到项目

### 表单页面快速开发

1. 使用 AI 生成或手动拖拽表单组件
2. 配置字段名、校验规则
3. 选择弹窗/抽屉模式生成代码
4. 复制代码到项目中使用

### 数据展示页面设计

1. 拖入统计卡片展示关键指标
2. 拖入图表组件进行数据可视化
3. 使用布局组件进行排版
4. 生成页面代码

### 原型设计和需求确认

1. 快速搭建页面原型
2. 实时预览效果
3. 与产品/设计确认后生成代码
4. 导出 JSON 配置供后续使用

## 类型定义

### 组件类型

```typescript
/** 表单组件类型 */
export type FormComponentType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'password'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'slider'
  | 'rate'
  | 'color'
  | 'transfer'
  | 'cascader'
  | 'tree-select'
  | 'icon-select'
  | 'date'
  | 'datetime'
  | 'daterange'
  | 'datetimerange'
  | 'time'
  | 'timerange'
  | 'week'
  | 'month'
  | 'year'
  | 'upload'
  | 'image-upload'
  | 'editor'

/** 卡片组件类型 */
export type CardComponentType =
  | 'stat-card'
  | 'data-card'
  | 'line-stat-card'
  | 'ring-stat-card'
  | 'info-card'
  | 'empty-card'
  | 'table-card'
  | 'list-card'
  | 'weather-card'
  | 'notice-card'

/** 图表组件类型 */
export type ChartComponentType =
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'ring-chart'
  | 'radar-chart'
  | 'funnel-chart'

/** 布局组件类型 */
export type LayoutComponentType = 'row' | 'col' | 'divider'

/** 展示组件类型 */
export type DisplayComponentType =
  | 'text'
  | 'link'
  | 'tag'
  | 'badge'
  | 'avatar'
  | 'image'
  | 'progress'
  | 'result'
  | 'alert'
  | 'descriptions'
  | 'timeline'
  | 'steps'
  | 'statistic'

/** 所有组件类型 */
export type FormItemType =
  | FormComponentType
  | CardComponentType
  | ChartComponentType
  | LayoutComponentType
  | DisplayComponentType
```

### 组件分类

```typescript
/** 组件分类 */
export type ComponentCategory =
  | 'basic'      // 基础组件
  | 'select'     // 选择组件
  | 'date'       // 日期组件
  | 'upload'     // 上传组件
  | 'advanced'   // 高级组件
  | 'card'       // 卡片组件
  | 'chart'      // 图表组件
  | 'layout'     // 布局组件
  | 'display'    // 展示组件
```

### 表单配置

```typescript
/** 表单项配置 */
export interface FormItemSchema {
  id: string                      // 唯一标识
  type: FormItemType              // 组件类型
  prop: string                    // 字段名
  label: string                   // 标签
  placeholder?: string            // 占位符
  defaultValue?: any              // 默认值
  required?: boolean              // 是否必填
  disabled?: boolean              // 是否禁用
  readonly?: boolean              // 是否只读
  span?: number                   // 栅格占用 (1-24)
  rules?: FormItemRule[]          // 校验规则
  options?: SelectOption[]        // 选项数据（选择类组件）
  children?: FormItemSchema[]     // 子组件（容器组件）
  [key: string]: any              // 其他属性
}

/** 表单配置 */
export interface FormSchema {
  name: string                    // 表单名称
  labelWidth: string              // 标签宽度
  layout: 'page' | 'dialog' | 'drawer'  // 布局模式
  dialogSize?: 'small' | 'medium' | 'large' | 'xl'
  drawerDirection?: 'rtl' | 'ltr' | 'ttb' | 'btt'
  items: FormItemSchema[]         // 组件列表
}

/** 校验规则 */
export interface FormItemRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  pattern?: string
  validator?: string
}

/** 选项数据 */
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  children?: SelectOption[]
}
```

### 辅助函数

```typescript
/** 判断是否为表单组件 */
export function isFormComponent(type: FormItemType): boolean {
  const formTypes: FormItemType[] = [
    'input', 'textarea', 'number', 'password',
    'select', 'radio', 'checkbox', 'switch',
    'slider', 'rate', 'color', 'transfer',
    'cascader', 'tree-select', 'icon-select',
    'date', 'datetime', 'daterange', 'datetimerange',
    'time', 'timerange', 'week', 'month', 'year',
    'upload', 'image-upload', 'editor'
  ]
  return formTypes.includes(type)
}

/** 判断是否包含表单组件 */
export function hasFormComponents(items: FormItemSchema[]): boolean {
  return items.some(item => {
    if (isFormComponent(item.type)) return true
    if (item.children) return hasFormComponents(item.children)
    return false
  })
}

/** 获取组件栅格占用 */
export function getItemSpan(item: FormItemSchema): number {
  return item.span || 24
}
```

## 最佳实践

### 1. 组件命名规范

遵循统一的命名规范，确保生成的代码整洁易读：

```typescript
// ✅ 推荐
{
  prop: 'userName',        // 小驼峰命名
  label: '用户名',          // 中文标签
  placeholder: '请输入用户名'  // 友好提示
}

// ❌ 不推荐
{
  prop: 'user_name',       // 下划线命名
  label: 'username',       // 英文标签
  placeholder: 'username'  // 不友好
}
```

### 2. 布局设计

使用行容器和列容器实现响应式布局：

```vue
<template>
  <!-- 两列布局 -->
  <el-row :gutter="20">
    <el-col :span="12">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="formData.userName" />
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" />
      </el-form-item>
    </el-col>
  </el-row>

  <!-- 三列布局 -->
  <el-row :gutter="20">
    <el-col :span="8">
      <!-- 组件1 -->
    </el-col>
    <el-col :span="8">
      <!-- 组件2 -->
    </el-col>
    <el-col :span="8">
      <!-- 组件3 -->
    </el-col>
  </el-row>
</template>
```

**布局建议：**

- 查询表单使用 3-4 列紧凑布局
- 录入表单使用 1-2 列宽松布局
- 详情展示使用描述列表组件
- 复杂表单使用分组或步骤条

### 3. 校验规则配置

根据字段类型配置合适的校验规则：

```typescript
// 必填校验
{
  required: true,
  message: '请输入用户名',
  trigger: 'blur'
}

// 长度校验
{
  min: 2,
  max: 20,
  message: '长度在 2 到 20 个字符',
  trigger: 'blur'
}

// 手机号格式
{
  pattern: /^1[3-9]\d{9}$/,
  message: '请输入正确的手机号',
  trigger: 'blur'
}

// 邮箱格式
{
  type: 'email',
  message: '请输入正确的邮箱地址',
  trigger: 'blur'
}

// 数字范围
{
  type: 'number',
  min: 0,
  max: 100,
  message: '请输入 0-100 之间的数字',
  trigger: 'blur'
}
```

### 4. AI 使用技巧

提高 AI 生成质量的技巧：

```
✅ 推荐写法：
"帮我生成一个员工信息录入表单，包含：
- 姓名（必填，2-10个字符）
- 工号（必填，字母数字组合）
- 部门（下拉选择：技术部/产品部/设计部/运营部）
- 职位（必填）
- 入职日期（日期选择）
- 手机号（11位手机号格式）
- 邮箱
- 头像（图片上传，最多1张）
- 个人简介（多行文本，最多500字）"

❌ 不推荐写法：
"生成一个表单"
"弄个员工表单"
```

**技巧：**

1. 明确列出所有字段名称
2. 说明字段类型（如"下拉选择"、"日期选择"）
3. 指定校验要求（如"必填"、"11位手机号"）
4. 提供选项内容（如部门列表）
5. 说明限制条件（如"最多500字"）

### 5. 配置复用

使用 JSON 导入导出实现配置复用：

```typescript
// 导出配置
const exportConfig = () => {
  const config = JSON.stringify(schema.value, null, 2)
  // 保存到文件或数据库
}

// 导入配置
const importConfig = (jsonString: string) => {
  const config = JSON.parse(jsonString)
  importSchema(config)
}

// 模板复用
const templates = {
  userForm: { /* 用户表单配置 */ },
  orderForm: { /* 订单表单配置 */ },
  productForm: { /* 商品表单配置 */ }
}
```

## 常见问题

### 1. 组件拖拽不生效

**问题原因：**

- 浏览器不支持 HTML5 拖拽 API
- 组件面板未正确加载
- 画布区域被遮挡

**解决方案：**

```vue
<template>
  <!-- 确保画布可以接收拖拽 -->
  <div
    class="design-canvas"
    @dragover.prevent
    @drop="handleDrop"
  >
    <!-- 画布内容 -->
  </div>
</template>

<script setup lang="ts">
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const type = e.dataTransfer?.getData('componentType')
  if (type) {
    addItem(type as FormItemType)
  }
}
</script>
```

### 2. AI 生成结果不理想

**问题原因：**

- 描述不够详细
- 未说明字段类型
- 未提供选项数据

**解决方案：**

```
优化描述示例：

❌ "生成一个表单"

✅ "生成一个用户注册表单，包含：
1. 用户名 - 必填，长度2-20个字符
2. 密码 - 必填，长度6-20个字符
3. 确认密码 - 必填，需与密码一致
4. 手机号 - 必填，11位手机号格式
5. 邮箱 - 选填，邮箱格式
6. 性别 - 单选框，选项：男/女
7. 生日 - 日期选择
8. 头像 - 图片上传，最多1张"
```

### 3. 生成的代码有语法错误

**问题原因：**

- 字段名包含特殊字符
- 选项配置格式错误
- 组件嵌套层级过深

**解决方案：**

```typescript
// 确保字段名为合法的 JavaScript 标识符
const isValidProp = (prop: string) => {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(prop)
}

// 确保选项格式正确
const validateOptions = (options: any[]) => {
  return options.every(opt =>
    typeof opt.label === 'string' &&
    (typeof opt.value === 'string' || typeof opt.value === 'number')
  )
}
```

### 4. 预览效果与生成代码不一致

**问题原因：**

- 预览使用的是渲染器，代码是静态模板
- 某些动态属性在预览中有效，代码中需要手动实现

**解决方案：**

生成的代码是模板代码，某些动态功能需要在集成到项目后补充实现：

```vue
<script setup lang="ts">
// 远程搜索需要手动实现
const remoteMethod = async (query: string) => {
  if (query) {
    loading.value = true
    const res = await api.search(query)
    options.value = res.data
    loading.value = false
  }
}

// 联动效果需要手动实现
watch(() => formData.province, (val) => {
  // 省份变化时，重新加载城市列表
  loadCities(val)
})
</script>
```

### 5. 导入 JSON 配置失败

**问题原因：**

- JSON 格式错误
- 缺少必要字段
- 组件类型不存在

**解决方案：**

```typescript
// 导入前验证配置
const validateSchema = (schema: any): boolean => {
  // 检查基础结构
  if (!schema || typeof schema !== 'object') return false
  if (!Array.isArray(schema.items)) return false

  // 检查组件配置
  return schema.items.every((item: any) => {
    if (!item.id || !item.type) return false
    // 验证组件类型是否有效
    return isValidComponentType(item.type)
  })
}

// 使用
try {
  const config = JSON.parse(jsonString)
  if (!validateSchema(config)) {
    throw new Error('无效的配置格式')
  }
  importSchema(config)
} catch (error) {
  console.error('导入失败:', error)
}
```
