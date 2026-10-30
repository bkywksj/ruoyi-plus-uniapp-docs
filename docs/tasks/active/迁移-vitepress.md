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
- [ ] T6 第 5 步：首页与营销页重做（index / comparison / demo / products / changelog / video / services），工作站出原型给用户选风格
- [ ] T7 第 6 步：工具链迁移（.claude 13 技能 + 6 命令、docs-sync 检查点、PROJECT_PROGRESS、build-llms / build-icons / indexnow / emoji-to-icon 等脚本），旧 CLAUDE.md 写作规范并入
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
2026-10-30 23:10 第 2–4 步完成：511 页全量迁移，逐页与全站比对全部通过，verify / e2e 全绿。
下一步：用户确认 66 个孤立页中 A 类 26 页进侧栏（单独提交）→ 第 5 步首页与营销页视觉（工作站出原型）→ 第 6 步工具链迁移 → 第 7 步切换（上线前用户确认）。

2026-10-30 17:45 第 0、1 步完成，结论：可以继续全量迁移。下一步第 2 步（补框架）需用户确认；工作区是试点 34 页。

## 卡点 / 决策
- 决策（2026-10-30，用户）：重复标题只在 <title> 加区分名（scripts/migrate/title-qualifiers.mjs → src/data/title-qualifiers.json），h1 与结构化数据不动
- 决策：66 个孤立页本轮照旧不进侧栏（网址都可访问），等用户确认 A 类 26 页后单独一个提交
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
