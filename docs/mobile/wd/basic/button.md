# Button 按钮

按钮组件，用于触发操作。支持多种类型、尺寸、状态，提供丰富的定制选项。

## 📋 功能特性

- **多种类型**: primary、success、warning、danger、info、default
- **多种尺寸**: large、medium、small、mini
- **多种形状**: 默认、圆角、圆形
- **状态控制**: 禁用、加载中、朴素风格
- **图标支持**: 支持前置/后置图标
- **块级按钮**: 支持100%宽度的块级按钮

## 🎯 基础用法

### 按钮类型

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button>默认按钮</wd-button>
      <wd-button type="primary">主要按钮</wd-button>
      <wd-button type="success">成功按钮</wd-button>
    </view>

    <view class="demo-row">
      <wd-button type="warning">警告按钮</wd-button>
      <wd-button type="danger">危险按钮</wd-button>
      <wd-button type="info">信息按钮</wd-button>
    </view>
  </view>
</template>

<script setup>
// 无需额外逻辑
</script>

<style lang="scss" scoped>
.demo-block {
  padding: 20rpx;
}

.demo-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}
</style>
```

### 朴素按钮

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button plain>朴素按钮</wd-button>
      <wd-button type="primary" plain>主要按钮</wd-button>
      <wd-button type="success" plain>成功按钮</wd-button>
    </view>
  </view>
</template>
```

### 禁用状态

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button disabled>禁用按钮</wd-button>
      <wd-button type="primary" disabled>主要按钮</wd-button>
      <wd-button type="success" disabled plain>朴素按钮</wd-button>
    </view>
  </view>
</template>
```

## 📏 按钮尺寸

### 不同尺寸

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button type="primary" size="large">大号按钮</wd-button>
    </view>

    <view class="demo-row">
      <wd-button type="primary" size="medium">中号按钮</wd-button>
    </view>

    <view class="demo-row">
      <wd-button type="primary" size="small">小号按钮</wd-button>
    </view>

    <view class="demo-row">
      <wd-button type="primary" size="mini">迷你按钮</wd-button>
    </view>
  </view>
</template>
```

### 块级按钮

```vue
<template>
  <view class="demo-block">
    <wd-button type="primary" block>块级按钮</wd-button>
    <wd-button type="warning" block custom-style="margin-top: 20rpx">
      块级按钮
    </wd-button>
  </view>
</template>
```

## 🎨 按钮形状

### 圆角按钮

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button type="primary" round>圆角按钮</wd-button>
      <wd-button type="success" round plain>圆角按钮</wd-button>
    </view>
  </view>
</template>
```

### 圆形按钮

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button type="primary" round icon="add" />
      <wd-button type="success" round icon="search" />
      <wd-button type="warning" round icon="setting" />
      <wd-button type="danger" round icon="close" />
    </view>
  </view>
</template>
```

## 🔄 加载状态

### 加载中按钮

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button type="primary" :loading="loading1" @click="handleClick1">
        {{ loading1 ? '加载中...' : '点击加载' }}
      </wd-button>

      <wd-button
        type="success"
        :loading="loading2"
        loading-text="处理中"
        @click="handleClick2">
        自定义加载文本
      </wd-button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const loading1 = ref(false)
const loading2 = ref(false)

const handleClick1 = () => {
  loading1.value = true
  setTimeout(() => {
    loading1.value = false
    uni.showToast({
      title: '操作完成',
      icon: 'success'
    })
  }, 2000)
}

const handleClick2 = () => {
  loading2.value = true
  setTimeout(() => {
    loading2.value = false
    uni.showToast({
      title: '处理完成',
      icon: 'success'
    })
  }, 3000)
}
</script>
```

## 🎯 图标按钮

### 前置图标

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button type="primary" icon="add">新增</wd-button>
      <wd-button type="success" icon="search">搜索</wd-button>
      <wd-button type="warning" icon="edit">编辑</wd-button>
      <wd-button type="danger" icon="delete">删除</wd-button>
    </view>
  </view>
</template>
```

### 后置图标

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button type="primary" suffix-icon="arrow-right">
        下一步
      </wd-button>
      <wd-button type="default" suffix-icon="arrow-down">
        展开
      </wd-button>
    </view>
  </view>
</template>
```

### 仅图标按钮

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button type="primary" icon="add" />
      <wd-button type="success" icon="search" />
      <wd-button type="warning" icon="edit" />
      <wd-button type="danger" icon="delete" />
    </view>
  </view>
</template>
```

## 🎨 自定义样式

### 自定义颜色

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button
        custom-style="background: linear-gradient(45deg, #ff6b6b, #feca57); border: none;">
        渐变按钮
      </wd-button>

      <wd-button
        plain
        custom-style="color: #7c4dff; border-color: #7c4dff;">
        自定义颜色
      </wd-button>
    </view>
  </view>
</template>
```

### 自定义尺寸

```vue
<template>
  <view class="demo-block">
    <view class="demo-row">
      <wd-button
        type="primary"
        custom-style="height: 100rpx; font-size: 32rpx;">
        超大按钮
      </wd-button>
    </view>

    <view class="demo-row">
      <wd-button
        type="primary"
        custom-style="height: 60rpx; font-size: 24rpx; padding: 0 30rpx;">
        自定义尺寸
      </wd-button>
    </view>
  </view>
</template>
```

## 💼 业务场景

### 表单提交

```vue
<template>
  <view class="form-container">
    <wd-cell-group>
      <wd-input v-model="form.name" label="姓名" placeholder="请输入姓名" />
      <wd-input v-model="form.email" label="邮箱" placeholder="请输入邮箱" />
    </wd-cell-group>

    <view class="button-group">
      <wd-button
        type="primary"
        block
        :loading="submitting"
        @click="handleSubmit">
        {{ submitting ? '提交中...' : '提交' }}
      </wd-button>

      <wd-button
        block
        custom-style="margin-top: 20rpx"
        @click="handleReset">
        重置
      </wd-button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  name: '',
  email: ''
})

const submitting = ref(false)

const handleSubmit = async () => {
  if (!form.name || !form.email) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  submitting.value = true

  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 2000))

    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  form.name = ''
  form.email = ''

  uni.showToast({
    title: '已重置',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.form-container {
  padding: 20rpx;
}

.button-group {
  margin-top: 60rpx;
}
</style>
```

### 操作确认

```vue
<template>
  <view class="action-container">
    <wd-cell-group title="危险操作">
      <wd-cell title="清空数据" is-link @click="showClearConfirm">
        <template #right-icon>
          <wd-icon name="arrow-right" />
        </template>
      </wd-cell>

      <wd-cell title="删除账户" is-link @click="showDeleteConfirm">
        <template #right-icon>
          <wd-icon name="arrow-right" />
        </template>
      </wd-cell>
    </wd-cell-group>

    <!-- 确认对话框 -->
    <wd-message-box
      v-model="confirmVisible"
      :title="confirmTitle"
      :content="confirmContent"
      :show-cancel-button="true"
      @confirm="handleConfirm"
      @cancel="handleCancel">

      <template #footer>
        <wd-button
          block
          @click="handleCancel"
          custom-style="margin-bottom: 20rpx;">
          取消
        </wd-button>
        <wd-button
          type="danger"
          block
          :loading="confirming"
          @click="handleConfirm">
          {{ confirming ? '处理中...' : '确认' }}
        </wd-button>
      </template>
    </wd-message-box>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const confirmVisible = ref(false)
const confirmTitle = ref('')
const confirmContent = ref('')
const confirming = ref(false)
const currentAction = ref('')

const showClearConfirm = () => {
  confirmTitle.value = '清空数据'
  confirmContent.value = '此操作将清空所有数据，且无法恢复，是否继续？'
  currentAction.value = 'clear'
  confirmVisible.value = true
}

const showDeleteConfirm = () => {
  confirmTitle.value = '删除账户'
  confirmContent.value = '此操作将永久删除您的账户，且无法恢复，是否继续？'
  currentAction.value = 'delete'
  confirmVisible.value = true
}

const handleConfirm = async () => {
  confirming.value = true

  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (currentAction.value === 'clear') {
      uni.showToast({
        title: '数据已清空',
        icon: 'success'
      })
    } else if (currentAction.value === 'delete') {
      uni.showToast({
        title: '账户已删除',
        icon: 'success'
      })
    }

    confirmVisible.value = false
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    confirming.value = false
  }
}

const handleCancel = () => {
  confirmVisible.value = false
  currentAction.value = ''
}
</script>
```

## 📚 API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 按钮类型 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| size | 按钮尺寸 | `'large' \| 'medium' \| 'small' \| 'mini'` | `'medium'` |
| plain | 是否为朴素按钮 | `boolean` | `false` |
| round | 是否为圆角按钮 | `boolean` | `false` |
| block | 是否为块级按钮 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否显示加载状态 | `boolean` | `false` |
| loading-text | 加载状态文字 | `string` | - |
| icon | 前置图标名称 | `string` | - |
| suffix-icon | 后置图标名称 | `string` | - |
| custom-style | 自定义样式 | `string` | - |
| custom-class | 自定义类名 | `string` | - |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击按钮时触发 | `event: Event` |

### Slots

| 名称 | 说明 |
|------|------|
| default | 按钮内容 |
| icon | 自定义前置图标 |
| suffix-icon | 自定义后置图标 |

## 🎨 主题定制

### CSS 变量

```scss
:root {
  // 按钮高度
  --wd-button-large-height: 100rpx;
  --wd-button-medium-height: 80rpx;
  --wd-button-small-height: 60rpx;
  --wd-button-mini-height: 48rpx;

  // 按钮字体大小
  --wd-button-large-font-size: 32rpx;
  --wd-button-medium-font-size: 28rpx;
  --wd-button-small-font-size: 24rpx;
  --wd-button-mini-font-size: 20rpx;

  // 按钮圆角
  --wd-button-border-radius: 8rpx;
  --wd-button-round-border-radius: 40rpx;

  // 按钮颜色
  --wd-button-primary-color: #4D7FFF;
  --wd-button-success-color: #00C853;
  --wd-button-warning-color: #FFB300;
  --wd-button-danger-color: #FA2C19;
  --wd-button-info-color: #409EFF;
  --wd-button-default-color: #FFFFFF;

  // 按钮边框
  --wd-button-border-width: 2rpx;
  --wd-button-border-color: #E8E8E8;

  // 按钮间距
  --wd-button-padding: 0 30rpx;
  --wd-button-icon-gap: 8rpx;
}
```

### 自定义主题

```scss
// 自定义主题色彩
.custom-theme {
  --wd-button-primary-color: #6C5CE7;
  --wd-button-success-color: #00B894;
  --wd-button-warning-color: #FDCB6E;
  --wd-button-danger-color: #E84393;
}
```

## 🎯 最佳实践

### 使用建议

1. **类型选择**: 根据操作重要性选择合适的按钮类型
   - Primary: 主要操作（提交、确认）
   - Success: 成功操作（保存、完成）
   - Warning: 警告操作（重置、清空）
   - Danger: 危险操作（删除、注销）

2. **尺寸规范**: 保持页面内按钮尺寸的一致性
3. **状态反馈**: 及时显示加载状态，提升用户体验
4. **无障碍**: 为按钮提供清晰的文字描述

### 注意事项

1. **点击区域**: 确保按钮有足够的点击区域（建议最小48rpx）
2. **对比度**: 确保按钮文字与背景有足够的对比度
3. **响应速度**: 避免按钮点击后无响应的情况
4. **防误触**: 重要操作需要二次确认