# 系统接口

## 介绍

本文档详细介绍 RuoYi-Plus-UniApp 移动端应用的系统级接口,涵盖字典数据管理、角色权限管理、手机号绑定、系统功能配置等核心系统功能。这些接口为应用提供了完整的系统管理和配置能力。

**核心特性:**

- **字典管理** - 提供字典数据查询、缓存和动态展示功能,支持多种业务场景
- **角色权限** - 完整的角色查询和管理功能,支持数据权限控制
- **手机号绑定** - 集成微信等平台的手机号快捷获取和绑定能力
- **系统配置** - 动态获取系统功能开关,支持特性按需加载
- **类型安全** - 完整的 TypeScript 类型定义,确保接口调用正确性
- **性能优化** - 支持数据缓存和按需加载,提升应用响应速度

参考: src/api/system/dict/dictData/dictDataApi.ts:1-58

## API 列表

### 1. listDictDatasByDictType - 根据字典类型查询字典数据

根据字典类型查询对应的字典数据列表,常用于下拉选择、单选按钮组等场景。

**请求方式:** GET

**请求路径:** `/system/dictData/listDictDatasByDictType/{dictType}`

**请求参数:**

```typescript
/**
 * 请求参数
 * @param dictType 字典类型(如: sys_user_sex, sys_normal_disable)
 */
type DictTypeParam = string
```

参考: src/api/system/dict/dictData/dictDataApi.ts:4-10

**响应数据:**

```typescript
/**
 * 字典数据视图类型
 */
interface SysDictDataVo {
  /** 字典编码 */
  dictDataId: string | number

  /** 字典标签 */
  dictLabel: string

  /** 字典键值 */
  dictValue: string

  /** 样式属性(其他样式扩展) */
  cssClass: string

  /** 表格回显样式 */
  listClass: string

  /** 字典排序 */
  dictSort: number

  /** 状态 */
  status: string

  /** 备注 */
  remark: string
}
```

参考: src/api/system/dict/dictData/dictDataTypes.ts:46-72

**完整使用示例:**

```vue
<template>
  <view class="dict-demo-page">
    <!-- 性别选择 -->
    <view class="form-item">
      <text class="label">性别:</text>
      <wd-radio-group v-model="formData.sex">
        <wd-radio
          v-for="item in sexOptions"
          :key="item.dictValue"
          :value="item.dictValue"
        >
          {{ item.dictLabel }}
        </wd-radio>
      </wd-radio-group>
    </view>

    <!-- 状态选择 -->
    <view class="form-item">
      <text class="label">状态:</text>
      <wd-select
        v-model="formData.status"
        :options="statusOptions"
        placeholder="请选择状态"
      />
    </view>

    <!-- 用户类型选择(带样式) -->
    <view class="form-item">
      <text class="label">用户类型:</text>
      <view class="type-list">
        <view
          v-for="item in userTypeOptions"
          :key="item.dictValue"
          :class="['type-item', item.listClass]"
          @click="selectType(item.dictValue)"
        >
          {{ item.dictLabel }}
        </view>
      </view>
    </view>

    <!-- 字典标签格式化显示 -->
    <view class="info-display">
      <text class="info-label">当前性别:</text>
      <text class="info-value">{{ formatDictLabel('sys_user_sex', formData.sex) }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { listDictDatasByDictType } from '@/api/system/dict/dictData/dictDataApi'
import type { SysDictDataVo } from '@/api/system/dict/dictData/dictDataTypes'
import { to } from '@/utils/to'
import { cache } from '@/utils/cache'

// 表单数据
const formData = reactive({
  sex: '',
  status: '',
  userType: '',
})

// 字典数据
const sexOptions = ref<SysDictDataVo[]>([])
const statusOptions = ref<SysDictDataVo[]>([])
const userTypeOptions = ref<SysDictDataVo[]>([])

// 字典数据缓存
const dictCache = new Map<string, SysDictDataVo[]>()

/**
 * 加载字典数据
 * @param dictType 字典类型
 */
const loadDictData = async (dictType: string): Promise<SysDictDataVo[]> => {
  // 先从内存缓存读取
  if (dictCache.has(dictType)) {
    console.log(`从内存缓存加载字典: ${dictType}`)
    return dictCache.get(dictType)!
  }

  // 再从本地缓存读取
  const cacheKey = `dict_${dictType}`
  const cachedData = cache.get<SysDictDataVo[]>(cacheKey)
  if (cachedData) {
    console.log(`从本地缓存加载字典: ${dictType}`)
    dictCache.set(dictType, cachedData)
    return cachedData
  }

  // 从服务器获取
  const [error, data] = await to(listDictDatasByDictType(dictType))

  if (error) {
    console.error(`加载字典失败 ${dictType}:`, error)
    uni.showToast({ title: '加载字典数据失败', icon: 'none' })
    return []
  }

  if (data && data.length > 0) {
    // 过滤启用的字典项并按排序字段排序
    const validData = data
      .filter((item) => item.status === '0')
      .sort((a, b) => a.dictSort - b.dictSort)

    // 保存到缓存(缓存24小时)
    dictCache.set(dictType, validData)
    cache.set(cacheKey, validData, 24 * 3600)

    console.log(`字典加载成功 ${dictType}:`, validData.length)
    return validData
  }

  return []
}

/**
 * 批量加载字典数据
 */
const loadAllDicts = async () => {
  // 并行加载多个字典
  const [sexData, statusData, userTypeData] = await Promise.all([
    loadDictData('sys_user_sex'),
    loadDictData('sys_normal_disable'),
    loadDictData('sys_user_type'),
  ])

  sexOptions.value = sexData
  statusOptions.value = statusData
  userTypeOptions.value = userTypeData

  console.log('所有字典加载完成')
}

/**
 * 格式化字典标签
 * 根据字典类型和键值获取对应的标签
 */
const formatDictLabel = (dictType: string, dictValue: string): string => {
  const dictData = dictCache.get(dictType)
  if (!dictData) return dictValue

  const item = dictData.find((d) => d.dictValue === dictValue)
  return item?.dictLabel || dictValue
}

/**
 * 选择用户类型
 */
const selectType = (value: string) => {
  formData.userType = value
  console.log('选择用户类型:', value)
}

/**
 * 提交表单
 */
const submitForm = () => {
  console.log('表单数据:', {
    sex: formatDictLabel('sys_user_sex', formData.sex),
    status: formatDictLabel('sys_normal_disable', formData.status),
    userType: formatDictLabel('sys_user_type', formData.userType),
  })

  uni.showToast({ title: '提交成功', icon: 'success' })
}

// 组件挂载时加载字典
onMounted(() => {
  loadAllDicts()
})

// 提供给全局使用的字典工具函数
defineExpose({
  loadDictData,
  formatDictLabel,
})
</script>

<style lang="scss" scoped>
.dict-demo-page {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.type-item {
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  background-color: #f5f5f5;
  color: #666;

  &.primary {
    background-color: #1890ff;
    color: #fff;
  }

  &.success {
    background-color: #52c41a;
    color: #fff;
  }

  &.warning {
    background-color: #faad14;
    color: #fff;
  }

  &.danger {
    background-color: #ff4d4f;
    color: #fff;
  }
}

.info-display {
  padding: 32rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  margin-top: 40rpx;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>
```

**使用说明:**

- **字典类型**: 常见字典类型包括 `sys_user_sex`(性别)、`sys_normal_disable`(状态)、`sys_user_type`(用户类型)等
- **缓存策略**: 采用内存缓存 + 本地缓存双层缓存,减少网络请求
- **样式支持**: 字典项支持 `cssClass` 和 `listClass` 自定义样式
- **状态过滤**: 只使用状态为"0"(启用)的字典项
- **排序显示**: 按 `dictSort` 字段升序排列
- **并行加载**: 使用 `Promise.all` 批量加载多个字典,提升性能
- **格式化工具**: 提供 `formatDictLabel` 函数将字典值转换为标签显示

参考: src/api/system/dict/dictData/dictDataApi.ts:8-10

---

### 2. bindPhone - 绑定手机号

通过平台授权码获取用户手机号并自动绑定到当前登录用户,支持微信小程序等平台。

**请求方式:** POST

**请求路径:** `/app/phone/bindPhone`

**请求参数:**

```typescript
/**
 * 手机号绑定请求参数
 */
interface PhoneBindBo {
  /** 平台类型 */
  platform?: string
  /** 授权码(微信小程序中通过 getPhoneNumber 获取) */
  code: string
}
```

参考: src/api/app/phone/phoneTypes.ts:1-9

**响应数据:**

```typescript
/**
 * 手机号绑定返回结果
 */
interface PhoneBindVo {
  /** 手机号 */
  phone: string
}
```

参考: src/api/app/phone/phoneTypes.ts:11-18

**完整使用示例:**

```vue
<template>
  <view class="phone-bind-page">
    <!-- 用户信息 -->
    <view class="user-info">
      <image :src="userInfo.avatar" mode="aspectFill" class="avatar" />
      <text class="nickname">{{ userInfo.nickName }}</text>
      <view v-if="userInfo.phone" class="phone-status">
        <wd-icon name="check-circle" color="#52c41a" />
        <text class="phone-text">已绑定: {{ formatPhone(userInfo.phone) }}</text>
      </view>
      <view v-else class="phone-status">
        <wd-icon name="info" color="#faad14" />
        <text class="phone-text">未绑定手机号</text>
      </view>
    </view>

    <!-- 绑定说明 -->
    <view class="bind-tips">
      <text class="tips-title">绑定手机号的好处</text>
      <view class="tips-list">
        <view class="tips-item">
          <wd-icon name="check" color="#52c41a" />
          <text>账号安全保护,防止盗号</text>
        </view>
        <view class="tips-item">
          <wd-icon name="check" color="#52c41a" />
          <text>找回密码,快速验证身份</text>
        </view>
        <view class="tips-item">
          <wd-icon name="check" color="#52c41a" />
          <text>接收订单、物流等重要通知</text>
        </view>
      </view>
    </view>

    <!-- 绑定按钮(微信小程序专用) -->
    <!-- #ifdef MP-WEIXIN -->
    <view v-if="!userInfo.phone" class="bind-actions">
      <button
        open-type="getPhoneNumber"
        @getphonenumber="handleGetPhoneNumber"
        class="bind-button"
      >
        <wd-icon name="phone" />
        <text>一键绑定手机号</text>
      </button>
    </view>
    <!-- #endif -->

    <!-- 解绑按钮 -->
    <view v-if="userInfo.phone" class="bind-actions">
      <wd-button type="error" plain @click="handleUnbindPhone">
        解绑手机号
      </wd-button>
    </view>

    <!-- H5/APP 环境提示 -->
    <!-- #ifndef MP-WEIXIN -->
    <view class="platform-tip">
      <wd-icon name="info" />
      <text>该功能仅支持微信小程序,请在小程序中使用</text>
    </view>
    <!-- #endif -->
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { bindPhone, unbindPhone } from '@/api/app/phone/phoneApi'
import { getUserInfo } from '@/api/system/core/user/userApi'
import { to } from '@/utils/to'
import { useUserStore } from '@/stores/user'

// 用户 store
const userStore = useUserStore()

// 用户信息
const userInfo = reactive({
  avatar: 'https://via.placeholder.com/120',
  nickName: '微信用户',
  phone: '',
})

/**
 * 加载用户信息
 */
const loadUserInfo = async () => {
  const [error, data] = await to(getUserInfo())

  if (error) {
    console.error('加载用户信息失败:', error)
    return
  }

  if (data) {
    userInfo.avatar = data.user.avatar || userInfo.avatar
    userInfo.nickName = data.user.nickName || userInfo.nickName
    userInfo.phone = data.user.phonenumber || ''
    console.log('用户信息:', userInfo)
  }
}

/**
 * 处理微信获取手机号
 * @param event 微信小程序返回的事件对象
 */
const handleGetPhoneNumber = async (event: any) => {
  console.log('获取手机号事件:', event)

  // 检查用户是否授权
  if (event.detail.errMsg !== 'getPhoneNumber:ok') {
    console.log('用户拒绝授权')
    uni.showToast({ title: '需要授权手机号才能继续', icon: 'none' })
    return
  }

  // 获取授权码
  const code = event.detail.code
  if (!code) {
    console.error('未获取到授权码')
    uni.showToast({ title: '获取授权码失败', icon: 'none' })
    return
  }

  console.log('授权码:', code)

  // 显示加载提示
  uni.showLoading({ title: '绑定中...' })

  // 调用绑定接口
  const [error, data] = await to(
    bindPhone({
      platform: 'wechat',
      code,
    }),
  )

  uni.hideLoading()

  if (error) {
    console.error('绑定手机号失败:', error)
    uni.showToast({
      title: error.msg || '绑定失败,请重试',
      icon: 'none',
    })
    return
  }

  if (data && data.phone) {
    console.log('绑定成功:', data.phone)

    // 更新本地用户信息
    userInfo.phone = data.phone

    // 更新 store
    await userStore.refreshUserInfo()

    uni.showToast({
      title: '绑定成功',
      icon: 'success',
    })
  }
}

/**
 * 解绑手机号
 */
const handleUnbindPhone = () => {
  uni.showModal({
    title: '提示',
    content: '确定要解绑手机号吗?解绑后将无法接收重要通知',
    success: async (res) => {
      if (!res.confirm) return

      uni.showLoading({ title: '解绑中...' })

      const [error] = await to(unbindPhone())

      uni.hideLoading()

      if (error) {
        console.error('解绑失败:', error)
        uni.showToast({
          title: error.msg || '解绑失败,请重试',
          icon: 'none',
        })
        return
      }

      console.log('解绑成功')

      // 清空本地手机号
      userInfo.phone = ''

      // 更新 store
      await userStore.refreshUserInfo()

      uni.showToast({
        title: '解绑成功',
        icon: 'success',
      })
    },
  })
}

/**
 * 格式化手机号显示
 * 中间4位显示为 *
 */
const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 页面加载时获取用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.phone-bind-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 32rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-bottom: 24rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.phone-status {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.phone-text {
  font-size: 28rpx;
  color: #666;
}

.bind-tips {
  padding: 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.tips-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tips-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.bind-actions {
  margin-bottom: 32rpx;
}

.bind-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  width: 100%;
  height: 88rpx;
  background-color: #07c160;
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;

  &::after {
    border: none;
  }
}

.platform-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**使用说明:**

- **平台限制**: 该功能主要用于微信小程序,H5 和 APP 环境不支持
- **授权流程**: 使用 `open-type="getPhoneNumber"` 触发微信授权弹窗
- **授权码获取**: 通过 `event.detail.code` 获取授权码
- **自动绑定**: 服务器解密授权码获取真实手机号并自动绑定到用户账号
- **用户体验**: 一键绑定,无需手动输入手机号和验证码
- **安全性**: 微信加密传输,服务器端解密,保证手机号安全
- **解绑功能**: 提供解绑接口,用户可自主管理绑定状态

参考: src/api/app/phone/phoneApi.ts:3-11

---

### 3. getPhone - 获取手机号(不绑定)

仅获取用户手机号信息,不自动绑定,用于需要先获取手机号再进行其他操作的场景。

**请求方式:** GET

**请求路径:** `/app/phone/getPhone`

**请求参数:**

```typescript
/**
 * 手机号绑定请求参数
 */
interface PhoneBindBo {
  /** 平台类型 */
  platform?: string
  /** 授权码 */
  code: string
}
```

参考: src/api/app/phone/phoneTypes.ts:1-9

**响应数据:**

```typescript
/**
 * 手机号返回结果
 */
interface PhoneBindVo {
  /** 手机号 */
  phone: string
}
```

参考: src/api/app/phone/phoneTypes.ts:11-18

**完整使用示例:**

```vue
<template>
  <view class="verify-page">
    <!-- 验证提示 -->
    <view class="verify-header">
      <wd-icon name="lock" size="80" color="#1890ff" />
      <text class="verify-title">身份验证</text>
      <text class="verify-desc">为了您的账号安全,请先验证手机号</text>
    </view>

    <!-- 微信一键验证 -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="verify-methods">
      <button
        open-type="getPhoneNumber"
        @getphonenumber="handleVerifyPhone"
        class="verify-button primary"
      >
        <wd-icon name="wechat" />
        <text>微信一键验证</text>
      </button>
    </view>
    <!-- #endif -->

    <!-- 或者手动输入 -->
    <view class="divider">
      <view class="divider-line" />
      <text class="divider-text">或者</text>
      <view class="divider-line" />
    </view>

    <view class="manual-input">
      <wd-input
        v-model="manualPhone"
        placeholder="请输入手机号"
        type="number"
        maxlength="11"
      />
      <wd-button type="primary" @click="handleManualVerify">
        验证
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { getPhone } from '@/api/app/phone/phoneApi'
import { to } from '@/utils/to'

const manualPhone = ref('')

/**
 * 处理微信一键验证
 */
const handleVerifyPhone = async (event: any) => {
  if (event.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '需要授权手机号', icon: 'none' })
    return
  }

  const code = event.detail.code
  if (!code) {
    uni.showToast({ title: '获取授权码失败', icon: 'none' })
    return
  }

  uni.showLoading({ title: '验证中...' })

  // 获取手机号(不绑定)
  const [error, data] = await to(
    getPhone({
      platform: 'wechat',
      code,
    }),
  )

  uni.hideLoading()

  if (error) {
    console.error('获取手机号失败:', error)
    uni.showToast({
      title: error.msg || '验证失败',
      icon: 'none',
    })
    return
  }

  if (data && data.phone) {
    console.log('获取到手机号:', data.phone)

    // 验证通过,执行后续操作
    handleVerifySuccess(data.phone)
  }
}

/**
 * 处理手动验证
 */
const handleManualVerify = () => {
  if (!manualPhone.value || manualPhone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  // 这里可以调用验证码验证接口
  console.log('手动验证手机号:', manualPhone.value)
  handleVerifySuccess(manualPhone.value)
}

/**
 * 验证成功后的处理
 */
const handleVerifySuccess = (phone: string) => {
  uni.showToast({
    title: '验证成功',
    icon: 'success',
    success() {
      // 跳转到目标页面或执行敏感操作
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    },
  })
}
</script>

<style lang="scss" scoped>
.verify-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 64rpx 32rpx;
}

.verify-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 64rpx;
}

.verify-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin: 32rpx 0 16rpx;
}

.verify-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

.verify-methods {
  margin-bottom: 48rpx;
}

.verify-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  width: 100%;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  border: none;

  &.primary {
    background-color: #07c160;
    color: #fff;
  }

  &::after {
    border: none;
  }
}

.divider {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e5e5e5;
}

.divider-text {
  font-size: 24rpx;
  color: #999;
}

.manual-input {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
</style>
```

**使用说明:**

- **使用场景**: 适用于敏感操作前的身份验证,如修改密码、删除账号、大额支付等
- **不自动绑定**: 只获取手机号信息,不会更新用户数据库中的手机号字段
- **临时验证**: 用于一次性验证场景,验证通过后立即执行目标操作
- **组合使用**: 可以先用 `getPhone` 验证,验证通过后再调用 `bindPhone` 绑定
- **安全性**: 适合需要二次确认的敏感操作
- **灵活性**: 开发者可以自行决定是否将手机号保存到用户信息

参考: src/api/app/phone/phoneApi.ts:14-21

---

### 4. unbindPhone - 解绑手机号

移除用户绑定的手机号信息,用户可自主管理手机号绑定状态。

**请求方式:** DELETE

**请求路径:** `/app/phone/unbindPhone`

**请求参数:** 无

**响应数据:** 无(void)

参考: src/api/app/phone/phoneApi.ts:23-30

**使用说明:**

- **安全确认**: 解绑前应弹窗确认,避免用户误操作
- **影响说明**: 需要告知用户解绑后无法接收通知、找回密码等影响
- **重新绑定**: 解绑后可以重新绑定新的手机号
- **账号安全**: 解绑手机号会降低账号安全等级,建议提醒用户

---

### 5. pageRoles - 查询角色列表

分页查询角色列表,支持按角色名称、权限字符串、状态等条件筛选。

**请求方式:** GET

**请求路径:** `/system/role/pageRoles`

**请求参数:**

```typescript
/**
 * 角色信息查询类型
 */
interface SysRoleQuery extends PageQuery {
  /** 角色名称 */
  roleName?: string

  /** 角色权限字符串 */
  roleKey?: string

  /** 角色状态 */
  status?: string

  /** 分页参数: 页码 */
  pageNum?: number

  /** 分页参数: 每页数量 */
  pageSize?: number
}
```

参考: src/api/system/core/role/roleTypes.ts:1-11

**响应数据:**

```typescript
/**
 * 角色信息视图类型
 */
interface SysRoleVo {
  /** 角色ID */
  roleId: string | number

  /** 角色名称 */
  roleName: string

  /** 角色权限字符串 */
  roleKey: string

  /** 显示顺序 */
  roleSort: number

  /** 数据范围(1:全部 2:自定义 3:本部门 4:本部门及以下) */
  dataScope: string

  /** 菜单树选择项是否关联显示 */
  menuCheckStrictly: boolean

  /** 部门树选择项是否关联显示 */
  deptCheckStrictly: boolean

  /** 角色状态 */
  status: string

  /** 备注 */
  remark: any

  /** 标记 */
  flag: boolean

  /** 菜单id数组 */
  menuIds: Array<string | number>

  /** 部门id数组 */
  deptIds: Array<string | number>

  /** 是否管理员 */
  admin: boolean
}
```

参考: src/api/system/core/role/roleTypes.ts:49-89

**完整使用示例:**

```vue
<template>
  <view class="roles-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-search
        v-model="searchKeyword"
        placeholder="搜索角色名称"
        @search="handleSearch"
        @clear="handleClear"
      />
    </view>

    <!-- 角色列表 -->
    <view class="roles-list">
      <view v-if="isLoading && rolesList.length === 0" class="loading">
        <wd-loading type="spinner" />
      </view>

      <view v-else-if="rolesList.length === 0" class="empty">
        <wd-empty description="暂无角色数据" />
      </view>

      <view v-else class="roles-items">
        <view
          v-for="role in rolesList"
          :key="role.roleId"
          class="role-item"
          @click="handleRoleClick(role)"
        >
          <view class="role-header">
            <text class="role-name">{{ role.roleName }}</text>
            <wd-tag
              :type="role.status === '0' ? 'success' : 'danger'"
              size="small"
            >
              {{ role.status === '0' ? '正常' : '停用' }}
            </wd-tag>
          </view>

          <view class="role-info">
            <text class="info-label">权限字符:</text>
            <text class="info-value">{{ role.roleKey }}</text>
          </view>

          <view class="role-info">
            <text class="info-label">数据权限:</text>
            <text class="info-value">{{ formatDataScope(role.dataScope) }}</text>
          </view>

          <view v-if="role.remark" class="role-remark">
            <text>{{ role.remark }}</text>
          </view>

          <view v-if="role.admin" class="admin-badge">
            <wd-icon name="crown" color="#faad14" />
            <text>管理员</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore" class="load-more" @click="loadMore">
        <wd-loading v-if="isLoadingMore" type="spinner" size="24" />
        <text v-else>加载更多</text>
      </view>

      <view v-else-if="rolesList.length > 0" class="no-more">
        没有更多了
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { pageRoles } from '@/api/system/core/role/roleApi'
import type { SysRoleVo, SysRoleQuery } from '@/api/system/core/role/roleTypes'
import { to } from '@/utils/to'

// 响应式数据
const rolesList = ref<SysRoleVo[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const searchKeyword = ref('')

// 分页参数
const pageParams = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

/**
 * 计算属性: 是否还有更多数据
 */
const hasMore = computed(() => {
  return rolesList.value.length < pageParams.total
})

/**
 * 加载角色列表
 */
const loadRolesList = async (isRefresh = false) => {
  if (isRefresh) {
    pageParams.pageNum = 1
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  // 构建查询参数
  const query: SysRoleQuery = {
    pageNum: pageParams.pageNum,
    pageSize: pageParams.pageSize,
  }

  // 添加搜索关键词
  if (searchKeyword.value) {
    query.roleName = searchKeyword.value
  }

  // 查询角色列表
  const [error, data] = await to(pageRoles(query))

  isLoading.value = false
  isLoadingMore.value = false

  if (error) {
    console.error('加载角色失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
    return
  }

  if (data) {
    // 更新分页信息
    pageParams.total = data.total

    if (isRefresh) {
      // 刷新: 替换列表
      rolesList.value = data.records
    } else {
      // 加载更多: 追加到列表
      rolesList.value.push(...data.records)
    }

    console.log('角色加载成功:', data.records.length, '总数:', data.total)
  }
}

/**
 * 格式化数据权限
 */
const formatDataScope = (dataScope: string): string => {
  const scopeMap: Record<string, string> = {
    '1': '全部数据权限',
    '2': '自定义数据权限',
    '3': '本部门数据权限',
    '4': '本部门及以下数据权限',
  }
  return scopeMap[dataScope] || '未知'
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  console.log('搜索:', searchKeyword.value)
  loadRolesList(true)
}

/**
 * 处理清除搜索
 */
const handleClear = () => {
  searchKeyword.value = ''
  loadRolesList(true)
}

/**
 * 加载更多
 */
const loadMore = () => {
  if (!hasMore.value || isLoadingMore.value) return

  pageParams.pageNum++
  loadRolesList(false)
}

/**
 * 处理角色点击
 */
const handleRoleClick = (role: SysRoleVo) => {
  console.log('点击角色:', role.roleName)

  // 跳转到角色详情页
  uni.navigateTo({
    url: `/pages/system/role/detail?id=${role.roleId}`,
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadRolesList(true)
})
</script>

<style lang="scss" scoped>
.roles-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  padding: 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.roles-list {
  padding: 20rpx;
}

.loading,
.empty {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}

.roles-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.role-item {
  position: relative;
  padding: 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.role-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.role-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.role-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.info-label {
  font-size: 28rpx;
  color: #999;
}

.info-value {
  font-size: 28rpx;
  color: #666;
}

.role-remark {
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  margin-top: 12rpx;
}

.admin-badge {
  position: absolute;
  top: 32rpx;
  right: 100rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  background-color: #fff7e6;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #faad14;
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #666;
}

.no-more {
  padding: 40rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>
```

**使用说明:**

- **分页查询**: 支持分页加载,避免一次加载大量数据影响性能
- **搜索过滤**: 支持按角色名称模糊搜索
- **数据权限**: 显示角色的数据权限范围(全部/自定义/本部门/本部门及以下)
- **状态标识**: 清晰标识角色的启用/停用状态
- **管理员标记**: 管理员角色有特殊标识
- **详情跳转**: 点击角色可跳转到详情页查看完整信息

参考: src/api/system/core/role/roleApi.ts:4-10

---

### 6. getSystemFeatures - 获取系统功能配置

获取系统功能开关配置,用于动态控制应用功能的启用状态。

**请求方式:** GET

**请求路径:** `/common/system/features`

**请求参数:** 无

**响应数据:**

```typescript
/**
 * 系统功能配置
 */
interface SystemFeature {
  /** langchain4j 是否启用 */
  langchain4jEnabled: boolean
  /** WebSocket 是否启用 */
  websocketEnabled: boolean
  /** SSE (Server-Sent Events) 是否启用 */
  sseEnabled: boolean
}
```

参考: src/api/common/system/feature/featureApi.ts:7-17

**完整使用示例:**

```vue
<template>
  <view class="features-page">
    <!-- 功能配置列表 -->
    <view class="features-list">
      <view class="feature-item">
        <view class="feature-info">
          <text class="feature-name">AI 对话功能</text>
          <text class="feature-desc">基于 langchain4j 的智能对话服务</text>
        </view>
        <wd-switch
          :model-value="features.langchain4jEnabled"
          :disabled="true"
        />
      </view>

      <view class="feature-item">
        <view class="feature-info">
          <text class="feature-name">实时消息推送</text>
          <text class="feature-desc">基于 WebSocket 的实时通信</text>
        </view>
        <wd-switch
          :model-value="features.websocketEnabled"
          :disabled="true"
        />
      </view>

      <view class="feature-item">
        <view class="feature-info">
          <text class="feature-name">服务器推送事件</text>
          <text class="feature-desc">基于 SSE 的实时数据流</text>
        </view>
        <wd-switch
          :model-value="features.sseEnabled"
          :disabled="true"
        />
      </view>
    </view>

    <!-- 功能说明 -->
    <view class="features-note">
      <wd-icon name="info" />
      <text>系统功能开关由服务器端控制,客户端仅展示当前状态</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { getSystemFeatures } from '@/api/common/system/feature/featureApi'
import type { SystemFeature } from '@/api/common/system/feature/featureApi'
import { to } from '@/utils/to'
import { cache } from '@/utils/cache'

// 系统功能配置
const features = reactive<SystemFeature>({
  langchain4jEnabled: false,
  websocketEnabled: false,
  sseEnabled: false,
})

/**
 * 加载系统功能配置
 */
const loadSystemFeatures = async () => {
  // 先从缓存读取
  const cachedFeatures = cache.get<SystemFeature>('systemFeatures')
  if (cachedFeatures) {
    Object.assign(features, cachedFeatures)
    console.log('从缓存加载系统功能配置:', cachedFeatures)
  }

  // 从服务器获取最新配置
  const [error, data] = await to(getSystemFeatures())

  if (error) {
    console.error('加载系统功能配置失败:', error)
    if (!cachedFeatures) {
      uni.showToast({ title: '加载配置失败', icon: 'none' })
    }
    return
  }

  if (data) {
    // 更新功能配置
    Object.assign(features, data)

    // 缓存配置(缓存1小时)
    cache.set('systemFeatures', data, 3600)

    console.log('系统功能配置:', data)
  }
}

/**
 * 检查功能是否启用
 */
const isFeatureEnabled = (featureName: keyof SystemFeature): boolean => {
  return features[featureName] || false
}

// 组件挂载时加载配置
onMounted(() => {
  loadSystemFeatures()
})

// 导出功能检查函数
defineExpose({
  isFeatureEnabled,
  features,
})
</script>

<style lang="scss" scoped>
.features-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 32rpx;
}

.features-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.feature-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-right: 32rpx;
}

.feature-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.feature-desc {
  font-size: 26rpx;
  color: #999;
}

.features-note {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
```

**使用说明:**

- **无需认证**: 该接口无需用户登录,可在应用启动时调用
- **跳过等待**: 使用 `skipWait: true` 参数,避免等待租户初始化
- **功能控制**: 根据配置动态显示或隐藏相关功能入口
- **缓存策略**: 建议缓存1小时,减少频繁请求
- **灵活扩展**: 可以根据业务需要添加更多功能开关
- **统一管理**: 服务器端集中管理功能开关,便于灰度发布和A/B测试

参考: src/api/common/system/feature/featureApi.ts:19-36

---

## 完整类型定义

### 字典相关类型

```typescript
/**
 * 字典数据查询类型
 */
export interface SysDictDataQuery extends PageQuery {
  dictType?: string
  dictLabel?: string
  status?: string
  createTime?: string
}

/**
 * 字典数据表单类型
 */
export interface SysDictDataBo {
  dictDataId?: string | number
  dictType?: string
  dictLabel?: string
  dictValue?: string
  cssClass?: string
  listClass?: string
  dictSort?: number
  status?: string
  remark?: string
}

/**
 * 字典数据视图类型
 */
export interface SysDictDataVo {
  dictDataId: string | number
  dictLabel: string
  dictValue: string
  cssClass: string
  listClass: string
  dictSort: number
  status: string
  remark: string
}
```

参考: src/api/system/dict/dictData/dictDataTypes.ts:1-72

### 手机号绑定类型

```typescript
/**
 * 手机号绑定请求参数
 */
export interface PhoneBindBo {
  platform?: string
  code: string
}

/**
 * 手机号绑定返回结果
 */
export interface PhoneBindVo {
  phone: string
}
```

参考: src/api/app/phone/phoneTypes.ts:1-18

### 角色相关类型

```typescript
/**
 * 角色信息查询类型
 */
export interface SysRoleQuery extends PageQuery {
  roleName?: string
  roleKey?: string
  status?: string
}

/**
 * 角色信息视图类型
 */
export interface SysRoleVo {
  roleId: string | number
  roleName: string
  roleKey: string
  roleSort: number
  dataScope: string
  menuCheckStrictly: boolean
  deptCheckStrictly: boolean
  status: string
  remark: any
  flag: boolean
  menuIds: Array<string | number>
  deptIds: Array<string | number>
  admin: boolean
}
```

参考: src/api/system/core/role/roleTypes.ts:1-89

### 系统功能配置类型

```typescript
/**
 * 系统功能配置
 */
export interface SystemFeature {
  langchain4jEnabled: boolean
  websocketEnabled: boolean
  sseEnabled: boolean
}
```

参考: src/api/common/system/feature/featureApi.ts:7-17

---

## 最佳实践

### 1. 字典数据缓存策略

字典数据变化不频繁,应采用多级缓存策略:

```typescript
// ✅ 推荐: 内存 + 本地双层缓存
const dictCache = new Map<string, SysDictDataVo[]>()

const loadDict = async (dictType: string) => {
  // 1. 内存缓存
  if (dictCache.has(dictType)) {
    return dictCache.get(dictType)!
  }

  // 2. 本地缓存
  const cached = cache.get<SysDictDataVo[]>(`dict_${dictType}`)
  if (cached) {
    dictCache.set(dictType, cached)
    return cached
  }

  // 3. 服务器请求
  const [error, data] = await to(listDictDatasByDictType(dictType))
  if (!error && data) {
    const validData = data.filter((item) => item.status === '0')
    dictCache.set(dictType, validData)
    cache.set(`dict_${dictType}`, validData, 24 * 3600)
    return validData
  }

  return []
}

// ❌ 不推荐: 每次都请求
const loadDict = async (dictType: string) => {
  const [error, data] = await to(listDictDatasByDictType(dictType))
  return data || []
}
```

参考: src/api/system/dict/dictData/dictDataApi.ts:8-10

### 2. 手机号格式化显示

手机号应格式化显示,保护用户隐私:

```typescript
// ✅ 推荐: 中间4位显示为 *
const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 示例: 13812345678 => 138****5678

// ❌ 不推荐: 直接显示完整手机号
const formatPhone = (phone: string): string => {
  return phone
}
```

参考: src/api/app/phone/phoneApi.ts:9-11

### 3. 功能开关动态控制

根据系统配置动态显示或隐藏功能:

```typescript
// ✅ 推荐: 根据配置控制功能入口
const showAIChat = computed(() => {
  return features.langchain4jEnabled
})

const showRealtime = computed(() => {
  return features.websocketEnabled || features.sseEnabled
})

// 在模板中使用
<view v-if="showAIChat" class="ai-chat-entry">
  AI 对话
</view>

// ❌ 不推荐: 硬编码功能开关
const showAIChat = true // 无法动态控制
```

参考: src/api/common/system/feature/featureApi.ts:23-36

### 4. 角色权限本地缓存

用户的角色信息可以缓存,减少频繁请求:

```typescript
// ✅ 推荐: 缓存用户角色信息
const loadUserRoles = async () => {
  const cachedRoles = cache.get<SysRoleVo[]>('userRoles')
  if (cachedRoles) {
    return cachedRoles
  }

  const [error, data] = await to(getRoleOptions())
  if (!error && data) {
    cache.set('userRoles', data, 30 * 60) // 缓存30分钟
    return data
  }

  return []
}

// ❌ 不推荐: 每次都请求角色信息
const loadUserRoles = async () => {
  const [error, data] = await to(getRoleOptions())
  return data || []
}
```

参考: src/api/system/core/role/roleApi.ts:13-19

### 5. 字典标签格式化

提供统一的字典标签格式化工具函数:

```typescript
// ✅ 推荐: 封装格式化函数
const formatDictLabel = (
  dictType: string,
  dictValue: string,
  defaultLabel = '未知',
): string => {
  const dictData = dictCache.get(dictType)
  if (!dictData) return defaultLabel

  const item = dictData.find((d) => d.dictValue === dictValue)
  return item?.dictLabel || defaultLabel
}

// 使用
<text>{{ formatDictLabel('sys_user_sex', userInfo.sex) }}</text>

// ❌ 不推荐: 每次都查找字典
<text>
  {{ sexOptions.find(item => item.dictValue === userInfo.sex)?.dictLabel }}
</text>
```

参考: src/api/system/dict/dictData/dictDataApi.ts:8-10

---

## 注意事项

### 1. 字典数据状态过滤

使用字典数据时务必过滤已停用的数据:

```typescript
// ✅ 正确: 只使用启用的字典项
const validData = data.filter((item) => item.status === '0')

// ❌ 错误: 不过滤状态,可能显示已停用的选项
const validData = data
```

参考: src/api/system/dict/dictData/dictDataTypes.ts:46-72

### 2. 手机号绑定平台限制

手机号快捷绑定功能仅支持微信小程序:

```typescript
// ✅ 正确: 检查平台支持
// #ifdef MP-WEIXIN
<button open-type="getPhoneNumber" @getphonenumber="handleBind">
  绑定手机号
</button>
// #endif

// #ifndef MP-WEIXIN
<text>该功能仅支持微信小程序</text>
// #endif

// ❌ 错误: 不检查平台,H5会报错
<button open-type="getPhoneNumber">绑定手机号</button>
```

参考: src/api/app/phone/phoneApi.ts:3-11

### 3. 系统配置初始化时机

系统功能配置应在应用启动早期加载:

```typescript
// ✅ 推荐: 在 App.vue 的 onLaunch 中加载
onLaunch(async () => {
  await loadSystemFeatures()
  // 其他初始化逻辑
})

// ❌ 不推荐: 使用时才加载,可能导致功能闪烁
const showFeature = async () => {
  const features = await loadSystemFeatures()
  // ...
}
```

参考: src/api/common/system/feature/featureApi.ts:23-36

### 4. 角色数据权限说明

角色的数据权限范围需要正确理解:

```typescript
/**
 * 数据权限范围说明
 * 1: 全部数据权限 - 可以查看所有数据
 * 2: 自定义数据权限 - 可以查看指定部门的数据(由 deptIds 指定)
 * 3: 本部门数据权限 - 只能查看所属部门的数据
 * 4: 本部门及以下数据权限 - 可以查看本部门及下级部门的数据
 */

// ✅ 正确: 根据数据权限过滤数据
const canViewData = (dataUserId: string) => {
  const userRole = userStore.roles[0]

  switch (userRole.dataScope) {
    case '1': // 全部数据
      return true
    case '2': // 自定义数据
      return userRole.deptIds.includes(dataUserDeptId)
    case '3': // 本部门
      return dataUserDeptId === userStore.deptId
    case '4': // 本部门及以下
      return isSubDept(userStore.deptId, dataUserDeptId)
    default:
      return false
  }
}
```

参考: src/api/system/core/role/roleTypes.ts:63-64

### 5. 字典缓存更新策略

字典数据更新时需要清除缓存:

```typescript
// ✅ 推荐: 字典更新后清除缓存
const updateDictData = async (data: SysDictDataBo) => {
  const [error] = await to(updateDictData(data))

  if (!error) {
    // 清除相关字典缓存
    dictCache.delete(data.dictType!)
    cache.remove(`dict_${data.dictType}`)

    // 重新加载字典
    await loadDict(data.dictType!)
  }
}

// ❌ 不推荐: 更新后不清除缓存,用户看到旧数据
const updateDictData = async (data: SysDictDataBo) => {
  await to(updateDictData(data))
}
```

参考: src/api/system/dict/dictData/dictDataApi.ts:40-46

### 6. 解绑手机号风险提示

解绑手机号前应充分告知用户风险:

```typescript
// ✅ 推荐: 详细说明解绑影响
uni.showModal({
  title: '解绑手机号',
  content: '解绑后将无法:\n1. 接收重要通知\n2. 使用手机号登录\n3. 通过手机号找回密码\n\n确定要解绑吗?',
  confirmText: '确定解绑',
  confirmColor: '#ff4d4f',
  success: async (res) => {
    if (res.confirm) {
      await handleUnbind()
    }
  },
})

// ❌ 不推荐: 简单确认,用户可能误操作
uni.showModal({
  title: '提示',
  content: '确定解绑吗?',
  success: async (res) => {
    if (res.confirm) {
      await handleUnbind()
    }
  },
})
```

参考: src/api/app/phone/phoneApi.ts:28-30

### 7. 字典样式类应用

字典项的样式类应正确应用:

```typescript
// ✅ 推荐: 动态应用样式类
<view
  v-for="item in dictData"
  :key="item.dictValue"
  :class="['dict-item', item.listClass]"
>
  {{ item.dictLabel }}
</view>

// CSS 中定义样式类
.dict-item {
  &.primary { background-color: #1890ff; }
  &.success { background-color: #52c41a; }
  &.warning { background-color: #faad14; }
  &.danger { background-color: #ff4d4f; }
}

// ❌ 不推荐: 忽略字典样式配置
<view class="dict-item">{{ item.dictLabel }}</view>
```

参考: src/api/system/dict/dictData/dictDataTypes.ts:58-61

### 8. 角色管理员标识

管理员角色需要特殊处理,不能删除或禁用:

```typescript
// ✅ 推荐: 检查管理员标识
const canDeleteRole = (role: SysRoleVo): boolean => {
  if (role.admin) {
    uni.showToast({ title: '不能删除管理员角色', icon: 'none' })
    return false
  }
  return true
}

const canDisableRole = (role: SysRoleVo): boolean => {
  if (role.admin) {
    uni.showToast({ title: '不能停用管理员角色', icon: 'none' })
    return false
  }
  return true
}

// ❌ 不推荐: 不检查管理员,可能导致系统异常
const deleteRole = async (roleId: string) => {
  await deleteRoles(roleId)
}
```

参考: src/api/system/core/role/roleTypes.ts:88

---

通过合理使用这些系统接口,可以实现完整的系统管理功能,包括字典数据管理、用户手机号绑定、角色权限控制和系统功能配置等。建议结合业务需求,灵活运用缓存策略和权限控制,提升应用的性能和安全性。
