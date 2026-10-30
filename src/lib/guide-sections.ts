// 使用指南的分组：content.config.ts（schema 枚举）与 lib/guides.ts（侧栏顺序）共用这一份。
// 单独成文件而不放进 guides.ts：guides.ts 引了 astro:content，content.config.ts 再引它会形成循环依赖。
// 顺序即侧栏与指南首页的显示顺序；改分组名后，已有篇目 frontmatter 里的 section 要一起改，否则构建报错。
export const GUIDE_SECTIONS = ['入门', '进阶', '遇到问题'] as const;

export type GuideSection = (typeof GUIDE_SECTIONS)[number];
