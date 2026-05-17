# 自定义组件开发

## 介绍

本文档介绍如何在 RuoYi-Plus-UniApp 项目中开发自定义业务组件。业务组件是放置在 `src/components/` 目录下的 Vue 组件，用于封装特定的业务逻辑和 UI 展示，可以复用 WD 组件库提供的基础组件来快速构建。

**核心特点:**

- **业务导向** - 组件服务于具体业务场景，如授权弹窗、Tab 页面等
- **复用 WD 组件** - 使用 `wd-button`、`wd-popup`、`wd-cell` 等基础组件构建
- **UnoCSS 样式** - 使用原子化 CSS 类快速编写样式
- **Composables 集成** - 集成 `useToast`、`useMessage` 等组合式函数
- **Store 交互** - 与 Pinia Store 进行状态管理和数据交互

## 组件目录结构

```text
src/
├── components/              # 业务组件目录
│   ├── auth/               # 认证相关组件
│   │   └── AuthModal.vue   # 授权弹窗组件
│   ├── tabbar/             # Tab 页面组件
│   │   ├── Home.vue        # 首页组件
│   │   ├── Menu.vue        # 菜单组件
│   │   └── My.vue          # 我的页面组件
│   └── common/             # 通用业务组件
│       └── ...
└── wd/                      # WD UI 组件库（基础组件）
    └── components/
        └── ...
```

## 基础组件模板

### 最简组件结构

```vue
<template>
  <view class="my-component">
    <wd-text :text="title" />
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// Props 定义
const props = defineProps<{
  title?: string
}>()

// 响应式数据
const isLoading = ref(false)
</script>

<style lang="scss" scoped>
.my-component {
  padding: 24rpx;
}
</style>
```

### 带组件名的结构

如果需要指定组件名称，可以在 `<script>` 标签上添加 `name` 属性：

```vue
<template>
  <view class="user-card">
    <!-- 组件内容 -->
  </view>
</template>

<script setup lang="ts" name="UserCard">
// 组件逻辑
</script>

<style lang="scss" scoped></style>
```

## 实际组件示例

### 授权弹窗组件

以下是项目中 `AuthModal.vue` 组件的实现方式：

```vue
<template>
  <wd-popup
    v-model="userStore.authModalVisible"
    custom-class="rounded-t-4"
    position="bottom"
    closable
  >
    <view class="p-4">
      <!-- 标题 -->
      <wd-text text="授权" size="38" color="#751937" />

      <!-- 表单区域 -->
      <wd-form ref="formRef" :model="form">
        <!-- 头像选择 -->
        <view class="mt-8">
          <wd-cell title="头像" custom-title-class="text-#751937 text-4">
            <wd-button
              custom-class="w-15! h-15! bg-#f9f9f9! -mt-5"
              type="icon"
              :icon="avatarPreviewUrl || 'camera'"
              :icon-size="avatarPreviewUrl ? 120 : 40"
              icon-color="#999999"
              open-type="chooseAvatar"
              @chooseavatar="chooseavatar"
              @click="manualChooseAvatar"
            />
          </wd-cell>
          <!-- 昵称输入 -->
          <wd-input
            v-model="form.nickName"
            label="昵称"
            custom-label-class="text-#751937 text-4!"
            input-align="right"
            align-right
            type="nickname"
          />
        </view>
      </wd-form>

      <!-- 操作按钮 -->
      <view class="mt-8 flex items-center justify-center gap-8 px-4 pb-8">
        <wd-button
          custom-class="bg-#f9f9f9! border-0! text-#888888!"
          type="info"
          plain
          @click="reject"
        >
          残忍拒绝
        </wd-button>
        <wd-button type="success" @click="agree">立即授权</wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<script setup lang="ts" name="AuthModal">
import type { UserProfileUpdateBo } from '@/api/system/auth/authTypes'
import { ref, watch } from 'vue'
import { updateUserProfile } from '@/api/system/auth/authApi'
import { useUpload, useToast } from '@/wd'
import PLATFORM from '@/utils/platform'

// 组合式 API
const toast = useToast()
const userStore = useUserStore()
const upload = useUpload()

// 响应式数据
const formRef = ref<UserProfileUpdateBo>()
const form = ref({
  avatar: '',
  nickName: '',
})
const avatarPreviewUrl = ref('')

// 方法定义
const chooseavatar = (detail) => {
  // #ifdef MP-WEIXIN
  toast.loading('正在上传头像...')
  upload.fastUpload(detail.avatarUrl, {
    onSuccess(res, file) {
      toast.close()
      avatarPreviewUrl.value = res.url
      form.value.avatar = res.originalUrl!
    },
    onError(err, file) {
      toast.close()
      toast.error(`头像上传失败:${err.errMsg}，请重试`)
    },
  })
  // #endif
}

const reject = () => {
  toast.warning('你拒绝了授权(>_<)')
  userStore.authModalVisible = false
}

const agree = async () => {
  // 业务逻辑...
}
</script>

<style scoped lang="scss"></style>
```

**组件特点说明:**

1. **使用 WD 组件**: `wd-popup`、`wd-form`、`wd-cell`、`wd-button`、`wd-input`
2. **UnoCSS 类**: `p-4`、`mt-8`、`flex items-center justify-center`
3. **Store 集成**: 直接访问 `userStore.authModalVisible`
4. **Composables**: `useToast()`、`useUpload()`
5. **条件编译**: `#ifdef MP-WEIXIN` 处理平台差异

### 首页组件

```vue
<template>
  <view class="min-h-[100vh]">
    <wd-navbar title="首页" />

    <!-- 轮播图 -->
    <wd-swiper :list="swiperList" custom-class="m-2" />

    <!-- 金刚区 -->
    <wd-row custom-class="p-2 bg-white mx-4 rounded-xl" :gutter="16">
      <wd-col v-for="(item, index) in menuList" :key="index" :span="6">
        <view class="flex flex-col items-center py-2" @click="handleMenuClick(item)">
          <wd-icon :name="item.icon" size="60" :color="item.color" />
          <wd-text custom-class="mt-2" :text="item.title" />
        </view>
      </wd-col>
    </wd-row>

    <!-- 商品列表 -->
    <wd-paging
      ref="paging"
      :fetch="pageGoods"
      :params="queryParams"
      :tabs="tabsConfig"
    >
      <template #item="{ item }">
        <wd-card custom-class="w-694rpx box-border">
          <!-- 卡片内容 -->
        </wd-card>
      </template>
    </wd-paging>
  </view>
</template>

<script lang="ts" setup>
import type { GoodsQuery, GoodsVo } from '@/api/app/home/homeTypes'
import { listAds, pageGoods } from '@/api/app/home/homeApi'
import { usePayment } from '@/composables/usePayment'
import { useToast } from '@/wd'

const toast = useToast()

// 使用滚动 Composable
const { scrollTop, scrollToTop } = useScroll()

// Tabs 配置
const tabsConfig = ref([
  { name: 'hot', title: '热销', data: { category: 'hot' } },
  { name: 'new', title: '新品', data: { category: 'new' } },
])

// 轮播图数据
const swiperList = ref<string[]>([])

// 金刚区数据
const menuList = ref([
  { title: '外卖', icon: 'goods', color: '#ff6b6b' },
  { title: '超市', icon: 'cart', color: '#4ecdc4' },
  // ...
])

// 查询参数
const queryParams = ref<GoodsQuery>({
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'createTime',
  isAsc: 'desc',
})

// 事件处理
const handleMenuClick = (item: any) => {
  uni.navigateTo({ url: item.path })
}

// 页面生命周期
onMounted(() => {
  initAds()
})
</script>

<style lang="scss" scoped>
.action {
  height: 100%;
}
</style>
```

## Props 和 Events

### Props 定义方式

```vue
<script lang="ts" setup>
// 方式一：简单类型定义
const props = defineProps<{
  title: string
  count?: number
  visible?: boolean
}>()

// 方式二：带默认值
const props = withDefaults(defineProps<{
  title: string
  count?: number
  disabled?: boolean
}>(), {
  count: 0,
  disabled: false
})

// 方式三：导入外部类型
import type { UserCardProps } from './types'
const props = defineProps<UserCardProps>()
</script>
```

### Events 定义方式

```vue
<script lang="ts" setup>
// 方式一：简单定义
const emit = defineEmits<{
  click: [event: Event]
  change: [value: string]
  submit: [data: FormData]
}>()

// 方式二：导入外部类型
import type { UserCardEmits } from './types'
const emit = defineEmits<UserCardEmits>()

// 使用
const handleClick = (event: Event) => {
  emit('click', event)
}
</script>
```

## Store 集成

### 使用 Pinia Store

```vue
<script lang="ts" setup>
// 使用用户 Store
const userStore = useUserStore()

// 访问状态
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)

// 调用 action
const handleLogout = async () => {
  const [err] = await userStore.logoutUser()
  if (!err) {
    toast.success('退出成功')
  }
}

// 监听状态变化
watch(
  () => userStore.authModalVisible,
  (val) => {
    if (val) {
      // 弹窗打开时的逻辑
    }
  }
)
</script>
```

### 自动导入

项目配置了 Store 的自动导入，无需手动 import：

```vue
<script lang="ts" setup>
// 无需 import，直接使用
const userStore = useUserStore()
const appStore = useAppStore()
</script>
```

## Composables 使用

### Toast 提示

```vue
<script lang="ts" setup>
import { useToast } from '@/wd'

const toast = useToast()

// 各种提示
toast.success('操作成功')
toast.error('操作失败')
toast.warning('警告信息')
toast.info('提示信息')
toast.loading('加载中...')
toast.close() // 关闭 loading
</script>
```

### Message 对话框

```vue
<script lang="ts" setup>
import { useMessage } from '@/wd'

const { confirm, alert } = useMessage()

// 确认对话框
const handleLogout = async () => {
  const result = await confirm({
    title: '确认退出',
    msg: '您确定要退出登录吗？',
    confirmButtonText: '确定退出',
    cancelButtonText: '取消',
  })

  if (result.action === 'confirm') {
    // 执行退出
  }
}
</script>
```

### 文件上传

```vue
<script lang="ts" setup>
import { useUpload } from '@/wd'

const upload = useUpload()

// 选择文件
const handleChooseFile = async () => {
  const files = await upload.chooseFile({
    accept: 'image',
    maxCount: 1
  })

  // 快速上传
  upload.fastUpload(files[0].path, {
    onSuccess(res, file) {
      console.log('上传成功:', res.url)
    },
    onError(err, file) {
      console.error('上传失败:', err)
    },
  })
}
</script>
```

### 滚动控制

```vue
<script lang="ts" setup>
// 使用滚动 Composable
const { scrollTop, scrollToTop } = useScroll()

// 监听滚动位置
watch(scrollTop, (val) => {
  console.log('当前滚动位置:', val)
})

// 滚动到顶部
const handleScrollToTop = () => {
  scrollToTop(300) // 300ms 动画
}
</script>
```

### 国际化

```vue
<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

// 使用翻译
const title = computed(() => t('app.my.title'))
</script>

<template>
  <view>{{ t('app.my.logout') }}</view>
</template>
```

## UnoCSS 样式

### 常用工具类

```vue
<template>
  <!-- 布局 -->
  <view class="flex items-center justify-center">...</view>
  <view class="flex flex-col">...</view>

  <!-- 间距 -->
  <view class="p-4">...</view>
  <view class="mt-8 mx-4 pb-8">...</view>

  <!-- 尺寸 -->
  <view class="w-full h-100">...</view>
  <view class="min-h-[100vh]">...</view>

  <!-- 背景和圆角 -->
  <view class="bg-white rounded-xl">...</view>
  <view class="bg-#FFFCF5 rounded-t-4">...</view>

  <!-- 文字 -->
  <view class="text-center text-#751937 text-4">...</view>

  <!-- 特效 -->
  <view class="filter-blur-lg">...</view>
</template>
```

### 响应式设计

```vue
<template>
  <!-- rpx 单位用于响应式 -->
  <view class="w-694rpx">...</view>

  <!-- 使用 WD 组件的 custom-class -->
  <wd-card custom-class="w-694rpx box-border">
    ...
  </wd-card>
</template>
```

## 平台条件编译

### 微信小程序特殊处理

```vue
<script lang="ts" setup>
import PLATFORM from '@/utils/platform'

// 判断平台
const needPhoneAuth = computed(() => {
  return PLATFORM.isMpWeixin && !userStore.userInfo?.phone
})

// 条件编译
const chooseavatar = (detail) => {
  // #ifdef MP-WEIXIN
  // 微信小程序专用逻辑
  upload.fastUpload(detail.avatarUrl, {
    onSuccess(res) {
      // ...
    }
  })
  // #endif
}

const manualChooseAvatar = async () => {
  // #ifndef MP-WEIXIN
  // 非微信小程序逻辑
  const res = await upload.chooseFile({ accept: 'image', maxCount: 1 })
  // ...
  // #endif
}
</script>
```

### 模板中的条件渲染

```vue
<template>
  <!-- 仅微信小程序显示 -->
  <view v-if="PLATFORM.isMpWeixin" class="flex justify-end pr-4">
    <wd-button
      size="small"
      type="text"
      open-type="getPhoneNumber"
      @getphonenumber="getPhoneNumber"
    >
      绑定手机号
    </wd-button>
  </view>
</template>
```

## API 调用

### 基本用法

```vue
<script lang="ts" setup>
import type { GoodsVo, GoodsQuery } from '@/api/app/home/homeTypes'
import { listAds, pageGoods } from '@/api/app/home/homeApi'

// 列表查询
const queryParams = ref<GoodsQuery>({
  pageNum: 1,
  pageSize: 10,
})

const goodsList = ref<GoodsVo[]>([])

const loadGoods = async () => {
  const [err, data] = await pageGoods(queryParams.value)
  if (!err) {
    goodsList.value = data.rows
  }
}

// 页面初始化
onMounted(() => {
  loadGoods()
})
</script>
```

### 错误处理

```vue
<script lang="ts" setup>
const toast = useToast()

const submitForm = async () => {
  try {
    toast.loading('提交中...')

    const [err, data] = await updateUserProfile({
      avatar: form.value.avatar,
      nickName: form.value.nickName,
    })

    if (!err) {
      toast.success('提交成功')
      // 处理成功逻辑
    }
  } catch (error) {
    toast.error('提交失败，请重试')
    console.error('提交异常:', error)
  } finally {
    toast.close()
  }
}
</script>
```

## 组件暴露方法

### 使用 defineExpose

```vue
<script lang="ts" setup>
const isLoading = ref(false)

const refresh = async () => {
  isLoading.value = true
  await loadData()
  isLoading.value = false
}

const reset = () => {
  form.value = { ...defaultForm }
}

// 暴露给父组件
defineExpose({
  refresh,
  reset,
  isLoading
})
</script>
```

### 父组件调用

```vue
<template>
  <my-component ref="myComponentRef" />
  <wd-button @click="handleRefresh">刷新</wd-button>
</template>

<script lang="ts" setup>
const myComponentRef = ref()

const handleRefresh = () => {
  myComponentRef.value?.refresh()
}
</script>
```

## 生命周期

### Vue 生命周期

```vue
<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue'

onMounted(() => {
  // 组件挂载后
  initData()
})

onUnmounted(() => {
  // 组件卸载前
  cleanup()
})
</script>
```

### UniApp 页面生命周期

```vue
<script lang="ts" setup>
// 页面显示
onShow(() => {
  refreshData()
})

// 页面隐藏
onHide(() => {
  pauseTimer()
})

// 下拉刷新
onPullDownRefresh(() => {
  loadData().finally(() => {
    uni.stopPullDownRefresh()
  })
})

// 触底加载
onReachBottom(() => {
  loadMore()
})
</script>
```

## 最佳实践

### 1. 组件职责单一

每个组件只负责一个功能，避免组件过于庞大：

```text
✅ 好的做法：
- AuthModal.vue - 只负责授权弹窗
- UserCard.vue - 只负责用户卡片展示

❌ 避免：
- AllInOnePage.vue - 包含所有功能的巨型组件
```

### 2. 合理使用 WD 组件

优先使用 WD 组件库提供的组件，保持 UI 一致性：

```vue
<template>
  <!-- ✅ 使用 WD 组件 -->
  <wd-button type="primary" @click="handleClick">确认</wd-button>
  <wd-cell title="设置" is-link />
  <wd-popup v-model="visible">...</wd-popup>

  <!-- ❌ 避免自己实现基础组件 -->
  <button class="custom-btn">确认</button>
</template>
```

### 3. 样式优先级

1. 优先使用 UnoCSS 工具类
2. 其次使用 WD 组件的 `custom-class` 属性
3. 最后使用 scoped 样式

```vue
<template>
  <!-- 方式一：UnoCSS -->
  <view class="flex items-center p-4 bg-white rounded-xl">

  <!-- 方式二：custom-class -->
  <wd-card custom-class="w-694rpx box-border">

  <!-- 方式三：scoped 样式 -->
  <view class="my-custom-card">
</template>

<style lang="scss" scoped>
.my-custom-card {
  // 复杂样式
}
</style>
```

### 4. 类型安全

充分利用 TypeScript 类型：

```vue
<script lang="ts" setup>
// 导入 API 类型
import type { UserInfo, UserProfileUpdateBo } from '@/api/system/auth/authTypes'

// 定义组件类型
interface Props {
  user: UserInfo
  editable?: boolean
}

const props = defineProps<Props>()

// 响应式数据类型
const form = ref<UserProfileUpdateBo>({
  avatar: '',
  nickName: '',
})
</script>
```

## 常见问题

### 1. Store 未定义

**问题**: `useUserStore is not defined`

**解决**: 确保 `auto-imports.d.ts` 已生成，或手动导入：

```typescript
import { useUserStore } from '@/stores/user'
```

### 2. 样式不生效

**问题**: `custom-class` 样式不生效

**解决**: 使用 `!important` 或检查 class 优先级：

```vue
<wd-button custom-class="bg-#f9f9f9! text-#888888!">
```

### 3. 条件编译不工作

**问题**: `#ifdef` 指令不生效

**解决**: 确保在正确的位置使用，且使用正确的平台标识：

```typescript
// #ifdef MP-WEIXIN
// 微信小程序代码
// #endif

// #ifndef MP-WEIXIN
// 非微信小程序代码
// #endif

// #ifdef H5
// H5 代码
// #endif
```

### 4. 组件 ref 获取不到

**问题**: `myComponentRef.value` 为 undefined

**解决**: 确保在 `onMounted` 后访问，且组件已正确注册：

```typescript
onMounted(() => {
  // 此时 ref 已可用
  console.log(myComponentRef.value)
})
```
