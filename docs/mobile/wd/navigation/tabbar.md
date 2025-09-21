# Tabbar 标签栏

WD UI 标签栏组件。

```vue
<template>
  <wd-tabbar v-model="active">
    <wd-tabbar-item icon="home">首页</wd-tabbar-item>
    <wd-tabbar-item icon="search">搜索</wd-tabbar-item>
    <wd-tabbar-item icon="user">我的</wd-tabbar-item>
  </wd-tabbar>
</template>

<script setup>
import { ref } from 'vue'
const active = ref(0)
</script>
```

## API

### Tabbar Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 当前选中标签的索引 | number | 0 |
| fixed | 是否固定在底部 | boolean | true |
| border | 是否显示上边框 | boolean | true |

### TabbarItem Props
| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| icon | 图标名称 | string | — |
| badge | 徽标内容 | string/number | — |
| dot | 是否显示小红点 | boolean | false |

### Events
| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 切换标签时触发 | index |