// 内容集合定义 —— 站点的「数据库表」
//   docs：旧 VitePress 站迁来的 511 篇文档（.md，侧栏见 src/data/sidebar.json）。框架的 guides 集合已改造为它（.framework-sync.json）
// 改 schema 后跑一次 `pnpm astro sync` 刷新类型。
// docs 集合的字段定义在 docs 模块（src/lib/docs-schema.ts），本站差异在 src/data/docs.json
import { docsCollection } from './lib/docs-schema';

const docs = docsCollection;

export const collections = { docs };
