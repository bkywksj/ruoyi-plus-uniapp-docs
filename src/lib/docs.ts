// 迁移文档的侧栏与上下篇：侧栏结构来自 src/data/sidebar.json（旧站构建产物里读出的分组层级、默认折叠与顺序）
// 上一篇 / 下一篇按侧栏顺序（与 VitePress 一致：同一分区内按侧栏展开后的链接顺序，不在侧栏里的页面没有上下篇）
import sidebarData from '@/data/sidebar.json';
import { pagePath } from '@/lib/seo';

export interface SidebarItem {
  text: string;
  /** 站内页面 id（backend/common/pay）；没有就是纯分组标题 */
  id?: string;
  /** 站外链接 */
  href?: string;
  external?: boolean;
  /** 有这个字段 = 可折叠；true = 默认折叠 */
  collapsed?: boolean;
  items?: SidebarItem[];
}

export const DOC_SECTIONS = ['backend', 'frontend', 'mobile', 'practices'] as const;
export type DocSection = (typeof DOC_SECTIONS)[number];

const sidebars = sidebarData as Record<DocSection, SidebarItem[]>;

/** 页面 id 所属分区（id 的第一段）；不在四个分区里的返回 undefined */
export function sectionOf(id: string): DocSection | undefined {
  const first = id.split('/')[0];
  return (DOC_SECTIONS as readonly string[]).includes(first) ? (first as DocSection) : undefined;
}

/** 分区的侧栏树 */
export function sidebarOf(section: DocSection): SidebarItem[] {
  return sidebars[section];
}

/**
 * 页面 id → 网址：backend/index → /backend/（与旧站 canonical 一致），其余 → /a/b.html
 * @param id 文档 id
 */
export function docPath(id: string): string {
  if (id === 'index') return '/';
  if (id.endsWith('/index')) return `/${id.slice(0, -'/index'.length)}/`;
  return pagePath(`/${id}`);
}

/** 侧栏树按显示顺序摊平成链接列表（上下篇用） */
export function flatten(items: SidebarItem[]): SidebarItem[] {
  return items.flatMap((i) => [...(i.id ? [i] : []), ...(i.items ? flatten(i.items) : [])]);
}

/** 当前页的上一篇 / 下一篇；页面不在侧栏里时两者都没有（与旧站一致） */
export function prevNextOf(id: string): { prev?: SidebarItem; next?: SidebarItem } {
  const section = sectionOf(id);
  if (!section) return {};
  const list = flatten(sidebarOf(section));
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return {};
  return { prev: list[i - 1], next: list[i + 1] };
}

/** 子树里有没有当前页（决定分组默认展开） */
export function containsId(item: SidebarItem, id: string): boolean {
  return item.id === id || (item.items?.some((c) => containsId(c, id)) ?? false);
}
