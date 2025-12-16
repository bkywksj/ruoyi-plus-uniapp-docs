# useMessage 消息框

## 介绍

`useMessage` 是一个基于 Promise 的消息框 Composable,提供 alert(警告)、confirm(确认)、prompt(输入)三种对话框类型。它通过函数式调用方式,为 UniApp 应用提供优雅、灵活的用户交互体验。

本 Composable 基于 WD UI 的 MessageBox 组件封装,采用单例模式管理实例,支持多实例隔离,并提供完整的 TypeScript 类型支持。所有操作都返回 Promise,方便使用 async/await 语法处理用户选择。

**核心特性:**

- **Promise 异步模式** - 所有方法返回 Promise,支持 async/await,优雅处理用户交互结果
- **三种对话框类型** - 提供 alert(警告)、confirm(确认)、prompt(输入)三种常用对话框
- **单例模式管理** - 每个 selector 对应唯一实例,避免重复创建,确保同时只显示一个对话框
- **多实例隔离** - 支持通过 selector 创建多个独立实例,不同模块互不干扰
- **输入验证机制** - prompt 类型支持正则验证和自定义验证函数,实时错误提示
- **确认前钩子** - 提供 beforeConfirm 钩子,在确认前执行异步校验或其他逻辑
- **灵活的按钮配置** - 支持自定义按钮文本、样式和属性
- **蒙层交互控制** - 可配置是否允许点击蒙层关闭,action 返回值区分用户操作类型
- **TypeScript 类型安全** - 完整的类型定义,包括 MessageOptions、MessageResult 等接口
- **平台兼容性** - 支持 H5、微信小程序、App 等多个 UniApp 平台

## 基本用法

### Alert 警告框

显示一个简单的警告信息,用户只能点击确定按钮:

```vue
<template>
  <view class="demo">
    <wd-button @click="showAlert">显示警告</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showAlert = async () => {
  await message.alert('这是一条警告信息')
  console.log('用户点击了确定')
}
</script>

```

**使用说明:**
- `alert()` 方法只显示确定按钮,不显示取消按钮
- 返回 Promise,用户点击确定后 resolve
- 可以直接传入字符串作为标题,或传入配置对象

### Alert 带自定义标题和内容

自定义标题和消息内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomAlert">自定义警告</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showCustomAlert = async () => {
  await message.alert({
    title: '提示',
    msg: '您的操作已成功完成',
    confirmButtonText: '我知道了',
  })
}
</script>
```

**使用说明:**
- `title` 设置对话框标题
- `msg` 设置消息内容
- `confirmButtonText` 自定义确定按钮文字

### Confirm 确认框

显示确认框,用户可以选择确定或取消:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleDelete">删除数据</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const handleDelete = async () => {
  try {
    const result = await message.confirm('确定要删除这条数据吗?')

    if (result.action === 'confirm') {
      // 用户点击了确定
      await deleteData()
      console.log('删除成功')
    }
  } catch (error) {
    // 用户点击了取消或关闭
    console.log('取消删除')
  }
}

const deleteData = () => {
  return new Promise(resolve => setTimeout(resolve, 1000))
}
</script>
```

**使用说明:**
- `confirm()` 方法自动显示确定和取消按钮
- 用户点击确定时,Promise resolve 返回结果对象
- 用户点击取消时,Promise reject
- 通过 `result.action` 判断用户点击的按钮('confirm' 或 'cancel')

### Confirm 自定义按钮文本

自定义确定和取消按钮的文字:

```vue
<template>
  <view class="demo">
    <wd-button @click="showCustomConfirm">退出登录</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showCustomConfirm = async () => {
  try {
    await message.confirm({
      title: '退出确认',
      msg: '确定要退出登录吗?',
      confirmButtonText: '退出',
      cancelButtonText: '留下',
    })

    // 执行退出登录
    logout()
  } catch (error) {
    console.log('取消退出')
  }
}

const logout = () => {
  console.log('执行退出登录')
}
</script>
```

**使用说明:**
- `confirmButtonText` 自定义确定按钮文字
- `cancelButtonText` 自定义取消按钮文字
- 使用 try-catch 处理用户选择

### Prompt 输入框

显示输入框,获取用户输入:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPrompt">修改昵称</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'
import { ref } from 'vue'

const message = useMessage()
const nickname = ref('张三')

const showPrompt = async () => {
  try {
    const result = await message.prompt({
      title: '修改昵称',
      inputValue: nickname.value,
      inputPlaceholder: '请输入新昵称',
    })

    if (result.action === 'confirm' && result.value) {
      nickname.value = result.value as string
      console.log('新昵称:', nickname.value)
    }
  } catch (error) {
    console.log('取消修改')
  }
}
</script>
```

**使用说明:**
- `prompt()` 方法显示输入框
- `inputValue` 设置输入框初始值
- `inputPlaceholder` 设置输入框占位符
- 用户确定后,通过 `result.value` 获取输入内容

### Prompt 输入验证

使用正则表达式或自定义函数验证用户输入:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPhonePrompt">修改手机号</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showPhonePrompt = async () => {
  try {
    const result = await message.prompt({
      title: '修改手机号',
      inputType: 'number',
      inputPlaceholder: '请输入手机号',
      inputPattern: /^1[3-9]\d{9}$/,
      inputError: '请输入正确的手机号',
    })

    if (result.action === 'confirm') {
      console.log('新手机号:', result.value)
      // 提交手机号
      await updatePhone(result.value as string)
    }
  } catch (error) {
    console.log('取消修改')
  }
}

const updatePhone = (phone: string) => {
  return new Promise(resolve => setTimeout(resolve, 1000))
}
</script>
```

**使用说明:**
- `inputType` 设置输入框类型(text、number、tel等)
- `inputPattern` 提供正则表达式验证
- `inputError` 设置验证失败的错误提示
- 验证失败时,确定按钮无法触发

### Prompt 自定义验证函数

使用自定义验证函数进行复杂验证:

```vue
<template>
  <view class="demo">
    <wd-button @click="showPasswordPrompt">修改密码</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showPasswordPrompt = async () => {
  try {
    const result = await message.prompt({
      title: '修改密码',
      inputType: 'password',
      inputPlaceholder: '请输入新密码',
      inputValidate: (value: string | number) => {
        const password = String(value)
        // 密码长度 6-20 位,必须包含字母和数字
        if (password.length < 6 || password.length > 20) {
          return false
        }
        const hasLetter = /[a-zA-Z]/.test(password)
        const hasNumber = /\d/.test(password)
        return hasLetter && hasNumber
      },
      inputError: '密码长度6-20位,必须包含字母和数字',
    })

    if (result.action === 'confirm') {
      console.log('新密码:', result.value)
      await updatePassword(result.value as string)
    }
  } catch (error) {
    console.log('取消修改')
  }
}

const updatePassword = (password: string) => {
  return new Promise(resolve => setTimeout(resolve, 1000))
}
</script>
```

**使用说明:**
- `inputValidate` 接收自定义验证函数
- 验证函数返回 true 表示通过,false 表示失败
- 支持复杂的业务验证逻辑

### 点击蒙层关闭

配置是否允许点击蒙层关闭对话框:

```vue
<template>
  <view class="demo">
    <wd-button @click="showModal">重要提示</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showModal = async () => {
  try {
    const result = await message.alert({
      title: '重要提示',
      msg: '请仔细阅读用户协议',
      closeOnClickModal: false, // 禁止点击蒙层关闭
    })

    console.log('用户已阅读')
  } catch (error) {
    console.log('关闭对话框')
  }
}
</script>
```

**使用说明:**
- `closeOnClickModal: false` 禁止点击蒙层关闭
- 用户必须点击按钮才能关闭对话框
- 适用于重要提示、强制阅读的场景

### 获取点击来源

通过 action 区分用户的操作来源:

```vue
<template>
  <view class="demo">
    <wd-button @click="showConfirm">操作确认</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showConfirm = async () => {
  try {
    const result = await message.confirm({
      title: '操作确认',
      msg: '确定要执行此操作吗?',
      closeOnClickModal: true,
    })

    // 判断用户操作
    if (result.action === 'confirm') {
      console.log('用户点击了确定按钮')
    } else if (result.action === 'cancel') {
      console.log('用户点击了取消按钮')
    } else if (result.action === 'modal') {
      console.log('用户点击了蒙层')
    }
  } catch (error) {
    console.log('对话框关闭')
  }
}
</script>
```

**使用说明:**
- `result.action` 返回操作类型
- `'confirm'` - 点击确定按钮
- `'cancel'` - 点击取消按钮
- `'modal'` - 点击蒙层关闭

## 高级用法

### 确认前钩子

在用户点击确定前执行异步校验:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleSubmit">提交订单</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage, useToast } from '@/wd'

const message = useMessage()
const toast = useToast()

const handleSubmit = async () => {
  try {
    await message.confirm({
      title: '提交确认',
      msg: '确定要提交订单吗?',
      beforeConfirm: async ({ resolve }) => {
        // 显示加载提示
        toast.loading('正在验证库存...')

        try {
          // 异步验证库存
          const hasStock = await checkStock()
          toast.close()

          if (hasStock) {
            // 验证通过,允许确认
            resolve(true)
          } else {
            // 验证失败,阻止确认
            toast.error('库存不足')
            resolve(false)
          }
        } catch (error) {
          toast.close()
          toast.error('验证失败')
          resolve(false)
        }
      },
    })

    // beforeConfirm 验证通过后才会执行到这里
    console.log('订单提交成功')
    await submitOrder()
  } catch (error) {
    console.log('取消提交')
  }
}

const checkStock = () => {
  return new Promise<boolean>(resolve => {
    setTimeout(() => resolve(true), 2000)
  })
}

const submitOrder = () => {
  return new Promise(resolve => setTimeout(resolve, 1000))
}
</script>
```

**技术实现:**
- `beforeConfirm` 钩子在用户点击确定时触发
- 钩子接收 `{ resolve }` 参数
- 调用 `resolve(true)` 允许确认,`resolve(false)` 阻止确认
- 适合需要异步校验的场景:库存检查、权限验证等

### 多实例管理

使用 selector 创建多个独立的消息框实例:

```vue
<template>
  <view class="demo">
    <wd-button @click="showMainDialog">主要对话框</wd-button>
    <wd-button @click="showSecondaryDialog">次要对话框</wd-button>

    <!-- 需要在页面中放置对应的组件 -->
    <wd-message-box selector="main" />
    <wd-message-box selector="secondary" />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

// 创建两个独立实例
const mainMessage = useMessage('main')
const secondaryMessage = useMessage('secondary')

const showMainDialog = async () => {
  await mainMessage.alert({
    title: '主要提示',
    msg: '这是主要对话框',
  })
}

const showSecondaryDialog = async () => {
  await secondaryMessage.alert({
    title: '次要提示',
    msg: '这是次要对话框',
  })
}
</script>
```

**技术实现:**
- `useMessage(selector)` 通过 selector 区分不同实例
- 每个 selector 对应唯一的缓存 key
- 页面中需要放置对应 selector 的 `<wd-message-box>` 组件
- 不同实例互不干扰,可以独立控制

### 自定义按钮样式

自定义确定和取消按钮的样式和属性:

```vue
<template>
  <view class="demo">
    <wd-button @click="showStyledConfirm">样式化确认框</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showStyledConfirm = async () => {
  try {
    await message.confirm({
      title: '删除确认',
      msg: '此操作不可恢复,确定要删除吗?',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonProps: {
        type: 'error', // 红色危险按钮
        round: true,   // 圆角按钮
      },
      cancelButtonProps: {
        type: 'default',
        plain: true,    // 朴素按钮
      },
    })

    console.log('执行删除操作')
  } catch (error) {
    console.log('取消删除')
  }
}
</script>
```

**使用说明:**
- `confirmButtonProps` 配置确定按钮的属性
- `cancelButtonProps` 配置取消按钮的属性
- 支持所有 wd-button 组件的属性:type、round、plain、size 等
- 可以完全自定义按钮的外观

### 动态内容

根据业务逻辑动态生成对话框内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleBatchDelete">批量删除</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'
import { ref } from 'vue'

const message = useMessage()
const selectedItems = ref([
  { id: 1, name: '文件1' },
  { id: 2, name: '文件2' },
  { id: 3, name: '文件3' },
])

const handleBatchDelete = async () => {
  const count = selectedItems.value.length

  try {
    await message.confirm({
      title: '批量删除确认',
      msg: `确定要删除选中的 ${count} 个文件吗?\n此操作不可恢复!`,
      confirmButtonText: `删除 ${count} 个文件`,
      confirmButtonProps: {
        type: 'error',
      },
    })

    console.log('批量删除', count, '个文件')
  } catch (error) {
    console.log('取消删除')
  }
}
</script>
```

**技术实现:**
- 根据选中项数量动态生成提示内容
- 确定按钮文字也可以动态变化
- 使用 `\n` 换行符分隔多行文本

### 输入框类型切换

根据需求使用不同类型的输入框:

```vue
<template>
  <view class="demo">
    <wd-button @click="showTextPrompt">文本输入</wd-button>
    <wd-button @click="showNumberPrompt">数字输入</wd-button>
    <wd-button @click="showPasswordPrompt">密码输入</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showTextPrompt = async () => {
  const result = await message.prompt({
    title: '输入姓名',
    inputType: 'text',
    inputPlaceholder: '请输入您的姓名',
  })
  console.log('姓名:', result.value)
}

const showNumberPrompt = async () => {
  const result = await message.prompt({
    title: '输入年龄',
    inputType: 'number',
    inputPlaceholder: '请输入您的年龄',
  })
  console.log('年龄:', result.value)
}

const showPasswordPrompt = async () => {
  const result = await message.prompt({
    title: '输入密码',
    inputType: 'password',
    inputPlaceholder: '请输入密码',
  })
  console.log('密码:', result.value)
}
</script>
```

**使用说明:**
- `inputType` 支持的类型:'text'、'number'、'tel'、'password'、'digit' 等
- 不同类型会调用不同的键盘
- 数字类型会限制只能输入数字

### 懒加载渲染

优化性能,只在显示时才渲染对话框内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="showLazyDialog">懒加载对话框</wd-button>

    <wd-message-box :lazy-render="true" />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showLazyDialog = async () => {
  await message.alert({
    title: '懒加载提示',
    msg: '对话框内容只在首次显示时才渲染',
    lazyRender: true, // 默认就是 true
  })
}
</script>
```

**技术实现:**
- `lazyRender: true` (默认)时,对话框内容在首次显示时才渲染到 DOM
- 减少初始渲染负担,提升页面加载性能
- 适合对话框较多的页面

### 层级控制

设置对话框的 zIndex,控制显示层级:

```vue
<template>
  <view class="demo">
    <wd-button @click="showHighLevelDialog">高层级对话框</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

const showHighLevelDialog = async () => {
  await message.alert({
    title: '高层级提示',
    msg: '此对话框显示在其他元素之上',
    zIndex: 10000, // 提高层级
  })
}
</script>
```

**使用说明:**
- 默认 `zIndex` 为 1000
- 在有其他弹层的情况下,可能需要提高层级
- 小程序平台某些原生组件层级很高,可能需要设置更高的 zIndex

## API

### useMessage()

创建或获取 Message 实例。

**函数签名:**

```typescript
function useMessage(selector?: string): Message
```

**参数:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| selector | 实例选择器,用于创建多个独立的 Message 实例 | `string` | `''` |

**返回值:**

返回一个 `Message` 实例对象,包含以下方法:

| 方法 | 说明 | 类型 |
|------|------|------|
| show | 显示消息框 | `(option: MessageOptions \| string) => Promise<MessageResult>` |
| alert | 显示警告框 | `(option: MessageOptions \| string) => Promise<MessageResult>` |
| confirm | 显示确认框 | `(option: MessageOptions \| string) => Promise<MessageResult>` |
| prompt | 显示输入框 | `(option: MessageOptions \| string) => Promise<MessageResult>` |
| close | 关闭当前消息框 | `() => void` |

**使用示例:**

```typescript
import { useMessage } from '@/wd'

// 创建默认实例
const message = useMessage()

// 创建命名实例
const mainMessage = useMessage('main')
const secondaryMessage = useMessage('secondary')
```

### show()

显示一个消息框。

**方法签名:**

```typescript
show(option: MessageOptions | string): Promise<MessageResult>
```

**参数:**

| 参数 | 说明 | 类型 |
|------|------|------|
| option | 消息框配置选项或标题字符串 | `MessageOptions \| string` |

**返回值:**

返回 `Promise<MessageResult>`,用户确认时 resolve,取消时 reject。

**使用示例:**

```typescript
// 字符串方式
await message.show('这是一条消息')

// 对象方式
const result = await message.show({
  title: '提示',
  msg: '这是消息内容',
  type: 'alert',
})
```

### alert()

显示警告框,只有确定按钮。

**方法签名:**

```typescript
alert(option: MessageOptions | string): Promise<MessageResult>
```

**预设配置:**

```typescript
{
  type: 'alert',
  showCancelButton: false,
}
```

**使用示例:**

```typescript
// 字符串方式
await message.alert('警告信息')

// 对象方式
await message.alert({
  title: '提示',
  msg: '操作成功',
  confirmButtonText: '知道了',
})
```

### confirm()

显示确认框,有确定和取消按钮。

**方法签名:**

```typescript
confirm(option: MessageOptions | string): Promise<MessageResult>
```

**预设配置:**

```typescript
{
  type: 'confirm',
  showCancelButton: true,
}
```

**使用示例:**

```typescript
try {
  const result = await message.confirm('确定要删除吗?')
  if (result.action === 'confirm') {
    console.log('用户确认')
  }
} catch (error) {
  console.log('用户取消')
}
```

### prompt()

显示输入框,获取用户输入。

**方法签名:**

```typescript
prompt(option: MessageOptions | string): Promise<MessageResult>
```

**预设配置:**

```typescript
{
  type: 'prompt',
  showCancelButton: true,
}
```

**使用示例:**

```typescript
try {
  const result = await message.prompt({
    title: '输入姓名',
    inputPlaceholder: '请输入',
  })
  console.log('用户输入:', result.value)
} catch (error) {
  console.log('用户取消')
}
```

### close()

关闭当前 selector 的消息框。

**方法签名:**

```typescript
close(): void
```

**使用示例:**

```typescript
message.close()
```

### MessageOptions

消息框配置选项接口。

**类型定义:**

```typescript
interface MessageOptions {
  /** 标题 */
  title?: string

  /** 消息文案 */
  msg?: string

  /** 弹框类型 */
  type?: 'alert' | 'confirm' | 'prompt'

  /** 是否展示取消按钮 */
  showCancelButton?: boolean

  /** 是否支持点击蒙层关闭 */
  closeOnClickModal?: boolean

  /** 确定按钮文案 */
  confirmButtonText?: string

  /** 取消按钮文案 */
  cancelButtonText?: string

  /** 输入框类型 */
  inputType?: 'text' | 'number' | 'tel' | 'password' | 'digit'

  /** 输入框初始值 */
  inputValue?: string | number

  /** 输入框占位符 */
  inputPlaceholder?: string

  /** 输入框正则验证 */
  inputPattern?: RegExp

  /** 输入框验证函数 */
  inputValidate?: (inputValue: string | number) => boolean

  /** 输入框验证错误提示 */
  inputError?: string

  /** 是否显示错误提示 */
  showErr?: boolean

  /** 弹窗层级 */
  zIndex?: number

  /** 懒渲染 */
  lazyRender?: boolean

  /** 确认前钩子 */
  beforeConfirm?: (options: { resolve: (isPass: boolean) => void }) => void

  /** 取消按钮属性 */
  cancelButtonProps?: any

  /** 确认按钮属性 */
  confirmButtonProps?: any

  /** 是否显示 */
  visible?: boolean

  /** 内部使用:消息框ID */
  _messageId?: string
}
```

**属性说明:**

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题 | `string` | `''` |
| msg | 消息文案 | `string` | `''` |
| type | 弹框类型 | `'alert' \| 'confirm' \| 'prompt'` | `'alert'` |
| showCancelButton | 是否显示取消按钮 | `boolean` | `false` |
| closeOnClickModal | 是否允许点击蒙层关闭 | `boolean` | `true` |
| confirmButtonText | 确定按钮文字 | `string` | `'确定'` |
| cancelButtonText | 取消按钮文字 | `string` | `'取消'` |
| inputType | 输入框类型 | `InputType` | `'text'` |
| inputValue | 输入框初始值 | `string \| number` | `''` |
| inputPlaceholder | 输入框占位符 | `string` | `''` |
| inputPattern | 输入框正则验证 | `RegExp` | - |
| inputValidate | 输入框验证函数 | `(value) => boolean` | - |
| inputError | 验证错误提示 | `string` | `'输入内容不符合要求'` |
| showErr | 是否显示错误提示 | `boolean` | `false` |
| zIndex | 弹窗层级 | `number` | `1000` |
| lazyRender | 懒渲染 | `boolean` | `true` |
| beforeConfirm | 确认前钩子 | `Function` | - |
| cancelButtonProps | 取消按钮属性 | `any` | - |
| confirmButtonProps | 确认按钮属性 | `any` | - |
| visible | 是否显示 | `boolean` | `false` |
| _messageId | 内部使用:消息框ID | `string` | - |

### MessageResult

消息框操作结果接口。

**类型定义:**

```typescript
interface MessageResult {
  /** 操作类型 */
  action: 'confirm' | 'cancel' | 'modal'

  /** 输入值(prompt 类型有效) */
  value?: string | number
}
```

**属性说明:**

| 属性 | 说明 | 类型 |
|------|------|------|
| action | 用户操作类型 | `'confirm' \| 'cancel' \| 'modal'` |
| value | 用户输入值(prompt类型) | `string \| number` |

### 工具函数

#### getMessageOption()

获取或创建指定 selector 的 Message 配置选项。

**函数签名:**

```typescript
function getMessageOption(selector?: string): Ref<MessageOptions>
```

**参数:**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| selector | 实例选择器 | `string` | `''` |

**返回值:**

返回响应式的 Message 配置对象。

#### clearMessageOption()

清理指定 selector 的 Message 配置缓存。

**函数签名:**

```typescript
function clearMessageOption(selector?: string): void
```

#### clearAllMessageOptions()

清理所有 Message 配置缓存和活跃实例。

**函数签名:**

```typescript
function clearAllMessageOptions(): void
```

## 类型定义

### 核心类型

```typescript
/**
 * 消息框类型枚举
 */
type MessageType = 'alert' | 'confirm' | 'prompt'

/**
 * 操作类型枚举
 */
type ActionType = 'confirm' | 'cancel' | 'modal'

/**
 * 输入验证函数类型
 */
type InputValidate = (inputValue: string | number) => boolean

/**
 * 输入框类型
 */
type InputType = 'text' | 'number' | 'tel' | 'password' | 'digit'
```

### 内部类型

```typescript
/**
 * Message 选项的响应式引用类型
 */
type MessageOptionRef = Ref<MessageOptions>

/**
 * 消息框实例信息(内部使用)
 */
interface MessageInstance {
  /** 唯一实例ID */
  id: string

  /** 实例选择器 */
  selector: string

  /** 响应式配置选项 */
  option: MessageOptionRef

  /** Promise resolve 函数 */
  resolve?: (result: MessageResult) => void
}
```

### 常量定义

```typescript
/**
 * useMessage 使用的缓存 key 前缀
 */
const messageDefaultOptionKey = '__MESSAGE_OPTION__'

/**
 * 默认配置选项
 */
const defaultOptions: MessageOptions = {
  title: '',
  showCancelButton: false,
  closeOnClickModal: true,
  msg: '',
  type: 'alert',
  inputType: 'text',
  inputValue: '',
  showErr: false,
  zIndex: 1000,
  lazyRender: true,
  inputError: '',
  visible: false,
}
```

### 完整导入示例

```typescript
import {
  useMessage,
  getMessageOption,
  clearMessageOption,
  clearAllMessageOptions,
} from '@/wd'

import type {
  MessageOptions,
  MessageResult,
  MessageType,
  ActionType,
  InputValidate,
} from '@/wd'

// 创建 Message 实例
const message = useMessage()

// 使用类型注解
const options: MessageOptions = {
  title: '提示',
  msg: '这是一条消息',
  type: 'alert',
}

// 获取结果
const result: MessageResult = await message.show(options)
```

## 最佳实践

### 1. 优先使用 async/await

使用 async/await 语法处理异步操作:

```typescript
// ✅ 好的做法: 使用 async/await
const handleDelete = async () => {
  try {
    await message.confirm('确定要删除吗?')
    await deleteData()
    message.alert('删除成功')
  } catch (error) {
    console.log('用户取消')
  }
}

// ❌ 不好的做法: 使用 Promise.then()
const handleDeleteBad = () => {
  message.confirm('确定要删除吗?')
    .then(() => {
      return deleteData()
    })
    .then(() => {
      message.alert('删除成功')
    })
    .catch(() => {
      console.log('用户取消')
    })
}
```

**推荐理由:**
- async/await 语法更简洁清晰
- 错误处理更直观
- 代码可读性更强

### 2. 合理处理用户取消

总是处理用户取消的情况:

```typescript
// ✅ 好的做法: 使用 try-catch 处理取消
const handleSubmit = async () => {
  try {
    await message.confirm('确定要提交吗?')
    await submitData()
    message.alert('提交成功')
  } catch (error) {
    // 用户取消,不需要做任何处理
    console.log('用户取消提交')
  }
}

// ✅ 更好的做法: 判断 action 类型
const handleDelete = async () => {
  try {
    const result = await message.confirm('确定要删除吗?')

    if (result.action === 'confirm') {
      await deleteData()
      message.alert('删除成功')
    } else {
      console.log('用户通过', result.action, '取消')
    }
  } catch (error) {
    console.log('对话框异常关闭')
  }
}

// ❌ 不好的做法: 不处理取消情况
const handleBad = async () => {
  await message.confirm('确定要删除吗?')
  // 如果用户取消,这里会抛出异常,导致后续代码无法执行
  await deleteData()
}
```

### 3. 使用 beforeConfirm 进行验证

在确认前执行异步验证:

```typescript
// ✅ 好的做法: 使用 beforeConfirm
const handleSubmit = async () => {
  try {
    await message.confirm({
      title: '提交确认',
      msg: '确定要提交订单吗?',
      beforeConfirm: async ({ resolve }) => {
        toast.loading('验证中...')

        try {
          const isValid = await validateOrder()
          toast.close()

          if (isValid) {
            resolve(true)
          } else {
            toast.error('订单验证失败')
            resolve(false)
          }
        } catch (error) {
          toast.close()
          toast.error('验证异常')
          resolve(false)
        }
      },
    })

    await submitOrder()
    message.alert('提交成功')
  } catch (error) {
    console.log('用户取消')
  }
}

// ❌ 不好的做法: 在确认后验证
const handleBadSubmit = async () => {
  await message.confirm('确定要提交吗?')

  // 先弹确认框,再验证,用户体验差
  const isValid = await validateOrder()
  if (!isValid) {
    message.alert('订单验证失败')
    return
  }

  await submitOrder()
}
```

### 4. 输入验证优先使用正则

简单验证使用正则,复杂验证使用函数:

```typescript
// ✅ 好的做法: 简单验证用正则
const showPhonePrompt = async () => {
  const result = await message.prompt({
    title: '输入手机号',
    inputType: 'number',
    inputPattern: /^1[3-9]\d{9}$/,
    inputError: '请输入正确的手机号',
  })
}

// ✅ 好的做法: 复杂验证用函数
const showPasswordPrompt = async () => {
  const result = await message.prompt({
    title: '设置密码',
    inputValidate: (value) => {
      const pwd = String(value)
      return pwd.length >= 6 && pwd.length <= 20 &&
             /[a-zA-Z]/.test(pwd) && /\d/.test(pwd)
    },
    inputError: '密码6-20位,必须包含字母和数字',
  })
}

// ❌ 不好的做法: 不验证输入
const showBad = async () => {
  const result = await message.prompt('请输入手机号')
  // 没有验证,可能得到无效输入
  console.log(result.value)
}
```

### 5. 动态内容使用模板字符串

使用模板字符串生成动态内容:

```typescript
// ✅ 好的做法: 使用模板字符串
const handleBatchDelete = async (items: any[]) => {
  const count = items.length

  await message.confirm({
    title: '批量删除',
    msg: `确定要删除选中的 ${count} 个项目吗?`,
    confirmButtonText: `删除 ${count} 项`,
  })
}

// ✅ 好的做法: 多行内容使用换行符
const showDetails = async (order: any) => {
  await message.alert({
    title: '订单详情',
    msg: `订单号: ${order.id}\n金额: ${order.amount} 元\n状态: ${order.status}`,
  })
}

// ❌ 不好的做法: 字符串拼接
const showBad = async (count: number) => {
  await message.confirm({
    msg: '确定要删除选中的 ' + count + ' 个项目吗?',
  })
}
```

### 6. 合理使用多实例

在复杂页面中使用多实例隔离:

```typescript
// ✅ 好的做法: 不同模块使用不同实例
const formMessage = useMessage('form')
const uploadMessage = useMessage('upload')

const handleFormSubmit = async () => {
  await formMessage.confirm('确定要提交表单吗?')
  await submitForm()
}

const handleFileUpload = async () => {
  await uploadMessage.confirm('确定要上传文件吗?')
  await uploadFile()
}

// ❌ 不好的做法: 共用一个实例
const message = useMessage()

const handleBothOperations = async () => {
  // 如果同时触发,可能会相互干扰
  await message.confirm('确定要提交吗?')
  await message.confirm('确定要上传吗?')
}
```

### 7. 适当使用层级控制

遇到层级问题时才调整 zIndex:

```typescript
// ✅ 好的做法: 普通情况使用默认层级
const showNormal = async () => {
  await message.alert('普通提示')
  // 默认 zIndex: 1000 足够了
}

// ✅ 好的做法: 有其他弹层时提高层级
const showOnTopOfOther = async () => {
  await message.alert({
    title: '重要提示',
    msg: '此消息需要显示在其他弹层之上',
    zIndex: 10000,
  })
}

// ❌ 不好的做法: 盲目设置很高的层级
const showBad = async () => {
  await message.alert({
    title: '提示',
    zIndex: 99999999, // 没必要设置这么高
  })
}
```

### 8. 保持消息简洁

对话框消息应该简洁明了:

```typescript
// ✅ 好的做法: 简洁明了
await message.confirm({
  title: '删除确认',
  msg: '确定要删除这条记录吗?\n此操作不可恢复',
})

// ✅ 好的做法: 重点突出
await message.alert({
  title: '支付成功',
  msg: '订单已支付,预计3天内发货',
})

// ❌ 不好的做法: 内容过长
await message.confirm({
  title: '删除确认',
  msg: '您正在执行删除操作,删除后将无法恢复,请确认您真的要删除这条记录,如果您不确定,请点击取消按钮,如果您确定要删除,请点击确定按钮继续操作...',
})
```

## 常见问题

### 1. 对话框不显示

**问题原因:**
- 未在页面中放置 `<wd-message-box />` 组件
- selector 不匹配
- zIndex 被其他元素覆盖

**解决方案:**

```vue
<!-- ✅ 在页面中添加组件 -->
<template>
  <view class="page">
    <!-- 页面内容 -->

    <!-- 必须放置组件 -->
    <wd-message-box />

    <!-- 使用命名实例时指定 selector -->
    <wd-message-box selector="main" />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

// selector 必须匹配
const mainMessage = useMessage('main')

// 如果被覆盖,提高层级
const showMessage = async () => {
  await mainMessage.alert({
    title: '提示',
    zIndex: 10000,
  })
}
</script>
```

### 2. Promise 一直 pending

**问题原因:**
- 忘记在对话框组件中处理确认/取消事件
- 组件未正确导入或注册

**解决方案:**

```vue
<!-- ✅ 确保使用正确的组件 -->
<template>
  <view class="page">
    <!-- 使用 wd-message-box,不是其他组件 -->
    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { useMessage } from '@/wd'

const message = useMessage()

// ✅ 正确使用
const handleConfirm = async () => {
  try {
    await message.confirm('确定吗?')
    console.log('用户确认')
  } catch (error) {
    console.log('用户取消')
  }
}
</script>
```

### 3. 输入验证不生效

**问题原因:**
- 验证函数返回值类型错误
- 正则表达式书写错误
- 未设置 inputError

**解决方案:**

```typescript
// ✅ 正确的验证函数
const showPrompt = async () => {
  await message.prompt({
    title: '输入手机号',
    inputPattern: /^1[3-9]\d{9}$/, // 正确的正则
    inputValidate: (value) => {
      // 必须返回 boolean
      return /^1[3-9]\d{9}$/.test(String(value))
    },
    inputError: '请输入正确的手机号', // 必须设置错误提示
  })
}

// ❌ 错误的验证函数
const showBad = async () => {
  await message.prompt({
    inputValidate: (value) => {
      // 错误: 返回 undefined
      if (value.length < 6) {
        console.log('太短')
      }
    },
  })
}
```

### 4. beforeConfirm 不执行

**问题原因:**
- beforeConfirm 中忘记调用 resolve
- 钩子函数中抛出异常

**解决方案:**

```typescript
// ✅ 正确使用 beforeConfirm
const handleSubmit = async () => {
  await message.confirm({
    title: '提交确认',
    beforeConfirm: async ({ resolve }) => {
      try {
        const isValid = await validate()

        if (isValid) {
          resolve(true)  // 必须调用 resolve
        } else {
          resolve(false) // 必须调用 resolve
        }
      } catch (error) {
        resolve(false)   // 必须调用 resolve
      }
    },
  })
}

// ❌ 错误做法: 忘记调用 resolve
const handleBad = async () => {
  await message.confirm({
    beforeConfirm: async ({ resolve }) => {
      await validate()
      // 忘记调用 resolve,对话框永远无法关闭
    },
  })
}
```

### 5. 多次调用导致重叠

**问题原因:**
- 在短时间内多次调用 show 方法
- 使用了同一个 selector

**解决方案:**

```typescript
// ✅ 使用防抖
import { ref } from 'vue'

const isShowing = ref(false)

const showMessage = async () => {
  if (isShowing.value) return

  isShowing.value = true
  try {
    await message.alert('提示')
  } finally {
    isShowing.value = false
  }
}

// ✅ 使用不同 selector
const message1 = useMessage('msg1')
const message2 = useMessage('msg2')

// ❌ 错误做法: 快速多次调用
const showBad = () => {
  message.alert('消息1')
  message.alert('消息2') // 会覆盖消息1
  message.alert('消息3') // 会覆盖消息2
}
```

### 6. 小程序平台层级问题

**问题原因:**
- 小程序原生组件层级高于普通元素
- 对话框被原生组件覆盖

**解决方案:**

```typescript
// ✅ 提高 zIndex
await message.alert({
  title: '提示',
  zIndex: 99999,
})

// ✅ 使用 cover-view(如果支持)
// 或临时隐藏原生组件
const showOnNative = async () => {
  // 隐藏 map 等原生组件
  hideNativeComponents()

  await message.alert('重要提示')

  // 恢复显示
  showNativeComponents()
}
```

### 7. 自定义按钮样式无效

**问题原因:**
- 样式被全局样式覆盖
- 使用了无效的属性

**解决方案:**

```typescript
// ✅ 使用 wd-button 支持的属性
await message.confirm({
  title: '删除确认',
  confirmButtonProps: {
    type: 'error',    // ✅ 有效属性
    round: true,      // ✅ 有效属性
    plain: false,     // ✅ 有效属性
  },
  cancelButtonProps: {
    type: 'default',
    plain: true,
  },
})

// ❌ 使用无效属性
await message.confirm({
  confirmButtonProps: {
    color: 'red',        // ❌ 无效,应该用 type
    background: '#f00',  // ❌ 无效
  },
})
```

### 8. TypeScript 类型错误

**问题原因:**
- 未正确导入类型
- 类型使用不当

**解决方案:**

```typescript
// ✅ 正确导入类型
import { useMessage } from '@/wd'
import type { MessageOptions, MessageResult } from '@/wd'

// ✅ 使用类型注解
const message = useMessage()

const options: MessageOptions = {
  title: '提示',
  msg: '这是一条消息',
  type: 'alert',
}

const result: MessageResult = await message.show(options)

// ✅ 类型安全的函数
const showDialog = async (type: 'alert' | 'confirm' | 'prompt') => {
  const options: MessageOptions = {
    title: '提示',
    type,
  }

  return await message.show(options)
}

// ❌ 类型错误
const showBad = async () => {
  const options: MessageOptions = {
    type: 'invalid', // 错误: 不是有效的类型
    duration: 2000,  // 错误: MessageOptions 没有 duration 属性
  }

  await message.show(options)
}
```
