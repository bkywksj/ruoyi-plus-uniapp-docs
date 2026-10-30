---
name: security-guard
description: 静态内容站安全：外部数据防 XSS、安全响应头、CSP（security.csp 实测要点与审计脚本）、第三方 iframe、外链 rel、密钥与依赖审计。触发词：安全、CSP、安全头、XSS、HSTS、依赖漏洞、pnpm audit、外链安全、rel=noopener、iframe、密钥泄漏
---

# 安全规范（静态内容站）

## 何时使用

- 上线前安全检查、配置安全响应头
- 开启 / 调整 CSP，页面功能在 CSP 下失效
- 渲染外部接口同步来的数据（标题、简介、链接）
- 嵌入第三方 iframe（B 站外链播放器、地图、表单）
- 接入第三方脚本（统计、评论、客服）
- 依赖漏洞审计、密钥是否泄漏到构建产物

其他常见说法：内容安全策略、响应头、X-Frame-Options、点击劫持、.env、javascript:协议、set:html、嵌入播放器。

## 威胁模型：静态站该防什么

纯静态站没有后端、数据库、登录态，SQL 注入、越权这类问题不存在。真正的风险在这几处：

| 风险 | 来源 | 本框架的防线 |
|------|------|------------|
| **XSS** | 外部数据源（B 站、GitHub、RSS）里的恶意内容、第三方脚本 | Astro 表达式默认转义；URL 协议白名单；禁止 `set:html` 渲染外部数据；JSON-LD 转义 |
| **点击劫持** | 站点被别人用 iframe 嵌套 | `X-Frame-Options: SAMEORIGIN` |
| **MIME 嗅探** | 浏览器把文本当脚本执行 | `X-Content-Type-Options: nosniff` |
| **降级到 HTTP** | 中间人 | HTTPS + HSTS（在 TLS 终结处） |
| **密钥泄漏** | `.env`、同步脚本的 token 被打进产物或仓库 | `.gitignore`、只有 `PUBLIC_` 前缀进浏览器、构建后 grep |
| **供应链** | 依赖包被投毒 | 锁文件 + `--frozen-lockfile` + `onlyBuiltDependencies` + 定期 audit |

---

## 1. 外部数据是不可信输入

数据同步（`scripts/sync`）拿到的每个字段都当成攻击者可控：

### 1.1 URL 字段：只允许 http / https

Zod 4 的 `z.url()` **会放行 `javascript:` 与 `data:`**（实测 `javascript:alert(1)` 校验通过）。这类值一旦进了 `<a href>`，用户一点就执行脚本。

```ts
// src/content.config.ts
url: z.url({ protocol: /^https?$/ }).optional(),   // ✅ 只收 http/https
url: z.url().optional(),                           // ❌ javascript: 也能过
```

所有「会进 href / src 的外部字段」都用协议白名单；构建期 schema 校验失败会直接报错，恶意数据进不了产物。

### 1.2 文本字段：只用表达式渲染，不用 set:html

```astro
<p>{work.data.summary}</p>                    <!-- ✅ 自动转义 -->
<p set:html={work.data.summary} />            <!-- ❌ 外部数据里的 <img onerror> 会执行 -->
```

- `set:html` 只允许用于**自己写的、可信的**内容（如 `serializeJsonLd()` 的输出、构建期 Markdown 渲染结果）
- 外部数据确实带 HTML（如 RSS 正文）时：同步阶段转成纯文本，或用白名单净化库处理后再存；不要在页面里现场拼 HTML
- React island 里同理：不用 `dangerouslySetInnerHTML` 渲染外部数据

### 1.3 JSON-LD 必须转义

`<script type="application/ld+json">` 里如果出现 `</script>`，标签会提前闭合，后面的内容变成可执行 HTML。
框架的 `serializeJsonLd()`（`src/lib/seo.ts`）已把 `<` 转义成 `\u003c`（JSON 里的 Unicode 转义，解析后还是 `<`，但 HTML 解析器看不到 `</script>`），**所有 JSON-LD 只能经它输出**（`tests/unit/seo.test.ts` 有回归用例）。

## 2. 外链

```astro
<a href={url} target="_blank" rel="noopener">…</a>                 <!-- 站点自己的外链 -->
<a href={url} target="_blank" rel="noopener nofollow ugc">…</a>    <!-- 来自外部数据 / 用户内容的链接 -->
```

- `noopener`：阻止新页面通过 `window.opener` 操纵本页（现代浏览器对 `target="_blank"` 默认如此，显式写上兼容旧浏览器、也表明意图）
- `nofollow ugc`：外部来源的链接不传递权重，也避免给垃圾站背书
- 框架现有外链（详情页「查看原作品」、页脚社交链接）都带 `rel="noopener"`：「查看原作品」指向站长自己在平台上的作品，按站点自己的外链处理；
  如果数据源是第三方聚合或用户投稿（链接不由站长控制），改成 `rel="noopener nofollow ugc"`

## 3. 安全响应头

位置：`deploy/nginx/security-headers.conf`，由 `deploy/nginx/default.conf` 的**每个 location** `include`。

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;
```

### 🔴 add_header 继承坑

nginx 的 `add_header` **只在当前层没有任何 `add_header` 时才继承上一层**。只要某个 location 自己写了一行（比如 `/_astro/` 的 `Cache-Control`），server 层的安全头在这个 location 里就**全部消失**，而且没有任何报错。

所以框架把安全头做成片段，每个 location 都 include。新增 location 时：

```nginx
location /feeds/ {
    include /etc/nginx/snippets/security-headers.conf;   # ← 必须有
    add_header Cache-Control "public, max-age=600" always;
}
```

验证：`curl -sI https://<域名>/_astro/<文件>.js` 和 `curl -sI https://<域名>/` 两个都要看到四个安全头。

### HSTS

只能加在 **HTTPS 终结处**（前置 OpenResty / CDN），容器内 nginx 是 HTTP，加了也无效。见 `deployment-guide`。

## 4. CSP（内容安全策略）

框架**默认不开启**。开启前先读完本节。以下结论来自 Astro 7.3.5 的实测：在框架外的临时副本里开启 `security.csp` 构建，用智码浏览器（Chromium）打开预览页逐项核对。

### meta 注入在哪：`<head>` 末尾（决定了哪些内容受约束）

开启后 Astro 给每页注入 `<meta http-equiv="content-security-policy">`，位置在 `<head>` **末尾**、样式表 `<link>` 之前——也就是在 `BaseLayout` 里的 `ThemeScript`、`SEOHead`（含 JSON-LD）、`Analytics` **之后**。
按 CSP 规范，meta 下发的策略**只约束它后面的内容**。实测结果：

| 内容 | 位置 | Astro 自动放行？ | 实测表现（按当前 BaseLayout 顺序） |
|------|------|----------------|--------------------------------|
| 打包 / 内联的模块 `<script>` | body | ✅ 自动加 hash | 正常（`ThemeToggle` 的点击逻辑） |
| island 引导代码与组件脚本 | body | ✅ 自动加 hash / 同源 | 正常（`/works/` 水合完成） |
| Astro 生成的 `<style>` | — | ✅ | 正常 |
| `is:inline` 脚本 `ThemeScript` | head，meta **之前** | ❌ 不在 hash 里 | 照常执行，深色模式正常——但只是因为它排在 meta 前面 |
| `Analytics` 的 Umami 外链脚本 / 百度 `set:html` 片段 | head，meta **之前** | ❌ | Umami 照常发出请求——同样是位置原因 |
| `<html style="--brand:…">` | meta **之前** | ❌ | 品牌色正常 |
| body 里的 `style=""` 属性：卡片 `--vt-name`、详情页封面 `view-transition-name` | meta **之后** | ❌ 被 `style-src` 拦截 | 🔴 **封面形变动画失效**（实测 `view-transition-name` 算出来是 `none`） |
| JSON-LD（`application/ld+json`） | — | 不需要 | 数据块不执行，不受 script-src 约束 |

两个推论：
1. **不做任何配置时线上真正坏掉的是视图过渡**（body 里的 style 属性），构建照样成功、没有报错。
2. **meta 之前的内容不受 CSP 保护**。head 前段（`slot="head"` 塞进去的东西、统计脚本）一旦被注入恶意内容，这份 CSP 管不到；需要整页生效的策略只能改由响应头下发（nginx / CDN）——那时 ThemeScript、统计片段、`<html style>` 都会被拦，必须已经在白名单里。

所以下面的配置**仍然给 ThemeScript 加 hash、给外部统计加来源**：现在不加也能跑，但换成响应头下发、或以后调整了 `<head>` 顺序，就会立刻坏掉；`csp-audit.mjs` 也按「全部放行」的标准检查，不区分位置。

### 正确配置（已实测：csp-audit 通过，深色模式、筛选、封面形变正常）

```ts
// astro.config.ts
export default defineConfig({
  security: {
    csp: {
      scriptDirective: {
        // ThemeScript 的 hash：脚本内容改一个字符都会变，改完必须重新算（见下方审计脚本）
        hashes: ['sha256-<ThemeScript 的 hash>'],
        // 接了 Umami 等外部统计时再加 resources；一旦写 resources，'self' 必须显式写上
        // resources: ["'self'", 'https://umami.example.com'],
      },
      styleDirective: {
        // 只对 style 属性放开 'unsafe-inline'（生成 style-src-attr），<style> 元素仍按 hash 校验
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
});
```

生成的策略形如（hash 已省略）：`script-src 'self' <hash…>; style-src 'self' <hash…>; style-src-attr 'unsafe-inline';`

注意：
- `security.csp.directives` 里**不能写** `script-src` / `style-src` 及其 `-elem` / `-attr` 变体（Astro 会报配置错误），要用 `scriptDirective` / `styleDirective` 的 `kind` 选项；`frame-src`、`img-src`、`connect-src` 等其余指令写在 `directives` 里
- `kind: 'attribute'` 的来源只接受 `'none'` / `'unsafe-hashes'` / `'unsafe-inline'` / `'report-sample'`（Astro 配置校验会拦下其他值）
- 对 style 属性放开 `'unsafe-inline'` 的风险远小于放开脚本：注入的样式能做的是改外观，不能执行代码
- 不要给 `script-src` 加 `'unsafe-inline'`：Astro 会因此停止生成所有脚本 hash，等于关掉 CSP 的主要保护

### 审计脚本：csp-audit.mjs

```bash
pnpm build
node .claude/skills/security-guard/scripts/csp-audit.mjs
```

逐页核对「会执行的内联脚本 / 内联样式 / style 属性 / 外部脚本」是否被该页 CSP 放行，缺什么就打印要加的 hash 或配置。
- 未开启 CSP 时：列出页面里的内联脚本及其 hash，作为开启前的参考
- 开启后有未覆盖项：退出码 1，逐页列出
- 它**不区分**内容在 meta 之前还是之后，一律要求放行（理由见上文「两个推论」），所以会比浏览器的实际表现更严格
- 不要在同一目录里与其他会话并行 `pnpm build`；需要试配置时用框架外的临时副本（`git archive` 导出到同盘普通目录，用完删除）

**改了 `ThemeScript.astro`、`Analytics.astro` 或新增 `is:inline` 脚本后必须重跑。**

### CSP 的限制

| 限制 | 处理 |
|------|------|
| meta 形式的 CSP 不支持 `frame-ancestors`、`report-uri` | 防嵌套靠 nginx 的 `X-Frame-Options` |
| dev 模式不生效 | 用 `pnpm build && pnpm preview` 测 |
| 不支持 `<ClientRouter />` | 本框架默认用 CSS 跨文档过渡，不受影响；改用 ClientRouter 前先权衡 |
| 不支持 Shiki 代码高亮（内联样式） | 文章含代码块又要 CSP 时，改用 Prism |

浏览器验证：preview（`http://localhost:4329/`）打开首页、列表页、详情页，确认深色模式、筛选、过渡正常，DevTools 控制台没有 `Refused to …` 报错。
注意：智码的 `browser_console` 实测**抓不到**浏览器自己打印的 CSP 违规提示（样式被拦时它返回空数组），别拿它当「没问题」的证据，改用计算值核对。
形变动画可以直接量：在详情页 `browser_eval_result(label, "getComputedStyle(document.querySelector('img[fetchpriority]')).viewTransitionName")`，被 CSP 拦时返回 `none`，正常时返回 `cover-<id>`。

## 5. 密钥与环境变量

- `.env` 已在 `.gitignore`；`.env.example` 只写变量名
- **只有 `PUBLIC_` 前缀的变量会进浏览器产物**；同步脚本用的 token（如 `SYNC_GITHUB_TOKEN`）不能加 `PUBLIC_`
- 同步脚本在构建前运行，token 只存在于执行环境；**镜像构建不跑同步**，所以镜像里不需要任何 token
- 远程平台凭据（推送、对象存储）走 Sigil，不写进 `.env`、不出现在对话里

构建后抽查有没有密钥漏进产物：

```bash
grep -rn "SYNC_\|TOKEN\|SECRET\|sk-\|ghp_" dist --include=*.html --include=*.js | head
```

## 6. 依赖与供应链

| 做法 | 位置 |
|------|------|
| 锁文件入库，安装用 `--frozen-lockfile` | `pnpm-lock.yaml`、`Dockerfile` |
| 只允许白名单包执行安装脚本 | `package.json` 的 `pnpm.onlyBuiltDependencies`（esbuild、sharp） |
| 定期审计 | `pnpm audit --prod`（只看会进产物的依赖）；`pnpm outdated` |
| 新增依赖前 | 看周下载量、维护状态、是否真的需要（能用几行代码解决的不引包） |

- `pnpm audit` 报的漏洞先判断是否在运行时路径上：静态站的构建期工具（Vite 插件等）漏洞通常不影响线上
- 新增需要安装脚本的包时，才把它加进 `onlyBuiltDependencies`，并在提交说明里写原因

## 7. 第三方脚本

每接一个第三方脚本（统计、评论、客服、广告），都等于把页面的执行权分给对方：

- 优先选隐私友好、可自托管的方案（Umami 自托管），见 `analytics`
- 只在生产构建输出（`Analytics.astro` 的做法），开发时不加载
- 开启了 CSP 的站点：外部脚本来源加进 `scriptDirective.resources`，内联引导片段加 hash，然后跑 `csp-audit.mjs`

## 8. 第三方 iframe（如 B 站外链播放器）

iframe 等于在页面里开一个别人控制的窗口。数据源里的「嵌入地址」同样当不可信输入：域名被换成钓鱼页、协议被换成 `javascript:`，都会直接出现在你的页面上。

### 8.1 数据层：只存 ID，或 https + 域名白名单

首选**只存平台 ID、地址在代码里拼**，数据里根本没有可被篡改的 URL：

```ts
// src/content.config.ts —— works 集合里加字段（B 站 BV 号是 BV + 10 位字母数字）
// 单独一个字段，不复用 id：「有没有 bvid」就是「本页有没有播放器」的判据，非 B 站作品留空即可
bvid: z.string().regex(/^BV[0-9A-Za-z]{10}$/, 'BV 号格式不对').optional(),
```

同步源的映射要同时写上 `bvid: video.bvid`（见 `data-sync` 的 B 站映射）；映射是逐字段显式写的，schema 加了字段而映射没加，跑一次同步这个字段就没了。

```ts
// src/lib/<业务>.ts —— 播放器地址只在这里拼，参数都做编码
export function biliPlayerUrl(bvid: string): string {
  return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&autoplay=0`;
}
```

数据源只能给完整地址时，schema 里限定 **https + 域名白名单**（`refine` 在协议校验之后再查主机名）：

```ts
const EMBED_HOSTS = ['player.bilibili.com'];

embed: z
  .url({ protocol: /^https$/ })
  .refine((value) => EMBED_HOSTS.includes(new URL(value).hostname), { message: '嵌入地址的域名不在白名单' })
  .optional(),
```

白名单写精确主机名，不用 `endsWith('bilibili.com')` 这类后缀匹配（`evilbilibili.com` 也会通过）。
只存 ID 的做法里主机名是代码常量，不需要再校验；白名单列表仍建议放进 `site.config.ts`，作为以后 CSP `frame-src`（8.3）的单一来源。

### 8.2 渲染层：属性写全

```astro
<iframe
  src={biliPlayerUrl(work.data.bvid)}
  title={`${work.data.title}（B 站播放器）`}
  loading="lazy"
  width="960"
  height="540"
  class="aspect-video w-full rounded-[var(--radius-card)] border border-line"
  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen
></iframe>
```

| 属性 | 为什么 |
|------|-------|
| `title` | 读屏软件靠它说明 iframe 是什么；每个 iframe 写不同的标题 |
| `loading="lazy"` | 播放器脚本很重，首屏不需要就别抢带宽（也见 `performance-doctor`） |
| `width` / `height` 或比例容器 | 避免加载后撑开页面造成 CLS |
| `sandbox` | 默认禁止一切，再按需放开。上面是播放器的起步集合：`allow-scripts` + `allow-same-origin`（播放器要跑自己的脚本和存储）、`allow-popups`（点「去 B 站」会开新窗口）、`allow-popups-to-escape-sandbox`（HTML 规范：不加时新窗口会继承本 iframe 的沙箱限制，打开的 B 站页面功能不全；按规范推断，**待真实视频实测**）、`allow-presentation`。**上线前实测播放、全屏、跳转**，缺什么补什么；不要加 `allow-top-navigation`（允许嵌入页把你的整页跳走） |
| `referrerpolicy` | 只把本站来源（origin）告诉对方，不带完整路径与查询参数；这也是浏览器默认值，写明防止被全局策略改掉。播放器若因 Referer 校验拒绝播放，按平台说明处理，不要改成 `unsafe-url` |
| `allowfullscreen` | 全屏由这个属性控制，不是 sandbox 关键字 |

- iframe 一律在 `.astro` 里用属性渲染，不用 `set:html` 拼 iframe 字符串
- 播放器旁保留醒目的「去 B 站观看」按钮（点赞、投币、关注只在站内生效，见 `data-sync`）
- 在意首屏与隐私时可做「点击后才加载」：先放封面 + 播放按钮，点击再插入 iframe（需要一小段 `<script>`，开了 CSP 时它由 Astro 自动加 hash）。
  🔴 **与 VideoObject 互斥**：这种页面的静态 HTML 里没有播放器，Google 不认为用户能在本页观看，不能标 VideoObject（`seo-meta` §3），
  `check:seo` 也会报错。要视频结构化数据就直接渲染 iframe，`loading="lazy"` 已经能把加载推迟到滚动到附近时

### 8.3 CSP：用 `frame-src` 限定可嵌入的来源

开了 `security.csp` 时，把允许嵌入的来源写进 `directives`（`frame-src` 属于 `directives` 可写的指令）：

```ts
security: {
  csp: {
    directives: ["frame-src https://player.bilibili.com"],
    // scriptDirective / styleDirective 见第 4 节
  },
},
```

- 没有 `frame-src`（也没有 `default-src`）时，任何来源都能被嵌入；写了之后，数据被污染塞进别的域名也会被浏览器拒绝加载，与 8.1 的白名单形成两道防线
- 🔴 meta 形式的 CSP 只约束它之后的内容（见第 4 节）；iframe 在 body 里，受约束
- `X-Frame-Options: SAMEORIGIN` 管的是「别人能不能嵌入**你的**页面」，和你嵌入别人无关，两者不冲突
- nginx 的 `Permissions-Policy` 已禁用摄像头、麦克风、定位，这些限制同样作用于 iframe；播放器用不到它们

## 上线前安全检查清单

- [ ] 外部数据的 URL 字段用 `z.url({ protocol: /^https?$/ })`
- [ ] 全站没有用 `set:html` / `dangerouslySetInnerHTML` 渲染外部数据（`grep -rn "set:html\|dangerouslySetInnerHTML" src`）
- [ ] 外链 `target="_blank"` 都带 `rel="noopener"`，外部来源链接加 `nofollow ugc`
- [ ] 每个 nginx location 都 include 了安全头片段；线上 curl 抽查静态资源与页面都有四个安全头
- [ ] HSTS 在 HTTPS 终结处配置
- [ ] 开启 CSP 的站点：`csp-audit.mjs` 通过，DevTools 控制台无 `Refused to` 报错，详情页封面 `viewTransitionName` 不是 `none`
- [ ] 第三方 iframe：地址只存 ID 或经 https + 域名白名单校验；`title` / `loading` / `sandbox` / `referrerpolicy` 写全；开了 CSP 的写了 `frame-src`
- [ ] `grep` 构建产物无 token / 密钥
- [ ] `pnpm audit --prod` 无高危漏洞（或已评估不在运行时路径）

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `deployment-guide` | 安全头与 HSTS 在服务器上的落地 |
| `data-sync` | 同步阶段的数据清洗与字段校验 |
| `content-collections` | schema 里的校验规则写法 |
| `analytics` | 统计方案选择与隐私合规 |
