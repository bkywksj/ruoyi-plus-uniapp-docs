# 表单组件

表单组件用于数据录入和表单交互，涵盖输入框、选择器、上传等场景。

## 组件列表

| 组件 | 说明 |
|------|------|
| Form | 表单容器，统一管理表单验证 |
| Input | 文本输入框 |
| Textarea | 多行文本输入 |
| InputNumber | 数字输入框 |
| Checkbox | 复选框 |
| Radio | 单选框 |
| Switch | 开关 |
| Slider | 滑块 |
| Rate | 评分 |
| Picker | 选择器 |
| DatetimePicker | 日期时间选择器 |
| Calendar | 日历选择器 |
| SelectPicker | 下拉选择器 |
| ColPicker | 多列选择器 |
| Upload | 文件上传 |
| Search | 搜索框 |
| PasswordInput | 密码输入框 |
| NumberKeyboard | 数字键盘 |
| Signature | 签名板 |
| ImgCropper | 图片裁剪 |

## 快速使用

### Form 表单

```vue
<template>
  <wd-form ref="formRef" :model="formData" :rules="rules">
    <wd-cell-group>
      <wd-form-item prop="username" label="用户名">
        <wd-input v-model="formData.username" placeholder="请输入用户名" />
      </wd-form-item>
      <wd-form-item prop="password" label="密码">
        <wd-input v-model="formData.password" type="password" placeholder="请输入密码" />
      </wd-form-item>
    </wd-cell-group>
    <wd-button type="primary" block @click="handleSubmit">提交</wd-button>
  </wd-form>
</template>

<script setup>
const formData = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
}
</script>
```

### 选择器组件

```vue
<template>
  <!-- 日期选择 -->
  <wd-datetime-picker v-model="date" label="选择日期" />

  <!-- 地区选择 -->
  <wd-col-picker v-model="region" :columns="regionData" label="选择地区" />

  <!-- 下拉选择 -->
  <wd-select-picker v-model="status" :columns="statusOptions" label="状态" />
</template>
```

### Upload 上传

```vue
<template>
  <wd-upload
    v-model:file-list="fileList"
    action="/api/upload"
    :limit="3"
    accept="image/*"
  />
</template>
```

## 表单验证

内置多种验证规则：

```typescript
const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[\w-]+@[\w-]+\.\w+$/, message: '邮箱格式不正确' }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
  ],
  age: [
    { required: true, message: '请输入年龄' },
    { type: 'number', min: 1, max: 120, message: '年龄范围 1-120' }
  ]
}
```
