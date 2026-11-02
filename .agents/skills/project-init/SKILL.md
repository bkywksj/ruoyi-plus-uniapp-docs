---
name: project-init
description: 从 next-ai-astro 框架孵化新内容站：问清目录与站点信息，git archive 导出，改站点配置与项目标识，写 PROJECT.md 和同步记录，首次提交，经 Sigil 建私有仓。触发词：新项目、创建项目、初始化项目、开新项目、孵化、基于框架创建、new project、新建站点、新建项目
---

# 新项目孵化（project-init）

## 何时使用

- 用户说"我要做一个新站点 / 新项目"，或 `/kickoff` 走到「创建新项目」阶段
- 需要把 `/kickoff` 产出的需求文档、原型、头脑风暴与选型记录带进新项目
- 需要决定新项目保留还是清空框架示例数据
- 需要为新项目建私有仓库并推送首个提交

其他常见说法：init project、孵化一个站。

## 概述

**核心理念**：框架目录 = 只读模板 → 导出到新目录 → 只在新目录里改配置。框架本身永远保持可运行的示例站状态，可以反复孵化。

next-ai-astro 的孵化比后端框架简单得多：**站点级常量全部集中在 `src/site.config.ts`**，不需要全局替换标识符，也没有数据库。
真正要花心思的是「问清楚」——目录、站名、域名、定位句、品牌色，这些决定了之后每一页的 SEO 字段。

```
阶段零：交互收集（全部问完、确认后才动手）
├── 0.1 🔴 确认当前在框架模板里（在孵化项目里直接拒绝）、检查未提交改动
├── 0.2 🔴 问：新项目写到哪个目录（= 项目标识）
├── 0.3 问：站点信息（站名 / 定位句 / 域名 / 品牌色 / 作者 / 导航 / 图片域名）
├── 0.4 问：保留还是清空示例数据
├── 0.5 问：Git 仓库方式（Sigil 建私有仓 / 已有地址 / 稍后）
└── 0.6 确认汇总
阶段一：导出框架到新目录（git archive）+ 带入 /kickoff 产出（需求、原型、头脑风暴、选型记录）
阶段二：改站点配置 + package.json + docker-compose.yml + 写 PROJECT.md +（可选）清空示例 + 装依赖 + 验证门
阶段三：.framework-sync.json + git init + 首次提交 + 建仓推送（Sigil）
阶段四：启动引导 + 起飞指令
```

### 🔴 Bash 调用约定（本技能所有命令块都要遵守）

Bash 工具**每次调用都不保留变量和 cwd**。所以：

- 每个命令块开头都**重新赋值**路径变量（写真实的绝对路径，不是占位符），紧跟一行空值守卫：

  ```bash
  TEMPLATE_DIR="E:/my/AI框架/next-ai-astro"; NEW_DIR="E:/my/bili-video-site"
  [ -n "$TEMPLATE_DIR" ] && [ -n "$NEW_DIR" ] && [ "$TEMPLATE_DIR" != "$NEW_DIR" ] || { echo "路径变量为空或相同，停止"; exit 1; }
  ```

- 原因：`cd ""` 在 Bash 里**不报错、原地不动**。变量一旦为空，`cd "$NEW_DIR" && git init && git commit …` 就会在**框架仓库**里执行，把框架目录里的未提交文件当成「init」提交进模板。
- 下文命令块里的两行赋值都要按 Step 0.2 / 0.6 确认的真实路径替换；进入目录的命令一律写成 `cd "<绝对路径>" && …`，不用 `/tmp`。

---

## 阶段零：交互收集

### Step 0.1：确认当前位置是框架模板

先在**当前会话所在的项目根**判断「我在哪」（这一步不 cd，查的就是用户正在用的这个仓库）：

```bash
pwd -W 2>/dev/null || pwd; ls .framework-sync.json 2>/dev/null; grep -m1 '"name"' package.json; git status -s; git log --oneline -1
```

确认是框架模板后，把第一行输出记为 `TEMPLATE_DIR`（Git Bash 的 `pwd -W` 给出 `E:/my/AI框架/next-ai-astro` 这种 Windows 形式，写进 `.framework-sync.json` 也能直接用），后面每个命令块都用这个真实路径赋值。

| 现象 | 判断 | 处理 |
|------|------|------|
| 有 `.framework-sync.json` | 当前目录是**孵化出来的项目**，不是框架 | 🔴 **直接拒绝**：「这里已经是孵化项目，不能再从它孵化。请到框架目录（如 `E:/my/AI框架/next-ai-astro`）执行；要同步框架更新请用 `/framework-sync`」 |
| `package.json` 的 name 不是 `next-ai-astro` 且没有 `.framework-sync.json` | 不是本框架 | 停下，问用户框架模板在哪 |
| `git status -s` 有未提交改动（`/kickoff` 产出除外，见下行） | `git archive` 只导出**已提交**内容，改动不会带过去 | 告知用户：先提交框架改动，或确认不需要带过去 |
| 有 `docs/需求文档.md`、`docs/prototypes/*`、`docs/brainstorm-*.md`、`docs/decisions/` | 是 `/kickoff` 前两段的产出（在框架里只落盘、不提交） | 阶段一单独复制到新项目 |
| 框架有远程仓库（`git remote get-url origin` 有输出） | 本地模板可能落后于远端，孵化出去的就是旧版本 | **只检查不拉取**：用 Sigil `git_commits_list(credential_name=<按域名选>, repo=<owner/repo>, sha=<分支>, per_page=1)` 取远端最新提交，与本地 `git rev-parse HEAD` 对比；不一致就告诉用户「模板落后远端」，由用户决定先同步（经 Sigil `workspace_pull`）还是照当前版本孵化。不要跑本地 `git fetch` / `git pull`（hook 会拦） |

### Step 0.2：🔴 问目标目录（必问，不许猜）

```
新项目要放在哪个目录？
  例：E:/my/bili-video-site
  - 目录必须不存在，或是空目录
  - 目录名用英文小写 + 短横线：它同时作为项目标识，用在 package.json 的 name、docker-compose 的 image / container_name
```

检查：

```bash
NEW_DIR="E:/my/bili-video-site"
[ -n "$NEW_DIR" ] || { echo "NEW_DIR 为空，停止"; exit 1; }
if [ -e "$NEW_DIR" ] && [ -n "$(ls -A "$NEW_DIR" 2>/dev/null)" ]; then echo "非空目录，不能用"; else echo "可用"; fi
basename "$NEW_DIR" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*$' && echo "标识合法" || echo "标识需改成小写字母、数字、短横线"
```

非空目录 → 让用户换一个，**不要**清空已有目录。

### Step 0.3：问站点信息

一次问完，每项给出默认值或示例，用户只需改需要改的。字段与 `src/site.config.ts` 一一对应：

| 字段 | 问法 / 规则 | 默认 |
|------|------------|------|
| `name` | 站点全名（`<title>` 后缀、og:site_name） | 无，必填 |
| `shortName` | 页头短名，4~8 个字 | 取 name 前几个字 |
| `tagline` | 🔴 一句「X 是 Y」的定义句（首页 H1 下方，GEO 直接摘取） | 无，必填，帮用户起草后让其确认 |
| `description` | 默认 meta description，70~160 字 | 由 tagline 扩写，让用户确认 |
| `url` | 生产域名，不带结尾斜杠 | 未定可暂留 `https://example.com`，`pnpm check:seo` 会持续警告直到改掉 |
| `locale` | 语言 | `zh-CN` |
| `brandColor` | 品牌主色 hex | `#FF5D2E` |
| `author.name` / `author.url` | 作者或机构（JSON-LD 的 author / publisher） | 必填 |
| `nav` | 导航栏目，如「首页 / 视频 / 文章 / 关于」 | 首页 / 作品 / 文章 / 关于 |
| `social` | 外链（B 站空间、GitHub 等） | 空 |
| `imageDomains` | 数据里封面是外链时的图片域名，如 B 站 `i0.hdslb.com` `i1.hdslb.com` `i2.hdslb.com` | 空 |
| `analytics` | 统计：none / umami / baidu | none |
| `icp` | 备案号（国内服务器需要） | 空 |

🔴 **反捏造**：站名、定位、作者、社交链接只用用户给的事实。用户没说的一律留占位并标「待确认」，不要替用户编一句 slogan 当事实。

> 品牌色注意：框架用 `color-mix()` 从 `brandColor` 派生 `brand-strong`（主按钮底色）和 `brand-ink`（文字色），保证对比度。
> 用户给的颜色很浅（如 `#FFD54F`）时提醒：主按钮会偏暗，必要时由 `design-system` 技能调整派生比例。

### Step 0.4：示例数据保留还是清空

```
框架自带一套示例数据（6 条作品、3 个分类、2 篇文章、3 条 FAQ、示例封面）：
  [1] 保留（推荐）：先把站跑通，接入真实数据源后自然覆盖
  [2] 清空：孵化后立刻执行 module-strip 技能的 examples 预设
```

示例相关文件：`src/data/works.json`、`src/data/categories.json`、`src/data/faq.json`、`src/content/posts/*.md`、
`public/examples/`、`scripts/sync/sources/example.mjs`。清空的具体操作与校验交给 `module-strip`，本技能不重复实现。

### Step 0.5：Git 仓库

> 🔴 **所有新建仓库一律私有**。用户明确要求公开时，先说明风险并二次确认。

```
Git 仓库怎么处理？（新仓库一律私有）
  [1] 我用 Sigil 帮你建私有仓（Gitee / GitCode / GitHub 任选）
  [2] 你已经建好了，提供仓库地址
  [3] 先只在本地提交，稍后再说
```

- 选 [1]：先 `mcp__sigil__list_credentials` 查可用凭据名（gitee / gitcode / githubN，以实际返回为准），问用户用哪个平台。
- 建仓在阶段三执行，这里只收集信息。

### Step 0.6：确认汇总

```
━━━━━━━━━━ 新项目孵化确认 ━━━━━━━━━━
  新目录：E:/my/bili-video-site
  项目标识：bili-video-site（package.json name / docker image / container_name）
  站点：<用户给的站名>（短名：<短名>）
  定位句：……
  域名：https://example.com  ⚠️ 待定，上线前必须改
  品牌色：#FF5D2E
  导航：首页 / 视频 / 文章 / 关于
  图片域名：i0.hdslb.com, i1.hdslb.com, i2.hdslb.com
  示例数据：保留
  /kickoff 产出：需求文档 ✓  原型（3 个文件）✓  头脑风暴 1 份 ✓  选型记录 无
  仓库：Sigil 建私有仓（gitee）  可见性：🔒 Private
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
确认后开始？(Y/n)
```

**用户确认前不做任何写入。**

---

## 阶段一：导出框架到新目录

### Step 1.1：git archive 导出

`git archive` 只导出**已跟踪文件**，所以 `.git/`、`node_modules/`、`dist/`、`.astro/`、`.cache/`、`.env`、`.claude/exp.config.json`（本机缓存，已在 .gitignore）都不会带过去，
模板仓库不受任何影响，也不用切分支。

```bash
TEMPLATE_DIR="E:/my/AI框架/next-ai-astro"; NEW_DIR="E:/my/bili-video-site"
[ -n "$TEMPLATE_DIR" ] && [ -n "$NEW_DIR" ] && [ "$TEMPLATE_DIR" != "$NEW_DIR" ] || { echo "路径变量为空或相同，停止"; exit 1; }
mkdir -p "$NEW_DIR" && cd "$TEMPLATE_DIR" && git archive HEAD | tar -x -C "$NEW_DIR" && ls "$NEW_DIR"
# 旧版框架曾把 exp-sediment 缓存提交进仓库：导出里若有就删掉，孵化项目不需要它（身份按 .framework-sync.json 判定）
rm -f "$NEW_DIR/.claude/exp.config.json"
```

> 若 `tar` 报路径错误，改走 zip：`git archive -o "$TEMP/nai-export.zip" HEAD`（在框架目录执行），
> 再用 PowerShell `Expand-Archive -Path "$env:TEMP\nai-export.zip" -DestinationPath "E:\my\bili-video-site"`。

### Step 1.2：带入 /kickoff 产出

这些产出在框架里只落盘、不提交，`git archive` 不会带走，单独复制：

| 产出 | 来源技能 | 新项目里的用途 |
|------|---------|--------------|
| `docs/需求文档.md` | `/kickoff` 阶段一 | `/dev-loop`、`writing-plans` 的需求真相源 |
| `docs/prototypes/**` | 工作站 ui-studio | `html-to-code` 转码与截图比对目标 |
| `docs/brainstorm-*.md` | `brainstorm` | `writing-plans` 读取已定方案 |
| `docs/decisions/*.md` | `tech-decision` | 选型依据 |

```bash
TEMPLATE_DIR="E:/my/AI框架/next-ai-astro"; NEW_DIR="E:/my/bili-video-site"
[ -n "$TEMPLATE_DIR" ] && [ -n "$NEW_DIR" ] && [ "$TEMPLATE_DIR" != "$NEW_DIR" ] || { echo "路径变量为空或相同，停止"; exit 1; }
cd "$TEMPLATE_DIR" && mkdir -p "$NEW_DIR/docs"
[ -f "docs/需求文档.md" ] && cp "docs/需求文档.md" "$NEW_DIR/docs/"
[ -d "docs/prototypes" ] && cp -r docs/prototypes "$NEW_DIR/docs/"
ls docs/brainstorm-*.md > /dev/null 2>&1 && cp docs/brainstorm-*.md "$NEW_DIR/docs/"
[ -d "docs/decisions" ] && cp -r docs/decisions "$NEW_DIR/docs/"
ls -R "$NEW_DIR/docs" | head -40
```

复制完成后问用户：「框架目录里的这些 `/kickoff` 产出要不要移除？（默认移除，保持框架干净；它们没提交过，删除不影响框架 git 历史）」
用户同意才删，**只删上表这几项**，在框架目录内用相对路径执行，并保留 `docs/prototypes/.gitkeep`（框架提交过的占位文件，删掉会在框架仓库留下一条未提交的删除）：

```bash
TEMPLATE_DIR="E:/my/AI框架/next-ai-astro"
[ -n "$TEMPLATE_DIR" ] || { echo "TEMPLATE_DIR 为空，停止"; exit 1; }
cd "$TEMPLATE_DIR" && [ -f package.json ] && grep -q '"name": "next-ai-astro"' package.json || { echo "当前不在框架目录，停止"; exit 1; }
rm -f "docs/需求文档.md" docs/brainstorm-*.md
rm -rf docs/decisions
find docs/prototypes -mindepth 1 ! -name .gitkeep -delete
git status -s docs
```

---

## 阶段二：改配置

所有修改用 **Edit 工具**（不要用 sed 批量替换中文和引号）。

### Step 2.1：`src/site.config.ts`

按 Step 0.3 收集的值逐项替换。示例（只列改动字段，值全部来自用户确认）：

```ts
export const site = {
  name: '<站点全名>',
  shortName: '<短名>',
  tagline: '<站点全名>是……（用户确认过的定义句）',
  description: '……',
  url: 'https://video.example.com',
  locale: 'zh-CN',
  brandColor: '#FF5D2E',
  author: { name: '<作者>', url: '<作者主页>' },
  imageDomains: ['i0.hdslb.com', 'i1.hdslb.com', 'i2.hdslb.com'] as string[],
  nav: [
    { label: '首页', href: '/' },
    { label: '视频', href: '/works/' },
    { label: '文章', href: '/posts/' },
    { label: '关于', href: '/about/' },
  ] as NavItem[],
  // ……其余字段同理
};
```

注意：
- 🔴 **要裁掉模块（Step 2.5）的，`nav` 先别动，裁完再改**：裁剪预设以框架原样的导航行（如 `{ label: '作品', href: '/works/' },`）为锚点，
  先改了导航，预设预检就找不到行、整个模块被跳过（storyloom-docs 试点实录：works / posts 两个预设都因此跳过）。
  其余字段照常在这一步改
- `nav.href` 跟随 `urlFormat`：默认 directory 带结尾斜杠（`/about/`）；迁移旧站用 file 形态时写 `/about.html`（见 vitepress-migration 技能）
- 只改栏目**显示名**，不改路由目录；要把 `/works/` 改成 `/videos/` 属于路由调整，交给 `astro-routing` 技能在开发阶段处理
  （那类「把 works 改成 xx」的改造完成后，要登记进 `.framework-sync.json` 的 `transformedModules`，见 Step 3.1）
- `imageDomains` 只写主机名，不带协议

### Step 2.2：`package.json`

只改 `name`（= 项目标识）和 `description`，`version` 保持 `0.1.0`。其他字段不动。

### Step 2.3：`docker-compose.yml`

把镜像名和容器名改成项目标识，否则同一台服务器部署多个孵化站时会撞名、互相覆盖：

```yaml
    image: bili-video-site:latest      # 原为 next-ai-astro:latest
    container_name: bili-video-site    # 原为 next-ai-astro
```

同机已有其他站占用 8080 时，顺带问用户换一个宿主端口（只改 `'127.0.0.1:8080:80'` 左边的 8080，保留 `127.0.0.1` 回环绑定）。

### Step 2.4：写 `.claude/PROJECT.md`（项目事实与专属规则）

框架的 `CLAUDE.md` 讲「怎么写代码」，`PROJECT.md` 讲「这个项目是什么、有哪些专属禁令」。会话开始时与经验摘要一并读取，优先级高于 CLAUDE.md 的通用规则；`/dev-loop` 每轮也把它当真相源：

```markdown
# PROJECT.md - <站点名>

## 项目事实（只写用户确认过的内容）
- 站点定位：<tagline>
- 目标读者：<用户描述，未提供写「待确认」>
- 生产域名：<url 或「待定」>
- 数据来源：<如：B 站空间 UID xxx 的全部投稿；未定写「待确认」>
- 品牌：主色 <brandColor>；Logo <有/无>
- 孵化来源：next-ai-astro @ <框架提交短 hash>（详见 .framework-sync.json）

## 专属禁令（优先级高于 CLAUDE.md）
- 播放量、粉丝数、案例、合作方等数字只来自真实数据源，页面上不写死
- 不确定的信息标「待确认」，不用"通常/参考同行"补全
- （开发中新增：例如「分类 id 与 B 站合集 id 一一对应，不许手改」）

## 与框架的差异
- 裁剪掉的模块：<无 / examples / posts …>
- 改造的模块：<无 / works → videos …>（登记在 `.framework-sync.json` 的 `transformedModules`，写清改名对照）
- （开发过程中记录：新增的集合、改过的路由、新增的依赖、改过的框架核心文件及原因）

## 参考代码位置（覆盖 CLAUDE.md）
<!-- 裁剪或改造了模块就必须写（没动过模块时删掉整节）：CLAUDE.md / AGENTS.md / code-reviewer 的参考表来自框架、会被框架同步覆盖，不改它们，
     在这里写完整的替代表；表里的路径由 pnpm check:skills 校验必须存在。
     手工删掉的非模块文件（如 sync 示例源 example.mjs）：原路径写纯文本、不加反引号，check:skills 认出后对原表的引用只警告 -->
| 开发类型 | 参考文件 |
|---------|---------|
| 列表页 + 交互筛选 | `src/pages/<集合>/index.astro` + `src/components/islands/<集合>Explorer.tsx` |
| 详情页（动态路由） | `src/pages/<集合>/[id].astro` |
| 集合查询封装 | `src/lib/<集合>.ts` |
| （裁掉的模块对应的行删掉；其余行从 CLAUDE.md 原样抄过来，保证这张表自身完整） | |
```

不要为新项目生成 `.claude/exp.config.json`：`exp-sediment` 看到 `.framework-sync.json` 就会按子项目模式工作。

### Step 2.5：（可选）清空示例

Step 0.4 选了清空 → 激活 `module-strip` 技能，执行其 `examples` 预设（在**框架目录**里运行，`--target` 指向新目录）。
🔴 此时 `site.config.ts` 的 `nav` 必须还是框架原样（见 Step 2.1），裁完再改导航：

```bash
TEMPLATE_DIR="E:/my/AI框架/next-ai-astro"; NEW_DIR="E:/my/bili-video-site"
[ -n "$TEMPLATE_DIR" ] && [ -n "$NEW_DIR" ] && [ "$TEMPLATE_DIR" != "$NEW_DIR" ] || { echo "路径变量为空或相同，停止"; exit 1; }
cd "$TEMPLATE_DIR" && node .claude/skills/module-strip/scripts/module-strip.mjs examples --target "$NEW_DIR" --preview
```

```bash
TEMPLATE_DIR="E:/my/AI框架/next-ai-astro"; NEW_DIR="E:/my/bili-video-site"
[ -n "$TEMPLATE_DIR" ] && [ -n "$NEW_DIR" ] && [ "$TEMPLATE_DIR" != "$NEW_DIR" ] || { echo "路径变量为空或相同，停止"; exit 1; }
cd "$TEMPLATE_DIR" && node .claude/skills/module-strip/scripts/module-strip.mjs examples --target "$NEW_DIR" --force
```

- 先 `--preview` 看会改哪些文件，再真正执行
- 必须在 Step 2.2 改完 `package.json` 的 name 之后跑：脚本见到 name 仍为 `next-ai-astro` 且没有 `.framework-sync.json` 会当成模板本身拒绝执行
- 新目录此时还没 `git init`，脚本的「无法回退」保护会拦下，所以要 `--force`（新目录随时可以重新导出，风险可控）
- 用户在 Step 0.4 还要求裁掉整个模块（如不要文章 → `posts`）时，一并写在模块列表里：`examples posts`
- 记下实际裁掉的模块名，Step 3.1 写进 `.framework-sync.json` 的 `strippedModules`（此时该文件还不存在，脚本不会自动记录），并写进 PROJECT.md「与框架的差异」
- 🔴 裁掉了 posts / works（只清 `examples` 不算）：在 PROJECT.md 写「参考代码位置（覆盖 CLAUDE.md）」表，裁掉模块的行删掉、其余行照抄。
  不改 CLAUDE.md / AGENTS.md 的原表（它们来自框架，表头已注明「以 PROJECT.md 的同名表为准」）；之后把某模块改造成别的东西时（登记 `transformedModules` 的同一个提交里）同样更新这张表

### Step 2.6：装依赖 + 验证门

依赖安装较慢（首次约数分钟）：

```bash
NEW_DIR="E:/my/bili-video-site"
[ -n "$NEW_DIR" ] || { echo "NEW_DIR 为空，停止"; exit 1; }
cd "$NEW_DIR" && pnpm install --reporter=append-only
```

跑验证门之前先核对孵化残留。验证门查不出这些：站名、定位句还是框架文案时照样全绿，第二轮演练就这样漏掉了 PROJECT.md 和 `shortName: '示例站'`：

```bash
NEW_DIR="E:/my/bili-video-site"
[ -n "$NEW_DIR" ] || { echo "NEW_DIR 为空，停止"; exit 1; }
cd "$NEW_DIR" && { test -f .claude/PROJECT.md && echo "✅ PROJECT.md 已生成" || echo "❌ 缺 .claude/PROJECT.md（回 Step 2.4）"; }
cd "$NEW_DIR" && grep -nE "next-ai-astro|示例站|示例作者|AI 驱动的 Astro 内容站框架" src/site.config.ts package.json docker-compose.yml \
  && echo "❌ 以上仍是框架占位值（回 Step 2.1–2.3）" || echo "✅ 没有框架占位值"
```

🔴 **骨架不是从框架而是从兄弟站复制来的**（如文档站：从 officia-docs 复制给知识库），还要扫来源站残留——
来源站的域名、站名、标题后缀、IndexNow 密钥、品牌色写死在某个文件里时，构建、测试全都照样通过（知识库上线后 IndexNow 推的还是 ruoyi.plus）：

```bash
cd "$NEW_DIR" && node scripts/check-residue.mjs <来源站目录>          # 有意保留的词（产品矩阵里列着来源站名）用 --allow 放行
```

从兄弟站复制时必改清单：`site.config.ts`（url、name、titleSuffix、homeTitle、keywords、brandColor、contact、footer*）、`src/data/docs.json`（栏目、
article、editUrl、indexnow.key + `public/<key>.txt`、sitemap 分档、llms）、`src/lib/site-jsonld.ts`、`src/styles/brand.css`、`llms-facts.md`、
站长验证文件、e2e 与单测里写死的域名；`.framework-sync.json` 的 `initCommit` 写真实的框架基线（来源站孵化时的那个），另记 `scaffoldFrom`。

两项都是 ✅ 再跑验证门，必须全绿：

```bash
NEW_DIR="E:/my/bili-video-site"
[ -n "$NEW_DIR" ] || { echo "NEW_DIR 为空，停止"; exit 1; }
cd "$NEW_DIR" && pnpm verify
```

- `site.url` 还是保留示例域名（`example.com/.org/.net`、`.test` 等，生产域名待定时的占位）时 `check:seo` 只报**警告**不报错，属预期；PROJECT.md 里把生产域名写成「待定」
- 任何 error → 先修再往下走（常见：`site.config.ts` 引号 / 逗号写错导致 `astro check` 失败）

---

## 阶段三：Git 初始化与推送

### Step 3.1：生成 `.framework-sync.json`

`/framework-sync` 靠它知道「从框架哪个提交孵化、改过哪些站点配置」，`exp-sediment`、`project-navigator` 也靠它判定「这是孵化项目」：

```bash
TEMPLATE_DIR="E:/my/AI框架/next-ai-astro"
[ -n "$TEMPLATE_DIR" ] || { echo "TEMPLATE_DIR 为空，停止"; exit 1; }
cd "$TEMPLATE_DIR" && git rev-parse HEAD && git branch --show-current && (git remote get-url origin 2>/dev/null || echo "(无远程)")
date '+%Y-%m-%dT%H:%M:%S%:z'
```

用 Write 工具写 `<NEW_DIR>/.framework-sync.json`：

```json
{
  "framework": "next-ai-astro",
  "upstream": {
    "url": "<框架 origin 地址；框架没有远程时写框架的本地绝对路径>",
    "branch": "<上面 branch 的输出，如 master>",
    "initCommit": "<框架 HEAD 完整 hash>",
    "initDate": "<上面 date 的输出>"
  },
  "site": {
    "name": "<站点名>",
    "url": "<域名>",
    "brandColor": "<品牌色>"
  },
  "strippedModules": [],
  "transformedModules": {},
  "lastSync": null,
  "lastCommit": "<同 initCommit>",
  "syncs": []
}
```

`strippedModules` 填 Step 2.5 实际裁掉的模块（如 `["examples"]`、`["examples", "posts"]`），没裁剪就是 `[]`；
之后再用 `module-strip` 裁剪时，脚本会自动追加到这里，`framework-sync` 据此跳过已裁掉模块的上游改动。
`transformedModules` 记「没裁掉、而是改造成别的东西」的模块，孵化时一般是 `{}`。🔴 用户说「把 works 改成 xx」（视频、课程、产品…）时，
不要用 `module-strip` 裁掉 works，而是在开发阶段改名改写，并在同一个提交里登记：

```json
"transformedModules": {
  "works": "改造为 videos：src/lib/works.ts → videos.ts、WorkCard → VideoCard、/works/ → /videos/、works.json → videos.json"
}
```

值写清「原文件 / 组件 / 路由 → 新名字」的对照：`framework-sync` 靠它把上游对原模块的修复移植到改造后的文件，`module-strip` 与 `check:skills` 靠它跳过该模块的预演和 `--audit`。
同一个模块不能既在 `strippedModules` 又在 `transformedModules`（`check:skills` 会报错）。PROJECT.md「与框架的差异」也记一笔，并把「参考代码位置（覆盖 CLAUDE.md）」表里该模块的行改成改造后的文件。
🔴 时间用裸 `date`，禁止 `TZ=Asia/Shanghai`、禁止手写 `+08:00`。

### Step 3.2：本地初始化与首次提交

全新目录没有别的会话的文件，可以一次性加入全部未忽略文件。`git add -A` / `git add .` 会被 pre-tool-use hook 拦截，这里改为**显式列出**文件再加（效果相同，且只包含 `.gitignore` 放行的文件）：

```bash
NEW_DIR="E:/my/bili-video-site"
[ -n "$NEW_DIR" ] || { echo "NEW_DIR 为空，停止"; exit 1; }
cd "$NEW_DIR" && [ ! -d .git ] || { echo "新目录已经是 git 仓库，停止检查"; exit 1; }
git init -b main && git config core.autocrlf false \
  && git ls-files -o --exclude-standard -z | xargs -0 git add -- \
  && git commit -q -m "init: 基于 next-ai-astro 框架初始化 <站点名>" && git log --oneline -1 && git status -s | head
```

> 首行的 `[ ! -d .git ]` 守卫保证这条命令只会在新目录里建仓：万一路径写错落回了已有仓库，会直接停下。之后的日常开发一律逐个 `git add <文件>`。

### Step 3.3：挂 upstream（框架）

```bash
NEW_DIR="E:/my/bili-video-site"
[ -n "$NEW_DIR" ] || { echo "NEW_DIR 为空，停止"; exit 1; }
cd "$NEW_DIR" && git remote add upstream "<框架 origin 地址或本地绝对路径>" && git remote -v
```

本地路径做 remote 是纯离线操作，不会弹凭据窗口。

### Step 3.4：建私有仓 + 推送（仅 Step 0.5 选了 [1] 或 [2]）

🔴 **只走 Sigil，禁止本地 `git push`（hook 也会拦），禁止手拼带 token 的 URL，禁止 `git credential fill`。**

```
# [1] Sigil 建仓（只能建私有仓，Sigil 强制；改动型操作，需用户在 Sigil 桌面端确认）
mcp__sigil__git_repo_create(credential_name="<gitee|gitcode|githubN>", name="<项目标识>", description="<站点定位>")
# → 返回仓库地址

# 挂 origin（纯本地命令，同样先赋值 + 守卫）
cd "<NEW_DIR 绝对路径>" && git remote add origin "<仓库地址>"

# 推送（username 不用传，Sigil 按凭据自动带出）
mcp__sigil__git_push(repo_path="<NEW_DIR 绝对路径>", remote="origin", branch="main", credential_name="<同上>")

# 核对远端 = 本地
mcp__sigil__git_commits_list(credential_name="<同上>", repo="<owner/repo>", sha="main", per_page=1)
```

- Sigil 报错（vault locked / 缺凭据 / 能力未启用）→ **停下提示用户去 Sigil 处理**，不回退任何本地推送方式
- 推送完回显：「✅ 仓库 <地址>，可见性 Private（私有）」

选 [3] → 跳过，提示以后用 `git-workflow` 技能经 Sigil 推送。

---

## 阶段四：启动引导与起飞

### Step 4.1：启动指引

```
━━━━━━━━━━ 孵化完成 ━━━━━━━━━━
📁 项目目录：E:/my/bili-video-site

本地开发：  pnpm dev                    → http://localhost:4321/
构建验证：  pnpm verify                 （build + check:seo + test）
预览产物：  pnpm preview --port 4329    → http://localhost:4329/

站点配置只在 src/site.config.ts；域名未定的话上线前务必改掉 example.com。
项目专属规则写在 .claude/PROJECT.md。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> 需要替用户把 dev server 跑起来时，优先用智码任务系统 `mcp__aicoder__resolve_and_start_task(project_path=<新目录>, command="pnpm dev", port_hint=4321)`，不要在 shell 里 spawn 常驻进程。地址写 `localhost`，不写 `127.0.0.1`（本机 localhost 解析到 IPv6，Astro 只监听它）。

### Step 4.2：起飞自主开发

有 `docs/需求文档.md` 时输出起飞指令（到**新项目目录**新开会话粘贴）：

```
━━━━━━━━━━ 到新项目里新开会话，二选一粘贴 ━━━━━━━━━━
在智码 AICoder 里（台账较大时推荐）：   /dev-orchestrate
其他环境 / 小需求：                     /loop /dev-loop
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

推荐规则：在智码里（`echo $AICODER_SESSION_ID` 非空，或 `mcp__aicoder__get_session_status` 可调）且需求较大（预计任务 ≥ 5 条 / 含原型还原）→ 推荐 `/dev-orchestrate`；否则 `/loop /dev-loop`。

说明（给用户看）：
- **第 0 轮**：没有任务台账时，`/dev-loop` 会按需求文档 + 原型（+ 头脑风暴结论）用 `writing-plans` 拆出 `docs/tasks/active/` 任务台账（编号 `T1`、`T2`…）并提交
- 之后每轮只做一个最小任务：实现 → `pnpm verify` → UI 任务截图对照原型 → 勾台账 → 规范提交
- 没有需求文档 → 建议先 `/init-docs` 或回框架走 `/kickoff`

---

## 注意事项

| 事项 | 说明 |
|------|------|
| 只在框架里孵化 | 当前目录有 `.framework-sync.json` 就拒绝执行 |
| 模板不变 | 所有写入都在新目录；框架目录只读（Step 1.2 移除 kickoff 产出须经用户同意） |
| 全新历史 | 新项目不带框架的 git 历史，靠 `.framework-sync.json` 记录来源提交 |
| 只改配置 | 孵化阶段只改 `site.config.ts`、`package.json`、`docker-compose.yml`、新增 `PROJECT.md` 与 `.framework-sync.json`；不改页面、组件、路由 |
| 私有仓 | 任何平台都只建私有仓 |
| 推送 | 只走 Sigil；失败即停 |
| Windows | Bash 工具每次调用重置变量与 cwd：每个命令块自己赋值 + 空值守卫；不用 `/tmp` |

## 常见问题

**Q：框架目录有未提交的改动，想一起带过去？**
先在框架里提交（`feat/fix(scope): …`），再孵化。`git archive` 只认提交。`/kickoff` 的产出（需求、原型、头脑风暴、选型）例外，由 Step 1.2 单独复制。

**Q：新目录已存在但是空的？** 可以直接用；非空一律换目录。

**Q：域名还没定？** 先用 `example.com` 孵化，上线前改 `src/site.config.ts` 的 `url` 即可，所有 canonical / sitemap / robots / llms.txt 自动跟随。

**Q：以后框架更新了怎么办？** 在新项目里用 `/framework-sync`，它读 `.framework-sync.json` 的 `lastCommit` 做差异合并。

**Q：在孵化项目里想改框架核心文件？** 可以，但单独一个提交、scope 写 `framework`（如 `feat(framework): seo.ts 新增 eventJsonLd`），并记进 PROJECT.md「与框架的差异」。

**Q：用户说「把 works 改成视频 / 课程」？** 这是改造，不是裁剪：不跑 `module-strip works`，开发阶段改名改写，完成后把 `works` 和改名对照登记进 `.framework-sync.json` 的 `transformedModules`（见 Step 3.1）。

## 与相邻能力的边界

| 能力 | 角色 |
|------|------|
| `/kickoff` | 前门编排：调研 → 需求门 → 原型门 → **调用本技能** → 起飞 |
| `module-strip` | 清空示例 / 裁剪模块的具体执行 |
| `env-config` | 孵化后改域名、统计、环境变量 |
| `git-workflow` | 日常提交与经 Sigil 推送 |
| `framework-sync` | 孵化之后同步框架更新 |
| `exp-sediment` | 按 `.framework-sync.json` 自动以子项目模式沉淀经验 |
