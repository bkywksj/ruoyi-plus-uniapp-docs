# 迁移台账：ruoyi-plus-uniapp 官网 VitePress → Astro

> 创建：2026-10-30 17:45 · 用户：「ruoyi-plus-uniapp-docs 同样的模式重构，注意不能遗漏内容」「同级目录创建 ruoyi-plus-uniapp-docs-astro 来测试，先不要动仓库」
> 旧仓库 `../ruoyi-plus-uniapp-docs`（HEAD a6da208）全程只读；线上 https://ruoyi.plus 是旧站。本目录验收与用户确认前不替换任何东西、不推送、不部署。

## 目标 / 验收
- 511 个旧网址原样保留（.html；目录首页 /backend/），canonical、meta description 与旧站逐字相同
- **内容一字不丢**：每页正文、代码块（逐块哈希）、标题与锚点、图片、表格行对旧站基线逐页比对，差异清零或逐条人工核对登记
- 旧站功能对等：多层侧栏、页面导航（h2–h3）、上一页 / 下一页、手机实时预览（84 页）、状态标记与图标、代码行号、站内搜索、「在 GitHub 上编辑此页面」
- 站长验证文件、结构化数据（WebSite / SoftwareApplication / Organization / ProfessionalService / TechArticle）、sitemap、llms.txt、robots 不退化

## 🎯 实现步骤
- [x] T1 第 0 步：基线快照
  - 读写: 写入
  - 读数（2026-10-30）：旧仓库 HEAD `git archive` → `.migrate/baseline-src`，照旧 package.json 构建：**759 s、峰值 22.4 GB**（旧站 NODE_OPTIONS 32 GB 堆）
  - 基线清单 `.migrate/baseline-manifest.json`（scripts/migrate/manifest.mjs）：511 页 / 19,979 个代码块 / 68 张图 / 16,920 表格行 / 4 个站长验证文件；
    JSON-LD 每页 WebSite + SoftwareApplication + Organization + ProfessionalService，510 页 TechArticle
  - 提交: 120b3ab（孵化 + manifest.mjs）
- [x] T2 第 1 步：30 页试点
  - 读写: 写入
  - 试点 34 页（scripts/migrate/pick-pilot.mjs 按难度挑）：最长 2 页、手机预览 5 页、全部 13 个 mermaid 页、:::容器 / 正文花括号 / 尖括号 / 状态标记最多的页、四个分区首页、前端与实践代表页（名单见下）
  - 结果：**34/34 通过**（代码块 1,465 个逐块相等、标题与锚点全等、表格行 1,154 全等；2 页已核对差异）
  - 全量压测（真实 510 页，不入库）：**冷构建 185 s / 峰值 6.3 GB，热构建 35–46 s**；511 页比对 507 通过，剩 4 页是第 5 步重做的首页与营销页
  - 提交: 1cafff2 脚本、7eeb6e9 渲染、0d0f6f6 试点内容、e5d0bfe 嵌套目录首页、be02c0a sitemap、74b7986 e2e
- [x] T3 第 2 步：补框架（框架 next-ai-astro e13010c..5c95ac5 已推送：preserve 网址、多层侧栏、VitePress 兼容插件、手机预览、cache:clear）
  - 读写: 写入
  - 提交: 887b932 chore(framework-sync)（同步进本项目；guides 登记为 transformedModules，改造为 docs 集合）
- [x] T4 第 3 步：全量转换 511 页（`node scripts/migrate/convert.mjs .migrate/baseline-src/docs .migrate/baseline-manifest.json`），框架示例 guides / about 去掉
  - 读写: 写入
  - 基线源核对：.migrate/baseline-src/docs 与旧仓库 HEAD a6da208 的 docs/ 592 个文件统一换行后逐个一致
  - 机械转换计数：frontmatter 补 title / description 511 页（title 取旧站 <title> 的页名部分）；`:::` 容器按行预转换 37 个，转换后正文 `:::` 计数 0
  - 提交: ea5ab98 全量内容、de7e7e4 framework（titleSuffix / keywords / 爬虫名单）、a1405af 全站 SEO 对齐、0ceb2ac 首页与营销页、2a97d6b 重复标题区分名
- [x] T5 第 4 步：全量逐页比对清零（compare-baseline.mjs 退出码 0）+ check:seo 全绿 + 旧网址 / sitemap 全集核对
  - 读写: 写入
  - 读数（2026-10-30 23:05）：逐页 **511/511 通过**（9 页 Vue 吞字差异 + 35 页重复标题区分名为已接受，见 known-diffs.json / title-qualifiers.json）；
    全站 compare-site 全部通过（网址 511/511、旧 sitemap 511 条全在、/sitemap.xml 可用、静态文件 68 个全在、站长验证文件 4 个逐字节相同、
    JSON-LD 四种全站类型 512/512 页 + TechArticle 510/510、robots 旧站 21 个 User-agent 全保留）
  - 总量：代码块 19,979 = 19,979、表格行 16,920 = 16,920、图片 68 = 68、标题 27,446 = 27,446、锚点 27,426 = 27,426；正文链接旧 215 全在（新 267，多出的是图片外链包裹等）
  - pnpm verify：astro check 0 错误 0 警告、512 页、check:seo 通过（583 条警告均为标题超 60 字 / 图片无宽高，旧站同样如此）、vitest 128 条全过
  - e2e（E2E_PORT=4339）：14 通过、2 跳过
  - 构建：冷构建（先 cache:clear）217 s、峰值 5.1 GB；热构建约 77 s、4.1 GB（旧站 759 s、22.4 GB）
  - 反证：同时删 redis.md 一行正文、改 pay.md 一个代码字符、挪走 BingSiteAuth.xml、删爬虫 ByteDance-Bot → 逐页 509/511 + 全站 3 项 ❌，退出码均 1；恢复后转绿
  - 提交: 43a1d6c 比对脚本补判定 + compare-site.mjs
- [x] T5b 孤立页 A 类 26 页补进侧栏（用户 2026-10-31 同意「按建议」）
  - 依据：C:/Users/yecha/AppData/Local/Temp/aibid-wm/ry-orphans-report.md（66 页逐页对照框架代码：A 26 / B 29 / C 10 / ? 1）
  - 放置：后端「主应用(ruoyi-admin)」+6（overview 组首）、「扩展模块」+1；移动端 WD「表单组件」+3（计数 25 → 28）、「组件开发」+1、
    「业务组合函数」+1（plugins/camera）、新建「Vite 插件」分组 13 页（概览 + 自动化 / 自研插件 / 开发辅助 / UniApp 插件，放在「打包发布」前）；
    最佳实践「工程化 › Claude Code」+1（practices/ai/claude-code 组首「总览」）。B / C / ? 类不进侧栏，网址照常可访问
  - 读数：侧栏 438 → 464 条；cache:clear 后全新构建 verify 全绿（512 页、128 单测）；逐页 511/511、全站比对全部通过
  - 提交: 7526af3 feat(docs)
- [x] T6 第 5 步：首页与营销页重做（index / comparison / demo / products / changelog / video / services），工作站出原型给用户选风格
  - 2026-10-31 原型完成，待用户选方向：docs/prototypes/2026-10-31-首页三方向/（index.html 入口 + 决策对比表；plan-1 同家族 / plan-2 开发者工具风 / plan-3 企业级框架风）
  - 三方案内容一致，全部取自旧站首页（13 功能卡、5 组亮点、定价 3 档、103 家企业、产品矩阵 8 款、技术服务、4 张二维码），只比视觉；均无方格线
  - 提交: 2118761 docs(prototype)
  - 2026-11-01 第二轮三方向（1d24fcd）→ 用户选方案 C「AI 原生」，并要求其余页同风格：全站原型 docs/prototypes/2026-11-01-方案C全站/（4a5db55、1f4593d）→ 用户「可以了，开始落地到新站」
  - 落地原则（内容一个字不动、比对仍 511/511）：
    · 营销页 md 不改：rehype 插件把开头 h1 + 导语包进首屏 header（仍在正文盒里，比对照旧）；首屏装饰（标签 / 数字 / 图）标 data-migrate-ignore + data-pagefind-ignore
    · 版式靠布局 + 每页样式（LandingLayout + landing.css）与 vue-components.mjs 的标记改造，不改文字
    · 不引中文 webfont（框架禁令）：原型的 Noto Sans SC / Unbounded / JetBrains Mono 改用系统字体栈
- [x] T9 方案 C 公共壳：品牌色 #5B7CFF、深色页头（栏目高亮 + 手机菜单）、深色页脚（三栏 + 公司行 + 备案号）、搜索框外观
  - 读写: 写入
  - 验证: pnpm build + compare-baseline 511/511 + 截图对原型
- [x] T10 文档页：深色面包屑带、侧栏选中黑底、h2 编号（CSS 计数器）、表格卡片、深色代码窗、提示框卡片化（不用左侧色条）、本页目录、上下篇卡片、手机预览深色卡
  - 读写: 写入
- [x] T11 栏目首页（backend / frontend / mobile / practices）：深色首屏 + 页数 + 分组卡片（取侧栏数据），正文照旧
  - 读写: 写入
- [x] T12 营销页 6 页（products / services / demo / video / changelog / comparison）：LandingLayout + 首屏抬升插件 + 每页样式
  - 读写: 写入
- [x] T13 首页：深色首屏 61/19/3 + 分镜、功能卡、亮点（frontmatter highlights，旧站未渲染，新增显示）、正文各段按原型排版
  - 读写: 写入
  - 2026-11-01 用户看了深色版：「这种想统一换浅色…改成这种色试试」（给的是方案 B 原型截图）→ 页头 / 首屏 / 面包屑带 / 页脚 / 深色卡片全部换浅色，
    配色取方案 B（#0B6EF0 + 青 #04AEF6 光晕、渐变标题、蓝色渐变胶囊按钮），写死的深色类全改成语义令牌（深色模式实测可自动翻转）；
    读数：verify 全绿、逐页 511/511、全站比对通过、锚点 0 失效、393 / 1556 两档宽度溢出 0
- [x] T14 404 页 + 全量验收（cache:clear 冷构建、verify、compare-baseline / compare-site、e2e、桌面与手机截图）
  - 读写: 写入
  - 读数（2026-11-01 12:35）：cache:clear 冷构建 0 错误、Pagefind 511 页；pnpm verify 全绿（check:seo 全部通过、vitest 128/128）；
    逐页比对 **511/511 通过**（结构包了 header / section / .tbl 容器，正文、代码块、标题、锚点、图片、表格行、链接全等）；全站比对全部通过；e2e（E2E_PORT=4339）14 通过 2 跳过
  - 横向溢出逐页扫描（$TEMP/aibid-wm/ry-mobile-scan.mjs，Playwright）：宽 393 / 768 / 1280 / 1556 各 512 页（含 404），溢出均为 0
  - 修掉的问题：行内代码长词撑破手机版（pay.html 537px → 加 overflow-wrap:anywhere；反证：去掉该规则立刻回到 537px）、营销页分组网格被宽表格撑出版心、
    深色搜索按钮 w-full 与 w-44 冲突把「开始使用」挤出页头（桌面 1619px）、页脚网格简介与「文档」栏重叠、二维码 3:4 比例误伤首页提交记录图、技术服务卡片空格
  - 待用户过目的新增文案：首页分镜示例（社区团购 / 文件名）、首屏标签行（landing.json 的 kicker / 数字）、技术服务首屏按钮；页脚说明行照旧站 footer.message 原文
- [x] T6c 迁移后内容修正（与迁移分开提交，便于回溯；正文改动不计入「一字不改」的迁移比对）
  - 2026-11-01 用户「按你建议继续」，按默认处理：
    · A 类 4 处已改（逐处先到框架代码核实）：startup 的包名 / 库名 ryplus_uni_workflow → ryplus_uni（主版本 artifactId 与 application-*.yml 都是 ryplus_uni；
      原报告写的「ruoyi-admin.jar」不对）、vite-plugins/overview 补 sm-crypto-rng（表格一行 + 入口示例照 index.ts 原文）、
      claude-code 删「写作进度跟踪」草稿段与 banana-image（五个分支 .claude/skills 都没有）；workflow-engine 在 workflow / 6.x / 6.x-single 分支存在 → 保留并标注、
      camera 标题改「useUpload 媒体选择与上传」（侧栏名同步）
    · C 类 10 页：网址保留、正文不动；src/data/outdated.json 登记「查不到的类 / 以哪页为准」，DocsLayout 正文上方提示条 + noindex，sitemap 排除（501 条）。
      重写后从 outdated.json 删掉即恢复收录；站内搜索仍能搜到（带提示条）
    · 比对脚本：known-diffs.json 新增 edited（修订页只守代码块数 / 图片 / 链接 / canonical / JSON-LD 不少，原因逐条打印）；compare-site 单列「有意移出」的过期页
  - 读数：verify 全绿（0 错误、check:seo 通过、vitest 128/128）；逐页 511/511（4 页按 edited 规则）；全站比对通过（sitemap 501 + 有意移出 10）
  - 反证：修订页 camera 去掉一个代码块 → 判不通过（510/511）
  - A 类小修：backend/ruoyi-admin/startup 的 jar 名 ryplus_uni_workflow.jar 是 workflow 变体（主版本是 ruoyi-admin.jar）；
    mobile/vite-plugins/overview 缺新加的 sm-crypto-rng 插件（createSmCryptoRng）；practices/ai/claude-code 删「写作进度跟踪」草稿段与 2 个已不存在的技能（banana-image、workflow-engine）；
    mobile/plugins/camera 实为 useUpload（标题与归类待改）
  - C 类 10 页（与代码不符，仍可被搜到）：backend/core/base-mapper、backend/core/exception-handler、backend/modules/generator/advanced-config、
    backend/architecture/overview、mobile/plugins/{analytics,map,permission,push}、mobile/utils/{device,file}——重写 / 加 noindex / 删除，待用户决定
  - B 类 29 页（已被侧栏页取代）：保持现状，网址可访问
- [x] T7 第 6 步：工具链迁移（.claude 13 技能 + 6 命令、docs-sync 检查点、PROJECT_PROGRESS、build-llms / build-icons / indexnow / emoji-to-icon 等脚本），旧 CLAUDE.md 写作规范并入
  - 2026-11-01 完成（用户「按你建议继续」）：
    · 脚本（2618e49）：build-icons（正文实际用到 61 个图标，图标库锁旧站同版、线条逐字相同）、build-llms（按 sidebar.json，旧 435 条一条不少 +31）、
      indexnow、新增 check-anchors（构建产物锚点检查）；dev / build 前自动生成；package.json 加 icons / llms / indexnow / check:anchors / deploy
    · 技能 13 + 命令 6：路径改项目内相对路径（切换后仓库换位置也能用）；sidebar-manager、preview-server、link-checker、edgeone-deploy 重写
      （旧 deploy 用 add -A 与本地推送，改为逐个 add、Sigil 推送、上线前问用户；pnpm deploy 是 pnpm 内置命令，改 pnpm run deploy）；
      旧 deploy 改名 edgeone-deploy（与框架 deployment-guide 的 Docker / Reeve 路线区分）；sync-products 的 AProductCard.vue 存进技能 templates，本站按 Astro 站跳过主题三步
    · 钩子登记新增「文档内容（本站）」一组；check:skills 55 技能 / 26 命令通过；agents:sync 已同步 Codex 镜像
    · 写作规范：旧 CLAUDE.md 四节（编写规范 / 编写流程 / 组件模板 / 注意事项）→ docs/文档写作规范.md，doc-writer 等改为读它；
      保留作者规矩「正文不放文档间跳转链接」
    · 数据：.claude/docs-sync-checkpoint.json、docs/PROJECT_PROGRESS.md 搬入；.claude/PROJECT.md 加「本站专属流程」
    · 没迁的：旧钩子 3 个（新框架钩子已覆盖且更全）；emoji-to-icon / scan-unmapped / verify-icons（一次性批量转换工具，已完成使命；校验由 build-icons 失败即报代替）
- [ ] T8 第 7 步：验收与切换（合并历史覆盖旧仓库 → Gitee + GitHub → `edgeone pages deploy`，上线前用户确认）→ 线上 511 网址逐条核对

## 试点页面（34）
- backend/common/pay.md、practices/ai/claude-code.md（最长）
- mobile/wd/feedback/circle.md、mobile/wd/form/calendar-view.md、mobile/wd/layout/grid.md、mobile/wd/display/swiper.md、mobile/wd/navigation/tabbar.md（手机预览）
- backend/common/security.md、backend/modules/generator.md、backend/modules/system.md、backend/architecture/overview.md、backend/common/encrypt/api-encryption.md、
  backend/common/sensitive.md、backend/modules/generator/template-types.md、backend/modules/system/auth.md、backend/common/encrypt/database-encryption.md、
  backend/common/idempotent.md、backend/common/redis.md、backend/modules/system/tenant.md（mermaid，全站 13 页全在）
- backend/getting-started.md、backend/common/langchain4j.md、backend/common/mail.md（:::容器）
- backend/modules/generator/advanced-config.md、frontend/i18n/i18n-practices.md、backend/common/doctemplate.md（正文花括号）
- practices/architecture/system.md（正文尖括号）
- practices/backend/controller-layer.md、practices/backend/service-layer.md、practices/standards/database.md（状态标记）
- backend/index.md、frontend/index.md、mobile/index.md、practices/index.md（分区首页）
- frontend/dev/performance.md（前端代表）

## 技术点结论
| 技术点 | 做法 | 结果 |
|---|---|---|
| 正文格式 | 保持 .md，不转 MDX（正文有 List<String>、{ } 等，MDX 会成片报错） | ✅ 510 页零改动构建通过 |
| Markdown 管线 | Astro 7 默认 Sätteri 不跑 remark 插件 → `unified()`（@astrojs/markdown-remark） | ✅；Sätteri 原生插件可作后续性能优化 |
| ::: 容器 | convert.mjs 转 HTML 块（开闭标记允许 0–3 空格，与 markdown-it 一致） | ✅ 35 个 |
| 状态标记 / Icon | remark 插件 → 内联 SVG（旧站同一份离线图标数据，缺图标直接构建失败） | ✅ 文档页零残留；营销页 4 个组件留第 5 步 |
| 代码行号 | CSS 计数器 | ✅；关等宽连字（--> 不画成箭头） |
| mermaid | **旧站本来就没装 mermaid 插件，线上是代码块** → 照旧显示代码块 | ✅ 内容一致；要不要改成图 → 待用户决定 |
| 手机实时预览 | PhonePreview.astro（iframe + 扫码 + 新窗口 + 收起，零 JS） | ✅ 截图核对 |
| 多层侧栏 | 从旧站产物读侧栏 → sidebar.json，DocsSidebar 递归 + details | ✅ 438 个链接 |
| 网址 | build.format 'preserve'（'file' 会把 backend/index 折成 backend.html） | ✅ 511/511；canonical / description 0 差异 |
| 锚点 | rehype 插件照搬 VitePress slugify | ✅ 全部锚点 id 相等 |
| 搜索 | Pagefind | ✅ 全量索引 510 页 |

## 框架缺口（第 2 步回流 next-ai-astro）
- urlFormat 缺 'preserve' 形态：VitePress 迁来的站目录首页必须 <dir>/index.html；sitemap serialize 要认目录首页（本项目已在 astro.config 实现）
- 文档模块只有一层分组：缺多层侧栏（本项目 DocsSidebar / sidebar.json）
- 缺 VitePress 兼容插件（状态标记、Icon、.md 链接、VitePress slug 锚点）与 ::: 容器转换（本项目 vp-compat.mjs / convert.mjs）
- 缺手机实时预览组件（PhonePreview）、代码行号与关连字样式
- 默认 SmartyPants 会把技术文档里的 'none'、"x" 改成弯引号：框架应默认关闭（unified({ smartypants: false }) / satteri smartPunctuation）
- Astro 内容层按正文缓存渲染结果：改 Markdown 插件不会重新渲染 → 框架加 `cache:clear` 并写进技能
- 框架 guides 示例 e2e 写死目录网址（/guide/x/），file / preserve 形态下 4 条失败
- 迁移比对工具（manifest / compare-baseline / known-diffs）可回流成 vitepress-migration 技能的标准验收

## 发现的旧站问题（迁移后自然修好或需用户决定）
- 9 页正文里的 {id} / {index} / {prop} / ${index} / {{ }} 被旧站 Vue 当模板吃掉（如「/reset/」「item-$」），新站按源文件显示，已逐条登记 known-diffs.json
- 74 页不在任何侧栏里（含 7 个独立页，文档页约 67），旧站同样只能靠链接 / 搜索进入：迁移照旧，是否补进侧栏待用户决定
- 16 组页面标题重复（如 5 页都叫「快速开始」），旧站同样如此：是否在标题里带上分区，待用户决定（会改变搜索结果里的标题）

## 当前进度 / 下一步
2026-11-01 12:35 第 5 步（方案 C）落地完成：公共壳 / 文档页 / 栏目首页 / 营销 6 页 / 首页 / 404 全部换新版式，比对仍 511/511，verify / e2e / 四档宽度溢出扫描全绿。
下一步：用户在本地预览过目（新增文案见 T14）→ T6c 内容修正（C 类处置待用户定）→ 第 6 步工具链迁移 → 第 7 步切换（上线前用户确认）。

2026-10-31 22:55 孤立页 A 类 26 页已进侧栏（7526af3，比对仍 511/511）；首页三方向原型完成（2118761）。
下一步：用户从三个方案里选方向 → 第 5 步落地首页与营销页 → T6c 内容修正（C 类处置待用户定）→ 第 6 步工具链迁移 → 第 7 步切换（上线前用户确认）。

2026-10-30 23:10 第 2–4 步完成：511 页全量迁移，逐页与全站比对全部通过，verify / e2e 全绿。
下一步：用户确认 66 个孤立页中 A 类 26 页进侧栏（单独提交）→ 第 5 步首页与营销页视觉（工作站出原型）→ 第 6 步工具链迁移 → 第 7 步切换（上线前用户确认）。

2026-10-30 17:45 第 0、1 步完成，结论：可以继续全量迁移。下一步第 2 步（补框架）需用户确认；工作区是试点 34 页。

## 卡点 / 决策
- 决策（2026-10-30，用户）：重复标题只在 <title> 加区分名（scripts/migrate/title-qualifiers.mjs → src/data/title-qualifiers.json），h1 与结构化数据不动
- 决策：66 个孤立页本轮照旧不进侧栏（网址都可访问），等用户确认 A 类 26 页后单独一个提交
  → 2026-10-31 用户同意按建议：A 类 26 页进侧栏（7526af3），B / C 类不进，内容修正放到迁移之后（T6c）
- 旧站侧栏本来就有 mobile/styles/theme 同时挂在「WD UI 组件库」与「样式系统」下，保留原样（补侧栏脚本只拦新增的重复）
- 决策：llms.txt 暂用旧站入库的静态文件（与旧站逐字节相同），build-llms.mjs 生成逻辑在第 6 步移植
- 决策：营销页 Vue 组件（AProductCard / APricingCard / ImagePreview）由项目插件 src/lib/markdown/vue-components.mjs 转静态 HTML；
  套餐按钮的「复制微信号 + 弹窗」改成可展开的同一段联系方式（data-migrate-ignore）
- 框架缺口（本轮未改框架，待回流 next-ai-astro）：
  · remarkVpContainers 按段落认 `:::`：闭合标记紧跟列表时被并进列表项、标题里带 <Icon/> 时被拆散（全量 6 页失败）→ 本项目仍用 convert.mjs 按行预转换；框架应改成按行预处理
  · remarkVpLinks / fixLink 只补 / 开头的链接：Markdown 相对链接（./changelog）与正文原始 HTML 的 <a href> 不补 .html → 本项目在 vue-components.mjs 补
  · buildTitle 没有标题后缀配置、SEOHead 不输出 keywords、ai-crawlers 缺 Claude-Web / anthropic-ai / cohere-ai / ByteDance-Bot → 本项目 de7e7e4 已补（feat(framework)，可回流）
  · 迁移站需要 /sitemap.xml 别名（旧站登记地址）→ 本项目 src/pages/sitemap.xml.ts（storyloom 同样做法）
  · markdownCompat 的 unified 管线没有给项目插件留挂点，只能改 astro.config 的插件数组
  · guides 裁剪预设会删掉 lib/sidebar.ts 与 components/docs（多层侧栏、手机预览、搜索都在里面）：用自建 docs 集合的迁移站只能登记 transformedModules，不能裁剪
- 决策：mermaid 保持代码块（与线上一致）；改成渲染图属于新增能力，单独问用户
- 决策：任务列表 [x] 新站渲染成复选框（旧站是文字），比对时统一成文字，视为显示改进
- 注意：改 vp-compat.mjs 后先 `pnpm cache:clear` 再构建（反证时实测：不清缓存，摘掉插件后 e2e 仍绿）
- 注意：试点阶段 `pnpm verify` 的 check:seo 会报 400+ 站内死链 —— 侧栏指向尚未迁入的 476 页，全量后消失（全量实测只剩 16 组重复标题 + 框架示例页 1 条死链）
