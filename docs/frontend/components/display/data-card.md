# ADataCard 数据卡片组件

## 介绍

ADataCard 是一个专为数据仪表盘设计的卡片组件，用于展示关键业务指标和数据统计。该组件采用主数据 + 对比数据的展示模式，支持趋势标签显示、响应式布局配置，以及完整的暗黑模式适配。

**核心特性：**

- **主数据突出显示** - 数据列表第一项作为主数据在卡片上方大字展示，其余数据以网格形式展示为对比数据
- **趋势可视化** - 自动根据百分比数值显示趋势图标（↗/↘/→）和对应颜色（绿色/红色/灰色）
- **响应式布局** - 内置五档断点配置（xs/sm/md/lg/xl），自动适配不同屏幕尺寸
- **灵活扩展** - 通过 `actions` 和 `footer` 插槽支持自定义操作按钮和底部内容
- **交互反馈** - 支持悬停动画效果和点击事件，提供良好的用户交互体验
- **暗黑模式** - 完整支持暗色主题切换，所有颜色和样式均有暗黑模式适配

组件基于 Element Plus 的 `el-card` 和 `el-col` 封装，利用 CSS Transition 实现平滑的悬停动画效果，通过计算属性动态处理数据分割和趋势类型判断。

---

## 基本用法

### 单项数据展示

最简单的使用方式，展示单个数据指标：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="总用户数"
      icon-code="user"
      :data-list="[{ label: '当前用户', value: '12,345', percent: 5.2 }]"
    />
  </el-row>
</template>
```

**使用说明：**

- `title` 属性定义卡片标题，显示在卡片头部左侧
- `icon-code` 属性指定图标代码，使用项目内置的图标库
- `data-list` 接收一个数据数组，第一项作为主数据展示
- `percent` 为可选字段，传入后会显示趋势标签

### 多项对比数据

显示主数据和多个对比项，适用于数据对比分析场景：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="销售数据"
      icon-code="chart"
      :data-list="salesData"
      @item-click="handleItemClick"
    />
  </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface DataItem {
  label: string
  value: number | string
  percent?: number
}

const salesData = ref<DataItem[]>([
  { label: '今日销售', value: '¥8,520', percent: 12.5 },
  { label: '昨日', value: '¥7,580', percent: -2.1 },
  { label: '本周', value: '¥45,600', percent: 8.9 },
  { label: '上周', value: '¥41,200', percent: 3.2 }
])

const handleItemClick = (item: DataItem, index: number) => {
  console.log('点击了项目：', item, '索引：', index)
}
</script>
```

**使用说明：**

- 数组第一项（今日销售）作为主数据在卡片上方大字显示
- 其余项（昨日、本周、上周）以四列网格形式展示为对比数据
- `item-click` 事件仅对对比数据项生效，点击时返回数据项和索引
- 正百分比显示绿色趋势标签，负百分比显示红色趋势标签

### 无百分比数据

某些业务场景不需要显示变化百分比：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="库存状态"
      icon-code="package"
      :data-list="stockData"
    />
  </el-row>
</template>

<script setup lang="ts">
const stockData = [
  { label: '总库存', value: '2,580件' },
  { label: '可用', value: '2,100件' },
  { label: '预定', value: '380件' },
  { label: '缺货', value: '100件' }
]
</script>
```

**使用说明：**

- 不传入 `percent` 字段时，不会显示趋势标签
- 主数据和对比数据都可以不带百分比
- 适用于静态数据展示，如库存状态、服务器状态等

---

## 响应式布局

### 默认响应式配置

组件内置了默认的响应式列配置：

```typescript
const defaultColConfig = {
  xs: 24,  // <768px 占满一行
  sm: 12,  // ≥768px 占半行
  md: 12,  // ≥992px 占半行
  lg: 6,   // ≥1200px 占 1/4 行
  xl: 6    // ≥1920px 占 1/4 行
}
```

### 自定义响应式配置

通过 `col-config` 属性自定义不同屏幕尺寸下的列宽：

```vue
<template>
  <el-row :gutter="20">
    <!-- 更紧凑的布局：大屏幕显示更多卡片 -->
    <ADataCard
      title="访问统计"
      icon-code="eye"
      :data-list="[{ label: '今日访问', value: '1,234', percent: 8.5 }]"
      :col-config="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 4 }"
    />

    <!-- 更宽松的布局：大屏幕保持较宽卡片 -->
    <ADataCard
      title="用户增长"
      icon-code="user-plus"
      :data-list="[{ label: '新增用户', value: '256', percent: 15.3 }]"
      :col-config="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 6 }"
    />
  </el-row>
</template>
```

**断点说明：**

| 断点 | 屏幕宽度 | 典型设备 |
|------|---------|---------|
| `xs` | `<768px` | 手机竖屏 |
| `sm` | `≥768px` | 平板竖屏、手机横屏 |
| `md` | `≥992px` | 平板横屏、小型笔记本 |
| `lg` | `≥1200px` | 标准笔记本、桌面显示器 |
| `xl` | `≥1920px` | 大屏显示器、高分辨率设备 |

### 仪表盘网格布局

在仪表盘页面中，通常需要多个数据卡片并排展示：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      v-for="(card, index) in dashboardCards"
      :key="index"
      :title="card.title"
      :icon-code="card.icon"
      :data-list="card.data"
      :col-config="{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6 }"
    />
  </el-row>
</template>

<script setup lang="ts">
const dashboardCards = [
  {
    title: '总用户数',
    icon: 'user',
    data: [
      { label: '当前用户', value: '12,345', percent: 5.2 },
      { label: '活跃', value: '8,520', percent: 12.3 },
      { label: '新增', value: '156', percent: 8.7 },
      { label: '流失', value: '23', percent: -2.1 }
    ]
  },
  {
    title: '订单统计',
    icon: 'order',
    data: [
      { label: '今日订单', value: '328', percent: 15.6 },
      { label: '待处理', value: '45', percent: 8.3 },
      { label: '已完成', value: '283', percent: 18.2 },
      { label: '已取消', value: '12', percent: -5.5 }
    ]
  },
  {
    title: '销售额',
    icon: 'money',
    data: [
      { label: '今日销售', value: '¥25,680', percent: 22.4 },
      { label: '昨日', value: '¥21,350', percent: 18.6 },
      { label: '本周', value: '¥145,600', percent: 25.3 },
      { label: '本月', value: '¥580,000', percent: 15.8 }
    ]
  },
  {
    title: '网站流量',
    icon: 'view',
    data: [
      { label: '今日PV', value: '25,680', percent: 22.6 },
      { label: '今日UV', value: '8,520', percent: 18.4 },
      { label: '跳出率', value: '32.5%', percent: -5.2 },
      { label: '平均时长', value: '3m25s', percent: 12.1 }
    ]
  }
]
</script>
```

---

## 插槽扩展

### actions 操作插槽

在卡片头部右侧添加操作按钮：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="实时监控"
      icon-code="monitor"
      :data-list="monitorData"
    >
      <template #actions>
        <el-button size="small" type="primary" link>
          <Icon code="refresh" />
          刷新
        </el-button>
        <el-dropdown trigger="click">
          <el-button size="small" type="default" link>
            <Icon code="more" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>查看详情</el-dropdown-item>
              <el-dropdown-item>导出数据</el-dropdown-item>
              <el-dropdown-item>设置告警</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </ADataCard>
  </el-row>
</template>

<script setup lang="ts">
const monitorData = [
  { label: 'CPU使用率', value: '45.6%', percent: 8.2 },
  { label: '内存', value: '68.3%', percent: 5.1 },
  { label: '磁盘', value: '52.1%', percent: 2.3 },
  { label: '网络', value: '12Mbps', percent: 15.6 }
]
</script>
```

### footer 底部插槽

在卡片底部添加额外信息：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="订单数据"
      icon-code="shopping-cart"
      :data-list="orderData"
    >
      <template #footer>
        <div class="flex justify-between items-center text-xs text-gray-500">
          <span>最后更新：2分钟前</span>
          <el-link type="primary" :underline="false">
            查看全部 <Icon code="arrow-right" />
          </el-link>
        </div>
      </template>
    </ADataCard>
  </el-row>
</template>

<script setup lang="ts">
const orderData = [
  { label: '待处理订单', value: '28', percent: -5.5 },
  { label: '今日', value: '156', percent: 12.3 },
  { label: '本周', value: '892', percent: 8.7 },
  { label: '本月', value: '3,456', percent: 15.2 }
]
</script>
```

### 组合使用插槽

同时使用 actions 和 footer 插槽创建功能完整的数据卡片：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="销售报表"
      icon-code="chart-bar"
      :data-list="salesReport"
      :col-config="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 8 }"
    >
      <template #actions>
        <el-button-group size="small">
          <el-button :type="period === 'day' ? 'primary' : 'default'" @click="period = 'day'">
            日
          </el-button>
          <el-button :type="period === 'week' ? 'primary' : 'default'" @click="period = 'week'">
            周
          </el-button>
          <el-button :type="period === 'month' ? 'primary' : 'default'" @click="period = 'month'">
            月
          </el-button>
        </el-button-group>
      </template>

      <template #footer>
        <div class="flex justify-between items-center">
          <div class="text-xs text-gray-500">
            <Icon code="clock" class="mr-1" />
            数据更新于 {{ updateTime }}
          </div>
          <div class="flex gap-2">
            <el-button size="small" type="primary" plain @click="exportData">
              <Icon code="download" class="mr-1" />
              导出
            </el-button>
            <el-button size="small" type="success" plain @click="viewDetails">
              <Icon code="eye" class="mr-1" />
              详情
            </el-button>
          </div>
        </div>
      </template>
    </ADataCard>
  </el-row>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const period = ref('day')
const updateTime = ref('2024-01-15 14:30:00')

const salesReport = computed(() => {
  const baseData = {
    day: [
      { label: '今日销售', value: '¥25,680', percent: 12.5 },
      { label: '订单数', value: '156', percent: 8.3 },
      { label: '客单价', value: '¥164.6', percent: 3.8 },
      { label: '转化率', value: '3.2%', percent: 0.5 }
    ],
    week: [
      { label: '本周销售', value: '¥168,520', percent: 18.2 },
      { label: '订单数', value: '1,024', percent: 15.6 },
      { label: '客单价', value: '¥164.6', percent: 2.1 },
      { label: '转化率', value: '3.5%', percent: 0.8 }
    ],
    month: [
      { label: '本月销售', value: '¥685,200', percent: 22.8 },
      { label: '订单数', value: '4,168', percent: 19.3 },
      { label: '客单价', value: '¥164.4', percent: 2.9 },
      { label: '转化率', value: '3.8%', percent: 1.2 }
    ]
  }
  return baseData[period.value as keyof typeof baseData]
})

const exportData = () => {
  console.log('导出数据', period.value)
}

const viewDetails = () => {
  console.log('查看详情', period.value)
}
</script>
```

---

## 趋势显示

### 趋势类型

组件根据 `percent` 值自动判断趋势类型并显示对应样式：

| 百分比值 | 趋势图标 | 标签颜色 | 说明 |
|---------|---------|---------|------|
| `> 0` | ↗ | `success`（绿色） | 正增长 |
| `< 0` | ↘ | `danger`（红色） | 负增长 |
| `= 0` | → | `info`（灰色） | 无变化 |
| `undefined` | - | - | 不显示趋势标签 |

### 趋势格式化

百分比值会自动格式化显示：

```typescript
// 格式化逻辑
const formatPercent = (percent: number | null | undefined): string => {
  if (percent == null) return '-'
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(1)}%`
}

// 示例
// 输入: 12.5  -> 输出: "+12.5%"
// 输入: -3.2  -> 输出: "-3.2%"
// 输入: 0     -> 输出: "0.0%"
// 输入: null  -> 输出: "-"
```

### 自定义趋势显示

如果需要更复杂的趋势展示，可以使用插槽自定义：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="自定义趋势"
      icon-code="trending"
      :data-list="customTrendData"
    >
      <template #footer>
        <div class="grid grid-cols-4 gap-2 text-center">
          <div v-for="(item, index) in trendDetails" :key="index" class="p-2">
            <div class="text-xs text-gray-500 mb-1">{{ item.label }}</div>
            <div class="flex items-center justify-center gap-1">
              <span :class="getTrendClass(item.trend)">
                {{ item.value }}
              </span>
              <Icon
                :code="getTrendIcon(item.trend)"
                :class="getTrendClass(item.trend)"
              />
            </div>
          </div>
        </div>
      </template>
    </ADataCard>
  </el-row>
</template>

<script setup lang="ts">
const customTrendData = [
  { label: '综合指数', value: '86.5', percent: 5.2 }
]

const trendDetails = [
  { label: '环比', value: '+12.5%', trend: 'up' },
  { label: '同比', value: '+8.3%', trend: 'up' },
  { label: '预测', value: '-2.1%', trend: 'down' },
  { label: '目标', value: '100%', trend: 'stable' }
]

const getTrendIcon = (trend: string) => {
  const icons = {
    up: 'arrow-up',
    down: 'arrow-down',
    stable: 'minus'
  }
  return icons[trend as keyof typeof icons] || 'minus'
}

const getTrendClass = (trend: string) => {
  const classes = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-500'
  }
  return classes[trend as keyof typeof classes] || 'text-gray-500'
}
</script>
```

---

## 图标配置

### 使用内置图标

通过 `icon-code` 属性使用项目内置的图标：

```vue
<template>
  <el-row :gutter="20">
    <!-- 用户相关 -->
    <ADataCard title="用户统计" icon-code="user" :data-list="userData" />

    <!-- 订单相关 -->
    <ADataCard title="订单管理" icon-code="order" :data-list="orderData" />

    <!-- 销售相关 -->
    <ADataCard title="销售分析" icon-code="chart" :data-list="salesData" />

    <!-- 访问相关 -->
    <ADataCard title="访问统计" icon-code="view" :data-list="visitData" />

    <!-- 监控相关 -->
    <ADataCard title="系统监控" icon-code="monitor" :data-list="monitorData" />
  </el-row>
</template>
```

### 使用自定义图标

通过 `icon-value` 属性使用自定义图标值：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="自定义图标"
      icon-value="carbon:analytics"
      :data-list="analyticsData"
    />
  </el-row>
</template>
```

**图标优先级：**

- 优先使用 `icon-code`（项目内置图标库）
- 如果 `icon-code` 未提供，则使用 `icon-value`
- 图标显示在标题左侧，颜色为蓝色（`text-blue-500`）

---

## 交互处理

### 点击事件

对比数据项支持点击交互：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="可点击数据卡片"
      icon-code="data"
      :data-list="clickableData"
      :clickable="true"
      @item-click="handleItemClick"
    />
  </el-row>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

interface DataItem {
  label: string
  value: number | string
  percent?: number
}

const clickableData = [
  { label: '主数据', value: '1,234', percent: 5.2 },
  { label: '对比项1', value: '856', percent: 3.1 },
  { label: '对比项2', value: '678', percent: -2.5 },
  { label: '对比项3', value: '432', percent: 8.7 },
  { label: '对比项4', value: '210', percent: 1.2 }
]

const handleItemClick = (item: DataItem, index: number) => {
  ElMessage.info(`点击了 ${item.label}，索引：${index}，值：${item.value}`)
}
</script>
```

**注意事项：**

- 点击事件仅对对比数据项（非第一项）生效
- 主数据项不触发点击事件
- 通过 `clickable` 属性可以禁用点击功能
- 回调参数包含数据项对象和在原数组中的索引

### 禁用点击

设置 `clickable` 为 `false` 禁用点击交互：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="仅展示数据"
      icon-code="info"
      :data-list="displayOnlyData"
      :clickable="false"
    />
  </el-row>
</template>
```

---

## 暗黑模式

组件完整支持暗黑模式，所有颜色和样式都有对应的暗黑模式适配：

### 颜色适配

| 元素 | 亮色模式 | 暗黑模式 |
|------|---------|---------|
| 卡片背景 | 白色 | 深灰色 |
| 标题文字 | `text-gray-800` | `text-gray-200` |
| 描述文字 | `text-gray-500` | `text-gray-400` |
| 图标颜色 | `text-blue-500` | `text-blue-400` |
| 对比项背景 | `--bg-level-2` | `--bg-level-2`（深色变体） |
| 分割线 | `border-gray-100` | `border-gray-700` |

### 暗黑模式示例

```vue
<template>
  <div :class="{ 'dark': isDark }">
    <el-row :gutter="20">
      <ADataCard
        title="暗黑模式卡片"
        icon-code="moon"
        :data-list="darkModeData"
      >
        <template #footer>
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-500 dark:text-gray-400">
              自动适配暗黑模式
            </span>
            <el-switch v-model="isDark" active-text="暗黑" inactive-text="亮色" />
          </div>
        </template>
      </ADataCard>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isDark = ref(false)

const darkModeData = [
  { label: '主题切换', value: '支持', percent: 100 },
  { label: '文字适配', value: '✓' },
  { label: '背景适配', value: '✓' },
  { label: '边框适配', value: '✓' }
]
</script>
```

---

## 业务场景示例

### 电商销售看板

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="实时销售"
      icon-code="shopping-cart"
      :data-list="realtimeSales"
      :col-config="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }"
    >
      <template #actions>
        <el-tag type="success" size="small" effect="light">实时</el-tag>
      </template>
      <template #footer>
        <div class="flex items-center text-xs text-gray-500">
          <Icon code="clock" class="mr-1" />
          每5秒自动刷新
        </div>
      </template>
    </ADataCard>

    <ADataCard
      title="商品库存"
      icon-code="package"
      :data-list="inventoryData"
      :col-config="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }"
      @item-click="handleInventoryClick"
    />

    <ADataCard
      title="会员数据"
      icon-code="vip"
      :data-list="memberData"
      :col-config="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }"
    />

    <ADataCard
      title="物流状态"
      icon-code="truck"
      :data-list="logisticsData"
      :col-config="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }"
    />
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const realtimeSales = ref([
  { label: '今日销售额', value: '¥125,680', percent: 18.5 },
  { label: '订单数', value: '1,256', percent: 12.3 },
  { label: '客单价', value: '¥100.1', percent: 5.5 },
  { label: '退款率', value: '2.1%', percent: -0.5 }
])

const inventoryData = ref([
  { label: '总SKU', value: '8,520' },
  { label: '充足', value: '6,850', percent: 80.4 },
  { label: '预警', value: '1,200', percent: 14.1 },
  { label: '缺货', value: '470', percent: 5.5 }
])

const memberData = ref([
  { label: '总会员', value: '125,680', percent: 8.2 },
  { label: '新增', value: '1,256', percent: 15.6 },
  { label: '活跃', value: '45,680', percent: 5.3 },
  { label: '沉睡', value: '28,500', percent: -2.1 }
])

const logisticsData = ref([
  { label: '待发货', value: '328', percent: -12.5 },
  { label: '运输中', value: '1,256', percent: 8.3 },
  { label: '已签收', value: '3,580', percent: 15.6 },
  { label: '异常件', value: '23', percent: -5.2 }
])

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  // 模拟实时数据更新
  timer = setInterval(() => {
    const randomChange = () => (Math.random() - 0.5) * 10
    realtimeSales.value = realtimeSales.value.map(item => ({
      ...item,
      percent: item.percent ? +(item.percent + randomChange()).toFixed(1) : undefined
    }))
  }, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const handleInventoryClick = (item: any, index: number) => {
  console.log('查看库存详情:', item.label)
}
</script>
```

### 系统监控面板

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="服务器状态"
      icon-code="server"
      :data-list="serverStatus"
      :col-config="{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6 }"
    >
      <template #actions>
        <el-tag :type="serverHealth" size="small">
          {{ serverHealthText }}
        </el-tag>
      </template>
    </ADataCard>

    <ADataCard
      title="数据库连接"
      icon-code="database"
      :data-list="databaseStatus"
      :col-config="{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6 }"
    />

    <ADataCard
      title="缓存状态"
      icon-code="memory"
      :data-list="cacheStatus"
      :col-config="{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6 }"
    />

    <ADataCard
      title="请求统计"
      icon-code="api"
      :data-list="requestStats"
      :col-config="{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6 }"
    />
  </el-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const serverStatus = [
  { label: 'CPU使用率', value: '45.6%', percent: 8.2 },
  { label: '内存', value: '68.3%', percent: 5.1 },
  { label: '磁盘', value: '52.1%', percent: 2.3 },
  { label: '负载', value: '1.25', percent: -3.5 }
]

const databaseStatus = [
  { label: '连接数', value: '128/500', percent: 25.6 },
  { label: '活跃', value: '45', percent: 12.3 },
  { label: '空闲', value: '83', percent: -8.5 },
  { label: '等待', value: '0', percent: 0 }
]

const cacheStatus = [
  { label: '命中率', value: '98.5%', percent: 2.1 },
  { label: '内存占用', value: '2.1GB', percent: 15.6 },
  { label: '键数量', value: '125,680', percent: 8.3 },
  { label: '过期键', value: '1,256', percent: -12.5 }
]

const requestStats = [
  { label: 'QPS', value: '1,256', percent: 18.5 },
  { label: '成功率', value: '99.9%', percent: 0.1 },
  { label: '平均延迟', value: '12ms', percent: -5.2 },
  { label: '错误数', value: '3', percent: -50.0 }
]

const serverHealth = computed(() => {
  const cpuUsage = parseFloat(serverStatus[0].value)
  if (cpuUsage > 80) return 'danger'
  if (cpuUsage > 60) return 'warning'
  return 'success'
})

const serverHealthText = computed(() => {
  const cpuUsage = parseFloat(serverStatus[0].value)
  if (cpuUsage > 80) return '告警'
  if (cpuUsage > 60) return '注意'
  return '正常'
})
</script>
```

### 数据分析报表

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="用户行为分析"
      icon-code="chart-line"
      :data-list="userBehavior"
      :col-config="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 8 }"
    >
      <template #actions>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          size="small"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 220px"
        />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button size="small" @click="refreshData">刷新数据</el-button>
          <el-button size="small" type="primary" @click="exportReport">导出报表</el-button>
        </div>
      </template>
    </ADataCard>
  </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dateRange = ref<[Date, Date]>()

const userBehavior = ref([
  { label: '日活跃用户', value: '25,680', percent: 12.5 },
  { label: '页面访问', value: '156,800', percent: 18.3 },
  { label: '平均停留', value: '5m32s', percent: 8.7 },
  { label: '跳出率', value: '28.5%', percent: -3.2 }
])

const refreshData = () => {
  console.log('刷新数据', dateRange.value)
}

const exportReport = () => {
  console.log('导出报表', dateRange.value)
}
</script>
```

---

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `title` | 卡片标题 | `string` | — |
| `icon-code` | 图标代码（优先使用） | `IconCode` | `''` |
| `icon-value` | 图标值（备用） | `string` | `''` |
| `data-list` | 数据列表，第一项作为主数据展示 | `DataItem[]` | — |
| `col-config` | 响应式列配置 | `ColConfig` | `{ xs: 24, sm: 12, md: 12, lg: 6, xl: 6 }` |
| `clickable` | 是否可点击 | `boolean` | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `item-click` | 点击对比数据项时触发（主数据项不触发） | `(item: DataItem, index: number) => void` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| `actions` | 卡片头部右侧操作区域 |
| `footer` | 卡片底部内容区域 |

### 类型定义

```typescript
/**
 * 数据项接口
 */
export interface DataItem {
  /** 数据标签，如："今日新增"、"昨日"、"本周"等 */
  label: string
  /** 数值，支持数字或格式化后的字符串 */
  value: number | string
  /** 变化百分比（可选），正数为增长，负数为下降 */
  percent?: number
}

/**
 * 响应式配置接口
 */
export interface ColConfig {
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

/**
 * 组件属性接口
 */
export interface ADataCardProps {
  /** 卡片标题 */
  title: string
  /** 图标代码，优先使用 */
  iconCode?: IconCode
  /** 图标值，备用 */
  iconValue?: string
  /** 数据列表（第一项作为主数据展示） */
  dataList: DataItem[]
  /** 响应式列配置 */
  colConfig?: ColConfig
  /** 是否可点击 */
  clickable?: boolean
}

/**
 * 趋势类型
 */
export type TrendType = 'success' | 'danger' | 'info'

/**
 * Element Plus 标签类型
 */
export type ElTagType = 'success' | 'warning' | 'danger' | 'info' | ''
```

---

## 主题定制

### CSS 变量

组件使用以下 CSS 变量，可以通过覆盖这些变量实现主题定制：

```css
:root {
  /* 背景色层级 */
  --bg-level-2: #f5f7fa;
  --bg-level-3: #ebeef5;

  /* 文字颜色 */
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-placeholder: #a8abb2;

  /* 边框颜色 */
  --border-color: #dcdfe6;
  --border-color-light: #e4e7ed;
}

/* 暗黑模式 */
.dark {
  --bg-level-2: #2b2b2b;
  --bg-level-3: #363636;

  --text-primary: #e5eaf3;
  --text-secondary: #cfd3dc;
  --text-placeholder: #8d9095;

  --border-color: #4c4d4f;
  --border-color-light: #414243;
}
```

### 自定义样式

通过类名或内联样式自定义卡片外观：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="自定义样式"
      icon-code="palette"
      :data-list="customStyleData"
      class="custom-data-card"
    />
  </el-row>
</template>

<style scoped>
.custom-data-card :deep(.el-card) {
  border-radius: 16px;
  border: 2px solid var(--el-color-primary-light-7);
}

.custom-data-card :deep(.el-card__header) {
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-7));
}

.custom-data-card :deep(.el-card:hover) {
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 24px rgba(var(--el-color-primary-rgb), 0.2);
}
</style>
```

---

## 最佳实践

### 1. 数据列表设计

合理设计数据列表结构，确保主数据和对比数据的逻辑关系：

```typescript
// ✅ 好的设计：主数据是总览，对比数据是细分
const goodDataList = [
  { label: '总销售额', value: '¥125,680', percent: 18.5 },  // 主数据
  { label: '线上', value: '¥85,600', percent: 22.3 },       // 细分1
  { label: '线下', value: '¥40,080', percent: 10.2 },       // 细分2
  { label: '直播', value: '¥15,600', percent: 45.8 }        // 细分3
]

// ❌ 不好的设计：数据之间没有逻辑关系
const badDataList = [
  { label: '销售额', value: '¥125,680', percent: 18.5 },
  { label: '用户数', value: '12,345', percent: 8.2 },       // 不相关的数据
  { label: 'PV', value: '256,800', percent: 12.3 },         // 不相关的数据
  { label: '转化率', value: '3.2%', percent: 0.5 }          // 不相关的数据
]
```

### 2. 响应式布局规划

根据数据重要性和屏幕尺寸合理配置列宽：

```vue
<template>
  <el-row :gutter="20">
    <!-- 重要数据：大屏幕也保持较大宽度 -->
    <ADataCard
      title="核心指标"
      :col-config="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 8 }"
      :data-list="coreMetrics"
    />

    <!-- 次要数据：大屏幕可以更紧凑 -->
    <ADataCard
      title="辅助指标"
      :col-config="{ xs: 24, sm: 12, md: 8, lg: 4, xl: 4 }"
      :data-list="secondaryMetrics"
    />
  </el-row>
</template>
```

### 3. 性能优化

对于频繁更新的实时数据，使用防抖或节流：

```typescript
import { ref, watchEffect } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const rawData = ref<DataItem[]>([])
const displayData = ref<DataItem[]>([])

// 使用防抖更新显示数据
const updateDisplayData = useDebounceFn(() => {
  displayData.value = [...rawData.value]
}, 300)

watchEffect(() => {
  rawData.value  // 监听原始数据变化
  updateDisplayData()
})
```

### 4. 错误处理

处理数据为空或加载失败的情况：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      v-if="!loading && !error && dataList.length > 0"
      title="数据卡片"
      :data-list="dataList"
    />

    <el-col v-else-if="loading" :span="6">
      <el-skeleton :rows="4" animated />
    </el-col>

    <el-col v-else-if="error" :span="6">
      <el-card>
        <el-result icon="error" title="加载失败" :sub-title="error">
          <template #extra>
            <el-button type="primary" @click="retry">重试</el-button>
          </template>
        </el-result>
      </el-card>
    </el-col>

    <el-col v-else :span="6">
      <el-card>
        <el-empty description="暂无数据" />
      </el-card>
    </el-col>
  </el-row>
</template>
```

---

## 常见问题

### 1. 对比数据项布局异常

**问题描述：** 当对比数据项超过 4 个时，布局会换行显示。

**解决方案：** 组件内部使用 `el-col :span="6"` 固定每项占 1/4 宽度，超过 4 个会自动换行。如需更多项，可以考虑使用 footer 插槽自定义布局。

```vue
<template>
  <ADataCard title="多项数据" :data-list="mainData">
    <template #footer>
      <el-row :gutter="8">
        <el-col :span="4" v-for="item in extraData" :key="item.label">
          <div class="text-center p-2">
            <div class="text-xs text-gray-500">{{ item.label }}</div>
            <div class="text-sm font-medium">{{ item.value }}</div>
          </div>
        </el-col>
      </el-row>
    </template>
  </ADataCard>
</template>
```

### 2. 主数据项点击事件不触发

**问题描述：** 点击主数据项（第一项）时，`item-click` 事件不触发。

**原因说明：** 这是设计行为，主数据项作为展示区域，点击事件仅对对比数据项生效。

**解决方案：** 如需主数据可点击，可以在外层包装点击事件：

```vue
<template>
  <div @click="handleMainClick">
    <ADataCard :data-list="dataList" @item-click="handleCompareClick" />
  </div>
</template>
```

### 3. 百分比显示格式不符合预期

**问题描述：** 百分比值显示的小数位数不对。

**解决方案：** 组件内部固定使用 `toFixed(1)` 显示一位小数。如需自定义格式，可以在传入数据时预处理：

```typescript
const formatData = (data: DataItem[]) => {
  return data.map(item => ({
    ...item,
    value: typeof item.value === 'number'
      ? item.value.toLocaleString()
      : item.value,
    // percent 保持原值，由组件内部格式化
  }))
}
```

### 4. 暗黑模式下颜色不正确

**问题描述：** 切换暗黑模式后，部分颜色没有正确适配。

**解决方案：** 确保使用了正确的 CSS 类名或变量：

```vue
<template>
  <ADataCard :data-list="dataList">
    <template #footer>
      <!-- ✅ 正确：使用 dark: 前缀 -->
      <span class="text-gray-500 dark:text-gray-400">说明文字</span>

      <!-- ❌ 错误：硬编码颜色 -->
      <span style="color: #666">说明文字</span>
    </template>
  </ADataCard>
</template>
```

### 5. 在 el-row 外使用导致布局异常

**问题描述：** 不在 `el-row` 内使用组件时，响应式布局不生效。

**原因说明：** 组件内部使用 `el-col` 实现响应式，需要配合 `el-row` 使用。

**解决方案：** 始终在 `el-row` 内使用：

```vue
<template>
  <!-- ✅ 正确 -->
  <el-row :gutter="20">
    <ADataCard :data-list="dataList" />
  </el-row>

  <!-- ❌ 错误 -->
  <div>
    <ADataCard :data-list="dataList" />
  </div>
</template>
```

### 6. 图标不显示

**问题描述：** 设置了 `icon-code` 但图标不显示。

**解决方案：**

1. 确认 `icon-code` 的值在项目图标库中存在
2. 检查 Icon 组件是否正确注册
3. 使用 `icon-value` 作为备选方案

```vue
<template>
  <!-- 方案1：使用项目图标库 -->
  <ADataCard icon-code="user" :data-list="dataList" />

  <!-- 方案2：使用 iconify 图标 -->
  <ADataCard icon-value="carbon:user" :data-list="dataList" />
</template>
```

### 7. 数据更新后视图不刷新

**问题描述：** 修改 `dataList` 数组内容后，卡片显示没有更新。

**解决方案：** 确保使用响应式数据，并正确触发更新：

```typescript
import { ref } from 'vue'

const dataList = ref<DataItem[]>([
  { label: '数据1', value: '100', percent: 5 }
])

// ✅ 正确：替换整个数组
const updateData = () => {
  dataList.value = [
    { label: '数据1', value: '200', percent: 10 }
  ]
}

// ✅ 正确：使用数组方法
const addData = () => {
  dataList.value.push({ label: '数据2', value: '50', percent: 2 })
}

// ❌ 错误：直接修改对象属性（可能不触发更新）
const wrongUpdate = () => {
  dataList.value[0].value = '200'  // 某些情况下可能不更新
}
```

---

## 与其他组件配合

### 与图表组件结合

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="销售趋势"
      icon-code="chart"
      :data-list="salesData"
      :col-config="{ xs: 24, sm: 24, md: 12, lg: 8, xl: 8 }"
    >
      <template #footer>
        <!-- 嵌入迷你图表 -->
        <div ref="chartRef" style="height: 80px"></div>
      </template>
    </ADataCard>
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()

const salesData = [
  { label: '本月销售', value: '¥256,800', percent: 15.6 },
  { label: '上月', value: '¥222,000', percent: 12.3 },
  { label: '环比', value: '+15.7%', percent: 15.7 },
  { label: '同比', value: '+28.3%', percent: 28.3 }
]

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    chart.setOption({
      xAxis: { type: 'category', show: false },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        areaStyle: { opacity: 0.3 }
      }],
      grid: { left: 0, right: 0, top: 0, bottom: 0 }
    })
  }
})
</script>
```

### 与弹窗组件结合

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      title="订单统计"
      icon-code="order"
      :data-list="orderData"
      @item-click="showOrderDetail"
    />
  </el-row>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
    <el-table :data="orderDetail" border>
      <el-table-column prop="orderId" label="订单号" />
      <el-table-column prop="amount" label="金额" />
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="createTime" label="创建时间" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialogVisible = ref(false)
const dialogTitle = ref('')
const orderDetail = ref<any[]>([])

const orderData = [
  { label: '今日订单', value: '328', percent: 12.5 },
  { label: '待处理', value: '45', percent: 8.3 },
  { label: '已完成', value: '268', percent: 15.6 },
  { label: '已取消', value: '15', percent: -5.2 }
]

const showOrderDetail = (item: any, index: number) => {
  dialogTitle.value = `${item.label}详情`
  dialogVisible.value = true
  // 加载详情数据
  loadOrderDetail(item.label)
}

const loadOrderDetail = async (type: string) => {
  // 模拟 API 调用
  orderDetail.value = [
    { orderId: 'ORD001', amount: '¥256', status: '已完成', createTime: '2024-01-15 10:30' },
    { orderId: 'ORD002', amount: '¥128', status: '待处理', createTime: '2024-01-15 11:20' }
  ]
}
</script>
```

---

## 性能考虑

### 大量卡片渲染

当页面有大量数据卡片时，考虑使用虚拟滚动或分页加载：

```vue
<template>
  <el-row :gutter="20">
    <ADataCard
      v-for="(card, index) in visibleCards"
      :key="card.id"
      :title="card.title"
      :icon-code="card.icon"
      :data-list="card.data"
    />
  </el-row>

  <el-pagination
    v-model:current-page="currentPage"
    :page-size="pageSize"
    :total="allCards.length"
    layout="prev, pager, next"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentPage = ref(1)
const pageSize = ref(12)
const allCards = ref([/* 大量卡片数据 */])

const visibleCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return allCards.value.slice(start, start + pageSize.value)
})
</script>
```

### 数据缓存

对于不频繁变化的数据，使用缓存减少重复计算：

```typescript
import { computed } from 'vue'
import { useMemoize } from '@vueuse/core'

const formatValue = useMemoize((value: number) => {
  return value.toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  })
})

const formattedData = computed(() => {
  return rawData.value.map(item => ({
    ...item,
    value: typeof item.value === 'number'
      ? formatValue(item.value)
      : item.value
  }))
})
```

---

## 总结

ADataCard 是一个功能完善的数据展示卡片组件，适用于各类数据仪表盘场景。通过合理的数据结构设计、响应式布局配置和插槽扩展，可以满足绝大多数数据展示需求。

**核心要点：**

1. 数据列表第一项为主数据，其余为对比数据
2. 使用 `col-config` 配置响应式布局
3. 通过 `actions` 和 `footer` 插槽扩展功能
4. 百分比值自动显示趋势图标和颜色
5. 完整支持暗黑模式

建议在使用前先明确数据的逻辑关系，确保主数据和对比数据之间有合理的关联，这样才能发挥组件的最佳展示效果。
