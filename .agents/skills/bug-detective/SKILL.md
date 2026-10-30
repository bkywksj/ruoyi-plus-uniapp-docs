---
name: bug-detective
description: 排查已发生的问题：构建失败、schema 不符、水合失败、样式不生效、图片、SEO 校验、数据同步、nginx 与 Windows 环境坑，先复现再定位。触发词：Bug、报错、异常、不工作、白屏、构建失败、样式不生效、水合失败、页面空白、404了、排查、定位问题
---

# Bug 排查指南

## 何时使用

- 构建 / 类型检查报错，需要定位原因
- 页面空白、白屏、404了、样式不生效
- React island 不响应点击、水合失败（hydration mismatch）
- 数据同步失败、数据没更新、封面图裂
- check:seo 报错或上线后搜索结果显示异常
- "为什么不工作"、"怎么不生效"

其他常见说法：hydration、调试、为什么、出问题、失败、不生效、无效、找不到原因。

## 排查纪律（先读）

1. **先复现，再下结论**：拿到错误原文（构建输出、浏览器控制台、`check:seo` 输出），不凭描述猜。
2. **先定位层，再定位行**：按下方「分层定位」确认问题在哪一层，避免在页面里修一个数据问题。
3. **一次只改一处**：改完立刻用最小命令验证（见每条问题的「验证」），不叠加多个猜测性修改。
4. **修完跑验证门**：`pnpm verify` 全绿才算修好；UI 问题再截图确认。
5. **记录**：同一个坑第二次出现，走 `exp-sediment` 沉淀，别让它出现第三次。

---

## 快速诊断入口

### 错误关键词索引

| 看到的错误 / 现象 | 最可能的原因 | 跳转 |
|------------------|-------------|------|
| `data does not match collection schema` | 集合数据与 schema 不符 | 问题库 #1 |
| `Hydration failed` / `didn't match the client` | 服务端与客户端首次渲染不一致 | 问题库 #2 |
| dev 下访问 `/works` 得到 404，`/works/` 正常 | `trailingSlash: 'always'` | 问题库 #3 |
| 远程封面构建后仍是外链原图 / 图裂 | 域名未加入 `site.imageDomains` | 问题库 #4 |
| 构建报标签未闭合 / 非法嵌套 | Astro 7 Rust 编译器严格校验 | 问题库 #5 |
| 写了 Tailwind 类但没有样式 | 动态拼接类名 / 文件不在扫描范围 | 问题库 #6 |
| 打开页面先白后黑（闪烁） | 主题脚本位置或写法不对 | 问题库 #7 |
| 页面跳转没有形变动画、控制台报 view-transition-name 重复 | 同页同名 | 问题库 #8 |
| `getImage` 在客户端报错 | 在 island 里调了服务端 API | 问题库 #9 |
| 中英混排时英文单词粘在一起 | `compressHTML` 被改回默认 `'jsx'` | 问题库 #10 |
| Markdown 的 remark / rehype 插件不生效 | Astro 7 默认 Sätteri 管线 | 问题库 #11 |
| island 渲染出来了但点击没反应 | 漏写 `client:*` 或 props 不可序列化 | 问题库 #12 |
| `pnpm sync` 报「条目数骤降」「id 重复」「缺少环境变量」 | 数据同步保护触发 | 问题库 #13 |
| `astro check` 大量莫名类型错误 | TypeScript 被升到不兼容版本 | 问题库 #14 |
| 图片优化报 sharp 相关错误 | 依赖构建脚本被 pnpm 拦截 | 问题库 #15 |
| `check:seo` 报 canonical / 描述问题但页面看起来没问题 | SEO 静默错误，或校验的是旧 `dist/` | 问题库 #16 |
| 开启 CSP 后卡片→详情的封面形变没了 / 部分样式丢失 | body 里的 `style=""` 属性被 CSP 拦截 | 问题库 #20 |
| 慢网络下，页面刚打开时在搜索框里打的字被清空 | 水合时用默认状态覆盖了已输入内容 | 问题库 #2 |
| `http://127.0.0.1:4329/` 连接被拒绝，`localhost` 正常 | 本机 localhost 解析到 IPv6，Astro 只监听 `::1` | 问题库 #19 |
| 线上 `/works` 跳到 `http://host:80/works/` | nginx 绝对跳转 | 问题库 #17 |
| 线上某些路径缺安全响应头 | nginx `add_header` 不继承 | 问题库 #18 |
| 当前目录冒出一个叫 `nul` 的文件 | Windows 下用了 `> nul` | 问题库 #19 |
| bash 写的文件 python / node 读不到 | 用了 `/tmp` | 问题库 #19 |
| PowerShell 里 pnpm 成功却标红一片 `NativeCommandError` | 给原生程序加了 `2>&1` | 问题库 #19 |

---

## 问题诊断决策树

### 构建失败（`pnpm build` 红）

```
先看失败在哪个阶段
├── astro check 阶段（Result: N errors）
│   ├── 报在 .astro / .ts 的类型错误 → 按行号修；集合字段类型来自 content.config.ts
│   └── 几乎所有文件都报错 → 问题库 #14（TS 版本）或先跑 pnpm astro sync 重新生成类型
├── [content] Syncing content 阶段
│   └── data does not match collection schema → 问题库 #1
├── [build] 渲染某个路由时报错（generating static routes）
│   ├── getStaticPaths 相关 → params 必须是字符串；`[id]` 这种单段参数不能含 `/`（带子目录的 id 要用 `[...id]` 剩余参数）；进 URL 的 id 只用 `[A-Za-z0-9_-]`
│   ├── Cannot read properties of undefined → 引用的条目 / 分类不存在，查数据
│   └── getImage / 远程图片下载失败 → 问题库 #4，或网络问题（构建机能否访问该图床）
└── 编译阶段（Rust 编译器）
    └── 标签未闭合 / 非法嵌套 → 问题库 #5
```

### 页面显示不对

```
先确认看的是哪个版本
├── dev（pnpm dev）和构建产物（pnpm preview）表现不同？
│   └── 以 preview 为准；dev 下 Vite 按需编译，行为可能与产物有差异
├── 整页 404
│   ├── URL 缺结尾斜杠 → 问题库 #3
│   └── 动态路由没生成这个 id → 查 getStaticPaths 返回值与数据文件
├── 内容缺失 / 旧数据
│   ├── 数据文件没更新 → 查 src/data/*.json 的 git diff，看 pnpm sync 输出
│   └── dev 缓存 → 重启 dev；仍不对再删 .astro/ 后 pnpm astro sync
├── 样式不生效 → 问题库 #6
├── 深色模式异常 → 问题库 #7；检查是否用了原始色值而非语义令牌
└── 图片不显示 → 问题库 #4；检查 alt / width / height 是否齐全
```

### 交互不工作（island）

```
打开浏览器控制台（智码 browser_console 可读）
├── 有 Hydration 报错 → 问题库 #2
├── 没有任何报错，也没有加载组件 JS → 漏写 client:* → 问题库 #12
├── 报 xxx is not a function → props 里传了函数 → 问题库 #12
├── 交互生效但 URL 参数丢失 → 检查「读完 URL 前不回写 URL」的顺序（参考 WorksExplorer 的 ready 状态）
└── 水合前输入的文字在水合后被清空 → 问题库 #2「水合前的用户输入」
```

### SEO / 收录异常

```
先 pnpm build && pnpm check:seo
├── 有 error → 按报错逐条修（问题库 #16）
├── 全绿但线上不对
│   ├── site.url 还是 example.com → 改 src/site.config.ts 后重新构建部署
│   └── 线上跑的是旧产物 → 确认部署的镜像 / 目录是最新构建
└── 搜索结果标题 / 摘要不对 → 查该页 title / description 的来源，是否多页共用
```

---

## 分层定位指南

### 快速判断问题在哪一层

| 层 | 位置 | 典型症状 | 最快验证 |
|----|------|---------|---------|
| ① 数据 | `src/data/*.json`、`src/content/**` | 字段缺失、值不对、条目缺少 | 直接读数据文件；`pnpm sync <name> --dry-run` |
| ② 集合 | `src/content.config.ts` | schema 报错、类型不对 | `pnpm astro sync` |
| ③ 查询 | `src/lib/*.ts` | 排序 / 筛选 / 关联错误 | 写个单测或在页面临时打印 |
| ④ 页面渲染 | `src/pages/**`、`.astro` 组件 | 结构错、404、字段没显示 | `pnpm build:fast` 后看 `dist/` 里对应 HTML |
| ⑤ 样式 | `src/styles/global.css`、Tailwind 类 | 没样式、颜色不对、暗色异常 | 浏览器检查元素：比对声明值与 computed 值 |
| ⑥ island | `src/components/islands/**` | 点击无效、水合报错 | 浏览器控制台 |
| ⑦ 构建产物 / SEO | `dist/` | canonical / JSON-LD / robots 错 | `pnpm check:seo` |
| ⑧ 托管 | nginx / Docker / CDN | 线上与本地不一致 | `pnpm preview` 本地正常 → 问题在托管层 |

> 排查样式类「写了但没生效」时，统一入口是**比对声明值与 computed 值**，不要只读源码。

### 各层常用命令

```bash
pnpm astro sync                  # 重新生成集合类型（改 schema 后）
pnpm build:fast                  # 只构建不做类型检查，快速看产物
pnpm build                       # astro check + 构建
pnpm check:seo                   # 扫描 dist/ 的 SEO/GEO 字段
pnpm test                        # src/lib 单元测试
pnpm sync <name> --dry-run       # 数据同步试运行，不写文件
pnpm preview --port 4329         # 预览构建产物
```

查看某页产物：`dist/<路径>/index.html`（如 `dist/works/sample-01/index.html`）。
搜代码时限定目录：`grep -rn "关键词" src --include=*.astro`，不要扫进 `dist/` 与 `node_modules/`。

---

## 本项目特有问题库（重点！）

### 1. 集合数据与 schema 不符

**现象**：构建报 `**works** → **sample-07** data does not match collection schema.`，后面跟具体字段。

**常见原因**：
- 必填字段缺失（如 `summary`）
- 日期格式无法解析（`date` 用 `z.coerce.date()`，接受 `2026-09-25`，不接受 `2026年9月25日`）
- `url` 不是合法 URL，或协议不是 http / https（schema 用 `z.url({ protocol: /^https?$/ })`，`javascript:`、`ftp:` 会被拒——这是故意的安全限制，别为了过校验改回裸 `z.url()`）
- `id` 不满足正则（只能 `[A-Za-z0-9_-]`，因为会进 URL）
- `category` 引用的分类 id 在 `categories.json` 里不存在

**排查**：读报错里的集合名 → 条目 id → 字段名，直接打开对应数据定位；数据来自同步源时，回到同步源的字段映射修，不要手改生成的 JSON。

**验证**：`pnpm astro sync` 无报错。

### 2. Hydration mismatch（水合不一致）

**现象**：控制台报 `Hydration failed` / `didn't match the client`，island 局部闪一下或状态错乱。

**原因**：服务端渲染和浏览器首次渲染结果不同。常见触发：
- 渲染时读 `window` / `localStorage` / `location.search`
- 渲染时用 `Date.now()`、`Math.random()`、当前时区格式化日期
- 服务端和客户端拿到的 props 不同

**正确做法**：首次渲染只用 props 与默认状态，浏览器相关的值放进 `useEffect` 里读：

```tsx
const [query, setQuery] = useState('');          // 默认状态，服务端与客户端一致
useEffect(() => {
  setQuery(new URLSearchParams(location.search).get('q') ?? '');  // 水合后再读 URL
}, []);
```

日期一律在服务端用 `formatDate()` 格式化成字符串再传入（参考 `WorkCardData.date`）。

**水合前的用户输入**：island 用 `client:load` 时，HTML 先到、JS 后到，慢网络下用户可能在水合完成前就开始打字；水合后的首个 `useEffect` 若直接 `setQuery(URL 参数)`，就会把已输入的文字清掉。
做法：在首个 `useEffect` 里先读输入框 DOM 上已有的值（`useRef` 拿到 input），有值就优先用它，没有再用 URL 参数（参考 `WorksExplorer.tsx` 的 `inputRef`）。回归用例见 `tests/e2e/works.spec.ts` 里拖慢 island 脚本的那条。

### 3. trailingSlash 导致 404

**现象**：dev 下访问 `/works` 得到 404，`/works/` 正常；或站内某个链接点进去 404。

**原因**：框架设置 `trailingSlash: 'always'`，保证 canonical、sitemap、站内链接一致。

**解决**：站内链接一律带结尾斜杠，用 `workPath()` / `categoryPath()` 这类函数生成；带扩展名的端点（`/robots.txt`、`/llms.txt`）不加斜杠。线上 nginx 会把目录请求补斜杠跳转，但站内链接不能依赖跳转（多一次重定向，且 canonical 会与链接不一致）。

### 4. 远程图片没有被优化 / 图裂

**现象**：构建后封面仍是外链原图；或在浏览器里显示裂图（外部平台防盗链）。

**原因**：`resolveCover()` 只对 `site.imageDomains` 里的域名做构建期下载与转 WebP，其他外链原样输出，浏览器直连外部图床时会被防盗链拦截。

**解决**：把图床域名（精确的 hostname，不是主域名）加进 `src/site.config.ts` 的 `imageDomains`，重新构建。构建机必须能访问该图床。

**验证**：`dist/` 里对应页面的 `<img src>` 指向 `/_astro/*.webp`。

### 5. Rust 编译器报标签未闭合 / 非法嵌套

**现象**：Astro 7 构建时报 HTML 结构错误，而同样的代码在旧版本能过。

**原因**：Astro 7 的 Rust 编译器严格校验 HTML：未闭合的非空元素直接报错，语义非法的嵌套（如 `<p>` 里放 `<div>`、`<a>` 里套 `<a>`）不再自动修正。

**解决**：补全闭合标签；把块级元素移出 `<p>`；整卡可点击用「链接的 `::after` 铺满卡片」的写法（见 `WorkCard.tsx`），不要 `<a>` 套 `<a>`。

### 6. Tailwind 类写了但没有样式

**原因与解决**：

| 原因 | 解决 |
|------|------|
| 类名是动态拼出来的（`` `bg-${color}` ``） | Tailwind 按纯文本扫描，拼接的类名扫不到。改成完整类名映射表：`{ brand: 'bg-brand', muted: 'bg-surface' }[tone]` |
| 文件在 `.gitignore` 忽略的目录里 | Tailwind v4 不扫描被 git 忽略的文件；用 `@source "<路径>"` 显式登记 |
| 用了原始色值类（`text-gray-500`）后又改了主题 | 这不是 bug 而是违规：改用语义令牌，深色模式才会跟着变 |
| 想 `@apply` 自己定义的类（或给它加 `hover:` 等变体）却报错 / 不生效 | Tailwind v4 里 `@layer components` / `@layer utilities` 下的普通类**不会**变成工具类，`@apply` 和变体都用不了；要复用就用 `@utility <名字> { … }` 注册（官方升级指南）。只是给一组元素写样式（如 `.prose-content`）则直接写普通 CSS，在里面 `@apply` 现成的工具类 |
| 声明被更具体的选择器覆盖 | 浏览器检查元素看 computed 值是被谁覆盖的 |

### 7. 深色模式闪烁（先白后黑）

**原因**：主题脚本必须在首屏绘制前同步执行。以下改动都会导致闪烁：
- 把 `ThemeScript.astro` 里的 `<script is:inline>` 改成普通 `<script>`（会被打包成模块，延迟到 DOM 解析后执行）
- 把 `<ThemeScript />` 从 `<head>` 移到 `<body>`
- 在 island 里用 state 控制 `dark` 类

**解决**：保持 `BaseLayout` 里 `<ThemeScript />` 在 `<head>` 最前面、`is:inline` 不变。

### 8. view-transition-name 重复 / 形变动画不生效

**现象**：点击卡片进入详情页没有封面形变；控制台提示 view-transition-name 重复。

**原因**：同一页面里两个元素同时拥有相同的 `view-transition-name`，浏览器会放弃这次过渡。

**框架约定**：列表卡片只在悬停 / 聚焦时才拿到名字（`.vt-card:is(:hover, :focus-within) .vt-cover`），详情页封面固定命名 `cover-<id>`。同一条作品在一个页面里出现两次时，不要给两处都写固定名字。

**其他原因**：浏览器不支持跨文档视图过渡（正常跳转，不算 bug）；用户开启了「减少动态效果」（框架已主动关闭动画）。

### 9. island 里调用 getImage 报错

**原因**：`getImage()` 是服务端 API，Astro 6 起在客户端调用直接抛错。

**解决**：在页面 frontmatter 或 `src/lib/*.ts` 里用 `resolveCover()` / `getImage()` 算好 `{ src, srcSet, width, height }`，当 props 传给 island（参考 `toCardData()` → `WorkCardData.cover`）。

### 10. 中英混排单词粘连

**原因**：Astro 7 默认 `compressHTML: 'jsx'`，会删除行内元素之间的空白。框架在 `astro.config.ts` 里显式设置了 `compressHTML: true`。

**解决**：确认 `astro.config.ts` 里 `compressHTML: true` 没被删；个别位置需要强制空格时写 `{' '}`。

### 11. remark / rehype 插件不生效

**原因**：Astro 7 默认用 Sätteri 处理 Markdown，不再走 unified（remark / rehype）管线。

**解决**：需要 remark / rehype 插件时安装 `@astrojs/markdown-remark` 并按其文档配置；或把插件改写成 Sätteri 的 MDAST / HAST 插件。改之前先用 context7 查 `/withastro/docs` 确认当前配置方式。

### 12. island 渲染了但没有交互

| 原因 | 解决 |
|------|------|
| 忘了写 `client:*` 指令 | 组件只会被渲染成静态 HTML。加 `client:load` / `client:visible` / `client:idle` |
| props 里有函数 | 函数无法序列化到浏览器。只传数据（支持：普通对象、数组、字符串、数字、Date、Map、Set、URL 等），行为写在组件内部 |
| 从 `.astro` 给 React 组件传了多个子元素并期望当 React 节点用 | 默认子内容按字符串处理；改用 props 或具名插槽 |
| 读了非 `PUBLIC_` 前缀的环境变量 | 浏览器端只能拿到 `PUBLIC_` 前缀变量；其他变量在服务端读取后作为 props 传入 |

### 13. 数据同步失败

`scripts/sync/run.mjs` 的保护是**故意**的，失败时会保留上一版数据，不是 bug：

| 输出 | 含义 | 处理 |
|------|------|------|
| `返回了空数组` | 接口返回空 | 检查接口参数、鉴权、风控；不要为了「让它过」改运行器 |
| `id 重复：xxx` | 映射后的 id 不唯一 | 修同步源的 id 取值 |
| `条目数从 N 骤降到 M` | 数量下降超过 50% | 确认是真实变化再加 `--force` |
| `缺少环境变量 XXX` | `.env` 没配 | 按 `.env.example` 补 |
| `HTTP 4xx` 立即失败 | 客户端错误，重试无用 | 查鉴权 / 签名 / 参数 |
| 反复 `请求失败，xxxms 后重试` | 限流或服务端错误 | 加大翻页间隔；在国内网络环境运行（部分平台对海外 IP 风控更严） |

排查时先 `pnpm sync <name> --dry-run`，不写文件、只看条数与差异。

### 14. astro check 大量类型错误

**原因**：`@astrojs/check` 对 TypeScript 有版本要求（当前为 5 或 6）。把 `typescript` 升级到不兼容的大版本后，检查会整体失效。

**解决**：`package.json` 里 `typescript` 保持在 `@astrojs/check` 支持的范围（`npm view @astrojs/check peerDependencies` 查看）；改完 `pnpm install`。另外，改 schema 后没重新生成类型也会导致成片报错，先 `pnpm astro sync`。

### 15. sharp 相关错误

**原因**：pnpm 10 默认不运行依赖的安装脚本，框架在 `package.json` 的 `pnpm.onlyBuiltDependencies` 里放行了 `sharp` 与 `esbuild`。这个字段被删掉、或新增了需要安装脚本的依赖时就会出问题。

**解决**：确认 `onlyBuiltDependencies` 包含所需包，然后重新 `pnpm install`。

### 16. check:seo 报错

| 报错 | 原因 | 解决 |
|------|------|------|
| `canonical 应为 X，实际 Y` | 页面手写了 canonical，或把它写死成站点根地址 | 删掉手写的，交给 `SEOHead` |
| `og:url 应恰好 1 个` | 页面在 `slot="head"` 里又写了一份 | 只保留 `SEOHead` 输出的那个 |
| `描述重复（N 页共用）` | 多页没传 description，都落到了站点默认描述 | 每个页面传各自的 description，列表 / 分类页带上数量或分类名 |
| `<h1> 应恰好 1 个` | 卡片标题用了 h1，或页面漏写 h1 | 页面标题 h1，区块 h2，卡片 h2 / h3 |
| `JSON-LD 解析失败` | 手写了 `JSON.stringify` 且内容含特殊字符 | 用 `serializeJsonLd()` |
| `robots.txt 没有 X 的显式分组` / `robots.txt 中 X 应为「Allow: /」`（或 Disallow） | `robots.txt.ts` 没有按 `src/data/ai-crawlers.json` 逐个输出，或改了 JSON 的 `allow` 却没重新构建 | robots 与 check-seo 共用这份 JSON（每项 `{ name, purpose, allow }`），只改 JSON 后重新 `pnpm build` |
| 警告「`User-agent: *` 组整站 Disallow」 | 通配组被写成了 `Disallow: /` | 确认不是误把全站屏蔽；只想拒绝训练类爬虫时，把对应项的 `allow` 改成 `false`，不要动通配组 |
| 页面看起来已经修好，校验仍报旧问题 | 校验的是旧的 `dist/` | 先 `pnpm build` 再 `pnpm check:seo`（或直接 `pnpm verify`） |

### 17. 线上跳转到内部端口

**现象**：访问 `https://域名/works` 被 301 到 `http://域名:80/works/`。

**原因**：nginx 给目录补斜杠时默认生成绝对地址，带上了容器内部的协议和端口。

**解决**：`deploy/nginx/default.conf` 里保留 `absolute_redirect off;`。

### 18. 部分路径缺少安全响应头

**原因**：nginx 的 `add_header` 不会从 server 层继承到「自己也写了 `add_header`」的 location。

**解决**：每个 location 都 `include /etc/nginx/snippets/security-headers.conf;`（框架配置已这样组织，新增 location 时照做）。用 `curl -I` 分别检查 HTML 页面和 `/_astro/` 资源的响应头。

### 19. Windows 本机环境坑

| 现象 | 原因 | 正确做法 |
|------|------|---------|
| 项目里出现名为 `nul` 的文件 | 用了 `> nul` 重定向 | `> /dev/null 2>&1`；Stop hook 会清理残留 |
| bash 写进 `/tmp` 的文件 python / node 读不到 | Git Bash 的 `/tmp` 与原生程序理解的不是同一处 | 用 scratchpad 绝对路径、项目内 `logs/` 或 `$TEMP` |
| PowerShell 里 pnpm 输出被包成 `NativeCommandError` | 给原生程序加了 `2>&1` | 去掉 `2>&1`（pre-tool-use hook 会自动摘掉） |
| 时间少 8 小时 | 用了 `TZ=Asia/Shanghai date` | 裸 `date '+%Y-%m-%dT%H:%M:%S%:z'` |
| heredoc 脚本报 `unexpected EOF` | 内联长脚本引号嵌套 | 用 Write 工具落成文件再执行 |
| 中文输出乱码 | 控制台编码 | Python 加 `PYTHONIOENCODING=utf-8`；PowerShell 先设 `[Console]::OutputEncoding = [Text.Encoding]::UTF8` |
| 端口被占用 | 其他会话的 dev server | Astro dev 会自动顺延端口；停自己的服务用 `npx kill-port <端口>`，**不按名字杀 node 进程**（hook 会拦） |
| `http://127.0.0.1:4321/` 或 `:4329/` 连接被拒绝，`localhost` 能打开 | 本机 `localhost` 先解析到 IPv6 `::1`，Astro dev / preview 只监听 `[::1]`（`netstat -ano \| findstr :4329` 可见） | 地址一律写 `http://localhost:<端口>/`；确需 IPv4 时启动加 `--host 127.0.0.1` |
| 本地 `git push` / `git fetch` / `git add -A` / `git stash` 等被 hook 拦下 | pre-tool-use hook 的多会话与凭据保护 | 远程操作走 Sigil；逐个 `git add <文件>`；不要换等价写法绕过 |
| 在 `C:\Users\…\AppData\Local\Temp` 下的临时副本里构建报 `Named export 'parseCookie' not found` | 曾实测出现、根因未查明；同一份代码放在普通盘符目录构建正常 | 需要临时副本验证时放到项目同盘的普通目录（如 `E:\my\AI框架\_tmp_xxx`，用 `git archive` 导出），用完删除 |
| `node` 脚本复制目录时进程直接退出，没有任何报错（退出码 `-1073740791` / `0xC0000409`，Git Bash 里显示 127） | Node 22.20 的 `fs.cpSync` 遇到含中文的源路径（如 `E:\my\AI框架\…`）会让进程崩溃，实测在 Git Bash 与 PowerShell 里都复现 | 脚本里用递归 `readdirSync` + `copyFileSync` 逐文件复制（`sync-agents-skills.mjs` 的 `copyDir` 就是这么写的）；一次性操作可用 PowerShell `Copy-Item` 先拷到纯 ASCII 路径 |
| 文档里要写的 `\u003c` 落盘后变成了 `<` 或 `003c` | GNU sed 替换串里的 `\u` 是「下一个字符转大写」指令（实测）；Edit 工具也会把参数里的 `\uXXXX` 解码成字符（实测，不是每次都发生） | 写含反斜杠转义序列的文本后，用 `grep` / `od -c` 按字节核对；改不对时写个小脚本，用 `String.fromCharCode(92)` 拼出反斜杠再写入 |
| 构建成功但页数骤减（动态路由的页面全没了） | 同一目录里两个 `astro build` / `astro sync` 并行跑，共用的内容缓存被搅乱，`getStaticPaths` 拿到空集合 | 同一目录同一时间只跑一个构建；重跑 `pnpm build` 即可恢复；`pnpm check:seo` 的站内死链检查会报出来（实测踩过）。多会话并行开发用 `claude --worktree <名字>`，每个 worktree 的 `.astro/` 缓存独立 |

### 20. 开启 CSP 后形变动画 / 部分样式失效

**现象**：`astro.config.ts` 开了 `security.csp`，构建成功，但卡片 → 详情页的封面形变没了，控制台（浏览器 DevTools）有 `Refused to apply inline style` 一类报错。

**原因**：Astro 把 CSP 以 `<meta http-equiv="content-security-policy">` 注入在 `<head>` 末尾，它之后的 `style=""` 属性默认被 `style-src` 拦截。框架里 body 内的 `style` 属性有：卡片的 `--vt-name`、详情页封面的 `view-transition-name`。

**解决**：`styleDirective.resources` 加 `{ resource: "'unsafe-inline'", kind: 'attribute' }`，只对 style 属性放行；然后跑 `node .claude/skills/security-guard/scripts/csp-audit.mjs`。完整配置与原理见 `security-guard`「CSP」一节。

---

## 常见问题速查表

| 问题 | 一句话答案 |
|------|-----------|
| 改了 schema 页面报类型错 | `pnpm astro sync` |
| 改了 `.env` 不生效 | 环境变量在构建时内联，重新构建 |
| 新增的页面不在 sitemap 里 | 确认页面不是 404 且不在 sitemap filter 排除范围，重新构建 |
| 列表页只显示前 24 条 | 这是分页加载设计；完整列表在分类页与 sitemap |
| 搜索中文搜不到 | 检查是否换成了按空格分词的搜索库；框架的 `searchItems()` 是子串匹配 |
| 详情页封面没有形变动画 | 浏览器支持与「减少动态效果」设置；见问题库 #8 |
| 构建很慢 | 远程图片首次下载转码耗时，后续构建会复用缓存；检查是否有超大原图 |

---

## 调试建议

1. **看产物比看源码快**：页面结构问题直接打开 `dist/` 里的 HTML。
2. **浏览器侧问题用智码内置浏览器**：`browser_open` 打开 `pnpm preview` 的地址 → `browser_console` 读报错 → `browser_screenshot` 看渲染。
3. **缩小范围**：怀疑数据问题就用一条最小数据复现；怀疑组件问题就在一个空页面里单独渲染它。
4. **别在修 bug 时顺手重构**：修复提交只包含修复本身，`fix(scope): …`。
5. **查官方文档**：涉及 Astro 行为时用 context7 查 `/withastro/docs`，版本差异是本框架最常见的误判来源。

---

## Skill 联动建议

| 定位到的问题 | 转交技能 |
|-------------|---------|
| schema / 集合查询 | `content-collections` |
| 路由、404、动态路由 | `astro-routing` |
| island 状态与水合 | `islands-interaction` |
| 图片 | `image-optimization` |
| 样式 / 令牌 / 暗色 | `design-system`、`ui-components` |
| SEO 字段 | `seo-meta`、`geo-optimization` |
| 数据同步 | `data-sync` |
| 性能（慢、包体积大） | `performance-doctor` |
| 部署 / nginx | `deployment-guide` |
| 需要补回归测试 | `test-development`、`e2e-test` |

---

## 🔗 关联技能边界

本技能专注于**排查已经发生的问题**。以下场景改用其他技能：

| 场景 | 应使用技能 |
|------|-----------|
| 还没出问题，想设计一个功能 | `brainstorm` / `architecture-design` |
| 页面慢、包体积大，要系统性优化 | `performance-doctor` |
| 想检查代码是否符合规范 | `code-patterns` / `/check` |
| 上线前的 SEO 全面验收 | `/seo-check` |
