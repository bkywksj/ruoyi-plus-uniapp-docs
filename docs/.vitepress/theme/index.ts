import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './style.css'

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        // 注册全局组件
    }
} satisfies Theme
