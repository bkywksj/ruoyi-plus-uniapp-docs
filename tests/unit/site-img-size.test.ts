// 图片宽高读取（rehypeImgSize 用）：真实图片的期望值取自 `file` 命令的独立读数，不是本函数自己算出来的；
// 仓库里没有 VP8L / VP8X 编码的 WebP，这两种用手工拼的文件头覆盖
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import { imageSize } from '../../src/lib/markdown/img-size.mjs';
import { rehypeImgSize } from '../../src/lib/markdown/docs-layout.mjs';

const pub = (p: string) => join(process.cwd(), 'public', p);
const tmp = mkdtempSync(join(tmpdir(), 'img-size-'));
const write = (name: string, buf: Buffer | string) => {
  const f = join(tmp, name);
  writeFileSync(f, buf);
  return f;
};

describe('imageSize', () => {
  it('真实图片：PNG / JPEG / 中文文件名 PNG / WebP(VP8) / SVG', () => {
    expect(imageSize(pub('uni.png'))).toEqual({ width: 400, height: 400 });
    expect(imageSize(pub('wx.jpg'))).toEqual({ width: 950, height: 1296 });
    expect(imageSize(pub('images/commit.jpg'))).toEqual({ width: 2517, height: 1333 });
    expect(imageSize(pub('软著.png'))).toEqual({ width: 1191, height: 1606 });
    expect(imageSize(pub('demo/03-dashboard.webp'))).toEqual({ width: 1920, height: 1012 });
    expect(imageSize(pub('products/sigil.svg'))).toEqual({ width: 1024, height: 1024 });
  });

  it('WebP 的 VP8L / VP8X 两种头', () => {
    // VP8L：第 21 字节起 14 位宽 - 1、14 位高 - 1
    const l = Buffer.alloc(32);
    l.write('RIFF', 0, 'ascii');
    l.write('WEBPVP8L', 8, 'ascii');
    l.writeUInt32LE((300 - 1) | ((200 - 1) << 14), 21);
    expect(imageSize(write('l.webp', l))).toEqual({ width: 300, height: 200 });
    // VP8X：第 24、27 字节起各 24 位，存的是宽 - 1、高 - 1
    const x = Buffer.alloc(32);
    x.write('RIFF', 0, 'ascii');
    x.write('WEBPVP8X', 8, 'ascii');
    x.writeUIntLE(640 - 1, 24, 3);
    x.writeUIntLE(480 - 1, 27, 3);
    expect(imageSize(write('x.webp', x))).toEqual({ width: 640, height: 480 });
  });

  it('SVG 只有 viewBox 时用 viewBox；认不出的文件与不存在的文件返回 null', () => {
    expect(imageSize(write('v.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"></svg>'))).toEqual({ width: 120, height: 40 });
    expect(imageSize(write('a.txt', 'hello'))).toBeNull();
    expect(imageSize(join(tmp, 'none.png'))).toBeNull();
  });
});

describe('rehypeImgSize', () => {
  const render = async (md: string) => {
    const p = await createMarkdownProcessor({ rehypePlugins: [rehypeImgSize] });
    return (await p.render(md)).code;
  };

  it('本站图片补宽高与 decoding，站外图片只补 decoding', async () => {
    const html = await render('![](/uni.png)\n\n![](https://example.com/a.png)');
    expect(html).toMatch(/<img[^>]*src="\/uni\.png"[^>]*width="400"[^>]*height="400"|<img[^>]*width="400"[^>]*height="400"[^>]*src="\/uni\.png"/);
    expect(html).toMatch(/<img[^>]*src="https:\/\/example\.com\/a\.png"[^>]*decoding="async"/);
    expect(html).not.toMatch(/example\.com\/a\.png"[^>]*width=/);
  });

  it('正文里的原始 HTML 图片也处理；已写宽高或行内 style 指定尺寸的不动', async () => {
    const html = await render('<img src="/wx.jpg" alt="">\n\n<img src="/uni.png" width="50">\n\n<img src="/uni.png" style="width:240px;height:320px">');
    expect(html).toMatch(/<img[^>]*src="\/wx\.jpg"[^>]*width="950"[^>]*height="1296"/);
    expect(html).toMatch(/<img[^>]*src="\/uni\.png"[^>]*width="50"(?![^>]*height=)/);
    expect(html).toMatch(/<img[^>]*style="width:240px;height:320px"(?![^>]*width=")/);
  });
});
