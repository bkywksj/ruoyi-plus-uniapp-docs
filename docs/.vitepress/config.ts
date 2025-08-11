import { defineConfig } from 'vitepress'
import llmsPlugin from 'vitepress-plugin-llms'

export default defineConfig({
    title: 'ruoyi-plus-uniapp 开发文档',
    description: '全栈开发文档 - 后端、前端、移动端完整指南',
    base: '/',
    lastUpdated: true,
    cleanUrls: true,

    head: [
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['meta', { name: 'theme-color', content: '#8b5cf6' }], // 调整为紫色主题
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'zh-CN' }],
        ['meta', { property: 'og:title', content: 'ruoyi-plus-uniapp 开发文档' }],
        ['meta', { property: 'og:site_name', content: 'ruoyi-plus-uniapp-docs' }],
        ['meta', { property: 'og:description', content: '框架即文档，提供最优雅的开发体验' }],
        ['meta', { property: 'og:image', content: '/logo.png' }],
        // 添加 ICP 备案信息
        ['meta', { name: 'icp', content: '粤ICP备2021091549号-5' }],
        ['link', { rel: 'license', href: 'https://beian.miit.gov.cn/' }],
        // 百度统计代码
        ['script', { async: '', src: 'https://hm.baidu.com/hm.js?c5543d0699fa3d232a032fd56c45b460' }],
        // 添加站点地图
        ['link', { rel: 'sitemap', href: '/sitemap.xml' }],
        ['meta', { name: 'mobile-web-app-capable', content: 'yes' }], // ✅ 使用现代标准
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }], // ✅ 改进状态栏样式
        // 可选：添加更完整的PWA支持
        ['meta', { name: 'application-name', content: 'ruoyi-plus-uniapp-docs' }],
        ['meta', { name: 'apple-mobile-web-app-title', content: 'ruoyi-docs' }],
        ['link', { rel: 'apple-touch-icon', href: '/logo.png' }],
    ],

    themeConfig: {
        logo: '/logo.png',
        siteTitle: 'ruoyi-plus-uniapp',

        nav: [
            {
                text: '后端',
                link: '/backend/',
                activeMatch: '/backend/'
            },
            {
                text: '前端',
                link: '/frontend/',
                activeMatch: '/frontend/'
            },
            {
                text: '移动端',
                link: '/mobile/',
                activeMatch: '/mobile/'
            },
            {
                text: '最佳实践',
                link: '/practices/',
                activeMatch: '/practices/'
            },
            { text: '特性', link: '/changelog' },
            { text: '视频', link: '/video' },
            { text: '演示', link: '/demo' }
        ],

        sidebar: {
            '/backend/': [
                {
                    text: '🚀 快速开始',
                    items: [
                        { text: '项目简介', link: '/backend/' },
                        { text: '环境要求', link: '/backend/requirements' },
                        { text: '快速启动', link: '/backend/getting-started' },
                        { text: '项目结构', link: '/backend/project-structure' },
                        { text: '配置文件', link: '/backend/configuration' }
                    ]
                },
                {
                    text: '⚙️ 主应用 (ruoyi-admin)',
                    items: [
                        { text: '模块解析', link: '/backend/admin/module-resolution' }
                    ]
                },
                {
                    text: '📦 公共模块 (ruoyi-common)',
                    collapsed: false,
                    items: [
                        { text: '依赖版本管理 (bom)', link: '/backend/common/bom' },
                        {
                            text: '核心模块 (core)',
                            collapsed: true,
                            items: [
                                { text: '模块概览', link: '/backend/common/core' },
                                { text: '配置管理', link: '/backend/common/core/config' },
                                { text: '数据模型与DTO', link: '/backend/common/core/domain' },
                                { text: '工具类库', link: '/backend/common/core/utils' },
                                { text: '异常处理', link: '/backend/common/core/exception' },
                                { text: '参数校验', link: '/backend/common/core/validation' },
                                { text: '字典枚举', link: '/backend/common/core/enums' },
                                { text: '通用服务接口', link: '/backend/common/core/service' }
                            ]
                        },
                        { text: '文档生成 (doc)', link: '/backend/common/doc' },
                        {
                            text: '数据加密 (Encryption)',
                            collapsed: false,
                            items: [
                                { text: '概览与快速入门', link: '/backend/common/encrypt' },
                                { text: '数据库字段加密', link: '/backend/common/encrypt/database-encryption' },
                                { text: 'API接口加密', link: '/backend/common/encrypt/api-encryption' }
                            ]
                        },
                        { text: 'Excel处理 (excel)', link: '/backend/common/excel' },
                        { text: '幂等处理 (idempotent)', link: '/backend/common/idempotent' },
                        { text: '任务调度 (job)', link: '/backend/common/job' },
                        { text: 'JSON处理 (json)', link: '/backend/common/json' },
                        { text: '日志管理 (log)', link: '/backend/common/log' },
                        { text: '邮件服务 (mail)', link: '/backend/common/mail' },
                        { text: '小程序集成 (miniapp)', link: '/backend/common/miniapp' },
                        { text: '公众号集成 (mp)', link: '/backend/common/mp' },
                        { text: 'MyBatisPlus增强 (mybatis)', link: '/backend/common/mybatis' },
                        { text: 'OSS存储 (oss)', link: '/backend/common/oss' },
                        { text: '支付集成 (pay)', link: '/backend/common/pay' },
                        { text: '限流组件 (ratelimiter)', link: '/backend/common/ratelimiter' },
                        { text: 'Redis缓存 (redis)', link: '/backend/common/redis' },
                        { text: '权限认证 (satoken)', link: '/backend/common/satoken' },
                        { text: '安全防护 (security)', link: '/backend/common/security' },
                        { text: '脱敏处理 (sensitive)', link: '/backend/common/sensitive' },
                        { text: '序列化映射 (serialmap)', link: '/backend/common/serialmap' },
                        { text: '短信服务 (sms)', link: '/backend/common/sms' },
                        { text: '社交登录 (social)', link: '/backend/common/social' },
                        { text: 'SSE推送 (sse)', link: '/backend/common/sse' },
                        { text: '多租户 (tenant)', link: '/backend/common/tenant' },
                        { text: 'Web组件 (web)', link: '/backend/common/web' },
                        { text: 'WebSocket (websocket)', link: '/backend/common/websocket' }
                    ]
                },
                {
                    text: '🔧 业务模块 (ruoyi-modules)',
                    items: [
                        { text: '系统模块 (system)', link: '/backend/modules/system' },
                        { text: '代码生成 (generator)', link: '/backend/modules/generator' },
                        { text: '业务模块 (business)', link: '/backend/modules/business' },
                        { text: '模块开发指南', link: '/backend/modules/development-guide' },
                        { text: '自定义模块', link: '/backend/modules/custom-module' }
                    ]
                },
                {
                    text: '🎯 扩展模块 (ruoyi-extend)',
                    items: [
                        { text: '监控管理 (monitor-admin)', link: '/backend/extend/monitor-admin' },
                        { text: '任务服务 (snailjob-server)', link: '/backend/extend/snailjob-server' },
                        { text: '扩展开发指南', link: '/backend/extend/extension-development' }
                    ]
                },

                {
                    text: '🎨 核心功能详解',
                    items: [
                        { text: '用户权限管理', link: '/backend/features/user-permission' },
                        { text: '多租户系统', link: '/backend/features/multi-tenant' },
                        { text: '代码生成器', link: '/backend/features/code-generator' },
                        { text: '文件存储', link: '/backend/features/file-storage' },
                        { text: '缓存机制', link: '/backend/features/cache' },
                        { text: '任务调度', link: '/backend/features/job-scheduling' },
                        { text: '系统监控', link: '/backend/features/monitoring' },
                        { text: '日志审计', link: '/backend/features/logging-audit' },
                        { text: '数据字典', link: '/backend/features/data-dict' },
                        { text: '参数配置', link: '/backend/features/param-config' },
                        { text: '通知公告', link: '/backend/features/notification' },
                        { text: '在线用户', link: '/backend/features/online-users' },
                        { text: '服务监控', link: '/backend/features/service-monitor' },
                        { text: 'Excel导入导出', link: '/backend/features/excel-operations' },
                        { text: '支付集成', link: '/backend/features/payment-integration' },
                        { text: '微信小程序', link: '/backend/features/wechat-miniapp' },
                        { text: '微信公众号', link: '/backend/features/wechat-mp' }
                    ]
                },
                {
                    text: '📡 API 接口文档',
                    collapsed: true,
                    items: [
                        { text: '接口规范', link: '/backend/api/specification' },
                        { text: '认证接口', link: '/backend/api/auth-api' },
                        { text: '用户管理接口', link: '/backend/api/user-api' },
                        { text: '角色权限接口', link: '/backend/api/role-api' },
                        { text: '部门管理接口', link: '/backend/api/dept-api' },
                        { text: '岗位管理接口', link: '/backend/api/post-api' },
                        { text: '菜单管理接口', link: '/backend/api/menu-api' },
                        { text: '字典管理接口', link: '/backend/api/dict-api' },
                        { text: '参数配置接口', link: '/backend/api/config-api' },
                        { text: '通知公告接口', link: '/backend/api/notice-api' },
                        { text: '文件上传接口', link: '/backend/api/upload-api' },
                        { text: '代码生成接口', link: '/backend/api/generator-api' },
                        { text: '系统监控接口', link: '/backend/api/monitor-api' },
                        { text: '定时任务接口', link: '/backend/api/job-api' },
                        { text: '系统日志接口', link: '/backend/api/log-api' },
                        { text: '在线用户接口', link: '/backend/api/online-api' },
                        { text: '租户管理接口', link: '/backend/api/tenant-api' },
                        { text: '支付接口', link: '/backend/api/payment-api' },
                        { text: '业务接口', link: '/backend/api/business-api' }
                    ]
                },
                {
                    text: '👨‍💻 开发指南',
                    collapsed: true,
                    items: [
                        { text: '开发环境搭建', link: '/backend/development/dev-environment' },
                        { text: '编码规范', link: '/backend/development/coding-standards' },
                        { text: '数据库设计规范', link: '/backend/development/database-design' },
                        { text: 'Service层开发', link: '/backend/development/service-layer' },
                        { text: 'Controller层开发', link: '/backend/development/controller-layer' },
                        { text: 'Mapper层开发', link: '/backend/development/mapper-layer' },
                        { text: '数据校验', link: '/backend/development/validation' },
                        { text: '异常处理', link: '/backend/development/exception-handling' },
                        { text: '事务管理', link: '/backend/development/transaction' },
                        { text: '单元测试', link: '/backend/development/unit-testing' },
                        { text: '集成测试', link: '/backend/development/integration-testing' },
                        { text: '代码生成使用', link: '/backend/development/code-generation' },
                        { text: '权限控制开发', link: '/backend/development/permission-control' },
                        { text: '数据权限开发', link: '/backend/development/data-permission' },
                        { text: '多租户开发', link: '/backend/development/tenant-development' },
                        { text: '缓存使用', link: '/backend/development/cache-usage' },
                        { text: '定时任务开发', link: '/backend/development/job-development' },
                        { text: '消息推送开发', link: '/backend/development/message-push' },
                        { text: '文件处理', link: '/backend/development/file-handling' },
                        { text: 'Excel操作', link: '/backend/development/excel-operations' },
                        { text: '第三方集成', link: '/backend/development/third-party' },
                        { text: '国际化开发', link: '/backend/development/i18n' },
                        { text: '性能优化', link: '/backend/development/performance' },
                        { text: '安全开发', link: '/backend/development/security' },
                        { text: '最佳实践', link: '/backend/development/best-practices' }
                    ]
                },
                {
                    text: '🚀 部署运维',
                    collapsed: true,
                    items: [
                        { text: '部署概览', link: '/backend/deployment/overview' },
                        { text: '环境准备', link: '/backend/deployment/environment-prep' },
                        { text: '数据库部署', link: '/backend/deployment/database-deployment' },
                        { text: '应用部署', link: '/backend/deployment/app-deployment' },
                        { text: 'Docker部署', link: '/backend/deployment/docker-deployment' },
                        { text: 'Docker Compose', link: '/backend/deployment/docker-compose' },
                        { text: 'Nginx配置', link: '/backend/deployment/nginx-config' },
                        { text: 'SSL证书配置', link: '/backend/deployment/ssl-certificate' },
                        { text: '域名配置', link: '/backend/deployment/domain-config' },
                        { text: '负载均衡', link: '/backend/deployment/load-balancing' },
                        { text: '监控告警', link: '/backend/deployment/monitoring-alerting' },
                        { text: '日志管理', link: '/backend/deployment/log-management' },
                        { text: '安全配置', link: '/backend/deployment/security-config' },
                        { text: '版本升级', link: '/backend/deployment/version-upgrade' },
                        { text: '故障排查', link: '/backend/deployment/troubleshooting' }
                    ]
                }
            ],

            '/frontend/': [
                {
                    text: '🚀 快速开始',
                    items: [
                        { text: '项目简介', link: '/frontend/' },
                        { text: '快速启动', link: '/frontend/getting-started' },
                        { text: '项目结构', link: '/frontend/project-structure' },
                        { text: '配置文件', link: '/frontend/configuration' }
                    ]
                },
                {
                    text: '🏗️ 项目架构',
                    items: [
                        { text: '技术栈介绍', link: '/frontend/architecture/tech-stack' },
                        { text: '目录结构详解', link: '/frontend/architecture/directory-structure' },
                        { text: '模块化设计', link: '/frontend/architecture/modular-design' },
                        { text: 'TypeScript配置', link: '/frontend/architecture/typescript-config' },
                        { text: '类型系统', link: '/frontend/architecture/type-system' },
                        { text: '构建流程', link: '/frontend/architecture/build-process' },
                        { text: '配置管理', link: '/frontend/architecture/config-management' }
                    ]
                },
                {
                    text: '🛣️ 路由系统 (router)',
                    items: [
                        { text: '路由设计', link: '/frontend/router/router-design' },
                        { text: '路由配置', link: '/frontend/router/router-config' },
                        { text: '路由守卫', link: '/frontend/router/router-guards' },
                        { text: '动态路由', link: '/frontend/router/dynamic-routes' },
                        { text: '权限路由', link: '/frontend/router/permission-routes' },
                        { text: '路由工具', link: '/frontend/router/router-utils' },
                        { text: '面包屑导航', link: '/frontend/router/breadcrumb' },
                        { text: '页面缓存', link: '/frontend/router/page-cache' },
                        { text: '路由最佳实践', link: '/frontend/router/best-practices' }
                    ]
                },
                {
                    text: '📦 状态管理 (stores)',
                    items: [
                        { text: 'Pinia使用指南', link: '/frontend/stores/pinia-usage' },
                        { text: '用户状态 (user)', link: '/frontend/stores/user-store' },
                        { text: '权限状态 (permission)', link: '/frontend/stores/permission-store' },
                        { text: '应用状态 (app)', link: '/frontend/stores/app-store' },
                        { text: '主题状态 (theme)', link: '/frontend/stores/theme-store' },
                        { text: '标签视图 (tagsView)', link: '/frontend/stores/tags-view-store' },
                        { text: '字典状态 (dict)', link: '/frontend/stores/dict-store' },
                        { text: '状态持久化', link: '/frontend/stores/state-persistence' },
                        { text: '状态管理最佳实践', link: '/frontend/stores/best-practices' }
                    ]
                },
                {
                    text: '🎨 布局系统 (layout)',
                    items: [
                        { text: '布局概述', link: '/frontend/layout/layout-overview' },
                        { text: '主布局 (Layout)', link: '/frontend/layout/main-layout' },
                        { text: '侧边栏 (Sidebar)', link: '/frontend/layout/sidebar' },
                        { text: '顶部导航 (Navbar)', link: '/frontend/layout/navbar' },
                        { text: '标签视图 (TagsView)', link: '/frontend/layout/tags-view' },
                        { text: '主内容区 (AppMain)', link: '/frontend/layout/app-main' },
                        { text: '设置面板 (Settings)', link: '/frontend/layout/settings' },
                        { text: '工具组件', link: '/frontend/layout/tools' },
                        { text: '响应式布局', link: '/frontend/layout/responsive' },
                        { text: '前台布局 (homeLayout)', link: '/frontend/layout/home-layout' }
                    ]
                },
                {
                    text: '🧩 组件系统 (components)',
                    items: [
                        { text: '组件概览', link: '/frontend/components/overview' },
                        { text: '表单组件', link: '/frontend/components/form-components' },
                        { text: '业务组件', link: '/frontend/components/business-components' },
                        { text: '图标系统', link: '/frontend/components/icon-system' },
                        { text: 'SvgIcon组件', link: '/frontend/components/svg-icon' },
                        { text: '媒体库组件 (AOssMediaManager)', link: '/frontend/components/oss-media-manager' },
                        { text: '选择标签 (ASelectionTags)', link: '/frontend/components/selection-tags' },
                        { text: '搜索表单 (ASearchForm)', link: '/frontend/components/search-form' },
                        { text: '表格工具栏 (TableToolbar)', link: '/frontend/components/table-toolbar' },
                        { text: '页面背景 (APageBackground)', link: '/frontend/components/page-background' },
                        { text: '自定义组件开发', link: '/frontend/components/custom-dev' }
                    ]
                },
                {
                    text: '📄 页面开发 (views)',
                    items: [
                        { text: '页面开发指南', link: '/frontend/views/page-dev-guide' },
                        { text: '登录页面', link: '/frontend/views/login' },
                        { text: '注册页面', link: '/frontend/views/register' },
                        { text: '首页仪表板', link: '/frontend/views/dashboard' },
                        { text: '系统管理', link: '/frontend/views/system' },
                        { text: '系统监控', link: '/frontend/views/monitor' },
                        { text: '系统工具', link: '/frontend/views/tool' },
                        { text: '日志管理', link: '/frontend/views/log' },
                        { text: '错误页面 (401/404)', link: '/frontend/views/error-pages' },
                        { text: '前台页面', link: '/frontend/views/home' },
                        { text: '测试页面', link: '/frontend/views/test' }
                    ]
                },
                {
                    text: '🛠️ 工具库 (utils)',
                    collapsed: true,
                    items: [
                        { text: '工具函数概览', link: '/frontend/utils/utils-overview' },
                        { text: 'HTTP请求', link: '/frontend/utils/http' },
                        { text: '认证工具', link: '/frontend/utils/auth' },
                        { text: '字符串工具', link: '/frontend/utils/string' },
                        { text: '对象工具', link: '/frontend/utils/object' },
                        { text: '数组工具', link: '/frontend/utils/array' },
                        { text: '日期工具', link: '/frontend/utils/date' },
                        { text: '格式化工具', link: '/frontend/utils/format' },
                        { text: '函数工具', link: '/frontend/utils/function' },
                        { text: '验证器', link: '/frontend/utils/validators' },
                        { text: '加密工具', link: '/frontend/utils/crypto' },
                        { text: 'RSA加密', link: '/frontend/utils/rsa' },
                        { text: '文件工具', link: '/frontend/utils/file' },
                        { text: 'DOM工具', link: '/frontend/utils/dom' },
                        { text: '类操作工具', link: '/frontend/utils/class' },
                        { text: '滚动工具', link: '/frontend/utils/scroll' },
                        { text: '缓存工具', link: '/frontend/utils/cache' },
                        { text: '树形工具', link: '/frontend/utils/tree' },
                        { text: '下载工具', link: '/frontend/utils/download' },
                        { text: '模态框工具', link: '/frontend/utils/modal' },
                        { text: '标签页工具', link: '/frontend/utils/tab' },
                        { text: '复制工具', link: '/frontend/utils/copy' },
                        { text: 'To工具类', link: '/frontend/utils/to' },
                        { text: 'Boolean工具', link: '/frontend/utils/boolean' }
                    ]
                },
                {
                    text: '🎣 组合式函数 (composables)',
                    collapsed: true,
                    items: [
                        { text: '组合式函数概览', link: '/frontend/composables/overview' },
                        { text: 'useRequest', link: '/frontend/composables/use-request' },
                        { text: 'useToken', link: '/frontend/composables/use-token' },
                        { text: 'useAuth', link: '/frontend/composables/use-auth' },
                        { text: 'useDict', link: '/frontend/composables/use-dict' },
                        { text: 'useI18n', link: '/frontend/composables/use-i18n' },
                        { text: 'useTheme', link: '/frontend/composables/use-theme' },
                        { text: 'useTitle', link: '/frontend/composables/use-title' },
                        { text: 'useTableHeight', link: '/frontend/composables/use-table-height' },
                        { text: 'useSelection', link: '/frontend/composables/use-selection' },
                        { text: 'useDownload', link: '/frontend/composables/use-download' },
                        { text: 'useDialog', link: '/frontend/composables/use-dialog' },
                        { text: 'useSSE', link: '/frontend/composables/use-sse' },
                        { text: 'useWebSocket', link: '/frontend/composables/use-websocket' }
                    ]
                },
                {
                    text: '📋 指令系统 (directives)',
                    items: [
                        { text: '指令概览', link: '/frontend/directives/overview' },
                        { text: '权限指令 (v-auth)', link: '/frontend/directives/permission' },
                        { text: '复制指令 (v-copy)', link: '/frontend/directives/copy' },
                        { text: '自定义指令开发', link: '/frontend/directives/custom' }
                    ]
                },
                {
                    text: '🎨 样式系统 (styles)',
                    items: [
                        { text: '样式架构', link: '/frontend/styles/style-architecture' },
                        { text: 'UnoCSS配置', link: '/frontend/styles/unocss-config' },
                        { text: '全局样式', link: '/frontend/styles/global-styles' },
                        { text: '主题系统', link: '/frontend/styles/theme-system' },
                        { text: '响应式设计', link: '/frontend/styles/responsive' },
                        { text: '动画系统', link: '/frontend/styles/animations' },
                        { text: '组件样式', link: '/frontend/styles/component-styles' },
                        { text: '工具类', link: '/frontend/styles/utility-classes' },
                        { text: '样式最佳实践', link: '/frontend/styles/best-practices' }
                    ]
                },
                {
                    text: '📝 类型定义 (types)',
                    collapsed: true,
                    items: [
                        { text: '类型系统概览', link: '/frontend/types/overview' },
                        { text: 'API类型', link: '/frontend/types/api-types' },
                        { text: '全局类型', link: '/frontend/types/global-types' },
                        { text: '组件类型', link: '/frontend/types/component-types' },
                        { text: '路由类型', link: '/frontend/types/router-types' },
                        { text: '状态类型', link: '/frontend/types/store-types' },
                        { text: '工具类型', link: '/frontend/types/utility-types' },
                        { text: '枚举类型', link: '/frontend/types/enums' },
                        { text: '类型扩展', link: '/frontend/types/type-extensions' }
                    ]
                },
                {
                    text: '⚙️ 开发工具 (dev)',
                    items: [
                        { text: '开发环境配置', link: '/frontend/dev/dev-config' },
                        { text: '构建配置详解', link: '/frontend/dev/build-config' },
                        { text: 'Vite配置优化', link: '/frontend/dev/vite-config' },
                        { text: '代码质量工具', link: '/frontend/dev/code-quality' },
                        { text: 'ESLint配置', link: '/frontend/dev/eslint-config' },
                        { text: 'Prettier配置', link: '/frontend/dev/prettier-config' },
                        { text: '调试技巧', link: '/frontend/dev/debugging' },
                        { text: '性能分析', link: '/frontend/dev/performance' },
                        { text: '单元测试', link: '/frontend/dev/testing' },
                        { text: '开发最佳实践', link: '/frontend/dev/best-practices' }
                    ]
                },
                {
                    text: '🌍 国际化 (locales)',
                    items: [
                        { text: '国际化配置', link: '/frontend/i18n/i18n-config' },
                        { text: '语言包管理', link: '/frontend/i18n/language-packs' },
                        { text: '菜单国际化', link: '/frontend/i18n/menu-i18n' },
                        { text: '表单国际化', link: '/frontend/i18n/form-i18n' },
                        { text: '组件国际化', link: '/frontend/i18n/component-i18n' },
                        { text: '日期国际化', link: '/frontend/i18n/date-i18n' },
                        { text: '动态翻译', link: '/frontend/i18n/dynamic-translation' },
                        { text: '国际化最佳实践', link: '/frontend/i18n/i18n-practices' }
                    ]
                },
                {
                    text: '🚀 构建部署',
                    items: [
                        { text: '构建配置', link: '/frontend/build/build-config' },
                        { text: '环境变量', link: '/frontend/build/environment-variables' },
                        { text: '生产构建', link: '/frontend/build/production-build' },
                        { text: '静态资源处理', link: '/frontend/build/static-assets' },
                        { text: 'CDN配置', link: '/frontend/build/cdn-config' },
                        { text: '部署到Nginx', link: '/frontend/build/nginx-deploy' },
                        { text: '部署到Docker', link: '/frontend/build/docker-deploy' },
                        { text: 'CI/CD流程', link: '/frontend/build/cicd' }
                    ]
                }
            ],

            '/mobile/': [
                {
                    text: '🚀 快速开始',
                    items: [
                        { text: '项目简介', link: '/mobile/' },
                        { text: '快速启动', link: '/mobile/getting-started' },
                        { text: '项目结构', link: '/mobile/project-structure' },
                        { text: '配置文件', link: '/mobile/configuration' }
                    ]
                },
                {
                    text: '🏗️ UniApp基础',
                    items: [
                        { text: 'UniApp概览', link: '/mobile/uniapp/overview' },
                        { text: '项目配置 (manifest.json)', link: '/mobile/uniapp/manifest-config' },
                        { text: '页面配置 (pages.json)', link: '/mobile/uniapp/pages-config' },
                        { text: '应用配置 (uni.scss)', link: '/mobile/uniapp/app-config' },
                        { text: '生命周期', link: '/mobile/uniapp/lifecycle' },
                        { text: '路由导航', link: '/mobile/uniapp/navigation' },
                        { text: '条件编译', link: '/mobile/uniapp/conditional' },
                        { text: '调试工具', link: '/mobile/uniapp/debugging' },
                        { text: 'HBuilderX使用', link: '/mobile/uniapp/hbuilderx' }
                    ]
                },
                {
                    text: '📡 API接口 (api)',
                    items: [
                        { text: 'API概览', link: '/mobile/api/overview' },
                        { text: '接口配置', link: '/mobile/api/config' },
                        { text: '认证接口', link: '/mobile/api/auth' },
                        { text: '用户接口', link: '/mobile/api/user' },
                        { text: '业务接口', link: '/mobile/api/business' },
                        { text: '系统接口', link: '/mobile/api/system' },
                        { text: '文件接口', link: '/mobile/api/file' },
                        { text: '支付接口', link: '/mobile/api/payment' },
                        { text: '微信小程序接口', link: '/mobile/api/wechat' },
                        { text: '错误处理', link: '/mobile/api/error-handling' }
                    ]
                },
                {
                    text: '🧩 组件系统 (components)',
                    items: [
                        { text: '组件概览', link: '/mobile/components/overview' },
                        { text: 'Wd UI重构组件库', link: '/mobile/components/wd' },
                        { text: '基础组件', link: '/mobile/components/basic' },
                        { text: '表单组件', link: '/mobile/components/form' },
                        { text: '展示组件', link: '/mobile/components/display' },
                        { text: '导航组件', link: '/mobile/components/navigation' },
                        { text: '反馈组件', link: '/mobile/components/feedback' },
                        { text: '布局组件', link: '/mobile/components/layout' },
                        { text: '业务组件', link: '/mobile/components/business' },
                        { text: '图标组件', link: '/mobile/components/icons' },
                        { text: '自定义组件开发', link: '/mobile/components/custom-dev' }
                    ]
                },
                {
                    text: '🎣 组合式函数 (composables)',
                    items: [
                        { text: '组合式函数概览', link: '/mobile/composables/overview' },
                        { text: 'useAuth', link: '/mobile/composables/use-auth' },
                        { text: 'useDict', link: '/mobile/composables/use-dict' },
                        { text: 'useHttp', link: '/mobile/composables/use-http' },
                        { text: 'useToken', link: '/mobile/composables/use-token' },
                        { text: 'usePayment', link: '/mobile/composables/use-payment' },
                        { text: 'useScroll', link: '/mobile/composables/use-scroll' },
                        { text: 'useTheme', link: '/mobile/composables/use-theme' },
                        { text: 'useToast', link: '/mobile/composables/use-toast' },
                        { text: 'useModal', link: '/mobile/composables/use-modal' },
                        { text: '自定义Hook开发', link: '/mobile/composables/custom-hooks' }
                    ]
                },
                {
                    text: '🎨 布局系统 (layouts)',
                    items: [
                        { text: '布局概述', link: '/mobile/layouts/overview' },
                        { text: '默认布局 (default)', link: '/mobile/layouts/default' },
                        { text: 'Demo布局 (demo)', link: '/mobile/layouts/demo' },
                        { text: '导航栏配置', link: '/mobile/layouts/navbar' },
                        { text: '标签栏配置', link: '/mobile/layouts/tabbar' },
                        { text: '胶囊组件', link: '/mobile/layouts/capsule' },
                        { text: '自定义布局', link: '/mobile/layouts/custom' }
                    ]
                },
                {
                    text: '📄 页面开发 (pages)',
                    items: [
                        { text: '页面开发指南', link: '/mobile/pages/development-guide' },
                        { text: '首页 (index)', link: '/mobile/pages/index' },
                        { text: '登录页 (login)', link: '/mobile/pages/login' },
                        { text: '用户中心 (user)', link: '/mobile/pages/user' },
                        { text: '设置页面 (settings)', link: '/mobile/pages/settings' },
                        { text: '业务页面', link: '/mobile/pages/business' },
                        { text: '示例页面 (demo)', link: '/mobile/pages/demo' },
                        { text: '分包页面管理', link: '/mobile/pages/subpackages' }
                    ]
                },
                {
                    text: '🛠️ 工具库 (utils)',
                    items: [
                        { text: '工具函数概览', link: '/mobile/utils/overview' },
                        { text: 'HTTP请求工具', link: '/mobile/utils/http' },
                        { text: '存储工具', link: '/mobile/utils/storage' },
                        { text: '设备信息工具', link: '/mobile/utils/device' },
                        { text: '位置服务工具', link: '/mobile/utils/location' },
                        { text: '文件处理工具', link: '/mobile/utils/file' },
                        { text: '图片处理工具', link: '/mobile/utils/image' },
                        { text: '日期工具', link: '/mobile/utils/date' },
                        { text: '格式化工具', link: '/mobile/utils/format' },
                        { text: '验证工具', link: '/mobile/utils/validate' },
                        { text: '加密工具', link: '/mobile/utils/crypto' },
                        { text: '分享工具', link: '/mobile/utils/share' },
                        { text: '权限工具', link: '/mobile/utils/permission' }
                    ]
                },
                {
                    text: '🔌 插件系统 (plugins)',
                    items: [
                        { text: '插件概览', link: '/mobile/plugins/overview' },
                        { text: '网络请求插件', link: '/mobile/plugins/request' },
                        { text: '权限管理插件', link: '/mobile/plugins/permission' },
                        { text: '支付插件', link: '/mobile/plugins/payment' },
                        { text: '分享插件', link: '/mobile/plugins/share' },
                        { text: '推送插件', link: '/mobile/plugins/push' },
                        { text: '统计插件', link: '/mobile/plugins/analytics' },
                        { text: '地图插件', link: '/mobile/plugins/map' },
                        { text: '相机插件', link: '/mobile/plugins/camera' },
                        { text: '自定义插件开发', link: '/mobile/plugins/custom-dev' }
                    ]
                },
                {
                    text: '🎨 样式系统 (styles)',
                    items: [
                        { text: '样式概览', link: '/mobile/styles/overview' },
                        { text: 'UnoCSS配置', link: '/mobile/styles/unocss' },
                        { text: '全局样式', link: '/mobile/styles/global' },
                        { text: '主题定制', link: '/mobile/styles/theme' },
                        { text: '响应式设计', link: '/mobile/styles/responsive' },
                        { text: '组件样式', link: '/mobile/styles/components' },
                        { text: '工具类', link: '/mobile/styles/utilities' },
                        { text: '图标字体', link: '/mobile/styles/icon-fonts' },
                        { text: '样式最佳实践', link: '/mobile/styles/best-practices' }
                    ]
                },
                {
                    text: '📱 平台适配',
                    items: [
                        { text: '平台差异说明', link: '/mobile/platform/differences' },
                        { text: 'H5适配', link: '/mobile/platform/h5' },
                        { text: '微信小程序适配', link: '/mobile/platform/wechat' },
                        { text: '支付宝小程序适配', link: '/mobile/platform/alipay' },
                        { text: '百度小程序适配', link: '/mobile/platform/baidu' },
                        { text: 'QQ小程序适配', link: '/mobile/platform/qq' },
                        { text: '抖音小程序适配', link: '/mobile/platform/toutiao' },
                        { text: 'Android App适配', link: '/mobile/platform/android' },
                        { text: 'iOS App适配', link: '/mobile/platform/ios' },
                        { text: '鸿蒙适配', link: '/mobile/platform/harmony' },
                        { text: '条件编译使用', link: '/mobile/platform/conditional' }
                    ]
                },
                {
                    text: '⚡ 性能优化',
                    items: [
                        { text: '性能优化概览', link: '/mobile/performance/overview' },
                        { text: '启动性能优化', link: '/mobile/performance/startup' },
                        { text: '渲染性能优化', link: '/mobile/performance/rendering' },
                        { text: '包体积优化', link: '/mobile/performance/bundle-size' },
                        { text: '图片优化', link: '/mobile/performance/image-optimization' },
                        { text: '分包加载优化', link: '/mobile/performance/subpackage' },
                    ]
                },
                {
                    text: '🐛 调试与测试',
                    items: [
                        { text: '调试工具使用', link: '/mobile/debug/tools' },
                        { text: '真机调试', link: '/mobile/debug/device' },
                        { text: '小程序开发者工具', link: '/mobile/debug/miniapp-devtools' },
                        { text: '日志管理', link: '/mobile/debug/logging' },
                        { text: '错误监控', link: '/mobile/debug/error-monitoring' },
                        { text: '单元测试', link: '/mobile/debug/unit-testing' },
                        { text: '集成测试', link: '/mobile/debug/integration-testing' },
                        { text: '兼容性测试', link: '/mobile/debug/compatibility-testing' }
                    ]
                },
                {
                    text: '📦 打包发布',
                    items: [
                        { text: '打包配置概览', link: '/mobile/build/overview' },
                        { text: '环境配置', link: '/mobile/build/environment' },
                        { text: 'H5打包发布', link: '/mobile/build/h5-deploy' },
                        { text: '微信小程序发布', link: '/mobile/build/wechat-deploy' },
                        { text: '支付宝小程序发布', link: '/mobile/build/alipay-deploy' },
                        { text: 'App云打包', link: '/mobile/build/app-cloud-build' },
                        { text: 'App离线打包', link: '/mobile/build/app-offline-build' },
                        { text: '应用商店发布', link: '/mobile/build/store-publish' },
                        { text: '版本管理策略', link: '/mobile/build/version-management' }
                    ]
                }
            ],

            '/practices/': [
                {
                    text: '📋 开发规范',
                    items: [
                        { text: '编码规范', link: '/practices/coding-standards' },
                        { text: '命名规范', link: '/practices/naming-conventions' },
                        { text: '注释规范', link: '/practices/comment-standards' },
                        { text: 'Git使用规范', link: '/practices/git-standards' },
                        { text: '代码审查规范', link: '/practices/code-review' }
                    ]
                },
                {
                    text: '🏗️ 架构设计',
                    items: [
                        { text: '系统架构设计', link: '/practices/system-architecture' },
                        { text: '数据库设计', link: '/practices/database-design' },
                        { text: '缓存策略', link: '/practices/cache-strategy' },
                        { text: '分布式设计', link: '/practices/distributed-design' }
                    ]
                },
                {
                    text: '⚡ 性能优化',
                    items: [
                        { text: '后端性能优化', link: '/practices/backend-performance' },
                        { text: '前端性能优化', link: '/practices/frontend-performance' },
                        { text: '移动端性能优化', link: '/practices/mobile-performance' },
                        { text: '数据库优化', link: '/practices/database-optimization' },
                        { text: '网络优化', link: '/practices/network-optimization' }
                    ]
                },
                {
                    text: '🔒 安全指南',
                    items: [
                        { text: '安全总览', link: '/practices/security-overview' },
                        { text: '身份认证安全', link: '/practices/auth-security' },
                        { text: '数据安全', link: '/practices/data-security' },
                        { text: '接口安全', link: '/practices/api-security' },
                        { text: '前端安全', link: '/practices/frontend-security' },
                        { text: '移动端安全', link: '/practices/mobile-security' }
                    ]
                },
                {
                    text: '🚀 部署运维',
                    items: [
                        { text: '1Panel Docker部署', link: '/practices/1panel-docker-deploy' },
                        { text: '监控告警', link: '/practices/monitoring-alerting' },
                        { text: '日志管理', link: '/practices/log-management' },
                        { text: '备份策略', link: '/practices/backup-strategy' }
                    ]
                }
            ]
        },

        // 搜索配置
        search: {
            provider: 'local',
            options: {
                locales: {
                    zh: {
                        translations: {
                            button: {
                                buttonText: '搜索文档',
                                buttonAriaLabel: '搜索文档'
                            },
                            modal: {
                                noResultsText: '无法找到相关结果',
                                resetButtonTitle: '清除查询条件',
                                footer: {
                                    selectText: '选择',
                                    navigateText: '切换',
                                    closeText: '关闭'
                                }
                            }
                        }
                    }
                },
                miniSearch: {
                    searchOptions: {
                        fuzzy: 0.2,
                        prefix: true,
                        boost: { title: 4, text: 2, titles: 1 }
                    }
                }
            }
        },

        // 社交链接
        socialLinks: [
            {
                icon: {
                    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Gitee</title><path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z"/></svg>'
                },
                link: 'https://gitee.com/bkywksj/ruoyi-plus-uniapp-docs'
            }
        ],

        // 编辑链接
        editLink: {
            pattern: 'https://gitee.com/bkywksj/ruoyi-plus-uniapp-docs/edit/master/docs/:path',
            text: '在 Gitee 上编辑此页面'
        },

        // 页脚
        footer: {
            message: `© ${new Date().getFullYear()} 若依工作室`,
            copyright: `<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">粤ICP备2021091549号-5</a>`
        },

        // 文档页脚
        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        // 大纲配置
        outline: {
            level: [2, 3],
            label: '页面导航'
        },

        // 返回顶部
        returnToTopLabel: '回到顶部',

        // 侧边栏菜单标题
        sidebarMenuLabel: '菜单',

        // 深色模式切换标题
        darkModeSwitchLabel: '主题',
    },

    // Vite配置
    vite: {
        // 为组件预览功能配置
        define: {
            __COMPONENT_PREVIEW__: true
        },
        plugins: [llmsPlugin() as any],
        build: {
            chunkSizeWarningLimit: 1600
        },
        optimizeDeps: {
            exclude: ['vitepress']
        }
    },

    // Markdown配置
    markdown: {
        lineNumbers: true,
        image: {
            lazyLoading: true
        },
        config(md) {
            // 可以添加markdown插件
            // md.use(require('markdown-it-xxx'))
        }
    },

    // 站点地图
    sitemap: {
        hostname: 'https://ruoyi.plus'
    },

    // 缓存目录
    cacheDir: './.vitepress/cache',

    // 自定义配置
    transformPageData(pageData) {

        // 为每个页面添加最后更新时间
        pageData.frontmatter.lastUpdated = pageData.frontmatter.lastUpdated ?? true

        return pageData
    }
})
