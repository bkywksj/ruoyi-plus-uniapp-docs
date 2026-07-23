# 数据库设计规范

## 介绍

本文档介绍RuoYi-Plus-UniApp项目的数据库设计规范，包括表结构设计、字段规范、索引策略、多租户隔离等内容。

**核心原则:**

- **数据完整性** - 主键、唯一约束、非空约束保证数据质量
- **性能优先** - 适当冗余、合理索引、分区分表
- **可扩展性** - 预留扩展字段、支持多租户
- **可维护性** - 统一命名规范、详细注释

## 表设计规范

### 命名规则

| 前缀 | 说明 | 示例 |
|------|------|------|
| `sys_` | 系统核心表 | sys_user, sys_role, sys_menu |
| `app_` | 应用业务表 | app_order, app_product |
| `gen_` | 代码生成器表 | gen_table, gen_table_column |
| `job_` | 定时任务表 | job_info, job_log |

**命名风格:** 小写字母 + 下划线分隔 (snake_case)

```sql
-- ✅ 正确命名
sys_user, sys_user_role, sys_oper_log

-- ❌ 错误命名
User, user_info, sys_user_role_rel
```

### 标准表结构

所有业务表必须包含以下字段:

```sql
CREATE TABLE sys_xxx (
    -- 主键
    xxx_id BIGINT(20) NOT NULL COMMENT '主键ID',

    -- 租户字段(多租户表必须)
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id',

    -- 业务字段
    xxx_name VARCHAR(50) NOT NULL COMMENT '名称',
    status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)',

    -- 逻辑删除
    is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除',

    -- 审计字段
    create_dept BIGINT(20) DEFAULT NULL COMMENT '创建部门',
    create_by BIGINT(20) DEFAULT NULL COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT(20) DEFAULT NULL COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',

    PRIMARY KEY (xxx_id)
) ENGINE=InnoDB COMMENT='业务表';
```

### 树形结构设计

使用 `ancestors` 字段存储祖级列表:

```sql
CREATE TABLE sys_dept (
    dept_id BIGINT(20) NOT NULL COMMENT '部门id',
    parent_id BIGINT(20) DEFAULT 0 COMMENT '父部门id',
    ancestors VARCHAR(500) DEFAULT '' COMMENT '祖级列表', -- 格式: 0,100,101
    dept_name VARCHAR(30) DEFAULT '' COMMENT '部门名称',
    order_num INT(4) DEFAULT 0 COMMENT '显示顺序',
    PRIMARY KEY (dept_id)
);

-- 查询某部门的所有子部门
SELECT * FROM sys_dept WHERE FIND_IN_SET(?, ancestors);
```

### 日志表设计

日志表特点: 只插入不修改，适当冗余字段。

```sql
CREATE TABLE sys_oper_log (
    oper_id BIGINT(20) NOT NULL COMMENT '日志主键',
    oper_name VARCHAR(50) DEFAULT '' COMMENT '操作人员',
    dept_name VARCHAR(50) DEFAULT '' COMMENT '部门名称', -- 冗余字段
    oper_time DATETIME COMMENT '操作时间',
    PRIMARY KEY (oper_id),
    KEY idx_oper_time (oper_time)
);
```

## 字段设计规范

### 字段类型选择

| Java类型 | MySQL类型 | 应用场景 |
|----------|-----------|----------|
| `Long` | `BIGINT(20)` | 主键ID、用户ID |
| `Integer` | `INT` | 数量、排序号 |
| `Boolean` | `CHAR(1)` | 状态标志 ('0'/'1') |
| `String` | `VARCHAR(n)` | 名称、编码 |
| `String` | `TEXT` | 长文本 |
| `Date` | `DATETIME` | 时间字段 |
| `BigDecimal` | `DECIMAL(10,2)` | 金额 |

### VARCHAR长度参考

| 长度 | 用途 |
|------|------|
| `VARCHAR(11)` | 手机号 |
| `VARCHAR(30)` | 姓名、账号 |
| `VARCHAR(50)` | 邮箱、标题 |
| `VARCHAR(100)` | 编码、密码 |
| `VARCHAR(255)` | URL、文件路径 |
| `VARCHAR(500)` | 备注、祖级列表 |

### 常用字段后缀

| 后缀 | 含义 | 类型 |
|------|------|------|
| `_id` | 主键/外键 | `BIGINT(20)` |
| `_name` | 名称 | `VARCHAR` |
| `_code` | 编码 | `VARCHAR` |
| `_time` | 时间 | `DATETIME` |
| `_by` | 操作人 | `BIGINT(20)` |
| `_num` | 数量/序号 | `INT` |

### 字段约束

```sql
-- 主键必须NOT NULL
user_id BIGINT(20) NOT NULL COMMENT '用户ID'

-- 状态字段设置默认值
status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'

-- 所有字段必须添加注释
data_scope CHAR(1) DEFAULT '1' COMMENT '数据范围(1全部 2自定义 3本部门 4本部门及以下)'
```

## 索引设计

### 索引创建原则

**必须创建索引:**
- 主键字段(自动创建)
- 外键字段
- WHERE条件中频繁使用的字段
- ORDER BY、GROUP BY字段

**不应创建索引:**
- 频繁更新的字段
- 区分度低的字段(如性别)
- TEXT/BLOB大字段

### 项目索引示例

```sql
-- 租户索引(所有多租户表必须)
CREATE INDEX idx_tenant_id ON sys_user (tenant_id);

-- 外键索引
CREATE INDEX idx_dept_id ON sys_user (dept_id);
CREATE INDEX idx_parent_id ON sys_dept (parent_id);

-- 业务查询索引
CREATE INDEX idx_user_name ON sys_user (user_name);
CREATE INDEX idx_dict_type ON sys_dict_data (dict_type);

-- 复合索引
CREATE INDEX idx_tenant_user ON sys_social (tenant_id, user_id);

-- 日志时间索引
CREATE INDEX idx_oper_time ON sys_oper_log (oper_time);
```

### 索引失效场景

```sql
-- ❌ 函数计算
WHERE YEAR(create_time) = 2025
-- ✅ 范围查询
WHERE create_time >= '2025-01-01' AND create_time < '2026-01-01'

-- ❌ 隐式类型转换
WHERE user_id = '1'  -- user_id是BIGINT
-- ✅ 使用正确类型
WHERE user_id = 1

-- ❌ LIKE通配符开头
WHERE user_name LIKE '%admin'
-- ✅ 通配符在后
WHERE user_name LIKE 'admin%'

-- ❌ OR条件部分无索引
WHERE user_id = 1 OR nick_name = 'admin'
-- ✅ 改用UNION
SELECT * FROM sys_user WHERE user_id = 1
UNION
SELECT * FROM sys_user WHERE nick_name = 'admin'
```

## 实体类设计

### BaseEntity基类

```java
@Data
public class BaseEntity implements Serializable {
    @TableField(fill = FieldFill.INSERT)
    private Long createDept;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}
```

### TenantEntity租户基类

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class TenantEntity extends BaseEntity {
    @TableField(tenantIdField = true)
    private String tenantId;
}
```

### 实体类示例

```java
@Data
@TableName("sys_user")
public class SysUser extends TenantEntity {
    @TableId(value = "user_id")
    private Long userId;

    private Long deptId;
    private String userName;
    private String nickName;

    @TableField(
        insertStrategy = FieldStrategy.NOT_EMPTY,
        updateStrategy = FieldStrategy.NOT_EMPTY
    )
    private String password;

    private String status;

    @TableLogic
    private String isDeleted;
}
```

### MyBatis-Plus注解

| 注解 | 说明 |
|------|------|
| `@TableName` | 指定表名 |
| `@TableId` | 指定主键 |
| `@TableField` | 字段配置 |
| `@TableLogic` | 逻辑删除 |

**IdType类型:**
- `AUTO` - 数据库自增
- `ASSIGN_ID` - 雪花算法(默认)
- `INPUT` - 用户输入

## 多租户设计

### 数据隔离方案

项目采用**共享数据库共享表**方案，通过 `tenant_id` 字段隔离:

```sql
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL,
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id',
    ...
);

CREATE INDEX idx_tenant_id ON sys_user (tenant_id);
```

### 自动注入租户条件

```java
// 原始SQL
SELECT * FROM sys_user WHERE user_name = 'admin'

// 自动转换为
SELECT * FROM sys_user WHERE user_name = 'admin' AND tenant_id = '000000'
```

### 跨租户查询

```java
// 临时忽略租户隔离
TenantHelper.ignore(() -> {
    return baseMapper.selectList(null);
});

// 指定租户ID查询
TenantHelper.dynamic("000001", () -> {
    return baseMapper.selectList(null);
});
```

## 性能优化

### 查询优化

```sql
-- ❌ 不推荐
SELECT * FROM sys_user WHERE user_id = 1;

-- ✅ 只查询需要的字段
SELECT user_id, user_name, status FROM sys_user WHERE user_id = 1;

-- ❌ 深分页性能差
SELECT * FROM sys_oper_log ORDER BY oper_time DESC LIMIT 100000, 10;

-- ✅ 使用游标分页
SELECT * FROM sys_oper_log WHERE oper_id < 100000 ORDER BY oper_id DESC LIMIT 10;
```

### 写入优化

```java
// ❌ 循环单条插入
for (SysUser user : userList) {
    baseMapper.insert(user);
}

// ✅ 批量插入
baseMapper.insertBatch(userList);
```

### 大表优化

1. **分区表** - 按时间分区
2. **冷热分离** - 热数据和冷数据分开存储
3. **定期归档** - 历史数据迁移到归档表

## 最佳实践

### 推荐做法

| 规范 | 说明 |
|------|------|
| 审计字段 | 所有表包含 create_by/create_time/update_by/update_time |
| 逻辑删除 | 使用 is_deleted 字段，不物理删除 |
| 租户字段 | 多租户表包含 tenant_id 并建索引 |
| 字段注释 | 所有字段添加 COMMENT |
| 默认值 | 状态默认'1'，删除标志默认'0' |
| 主键类型 | 使用 BIGINT 雪花ID |
| 时间类型 | 使用 DATETIME 而非 TIMESTAMP |
| 状态字段 | 使用 CHAR(1) 而非数字 |

### 避免做法

| 问题 | 说明 |
|------|------|
| SELECT * | 只查询需要的字段 |
| 外键约束 | 在应用层维护引用完整性 |
| TIMESTAMP | 有2038年问题，用DATETIME |
| 过多索引 | 单表索引不超过5个 |
| UUID主键 | 无序插入性能差 |

## 常见问题

### 1. 自增ID还是雪花ID?

**推荐雪花ID:**
- 全局唯一，分布式环境友好
- 按时间趋势递增，有序插入
- 不依赖数据库

```java
@TableId(value = "user_id", type = IdType.ASSIGN_ID)
private Long userId;
```

### 2. 状态用数字还是字符?

**推荐CHAR(1):**
- 可读性好 ('1'/'0')
- 易于扩展 ('1'正常/'0'停用/'2'锁定)

```sql
status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'
```

### 3. DATETIME还是TIMESTAMP?

**推荐DATETIME:**
- 范围大 (1000~9999年)
- 不受时区影响
- 无2038年问题

### 4. 金额用什么类型?

**推荐DECIMAL:**

```sql
price DECIMAL(10, 2) COMMENT '价格(元)'
```

### 5. 索引失效怎么排查?

1. 检查是否使用函数计算
2. 检查是否有类型转换
3. 检查LIKE是否以通配符开头
4. 使用EXPLAIN分析执行计划

### 6. COUNT查询很慢?

```sql
-- 使用近似值
SELECT TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'your_database' AND TABLE_NAME = 'sys_oper_log';

-- 或使用Redis缓存计数
```

## 总结

数据库设计核心要点:

1. **命名规范** - snake_case，统一前缀
2. **必备字段** - 主键、租户ID、审计字段、逻辑删除
3. **字段类型** - BIGINT主键、CHAR(1)状态、DATETIME时间
4. **索引策略** - 租户索引、外键索引、查询条件索引
5. **多租户** - tenant_id字段 + MyBatis-Plus插件
6. **性能优化** - 避免SELECT *、批量操作、合理索引
