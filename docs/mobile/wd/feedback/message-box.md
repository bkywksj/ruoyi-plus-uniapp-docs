# MessageBox 消息弹框

## 介绍

MessageBox 是一个模态对话框组件,用于消息提示、确认操作和获取用户输入。该组件基于 Popup 弹出层实现,支持函数式调用和组件式调用两种方式,提供了 alert、confirm、prompt 三种类型,广泛应用于操作确认、信息提示、用户输入等场景。

**核心特性:**

- **三种弹框类型** - 支持 alert(警告)、confirm(确认)、prompt(输入)三种类型,满足不同场景需求
- **函数式调用** - 通过 `useMessage` 组合函数提供简洁的 API,支持 Promise 链式调用
- **组件式调用** - 支持在模板中声明式使用组件,适合需要自定义内容的场景
- **输入验证** - prompt 类型支持正则表达式和自定义函数两种输入验证方式
- **确认前钩子** - 支持在确认操作前执行异步验证,控制是否允许关闭
- **按钮定制** - 支持自定义确认和取消按钮的文案、样式和属性
- **多实例支持** - 通过 selector 参数支持页面内多个独立的消息框实例
- **暗黑模式** - 内置暗黑模式样式适配,自动跟随系统主题切换
- **安全关闭** - 支持配置点击遮罩是否关闭,避免误操作
- **懒渲染** - 支持懒渲染模式,优化性能

## 基本用法

### Alert 警告弹框

最基础的用法,显示一个带有确认按钮的警告弹框:

```vue
<template>
  <view class="demo">
    <wd-button @click="showAlert">Alert 弹框</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showAlert = async () => {
  const result = await message.alert({
    title: '提示',
    msg: '这是一条提示信息'
  })
  console.log('用户点击了确定', result)
}
</script>

```

**使用说明:**

- 需要在模板中放置 `<wd-message-box />` 组件
- 通过 `useMessage()` 获取消息框实例
- `alert` 方法返回 Promise,可以使用 async/await 获取用户操作结果
- alert 弹框只有确认按钮,用于简单的消息提示

### Confirm 确认弹框

显示带有确认和取消按钮的确认弹框:

```vue
<template>
  <view class="demo">
    <wd-button @click="showConfirm">Confirm 弹框</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showConfirm = async () => {
  const result = await message.confirm({
    title: '确认删除',
    msg: '确定要删除这条记录吗?删除后无法恢复'
  })

  if (result.action === 'confirm') {
    console.log('用户点击了确定')
    // 执行删除操作
  } else {
    console.log('用户点击了取消')
  }
}
</script>
```

**使用说明:**

- confirm 类型会自动显示取消按钮
- 通过 `result.action` 判断用户点击的是确定还是取消
- action 可能的值: `'confirm'`、`'cancel'`、`'modal'`(点击遮罩)

### Prompt 输入弹框

显示带有输入框的弹框,用于获取用户输入:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPrompt">Prompt 弹框</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showPrompt = async () => {
  const result = await message.prompt({
    title: '请输入姓名',
    inputPlaceholder: '请输入您的姓名'
  })

  if (result.action === 'confirm') {
    console.log('用户输入了:', result.value)
  }
}
</script>
```

**使用说明:**

- prompt 类型会显示输入框和取消/确认按钮
- 用户点击确认后,`result.value` 包含输入框的值
- 可通过 `inputPlaceholder` 设置输入框占位文本

### 简化调用

可以只传入字符串作为标题快速调用:

```vue
<template>
  <view class="demo">
    <wd-button @click="quickAlert">快速调用</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const quickAlert = () => {
  // 直接传入字符串作为标题
  message.alert('操作成功!')
}
</script>
```

### 自定义按钮文案

通过 `confirmButtonText` 和 `cancelButtonText` 自定义按钮文案:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomText">自定义按钮文案</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showCustomText = () => {
  message.confirm({
    title: '退出登录',
    msg: '确定要退出当前账号吗?',
    confirmButtonText: '退出',
    cancelButtonText: '留下'
  })
}
</script>
```

### 自定义按钮样式

通过 `confirmButtonProps` 和 `cancelButtonProps` 自定义按钮属性:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomStyle">自定义按钮样式</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showCustomStyle = () => {
  message.confirm({
    title: '危险操作',
    msg: '此操作不可逆,请谨慎操作!',
    confirmButtonText: '确认删除',
    confirmButtonProps: {
      type: 'error',
      plain: false
    },
    cancelButtonProps: {
      type: 'info',
      plain: true
    }
  })
}
</script>
```

**使用说明:**

- `confirmButtonProps` 和 `cancelButtonProps` 支持所有 WdButton 组件的属性
- 可以设置 `type`、`plain`、`disabled`、`loading` 等属性

### 输入框类型

prompt 类型支持不同的输入框类型:

```vue
<template>
  <view class="demo">
    <wd-button @click="showTextInput">文本输入</wd-button>
    <wd-button @click="showPasswordInput">密码输入</wd-button>
    <wd-button @click="showNumberInput">数字输入</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showTextInput = () => {
  message.prompt({
    title: '请输入用户名',
    inputType: 'text',
    inputPlaceholder: '请输入用户名'
  })
}

const showPasswordInput = () => {
  message.prompt({
    title: '请输入密码',
    inputType: 'password',
    inputPlaceholder: '请输入密码'
  })
}

const showNumberInput = () => {
  message.prompt({
    title: '请输入金额',
    inputType: 'number',
    inputPlaceholder: '请输入金额'
  })
}
</script>
```

**使用说明:**

- `inputType` 支持 `'text'`、`'password'`、`'number'`、`'digit'`、`'idcard'` 等类型
- 类型与原生 input 的 type 属性一致

### 输入框默认值

通过 `inputValue` 设置输入框的默认值:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithDefault">带默认值</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showWithDefault = () => {
  message.prompt({
    title: '修改昵称',
    inputValue: '张三',
    inputPlaceholder: '请输入新昵称'
  })
}
</script>
```

## 输入验证

### 正则表达式验证

通过 `inputPattern` 设置正则表达式进行输入验证:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithPattern">正则验证</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showWithPattern = () => {
  message.prompt({
    title: '请输入手机号',
    inputType: 'number',
    inputPlaceholder: '请输入11位手机号',
    inputPattern: /^1[3-9]\d{9}$/,
    inputError: '请输入正确的手机号'
  })
}
</script>
```

**使用说明:**

- `inputPattern` 设置正则表达式
- `inputError` 设置验证失败时的错误提示
- 点击确认时会自动进行验证,验证失败会显示错误提示

### 自定义验证函数

通过 `inputValidate` 设置自定义验证函数:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithValidate">自定义验证</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showWithValidate = () => {
  message.prompt({
    title: '请输入邮箱',
    inputPlaceholder: '请输入有效邮箱地址',
    inputValidate: (value) => {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailReg.test(String(value))
    },
    inputError: '请输入有效的邮箱地址'
  })
}
</script>
```

### 组合验证

同时使用正则和自定义函数进行验证:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCombinedValidate">组合验证</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showCombinedValidate = () => {
  message.prompt({
    title: '设置密码',
    inputType: 'password',
    inputPlaceholder: '请输入6-20位密码',
    // 正则验证: 长度6-20位
    inputPattern: /^.{6,20}$/,
    // 自定义验证: 必须包含字母和数字
    inputValidate: (value) => {
      const hasLetter = /[a-zA-Z]/.test(String(value))
      const hasNumber = /\d/.test(String(value))
      return hasLetter && hasNumber
    },
    inputError: '密码需要6-20位,且包含字母和数字'
  })
}
</script>
```

**使用说明:**

- 先执行 `inputPattern` 正则验证
- 正则验证通过后,再执行 `inputValidate` 自定义函数验证
- 任一验证失败都会阻止关闭并显示错误提示

## 确认前钩子

### 基本用法

通过 `beforeConfirm` 设置确认前钩子,用于异步验证:

```vue
<template>
  <view class="demo">
    <wd-button @click="showWithBeforeConfirm">确认前验证</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showWithBeforeConfirm = () => {
  message.confirm({
    title: '提交订单',
    msg: '确定要提交这个订单吗?',
    beforeConfirm: ({ resolve }) => {
      // 模拟异步验证
      setTimeout(() => {
        const isValid = true // 实际场景中进行业务验证
        resolve(isValid) // 传入 true 允许关闭,传入 false 阻止关闭
      }, 1000)
    }
  })
}
</script>
```

**使用说明:**

- `beforeConfirm` 接收一个包含 `resolve` 函数的对象
- 调用 `resolve(true)` 允许确认操作继续执行
- 调用 `resolve(false)` 阻止确认操作

### 异步验证示例

结合 API 请求进行验证:

```vue
<template>
  <view class="demo">
    <wd-button @click="showAsyncValidate">异步验证</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// 模拟 API 请求
const checkStock = (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true) // 库存充足
    }, 1000)
  })
}

const showAsyncValidate = () => {
  message.confirm({
    title: '确认购买',
    msg: '确定要购买此商品吗?',
    beforeConfirm: async ({ resolve }) => {
      try {
        // 检查库存
        const hasStock = await checkStock()
        if (hasStock) {
          resolve(true)
        } else {
          uni.showToast({ title: '库存不足', icon: 'none' })
          resolve(false)
        }
      } catch (error) {
        uni.showToast({ title: '网络错误', icon: 'none' })
        resolve(false)
      }
    }
  })
}
</script>
```

## 高级用法

### 禁止点击遮罩关闭

通过 `closeOnClickModal` 禁止点击遮罩关闭弹框:

```vue
<template>
  <view class="demo">
    <wd-button @click="showNoClose">禁止遮罩关闭</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showNoClose = () => {
  message.confirm({
    title: '重要提示',
    msg: '请确认您已阅读并同意用户协议',
    closeOnClickModal: false
  })
}
</script>
```

### 自定义层级

通过 `zIndex` 设置弹框层级:

```vue
<template>
  <view class="demo">
    <wd-button @click="showHighZIndex">高层级弹框</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showHighZIndex = () => {
  message.alert({
    title: '提示',
    msg: '这是一个高层级的弹框',
    zIndex: 9999
  })
}
</script>
```

### 手动关闭

使用 `close` 方法手动关闭弹框:

```vue
<template>
  <view class="demo">
    <wd-button @click="showAndClose">显示并自动关闭</wd-button>
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showAndClose = () => {
  message.alert({
    title: '提示',
    msg: '3秒后自动关闭'
  })

  // 3秒后自动关闭
  setTimeout(() => {
    message.close()
  }, 3000)
}
</script>
```

### 多实例支持

通过 `selector` 参数支持页面内多个独立的消息框实例:

```vue
<template>
  <view class="demo">
    <wd-button @click="showMessage1">消息框1</wd-button>
    <wd-button @click="showMessage2">消息框2</wd-button>

    <!-- 两个独立的消息框实例 -->
    <wd-message-box selector="msg1" />
    <wd-message-box selector="msg2" />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

// 创建两个独立的消息框实例
const message1 = useMessage('msg1')
const message2 = useMessage('msg2')

const showMessage1 = () => {
  message1.alert({
    title: '消息框1',
    msg: '这是第一个消息框'
  })
}

const showMessage2 = () => {
  message2.alert({
    title: '消息框2',
    msg: '这是第二个消息框'
  })
}
</script>
```

**使用说明:**

- `selector` 参数用于区分不同的消息框实例
- 组件和 useMessage 的 selector 必须一致
- 多实例可以独立显示和关闭

### 组件式调用

除了函数式调用,也可以使用组件式调用:

```vue
<template>
  <view class="demo">
    <wd-button @click="visible = true">显示弹框</wd-button>

    <wd-message-box
      v-model:visible="visible"
      title="提示"
      msg="这是组件式调用"
      type="confirm"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)

const handleConfirm = () => {
  console.log('确认')
  visible.value = false
}

const handleCancel = () => {
  console.log('取消')
  visible.value = false
}
</script>
```

### 自定义内容

通过默认插槽自定义弹框内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="visible = true">自定义内容</wd-button>

    <wd-message-box
      v-model:visible="visible"
      title="用户协议"
      type="confirm"
    >
      <view class="custom-content">
        <text class="agreement-text">
          请认真阅读以下协议内容,点击确认即表示您同意本协议。
        </text>
        <view class="agreement-list">
          <text>1. 用户需遵守相关法律法规</text>
          <text>2. 用户需保护账号安全</text>
          <text>3. 禁止传播违规内容</text>
        </view>
      </view>
    </wd-message-box>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model:visible | 控制弹框显示/隐藏 | `boolean` | `false` |
| title | 弹框标题 | `string` | `''` |
| msg | 消息文案 | `string` | `''` |
| type | 弹框类型 | `'alert' \| 'confirm' \| 'prompt'` | `'alert'` |
| show-cancel-button | 是否显示取消按钮 | `boolean` | `false` |
| confirm-button-text | 确认按钮文案 | `string` | `'确定'` |
| cancel-button-text | 取消按钮文案 | `string` | `'取消'` |
| confirm-button-props | 确认按钮属性 | `object` | `{}` |
| cancel-button-props | 取消按钮属性 | `object` | `{}` |
| close-on-click-modal | 是否支持点击遮罩关闭 | `boolean` | `true` |
| input-type | 输入框类型(prompt 类型有效) | `InputType` | `'text'` |
| input-value | 输入框初始值(prompt 类型有效) | `string \| number` | `''` |
| input-placeholder | 输入框占位文本(prompt 类型有效) | `string` | `''` |
| input-pattern | 输入框正则验证(prompt 类型有效) | `RegExp` | - |
| input-validate | 输入框自定义验证函数(prompt 类型有效) | `(value: string \| number) => boolean` | - |
| input-error | 输入验证失败提示文案(prompt 类型有效) | `string` | `'输入内容不符合要求'` |
| before-confirm | 确认前钩子函数 | `(options: { resolve: (isPass: boolean) => void }) => void` | - |
| z-index | 弹框层级 | `number` | `1000` |
| lazy-render | 是否懒渲染 | `boolean` | `true` |
| selector | 选择器,用于多实例 | `string` | `''` |
| custom-class | 自定义根节点样式类 | `string` | `''` |

### InputType 类型

```typescript
type InputType =
  | 'text'      // 文本输入
  | 'password'  // 密码输入
  | 'number'    // 数字输入
  | 'digit'     // 带小数点数字
  | 'idcard'    // 身份证输入
```

### useMessage 方法

通过 `useMessage(selector?: string)` 获取消息框实例,返回以下方法:

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| show | 显示消息框 | `options: MessageOptions \| string` | `Promise<MessageResult>` |
| alert | 显示警告弹框 | `options: MessageOptions \| string` | `Promise<MessageResult>` |
| confirm | 显示确认弹框 | `options: MessageOptions \| string` | `Promise<MessageResult>` |
| prompt | 显示输入弹框 | `options: MessageOptions \| string` | `Promise<MessageResult>` |
| close | 关闭消息框 | - | - |

### MessageOptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 弹框标题 | `string` | `''` |
| msg | 消息文案 | `string` | `''` |
| type | 弹框类型 | `MessageType` | `'alert'` |
| showCancelButton | 是否显示取消按钮 | `boolean` | 根据 type 自动设置 |
| confirmButtonText | 确认按钮文案 | `string` | `'确定'` |
| cancelButtonText | 取消按钮文案 | `string` | `'取消'` |
| confirmButtonProps | 确认按钮属性 | `object` | `{}` |
| cancelButtonProps | 取消按钮属性 | `object` | `{}` |
| closeOnClickModal | 是否支持点击遮罩关闭 | `boolean` | `true` |
| inputType | 输入框类型 | `InputType` | `'text'` |
| inputValue | 输入框初始值 | `string \| number` | `''` |
| inputPlaceholder | 输入框占位文本 | `string` | `''` |
| inputPattern | 输入框正则验证 | `RegExp` | - |
| inputValidate | 输入框自定义验证函数 | `InputValidate` | - |
| inputError | 输入验证失败提示文案 | `string` | `'输入内容不符合要求'` |
| beforeConfirm | 确认前钩子函数 | `(options: MessageBeforeConfirmOption) => void` | - |
| zIndex | 弹框层级 | `number` | `1000` |
| lazyRender | 是否懒渲染 | `boolean` | `true` |

### MessageResult

| 字段 | 说明 | 类型 |
|------|------|------|
| action | 用户操作类型 | `'confirm' \| 'cancel' \| 'modal'` |
| value | 输入框的值(prompt 类型有效) | `string \| number` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义弹框内容,会替换 msg |

### 类型定义

```typescript
/**
 * 消息框类型
 */
export type MessageType = 'alert' | 'confirm' | 'prompt'

/**
 * 操作类型
 */
export type ActionType = 'confirm' | 'cancel' | 'modal'

/**
 * 输入校验函数
 */
export type InputValidate = (inputValue: string | number) => boolean

/**
 * 确认前钩子选项
 */
export interface MessageBeforeConfirmOption {
  resolve: (isPass: boolean) => void
}

/**
 * 消息框结果
 */
export interface MessageResult {
  /** 用户操作类型 */
  action: ActionType
  /** 输入框的值(prompt 类型有效) */
  value?: string | number
}

/**
 * 消息框配置选项
 */
export interface MessageOptions {
  /** 标题 */
  title?: string
  /** 是否展示取消按钮 */
  showCancelButton?: boolean
  /** 是否支持点击蒙层进行关闭 */
  closeOnClickModal?: boolean
  /** 确定按钮文案 */
  confirmButtonText?: string
  /** 取消按钮文案 */
  cancelButtonText?: string
  /** 消息文案 */
  msg?: string
  /** 弹框类型 */
  type?: MessageType
  /** 输入框类型 */
  inputType?: InputType
  /** 输入框初始值 */
  inputValue?: string | number
  /** 输入框placeholder */
  inputPlaceholder?: string
  /** 输入框正则校验 */
  inputPattern?: RegExp
  /** 输入框校验函数 */
  inputValidate?: InputValidate
  /** 输入框检验不通过时的错误提示文案 */
  inputError?: string
  /** 是否展示错误信息 */
  showErr?: boolean
  /** 弹窗层级 */
  zIndex?: number
  /** 弹层内容懒渲染 */
  lazyRender?: boolean
  /** 确认前钩子 */
  beforeConfirm?: (options: MessageBeforeConfirmOption) => void
  /** 取消按钮Props */
  cancelButtonProps?: any
  /** 确认按钮Props */
  confirmButtonProps?: any
}
```

## 主题定制

### CSS 变量

组件提供以下 CSS 变量,可用于自定义样式:

```scss
// 弹框宽度
$-message-box-width: 560rpx;
// 弹框圆角
$-message-box-radius: 16rpx;
// 弹框背景色
$-message-box-bg: #ffffff;
// 弹框内边距
$-message-box-padding: 48rpx 48rpx 0;

// 标题字体大小
$-message-box-title-fs: 32rpx;
// 标题颜色
$-message-box-title-color: #333333;

// 内容字体大小
$-message-box-content-fs: 28rpx;
// 内容颜色
$-message-box-content-color: #666666;
// 内容最大高度
$-message-box-content-max-height: 400rpx;
// 内容滚动条宽度
$-message-box-content-scrollbar-width: 4rpx;
// 内容滚动条颜色
$-message-box-content-scrollbar-color: #e5e5e5;

// 输入错误提示颜色
$-message-box-input-error-color: #ff4d4f;
```

### 暗黑模式

组件内置暗黑模式样式适配,在暗黑模式下会自动应用:

```scss
.wot-theme-dark {
  .wd-message-box {
    &__body {
      background-color: $-dark-background2;
    }

    &__title {
      color: $-dark-color;
    }

    &__content {
      color: $-dark-color3;
    }
  }
}
```

## 最佳实践

### 1. 选择合适的弹框类型

根据场景选择合适的弹框类型:

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// ✅ 纯提示信息用 alert
const showInfo = () => {
  message.alert({
    title: '提示',
    msg: '操作已完成'
  })
}

// ✅ 需要用户确认的操作用 confirm
const showConfirm = () => {
  message.confirm({
    title: '确认',
    msg: '确定要执行此操作吗?'
  })
}

// ✅ 需要用户输入的场景用 prompt
const showPrompt = () => {
  message.prompt({
    title: '请输入',
    inputPlaceholder: '请输入内容'
  })
}
</script>
```

### 2. 危险操作使用红色按钮

对于删除等危险操作,使用红色按钮提醒用户:

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// ✅ 删除操作使用红色确认按钮
const confirmDelete = () => {
  message.confirm({
    title: '确认删除',
    msg: '删除后无法恢复,是否继续?',
    confirmButtonText: '删除',
    confirmButtonProps: {
      type: 'error'
    }
  })
}
</script>
```

### 3. 异步操作使用 beforeConfirm

对于需要异步验证的场景,使用 beforeConfirm 钩子:

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// ✅ 异步验证使用 beforeConfirm
const submitWithValidation = () => {
  message.confirm({
    title: '提交订单',
    msg: '确定要提交订单吗?',
    beforeConfirm: async ({ resolve }) => {
      try {
        const isValid = await validateOrder()
        resolve(isValid)
      } catch {
        uni.showToast({ title: '验证失败', icon: 'none' })
        resolve(false)
      }
    }
  })
}
</script>
```

### 4. 重要操作禁止遮罩关闭

对于重要操作,禁止点击遮罩关闭:

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// ✅ 重要操作禁止遮罩关闭
const importantConfirm = () => {
  message.confirm({
    title: '重要提示',
    msg: '请仔细确认操作内容',
    closeOnClickModal: false
  })
}
</script>
```

### 5. 输入验证要有明确提示

prompt 类型的输入验证要提供明确的错误提示:

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// ✅ 提供明确的验证规则和错误提示
const inputWithValidation = () => {
  message.prompt({
    title: '设置密码',
    inputType: 'password',
    inputPlaceholder: '请输入6-20位密码,包含字母和数字',
    inputPattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/,
    inputError: '密码需要6-20位,且包含字母和数字'
  })
}
</script>
```

## 常见问题

### 1. 弹框无法显示

**问题原因:**
- 没有在模板中放置 `<wd-message-box />` 组件
- useMessage 的 selector 与组件的 selector 不匹配

**解决方案:**

```vue
<template>
  <view>
    <!-- ✅ 必须在模板中放置组件 -->
    <wd-message-box />

    <!-- 使用 selector 时要保持一致 -->
    <wd-message-box selector="custom" />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

// ✅ 默认实例
const message = useMessage()

// ✅ 自定义 selector 要与组件一致
const customMessage = useMessage('custom')
</script>
```

### 2. 输入验证不生效

**问题原因:**
- inputPattern 正则表达式错误
- inputValidate 函数没有返回布尔值

**解决方案:**

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// ✅ 确保正则表达式正确
const showCorrectPattern = () => {
  message.prompt({
    title: '输入手机号',
    inputPattern: /^1[3-9]\d{9}$/, // 注意正则语法
    inputError: '请输入正确的手机号'
  })
}

// ✅ 确保验证函数返回布尔值
const showCorrectValidate = () => {
  message.prompt({
    title: '输入内容',
    inputValidate: (value) => {
      // 必须返回布尔值
      return String(value).length >= 5
    }
  })
}
</script>
```

### 3. beforeConfirm 钩子无法阻止关闭

**问题原因:**
- 没有调用 resolve 函数
- resolve 传入了非布尔值

**解决方案:**

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

const showWithHook = () => {
  message.confirm({
    title: '确认',
    msg: '确定吗?',
    beforeConfirm: ({ resolve }) => {
      // ✅ 必须调用 resolve 并传入布尔值
      const isValid = checkSomething()
      resolve(isValid) // true 允许关闭,false 阻止关闭
    }
  })
}

// ❌ 错误示例
const wrongHook = () => {
  message.confirm({
    title: '确认',
    beforeConfirm: ({ resolve }) => {
      // ❌ 没有调用 resolve,弹框会一直卡住
      checkSomething()
    }
  })
}
</script>
```

### 4. 多次调用弹框重叠

**问题原因:**
- 没有等待上一个弹框关闭就调用下一个

**解决方案:**

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd/components/wd-message-box/useMessage'

const message = useMessage()

// ✅ 使用 await 等待用户操作
const sequentialMessages = async () => {
  const result1 = await message.confirm({
    title: '第一步',
    msg: '确认第一步?'
  })

  if (result1.action === 'confirm') {
    const result2 = await message.confirm({
      title: '第二步',
      msg: '确认第二步?'
    })
  }
}

// ✅ 或使用多实例
const message1 = useMessage('msg1')
const message2 = useMessage('msg2')
</script>

<template>
  <view>
    <wd-message-box selector="msg1" />
    <wd-message-box selector="msg2" />
  </view>
</template>
```

### 5. 自定义内容不生效

**问题原因:**
- 同时设置了 msg 属性和插槽内容
- 使用函数式调用时无法使用插槽

**解决方案:**

```vue
<template>
  <view>
    <!-- ✅ 组件式调用才能使用插槽 -->
    <wd-message-box
      v-model:visible="visible"
      title="自定义内容"
    >
      <!-- 不要同时设置 msg 属性 -->
      <view class="custom">
        自定义内容
      </view>
    </wd-message-box>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(false)
</script>
```
