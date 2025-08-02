# 项目结构

```text
📁 plus-uniapp (项目根目录)
├── 📁 dist                         // 构建输出目录
├── 📁 env                          // 环境配置
│   ├── 📄 .env                     // 基础环境配置
│   ├── 📄 .env.development         // 开发环境配置
│   └── 📄 .env.production          // 生产环境配置
├── 📁 node_modules                 // 依赖包目录
├── 📁 src                          // 源码目录
│   ├── 📁 api                      // API 接口管理
│   │   ├── 📁 business             // 业务相关接口
│   │   └── 📁 system               // 系统相关接口
│   │
│   ├── 📁 components               // 全局组件
│   │
│   ├── 📁 composables              // 组合式函数
│   │   ├── 📄 useAuth.ts           // 权限相关组合函数
│   │   ├── 📄 useDict.ts           // 字典相关组合函数
│   │   ├── 📄 useHttp.ts           // HTTP 请求组合函数
│   │   ├── 📄 usePayment.ts        // 支付相关组合函数
│   │   ├── 📄 useScroll.ts         // 滚动相关组合函数
│   │   ├── 📄 useTheme.ts          // 主题相关组合函数
│   │   └── 📄 useToken.ts          // Token 管理组合函数
│   │
│   ├── 📁 layouts                  // 布局组件
│   │   └── 📄 default.vue          // 默认布局
│   │
│   ├── 📁 pages                    // 页面文件
│   │   ├── 📁 auth                 // 认证相关页面
│   │   │   ├── 📁 components       // 认证页面组件
│   │   │   │   └── 📄 AuthModal.vue        // 认证模态框组件
│   │   │   ├── 📄 auth.vue         // 认证页面
│   │   │   ├── 📄 login.vue        // 登录页面
│   │   │   ├── 📄 phoneLogin.vue   // 手机登录页面
│   │   │   ├── 📄 register.vue     // 注册页面
│   │   │   └── 📄 smsVerify.vue    // 短信验证页面
│   │   │
│   │   ├── 📁 tabbar               // 底部导航页面
│   │   │   ├── 📁 components       // 底部导航组件
│   │   │   │   ├── 📄 index.vue    // 底部导航主组件
│   │   │   │   ├── 📄 Menu.vue     // 菜单组件
│   │   │   │   └── 📄 My.vue       // 我的页面组件
│   │   │   └── 📄 index.vue        // 底部导航入口
│   │
│   ├── 📁 static                   // 静态资源
│   │   ├── 📁 app                  // 应用相关静态资源
│   │   ├── 📁 images               // 图片资源
│   │   ├── 📁 style                // 样式文件
│   │   └── 📄 logo.png             // Logo 图片
│   │
│   ├── 📁 stores                   // Pinia 状态管理
│   │   ├── 📁 modules              // 状态模块
│   │   │   ├── 📄 dict.ts          // 字典状态管理
│   │   │   ├── 📄 tabbar.ts        // 底部
│   │   │   └── 📄 user.ts          // 用户状态管理
│   │   └── 📄 store.ts             // 状态管理入口
│   │
│   ├── 📁 subpackages              // 分包目录
│   │   ├── 📁 admin                // 管理员分包
│   │   └── 📁 demo                 // 示例代码分包
│   │
│   ├── 📁 uni_modules              // UniApp 模块
│   │
│   ├── 📁 utils                    // 工具函数
│   │   ├── 📄 boolean.ts           // 布尔值相关工具
│   │   ├── 📄 cache.ts             // 缓存相关工具
│   │   ├── 📄 crypto.ts            // 加密相关工具
│   │   ├── 📄 date.ts              // 日期相关工具
│   │   ├── 📄 format.ts            // 格式化相关工具
│   │   ├── 📄 function.ts          // 函数相关工具
│   │   ├── 📄 platform.ts          // 平台相关工具
│   │   ├── 📄 route.ts             // 路由相关工具
│   │   ├── 📄 rsa.ts               // RSA 加密工具
│   │   ├── 📄 string.ts            // 字符串相关工具
│   │   ├── 📄 tenant.ts            // 租户相关工具
│   │   ├── 📄 to.ts                // 安全异步执行工具
│   │   └── 📄 validators.ts        // 表单验证工具
│   │
│   └── 📁 wd                       // WotUI 重构组件库相关
│   ├── 📄 App.vue                  // 应用入口组件
│   ├── 📄 main.ts                  // 应用入口文件
│   ├── 📄 manifest.json            // 应用配置清单
│   ├── 📄 pages.json               // 页面路由配置
│   ├── 📄 systemConfig.ts          // 系统配置
│   └── 📄 uni.scss                 // 全局样式
│
├── 📁 vite                         // 插件目录
│
├── 📄 .gitignore                   // Git 忽略文件配置
├── 📄 eslint.config.mjs            // ESLint 配置
├── 📄 package.json                 // 项目依赖配置
├── 📄 pnpm-lock.yaml               // 依赖锁定文件
├── 📄 prettier.config.js           // Prettier 配置
├── 📄 README.md                    // 项目说明文档
├── 📄 tsconfig.json                // TypeScript 配置
├── 📄 unocss.config.ts             // UnoCSS 配置
└── 📄 vite.config.ts               // Vite 构建配置
```
