---
description: 把 next-ai-astro 框架仓库的更新选择性同步到当前孵化项目：逐提交分类分析，用户确认后合并
argument-hint: "[--status | --only core | 起始 commit]"
---

# /framework-sync - 框架更新同步

从 next-ai-astro 框架仓库拉取更新，**选择性**合并到当前孵化项目。本命令只做编排，完整规范（冲突处理、手动应用、记录格式）见 **`framework-sync` 技能**，执行前先激活它。

## 用法

| 用法 | 说明 |
|------|------|
| `/framework-sync` | 检测上次同步后的全部新提交，分类后逐个确认 |
| `/framework-sync --status` | 只看待同步提交数与分类，不改任何文件 |
| `/framework-sync --only core` | 只看涉及框架核心的提交 |
| `/framework-sync <commit>` | 从指定提交开始计算 |

## 核心原则

1. **选择性合并**：不是所有更新都要，逐个分析后由用户确认
2. **边界来自 `.claude/framework-config.json`**：`framework.core.paths` 建议合并；`framework.examples.paths` 与 `business.paths` 建议跳过；`framework.projectConfig.paths` 需要评估。
   路径同时落在多个分类里时按优先级判定：**框架核心 > 已裁模块 / 已改造模块 > 项目配置 > 示例 > 业务**（例如 `src/lib/seo.ts` 同时在 core 与 business 的 `src/lib/` 下，按核心处理）
3. **不覆盖项目身份**：`src/site.config.ts`（站名 / 域名 / 品牌色）是项目自己的，永远不整文件覆盖
4. **跳过已裁模块**：`.framework-sync.json` 的 `strippedModules` 里的模块路径不再同步
5. **改造模块逐条判断**：`transformedModules` 里的模块（如 works → videos）不自动合并、也不直接跳过，按改名对照把需要的修复移植到改造后的文件
6. **历史可追溯**：每次同步记录到 `.framework-sync.json`

---

## 执行流程

### 第零步：环境检查

```bash
cat .framework-sync.json            # upstream.url / branch / initCommit / lastCommit / strippedModules / transformedModules / syncs
git remote -v | grep upstream
```

- 没有 `.framework-sync.json` → 不是由 `project-init` 孵化的项目：按 `framework-sync` 技能的「首次配置」询问框架地址、基线提交后生成
- 在框架仓库本身（`package.json` name 为 `next-ai-astro` 且没有 `.framework-sync.json`）运行 → 停下提示：本命令用在孵化项目里
- 确定怎么读框架仓库（细节见 `framework-sync` 技能「第 0 步：确定怎么读框架仓库」）：
  - **框架在本机**（`upstream.url` 是本地路径，如 `E:/my/AI框架/next-ai-astro`）→ 不需要 fetch，直接读：`UP="git -C <框架目录>"`，`REF=master`
  - **框架在远程**（Gitee / GitCode / GitHub）→ 🔴 `mcp__sigil__workspace_fetch(workspace=<本项目工作区>, remote="upstream")`（未登记先 `workspace_register`），之后 `UP="git"`，`REF=upstream/master`；Sigil 报错则停下提示用户，不回退原生 `git fetch`

### 第一步：统计待同步提交

```bash
$UP log <lastCommit>..$REF --oneline --date-order
```

数量多时让用户选：一次性处理（推荐）/ 分批 / 只看 feat·fix / 按目录筛选 / 指定范围。

### 第二步：按路径分类

对每个提交用 `$UP show --stat <sha>` 看改了哪些文件，按 `.claude/framework-config.json` 归类（路径以该文件为准，下表只是举例）：

| 分类 | 路径示例 | 默认建议 |
|------|---------|---------|
| 框架核心 | `src/components/seo/`、`src/components/layout/`、`src/components/ui/`、`src/lib/seo.ts`、`src/styles/global.css`、`scripts/check-seo.mjs`、`scripts/sync/run.mjs`、`deploy/`、`Dockerfile`、`.claude/skills/`、`.claude/commands/`、`.claude/hooks/`、`.codex/`、`.agents/` | ✅ 合并 |
| 示例内容 | `src/data/works.json`、`src/content/posts/*.md`、`public/examples/`、`scripts/sync/sources/example.mjs` | ⏭️ 跳过 |
| 已裁模块 | `strippedModules` 里模块的路径（清单见 `.claude/skills/module-strip/presets/<模块>.json`） | ⏭️ 跳过 |
| 已改造模块 | `transformedModules` 里模块的路径（同一份预设清单） | ⚠️ 逐条评估（不合并原文件；要的修复按改名对照移植到改造后的文件） |
| 项目配置 | `src/site.config.ts`、`src/content.config.ts`、`src/pages/llms.txt.ts`、`astro.config.ts`、`package.json` | ⚠️ 评估（只取新增字段 / 依赖升级，不覆盖本项目的值） |
| 文档 | `CLAUDE.md`、`AGENTS.md` | ⚠️ 评估（项目专属规则在 `.claude/PROJECT.md`，不受影响） |

混合提交（同时改了核心和示例）拆开处理：只应用核心部分。

### 第三步：逐个分析选中的提交

每个提交展示：message、改动文件（按分类）、关键 diff 摘要、对本项目的影响、建议（合并 / 跳过 / 部分合并），等用户确认。
判断冲突风险：
- `git log -1 --format=%h -- <file>` 看本项目是否动过该文件
- `git log --oneline --grep="(framework)"` 列出本项目自己对框架核心的改动（孵化项目改核心时 scope 写 `framework`），这些位置最容易与上游冲突，合并时逐处保留本项目的改动意图

### 第四步：应用

按 `framework-sync` 技能执行：选中的提交**逐个以补丁形式应用到工作区、不单独提交**，全部应用完再合成一个提交。
- 🔴 不用 `git cherry-pick`：它会把框架的 `feat(...)` / `fix(...)` 提交原样带进本项目历史，被 `/progress` 当成业务进度
- 整提交只涉及核心文件、且本项目没改过这些文件 → 导出补丁 `$UP format-patch -1 <sha> --stdout > logs/fw-<sha>.patch`，`git apply --check` 通过后 `git apply --index`
- 部分合并 / 本项目改过的文件 → `git apply --3way --include=<路径>`，或读 `$UP show <sha> -- <path>` 后用 Edit 手动应用，保留本项目的改动意图
- `package.json` 依赖升级 → 应用后 `pnpm install`
- 🔴 不用 `git checkout <文件>` / `git reset --hard` 丢弃改动（多会话避让协议）

### 第五步：验证

```bash
pnpm build && pnpm check:seo && pnpm test
node .claude/skills/module-strip/scripts/module-strip.mjs --audit    # 已裁模块没有被合回来（有 strippedModules 时；改造模块不查，靠第三步逐条把关）
```

改了技能 / 命令 / hook 时，再跑 `pnpm agents:sync && pnpm check:skills`。任一不绿不提交。

### 第六步：记录与提交

更新 `.framework-sync.json`：`lastSync`（`date '+%Y-%m-%dT%H:%M:%S%:z'`）、`lastCommit`，`syncs` 追加一条（合并 / 跳过的 sha 列表与说明）。

```bash
git add <本次改动的具体文件> .framework-sync.json      # 逐个添加
git commit -m "chore(framework-sync): 同步框架至 <upstream 短 hash>（合并 X / 跳过 Y）"
```

一次同步只产生这一个提交；`chore(framework-sync)` 不计入业务进度。

### 第七步：同步报告

```markdown
## 框架同步完成

- 范围：<lastCommit 旧> → <upstream 新>（共 N 个提交）
- 已合并：X 个　已跳过：Y 个　部分合并：Z 个
- 验证：build ✅ / check:seo ✅ / test ✅ / 已裁模块未复活 ✅
- 需要你关注：{与本项目改动冲突、手动合并的文件 / 依赖升级的影响}
- 下次同步起点：<新 lastCommit>
```

## 注意事项

- 同步前工作区应干净；有他者未提交改动时按 `CLAUDE.md` 的 L1 协议避让，不 stash、不 reset
- 项目的 `/exp` 沉淀在同步前先跑一次，避免被覆盖
- `chore(framework-sync)` 提交不计入业务进度（`/progress`、`/next` 把它识别为同步提交）
- 补丁文件放 `logs/`（不入库），同步完成后可删
