# Ruoyi Plus Uniapp新特性

### 核心理念

- **代码即文档** - 通过规范化命名和完善注释实现代码自解释
- **全栈统一** - 前后端命名规范、类型定义、接口管理保持一致
- **开发友好** - 注重开发体验和可维护性，减少冗余代码

---

## 一、后端重构优化

### 1.1 基础架构重构

#### 查询增强组件

- 将 QueryPlus 重命名为 PlusQuery，LambdaQuery 重命名为 PlusLambdaQuery
- 新增 BaseService 接口及实现类，封装常见业务操作，支持泛型适配与反射优化
- 增强 MyBatis-Plus 查询功能，支持聚合函数及条件自动处理

#### 数据访问层统一

- 重构 BaseMapperPlus、BaseServiceImpl 和 IBaseService，统一方法命名
- 新增批量操作方法，更新注释支持新功能
- 新增数据权限基础 Mapper 接口 BaseDataPermissionMapper

#### 响应结果封装

- 重构 TableDataInfo 为 PageResult，统一返回数据为 `R<PageResult<T>>`
- 完善 R 类注释，统一 API 响应结果封装，优化成功和失败消息返回方法
- 增加安全获取 data 方法和标准 API 响应结构

### 1.2 配置与环境管理

#### 应用配置重构

- 重命名 RuoYiConfig 为 AppConfig，更新相关配置项
- 支持新的应用结构和本地文件上传路径
- 增加前后端唯一标识符应用 ID，做好不同项目间的数据隔离

#### 环境配置优化

- 迁移配置环境到根目录的 dev 目录，抽离公共配置
- 更新路径解析，使用 process.cwd() 替代 __dirname 确保兼容性
- 完善配置文件注释，增加系统应用、环境、日志、安全等模块详细说明

### 1.3 数据库与字典系统

#### 数据库结构调整

- 修改字典数据主键 dict_code 改为 dict_data_id
- 逻辑删除统一修改为 isDeleted
- 性别字典修改：女0 男1 未知2，sys_user_sex 改为 sys_user_gender
- 修改 gen_table 为 sys_gen_table，gen_table_column 为 sys_gen_table_column

#### 字典系统重构

- 重构字典类型和字典值，字典数据默认值统一为 1，否为 0
- 重构字典枚举命名以 Dict 开头，提高代码可发现性
- 系统中统一采用 1=是/正面状态，0=否/负面状态 的约定
- 优化字典实现类，封装 convertWithMapping 方法

### 1.4 租户系统完善

#### 租户功能增强

- 统一获取租户 ID 方案，提供兜底租户 ID，确保租户 ID 永远不为空
- 调整租户拦截，忽略租户表获取时的循环依赖
- OSS 存储加上租户 ID 前缀作为目录区分
- 新增租户需要同步超管角色，增加角色同步到租户功能

### 1.5 权限与安全系统

#### 权限标识符规范化

- 重构菜单权限标识符为：模块:表:标识符 格式
- 如 system:user:view/query/add/update/delete/import/export
- 代码生成默认生成权限控制部分

#### 认证系统优化

- 重构调整登录实现，抽离 AbstractAuthStrategy 抽象层
- 登录实现迁移到系统模块 auth 包下，保持 admin 模块简洁
- 重命名授权类型和设备类型为认证方式和应用类型

### 1.6 文件管理系统

#### OSS 系统增强

- 重构 OSS 模块支持 S3 和本地文件上传
- 增加转换远程图片到 OSS 的接口实现
- 头像存储统一修改为字符串存储链接
- 增加图片和文件直传功能，支持多种云服务

### 1.7 系统功能模块

#### 监控与日志

- monitor 监控增加通知功能
- 完善操作日志、登录日志等页面优化
- 抽离登录日志发布者到 log 模块为 LoginLogPublisher

#### 代码生成增强

- 完善代码生成界面使用体验，固定 tab 页签和弹窗高度
- 实现主子表代码生成功能
- 实现代码生成表字段的默认值功能
- 处理 Excel 导入更新实现和参数传递

### 1.8 国际化系统

#### 消息国际化

- 增删改查等消息实现后端返回国际化
- 通过接口常量实现管理和分类，去除 code 硬编码
- 菜单国际化后端返回时增加国际化键名计算

### 1.9 高级功能模块

#### 支付系统

- 增加 IJPay 支付模块和相关商品订单逻辑
- 支付模块支持租户数据隔离和智能刷新数据

#### 业务扩展

- 完成公告功能的可用性，实现精准推送和查阅
- 实现已读未读统计等功能

#### 实时通信

- SSE 连接增加重连退避策略，支持手动重连和状态监控
- 实现动态退避策略的 WebSocket 连接管理

### 1.10 部署与运维

#### Docker 部署

- 优化 docker-compose 相关编排名称
- 在主应用添加远程调试参数，支持本地 idea 远程调试

#### 监控与维护

- 完善错误码处理，整合为枚举 errorMessage
- 增加根据错误码获取错误提示信息方法

---

## 二、前端重构优化

### 2.1 架构重构

#### 目录结构调整

- 重构为 composables 目录(组合式)，lang 改为 locales
- store 目录统一命名为 stores，提升语义化
- 调整前端项目结构与后端结构基本统一

#### 组件命名规范化

- 全局统一组件命名，不使用 index，提升开发体验
- 自定义组件统一使用驼峰命名，ElementPlus 组件保持连字符
- 所有页面组件改为首字母小写的驼峰，后端进行适配

### 2.2 工具类与钩子函数重构

#### Utils 重构为 Hooks

- 移除 utils/auth.ts，封装 useToken 到 hooks
- 移除 utils/permission.ts，改为 hooks/useAuth 钩子
- 移除 utils/theme.ts，改为 hooks/useTheme 钩子
- 移除 utils/i18n，改为 hooks/useI18n，全局使用自定义 i18n

#### 工具类功能增强

- 完善 utils/crypto.ts，进行方法扩充，jsencrypt 改名为 rsa
- 分离 DOM 操作相关方法为 utils/class 并丰富扩充
- 抽离树形相关方法为 utils/tree，扩充方法完善备注

### 2.3 样式系统重构

#### 样式系统优化

- 为全部样式文件添加完善备注，后续整合 UnoCSS
- 完善 UnoCSS 配置进行增强：颜色配置、间距变量、字体配置等
- 重构分类简化所有样式文件，统一使用 UnoCSS 写法

#### 布局组件重构

- 重构 Layout 页面相关组件，统一取消 index 命名
- 调整 ParentView 组件到 layout，移动 TopNav 组件到 navbar 目录
- 优化导航栏、页签效果，调整鼠标滚轮滚动效果

### 2.4 表单与表格增强

#### 表单组件系统

- 增加各类表单组件：AFormCheckbox、AFormDate、AFormEditor 等
- AFormEditor 富文本组件接入基于 tiptap 的 umo editor
- 完善图片文件视频上传功能，完善图片粘贴上传功能

#### 表格功能增强

- 全部 vxetable 组件重构为 el-table 组件，实现跨页选择功能
- 封装 useSelection 钩子处理表格全选和取消全选
- 增加 useTableHeight 优化表格显示效果，让分页组件保持固定位置

### 2.5 权限指令增强

#### 权限自定义指令

- 完善重构权限自定义指令，支持延迟加载组件
- 扩充指令：permi、role、admin、superadmin、permiAll、roleAll 等
- 移除全局 proxy 代理使用，进行对应代码适配转换

### 2.6 媒体库功能

#### AMediaLibrary 组件

- 添加媒体库功能组件 AMediaLibrary 增强图片上传
- 增加替换功能，优化图片管理体验

### 2.7 国际化系统

#### 前端国际化

- 前端实现菜单国际化，增加统一键名
- 引入 ElementPlus 国际化资源，优化字体大小选择组件
- 前端不需要处理消息翻译，直接回显后端国际化消息

### 2.8 性能优化

#### 构建优化

- 优化 Vite 配置，启用开发环境 sourcemap
- 增强 terser 压缩配置，增加多轮压缩、顶层变量压缩
- 生产环境不打包 demo 模块

#### 代码优化

- 全框架取消使用 reactive 函数，统一使用 ref 函数
- 移除原生滚动，改用 el-scrollbar 滚动，优化滚动体验
- 优化重构 tree 页面模板，使用 vxetable 渲染

---

## 三、移动端重构优化

### 3.1 UniApp 框架重构

#### 框架改造

- 基于 unibest 框架进行改造，移除不必要模块
- 封装移动端 useHttp，实现 API 加密解密
- 增加应用 ID 配置管理，模仿前端实现

### 3.2 小程序功能

#### 登录认证

- 实现微信小程序登录和公众号登录，模块化管理
- 实现 unionid/手机号关联绑定用户账号唯一性
- 用户手机实现无账户则自动注册

### 3.3 组件库重构

#### WotUI 组件重构

- 重构 wd-navbar、wd-tabbar、wd-text 等基础组件
- 重构 wd-icon 组件，增强功能支持 iconify/json 图标
- 统一单位为 rpx，移动端获得更好体验

---

每个端的重构都遵循模块化、标准化的原则，确保代码质量和可维护性。
