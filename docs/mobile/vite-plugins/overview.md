# Vite 插件概览

本项目使用 Vite 作为构建工具，集成了多个 Vite 插件来增强开发体验和优化构建流程。

## 插件分类

### UniApp 系列插件

基于 `@uni-helper` 生态的 UniApp 增强插件：

| 插件名称 | 说明 |
|---------|------|
| `@dcloudio/vite-plugin-uni` | UniApp 核心构建插件 |
| `@uni-helper/vite-plugin-uni-pages` | 页面路由自动生成 |
| `@uni-helper/vite-plugin-uni-layouts` | 页面布局系统 |
| `@uni-helper/vite-plugin-uni-components` | 组件自动导入 |
| `@uni-helper/vite-plugin-uni-manifest` | manifest.json 类型支持 |
| `@uni-helper/vite-plugin-uni-platform` | 平台条件编译 |

### 自动导入插件

| 插件名称 | 说明 |
|---------|------|
| `unplugin-auto-import` | Vue/Pinia/UniApp API 自动导入 |
| `@uni-ku/bundle-optimizer` | 分包优化插件 |

### 自定义插件

项目自研的 Vite 插件：

| 插件名称 | 说明 |
|---------|------|
| `openapi` | OpenAPI 接口代码自动生成 |
| `static-assets-types` | 静态资源 TypeScript 类型生成 |
| `copyNativeRes` | App 原生资源复制 |

### 开发工具插件

| 插件名称 | 说明 |
|---------|------|
| `vite-plugin-restart` | 配置文件变更热重启 |
| `UnoCSS` | 原子化 CSS 引擎 |

## 插件配置入口

所有插件的配置都集中在 `vite/plugins/` 目录下：

```
vite/plugins/
├── index.ts              # 插件聚合入口
├── uni-pages.ts          # uni-pages 配置
├── auto-imports.ts       # 自动导入配置
├── components.ts         # 组件自动导入配置
├── optimization.ts       # 分包优化配置
├── vite-restart.ts       # 热重启配置
├── static-assets-types.ts # 静态资源类型生成
├── openapi/              # OpenAPI 代码生成
│   └── index.ts
└── copyNativeRes.ts      # 原生资源复制
```

## 快速开始

在 `vite.config.ts` 中引入插件：

```typescript
import createVitePlugins from './vite/plugins/index'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  return defineConfig({
    plugins: await createVitePlugins({ command, mode, env }),
    // ...
  })
}
```

## 插件加载顺序

插件按以下顺序加载，确保依赖关系正确：

1. **静态资源类型生成** - 最先运行，生成类型声明
2. **OpenAPI 代码生成** - 生成 API 接口代码
3. **UniApp 核心插件** - uni-pages、uni-layouts 等
4. **自动导入插件** - auto-import、components
5. **分包优化插件** - bundle-optimizer
6. **开发工具插件** - vite-restart
7. **Uni 主插件** - 必须最后加载
