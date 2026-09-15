# 字段权限最佳实践

## 概述

字段权限（列级隔离）解决的是数据权限解决不了的那一半问题：数据权限决定「一个用户能看到哪些行」，字段权限决定「同一行里，他能看到和改动哪些列」。

典型诉求是这样的：人事专员和部门主管都能查到同一批员工记录（行级权限一致），但只有人事专员能看到身份证号原值，主管看到的是打码值，普通员工连这个字段都不该出现；而所有人都能看到手机号，只有人事专员改得动。这类需求用行级数据权限无法表达，用「给字段加个 `@Sensitive` 注解」也不行——注解是编译期固定的，做不到「同一个字段对不同人不同表现」。

RuoYi-Plus 的字段权限用一个注解声明资源归属，用「字段 × 主体」矩阵配置授权，在四个数据出口统一收口。核心设计目标是：**同一个用户在页面上看不到的字段，导出也导不出、写入也改不了、Excel 导进去也覆盖不掉**。

### 核心特性

- **四档访问控制** - 隐藏 / 脱敏 / 只读 / 可写，覆盖「不给看」「给看但打码」「给看不给改」「全开」四种真实诉求
- **三种授权主体** - 角色、部门（可含子部门）、用户，一张表覆盖三种粒度
- **四出口统一收口** - JSON 序列化、Excel 导出、JSON 写入、Excel 导入共用同一个决策服务，语义严格一致
- **注解声明资源** - 开发者在 VO/BO 上加一行 `@FieldResource`，管理端自动出现该资源及其字段，无需任何人接触全限定类名
- **只存差异行** - 与「注解基线」相同的配置不落库，一个 20 字段 × 30 角色的资源通常只有个位数配置行
- **最宽松合并** - 多主体命中时逐字段取最宽松档位，与 `@DataPermission` 的多角色 OR 语义保持一致
- **效果预览** - 按真实用户走与运行期完全相同的合并逻辑，配完即可验证「张三到底看得到什么」
- **收权后果计数** - 显式告知「把这个字段收紧后，还有多少人因其他主体仍能看到」
- **一键总开关** - `field-permission.enabled=false` 让四个出口全部旁路，已配权限保留在库，重开即恢复
- **零开销旁路** - 未标注解的类在 Jackson 侧按类判定一次并永久缓存，后续序列化根本不进入拦截逻辑

### 与数据权限的关系

两套机制互相正交，常常叠加使用：

| 维度 | 数据权限（行级） | 字段权限（列级） |
|------|-----------------|-----------------|
| 控制对象 | 哪些**记录**可见 | 同一记录里哪些**列**可见可改 |
| 实现层 | MyBatis-Plus 拦截器，改写 SQL | 序列化层 / 反射层，改写出参入参 |
| 注解 | `@DataPermission` + `@DataColumn` | `@FieldResource` |
| 授权主体 | 角色（`sys_role.data_scope`） | 角色 / 部门 / 用户 |
| 多主体语义 | 多角色取并集（OR） | 多主体逐字段取最宽松 |
| 超管行为 | 旁路，不过滤 | 旁路，全部可写 |
| 生效范围 | 走 MyBatis 的查询 | JSON 出入参、Excel 导入导出 |

一句话区分：数据权限决定「这一行给不给你」，字段权限决定「给了你这一行之后，这一行长什么样」。

### 适用场景

| 场景 | 配置方式 | 效果 |
|------|---------|------|
| 敏感信息分级 | 身份证字段：人事角色可写，主管角色脱敏，其他角色隐藏 | 同一列表页，三种角色看到三种形态 |
| 合规脱敏 | 手机号带 `@Sensitive`，给客服角色显式放权为可写 | 默认全员打码，客服看原值 |
| 防导出泄露 | 字段设为隐藏档 | Excel 导出整列消失，连表头都不留 |
| 只读字段保护 | 工号设为只读档 | 页面可见但提交被忽略，且响应里明确告知 |
| 部门级授权 | HR 部门设为可写，勾选含子部门 | 整个 HR 条线（含下级部门）继承该授权 |
| 临时例外授权 | 对某个用户单独放权 | 不必为一个人新建角色 |

## 架构设计

### 整体架构

```text
┌──────────────────────────────────────────────────────────────────────┐
│                          契约层 (ruoyi-common-core)                   │
│   @FieldResource      FieldAccess       FieldClassType    SubjectType │
│   (资源标记注解)       (四档枚举)         (类角色枚举)      (主体枚举)   │
│                                                                       │
│   IFieldPermissionService      FieldPermissionHelper                  │
│   (决策服务接口，四出口唯一入口)  (请求级 ThreadLocal 上下文)            │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ 四个出口都只依赖 core
      ┌─────────────────┬───────┴────────┬─────────────────┐
      ▼                 ▼                ▼                 ▼
┌───────────┐    ┌────────────┐   ┌────────────┐   ┌─────────────┐
│ 出口 A    │    │  出口 B    │   │  出口 C-1  │   │  出口 C-2   │
│ JSON 读   │    │ Excel 导出 │   │ JSON 写入  │   │ Excel 导入  │
│           │    │            │   │            │   │             │
│ sensitive │    │   excel    │   │    web     │   │    excel    │
│ 模块      │    │   模块     │   │   模块     │   │    模块     │
│           │    │            │   │            │   │             │
│Serializer │    │ExcelSensi- │   │FieldWrite- │   │FieldPermis- │
│Modifier + │    │tiveHelper  │   │GuardAspect │   │sionExcel-   │
│Property-  │    │maskList /  │   │(@Request-  │   │Listener     │
│Writer     │    │exclude...  │   │ Body 切面) │   │(逐行装饰)   │
└─────┬─────┘    └─────┬──────┘   └─────┬──────┘   └──────┬──────┘
      └────────────────┴────────────────┴─────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     决策层 (ruoyi-system)                             │
│   SysFieldPermissionServiceImpl                                       │
│     ├─ 合并角色差异行 + 部门链差异行 + 用户本人差异行（逐字段取最宽松）  │
│     ├─ 回落注解基线（带 @Sensitive 的字段基线为脱敏）                   │
│     └─ 结果落 ThreadLocal，同请求同资源只算一次                        │
│                                                                       │
│   SysFieldMatrixServiceImpl (管理端矩阵/预览/收权计数)                 │
│   FieldResourceScanner      (启动扫描注解，登记资源并算基线)            │
└───────────────────────────────┬──────────────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          存储层                                       │
│   sys_field_resource        资源注册表     （系统级，无 tenant_id）    │
│   sys_field_resource_class  类绑定表       （系统级，无 tenant_id）    │
│   sys_field_permission      权限配置表     （租户级）                  │
│                                                                       │
│   Redis：差异行缓存 / 注解基线缓存 / 类反查缓存 / 已配置资源集合        │
└──────────────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 职责 | 所在模块 |
|------|------|---------|
| `@FieldResource` | 标在 VO/BO/ImportVo 上，声明类归属哪个资源 | ruoyi-common-core |
| `FieldAccess` | 四档访问枚举（隐藏 0 / 脱敏 1 / 只读 2 / 可写 3） | ruoyi-common-core |
| `FieldClassType` | 类角色枚举（VO 1 / BO 2 / IMPORT 3） | ruoyi-common-core |
| `SubjectType` | 授权主体枚举（角色 1 / 部门 2 / 用户 3） | ruoyi-common-core |
| `IFieldPermissionService` | 四出口共用的唯一决策入口 | ruoyi-common-core |
| `FieldPermissionHelper` | 请求级 ThreadLocal 上下文（快照 / 策略 / 被忽略字段） | ruoyi-common-core |
| `FieldPermissionSerializerModifier` | Jackson 序列化拦截，包装 PropertyWriter | ruoyi-common-sensitive |
| `FieldPermissionPropertyWriter` | 逐属性判档，决定隐藏 / 打码 / 明文 | ruoyi-common-sensitive |
| `ExcelSensitiveHelper` | 导出脱敏副本、整列排除、导入拦截 | ruoyi-common-excel |
| `FieldPermissionExcelListener` | 装饰业务 Listener，逐行拦截导入数据 | ruoyi-common-excel |
| `FieldWriteGuardAspect` | `@RequestBody` 写入切面，无权字段置 null | ruoyi-common-web |
| `FieldWriteGuardAdvice` | 把被忽略字段追加到响应 `msg` | ruoyi-common-web |
| `FieldPermissionContextFilter` | 请求结束清理 ThreadLocal | ruoyi-common-web |
| `SysFieldPermissionServiceImpl` | 运行期判档实现，多主体合并 | ruoyi-system |
| `SysFieldMatrixServiceImpl` | 管理端矩阵读写、效果预览、收权计数 | ruoyi-system |
| `FieldResourceScanner` | 启动扫描注解，登记资源、算注解基线、巡检漏标 | ruoyi-system |
| `FieldMetaResolver` | 反射解析字段元数据（中文标签、是否带注解） | ruoyi-system |

### 为什么契约放在 core

这是一个被依赖层级逼出来的决定。项目实际的模块依赖是 `core ← json ← {excel, sensitive, web}`。JSON 出口的序列化器住在 sensitive 模块，如果把 `IFieldPermissionService` 接口放在 sensitive，excel 和 web 都要反向依赖 sensitive，而 sensitive 本身依赖 json——会直接撞成循环依赖。

放在最底层的 core 就没有这个问题：core 里只有纯接口和枚举，不引任何第三方类，不会把这个所有模块都依赖的底层模块拖重。四个出口模块各自依赖 core 拿到契约，实现类留在 ruoyi-system。

同理，`@FieldResource` 注解也必须放在 core——VO/BO 遍布 system 与全部业务模块，注解必须落在所有模块都能依赖的最底层。

### 执行流程

以一次带敏感字段的列表查询为例：

```text
1. 用户请求 GET /system/user/list
       │
       ▼
2. 业务查询返回 List<SysUserVo>
       │
       ▼
3. Jackson 序列化 SysUserVo
       │
       ├── 该类首次序列化 → changeProperties 判断是否标了 @FieldResource(type=VO)
       │     ├── 未标 → 原样返回属性列表，该类后续序列化永不再进入拦截器
       │     └── 已标 → 每个属性包装成 FieldPermissionPropertyWriter（结果被 Jackson 永久缓存）
       │
       ▼
4. 逐属性写出，每个属性调 getDecision(resourceKey, fieldName)
       │
       ├── ThreadLocal 已有该资源快照 → 直接取（同请求同资源只算一次）
       │
       └── 首次 → 走决策合并：
             ├── 全局开关关 / 超管 / 未登录 → 空快照（无动态决策）
             ├── 「已配置资源集合」不含该资源 → 跳过主体查询，只用注解基线
             └── 命中 → 合并角色差异行 + 部门链差异行 + 用户本人差异行（逐字段取最宽松）
                        再用注解基线补齐未覆盖的字段，落 ThreadLocal
       │
       ▼
5. 按档位写出：
       ├── 无动态决策(null) → 原样委派，@Sensitive / @SerialMap 照常生效
       ├── HIDDEN   → 整个属性不写出，JSON 里没有这个 key
       ├── MASKED   → 按策略打码（String）/ 写 null（非 String）
       └── READONLY / WRITABLE → 明文；带 @Sensitive 时覆盖注解直接写原值
       │
       ▼
6. 响应返回
       │
       ▼
7. FieldPermissionContextFilter 在 finally 中清理 ThreadLocal
```

## 四档访问档位

### FieldAccess 枚举

四档对应四种真实诉求，数值越大越宽松：

| 档位 | 存库值 | 含义 | JSON 表现 | Excel 导出表现 | 写入表现 |
|------|--------|------|----------|---------------|---------|
| `HIDDEN` | `0` | 隐藏 | 无该 key | 整列消失（含表头） | 提交被忽略 |
| `MASKED` | `1` | 脱敏 | 值打码 | 值打码 | 提交被忽略 |
| `READONLY` | `2` | 只读 | 明文 | 明文 | 提交被忽略 |
| `WRITABLE` | `3` | 可写 | 明文 | 明文 | 正常写入 |

```java
public enum FieldAccess {
    /** 隐藏：字段整个不下发。JSON 无该 key、Excel 无该列 */
    HIDDEN(0, "隐藏"),
    /** 脱敏：值打码，不可改 */
    MASKED(1, "脱敏"),
    /** 只读：可读，写入时提交的改动被忽略 */
    READONLY(2, "只读"),
    /** 可写：无限制。无 @Sensitive 字段的默认档，表里不落行 */
    WRITABLE(3, "可写");

    private final int code;
    private final String label;

    /** 两档取更宽松者 */
    public static FieldAccess looser(FieldAccess a, FieldAccess b) {
        if (a == null) {
            return b;
        }
        if (b == null) {
            return a;
        }
        return a.code >= b.code ? a : b;
    }

    /** 是否允许写入 */
    public boolean isWritable() {
        return this == WRITABLE;
    }

    /** 是否允许读到原值（隐藏 / 脱敏都不算） */
    public boolean isReadable() {
        return this == READONLY || this == WRITABLE;
    }
}
```

### 为什么隐藏档不是写 null

这是一个刻意的设计选择。隐藏档下 JSON 里**连 key 都没有**，而不是 `"idCard": null`：

- 写 null 会让前端分不清「无权限」与「这个人确实没填身份证」，两种情况需要的界面提示完全不同
- 写 null 仍然暴露了字段名的存在——攻击者据此知道系统里有这个字段
- `@Sensitive` 的 `CLEAR_TO_NULL` 策略早就能把值变成 null，字段权限要补的正是「彻底消失」这一档

Excel 导出侧同理：隐藏档是整列消失（靠 FastExcel 的 `excludeColumnFieldNames`），而不是留一列空白。留下空列等于告诉使用者「这里有个字段但不给你看」，仍然泄露了字段存在性。

### 数组形态的例外

当 VO 用 `@JsonFormat(shape = ARRAY)` 序列化成数组时，元素靠**位置**对应，省略某个元素会让后续字段全部错位。因此这种形态下：

- 隐藏档写 `null` 占位，而不是省略
- 无法打码的脱敏档（非 String）同样写 `null`

这是载体差异，不是语义分歧——对象形态该消失的字段，在数组形态里也拿不到原值。

### 为什么脱敏档也不许写入

看起来「脱敏」只是读的限制，但写入侧必须一并拦截：用户在页面上看到的是掩码串（如 `138****8000`），如果允许提交，这个掩码串会被原样写进数据库，把真实手机号覆盖掉。拒绝写入比允许写入更安全，所以只读、脱敏、隐藏三档统一不允许写。

## 授权主体与合并规则

### 三种主体粒度

一张 `sys_field_permission` 表用 `subject_type + subject_id` 覆盖三种粒度，不必为部门另建表：

```java
public enum SubjectType {
    /** 角色：主力粒度，复用 sys_role */
    ROLE("1", "角色"),
    /** 部门：如"整个 HR 部门能看身份证"，配合 include_sub 支持含子部门 */
    DEPT("2", "部门"),
    /** 用户：临时 / 例外授权 */
    USER("3", "用户");
}
```

| 主体 | 典型用法 | 说明 |
|------|---------|------|
| 角色 | 「人事专员可写身份证」 | 最常用，随角色分配自动生效 |
| 部门 | 「HR 部门及其下级可看身份证」 | 勾选 `include_sub` 后沿部门树向下继承 |
| 用户 | 「给临时借调的张三开个口子」 | 例外授权，不必为一个人新建角色 |

### 部门链的继承规则

部门主体的合并比另外两种复杂一层，因为存在祖先继承：

- **本部门**：该部门下的**全部**差异行都参与合并，无论 `include_sub` 取值
- **祖先部门**：沿 `sys_dept.ancestors` 逐级向上，**只取 `include_sub = 1` 的行**

也就是说，给「技术中心」配了 `include_sub = 1` 的授权，其下所有子部门的用户都继承；配成 `include_sub = 0` 则只有直属技术中心的用户生效。

`ancestors` 字段格式为 `0,100,101`，其中 `0` 是根占位会被跳过。遇到脏数据（非数字段）会静默跳过该段，不让一个坏 `ancestors` 拖垮整个决策。

### 最宽松合并语义

一个用户往往同时命中多个主体：他可能有 3 个角色、属于某个部门（还继承了 2 层祖先部门的配置）、外加一条个人授权。这些配置逐字段合并，**取最宽松的那一档**（可写 > 只读 > 脱敏 > 隐藏）。

```java
private void mergeAllSubjects(Map<String, FieldAccess> merged, Map<String, String> strategies,
                              String resourceKey, List<Long> roleIds, Long deptId, Long userId,
                              SubjectType excludeType, Long excludeId) {
    ISysFieldPermissionService proxy = SpringUtils.getAopProxy(this);
    // 角色
    if (roleIds != null) {
        for (Long roleId : roleIds) {
            mergeRows(merged, strategies, proxy.loadSubjectRows(SubjectType.ROLE, roleId, resourceKey), true);
        }
    }
    // 部门链：本部门全部行；祖先部门只取 include_sub=1 的行
    if (deptId != null) {
        mergeRows(merged, strategies, proxy.loadSubjectRows(SubjectType.DEPT, deptId, resourceKey), true);
        for (Long ancestor : ancestorDeptIds(deptId)) {
            mergeRows(merged, strategies, proxy.loadSubjectRows(SubjectType.DEPT, ancestor, resourceKey), false);
        }
    }
    // 用户本人
    if (userId != null) {
        mergeRows(merged, strategies, proxy.loadSubjectRows(SubjectType.USER, userId, resourceKey), true);
    }
}
```

**为什么是最宽松而不是最严格**：这与 `@DataPermission` 的多角色 OR 语义保持一致。取交集（最严格）会导致「角色越多看得越少」的反直觉结果——给一个人多加一个角色反而让他丢失了原有权限，这在运维上几乎无法解释。授权是加法，这是权限系统的通行约定。

**代价是收权困难**：既然是取最宽松，那么给某个角色把字段设成隐藏，对同时兼任其他角色的用户**完全无效**，而管理员在配置页上看不出任何异常。这是本机制最容易踩的坑，所以配置页专门做了两件事：常驻 alert 说明合并语义，以及单元格右上角的 `⚠ N` 角标——直接告诉你「收紧后还有 N 个人因其他主体仍能看到」。

### 脱敏策略的跟随规则

档位只说「要打码」，不说「怎么打」。脱敏策略（`SensitiveStrategy` 枚举名，如 `PHONE`、`ID_CARD`）跟着**最终生效的那条配置**走：

- 合并过程中某条配置成为最宽松档，它的策略被采用
- 如果最终档位被放宽到可写，策略无意义，会被清掉
- 无配置（走注解基线）时策略为 null，由出口回落到字段自身 `@Sensitive` 的策略
- 再取不到则用通用掩码 `STRING_MASK`

### 旁路规则

以下三种情况一律返回空快照（等同于「无动态决策」，字段注解照常生效）：

| 情况 | 原因 |
|------|------|
| `field-permission.enabled = false` | 全局开关关闭，一键回退到无字段权限 |
| 超级管理员 | 与数据权限一致，超管旁路；配置页会把超管列渲染成不可编辑的「全权」 |
| 未登录（无 `LoginUser`） | 定时任务、消息消费等系统行为没有「人」，字段权限只约束人 |

超管旁路这一条在配置页上必须显式呈现，否则管理员会对着超管列配半天，上线才发现没生效；更糟的是可能把自己锁死。

## 资源与类绑定

### @FieldResource 注解

字段权限的配置单元是「资源」，一个资源通常对应一个业务实体（如 `system:user`）。资源标识与菜单权限前缀保持一致，管理员一看就懂。

```java
// 读出口 VO，默认 type = VO
@FieldResource("system:user")
public class SysUserVo implements Serializable { }

// 导出 VO，必须与 SysUserVo 绑同一资源
@FieldResource("system:user")
public class SysUserExportVo implements Serializable { }

// 写入口 BO
@FieldResource(value = "system:user", type = FieldClassType.BO)
public class SysUserBo extends BaseEntity { }

// 导入 ImportVo
@FieldResource(value = "system:user", type = FieldClassType.IMPORT)
public class SysUserImportVo implements Serializable { }
```

### 三种类角色

同一个资源会对应多个类：读出口 VO、写入口 BO、导入 ImportVo。类角色决定该类被哪个出口消费——**只登记 VO 会让写入口和导入口成为绕过通道**。

```java
public enum FieldClassType {
    /** 读出口 VO：JSON 序列化、Excel 导出按此类判档 */
    VO("1", "读出口VO"),
    /** 写入口 BO：@RequestBody 写入拦截按此类反查资源 */
    BO("2", "写入口BO"),
    /** 导入 ImportVo：Excel 导入拦截按此类反查资源 */
    IMPORT("3", "导入ImportVo");
}
```

| 类角色 | 消费出口 | 漏标后果 |
|--------|---------|---------|
| VO | JSON 序列化、Excel 导出 | 页面 / 导出明文外泄 |
| BO | `@RequestBody` 写入拦截 | 页面上改不动的字段，调接口能改 |
| IMPORT | Excel 导入拦截 | 做一张 Excel 导进去就能改 |

`sys_user` 实测有 7 个 VO。只绑一个 VO，走导出 VO 的接口就会明文外泄——这正是为什么 `SysUserExportVo` 必须与 `SysUserVo` 绑同一资源。

### 标注约定

| 情况 | 是否标注 | 原因 |
|------|---------|------|
| 读出口 VO | ✅ 必须 | 否则 JSON / 导出不受保护 |
| 导出专用 VO | ✅ 必须 | 与主 VO 绑同一资源，否则形成绕过后门 |
| 写入口 BO | ✅ 必须 | 否则写入拦截反查不到资源 |
| 导入 ImportVo | ✅ 必须 | 导入走 `@RequestPart`，不经写入切面 |
| 嵌套 VO（如 `SysUserInfoVo` 内含 `SysUserVo user`） | ❌ 不标 | Jackson 序列化嵌套对象时走内层类自己的序列化器，自动继承保护 |
| 字段语义不同的同表 VO | ⚠️ 标不同资源 | `SysUserOnlineVo` 的 `ipaddr` 与 `SysUserVo` 的 `loginIp` 语义不同，硬凑会配错 |

一个类只能归属一个资源（库表 `uk_class_name` 唯一约束），重复标注以后者为准并在启动日志 WARN。

### 为什么用注解而不是后台手填类名

管理端**刻意不提供资源的新增 / 删除接口**，资源与类绑定完全由注解扫描独占维护。理由有三条：

1. **不给绕过后门开口子**：序列化层按注解值反查资源，如果管理员在后台把资源标识改成别的，配置就挂在了一个永远不会被命中的 key 上，字段**静默**变成「无动态决策」而放行——没有任何报错
2. **漏绑可检测**：开发者写新模块加一行注解，管理端自动出现该资源及其字段；漏绑从「上线检查项」变成「grep 一下就看得出」
3. **随代码走而不是随租户走**：类归属是代码结构元数据，新租户开通即受保护，不需要为每个租户重新登记

管理端只保留两个能力：查资源树（配置页左树）、改元信息（中文名 / 分组 / 排序 / 状态 / 备注）。

### 启动扫描器

`FieldResourceScanner` 实现 `ApplicationRunner`，启动时扫描 `plus.ruoyi` 包下所有标了 `@FieldResource` 的类，完成四件事：

```java
private void doScan() {
    Set<Class<?>> annotated = ClassUtil.scanPackageByAnnotation(SCAN_PACKAGE, FieldResource.class);

    Map<String, List<Class<?>>> voByResource = new LinkedHashMap<>();
    List<String> scannedClassNames = new ArrayList<>();
    int createdResources = 0;

    for (Class<?> clazz : annotated) {
        FieldResource fr = clazz.getAnnotation(FieldResource.class);
        String resourceKey = fr.value().trim();
        if (resourceKey.isEmpty()) {
            log.warn("字段权限：{} 的 @FieldResource 未填资源标识，跳过", clazz.getName());
            continue;
        }
        boolean created = fieldResourceService.registerFromAnnotation(resourceKey, clazz.getName(), fr.type());
        if (created) {
            createdResources++;
        }
        scannedClassNames.add(clazz.getName());
        if (fr.type() == FieldClassType.VO) {
            voByResource.computeIfAbsent(resourceKey, k -> new ArrayList<>()).add(clazz);
        }
    }

    int retired = fieldResourceService.retireMissingAutoBindings(scannedClassNames);
    writeBaselines(voByResource);
    Map<String, String> classResource = fieldResourceService.reloadClassResourceCache();

    log.info("字段权限资源扫描完成：{} 个类 / 新增资源 {} 个 / 失效绑定 {} 行 / 类反查缓存 {} 条",
        annotated.size(), createdResources, retired, classResource.size());

    if (scanAudit) {
        auditUnregistered(annotated);
    }
}
```

四件事分别是：

| 步骤 | 动作 | 说明 |
|------|------|------|
| 1 | 登记资源与类绑定 | 资源已存在则只补绑定，不覆盖管理员改过的中文名 |
| 2 | 算注解基线写入 Redis | 带 `@Sensitive` 的字段基线为脱敏，其余可写 |
| 3 | 逻辑删除本次未扫到的自动绑定 | 代码里删了注解后重启，配置追溯仍保留 |
| 4 | 巡检漏标类并 WARN | 列出 `domain` 包下未标注解的 `*Vo` / `*Bo` |

资源中文名会按 `resource_key` 反查 `sys_menu.menu_name` 自动填充，管理员可再改。

**为什么基线必须在启动期算**：基线来自反射（判断字段有没有 `@Sensitive`），而热路径严格禁止反射，只能在启动期一次算完写进缓存。

**整个扫描包在 try/catch 里**：表未建、Redis 未起等情况只记 ERROR 不拖垮启动——字段权限是增强能力，不该让它的元数据登记失败阻断整个系统。此时会打印明确的告警：

```text
字段权限资源扫描失败，字段权限将按「未登记 = 放行」运行。
请确认 sys_field_resource 系列表已建、Redis 可用
```

### 漏标巡检

扫描器顺带做一次巡检，列出 `domain` 包下所有以 `Vo` / `Bo` 结尾但未标注解的类：

```text
字段权限巡检：12 个 VO/BO 未标 @FieldResource
（嵌套 VO 可忽略；导出/导入 VO 漏标即为绕过通道）：[...]
```

只 WARN 不阻断——嵌套 VO 本就不该标，机器分不清「漏标」和「故意不标」，交给人判断。大项目可用 `field-permission.scan-audit=false` 关掉（巡检要加载 `domain` 包下全部类）。

## 注解基线与差异行

### 只存差异行

`sys_field_permission` 表**只存与「注解基线」不同的配置行**。基线规则很简单：

| 字段情况 | 注解基线档位 |
|---------|-------------|
| 带 `@Sensitive` 且为 String 类型 | 脱敏（MASKED） |
| 其余全部字段 | 可写（WRITABLE） |

这样一个 20 字段 × 30 角色的资源，理论上有 600 个格子，实际通常只落个位数行。矩阵接口也只返回差异格，前端按 `fieldName + subjectId` 索引，未命中即渲染为基线档位。

### 为什么基线不是固定可写

如果基线一律按可写算，「`phone` 带 `@Sensitive` 注解，想让 HR 角色看明文」这个需求就配不出来：管理员在矩阵里把 HR 那格配成可写，系统发现「与基线相同」于是不落行，运行期走注解兜底，HR 永远看到掩码——配了但没生效，且毫无提示。

基线按「带注解 = 脱敏」计算之后，把 HR 配成可写就是一条真实的差异行，出口据此**覆盖**注解输出明文。

### getDecision 与 getAccess 的区别

这是使用决策服务时最容易搞混、也最关键的一点：

```java
/**
 * 取字段的动态决策档位，无动态决策时返回 null
 * - 返回 null = 没有任何动态决策 → 出口应原样放行，字段自身的 @Sensitive 照常生效
 * - 返回 WRITABLE = 管理员显式放权 → 出口应覆盖 @Sensitive 输出明文
 */
FieldAccess getDecision(String resourceKey, String fieldName);

/**
 * 当前登录用户对某资源某字段的最终档位，永不为 null
 * 无动态决策时回落基线
 */
FieldAccess getAccess(String resourceKey, String fieldName);
```

| 方法 | 返回值 | 适用场景 |
|------|--------|---------|
| `getDecision` | 可能为 null | 出口判断「要不要覆盖注解行为」 |
| `getAccess` | 永不为 null | 只需要知道「最终档位是什么」 |

判「要不要覆盖注解」必须用 `getDecision`（或快照的 `containsKey`），判「档位是什么」用 `getAccess`。混用会导致两类典型 bug：

- 用 `getAccess` 判覆盖：无配置的字段返回 WRITABLE，被误认为「显式放权」，于是覆盖掉 `@Sensitive` 输出明文——脱敏整条失效
- 用 `getDecision` 判档位：null 被当成某个具体档位处理，行为不可预期

### 快照语义

`getSnapshot(resourceKey)` 返回 `Map<String, FieldAccess>`，但**只含有动态决策的字段**，包括显式放权为 WRITABLE 的字段。快照里没有的字段表示「无动态决策」，出口回落到字段自身注解的行为。

```java
/** 热路径：一次 ThreadLocal Map 查询 */
@Override
public FieldAccess getDecision(String resourceKey, String fieldName) {
    return getSnapshotInternal(resourceKey).get(fieldName);
}
```

## 四个出口详解

四个出口是字段权限的实际执行点。核心约束是**语义必须一致**：同一用户在页面看不到的字段，导出也导不出、写入也改不了。任何一个出口漏做，都会形成一条完整的绕过通道。

### 出口 A：JSON 读（序列化）

实现在 ruoyi-common-sensitive 模块，由 `BeanSerializerModifier` 把标了注解的类的全部属性包装成自定义 `PropertyWriter`。

```java
@Override
public List<BeanPropertyWriter> changeProperties(SerializationConfig config, BeanDescription beanDesc,
                                                 List<BeanPropertyWriter> beanProperties) {
    FieldResource resource = beanDesc.getBeanClass().getAnnotation(FieldResource.class);
    // 未标注解、或不是读出口 VO → 原样返回，该类后续序列化不再进入本拦截器
    if (resource == null || resource.type() != FieldClassType.VO) {
        return beanProperties;
    }
    String resourceKey = resource.value();
    if (resourceKey == null || resourceKey.isBlank()) {
        log.warn("字段权限：{} 的 @FieldResource 未填资源标识，JSON 出口不拦截", beanDesc.getBeanClass().getName());
        return beanProperties;
    }

    List<BeanPropertyWriter> wrapped = new ArrayList<>(beanProperties.size());
    for (BeanPropertyWriter writer : beanProperties) {
        AnnotatedMember member = writer.getMember();
        SerialMapInfo info = resolveSerialMap(member);
        wrapped.add(new FieldPermissionPropertyWriter(writer, resourceKey, info.sourceField(), info.present()));
    }
    return wrapped;
}
```

**未标注解的类是真正的零开销**：`changeProperties` 是 Jackson 按类调用一次、结果被永久缓存的方法。未标注解的类直接原样返回，之后的每次序列化根本不进这段代码——不是「开销小」，是后续请求完全不经过。

**为什么读注解而不查库**：查库会带来启动顺序依赖。若某次序列化早于扫描器完成，Jackson 会把该类永久缓存成「未注册」，留下一个直到重启才消失的放行缺口。读注解没有这个时序问题，也不产生任何 IO。

逐属性写出的判档逻辑：

```java
@Override
public void serializeAsField(Object bean, JsonGenerator gen, SerializerProvider prov) throws Exception {
    IFieldPermissionService service = service();
    if (service == null) {
        super.serializeAsField(bean, gen, prov);
        return;
    }
    // 派生字段联动：源字段被隐藏时，由它派生的本属性也隐藏
    if (isSourceHidden(service)) {
        return;
    }
    FieldAccess decision = service.getDecision(resourceKey, fieldName);
    if (decision == null) {
        // 无动态决策：原样委派，@Sensitive / @SerialMap 照常生效
        super.serializeAsField(bean, gen, prov);
        return;
    }
    switch (decision) {
        case HIDDEN -> {
            // 整个属性不写出：JSON 里没有这个 key
        }
        case MASKED -> writeMasked(bean, gen, service);
        case READONLY, WRITABLE -> {
            if (shouldOverrideAnnotation()) {
                writePlain(bean, gen, prov);
            } else {
                super.serializeAsField(bean, gen, prov);
            }
        }
        default -> super.serializeAsField(bean, gen, prov);
    }
}
```

#### 与 @SerialMap 的派生联动

`@SerialMap(source = "userId")` 表示本属性的值派生自 `userId`（典型用法是 ID 转名称）。如果 `userId` 被隐藏而派生属性照常输出，就等于开了一条派生泄露通道，因此需要联动：源字段被隐藏时，派生属性也隐藏。

反过来，带 `@SerialMap` 的字段**不做「覆盖注解写原值」**：`@SerialMap` 是展示转换（ID→名称）而非安全控制，绕过它会输出原始 ID，属于改坏不是放权。

解析 `@SerialMap` 用的是字符串反射匹配而不是直接 import——sensitive 模块不依赖 serialmap 模块，为一个防御性联动引入重量级模块依赖不划算。解析只在 `changeProperties` 期做一次（按类缓存），不进逐字段热路径。

#### 注册方式

```java
@AutoConfiguration
@ConditionalOnProperty(prefix = "field-permission", name = "enabled", havingValue = "true", matchIfMissing = true)
public class FieldPermissionJacksonAutoConfiguration {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer fieldPermissionCustomizer() {
        return builder -> builder.postConfigurer(objectMapper -> {
            objectMapper.setSerializerFactory(
                objectMapper.getSerializerFactory().withSerializerModifier(new FieldPermissionSerializerModifier()));
            log.info("字段权限 JSON 出口已启用");
        });
    }
}
```

这里用 `postConfigurer` 而不是 `builder.modules(...)`：后者是**替换**语义，与 `JsonAutoConfiguration` 里已有的 `builder.modules(javaTimeModule)` 会互相覆盖。`postConfigurer` 作用在构建完成的 ObjectMapper 上，不参与模块列表竞争。

### 出口 B：Excel 导出

`@Sensitive` 通过 Jackson 序列化器实现脱敏，只覆盖 JSON 出口。Excel 导出走 FastExcel **直接反射读取 VO 字段**，完全绕过 Jackson——不补这一刀，任何有导出权限的人都能把脱敏字段明文拖走。

收口点在 `ExcelUtil.exportExcel` 主方法，6 个导出重载全部委派到这里，改这一处即全局生效：

```java
public static <T> void exportExcel(List<T> list, String sheetName, Class<T> clazz, boolean merge,
                                   OutputStream os, List<DropDownOptions> options) {
    // 导出前按当前用户权限脱敏
    List<T> masked = ExcelSensitiveHelper.maskList(list, clazz);
    Set<String> excludeFields = ExcelSensitiveHelper.resolveExcludeFields(clazz);

    ExcelWriterSheetBuilder builder = FastExcel.write(os, clazz)
        .autoCloseStream(false)
        // 无权限查看的字段整列排除
        .excludeColumnFieldNames(excludeFields)
        .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
        .sheet(sheetName);

    if (merge) {
        builder.registerWriteHandler(new CellMergeStrategy(masked, true));
    }
    builder.registerWriteHandler(new ExcelDownHandler(options));

    // 执行写入操作（必须写 masked：写回原始 list 会让上面的脱敏整条失效）
    builder.doWrite(masked);
}
```

两个必须注意的点：

1. **`doWrite` 必须传 `masked` 而非原始 `list`**。写回入参会让脱敏整条**静默**失效，而且只有脱敏档失效（隐藏档走 `excludeColumnFieldNames` 仍正常），表现为「页面 JSON 打码、导出 Excel 明文」——不解压 xlsx 根本发现不了
2. **`CellMergeStrategy` 同样要传 `masked`**，否则合并行号算的是另一份数据

`maskList` 不就地修改入参：导出列表可能来自缓存或被调用方复用，就地写入掩码会把脏值污染回去。命中的行做浅拷贝后改写，未命中时原样返回原列表（零拷贝）。

与 JSON 出口的两点差异，均为载体决定而非语义分歧：

| 差异 | JSON 出口 | Excel 出口 |
|------|----------|-----------|
| 隐藏档 | key 消失 | 整列消失（`excludeColumnFieldNames`） |
| `@SerialMap` 联动 | 生效 | 不适用（走反射读字段，派生值根本不会被填充） |

### 出口 C-1：JSON 写入

`FieldWriteGuardAspect` 拦截 Controller 上带 `@RequestBody` 的写请求，把当前用户无权修改的字段在进入业务逻辑前**置 null**。

```java
@Slf4j
@Aspect
@Order(FieldWriteGuardAspect.ORDER)
public class FieldWriteGuardAspect {

    /** 早于业务切面执行：值必须在进入 Service 之前就被重置 */
    public static final int ORDER = -100;

    @Before("@annotation(org.springframework.web.bind.annotation.PostMapping) "
        + "|| @annotation(org.springframework.web.bind.annotation.PutMapping) "
        + "|| @annotation(org.springframework.web.bind.annotation.PatchMapping)")
    public void guard(JoinPoint point) {
        try {
            IFieldPermissionService service = permissionService();
            if (service == null || !service.isEnabled()) {
                return;
            }
            for (Object arg : point.getArgs()) {
                guardArgument(arg, service);
            }
        } catch (Exception e) {
            // 拦截失败不能让业务接口 500；但要 WARN，因为这意味着本次写入未受保护
            log.warn("字段权限：写入拦截执行失败，本次请求未受字段级保护 => {}", e.getMessage());
        }
    }
}
```

#### 为什么置 null 等于保持原值

本项目 MyBatis-Plus 配置了 `updateStrategy: NOT_NULL`，null 字段不参与 UPDATE 语句。因此置 null 后该列保持库中原值，效果与「查出原值覆盖回去」一致，却省掉一次 `getById` 查询，也不必猜 BO 的主键字段名（本项目 BO 主键命名不统一：业务表用 `id`、`sys_user` 用 `userId`）。

新增场景下置 null 则走数据库默认值，同样合理——用户本就无权设置该字段。

#### 为什么是静默重置而不是报错

批量提交时报错会让整个请求失败，重置更符合「看不见就改不动」的直觉。但静默会造成「改了 → 提示成功 → 刷新没变」，用户会当成系统丢数据来报障，因此必须有反馈层。

#### 写入反馈

`FieldWriteGuardAdvice` 把被拦下的字段追加到响应 `msg`：

```java
private static final String HINT_PREFIX = "；以下字段无修改权限，已忽略：";

@Override
public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                              Class<? extends HttpMessageConverter<?>> selectedConverterType,
                              ServerHttpRequest request, ServerHttpResponse response) {
    if (!(body instanceof R<?> result)) {
        return body;
    }
    try {
        List<String> ignored = FieldPermissionHelper.getIgnoredFields();
        if (ignored.isEmpty()) {
            return body;
        }
        // 失败响应的 msg 是错误原因，不追加
        if (result.getCode() != R.SUCCESS) {
            return body;
        }
        result.setMsg(result.getMsg() + HINT_PREFIX + String.join("、", ignored));
    } catch (Exception e) {
        log.warn("字段权限：追加写入拦截提示失败 => {}", e.getMessage());
    }
    return body;
}
```

走响应 `msg` 而不是改各个 Controller，是因为这样**存量页面零改动**即可获得提示——前端的 `showMsgSuccess` 本来就展示 `msg`。用户会看到：

```text
操作成功；以下字段无修改权限，已忽略：身份证号、手机号码
```

记录的是**中文标签**而非字段名（取 `@ExcelProperty(value)`，缺失时回落字段名），因为这条提示最终要展示给使用者看。标签解析走反射，但只在「确有字段被写入拦截」时调用，属低频路径。

#### 拦截范围

| 情况 | 是否拦截 |
|------|---------|
| `@RequestBody` 单个 BO | ✅ |
| `@RequestBody` BO 集合 / 数组（批量提交） | ✅ 逐元素拦 |
| GET 查询 | ❌ 切点限定在写方法上 |
| 未标 `@FieldResource(type = BO)` 的类 | ❌ 放行 |
| 提交值本就为 null 的字段 | ❌ 不算越权尝试，也不提示 |
| 静态、final、基本类型字段 | ❌ 跳过（无法置 null，且项目 BO 统一用包装类型） |
| Excel 导入（`@RequestPart`） | ❌ 由出口 C-2 负责 |

### 出口 C-2：Excel 导入

导入走 `@RequestPart MultipartFile`，**不经 `@RequestBody` 切面**——这是与导出侧正好镜像的一条绕过通道：页面改不了的字段，做张 Excel 导进去就能改。项目里实测有 12 个 Controller 使用 `importExcel`。

三个 `importExcel` 重载分别收口。无 Listener 的重载读完后统一拦：

```java
public static <T> List<T> importExcel(InputStream is, Class<T> clazz) {
    List<T> rows = FastExcel.read(is).head(clazz).autoCloseStream(false).sheet().doReadSync();
    // 导入走 @RequestPart 不经写入拦截 AOP，必须在此收口
    return ExcelSensitiveHelper.guardImported(rows, clazz);
}
```

带 Listener 的两个重载用装饰器**逐行拦**：

```java
public static <T> ExcelResult<T> importExcel(InputStream is, Class<T> clazz, ExcelListener<T> listener) {
    // 必须逐行拦：业务 Listener 常在 invoke() 里直接入库
    FieldPermissionExcelListener<T> guarded = new FieldPermissionExcelListener<>(listener, clazz);
    FastExcel.read(is, clazz, guarded).sheet().doRead();
    return listener.getExcelResult();
}
```

**为什么必须逐行拦而不能读完再拦**：自定义 Listener 常在 `invoke()` 里直接入库（如 `SysUserImportListener` 逐行调 `insertUser` / `updateUser`），等 `doRead()` 返回后再处理 `getExcelResult().getList()`，数据早已落库，拦了个寂寞。

```java
@RequiredArgsConstructor
public class FieldPermissionExcelListener<T> implements ExcelListener<T> {

    private final ExcelListener<T> delegate;
    private final Class<T> clazz;

    @Override
    public void invoke(T data, AnalysisContext context) {
        // 先拦再转发：业务 Listener 可能在 invoke 里就入库了
        ExcelSensitiveHelper.guardImportedRow(data, clazz);
        delegate.invoke(data, context);
    }

    // 其余方法原样委派，不改变业务 Listener 的任何行为
}
```

导入拦截与 JSON 写入完全同一套语义（置 null + 记录被忽略字段），并共用同一条反馈通道。两处实现的差异只有一点：导入侧**就地改写**而非拷贝——导入数据是刚从文件解析出的新对象，没有别处引用，就地改安全；且 `ExcelResult` 是只读接口，替换列表需要改接口并波及所有自定义 Listener 实现，不划算。

判档按字段做一次，不进逐行循环（导入可能上万行）。

### 四出口行为对照

| 档位 | JSON 读 | Excel 导出 | JSON 写入 | Excel 导入 |
|------|---------|-----------|----------|-----------|
| 无决策 (null) | 原样，注解生效 | 回落 `@Sensitive` 判定 | 放行 | 放行 |
| 隐藏 | 无 key（数组形态写 null） | 整列排除 | 置 null + 提示 | 置 null + 提示 |
| 脱敏 | 按策略打码，非 String 写 null | 按策略打码，非 String 置空 | 置 null + 提示 | 置 null + 提示 |
| 只读 | 明文（覆盖 `@Sensitive`） | 明文（覆盖 `@Sensitive`） | 置 null + 提示 | 置 null + 提示 |
| 可写 | 明文（覆盖 `@Sensitive`） | 明文（覆盖 `@Sensitive`） | 正常写入 | 正常写入 |

### 决策服务缺失时的行为

四个出口都做了同一件事：取不到 `IFieldPermissionService` 实现（如项目未引入 ruoyi-system）时**原样放行**，并只 WARN 一次，避免每字段每记录刷屏。

```java
private static IFieldPermissionService service() {
    try {
        return SpringUtils.getBean(IFieldPermissionService.class);
    } catch (Exception e) {
        if (!serviceMissingLogged) {
            serviceMissingLogged = true;
            log.warn("字段权限：未找到 IFieldPermissionService 实现，JSON 出口按无动态决策放行 => {}", e.getMessage());
        }
        return null;
    }
}
```

同样地，决策过程本身抛异常时也按「无动态决策」放行而不是抛 500——注解兜底仍在，但会 WARN 便于排查。这个取舍的前提是：字段权限是**增强**能力，它自己出问题不该让业务接口不可用。

## 请求级上下文与缓存

### 两级 ThreadLocal 快照

`FieldPermissionHelper` 维护 `resourceKey → (fieldName → FieldAccess)` 两级快照。一个响应可能嵌套多个 VO（如 `SysUserInfoVo` 内含 `SysUserVo` + `List<SysRoleVo>`），按资源分别缓存，同请求内同一资源只查一次 Redis。

```java
public final class FieldPermissionHelper {

    private static final ThreadLocal<Map<String, Map<String, FieldAccess>>> SNAPSHOTS = new ThreadLocal<>();
    private static final ThreadLocal<Set<String>> IGNORED_FIELDS = new ThreadLocal<>();
    private static final ThreadLocal<Map<String, Map<String, String>>> STRATEGIES = new ThreadLocal<>();

    /** 清理全部请求级状态。必须在请求结束的 finally 中调用 */
    public static void clear() {
        SNAPSHOTS.remove();
        STRATEGIES.remove();
        IGNORED_FIELDS.remove();
    }
}
```

存放三类请求级状态：

| 状态 | 用途 |
|------|------|
| 档位快照 | 逐字段判档的热路径数据源 |
| 脱敏策略表 | 脱敏档实际使用的策略名，与档位快照同生命周期 |
| 被忽略字段清单 | 写入拦截命中的中文标签，供响应 `msg` 追加 |

### 必须清理

请求结束必须调 `clear()`，由 `FieldPermissionContextFilter` 在 `finally` 中兜底：

```java
public class FieldPermissionContextFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        try {
            chain.doFilter(request, response);
        } finally {
            FieldPermissionHelper.clear();
        }
    }
}
```

**不清理会串权**：Web 容器线程池复用，A 用户的快照会留给下一个复用该线程的 B 用户，B 读到 A 的字段档位。这是本机制最危险且最难复现的 bug 形态——低并发下几乎不出现，一上量就随机泄露。放在 `finally` 而不是正常路径末尾，是因为业务抛异常时也必须清。

Filter 不做任何「预加载」：快照按资源懒加载，请求里没碰到受控 VO 就零开销。

### 缓存设计

| 缓存名 | key | 值 | 层级 | TTL |
|--------|-----|----|------|-----|
| `sys_field_permission` | `subjectType:subjectId:resourceKey` | `Map<fieldName, 编码值>` | 租户级 | 5 天 / 空闲 2 天 / 上限 5000 |
| `sys_field_baseline` | `resourceKey` | `Map<fieldName, accessCode>` | 系统级 | 不过期 |
| `sys_field_class_resource` | 类全限定名 | `resourceKey` | 系统级 | 不过期 |
| `sys_field_permission:configured` | 固定 key | 已配置资源标识集合 | 租户级 | 不过期 |

几个刻意的决定：

- **空结果也缓存**（空 HashMap 而非 null）：绝大多数「主体 × 资源」组合无配置，不缓存会全部穿透到库
- **基线缓存不设 TTL**：类结构不会在运行期变化，由重启扫描刷新。靠过期兜底反而会在闲置期被淘汰导致基线丢失
- **缓存值必须是 `new HashMap`**：不可变集合进 Redis 反序列化会失败，这是框架的已知坑

### 已配置资源集合短路

热路径上最有效的一次优化：先查「该租户下哪些资源配过差异行」，没配过的资源直接跳过全部主体查询，只用注解基线。

```java
// 短路：该租户下此资源一条差异行都没有 → 只用基线
if (configuredResources().contains(resourceKey)) {
    List<Long> roleIds = new ArrayList<>();
    if (user.getRoles() != null) {
        for (RoleDTO role : user.getRoles()) {
            roleIds.add(role.getRoleId());
        }
    }
    mergeAllSubjects(merged, strategies, resourceKey, roleIds, user.getDeptId(), user.getUserId(), null, null);
}
applyBaseline(merged, resourceKey);
```

这个集合用一个哨兵元素 `__loaded__` 标记「已加载」——Redisson 对不存在的 Set 读出来是空集，与「确认为空」分不清，没有哨兵就会每次都回源重建。

### 主体变更的缓存联动

授权主体发生变化时必须联动清理，否则「改完权限档位不生效」或者「已删角色的配置一直留着」：

| 事件 | 动作 | 原因 |
|------|------|------|
| 角色停用 | `evictSubject` 清缓存，**不删配置** | 重新启用后原权限应原样生效 |
| 角色删除 | `purgeSubject` 删差异行 + 清缓存 | 否则「已配置资源」集合里留幽灵，矩阵页出现幽灵列 |
| 部门移动 | `evictSubject` 清缓存 | 整条子链的 `ancestors` 变了，子链用户命中的 `include_sub` 配置随之变化 |
| 部门删除 | `purgeSubject` | 注销主体 |
| 用户删除 | `purgeSubject` | 注销个人差异行 |

## 数据库设计

### 三张表

```sql
-- sys_field_resource 字段权限资源注册表（系统级）
create table sys_field_resource
(
    id            bigint(20)   not null comment '主键id',
    resource_key  varchar(100) not null comment '资源标识(与菜单权限前缀一致，如 system:user)',
    resource_name varchar(100) not null comment '资源名称(扫描时按 resource_key 反查 sys_menu.menu_name 自动填充，可改)',
    module_name   varchar(50)  default null comment '所属模块分组(如 系统管理/基础业务/商城管理)',
    sort_order    int(4)       default 999 comment '排序值',
    status        char(1)      default '1' comment '状态(0停用 1正常)',
    is_auto       char(1)      default '1' comment '是否由 @FieldResource 注解扫描自动登记(0手工 1自动)',
    -- 省略审计字段
    primary key (id),
    unique key uk_resource_key (resource_key)
) engine = innodb comment = '字段权限资源注册表(系统级，无租户)';

-- sys_field_resource_class 资源与类绑定表（系统级）
create table sys_field_resource_class
(
    id           bigint(20)   not null comment '主键id',
    resource_key varchar(100) not null comment '资源标识(关联 sys_field_resource.resource_key)',
    class_name   varchar(255) not null comment '类全限定名(VO/BO/ImportVo)',
    class_type   char(1)      not null default '1' comment '类角色(1读出口VO 2写入口BO 3导入ImportVo)',
    is_auto      char(1)      default '1' comment '是否由注解扫描自动登记(0手工 1自动)',
    -- 省略审计字段
    primary key (id),
    unique key uk_class_name (class_name),
    key idx_resource_key (resource_key)
) engine = innodb comment = '字段权限资源与类绑定表(系统级，无租户)';

-- sys_field_permission 字段权限配置表（租户级）
create table sys_field_permission
(
    id           bigint(20)   not null comment '主键id',
    tenant_id    varchar(20)  default '000000' comment '租户id',
    subject_type char(1)      not null default '1' comment '授权主体类型(1角色 2部门 3用户)',
    subject_id   bigint(20)   not null comment '主体id(角色id/部门id/用户id)',
    resource_key varchar(100) not null comment '资源标识',
    field_name   varchar(64)  not null comment '字段名(VO属性名，如 idCard)',
    access_type  char(1)      default '3' comment '访问档位(0隐藏 1脱敏 2只读 3可写)',
    strategy     varchar(32)  default null comment '脱敏策略(access_type=1时生效，取 SensitiveStrategy 枚举名)',
    include_sub  char(1)      default '1' comment '部门主体是否含子部门(0否 1是，仅 subject_type=2 生效)',
    -- 省略审计字段
    primary key (id),
    unique key uk_subject_resource_field (tenant_id, subject_type, subject_id, resource_key, field_name),
    key idx_subject_resource (subject_type, subject_id, resource_key)
) engine = innodb comment = '字段权限配置表';
```

### 为什么前两张表不做租户隔离

`sys_field_resource` 和 `sys_field_resource_class` 被加入了租户排除表，与 `sys_menu` 同性质：

**类归属是随代码走的编译期元数据，不是业务数据**。如果按租户隔离，新租户开通后绑定表为空 → 序列化层查不到资源 → 全部放行，等于**新租户零保护**，而且是静默的——没有任何报错，管理员也不会想到去检查一张自动维护的元数据表。

第三张表 `sys_field_permission`（「谁能看什么」）是真正的授权数据，仍然按租户隔离。

### 字典配置

| 字典类型 | 字典键 | 取值 |
|---------|--------|------|
| 字段访问档位 | `sys_field_access` | 隐藏 0 / 脱敏 1 / 只读 2 / 可写 3（默认项为「可写」） |
| 字段权限主体类型 | `sys_field_subject` | 角色 1 / 部门 2 / 用户 3（默认项为「角色」） |

### 菜单与按钮权限

| 权限标识 | 说明 |
|---------|------|
| `system:fieldPermission:view` | 菜单可见 |
| `system:fieldPermission:query` | 查资源树、查矩阵、查主体、收权计数 |
| `system:fieldPermission:update` | 保存矩阵配置 |
| `system:fieldResource:manage` | 改资源元信息（中文名 / 分组 / 排序） |
| `system:fieldPermission:preview` | 效果预览 |

菜单路径为「系统管理 → 字段权限」，组件为 `system/fieldPermission/fieldPermission`。

### 升级已有环境

老环境升级提供了四种数据库的增量脚本（`script/sql/update/` 下的 `mysql_field_permission.sql` 等），内容是新建三张表 + 2 个字典类型 + 7 条字典数据 + 5 条菜单 + 5 条角色菜单关联。

**执行完必须重启应用**：`sys_field_resource` 和 `sys_field_resource_class` 由启动时的注解扫描器写入，不重启则两表一直为空，表现为「字段权限配置页左侧没有任何资源」，非常容易被误判成功能没做好。

幂等性说明：MySQL / PostgreSQL 的建表段与字典菜单段均幂等；Oracle / SQL Server 的建表段不幂等（重复执行报对象已存在，跳过即可），字典菜单段幂等。

## 配置项

```yaml
--- # 字段级权限（列级隔离）总开关
field-permission:
  # 默认启用。关掉后 JSON 出口 / Excel 导出 / JSON 写入 / Excel 导入四个出口全部旁路，
  # 等同于没有这个功能；已配置的差异化权限保留在库里，重新打开即恢复，不需要重配。
  # 排障时可临时关闭以确认问题是否来自字段权限。
  enabled: ${FIELD_PERMISSION_ENABLED:true}
```

| 配置键 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `field-permission.enabled` | boolean | `true` | 总开关，支持环境变量 `FIELD_PERMISSION_ENABLED` 覆盖 |
| `field-permission.scan-audit` | boolean | `true` | 启动时是否巡检未标注解的 VO/BO；大项目可关 |

总开关有两道：Jackson 自动配置上的 `@ConditionalOnProperty`（关闭时拦截器整个不注册）和决策服务内部的 `enabled` 判断。双保险是为了让线上排障时「关掉即彻底回到旧行为」这件事足够可靠。

## 管理端接口

### 接口清单

| 接口 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/system/fieldResource/listFieldResources` | GET | `system:fieldPermission:query` | 资源列表（配置页左树） |
| `/system/fieldResource/getFieldResource/{id}` | GET | `system:fieldPermission:query` | 资源详情 |
| `/system/fieldResource/updateFieldResource` | PUT | `system:fieldResource:manage` | 改资源元信息 |
| `/system/fieldPermission/getFieldMatrix` | GET | `system:fieldPermission:query` | 查「字段 × 主体」矩阵 |
| `/system/fieldPermission/updateFieldMatrix` | PUT | `system:fieldPermission:update` | 覆盖式保存矩阵 |
| `/system/fieldPermission/listFieldSubjects/{subjectType}` | GET | `system:fieldPermission:query` | 主体选项（矩阵列候选） |
| `/system/fieldPermission/previewFieldEffect` | GET | `system:fieldPermission:preview` | 效果预览 |
| `/system/fieldPermission/countAffectedUsers` | GET | `system:fieldPermission:query` | 收权后果计数 |

运行期决策**不走这些接口**——决策在四个出口内部完成，管理端只负责配置的读写。

### 矩阵数据结构

```java
@Data
public class FieldMatrixVo implements Serializable {
    /** 资源标识 */
    private String resourceKey;
    /** 资源名称 */
    private String resourceName;
    /** 该资源绑定的类清单（只读，让管理员看见配置的实际覆盖范围） */
    private List<SysFieldResourceClassVo> classes = new ArrayList<>();
    /** 矩阵的行：字段元数据（含中文标签、注解基线） */
    private List<FieldMetaVo> fields = new ArrayList<>();
    /** 矩阵的列：主体选项 */
    private List<FieldSubjectVo> subjects = new ArrayList<>();
    /** 已配置的差异格（不含"跟随基线"的格子） */
    private List<FieldMatrixCellVo> cells = new ArrayList<>();
}
```

**只返回差异格而非完整二维数组**：绝大多数格子都是「跟随基线」，全量返回会让一个 20 字段 × 30 角色的资源产生 600 个无意义对象。前端按 `fieldName + subjectId` 索引，未命中即渲染为基线档位。

字段元数据由反射产出、不落库：

```java
@Data
public class FieldMetaVo implements Serializable {
    /** 字段名（VO 属性名，如 idCard） */
    private String fieldName;
    /** 中文标签：取 @ExcelProperty(value)，缺失时回落字段名 */
    private String label;
    /** Java 类型简名（String / Long / Date …） */
    private String javaType;
    /** 是否带 @Sensitive 注解——决定「注解基线」是脱敏还是可写 */
    private Boolean sensitive;
    /** @Sensitive 的策略枚举名（PHONE / ID_CARD …），无注解为 null */
    private String sensitiveStrategy;
    /** 带 @Sensitive 但字段非 String：注解实际不生效，配置页红字提示 */
    private Boolean annotationUncovered;
    /** 该字段出现在哪些类里（同一资源多个 VO 合并后可能 >1） */
    private List<String> sourceClasses = new ArrayList<>();
}
```

`annotationUncovered` 这一项值得单说：`@Sensitive` 只处理 String，标在 `Long` / `Date` 字段上实际不生效。配置页会红字提示「注解不覆盖」，告诉管理员这个字段**只能靠动态配置兜底**，不能指望注解。同样地，启动期算基线时也会跳过这类字段——否则会凭空锁住一个本来明文输出的字段。

### 覆盖式保存

```java
@Data
public class FieldMatrixBo implements Serializable {
    @NotBlank(message = "资源标识不能为空")
    private String resourceKey;

    @NotBlank(message = "主体类型不能为空")
    private String subjectType;

    /** 本次编辑涉及的全部主体ID（覆盖式保存的删除范围） */
    @NotNull(message = "主体ID列表不能为空")
    private List<Long> subjectIds = new ArrayList<>();

    /** 差异格。只传与基线不同的格子 */
    private List<FieldMatrixCellVo> cells = new ArrayList<>();
}
```

保存逻辑是「先删该资源该批主体的全部差异行，再插入 `cells`」。因此 `subjectIds` **必须完整传入本次编辑涉及的所有主体**——少传一个，那个主体的既有配置不在删除范围内会被保留，造成「页面上清空了但实际还生效」。

### 效果预览

按**指定用户**合并其角色 + 部门 + 个人配置后的最终效果，走与运行期完全相同的 `mergeAllSubjects`：

```java
@Override
public Map<String, FieldAccess> calcSnapshotForUser(Long userId, String resourceKey,
                                                    SubjectType excludeType, Long excludeId) {
    Map<String, FieldAccess> merged = new HashMap<>();
    if (!enabled || userId == null || StrUtil.isBlank(resourceKey)) {
        return merged;
    }
    // 超管旁路：与运行期一致，字段权限对它不生效
    if (LoginHelper.isSuperAdmin(userId)) {
        return merged;
    }
    SysUser user = userDao.getById(userId);
    if (user == null) {
        return merged;
    }
    mergeAllSubjects(merged, new HashMap<>(), resourceKey,
        userRoleDao.listRoleIdsByUserId(userId), user.getDeptId(), userId, excludeType, excludeId);
    applyBaseline(merged, resourceKey);
    return merged;
}
```

**预览与运行期必须共用同一个合并方法**。如果两边各写一套，管理员照着预览配完、上线却是另一回事——那比没有预览更糟。

预览结果的每一项都带 `fromConfig` 标记，区分「我配的生效了」与「这是注解带来的默认行为」：

| 字段 | 含义 |
|------|------|
| `accessType` / `accessLabel` | 最终档位及中文标签 |
| `sensitive` | 是否带 `@Sensitive` 注解 |
| `fromConfig` | true = 命中差异行；false = 回落注解基线或无限制 |
| `strategy` | 脱敏档实际使用的策略名 |
| `superAdmin` | 被预览用户是否超管（超管所有字段均为可写） |

### 收权后果计数

回答「把这个字段对该主体收紧后，还有多少人因其他主体仍能看到」：

```java
@Data
public class FieldAffectedVo implements Serializable {
    /** 命中该主体的用户总数 */
    private Integer totalUsers;
    /** 其中因其他主体仍能看到该字段的人数——收权对这些人无效 */
    private Integer stillVisibleUsers;
    /** 前若干个仍可见用户的明细（供 hover 展示），最多 10 条 */
    private List<AffectedUser> samples = new ArrayList<>();
    /** 用户数过多时只给总数、不逐个算，此标记为 true */
    private Boolean approximate;
}
```

实现上通过给 `mergeAllSubjects` 传 `excludeType` / `excludeId` 参数，模拟「去掉这条配置后」的合并结果，再与收紧后的档位比较。

样本里的 `grantedBy` 会直接告诉管理员是哪个主体让这个人仍能看到（如「角色：财务专员」），这是排查「我明明收紧了怎么没生效」时最需要的信息。

用户数过多时返回 `approximate = true` 只给总数：逐用户合并档位要走完整的多主体合并逻辑，几千人的角色算下来会拖垮一次页面交互。此时前端提示「影响范围较大」，管理员改用效果预览按单个用户查。

## 前端接入

### 体验层与安全边界

务必分清：**前端的字段过滤只是体验优化，不是安全边界**。真正的隔离由四个后端出口保证，绕过前端直接调接口一样改不动、看不到——后端压根不下发被隐藏的字段。

前端做这层过滤的目的只有一个：让用户不会「看见一个能填的框、填完保存却没生效」，以及不会看到一列恒为空白让人以为是数据缺失。

### 登录下发快照

`UserInfoVo` 在登录时带回字段权限快照：

```java
/**
 * 字段权限快照：资源标识 → (字段名 → 档位码 0隐藏/1脱敏/2只读)
 *
 * 只含受限字段，可写的不下发——绝大多数用户是空对象。
 */
private Map<String, Map<String, String>> fieldPermissions;
```

前端 store 提供三个判定方法：

```typescript
/**
 * 字段权限快照：资源标识 → (字段名 → 档位码 0隐藏/1脱敏/2只读)
 * 仅体验优化，不是安全边界
 */
const fieldPermissions = ref<Record<string, Record<string, string>>>({})

/**
 * 取字段的权限档位
 * @returns 档位码；无限制返回 null（快照里只有受限字段，查不到即为可写）
 */
const getFieldAccess = (resourceKey?: string, fieldName?: string): string | null => {
  if (!resourceKey || !fieldName) return null
  return fieldPermissions.value[resourceKey]?.[fieldName] ?? null
}

/** 字段是否应在界面上隐藏（档位=隐藏） */
const isFieldHidden = (resourceKey?: string, fieldName?: string): boolean => {
  return getFieldAccess(resourceKey, fieldName) === '0'
}

/**
 * 字段是否应禁止编辑（隐藏/脱敏/只读都不可改）
 * 脱敏档也禁用——用户看到的是掩码，放行会把掩码串提交进库
 */
const isFieldReadonly = (resourceKey?: string, fieldName?: string): boolean => {
  const access = getFieldAccess(resourceKey, fieldName)
  return access !== null && access !== '3'
}
```

退出登录时**必须清空** `fieldPermissions`，否则换账号登录会残留上一个用户的字段配置，造成界面层的串权。

### 组件接入

`TableToolbar` 与 `ADetail` 都接受 `fieldResource` 属性，传入后自动过滤无权字段：

```vue
<template>
  <TableToolbar
    v-model:showSearch="showSearch"
    v-model:columns="columns"
    field-resource="system:user"
    @reset-query="resetQuery"
    @query-table="getList"
  />
</template>
```

| 组件 | 属性 | 过滤范围 |
|------|------|---------|
| `TableToolbar` | `fieldResource` | 「列设置」候选项、打印内容 |
| `ADetail` | `fieldResource` | 详情项渲染 |

两处的键名不同需要留意：`ColumnConfig` 用 `field`，`FieldConfig` 用 `prop`。

`ADetail` 里的权限过滤放在业务 `hidden` 判断**之前**——权限是硬约束，业务的 hidden 逻辑不该有机会把它翻回来：

```typescript
const visibleFields = computed(() => {
  return props.fields
    .filter((field) => {
      // 字段权限：无权查看的字段直接不渲染
      if (userStore.isFieldHidden(props.fieldResource, field.prop)) {
        return false
      }
      if (typeof field.hidden === 'function') {
        return !field.hidden(props.data)
      }
      // ...
    })
})
```

打印内容同样要过滤，否则打印出来的纸质件反而比屏幕上看到的多——这是很容易漏掉的一条泄露路径。

### 配置页

配置页位于 `system/fieldPermission/fieldPermission`，左侧资源树（按模块分组、数字徽标标出配过差异的资源），右侧「字段 × 主体」矩阵，三种主体粒度共用一套 UI。

针对「最宽松合并」这个反直觉语义，界面上做了五处提示：

| 设计 | 解决的问题 |
|------|-----------|
| 常驻 alert 说明合并语义 | 管理员默认以为是「取交集」 |
| 单元格 `⚠ N` 角标 | 收紧后仍有 N 人因其他主体可见，这是最容易以为生效了其实没生效的地方 |
| 保存前二次确认 | 明说四个出口同时生效，避免以为只影响页面 |
| 超管列渲染成不可编辑的「全权」 | 超管走旁路，配了也不生效，且可能把自己锁死 |
| 非 String 字段标「注解不覆盖」 | `@Sensitive` 对它们不生效，只能靠动态配置兜底 |

## 接入指南

给一个新业务模块加上字段权限，完整步骤如下。

### 第一步：给读出口 VO 加注解

```java
import plus.ruoyi.common.core.field.FieldResource;

@Data
@FieldResource("business:customer")
public class CustomerVo implements Serializable {

    @ExcelProperty(value = "客户姓名")
    private String customerName;

    @ExcelProperty(value = "手机号码")
    @Sensitive(strategy = SensitiveStrategy.PHONE)
    private String phone;

    @ExcelProperty(value = "身份证号")
    @Sensitive(strategy = SensitiveStrategy.ID_CARD)
    private String idCard;
}
```

资源标识与该模块的菜单权限前缀保持一致。字段的中文标签取 `@ExcelProperty(value)`，建议每个可能被配置的字段都补上——否则矩阵和写入提示里会出现英文字段名。

### 第二步：检查是否有导出专用 VO

如果模块有独立的导出 VO，**必须绑同一资源**：

```java
@Data
@FieldResource("business:customer")
public class CustomerExportVo implements Serializable {
    // 字段按名字与 CustomerVo 匹配同一套配置
}
```

漏掉这一步的后果是：页面 JSON 打码，导出 Excel 明文。

### 第三步：给写入口 BO 加注解

```java
@Data
@FieldResource(value = "business:customer", type = FieldClassType.BO)
public class CustomerBo extends BaseEntity {
    // ...
}
```

### 第四步：给导入 VO 加注解（如有导入功能）

```java
@Data
@FieldResource(value = "business:customer", type = FieldClassType.IMPORT)
public class CustomerImportVo implements Serializable {
    // ...
}
```

### 第五步：前端页面传 fieldResource

```vue
<template>
  <TableToolbar
    v-model:showSearch="showSearch"
    v-model:columns="columns"
    field-resource="business:customer"
    @reset-query="resetQuery"
    @query-table="getList"
  />

  <ADetail :data="detailData" :fields="detailFields" field-resource="business:customer" />
</template>
```

### 第六步：重启并验证

1. 重启应用，观察启动日志：

   ```text
   字段权限资源扫描完成：4 个类 / 新增资源 1 个 / 失效绑定 0 行 / 类反查缓存 N 条
   ```

2. 打开「系统管理 → 字段权限」，左树应出现该资源，右侧矩阵列出全部字段
3. 给某个测试角色把 `idCard` 配成隐藏，保存
4. 用属于该角色的账号登录，确认：列表 JSON 里没有 `idCard` 这个 key、导出的 Excel 没有这一列、调接口提交 `idCard` 返回「已忽略」提示
5. 用效果预览按该用户查一遍，确认档位与实际一致

### 接入检查清单

- [ ] 读出口 VO 已标 `@FieldResource`
- [ ] 导出专用 VO 已标注且与主 VO 同资源
- [ ] 写入口 BO 已标 `type = FieldClassType.BO`
- [ ] 导入 VO 已标 `type = FieldClassType.IMPORT`
- [ ] 嵌套 VO **没有**标注解
- [ ] 字段语义不同的同表 VO 标了不同资源
- [ ] 需要配置的字段都有 `@ExcelProperty(value)` 中文标签
- [ ] 前端页面传了 `field-resource`
- [ ] 重启后启动日志无 `字段权限资源扫描失败`
- [ ] 启动巡检的 WARN 清单里没有本模块该标而漏标的类

## 最佳实践

### 1. 优先用角色主体，慎用用户主体

角色是主力粒度，随角色分配自动生效，人员变动时不需要额外维护。用户主体只用于临时或例外授权。

```text
✅ 推荐：给「人事专员」角色配 idCard 可写
   → 新入职的人事专员分配角色即生效

❌ 不推荐：给张三、李四、王五三个用户各配一条
   → 人员变动就得手工改，漏一个就是权限残留
```

部门主体适合「整条业务线」的场景，配合 `include_sub` 可以一次覆盖整棵子树。

### 2. 收权时务必看 ⚠ 角标

最宽松合并语义下，「给某个角色设隐藏」对兼任其他角色的用户完全无效。矩阵单元格的 `⚠ N` 角标就是为这件事准备的：

```text
配置：给「普通员工」角色把 idCard 设为隐藏
角标：⚠ 12  ← 有 12 个人因为兼任其他角色仍能看到

正确做法：
  1. hover 角标看 grantedBy，确认是哪些角色在放行
  2. 把那些角色的对应格子也收紧
  3. 或者改用效果预览逐个确认关键用户
```

配完关键字段后，强烈建议用效果预览按几个典型用户各查一遍再上线。

### 3. 导出 VO 与读 VO 必须同资源

这是最容易形成绕过后门的地方，而且**不会有任何报错**：

```java
// ✅ 正确：两个类绑同一资源，配置对两条路径同时生效
@FieldResource("system:user")
public class SysUserVo { }

@FieldResource("system:user")
public class SysUserExportVo { }

// ❌ 错误：导出 VO 未标注解
@FieldResource("system:user")
public class SysUserVo { }

public class SysUserExportVo { }   // 漏标 → 导出走这个类 → 完全不受保护
```

排查方法：启动日志的巡检 WARN 里搜一下有没有本模块的 `*ExportVo`。

### 4. 敏感字段同时用注解和配置

两者定位不同，应当叠加使用：

| 手段 | 定位 | 特点 |
|------|------|------|
| `@Sensitive` 注解 | 默认安全基线 | 编译期固定，全员统一，新环境开箱即有保护 |
| 字段权限配置 | 差异化授权 | 运行期可调，按主体区分，可覆盖注解 |

推荐做法：敏感字段一律先加 `@Sensitive`（这样默认全员打码，即使从未配过字段权限也是安全的），再通过配置给需要看原值的角色显式放权。

反过来（不加注解、纯靠配置）的风险是：新环境部署后如果忘了配，字段是明文可写的。

### 5. 非 String 敏感字段只能靠配置

`@Sensitive` 只处理 String，标在 `Long`（如身份证号存成数字）或 `Date` 字段上不生效。配置页会标「注解不覆盖」红字提示。

这类字段：

- 基线是**可写**而不是脱敏（启动扫描时刻意跳过，避免凭空锁住一个本来明文输出的字段）
- 必须显式配置才有保护
- 脱敏档下 JSON 写 null、Excel 置空（脱敏器只处理字符串，输出原值等于没脱敏）

更好的做法是把这类字段改成 String 类型，让注解基线能正常工作。

### 6. 排障时先关总开关定位

线上出现「某个字段莫名其妙不见了 / 改不动了」，第一步是确认问题是否来自字段权限：

```bash
# 临时关闭后重启，观察现象是否消失
FIELD_PERMISSION_ENABLED=false
```

关闭后四个出口全部旁路，等同于没有这个功能；已配置的差异化权限保留在库里，重开即恢复，不需要重配。

现象消失 → 确认是字段权限，用效果预览查具体用户的档位；现象仍在 → 问题在别处。

### 7. 配置变更后确认缓存已刷新

差异行缓存 TTL 为 5 天，但保存矩阵时会主动 evict 对应主体。如果改完不生效，按这个顺序排查：

1. 保存是否成功（响应返回的是实际落库的差异行数）
2. 目标用户是否超管（超管旁路）
3. 目标用户是否重新登录（前端体验层的快照在登录时下发，不重登界面不变；但后端出口是每请求实时判的）
4. 主体是否正确（用户在 A 角色，配置配到了 B 角色上）
5. 是否被其他主体放宽了（用效果预览看 `fromConfig` 与收权计数的 `grantedBy`）

## 常见问题

### 1. 配置页左树没有任何资源

**问题原因：**

- 增量升级脚本执行后没有重启应用——两张元数据表由启动扫描器写入
- 启动扫描失败（表未建 / Redis 不可用）
- 项目里确实一个类都没标 `@FieldResource`

**排查方法：**

查启动日志。正常应有：

```text
字段权限资源扫描完成：N 个类 / 新增资源 M 个 / 失效绑定 X 行 / 类反查缓存 Y 条
```

失败则是：

```text
字段权限资源扫描失败，字段权限将按「未登记 = 放行」运行。
请确认 sys_field_resource 系列表已建、Redis 可用 => ...
```

**解决方案：**

按日志提示确认三张表已建、Redis 可用，然后重启应用。注意此时系统按「未登记 = 放行」运行，是没有保护的状态，需要尽快修复。

### 2. 页面 JSON 打码了，导出的 Excel 却是明文

**问题原因：**

导出专用 VO 漏标 `@FieldResource`，或标了不同的资源标识。导出走的是这个类，与页面 VO 是两条独立路径。

**解决方案：**

```java
// 确认导出 VO 与读 VO 绑同一资源
@FieldResource("system:user")
public class SysUserExportVo implements Serializable { }
```

改完重启，在配置页的资源详情里确认「类绑定清单」包含这个导出 VO。

顺带一提，如果是自己扩展了导出逻辑而不是走 `ExcelUtil.exportExcel`，脱敏不会生效——6 个导出重载都委派到 `exportExcel` 主方法才有这层保护。

### 3. 页面上改不了的字段，做张 Excel 导进去就改掉了

**问题原因：**

导入 VO 漏标 `@FieldResource(type = FieldClassType.IMPORT)`。导入走 `@RequestPart MultipartFile`，不经 `@RequestBody` 写入切面，是与导出侧正好镜像的一条绕过通道。

**解决方案：**

```java
@FieldResource(value = "system:user", type = FieldClassType.IMPORT)
public class SysUserImportVo implements Serializable { }
```

注意类角色必须是 `IMPORT`——标成默认的 VO 类型不会被导入拦截识别（`resolveResource` 要求类角色匹配，传错类型返回 null 而放行）。

### 4. 给角色设了隐藏，用户还是能看到

**问题原因：**

最宽松合并语义：该用户同时命中了其他主体（另一个角色、所在部门、或个人授权），其中有一个把该字段放得更宽。

**解决方案：**

用收权计数接口或矩阵单元格的 `⚠ N` 角标定位：

```text
countAffectedUsers 返回：
  totalUsers: 30           命中该角色的用户总数
  stillVisibleUsers: 12    其中仍能看到的人数
  samples: [
    { nickName: "张三", grantedBy: "角色：财务专员", finalAccess: "3" },
    ...
  ]
```

`grantedBy` 直接指出是哪个主体在放行，把那个主体的对应格子也收紧即可。

如果 `approximate = true`（用户数过多未逐个计算），改用效果预览按具体用户查。

### 5. 配了「可写」，字段还是打码

**问题原因：**

这通常发生在**旧版本**的语义理解上：如果基线按「一律可写」计算，那么把带 `@Sensitive` 的字段配成可写会因为「与基线相同」而不落行，运行期走注解兜底，永远打码。

当前实现的基线规则是「带 `@Sensitive` 的字段基线为脱敏」，所以配成可写是一条真实的差异行，出口会**覆盖**注解输出明文。

**仍然打码时的排查顺序：**

1. 用效果预览确认该用户该字段的 `accessType` 是否为 `3`、`fromConfig` 是否为 `true`
2. `fromConfig = false` 说明没命中差异行——检查主体配对了没有
3. 字段是否带 `@SerialMap`：带 `@SerialMap` 的字段**不做覆盖**（它是展示转换而非安全控制，绕过它会输出原始 ID，属于改坏不是放权）
4. 是否走的是另一个未绑定该资源的 VO

### 6. 换个账号登录后看到了上个用户的字段配置

**问题原因：**

- 后端：`FieldPermissionHelper.clear()` 没有执行到，ThreadLocal 快照在线程池复用时串到了下一个用户
- 前端：退出登录时没有清空 store 里的 `fieldPermissions`

**解决方案：**

后端由 `FieldPermissionContextFilter` 在 `finally` 中兜底清理，确认这个 Filter 已注册且没有被自定义 Filter 链跳过。异常路径也必须走到 `finally`——这正是把清理放在 `finally` 而不是正常路径末尾的原因。

前端在 `logoutUser` 里清空：

```typescript
// 必须清：不清的话换账号登录会残留上一个用户的字段配置，造成界面层的串权
fieldPermissions.value = {}
```

这类问题低并发下几乎不出现，一上量就随机泄露，是字段权限最难复现的 bug 形态，务必按上述两处逐一确认。

### 7. 保存矩阵后，某个主体的旧配置还在生效

**问题原因：**

保存是覆盖式的：先删该资源该批主体的全部差异行，再插入新的 `cells`。如果 `subjectIds` 没有完整传入本次编辑涉及的所有主体，遗漏的主体不在删除范围内，它的既有配置会被保留。

现象就是「页面上清空了，但实际还生效」。

**解决方案：**

调接口时确保 `subjectIds` 包含本次矩阵里展示的全部主体列，而不只是有改动的那几个。

### 8. 定时任务里查出来的数据被脱敏了

**问题原因：**

正常情况下不会——字段权限只约束「人」，无登录态的系统行为一律返回空快照（无动态决策）。

```java
LoginUser user;
try {
    user = LoginHelper.getLoginUser();
} catch (Exception e) {
    // 定时任务等无请求上下文：字段权限只约束"人"，系统行为不拦
    return merged;
}
```

如果确实出现了，说明该任务运行在某个用户的登录上下文里（例如从 Web 请求触发、或手工设置了 LoginUser）。

**解决方案：**

确认任务的执行上下文。如果是 Web 触发的异步任务，注意 ThreadLocal 不会跨线程传递——异步线程里本来就取不到快照，行为是「无动态决策」，这是预期的。

### 9. 新租户开通后字段权限完全不生效

**问题原因：**

如果 `sys_field_resource` / `sys_field_resource_class` 被错误地加上了 `tenant_id` 或被纳入了租户隔离，新租户的绑定表为空，序列化层查不到资源 → 全部放行 → 新租户零保护，且没有任何报错。

**解决方案：**

确认这两张表：

- 建表语句里**没有** `tenant_id` 列
- 在 `PlusTenantLineHandler` 的租户排除表里

```java
"sys_field_resource",
"sys_field_resource_class"
```

`sys_field_permission`（谁能看什么）是授权数据，**应当**保持租户级隔离，不要一起排除。

### 10. 写入被忽略了但用户没收到任何提示

**问题原因：**

- 接口返回值不是 `R` 类型（`FieldWriteGuardAdvice` 只处理返回 `R` 的接口，文件流、String 等不介入）
- 响应是失败响应（失败响应的 `msg` 是错误原因，不追加字段提示）
- 前端没有展示 `msg`（项目的 `showMsgSuccess` 默认展示，自定义封装可能吞掉）

**解决方案：**

写接口统一返回 `R`，前端保留 `msg` 的展示。这条提示很重要——没有它，用户会把「改了但没生效」当成系统丢数据来报障。
