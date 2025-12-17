---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/form/form
---

# Form 表单

## 介绍

Form 表单组件是用于数据录入和校验的容器组件,统一管理表单数据、验证规则和错误提示。支持各类表单控件(输入框、选择器、开关、上传等),提供完善的表单验证能力和灵活的错误展示方式。组件采用响应式设计,适配移动端各种使用场景。

**核心特性:**

- **统一数据管理** - 通过 model 属性统一管理表单数据,实现表单项的双向绑定
- **完善验证规则** - 支持必填、正则、最小值/最大值、自定义验证函数等多种验证规则
- **灵活错误提示** - 支持 toast、inline message、none 三种错误展示方式
- **异步验证支持** - 自定义验证函数支持异步验证,返回 Promise
- **部分字段验证** - 支持验证指定字段或字段数组,灵活控制验证范围
- **规则合并机制** - 自动合并 Form 和 FormItem 上的验证规则
- **自动错误清除** - 输入时自动清除对应字段的错误提示
- **统一标签宽度** - 通过 labelWidth 统一设置所有表单项的标签宽度
- **子组件自动注册** - 表单控件自动注册到 Form,无需手动管理
- **重置功能** - 一键清除所有验证错误信息
- **TypeScript 支持** - 完整的类型定义,提供良好的开发体验

参考: src/wd/components/wd-form/wd-form.vue:1-27

## 基本用法

### 基础表单

最简单的表单用法,包含数据绑定和基础验证。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-input
        v-model="formData.username"
        prop="username"
        label="用户名"
        placeholder="请输入用户名"
      />

      <wd-input
        v-model="formData.password"
        prop="password"
        type="password"
        label="密码"
        placeholder="请输入密码"
      />

      <view class="form-actions">
        <wd-button type="primary" @click="handleSubmit">提交</wd-button>
        <wd-button @click="handleReset">重置</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

// 表单数据
const formData = ref({
  username: '',
  password: '',
})

// 验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码不能少于 6 位' },
  ],
}

// 提交表单
const handleSubmit = async () => {
  const { valid } = await formRef.value!.validate()
  if (valid) {
    console.log('验证通过:', formData.value)
    uni.showToast({ title: '提交成功', icon: 'success' })
  }
}

// 重置表单
const handleReset = () => {
  formRef.value?.reset()
  formData.value = {
    username: '',
    password: '',
  }
}
</script>

```

**使用说明:**
- `model` 绑定表单数据对象
- `rules` 定义验证规则,key 对应表单项的 `prop`
- 表单项必须设置 `prop` 属性才能被验证
- 通过 ref 调用 `validate()` 方法进行验证

参考: src/wd/components/wd-form/wd-form.vue:74-113, 212-378

### 验证规则类型

Form 支持多种验证规则类型。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData" :rules="rules">
      <!-- 必填验证 -->
      <wd-input
        v-model="formData.name"
        prop="name"
        label="姓名"
        placeholder="必填项"
      />

      <!-- 正则验证 -->
      <wd-input
        v-model="formData.email"
        prop="email"
        label="邮箱"
        placeholder="请输入邮箱"
      />

      <!-- 最小值/最大值验证 -->
      <wd-input-number
        v-model="formData.age"
        prop="age"
        label="年龄"
      />

      <!-- 最小长度/最大长度验证 -->
      <wd-textarea
        v-model="formData.desc"
        prop="desc"
        label="简介"
        placeholder="请输入简介"
      />

      <!-- 数组长度验证 -->
      <wd-checkbox-group
        v-model="formData.hobbies"
        prop="hobbies"
        label="爱好"
      >
        <wd-checkbox value="reading">阅读</wd-checkbox>
        <wd-checkbox value="music">音乐</wd-checkbox>
        <wd-checkbox value="sports">运动</wd-checkbox>
      </wd-checkbox-group>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: '',
  age: undefined,
  desc: '',
  hobbies: [],
})

const rules = {
  // 必填验证
  name: [
    { required: true, message: '请输入姓名' },
  ],

  // 正则验证
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],

  // 数值范围验证
  age: [
    { required: true, message: '请输入年龄' },
    { min: 18, max: 65, message: '年龄必须在 18-65 之间' },
  ],

  // 字符串长度验证
  desc: [
    { min: 10, max: 200, message: '简介长度在 10-200 个字符' },
  ],

  // 数组长度验证
  hobbies: [
    { min: 1, message: '至少选择一项爱好' },
    { max: 3, message: '最多选择三项爱好' },
  ],
}
</script>
```

**使用说明:**
- `required`: 必填验证,值为空时触发
- `pattern`: 正则表达式验证
- `min`/`max`: 字符串验证长度,数字验证值,数组验证长度
- `message`: 验证失败时的错误提示

参考: src/wd/components/wd-form/wd-form.vue:236-314

### 自定义验证函数

使用 `validator` 自定义复杂的验证逻辑。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData" :rules="rules">
      <wd-input
        v-model="formData.password"
        type="password"
        prop="password"
        label="密码"
      />

      <wd-input
        v-model="formData.confirmPassword"
        type="password"
        prop="confirmPassword"
        label="确认密码"
      />

      <wd-input
        v-model="formData.phone"
        prop="phone"
        label="手机号"
      />
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  password: '',
  confirmPassword: '',
  phone: '',
})

const rules = {
  password: [
    { required: true, message: '请输入密码' },
    {
      validator: (value: string) => {
        // 密码强度验证:至少包含数字和字母
        const hasNumber = /\d/.test(value)
        const hasLetter = /[a-zA-Z]/.test(value)
        return hasNumber && hasLetter
      },
      message: '密码必须包含数字和字母',
    },
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

  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: (value: string) => {
        return /^1[3-9]\d{9}$/.test(value)
      },
      message: '手机号格式不正确',
    },
  ],
}
</script>
```

**使用说明:**
- `validator` 接收值和规则两个参数
- 返回 `true` 表示验证通过,`false` 表示失败
- 返回字符串表示自定义错误信息
- 支持访问表单数据进行关联验证

参考: src/wd/components/wd-form/wd-form.vue:316-357

### 异步验证

validator 支持异步验证,返回 Promise。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData" :rules="rules">
      <wd-input
        v-model="formData.username"
        prop="username"
        label="用户名"
      />
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
})

// 模拟检查用户名是否存在的 API
const checkUsernameExists = (username: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟:admin 已被占用
      resolve(username === 'admin')
    }, 1000)
  })
}

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    {
      validator: async (value: string) => {
        const exists = await checkUsernameExists(value)
        if (exists) {
          return '用户名已被占用' // 返回字符串作为错误信息
        }
        return true // 验证通过
      },
      message: '用户名验证失败',
    },
  ],
}
</script>
```

**使用说明:**
- validator 可以返回 Promise
- Promise resolve `true` 表示验证通过
- Promise resolve `false` 使用 rule.message
- Promise resolve `string` 使用该字符串作为错误信息
- Promise reject 使用 reject 的值或 rule.message

参考: src/wd/components/wd-form/wd-form.vue:320-346

### 错误提示类型

Form 支持三种错误提示方式。

```vue
<template>
  <view class="demo">
    <!-- inline message 模式(默认) -->
    <wd-form
      ref="form1"
      :model="formData1"
      :rules="rules"
      error-type="message"
    >
      <wd-input
        v-model="formData1.name"
        prop="name"
        label="姓名"
      />
      <wd-button @click="validate(form1)">验证(inline)</wd-button>
    </wd-form>

    <!-- toast 模式 -->
    <wd-form
      ref="form2"
      :model="formData2"
      :rules="rules"
      error-type="toast"
    >
      <wd-input
        v-model="formData2.name"
        prop="name"
        label="姓名"
      />
      <wd-button @click="validate(form2)">验证(toast)</wd-button>
    </wd-form>

    <!-- none 模式(不显示错误) -->
    <wd-form
      ref="form3"
      :model="formData3"
      :rules="rules"
      error-type="none"
    >
      <wd-input
        v-model="formData3.name"
        prop="name"
        label="姓名"
      />
      <wd-button @click="validate(form3)">验证(none)</wd-button>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const form1 = ref<FormInstance>()
const form2 = ref<FormInstance>()
const form3 = ref<FormInstance>()

const formData1 = ref({ name: '' })
const formData2 = ref({ name: '' })
const formData3 = ref({ name: '' })

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
}

const validate = async (form: FormInstance) => {
  const { valid, errors } = await form.validate()
  console.log('验证结果:', valid, errors)
}
</script>
```

**使用说明:**
- `errorType="message"`: 在表单项下方显示错误信息(默认)
- `errorType="toast"`: 使用 toast 弹窗显示第一个错误
- `errorType="none"`: 不显示错误信息,仅返回验证结果

参考: src/wd/components/wd-form/wd-form.vue:87, 189-206

### 部分字段验证

验证指定的一个或多个字段。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-input
        v-model="formData.username"
        prop="username"
        label="用户名"
      />

      <wd-input
        v-model="formData.email"
        prop="email"
        label="邮箱"
      />

      <wd-input
        v-model="formData.phone"
        prop="phone"
        label="手机号"
      />

      <view class="form-actions">
        <wd-button @click="validateUsername">验证用户名</wd-button>
        <wd-button @click="validateContact">验证联系方式</wd-button>
        <wd-button @click="validateAll">验证全部</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const formData = ref({
  username: '',
  email: '',
  phone: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  email: [{ required: true, message: '请输入邮箱' }],
  phone: [{ required: true, message: '请输入手机号' }],
}

// 验证单个字段
const validateUsername = async () => {
  const { valid } = await formRef.value!.validate('username')
  console.log('用户名验证:', valid)
}

// 验证多个字段
const validateContact = async () => {
  const { valid } = await formRef.value!.validate(['email', 'phone'])
  console.log('联系方式验证:', valid)
}

// 验证全部字段
const validateAll = async () => {
  const { valid } = await formRef.value!.validate()
  console.log('全部验证:', valid)
}
</script>
```

**使用说明:**
- `validate(prop)`: 验证单个字段
- `validate([prop1, prop2])`: 验证多个字段
- `validate()`: 验证所有字段
- 验证成功时自动清除对应字段的错误信息

参考: src/wd/components/wd-form/wd-form.vue:212-378

### 统一标签宽度

通过 `labelWidth` 统一设置所有表单项的标签宽度。

```vue
<template>
  <view class="demo">
    <wd-form :model="formData" label-width="180rpx">
      <wd-input
        v-model="formData.name"
        label="姓名"
      />

      <wd-input
        v-model="formData.phone"
        label="手机号码"
      />

      <wd-input
        v-model="formData.address"
        label="详细地址"
      />
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  phone: '',
  address: '',
})
</script>
```

**使用说明:**
- `labelWidth` 可以是数字或字符串
- 数字会自动添加 `rpx` 单位
- 支持 `rpx`、`px`、`%` 等单位
- 表单项可以通过自己的 `labelWidth` 覆盖

参考: src/wd/components/wd-form/wd-form.vue:89

### 输入时重置验证

控制输入时是否自动清除错误信息。

```vue
<template>
  <view class="demo">
    <!-- 输入时自动清除错误(默认) -->
    <wd-form :model="formData1" :rules="rules" :reset-on-change="true">
      <wd-input
        v-model="formData1.name"
        prop="name"
        label="自动清除"
      />
    </wd-form>

    <!-- 输入时不清除错误 -->
    <wd-form :model="formData2" :rules="rules" :reset-on-change="false">
      <wd-input
        v-model="formData2.name"
        prop="name"
        label="不自动清除"
      />
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const formData1 = ref({ name: '' })
const formData2 = ref({ name: '' })

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
}
</script>
```

**使用说明:**
- `resetOnChange="true"`: 输入时自动清除错误(默认)
- `resetOnChange="false"`: 保持错误显示,直到下次验证

参考: src/wd/components/wd-form/wd-form.vue:85, 143-146

## 高级用法

### 复杂表单示例

包含多种表单控件的复杂表单。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <!-- 基本信息 -->
      <view class="form-section">
        <view class="section-title">基本信息</view>

        <wd-input
          v-model="formData.name"
          prop="name"
          label="姓名"
          placeholder="请输入姓名"
        />

        <wd-radio-group
          v-model="formData.gender"
          prop="gender"
          label="性别"
        >
          <wd-radio value="male">男</wd-radio>
          <wd-radio value="female">女</wd-radio>
        </wd-radio-group>

        <wd-input-number
          v-model="formData.age"
          prop="age"
          label="年龄"
          :min="1"
          :max="150"
        />

        <wd-datetime-picker
          v-model="formData.birthday"
          prop="birthday"
          type="date"
          label="生日"
        />
      </view>

      <!-- 联系方式 -->
      <view class="form-section">
        <view class="section-title">联系方式</view>

        <wd-input
          v-model="formData.phone"
          prop="phone"
          label="手机号"
          placeholder="请输入手机号"
        />

        <wd-input
          v-model="formData.email"
          prop="email"
          label="邮箱"
          placeholder="请输入邮箱"
        />

        <wd-col-picker
          v-model="formData.region"
          prop="region"
          label="所在地区"
        />

        <wd-textarea
          v-model="formData.address"
          prop="address"
          label="详细地址"
          placeholder="请输入详细地址"
        />
      </view>

      <!-- 其他信息 -->
      <view class="form-section">
        <view class="section-title">其他信息</view>

        <wd-checkbox-group
          v-model="formData.hobbies"
          prop="hobbies"
          label="兴趣爱好"
        >
          <wd-checkbox value="reading">阅读</wd-checkbox>
          <wd-checkbox value="music">音乐</wd-checkbox>
          <wd-checkbox value="sports">运动</wd-checkbox>
        </wd-checkbox-group>

        <wd-switch
          v-model="formData.subscribe"
          prop="subscribe"
          label="订阅通知"
        />

        <wd-upload
          v-model="formData.avatar"
          prop="avatar"
          label="头像"
          :limit="1"
        />
      </view>

      <view class="form-actions">
        <wd-button type="primary" @click="handleSubmit">提交</wd-button>
        <wd-button @click="handleReset">重置</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

const formData = ref({
  name: '',
  gender: '',
  age: undefined,
  birthday: '',
  phone: '',
  email: '',
  region: [],
  address: '',
  hobbies: [],
  subscribe: false,
  avatar: '',
})

const rules = {
  name: [
    { required: true, message: '请输入姓名' },
    { min: 2, max: 20, message: '姓名长度在 2-20 个字符' },
  ],
  gender: [
    { required: true, message: '请选择性别' },
  ],
  age: [
    { required: true, message: '请输入年龄' },
    { min: 1, max: 150, message: '年龄必须在 1-150 之间' },
  ],
  birthday: [
    { required: true, message: '请选择生日' },
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: (value: string) => /^1[3-9]\d{9}$/.test(value),
      message: '手机号格式不正确',
    },
  ],
  email: [
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '邮箱格式不正确',
    },
  ],
  region: [
    { required: true, message: '请选择所在地区' },
    {
      validator: (value: any[]) => value.length === 3,
      message: '请选择完整的省市区',
    },
  ],
  address: [
    { required: true, message: '请输入详细地址' },
    { min: 5, max: 100, message: '地址长度在 5-100 个字符' },
  ],
  hobbies: [
    { min: 1, message: '请至少选择一项兴趣爱好' },
  ],
}

const handleSubmit = async () => {
  const { valid, errors } = await formRef.value!.validate()
  if (valid) {
    console.log('提交数据:', formData.value)
    uni.showToast({ title: '提交成功', icon: 'success' })
  } else {
    console.log('验证失败:', errors)
  }
}

const handleReset = () => {
  formRef.value?.reset()
  // 重置表单数据
  formData.value = {
    name: '',
    gender: '',
    age: undefined,
    birthday: '',
    phone: '',
    email: '',
    region: [],
    address: '',
    hobbies: [],
    subscribe: false,
    avatar: '',
  }
}
</script>

```

**使用说明:**
- 支持所有表单控件的统一管理
- 规则可以灵活组合使用
- 支持分组展示,提升用户体验
- 一键提交验证所有字段

参考: src/wd/components/wd-form/wd-form.vue:212-378

### 动态表单项

动态添加或删除表单项。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <view
        v-for="(contact, index) in formData.contacts"
        :key="index"
        class="contact-item"
      >
        <wd-input
          v-model="contact.name"
          :prop="`contacts.${index}.name`"
          label="姓名"
        />

        <wd-input
          v-model="contact.phone"
          :prop="`contacts.${index}.phone`"
          label="电话"
        />

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

      <view class="form-actions">
        <wd-button type="primary" @click="handleSubmit">提交</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from '@/wd'

const formRef = ref<FormInstance>()

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
      {
        validator: (value: string) => /^1[3-9]\d{9}$/.test(value),
        message: '电话格式不正确',
      },
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

const handleSubmit = async () => {
  const { valid } = await formRef.value!.validate()
  if (valid) {
    console.log('提交数据:', formData.value)
  }
}
</script>

```

**使用说明:**
- prop 支持嵌套路径,如 `contacts.0.name`
- 使用 `computed` 动态生成验证规则
- 支持任意层级的嵌套对象和数组

参考: src/wd/components/wd-form/wd-form.vue:232

### 条件验证

根据条件动态调整验证规则。

```vue
<template>
  <view class="demo">
    <wd-form ref="formRef" :model="formData" :rules="rules">
      <wd-radio-group
        v-model="formData.userType"
        label="用户类型"
      >
        <wd-radio value="personal">个人</wd-radio>
        <wd-radio value="company">企业</wd-radio>
      </wd-radio-group>

      <wd-input
        v-model="formData.name"
        prop="name"
        :label="formData.userType === 'personal' ? '姓名' : '企业名称'"
      />

      <wd-input
        v-if="formData.userType === 'personal'"
        v-model="formData.idCard"
        prop="idCard"
        label="身份证号"
      />

      <wd-input
        v-if="formData.userType === 'company'"
        v-model="formData.licenseNo"
        prop="licenseNo"
        label="营业执照号"
      />
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { FormRules } from '@/wd'

const formData = ref({
  userType: 'personal',
  name: '',
  idCard: '',
  licenseNo: '',
})

// 根据用户类型动态生成规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    name: [
      { required: true, message: '请输入名称' },
    ],
  }

  if (formData.value.userType === 'personal') {
    baseRules.idCard = [
      { required: true, message: '请输入身份证号' },
      {
        validator: (value: string) => /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value),
        message: '身份证号格式不正确',
      },
    ]
  } else if (formData.value.userType === 'company') {
    baseRules.licenseNo = [
      { required: true, message: '请输入营业执照号' },
      {
        validator: (value: string) => /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(value),
        message: '营业执照号格式不正确',
      },
    ]
  }

  return baseRules
})
</script>
```

**使用说明:**
- 使用 `computed` 根据条件动态生成规则
- 配合 `v-if` 控制表单项显示
- 验证时只会验证当前显示的字段

参考: src/wd/components/wd-form/wd-form.vue:161-183

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| model | 表单数据对象 | `Record<string, any>` | - |
| rules | 表单验证规则 | `FormRules` | `{}` |
| reset-on-change | 是否在输入时重置表单校验信息 | `boolean` | `true` |
| error-type | 错误提示类型 | `'toast' \| 'message' \| 'none'` | `'message'` |
| label-width | 统一设置表单项标签宽度 | `string \| number` | - |
| custom-style | 自定义根节点样式 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

参考: src/wd/components/wd-form/wd-form.vue:74-90, 106-113

### Methods

通过 ref 可以获取到 Form 实例并调用实例方法。

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| validate | 表单校验 | `prop?: string \| string[]` | `Promise<{ valid: boolean, errors: ErrorMessage[] }>` |
| reset | 重置表单验证提示 | - | - |

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <!-- 表单项 -->
  </wd-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { FormInstance } from '@/wd'

const formRef = ref<FormInstance>()

// 验证所有字段
const validateAll = async () => {
  const { valid, errors } = await formRef.value!.validate()
  console.log('验证结果:', valid, errors)
}

// 验证单个字段
const validateField = async () => {
  const { valid } = await formRef.value!.validate('username')
}

// 验证多个字段
const validateFields = async () => {
  const { valid } = await formRef.value!.validate(['username', 'password'])
}

// 重置验证
const resetValidation = () => {
  formRef.value?.reset()
}
</script>
```

参考: src/wd/components/wd-form/wd-form.vue:95-103, 212-391

### 类型定义

```typescript
/**
 * 表单验证规则类型
 */
export interface FormRules {
  [key: string]: FormItemRule[]
}

/**
 * 错误信息类型
 */
export interface ErrorMessage {
  prop: string
  message: string
}

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

/**
 * 不含验证函数的规则类型
 */
export type FormItemRuleWithoutValidator = Omit<FormItemRule, 'validator'>

/**
 * 表单组件实例类型
 */
export type FormInstance = ComponentPublicInstance<WdFormProps, WdFormExpose>
```

参考: src/wd/components/wd-form/wd-form.vue:28-70, 394

## 最佳实践

### 1. 合理组织验证规则

将验证规则分类组织,提高可维护性:

```typescript
// ✅ 推荐:分类组织规则
const commonRules = {
  required: (message: string) => ({ required: true, message }),
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '手机号格式不正确'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '邮箱格式不正确'
  },
}

const rules = {
  username: [
    commonRules.required('请输入用户名'),
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符' },
  ],
  phone: [
    commonRules.required('请输入手机号'),
    commonRules.phone,
  ],
  email: [
    commonRules.email,
  ],
}
```

### 2. validator 的正确使用

善用 validator 的返回值类型:

```typescript
// ✅ 推荐:明确的返回值
const rules = {
  password: [
    {
      validator: (value: string) => {
        if (value.length < 6) {
          return false // 使用 rule.message
        }
        if (!/\d/.test(value)) {
          return '密码必须包含数字' // 自定义错误信息
        }
        return true // 验证通过
      },
      message: '密码长度不能少于6位',
    },
  ],
}

// ✅ 推荐:异步验证
const rules = {
  username: [
    {
      validator: async (value: string) => {
        const exists = await checkUsername(value)
        if (exists) {
          throw new Error('用户名已存在') // 使用 throw
        }
        return true
      },
      message: '用户名验证失败',
    },
  ],
}
```

### 3. 错误提示类型的选择

根据场景选择合适的错误提示方式:

```vue
<!-- ✅ 推荐:表单较多时使用 message -->
<wd-form error-type="message">
  <!-- 多个表单项,错误提示在每项下方 -->
</wd-form>

<!-- ✅ 推荐:简单表单使用 toast -->
<wd-form error-type="toast">
  <!-- 简单表单,只提示第一个错误 -->
</wd-form>

<!-- ✅ 推荐:自定义错误处理使用 none -->
<wd-form error-type="none">
  <!-- 自己处理错误显示 -->
</wd-form>
```

### 4. 动态表单的规则管理

动态表单使用 computed 生成规则:

```typescript
// ✅ 推荐:使用 computed
const rules = computed<FormRules>(() => {
  const dynamicRules: FormRules = {}

  formData.value.items.forEach((item, index) => {
    dynamicRules[`items.${index}.name`] = [
      { required: true, message: '请输入名称' },
    ]
  })

  return dynamicRules
})

// ❌ 不推荐:每次手动更新
const addItem = () => {
  formData.value.items.push({ name: '' })
  // 手动添加规则,容易出错
  rules.value[`items.${formData.value.items.length - 1}.name`] = [...]
}
```

### 5. 表单提交的完整流程

提交时的完整处理流程:

```typescript
// ✅ 推荐:完整的提交流程
const handleSubmit = async () => {
  // 1. 验证表单
  const { valid, errors } = await formRef.value!.validate()

  if (!valid) {
    console.log('验证失败:', errors)
    return
  }

  // 2. 显示加载
  uni.showLoading({ title: '提交中...' })

  try {
    // 3. 提交数据
    const response = await submitForm(formData.value)

    // 4. 提交成功
    uni.hideLoading()
    uni.showToast({ title: '提交成功', icon: 'success' })

    // 5. 重置表单或跳转
    formRef.value?.reset()
    uni.navigateBack()
  } catch (error) {
    // 6. 处理错误
    uni.hideLoading()
    uni.showToast({
      title: error.message || '提交失败',
      icon: 'none',
    })
  }
}
```

## 常见问题

### 1. 为什么验证不生效?

**问题原因:**
- 表单项没有设置 `prop` 属性
- `prop` 值与 `rules` 中的 key 不一致
- `rules` 没有正确传递

**解决方案:**

```vue
<!-- ❌ 错误:没有设置 prop -->
<wd-input v-model="formData.username" label="用户名" />

<!-- ✅ 正确:设置 prop -->
<wd-input
  v-model="formData.username"
  prop="username"
  label="用户名"
/>

<script lang="ts" setup>
// ✅ 确保 prop 和 rules 的 key 一致
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
}
</script>
```

参考: src/wd/components/wd-form/wd-form.vue:161-183

### 2. 如何验证嵌套对象?

**问题原因:**
- 不知道如何设置嵌套路径的 prop

**解决方案:**

```vue
<template>
  <wd-form :model="formData" :rules="rules">
    <!-- 嵌套对象 -->
    <wd-input
      v-model="formData.user.name"
      prop="user.name"
      label="姓名"
    />

    <!-- 数组 -->
    <wd-input
      v-model="formData.contacts[0].phone"
      prop="contacts.0.phone"
      label="电话"
    />
  </wd-form>
</template>

<script lang="ts" setup>
const formData = ref({
  user: {
    name: '',
  },
  contacts: [
    { phone: '' },
  ],
})

const rules = {
  'user.name': [{ required: true, message: '请输入姓名' }],
  'contacts.0.phone': [{ required: true, message: '请输入电话' }],
}
</script>
```

参考: src/wd/components/wd-form/wd-form.vue:232

### 3. 如何在 validator 中访问其他字段?

**问题原因:**
- validator 中需要关联验证

**解决方案:**

```typescript
// ✅ 正确:通过闭包访问 formData
const rules = {
  confirmPassword: [
    {
      validator: (value: string) => {
        // 直接访问 formData
        return value === formData.value.password
      },
      message: '两次输入的密码不一致',
    },
  ],
}
```

参考: src/wd/components/wd-form/wd-form.vue:316-357

### 4. 异步验证失败但没有提示?

**问题原因:**
- Promise reject 时没有传递错误信息
- validator 返回值类型不正确

**解决方案:**

```typescript
// ✅ 正确:明确返回错误信息
const rules = {
  username: [
    {
      validator: async (value: string) => {
        try {
          const exists = await checkUsername(value)
          if (exists) {
            return '用户名已存在' // 返回错误信息
          }
          return true
        } catch (error) {
          throw new Error('验证失败') // 或 throw error
        }
      },
      message: '用户名验证失败',
    },
  ],
}
```

参考: src/wd/components/wd-form/wd-form.vue:320-346

### 5. 如何重置表单数据?

**问题原因:**
- `reset()` 只清除验证错误,不重置数据

**解决方案:**

```typescript
// ✅ 正确:同时重置验证和数据
const handleReset = () => {
  // 1. 清除验证错误
  formRef.value?.reset()

  // 2. 重置表单数据
  formData.value = {
    username: '',
    password: '',
    // ...
  }

  // 或使用初始值
  Object.assign(formData.value, initialFormData)
}
```

参考: src/wd/components/wd-form/wd-form.vue:383-385

## 注意事项

### 1. model 属性必须传递

- `model` 是必填属性,必须传递表单数据对象
- `model` 应该是响应式对象(ref 或 reactive)
- 不要在 model 中使用计算属性

参考: src/wd/components/wd-form/wd-form.vue:81

### 2. prop 命名规范

- prop 值必须与 model 中的字段路径一致
- 支持嵌套路径,使用 `.` 分隔,如 `user.name`
- 数组索引也使用 `.`,如 `contacts.0.phone`

参考: src/wd/components/wd-form/wd-form.vue:232

### 3. 验证规则说明

- `required`: 值为 `undefined`、`null`、`''` 时触发
- `min`/`max`: 字符串和数组验证长度,数字验证值
- `pattern`: 使用正则表达式验证
- `validator`: 可以返回 boolean、string、Promise

参考: src/wd/components/wd-form/wd-form.vue:46-64

### 4. validator 返回值类型

- 返回 `true`: 验证通过
- 返回 `false`: 验证失败,使用 rule.message
- 返回 `string`: 验证失败,使用返回的字符串
- Promise resolve: 同上规则
- Promise reject: 使用 reject 的值或 rule.message

参考: src/wd/components/wd-form/wd-form.vue:316-357

### 5. 错误提示类型

- `message`: 在表单项下方显示错误(默认)
- `toast`: 使用 toast 显示第一个错误
- `none`: 不显示错误,只返回验证结果

参考: src/wd/components/wd-form/wd-form.vue:87, 189-206

### 6. 规则合并机制

- Form 的 rules 和 FormItem 的 rules 会自动合并
- FormItem 的 rules 会追加到 Form rules 之后
- 验证时按顺序执行,遇到错误立即停止

参考: src/wd/components/wd-form/wd-form.vue:161-183

### 7. resetOnChange 说明

- 默认为 `true`,输入时自动清除对应字段错误
- 设置为 `false` 时,错误会一直显示直到下次验证
- 不影响验证逻辑,只影响错误显示

参考: src/wd/components/wd-form/wd-form.vue:85

### 8. validate 方法说明

- 不传参数: 验证所有字段
- 传字符串: 验证单个字段
- 传数组: 验证多个字段
- 返回 Promise,包含 valid 和 errors

参考: src/wd/components/wd-form/wd-form.vue:212-378

### 9. 异步验证注意事项

- 所有异步验证会并行执行
- 使用 `Promise.all` 等待所有异步验证完成
- 异步验证错误不会中断后续规则验证

参考: src/wd/components/wd-form/wd-form.vue:362

### 10. labelWidth 优先级

- FormItem 的 labelWidth 优先于 Form 的 labelWidth
- 可以为每个表单项设置不同的 labelWidth
- 支持 rpx、px、% 等单位

参考: src/wd/components/wd-form/wd-form.vue:89

### 11. 动态表单项注意事项

- 使用 `:key` 确保列表项正确更新
- 使用 computed 动态生成验证规则
- prop 使用模板字符串生成嵌套路径

### 12. reset 方法说明

- `reset()` 只清除验证错误信息
- 不会重置表单数据
- 需要手动重置 model 数据

参考: src/wd/components/wd-form/wd-form.vue:383-385
