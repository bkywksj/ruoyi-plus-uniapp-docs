# Switch 开关

## 介绍

Switch 开关是一个用于在两种状态之间切换的交互式组件。通过点击或滑动操作,用户可以快速开启或关闭某个功能选项。开关组件采用直观的视觉设计,提供了清晰的状态反馈,广泛应用于设置页面、功能开关、权限控制等场景。

Switch 组件提供了简洁的 API 和丰富的自定义选项。不仅支持基础的布尔值切换,还支持自定义激活/非激活值,满足各种业务需求。组件内部通过平滑的过渡动画和精确的状态管理,实现了流畅的切换体验。

**核心特性:**

- **灵活值类型** - 支持 boolean、string、number 三种值类型,activeValue 和 inactiveValue 可自定义为任意值
- **自定义颜色** - 支持自定义激活和非激活状态的背景颜色,满足不同的设计风格和主题需求
- **自定义尺寸** - 通过 size 属性调整开关大小,适配不同的界面需求和使用场景
- **禁用状态** - 支持禁用功能,禁用状态下开关不可点击,显示半透明效果提示用户
- **切换前校验** - 提供 beforeChange 钩子,支持在切换前进行验证或异步处理,防止无效切换
- **平滑动画** - 内置平滑的过渡动画效果,切换状态时圆形按钮平滑滑动,提供良好的视觉反馈
- **初始值验证** - 组件挂载时自动验证初始值有效性,无效值会自动设置为非激活值
- **轻量简洁** - 组件实现简洁,代码量小,性能优秀,适合频繁使用的场景

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:1-211

## 基本用法

### 基础开关

最简单的开关用法,绑定布尔值。

```vue
<template>
  <view class="demo">
    <view class="demo-title">基础开关</view>

    <view class="demo-item">
      <view class="item-label">开关状态</view>
      <wd-switch v-model="value" @change="handleChange" />
    </view>

    <view class="demo-result">
      当前状态: {{ value ? '开启' : '关闭' }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(true)

const handleChange = ({ value }: { value: boolean }) => {
  console.log('状态改变:', value)
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
  }

  &-result {
    margin-top: 24rpx;
    padding: 24rpx;
    background: #F7F8FA;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #666;
  }
}

.item-label {
  font-size: 28rpx;
  color: #333;
}
</style>
```

**使用说明:**
- 使用 `v-model` 绑定当前值
- 默认激活值为 `true`,非激活值为 `false`
- 点击开关会在两个值之间切换
- change 事件在状态改变时触发

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:58

### 禁用状态

通过 disabled 属性禁用开关。

```vue
<template>
  <view class="demo">
    <view class="demo-title">禁用状态</view>

    <view class="demo-item">
      <view class="item-label">正常开关</view>
      <wd-switch v-model="value1" />
    </view>

    <view class="demo-item">
      <view class="item-label">禁用开启</view>
      <wd-switch v-model="value2" disabled />
    </view>

    <view class="demo-item">
      <view class="item-label">禁用关闭</view>
      <wd-switch v-model="value3" disabled />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(true)
const value2 = ref(true)
const value3 = ref(false)
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #EBEDF0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.item-label {
  font-size: 28rpx;
  color: #333;
}
</style>
```

**使用说明:**
- 设置 `disabled` 属性后,开关不可点击
- 禁用状态下,开关显示半透明效果(opacity: 0.5)
- 禁用状态不会触发 change 事件
- 常用于权限不足或条件不满足的场景

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:59-60, 111, 206-208

### 自定义颜色

通过 active-color 和 inactive-color 属性自定义颜色。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义颜色</view>

    <view class="demo-item">
      <view class="item-label">默认颜色</view>
      <wd-switch v-model="value1" />
    </view>

    <view class="demo-item">
      <view class="item-label">红色主题</view>
      <wd-switch v-model="value2" active-color="#FF4757" />
    </view>

    <view class="demo-item">
      <view class="item-label">绿色主题</view>
      <wd-switch v-model="value3" active-color="#2ECC71" />
    </view>

    <view class="demo-item">
      <view class="item-label">自定义两种颜色</view>
      <wd-switch
        v-model="value4"
        active-color="#1890FF"
        inactive-color="#FFE0E0"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(true)
const value2 = ref(true)
const value3 = ref(true)
const value4 = ref(false)
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #EBEDF0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.item-label {
  font-size: 28rpx;
  color: #333;
}
</style>
```

**使用说明:**
- `active-color` 设置激活状态的背景颜色
- `inactive-color` 设置非激活状态的背景颜色
- 颜色支持十六进制、RGB 等 CSS 颜色格式
- 自定义颜色会同时应用到背景和边框

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:65-68

### 自定义尺寸

通过 size 属性调整开关大小。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义尺寸</view>

    <view class="demo-item">
      <view class="item-label">小尺寸 (size="40")</view>
      <wd-switch v-model="value1" size="40" />
    </view>

    <view class="demo-item">
      <view class="item-label">默认尺寸 (size="48")</view>
      <wd-switch v-model="value2" />
    </view>

    <view class="demo-item">
      <view class="item-label">大尺寸 (size="60")</view>
      <wd-switch v-model="value3" size="60" />
    </view>

    <view class="demo-item">
      <view class="item-label">超大尺寸 (size="80")</view>
      <wd-switch v-model="value4" size="80" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(true)
const value2 = ref(true)
const value3 = ref(true)
const value4 = ref(true)
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #EBEDF0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.item-label {
  font-size: 28rpx;
  color: #333;
}
</style>
```

**使用说明:**
- `size` 属性控制开关的高度,单位为 rpx
- 默认尺寸为 48rpx
- 宽度会根据高度自动计算,保持比例
- 支持数字或字符串格式

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:69-70

### 自定义值

通过 active-value 和 inactive-value 自定义激活和非激活的值。

```vue
<template>
  <view class="demo">
    <view class="demo-title">自定义值</view>

    <view class="demo-item">
      <view class="item-label">数字值 (1/0)</view>
      <wd-switch v-model="value1" :active-value="1" :inactive-value="0" />
    </view>

    <view class="demo-item">
      <view class="item-label">字符串值 (on/off)</view>
      <wd-switch v-model="value2" active-value="on" inactive-value="off" />
    </view>

    <view class="demo-item">
      <view class="item-label">字符串值 (yes/no)</view>
      <wd-switch v-model="value3" active-value="yes" inactive-value="no" />
    </view>

    <view class="demo-result">
      <view>数字值: {{ value1 }}</view>
      <view>字符串值1: {{ value2 }}</view>
      <view>字符串值2: {{ value3 }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(1)
const value2 = ref('on')
const value3 = ref('no')
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #EBEDF0;

    &:last-child {
      border-bottom: none;
    }
  }

  &-result {
    margin-top: 24rpx;
    padding: 24rpx;
    background: #F7F8FA;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
  }
}

.item-label {
  font-size: 28rpx;
  color: #333;
}
</style>
```

**使用说明:**
- `active-value` 设置开关打开时的值,默认为 `true`
- `inactive-value` 设置开关关闭时的值,默认为 `false`
- 支持 boolean、string、number 三种类型
- 适配后端接口要求特定值的场景(如 1/0、'Y'/'N')

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:61-64, 90-91, 113

## 高级用法

### 切换前校验

通过 beforeChange 钩子在切换前进行验证或异步处理。

```vue
<template>
  <view class="demo">
    <view class="demo-title">切换前校验</view>

    <view class="demo-item">
      <view class="item-label">需要确认</view>
      <wd-switch v-model="value1" :before-change="handleBeforeChange1" />
    </view>

    <view class="demo-item">
      <view class="item-label">异步校验</view>
      <wd-switch v-model="value2" :before-change="handleBeforeChange2" />
    </view>

    <view class="demo-tips">
      点击开关会弹出确认对话框或进行异步验证
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value1 = ref(false)
const value2 = ref(false)

// 需要用户确认
const handleBeforeChange1 = ({ value, resolve }: any) => {
  uni.showModal({
    title: '确认操作',
    content: `确定要${value ? '开启' : '关闭'}此功能吗?`,
    success: (res) => {
      if (res.confirm) {
        resolve(true) // 用户确认,允许切换
      } else {
        resolve(false) // 用户取消,阻止切换
      }
    },
  })
}

// 模拟异步校验
const handleBeforeChange2 = async ({ value, resolve }: any) => {
  uni.showLoading({ title: '验证中...' })

  try {
    // 模拟网络请求
    await new Promise((r) => setTimeout(r, 1500))

    // 模拟验证结果(50%概率通过)
    const isValid = Math.random() > 0.5

    if (isValid) {
      uni.showToast({ title: '验证通过', icon: 'success' })
      resolve(true)
    } else {
      uni.showToast({ title: '验证失败', icon: 'none' })
      resolve(false)
    }
  } finally {
    uni.hideLoading()
  }
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #EBEDF0;

    &:last-child {
      border-bottom: none;
    }
  }

  &-tips {
    margin-top: 24rpx;
    padding: 16rpx 24rpx;
    font-size: 24rpx;
    color: #FF6B6B;
    background-color: #FFF0F0;
    border-radius: 8rpx;
  }
}

.item-label {
  font-size: 28rpx;
  color: #333;
}
</style>
```

**技术实现:**
- `before-change` 接收包含 value 和 resolve 的参数对象
- value 是即将切换到的新值
- resolve 是回调函数,传入 true 允许切换,false 阻止切换
- 可以在 beforeChange 中执行同步或异步操作
- 未调用 resolve 会阻止切换

**使用说明:**
- 适用于需要用户确认的场景,如关闭重要功能
- 适用于需要后端验证的场景,如检查权限
- 适用于需要前置条件的场景,如检查依赖项
- resolve 必须调用,否则开关状态不会改变

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:71-72, 116-124

### 权限控制

结合权限系统使用开关组件。

```vue
<template>
  <view class="demo">
    <view class="demo-title">权限控制</view>

    <view class="demo-item">
      <view class="item-info">
        <view class="item-label">推送通知</view>
        <view class="item-desc">接收系统消息推送</view>
      </view>
      <wd-switch v-model="permissions.notification" @change="handlePermissionChange" />
    </view>

    <view class="demo-item">
      <view class="item-info">
        <view class="item-label">位置信息</view>
        <view class="item-desc">允许访问位置信息</view>
      </view>
      <wd-switch
        v-model="permissions.location"
        :before-change="handleLocationChange"
        @change="handlePermissionChange"
      />
    </view>

    <view class="demo-item">
      <view class="item-info">
        <view class="item-label">摄像头权限</view>
        <view class="item-desc">允许使用摄像头</view>
      </view>
      <wd-switch
        v-model="permissions.camera"
        :disabled="!permissions.location"
        @change="handlePermissionChange"
      />
    </view>

    <view class="demo-hint">
      摄像头权限依赖位置信息权限
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const permissions = reactive({
  notification: true,
  location: false,
  camera: false,
})

const handleLocationChange = ({ value, resolve }: any) => {
  if (!value && permissions.camera) {
    uni.showModal({
      title: '提示',
      content: '关闭位置信息会同时关闭摄像头权限',
      success: (res) => {
        if (res.confirm) {
          permissions.camera = false
          resolve(true)
        } else {
          resolve(false)
        }
      },
    })
  } else {
    resolve(true)
  }
}

const handlePermissionChange = ({ value }: any) => {
  console.log('权限设置改变:', permissions)
  // 这里可以调用 API 保存权限设置
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #EBEDF0;

    &:last-child {
      border-bottom: none;
    }
  }

  &-hint {
    margin-top: 24rpx;
    padding: 16rpx 24rpx;
    font-size: 24rpx;
    color: #1890FF;
    background-color: #F0F9FF;
    border-radius: 8rpx;
  }
}

.item-info {
  flex: 1;
}

.item-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #999;
}
</style>
```

**技术实现:**
- 使用 reactive 管理多个权限状态
- 通过 disabled 实现权限依赖关系
- beforeChange 处理关闭权限时的级联关系
- change 事件统一处理权限变更

**使用说明:**
- 适用于应用设置页面的权限管理
- 可以实现权限之间的依赖关系
- 建议在 change 事件中调用 API 保存设置

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:110-128

### 批量设置

使用开关组实现批量设置功能。

```vue
<template>
  <view class="demo">
    <view class="demo-title">通知设置</view>

    <view class="demo-section">
      <view class="section-header">
        <view class="section-title">全部通知</view>
        <wd-switch v-model="allEnabled" @change="handleAllChange" />
      </view>

      <view class="section-divider" />

      <view class="demo-item">
        <view class="item-label">系统消息</view>
        <wd-switch v-model="settings.system" :disabled="!allEnabled" @change="handleItemChange" />
      </view>

      <view class="demo-item">
        <view class="item-label">评论通知</view>
        <wd-switch v-model="settings.comment" :disabled="!allEnabled" @change="handleItemChange" />
      </view>

      <view class="demo-item">
        <view class="item-label">点赞通知</view>
        <wd-switch v-model="settings.like" :disabled="!allEnabled" @change="handleItemChange" />
      </view>

      <view class="demo-item">
        <view class="item-label">关注通知</view>
        <wd-switch v-model="settings.follow" :disabled="!allEnabled" @change="handleItemChange" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'

const allEnabled = ref(true)

const settings = reactive({
  system: true,
  comment: true,
  like: false,
  follow: true,
})

// 全部通知开关改变
const handleAllChange = ({ value }: any) => {
  if (!value) {
    // 关闭全部通知
    settings.system = false
    settings.comment = false
    settings.like = false
    settings.follow = false
  } else {
    // 开启全部通知
    settings.system = true
    settings.comment = true
    settings.like = true
    settings.follow = true
  }
}

// 单项通知改变
const handleItemChange = () => {
  // 检查是否全部关闭
  const allOff = !settings.system && !settings.comment && !settings.like && !settings.follow
  if (allOff) {
    allEnabled.value = false
  }
}

// 监听子项变化,更新全部开关状态
watch(settings, () => {
  const allOn = settings.system && settings.comment && settings.like && settings.follow
  if (allOn) {
    allEnabled.value = true
  }
})
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

  &-section {
    background: #FFF;
    border-radius: 8rpx;
    overflow: hidden;
  }

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    border-bottom: 1rpx solid #EBEDF0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #F7F8FA;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.section-divider {
  height: 16rpx;
  background: #F7F8FA;
}

.item-label {
  font-size: 28rpx;
  color: #333;
}
</style>
```

**技术实现:**
- 使用一个主开关控制所有子开关
- 主开关关闭时,所有子开关禁用
- 子开关全部关闭时,主开关自动关闭
- 子开关全部开启时,主开关自动开启

**使用说明:**
- 适用于通知设置、功能开关等批量控制场景
- 建议使用 watch 监听状态变化
- 注意处理主从开关的联动逻辑

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:110-127

### 加载状态

在异步操作时显示加载状态。

```vue
<template>
  <view class="demo">
    <view class="demo-title">加载状态</view>

    <view class="demo-item">
      <view class="item-label">同步到云端</view>
      <view class="item-right">
        <wd-loading v-if="isLoading" size="36rpx" />
        <wd-switch
          v-else
          v-model="syncEnabled"
          :before-change="handleSyncChange"
        />
      </view>
    </view>

    <view class="demo-tips">
      切换时会显示加载动画,模拟同步过程
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const syncEnabled = ref(false)
const isLoading = ref(false)

const handleSyncChange = async ({ value, resolve }: any) => {
  isLoading.value = true

  try {
    // 模拟云端同步
    await new Promise((r) => setTimeout(r, 2000))

    // 模拟同步结果
    const success = Math.random() > 0.3

    if (success) {
      uni.showToast({ title: '同步成功', icon: 'success' })
      resolve(true)
    } else {
      uni.showToast({ title: '同步失败', icon: 'none' })
      resolve(false)
    }
  } finally {
    isLoading.value = false
  }
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

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
  }

  &-tips {
    margin-top: 24rpx;
    padding: 16rpx 24rpx;
    font-size: 24rpx;
    color: #666;
    background-color: #F7F8FA;
    border-radius: 8rpx;
  }
}

.item-label {
  font-size: 28rpx;
  color: #333;
}

.item-right {
  display: flex;
  align-items: center;
}
</style>
```

**技术实现:**
- 使用 loading 状态控制加载动画显示
- beforeChange 中执行异步操作
- 异步完成后根据结果调用 resolve
- 显示加载动画时隐藏开关

**使用说明:**
- 适用于需要异步处理的场景
- 建议使用 wd-loading 组件显示加载状态
- 注意处理异步失败的情况

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:116-124

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 绑定值 | `boolean \| string \| number` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| active-value | 激活时的值 | `boolean \| string \| number` | `true` |
| inactive-value | 非激活时的值 | `boolean \| string \| number` | `false` |
| active-color | 激活时的背景颜色 | `string` | - |
| inactive-color | 非激活时的背景颜色 | `string` | - |
| size | 开关大小,单位 rpx | `string \| number` | - |
| before-change | 切换前的回调函数 | `SwitchBeforeChange` | - |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:51-73, 86-92

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值更新时触发 | `value: boolean \| string \| number` |
| change | 开关状态改变时触发 | `{ value: boolean \| string \| number }` |

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:78-83

### 类型定义

```typescript
/**
 * 切换前回调函数选项接口
 */
interface SwitchBeforeChangeOption {
  /** 新的值 */
  value: number | string | boolean
  /** 确认回调函数 */
  resolve: (pass: boolean) => void
}

/**
 * 切换前回调函数类型
 */
type SwitchBeforeChange = (option: SwitchBeforeChangeOption) => void
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:36-46

## 最佳实践

### 1. 合理使用 beforeChange

```vue
<script setup>
// ✅ 推荐: 同步校验
const handleBeforeChange = ({ value, resolve }) => {
  if (someCondition) {
    resolve(true)
  } else {
    uni.showToast({ title: '条件不满足', icon: 'none' })
    resolve(false)
  }
}

// ✅ 推荐: 异步校验
const handleBeforeChange = async ({ value, resolve }) => {
  try {
    const result = await checkPermission(value)
    resolve(result)
  } catch (error) {
    resolve(false)
  }
}

// ❌ 错误: 忘记调用 resolve
const handleBeforeChange = ({ value, resolve }) => {
  if (someCondition) {
    // ❌ 忘记调用 resolve
  }
}
</script>
```

### 2. 自定义值的类型一致性

```vue
<script setup>
// ✅ 推荐: 类型一致
const value = ref(1)  // number
</script>

<template>
  <wd-switch v-model="value" :active-value="1" :inactive-value="0" />
</template>

<script setup>
// ❌ 错误: 类型不一致
const value = ref('1')  // string
</script>

<template>
  <wd-switch v-model="value" :active-value="1" :inactive-value="0" />
  <!-- ❌ value 是字符串,但 active-value 是数字 -->
</template>
```

### 3. 禁用状态的使用

```vue
<!-- ✅ 推荐: 根据条件禁用 -->
<wd-switch
  v-model="cameraPermission"
  :disabled="!locationPermission"
/>

<!-- ✅ 推荐: 权限不足时禁用 -->
<wd-switch
  v-model="feature"
  :disabled="!hasPermission"
/>

<!-- ❌ 不推荐: 永久禁用不如直接不显示 -->
<wd-switch v-model="value" disabled />
```

### 4. 颜色自定义

```vue
<!-- ✅ 推荐: 同时自定义两种颜色 -->
<wd-switch
  v-model="value"
  active-color="#1890FF"
  inactive-color="#D9D9D9"
/>

<!-- ✅ 推荐: 只自定义激活颜色 -->
<wd-switch v-model="value" active-color="#52C41A" />

<!-- ❌ 不推荐: 颜色对比度不够 -->
<wd-switch
  v-model="value"
  active-color="#FFE0E0"
  inactive-color="#FFF0F0"
/>
```

### 5. 尺寸设置

```vue
<!-- ✅ 推荐: 根据场景选择尺寸 -->
<wd-switch v-model="value" size="40" />  <!-- 紧凑布局 -->
<wd-switch v-model="value" />  <!-- 默认场景 -->
<wd-switch v-model="value" size="60" />  <!-- 老年人模式 -->

<!-- ❌ 不推荐: 尺寸过大或过小 -->
<wd-switch v-model="value" size="20" />  <!-- 太小,难以点击 -->
<wd-switch v-model="value" size="100" />  <!-- 太大,占用空间 -->
```

## 常见问题

### 1. 开关状态不更新

**问题原因:**
- v-model 绑定的值类型与 active-value/inactive-value 不匹配
- 初始值不是 active-value 或 inactive-value 之一

**解决方案:**
```vue
<!-- ❌ 错误: 类型不匹配 -->
<script setup>
const value = ref('1')  // 字符串
</script>
<template>
  <wd-switch v-model="value" :active-value="1" :inactive-value="0" />
</template>

<!-- ✅ 正确: 类型匹配 -->
<script setup>
const value = ref(1)  // 数字
</script>
<template>
  <wd-switch v-model="value" :active-value="1" :inactive-value="0" />
</template>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:134-139

### 2. beforeChange 不生效

**问题原因:**
- 忘记调用 resolve 函数
- beforeChange 不是函数类型

**解决方案:**
```vue
<script setup>
// ❌ 错误: 忘记调用 resolve
const handleBeforeChange = ({ value, resolve }) => {
  if (value) {
    // ❌ 忘记调用 resolve
  }
}

// ✅ 正确: 调用 resolve
const handleBeforeChange = ({ value, resolve }) => {
  if (value) {
    resolve(true)  // ✅ 必须调用
  } else {
    resolve(false)
  }
}
</script>
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:116-124

### 3. 自定义颜色不生效

**问题原因:**
- 颜色值格式错误
- CSS 变量覆盖了自定义颜色

**解决方案:**
```vue
<!-- ❌ 错误: 颜色格式错误 -->
<wd-switch v-model="value" active-color="red blue" />

<!-- ✅ 正确: 使用有效的颜色值 -->
<wd-switch v-model="value" active-color="#FF4757" />
<wd-switch v-model="value" active-color="rgb(255, 71, 87)" />
```

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:5

## 注意事项

1. **值类型要求** - modelValue 类型必须与 activeValue 和 inactiveValue 匹配,不要混用不同类型
2. **初始值验证** - 组件会在挂载时验证初始值,无效值会自动设置为 inactiveValue
3. **beforeChange 必须调用 resolve** - 如果设置了 beforeChange,必须调用 resolve,否则状态不会改变
4. **禁用状态** - 禁用状态下开关不可点击,不会触发任何事件
5. **颜色格式** - activeColor 和 inactiveColor 支持所有 CSS 颜色格式
6. **尺寸单位** - size 属性的单位为 rpx,会自动添加
7. **动画效果** - 组件内置 0.3s 的过渡动画,不可自定义
8. **事件触发** - change 事件在 beforeChange 验证通过后触发
9. **异步处理** - beforeChange 支持异步操作,建议显示加载状态
10. **性能优化** - 频繁切换时注意节流,避免过多的状态更新
11. **无障碍访问** - 建议为开关添加描述性标签,提升可访问性
12. **平台兼容** - 组件在 H5、小程序、App 等平台表现一致

参考: ../ruoyi-plus-uniapp/plus-uniapp/src/wd/components/wd-switch/wd-switch.vue:1-211
