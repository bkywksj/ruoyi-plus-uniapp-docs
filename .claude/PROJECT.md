# PROJECT.md - RuoYi-Plus-UniApp 全栈开发文档

## 项目事实（只写用户确认过的内容）
- 站点定位：RuoYi-Plus-UniApp 框架官网与全栈开发文档（https://ruoyi.plus）
- 当前状态：**VitePress → Astro 迁移试点**（2026-10-30 起）。线上仍是旧 VitePress 站，旧仓库 `../ruoyi-plus-uniapp-docs` 只读，本目录验收前不替换任何东西
- 规模：511 页 / 约 71 万行 / 约 2 万个代码块；旧网址全部 .html 结尾（cleanUrls: false）
- 生产域名：https://ruoyi.plus；部署方式 `edgeone pages deploy`（CLI 上传，不是 git 触发）
- 品牌：主色 #0B6EF0（取自旧站 --vp-c-brand-1）；Logo `/logo.png`
- 孵化来源：next-ai-astro @ e13010c（详见 .framework-sync.json）

## 专属禁令（优先级高于 CLAUDE.md）
- 🔴 旧仓库 `../ruoyi-plus-uniapp-docs` 只读：不改、不提交、不在里面 build / install、不推送
- 🔴 正文内容不许丢：每次转换后跑 `scripts/migrate/compare-baseline.mjs` 与 `.migrate/baseline-manifest.json` 逐页比对
- 正文保持 .md（不转 MDX）：511 页手改 MDX 风险太大，旧站扩展写法由 remark 插件与转换脚本还原
- 不推送、不建远程、不部署（迁移验收与用户确认前）

## 与框架的差异
- 裁剪掉的模块：examples / posts / works / faq
- 网址形态：urlFormat = 'file'（保留旧站 .html 网址）
- （试点中记录：多层侧栏、手机预览、状态标记、mermaid、代码行号等扩展，见 docs/tasks/active/迁移-vitepress.md）

## 参考代码位置（覆盖 CLAUDE.md）
| 开发类型 | 参考文件 |
|---------|---------|
| 文档页（指南集合） | `src/layouts/GuideLayout.astro` |
| 文档集合查询 / 排序 | `src/lib/guides.ts` |
| 独立页面 | `src/pages/index.astro` |
| 页面 SEO 字段 | `src/components/seo/SEOHead.astro` |
