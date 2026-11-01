---
name: edgeone-deploy
description: 本站上线：核对群二维码 → 提交 → Sigil 推送 Gitee + GitHub → 构建与全量验证 → 用户确认后 edgeone pages deploy 上传 dist → IndexNow → 线上抽查（不走 Docker / Reeve）。触发词：开始部署、部署文档站、发布文档站、上线文档站、EdgeOne
argument-hint: "[--skip-qr] 跳过二维码检查"
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Agent, AskUserQuestion
---

# 文档站上线技能（腾讯云 EdgeOne Pages）

本站部署方式：本机构建后用 EdgeOne CLI 上传 `dist/`（`pnpm run deploy` = `edgeone pages deploy -n ruoyi-plus-uniapp-doc dist`；🔴 不能写 `pnpm deploy`，那是 pnpm 内置的工作区部署命令，会绕过项目脚本），**不是** git 推送触发构建。
严格按步骤执行，任何一步失败就停下报告。

## 🔴 红线

- **上传 = 立即上线**：第五步之前必须问用户「确认上线吗」，拿到明确同意才执行；本轮之前的同意不算数
- **推送只走 Sigil**（`git_push`，Gitee 用 `gitee`、GitHub 用 `github1` 等凭据），不跑本地 `git push`
- **逐个 `git add <文件>`**，不用 `git add -A` / `git add .`
- **构建或任何验证不过，不上线**

## 部署流程

### 第一步：群二维码是否最新（`--skip-qr` 可跳过）

`public/wxq.jpg` 是技术交流群二维码，群满会换。看修改日期：

```bash
date -r public/wxq.jpg +%Y-%m-%d; date +%Y-%m-%d
```

不是今天改的：用 AskUserQuestion 问「群二维码最后更新于 <日期>，需要先换吗？」，用户说要换就停下等用户放图。

### 第二步：工作区与提交

```bash
git status --porcelain
git log --oneline -5
```

有未提交改动：列给用户看，按 `<type>(<scope>): 中文说明` 逐个文件 `git add` 后提交（提交信息末尾带当前会话规定的 Co-Authored-By 行）。
正文 md 有改动的，确认已登记到 `scripts/migrate/known-diffs.json` 的 `edited` 或属于新增页面（见第四步的比对）。

### 第三步：推送到远程（Sigil）

用 `mcp__sigil__git_push`：
1. Gitee：`remote=origin`，`credential_name=gitee`
2. GitHub：`remote=github`，`credential_name=github1`（配额或权限问题按全局规则换账号）

推送后用 `git_commits_list` 核对远端最新提交 = 本地 `git rev-parse HEAD`。一个远程失败不影响另一个，但要报告。

### 第四步：构建与全量验证

```bash
pnpm verify                                   # 构建（含离线图标 / llms.txt 生成）+ check:seo + 单元测试
node scripts/check-anchors.mjs                # 站内锚点
node scripts/migrate/manifest.mjs dist .migrate/new-manifest.json
node scripts/migrate/compare-baseline.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json
node scripts/migrate/compare-site.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json .migrate/baseline-dist dist
```

- 改过 `src/lib/markdown/` 插件或 `src/data/vp-icons.json`：先 `pnpm cache:clear`
- 比对脚本依赖 `.migrate/` 下的旧站基线（不入库）；本机没有基线时跳过两条比对，并在报告里注明

### 第五步：上传到 EdgeOne（先问用户）

AskUserQuestion：「构建与验证全部通过，确认上传到 ruoyi.plus 吗？上传后立即对外生效。」用户同意后：

```bash
pnpm run deploy
```

超时给 5 分钟。失败输出错误，不重试第二次以上。

### 第六步：通知搜索引擎

```bash
pnpm indexnow           # 推送最近一次提交里变更的文档页；首次切换新站用 pnpm indexnow --all
```

推送失败不影响上线结果，只提示。

### 第七步：线上抽查

用智码内置浏览器打开 `https://ruoyi.plus/`、一篇文档页、一个营销页、`/sitemap.xml`、`/llms.txt`，确认能打开、页头页脚正常、站内搜索能搜到东西。

### 第八步：部署报告

```markdown
## 部署完成

| 步骤 | 状态 |
|---|---|
| 群二维码 | ✅ 最新 / ⚠️ 用户确认沿用 |
| 提交 | ✅ <hash> / 无改动 |
| Gitee / GitHub | ✅ 远端 = 本地 <hash> |
| 构建与验证 | ✅ verify / 锚点 / 逐页比对 / 全站比对 |
| EdgeOne 上传 | ✅ |
| IndexNow | ✅ N 条 / ⚠️ 失败（不影响上线） |
| 线上抽查 | ✅ |
```
