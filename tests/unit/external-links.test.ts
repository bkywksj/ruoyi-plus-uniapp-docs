// docs 模块 · 正文站外链接新标签页打开（rehypeExternalLinks）：产品官网、授权站等链接不能把读者带离文档页
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import { docsRehypePlugins } from '../../src/lib/markdown/docs-plugins.mjs';
import { rehypeExternalLinks } from '../../src/lib/markdown/docs-layout.mjs';

const render = async (md: string, plugins: any[] = [rehypeExternalLinks]) => {
  const p = await createMarkdownProcessor({ rehypePlugins: plugins });
  return (await p.render(md)).code;
};

describe('rehypeExternalLinks', () => {
  it('站外链接（含裸网址自动链接）补 target="_blank" 与 rel="noopener"', async () => {
    const html = await render('官网 [ruoyi.plus](https://ruoyi.plus)，截图工具 https://agileshot.ruoyi.plus');
    expect(html.length).toBeGreaterThan(0);
    expect(html).toMatch(/<a href="https:\/\/ruoyi\.plus" target="_blank" rel="noopener">/);
    expect(html).toMatch(/<a href="https:\/\/agileshot\.ruoyi\.plus" target="_blank" rel="noopener">/);
  });

  it('站内链接、锚点不动', async () => {
    const html = await render('[下载](/download.html) [小节](#faq)');
    expect(html).toMatch(/<a href="\/download\.html">/);
    expect(html).toMatch(/<a href="#faq">/);
    expect(html).not.toMatch(/href="\/download\.html"[^>]*target/);
  });

  it('接进了 docs 模块的 rehype 插件链（各站 astro.config 用的就是这份数组）', async () => {
    const html = await render('[官网](https://ruoyi.plus)', docsRehypePlugins);
    expect(html).toMatch(/<a href="https:\/\/ruoyi\.plus" target="_blank" rel="noopener">/);
  });
});
