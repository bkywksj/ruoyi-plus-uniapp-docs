// .vitepress/theme/index.ts
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import PreviewFrame from './components/PreviewFrame.vue'
import ImagePreview from './components/ImagePreview.vue'
import APricingCard from './components/APricingCard.vue'
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
        app.component('PreviewFrame', PreviewFrame)
        app.component('ImagePreview', ImagePreview)
        app.component('APricingCard', APricingCard)
    }
} satisfies Theme
