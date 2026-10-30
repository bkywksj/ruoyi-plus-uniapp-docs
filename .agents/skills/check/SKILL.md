---
name: check
description: |
  /check - 框架规范检查：对照 CLAUDE.md「绝对禁止的写法」「强制使用框架封装」「Astro 7 版本红线」逐项 grep 核对

  参数：[目录 | 文件 | --staged] [--fix]

  （Claude Code 斜杠命令的 Codex 版：用户输入 /check，或描述同类意图时，按本文流程执行。）

  触发词：/check、check
---

# /check - 框架规范检查

作为代码规范检查助手，逐项核对代码是否符合 next-ai-astro 规范。它是 `/dev`、`/collection`、`/dev-loop` 两段 review 的**第二段**。

> 本命令做**静态检查**（读代码、grep）。构建产物层面的 SEO 字段（每页 canonical、描述去重、图片 alt / 宽高、JSON-LD 可解析）由 `pnpm check:seo` 负责；本轮还没跑过验证门时，末尾补跑 `pnpm verify`。

## 🎯 检查范围

| 用法 | 范围 |
|------|------|
| `/check` | 全量：`src/`、`scripts/sync/sources/`、`tests/` |
| `/check src/pages/videos` | 指定目录 |
| `/check src/lib/videos.ts` | 指定文件 |
| `/check --staged` | 只查已暂存文件（`git diff --cached --name-only`），提交前用 |
| 追加 `--fix` | 自动修复可机械修复的项（见文末），其余只报告 |

下文命令里的 `src` 按范围替换成目标目录 / 文件。🔴 grep 一律限定目录与 `--include`，不要扫 `node_modules` / `dist` / `.astro`。

---

## 📋 检查清单总览

| # | 检查项 | 级别 |
|---|--------|------|
| 1 | 页面未经 `BaseLayout` / 手写 `<html>` `<head>` | 🔴 严重 |
| 2 | 手写 canonical / og:url | 🔴 严重 |
| 3 | JSON-LD 用 `JSON.stringify` 直接进 `set:html` | 🔴 严重 |
| 4 | Astro 7 版本红线旧写法 | 🔴 严重 |
| 5 | island 里取数（`getCollection` / `getImage` / `astro:*`） | 🔴 严重 |
| 6 | 站内链接缺结尾斜杠 | 🔴 严重 |
| 7 | 域名硬编码在 `site.config.ts` 之外 | 🔴 严重 |
| 8 | 数据源绕过运行器直接写文件 | 🔴 严重 |
| 9 | 文件编码 BOM | 🔴 严重 |
| 10 | 原始色 / 十六进制颜色硬编码 | 🟡 警告 |
| 11 | 品牌色直接做文字（`text-brand`） | 🟡 警告 |
| 12 | 页面直接 `getCollection`（未走 `src/lib` 封装） | 🟡 警告 |
| 13 | 绕过 `Container` / `Button` 等封装 | 🟡 警告 |
| 14 | 日期 / 数字各自格式化 | 🟡 警告 |
| 15 | 非 lucide 图标库 / 内联 SVG 图标 | 🟡 警告 |
| 16 | `target="_blank"` 缺 `rel="noopener"` | 🟡 警告 |
| 17 | 中文标题 `text-balance` | 🟡 警告 |
| 18 | 引入 webfont | 🟡 警告 |
| 19 | 改动了框架核心文件 | 🟡 警告 |
| 20 | 水合指令不当（`client:only` / 能延迟却用 `client:load`） | 🟢 建议 |
| 21 | 缺文件首行注释 | 🟢 建议 |
| 22 | 技能 / hook 一致性（框架维护） | 🟢 建议 |

---

## 🔍 检查详情

### 1. 页面骨架 [🔴]

```bash
# 没有引入 BaseLayout 的页面（*.txt.ts 等端点不在此列）
grep -rL "BaseLayout" src/pages --include=*.astro
# 手写 <html> / <head>（只允许 BaseLayout 里有；最后一段排除注释行，避免「放在 <head> 里」这类说明误报）
grep -rnE "<(html|head)[ >]" src --include=*.astro --include=*.tsx | grep -v "src/layouts/BaseLayout.astro" | grep -vE '^[^:]+:[0-9]+:\s*(//|/?\*|<!--)'
```

- ❌ 页面自己写 `<html><head><title>…`
- ✅ `<BaseLayout title=… description=… jsonLd={[…]}>`

### 2. 手写 canonical / og:url [🔴]

```bash
grep -rnE 'rel="canonical"|property="og:url"' src --include=*.astro --include=*.tsx --include=*.ts | grep -v "src/components/seo/SEOHead.astro"
```

- ❌ 页面再写一份 canonical（写死成 `site.url` 会让全站指向首页；多写一份会出现两个 og:url）
- ✅ 只由 `SEOHead` 按当前页路径输出

### 3. JSON-LD 序列化 [🔴]

```bash
grep -rnE "set:html=\{JSON\.stringify" src --include=*.astro
```

- ❌ `set:html={JSON.stringify(data)}`（数据里出现 `</script>` 会提前闭合标签）
- ✅ 经 `BaseLayout` 的 `jsonLd` 传入，或 `serializeJsonLd(data)`

### 4. Astro 7 版本红线 [🔴]

```bash
ls src/content/config.ts 2>/dev/null                                  # 应不存在，只能是 src/content.config.ts
grep -rnE "import \{[^}]*\bz\b[^}]*\} from ['\"]astro:content['\"]" src   # z 必须从 'astro/zod' 导入
grep -rnE "type: ['\"](content|data)['\"]" src/content.config.ts      # 旧集合写法
grep -rnE "Astro\.glob|getEntryBySlug|getDataEntryById|ViewTransitions" src
grep -rnE "\.render\(\)" src --include=*.astro --include=*.ts          # entry.render() → render(entry)
grep -rnE "z\.string\(\)\.(email|url|uuid)\(\)" src                    # Zod 3 → z.email() / z.url() / z.uuid()
grep -rnE "\.slug\b" src --include=*.astro --include=*.ts              # 集合条目用 .id（命中需人工确认是否是条目对象）
grep -rnE "\bbabel\b" astro.config.ts                                  # @astrojs/react v7 已移除 babel 选项
ls src/fetch.ts 2>/dev/null                                            # Astro 7 保留文件名，不能放业务代码
```

对照 `CLAUDE.md`「Astro 7 版本红线」表格修正；拿不准查 `context7`（`/withastro/docs`）。

### 5. island 里取数 [🔴]

```bash
grep -rnE "getCollection\(|getEntry\(|getImage\(|from ['\"]astro:(content|assets)['\"]" src/components --include=*.tsx
```

- ❌ React 组件里 `getImage()` / `getCollection()`（`getImage` 在客户端直接抛错；取数应在构建期完成）
- ✅ 页面 frontmatter 里算好（如 `toCardData()` + `resolveCover()`），当 props 传给 island

### 6. 站内链接缺结尾斜杠 [🔴]

```bash
# 字面量链接：/works 而非 /works/（不含扩展名、不含查询串）
grep -rnE 'href="/[A-Za-z0-9/_-]*[A-Za-z0-9_-]"' src --include=*.astro --include=*.tsx
# 对象字面量里的路径：导航 href、面包屑 path（.astro 的 frontmatter 也要查）
grep -rnE "(href|path): ?['\"]/[A-Za-z0-9/_-]*[A-Za-z0-9_-]['\"]" src --include=*.astro --include=*.ts --include=*.tsx
# 模板字符串链接（结尾不是 /；带 ? 查询串的属正常，已排除）
grep -rnE 'href=\{`/[^`]*[^/`]`\}' src --include=*.astro --include=*.tsx | grep -v '?'
```

- ❌ `href="/works"`、`` href={`/works/${id}`} ``、`{ name: '全部作品', path: '/works' }`
- ✅ `href="/works/"`、`href={workPath(id)}`（路径函数统一补斜杠）
- 构建后 `pnpm check:seo` 还会扫 `dist/` 里所有站内 `<a href>`，缺斜杠与死链都会报错，两层互补

### 7. 域名硬编码 [🔴]

```bash
# 列出 site.config.ts 之外出现的所有绝对地址的域名部分（任意顶级域名，带不带路径都算）
grep -rnoE "https?://[a-z0-9.-]+\.[a-z]{2,}" src --include=*.astro --include=*.tsx --include=*.ts | grep -v "src/site.config.ts" | grep -vE "schema\.org|w3\.org"
```

命中后逐条判断：本站域名或 `example.com` → 改用 `site.url` / `absoluteUrl()`；第三方外链（统计脚本 `hm.baidu.com`、备案链接 `beian.miit.gov.cn`、注释里的规范链接如 `llmstxt.org`）属正常，报告里标「已核对」即可。

### 8. 数据源绕过运行器 [🔴]

```bash
grep -rnE "writeFileSync|writeFile\(|fs\.write" scripts/sync/sources
```

- ❌ 数据源自己写 `src/data/*.json`（接口失败时会写入空数据，站点被构建成空页面）
- ✅ `fetch(ctx)` 只返回数组，由 `scripts/sync/run.mjs` 校验后原子写入

### 9. BOM [🔴]

```bash
grep -rlI $'^\xEF\xBB\xBF' src scripts tests public .claude .codex CLAUDE.md AGENTS.md README.md package.json astro.config.ts 2>/dev/null
```

有输出即违规：去掉文件头 `EF BB BF`，再扫同目录其他文件。

### 10. 原始色 / 十六进制颜色 [🟡]

```bash
grep -rnE "\b(text|bg|border|ring|fill|stroke|from|via|to|decoration|outline|divide)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b" src --include=*.astro --include=*.tsx
grep -rnE "\[#[0-9a-fA-F]{3,8}\]|#[0-9a-fA-F]{6}\b" src --include=*.astro --include=*.tsx | grep -v "src/layouts/BaseLayout.astro"
```

- ✅ 语义令牌：`bg-canvas` `bg-surface` `bg-elevated` `text-ink` `text-muted` `border-line` `bg-brand` `bg-brand-soft` `bg-brand-strong` `text-brand-ink`
- 例外：`BaseLayout` 的 `theme-color` meta；时长角标这类「压在图片上」的 `bg-black/70 text-white`

### 11. 品牌色直接做文字 [🟡]

```bash
grep -rnE "text-brand([^-a-z]|$)" src --include=*.astro --include=*.tsx
```

- ❌ `text-brand`（`#FF5D2E` 在白底上对比度约 3:1，达不到 WCAG AA）
- ✅ 文字用 `text-brand-ink`；主按钮用 `Button`（`bg-brand-strong` + 白字）

### 12. 页面直接查集合 [🟡]

```bash
grep -rn "getCollection(" src/pages
```

- ✅ 页面调 `src/lib/<集合>.ts` 的封装（如 `getWorks()`、`getPosts()` / `postPath()`），保证列表、分类、详情、llms.txt 看到的顺序、草稿过滤与字段一致

### 13. 绕过框架封装 [🟡]

```bash
# 页面自写容器宽度（应使用 Container）
grep -rnE "mx-auto[^\"]*max-w-|max-w-[^\"]*mx-auto" src/pages src/components --include=*.astro --include=*.tsx | grep -v "src/components/ui/"
# 裸链接当主按钮（应使用 Button）
grep -rnE "<a [^>]*bg-brand" src --include=*.astro | grep -v "src/components/ui/"
# 自写 pill 标签（应使用 Badge；业务组件与 island 里也查）
grep -rnE "rounded-full[^\"]*px-2\.5[^\"]*text-xs" src/pages src/components --include=*.astro --include=*.tsx | grep -v "src/components/ui/"
```

### 14. 日期 / 数字格式化 [🟡]

```bash
grep -rnE "toLocale(Date|Time)?String\(|new Intl\.(DateTimeFormat|NumberFormat)" src --include=*.astro --include=*.tsx --include=*.ts | grep -v "src/lib/format.ts"
```

- ✅ `formatDate()`（已固定 `Asia/Shanghai`）、`isoDate()`、`formatCount()`、`formatDuration()`

### 15. 图标 [🟡]

```bash
grep -rnE "from ['\"](react-icons|@heroicons|astro-icon|@iconify|@fortawesome)" src
grep -rln "<svg" src --include=*.astro --include=*.tsx
```

- ✅ `.astro` 用 `@lucide/astro`，island 用 `lucide-react`；lucide 没有的品牌图标才内联 SVG（放进单独组件，见 `icon-management`）

### 16. 外链安全 [🟡]

```bash
grep -rn 'target="_blank"' src --include=*.astro --include=*.tsx | grep -v noopener
```

属性分多行写时 `rel` 可能在下一行，命中后打开文件确认再下结论。

### 17. 中文标题排版 [🟡]

```bash
grep -rn "text-balance" src --include=*.astro --include=*.tsx
```

- ❌ `text-balance`（会把「十分钟」这类词拆到两行）→ ✅ `text-pretty`

### 18. webfont [🟡]

```bash
grep -rnE "@font-face|fonts\.googleapis|fonts\.gstatic|fonts\.loli" src public
```

中文 webfont 动辄几 MB，严重拖慢 LCP；统一用 `global.css` 的 `--font-sans` 系统字体栈。

### 19. 改动了框架核心 [🟡]

先判断所在仓库：**框架仓库本身**（`package.json` 的 name 为 `next-ai-astro` 且没有 `.framework-sync.json`）改核心就是框架演进，本项不报。
**孵化项目**（有 `.framework-sync.json`）才检查：读 `.claude/framework-config.json` 的 `framework.core.paths`，与本次改动对照：

```bash
git status --short                                                   # 未提交改动
git -c core.quotepath=false log -5 --name-only --format="" | sort -u   # 最近 5 个提交改过的文件（提交数不足 5 的新仓库也能跑）
```

命中核心路径 → 确认有正当理由，且单独一个提交、scope 写 `framework`（如 `feat(framework): seo.ts 新增 eventJsonLd`），不与业务改动混在一起（便于 `/framework-sync` 识别、也不计入业务进度）。

### 20. 水合指令 [🟢]

```bash
grep -rnE "client:(load|idle|visible|media|only)" src --include=*.astro
```

- `client:only` 会让服务端不渲染（爬虫看不到）→ 除非组件确实依赖浏览器 API，否则改掉
- 首屏以下的 island 用 `client:visible`，非关键的用 `client:idle`
- 首屏就要能用的核心交互（如 `src/pages/works/index.astro` 里 `WorksExplorer` 的列表筛选）用 `client:load` 属合理，报告里标「已核对」，不算问题
- 被水合的组件应放在 `src/components/islands/`

### 21. 文件首行注释 [🟢]

```bash
# -co --exclude-standard：已跟踪 + 未跟踪（未被 .gitignore 忽略）的文件都查——本轮新建、还没提交的文件正是最该查的
for f in $(git ls-files -co --exclude-standard -- 'src/*.ts' 'src/*.tsx' 'scripts/*.mjs'); do head -1 "$f" | grep -qE '^(//|#!)' || echo "缺首行注释: $f"; done
for f in $(git ls-files -co --exclude-standard -- 'src/*.astro'); do sed -n '2p' "$f" | grep -q '^//' || echo "frontmatter 无说明: $f"; done
```

`.astro` 纯展示小组件可省；页面与业务组件应写。没有 frontmatter 的纯模板组件会被第二条报出，按「可省」处理。

### 22. 技能 / hook 一致性 [🟢]（改过 `.claude/` 时）

```bash
grep -q '"check:skills"' package.json && pnpm check:skills
```

校验 `.claude/skills/` 与 `.claude/hooks/skill-forced-eval.cjs` 的技能清单是否一一对应、`.agents/` 镜像是否与源头一致。报「镜像不一致」时先 `pnpm agents:sync` 再重跑（`CLAUDE.md`：改了技能 / 命令 / hooks 要跑 `pnpm agents:sync && pnpm check:skills`）。

---

## 📊 输出报告

```markdown
# 规范检查报告

**范围**：{全量 / 目录 / 文件 / 已暂存}　**时间**：{YYYY-MM-DD HH:MM}

| 级别 | 数量 |
|------|------|
| 🔴 严重 | X |
| 🟡 警告 | X |
| 🟢 建议 | X |

## 🔴 严重
| # | 检查项 | 位置 | 问题 | 修复建议 |
|---|--------|------|------|---------|
| 1 | 站内链接缺斜杠 | src/pages/videos/index.astro:42 | href="/videos" | 改为 videoPath() 或 "/videos/" |

## 🟡 警告
…

## 🟢 建议
…

## 结论
{✅ 通过（无 🔴） / ❌ 未通过：需修复 X 项严重问题}
{本轮未跑验证门时：已补跑 pnpm verify → 结果}
```

**通过标准**：🔴 为 0。在 `/dev-loop` 两段 review 中，有 🔴 即返工、不提交；🟡 在报告里说明是否本轮处理。

## `--fix` 可自动修复的项

| 检查项 | 自动修复方式 |
|--------|-------------|
| 3. JSON-LD 序列化 | 改为经 `jsonLd` 传入或 `serializeJsonLd()` |
| 6. 结尾斜杠 | 字面量补 `/`；动态链接改用路径函数 |
| 11. `text-brand` 做文字 | 改为 `text-brand-ink` |
| 16. 外链缺 rel | 补 `rel="noopener"` |
| 17. `text-balance` | 改为 `text-pretty` |

其余项涉及判断，只报告不自动改。修复后重跑对应检查项 + `pnpm build`。

## 与其他命令的关系

| 命令 | 关系 |
|------|------|
| `pnpm check:seo` | 构建产物层面的 SEO 校验；/check 是源码层面的规范检查，两者互补 |
| `/dev` `/collection` `/dev-loop` | 两段 review 的第二段调用 /check |
| `/seo-check` | 上线前的全站 SEO / GEO 验收 |
| `code-reviewer` 子代理 | 功能 + 规范的独立审查，可与 /check 配合 |
