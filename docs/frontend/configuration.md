# RyPlus-Uni 前端配置文件说明文档

## 技术栈概述

本项目基于 Vue 3 + TypeScript + Vite 构建，采用现代化前端开发技术栈：

- **构建工具**: Vite 5.x
- **前端框架**: Vue 3.4+ (Composition API)
- **开发语言**: TypeScript 5.x
- **UI框架**: Element Plus
- **CSS框架**: UnoCSS (原子化CSS)
- **状态管理**: Pinia
- **路由管理**: Vue Router 4.x
- **代码规范**: ESLint + Prettier

---

## 配置文件结构

### 1. 环境变量配置

#### 1.1 基础环境配置 (`.env`)

```bash
# ===== 应用基础配置 =====
VITE_APP_ID = 'ryplus_uni'                    # 应用唯一标识符
VITE_APP_TITLE = 'ryplus-uni后台管理'          # 浏览器标签页标题
VITE_APP_CONTEXT_PATH = '/'                   # 应用访问路径前缀
VITE_ENABLE_FRONTEND = 'false'                # 是否启用前台首页

# ===== 安全配置 =====
VITE_APP_API_ENCRYPT = 'true'                 # 接口加密开关
VITE_APP_RSA_PUBLIC_KEY = 'MFww...'           # RSA加密公钥(与后端配对)
VITE_APP_RSA_PRIVATE_KEY = 'MIIBOw...'        # RSA解密私钥(与后端配对)

# ===== 功能开关 =====
VITE_APP_WEBSOCKET = 'false'                  # WebSocket功能开关
VITE_APP_SSE = 'true'                         # Server-Sent Events开关

# ===== 外部服务地址 =====
VITE_APP_GIT_URL = ''                         # 代码仓库地址
VITE_APP_DOC_URL = 'https://ruoyi.plus'       # 项目文档地址
```

#### 1.2 开发环境配置 (`.env.development`)

```bash
VITE_APP_ENV = 'development'                  # 环境标识
VITE_APP_PORT = '80'                          # 开发服务器端口
VITE_APP_BASE_API = '/dev-api'                # API接口前缀
VITE_APP_BASE_API_PORT = '5500'               # 后端服务端口

# ===== 外部服务地址 =====
VITE_APP_MONITOR_ADMIN = 'http://127.0.0.1:9090/admin/applications'
VITE_APP_SNAILJOB_ADMIN = 'http://127.0.0.1:8800/snail-job'
```

#### 1.3 生产环境配置 (`.env.production`)

```bash
VITE_APP_ENV = 'production'                   # 生产环境标识
VITE_APP_BASE_API = '/ryplus_uni'             # 生产环境API前缀
VITE_BUILD_COMPRESS = 'gzip'                  # 构建压缩方式

# ===== 外部服务地址 =====
VITE_APP_MONITOR_ADMIN = '/admin/applications'
VITE_APP_SNAILJOB_ADMIN = '/snail-job'
```

**环境变量命名规范:**

- 所有环境变量必须以 `VITE_` 开头才能在前端代码中访问
- 使用 `SCREAMING_SNAKE_CASE` 命名风格
- 按功能分组，便于管理和维护

---

### 2. 构建配置

#### 2.1 Vite 主配置 (`vite.config.ts`)

```typescript
export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
    const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

    return defineConfig({
        // 环境变量目录
        envDir: './env',

        // 应用基础路径
        base: env.VITE_APP_CONTEXT_PATH,

        // 路径别名配置
        resolve: {
            alias: {
                '@': path.join(process.cwd(), './src')  // @ 指向 src 目录
            },
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
        },

        // 开发服务器配置
        server: {
            host: '0.0.0.0',                        // 监听所有地址
            port: Number(env.VITE_APP_PORT),        // 服务端口
            open: true,                             // 自动打开浏览器
            proxy: {                                // 代理配置解决跨域
                [env.VITE_APP_BASE_API]: {
                    target: `http://localhost:${env.VITE_APP_BASE_API_PORT}`,
                    changeOrigin: true,
                    ws: true,
                    rewrite: (path) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
                }
            }
        }
    })
}
```

**关键配置说明:**

- **envDir**: 自定义环境变量文件目录
- **base**: 应用部署的基础路径，支持子路径部署
- **proxy**: 开发环境API代理，解决跨域问题
- **alias**: 路径别名，简化模块导入
- **optimizeDeps**: 依赖预构建，提升首次加载速度

---

### 3. TypeScript 配置

#### 3.1 TypeScript 编译配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    // 模块解析基准目录
    "target": "ES2020",
    // 编译目标版本
    "module": "ESNext",
    // 模块系统
    "moduleResolution": "Bundler",
    // 模块解析策略
    "lib": [
      "ESNext",
      "DOM",
      "DOM.Iterable"
    ],
    // 包含的库文件

    // 严格模式配置
    "strict": true,
    // 启用所有严格检查
    "noImplicitAny": false,
    // 允许隐式any类型
    "strictNullChecks": false,
    // 关闭严格null检查

    // 其他配置
    "allowJs": true,
    // 允许编译JS文件
    "jsx": "preserve",
    // 保留JSX语法
    "sourceMap": true,
    // 生成source map
    "resolveJsonModule": true,
    // 支持导入JSON
    "esModuleInterop": true,
    // ES模块互操作
    "experimentalDecorators": true,
    // 装饰器支持

    // 路径映射
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    // 类型定义
    "types": [
      "node",
      "vite/client"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "vite.config.ts",
    "eslint.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "src/**/__tests__/*"
  ]
}
```

---

### 4. 代码规范配置

#### 4.1 ESLint 配置 (`eslint.config.ts`)

```typescript
export default defineConfigWithVueTs(
    // 检查的文件类型
    {
        files: ['**/*.{js,cjs,ts,mts,tsx,vue}']
    },

    // 忽略的文件和目录
    {
        ignores: [
            '**/dist/**',           // 构建输出目录
            '**/coverage/**',       // 测试覆盖率报告
            '**/locales/**/*.ts'    // 语言文件
        ]
    },

    // 自定义规则
    {
        plugins: { prettier },
        rules: {
            // TypeScript 相关规则
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',

            // Vue 相关规则
            'vue/multi-word-component-names': 'off',
            'vue/valid-define-props': 'off',
            'vue/no-v-model-argument': 'off',

            // 强制 Prettier 格式化
            'prettier/prettier': 'error'
        }
    }
)
```

**ESLint 规则说明:**

- **基础规则**: 继承Vue和TypeScript推荐配置
- **自定义规则**: 根据项目需求调整的规则
- **Prettier集成**: 确保代码格式化一致性

---

### 5. 样式配置

#### 5.1 UnoCSS 配置 (`uno.config.ts`)

```typescript
export default defineConfig({
    // 快捷方式定义
    shortcuts: {
        'panel-title': 'pb-[5px] font-sans leading-[1.1] font-medium text-base text-[#6379bb]...',
        'flex-center': 'flex items-center justify-center',
        'flex-between': 'flex items-center justify-between'
    },

    // 主题配置
    theme: {
        colors: {
            // 状态颜色
            'primary': 'var(--el-color-primary)',
            'success': 'var(--color-success)',
            'warning': 'var(--color-warning)',
            'danger': 'var(--color-danger)',

            // 文本颜色
            'text-base': 'var(--text-color)',
            'text-secondary': 'var(--text-color-secondary)',

            // 背景颜色
            'bg-base': 'var(--bg-color)',
            'bg-page': 'var(--bg-color-page)'
        },

        // 间距变量
        spacing: {
            'sidebar': 'var(--sidebar-width)',
            'header': 'var(--header-height)'
        }
    },

    // 自定义规则
    rules: [
        ['sidebar-width', { 'width': 'var(--sidebar-width)' }],
        ['scrollbar-y', { 'overflow-y': 'auto', 'overflow-x': 'hidden' }],
        ['text-ellipsis', { 'white-space': 'nowrap', 'overflow': 'hidden', 'text-overflow': 'ellipsis' }]
    ],

    // 预设配置
    presets: [
        presetUno(),           // 默认工具类
        presetAttributify(),   // 属性化模式
        presetIcons({}),       // 图标支持
        presetTypography(),    // 排版支持
        presetWebFonts({})     // Web字体支持
    ]
})
```

**UnoCSS 特性:**

- **原子化CSS**: 提供大量原子级样式类
- **按需生成**: 只生成实际使用的样式
- **主题系统**: 支持CSS变量和主题切换
- **快捷方式**: 将常用样式组合定义为简单类名

---

## 开发环境配置

### 1. 环境要求

```bash
# Node.js 版本要求
Node.js >= 18.0.0

# 包管理器(推荐使用pnpm)
pnpm >= 8.0.0
npm >= 9.0.0
yarn >= 1.22.0
```

### 2. 安装和启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 代码格式化
pnpm lint:fix

# 类型检查
pnpm type-check
```

### 3. 开发服务器特性

- **热模块替换(HMR)**: 代码修改后即时更新
- **API代理**: 自动转发API请求到后端服务
- **TypeScript支持**: 实时类型检查和错误提示
- **Vue DevTools**: 支持Vue开发者工具调试

---

## 常见问题与解决方案

### Q1: 开发环境接口请求失败？

**A**: 检查以下配置：

- 确认 `VITE_APP_BASE_API_PORT` 与后端服务端口一致
- 检查代理配置是否正确
- 确认后端服务已启动

### Q2: 环境变量无法访问？

**A**: 确保环境变量：

- 以 `VITE_` 开头
- 在正确的 `.env` 文件中定义
- 重启开发服务器

---

> 💡 **提示**:
> - 开发前请确保所有环境变量配置正确
> - 生产部署时注意检查所有外部服务地址
> - 定期更新依赖包版本以获得最新功能和安全修复
