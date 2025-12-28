# Vite 构建配置

## 概述

Ruoyi-Plus-Uniapp 框架基于 Vite 6.3.2 构建，通过模块化的插件系统和精细的配置策略，提供了极速的开发体验和高效的生产构建。本文档基于项目实际配置，详细介绍 Vite 的配置策略、插件体系和构建优化。

## 主配置文件 (vite.config.ts)

### 核心配置结构

```typescript
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite'
import createPlugins from './vite/plugins'
import autoprefixer from 'autoprefixer'
import path from 'path'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  // 加载自定义环境变量目录
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  
  return defineConfig({
    // 自定义环境变量目录
    envDir: './env',
    
    // 部署基础路径 - 从环境变量获取
    base: env.VITE_APP_CONTEXT_PATH,

    // 路径解析配置
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src')  // @ 指向 src 目录
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    // 插件系统 - 根据构建模式动态配置
    plugins: createPlugins(env, command === 'build'),

    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      allowedHosts: ['.ruoyikj.top'],
      port: Number(env.VITE_APP_PORT),
      strictPort: false,
      open: true,
      
      // API 代理配置
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: 'http://127.0.0.1:' + env.VITE_APP_BASE_API_PORT,
          changeOrigin: true,
          ws: true,  // WebSocket 支持
          rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        }
      }
    },

    // CSS 处理配置
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'  // 使用现代 Sass 编译器
        }
      },
      postcss: {
        plugins: [
          autoprefixer(),  // 自动添加浏览器前缀
          // 移除重复的 @charset 声明
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                atRule.remove()
              }
            }
          }
        ]
      }
    },

    // 依赖预构建优化
    optimizeDeps: {
      include: [
        'vue', 'vue-router', 'pinia', 'axios', '@vueuse/core',
        'echarts', 'vue-i18n', '@vueup/vue-quill', 'image-conversion',
        'element-plus/es/components/**/css', '@umoteam/editor',
        'vue-json-pretty', 'file-saver'
      ]
    }
  })
}
```

## 插件系统架构

### 插件统一管理 (vite/plugins/index.ts)

```typescript
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import createUnoCss from './unocss'
import createAutoImport from './auto-imports'
import createComponents from './components'
import createIcons from './icons'
import createCompression from './compression'
import createSetupExtend from './setup-extend'

export default (viteEnv: any, isBuild = false) => {
  const vitePlugins: any = []

  // Vue 核心插件
  vitePlugins.push(vue())                    // Vue 3 单文件组件支持
  vitePlugins.push(vueDevTools())            // Vue 开发工具增强

  // 样式和UI插件
  vitePlugins.push(createUnoCss())           // 原子化 CSS 引擎

  // 开发效率插件
  vitePlugins.push(createAutoImport(path))   // API 自动导入
  vitePlugins.push(createComponents(path))   // 组件自动注册
  vitePlugins.push(createIcons())            // 图标自动导入

  // 构建优化插件
  vitePlugins.push(createCompression(viteEnv)) // 文件压缩

  // 语法扩展插件  
  vitePlugins.push(createSetupExtend())      // setup 语法扩展

  return vitePlugins
}
```

### 自动导入插件 (auto-imports.ts)

```typescript
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default (path: any) => {
  return AutoImport({
    // 自动导入的库和API
    imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
    
    // 自动导入的目录
    dirs: ['src/composables', 'src/stores/modules'],
    
    // ESLint 自动导入配置
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true
    },
    
    // Element Plus 解析器
    resolvers: [ElementPlusResolver()],
    
    // 在 Vue 模板中自动导入
    vueTemplate: true,
    
    // 类型声明文件路径
    dts: 'src/types/auto-imports.d.ts',
    
    // 设置导入优先级
    defaultExportByFilename: false
  })
}
```

### 组件自动注册插件 (components.ts)

```typescript
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'

export default (path: any) => {
  return Components({
    resolvers: [
      // Element Plus 组件自动导入
      ElementPlusResolver(),
      
      // 图标组件自动注册 - Element Plus 图标集
      IconsResolver({
        enabledCollections: ['ep']
      })
    ],
    
    // 生成组件类型声明文件
    dts: path.resolve(path.join(process.cwd(), './src'), 'types', 'components.d.ts')
  })
}
```

### UnoCSS 配置 (unocss.ts)

```typescript
import UnoCss from 'unocss/vite'

export default () => {
  return UnoCss({
    // 禁用顶层 await 特性，提高低版本浏览器兼容性
    hmrTopLevelAwait: false
  })
}
```

### 图标插件 (icons.ts)

```typescript
import Icons from 'unplugin-icons/vite'

export default () => {
  return Icons({
    // 自动安装图标库 - 使用时自动下载对应图标集
    autoInstall: true
  })
}
```

### 文件压缩插件 (compression.ts)

```typescript
import compression from 'vite-plugin-compression'

export default (env: any) => {
  const { VITE_BUILD_COMPRESS } = env
  const plugin: any[] = []

  if (VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(',')

    // Gzip 压缩配置
    if (compressList.includes('gzip')) {
      plugin.push(
        compression({
          ext: '.gz',                    // 压缩文件扩展名
          deleteOriginFile: false        // 保留原始文件
        })
      )
    }

    // Brotli 压缩配置 - 通常比 Gzip 压缩率更高
    if (compressList.includes('brotli')) {
      plugin.push(
        compression({
          ext: '.br',
          algorithm: 'brotliCompress',   // Brotli 压缩算法
          deleteOriginFile: false
        })
      )
    }
  }

  return plugin
}
```

### Setup 扩展插件 (setup-extend.ts)

```typescript
import setupExtend from 'unplugin-vue-setup-extend-plus/vite'

export default () => {
  return setupExtend({
    // 使用默认配置，为组件添加额外的属性和选项
  })
}
```

## UnoCSS 配置 (uno.config.ts)

### 完整配置架构

```typescript
import {
  defineConfig,
  presetAttributify,    // 属性化模式预设
  presetIcons,         // 图标支持预设
  presetTypography,    // 排版预设
  presetUno,          // 默认工具类预设
  presetWebFonts,     // Web字体预设
  transformerDirectives,    // @apply等指令转换器
  transformerVariantGroup   // 变体组转换器
} from 'unocss'

import { icons } from './src/components/Icon/icons'

export default defineConfig({
  // 快捷方式定义 - 常用样式组合
  shortcuts: {
    'panel-title': 'pb-[5px] font-sans leading-[1.1] font-medium text-base text-[#6379bb] border-b border-b-solid border-[var(--el-border-color-light)] mb-5 mt-0',
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'absolute-center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'card': 'bg-white dark:bg-dark-800 rounded shadow p-4',
    'tag': 'inline-block px-2 py-1 text-xs rounded'
  },

  // 主题配置 - 与CSS变量关联
  theme: {
    colors: {
      // 状态颜色
      'primary': 'var(--el-color-primary)',
      'primary_dark': 'var(--el-color-primary-light-5)',
      'success': 'var(--color-success)',
      'warning': 'var(--color-warning)',
      'danger': 'var(--color-danger)',
      'info': 'var(--color-info)',
      
      // 文本颜色
      'text-base': 'var(--text-color)',
      'text-secondary': 'var(--text-color-secondary)',
      'heading': 'var(--heading-color)',
      
      // 菜单颜色
      'menu-bg': 'var(--menu-bg)',
      'menu-text': 'var(--menu-color)',
      'menu-active': 'var(--menu-active-text)'
    },
    
    // 间距变量
    spacing: {
      'sidebar': 'var(--sidebar-width)',
      'header': 'var(--header-height)',
      'tags-view': 'var(--tags-view-height)'
    }
  },

  // 安全列表 - 确保所有图标类名都被包含
  safelist: [
    ...icons.map((icon) => icon.value)
  ],

  // 自定义规则
  rules: [
    ['sidebar-width', { 'width': 'var(--sidebar-width)' }],
    ['header-height', { 'height': 'var(--header-height)' }],
    ['scrollbar', { 'overflow': 'auto' }],
    ['scrollbar-y', { 'overflow-y': 'auto', 'overflow-x': 'hidden' }],
    ['text-ellipsis', { 'white-space': 'nowrap', 'overflow': 'hidden', 'text-overflow': 'ellipsis' }]
  ],

  // 预设配置
  presets: [
    presetUno(),           // 默认预设
    presetAttributify(),   // 属性化模式
    presetIcons({}),      // 图标预设
    presetTypography(),   // 排版预设
    presetWebFonts({      // Web字体预设
      fonts: {}
    })
  ],

  // 转换器配置
  transformers: [
    transformerDirectives(),     // 支持@apply、@screen等指令
    transformerVariantGroup()    // 变体组语法糖
  ]
})
```

## 构建脚本配置

### Package.json 脚本

```json
{
  "scripts": {
    "dev": "vite serve --mode development",
    "build:prod": "vite build --mode production", 
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint:eslint": "eslint --max-warnings=0 --timeout=60000",
    "lint:eslint:fix": "eslint --fix --timeout=60000",
    "prettier": "prettier --write ."
  }
}
```

### 构建目标和兼容性

```json
{
  "browserslist": [
    "Chrome >= 87",
    "Edge >= 88", 
    "Safari >= 14",
    "Firefox >= 78"
  ]
}
```

## 环境变量配置

### 环境变量结构

```
env/
├── .env                    # 公共配置
├── .env.development        # 开发环境
└── .env.production         # 生产环境
```

### 主要环境变量

```bash
# 应用配置
VITE_APP_TITLE = 'ryplus-uni后台管理'
VITE_APP_ID = 'ryplus_uni'
VITE_APP_CONTEXT_PATH = '/'

# API配置
VITE_APP_BASE_API = '/dev-api'
VITE_APP_BASE_API_PORT = 5500
VITE_APP_PORT = 3000

# 安全配置
VITE_APP_API_ENCRYPT = 'true'
VITE_APP_RSA_PUBLIC_KEY = '...'
VITE_APP_RSA_PRIVATE_KEY = '...'

# 功能开关
VITE_APP_WEBSOCKET = 'true'
VITE_APP_SSE = 'false'

# 构建优化
VITE_BUILD_COMPRESS = 'gzip,brotli'
```

## 依赖管理策略

### 核心依赖

```json
{
  "dependencies": {
    "vue": "3.5.13",
    "vue-router": "4.5.0", 
    "pinia": "3.0.2",
    "element-plus": "2.9.8",
    "@element-plus/icons-vue": "2.3.1",
    "axios": "1.8.4",
    "@vueuse/core": "13.1.0"
  }
}
```

### 开发依赖

```json
{
  "devDependencies": {
    "@vitejs/plugin-vue": "5.2.3",
    "vite": "6.3.2",
    "typescript": "~5.8.3",
    "unocss": "66.0.0",
    "unplugin-auto-import": "19.1.2",
    "unplugin-vue-components": "28.5.0",
    "unplugin-icons": "22.1.0",
    "vite-plugin-compression": "0.5.1",
    "vite-plugin-vue-devtools": "7.7.5"
  }
}
```

### 预构建优化配置

基于项目实际依赖的预构建配置：

```typescript
optimizeDeps: {
  include: [
    // Vue生态
    'vue', 'vue-router', 'pinia',
    
    // HTTP和工具
    'axios', '@vueuse/core',
    
    // UI和图表
    'element-plus/es/components/**/css',
    'echarts',
    
    // 国际化
    'vue-i18n',
    
    // 富文本和文件处理
    '@vueup/vue-quill', '@umoteam/editor',
    'image-conversion', 'file-saver',
    
    // JSON和工具
    'vue-json-pretty'
  ]
}
```

## 开发体验优化

### HMR 配置

```typescript
// Vite 默认启用 HMR，项目中的配置：
server: {
  host: '0.0.0.0',           // 支持局域网访问
  open: true,                // 自动打开浏览器
  strictPort: false          // 端口被占用时自动递增
}
```

### 开发工具集成

```typescript
// 集成的开发工具：
plugins: [
  vueDevTools(),             // Vue DevTools 增强
  // ESLint 自动导入支持
  AutoImport({
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json'
    }
  })
]
```

## 构建优化策略

### CSS 优化

```typescript
css: {
  preprocessorOptions: {
    scss: {
      api: 'modern-compiler'    // 使用现代Sass编译器API
    }
  },
  postcss: {
    plugins: [
      autoprefixer(),           // 自动浏览器前缀
      // 移除重复charset声明
      {
        postcssPlugin: 'internal:charset-removal',
        AtRule: {
          charset: (atRule) => atRule.remove()
        }
      }
    ]
  }
}
```

### 文件压缩

基于环境变量的动态压缩配置：

```typescript
// 支持 gzip 和 brotli 压缩
// 通过 VITE_BUILD_COMPRESS 环境变量控制
if (compressList.includes('gzip')) {
  plugin.push(compression({ ext: '.gz', deleteOriginFile: false }))
}
if (compressList.includes('brotli')) {
  plugin.push(compression({ ext: '.br', algorithm: 'brotliCompress' }))
}
```

## 类型安全保障

### TypeScript 集成

项目配置了完整的 TypeScript 支持：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "types": ["node", "vite/client"]
  }
}
```

### 自动类型生成

```typescript
// 自动生成的类型文件：
dts: 'src/types/auto-imports.d.ts',      // 自动导入类型
dts: 'src/types/components.d.ts'         // 组件类型
```

## 最佳实践总结

### 1. 插件配置原则
- 插件按功能分类管理
- 根据构建模式动态加载
- 避免插件冲突和重复

### 2. 性能优化策略
- 合理配置预构建依赖
- 启用文件压缩
- 使用现代浏览器特性

### 3. 开发体验优化
- 自动导入减少重复代码
- 类型安全保障
- 热更新和调试工具

### 4. 构建配置管理
- 环境变量统一管理
- 构建脚本标准化
- 兼容性配置明确

通过这些配置，项目实现了开发效率和构建性能的最佳平衡，为团队提供了稳定可靠的开发和构建环境。

## 常见问题

### 1. 开发服务器启动失败或热更新不生效

**问题描述**

执行 `pnpm dev` 后开发服务器无法启动、端口被占用,或者服务器启动后代码修改无法触发热更新(HMR)。

**问题原因**

- 端口被其他进程占用
- node_modules 缓存损坏或依赖版本冲突
- 文件监听器数量超出系统限制
- HMR WebSocket 连接被防火墙或代理阻断
- Vite 缓存文件损坏
- 插件配置错误导致 HMR 失效

**解决方案**

```bash
# 1. 检查端口占用情况
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# 2. 终止占用端口的进程
taskkill /F /PID <进程ID>     # Windows
kill -9 <进程ID>              # macOS/Linux

# 3. 清理 Vite 缓存
rm -rf node_modules/.vite
rm -rf .vite

# 4. 重新安装依赖
rm -rf node_modules
rm pnpm-lock.yaml  # 可选,完全重置
pnpm install
```

**配置端口自动递增**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    strictPort: false,  // 端口被占用时自动尝试下一个端口
    open: true,

    // HMR 配置
    hmr: {
      // 指定 HMR 服务器地址(解决代理环境问题)
      host: 'localhost',
      port: 3001,        // HMR 使用单独端口
      protocol: 'ws',    // 强制使用 WebSocket
      timeout: 30000     // 连接超时时间
    },

    // 文件监听配置
    watch: {
      usePolling: true,      // 在某些文件系统上需要轮询
      interval: 100,          // 轮询间隔
      ignored: [
        '**/node_modules/**',
        '**/.git/**'
      ]
    }
  }
})
```

**Linux/macOS 增加文件监听器限制**

```bash
# 临时修改(当前会话)
ulimit -n 65535

# 永久修改 - Linux
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 永久修改 - macOS
sudo sysctl -w kern.maxfiles=524288
sudo sysctl -w kern.maxfilesperproc=524288
```

**HMR 调试与排查**

```typescript
// vite.config.ts - 启用 HMR 日志
export default defineConfig({
  server: {
    hmr: {
      overlay: true  // 显示错误覆盖层
    }
  },
  // 详细日志
  logLevel: 'info'
})
```

```typescript
// 在组件中手动处理 HMR
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('HMR update received:', newModule)
  })

  import.meta.hot.dispose(() => {
    console.log('Cleaning up before HMR update')
  })
}
```

---

### 2. 依赖预构建导致的模块解析错误

**问题描述**

开发环境下出现 `Failed to resolve import`、`Cannot find module` 等错误,或者某些第三方库无法正确加载。

**问题原因**

- 依赖未被正确预构建
- ESM/CommonJS 格式混用导致兼容性问题
- 依赖的依赖(嵌套依赖)未被识别
- 缓存的预构建结果与实际依赖不匹配
- 动态导入的模块未被预构建

**解决方案**

```typescript
// vite.config.ts - 优化预构建配置
export default defineConfig({
  optimizeDeps: {
    // 强制预构建的依赖
    include: [
      // Vue 生态系统
      'vue',
      'vue-router',
      'pinia',

      // UI 库及其样式
      'element-plus',
      'element-plus/es/components/**/css',
      '@element-plus/icons-vue',

      // 常用工具库
      'axios',
      'lodash-es',
      '@vueuse/core',

      // 图表库
      'echarts',
      'echarts/core',
      'echarts/charts',
      'echarts/components',
      'echarts/renderers',

      // 国际化
      'vue-i18n',

      // 富文本编辑器
      '@vueup/vue-quill',
      'quill',

      // 可能存在问题的嵌套依赖
      'dayjs',
      'dayjs/locale/zh-cn',
      'dayjs/plugin/customParseFormat',
      'dayjs/plugin/weekday',
      'dayjs/plugin/localeData'
    ],

    // 排除不需要预构建的依赖
    exclude: [
      // 已经是 ESM 格式的纯 Vue 组件
      '@ruoyi/components'
    ],

    // 强制重新预构建
    force: false,  // 设为 true 可强制重新构建

    // 自定义 esbuild 配置
    esbuildOptions: {
      // 支持装饰器语法
      loader: {
        '.js': 'jsx'
      },
      // 定义全局变量
      define: {
        global: 'globalThis'
      }
    }
  }
})
```

**处理 CommonJS 依赖**

```typescript
// vite.config.ts
import { cjsInterop } from 'vite-plugin-commonjs-interop'

export default defineConfig({
  plugins: [
    // CommonJS 兼容插件
    cjsInterop({
      dependencies: [
        // 需要特殊处理的 CJS 依赖
        'some-cjs-package'
      ]
    })
  ],

  build: {
    commonjsOptions: {
      // 转换 CommonJS 模块时的配置
      transformMixedEsModules: true,
      // 忽略特定包的 require 调用
      ignore: ['conditional-require-package']
    }
  }
})
```

**动态导入优化**

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 包含动态导入的模块
    entries: [
      'src/**/*.vue',
      'src/**/*.ts'
    ]
  }
})

// 使用示例 - 确保动态导入被正确处理
// 使用 glob 模式
const modules = import.meta.glob('./modules/*.ts', { eager: true })

// 显式指定要导入的模块
const loadModule = async (name: string) => {
  const modules: Record<string, () => Promise<any>> = {
    'user': () => import('./modules/user'),
    'system': () => import('./modules/system')
  }
  return modules[name]?.()
}
```

**清理并重建预构建缓存**

```bash
# 完全清理预构建缓存
rm -rf node_modules/.vite

# 设置环境变量强制重新预构建
VITE_FORCE_DEP_OPTIMIZATION=true pnpm dev

# 或在配置中设置
# optimizeDeps: { force: true }
```

---

### 3. 生产构建后资源路径404问题

**问题描述**

生产环境部署后,页面空白或资源加载失败,控制台显示 JS、CSS、图片等资源 404 错误。

**问题原因**

- `base` 配置与实际部署路径不匹配
- 静态资源路径使用了绝对路径
- 子路由刷新导致路径错误
- CDN 部署时路径配置不正确
- 资源文件被服务器缓存策略影响

**解决方案**

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

  return {
    // 根据环境变量设置基础路径
    base: env.VITE_APP_CONTEXT_PATH || '/',

    build: {
      // 资源输出目录
      assetsDir: 'assets',

      // 静态资源处理
      assetsInlineLimit: 4096,  // 小于 4kb 的资源内联为 base64

      // 输出文件命名
      rollupOptions: {
        output: {
          // 入口文件
          entryFileNames: 'assets/js/[name]-[hash].js',
          // 代码分割的chunk
          chunkFileNames: 'assets/js/[name]-[hash].js',
          // 静态资源
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]

            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            if (/\.css$/.test(assetInfo.name || '')) {
              return 'assets/css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          }
        }
      }
    }
  }
})
```

**环境变量配置**

```bash
# env/.env.production
# 根目录部署
VITE_APP_CONTEXT_PATH = '/'

# 子目录部署
VITE_APP_CONTEXT_PATH = '/admin/'

# CDN 部署
VITE_APP_CONTEXT_PATH = 'https://cdn.example.com/admin/'
```

**静态资源引用最佳实践**

```typescript
// 使用相对路径或导入
// ✅ 正确 - 通过模块系统导入
import logoUrl from '@/assets/images/logo.png'

// ✅ 正确 - 使用 public 目录
const iconUrl = '/favicon.ico'  // public 目录下的资源

// ❌ 错误 - 硬编码绝对路径
const wrongUrl = '/assets/images/logo.png'
```

```vue
<template>
  <!-- ✅ 正确 - 使用导入的资源 -->
  <img :src="logoUrl" alt="Logo">

  <!-- ✅ 正确 - 使用 public 目录资源 -->
  <img src="/favicon.ico" alt="Favicon">

  <!-- ✅ 正确 - 动态资源使用 URL 构造 -->
  <img :src="getImageUrl(imageName)" alt="Dynamic">
</template>

<script setup lang="ts">
import logoUrl from '@/assets/images/logo.png'

// 动态获取资源 URL
const getImageUrl = (name: string) => {
  return new URL(`../assets/images/${name}.png`, import.meta.url).href
}
</script>
```

**Nginx 配置示例**

```nginx
# 子目录部署
location /admin/ {
    alias /var/www/admin/;
    try_files $uri $uri/ /admin/index.html;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# 根目录部署
location / {
    root /var/www/html;
    try_files $uri $uri/ /index.html;
}
```

---

### 4. 第三方库兼容性问题导致构建失败

**问题描述**

构建时出现语法错误、类型错误,或者某些依赖在生产环境中无法正常工作。

**问题原因**

- 依赖使用了不兼容的 JavaScript 语法
- 依赖需要 Node.js 环境的 API(如 `fs`、`path`)
- 依赖版本与其他包存在冲突
- 依赖的 TypeScript 类型定义缺失或错误
- 浏览器兼容性问题

**解决方案**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 构建目标
    target: 'es2020',

    // CSS 目标
    cssTarget: 'chrome87',

    // Rollup 配置
    rollupOptions: {
      // 外部化处理不需要打包的依赖
      external: [
        // Node.js 内置模块(如果依赖意外引用)
        'fs',
        'path',
        'crypto'
      ],

      // 处理特殊模块
      plugins: [
        // 提供 Node.js polyfills
        nodePolyfills()
      ]
    },

    // CommonJS 转换配置
    commonjsOptions: {
      // 处理混合模块
      transformMixedEsModules: true,

      // 包含需要转换的模块
      include: [
        /node_modules/
      ],

      // 排除已经是 ESM 的模块
      exclude: [
        'node_modules/lodash-es/**'
      ]
    }
  },

  // 定义全局变量替换
  define: {
    // 某些库需要的全局变量
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'global': 'globalThis'
  },

  // 解析配置
  resolve: {
    // 模块别名
    alias: {
      // 替换为浏览器兼容版本
      'stream': 'stream-browserify',
      'buffer': 'buffer/',

      // 强制使用特定版本
      'vue': path.resolve(__dirname, 'node_modules/vue/dist/vue.esm-bundler.js')
    },

    // 导出条件优先级
    conditions: ['import', 'module', 'browser', 'default']
  }
})
```

**处理 Node.js Polyfills**

```typescript
// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    nodePolyfills({
      // 需要 polyfill 的模块
      include: ['buffer', 'process', 'util'],

      // 全局变量
      globals: {
        Buffer: true,
        global: true,
        process: true
      },

      // 协议导入
      protocolImports: true
    })
  ]
})
```

**版本冲突解决**

```json
// package.json - 使用 resolutions 锁定版本
{
  "resolutions": {
    "vue": "3.5.13",
    "@vue/compiler-sfc": "3.5.13",
    "typescript": "5.8.3"
  },

  // pnpm 使用 overrides
  "pnpm": {
    "overrides": {
      "vue": "3.5.13",
      "some-problematic-dep": "npm:fixed-version"
    }
  }
}
```

**TypeScript 类型问题**

```typescript
// src/types/shims.d.ts
// 为缺少类型定义的模块声明类型
declare module 'some-untyped-module' {
  const content: any
  export default content
}

// 扩展现有模块的类型
declare module 'existing-module' {
  export interface SomeInterface {
    newProperty: string
  }
}

// 声明全局变量
declare global {
  interface Window {
    __CUSTOM_GLOBAL__: any
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,           // 跳过库文件类型检查
    "noImplicitAny": false,         // 允许隐式 any(临时解决)
    "typeRoots": [
      "./node_modules/@types",
      "./src/types"
    ]
  }
}
```

---

### 5. 环境变量无法正确读取或注入

**问题描述**

`import.meta.env` 返回 undefined,环境变量未生效,或者敏感信息意外暴露到客户端。

**问题原因**

- 环境变量未以 `VITE_` 前缀开头
- 环境变量文件路径配置错误
- `.env` 文件格式不正确
- 构建时环境变量未正确加载
- 客户端/服务端环境变量混淆

**解决方案**

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  // 第一个参数: 模式(development/production)
  // 第二个参数: 环境变量文件目录
  // 第三个参数: 要加载的前缀(默认 'VITE_')
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'), ['VITE_', 'APP_'])

  console.log('Loaded env:', {
    mode,
    VITE_APP_TITLE: env.VITE_APP_TITLE,
    VITE_APP_BASE_API: env.VITE_APP_BASE_API
  })

  return {
    // 指定环境变量目录
    envDir: './env',

    // 环境变量前缀(默认为 'VITE_')
    envPrefix: 'VITE_',

    // 自定义 define 注入变量
    define: {
      // 注入构建时间
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      // 注入版本号
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      // 注入 Git 提交哈希
      __GIT_HASH__: JSON.stringify(
        require('child_process')
          .execSync('git rev-parse --short HEAD')
          .toString()
          .trim()
      )
    }
  }
})
```

**环境变量文件规范**

```
env/
├── .env                 # 所有模式下加载
├── .env.local           # 所有模式下加载,但被 git 忽略
├── .env.development     # development 模式加载
├── .env.production      # production 模式加载
└── .env.staging         # 自定义模式 staging 加载
```

```bash
# env/.env
# 公共配置
VITE_APP_TITLE=RuoYi-Plus-UniApp

# env/.env.development
# 开发环境配置
VITE_APP_BASE_API=/dev-api
VITE_APP_PORT=3000

# env/.env.production
# 生产环境配置
VITE_APP_BASE_API=/prod-api

# 注意:
# 1. 变量必须以 VITE_ 开头才能在客户端访问
# 2. 不要在环境变量中存储敏感信息(如数据库密码)
# 3. 值不需要引号,除非包含特殊字符
# 4. 注释使用 # 开头
```

**TypeScript 类型声明**

```typescript
// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 自定义环境变量类型声明
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_PORT: string
  readonly VITE_APP_CONTEXT_PATH: string
  readonly VITE_APP_API_ENCRYPT: 'true' | 'false'
  readonly VITE_APP_RSA_PUBLIC_KEY: string
  readonly VITE_APP_RSA_PRIVATE_KEY: string
  readonly VITE_APP_WEBSOCKET: 'true' | 'false'
  readonly VITE_APP_SSE: 'true' | 'false'
  readonly VITE_BUILD_COMPRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 自定义 define 变量
declare const __BUILD_TIME__: string
declare const __APP_VERSION__: string
declare const __GIT_HASH__: string
```

**使用示例**

```typescript
// 在代码中使用环境变量
const apiBaseUrl = import.meta.env.VITE_APP_BASE_API
const appTitle = import.meta.env.VITE_APP_TITLE

// 判断环境
if (import.meta.env.DEV) {
  console.log('开发环境')
}

if (import.meta.env.PROD) {
  console.log('生产环境')
}

// 获取模式
console.log('当前模式:', import.meta.env.MODE)

// 使用自定义 define 变量
console.log('构建时间:', __BUILD_TIME__)
console.log('版本:', __APP_VERSION__)
```

**自定义模式构建**

```json
// package.json
{
  "scripts": {
    "dev": "vite --mode development",
    "build:prod": "vite build --mode production",
    "build:staging": "vite build --mode staging",
    "build:test": "vite build --mode test"
  }
}
```

---

### 6. CSS/SCSS编译错误和样式丢失

**问题描述**

SCSS 编译失败、样式未正确加载、CSS 变量不生效,或者生产构建后样式丢失。

**问题原因**

- SCSS 语法错误或版本不兼容
- CSS 预处理器配置不正确
- 样式文件导入顺序问题
- CSS Modules 配置冲突
- PostCSS 插件配置错误
- 第三方组件库样式未正确导入

**解决方案**

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    // 预处理器配置
    preprocessorOptions: {
      scss: {
        // 使用现代 Sass 编译器 API
        api: 'modern-compiler',

        // 全局注入变量和混合
        additionalData: `
          @use "@/styles/variables" as *;
          @use "@/styles/mixins" as *;
        `,

        // 解析路径
        includePaths: [
          path.resolve(__dirname, 'src/styles')
        ],

        // 静默弃用警告
        silenceDeprecations: ['legacy-js-api']
      },

      less: {
        // Less 配置(如果使用)
        modifyVars: {
          'primary-color': '#1890ff'
        },
        javascriptEnabled: true
      }
    },

    // CSS Modules 配置
    modules: {
      // 类名生成规则
      generateScopedName: '[name]__[local]___[hash:base64:5]',

      // 是否开启 CSS Modules
      localsConvention: 'camelCaseOnly'
    },

    // PostCSS 配置
    postcss: {
      plugins: [
        // 自动添加浏览器前缀
        require('autoprefixer')({
          overrideBrowserslist: [
            'Chrome >= 87',
            'Edge >= 88',
            'Safari >= 14',
            'Firefox >= 78'
          ]
        }),

        // 移除重复的 @charset 声明
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === 'charset') {
                atRule.remove()
              }
            }
          }
        },

        // 可选: CSS 压缩
        require('cssnano')({
          preset: ['default', {
            discardComments: { removeAll: true }
          }]
        })
      ]
    },

    // 开发环境 sourcemap
    devSourcemap: true
  }
})
```

**全局样式和变量注入**

```scss
// src/styles/variables.scss
// SCSS 变量
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;

// 间距
$spacing-base: 16px;
$spacing-small: 8px;
$spacing-large: 24px;

// 圆角
$border-radius: 4px;

// 阴影
$shadow-base: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
```

```scss
// src/styles/mixins.scss
// 常用混合
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin text-ellipsis($lines: 1) {
  @if $lines == 1 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

@mixin scrollbar($width: 6px, $color: #ddd) {
  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }
  &::-webkit-scrollbar-thumb {
    background-color: $color;
    border-radius: $width / 2;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}
```

**Element Plus 样式正确导入**

```typescript
// main.ts - 完整引入
import 'element-plus/dist/index.css'

// 或者按需引入样式
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
```

```typescript
// vite.config.ts - 使用插件按需导入
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import'

export default defineConfig({
  plugins: [
    createStyleImportPlugin({
      resolves: [ElementPlusResolve()],
      libs: [
        {
          libraryName: 'element-plus',
          esModule: true,
          resolveStyle: (name) => {
            return `element-plus/es/components/${name.replace('el-', '')}/style/css`
          }
        }
      ]
    })
  ]
})
```

**CSS 变量使用**

```scss
// 定义 CSS 变量
:root {
  --el-color-primary: #409eff;
  --header-height: 60px;
  --sidebar-width: 210px;
}

// 暗色模式变量
html.dark {
  --el-color-primary: #79bbff;
  --el-bg-color: #141414;
}

// 使用 CSS 变量
.header {
  height: var(--header-height);
  background-color: var(--el-bg-color);
}
```

---

### 7. 插件冲突或加载顺序问题

**问题描述**

多个 Vite 插件同时使用时出现冲突,功能异常或构建失败。

**问题原因**

- 插件处理相同文件类型时产生冲突
- 插件加载顺序不正确
- 插件版本不兼容
- 插件配置相互覆盖
- 热更新被某些插件破坏

**解决方案**

```typescript
// vite.config.ts - 正确的插件顺序
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import compression from 'vite-plugin-compression'

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'

  return {
    plugins: [
      // 1. 核心框架插件(必须最先)
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      }),

      // 2. JSX 支持(如果需要)
      vueJsx(),

      // 3. 开发工具(仅开发环境)
      !isBuild && vueDevTools(),

      // 4. 原子化 CSS(需要在组件注册之前)
      UnoCSS(),

      // 5. 自动导入(需要在组件注册之前生成类型)
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts'
      }),

      // 6. 组件自动注册
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            enabledCollections: ['ep', 'mdi', 'carbon']
          })
        ],
        dts: 'src/types/components.d.ts'
      }),

      // 7. 图标插件
      Icons({
        autoInstall: true,
        compiler: 'vue3'
      }),

      // 8. 构建优化插件(仅生产环境)
      isBuild && compression({
        algorithm: 'gzip',
        ext: '.gz'
      }),

      isBuild && compression({
        algorithm: 'brotliCompress',
        ext: '.br'
      })
    ].filter(Boolean)  // 过滤掉 false 值
  }
})
```

**插件模块化管理**

```typescript
// vite/plugins/index.ts
import type { PluginOption } from 'vite'
import vue from './vue'
import autoImport from './auto-import'
import components from './components'
import icons from './icons'
import unocss from './unocss'
import compression from './compression'
import devTools from './dev-tools'

export function createPlugins(
  env: Record<string, string>,
  isBuild: boolean
): PluginOption[] {
  const plugins: PluginOption[] = []

  // 按顺序添加插件
  plugins.push(vue())

  if (!isBuild) {
    plugins.push(devTools())
  }

  plugins.push(unocss())
  plugins.push(autoImport())
  plugins.push(components())
  plugins.push(icons())

  if (isBuild) {
    plugins.push(...compression(env))
  }

  return plugins
}
```

**条件加载插件**

```typescript
// vite/plugins/compression.ts
import type { PluginOption } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default function createCompression(env: Record<string, string>): PluginOption[] {
  const plugins: PluginOption[] = []
  const { VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN } = env

  if (!VITE_BUILD_COMPRESS) {
    return plugins
  }

  const deleteOriginFile = VITE_BUILD_COMPRESS_DELETE_ORIGIN === 'true'
  const compressList = VITE_BUILD_COMPRESS.split(',')

  if (compressList.includes('gzip')) {
    plugins.push(
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile,
        threshold: 10240,  // 大于 10kb 才压缩
        filter: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
      })
    )
  }

  if (compressList.includes('brotli')) {
    plugins.push(
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile,
        threshold: 10240
      })
    )
  }

  return plugins
}
```

**插件版本兼容检查**

```json
// package.json - 确保版本兼容
{
  "devDependencies": {
    "vite": "^6.3.2",
    "@vitejs/plugin-vue": "^5.2.3",
    "unplugin-auto-import": "^19.1.2",
    "unplugin-vue-components": "^28.5.0",
    "unplugin-icons": "^22.1.0",
    "unocss": "^66.0.0",
    "vite-plugin-vue-devtools": "^7.7.5"
  }
}
```

---

### 8. 构建产物体积过大的优化方案

**问题描述**

生产构建后 bundle 体积过大,影响首屏加载速度,需要进行体积优化。

**问题原因**

- 未进行代码分割
- 第三方库全量引入
- 未启用 Tree-Shaking
- 图片资源未优化
- 未启用压缩

**解决方案**

```typescript
// vite.config.ts - 完整的构建优化配置
import { visualizer } from 'rollup-plugin-visualizer'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'
  const isAnalyze = process.env.ANALYZE === 'true'

  return {
    build: {
      // 构建目标
      target: 'es2020',

      // 压缩配置
      minify: 'esbuild',  // 或 'terser'

      // CSS 代码分割
      cssCodeSplit: true,

      // Chunk 大小警告阈值
      chunkSizeWarningLimit: 1000,

      // sourcemap 配置
      sourcemap: false,  // 生产环境关闭

      // Rollup 配置
      rollupOptions: {
        output: {
          // 手动代码分割
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Vue 核心
              if (id.includes('vue') || id.includes('@vue')) {
                return 'vue-vendor'
              }

              // Element Plus
              if (id.includes('element-plus')) {
                return 'element-plus'
              }

              // ECharts
              if (id.includes('echarts')) {
                return 'echarts'
              }

              // 编辑器
              if (id.includes('quill') || id.includes('@vueup') || id.includes('@umoteam')) {
                return 'editor'
              }

              // 工具库
              if (id.includes('lodash') || id.includes('@vueuse')) {
                return 'utils'
              }

              // 其他第三方库
              return 'vendor'
            }
          },

          // 动态导入的 chunk 命名
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId || ''

            // 按路由分割
            if (facadeModuleId.includes('/views/')) {
              const viewPath = facadeModuleId.split('/views/')[1]
              const viewName = viewPath.split('/')[0]
              return `assets/js/views/${viewName}-[hash].js`
            }

            return 'assets/js/[name]-[hash].js'
          }
        },

        // 外部化依赖(CDN 引入时使用)
        // external: ['vue', 'vue-router', 'element-plus'],

        plugins: [
          // 构建分析
          isAnalyze && visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true,
            filename: 'stats.html'
          })
        ].filter(Boolean)
      }
    },

    plugins: [
      // 图片压缩
      isBuild && viteImagemin({
        gifsicle: { optimizationLevel: 7, interlaced: false },
        optipng: { optimizationLevel: 7 },
        mozjpeg: { quality: 80 },
        pngquant: { quality: [0.8, 0.9], speed: 4 },
        svgo: {
          plugins: [
            { name: 'removeViewBox' },
            { name: 'removeEmptyAttrs', active: false }
          ]
        }
      })
    ].filter(Boolean)
  }
})
```

**按需引入第三方库**

```typescript
// 按需引入 ECharts
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart, LineChart, PieChart,
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  CanvasRenderer
])

export default echarts
```

```typescript
// 按需引入 Lodash
// ❌ 错误 - 全量引入
import _ from 'lodash'

// ✅ 正确 - 按需引入
import { debounce, throttle, cloneDeep } from 'lodash-es'

// 或者单独导入
import debounce from 'lodash/debounce'
```

**动态导入和懒加载**

```typescript
// router/index.ts - 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/dashboard/index.vue')
  },
  {
    path: '/user',
    component: () => import(
      /* webpackChunkName: "user" */
      /* viteChunkName: "user" */
      '@/views/user/index.vue'
    )
  }
]
```

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 异步组件
const HeavyChart = defineAsyncComponent(() =>
  import('@/components/HeavyChart.vue')
)

const HeavyEditor = defineAsyncComponent({
  loader: () => import('@/components/HeavyEditor.vue'),
  loadingComponent: () => import('@/components/Loading.vue'),
  delay: 200,
  timeout: 10000
})
</script>
```

**CDN 外部化配置**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'element-plus', 'axios'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'element-plus': 'ElementPlus',
          axios: 'axios'
        }
      }
    }
  }
})
```

```html
<!-- index.html - CDN 引入 -->
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/element-plus/dist/index.css">
</head>
<body>
  <div id="app"></div>
  <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue-router@4/dist/vue-router.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/element-plus/dist/index.full.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</body>
```

**运行构建分析**

```bash
# 生成构建分析报告
ANALYZE=true pnpm build:prod

# 查看 gzip 后的大小
ls -lh dist/assets/js/*.js.gz

# 使用 source-map-explorer
npx source-map-explorer dist/assets/js/*.js
```

**压缩和预加载**

```typescript
// vite.config.ts
import { preloadPlugin } from 'vite-plugin-preload'

export default defineConfig({
  plugins: [
    // 预加载关键资源
    preloadPlugin({
      rel: 'prefetch',
      include: 'asyncChunks',
      fileBlacklist: [/\.map$/, /hot-update\.js$/]
    })
  ],

  build: {
    // Terser 压缩配置(如果使用)
    terserOptions: {
      compress: {
        drop_console: true,      // 移除 console
        drop_debugger: true,     // 移除 debugger
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        safari10: true           // Safari 10 兼容
      }
    }
  }
})
