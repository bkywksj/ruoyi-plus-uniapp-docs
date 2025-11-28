import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'ruoyi-plus-uniapp 开发文档',
    description: '全栈开发文档 - 后端、前端、移动端完整指南',
    base: '/',
    lastUpdated: false,
    cleanUrls: false,

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
                    collapsed: true,
                    items: [
                        { text: '主应用概览', link: '/backend/ruoyi-admin/overview' },
                        { text: '模块解析', link: '/backend/ruoyi-admin/module-resolution' },
                        { text: '启动流程', link: '/backend/ruoyi-admin/startup-process' },
                        { text: '配置文件详解', link: '/backend/ruoyi-admin/configuration-detail' },
                        { text: '环境切换', link: '/backend/ruoyi-admin/environment-switching' }
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
                        { text: 'HTTP客户端 (http)', link: '/backend/common/http' },
                        {
                            text: 'LangChain4j AI集成 (langchain4j) ⭐',
                            collapsed: false,
                            items: [
                                { text: '模块概览', link: '/backend/common/langchain4j' },
                                { text: '快速开始', link: '/backend/common/langchain4j/quick-start' },
                                { text: '模型工厂', link: '/backend/common/langchain4j/model-factory' },
                                { text: '聊天服务', link: '/backend/common/langchain4j/chat-service' },
                                { text: 'RAG检索增强', link: '/backend/common/langchain4j/rag' },
                                { text: '向量存储', link: '/backend/common/langchain4j/vector-store' },
                                { text: 'WebSocket流式对话', link: '/backend/common/langchain4j/websocket' }
                            ]
                        },
                        { text: '邮件服务 (mail)', link: '/backend/common/mail' },
                        { text: '媒体处理 (media)', link: '/backend/common/media' },
                        { text: '小程序集成 (miniapp)', link: '/backend/common/miniapp' },
                        { text: '公众号集成 (mp)', link: '/backend/common/mp' },
                        { text: 'MyBatisPlus增强 (mybatis)', link: '/backend/common/mybatis' },
                        { text: 'OSS存储 (oss)', link: '/backend/common/oss' },
                        { text: '支付集成 (pay)', link: '/backend/common/pay' },
                        { text: 'OpenAPI文档 (openapi)', link: '/backend/common/openapi' },
                        { text: '限流组件 (ratelimiter)', link: '/backend/common/ratelimiter' },
                        { text: 'Redis缓存 (redis)', link: '/backend/common/redis' },
                        {
                            text: 'RocketMQ消息队列 (rocketmq) ⭐',
                            collapsed: false,
                            items: [
                                { text: '模块概览', link: '/backend/common/rocketmq' },
                                { text: '快速开始', link: '/backend/common/rocketmq/quick-start' },
                                { text: '消息发送', link: '/backend/common/rocketmq/send' },
                                { text: '消息消费', link: '/backend/common/rocketmq/consume' },
                                { text: '主题管理', link: '/backend/common/rocketmq/topic' },
                                { text: '最佳实践', link: '/backend/common/rocketmq/best-practices' }
                            ]
                        },
                        { text: '权限认证 (satoken)', link: '/backend/common/satoken' },
                        { text: '安全防护 (security)', link: '/backend/common/security' },
                        { text: '脱敏处理 (sensitive)', link: '/backend/common/sensitive' },
                        { text: '序列化映射 (serialmap)', link: '/backend/common/serialmap' },
                        { text: '短信服务 (sms)', link: '/backend/common/sms' },
                        { text: '社交登录 (social)', link: '/backend/common/social' },
                        { text: 'SSE推送 (sse)', link: '/backend/common/sse' },
                        { text: '多租户 (tenant)', link: '/backend/common/tenant' },
                        {
                            text: '测试支持 (test)',
                            collapsed: false,
                            items: [
                                { text: '模块概览', link: '/backend/common/test' },
                                { text: '测试基础类', link: '/backend/common/test/base-classes' },
                                { text: 'Service测试', link: '/backend/common/test/service-test' },
                                { text: 'Controller测试', link: '/backend/common/test/controller-test' },
                                { text: '测试数据工厂', link: '/backend/common/test/test-data-factory' }
                            ]
                        },
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
                    collapsed: true,
                    items: [
                        { text: '扩展模块概览', link: '/backend/extend/overview' },
                        { text: '监控管理 (monitor-admin)', link: '/backend/extend/monitor-admin' },
                        { text: '任务服务 (snailjob-server)', link: '/backend/extend/snailjob-server' },
                        { text: '扩展模块开发指南', link: '/backend/extend/development-guide' },
                        { text: '第三方服务集成', link: '/backend/extend/third-party-integration' }
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
                                {
                                    text: 'ADetailDialog 详情对话框',
                                    link: '/frontend/components/display/detail-dialog'
                                },
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
                                {
                                    text: 'ASelectionTags 选择标签',
                                    link: '/frontend/components/feedback/selection-tags'
                                },
                            ]
                        },

                        // 6. 业务组件
                        {
                            text: '业务组件',
                            collapsed: false,
                            items: [
                                { text: '业务组件概览', link: '/frontend/components/business/overview' },
                                {
                                    text: 'AOssMediaManager 媒体库',
                                    link: '/frontend/components/business/oss-media-manager'
                                },
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
                                {
                                    text: 'APageBackground 页面背景',
                                    link: '/frontend/components/layout/page-background'
                                },
                                {
                                    text: 'IFrameContainer iframe容器',
                                    link: '/frontend/components/layout/i-frame-container'
                                },
                            ]
                        }
                    ]
                },
                {
                    text: '🎣 组合式函数 (composables)',
                    collapsed: true,
                    items: [
                        { text: '组合式函数概览', link: '/frontend/composables/overview' },
                        {
                            text: '核心组合函数',
                            collapsed: false,
                            items: [
                                { text: 'useAuth 认证管理', link: '/frontend/composables/use-auth' },
                                { text: 'useDict 字典管理', link: '/frontend/composables/use-dict' },
                                { text: 'useHttp 请求管理', link: '/frontend/composables/use-http' },
                                { text: 'useToken 令牌管理', link: '/frontend/composables/use-token' },
                                { text: 'useI18n 国际化', link: '/frontend/composables/use-i18n' }
                            ]
                        },
                        {
                            text: '界面组合函数',
                            collapsed: false,
                            items: [
                                { text: 'useLayout 布局管理', link: '/frontend/composables/use-layout' },
                                { text: 'useAnimation 动画效果', link: '/frontend/composables/use-animation' },
                                { text: 'useDialog 对话框', link: '/frontend/composables/use-dialog' },
                                { text: 'useTheme 主题管理', link: '/frontend/composables/use-theme' },
                                { text: 'useResponsiveSpan 响应式', link: '/frontend/composables/use-responsive-span' },
                                { text: 'useTableHeight 表格高度', link: '/frontend/composables/use-table-height' }
                            ]
                        },
                        {
                            text: '业务组合函数',
                            collapsed: false,
                            items: [
                                { text: 'useSelection 选择管理', link: '/frontend/composables/use-selection' },
                                { text: 'useDownload 下载管理', link: '/frontend/composables/use-download' },
                                { text: 'usePrint 打印功能', link: '/frontend/composables/use-print' },
                                { text: 'useSSE 服务端事件', link: '/frontend/composables/use-sse' },
                                { text: 'useWS WebSocket通信', link: '/frontend/composables/use-websocket' }
                            ]
                        }
                    ]
                },
                {
                    text: '🛠️ 工具库 (utils)',
                    collapsed: true,
                    items: [
                        { text: '工具函数概览', link: '/frontend/utils/utils-overview' },
                        { text: '字符串工具', link: '/frontend/utils/string' },
                        { text: '对象工具', link: '/frontend/utils/object' },
                        { text: '日期工具', link: '/frontend/utils/date' },
                        { text: '格式化工具', link: '/frontend/utils/format' },
                        { text: '函数工具', link: '/frontend/utils/function' },
                        { text: '验证器', link: '/frontend/utils/validators' },
                        { text: '布尔值工具', link: '/frontend/utils/boolean' },
                        { text: '加密工具', link: '/frontend/utils/crypto' },
                        { text: 'RSA加密', link: '/frontend/utils/rsa' },
                        { text: '缓存工具', link: '/frontend/utils/cache' },
                        { text: 'DOM类操作', link: '/frontend/utils/class' },
                        { text: '滚动工具', link: '/frontend/utils/scroll' },
                        { text: '树形工具', link: '/frontend/utils/tree' },
                        { text: '模态框工具', link: '/frontend/utils/modal' },
                        { text: '标签页工具', link: '/frontend/utils/tab' },
                        { text: 'To工具类', link: '/frontend/utils/to' }
                    ]
                },
                {
                    text: '📋 指令系统 (directives)',
                    collapsed: true,
                    items: [
                        { text: '权限指令', link: '/frontend/directives/permission' }
                    ]
                },
                {
                    text: '🎨 样式系统 (styles)',
                    collapsed: true,
                    items: [
                        // 基础架构
                        {
                            text: '基础架构',
                            items: [
                                { text: '样式架构概述', link: '/frontend/styles/architecture/overview' },
                                { text: '文件组织', link: '/frontend/styles/architecture/file-organization' }
                            ]
                        },

                        // 原子化CSS
                        {
                            text: '原子化CSS',
                            items: [
                                { text: 'UnoCSS配置', link: '/frontend/styles/atomic/unocss-config' },
                                { text: '快捷方式定义', link: '/frontend/styles/atomic/shortcuts' },
                                { text: '自定义规则', link: '/frontend/styles/atomic/custom-rules' },
                                { text: '工具类使用', link: '/frontend/styles/atomic/utility-classes' }
                            ]
                        },

                        // 基础样式
                        {
                            text: '基础样式',
                            items: [
                                { text: '样式重置', link: '/frontend/styles/base/reset' },
                                { text: '排版系统', link: '/frontend/styles/base/typography' },
                                { text: '全局变量', link: '/frontend/styles/base/variables' },
                                { text: 'Mixins工具', link: '/frontend/styles/base/mixins' }
                            ]
                        },

                        // 主题系统
                        {
                            text: '主题系统',
                            items: [
                                { text: '主题概述', link: '/frontend/styles/theme/overview' },
                                { text: '亮色主题', link: '/frontend/styles/theme/light-theme' },
                                { text: '暗色主题', link: '/frontend/styles/theme/dark-theme' },
                                { text: '主题切换', link: '/frontend/styles/theme/theme-switching' },
                                { text: 'CSS变量系统', link: '/frontend/styles/theme/css-variables' }
                            ]
                        },

                        // 组件样式
                        {
                            text: '组件样式',
                            items: [
                                { text: 'Element Plus覆盖', link: '/frontend/styles/components/element-plus' },
                                { text: '按钮组件', link: '/frontend/styles/components/buttons' },
                                { text: '布局组件', link: '/frontend/styles/components/layout' },
                                { text: '自定义组件样式', link: '/frontend/styles/components/custom' }
                            ]
                        },

                        // 动画系统
                        {
                            text: '动画系统',
                            items: [
                                { text: '动画概述', link: '/frontend/styles/animations/overview' },
                                { text: '过渡动画', link: '/frontend/styles/animations/transitions' },
                                { text: '关键帧动画', link: '/frontend/styles/animations/keyframes' },
                                { text: '图标动画', link: '/frontend/styles/animations/icon-animations' },
                                { text: '对话框动画', link: '/frontend/styles/animations/dialog-animations' }
                            ]
                        },

                        // 响应式设计
                        {
                            text: '响应式设计',
                            items: [
                                { text: '断点系统', link: '/frontend/styles/responsive/breakpoints' },
                                { text: '移动端适配', link: '/frontend/styles/responsive/mobile' },
                                { text: '平板适配', link: '/frontend/styles/responsive/tablet' },
                                { text: '响应式工具', link: '/frontend/styles/responsive/utilities' }
                            ]
                        },

                        // 最佳实践
                        {
                            text: '最佳实践',
                            items: [
                                { text: '样式规范', link: '/frontend/styles/best-practices/conventions' },
                                { text: '性能优化', link: '/frontend/styles/best-practices/performance' },
                                { text: '维护指南', link: '/frontend/styles/best-practices/maintenance' },
                                { text: '常见问题', link: '/frontend/styles/best-practices/troubleshooting' }
                            ]
                        }
                    ]
                },
                {
                    text: '🎭 图标系统 (icons)',
                    collapsed: true,
                    items: [
                        { text: '图标系统概述', link: '/frontend/icons/overview' },
                        { text: 'Iconify配置', link: '/frontend/icons/iconify-config' },
                        { text: 'Iconfont配置', link: '/frontend/icons/iconfont-config' },
                        { text: '图标类型生成', link: '/frontend/icons/type-generation' },
                        { text: '图标组件使用', link: '/frontend/icons/component-usage' },
                        { text: '图标预设管理', link: '/frontend/icons/preset-management' },
                        { text: '图标最佳实践', link: '/frontend/icons/best-practices' }
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
                        { text: 'Prettier配置', link: '/frontend/dev/prettier-config' },
                        { text: '调试技巧', link: '/frontend/dev/debugging' },
                        { text: '性能分析', link: '/frontend/dev/performance' },
                        { text: '单元测试', link: '/frontend/dev/testing' },
                        { text: '开发最佳实践', link: '/frontend/dev/best-practices' }
                    ]
                },
                {
                    text: '🖼️ 低代码工具 (tools)',
                    collapsed: true,
                    items: [
                        { text: '页面设计器', link: '/frontend/tools/page-designer' }
                    ]
                },
                {
                    text: '🌍 国际化 (locales)',
                    collapsed: true,
                    items: [
                        { text: '国际化配置', link: '/frontend/i18n/i18n-config' },
                        { text: '语言包管理', link: '/frontend/i18n/language-packs' },
                        { text: '组件国际化', link: '/frontend/i18n/component-i18n' },
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
                        { text: '配置文件', link: '/mobile/configuration' },
                        { text: '开发规范', link: '/mobile/dev-standards' }
                    ]
                },
                {
                    text: '🏗️ UniApp基础',
                    collapsed: true,
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
                    text: '🧩 WD UI 组件库 (98组件)',
                    collapsed: true,
                    items: [
                        { text: '组件库概览', link: '/mobile/wd/overview' },
                        { text: '主题定制', link: '/mobile/styles/theme' },
                        { text: '快速开始', link: '/mobile/wd/getting-started' },
                        {
                            text: '基础组件 (6个)',
                            collapsed: false,
                            items: [
                                { text: 'Button 按钮', link: '/mobile/wd/basic/button' },
                                { text: 'Icon 图标', link: '/mobile/wd/basic/icon' },
                                { text: 'Text 文本', link: '/mobile/wd/basic/text' },
                                { text: 'Transition 动画', link: '/mobile/wd/basic/transition' },
                                { text: 'Resize 监听元素尺寸', link: '/mobile/wd/basic/resize' },
                                { text: 'ConfigProvider 配置', link: '/mobile/wd/basic/config-provider' }
                            ]
                        },
                        {
                            text: '布局组件 (5个)',
                            collapsed: false,
                            items: [
                                { text: 'Row-Col 行列布局', link: '/mobile/wd/layout/row-col' },
                                { text: 'Grid 宫格', link: '/mobile/wd/layout/grid' },
                                { text: 'Gap 间隙槽', link: '/mobile/wd/layout/gap' },
                                { text: 'Divider 分割线', link: '/mobile/wd/layout/divider' },
                                { text: 'Sticky 吸顶布局', link: '/mobile/wd/layout/sticky' }
                            ]
                        },
                        {
                            text: '导航组件 (9个)',
                            collapsed: false,
                            items: [
                                { text: 'Navbar 导航栏', link: '/mobile/wd/navigation/navbar' },
                                { text: 'Tabbar 标签栏', link: '/mobile/wd/navigation/tabbar' },
                                { text: 'Tabs 标签页', link: '/mobile/wd/navigation/tabs' },
                                { text: 'Segmented 分段器', link: '/mobile/wd/navigation/segmented' },
                                { text: 'Sidebar 侧边栏', link: '/mobile/wd/navigation/sidebar' },
                                { text: 'IndexBar 索引栏', link: '/mobile/wd/navigation/index-bar' },
                                { text: 'Pagination 分页', link: '/mobile/wd/navigation/pagination' },
                                { text: 'Paging 分页加载', link: '/mobile/wd/navigation/paging' },
                                { text: 'Backtop 回到顶部', link: '/mobile/wd/navigation/backtop' }
                            ]
                        },
                        {
                            text: '表单组件 (22个)',
                            collapsed: false,
                            items: [
                                { text: 'Input 输入框', link: '/mobile/wd/form/input' },
                                { text: 'Textarea 文本域', link: '/mobile/wd/form/textarea' },
                                { text: 'InputNumber 计数器', link: '/mobile/wd/form/input-number' },
                                { text: 'PasswordInput 密码', link: '/mobile/wd/form/password-input' },
                                { text: 'Search 搜索', link: '/mobile/wd/form/search' },
                                { text: 'Checkbox 复选框', link: '/mobile/wd/form/checkbox' },
                                { text: 'Radio 单选框', link: '/mobile/wd/form/radio' },
                                { text: 'Switch 开关', link: '/mobile/wd/form/switch' },
                                { text: 'Rate 评分', link: '/mobile/wd/form/rate' },
                                { text: 'Slider 滑块', link: '/mobile/wd/form/slider' },
                                { text: 'Picker 选择器', link: '/mobile/wd/form/picker' },
                                { text: 'PickerView 选择器视图', link: '/mobile/wd/form/picker-view' },
                                { text: 'ColPicker 多列选择器', link: '/mobile/wd/form/col-picker' },
                                { text: 'SelectPicker 单复选', link: '/mobile/wd/form/select-picker' },
                                { text: 'DatetimePicker 时间', link: '/mobile/wd/form/datetime-picker' },
                                { text: 'DatetimePickerView', link: '/mobile/wd/form/datetime-picker-view' },
                                { text: 'Calendar 日历', link: '/mobile/wd/form/calendar' },
                                { text: 'CalendarView 日历板', link: '/mobile/wd/form/calendar-view' },
                                { text: 'Upload 上传', link: '/mobile/wd/form/upload' },
                                { text: 'Form 表单', link: '/mobile/wd/form/form' },
                                { text: 'Signature 签名', link: '/mobile/wd/form/signature' },
                                { text: 'Recorder 录音', link: '/mobile/wd/form/voice-recorder' }
                            ]
                        },
                        {
                            text: '展示组件 (11个)',
                            collapsed: false,
                            items: [
                                { text: 'Cell 单元格', link: '/mobile/wd/display/cell' },
                                { text: 'Badge 徽标', link: '/mobile/wd/display/badge' },
                                { text: 'Tag 标签', link: '/mobile/wd/display/tag' },
                                { text: 'Card 卡片', link: '/mobile/wd/display/card' },
                                { text: 'Collapse 折叠面板', link: '/mobile/wd/display/collapse' },
                                { text: 'Steps 步骤条', link: '/mobile/wd/display/steps' },
                                { text: 'Table 表格', link: '/mobile/wd/display/table' },
                                { text: 'Img 图片', link: '/mobile/wd/display/img' },
                                { text: 'ImgCropper 图片裁剪', link: '/mobile/wd/display/img-cropper' },
                                { text: 'Swiper 轮播图', link: '/mobile/wd/display/swiper' },
                                { text: 'Skeleton 骨架屏', link: '/mobile/wd/display/skeleton' },
                                { text: 'Curtain 幕帘', link: '/mobile/wd/display/curtain' },
                                { text: 'Watermark 水印', link: '/mobile/wd/display/watermark' }
                            ]
                        },
                        {
                            text: '反馈组件 (23个)',
                            collapsed: false,
                            items: [
                                { text: 'ActionSheet 上拉菜单', link: '/mobile/wd/feedback/action-sheet' },
                                { text: 'Popup 弹出层', link: '/mobile/wd/feedback/popup' },
                                { text: 'Overlay 遮罩层', link: '/mobile/wd/feedback/overlay' },
                                { text: 'MessageBox 弹框', link: '/mobile/wd/feedback/message-box' },
                                { text: 'Toast 轻提示', link: '/mobile/wd/feedback/toast' },
                                { text: 'Notify 消息通知', link: '/mobile/wd/feedback/notify' },
                                { text: 'Loading 加载指示器', link: '/mobile/wd/feedback/loading' },
                                { text: 'Progress 进度条', link: '/mobile/wd/feedback/progress' },
                                { text: 'Circle 环形进度条', link: '/mobile/wd/feedback/circle' },
                                { text: 'Loadmore 加载更多', link: '/mobile/wd/feedback/loadmore' },
                                { text: 'StatusTip 缺省提示', link: '/mobile/wd/feedback/status-tip' },
                                { text: 'Tooltip 文字提示', link: '/mobile/wd/feedback/tooltip' },
                                { text: 'Popover 气泡', link: '/mobile/wd/feedback/popover' },
                                { text: 'DropMenu 下拉菜单', link: '/mobile/wd/feedback/drop-menu' },
                                { text: 'FloatingPanel 浮动面板', link: '/mobile/wd/feedback/floating-panel' },
                                { text: 'SwipeAction 滑动操作', link: '/mobile/wd/feedback/swipe-action' },
                                { text: 'SortButton 排序按钮', link: '/mobile/wd/feedback/sort-button' },
                                { text: 'NoticeBar 通知栏', link: '/mobile/wd/feedback/notice-bar' },
                                { text: 'CountDown 倒计时', link: '/mobile/wd/feedback/count-down' },
                                { text: 'CountTo 数字滚动', link: '/mobile/wd/feedback/count-to' },
                                { text: 'Keyboard 虚拟键盘', link: '/mobile/wd/feedback/keyboard' },
                                { text: 'NumberKeyboard 数字', link: '/mobile/wd/feedback/number-keyboard' },
                                { text: 'Fab 悬浮按钮', link: '/mobile/wd/feedback/fab' }
                            ]
                        }
                    ]
                },
                {
                    text: '🎣 组合式函数 (composables)',
                    collapsed: true,
                    items: [
                        { text: '组合式函数概览', link: '/mobile/composables/overview' },
                        { text: '自动导入配置', link: '/mobile/composables/auto-imports' },
                        {
                            text: '核心组合函数',
                            collapsed: false,
                            items: [
                                { text: 'useAuth 认证管理', link: '/mobile/composables/use-auth' },
                                { text: 'useDict 字典管理', link: '/mobile/composables/use-dict' },
                                { text: 'useHttp 请求管理', link: '/mobile/composables/use-http' },
                                { text: 'useToken 令牌管理', link: '/mobile/composables/use-token' },
                                { text: 'useAppInit 应用初始化', link: '/mobile/composables/use-app-init' }
                            ]
                        },
                        {
                            text: '业务组合函数',
                            collapsed: false,
                            items: [
                                { text: 'usePayment 支付处理', link: '/mobile/composables/use-payment' },
                                { text: 'useShare 分享功能', link: '/mobile/composables/use-share' },
                                { text: 'useScroll 滚动处理', link: '/mobile/composables/use-scroll' },
                                { text: 'useEventBus 事件总线', link: '/mobile/composables/use-event-bus' },
                                { text: 'useWebSocket 实时通信', link: '/mobile/composables/use-websocket' }
                            ]
                        },
                        {
                            text: '界面组合函数',
                            collapsed: false,
                            items: [
                                { text: 'useTheme 主题管理', link: '/mobile/composables/use-theme' },
                                { text: 'useI18n 国际化', link: '/mobile/composables/use-i18n' }
                            ]
                        },
                        { text: '自定义Hook开发', link: '/mobile/composables/custom-hooks' }
                    ]
                },
                {
                    text: '🛠️ 工具库 (utils)',
                    collapsed: true,
                    items: [
                        { text: '工具函数概览', link: '/mobile/utils/overview' },
                        {
                            text: '基础工具',
                            collapsed: false,
                            items: [
                                { text: 'string 字符串工具', link: '/mobile/utils/string' },
                                { text: 'boolean 布尔值工具', link: '/mobile/utils/boolean' },
                                { text: 'function 函数工具', link: '/mobile/utils/function' },
                                { text: 'date 日期工具', link: '/mobile/utils/date' },
                                { text: 'validators 验证工具', link: '/mobile/utils/validators' }
                            ]
                        },
                        {
                            text: '业务工具',
                            collapsed: false,
                            items: [
                                { text: 'cache 缓存工具', link: '/mobile/utils/cache' },
                                { text: 'route 路由工具', link: '/mobile/utils/route' },
                                { text: 'platform 平台工具', link: '/mobile/utils/platform' },
                                { text: 'tenant 租户工具', link: '/mobile/utils/tenant' }
                            ]
                        },
                        {
                            text: '安全工具',
                            collapsed: false,
                            items: [
                                { text: 'crypto 加密工具', link: '/mobile/utils/crypto' },
                                { text: 'rsa RSA加密', link: '/mobile/utils/rsa' }
                            ]
                        },
                        {
                            text: '辅助工具',
                            collapsed: false,
                            items: [
                                { text: 'to 异步处理', link: '/mobile/utils/to' }
                            ]
                        }
                    ]
                },
                {
                    text: '📄 页面开发 (pages)',
                    collapsed: true,
                    items: [
                        { text: '页面开发指南', link: '/mobile/pages/development-guide' },
                        { text: '页面生命周期', link: '/mobile/pages/lifecycle' },
                        { text: '页面路由传参', link: '/mobile/pages/route-params' },
                        {
                            text: '主包页面',
                            collapsed: false,
                            items: [
                                { text: '首页 (index)', link: '/mobile/pages/main/index' },
                                { text: '个人中心 (my)', link: '/mobile/pages/main/my' },
                                { text: '设置页面 (settings)', link: '/mobile/pages/main/settings' }
                            ]
                        },
                        {
                            text: '认证页面',
                            collapsed: false,
                            items: [
                                { text: '统一认证 (auth)', link: '/mobile/pages/auth/auth' },
                                { text: '账号登录 (login)', link: '/mobile/pages/auth/login' },
                                { text: '手机登录 (phoneLogin)', link: '/mobile/pages/auth/phone-login' },
                                { text: '用户注册 (register)', link: '/mobile/pages/auth/register' },
                                { text: '短信验证 (smsVerify)', link: '/mobile/pages/auth/sms-verify' }
                            ]
                        },
                        {
                            text: '分包页面',
                            collapsed: false,
                            items: [
                                { text: '分包管理', link: '/mobile/pages/subpackages/overview' },
                                { text: '管理员页面 (admin)', link: '/mobile/pages/subpackages/admin' },
                                { text: '业务页面扩展', link: '/mobile/pages/subpackages/business' }
                            ]
                        }
                    ]
                },
                {
                    text: '🎨 布局系统 (layouts)',
                    collapsed: true,
                    items: [
                        { text: '布局概述', link: '/mobile/layouts/overview' },
                        { text: '默认布局 (default)', link: '/mobile/layouts/default' },
                        { text: '导航栏配置', link: '/mobile/layouts/navbar' },
                        { text: '标签栏配置', link: '/mobile/layouts/tabbar' },
                        { text: '胶囊组件', link: '/mobile/layouts/capsule' },
                        { text: '自定义布局', link: '/mobile/layouts/custom' }
                    ]
                },
                {
                    text: '🏪 状态管理 (stores)',
                    collapsed: true,
                    items: [
                        { text: '状态管理概览', link: '/mobile/stores/overview' },
                        { text: 'Pinia配置', link: '/mobile/stores/pinia-config' },
                        { text: '用户状态 (user)', link: '/mobile/stores/user' },
                        { text: '字典状态 (dict)', link: '/mobile/stores/dict' },
                        { text: '标签栏状态 (tabbar)', link: '/mobile/stores/tabbar' },
                        { text: '持久化存储', link: '/mobile/stores/persistence' }
                    ]
                },
                {
                    text: '🎨 样式系统 (styles)',
                    collapsed: true,
                    items: [
                        { text: '样式概览', link: '/mobile/styles/overview' },
                        { text: '样式架构设计', link: '/mobile/styles/architecture' },
                        { text: 'UnoCSS配置', link: '/mobile/styles/unocss' },
                        { text: '全局样式 (uni.scss)', link: '/mobile/styles/global' },
                        { text: 'rpx单位使用', link: '/mobile/styles/rpx-units' },
                        { text: '主题定制', link: '/mobile/styles/theme' },
                        { text: '响应式设计', link: '/mobile/styles/responsive' },
                        { text: '组件样式', link: '/mobile/styles/components' },
                        { text: '样式最佳实践', link: '/mobile/styles/best-practices' }
                    ]
                },
                {
                    text: '📝 类型定义 (types)',
                    collapsed: true,
                    items: [
                        { text: '类型系统概览', link: '/mobile/types/overview' },
                        { text: '全局类型 (global.d.ts)', link: '/mobile/types/global' },
                        { text: 'HTTP类型 (http.d.ts)', link: '/mobile/types/http' },
                        { text: '环境类型 (env.d.ts)', link: '/mobile/types/env' },
                        { text: '组件类型 (components.d.ts)', link: '/mobile/types/components' },
                        { text: '页面类型 (uni-pages.d.ts)', link: '/mobile/types/uni-pages' },
                        { text: '静态资源类型', link: '/mobile/types/static-assets' },
                        { text: '自动导入类型', link: '/mobile/types/auto-imports' },
                        { text: '异步组件类型', link: '/mobile/types/async-components' }
                    ]
                },
                {
                    text: '🌍 国际化 (locales)',
                    collapsed: true,
                    items: [
                        { text: '国际化配置', link: '/mobile/i18n/config' },
                        { text: '语言包管理', link: '/mobile/i18n/language-packs' },
                        { text: '中文语言包 (zh-CN)', link: '/mobile/i18n/zh-cn' },
                        { text: '英文语言包 (en-US)', link: '/mobile/i18n/en-us' },
                        { text: '动态语言切换', link: '/mobile/i18n/dynamic-switching' },
                        { text: '国际化最佳实践', link: '/mobile/i18n/best-practices' }
                    ]
                },
                {
                    text: '📦 组件开发',
                    collapsed: true,
                    items: [
                        { text: '自定义组件开发', link: '/mobile/components/custom-development' },
                        { text: '组件封装规范', link: '/mobile/components/encapsulation-standards' },
                        { text: '组件通信模式', link: '/mobile/components/communication-patterns' },
                        { text: '组件生命周期', link: '/mobile/components/lifecycle' },
                        { text: '组件测试', link: '/mobile/components/testing' }
                    ]
                },
                {
                    text: '📱 平台适配',
                    collapsed: true,
                    items: [
                        { text: '平台差异说明', link: '/mobile/platform/differences' },
                        { text: '条件编译使用', link: '/mobile/platform/conditional-compilation' },
                        { text: 'H5端适配', link: '/mobile/platform/h5' },
                        { text: '微信小程序适配', link: '/mobile/platform/wechat' },
                        { text: '支付宝小程序适配', link: '/mobile/platform/alipay' },
                        { text: '百度小程序适配', link: '/mobile/platform/baidu' },
                        { text: 'QQ小程序适配', link: '/mobile/platform/qq' },
                        { text: '抖音小程序适配', link: '/mobile/platform/toutiao' },
                        { text: 'Android App适配', link: '/mobile/platform/android' },
                        { text: 'iOS App适配', link: '/mobile/platform/ios' },
                        { text: '鸿蒙适配', link: '/mobile/platform/harmony' }
                    ]
                },
                {
                    text: '⚡ 性能优化',
                    collapsed: true,
                    items: [
                        { text: '性能优化概览', link: '/mobile/performance/overview' },
                        { text: '启动性能优化', link: '/mobile/performance/startup' },
                        { text: '渲染性能优化', link: '/mobile/performance/rendering' },
                        { text: '包体积优化', link: '/mobile/performance/bundle-size' },
                        { text: '图片优化', link: '/mobile/performance/image-optimization' },
                        { text: '分包加载优化', link: '/mobile/performance/subpackage' },
                        { text: '内存优化', link: '/mobile/performance/memory' },
                        { text: '网络优化', link: '/mobile/performance/network' }
                    ]
                },
                {
                    text: '🐛 调试与测试',
                    collapsed: true,
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
                    collapsed: true,
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
                        { text: '开发规范概览', link: '/practices/standards/overview' },
                        { text: '代码规范 ✅', link: '/practices/standards/coding' },
                        { text: 'API设计规范 ✅', link: '/practices/standards/api-design' },
                        { text: '命名规范', link: '/practices/standards/naming' },
                        { text: '注释规范', link: '/practices/standards/comment' },
                        { text: 'Git使用规范', link: '/practices/standards/git' },
                        { text: '代码审查规范', link: '/practices/standards/code-review' },
                        { text: '数据库规范', link: '/practices/standards/database' },
                        { text: '前端开发规范', link: '/practices/standards/frontend' },
                        { text: '移动端开发规范', link: '/practices/standards/mobile' }
                    ]
                },
                {
                    text: '🏗️ 架构设计',
                    items: [
                        { text: '架构设计概览', link: '/practices/architecture/overview' },
                        { text: '系统架构设计', link: '/practices/architecture/system' },
                        { text: '数据库设计', link: '/practices/architecture/database' },
                        { text: '缓存策略', link: '/practices/architecture/cache' },
                        { text: '分布式设计', link: '/practices/architecture/distributed' },
                        { text: '多租户架构', link: '/practices/architecture/multi-tenant' },
                        { text: '微服务架构', link: '/practices/architecture/microservices' },
                        { text: 'API网关设计', link: '/practices/architecture/api-gateway' },
                        { text: '领域驱动设计', link: '/practices/architecture/ddd' }
                    ]
                },
                {
                    text: '💻 后端开发',
                    items: [
                        { text: '后端开发概览', link: '/practices/backend/overview' },
                        { text: 'Service层最佳实践', link: '/practices/backend/service-layer' },
                        { text: 'Controller层最佳实践', link: '/practices/backend/controller-layer' },
                        { text: 'DAO层设计模式', link: '/practices/backend/dao-layer' },
                        { text: '数据访问层优化', link: '/practices/backend/data-access' },
                        { text: '事务管理策略', link: '/practices/backend/transaction' },
                        { text: '异常处理机制', link: '/practices/backend/exception-handling' },
                        { text: '数据校验最佳实践', link: '/practices/backend/validation' },
                        { text: '日志规范', link: '/practices/backend/logging' },
                        { text: 'API版本管理', link: '/practices/backend/api-versioning' }
                    ]
                },
                {
                    text: '🔧 功能开发',
                    items: [
                        { text: '功能开发概览', link: '/practices/features/overview' },
                        { text: '权限控制实现', link: '/practices/features/permission-control' },
                        { text: '数据权限设计', link: '/practices/features/data-permission' },
                        { text: '定时任务开发', link: '/practices/features/scheduled-jobs' },
                        { text: '消息推送实现', link: '/practices/features/message-push' },
                        { text: '文件处理方案', link: '/practices/features/file-processing' },
                        { text: 'Excel操作优化', link: '/practices/features/excel-operations' },
                        { text: '第三方集成策略', link: '/practices/features/third-party-integration' },
                        { text: '国际化实现方案', link: '/practices/features/i18n' },
                        { text: '支付功能开发', link: '/practices/features/payment' },
                        { text: '短信验证码', link: '/practices/features/sms-verification' },
                        { text: '图片处理', link: '/practices/features/image-processing' }
                    ]
                },
                                {
                    text: '⚡ 性能优化',
                    items: [
                        { text: '性能优化概览', link: '/practices/performance/overview' },
                        { text: '后端性能优化', link: '/practices/performance/backend' },
                        { text: '前端性能优化', link: '/practices/performance/frontend' },
                        { text: '移动端性能优化', link: '/practices/performance/mobile' },
                        { text: '数据库优化', link: '/practices/performance/database' },
                        { text: '缓存优化策略', link: '/practices/performance/cache' },
                        { text: '网络优化', link: '/practices/performance/network' },
                        { text: 'JVM调优指南', link: '/practices/performance/jvm-tuning' },
                        { text: '性能监控与分析', link: '/practices/performance/monitoring' }
                    ]
                },
                {
                    text: '🔒 安全指南',
                    items: [
                        { text: '安全总览', link: '/practices/security/overview' },
                        { text: '身份认证安全', link: '/practices/security/auth' },
                        { text: '数据安全', link: '/practices/security/data' },
                        { text: '接口安全', link: '/practices/security/api' },
                        { text: '前端安全', link: '/practices/security/frontend' },
                        { text: '移动端安全', link: '/practices/security/mobile' },
                        { text: '传输安全', link: '/practices/security/transport' },
                        { text: '漏洞防护', link: '/practices/security/vulnerability' },
                        { text: '密码安全策略', link: '/practices/security/password' },
                        { text: '安全审计与日志', link: '/practices/security/audit-logging' }
                    ]
                },
                {
                    text: '🛠️ 工程化',
                    items: [
                        { text: '工程化概览', link: '/practices/engineering/overview' },
                        { text: '代码生成器使用', link: '/practices/engineering/code-generator' },
                        { text: '构建优化', link: '/practices/engineering/build-optimization' },
                        { text: 'CI/CD最佳实践', link: '/practices/engineering/cicd' },
                        { text: '代码质量管控', link: '/practices/engineering/code-quality' },
                                                { text: '版本管理策略', link: '/practices/engineering/version-control' },
                        { text: '依赖管理', link: '/practices/engineering/dependency-management' }
                    ]
                },
                {
                    text: '🚀 部署运维',
                    items: [
                        { text: '部署运维概览', link: '/practices/devops/overview' },
                        { text: 'Docker部署指南', link: '/practices/devops/docker-deploy' },
                        { text: 'Kubernetes部署', link: '/practices/devops/k8s-deploy' },
                        { text: '容器化最佳实践', link: '/practices/devops/containerization' },
                        { text: '监控告警', link: '/practices/devops/monitoring' },
                        { text: '日志管理', link: '/practices/devops/logging' },
                        { text: '备份策略', link: '/practices/devops/backup' },
                        { text: '故障排查指南', link: '/practices/devops/troubleshooting' },
                                                { text: '高可用架构', link: '/practices/devops/high-availability' },
                        { text: '自动化运维', link: '/practices/devops/automation' }
                    ]
                },
                {
                    text: '📊 数据管理',
                    items: [
                        { text: '数据管理概览', link: '/practices/data/overview' },
                        { text: '数据库设计规范', link: '/practices/data/database-design' },
                        { text: '数据迁移策略', link: '/practices/data/data-migration' },
                        { text: '数据一致性保证', link: '/practices/data/data-consistency' },
                                                { text: '数据备份恢复', link: '/practices/data/backup-recovery' },
                        { text: '数据脱敏处理', link: '/practices/data/data-masking' },
                        { text: '数据归档策略', link: '/practices/data/data-archiving' }
                    ]
                },
                                {
                    text: '🎓 学习资源',
                    items: [
                        { text: '学习路径推荐', link: '/practices/learning/roadmap' },
                        { text: '技术栈选型', link: '/practices/learning/tech-stack' },
                        { text: '常见问题FAQ', link: '/practices/learning/faq' },
                        { text: '进阶学习指南', link: '/practices/learning/advanced' },
                        { text: '项目实战案例', link: '/practices/learning/case-studies' }
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
        build: {
            chunkSizeWarningLimit: 2000,
            // 代码分割优化，减少单个chunk大小
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        // 将 node_modules 中的依赖分割
                        if (id.includes('node_modules')) {
                            if (id.includes('vue')) {
                                return 'vue-vendor'
                            }
                            if (id.includes('@vueuse')) {
                                return 'vueuse-vendor'
                            }
                            return 'vendor'
                        }
                    }
                }
            }
        },
        optimizeDeps: {
            exclude: ['vitepress']
        },
        ssr: {
            // 修复 mark.js 在 SSR 环境下的模块解析问题
            noExternal: ['mark.js']
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
        // 禁用最后更新时间以避免构建时大量 git log 调用
        pageData.frontmatter.lastUpdated = false

        return pageData
    }
})
