// docs 模块：文档的栏目、网址与侧栏。栏目表来自 src/data/docs.json，侧栏结构来自 src/data/sidebar.json
// （迁移时 scripts/migrate/extract-sidebar.mjs 从旧站构建产物读出分组层级、默认折叠与顺序）。
// sidebar.json 两种形状都认：
//   { "docs": [...] }                 全站一棵侧栏，上一篇 / 下一篇按整棵展开后的顺序走（旧站 sidebar 是一个数组时）
//   { "<栏目 id>": [...], ... }        每个栏目一棵，上一篇 / 下一篇只在本栏目内走（旧站 sidebar 按路径前缀分组时）
// 侧栏按页面 id 记（guide/ipc），载入时统一换成网址，交给 lib/sidebar（按网址工作）去算展开与上下篇
import sidebarData from '@/data/sidebar.json';
import { docsConfig } from '@/lib/docs-config';
import { pagePath } from '@/lib/seo';
import { sidebarPrevNext, type SidebarItem } from '@/lib/sidebar';

/** sidebar.json 里的一项：站内页面写 id，站外链接写 href */
interface RawSidebarItem {
  text: string;
  id?: string;
  href?: string;
  external?: boolean;
  /** 有这个字段 = 可折叠；true = 默认折叠（与 SidebarItem.collapsed 同义） */
  collapsed?: boolean;
  items?: RawSidebarItem[];
}

/** 栏目 id（页面 id 的第一段） */
export type DocSection = string;

/** 全部栏目 id，顺序同 docs.json（404 页、页头下拉按这个顺序列） */
export const DOC_SECTIONS: readonly DocSection[] = docsConfig.sections.map((s) => s.id);

/** 栏目中文名：面包屑、栏目首页首屏、404 页用（与页头导航的叫法一致） */
export const SECTION_LABELS: Record<DocSection, string> = Object.fromEntries(docsConfig.sections.map((s) => [s.id, s.label]));

/**
 * 页面 id → 网址，与 sitemap、canonical 同一口径（lib/seo.ts 的 pagePath，按 site.urlFormat）：
 * file 下 guide/a → /guide/a.html；preserve 下栏目首页 backend/index → /backend/、其余 /a/b.html；directory 下 /guide/a/
 * @param id 文档 id（相对 src/content/docs 的路径去掉 .md）
 * @returns 站点首页 index 恒为 /
 */
export function docPath(id: string): string {
  if (id === 'index') return '/';
  return pagePath(`/${id}`);
}

/** sidebar.json 的 id 换成网址；站外链接标 external（新窗口、不参与上下篇） */
function toSidebar(items: RawSidebarItem[]): SidebarItem[] {
  return items.map((item) => ({
    text: item.text,
    ...(item.id ? { href: docPath(item.id) } : item.href ? { href: item.href, external: item.external ?? /^https?:/.test(item.href) } : {}),
    ...(item.collapsed !== undefined ? { collapsed: item.collapsed } : {}),
    ...(item.items ? { items: toSidebar(item.items) } : {}),
  }));
}

const rawSidebar = sidebarData as Record<string, RawSidebarItem[]>;
/** true = 全站一棵（sidebar.json 只有 docs 一个键且 docs 不是栏目名） */
const SINGLE_TREE = Object.keys(rawSidebar).length === 1 && 'docs' in rawSidebar && !DOC_SECTIONS.includes('docs');
const TREES: Record<string, SidebarItem[]> = Object.fromEntries(Object.entries(rawSidebar).map(([key, items]) => [key, toSidebar(items)]));

/** 页面 id 所属栏目（id 的第一段）；不在任何栏目里的（faq、products 这类根目录单页）返回 undefined */
export function sectionOf(id: string): DocSection | undefined {
  const first = id.split('/')[0];
  return DOC_SECTIONS.includes(first) ? first : undefined;
}

/**
 * 栏目的侧栏树（网址形态）。全站一棵时各栏目拿到的是同一棵
 * @returns 栏目没有侧栏时为空数组（布局据此不渲染侧栏列）
 */
export function sidebarOf(section: DocSection): SidebarItem[] {
  return SINGLE_TREE ? TREES.docs : (TREES[section] ?? []);
}

/**
 * 当前页的上一篇 / 下一篇：按侧栏展开后的顺序（全站一棵时跨栏目走，每栏目一棵时只在本栏目内走）
 * @returns 页面不在侧栏里（孤立页）时两者都没有，与旧站一致
 */
export function prevNextOf(id: string): { prev?: SidebarItem; next?: SidebarItem } {
  if (SINGLE_TREE) return sidebarPrevNext(TREES.docs, docPath(id));
  const section = sectionOf(id);
  return section ? sidebarPrevNext(sidebarOf(section), docPath(id)) : {};
}

/**
 * 栏目入口：面包屑上栏目名点过去的地方（规则见 docs.json 的 sections[].home 说明）
 * @param section 栏目 id
 */
export function sectionHref(section: DocSection): string {
  const home = docsConfig.sections.find((s) => s.id === section)?.home;
  if (!home) return docPath(`${section}/index`);
  return home.startsWith('/') ? pagePath(home) : docPath(home);
}

/**
 * 当前页在侧栏里的分组路径（不含页面本身），给面包屑用：如 features/sync → ['组织与效率']
 * @param id 文档 id
 * @returns 外层到内层的分组名；页面不在侧栏里返回空数组
 */
export function sidebarTrailOf(id: string): string[] {
  const section = sectionOf(id);
  const tree = SINGLE_TREE ? TREES.docs : section ? sidebarOf(section) : [];
  const target = docPath(id);
  const find = (items: SidebarItem[], trail: string[]): string[] | null => {
    for (const item of items) {
      if (item.href === target) return trail;
      if (item.items) {
        const hit = find(item.items, [...trail, item.text]);
        if (hit) return hit;
      }
    }
    return null;
  };
  return find(tree, []) ?? [];
}
