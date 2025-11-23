# 支付宝小程序适配

## 介绍

支付宝小程序是蚂蚁金服推出的小程序平台,拥有庞大的用户群体和完善的支付生态。RuoYi-Plus-UniApp 框架提供了完整的支付宝小程序适配方案,支持支付宝特有的支付、生活号、小程序云等功能。

**核心特性:**

- **支付能力** - 原生支付宝支付集成,支持多种交易类型
- **平台适配** - 针对支付宝特有 API 进行条件编译适配
- **样式兼容** - 处理支付宝小程序的样式隔离和渲染差异
- **分享功能** - 支持支付宝特有的分享面板
- **性能优化** - 针对支付宝渲染引擎进行性能优化

## 环境配置

### manifest.config.ts 配置

支付宝小程序的核心配置在 manifest.config.ts 文件中进行设置:

```typescript
// manifest.config.ts
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

export default defineManifestConfig({
  // 基础配置
  name: '应用名称',
  appid: '__UNI_APPID__',
  versionName: '1.0.0',
  versionCode: '100',

  /* 支付宝小程序配置 */
  'mp-alipay': {
    // 支付宝小程序 AppID
    appid: import.meta.env.VITE_ALIPAY_MINI_APP_ID,
    // 启用自定义组件模式
    usingComponents: true,
    // 样式隔离模式
    // shared: 样式共享
    // isolated: 样式隔离
    styleIsolation: 'shared',
  },
})
```

**配置说明:**

- `appid` - 支付宝小程序的 AppID,从支付宝开放平台获取
- `usingComponents` - 启用自定义组件模式,提升性能和兼容性
- `styleIsolation` - 样式隔离模式,`shared` 允许页面样式影响组件

### 环境变量配置

在 `.env` 文件中配置支付宝小程序相关环境变量:

```bash
# .env.development
VITE_ALIPAY_MINI_APP_ID=2021000000000000

# .env.production
VITE_ALIPAY_MINI_APP_ID=2021000000000001
```

### mini.project.json 配置

支付宝小程序项目配置文件:

```json
{
  "format": 2,
  "miniprogramRoot": "dist/dev/mp-alipay",
  "compileType": "mini",
  "compileOptions": {
    "component2": true,
    "typescript": true,
    "less": false,
    "enableNodeModulesES6Whitelist": true
  },
  "uploadExclude": [
    "node_modules/**",
    "*.map"
  ],
  "assetsInclude": [
    "./**/*.png",
    "./**/*.jpg",
    "./**/*.jpeg",
    "./**/*.gif",
    "./**/*.svg"
  ],
  "include": [
    "./**/*.json",
    "./**/*.axml",
    "./**/*.js",
    "./**/*.acss",
    "./**/*.sjs"
  ]
}
```

**关键配置:**

- `component2` - 启用新版自定义组件模式
- `typescript` - 启用 TypeScript 支持
- `enableNodeModulesES6Whitelist` - 允许 ES6 模块导入

## 开发环境搭建

### 安装支付宝小程序开发者工具

1. 访问支付宝开放平台下载开发者工具
2. 安装并启动开发者工具
3. 使用支付宝账号登录

### 项目导入

```bash
# 编译支付宝小程序
pnpm dev:mp-alipay

# 生产构建
pnpm build:mp-alipay
```

编译完成后,在开发者工具中导入项目:

1. 打开支付宝小程序开发者工具
2. 选择"打开项目"
3. 选择编译输出目录 `dist/dev/mp-alipay`
4. 等待项目加载完成

## 平台检测

### 平台工具类

项目提供了完整的平台检测工具,用于判断当前运行环境:

```typescript
// src/utils/platform.ts

// 基础平台检测
export const platform = __UNI_PLATFORM__
export const isApp = __UNI_PLATFORM__ === 'app'
export const isMp = __UNI_PLATFORM__.startsWith('mp-')
export const isMpAlipay = __UNI_PLATFORM__.startsWith('mp-alipay')

// 判断是否在支付宝内的 H5
export const isAlipayOfficialH5 = (() => {
  if (__UNI_PLATFORM__ !== 'h5') return false

  const ua = safeGetUserAgent()
  return ua.includes('alipayclient')
})()

/**
 * 检查是否在支付宝环境中 - 兼容所有平台
 */
export const isAlipayEnvironment = (): boolean => {
  // 支付宝小程序
  if (isMpAlipay) {
    return true
  }

  // H5 环境检查 User Agent
  if (__UNI_PLATFORM__ === 'h5') {
    const ua = safeGetUserAgent()
    return ua.includes('alipayclient')
  }

  return false
}

/**
 * 检查是否在开发环境或开发者工具中
 */
export const isInDevTools = (): boolean => {
  // H5 环境检查支付宝开发者工具
  if (__UNI_PLATFORM__ === 'h5') {
    const ua = safeGetUserAgent()
    if (ua.includes('alipaydevtools')) {
      return true
    }
  }

  return false
}

const PLATFORM = {
  platform,
  isMpAlipay,
  isAlipayOfficialH5,
  isAlipayEnvironment,
  isInDevTools,
}

export default PLATFORM
```

### 使用示例

```vue
<template>
  <view class="container">
    <!-- 平台特定内容 -->
    <view v-if="isAlipay">
      支付宝小程序专属内容
    </view>
  </view>
</template>

<script lang="ts" setup>
import PLATFORM from '@/utils/platform'

const isAlipay = PLATFORM.isMpAlipay
</script>
```

## 条件编译

### 基本语法

支付宝小程序使用 `MP-ALIPAY` 作为条件编译标识:

```vue
<template>
  <!-- 仅在支付宝小程序中显示 -->
  <!-- #ifdef MP-ALIPAY -->
  <view class="alipay-only">
    支付宝小程序专属内容
  </view>
  <!-- #endif -->

  <!-- 除支付宝小程序外的平台显示 -->
  <!-- #ifndef MP-ALIPAY -->
  <view class="other-platform">
    其他平台内容
  </view>
  <!-- #endif -->
</template>
```

### JavaScript 条件编译

```typescript
// 支付宝小程序特有 API
// #ifdef MP-ALIPAY
my.showSharePanel({
  title: '分享标题',
  content: '分享描述',
  url: '/pages/index/index',
})
// #endif

// 非支付宝小程序
// #ifndef MP-ALIPAY
uni.showShareMenu({
  withShareTicket: true,
})
// #endif
```

### 样式条件编译

```scss
/* 支付宝小程序专用样式 */
/* #ifdef MP-ALIPAY */
.container {
  /* 支付宝特有样式处理 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */
```

### 多平台条件编译

```typescript
// 多个小程序平台
// #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
uni.setClipboardData({
  data: content,
  showToast: false,
  success: () => {
    console.log('复制成功')
  },
})
// #endif
```

## 支付宝支付

### 支付能力检测

```typescript
// src/composables/usePayment.ts

/**
 * 检查当前平台是否支持支付宝支付
 */
const isAlipayPaySupported = (): boolean => {
  return PLATFORM.isMpAlipay || PLATFORM.isAlipayOfficialH5 || PLATFORM.isH5 || PLATFORM.isApp
}
```

### 支付宝小程序支付

```typescript
/**
 * 支付宝小程序支付
 */
const callAlipayMpPay = async (paymentResponse: PaymentResponse): Promise<boolean> => {
  return new Promise((resolve) => {
    // #ifdef MP-ALIPAY
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: paymentResponse.payForm || paymentResponse.payUrl!,
      success: (res) => {
        console.log('支付宝小程序支付成功:', res)
        toast.success('支付成功')
        resolve(true)
      },
      fail: (err) => {
        console.error('支付宝小程序支付失败:', err)
        toast.error('支付失败')
        resolve(false)
      },
    })
    // #endif

    // #ifndef MP-ALIPAY
    console.error('支付宝小程序支付仅支持支付宝小程序环境')
    resolve(false)
    // #endif
  })
}
```

### 支付宝 H5 支付

```typescript
/**
 * 支付宝 H5 支付
 */
const callAlipayH5Pay = async (paymentResponse: PaymentResponse): Promise<boolean> => {
  return new Promise((resolve) => {
    // #ifdef H5
    if (paymentResponse.payUrl) {
      console.log('跳转支付宝支付页面:', paymentResponse.payUrl)
      window.location.href = paymentResponse.payUrl
      resolve(true)
    } else {
      console.error('缺少支付宝支付链接')
      resolve(false)
    }
    // #endif

    // #ifndef H5
    console.error('支付宝H5支付仅支持H5环境')
    resolve(false)
    // #endif
  })
}
```

### 支付宝 APP 支付

```typescript
/**
 * 支付宝 APP 支付
 */
const callAlipayAppPay = async (paymentResponse: PaymentResponse): Promise<boolean> => {
  return new Promise((resolve) => {
    // #ifdef APP
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: paymentResponse.payForm || paymentResponse.payUrl!,
      success: (res) => {
        console.log('支付宝APP支付成功:', res)
        toast.success('支付成功')
        resolve(true)
      },
      fail: (err) => {
        console.error('支付宝APP支付失败:', err)
        toast.error('支付失败')
        resolve(false)
      },
    })
    // #endif

    // #ifndef APP
    console.error('支付宝APP支付仅支持APP环境')
    resolve(false)
    // #endif
  })
}
```

### 平台自适应支付

```typescript
/**
 * 根据平台调用支付宝支付
 */
const callAlipayByPlatform = async (paymentResponse: PaymentResponse): Promise<boolean> => {
  if (PLATFORM.isAlipayOfficialH5 || PLATFORM.isH5) {
    return await callAlipayH5Pay(paymentResponse)
  } else if (PLATFORM.isMpAlipay) {
    return await callAlipayMpPay(paymentResponse)
  } else if (PLATFORM.isApp) {
    return await callAlipayAppPay(paymentResponse)
  } else {
    throw new Error(`当前平台 ${PLATFORM.platform} 不支持支付宝支付`)
  }
}

/**
 * 根据平台自动选择交易类型
 */
const getTradeType = (paymentMethod: PaymentMethod): TradeType => {
  if (paymentMethod === PaymentMethod.ALIPAY) {
    if (PLATFORM.isMpAlipay || PLATFORM.isApp) {
      return TradeType.APP
    } else if (PLATFORM.isH5) {
      return TradeType.WAP
    } else {
      return TradeType.PAGE
    }
  }
  throw new Error(`不支持的支付方式: ${paymentMethod}`)
}
```

### 支付使用示例

```vue
<template>
  <view class="payment-page">
    <wd-button
      type="primary"
      :loading="loading"
      @click="handlePay"
    >
      支付宝支付
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { usePayment } from '@/composables/usePayment'
import { PaymentMethod } from '@/api/common/mall/order/orderTypes'

const { createOrderAndPay, loading, getPlatformInfo } = usePayment()

// 获取平台支付信息
const platformInfo = getPlatformInfo()
console.log('支持支付宝:', platformInfo.supportsAlipayPay)

const handlePay = async () => {
  const [err, result] = await createOrderAndPay({
    orderData: {
      productId: '123',
      quantity: 1,
      totalAmount: 100,
    },
    paymentMethod: PaymentMethod.ALIPAY,
  })

  if (err) {
    console.error('支付失败:', err)
    return
  }

  console.log('支付成功:', result)
}
</script>
```

## 分享功能

### 支付宝分享面板

支付宝小程序使用 `my.showSharePanel` API 触发分享:

```typescript
// src/composables/useShare.ts

/**
 * 主动触发系统分享菜单
 */
const triggerShare = (): void => {
  try {
    // 支付宝小程序
    // #ifdef MP-ALIPAY
    // @ts-expect-error - 支付宝小程序特有 API
    my.showSharePanel({
      title: shareConfig.value.title,
      content: shareConfig.value.title,
      url: shareConfig.value.path,
    })
    console.log('已触发支付宝小程序分享面板')
    // #endif
  } catch (error) {
    console.error('触发分享失败:', error)
    uni.showToast({
      title: '分享功能暂不可用',
      icon: 'none',
    })
  }
}
```

### 分享配置

```typescript
interface ShareConfig {
  /** 分享标题 */
  title: string
  /** 分享路径 */
  path: string
  /** 分享图片 */
  imageUrl: string
}

const DEFAULT_SHARE: ShareConfig = {
  title: '发现更多精彩',
  path: '/pages/index/index',
  imageUrl: '',
}
```

### 使用分享功能

```vue
<template>
  <view class="page">
    <wd-button @click="handleShare">
      分享给好友
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useShare } from '@/composables/useShare'

const { triggerShare, setShareData } = useShare({
  title: '产品详情',
  enableTimeline: true,
})

// 动态设置分享内容
setShareData({
  title: '精选好物推荐',
  imageUrl: '/static/share.png',
  extraParams: {
    productId: '123',
  },
})

const handleShare = () => {
  triggerShare()
}
</script>
```

## 平台差异处理

### v-show 与 v-if 差异

支付宝小程序对 `v-show` 的支持存在问题,需要使用 `v-if` 替代:

```vue
<template>
  <scroll-view :scroll-y="true">
    <!-- 支付宝端：只保留 v-if，v-show 无效 -->
    <!-- #ifdef MP-ALIPAY -->
    <Home v-if="currentTab === 0 && tabs[0].loaded" />
    <Menu v-if="currentTab === 1 && tabs[1].loaded" />
    <My v-if="currentTab === 2 && tabs[2].loaded" />
    <!-- #endif -->

    <!-- 非支付宝端：用 v-show 提高性能 -->
    <!-- #ifndef MP-ALIPAY -->
    <Home v-if="tabs[0].loaded" v-show="currentTab === 0" />
    <Menu v-if="tabs[1].loaded" v-show="currentTab === 1" />
    <My v-if="tabs[2].loaded" v-show="currentTab === 2" />
    <!-- #endif -->
  </scroll-view>
</template>
```

**注意事项:**

- 支付宝小程序的 `v-show` 可能不生效
- 使用 `v-if` 会导致组件重新创建,可能影响性能
- 对于复杂组件,考虑使用 `<keep-alive>` 优化

### Canvas 像素比处理

支付宝小程序的 Canvas 需要特殊处理像素比:

```typescript
// src/wd/components/wd-circle/wd-circle.vue

/**
 * 计算 Canvas 实际尺寸
 */
const canvasSize = computed(() => {
  let size = rpxToPx(props.size)
  // #ifdef MP-ALIPAY
  // 支付宝小程序需要乘以像素比
  size = size * pixelRatio.value
  // #endif
  return size
})

/**
 * 计算描边宽度
 */
const sWidth = computed(() => {
  let sWidth = rpxToPx(props.strokeWidth)
  // #ifdef MP-ALIPAY
  sWidth = sWidth * pixelRatio.value
  // #endif
  return sWidth
})
```

### SelectorQuery 差异

支付宝小程序的 `createSelectorQuery` 不支持 `.in()` 方法:

```typescript
// src/wd/components/wd-rich-text/components/rich-viewer.vue

const selector = uni
  .createSelectorQuery()
  // #ifndef MP-ALIPAY
  .in(this._in ? this._in.page : this)
  // #endif
  .select('#_root')
  .boundingClientRect()
```

### 动画处理差异

支付宝小程序的动画实现与其他平台不同:

```typescript
// src/wd/components/wd-img-cropper/wd-img-cropper.vue

// #ifdef MP-ALIPAY || APP-PLUS || H5
// hack 避免钉钉小程序、支付宝小程序、app 抛出相关异常
const animation: any = null
// #endif

// 使用 CSS 动画替代 uni.createAnimation
const animationStyle = computed(() => {
  return {
    transform: `rotate(${imgAngle.value}deg)`,
    transition: isAnimation.value ? 'transform 0.3s ease' : 'none',
  }
})
```

## API 适配

### 用户授权

```typescript
// 获取用户信息
const getUserInfo = async () => {
  // #ifdef MP-ALIPAY
  return new Promise((resolve, reject) => {
    // @ts-expect-error - 支付宝小程序特有 API
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        console.log('获取授权码成功:', res.authCode)
        resolve(res.authCode)
      },
      fail: reject,
    })
  })
  // #endif
}

// 获取用户手机号
const getPhoneNumber = async () => {
  // #ifdef MP-ALIPAY
  return new Promise((resolve, reject) => {
    // @ts-expect-error - 支付宝小程序特有 API
    my.getPhoneNumber({
      success: (res) => {
        console.log('获取手机号成功:', res.response)
        resolve(res.response)
      },
      fail: reject,
    })
  })
  // #endif
}
```

### 位置服务

```typescript
// 获取当前位置
const getLocation = async () => {
  // #ifdef MP-ALIPAY
  return new Promise((resolve, reject) => {
    // @ts-expect-error - 支付宝小程序特有 API
    my.getLocation({
      type: 1, // 1:获取经纬度 2:获取街道地址
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy,
        })
      },
      fail: reject,
    })
  })
  // #endif

  // #ifndef MP-ALIPAY
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: reject,
    })
  })
  // #endif
}
```

### 图片选择

```typescript
// 选择图片
const chooseImage = async (count: number = 9) => {
  // #ifdef MP-ALIPAY
  return new Promise((resolve, reject) => {
    // @ts-expect-error - 支付宝小程序特有 API
    my.chooseImage({
      count,
      sourceType: ['camera', 'album'],
      success: (res) => {
        resolve(res.apFilePaths)
      },
      fail: reject,
    })
  })
  // #endif

  // #ifndef MP-ALIPAY
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: reject,
    })
  })
  // #endif
}
```

### 扫码功能

```typescript
// 扫描二维码
const scanCode = async () => {
  // #ifdef MP-ALIPAY
  return new Promise((resolve, reject) => {
    // @ts-expect-error - 支付宝小程序特有 API
    my.scan({
      type: 'qr',
      success: (res) => {
        resolve(res.code)
      },
      fail: reject,
    })
  })
  // #endif

  // #ifndef MP-ALIPAY
  return new Promise((resolve, reject) => {
    uni.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        resolve(res.result)
      },
      fail: reject,
    })
  })
  // #endif
}
```

## 样式兼容

### 样式隔离配置

```typescript
// manifest.config.ts
'mp-alipay': {
  styleIsolation: 'shared', // 共享样式
}
```

**样式隔离模式:**

- `shared` - 页面样式可影响组件,组件样式可影响页面
- `isolated` - 完全隔离,互不影响

### 安全区域适配

```scss
.safe-area {
  /* 支付宝小程序安全区域 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 状态栏处理

```typescript
// 获取状态栏高度
const getStatusBarHeight = () => {
  // #ifdef MP-ALIPAY
  return new Promise((resolve) => {
    // @ts-expect-error - 支付宝小程序特有 API
    my.getSystemInfo({
      success: (res) => {
        resolve(res.statusBarHeight)
      },
    })
  })
  // #endif

  // #ifndef MP-ALIPAY
  const systemInfo = uni.getSystemInfoSync()
  return systemInfo.statusBarHeight
  // #endif
}
```

## 性能优化

### 分包加载

支付宝小程序支持分包,但配置方式与微信小程序相同:

```json
// pages.json
{
  "subPackages": [
    {
      "root": "pages-sub",
      "pages": [
        {
          "path": "product/detail",
          "style": {
            "navigationBarTitleText": "产品详情"
          }
        }
      ]
    }
  ]
}
```

### 图片懒加载

```vue
<template>
  <view class="image-list">
    <image
      v-for="item in list"
      :key="item.id"
      :src="item.url"
      lazy-load
      mode="aspectFill"
    />
  </view>
</template>
```

### 数据缓存

```typescript
// 使用支付宝小程序缓存
const setStorage = (key: string, data: any) => {
  // #ifdef MP-ALIPAY
  // @ts-expect-error - 支付宝小程序特有 API
  my.setStorageSync({
    key,
    data,
  })
  // #endif

  // #ifndef MP-ALIPAY
  uni.setStorageSync(key, data)
  // #endif
}

const getStorage = (key: string) => {
  // #ifdef MP-ALIPAY
  // @ts-expect-error - 支付宝小程序特有 API
  const res = my.getStorageSync({ key })
  return res.data
  // #endif

  // #ifndef MP-ALIPAY
  return uni.getStorageSync(key)
  // #endif
}
```

## 调试技巧

### 开发者工具调试

1. **真机预览** - 扫码预览真实效果
2. **模拟器调试** - 模拟不同机型
3. **网络面板** - 查看请求详情
4. **存储面板** - 管理本地存储

### 日志输出

```typescript
// 调试日志封装
const debug = {
  log: (...args: any[]) => {
    // #ifdef MP-ALIPAY
    // @ts-expect-error
    my.showToast({
      content: JSON.stringify(args),
    })
    // #endif
    console.log('[DEBUG]', ...args)
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },
}
```

### 性能监控

```typescript
// 页面性能监控
const monitorPerformance = () => {
  // #ifdef MP-ALIPAY
  // @ts-expect-error
  const performance = my.getPerformance()
  const observer = performance.createObserver((entryList) => {
    console.log('性能数据:', entryList.getEntries())
  })
  observer.observe({ entryTypes: ['render', 'script'] })
  // #endif
}
```

## 发布部署

### 版本管理

```bash
# 开发版构建
pnpm build:mp-alipay

# 检查构建产物
ls -la dist/build/mp-alipay
```

### 提审流程

1. **上传代码** - 使用开发者工具上传
2. **填写版本信息** - 版本号、更新说明
3. **提交审核** - 等待官方审核
4. **发布上线** - 审核通过后发布

### 审核注意事项

- **隐私政策** - 必须提供隐私政策链接
- **资质认证** - 部分类目需要资质
- **内容合规** - 确保内容符合规范
- **功能完整** - 避免功能缺失或异常

## 常见问题

### 1. 样式不生效

**问题原因:**

- 样式隔离导致样式无法穿透
- ACSS 语法差异

**解决方案:**

```typescript
// 配置样式共享
'mp-alipay': {
  styleIsolation: 'shared',
}
```

```scss
/* 使用 :deep 穿透 */
:deep(.child-class) {
  color: red;
}
```

### 2. v-show 不生效

**问题原因:**

支付宝小程序对 v-show 的实现存在 bug

**解决方案:**

```vue
<!-- 使用 v-if 替代 -->
<!-- #ifdef MP-ALIPAY -->
<view v-if="visible">内容</view>
<!-- #endif -->

<!-- #ifndef MP-ALIPAY -->
<view v-show="visible">内容</view>
<!-- #endif -->
```

### 3. API 调用失败

**问题原因:**

- 支付宝 API 与 uni API 参数格式不同
- 需要使用 my 对象调用

**解决方案:**

```typescript
// 使用条件编译处理 API 差异
// #ifdef MP-ALIPAY
my.showToast({
  content: '提示内容', // 注意是 content 不是 title
})
// #endif

// #ifndef MP-ALIPAY
uni.showToast({
  title: '提示内容',
})
// #endif
```

### 4. 支付失败

**问题原因:**

- 订单参数格式错误
- 签名验证失败

**解决方案:**

```typescript
// 确保支付参数正确
uni.requestPayment({
  provider: 'alipay',
  // orderInfo 支持字符串或对象
  orderInfo: paymentResponse.payForm || paymentResponse.payUrl!,
  success: (res) => {
    console.log('支付成功')
  },
  fail: (err) => {
    console.error('支付失败:', err)
  },
})
```

### 5. 图片预览问题

**问题原因:**

支付宝小程序图片预览需要特殊处理重复链接

**解决方案:**

```typescript
// 处理重复图片链接
const processImages = (urls: string[]) => {
  // #ifndef H5 || MP-ALIPAY || APP-PLUS
  // 微信小程序需要对重复链接进行随机大小写变换
  return urls.map((url, index) => {
    if (urls.indexOf(url) !== index) {
      const i = url.indexOf('://')
      if (i !== -1) {
        return url.substring(0, i + 3) +
          url.substring(i + 3).split('').map(c =>
            Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()
          ).join('')
      }
    }
    return url
  })
  // #endif

  return urls
}
```

## 最佳实践

### 1. 统一平台判断

创建统一的平台判断工具,避免散落的条件编译:

```typescript
// utils/platform.ts
export const runOnAlipay = (fn: () => void) => {
  // #ifdef MP-ALIPAY
  fn()
  // #endif
}

export const runExceptAlipay = (fn: () => void) => {
  // #ifndef MP-ALIPAY
  fn()
  // #endif
}
```

### 2. API 封装适配

将平台差异封装在工具函数中:

```typescript
// utils/api.ts
export const showToast = (message: string) => {
  // #ifdef MP-ALIPAY
  // @ts-expect-error
  my.showToast({ content: message })
  // #endif

  // #ifndef MP-ALIPAY
  uni.showToast({ title: message, icon: 'none' })
  // #endif
}
```

### 3. 组件兼容处理

在组件内部处理平台差异:

```vue
<template>
  <view :class="containerClass">
    <slot />
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import PLATFORM from '@/utils/platform'

const containerClass = computed(() => ({
  'container': true,
  'container--alipay': PLATFORM.isMpAlipay,
}))
</script>
```

### 4. 测试覆盖

确保在支付宝小程序中进行充分测试:

- 功能测试
- 兼容性测试
- 性能测试
- 真机测试

### 5. 文档记录

记录平台差异和解决方案,方便团队协作:

```typescript
/**
 * 支付宝小程序专用处理
 * 原因: 支付宝小程序 v-show 不生效
 * 解决: 使用 v-if 替代
 */
// #ifdef MP-ALIPAY
<view v-if="visible">内容</view>
// #endif
```
