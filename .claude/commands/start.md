---
description: 新会话快速了解项目：识别是框架仓库还是孵化出的子项目，给出现状概览与对应的工作流入口
---

# /start - 项目智能导航

作为项目导航助手，识别当前环境（框架仓库 / 子项目），用一屏内容告诉用户「现在是什么状态、接下来能做什么」。

---

## 第一步：环境检测

```bash
ls .framework-sync.json 2>/dev/null                 # 存在 = 由框架孵化出的子项目
grep -m1 '"name"' package.json                      # next-ai-astro = 框架仓库本身
ls .claude/framework-config.json .claude/PROJECT.md 2>/dev/null
ls docs/项目状态.md docs/待办清单.md docs/需求文档.md 2>/dev/null
ls docs/prototypes/ 2>/dev/null
grep -rhcE "^- \[ \] T[0-9]+" docs/tasks/active/ 2>/dev/null   # 各台账未完成任务数
grep -cE "^- \[ \] \[需决策\]" docs/BLOCKERS.md 2>/dev/null     # 待决策项
git status --short
git log -5 --format="%H|%an|%cn|%s" --no-merges
grep -nE "name:|url:" src/site.config.ts
```

### 判定规则（与 `.claude/framework-config.json` 的 `modeDetection` 一致）

| 条件 | 环境 |
|------|------|
| 无 `.framework-sync.json`，且 `package.json` 的 name 为 `next-ai-astro` | **A. 框架仓库**（维护者环境） |
| 有 `.framework-sync.json`，且没有业务进度提交 / 示例数据未替换 | **B1. 刚孵化的子项目** |
| 有 `.framework-sync.json`，且已有业务进度提交 | **B2. 开发中的子项目** |
| 以上都不满足 | **C. 未登记来源的项目**（按 B2 展示，并提示可补 `.framework-sync.json`） |

子项目有 `.claude/PROJECT.md` 时读一遍（项目专属禁令，优先级高于 `CLAUDE.md`），在概览里提一句它的要点。

「示例数据未替换」：`.claude/framework-config.json` 的 `framework.examples.paths` 里的文件（如 `src/data/works.json`）与框架版本一致或仍含「示例数据」字样。

---

## 第二步：Git 提交过滤

与 `/next`、`/progress` 一致（`CLAUDE.md`「提交与进度口径」）：只展示业务进度提交——`feat` / `fix` 且 scope 不是 `framework` / `strip` / `data` / `deps`；cherry-pick、`chore(framework-sync)` 同步提交、author ≠ committer 的提交单独标注或略去。

---

## 第三步：输出（按环境选择模板）

技能 / 命令数量以实测为准：`ls .claude/skills | wc -l`、`ls .claude/commands | wc -l`，不要写死。

### A. 框架仓库

```markdown
# 👋 欢迎回到 next-ai-astro 框架仓库

## 框架信息
- 技术栈：Astro 7 + Tailwind v4 + React 19 island + TypeScript（Node ≥ 22.12，pnpm）
- AI 体系：{N} 个技能 / {M} 个命令 / hooks（技能强制评估、Shell 卫生、nul 清理）
- 示例站：作品目录 + 分类落地页 + 文章 + FAQ，SEO / GEO 字段齐全

## 最近动态
{过滤后的 3-5 条提交}

## 当前状态
- 代码：✅ 干净 / ⚠️ 有 X 个未提交文件
- 验证门：{pnpm verify 最近结果，未知则提示运行}
- 活跃任务：{docs/tasks/active/ 或「无」}

## 常用入口
| 想做什么 | 入口 |
|---------|------|
| 基于框架起一个新站点 | `/kickoff <一句话想法>` |
| 只孵化，不走需求 / 原型 | 说「新建项目」→ `project-init` |
| 改进框架本身的页面 / 组件 | `/dev`（这里是框架仓库，改核心就是框架演进，正常 `feat/fix(scope)` 提交） |
| 新增 / 调整技能 | 说「添加技能」→ `add-skill`；改完 `pnpm check:skills` |
| 规范检查 / 全量验证 | `/check`、`pnpm verify` |
| 沉淀经验 | `/exp`（框架模式，可反哺技能） |

## 典型工作流
一句话想法 → /kickoff（需求门 → 原型门）→ project-init 孵化 → 新项目里 /loop /dev-loop
```

### B1. 刚孵化的子项目

读取 `.framework-sync.json` 的 `upstream`（框架地址 / 分支 / 基线）、`lastSync`。

```markdown
# 👋 欢迎来到 {site.name}

## 项目信息
- 站点：{site.name}（{site.url}{若仍为 example.com：⚠️ 占位域名，上线前需修改}）
- 基于框架：next-ai-astro @ {initCommit 短 hash}；上次框架同步：{lastSync 或「从未」}

## 就绪情况
- 需求文档：{✅ docs/需求文档.md / ❌ 未创建}
- 原型：{✅ docs/prototypes/ 下 N 个页面 / ❌ 无}
- 任务台账：{✅ N 条 T 任务 / ❌ 未拆分（起飞后 /dev-loop 第 0 轮会自动拆）}
- 项目专属规则：{✅ .claude/PROJECT.md / ⚠️ 缺失（project-init 应生成）}
- 示例数据：{⚠️ 仍是框架示例（works / posts / faq），可用 /strip-modules 裁剪或替换}

## 推荐下一步
{有需求 + 原型 → 起飞：智码里 /dev-orchestrate，否则 /loop /dev-loop}
{缺需求 → /kickoff 或 /init-docs}
{示例不需要 → /strip-modules --preview}
```

### B2. 开发中的子项目（C 同此模板）

```markdown
# 👋 欢迎回到 {site.name}

## 最近动态
{过滤后的 3-5 条业务提交}

## 当前状态
- 代码：✅ 干净 / ⚠️ 有未提交修改
- 内容：{集合名 × 条目数，如 videos 128 条 / categories 8 个}
- 任务台账：{台账名与 T 任务进度 X/Y}
- 待决策：{docs/BLOCKERS.md 未勾的 [需决策] N 项 / 无}
- 待办：高 X / 中 X / 低 X（{或：未找到待办清单，运行 /init-docs 创建}）
- 站点健康：{check:seo 结果 / 未构建}

## 你可以
| 想做什么 | 入口 |
|---------|------|
| 获取下一步建议 | `/next`（推荐） |
| 继续自主开发 | `/loop /dev-loop` 或 `/dev-orchestrate` |
| 新增页面 / 功能 | `/dev` |
| 新增内容类型 | `/collection` |
| 更新外部数据 | `/sync-data` |
| 上线前验收 / 部署 | `/seo-check` → `/deploy` |
| 同步框架更新 | `/framework-sync` |
| 查看完整进度 | `/progress` |
```

有业务代码但没有 `docs/` 三文档时，追加：

```markdown
## ⚠️ 建议
检测到业务代码，但还没有项目文档。运行 `/init-docs`（扫描模式）自动生成项目状态、需求文档、待办清单。
```

---

## 注意事项

- 一屏内能看完（框架仓库环境可稍长）
- 明确区分框架（已完成、别改）与业务（要开发）
- 子项目环境重点展示起飞入口与框架同步；开发中项目重点展示进度与下一步
- 不输出框架核心文件里的 TODO，只关注业务代码
- 只读：本命令不修改任何文件
- 语气友好、简洁
