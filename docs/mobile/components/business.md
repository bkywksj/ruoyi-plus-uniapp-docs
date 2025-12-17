# 业务组件

## 介绍

业务组件是针对 RuoYi-Plus-UniApp 项目业务场景封装的专用组件，深度集成认证系统、支付系统、状态管理等核心功能。

**核心特性:**

- **认证授权** - 完整的用户认证流程，支持多平台登录、用户信息授权
- **支付集成** - 多平台支付能力，支持微信支付、支付宝支付、余额支付
- **状态管理** - 基于 Pinia 的用户状态管理
- **多平台适配** - 自动识别运行环境，适配多平台

## 组件列表

| 组件 | 说明 | 位置 |
|------|------|------|
| AuthModal | 用户授权弹窗组件 | `components/auth/AuthModal.vue` |
| Home | 首页业务组件 | `components/tabbar/Home.vue` |
| Menu | 分类菜单组件 | `components/tabbar/Menu.vue` |
| My | 个人中心组件 | `components/tabbar/My.vue` |

---

## AuthModal 授权弹窗

用户授权弹窗组件，用于收集用户信息（头像、昵称），并可选择性绑定手机号。

### 基本用法

```vue
<template>
  <view>
    <AuthModal />
    <wd-button @click="userStore.authModalVisible = true">完善信息</wd-button>
  </view>
</template>

<script lang="ts" setup>
const userStore = useUserStore()
</script>
```

### 头像选择与上传

```vue
<template>
  <wd-button
    type="icon"
    :icon="avatarPreviewUrl || 'camera'"
    open-type="chooseAvatar"
    @chooseavatar="chooseavatar"
    @click="manualChooseAvatar"
  />
</template>

<script lang="ts" setup>
import { useUpload, useToast } from '@/wd'

const toast = useToast()
const upload = useUpload()
const avatarPreviewUrl = ref('')
const form = ref({ avatar: '', nickName: '' })

// 微信小程序头像选择
const chooseavatar = (detail) => {
  // #ifdef MP-WEIXIN
  toast.loading('正在上传头像...')
  upload.fastUpload(detail.avatarUrl, {
    onSuccess(res) {
      toast.close()
      avatarPreviewUrl.value = res.url
      form.value.avatar = res.originalUrl!
    },
    onError() { toast.close(); toast.error('上传失败') },
  })
  // #endif
}

// 其他平台手动选择
const manualChooseAvatar = async () => {
  // #ifndef MP-WEIXIN
  const res = await upload.chooseFile({ accept: 'image', maxCount: 1 })
  toast.loading('正在上传头像...')
  upload.fastUpload(res[0].path, {
    onSuccess(uploadRes) {
      toast.close()
      avatarPreviewUrl.value = uploadRes.url
      form.value.avatar = uploadRes.originalUrl!
    },
  })
  // #endif
}
</script>
```

### 完整授权流程

```typescript
const completeAuth = async () => {
  if (!form.value.avatar) { toast.warning('请选择头像'); return }
  if (!form.value.nickName) { toast.warning('请设置昵称'); return }

  const [err] = await updateUserProfile({
    avatar: form.value.avatar,
    nickName: form.value.nickName,
  })

  if (!err) {
    await userStore.fetchUserInfo()
    userStore.authModalVisible = false
    toast.success('授权成功！')
  }
}
```

---

## Home 首页组件

首页业务组件，集成轮播图、金刚区导航、商品列表分页、支付功能等。

### 基本用法

```vue
<template>
  <view class="min-h-[100vh]">
    <wd-navbar title="首页" />
    <wd-swiper :list="swiperList" custom-class="m-2" />

    <wd-row custom-class="p-2 bg-white mx-4 rounded-xl" :gutter="16">
      <wd-col v-for="(item, index) in menuList" :key="index" :span="6">
        <view class="flex flex-col items-center py-2" @click="handleMenuClick(item)">
          <wd-icon :name="item.icon" size="60" :color="item.color" />
          <wd-text custom-class="mt-2" :text="item.title" />
        </view>
      </wd-col>
    </wd-row>

    <wd-paging
      ref="paging"
      :fetch="pageGoods"
      :params="queryParams"
      :tabs="tabsConfig"
    >
      <template #item="{ item }">
        <wd-card custom-class="w-694rpx">
          <template #title>
            <view class="flex items-center">
              <wd-img :src="item.img" width="120" height="120" radius="8" />
              <wd-text custom-class="ml-1" :text="item.name" />
            </view>
          </template>
          <template #footer>
            <view class="flex justify-between">
              <wd-text :text="item.price" size="32" type="error" bold />
              <wd-button type="primary" size="small" @click="handleGoodsPay(item)">
                立即购买
              </wd-button>
            </view>
          </template>
        </wd-card>
      </template>
    </wd-paging>
  </view>
</template>
```

### 数据配置

```typescript
const tabsConfig = ref([
  { name: 'hot', title: '热销', data: { category: 'hot' } },
  { name: 'new', title: '新品', data: { category: 'new' } },
])

const menuList = ref([
  { title: '外卖', icon: 'goods', color: '#ff6b6b' },
  { title: '超市', icon: 'cart', color: '#4ecdc4' },
  // ...更多菜单项
])

const queryParams = ref<GoodsQuery>({
  pageNum: 1,
  pageSize: 10,
  orderByColumn: 'createTime',
  isAsc: 'desc',
})
```

### 商品支付功能

```typescript
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay, pollOrderStatus } = usePayment()

const handleGoodsPay = async (goods: GoodsVo) => {
  const orderData: CreateOrderBo = {
    goodsId: goods.id,
    goodsName: goods.name,
    quantity: 1,
    price: '0.01',
  }

  const [payErr, payResult] = await createOrderAndPay({
    orderData,
    paymentMethod: PaymentMethod.WECHAT,
  })

  if (!payErr) {
    const [pollErr] = await pollOrderStatus(payResult.orderData.orderNo, 5)
    if (!pollErr) toast.success('支付成功')
    else toast.error('支付确认超时')
  }
}
```

---

## Menu 分类菜单组件

实现侧边栏分类导航与内容滚动联动效果。

### 基本用法

```vue
<template>
  <view>
    <wd-navbar title="点餐" />
    <view class="wraper">
      <wd-sidebar v-model="active" @change="handleChange">
        <wd-sidebar-item
          v-for="(item, index) in categories"
          :key="index"
          :value="index"
          :label="item.label"
        />
      </wd-sidebar>

      <scroll-view
        class="content"
        scroll-y
        :scroll-with-animation="scrollWithAnimation"
        :scroll-top="scrollTop"
        @scroll="onScroll"
      >
        <view v-for="(item, index) in categories" :key="index" class="category">
          <wd-cell-group :title="item.title" border>
            <wd-cell
              v-for="(cell, cellIndex) in item.items"
              :key="cellIndex"
              :title="cell.title"
              :label="cell.label"
            />
          </wd-cell-group>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
```

### 滚动联动逻辑

```typescript
const active = ref(0)
const scrollTop = ref(0)
const itemScrollTop = ref<number[]>([])
const isScrolling = ref(false)

onMounted(() => {
  CommonUtil.getRect('.category', true, proxy).then((rects) => {
    if (CommonUtil.isArray(rects)) {
      itemScrollTop.value = rects.map((item) => item.top || 0)
      scrollTop.value = rects[active.value].top || 0
    }
  })
})

function handleChange({ value }) {
  if (isScrolling.value) return
  active.value = value
  isScrolling.value = true
  scrollTop.value = itemScrollTop.value[value]
  setTimeout(() => { isScrolling.value = false }, 300)
}

function onScroll(e) {
  if (isScrolling.value) return
  const { scrollTop: currentScrollTop } = e.detail
  const index = itemScrollTop.value.findIndex(
    (top) => top > currentScrollTop && top - currentScrollTop <= 50
  )
  if (index > -1 && active.value !== index) active.value = index
}
```

---

## My 个人中心组件

个人中心页面，包含用户信息展示、统计数据、订单管理、快捷功能等。

### 基本用法

```vue
<template>
  <view class="min-h-[100vh] bg-#FFFCF5 pb-10">
    <wd-navbar :bg-color="`rgba(255,252,245,${scrollTop / 60})`" title="我的" />

    <view class="relative pt-10">
      <view class="flex flex-col items-center justify-center">
        <wd-icon
          v-if="!userStore.userInfo?.avatar"
          custom-class="bg-#f8f6f8 rounded-full p-6"
          name="user"
          size="80"
          @click="handleUserInfo"
        />
        <wd-img v-else :src="userStore.userInfo?.avatar" width="128" height="128" round @click="handleUserInfo" />
        <wd-text size="36" :text="userStore.userInfo?.nickName || '昵称'" @click="handleUserInfo" />
      </view>

      <wd-row custom-class="mt-6 bg-#ffffffcc mx-5! rounded-lg py-2" :gutter="12">
        <wd-col v-for="(stat, index) in statsData" :key="index" :span="8">
          <view class="text-center">
            <wd-text bold block size="34" :text="stat.value" />
            <wd-text block :text="stat.label" size="24" />
          </view>
        </wd-col>
      </wd-row>
    </view>

    <wd-cell-group custom-class="mt-2 mx-3" title="我的订单">
      <wd-grid :items="orderTypes" clickable @item-click="handleOrderClick" />
    </wd-cell-group>

    <wd-button v-if="auth.isLoggedIn.value" block custom-class="mx-10! mt-4" @click="handleLogout">
      退出登录
    </wd-button>
  </view>
</template>
```

### 数据与事件

```typescript
const statsData = ref([
  { label: '优惠券', value: '3', type: 'coupon' },
  { label: '积分', value: '1285', type: 'points' },
  { label: '余额', value: '268', type: 'balance' },
])

const orderTypes = ref<GridItem[]>([
  { text: '待付款', icon: 'wallet', iconColor: '#666666' },
  { text: '待收货', icon: 'calendar', iconColor: '#666666' },
  { text: '待评价', icon: 'star', iconColor: '#666666' },
  { text: '退款/售后', icon: 'service', iconColor: '#666666' },
])

const handleUserInfo = () => {
  if (auth.isLoggedIn.value) userStore.authModalVisible = true
  else uni.navigateTo({ url: '/pages/auth/login' })
}

const handleLogout = async () => {
  const result = await confirm({ title: '确认退出', msg: '您确定要退出登录吗？' })
  if (result.action === 'confirm') {
    toast.loading('退出中...')
    const [err] = await userStore.logoutUser()
    if (!err) { toast.close(); toast.success('退出成功') }
  }
}
```

---

## useAuth 认证组合式函数

提供用户认证与权限检查功能。

### 基本用法

```typescript
import { useAuth } from '@/composables/useAuth'

const {
  isLoggedIn,      // 登录状态
  isSuperAdmin,    // 超级管理员判断
  hasPermission,   // 权限检查
  hasRole,         // 角色检查
} = useAuth()

// 单个权限检查
if (hasPermission('system:user:add')) { /* 可以添加用户 */ }

// 多个权限检查（OR 逻辑）
if (hasPermission(['system:user:add', 'system:user:update'])) { /* 有任一权限 */ }

// 角色检查
if (hasRole('admin')) { /* 是管理员 */ }
```

### API 说明

| 方法/属性 | 说明 | 返回值 |
|-----------|------|--------|
| `isLoggedIn` | 登录状态 | `ComputedRef<boolean>` |
| `isSuperAdmin` | 超级管理员判断 | `boolean` |
| `isTenantAdmin` | 租户管理员判断 | `boolean` |
| `hasPermission` | 权限检查 | `boolean` |
| `hasRole` | 角色检查 | `boolean` |
| `hasAllPermissions` | 检查所有权限 | `boolean` |
| `canAccessRoute` | 路由访问检查 | `boolean` |
| `filterAuthorizedRoutes` | 过滤授权路由 | `any[]` |

---

## usePayment 支付组合式函数

多平台支付组合式函数，支持微信支付、支付宝支付、余额支付。

### 基本用法

```typescript
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const {
  loading,
  availableMethods,
  createOrderAndPay,
  payOrder,
  pollOrderStatus,
  getPlatformInfo,
} = usePayment()
```

### 创建订单并支付

```typescript
const handlePay = async () => {
  const orderData: CreateOrderBo = {
    goodsId: 'goods-001',
    goodsName: '测试商品',
    quantity: 1,
    price: '99.00',
  }

  const [err, result] = await createOrderAndPay({
    orderData,
    paymentMethod: PaymentMethod.WECHAT,
  })

  if (!err && result) {
    const [pollErr] = await pollOrderStatus(result.orderData.orderNo, 5)
    if (!pollErr) console.log('支付成功')
  }
}
```

### API 说明

| 方法/属性 | 说明 | 返回值 |
|-----------|------|--------|
| `loading` | 支付加载状态 | `Readonly<Ref<boolean>>` |
| `availableMethods` | 可用支付方式 | `Readonly<Ref<PaymentMethod[]>>` |
| `createOrderAndPay` | 创建订单并支付 | `Promise<[Error \| null, Result]>` |
| `payOrder` | 支付已有订单 | `Promise<[Error \| null, Result]>` |
| `pollOrderStatus` | 轮询订单状态 | `Promise<[Error, Result]>` |
| `getPlatformInfo` | 获取平台信息 | `PlatformInfo` |

---

## useUserStore 用户状态管理

基于 Pinia 的用户认证与权限管理模块。

### 基本用法

```typescript
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const nickname = computed(() => userStore.userInfo?.nickName || '')
const avatar = computed(() => userStore.userInfo?.avatar || '')
```

### 登录方法

```typescript
// 密码登录
const [err] = await userStore.loginWithPassword({
  userName: 'admin',
  password: '123456',
  code: '1234',
  uuid: 'uuid123',
})

// 小程序一键登录
const [err] = await userStore.loginWithMiniapp()

// 微信公众号登录
const authUrl = userStore.getWechatH5AuthUrl('https://your-domain.com/callback')
const [err] = await userStore.loginWithMp({ code, state })

// 获取用户信息
await userStore.fetchUserInfo()

// 退出登录
await userStore.logoutUser()
```

### API 说明

| 方法/属性 | 说明 | 返回值 |
|-----------|------|--------|
| `token` | 用户令牌 | `Ref<string>` |
| `isLoggedIn` | 登录状态 | `ComputedRef<boolean>` |
| `userInfo` | 用户信息 | `Ref<SysUserVo \| null>` |
| `roles` | 用户角色 | `Ref<string[]>` |
| `permissions` | 用户权限 | `Ref<string[]>` |
| `loginWithPassword` | 密码登录 | `Result<AuthTokenVo>` |
| `loginWithMiniapp` | 小程序登录 | `Result<AuthTokenVo>` |
| `loginWithMp` | 公众号登录 | `Result<AuthTokenVo>` |
| `fetchUserInfo` | 获取用户信息 | `Result<UserInfoVo>` |
| `logoutUser` | 用户注销 | `Result<void>` |
| `authModalVisible` | 授权弹窗状态 | `Ref<boolean>` |
| `navigateWithUserCheck` | 带用户检查的跳转 | `void` |

### 平台登录支持

| 平台 | 支持的登录方式 |
|------|----------------|
| 微信小程序 | miniapp, password, sms |
| 微信公众号 | mp, password |
| 抖音/支付宝小程序 | miniapp, password |
| H5 | password, sms |
| APP | password |

---

## 最佳实践

### 1. 使用组合式函数封装业务逻辑

```typescript
export const useOrder = () => {
  const orderList = ref([])
  const loading = ref(false)

  const fetchOrders = async () => {
    loading.value = true
    const [err, data] = await getOrderList()
    if (!err) orderList.value = data
    loading.value = false
  }

  return { orderList, loading, fetchOrders }
}
```

### 2. 错误处理统一封装

```typescript
const [err, data] = await someApi()
if (err) {
  toast.error(err.message || '操作失败')
  return
}
```

### 3. 平台适配使用条件编译

```typescript
// #ifdef MP-WEIXIN
const res = await uni.login()
// #endif

// #ifndef MP-WEIXIN
const res = await customLogin()
// #endif
```

---

## 常见问题

### 1. 授权弹窗不显示

确保 AuthModal 组件已引入，并设置 `userStore.authModalVisible = true`：

```vue
<template>
  <AuthModal />
  <wd-button @click="userStore.authModalVisible = true">完善信息</wd-button>
</template>
```

### 2. 支付在某些平台不可用

检查平台支持的支付方式：

```typescript
const { availableMethods, getPlatformInfo } = usePayment()
const platformInfo = getPlatformInfo()
console.log('支持微信支付:', platformInfo.supportsWechatPay)
```

### 3. 侧边栏与内容滚动不同步

使用 `isScrolling` 标志防止重复触发：

```typescript
const isScrolling = ref(false)

function handleChange({ value }) {
  if (isScrolling.value) return
  isScrolling.value = true
  scrollTop.value = targetPosition
  setTimeout(() => { isScrolling.value = false }, 300)
}
```

---

## 类型定义

### 用户相关类型

```typescript
interface SysUserVo {
  userId: string
  userName: string
  nickName: string
  avatar: string
  phone: string
  tenantId: string
}

interface UserInfoVo {
  user: SysUserVo
  roles: string[]
  permissions: string[]
}

interface AuthTokenVo {
  access_token: string
  expires_in: number
}

type AuthType = 'password' | 'sms' | 'miniapp' | 'mp'
type PlatformType = 'mp-weixin' | 'mp-official-account' | 'mp-toutiao' | 'mp-alipay' | 'h5' | 'app'
```

### 支付相关类型

```typescript
enum PaymentMethod {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
  BALANCE = 'BALANCE',
}

enum TradeType {
  JSAPI = 'JSAPI',
  APP = 'APP',
  H5 = 'H5',
  NATIVE = 'NATIVE',
}

interface CreateOrderBo {
  goodsId: string
  goodsName: string
  quantity: number
  price: string
}

interface PaymentRequest {
  orderNo: string
  paymentMethod: PaymentMethod
  tradeType?: TradeType
  appId?: string
  openId?: string
}

interface GridItem {
  text: string
  icon: string
  iconColor?: string
  badge?: number | string
  dot?: boolean
  url?: string
}
```
