# IconSelect 图标选择器

IconSelect 是一个图标选择器组件，提供了丰富的图标库和便捷的选择功能，支持实时搜索和预览。

## 基础用法

最简单的图标选择器用法。

```vue
<template>
  <div>
    <IconSelect v-model="selectedIcon" />
    <p>当前选中: {{ selectedIcon }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedIcon = ref('user')
</script>
```

## 自定义宽度

可以通过 `width` 属性设置组件宽度。

```vue
<template>
  <IconSelect v-model="selectedIcon" width="500px" />
</template>

<script setup>
import { ref } from 'vue'

const selectedIcon = ref('')
</script>
```

## 搜索功能

组件内置搜索功能，支持按图标ID或名称搜索。

```vue
<template>
  <IconSelect v-model="selectedIcon" />
</template>
```

搜索支持：
- 按图标代码搜索（如：`user`、`home`）
- 按图标名称搜索（如：用户、首页）

## 配合 Icon 组件使用

IconSelect 与 Icon 组件完美配合，选中的图标可以直接在 Icon 组件中显示。

```vue
<template>
  <div>
    <el-form-item label="选择图标">
      <IconSelect v-model="form.icon" width="300px" />
    </el-form-item>
    
    <el-form-item label="预览效果">
      <Icon :code="form.icon" size="lg" />
      <span class="ml-2">{{ form.icon }}</span>
    </el-form-item>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  icon: 'user'
})
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 当前选中的图标代码 | string | '' |
| width | 组件宽度 | string | '400px' |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 选中图标改变时触发 | (iconCode: string) |

## 可用图标

IconSelect 组件包含了丰富的图标库，涵盖以下分类：

### 界面元素
`button`, `cascader`, `checkbox`, `form`, `icon`, `input`, `list`, `radio`, `rate`, `row`, `select`, `slider`, `star`, `switch`, `tab`, `table`, `textarea`, `eye-off`, `eye-open`, `tree-table`, `filter`, `sort`, `menu`, `more-actions`, `drag-handle`, `collapse`, `expand`, `close`, `loading`

### 导航
`home`, `caret-back`, `caret-forward`, `caret-up`, `caret-down`, `dashboard`, `link`, `nested`, `back`, `forward`, `arrow-up`, `arrow-down`, `refresh`, `breadcrumb`, `hamburger`

### 数据
`chart`, `dict`, `database`, `model`, `monitor`, `number`, `redis`, `redis-list`, `tree`, `statistics`, `pie-chart`, `bar-chart`, `line-chart`, `data-analysis`

### 文件
`clipboard`, `documentation`, `zip`, `file`, `image`, `video`, `audio`, `word`, `excel`, `ppt`, `pdf`, `text`, `code-file`, `folder`, `folder-open`

### 操作
`download`, `drag`, `edit`, `search`, `upload`, `copy`, `cut`, `add`, `delete`, `save`, `cancel`, `confirm`, `share`, `import`, `export`, `print`, `scan`, `exit-fullscreen`, `fullscreen`, `take-photo`

### 状态
`error-404`, `finish`, `online`, `waiting`, `success`, `warning`, `error`, `info`, `disabled`

### 用户
`user`, `users`, `account`, `post`, `skill`, `my-task`, `team`, `role`, `department`, `customer`, `admin`

### 安全
`lock`, `login-info`, `auth-center`, `password`, `auth-identity`, `valid-code`, `security`, `unlock`, `permission`, `logout`, `maxkey`, `topiam`

### 通信
`email`, `message`, `phone`, `chat`, `comment`, `notification`, `send`, `sms`

### 社交
`qq`, `wechat`, `wechat-fill`, `weibo`, `twitter`, `facebook`, `linkedin`, `instagram`, `taobao`, `moments`, `like`, `heart`, `share-social`

### 开发
`bug`, `build`, `test`, `code`, `component`, `gitee`, `github`, `api`, `git`, `terminal`, `debug`, `deploy`, `app`, `miniapp`

### 时间
`date`, `date-range`, `job`, `time`, `time-range`, `schedule`, `history`, `reminder`

### 系统
`category`, `color`, `guide`, `international`, `language`, `log`, `question`, `size`, `setting`, `theme`, `tool`, `example`, `dark-mode`, `light-mode`

### 设备
`mobile`, `desktop`, `tablet`, `indicator`, `printer`, `camera`, `server`, `photo-album`, `wifi`

### 业务
`company`, `money`, `shopping`, `order`, `payment`, `wxpay`, `alipay`, `invoice`, `product`, `store`, `location`, `shipping`, `customer-service`, `delivery`, `discount`, `coupon`, `gift`, `sale`, `shop-window`, `scan-code`, `bag`, `wishlist`, `rating`, `seller`, `auction`, `refund`, `combination`

### 媒体控制
`play`, `pause`, `stop`, `volume`, `mute`

### 医疗健康
`health`, `hospital`, `medicine`, `doctor`

### 食品餐饮
`food`, `restaurant`, `coffee`, `drink`, `cake`, `pizza`, `fruit`, `vegetable`, `meat`, `cooking`, `dinner`, `breakfast`

### 游戏娱乐
`game`, `music`, `movie`

### 天气环境
`sun`, `moon`, `cloud`, `rain`, `snow`, `wind`, `temperature`

### 交通出行
`car`, `bus`, `train`, `airplane`, `bicycle`, `navigation`, `map`

### 教育学习
`education`, `book`, `graduation`, `school`, `certificate`, `course`

## 样式定制

组件提供了 SCSS 样式，可以通过 CSS 变量进行定制。

### 主要 CSS 类名

- `.icon-list` - 图标列表容器
- `.icon-item` - 单个图标项
- `.active` - 选中状态的图标

### 自定义样式示例

```css
/* 自定义图标选择器样式 */
.icon-list .icon-item {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.icon-list .icon-item:hover {
  border-color: #409eff;
  transform: scale(1.2);
}

.icon-list .active {
  background-color: #409eff;
  color: white;
}
```

## 注意事项

1. **图标代码类型安全**：组件使用 TypeScript 的 `IconCode` 类型来确保选择的图标代码是有效的
2. **搜索功能**：搜索不区分大小写，支持部分匹配
3. **Icon 组件依赖**：IconSelect 组件依赖 Icon 组件来显示图标预览
4. **响应式设计**：图标选择器支持响应式设计，在小屏幕设备上会自动调整布局
5. **键盘导航**：支持键盘导航和选择（通过 Element Plus 的内置功能）

## 与表单集成

IconSelect 完全兼容 Element Plus 的表单验证：

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="菜单图标" prop="icon">
      <IconSelect v-model="form.icon" width="300px" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  icon: ''
})

const rules = {
  icon: [
    { required: true, message: '请选择图标', trigger: 'change' }
  ]
}
</script>
```
