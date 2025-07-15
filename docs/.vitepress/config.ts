import { defineConfig } from 'vitepress'
import llmsPlugin from 'vitepress-plugin-llms'

export default defineConfig({
    title: 'ruoyi-plus-uniapp 开发文档',
    description: '全栈开发文档 - 后端、前端、移动端完整指南',
    base: '/',

    head: [
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['meta', { name: 'theme-color', content: '#3c82f6' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'zh-CN' }],
        ['meta', { property: 'og:title', content: 'ruoyi-plus-uniapp 开发文档' }],
        ['meta', { property: 'og:site_name', content: 'ruoyi-plus-uniapp-docs' }],
        // 添加 ICP 备案信息
        ['meta', { name: 'icp', content: '粤ICP备2024160998号' }],
        ['link', { rel: 'license', href: 'https://beian.miit.gov.cn/' }],
        // 百度统计代码
        ['script', { async: '', src: 'https://hm.baidu.com/hm.js?c5543d0699fa3d232a032fd56c45b460' }],
    ],

    themeConfig: {
        logo: '/logo.png',
        siteTitle: 'ruoyi-plus-uniapp',

        nav: [
            { text: '首页', link: '/' },
            { text: '后端', link: '/backend/' },
            { text: '前端', link: '/frontend/' },
            { text: '移动端', link: '/mobile/' },
            { text: '更新日志', link: '/changelog' }
        ],

        sidebar: {
            '/backend/': [
                {
                    text: '后端开发',
                    items: [
                        { text: '概览', link: '/backend/' },
                        { text: '快速开始', link: '/backend/getting-started' }
                    ]
                },
                {
                    text: 'API 接口',
                    items: [
                        { text: 'API 概览', link: '/backend/api/' },
                        { text: '认证接口', link: '/backend/api/auth' },
                        { text: '用户接口', link: '/backend/api/user' },
                        { text: '业务接口', link: '/backend/api/business' }
                    ]
                },
                {
                    text: '数据库',
                    items: [
                        { text: '数据库概览', link: '/backend/database/' },
                        { text: '数据库设计', link: '/backend/database/schema' },
                        { text: '数据迁移', link: '/backend/database/migrations' }
                    ]
                },
                {
                    text: '部署运维',
                    items: [
                        { text: '部署概览', link: '/backend/deployment/' },
                        { text: 'Docker部署', link: '/backend/deployment/docker' },
                        { text: '服务器部署', link: '/backend/deployment/server' }
                    ]
                },
                {
                    text: '其他',
                    items: [
                        { text: '问题排查', link: '/backend/troubleshooting' }
                    ]
                }
            ],

            '/frontend/': [
                {
                    text: '前端开发',
                    items: [
                        { text: '概览', link: '/frontend/' },
                        { text: '快速开始', link: '/frontend/getting-started' }
                    ]
                },
                {
                    text: '组件开发',
                    items: [
                        { text: '组件概览', link: '/frontend/components/' },
                        { text: '基础组件', link: '/frontend/components/basic' },
                        { text: '表单组件', link: '/frontend/components/form' },
                        { text: '布局组件', link: '/frontend/components/layout' }
                    ]
                },
                {
                    text: '页面开发',
                    items: [
                        { text: '页面概览', link: '/frontend/pages/' },
                        { text: '用户页面', link: '/frontend/pages/user' },
                        { text: '仪表板', link: '/frontend/pages/dashboard' }
                    ]
                },
                {
                    text: '构建配置',
                    items: [
                        { text: '构建概览', link: '/frontend/build/' },
                        { text: '开发环境', link: '/frontend/build/development' },
                        { text: '生产环境', link: '/frontend/build/production' }
                    ]
                },
                {
                    text: '其他',
                    items: [
                        { text: '最佳实践', link: '/frontend/best-practices' }
                    ]
                }
            ],

            '/mobile/': [
                {
                    text: '移动端开发',
                    items: [
                        { text: '概览', link: '/mobile/' },
                        { text: '快速开始', link: '/mobile/getting-started' }
                    ]
                },
                {
                    text: 'UniApp 开发',
                    items: [
                        { text: 'UniApp 概览', link: '/mobile/uniapp/' },
                        { text: '环境搭建', link: '/mobile/uniapp/setup' },
                        { text: '组件开发', link: '/mobile/uniapp/components' },
                        { text: '页面开发', link: '/mobile/uniapp/pages' },
                        { text: '插件使用', link: '/mobile/uniapp/plugins' }
                    ]
                },
                {
                    text: '原生开发',
                    items: [
                        { text: '原生概览', link: '/mobile/native/' },
                        { text: 'iOS 开发', link: '/mobile/native/ios' },
                        { text: 'Android 开发', link: '/mobile/native/android' }
                    ]
                },
                {
                    text: '混合开发',
                    items: [
                        { text: '混合概览', link: '/mobile/hybrid/' },
                        { text: 'WebView', link: '/mobile/hybrid/webview' },
                        { text: 'JSBridge', link: '/mobile/hybrid/jsbridge' }
                    ]
                },
                {
                    text: '其他',
                    items: [
                        { text: '应用发布', link: '/mobile/publish' }
                    ]
                }
            ],

        },

        socialLinks: [
            { icon: 'gitee', link: 'https://gitee.com/bkywksj/ruoyi-plus-uniapp-docs' },
            { icon: 'github', link: 'https://github.com/bkywksj/ruoyi-plus-uniapp-docs' }
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-present Plus UniApp Team'
        },

        search: {
            provider: 'local'
        },

        editLink: {
            pattern: 'https://github.com/your-username/plus-uniapp-docs/edit/main/docs/:path',
            text: '在 GitHub 上编辑此页'
        },
    },

    vite: {
        plugins: [llmsPlugin() as any],
    },

    markdown: {
        lineNumbers: true,
        config(md) {
            // 可以添加markdown插件
        }
    }
})
