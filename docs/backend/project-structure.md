# 项目结构

```text
📁 ruoyi-plus-uniapp (项目根目录)
├── 📁 ruoyi-admin                  // 系统入口模块，打包部署的主模块
├── 📁 ruoyi-common                 // 通用工具模块，提供各种基础功能支持
│   ├── 📁 ruoyi-common-bom         // 通用依赖项管理 - 定义所有模块的统一版本
│   ├── 📁 ruoyi-common-core        // 核心模块 - 提供系统基础功能与通用工具类
│   ├── 📁 ruoyi-common-doc         // 系统接口文档模块 - 提供API文档自动生成
│   ├── 📁 ruoyi-common-encrypt     // 数据加解密模块 - 提供数据加密手段与工具
│   ├── 📁 ruoyi-common-excel       // Excel处理模块 - 基于EasyExcel提供导入导出功能
│   ├── 📁 ruoyi-common-idempotent  // 幂等功能模块 - 提供接口幂等性保障
│   ├── 📁 ruoyi-common-job         // 定时任务模块 - 基于SnailJob提供分布式任务调度
│   ├── 📁 ruoyi-common-json        // 序列化模块 - 提供JSON序列化与反序列化
│   ├── 📁 ruoyi-common-log         // 日志记录模块 - 提供系统操作日志记录功能
│   ├── 📁 ruoyi-common-mail        // 邮件模块 - 提供邮件发送与模板处理功能
│   ├── 📁 ruoyi-common-miniapp     // 微信小程序模块
│   ├── 📁 ruoyi-common-mp          // 微信公众号服务模块
│   ├── 📁 ruoyi-common-mybatis     // 数据库服务模块 - 提供ORM映射与数据访问功能
│   ├── 📁 ruoyi-common-oss         // 对象存储服务模块 - 提供文件上传、下载等功能
│   ├── 📁 ruoyi-common-pay         // 支付模块
│   ├── 📁 ruoyi-common-ratelimiter // 限流功能模块 - 提供接口访问频率限制
│   ├── 📁 ruoyi-common-redis       // 缓存服务模块 - 提供Redis缓存、分布式锁等功能
│   ├── 📁 ruoyi-common-satoken     // 权限认证模块 - 基于Sa-Token提供认证授权
│   ├── 📁 ruoyi-common-security    // 安全模块 - 提供应用安全防护与加密功能
│   ├── 📁 ruoyi-common-sensitive   // 脱敏模块 - 提供数据脱敏与隐私保护功能
│   ├── 📁 ruoyi-common-serialmap   // 序列化映射模块 - 数据映射功能+字段通用映射+缓存
│   ├── 📁 ruoyi-common-sms         // 短信模块 - 提供短信发送与验证码功能
│   ├── 📁 ruoyi-common-social      // 社会化登录模块 - 提供第三方平台登录功能
│   ├── 📁 ruoyi-common-sse         // SSE通讯模块 - 提供服务器发送事件功能
│   ├── 📁 ruoyi-common-tenant      // 租户宿主模块 - 提供多租户隔离与管理功能
│   ├── 📁 ruoyi-common-web         // Web服务模块 - 提供Web应用功能组件
│   └── 📁 ruoyi-common-websocket   // WebSocket通讯模块 - 提供实时通讯功能
├── 📁 ruoyi-extend                 // 扩展增强模块
│   ├── 📁 ruoyi-monitor-admin      // 监控管理模块 - 基于Spring Boot Admin
│   └── 📁 ruoyi-snailjob-server    // 任务调度服务模块 - SnailJob提供任务调度中心
├── 📁 ruoyi-modules                // 业务功能模块
│   ├── 📁 ruoyi-business           // 业务模块 - 新增的业务逻辑写此模块 里面划分子模块
│   │   └── 📁 src
│   │       └── 📁 main
│   │           ├── 📁 java
│   │           │   └── 📁 plus.ruoyi.business
│   │           │       ├── 📁 api               // API接口层
│   │           │       │   ├── 📁 mobile        // 移动端API
│   │           │       │   ├── 📁 pay           // 支付相关API
│   │           │       │   └── 📁 pc            // PC端API
│   │           │       ├── 📁 base              // 基础业务服务
│   │           │       │   ├── 📁 authStrategy  // 小程序、公众号认证策略
│   │           │       │   ├── 📁 controller    // 基础业务控制器
│   │           │       │   ├── 📁 domain        // 基础业务领域模型
│   │           │       │   ├── 📁 mapper        // 基础业务数据访问
│   │           │       │   └── 📁 service       // 基础业务服务
│   │           │       ├── 📁 job               // 任务调度模块
│   │           │       └── 📁 mall              // 商城领域
│   │           │           ├── 📁 controller    // 商城控制器
│   │           │           ├── 📁 domain        // 商城领域模型
│   │           │           ├── 📁 listener      // 商城事件监听器
│   │           │           ├── 📁 mapper        // 商城数据访问层
│   │           │           └── 📁 service       // 商城服务层
│   │           └── 📁 resources
│   │               └── 📁 mapper                // MyBatis XML映射文件
│   │                   ├── 📁 base              // 基础业务映射
│   │                   └── 📁 mall              // 商城相关映射
│   ├── 📁 ruoyi-generator          // 代码生成模块 - 提供可视化代码生成功能
│   └── 📁 ruoyi-system             // 系统模块 - 提供用户、角色、菜单等系统核心功能
│       └── 📁 src
│           └── 📁 main
│               ├── 📁 java
│               │   └── 📁 plus.ruoyi.system
│               │       ├── 📁 auth              // 认证授权模块 - 登录验证
│               │       ├── 📁 config            // 配置模块 - 系统配置管理、通知公告
│               │       ├── 📁 core              // 核心功能模块 - 核心RBAC业务逻辑
│               │       ├── 📁 dict              // 数据字典模块 - 字典数据管理
│               │       ├── 📁 monitor           // 系统监控模块 - 在线用户、服务监控
│               │       ├── 📁 oss               // 对象存储模块 - 文件上传下载管理
│               │       └── 📁 tenant            // 多租户模块 - 租户管理与数据隔离
│               └── 📁 resources                 // 资源文件目录
│                   └── 📁 mapper                // MyBatis XML映射文件
└── 📄 pom.xml                      // Maven主配置文件
```

## 项目架构特点

### 🏗️ **模块化设计**

- **分层清晰**: admin(入口层) → modules(业务层) → common(通用层)
- **职责明确**: 每个模块都有明确的功能边界和职责划分
- **松耦合**: 模块间通过接口依赖，便于独立开发和维护

### ⚡ **通用模块 (ruoyi-common)**

- **基础设施**: core、web、mybatisplus 等核心功能
- **中间件集成**: redis、oss、pay、sms 等服务组件
- **安全保障**: security、encrypt、sensitive 等安全模块
- **通讯机制**: sse、websocket 等实时通讯
- **业务支撑**: excel、mail、social 等业务工具

### 🔧 **业务模块 (ruoyi-modules)**

- **系统管理**: 用户、角色、权限、租户等核心RBAC功能
- **业务扩展**: business 模块支持多领域业务开发
- **代码生成**: 可视化代码生成，提升开发效率
- **工作流引擎**: 可视化流程设计，支持复杂业务流程自动化 （在workflow分支，不在主分支维护）

### 📊 **扩展模块 (ruoyi-extend)**

- **系统监控**: MonitorAdmin - 基于 Spring Boot Admin 的服务监控
- **任务调度**: SnailJobServer - 分布式任务调度服务
