# Divider 分割线

## 介绍

Divider 分割线组件用于在页面中创建视觉分隔,将内容划分为不同的区域或部分。该组件支持水平和垂直两种方向,提供实线、虚线、细线等多种样式,并支持在分割线中插入文字内容,是构建清晰页面结构的重要布局工具。

**核心特性:**

- **双向支持** - 支持水平(horizontal)和垂直(vertical)两种分割线方向
- **样式丰富** - 提供实线、虚线(dashed)、细线(hairline 0.5px)等多种线条样式
- **内容插槽** - 支持在水平分割线中插入文字或自定义内容
- **位置控制** - 内容位置支持左对齐(left)、居中(center)、右对齐(right)
- **颜色定制** - 支持自定义分割线和文字颜色
- **细线优化** - 默认启用 hairline 细线效果,使用 transform: scale(0.5) 实现 0.5px 线条
- **暗黑模式** - 完整支持暗黑主题,自动适配线条和文字颜色
- **灵活扩展** - 支持 customClass 和 customStyle 实现高度自定义

参考: src/wd/components/wd-divider/wd-divider.vue:1-188

## 基本用法

### 基础分割线

使用默认配置创建水平分割线。

```vue
<template>
  <view class="demo">
    <view class="content">内容区域1</view>
    <wd-divider />
    <view class="content">内容区域2</view>
    <wd-divider />
    <view class="content">内容区域3</view>
  </view>
</template>

<script lang="ts" setup>
// 基础分割线无需额外逻辑
</script>

```

**使用说明:**
- Divider 默认为水平方向(horizontal)
- 默认启用 hairline 细线效果(0.5px)
- 默认颜色为浅灰色
- 组件自带上下外边距,无需额外设置间距

参考: src/wd/components/wd-divider/wd-divider.vue:2-18, 70-71

### 带文字的分割线

在水平分割线中插入文字内容,默认居中显示。

```vue
<template>
  <view class="demo">
    <view class="content">内容区域1</view>
    <wd-divider>分割线文字</wd-divider>
    <view class="content">内容区域2</view>
    <wd-divider>更多选项</wd-divider>
    <view class="content">内容区域3</view>
  </view>
</template>

<script lang="ts" setup>
// 文字分割线无需额外逻辑
</script>

```

**使用说明:**
- 通过默认插槽插入文字内容
- 文字默认居中显示
- 文字两侧自动生成分割线
- 仅水平分割线支持插入内容,垂直分割线不支持

**技术实现:**
- 使用 `::before` 和 `::after` 伪元素创建左右两侧的线条
- 插槽内容位于伪元素之间
- 通过 flex 布局实现居中对齐

参考: src/wd/components/wd-divider/wd-divider.vue:17, 9-12, 120-129

### 内容位置

通过 `content-position` 属性设置文字在分割线中的位置。

```vue
<template>
  <view class="demo">
    <!-- 左对齐 -->
    <view class="section">
      <text class="title">左对齐</text>
      <view class="content">内容区域1</view>
      <wd-divider content-position="left">左侧文字</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 居中对齐(默认) -->
    <view class="section">
      <text class="title">居中对齐(默认)</text>
      <view class="content">内容区域1</view>
      <wd-divider content-position="center">居中文字</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 右对齐 -->
    <view class="section">
      <text class="title">右对齐</text>
      <view class="content">内容区域1</view>
      <wd-divider content-position="right">右侧文字</wd-divider>
      <view class="content">内容区域2</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 内容位置无需额外逻辑
</script>

```

**使用说明:**
- content-position 默认为 `center`(居中)
- 可选值: `left`(左对齐)、`center`(居中)、`right`(右对齐)
- 左对齐时,左侧线条较短,文字靠左
- 右对齐时,右侧线条较短,文字靠右
- 居中时,左右线条等长,文字居中

**技术实现:**
- 通过 CSS 类名控制: `wd-divider--left`、`wd-divider--center`、`wd-divider--right`
- 左对齐限制左侧伪元素最大宽度
- 右对齐限制右侧伪元素最大宽度
- 居中时左右伪元素 flex: 1 平分空间

参考: src/wd/components/wd-divider/wd-divider.vue:54-55, 68, 11-12, 132-143

### 虚线样式

通过 `dashed` 属性设置分割线为虚线样式。

```vue
<template>
  <view class="demo">
    <!-- 实线(默认) -->
    <view class="section">
      <text class="title">实线(默认)</text>
      <view class="content">内容区域1</view>
      <wd-divider>实线分割</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 虚线 -->
    <view class="section">
      <text class="title">虚线</text>
      <view class="content">内容区域1</view>
      <wd-divider dashed>虚线分割</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 无文字虚线 -->
    <view class="section">
      <text class="title">无文字虚线</text>
      <view class="content">内容区域1</view>
      <wd-divider dashed />
      <view class="content">内容区域2</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 虚线样式无需额外逻辑
</script>

```

**使用说明:**
- dashed 默认为 false,显示实线
- 设置为 true 时显示虚线
- 虚线样式同时应用于左右两侧的线条
- 配合 hairline 使用,可实现细虚线效果

**技术实现:**
- 通过 CSS 类名 `is-dashed` 控制
- 设置伪元素的 `border-style: dashed`
- 虚线间隔由浏览器默认渲染

参考: src/wd/components/wd-divider/wd-divider.vue:57, 69, 6, 154-159

### 细线效果

通过 `hairline` 属性控制是否使用 0.5px 细线效果。

```vue
<template>
  <view class="demo">
    <!-- 细线(默认) -->
    <view class="section">
      <text class="title">细线(默认 0.5px)</text>
      <view class="content">内容区域1</view>
      <wd-divider hairline>细线分割</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 普通线 -->
    <view class="section">
      <text class="title">普通线(1px)</text>
      <view class="content">内容区域1</view>
      <wd-divider :hairline="false">普通线分割</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 对比 -->
    <view class="section">
      <text class="title">对比效果</text>
      <view class="card">
        <text>细线效果</text>
        <wd-divider hairline />
        <text>普通线效果</text>
        <wd-divider :hairline="false" />
        <text>结束</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 细线效果无需额外逻辑
</script>

```

**使用说明:**
- hairline 默认为 true,启用细线效果
- 设置为 false 时显示普通 1px 线条
- 细线通过 CSS transform: scaleY(0.5) 实现
- 细线更加精致,适合现代化 UI 设计
- 在高分辨率屏幕上细线效果更明显

**技术实现:**
- 通过 CSS 类名 `is-hairline` 控制
- 水平分割线: `transform: scaleY(0.5)`
- 垂直分割线: `transform: scaleX(0.5)`
- 保持线条居中,不影响布局

参考: src/wd/components/wd-divider/wd-divider.vue:60-61, 71, 7, 146-151, 180-184

### 垂直分割线

通过 `vertical` 属性创建垂直方向的分割线。

```vue
<template>
  <view class="demo">
    <!-- 水平分割线 -->
    <view class="section">
      <text class="title">水平分割线</text>
      <view class="card">
        <text>内容1</text>
        <wd-divider />
        <text>内容2</text>
        <wd-divider />
        <text>内容3</text>
      </view>
    </view>

    <!-- 垂直分割线 -->
    <view class="section">
      <text class="title">垂直分割线</text>
      <view class="horizontal-layout">
        <text>选项1</text>
        <wd-divider vertical />
        <text>选项2</text>
        <wd-divider vertical />
        <text>选项3</text>
        <wd-divider vertical />
        <text>选项4</text>
      </view>
    </view>

    <!-- 垂直虚线 -->
    <view class="section">
      <text class="title">垂直虚线</text>
      <view class="horizontal-layout">
        <text>选项A</text>
        <wd-divider vertical dashed />
        <text>选项B</text>
        <wd-divider vertical dashed />
        <text>选项C</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 垂直分割线无需额外逻辑
</script>

```

**使用说明:**
- vertical 默认为 false,显示水平分割线
- 设置为 true 时显示垂直分割线
- 垂直分割线不支持插入文字内容
- 垂直分割线适合在水平布局中分隔元素
- 垂直分割线自带左右外边距

**技术实现:**
- 通过 CSS 类名 `wd-divider--vertical` 控制
- 设置 `display: inline-block` 和 `vertical-align: middle`
- 通过 `::before` 伪元素创建垂直线条
- 隐藏 `::after` 伪元素

参考: src/wd/components/wd-divider/wd-divider.vue:59, 70, 8, 17, 162-185

### 自定义颜色

通过 `color` 属性设置分割线和文字的颜色。

```vue
<template>
  <view class="demo">
    <!-- 默认颜色 -->
    <view class="section">
      <text class="title">默认颜色</text>
      <view class="content">内容区域1</view>
      <wd-divider>默认颜色</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 主题色 -->
    <view class="section">
      <text class="title">主题色</text>
      <view class="content">内容区域1</view>
      <wd-divider color="#4dabf7">主题色分割</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 红色 -->
    <view class="section">
      <text class="title">红色</text>
      <view class="content">内容区域1</view>
      <wd-divider color="#ff6b6b">红色分割</wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 渐变色 -->
    <view class="section">
      <text class="title">渐变色(需配合 custom-style)</text>
      <view class="content">内容区域1</view>
      <wd-divider
        color="#667eea"
        custom-style="background: linear-gradient(to right, transparent, #667eea, transparent);"
      >
        渐变分割
      </wd-divider>
      <view class="content">内容区域2</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 自定义颜色无需额外逻辑
</script>

```

**使用说明:**
- color 属性同时设置线条颜色和文字颜色
- 支持任何有效的 CSS 颜色值
- 颜色值直接应用到组件的 color 样式属性
- 伪元素的 border-color 继承 color 属性
- 渐变色需要配合 custom-style 使用

**技术实现:**
- color 属性通过内联样式设置: `color: ${color};`
- 伪元素的 border-color 使用 CSS 变量继承
- 插槽内容的颜色自动继承

参考: src/wd/components/wd-divider/wd-divider.vue:53, 15, 101, 111

## 高级用法

### 自定义内容

在分割线中插入任意自定义内容。

```vue
<template>
  <view class="demo">
    <!-- 图标 + 文字 -->
    <view class="section">
      <view class="content">内容区域1</view>
      <wd-divider>
        <view class="divider-content">
          <wd-icon name="star-on" size="20px" color="#ffa94d" />
          <text>热门推荐</text>
        </view>
      </wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 标签 -->
    <view class="section">
      <view class="content">内容区域1</view>
      <wd-divider>
        <view class="tag-content">
          <text class="tag">新品</text>
        </view>
      </wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 按钮 -->
    <view class="section">
      <view class="content">内容区域1</view>
      <wd-divider>
        <button class="more-btn" @click="handleLoadMore">
          <wd-icon name="unfold" size="16px" />
          <text>加载更多</text>
        </button>
      </wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 时间轴 -->
    <view class="section">
      <view class="content">2024年1月事件</view>
      <wd-divider content-position="left">
        <view class="timeline">
          <text class="date">01-15</text>
          <wd-icon name="clock-outlined" size="16px" />
        </view>
      </wd-divider>
      <view class="content">2024年2月事件</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleLoadMore = () => {
  console.log('加载更多')
}
</script>

```

**使用说明:**
- 默认插槽支持任意内容: 文字、图标、按钮、标签等
- 自定义内容会自动居中显示(或根据 content-position 对齐)
- 可以使用 flex 布局组合多个元素
- 内容颜色会继承 color 属性,也可以单独设置

参考: src/wd/components/wd-divider/wd-divider.vue:17

### 列表分组

使用分割线对列表进行分组展示。

```vue
<template>
  <view class="demo">
    <view class="list">
      <!-- 分组1 -->
      <wd-divider content-position="left" color="#4dabf7">
        <text class="group-title">基础设置</text>
      </wd-divider>
      <view class="list-item" v-for="item in group1" :key="item.id">
        <wd-icon :name="item.icon" size="24px" />
        <text class="item-label">{{ item.label }}</text>
        <wd-icon name="arrow-right" size="20px" class="arrow" />
      </view>

      <!-- 分组2 -->
      <wd-divider content-position="left" color="#51cf66">
        <text class="group-title">隐私安全</text>
      </wd-divider>
      <view class="list-item" v-for="item in group2" :key="item.id">
        <wd-icon :name="item.icon" size="24px" />
        <text class="item-label">{{ item.label }}</text>
        <wd-icon name="arrow-right" size="20px" class="arrow" />
      </view>

      <!-- 分组3 -->
      <wd-divider content-position="left" color="#ffa94d">
        <text class="group-title">其他</text>
      </wd-divider>
      <view class="list-item" v-for="item in group3" :key="item.id">
        <wd-icon :name="item.icon" size="24px" />
        <text class="item-label">{{ item.label }}</text>
        <wd-icon name="arrow-right" size="20px" class="arrow" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const group1 = ref([
  { id: 1, label: '账号信息', icon: 'user-outlined' },
  { id: 2, label: '个人资料', icon: 'edit-outlined' },
  { id: 3, label: '消息通知', icon: 'bell-outlined' },
])

const group2 = ref([
  { id: 4, label: '隐私设置', icon: 'lock-outlined' },
  { id: 5, label: '安全中心', icon: 'shield-outlined' },
  { id: 6, label: '账号绑定', icon: 'link' },
])

const group3 = ref([
  { id: 7, label: '帮助中心', icon: 'help-outlined' },
  { id: 8, label: '关于我们', icon: 'info-outlined' },
  { id: 9, label: '退出登录', icon: 'logout' },
])
</script>

```

**使用说明:**
- 使用左对齐的分割线作为分组标题
- 通过不同颜色区分不同分组
- 分割线文字可以使用自定义样式
- 适合设置页、选项列表等场景

参考: src/wd/components/wd-divider/wd-divider.vue:54-55, 53

### 操作区分隔

在操作栏中使用垂直分割线分隔不同操作。

```vue
<template>
  <view class="demo">
    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-item" @click="handleLike">
        <wd-icon name="thumb-up-outlined" size="24px" />
        <text>点赞</text>
      </view>

      <wd-divider vertical />

      <view class="action-item" @click="handleComment">
        <wd-icon name="comment-outlined" size="24px" />
        <text>评论</text>
      </view>

      <wd-divider vertical />

      <view class="action-item" @click="handleShare">
        <wd-icon name="share-outlined" size="24px" />
        <text>分享</text>
      </view>

      <wd-divider vertical />

      <view class="action-item" @click="handleCollect">
        <wd-icon name="star-outlined" size="24px" />
        <text>收藏</text>
      </view>
    </view>

    <!-- 卡片操作 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">文章标题</text>
        <view class="card-actions">
          <text @click="handleEdit">编辑</text>
          <wd-divider vertical dashed />
          <text @click="handleDelete">删除</text>
        </view>
      </view>
      <view class="card-content">
        文章内容描述...
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleLike = () => console.log('点赞')
const handleComment = () => console.log('评论')
const handleShare = () => console.log('分享')
const handleCollect = () => console.log('收藏')
const handleEdit = () => console.log('编辑')
const handleDelete = () => console.log('删除')
</script>

```

**使用说明:**
- 垂直分割线适合在水平操作栏中使用
- 可以使用虚线样式实现不同的视觉效果
- 分割线自动垂直居中对齐
- 配合 flex 布局使用效果最佳

参考: src/wd/components/wd-divider/wd-divider.vue:59, 162-185

### 结合其他组件

分割线与其他UI组件组合使用。

```vue
<template>
  <view class="demo">
    <!-- 标签页分隔 -->
    <view class="tabs">
      <view class="tab active">全部</view>
      <wd-divider vertical />
      <view class="tab">待付款</view>
      <wd-divider vertical />
      <view class="tab">待发货</view>
      <wd-divider vertical />
      <view class="tab">已完成</view>
    </view>

    <!-- 表单分组 -->
    <view class="form-section">
      <wd-divider content-position="left" color="#4dabf7">
        <text class="section-title">基本信息</text>
      </wd-divider>
      <view class="form-item">
        <text class="label">姓名</text>
        <input class="input" placeholder="请输入姓名" />
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" type="number" placeholder="请输入手机号" />
      </view>

      <wd-divider content-position="left" color="#4dabf7">
        <text class="section-title">详细地址</text>
      </wd-divider>
      <view class="form-item">
        <text class="label">省市区</text>
        <input class="input" placeholder="请选择省市区" />
      </view>
      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea class="textarea" placeholder="请输入详细地址" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 结合其他组件无需额外逻辑
</script>

```

**使用说明:**
- 分割线可以与表单、标签页、列表等组件组合
- 作为视觉分隔工具,提升页面层次感
- 可以使用不同样式适配不同场景

参考: src/wd/components/wd-divider/wd-divider.vue:2-18

### 自定义样式

通过 `custom-class` 和 `custom-style` 实现高度自定义。

```vue
<template>
  <view class="demo">
    <!-- 阴影效果 -->
    <view class="section">
      <view class="content">内容区域1</view>
      <wd-divider
        custom-class="shadow-divider"
        custom-style="box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);"
      >
        阴影分割线
      </wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 边框效果 -->
    <view class="section">
      <view class="content">内容区域1</view>
      <wd-divider
        color="#4dabf7"
        custom-style="
          border: 2rpx solid #4dabf7;
          padding: 16rpx 32rpx;
          border-radius: 8rpx;
          background: #e3f2fd;
        "
      >
        边框分割线
      </wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 渐变背景 -->
    <view class="section">
      <view class="content">内容区域1</view>
      <wd-divider
        custom-style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          padding: 12rpx 32rpx;
          border-radius: 24rpx;
        "
      >
        渐变分割线
      </wd-divider>
      <view class="content">内容区域2</view>
    </view>

    <!-- 动画效果 -->
    <view class="section">
      <view class="content">内容区域1</view>
      <wd-divider custom-class="animate-divider">
        动画分割线
      </wd-divider>
      <view class="content">内容区域2</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 自定义样式无需额外逻辑
</script>

```

**使用说明:**
- custom-class: 添加自定义 CSS 类名,需使用 `:deep()` 深度选择器
- custom-style: 直接添加内联样式,优先级最高
- 可以添加边框、阴影、背景、圆角、动画等样式
- 支持伪元素样式定制

参考: src/wd/components/wd-divider/wd-divider.vue:48-50, 13, 15

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| content-position | 内容位置,可选值: left / center / right | `DividerPosition` | `'center'` |
| dashed | 是否显示为虚线 | `boolean` | `false` |
| hairline | 是否显示为 0.5px 的细线 | `boolean` | `true` |
| vertical | 是否为垂直分割线 | `boolean` | `false` |
| color | 自定义颜色(线条和文字) | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-divider/wd-divider.vue:46-62

### Events

Divider 组件无事件。

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| - | 默认插槽,仅水平分割线支持,用于插入文字或自定义内容 | `-` |

参考: src/wd/components/wd-divider/wd-divider.vue:17

### 类型定义

```typescript
/**
 * 分割线内容位置类型
 */
type DividerPosition = 'center' | 'left' | 'right'

/**
 * 分割线方向类型
 */
type DividerDirection = 'horizontal' | 'vertical'

/**
 * 分割线组件属性接口
 */
interface WdDividerProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string

  /** 自定义颜色 */
  color?: string
  /** 内容位置,可选值为 'left' / 'right' / 'center' */
  contentPosition?: DividerPosition
  /** 是否显示为虚线 */
  dashed?: boolean
  /** 是否为垂直分割线 */
  vertical?: boolean
  /** 是否显示为 0.5px 的线 */
  hairline?: boolean
}
```

参考: src/wd/components/wd-divider/wd-divider.vue:33-62

## 主题定制

Divider 组件支持通过 CSS 变量进行主题定制。

### CSS 变量

```scss
:root {
  // 分割线文字颜色
  --wot-divider-color: #969799;

  // 分割线字体大小
  --wot-divider-fs: 28rpx;

  // 分割线内边距
  --wot-divider-padding: 0;

  // 分割线外边距
  --wot-divider-margin: 32rpx 0;

  // 分割线线条颜色
  --wot-divider-line-color: #ebedf0;

  // 分割线线条高度
  --wot-divider-line-height: 1px;

  // 分割线内容左侧外边距
  --wot-divider-content-left-margin: 32rpx;

  // 分割线内容右侧外边距
  --wot-divider-content-right-margin: 32rpx;

  // 分割线左对齐时左侧线条最大宽度
  --wot-divider-content-left-width: 10%;

  // 分割线右对齐时右侧线条最大宽度
  --wot-divider-content-right-width: 10%;

  // 垂直分割线高度
  --wot-divider-vertical-height: 1em;

  // 垂直分割线宽度
  --wot-divider-vertical-line-width: 1px;

  // 垂直分割线外边距
  --wot-divider-vertical-content-margin: 0 16rpx;

  // 暗黑模式 - 文字颜色
  --wot-dark-color3: #909399;

  // 暗黑模式 - 线条颜色
  --wot-dark-color-gray: #4c4d4f;
}
```

### 自定义主题示例

```vue
<template>
  <view class="demo">
    <view class="custom-theme">
      <view class="content">内容区域1</view>
      <wd-divider>自定义主题</wd-divider>
      <view class="content">内容区域2</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 主题定制无需额外逻辑
</script>

```

参考: src/wd/components/wd-divider/wd-divider.vue:78-187

## 最佳实践

### 1. 选择合适的方向

根据布局需求选择水平或垂直分割线。

```vue
<!-- ✅ 推荐: 垂直布局使用水平分割线 -->
<view class="vertical-layout">
  <view class="section">区块1</view>
  <wd-divider />
  <view class="section">区块2</view>
</view>

<!-- ✅ 推荐: 水平布局使用垂直分割线 -->
<view class="horizontal-layout">
  <view class="item">选项1</view>
  <wd-divider vertical />
  <view class="item">选项2</view>
</view>

<!-- ❌ 不推荐: 布局方向与分割线方向不匹配 -->
<view class="vertical-layout">
  <view class="section">区块1</view>
  <wd-divider vertical />
  <!-- 垂直布局中使用垂直分割线 -->
  <view class="section">区块2</view>
</view>
```

### 2. 合理使用文字内容

带文字的分割线应该提供有意义的信息。

```vue
<!-- ✅ 推荐: 文字提供有意义的分组信息 -->
<wd-divider content-position="left">基础设置</wd-divider>

<!-- ✅ 推荐: 文字说明操作或状态 -->
<wd-divider>加载更多</wd-divider>
<wd-divider>没有更多数据了</wd-divider>

<!-- ✅ 推荐: 无需文字时不使用插槽 -->
<wd-divider />

<!-- ❌ 不推荐: 文字内容没有意义 -->
<wd-divider>---</wd-divider>
<wd-divider>分割线</wd-divider>

<!-- ❌ 不推荐: 垂直分割线使用插槽 -->
<wd-divider vertical>文字</wd-divider>
<!-- 垂直分割线不支持插槽内容 -->
```

### 3. 正确使用细线效果

细线适合现代化UI,普通线适合需要强调的场景。

```vue
<!-- ✅ 推荐: 常规分隔使用细线 -->
<wd-divider hairline />

<!-- ✅ 推荐: 需要强调时使用普通线 -->
<wd-divider :hairline="false" color="#ff6b6b">
  重要分隔
</wd-divider>

<!-- ✅ 推荐: 标题分隔使用粗线 -->
<wd-divider
  :hairline="false"
  content-position="left"
  custom-style="border-width: 3px;"
>
  大标题
</wd-divider>

<!-- ❌ 不推荐: 所有场景都使用粗线 -->
<wd-divider :hairline="false" />
<wd-divider :hairline="false" />
<!-- 视觉过重 -->
```

### 4. 合理设置内容位置

根据设计需求选择合适的内容对齐方式。

```vue
<!-- ✅ 推荐: 分组标题使用左对齐 -->
<wd-divider content-position="left">基础信息</wd-divider>

<!-- ✅ 推荐: 操作提示使用居中 -->
<wd-divider content-position="center">加载更多</wd-divider>

<!-- ✅ 推荐: 次要信息使用右对齐 -->
<wd-divider content-position="right">共10条</wd-divider>

<!-- ❌ 不推荐: 所有场景都使用居中 -->
<wd-divider content-position="center">基础信息</wd-divider>
<wd-divider content-position="center">安全设置</wd-divider>
<!-- 分组标题建议左对齐 -->
```

### 5. 颜色使用规范

颜色应该与整体设计风格保持一致。

```vue
<!-- ✅ 推荐: 使用设计系统中的颜色 -->
<wd-divider color="var(--primary-color)">主题色</wd-divider>
<wd-divider color="#4dabf7">品牌色</wd-divider>

<!-- ✅ 推荐: 不同类型使用不同颜色 -->
<wd-divider color="#51cf66">成功</wd-divider>
<wd-divider color="#ffa94d">警告</wd-divider>
<wd-divider color="#ff6b6b">危险</wd-divider>

<!-- ✅ 推荐: 默认场景不设置颜色 -->
<wd-divider />

<!-- ❌ 不推荐: 使用过于鲜艳的颜色 -->
<wd-divider color="#ff00ff">刺眼的颜色</wd-divider>

<!-- ❌ 不推荐: 颜色对比度不足 -->
<view style="background: #f5f5f5;">
  <wd-divider color="#f0f0f0">看不清</wd-divider>
</view>
```

## 常见问题

### 1. 分割线不显示

**问题原因:**
- 父元素高度为0或被隐藏
- 颜色与背景色相同
- hairline 细线在某些设备上不明显

**解决方案:**

```vue
<!-- ✅ 正确: 确保父元素有足够空间 -->
<view class="container" style="min-height: 100vh;">
  <wd-divider />
</view>

<!-- ✅ 正确: 使用对比色 -->
<view style="background: #fff;">
  <wd-divider color="#333" />
</view>

<!-- ✅ 正确: 禁用细线效果 -->
<wd-divider :hairline="false" />

<!-- ❌ 错误: 颜色与背景相同 -->
<view style="background: #ebedf0;">
  <wd-divider color="#ebedf0" />
  <!-- 分割线与背景融为一体 -->
</view>
```

参考: src/wd/components/wd-divider/wd-divider.vue:60-61, 146-151

### 2. 垂直分割线文字不显示

**问题原因:**
- 垂直分割线不支持插槽内容
- vertical 为 true 时,插槽被条件渲染隐藏

**解决方案:**

```vue
<!-- ✅ 正确: 垂直分割线不使用插槽 -->
<view class="horizontal-layout">
  <text>选项1</text>
  <wd-divider vertical />
  <text>选项2</text>
</view>

<!-- ✅ 正确: 需要文字时使用水平分割线 -->
<view class="vertical-layout">
  <text>内容1</text>
  <wd-divider>分割文字</wd-divider>
  <text>内容2</text>
</view>

<!-- ❌ 错误: 垂直分割线使用插槽 -->
<wd-divider vertical>文字</wd-divider>
<!-- 文字不会显示 -->
```

参考: src/wd/components/wd-divider/wd-divider.vue:17, 59

### 3. 内容位置不生效

**问题原因:**
- 未提供插槽内容
- 拼写错误或值错误
- vertical 为 true 时,content-position 无效

**解决方案:**

```vue
<!-- ✅ 正确: 有插槽内容时设置位置 -->
<wd-divider content-position="left">左对齐</wd-divider>

<!-- ✅ 正确: 无插槽内容时不设置位置 -->
<wd-divider />

<!-- ❌ 错误: 无插槽内容但设置了位置 -->
<wd-divider content-position="left" />
<!-- 位置设置无意义 -->

<!-- ❌ 错误: 属性名拼写错误 -->
<wd-divider contentPosition="left">文字</wd-divider>
<!-- 应该是 content-position -->

<!-- ❌ 错误: 垂直分割线设置位置 -->
<wd-divider vertical content-position="left">
  文字
</wd-divider>
<!-- 垂直分割线不支持内容位置 -->
```

参考: src/wd/components/wd-divider/wd-divider.vue:54-55, 9-12

### 4. 虚线效果不明显

**问题原因:**
- 虚线间隔由浏览器默认渲染,可能较密集
- hairline 细线效果下虚线更不明显
- 颜色对比度不足

**解决方案:**

```vue
<!-- ✅ 正确: 禁用细线提升虚线可见度 -->
<wd-divider dashed :hairline="false" />

<!-- ✅ 正确: 使用深色虚线 -->
<wd-divider dashed color="#333" />

<!-- ✅ 正确: 使用 custom-style 自定义虚线 -->
<wd-divider
  dashed
  custom-style="
    border-width: 2px !important;
    border-style: dashed !important;
  "
/>

<!-- ❌ 错误: 细线 + 虚线 + 浅色 -->
<wd-divider dashed hairline color="#f0f0f0" />
<!-- 几乎看不见 -->
```

参考: src/wd/components/wd-divider/wd-divider.vue:57, 69, 154-159

### 5. 自定义样式不生效

**问题原因:**
- 未使用 `:deep()` 深度选择器
- 样式优先级不足
- 伪元素样式被覆盖

**解决方案:**

```vue
<!-- ✅ 正确: 使用 :deep() 深度选择器 -->
<template>
  <wd-divider custom-class="custom-divider">文字</wd-divider>
</template>

<style scoped>
:deep(.custom-divider) {
  color: #4dabf7;
  font-weight: bold;

  &::before,
  &::after {
    border-color: #4dabf7;
    border-width: 2px;
  }
}
</style>

<!-- ✅ 正确: 使用 custom-style -->
<wd-divider
  custom-style="
    color: #4dabf7;
    font-weight: bold;
  "
>
  文字
</wd-divider>

<!-- ✅ 正确: 使用 !important 提高优先级 -->
<style scoped>
:deep(.custom-divider::before) {
  border-color: #4dabf7 !important;
}
</style>

<!-- ❌ 错误: 未使用 :deep() -->
<style scoped>
.custom-divider {
  color: #4dabf7;
  /* scoped 样式无法穿透 */
}
</style>
```

参考: src/wd/components/wd-divider/wd-divider.vue:48-50, 13, 15

## 注意事项

1. **方向限制**: 垂直分割线(vertical)不支持插槽内容,文字内容只能用于水平分割线。

2. **细线实现**: hairline 通过 transform: scale(0.5) 实现,水平线缩小 Y 轴,垂直线缩小 X 轴。

3. **颜色继承**: color 属性同时控制文字颜色和线条颜色(border-color 继承 color)。

4. **内容位置**: content-position 仅在有插槽内容时生效,无内容时设置无意义。

5. **虚拟节点**: 组件启用 virtualHost,不会在 DOM 中创建额外包装元素。

6. **暗黑模式**: 组件支持暗黑模式,会自动切换线条和文字颜色,也可通过 color 属性覆盖。

7. **flex 布局**: 组件内部使用 flex 布局实现居中对齐,伪元素使用 flex: 1 平分空间。

8. **外边距**: 组件默认有上下外边距(--wot-divider-margin: 32rpx 0),可通过 custom-style 覆盖。

9. **垂直对齐**: 垂直分割线使用 vertical-align: middle 实现垂直居中对齐。

10. **样式隔离**: 组件使用 styleIsolation: 'shared',可以接收外部样式,但需要注意样式冲突。

11. **伪元素限制**: 由于使用伪元素实现线条,某些复杂样式(如渐变边框)可能需要使用 custom-style。

12. **兼容性**: 组件使用标准 CSS,兼容所有 UniApp 支持的平台(H5、小程序、App)。
