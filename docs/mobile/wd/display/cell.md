# Cell 单元格

## 介绍

Cell 单元格是列表中的基础展示组件，用于展示标题、内容、图标等信息。单元格组件提供了灵活的布局和丰富的配置选项，支持左右布局、上下布局、垂直居中等多种排列方式，广泛应用于设置页面、详情列表、表单布局等场景。

Cell 组件不仅可以作为独立展示单元使用，还深度集成了表单系统，支持表单验证、必填标识、错误提示等功能。组件内部通过精确的样式控制和事件处理，实现了清晰的信息层级和良好的交互体验。

**核心特性:**

- **灵活布局** - 支持左右布局和上下布局两种排列方式，通过 vertical 属性快速切换
- **标题内容** - 左侧支持标题(title)和描述(label)，右侧支持内容(value)展示
- **图标支持** - 左侧可显示图标，支持自定义图标颜色和左侧竖线边框装饰
- **链接跳转** - 设置 is-link 显示右侧箭头，配合 to 属性实现页面跳转
- **点击反馈** - 支持点击反馈效果，提供视觉交互反馈
- **尺寸控制** - 支持 large 大尺寸，适配不同界面需求
- **表单集成** - 完整集成表单系统，支持 prop、rules、required 等表单属性
- **错误提示** - 自动显示表单验证错误信息
- **自定义样式** - 支持自定义标题颜色、内容颜色、标题粗细等样式
- **右侧弹性** - 支持 rightFlex 属性控制右侧区域的弹性布局
- **插槽扩展** - 提供 icon、title、label、default、right-icon 等多个插槽，实现完全自定义
- **暗黑模式** - 内置暗黑模式支持，自动适配主题切换

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:1-493

## 基本用法

### 基础单元格

最简单的单元格用法，展示标题和内容。

```vue
<template>
  <view class="demo">
    <view class="demo-title">基础单元格</view>

    <wd-cell-group>
      <wd-cell title="单元格标题" value="内容" />
      <wd-cell title="单元格标题" value="内容说明" />
      <wd-cell title="单元格标题" />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `title` 设置左侧标题文本
- `value` 设置右侧内容文本
- 通常配合 `wd-cell-group` 使用，形成单元格组
- 单元格默认有上边框，通过 CellGroup 控制边框显示

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:101-104

### 展示描述信息

通过 label 属性添加标题下方的描述信息。

```vue
<template>
  <view class="demo">
    <view class="demo-title">展示描述信息</view>

    <wd-cell-group>
      <wd-cell
        title="用户名"
        value="张三"
        label="这是一段描述信息"
      />
      <wd-cell
        title="手机号"
        value="188****8888"
        label="请确保手机号码正确"
      />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `label` 显示在标题下方，字体较小，颜色较浅
- label 支持多行文本显示
- 有 label 时，单元格会增加上下内边距

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:107-108, 404-408

### 显示图标

通过 icon 属性设置左侧图标。

```vue
<template>
  <view class="demo">
    <view class="demo-title">显示图标</view>

    <wd-cell-group>
      <wd-cell title="个人信息" icon="user" is-link />
      <wd-cell title="账号安全" icon="lock" is-link />
      <wd-cell title="消息通知" icon="bell" is-link />
      <wd-cell title="关于我们" icon="info" is-link />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `icon` 设置图标名称，支持所有 WD UI 图标
- 图标默认显示在标题左侧
- 可通过 `icon-color` 自定义图标颜色
- 图标会自动垂直居中对齐

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:105-106, 20-27, 411-418

### 链接跳转

设置 is-link 属性显示右侧箭头，配合 to 属性实现跳转。

```vue
<template>
  <view class="demo">
    <view class="demo-title">链接跳转</view>

    <wd-cell-group>
      <wd-cell
        title="个人资料"
        is-link
        to="/pages/profile/index"
      />
      <wd-cell
        title="账号设置"
        is-link
        to="/pages/settings/index"
      />
      <wd-cell
        title="关于"
        is-link
        to="/pages/about/index"
        replace
      />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `is-link` 显示右侧箭头图标
- `to` 设置跳转路径，自动调用 `uni.navigateTo`
- `replace` 设置为 `true` 时使用 `uni.redirectTo` 替换当前页面
- 设置 is-link 会自动开启点击反馈效果

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:110-115, 253-266, 436-444

### 大尺寸

通过 size 属性设置单元格大小。

```vue
<template>
  <view class="demo">
    <view class="demo-title">大尺寸</view>

    <wd-cell-group>
      <wd-cell
        title="默认尺寸"
        value="内容"
        icon="user"
      />
      <wd-cell
        title="大尺寸"
        value="内容"
        icon="user"
        size="large"
      />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `size="large"` 设置大尺寸
- 大尺寸会增加字体大小和内边距
- 图标尺寸也会相应增大

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:119-120, 466-483

### 垂直居中

通过 center 属性使内容垂直居中对齐。

```vue
<template>
  <view class="demo">
    <view class="demo-title">垂直居中</view>

    <wd-cell-group>
      <wd-cell
        title="顶部对齐"
        label="这是描述信息"
      >
        <wd-switch v-model="value1" />
      </wd-cell>

      <wd-cell
        title="垂直居中"
        label="这是描述信息"
        center
      >
        <wd-switch v-model="value2" />
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(false)
const value2 = ref(false)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `center` 属性使左右两侧内容垂直居中
- 默认为顶部对齐(flex-start)
- 适合与开关、单选、复选等组件配合使用

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:125-126, 486-490

### 上下布局

通过 vertical 属性实现标题和内容的上下布局。

```vue
<template>
  <view class="demo">
    <view class="demo-title">上下布局</view>

    <wd-cell-group>
      <wd-cell
        title="商品描述"
        vertical
      >
        <wd-textarea v-model="desc" placeholder="请输入商品描述" />
      </wd-cell>

      <wd-cell
        title="商品图片"
        vertical
      >
        <wd-upload v-model="images" :limit="9" />
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const desc = ref('')
const images = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `vertical` 实现上下布局，标题在上，内容在下
- 内容左对齐显示
- 适合多行文本、文件上传等高度较大的内容
- 上下布局时右侧区域会有顶部外边距

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:129-130, 328-342

### 必填标识

通过 required 属性显示必填标识。

```vue
<template>
  <view class="demo">
    <view class="demo-title">必填标识</view>

    <wd-cell-group>
      <wd-cell
        title="用户名"
        required
      >
        <wd-input v-model="username" placeholder="请输入用户名" />
      </wd-cell>

      <wd-cell
        title="手机号"
        required
      >
        <wd-input v-model="phone" placeholder="请输入手机号" />
      </wd-cell>

      <wd-cell
        title="邮箱"
      >
        <wd-input v-model="email" placeholder="请输入邮箱(可选)" />
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const username = ref('')
const phone = ref('')
const email = ref('')
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `required` 属性在标题左侧显示红色星号(*)
- 必填标识会增加左侧内边距
- 也可以通过表单验证规则自动显示

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:127-128, 213-228, 359-370

## 高级用法

### 自定义样式

通过颜色和样式属性自定义单元格外观。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义样式</view>

    <wd-cell-group>
      <wd-cell
        title="自定义标题颜色"
        value="内容"
        title-color="#1890FF"
      />

      <wd-cell
        title="自定义内容颜色"
        value="重要内容"
        value-color="#FF4757"
      />

      <wd-cell
        title="标题加粗"
        value="内容"
        title-bold
      />

      <wd-cell
        title="自定义图标颜色"
        icon="star"
        icon-color="#FFB800"
        is-link
      />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `title-color` 自定义标题颜色
- `title-bold` 标题文字加粗
- `value-color` 自定义内容颜色，右侧箭头会跟随此颜色
- `icon-color` 自定义图标颜色

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:146-155, 234-248

### 左侧竖线装饰

通过 left-border 属性添加左侧竖线装饰。

```vue
<template>
  <view class="demo">
    <view class="demo-title">左侧竖线装饰</view>

    <wd-cell-group>
      <wd-cell
        title="重要提示"
        value="内容"
        left-border
      />

      <wd-cell
        title="系统通知"
        value="内容"
        left-border
        icon-color="#1890FF"
      />

      <wd-cell
        title="错误信息"
        value="内容"
        left-border
        icon-color="#FF4757"
      />

      <wd-cell
        title="成功提示"
        value="内容"
        left-border
        icon-color="#52C41A"
      />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `left-border` 在标题左侧显示竖线装饰
- 竖线颜色通过 `icon-color` 控制，默认为 `#1989fa`
- 仅在没有 icon 时生效
- 适合强调重要信息或分类标识

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:146-149, 373-388

### 右侧弹性布局

通过 right-flex 属性控制右侧区域的弹性比例。

```vue
<template>
  <view class="demo">
    <view class="demo-title">右侧弹性布局</view>

    <wd-cell-group>
      <wd-cell
        title="默认(右侧flex=1)"
        value="这是很长的内容文本,会自动换行显示"
      />

      <wd-cell
        title="右侧flex=2"
        value="这是很长的内容文本,会自动换行显示"
        :right-flex="2"
      />

      <wd-cell
        title="右侧flex=0.5"
        value="短内容"
        :right-flex="0.5"
      />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}
</style>
```

**使用说明:**
- `right-flex` 控制右侧区域的 flex 值
- 默认为 1，左右平分空间
- 增大值可以让右侧占据更多空间
- 减小值可以让左侧占据更多空间

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:157-159, 46-49

### 表单集成

在表单中使用单元格，支持验证和错误提示。

```vue
<template>
  <view class="demo">
    <view class="demo-title">表单集成</view>

    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-cell
        prop="username"
        title="用户名"
      >
        <wd-input v-model="formData.username" placeholder="请输入用户名" />
      </wd-cell>

      <wd-cell
        prop="phone"
        title="手机号"
      >
        <wd-input v-model="formData.phone" placeholder="请输入手机号" />
      </wd-cell>

      <wd-cell
        prop="email"
        title="邮箱"
        vertical
      >
        <wd-input v-model="formData.email" placeholder="请输入邮箱" />
      </wd-cell>

      <view class="form-actions">
        <wd-button type="primary" @click="handleSubmit">提交</wd-button>
        <wd-button @click="handleReset">重置</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const formData = reactive({
  username: '',
  phone: '',
  email: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名不能少于3位' },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
}

const handleSubmit = async () => {
  const result = await formRef.value!.validate()
  if (result.valid) {
    console.log('表单数据:', formData)
    uni.showToast({ title: '提交成功', icon: 'success' })
  }
}

const handleReset = () => {
  Object.assign(formData, {
    username: '',
    phone: '',
    email: '',
  })
  formRef.value?.clearValidate()
}
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}

.form-actions {
  margin-top: 48rpx;
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx;
}
</style>
```

**技术实现:**
- 在 wd-form 中使用，设置 `prop` 属性
- 自动显示必填标识(基于验证规则)
- 错误信息自动显示在单元格下方
- 支持表单的完整验证功能

**使用说明:**
- prop 必须与表单字段名一致
- 错误信息会自动从 Form 组件获取
- 支持 required 和自定义 validator

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:132-135, 202-228, 447-453

### 使用插槽

通过插槽实现完全自定义的单元格内容。

```vue
<template>
  <view class="demo">
    <view class="demo-title">使用插槽</view>

    <wd-cell-group>
      <!-- 自定义图标 -->
      <wd-cell title="自定义图标" is-link>
        <template #icon>
          <image class="custom-icon" src="/static/logo.png" />
        </template>
      </wd-cell>

      <!-- 自定义标题 -->
      <wd-cell is-link>
        <template #title>
          <view class="custom-title">
            <text class="title-main">自定义标题</text>
            <text class="title-tag">新</text>
          </view>
        </template>
      </wd-cell>

      <!-- 自定义内容 -->
      <wd-cell title="评分">
        <wd-rate v-model="rate" />
      </wd-cell>

      <!-- 完全自定义 -->
      <wd-cell>
        <template #title>
          <view class="product-title">
            <text class="product-name">商品名称</text>
            <text class="product-price">¥99.00</text>
          </view>
        </template>
        <view class="product-actions">
          <wd-button size="small">购买</wd-button>
        </view>
      </wd-cell>
    </wd-cell-group>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const rate = ref(4)
</script>

<style lang="scss" scoped>
.demo {
  padding: 32rpx;

  &-title {
    margin-bottom: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
  }
}

.custom-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.custom-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-main {
  font-size: 28rpx;
  color: #333;
}

.title-tag {
  padding: 2rpx 8rpx;
  font-size: 20rpx;
  color: #fff;
  background-color: #FF4757;
  border-radius: 4rpx;
}

.product-title {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
}

.product-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF4757;
}

.product-actions {
  display: flex;
  gap: 16rpx;
}
</style>
```

**使用说明:**
- `#icon` 插槽：自定义左侧图标
- `#title` 插槽：自定义标题区域
- `#label` 插槽：自定义描述信息
- `#default` 插槽：自定义右侧内容
- `#right-icon` 插槽：自定义右侧图标(替代箭头)

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:20-68

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 左侧标题 | `string` | - |
| value | 右侧内容 | `string \| number` | `''` |
| icon | 左侧图标 | `IconName` | - |
| label | 标题下方的描述信息 | `string` | - |
| is-link | 是否展示右侧箭头并开启点击反馈 | `boolean` | `false` |
| to | 跳转链接地址 | `string` | - |
| replace | 是否替换当前页面(redirectTo) | `boolean` | `false` |
| clickable | 是否开启点击反馈 | `boolean` | `false` |
| size | 单元格大小，可选值：large | `string` | - |
| border | 是否显示边框 | `boolean` | 继承CellGroup |
| title-width | 左侧标题宽度 | `string` | - |
| center | 是否垂直居中对齐 | `boolean` | `false` |
| required | 是否显示必填标识 | `boolean` | `false` |
| vertical | 是否使用上下布局 | `boolean` | `false` |
| prop | 表单域 model 字段名 | `string` | - |
| rules | 表单验证规则 | `FormItemRule[]` | `[]` |
| custom-icon-class | 图标自定义样式类 | `string` | `''` |
| custom-label-class | 描述信息自定义样式类 | `string` | `''` |
| custom-value-class | 右侧内容自定义样式类 | `string` | `''` |
| custom-title-class | 标题自定义样式类 | `string` | `''` |
| left-border | 左侧竖线边框 | `boolean` | `false` |
| icon-color | 图标颜色,同时控制左侧竖线颜色 | `string` | `''` |
| title-color | 标题颜色 | `string` | `''` |
| title-bold | 标题是否加粗 | `boolean` | `false` |
| value-color | 右侧内容颜色,右侧图标跟随此颜色 | `string` | `''` |
| right-flex | 右侧区域的 flex 值 | `number \| string` | `1` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:95-159, 170-191

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击单元格时触发 | - |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:164-167, 253-266

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义右侧内容,替代 value |
| icon | 自定义左侧图标 |
| title | 自定义标题 |
| label | 自定义描述信息 |
| right-icon | 自定义右侧图标,替代箭头 |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:20-68

## 主题定制

### CSS 变量

Cell 组件提供了以下 CSS 变量用于主题定制:

```scss
// 单元格基础
--wd-cell-padding: 32rpx;
--wd-cell-line-height: 48rpx;
--wd-cell-wrapper-padding: 24rpx;
--wd-cell-wrapper-padding-large: 32rpx;
--wd-cell-wrapper-padding-with-label: 20rpx;

// 标题
--wd-cell-title-fs: 28rpx;
--wd-cell-title-fs-large: 32rpx;
--wd-cell-title-color: #323233;

// 标签
--wd-cell-label-fs: 24rpx;
--wd-cell-label-fs-large: 28rpx;
--wd-cell-label-color: #909399;

// 内容
--wd-cell-value-fs: 28rpx;
--wd-cell-value-color: #909399;

// 图标
--wd-cell-icon-size: 32rpx;
--wd-cell-icon-size-large: 40rpx;
--wd-cell-icon-right: 16rpx;

// 箭头
--wd-cell-arrow-size: 32rpx;
--wd-cell-arrow-color: #c8c9cc;

// 必填标识
--wd-cell-required-size: 28rpx;
--wd-cell-required-color: #fa4350;

// 交互
--wd-cell-tap-bg: rgba(0, 0, 0, 0.06);

// 上下布局
--wd-cell-vertical-top: 16rpx;
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:269-493

### 暗黑模式

Cell 组件支持暗黑模式,在 `wot-theme-dark` 类下自动应用暗色主题:

```vue
<template>
  <wd-config-provider theme="dark">
    <wd-cell-group>
      <wd-cell title="单元格" value="内容" />
      <wd-cell title="单元格" value="内容" is-link />
    </wd-cell-group>
  </wd-config-provider>
</template>
```

**暗黑模式样式:**
- 背景色: `$-dark-background2`
- 文本颜色: `$-dark-color`
- 内容颜色: `$-dark-color3`
- 边框颜色: `$-dark-border-color`
- 悬停背景: `$-dark-background4`

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:275-302

## 最佳实践

### 1. 合理使用布局模式

```vue
<!-- ✅ 推荐: 开关使用 center -->
<wd-cell title="通知" center>
  <wd-switch v-model="notify" />
</wd-cell>

<!-- ✅ 推荐: 多行内容使用 vertical -->
<wd-cell title="描述" vertical>
  <wd-textarea v-model="desc" />
</wd-cell>

<!-- ❌ 不推荐: 开关不使用 center -->
<wd-cell title="通知">
  <wd-switch v-model="notify" />
</wd-cell>
```

### 2. 表单集成注意事项

```vue
<!-- ✅ 推荐: 设置 prop -->
<wd-form :model="form" :rules="rules">
  <wd-cell prop="username" title="用户名">
    <wd-input v-model="form.username" />
  </wd-cell>
</wd-form>

<!-- ❌ 错误: 缺少 prop -->
<wd-form :model="form">
  <wd-cell title="用户名">
    <wd-input v-model="form.username" />
  </wd-cell>
</wd-form>
```

### 3. 标题宽度统一

```vue
<!-- ✅ 推荐: 统一标题宽度 -->
<wd-cell-group>
  <wd-cell title="姓名" value="张三" title-width="150rpx" />
  <wd-cell title="手机号" value="188****8888" title-width="150rpx" />
</wd-cell-group>

<!-- ❌ 不推荐: 宽度不统一 -->
<wd-cell-group>
  <wd-cell title="姓名" value="张三" />
  <wd-cell title="手机号码" value="188****8888" />
</wd-cell-group>
```

### 4. 链接跳转规范

```vue
<!-- ✅ 推荐: 使用绝对路径 -->
<wd-cell title="详情" is-link to="/pages/detail/index?id=1" />

<!-- ✅ 推荐: 返回替换当前页 -->
<wd-cell title="返回首页" is-link to="/pages/index/index" replace />

<!-- ❌ 不推荐: 缺少 is-link -->
<wd-cell title="详情" to="/pages/detail/index" />
```

### 5. 插槽使用建议

```vue
<!-- ✅ 推荐: 复杂内容使用插槽 -->
<wd-cell>
  <template #title>
    <view class="custom-title">
      <text>{{ title }}</text>
      <wd-tag>新</wd-tag>
    </view>
  </template>
</wd-cell>

<!-- ✅ 推荐: 简单内容用 props -->
<wd-cell title="简单标题" value="内容" />
```

## 常见问题

### 1. 边框不显示

**问题原因:**
- 单独使用 Cell 时，border 默认继承 CellGroup
- 未设置 border 属性

**解决方案:**
```vue
<!-- ✅ 正确: 单独使用时设置 border -->
<wd-cell title="单元格" border />

<!-- ✅ 正确: 使用 CellGroup -->
<wd-cell-group border>
  <wd-cell title="单元格" />
</wd-cell-group>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:121-122, 198-200, 314-318

### 2. 点击无响应

**问题原因:**
- 未设置 is-link 或 clickable
- 未监听 click 事件

**解决方案:**
```vue
<!-- ✅ 正确: 设置 clickable -->
<wd-cell title="点击我" clickable @click="handleClick" />

<!-- ✅ 正确: 使用 is-link -->
<wd-cell title="点击我" is-link @click="handleClick" />
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:110-117, 253-266

### 3. 标题和内容不对齐

**问题原因:**
- 未使用 center 属性
- 内容高度较小

**解决方案:**
```vue
<!-- ✅ 正确: 使用 center -->
<wd-cell title="开关" center>
  <wd-switch v-model="value" />
</wd-cell>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:125-126, 486-490

### 4. 表单验证不生效

**问题原因:**
- 缺少 prop 属性
- prop 与表单字段不匹配

**解决方案:**
```vue
<!-- ✅ 正确 -->
<wd-form :model="form" :rules="rules">
  <wd-cell prop="username" title="用户名">
    <wd-input v-model="form.username" />
  </wd-cell>
</wd-form>

<script setup>
const rules = {
  username: [{ required: true, message: '请输入用户名' }]
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:132-135, 202-228

### 5. 左侧竖线不显示

**问题原因:**
- 设置了 icon 属性
- left-border 仅在没有 icon 时生效

**解决方案:**
```vue
<!-- ✅ 正确: 不设置 icon -->
<wd-cell title="标题" left-border icon-color="#1890FF" />

<!-- ❌ 错误: 同时设置 icon 和 left-border -->
<wd-cell title="标题" icon="user" left-border />
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:14, 146-149, 373-388

## 注意事项

1. **边框控制** - border 属性默认继承 CellGroup，单独使用时需手动设置

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:198-200

2. **点击反馈** - is-link 会自动开启点击反馈，也可单独设置 clickable

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:6-8, 256-257

3. **跳转方式** - to 配合 is-link 使用，默认 navigateTo，replace 为 true 时使用 redirectTo

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:259-265

4. **布局选择** - center 适合开关等小组件，vertical 适合多行内容

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:328-342, 486-490

5. **必填标识** - required 或验证规则中的 required 都会显示星号

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:213-228

6. **左侧装饰** - left-border 仅在没有 icon 时生效，颜色由 icon-color 控制

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:14, 373-388

7. **表单集成** - 在表单中使用必须设置 prop 属性

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:132-135

8. **错误信息** - 错误信息来自 Form 组件，Cell 只负责显示

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:204-210

9. **标题宽度** - title-width 支持 rpx、px、% 等单位

   参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:15-16

10. **插槽优先级** - 插槽内容优先于 props，同时设置时插槽生效

    参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:31-42

11. **颜色跟随** - value-color 会同时应用到右侧内容和箭头图标

    参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:52-61

12. **右侧弹性** - right-flex 默认为 1，可调整左右区域的空间分配

    参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-cell/wd-cell.vue:46-49
