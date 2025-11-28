# 数据库设计最佳实践

## 介绍

数据库设计是应用系统开发的核心基础,良好的数据库设计直接影响系统的性能、可维护性和扩展性。RuoYi-Plus-UniApp 项目基于 MyBatis-Plus 和 MySQL,采用统一的数据库设计规范,确保多租户架构下的数据一致性和安全性。

**核心设计理念:**

- **规范化设计** - 遵循数据库范式,避免数据冗余和异常
- **审计追踪** - 完整记录数据的创建、修改和删除信息
- **逻辑删除** - 采用逻辑删除而非物理删除,保留数据历史
- **多租户支持** - 内置租户ID隔离,确保数据安全
- **性能优化** - 合理设计索引,优化查询性能
- **扩展性** - 预留扩展字段,支持业务发展

**技术栈:**

- **数据库**: MySQL 5.7+ / 8.0+
- **ORM框架**: MyBatis-Plus 3.5.14
- **连接池**: HikariCP (Spring Boot 默认)
- **多数据库支持**: MySQL / Oracle / PostgreSQL / SQL Server

## 数据库设计原则

### 1. 命名规范

#### 表命名规范

所有表名使用小写字母和下划线分隔,必须添加表前缀以区分模块:

| 表类型 | 前缀 | 说明 | 示例 |
|-------|------|------|------|
| 系统表 | `sys_` | 系统核心功能表 | `sys_user`, `sys_role`, `sys_menu` |
| 基础业务表 | `b_` | 通用业务表 | `b_ad`, `b_bind` |
| 商城模块表 | `m_` | 电商相关表 | `m_goods`, `m_order`, `m_cart` |
| 工作流表 | `wf_` | 工作流引擎表 | `wf_definition`, `wf_instance` |

**命名建议:**

```sql
-- ✅ 正确示例
CREATE TABLE sys_user (...);
CREATE TABLE m_goods (...);
CREATE TABLE b_ad (...);

-- ❌ 错误示例
CREATE TABLE user (...);              -- 缺少前缀
CREATE TABLE SysUser (...);            -- 不应使用驼峰命名
CREATE TABLE sys_user_info_detail (...);  -- 名称过长
```

#### 字段命名规范

字段名使用小写字母和下划线分隔,应具有明确的业务含义:

**基本规则:**

- 主键: `id` 或 `{表名}_id` (如 `user_id`)
- 外键: `{关联表名}_id` (如 `dept_id`, `role_id`)
- 布尔值: 使用 `is_` 前缀 (如 `is_deleted`, `is_enabled`)
- 时间字段: `{动作}_time` (如 `create_time`, `update_time`)
- 状态字段: `status` 或 `{业务}_status`

**示例:**

```sql
CREATE TABLE sys_user (
    user_id       BIGINT(20)   NOT NULL COMMENT '用户ID',
    dept_id       BIGINT(20)   DEFAULT NULL COMMENT '部门ID',
    user_name     VARCHAR(30)  DEFAULT NULL COMMENT '用户账号',
    nick_name     VARCHAR(30)  DEFAULT NULL COMMENT '用户昵称',
    email         VARCHAR(50)  DEFAULT '' COMMENT '用户邮箱',
    phone         VARCHAR(11)  DEFAULT '' COMMENT '手机号码',
    status        CHAR(1)      DEFAULT '1' COMMENT '帐号状态(0停用 1正常)',
    is_deleted    CHAR(1)      DEFAULT '0' COMMENT '删除标志(0正常 1删除)',
    create_by     BIGINT(20)   DEFAULT NULL COMMENT '创建者',
    create_time   DATETIME     COMMENT '创建时间',
    update_by     BIGINT(20)   DEFAULT NULL COMMENT '更新者',
    update_time   DATETIME     COMMENT '更新时间',
    remark        VARCHAR(500) DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (user_id)
) ENGINE=InnoDB COMMENT='用户信息表';
```

### 2. 数据类型选择

选择合适的数据类型可以节省存储空间并提升查询性能:

#### 数值类型

| 业务场景 | 数据库类型 | Java类型 | 长度说明 | 示例 |
|---------|-----------|----------|---------|------|
| 主键ID | `BIGINT(20)` | `Long` | 支持千亿级数据 | `user_id BIGINT(20)` |
| 整数 | `INT` | `Integer` | -21亿 ~ 21亿 | `age INT` |
| 金额 | `DECIMAL(10,2)` | `BigDecimal` | 精确到分 | `price DECIMAL(10,2)` |
| 百分比 | `DECIMAL(5,2)` | `BigDecimal` | 0.00 ~ 100.00 | `discount DECIMAL(5,2)` |
| 数量/排序 | `BIGINT` | `Long` | 大数量支持 | `stock BIGINT`, `sort_order BIGINT` |

**金额字段示例:**

```sql
-- 商品价格设计
CREATE TABLE m_goods (
    id             BIGINT(20)     NOT NULL COMMENT '商品ID',
    original_price DECIMAL(10,2)  COMMENT '原价',
    discount       DECIMAL(5,2)   DEFAULT 1.00 COMMENT '折扣(0.00-1.00)',
    price          DECIMAL(10,2)  NOT NULL COMMENT '现价',
    PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='商品表';
```

#### 字符串类型

| 业务场景 | 数据库类型 | 说明 | 示例 |
|---------|-----------|------|------|
| 状态标识 | `CHAR(1)` | 固定长度,性能好 | `status CHAR(1) DEFAULT '1'` |
| 租户ID | `VARCHAR(20)` | 支持自定义租户编码 | `tenant_id VARCHAR(20) DEFAULT '000000'` |
| 用户名/账号 | `VARCHAR(30)` | 一般30字符足够 | `user_name VARCHAR(30)` |
| 昵称/姓名 | `VARCHAR(30)` | 支持中文姓名 | `nick_name VARCHAR(30)` |
| 邮箱 | `VARCHAR(50)` | 标准邮箱长度 | `email VARCHAR(50)` |
| 手机号 | `VARCHAR(11)` | 固定11位 | `phone VARCHAR(11)` |
| URL/路径 | `VARCHAR(255)` | 较长路径 | `url VARCHAR(255)` |
| 头像地址 | `VARCHAR(500)` | 支持长URL | `avatar VARCHAR(500)` |
| 简短备注 | `VARCHAR(500)` | 一般说明文字 | `remark VARCHAR(500)` |
| 长文本 | `TEXT` | 文章内容/描述 | `content TEXT` |
| 超长文本 | `LONGTEXT` | 大文本数据 | `detail LONGTEXT` |

**字符串长度选择原则:**

```sql
-- ✅ 正确: 根据业务合理选择长度
user_name VARCHAR(30)     -- 用户名最多30字符
phone     VARCHAR(11)     -- 手机号固定11位
remark    VARCHAR(500)    -- 备注一般500字符

-- ❌ 错误: 盲目使用VARCHAR(255)
user_name VARCHAR(255)    -- 浪费空间
phone     VARCHAR(255)    -- 长度过大
```

#### 时间日期类型

| 业务场景 | 数据库类型 | Java类型 | 精度 | 示例 |
|---------|-----------|----------|-----|------|
| 日期时间 | `DATETIME` | `Date` / `LocalDateTime` | 精确到秒 | `create_time DATETIME` |
| 日期 | `DATE` | `Date` / `LocalDate` | 仅日期 | `birth_date DATE` |
| 时间戳 | `TIMESTAMP` | `Timestamp` | 精确到毫秒 | `update_time TIMESTAMP` |

**时间字段示例:**

```sql
-- 审计字段标准时间设计
CREATE TABLE sys_tenant (
    id          BIGINT(20) NOT NULL COMMENT 'ID',
    tenant_id   VARCHAR(20) NOT NULL COMMENT '租户ID',
    company_name VARCHAR(30) COMMENT '企业名称',
    expire_time DATETIME COMMENT '过期时间',              -- 业务时间
    create_dept BIGINT(20) COMMENT '创建部门',
    create_by   BIGINT(20) COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',              -- 审计时间
    update_by   BIGINT(20) COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',              -- 审计时间
    is_deleted  CHAR(1) DEFAULT '0' COMMENT '删除标志',
    PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='租户表';
```

### 3. 默认值和约束

合理使用默认值可以简化业务逻辑,减少 NULL 值处理:

#### 默认值规范

| 字段类型 | 默认值 | 说明 |
|---------|-------|------|
| 状态字段 | `'1'` | 1=正常/启用 |
| 删除标志 | `'0'` | 0=未删除 |
| 布尔字段 | `'0'` | 0=否, 1=是 |
| 字符串 | `''` | 空字符串而非NULL |
| 数值 | `0` 或 `NULL` | 根据业务语义 |
| 租户ID | `'000000'` | 默认租户 |

**示例:**

```sql
CREATE TABLE sys_social (
    id           BIGINT NOT NULL COMMENT '主键',
    user_id      BIGINT NOT NULL COMMENT '用户ID',
    tenant_id    VARCHAR(20) DEFAULT '000000' COMMENT '租户ID',
    source       VARCHAR(255) NOT NULL COMMENT '用户来源',
    user_name    VARCHAR(30) NOT NULL COMMENT '登录账号',
    nick_name    VARCHAR(30) DEFAULT '' COMMENT '用户昵称',
    email        VARCHAR(255) DEFAULT '' COMMENT '用户邮箱',
    status       CHAR(1) DEFAULT '1' COMMENT '状态(0停用 1正常)',
    is_deleted   CHAR(1) DEFAULT '0' COMMENT '删除标志',
    create_dept  BIGINT(20) COMMENT '创建部门',
    create_by    BIGINT(20) COMMENT '创建者',
    create_time  DATETIME COMMENT '创建时间',
    update_by    BIGINT(20) COMMENT '更新者',
    update_time  DATETIME COMMENT '更新时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='社会化关系表';
```

#### NOT NULL 约束

**必须使用 NOT NULL 的字段:**

- 主键字段
- 外键字段 (关键业务关联)
- 必填业务字段 (用户名、手机号等)
- 状态字段

**可以为 NULL 的字段:**

- 审计字段 (`create_by`, `update_by` 等)
- 可选业务字段
- 备注字段

### 4. 布尔值设计规范

项目统一使用 `CHAR(1)` 类型表示布尔值,而非 `BOOLEAN` 或 `TINYINT`:

| 字段场景 | 存储值 | 说明 |
|---------|-------|------|
| 正常状态 | `'1'` | 积极含义 (正常/启用/是) |
| 异常状态 | `'0'` | 消极含义 (停用/禁用/否) |
| 删除标记 | `'0'` | 未删除 |
| 删除标记 | `'1'` | 已删除 |

**示例:**

```sql
-- 状态字段: 1=正常, 0=停用
status CHAR(1) DEFAULT '1' COMMENT '帐号状态(0停用 1正常)'

-- 删除标志: 0=未删除, 1=已删除
is_deleted CHAR(1) DEFAULT '0' COMMENT '删除标志(0正常 1删除)'

-- 是否字段: 1=是, 0=否
is_enabled CHAR(1) DEFAULT '0' COMMENT '是否启用(0否 1是)'
is_admin   CHAR(1) DEFAULT '0' COMMENT '是否管理员(0否 1是)'
```

**Java 实体映射:**

```java
/**
 * 帐号状态(0停用 1正常)
 */
private String status;

/**
 * 删除标志(0正常 1删除)
 */
@TableLogic
@TableField(value = "is_deleted", fill = FieldFill.INSERT)
private String isDeleted;
```

## 表设计规范

### 1. 审计字段 (必备)

所有业务表都必须包含完整的审计字段,用于追踪数据变更:

**标准审计字段集:**

```sql
CREATE TABLE {table_name} (
    id          BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键ID',

    -- 业务字段...

    -- 审计字段 (必备)
    create_dept BIGINT(20)   DEFAULT NULL COMMENT '创建部门',
    create_by   BIGINT(20)   DEFAULT NULL COMMENT '创建者',
    create_time DATETIME     COMMENT '创建时间',
    update_by   BIGINT(20)   DEFAULT NULL COMMENT '更新者',
    update_time DATETIME     COMMENT '更新时间',

    -- 逻辑删除字段 (必备)
    is_deleted  CHAR(1)      DEFAULT '0' COMMENT '删除标志(0正常 1删除)',

    -- 备注字段 (可选)
    remark      VARCHAR(500) DEFAULT NULL COMMENT '备注',

    PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='业务表';
```

**审计字段说明:**

| 字段名 | 类型 | 说明 | 自动填充 |
|-------|------|------|---------|
| `create_dept` | `BIGINT(20)` | 创建部门ID | 新增时填充 |
| `create_by` | `BIGINT(20)` | 创建者用户ID | 新增时填充 |
| `create_time` | `DATETIME` | 创建时间 | 新增时填充 |
| `update_by` | `BIGINT(20)` | 更新者用户ID | 更新时填充 |
| `update_time` | `DATETIME` | 更新时间 | 更新时填充 |
| `is_deleted` | `CHAR(1)` | 逻辑删除标志 | 默认 '0' |

**MyBatis-Plus 自动填充配置:**

```java
// 实体继承基类
@Data
@EqualsAndHashCode(callSuper = true)
public class MyEntity extends BaseEntity {
    // 业务字段...
}

// BaseEntity 基类定义
public class BaseEntity implements Serializable {

    /** 创建部门 */
    @TableField(fill = FieldFill.INSERT)
    private Long createDept;

    /** 创建者 */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /** 更新者 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;

    /** 删除标志 */
    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private String isDeleted;

    /** 备注 */
    private String remark;
}
```

### 2. 多租户支持

多租户系统需要在表中添加 `tenant_id` 字段实现数据隔离:

**租户字段规范:**

```sql
CREATE TABLE sys_user (
    user_id    BIGINT(20)  NOT NULL COMMENT '用户ID',
    tenant_id  VARCHAR(20) DEFAULT '000000' COMMENT '租户ID',
    user_name  VARCHAR(30) NOT NULL COMMENT '用户账号',
    dept_id    BIGINT(20)  COMMENT '部门ID',
    -- 其他字段...
    PRIMARY KEY (user_id),
    KEY idx_tenant_id (tenant_id)
) ENGINE=InnoDB COMMENT='用户信息表';
```

**租户实体基类:**

```java
/**
 * 租户基类
 */
public class TenantEntity extends BaseEntity {

    /** 租户ID */
    @TableField(value = "tenant_id", fill = FieldFill.INSERT)
    private String tenantId;

    // ... 审计字段
}
```

**多租户配置:**

```java
// 实体继承租户基类
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends TenantEntity {

    @TableId(value = "user_id")
    private Long userId;

    private String userName;

    // ... 其他字段
}
```

**租户过滤:**

MyBatis-Plus 自动拦截 SQL,添加 `tenant_id` 条件:

```sql
-- 原始SQL
SELECT * FROM sys_user WHERE user_name = 'admin';

-- 自动添加租户过滤
SELECT * FROM sys_user WHERE user_name = 'admin' AND tenant_id = '000000';
```

### 3. 逻辑删除

采用逻辑删除而非物理删除,保留数据历史:

**逻辑删除字段:**

```sql
is_deleted CHAR(1) DEFAULT '0' COMMENT '删除标志(0正常 1删除)'
```

**逻辑删除注解:**

```java
@TableLogic
@TableField(value = "is_deleted", fill = FieldFill.INSERT)
private String isDeleted;
```

**自动拦截效果:**

```java
// 业务代码: 删除操作
userMapper.deleteById(1L);

// 实际执行SQL: 更新 is_deleted 字段
UPDATE sys_user SET is_deleted = '1' WHERE user_id = 1;

// 业务代码: 查询操作
userMapper.selectList(null);

// 实际执行SQL: 自动过滤已删除数据
SELECT * FROM sys_user WHERE is_deleted = '0';
```

### 4. 主键设计

**推荐主键策略:**

1. **自增主键** (推荐): MySQL 使用 `AUTO_INCREMENT`
2. **雪花算法**: 分布式环境使用雪花ID
3. **UUID**: 极少使用,性能较差

**自增主键示例:**

```sql
CREATE TABLE sys_dept (
    dept_id   BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '部门ID',
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户ID',
    dept_name VARCHAR(30) NOT NULL COMMENT '部门名称',
    PRIMARY KEY (dept_id)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT='部门表';
```

**雪花ID示例:**

```java
@TableId(value = "id", type = IdType.ASSIGN_ID)
private Long id;
```

## 字段设计规范

### 1. 外键设计

项目采用**逻辑外键**而非物理外键,由应用层保证数据一致性:

**逻辑外键示例:**

```sql
-- 用户表
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL COMMENT '用户ID',
    dept_id BIGINT(20) COMMENT '部门ID',  -- 逻辑外键
    role_id BIGINT(20) COMMENT '角色ID',  -- 逻辑外键
    PRIMARY KEY (user_id),
    KEY idx_dept_id (dept_id),  -- 为外键建索引
    KEY idx_role_id (role_id)
) ENGINE=InnoDB COMMENT='用户表';
```

**为什么不用物理外键?**

- ❌ 影响数据库性能 (级联操作锁表)
- ❌ 分库分表困难
- ❌ 数据迁移复杂
- ✅ 应用层控制更灵活

### 2. JSON 字段设计

对于复杂的非结构化数据,可以使用 JSON 类型或 TEXT 类型存储:

**JSON 字段示例:**

```sql
CREATE TABLE sys_tenant_package (
    package_id BIGINT(20) NOT NULL COMMENT '套餐ID',
    package_name VARCHAR(20) COMMENT '套餐名称',
    menu_ids VARCHAR(3000) COMMENT '关联菜单ID(JSON数组)',
    PRIMARY KEY (package_id)
) ENGINE=InnoDB COMMENT='租户套餐表';
```

**Java 实体映射:**

```java
/**
 * 关联菜单ID
 */
private String menuIds;  // 存储格式: [1,2,3,4,5]
```

**序列化处理:**

```java
// 存储前序列化
String menuIds = JSON.toJSONString(menuIdList);

// 查询后反序列化
List<Long> menuIdList = JSON.parseArray(menuIds, Long.class);
```

### 3. 枚举字段设计

固定值字段应使用字典表或枚举管理:

**字典字段示例:**

```sql
CREATE TABLE m_goods (
    id       BIGINT(20) NOT NULL COMMENT '商品ID',
    category VARCHAR(50) COMMENT '商品分类',  -- 使用字典: b_goods_category
    status   CHAR(1) DEFAULT '1' COMMENT '状态(字典: sys_enable_status)',
    spec_type CHAR(1) DEFAULT '0' COMMENT '规格类型(0单规格 1多规格)',
    PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='商品表';
```

**字典数据管理:**

```sql
-- 1. 创建字典类型
INSERT INTO sys_dict_type (dict_id, tenant_id, dict_name, dict_type, status)
VALUES (100, '000000', '商品分类', 'b_goods_category', '1');

-- 2. 创建字典数据
INSERT INTO sys_dict_data (dict_data_id, dict_type, dict_label, dict_value, dict_sort, status)
VALUES
(1001, 'b_goods_category', '电子产品', 'electronics', 1, '1'),
(1002, 'b_goods_category', '服装鞋包', 'clothing', 2, '1'),
(1003, 'b_goods_category', '食品饮料', 'food', 3, '1');
```

**Java 实体注解:**

```java
/**
 * 商品分类
 */
@ExcelProperty(value = "商品分类", converter = ExcelDictConvert.class)
@ExcelDictFormat(dictType = "b_goods_category")
private String category;

/**
 * 状态
 */
@ExcelProperty(value = "状态", converter = ExcelDictConvert.class)
@ExcelDictFormat(dictType = "sys_enable_status")
private String status;
```

## 索引设计

### 1. 索引类型

| 索引类型 | 关键字 | 说明 | 示例 |
|---------|-------|------|------|
| 主键索引 | `PRIMARY KEY` | 唯一且非空 | `PRIMARY KEY (user_id)` |
| 唯一索引 | `UNIQUE KEY` | 唯一约束 | `UNIQUE KEY uk_user_name (user_name)` |
| 普通索引 | `KEY` / `INDEX` | 加速查询 | `KEY idx_dept_id (dept_id)` |
| 复合索引 | `KEY` | 多字段索引 | `KEY idx_status_deleted (status, is_deleted)` |
| 全文索引 | `FULLTEXT` | 全文检索 | `FULLTEXT KEY ft_content (content)` |

### 2. 索引设计原则

**何时创建索引:**

- ✅ 主键字段 (自动创建)
- ✅ 外键字段
- ✅ WHERE 条件频繁使用的字段
- ✅ ORDER BY 排序字段
- ✅ GROUP BY 分组字段
- ✅ JOIN 关联字段
- ✅ 唯一性约束字段

**何时不创建索引:**

- ❌ 表数据很少 (< 1000 行)
- ❌ 频繁增删改的表
- ❌ 区分度很低的字段 (如性别)
- ❌ TEXT/BLOB 大字段

**复合索引最左前缀原则:**

```sql
-- 创建复合索引
KEY idx_dept_status_time (dept_id, status, create_time)

-- 可以使用索引的查询:
WHERE dept_id = 1;                                -- ✅ 使用 dept_id
WHERE dept_id = 1 AND status = '1';              -- ✅ 使用 dept_id, status
WHERE dept_id = 1 AND status = '1' AND create_time > '2024-01-01';  -- ✅ 全部使用

-- 无法使用索引的查询:
WHERE status = '1';                              -- ❌ 跳过 dept_id
WHERE create_time > '2024-01-01';                -- ❌ 跳过前两个字段
```

### 3. 索引设计示例

**用户表索引:**

```sql
CREATE TABLE sys_user (
    user_id     BIGINT(20)  NOT NULL COMMENT '用户ID',
    tenant_id   VARCHAR(20) DEFAULT '000000' COMMENT '租户ID',
    user_name   VARCHAR(30) NOT NULL COMMENT '用户账号',
    dept_id     BIGINT(20)  COMMENT '部门ID',
    email       VARCHAR(50) DEFAULT '' COMMENT '用户邮箱',
    phone       VARCHAR(11) DEFAULT '' COMMENT '手机号码',
    status      CHAR(1)     DEFAULT '1' COMMENT '状态',
    create_time DATETIME    COMMENT '创建时间',
    is_deleted  CHAR(1)     DEFAULT '0' COMMENT '删除标志',

    -- 主键索引
    PRIMARY KEY (user_id),

    -- 唯一索引 (业务唯一性约束)
    UNIQUE KEY uk_user_name (user_name),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_phone (phone),

    -- 普通索引 (频繁查询字段)
    KEY idx_tenant_id (tenant_id),
    KEY idx_dept_id (dept_id),
    KEY idx_status (status),
    KEY idx_create_time (create_time),

    -- 复合索引 (组合查询)
    KEY idx_tenant_status_deleted (tenant_id, status, is_deleted)
) ENGINE=InnoDB COMMENT='用户信息表';
```

**商品表索引:**

```sql
CREATE TABLE m_goods (
    id          BIGINT(20)    NOT NULL COMMENT '商品ID',
    tenant_id   VARCHAR(20)   DEFAULT '000000' COMMENT '租户ID',
    category    VARCHAR(50)   COMMENT '商品分类',
    code        VARCHAR(30)   COMMENT '商品编码',
    name        VARCHAR(100)  COMMENT '商品名称',
    price       DECIMAL(10,2) COMMENT '价格',
    stock       BIGINT        COMMENT '库存',
    status      CHAR(1)       DEFAULT '1' COMMENT '状态',
    sort_order  BIGINT        COMMENT '排序',
    create_time DATETIME      COMMENT '创建时间',
    is_deleted  CHAR(1)       DEFAULT '0' COMMENT '删除标志',

    PRIMARY KEY (id),
    UNIQUE KEY uk_code (code),
    KEY idx_tenant_id (tenant_id),
    KEY idx_category (category),
    KEY idx_status (status),
    KEY idx_sort_order (sort_order),
    KEY idx_price (price),
    KEY idx_tenant_status_deleted (tenant_id, status, is_deleted)
) ENGINE=InnoDB COMMENT='商品表';
```

### 4. 索引优化建议

**避免索引失效:**

```sql
-- ❌ 使用函数导致索引失效
SELECT * FROM sys_user WHERE YEAR(create_time) = 2024;

-- ✅ 使用范围查询
SELECT * FROM sys_user WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01';

-- ❌ 类型不匹配导致索引失效
SELECT * FROM sys_user WHERE user_id = '1';  -- user_id 是 BIGINT

-- ✅ 类型匹配
SELECT * FROM sys_user WHERE user_id = 1;

-- ❌ LIKE 以通配符开头
SELECT * FROM sys_user WHERE user_name LIKE '%admin%';

-- ✅ LIKE 通配符在尾部
SELECT * FROM sys_user WHERE user_name LIKE 'admin%';
```

**控制索引数量:**

- 单表索引数量控制在 5-8 个以内
- 复合索引字段数不超过 5 个
- 定期分析和清理无用索引

## 关系设计

### 1. 一对一关系

通过外键关联实现一对一关系:

**示例: 用户与用户详情**

```sql
-- 用户表
CREATE TABLE sys_user (
    user_id   BIGINT(20) NOT NULL COMMENT '用户ID',
    user_name VARCHAR(30) NOT NULL COMMENT '用户账号',
    PRIMARY KEY (user_id)
) ENGINE=InnoDB COMMENT='用户表';

-- 用户详情表
CREATE TABLE sys_user_detail (
    user_id  BIGINT(20) NOT NULL COMMENT '用户ID',
    address  VARCHAR(200) COMMENT '地址',
    bio      TEXT COMMENT '个人简介',
    PRIMARY KEY (user_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB COMMENT='用户详情表';
```

### 2. 一对多关系

通过外键在"多"方引用"一"方的主键:

**示例: 部门与用户**

```sql
-- 部门表 (一)
CREATE TABLE sys_dept (
    dept_id   BIGINT(20) NOT NULL COMMENT '部门ID',
    dept_name VARCHAR(30) NOT NULL COMMENT '部门名称',
    PRIMARY KEY (dept_id)
) ENGINE=InnoDB COMMENT='部门表';

-- 用户表 (多)
CREATE TABLE sys_user (
    user_id   BIGINT(20) NOT NULL COMMENT '用户ID',
    dept_id   BIGINT(20) COMMENT '部门ID',
    user_name VARCHAR(30) NOT NULL COMMENT '用户账号',
    PRIMARY KEY (user_id),
    KEY idx_dept_id (dept_id)
) ENGINE=InnoDB COMMENT='用户表';
```

### 3. 多对多关系

通过中间表实现多对多关系:

**示例: 用户与角色**

```sql
-- 用户表
CREATE TABLE sys_user (
    user_id   BIGINT(20) NOT NULL COMMENT '用户ID',
    user_name VARCHAR(30) NOT NULL COMMENT '用户账号',
    PRIMARY KEY (user_id)
) ENGINE=InnoDB COMMENT='用户表';

-- 角色表
CREATE TABLE sys_role (
    role_id   BIGINT(20) NOT NULL COMMENT '角色ID',
    role_name VARCHAR(30) NOT NULL COMMENT '角色名称',
    PRIMARY KEY (role_id)
) ENGINE=InnoDB COMMENT='角色表';

-- 用户角色关联表 (中间表)
CREATE TABLE sys_user_role (
    user_id BIGINT(20) NOT NULL COMMENT '用户ID',
    role_id BIGINT(20) NOT NULL COMMENT '角色ID',
    PRIMARY KEY (user_id, role_id),
    KEY idx_user_id (user_id),
    KEY idx_role_id (role_id)
) ENGINE=InnoDB COMMENT='用户角色关联表';
```

### 4. 树形结构设计

使用左右值编码或邻接列表实现树形结构:

**邻接列表方式:**

```sql
CREATE TABLE sys_dept (
    dept_id   BIGINT(20)   NOT NULL COMMENT '部门ID',
    tenant_id VARCHAR(20)  DEFAULT '000000' COMMENT '租户ID',
    parent_id BIGINT(20)   DEFAULT 0 COMMENT '父部门ID',
    ancestors VARCHAR(500) DEFAULT '' COMMENT '祖级列表',
    dept_name VARCHAR(30)  NOT NULL COMMENT '部门名称',
    order_num INT          DEFAULT 0 COMMENT '显示顺序',
    leader_id BIGINT(20)   COMMENT '负责人ID',
    phone     VARCHAR(11)  COMMENT '联系电话',
    email     VARCHAR(50)  COMMENT '邮箱',
    status    CHAR(1)      DEFAULT '1' COMMENT '状态',
    is_deleted CHAR(1)     DEFAULT '0' COMMENT '删除标志',
    create_dept BIGINT(20) COMMENT '创建部门',
    create_by BIGINT(20)   COMMENT '创建者',
    create_time DATETIME   COMMENT '创建时间',
    update_by BIGINT(20)   COMMENT '更新者',
    update_time DATETIME   COMMENT '更新时间',

    PRIMARY KEY (dept_id),
    KEY idx_tenant_id (tenant_id),
    KEY idx_parent_id (parent_id)
) ENGINE=InnoDB COMMENT='部门表';
```

**ancestors 字段说明:**

- 存储从根节点到当前节点的所有父节点ID
- 格式: `0,100,101,102` (逗号分隔)
- 用于快速查询所有子部门

## 性能优化

### 1. 分区表设计

对于大数据量表,可以使用分区提升查询性能:

**按时间分区:**

```sql
CREATE TABLE sys_log_operate (
    log_id      BIGINT(20)   NOT NULL COMMENT '日志ID',
    title       VARCHAR(50)  COMMENT '模块标题',
    oper_name   VARCHAR(50)  COMMENT '操作人员',
    create_time DATETIME     COMMENT '操作时间',
    PRIMARY KEY (log_id, create_time)
) ENGINE=InnoDB
PARTITION BY RANGE (YEAR(create_time)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### 2. 字段顺序优化

合理安排字段顺序可以减少存储空间:

**优化原则:**

- 固定长度字段在前 (`CHAR`, `INT`, `BIGINT`)
- 可变长度字段在后 (`VARCHAR`, `TEXT`)
- NOT NULL 字段在前
- 经常一起查询的字段相邻

**示例:**

```sql
CREATE TABLE optimized_table (
    -- 主键 (固定长度)
    id BIGINT(20) NOT NULL,

    -- 固定长度 NOT NULL 字段
    status CHAR(1) NOT NULL DEFAULT '1',
    is_deleted CHAR(1) NOT NULL DEFAULT '0',

    -- 固定长度可空字段
    create_by BIGINT(20),
    create_time DATETIME,

    -- 可变长度字段
    name VARCHAR(100),
    description VARCHAR(500),

    -- 大字段放最后
    content TEXT,

    PRIMARY KEY (id)
) ENGINE=InnoDB;
```

### 3. 冷热数据分离

将历史数据迁移到归档表,保持主表数据量较小:

**主表:**

```sql
CREATE TABLE sys_log_operate (
    log_id      BIGINT(20) NOT NULL COMMENT '日志ID',
    title       VARCHAR(50) COMMENT '模块标题',
    create_time DATETIME COMMENT '操作时间',
    PRIMARY KEY (log_id),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB COMMENT='操作日志表';
```

**归档表:**

```sql
CREATE TABLE sys_log_operate_archive (
    log_id      BIGINT(20) NOT NULL COMMENT '日志ID',
    title       VARCHAR(50) COMMENT '模块标题',
    create_time DATETIME COMMENT '操作时间',
    archive_time DATETIME COMMENT '归档时间',
    PRIMARY KEY (log_id),
    KEY idx_create_time (create_time),
    KEY idx_archive_time (archive_time)
) ENGINE=InnoDB COMMENT='操作日志归档表';
```

**归档策略:**

```sql
-- 定期归档半年前的数据
INSERT INTO sys_log_operate_archive
SELECT *, NOW() AS archive_time
FROM sys_log_operate
WHERE create_time < DATE_SUB(NOW(), INTERVAL 6 MONTH);

DELETE FROM sys_log_operate
WHERE create_time < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

### 4. 垂直分表

将大表拆分为多个小表,提升查询性能:

**拆分前 (单表):**

```sql
CREATE TABLE sys_user (
    user_id    BIGINT(20) NOT NULL,
    user_name  VARCHAR(30),
    password   VARCHAR(100),
    nick_name  VARCHAR(30),
    avatar     VARCHAR(500),  -- 不常用
    email      VARCHAR(50),
    phone      VARCHAR(11),
    address    VARCHAR(200),  -- 不常用
    bio        TEXT,          -- 不常用
    status     CHAR(1),
    create_time DATETIME,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;
```

**拆分后 (垂直分表):**

```sql
-- 用户基本信息表 (常用字段)
CREATE TABLE sys_user (
    user_id    BIGINT(20) NOT NULL,
    user_name  VARCHAR(30),
    password   VARCHAR(100),
    nick_name  VARCHAR(30),
    email      VARCHAR(50),
    phone      VARCHAR(11),
    status     CHAR(1),
    create_time DATETIME,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB COMMENT='用户基本信息表';

-- 用户扩展信息表 (不常用字段)
CREATE TABLE sys_user_profile (
    user_id    BIGINT(20) NOT NULL,
    avatar     VARCHAR(500),
    address    VARCHAR(200),
    bio        TEXT,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB COMMENT='用户扩展信息表';
```

## 最佳实践

### 1. 数据库设计检查清单

**表设计检查:**

- [ ] 表名使用小写+下划线,添加模块前缀
- [ ] 每张表都有主键
- [ ] 包含完整的审计字段 (create_dept, create_by, create_time, update_by, update_time)
- [ ] 添加逻辑删除字段 (is_deleted)
- [ ] 多租户表添加 tenant_id 字段
- [ ] 字段类型和长度选择合理
- [ ] 每个字段都有清晰的注释
- [ ] 表注释说明表的用途

**字段设计检查:**

- [ ] 主键使用 BIGINT(20) 类型
- [ ] 状态字段使用 CHAR(1) 类型
- [ ] 金额字段使用 DECIMAL 类型
- [ ] 时间字段使用 DATETIME 类型
- [ ] 字符串字段长度合理
- [ ] 设置合适的默认值
- [ ] NOT NULL 约束使用正确

**索引设计检查:**

- [ ] 主键字段有主键索引
- [ ] 外键字段建议添加索引
- [ ] 唯一性约束字段添加唯一索引
- [ ] 频繁查询字段添加索引
- [ ] 复合索引遵循最左前缀原则
- [ ] 索引数量不超过 8 个

**字典配置检查:**

- [ ] 固定选项的字段配置了字典
- [ ] 字典类型命名规范
- [ ] 字典数据完整

### 2. SQL 脚本管理规范

**脚本文件存放:**

| 脚本类型 | 文件路径 | 说明 |
|---------|---------|------|
| 系统表 | `script/sql/ry_plus_sys.sql` | 系统核心表 |
| 工作流表 | `script/sql/ry_plus_workflow.sql` | 工作流引擎表 |
| 任务调度表 | `script/sql/ry_plus_job.sql` | SnailJob表 |
| 新业务表 | `script/sql/ry_plus_new.sql` | ⭐ 新开发的业务表 |

**脚本编写规范:**

```sql
-- ======================================
-- 表名: m_goods
-- 说明: 商品表
-- 作者: 抓蛙师
-- 日期: 2025-01-15
-- ======================================

DROP TABLE IF EXISTS m_goods;

CREATE TABLE m_goods (
    id             BIGINT(20)    NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    tenant_id      VARCHAR(20)   DEFAULT '000000' COMMENT '租户ID',
    category       VARCHAR(50)   COMMENT '商品分类',
    code           VARCHAR(30)   COMMENT '商品编码',
    name           VARCHAR(100)  NOT NULL COMMENT '商品名称',
    img            VARCHAR(500)  COMMENT '商品主图',
    imgs           VARCHAR(2000) COMMENT '商品图片集',
    spec_type      CHAR(1)       DEFAULT '0' COMMENT '规格类型(0单规格 1多规格)',
    original_price DECIMAL(10,2) COMMENT '原价',
    discount       DECIMAL(5,2)  DEFAULT 1.00 COMMENT '折扣',
    price          DECIMAL(10,2) NOT NULL COMMENT '价格',
    description    TEXT          COMMENT '商品描述',
    stock          BIGINT        DEFAULT 0 COMMENT '库存',
    sales_count    BIGINT        DEFAULT 0 COMMENT '销量',
    status         CHAR(1)       DEFAULT '1' COMMENT '状态(0停用 1正常)',
    sort_order     BIGINT        DEFAULT 0 COMMENT '排序',
    remark         VARCHAR(500)  COMMENT '备注',
    create_dept    BIGINT(20)    COMMENT '创建部门',
    create_by      BIGINT(20)    COMMENT '创建者',
    create_time    DATETIME      COMMENT '创建时间',
    update_by      BIGINT(20)    COMMENT '更新者',
    update_time    DATETIME      COMMENT '更新时间',
    is_deleted     CHAR(1)       DEFAULT '0' COMMENT '删除标志(0正常 1删除)',

    PRIMARY KEY (id),
    UNIQUE KEY uk_code (code),
    KEY idx_tenant_id (tenant_id),
    KEY idx_category (category),
    KEY idx_status (status),
    KEY idx_tenant_status_deleted (tenant_id, status, is_deleted)
) ENGINE=InnoDB AUTO_INCREMENT=1 COMMENT='商品表';

-- 初始化数据 (可选)
INSERT INTO m_goods (id, tenant_id, code, name, price, stock, status, create_dept, create_by, create_time)
VALUES (1, '000000', 'G001', '示例商品', 99.00, 100, '1', 100, 1, sysdate());
```

### 3. 字典设计最佳实践

**字典类型命名:**

| 字典类型 | 命名规则 | 示例 |
|---------|---------|------|
| 系统字典 | `sys_` + 功能名 | `sys_enable_status`, `sys_user_gender` |
| 业务字典 | 表前缀 + 字段名 | `m_goods_category`, `m_order_status` |

**新增字典示例:**

```sql
-- 1. 新增字典类型
INSERT INTO sys_dict_type (dict_id, tenant_id, dict_name, dict_type, is_system, status, create_dept, create_by, create_time, remark)
VALUES (100, '000000', '商品分类', 'm_goods_category', '0', '1', 100, 1, sysdate(), '商品分类字典');

-- 2. 新增字典数据
INSERT INTO sys_dict_data (dict_data_id, tenant_id, dict_sort, dict_label, dict_value, dict_type, list_class, is_default, status, create_dept, create_by, create_time, remark)
VALUES
(1001, '000000', 1, '电子产品', 'electronics', 'm_goods_category', 'primary', '0', '1', 100, 1, sysdate(), '电子产品'),
(1002, '000000', 2, '服装鞋包', 'clothing', 'm_goods_category', 'success', '0', '1', 100, 1, sysdate(), '服装鞋包'),
(1003, '000000', 3, '食品饮料', 'food', 'm_goods_category', 'warning', '0', '1', 100, 1, sysdate(), '食品饮料');
```

### 4. 实体类设计最佳实践

**标准实体类结构:**

```java
package plus.ruoyi.business.mall.domain;

import plus.ruoyi.common.tenant.core.TenantEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.io.Serial;

/**
 * 商品对象 m_goods
 *
 * @author 抓蛙师
 * @date 2025-01-15
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("m_goods")
public class Goods extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 商品ID
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 商品分类
     */
    private String category;

    /**
     * 商品编码
     */
    private String code;

    /**
     * 商品名称
     */
    private String name;

    /**
     * 商品主图
     */
    private String img;

    /**
     * 规格类型(0单规格 1多规格)
     */
    private String specType;

    /**
     * 原价
     */
    private BigDecimal originalPrice;

    /**
     * 价格
     */
    private BigDecimal price;

    /**
     * 商品描述
     */
    private String description;

    /**
     * 库存
     */
    private Long stock;

    /**
     * 状态
     */
    private String status;

    /**
     * 排序
     */
    private Long sortOrder;

    /**
     * 备注
     */
    private String remark;

    /**
     * 删除标志
     */
    @TableLogic
    private String isDeleted;
}
```

**继承体系:**

```
Goods (实体类)
  └─ TenantEntity (租户基类)
       ├─ tenant_id 字段
       └─ BaseEntity (基类)
            ├─ create_dept 字段
            ├─ create_by 字段
            ├─ create_time 字段
            ├─ update_by 字段
            ├─ update_time 字段
            ├─ is_deleted 字段
            └─ remark 字段
```

### 5. 数据库版本管理

使用 Flyway 或 Liquibase 管理数据库版本:

**Flyway 示例:**

```sql
-- V1.0.0__init_database.sql
CREATE TABLE sys_user (...);

-- V1.0.1__add_goods_table.sql
CREATE TABLE m_goods (...);

-- V1.0.2__alter_goods_add_discount.sql
ALTER TABLE m_goods ADD COLUMN discount DECIMAL(5,2) DEFAULT 1.00 COMMENT '折扣';
```

## 常见问题

### 1. 主键选择: 自增ID vs 雪花ID

**问题描述:**

在设计表时,应该选择自增ID还是雪花ID作为主键?

**问题分析:**

两种主键各有优缺点:

| 主键类型 | 优点 | 缺点 |
|---------|------|------|
| 自增ID | 简单、连续、占用空间小 | 分库分表时ID冲突、暴露数据量 |
| 雪花ID | 全局唯一、无冲突、适合分布式 | 占用空间大、不连续 |

**解决方案:**

根据业务场景选择:

```sql
-- 单体应用: 使用自增ID
CREATE TABLE m_goods (
    id BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=1;
```

```java
// 分布式应用: 使用雪花ID
@TableId(value = "id", type = IdType.ASSIGN_ID)
private Long id;
```

**最佳实践:**

- 单体应用推荐使用自增ID
- 分布式应用推荐使用雪花ID
- 不要在URL中直接暴露ID (使用UUID或加密)

### 2. 逻辑删除导致唯一索引失效

**问题描述:**

逻辑删除后,唯一索引无法保证业务唯一性:

```sql
-- 用户表唯一索引
UNIQUE KEY uk_user_name (user_name)

-- 问题场景:
-- 1. 用户A注册,user_name = 'admin', is_deleted = '0'
-- 2. 用户A注销,is_deleted = '1'
-- 3. 用户B注册,user_name = 'admin', is_deleted = '0'  -- ❌ 违反唯一约束
```

**解决方案:**

方案一: 唯一索引包含 is_deleted 字段

```sql
-- 修改唯一索引
UNIQUE KEY uk_user_name_deleted (user_name, is_deleted)

-- 允许同一user_name在不同删除状态下存在
```

方案二: 删除时修改用户名

```java
// 业务层处理
public void deleteUser(Long userId) {
    SysUser user = userMapper.selectById(userId);
    // 删除时添加时间戳后缀
    user.setUserName(user.getUserName() + "_deleted_" + System.currentTimeMillis());
    user.setIsDeleted("1");
    userMapper.updateById(user);
}
```

方案三: 使用物理删除 (不推荐)

```java
userMapper.deleteById(userId);  // 真正删除数据
```

**最佳实践:**

- 优先使用方案一 (修改唯一索引)
- 需要数据审计时使用方案二 (修改字段值)
- 不重要数据可以使用方案三 (物理删除)

### 3. 多租户数据隔离问题

**问题描述:**

多租户系统如何确保数据不会跨租户访问?

**问题场景:**

```java
// ❌ 错误: 忘记添加租户过滤
List<SysUser> users = userMapper.selectList(null);

// ✅ 正确: MyBatis-Plus 自动添加租户过滤
SELECT * FROM sys_user WHERE tenant_id = '000000';
```

**解决方案:**

1. **使用 MyBatis-Plus 租户插件:**

```java
// TenantLineInnerInterceptor 自动拦截SQL
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加租户插件
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new TenantLineHandler() {
            @Override
            public Expression getTenantId() {
                // 从上下文获取当前租户ID
                return new StringValue(TenantHelper.getTenantId());
            }

            @Override
            public String getTenantIdColumn() {
                return "tenant_id";
            }

            @Override
            public boolean ignoreTable(String tableName) {
                // 不需要租户过滤的表
                return Arrays.asList("sys_tenant", "sys_dict_type").contains(tableName);
            }
        }));
        return interceptor;
    }
}
```

2. **实体类继承 TenantEntity:**

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends TenantEntity {
    // 自动包含 tenant_id 字段
}
```

**最佳实践:**

- 所有业务表都添加 `tenant_id` 字段
- 实体类继承 `TenantEntity`
- 配置租户拦截器自动过滤
- 定期审计租户数据隔离性

### 4. TEXT 字段导致临时表

**问题描述:**

查询包含 TEXT/BLOB 字段时,MySQL 创建磁盘临时表导致性能下降:

```sql
-- ❌ 性能问题
SELECT * FROM m_goods WHERE status = '1';  -- 包含 description TEXT 字段
```

**问题分析:**

MySQL 对 TEXT/BLOB 字段的处理:

- 内存临时表最大为 `tmp_table_size` (默认 16MB)
- 超过限制时转为磁盘临时表
- 磁盘临时表性能远低于内存临时表

**解决方案:**

方案一: 垂直分表 (推荐)

```sql
-- 基本信息表
CREATE TABLE m_goods (
    id    BIGINT(20) NOT NULL,
    name  VARCHAR(100),
    price DECIMAL(10,2),
    PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='商品基本信息表';

-- 详情表
CREATE TABLE m_goods_detail (
    id          BIGINT(20) NOT NULL,
    description TEXT COMMENT '商品描述',
    PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='商品详情表';
```

方案二: 只查询需要的字段

```sql
-- ✅ 性能优化
SELECT id, name, price FROM m_goods WHERE status = '1';
```

方案三: 增大临时表大小

```sql
-- 调整MySQL配置 (治标不治本)
SET GLOBAL tmp_table_size = 64*1024*1024;  -- 64MB
SET GLOBAL max_heap_table_size = 64*1024*1024;
```

**最佳实践:**

- 大文本字段拆分到独立表
- 查询时明确指定需要的字段
- 避免 `SELECT *`

### 5. 索引过多导致写入性能下降

**问题描述:**

表有过多索引,导致 INSERT/UPDATE 操作变慢:

```sql
-- ❌ 索引过多
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL,
    user_name VARCHAR(30),
    dept_id BIGINT(20),
    status CHAR(1),
    email VARCHAR(50),
    phone VARCHAR(11),
    create_time DATETIME,

    PRIMARY KEY (user_id),
    KEY idx_user_name (user_name),
    KEY idx_dept_id (dept_id),
    KEY idx_status (status),
    KEY idx_email (email),
    KEY idx_phone (phone),
    KEY idx_create_time (create_time),
    KEY idx_status_dept (status, dept_id),
    KEY idx_dept_status_time (dept_id, status, create_time),
    KEY idx_user_dept_time (user_name, dept_id, create_time)  -- 索引过多!
) ENGINE=InnoDB;
```

**问题分析:**

- 每个索引都需要维护
- INSERT 操作需要更新所有索引
- UPDATE 操作需要更新相关索引
- 索引占用大量磁盘空间

**解决方案:**

1. **保留核心索引:**

```sql
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL,
    user_name VARCHAR(30),
    dept_id BIGINT(20),
    status CHAR(1),
    email VARCHAR(50),
    phone VARCHAR(11),
    create_time DATETIME,
    is_deleted CHAR(1) DEFAULT '0',

    PRIMARY KEY (user_id),
    UNIQUE KEY uk_user_name (user_name),
    KEY idx_dept_id (dept_id),
    KEY idx_status_deleted (status, is_deleted)  -- 只保留4个索引
) ENGINE=InnoDB;
```

2. **定期分析索引使用情况:**

```sql
-- 查看索引使用统计
SELECT
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'ruoyi_plus'
ORDER BY TABLE_NAME, INDEX_NAME;

-- 查看未使用的索引
SELECT
    object_schema,
    object_name,
    index_name
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE index_name IS NOT NULL
AND count_star = 0
ORDER BY object_schema, object_name;
```

**最佳实践:**

- 单表索引数量控制在 5-8 个
- 优先创建查询频繁的索引
- 定期分析和清理无用索引
- 考虑读写比例权衡索引数量

## 总结

数据库设计是系统架构的基石,良好的数据库设计应该:

**核心原则:**

1. **遵循规范** - 严格遵守命名、类型、字段规范
2. **审计追踪** - 完整记录数据变更历史
3. **逻辑删除** - 使用逻辑删除保留数据
4. **多租户隔离** - 确保租户数据安全
5. **性能优先** - 合理设计索引和表结构
6. **扩展性** - 预留扩展空间

**设计流程:**

```
需求分析 → 概念设计 → 逻辑设计 → 物理设计 → 评审 → 实施 → 优化
```

**质量检查:**

- ✅ 表名、字段名符合规范
- ✅ 主键、索引设计合理
- ✅ 包含完整审计字段
- ✅ 逻辑删除字段配置正确
- ✅ 多租户字段配置正确
- ✅ 数据类型和长度合理
- ✅ 默认值和约束正确
- ✅ 字典配置完整
- ✅ 注释清晰完整

通过遵循这些最佳实践,可以设计出高性能、易维护、可扩展的数据库系统,为业务发展奠定坚实基础。
