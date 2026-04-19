---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/display/avatar
---

# Avatar 头像

## 介绍

Avatar 头像组件用于展示用户、实体或系统角色的可视化标识。它同时支持图片、文字与图标三种展示方式，并在图片加载失败时按既定降级顺序（图片 → 图标 → 文字首字符）回退，确保任何业务场景下都不会出现空白头像。组件还提供了独立的头像组（`wd-avatar-group`），用于呈现多人协作、评论列表、联系人列表等场景下的成员叠加展示。

**核心特性:**

- **三种展示模式** - 支持 `src`（图片）、`text`（文字）与 `icon`（图标）三种独立模式，优先级从高到低自动降级
- **预设尺寸** - 内置 `large` / `medium` / `normal` / `small` 四档预设值，同时允许传入纯数字自定义像素大小
- **图片加载失败降级** - 图片加载失败时自动触发 `error` 事件并切换到图标或文字占位，不会暴露破损图片
- **头像组叠加** - `wd-avatar-group` 提供可控的重叠方向（右上堆叠或左上堆叠），以及溢出计数（`+N`）
- **尺寸形状继承** - `wd-avatar-group` 会统一向子头像广播 `size` 与 `shape`，减少在每个头像上重复设置
- **自适应样式** - 自定义数字尺寸时，内部字体大小与图标大小会按比例（0.375× 与 0.5×）自动计算
- **CSS 变量主题** - 支持通过 `wd-config-provider` 或全局 CSS 变量覆盖背景色、文字色、圆角半径

参考: src/wd/components/wd-avatar/wd-avatar.vue:1-245

## 基本用法

### 图片头像

设置 `src` 属性展示一张用户头像，`src` 支持网络图片和 base64。

```vue
<template>
  <view class="demo">
    <wd-avatar src="https://example.com/user1.png" />
    <wd-avatar src="https://example.com/user2.png" alt="用户 2" />
    <wd-avatar src="https://example.com/user3.png" mode="aspectFill" />
  </view>
</template>

<style scoped>
.demo {
  display: flex;
  gap: 16rpx;
  align-items: center;
  padding: 32rpx;
}
</style>
```

**使用说明:**

- `src` 支持远程 URL、base64 字符串或本地引入路径
- `mode` 透传到原生 `image` 的 `mode`，默认为 `scaleToFill`，推荐头像场景使用 `aspectFill`
- 加载失败时会触发 `error` 事件并切换到后续展示模式

参考: src/wd/components/wd-avatar/wd-avatar.vue:4, 62-64, 234-239

### 文字头像

当用户没有头像时，展示姓名前两个字符作为占位。

```vue
<template>
  <view class="demo">
    <wd-avatar text="张三" bg-color="#1890ff" />
    <wd-avatar text="李四丰" bg-color="#52c41a" />
    <wd-avatar text="W" bg-color="#fa8c16" />
    <wd-avatar text="Alice" bg-color="#eb2f96" />
  </view>
</template>
```

**使用说明:**

- 组件只取 `text` 的前两个字符，超出部分会被自动截断
- 英文缩写推荐传入 2 位大写字母（如 `'AB'`）
- 如果同时设置了 `src` 和 `text`，优先使用图片，图片加载失败后自动回退到文字

参考: src/wd/components/wd-avatar/wd-avatar.vue:6, 222-231

### 图标头像

对于匿名用户、系统账号或角色标识，使用图标更合适。

```vue
<template>
  <view class="demo">
    <wd-avatar icon="user-fill" bg-color="#8c8c8c" />
    <wd-avatar icon="setting-fill" bg-color="#2f54eb" />
    <wd-avatar icon="robot" bg-color="#722ed1" />
    <wd-avatar icon="customer-service" bg-color="#13c2c2" />
  </view>
</template>
```

**使用说明:**

- `icon` 使用 WD UI 的图标名，需与内置图标体系保持一致
- 图标大小会根据头像尺寸自动匹配（预设尺寸走映射表，数字尺寸按 `size × 0.5` 计算）

参考: src/wd/components/wd-avatar/wd-avatar.vue:5, 117-125, 209-220

### 三种模式的优先级与降级

当 `src`、`icon`、`text` 同时存在时，组件按以下顺序渲染：

1. 如果 `src` 存在且未发生加载错误 → 显示图片
2. 否则如果 `icon` 存在 → 显示图标
3. 否则 → 显示 `text`（取前两个字符）
4. 以上都没有 → 显示默认背景色块

```vue
<template>
  <!-- 正常加载时显示头像图片 -->
  <wd-avatar
    src="https://example.com/avatar.png"
    icon="user-fill"
    text="张三"
    bg-color="#1890ff"
  />
  <!-- 图片加载失败时切到图标 -->
  <wd-avatar
    src="https://broken.example.com/not-found.png"
    icon="user-fill"
    bg-color="#8c8c8c"
  />
  <!-- 既没有图片也没有图标时显示文字 -->
  <wd-avatar text="张" bg-color="#52c41a" />
</template>
```

参考: src/wd/components/wd-avatar/wd-avatar.vue:2-9, 90-93

## 尺寸

### 预设尺寸

组件提供 4 档预设尺寸，分别对应常见的移动端密度需求。

```vue
<template>
  <view class="demo">
    <wd-avatar size="large" text="L" bg-color="#1890ff" />
    <wd-avatar size="medium" text="M" bg-color="#52c41a" />
    <wd-avatar size="normal" text="N" bg-color="#fa8c16" />
    <wd-avatar size="small" text="S" bg-color="#eb2f96" />
  </view>
</template>
```

| 预设值 | 宽高 | 字体大小 | 图标大小 |
|--------|------|---------|---------|
| `large` | 96rpx | 32rpx | 40rpx |
| `medium` | 80rpx | 28rpx | 34rpx |
| `normal`（默认） | 64rpx | 24rpx | 28rpx |
| `small` | 48rpx | 20rpx | 22rpx |

参考: src/wd/components/wd-avatar/wd-avatar.vue:99-125

### 自定义数字尺寸

传入纯数字时表示像素大小（单位 rpx），字体和图标尺寸会按比例自动计算。

```vue
<template>
  <view class="demo">
    <wd-avatar :size="120" text="120" bg-color="#1890ff" />
    <wd-avatar :size="150" icon="star-fill" bg-color="#faad14" />
    <wd-avatar :size="180" src="https://example.com/avatar.png" />
  </view>
</template>
```

**使用说明:**

- 自定义数字尺寸时，字体大小 = `Math.round(size × 0.375)`
- 图标大小 = `Math.round(size × 0.5)`
- 推荐使用偶数，避免缩放模糊

参考: src/wd/components/wd-avatar/wd-avatar.vue:161-220

## 形状

### 圆形与方形

默认使用圆形，设置 `shape="square"` 切换为圆角方形。

```vue
<template>
  <view class="demo-row">
    <wd-avatar shape="round" text="圆" bg-color="#1890ff" />
    <wd-avatar shape="square" text="方" bg-color="#52c41a" />
    <wd-avatar shape="round" icon="user-fill" bg-color="#8c8c8c" />
    <wd-avatar shape="square" icon="setting-fill" bg-color="#2f54eb" />
  </view>
</template>

<style lang="scss" scoped>
.demo-row {
  display: flex;
  gap: 16rpx;
  padding: 32rpx;
}
</style>
```

**使用说明:**

- `round` 使用 `border-radius: 50%`
- `square` 使用 `border-radius: 8rpx`，可通过 CSS 变量 `--wot-avatar-square-radius` 覆盖

参考: src/wd/components/wd-avatar/wd-avatar.vue:3, 52-53, 289-298

## 颜色定制

### 自定义背景与文字颜色

为文字与图标头像指定有辨识度的背景色，用于区分身份、部门或角色。

```vue
<template>
  <view class="demo-row">
    <wd-avatar text="A" bg-color="#ff4d4f" color="#fff" />
    <wd-avatar text="B" bg-color="#fa8c16" color="#000" />
    <wd-avatar text="C" bg-color="#faad14" color="#fff" />
    <wd-avatar text="D" bg-color="#52c41a" color="#fff" />
    <wd-avatar text="E" bg-color="#1890ff" color="#fff" />
  </view>
</template>
```

### 按用户名生成稳定颜色

在列表渲染时，为每个用户按姓名哈希生成一致的背景色，带来更好的识别性。

```vue
<template>
  <view class="user-list">
    <view v-for="user in users" :key="user.id" class="user-item">
      <wd-avatar
        :text="user.name"
        :bg-color="getAvatarColor(user.name)"
      />
      <view class="user-name">{{ user.name }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const colorPalette = [
  '#ff4d4f', '#fa8c16', '#faad14', '#52c41a',
  '#13c2c2', '#1890ff', '#2f54eb', '#722ed1', '#eb2f96',
]

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getAvatarColor(name: string): string {
  return colorPalette[hashCode(name) % colorPalette.length]
}

const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' },
]
</script>
```

参考: src/wd/components/wd-avatar/wd-avatar.vue:54-57, 173-176, 192-195

## 图片加载失败处理

当 `src` 加载失败时，组件会触发 `error` 事件并自动切换到图标或文字占位，无需业务额外处理。

```vue
<template>
  <wd-avatar
    :src="user.avatar"
    :icon="user.icon"
    :text="user.name"
    bg-color="#1890ff"
    @error="handleAvatarError"
  />
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const user = reactive({
  avatar: 'https://broken.example.com/not-found.png',
  icon: 'user-fill',
  name: '张三',
})

function handleAvatarError(event: Event) {
  console.warn('头像加载失败，已自动降级', event)
  // 业务逻辑：上报埋点 / 提醒用户重新上传
}
</script>
```

**使用说明:**

- `error` 只会在图片加载失败时触发一次，不会重复
- 组件内部维护 `hasError` 状态，不会反复尝试加载
- 若需要"重试"能力，可以在 `error` 之后动态修改 `src` 为其他候选地址

参考: src/wd/components/wd-avatar/wd-avatar.vue:4, 69-72, 90-92, 234-239

## 头像组

### 基础用法

通过 `wd-avatar-group` 包裹多个头像即可实现叠加展示，后面的头像会覆盖前面的。

```vue
<template>
  <wd-avatar-group>
    <wd-avatar src="https://example.com/u1.png" />
    <wd-avatar src="https://example.com/u2.png" />
    <wd-avatar src="https://example.com/u3.png" />
    <wd-avatar src="https://example.com/u4.png" />
  </wd-avatar-group>
</template>
```

**使用说明:**

- 默认重叠偏移为 `-16rpx`，后一个头像左边距为负值
- 不限制子头像数量，默认全部展示
- 推荐子头像尺寸统一，若不统一请显式设置每个头像的 `size`

参考: src/wd/components/wd-avatar-group/wd-avatar-group.vue:2-12, 122-147

### 最大数量与溢出计数

设置 `max-count` 控制最多展示几个头像，超出部分折叠为 `+N`。

```vue
<template>
  <wd-avatar-group :max-count="3">
    <wd-avatar text="张" bg-color="#1890ff" />
    <wd-avatar text="李" bg-color="#52c41a" />
    <wd-avatar text="王" bg-color="#fa8c16" />
    <wd-avatar text="赵" bg-color="#eb2f96" />
    <wd-avatar text="钱" bg-color="#722ed1" />
    <wd-avatar text="孙" bg-color="#13c2c2" />
  </wd-avatar-group>
</template>
```

**使用说明:**

- `max-count` 默认为 `0`，表示不限制
- 当子头像数量 > `maxCount` 时，末尾自动追加一个 `+N` 计数头像
- 计数头像会复用 `wd-avatar` 的预设尺寸样式，保证视觉一致

参考: src/wd/components/wd-avatar-group/wd-avatar-group.vue:5-10, 36-43, 80-106

### 重叠方向

通过 `cascading` 控制叠加方向：`'right-up'`（后者在上，默认）或 `'left-up'`（前者在上）。

```vue
<template>
  <view class="demo-block">
    <view class="demo-title">right-up（默认，后者压前者）</view>
    <wd-avatar-group cascading="right-up">
      <wd-avatar text="A" bg-color="#1890ff" />
      <wd-avatar text="B" bg-color="#52c41a" />
      <wd-avatar text="C" bg-color="#fa8c16" />
    </wd-avatar-group>

    <view class="demo-title">left-up（前者压后者）</view>
    <wd-avatar-group cascading="left-up">
      <wd-avatar text="A" bg-color="#1890ff" />
      <wd-avatar text="B" bg-color="#52c41a" />
      <wd-avatar text="C" bg-color="#fa8c16" />
    </wd-avatar-group>
  </view>
</template>
```

**使用说明:**

- `right-up`：列表从左到右渲染，右侧头像堆在最上层
- `left-up`：内部使用 `flex-direction: row-reverse`，左侧头像堆在最上层
- 通常"消息未读的发言者"推荐 `right-up`，"最近联系人"推荐 `left-up`

参考: src/wd/components/wd-avatar-group/wd-avatar-group.vue:2-12, 28-31, 122-147

### 统一尺寸与形状

在 `wd-avatar-group` 上设置 `size` 和 `shape`，所有子头像会自动继承。

```vue
<template>
  <wd-avatar-group size="large" shape="square">
    <wd-avatar text="A" bg-color="#1890ff" />
    <wd-avatar text="B" bg-color="#52c41a" />
    <wd-avatar text="C" bg-color="#fa8c16" />
  </wd-avatar-group>
</template>
```

**使用说明:**

- 子头像的 `size` 和 `shape` 会在未显式设置时从父组件继承
- 子头像若显式传了自己的 `size` / `shape`，以自身为准
- 推荐一个头像组内只使用统一尺寸，避免视觉错乱

参考: src/wd/components/wd-avatar/wd-avatar.vue:127-147
参考: src/wd/components/wd-avatar-group/wd-avatar-group.vue:46-49, 62-68

## 典型场景

### 评论列表

```vue
<template>
  <view class="comment-list">
    <view v-for="item in comments" :key="item.id" class="comment-item">
      <wd-avatar
        :src="item.user.avatar"
        :text="item.user.name"
        size="medium"
        bg-color="#1890ff"
      />
      <view class="comment-content">
        <view class="comment-header">
          <text class="comment-name">{{ item.user.name }}</text>
          <text class="comment-time">{{ item.time }}</text>
        </view>
        <view class="comment-text">{{ item.content }}</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.comment-item {
  display: flex;
  padding: 24rpx;
  border-bottom: 1rpx solid #eee;

  .comment-content {
    flex: 1;
    margin-left: 20rpx;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8rpx;
  }

  .comment-name {
    font-weight: 500;
  }

  .comment-time {
    color: #999;
    font-size: 24rpx;
  }

  .comment-text {
    color: #333;
  }
}
</style>
```

### 参与者溢出

```vue
<template>
  <view class="task">
    <view class="task-title">需求评审会议</view>
    <view class="task-members">
      <wd-avatar-group :max-count="5" size="small">
        <wd-avatar v-for="m in members" :key="m.id" :src="m.avatar" :text="m.name" />
      </wd-avatar-group>
      <text class="member-total">共 {{ members.length }} 位成员</text>
    </view>
  </view>
</template>
```

### 聊天气泡头像

```vue
<template>
  <view class="chat-list">
    <view
      v-for="msg in messages"
      :key="msg.id"
      class="chat-item"
      :class="msg.isSelf ? 'is-self' : 'is-other'"
    >
      <wd-avatar :src="msg.user.avatar" :text="msg.user.name" size="small" />
      <view class="chat-bubble">{{ msg.content }}</view>
    </view>
  </view>
</template>
```

## API

### WdAvatar Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 头像图片地址，支持网络图片 / base64 / 本地路径 | `string` | `''` |
| text | 文字头像内容（自动截取前 2 个字符） | `string` | `''` |
| icon | 图标名，使用 WD UI 图标体系 | `string` | `''` |
| size | 头像尺寸，支持预设值或自定义数字（单位 rpx） | `AvatarSize \| number` | `'normal'` |
| shape | 头像形状 | `AvatarShape` | `'round'` |
| bg-color | 背景颜色，任意 CSS 颜色值或渐变 | `string` | `''` |
| color | 文字颜色 | `string` | `'#fff'` |
| alt | 图片替代文本（无障碍） | `string` | `''` |
| mode | 图片裁剪模式，透传给原生 `image` 组件 | `string` | `'scaleToFill'` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: src/wd/components/wd-avatar/wd-avatar.vue:40-64, 74-87

### WdAvatar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|
| error | 图片加载失败时触发（组件内部会同步切换到降级展示） | `event: Event` |

参考: src/wd/components/wd-avatar/wd-avatar.vue:66-72, 234-239

### WdAvatar Slots

| 插槽名 | 说明 |
|--------|------|
| default | 在头像内部追加内容（位于 `image / icon / text` 之后），常用于叠加角标或装饰元素 |

参考: src/wd/components/wd-avatar/wd-avatar.vue:7

### WdAvatarGroup Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| max-count | 最大显示数量，超出部分合并为 `+N` | `number` | `0` |
| cascading | 重叠方向 | `AvatarGroupCascading` | `'right-up'` |
| shape | 统一头像形状（会被子头像继承） | `'round' \| 'square'` | `'round'` |
| size | 统一头像尺寸（会被子头像继承） | `AvatarSize \| number` | `'normal'` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: src/wd/components/wd-avatar-group/wd-avatar-group.vue:36-60

### WdAvatarGroup Slots

| 插槽名 | 说明 |
|--------|------|
| default | 头像组子项，推荐放置 `wd-avatar` |

参考: src/wd/components/wd-avatar-group/wd-avatar-group.vue:4

### 类型定义

```typescript
/** 头像尺寸类型 */
export type AvatarSize = 'large' | 'medium' | 'normal' | 'small'

/** 头像形状类型 */
export type AvatarShape = 'round' | 'square'

/** 头像组重叠方向类型 */
export type AvatarGroupCascading = 'left-up' | 'right-up'

/** 头像组件实例类型 */
export type AvatarInstance = InstanceType<typeof import('./wd-avatar.vue').default>

/** 头像组组件实例类型 */
export type AvatarGroupInstance = InstanceType<typeof import('./wd-avatar-group.vue').default>

/** 头像组件 Props 接口 */
export interface WdAvatarProps {
  src?: string
  text?: string
  icon?: string
  size?: AvatarSize | number
  shape?: AvatarShape
  bgColor?: string
  color?: string
  alt?: string
  mode?: string
  customClass?: string
  customStyle?: string
}

/** 头像组组件 Props 接口 */
export interface WdAvatarGroupProps {
  maxCount?: number
  cascading?: AvatarGroupCascading
  shape?: 'round' | 'square'
  size?: 'large' | 'medium' | 'normal' | 'small' | number
  customClass?: string
  customStyle?: string
}
```

参考: src/wd/components/wd-avatar/wd-avatar.vue:27-35, 40-64, 240-244

## 主题定制

### CSS 变量

可通过 `wd-config-provider` 的 `theme-vars` 或全局样式覆盖以下变量：

```scss
// 基础
--wot-avatar-background: #c0c4cc;          // 头像默认背景色
--wot-avatar-color: #fff;                  // 头像默认文字颜色

// 圆角
--wot-avatar-round-radius: 50%;            // 圆形
--wot-avatar-square-radius: 8rpx;          // 方形圆角

// 预设尺寸
--wot-avatar-size-large: 96rpx;
--wot-avatar-size-medium: 80rpx;
--wot-avatar-size-normal: 64rpx;
--wot-avatar-size-small: 48rpx;

// 头像组
--wot-avatar-group-offset: -16rpx;         // 叠加偏移
--wot-avatar-group-overflow-bg: #c0c4cc;   // 溢出计数背景色
--wot-avatar-group-overflow-color: #fff;   // 溢出计数文字色
```

### 全局配置示例

```vue
<template>
  <wd-config-provider :theme-vars="themeVars">
    <view class="page">
      <wd-avatar text="张" />
      <wd-avatar-group :max-count="3">
        <wd-avatar v-for="u in users" :key="u.id" :src="u.avatar" />
      </wd-avatar-group>
    </view>
  </wd-config-provider>
</template>

<script lang="ts" setup>
const themeVars = {
  avatarBackground: '#4b5cc4',
  avatarColor: '#fff',
  avatarSquareRadius: '12rpx',
  avatarGroupOffset: '-24rpx',
}
</script>
```

参考: src/wd/components/wd-avatar/wd-avatar.vue:247-321
参考: src/wd/components/wd-avatar-group/wd-avatar-group.vue:114-156

## 最佳实践

### 1. 图片 + 文字 + 图标三重降级

最稳妥的使用方式是三种属性都写上，组件会按优先级自动降级：

```vue
<wd-avatar
  :src="user.avatar"
  :icon="user.isBot ? 'robot' : 'user-fill'"
  :text="user.name"
  :bg-color="user.isBot ? '#722ed1' : '#1890ff'"
/>
```

### 2. 在列表中统一设置尺寸

通过 `wd-avatar-group` 广播尺寸，避免在每一行重复写 `size`：

```vue
<!-- ✅ 推荐 -->
<wd-avatar-group size="small">
  <wd-avatar v-for="u in users" :key="u.id" :src="u.avatar" />
</wd-avatar-group>

<!-- ❌ 不推荐 -->
<view v-for="u in users" :key="u.id">
  <wd-avatar size="small" :src="u.avatar" />
</view>
```

### 3. 文字头像的颜色要稳定

避免每次渲染给用户分配随机颜色，应根据用户名/ID 做哈希：

```typescript
function avatarColor(seed: string) {
  return colorPalette[hashCode(seed) % colorPalette.length]
}
```

### 4. 网络图片加错时不要隐藏头像

不要监听 `error` 后把头像藏掉，而是应该让组件走降级：

```vue
<!-- ✅ 推荐：组件自动降级 -->
<wd-avatar :src="url" icon="user-fill" text="张" />

<!-- ❌ 不推荐：手动隐藏造成跳变 -->
<wd-avatar v-if="!hasError" :src="url" @error="hasError = true" />
```

### 5. 头像组的最大数量取 3-5 之间

根据视觉测试，头像组最多展示 3-5 个最舒适，超过 5 个时 `+N` 的视觉权重更高：

```vue
<!-- ✅ 推荐 -->
<wd-avatar-group :max-count="4" />

<!-- ❌ 不推荐：视觉过挤 -->
<wd-avatar-group :max-count="10" />
```

## 常见问题

### 1. 文字头像显示不全或截断错位

**问题原因:**

- `text` 传入的字符过多（组件只取前 2 个）
- 自定义尺寸过小，字体大小不够

**解决方案:**

```vue
<!-- 明确只传两位 -->
<wd-avatar :text="name.slice(0, 2)" />

<!-- 自定义尺寸时搭配自定义文字样式 -->
<wd-avatar
  :size="40"
  text="MN"
  custom-style="font-size: 18rpx;"
/>
```

### 2. `wd-avatar-group` 溢出 `+N` 不出现

**问题原因:**

- `max-count` 值为 `0`（默认，表示不限制）
- 子头像数量没有超过 `max-count`
- 子头像不是 `wd-avatar` 导致 `useChildren` 没采集到

**解决方案:**

```vue
<!-- 确保 max-count > 0 且子头像 > max-count -->
<wd-avatar-group :max-count="3">
  <wd-avatar v-for="u in users" :key="u.id" :src="u.avatar" />
</wd-avatar-group>

<!-- 避免在子头像外包其他元素 -->
<!-- ❌ 不推荐 -->
<wd-avatar-group :max-count="3">
  <view v-for="u in users" :key="u.id">
    <wd-avatar :src="u.avatar" />
  </view>
</wd-avatar-group>
```

参考: src/wd/components/wd-avatar-group/wd-avatar-group.vue:80-106

### 3. 数字尺寸下字体/图标不协调

**问题原因:**

- 自定义数字尺寸走的是 `size × 0.375`（字体）和 `size × 0.5`（图标）的固定比例
- 若 UI 设计稿与这个比例不一致，会有视觉偏差

**解决方案:**

```vue
<!-- 通过自定义样式覆盖字体 -->
<wd-avatar
  :size="120"
  text="AB"
  custom-style="font-size: 60rpx;"
/>

<!-- 或使用插槽完全自定义内容 -->
<wd-avatar :size="120">
  <text style="font-size: 60rpx; color: #fff;">AB</text>
</wd-avatar>
```

### 4. 头像组中某个头像尺寸不一致

**问题原因:**

- 子头像自己设置了 `size`，覆盖了父组件的广播
- 子头像没有在 `wd-avatar-group` 内，父子关系建立失败

**解决方案:**

```vue
<!-- 保持子头像不主动设置 size，让父组件统一 -->
<wd-avatar-group size="medium">
  <wd-avatar text="A" />   <!-- ✅ 继承 medium -->
  <wd-avatar text="B" />   <!-- ✅ 继承 medium -->
</wd-avatar-group>

<!-- 若必须覆盖，显式设置 -->
<wd-avatar-group size="medium">
  <wd-avatar text="A" size="large" />  <!-- 特殊强调 -->
  <wd-avatar text="B" />
</wd-avatar-group>
```

参考: src/wd/components/wd-avatar/wd-avatar.vue:127-147

### 5. 图片一直加载不出来，但没有触发 `error`

**问题原因:**

- URL 返回 200 但内容不是有效图片（如 HTML 错误页）
- 跨域下原生 `image` 对部分错误类型不会触发 `error`
- 图片地址是空字符串或 `undefined` 时不会请求

**解决方案:**

```vue
<template>
  <wd-avatar
    :src="getValidUrl(user.avatar)"
    icon="user-fill"
    :text="user.name"
  />
</template>

<script lang="ts" setup>
function getValidUrl(url?: string) {
  if (!url || !/^https?:\/\//.test(url)) return ''
  return url
}
</script>
```
