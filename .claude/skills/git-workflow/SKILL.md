---
name: git-workflow
description: Git 提交规范与远程操作：逐个 add、按协作约定写 type(scope)、推送 / 建仓 / 拉取 / 克隆只走 Sigil、多会话安全、分支与冲突处理。触发词：Git、提交、commit、分支、合并、推送、push、建仓、Sigil、冲突、回滚、提交规范
---

# Git 工作流指南

## 何时使用

- 提交代码（选文件、写规范 commit message）
- 推送到远程、建仓、克隆、拉取（一律走 Sigil）
- 创建 / 合并分支、查看提交历史、解决冲突、回滚本地提交

## ⚠️ 本项目提交规范（必须遵守）

### 核心原则

1. **只提交当前会话的改动**：逐个 `git add <具体文件>`，**禁止** `git add -A` / `git add .`（CLAUDE.md 多会话避让协议 L3）
2. **不提交本地配置与密钥**：`.env`、`.env.*`（`.env.example` 除外）、`*-local.*`
3. **默认只提交到本地**：执行 `git add` + `git commit`，**不自动推送**
4. **明确指定才推送**：只有用户明确说「推送」「push」「提交到远程」时才推送
5. **远程操作只走 Sigil**：推送 / 克隆 / 拉取 / 建仓 / 远端核对一律用 Sigil 工具，**不跑本地 `git push` / `git fetch` / `git pull` / `git clone` / `git ls-remote`**（本机不存明文凭据，这些命令会弹凭据窗卡死；框架的 PreToolUse hook 也会直接拦截）。详见下方《🔴 远程 Git 操作走 Sigil》
6. **提交前验证门全绿**：`pnpm verify`（= `pnpm build` + `pnpm check:seo` + `pnpm test`）

### 提交信息格式

```
<type>(<scope>): <subject>
```

- **type**：见下方「提交类型说明」
- **scope**：改动所属领域，从下表选；跨多个领域时选主要的那个
- **subject**：中文一句话，说清「做了什么」，不加句号

| scope | 对应改动 |
|-------|---------|
| `works` / `posts` / `categories` / `<新集合名>` | 某个内容集合相关的页面、组件、查询、数据 |
| `home` / `about` / `<页面名>` | 单个页面 |
| `ui` | `src/components/ui/` 通用组件 |
| `design` | 设计令牌、主题、深色模式（`src/styles/global.css`） |
| `seo` | SEOHead、结构化数据、robots、llms.txt、sitemap |
| `sync` | `scripts/sync/` 数据同步代码 |
| `data` | `src/data/*.json` 例行数据刷新（固定写 `chore(data): …`） |
| `search` | 站内搜索 |
| `deploy` | Dockerfile、nginx、部署脚本 |
| `framework` | **孵化出的项目里**改 `.claude/framework-config.json` 列出的框架核心文件（单独一个提交，如 `feat(framework): seo.ts 新增 eventJsonLd`）；框架仓库本身改核心按正常领域 scope 写 |
| `framework-sync` | 从框架同步更新（固定写 `chore(framework-sync): …`，见 `framework-sync`） |
| `strip` | 模块裁剪（固定写 `refactor(strip): …`，见 `module-strip`） |
| `skills` | `.claude/skills/`、`.claude/commands/`、hooks |
| `tasks` | 任务台账、三文档更新（固定写 `docs(tasks): …`） |
| `deps` | 依赖升级 |

🔴 **进度口径（与 CLAUDE.md「协作约定」一致）**：`/progress`、`/update-status`、`/next` 只数 `feat` / `fix`，且 scope 不是 `framework` / `strip` / `data` / `deps`；
其余类型（`refactor` `perf` `style` `test` `docs` `chore` `ci` `build`）一律不计。业务功能提交**必须**用 `feat` 或 `fix`，并写业务领域的 scope。

### 提交示例

```bash
feat(works): 新增作品标签聚合页
fix(seo): 修复分类页 canonical 缺少结尾斜杠
feat(sync): 新增 B 站投稿列表数据源
feat(framework): seo.ts 新增 eventJsonLd          # 孵化项目里改框架核心：单独提交，不计进度
perf(works): 列表页封面改用 srcset 响应式尺寸
docs(skills): 补充 data-sync 防风控章节
chore(data): 同步 B 站投稿数据
chore(deps): 升级 astro 到 7.3.5
chore(framework-sync): 同步框架 a1b2c3d..f9e8d7c（合并 2 / 跳过 1）
refactor(strip): 裁剪 posts、faq 模块
```

提交信息末尾可附会话范围标识：`[scope: works]`（多会话并发时便于回溯）。

### 提交流程

```bash
# 1. 查看当前改动（对照本会话改过的文件清单）
git status --short

# 2. 验证门
pnpm verify

# 3. 逐个添加本会话改动的具体文件
git add src/pages/works/tag/[tag].astro src/lib/works.ts

# 4. 核对暂存区没有越界文件（越界的 git restore --staged 撤出）
git diff --cached --name-only

# 5. 提交到本地（不推送）
git commit -m "feat(works): 新增作品标签聚合页"

# 6. 只有用户明确要求时才推送 → 走 Sigil（见下节）
```

多行提交信息用 `git commit -F -` 读标准输入（纯文本 heredoc 允许），不要把长说明塞进 `-m`。

### 不要提交的文件

```bash
# 本地配置与密钥
.env
.env.*          # .env.example 除外（它是模板，要提交）
*-local.*

# 构建与缓存产物（已在 .gitignore）
dist/
.astro/
.cache/
node_modules/
test-results/
playwright-report/

# IDE / 系统
.idea/
.vscode/*       # .vscode/extensions.json 除外
Thumbs.db
nul             # Windows 下误用 > nul 产生的文件，发现即删
```

---

## 🔴 远程 Git 操作走 Sigil

> **一句话**：凡是要连远程、要认证的 git 操作（推送 / 克隆 / 拉取 / 建仓 / 远端核对），一律走 Sigil（凭据由保险库注入、明文不外泄、不落 `.git/config`）。本地操作（status / diff / add / commit / log / branch / merge）照旧用 git CLI。

### 1. 判断 Sigil 是否可用

- 本会话能 `ToolSearch` 到 `mcp__sigil__git_push` → 可用。
- 🔴 **「装了但连不上」≠「没装」**：工具列表里有 `mcp__sigil__*`，但调用报错 / 断连 / 金库锁定 → 按第 4 条「失败处置」停下。
- **环境里根本没有 Sigil** → 同样停下：告诉用户「远程操作需要先安装并连接 Sigil」，或者由用户自己在终端完成推送 / 拉取。
  AI 不执行任何本地远程 git 命令，没有「经授权改用原生 git」这条后路（hook 也会拦截）。

### 2. 只接管「远程认证操作」

| 操作 | 走谁 |
|------|------|
| 推送分支 / tag | `mcp__sigil__git_push(repo_path, remote, branch 或 tag, credential_name)` |
| 强推（重写历史后，且用户明确同意） | `git_push(..., force=true)`，Sigil 内部自动做 force-with-lease |
| 克隆私有仓 | `git_clone(repo_url, target_path, credential_name)` |
| fetch / pull | 先 `workspace_register` 登记工作区 → `workspace_fetch` / `workspace_pull` |
| 查远端分支 / 提交 / 文件 | `git_branches_list` / `git_commits_list` / `git_file_get` |
| 建远程仓库 | `git_repo_create(credential_name, name, description)`（**强制私有**） |
| `status` / `diff` / `add` / `commit` / `log` / `branch` / `merge` | 本地 git CLI（纯离线） |

> 上表工具三平台通用（GitHub / Gitee / GitCode），平台由 `credential_name` 的凭据类型自动推断，`platform` 可不传。

### 3. 选凭据：按远程域名挑 `credential_name`

| 远程 host | 常见 `credential_name` |
|-----------|-------------------|
| `gitee.com` | `gitee` |
| `gitcode.com` | `gitcode` |
| `github.com` | `github1`、`github3` …（按账号编号） |

- 🔴 **以实时查询为准**：先 `mcp__sigil__list_credentials` 查实际名称，上表只是常见命名，不要写死猜。
- **`username` 不用传**：Sigil 按远程 host 自动带出。
- 多 remote 逐个推，各用对应域名的凭据；推送前 `git remote -v` 看清 remote 名（不一定叫 `origin`）。
- 返回值看 `structured.pushed`：`false` 表示远端本来就是最新，**没有真正推送**。

### 4. 失败处置 = 安全停下，绝不落明文

- Sigil 报错（`vault locked` / 凭据缺失 / 能力未启用 / token 越权 / 断连）→ **停下报出错误前缀**，提示用户去 Sigil 解锁 / 补凭据 / 重连。
- 推送失败先读错误末尾的「↳ 恢复」指引照做，**不要反复试错**。
- 🔴 **绝不改走原生 `git push`，绝不手拼 `https://user:TOKEN@host` 明文 URL**。
- 🔴 **不用 `git credential fill` 取 token**（没存凭据时弹窗阻塞，写进循环就是弹窗风暴），**不读 `~/.xxx_token` 文件**拼请求。

### 5. 推送后远端核对

```
mcp__sigil__git_commits_list(credential_name=<同推送凭据>, repo=<owner/repo>, sha=<分支>, per_page=1)
```

核对远端分支头 = 本地 `git rev-parse HEAD`。不用 `git ls-remote`（会弹凭据窗）。

### 6. 安全红线

- 不展示 / 不推断 token；不让任何能力 `echo $TOKEN`。
- 工具返回里的敏感串只摘要或前缀显示。
- 建仓一律私有；用户明确要公开仓，需再次确认风险后到平台网页端手动改可见性。

---

## 提交类型说明

| 类型 | 说明 | 计入进度 | 示例 |
|------|------|:---:|------|
| feat | 新功能 | ✅（scope 为 `framework` / `strip` / `data` / `deps` 时 ❌） | `feat(works): 新增作品标签聚合页` |
| fix | 修复 Bug | ✅（同上） | `fix(seo): 修复分类页 canonical 缺少结尾斜杠` |
| refactor | 重构（不改行为） | ❌ | `refactor(strip): 裁剪 posts 模块` |
| perf | 性能优化 | ❌ | `perf(works): 列表页封面改用 srcset` |
| docs | 文档 | ❌ | `docs(tasks): 勾选 T12` |
| style | 纯格式 | ❌ | `style: prettier 格式化` |
| test | 测试 | ❌ | `test(search): 补充多词检索用例` |
| chore | 构建 / 工具 / 依赖 / 数据 / 框架同步 | ❌ | `chore(data): 同步作品数据` |
| ci | CI 配置 | ❌ | `ci: 新增构建工作流` |
| build | 构建系统 | ❌ | `build: 调整 Dockerfile 构建阶段` |

功能改动与注释改动分开提交（CLAUDE.md 编码与注释规范）。

---

## 常用命令（本地）

### 基础操作

```bash
git status --short
git diff                 # 工作区改动
git diff --cached        # 已暂存的改动
git add <file>           # 逐个添加（禁止 git add -A / git add .）
git commit -m "feat(scope): 描述"
```

### 分支操作

```bash
git branch               # 本地分支
git branch <name>        # 创建
git switch <name>        # 切换（多会话并发时除非用户明确要求，不切分支）
git merge <name>         # 合并
git branch -d <name>     # 删除本地分支
```

远程分支查看用 Sigil `git_branches_list`，不用依赖 fetch 的 `git branch -r`；删除 GitHub 远程分支用 `github_ref_delete`，
其他平台没有对应工具时请用户在网页端删除。

### 历史查看

```bash
git log --oneline -10
git log --follow -- <file>
git log -1 --format="%ar|%s" -- <file>   # 修改文件前的 L2 检查
git show <commit-id>
```

### 撤销操作（注意多会话禁令）

```bash
# 撤出暂存（安全）
git restore --staged <file>

# 撤销最后一次本地提交、保留改动（仅限本会话刚做的、尚未推送的提交）
git reset --soft HEAD^
```

🔴 以下命令会丢失其他会话的未提交改动，**本项目禁止**（CLAUDE.md 跨会话操作禁令）：
`git stash` / `git stash pop`、`git reset --hard`、`git checkout -- <file>`、`git restore <file>`（丢弃工作区改动）、`git clean -fd`。
确需丢弃本会话自己的改动时，只针对本会话改过的具体文件，并先向用户说明。

---

## 分支策略

| 分支 | 用途 |
|------|------|
| 主分支 | 随时可构建、可部署。框架仓库是 `master`；`project-init` 孵化的项目是 `main`（`git init -b main`）。以 `git branch --show-current` 为准，推送、PR、`/codex:review --base` 都用实际名字 |
| `feature/*` | 较大功能（跨多天、需要评审）时使用 |
| `fix/*` | 线上问题修复 |

内容站迭代节奏快、单人维护居多，**小步提交直接在主分支上进行**即可；多人协作或大改版时再开功能分支，经 Sigil `git_pr_create` 发 PR 合并。

预计 30 分钟以上同时改**不同模块**时，用 `claude --worktree <名字>` 让每个会话在独立目录和分支上工作（CLAUDE.md「并行开发：worktree」）：
worktree 隔离不了端口，每个 worktree 的 dev server 用不同端口（`pnpm dev --port 4331`…）；同一目录里不要并行跑两个 `astro build` / `astro sync`。

---

## 冲突解决

### 合并冲突

```bash
git merge feature/xxx
# CONFLICT (content): Merge conflict in src/lib/works.ts

# 打开冲突文件，手动解决 <<<<<<< / ======= / >>>>>>> 标记
# 解决后逐个添加冲突文件
git add src/lib/works.ts
pnpm verify              # 冲突解决后必须重跑验证门
git commit --no-edit     # 用 git 生成的合并说明（Merge branch …），不要写成 feat/fix，免得被算进业务进度
```

### 常见冲突点

| 文件 | 冲突原因 | 处理 |
|------|---------|------|
| `pnpm-lock.yaml` | 两边都改了依赖 | 接受任意一边后重新 `pnpm install` 生成，不手工合并 |
| `src/data/*.json` | 数据同步在两边各跑了一次 | 接受较新一次同步的结果，或重新 `pnpm sync` |
| `src/site.config.ts` | 导航 / 配置各改了一处 | 手工合并，两边的改动都保留 |
| `.claude/hooks/skill-forced-eval.cjs` | 两边各加了技能 | 手工合并清单，再 `pnpm check:skills` |

---

## 实用技巧

### 修改最后一次提交（仅限未推送的本会话提交）

```bash
git commit --amend -m "新的提交信息"
```

已推送的提交不 amend，改用追加一个 `fix(...)` 提交。

### Cherry-pick

```bash
git cherry-pick <commit-id>      # 仅限本仓库内的分支之间；从框架仓库拿更新走 framework-sync，不要直接 cherry-pick 框架提交
```

### 查看某人的提交

```bash
git log --author="作者名" --oneline
```

---

## 注意事项

### 禁止操作

1. **强制推送到主分支**：确需重写历史且用户明确同意时，只用 Sigil `git_push(force=true)`
2. **本地跑远程 git 命令**：`git push` / `git fetch` / `git pull` / `git clone` / `git ls-remote` / `git credential fill`（没有 Sigil 也不例外）
3. **提交密钥与本地配置**：`.env`、`*-local.*`、任何含 token 的文件
4. **自动推送**：用户没明确要求就不推
5. **批量添加**：`git add -A` / `git add .`
6. **破坏性本地命令**：`git stash`、`git reset --hard`、`git clean -fd`、丢弃他人未提交改动

### 最佳实践

1. **只提交当前会话改动**：精确到文件
2. **验证门先行**：`pnpm verify` 全绿再提交
3. **规范的 type**：业务功能用 `feat` / `fix` + 业务 scope，否则进度统计抓不到；框架同步、裁剪、数据、依赖用各自固定写法
4. **小步提交**：一个任务一个提交，便于回滚与追溯
5. **数据与代码分开提交**：`pnpm sync` 产生的例行数据刷新单独提交，用 `chore(data): 同步作品数据`（不计入开发进度），不与页面改动混在一起
