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
