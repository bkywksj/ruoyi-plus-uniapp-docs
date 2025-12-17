---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/search
---

# Search 搜索框

## 介绍

Search 搜索框组件是一个专业的搜索输入控件,提供了完整的搜索交互体验。组件支持输入、搜索、清空、取消等操作,广泛应用于商品搜索、内容检索、数据筛选等场景。通过精心设计的交互细节和视觉效果,为用户提供流畅、直观的搜索体验。

组件采用 Vue 3 Composition API 和 TypeScript 构建,实现了灵活的占位符显示机制和聚焦控制策略。支持浅色和深色两种主题模式,提供丰富的自定义选项,可以满足各种 UI 设计需求。组件还支持前置/后置插槽,方便扩展功能,如添加筛选按钮、语音搜索等。

**核心特性:**

- **智能占位符** - 创新的占位符显示机制,输入框为空时居中显示占位符,有内容时自动切换为左侧对齐,提供更好的视觉引导
- **双重搜索触发** - 支持点击键盘搜索按钮和右侧取消按钮两种搜索触发方式,适配不同操作习惯
- **自动聚焦控制** - 提供 `focus` 属性支持自动聚焦,配合 `focusWhenClear` 实现清空后重新聚焦,优化连续搜索体验
- **清空功能** - 有输入内容时自动显示清除按钮,一键清空所有输入,支持清空后聚焦配置
- **主题切换** - 支持浅色(`light`)和深色两种主题模式,浅色主题适合独立搜索页面,深色主题适合嵌入页面头部
- **灵活布局** - 支持隐藏取消按钮(`hideCancel`)、自定义占位符位置(`placeholderLeft`)等布局选项
- **圆角定制** - 通过 `radius` 属性自定义搜索框圆角大小,适配不同设计风格
- **插槽扩展** - 提供前置(`prefix`)和后置(`suffix`)插槽,支持添加自定义内容如图标、按钮等
- **完整事件** - 提供 `search`、`change`、`focus`、`blur`、`clear`、`cancel` 等完整事件,满足各种交互需求
- **国际化支持** - 内置多语言支持,占位符和取消按钮文字可自动翻译

参考: src/wd/components/wd-search/wd-search.vue:1-89

## 基本用法

### 基础搜索框

最简单的用法,支持输入和搜索操作。

```vue
<template>
  <view class="demo">
    <wd-search
      v-model="value"
      placeholder="请输入搜索关键词"
      @search="handleSearch"
    />
    <view class="result">搜索内容: {{ value }}</view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')

const handleSearch = ({ value: searchValue }: { value: string }) => {
  console.log('搜索:', searchValue)
  uni.showToast({ title: `搜索: ${searchValue}`, icon: 'none' })
}
</script>

```

**使用说明:**
- 组件默认显示居中的占位符,点击后展开输入框
- 点击键盘右下角的"搜索"按钮触发 `search` 事件
- 有输入内容时右侧自动显示清除按钮
- 右侧显示"取消"按钮,点击触发 `cancel` 事件

参考: src/wd/components/wd-search/wd-search.vue:151-165

### 隐藏取消按钮

使用 `hide-cancel` 属性隐藏右侧的取消按钮,适用于不需要取消操作的场景。

```vue
<template>
  <view class="demo">
    <wd-search
      v-model="value1"
      placeholder="搜索商品"
      hide-cancel
      @search="handleSearch"
    />

    <view class="divider" />

    <wd-search
      v-model="value2"
      placeholder="搜索内容"
      @search="handleSearch"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')

const handleSearch = ({ value }: { value: string }) => {
  console.log('搜索:', value)
}
</script>

```

**使用说明:**
- `hide-cancel` 为 `true` 时隐藏取消按钮,组件右侧留出更多空间
- 隐藏取消按钮后,用户只能通过键盘搜索按钮或失焦来结束输入
- 适用于搜索框嵌入页面内部,而非独立搜索页面的场景

参考: src/wd/components/wd-search/wd-search.vue:110-111

### 浅色主题

使用 `light` 属性启用浅色主题,搜索框背景为白色。

```vue
<template>
  <view class="demo">
    <view class="dark-bg">
      <wd-search
        v-model="value"
        light
        placeholder="浅色主题搜索"
        @search="handleSearch"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')

const handleSearch = ({ value }: { value: string }) => {
  console.log('搜索:', value)
}
</script>

```

**使用说明:**
- `light` 为 `true` 时,搜索框输入区域背景为白色
- 默认(非 light 模式)下,输入区域背景为浅灰色
- 浅色主题适合深色背景页面,如独立搜索页面的顶部

参考: src/wd/components/wd-search/wd-search.vue:108-109

### 占位符左对齐

使用 `placeholder-left` 属性使占位符始终左对齐显示。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">居中占位符(默认):</view>
      <wd-search
        v-model="value1"
        placeholder="请输入搜索关键词"
        hide-cancel
      />
    </view>

    <view class="demo-item">
      <view class="label">左对齐占位符:</view>
      <wd-search
        v-model="value2"
        placeholder="请输入搜索关键词"
        placeholder-left
        hide-cancel
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

```

**技术实现:**
- 默认情况下,占位符通过覆盖层实现居中显示,点击后切换为真实输入框
- `placeholder-left` 为 `true` 时,始终显示真实输入框,占位符左对齐
- 左对齐模式更符合传统输入框交互,居中模式更突出搜索功能

参考: src/wd/components/wd-search/wd-search.vue:116-117

### 自动聚焦

使用 `focus` 属性实现自动聚焦,页面加载时自动弹出键盘。

```vue
<template>
  <view class="demo">
    <wd-search
      v-model="value"
      placeholder="自动聚焦"
      focus
      @search="handleSearch"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')

const handleSearch = ({ value }: { value: string }) => {
  console.log('搜索:', value)
}
</script>

```

**使用说明:**
- `focus` 为 `true` 时,组件加载完成后自动聚焦输入框
- 自动聚焦会触发键盘弹出,适用于独立搜索页面
- 如果页面有多个输入框,建议只对主要搜索框设置自动聚焦

参考: src/wd/components/wd-search/wd-search.vue:228-246

### 清空后聚焦

使用 `focus-when-clear` 属性实现清空后自动重新聚焦。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">清空后不聚焦(默认):</view>
      <wd-search
        v-model="value1"
        placeholder="清空后失焦"
        hide-cancel
      />
    </view>

    <view class="demo-item">
      <view class="label">清空后聚焦:</view>
      <wd-search
        v-model="value2"
        placeholder="清空后保持聚焦"
        focus-when-clear
        hide-cancel
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

```

**使用说明:**
- `focus-when-clear` 为 `true` 时,点击清除按钮后输入框保持聚焦状态
- 默认情况下,清除后输入框失焦,隐藏键盘
- 适用于需要连续搜索的场景,用户清空后可以立即输入新内容

参考: src/wd/components/wd-search/wd-search.vue:264-285

### 禁用状态

使用 `disabled` 属性禁用搜索框。

```vue
<template>
  <view class="demo">
    <wd-search
      v-model="value"
      placeholder="搜索已禁用"
      disabled
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

```

**使用说明:**
- `disabled` 为 `true` 时,输入框无法点击和输入
- 禁用状态下,清除按钮、取消按钮等交互功能全部失效
- 适用于搜索功能暂时不可用的场景

参考: src/wd/components/wd-search/wd-search.vue:112-113

## 高级用法

### 自定义圆角

使用 `radius` 属性自定义搜索框圆角大小。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">默认圆角(32rpx):</view>
      <wd-search
        v-model="value1"
        placeholder="默认圆角"
        hide-cancel
      />
    </view>

    <view class="demo-item">
      <view class="label">小圆角(8rpx):</view>
      <wd-search
        v-model="value2"
        placeholder="小圆角"
        :radius="8"
        hide-cancel
      />
    </view>

    <view class="demo-item">
      <view class="label">直角(0rpx):</view>
      <wd-search
        v-model="value3"
        placeholder="直角"
        :radius="0"
        hide-cancel
      />
    </view>

    <view class="demo-item">
      <view class="label">超大圆角(60rpx):</view>
      <wd-search
        v-model="value4"
        placeholder="超大圆角"
        :radius="60"
        hide-cancel
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')
const value4 = ref('')
</script>

```

**使用说明:**
- `radius` 默认值为 32rpx,提供较大的圆角效果
- 值可以是数字(单位 rpx)或字符串(如 `'16rpx'`, `'8px'`)
- 圆角大小会影响搜索框的视觉风格,选择合适的值以匹配整体设计

参考: src/wd/components/wd-search/wd-search.vue:126-127

### 自定义占位符样式

使用 `placeholder-style` 和 `placeholder-class` 属性自定义占位符样式。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">自定义颜色和字号:</view>
      <wd-search
        v-model="value1"
        placeholder="红色占位符"
        placeholder-style="color: #ff4d4f; font-size: 32rpx; font-weight: bold;"
        hide-cancel
      />
    </view>

    <view class="demo-item">
      <view class="label">使用样式类:</view>
      <wd-search
        v-model="value2"
        placeholder="蓝色占位符"
        placeholder-class="custom-placeholder"
        hide-cancel
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

```

**使用说明:**
- `placeholder-style` 支持内联样式字符串,可设置 `color`、`font-size`、`font-weight`
- `placeholder-class` 支持自定义样式类,需要添加 `!important` 提升优先级
- 样式同时应用于覆盖层和真实输入框的占位符

参考: src/wd/components/wd-search/wd-search.vue:122-125

### 最大长度限制

使用 `maxlength` 属性限制输入的最大字符数。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">限制10个字符:</view>
      <wd-search
        v-model="value1"
        placeholder="最多10个字符"
        :maxlength="10"
        hide-cancel
      />
      <view class="tip">当前长度: {{ value1.length }}/10</view>
    </view>

    <view class="demo-item">
      <view class="label">限制20个字符:</view>
      <wd-search
        v-model="value2"
        placeholder="最多20个字符"
        :maxlength="20"
        hide-cancel
      />
      <view class="tip">当前长度: {{ value2.length }}/20</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

```

**使用说明:**
- `maxlength` 默认值为 -1,表示无限制
- 设置为正整数时,输入字符数达到限制后无法继续输入
- 适用于搜索关键词有长度要求的场景,如商品编号、订单号等

参考: src/wd/components/wd-search/wd-search.vue:114-115

### 前置插槽

使用 `prefix` 插槽在搜索框前面添加自定义内容。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">前置图标:</view>
      <wd-search
        v-model="value1"
        placeholder="搜索商品"
        hide-cancel
      >
        <template #prefix>
          <view class="prefix-icon">
            <wd-icon name="filter" size="40rpx" />
          </view>
        </template>
      </wd-search>
    </view>

    <view class="demo-item">
      <view class="label">前置文字:</view>
      <wd-search
        v-model="value2"
        placeholder="搜索内容"
        hide-cancel
      >
        <template #prefix>
          <view class="prefix-text">全站</view>
        </template>
      </wd-search>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>

```

**使用说明:**
- `prefix` 插槽内容显示在搜索输入区域的左侧
- 可以添加图标、文字、选择器等自定义内容
- 常用于添加分类筛选、范围选择等功能

参考: src/wd/components/wd-search/wd-search.vue:10-11

### 自定义取消按钮

使用 `suffix` 插槽自定义取消按钮的样式和内容。

```vue
<template>
  <view class="demo">
    <view class="demo-item">
      <view class="label">自定义文字:</view>
      <wd-search
        v-model="value1"
        placeholder="搜索"
        cancel-txt="搜索"
        @cancel="handleSearch"
      />
    </view>

    <view class="demo-item">
      <view class="label">自定义按钮:</view>
      <wd-search
        v-model="value2"
        placeholder="搜索"
      >
        <template #suffix>
          <wd-button
            type="primary"
            size="small"
            @click="handleCustomSearch"
          >
            搜索
          </wd-button>
        </template>
      </wd-search>
    </view>

    <view class="demo-item">
      <view class="label">图标按钮:</view>
      <wd-search
        v-model="value3"
        placeholder="搜索"
      >
        <template #suffix>
          <view class="suffix-icon" @click="handleIconClick">
            <wd-icon name="voice" size="48rpx" color="#4d80f0" />
          </view>
        </template>
      </wd-search>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')

const handleSearch = () => {
  console.log('搜索')
  uni.showToast({ title: '开始搜索', icon: 'none' })
}

const handleCustomSearch = () => {
  console.log('自定义搜索')
  uni.showToast({ title: `搜索: ${value2.value}`, icon: 'none' })
}

const handleIconClick = () => {
  uni.showToast({ title: '语音搜索', icon: 'none' })
}
</script>

```

**使用说明:**
- 使用 `cancel-txt` 属性可以快速修改取消按钮的文字
- 使用 `suffix` 插槽可以完全自定义右侧内容
- 插槽内容会替换默认的取消按钮,需要自行处理点击事件

参考: src/wd/components/wd-search/wd-search.vue:67-72

### 搜索历史记录

结合搜索框实现搜索历史记录功能。

```vue
<template>
  <view class="demo">
    <wd-search
      v-model="keyword"
      placeholder="搜索商品"
      @search="handleSearch"
      @focus="showHistory = true"
      @cancel="showHistory = false"
    />

    <!-- 搜索历史 -->
    <view v-if="showHistory && searchHistory.length > 0" class="history">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <wd-icon name="delete" @click="clearHistory" />
      </view>
      <view class="history-list">
        <view
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          @click="selectHistory(item)"
        >
          <wd-icon name="clock" custom-class="history-icon" />
          <text class="history-text">{{ item }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('')
const showHistory = ref(false)
const searchHistory = ref<string[]>([
  'iPhone 15',
  '华为 Mate 60',
  '小米14',
  'MacBook Pro'
])

const handleSearch = ({ value }: { value: string }) => {
  if (!value) return

  // 添加到历史记录
  const index = searchHistory.value.indexOf(value)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(value)

  // 最多保存10条
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop()
  }

  showHistory.value = false
  console.log('搜索:', value)
  uni.showToast({ title: `搜索: ${value}`, icon: 'none' })
}

const selectHistory = (item: string) => {
  keyword.value = item
  handleSearch({ value: item })
}

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定清空搜索历史吗?',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = []
      }
    }
  })
}
</script>

```

**技术实现:**
- 监听 `focus` 事件显示搜索历史,`cancel` 事件隐藏历史
- 监听 `search` 事件将关键词添加到历史记录
- 历史记录存储在响应式数组中,实际项目应存储到本地存储
- 点击历史项直接填充到搜索框并触发搜索

参考: src/wd/components/wd-search/wd-search.vue:299-337

### 搜索联想

结合搜索框实现搜索关键词联想功能。

```vue
<template>
  <view class="demo">
    <wd-search
      v-model="keyword"
      placeholder="搜索商品"
      @change="handleChange"
      @search="handleSearch"
      @focus="showSuggest = true"
      @cancel="showSuggest = false"
    />

    <!-- 联想列表 -->
    <view v-if="showSuggest && suggestions.length > 0" class="suggest">
      <view
        v-for="(item, index) in suggestions"
        :key="index"
        class="suggest-item"
        @click="selectSuggest(item)"
      >
        <wd-icon name="search" custom-class="suggest-icon" />
        <text class="suggest-text">{{ item }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('')
const showSuggest = ref(false)
const suggestions = ref<string[]>([])

// 模拟联想数据
const mockData = [
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15 Plus',
  'iPhone 15',
  '华为 Mate 60 Pro',
  '华为 Mate 60',
  '小米14 Pro',
  '小米14',
  'MacBook Pro M3',
  'MacBook Air M2'
]

// 防抖函数
let timer: ReturnType<typeof setTimeout> | null = null

const handleChange = ({ value }: { value: string }) => {
  if (timer) clearTimeout(timer)

  if (!value) {
    suggestions.value = []
    return
  }

  // 300ms 防抖
  timer = setTimeout(() => {
    // 模拟搜索联想
    suggestions.value = mockData.filter(item =>
      item.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5)
  }, 300)
}

const handleSearch = ({ value }: { value: string }) => {
  showSuggest.value = false
  console.log('搜索:', value)
  uni.showToast({ title: `搜索: ${value}`, icon: 'none' })
}

const selectSuggest = (item: string) => {
  keyword.value = item
  handleSearch({ value: item })
}
</script>

```

**技术实现:**
- 监听 `change` 事件实时获取输入内容
- 使用防抖优化联想请求频率,避免频繁调用接口
- 实际项目中应调用后端接口获取联想数据
- 点击联想项填充到搜索框并触发搜索

参考: src/wd/components/wd-search/wd-search.vue:252-258

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 输入框内容 | `string` | `''` |
| placeholder | 搜索框占位文本 | `string` | `'搜索'` |
| cancel-txt | 搜索框右侧文本 | `string` | `'取消'` |
| light | 搜索框亮色(白色)主题 | `boolean` | `false` |
| hide-cancel | 是否隐藏右侧取消按钮 | `boolean` | `false` |
| disabled | 是否禁用搜索框 | `boolean` | `false` |
| maxlength | 原生属性,设置最大长度,-1 表示无限制 | `number` | `-1` |
| placeholder-left | placeholder 是否居左显示 | `boolean` | `false` |
| focus | 是否自动聚焦 | `boolean` | `false` |
| focus-when-clear | 是否在点击清除按钮时聚焦输入框 | `boolean` | `false` |
| placeholder-style | 原生属性,指定 placeholder 的样式 | `string` | - |
| placeholder-class | 原生属性,指定 placeholder 的样式类 | `string` | - |
| radius | 搜索框圆角大小,支持数字(rpx)或字符串单位 | `number \| string` | `32` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-input-class | 自定义输入框样式类 | `string` | `''` |

参考: src/wd/components/wd-search/wd-search.vue:94-128

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | v-model 值变化时触发 | `value: string` |
| change | 输入内容变化时触发 | `{ value: string }` |
| clear | 点击清除按钮时触发 | - |
| search | 点击搜索按钮或回车时触发 | `{ value: string }` |
| focus | 输入框获得焦点时触发 | `{ value: string }` |
| blur | 输入框失去焦点时触发 | `{ value: string }` |
| cancel | 点击取消按钮时触发 | `{ value: string }` |

参考: src/wd/components/wd-search/wd-search.vue:132-148

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| prefix | 自定义搜索框前置内容 | - |
| suffix | 自定义搜索框后置内容(取消按钮) | - |

参考: src/wd/components/wd-search/wd-search.vue:10-72

### 类型定义

```typescript
/**
 * 搜索框组件属性接口
 */
interface WdSearchProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义输入框样式类 */
  customInputClass?: string

  /** 输入框内容,双向绑定 */
  modelValue?: string
  /** 搜索框占位文本 */
  placeholder?: string
  /** 搜索框右侧文本 */
  cancelTxt?: string
  /** 搜索框亮色(白色)主题 */
  light?: boolean
  /** 是否隐藏右侧取消按钮 */
  hideCancel?: boolean
  /** 是否禁用搜索框 */
  disabled?: boolean
  /** 原生属性,设置最大长度,-1 表示无限制 */
  maxlength?: number
  /** placeholder 是否居左显示 */
  placeholderLeft?: boolean
  /** 是否自动聚焦 */
  focus?: boolean
  /** 是否在点击清除按钮时聚焦输入框 */
  focusWhenClear?: boolean
  /** 原生属性,指定 placeholder 的样式 */
  placeholderStyle?: string
  /** 原生属性,指定 placeholder 的样式类 */
  placeholderClass?: string
  /** 搜索框圆角大小,支持数字(rpx)或字符串单位 */
  radius?: number | string
}

/**
 * 搜索框组件事件接口
 */
interface WdSearchEmits {
  /** 更新 modelValue */
  'update:modelValue': [value: string]
  /** 输入内容变化时触发 */
  change: [{ value: string }]
  /** 点击清除按钮时触发 */
  clear: []
  /** 点击搜索按钮或回车时触发 */
  search: [{ value: string }]
  /** 输入框获得焦点时触发 */
  focus: [{ value: string }]
  /** 输入框失去焦点时触发 */
  blur: [{ value: string }]
  /** 点击取消按钮时触发 */
  cancel: [{ value: string }]
}
```

参考: src/wd/components/wd-search/wd-search.vue:91-148

## 主题定制

Search 组件提供了丰富的 CSS 变量用于主题定制,支持浅色和深色两种主题模式。

### CSS 变量

```scss
// 搜索框组件变量
$-search-padding: 16rpx;                     // 搜索框内边距
$-search-side-padding: 32rpx;                // 搜索框左右边距
$-search-input-height: 64rpx;                // 输入框高度
$-search-input-bg: #f5f5f5;                  // 输入框背景色
$-search-input-radius: 32rpx;                // 输入框圆角
$-search-input-padding: 0 80rpx 0 80rpx;     // 输入框内边距
$-search-input-fs: 28rpx;                    // 输入框文字大小
$-search-input-color: #262626;               // 输入框文字颜色
$-search-icon-size: 32rpx;                   // 图标大小
$-search-icon-color: #999999;                // 图标颜色
$-search-placeholder-color: #999999;         // 占位符颜色
$-search-cancel-padding: 0 16rpx 0 24rpx;    // 取消按钮内边距
$-search-cancel-fs: 28rpx;                   // 取消按钮文字大小
$-search-cancel-color: #4d80f0;              // 取消按钮文字颜色
$-search-clear-icon-size: 32rpx;             // 清除图标大小
$-search-light-bg: #4d80f0;                  // 浅色主题背景

// 深色主题变量
$-dark-background: #1a1a1a;                  // 深色背景
$-dark-background4: #2a2a2a;                 // 深色背景4
$-dark-background7: #333333;                 // 深色背景7
$-dark-color: #ffffff;                        // 深色文字
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-search
      v-model="value"
      custom-class="custom-search"
      placeholder="自定义主题搜索"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<style lang="scss">
.custom-search {
  // 自定义颜色
  --wot-search-input-bg: #fff3e0;
  --wot-search-input-color: #e65100;
  --wot-search-placeholder-color: #ff9800;
  --wot-search-icon-color: #ff9800;
  --wot-search-cancel-color: #e65100;

  // 自定义尺寸
  --wot-search-input-height: 72rpx;
  --wot-search-input-fs: 32rpx;
  --wot-search-icon-size: 36rpx;
  --wot-search-cancel-fs: 32rpx;

  // 自定义圆角
  --wot-search-input-radius: 16rpx;
}
</style>
```

### 深色模式

组件自动支持深色模式,在 `wot-theme-dark` 类名下应用深色主题样式。

```vue
<template>
  <view :class="['page', { 'wot-theme-dark': isDark }]">
    <wd-search v-model="value" placeholder="深色模式搜索" />
    <wd-button @click="toggleTheme">切换主题</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>
```

参考: src/wd/components/wd-search/wd-search.vue:345-387

## 最佳实践

### 1. 选择合适的主题模式

根据页面背景色选择 `light` 属性,确保搜索框视觉效果清晰。

```vue
<!-- ✅ 推荐:深色背景使用浅色主题 -->
<view class="dark-page">
  <wd-search v-model="value" light />
</view>

<!-- ✅ 推荐:浅色背景使用默认主题 -->
<view class="light-page">
  <wd-search v-model="value" />
</view>

<!-- ❌ 不推荐:浅色背景使用浅色主题 -->
<view class="light-page">
  <wd-search v-model="value" light />
</view>
```

**建议:**
- 页面背景为深色(如导航栏)时使用 `light` 主题
- 页面背景为浅色时使用默认主题
- 避免背景和搜索框颜色过于接近,确保视觉对比度

参考: src/wd/components/wd-search/wd-search.vue:497-507

### 2. 合理使用自动聚焦

根据页面类型决定是否使用 `focus` 属性,避免影响用户体验。

```vue
<!-- ✅ 推荐:独立搜索页面使用自动聚焦 -->
<template>
  <view class="search-page">
    <wd-search v-model="keyword" focus />
  </view>
</template>

<!-- ✅ 推荐:内嵌搜索不使用自动聚焦 -->
<template>
  <view class="home-page">
    <wd-search v-model="keyword" hide-cancel />
    <!-- 其他内容 -->
  </view>
</template>

<!-- ❌ 不推荐:列表页面使用自动聚焦 -->
<template>
  <view class="list-page">
    <wd-search v-model="keyword" focus />
    <!-- 自动聚焦会影响列表浏览 -->
  </view>
</template>
```

**建议:**
- 专门的搜索页面可使用自动聚焦,方便用户直接输入
- 首页、列表页等非搜索为主的页面不要使用自动聚焦
- 自动聚焦会弹出键盘,可能遮挡页面内容

参考: src/wd/components/wd-search/wd-search.vue:228-246

### 3. 防抖优化搜索请求

实时搜索场景下使用防抖,避免频繁请求接口。

```vue
<template>
  <wd-search
    v-model="keyword"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

// ✅ 推荐:使用防抖
const handleChange = ({ value }: { value: string }) => {
  if (timer) clearTimeout(timer)

  timer = setTimeout(() => {
    // 调用搜索接口
    searchAPI(value)
  }, 300)
}

// ❌ 不推荐:不使用防抖,频繁请求
const handleChangeWrong = ({ value }: { value: string }) => {
  // 每次输入都调用接口
  searchAPI(value)
}

const searchAPI = (keyword: string) => {
  console.log('搜索:', keyword)
  // 实际接口调用
}
</script>
```

**建议:**
- 实时搜索建议防抖时间为 300-500ms
- 搜索联想建议防抖时间为 200-300ms
- 避免每次输入都调用接口,造成性能浪费

参考: src/wd/components/wd-search/wd-search.vue:252-258

### 4. 保存搜索历史

在本地存储用户的搜索历史,提升用户体验。

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const keyword = ref('')
const searchHistory = ref<string[]>([])

// ✅ 推荐:从本地存储加载历史
onMounted(() => {
  const history = uni.getStorageSync('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
})

// ✅ 推荐:保存到本地存储
const handleSearch = ({ value }: { value: string }) => {
  if (!value) return

  // 去重并添加到最前面
  const index = searchHistory.value.indexOf(value)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(value)

  // 最多保存10条
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }

  // 保存到本地存储
  uni.setStorageSync('searchHistory', JSON.stringify(searchHistory.value))
}

// ❌ 不推荐:不保存历史
const handleSearchWrong = ({ value }: { value: string }) => {
  // 只执行搜索,不保存历史
  console.log('搜索:', value)
}
</script>
```

**建议:**
- 使用 `uni.setStorageSync` 保存搜索历史到本地
- 限制历史记录数量(如 10 条),避免占用过多存储空间
- 提供清空历史功能,让用户可以管理历史记录

参考: src/wd/components/wd-search/wd-search.vue:291-293

### 5. 搜索结果页面跳转

合理处理搜索和取消事件,实现页面跳转逻辑。

```vue
<template>
  <wd-search
    v-model="keyword"
    @search="handleSearch"
    @cancel="handleCancel"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('')

// ✅ 推荐:搜索时跳转到结果页
const handleSearch = ({ value }: { value: string }) => {
  if (!value.trim()) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }

  // 跳转到搜索结果页
  uni.navigateTo({
    url: `/pages/search-result/index?keyword=${encodeURIComponent(value)}`
  })
}

// ✅ 推荐:取消时返回上一页
const handleCancel = () => {
  uni.navigateBack()
}

// ❌ 不推荐:不处理空关键词
const handleSearchWrong = ({ value }: { value: string }) => {
  // 没有验证,可能跳转到空结果页
  uni.navigateTo({
    url: `/pages/search-result/index?keyword=${value}`
  })
}
</script>
```

**建议:**
- 搜索前验证关键词是否为空,给出友好提示
- 使用 `encodeURIComponent` 编码关键词,避免特殊字符导致问题
- 取消按钮建议返回上一页,符合用户预期

参考: src/wd/components/wd-search/wd-search.vue:329-337

## 常见问题

### 1. 占位符不居中显示

**问题描述:**
设置了 `placeholder` 但占位符没有居中显示,而是靠左对齐。

**问题原因:**
- 设置了 `placeholder-left` 属性为 `true`
- 输入框已有内容,占位符会自动左对齐
- 使用了自定义样式影响了占位符位置

**解决方案:**

确认未设置 `placeholder-left`,且输入框为空时占位符会自动居中。

```vue
<template>
  <!-- ✅ 正确:默认居中 -->
  <wd-search v-model="value1" placeholder="搜索" />

  <!-- ❌ 错误:设置了 placeholder-left -->
  <wd-search
    v-model="value2"
    placeholder="搜索"
    :placeholder-left="true"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')  // 空值时居中
const value2 = ref('')  // 设置了 placeholder-left,始终左对齐
</script>
```

参考: src/wd/components/wd-search/wd-search.vue:19-29

### 2. 自动聚焦不生效

**问题描述:**
设置了 `focus` 属性为 `true`,但输入框没有自动聚焦。

**问题原因:**
- 同时设置了 `disabled` 为 `true`,禁用状态下无法聚焦
- 页面存在多个搜索框且都设置了自动聚焦,可能冲突
- 在某些平台或浏览器中,自动聚焦可能被限制

**解决方案:**

确认未设置 `disabled`,且页面只有一个搜索框设置自动聚焦。

```vue
<template>
  <view class="demo">
    <!-- ✅ 正确:启用状态下自动聚焦 -->
    <wd-search v-model="value1" focus />

    <!-- ❌ 错误:禁用状态无法聚焦 -->
    <wd-search v-model="value2" focus disabled />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref('')
const value2 = ref('')
</script>
```

参考: src/wd/components/wd-search/wd-search.vue:228-246

### 3. 清除按钮不显示

**问题描述:**
输入了内容但清除按钮没有显示。

**问题原因:**
- `v-model` 绑定的值不是响应式的
- 输入框被自定义样式隐藏了
- 组件版本过旧,不支持清除功能

**解决方案:**

确保 `v-model` 绑定响应式变量,且没有自定义样式遮挡清除按钮。

```vue
<template>
  <wd-search v-model="keyword" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// ✅ 正确:使用 ref 创建响应式变量
const keyword = ref('')

// ❌ 错误:使用普通变量
// let keyword = ''
</script>
```

参考: src/wd/components/wd-search/wd-search.vue:57-63

### 4. 取消按钮点击无反应

**问题描述:**
点击取消按钮没有触发任何事件。

**问题原因:**
- 没有监听 `cancel` 事件
- 使用了 `suffix` 插槽替换了取消按钮,但没有实现点击逻辑
- 事件处理函数中有错误导致执行中断

**解决方案:**

确保监听了 `cancel` 事件,并正确处理。

```vue
<template>
  <!-- ✅ 正确:监听 cancel 事件 -->
  <wd-search
    v-model="keyword"
    @cancel="handleCancel"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword = ref('')

const handleCancel = () => {
  console.log('取消搜索')
  uni.navigateBack()
}
</script>
```

如果使用了 `suffix` 插槽:

```vue
<template>
  <wd-search v-model="keyword">
    <template #suffix>
      <!-- ✅ 正确:自行实现点击逻辑 -->
      <view class="custom-cancel" @click="handleCancel">
        取消
      </view>
    </template>
  </wd-search>
</template>
```

参考: src/wd/components/wd-search/wd-search.vue:329-337

### 5. 搜索事件触发时机不对

**问题描述:**
希望在输入完成后自动搜索,但 `search` 事件只在点击键盘搜索按钮时触发。

**问题原因:**
- `search` 事件仅在用户点击键盘搜索按钮或确认时触发
- 实时搜索应该使用 `change` 事件而非 `search` 事件

**解决方案:**

根据需求选择合适的事件:

```vue
<template>
  <view class="demo">
    <!-- ✅ 点击搜索按钮触发 -->
    <wd-search
      v-model="keyword1"
      @search="handleSearch"
    />

    <!-- ✅ 实时搜索使用 change -->
    <wd-search
      v-model="keyword2"
      @change="handleChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const keyword1 = ref('')
const keyword2 = ref('')

// 点击搜索按钮时触发
const handleSearch = ({ value }: { value: string }) => {
  console.log('搜索:', value)
}

// 输入内容变化时触发(建议加防抖)
let timer: ReturnType<typeof setTimeout> | null = null
const handleChange = ({ value }: { value: string }) => {
  if (timer) clearTimeout(timer)

  timer = setTimeout(() => {
    console.log('实时搜索:', value)
  }, 300)
}
</script>
```

**区别:**
- `search` 事件: 用户主动触发搜索(点击键盘搜索按钮)
- `change` 事件: 输入内容变化时触发,适合实时搜索

参考: src/wd/components/wd-search/wd-search.vue:291-293

## 注意事项

1. **占位符显示机制**: 组件默认使用覆盖层实现居中占位符,点击后切换为真实输入框,这是为了实现更好的视觉效果

2. **聚焦控制**: `focus` 属性控制初始聚焦,`focusWhenClear` 控制清空后聚焦,两者功能不同,可根据需求组合使用

3. **主题选择**: `light` 主题适合深色背景,默认主题适合浅色背景,选择错误会导致对比度不足

4. **取消按钮**: 点击取消按钮会触发 `cancel` 事件,但不会自动清空输入内容或返回上一页,需要在事件处理函数中实现

5. **搜索事件**: `search` 事件仅在点击键盘搜索按钮时触发,如需实时搜索应使用 `change` 事件配合防抖

6. **圆角设置**: `radius` 属性只影响输入区域圆角,不影响整体搜索框的圆角

7. **最大长度**: `maxlength` 为 -1 时表示无限制,设置为 0 会导致无法输入

8. **插槽使用**: 使用 `suffix` 插槽会完全替换取消按钮,需要自行实现点击逻辑和事件处理

9. **禁用状态**: 禁用状态下所有交互功能失效,包括清除按钮、取消按钮和输入

10. **占位符样式**: `placeholder-style` 支持的样式有限,只能设置 `color`、`font-size` 和 `font-weight`

11. **国际化**: 组件内置国际化支持,如果没有设置 `placeholder` 和 `cancel-txt`,会使用默认的翻译文字

12. **清除按钮**: 清除按钮固定在输入框右侧,无法通过属性调整位置,如需自定义可使用自定义样式

参考: src/wd/components/wd-search/wd-search.vue:151-165
