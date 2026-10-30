---
name: progress
description: |
  /progress - 项目进度报告：综合 git、任务台账、待办、需求、页面与内容规模、站点健康，输出结构化的只读快照

  （Claude Code 斜杠命令的 Codex 版：用户输入 /progress，或描述同类意图时，按本文流程执行。）

  触发词：/progress、progress
---

# /progress - 项目进度报告

作为项目进度分析助手，综合分析项目全貌后，输出**结构化的全面进度报告**。

> **与 /next 的区别**：/progress 是全面的只读报告（当前状态的快照），/next 是精简的下一步建议。

---

## 第一步：收集项目全貌（7 个数据源，并行执行）

### 1.1 Git 提交分析（按进度口径分类）

```bash
git log -30 --format="%H|%an|%cn|%ad|%s" --date=short --no-merges
```

口径来自 `.claude/framework-config.json` 的 `progress`，与 `CLAUDE.md`「提交与进度口径」一致：

| 分类 | 识别方式 | 计入业务进度 |
|------|---------|:-----------:|
| 业务进度提交 | 类型为 `feat` / `fix`，且 scope 不是 `framework` / `strip` / `data` / `deps` | ✅ |
| 框架与维护提交 | `feat(framework)`、`refactor(strip)`、`chore(data)`、`docs(tasks)`、`test`、`refactor` 等其余一切 | ❌ |
| 同步提交 | message 含 `cherry picked from`，或以 `chore(framework-sync)` 开头，或 author ≠ committer | ❌（单独列出） |

**输出**：业务进度提交数与列表、框架与维护提交数、同步提交数、开发方向（业务进度提交按 scope 归类）。

### 1.2 任务台账

```bash
grep -rnE "^- \[[ x]\] T[0-9]+" docs/tasks/active/ 2>/dev/null
```

🔴 只有「## 🎯 实现步骤」区块里以 `- [ ] T<数字>` / `- [x] T<数字>` 开头的行算任务；待决策事项等其他复选框不统计。

| 读取区域 | 提取信息 | 用途 |
|---------|---------|------|
| 文件头部 | 状态、更新时间 | 判断是否停滞 |
| 任务行 + 字段 | 完成数 / 总数、`里程碑:`、`需求:` | 任务完成率、里程碑进度 |
| 当前进度 | 正在进行、下一步、阻塞问题 | 汇总当前状态 |
| 问题记录 | 🟢 已解决 / 🟡 进行中 / 🔴 待解决 数量 | 问题统计 |

超过 7 天未更新 → 「⚠️ 可能停滞」；有 🔴 待解决 → 「🔴 有阻塞」。

### 1.3 待办清单

读取 `docs/待办清单.md`：高 / 中 / 低优先级数量、最近完成数、逾期数。

### 1.4 需求文档

读取 `docs/需求文档.md`：各状态 REQ 数量（已完成 / 开发中 / 待开发 / 已搁置）与完成率。

### 1.5 页面与内容规模

以 `.claude/framework-config.json` 为准区分**框架核心 / 示例 / 业务**：

```bash
# 路由（页面文件与生成型端点）
Glob pattern: "src/pages/**/*.astro"
Glob pattern: "src/pages/**/*.ts"
# 内容集合定义
Grep pattern: "defineCollection" path: src/content.config.ts output_mode: count
# 数据源
ls scripts/sync/sources/
```

- 每个集合的条目数：JSON 数据读数组长度（`src/data/*.json`），Markdown 数 `src/content/<集合>/**/*.md` 文件数
- 标注哪些数据仍是框架示例（`framework.examples.paths` 里的文件未被替换 → 「示例数据未替换」）
- 已构建时统计生成页面数：`grep -o "<loc>" dist/sitemap-*.xml | wc -l`（sitemap 是单行文件，不能用 `grep -c`，那只会得到行数 1）

### 1.6 站点健康

```bash
ls dist/index.html 2>/dev/null && pnpm check:seo     # 有构建产物才跑，不重新构建（dist 可能不是最新）
grep -n "url:" src/site.config.ts                     # 域名是否仍是占位 example.com
grep -cE "^- \[ \] \[需决策\]" docs/BLOCKERS.md 2>/dev/null   # 待决策项数
grep -cE "^- \[ \] \[可逆\]" docs/BLOCKERS.md 2>/dev/null     # 按默认做法继续、待复核的项数
```

### 1.7 代码待办扫描

```
Grep pattern: "FIXME" path: src glob: "*.{astro,ts,tsx}" output_mode: count
Grep pattern: "TODO" path: src glob: "*.{astro,ts,tsx}" output_mode: count
Grep pattern: "FIXME|TODO" path: scripts glob: "*.mjs" output_mode: count
```

> docs/ 下的文档不存在 → 跳过该数据源，不报错、不创建。

---

## 第二步：综合分析

### 2.1 开发活跃度
最近 7 天开发提交频率、主要方向（按 scope）、节奏（活跃 / 平稳 / 停滞）。

### 2.2 任务健康度

| 指标 | 健康 | 警告 | 危险 |
|------|------|------|------|
| 活跃任务更新间隔 | < 3 天 | 3-7 天 | > 7 天 |
| 阻塞问题数 | 0 | 1 | > 1 |
| 待办积压趋势 | 减少 | 持平 | 增加 |
| check:seo | 全绿 | 有警告 | 有错误 |

### 2.3 完成度

```
需求完成率 = 已完成 REQ / 总 REQ × 100%
台账完成率 = 已勾 T 任务行 / 全部 T 任务行 × 100%（只数「实现步骤」区块）
里程碑进度 = 按 `里程碑:` 字段分组的台账完成率（有该字段时）
待办消化率 = 最近完成 / (最近完成 + 未完成) × 100%（有数据时）
```

---

## 第三步：输出进度报告

```markdown
# 项目进度报告

**生成时间**: {YYYY-MM-DD HH:MM}

---

## 开发活动概览

**最近开发活动**（过滤同步提交后）：{1-3 句话}

| 提交类型 | 数量 |
|---------|------|
| 业务进度提交（feat / fix，scope 不含 framework / strip / data / deps） | X |
| 框架与维护提交（其余类型与排除的 scope） | X |
| 同步提交 | X |

**开发方向分布**（只看业务进度提交）：
- {scope}: X 条（{概括}）

---

## 任务台账

| 台账 | 状态 | 任务进度 | 里程碑 | 最后更新 | 健康度 |
|------|------|---------|--------|---------|--------|
| {台账名} | 🟢 进行中 | X/Y (Z%) | M1 3/3、M2 1/4 | YYYY-MM-DD | ✅ 正常 |

**阻塞问题**：{有则列出}
{无活跃任务时：无活跃任务（docs/tasks/active/ 为空或不存在）}

---

## 待办清单概览

| 优先级 | 数量 |
|--------|------|
| 🔥 高 | X |
| 📌 中 | X |
| 💡 低 | X |

**高优先级待办**：1. … 2. …

---

## 需求进度

| 状态 | 数量 | 占比 |
|------|------|------|
| ✅ 已完成 | X | Z% |
| 🚧 开发中 | X | Z% |
| 📋 待开发 | X | Z% |
| ⏸️ 已搁置 | X | Z% |

**需求完成率**: Z%

---

## 页面与内容

### 路由
| 路由 | 文件 | 类型 | 归属 |
|------|------|------|------|
| /videos/ | src/pages/videos/index.astro | 列表（island） | 业务 |
| /works/ | src/pages/works/index.astro | 列表（island） | 框架示例 |

### 内容集合
| 集合 | 条目数 | 来源 | 数据源 | 状态 |
|------|--------|------|--------|------|
| videos | 128 | src/data/videos.json | scripts/sync/sources/bilibili.mjs | ✅ |
| works | 6 | src/data/works.json | — | ⚠️ 示例数据未替换 |

- 生成页面总数：{N}（sitemap）

---

## 站点健康

| 维度 | 状态 | 说明 |
|------|------|------|
| check:seo | ✅ / ⚠️ / ❌ / 未构建 | {错误 X、警告 Y} |
| 生产域名 | ✅ 已配置 / ⚠️ 占位 | |
| 待决策项 | 需决策 X 项 / 可逆待复核 Y 项 | docs/BLOCKERS.md 未勾行 |
| FIXME / TODO | X / Y | {有 FIXME 列出位置} |

---

## 综合健康度

| 维度 | 状态 | 说明 |
|------|------|------|
| 开发活跃度 | ✅ 活跃 / ⚠️ 平稳 / 🔴 停滞 | 最近 X 天 Y 条业务进度提交 |
| 任务推进 | ✅ 正常 / ⚠️ 有停滞 / 🔴 有阻塞 | |
| 待办积压 | ✅ 可控 / ⚠️ 较多 / 🔴 积压 | |
| 上线就绪 | ✅ / ⚠️ / 🔴 | check:seo、域名、示例数据是否清理 |

---

## 下一步

> 运行 `/next` 获取具体的下一步开发建议
```

---

## 强制规则

| 规则 | 说明 |
|------|------|
| 不预估时间 | 禁止输出「预计 X 小时 / 天」 |
| 只读不写 | 只分析和输出报告，不修改任何文件（`pnpm check:seo` 只读 `dist/`） |
| 按进度口径统计 | 只数 feat / fix（scope 为 framework / strip / data / deps 除外）；同步提交单独列 |
| 框架 / 示例 / 业务分开统计 | 以 `.claude/framework-config.json` 为准，示例内容不算业务进度 |
| 台账只数任务行 | 只统计「实现步骤」区块里的 `T<数字>` 行 |
| 文档不存在时跳过 | 不报错、不创建 |
| 客观评估 | 不夸大不缩小；数字全部来自实际统计 |
| 结尾联动 | 报告末尾推荐运行 `/next` |

## 与其他命令的关系

| 命令 | 关系 |
|------|------|
| `/next` | /progress 是全面报告，/next 是精简的下一步建议 |
| `/update-status` | /update-status 会修改文档，/progress 只读 |
| `/check` | /check 检查代码规范，/progress 统计进度指标 |
| `/start` | /start 是新会话快速概览，/progress 是深度报告 |
