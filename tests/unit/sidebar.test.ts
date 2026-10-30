// 多层侧栏：纯函数（lib/sidebar.ts）+ 组件渲染（SidebarTree.astro，用 Astro 容器 API 在 Node 里渲染成 HTML）
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import SidebarTree from '@/components/docs/SidebarTree.astro';
import { containsHref, flattenLinks, isGroupOpen, sidebarPrevNext, type SidebarItem } from '@/lib/sidebar';

// 三层：固定分组「入门」→ 可折叠子分组「组件」（默认收起）→ 再一层「表单」（默认收起）
const tree: SidebarItem[] = [
  {
    text: '入门',
    items: [
      { text: '简介', href: '/docs/intro.html' },
      {
        text: '组件',
        collapsed: true,
        items: [
          { text: '按钮', href: '/docs/button.html' },
          { text: '表单', collapsed: true, items: [{ text: '输入框', href: '/docs/input.html' }] },
        ],
      },
      { text: 'GitHub', href: 'https://github.com/x', external: true },
    ],
  },
  { text: '进阶', collapsed: false, items: [{ text: '部署', href: '/docs/deploy.html' }] },
];
const components = tree[0].items![1];
const form = components.items![1];

describe('lib/sidebar', () => {
  it('flattenLinks 按显示顺序摊平，站外链接与纯分组标题不算', () => {
    expect(flattenLinks(tree).map((i) => i.href)).toEqual([
      '/docs/intro.html',
      '/docs/button.html',
      '/docs/input.html',
      '/docs/deploy.html',
    ]);
  });

  it('上一篇 / 下一篇跨分组、跨层级连续；不在侧栏里的页面两边都没有', () => {
    expect(sidebarPrevNext(tree, '/docs/input.html')).toEqual({
      prev: { text: '按钮', href: '/docs/button.html' },
      next: { text: '部署', href: '/docs/deploy.html' },
    });
    expect(sidebarPrevNext(tree, '/docs/intro.html').prev).toBeUndefined();
    expect(sidebarPrevNext(tree, '/docs/orphan.html')).toEqual({});
  });

  it('当前页认网址时忽略 #锚点 与 ?参数', () => {
    expect(containsHref(form, '/docs/input.html#props')).toBe(true);
    expect(sidebarPrevNext(tree, '/docs/button.html?from=search').next?.href).toBe('/docs/input.html');
  });

  it('默认收起的分组只在含当前页时展开；固定分组与 collapsed:false 恒展开', () => {
    expect(isGroupOpen(components, '/docs/deploy.html')).toBe(false);
    expect(isGroupOpen(components, '/docs/input.html')).toBe(true);
    expect(isGroupOpen(form, '/docs/input.html')).toBe(true);
    expect(isGroupOpen(tree[0], '/docs/deploy.html')).toBe(true);
    expect(isGroupOpen(tree[1], '/docs/intro.html')).toBe(true);
  });
});

describe('SidebarTree 渲染', async () => {
  const container = await AstroContainer.create();
  const render = (current: string) =>
    container.renderToString(SidebarTree, { props: { items: tree, current } });

  it('当前页高亮，它所在的两层可折叠分组都展开', async () => {
    const html = await render('/docs/input.html');
    expect(html.length).toBeGreaterThan(0);
    expect(html).toMatch(/<a href="\/docs\/input\.html" aria-current="page"/);
    // 「组件」「表单」两个 details 都带 open
    expect(html.match(/<details open[^>]*data-sidebar-group/g)?.length).toBe(3);
  });

  it('当前页不在某个默认收起的分组里时，那个分组保持收起', async () => {
    const html = await render('/docs/deploy.html');
    // 只有「进阶」（collapsed:false）展开；「组件」「表单」收起
    expect(html.match(/<details open[^>]*data-sidebar-group/g)?.length).toBe(1);
    expect(html.match(/<details[^>]*data-sidebar-group/g)?.length).toBe(3);
    expect(html).not.toContain(
      'aria-current="page" class="block rounded-md px-3 py-1.5 transition-colors text-muted',
    );
  });

  it('固定分组画成标题、不可折叠；站外链接新窗口打开', async () => {
    const html = await render('/docs/intro.html');
    expect(html).toMatch(/<p class="px-3 text-xs font-semibold tracking-wider text-muted">\s*入门\s*<\/p>/);
    expect(html).toMatch(/<a href="https:\/\/github\.com\/x"[^>]*target="_blank"[^>]*rel="noopener"/);
  });
});
