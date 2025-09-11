import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

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
                        { text: '快速启动', link: '/backend/getting-started' },
                        { text: '项目结构', link: '/backend/project-structure' },
                        { text: '配置文件', link: '/backend/configuration' }
                    ]
                },
                {
                    text: '主应用(ruoyi-admin)',
                    items: [
                        { text: '模块解析', link: '/backend/ruoyi-admin/module-resolution' }
                    ]
                },
                {
                    text: '公共模块(ruoyi-common)',
                    collapsed: true,
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
                        { text: '通讯 (websocket)', link: '/backend/common/websocket' }
                    ]
                },
                {
                    text: '业务模块(ruoyi-modules)',
                    items: [
                        {
                            text: '系统模块 (system)',
                            collapsed: true,
                            items: [
                                { text: '模块概览', link: '/backend/modules/system' },
                                { text: '认证授权 (auth)', link: '/backend/modules/system/auth' },
                                { text: '系统配置 (config)', link: '/backend/modules/system/config' },
                                { text: '核心功能 (core)', link: '/backend/modules/system/core' },
                                { text: '字典管理 (dict)', link: '/backend/modules/system/dict' },
                                { text: '系统监控 (monitor)', link: '/backend/modules/system/monitor' },
                                { text: 'OSS存储 (oss)', link: '/backend/modules/system/oss' },
                                { text: '多租户 (tenant)', link: '/backend/modules/system/tenant' }
                            ]
                        },
                        {
                            text: '代码生成器 (Generator)',
                            collapsed: true,
                            items: [
                                { text: '模块概览', link: '/backend/modules/generator' },
                                { text: '快速开始', link: '/backend/modules/generator/quick-start' },
                                { text: '表导入与配置', link: '/backend/modules/generator/table-management' },
                                { text: '字段配置详解', link: '/backend/modules/generator/column-config' },
                                { text: '模板类型详解', link: '/backend/modules/generator/template-types' }
                            ]
                        },
                        {
                            text: '业务模块 (business)',
                            collapsed: true,
                            items: [
                                { text: '模块概览', link: '/backend/modules/business' },
                                { text: '基础服务 (base)', link: '/backend/modules/business/base' },
                                { text: '商城模块 (mall)', link: '/backend/modules/business/mall' },
                                { text: '任务调度 (job)', link: '/backend/modules/business/job' }
                            ]
                        }
                    ]
                },
                {
                    text: '扩展模块(ruoyi-extend)',
                    items: [
                        { text: '监控管理 (monitor-admin)', link: '/backend/extend/monitor-admin' },
                        { text: '任务服务 (snailjob-server)', link: '/backend/extend/snailjob-server' }
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
                    collapsed: true,
                    items: [
                        { text: '技术栈介绍', link: '/frontend/architecture/tech-stack' },
                        { text: '模块化设计', link: '/frontend/architecture/modular-design' },
                        { text: 'TypeScript配置', link: '/frontend/architecture/typescript-config' },
                        { text: '类型系统', link: '/frontend/architecture/type-system' },
                        { text: 'Vite构建配置', link: '/frontend/architecture/vite-config' }
                    ]
                },
                {
                    text: '🛣️ 路由系统 (router)',
                    collapsed: true,
                    items: [
                        { text: '路由总览', link: '/frontend/router/overview' },
                        { text: '路由配置与守卫', link: '/frontend/router/config-guards' },
                        { text: '权限与动态路由', link: '/frontend/router/permission-dynamic' }
                    ]
                },
                {
                    text: '📦 状态管理 (stores)',
                    collapsed: true,
                    items: [
                        { text: '状态管理概览', link: '/frontend/stores/overview' },
                        { text: '用户状态 (user)', link: '/frontend/stores/user-store' },
                        { text: '权限状态 (permission)', link: '/frontend/stores/permission-store' },
                        { text: '应用状态 (state)', link: '/frontend/stores/state-store' },
                        { text: '主题状态 (theme)', link: '/frontend/stores/theme-store' },
                        { text: '标签视图 (tagsView)', link: '/frontend/stores/tags-view-store' },
                        { text: '字典状态 (dict)', link: '/frontend/stores/dict-store' },
                        { text: '通知状态 (notice)', link: '/frontend/stores/notice-store' }
                    ]
                },
                {
                    text: '🎨 布局系统 (Layout)',
                    collapsed: true,
                    items: [
                        { text: '布局概述', link: '/frontend/layout/layout-overview' },
                        { text: '主布局(Layout)', link: '/frontend/layout/main-layout' },
                        { text: '侧边栏(SideBar)', link: '/frontend/layout/sidebar' },
                        { text: '顶部导航(NavBar)', link: '/frontend/layout/navbar' },
                        { text: '标签视图(TagsView)', link: '/frontend/layout/tags-view' },
                        { text: '主内容区(AppMain)', link: '/frontend/layout/app-main' },
                        { text: '设置面板(Settings)', link: '/frontend/layout/settings' },
                        { text: '前台布局 (HomeLayout)', link: '/frontend/layout/home-layout' }
                    ]
                },
                {
                    text: '🧩 组件系统 (Components)',
                    collapsed: true,
                    items: [
                        // 1. 概览和指南
                        { text: '组件概览', link: '/frontend/components/overview' },

                        // 2. 基础组件
                        {
                            text: '基础组件',
                            collapsed: false,
                            items: [
                                { text: '图标系统', link: '/frontend/components/basic/icon-system' },
                                { text: 'Icon 图标', link: '/frontend/components/basic/icon' },
                                { text: 'DictTag 字典标签', link: '/frontend/components/basic/dict-tag' },
                            ]
                        },

                        // 3. 表单组件
                        {
                            text: '表单组件',
                            collapsed: false,
                            items: [
                                { text: '表单组件概览', link: '/frontend/components/form/overview' },
                                { text: 'AForm 表单容器', link: '/frontend/components/form/form' },
                                { text: 'AFormCascader 级联选择', link: '/frontend/components/form/cascader' },
                                { text: 'AFormCheckbox 复选框', link: '/frontend/components/form/checkbox' },
                                { text: 'AFormDate 日期选择', link: '/frontend/components/form/date' },
                                { text: 'AFormEditor 富文本编辑', link: '/frontend/components/form/editor' },
                                { text: 'AFormFileUpload 文件上传', link: '/frontend/components/form/file-upload' },
                                { text: 'AFormImgUpload 图片上传', link: '/frontend/components/form/img-upload' },
                                { text: 'AFormInput 输入框', link: '/frontend/components/form/input' },
                                { text: 'AFormRadio 单选框', link: '/frontend/components/form/radio' },
                                { text: 'AFormSelect 选择器', link: '/frontend/components/form/select' },
                                { text: 'AFormSwitch 开关', link: '/frontend/components/form/switch' },
                                { text: 'AFormTreeSelect 树选择', link: '/frontend/components/form/tree-select' },
                                { text: 'IconSelect 图标选择器', link: '/frontend/components/form/icon-select' },
                            ]
                        },

                        // 4. 数据展示组件
                        {
                            text: '数据展示',
                            collapsed: false,
                            items: [
                                { text: 'ADataCard 数据卡片', link: '/frontend/components/display/data-card' },
                                { text: 'ADetailDialog 详情对话框', link: '/frontend/components/display/detail-dialog' },
                                { text: 'TableToolbar 表格工具栏', link: '/frontend/components/display/table-toolbar' },
                                { text: 'Pagination 分页', link: '/frontend/components/display/pagination' },
                            ]
                        },

                        // 5. 反馈组件
                        {
                            text: '反馈组件',
                            collapsed: false,
                            items: [
                                { text: 'ASearchForm 搜索表单', link: '/frontend/components/feedback/search-form' },
                                { text: 'ASelectionTags 选择标签', link: '/frontend/components/feedback/selection-tags' },
                            ]
                        },

                        // 6. 业务组件
                        {
                            text: '业务组件',
                            collapsed: false,
                            items: [
                                { text: '业务组件概览', link: '/frontend/components/business/overview' },
                                { text: 'AOssMediaManager 媒体库', link: '/frontend/components/business/oss-media-manager' },
                                { text: 'ARecharge 充值组件', link: '/frontend/components/business/recharge' },
                                { text: 'AImportExcel Excel 导入', link: '/frontend/components/business/import-excel' },
                                { text: 'UserSelect 用户选择', link: '/frontend/components/business/user-select' },
                            ]
                        },

                        // 7. 布局组件
                        {
                            text: '布局组件',
                            collapsed: false,
                            items: [
                                { text: 'APageBackground 页面背景', link: '/frontend/components/layout/page-background' },
                                { text: 'EnhancedIFrame 增强iframe', link: '/frontend/components/layout/enhanced-iframe' },
                            ]
                        }
                    ]
                },
                {
                    text: '📄 页面开发 (views)',
                    collapsed: true,
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
                    text: '📋 指令系统 (directives)',
                    collapsed: true,
                    items: [
                        { text: '指令概览', link: '/frontend/directives/overview' },
                        { text: '权限指令 (v-auth)', link: '/frontend/directives/permission' },
                        { text: '复制指令 (v-copy)', link: '/frontend/directives/copy' },
                        { text: '自定义指令开发', link: '/frontend/directives/custom' }
                    ]
                },
                {
                    text: '🎨 样式系统 (styles)',
                    collapsed: true,
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
                    collapsed: true,
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
                    collapsed: true,
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
                    text: '🚀 开发环境',
                    items: [
                        { text: '环境搭建指南', link: '/practices/dev-environment-setup' },
                        { text: '开发工具配置', link: '/practices/dev-tools-config' },
                        { text: '环境变量管理', link: '/practices/environment-variables' },
                        { text: '依赖管理', link: '/practices/dependency-management' }
                    ]
                },
                {
                    text: '📋 开发规范',
                    items: [
                        { text: '编码规范', link: '/practices/coding-standards' },
                        { text: '命名规范', link: '/practices/naming-conventions' },
                        { text: '注释规范', link: '/practices/comment-standards' },
                        { text: 'Git使用规范', link: '/practices/git-standards' },
                        { text: '代码审查规范', link: '/practices/code-review' },
                        { text: 'API设计规范', link: '/practices/api-design-standards' }
                    ]
                },
                {
                    text: '🏗️ 架构设计',
                    items: [
                        { text: '系统架构设计', link: '/practices/system-architecture' },
                        { text: '数据库设计', link: '/practices/database-design' },
                        { text: '缓存策略', link: '/practices/cache-strategy' },
                        { text: '分布式设计', link: '/practices/distributed-design' },
                        { text: '微服务架构', link: '/practices/microservices-architecture' },
                        { text: '多租户架构', link: '/practices/multi-tenant-architecture' }
                    ]
                },
                {
                    text: '💻 后端开发',
                    items: [
                        { text: 'Service层最佳实践', link: '/practices/service-layer-practices' },
                        { text: 'Controller层最佳实践', link: '/practices/controller-layer-practices' },
                        { text: '数据访问层优化', link: '/practices/data-access-optimization' },
                        { text: '事务管理策略', link: '/practices/transaction-management' },
                        { text: '异常处理机制', link: '/practices/exception-handling' },
                        { text: '数据校验最佳实践', link: '/practices/data-validation' }
                    ]
                },
                {
                    text: '🔧 功能开发',
                    items: [
                        { text: '权限控制实现', link: '/practices/permission-control-implementation' },
                        { text: '数据权限设计', link: '/practices/data-permission-design' },
                        { text: '定时任务开发', link: '/practices/scheduled-job-development' },
                        { text: '消息推送实现', link: '/practices/message-push-implementation' },
                        { text: '文件处理方案', link: '/practices/file-processing-solution' },
                        { text: 'Excel操作优化', link: '/practices/excel-operations-optimization' },
                        { text: '第三方集成策略', link: '/practices/third-party-integration' },
                        { text: '国际化实现方案', link: '/practices/i18n-implementation' }
                    ]
                },
                {
                    text: '🧪 测试策略',
                    items: [
                        { text: '单元测试最佳实践', link: '/practices/unit-testing-practices' },
                        { text: '集成测试策略', link: '/practices/integration-testing-strategy' },
                        { text: '自动化测试框架', link: '/practices/automated-testing-framework' },
                        { text: '测试数据管理', link: '/practices/test-data-management' },
                        { text: '性能测试指南', link: '/practices/performance-testing-guide' }
                    ]
                },
                {
                    text: '⚡ 性能优化',
                    items: [
                        { text: '后端性能优化', link: '/practices/backend-performance' },
                        { text: '前端性能优化', link: '/practices/frontend-performance' },
                        { text: '移动端性能优化', link: '/practices/mobile-performance' },
                        { text: '数据库优化', link: '/practices/database-optimization' },
                        { text: '缓存优化策略', link: '/practices/cache-optimization' },
                        { text: '网络优化', link: '/practices/network-optimization' },
                        { text: 'JVM调优指南', link: '/practices/jvm-tuning-guide' }
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
                        { text: '移动端安全', link: '/practices/mobile-security' },
                        { text: '传输安全', link: '/practices/transport-security' },
                        { text: '漏洞防护', link: '/practices/vulnerability-protection' }
                    ]
                },
                {
                    text: '🛠️ 工程化',
                    items: [
                        { text: '代码生成器使用', link: '/practices/code-generator-usage' },
                        { text: '构建优化', link: '/practices/build-optimization' },
                        { text: 'CI/CD最佳实践', link: '/practices/cicd-best-practices' },
                        { text: '代码质量管控', link: '/practices/code-quality-control' },
                        { text: '技术债务管理', link: '/practices/technical-debt-management' }
                    ]
                },
                {
                    text: '🚀 部署运维',
                    items: [
                        { text: '1Panel Docker部署', link: '/practices/1panel-docker-deploy' },
                        { text: '容器化最佳实践', link: '/practices/containerization-practices' },
                        { text: '监控告警', link: '/practices/monitoring-alerting' },
                        { text: '日志管理', link: '/practices/log-management' },
                        { text: '备份策略', link: '/practices/backup-strategy' },
                        { text: '故障排查指南', link: '/practices/troubleshooting-guide' },
                        { text: '灰度发布策略', link: '/practices/canary-deployment' }
                    ]
                },
                {
                    text: '📊 数据管理',
                    items: [
                        { text: '数据库设计规范', link: '/practices/database-design-standards' },
                        { text: '数据迁移策略', link: '/practices/data-migration-strategy' },
                        { text: '数据一致性保证', link: '/practices/data-consistency' },
                        { text: '大数据处理', link: '/practices/big-data-processing' },
                        { text: '数据备份恢复', link: '/practices/data-backup-recovery' }
                    ]
                },
                {
                    text: '🔄 团队协作',
                    items: [
                        { text: '敏捷开发实践', link: '/practices/agile-development' },
                        { text: '团队工作流程', link: '/practices/team-workflow' },
                        { text: '知识管理', link: '/practices/knowledge-management' },
                        { text: '技术分享机制', link: '/practices/tech-sharing' },
                        { text: '新人入职指南', link: '/practices/onboarding-guide' }
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
    ignoreDeadLinks: [
        // 忽略所有本地链接
        /^http:\/\/localhost/,
    ],
    // Vite配置
    vite: {
        // 为组件预览功能配置
        define: {
            __COMPONENT_PREVIEW__: true
        },
        plugins: [llmstxt({
            domain: 'https://ruoyi.plus',

        }),],
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
