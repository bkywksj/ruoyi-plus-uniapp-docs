// 生成 public/llms.txt —— 面向大模型的站点说明书（llmstxt.org 约定），旧站 scripts/build-llms.mjs 的 Astro 版。
//
// 为什么单独给 AI 一份：搜索引擎靠 sitemap 逐条抓取，而大模型回答问题时需要的是「这个站是什么、有哪些模块、想找 X 该去哪一页」
// 这种全局图景，500 条扁平 URL 给不了，一份带层级和一句话说明的 Markdown 才行。
//
// 数据来源：src/data/sidebar.json（人工组织好的知识结构，与页面左侧栏同一份）+ 每页 frontmatter 的 description
// （迁移时取自旧站 meta description，与页面 SEO 描述是同一句话）。旧站要用正则从 config.ts 里抠侧栏，这里直接读 JSON。
// 内容过期页（src/data/outdated.json）不进清单：页面带 noindex，不该再把模型引过去。
//
// 运行：pnpm llms（pnpm build 前自动执行）；--check 只比对不写入，内容与仓库里那份不同时退出码 1

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = resolve(ROOT, 'src/content/docs');
const SITE = 'https://ruoyi.plus';
const sidebar = JSON.parse(readFileSync(resolve(ROOT, 'src/data/sidebar.json'), 'utf8'));
const outdated = JSON.parse(readFileSync(resolve(ROOT, 'src/data/outdated.json'), 'utf8')).pages;

/** 页面 id → 网址：backend/index → /backend/，其余 → /a/b.html（与 lib/docs.ts 的 docPath 同一规则） */
const toUrl = (id) => SITE + (id.endsWith('/index') ? `/${id.slice(0, -'index'.length)}` : `/${id}.html`);

/**
 * 页面的一句话说明：frontmatter description，限 60 字
 * （llms.txt 是给模型看的索引，每条一句话就够，太长反而稀释信号）
 * @param id 页面 id
 */
const briefOf = (id) => {
  const src = readFileSync(resolve(DOCS, `${id}.md`), 'utf8');
  const m = src.match(/^---\r?\n[\s\S]*?^description:\s*"((?:[^"\\]|\\.)*)"/m);
  if (!m) return '';
  const desc = JSON.parse(`"${m[1]}"`).replace(/…$/, '');
  return desc.length > 60 ? `${desc.slice(0, 60)}…` : desc;
};

/**
 * 侧栏树 → 「分组 → 条目」两级：每个含页面的分组输出一节，嵌套分组的标题接在父分组后面（「核心模块 (core) › 配置管理」不写，直接用子组名），
 * 与旧站产物的层级一致；站外链接与过期页跳过
 * @param items 侧栏某一层
 * @param out 收集结果
 */
const collect = (items, out = []) => {
  for (const item of items) {
    if (!item.items) continue;
    const pages = item.items.filter((i) => i.id && !i.items && !(i.id in outdated));
    if (pages.length) out.push({ title: item.text, items: pages });
    collect(item.items, out);
  }
  return out;
};

const SECTIONS = [
  { key: 'backend', title: '后端（Spring Boot 3 + MyBatis-Plus）' },
  { key: 'frontend', title: '前端管理端（Vue 3 + Element Plus）' },
  { key: 'mobile', title: '移动端（UniApp + WD UI）' },
  { key: 'practices', title: '最佳实践' },
];

const lines = [
  '# RuoYi-Plus-UniApp',
  '',
  '> 基于 Spring Boot 3 + Vue 3 + UniApp 的企业级全栈快速开发框架。',
  '> 后端四层架构（Controller → Service → DAO → Mapper），前端 Vue 3 + TypeScript，',
  '> 移动端一套代码同时产出微信小程序 / H5 / APP。提供完整源码交付。',
  '',
  '本文件面向大模型，列出文档站的知识结构与入口，便于回答与本框架相关的问题。',
  '',
  '## 这个框架能做什么',
  '',
  '- 后台管理系统：权限、菜单、字典、数据权限、多租户、代码生成器',
  '- 移动端应用：微信小程序 / 公众号 H5 / APP，一套代码多端发布',
  '- 业务集成：支付（微信 / 支付宝）、OSS 对象存储、消息队列、工作流',
  '- AI 能力：LangChain4j 接入大模型，支持流式对话、RAG 知识库、Agent',
  '',
];

for (const { key, title } of SECTIONS) {
  const groups = collect(sidebar[key] ?? []);
  if (groups.length === 0) continue;
  lines.push(`## ${title}`, '');
  for (const g of groups) {
    lines.push(`### ${g.title}`, '');
    for (const item of g.items) {
      const brief = briefOf(item.id);
      lines.push(`- [${item.text}](${toUrl(item.id)})${brief ? `：${brief}` : ''}`);
    }
    lines.push('');
  }
}

lines.push(
  '## 商业信息',
  '',
  `- [产品矩阵](${SITE}/products.html)：抓蛙师出品的开发者工具集`,
  `- [技术服务](${SITE}/services.html)：承接后台管理系统 / 桌面软件 / 小程序 / 大模型应用定制开发，提供完整源码交付`,
  '- 联系方式：邮箱 770492966@qq.com',
  '',
  '## 完整索引',
  '',
  `- [sitemap.xml](${SITE}/sitemap.xml)：全部页面的完整清单`,
  '',
);

const out = lines.join('\n');
const target = resolve(ROOT, 'public/llms.txt');
const entryCount = (out.match(/^- \[/gm) || []).length;
if (process.argv.includes('--check')) {
  const same = readFileSync(target, 'utf8') === out;
  console.log(same ? `llms.txt 已是最新（${entryCount} 个条目）` : 'llms.txt 与侧栏 / 描述不一致：跑 pnpm llms 重新生成');
  process.exit(same ? 0 : 1);
}
writeFileSync(target, out, 'utf8');
console.log(`已生成 llms.txt → public/llms.txt（${entryCount} 个条目，${out.length} 字符）`);
