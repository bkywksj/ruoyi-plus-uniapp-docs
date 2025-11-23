# 权限管理插件

## 介绍

权限管理插件为 RuoYi-Plus-UniApp 提供完整的系统权限管理能力,支持动态权限请求、权限状态检查、权限引导和跨平台权限适配等功能。通过统一的权限管理 API,开发者可以轻松处理相机、定位、相册、蓝牙、通知等系统权限,确保应用在各平台上正确获取和使用权限。

插件采用异步 API 设计,支持权限检查、动态申请、状态监听和用户引导等完整流程。同时提供了权限说明弹窗、设置页引导等用户友好的交互方式,帮助开发者构建符合各平台规范的权限管理体验。

**核心特性:**

- **跨平台适配** - 统一封装各平台权限 API,自动处理平台差异
- **动态权限** - 支持运行时动态请求权限,符合最新隐私规范
- **状态检查** - 提供权限状态查询,支持精细化权限管理
- **用户引导** - 内置权限说明和设置页引导,优化用户体验
- **类型安全** - 完整的 TypeScript 类型定义,提供良好的开发体验
- **批量处理** - 支持同时请求多个权限,简化权限管理流程

## 平台支持

| 权限类型 | App | H5 | 微信小程序 | 支付宝小程序 | 说明 |
|---------|-----|-----|-----------|-------------|------|
| 相机 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| 相册 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| 定位 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| 麦克风 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| 通知 | ✅ | ⚠️ | ✅ | ✅ | H5 需浏览器支持 |
| 蓝牙 | ✅ | ❌ | ✅ | ✅ | H5 不支持 |
| 通讯录 | ✅ | ❌ | ❌ | ❌ | 仅 App 支持 |
| 日历 | ✅ | ❌ | ❌ | ❌ | 仅 App 支持 |
| 后台定位 | ✅ | ❌ | ✅ | ❌ | App/微信小程序 |

## 基本用法

### 检查权限状态

在使用需要权限的功能前,先检查权限状态:

```vue
<template>
  <view class="permission-demo">
    <wd-button @click="checkCameraPermission">检查相机权限</wd-button>
    <text class="status">权限状态: {{ permissionStatus }}</text>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const permissionStatus = ref('未检查')

// 检查相机权限
const checkCameraPermission = async () => {
  try {
    // #ifdef APP-PLUS
    const result = await uni.authorize({
      scope: 'scope.camera'
    })
    permissionStatus.value = '已授权'
    // #endif

    // #ifdef MP-WEIXIN
    uni.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera']) {
          permissionStatus.value = '已授权'
        } else if (res.authSetting['scope.camera'] === false) {
          permissionStatus.value = '已拒绝'
        } else {
          permissionStatus.value = '未请求'
        }
      }
    })
    // #endif

    // #ifdef H5
    // H5 使用 Permissions API
    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
    permissionStatus.value = permission.state
    // #endif
  } catch (error) {
    permissionStatus.value = '检查失败'
    console.error('检查权限失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.permission-demo {
  padding: 32rpx;
}

.status {
  display: block;
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

### 请求单个权限

请求单个权限并处理结果:

```vue
<template>
  <view class="request-demo">
    <wd-button type="primary" @click="requestCameraPermission">
      请求相机权限
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
// 请求相机权限
const requestCameraPermission = async () => {
  try {
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU
    await uni.authorize({
      scope: 'scope.camera'
    })
    uni.showToast({ title: '授权成功', icon: 'success' })
    // #endif

    // #ifdef APP-PLUS
    // App 端使用 plus API
    const result = await requestAppPermission('camera')
    if (result) {
      uni.showToast({ title: '授权成功', icon: 'success' })
    } else {
      showPermissionDeniedDialog('相机')
    }
    // #endif

    // #ifdef H5
    // H5 端通过 getUserMedia 触发权限请求
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(track => track.stop())
    uni.showToast({ title: '授权成功', icon: 'success' })
    // #endif
  } catch (error: any) {
    console.error('请求权限失败:', error)

    // 处理用户拒绝
    if (error.errMsg?.includes('deny') || error.errMsg?.includes('auth')) {
      showPermissionDeniedDialog('相机')
    } else {
      uni.showToast({ title: '请求失败', icon: 'error' })
    }
  }
}

// App 端请求权限
const requestAppPermission = (permission: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // #ifdef APP-PLUS
    plus.android?.requestPermissions?.(
      [`android.permission.CAMERA`],
      (result) => {
        resolve(result.granted.length > 0)
      },
      (error) => {
        resolve(false)
      }
    )
    // #endif
    // #ifndef APP-PLUS
    resolve(true)
    // #endif
  })
}

// 显示权限被拒绝对话框
const showPermissionDeniedDialog = (permissionName: string) => {
  uni.showModal({
    title: '权限提示',
    content: `${permissionName}权限已被拒绝,请在设置中手动开启`,
    confirmText: '去设置',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        uni.openSetting({})
      }
    }
  })
}
</script>
```

### 请求定位权限

定位权限是最常用的权限之一:

```vue
<template>
  <view class="location-demo">
    <wd-button @click="requestLocationPermission">请求定位权限</wd-button>
    <view class="location-info" v-if="location">
      <text>经度: {{ location.longitude }}</text>
      <text>纬度: {{ location.latitude }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Location {
  longitude: number
  latitude: number
}

const location = ref<Location | null>(null)

// 请求定位权限并获取位置
const requestLocationPermission = async () => {
  try {
    // 先检查权限
    // #ifdef MP-WEIXIN
    const setting = await uni.getSetting()
    if (setting.authSetting['scope.userLocation'] === false) {
      // 权限被拒绝,引导用户去设置
      showLocationPermissionGuide()
      return
    }
    // #endif

    // 请求位置(会自动触发权限请求)
    const result = await uni.getLocation({
      type: 'gcj02',
      isHighAccuracy: true
    })

    location.value = {
      longitude: result.longitude,
      latitude: result.latitude
    }

    uni.showToast({ title: '定位成功', icon: 'success' })
  } catch (error: any) {
    console.error('定位失败:', error)

    if (error.errMsg?.includes('auth deny') ||
        error.errMsg?.includes('authorize')) {
      showLocationPermissionGuide()
    } else {
      uni.showToast({ title: '定位失败', icon: 'error' })
    }
  }
}

// 显示定位权限引导
const showLocationPermissionGuide = () => {
  uni.showModal({
    title: '定位权限',
    content: '需要获取您的位置信息来提供服务,请在设置中开启定位权限',
    confirmText: '去设置',
    success: (res) => {
      if (res.confirm) {
        uni.openSetting({
          success: (settingRes) => {
            // 检查用户是否开启了权限
            if (settingRes.authSetting['scope.userLocation']) {
              // 重新请求
              requestLocationPermission()
            }
          }
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.location-demo {
  padding: 32rpx;
}

.location-info {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;

  text {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 8rpx;
  }
}
</style>
```

## 权限类型

### 常用权限 Scope

小程序平台支持的权限 scope:

| Scope | 说明 | 对应 API |
|-------|------|----------|
| `scope.userLocation` | 地理位置 | `uni.getLocation` |
| `scope.userLocationBackground` | 后台定位 | `uni.startLocationUpdateBackground` |
| `scope.record` | 麦克风 | `uni.startRecord` |
| `scope.camera` | 相机 | `uni.chooseImage/Video` |
| `scope.bluetooth` | 蓝牙 | `uni.openBluetoothAdapter` |
| `scope.writePhotosAlbum` | 保存到相册 | `uni.saveImageToPhotosAlbum` |
| `scope.address` | 通讯地址 | `uni.chooseAddress` |
| `scope.invoiceTitle` | 发票抬头 | `uni.chooseInvoiceTitle` |
| `scope.invoice` | 获取发票 | `uni.chooseInvoice` |
| `scope.werun` | 微信运动 | `uni.getWeRunData` |
| `scope.userInfo` | 用户信息 | `uni.getUserProfile` |

### App 端权限

App 端(Android/iOS)支持的权限:

#### Android 权限

```typescript
// 常用 Android 权限
const ANDROID_PERMISSIONS = {
  // 相机
  CAMERA: 'android.permission.CAMERA',

  // 存储
  READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
  WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',

  // 定位
  ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
  ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION',

  // 录音
  RECORD_AUDIO: 'android.permission.RECORD_AUDIO',

  // 通讯录
  READ_CONTACTS: 'android.permission.READ_CONTACTS',
  WRITE_CONTACTS: 'android.permission.WRITE_CONTACTS',

  // 电话
  READ_PHONE_STATE: 'android.permission.READ_PHONE_STATE',
  CALL_PHONE: 'android.permission.CALL_PHONE',

  // 日历
  READ_CALENDAR: 'android.permission.READ_CALENDAR',
  WRITE_CALENDAR: 'android.permission.WRITE_CALENDAR',

  // 蓝牙
  BLUETOOTH: 'android.permission.BLUETOOTH',
  BLUETOOTH_ADMIN: 'android.permission.BLUETOOTH_ADMIN',
  BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
  BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
}
```

#### iOS 权限

iOS 权限需要在 `manifest.json` 中配置说明:

```json
{
  "app-plus": {
    "distribute": {
      "ios": {
        "privacyDescription": {
          "NSCameraUsageDescription": "用于拍照和视频录制",
          "NSPhotoLibraryUsageDescription": "用于选择和保存图片",
          "NSPhotoLibraryAddUsageDescription": "用于保存图片到相册",
          "NSLocationWhenInUseUsageDescription": "用于获取您的位置信息",
          "NSLocationAlwaysAndWhenInUseUsageDescription": "用于后台位置更新",
          "NSMicrophoneUsageDescription": "用于语音录制",
          "NSContactsUsageDescription": "用于读取通讯录",
          "NSCalendarsUsageDescription": "用于访问日历",
          "NSBluetoothAlwaysUsageDescription": "用于蓝牙设备连接",
          "NSBluetoothPeripheralUsageDescription": "用于蓝牙外设连接"
        }
      }
    }
  }
}
```

## 高级用法

### 封装权限管理工具

创建统一的权限管理工具:

```typescript
// composables/usePermission.ts
import { ref } from 'vue'

// 权限状态类型
export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown'

// 权限类型
export type PermissionType =
  | 'camera'
  | 'location'
  | 'microphone'
  | 'album'
  | 'notification'
  | 'bluetooth'
  | 'contacts'
  | 'calendar'

// Scope 映射
const SCOPE_MAP: Record<PermissionType, string> = {
  camera: 'scope.camera',
  location: 'scope.userLocation',
  microphone: 'scope.record',
  album: 'scope.writePhotosAlbum',
  notification: '',
  bluetooth: 'scope.bluetooth',
  contacts: 'scope.address',
  calendar: ''
}

// 权限名称映射
const PERMISSION_NAME_MAP: Record<PermissionType, string> = {
  camera: '相机',
  location: '定位',
  microphone: '麦克风',
  album: '相册',
  notification: '通知',
  bluetooth: '蓝牙',
  contacts: '通讯录',
  calendar: '日历'
}

export const usePermission = () => {
  const status = ref<PermissionStatus>('unknown')

  /**
   * 检查权限状态
   */
  const check = async (type: PermissionType): Promise<PermissionStatus> => {
    // #ifdef MP-WEIXIN || MP-ALIPAY
    return new Promise((resolve) => {
      const scope = SCOPE_MAP[type]
      if (!scope) {
        resolve('unknown')
        return
      }

      uni.getSetting({
        success: (res) => {
          const setting = res.authSetting[scope]
          if (setting === true) {
            status.value = 'granted'
            resolve('granted')
          } else if (setting === false) {
            status.value = 'denied'
            resolve('denied')
          } else {
            status.value = 'prompt'
            resolve('prompt')
          }
        },
        fail: () => {
          status.value = 'unknown'
          resolve('unknown')
        }
      })
    })
    // #endif

    // #ifdef APP-PLUS
    return new Promise((resolve) => {
      // App 端检查权限
      resolve('unknown')
    })
    // #endif

    // #ifdef H5
    return new Promise(async (resolve) => {
      try {
        const permissionName = type === 'location' ? 'geolocation' : type
        const result = await navigator.permissions.query({
          name: permissionName as PermissionName
        })
        status.value = result.state as PermissionStatus
        resolve(result.state as PermissionStatus)
      } catch {
        status.value = 'unknown'
        resolve('unknown')
      }
    })
    // #endif
  }

  /**
   * 请求权限
   */
  const request = async (type: PermissionType): Promise<boolean> => {
    const currentStatus = await check(type)

    if (currentStatus === 'granted') {
      return true
    }

    if (currentStatus === 'denied') {
      await openSettings(type)
      return false
    }

    // #ifdef MP-WEIXIN || MP-ALIPAY
    return new Promise((resolve) => {
      const scope = SCOPE_MAP[type]
      if (!scope) {
        resolve(false)
        return
      }

      uni.authorize({
        scope,
        success: () => {
          status.value = 'granted'
          resolve(true)
        },
        fail: () => {
          status.value = 'denied'
          resolve(false)
        }
      })
    })
    // #endif

    // #ifdef APP-PLUS
    return requestAppPermission(type)
    // #endif

    // #ifdef H5
    return requestH5Permission(type)
    // #endif
  }

  /**
   * 打开设置页
   */
  const openSettings = (type?: PermissionType): Promise<void> => {
    return new Promise((resolve) => {
      const name = type ? PERMISSION_NAME_MAP[type] : '相关'

      uni.showModal({
        title: '权限提示',
        content: `${name}权限已被禁止,请在设置中手动开启`,
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting({
              success: () => resolve(),
              fail: () => resolve()
            })
          } else {
            resolve()
          }
        }
      })
    })
  }

  /**
   * 显示权限说明
   */
  const showRationale = (type: PermissionType, reason: string): Promise<boolean> => {
    const name = PERMISSION_NAME_MAP[type]

    return new Promise((resolve) => {
      uni.showModal({
        title: `${name}权限说明`,
        content: reason,
        confirmText: '同意',
        cancelText: '拒绝',
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }

  /**
   * App 端请求权限
   */
  const requestAppPermission = async (type: PermissionType): Promise<boolean> => {
    // #ifdef APP-PLUS
    return new Promise((resolve) => {
      const permissions = getAndroidPermissions(type)

      plus.android?.requestPermissions?.(
        permissions,
        (result) => {
          if (result.granted.length > 0) {
            status.value = 'granted'
            resolve(true)
          } else {
            status.value = 'denied'
            resolve(false)
          }
        },
        () => {
          status.value = 'denied'
          resolve(false)
        }
      )
    })
    // #endif
    // #ifndef APP-PLUS
    return false
    // #endif
  }

  /**
   * H5 端请求权限
   */
  const requestH5Permission = async (type: PermissionType): Promise<boolean> => {
    // #ifdef H5
    try {
      if (type === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        status.value = 'granted'
        return true
      }

      if (type === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        status.value = 'granted'
        return true
      }

      if (type === 'location') {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              status.value = 'granted'
              resolve(true)
            },
            () => {
              status.value = 'denied'
              resolve(false)
            }
          )
        })
      }

      if (type === 'notification') {
        const result = await Notification.requestPermission()
        status.value = result === 'granted' ? 'granted' : 'denied'
        return result === 'granted'
      }

      return false
    } catch {
      status.value = 'denied'
      return false
    }
    // #endif
    // #ifndef H5
    return false
    // #endif
  }

  /**
   * 获取 Android 权限列表
   */
  const getAndroidPermissions = (type: PermissionType): string[] => {
    switch (type) {
      case 'camera':
        return ['android.permission.CAMERA']
      case 'location':
        return [
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.ACCESS_COARSE_LOCATION'
        ]
      case 'microphone':
        return ['android.permission.RECORD_AUDIO']
      case 'album':
        return [
          'android.permission.READ_EXTERNAL_STORAGE',
          'android.permission.WRITE_EXTERNAL_STORAGE'
        ]
      case 'contacts':
        return ['android.permission.READ_CONTACTS']
      case 'calendar':
        return [
          'android.permission.READ_CALENDAR',
          'android.permission.WRITE_CALENDAR'
        ]
      case 'bluetooth':
        return [
          'android.permission.BLUETOOTH',
          'android.permission.BLUETOOTH_ADMIN'
        ]
      default:
        return []
    }
  }

  return {
    status,
    check,
    request,
    openSettings,
    showRationale
  }
}
```

### 使用权限管理工具

```vue
<template>
  <view class="permission-tool-demo">
    <wd-button @click="handleCamera">使用相机</wd-button>
    <wd-button @click="handleLocation">获取位置</wd-button>
    <wd-button @click="handleMicrophone">录制音频</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { usePermission } from '@/composables/usePermission'

const { check, request, showRationale } = usePermission()

// 使用相机
const handleCamera = async () => {
  const status = await check('camera')

  if (status === 'prompt') {
    const agreed = await showRationale(
      'camera',
      '我们需要使用相机来拍摄照片,用于个人资料或内容发布'
    )

    if (!agreed) return
  }

  const granted = await request('camera')

  if (granted) {
    takePhoto()
  }
}

// 获取位置
const handleLocation = async () => {
  const status = await check('location')

  if (status === 'prompt') {
    const agreed = await showRationale(
      'location',
      '我们需要获取您的位置信息来推荐附近的服务'
    )

    if (!agreed) return
  }

  const granted = await request('location')

  if (granted) {
    getLocation()
  }
}

// 录制音频
const handleMicrophone = async () => {
  const granted = await request('microphone')

  if (granted) {
    startRecording()
  }
}

const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res) => {
      console.log('拍照成功:', res.tempFilePaths)
    }
  })
}

const getLocation = () => {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      console.log('位置:', res.latitude, res.longitude)
    }
  })
}

const startRecording = () => {
  const recorderManager = uni.getRecorderManager()
  recorderManager.start({
    duration: 60000,
    format: 'mp3'
  })
}
</script>
```

### 批量请求权限

```vue
<template>
  <view class="batch-permission-demo">
    <wd-button @click="requestMultiplePermissions">请求多个权限</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { usePermission, type PermissionType } from '@/composables/usePermission'

const { request } = usePermission()

const requestMultiplePermissions = async () => {
  const permissions: PermissionType[] = ['camera', 'location', 'microphone']

  const results: Record<string, boolean> = {}

  for (const permission of permissions) {
    results[permission] = await request(permission)
  }

  const granted = Object.entries(results)
    .filter(([, value]) => value)
    .map(([key]) => key)

  const denied = Object.entries(results)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (denied.length > 0) {
    uni.showModal({
      title: '权限提示',
      content: `以下权限未授权: ${denied.join(', ')}`,
      showCancel: false
    })
  } else {
    uni.showToast({ title: '所有权限已授权', icon: 'success' })
  }
}
</script>
```

### 通知权限

```vue
<template>
  <view class="notification-demo">
    <wd-button @click="requestNotificationPermission">
      开启通知
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
const requestNotificationPermission = async () => {
  // #ifdef APP-PLUS
  const isEnabled = plus.push.getClientInfo().clientid

  if (!isEnabled) {
    uni.showModal({
      title: '通知权限',
      content: '为了及时接收消息,请开启通知权限',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          if (plus.os.name === 'Android') {
            const main = plus.android.runtimeMainActivity()
            const Intent = plus.android.importClass('android.content.Intent')
            const Settings = plus.android.importClass('android.provider.Settings')

            const intent = new Intent()
            intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
            intent.putExtra('android.provider.extra.APP_PACKAGE', main.getPackageName())
            main.startActivity(intent)
          } else {
            plus.runtime.openURL('app-settings:')
          }
        }
      }
    })
  }
  // #endif

  // #ifdef H5
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      uni.showToast({ title: '通知已开启', icon: 'success' })
    }
  }
  // #endif

  // #ifdef MP-WEIXIN
  uni.requestSubscribeMessage({
    tmplIds: ['template_id_1', 'template_id_2'],
    success: (res) => {
      console.log('订阅结果:', res)
    }
  })
  // #endif
}
</script>
```

## API 参考

### PermissionType

```typescript
type PermissionType =
  | 'camera'
  | 'location'
  | 'microphone'
  | 'album'
  | 'notification'
  | 'bluetooth'
  | 'contacts'
  | 'calendar'
```

### PermissionStatus

```typescript
type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unknown'
```

### usePermission 返回值

```typescript
interface UsePermissionReturn {
  status: Ref<PermissionStatus>
  check: (type: PermissionType) => Promise<PermissionStatus>
  request: (type: PermissionType) => Promise<boolean>
  openSettings: (type?: PermissionType) => Promise<void>
  showRationale: (type: PermissionType, reason: string) => Promise<boolean>
}
```

## 最佳实践

### 1. 适时请求权限

```typescript
// 好的做法:在需要使用功能时请求权限
const handleScanQRCode = async () => {
  const granted = await request('camera')
  if (granted) {
    uni.scanCode({
      success: (res) => {
        console.log('扫码结果:', res.result)
      }
    })
  }
}
```

### 2. 提供权限说明

```typescript
const requestLocationWithReason = async () => {
  const status = await check('location')

  if (status === 'prompt') {
    const agreed = await showRationale(
      'location',
      '我们需要获取您的位置来推荐附近门店'
    )

    if (!agreed) return false
  }

  return await request('location')
}
```

### 3. 优雅处理拒绝

```typescript
const getLocationOrManualInput = async () => {
  const granted = await request('location')

  if (granted) {
    return await getLocationByGPS()
  } else {
    return await showCitySelector()
  }
}
```

## 常见问题

### 1. 小程序 scope 请求失败

**原因分析:**
- scope 名称拼写错误
- 平台不支持该 scope

**解决方案:**

```typescript
const requestScope = async (scope: string) => {
  try {
    await uni.authorize({ scope })
    return true
  } catch (error: any) {
    if (error.errMsg?.includes('scope')) {
      console.warn(`当前平台不支持 ${scope}`)
    }
    return false
  }
}
```

### 2. iOS 权限说明未配置

**解决方案:**

在 `manifest.json` 中配置 privacyDescription。

### 3. 权限被永久拒绝

**解决方案:**

```typescript
const handlePermanentlyDenied = async (type: PermissionType) => {
  const status = await check(type)

  if (status === 'denied') {
    uni.showModal({
      title: '权限被禁止',
      content: '请前往设置手动开启',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          uni.openSetting({})
        }
      }
    })
  }
}
```
