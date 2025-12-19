---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/navigation/fab
---

# Fab 悬浮按钮

## 介绍

`wd-fab` 是一个功能丰富的悬浮动作按钮组件(Floating Action Button),用于在页面上提供快捷操作入口。组件基于 Vue 3 Composition API 开发,支持菜单展开、拖拽定位、边缘磁吸等高级功能。

**核心特性:**

- **8种预设位置** - 支持左上、右上、左下、右下、左中、右中、上中、下中8种位置配置
- **4向菜单展开** - 支持向上、向下、向左、向右4个方向展开动作菜单
- **拖拽功能** - 支持触摸拖拽改变位置,拖拽过程实时跟随手指
- **边缘磁吸** - 拖拽释放后自动吸附到最近的左侧或右侧边缘
- **队列管理** - 内置队列机制,确保同一时间只有一个FAB展开
- **安全区适配** - 自动适配状态栏、导航栏、底部安全区域
- **自定义触发器** - 支持完全自定义触发按钮的外观
- **受控/非受控模式** - 支持通过 v-model 控制或组件内部状态管理
- **平滑过渡动画** - 使用 cubic-bezier 曲线实现流畅的展开/收起动画
- **暗黑模式支持** - 完整支持暗黑主题

**技术实现:**

组件使用 fixed 定位实现悬浮效果,通过 touchstart/touchmove/touchend 事件处理拖拽逻辑。内部使用 clickoutside 模块进行队列管理,确保多个FAB实例之间的互斥展开。磁吸效果通过判断按钮中心点与屏幕中心的位置关系,使用 CSS transition 实现平滑吸附动画。

## 平台兼容性

| 平台 | 支持情况 | 说明 |
|------|----------|------|
| 微信小程序 | ✅ | 完全支持 |
| 支付宝小程序 | ✅ | 完全支持 |
| 百度小程序 | ✅ | 完全支持 |
| 字节小程序 | ✅ | 完全支持 |
| QQ小程序 | ✅ | 完全支持 |
| H5 | ✅ | 完全支持 |
| App | ✅ | 完全支持 |

## 基本用法

### 基础用法

最简单的悬浮按钮使用,点击可展开动作菜单。

```vue
<template>
  <view class="page">
    <wd-fab>
      <wd-button round type="success" size="small">
        <wd-icon name="edit" />
      </wd-button>
      <wd-button round type="warning" size="small">
        <wd-icon name="share" />
      </wd-button>
      <wd-button round type="error" size="small">
        <wd-icon name="delete" />
      </wd-button>
    </wd-fab>
  </view>
</template>
```

**使用说明:**

- 默认位置为右下角(right-bottom)
- 默认向上展开(top)
- 点击主按钮展开菜单,再次点击或点击其他区域收起
- 默认图标为 + 号,激活后变为 × 号

### 位置配置

通过 `position` 属性设置悬浮按钮的初始位置,支持8种预设位置。

```vue
<template>
  <view class="page">
    <!-- 四角位置 -->
    <wd-fab position="left-top">
      <wd-button round size="small">左上</wd-button>
    </wd-fab>

    <wd-fab position="right-top">
      <wd-button round size="small">右上</wd-button>
    </wd-fab>

    <wd-fab position="left-bottom">
      <wd-button round size="small">左下</wd-button>
    </wd-fab>

    <wd-fab position="right-bottom">
      <wd-button round size="small">右下</wd-button>
    </wd-fab>

    <!-- 边缘居中位置 -->
    <wd-fab position="left-center">
      <wd-button round size="small">左中</wd-button>
    </wd-fab>

    <wd-fab position="right-center">
      <wd-button round size="small">右中</wd-button>
    </wd-fab>

    <wd-fab position="top-center">
      <wd-button round size="small">上中</wd-button>
    </wd-fab>

    <wd-fab position="bottom-center">
      <wd-button round size="small">下中</wd-button>
    </wd-fab>
  </view>
</template>
```

**位置说明:**

| 位置值 | 说明 | 默认展开方向 |
|--------|------|-------------|
| `left-top` | 左上角 | 向右或向下 |
| `right-top` | 右上角 | 向左或向下 |
| `left-bottom` | 左下角 | 向右或向上 |
| `right-bottom` | 右下角(默认) | 向左或向上 |
| `left-center` | 左侧居中 | 向右 |
| `right-center` | 右侧居中 | 向左 |
| `top-center` | 顶部居中 | 向下 |
| `bottom-center` | 底部居中 | 向上 |

### 展开方向

通过 `direction` 属性设置菜单的展开方向。

```vue
<template>
  <view class="page">
    <!-- 向上展开(默认) -->
    <wd-fab direction="top" position="right-bottom">
      <wd-button round size="small">操作1</wd-button>
      <wd-button round size="small">操作2</wd-button>
    </wd-fab>

    <!-- 向下展开 -->
    <wd-fab direction="bottom" position="right-top">
      <wd-button round size="small">操作1</wd-button>
      <wd-button round size="small">操作2</wd-button>
    </wd-fab>

    <!-- 向左展开 -->
    <wd-fab direction="left" position="right-center">
      <wd-button round size="small">操作1</wd-button>
      <wd-button round size="small">操作2</wd-button>
    </wd-fab>

    <!-- 向右展开 -->
    <wd-fab direction="right" position="left-center">
      <wd-button round size="small">操作1</wd-button>
      <wd-button round size="small">操作2</wd-button>
    </wd-fab>
  </view>
</template>
```

**方向与位置的最佳搭配:**

| 位置 | 推荐方向 | 说明 |
|------|---------|------|
| `right-bottom` | `top` 或 `left` | 菜单向上或向左展开 |
| `left-bottom` | `top` 或 `right` | 菜单向上或向右展开 |
| `right-top` | `bottom` 或 `left` | 菜单向下或向左展开 |
| `left-top` | `bottom` 或 `right` | 菜单向下或向右展开 |

### 按钮类型

通过 `type` 属性设置主按钮的颜色类型。

```vue
<template>
  <view class="page">
    <wd-fab type="primary" position="left-top">
      <wd-button round size="small">Primary</wd-button>
    </wd-fab>

    <wd-fab type="success" position="right-top">
      <wd-button round size="small">Success</wd-button>
    </wd-fab>

    <wd-fab type="warning" position="left-bottom">
      <wd-button round size="small">Warning</wd-button>
    </wd-fab>

    <wd-fab type="error" position="right-bottom">
      <wd-button round size="small">Error</wd-button>
    </wd-fab>

    <wd-fab type="info" position="left-center">
      <wd-button round size="small">Info</wd-button>
    </wd-fab>

    <wd-fab type="default" position="right-center">
      <wd-button round size="small">Default</wd-button>
    </wd-fab>
  </view>
</template>
```

### 自定义图标

通过 `inactive-icon` 和 `active-icon` 属性自定义收起和展开状态的图标。

```vue
<template>
  <view class="page">
    <!-- 自定义图标 -->
    <wd-fab inactive-icon="add" active-icon="close">
      <wd-button round size="small">操作1</wd-button>
      <wd-button round size="small">操作2</wd-button>
    </wd-fab>

    <!-- 客服图标 -->
    <wd-fab inactive-icon="customer-service" active-icon="close">
      <wd-button round size="small">在线客服</wd-button>
      <wd-button round size="small">电话客服</wd-button>
    </wd-fab>

    <!-- 设置图标 -->
    <wd-fab inactive-icon="setting" active-icon="close" type="info">
      <wd-button round size="small">主题</wd-button>
      <wd-button round size="small">语言</wd-button>
    </wd-fab>
  </view>
</template>
```

### 可拖拽

设置 `draggable` 属性启用拖拽功能,用户可以自由拖动悬浮按钮位置。

```vue
<template>
  <view class="page">
    <wd-fab draggable>
      <wd-button round size="small">操作1</wd-button>
      <wd-button round size="small">操作2</wd-button>
    </wd-fab>
  </view>
</template>
```

**拖拽功能说明:**

- 触摸按钮开始拖拽,按钮会跟随手指移动
- 拖拽范围受限于安全区域(避开状态栏、导航栏、底部安全区)
- 释放后按钮会自动吸附到左侧或右侧边缘(磁吸效果)
- 吸附时菜单展开方向会自动调整(左侧向右展开,右侧向左展开)

### 磁吸效果详解

```vue
<template>
  <view class="page">
    <wd-fab draggable position="right-center">
      <wd-button round size="small">试试拖拽我</wd-button>
    </wd-fab>

    <view class="hint">
      <text>拖拽悬浮按钮后释放</text>
      <text>按钮会自动吸附到最近的边缘</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hint {
  position: fixed;
  bottom: 200rpx;
  left: 0;
  right: 0;
  text-align: center;

  text {
    display: block;
    font-size: 28rpx;
    color: #999;
    line-height: 1.8;
  }
}
</style>
```

**磁吸算法说明:**

1. 计算按钮中心点的X坐标
2. 与屏幕中心点X坐标比较
3. 如果按钮中心在屏幕左半边,吸附到左侧
4. 如果按钮中心在屏幕右半边,吸附到右侧
5. 吸附过程使用 300ms 的 ease 过渡动画

### 不可展开模式

设置 `expandable` 为 `false` 禁用菜单展开,此时FAB作为单一按钮使用,点击触发 `click` 事件。

```vue
<template>
  <view class="page">
    <wd-fab :expandable="false" @click="handleClick">
      <template #trigger>
        <view class="single-fab">
          <wd-icon name="add" color="#fff" size="48rpx" />
        </view>
      </template>
    </wd-fab>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleClick = () => {
  toast.info('点击了悬浮按钮')
}
</script>

<style lang="scss" scoped>
.single-fab {
  width: 112rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}
</style>
```

### 禁用状态

设置 `disabled` 禁用悬浮按钮,禁用后无法点击和拖拽。

```vue
<template>
  <view class="page">
    <wd-fab disabled>
      <wd-button round size="small">操作</wd-button>
    </wd-fab>

    <wd-button @click="disabled = !disabled">
      {{ disabled ? '启用' : '禁用' }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const disabled = ref(true)
</script>
```

### 受控模式

通过 `v-model:active` 可以外部控制菜单的展开/收起状态。

```vue
<template>
  <view class="page">
    <wd-fab v-model:active="isActive">
      <wd-button round size="small" @click="handleAction('edit')">
        <wd-icon name="edit" />
      </wd-button>
      <wd-button round size="small" @click="handleAction('share')">
        <wd-icon name="share" />
      </wd-button>
    </wd-fab>

    <view class="controls">
      <wd-button type="primary" @click="isActive = true">展开菜单</wd-button>
      <wd-button @click="isActive = false">收起菜单</wd-button>
    </view>

    <view class="status">
      当前状态: {{ isActive ? '展开' : '收起' }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const isActive = ref(false)

const handleAction = (action: string) => {
  toast.success(`执行操作: ${action}`)
  isActive.value = false // 执行操作后收起菜单
}
</script>
```

### 自定义间距

通过 `gap` 属性配置悬浮按钮与屏幕边缘的间距。

```vue
<template>
  <view class="page">
    <!-- 自定义四周间距 -->
    <wd-fab :gap="{ top: 100, right: 32, bottom: 100, left: 32 }">
      <wd-button round size="small">操作</wd-button>
    </wd-fab>

    <!-- 只自定义底部间距(避开TabBar) -->
    <wd-fab :gap="{ bottom: 120 }" position="right-bottom">
      <wd-button round size="small">操作</wd-button>
    </wd-fab>
  </view>
</template>
```

**间距说明:**

- `top`: 距离顶部的最小间距(默认16)
- `right`: 距离右侧的最小间距(默认16)
- `bottom`: 距离底部的最小间距(默认16)
- `left`: 距离左侧的最小间距(默认16)

### 自定义触发器

通过 `trigger` 插槽可以完全自定义触发按钮的外观。

```vue
<template>
  <view class="page">
    <!-- 渐变背景的客服按钮 -->
    <wd-fab>
      <template #trigger>
        <view class="custom-trigger gradient">
          <wd-icon name="customer-service" size="48rpx" color="#fff" />
        </view>
      </template>
      <wd-button round size="small" type="primary">在线客服</wd-button>
      <wd-button round size="small">常见问题</wd-button>
    </wd-fab>

    <!-- 带文字的按钮 -->
    <wd-fab position="left-bottom">
      <template #trigger>
        <view class="custom-trigger with-text">
          <wd-icon name="add" size="32rpx" color="#fff" />
          <text>新建</text>
        </view>
      </template>
      <wd-button round size="small">新建文档</wd-button>
      <wd-button round size="small">新建表格</wd-button>
      <wd-button round size="small">新建演示</wd-button>
    </wd-fab>

    <!-- 圆角矩形按钮 -->
    <wd-fab position="right-top" direction="bottom">
      <template #trigger>
        <view class="custom-trigger rounded-rect">
          <wd-icon name="menu" size="40rpx" color="#333" />
        </view>
      </template>
      <wd-button round size="small">设置</wd-button>
      <wd-button round size="small">关于</wd-button>
    </wd-fab>
  </view>
</template>

<style lang="scss" scoped>
.custom-trigger {
  display: flex;
  align-items: center;
  justify-content: center;

  &.gradient {
    width: 112rpx;
    height: 112rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  }

  &.with-text {
    flex-direction: column;
    gap: 4rpx;
    width: 120rpx;
    height: 120rpx;
    background: #1890ff;
    border-radius: 50%;

    text {
      font-size: 20rpx;
      color: #fff;
    }
  }

  &.rounded-rect {
    width: 100rpx;
    height: 80rpx;
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
}
</style>
```

### 方法调用

通过 ref 获取组件实例,可以调用 `open()` 和 `close()` 方法控制菜单。

```vue
<template>
  <view class="page">
    <wd-fab ref="fabRef">
      <wd-button round size="small">操作1</wd-button>
      <wd-button round size="small">操作2</wd-button>
    </wd-fab>

    <view class="controls">
      <wd-button type="primary" @click="handleOpen">展开</wd-button>
      <wd-button @click="handleClose">收起</wd-button>
      <wd-button type="info" @click="handleToggle">切换</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const fabRef = ref()
const isOpen = ref(false)

const handleOpen = () => {
  fabRef.value?.open()
  isOpen.value = true
}

const handleClose = () => {
  fabRef.value?.close()
  isOpen.value = false
}

const handleToggle = () => {
  if (isOpen.value) {
    handleClose()
  } else {
    handleOpen()
  }
}
</script>
```

### 层级控制

通过 `z-index` 属性控制悬浮按钮的层级,解决被其他元素遮挡的问题。

```vue
<template>
  <view class="page">
    <!-- 默认层级99 -->
    <wd-fab :z-index="999">
      <wd-button round size="small">高层级</wd-button>
    </wd-fab>

    <!-- 可能会被遮挡 -->
    <wd-fab :z-index="1" position="left-bottom">
      <wd-button round size="small">低层级</wd-button>
    </wd-fab>
  </view>
</template>
```

## 高级用法

### 快捷操作菜单

实现常见的快捷操作入口。

```vue
<template>
  <view class="page">
    <wd-fab type="primary">
      <wd-button round type="success" size="small" @click="handleAdd">
        <wd-icon name="add" />
      </wd-button>
      <wd-button round type="info" size="small" @click="handleScan">
        <wd-icon name="scan" />
      </wd-button>
      <wd-button round type="warning" size="small" @click="handleShare">
        <wd-icon name="share" />
      </wd-button>
      <wd-button round type="error" size="small" @click="handleDelete">
        <wd-icon name="delete" />
      </wd-button>
    </wd-fab>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const handleAdd = () => {
  uni.navigateTo({ url: '/pages/add/index' })
}

const handleScan = () => {
  uni.scanCode({
    success: (res) => {
      toast.success(`扫码结果: ${res.result}`)
    },
    fail: () => {
      toast.error('扫码失败')
    }
  })
}

const handleShare = () => {
  uni.share({
    provider: 'weixin',
    type: 0,
    title: '分享标题',
    summary: '分享描述',
    success: () => toast.success('分享成功'),
    fail: () => toast.error('分享失败')
  })
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复',
    success: (res) => {
      if (res.confirm) {
        toast.success('删除成功')
      }
    }
  })
}
</script>
```

### 客服入口

实现在线客服悬浮入口。

```vue
<template>
  <view class="page">
    <wd-fab
      position="right-bottom"
      :expandable="false"
      @click="openCustomerService"
    >
      <template #trigger>
        <view class="service-btn">
          <wd-icon name="customer-service" color="#fff" size="44rpx" />
          <view v-if="unreadCount > 0" class="badge">{{ unreadCount }}</view>
        </view>
      </template>
    </wd-fab>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const unreadCount = ref(0)

onMounted(() => {
  // 获取未读消息数
  fetchUnreadCount()
})

const fetchUnreadCount = async () => {
  // 模拟获取未读数
  unreadCount.value = 3
}

const openCustomerService = () => {
  // 跳转客服页面
  uni.navigateTo({ url: '/pages/customer-service/index' })
}
</script>

<style lang="scss" scoped>
.service-btn {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(0, 114, 255, 0.4);

  .badge {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 36rpx;
    height: 36rpx;
    padding: 0 8rpx;
    font-size: 22rpx;
    color: #fff;
    background: #f56c6c;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
```

### 返回顶部

根据滚动位置动态显示返回顶部按钮。

```vue
<template>
  <view class="page">
    <!-- 长列表内容 -->
    <view class="list">
      <view v-for="i in 50" :key="i" class="list-item">
        列表项 {{ i }}
      </view>
    </view>

    <!-- 返回顶部按钮 -->
    <wd-fab
      v-show="showBackTop"
      position="right-bottom"
      type="default"
      :expandable="false"
      :gap="{ bottom: 120 }"
      @click="scrollToTop"
    >
      <template #trigger>
        <view class="back-top-btn">
          <wd-icon name="arrow-up" size="40rpx" />
        </view>
      </template>
    </wd-fab>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showBackTop = ref(false)

// 监听页面滚动
onPageScroll((e) => {
  showBackTop.value = e.scrollTop > 500
})

const scrollToTop = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300
  })
}
</script>

<style lang="scss" scoped>
.list-item {
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.back-top-btn {
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}
</style>
```

### 多功能工具栏

实现带有多个功能的工具栏。

```vue
<template>
  <view class="page">
    <wd-fab v-model:active="isActive" draggable>
      <wd-button round size="small" type="primary" @click="handleNew">
        <wd-icon name="add" />
        <text>新建</text>
      </wd-button>
      <wd-button round size="small" type="success" @click="handleSave">
        <wd-icon name="check" />
        <text>保存</text>
      </wd-button>
      <wd-button round size="small" type="warning" @click="handleExport">
        <wd-icon name="download" />
        <text>导出</text>
      </wd-button>
      <wd-button round size="small" type="info" @click="handlePrint">
        <wd-icon name="print" />
        <text>打印</text>
      </wd-button>
    </wd-fab>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@/wd'

const toast = useToast()
const isActive = ref(false)

const closeMenu = () => {
  isActive.value = false
}

const handleNew = () => {
  closeMenu()
  toast.info('新建文档')
}

const handleSave = () => {
  closeMenu()
  toast.loading('保存中...')
  setTimeout(() => {
    toast.close()
    toast.success('保存成功')
  }, 1500)
}

const handleExport = () => {
  closeMenu()
  toast.info('开始导出')
}

const handlePrint = () => {
  closeMenu()
  toast.info('准备打印')
}
</script>
```

### 带标签的菜单

展开菜单项带有文字说明。

```vue
<template>
  <view class="page">
    <wd-fab direction="top">
      <view v-for="item in actions" :key="item.key" class="action-item" @click="handleAction(item)">
        <view class="action-label">{{ item.label }}</view>
        <wd-button round :type="item.type" size="small">
          <wd-icon :name="item.icon" />
        </wd-button>
      </view>
    </wd-fab>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

const actions = [
  { key: 'photo', icon: 'photo', label: '拍照', type: 'primary' as const },
  { key: 'album', icon: 'album', label: '相册', type: 'success' as const },
  { key: 'file', icon: 'folder', label: '文件', type: 'warning' as const },
]

const handleAction = (item: typeof actions[0]) => {
  toast.info(`选择: ${item.label}`)
}
</script>

<style lang="scss" scoped>
.action-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;

  .action-label {
    padding: 8rpx 16rpx;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 24rpx;
    border-radius: 8rpx;
    white-space: nowrap;
  }
}
</style>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model:active | 是否激活(展开)状态 | `boolean` | `false` |
| type | 按钮类型 | `FabType` | `'primary'` |
| position | 按钮初始位置 | `FabPosition` | `'right-bottom'` |
| direction | 菜单展开方向 | `FabDirection` | `'top'` |
| inactive-icon | 未激活时的图标 | `string` | `'add'` |
| active-icon | 激活时的图标 | `string` | `'close'` |
| disabled | 是否禁用 | `boolean` | `false` |
| draggable | 是否可拖拽 | `boolean` | `false` |
| expandable | 是否可展开菜单 | `boolean` | `true` |
| z-index | 层级 | `number` | `99` |
| gap | 与屏幕边缘的间距 | `FabGap` | `{}` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:active | 激活状态变化时触发 | `active: boolean` |
| click | 点击按钮时触发(仅expandable为false时) | - |

### Slots

| 名称 | 说明 |
|------|------|
| default | 菜单内容,展开时显示 |
| trigger | 自定义触发按钮 |

### Methods

通过 ref 获取组件实例后可调用以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 展开菜单 | - | `void` |
| close | 收起菜单 | - | `void` |

### 类型定义

```typescript
/**
 * 悬浮按钮类型
 */
type FabType = 'primary' | 'success' | 'info' | 'warning' | 'error' | 'default'

/**
 * 悬浮按钮位置
 */
type FabPosition =
  | 'left-top'
  | 'right-top'
  | 'left-bottom'
  | 'right-bottom'
  | 'left-center'
  | 'right-center'
  | 'top-center'
  | 'bottom-center'

/**
 * 悬浮按钮菜单展开方向
 */
type FabDirection = 'top' | 'right' | 'bottom' | 'left'

/**
 * 悬浮按钮间距配置
 */
type FabGap = Partial<Record<FabDirection, number>>

/**
 * 悬浮按钮组件属性接口
 */
interface WdFabProps {
  /** 自定义根节点样式 */
  customStyle?: string
  /** 自定义根节点样式类 */
  customClass?: string
  /** 是否激活 */
  active?: boolean
  /** 类型 */
  type?: FabType
  /** 悬浮按钮位置 */
  position?: FabPosition
  /** 悬浮按钮菜单弹出方向 */
  direction?: FabDirection
  /** 是否禁用 */
  disabled?: boolean
  /** 悬浮按钮未展开时的图标 */
  inactiveIcon?: string
  /** 悬浮按钮展开时的图标 */
  activeIcon?: string
  /** 自定义悬浮按钮层级 */
  zIndex?: number
  /** 是否可拖动 */
  draggable?: boolean
  /** 悬浮按钮间距配置 */
  gap?: FabGap
  /** 用于控制点击时是否展开菜单 */
  expandable?: boolean
}

/**
 * 悬浮按钮组件事件接口
 */
interface WdFabEmits {
  /** 更新激活状态 */
  'update:active': [active: boolean]
  /** 点击事件 */
  click: []
}

/**
 * 悬浮按钮组件暴露方法接口
 */
interface WdFabExpose {
  /** 展开菜单 */
  open: () => void
  /** 收起菜单 */
  close: () => void
}

/**
 * 悬浮按钮组件实例类型
 */
type FabInstance = ComponentPublicInstance<WdFabProps, WdFabExpose>
```

## 主题定制

组件提供了以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wd-fab-trigger-width | 触发按钮宽度 | `112rpx` |
| --wd-fab-trigger-height | 触发按钮高度 | `112rpx` |
| --wd-fab-icon-fs | 图标大小 | `48rpx` |
| --wd-fab-actions-padding | 菜单项间距 | `16rpx` |

### 自定义主题示例

```vue
<template>
  <view class="custom-fab-page">
    <wd-fab>
      <wd-button round size="small">操作</wd-button>
    </wd-fab>
  </view>
</template>

<style lang="scss">
.custom-fab-page {
  // 更大的按钮
  --wd-fab-trigger-width: 140rpx;
  --wd-fab-trigger-height: 140rpx;
  --wd-fab-icon-fs: 56rpx;

  // 更大的菜单间距
  --wd-fab-actions-padding: 24rpx;
}
</style>
```

### 暗黑模式

组件内置暗黑模式样式支持,在页面添加 `wot-theme-dark` 类名即可启用:

```vue
<template>
  <view class="wot-theme-dark">
    <wd-fab type="primary">
      <wd-button round size="small">操作</wd-button>
    </wd-fab>
  </view>
</template>
```

## 最佳实践

### 1. 合理选择位置

根据页面布局和操作习惯选择合适的位置:

```vue
<!-- ✅ 推荐: 常用操作放右下角,符合右手操作习惯 -->
<wd-fab position="right-bottom" />

<!-- ✅ 推荐: 有TabBar时增加底部间距 -->
<wd-fab position="right-bottom" :gap="{ bottom: 120 }" />

<!-- ❌ 避免: 不要遮挡重要内容 -->
<wd-fab position="top-center" />
```

### 2. 控制菜单项数量

菜单项不宜过多,建议3-5个:

```vue
<!-- ✅ 推荐: 3-5个常用操作 -->
<wd-fab>
  <wd-button round size="small">操作1</wd-button>
  <wd-button round size="small">操作2</wd-button>
  <wd-button round size="small">操作3</wd-button>
</wd-fab>

<!-- ❌ 避免: 操作过多,考虑使用其他组件 -->
<wd-fab>
  <wd-button v-for="i in 10" :key="i" round size="small">操作{{ i }}</wd-button>
</wd-fab>
```

### 3. 配合手势操作

拖拽功能适合需要用户自定义位置的场景:

```vue
<!-- ✅ 推荐: 工具类按钮启用拖拽 -->
<wd-fab draggable>
  <wd-button round size="small">工具</wd-button>
</wd-fab>

<!-- ❌ 避免: 核心功能按钮不建议拖拽,容易误触 -->
<wd-fab draggable :expandable="false" @click="criticalAction" />
```

### 4. 操作反馈

执行操作后给予用户反馈:

```vue
<script lang="ts" setup>
const handleAction = async () => {
  // ✅ 推荐: 操作后收起菜单并给予反馈
  isActive.value = false
  toast.loading('处理中...')

  try {
    await doSomething()
    toast.success('操作成功')
  } catch {
    toast.error('操作失败')
  }
}
</script>
```

## 常见问题

### 1. 按钮位置不正确?

**可能原因:**
- 页面有 transform 属性影响 fixed 定位
- 父容器有 overflow: hidden

**解决方案:**
- 检查父容器样式,移除影响定位的属性
- 将 FAB 放在页面根级别

### 2. 拖拽后位置会重置?

**说明:**
拖拽位置不会自动持久化。如需保存位置,可以手动处理。

**解决方案:**

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 从本地存储恢复位置
  const savedPosition = uni.getStorageSync('fabPosition')
  if (savedPosition) {
    // 通过gap属性设置初始位置
  }
})

// 监听位置变化并保存
// 注意: 需要组件暴露位置信息
</script>
```

### 3. 多个FAB同时展开?

**说明:**
组件内置了队列管理,同一时间只会有一个FAB展开。这是设计行为,无需处理。

### 4. 菜单展开方向不对?

**解决方案:**
根据按钮位置设置合适的展开方向:

```vue
<!-- 右下角按钮向上展开 -->
<wd-fab position="right-bottom" direction="top" />

<!-- 右上角按钮向下展开 -->
<wd-fab position="right-top" direction="bottom" />

<!-- 拖拽模式会自动调整方向 -->
<wd-fab draggable />
```

### 5. 点击菜单项后菜单不关闭?

**解决方案:**
在点击处理函数中手动关闭菜单:

```vue
<script lang="ts" setup>
const isActive = ref(false)

const handleAction = () => {
  // 执行操作...
  isActive.value = false // 手动关闭
}
</script>
```

### 6. 按钮被其他元素遮挡?

**解决方案:**
调整 z-index:

```vue
<wd-fab :z-index="9999" />
```

### 7. 如何禁用磁吸效果?

**说明:**
目前磁吸效果是拖拽功能的默认行为,无法单独禁用。如需自由定位,可以考虑自定义实现。

### 8. 安全区域适配问题?

**说明:**
组件会自动适配安全区域。如果仍有问题,可以通过 gap 属性手动调整:

```vue
<!-- 增加底部间距适配刘海屏 -->
<wd-fab :gap="{ bottom: 50 }" />
```

## 总结

`wd-fab` 悬浮按钮组件核心使用要点:

1. **位置选择** - 根据页面布局选择合适的 position,常用右下角
2. **展开方向** - 根据位置设置合理的 direction,避免菜单超出屏幕
3. **拖拽功能** - 工具类按钮可启用 draggable,核心功能不建议
4. **菜单项数量** - 建议3-5个,过多考虑其他组件方案
5. **操作反馈** - 执行操作后及时给予用户反馈并收起菜单
6. **层级控制** - 使用 z-index 解决遮挡问题
7. **安全区适配** - 使用 gap 属性调整边距
