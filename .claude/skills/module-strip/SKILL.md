---
name: module-strip
description: 按预设裁掉示例模块（文章 / 作品 / 使用指南 / 迁移型文档 docs / 首页 FAQ / 示例数据），guides 与 docs 共用的侧栏树与搜索两者都裁才删，同步改掉首页、导航、集合定义、llms.txt 里的引用；--audit 检查已裁模块是否被同步带回。触发词：裁剪、模块裁剪、删除示例、去掉示例页、清空示例、精简框架、strip、不要文章模块、不要作品模块
---

# 模块裁剪（module-strip）

## 何时使用

- 新站点不需要文章模块 / 作品模块 / 首页 FAQ
- 孵化后清空框架自带的示例数据、示例文章、示例封面
- 给某个客户的交付副本裁掉部分功能
- 框架同步之后，检查已裁掉的模块有没有被带回来（`--audit`）
- 查看有哪些可裁剪的模块、裁剪会改哪些文件；为新的业务模块编写裁剪预设

## 概述

框架是一个完整的示例站。新项目往往只需要其中一部分，比如纯视频目录站不要文章、纯博客不要作品目录。
**删目录不够**：首页的「最新文章」区块、导航的「文章」入口、`content.config.ts` 的集合定义、`llms.txt` 的文章段都还引用着它们，直接删会构建失败。
本技能按预设把「删文件 + 改引用」作为一个整体完成。

```
module-strip.mjs <模块...>
  ├─ 参数检查：未知参数一律报错退出（拼错的 --preveiw 不会被当成「没传」而真的去删文件）
  ├─ 安全检查：是 Astro 项目？是框架模板本身？（模板只允许 --preview / --audit）git 工作区干净？
  ├─ 已裁剪的模块（.framework-sync.json 的 strippedModules）→ 输出「已裁剪，跳过」
  ├─ 已改造的模块（transformedModules，如 works → videos）→ 输出「已改造，跳过」
  ├─ 每个模块：在内存里执行全部文本改动 → 任一必需锚点找不到 → 整个模块跳过（绝不半截裁剪）
  ├─ 写盘：删目录 / 删文件 → 写回改动过的文件（多余空行收拢）
  ├─ 记录：.framework-sync.json 的 strippedModules（framework-sync 据此跳过这些路径）
  └─ --verify：pnpm verify（build + check:seo + test）
```

## 可用预设

| 模块 | 删除 | 同步修改 |
|------|------|---------|
| `posts` 文章 | `src/content/posts/`、`src/pages/posts/`、`src/lib/posts.ts` | `content.config.ts` 去掉 posts 集合；首页去掉「最新文章」区块、文章统计、「阅读文章」按钮；`llms.txt.ts` 去掉文章段；导航去掉「文章」 |
| `works` 作品目录 | `src/pages/works/`、`src/components/works/`、`WorksExplorer.tsx`、`src/lib/works.ts`、`works.json`、`categories.json`、`public/examples/`、`tests/e2e/works.spec.ts`、`tests/unit/works-schema.test.ts`（通用的 `smoke.spec.ts` / `content-schema.test.ts` 保留） | `content.config.ts` 去掉 works / categories 集合；首页去掉精选与分类区块、作品/分类统计、「浏览全部作品」按钮；`llms.txt.ts` 去掉分类与作品段；导航去掉「作品」；404 页去掉「浏览作品」 |
| `guides` 使用指南 | `src/content/guides/`、`src/pages/guide/`、`src/components/docs/` 里指南专用的组件（GuideMeta / GuideSidebar / GuideToc / PrevNext / PhonePreview / Steps / Callout 等 13 个）、`src/layouts/GuideLayout.astro`、`src/lib/guides.ts`、`src/lib/guide-sections.ts`、`guide-sidebar.json`、`tests/unit/guides.test.ts`、`tests/e2e/guides.spec.ts` | `content.config.ts` 去掉 guides 集合（文件里再没有 `glob(` 时一并去掉 glob 导入）；`astro.config.ts` 去掉 MDX 集成与只为它设的 onwarn；`llms.txt.ts` 去掉指南段；导航去掉「指南」。侧栏树与站内搜索归共享部分（见下）。依赖 `@astrojs/mdx` 不自动卸载，报告末尾提示 |
| `docs` 迁移型文档 | `src/content/docs/`、`[...slug].astro`、`sitemap.xml.ts`、`DocsLayout` / `LandingLayout`、docs 组件（ContactDialog / DocsPhonePreview / DocsToc / ImageViewer）、`lib/docs*.ts`、lastmod / sitemap-rank / preview、四个 Markdown 插件、`docs-theme` / `docs-content` / `landing` / `brand.css`、`docs.json` 等 7 份数据、build-llms / indexnow / check-anchors / build-icons / `scripts/lib/site-meta.mjs` / `scripts/migrate/`、对应测试 | `content.config.ts` 去掉 docs 集合；`astro.config.ts` 去掉三处「// docs 模块」接线（插件两处、`withDocsSitemap` 换回核心站点地图配置）；`package.json` 去掉 icons / llms / indexnow / check:anchors。`@iconify` 三个依赖不自动卸载；`frameWidth: 'wide'` 要手动改回，报告末尾提示 |
| `faq` 首页常见问题 | `src/data/faq.json` | 首页去掉 FAQ 区块与 FAQPage 结构化数据（`lib/seo.ts` 的 `faqJsonLd` 保留） |
| `examples` 示例数据与封面 | `public/examples/`、两篇示例文章 | `works.json`、`categories.json` 清空为 `[]`（**内容已不是框架示例时不覆盖**）；模块本身保留。`src/data/faq.json` 与 `scripts/sync/sources/example.mjs` **不处理**，报告末尾会提示人工替换 |

- 预设可以组合、任意顺序：`posts faq works` 与 `works faq posts` 结果一致

### 共享部分（几个模块共用的文件）

guides 与 docs 都要用侧栏树（`SidebarTree.astro` + `lib/sidebar.ts` + 其测试）和站内搜索（`SearchButton` / `SearchDialog`、页头搜索入口、build 里的 pagefind）。
这组写在 `presets/_shared-doc-infra.json`（`modules: ["guides", "docs"]`），**成员全部不在了才删**：

| 情况 | 共享部分 |
|---|---|
| 只裁 guides（docs 还在） | 保留，报告里出「🔗 共享部分保留：docs 还在用」 |
| 只裁 docs（guides 还在） | 保留 |
| guides docs 一起裁，或其中一个早已裁过 / 项目里本来就没有 | 一起删，报告里单独一节「✂️ 共享：文档基础设施」 |

「不在」= 记在 `strippedModules`、本次一起裁、或项目里本来就没有（预设的 `marker` 文件不存在）；`transformedModules` 里的模块算「在」。
共享部分不写进 `strippedModules`（它不是模块）；`--audit` 在成员都已裁时也检查它的文件有没有被带回。
新增几个模块共用的东西时，照 `_shared-doc-infra.json` 写一份 `_shared-<名字>.json`，并给成员预设都加上 `marker`。
- 全部裁掉时，首页只剩 Hero；报告末尾的「需人工确认」会列出要按新站点重写的地方

```
.claude/skills/module-strip/
├── SKILL.md
├── scripts/module-strip.mjs
└── presets/
    ├── posts.json  works.json  guides.json  docs.json  faq.json  examples.json
    ├── _shared-doc-infra.json  # guides 与 docs 共用的侧栏树、站内搜索（成员都裁掉才删）
    └── _template.json          # 新预设模板（_ 开头的不会出现在可用列表里）
```

## 命令

```bash
S=.claude/skills/module-strip/scripts/module-strip.mjs

node $S --list                              # 列出可用预设
node $S posts faq --preview                 # 预览：删哪些、改哪些，不写盘
node $S posts faq --verify                  # 执行并跑 pnpm verify
node $S works --target ../my-site-delivery  # 裁交付副本（见场景 3）
node $S --audit                             # 只读：已裁模块的文件有没有被框架同步带回来
```

| 参数 | 说明 |
|------|------|
| `--preview`（或 `--dry-run`） | 只预检、只报告；任何目录都可以预览，包括框架模板 |
| `--verify` | 裁剪后在目标目录跑 `pnpm verify`（目标目录必须已装依赖） |
| `--target <目录>` | 目标项目根目录，默认当前目录。🔴 **交付目录也用它**：`--target <.delivery-sync.json 里的 deliveryDir>`；脚本**没有** `--delivery` 参数（传了会报错退出） |
| `--audit [模块...]` | 只读检查：读目标的 `.framework-sync.json` 的 `strippedModules`（或命令行给的模块），看预设 `delete_dirs` / `delete_files` 列的路径是否又出现、清空过的示例数据是否又带回示例标记；不改任何文件，框架模板里也能跑。`transformedModules` 里的模块即使点名也不检查 |
| `--force` | 跳过「工作区不干净」「既不是 git 仓库也不是交付目录」的拦截 |
| `--allow-template` | 允许在框架模板本身执行（几乎不需要：模板要保留全部示例） |

退出码：`0` 成功（含「全部模块已裁剪 / 已改造，跳过」、`--audit` 没发现问题）/ `1` `--audit` 发现被带回的文件 / `2` 安全拦截、参数错误、或有模块预检失败被跳过 / `3` 环境异常（不是 Astro 项目、预设不存在）/ `4` `--verify` 未通过。

### 已裁剪的模块

`strippedModules` 里已有的模块，`--preview` 和真实执行都会输出「⏭️ 已裁剪，跳过」并按 0 退出——裁剪后锚点本来就不在了，
再预检只会报一串「找不到行」，没有信息量。要确认它们没被框架同步带回来，用 `--audit`。

### 已改造的模块（改造 ≠ 裁剪）

用户说「把 works 改成视频 / 课程 / 产品」时，模块不是不要了，而是改名改写成了别的东西。🔴 **不要跑 `module-strip works`**（它会删掉正要改造的代码），
在开发阶段改名改写，完成后**手工**登记进 `.framework-sync.json`（脚本不会自动写）：

```json
"transformedModules": { "works": "改造为 videos：src/lib/works.ts → videos.ts、WorkCard → VideoCard、/works/ → /videos/" }
```

- 登记后 `--preview` / 真实执行输出「🔁 已改造，跳过」并按 0 退出；`--audit` 不检查它（预设的删除清单对改造后的文件不再成立，会把改写后的测试误报成「被带回」）；`check:skills` 也跳过它的预演
- 同一模块不能既在 `strippedModules` 又在 `transformedModules`；上游对改造模块的改动由 `framework-sync` 逐条判断、按改名对照移植
- PROJECT.md「与框架的差异」同步记一笔，「参考代码位置（覆盖 CLAUDE.md）」表里该模块的行改成改造后的文件（见下方「裁剪 / 改造后：写 PROJECT.md 的参考表覆盖」）

## 使用场景

### 场景 1：孵化时裁剪（project-init 阶段二）

孵化流程在「改站点配置、改 package.json name」之后、「git init」之前调用本技能：此时新目录**还不是 git 仓库**，需要加 `--force`（全新导出的目录，没有需要保护的改动）：

```bash
node .claude/skills/module-strip/scripts/module-strip.mjs examples --target "<新项目目录>" --preview
node .claude/skills/module-strip/scripts/module-strip.mjs examples --target "<新项目目录>" --force
```

- package.json 的 name 还是 `next-ai-astro` 且没有 `.framework-sync.json` 时，脚本把目标当成框架模板拒绝执行（`--force` 绕不过，要先改 name）
- 此时 `.framework-sync.json` 还没生成，脚本不会自动记录；project-init 生成该文件时把裁掉的模块写进 `strippedModules`
- 依赖尚未安装时不加 `--verify`，由 project-init 装完依赖后统一跑验证门

### 场景 2：开发中途裁剪（已是 git 仓库）

```bash
git status                                  # 先确认干净，或先提交
node $S posts --preview                     # 给用户看改动清单
node $S posts --verify                      # 用户确认后执行
git add <报告里列出的修改文件>                # 逐个 add
git rm -r <报告里列出的删除项>                # 删除项用 git rm 登记
git commit -m "refactor(strip): 移除文章模块"
```

提交类型固定用 `refactor(strip): …`（按 CLAUDE.md「协作约定」不计入业务进度）。
出问题要整体回退：裁剪前工作区是干净的，按报告列出的文件逐个恢复即可（遵守多会话避让协议，不用 `git reset --hard`）。

### 裁剪 / 改造后：写 PROJECT.md 的参考表覆盖

CLAUDE.md「参考代码位置」、AGENTS.md 与 `.claude/agents/code-reviewer.md` 的参考表都写死了 works / posts 的文件。裁掉或改造这两个模块后：

1. **不改这几张原表**：它们来自框架、框架同步时会被覆盖，表头已注明「孵化项目以 PROJECT.md 的同名表为准」
2. 在 `.claude/PROJECT.md` 写（或更新）`## 参考代码位置（覆盖 CLAUDE.md）`表：裁掉模块的行删掉，改造模块的行换成改造后的文件，其余行照抄，让这张表自身完整（模板见 `project-init` Step 2.4）
3. `pnpm check:skills`：原表里属于已裁剪 / 已改造模块的路径只警告并点名模块；覆盖表里的路径不存在直接报错
4. 不属于任何预设、按提示手工删掉的文件（如 works 预设提示里的 `scripts/sync/sources/example.mjs`），原表里的引用会报「不存在」：
   在覆盖表里给它一行，**原路径写纯文本、不加反引号**（加了反引号会被当成「覆盖表里必须存在的路径」直接报错），
   如 ``| 数据同步源 | scripts/sync/sources/example.mjs（已删）→ `scripts/sync/sources/<实际的源>.mjs` |``；check:skills 认出后降为警告

### 场景 3：交付副本按客户裁剪

`delivery-sync` 的预设里配 `stripModules`，同步完成后脚本会打印要执行的命令：

```bash
cd "<交付目录>" && pnpm install          # 交付目录第一次裁剪前装一次依赖（node_modules 之后同步也会保留）
node .claude/skills/module-strip/scripts/module-strip.mjs posts --target "<交付目录>" --verify
```

- 交付目录路径取 `.delivery-sync.json` 的 `deliveryDir`（相对项目根）；交付目录有 `.delivery-sync-marker`，不要求 git
- 🔴 **每次重新同步都会恢复被裁的文件，要重新裁剪**（交付目录是项目的镜像）

### 场景 4：框架同步之后

```bash
node $S --audit        # 0 = 没有被带回；1 = 列出被带回的文件
```

有输出时：确认是同步误带回的 → `git rm` 这些文件；是有意恢复模块 → 从 `.framework-sync.json` 的 `strippedModules` 里去掉它。

## 用户决策点（执行前必须确认）

- [ ] 这个模块确实不需要（裁完只能靠 git 恢复）；用户要的是「改成别的东西」→ 不裁，走上面的「已改造的模块」
- [ ] 已用 `--preview` 看过改动清单，并展示给用户
- [ ] 报告末尾的「需人工确认」事项已知晓（首页布局、PROJECT.md 参考表覆盖、E2E 用例等脚本不处理）

## 预检失败怎么办

报告里出现 `⛔ <模块> 已跳过——锚点预检失败`，说明项目已经改过相关文件（比如重写了首页），预设里的锚点对不上。此时：

1. 看列出的是哪几条锚点失败、在哪个文件
2. 已经不存在的内容（比如首页的「最新文章」区块早被删了）→ 这部分本来就不用裁，手动完成剩余部分
3. 按预设的 `delete_dirs` / `delete_files` 与 `edits` 清单**手动裁剪**，完成后 `pnpm verify`，并手工把模块名加进 `.framework-sync.json` 的 `strippedModules`

脚本宁可整个模块跳过，也不会只改一半留下编译不过的项目。

## 编写新预设

项目新增了业务模块（如 `videos`），希望以后能给某些客户裁掉：

1. 复制 `presets/_template.json` 为 `presets/videos.json`
2. 列出该模块的全部目录与文件（`delete_dirs` / `delete_files`）
3. 找出其他文件里所有引用点（`grep -rn "videos\|lib/videos" src tests scripts`），每处写一条 `edits`：

| op | 用途 |
|----|------|
| `remove_lines` | 删除含某字面量的整行（import、导航项、单行语句） |
| `remove_list_item` | 从一行里的逗号列表删一项（`const [a, b] = …`、`{ a, b }`、`Promise.all([f(), g()])`） |
| `remove_block` | 删一整段（从含 `start` 的行到其后第一个含 `end` 的行，两者可在同一行）；`wrap_before` / `wrap_after` 逐行核对外层包裹行（如 JSX 的 `{` … `)` `}`），`blank_before` / `blank_after` 只在相邻行真是空行时顺带删 |
| `replace` / `replace_regex` | 字面量替换（必须恰好出现 1 次）/ 正则替换 |
| `write_json` | 整个 JSON 文件替换，可加 `only_if_contains` 守卫防止覆盖真实数据（`--audit` 也用这个标记判断示例数据是否被带回） |
| `first_of` | `{ options: [改动, …] }` 依次尝试候选写法，第一个命中的生效。同一段代码有多种排版时用它（见下） |

4. 可能已被别的模块处理掉的改动标 `optional: true`（例如「所有集合都裁掉后收拢空数组」这类收尾规则）
5. 验证：`--preview` 全部命中 → 在临时副本上真实执行 `--verify` → 再和其他预设组合、换顺序各跑一次

### 🔴 锚点要扛得住格式化

Prettier 会改换行：`<Button …>文字</Button>` 可能被拆成三行，`{` 与 `xxx.length > 0 && (` 可能并成一行、结尾 `)` `}` 并成 `)}`。

- 多行结构（JSX 元素、跨行函数调用）用 `remove_block`：`start` 写开标签 / 调用开头，`end` 写闭标签 / `);`——一行写完时两者在同一行也成立；**不要**用只删首行的 `remove_lines`
- 条件渲染块用 `first_of` 同时列出两种排版（参考 `presets/posts.json` 的「最新文章」区块）
- 预设写完在格式化前后各跑一次 `--preview`

### 🔴 框架改了被引用的文件后

预设按**文件内容锚点**工作。框架改动了 `src/pages/index.astro`、`src/pages/llms.txt.ts`、`src/content.config.ts`、`src/site.config.ts`、`src/pages/404.astro` 等被预设引用的文件（包括跑了一次 Prettier）后，必须：

```bash
node .claude/skills/module-strip/scripts/module-strip.mjs posts faq works examples --preview
```

有 `⛔` 就同步更新对应预设，再在临时副本上做一次真实裁剪 + `--verify`。`pnpm check:skills` 也会逐个预演各预设。

## 不做的事

- 不裁框架核心（SEO 组件、布局、UI 组件、lib 工具）：它们是所有站点的基础
- 不删依赖：没有 island 后 `@astrojs/react` 等依赖可以保留（不会加载到页面），是否移除由人决定
- 不改 CLAUDE.md / AGENTS.md（参考表失效由 PROJECT.md 的覆盖表处理）、不改测试以外的文档
- 不在框架模板上执行（除非 `--allow-template`）
- `--audit` 只看删除清单与示例数据标记，不检查文本改动（首页区块、导航项）是否被同步加回；那部分靠 framework-sync 分类时对照 `strippedModules` 人工把关

## 与其他技能的关系

| 关系 | 技能 | 说明 |
|------|------|------|
| 调用方 | `project-init` | 孵化时清空示例 / 去掉不需要的模块 |
| 调用方 | `delivery-sync` | 预设的 `stripModules`，同步后用 `--target <交付目录>` 裁剪 |
| 下游 | `framework-sync` | 读 `strippedModules` 跳过这些路径、`transformedModules` 逐条移植；同步后跑 `--audit` |
| 入口 | `/strip-modules` | 斜杠命令调用本脚本 |
