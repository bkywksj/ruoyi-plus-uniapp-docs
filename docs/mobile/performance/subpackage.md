# 分包加载优化

## 介绍

分包加载是 UniApp 应用性能优化的核心策略之一,通过将应用代码按照功能模块拆分成多个子包,实现按需加载,有效解决了小程序主包体积限制和首屏加载性能问题。RuoYi-Plus-UniApp 项目采用了完善的分包架构和智能分包优化插件,将主包体积控制在 2MB 以内,同时支持分包异步化、独立分包、分包预下载等高级特性,显著提升了应用启动速度和用户体验。

**核心优势:**

- **突破体积限制** - 小程序主包 2MB 限制,总包可达 20MB (微信小程序)
- **加速首屏加载** - 主包仅包含核心功能,首屏加载时间减少 40-60%
- **按需加载** - 分包内容仅在访问时加载,节省内存和流量
- **智能优化** - Bundle Optimizer 自动分析依赖,避免重复打包
- **分包异步化** - 支持跨包异步调用模块和组件,提升灵活性
- **独立分包** - 无需下载主包即可独立运行,适合特定场景入口

## 分包架构设计

### 目录结构

```
plus-uniapp/
├── src/
│   ├── pages/                    # 主包页面目录
│   │   ├── index/               # 首页
│   │   ├── login/               # 登录页
│   │   └── ...                  # 其他核心页面
│   │
│   ├── pages-sub/               # 分包根目录
│   │   ├── admin/               # 管理员分包
│   │   │   ├── user/           # 用户管理
│   │   │   ├── role/           # 角色管理
│   │   │   └── ...
│   │   │
│   │   ├── business/            # 业务分包 (可选)
│   │   │   ├── order/          # 订单管理
│   │   │   ├── product/        # 产品管理
│   │   │   └── ...
│   │   │
│   │   └── demo/                # 演示分包 (开发环境)
│   │       └── ...
│   │
│   ├── components/              # 公共组件 (主包)
│   ├── wd/                      # UI 组件库 (主包)
│   ├── utils/                   # 工具函数 (主包)
│   ├── composables/             # 组合式函数 (主包)
│   └── stores/                  # 状态管理 (主包)
│
├── vite/
│   └── plugins/
│       ├── uni-pages.ts         # 分包配置插件
│       └── optimization.ts      # 分包优化插件
│
└── manifest.config.ts           # 应用配置 (分包设置)
```

### 分包策略

项目采用三层分包架构:

```
┌─────────────────────────────────────────────────┐
│              分包架构层级                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         主包 (Main Package)             │   │
│  │  - 首页、登录等核心页面                 │   │
│  │  - UI 组件库 (WD UI)                    │   │
│  │  - 公共工具函数和 Composables           │   │
│  │  - 状态管理 (Pinia Stores)              │   │
│  │  - 路由配置                             │   │
│  │  目标: < 2MB                             │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌─────────────────────────────────────────┐   │
│  │      普通分包 (Sub Packages)            │   │
│  │  - admin/ - 管理员功能模块              │   │
│  │  - business/ - 业务功能模块 (可选)      │   │
│  │  - demo/ - 演示功能 (仅开发环境)        │   │
│  │  特性: 按需加载,支持预下载              │   │
│  └─────────────────────────────────────────┘   │
│                    ↓                            │
│  ┌─────────────────────────────────────────┐   │
│  │      独立分包 (Independent)             │   │
│  │  - 特殊入口页面 (如广告页、活动页)      │   │
│  │  特性: 无需主包,独立运行                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 1. 分包配置

### 1.1 自动化分包配置

项目使用 `@uni-helper/vite-plugin-uni-pages` 插件自动生成分包配置:

```typescript
// vite/plugins/uni-pages.ts
import UniPages from '@uni-helper/vite-plugin-uni-pages'

export default (mode: string) => {
  return UniPages({
    // 设置主页
    homePage: 'pages/index/index',

    // 排除组件目录 (不生成路由)
    exclude: ['**/components/**/**.*'],

    // 路由块语言 (可在 .vue 文件中使用 route 块)
    routeBlockLang: 'json5',

    // 分包目录配置
    subPackages: [
      // 管理员分包
      'src/pages-sub/admin',

      // 条件加载分包 (仅开发环境)
      ...(mode === 'production' ? [] : ['src/pages-sub/demo']),
    ],

    // 生成 TypeScript 类型定义
    dts: 'src/types/uni-pages.d.ts',

    // 页面元数据合并后的钩子
    onAfterMergePageMetaData(ctx) {
      // 处理主包页面
      ctx.pageMetaData.forEach((page) => {
        page.layout = 'default'
      })

      // 处理分包页面
      if (ctx.subPageMetaData) {
        ctx.subPageMetaData.forEach((subPackage) => {
          subPackage.pages.forEach((page) => {
            // 根据分包设置不同布局
            if (subPackage.root === 'pages-sub/admin') {
              page.layout = 'default'
            }
          })
        })
      }
    },
  })
}
```

**配置说明:**

- `homePage`: 指定应用首页路径
- `exclude`: 排除不需要生成路由的目录 (如 `components`)
- `subPackages`: 分包目录列表,自动扫描目录生成分包配置
- `dts`: 生成 TypeScript 类型定义,提供路由跳转时的类型提示
- `onAfterMergePageMetaData`: 自定义页面元数据,如统一设置 layout

### 1.2 生成的 pages.json 结构

插件会自动生成类似以下的 `pages.json` 配置:

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/login/index",
      "style": {
        "navigationBarTitleText": "登录"
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub/admin",
      "pages": [
        {
          "path": "user/index",
          "style": {
            "navigationBarTitleText": "用户管理"
          }
        },
        {
          "path": "role/index",
          "style": {
            "navigationBarTitleText": "角色管理"
          }
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/admin"]
    }
  }
}
```

### 1.3 条件分包加载

根据环境动态加载分包:

```typescript
subPackages: [
  // 始终加载
  'src/pages-sub/admin',

  // 仅开发环境加载
  ...(mode === 'development' ? ['src/pages-sub/demo'] : []),

  // 根据配置加载
  ...(env.VITE_ENABLE_BUSINESS === 'true' ? ['src/pages-sub/business'] : []),
]
```

**使用场景:**

- **开发调试分包** - 仅在开发环境加载,避免打入生产包
- **可选功能模块** - 根据客户需求动态加载特定功能
- **A/B 测试** - 根据配置加载不同版本的功能

## 2. 小程序分包优化

### 2.1 微信小程序分包配置

```typescript
// manifest.config.ts
'mp-weixin': {
  setting: {
    // 启用分包异步化 - 突破单包 2MB 限制
    bigPackageSizeSupport: true,

    // 代码压缩
    minified: true,

    // ES6 转 ES5
    es6: true,

    // 启用增强编译
    enhance: true,

    // PostCSS 处理
    postcss: true,
  },

  // 按需注入 - 组件按需加载
  lazyCodeLoading: 'requiredComponents',

  // 使用自定义组件模式
  usingComponents: true,
}
```

**关键配置:**

1. **`bigPackageSizeSupport: true`**
   - 启用分包异步化
   - 单个分包可超过 2MB
   - 总包大小限制提升到 20MB

2. **`lazyCodeLoading: 'requiredComponents'`**
   - 按需注入组件代码
   - 减小启动包大小
   - 提升首屏加载速度

### 2.2 百度小程序分包优化

```typescript
'mp-baidu': {
  usingComponents: true,

  // 编译设置
  compilation: {
    workers: 1,  // 编译进程数
  },

  // 优化设置
  optimization: {
    subPackages: true,  // 启用分包优化
  },
}
```

### 2.3 分包大小限制

不同平台的分包限制:

| 平台 | 主包限制 | 单个分包限制 | 总包限制 |
|------|---------|-------------|---------|
| **微信小程序** | 2MB | 2MB (异步化可突破) | 20MB |
| **支付宝小程序** | 2MB | 2MB | 8MB |
| **百度小程序** | 2MB | 2MB | 8MB |
| **字节小程序** | 2MB | 2MB | 16MB |
| **QQ 小程序** | 2MB | 2MB | 24MB |

**优化策略:**

- 微信小程序启用 `bigPackageSizeSupport`,充分利用 20MB 空间
- 其他平台严格控制分包大小,避免超限
- 大文件 (如图片、视频) 使用 CDN,不打入包内

## 3. 智能分包优化

### 3.1 Bundle Optimizer 插件

项目使用 `@uni-ku/bundle-optimizer` 实现智能分包:

```typescript
// vite/plugins/optimization.ts
import Optimization from '@uni-ku/bundle-optimizer'

export default () => {
  return Optimization({
    // 功能开关
    enable: {
      optimization: true,        // 启用分包优化
      'async-import': true,      // 启用异步导入
      'async-component': true,   // 启用异步组件
    },

    // TypeScript 类型定义
    dts: {
      base: 'src/types',
    },

    // 调试配置
    logger: false,
  })
}
```

### 3.2 自动依赖分析

Bundle Optimizer 会自动分析模块依赖关系:

```
分析流程:
1. 扫描主包和分包的所有模块
2. 构建依赖关系图
3. 识别公共依赖模块
4. 决定模块放置位置 (主包/分包/提取为公共模块)
5. 生成优化后的打包配置
```

**优化效果:**

- **去重** - 公共模块自动提取,避免重复打包
- **体积优化** - 主包体积减小 40-60%
- **加载优化** - 分包按需加载,首屏时间减少 35-50%

### 3.3 异步导入优化

支持跨包异步导入模块:

```vue
<script lang="ts" setup>
// 异步导入分包中的工具函数
const loadAdminUtils = async () => {
  const { validatePermission } = await import(
    '@/pages-sub/admin/utils/permission'
  )
  return validatePermission(user.value)
}

// 异步导入分包组件
const AdminPanel = defineAsyncComponent(
  () => import('@/pages-sub/admin/components/AdminPanel.vue')
)
</script>
```

**使用场景:**

- 延迟加载非首屏功能
- 条件加载特定功能模块
- 减小主包体积

### 3.4 异步组件优化

支持跨包异步加载组件:

```vue
<template>
  <view>
    <!-- 主包组件 -->
    <wd-button @click="showAdminPanel">管理面板</wd-button>

    <!-- 分包异步组件 -->
    <AdminPanel v-if="showPanel" />
  </view>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'

const showPanel = ref(false)

// 异步加载分包组件
const AdminPanel = defineAsyncComponent({
  loader: () => import('@/pages-sub/admin/components/Panel.vue'),
  loadingComponent: LoadingSpinner,  // 加载中显示
  errorComponent: ErrorMessage,       // 加载失败显示
  delay: 200,                         // 延迟显示加载组件
  timeout: 3000,                      // 超时时间
})

const showAdminPanel = () => {
  showPanel.value = true
}
</script>
```

## 4. 分包预下载

### 4.1 预下载配置

在访问主包页面时预下载分包:

```typescript
// 在 uni-pages 插件配置中添加
export default (mode: string) => {
  return UniPages({
    // ... 其他配置

    // 分包预下载规则
    preloadRule: {
      // 访问首页时预下载 admin 分包
      'pages/index/index': {
        network: 'all',              // 网络条件: all/wifi
        packages: ['pages-sub/admin'],
      },

      // 访问登录页时预下载业务分包
      'pages/login/index': {
        network: 'wifi',             // 仅 WiFi 下预下载
        packages: ['pages-sub/business'],
      },
    },
  })
}
```

**配置项说明:**

- `network`:
  - `'all'` - 所有网络环境下预下载 (包括移动网络)
  - `'wifi'` - 仅 WiFi 环境下预下载

- `packages`: 需要预下载的分包列表

### 4.2 预下载策略

```typescript
// 根据用户角色预下载
const preloadRule = {
  'pages/index/index': {
    network: 'all',
    packages: user.isAdmin
      ? ['pages-sub/admin']           // 管理员预下载管理分包
      : ['pages-sub/business'],       // 普通用户预下载业务分包
  },
}
```

**策略建议:**

- **高频访问分包** - 使用 `network: 'all'`,提前下载
- **低频访问分包** - 使用 `network: 'wifi'`,节省流量
- **大体积分包** - 仅 WiFi 下预下载,避免消耗流量
- **条件预下载** - 根据用户角色、权限动态决定

### 4.3 手动触发预下载

```vue
<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 页面加载后 1 秒触发预下载
  setTimeout(() => {
    uni.preloadPage({
      url: '/pages-sub/admin/user/index',
    })
  }, 1000)
})
</script>
```

## 5. 独立分包

### 5.1 独立分包配置

独立分包无需下载主包即可运行:

```json
{
  "subPackages": [
    {
      "root": "pages-sub/marketing",
      "pages": [
        {
          "path": "activity/index"
        }
      ],
      "independent": true
    }
  ]
}
```

**使用场景:**

- **营销活动页** - 独立入口,无需加载主包
- **广告落地页** - 快速打开,提升转化率
- **分享页面** - 独立访问,减少加载时间

### 5.2 独立分包限制

独立分包的限制:

- ❌ 无法访问主包的页面
- ❌ 无法使用主包的自定义组件 (需在分包内复制)
- ❌ 无法访问主包的 `app.vue` 定义的全局数据
- ✅ 可以使用 npm 包和工具函数
- ✅ 可以独立配置 `tabBar`

### 5.3 独立分包最佳实践

```vue
<!-- pages-sub/marketing/activity/index.vue -->
<template>
  <view class="activity-page">
    <!-- 独立分包页面内容 -->
    <view class="header">限时活动</view>
    <view class="content">
      <!-- 活动详情 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
// 独立分包需要自己实现工具函数
import { formatDate } from './utils/date'

// 无法访问主包的 Pinia Store
// 需要使用本地状态管理
const activityData = ref(null)

onMounted(async () => {
  // 独立请求数据
  activityData.value = await fetchActivity()
})
</script>
```

## 6. 分包路由管理

### 6.1 路由跳转

跳转到分包页面:

```vue
<script lang="ts" setup>
// 跳转到分包页面
const goToUserManage = () => {
  uni.navigateTo({
    url: '/pages-sub/admin/user/index',
  })
}

// 使用 TypeScript 类型提示 (由 uni-pages 插件生成)
import type { PagePath } from '@/types/uni-pages'

const navigateToPage = (path: PagePath) => {
  uni.navigateTo({ url: path })
}

// 调用时有完整的路径提示
navigateToPage('/pages-sub/admin/user/index')
</script>
```

### 6.2 路由工具封装

```typescript
// src/utils/route.ts
import type { PagePath } from '@/types/uni-pages'

/**
 * 类型安全的路由跳转
 */
export const navigateTo = (url: PagePath, params?: Record<string, any>) => {
  let fullUrl = url

  // 拼接参数
  if (params) {
    const query = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    fullUrl = `${url}?${query}`
  }

  uni.navigateTo({ url: fullUrl })
}

/**
 * 重定向到分包页面
 */
export const redirectTo = (url: PagePath) => {
  uni.redirectTo({ url })
}

/**
 * 切换到 Tab 页面
 */
export const switchTab = (url: PagePath) => {
  uni.switchTab({ url })
}
```

**使用示例:**

```vue
<script lang="ts" setup>
import { navigateTo } from '@/utils/route'

const goToUserDetail = (userId: string) => {
  navigateTo('/pages-sub/admin/user/detail', {
    id: userId,
  })
}
</script>
```

### 6.3 分包页面参数传递

```vue
<!-- 源页面 -->
<script lang="ts" setup>
const goToDetail = () => {
  uni.navigateTo({
    url: '/pages-sub/admin/user/detail?id=123&name=张三',
  })
}
</script>

<!-- 分包目标页面 -->
<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'

onLoad((options) => {
  const userId = options.id     // '123'
  const userName = options.name // '张三'

  // 加载用户详情
  loadUserDetail(userId)
})
</script>
```

## 7. 分包体积优化

### 7.1 分析分包大小

```bash
# 构建微信小程序
pnpm build:mp-weixin

# 查看各分包大小
cd dist/build/mp-weixin

# 主包大小
du -sh common/
du -sh pages/

# 分包大小
du -sh pages-sub/admin/
du -sh pages-sub/business/
```

### 7.2 优化策略

**1. 图片优化**

```vue
<template>
  <!-- ❌ 避免:本地大图 -->
  <image src="@/static/large-image.png" />

  <!-- ✅ 推荐:使用 CDN -->
  <image :src="cdnUrl + '/images/banner.png'" />

  <!-- ✅ 推荐:Base64 小图标 (< 5KB) -->
  <image src="data:image/png;base64,iVBORw0KG..." />
</template>
```

**2. 代码分割**

```typescript
// ❌ 避免:全量导入
import * as utils from '@/utils'

// ✅ 推荐:按需导入
import { formatDate, formatMoney } from '@/utils/format'
```

**3. 条件编译**

```vue
<script lang="ts" setup>
// #ifdef MP-WEIXIN
import { wxLogin } from '@/utils/wx'
// #endif

// #ifdef H5
import { h5Login } from '@/utils/h5'
// #endif
</script>
```

**4. Tree Shaking**

```typescript
// utils/index.ts
export { formatDate } from './date'
export { formatMoney } from './money'
export { validateEmail } from './validate'

// ✅ 只会打包用到的函数
import { formatDate } from '@/utils'
```

### 7.3 分包大小监控

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 生成分析报告
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 自定义代码分割
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          if (id.includes('pages-sub/admin')) {
            return 'admin'
          }
        },
      },
    },
  },
})
```

## 8. 分包加载性能优化

### 8.1 首屏优化

```vue
<script lang="ts" setup>
// App.vue - 应用启动时
onLaunch(() => {
  // 1. 必要的同步初始化
  initI18n()
  initTheme()

  // 2. 延迟初始化非首屏功能
  setTimeout(() => {
    // 预加载管理分包 (如果用户有权限)
    if (hasAdminPermission()) {
      uni.preloadPage({
        url: '/pages-sub/admin/index',
      })
    }
  }, 1000)
})
</script>
```

### 8.2 懒加载组件

```vue
<template>
  <view>
    <!-- 首屏内容 -->
    <view class="header">标题</view>

    <!-- 懒加载分包组件 -->
    <AdminPanel v-if="showPanel" />
  </view>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'

const showPanel = ref(false)

// 懒加载分包组件
const AdminPanel = defineAsyncComponent(
  () => import('@/pages-sub/admin/components/Panel.vue')
)

// 用户交互时才加载
const handleShowPanel = () => {
  showPanel.value = true
}
</script>
```

### 8.3 分包缓存策略

```typescript
// 使用缓存减少重复加载
import { cache } from '@/utils/cache'

const loadSubPackageData = async () => {
  // 尝试从缓存读取
  const cached = cache.get<AdminData>('admin_data')
  if (cached) {
    return cached
  }

  // 缓存未命中,加载数据
  const data = await fetchAdminData()

  // 缓存结果 (10分钟)
  cache.set('admin_data', data, 10 * 60)

  return data
}
```

## 9. 最佳实践

### 9.1 分包划分原则

**按功能模块划分:**

```
✅ 好的划分:
- pages/             - 核心页面 (首页、登录等)
- pages-sub/admin/   - 管理功能
- pages-sub/business/ - 业务功能
- pages-sub/user/    - 用户中心

❌ 不好的划分:
- pages-sub/module1/ - 不清晰的命名
- pages-sub/temp/    - 临时页面混杂
```

**控制分包大小:**

```
单个分包建议:
- 小型分包: < 500KB
- 中型分包: 500KB - 1MB
- 大型分包: 1MB - 2MB
- 避免超过 2MB (除非启用异步化)
```

### 9.2 主包内容选择

**应该放在主包:**

- ✅ 核心页面 (首页、登录、个人中心)
- ✅ UI 组件库 (WD UI)
- ✅ 公共工具函数
- ✅ 状态管理 (Pinia)
- ✅ 路由配置
- ✅ 全局样式

**不应该放在主包:**

- ❌ 低频访问的功能页面
- ❌ 管理后台功能
- ❌ 大型业务模块
- ❌ 演示/测试页面

### 9.3 分包依赖管理

```vue
<script lang="ts" setup>
// ✅ 好的实践:使用主包的公共模块
import { formatDate } from '@/utils/date'
import { useUserStore } from '@/stores/user'

// ❌ 避免:分包间相互依赖
// import { adminUtils } from '@/pages-sub/admin/utils'

// ✅ 推荐:分包独立功能
const loadAdminData = async () => {
  // 分包内部的数据加载逻辑
}
</script>
```

### 9.4 分包更新策略

```typescript
// 主包更新:影响所有功能
// 需要用户重新打开小程序

// 分包更新:仅影响特定功能
// 可以做到局部更新

// 更新检查
uni.getUpdateManager().onCheckForUpdate((res) => {
  if (res.hasUpdate) {
    console.log('有新版本')
  }
})
```

## 10. 常见问题

### 10.1 分包加载失败

**问题现象:**

- 跳转分包页面时白屏
- 控制台报错: `[分包] 加载失败`

**问题原因:**

- 分包配置错误
- 分包路径不正确
- 网络问题导致分包下载失败

**解决方案:**

```typescript
// 1. 检查分包配置
// vite/plugins/uni-pages.ts
subPackages: [
  'src/pages-sub/admin',  // ✅ 正确:src 开头
  // 'pages-sub/admin',   // ❌ 错误:缺少 src
]

// 2. 检查跳转路径
uni.navigateTo({
  url: '/pages-sub/admin/user/index',  // ✅ 正确:绝对路径
  // url: 'pages-sub/admin/user/index', // ❌ 错误:缺少 /
})

// 3. 添加错误处理
uni.navigateTo({
  url: '/pages-sub/admin/user/index',
  fail: (err) => {
    console.error('跳转失败:', err)
    uni.showToast({
      title: '页面加载失败',
      icon: 'none',
    })
  },
})
```

### 10.2 分包体积超限

**问题原因:**

- 分包包含大量图片/资源
- 未启用代码压缩
- 重复打包公共模块

**解决方案:**

```typescript
// 1. 启用分包异步化 (微信小程序)
'mp-weixin': {
  setting: {
    bigPackageSizeSupport: true,
  },
}

// 2. 图片使用 CDN
const imageUrl = 'https://cdn.example.com/banner.png'

// 3. 启用代码压缩
build: {
  minify: 'esbuild',
  target: 'es6',
}

// 4. 使用 Bundle Optimizer 去重
vitePlugins.push(createOptimization())
```

### 10.3 分包间无法共享组件

**问题原因:**

- 分包 A 的组件无法在分包 B 中使用
- 组件未放在主包或公共目录

**解决方案:**

```typescript
// ✅ 方案 1:组件放在主包
src/components/UserCard.vue  // 主包组件,所有分包可用

// ✅ 方案 2:使用异步组件跨包引用 (需 Bundle Optimizer)
const UserCard = defineAsyncComponent(
  () => import('@/pages-sub/admin/components/UserCard.vue')
)

// ❌ 避免:分包间直接引用
// import UserCard from '@/pages-sub/other/components/UserCard.vue'
```

### 10.4 独立分包无法访问主包

**问题原因:**

- 独立分包设计如此,无法访问主包资源

**解决方案:**

```vue
<!-- 独立分包页面 -->
<script lang="ts" setup>
// ❌ 无法使用主包的 Store
// import { useUserStore } from '@/stores/user'

// ✅ 使用独立的数据管理
const userData = ref(null)

// ✅ 复制必要的工具函数到分包
import { formatDate } from './utils/date'

// ✅ 独立请求数据
onMounted(async () => {
  userData.value = await fetchUserData()
})
</script>
```

### 10.5 分包预下载不生效

**问题原因:**

- 预下载配置错误
- 网络条件不满足
- 用户禁用了预下载

**解决方案:**

```typescript
// 1. 检查预下载配置
preloadRule: {
  'pages/index/index': {
    network: 'all',  // ✅ 确保网络条件正确
    packages: ['pages-sub/admin'],  // ✅ 分包路径正确
  },
}

// 2. 手动触发预下载
uni.preloadPage({
  url: '/pages-sub/admin/user/index',
  success: () => {
    console.log('预下载成功')
  },
  fail: (err) => {
    console.error('预下载失败:', err)
  },
})

// 3. 检查预下载状态
uni.getNetworkType({
  success: (res) => {
    console.log('网络类型:', res.networkType)
    // 根据网络类型决定是否预下载
  },
})
```

## 11. 性能监控

### 11.1 分包加载时间

```typescript
// 监控分包加载性能
const monitorSubPackageLoad = (packageName: string) => {
  const startTime = Date.now()

  uni.navigateTo({
    url: `/pages-sub/${packageName}/index`,
    success: () => {
      const loadTime = Date.now() - startTime
      console.log(`分包 ${packageName} 加载时间: ${loadTime}ms`)

      // 上报性能数据
      reportPerformance({
        type: 'subpackage_load',
        package: packageName,
        duration: loadTime,
      })
    },
  })
}
```

### 11.2 分包大小统计

```typescript
// 获取分包信息 (仅开发环境)
if (import.meta.env.DEV) {
  const packageInfo = {
    main: '1.8MB',
    'pages-sub/admin': '1.2MB',
    'pages-sub/business': '0.8MB',
    total: '3.8MB',
  }

  console.table(packageInfo)
}
```

### 11.3 性能优化建议

```typescript
// 性能评分系统
const getPerformanceScore = () => {
  const metrics = {
    mainPackageSize: 1.8,      // MB
    subPackageCount: 2,
    totalSize: 3.8,            // MB
    firstScreenTime: 800,      // ms
  }

  // 评分规则
  const score = {
    mainPackage: metrics.mainPackageSize < 2 ? 100 : 50,
    totalSize: metrics.totalSize < 20 ? 100 : 50,
    firstScreen: metrics.firstScreenTime < 1000 ? 100 : 50,
  }

  const average = Object.values(score).reduce((a, b) => a + b, 0) / 3

  return {
    score: Math.round(average),
    grade: average >= 90 ? 'A' : average >= 80 ? 'B' : 'C',
    metrics,
  }
}
```

## 12. 分包优化清单

### 配置优化

- [ ] 启用自动化分包配置 (uni-pages 插件)
- [ ] 配置分包预下载规则
- [ ] 启用小程序分包异步化
- [ ] 启用按需注入 (lazyCodeLoading)

### 代码优化

- [ ] 使用 Bundle Optimizer 插件
- [ ] 主包仅包含核心功能
- [ ] 分包按功能模块划分
- [ ] 避免分包间相互依赖

### 资源优化

- [ ] 图片使用 CDN
- [ ] 启用代码压缩
- [ ] 使用 Tree Shaking
- [ ] 条件编译去除冗余代码

### 加载优化

- [ ] 配置合理的预下载策略
- [ ] 使用异步组件懒加载
- [ ] 分包数据缓存
- [ ] 首屏优化

### 监控优化

- [ ] 监控分包加载时间
- [ ] 统计分包体积
- [ ] 建立性能基准
- [ ] 定期优化分析

## 总结

分包加载优化是 UniApp 应用性能优化的基石。通过合理的分包架构设计、自动化配置、智能优化插件和预加载策略,RuoYi-Plus-UniApp 项目实现了主包体积 < 2MB、首屏加载时间 < 800ms 的优异表现。开发者应遵循按功能模块划分、主包最小化、资源 CDN 化、按需加载等最佳实践,充分利用分包异步化、独立分包、分包预下载等高级特性,持续优化分包策略,为用户提供快速、流畅的应用体验。

**关键要点:**

1. **合理划分** - 按功能模块划分分包,主包仅保留核心功能
2. **智能优化** - 使用 Bundle Optimizer 自动去重和优化
3. **按需加载** - 分包预下载 + 异步组件懒加载
4. **突破限制** - 启用分包异步化,充分利用 20MB 空间
5. **持续监控** - 监控分包大小和加载性能,定期优化
