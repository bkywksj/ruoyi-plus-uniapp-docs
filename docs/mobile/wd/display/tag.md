---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/display/tag
---

# Tag 标签

## 介绍

Tag 标签组件用于标记和分类,提供多种预设颜色和样式。Tag 组件支持基础标签、幽灵标签、圆角标签、标记标签、可关闭标签、动态添加标签等多种形态,并内置字典自动映射功能,可根据字典数据自动显示文本和颜色。

**核心特性:**

- **多种类型** - 支持 5 种预设类型:`default`、`primary`、`success`、`warning`、`danger`
- **丰富样式** - 提供幽灵、圆角、标记等多种样式变体
- **字典映射** - 支持字典数据自动翻译和颜色匹配,简化状态标签开发
- **可关闭** - 支持关闭按钮,触发关闭事件
- **动态添加** - 支持动态输入新标签,适用于标签管理场景
- **图标支持** - 支持左侧图标展示,增强视觉表现力
- **自定义颜色** - 支持自定义文字颜色和背景色
- **主题定制** - 通过 CSS 变量轻松定制标签样式

## 基本用法

### 基础标签

最简单的标签用法,通过 `type` 属性设置标签类型。

```vue
<template>
  <view class="demo">
    <wd-tag>默认标签</wd-tag>
    <wd-tag type="primary">主要标签</wd-tag>
    <wd-tag type="success">成功标签</wd-tag>
    <wd-tag type="warning">警告标签</wd-tag>
    <wd-tag type="danger">危险标签</wd-tag>
  </view>
</template>

```

**使用说明:**
- `type="default"` - 默认灰色标签
- `type="primary"` - 蓝色主要标签
- `type="success"` - 绿色成功标签
- `type="warning"` - 橙色警告标签
- `type="danger"` - 红色危险标签

### 幽灵标签

通过 `plain` 属性设置幽灵标签,标签背景透明,带有彩色边框。

```vue
<template>
  <view class="demo">
    <wd-tag plain>默认幽灵</wd-tag>
    <wd-tag type="primary" plain>主要幽灵</wd-tag>
    <wd-tag type="success" plain>成功幽灵</wd-tag>
    <wd-tag type="warning" plain>警告幽灵</wd-tag>
    <wd-tag type="danger" plain>危险幽灵</wd-tag>
  </view>
</template>

<script lang="ts" setup>
// 无需导入,WD UI 已全局注册
</script>

```

**技术实现:**
- 幽灵标签背景透明 `background: transparent`
- 边框颜色与类型颜色一致 `border: 2rpx solid $color`
- 文字颜色与类型颜色一致
- 内边距为 `4rpx 12rpx`

### 圆角标签

通过 `round` 属性设置圆角标签,具有更大的圆角和内边距。

```vue
<template>
  <view class="demo">
    <wd-tag round>默认圆角</wd-tag>
    <wd-tag type="primary" round>主要圆角</wd-tag>
    <wd-tag type="success" round>成功圆角</wd-tag>
    <wd-tag type="warning" round>警告圆角</wd-tag>
    <wd-tag type="danger" round>危险圆角</wd-tag>
  </view>
</template>

```

**技术实现:**
- 圆角标签背景透明
- 圆角半径更大 `border-radius: $-tag-round-radius`
- 内边距增大 `padding: 8rpx 22rpx`
- 字体大小为 `$-tag-fs`
- 边框宽度为 `1rpx`

### 标记标签

通过 `mark` 属性设置标记标签,左侧为圆角,右侧为直角。

```vue
<template>
  <view class="demo">
    <wd-tag mark>默认标记</wd-tag>
    <wd-tag type="primary" mark>主要标记</wd-tag>
    <wd-tag type="success" mark>成功标记</wd-tag>
    <wd-tag type="warning" mark>警告标记</wd-tag>
    <wd-tag type="danger" mark>危险标记</wd-tag>
  </view>
</template>

```

**技术实现:**
- 使用不对称圆角 `border-radius: $-tag-mark-radius`
- 内边距为 `4rpx 12rpx`
- 可与 `plain` 属性组合使用

### 标记幽灵组合

标记和幽灵属性可以组合使用。

```vue
<template>
  <view class="demo">
    <wd-tag mark plain>默认标记幽灵</wd-tag>
    <wd-tag type="primary" mark plain>主要标记幽灵</wd-tag>
    <wd-tag type="success" mark plain>成功标记幽灵</wd-tag>
    <wd-tag type="warning" mark plain>警告标记幽灵</wd-tag>
    <wd-tag type="danger" mark plain>危险标记幽灵</wd-tag>
  </view>
</template>

```

**使用说明:**
- 标记和幽灵属性可叠加
- 保留标记的不对称圆角
- 保留幽灵的透明背景和边框

### 可关闭标签

通过 `closable` 属性设置可关闭标签,仅支持圆角标签。

```vue
<template>
  <view class="demo">
    <wd-tag v-if="visible1" round closable @close="handleClose1">可关闭标签</wd-tag>
    <wd-tag v-if="visible2" type="primary" round closable @close="handleClose2">主要标签</wd-tag>
    <wd-tag v-if="visible3" type="success" round closable @close="handleClose3">成功标签</wd-tag>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible1 = ref(true)
const visible2 = ref(true)
const visible3 = ref(true)

const handleClose1 = () => {
  visible1.value = false
}

const handleClose2 = () => {
  visible2.value = false
}

const handleClose3 = () => {
  visible3.value = false
}
</script>

```

**使用说明:**
- `closable` 属性仅在 `round` 为 `true` 时生效
- 关闭按钮使用 `close-fill` 图标
- 点击关闭按钮触发 `close` 事件
- 需要通过 `v-if` 控制标签的显示/隐藏

**技术实现:**
- 关闭按钮使用 `@click.stop` 阻止事件冒泡
- 关闭按钮尺寸为 `$-tag-close-size`
- 关闭按钮颜色为 `$-tag-close-color`
- 激活状态颜色为 `$-tag-close-active-color`

### 左侧图标

通过 `icon` 属性设置左侧图标。

```vue
<template>
  <view class="demo">
    <wd-tag icon="setting">设置</wd-tag>
    <wd-tag type="primary" icon="star-on">收藏</wd-tag>
    <wd-tag type="success" icon="check-outline">完成</wd-tag>
    <wd-tag type="warning" icon="warning">警告</wd-tag>
    <wd-tag type="danger" icon="close">错误</wd-tag>
  </view>
</template>

```

**技术实现:**
- 图标使用 `wd-icon` 组件渲染
- 图标与文字间距 `margin-right: 6rpx`
- 图标尺寸为 `20rpx`
- 图标行高为 `1`
- 带图标的标签字体大小为 `$-tag-fs`

### 图标插槽

通过 `icon` 插槽自定义左侧图标内容。

```vue
<template>
  <view class="demo">
    <wd-tag use-icon-slot>
      <template #icon>
        <wd-icon name="clock" size="20" />
      </template>
      自定义图标
    </wd-tag>

    <wd-tag type="primary" use-icon-slot>
      <template #icon>
        <wd-icon name="user" size="20" />
      </template>
      用户标签
    </wd-tag>

    <wd-tag type="success" use-icon-slot>
      <template #icon>
        <wd-icon name="check-circle" size="20" />
      </template>
      审核通过
    </wd-tag>
  </view>
</template>

```

**使用说明:**
- 需要设置 `use-icon-slot` 属性为 `true`
- 在 `icon` 插槽中可以放置任意内容
- 插槽内容会自动添加图标样式类

### 自定义颜色

通过 `color` 和 `bg-color` 属性自定义标签颜色。

```vue
<template>
  <view class="demo">
    <!-- 自定义背景色 -->
    <wd-tag bg-color="#f50">自定义红色</wd-tag>
    <wd-tag bg-color="#2db7f5">自定义蓝色</wd-tag>
    <wd-tag bg-color="#87d068">自定义绿色</wd-tag>

    <!-- 自定义背景色和文字色 -->
    <wd-tag bg-color="#f50" color="#fff">红底白字</wd-tag>
    <wd-tag bg-color="#108ee9" color="#fff">蓝底白字</wd-tag>

    <!-- 幽灵标签自定义颜色 -->
    <wd-tag plain bg-color="#f50" color="#f50">红色幽灵</wd-tag>
    <wd-tag plain bg-color="#108ee9" color="#108ee9">蓝色幽灵</wd-tag>
  </view>
</template>

```

**使用说明:**
- `bg-color` - 设置背景色和边框色
- `color` - 设置文字颜色
- 幽灵标签的 `bg-color` 会应用到边框色
- 自定义颜色优先级高于 `type` 属性

**技术实现:**
- 背景色通过内联样式应用:`background: ${bgColor}`
- 边框色通过内联样式应用:`border-color: ${bgColor}`
- 文字颜色通过内联样式应用:`color: ${color}`

### 字典自动映射

通过 `value` 和 `options` 属性实现字典数据的自动翻译和颜色匹配。

```vue
<template>
  <view class="demo">
    <view class="section">
      <text class="title">状态标签(字典映射)</text>
      <view class="tag-list">
        <wd-tag :options="enableStatus" value="1"></wd-tag>
        <wd-tag :options="enableStatus" value="0"></wd-tag>
      </view>
    </view>

    <view class="section">
      <text class="title">订单状态</text>
      <view class="tag-list">
        <wd-tag :options="orderStatus" value="1"></wd-tag>
        <wd-tag :options="orderStatus" value="2"></wd-tag>
        <wd-tag :options="orderStatus" value="3"></wd-tag>
        <wd-tag :options="orderStatus" value="4"></wd-tag>
      </view>
    </view>

    <view class="section">
      <text class="title">用户类型</text>
      <view class="tag-list">
        <wd-tag :options="userType" value="admin"></wd-tag>
        <wd-tag :options="userType" value="user"></wd-tag>
        <wd-tag :options="userType" value="guest"></wd-tag>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 启用状态字典
const enableStatus = ref([
  { label: '正常', value: '1', elTagType: 'success' },
  { label: '停用', value: '0', elTagType: 'danger' },
])

// 订单状态字典
const orderStatus = ref([
  { label: '待付款', value: '1', elTagType: 'warning' },
  { label: '已付款', value: '2', elTagType: 'primary' },
  { label: '已发货', value: '3', elTagType: 'info' },
  { label: '已完成', value: '4', elTagType: 'success' },
])

// 用户类型字典
const userType = ref([
  { label: '管理员', value: 'admin', elTagType: 'danger' },
  { label: '普通用户', value: 'user', elTagType: 'primary' },
  { label: '访客', value: 'guest', elTagType: 'info' },
])
</script>

```

**使用说明:**
- `options` - 字典数据数组,每项包含 `label`、`value`、`elTagType` 字段
- `value` - 当前值,用于匹配字典项
- 组件会自动根据 `value` 查找匹配的字典项
- 自动显示字典项的 `label` 作为文本
- 自动应用字典项的 `elTagType` 作为标签类型

**支持的 elTagType:**
- `primary` - 蓝色(主要)
- `success` - 绿色(成功)
- `warning` - 橙色(警告)
- `danger` - 红色(危险)
- `info` - 灰色(信息,自动映射为 `default`)

**技术实现:**
- 通过 `matchedOption` 计算属性查找匹配的字典项
- 通过 `displayText` 计算属性获取显示文本
- 通过 `computedType` 计算属性获取标签类型
- `info` 类型会自动映射为 `default` 类型

### 直接使用 value

可以直接传入 `value` 属性作为标签文本,而不使用字典。

```vue
<template>
  <view class="demo">
    <wd-tag type="primary" value="标签1"></wd-tag>
    <wd-tag type="success" :value="100"></wd-tag>
    <wd-tag type="warning" :value="dynamicValue"></wd-tag>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const dynamicValue = ref('动态文本')
</script>

```

**使用说明:**
- 不提供 `options` 时,`value` 会直接作为文本显示
- 支持字符串和数字类型
- 优先级低于插槽内容

### 动态添加标签

通过 `dynamic` 属性创建动态添加标签的功能。

```vue
<template>
  <view class="demo">
    <view class="tag-list">
      <wd-tag
        v-for="(tag, index) in tags"
        :key="index"
        round
        closable
        @close="handleRemove(index)"
      >
        {{ tag }}
      </wd-tag>
      <wd-tag dynamic round @confirm="handleAdd"></wd-tag>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tags = ref(['标签一', '标签二', '标签三'])

const handleRemove = (index: number) => {
  tags.value.splice(index, 1)
}

const handleAdd = (data: { value: string }) => {
  if (data.value) {
    tags.value.push(data.value)
  }
}
</script>

```

**使用说明:**
- 设置 `dynamic` 属性后,标签显示为"添加"状态
- 点击标签会显示输入框
- 输入内容后按回车或失焦触发 `confirm` 事件
- 事件参数格式:`{ value: string }`
- 动态标签建议与 `round` 属性组合使用

**技术实现:**
- 动态标签宽度固定为 `176rpx`
- 输入框宽度为 `120rpx`,高度为 `28rpx`
- 输入框自动获得焦点 `focus="true"`
- 失焦和回车都会触发确认事件

### 自定义添加按钮

通过 `add` 插槽自定义动态添加标签的按钮内容。

```vue
<template>
  <view class="demo">
    <view class="tag-list">
      <wd-tag
        v-for="(tag, index) in tags"
        :key="index"
        round
        closable
        @close="handleRemove(index)"
      >
        {{ tag }}
      </wd-tag>
      <wd-tag dynamic round @confirm="handleAdd">
        <template #add>
          <wd-icon name="add-circle" size="20" />
          <text style="margin-left: 4rpx">新增标签</text>
        </template>
      </wd-tag>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tags = ref(['前端', '后端', '全栈'])

const handleRemove = (index: number) => {
  tags.value.splice(index, 1)
}

const handleAdd = (data: { value: string }) => {
  if (data.value) {
    tags.value.push(data.value)
  }
}
</script>

```

**使用说明:**
- 使用 `add` 插槽可以完全自定义添加按钮的内容
- 插槽内容可以包含图标、文字或其他元素
- 插槽内容使用 flex 布局,垂直居中

## 实战案例

### 案例1: 文章标签管理

实现文章标签的展示、添加和删除功能。

```vue
<template>
  <view class="article-tags">
    <view class="label">文章标签:</view>
    <view class="tag-container">
      <wd-tag
        v-for="(tag, index) in articleTags"
        :key="index"
        type="primary"
        round
        closable
        @close="removeTag(index)"
      >
        {{ tag }}
      </wd-tag>
      <wd-tag
        v-if="articleTags.length < 5"
        dynamic
        round
        type="primary"
        plain
        @confirm="addTag"
      >
      </wd-tag>
    </view>
    <view v-if="articleTags.length >= 5" class="tip">最多添加5个标签</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/hooks/useToast'

const { showToast } = useToast()
const articleTags = ref(['前端开发', 'Vue3', 'TypeScript'])

const removeTag = (index: number) => {
  articleTags.value.splice(index, 1)
  showToast('标签已删除')
}

const addTag = (data: { value: string }) => {
  const newTag = data.value.trim()

  if (!newTag) {
    showToast('标签不能为空')
    return
  }

  if (articleTags.value.includes(newTag)) {
    showToast('标签已存在')
    return
  }

  if (articleTags.value.length >= 5) {
    showToast('最多添加5个标签')
    return
  }

  articleTags.value.push(newTag)
  showToast('标签添加成功')
}
</script>

```

**功能说明:**
- 文章标签最多5个
- 重复标签不允许添加
- 空标签不允许添加
- 删除和添加都有提示反馈

### 案例2: 商品属性选择器

使用标签实现商品属性的多选功能。

```vue
<template>
  <view class="product-attrs">
    <view class="attr-group">
      <view class="attr-label">颜色:</view>
      <view class="attr-tags">
        <wd-tag
          v-for="color in colors"
          :key="color.value"
          round
          :plain="selectedColor !== color.value"
          :type="selectedColor === color.value ? 'primary' : 'default'"
          @click="selectColor(color.value)"
        >
          {{ color.label }}
        </wd-tag>
      </view>
    </view>

    <view class="attr-group">
      <view class="attr-label">尺寸:</view>
      <view class="attr-tags">
        <wd-tag
          v-for="size in sizes"
          :key="size.value"
          round
          :plain="selectedSize !== size.value"
          :type="selectedSize === size.value ? 'primary' : 'default'"
          @click="selectSize(size.value)"
        >
          {{ size.label }}
        </wd-tag>
      </view>
    </view>

    <view class="selected-info">
      已选择: {{ selectedColor }} / {{ selectedSize }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const colors = ref([
  { label: '黑色', value: '黑色' },
  { label: '白色', value: '白色' },
  { label: '蓝色', value: '蓝色' },
  { label: '红色', value: '红色' },
])

const sizes = ref([
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
])

const selectedColor = ref('黑色')
const selectedSize = ref('M')

const selectColor = (color: string) => {
  selectedColor.value = color
}

const selectSize = (size: string) => {
  selectedSize.value = size
}
</script>

```

**功能说明:**
- 通过幽灵标签和实心标签区分选中状态
- 选中的标签使用 `primary` 类型
- 未选中的标签使用幽灵样式
- 点击标签切换选中状态

### 案例3: 订单状态流转

展示订单状态的流转过程。

```vue
<template>
  <view class="order-status">
    <view class="order-item" v-for="order in orders" :key="order.id">
      <view class="order-info">
        <view class="order-id">订单号: {{ order.id }}</view>
        <view class="order-time">{{ order.time }}</view>
      </view>
      <wd-tag :options="orderStatusDict" :value="order.status"></wd-tag>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const orderStatusDict = ref([
  { label: '待付款', value: 1, elTagType: 'warning' },
  { label: '待发货', value: 2, elTagType: 'primary' },
  { label: '待收货', value: 3, elTagType: 'info' },
  { label: '已完成', value: 4, elTagType: 'success' },
  { label: '已取消', value: 5, elTagType: 'danger' },
])

const orders = ref([
  { id: '2024010112345', status: 1, time: '2024-01-01 10:30' },
  { id: '2024010112346', status: 2, time: '2024-01-01 11:20' },
  { id: '2024010112347', status: 3, time: '2024-01-01 12:10' },
  { id: '2024010112348', status: 4, time: '2024-01-01 13:00' },
  { id: '2024010112349', status: 5, time: '2024-01-01 14:30' },
])
</script>

```

**功能说明:**
- 使用字典自动映射订单状态
- 不同状态自动显示不同颜色
- 简化状态标签的开发和维护

### 案例4: 筛选条件标签

实现可删除的筛选条件标签。

```vue
<template>
  <view class="filter-tags">
    <view class="section">
      <view class="label">筛选条件:</view>
      <view class="tags">
        <wd-tag
          v-for="(filter, index) in activeFilters"
          :key="index"
          type="primary"
          round
          closable
          @close="removeFilter(index)"
        >
          {{ filter.label }}: {{ filter.value }}
        </wd-tag>
        <wd-tag v-if="activeFilters.length > 0" type="danger" plain round @click="clearAll">
          清空全部
        </wd-tag>
      </view>
    </view>

    <view class="section">
      <view class="label">搜索结果: {{ resultCount }} 条</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Filter {
  label: string
  value: string
}

const activeFilters = ref<Filter[]>([
  { label: '分类', value: '电子产品' },
  { label: '价格', value: '100-500元' },
  { label: '品牌', value: '苹果' },
])

const resultCount = computed(() => {
  return 128 - activeFilters.value.length * 20
})

const removeFilter = (index: number) => {
  activeFilters.value.splice(index, 1)
}

const clearAll = () => {
  activeFilters.value = []
}
</script>

```

**功能说明:**
- 动态展示筛选条件
- 每个条件都可以单独删除
- 提供清空全部按钮
- 实时更新搜索结果数量

### 案例5: 热门标签推荐

展示热门标签并支持点击选择。

```vue
<template>
  <view class="hot-tags">
    <view class="section-title">热门标签</view>
    <view class="tags-container">
      <wd-tag
        v-for="tag in hotTags"
        :key="tag.id"
        :type="tag.selected ? 'primary' : 'default'"
        :plain="!tag.selected"
        round
        @click="toggleTag(tag.id)"
      >
        <view class="tag-content">
          <text>{{ tag.name }}</text>
          <text class="tag-count">({{ tag.count }})</text>
        </view>
      </wd-tag>
    </view>
    <view class="selected-count">已选择 {{ selectedCount }} 个标签</view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface HotTag {
  id: number
  name: string
  count: number
  selected: boolean
}

const hotTags = ref<HotTag[]>([
  { id: 1, name: 'Vue3', count: 1234, selected: false },
  { id: 2, name: 'React', count: 2345, selected: false },
  { id: 3, name: 'TypeScript', count: 3456, selected: false },
  { id: 4, name: 'UniApp', count: 567, selected: false },
  { id: 5, name: '小程序', count: 890, selected: false },
  { id: 6, name: 'Vite', count: 678, selected: false },
  { id: 7, name: 'Node.js', count: 1890, selected: false },
  { id: 8, name: 'Docker', count: 456, selected: false },
])

const selectedCount = computed(() => {
  return hotTags.value.filter((tag) => tag.selected).length
})

const toggleTag = (id: number) => {
  const tag = hotTags.value.find((t) => t.id === id)
  if (tag) {
    tag.selected = !tag.selected
  }
}
</script>

```

**功能说明:**
- 展示热门标签及其使用次数
- 点击标签切换选中状态
- 实时统计已选择的标签数量
- 通过幽灵样式区分选中/未选中状态

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 标签类型,可选值:`default` / `primary` / `success` / `warning` / `danger` | `TagType` | `'default'` |
| plain | 是否为幽灵标签(透明背景,彩色边框) | `boolean` | `false` |
| round | 是否为圆角标签 | `boolean` | `false` |
| mark | 是否为标记标签(左圆右方) | `boolean` | `false` |
| closable | 是否可关闭(仅支持圆角标签) | `boolean` | `false` |
| icon | 左侧图标名称 | `string` | `''` |
| use-icon-slot | 是否使用图标插槽 | `boolean` | `false` |
| dynamic | 是否为动态添加标签 | `boolean` | `false` |
| color | 自定义文字颜色 | `string` | `''` |
| bg-color | 自定义背景色和边框色 | `string` | `''` |
| value | 显示的值(支持字典翻译) | `string \| number` | `undefined` |
| options | 字典选项数组,用于值翻译和颜色匹配 | `Array<DictItem>` | `[]` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击标签时触发 | `event: Event` |
| close | 点击关闭按钮时触发 | `event: Event` |
| confirm | 动态添加标签确认时触发 | `data: { value: string }` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标签文本内容 |
| icon | 自定义左侧图标 |
| add | 自定义动态添加标签的按钮内容 |

### 类型定义

```typescript
/**
 * 标签类型
 */
export type TagType = 'default' | 'primary' | 'success' | 'warning' | 'danger'

/**
 * 字典项接口
 */
interface DictItem {
  /** 显示文本 */
  label: string
  /** 值 */
  value: string | number
  /** Element UI 标签类型(可选) */
  elTagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

/**
 * 标签组件属性接口
 */
interface WdTagProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 是否开启图标插槽 */
  useIconSlot?: boolean
  /** 标签类型 */
  type?: TagType
  /** 左侧图标 */
  icon?: string
  /** 是否可关闭 */
  closable?: boolean
  /** 幽灵类型 */
  plain?: boolean
  /** 是否为新增标签 */
  dynamic?: boolean
  /** 文字颜色 */
  color?: string
  /** 背景色和边框色 */
  bgColor?: string
  /** 圆角类型 */
  round?: boolean
  /** 标记类型 */
  mark?: boolean
  /** 显示的值 */
  value?: string | number
  /** 字典选项数组 */
  options?: Array<DictItem>
}

/**
 * 标签组件事件接口
 */
interface WdTagEmits {
  /** 点击标签时触发 */
  click: [event: Event]
  /** 点击关闭按钮时触发 */
  close: [event: Event]
  /** 新增标签确认时触发 */
  confirm: [data: { value: string }]
}
```

## 主题定制

### CSS 变量

Tag 组件提供了以下 CSS 变量用于主题定制:

```scss
// 标签尺寸
$-tag-small-fs: 20rpx;        // 小号字体大小
$-tag-fs: 24rpx;              // 标准字体大小

// 默认类型
$-tag-color: #323233;         // 默认文字颜色
$-tag-info-color: #909399;    // 默认类型主色
$-tag-info-bg: #f4f4f5;       // 默认类型背景色

// 主要类型
$-tag-primary-color: #1890ff; // 主要类型颜色
$-tag-primary-bg: #e6f7ff;    // 主要类型背景色

// 成功类型
$-tag-success-color: #52c41a; // 成功类型颜色
$-tag-success-bg: #f6ffed;    // 成功类型背景色

// 警告类型
$-tag-warning-color: #faad14; // 警告类型颜色
$-tag-warning-bg: #fffbe6;    // 警告类型背景色

// 危险类型
$-tag-danger-color: #ff4d4f;  // 危险类型颜色
$-tag-danger-bg: #fff1f0;     // 危险类型背景色

// 圆角标签
$-tag-round-radius: 30rpx;    // 圆角半径
$-tag-round-color: #606266;   // 圆角标签文字颜色
$-tag-round-border-color: #dcdfe6; // 圆角标签边框颜色

// 标记标签
$-tag-mark-radius: 0 8rpx 8rpx 0; // 标记标签圆角(左直右圆)

// 关闭按钮
$-tag-close-size: 24rpx;           // 关闭按钮大小
$-tag-close-color: #909399;        // 关闭按钮颜色
$-tag-close-active-color: #606266; // 关闭按钮激活颜色
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-tag class="custom-tag" type="primary">自定义主题标签</wd-tag>
  </view>
</template>

```

### 暗黑模式支持

Tag 组件在暗黑模式下会自动调整颜色:

```scss
@media (prefers-color-scheme: dark) {
  .wd-tag {
    // 默认类型
    &.is-default {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.65);
    }

    // 其他类型颜色自动调整透明度和亮度
    &.is-primary {
      background: rgba(24, 144, 255, 0.15);
    }

    // 圆角标签边框
    &.is-round {
      border-color: rgba(255, 255, 255, 0.15);
    }
  }
}
```

## 最佳实践

### 1. 合理选择标签类型

```vue
<!-- ✅ 好的示例:根据语义选择类型 -->
<wd-tag type="success">审核通过</wd-tag>
<wd-tag type="danger">审核拒绝</wd-tag>
<wd-tag type="warning">待审核</wd-tag>
<wd-tag type="primary">进行中</wd-tag>
<wd-tag type="default">已完成</wd-tag>

<!-- ❌ 不好的示例:类型与语义不符 -->
<wd-tag type="danger">审核通过</wd-tag>
<wd-tag type="success">审核拒绝</wd-tag>
```

**说明:**
- `success` 用于成功、通过、启用等积极状态
- `danger` 用于失败、拒绝、禁用等消极状态
- `warning` 用于警告、待处理等中间状态
- `primary` 用于重要、进行中等强调状态
- `default` 用于普通、完成等常规状态

### 2. 优先使用字典映射

```vue
<!-- ✅ 好的示例:使用字典映射 -->
<template>
  <wd-tag :options="statusDict" :value="order.status"></wd-tag>
</template>

<script lang="ts" setup>
const statusDict = [
  { label: '待付款', value: 1, elTagType: 'warning' },
  { label: '已付款', value: 2, elTagType: 'success' },
]
</script>

<!-- ❌ 不好的示例:硬编码判断 -->
<template>
  <wd-tag :type="getStatusType(order.status)">
    {{ getStatusText(order.status) }}
  </wd-tag>
</template>

<script lang="ts" setup>
const getStatusType = (status: number) => {
  if (status === 1) return 'warning'
  if (status === 2) return 'success'
  return 'default'
}

const getStatusText = (status: number) => {
  if (status === 1) return '待付款'
  if (status === 2) return '已付款'
  return '未知'
}
</script>
```

**优势:**
- 代码更简洁,易于维护
- 字典数据可以统一管理
- 减少重复代码
- 便于国际化

### 3. 合理使用样式组合

```vue
<!-- ✅ 好的示例:根据场景选择样式 -->
<!-- 常规列表展示 -->
<wd-tag type="primary">标签</wd-tag>

<!-- 可操作的标签(如筛选条件) -->
<wd-tag type="primary" round closable>标签</wd-tag>

<!-- 页面角标 -->
<wd-tag mark>热门</wd-tag>

<!-- 轮廓标签(降低视觉权重) -->
<wd-tag type="primary" plain>标签</wd-tag>

<!-- ❌ 不好的示例:样式组合不当 -->
<!-- closable 只对 round 生效,这样写无效 -->
<wd-tag type="primary" closable>标签</wd-tag>

<!-- mark 和 round 组合无意义 -->
<wd-tag mark round>标签</wd-tag>
```

**说明:**
- `closable` 必须与 `round` 组合使用
- `mark` 和 `round` 互斥,不要同时使用
- `plain` 适合降低视觉权重的场景
- `round` 适合可交互的标签

### 4. 动态标签的用户体验

```vue
<!-- ✅ 好的示例:完整的交互反馈 -->
<template>
  <view class="tag-list">
    <wd-tag
      v-for="(tag, index) in tags"
      :key="index"
      round
      closable
      @close="handleRemove(index)"
    >
      {{ tag }}
    </wd-tag>
    <wd-tag v-if="tags.length < maxCount" dynamic round @confirm="handleAdd"></wd-tag>
  </view>
  <view class="tip">{{ tags.length }}/{{ maxCount }}</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/hooks/useToast'

const { showToast } = useToast()
const maxCount = 5
const tags = ref(['标签1'])

const handleRemove = (index: number) => {
  tags.value.splice(index, 1)
  showToast('删除成功')
}

const handleAdd = (data: { value: string }) => {
  const newTag = data.value.trim()

  if (!newTag) {
    showToast('标签不能为空')
    return
  }

  if (tags.value.includes(newTag)) {
    showToast('标签已存在')
    return
  }

  if (tags.value.length >= maxCount) {
    showToast(`最多添加${maxCount}个标签`)
    return
  }

  tags.value.push(newTag)
  showToast('添加成功')
}
</script>

<!-- ❌ 不好的示例:缺少限制和反馈 -->
<template>
  <wd-tag
    v-for="(tag, index) in tags"
    :key="index"
    round
    closable
    @close="tags.splice(index, 1)"
  >
    {{ tag }}
  </wd-tag>
  <wd-tag dynamic round @confirm="(e) => tags.push(e.value)"></wd-tag>
</template>
```

**说明:**
- 限制标签数量上限
- 验证标签内容(空值、重复等)
- 提供操作反馈(成功/失败提示)
- 显示当前数量和上限

## 常见问题

### 1. 为什么 closable 属性不生效?

**问题原因:**
- `closable` 属性仅在 `round` 为 `true` 时生效
- 非圆角标签不支持关闭按钮

**解决方案:**

```vue
<!-- ✅ 正确:同时设置 round 和 closable -->
<wd-tag round closable @close="handleClose">可关闭标签</wd-tag>

<!-- ❌ 错误:只设置 closable -->
<wd-tag closable @close="handleClose">标签</wd-tag>
```

### 2. 字典映射不显示颜色

**问题原因:**
- 字典项缺少 `elTagType` 字段
- `elTagType` 的值不在支持的类型范围内
- `value` 和字典项的 `value` 类型不匹配

**解决方案:**

```vue
<template>
  <wd-tag :options="statusDict" :value="status"></wd-tag>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// ✅ 正确的字典格式
const statusDict = ref([
  {
    label: '正常',
    value: '1', // 确保类型一致
    elTagType: 'success', // 必须是支持的类型
  },
  {
    label: '停用',
    value: '0',
    elTagType: 'danger',
  },
])

const status = ref('1') // 类型要与字典项的 value 一致

// ❌ 错误:缺少 elTagType
const badDict = ref([
  { label: '正常', value: '1' }, // 缺少 elTagType
])

// ❌ 错误:类型不匹配
const status2 = ref(1) // 数字类型
const dict2 = [{ label: '正常', value: '1' }] // 字符串类型
</script>
```

**支持的 elTagType 值:**
- `primary` - 蓝色
- `success` - 绿色
- `warning` - 橙色
- `danger` - 红色
- `info` - 灰色(自动映射为 `default`)

### 3. 动态标签输入框不显示

**问题原因:**
- 未设置 `dynamic` 属性
- 点击事件被阻止
- 父元素阻止了输入框的显示

**解决方案:**

```vue
<!-- ✅ 正确:设置 dynamic 属性 -->
<wd-tag dynamic round @confirm="handleAdd"></wd-tag>

<!-- ❌ 错误:缺少 dynamic 属性 -->
<wd-tag round @confirm="handleAdd"></wd-tag>

<!-- ✅ 正确:确保父元素不阻止交互 -->
<view class="tag-list">
  <wd-tag dynamic round @confirm="handleAdd"></wd-tag>
</view>

<!-- ❌ 错误:父元素阻止点击 -->
<view class="tag-list" @click.stop="">
  <wd-tag dynamic round @confirm="handleAdd"></wd-tag>
</view>
```

### 4. 自定义颜色在幽灵标签上不生效

**问题原因:**
- 幽灵标签的背景是透明的,`bg-color` 只应用到边框
- 文字颜色需要单独设置 `color` 属性

**解决方案:**

```vue
<!-- ✅ 正确:同时设置 bg-color 和 color -->
<wd-tag plain bg-color="#f50" color="#f50">红色幽灵</wd-tag>

<!-- ❌ 错误:只设置 bg-color -->
<wd-tag plain bg-color="#f50">标签</wd-tag>

<!-- ✅ 正确:实心标签只需要 bg-color -->
<wd-tag bg-color="#f50">红色标签</wd-tag>
```

**说明:**
- 实心标签:`bg-color` 设置背景色和边框色
- 幽灵标签:`bg-color` 只设置边框色,需要 `color` 设置文字颜色

### 5. 标签图标和文字不对齐

**问题原因:**
- 图标大小设置不当
- 自定义图标未设置正确的样式

**解决方案:**

```vue
<!-- ✅ 正确:使用内置图标 -->
<wd-tag icon="star-on">收藏</wd-tag>

<!-- ✅ 正确:使用图标插槽,设置合适的尺寸 -->
<wd-tag use-icon-slot>
  <template #icon>
    <wd-icon name="clock" size="20" />
  </template>
  自定义图标
</wd-tag>

<!-- ❌ 错误:图标尺寸过大 -->
<wd-tag use-icon-slot>
  <template #icon>
    <wd-icon name="clock" size="40" />
  </template>
  自定义图标
</wd-tag>

<!-- ✅ 正确:自定义内容使用 flex 对齐 -->
<wd-tag use-icon-slot>
  <template #icon>
    <view style="display: flex; align-items: center">
      <image src="/icon.png" style="width: 20rpx; height: 20rpx" />
    </view>
  </template>
  图片图标
</wd-tag>
```

**建议:**
- 图标尺寸建议为 `20rpx`
- 自定义图标内容使用 flex 布局对齐
- 保持图标和文字的视觉平衡
