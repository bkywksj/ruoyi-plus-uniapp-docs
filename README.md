# next-ai-astro

AI 驱动的 Astro 内容站框架。适合作品目录、视频合集、分类导航、文章博客、产品展示、个人品牌站这类「内容为主、交互为辅」的网站。

- **默认零 JS**：页面是纯静态 HTML，只有搜索筛选这类需要状态的区域才加载 React
- **SEO / GEO 优先**：逐页 canonical、Open Graph、结构化数据由框架统一输出；robots 按名单显式声明 AI 爬虫策略；自动生成 `llms.txt`；构建后逐页校验
- **数据驱动**：内容集合是唯一数据源，外部接口数据由同步脚本拉取（失败时保留上一版）
- **自带 AI 技能体系**：40 个技能 + 20 个命令 + 2 个子代理 + 3 份文档模板，从一句话想法到上线的完整开发链路（Claude Code 与 Codex 双端）

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Astro 7（静态输出） |
| 样式 | Tailwind CSS v4 + 语义设计令牌 + 深色模式 |
| 交互 | React 19 island（按需水合） |
| 内容 | Content Collections（Zod 4 schema） |
| 图标 | Lucide（`@lucide/astro` / `lucide-react`） |
| 测试 | Vitest（单测）+ Playwright（冒烟） |
| 部署 | Docker 多阶段构建 + nginx（经 Reeve 部署目标发布） |

## 快速开始

环境：Node ≥ 22.12、pnpm 10。

```bash
pnpm install
pnpm dev            # http://localhost:4321/
pnpm verify         # 构建 + SEO 校验 + 单测（提交前必须全绿）
```

> 本机地址一律写 `localhost`：Astro 默认只监听 IPv6 的 `::1`，访问 `127.0.0.1` 会被拒绝连接。

## 常用脚本

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 开发服务器（默认 4321，被占用时自动顺延） |
| `pnpm build` | 类型检查（`astro check`）+ 构建到 `dist/` |
| `pnpm build:fast` | 只构建、不做类型检查（Docker 镜像里用；类型检查属于提交前验证门） |
| `pnpm preview` | 预览构建产物（E2E 用 `pnpm preview --port 4329`） |
| `pnpm check` | 只跑 `astro check` 类型检查 |
| `pnpm check:seo` | 构建后逐页校验 SEO / GEO 字段、站内死链与缺结尾斜杠 |
| `pnpm test` | Vitest 单元测试（`tests/unit/`） |
| `pnpm test:e2e` | Playwright 冒烟测试（`tests/e2e/`；首次先 `pnpm exec playwright install chromium`） |
| `pnpm verify` | `build` + `check:seo` + `test` 一键验证门 |
| `pnpm sync [源名] [--dry-run]` | 运行数据同步 |
| `pnpm format` | Prettier 格式化 |
| `pnpm check:skills` | 校验 AI 技能体系一致性（技能目录、hook 清单、`.agents` 镜像、BOM） |
| `pnpm agents:sync` | 从 `.claude/` 生成 Codex 技能镜像 `.agents/` 与 `AGENTS.md` 技能索引 |

## 目录结构

```
src/
├── site.config.ts          # 站点唯一配置：域名、站名、品牌色、导航（孵化时只改这里）
├── content.config.ts       # 内容集合定义
├── data/                   # 集合 JSON 数据
├── content/posts/          # Markdown 文章
├── layouts/ components/ lib/ pages/ styles/
public/                     # 原样拷贝的静态文件：favicon、og 分享图、示例封面
scripts/
├── sync/                   # 数据同步运行器与数据源
├── check-seo.mjs           # 构建后 SEO/GEO 校验
├── validate-skills.mjs     # 技能体系校验
└── sync-agents-skills.mjs  # Codex 技能镜像生成
tests/
├── unit/                   # Vitest 单测
└── e2e/                    # Playwright 冒烟用例
docs/                       # 需求文档 / 原型 / 任务台账 / 测试计划与报告（项目真相源）
.claude/                    # Claude Code：技能、命令、子代理、hooks、模板、内部文档
.codex/ .agents/            # Codex：hooks 与技能镜像
deploy/nginx/  Dockerfile  docker-compose.yml   # 部署
```

## 启动 AI 助手

在项目根目录打开终端：

| 方式 | 说明 |
|------|------|
| `claude` / `codex` | 普通启动：每条需要权限的命令都会弹确认 |
| `cc.bat` / `cx.bat` | 以跳过权限确认的方式启动 Claude Code / Codex，适合 `/loop /dev-loop` 这类自主循环；只在你信任当前任务时用，项目禁令仍由 `CLAUDE.md` / `AGENTS.md` 与 hooks 兜底 |
| `.claude/settings.json` 的 `permissions` 放行清单 | 想保留确认、又不想被常用命令反复打断时，把常用的本地命令加进放行清单 |

使用说明见 `.claude/docs/AI使用指南.md`（命令、技能、两种自主循环、常见问题）。

## 用 AI 开发一个新站点

在本目录用 Claude Code 打开，输入：

```
/kickoff 做一个 B 站视频归类网站，按合集和标签整理我的全部投稿
```

流程：联网调研出需求（人工确认）→ AI 工作站出原型（人工确认）→ 问你写到哪个目录并孵化新项目 → 自主开发（任意环境 `/loop /dev-loop`；在智码 AICoder 里台账较大时用 `/dev-orchestrate` 多会话编排 + 异构验收）→ `/seo-check` → `/deploy`。
完整说明见 `.claude/docs/新项目开发流程.md`。

## 上线前必改

- `src/site.config.ts` 的 `url`（否则所有 canonical 指向 example.com，`check:seo` 会给出警告）
- 站名、描述、作者、品牌色、导航、备案号
- `public/og-default.png`、`public/favicon.svg`
- `docker-compose.yml` 的 `image` / `container_name` 改成项目标识（同机部署多个站会撞名）
- 示例数据与示例文章（或用 `/strip-modules` 裁剪）
