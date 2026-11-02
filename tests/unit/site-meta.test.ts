// docs 模块 · scripts/lib/site-meta.mjs：Node 脚本读站点信息与拼网址。
// 🔴 两套网址规则（lib/seo.ts 的 pagePath 给页面用、site-meta 的 pagePathFor 给 llms / IndexNow 脚本用）必须逐条一致，
// 否则 llms.txt 与 IndexNow 推出去的地址和页面 canonical 对不上
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { pagePath } from '@/lib/seo';
import { site } from '@/site.config';
import { docUrl, pagePathFor, readSiteMeta } from '../../scripts/lib/site-meta.mjs';

const PATHS = ['/', '/guide/a', '/guide/a/', '/guide/a.html', '/backend/index', '/backend/', '/backend/index.html', '/a/b/c', '/中文/页'];
const FORMATS = ['directory', 'file', 'preserve'] as const;

describe('pagePathFor 与 lib/seo.ts 的 pagePath 逐条一致', () => {
  const original = site.urlFormat;
  afterEach(() => {
    site.urlFormat = original;
  });
  for (const format of FORMATS) {
    it(format, () => {
      site.urlFormat = format;
      for (const p of PATHS) expect(pagePathFor(p, format), `${format} ${p}`).toBe(pagePath(p));
    });
  }
});

describe('readSiteMeta', () => {
  it('读出本站 site.config.ts 顶层的 url / urlFormat / name', () => {
    const meta = readSiteMeta(process.cwd());
    expect(meta.url).toBe(site.url);
    expect(meta.urlFormat).toBe(site.urlFormat);
    expect(meta.name).toBe(site.name);
  });
  it('只认两格缩进的顶层字段：author.url 写在前面也不会被当成站点域名', () => {
    const root = mkdtempSync(join(tmpdir(), 'site-meta-'));
    mkdirSync(join(root, 'src'));
    writeFileSync(
      join(root, 'src/site.config.ts'),
      "export const site = {\n  author: {\n    url: 'https://author.example',\n  },\n  name: '站',\n  url: 'https://site.example/',\n  urlFormat: 'file' as UrlFormat,\n};\n",
    );
    expect(readSiteMeta(root)).toMatchObject({ url: 'https://site.example', urlFormat: 'file', name: '站' });
  });
  it('docUrl：站点首页恒为根地址，其余按网址形态', () => {
    expect(docUrl({ url: 'https://a.com', urlFormat: 'file' }, 'index')).toBe('https://a.com/');
    expect(docUrl({ url: 'https://a.com', urlFormat: 'file' }, 'guide/x')).toBe('https://a.com/guide/x.html');
    expect(docUrl({ url: 'https://a.com', urlFormat: 'preserve' }, 'backend/index')).toBe('https://a.com/backend/');
    expect(docUrl({ url: 'https://a.com', urlFormat: 'directory' }, 'guide/x')).toBe('https://a.com/guide/x/');
  });
});
