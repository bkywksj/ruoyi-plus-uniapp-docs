# 与上游框架对比

## 写在前面

RuoYi-Plus-UniApp 基于 [Dromara RuoYi-Vue-Plus](https://plus-doc.dromara.org/) 深度重构而来。**上游那套经过多年打磨的能力，我们全部继承**——Sa-Token 认证、Redisson 缓存、MyBatis-Plus ORM、SnailJob 任务调度、数据脱敏、接口加密、多数据源、Docker 编排等等，这些不是我们的创新，本页也不会把它们列成「我们的优势」。

本页只回答一个问题：**在上游的基础上，我们改了什么、加了什么、哪些地方还不如上游。**

我们同时也是上游项目的赞助商，两个项目是协作关系而非竞争关系。选型时如果上游已经满足需求，直接用上游是完全合理的选择。

### 对比基准

本页所有数据来自三份源码的实际读取，而非官网宣传口径：

| 对比对象 | 版本 | 说明 |
|---------|------|------|
| **RuoYi-Plus-UniApp** | revision 5.6.1（workflow 分支） | 本文档对应的框架 |
| **RuoYi-Vue-Plus 5.x** | revision 5.6.1 | 上游稳定主线 |
| **RuoYi-Vue-Plus 6.x** | revision 5.5.3（README 标 6.0.0） | 上游 Spring Boot 4 新线 |

统计口径说明：模块数取 `pom.xml` 中 `<module>` 声明数并与目录数交叉核对；代码行数为 `.vue`、`.ts`、`.tsx`、`.scss` 文件累计；「上游没有某能力」的结论均为多关键字全仓检索后的判断，排除 `target/` 与 `node_modules/`。

---

## 一、版本基线

三方的核心依赖版本高度接近——**我们与上游 5.x 的绝大多数中间件版本完全一致**。差异主要在运行时基线与个别组件。

| 依赖 | 我们 | 上游 5.x | 上游 6.x |
|------|:---:|:---:|:---:|
| **Java** | **21** | 17 | **21** |
| **Spring Boot** | **3.5.16** | 3.5.14 | **4.1.0** |
| MyBatis-Plus | 3.5.16 | 3.5.16 | 3.5.16 |
| Sa-Token | 1.45.0 | 1.45.0 | 1.45.0 |
| Redisson | 3.52.0 | 3.52.0 | **4.6.1** |
| Hutool | 5.8.43 | 5.8.43 | 5.8.46 |
| SpringDoc | 2.8.17 | 2.8.17 | **3.0.3** |
| Warm-Flow | **1.8.9** | 1.8.5 | 1.8.8 |
| SnailJob | 1.10.0 | 1.10.0 | **2.0.0** |
| Lock4j | 2.2.7 | 2.2.7 | 2.2.7 |
| dynamic-datasource | 4.3.1 | 4.3.1 | 4.5.0 |
| JustAuth | 1.16.7 | 1.16.7 | 1.16.7 |
| SMS4J | 3.3.5 | 3.3.5 | 3.3.5 |
| Excel 引擎 | FastExcel 1.3.0 | FastExcel 1.3.0 | Fesod 2.0.2 |
| Web 容器 | Undertow | Undertow | Jetty |

**如何解读这张表**：

- 我们相对 5.x 的版本差距是「跟进更勤」（Spring Boot 补丁位、Warm-Flow 小版本），**不是代际差**。任何声称「技术栈更先进」的说法在这张表面前都站不住脚。
- 6.x 是真正的代际跃迁：Spring Boot 4 + Redisson 4.x + SpringDoc 3.x，JDK 最低要求抬到 21。代价见第九节。
- 我们提供 **Spring Boot 4 分支**（`6.x` / `6.x-single`），Java 21 + Spring Boot 4.1.0，与上游 6.x 同代。

---

## 二、总览

| 维度 | 我们 | 上游 5.x | 上游 6.x |
|------|------|---------|---------|
| 后端分层 | **四层** Controller→Service→DAO→Mapper | 三层 Controller→Service→Mapper | 三层 |
| common 基础设施模块 | **36 个** | 24 个 | 24 个 |
| 业务模块 | system / workflow / generator / job / **business** / **mall** | system / workflow / generator / job / demo | system / workflow / gen / job / demo / ai |
| 行级数据权限 | 支持 | 支持 | 支持 |
| **列级字段权限** | **支持** | 不支持 | 不支持 |
| 多租户 | **支持** | 支持 | **不支持** |
| 等保二级适配 | **支持** | 不支持 | 不支持 |
| 支付能力 | **微信/支付宝/银联/余额** | 无 | 无 |
| 微信生态 | **小程序 + 公众号** | 无 | 无 |
| AI 集成 | **LangChain4j 自建** | 无 | Snail AI（第三方组件） |
| 管理端前端 | 仓内 plus-ui | 仓内 plus-ui | 独立仓库 |
| **移动端** | **4 个工程 + 101 组件** | **无** | **无** |
| 代码生成器模板 | 19 个（Velocity） | 16 个（Velocity） | 20 个（FreeMarker，含 React） |
| 数据库支持 | MySQL / Oracle / PostgreSQL / SQL Server | 同左 | 同左 |
| 开源协议 | 闭源，需授权 | MIT | MIT |

---

## 三、后端分层架构

这是我们相对上游**最结构性的改动**。

### 分层对照

| 层 | 我们 | 上游 5.x / 6.x |
|----|------|---------------|
| Controller | `SysDeptController` | `SysDeptController extends BaseController` |
| Service 接口 | `ISysDeptService` | `ISysDeptService` |
| Service 实现 | `SysDeptServiceImpl` | `SysDeptServiceImpl` |
| **DAO 接口** | **`ISysDeptDao extends IBaseDao<SysDept>`** | **无此层** |
| **DAO 实现** | **`SysDeptDaoImpl extends BaseDaoImpl<SysDeptMapper, SysDept>`** | **无此层** |
| Mapper | `SysDeptMapper extends BaseMapper<SysDept>` | `SysDeptMapper extends BaseMapperPlus<SysDept, SysDeptVo>` |

### Service 层是否直接操作 Mapper

上游 Service 直接注入 Mapper：

```java
// 上游 5.x：SysDeptServiceImpl
private final SysDeptMapper baseMapper;
private final SysRoleMapper roleMapper;
private final SysUserMapper userMapper;
```

我们的 Service 只见 DAO，不见 Mapper：

```java
// 我们：SysDeptServiceImpl
private final ISysDeptDao deptDao;
private final ISysRoleDao roleDao;
private final ISysUserDao userDao;
```

### 实测层文件数（ruoyi-system 模块）

| 层 | 我们 | 上游 5.x | 上游 6.x |
|----|:---:|:---:|:---:|
| controller | 32 | 20 | 19 |
| service/impl | 33 | 21 | 20 |
| **dao 接口** | **28** | **0** | **0** |
| **dao 实现** | **28** | **0** | **0** |
| mapper | 28 | 21 | 20 |
| domain | 109 | 68 | 63 |

全项目 `ruoyi-modules` 下共 **42 个 DaoImpl**，分布在 business / generator / job / mall / system / workflow 等 12 个 dao 目录。两个上游的 `ruoyi-modules` 下 dao 目录数为 **0**。

### 纪律执行情况

`ruoyi-modules` 下 57 个 `ServiceImpl` 中，仅 **4 个**仍引用 Mapper，全部在工作流模块，且注入的是 Warm-Flow 第三方 ORM 的 Mapper（外部框架无法套 DAO 层）。**ruoyi-system 的 33 个 ServiceImpl 中引用 Mapper 的数量为 0**。

### 这个改动的代价

四层不是纯收益，如实说明两点成本：

- **类文件数量增加**：每个业务实体多出 DAO 接口 + DAO 实现两个文件。
- **自调用需显式取代理**：DaoImpl 内部调用自身带 `@DataPermission` 的方法时，必须写 `SpringUtils.getAopProxy(this).list(lqw)` 才能走到切面，否则数据权限静默失效。这是分层引入的额外心智负担。

作为交换，数据权限注解从上游的「打在 Mapper 的 default 方法上、靠 `StaticMethodMatcherPointcut` 匹配 JDK 动态代理」简化为「打在 DaoImpl 重写方法上、标准 `@Aspect` 切面」，实现从三个类收敛到一个类。

---

## 四、查询构建与 DAO 能力

### IBaseDao 提供的方法（21 个）

| 分组 | 方法 |
|------|------|
| 查询 | `getById` / `listByIds` / `getOne`（2 个重载）/ `list` / `listAll` / `page` / `mapList` |
| 统计 | `count` / `exists`（2 个重载） |
| 写入 | `insert` / `batchInsert` / `save` / `batchSave` / `updateById` / `update` |
| 链式更新 | `lambdaUpdate()` → `PlusLambdaUpdate<T>` |
| 删除 | `deleteById` / `deleteByIds` / `delete` |

所有条件方法**只接受 `PlusLambdaQuery<T>`**，不接受原生 `Wrapper`——业务侧无法绕过增强 Wrapper。

### 上游的对应物

上游两版**都不存在 `IServicePlus`**（旧版本曾有，5.6.1 / 5.5.3 已无）。唯一对应物是 `BaseMapperPlus<T, V>`：

| 能力 | 我们 | 上游 5.x | 上游 6.x |
|------|:---:|:---:|:---:|
| 实体→VO 自动转换 | 无（上移到 Service 用 `MapstructUtils`） | **15 个 `selectVoXxx` 重载** | 同 5.x |
| 分页直接返回 `PageResult` | **是** | 否（返回 `IPage`，Service 再转） | 否 |
| 链式查询 | 仅更新链 | 无 | **`LambdaCrudChainWrapper`（909 行）** |
| 子查询构建器 | **无** | 无 | **有** |
| 联表查询构建器 | **无** | 无 | **有**（mybatis-plus-join） |

业务侧 Mapper 基类的选择完全相反：我们 42 个 Mapper 继承原生 `BaseMapper`（仅 1 个继承 `BaseMapperPlus`），上游 5.x 有 30 个、6.x 有 32 个继承 `BaseMapperPlus`。根本分歧在于「VO 转换放哪一层」——我们放 Service，上游耦合进 Mapper 泛型。

### PlusLambdaQuery 的核心能力

| 能力 | 说明 |
|------|------|
| **默认 null 安全** | `checkValueEffective` 是所有条件方法的门卫，值为 null 或空串时该条件不生成 SQL，覆盖 `eq/ne/gt/ge/lt/le/like` 等 12 个方法 |
| **BETWEEN 单端降级** | 只有起始值时自动降级为 `>=`，只有结束值时降级为 `<=`，两端皆空则整条件不加 |
| **日期字符串预解析** | `between` 前先跑 `tryParseDateStr`，规避 Oracle 的 ORA-01861 隐式转换报错 |
| **IN 集合元素过滤** | 集合内的 null / 空串元素被剔除后才拼 SQL，过滤后为空则整条件不加 |
| **聚合函数** | `sum / min / max / count / avg / aggfunc`，各带「字段」与「字段+别名」两个重载 |
| **跨数据库 LIKE** | `likeCast / likeLeftCast / likeRightCast` 自动按方言转换（MySQL/PG 用 `CAST AS VARCHAR`、Oracle 用 `TO_CHAR`、SQL Server 用 `CAST AS NVARCHAR(MAX)`） |

### 同一个查询的三方写法对照

同样是「部门列表条件查询」，看等价代码：

```java
// 上游 5.x —— 方法在 Service 里，判空靠调用方手写
LambdaQueryWrapper<SysDept> lqw = Wrappers.lambdaQuery();
lqw.eq(SysDept::getDelFlag, SystemConstants.NORMAL);
lqw.eq(ObjectUtil.isNotNull(bo.getDeptId()), SysDept::getDeptId, bo.getDeptId());
lqw.like(StringUtils.isNotBlank(bo.getDeptName()), SysDept::getDeptName, bo.getDeptName());
lqw.between(params.get("beginTime") != null && params.get("endTime") != null,
    SysDept::getCreateTime, params.get("beginTime"), params.get("endTime"));
```

```java
// 上游 6.x —— 方法仍在 Service 里，改用另起名的 IfPresent / IfText 系列
LambdaQueryBuilder<SysDept> builder = QueryBuilder.lambda(SysDept.class)
    .eq(SysDept::getDelFlag, SystemConstants.NORMAL)
    .eqIfPresent(SysDept::getDeptId, bo.getDeptId())
    .likeIfText(SysDept::getDeptName, bo.getDeptName())
    .betweenParams(SysDept::getCreateTime, params, "beginTime", "endTime");
return builder.build();   // 需显式 build() 拆出 Wrapper
```

```java
// 我们 —— 方法在 DAO 里，方法名与 MyBatis-Plus 原生一致，默认判空
PlusLambdaQuery<SysDept> lqw = PlusLambdaQuery.of(SysDept.class);
lqw.eq(SysDept::getIsDeleted, DictBooleanFlag.NO.getValue());
lqw.eq(SysDept::getDeptId, bo.getDeptId());
lqw.like(SysDept::getDeptName, bo.getDeptName());
lqw.orderByAsc(SysDept::getAncestors);
return lqw;   // 本身就是 Wrapper，无需 build()
```

单个条件的写法长度对照：

| 版本 | 写法 | 字符数 | 判空由谁负责 |
|------|------|:---:|------|
| 上游 5.x | `lqw.like(StringUtils.isNotBlank(bo.getDeptName()), SysDept::getDeptName, bo.getDeptName())` | 88 | 调用方手写，取值写两遍 |
| 上游 6.x | `.likeIfText(SysDept::getDeptName, bo.getDeptName())` | 48 | 方法名自带语义，需记住 `IfText` / `IfPresent` 之分 |
| 我们 | `lqw.like(SysDept::getDeptName, bo.getDeptName())` | 46 | 默认安全，方法名与原生一致 |

### 平衡说明

相对 5.x，我们和 6.x 都大幅削减了判空样板。相对 6.x：

- **我们的优势**：零学习成本（方法名即 MyBatis-Plus 原生名）、BETWEEN 单端降级、跨库 `likeCast`。6.x 的 `betweenIfPresent` 一端为 null 就丢弃整个条件，不降级。
- **我们的劣势**：**没有子查询构建器，也没有联表查询构建器**。这两类需求我们仍需落到 XML，而 6.x 可以用 `selectSub / eqSub / inSub / existsSub` 与 `QueryBuilder.lambdaJoin()` 在 Java 侧完成。

---

## 五、响应封装

| 维度 | 我们 | 上游 5.x | 上游 6.x |
|------|------|---------|---------|
| 分页返回类 | `PageResult<T>` | `TableDataInfo<T>` | `PageResult<T>` |
| Controller 分页返回形态 | `R<PageResult<T>>` | **`TableDataInfo<T>` 裸返回，不套 `R`** | `R<PageResult<T>>` |
| 响应壳数量 | **1 种** | **2 种**（分页 `{code,msg,rows,total}` / 非分页 `{code,msg,data}`） | 1 种 |
| 分页字段 | `records / total / current / size / last` | `rows / total / code / msg` | `rows / total` |
| 页码回传 | **有** `current` / `size` | 无 | 无 |
| 是否末页 | **有** `last` | 无 | 无 |
| 类型转换 | **有** `convert(Class)` / `map(Function)` | 无 | 无 |
| `R` 消息国际化 | **自动识别 i18n key 并翻译** | 硬编码中文 | 硬编码中文 |
| `R` 带参国际化 | **有** `ok(msg, args...)` 等 4 个 | 无 | 无 |
| `R.status()` 系列 | **有** 5 个重载 | 无 | 无 |
| `isSuccess` 空安全 | 否 | 否 | **是** |
| `BaseController` 基类 | **无**（Controller 全部是裸 `@RestController`） | 有 | 有 |

`R.status()` 让 Controller 更薄——`return R.status(deptService.updateDept(dept))` 直接把 `boolean` 或影响行数转成统一响应。

**平衡说明**：「统一响应壳」只是相对 5.x 的优势，6.x 已经收敛到 `R<PageResult<T>>`。另外三方的 `PageQuery` 字段与默认值完全一致，此处没有差异。

---

## 六、基础设施模块

| 项目 | common 子模块数 |
|------|:---:|
| **我们** | **36** |
| 上游 5.x | 24 |
| 上游 6.x | 24 |

### 仅我们独有（12 个，两个上游都没有）

| 模块 | 能力 |
|------|------|
| `ruoyi-common-pay` | 支付聚合层，含 5 个子模块（core / 微信 / 支付宝 / 银联 / 余额），微信 V2/V3 双版本自动选择 |
| `ruoyi-common-langchain4j` | AI 能力层（30 个类）：多模型工厂、会话记忆、RAG 知识库、WebSocket 流式对话 |
| `ruoyi-common-miniapp` | 微信小程序：小程序码生成、订阅消息 |
| `ruoyi-common-mp` | 微信公众号：JS-SDK 签名、模板消息，token 走 Redis 集群共享 |
| `ruoyi-common-media` | 图像处理：缩放/水印/滤镜链式 API、二维码、营销海报合成、GIF 动图 |
| `ruoyi-common-doctemplate` | Word 模板渲染（POI-TL）：占位符、图片、表格行循环 |
| `ruoyi-common-serialMap` | 序列化映射，上游 `translation` 的超集（11 个实现 vs 5 个） |
| `ruoyi-common-http` | 声明式第三方 HTTP 客户端（Forest）：高德地图、火山引擎 TTS |
| `ruoyi-common-rocketmq` | RocketMQ：同步/异步/顺序/延迟消息、Topic 运维、连通性诊断 |
| `ruoyi-common-message` | 统一消息调度：多通道路由、按优先级降级、广播，已接入 5 个通道 |
| `ruoyi-common-openapi` | 开放 API 网关：AppKey/AppSecret 签名、时间戳防重放、自动换发登录态 |
| `ruoyi-common-test` | 测试脚手架：分层测试基类 + 假数据构造器，被 25 个 pom 引用 |

### 序列化映射 vs 上游 translation

同一类能力，我们是上游的超集：

| 内置实现 | 我们 `serialMap` | 上游 `translation` |
|---------|:---:|:---:|
| 用户名 / 昵称 / 部门名 / 字典 / OSS URL | 有 | 有 |
| 头像 | **有** | 无 |
| 预签名 URL | **有** | 无 |
| 通用实体字段映射 | **有** | 无 |
| 目录名 | **有** | 无 |
| 国际化翻译 | **有** | 无 |
| 合计 | **11 个** | 5 个 |

---

## 七、权限体系

### 行级数据权限

三方的 `@DataPermission` 注解定义**完全一致**，六档数据范围也一致。差异在实现细节：

| 项 | 我们 | 上游 5.x | 上游 6.x |
|----|------|---------|---------|
| 切面实现 | 单个 `@Aspect` 类 | Advisor + Advice + Pointcut 三件套 | 同 5.x |
| 注解落点 | DaoImpl 重写方法 | Mapper 的 default 方法 | 同 5.x |
| Mapper 包扫描 + mapperId 缓存 | **有** | 无 | 无 |
| `denyAll()` 兜底拒绝 | **有** | 无 | 无 |
| 数据范围枚举带中文标签 | **有** | 无 | 无 |

### 列级字段权限（我们独有）

**同一条记录，不同角色看到和改到不同的列。** 这是行级数据权限解决不了的那一半问题。

上游检索结果——以下 9 个关键字在两个上游仓库的命中数**均为 0**：`FieldResource`、`FieldPermission`、`field_permission`、`字段权限`、`FieldPerm`、`columnPermission`、`列级`、`maskField`、`GenFieldPerm`。上游只有「字段级**加密**」和静态的 `@Sensitive` 脱敏——脱敏对所有人一视同仁，不按主体授权。

| 能力 | 我们 | 上游 5.x | 上游 6.x |
|------|:---:|:---:|:---:|
| 四档访问控制（隐藏/脱敏/只读/可写） | **有** | 无 | 无 |
| 三种授权主体（角色/部门/用户） | **有** | 无 | 无 |
| JSON 序列化出口拦截 | **有** | 无 | 无 |
| Excel 导出出口拦截 | **有** | 无 | 无 |
| JSON 写入拦截 | **有** | 无 | 无 |
| Excel 导入拦截 | **有** | 无 | 无 |
| 配置矩阵（字段 × 主体） | **有** | 无 | 无 |
| 效果预览（按真实用户） | **有** | 无 | 无 |
| 收权影响面统计 | **有** | 无 | 无 |

四个出口共用同一个决策服务，保证语义一致：同一用户在页面看不到的字段，导出也导不出、写入也改不了、做张 Excel 导进去同样覆盖不掉。

---

## 八、安全与等保合规

以下关键字在两个上游仓库的命中数均为 **0**：`PasswordPolicy`、`pwdUpdateTime`、`LogArchive`、`日志归档`、`backup.sh`、`restore.sh`、`强制修改密码`、`等保`。

| 能力 | 我们 | 上游 5.x | 上游 6.x |
|------|:---:|:---:|:---:|
| 密码复杂度策略 | **有** | 无 | 无 |
| 历史密码防重用 | **有** | 无 | 无 |
| 密码到期提醒 | **有** | 无 | 无 |
| 首次登录强制改密 | **有** | 无 | 无 |
| 策略参数在线可调 | **有**（8 条配置项） | 无 | 无 |
| 审计日志定期归档 | **有**（每日 03:00，含归档表与前端查询） | 无 | 无 |
| 数据库备份 / 恢复脚本 | **有**（含恢复演练记录模板） | 无 | 无 |
| 初始密码强度 | 强口令 | `123456` | `123456` |

对应等保二级的 8.1.4.1 a（身份鉴别）、8.1.4.3 c（安全审计）、8.1.4.7 a（数据备份恢复）三项条款。

---

## 九、多租户：5.x 与 6.x 的分水岭

上游 6.x 为拥抱 Spring Boot 4，**整体移除了多租户能力**。这一点在官方 README 的定位表述里也能看到——从 5.x 的「针对分布式集群**与多租户**场景」改为 6.x 的「针对分布式集群场景」。

实测证据：

| 证据项 | 上游 5.x | 上游 6.x |
|--------|:---:|:---:|
| `ruoyi-common-tenant` 模块 | 存在（7 个包） | **不存在** |
| 引用 `TenantEntity` / `TenantHelper` 的文件 | **34 个** | **0 个** |
| 含 `sys_tenant` 的 SQL 脚本 | 4 个 | **0 个** |
| 租户相关 Java 文件 | 42 个 | **0 个** |
| 实体基类规范 | `extends TenantEntity` | 官方文档明列为禁止，须 `extends BaseEntity` |

6.x 中唯一出现 `TenantLineInnerInterceptor` 的地方是一段罗列 MyBatis-Plus 可选插件的 **javadoc 注释**，没有对应的 Bean 注册。

**这意味着**：依赖多租户的存量业务无法平迁上游 6.x。

而我们的 **6.x 分支两者都要**——Java 21 + Spring Boot 4.1.0 的运行时跃迁照做，多租户能力完整保留：

| | 上游 5.x | 上游 6.x | 我们 master/workflow | 我们 6.x 分支 |
|---|:---:|:---:|:---:|:---:|
| Spring Boot | 3.5.14 | **4.1.0** | 3.5.16 | **4.1.0** |
| Java | 17 | 21 | 21 | 21 |
| 多租户 | 有 | **无** | **有** | **有** |

需要说明的是，6.x 移除的只有多租户。幂等、限流、SSE、WebSocket 四项**并没有被砍掉**，只是从独立模块合并进了 `common-redis` 与 `common-push`。

### 我们的分支矩阵

| 分支 | Spring Boot | 多租户 | 工作流 |
|------|:---:|:---:|:---:|
| master | 3.5.x | 有 | 无 |
| single | 3.5.x | 无 | 无 |
| workflow | 3.5.x | 有 | 有 |
| 6.x | 4.1.0 | 有 | 有 |
| 6.x-single | 4.1.0 | 无 | 有 |

---

## 十、代码生成器

| 项 | 我们 | 上游 5.x | 上游 6.x |
|----|:---:|:---:|:---:|
| 模板引擎 | Velocity | Velocity | **FreeMarker** |
| 模板文件数 | **19** | 16 | 20 |
| Java 各层 | 有 | 有 | 有 |
| **DAO 接口 + 实现** | **有** | 无 | 无 |
| Mapper + XML | 有 | 有 | 有 |
| TypeScript 类型 + API | 有 | **有** | 有 |
| Vue 列表页 / 树表页 | 有 | 有 | 有 |
| **Vue 主子表子页** | **有** | 无 | 无 |
| React 页面 | 无 | 无 | **有** |
| SQL 菜单脚本（四种库） | 有 | 有 | 有 |
| 移动端 / UniApp 页面 | **不生成** | 不生成 | 不生成 |

配置能力差异：

| 能力 | 我们 | 上游 5.x | 上游 6.x |
|------|:---:|:---:|:---:|
| 单表 / 树表模板 | 有 | 有 | 有 |
| **主子表模板** | **有** | 无 | 无 |
| **菜单自动入库** | **有** | 无 | 无 |
| 菜单图标 / 排序可配 | **有** | 无 | 无 |
| 后端模块名 / 前端根目录可配 | **有** | 无 | 无 |
| 前端框架可选（Vue / React） | 无 | 无 | **有** |

**两点如实说明**：TypeScript 类型与 API 文件的生成**不是我们独有**，上游 5.x 同样具备；我们的生成器**不产出移动端页面**，移动端页面仍需手写。

---

## 十一、管理端前端

上游 6.x 仓库内**不含前端工程**，前端已拆为独立仓库，本次未纳入核实，故本节只与 5.x 对比。

### 体量

| 指标 | 我们 | 上游 5.x |
|------|---:|---:|
| src 代码行数 | **132,172** | 28,185 |
| `.vue` 文件 | **213** | 99 |
| `components/` 下组件 | **77** | 28 |
| API 层 `.ts` 文件 | **89** | 60 |
| Pinia store | 6 个 / 1,877 行 | 7 个 / 756 行 |
| i18n 词条 | **1,507 行 / 50 个命名空间** | 85 行 / 4 个命名空间 |
| 权限指令 | **12 个** | 3 个 |
| 构建插件 | 12 个 | 8 个 |

核心框架版本双方**同代同级**（Vue 3.5 / Vite 6 / Pinia 3 / UnoCSS 66），互有小版本领先，不存在代际差。

### 结构差异

| 维度 | 我们 | 上游 5.x |
|------|------|---------|
| 组合式函数层 | **`composables/` 18 个文件 / ~6,915 行**，且 auto-import 全局注入免 import | `hooks/` 仅 1 个文件，能力散落在 `plugins/`(7) 与 `utils/`(19) |
| 工具函数 | `utils/` 18 文件 / 8,240 行，**纯函数** | `utils/` 19 文件 / 1,517 行，混有状态逻辑 |
| 路由 | 守卫独立 + `modules/` 模块化拆分 | 单个 `router/index.ts` + 根级 `permission.ts` |
| 样式 | 7-1 架构（abstracts / base / components / layout / themes / vendors） | 扁平 8 个 scss |
| 主题 | CSS 变量体系（亮 35 + 暗 46 个变量）+ 五层背景层级 + 切换动画 | 仅 JS 生成 Element Plus 主色梯度 |
| 菜单布局模式 | **4 种**（含双列布局） | 2 种 |
| 图标 | 三源统一 `<Icon>`（iconfont / iconify / 本地 sprite）+ 2,538 行类型声明 | 多套写法并存，无类型 |

### 自研组件

我们 77 个组件中 **69 个是 `A` 前缀的业务级封装**，上游 28 个基本都是「一个目录一个 `index.vue`」的小部件。

| 组件族 | 数量 | 代表 |
|--------|:---:|------|
| 表单封装 `AForm` | 14 | 表格弹窗选择器、高德地图选点、富文本、省市区级联 |
| 卡片模板 `ACard` | 23 | 统计、图表、时间轴、价格、天气等卡片 |
| 图表 `AChart` | 10 | 折线/柱状/双向柱状/饼图/雷达/散点/K线/地图 |
| AI 能力 `AAi` | 4 | 文本润色、测试数据生成、内容审核 |
| 主题视觉 `ATheme` | 5 | 主题色选择、粒子背景、水印 |
| 独立业务组件 | 13 | 通用表格、搜索表单、统一弹窗、详情弹窗、虚拟滚动过滤树、OSS 媒体库、Excel 导入 |

### API 层与代码生成

我们的 API 层采用 `xxxApi.ts` + `xxxTypes.ts` 具名约定，上游统一为 `index.ts` + `types.ts`。

**需要澄清**：上游也为每个模块提供独立类型文件，差异在命名与组织约定，不是「上游没有类型定义」。

我们这套命名是配套基建的产物——`vite/plugins/openapi/`（6 个文件 / 2,384 行）从后端 OpenAPI 文档自动生成 API 与类型文件，具备 MD5 防覆盖（内容变化时生成 `.generated.ts` 参考文件而非覆盖手改代码）、CRUD 七级优先级自动排序、按模块/文件/函数通配忽略。上游无同类插件。

### 互有独占的业务模块

| 我们独有 | 上游独有 |
|---------|---------|
| 商城（商品 / SKU / 订单）、支付配置、广告位、平台配置、账号绑定 | 客户端管理 |
| 字段权限配置页、OpenAPI 密钥管理 | demo 演示模块 |
| 可视化页面设计器（14 文件 / 7,660 行，含 AI 生成与优化） | — |

---

## 十二、移动端

**这是我们 100% 的独有维度。** 上游两个版本的移动端特征文件（`manifest.json`、`pages.json`、`uni.scss`、`*.uvue`、`*.uts`、`@dcloudio/*` 依赖）命中数**均为 0**。上游 5.x 唯一的前端是 PC 管理端 plus-ui，6.x 则是纯后端 Maven 工程。

### 四个移动端工程

| 工程 | 定位 | 技术形态 |
|------|------|---------|
| `plus-uniapp` | **主力工程**：小程序 / H5 / 公众号 / 非原生 APP | Vue3 + TS，Vite CLI 构建 |
| `plus-app` | **原生 APP 专用**（涉及原生插件开发时使用） | Vue3 + TS，HBuilderX 运行打包，含 `nativeplugins/` |
| `plus-uniapp-demo` | **组件演示 + 业务模板库** | 106 个演示页 + 9 类行业模板 |
| `plus-uniappx` | **UniApp X 版本**，编译为纯原生 APP | UTS + UVue（113 个 `.uts` + 115 个 `.uvue`） |

### 技术栈

| 维度 | 版本 |
|------|------|
| UniApp | 3.0.0-4060620250520001 |
| Vue / TypeScript | 3.4.21 / 5.7.2 |
| 状态管理 | Pinia 2.0.36 |
| 构建 | Vite 6.4.2 |
| 样式 | SCSS + UnoCSS 65.4.2 |
| UI 组件库 | **WD UI 101 个组件**（自维护 wot-design-uni 分支，源码内置，内置 15 种语言） |

### 组件库构成（101 个）

| 分类 | 数量 |
|------|:---:|
| 表单 | 28 |
| 展示 | 23 |
| 反馈 | 20 |
| 导航 | 15 |
| 布局 | 8 |
| 基础 | 6 |
| 其他 | 1 |

### 发布平台（18 个）

| 类别 | 平台 |
|------|------|
| Web | H5 |
| 小程序（11） | 微信、支付宝、百度、QQ、字节跳动、京东、快手、飞书、小红书、鸿蒙元服务 |
| APP（4） | app、android、ios、**鸿蒙** |
| 快应用（3） | webview、华为、联盟 |

---

## 十三、AI 与物联网

| 能力 | 我们 | 上游 5.x | 上游 6.x |
|------|------|:---:|------|
| AI 框架 | **LangChain4j 1.14.1 自建**（30 个类） | 无 | Snail AI（第三方闭源组件，本体仅 2 个类的开关壳） |
| 模型支持 | DeepSeek / 通义千问 / Claude / OpenAI / Ollama | — | 依赖第三方组件 |
| 会话记忆 | **有**（Redis 存储） | — | 依赖第三方组件 |
| RAG 知识库 | **有**（memory / Milvus / PGVector） | — | 依赖第三方组件 |
| 流式对话 | **有**（WebSocket） | — | 依赖第三方组件 |
| MQTT 物联网 | **有** | 无 | 有 |
| RocketMQ 消息队列 | **有** | 无 | 无 |

**路线差异**：6.x 的 AI 能力绑定在闭源商业组件上，模块本身不含任何 AI 逻辑；我们的实现全部开源自建，模型工厂、会话记忆、RAG 检索链路都可改可控。

### AI 上下文工程

三方**都提供了 Claude Code 配置**，差异是覆盖深度而非有无：

| 项 | 我们 | 上游 5.x | 上游 6.x |
|----|:---:|:---:|:---:|
| 专业技能 | **61** | 35 | 44 |
| 智能命令 | **19** | 10 | 6 |
| 自动化钩子 | 3 | 3 | 3 |
| `CLAUDE.md` 体积 | **28 KB** | 7 KB | — |
| `AGENTS.md` 体积 | **78 KB** | 29 KB | — |

---

## 十四、数据库与运维

三方的数据库支持枚举**完全一致**：MySQL / Oracle / PostgreSQL / SQL Server。三方**均不支持达梦与人大金仓**。

| 项 | 我们 | 上游 5.x | 上游 6.x |
|----|:---:|:---:|:---:|
| 建库脚本（每种库） | **6 个** | 3 个 | 3~4 个 |
| 升级脚本组织方式 | **按功能**（21 个文件，四库 × 5 类功能） | 按版本号（50 个） | **无 update 目录** |
| 数据库备份 / 恢复脚本 | **有** | 无 | 无 |
| Docker 编排文件 | **6 个**（完整版 / 数据库 / 监控 / RocketMQ / 应用 / SnailJob） | 2 个 | 2 个 |

---

## 十五、选型建议

### 选上游 RuoYi-Vue-Plus 5.x

- 需要 **MIT 协议**、完全开源可商用、不接受授权费用
- 只做 PC 管理端，没有移动端需求
- 不需要支付、微信生态、AI 能力
- 希望依托 Dromara 社区生态与活跃度

### 选上游 RuoYi-Vue-Plus 6.x

- 想尽早用上 **Spring Boot 4 + JDK 21** 技术栈
- **不需要多租户**（这是硬前提）
- 需要子查询 / 联表的 Java 侧链式构建
- 需要 React 前端代码生成
- 接受前端在独立仓库维护

### 选 RuoYi-Plus-UniApp

- 需要 **PC 管理端 + 移动端全栈**一套交付（小程序 / H5 / APP / 鸿蒙）
- 需要**开箱即用的支付能力**（微信 / 支付宝 / 银联 / 余额）
- 需要微信小程序、公众号深度集成
- 需要**列级字段权限**（同一记录按角色控制字段可见可改）
- 需要**等保二级**合规支撑（密码策略、日志归档、备份恢复）
- 需要自建可控的 **AI 能力**而非绑定第三方闭源组件
- 需要 **Spring Boot 4 与多租户兼得**
- 能接受闭源授权模式

### 三者共同具备

Sa-Token 认证与权限注解、JustAuth 三方登录、Redisson 缓存与分布式锁、MyBatis-Plus ORM 与多数据源、SnailJob 分布式任务调度、数据脱敏与加解密、接口传输加密、行级数据权限、Excel 导入导出、SpringDoc 接口文档、国际化、Docker 部署、四种关系数据库支持、Warm-Flow 工作流（我们的 workflow / 6.x 分支）。

这些能力来自上游多年的积累，选任何一方都能得到。
