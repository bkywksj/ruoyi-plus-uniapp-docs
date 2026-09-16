# 与上游框架对比

RuoYi-Plus-UniApp 基于 [Dromara RuoYi-Vue-Plus](https://plus-doc.dromara.org/) 深度重构。上游成熟的技术底座——Sa-Token 认证、Redisson 缓存、MyBatis-Plus ORM、SnailJob 任务调度、数据脱敏、接口加密、多数据源、Docker 编排——全部继承并持续跟进。

本页聚焦一件事：**在这个底座之上，我们做了哪些增量**。

对比对象为上游两条线：**5.x**（稳定主线，revision 5.6.1）与 **6.x**（Spring Boot 4 新线，revision 5.5.3）。

## 能力总览

| 维度 | RuoYi-Plus-UniApp | 上游 5.x | 上游 6.x |
|------|------|:---:|:---:|
| **AI 技能体系** | **61 技能 + 19 命令 + 3 钩子** | 无 | 6 个子代理 |
| **移动端** | **4 个工程 + 101 组件 + 18 平台** | 无 | 无 |
| **后端分层** | **四层** Controller→Service→DAO→Mapper | 三层 | 三层 |
| **列级字段权限** | **四档 × 三主体 × 四出口** | 无 | 无 |
| **支付能力** | **微信 / 支付宝 / 银联 / 余额** | 无 | 无 |
| **微信生态** | **小程序 + 公众号** | 无 | 无 |
| **AI 大模型** | **LangChain4j 自建（30 类）** | 无 | 第三方组件 |
| **等保二级** | **密码策略 / 日志归档 / 备份恢复** | 无 | 无 |
| **多租户** | **支持**（3.5.x 与 4.x 双线均有） | 支持 | 不支持 |
| 基础设施模块 | **36 个** | 24 个 | 24 个 |
| 业务模块 | system / workflow / generator / job / **business** / **mall** | + demo | + demo / ai |
| 管理端前端 | 仓内 plus-ui，**13.2 万行** | 仓内，2.8 万行 | 独立仓库 |
| 代码生成器 | 19 模板，**含 DAO 层与主子表** | 16 模板 | 20 模板，含 React |
| 行级数据权限 | 支持 | 支持 | 支持 |
| 数据库支持 | MySQL / Oracle / PostgreSQL / SQL Server | 同左 | 同左 |
| 运行时 | Java 21 + Spring Boot 3.5.16 | Java 17 + 3.5.14 | Java 21 + 4.1.0 |
| 开源协议 | 闭源授权 | MIT | MIT |

---

## 一、AI 技能体系

框架自带一套让 AI 理解本项目架构的工程化配置。四层架构、DAO 层规范、三级权限标识符、字典枚举命名、前后端类型对齐——这些约定不再依赖人去读文档、去记，而是变成 AI 可直接消费的上下文。

### 规模与时间线

| 项 | RuoYi-Plus-UniApp | 上游 5.x | 上游 6.x |
|----|:---:|:---:|:---:|
| **专业技能（SKILL.md）** | **61** | 无 | 无 |
| **智能命令** | **19** | 无 | 无 |
| **自动化钩子** | **3** | 无 | 无 |
| 子代理（subagent） | 2 | 无 | 6 |
| Codex 镜像 | **全量同步** | 无 | 1 个技能包 |
| 技能内容总量 | **45,181 行** | — | 约 5 篇参考文档 |
| **上线时间** | **2025-09** | 至今未提供 | 2026-03 |

我们是业内首个把 AI 工程化配置做进框架的全栈项目，比上游早约 18 个月。上游 6.x 于 2026 年 3 月引入的是 6 个后端子代理定义加一个 Codex 技能包，不含技能库、命令与钩子机制。

### 61 个技能的覆盖面

技能不是通用编程技巧，而是「在这个项目里，这件事应该怎么做」。

| 分组 | 覆盖内容 |
|------|---------|
| **开发主线** | CRUD 全栈开发、API 开发、架构设计、代码范式、后端注解 |
| **权限与安全** | 行级数据权限、多租户、安全防护、日志审计 |
| **前端三端** | PC 端 UI、移动端 UI、移动端设计、APP 适配、UniApp 多平台、HTML 转码 |
| **业务能力** | 支付集成、微信生态、AI 大模型、物联网 MQTT、消息队列、工作流引擎、社交登录、通知系统 |
| **基础设施** | Redis 缓存、定时任务、实时通信、文件 OSS、JSON 序列化、国际化、数据库操作、工具库、图标管理、多媒体处理、第三方 API |
| **测试与排障** | PC / 移动端 E2E 测试、测试开发、Bug 侦探、性能诊断、错误处理 |
| **工程运维** | Git 工作流、部署指南、本地启动、环境配置、项目初始化、项目迁移、框架同步、交付同步、模块裁剪、双端状态管理 |
| **协作与沉淀** | 头脑风暴、技术决策、方案编写、任务追踪、经验沉淀、技能自扩展、项目导航 |
| **跨 AI 协同** | Codex、Gemini、Antigravity 三个 CLI 的协同调度 |

### 三层执行保障

| 层次 | 机制 | 作用 |
|------|------|------|
| **技能库** | 61 个 SKILL.md，按场景自动匹配 | AI 知道该用哪套规范 |
| **命令入口** | 19 个斜杠命令 | 高频动作一条命令直达，如 `/crud` 生成含 DAO 层的完整四层代码 |
| **强制钩子** | 工具调用层拦截 | 不依赖 AI 自觉：输入时强制技能评估、危险命令前置拦截、会话结束自动收尾 |

与上游 6.x 的差别不只在数量：我们是**自动匹配 + 强制执行**，上游子代理需要显式调用且无拦截机制；我们覆盖全栈链路，上游仅限后端。

### 双 AI 平台

技能体系同时提供 Claude Code 与 Codex 两套镜像，内容保持同步，换工具不必重新配置。

技能的完整清单、每个技能的触发词与使用示例、命令逐条说明、钩子实现机制，在「最佳实践 → AI 开发」章节展开。

---

## 二、移动端全栈

上游两条线均不含移动端工程，管理端是唯一前端。移动端是我们独有的完整维度。

### 四个工程

| 工程 | 定位 | 技术形态 |
|------|------|---------|
| `plus-uniapp` | **主力工程**：小程序 / H5 / 公众号 / 非原生 APP | Vue3 + TS，Vite CLI 构建 |
| `plus-app` | **原生 APP 专用**，涉及原生插件开发时使用 | HBuilderX 运行打包，含原生插件目录 |
| `plus-uniapp-demo` | **组件演示 + 业务模板库** | 106 个演示页 + 9 类行业模板 |
| `plus-uniappx` | **UniApp X**，编译为纯原生 APP | UTS + UVue（113 + 115 个源文件） |

### WD UI 组件库

自维护的 wot-design-uni 深度改造分支，源码内置，**101 个组件**，内置 15 种语言。

| 分类 | 数量 |
|------|:---:|
| 表单 | 28 |
| 展示 | 23 |
| 反馈 | 20 |
| 导航 | 15 |
| 布局 | 8 |
| 基础 | 6 |
| 其他 | 1 |

### 18 个发布平台

| 类别 | 平台 |
|------|------|
| Web | H5 |
| 小程序（11） | 微信、支付宝、百度、QQ、字节跳动、京东、快手、飞书、小红书、鸿蒙元服务 |
| APP（4） | app、Android、iOS、**鸿蒙** |
| 快应用（3） | webview、华为、联盟 |

### 技术栈

UniApp 3.0 + Vue 3.4.21 + TypeScript 5.7.2 + Pinia 2.0.36 + Vite 6.4.2 + SCSS/UnoCSS 65.4.2。

---

## 三、后端四层架构

上游是 Controller → Service → Mapper 三层，Service 直接注入并操作 Mapper。我们在中间增加 DAO 层，把数据访问从业务逻辑中彻底剥离。

### 分层对照

| 层 | RuoYi-Plus-UniApp | 上游 5.x / 6.x |
|----|------|---------------|
| Controller | `SysDeptController` | `SysDeptController extends BaseController` |
| Service 接口 | `ISysDeptService` | `ISysDeptService` |
| Service 实现 | `SysDeptServiceImpl` | `SysDeptServiceImpl` |
| **DAO 接口** | **`ISysDeptDao extends IBaseDao<SysDept>`** | 无此层 |
| **DAO 实现** | **`SysDeptDaoImpl extends BaseDaoImpl<SysDeptMapper, SysDept>`** | 无此层 |
| Mapper | `SysDeptMapper extends BaseMapper<SysDept>` | `SysDeptMapper extends BaseMapperPlus<SysDept, SysDeptVo>` |

Service 层的依赖注入直观体现了这个差异：

```java
// 上游：Service 直接持有 Mapper
private final SysDeptMapper baseMapper;
private final SysRoleMapper roleMapper;
private final SysUserMapper userMapper;

// RuoYi-Plus-UniApp：Service 只见 DAO
private final ISysDeptDao deptDao;
private final ISysRoleDao roleDao;
private final ISysUserDao userDao;
```

### 落地规模

以 `ruoyi-system` 模块为例：

| 层 | RuoYi-Plus-UniApp | 上游 5.x | 上游 6.x |
|----|:---:|:---:|:---:|
| controller | 32 | 20 | 19 |
| service/impl | 33 | 21 | 20 |
| **dao 接口** | **28** | 0 | 0 |
| **dao 实现** | **28** | 0 | 0 |
| mapper | 28 | 21 | 20 |
| domain | 109 | 68 | 63 |

全项目共 **42 个 DAO 实现**，分布在 business / generator / job / mall / system / workflow 等 12 个模块。分层纪律执行彻底：57 个 ServiceImpl 中仅 4 个仍引用 Mapper，且都是 Warm-Flow 第三方 ORM 的 Mapper（外部框架无法纳入 DAO 层），`ruoyi-system` 的 33 个 ServiceImpl 引用 Mapper 数为 0。

### 带来的收益与成本

**收益**：数据访问逻辑集中在 DAO 层，Service 专注业务编排；数据权限注解从上游「打在 Mapper 的 default 方法上、靠 `StaticMethodMatcherPointcut` 匹配动态代理」简化为「打在 DAO 实现的重写方法上、标准 `@Aspect` 切面」，实现从三个类收敛到一个类。

**成本**：每个业务实体多出 DAO 接口与实现两个文件；DAO 实现内部调用自身带 `@DataPermission` 的方法时，需要显式取代理 `SpringUtils.getAopProxy(this).list(lqw)` 才能触发切面。

---

## 四、查询构建

### IBaseDao 通用能力

DAO 基类开箱提供 21 个方法，覆盖单表操作的绝大多数场景：

| 分组 | 方法 |
|------|------|
| 查询 | `getById` / `listByIds` / `getOne`（2 个重载）/ `list` / `listAll` / `page` / `mapList` |
| 统计 | `count` / `exists`（2 个重载） |
| 写入 | `insert` / `batchInsert` / `save` / `batchSave` / `updateById` / `update` |
| 链式更新 | `lambdaUpdate()` |
| 删除 | `deleteById` / `deleteByIds` / `delete` |

所有条件方法只接受增强 Wrapper `PlusLambdaQuery<T>`，业务侧无法绕过。

### PlusLambdaQuery 增强特性

| 特性 | 说明 |
|------|------|
| **默认判空** | 值为 null 或空串时条件不生成 SQL，覆盖 `eq/ne/gt/ge/lt/le/like` 等 12 个方法 |
| **BETWEEN 单端降级** | 只有起始值自动降级为 `>=`，只有结束值降级为 `<=`，两端皆空则不加条件 |
| **日期预解析** | `between` 前自动转换日期字符串，规避 Oracle ORA-01861 隐式转换报错 |
| **IN 元素过滤** | 集合内 null 与空串元素自动剔除，过滤后为空则不加条件 |
| **聚合函数** | `sum / min / max / count / avg`，各带「字段」与「字段 + 别名」重载 |
| **跨库 LIKE** | 按方言自动转换（MySQL/PG 用 `CAST AS VARCHAR`、Oracle 用 `TO_CHAR`、SQL Server 用 `CAST AS NVARCHAR(MAX)`） |

### 同一查询的写法对照

```java
// 上游 5.x —— 判空条件由调用方手写，取值写两遍
LambdaQueryWrapper<SysDept> lqw = Wrappers.lambdaQuery();
lqw.eq(SysDept::getDelFlag, SystemConstants.NORMAL);
lqw.eq(ObjectUtil.isNotNull(bo.getDeptId()), SysDept::getDeptId, bo.getDeptId());
lqw.like(StringUtils.isNotBlank(bo.getDeptName()), SysDept::getDeptName, bo.getDeptName());
lqw.between(params.get("beginTime") != null && params.get("endTime") != null,
    SysDept::getCreateTime, params.get("beginTime"), params.get("endTime"));
```

```java
// 上游 6.x —— 另起名的 IfPresent / IfText 系列，需显式 build()
LambdaQueryBuilder<SysDept> builder = QueryBuilder.lambda(SysDept.class)
    .eq(SysDept::getDelFlag, SystemConstants.NORMAL)
    .eqIfPresent(SysDept::getDeptId, bo.getDeptId())
    .likeIfText(SysDept::getDeptName, bo.getDeptName())
    .betweenParams(SysDept::getCreateTime, params, "beginTime", "endTime");
return builder.build();
```

```java
// RuoYi-Plus-UniApp —— 方法名与 MyBatis-Plus 原生一致，默认判空，本身即 Wrapper
PlusLambdaQuery<SysDept> lqw = PlusLambdaQuery.of(SysDept.class);
lqw.eq(SysDept::getIsDeleted, DictBooleanFlag.NO.getValue());
lqw.eq(SysDept::getDeptId, bo.getDeptId());
lqw.like(SysDept::getDeptName, bo.getDeptName());
lqw.orderByAsc(SysDept::getAncestors);
return lqw;
```

单个模糊查询条件的写法长度：上游 5.x 88 字符，上游 6.x 48 字符，我们 46 字符。区别在于我们保持原生方法名、零学习成本，且 BETWEEN 单端有值时仍然生效——上游 6.x 的 `betweenIfPresent` 一端为 null 即丢弃整个条件。

### 能力边界

上游 6.x 在查询构建上提供了我们尚未覆盖的两项能力：**子查询构建器**（`selectSub` / `eqSub` / `inSub` / `existsSub`）与**联表查询构建器**（基于 mybatis-plus-join）。这两类场景我们目前通过 XML 实现。

---

## 五、权限体系

### 行级数据权限

三方注解定义一致，六档数据范围（全部 / 自定义 / 本部门 / 部门及以下 / 仅本人 / 部门及以下或本人）相同。我们的实现增强：

| 项 | RuoYi-Plus-UniApp | 上游 5.x / 6.x |
|----|------|---------------|
| 切面实现 | 单个 `@Aspect` 类 | Advisor + Advice + Pointcut 三件套 |
| Mapper 包扫描与 ID 缓存 | **支持** | 无 |
| `denyAll()` 兜底拒绝 | **支持** | 无 |
| 数据范围枚举中文标签 | **支持** | 无 |

### 列级字段权限

同一条记录，不同角色看到和改到不同的列——这是行级权限解决不了的另一半问题。上游两条线均无此能力，其数据脱敏注解是静态的，对所有人一视同仁，不按主体授权。

**四档访问控制**：

| 档位 | JSON 表现 | Excel 导出 | 写入 |
|------|----------|-----------|------|
| 隐藏 | 无该 key | 整列消失（含表头） | 提交被忽略 |
| 脱敏 | 值打码 | 值打码 | 提交被忽略 |
| 只读 | 明文 | 明文 | 提交被忽略 |
| 可写 | 明文 | 明文 | 正常写入 |

**三种授权主体**：角色（主力粒度）、部门（可沿部门树向下继承）、用户（临时例外授权）。多主体命中时逐字段取最宽松档位，与行级权限的多角色并集语义一致。

**四个出口统一收口**：JSON 序列化、Excel 导出、JSON 写入、Excel 导入共用同一决策服务。同一用户在页面看不到的字段，导出也导不出、调接口也改不了、做张 Excel 导进去同样覆盖不掉。

**配套管理能力**：字段 × 主体配置矩阵、按真实用户的效果预览、收权影响面统计（提示「收紧后仍有 N 人因其他主体可见」）。

---

## 六、开箱即用的业务能力

上游定位是通用后台框架，不含具体业务能力。以下模块为我们独有，开箱可用于生产。

### 支付

聚合层采用策略 + 注册表模式，统一四种渠道的下单、退款、回调：

| 渠道 | 能力 |
|------|------|
| 微信支付 | V2 / V3 双版本自动选择 |
| 支付宝 | 完整对接 |
| 银联 | 完整对接 |
| 余额支付 | 内置账户体系 |

配套商城模块提供商品、SKU、订单、发货与统一支付回调。

### 微信生态

| 模块 | 能力 |
|------|------|
| 小程序 | 小程序码生成、订阅消息、手机号授权自动绑定 |
| 公众号 | JS-SDK 签名、模板消息，token 走 Redis 集群共享 |

### AI 大模型

基于 LangChain4j 自建，30 个实现类，全链路开源可控：

| 能力 | 说明 |
|------|------|
| 多模型 | DeepSeek、通义千问、Claude、OpenAI、Ollama |
| 会话记忆 | Redis 存储 |
| RAG 知识库 | memory / Milvus / PGVector 三种向量库 |
| 流式对话 | WebSocket 实时推送 |

上游 6.x 的 AI 能力绑定在第三方闭源组件上，模块本身仅两个配置类，不含 AI 逻辑。

### 物联网与消息

MQTT 客户端（设备管理、实时数据采集）、RocketMQ 消息队列（同步 / 异步 / 顺序 / 延迟消息、Topic 运维、连通性诊断）。

### 其他独有能力

| 模块 | 能力 |
|------|------|
| 多媒体处理 | 链式图像处理、二维码、营销海报合成、GIF 动图 |
| Word 模板 | 占位符、图片、表格行循环，一行链式导出 docx |
| 开放 API | AppKey/AppSecret 签名、时间戳防重放、自动换发登录态 |
| 声明式 HTTP | 高德地图（定位 / 地理编码 / 天气）、火山引擎 TTS |
| 统一消息调度 | 多通道路由、按优先级降级、广播，已接入 5 个通道 |

---

## 七、基础设施模块

| 项目 | common 子模块数 |
|------|:---:|
| **RuoYi-Plus-UniApp** | **36** |
| 上游 5.x | 24 |
| 上游 6.x | 24 |

多出的 12 个模块全部指向可直接变现的业务能力：支付（含 5 个子模块）、AI 大模型、微信小程序、微信公众号、多媒体处理、Word 模板、序列化映射、声明式 HTTP、RocketMQ、统一消息调度、开放 API、测试脚手架。

### 序列化映射

Jackson 序列化期把 ID 自动转成名称、头像、字典标签、OSS 直链等，是上游同类能力的超集：

| 内置实现 | RuoYi-Plus-UniApp | 上游 |
|---------|:---:|:---:|
| 用户名 / 昵称 / 部门名 / 字典 / OSS URL | 支持 | 支持 |
| 头像 | **支持** | 无 |
| 预签名 URL | **支持** | 无 |
| 通用实体字段映射 | **支持** | 无 |
| 目录名 | **支持** | 无 |
| 国际化翻译 | **支持** | 无 |
| 合计 | **11 个** | 5 个 |

---

## 八、安全与等保合规

面向等保二级测评的三项条款提供开箱支撑，上游两条线均无对应能力。

| 能力 | 对应条款 |
|------|---------|
| 密码复杂度策略 | 身份鉴别 8.1.4.1 a |
| 历史密码防重用 | 同上 |
| 密码到期提醒 | 同上 |
| 首次登录强制改密（服务端拦截） | 同上 |
| 策略参数在线可调（8 条配置项） | 同上 |
| 审计日志定期归档（每日自动，含归档表与前端查询） | 安全审计 8.1.4.3 c |
| 数据库备份与恢复脚本（含恢复演练记录模板） | 数据备份恢复 8.1.4.7 a |

初始密码默认使用强口令，而非上游的 `123456`。

---

## 九、多租户与分支矩阵

上游 6.x 为拥抱 Spring Boot 4 移除了多租户能力——官方定位从 5.x 的「分布式集群与多租户」改为「分布式集群」，租户模块、租户实体基类、相关建表脚本全部移除，实体基类规范也从继承租户基类改为继承普通基类。依赖多租户的存量业务无法平迁 6.x。

我们的 Spring Boot 4 分支两者兼得：

| | 上游 5.x | 上游 6.x | 我们 3.5.x 主线 | 我们 4.x 分支 |
|---|:---:|:---:|:---:|:---:|
| Spring Boot | 3.5.14 | **4.1.0** | 3.5.16 | **4.1.0** |
| Java | 17 | 21 | 21 | 21 |
| 多租户 | 支持 | **不支持** | **支持** | **支持** |

### 五个分支变体

业务代码与开发规范完全一致，按「租户模型 × 技术栈」区分：

| 分支 | Spring Boot | 多租户 | 工作流 |
|------|:---:|:---:|:---:|
| `master` | 3.5.x | 支持 | 无 |
| `single` | 3.5.x | 无 | 无 |
| `workflow` | 3.5.x | 支持 | 支持 |
| `6.x` | 4.1.0 | 支持 | 支持 |
| `6.x-single` | 4.1.0 | 无 | 支持 |

---

## 十、代码生成器

| 项 | RuoYi-Plus-UniApp | 上游 5.x | 上游 6.x |
|----|:---:|:---:|:---:|
| 模板引擎 | Velocity | Velocity | FreeMarker |
| 模板文件数 | **19** | 16 | 20 |
| Java 各层 | 支持 | 支持 | 支持 |
| **DAO 接口 + 实现** | **支持** | 无 | 无 |
| Mapper + XML | 支持 | 支持 | 支持 |
| TypeScript 类型 + API | 支持 | 支持 | 支持 |
| Vue 列表页 / 树表页 | 支持 | 支持 | 支持 |
| **主子表子页** | **支持** | 无 | 无 |
| React 页面 | 无 | 无 | 支持 |
| SQL 菜单脚本（四种库） | 支持 | 支持 | 支持 |
| **菜单自动入库** | **支持** | 无 | 无 |
| **菜单图标 / 排序可配** | **支持** | 无 | 无 |
| **后端模块名 / 前端目录可配** | **支持** | 无 | 无 |

三方生成器均不产出移动端页面。

---

## 十一、管理端前端

上游 6.x 的前端已拆分为独立仓库，本节与 5.x 对比。核心框架版本双方同代（Vue 3.5 / Vite 6 / Pinia 3 / UnoCSS 66）。

### 体量

| 指标 | RuoYi-Plus-UniApp | 上游 5.x |
|------|---:|---:|
| src 代码行数 | **132,172** | 28,185 |
| `.vue` 文件 | **213** | 99 |
| 自研组件 | **77** | 28 |
| API 层文件 | **89** | 60 |
| i18n 词条 | **1,507 行 / 50 命名空间** | 85 行 / 4 命名空间 |
| 权限指令 | **12** | 3 |
| 构建插件 | **12** | 8 |

### 自研组件体系

77 个组件中 69 个是 `A` 前缀的业务级封装：

| 组件族 | 数量 | 代表能力 |
|--------|:---:|---------|
| 表单封装 | 14 | 表格弹窗选择器、高德地图选点、富文本、省市区级联、图片与附件上传 |
| 卡片模板 | 23 | 统计、图表、时间轴、价格、天气等成品卡片 |
| 图表 | 10 | 折线 / 柱状 / 双向柱状 / 饼图 / 雷达 / 散点 / K 线 / 地图 |
| AI 能力 | 4 | 文本润色、测试数据生成、内容审核 |
| 主题视觉 | 5 | 主题色选择、粒子背景、水印 |
| 业务组件 | 13 | 通用表格、搜索表单、统一弹窗、详情弹窗、虚拟滚动过滤树、OSS 媒体库、Excel 导入 |

### 架构差异

| 维度 | RuoYi-Plus-UniApp | 上游 5.x |
|------|------|---------|
| 组合式函数 | **独立 `composables/` 层，18 个文件**，auto-import 全局注入 | 能力散落在 plugins / utils / hooks 三处 |
| 工具函数 | 18 个文件，**纯函数** | 19 个文件，混有状态逻辑 |
| 路由 | 守卫独立 + 模块化拆分 | 单文件 + 根级守卫 |
| 样式 | 7-1 架构分层 | 扁平 8 个 scss |
| 主题 | **CSS 变量体系**（亮 35 + 暗 46 变量）+ 五层背景层级 + 切换动画 | JS 生成主色梯度 |
| 菜单布局 | **4 种**（含双列布局） | 2 种 |
| 图标 | **三源统一入口** + 2,538 行类型声明 | 多套写法并存，无类型 |

### API 代码生成

内置 OpenAPI 代码生成插件（6 个文件 / 2,384 行），从后端接口文档自动生成 API 与类型文件：MD5 防覆盖（内容变化时生成参考文件而非覆盖手改代码）、CRUD 七级优先级自动排序、按模块 / 文件 / 函数通配忽略。上游无同类基建。

### 独有业务模块

商城（商品 / SKU / 订单）、支付配置、广告位、平台配置、账号绑定、字段权限配置页、OpenAPI 密钥管理、**可视化页面设计器**（14 个文件 / 7,660 行，含 AI 生成与优化）。

---

## 十二、响应封装

| 维度 | RuoYi-Plus-UniApp | 上游 5.x | 上游 6.x |
|------|------|---------|---------|
| 响应壳数量 | **1 种** | **2 种**（分页与非分页结构不同） | 1 种 |
| 分页字段 | `records / total / current / size / last` | `rows / total / code / msg` | `rows / total` |
| 页码回传 | **支持** | 无 | 无 |
| 是否末页 | **支持** | 无 | 无 |
| 分页结果类型转换 | **支持** | 无 | 无 |
| 消息国际化 | **自动识别并翻译** | 硬编码中文 | 硬编码中文 |
| 带参国际化 | **支持** | 无 | 无 |
| `R.status()` 快捷封装 | **5 个重载** | 无 | 无 |

上游 5.x 的分页接口返回 `{code, msg, rows, total}`、非分页返回 `{code, msg, data}`，前端需处理两种结构；我们统一为 `{code, msg, data}` 一种，`data` 内额外提供页码、页大小与末页标记。

`R.status()` 让 Controller 更薄——`return R.status(deptService.updateDept(dept))` 直接把布尔值或影响行数转成统一响应。

---

## 十三、数据库与运维

三方均支持 MySQL、Oracle、PostgreSQL、SQL Server 四种数据库。

| 项 | RuoYi-Plus-UniApp | 上游 5.x | 上游 6.x |
|----|:---:|:---:|:---:|
| 建库脚本（每种库） | **6 个** | 3 个 | 3~4 个 |
| 升级脚本组织 | **按功能分类**（21 个） | 按版本号（50 个） | 无升级目录 |
| **数据库备份 / 恢复脚本** | **提供** | 无 | 无 |
| Docker 编排文件 | **6 个**（完整版 / 数据库 / 监控 / RocketMQ / 应用 / 任务调度） | 2 个 | 2 个 |

---

## 十四、运行时与依赖

核心中间件版本三方高度接近，我们与上游 5.x 的绝大多数依赖完全一致，差异集中在运行时基线。

| 依赖 | RuoYi-Plus-UniApp | 上游 5.x | 上游 6.x |
|------|:---:|:---:|:---:|
| **Java** | **21** | 17 | **21** |
| **Spring Boot** | **3.5.16** | 3.5.14 | **4.1.0** |
| MyBatis-Plus | 3.5.16 | 3.5.16 | 3.5.16 |
| Sa-Token | 1.45.0 | 1.45.0 | 1.45.0 |
| Redisson | 3.52.0 | 3.52.0 | 4.6.1 |
| Hutool | 5.8.43 | 5.8.43 | 5.8.46 |
| SpringDoc | 2.8.17 | 2.8.17 | 3.0.3 |
| Warm-Flow | **1.8.9** | 1.8.5 | 1.8.8 |
| SnailJob | 1.10.0 | 1.10.0 | 2.0.0 |
| Lock4j | 2.2.7 | 2.2.7 | 2.2.7 |
| dynamic-datasource | 4.3.1 | 4.3.1 | 4.5.0 |
| JustAuth | 1.16.7 | 1.16.7 | 1.16.7 |
| SMS4J | 3.3.5 | 3.3.5 | 3.3.5 |
| Excel 引擎 | FastExcel 1.3.0 | FastExcel 1.3.0 | Fesod 2.0.2 |
| Web 容器 | Undertow | Undertow | Jetty |

我们在 3.5.x 稳定主线上采用 Java 21，同时提供与 6.x 同代的 Spring Boot 4 分支，稳定与尝鲜两条路径都可选。

---

## 十五、选型建议

### 适合选上游 5.x

- 需要 MIT 协议，完全开源可商用，不接受授权费用
- 只做 PC 管理端，无移动端需求
- 不需要支付、微信生态、AI 能力
- 希望依托 Dromara 社区生态

### 适合选上游 6.x

- 希望尽早使用 Spring Boot 4 + JDK 21
- **不需要多租户**（硬前提）
- 需要子查询 / 联表的 Java 侧链式构建
- 需要 React 前端代码生成
- 接受前端在独立仓库维护

### 适合选 RuoYi-Plus-UniApp

- 需要 **PC 管理端 + 移动端全栈**一套交付（小程序 / H5 / APP / 鸿蒙）
- 需要**开箱即用的支付能力**与微信小程序、公众号深度集成
- 需要**列级字段权限**，按角色控制同一记录的字段可见可改
- 需要**等保二级**合规支撑
- 需要**自建可控的 AI 能力**，而非绑定第三方闭源组件
- 希望 **AI 辅助开发开箱即用**，让 AI 直接产出符合框架规范的代码
- 需要 **Spring Boot 4 与多租户兼得**
- 能接受闭源授权模式

### 三方共同具备

Sa-Token 认证与权限注解、JustAuth 三方登录、Redisson 缓存与分布式锁、MyBatis-Plus ORM 与多数据源、SnailJob 分布式任务调度、数据脱敏与加解密、接口传输加密、行级数据权限、Excel 导入导出、SpringDoc 接口文档、国际化、Docker 部署、四种关系数据库支持、Warm-Flow 工作流。

这些能力源自上游多年积累，选择任何一方都能获得。
