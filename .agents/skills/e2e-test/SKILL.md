---
name: e2e-test
description: 端到端测试与界面验收：智码浏览器真实渲染、截图比对原型、五维断言并留测试记录，Playwright 脚本（桌面+手机）做回归。触发词：E2E、端到端测试、浏览器测试、截图验收、回归测试、冒烟测试、UI测试、跑一遍、测一遍、Playwright、aicoder浏览器
---

# 端到端测试与界面验收（e2e-test）

## 何时使用

- 开发完一个页面或功能，要在真实浏览器里验收
- UI 任务的「原型保真截图闭环」
- 冒烟 / 回归测试，整站跑一遍并出测试报告
- 验证 island 交互、筛选状态同步 URL、暗色模式、移动端菜单
- 编写或运行 Playwright 脚本

其他常见说法：移动端测试、界面验收、测试报告。

## 一、能力与边界

| 维度 | 说明 |
|------|------|
| 测试对象 | 构建出的静态站（开发服务 4321 或预览服务 4329） |
| 视口 | 桌面（`device="desktop"`）+ 手机（`device="mobile"`），都要测 |
| 主力工具 | 智码 aicoder 内置浏览器 `mcp__aicoder__browser_*` |
| 脚本回归 | Playwright：`playwright.config.ts` + `tests/e2e/*.spec.ts` |
| 产出 | `docs/tests/plans/` 测试计划 + `docs/tests/reports/` 报告 + 截图 |
| 不负责 | 纯函数单测（→ `test-development`）、性能分数（→ `performance-doctor`）、SEO 字段全量校验（→ `pnpm check:seo`） |

两条路线怎么选：

| 情况 | 路线 |
|------|------|
| 刚写完页面，要看效果、比原型、找问题 | aicoder 浏览器（交互式、能截图） |
| `/dev-loop` 的 UI 截图闭环 | aicoder 浏览器 |
| 要一套每次都能自动跑的回归 | Playwright |
| 浏览器工具不可用 | Playwright；再不行对照源码 + 用户截图人工核对 |

---

## 二、前置条件

### 起服务

| 用途 | 命令 | 地址 |
|------|------|------|
| 边改边看 | `pnpm dev` | `http://localhost:4321/`（被占自动顺延，**看启动输出**，不要猜） |
| 验收最终产物（HTML 与线上一致） | `pnpm build:fast && pnpm preview --port 4329` | `http://localhost:4329/` |

- 🔴 地址一律写 `localhost`，不写 `127.0.0.1`：本机 `localhost` 先解析到 IPv6 `::1`，Astro dev / preview 只监听 `[::1]`，访问 127.0.0.1 会被拒绝连接
- 起之前先看端口上是否已有本会话起过的服务：`netstat -ano | findstr :4329`（PowerShell 也可 `Get-NetTCPConnection -LocalPort 4329 -State Listen`），有就复用，不要每轮新起
- 优先用智码任务系统启动：`mcp__aicoder__resolve_and_start_task(project_path=<项目根>, command="pnpm preview --port 4329", port_hint=4329)`（显式传 `command`，进程由智码托管、跨会话存活）
- 智码不可用时才自己用 `run_in_background` 起；结束后只停**自己起的**端口：`npx kill-port 4329`
- 🔴 不按名字杀 node 进程（hook 会拦），不停别人正在用的 dev server
- 🔴 不要在同一目录里并行跑两个 `astro build`（会搅乱内容缓存，动态路由页整批丢失）；构建前确认没有别的会话正在构建

### 开浏览器拿 label（所有操作的第一步）

```
browser_open(url="http://localhost:4329/", device="desktop")   # 返回 { label, url, device, note }
```

- 🔴 **显式传 `device`**：localhost 端口会被不同项目轮流占用，智码可能沿用上个项目的设备记忆
- 之后所有 `browser_*` 调用都带这个 `label`
- 切手机：`browser_set_device(label, device="mobile")`（会自动重载页面）；切回：`device="desktop"`
- 打开本地文件（如原型）：`browser_open(url="file:///E:/my/项目/docs/prototypes/home/index.html")`，本地绝对路径也支持；**不要**用 `browser_navigate` 从 http 页跳到 `file://`（浏览器禁止跨协议跳转），要单独 `browser_open`

---

## 三、aicoder 浏览器工具速查

| 动作 | 工具 | 要点 |
|------|------|------|
| 开窗 / 拿 label | `browser_open` / `browser_list_windows` | 第一步 |
| 跳转 | `browser_navigate(label, url)` | 站内 URL 带结尾斜杠 |
| 看有哪些可操作元素 | `browser_snapshot(label)` | 规划操作前先看，比截图便宜 |
| 点击 | `browser_click(label, selector)` | 只认 CSS 选择器 |
| 输入 | `browser_type(label, selector, text)` | 先清空再输，触发 input 事件（React 受控组件可用） |
| 等待 | `browser_wait_for(label, selector \| urlContains, state?)` | 取代 sleep；只能等「可见 / 消失」 |
| 断言 | `browser_assert(label, assertions[])` | exists / notExists / textContains / textEquals / valueEquals / count / urlContains |
| 读值 | `browser_eval_result(label, expression)` | 复杂判断、读计算值；支持 Promise |
| 执行操作 | `browser_eval(label, script)` | 按文字找元素点击的兜底 |
| 资源请求 | `browser_network(label)` | 看 `/_astro/*`、图片有无 404 |
| 控制台 | `browser_console(label)` | 看 error / 未捕获异常 / hydration 报错 |
| 截图 | `browser_screenshot(label, full_page=true)` | 返回 PNG 路径，用 Read 查看 |
| 元素截图 | `browser_screenshot_element(label, selector)` | 对比单个区块 |
| 切设备 | `browser_set_device(label, device)` | desktop / mobile |

按文字点击的兜底：

```js
// browser_eval 的 script
[...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('实战案例'))?.click();
```

---

## 四、Astro 站点的测试要点

### island 水合判定

- `astro-island` 元素是 `display: contents`，**没有盒子**，永远不「可见」：`browser_wait_for(selector="astro-island")` 会超时，Playwright 里也不能等 `visible`
- 水合完成后 Astro 会移除 `astro-island` 上的 `ssr` 属性 → 以「存在不带 `ssr` 的 `astro-island`」为准：

```js
// browser_eval_result：返回 true 表示页面上所有 island 已水合
new Promise((resolve) => {
  const start = Date.now();
  const timer = setInterval(() => {
    const done = document.querySelectorAll('astro-island[ssr]').length === 0;
    if (done || Date.now() - start > 8000) { clearInterval(timer); resolve(done); }
  }, 100);
});
```

- Playwright 里等价写法是等 `astro-island:not([ssr])` **attached**（`tests/e2e/helpers.ts` 的 `waitForHydration()`）
- 操作 island 前先等水合；否则点击 / 输入可能落在还没接管的静态 HTML 上

### 筛选状态与 URL

`WorksExplorer` 把状态同步到查询参数：`q`（关键词）、`c`（分类 id）、`tag`（可多个）、`sort`（`oldest` / `popular`，默认 `latest` 不写）。
测试要覆盖四件事：操作后 URL 变化 → 刷新后状态保持 → 直接打开带参数的链接能还原筛选 → **水合完成前输入的关键词不会被清掉**（慢网络下用户可能先打字，island 首次 `useEffect` 会优先保留输入框里已有的文字）。

### 暗色模式

- 状态在 `<html class="dark">`，偏好存 `localStorage.theme`（`dark` / `light`）
- 截图对比两种主题时，先 `browser_eval(label, "localStorage.setItem('theme','dark')")` 再刷新，避免测试间互相影响；测完恢复

### 视图过渡

跨文档视图过渡在截图时可能截到过渡中间帧 → 导航后先 `browser_wait_for(urlContains=...)`，再等一小段：
`browser_eval_result(label, "new Promise(r => setTimeout(() => r('ok'), 400))")`。

### 图片加载优先级

`WorkCard` 有两个独立开关：`eager`（不懒加载）与 `priority`（`fetchpriority="high"`）。列表页、分类页前 3 张 `eager`、只有第 1 张 `priority`；详情页头图单独一张 high。
抽查：`browser_eval_result(label, "document.querySelectorAll('img[fetchpriority=high]').length")` 应 ≤ 1。

---

## 五、五维断言（区分「真测试」和「看一眼」）

| # | 维度 | 怎么验 |
|---|------|-------|
| 1 | **UI 可见** | 关键元素存在、文案正确：`browser_assert([{type:'exists',selector:'h1'},{type:'count',selector:'h1',expected:1}])` |
| 2 | **数据正确** | 卡片数与集合数据一致；分类计数、详情页字段与 `src/data/*.json` 对得上 |
| 3 | **资源健康** | `browser_network` 无 404 / 5xx（`/_astro/*`、封面、favicon、og 图） |
| 4 | **无 JS 报错** | `browser_console` 无 error，无 hydration mismatch 警告 |
| 5 | **交互闭环** | 操作前后状态变化可观测：筛选 → 结果数变化 → URL 变化 → 刷新保持 |

内容站额外一维（抽查即可，全量交给 `pnpm check:seo`）：
`browser_eval_result(label, "[document.querySelectorAll('link[rel=canonical]').length, document.querySelectorAll('script[type=\"application/ld+json\"]').length]")`

---

## 六、标准冒烟用例（可套用到任何内容站）

| 编号 | 用例 | 视口 |
|------|------|------|
| TC-01 | 首页：h1 恰好 1 个、精选卡片渲染、无 console error | 桌面 + 手机 |
| TC-02 | 列表页：island 水合完成、卡片数 = 数据条数（不超过首屏 pageSize） | 桌面 |
| TC-03 | 搜索：输入关键词 → 结果数变化 → URL 带 `q=` → 清空恢复 | 桌面 |
| TC-04 | 分类筛选：点分类胶囊 → URL 带 `c=` → 刷新后保持；直接打开 `?c=<id>` 的链接能还原 | 桌面 |
| TC-05 | 水合前输入：页面刚打开就在搜索框打字，水合后文字仍在、URL 带 `q=` | 桌面 |
| TC-06 | 详情页：面包屑、封面、元信息、外链按钮、相关推荐；canonical 指向本页 | 桌面 + 手机 |
| TC-07 | 分类落地页：导语、全部卡片、其他分类导航的 `aria-current` | 桌面 |
| TC-08 | 文章页：正文排版、表格 / 代码块不溢出 | 手机 |
| TC-09 | 暗色模式：切换生效、刷新保持、对比度肉眼可读 | 桌面 |
| TC-10 | 移动端：无横向溢出、`<details>` 菜单可展开并跳转 | 手机 |
| TC-11 | 404：访问不存在路径显示 404 页（需预览服务） | 桌面 |
| TC-12 | 站点文件：`/robots.txt`、`/llms.txt`、`/sitemap-index.xml` 可访问 | — |

手机无横向溢出的判定：

```js
document.documentElement.scrollWidth <= window.innerWidth
```

---

## 七、测试记录（与 task-tracker 同理念，可中断恢复）

```
docs/tests/
├── plans/test-{YYYYMMDD}-{模块}.md       # 测试计划（用例 checkbox）
├── reports/{YYYY-MM}/report-{YYYYMMDD}-{模块}.md
└── screenshots/{YYYYMMDD}/               # 失败截图（按需）
```

计划模板：

```markdown
# 测试计划：{模块}

**状态**: 🟢 进行中 | 🔵 已完成
**创建时间**: {date '+%Y-%m-%d %H:%M' 的输出}
**环境**: 预览 http://localhost:4329/ ｜ 视口：desktop + mobile
**对照原型**: docs/prototypes/{业务}/xxx.html（如有）
**关联任务**: T12（如有）

## 用例清单
- [ ] TC-01 ……
- [ ] TC-02 ……

## Bug 记录
（失败用例追加：现象 / 视口 / 截图路径 / console 报错 / 复现步骤）

## 执行结果
通过 0 / N ｜ 进度 0%
```

测试计划里的 `TC-xx` 复选框只属于测试文档，不写进任务台账的「实现步骤」区块（那里只放 `T<数字>` 任务）。
🔴 时间用裸 `date`，禁止 `TZ=Asia/Shanghai date`。只动本会话创建的测试文档，逐个 `git add`，提交 `test(scope): …` 或 `docs(tests): …`。

### 逐个测试逐个落实

```
1. 读测试计划，找第一个 - [ ]
2. 用 browser_* 驱动操作
3. 跑完五维断言（两种视口的用例两种都跑）
4. 全通过 → 改 - [x] 并追加「实际结果」
   任一失败 → Bug 记录追加一条 + 截图存证，用例标 - [⚠]
5. 更新执行结果
6. 回到 1，直到全部处理完 → 写报告（通过 / 失败 / 阻塞 + Bug 清单 + 结论）
```

---

## 八、原型保真截图闭环（UI 任务必过）

`/dev-loop` 里凡是涉及 UI 的任务，提交前必须过：

1. 运行页截图（桌面，`full_page=true`）→「现状」
2. `browser_open(url="file:///<项目根>/docs/prototypes/<业务>/<页面>.html")` 单独开一个标签 →「目标」截图
3. 逐条比对 7 项：① 布局分区 ② 主 / 辅 / 状态色 ③ 间距留白 ④ 字号字重行高 ⑤ 组件类型 ⑥ 文案 ⑦ 交互态
4. 手机视口再比一次
5. 有差异只改视图层 → 重新截图确认；关键差异没消除 = 任务未完成

🔁 失败降级：本会话第一次调浏览器就失败 → 后续不反复重试，改为「对照原型源码 + 用户提供截图」逐条核对 7 项。

---

## 九、Playwright 回归

### 首次准备

```bash
pnpm exec playwright install --no-shell chromium
```

`playwright.config.ts` 两个 project 都用 `channel: 'chromium'`：跑完整版 Chromium 的新 headless 模式，不依赖单独下载的 `chrome-headless-shell`（国内网络下它经常下载失败），所以安装时加 `--no-shell` 省掉那一份。

### 运行

```bash
pnpm build:fast && pnpm test:e2e
```

配置要点（`playwright.config.ts`）：
- `webServer` 自动执行 `pnpm preview --port 4329`，`reuseExistingServer: true`（已有预览服务就直接用），`baseURL` 是 `http://localhost:4329`
- `tests/e2e/global-setup.ts` 在所有用例前把端口上的首页与本地 `dist/index.html` 逐字比对，不一致就整批停下并报出对方标题。所有派生站共用 4329，别的项目的 preview 占着端口时，以前会复用它、用例逐条报「找不到元素」；现在一条错误说清楚。换端口跑：`E2E_PORT=4339 pnpm test:e2e`
- 两个 project：`desktop`（Desktop Chrome）、`mobile`（Pixel 7），每个用例两种视口各跑一遍
- 失败保留 trace：`pnpm exec playwright show-trace test-results/<...>/trace.zip`

### 写用例的约定

- 选择器优先语义化：`getByRole('link', { name: '浏览全部作品' })`、`getByPlaceholder(...)`、`getByRole('navigation', { name: '面包屑' })`
- 操作 island 前先 `await waitForHydration(page)`（等 `astro-island:not([ssr])` attached，从 `./helpers` 导入）
- 断言用自动重试的 `expect(locator)`，不写 `waitForTimeout`
- 模拟慢网络用 `page.route('**/_astro/*.js', …)` 给脚本加延迟（「水合前输入不丢」那条用例的做法）
- 只在某个视口有意义的用例用 `test.skip(({ isMobile }) => !isMobile)` 过滤
- 新页面上线时至少补一条冒烟：可访问、h1 唯一、canonical 正确
- 现有用例：`tests/e2e/smoke.spec.ts` 放与模块无关的全站行为（h1 唯一、暗色模式）；`tests/e2e/works.spec.ts` 放作品模块（首页入口、搜索与分类筛选同步 URL、分享链接还原筛选、水合前输入保留（慢网络回归）、详情页结构）
- 🔴 模块专属用例写进 `tests/e2e/<模块>.spec.ts`，不要加进 `smoke.spec.ts`：`module-strip` 裁模块时只删模块自己的 spec
- 派生站自己的页面核对（旧网址、标题后缀、下载卡、FAQ 条数）写 `tests/e2e/site.spec.ts`，别改模块的 spec——框架同步会覆盖模块文件
- 在 spec 里 import JSON 要带导入属性：`import data from '../../src/data/x.json' with { type: 'json' }`，否则 Playwright 报 `needs an import attribute`
- 点「空白处」要按元素实际位置算：如抽屉顶栏取 Logo 右边线与关闭按钮左边线的中点，并先断言该点 `elementFromPoint` 不是链接 / 按钮——
  写死坐标在站名长的站上会点到 Logo（知识库实录）
- 「滚动时位置不变」这类断言：先断言页面够长（`scrollHeight - innerHeight > 400`），再在 0 / 10 / 60 / 400 几个滚动值下读位置，结果只能有一种

---

## 十、常见坑

| 坑 | 后果 | 正确做法 |
|----|------|---------|
| 地址写 `127.0.0.1` | 连接被拒绝（服务只监听 IPv6 `::1`） | 一律 `http://localhost:<端口>/` |
| `browser_open` 不传 `device` | 被设备记忆开成手机画幅，布局全错 | 显式 `device="desktop"` / `"mobile"` |
| 等 `astro-island` 可见 | 永远超时（`display: contents`） | 等 `ssr` 属性消失（`astro-island:not([ssr])` attached）或等内部元素 |
| 水合前就操作 island | 点击 / 输入落在静态 HTML 上，结果随机 | 先等水合 |
| 从 http 页 `browser_navigate` 到 `file://` | 浏览器禁止跨协议跳转 | 原型单独 `browser_open(file:///…)` |
| 用 `sleep` 猜加载 | 偶发失败 | `browser_wait_for` / 轮询 `eval_result` |
| 只测桌面 | 手机溢出、菜单不可用漏测 | 桌面 + 手机都跑 |
| 在 dev 服务上验 404 / SEO | dev 与构建产物行为不同 | 验收用 `pnpm preview` |
| 截图截到视图过渡中间帧 | 误判样式错乱 | 导航后稍等再截 |
| 暗色偏好残留在 localStorage | 后续截图主题不一致 | 测完恢复 `localStorage.theme` |
| 自己起的服务不关 / 关了别人的服务 | 孤儿进程 / 打断他人 | 优先智码任务系统托管；自己起的只 `npx kill-port` 自己的端口 |
| 浏览器工具报 `[unsupported]` 还重试 | 永远不会成功 | 立刻换 Playwright 或人工核对 |

## 相关技能

`html-to-code`（原型转码）、`bug-detective`（定位问题）、`test-development`（单测）、`performance-doctor`（性能）、`seo-meta`（SEO 字段）
