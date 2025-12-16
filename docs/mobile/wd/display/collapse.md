# Collapse 折叠面板

## 介绍

Collapse 折叠面板组件将一组内容放置在多个可折叠的面板中,点击面板的标题可以展开或收缩其内容。组件支持普通模式、手风琴模式和查看更多模式三种展示方式,提供了灵活的内容展示解决方案。

**核心特性:**

- **三种模式** - 支持普通模式(多个面板可同时展开)、手风琴模式(同时只能展开一个)、查看更多模式(文本展开收起)
- **展开动画** - 平滑的高度过渡动画,提升用户体验
- **自定义标题** - 支持标题插槽,可完全自定义标题内容
- **禁用状态** - 支持禁用单个面板项
- **展开前钩子** - 支持展开前回调,可阻止面板展开
- **全部切换** - 提供 `toggleAll` 方法,一键展开或收起所有面板
- **暗黑模式** - 自动适配暗黑主题

## 基本用法

### 普通模式

多个面板可以同时展开,`v-model` 绑定数组类型的值。

```vue
<template>
  <view class="demo">
    <wd-collapse v-model="value">
      <wd-collapse-item title="标签一" name="1">
        <view class="content">
          这是折叠面板的内容区域,可以放置任意内容。普通模式下,多个面板可以同时展开。
        </view>
      </wd-collapse-item>
      <wd-collapse-item title="标签二" name="2">
        <view class="content">
          折叠面板常用于FAQ、设置选项、产品详情等场景。
        </view>
      </wd-collapse-item>
      <wd-collapse-item title="标签三" name="3">
        <view class="content">
          您可以通过点击标题来展开或收起内容区域。
        </view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 普通模式使用数组,可同时展开多个面板
const value = ref(['1'])
</script>

```

**使用说明:**
- `v-model` 绑定数组类型,数组元素为展开面板的 `name`
- 每个 `wd-collapse-item` 必须设置唯一的 `name` 属性
- 默认展开的面板,将其 `name` 添加到数组中
- 可同时展开多个面板

### 手风琴模式

手风琴模式下,同时只能展开一个面板,`v-model` 绑定字符串类型的值。

```vue
<template>
  <view class="demo">
    <wd-collapse v-model="value" accordion>
      <wd-collapse-item title="产品介绍" name="intro">
        <view class="content">
          我们的产品采用最新技术打造,为用户提供极致的使用体验。
        </view>
      </wd-collapse-item>
      <wd-collapse-item title="产品规格" name="specs">
        <view class="content">
          <view class="spec-item">
            <text class="label">尺寸:</text>
            <text class="value">160mm × 80mm × 8mm</text>
          </view>
          <view class="spec-item">
            <text class="label">重量:</text>
            <text class="value">180g</text>
          </view>
        </view>
      </wd-collapse-item>
      <wd-collapse-item title="售后服务" name="service">
        <view class="content">
          提供一年质保服务,终身免费技术支持。
        </view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 手风琴模式使用字符串,同时只能展开一个面板
const value = ref('intro')
</script>

```

**使用说明:**
- 设置 `accordion` 属性启用手风琴模式
- `v-model` 绑定字符串类型,值为当前展开面板的 `name`
- 展开新面板时,其他面板会自动收起
- 点击已展开的面板会收起它,此时 `v-model` 值为空字符串

### 禁用状态

通过 `disabled` 属性禁用单个面板项。

```vue
<template>
  <view class="demo">
    <wd-collapse v-model="value">
      <wd-collapse-item title="正常面板" name="1">
        <view class="content">这是正常的折叠面板。</view>
      </wd-collapse-item>
      <wd-collapse-item title="禁用面板" name="2" disabled>
        <view class="content">这个面板已被禁用,无法点击展开。</view>
      </wd-collapse-item>
      <wd-collapse-item title="另一个正常面板" name="3">
        <view class="content">这也是正常的折叠面板。</view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(['1'])
</script>

```

**使用说明:**
- 禁用的面板标题和箭头颜色会变淡
- 点击禁用面板不会触发展开/收起
- 禁用状态不影响通过代码控制展开/收起

### 自定义标题

通过 `title` 插槽自定义面板标题内容。

```vue
<template>
  <view class="demo">
    <wd-collapse v-model="value">
      <wd-collapse-item name="1">
        <template #title="{ expanded }">
          <view class="custom-title">
            <wd-icon name="notification" size="32" color="#1890ff" />
            <text class="title-text">系统通知</text>
            <wd-tag v-if="!expanded" type="danger" size="small">3</wd-tag>
          </view>
        </template>
        <view class="content">
          <view class="notice-item">订单已发货</view>
          <view class="notice-item">收到新评论</view>
          <view class="notice-item">优惠券即将过期</view>
        </view>
      </wd-collapse-item>

      <wd-collapse-item name="2">
        <template #title="{ expanded, disabled }">
          <view class="custom-title">
            <wd-icon name="setting" size="32" color="#52c41a" />
            <text class="title-text">设置选项</text>
            <wd-icon
              :name="expanded ? 'arrow-up' : 'arrow-down'"
              size="32"
              color="#999"
            />
          </view>
        </template>
        <view class="content">
          这里是设置选项的内容区域。
        </view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref([])
</script>

```

**使用说明:**
- `title` 插槽接收三个参数:`expanded`(展开状态)、`disabled`(禁用状态)、`is-first`(是否首项)
- 使用插槽后,默认标题和箭头不会显示
- 可以在插槽中完全自定义标题布局和样式
- 插槽内容可以包含图标、标签、按钮等任意元素

### 展开前钩子

通过 `before-expend` 属性设置展开前的回调函数,可以阻止面板展开。

```vue
<template>
  <view class="demo">
    <wd-collapse v-model="value">
      <wd-collapse-item title="无需验证" name="1">
        <view class="content">这个面板可以直接展开。</view>
      </wd-collapse-item>
      <wd-collapse-item
        title="需要验证"
        name="2"
        :before-expend="handleBeforeExpand"
      >
        <view class="content">这个面板需要通过验证才能展开。</view>
      </wd-collapse-item>
      <wd-collapse-item
        title="异步验证"
        name="3"
        :before-expend="handleAsyncBeforeExpand"
      >
        <view class="content">这个面板会进行异步验证。</view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/hooks/useToast'

const { showToast } = useToast()
const value = ref([])

// 同步验证
const handleBeforeExpand = (name: string) => {
  const confirmed = confirm('确定要展开这个面板吗?')
  if (!confirmed) {
    showToast('已取消展开')
  }
  return confirmed
}

// 异步验证
const handleAsyncBeforeExpand = (name: string) => {
  return new Promise((resolve, reject) => {
    showToast('验证中...')
    setTimeout(() => {
      const success = Math.random() > 0.5
      if (success) {
        showToast('验证通过')
        resolve(true)
      } else {
        showToast('验证失败')
        reject(new Error('验证失败'))
      }
    }, 1000)
  })
}
</script>

```

**使用说明:**
- `before-expend` 接收当前面板的 `name` 作为参数
- 返回 `false` 会阻止面板展开
- 支持返回 `Promise`,异步验证完成后展开
- 仅在展开时触发,收起时不触发

### 查看更多模式

查看更多模式适用于长文本的展开和收起。

```vue
<template>
  <view class="demo">
    <wd-collapse v-model="expanded" viewmore :line-num="3">
      <view class="long-text">
        这是一段很长的文本内容。折叠面板组件提供了查看更多模式,
        可以限制文本显示的行数,超出部分会被隐藏。
        用户点击"展开"按钮后可以查看完整内容,
        点击"收起"按钮可以折叠内容。
        这种模式特别适合文章摘要、商品描述、用户评论等长文本场景。
        您可以通过 line-num 属性设置收起时显示的行数,
        默认显示2行。查看更多模式下,v-model 绑定布尔值,
        true 表示展开,false 表示收起。
      </view>
    </wd-collapse>

    <view class="control-buttons">
      <wd-button size="small" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 查看更多模式使用布尔值
const expanded = ref(false)
</script>

```

**使用说明:**
- 设置 `viewmore` 属性启用查看更多模式
- `v-model` 绑定布尔值,`true` 为展开,`false` 为收起
- `line-num` 属性设置收起时显示的行数,默认为 2
- 自动显示"展开"/"收起"按钮和箭头图标
- 适合长文本内容的展示

### 自定义展开按钮

查看更多模式下,可以通过 `more` 插槽自定义展开按钮。

```vue
<template>
  <view class="demo">
    <wd-collapse
      v-model="expanded"
      viewmore
      :line-num="3"
      use-more-slot
      custom-more-slot-class="custom-more"
    >
      <view class="long-text">
        这是一段很长的文本内容,使用了自定义的展开按钮样式。
        您可以通过 more 插槽完全自定义展开/收起按钮的外观和交互。
        自定义按钮可以包含图标、文字、动画等任意内容。
        这为您的应用提供了更大的设计自由度。
      </view>
      <template #more>
        <view class="custom-more-button">
          <wd-icon
            :name="expanded ? 'arrow-up' : 'arrow-down'"
            size="24"
            color="#1890ff"
          />
          <text class="more-text">
            {{ expanded ? '点击收起内容' : '点击查看全部' }}
          </text>
        </view>
      </template>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const expanded = ref(false)
</script>

```

**使用说明:**
- 设置 `use-more-slot` 属性为 `true` 启用自定义展开按钮
- 使用 `more` 插槽自定义按钮内容
- `custom-more-slot-class` 属性可以设置插槽外层容器的样式类

### 全部切换

通过 `toggleAll` 方法可以一键展开或收起所有面板。

```vue
<template>
  <view class="demo">
    <view class="toolbar">
      <wd-button size="small" @click="expandAll">全部展开</wd-button>
      <wd-button size="small" @click="collapseAll">全部收起</wd-button>
      <wd-button size="small" @click="toggleAll">全部切换</wd-button>
    </view>

    <wd-collapse ref="collapseRef" v-model="value">
      <wd-collapse-item title="面板一" name="1">
        <view class="content">这是面板一的内容。</view>
      </wd-collapse-item>
      <wd-collapse-item title="面板二" name="2" disabled>
        <view class="content">这是面板二的内容(已禁用)。</view>
      </wd-collapse-item>
      <wd-collapse-item title="面板三" name="3">
        <view class="content">这是面板三的内容。</view>
      </wd-collapse-item>
      <wd-collapse-item title="面板四" name="4">
        <view class="content">这是面板四的内容。</view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CollapseInstance } from '@/components/wd-collapse/wd-collapse.vue'

const value = ref([])
const collapseRef = ref<CollapseInstance>()

// 全部展开
const expandAll = () => {
  collapseRef.value?.toggleAll(true)
}

// 全部收起
const collapseAll = () => {
  collapseRef.value?.toggleAll(false)
}

// 全部切换
const toggleAll = () => {
  collapseRef.value?.toggleAll()
}
</script>

```

**使用说明:**
- 通过 `ref` 获取 Collapse 组件实例
- 调用 `toggleAll(true)` 全部展开
- 调用 `toggleAll(false)` 全部收起
- 调用 `toggleAll()` 切换所有面板状态
- 手风琴模式不支持 `toggleAll` 方法

**高级用法:**

```typescript
// 跳过禁用项
collapseRef.value?.toggleAll({
  expanded: true,
  skipDisabled: true,
})
```

## 实战案例

### 案例1: FAQ 常见问题

实现常见问题列表的展示。

```vue
<template>
  <view class="faq-page">
    <view class="page-title">常见问题</view>
    <wd-collapse v-model="activeNames" accordion>
      <wd-collapse-item
        v-for="(item, index) in faqList"
        :key="index"
        :name="String(index)"
      >
        <template #title>
          <view class="faq-title">
            <text class="question-mark">Q</text>
            <text class="question-text">{{ item.question }}</text>
          </view>
        </template>
        <view class="faq-answer">
          <text class="answer-mark">A</text>
          <text class="answer-text">{{ item.answer }}</text>
        </view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface FaqItem {
  question: string
  answer: string
}

const activeNames = ref('')

const faqList = ref<FaqItem[]>([
  {
    question: '如何注册账号?',
    answer: '点击首页右上角的"注册"按钮,填写手机号和验证码即可完成注册。',
  },
  {
    question: '忘记密码怎么办?',
    answer: '在登录页面点击"忘记密码",通过手机验证码即可重置密码。',
  },
  {
    question: '如何联系客服?',
    answer:
      '您可以通过以下方式联系我们: 1. 拨打客服热线 400-xxx-xxxx; 2. 在APP内点击"在线客服"按钮; 3. 发送邮件至 service@example.com',
  },
  {
    question: '支持哪些支付方式?',
    answer: '我们支持微信支付、支付宝支付、银行卡支付等多种支付方式。',
  },
  {
    question: '退款需要多久到账?',
    answer: '退款一般在3-7个工作日内到账,具体到账时间取决于您的支付方式和银行处理速度。',
  },
])
</script>

```

**功能说明:**
- 使用手风琴模式,同时只展开一个问题
- Q&A 样式清晰,易于阅读
- 自定义标题样式,突出问题内容

### 案例2: 商品详情展开

实现商品详情页的信息展示。

```vue
<template>
  <view class="product-detail">
    <view class="product-header">
      <image src="/images/product.jpg" class="product-image" mode="aspectFill" />
      <view class="product-info">
        <view class="product-name">iPhone 15 Pro Max</view>
        <view class="product-price">¥9999</view>
      </view>
    </view>

    <wd-collapse v-model="activeNames">
      <wd-collapse-item title="产品参数" name="params">
        <view class="param-list">
          <view class="param-item">
            <text class="param-label">型号:</text>
            <text class="param-value">iPhone 15 Pro Max</text>
          </view>
          <view class="param-item">
            <text class="param-label">颜色:</text>
            <text class="param-value">钛金属原色</text>
          </view>
          <view class="param-item">
            <text class="param-label">存储:</text>
            <text class="param-value">256GB</text>
          </view>
          <view class="param-item">
            <text class="param-label">屏幕:</text>
            <text class="param-value">6.7英寸 Super Retina XDR显示屏</text>
          </view>
          <view class="param-item">
            <text class="param-label">芯片:</text>
            <text class="param-value">A17 Pro芯片</text>
          </view>
        </view>
      </wd-collapse-item>

      <wd-collapse-item name="desc">
        <template #title>
          <view class="section-title">
            <wd-icon name="description" size="32" color="#1890ff" />
            <text>产品介绍</text>
          </view>
        </template>
        <view class="description">
          iPhone 15 Pro Max 采用航空级钛金属设计,
          是我们迄今最轻的 Pro 系列手机。
          搭载全新 A17 Pro 芯片,
          带来突破性的性能表现和能效提升。
        </view>
      </wd-collapse-item>

      <wd-collapse-item name="service">
        <template #title>
          <view class="section-title">
            <wd-icon name="service" size="32" color="#52c41a" />
            <text>售后保障</text>
          </view>
        </template>
        <view class="service-list">
          <view class="service-item">
            <wd-icon name="check-outline" size="32" color="#52c41a" />
            <text>一年质保</text>
          </view>
          <view class="service-item">
            <wd-icon name="check-outline" size="32" color="#52c41a" />
            <text>7天无理由退换</text>
          </view>
          <view class="service-item">
            <wd-icon name="check-outline" size="32" color="#52c41a" />
            <text>全国联保</text>
          </view>
          <view class="service-item">
            <wd-icon name="check-outline" size="32" color="#52c41a" />
            <text>终身免费技术支持</text>
          </view>
        </view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 默认展开产品参数
const activeNames = ref(['params'])
</script>

```

**功能说明:**
- 商品参数、介绍、售后保障分模块展示
- 支持同时展开多个模块
- 使用图标增强视觉效果

### 案例3: 文章阅读更多

实现文章内容的展开收起功能。

```vue
<template>
  <view class="article-page">
    <view class="article-header">
      <view class="article-title">{{ article.title }}</view>
      <view class="article-meta">
        <text class="author">{{ article.author }}</text>
        <text class="time">{{ article.time }}</text>
      </view>
    </view>

    <wd-collapse v-model="expanded" viewmore :line-num="5">
      <view class="article-content">{{ article.content }}</view>
    </wd-collapse>

    <view v-if="expanded" class="article-footer">
      <view class="tags">
        <wd-tag v-for="tag in article.tags" :key="tag" size="small" plain>
          {{ tag }}
        </wd-tag>
      </view>
      <view class="actions">
        <view class="action-item" @click="handleLike">
          <wd-icon name="thumbs-up" size="40" :color="liked ? '#ff4d4f' : '#999'" />
          <text>{{ liked ? '已点赞' : '点赞' }}</text>
        </view>
        <view class="action-item" @click="handleCollect">
          <wd-icon name="star-on" size="40" :color="collected ? '#faad14' : '#999'" />
          <text>{{ collected ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="action-item" @click="handleShare">
          <wd-icon name="share" size="40" color="#999" />
          <text>分享</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const expanded = ref(false)
const liked = ref(false)
const collected = ref(false)

const article = ref({
  title: 'Vue 3.5 正式发布,带来重大性能优化',
  author: '技术小白',
  time: '2小时前',
  tags: ['Vue', '前端', '技术'],
  content: `
    Vue 3.5 版本正式发布了!这是一个重要的里程碑版本,
    带来了响应式系统的重大优化和多项新特性。

    新版本在性能方面有了显著提升,特别是在大型应用中的表现更加出色。
    响应式系统经过重构,减少了不必要的依赖追踪,提升了更新效率。

    此外,Vue 3.5 还引入了一些实用的新 API,
    为开发者提供了更加灵活和强大的工具。
    组合式 API 得到了进一步增强,使得代码组织更加清晰。

    TypeScript 支持也得到了改进,类型推导更加智能,
    开发体验得到了全面提升。

    值得一提的是,新版本保持了向后兼容,
    现有的 Vue 3.x 应用可以平滑升级,无需做大的改动。
  `,
})

const handleLike = () => {
  liked.value = !liked.value
}

const handleCollect = () => {
  collected.value = !collected.value
}

const handleShare = () => {
  console.log('分享文章')
}
</script>

```

**功能说明:**
- 使用查看更多模式展示文章内容
- 收起时显示5行文本
- 展开后显示完整内容和操作按钮
- 适合长文本内容的阅读体验优化

## API

### Collapse Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前展开面板的标识符 | `string \| string[] \| boolean` | - |
| accordion | 是否开启手风琴模式 | `boolean` | `false` |
| viewmore | 是否开启查看更多模式 | `boolean` | `false` |
| line-num | 查看更多模式下收起时显示的行数 | `number` | `2` |
| use-more-slot | 查看更多模式下是否使用自定义展开按钮插槽 | `boolean` | `false` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点内联样式 | `string` | `''` |
| custom-more-slot-class | 查看更多模式下自定义插槽外层容器样式类 | `string` | `''` |

### Collapse Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 绑定值变化时触发 | `value: string \| string[] \| boolean` |
| change | 面板状态改变时触发 | `{ value: string \| string[] \| boolean }` |

### Collapse Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| toggleAll | 切换所有面板的展开状态 | `options?: boolean \| CollapseToggleAllOptions` | `-` |

### Collapse Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 折叠面板项列表(普通/手风琴模式)或文本内容(查看更多模式) | - |
| more | 查看更多模式下的自定义展开按钮 | - |

### CollapseItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 唯一标识符,必填 | `string` | - |
| title | 面板标题 | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |
| before-expend | 展开前的回调函数,返回 false 或 Promise reject 可阻止展开 | `(name: string) => boolean \| Promise<unknown>` | - |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点内联样式 | `string` | `''` |
| custom-body-class | 自定义内容区域样式类 | `string` | `''` |
| custom-body-style | 自定义内容区域内联样式 | `string` | `''` |

### CollapseItem Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 面板内容 | - |
| title | 自定义标题内容 | `{ expanded: boolean, disabled: boolean, isFirst: boolean }` |

### CollapseItem Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| getExpanded | 获取面板展开状态 | - | `boolean` |
| updateExpand | 更新面板展开状态 | - | `Promise<void>` |

### 类型定义

```typescript
/**
 * 折叠面板切换所有选项类型
 */
export type CollapseToggleAllOptions =
  | boolean
  | {
      /** 是否展开 */
      expanded?: boolean
      /** 是否跳过禁用项 */
      skipDisabled?: boolean
    }

/**
 * 折叠面板项展开前回调函数
 */
type CollapseItemBeforeExpand = (name: string) => boolean | Promise<unknown>

/**
 * 折叠面板组件属性接口
 */
interface WdCollapseProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 查看更多模式下的插槽外部自定义样式 */
  customMoreSlotClass?: string
  /** 绑定值 */
  modelValue?: string | Array<string> | boolean
  /** 手风琴模式 */
  accordion?: boolean
  /** 查看更多的折叠面板 */
  viewmore?: boolean
  /** 查看更多的自定义插槽使用标志 */
  useMoreSlot?: boolean
  /** 查看更多的折叠面板,收起时的显示行数 */
  lineNum?: number
}

/**
 * 折叠面板项组件属性接口
 */
interface WdCollapseItemProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 自定义折叠栏内容容器样式类名 */
  customBodyClass?: string
  /** 自定义折叠栏内容容器样式 */
  customBodyStyle?: string
  /** 折叠栏的标题 */
  title?: string
  /** 禁用折叠栏 */
  disabled?: boolean
  /** 折叠栏的标识符 */
  name: string
  /** 打开前的回调函数 */
  beforeExpend?: CollapseItemBeforeExpand
}
```

## 主题定制

### CSS 变量

Collapse 组件提供了以下 CSS 变量用于主题定制:

```scss
// 折叠面板布局
$-collapse-side-padding: 32rpx;         // 查看更多模式内边距

// 标题样式
$-collapse-title-color: #323233;        // 标题颜色
$-collapse-title-fs: 28rpx;             // 标题字体大小

// 内容样式
$-collapse-body-color: #969799;         // 内容颜色
$-collapse-body-fs: 28rpx;              // 内容字体大小
$-collapse-body-padding: 32rpx;         // 内容内边距

// 头部样式
$-collapse-header-padding: 32rpx;       // 头部内边距

// 箭头样式
$-collapse-arrow-size: 32rpx;           // 箭头图标大小
$-collapse-arrow-color: #969799;        // 箭头颜色

// 查看更多样式
$-collapse-more-color: #4d80f0;         // 更多按钮颜色
$-collapse-retract-fs: 28rpx;           // 收起时字体大小

// 禁用状态
$-collapse-disabled-color: #c8c9cc;     // 禁用项颜色

// 暗黑模式
$-dark-background2: #1f1f1f;            // 暗黑模式背景色
$-dark-border-color: #3a3a3c;           // 暗黑模式边框色
$-dark-color: #e5e5e5;                  // 暗黑模式文字色
$-dark-color3: #a8a8a8;                 // 暗黑模式次要文字色
$-dark-color-gray: #6c6c6e;             // 暗黑模式灰色文字
```

### 自定义主题示例

```vue
<template>
  <view class="custom-theme">
    <wd-collapse v-model="value" custom-class="custom-collapse">
      <wd-collapse-item title="自定义主题面板" name="1">
        <view>这是自定义主题的折叠面板</view>
      </wd-collapse-item>
    </wd-collapse>
  </view>
</template>

```

### 暗黑模式

Collapse 组件自动支持暗黑模式:

```scss
.wot-theme-dark {
  .wd-collapse {
    background: #1f1f1f;

    .wd-collapse-item {
      border-color: #3a3a3c;
    }

    .wd-collapse-item__title {
      color: #e5e5e5;
    }

    .wd-collapse-item__body {
      color: #a8a8a8;
    }

    .wd-collapse-item.is-disabled {
      .wd-collapse-item__title,
      .wd-collapse-item__arrow {
        color: #6c6c6e;
      }
    }
  }
}
```

## 最佳实践

### 1. 合理选择模式

```vue
<!-- ✅ 好的示例:根据场景选择模式 -->
<!-- FAQ 场景使用手风琴模式 -->
<wd-collapse v-model="faqActive" accordion>
  <wd-collapse-item title="问题1" name="1">答案1</wd-collapse-item>
  <wd-collapse-item title="问题2" name="2">答案2</wd-collapse-item>
</wd-collapse>

<!-- 设置选项使用普通模式 -->
<wd-collapse v-model="settingActive">
  <wd-collapse-item title="通知设置" name="1">...</wd-collapse-item>
  <wd-collapse-item title="隐私设置" name="2">...</wd-collapse-item>
</wd-collapse>

<!-- 长文本使用查看更多模式 -->
<wd-collapse v-model="textExpanded" viewmore :line-num="3">
  长文本内容...
</wd-collapse>

<!-- ❌ 不好的示例:模式选择不当 -->
<!-- 设置选项用手风琴,不方便同时查看多个选项 -->
<wd-collapse v-model="active" accordion>
  <wd-collapse-item title="通知设置" name="1">...</wd-collapse-item>
  <wd-collapse-item title="隐私设置" name="2">...</wd-collapse-item>
</wd-collapse>
```

**说明:**
- 手风琴模式适合 FAQ、产品详情等同时只需查看一项的场景
- 普通模式适合设置选项、筛选条件等可能同时查看多项的场景
- 查看更多模式适合文章、评论等长文本内容

### 2. name 属性的命名

```vue
<!-- ✅ 好的示例:使用有意义的 name -->
<wd-collapse v-model="activeNames">
  <wd-collapse-item title="基本信息" name="basic">...</wd-collapse-item>
  <wd-collapse-item title="联系方式" name="contact">...</wd-collapse-item>
  <wd-collapse-item title="地址信息" name="address">...</wd-collapse-item>
</wd-collapse>

<!-- ❌ 不好的示例:使用无意义的数字 -->
<wd-collapse v-model="activeNames">
  <wd-collapse-item title="基本信息" name="1">...</wd-collapse-item>
  <wd-collapse-item title="联系方式" name="2">...</wd-collapse-item>
  <wd-collapse-item title="地址信息" name="3">...</wd-collapse-item>
</wd-collapse>
```

**说明:**
- 使用有语义的字符串作为 name,提高代码可读性
- 避免使用纯数字,除非是动态生成的列表
- name 应该能够反映面板的内容或功能

### 3. 展开前验证的使用

```vue
<!-- ✅ 好的示例:需要验证时使用 before-expend -->
<wd-collapse-item
  title="VIP 专属内容"
  name="vip"
  :before-expend="checkVipStatus"
>
  VIP 专属内容...
</wd-collapse-item>

<script setup>
const checkVipStatus = async (name) => {
  const isVip = await api.checkVip()
  if (!isVip) {
    showToast('请先开通VIP')
    return false
  }
  return true
}
</script>

<!-- ❌ 不好的示例:不需要验证也使用 before-expend -->
<wd-collapse-item
  title="普通内容"
  name="normal"
  :before-expend="() => true"
>
  普通内容...
</wd-collapse-item>
```

**说明:**
- 仅在需要权限验证、数据预加载等场景使用 `before-expend`
- 不要为了使用而使用,增加不必要的复杂度
- 验证失败时给用户明确的提示

### 4. 自定义标题的场景

```vue
<!-- ✅ 好的示例:需要复杂布局时使用插槽 -->
<wd-collapse-item name="message">
  <template #title>
    <view class="custom-title">
      <wd-icon name="notification" />
      <text>消息通知</text>
      <wd-tag type="danger" size="small">5</wd-tag>
    </view>
  </template>
  消息内容...
</wd-collapse-item>

<!-- ✅ 好的示例:简单文本使用 title 属性 -->
<wd-collapse-item title="消息通知" name="message">
  消息内容...
</wd-collapse-item>

<!-- ❌ 不好的示例:简单文本使用插槽 -->
<wd-collapse-item name="message">
  <template #title>
    <text>消息通知</text>
  </template>
  消息内容...
</wd-collapse-item>
```

**说明:**
- 纯文本标题使用 `title` 属性更简洁
- 包含图标、标签、按钮等复杂内容时使用 `title` 插槽
- 标题插槽可以接收 `expanded`、`disabled` 等参数用于动态展示

## 常见问题

### 1. 手风琴模式 v-model 类型错误

**问题原因:**
- 手风琴模式要求 `v-model` 绑定字符串类型
- 错误地使用了数组类型

**解决方案:**

```vue
<!-- ✅ 正确:手风琴模式使用字符串 -->
<template>
  <wd-collapse v-model="activeKey" accordion>
    <wd-collapse-item title="面板一" name="1">内容1</wd-collapse-item>
    <wd-collapse-item title="面板二" name="2">内容2</wd-collapse-item>
  </wd-collapse>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeKey = ref('1') // 字符串类型
</script>

<!-- ❌ 错误:使用数组类型 -->
<script lang="ts" setup>
const activeKey = ref(['1']) // 数组类型会报错
</script>
```

### 2. 查看更多模式行数不生效

**问题原因:**
- `line-num` 设置为 0 或负数
- 查看更多模式需要设置 `viewmore` 属性

**解决方案:**

```vue
<!-- ✅ 正确:设置 viewmore 和有效的 line-num -->
<wd-collapse v-model="expanded" viewmore :line-num="3">
  长文本内容...
</wd-collapse>

<script lang="ts" setup>
import { ref } from 'vue'

const expanded = ref(false) // 布尔值类型
</script>

<!-- ❌ 错误:line-num 无效 -->
<wd-collapse v-model="expanded" viewmore :line-num="0">
  长文本内容...
</wd-collapse>

<!-- ❌ 错误:忘记设置 viewmore -->
<wd-collapse v-model="expanded" :line-num="3">
  长文本内容...
</wd-collapse>
```

### 3. 展开动画不流畅

**问题原因:**
- 内容区域包含大量 DOM 元素
- 动画期间触发了重绘

**解决方案:**

```vue
<!-- ✅ 优化:减少动画期间的重绘 -->
<wd-collapse-item title="大量内容" name="large">
  <view class="optimized-content">
    <!-- 使用 v-show 而不是 v-if -->
    <view v-show="someCondition">条件内容</view>

    <!-- 避免在动画期间修改样式 -->
    <view class="static-style">内容</view>
  </view>
</wd-collapse-item>

<style>
.optimized-content {
  /* 使用 transform 而不是 margin/padding 做动画 */
  /* 启用硬件加速 */
  transform: translateZ(0);
}
</style>
```

### 4. toggleAll 方法不生效

**问题原因:**
- 在手风琴模式下使用 `toggleAll`
- 没有正确获取组件实例

**解决方案:**

```vue
<template>
  <view>
    <!-- ✅ 正确:普通模式使用 toggleAll -->
    <wd-collapse ref="collapseRef" v-model="value">
      <wd-collapse-item title="面板一" name="1">内容1</wd-collapse-item>
      <wd-collapse-item title="面板二" name="2">内容2</wd-collapse-item>
    </wd-collapse>
    <wd-button @click="handleToggleAll">全部切换</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CollapseInstance } from '@/components/wd-collapse/wd-collapse.vue'

const value = ref([])
const collapseRef = ref<CollapseInstance>()

const handleToggleAll = () => {
  collapseRef.value?.toggleAll()
}
</script>

<!-- ❌ 错误:手风琴模式使用 toggleAll -->
<wd-collapse ref="collapseRef" v-model="value" accordion>
  ...
</wd-collapse>
```

**说明:**
- `toggleAll` 方法仅在普通模式下有效
- 手风琴模式下调用 `toggleAll` 会被忽略
- 需要通过 `ref` 正确获取组件实例

### 5. before-expend 钩子不触发

**问题原因:**
- 钩子仅在展开时触发,收起时不触发
- 面板已经是展开状态,再次点击会收起

**解决方案:**

```vue
<wd-collapse-item
  title="需要验证的面板"
  name="verify"
  :before-expend="handleBeforeExpand"
>
  内容...
</wd-collapse-item>

<script lang="ts" setup>
// ✅ 正确:仅在展开时验证
const handleBeforeExpand = (name: string) => {
  console.log('展开前验证:', name)
  // 验证逻辑
  return true
}

// 如果需要在收起时也执行操作,监听 change 事件
const handleChange = (event: { value: any }) => {
  console.log('面板状态变化:', event.value)
}
</script>
```
