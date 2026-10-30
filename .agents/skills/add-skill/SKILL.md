---
name: add-skill
description: 新增、修改、重命名、删除技能与斜杠命令，并同步 hook 清单、Codex 镜像（.agents/skills）与 AGENTS.md 技能索引；含 SKILL.md 头部格式规范。触发词：添加技能、创建技能、新技能、技能开发、写技能、技能文档、修改技能、更新技能、删除技能、重命名技能、同步技能
---

# 技能创建与维护指南

## 何时使用

- 需要为新的开发场景（新内容类型、新数据源、新部署方式）添加技能
- 需要把一次成功的实现步骤沉淀成可复用技能（常由 `/exp` 的 ① 类候选委托过来）
- 需要修改现有技能内容或触发词，并同步到 Codex 镜像
- 需要重命名或删除现有技能
- 需要新增或修改斜杠命令（命令同样要镜像给 Codex）

## 概述

本指南用于在 next-ai-astro 框架（以及由它孵化出的项目）中**添加新技能**和**维护现有技能**（修改、重命名、删除）。
技能是框架的核心能力：UserPromptSubmit hook 每轮注入技能清单，模型评估后激活匹配的技能，保证写法与框架规范一致。

一个技能在框架里有 **4 个落点**，漏任何一处都会出现「文件在但很少被激活」或「Claude 能用、Codex 不能用」：

| 落点 | 路径 | 作用 |
|------|------|------|
| ① 技能正文（主） | `.claude/skills/<name>/SKILL.md`（含 scripts/、presets/ 等附属文件） | 单一真相源，所有修改只在这里做 |
| ② Hook 清单 | `.claude/hooks/skill-forced-eval.cjs` 的 `SKILL_GROUPS`（只登记技能名，触发词运行时取自 ① 的 description） | 每轮强制评估时注入给模型的清单 |
| ③ Codex 声明 | `AGENTS.md` 技能索引（`<!-- skills:start -->` 区块） | Codex 端的技能索引，由 `pnpm agents:sync` 从 ② 自动生成，**不手改** |
| ④ Codex 镜像 | `.agents/skills/<name>/` | Codex 实际读取的技能目录（由脚本整目录复制） |

> **核心原则**：`.claude/skills/` 是主目录，`.agents/skills/` 是**唯一** Codex 镜像，**不手工编辑镜像**，一律 `pnpm agents:sync` 生成。`.codex/skills/` 不使用。

### 🔴 Codex 目录边界（必读）

OpenAI Codex CLI 遵循 [Agent Skills 开放标准](https://agentskills.io)，技能目录是通用的 **`.agents/skills/`**。只有 skills 这一个组件放在 `.agents/`，Codex 的其它配置一律在 `.codex/`：

| Codex 组件 | 项目级路径 | 放 `.agents/`？ |
|-----------|-----------|:---:|
| **Skills**（技能） | `.agents/skills/` | ✅ 唯一的 |
| Hooks | `.codex/hooks/`、`.codex/hooks.json` | ❌ 留 `.codex/` |
| Config | `.codex/config.toml` | ❌ 留 `.codex/` |
| 自定义 agents | `.codex/agents/*.toml`（名字叫 agents 但在 `.codex/` 下，勿混淆） | ❌ 留 `.codex/` |
| 斜杠命令 | 仅用户级 `~/.codex/prompts/`，**不支持项目级** | ❌ |

**为什么不在 `.codex/skills/` 再放一份**：Codex 会同时扫描 `.codex/skills/` 和 `.agents/skills/`，两处都有时每个技能在模型上下文里出现两遍，纯属 token 噪声。

**验证 Codex 是否发现技能**：在仓库根执行 `codex debug prompt-input "test"`，输出里 `### Available skills` 段应列出项目技能，路径指向 `.agents/skills`。

---

## Claude 命令与 Codex 技能的对应关系

Codex 不支持项目级自定义斜杠命令，所以 `.claude/commands/*.md` 必须**以技能形式**镜像到 `.agents/skills/`，让 Codex 通过 description 自然语言匹配触发。

| 类型 | Claude 位置 | Codex 镜像位置 | 镜像方式 |
|------|------------|---------------|---------|
| 技能 | `.claude/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` | 原样复制（含附属目录） |
| 命令 | `.claude/commands/<name>.md` | `.agents/skills/<name>/SKILL.md` | 生成 YAML 头（name + description）+ 相同正文 |

**命令文件的 YAML 头**：`description` 必填（Claude Code 显示在命令菜单里，`pnpm check:skills` 要求 ≤ 120 字符），`argument-hint` 有参数时填；同步脚本据此生成 Codex 技能的 `name` 与 `description`：

```markdown
---
description: 新增一种内容类型：schema + 数据 + 同步源 + 列表 / 详情 / 分类页
argument-hint: <内容类型名> [数据来源]
---

# /collection - 新增内容类型
...
```

### 🔴 特殊规则 1：本地命令（`*-local`）不镜像

以 `-local` 结尾的命令只在 Claude Code 本机使用（涉及本地路径、未提交配置等），**不镜像到 `.agents/skills/`**，也**不写进 hook 清单**（用户直接 `/xxx-local` 触发）。同步脚本按文件名自动跳过。

### 🔴 特殊规则 2：技能与命令同名时加 `cmd-` 前缀

同一领域既有技能又有同名命令时（如 `framework-sync` 技能 + `/framework-sync` 命令），Codex 镜像里命令版本统一改名为 **`cmd-<name>`**，避免目录冲突：

| 类型 | Claude 位置 | Codex 位置 |
|------|------------|-----------|
| 技能 | `.claude/skills/framework-sync/SKILL.md` | `.agents/skills/framework-sync/SKILL.md` |
| 命令 | `.claude/commands/framework-sync.md` | `.agents/skills/cmd-framework-sync/SKILL.md` |

镜像内 `name` 字段必须与目录名一致（`cmd-framework-sync`）。新建命令时尽量不与技能同名（例如数据同步：技能叫 `data-sync`，命令叫 `/sync-data`）。

---

## 🔴 YAML 头部强制规范（最高优先级）

> 这是创建技能时最容易出错的部分。头部写错，技能就算存在也很难被正确激活。

### 强制格式

```yaml
---
name: {技能名称}
description: {一句话定位}。触发词：{词1}、{词2}、{词3}、…（≤ 12 个）
---

# {技能标题}

## 何时使用

- {具体场景 1}
- {具体场景 2}
- {具体场景 3}
```

**为什么 description 要短**：Claude Code 把所有技能的 name + description 放进一个有字符预算的技能列表，
描述写长了，预算不够时部分技能在列表里**只剩名字**，模型就无从判断什么时候该用它（本框架演练中出现过多个技能、命令只显示名字的情况）。
所以 description 只放「一句话定位 + 触发词」，触发场景、前置要求、不适用场景都挪到正文开头的「## 何时使用」。

### name 字段

| 规则 | 说明 | 示例 |
|------|------|------|
| **格式** | kebab-case（全小写，横线连接） | ✅ `site-search` |
| **禁止** | 下划线、驼峰、空格 | ❌ `site_search`、`siteSearch` |
| **长度** | 2-4 个单词 | ✅ `content-collections`、`seo-meta` |
| **语义** | 清晰表达技能领域 | ✅ `image-optimization`，❌ `image`（太宽泛） |
| **一致** | 与目录名完全一致 | 目录 `rss-feed/` → `name: rss-feed` |
| **子项目** | 孵化出的项目新增自己的技能时加项目前缀 | ✅ `bili-video-sync`，避免与框架以后新增的技能撞名 |

### description 字段

| 部分 | 要求 |
|------|------|
| **长度** | 整段 ≤ 200 个字符（按字符数算，中英文都算 1 个；`pnpm check:skills` 会校验） |
| **写成一行** | `description: …` 单行，不用 `\|` 多行块 |
| **一句话定位** | 说清「这个技能解决什么问题」，句号结尾 |
| **触发词** | 紧跟「触发词：」，顿号分隔，≤ 12 个；hook 注入清单直接取这一段，缺了清单里就只剩技能名（`check:skills` 报错） |
| **协作类技能** | `collaborating-with-*` 在定位句里写明「仅当用户点名 xxx 时使用」 |
| **避开 YAML 陷阱** | 不写半角「冒号 + 空格」、不以 `#` `&` `*` `!` `\|` `>` `'` `"` 开头；中文全角冒号「：」没问题 |

正文开头的「## 何时使用」：至少 3 个**具体**场景；容易误触发的技能再写 `🔴 不适用场景`，指向正确技能。

### ✅ 正确示例

```yaml
---
name: rss-feed
description: 为站点生成 RSS / Atom 订阅源，并在页面 head 声明订阅地址。触发词：RSS、Atom、订阅源、feed、@astrojs/rss、rss.xml、订阅
---

# RSS 订阅源（rss-feed）

## 何时使用

- 需要给文章集合输出 RSS 订阅
- 需要在页面 `<head>` 声明订阅源地址
- 需要按分类输出多个订阅源
```

### ❌ 常见错误

| 错误 | 例子 | 后果 |
|------|------|------|
| name 用下划线 / 驼峰 | `name: rss_feed` | 与目录名不一致，校验失败 |
| description 写成多行长段落 | 触发场景、前置要求全塞进 description | 超出技能列表预算，只显示名字；`check:skills` 报错 |
| description 只有一个词 | `description: RSS 工具` | 模型无从判断何时激活 |
| 触发词少于 5 个 | `触发词：RSS、订阅` | 用户换个说法就激活不到 |
| 触发场景太宽泛 | `- 处理数据` | 与其他技能抢激活 |
| description 里有半角 `: ` | `description: 部署: Docker…` | YAML 解析出错，整个头部失效 |

---

## 前置条件

- [ ] **已读 CLAUDE.md**：尤其是「Astro 7 版本红线」「核心架构」「绝对禁止的写法」
- [ ] **已读 3 个现有技能**：同分组的技能优先（如写数据类技能先读 `content-collections`、`data-sync`）
- [ ] **已确认不重叠**：`ls .claude/skills/` 并读相近技能的 description；**优先补强现有技能，而不是新建**
- [ ] **已找到参考代码**：技能里提到的路径必须在仓库里真实存在（见 CLAUDE.md「参考代码位置」）

---

## 第 1 步：分析与规划

### 1.1 定义技能属性

```
名称：rss-feed（kebab-case）
分组：流程与规划 / Astro 开发 / SEO·GEO·统计 / 质量 / 环境与发布 / 经验与协作
      （与 hook 清单的分组一致，插入到对应分组下）
范围：解决什么问题、不解决什么问题、与哪些技能相邻
参考代码：src/pages/llms.txt.ts（生成型端点的写法）
```

### 1.2 估计文档量

| 技能类型 | 行数 | 例子 |
|---------|------|------|
| 小型（单一工具 / 单一配置） | 150-300 | `icon-management`、`analytics` |
| 中型（一个开发领域） | 300-500 | `site-search`、`image-optimization` |
| 大型（完整流程） | 500+ | `project-init`、`data-sync` |

篇幅服从准确性：宁可短而全对，不要长而混入过时写法。

---

## 第 2 步：编写 SKILL.md

### 2.1 推荐结构

```markdown
---
(YAML 头：name + 单行 description)
---

# {技能标题}

## 何时使用
{具体触发场景；需要时加「🔴 不适用场景」}

## 概述
{1-2 段：解决什么问题，框架里现在是什么状态}

## 框架现状
{相关文件路径表：哪些已经实现、在哪}

## 标准做法
{分场景给出代码，代码必须符合 Astro 7 当前写法}

## 检查清单
{完成后逐项核对，能落到命令的写命令：pnpm verify 等}

## 常见错误
{错误写法 → 正确写法 → Why}

## 与相邻技能的边界
{什么情况改走哪个技能}
```

### 2.2 内容要求

- [ ] **路径真实**：出现的每个文件路径都在仓库里存在，或明确标注「新建」
- [ ] **写法正确**：涉及 Astro API 的代码对照 CLAUDE.md「版本红线」，拿不准用 context7 查 `/withastro/docs`
- [ ] **验证可执行**：给出的验证命令能直接跑（`pnpm build` / `pnpm check:seo` / `pnpm test` / `pnpm verify`）
- [ ] **错误对比**：至少 3 条「错误 → 正确 → 为什么」
- [ ] **不捏造**：不写无法核实的性能数字、用户数、案例
- [ ] **Windows 兼容**：命令示例遵守 CLAUDE.md「Bash/Shell 禁止项」（不用 `> nul`、`/tmp`、内联长脚本）
- [ ] **远程操作走 Sigil / Reeve**：技能里不出现本地 `git push/fetch/pull/clone`、明文 token URL、裸 `ssh`

---

## 第 3 步：声明（Hook 清单）

### 3.1 Hook 清单（`.claude/hooks/skill-forced-eval.cjs`）

清单只登记技能名，按分组排列：

```javascript
const SKILL_GROUPS = [
  // ...
  ['Astro 开发', ['astro-routing', 'content-collections', /* ... */, 'rss-feed']],   // ← 名字加进对应分组
  // ...
];
```

- 插到正确的分组下，保持分组可读
- **触发词不在 hook 里写**：hook 运行时读取 SKILL.md description 中「触发词：」之后的部分（`、` 分隔），
  这段也是 Claude Code 技能列表显示的内容。以前两处各写一份，演练时实测已经对不上（description 有的关键词注入清单里没有），
  所以只留一个来源。description 缺「触发词：」段时 `pnpm check:skills` 报错
- 点名才激活的协作类技能（`collaborating-with-*`）在 hook 的 `GUARDS` 里加限定语「仅当用户点名 xxx 时」，防止泛词误触发

### 3.2 AGENTS.md 与 Codex hook：都不用手改

- **AGENTS.md 技能索引**：`pnpm agents:sync` 读取 hook 导出的 `SKILLS`（技能名 + 从 description 取出的触发词），重写 `AGENTS.md` 里 `<!-- skills:start -->` 与 `<!-- skills:end -->` 之间的表格。手改会在下次同步时被覆盖。
- **`.codex/hooks/skill-forced-eval.cjs`**：不维护技能清单，只注入「评估 → 读 SKILL.md → 实现」的流程指令（Codex 启动时已从 `.agents/skills/` 加载全部技能的 name 与 description，再注入一遍是重复）。

---

## 第 4 步：同步 Codex 镜像

```bash
pnpm agents:sync     # scripts/sync-agents-skills.mjs：.claude/skills + .claude/commands → .agents/skills
```

脚本行为：技能原样复制（含附属目录）；命令生成 YAML 头 + 正文；`*-local` 命令跳过；与技能同名的命令加 `cmd-` 前缀；`.codex/skills-extra/` 下的 Codex 专属技能（如 `autonomous-dev`）一并复制；上次生成过、源头已删除的目录会被清理（清单记在 `.agents/skills/.generated.json`）；最后重写 AGENTS.md 技能索引。

只改了附属文件（`scripts/`、`presets/`、`templates/`）也要重新同步——Codex 读的是镜像里的那一份。

> 脚本不可用时的手工兜底：`cp -r .claude/skills/<name> .agents/skills/`，再 `diff -r` 确认无差异。

---

## 第 5 步：验证

```bash
pnpm check:skills    # scripts/validate-skills.mjs：技能目录 / hook 清单 / AGENTS.md / 镜像 四方一致，description 长度，无 BOM
```

再做一次**激活测试**：用包含触发词的问题提问（如「给文章加个 RSS 订阅」），确认 hook 注入的清单里有新技能，且模型评估后调用了 `Skill(rss-feed)`。

---

## 修改现有技能（维护流程）

> 所有修改只在 `.claude/skills/` 做，然后 `pnpm agents:sync`。

### 场景 1：修改正文或附属文件（最常见）

1. 编辑 `.claude/skills/<name>/` 下的文件
2. `pnpm agents:sync`
3. `pnpm check:skills`

### 场景 2：修改触发词或触发场景

1. 触发词改 SKILL.md 的 `description`；触发场景改正文的「## 何时使用」（hook 清单自动跟着变，不用改）
2. `pnpm agents:sync && pnpm check:skills`（AGENTS.md 索引随之更新）

### 场景 3：重命名技能（`old-name` → `new-name`）

1. `git mv .claude/skills/old-name .claude/skills/new-name`
2. 改 YAML 头的 `name`
3. 改 hook `SKILL_GROUPS` 里的技能名（AGENTS.md 索引由同步脚本重写）
4. 全局搜索旧名称的引用（其他技能、命令、CLAUDE.md 都可能提到）：
   ```bash
   grep -rn "old-name" .claude CLAUDE.md AGENTS.md .codex --include=*.md --include=*.cjs --include=*.json
   ```
5. `pnpm agents:sync`（会清理镜像里的 `old-name`）+ `pnpm check:skills`

### 场景 4：删除技能

1. `git rm -r .claude/skills/<name>`
2. 从 hook `SKILL_GROUPS` 移除该技能名
3. 全局搜索引用并改指向替代技能
4. `pnpm agents:sync && pnpm check:skills`

### 场景 5：新增 / 修改命令

1. 编辑 `.claude/commands/<name>.md`（保留 YAML 头的 `description`，≤ 120 字符）
2. `pnpm agents:sync`
3. 若命令需要参与自动评估（少见，命令一般由用户直接敲），把名字加进 hook `SKILL_GROUPS`，并在命令 description 末尾加「触发词：…」段

---

## 常见陷阱

### 陷阱 1：只写了 SKILL.md，没进 hook 清单

**症状**：技能文件在，但很少被激活。
**原因**：Claude Code 自己的技能列表里虽然也有它（name + description），但本框架靠 hook 每轮注入清单来**强制评估**；不在清单里的技能只能碰运气被模型想起。
**解决**：第 3.1 步必做；`pnpm check:skills` 会报「目录存在但清单缺失」。

### 陷阱 2：手工改了 `.agents/skills/` 镜像

**症状**：下次 `pnpm agents:sync` 后改动消失。
**原因**：镜像是生成物。
**解决**：永远改 `.claude/skills/`，再同步。

### 陷阱 3：触发词太宽泛

**症状**：无关问题也激活该技能（例如用「页面」作触发词会和 `astro-routing`、`ui-components` 同时命中）。
**解决**：用领域专有词（API 名、文件名、专业术语）；宽泛词只放在最相关的那个技能里。

### 陷阱 4：技能里写了过时的 Astro API

**症状**：模型照着技能写出 `src/content/config.ts`、`entry.slug`、`<ViewTransitions />` 这类已失效写法。
**解决**：写完后对照 CLAUDE.md「Astro 7 版本红线」逐条自查；代码片段最好从仓库里能跑通的文件摘录。

### 陷阱 5：与现有技能重叠

**症状**：两个技能给出不同答案，模型无所适从。
**解决**：新建前读相近技能；确实要拆分时，在两边的「与相邻技能的边界」里互相指向。

### 陷阱 6：description 越写越长

**症状**：技能列表里只显示名字；`check:skills` 报「超过 200 字符」。
**解决**：description 只留一句话定位 + 触发词，其余挪到「## 何时使用」。

---

## 技能开发清单（提交前）

- [ ] YAML 头：name 为 kebab-case 且与目录一致；description 单行、≤ 200 字符、「一句话定位。触发词：…」、触发词 5~12 个
- [ ] 正文：开头有「## 何时使用」；路径真实、Astro 写法正确、验证命令可执行、≥3 条错误对比、无捏造内容
- [ ] 声明：hook 清单（放对分组）；AGENTS.md 索引由同步脚本生成，不手改
- [ ] 同步：`pnpm agents:sync`
- [ ] 校验：`pnpm check:skills` 全绿；激活测试通过
- [ ] 提交：技能改动单独提交，如 `docs(skills): 新增 rss-feed 技能`
