# FormItem 表单项

## 介绍

FormItem 表单项组件是表单控件的容器组件,基于 Cell 组件封装,用于包装表单控件并显示标签、错误信息和必填标识。组件自动继承 Form 的配置,与表单系统深度集成,提供统一的表单项展示样式和验证反馈。

**核心特性:**

- **基于 Cell 封装** - 继承 Cell 组件的所有样式和功能,保持 UI 一致性
- **自动注册到 Form** - 使用时自动注册到父级 Form 组件,无需手动管理
- **验证规则支持** - 支持在组件上直接定义验证规则,与 Form 规则自动合并
- **错误信息显示** - 自动从 Form 获取并显示当前字段的错误信息
- **必填标识** - 根据验证规则或 required 属性自动显示必填星号
- **标签宽度继承** - 自动继承 Form 的 labelWidth,也可单独设置
- **多种布局模式** - 支持水平、垂直、居中等多种布局方式
- **边框智能显示** - 根据在 Form 中的位置自动显示边框
- **尺寸控制** - 支持 large 尺寸设置
- **图标支持** - 支持在标签前显示图标
- **点击反馈** - 支持点击反馈和右侧箭头显示

参考: src/wd/components/wd-form-item/wd-form-item.vue:1-39

## 基本用法

### 基础用法

FormItem 通常与表单控件组合使用。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData" :rules="rules">
      <wd-form-item prop="username" label="用户名">
        <wd-input v-model="formData.username" placeholder="请输入用户名" />
      </wd-form-item>

      <wd-form-item prop="password" label="密码">
        <wd-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
        />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
}
</script>
```

**使用说明:**
- `prop` 指定表单字段名,用于验证和错误显示
- `label` 显示表单项标签
- FormItem 会自动注册到父级 Form 组件
- 验证错误会自动显示在表单项下方

参考: src/wd/components/wd-form-item/wd-form-item.vue:3-22, 79-93

### 必填标识

通过 `required` 或验证规则显示必填星号。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <!-- 通过 required 属性显示 -->
      <wd-form-item prop="name" label="姓名" :required="true">
        <wd-input v-model="formData.name" />
      </wd-form-item>

      <!-- 通过验证规则显示 -->
      <wd-form-item prop="phone" label="手机号" :rules="phoneRules">
        <wd-input v-model="formData.phone" />
      </wd-form-item>

      <!-- 不显示必填标识 -->
      <wd-form-item prop="email" label="邮箱">
        <wd-input v-model="formData.email" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  phone: '',
  email: '',
})

const phoneRules = [
  { required: true, message: '请输入手机号' },
]
</script>
```

**使用说明:**
- `required="true"` 直接显示必填星号
- 验证规则中包含 `required: true` 也会显示必填星号
- 必填星号显示在标签左侧

参考: src/wd/components/wd-form-item/wd-form-item.vue:5, 54-55

### 自定义标签宽度

通过 `labelWidth` 设置标签宽度,覆盖 Form 的设置。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData" label-width="150rpx">
      <!-- 使用 Form 的 labelWidth (150rpx) -->
      <wd-form-item prop="name" label="姓名">
        <wd-input v-model="formData.name" />
      </wd-form-item>

      <!-- 自定义 labelWidth (200rpx) -->
      <wd-form-item prop="phone" label="手机号码" label-width="200rpx">
        <wd-input v-model="formData.phone" />
      </wd-form-item>

      <!-- 自定义 labelWidth (100rpx) -->
      <wd-form-item prop="code" label="验证码" label-width="100rpx">
        <wd-input v-model="formData.code" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  phone: '',
  code: '',
})
</script>
```

**使用说明:**
- FormItem 的 `labelWidth` 优先于 Form 的 `labelWidth`
- 支持数字或字符串格式
- 支持 rpx、px、% 等单位

参考: src/wd/components/wd-form-item/wd-form-item.vue:61, 102-115

### 垂直布局

使用 `vertical` 实现标签和内容的上下布局。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <wd-form-item prop="desc" label="商品描述" :vertical="true">
        <wd-textarea v-model="formData.desc" placeholder="请输入商品描述" />
      </wd-form-item>

      <wd-form-item prop="images" label="商品图片" :vertical="true">
        <wd-upload v-model="formData.images" :limit="9" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  desc: '',
  images: '',
})
</script>
```

**使用说明:**
- `vertical="true"` 标签和内容上下排列
- 适用于多行文本、文件上传等高度较大的控件
- 标签显示在上方,内容显示在下方

参考: src/wd/components/wd-form-item/wd-form-item.vue:75, 15

### 垂直居中

使用 `center` 实现标签和内容的垂直居中对齐。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <wd-form-item prop="notify" label="消息通知" :center="true">
        <wd-switch v-model="formData.notify" />
      </wd-form-item>

      <wd-form-item prop="autoSave" label="自动保存" :center="true">
        <wd-switch v-model="formData.autoSave" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  notify: false,
  autoSave: true,
})
</script>
```

**使用说明:**
- `center="true"` 标签和内容垂直居中
- 适用于开关、单选、复选等高度较小的控件
- 默认为顶部对齐

参考: src/wd/components/wd-form-item/wd-form-item.vue:57, 9

### 显示右侧箭头

使用 `isLink` 显示右侧箭头,适用于可跳转的表单项。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <wd-form-item
        prop="region"
        label="所在地区"
        :is-link="true"
        @click="showRegionPicker"
      >
        <view class="value">{{ displayRegion }}</view>
      </wd-form-item>

      <wd-form-item
        prop="birthday"
        label="出生日期"
        :is-link="true"
        @click="showDatePicker"
      >
        <view class="value">{{ formData.birthday || '请选择' }}</view>
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const formData = ref({
  region: [],
  birthday: '',
})

const displayRegion = computed(() => {
  return formData.value.region.length > 0
    ? formData.value.region.join(' ')
    : '请选择'
})

const showRegionPicker = () => {
  console.log('打开地区选择器')
}

const showDatePicker = () => {
  console.log('打开日期选择器')
}
</script>

```

**使用说明:**
- `isLink="true"` 显示右侧箭头
- 自动开启点击反馈效果
- 适用于选择器、跳转页面等场景

参考: src/wd/components/wd-form-item/wd-form-item.vue:63, 12

### 添加图标

使用 `icon` 在标签前显示图标。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <wd-form-item prop="username" label="用户名" icon="user">
        <wd-input v-model="formData.username" />
      </wd-form-item>

      <wd-form-item prop="password" label="密码" icon="lock">
        <wd-input v-model="formData.password" type="password" />
      </wd-form-item>

      <wd-form-item prop="phone" label="手机号" icon="phone">
        <wd-input v-model="formData.phone" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  password: '',
  phone: '',
})
</script>
```

**使用说明:**
- `icon` 指定图标名称
- 图标显示在标签文本左侧
- 使用 `customIconClass` 自定义图标样式

参考: src/wd/components/wd-form-item/wd-form-item.vue:67, 7-8

### 尺寸设置

使用 `size` 设置表单项尺寸。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <!-- 普通尺寸 -->
      <wd-form-item prop="name" label="姓名">
        <wd-input v-model="formData.name" />
      </wd-form-item>

      <!-- 大尺寸 -->
      <wd-form-item prop="phone" label="手机号" size="large">
        <wd-input v-model="formData.phone" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  phone: '',
})
</script>
```

**使用说明:**
- `size="large"` 设置大尺寸
- 大尺寸会增加内边距和字体大小
- 默认为普通尺寸

参考: src/wd/components/wd-form-item/wd-form-item.vue:73, 14

### 组件级验证规则

在 FormItem 上直接定义验证规则,会与 Form 的规则合并。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="formRules">
      <wd-form-item prop="username" label="用户名">
        <wd-input v-model="formData.username" />
      </wd-form-item>

      <!-- FormItem 级别的规则会与 Form 级别的规则合并 -->
      <wd-form-item
        prop="password"
        label="密码"
        :rules="itemRules"
      >
        <wd-input v-model="formData.password" type="password" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  password: '',
})

// Form 级别的规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
  ],
  password: [
    { required: true, message: '请输入密码' },
  ],
}

// FormItem 级别的规则
const itemRules = [
  { min: 8, message: '密码不能少于8位' },
  {
    validator: (value: string) => {
      return /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value)
    },
    message: '密码必须包含大小写字母和数字',
  },
]
</script>
```

**使用说明:**
- FormItem 的 `rules` 会追加到 Form 的 `rules` 之后
- 验证时按顺序执行所有规则
- 遇到第一个错误立即停止

参考: src/wd/components/wd-form-item/wd-form-item.vue:52-53

### 自定义样式

使用 `customClass` 和 `customStyle` 自定义表单项样式。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <!-- 使用自定义样式类 -->
      <wd-form-item
        prop="title"
        label="标题"
        custom-class="custom-item"
      >
        <wd-input v-model="formData.title" />
      </wd-form-item>

      <!-- 使用内联样式 -->
      <wd-form-item
        prop="subtitle"
        label="副标题"
        custom-style="background-color: #f5f5f5; border-radius: 8rpx;"
      >
        <wd-input v-model="formData.subtitle" />
      </wd-form-item>

      <!-- 组合使用 -->
      <wd-form-item
        prop="content"
        label="内容"
        custom-class="highlighted-item"
        custom-style="margin: 16rpx 0;"
      >
        <wd-textarea v-model="formData.content" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  title: '',
  subtitle: '',
  content: '',
})
</script>

<style lang="scss">
.custom-item {
  padding: 24rpx 32rpx;
  background-color: #fff9e6;
}

.highlighted-item {
  border-left: 4rpx solid #1890ff;
  padding-left: 28rpx;
}
</style>
```

**使用说明:**
- `customClass` 用于添加自定义样式类
- `customStyle` 用于添加内联样式
- 可以同时使用两者实现复杂样式
- 自定义样式不会影响内部布局和功能

参考: src/wd/components/wd-form-item/wd-form-item.vue:69-70, 26-29

## 高级用法

### 自定义错误显示

FormItem 会自动显示验证错误,也可以自定义错误显示位置。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules" error-type="none">
      <wd-form-item prop="username" label="用户名">
        <wd-input v-model="formData.username" />
        <!-- 自定义错误显示 -->
        <view v-if="errors.username" class="custom-error">
          <wd-icon name="info" size="32" />
          <text>{{ errors.username }}</text>
        </view>
      </wd-form-item>

      <wd-button type="primary" @click="handleSubmit">提交</wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()
const errors = ref<Record<string, string>>({})

const formData = ref({
  username: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
}

const handleSubmit = async () => {
  const result = await formRef.value!.validate()
  if (!result.valid) {
    // 手动设置错误信息
    result.errors.forEach((error) => {
      errors.value[error.prop] = error.message
    })
  } else {
    errors.value = {}
  }
}
</script>

```

**使用说明:**
- 设置 Form 的 `error-type="none"` 禁用自动错误显示
- 通过 validate 返回的 errors 自己处理错误显示
- 可以实现更灵活的错误提示效果

参考: src/wd/components/wd-form-item/wd-form-item.vue:18-20, 121-126

### 动态表单项

配合 v-for 实现动态表单项。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData" :rules="rules">
      <view
        v-for="(item, index) in formData.contacts"
        :key="index"
        class="contact-group"
      >
        <view class="group-title">联系人{{ index + 1 }}</view>

        <wd-form-item :prop="`contacts.${index}.name`" label="姓名">
          <wd-input v-model="item.name" />
        </wd-form-item>

        <wd-form-item :prop="`contacts.${index}.phone`" label="电话">
          <wd-input v-model="item.phone" />
        </wd-form-item>

        <wd-button
          v-if="formData.contacts.length > 1"
          type="error"
          size="small"
          @click="removeContact(index)"
        >
          删除
        </wd-button>
      </view>

      <wd-button @click="addContact">添加联系人</wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { FormRules } from '@/wd'

const formData = ref({
  contacts: [
    { name: '', phone: '' },
  ],
})

// 动态生成验证规则
const rules = computed<FormRules>(() => {
  const dynamicRules: FormRules = {}

  formData.value.contacts.forEach((_, index) => {
    dynamicRules[`contacts.${index}.name`] = [
      { required: true, message: '请输入姓名' },
    ]
    dynamicRules[`contacts.${index}.phone`] = [
      { required: true, message: '请输入电话' },
    ]
  })

  return dynamicRules
})

const addContact = () => {
  formData.value.contacts.push({ name: '', phone: '' })
}

const removeContact = (index: number) => {
  formData.value.contacts.splice(index, 1)
}
</script>

```

**使用说明:**
- prop 支持嵌套路径,如 `contacts.0.name`
- 配合动态规则实现完整的验证功能
- 支持动态增删表单项

参考: src/wd/components/wd-form-item/wd-form-item.vue:50

### 条件显示

根据条件动态显示表单项。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <wd-form-item prop="userType" label="用户类型">
        <wd-radio-group v-model="formData.userType">
          <wd-radio value="personal">个人</wd-radio>
          <wd-radio value="company">企业</wd-radio>
        </wd-radio-group>
      </wd-form-item>

      <wd-form-item
        v-if="formData.userType === 'personal'"
        prop="idCard"
        label="身份证号"
      >
        <wd-input v-model="formData.idCard" />
      </wd-form-item>

      <wd-form-item
        v-if="formData.userType === 'company'"
        prop="licenseNo"
        label="营业执照号"
      >
        <wd-input v-model="formData.licenseNo" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  userType: 'personal',
  idCard: '',
  licenseNo: '',
})
</script>
```

**使用说明:**
- 使用 `v-if` 控制表单项显示
- 验证时只会验证显示的表单项
- 配合动态规则实现条件验证

参考: src/wd/components/wd-form-item/wd-form-item.vue:3-22

### 表单项联动

实现表单项之间的联动效果。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-form-item prop="country" label="国家">
        <wd-select-picker
          v-model="formData.country"
          :columns="countries"
          @confirm="handleCountryChange"
        />
      </wd-form-item>

      <wd-form-item prop="province" label="省份">
        <wd-select-picker
          v-model="formData.province"
          :columns="provinces"
          :disabled="!formData.country"
          @confirm="handleProvinceChange"
        />
      </wd-form-item>

      <wd-form-item prop="city" label="城市">
        <wd-select-picker
          v-model="formData.city"
          :columns="cities"
          :disabled="!formData.province"
        />
      </wd-form-item>

      <wd-form-item prop="agreeTerms" label="同意条款">
        <wd-switch v-model="formData.agreeTerms" />
      </wd-form-item>

      <wd-form-item prop="email" label="邮箱">
        <wd-input
          v-model="formData.email"
          :disabled="!formData.agreeTerms"
          placeholder="请先同意条款"
        />
      </wd-form-item>

      <wd-button
        type="primary"
        :disabled="!formData.agreeTerms"
        @click="handleSubmit"
      >
        提交
      </wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const formData = ref({
  country: '',
  province: '',
  city: '',
  agreeTerms: false,
  email: '',
})

const countries = ref([
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
])

const provinces = computed(() => {
  if (formData.value.country === 'china') {
    return [
      { label: '广东省', value: 'guangdong' },
      { label: '浙江省', value: 'zhejiang' },
    ]
  }
  return []
})

const cities = computed(() => {
  if (formData.value.province === 'guangdong') {
    return [
      { label: '深圳市', value: 'shenzhen' },
      { label: '广州市', value: 'guangzhou' },
    ]
  } else if (formData.value.province === 'zhejiang') {
    return [
      { label: '杭州市', value: 'hangzhou' },
      { label: '宁波市', value: 'ningbo' },
    ]
  }
  return []
})

const rules = {
  country: [{ required: true, message: '请选择国家' }],
  province: [{ required: true, message: '请选择省份' }],
  city: [{ required: true, message: '请选择城市' }],
  email: [{ required: true, message: '请输入邮箱' }],
}

const handleCountryChange = () => {
  // 清空下级选项
  formData.value.province = ''
  formData.value.city = ''
  // 清除验证错误
  formRef.value?.clearValidate(['province', 'city'])
}

const handleProvinceChange = () => {
  // 清空城市选项
  formData.value.city = ''
  formRef.value?.clearValidate('city')
}

const handleSubmit = async () => {
  const result = await formRef.value!.validate()
  if (result.valid) {
    console.log('提交数据:', formData.value)
  }
}
</script>
```

**使用说明:**
- 根据上级选项动态更新下级选项列表
- 上级选项变化时清空下级选项和错误信息
- 使用 `disabled` 控制表单项的可用状态
- 通过 `clearValidate` 清除特定字段的验证错误

参考: src/wd/components/wd-form-item/wd-form-item.vue:3-22, 50

### 表单项分组

使用分组标题组织表单项。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData" :rules="rules">
      <!-- 基本信息分组 -->
      <view class="form-group">
        <view class="group-title">基本信息</view>
        <wd-form-item prop="name" label="姓名">
          <wd-input v-model="formData.name" />
        </wd-form-item>
        <wd-form-item prop="gender" label="性别">
          <wd-radio-group v-model="formData.gender">
            <wd-radio value="male">男</wd-radio>
            <wd-radio value="female">女</wd-radio>
          </wd-radio-group>
        </wd-form-item>
        <wd-form-item prop="birthday" label="生日">
          <wd-datetime-picker v-model="formData.birthday" />
        </wd-form-item>
      </view>

      <!-- 联系方式分组 -->
      <view class="form-group">
        <view class="group-title">联系方式</view>
        <wd-form-item prop="phone" label="手机号">
          <wd-input v-model="formData.phone" type="number" />
        </wd-form-item>
        <wd-form-item prop="email" label="邮箱">
          <wd-input v-model="formData.email" type="email" />
        </wd-form-item>
        <wd-form-item prop="address" label="地址">
          <wd-textarea v-model="formData.address" />
        </wd-form-item>
      </view>

      <!-- 账号设置分组 -->
      <view class="form-group">
        <view class="group-title">账号设置</view>
        <wd-form-item prop="username" label="用户名">
          <wd-input v-model="formData.username" />
        </wd-form-item>
        <wd-form-item prop="password" label="密码">
          <wd-input v-model="formData.password" type="password" />
        </wd-form-item>
        <wd-form-item prop="confirmPassword" label="确认密码">
          <wd-input v-model="formData.confirmPassword" type="password" />
        </wd-form-item>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  // 基本信息
  name: '',
  gender: '',
  birthday: '',
  // 联系方式
  phone: '',
  email: '',
  address: '',
  // 账号设置
  username: '',
  password: '',
  confirmPassword: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  gender: [{ required: true, message: '请选择性别' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
  username: [{ required: true, message: '请输入用户名' }],
  password: [
    { required: true, message: '请输入密码' },
    { min: 8, message: '密码不能少于8位' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: (value: string) => {
        return value === formData.value.password
      },
      message: '两次输入的密码不一致',
    },
  ],
}
</script>

```

**使用说明:**
- 使用 `view` 元素包裹分组表单项
- 添加分组标题提升表单可读性
- 适用于字段较多的复杂表单
- 可以使用不同的样式区分不同分组

参考: src/wd/components/wd-form-item/wd-form-item.vue:3-22

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| prop | 表单字段名(必填) | `string` | - |
| label | 标签文本 | `string` | - |
| rules | 表单项验证规则 | `FormItemRule[]` | `[]` |
| required | 是否显示必填标识 | `boolean` | `false` |
| label-width | 标签宽度 | `string` | 继承Form或`'70'` |
| center | 内容是否垂直居中 | `boolean` | `false` |
| vertical | 是否垂直布局 | `boolean` | `false` |
| is-link | 是否显示右侧箭头 | `boolean` | `false` |
| clickable | 是否开启点击反馈 | `boolean` | `false` |
| icon | 图标类名 | `string` | `''` |
| custom-icon-class | 图标自定义样式类 | `string` | `''` |
| size | 表单项大小 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-form-item/wd-form-item.vue:44-76, 79-93

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 表单控件内容 |

参考: src/wd/components/wd-form-item/wd-form-item.vue:17

### 类型定义

```typescript
/**
 * 表单项验证规则接口
 */
export interface FormItemRule {
  /** 是否必填 */
  required?: boolean
  /** 错误提示信息 */
  message: string
  /** 正则表达式验证 */
  pattern?: RegExp
  /** 最小值/最小长度 */
  min?: number
  /** 最大值/最大长度 */
  max?: number
  /** 自定义验证函数 */
  validator?: (
    value: any,
    rule: FormItemRuleWithoutValidator,
  ) => boolean | Promise<string> | Promise<boolean> | Promise<void> | Promise<unknown>
}
```

参考: src/wd/components/wd-form-item/wd-form-item.vue:25

## 主题定制

### CSS 变量

FormItem 组件提供了以下 CSS 变量用于主题定制:

```scss
// 错误信息
--wd-form-item-error-message-color: #fa4350;
--wd-form-item-error-message-font-size: 24rpx;
--wd-form-item-error-message-line-height: 1.4;
```

参考: src/wd/components/wd-form-item/wd-form-item.vue:140-161

### 暗黑模式

FormItem 组件支持暗黑模式,在 `wot-theme-dark` 类下自动应用暗色主题:

```vue
<template>
  <wd-config-provider theme="dark">
    <wd-form :model="formData">
      <wd-form-item prop="name" label="姓名">
        <wd-input v-model="formData.name" />
      </wd-form-item>
    </wd-form>
  </wd-config-provider>
</template>
```

参考: src/wd/components/wd-form-item/wd-form-item.vue:145-149

### 自定义主题示例

```vue
<template>
  <view class="demo">
    <wd-form :model="formData">
      <wd-form-item
        prop="name"
        label="姓名"
        custom-class="custom-form-item"
      >
        <wd-input v-model="formData.name" />
      </wd-form-item>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
})
</script>

<style lang="scss">
.custom-form-item {
  // 修改错误信息颜色
  --wd-form-item-error-message-color: #ff6b6b;

  // 修改错误信息字体大小
  --wd-form-item-error-message-font-size: 26rpx;
}
</style>
```

## 最佳实践

### 1. 合理设置 prop

确保 prop 与 model 中的字段对应:

```vue
<!-- ✅ 推荐:prop 与 model 字段一致 -->
<wd-form :model="formData">
  <wd-form-item prop="username" label="用户名">
    <wd-input v-model="formData.username" />
  </wd-form-item>
</wd-form>

<!-- ❌ 错误:prop 与 model 不一致 -->
<wd-form :model="formData">
  <wd-form-item prop="userName" label="用户名">
    <wd-input v-model="formData.username" />
  </wd-form-item>
</wd-form>
```

### 2. 选择合适的布局模式

根据表单控件类型选择布局:

```vue
<!-- ✅ 推荐:开关使用 center -->
<wd-form-item prop="notify" label="通知" :center="true">
  <wd-switch v-model="formData.notify" />
</wd-form-item>

<!-- ✅ 推荐:多行文本使用 vertical -->
<wd-form-item prop="desc" label="描述" :vertical="true">
  <wd-textarea v-model="formData.desc" />
</wd-form-item>

<!-- ✅ 推荐:文件上传使用 vertical -->
<wd-form-item prop="images" label="图片" :vertical="true">
  <wd-upload v-model="formData.images" />
</wd-form-item>
```

### 3. 规则的合理组织

在 FormItem 和 Form 之间合理分配规则:

```typescript
// ✅ 推荐:通用规则放 Form,特殊规则放 FormItem
const formRules = {
  username: [
    { required: true, message: '请输入用户名' }, // 通用规则
  ],
  password: [
    { required: true, message: '请输入密码' }, // 通用规则
  ],
}

// FormItem 级别添加特殊规则
const passwordItemRules = [
  { min: 8, message: '密码不能少于8位' }, // 特殊规则
]
```

### 4. 标签宽度的统一

优先使用 Form 统一设置:

```vue
<!-- ✅ 推荐:在 Form 统一设置 -->
<wd-form :model="formData" label-width="150rpx">
  <wd-form-item prop="name" label="姓名">
    <wd-input v-model="formData.name" />
  </wd-form-item>

  <wd-form-item prop="phone" label="手机号">
    <wd-input v-model="formData.phone" />
  </wd-form-item>

  <!-- 特殊情况单独设置 -->
  <wd-form-item prop="email" label="邮箱地址" label-width="180rpx">
    <wd-input v-model="formData.email" />
  </wd-form-item>
</wd-form>
```

### 5. 动态表单的 key 设置

动态表单项务必设置唯一 key:

```vue
<!-- ✅ 推荐:使用唯一 key -->
<wd-form-item
  v-for="(item, index) in items"
  :key="item.id"
  :prop="`items.${index}.name`"
  label="姓名"
>
  <wd-input v-model="item.name" />
</wd-form-item>

<!-- ❌ 错误:使用 index 作为 key -->
<wd-form-item
  v-for="(item, index) in items"
  :key="index"
  :prop="`items.${index}.name`"
  label="姓名"
>
  <wd-input v-model="item.name" />
</wd-form-item>
```

## 常见问题

### 1. 为什么必填星号不显示?

**问题原因:**
- 没有设置 `required` 属性
- 验证规则中没有 `required: true`

**解决方案:**

```vue
<!-- ✅ 方案1:设置 required 属性 -->
<wd-form-item prop="name" label="姓名" :required="true">
  <wd-input v-model="formData.name" />
</wd-form-item>

<!-- ✅ 方案2:在规则中设置 required -->
<wd-form-item prop="name" label="姓名" :rules="nameRules">
  <wd-input v-model="formData.name" />
</wd-form-item>

<script lang="ts" setup>
const nameRules = [
  { required: true, message: '请输入姓名' },
]
</script>
```

参考: src/wd/components/wd-form-item/wd-form-item.vue:5, 54-55

### 2. 如何隐藏错误信息?

**问题原因:**
- 想自定义错误显示位置

**解决方案:**

```vue
<!-- ✅ 设置 Form 的 error-type="none" -->
<wd-form :model="formData" error-type="none">
  <wd-form-item prop="name" label="姓名">
    <wd-input v-model="formData.name" />
  </wd-form-item>
</wd-form>
```

参考: src/wd/components/wd-form-item/wd-form-item.vue:18-20, 121-126

### 3. 标签宽度不生效?

**问题原因:**
- 优先级理解错误

**解决方案:**

```vue
<!-- 优先级:FormItem > Form > 默认值 -->

<!-- ✅ FormItem 的 labelWidth 会覆盖 Form 的设置 -->
<wd-form :model="formData" label-width="150rpx">
  <!-- 使用 150rpx -->
  <wd-form-item prop="name" label="姓名">
    <wd-input v-model="formData.name" />
  </wd-form-item>

  <!-- 使用 200rpx -->
  <wd-form-item prop="phone" label="手机号" label-width="200rpx">
    <wd-input v-model="formData.phone" />
  </wd-form-item>
</wd-form>
```

参考: src/wd/components/wd-form-item/wd-form-item.vue:102-115

### 4. 动态表单验证失败?

**问题原因:**
- prop 路径设置错误
- 规则没有动态更新

**解决方案:**

```vue
<template>
  <wd-form :model="formData" :rules="rules">
    <!-- ✅ 正确:prop 使用嵌套路径 -->
    <wd-form-item
      v-for="(item, index) in formData.items"
      :key="item.id"
      :prop="`items.${index}.name`"
      label="姓名"
    >
      <wd-input v-model="item.name" />
    </wd-form-item>
  </wd-form>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// ✅ 使用 computed 动态生成规则
const rules = computed(() => {
  const dynamicRules = {}
  formData.value.items.forEach((_, index) => {
    dynamicRules[`items.${index}.name`] = [
      { required: true, message: '请输入姓名' },
    ]
  })
  return dynamicRules
})
</script>
```

参考: src/wd/components/wd-form-item/wd-form-item.vue:50

### 5. 如何实现自定义表单项?

**问题原因:**
- 需要包装自己的控件

**解决方案:**

```vue
<template>
  <wd-form :model="formData">
    <wd-form-item prop="customValue" label="自定义">
      <!-- 自定义控件 -->
      <view class="custom-control">
        <wd-button
          size="small"
          @click="decrease"
        >
          -
        </wd-button>
        <text class="value">{{ formData.customValue }}</text>
        <wd-button
          size="small"
          @click="increase"
        >
          +
        </wd-button>
      </view>
    </wd-form-item>
  </wd-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  customValue: 0,
})

const decrease = () => {
  formData.value.customValue--
}

const increase = () => {
  formData.value.customValue++
}
</script>

```

参考: src/wd/components/wd-form-item/wd-form-item.vue:17

## 注意事项

### 1. prop 是必填属性

- FormItem 必须设置 `prop` 属性
- prop 值必须与 model 中的字段对应
- 不设置 prop 将无法进行验证

参考: src/wd/components/wd-form-item/wd-form-item.vue:50

### 2. 自动注册机制

- FormItem 会自动注册到父级 Form 组件
- 不需要手动管理 FormItem 列表
- 必须在 Form 组件内使用

参考: src/wd/components/wd-form-item/wd-form-item.vue:96

### 3. 标签宽度优先级

- FormItem.labelWidth > Form.labelWidth > 默认值 '70'
- 支持数字和字符串格式
- 支持 rpx、px、% 等单位

参考: src/wd/components/wd-form-item/wd-form-item.vue:102-115

### 4. 错误信息来源

- 错误信息来自父级 Form 的 errorMessages
- FormItem 不存储错误信息,只负责显示
- 错误信息由 Form 的 validate 方法设置

参考: src/wd/components/wd-form-item/wd-form-item.vue:121-126

### 5. 规则合并机制

- FormItem 的 rules 会追加到 Form 的 rules 之后
- 验证时按顺序执行所有规则
- 遇到第一个错误立即停止

参考: src/wd/components/wd-form-item/wd-form-item.vue:52-53

### 6. 边框显示逻辑

- 第一个 FormItem 不显示上边框
- 其他 FormItem 根据 Form 的 border 属性决定
- 可以通过自定义样式覆盖

参考: src/wd/components/wd-form-item/wd-form-item.vue:132-137

### 7. 基于 Cell 组件

- FormItem 基于 Cell 组件封装
- 继承 Cell 的所有样式和功能
- 可以使用 Cell 的所有属性

参考: src/wd/components/wd-form-item/wd-form-item.vue:3-16, 29

### 8. 布局模式说明

- 默认为水平左对齐布局
- `center="true"` 垂直居中对齐
- `vertical="true"` 上下布局
- 根据表单控件类型选择合适的布局

参考: src/wd/components/wd-form-item/wd-form-item.vue:9, 15

### 9. 嵌套路径支持

- prop 支持嵌套路径,使用 `.` 分隔
- 如 `user.name`、`contacts.0.phone`
- 适用于复杂的数据结构

参考: src/wd/components/wd-form-item/wd-form-item.vue:50

### 10. 插槽使用

- 默认插槽用于放置表单控件
- 一个 FormItem 通常只包含一个表单控件
- 可以包含自定义内容

参考: src/wd/components/wd-form-item/wd-form-item.vue:17
