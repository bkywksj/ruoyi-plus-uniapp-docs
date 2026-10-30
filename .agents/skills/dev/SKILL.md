---
name: dev
description: |
  /dev - 开发一个页面或功能：读参考代码 → 列文件清单与方案（唯一一次确认）→ 实现 → 验证门 → 规范提交

  参数：<功能描述，如「作品详情页加上一篇 / 下一篇导航」>

  （Claude Code 斜杠命令的 Codex 版：用户输入 /dev，或描述同类意图时，按本文流程执行。）

  触发词：/dev、dev
---

# /dev - 开发一个页面或功能

作为新功能开发助手，按框架规范完成一个页面或功能：**读参考 → 定方案（只确认一次）→ 全自动实现 → 验证门 → 规范提交**。

> 新增一整类内容（新集合 + 列表 / 详情 / 分类页）走 `/collection`；只改样式或组件细节可以直接改，不必走本命令。

## 核心原则

- **先读后写**：动手前必读 `CLAUDE.md`「参考代码位置」里的同类文件，照同样的写法写；孵化项目有 `.claude/PROJECT.md` 时先读它（优先级更高；它的「参考代码位置（覆盖 CLAUDE.md）」表替代 CLAUDE.md 的同名表）。
- **只确认一次**：方案（文件清单 + 数据流 + SEO 字段）给用户确认一次，之后全自动执行到提交，不再逐步请示。
- **框架核心文件**（`.claude/framework-config.json` 的 `framework.core.paths`）：在框架仓库本身里正常开发；在孵化项目（有 `.framework-sync.json`）里尽量不改，确需改（含追加导出）就在方案里点明理由，并单独提交、scope 写 `framework`（如 `feat(framework): seo.ts 新增 eventJsonLd`）。
- **默认零 JS**：没有状态就用 `.astro`；需要交互才做 island，且优先 `client:visible` / `client:idle`。

---

## 第一步：理解需求

从参数和对话中提取；缺关键信息**只问必要的 1-2 个**：

| 信息 | 说明 |
|------|------|
| 功能 / 页面名 | 如「系列页」「上一篇 / 下一篇导航」「首页热门区块」 |
| 路由 | 新页面的 URL（一律带结尾斜杠，如 `/series/<id>/`） |
| 数据来源 | 已有集合（works / categories / posts / 项目自建集合）；需要新集合 → 转 `/collection` |
| 交互 | 是否需要状态（筛选 / 搜索 / 切换）→ 决定是否做 island |
| SEO | 是否要被收录、title / description 规则、需要的 JSON-LD 类型 |
| 原型 | `docs/prototypes/` 里是否有对应原型（有 → 本功能是 UI 还原，走 `html-to-code` 并过截图闭环） |

### 检查活跃任务关联

```bash
grep -rnE "^- \[ \] T[0-9]+" docs/tasks/active/ 2>/dev/null    # 只看「## 🎯 实现步骤」区块里的任务行
```

有相关任务 → 显示「📋 关联任务：T{编号} {任务名}（需求 REQ-xxx，台账进度 X/Y）」，完成后把该行勾成 `[x]` 并补一行「实际改了什么」，随本次提交一起提交；无则静默跳过。台账格式见 `CLAUDE.md`「协作约定」。

---

## 第二步：查重（强制执行）

```bash
# 路由是否已存在
ls src/pages/ src/pages/*/ 2>/dev/null
# 组件 / 工具函数是否已有同类
ls src/components/*/ src/lib/
```

再用 Grep 按关键词查（**限定目录与文件类型**，不要扫 `node_modules` / `dist`）：

```
Grep pattern: "<关键词>" path: src glob: "*.{astro,ts,tsx}"
```

| 情况 | 处理 |
|------|------|
| 已有同名 / 同功能页面或组件 | 停下告知，改为「增强现有功能」 |
| 已有可复用的 lib 函数 / 组件 | 方案里写明复用，不另造 |
| 完全不存在 | 进入第三步 |

---

## 第三步：读参考代码 + 激活对应技能

按功能类型读参考（来自 `CLAUDE.md`）：

| 开发类型 | 必读参考 | 激活技能 |
|---------|---------|---------|
| 新路由 / 动态路由 / 分页 | `src/pages/works/[id].astro`、`src/pages/works/category/[id].astro` | `astro-routing` |
| 列表 + 交互筛选 | `src/pages/works/index.astro` + `src/components/islands/WorksExplorer.tsx` | `islands-interaction`、`site-search` |
| 卡片 / 区块组件 | `src/components/works/WorkCard.tsx`、`src/components/ui/*` | `ui-components`、`design-system` |
| 集合查询 / 字段变更 | `src/lib/works.ts`、`src/content.config.ts` | `content-collections` |
| 图片 / 封面 | `src/lib/images.ts` | `image-optimization` |
| SEO / 结构化数据 | `src/components/seo/SEOHead.astro`、`src/lib/seo.ts` | `seo-meta`、`geo-optimization` |
| 动效 / 过渡 | `src/styles/global.css`（`.vt-card` 规则） | `motion-transitions` |
| 原型还原 | `docs/prototypes/<页面>/*.html` | `html-to-code` |
| Markdown 文章 | `src/pages/posts/[...id].astro` | `content-collections` |

涉及集合 / 路由 / 图片 / 过渡 API 时，对照 `CLAUDE.md`「Astro 7 版本红线」；用到框架里还没出现过的 Astro API 时查 `context7`（`/withastro/docs`）。

---

## 第四步：生成方案并确认（唯一一次确认）⭐

```markdown
## 📋 开发方案：{功能名}

### 路由与页面
| URL | 文件 | 类型 | 收录 |
|-----|------|------|------|
| /series/<id>/ | src/pages/series/[id].astro | 动态路由（getStaticPaths） | ✅ |

### 文件清单
| 操作 | 文件 | 说明 | 框架核心？ |
|------|------|------|-----------|
| 新增 | src/lib/series.ts | 系列查询封装 | 否 |
| 新增 | src/pages/series/[id].astro | 系列详情页 | 否 |
| 修改 | src/site.config.ts | 导航加「系列」 | 否（项目配置） |

### 数据流
集合 series → src/lib/series.ts → 页面 frontmatter（服务端算好封面等）→ 静态组件 / island props

### 交互
{无 island，纯静态} / {WorksExplorer 式 island，client:visible，原因：…}

### SEO
- title：{规则}；description：{规则，确保每页不同}
- JSON-LD：BreadcrumbList + {类型}
- 是否进 llms.txt：{是 / 否}

### 验证
pnpm build + pnpm check:seo + pnpm test{ + 截图闭环（有原型 / 有 UI 改动时）}

确认后我将全自动执行到提交。
```

🔴 孵化项目的方案里出现「修改框架核心文件」时，必须单列一行说明理由，并注明这部分单独提交、scope 为 `framework`。用户确认后进入第五步，**之后不再请示**（除非发现方案本身错了，需要回来改方案）。

以下情况**跳过等待确认**，方案照样按上面的格式写出来，然后直接进入第五步：
- 在 `/dev-loop` 循环里（任务台账就是已确认的方案）
- 用户在本次需求里明确说了「一次做完 / 不用确认 / 直接做」
- 当前会话是编排派出的子会话（提示词要求完成后写报告或 ORCH-RESULT，没有人在终端前等着回复）：方案同时写进报告，供总控事后核对

跳过的只是「等待」，不是方案本身；不可逆操作（推送、部署、删数据）仍按 CLAUDE.md 先告知。

---

## 第五步：自动实现（无需确认）

按依赖顺序实现：

1. **数据层**：集合 schema 调整（`src/content.config.ts`，改完 `pnpm astro sync`）→ `src/lib/<业务>.ts` 查询封装（排序、路径函数、服务端图片解析）
2. **组件层**：先复用 `src/components/ui/*`；新业务组件放 `src/components/<业务>/`；需要水合的放 `src/components/islands/`（island 只接收服务端算好的 props，不在里面 `getCollection` / `getImage`）
3. **页面层**：页面一律经 `BaseLayout`，传 `title` / `description` / `jsonLd`；宽度用 `Container`，区块用 `Section`；面包屑用 `Breadcrumbs` + `breadcrumbJsonLd(crumbs)`（同一个数组）
4. **接入**：需要导航的改 `site.config.ts` 的 `nav`；需要进 AI 摘要的在 `src/pages/llms.txt.ts` 追加分区（项目配置文件，随业务提交即可）
5. **测试**：新增的 `src/lib` 纯函数补单测（`tests/unit/*.test.ts`，激活 `test-development`）

写代码时的硬约束（详见 `CLAUDE.md`「绝对禁止的写法」）：

- 文件首行注释：`.ts` / `.tsx` 第一行 `// 中文描述`，`.astro` frontmatter 第一行 `// 中文描述`
- 站内链接带结尾斜杠，用路径函数生成（`workPath()` 这类）
- 颜色只用语义令牌；品牌色做文字用 `text-brand-ink`；主按钮用 `Button`（`bg-brand-strong`）
- 中文标题用 `text-pretty`，不用 `text-balance`
- 图片宽高必填；装饰图 `alt=""`，内容图写描述；远程图片走 `resolveCover()` / `getImage()`（服务端）
- JSON-LD 用 `serializeJsonLd()`；FAQ 结构化数据只标注页面上可见的问答
- 日期 / 数字展示用 `src/lib/format.ts`

---

## 第六步：验证门（必须全绿才提交）

```bash
pnpm build        # astro check + astro build：类型、schema、HTML 合法性
pnpm check:seo    # canonical / og:url / 描述重复 / JSON-LD / alt / robots / llms.txt
pnpm test         # src/lib 单测
```

- 红了当场修绿；同一处修两轮仍不绿 → 停下报告错误原文 + 判断 + 建议。
- **涉及 UI 的功能额外过截图闭环**（复用 `e2e-test` 技能）：
  1. 起 dev server 前先查端口：`netstat -ano | findstr :4321`，已有本会话起的服务就复用；没有才 `pnpm dev`（用 `run_in_background`，**不 kill 已有进程**；在智码里优先 `mcp__aicoder__resolve_and_start_task(project_path=<项目根>, command="pnpm dev")`）。地址一律写 `localhost`
  2. `mcp__aicoder__browser_open(url="http://localhost:4321/<路由>/", device="desktop")` 拿到 label → `browser_screenshot(label, full_page=true)`；`browser_set_device(label, device="mobile")` 再截一次；切深色模式（点页头主题按钮）再截一次
  3. 有原型时打开原型当「目标」：`browser_open(url="file:///E:/<项目路径>/docs/prototypes/<页面>/index.html", device="desktop")`（也可直接传本地绝对路径），逐条比对 7 项：① 布局 / 分区 ② 主 / 辅 / 状态色 ③ 间距留白 ④ 字号字重行高 ⑤ 组件类型（`Button` / `Badge` / `Section` / 卡片用对）⑥ 文案 ⑦ 交互态（hover / focus / 空态 / 深色）
  4. 有差异只改视图层 → 重截确认；关键差异未消除不提交
  5. 浏览器第一次调用就失败 → 本会话不反复重试，改为「对照原型源码 + 用户提供截图」核对

---

## 第七步：两段 review → 规范提交

1. **第一段 · 功能正确性**：是否达成需求、边界（空集合 / 单条 / 超长标题 / 无封面）、有无回归（首页 / 列表 / llms.txt 是否受影响）。可调用 `code-reviewer` 子代理做独立审查。
2. **第二段 · 框架规范**：跑 `/check <本次改动的目录或文件>`。
3. 两段都过 → 提交：

```bash
git status --short                 # 对照 L1 他者占用区，只提交本次改动
git add src/lib/series.ts "src/pages/series/[id].astro" src/site.config.ts   # 逐个具体文件；含 [ ] 的路径加引号，防止被 shell 当通配符
git commit -m "feat(series): 新增系列详情页"
```

- 🔴 禁止 `git add -A` / `git add .`；功能 / 修复用 `feat(scope): …` / `fix(scope): …`——`/progress`、`/update-status` 只数这两类（scope 为 framework / strip / data / deps 除外），完整口径见 `CLAUDE.md`「提交与进度口径」
- 孵化项目里修改框架核心文件的部分单独一个提交，scope 写 `framework`（如 `feat(framework): …`）；框架仓库本身正常提交
- 有关联的台账任务时，勾选后的台账文件随本次功能提交一起 `git add`
- 本地提交，不推远端（推送走 Sigil，且需用户要求）

---

## 第八步：完成报告 + 联动

```markdown
## ✅ {功能名} 开发完成

### 改动文件
- 新增：…
- 修改：…

### 验证
- pnpm build ✅ / pnpm check:seo ✅ / pnpm test ✅（新增 N 个用例）
- 截图闭环：桌面 ✅ 移动 ✅ 深色 ✅（与原型差异：无 / 已记录）

### 提交
- abc1234 feat(series): 新增系列详情页

### 下一步建议
- {关联任务已勾选：T12（docs/tasks/active/xxx.md）}
- {完成一个模块 → /update-status}
- {上线前 → /seo-check}
```

## 与其他命令的关系

| 命令 | 关系 |
|------|------|
| `/collection` | 新增一整类内容时用它；/dev 做单个页面或功能 |
| `/dev-loop` | 循环里每轮按 /dev 的步骤执行，但**跳过第四步确认**（台账即已确认的方案） |
| `/check` | /dev 第七步的第二段 review |
| `/seo-check` | 页面多了、上线前做一次全站 SEO / GEO 验收 |
| `/next` | 不知道该做什么时先 /next |
