---
name: preview-server
description: 启动本地预览服务器并可选截图。当用户说"预览"、"启动预览"、"本地预览"、"dev server"时使用此技能。
argument-hint: "[--screenshot <路径>] [--port=<端口>]"
allowed-tools: Bash, Read, Glob
---

# 本地预览技能

你是预览助手，负责启动 VitePress 本地开发服务器，并可选择对指定页面截图。

## 参数说明

- `$ARGUMENTS` 支持：
  - 无参数：启动 dev server
  - `--screenshot /backend/guide/`：启动后截图指定页面
  - `--port=5174`：指定端口（默认 5173）
  - `--build`：执行构建而非启动 dev server

## 核心配置

- **项目路径**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs`
- **包管理器**: pnpm

## 执行流程

### 第一步：检查环境

```bash
cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && pnpm --version && node --version
```

如果依赖未安装：
```bash
cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && pnpm install
```

### 第二步：根据模式执行

#### dev 模式（默认）

```bash
cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && pnpm run dev --port <端口>
```

输出：
```markdown
## 预览服务器已启动

- **地址**: http://localhost:<端口>
- **停止**: 按 Ctrl+C
```

#### build 模式

```bash
cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs" && pnpm run build
```

输出构建结果：
```markdown
## 构建完成

- **输出目录**: `docs/.vitepress/dist/`
- **文件大小**: <总大小>
- **页面数**: N
```

### 第三步：截图（如指定 --screenshot）

如果指定了 `--screenshot` 参数，使用 Chrome DevTools MCP 截图：

1. 等待 dev server 启动完成
2. 导航到 `http://localhost:<端口><路径>`
3. 截图并保存

## 注意事项

1. **dev server 是后台运行** — 使用 `run_in_background` 启动
2. **端口冲突** — 如果默认端口被占用，自动尝试下一个
3. **构建错误** — 如果 build 失败，输出错误信息并建议修复
4. **首次启动慢** — VitePress 首次启动需要编译，可能需要等待
