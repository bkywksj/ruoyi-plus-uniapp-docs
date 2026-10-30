// 软件版本数据：解析、排序、白名单与按平台取包
import { describe, expect, it } from 'vitest';
import { DOWNLOAD_ORIGINS, compareVersion, findAsset, formatSize, noteLines, parseReleases } from '@/lib/releases';

const ORIGIN = DOWNLOAD_ORIGINS[0];

function rel(version: string, over: Record<string, unknown> = {}) {
  return {
    id: version,
    version,
    notes: '修复若干问题',
    date: '2026-11-02T10:00:00+08:00',
    url: `${ORIGIN}v${version}/my-app_${version}_x64-setup.exe`,
    size: 11_937_520,
    sha256: 'a'.repeat(64),
    ...over,
  };
}

const asset = {
  platform: 'macos-aarch64',
  label: 'macOS（Apple 芯片）',
  file: 'my-app_1.1.0_aarch64.dmg',
  url: `${ORIGIN}v1.1.0/my-app_1.1.0_aarch64.dmg`,
  size: 12_853_649,
  sha256: 'b'.repeat(64),
};

describe('parseReleases', () => {
  it('按版本号新到旧排序（不是字符串序：0.1.10 > 0.1.9）', () => {
    const list = parseReleases([rel('0.1.9'), rel('0.1.10'), rel('0.1.0')]);
    expect(list.map((r) => r.version)).toEqual(['0.1.10', '0.1.9', '0.1.0']);
  });

  it('主安装包地址不在白名单 → 构建失败', () => {
    expect(() => parseReleases([rel('1.0.0', { url: 'https://evil.example/app.exe' })])).toThrow();
    // 前缀相似但不同目录也不行：白名单精确到项目目录
    expect(() => parseReleases([rel('1.0.0', { url: `${ORIGIN.replace(/\/$/, '')}-evil/app.exe` })])).toThrow();
  });

  it('sha256 形状不对 → 构建失败', () => {
    expect(() => parseReleases([rel('1.0.0', { sha256: 'abc' })])).toThrow();
    expect(() => parseReleases([rel('1.0.0', { sha256: 'A'.repeat(64) })])).toThrow();
  });

  it('sha256 可选：清单不给校验值也能解析（给了才校验形状）', () => {
    const { sha256: _, ...noHash } = rel('1.0.0');
    const { sha256: __, ...assetNoHash } = asset;
    const [r] = parseReleases([{ ...noHash, assets: [assetNoHash] }]);
    expect(r.sha256).toBeUndefined();
    expect(r.assets[0].sha256).toBeUndefined();
  });

  it('老版本没有 assets → 默认空数组，按平台取不到', () => {
    const [r] = parseReleases([rel('1.0.0')]);
    expect(r.assets).toEqual([]);
    expect(findAsset(r, 'macos-aarch64')).toBeUndefined();
  });

  it('assets 按平台取；安装包地址不在白名单、平台未知、文件名非 ASCII → 构建失败', () => {
    const [r] = parseReleases([rel('1.1.0', { assets: [asset] })]);
    expect(findAsset(r, 'macos-aarch64')?.size).toBe(12_853_649);
    expect(findAsset(r, 'linux-x64-deb')).toBeUndefined();
    expect(() => parseReleases([rel('1.1.0', { assets: [{ ...asset, url: 'https://evil.example/a.dmg' }] })])).toThrow();
    expect(() => parseReleases([rel('1.1.0', { assets: [{ ...asset, platform: 'macos-ppc' }] })])).toThrow();
    expect(() => parseReleases([rel('1.1.0', { assets: [{ ...asset, file: '我的 应用.dmg' }] })])).toThrow();
  });

  it('首发前空数组合法', () => {
    expect(parseReleases([])).toEqual([]);
  });

  it('findAsset 接受 undefined（首发前没有最新版）', () => {
    expect(findAsset(undefined, 'windows-x64')).toBeUndefined();
  });
});

describe('compareVersion', () => {
  it('逐段数字比较', () => {
    expect(compareVersion('1.0.0', '0.9.9')).toBeGreaterThan(0);
    expect(compareVersion('0.1.2', '0.1.2')).toBe(0);
  });
});

describe('formatSize', () => {
  it('MB 保留一位小数，小文件按 KB', () => {
    expect(formatSize(11_937_520)).toBe('11.4 MB');
    expect(formatSize(2048)).toBe('2 KB');
  });
});

describe('noteLines', () => {
  it('去空行与列表前缀', () => {
    expect(noteLines('- 新增 A\n\n* 修复 B\n普通一行')).toEqual(['新增 A', '修复 B', '普通一行']);
  });
});
