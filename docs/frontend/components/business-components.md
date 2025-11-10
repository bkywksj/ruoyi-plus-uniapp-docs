# 业务组件总览

## 介绍

RuoYi-Plus-UniApp 前端管理端提供了一套完整且强大的业务组件库，涵盖表单输入、数据展示、弹窗交互、图表可视化、AI 辅助等多个领域。这些组件基于 Element Plus 进行二次封装，遵循统一的设计规范和 API 约定，极大地简化了后台管理系统的开发流程。

**核心特性:**

- **高度模块化** - 70+ 个业务组件，按功能分类清晰，易于查找和使用
- **统一 API 设计** - 所有组件遵循一致的属性命名和事件处理规范
- **响应式布局** - 内置智能响应式系统，支持多种屏幕尺寸自适应
- **国际化支持** - 全面集成 i18n，所有文本支持多语言切换
- **TypeScript 类型** - 完整的类型定义，提供优秀的开发体验
- **丰富的插槽** - 灵活的插槽设计，满足高度定制需求
- **智能数据处理** - 自动类型转换、数据格式化、双向绑定优化
- **主题定制** - 支持暗黑模式和自定义主题色
- **权限控制** - 与 v-permi 指令无缝集成
- **性能优化** - 虚拟滚动、懒加载、组件缓存等优化手段

组件库总计超过 **70+ 个**业务组件，平均每个组件文件 **300-700 行代码**，文档覆盖率 **100%**，TypeScript 类型完备度 **100%**。

## 组件分类

### 1. 表单组件 (13个)

表单组件是业务开发中使用频率最高的组件类型，提供了完整的表单输入解决方案。

| 组件名称 | 组件标识 | 主要功能 | 独特特性 |
|---------|---------|---------|---------|
| 文本输入框 | `AFormInput` | 单行/多行文本输入 | 防自动填充、字数统计、响应式 span |
| 下拉选择器 | `AFormSelect` | 单选/多选下拉框 | 智能类型转换、显示选项值、禁用条件配置 |
| 复选框组 | `AFormCheckbox` | 复选框选择 | 动态选项、组合布局 |
| 单选框组 | `AFormRadio` | 单选框选择 | 自定义布局、事件响应 |
| 日期选择器 | `AFormDate` | 日期/日期范围选择 | 快捷日期、范围选择 |
| 开关 | `AFormSwitch` | 布尔值切换 | 自定义标签 |
| 树形选择器 | `AFormTreeSelect` | 树形结构选择 | 层级展示、多选支持 |
| 级联选择器 | `AFormCascader` | 级联数据选择 | 动态加载、多层级 |
| 文件上传 | `AFormFileUpload` | 文件上传 | 拖拽上传、类型验证 |
| 图片上传 | `AFormImgUpload` | 图片上传 | 图片预览、剪裁 |
| 富文本编辑器 | `AFormEditor` | 富文本编辑 | Markdown/富文本、工具栏配置 |
| 地图选择器 | `AFormMap` | 地理位置选择 | 坐标拾取、地址搜索 |
| AI辅助输入框 | `AFormInputWithAi` | AI增强输入 | AI建议、文本优化 |

### 2. 搜索和表格组件 (3个)

用于实现列表页的搜索、工具栏和分页功能。

| 组件名称 | 组件标识 | 主要功能 | 独特特性 |
|---------|---------|---------|---------|
| 搜索表单 | `ASearchForm` | 搜索条件容器 | 展开/收起、自动计算行数、动画效果 |
| 表格工具栏 | `TableToolbar` | 表格操作工具栏 | 打印、刷新、列可见性、搜索区域切换 |
| 分页器 | `Pagination` | 数据分页 | 自动滚动、响应式页码 |

### 3. 弹窗组件 (2个)

提供对话框和抽屉两种弹窗模式，支持详情展示和表单编辑。

| 组件名称 | 组件标识 | 主要功能 | 独特特性 |
|---------|---------|---------|---------|
| 通用弹窗 | `AModal` | 对话框/抽屉容器 | 双模式、拖动、全屏、加载状态 |
| 详情弹窗 | `ADetail` | 数据详情展示 | 字段分组、密码显示、复制、JSON格式化 |

### 4. 业务选择器 (2个)

封装了常用的业务数据选择功能。

| 组件名称 | 组件标识 | 主要功能 | 独特特性 |
|---------|---------|---------|---------|
| 用户选择器 | `UserSelect` | 用户选择 | 部门树过滤、搜索、分页、单/多选 |
| 字典标签 | `DictTag` | 字典值显示 | 支持 dict/region/cascader 三种模式 |

### 5. 卡片组件 (23个)

丰富的卡片组件，用于数据展示和页面布局。

| 类别 | 组件数量 | 典型组件 |
|------|---------|---------|
| 统计卡片 | 3 | AStatsCard, ABarStatsCard, ALineStatsCard |
| 图表卡片 | 5 | ABarChartCard, ALineChartCard, APieChartCard |
| 内容卡片 | 4 | AFormCard, ATableCard, AImageCard, AInfoCard |
| 业务卡片 | 4 | AUserCard, AProfileCard, APricingCard, ASocialCard |
| 列表卡片 | 5 | ADataListCard, ATimelineListCard, AActivityCard |
| 特殊卡片 | 2 | ADataCard, AEmptyCard |

### 6. 图表组件 (10个)

基于 ECharts 封装的图表组件，支持常见的数据可视化场景。

| 组件名称 | 图表类型 | 使用场景 |
|---------|---------|---------|
| AChart | 通用图表 | ECharts 基础封装 |
| ALineChart | 折线图 | 趋势分析 |
| ABarChart | 竖向柱状图 | 数据对比 |
| ABarHorizontalChart | 横向柱状图 | 排名展示 |
| ABarBidirectionalChart | 双向柱状图 | 对比分析 |
| APieChart | 饼图/环形图 | 占比展示 |
| ARadarChart | 雷达图 | 多维度评估 |
| AScatterChart | 散点图 | 分布关系 |
| ACandlestickChart | K线图 | 股票数据 |
| AMapChart | 地图 | 地理分布 |

### 7. AI 组件 (4个)

基于 AI 能力的辅助工具组件。

| 组件名称 | 功能 | 应用场景 |
|---------|------|---------|
| AAiAssistant | AI 助手面板 | 智能问答、操作引导 |
| AAiTextOptimizer | 文本优化工具 | 文案润色、语法检查 |
| AAiContentReviewer | 内容审查工具 | 敏感词检测、合规检查 |
| AAiDataGenerator | 数据生成工具 | 测试数据生成 |

### 8. 媒体和数据处理 (2个)

| 组件名称 | 功能 | 特点 |
|---------|------|------|
| AImportExcel | Excel 导入 | 文件验证、拖拽上传、模板下载 |
| AOssMediaManager | 媒体管理器 | OSS 文件管理、预览、删除 |

### 9. 主题和视觉 (4个)

| 组件名称 | 功能 | 特点 |
|---------|------|------|
| AThemeColorPicker | 主题配色选择器 | 实时预览、色值导出 |
| AThemeSvg | SVG 渲染 | 动态颜色、尺寸控制 |
| AGeometricBackground | 几何背景 | 动态背景效果 |
| AWatermark | 水印 | 全局/局部水印 |

### 10. 工具组件 (7个)

| 组件名称 | 功能 | 特点 |
|---------|------|------|
| Icon | 图标渲染 | 支持字体图标、SVG、Iconify |
| IconSelect | 图标选择器 | 图标浏览、搜索、选择 |
| ImagePreview | 图片预览 | 大图预览、缩略图 |
| ASelectionTags | 选中标签 | 显示已选项、快速清除 |
| AResizablePanels | 可拖拽面板 | 左右分割、宽度调整 |
| IFrameContainer | IFrame 容器 | 外链嵌入 |
| ARecharge | 充值组件 | 支付选择、金额输入 |

## 核心功能详解

### 响应式布局系统

所有表单组件都支持强大的响应式布局功能，通过 `span` 属性实现。

#### 固定 span

```vue
<template>
  <AFormInput label="用户名" v-model="form.userName" :span="12" />
</template>
```

#### 响应式对象

```vue
<template>
  <AFormInput
    label="邮箱"
    v-model="form.email"
    :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
  />
</template>
```

#### 预设响应式

```vue
<template>
  <AFormInput label="手机" v-model="form.phone" span="auto" />
</template>
```

#### 响应式模式

组件支持三种响应式模式:

1. **screen** (默认) - 基于屏幕尺寸
2. **container** - 基于容器尺寸(弹窗场景推荐)
3. **modal-size** - 基于 AModal 的 size 属性

```vue
<template>
  <AModal v-model="visible" size="large">
    <el-form>
      <AFormInput
        label="标题"
        v-model="form.title"
        :span="12"
        responsiveMode="modal-size"
        :modalSize="'large'"
      />
    </el-form>
  </AModal>
</template>
```

### 智能数据类型转换

`AFormSelect` 组件具备智能的数据类型检测和转换功能。

#### 多选模式类型处理

```vue
<template>
  <!-- 输入字符串 "1,2,3",输出数组 [1, 2, 3] -->
  <AFormSelect
    v-model="form.roleIds"
    :options="roleList"
    :multiple="true"
  />
</template>

<script setup lang="ts">
const form = ref({
  roleIds: '1,2,3' // 字符串输入
})

// 组件自动转换为数组 [1, 2, 3] 用于内部选择
// 确认后自动转回字符串 "1,2,3" 保持类型一致
</script>
```

#### 智能类型检测规则

**优先级**: 字符串 > 数字 > 其他类型

- 如果数组中有任何字符串元素，输出字符串数组
- 如果全是数字且在安全整数范围内，输出数字数组
- 如果数字超过 15 位,自动转为字符串防止精度丢失

```typescript
// 示例
[1, 2, 3] → [1, 2, 3]  // 数字数组
['1', '2', '3'] → ['1', '2', '3']  // 字符串数组
[1, '2', 3] → ['1', '2', '3']  // 混合类型,转为字符串
[999999999999999999] → ['999999999999999999']  // 超大数字,转为字符串
```

### 国际化集成

所有组件都内置了 i18n 支持,自动处理多语言显示。

```vue
<template>
  <!-- 标签自动国际化 -->
  <AFormInput label="用户名" prop="userName" v-model="form.userName" />

  <!-- 占位符自动国际化 -->
  <AFormSelect
    label="状态"
    v-model="form.status"
    :options="statusOptions"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 组件内部处理
const computedLabel = computed(() => {
  return t(props.prop || props.label, props.label)
})

const placeholder = computed(() => {
  return props.placeholder || `${t('placeholder.select')}${computedLabel.value}`
})
</script>
```

### 防自动填充

`AFormInput` 组件提供了防止浏览器自动填充密码的功能。

```vue
<template>
  <AFormInput
    label="密码"
    v-model="form.password"
    type="password"
    show-password
    prevent-autofill
  />
</template>
```

**技术实现**:

1. 初始状态设置输入框为只读 `readonly`
2. 用户聚焦时移除 `readonly` 属性
3. 浏览器的自动填充机制被阻止

### 选项禁用条件配置

`AFormSelect` 支持灵活的选项禁用配置。

#### 默认禁用 (status = '0')

```vue
<template>
  <AFormSelect
    v-model="form.postIds"
    :options="postOptions"
    value-field="postId"
    label-field="postName"
    :multiple="true"
  />
</template>
```

#### 自定义禁用字段

```vue
<template>
  <AFormSelect
    v-model="form.roleId"
    :options="roleList"
    value-field="id"
    label-field="roleName"
    disabled-field="isActive"
    :disabled-value="false"
  />
</template>
```

#### 多值禁用

```vue
<template>
  <AFormSelect
    v-model="form.deptId"
    :options="deptList"
    value-field="deptId"
    label-field="deptName"
    disabled-field="status"
    :disabled-value="['0', '3']"
  />
</template>
```

#### 函数判断

```vue
<template>
  <AFormSelect
    v-model="form.goodsId"
    :options="productList"
    value-field="id"
    label-field="name"
    :disabled-value="(item) => item.status === '0' || item.stock < 10"
  />
</template>
```

## 表单组件详解

### AFormInput - 文本输入框

通用的文本输入组件,支持单行、多行、数字等多种类型。

#### 基本用法

```vue
<template>
  <el-form :model="form">
    <!-- 单行文本 -->
    <AFormInput label="用户名" v-model="form.userName" prop="userName" :span="12" />

    <!-- 多行文本 -->
    <AFormInput
      label="备注"
      v-model="form.remark"
      type="textarea"
      :maxlength="200"
      show-word-limit
      :rows="4"
    />

    <!-- 数字输入 -->
    <AFormInput
      label="年龄"
      v-model="form.age"
      type="number"
      :min="0"
      :max="150"
      :span="8"
    />

    <!-- 密码输入 -->
    <AFormInput
      label="密码"
      v-model="form.password"
      type="password"
      show-password
      prevent-autofill
    />
  </el-form>
</template>

<script setup lang="ts">
const form = ref({
  userName: '',
  remark: '',
  age: 18,
  password: ''
})
</script>
```

#### Props 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number` | - |
| label | 标签文本 | `string` | - |
| prop | 表单域 model 字段名 | `string` | - |
| type | 输入框类型 | `'text' \| 'textarea' \| 'number' \| 'password'` | `'text'` |
| span | 栅格占据列数 | `number \| SpanType` | - |
| maxlength | 最大长度 | `number` | `255` |
| showWordLimit | 显示字数统计 | `boolean` | `true` |
| showPassword | 显示密码可见性切换 | `boolean` | `false` |
| preventAutofill | 防止自动填充 | `boolean` | `false` |
| clearable | 显示清除按钮 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| placeholder | 占位符文本 | `string` | - |
| tooltip | 提示信息 | `string` | - |
| min | 数字最小值 | `number` | - |
| max | 数字最大值 | `number` | - |
| step | 数字步长 | `number` | `1` |
| precision | 数值精度 | `number` | - |
| responsiveMode | 响应式模式 | `'screen' \| 'container' \| 'modal-size'` | `'screen'` |

#### Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | `(value: string \| number) => void` |
| input | 输入时触发 | `(value: string \| number) => void` |
| change | 值改变时触发 | `(value: string \| number) => void` |
| blur | 失去焦点时触发 | `(event: FocusEvent) => void` |
| enter | 按下回车键时触发 | `(value: string \| number) => void` |
| clear | 点击清除按钮时触发 | `() => void` |

#### Slots 插槽

| 插槽名 | 说明 |
|--------|------|
| prepend | 输入框前置内容 |
| append | 输入框后置内容 |
| prefix | 输入框头部图标 |
| suffix | 输入框尾部图标 |

#### 响应式 span 用法

```vue
<template>
  <!-- 固定 span -->
  <AFormInput label="标题" v-model="form.title" :span="12" />

  <!-- 响应式对象 - 完整配置 -->
  <AFormInput
    label="用户名"
    v-model="form.userName"
    :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
  />

  <!-- 响应式对象 - 部分配置(其他使用默认值 24) -->
  <AFormInput
    label="邮箱"
    v-model="form.email"
    :span="{ md: 12, lg: 8 }"
  />

  <!-- 预设响应式 -->
  <AFormInput label="手机" v-model="form.phone" span="auto" />
</template>
```

#### 插槽使用

```vue
<template>
  <!-- 前置/后置内容 -->
  <AFormInput label="网址" v-model="form.url">
    <template #prepend>
      <span>https://</span>
    </template>
    <template #append>
      <el-button icon="Search" />
    </template>
  </AFormInput>

  <!-- 图标插槽 -->
  <AFormInput label="搜索" v-model="searchKey">
    <template #prefix>
      <Icon code="search" />
    </template>
  </AFormInput>
</template>
```

### AFormSelect - 下拉选择器

强大的下拉选择组件,支持单选/多选、智能类型转换、禁用条件配置等功能。

#### 基本用法

```vue
<template>
  <el-form :model="form">
    <!-- 单选 -->
    <AFormSelect
      label="类型"
      v-model="form.type"
      :options="sys_enable_status"
      :span="12"
    />

    <!-- 多选 -->
    <AFormSelect
      label="角色"
      v-model="form.roleIds"
      :options="roleList"
      value-field="roleId"
      label-field="roleName"
      :multiple="true"
      :span="12"
    />

    <!-- 显示选项值 -->
    <AFormSelect
      label="代码"
      v-model="form.code"
      :options="codeList"
      :show-value="true"
    />

    <!-- 自定义禁用条件 -->
    <AFormSelect
      label="产品"
      v-model="form.goodsId"
      :options="productList"
      :disabled-value="(item) => item.status === '0' || item.stock < 10"
    />
  </el-form>
</template>

<script setup lang="ts">
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

const form = ref({
  type: '',
  roleIds: [] as string[],
  code: '',
  goodsId: ''
})

const roleList = ref([
  { roleId: '1', roleName: '管理员', status: '1' },
  { roleId: '2', roleName: '普通用户', status: '0' } // 禁用
])

const productList = ref([
  { id: '1', name: '产品A', status: '1', stock: 100 },
  { id: '2', name: '产品B', status: '0', stock: 50 },
  { id: '3', name: '产品C', status: '1', stock: 5 } // 库存不足禁用
])
</script>
```

#### Props 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number \| Array<string \| number>` | - |
| label | 标签文本 | `string` | - |
| prop | 表单域字段名 | `string` | - |
| options | 选项数据 | `any[]` | `[]` |
| span | 栅格占据列数 | `number \| SpanType` | - |
| multiple | 是否多选 | `boolean` | `false` |
| filterable | 是否可搜索 | `boolean` | `true` |
| clearable | 是否可清空 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| allowCreate | 允许创建新条目 | `boolean` | `false` |
| valueField | value 字段名 | `string` | `'value'` |
| labelField | label 字段名 | `string` | `'label'` |
| disabledField | 禁用判断字段名 | `string` | `'status'` |
| disabledValue | 禁用条件值 | `DisabledCondition` | `'0'` |
| showValue | 是否显示选项值 | `boolean` | - |
| showValueRoles | 哪些角色显示选项值 | `string[]` | `['superadmin', 'admin']` |
| multipleLimit | 多选最多可选项数 | `number` | `0` |
| collapseTags | 多选是否折叠标签 | `boolean` | `false` |
| width | 选择框宽度 | `number \| string` | - |

#### 智能类型转换示例

```vue
<template>
  <AFormSelect
    label="角色"
    v-model="form.roleIds"
    :options="roleList"
    :multiple="true"
  />
</template>

<script setup lang="ts">
const form = ref({
  roleIds: '1,2,3' // 输入字符串
})

// 组件内部逻辑:
// 1. 检测到字符串,按逗号分割为数组 ['1', '2', '3']
// 2. 显示时使用数组进行选中匹配
// 3. 确认时检测原始类型是字符串,转回 '1,2,3'

// 如果输入的是数组
const form2 = ref({
  roleIds: [1, 2, 3] // 输入数字数组
})

// 组件内部逻辑:
// 1. 检测到数组,保持数组格式
// 2. 确认时检测数组元素都是数字,返回 [1, 2, 3]

// 混合类型处理
const form3 = ref({
  roleIds: [1, '2', 3] // 混合类型数组
})

// 组件内部逻辑:
// 1. 检测到混合类型,优先转为字符串 ['1', '2', '3']
// 2. 确认时返回 ['1', '2', '3']
</script>
```

#### 禁用条件配置

```vue
<template>
  <!-- 默认禁用 (status = '0') -->
  <AFormSelect
    v-model="form.postIds"
    :options="postOptions"
    :multiple="true"
  />

  <!-- 自定义字段和值 -->
  <AFormSelect
    v-model="form.roleId"
    :options="roleList"
    disabled-field="isActive"
    :disabled-value="false"
  />

  <!-- 多值禁用 -->
  <AFormSelect
    v-model="form.deptId"
    :options="deptList"
    disabled-field="status"
    :disabled-value="['0', '3']"
  />

  <!-- 函数判断 -->
  <AFormSelect
    v-model="form.goodsId"
    :options="productList"
    :disabled-value="(item) => item.status === '0' || item.stock < 10"
  />
</template>
```

### AFormDate - 日期选择器

日期和日期范围选择组件。

```vue
<template>
  <el-form :model="form">
    <!-- 单个日期 -->
    <AFormDate label="出生日期" v-model="form.birthday" :span="12" />

    <!-- 日期范围 -->
    <AFormDate
      label="创建时间"
      v-model="form.dateRange"
      type="daterange"
      :span="12"
    />

    <!-- 日期时间 -->
    <AFormDate
      label="预约时间"
      v-model="form.appointmentTime"
      type="datetime"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = ref({
  birthday: '',
  dateRange: [] as [string, string],
  appointmentTime: ''
})
</script>
```

### AFormTreeSelect - 树形选择器

树形结构数据选择组件,适用于部门、分类等层级数据。

```vue
<template>
  <AFormTreeSelect
    label="所属部门"
    v-model="form.deptId"
    :options="deptTree"
    :props="{ label: 'deptName', value: 'deptId', children: 'children' }"
    :span="12"
  />
</template>

<script setup lang="ts">
const form = ref({
  deptId: ''
})

const deptTree = ref([
  {
    deptId: '1',
    deptName: '总公司',
    children: [
      { deptId: '2', deptName: '研发部' },
      { deptId: '3', deptName: '市场部' }
    ]
  }
])
</script>
```

### AFormUpload - 文件上传

文件和图片上传组件。

```vue
<template>
  <el-form :model="form">
    <!-- 文件上传 -->
    <AFormFileUpload
      label="附件"
      v-model="form.fileList"
      :limit="5"
      :accept="'.pdf,.doc,.docx'"
    />

    <!-- 图片上传 -->
    <AFormImgUpload
      label="头像"
      v-model="form.avatar"
      :limit="1"
      :max-size="2"
    />
  </el-form>
</template>

<script setup lang="ts">
const form = ref({
  fileList: [] as string[],
  avatar: ''
})
</script>
```

## 搜索和表格组件

### ASearchForm - 搜索表单

通用搜索表单容器,支持展开/收起功能和动画效果。

#### 基本用法

```vue
<template>
  <ASearchForm v-model="queryParams" title="搜索条件">
    <AFormInput label="用户名" prop="userName" v-model="queryParams.userName" />
    <AFormInput label="手机号" prop="phone" v-model="queryParams.phone" />
    <AFormSelect label="状态" prop="status" v-model="queryParams.status" :options="statusOptions" />
    <AFormDate label="创建时间" v-model="queryParams.dateRange" type="daterange" />
  </ASearchForm>
</template>

<script setup lang="ts">
const queryParams = ref({
  userName: '',
  phone: '',
  status: '',
  dateRange: [] as [string, string]
})
</script>
```

#### 展开/收起功能

当表单项超过 2 行时,自动显示展开/收起按钮。

```vue
<template>
  <!-- 可展开收起(默认收起) -->
  <ASearchForm v-model="queryParams" :collapsible="true">
    <AFormInput label="用户名" v-model="queryParams.userName" />
    <AFormInput label="手机号" v-model="queryParams.phone" />
    <AFormInput label="邮箱" v-model="queryParams.email" />
    <AFormSelect label="状态" v-model="queryParams.status" :options="statusOptions" />
    <AFormSelect label="角色" v-model="queryParams.roleId" :options="roleOptions" />
    <AFormDate label="创建时间" v-model="queryParams.dateRange" type="daterange" />
  </ASearchForm>

  <!-- 默认展开 -->
  <ASearchForm v-model="queryParams" :default-expanded="true">
    <!-- 表单项 -->
  </ASearchForm>

  <!-- 禁用展开收起 -->
  <ASearchForm v-model="queryParams" :collapsible="false">
    <!-- 表单项 -->
  </ASearchForm>
</template>
```

#### Props 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 表单数据模型 | `Record<string, any>` | `{}` |
| visible | 显示/隐藏 | `boolean` | `true` |
| inline | 是否行内表单 | `boolean` | `true` |
| labelWidth | 标签宽度 | `string` | `'auto'` |
| labelPosition | 标签位置 | `'left' \| 'right' \| 'top'` | `'right'` |
| title | 卡片标题 | `string` | - |
| collapsible | 是否可展开收起 | `boolean` | `true` |
| defaultExpanded | 默认是否展开 | `boolean` | `false` |

#### 技术实现原理

**自动计算行数**:

```typescript
const calculateFormRows = () => {
  const formElement = formContainerRef.value?.querySelector('.el-form')
  if (!formElement) return

  const formItems = formElement.querySelectorAll('.el-form-item')
  const topValues = new Set<number>()

  formItems.forEach((item) => {
    const itemTop = Math.round((item as HTMLElement).offsetTop)
    topValues.add(itemTop)
  })

  formRows.value = topValues.size
}
```

**展开收起样式**:

```scss
.search-form-container {
  &.is-collapsed {
    :deep(.el-form) {
      max-height: calc(1 * 40px + 10px); // 仅显示第一行
      overflow: hidden;

      // 渐变遮罩
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        height: 30px;
        background: linear-gradient(to bottom, transparent, var(--el-bg-color));
      }
    }
  }
}
```

### TableToolbar - 表格工具栏

表格操作工具栏,提供打印、刷新、列可见性控制等功能。

```vue
<template>
  <TableToolbar
    :columns="tableColumns"
    :show-search="showSearch"
    @resetQuery="resetQuery"
    @queryTable="getList"
  />

  <el-table :data="tableData" :column-hidden="columnHidden">
    <el-table-column prop="userId" label="用户ID" />
    <el-table-column prop="userName" label="用户名" />
    <el-table-column prop="nickName" label="昵称" />
  </el-table>
</template>

<script setup lang="ts">
const showSearch = ref(true)
const tableColumns = ref([
  { prop: 'userId', label: '用户ID' },
  { prop: 'userName', label: '用户名' },
  { prop: 'nickName', label: '昵称' }
])
const columnHidden = ref({})
</script>
```

### Pagination - 分页器

分页组件,支持自动滚动和响应式页码。

```vue
<template>
  <Pagination
    v-model:page="queryParams.pageNum"
    v-model:limit="queryParams.pageSize"
    :total="total"
    @pagination="getList"
  />
</template>

<script setup lang="ts">
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})
const total = ref(0)

const getList = async () => {
  const { data } = await pageUsers(queryParams.value)
  tableData.value = data.records
  total.value = data.total
}
</script>
```

## 弹窗组件详解

### AModal - 通用弹窗

支持对话框和抽屉两种模式的通用弹窗组件。

#### 对话框模式

```vue
<template>
  <!-- 基础对话框 -->
  <AModal v-model="dialogVisible" title="新增用户" @confirm="handleSubmit">
    <el-form :model="form">
      <AFormInput label="用户名" v-model="form.userName" />
      <AFormInput label="邮箱" v-model="form.email" />
    </el-form>
  </AModal>

  <!-- 大尺寸对话框 -->
  <AModal v-model="dialogVisible" title="编辑用户" size="large">
    <UserEditForm :user="currentUser" />
  </AModal>

  <!-- 全屏对话框 -->
  <AModal v-model="fullscreenVisible" title="数据分析" :fullscreen="true">
    <DataAnalysis />
  </AModal>

  <!-- 可拖动对话框 -->
  <AModal v-model="movableVisible" title="可拖动对话框" :movable="true">
    <p>可以拖动标题栏移动此对话框</p>
  </AModal>
</template>

<script setup lang="ts">
const dialogVisible = ref(false)
const fullscreenVisible = ref(false)
const movableVisible = ref(false)

const form = ref({
  userName: '',
  email: ''
})

const handleSubmit = () => {
  // 提交逻辑
  dialogVisible.value = false
}
</script>
```

#### 抽屉模式

```vue
<template>
  <!-- 从右侧滑出 -->
  <AModal
    v-model="drawerVisible"
    title="用户详情"
    mode="drawer"
    direction="rtl"
    size="large"
    :show-footer="false"
  >
    <UserDetail :user="selectedUser" />
  </AModal>

  <!-- 从左侧滑出 -->
  <AModal
    v-model="menuVisible"
    title="菜单导航"
    mode="drawer"
    direction="ltr"
    size="small"
  >
    <MenuTree :menus="menuList" />
  </AModal>

  <!-- 从底部滑出 -->
  <AModal
    v-model="filterVisible"
    title="筛选条件"
    mode="drawer"
    direction="btt"
  >
    <FilterForm v-model="filterParams" />
  </AModal>
</template>
```

#### Props 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 显示/隐藏状态 | `boolean` | `false` |
| mode | 模式 | `'dialog' \| 'drawer'` | `'dialog'` |
| title | 标题 | `string` | - |
| size | 预设尺寸 | `'small' \| 'medium' \| 'large' \| 'xl'` | `'medium'` |
| width | 自定义宽度 | `string \| number` | - |
| fullscreen | 是否全屏 | `boolean` | `false` |
| movable | 是否可拖动 | `boolean` | `false` |
| direction | 抽屉方向 | `'ltr' \| 'rtl' \| 'ttb' \| 'btt'` | `'rtl'` |
| showFooter | 显示底部 | `boolean` | `true` |
| footerType | 底部按钮类型 | `'default' \| 'close-only'` | `'default'` |
| footerAlign | 底部对齐方式 | `'left' \| 'center' \| 'right'` | `'right'` |
| loading | 加载状态 | `boolean` | `false` |
| maskClosable | 点击遮罩关闭 | `boolean` | `false` |
| keyboard | ESC 关闭 | `boolean` | `true` |
| destroyOnClose | 关闭时销毁 | `boolean` | `true` |

#### 尺寸配置

```typescript
const sizeMap = {
  small: { dialog: '600px', drawer: '600px' },
  medium: { dialog: '800px', drawer: '800px' },
  large: { dialog: '1000px', drawer: '1000px' },
  xl: { dialog: '1200px', drawer: '1200px' }
}
```

#### Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 状态变化 | `(value: boolean) => void` |
| confirm | 确认按钮点击 | `() => void` |
| cancel | 取消按钮点击 | `() => void` |
| open | 开始打开 | `() => void` |
| opened | 完全打开 | `() => void` |
| close | 开始关闭 | `() => void` |
| closed | 完全关闭 | `() => void` |

#### Slots 插槽

| 插槽名 | 说明 |
|--------|------|
| header | 自定义标题 |
| default | 内容区域 |
| footer | 自定义底部 |

#### 自定义底部

```vue
<template>
  <!-- 仅关闭按钮 -->
  <AModal v-model="viewVisible" title="查看详情" footer-type="close-only">
    <DetailView :data="detailData" />
  </AModal>

  <!-- 完全自定义底部 -->
  <AModal v-model="customVisible" title="自定义操作">
    <template #footer>
      <el-button @click="customVisible = false">取消</el-button>
      <el-button type="warning" @click="handleSave">保存草稿</el-button>
      <el-button type="primary" @click="handlePublish">发布</el-button>
    </template>
    <TextEditor v-model="content" />
  </AModal>

  <!-- 无底部 -->
  <AModal v-model="noFooterVisible" title="无底部" :show-footer="false">
    <DataDisplay :data="displayData" />
  </AModal>
</template>
```

#### 拖动功能实现

```typescript
// 拖动状态
interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  initialLeft: number
  initialTop: number
}

// 初始化拖动
const initDrag = () => {
  if (!isDialogMode.value || props.fullscreen || !props.movable) return

  nextTick(() => {
    const dialogElement = document.querySelector('.el-dialog')
    const headerElement = dialogElement?.querySelector('.el-dialog__header')

    if (headerElement) {
      headerElement.style.cursor = 'move'
      headerElement.addEventListener('mousedown', handleMouseDown)
    }
  })
}

// 鼠标按下
const handleMouseDown = (e: MouseEvent) => {
  dragState.isDragging = true
  dragState.startX = e.clientX
  dragState.startY = e.clientY

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!dragState.isDragging) return

  const deltaX = e.clientX - dragState.startX
  const deltaY = e.clientY - dragState.startY

  const newLeft = dragState.initialLeft + deltaX
  const newTop = Math.max(0, dragState.initialTop + deltaY)

  dialogElement.style.left = `${newLeft}px`
  dialogElement.style.top = `${newTop}px`
}
```

#### 为子组件提供上下文

```typescript
// 提供弹窗尺寸给子组件
provide('modalSize', computed(() => props.size))

// 子组件中使用
const modalSize = inject<Ref<string>>('modalSize')

const computedSpan = computed(() => {
  if (modalSize?.value === 'small') return 24
  if (modalSize?.value === 'medium') return 12
  return 8
})
```

### ADetail - 详情弹窗

用于展示数据详情的专用弹窗组件,支持字段分组、密码显示/隐藏、复制等功能。

```vue
<template>
  <ADetail
    v-model="detailVisible"
    title="用户详情"
    :data="detailData"
    :fields="detailFields"
    mode="drawer"
  />
</template>

<script setup lang="ts">
const detailVisible = ref(false)
const detailData = ref({
  userId: '1',
  userName: 'admin',
  nickName: '管理员',
  email: 'admin@example.com',
  password: '******',
  avatar: 'https://example.com/avatar.jpg',
  status: '1',
  createTime: '2024-01-01 00:00:00'
})

const detailFields = ref([
  { label: '用户ID', prop: 'userId', type: 'text' },
  { label: '用户名', prop: 'userName', type: 'copyable' },
  { label: '昵称', prop: 'nickName', type: 'text' },
  { label: '邮箱', prop: 'email', type: 'copyable' },
  { label: '密码', prop: 'password', type: 'password' },
  { label: '头像', prop: 'avatar', type: 'image' },
  { label: '状态', prop: 'status', type: 'dict', dictType: 'sys_enable_status' },
  { label: '创建时间', prop: 'createTime', type: 'datetime' }
])
</script>
```

#### 字段类型

| 类型 | 说明 | 示例 |
|------|------|------|
| text | 普通文本 | `用户名: admin` |
| password | 密码(可切换显示) | `密码: ******` |
| copyable | 可复制文本 | `邮箱: admin@example.com` (复制图标) |
| dict | 字典标签 | `状态: 正常` (绿色标签) |
| image | 图片预览 | 显示缩略图,点击查看大图 |
| html | HTML 内容 | 渲染富文本 |
| file | 文件链接 | 显示下载链接 |
| date | 日期格式化 | `2024-01-01` |
| datetime | 日期时间格式化 | `2024-01-01 00:00:00` |
| currency | 货币格式化 | `¥1,234.56` |
| boolean | 是/否 | `是` 或 `否` |
| array | 数组显示 | 逗号分隔显示 |

## 业务选择器详解

### UserSelect - 用户选择器

强大的用户选择组件,支持部门树过滤、搜索、分页、单选/多选等功能。

#### 基本用法

```vue
<template>
  <!-- 基础多选 -->
  <UserSelect v-model="selectedUsers" :multiple="true" />

  <!-- 基础单选 -->
  <UserSelect v-model="selectedUser" :multiple="false" />

  <!-- 显示内置标签 -->
  <UserSelect v-model="selectedUsers" :multiple="true" show-inline-tags />

  <!-- 自定义按钮样式 -->
  <UserSelect
    v-model="selectedUsers"
    :multiple="true"
    button-text="选择项目成员"
    button-type="success"
    :button-plain="false"
  />

  <!-- 编辑模式(传入初始用户名) -->
  <UserSelect
    v-model="userIds"
    :initial-user-names="userNamesString"
    :multiple="true"
  />

  <!-- 限制用户范围 -->
  <UserSelect
    v-model="selectedUsers"
    :multiple="true"
    :user-ids="allowedUserIds"
  />
</template>

<script setup lang="ts">
const selectedUsers = ref([])
const selectedUser = ref('')
const userIds = ref('1,2,3')
const userNamesString = ref('张三,李四,王五')
const allowedUserIds = ref([1, 2, 3, 4, 5])
</script>
```

#### Props 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| number \| SysUserVo \| Array` | - |
| multiple | 是否多选 | `boolean` | `false` |
| data | 预设激活数据 | `string \| number \| SysUserVo \| Array` | - |
| userIds | 限制用户 ID 范围 | `string \| number \| Array` | - |
| defaultReturnType | 默认返回类型 | `'object' \| 'id'` | `'object'` |
| showInlineTags | 显示内置标签 | `boolean` | `false` |
| buttonText | 按钮文本 | `string` | `'选择用户'` |
| buttonType | 按钮类型 | `'primary' \| 'success' \| ...` | `'primary'` |
| buttonPlain | 朴素按钮 | `boolean` | `true` |
| buttonSize | 按钮尺寸 | `'large' \| 'default' \| 'small'` | `'small'` |
| tagSize | 标签尺寸 | `'large' \| 'default' \| 'small'` | `'small'` |
| showCount | 显示数量 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| initialUserNames | 初始用户名 | `string \| string[]` | - |

#### Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化 | `(value: any) => void` |
| confirmCallBack | 确认回调 | `(value: any) => void` |

#### 智能返回类型

```vue
<script setup lang="ts">
// 情况 1: 传入用户对象,返回用户对象
const user1 = ref<SysUserVo>({ userId: '1', userName: 'admin' })
// 确认后返回: { userId: '1', userName: 'admin', ... }

// 情况 2: 传入用户 ID,返回用户 ID
const user2 = ref('1')
// 确认后返回: '1'

// 情况 3: 传入空值,根据 defaultReturnType 决定
const user3 = ref(null)
// defaultReturnType="object" 时返回: { userId: '1', ... }
// defaultReturnType="id" 时返回: '1'

// 情况 4: 多选数组
const users = ref([1, 2, 3])
// 确认后返回: [1, 2, 3]

// 情况 5: 多选字符串
const userIds = ref('1,2,3')
// 确认后返回: '1,2,3'
</script>
```

#### 完整使用示例

```vue
<template>
  <el-form :model="form">
    <el-form-item label="负责人">
      <UserSelect
        v-model="form.userId"
        :multiple="false"
        show-inline-tags
      />
    </el-form-item>

    <el-form-item label="项目成员">
      <UserSelect
        v-model="form.userIds"
        :multiple="true"
        show-inline-tags
        button-text="选择成员"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { SysUserVo } from '@/api/system/core/user/userTypes'

const form = ref({
  userId: '' as string | SysUserVo,
  userIds: [] as string[] | SysUserVo[]
})

// 提交时处理
const handleSubmit = () => {
  // 如果返回的是用户对象,提取 ID
  const userId = typeof form.value.userId === 'object'
    ? form.value.userId.userId
    : form.value.userId

  const userIds = Array.isArray(form.value.userIds) && form.value.userIds.length > 0
    ? typeof form.value.userIds[0] === 'object'
      ? form.value.userIds.map(u => (u as SysUserVo).userId)
      : form.value.userIds
    : []

  // 提交数据
  submitForm({ userId, userIds })
}
</script>
```

### DictTag - 字典标签

字典值显示组件,支持多种模式。

#### 基本用法

```vue
<template>
  <!-- dict 模式 - 字典值转换 -->
  <DictTag :options="sys_enable_status" :value="user.status" />

  <!-- region 模式 - 地区代码转换 -->
  <DictTag mode="region" :value="user.regionCode" />

  <!-- cascader 模式 - 自定义级联转换 -->
  <DictTag
    mode="cascader"
    :value="user.categoryId"
    :cascader-data="categoryTree"
    value-field="id"
    label-field="name"
  />
</template>

<script setup lang="ts">
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

const user = ref({
  status: '1',
  regionCode: '110000',
  categoryId: '001'
})
</script>
```

#### Props 属性

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| mode | 模式 | `'dict' \| 'region' \| 'cascader'` | `'dict'` |
| options | 字典选项 | `any[]` | `[]` |
| value | 值 | `string \| number` | - |
| cascaderData | 级联数据 | `any[]` | `[]` |
| valueField | value 字段名 | `string` | `'value'` |
| labelField | label 字段名 | `string` | `'label'` |

## 图表组件详解

### AChart - 通用图表

基于 ECharts 的通用图表组件。

```vue
<template>
  <AChart :option="chartOption" height="400px" />
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'

const chartOption = ref<EChartsOption>({
  title: { text: '销售统计' },
  tooltip: {},
  xAxis: {
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {},
  series: [{
    name: '销量',
    type: 'bar',
    data: [5, 20, 36, 10, 10, 20]
  }]
})
</script>
```

### ALineChart - 折线图

```vue
<template>
  <ALineChart
    title="访问量趋势"
    :xData="xData"
    :series="series"
    height="300px"
  />
</template>

<script setup lang="ts">
const xData = ref(['1月', '2月', '3月', '4月', '5月', '6月'])
const series = ref([
  {
    name: 'PV',
    data: [120, 132, 101, 134, 90, 230]
  },
  {
    name: 'UV',
    data: [45, 62, 48, 71, 53, 98]
  }
])
</script>
```

### ABarChart - 柱状图

```vue
<template>
  <ABarChart
    title="产品销量"
    :xData="products"
    :series="sales"
    height="350px"
  />
</template>

<script setup lang="ts">
const products = ref(['产品A', '产品B', '产品C', '产品D', '产品E'])
const sales = ref([
  {
    name: '销量',
    data: [120, 200, 150, 80, 70]
  }
])
</script>
```

### APieChart - 饼图

```vue
<template>
  <APieChart
    title="流量来源"
    :data="trafficData"
    height="400px"
  />
</template>

<script setup lang="ts">
const trafficData = ref([
  { name: '直接访问', value: 335 },
  { name: '搜索引擎', value: 310 },
  { name: '外部链接', value: 234 },
  { name: '社交媒体', value: 135 },
  { name: '其他', value: 100 }
])
</script>
```

## 最佳实践

### 1. 列表页面开发流程

```vue
<template>
  <div class="app-container">
    <!-- 1. 搜索表单 -->
    <ASearchForm v-model="queryParams" title="搜索条件">
      <AFormInput label="用户名" prop="userName" v-model="queryParams.userName" />
      <AFormSelect label="状态" prop="status" v-model="queryParams.status" :options="sys_enable_status" />
      <AFormDate label="创建时间" v-model="dateRange" type="daterange" />
    </ASearchForm>

    <!-- 2. 表格工具栏 -->
    <TableToolbar
      :columns="tableColumns"
      :show-search="showSearch"
      @resetQuery="resetQuery"
      @queryTable="getList"
    >
      <template #left>
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除
        </el-button>
      </template>
    </TableToolbar>

    <!-- 3. 数据表格 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="用户ID" prop="userId" />
      <el-table-column label="用户名" prop="userName" />
      <el-table-column label="状态" prop="status">
        <template #default="{ row }">
          <DictTag :options="sys_enable_status" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 4. 分页 -->
    <Pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <!-- 5. 编辑弹窗 -->
    <AModal v-model="editVisible" :title="editTitle" @confirm="handleSubmit">
      <el-form :model="form" :rules="rules" ref="formRef">
        <AFormInput label="用户名" prop="userName" v-model="form.userName" :span="12" />
        <AFormInput label="昵称" prop="nickName" v-model="form.nickName" :span="12" />
        <AFormSelect label="状态" prop="status" v-model="form.status" :options="sys_enable_status" :span="12" />
      </el-form>
    </AModal>
  </div>
</template>

<script setup lang="ts">
import { pageUsers, addUser, updateUser, deleteUser } from '@/api/system/core/user/userApi'
import type { SysUserQuery, SysUserVo } from '@/api/system/core/user/userTypes'

// 字典数据
const { sys_enable_status } = useDict(DictTypes.sys_enable_status)

// 查询参数
const queryParams = ref<SysUserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: ''
})
const dateRange = ref<[string, string]>(['', ''])

// 表格数据
const tableData = ref<SysUserVo[]>([])
const total = ref(0)
const loading = ref(false)

// 选中数据
const selectedIds = ref<string[]>([])

// 弹窗状态
const editVisible = ref(false)
const editTitle = computed(() => form.value.userId ? '编辑用户' : '新增用户')

// 表单数据
const form = ref<Partial<SysUserVo>>({})
const formRef = ref<FormInstance>()

// 查询列表
const getList = async () => {
  loading.value = true
  queryParams.value.params = {}
  addDateRange(queryParams.value, dateRange.value, 'createTime')

  const [err, data] = await pageUsers(queryParams.value)
  if (!err) {
    tableData.value = data.records || []
    total.value = data.total
  }
  loading.value = false
}

// 新增
const handleAdd = () => {
  form.value = {}
  editVisible.value = true
}

// 编辑
const handleEdit = (row: SysUserVo) => {
  form.value = { ...row }
  editVisible.value = true
}

// 提交
const handleSubmit = async () => {
  await formRef.value?.validate()
  const api = form.value.userId ? updateUser : addUser
  const [err] = await api(form.value)
  if (!err) {
    ElMessage.success('操作成功')
    editVisible.value = false
    getList()
  }
}

// 删除
const handleDelete = async (row: SysUserVo) => {
  await ElMessageBox.confirm('确认删除此用户吗?', '提示', { type: 'warning' })
  const [err] = await deleteUser(row.userId)
  if (!err) {
    ElMessage.success('删除成功')
    getList()
  }
}

// 选择变化
const handleSelectionChange = (selection: SysUserVo[]) => {
  selectedIds.value = selection.map(item => item.userId)
}

// 初始加载
onMounted(() => {
  getList()
})
</script>
```

### 2. 表单验证集成

```vue
<template>
  <AModal v-model="visible" title="用户表单" @confirm="handleSubmit">
    <el-form :model="form" :rules="rules" ref="formRef">
      <AFormInput
        label="用户名"
        prop="userName"
        v-model="form.userName"
        :span="12"
      />
      <AFormInput
        label="邮箱"
        prop="email"
        v-model="form.email"
        :span="12"
      />
      <AFormInput
        label="手机号"
        prop="phone"
        v-model="form.phone"
        :span="12"
      />
      <AFormSelect
        label="角色"
        prop="roleIds"
        v-model="form.roleIds"
        :options="roleList"
        :multiple="true"
        :span="12"
      />
    </el-form>
  </AModal>
</template>

<script setup lang="ts">
const formRef = ref<FormInstance>()

const form = ref({
  userName: '',
  email: '',
  phone: '',
  roleIds: [] as string[]
})

const rules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  roleIds: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  // 提交逻辑
}
</script>
```

### 3. 权限控制集成

```vue
<template>
  <div class="app-container">
    <TableToolbar>
      <template #left>
        <el-button v-permi="['system:user:add']" type="primary" @click="handleAdd">
          新增
        </el-button>
        <el-button v-permi="['system:user:import']" type="info" @click="handleImport">
          导入
        </el-button>
        <el-button v-permi="['system:user:export']" type="warning" @click="handleExport">
          导出
        </el-button>
      </template>
    </TableToolbar>

    <el-table :data="tableData">
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button v-permi="['system:user:edit']" type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button v-permi="['system:user:delete']" type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
          <el-button v-permi="['system:user:resetPwd']" type="warning" link @click="handleResetPwd(row)">
            重置密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```

### 4. 响应式布局最佳实践

```vue
<template>
  <!-- 推荐:在 AModal 中使用 modal-size 模式 -->
  <AModal v-model="visible" size="large">
    <el-form>
      <!-- 表单项会根据弹窗尺寸自动调整 -->
      <AFormInput
        label="标题"
        v-model="form.title"
        :span="12"
        responsiveMode="modal-size"
        :modalSize="'large'"
      />
      <AFormInput
        label="副标题"
        v-model="form.subtitle"
        :span="12"
        responsiveMode="modal-size"
        :modalSize="'large'"
      />
    </el-form>
  </AModal>

  <!-- 页面中使用 screen 模式 -->
  <el-form>
    <AFormInput
      label="用户名"
      v-model="form.userName"
      :span="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
    />
  </el-form>
</template>
```

### 5. Excel 导入导出

```vue
<template>
  <!-- Excel 导入 -->
  <AImportExcel
    v-permi="['system:user:import']"
    :template-url="'/system/user/importTemplate'"
    :import-url="'/system/user/importData'"
    @success="handleImportSuccess"
  />

  <!-- Excel 导出 -->
  <el-button v-permi="['system:user:export']" @click="handleExport">
    导出
  </el-button>
</template>

<script setup lang="ts">
import { exportUsers } from '@/api/system/core/user/userApi'

// 导入成功回调
const handleImportSuccess = () => {
  ElMessage.success('导入成功')
  getList()
}

// 导出
const handleExport = async () => {
  await ElMessageBox.confirm('确认导出所有用户数据吗?', '提示')
  const [err, blob] = await exportUsers(queryParams.value)
  if (!err) {
    // 下载文件
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${Date.now()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  }
}
</script>
```

## 常见问题

### 1. AFormSelect 多选时类型不一致?

**问题原因**:
- v-model 传入的是字符串 `"1,2,3"`,但组件返回的是数组 `[1, 2, 3]`
- 或者传入的是数字数组,但返回的是字符串数组

**解决方案**:

```vue
<script setup lang="ts">
// 方案1: 让组件自动处理类型转换
const form = ref({
  roleIds: '1,2,3' // 字符串输入
})

// AFormSelect 会自动:
// - 输入时将 '1,2,3' 转为 [1, 2, 3] 用于显示
// - 输出时将 [1, 2, 3] 转回 '1,2,3' 保持类型一致

// 方案2: 统一使用数组格式
const form = ref({
  roleIds: [1, 2, 3] // 数组输入
})

// 组件会保持数组格式,自动检测数字类型
</script>
```

### 2. AFormInput 防自动填充不生效?

**问题原因**:
- 浏览器的自动填充策略不断变化
- 某些浏览器可能绕过 `readonly` 属性

**解决方案**:

```vue
<template>
  <!-- 确保同时使用这两个属性 -->
  <AFormInput
    label="密码"
    v-model="form.password"
    type="password"
    show-password
    prevent-autofill
  />
</template>

<script setup lang="ts">
// 如果仍然不生效,可以在表单外层添加:
// <el-form autocomplete="new-password">
</script>
```

### 3. AModal 拖动后位置无法重置?

**问题原因**:
- 拖动后 dialog 的 position 被设置为 fixed
- 关闭再打开时没有重置位置

**解决方案**:

```vue
<script setup lang="ts">
// 组件内部已经自动处理,但如果遇到问题:

// 监听对话框关闭,重置位置
watch(visible, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      const dialogElement = document.querySelector('.el-dialog')
      if (dialogElement) {
        dialogElement.style.position = ''
        dialogElement.style.left = ''
        dialogElement.style.top = ''
      }
    })
  }
})
</script>
```

### 4. UserSelect 返回类型如何控制?

**问题原因**:
- 有时需要返回用户对象,有时只需要 ID
- 不清楚如何控制返回类型

**解决方案**:

```vue
<script setup lang="ts">
// 方式1: 通过 v-model 的初始值类型自动推断
const userId = ref('') // 返回字符串 ID
const user = ref<SysUserVo>() // 返回用户对象
const userIds = ref<string[]>([]) // 返回 ID 数组
const users = ref<SysUserVo[]>([]) // 返回对象数组

// 方式2: 使用 defaultReturnType 指定(当 v-model 为空时)
const emptyValue = ref()
// <UserSelect v-model="emptyValue" defaultReturnType="id" />
// 返回 ID

// <UserSelect v-model="emptyValue" defaultReturnType="object" />
// 返回对象
</script>
```

### 5. ASearchForm 展开/收起按钮不显示?

**问题原因**:
- 表单项少于 2 行时不显示展开按钮
- 或者 `collapsible` 属性设置为 `false`

**解决方案**:

```vue
<template>
  <!-- 确保表单项足够多(>=2行) -->
  <ASearchForm v-model="queryParams" :collapsible="true">
    <AFormInput label="字段1" v-model="queryParams.field1" />
    <AFormInput label="字段2" v-model="queryParams.field2" />
    <AFormInput label="字段3" v-model="queryParams.field3" />
    <AFormInput label="字段4" v-model="queryParams.field4" />
    <AFormInput label="字段5" v-model="queryParams.field5" />
    <!-- 至少需要能形成2行才会显示展开按钮 -->
  </ASearchForm>
</template>

<script setup lang="ts">
// 手动触发行数计算(如果自动计算不准确)
const searchFormRef = ref()

onMounted(() => {
  nextTick(() => {
    searchFormRef.value?.calculateFormRows()
  })
})
</script>
```

## 组件性能优化

### 1. 大数据列表优化

```vue
<template>
  <!-- 使用虚拟滚动 -->
  <el-table
    :data="tableData"
    height="600"
    :virtual-scrolling="true"
    :row-height="48"
  >
    <!-- 表格列 -->
  </el-table>
</template>
```

### 2. 表单组件缓存

```vue
<template>
  <keep-alive :include="['UserForm', 'RoleForm']">
    <component :is="currentForm" />
  </keep-alive>
</template>
```

### 3. 图表懒加载

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const ALineChart = defineAsyncComponent(() =>
  import('@/components/AChart/ALineChart.vue')
)
</script>
```

## 总结

RuoYi-Plus-UniApp 前端管理端的业务组件库提供了完整的后台管理系统开发解决方案,涵盖:

- **13 个表单组件** - 完整的表单输入方案
- **3 个搜索表格组件** - 列表页核心组件
- **2 个弹窗组件** - 对话框和详情展示
- **2 个业务选择器** - 用户选择和字典显示
- **23 个卡片组件** - 丰富的展示卡片
- **10 个图表组件** - 完整的数据可视化
- **4 个 AI 组件** - 智能辅助工具
- **7 个工具组件** - 常用工具组件

通过这些组件,开发者可以:

1. **快速构建列表页** - 搜索表单 + 工具栏 + 表格 + 分页,10 分钟完成
2. **灵活定制表单** - 响应式布局 + 智能验证 + 国际化支持
3. **强大的数据选择** - 用户选择器 + 字典标签,覆盖常见场景
4. **丰富的数据展示** - 卡片 + 图表,多样化呈现数据
5. **优秀的开发体验** - TypeScript 类型 + 完整文档 + 统一 API

所有组件都经过生产环境验证,性能优秀,易于使用,是构建现代化后台管理系统的理想选择。
