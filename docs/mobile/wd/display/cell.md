# Cell 单元格

WD UI 单元格组件。

```vue
<template>
  <wd-cell-group>
    <wd-cell title="单元格" value="内容" />
    <wd-cell title="单元格" value="内容" is-link />
    <wd-cell title="单元格" value="内容" is-link @click="handleClick" />
  </wd-cell-group>
</template>

<script setup>
const handleClick = () => {
  console.log('点击了单元格')
}
</script>
```

## API

### Cell Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 左侧标题 | string | — |
| value | 右侧内容 | string | — |
| label | 标题下方的描述信息 | string | — |
| icon | 左侧图标 | string | — |
| is-link | 是否展示右侧箭头 | boolean | false |
| clickable | 是否开启点击反馈 | boolean | false |

### Events
| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击单元格时触发 | event |