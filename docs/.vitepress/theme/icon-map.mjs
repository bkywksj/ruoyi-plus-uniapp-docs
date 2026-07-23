// 单一映射源：装饰性 Emoji → Iconify 图标名（lucide / simple-icons）
// 主题运行时注册（register-icons.ts）与转换脚本（scripts/emoji-to-icon.mjs）共用此文件。
//
// 设计原则（务必遵守）：
// 1. 这是**白名单**——只有出现在这里的 Emoji 才会被转换，其余（箭头 → ↓ ↑ ←、
//    目录树字符 ▼ ► ● ○、代码块内容等）一律保持原样，避免破坏排版与 ASCII 图。
// 2. 状态标记（✅ ❌ ⚠️ 🔴🟡🟢 等）不在这里，按上下文特殊处理，见 statusMarkers。
// 3. 图标名必须真实存在于对应 Iconify 集合，新增后用 scripts/verify-icons.mjs 校验。

/** 装饰性 Emoji → `前缀:图标名`（用于 <Icon icon="..." /> 内联渲染） */
export const decorativeMap = {
  '🚀': 'lucide:rocket',
  '🎯': 'lucide:target',
  '🔧': 'lucide:wrench',
  '🛠': 'lucide:hammer',
  '📋': 'lucide:clipboard-list',
  '⚡': 'lucide:zap',
  '📊': 'lucide:chart-column',
  '📈': 'lucide:trending-up',
  '🎨': 'lucide:palette',
  '🔄': 'lucide:refresh-cw',
  '📦': 'lucide:package',
  '📱': 'lucide:smartphone',
  '💻': 'lucide:laptop',
  '🖥': 'lucide:monitor',
  '🌐': 'lucide:globe',
  '🌍': 'lucide:earth',
  '💡': 'lucide:lightbulb',
  '🔍': 'lucide:search',
  '📚': 'lucide:library',
  '📖': 'lucide:book-open',
  '📝': 'lucide:file-pen-line',
  '✍': 'lucide:pen-line',
  '🔐': 'lucide:lock-keyhole',
  '🔒': 'lucide:lock',
  '🔓': 'lucide:lock-open',
  '🛡': 'lucide:shield',
  '🏗': 'lucide:building',
  '🏢': 'lucide:building-2',
  '🏠': 'lucide:house',
  '🤖': 'lucide:bot',
  '🧠': 'lucide:brain',
  '🧪': 'lucide:flask-conical',
  '✨': 'lucide:sparkles',
  '🆕': 'lucide:badge-plus',
  '💳': 'lucide:credit-card',
  '💼': 'lucide:briefcase',
  '🔗': 'lucide:link',
  '⚙': 'lucide:settings',
  '📡': 'lucide:radio-tower',
  '🔌': 'lucide:plug',
  '🖼': 'lucide:image',
  '📌': 'lucide:pin',
  '🤝': 'lucide:handshake',
  '📺': 'lucide:tv',
  '💬': 'lucide:message-circle',
  '📁': 'lucide:folder',
  '📂': 'lucide:folder-open',
  '📄': 'lucide:file-text',
  '⭐': 'lucide:star',
  '🔶': 'lucide:diamond',
  '💚': 'lucide:heart',
  '💓': 'lucide:heart-pulse',
  '🔔': 'lucide:bell',
  '📥': 'lucide:download',
  '📤': 'lucide:upload',
  '🎉': 'lucide:party-popper',
  '🏆': 'lucide:trophy',
  '⏱': 'lucide:timer',
  '⏭': 'lucide:skip-forward',
  '🗂': 'lucide:folders',
  '🧩': 'lucide:puzzle',
  '📅': 'lucide:calendar',
  '🔑': 'lucide:key-round',
  '🌟': 'lucide:sparkle',
  '📶': 'lucide:signal',
  '🐛': 'lucide:bug',
  '📧': 'lucide:mail',
  '📨': 'lucide:mail',
  '📲': 'lucide:smartphone',
  '👥': 'lucide:users',
  '👤': 'lucide:user',
  '👁': 'lucide:eye',
  '🚦': 'lucide:traffic-cone',
  '🚨': 'lucide:siren',
  '🚫': 'lucide:ban',
  '💰': 'lucide:banknote',
  '🎛': 'lucide:sliders-horizontal',
  '🕐': 'lucide:clock',
  '⏰': 'lucide:alarm-clock',
  '📢': 'lucide:megaphone',
  '🌳': 'lucide:trees',
  '🌙': 'lucide:moon',
  '🏷': 'lucide:tag',
  '🔀': 'lucide:shuffle',
  '📐': 'lucide:ruler',
  '📏': 'lucide:ruler',
  '➕': 'lucide:plus',
  '➖': 'lucide:minus',
  '🔢': 'lucide:hash',
  '🔤': 'lucide:type',
  '📍': 'lucide:map-pin',
  '🏭': 'lucide:factory',
  '📞': 'lucide:phone',
  '🗑': 'lucide:trash-2',
  '🛍': 'lucide:shopping-bag',
  '🛒': 'lucide:shopping-cart',
  '🎣': 'lucide:fish',
  '🛣': 'lucide:route',
  '🗜': 'lucide:archive',
  '🎪': 'lucide:tent',
  '🏪': 'lucide:store',
  '🎭': 'lucide:drama',
  '🎬': 'lucide:clapperboard',
  '🐌': 'lucide:snail',
  '💾': 'lucide:save',
  '🆚': 'lucide:swords',
  '🎲': 'lucide:dices',
  '📆': 'lucide:calendar-days',
  '🧮': 'lucide:calculator',
  '🎮': 'lucide:gamepad-2',
  '🏛': 'lucide:landmark',
  '📸': 'lucide:camera',
  '🔥': 'lucide:flame',
  '★': 'lucide:star',
  '☐': 'lucide:square',
}

/**
 * 状态标记 Emoji → 语义组件（彩色图标）。
 * 仅用于**行内正误标记**（如「✅ 正确示例」）；**表格单元格**里的同类标记
 * 由脚本按上下文改为文字（见 tableCellText），不走这里。
 */
export const statusInlineMap = {
  '✅': 'Ok',
  '☑': 'Ok',
  '✔': 'Ok',
  '✓': 'Ok',
  '❌': 'No',
  '✗': 'No',
  '✖': 'No',
  '❎': 'No',
  '⚠️': 'Warn',
  '⚠': 'Warn',
  '❓': 'Ask',
  '❔': 'Ask',
}

/**
 * 优先级/圆点标记 → 组件（彩色圆点）。
 */
export const dotMap = {
  '🔴': 'DotRed',
  '🟡': 'DotYellow',
  '🟢': 'DotGreen',
  '🟠': 'DotOrange',
  '🔵': 'DotBlue',
  '🟣': 'DotPurple',
}

/**
 * 表格单元格内状态标记 → 默认文字（表格标记换文字）。
 * 注意：不同表格语义不同（"支持/已完成/有"），脚本用此默认值并**标记该文件需人工复核**，
 * 复核时按列义调整（如进度表 ✅→已完成、能力表 ✅→支持）。
 */
export const tableCellText = {
  '✅': '是',
  '☑': '是',
  '✔': '是',
  '✓': '是',
  '❌': '否',
  '✗': '否',
  '✖': '否',
  '⚠️': '部分',
  '⚠': '部分',
  '🔴': '高',
  '🟡': '中',
  '🟢': '低',
}

/** 供转换脚本汇总"需要注册的全部图标名"用 */
export function usedIconNames() {
  return Array.from(new Set(Object.values(decorativeMap)))
}
