// 使用指南（guides 集合）的查询与排序：侧栏分组、上一篇 / 下一篇、路径都从这里取，页面不各自排序
import { getCollection, type CollectionEntry } from 'astro:content';
import { GUIDE_SECTIONS, type GuideSection } from './guide-sections';
import { pagePath } from './seo';

export { GUIDE_SECTIONS, type GuideSection };
export type Guide = CollectionEntry<'guides'>;

/** 只依赖排序所需字段，便于单测直接传普通对象 */
interface Sortable {
  id: string;
  data: { section: GuideSection; order: number };
}

/**
 * 按「分组顺序 → 组内 order」排；order 相同按 id，保证每次构建顺序稳定。
 * @param list 待排序篇目（不会被修改）
 * @returns 新数组
 */
export function sortGuides<T extends Sortable>(list: T[]): T[] {
  const rank = (g: T) => GUIDE_SECTIONS.indexOf(g.data.section);
  return [...list].sort(
    (a, b) => rank(a) - rank(b) || a.data.order - b.data.order || a.id.localeCompare(b.id),
  );
}

/**
 * 已排序的列表按分组切开。
 * @param sorted sortGuides 的结果
 * @returns 按 GUIDE_SECTIONS 顺序的分组；没有篇目的分组不出现
 */
export function groupBySection<T extends Sortable>(sorted: T[]): { section: GuideSection; items: T[] }[] {
  return GUIDE_SECTIONS.map((section) => ({
    section,
    items: sorted.filter((g) => g.data.section === section),
  })).filter((group) => group.items.length > 0);
}

/**
 * 全站顺序里的上一篇 / 下一篇：跨分组连续，读完「入门」最后一篇直接进「进阶」第一篇。
 * @param sorted sortGuides 的结果
 * @param id 当前篇 id
 * @returns 首篇无 prev、末篇无 next；id 不存在时两边都为空
 */
export function prevNext<T extends Sortable>(sorted: T[], id: string): { prev?: T; next?: T } {
  const i = sorted.findIndex((g) => g.id === id);
  if (i === -1) return {};
  return { prev: sorted[i - 1], next: sorted[i + 1] };
}

/** 指南地址：网址形态跟随 site.urlFormat（见 lib/seo.ts 的 pagePath） */
export function guidePath(id: string): string {
  return pagePath(`/guide/${id}`);
}

/** 全部已发布指南（排除 draft），已排序 */
export async function getGuides(): Promise<Guide[]> {
  return sortGuides(await getCollection('guides', (g) => !g.data.draft));
}
