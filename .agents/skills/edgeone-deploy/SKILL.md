---
name: edgeone-deploy
description: 本站上线：核对群二维码 → 提交 → 本机构建与全量验证 → 用户确认 → Sigil 推送 Gitee + GitHub → pnpm run deploy 上传 dist → 线上核对 → IndexNow（不走 Docker / Reeve，不用 EdgeOne 云端构建）。触发词：开始部署、部署文档站、发布文档站、上线文档站、EdgeOne
argument-hint: "[--skip-qr] 跳过二维码检查"
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Agent, AskUserQuestion
---

# 文档站上线技能（腾讯云 EdgeOne Pages）

本站部署方式：**本机构建 + CLI 上传**。`pnpm run deploy` = `edgeone pages deploy -n ruoyi-plus-uniapp-doc dist`，把本机构建好的 `dist/` 直接传到 EdgeOne Pages 项目 `pages-rquhy5gcnjf8`，上传完立即生效。
🔴 不能写 `pnpm deploy`：那是 pnpm 内置的工作区部署命令，会绕过项目脚本。

对用户来说是「推送即上线」：推送都由 AI 经 Sigil 完成，推送后紧接着上传，两步在同一轮做完。

## 🔴 为什么不用 EdgeOne 云端构建（2026-11-01 三次实测，别再试）

云端构建机是 4 核 6 GB，本站构建会被杀（exit 137）：

| 次 | 构建命令 | 结果 |
|---|---|---|
| 1 | `pnpm run build`（含 astro check） | 生成静态页时被杀 |
| 2 | `NODE_OPTIONS=--max-old-space-size=3584 pnpm run build:fast` | 被杀（155 s） |
| 3 | `MALLOC_ARENA_MAX=2 NODE_OPTIONS=--max-old-space-size=2048 pnpm run build:fast` | 打包阶段 `Building static entrypoints` 就被杀（147 s） |

本机实测：构建进程私有内存峰值约 5 GB，其中堆只有 1.3~1.6 GB、external 约 0.7 GB，其余约 2 GB 是 Vite 8 打包器 rolldown（Rust、多线程）的原生内存——限堆管不到，Linux 上还会更大。
所以仓库里**不放 `edgeone.json`**，EdgeOne 控制台的 Git 自动部署应保持关闭（开着的话每次推送都会收到一封构建失败通知，但失败的构建不会替换线上版本）。
页面规模或构建方式大改之后想重新评估，先在本机用 `process.memoryUsage()` 量峰值，别直接拿推送去试。

## 🔴 红线

- **上传 = 立即上线**：第四步之前必须问用户「确认上线吗」，拿到明确同意才执行；本轮之前的同意不算数
- **验证不过不上线**：第三步任何一项不过，不推送、不上传
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
pnpm verify                                   # 构建（含 astro check、离线图标、llms.txt、pagefind）+ check:seo + 单元测试
node scripts/check-anchors.mjs                # 站内锚点
node scripts/migrate/manifest.mjs dist .migrate/new-manifest.json
node scripts/migrate/compare-baseline.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json
node scripts/migrate/compare-site.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json .migrate/baseline-dist dist
```

- 改过 `src/lib/markdown/` 插件或 `src/data/vp-icons.json`：先 `pnpm cache:clear`
- 比对脚本依赖 `.migrate/` 下的旧站基线（不入库）；本机没有基线时跳过两条比对，并在报告里注明
- 🔴 上传的就是这一步产出的 `dist/`：验证之后不要再单独跑 `astro build`（它不跑 pagefind，传上去站内搜索会坏）

### 第四步：推送并上传（先问用户）

AskUserQuestion：「验证全部通过，确认推送并上线到 ruoyi.plus 吗？上传后立即对外生效。」用户同意后：

1. `mcp__sigil__git_push`：Gitee（`remote=origin`，`credential_name=gitee`）、GitHub（`remote=github`，`credential_name=github1`；配额或权限问题按全局规则换账号）。
   推送后用 `git_commits_list` 核对远端最新提交 = 本地 `git rev-parse HEAD`。一个远程失败不影响另一个，但要报告
2. 上传：

```bash
pnpm run deploy         # 超时给 5 分钟；失败输出错误，不重试第二次以上
```

### 第五步：线上核对

- 线上首页引用的 `/_astro/*.css` 与本机 `dist/index.html` 一致（= 已是本次构建；CDN 一般秒级生效）
- 本次改动所在页抓下来，确认改动内容在
- 改动面大时（侧栏、网址、插件）：旧站清单 511 页 + sitemap 全部网址逐条请求，非 200 应为 0

### 第六步：通知搜索引擎

```bash
pnpm indexnow --since <上次上线的提交>   # 推送这次上线包含的全部提交里变更的文档页
pnpm indexnow --all                      # 全站大改时全量推送
```

- `<上次上线的提交>` 取第四步 `git_push` 返回的 `summary` 左边那个（如 `4637ce6..65be2de` 取 `4637ce6`）——推送前远端停在哪，上次就上线到哪
- 🔴 不带参数的 `pnpm indexnow` 只看最近一次提交：一次上线常有多个提交，最后一个不改文档（如样式修改）时会推 0 条，前面提交改的文档全漏掉（2026-11-01 实录）
- 先加 `--dry` 看一眼要推哪些地址再真推

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
| EdgeOne 上传 | ✅ |
| 线上核对 | ✅ 已是本次构建 |
| IndexNow | ✅ N 条 / ⚠️ 失败（不影响上线） |
| 线上抽查 | ✅ |
```
