// .vitepress/theme/index.ts
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { Icon } from '@iconify/vue'
import './register-icons' // 注册离线图标（副作用，需在使用前执行）
import { markComponents } from './marks'
import PreviewFrame from './components/PreviewFrame.vue'
import ImagePreview from './components/ImagePreview.vue'
import APricingCard from './components/APricingCard.vue'
import AProductCard from './components/AProductCard.vue'
import './style.css'

export default {
    extends: DefaultTheme,
    Layout() {
        return h(DefaultTheme.Layout, null, {
            // 使用 doc-after slot，在文档内容之后显示预览组件
            'doc-after': () => h(PreviewFrame)
        })
    },
    enhanceApp({ app }) {
        // 全局 Iconify 图标组件：markdown 中写 <Icon icon="lucide:rocket" />
        app.component('Icon', Icon)
        // 全局状态标记组件：<Ok/> <No/> <Warn/> <Ask/> <DotRed/> 等
        for (const [name, comp] of Object.entries(markComponents)) {
            app.component(name, comp)
        }
        app.component('PreviewFrame', PreviewFrame)
        app.component('ImagePreview', ImagePreview)
        app.component('APricingCard', APricingCard)
        app.component('AProductCard', AProductCard)
    }
} satisfies Theme
