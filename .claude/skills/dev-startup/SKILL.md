---
name: dev-startup
description: 本地开发环境搭建与启动：Node ≥ 22.12、pnpm 10（含构建脚本白名单）、装依赖、dev / preview / 测试怎么跑、端口约定与冲突、常见启动报错。触发词：本地启动、首次启动、跑起来、装环境、装依赖、pnpm install、Node版本、端口占用、启动失败、pnpm dev
---

# 本地开发启动（dev-startup）

## 何时使用

- 新机器首次拉项目，需要装 Node / pnpm / 依赖
- `pnpm install` 失败、慢、报 ECONNRESET、提示忽略了构建脚本
- `pnpm dev` / `pnpm build` 起不来、端口被占、Node 版本不对
- 不知道该跑 dev 还是 preview、测试怎么跑

## 第 0 步：先问清楚要启动什么

| 目的 | 命令 | 地址 / 端口 |
|------|------|------|
| 边改边看（热更新） | `pnpm dev` | `http://localhost:4321/`（被占自动顺延） |
| 看构建产物（与线上一致，验收 404 / SEO） | `pnpm build:fast && pnpm preview --port 4329` | `http://localhost:4329/` |
| 完整验证门 | `pnpm verify`（= build + check:seo + test） | — |
| 单元测试 | `pnpm test` | — |
| E2E | 先 `pnpm build:fast`，再 `pnpm test:e2e`（首次先装浏览器，见第 5 步） | 4329 |

🔴 地址一律写 `localhost`，不写 `127.0.0.1`：本机 `localhost` 解析到 IPv6 `::1`，Astro 默认只监听它，访问 127.0.0.1 会被拒绝连接。

---

## 第 1 步：环境检查

```bash
node -v      # 要求 ≥ 22.12.0（package.json engines；Astro 7 的硬性要求）
pnpm -v      # 要求 10.x（package.json packageManager: pnpm@10.17.1）
git --version
```

| 结果 | 处理 |
|------|------|
| Node < 22.12 | 升级（第 2 步） |
| 没有 pnpm | `corepack enable`（会按 `packageManager` 字段取用 pnpm 10），或 `npm i -g pnpm@10`；`corepack` 命令不存在（新版本 Node 可能不再内置）时直接用后者 |
| pnpm 是 8 / 9 | 同上升级到 10；lockfile 由 pnpm 10 生成 |

## 第 2 步：安装 Node（缺什么装什么）

- 推荐 nvm-windows：`nvm install 22` → `nvm use 22`
- 或到 nodejs.org 装 22 LTS
- 装完新开终端再 `node -v` 确认

🔴 AI 边界：安装系统级软件需要用户在自己的终端操作，AI 只给命令并确认结果，不擅自改系统环境。

## 第 3 步：安装依赖

首次安装可能要几分钟，放后台跑：

```bash
pnpm install --reporter=append-only
```

### pnpm 10 的依赖构建脚本白名单

pnpm 10 **默认不执行依赖包的 postinstall 等构建脚本**，只放行 `package.json` 里列出的包：

```json
"pnpm": {
  "onlyBuiltDependencies": ["esbuild", "sharp"]
}
```

- 安装输出出现 `Ignored build scripts: <包名>` → 先判断这个包是否真的需要构建脚本（多数不需要）
- 确实需要 → 加进 `onlyBuiltDependencies`（或运行 `pnpm approve-builds` 交互选择），再 `pnpm install`
- 新增依赖是这个原因导致运行时报「找不到原生模块」时，最常见的就是漏了这一步

### 网络问题

| 现象 | 处理 |
|------|------|
| 很慢 / `ECONNRESET` / `ETIMEDOUT` | 换国内镜像：`pnpm config set registry https://registry.npmmirror.com`（用户级配置，不写进项目） |
| 某个包一直下载失败 | `pnpm store prune` 后重装 |

## 第 4 步：启动开发服务

```bash
pnpm dev
```

- 首次启动会预构建依赖（`[vite] bundling dependencies`），稍等
- 🔴 **访问地址以启动输出里的 `Local` 为准**（默认 `http://localhost:4321/`，被占会自动换端口），不要凭空写端口
- 起之前先看端口上是否已有本会话起过的服务（`netstat -ano | findstr :4321`），有就复用，不要每轮新起一个
- 需要替用户常驻运行时，优先智码任务系统：`mcp__aicoder__list_project_tasks` → `mcp__aicoder__resolve_and_start_task`；
  自己跑就用 `run_in_background`，结束时只停自己的端口
- 多个 worktree 并行开发时各用各的端口：`pnpm dev --port 4331`…

改了 `src/content.config.ts` 后类型没刷新 → `pnpm astro sync`（或重启 dev）。

## 第 5 步：预览与测试

```bash
pnpm build:fast && pnpm preview --port 4329     # 看构建产物
pnpm test                                        # Vitest（tests/unit）
pnpm exec playwright install chromium            # E2E 首次准备（只需一次）
pnpm build:fast && pnpm test:e2e                 # Playwright：desktop + mobile 两个 project
```

- `pnpm build` 与 `pnpm build:fast` 的区别：前者先跑 `astro check`（类型检查），提交前用它；后者只构建，调试 / 预览用
- `test:e2e` 的 webServer 是 `pnpm preview --port 4329`，只会预览已有的 `dist/`，不会替你构建：跑 E2E 前先构建，否则测的是旧产物或直接起不来
- 同一目录里不要并行跑两个 `astro build` / `astro sync`（会搅乱内容缓存，动态路由页面整批丢失）

## 第 6 步：端口约定与冲突

| 用途 | 端口 |
|------|------|
| 开发 | 4321（Astro 默认，冲突自动顺延到 4322…） |
| 预览 / E2E | 4329（`playwright.config.ts` 固定用它） |
| Docker 本地验证 | `docker compose up -d --build` 后访问 `http://localhost:8080/`（`docker-compose.yml` 只绑本机回环 `127.0.0.1:8080` → 容器 80） |

查占用：

```bash
netstat -ano | findstr :4329
```

处理：
- 是自己这个会话起的 → `npx kill-port 4329`
- 不确定是谁的 → 换个端口（`pnpm preview --port 4330`），**不要杀**
- 🔴 禁止 `taskkill /IM node.exe`、`Stop-Process -Name node` 这类按名字杀进程（会连带杀掉 AI 宿主进程）

---

## 脚本速查（package.json）

| 脚本 | 作用 |
|------|------|
| `dev` | 开发服务 |
| `build` | `astro check && astro build` |
| `build:fast` | 只 `astro build` |
| `preview` | 预览 `dist/` |
| `check` | 仅类型检查 |
| `sync` | 数据同步（`scripts/sync/run.mjs`） |
| `check:seo` | 构建后 SEO / GEO 校验（需先 build） |
| `test` / `test:e2e` | Vitest / Playwright |
| `verify` | build + check:seo + test |
| `agents:sync` | 同步 Codex 技能镜像（`.agents/skills`、AGENTS.md 技能索引） |
| `check:skills` | 技能体系一致性校验（改了技能 / 命令 / hooks 后与 `agents:sync` 一起跑） |
| `format` | Prettier 格式化 |

---

## 常见错误速查

| 报错 / 现象 | 原因 | 处理 |
|------------|------|------|
| `astro: command not found` / `'astro' 不是内部或外部命令` | 没装依赖 | `pnpm install` |
| Astro 提示 Node 版本不受支持 | Node < 22.12 | 升级 Node |
| 找不到某个原生绑定模块（`binding`、`win32-x64` 字样） | 可选依赖没装上或装坏 | 删 `node_modules` 后重装；确认没有全局设置跳过可选依赖 |
| `sharp` 相关报错 | 原生模块问题 | `pnpm rebuild sharp`，仍不行删 `node_modules` 重装 |
| `Cannot find module 'astro:content'` 类型报错 | 类型未生成 | `pnpm astro sync` |
| `[content] ... does not match collection schema` | 数据与 schema 不符 | 按报错定位数据文件，见 `content-collections` |
| 构建报未闭合标签 / HTML 结构错误 | Astro 7 Rust 编译器严格校验 | 修正 HTML，不要试图关闭校验 |
| 页面数据陈旧、类型怪异 | `.astro/` 缓存 | 删 `.astro/` 目录后 `pnpm astro sync`（生成物，可安全删除） |
| PowerShell 输出满屏 `NativeCommandError` | 给 pnpm / node 加了 `2>&1` | 去掉 `2>&1` |
| 中文路径下某个工具异常 | 少数原生工具不认非 ASCII 路径 | 框架本身在中文路径下可正常构建；个别工具出问题时把输入文件复制到纯英文临时路径再处理 |

## 启动检查清单

- [ ] `node -v` ≥ 22.12，`pnpm -v` 为 10.x
- [ ] `pnpm install` 成功，无未处理的 `Ignored build scripts` 警告
- [ ] `pnpm dev` 启动，按输出地址能打开首页
- [ ] `pnpm verify` 全绿（`site.url` 是 `example.com` 时的警告属预期）

## 与其他技能的边界

| 需求 | 技能 |
|------|------|
| `.env`、站点配置、域名 | `env-config` |
| 页面报错定位 | `bug-detective` |
| 构建镜像与部署 | `deployment-guide` |
| E2E 细节 | `e2e-test` |
