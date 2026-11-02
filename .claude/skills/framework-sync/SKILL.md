---
name: framework-sync
description: 把 next-ai-astro 框架的后续更新选择性合并进孵化出的项目：按核心 / 示例 / 项目配置分类，逐个确认后应用，跳过已裁模块，最后一个 chore(framework-sync) 提交。触发词：框架同步、upstream、同步框架、拉取框架更新、合并上游、同步上游、.framework-sync.json、框架升级
---

# 框架同步（Framework Sync）

## 何时使用

- 框架有更新（修 bug、升级依赖、改进技能），想同步到已孵化的项目
- 查看框架有哪些新提交还没合进来
- 老项目 / 手工拷贝的项目第一次建立同步记录
- 同步后出现冲突，需要判断保留哪边

## 概述

| 方向 | 技能 / 命令 | 场景 |
|------|------------|------|
| 框架 → 新项目（一次性） | `project-init` | 孵化 |
| **框架 → 已有项目（持续）** | **`framework-sync`（本技能）/ `/framework-sync`** | 框架修 bug、升级依赖、改进技能后合进项目 |
| 项目 → 交付副本 | `delivery-sync` | 给客户的干净副本 |

核心理念：
- **选择性合并**：逐个提交分类、分析，用户确认后才应用
- **边界驱动**：`.claude/framework-config.json` 定义哪些是框架核心（建议合并）、示例（跳过）、项目配置（需评估）
- **尊重裁剪**：项目用 `module-strip` 裁掉的模块，框架对这些路径的更新一律跳过，同步后用 `--audit` 复查
- **尊重改造**：项目把示例模块改造成了别的东西（`transformedModules`，如 works → videos），框架对它的改动不自动合并、也不直接跳过，逐条判断要不要移植到改造后的文件
- **一次同步一个提交**：选中的框架提交先逐个应用到工作区（不单独提交），最后合成一个 `chore(framework-sync): …` 提交。
  原样 cherry-pick 会把框架的 `feat(...)` / `fix(...)` 提交原样带进项目，被 `/progress` 当成业务进度统计
- **可追溯**：每次同步记入 `.framework-sync.json` 的 `syncs`，提交正文列出合并 / 跳过的框架提交

🔴 远程 git 只走 Sigil：本地 `git fetch` / `git pull` / `git clone` / `git ls-remote` 一律不跑（框架 hook 也会直接拦截），
即使 upstream 是本机路径也不用 `git fetch`——直接用 `git -C <框架目录>` 读框架仓库即可。

## 前置条件：`.framework-sync.json`（由 project-init 生成）

```json
{
  "framework": "next-ai-astro",
  "upstream": {
    "url": "<框架仓库地址，或框架本地绝对路径>",
    "branch": "master",
    "initCommit": "<孵化时框架的提交>",
    "initDate": "2026-09-26T10:00:00+08:00"
  },
  "site": { "name": "…", "url": "…", "brandColor": "…" },
  "strippedModules": ["posts"],
  "transformedModules": { "works": "改造为 videos：src/lib/works.ts → videos.ts、WorkCard → VideoCard、/works/ → /videos/" },
  "lastSync": null,
  "lastCommit": "<上次同步到的框架提交>",
  "syncs": []
}
```

| 字段 | 用途 |
|------|------|
| `upstream.url` / `branch` | 从哪里、哪条分支取更新（框架仓库的主分支是 `master`） |
| `lastCommit` | 本次从哪里开始比（首次同步 = `initCommit`） |
| `strippedModules` | `module-strip` 写入；这些模块的路径不再同步 |
| `transformedModules` | 手工写入（见 `project-init` / `module-strip`）：模块没裁掉而是**改造成了别的东西**，值写改名对照。上游对它的改动不自动合并、也不直接跳过，逐条判断要不要移植到改造后的文件；`module-strip` 不预演、不 `--audit` 它。与 `strippedModules` 互斥 |
| `site` | 项目自己的站点信息，同步时**永远不用框架的值覆盖** |

文件不存在（老项目或手工拷贝的项目）→ 进入下方「首次配置」。

## 第 0 步：确定怎么读框架仓库

下面的命令统一用 `$UP` 表示「在框架仓库里执行 git」，`$REF` 表示框架的分支引用：

| upstream 是 | 怎么准备 | `$UP` / `$REF` |
|-------------|---------|----------------|
| **本机路径**（如 `E:/my/AI框架/next-ai-astro`） | 什么都不用拉，框架仓库就在本机 | `UP="git -C E:/my/AI框架/next-ai-astro"`，`REF=master` |
| **远程地址**（Gitee / GitCode / GitHub） | ① 本项目没有 upstream remote 时 `git remote add upstream <地址>`（只写配置，不联网）<br>② 未登记时 `mcp__sigil__workspace_register(name=<项目名>, path=<项目根>, default_credential_name=<按域名选>)`<br>③ `mcp__sigil__workspace_fetch(workspace=<项目名>, remote="upstream")` | `UP="git"`，`REF=upstream/master` |

- `workspace_fetch` 只更新 `refs/remotes/upstream/*`，不动工作区；之后都是本地 git 命令
- `workspace_fetch` 用的是工作区登记时的默认凭据，没有单独的凭据参数。upstream 与 origin 不在同一平台（如项目在 Gitee、框架在 GitCode）时可能认证失败——失败就**停下**告诉用户，改用「本机框架副本」：`mcp__sigil__git_clone` 把框架克隆到本机一个目录，以后按「本机路径」方式同步，更新这份副本用 Sigil 的 `workspace_pull`
- Sigil 报错（锁库 / 缺凭据 / 能力未启用）→ 停下提示用户处理，**不回退**本地 git 命令，也不拼带 token 的 URL

## 第 1 步：看有多少新提交

```bash
LAST=$(node -e "console.log(require('./.framework-sync.json').lastCommit)")
$UP log --oneline --no-merges "$LAST..$REF" | wc -l
$UP log --oneline --no-merges --reverse "$LAST..$REF"
```

| 数量 | 策略 |
|------|------|
| 0 | 告诉用户「框架已是最新」，结束 |
| 1–30 | 一次性分类 |
| 31–100 | 按时间分批，每批 ≤ 30 |
| > 100 | 先只看 `fix` / `feat`，`docs` / `chore` 最后批量处理 |

## 第 2 步：分类

```bash
$UP log --no-merges --reverse --name-only --format="=== %h %s" "$LAST..$REF"
```

按每个提交改动的文件归类。**同一个文件按下表从上往下匹配，先命中的为准**（`business.paths` 的 `src/lib/`、`src/components/` 与核心路径有重叠，所以核心要先判）：

| 顺序 | 文件属于 | 分类 | 默认建议 |
|:---:|---------|------|---------|
| 1 | `strippedModules` 里模块的路径（清单见 `.claude/skills/module-strip/presets/<模块>.json` 的 `delete_dirs` / `delete_files`） | 已裁剪 | **跳过** |
| 1b | `transformedModules` 里模块的路径（同一份预设清单） | 已改造 | **逐条人工判断**：不合并文件本身（会把旧模块带回来）；修复 / 机制改动按改名对照移植到改造后的文件，列进报告「需评估」让用户逐条确认 |
| 2 | `framework.core.paths`（SEO 组件、布局、UI 组件、lib 工具、令牌、校验与同步脚本、deploy、`.claude/` 技能 / 命令 / hooks、`.codex/`、`.agents/`） | 框架核心 | **建议合并** |
| 2b | `framework.docsModule.paths`（docs 模块：DocsLayout、lib/docs*.ts、文档样式、build-llms / indexnow / 迁移脚本……） | docs 模块 | **建议合并**（与核心同等：各站逐字节相同，站点差异都在项目配置里）；项目没有 docs 模块（`strippedModules` 含 docs）时按第 1 行跳过 |
| 3 | `framework.examples.paths`（示例数据、示例文章、示例封面、示例数据源） | 示例 | **跳过**（项目已有自己的内容） |
| 4 | `framework.projectConfig.paths`（`site.config.ts`、`content.config.ts`、`llms.txt.ts`、`astro.config.ts`、`package.json`、favicon / og 图） | 项目配置 | **需评估**：只取框架的「机制改动」，保留项目自己的值 |
| 5 | `pnpm-lock.yaml` | 依赖锁 | 不合并文件本身，随 `package.json` 的依赖升级重新生成 |
| 6 | `CLAUDE.md` / `AGENTS.md` | 规则文档 | 需评估：项目专属规则在 `.claude/PROJECT.md`（不受同步影响）；项目改过根 `CLAUDE.md` 时手工合并 |
| 7 | 其余（`src/pages/`、`src/components/<业务>/`、`tests/` 等框架示例页面） | 业务 / 示例页 | 需评估：项目通常已改写这些页面；只有项目里的该文件自孵化后没改过（`git log --oneline -- <文件>` 只有初始提交）才建议合并 |
| — | 同一提交跨多类 | 混合 | 拆开看：核心部分合、其余按上面规则 |

在孵化出的项目里，改过框架核心文件的提交 scope 固定是 `framework`（CLAUDE.md「框架核心 vs 业务代码」），
`git log --oneline --grep="(framework)" -- <文件>` 能快速看出项目自己动过哪些核心文件。

输出给用户：

```markdown
## 框架更新：{LAST}..{框架最新}，共 N 个提交

### 建议合并（X 个）
| 提交 | 说明 | 涉及 | 分类 |
|------|------|------|------|
| a1b2c3d | fix(seo): og:url 在分页页重复输出 | SEOHead.astro | 框架核心 |

### 需评估（Y 个）
| 提交 | 说明 | 评估点 |
|------|------|-------|
| d4e5f6a | feat(config): site.config 新增 analytics.src | 只加新字段，不覆盖项目的站名/域名 |

### 建议跳过（Z 个）
| 提交 | 说明 | 原因 |
|------|------|------|
| 0a1b2c3 | docs(example): 更新示例文章 | 示例内容 |

请选择：all（合并全部建议项）/ 指定提交（如 a1b2c3d,d4e5f6a）/ skip
```

## 第 3 步：逐个分析选中的提交

```bash
$UP show --stat <sha>
$UP show <sha> -- <相关文件>
```

对每个提交说明：改了什么、为什么（读提交说明）、对项目的影响、是否与项目的改动冲突（`git log -1 --format=%h -- <文件>` 看项目是否改过同一文件）。

## 第 4 步：逐个应用到工作区（先不提交）

同步前工作区应干净；有他者未提交改动时按 CLAUDE.md 的 L1 协议避让，不 stash、不 reset。按时间顺序，每个选中的提交：

```bash
mkdir -p logs                                                  # logs/ 已被 .gitignore 忽略
$UP diff --binary <sha>~1 <sha> > logs/fw-<sha>.patch          # 整个提交
$UP diff --binary <sha>~1 <sha> -- src/lib/seo.ts src/components/seo/ > logs/fw-<sha>.patch   # 只要部分文件
git apply --check logs/fw-<sha>.patch && git apply --index logs/fw-<sha>.patch
```

- `--check` 通过才真正应用；`--binary` 保证图片等二进制文件的改动也能带过来
- `--check` 不通过 → 试 `git apply --3way logs/fw-<sha>.patch`：能三方合并时会留下冲突标记，用 Edit 解决后 `git add <文件>`；
  报「缺少 blob / 无法三方合并」→ 读 `$UP show <sha> -- <文件>`，用 Edit 手工把改动写进项目文件
- 已裁剪模块的文件出现在补丁里（新增文件）→ 从补丁对应的范围里排除这些路径重新生成，别让它们落地
- 已改造模块的文件同样从补丁里排除；用户确认要移植的改动，读 `$UP show <sha> -- <原文件>`，按 `transformedModules` 的改名对照用 Edit 写进改造后的文件（变量名、路由、集合名一并换掉）
- 每应用完一个提交，记下它的 sha 与一句话说明，第 6 步写进提交正文

### 冲突处理规则

| 冲突类型 | 处理 |
|---------|------|
| 项目配置文件（`site.config.ts` 等） | 保留项目的值，只并入框架新增的字段 / 机制 |
| 框架核心文件被项目改过（`feat(framework): …` 提交） | 先看项目为什么改（`git log -- <文件>`）；框架的修复与项目的改动都要保留，拿不准就问用户 |
| `.claude/hooks/skill-forced-eval.cjs` 的技能清单 | 项目加过自己的技能时手工合并清单，两边的条目都保留 |
| 已裁剪模块的文件被补丁新建 | 不要让它落地；落地了就 `git rm <文件>` |
| 已改造模块的原文件被补丁新建（如 `src/lib/works.ts` 又出现） | 不要让它落地；要的改动按改名对照移植到改造后的文件 |
| `package.json` | `name`、`description`、`version` 保持项目自己的值，只并入依赖与脚本的变化 |
| `pnpm-lock.yaml` | 不应用补丁里的锁文件改动，按合并后的 `package.json` 重新 `pnpm install` 生成 |

🔴 不用 `git checkout <文件>` / `git reset --hard` / `git stash` 丢弃改动（多会话避让协议）；某个补丁应用坏了，按 `git diff` 对照补丁手工改回。

## 第 5 步：验证

```bash
pnpm install                    # package.json 有变化时（会同步更新 pnpm-lock.yaml）
pnpm verify                     # build + check:seo + test，必须全绿
node .claude/skills/module-strip/scripts/module-strip.mjs --audit   # 已裁模块没有被带回：退出 0 才算过
```

- `--audit` 退出 1 时会逐个列出被带回的文件：同步误带回的 → `git rm`；有意恢复的模块 → 从 `strippedModules` 里去掉
- 改到了技能 / 命令 / hooks：再跑 `pnpm agents:sync && pnpm check:skills`
- 涉及 UI 的更新，用智码内置浏览器打开首页、列表页、详情页截图确认（见 `e2e-test`）

## 第 6 步：记录与提交（一次同步 = 一个提交）

更新 `.framework-sync.json`（时间用裸 `date '+%Y-%m-%dT%H:%M:%S%:z'`）：

```json
{
  "lastSync": "2026-10-08T15:20:00+08:00",
  "lastCommit": "<本次同步到的框架提交（完整 hash）>",
  "syncs": [
    {
      "date": "2026-10-08T15:20:00+08:00",
      "from": "<旧 lastCommit>",
      "to": "<新 lastCommit>",
      "merged": ["a1b2c3d", "d4e5f6a"],
      "skipped": ["0a1b2c3"],
      "note": "SEO 修复 + analytics 配置机制"
    }
  ]
}
```

`lastCommit` 取本批次分类范围的终点（`$UP rev-parse $REF`），跳过的提交也算「已处理」。

```bash
git add .framework-sync.json <本次改动的具体文件>      # 逐个 add，不用 -A / .
git commit -F - <<'MSG'
chore(framework-sync): 同步框架 a1b2c3d..f9e8d7c（合并 2 / 跳过 1）

合并：
- a1b2c3d fix(seo): og:url 在分页页重复输出
- d4e5f6a feat(config): site.config 新增 analytics.src（只并入字段）
跳过：
- 0a1b2c3 docs(example): 更新示例文章（示例内容）
MSG
```

提交类型固定写 `chore(framework-sync): …`：`/progress`、`/update-status`、`/next` 据此识别为框架同步，不计入业务进度。
需要推送时走 Sigil（见 `git-workflow`）。

## 同步完成报告

```markdown
## 框架同步完成

- 范围：{from}..{to}（共 N 个提交）
- 已合并：X 个（列出提交与一句话说明）
- 已跳过：Y 个（示例内容 / 已裁剪模块 / 用户决定不要）
- 冲突处理：{文件：怎么处理的}
- 验证：pnpm verify ✅ ｜ module-strip --audit ✅ ｜ 截图 ✅
- 下一步：{需要人工确认的事，如 CLAUDE.md 新规则是否采纳}
```

## 首次配置（没有 .framework-sync.json）

1. 问用户框架在哪：本机路径，还是远程地址（远程按第 0 步准备）
2. 找共同起点：项目是由哪个框架提交孵化的？用户说不清时，对照项目首次提交日期找框架那时的提交：
   ```bash
   git log --reverse --format="%ad %h" --date=iso | head -1              # 项目首次提交时间
   $UP log --oneline --before="<上面的时间>" -5 $REF                       # 框架在那之前的提交
   ```
   **选一个保守的（更早的）提交**，并告诉用户这是估计值
3. 按 project-init 的格式写 `.framework-sync.json`，`lastCommit` = 该提交
4. 判断项目裁掉过哪些模块：对每个预设跑 `node .claude/skills/module-strip/scripts/module-strip.mjs --audit <模块>`——
   退出 0 表示该模块的文件都不在，退出 1 表示模块还在。退出 0 时先分清是「裁掉了」还是「改名改造了」：
   看 PROJECT.md「与框架的差异」和 `git log --diff-filter=R --summary`，模块的页面 / lib / 集合改了名继续在用 → 写进 `transformedModules`
   （值写改名对照）；确实删掉了 → 写进 `strippedModules`
5. 提交 `.framework-sync.json`：`chore(framework-sync): 建立框架同步记录`

## 常见错误

| 错误 | 后果 | 正确做法 |
|------|------|---------|
| 本地跑 `git fetch` / `git pull` 拉框架 | 远程地址弹凭据窗卡死；hook 也会拦截 | 远程用 Sigil `workspace_fetch`；本机路径直接 `git -C` 读 |
| 直接 `git merge upstream/master` | 示例数据、框架站名把项目内容覆盖 | 逐个分类后按补丁应用 |
| 原样 `git cherry-pick` 框架提交 | 框架的 `feat/fix` 提交混进项目历史，被当成业务进度 | 应用到工作区后合成一个 `chore(framework-sync)` 提交 |
| 合并了示例数据提交 | 项目真实数据被示例覆盖 | 示例类默认跳过 |
| 忘了 `strippedModules` | 已删除的文章 / 作品模块被合回来 | 分类时对照裁剪清单；同步后跑 `--audit` |
| 改造过的模块没登记 `transformedModules` | 上游对 works 的修复把旧文件带回来；或被当成已裁模块整批跳过，改造后的文件永远拿不到修复 | 登记后按「1b」逐条移植 |
| 拿 `module-strip <模块> --preview` 检查已裁模块 | 已裁模块会显示「已裁剪，跳过」，看不出文件有没有被带回 | 用 `--audit` |
| 手工合并 `pnpm-lock.yaml` | 锁文件损坏、安装结果不可复现 | 重新 `pnpm install` 生成 |
| 同步后不跑验证门 | 构建或 SEO 回归带到线上 | `pnpm verify` 全绿再提交 |

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `project-init` | 孵化时生成 `.framework-sync.json`；用户要求「把某模块改成 xx」时登记 `transformedModules` |
| `module-strip` | 写入 `strippedModules`，提供各模块的路径清单与 `--audit`；对 `transformedModules` 里的模块一律跳过 |
| `git-workflow` | 提交规范与 Sigil 推送 |
| `exp-sediment` | 同步前先 `/exp`，把项目里值得反哺框架的经验记进 `feedback-to-framework.md` |
| `delivery-sync` | 项目 → 交付副本，方向不同 |
