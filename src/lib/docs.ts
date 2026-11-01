// 迁移文档的分区、网址与侧栏：侧栏结构来自 src/data/sidebar.json（旧站构建产物里读出的分组层级、默认折叠与顺序）
// sidebar.json 按页面 id 记（backend/common/pay），载入时统一换成网址，交给框架的 lib/sidebar（按网址工作）去算展开与上下篇
import sidebarData from '@/data/sidebar.json';
import { pagePath } from '@/lib/seo';
import { sidebarPrevNext, type SidebarItem } from '@/lib/sidebar';

/** sidebar.json 里的一项：站内页面写 id，站外链接写 href */
interface RawSidebarItem {
  text: string;
  id?: string;
  href?: string;
  external?: boolean;
  /** 有这个字段 = 可折叠；true = 默认折叠（与框架 SidebarItem.collapsed 同义） */
  collapsed?: boolean;
  items?: RawSidebarItem[];
}

export const DOC_SECTIONS = ['backend', 'frontend', 'mobile', 'practices'] as const;
export type DocSection = (typeof DOC_SECTIONS)[number];

/**
 * 页面 id → 网址：backend/index → /backend/（与旧站 canonical 一致），其余 → /a/b.html
 * @param id 文档 id
 */
export function docPath(id: string): string {
  if (id === 'index') return '/';
  if (id.endsWith('/index')) return `/${id.slice(0, -'/index'.length)}/`;
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

const sidebars = Object.fromEntries(
  Object.entries(sidebarData as Record<DocSection, RawSidebarItem[]>).map(([section, items]) => [section, toSidebar(items)]),
) as Record<DocSection, SidebarItem[]>;

/** 页面 id 所属分区（id 的第一段）；不在四个分区里的返回 undefined */
export function sectionOf(id: string): DocSection | undefined {
  const first = id.split('/')[0];
  return (DOC_SECTIONS as readonly string[]).includes(first) ? (first as DocSection) : undefined;
}

/** 分区的侧栏树（网址形态） */
export function sidebarOf(section: DocSection): SidebarItem[] {
  return sidebars[section];
}

/** 当前页的上一篇 / 下一篇：同一分区内按侧栏展开后的顺序；页面不在侧栏里时两者都没有（与旧站一致） */
export function prevNextOf(id: string): { prev?: SidebarItem; next?: SidebarItem } {
  const section = sectionOf(id);
  return section ? sidebarPrevNext(sidebarOf(section), docPath(id)) : {};
}

/** 分区中文名：面包屑带、栏目首页首屏用（与页头导航的叫法一致） */
export const SECTION_LABELS: Record<DocSection, string> = {
  backend: '后端',
  frontend: '前端',
  mobile: '移动端',
  practices: '最佳实践',
};

/**
 * 当前页在侧栏里的分组路径（不含页面本身），给面包屑带用：如 mobile/getting-started → ['快速开始']
 * @param id 文档 id
 * @returns 外层到内层的分组名；页面不在侧栏里（孤立页）返回空数组
 */
export function sidebarTrailOf(id: string): string[] {
  const section = sectionOf(id);
  if (!section) return [];
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
  return find(sidebarOf(section), []) ?? [];
}

