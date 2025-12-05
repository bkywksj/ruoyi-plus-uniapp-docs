# 移动端配置文件说明文档

## 技术栈概述

本项目基于 uni-app + Vue 3 + TypeScript 构建的跨平台移动端应用，支持多个平台同时开发：

- **开发框架**: uni-app (基于Vue 3)
- **开发语言**: TypeScript 5.x
- **构建工具**: Vite 5.x + uni-app官方插件
- **UI组件库**: wot-design-uni
- **CSS框架**: UnoCSS (支持uni-app)
- **代码规范**: @uni-helper/eslint-config
- **支持平台**: 微信小程序、支付宝小程序、H5、App、百度/字节/QQ小程序等

---

## 支持平台

### 小程序平台

- **微信小程序** - 主要平台
- **支付宝小程序** - 支付场景
- **百度小程序** - 搜索入口
- **字节跳动小程序** - 抖音生态
- **QQ小程序** - QQ生态
- **快手小程序** - 短视频场景
- **其他小程序等** - 支持更多小程序平台

### 移动应用

- **H5** - 移动端网页
- **Android App** - 原生安卓应用
- **iOS App** - 原生苹果应用

---

## 配置文件结构

### 1. 环境变量配置

#### 1.1 基础环境配置 (`.env`)

```bash
# ===== 应用基础配置 =====
VITE_APP_ID = 'ryplus_uni'                    # 应用唯一标识符
VITE_APP_TITLE = 'ryplus-uni'                 # 应用名称
VITE_APP_PORT = '100'                         # 开发服务器端口
VITE_UNI_APPID = 'UNI__6E229FA'              # uni-app应用ID

# ===== 各平台小程序APPID配置 =====
VITE_WECHAT_MINI_APP_ID = 'wxd44a6eaefd42428c'        # 微信小程序APPID
VITE_WECHAT_OFFICIAL_APP_ID = 'wx08728cf8ec97725f'     # 微信公众号APPID
VITE_ALIPAY_MINI_APP_ID = 'your_alipay_app_id'        # 支付宝小程序APPID
VITE_BYTEDANCE_MINI_APP_ID = 'your_bytedance_app_id'   # 字节跳动小程序APPID
VITE_BAIDU_MINI_APP_ID = 'your_baidu_app_id'          # 百度小程序APPID
VITE_QQ_MINI_APP_ID = 'your_qq_app_id'                # QQ小程序APPID

# ===== H5部署配置 =====
VITE_APP_PUBLIC_BASE = '/'                    # H5部署基础路径

# ===== 安全配置 =====
VITE_APP_API_ENCRYPT = 'true'                 # 接口加密开关
VITE_APP_RSA_PUBLIC_KEY = 'MFww...'           # RSA加密公钥 (与后端配对，与下方的私钥不是同一对)
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOw...'        # RSA解密私钥 (与后端配对)

# ===== 功能开关 =====
VITE_APP_WEBSOCKET = 'false'                  # WebSocket开关
VITE_APP_SSE = 'false'                        # SSE开关(小程序不支持)
```

#### 1.2 开发环境配置 (`.env.development`)

```bash
VITE_APP_ENV = 'development'                  # 环境标识
VITE_APP_BASE_API = 'https://api.ruoyikj.top/frp/5500'  # 开发环境API地址
VITE_DELETE_CONSOLE = false                   # 保留console调试
VITE_SHOW_SOURCEMAP = true                    # 开启sourcemap调试
```

#### 1.3 生产环境配置 (`.env.production`)

```bash
VITE_APP_ENV = 'production'                   # 生产环境标识
VITE_APP_BASE_API = 'https://uni.ruoyi.plus/ryplus_uni'  # 生产环境API地址
VITE_DELETE_CONSOLE = true                    # 删除console
VITE_SHOW_SOURCEMAP = false                   # 关闭sourcemap
```

---

### 2. 应用清单配置 (`manifest.config.ts`)

#### 2.1 基础应用信息

```typescript
export default defineManifestConfig({
  name: VITE_APP_TITLE,                        // 应用名称
  appid: VITE_UNI_APPID,                      // uni-app应用ID
  description: 'ryplus-uni',                  // 应用描述
  versionName: '5.x.x',                       // 版本名称
  versionCode: '100',                         // 版本号
  transformPx: false,                         // 是否转换px单位
  locale: 'zh-Hans',                          // 默认语言
})
```

#### 2.2 H5平台配置

```typescript
h5: {
  router: {
    base: VITE_APP_PUBLIC_BASE,               // 路由基础路径
  },
  title: VITE_APP_TITLE,                      // 页面标题
  template: 'index.html',                     // HTML模板
  devServer: {
    https: false,                             // 开发服务器HTTPS
  },
}
```

#### 2.3 App平台配置

```typescript
'app-plus': {
  usingComponents: true,                      // 启用自定义组件
  nvueStyleCompiler: 'uni-app',              // nvue样式编译器
  compilerVersion: 3,                        // 编译器版本
  
  // 启动界面配置
  splashscreen: {
    alwaysShowBeforeRender: true,             // 总是显示启动界面
    waiting: true,                            // 等待首页渲染完成
    autoclose: true,                          // 自动关闭
    delay: 0,                                 // 延迟时间
  },
  
  // 打包配置
  distribute: {
    android: {
      minSdkVersion: 30,                      // 最低SDK版本
      targetSdkVersion: 30,                   // 目标SDK版本
      abiFilters: ['armeabi-v7a', 'arm64-v8a'], // 支持的CPU架构
      permissions: [                          // 权限配置
        '<uses-permission android:name="android.permission.CAMERA"/>',
        '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
        // ... 更多权限
      ],
    },
    ios: {},                                  // iOS配置
    icons: {                                  // 应用图标配置
      android: {
        hdpi: 'static/app/icons/72x72.png',
        xhdpi: 'static/app/icons/96x96.png',
        // ... 各种尺寸图标
      },
      ios: {
        // iOS各种尺寸图标配置
      },
    },
  },
}
```

#### 2.4 小程序平台配置

```typescript
// 微信小程序
'mp-weixin': {
  appid: VITE_WECHAT_MINI_APP_ID,             // 微信小程序APPID
  setting: {
    urlCheck: false,                          // 不检查安全域名
    es6: true,                                // 启用ES6转ES5
    enhance: true,                            // 启用增强编译
    postcss: true,                            // 启用postcss
    minified: true,                           // 压缩代码
    bigPackageSizeSupport: true,              // 支持分包异步化
  },
  usingComponents: true,                      // 启用自定义组件
  permission: {                               // 权限配置
    'scope.userLocation': {
      desc: '您的位置信息将用于小程序位置接口的效果展示'
    }
  },
  requiredPrivateInfos: [                     // 隐私信息配置
    'getLocation',
    'chooseLocation'
  ],
},

// 支付宝小程序
'mp-alipay': {
  appid: VITE_ALIPAY_MINI_APP_ID,
  usingComponents: true,
  styleIsolation: 'shared',                   // 样式隔离模式
},

// 其他小程序平台配置类似...
```

---

### 3. 页面路由配置 (`pages.config.ts`)

```typescript
export default defineUniPages({
  // 全局页面样式配置
  globalStyle: {
    navigationBarTitleText: 'ryplus-uni',     // 默认导航栏标题
    navigationStyle: 'custom',                // 自定义导航栏
    
    // 支付宝小程序特殊配置
    'mp-alipay': {
      'transparentTitle': 'always',           // 透明标题栏
      'titlePenetrate': 'YES'                 // 标题栏点击穿透
    },
    
    // H5端配置
    'h5': {
      'titleNView': false                     // 不显示原生标题栏
    },
    
    // APP端防抖动配置
    'app-plus': {
      'bounce': 'none',                       // 禁用页面弹性效果
    },
  },
  
  // 组件自动导入配置
  easycom: {
    autoscan: true,                           // 自动扫描components目录
    custom: {
      // wot-design-uni组件库自动导入
      '^wd-(.*)': '@/wd/components/wd-$1/wd-$1.vue'
    }
  }
})
```

---

### 4. TypeScript 配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2015",                       // 编译目标(小程序兼容)
    "composite": true,                        // 复合项目模式
    "lib": ["esnext", "dom"],                 // 包含的库
    "baseUrl": ".",                           // 基础目录
    "module": "ESNext",                       // 模块系统
    "moduleResolution": "Node",               // 模块解析策略
    
    // 路径别名配置
    "paths": {
      "@/*": ["./src/*"],                     // @ 指向 src
      "@img/*": ["./src/static/*"]            // @img 指向静态资源
    },
    
    // uni-app相关类型定义
    "types": [
      "@dcloudio/types",                      // uni-app核心类型
      "@uni-helper/uni-types",                // uni-helper类型增强
      "@types/wechat-miniprogram",            // 微信小程序类型
      "wot-design-uni/global.d.ts",          // wot-design-uni组件类型
      "z-paging/types",                       // z-paging分页组件类型
      "./src/typings.d.ts"                    // 自定义类型定义
    ],
    
    "allowJs": true,                          // 允许JS文件
    "allowSyntheticDefaultImports": true,     // 允许合成默认导入
    "skipLibCheck": true                      // 跳过库文件检查
  },
  
  // Vue编译器选项
  "vueCompilerOptions": {
    "plugins": [
      "@uni-helper/uni-types/volar-plugin"    // uni-app类型增强插件
    ]
  }
}
```

---

### 5. 代码规范配置 (`eslint.config.mjs`)

```javascript
import uniHelper from '@uni-helper/eslint-config'

export default uniHelper({
  // ===== 功能开关 =====
  unocss: true,                               // 启用UnoCSS支持
  vue: true,                                  // 启用Vue 3支持
  markdown: false,                            // 禁用Markdown检查
  
  // ===== 忽略文件 =====
  ignores: [
    'src/uni_modules/',                       // uni-app插件目录
    'dist',                                   // 构建输出
    'auto-imports.d.ts',                      // 自动导入类型文件
    'uni-pages.d.ts',                         // 页面类型文件
    'src/pages.json',                         // 自动生成的页面配置
    'src/manifest.json',                      // 自动生成的应用配置
  ],
  
  // ===== 自定义规则 =====
  rules: {
    'no-console': 'off',                      // 允许console(调试需要)
    'no-unused-vars': 'off',                  // 关闭未使用变量检查
    'vue/no-unused-refs': 'off',              // 允许未使用的ref
    'vue/block-order': 'off',                 // 不强制block顺序
    'func-style': 'off',                      // 关闭函数风格检查
    'antfu/top-level-function': 'off',        // 关闭顶层函数检查
    'style/brace-style': 'off',               // 关闭大括号风格检查
    'style/quote-props': 'off',               // 关闭引号风格检查
    // ... 更多规则配置
  },
  
  // ===== 格式化配置 =====
  formatters: {
    css: true,                                // 启用CSS格式化
    html: true,                               // 启用HTML格式化
  },
})
```

---

### 6. 样式配置 (`uno.config.ts`)

```typescript
import { presetUni } from '@uni-helper/unocss-preset-uni'

export default defineConfig({
  // uni-app专用预设
  presets: [
    presetUni({
      attributify: {
        prefixedOnly: true,                   // 只支持前缀属性化
      },
    }),
    presetIcons({                             // 图标支持
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetAttributify(),                      // 属性化支持
  ],
  
  // 转换器
  transformers: [
    transformerDirectives(),                  // @apply等指令支持
    transformerVariantGroup(),                // 变体组支持
  ],
  
  // 快捷方式
  shortcuts: [
    {
      center: 'flex justify-center items-center',
    },
  ],
  
  // 自定义规则(适配移动端)
  rules: [
    ['p-safe', {                              // 安全区域内边距
      padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    }],
    ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],
  
  // 主题配置
  theme: {
    colors: {
      primary: 'var(--wot-color-theme,#0957DE)', // 主题色
    },
    fontSize: {
      '2xs': ['20rpx', '28rpx'],              // 超小号字体(rpx单位)
      '3xs': ['18rpx', '26rpx'],
    },
  },
})
```

---

### 7. 构建配置 (`vite.config.ts`)

```typescript
export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  const { UNI_PLATFORM } = process.env        // 获取当前构建平台
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  
  return defineConfig({
    envDir: './env',                          // 环境变量目录
    
    plugins: await createVitePlugins({        // uni-app插件配置
      command,
      mode,
      env,
    }),
    
    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM), // 平台标识
    },
    
    // 路径别名
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src'),
        '@img': path.join(process.cwd(), './src/static/images'),
      },
    },
    
    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      hmr: true,                              // 热更新
      port: Number.parseInt(VITE_APP_PORT, 10),
    },
    
    // 依赖优化
    optimizeDeps: {
      include: [
        'jsencrypt/bin/jsencrypt.min.js',     // 加密库
        'crypto-js',                          // 加密工具
      ],
    },
    
    // 构建配置
    build: {
      target: 'es6',                          // 构建目标
      minify: mode === 'development' ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: VITE_DELETE_CONSOLE === 'true',
          drop_debugger: true,
        },
      },
    },
  })
}
```

---

## 开发命令

### 1. 开发环境

```bash
# H5开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin

# 支付宝小程序开发
pnpm dev:mp-alipay

# App开发
pnpm dev:app

# 其他小程序平台
pnpm dev:mp-baidu
pnpm dev:mp-toutiao
pnpm dev:mp-qq
```

### 2. 生产构建

```bash
# H5构建
pnpm build:h5

# 小程序构建
pnpm build:mp-weixin
pnpm build:mp-alipay

# App构建
pnpm build:app

# 所有平台构建
pnpm build:all-mp
```

---

## 平台差异处理

### 1. 条件编译

```vue
<template>
  <!-- #ifdef MP-WEIXIN -->
  <view>仅微信小程序显示</view>
  <!-- #endif -->
  
  <!-- #ifdef H5 -->
  <view>仅H5显示</view>
  <!-- #endif -->
  
  <!-- #ifndef APP-PLUS -->
  <view>除App外都显示</view>
  <!-- #endif -->
</template>

<script>
// #ifdef MP-WEIXIN
import weixinAPI from '@/utils/weixin'
// #endif

// #ifdef APP-PLUS
import appAPI from '@/utils/app'
// #endif
</script>

<style>
/* #ifdef MP-WEIXIN */
.weixin-style {
  color: #00d4aa;
}
/* #endif */
</style>
```

### 2. 平台API适配

```typescript
// 获取系统信息
const getSystemInfo = () => {
  // #ifdef MP-WEIXIN
  return uni.getSystemInfoSync()
  // #endif
  
  // #ifdef H5
  return {
    platform: 'h5',
    // ... H5特定信息
  }
  // #endif
}

// 支付接口适配
const pay = (options: PayOptions) => {
  // #ifdef MP-WEIXIN
  return uni.requestPayment({
    provider: 'wxpay',
    ...options
  })
  // #endif
  
  // #ifdef MP-ALIPAY
  return uni.requestPayment({
    provider: 'alipay',
    ...options
  })
  // #endif
}
```

---

## 性能优化

### 1. 组件懒加载

```vue
<script setup lang="ts">
// 异步组件
const HeavyComponent = defineAsyncComponent(() => import('@/components/HeavyComponent.vue'))
</script>

<template>
  <Suspense>
    <HeavyComponent />
    <template #fallback>
      <view>加载中...</view>
    </template>
  </Suspense>
</template>
```


## 调试技巧

### 1. 小程序调试

- **微信开发者工具**: 导入`dist/dev/mp-weixin`目录
- **支付宝开发者工具**: 导入`dist/dev/mp-alipay`目录
- **真机调试**: 使用各平台开发者工具的真机预览功能

### 2. H5调试

```bash
# 启动H5开发服务器
pnpm dev:h5

# 浏览器访问
http://localhost:100
```

### 3. App调试

```bash
# 启动App开发
pnpm dev:app

# 使用HBuilderX真机运行
# 或打包成自定义基座进行调试
```

---

## 发布部署

### 1. 小程序发布

1. **构建生产版本**
   ```bash
   pnpm build:mp-weixin
   ```

2. **上传审核**
   - 使用微信开发者工具上传代码
   - 填写版本信息和更新说明
   - 提交审核

3. **发布上线**
   - 审核通过后在小程序后台发布

### 2. H5部署

```bash
# 构建H5版本
pnpm build:h5

# 部署到服务器
# 将dist/build/h5目录内容上传到服务器
```

### 3. App打包

1. **使用HBuilderX云打包**
2. **配置证书和签名**
3. **提交应用商店审核**

---

> 💡 **提示**: 
> - 开发前请确保各平台开发者工具已安装
> - 不同平台特性差异较大，需要针对性测试
> - 建议使用真机测试验证功能完整性
