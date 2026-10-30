// 文档侧栏树：任意层级的分组 → 子分组 → 页面。侧栏渲染（SidebarTree.astro）、上一篇 / 下一篇、分组默认展开都从这里算。
// 按「已解析好的网址」工作而不是按集合 id：指南、迁移文档、手写页面都能挂进同一棵树，组件不用知道内容从哪来。

export interface SidebarItem {
  text: string;
  /** 站内页面网址（已经过 pagePath 等处理）或站外链接；没有就是纯分组标题 */
  href?: string;
  /** 站外链接：新窗口打开，不参与上一篇 / 下一篇 */
  external?: boolean;
  /**
   * 分组的折叠方式：不写 = 固定展开、不可折叠（一层分组的站就是这种）；false = 可折叠、默认展开；true = 可折叠、默认收起。
   * 当前页所在的分组无论如何都展开，读者一进来就看得到自己在哪
   */
  collapsed?: boolean;
  items?: SidebarItem[];
}

/** 网址比较前归一：去掉 #锚点 与 ?参数，读者从带锚点的链接进来也能认出当前页 */
function normalize(href: string): string {
  return href.replace(/[?#].*$/, '');
}

/**
 * 子树里有没有当前页。
 * @param item 分组或页面
 * @param current 当前页网址
 */
export function containsHref(item: SidebarItem, current: string): boolean {
  const target = normalize(current);
  return (
    (!!item.href && !item.external && normalize(item.href) === target) ||
    (item.items?.some((child) => containsHref(child, current)) ?? false)
  );
}

/**
 * 分组此刻展不展开：固定分组恒展开；可折叠分组按 collapsed，含当前页时强制展开。
 * @param item 有 items 的分组
 * @param current 当前页网址
 */
export function isGroupOpen(item: SidebarItem, current: string): boolean {
  if (item.collapsed === undefined || item.collapsed === false) return true;
  return containsHref(item, current);
}

/**
 * 按侧栏显示顺序摊平成站内页面列表（分组标题本身有链接的也算一项，站外链接不算）。
 * @param items 侧栏树
 */
export function flattenLinks(items: SidebarItem[]): SidebarItem[] {
  return items.flatMap((item) => [
    ...(item.href && !item.external ? [item] : []),
    ...(item.items ? flattenLinks(item.items) : []),
  ]);
}

/**
 * 侧栏顺序里的上一篇 / 下一篇（跨分组连续）；当前页不在侧栏里时两边都为空，与 VitePress 行为一致。
 * @param items 侧栏树
 * @param current 当前页网址
 */
export function sidebarPrevNext(items: SidebarItem[], current: string): { prev?: SidebarItem; next?: SidebarItem } {
  const list = flattenLinks(items);
  const i = list.findIndex((item) => normalize(item.href!) === normalize(current));
  if (i === -1) return {};
  return { prev: list[i - 1], next: list[i + 1] };
}
