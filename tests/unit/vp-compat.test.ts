// VitePress 写法兼容插件：用 Astro 自己的 unified 管线（@astrojs/markdown-remark）把 Markdown 渲染成 HTML 再断言
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import {
  fixLink,
  rehypeVpHeadingIds,
  remarkVpContainers,
  remarkVpLinks,
  remarkVpMarks,
  vpSlugify,
} from '@/lib/markdown/vp-compat.mjs';
import marks from '@/data/vp-marks.json';
import icons from '@/data/vp-icons.json';

const unknown: string[] = [];
const processor = await createMarkdownProcessor({
  smartypants: false,
  remarkPlugins: [
    remarkVpContainers,
    [remarkVpMarks, { marks, icons, onUnknown: (tag: string) => unknown.push(tag) }],
    remarkVpLinks,
  ],
  rehypePlugins: [rehypeVpHeadingIds],
});
const render = async (md: string) => (await processor.render(md)).code;

describe('::: 容器', () => {
  it('前后空行的写法：开闭标签之间的 Markdown 照常解析', async () => {
    const html = await render('::: warning 注意\n\n这里有 **粗体**\n\n:::\n');
    expect(html).toContain('<div class="vp-callout vp-callout-warning"><p class="vp-callout-title">注意</p>');
    expect(html).toContain('<strong>粗体</strong>');
    expect(html).toMatch(/<\/div>\s*$/);
    expect(html).not.toContain(':::');
  });

  it('开闭标记和内容挤在同一段（没空行）也能认；没写标题用 VitePress 默认标题', async () => {
    const html = await render('::: tip\n一句提示\n:::\n');
    expect(html).toContain('<p class="vp-callout-title">TIP</p>');
    expect(html).toContain('一句提示');
    expect(html).not.toContain(':::');
  });

  it('details 容器 → <details><summary>，容器里的代码块原样保留', async () => {
    const html = await render('::: details 展开看\n\n```js\nconst a = 1\n```\n\n:::\n');
    expect(html).toContain('<details class="vp-callout vp-callout-details"><summary>展开看</summary>');
    expect(html).toContain('const');
    expect(html).toMatch(/<\/pre>\s*<\/details>/);
  });

  it('代码块里的 ::: 不当容器', async () => {
    const html = await render('```md\n::: tip\n不是容器\n:::\n```\n');
    expect(html).not.toContain('vp-callout');
    expect(html).toContain('::: tip');
  });

  it('容器没闭合 → 构建失败（旧站会把后文全吞进容器，这里让它显形）', async () => {
    await expect(render('::: danger 危险\n\n后面没有闭合\n')).rejects.toThrow(/没闭合/);
  });
});

describe('状态标记与图标', () => {
  it('<Ok/> 与 <Icon icon> → 内联 SVG，带配置里的 class', async () => {
    const html = await render('完成 <Ok/>，失败 <No />，图标 <Icon icon="lucide:rocket" />\n');
    expect(html).toMatch(/<svg[^>]*class="iconify imark imark-ok"/);
    expect(html).toMatch(/<svg[^>]*class="iconify imark imark-no"/);
    expect(html).toMatch(/<svg[^>]*class="iconify iconify-inline"/);
    expect(html).not.toMatch(/<Ok|<Icon/);
  });

  it('图标数据里没有的图标 → 构建失败（Iconify 运行时会静默画空）', async () => {
    await expect(render('<Icon icon="lucide:not-exist" />\n')).rejects.toThrow(/图标不存在/);
  });

  it('没配置的大写组件交给 onUnknown 报告，不吞内容', async () => {
    unknown.length = 0;
    await render('这里有 <AProductCard name="x" /> 组件\n');
    expect(unknown).toContain('AProductCard');
  });
});

describe('VitePress 其它兼容', () => {
  it('标题 id 用 VitePress 规则：数字开头加 _，同名递增', async () => {
    const html = await render('## 1. 安装\n\n## 配置 API\n\n## 配置 API\n');
    expect(html).toContain('id="_1-安装"');
    expect(html).toContain('id="配置-api"');
    expect(html).toContain('id="配置-api-1"');
    expect(vpSlugify("What's New?")).toBe('what-s-new');
  });

  it('站内链接补 .html；站外、锚点、目录、带扩展名的不动', async () => {
    expect(fixLink('./guide.md#a')).toBe('./guide.html#a');
    expect(fixLink('/backend/common/pay')).toBe('/backend/common/pay.html');
    expect(fixLink('/backend/')).toBe('/backend/');
    expect(fixLink('/logo.png')).toBe('/logo.png');
    expect(fixLink('https://a.com/x')).toBe('https://a.com/x');
    expect(fixLink('#top')).toBe('#top');
    expect(await render('[支付](/backend/common/pay)\n')).toContain('href="/backend/common/pay.html"');
  });

  it("正文里的 {{ }} 与弯引号：原样保留（旧站 Vue 会吞 {{ }}、SmartyPants 会把 'none' 改成弯引号）", async () => {
    const html = await render("模板写法 {{ user.name }}，取值 'none'。\n");
    expect(html).toContain('{{ user.name }}');
    expect(html).toContain("'none'");
  });
});
