# PROJECT.md - RuoYi-Plus-UniApp 全栈开发文档

## 项目事实（只写用户确认过的内容）
- 站点定位：RuoYi-Plus-UniApp 框架官网与全栈开发文档（https://ruoyi.plus）
- 当前状态：**已从 VitePress 迁到 Astro 并上线**（2026-10-30 起迁移，2026-11-01 切换）。本目录就是主仓库（原 `ruoyi-plus-uniapp-docs-astro` 改名而来，旧 VitePress 工程目录已删除）；
  远端 origin = Gitee、github = GitHub（`bkywksj/ruoyi-plus-uniapp-docs`）；旧站 514 个提交经合并提交 a022a56 接在历史里，旧工程的 stash 存为本地引用 `refs/old-site/stash-pre-phase1-baseline`
- 规模：511 页 / 约 71 万行 / 约 2 万个代码块；旧网址全部 .html 结尾（cleanUrls: false）
- 生产域名：https://ruoyi.plus；部署方式：本机构建后 `pnpm run deploy`（EdgeOne CLI 上传 dist）。EdgeOne 云端构建机 6 GB 不够，三次实测都被杀，不用（见 edgeone-deploy）
- 品牌：主色 #0B6EF0（旧站同色；2026-11-01 用户改浅色后由方案 C 的 #5B7CFF 改回），点缀青 #04AEF6，文字用 #0A5CD6（见 src/styles/brand.css）；Logo `/logo.png`
- 视觉：版式取方案 C（深色首屏结构、卡片网格），配色取第二轮原型方案 B（用户 2026-11-01「统一换浅色」）——白色毛玻璃页头、浅底青蓝光晕首屏（.ry-aurora）、渐变标题、蓝色渐变胶囊主按钮、白色页脚；代码窗保持深色；颜色全走语义令牌，深色模式自动翻转
- 孵化来源：next-ai-astro @ e13010c（详见 .framework-sync.json）

## 专属禁令（优先级高于 CLAUDE.md）
- 🔴 正文内容不许丢：改插件、侧栏或批量改正文后跑 `scripts/migrate/compare-baseline.mjs` 与 `.migrate/baseline-manifest.json` 逐页比对（有意修改登记 `known-diffs.json`）
- 正文保持 .md（不转 MDX）：511 页手改 MDX 风险太大，旧站扩展写法由 remark 插件与转换脚本还原
- 🔴 推送与上传都等于上线：执行前必须问用户，本轮之前的同意不算数（流程见 edgeone-deploy）
- 本站部署不用框架的 `/deploy` 与 deployment-guide（那是 Docker / Reeve 服务器路线）；用户说「部署 / 上线」一律走 edgeone-deploy

## 与框架的差异
- 裁剪掉的模块：examples / posts / works / faq / guides（guides 早先改造成 docs；2026-11-03 docs 成为框架正式模块后改记为已裁剪，遗留的 8 个指南组件已删）
- 网址形态：urlFormat = 'preserve'（叶子页 /a/b.html、目录首页 /backend/，与旧站 VitePress cleanUrls: false 一模一样）
- 🔴 2026-11-03 起文档骨架是框架的 **docs 模块**（docs-site 技能）——它就是从本站长出来的，经 officia / 知识库 / tauri-docs 打磨后收回框架。
  模块文件与框架逐字节相同，发现问题修在框架（`E:/my/AI框架/next-ai-astro`）再同步，别在本站就地改。
  本站差异只在：`src/data/docs.json`（四个栏目、TechArticle 作者与出版方、编辑链接、栏目首页大图、演示站域名、llms 按栏目分节、
  不写 lastmod 与分档）、`src/data/sidebar.json`、`src/styles/brand.css`（蓝色令牌、光晕、渐变；首页特色卡保持白底）、
  `src/data/llms-facts.md`、`src/lib/site-jsonld.ts`、`src/components/docs/SectionHero.astro`、独立页面（首页、预览页）
- 页头：2026-11-03 起与其他文档站一致（窄屏右侧抽屉，抽屉里有「开始使用」、咨询购买、GitHub / Gitee、电话），原先是 `<details>` 下拉
- 迁移期加的扩展（多层侧栏、手机预览、状态标记、mermaid、代码行号等）与验收读数见 docs/tasks/active/迁移-vitepress.md

## 本站专属流程（迁自旧 VitePress 仓库 .claude，已改写成 Astro 路径）
- **写文档**：doc-writer / component-doc（/write、/wd），规范在 `docs/文档写作规范.md`；frontmatter 必须有 title、description；**正文不放文档间跳转链接**（作者定的规矩）
- **侧栏**：`src/data/sidebar.json`（写页面 id），用 sidebar-manager（/sidebar）
- **部署**：edgeone-deploy —— 本机全量验证 → 用户确认 → Sigil 推送 → `pnpm run deploy` 上传（🔴 不是 `pnpm deploy`，那是 pnpm 内置命令），**不走**框架 deployment-guide 与 /deploy 的 Docker / Reeve 路线
- **构建前自动生成**：`pnpm icons`（离线图标，按正文实际用到的抽取）、`pnpm llms`（public/llms.txt，按侧栏）—— dev / build 命令里已串好
- **内容过期页**：登记 `src/data/outdated.json` → 正文上方提示条 + noindex + 移出 sitemap；重写后删掉登记即恢复
- **有意修订正文**：登记 `scripts/migrate/known-diffs.json` 的 `edited`，迁移逐页比对才会接受
- **源码同步**：update-docs 按 `.claude/docs-sync-checkpoint.json` 记录的各分支检查点找新提交；进度清单 `docs/PROJECT_PROGRESS.md`
- **其他**：doc-review（/review）、doc-search、doc-stats（/stats）、link-checker（/check-links，含 `pnpm check:anchors`）、changelog-gen、version-migrate、preview-server、sync-products（跨站产品矩阵，VitePress 站用技能目录里的 AProductCard.vue 模板）

## 参考代码位置（覆盖 CLAUDE.md）
| 开发类型 | 参考文件 |
|---------|---------|
| 文档页（docs 集合，511 页；框架 docs 模块） | `src/layouts/DocsLayout.astro` + `src/pages/[...slug].astro` + 目录首页 `src/pages/[...dir]/index.astro`；本站配置 `src/data/docs.json` |
| 营销页 / 首页版式 | `src/layouts/LandingLayout.astro` + `src/styles/landing.css` + `src/lib/markdown/docs-layout.mjs` + `src/data/landing.json`；本站配色与渐变 `src/styles/brand.css` |
| 文档集合查询 / 侧栏 / 网址 | `src/lib/docs.ts` + `src/data/sidebar.json` |
| 独立页面 | `src/pages/index.astro` |
| 页面 SEO 字段 | `src/components/seo/SEOHead.astro` |
