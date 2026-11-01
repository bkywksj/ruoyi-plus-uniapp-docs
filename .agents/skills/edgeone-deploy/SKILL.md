---
name: edgeone-deploy
description: 本站上线：核对群二维码 → 提交 → 本机构建与全量验证 → 用户确认后 Sigil 推送 Gitee + GitHub（推送即触发 EdgeOne 云端构建上线）→ 核对云端构建与线上 → IndexNow（不走 Docker / Reeve）。触发词：开始部署、部署文档站、发布文档站、上线文档站、EdgeOne
argument-hint: "[--skip-qr] 跳过二维码检查"
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Agent, AskUserQuestion
---

# 文档站上线技能（腾讯云 EdgeOne Pages）

本站部署方式（2026-11-01 起）：**推送到 Git 仓库即自动部署**。EdgeOne Pages 项目（`pages-rquhy5gcnjf8`）连着仓库，推送后在云端按根目录 `edgeone.json` 构建：
`pnpm install --frozen-lockfile` → `NODE_OPTIONS=--max-old-space-size=3584 pnpm run build:fast` → 发布 `dist/`。

- 为什么是 `build:fast`（不含 `astro check`）+ 限堆：云端构建机是 4 核 6 GB，本站构建峰值约 4.6~5 GB，带上类型检查会被杀（exit 137，2026-11-01 实录）。类型检查改在本机推送前跑（第三步 `pnpm verify`）
- `edgeone.json` 的三个字段覆盖控制台「构建部署配置」；改构建命令改这个文件，不去控制台改
- 云端构建失败**不会**替换线上版本；失败时用备用路线：本机 `pnpm run deploy`（= `edgeone pages deploy -n ruoyi-plus-uniapp-doc dist`，CLI 直接上传本机构建好的 `dist/`）。🔴 不能写 `pnpm deploy`，那是 pnpm 内置的工作区部署命令，会绕过项目脚本

严格按步骤执行，任何一步失败就停下报告。

## 🔴 红线

- **推送 = 立即上线**：第四步推送之前必须问用户「确认上线吗」，拿到明确同意才执行；本轮之前的同意不算数
- **验证在推送前**：云端只构建、不跑任何检查，第三步不过就不推送
- **推送只走 Sigil**（`git_push`，Gitee 用 `gitee`、GitHub 用 `github1` 等凭据），不跑本地 `git push`
- **逐个 `git add <文件>`**，不用 `git add -A` / `git add .`

## 部署流程

### 第一步：群二维码是否最新（`--skip-qr` 可跳过）

`public/wxq.jpg` 是技术交流群二维码，微信群码 7 天过期、群满会换。看修改日期：

```bash
date -r public/wxq.jpg +%Y-%m-%d; date +%Y-%m-%d
```

超过 7 天：用 AskUserQuestion 问「群二维码最后更新于 <日期>，需要先换吗？」，用户说要换就停下等用户放图。

### 第二步：工作区与提交

```bash
git status --porcelain
git log --oneline -5
```

有未提交改动：列给用户看，按 `<type>(<scope>): 中文说明` 逐个文件 `git add` 后提交（提交信息末尾带当前会话规定的 Co-Authored-By 行）。
正文 md 有改动的，确认已登记到 `scripts/migrate/known-diffs.json` 的 `edited` 或属于新增页面（见第三步的比对）。

### 第三步：本机构建与全量验证

```bash
pnpm verify                                   # 构建（含 astro check、离线图标、llms.txt）+ check:seo + 单元测试
node scripts/check-anchors.mjs                # 站内锚点
node scripts/migrate/manifest.mjs dist .migrate/new-manifest.json
node scripts/migrate/compare-baseline.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json
node scripts/migrate/compare-site.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json .migrate/baseline-dist dist
```

- 改过 `src/lib/markdown/` 插件或 `src/data/vp-icons.json`：先 `pnpm cache:clear`
- 比对脚本依赖 `.migrate/` 下的旧站基线（不入库）；本机没有基线时跳过两条比对，并在报告里注明

### 第四步：推送（= 上线，先问用户）

AskUserQuestion：「验证全部通过，确认推送并上线到 ruoyi.plus 吗？推送后 EdgeOne 自动构建，约 5 分钟后对外生效。」用户同意后用 `mcp__sigil__git_push`：
1. Gitee：`remote=origin`，`credential_name=gitee`
2. GitHub：`remote=github`，`credential_name=github1`（配额或权限问题按全局规则换账号）

推送后用 `git_commits_list` 核对远端最新提交 = 本地 `git rev-parse HEAD`。一个远程失败不影响另一个，但要报告。

### 第五步：核对云端构建

等约 5 分钟，检查线上是否已是本次构建：抓 `https://ruoyi.plus/` 与本次改动所在页，比对本机 `dist/` 里对应文件的特征内容（如改动的文案、`/_astro/` 资源文件名）。
构建结果以 EdgeOne 控制台（项目 `pages-rquhy5gcnjf8` 的部署记录）为准，CLI 查不到时请用户看一眼。
云端构建失败：线上仍是上一版；报告失败原因（用户贴日志），需要立即上线时走备用路线 `pnpm run deploy`（超时给 5 分钟，失败不重试第二次以上）。

### 第六步：通知搜索引擎

```bash
pnpm indexnow           # 推送最近一次提交里变更的文档页；首次切换新站用 pnpm indexnow --all
```

推送失败不影响上线结果，只提示。

### 第七步：线上抽查

用智码内置浏览器打开 `https://ruoyi.plus/`、一篇文档页、一个营销页、`/sitemap-index.xml`、`/llms.txt`，确认能打开、页头页脚正常、站内搜索能搜到东西。

### 第八步：部署报告

```markdown
## 部署完成

| 步骤 | 状态 |
|---|---|
| 群二维码 | ✅ 最新 / ⚠️ 用户确认沿用 |
| 提交 | ✅ <hash> / 无改动 |
| 构建与验证 | ✅ verify / 锚点 / 逐页比对 / 全站比对 |
| Gitee / GitHub | ✅ 远端 = 本地 <hash> |
| EdgeOne 云端构建 | ✅ 线上已是本次构建 / ⚠️ 失败，已走 CLI 上传 |
| IndexNow | ✅ N 条 / ⚠️ 失败（不影响上线） |
| 线上抽查 | ✅ |
```
