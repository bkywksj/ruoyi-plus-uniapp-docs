# Resize 监听元素尺寸

WD UI 尺寸监听组件，用于监听元素尺寸变化并执行相应操作。

## 基本使用

### 基础监听

```html
<template>
  <view class="demo-block">
    <wd-resize @resize="handleResize">
      <view class="content">
        调整浏览器窗口大小或点击按钮改变容器尺寸
      </view>
    </wd-resize>

    <wd-button @click="changeSize">改变尺寸</wd-button>
  </view>
</template>
```

```javascript
import { ref } from 'vue'

const contentWidth = ref(300)
const resizeInfo = ref({ width: 0, height: 0 })

const handleResize = (info) => {
  resizeInfo.value = info
  console.log('元素尺寸发生变化：', info)
}

const changeSize = () => {
  contentWidth.value = contentWidth.value === 300 ? 400 : 300
}
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| watch-width | 是否监听宽度变化 | boolean | true |
| watch-height | 是否监听高度变化 | boolean | true |
| throttle | 节流延迟时间（ms） | number | 100 |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| resize | 尺寸变化时触发 | info 对象 |

## 注意事项

1. 在小程序中可能不支持 ResizeObserver
2. 节流时间不宜过小，以免影响性能
3. 建议在组件销毁时手动清理相关的监听器