# OpenAPI 代码生成插件

## 介绍

OpenAPI 代码生成插件是项目自研的 Vite 插件，用于从后端 OpenAPI 3.0 文档自动生成符合项目风格的 TypeScript 类型定义和 API 函数代码。该插件大大提高了前后端接口对接的效率，确保类型安全，减少手动编写接口代码的工作量。

**核心特性：**

- **自动类型生成** - 从 OpenAPI Schema 自动生成 TypeScript 接口定义
- **API 函数生成** - 生成标准化的 API 调用函数，包含完整类型标注
- **智能路径过滤** - 仅处理移动端接口（`/app/*` 路径）
- **通配符忽略规则** - 支持灵活的路径、模块、文件、函数名忽略配置
- **增量更新策略** - 基于 MD5 哈希检测文件变更，避免不必要的覆盖
- **文件保护机制** - 已修改的文件生成 `.generated.ts` 备份
- **CRUD 排序** - API 函数按操作类型智能排序
- **Query 自动生成** - 从 Bo 类型自动生成对应的 Query 查询类型

## 基本用法

### 插件配置

在 `vite/plugins/index.ts` 中配置插件：

```typescript
import createOpenApiPlugin from './openapi'

export default async ({ command, mode, env }) => {
  const vitePlugins: any[] = []

  const apiPort = env.VITE_APP_BASE_API_PORT || '5500'

  vitePlugins.push(
    createOpenApiPlugin({
      input: `http://127.0.0.1:${apiPort}/v3/api-docs/business`,
      output: 'src/api',
      mode: 'manual',
      enabled: true,
      ignore: {
        modules: ['chat'],
        files: ['system*', 'tableDictTypes*'],
        functions: ['template*', 'import*', 'export*'],
      },
    }),
  )

  return vitePlugins
}
```

### 手动触发生成

在 H5 开发模式下，访问以下地址触发代码生成：

```
http://localhost:端口/__openapi_generate
```

访问该地址后，插件会自动从后端获取 OpenAPI 文档并生成代码，完成后会显示成功页面。

### 启动时自动生成

将 `mode` 设置为 `'once'` 可在开发服务器启动时自动执行一次代码生成：

```typescript
createOpenApiPlugin({
  input: `http://127.0.0.1:5500/v3/api-docs/business`,
  output: 'src/api',
  mode: 'once', // 启动时生成一次
  enabled: true,
})
```

## 配置选项

### 完整配置接口

```typescript
interface OpenApiPluginOptions {
  /** OpenAPI 文档 URL（如：http://127.0.0.1:5500/v3/api-docs/business） */
  input: string

  /** 输出目录，相对于项目根目录（如：src/api） */
  output: string

  /** 生成模式：manual-手动触发，once-启动时生成一次 */
  mode?: 'manual' | 'once'

  /** 是否启用插件 */
  enabled?: boolean

  /** 生成前钩子函数 */
  beforeGenerate?: () => void | Promise<void>

  /** 生成后钩子函数 */
  afterGenerate?: () => void | Promise<void>

  /** 忽略配置 */
  ignore?: {
    /** 忽略的 API 路径（支持通配符） */
    paths?: string[]
    /** 忽略的模块名（精确匹配） */
    modules?: string[]
    /** 忽略的文件名（支持通配符） */
    files?: string[]
    /** 忽略的接口函数名（支持通配符） */
    functions?: string[]
    /** 自定义过滤函数 */
    filter?: (moduleKey: string, apis: any[]) => boolean
  }
}
```

### input

- **类型**: `string`
- **必填**: 是
- **说明**: OpenAPI 文档的 URL 地址

后端需要开启 SpringDoc 或 Swagger，提供 OpenAPI 3.0 格式的接口文档：

```typescript
input: 'http://127.0.0.1:5500/v3/api-docs/business'
```

### output

- **类型**: `string`
- **必填**: 是
- **说明**: 生成代码的输出目录，相对于项目根目录

```typescript
output: 'src/api'
```

生成的文件会按模块分组存放：

```
src/api/
├── app/
│   ├── home/
│   │   ├── homeTypes.ts
│   │   └── homeApi.ts
│   └── user/
│       ├── userTypes.ts
│       └── userApi.ts
└── common/
    └── mall/
        └── order/
            ├── orderTypes.ts
            └── orderApi.ts
```

### mode

- **类型**: `'manual' | 'once'`
- **默认值**: `'manual'`
- **说明**: 代码生成的触发模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| `manual` | 通过 HTTP 端点手动触发 | H5 开发，按需生成 |
| `once` | 开发服务器启动时自动生成一次 | 小程序开发，启动即生成 |

**注意事项：**

- `manual` 模式仅在 H5 开发时可用（`pnpm dev:h5`）
- 小程序开发建议使用 `once` 模式或先启动 H5 生成代码

### enabled

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用插件

```typescript
// 通过环境变量控制是否启用
enabled: process.env.VITE_OPENAPI_ENABLED === 'true'
```

### beforeGenerate / afterGenerate

- **类型**: `() => void | Promise<void>`
- **说明**: 生成前/后的钩子函数

```typescript
createOpenApiPlugin({
  input: '...',
  output: 'src/api',
  beforeGenerate: () => {
    console.log('开始生成代码...')
  },
  afterGenerate: async () => {
    console.log('代码生成完成！')
    // 可以在这里执行其他操作，如格式化代码
  },
})
```

## 忽略配置详解

忽略配置支持多种维度的过滤，可以精确控制哪些接口不需要生成代码。

### paths - 路径忽略

使用通配符匹配 API 路径，匹配的模块将被完全跳过：

```typescript
ignore: {
  paths: [
    '/app/ad/**',      // 忽略广告模块所有接口
    '/app/test/*',     // 忽略测试模块一级接口
    '/common/mall/**', // 忽略商城模块所有接口
  ]
}
```

**通配符规则：**

| 通配符 | 说明 | 示例 |
|-------|------|------|
| `**` | 匹配任意层级路径 | `/app/ad/**` 匹配 `/app/ad/list`、`/app/ad/detail/1` |
| `*` | 匹配单层路径（不含斜杠） | `/app/ad/*` 仅匹配 `/app/ad/list` |

### modules - 模块忽略

精确匹配模块名（路径最后一层目录）：

```typescript
ignore: {
  modules: ['chat', 'debug', 'test']
}
```

例如，配置 `modules: ['chat']` 会忽略以下路径：
- `/app/chat/send`
- `/common/ai/chat/history`
- `/app/support/chat/list`

### files - 文件忽略

使用通配符匹配生成的文件名：

```typescript
ignore: {
  files: [
    'system*',           // 忽略 systemApi.ts、systemTypes.ts
    '*Dict*',            // 忽略包含 Dict 的文件
    'tableDictTypes*',   // 忽略 tableDictTypes.ts
  ]
}
```

### functions - 函数忽略

使用通配符匹配生成的 API 函数名（忽略大小写）：

```typescript
ignore: {
  functions: [
    'template*',   // 忽略 templateAdd、templateList 等
    'import*',     // 忽略 importData、importExcel 等
    'export*',     // 忽略 exportData、exportExcel 等
    '*Test',       // 忽略以 Test 结尾的函数
    'debug*',      // 忽略调试相关函数
  ]
}
```

### filter - 自定义过滤

提供完全自定义的过滤逻辑：

```typescript
ignore: {
  filter: (moduleKey, apis) => {
    // moduleKey: 模块标识，如 'app/home', 'common/mall/order'
    // apis: 该模块下的所有 API 定义数组

    // 返回 true 表示忽略该模块
    if (moduleKey.includes('deprecated')) {
      return true
    }

    // 只保留有 3 个以上接口的模块
    if (apis.length < 3) {
      return true
    }

    return false
  }
}
```

### 组合使用示例

```typescript
createOpenApiPlugin({
  input: `http://127.0.0.1:5500/v3/api-docs/business`,
  output: 'src/api',
  mode: 'manual',
  enabled: true,
  ignore: {
    // 忽略整个模块
    modules: ['chat', 'debug'],

    // 忽略特定路径
    paths: ['/app/test/**'],

    // 忽略特定文件
    files: ['system*', '*Dict*'],

    // 忽略特定函数
    functions: ['template*', 'import*', 'export*'],

    // 自定义过滤
    filter: (moduleKey, apis) => {
      // 忽略接口数量小于 2 的模块
      return apis.length < 2
    },
  },
})
```

## 生成文件结构

### 目录结构

插件根据 API 路径自动组织目录结构：

```
src/api/
├── app/                      # /app/* 路径
│   ├── home/                 # /app/home/*
│   │   ├── homeTypes.ts      # 类型定义
│   │   └── homeApi.ts        # API 函数
│   ├── user/                 # /app/user/*
│   │   ├── userTypes.ts
│   │   └── userApi.ts
│   └── goods/                # /app/goods/*
│       ├── goodsTypes.ts
│       └── goodsApi.ts
└── common/                   # /common/* 路径
    └── mall/                 # /common/mall/*
        └── order/            # /common/mall/order/*
            ├── orderTypes.ts
            └── orderApi.ts
```

### 类型文件（*Types.ts）

类型文件包含从 OpenAPI Schema 生成的 TypeScript 接口定义：

```typescript
/** 广告查询类型 */
export interface AdQuery extends PageQuery {
  /** 广告名称 */
  name?: string

  /** 广告状态 */
  status?: number

  /** 广告位置 */
  position?: string
}

/** 广告业务对象 */
export interface AdBo {
  /** 广告ID */
  id?: number

  /** 广告名称 */
  name?: string

  /** 广告图片 */
  image?: string

  /** 跳转链接 */
  link?: string

  /** 广告状态 */
  status?: number
}

/** 广告视图对象 */
export interface AdVo {
  /** 广告ID */
  id?: number

  /** 广告名称 */
  name?: string

  /** 广告图片 */
  image?: string

  /** 跳转链接 */
  link?: string

  /** 广告状态 */
  status?: number

  /** 创建时间 */
  createTime?: string
}
```

**类型排序规则：**

生成的类型按以下顺序排列：
1. `*Query` - 查询类型（自动从 Bo 生成）
2. `*Bo` - 业务对象
3. `*Vo` - 视图对象
4. 其他类型

**Query 类型自动生成：**

插件会自动从 Bo 类型生成对应的 Query 类型：
- 继承 `PageQuery` 分页查询基类
- 自动过滤审计字段（`createBy`、`updateBy`、`createTime`、`updateTime`、`createDept`、`remark`）

### API 文件（*Api.ts）

API 文件包含生成的接口调用函数：

```typescript
import type { AdQuery, AdBo, AdVo } from './adTypes'

/**
 * 查询广告列表
 * @param query 查询参数
 * @returns {Result<PageResult<AdVo>>} 结果
 */
export const pageAds = (query?: AdQuery): Result<PageResult<AdVo>> => {
  return http.get<PageResult<AdVo>>('/app/ad/pageAds', query)
}

/**
 * 查询广告详细
 * @param id 广告ID
 * @returns {Result<AdVo>} 结果
 */
export const getAd = (id: string | number): Result<AdVo> => {
  return http.get<AdVo>(`/app/ad/getAd/${id}`)
}

/**
 * 新增广告
 * @param data 广告数据
 * @returns {Result<string | number>} 结果
 */
export const addAd = (data: AdBo): Result<string | number> => {
  return http.post<string | number>('/app/ad/addAd', data)
}

/**
 * 修改广告
 * @param data 广告数据
 * @returns {Result<void>} 结果
 */
export const updateAd = (data: AdBo): Result<void> => {
  return http.put<void>('/app/ad/updateAd', data)
}

/**
 * 删除广告
 * @param ids 广告ID
 * @returns {Result<void>} 结果
 */
export const deleteAds = (ids: string | number | Array<string | number>): Result<void> => {
  return http.del<void>(`/app/ad/deleteAds/${ids}`)
}
```

**API 函数排序规则：**

生成的 API 函数按 CRUD 操作顺序排列：

| 顺序 | 操作类型 | 函数前缀 |
|-----|---------|---------|
| 1 | 分页查询 | `page*`、`list*`、`query*` |
| 2 | 单个查询 | `get*`、`detail*`、`info*` |
| 3 | 新增 | `add*`、`create*`、`insert*`、`save*` |
| 4 | 修改 | `update*`、`edit*`、`modify*` |
| 5 | 删除 | `delete*`、`remove*` |
| 6 | 批量操作 | `batch*`、`import*`、`export*` |
| 7 | 其他 | 其他函数按字母排序 |

## 文件更新策略

插件采用智能的文件更新策略，既保证代码同步更新，又保护用户的手动修改。

### 更新流程

```
┌─────────────────────────────────────────────────────────┐
│                     文件更新决策                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  文件不存在？ ──是──> 创建新文件                           │
│       │                                                 │
│       否                                                │
│       ↓                                                 │
│  计算 MD5 哈希                                           │
│       ↓                                                 │
│  内容相同？ ──是──> 跳过生成                              │
│       │                                                 │
│       否                                                │
│       ↓                                                 │
│  生成 .generated.ts 文件                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 三种情况

**情况 1：文件不存在**

直接创建新文件：

```
✍️  生成类型文件: app/home/homeTypes.ts (文件不存在，创建新文件)
✍️  生成 API 文件: app/home/homeApi.ts (3 个函数, 文件不存在，创建新文件)
```

**情况 2：文件内容相同**

跳过生成，避免不必要的文件写入：

```
⏭️  跳过生成: app/home/homeTypes.ts (文件内容相同，跳过生成)
⏭️  跳过生成: app/home/homeApi.ts (文件内容相同，跳过生成)
```

**情况 3：文件已被修改**

生成 `.generated.ts` 备份文件，保护用户的手动修改：

```
✍️  生成类型文件: app/home/homeTypes.generated.ts (文件内容已变更，生成 .generated.ts)
✍️  生成 API 文件: app/home/homeApi.generated.ts (3 个函数, 文件内容已变更，生成 .generated.ts)
```

### MD5 哈希计算

插件使用 MD5 哈希比较文件内容，确保只有真正需要更新的文件才会被处理：

```typescript
// 计算文件内容的 MD5 哈希值
function getFileHash(filePath: string): string {
  if (!existsSync(filePath)) return ''
  const content = readFileSync(filePath, 'utf-8')
  // 标准化内容：去除前后空白，统一换行符
  const normalized = content.trim().replace(/\r\n/g, '\n')
  return createHash('md5').update(normalized, 'utf-8').digest('hex')
}
```

### 处理 .generated.ts 文件

当发现 `.generated.ts` 文件时，说明后端接口有更新但本地文件已被修改：

1. 对比 `homeApi.ts` 和 `homeApi.generated.ts` 的差异
2. 将需要的更新合并到 `homeApi.ts`
3. 删除 `.generated.ts` 文件

## 控制台输出

插件运行时会输出详细的日志信息：

```
🚀 OpenAPI 代码生成开始...
📄 文档地址: http://127.0.0.1:5500/v3/api-docs/business
📁 输出目录: src/api

📦 开始解析 OpenAPI 文档...
✅ 提取到 45 个类型定义
✅ 提取到 8 个模块
  📂 app/home: 5 个接口
  📂 app/user: 8 个接口
  📂 app/goods: 12 个接口
  📂 app/order: 15 个接口
  📂 common/mall/cart: 6 个接口
✅ 提取到 46 个 API 函数

  ⏭️  忽略模块: app/chat (匹配忽略规则)
  ⏭️  忽略接口: templateList (匹配函数忽略规则)
  ⏭️  忽略接口: importData (匹配函数忽略规则)
  📊 app/goods: 过滤 2 个接口，保留 10 个

  ✍️  生成类型文件: app/home/homeTypes.ts (文件不存在，创建新文件)
  ✍️  生成 API 文件: app/home/homeApi.ts (5 个函数, 文件不存在，创建新文件)
  ⏭️  跳过生成: app/user/userTypes.ts (文件内容相同，跳过生成)
  ⏭️  跳过生成: app/user/userApi.ts (文件内容相同，跳过生成)
  ✍️  生成类型文件: app/goods/goodsTypes.generated.ts (文件内容已变更，生成 .generated.ts)
  ✍️  生成 API 文件: app/goods/goodsApi.generated.ts (10 个函数, 文件内容已变更，生成 .generated.ts)

✨ 代码生成完成！输出目录: src/api
```

## API

### 插件导出

```typescript
import createOpenApiPlugin from './openapi'

const plugin = createOpenApiPlugin(options: OpenApiPluginOptions): Plugin
```

### OpenApiPluginOptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| input | OpenAPI 文档 URL | `string` | - |
| output | 输出目录 | `string` | - |
| mode | 生成模式 | `'manual' \| 'once'` | `'manual'` |
| enabled | 是否启用 | `boolean` | `true` |
| beforeGenerate | 生成前钩子 | `() => void \| Promise<void>` | - |
| afterGenerate | 生成后钩子 | `() => void \| Promise<void>` | - |
| ignore | 忽略配置 | `IgnoreConfig` | - |

### IgnoreConfig

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| paths | 忽略的 API 路径 | `string[]` | - |
| modules | 忽略的模块名 | `string[]` | - |
| files | 忽略的文件名 | `string[]` | - |
| functions | 忽略的函数名 | `string[]` | - |
| filter | 自定义过滤函数 | `(moduleKey: string, apis: any[]) => boolean` | - |

### 内部类型定义

```typescript
/** API 函数定义 */
interface ApiFunction {
  /** 函数名 */
  name: string
  /** HTTP 方法 */
  method: string
  /** API 路径 */
  path: string
  /** API 摘要 */
  summary?: string
  /** 查询参数类型 */
  queryType?: string
  /** 基本类型查询参数 */
  basicQueryParams?: BasicQueryParam[]
  /** 请求体类型 */
  bodyType?: string
  /** 响应类型 */
  responseType: string
  /** 路径参数列表 */
  pathParams: string[]
}

/** 类型定义 */
interface TypeDefinition {
  /** 类型名称 */
  name: string
  /** 属性列表 */
  properties: Array<{
    name: string
    type: string
    required: boolean
    description?: string
  }>
  /** 类型描述 */
  description?: string
  /** 继承的类型 */
  extends?: string[]
}
```

## 最佳实践

### 1. 按环境配置启用

```typescript
createOpenApiPlugin({
  input: `http://127.0.0.1:${apiPort}/v3/api-docs/business`,
  output: 'src/api',
  // 只在开发环境启用
  enabled: command === 'serve',
  mode: 'manual',
})
```

### 2. 合理使用忽略规则

```typescript
ignore: {
  // 忽略系统管理模块（通常仅后台使用）
  modules: ['system', 'monitor', 'generator'],

  // 忽略调试和测试相关接口
  functions: ['debug*', 'test*', 'mock*'],

  // 忽略导入导出（通常需要自定义处理）
  functions: ['import*', 'export*'],
}
```

### 3. 配合 Git 使用

将 `.generated.ts` 文件添加到 `.gitignore`：

```txt
# OpenAPI 生成的备份文件
**/*.generated.ts
```

### 4. 定期同步接口

建议在以下时机执行代码生成：

- 后端接口有更新时
- 拉取最新代码后
- 开始新功能开发前

### 5. 处理特殊接口

对于需要自定义处理的接口，可以：

1. 使用 `functions` 忽略规则跳过自动生成
2. 手动编写这些接口的代码
3. 插件会保护手动编写的文件不被覆盖

## 常见问题

### 1. 生成失败：无法连接后端服务

**问题原因：**
- 后端服务未启动
- OpenAPI 文档地址配置错误
- 网络连接问题

**解决方案：**

```typescript
// 确保后端服务已启动，且地址正确
input: 'http://127.0.0.1:5500/v3/api-docs/business'

// 可以先在浏览器中访问该地址，确认能获取到 JSON 文档
```

### 2. 小程序开发时无法手动触发

**问题原因：**
- `manual` 模式依赖 H5 开发服务器的 HTTP 端点
- 小程序开发模式不启动 HTTP 服务器

**解决方案：**

```typescript
// 方案1：使用 once 模式
mode: 'once'

// 方案2：先启动 H5 开发服务器生成代码，再切换到小程序
// 1. pnpm dev:h5
// 2. 访问 http://localhost:端口/__openapi_generate
// 3. 关闭 H5，启动 pnpm dev:mp-weixin
```

### 3. 类型定义不完整

**问题原因：**
- 后端接口未正确配置 OpenAPI 注解
- Schema 定义不完整

**解决方案：**

检查后端代码是否正确使用了 SpringDoc/Swagger 注解：

```java
@Schema(description = "广告业务对象")
public class AdBo {
    @Schema(description = "广告名称", required = true)
    private String name;

    @Schema(description = "广告状态", example = "1")
    private Integer status;
}
```

### 4. 生成的代码格式不正确

**问题原因：**
- 生成的代码未经过格式化

**解决方案：**

使用 `afterGenerate` 钩子执行格式化：

```typescript
import { execSync } from 'node:child_process'

createOpenApiPlugin({
  input: '...',
  output: 'src/api',
  afterGenerate: () => {
    // 使用 ESLint 格式化生成的代码
    execSync('pnpm lint:fix src/api', { stdio: 'inherit' })
  },
})
```

### 5. 部分接口未生成

**问题原因：**
- 接口路径不是以 `/app` 开头
- 接口被忽略规则过滤

**解决方案：**

1. 检查后端接口路径，移动端接口应以 `/app` 开头
2. 检查控制台输出，查看是否有 `⏭️ 忽略` 的日志
3. 调整忽略规则配置

```typescript
ignore: {
  // 检查是否误配置了过于宽泛的忽略规则
  modules: ['chat'],  // 仅忽略特定模块
  functions: ['template*'],  // 仅忽略特定函数
}
```
