# Ruoyi-Plus-Uniapp新特性

### 核心理念

- **代码即文档** - 通过规范化命名和完善注释实现代码自解释
- **全栈统一** - 前后端命名规范、类型定义、接口管理保持一致
- **开发友好** - 注重开发体验和可维护性，减少冗余代码

## 一、后端重构优化

### 1.1 基础架构重构

#### 查询增强组件

- 新增 IBaseService 接口及实现类BaseServiceImpl，封装常见业务操作，支持泛型适配与反射优化，极致减少样板代码
- 增强 MyBatis-Plus 查询功能，Query增强为PlusQuery，LambdaQuery增强为PlusLambdaQuery 支持聚合函数及条件自动处理

#### 响应结果封装

- 重构 TableDataInfo 为 PageResult，统一返回数据为 `R<PageResult<T>>` 里面包含分页信息（是否最后一页 页码 每页条数等）和数据列表
- 完善 R 类注释，统一 API 响应结果封装，优化成功和失败消息返回方法
- 增加安全获取 data 方法和标准 API 响应结构

### 1.2 配置与环境管理

#### 应用配置重构

- 增加前后端唯一标识符应用ID，做好不同项目间的数据隔离
- 重命名 RuoYiConfig 为 AppConfig，更新相关配置项
- 增加core核心包相关工具类功能

### 1.3 数据库与字典系统

#### 数据库结构调整

- 重构数据库表命名规范，统一使用 sys_ 前缀 修改 gen_table 为 sys_gen_table，gen_table_column 为 sys_gen_table_column
- 逻辑删除统一修改为 isDeleted
- 性别字典修改：女0 男1 未知2，sys_user_sex 改为 sys_user_gender
- 修改字典数据主键 dict_code 改为 dict_data_id

#### 字典系统重构

- 系统中统一采用 1=是/正面状态，0=否/负面状态 的约定
- 重构字典类型和字典值，字典数据默认值统一为 1，否为 0
- 重构字典枚举命名以 Dict 开头，字典枚举统一放在core/dict包下 提高代码可发现性
- 优化字典实现类

### 1.4 租户系统完善

#### 租户功能增强

- 统一获取租户 ID 方案，提供兜底租户 ID，确保租户 ID 不为空 可以随时开启或者关闭租户功能不产生脏数据
- OSS 存储加上租户 ID 前缀作为目录区分
- 新增租户需要同步角色，增加角色同步到租户功能 因为开发过程角色也属于业务的一部分 实现同步功能可以最小化改动来供新租户使用

### 1.5 权限与安全系统

#### 权限标识符规范化

- 菜单权限标识符为：模块:表:标识符 格式
- 如 system:user:view/query/add/update/delete/import/export
- 代码生成默认生成权限控制部分 打开注释即可启用

#### 认证系统优化

- 登录实现迁移到系统模块 auth 包下，保持 admin 模块简洁
- 重命名授权类型和设备类型为认证方式和应用类型
- 移除客户端管理，减少冗余代码，精简实现 主要分为两个客户端即可 由枚举UserType进行控制管理
- 增加miniapp小程序模块，增加mp模块，实现对小程序（包括微信小程序的完整实现，以及QQ 支付宝 京东
  抖音等各类小程序的扩展实现和预留实现）以及微信公众号的完整实现 开箱即用
- 实现小程序 公众号多个配置同时使用以及租户间的数据隔离

### 1.6 文件管理系统

#### OSS 系统增强

- 重构 OSS 模块 抽离出接口层OssStrategy，可通过不同实现类实现不同的存储方式 如S3、本地文件等
- 重构 OSS 模块同时支持 S3 和本地文件上传
- 增加转换远程图片到 OSS 的接口实现 增加OSS文件的目录管理功能，支持多租户隔离 实现素材管理
- 头像存储统一修改为字符串存储链接
- 增加图片和文件前端/移动端直传功能，一键即可开启直传，支持多种云服务

### 1.7 系统功能模块

#### 序列化模块增强和重构

- 重构序列化模块名称为serialmap，因为只涉及序列化，不涉及反序列化，因为不叫translation，命名上不够恰当
- 调整序列化注解为SerialMap，调整注解属性更符合规范 converter转换器 source来源 param额外参数 entityClass数据源实体类
  targetField 目标映射字段
- 增加序列化注解实现FieldMapImpl，实现通用字典映射转换器，同时实现缓存，减少后续序列化实现的重复样板代码

#### 监控与日志

- monitor 监控增加通知功能
- 完善操作日志、登录日志等页面优化
- 重构日志注解的使用和类的命名 Log注解属性使用operType操作类型，指定字典DictOperType为操作类型枚举
- 抽离登录日志发布者到 log 模块为 LoginLogPublisher 实现日志发布异步保存操作

#### 代码生成增强

- 完善代码生成界面使用体验，固定 tab 页签和弹窗高度
- 实现主子表代码生成功能
- 增加并实现代码生成表字段的默认值功能
- 处理 Excel 导入更新实现和参数传递

### 1.8 国际化系统

#### 消息国际化

- 增删改查等消息实现后端返回国际化 默认情况还是由前端处理国际化
- 通过接口常量实现管理和分类，去除 code 硬编码
- 菜单国际化后端返回时增加国际化键名计算
- 增加I18nMessageInterceptor国际化消息拦截器，简化国际化消息处理，无需花括号包围

### 1.9 高级功能模块

#### 支付系统

- 增加 IJPay 支付模块和相关商品订单逻辑 支付回调等统一处理再根据不同支付方式进行分发
- 支付模块支持租户数据隔离和智能刷新数据 自动重试请求支付状态

#### 业务扩展

- 完成公告功能的可用性，实现精准推送和查阅
- 实现已读未读统计等功能

### 1.10 部署与运维

#### Docker 部署

- 优化 docker-compose 相关编排名称 统一相关命名
- 在主应用添加远程调试参数，支持本地 idea 远程调试
- 完美适配 Docker容器化部署

#### 轻松开发和维护

- 全部代码注释完善，使用 Javadoc 规范
- 统一使用 Lombok 注解简化代码，减少样板代码
- 统一包管理和依赖管理规范 提供统一的包使用规范 提供业务模块供开发者直接用于开发业务逻辑
- 重构代码生成器，支持主子表生成，优化代码生成体验，接口路径、方法名、变量名等语义化且唯一，快速定位

## 二、前端重构优化

### 2.1 架构重构

#### 目录结构调整

- 重构为 composables 目录(组合式)，lang 改为 locales
- store 目录统一命名为 stores，提升语义化 layout命名为layouts directives 命名为 directives
- 路由模块路由进行归类和分拆管理
- 调整前端项目结构与后端结构基本统一

#### 组件命名规范化

- 全局统一组件命名，不使用 index，提升开发体验
- 自定义组件统一使用首字母大写驼峰命名，ElementPlus 组件保持连字符
- 所有页面组件改为首字母小写的驼峰，后端菜单进行适配

#### 类型重构

- 全局统一类型命名规范，与后端保持一致 减少使用认知负担 如Bo Vo等
- 请求响应类型统一使用 `R<T>`，减少冗余代码 ，分页类型统一使用 `R<PageResult<T>>`，减少冗余代码

### 2.2 工具类与组合函数函数重构

#### Utils部分逻辑 重构为 Composables组合函数 发挥vue3的组合式API优势

- 移除 utils/auth.ts，封装 useToken 到 composables
- 移除 utils/permission.ts，改为 composables/useAuth 组合函数
- 移除 utils/theme.ts，改为 composables/useTheme 组合函数
- 移除 utils/i18n，改为 composables/useI18n，全局使用自定义 i18n
- 移除animate.ts，改为 composables/useAnimation 组合函数
- 移除dict.ts，改为 composables/useDict 组合函数
- 移除request.ts，改为 composables/useHttp 组合函数 使用http.get, http.post 等方法进行请求
- 移除sse.ts，改为 composables/useSSE 组合函数
- 移除websocket.ts，改为 composables/useWS 组合函数
- 移除i18n.ts，改为 composables/useI18n 组合函数
- 移除auth.ts，改为 composables/useToken 组合函数
- 增加useTableHeight 组合函数，优化表格高度计算
- 增加useSelection 组合函数，处理表格全选和取消全选
- 增加useDownload 组合函数，处理文件下载逻辑

#### 工具类功能增强

- 增加boolean.ts，封装布尔值相关方法
- 增加date.ts，封装日期相关方法
- 增加cache.ts，封装缓存相关方法
- 增加format.ts，封装格式化相关方法
- 增加function.ts，封装函数相关方法 如防抖、节流 拷贝等
- 增加modal.ts，封装模态框相关方法 统一调用为show开头的前缀如showMsgSuccess、showMsgError等 showConfirm、showPrompt等
- 增加object.ts，封装对象相关方法
- 增加string.ts，封装字符串相关方法
- 增加tab.ts，封装标签页导航操作相关工具函数
- 抽离树形相关方法为tree.ts，封装树形结构相关方法
- 增加class.ts，封装 DOM 操作相关方法
- 增加to.ts，封装安全异步执行工具函数集 减少try catch 的使用
- 增加validators.ts，封装表单验证相关方法
- 完善 utils/crypto.ts，进行方法扩充，jsencrypt 改名为 rsa

### 2.3 样式系统重构

#### 样式系统优化

- 为全部样式文件添加完善备注
- 重构分类简化所有样式文件
- 完善 UnoCSS 配置进行增强：颜色配置、间距变量、字体配置等

#### 布局组件重构

- 重构 Layout 页面相关组件，统一取消 index 命名
- 调整 ParentView 组件到 layout，移动 TopNav 组件到 navbar 目录
- 重新调整归类Layout层组件目录结构，调整样式控制实现
- 优化导航栏、页签效果，调整鼠标滚轮滚动效果

### 2.4 表单与表格增强

#### 表单组件系统

- 增加各类表单组件：
  AFormCascader 级联选择
  AFormCheckbox 复选框
  AFormDate 日期选择
  AFormEditor 富文本编辑器 富文本组件接入基于 tiptap 的 umo editor
  AFormFileUpload 文件上传
  AFormlmgUpload 图片上传
  AFormlnput 输入框
  AFormRadio 单选框
  AFormSelect 下拉选择
  AFormSwitch 开关选择
  AFormTreeSelect 树形选择

#### 表格功能增强

- 移除vxetable，vxetable 组件重构为 el-table 组件，实现跨页选择功能
- 封装 useSelection 组合函数处理表格全选和取消全选
- 增加 useTableHeight 优化表格显示效果，让分页组件保持固定位置

### 2.5 权限指令增强

#### 权限自定义指令

- 完善重构权限自定义指令，支持延迟加载组件
- 扩充指令：permi、role、admin、superadmin、permiAll、roleAll 等
- 移除全局 proxy 代理使用，进行对应代码适配转换

### 2.6 媒体库功能

#### AOssMediaManager 组件

- 添加媒体库功能组件 AOssMediaManager 增强图片上传
- 增加替换功能，优化图片管理体验
- 增加目录管理功能，支持多租户隔离，可以对图片进行分类管理，可以对图片进行批量操作 批量移动等（移动只是修改文件对应的所在目录id）
- 配合后端实现前端文件直传功能 一个属性即可配置开启

### 2.7 iconify引入图标功能重构菜单图标

#### 图标系统重构

- 引入 iconify 图标库，支持多种图标格式
- 重构菜单图标使用 iconify 图标，实现图标库管理功能，方便进行维护和扩展
- 优化图标选择组件，支持多种图标格式和自定义图标
- 图标组件重构为Icon,支持图标名称类型提示，支持海量图标库

### 2.8 国际化系统

#### 前端国际化

- 增强useI18n 组合函数，增强t函数，实现智能提示
- 前端实现菜单国际化，增加统一键名
- 引入 ElementPlus 国际化资源，优化字体大小选择组件

### 2.9 性能优化

#### 实时通信

- SSE 连接增加重连退避策略，支持手动重连和状态监控
- 实现动态退避策略的 WebSocket 连接管理

#### 构建优化

- 优化 Vite 配置

#### 代码优化

- 全框架取消使用 reactive 函数，统一使用 ref 函数
- 移除原生滚动，改用 el-scrollbar 滚动，优化滚动体验
- 优化重构 tree 页面模板
- 重构代码生成页面结构和实现，代码职责更加清晰

## 三、移动端重构优化

### 3.1 UniApp 框架重构

#### 框架改造

- 基于 unibest 框架进行重量级重构改造，移除不必要模块
- 增加应用 ID 配置管理，模仿前端实现
- 实现基础的 tabbar 页面，不使用原生 tabbar，使用自定义组件实现，可以更灵活地控制样式和功能
- 增加分包管理，可以实现管理员端和代码示例等的分包加载，优化小程序加载速度

#### 目录结构重构

- 重新调整插件目录结构，分拆插件分别维护
- 复用前端 composables 目录下的部分组合函数函数，优化移动端开发体验
- 封装 pinia 的相关模块：dict、tabbar、user 等

### 3.2 网络请求与认证

#### HTTP 请求封装

- 封装移动端 useHttp，实现移动端 API 加密解密
- 统一请求拦截和响应处理机制

#### 小程序登录认证

- 实现微信小程序登录和公众号登录，模块化管理
- 实现 unionid/手机号关联绑定用户账号唯一性
- 用户手机实现无账户则自动注册
- 实现登录页面的自动登录开关，以及多种登录方式的支持
- 实现手机号注册和登录功能，支持验证码登录和密码登录

### 3.3 组合式函数与工具类

#### Composables 组合函数函数

- 复用前端 useDict、useAuth 等组合函数函数
- 增加移动端 usePayment 组合函数，封装支付相关逻辑
- 增加 useScroll 组合函数，封装滚动相关逻辑
- 增加 useTheme 组合函数，封装主题相关逻辑

#### 工具类函数增强

- 复用前端的 utils 工具类库部分功能：boolean.ts、date.ts、format.ts、function.ts、object.ts、string.ts 等
- 新增 tenant.ts，封装租户相关逻辑
- 新增 validators.ts，封装移动端表单验证相关方法

### 3.4 组件库重构

#### WotUI 组件重构

- 重构 wot-ui 组件库所有组件，使用最新的 vue3 和 typescript 语法进行重构
- 提高代码可读性、自行维护性和可扩展性
- 重构单位统一为 rpx，移动端获得更好体验
- 增加 wd-paging 组件，实现下滑分页加载功能

#### 图标组件系统

- 增加 wd-iconify 组件，支持 iconify 图标库
- 增加 wd-icon 组件，支持 iconify 图标库和 json 图标
- 重构了图标库近 400 个图标，包含线条图标和实心图标两大类
- 可以方便在示例代码中搜索使用

### 3.5 小程序功能增强

#### 多平台支持

- 支持微信小程序完整功能实现
- 预留 QQ、支付宝、京东、抖音等各类小程序的扩展实现
- 统一小程序 API 调用接口

#### 示例代码系统

- 增加完善和齐全 wd 组件示例代码，可以直接看到效果
- 效果判断统一有代码查看和复制按钮，方便开发者查看和使用
- 提供丰富的组件使用示例和最佳实践

---

每个端的重构都遵循模块化、标准化的原则，确保代码质量和可维护性。
