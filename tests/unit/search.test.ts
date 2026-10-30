import { describe, expect, it } from 'vitest';
import { normalize, parseQuery, scoreItem, searchItems } from '@/lib/search';

const items = [
  { title: '静态站也能做好搜索', summary: '前端检索', tags: ['搜索'], category: '深入原理' },
  { title: '十分钟跑通第一个内容站', summary: '入门', tags: ['Astro'], category: '入门上手' },
  { title: '一次完整的上线流程', summary: '部署到 Docker', tags: ['部署'], category: '实战案例' },
];

describe('normalize / parseQuery', () => {
  it('全角转半角并小写', () => {
    expect(normalize('ＡＳＴＲＯ')).toBe('astro');
  });
  it('按空白拆词，空查询返回空数组', () => {
    expect(parseQuery('  静态  搜索 ')).toEqual(['静态', '搜索']);
    expect(parseQuery('   ')).toEqual([]);
  });
});

describe('searchItems', () => {
  it('中文子串可以命中（不依赖分词）', () => {
    expect(searchItems(items, '静态站').map((item) => item.title)).toEqual(['静态站也能做好搜索']);
  });
  it('多个词是 AND 关系', () => {
    expect(searchItems(items, '内容站 astro')).toHaveLength(1);
    expect(searchItems(items, '内容站 docker')).toHaveLength(0);
  });
  it('标题命中排在摘要命中之前', () => {
    const list = [
      { title: '其他', summary: '讲部署', tags: [] },
      { title: '部署指南', summary: '其他', tags: [] },
    ];
    expect(searchItems(list, '部署')[0].title).toBe('部署指南');
  });
  it('空查询保持原顺序', () => {
    expect(searchItems(items, '')).toEqual(items);
  });
  it('不匹配时得分为 0', () => {
    expect(scoreItem(items[0], ['不存在的词'])).toBe(0);
  });
});
