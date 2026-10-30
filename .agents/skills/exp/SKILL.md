---
name: exp
description: |
  /exp - 经验沉淀：把会话与最近提交里的踩坑、纠正、重复模式沉淀到技能 / CLAUDE.md / 经验文档，并写本次摘要

  参数：[session | commits [天数] | review]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /exp，或描述同类意图时，按本文流程执行。）

  触发词：/exp、exp
---

# /exp - 经验沉淀助手

把本次会话和最近 Git 提交中产生的隐性知识（踩坑心得、反复纠正、重复模式）转成显性资产——沉淀到技能、`CLAUDE.md`、经验文档里，让下次换个会话、换个人都能复用。

> 每次会话结束前花 2 分钟沉淀，比之后花 2 小时重新踩坑划算。
> 详细方法论见 `exp-sediment` 技能；本命令是它的执行入口。

## 使用方式

```
/exp                # 默认：分析会话 + 最近 7 天提交
/exp session        # 仅分析当前会话
/exp commits [N]    # 仅分析最近 N 天提交（默认 7）
/exp review         # 盘点现有经验资产（过时 / 冗余检查）
```

---

## 第零步：识别仓库模式（框架 vs 子项目）

每次都按下面的规则现场判定（与 `.claude/framework-config.json` 的 `modeDetection` 一致），**不以缓存为准**：

```bash
ls .framework-sync.json 2>/dev/null; grep -m1 '"name"' package.json
```

1. 有 `.framework-sync.json` → **子项目**（subproject）
2. 否则 `package.json` 的 name 为 `next-ai-astro` → **框架**（framework）
3. 都不满足 → 问用户，并建议用 `framework-sync` 技能的「首次配置」补 `.framework-sync.json`

`.claude/exp.config.json` 只是本机缓存（已在 `.gitignore`，不入库，孵化时不会被带进子项目）；它与判定结果不一致时以判定为准，并覆盖缓存。

首次运行初始化目录（存在则跳过）：

```bash
mkdir -p ".claude/docs/experience/$(date +%Y-%m)" .claude/docs/experience/review-reports
# 子项目模式额外：
[ -f .framework-sync.json ] && touch .claude/docs/experience/feedback-to-framework.md
```

子项目没有 `.claude/PROJECT.md` 时（正常由 `project-init` 生成），用 Write 建一个带标题 `# PROJECT.md - <站点名>` 和「项目专属禁令」「与框架的差异」两个小节的骨架，别留空文件。

| 维度 | 框架模式 | 子项目模式 |
|------|---------|-----------|
| 新技能 | `.claude/skills/<名>/`（委托 `add-skill`） | 同样放 `.claude/skills/<名>/`（Claude Code 只从这里加载技能），名字不与框架技能重名 |
| 登记 hook | 在 `.claude/hooks/skill-forced-eval.cjs` 的 SKILL_GROUPS 登记技能名（触发词取自 description） | 同左；hook 是框架核心文件，这一处改动单独提交、scope 写 `framework`（如 `chore(framework): hook 登记项目技能 <名>`），`/framework-sync` 合并 hook 时要保留这一行 |
| 禁令 / 规范 | `CLAUDE.md`「绝对禁止的写法」或「Astro 7 版本红线」（`AGENTS.md` 有同名章节时一并同步） | `.claude/PROJECT.md` |
| Codex 镜像 | 改完技能 / 命令后 `pnpm agents:sync && pnpm check:skills` | 同左（`check:skills` 会校验 `.agents/` 镜像，新增技能不同步会报错） |
| 反哺 | — | 通用经验追加到 `.claude/docs/experience/feedback-to-framework.md` |
| 禁止修改 | — | ⛔ 不改框架自带的技能内容和 `CLAUDE.md`（会被 `/framework-sync` 覆盖）；框架技能的漏洞写进 feedback-to-framework.md |

---

## 第一步：收集输入源

```bash
git log --since="7 days ago" --pretty="%h %s" --no-merges    # 天数按参数
git status --short
git diff --stat
ls docs/tasks/active/ 2>/dev/null
ls -t .claude/docs/experience/*/*-exp-summary.md 2>/dev/null | head -1   # 上次摘要，用于去重
```

会话分析（模型自主抽取）：
- **纠正信号**：用户说「不要 / 禁止 / 错了 / 以后 / 应该 / 正确做法是」
- **反复信号**：同类问题在会话中出现 ≥ 2 次（同一个 Astro 7 写法写错两次、同一类 check:seo 错误反复出现）
- **惊讶信号**：「原来 / 没想到 / 居然」

输出简报：

```markdown
📊 本次扫描
- 提交（最近 7 天）：12 条
- 未提交改动：5 个文件
- 活跃任务：2 个
- 上次 /exp：{日期}（已排除重复候选 N 条）
```

---

## 第二步：识别沉淀候选（6 类）

| # | 类型 | 识别信号 | 去向（框架模式） | 去向（子项目模式） |
|---|------|---------|----------------|------------------|
| ① | 新技能候选 | 同类问题反复出现且现有技能不覆盖 | `.claude/skills/<名>/`（委托 `add-skill`） | `.claude/skills/<名>/`（项目专属技能，登记 hook 见上表） |
| ② | 现有技能漏洞 | 激活了某技能仍答错 / 被用户补充规则 | 更新对应 `SKILL.md` | 写入 feedback-to-framework.md |
| ③ | 新禁令 / 规范 | 用户说「以后不要…」/ 纠正写法 | `CLAUDE.md`「绝对禁止的写法」或「Astro 7 版本红线」 | `.claude/PROJECT.md` |
| ④ | 用户偏好 / 项目事实 | 用户描述习惯、项目约束 | Claude Code 记忆（memory） | 同左 |
| ⑤ | 最佳实践文档 | 产出了完整的「怎么做」但不够通用做技能 | `.claude/docs/experience/YYYY-MM/YYYY-MM-DD-<摘要>.md` | 同左 |
| ⑥ | 高频命令候选 | 某组操作一周内出现 ≥ 3 次 | `.claude/commands/<名>.md` | 先观察，很少触发 |

子项目模式下每条候选标注归属：**[本项目专属]** / **[框架通用-反哺]**。

---

## 第三步：展示候选表

```markdown
## 发现 X 条沉淀候选

| # | 摘要 | 类型 | 置信度 | 建议去向 | 归属（子项目） |
|---|------|------|-------|---------|--------------|
| 1 | B 站封面外链需加入 imageDomains 才会构建期优化 | ② 技能漏洞 | 高 | image-optimization | 框架通用 |
| 2 | 本站分类以 B 站合集为准，不另建分类体系 | ④ 项目事实 | 中 | memory | 本项目专属 |

请选择：[A] 逐项确认（推荐）[B] 高置信自动写、中低逐项问 [C] 只沉淀高置信 [D] 全部跳过
```

## 第四步：逐项确认

每条展示：原始信号、建议去向、写入预览、**Why**（从信号中抽取的原因）。
选项：[Y] 写入 [E] 编辑后写入 [S] 跳过 [M] 换个去向。

🔴 每条沉淀必须带 **Why**——没有原因的规则会随时间失效，下次读到也无法判断是否还适用。

## 第五步：分发执行

| 类型 | 执行动作 |
|------|---------|
| ① 新技能 | 委托 `add-skill` 技能（完整流程见其 SKILL.md）；同步登记 `.claude/hooks/skill-forced-eval.cjs` 的技能清单（子项目单独提交，见第零步） |
| ② 技能漏洞 | 框架：Edit 对应 `SKILL.md`；子项目：框架自带技能不改，写进 feedback-to-framework.md，项目专属技能可直接改 |
| ③ 新禁令 | Edit `CLAUDE.md`（框架）/ `.claude/PROJECT.md`（子项目）；框架模式下 `AGENTS.md` 有同名章节时一并同步 |
| ④ 记忆 | 写入 Claude Code 记忆目录并更新索引 |
| ⑤ 文档 | Write `.claude/docs/experience/YYYY-MM/YYYY-MM-DD-<摘要>.md` |
| ⑥ 新命令 | Write `.claude/commands/<名>.md`（带 description frontmatter，≤ 120 字符） |

改了技能或命令（两种模式都一样）→ `pnpm agents:sync && pnpm check:skills`，同步 Codex 镜像并校验。

## 第六步：写本次摘要（每次必写）

写入 `.claude/docs/experience/YYYY-MM/YYYY-MM-DD-exp-summary.md`（文件名必须以 `-exp-summary.md` 结尾——`CLAUDE.md` 约定会话开始时读取最近一份）：

```markdown
# /exp 沉淀摘要 - {日期}

**仓库模式**：framework | subproject
**扫描范围**：会话 + 最近 N 天提交
**识别候选**：X 条　**已沉淀**：Y 条　**已跳过**：Z 条

## 已沉淀
| # | 摘要 | 类型 | 去向 |
|---|------|------|------|

## 仍需遵守的禁令 / 踩过的坑（给下次会话读）
- {一句话规则 + 原因}

## 已跳过（附原因）
| # | 摘要 | 跳过原因 |
|---|------|---------|

## 反哺候选（仅子项目）
已追加 N 条到 `.claude/docs/experience/feedback-to-framework.md`
```

提交：`git add` 本次写入 / 修改的具体文件 → `git commit -m "docs(exp): 沉淀 {N} 条经验"`（子项目登记 hook 的那处改动按第零步单独提交）。

## 第七步：反哺提示（仅子项目）

有「框架通用」候选时提示：已追加到 `feedback-to-framework.md`，下次在框架仓库运行 `/exp review` 时决定是否合并进框架技能或 `CLAUDE.md`。

---

## /exp review（盘点模式）

检查维度：
1. **过时技能**：技能内容与当前代码 / 依赖版本是否还一致（如 Astro 升级后 API 已变）
2. **冗余重叠**：语义相近的技能对（如 `seo-meta` 与 `geo-optimization` 的边界是否清楚）
3. **孤岛经验**：`.claude/docs/experience/` 里超过 3 个月未被引用的文档
4. **反哺候选**（框架模式）：读下游子项目的 `feedback-to-framework.md`（用户提供路径时），列出可合并项
5. **记忆腐化**：记忆里引用已不存在的文件 / 函数的条目

输出：`.claude/docs/experience/review-reports/YYYY-QN-audit.md`

## 防止过度沉淀

- 每次最多推荐 **10 条**候选，其余压缩成一条「其他观察」
- 连续 2 次都出现但未被采纳的候选自动降级跳过
- 优先更新现有技能（②）而不是新建（①），避免技能膨胀
- 一次会话最多一次 /exp
- 🔴 含 token、密码、密钥、`.env` 值、用户个人数据的内容一律不沉淀
