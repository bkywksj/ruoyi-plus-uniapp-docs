// 图片解析：把数据里的封面地址统一转成 <img> 可直接用的 { src, srcSet, width, height }
// 远程图片只有域名在 site.imageDomains 里才会在构建期被下载、裁切、转 WebP（自托管，顺带绕开防盗链）；
// 其余地址原样返回（public/ 下的本地路径、或未授权的外链）。
// 🔴 getImage() 只能在服务端（页面 frontmatter / .astro 组件）调用，React island 里拿到的是这里算好的结果。
import { getImage } from 'astro:assets';
import { site } from '@/site.config';

export interface ResolvedImage {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
}

/**
 * 远程图片是否会被构建期优化：与 astro.config.ts 的 image.domains 同源（都来自 site.imageDomains），精确域名匹配。
 * 🔴 以后若改用 image.remotePatterns（通配子域等），这里必须同步改，否则图片会被当成未授权、原样外链。
 */
export function isOptimizableRemote(src: string): boolean {
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    const { hostname } = new URL(src);
    return site.imageDomains.includes(hostname);
  } catch {
    return false;
  }
}

/**
 * 解析封面：默认按 16:9 裁切。
 * @param src     数据里的封面地址
 * @param width   目标显示宽度（px），也是 srcset 的中间档
 * @param height  目标显示高度（px）
 */
export async function resolveCover(src: string, width = 640, height = 360): Promise<ResolvedImage> {
  if (!isOptimizableRemote(src)) {
    return { src, width, height };
  }
  const image = await getImage({
    src,
    width,
    height,
    fit: 'cover',
    format: 'webp',
    widths: [Math.round(width * 0.625), width, Math.round(width * 1.5)],
  });
  return {
    src: image.src,
    srcSet: image.srcSet.attribute || undefined,
    width,
    height,
  };
}
