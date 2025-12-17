# 反馈组件

反馈组件用于操作反馈和用户提示，包括弹窗、提示、加载等交互场景。

## 组件列表

| 组件 | 说明 |
|------|------|
| ActionSheet | 动作面板 |
| DropMenu | 下拉菜单 |
| Fab | 浮动按钮 |
| Loading | 加载动画 |
| Loadmore | 加载更多 |
| MessageBox | 消息弹窗 |
| NoticeBar | 通知栏 |
| Notify | 消息通知 |
| Overlay | 遮罩层 |
| Popover | 气泡弹出框 |
| StatusTip | 状态提示 |
| SwipeAction | 滑动操作 |
| Toast | 轻提示 |
| Tooltip | 文字提示 |
| SortButton | 排序按钮 |

## 快速使用

### Toast 轻提示

```typescript
import { useToast } from '@/composables/useToast'

const toast = useToast()

// 基础用法
toast.show('提示信息')
toast.success('操作成功')
toast.error('操作失败')
toast.warning('警告信息')
toast.loading('加载中...')
```

### MessageBox 弹窗

```typescript
import { useModal } from '@/composables/useModal'

const modal = useModal()

// 确认框
modal.confirm({
  title: '提示',
  content: '确定要删除吗？',
  onConfirm: () => {
    // 确认操作
  }
})

// 输入框
modal.prompt({
  title: '请输入',
  placeholder: '请输入内容',
  onConfirm: (value) => {
    console.log(value)
  }
})
```

### ActionSheet 动作面板

```vue
<template>
  <wd-action-sheet
    v-model="visible"
    :actions="actions"
    @select="handleSelect"
  />
</template>

<script setup>
const actions = [
  { name: '选项一' },
  { name: '选项二' },
  { name: '选项三', color: '#ee0a24' }
]
</script>
```

### NoticeBar 通知栏

```vue
<template>
  <wd-notice-bar
    text="这是一条滚动通知"
    scrollable
    left-icon="volume"
  />
</template>
```

### Loading 加载

```vue
<template>
  <wd-loading />
  <wd-loading type="spinner" />
  <wd-loading size="48" color="#1989fa" />
</template>
```

### SwipeAction 滑动操作

```vue
<template>
  <wd-swipe-action>
    <wd-cell title="左滑查看操作" />
    <template #right>
      <wd-button type="error" square>删除</wd-button>
    </template>
  </wd-swipe-action>
</template>
```

### Popover 气泡

```vue
<template>
  <wd-popover placement="top">
    <template #reference>
      <wd-button>点击显示</wd-button>
    </template>
    气泡内容
  </wd-popover>
</template>
```

## 全局方法

通过 Composables 提供全局调用：

```typescript
// useToast - 轻提示
const toast = useToast()

// useModal - 弹窗
const modal = useModal()

// 在任意组件中使用
toast.success('操作成功')
modal.alert('提示信息')
```
