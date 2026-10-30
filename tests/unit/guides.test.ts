// 使用指南的排序与上下篇（src/lib/guides.ts 的纯函数）：侧栏、指南首页、上一篇 / 下一篇都靠它定顺序
import { describe, expect, it, vi } from 'vitest';

// guides.ts 顶部引了 astro:content（只给 getGuides 用），单测只测纯函数，替身一下避免解析虚拟模块
vi.mock('astro:content', () => ({ getCollection: vi.fn() }));

const { GUIDE_SECTIONS, sortGuides, groupBySection, prevNext, guidePath } = await import('@/lib/guides');

type Section = (typeof GUIDE_SECTIONS)[number];
// 分组名一律从 GUIDE_SECTIONS 取：派生站会按自己的文档改分组（见 guides-docs 技能），写死框架示例的分组名会让它编译不过
const [S1, S2, S3] = GUIDE_SECTIONS as readonly Section[];
const g = (id: string, section: Section, order: number) => ({ id, data: { section, order } });

describe('sortGuides', () => {
  it('先按分组顺序，再按组内 order（不是按文件名、也不是按写入顺序）', () => {
    const list = [
      g('advanced-b', S2, 2),
      g('faq', S3, 1),
      g('start', S1, 1),
      g('advanced-a', S2, 1),
    ];
    expect(sortGuides(list).map((x) => x.id)).toEqual(['start', 'advanced-a', 'advanced-b', 'faq']);
  });

  it('order 相同时按 id 排，构建结果稳定', () => {
    expect(sortGuides([g('b', S1, 1), g('a', S1, 1)]).map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('不改动传入的数组', () => {
    const list = [g('b', S1, 2), g('a', S1, 1)];
    sortGuides(list);
    expect(list.map((x) => x.id)).toEqual(['b', 'a']);
  });
});

describe('groupBySection', () => {
  it('按 GUIDE_SECTIONS 的顺序分组，没有篇目的分组不出现', () => {
    const groups = groupBySection(sortGuides([g('f', S3, 1), g('s', S1, 1)]));
    expect(groups.map((x) => x.section)).toEqual([S1, S3]);
  });
});

describe('prevNext', () => {
  const sorted = sortGuides([g('start', S1, 1), g('advanced', S2, 1), g('faq', S3, 1)]);

  it('跨分组连续：第一组最后一篇的下一篇是第二组第一篇', () => {
    expect(prevNext(sorted, 'start').next?.id).toBe('advanced');
    expect(prevNext(sorted, 'faq').prev?.id).toBe('advanced');
  });

  it('首篇没有上一篇、末篇没有下一篇', () => {
    expect(prevNext(sorted, 'start').prev).toBeUndefined();
    expect(prevNext(sorted, 'faq').next).toBeUndefined();
  });

  it('不存在的 id 两边都为空', () => {
    expect(prevNext(sorted, 'nope')).toEqual({});
  });
});

describe('guidePath', () => {
  it('网址跟随 site.urlFormat（框架默认 directory：带结尾斜杠）', () => {
    expect(guidePath('quick-start')).toBe('/guide/quick-start/');
  });
});
