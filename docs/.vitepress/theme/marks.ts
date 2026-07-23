// 语义状态标记组件（彩色 Iconify 图标），用于替换正文行内的 ✅/❌/⚠️ 等标记。
// 在 markdown 中直接写 <Ok/> <No/> <Warn/> <Ask/> <DotRed/> 等即可。
import { defineComponent, h } from 'vue'
import { Icon } from '@iconify/vue'

/** 生成一个状态标记组件：内联渲染指定图标 + 颜色类 */
function mark(name: string, icon: string, cls: string) {
  return defineComponent({
    name,
    render() {
      return h(Icon, { icon, class: ['imark', cls], inline: true, 'aria-hidden': 'true' })
    },
  })
}

/** 生成一个优先级圆点组件：lucide:circle + 指定颜色(实心) */
function dot(name: string, cls: string) {
  return defineComponent({
    name,
    render() {
      return h(Icon, { icon: 'lucide:circle', class: ['idot', cls], inline: true, 'aria-hidden': 'true' })
    },
  })
}

export const Ok = mark('Ok', 'lucide:circle-check', 'imark-ok')
export const No = mark('No', 'lucide:circle-x', 'imark-no')
export const Warn = mark('Warn', 'lucide:triangle-alert', 'imark-warn')
export const Ask = mark('Ask', 'lucide:circle-help', 'imark-ask')

export const DotRed = dot('DotRed', 'idot-red')
export const DotYellow = dot('DotYellow', 'idot-yellow')
export const DotGreen = dot('DotGreen', 'idot-green')
export const DotOrange = dot('DotOrange', 'idot-orange')
export const DotBlue = dot('DotBlue', 'idot-blue')
export const DotPurple = dot('DotPurple', 'idot-purple')

/** 便于批量注册 */
export const markComponents = {
  Ok, No, Warn, Ask,
  DotRed, DotYellow, DotGreen, DotOrange, DotBlue, DotPurple,
}
