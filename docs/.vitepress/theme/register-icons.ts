// 将精简离线图标数据注册进 @iconify/vue 全局图标库。
// 副作用模块：在 theme/index.ts 顶部 import 一次即可（SSR 构建与客户端都会执行）。
import { addIcon } from '@iconify/vue'
import iconData from './icons.data.json'

interface RawIcon {
  body: string
  width: number
  height: number
}

for (const [name, icon] of Object.entries(iconData as Record<string, RawIcon>)) {
  // name 形如 "lucide:rocket"，addIcon 支持带前缀的完整名
  addIcon(name, icon)
}

// 优先级圆点：基于 lucide:circle 底图，实心效果由 CSS(fill) 控制
