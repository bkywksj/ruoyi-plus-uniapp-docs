# ADataCard 数据卡片组件

用于展示关键数据指标的卡片组件，支持主数据展示、对比数据、趋势显示和响应式布局。

## 基础用法

最简单的使用方式，展示单个数据项：

```vue
<template>
  <ADataCard
    title="总用户数"
    icon-code="user"
    :data-list="[{ label: '当前用户', value: '12,345', percent: 5.2 }]"
  />
</template>
```

## 对比数据

显示主数据和多个对比项，第一项为主数据，其余项显示为对比数据：

```vue
<template>
  <ADataCard
    title="销售数据"
    icon-code="chart"
    :data-list="[
      { label: '今日销售', value: '¥8,520', percent: 12.5 },
      { label: '昨日', value: '¥7,580', percent: -2.1 },
      { label: '本周', value: '¥45,600', percent: 8.9 },
      { label: '上周', value: '¥41,200', percent: 3.2 }
    ]"
    @item-click="handleItemClick"
  />
</template>

<script setup>
const handleItemClick = (item, index) => {
  console.log('点击了项目：', item, '索引：', index)
}
</script>
```

## 自定义响应式布局

通过 `col-config` 属性自定义不同屏幕尺寸下的列宽：

```vue
<template>
  <ADataCard
    title="访问统计"
    icon-code="eye"
    :data-list="[{ label: '今日访问', value: '1,234', percent: 8.5 }]"
    :col-config="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 4 }"
  />
</template>
```

## 带操作按钮和底部内容

使用插槽添加操作按钮和底部信息：

```vue
<template>
  <ADataCard
    title="订单数据"
    icon-code="shopping-cart"
    :data-list="[{ label: '待处理订单', value: '28', percent: -5.5 }]"
  >
    <template #actions>
      <el-button size="small" type="primary">查看详情</el-button>
    </template>
    <template #footer>
      <div class="text-xs text-gray-500">最后更新：2分钟前</div>
    </template>
  </ADataCard>
</template>
```

## 无百分比变化数据

某些数据不需要显示变化百分比：

```vue
<template>
  <ADataCard
    title="库存状态"
    icon-code="package"
    :data-list="[
      { label: '总库存', value: '2,580件' },
      { label: '可用', value: '2,100件' },
      { label: '预定', value: '380件' },
      { label: '缺货', value: '100件' }
    ]"
  />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| title | 卡片标题 | `string` | — | — |
| icon-code | 图标代码（优先使用） | `IconCode` | — | `''` |
| icon-value | 图标值（备用） | `string` | — | `''` |
| data-list | 数据列表，第一项作为主数据展示 | `DataItem[]` | — | — |
| col-config | 响应式列配置 | `ColConfig` | — | `{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6 }` |
| clickable | 是否可点击 | `boolean` | — | `true` |

### DataItem 接口

```typescript
interface DataItem {
  /** 数据标签，如："今日新增"、"昨日"、"本周"等 */
  label: string
  /** 数值 */
  value: number | string
  /** 变化百分比（可选） */
  percent?: number
}
```

### ColConfig 接口

```typescript
interface ColConfig {
  /** 超小屏幕 <768px */
  xs?: number
  /** 小屏幕 ≥768px */
  sm?: number
  /** 中等屏幕 ≥992px */
  md?: number
  /** 大屏幕 ≥1200px */
  lg?: number
  /** 超大屏幕 ≥1920px */
  xl?: number
}
```

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| item-click | 点击对比数据项时触发 | `(item: DataItem, index: number)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| actions | 卡片头部右侧操作区域 |
| footer | 卡片底部内容区域 |

## 特性

- **响应式布局**：支持不同屏幕尺寸的自适应布局
- **趋势显示**：自动根据百分比数值显示趋势图标和颜色
- **交互反馈**：支持悬停效果和点击事件
- **暗色模式**：完整支持暗色主题切换
- **灵活扩展**：通过插槽支持自定义操作按钮和底部内容

## 样式说明

组件采用现代化的卡片设计，包含以下特性：

- 圆角边框和阴影效果
- 悬停时的微动画效果（向上移动和阴影加深）
- 趋势标签的颜色编码：
    - 绿色（success）：正增长
    - 红色（danger）：负增长
    - 灰色（info）：无变化
- 响应式的文字大小和间距
- 完整的暗色模式支持

## 注意事项

1. `data-list` 数组的第一项会作为主数据在卡片上方大字显示
2. 其余数据项会在下方以网格形式展示为对比数据
3. `percent` 字段为可选，不传入时不会显示趋势标签
4. 点击事件只对对比数据项生效，主数据项不触发点击事件
5. 图标优先使用 `icon-code`，如果未提供则使用 `icon-value`
