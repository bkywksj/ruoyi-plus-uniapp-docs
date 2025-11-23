# 微信小程序适配

## 介绍

微信小程序是最主要的小程序平台之一,拥有庞大的用户群体和完善的生态系统。RuoYi-Plus-UniApp 项目针对微信小程序平台进行了全面的适配和优化,支持微信特有的功能和 API。

本文档详细介绍如何将 UniApp 项目适配到微信小程序平台,包括环境配置、特有功能适配、API 差异处理、调试技巧和最佳实践等内容。

**主要内容:**

- **项目配置** - manifest.json 和 project.config.json 配置
- **开发环境** - 微信开发者工具安装和使用
- **特有功能** - 分享、支付、订阅消息等微信特有能力
- **API 适配** - 微信特有 API 的使用和条件编译
- **调试技巧** - 真机调试、性能分析等
- **发布部署** - 小程序审核和发布流程

---

## 环境配置

### manifest.json 配置

在 `manifest.config.ts` 中配置微信小程序相关参数:

```typescript
// manifest.config.ts
import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest'

export default defineManifestConfig({
  // 微信小程序配置
  'mp-weixin': {
    // 小程序 AppID(从微信公众平台获取)
    appid: 'wx1234567890abcdef',

    // 编译设置
    setting: {
      urlCheck: false, // 是否检查安全域名和 TLS 版本
      es6: true, // 是否启用 ES6 转 ES5
      enhance: true, // 是否启用增强编译
      postcss: true, // 是否启用 postcss
      preloadBackgroundData: false, // 是否开启小程序独立分包加载
      minified: true, // 是否压缩代码
      coverView: true, // 是否使用工具渲染 CoverView
      bigPackageSizeSupport: true, // 是否支持分包异步化
    },

    // 使用自定义组件模式
    usingComponents: true,

    // 位置权限配置
    permission: {
      'scope.userLocation': {
        desc: '您的位置信息将用于小程序位置接口的效果展示',
      },
    },

    // 按需注入,优化启动性能
    lazyCodeLoading: 'requiredComponents',

    // 隐私相关设置
    requiredPrivateInfos: ['getLocation', 'chooseLocation'],
  },
})
```

**关键配置说明:**

| 配置项 | 说明 | 推荐值 |
|-------|------|--------|
| `appid` | 微信小程序 AppID | 从微信公众平台获取 |
| `urlCheck` | 是否检查安全域名 | `false`(开发时) |
| `es6` | ES6 转 ES5 | `true` |
| `enhance` | 增强编译 | `true` |
| `minified` | 代码压缩 | `true` |
| `lazyCodeLoading` | 按需注入 | `'requiredComponents'` |

### project.config.json

微信开发者工具的项目配置文件,通常由 UniApp 自动生成:

```json
{
  "miniprogramRoot": "dist/dev/mp-weixin/",
  "projectname": "ruoyi-plus-uniapp",
  "appid": "wx1234567890abcdef",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "3.3.4",
  "condition": {}
}
```

### 环境变量配置

在 `.env` 文件中配置微信小程序相关环境变量:

```bash
# .env.development
VITE_WECHAT_MINI_APP_ID=wx1234567890abcdef

# .env.production
VITE_WECHAT_MINI_APP_ID=wx1234567890abcdef
```

---

## 开发环境搭建

### 安装微信开发者工具

1. **下载安装**
   - 访问 https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - 下载对应系统版本(Windows/macOS/Linux)
   - 安装并启动

2. **登录账号**
   - 使用微信扫码登录
   - 关联小程序 AppID

3. **导入项目**
   - 打开微信开发者工具
   - 选择"导入项目"
   - 选择 `dist/dev/mp-weixin` 目录
   - 填入 AppID

### 开发调试流程

**启动开发服务:**

```bash
# 启动微信小程序开发模式
pnpm dev:mp-weixin

# 或使用简写
npm run dev:weixin
```

**调试步骤:**

1. 启动 `pnpm dev:mp-weixin` 监听文件变化
2. 在微信开发者工具中导入 `dist/dev/mp-weixin` 目录
3. 修改代码后自动重新编译
4. 微信开发者工具会自动刷新

**真机调试:**

1. 点击微信开发者工具右上角"预览"按钮
2. 使用微信扫描二维码
3. 在真机上查看效果
4. 使用"真机调试"功能查看控制台输出

---

## 微信特有功能

### 小程序分享

**分享给朋友:**

```vue
<script setup lang="ts">
import { useShare } from '@/composables/useShare'

const { handleShareAppMessage } = useShare()

// 暴露分享方法给页面
defineExpose({
  onShareAppMessage: handleShareAppMessage,
})
</script>
```

**useShare Composable 实现:**

```typescript
// composables/useShare.ts
export const useShare = () => {
  /**
   * 分享给朋友
   */
  const handleShareAppMessage = (options?: {
    from: 'button' | 'menu'
    target?: any
    webViewUrl?: string
  }) => {
    return {
      title: '分享标题',
      path: '/pages/index/index',
      imageUrl: '/static/images/share.png',
    }
  }

  /**
   * 分享到朋友圈
   */
  const handleShareTimeline = () => {
    return {
      title: '朋友圈分享标题',
      query: '',
      imageUrl: '/static/images/share-timeline.png',
    }
  }

  return {
    handleShareAppMessage,
    handleShareTimeline,
  }
}
```

**按钮触发分享:**

```vue
<template>
  <button open-type="share" class="share-btn">
    分享给朋友
  </button>
</template>
```

### 微信支付

**发起支付:**

```typescript
// composables/useWechatPay.ts
export const useWechatPay = () => {
  /**
   * 发起微信支付
   */
  const requestPayment = async (paymentParams: WechatPaymentParams) => {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: paymentParams.timeStamp,
        nonceStr: paymentParams.nonceStr,
        package: paymentParams.package,
        signType: paymentParams.signType as 'MD5' | 'HMAC-SHA256' | 'RSA',
        paySign: paymentParams.paySign,
        success: (res) => {
          console.log('支付成功', res)
          resolve(res)
        },
        fail: (err) => {
          console.error('支付失败', err)
          reject(err)
        },
      })
      // #endif
    })
  }

  return {
    requestPayment,
  }
}

interface WechatPaymentParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}
```

**使用示例:**

```vue
<script setup lang="ts">
import { useWechatPay } from '@/composables/useWechatPay'

const { requestPayment } = useWechatPay()

const handlePay = async () => {
  try {
    // 1. 调用后端获取支付参数
    const paymentParams = await getPaymentParams(orderId)

    // 2. 发起支付
    await requestPayment(paymentParams)

    // 3. 支付成功处理
    uni.showToast({ title: '支付成功' })
  } catch (error) {
    uni.showToast({ title: '支付失败', icon: 'error' })
  }
}
</script>
```

### 订阅消息

**请求订阅:**

```typescript
/**
 * 请求订阅消息
 */
export const requestSubscribeMessage = async (tmplIds: string[]) => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        console.log('订阅结果', res)
        resolve(res)
      },
      fail: (err) => {
        console.error('订阅失败', err)
        reject(err)
      },
    })
    // #endif
  })
}
```

**使用示例:**

```vue
<script setup lang="ts">
import { requestSubscribeMessage } from '@/utils/wechat'

const handleSubscribe = async () => {
  try {
    const res = await requestSubscribeMessage([
      'TEMPLATE_ID_1', // 订单状态更新
      'TEMPLATE_ID_2', // 物流通知
    ])

    console.log('订阅结果:', res)
  } catch (error) {
    console.error('订阅失败:', error)
  }
}
</script>
```

### 微信登录

**小程序静默登录:**

```typescript
// stores/modules/user.ts
export const useUserStore = defineStore('user', () => {
  /**
   * 微信小程序静默登录
   */
  const loginWithMiniapp = async (): Promise<[Error | null, any]> => {
    try {
      // 1. 获取登录 code
      const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: resolve,
          fail: reject,
        })
      })

      if (!loginRes.code) {
        throw new Error('获取登录 code 失败')
      }

      // 2. 调用后端登录接口
      const [err, data] = await miniappLogin({ code: loginRes.code })

      if (err) {
        throw err
      }

      // 3. 保存 token
      token.value = data.token
      cache.set(TOKEN_KEY, data.token)

      return [null, data]
    } catch (error) {
      return [error as Error, null]
    }
  }

  return {
    loginWithMiniapp,
  }
})
```

### 获取用户信息

**获取用户头像和昵称:**

```vue
<template>
  <view>
    <!-- 头像获取 -->
    <button
      class="avatar-wrapper"
      open-type="chooseAvatar"
      @chooseavatar="onChooseAvatar"
    >
      <image :src="avatarUrl" mode="aspectFill" class="avatar" />
    </button>

    <!-- 昵称获取 -->
    <input
      type="nickname"
      v-model="nickname"
      placeholder="请输入昵称"
      @blur="onNicknameBlur"
    />

    <button @tap="saveUserInfo">保存</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const avatarUrl = ref('/static/images/default-avatar.png')
const nickname = ref('')

// 选择头像
const onChooseAvatar = (e: any) => {
  avatarUrl.value = e.detail.avatarUrl
}

// 昵称输入完成
const onNicknameBlur = (e: any) => {
  nickname.value = e.detail.value
}

// 保存用户信息
const saveUserInfo = async () => {
  if (!nickname.value) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  // 上传头像并保存
  const uploadedAvatarUrl = await uploadAvatar(avatarUrl.value)

  await updateUserInfo({
    avatar: uploadedAvatarUrl,
    nickname: nickname.value,
  })

  uni.showToast({ title: '保存成功' })
}
</script>
```

### 小程序码

**生成小程序码:**

```typescript
/**
 * 获取小程序码
 * 需要通过后端接口调用微信 API 生成
 */
export const getMiniProgramCode = async (params: {
  scene: string
  page?: string
  width?: number
}) => {
  const [err, data] = await request({
    url: '/api/wechat/qrcode',
    method: 'POST',
    data: params,
  })

  if (err) {
    throw err
  }

  return data.codeUrl
}
```

---

## 条件编译

### 基本用法

使用条件编译处理微信小程序特有的代码:

**模板中:**

```vue
<template>
  <view>
    <!-- 仅在微信小程序中显示 -->
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="share">分享</button>
    <button open-type="contact">客服</button>
    <button open-type="feedback">意见反馈</button>
    <!-- #endif -->

    <!-- 非微信小程序显示 -->
    <!-- #ifndef MP-WEIXIN -->
    <button @tap="handleShare">分享</button>
    <!-- #endif -->
  </view>
</template>
```

**脚本中:**

```typescript
<script setup lang="ts">
// #ifdef MP-WEIXIN
import { requestSubscribeMessage } from '@/utils/wechat'

const handleSubscribe = async () => {
  await requestSubscribeMessage(['TEMPLATE_ID'])
}
// #endif

// #ifndef MP-WEIXIN
const handleSubscribe = () => {
  console.log('当前平台不支持订阅消息')
}
// #endif
</script>
```

**样式中:**

```scss
/* #ifdef MP-WEIXIN */
.wechat-only {
  background-color: #07c160;
}
/* #endif */

/* #ifndef MP-WEIXIN */
.other-platform {
  background-color: #1890ff;
}
/* #endif */
```

### 常用条件编译标识

| 标识 | 说明 |
|-----|------|
| `MP-WEIXIN` | 微信小程序 |
| `MP` | 所有小程序 |
| `H5` | H5 |
| `APP-PLUS` | App |

---

## API 适配

### 平台判断

```typescript
// utils/platform.ts
export const platform = uni.getSystemInfoSync().platform

// 是否是微信小程序
export const isMpWeixin = (() => {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
})()
```

### 常用微信 API

**获取系统信息:**

```typescript
const getWechatSystemInfo = () => {
  const systemInfo = uni.getSystemInfoSync()

  return {
    // 微信版本
    SDKVersion: systemInfo.SDKVersion,
    // 微信账号信息
    host: systemInfo.host,
    // 性能信息
    benchmarkLevel: systemInfo.benchmarkLevel,
  }
}
```

**检测 API 支持:**

```typescript
// 检测是否支持某个 API
const canIUse = (schema: string): boolean => {
  return uni.canIUse(schema)
}

// 使用示例
if (canIUse('requestSubscribeMessage')) {
  // 支持订阅消息
  requestSubscribeMessage([tmplId])
} else {
  console.warn('当前版本不支持订阅消息')
}
```

**获取用户设置:**

```typescript
/**
 * 获取用户授权设置
 */
const getSetting = async () => {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      success: (res) => {
        console.log('用户设置:', res.authSetting)
        resolve(res.authSetting)
      },
      fail: reject,
    })
  })
}

// 检查是否有位置权限
const hasLocationAuth = async () => {
  const settings = await getSetting()
  return settings['scope.userLocation'] === true
}
```

**请求位置权限:**

```typescript
/**
 * 请求位置权限
 */
const requestLocationAuth = async () => {
  // 先检查是否有权限
  const settings = await getSetting()

  if (settings['scope.userLocation'] === false) {
    // 之前被拒绝过,需要引导用户打开设置
    const res = await uni.showModal({
      title: '提示',
      content: '需要获取您的位置信息,请在设置中打开位置权限',
      confirmText: '去设置',
    })

    if (res.confirm) {
      uni.openSetting()
    }
    return false
  }

  // 请求授权
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.userLocation',
      success: () => resolve(true),
      fail: () => resolve(false),
    })
  })
}
```

---

## 性能优化

### 分包配置

```typescript
// pages.config.ts
export default {
  pages: [
    // 主包页面
    { path: 'pages/index/index' },
    { path: 'pages/login/index' },
  ],
  subPackages: [
    {
      root: 'pages/user',
      pages: [
        { path: 'profile/index' },
        { path: 'settings/index' },
      ],
    },
    {
      root: 'pages/order',
      pages: [
        { path: 'list/index' },
        { path: 'detail/index' },
      ],
    },
  ],
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages/user'],
    },
  },
}
```

### 按需注入

在 manifest.json 中启用:

```typescript
'mp-weixin': {
  lazyCodeLoading: 'requiredComponents',
}
```

### 分包异步化

```typescript
'mp-weixin': {
  setting: {
    bigPackageSizeSupport: true,
  },
}
```

### 性能监控

**使用微信性能监控:**

```typescript
// #ifdef MP-WEIXIN
const performance = wx.getPerformance()
const observer = performance.createObserver((entryList) => {
  const entries = entryList.getEntries()
  console.log('性能数据:', entries)
})

observer.observe({ entryTypes: ['navigation', 'resource'] })
// #endif
```

---

## 调试技巧

### Console 调试

```typescript
// 使用彩色日志
console.log('%c 微信小程序', 'color: #07c160; font-weight: bold;', data)

// 结构化输出
console.table(userList)

// 分组输出
console.group('请求详情')
console.log('URL:', url)
console.log('Params:', params)
console.log('Response:', response)
console.groupEnd()
```

### 远程调试

1. 点击"真机调试"按钮
2. 使用微信扫码
3. 在开发者工具中查看控制台
4. 设置断点调试

### 网络请求调试

在微信开发者工具中:

1. 打开"Network"面板
2. 查看所有网络请求
3. 检查请求头、响应数据
4. 模拟弱网环境

### 性能分析

1. 打开"Audits"面板
2. 点击"运行"按钮
3. 查看性能评分和建议
4. 根据建议优化代码

---

## 常见问题

### 1. 请求域名校验失败

**问题:** 请求时提示"不在合法域名列表中"

**解决方案:**

1. **开发环境:** 在微信开发者工具中勾选"不校验合法域名"
2. **生产环境:** 在微信公众平台配置合法域名
   - 登录 https://mp.weixin.qq.com
   - 开发 -> 开发设置 -> 服务器域名
   - 添加 request 合法域名

### 2. 分包大小超限

**问题:** 分包大小超过 2MB 限制

**解决方案:**

```typescript
// 启用分包异步化
'mp-weixin': {
  setting: {
    bigPackageSizeSupport: true, // 支持单个分包最大 20MB
  },
}
```

```typescript
// 优化代码体积
- 使用 Tree Shaking
- 压缩图片资源
- 移除未使用的依赖
- 使用条件编译去除无用代码
```

### 3. 授权弹窗不显示

**问题:** getUserProfile 等授权 API 不显示弹窗

**解决方案:**

```vue
<!-- 必须使用 button 触发 -->
<template>
  <button @tap="handleGetProfile">获取用户信息</button>
</template>

<script setup lang="ts">
const handleGetProfile = () => {
  // 必须在 tap 事件中调用
  uni.getUserProfile({
    desc: '用于完善用户资料',
    success: (res) => {
      console.log(res.userInfo)
    },
  })
}
</script>
```

### 4. 分享失效

**问题:** 分享按钮不生效

**解决方案:**

```vue
<script setup lang="ts">
// 必须暴露 onShareAppMessage 方法
defineExpose({
  onShareAppMessage: () => ({
    title: '分享标题',
    path: '/pages/index/index',
  }),
})
</script>
```

### 5. WebSocket 连接失败

**问题:** WebSocket 连接被拒绝

**解决方案:**

1. 检查域名是否配置(wss 域名)
2. 检查是否使用 wss 协议(生产环境)
3. 检查证书是否有效

```typescript
// 配置 WebSocket 域名
// 微信公众平台 -> 开发设置 -> 服务器域名 -> socket 合法域名
```

---

## 发布部署

### 上传代码

1. 在微信开发者工具中点击"上传"
2. 填写版本号和版本描述
3. 上传完成后在微信公众平台查看

### 提交审核

1. 登录微信公众平台
2. 版本管理 -> 开发版本
3. 提交审核
4. 填写审核信息

**审核注意事项:**

- 确保所有功能正常
- 提供测试账号(如需要登录)
- 描述清晰准确
- 遵守微信小程序运营规范

### 发布上线

审核通过后:

1. 版本管理 -> 审核版本
2. 点击"发布"
3. 选择全量发布或灰度发布
4. 确认发布

---

## 最佳实践

### 1. 合理使用条件编译

```typescript
// ✅ 推荐:只在必要时使用条件编译
// #ifdef MP-WEIXIN
const subscribeMessage = async (tmplIds: string[]) => {
  await uni.requestSubscribeMessage({ tmplIds })
}
// #endif

// ❌ 不推荐:过度使用条件编译
// #ifdef MP-WEIXIN
const data = ref([])
// #endif
// #ifndef MP-WEIXIN
const data = ref([])
// #endif
```

### 2. 封装平台差异

```typescript
// utils/platform.ts
export const share = (options: ShareOptions) => {
  // #ifdef MP-WEIXIN
  // 微信分享实现
  return wechatShare(options)
  // #endif

  // #ifdef H5
  // H5 分享实现
  return h5Share(options)
  // #endif
}
```

### 3. 性能优先

```typescript
// ✅ 推荐:启用性能优化
'mp-weixin': {
  lazyCodeLoading: 'requiredComponents', // 按需注入
  setting: {
    bigPackageSizeSupport: true, // 分包异步化
    minified: true, // 代码压缩
  },
}
```

### 4. 合理处理授权

```typescript
// ✅ 推荐:先检查再请求
const handleLocation = async () => {
  // 先检查权限
  const hasAuth = await hasLocationAuth()

  if (!hasAuth) {
    // 引导用户授权
    const granted = await requestLocationAuth()
    if (!granted) {
      uni.showToast({ title: '需要位置权限', icon: 'none' })
      return
    }
  }

  // 获取位置
  const location = await getLocation()
}
```

### 5. 测试覆盖

- 真机测试不同微信版本
- 测试不同网络环境
- 测试授权拒绝场景
- 测试分包加载

---

## 总结

微信小程序是 RuoYi-Plus-UniApp 项目的重要目标平台,通过合理的配置和适配,可以充分发挥微信生态的优势。

**关键要点:**

1. **正确配置** - 配置 AppID、域名、权限等
2. **条件编译** - 处理平台特有功能
3. **性能优化** - 启用分包、按需注入
4. **权限处理** - 合理引导用户授权
5. **调试技巧** - 使用微信开发者工具调试
6. **发布流程** - 遵守审核规范

通过本文档的指导,可以快速将 UniApp 项目适配到微信小程序平台,并发挥其最佳性能。
