# PROJECT.md - RuoYi-Plus-UniApp 全栈开发文档

## 项目事实（只写用户确认过的内容）
- 站点定位：RuoYi-Plus-UniApp 框架官网与全栈开发文档（https://ruoyi.plus）
- 当前状态：**VitePress → Astro 迁移试点**（2026-10-30 起）。线上仍是旧 VitePress 站，旧仓库 `../ruoyi-plus-uniapp-docs` 只读，本目录验收前不替换任何东西
- 规模：511 页 / 约 71 万行 / 约 2 万个代码块；旧网址全部 .html 结尾（cleanUrls: false）
- 生产域名：https://ruoyi.plus；部署方式 `edgeone pages deploy`（CLI 上传，不是 git 触发）
- 品牌：主色 #5B7CFF（2026-11-01 用户选定方案 C「AI 原生」后由旧站 #0B6EF0 改来；文字用 #3D5BEA，见 src/styles/ry-theme.css）；Logo `/logo.png`
- 视觉：方案 C——页头 / 页脚 / 首屏常驻深色 #07080D，正文浅灰底 + 白卡片；原型 docs/prototypes/2026-11-01-方案C全站/
- 孵化来源：next-ai-astro @ e13010c（详见 .framework-sync.json）

## 专属禁令（优先级高于 CLAUDE.md）
- 🔴 旧仓库 `../ruoyi-plus-uniapp-docs` 只读：不改、不提交、不在里面 build / install、不推送
- 🔴 正文内容不许丢：每次转换后跑 `scripts/migrate/compare-baseline.mjs` 与 `.migrate/baseline-manifest.json` 逐页比对
- 正文保持 .md（不转 MDX）：511 页手改 MDX 风险太大，旧站扩展写法由 remark 插件与转换脚本还原
- 不推送、不建远程、不部署（迁移验收与用户确认前）

## 与框架的差异
- 裁剪掉的模块：examples / posts / works / faq
- 网址形态：urlFormat = 'preserve'（叶子页 /a/b.html、目录首页 /backend/，与旧站 VitePress cleanUrls: false 一模一样）
- （试点中记录：多层侧栏、手机预览、状态标记、mermaid、代码行号等扩展，见 docs/tasks/active/迁移-vitepress.md）

## 本站专属流程（迁自旧 VitePress 仓库 .claude，已改写成 Astro 路径）
- **写文档**：doc-writer / component-doc（/write、/wd），规范在 `docs/文档写作规范.md`；frontmatter 必须有 title、description；**正文不放文档间跳转链接**（作者定的规矩）
- **侧栏**：`src/data/sidebar.json`（写页面 id），用 sidebar-manager（/sidebar）
- **部署**：edgeone-deploy —— 本机构建后 `pnpm run deploy` 上传 dist 到 EdgeOne（🔴 不是 `pnpm deploy`，那是 pnpm 内置命令），**不走**框架 deployment-guide 与 /deploy 的 Docker / Reeve 路线；上传前必须问用户
- **构建前自动生成**：`pnpm icons`（离线图标，按正文实际用到的抽取）、`pnpm llms`（public/llms.txt，按侧栏）—— dev / build 命令里已串好
- **内容过期页**：登记 `src/data/outdated.json` → 正文上方提示条 + noindex + 移出 sitemap；重写后删掉登记即恢复
- **有意修订正文**：登记 `scripts/migrate/known-diffs.json` 的 `edited`，迁移逐页比对才会接受
- **源码同步**：update-docs 按 `.claude/docs-sync-checkpoint.json` 记录的各分支检查点找新提交；进度清单 `docs/PROJECT_PROGRESS.md`
- **其他**：doc-review（/review）、doc-search、doc-stats（/stats）、link-checker（/check-links，含 `pnpm check:anchors`）、changelog-gen、version-migrate、preview-server、sync-products（跨站产品矩阵，VitePress 站用技能目录里的 AProductCard.vue 模板）

## 参考代码位置（覆盖 CLAUDE.md）
| 开发类型 | 参考文件 |
|---------|---------|
| 文档页（docs 集合，511 页） | `src/layouts/DocsLayout.astro` + `src/pages/[...slug].astro` + `src/components/docs/` |
| 营销页 / 首页版式 | `src/layouts/LandingLayout.astro` + `src/styles/landing.css` + `src/lib/markdown/ry-layout.mjs` + `src/data/landing.json` |
| 文档集合查询 / 侧栏 / 网址 | `src/lib/docs.ts` + `src/data/sidebar.json` |
| 独立页面 | `src/pages/index.astro` |
| 页面 SEO 字段 | `src/components/seo/SEOHead.astro` |
