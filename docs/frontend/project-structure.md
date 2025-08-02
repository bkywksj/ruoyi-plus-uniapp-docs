# 项目结构

```text
📁 plus-ui/
├── 📁 env/                             # 源代码目录
│   ├── 📄 .env                         # 共同环境配置
│   ├── 📄 .env.development             # 开发环境配置
│   ├── 📄 .env.production              # 生产环境配置
├── 📁 public/                          # 静态资源目录
├── 📁 src/                             # 源代码目录
│   ├── 📁 api/                         # API 接口管理
│   │   ├── 📁 business                 # 业务相关接口
│   │   ├── 📁 system                   # 系统相关接口
│   │   └── 📁 tool                     # 代码生成接口
│   │
│   ├── 📁 assets/                      # 静态资源
│   │   ├── 📁 icons/                   # 图标资源
│   │   ├── 📁 images/                  # 图片资源
│   │   └── 📁 styles/                  # 样式文件
│   │
│   ├── 📁 components/                  # 全局组件
│   │   ├── 📁 ADataCard/               # 数据卡片组件
│   │   ├── 📁 ADetailDialog/           # 通用详情弹窗组件
│   │   ├── 📁 AForm/                   # A表单组件库
│   │   │   ├── 📄 AFormCascader.vue    # 级联选择表单组件
│   │   │   ├── 📄 AFormCheckbox.vue    # 复选框表单组件
│   │   │   ├── 📄 AFormDate.vue        # 日期选择表单组件
│   │   │   ├── 📄 AFormEditor.vue      # 富文本编辑器组件
│   │   │   ├── 📄 AFormFileUpload.vue  # 文件上传表单组件
│   │   │   ├── 📄 AFormImgUpload.vue   # 图片上传表单组件
│   │   │   ├── 📄 AFormInput.vue       # 输入框表单组件
│   │   │   ├── 📄 AFormRadio.vue       # 单选框表单组件
│   │   │   ├── 📄 AFormSelect.vue      # 下拉选择表单组件
│   │   │   ├── 📄 AFormSwitch.vue      # 开关表单组件
│   │   │   └── 📄 AFormTreeSelect.vue  # 树形选择表单组件
│   │   ├── 📁 AImportExcel/            # Excel导入组件
│   │   ├── 📁 AOssMediaManager/        # OSS媒体管理组件
│   │   ├── 📁 APageBackground/         # 背景组件
│   │   ├── 📁 ARecharge/               # 在线充值组件
│   │   ├── 📁 ASearchForm/             # 通用搜索表单组件
│   │   ├── 📁 ASelectionTags/          # 可选中的标签组件
│   │   ├── 📁 DictTag/                 # 字典标签组件
│   │   ├── 📁 EnhancedIFrame/          # 增强的 IFrame 组件
│   │   ├── 📁 Icon/                    # 图标组件
│   │   ├── 📁 ImagePreview/            # 图片预览组件
│   │   ├── 📁 Pagination/              # 分页组件
│   │   ├── 📁 TableToolbar/            # 右侧工具栏组件
│   │   └── 📁 UserSelect/              # 用户树形选择组件
│   │
│   ├── 📁 composables/                 # 组合式函数（Vue 3 组合函数）
│   │   ├── 📄 useAnimation.ts          # 动画效果组合函数
│   │   ├── 📄 useAuth.ts               # 权限相关组合函数
│   │   ├── 📄 useDialog.ts             # 对话框管理组合函数
│   │   ├── 📄 useDict.ts               # 字典数据组合函数
│   │   └── 📄 useDownload.ts           # 文件下载组合函数
│   │   ├── 📄 useHttp.ts               # HTTP 请求组合函数
│   │   ├── 📄 useI18n.ts               # 国际化组合函数
│   │   ├── 📄 useSelection.ts          # 表格选择组合函数
│   │   ├── 📄 useSSE.ts                # SSE 连接组合函数
│   │   ├── 📄 useTableHeight.ts        # 表格高度组合函数
│   │   ├── 📄 useTheme.ts              # 主题管理组合函数
│   │   ├── 📄 useToken.ts              # Token 管理组合函数
│   │   └── 📄 useWS.ts                 # WebSocket 组合函数
│   │
│   ├── 📁 directives/                  # 自定义指令
│   │   └── 📄 directives.ts            # 指令统一注册
│   │   └── 📄 permission.ts            # 灵活的权限控制指令
│   │
│   ├── 📁 layouts/                     # 布局组件
│   │   ├── 📁 components/              # 布局相关组件
│   │   │   ├── 📁 AppMain/             # 主内容区组件
│   │   │   │   ├── 📁 iframe/          # iframe 相关组件
│   │   │   │   │   ├── 📄 IframeToggle.vue     # iframe 切换组件
│   │   │   │   │   └── 📄 InnerLink.vue        # 内部链接组件
│   │   │   │   ├── 📄 AppMain.vue      # 主内容区入口组件
│   │   │   │   └── 📄 ParentView.vue   # 父级视图组件
│   │   │   │
│   │   │   ├── 📁 Navbar/              # 导航栏组件
│   │   │   │   ├── 📁 tools/           # 导航栏工具组件
│   │   │   │   │   ├── 📄 DocLink.vue          # 文档链接组件
│   │   │   │   │   ├── 📄 FullscreenToggle.vue # 全屏切换组件
│   │   │   │   │   ├── 📄 GitLink.vue          # Git 链接组件
│   │   │   │   │   ├── 📄 LangSelect.vue       # 语言选择组件
│   │   │   │   │   ├── 📄 NavbarSearch.vue     # 导航栏搜索组件
│   │   │   │   │   ├── 📄 Notice.vue           # 通知组件
│   │   │   │   │   ├── 📄 SizeSelect.vue       # 尺寸选择组件
│   │   │   │   │   ├── 📄 TenantSelect.vue     # 租户选择组件
│   │   │   │   │   └── 📄 UserDropdown.vue     # 用户下拉菜单组件
│   │   │   │   ├── 📄 Breadcrumb.vue   # 面包屑导航组件
│   │   │   │   ├── 📄 Hamburger.vue    # 汉堡菜单组件
│   │   │   │   ├── 📄 Navbar.vue       # 导航栏主组件
│   │   │   │   └── 📄 TopNav.vue       # 顶部导航组件
│   │   │   │
│   │   │   ├── 📁 Settings/            # 设置组件
│   │   │   │   └── 📄 Settings.vue     # 设置主组件
│   │   │   │
│   │   │   ├── 📁 Sidebar/             # 侧边栏组件
│   │   │   │   ├── 📄 AppLink.vue      # 应用链接组件
│   │   │   │   ├── 📄 Logo.vue         # Logo 组件
│   │   │   │   ├── 📄 Sidebar.vue      # 侧边栏主组件
│   │   │   │   └── 📄 SidebarItem.vue  # 侧边栏菜单项组件
│   │   │   │
│   │   │   └── 📁 TagsView/            # 标签页组件
│   │   │       ├── 📄 ScrollPane.vue   # 滚动面板组件
│   │   │       └── 📄 TagsView.vue     # 标签页主组件
│   │   │
│   │   ├── 📄 HomeLayout.vue           # 首页布局组件 其他布局组件
│   │   └── 📄 Layout.vue               # 主布局入口
│   │
│   ├── 📁 locales/                     # 国际化资源
│   │   ├── 📄 en_US.ts                 # 英文语言包
│   │   ├── 📄 zh_CN.ts                 # 中文语言包
│   │   └── 📄 i18n.ts                  # 国际化配置
│   │
│   ├── 📁 plugins/                     # 插件配置
│   │   └── 📄 elementIcons.ts          # Element Plus 图标全局注册插件
│   │
│   ├── 📁 router/                      # 路由配置
│   │   ├── 📁 modules/                 # 路由模块分离
│   │   │   ├── 📄 constant.ts          # 常量路由配置
│   │   │   ├── 📄 system.ts            # 系统模块路由
│   │   │   └── 📄 tool.ts              # 工具模块路由
│   │   ├── 📁 utils/                   # 路由工具函数
│   │   │   └── 📄 createCustomNameComponent.tsx  # 自定义组件名称创建工具
│   │   └── 📄 guard.ts                 # 路由守卫
│   │   └── 📄 router.ts                # 路由主配置入口
│   │
│   ├── 📁 stores/                      # Pinia 状态管理
│   │   ├── 📁 modules/                 # 状态管理模块
│   │   │   ├── 📄 dict.ts              # 字典数据状态管理
│   │   │   ├── 📄 notice.ts            # 通知公告状态管理
│   │   │   ├── 📄 permission.ts        # 权限状态管理
│   │   │   ├── 📄 state.ts             # 应用状态管理
│   │   │   ├── 📄 tagsView.ts          # 标签页状态管理
│   │   │   ├── 📄 theme.ts             # 主题状态管理
│   │   │   └── 📄 user.ts              # 用户状态管理
│   │   └── 📄 store.ts                 # 状态管理统一入口
│   │
│   ├── 📁 types/                       # 类型定义
│   │
│   ├── 📁 utils/                       # 工具函数库
│   │   ├── 📄 boolean.ts               # 布尔值相关方法
│   │   ├── 📄 cache.ts                 # 缓存相关方法
│   │   ├── 📄 class.ts                 # DOM 操作相关方法
│   │   ├── 📄 crypto.ts                # 加密解密方法
│   │   ├── 📄 date.ts                  # 日期相关方法
│   │   ├── 📄 format.ts                # 格式化相关方法
│   │   ├── 📄 function.ts              # 函数相关方法（防抖、节流等）
│   │   ├── 📄 modal.ts                 # 模态框相关方法
│   │   ├── 📄 object.ts                # 对象相关方法
│   │   ├── 📄 string.ts                # 字符串相关方法
│   │   ├── 📄 tab.ts                   # 标签页导航操作方法
│   │   ├── 📄 to.ts                    # 安全异步执行工具函数
│   │   ├── 📄 tree.ts                  # 树形结构相关方法
│   │   ├── 📄 validators.ts            # 表单验证相关方法
│   │   └── 📄 index.ts                 # 工具函数统一导出
│   │
│   ├── 📁 views/                       # 页面视图
│   │   ├── 📁 business/                # 业务模块
│   │   │   ├── 📁 base/                # 基础业务模块
│   │   │   └── 📁 mall/                # 商城业务模块
│   │   │
│   │   ├── 📁 common/                  # 通用页面
│   │   │   ├── 📄 401.vue              # 401 未授权页面
│   │   │   ├── 📄 404.vue              # 404 页面未找到
│   │   │   ├── 📄 home.vue             # 主页
│   │   │   ├── 📄 index.vue            # 首页
│   │   │   └── 📄 redirect.vue         # 页面重定向
│   │   │
│   │   ├── 📁 system/                  # 系统管理模块
│   │   │   ├── 📁 auth/                # 认证管理
│   │   │   ├── 📁 config/              # 参数配置
│   │   │   ├── 📁 core/                # 核心系统功能
│   │   │   ├── 📁 dict/                # 字典管理
│   │   │   ├── 📁 monitor/             # 系统监控
│   │   │   ├── 📁 oss/                 # 对象存储管理
│   │   │   └── 📁 tenant/              # 租户管理
│   │   │
│   │   └── 📁 tool/                    # 系统工具
│   │
│   ├── 📄 App.vue                      # 根组件
│   ├── 📄 main.ts                      # 应用入口
│   └── 📄 systemConfig.ts              # 系统配置
│   └── 📁 vite                         # 插件目录
│
├── 📄 .gitignore                       # Git 忽略文件
├── 📄 index.html                       # HTML 模板
├── 📄 package.json                     # 项目依赖配置
├── 📄 tsconfig.json                    # TypeScript 配置
├── 📄 uno.config.ts                    # UnoCSS 配置
├── 📄 vite.config.ts                   # Vite 构建配置
└── 📄 README.md                        # 项目说明文档
```
