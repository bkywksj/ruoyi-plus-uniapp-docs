# 数据库规范

## 概述

本规范定义了 RuoYi-Plus-UniApp 项目的数据库设计和使用标准,确保数据库结构一致性、可维护性和高性能。所有开发人员必须严格遵守本规范。

**技术栈:**

| 组件 | 版本 | 说明 |
|-----|------|------|
| MySQL | 5.7+ | 主数据库(推荐) |
| PostgreSQL | 14.0+ | 备选数据库 |
| MyBatis-Plus | 3.5.16 | ORM框架 |
| HikariCP | 5.0+ | 连接池 |

**规范等级:**

- 🔴 **必须(MUST)** - 强制执行,违反将导致代码审查不通过
- 🟡 **应该(SHOULD)** - 强烈建议,特殊情况需说明原因
- 🟢 **建议(MAY)** - 推荐做法,可根据实际情况调整

---

## 命名规范

### 1. 表命名规范

#### 1.1 表名前缀 🔴

所有表必须使用模块前缀,前缀与模块对应关系如下:

| 前缀 | 模块 | 说明 | 示例 |
|-----|------|------|------|
| `sys_` | 系统模块 | 用户、角色、菜单、部门等 | `sys_user`, `sys_role` |
| `b_` | 基础业务 | 通用业务表 | `b_ad`, `b_bind` |
| `m_` | 商城模块 | 电商相关表 | `m_goods`, `m_order` |
| `wf_` | 工作流模块 | 工作流引擎表 | `wf_definition`, `wf_instance` |
| `gen_` | 代码生成 | 代码生成器表 | `gen_table`, `gen_table_column` |
| `job_` | 任务调度 | 定时任务表 | `job_info`, `job_log` |

#### 1.2 表名格式 🔴

```
{前缀}_{业务名称}
{前缀}_{业务名称}_{子业务}
```

**规则:**

- ✅ 全部小写字母
- ✅ 单词间用下划线分隔
- ✅ 使用名词或名词短语
- ✅ 长度不超过30个字符
- ❌ 禁止使用复数形式
- ❌ 禁止使用SQL保留字
- ❌ 禁止使用驼峰命名

**正确示例:**

```sql
sys_user              -- 用户表
sys_user_role         -- 用户角色关联表
sys_oper_log          -- 操作日志表
sys_login_log         -- 登录日志表
m_goods_category      -- 商品分类表
```

**错误示例:**

```sql
users                 -- ❌ 缺少前缀,使用复数
SysUser               -- ❌ 驼峰命名
sys_user_info_detail  -- ❌ 名称过长
user                  -- ❌ SQL保留字
```

#### 1.3 关联表命名 🔴

中间表/关联表使用两个表名组合:

```sql
sys_user_role         -- 用户-角色关联
sys_role_menu         -- 角色-菜单关联
sys_role_dept         -- 角色-部门关联
sys_user_post         -- 用户-岗位关联
```

### 2. 字段命名规范

#### 2.1 字段名格式 🔴

```
{业务含义}_{类型后缀}
```

**规则:**

- ✅ 全部小写字母
- ✅ 单词间用下划线分隔
- ✅ 使用有意义的名称
- ✅ 长度不超过30个字符
- ❌ 禁止使用单个字母
- ❌ 禁止使用拼音
- ❌ 禁止使用SQL保留字

#### 2.2 标准后缀 🔴

| 后缀 | 类型 | 说明 | 示例 |
|-----|------|------|------|
| `_id` | BIGINT | 主键或外键 | `user_id`, `dept_id` |
| `_name` | VARCHAR | 名称 | `user_name`, `dept_name` |
| `_code` | VARCHAR | 编码 | `post_code`, `role_key` |
| `_type` | CHAR/VARCHAR | 类型 | `user_type`, `menu_type` |
| `_time` | DATETIME | 时间 | `create_time`, `login_time` |
| `_date` | DATE | 日期 | `birth_date`, `expire_date` |
| `_by` | BIGINT | 操作人ID | `create_by`, `update_by` |
| `_url` | VARCHAR | URL地址 | `avatar_url`, `oper_url` |
| `_ip` | VARCHAR | IP地址 | `login_ip`, `oper_ip` |
| `_num` | INT | 数量/序号 | `order_num`, `sort_num` |
| `_count` | INT/BIGINT | 计数 | `login_count`, `view_count` |

#### 2.3 布尔字段命名 🔴

布尔字段使用 `is_` 前缀:

```sql
is_deleted            -- 是否删除
is_enabled            -- 是否启用
is_admin              -- 是否管理员
is_default            -- 是否默认
is_visible            -- 是否可见
```

#### 2.4 保留字段名 🔴

以下字段名为系统保留,具有特定含义:

| 字段名 | 类型 | 说明 | 必须 |
|-------|------|------|------|
| `tenant_id` | VARCHAR(20) | 租户ID | 多租户表必须 |
| `is_deleted` | CHAR(1) | 逻辑删除标志 | 所有业务表必须 |
| `create_dept` | BIGINT(20) | 创建部门 | 所有业务表必须 |
| `create_by` | BIGINT(20) | 创建者 | 所有业务表必须 |
| `create_time` | DATETIME | 创建时间 | 所有业务表必须 |
| `update_by` | BIGINT(20) | 更新者 | 所有业务表必须 |
| `update_time` | DATETIME | 更新时间 | 所有业务表必须 |
| `remark` | VARCHAR(500) | 备注 | 可选 |
| `status` | CHAR(1) | 状态 | 按需 |

### 3. 索引命名规范

#### 3.1 索引名格式 🔴

```
{索引类型}_{表名}_{字段名}
```

| 索引类型 | 前缀 | 说明 | 示例 |
|---------|------|------|------|
| 主键索引 | `pk_` | PRIMARY KEY | `pk_sys_user` |
| 唯一索引 | `uk_` | UNIQUE KEY | `uk_user_name` |
| 普通索引 | `idx_` | INDEX | `idx_tenant_id` |
| 全文索引 | `ft_` | FULLTEXT | `ft_content` |

**示例:**

```sql
-- 主键索引(自动创建)
PRIMARY KEY (user_id)

-- 唯一索引
CREATE UNIQUE INDEX uk_tenant_username ON sys_user(tenant_id, user_name);

-- 普通索引
CREATE INDEX idx_tenant_id ON sys_user(tenant_id);
CREATE INDEX idx_dept_id ON sys_user(dept_id);
CREATE INDEX idx_create_time ON sys_user(create_time);

-- 复合索引
CREATE INDEX idx_tenant_status_deleted ON sys_user(tenant_id, status, is_deleted);
```

---

## 字段类型规范

### 1. 主键类型 🔴

**标准:** 所有主键使用 `BIGINT(20)`

```sql
user_id BIGINT(20) NOT NULL COMMENT '用户ID'
```

**主键生成策略:**

| 策略 | 适用场景 | 配置 |
|-----|---------|------|
| 雪花算法 | 分布式系统(推荐) | `IdType.ASSIGN_ID` |
| 自增 | 单机系统 | `IdType.AUTO` |

**禁止使用:**

- ❌ UUID (无序,性能差)
- ❌ INT (容量不足)
- ❌ 业务字段作为主键

### 2. 字符串类型 🔴

| 场景 | 类型 | 长度 | 示例 |
|-----|------|------|------|
| 手机号 | VARCHAR | 11 | `phone VARCHAR(11)` |
| 姓名/账号 | VARCHAR | 30 | `user_name VARCHAR(30)` |
| 邮箱 | VARCHAR | 50 | `email VARCHAR(50)` |
| 编码/权限标识 | VARCHAR | 100 | `role_key VARCHAR(100)` |
| 密码(加密后) | VARCHAR | 100 | `password VARCHAR(100)` |
| URL/路径 | VARCHAR | 255 | `avatar VARCHAR(255)` |
| 备注 | VARCHAR | 500 | `remark VARCHAR(500)` |
| 祖级列表 | VARCHAR | 500 | `ancestors VARCHAR(500)` |
| 长文本 | TEXT | - | `content TEXT` |
| 超长文本 | LONGTEXT | - | `detail LONGTEXT` |

**选择原则:**

- ✅ 根据实际业务需求选择长度
- ✅ 预留适当扩展空间
- ❌ 禁止所有字段都用 VARCHAR(255)
- ❌ 禁止 VARCHAR 超过 3000

### 3. 数值类型 🔴

| 场景 | 类型 | 说明 | 示例 |
|-----|------|------|------|
| 主键/外键 | BIGINT(20) | 支持千亿级 | `user_id BIGINT(20)` |
| 数量/序号 | INT | ±21亿 | `order_num INT` |
| 大数量 | BIGINT | 超大数值 | `view_count BIGINT` |
| 金额 | DECIMAL(10,2) | 精确到分 | `price DECIMAL(10,2)` |
| 百分比 | DECIMAL(5,2) | 0.00-100.00 | `discount DECIMAL(5,2)` |

**金额字段必须使用 DECIMAL:**

```sql
-- ✅ 正确
price DECIMAL(10,2) NOT NULL COMMENT '价格'
amount DECIMAL(12,2) NOT NULL COMMENT '金额'

-- ❌ 错误(精度丢失)
price FLOAT COMMENT '价格'
amount DOUBLE COMMENT '金额'
```

### 4. 时间类型 🔴

**标准:** 统一使用 `DATETIME`

```sql
create_time DATETIME COMMENT '创建时间'
update_time DATETIME COMMENT '更新时间'
expire_time DATETIME COMMENT '过期时间'
```

**禁止使用 TIMESTAMP:**

| 对比项 | DATETIME | TIMESTAMP |
|-------|----------|-----------|
| 范围 | 1000-9999年 | 1970-2038年 |
| 时区 | 不受影响 | 受服务器时区影响 |
| 存储 | 8字节 | 4字节 |
| 推荐 | ✅ 推荐 | ❌ 禁止 |

### 5. 状态/标志类型 🔴

**标准:** 统一使用 `CHAR(1)`

```sql
status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'
is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除(0正常 1删除)'
is_enabled CHAR(1) DEFAULT '1' COMMENT '是否启用(1是 0否)'
```

**状态值约定:**

| 字段 | 值 | 含义 |
|-----|---|------|
| status | '1' | 正常/启用 |
| status | '0' | 停用/禁用 |
| is_deleted | '0' | 未删除 |
| is_deleted | '1' | 已删除 |

**禁止使用:**

- ❌ BOOLEAN / TINYINT(1)
- ❌ INT 类型
- ❌ 数字直接表示 (1/0)

### 6. 租户ID类型 🔴

```sql
tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户ID'
```

**租户ID规范:**

- 类型: VARCHAR(20)
- 默认值: '000000' (主租户)
- 格式: 6位数字字符串

---

## 表结构规范

### 1. 标准表结构模板 🔴

所有业务表必须包含以下结构:

```sql
CREATE TABLE {前缀}_{表名} (
    -- ==================== 主键 ====================
    {主键名} BIGINT(20) NOT NULL COMMENT '主键ID',

    -- ==================== 租户字段(多租户表必须) ====================
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户ID',

    -- ==================== 业务字段 ====================
    -- ... 业务相关字段 ...

    -- ==================== 状态字段(按需) ====================
    status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)',

    -- ==================== 逻辑删除(必须) ====================
    is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除(0正常 1删除)',

    -- ==================== 审计字段(必须) ====================
    create_dept BIGINT(20) DEFAULT NULL COMMENT '创建部门',
    create_by BIGINT(20) DEFAULT NULL COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT(20) DEFAULT NULL COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',

    -- ==================== 备注(可选) ====================
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',

    -- ==================== 主键约束 ====================
    PRIMARY KEY ({主键名})
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表注释';
```

### 2. 字段顺序规范 🟡

字段按以下顺序排列:

1. 主键字段
2. 租户字段
3. 外键字段
4. 业务字段
5. 状态字段
6. 逻辑删除字段
7. 审计字段
8. 备注字段

### 3. 必须字段清单 🔴

| 字段 | 类型 | 默认值 | 说明 | 必须级别 |
|-----|------|-------|------|---------|
| `{表名}_id` | BIGINT(20) | - | 主键 | 所有表必须 |
| `tenant_id` | VARCHAR(20) | '000000' | 租户ID | 多租户表必须 |
| `is_deleted` | CHAR(1) | '0' | 逻辑删除 | 所有业务表必须 |
| `create_dept` | BIGINT(20) | NULL | 创建部门 | 所有业务表必须 |
| `create_by` | BIGINT(20) | NULL | 创建者 | 所有业务表必须 |
| `create_time` | DATETIME | NULL | 创建时间 | 所有业务表必须 |
| `update_by` | BIGINT(20) | NULL | 更新者 | 所有业务表必须 |
| `update_time` | DATETIME | NULL | 更新时间 | 所有业务表必须 |

### 4. 默认值规范 🔴

| 字段类型 | 默认值 | 说明 |
|---------|-------|------|
| 状态字段 | '1' | 默认正常/启用 |
| 删除标志 | '0' | 默认未删除 |
| 布尔字段 | '0' | 默认否 |
| 数值字段 | 0 或 NULL | 根据业务语义 |
| 字符串 | '' 或 NULL | 空字符串或NULL |
| 租户ID | '000000' | 默认主租户 |
| 父级ID | 0 | 顶级节点 |
| 排序号 | 0 | 默认排序 |

### 5. 注释规范 🔴

**所有字段必须添加注释:**

```sql
-- ✅ 正确:完整的字段注释
user_id BIGINT(20) NOT NULL COMMENT '用户ID'
status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'
data_scope CHAR(1) DEFAULT '1' COMMENT '数据范围(1全部 2自定义 3本部门 4本部门及以下 5仅本人)'

-- ❌ 错误:缺少注释
user_id BIGINT(20) NOT NULL
status CHAR(1) DEFAULT '1'
```

**注释内容要求:**

- ✅ 说明字段含义
- ✅ 枚举值列出所有选项
- ✅ 特殊含义说明(如-1表示不限制)
- ✅ 单位说明(如金额单位为元)

**表注释:**

```sql
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';
```

### 6. 树形结构规范 🟡

树形结构表必须包含:

```sql
parent_id BIGINT(20) DEFAULT 0 COMMENT '父级ID'
ancestors VARCHAR(500) DEFAULT '' COMMENT '祖级列表'
order_num INT DEFAULT 0 COMMENT '显示顺序'
```

**ancestors字段格式:** `0,100,101,102` (逗号分隔的ID列表)

**查询示例:**

```sql
-- 查询所有子节点
SELECT * FROM sys_dept WHERE FIND_IN_SET(100, ancestors);

-- 查询所有父节点
SELECT * FROM sys_dept WHERE dept_id IN (SELECT SUBSTRING_INDEX(ancestors, ',', -1) ...);
```

### 7. 日志表规范 🟡

日志表设计特点:

- ❌ 不需要 `update_by`, `update_time` (日志不修改)
- ✅ 可以冗余字段避免关联查询
- ✅ 必须有时间索引
- ✅ 考虑分区或定期归档

```sql
CREATE TABLE sys_oper_log (
    oper_id BIGINT(20) NOT NULL COMMENT '日志ID',
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户ID',
    title VARCHAR(50) DEFAULT '' COMMENT '模块标题',
    oper_type CHAR(3) DEFAULT '' COMMENT '操作类型',
    oper_name VARCHAR(50) DEFAULT '' COMMENT '操作人员',
    dept_name VARCHAR(50) DEFAULT '' COMMENT '部门名称',  -- 冗余字段
    oper_url VARCHAR(255) DEFAULT '' COMMENT '请求URL',
    oper_ip VARCHAR(128) DEFAULT '' COMMENT '主机地址',
    oper_param TEXT COMMENT '请求参数',
    json_result TEXT COMMENT '返回参数',
    status CHAR(1) DEFAULT '1' COMMENT '操作状态',
    error_msg TEXT COMMENT '错误消息',
    oper_time DATETIME COMMENT '操作时间',
    cost_time BIGINT(20) DEFAULT 0 COMMENT '消耗时间(毫秒)',
    PRIMARY KEY (oper_id),
    KEY idx_oper_time (oper_time)
) ENGINE=InnoDB COMMENT='操作日志表';
```

---

## 索引规范

### 1. 索引创建原则 🔴

**必须创建索引的场景:**

- ✅ 主键字段 (自动创建)
- ✅ 外键字段
- ✅ 租户ID字段 (多租户表)
- ✅ WHERE 条件高频字段
- ✅ ORDER BY / GROUP BY 字段
- ✅ JOIN ON 条件字段
- ✅ 唯一性约束字段

**不应创建索引的场景:**

- ❌ 频繁更新的字段
- ❌ 区分度低的字段 (如性别)
- ❌ TEXT / BLOB 大字段
- ❌ 极少查询的字段

### 2. 索引数量限制 🔴

- 单表索引数量: **不超过5-8个**
- 复合索引字段数: **不超过5个**
- 定期清理无用索引

### 3. 必须创建的索引 🔴

```sql
-- 1. 租户ID索引(所有多租户表)
CREATE INDEX idx_tenant_id ON {表名}(tenant_id);

-- 2. 外键索引
CREATE INDEX idx_dept_id ON sys_user(dept_id);
CREATE INDEX idx_parent_id ON sys_dept(parent_id);

-- 3. 状态+删除标志复合索引
CREATE INDEX idx_status_deleted ON {表名}(status, is_deleted);

-- 4. 创建时间索引(日志表)
CREATE INDEX idx_create_time ON {表名}(create_time);
```

### 4. 复合索引规范 🔴

**最左前缀原则:**

```sql
-- 创建复合索引
CREATE INDEX idx_tenant_status_time ON sys_user(tenant_id, status, create_time);

-- ✅ 能使用索引
WHERE tenant_id = '000000'
WHERE tenant_id = '000000' AND status = '1'
WHERE tenant_id = '000000' AND status = '1' AND create_time > '2025-01-01'

-- ❌ 不能使用索引(跳过最左列)
WHERE status = '1'
WHERE create_time > '2025-01-01'
WHERE status = '1' AND create_time > '2025-01-01'
```

**字段顺序原则:**

1. 等值查询字段在前
2. 范围查询字段在后
3. 区分度高的字段优先

### 5. 唯一索引规范 🔴

```sql
-- 多租户场景:租户+业务字段联合唯一
CREATE UNIQUE INDEX uk_tenant_username ON sys_user(tenant_id, user_name);
CREATE UNIQUE INDEX uk_tenant_role_key ON sys_role(tenant_id, role_key);

-- 单租户场景:仅业务字段唯一
CREATE UNIQUE INDEX uk_config_key ON sys_config(config_key);
```

### 6. 索引失效场景 🔴

**必须避免以下写法:**

```sql
-- ❌ 函数计算
WHERE YEAR(create_time) = 2025
-- ✅ 改为
WHERE create_time >= '2025-01-01' AND create_time < '2026-01-01'

-- ❌ 隐式类型转换
WHERE user_id = '1'  -- user_id是BIGINT
-- ✅ 改为
WHERE user_id = 1

-- ❌ LIKE前导通配符
WHERE user_name LIKE '%admin'
-- ✅ 改为
WHERE user_name LIKE 'admin%'

-- ❌ OR条件部分无索引
WHERE user_id = 1 OR nick_name = 'admin'
-- ✅ 改为UNION
SELECT * FROM sys_user WHERE user_id = 1
UNION
SELECT * FROM sys_user WHERE nick_name = 'admin'

-- ❌ NOT / != / <>
WHERE status != '0'
-- ✅ 改为IN
WHERE status IN ('1', '2')
```

---

## SQL编写规范

### 1. 查询规范 🔴

#### 1.1 禁止 SELECT *

```sql
-- ❌ 禁止
SELECT * FROM sys_user WHERE user_id = 1;

-- ✅ 正确
SELECT user_id, user_name, nick_name, status
FROM sys_user
WHERE user_id = 1;
```

#### 1.2 分页查询

```sql
-- 普通分页(小数据量)
SELECT user_id, user_name FROM sys_user
ORDER BY create_time DESC
LIMIT 0, 10;

-- 深度分页优化(大数据量)
SELECT u.* FROM sys_user u
INNER JOIN (
    SELECT user_id FROM sys_user
    ORDER BY user_id
    LIMIT 100000, 10
) t ON u.user_id = t.user_id;

-- 游标分页(推荐)
SELECT user_id, user_name FROM sys_user
WHERE user_id > #{lastId}
ORDER BY user_id
LIMIT 10;
```

#### 1.3 COUNT优化

```sql
-- ❌ 慢查询
SELECT COUNT(*) FROM sys_oper_log;

-- ✅ 使用主键
SELECT COUNT(oper_id) FROM sys_oper_log WHERE status = '1';

-- ✅ 大表近似值
SELECT TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'database_name' AND TABLE_NAME = 'sys_oper_log';
```

### 2. 写入规范 🔴

#### 2.1 批量插入

```sql
-- ❌ 循环单条插入
INSERT INTO sys_user (user_name) VALUES ('user1');
INSERT INTO sys_user (user_name) VALUES ('user2');
INSERT INTO sys_user (user_name) VALUES ('user3');

-- ✅ 批量插入
INSERT INTO sys_user (user_name) VALUES
    ('user1'),
    ('user2'),
    ('user3');
```

**批量插入限制:**

- 单次批量: 不超过500-1000条
- 超过数量: 分批执行

#### 2.2 更新规范

```sql
-- ✅ 明确WHERE条件
UPDATE sys_user SET status = '0' WHERE user_id = 1;

-- ❌ 禁止无WHERE条件的UPDATE
UPDATE sys_user SET status = '0';
```

#### 2.3 删除规范

```sql
-- ✅ 使用逻辑删除
UPDATE sys_user SET is_deleted = '1' WHERE user_id = 1;

-- ❌ 禁止物理删除(特殊场景除外)
DELETE FROM sys_user WHERE user_id = 1;

-- ❌ 禁止无WHERE条件的DELETE
DELETE FROM sys_user;
```

### 3. 关联查询规范 🟡

#### 3.1 JOIN规范

```sql
-- ✅ 正确:明确的JOIN条件
SELECT u.user_name, d.dept_name
FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
WHERE u.status = '1';

-- ❌ 禁止:隐式JOIN
SELECT u.user_name, d.dept_name
FROM sys_user u, sys_dept d
WHERE u.dept_id = d.dept_id;
```

#### 3.2 JOIN数量限制

- 单次查询JOIN表数: **不超过3-4个**
- 超过数量: 拆分为多次查询

#### 3.3 子查询优化

```sql
-- ❌ 不推荐:IN子查询
SELECT * FROM sys_user
WHERE dept_id IN (SELECT dept_id FROM sys_dept WHERE status = '1');

-- ✅ 推荐:改为JOIN
SELECT u.* FROM sys_user u
INNER JOIN sys_dept d ON u.dept_id = d.dept_id
WHERE d.status = '1';
```

### 4. 防注入规范 🔴

```java
// ❌ 禁止:字符串拼接SQL
String sql = "SELECT * FROM sys_user WHERE user_name = '" + userName + "'";

// ✅ 正确:使用预编译
@Select("SELECT * FROM sys_user WHERE user_name = #{userName}")
SysUser selectByUserName(@Param("userName") String userName);

// ✅ 正确:使用MyBatis-Plus条件构造器
LambdaQueryWrapper<SysUser> wrapper = Wrappers.<SysUser>lambdaQuery()
    .eq(SysUser::getUserName, userName);
```

---

## 事务规范

### 1. 事务使用原则 🔴

**必须使用事务的场景:**

- ✅ 涉及多表写操作
- ✅ 需要保证数据一致性
- ✅ 批量操作

**不需要事务的场景:**

- ❌ 纯查询操作
- ❌ 单表单条写入

### 2. 事务注解规范 🔴

```java
// ✅ 正确:指定回滚异常
@Transactional(rollbackFor = Exception.class)
public void saveUser(SysUser user) {
    // 业务逻辑
}

// ❌ 错误:默认只回滚RuntimeException
@Transactional
public void saveUser(SysUser user) {
    // 业务逻辑
}
```

### 3. 事务范围原则 🔴

```java
// ✅ 正确:事务范围最小化
@Transactional(rollbackFor = Exception.class)
public void updateUserRole(Long userId, List<Long> roleIds) {
    // 仅包含数据库操作
    userRoleMapper.deleteByUserId(userId);
    userRoleMapper.insertBatch(userId, roleIds);
}

// ❌ 错误:事务范围过大
@Transactional(rollbackFor = Exception.class)
public void updateUserRole(Long userId, List<Long> roleIds) {
    // 远程调用不应在事务中
    remoteService.notify(userId);

    userRoleMapper.deleteByUserId(userId);
    userRoleMapper.insertBatch(userId, roleIds);

    // 文件操作不应在事务中
    fileService.uploadFile(file);
}
```

### 4. 事务传播行为 🟡

| 传播行为 | 说明 | 适用场景 |
|---------|------|---------|
| REQUIRED | 默认,有则加入,无则新建 | 大多数场景 |
| REQUIRES_NEW | 总是新建事务 | 独立日志记录 |
| NESTED | 嵌套事务 | 部分回滚 |
| NOT_SUPPORTED | 非事务执行 | 查询操作 |

```java
// 独立事务:日志记录不受主事务影响
@Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
public void saveOperLog(SysOperLog log) {
    operLogMapper.insert(log);
}
```

### 5. 避免长事务 🔴

```java
// ❌ 错误:长事务
@Transactional(rollbackFor = Exception.class)
public void processData() {
    for (int i = 0; i < 10000; i++) {
        // 大量数据处理
        processItem(i);
    }
}

// ✅ 正确:分批处理
public void processData() {
    List<Integer> items = getItems();
    List<List<Integer>> batches = Lists.partition(items, 100);

    for (List<Integer> batch : batches) {
        processBatch(batch);  // 每批独立事务
    }
}

@Transactional(rollbackFor = Exception.class)
public void processBatch(List<Integer> batch) {
    for (Integer item : batch) {
        processItem(item);
    }
}
```

---

## 多租户规范

### 1. 租户字段规范 🔴

```sql
-- 所有多租户表必须包含
tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户ID'

-- 必须创建租户索引
CREATE INDEX idx_tenant_id ON {表名}(tenant_id);
```

### 2. 租户隔离表清单 🔴

以下表必须支持多租户:

```
sys_user          -- 用户表
sys_role          -- 角色表
sys_dept          -- 部门表
sys_post          -- 岗位表
sys_menu          -- 菜单表(可选)
sys_dict_type     -- 字典类型
sys_dict_data     -- 字典数据
sys_config        -- 参数配置
sys_oss           -- 文件存储
sys_oper_log      -- 操作日志
sys_login_log     -- 登录日志
```

### 3. 非租户隔离表 🟡

以下表不需要租户隔离:

```
sys_tenant        -- 租户表本身
sys_tenant_package -- 租户套餐
gen_table         -- 代码生成表
```

### 4. 实体类规范 🔴

```java
// 多租户表继承TenantEntity
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends TenantEntity {

    @TableId(value = "user_id")
    private Long userId;

    // 其他字段...
}

// TenantEntity包含租户字段
public class TenantEntity extends BaseEntity {

    @TableField(tenantIdField = true)
    private String tenantId;
}
```

### 5. 跨租户查询 🟡

```java
// 临时忽略租户隔离
TenantHelper.ignore(() -> {
    return baseMapper.selectList(null);
});

// 指定租户查询
TenantHelper.dynamic("000001", () -> {
    return baseMapper.selectList(null);
});
```

---

## 安全规范

### 1. SQL注入防护 🔴

```java
// ❌ 禁止:字符串拼接
String sql = "SELECT * FROM sys_user WHERE user_name = '" + input + "'";

// ✅ 正确:预编译
@Select("SELECT * FROM sys_user WHERE user_name = #{userName}")
SysUser selectByUserName(@Param("userName") String userName);

// ✅ 正确:条件构造器
wrapper.eq(SysUser::getUserName, userName);
```

### 2. 敏感数据处理 🔴

```java
// 密码字段:不参与常规查询
@TableField(
    insertStrategy = FieldStrategy.NOT_EMPTY,
    updateStrategy = FieldStrategy.NOT_EMPTY,
    whereStrategy = FieldStrategy.NOT_EMPTY
)
private String password;

// 查询时排除敏感字段
@Select("SELECT user_id, user_name, nick_name FROM sys_user")
List<SysUser> selectUserList();
```

### 3. 数据权限 🟡

```java
// 使用数据权限注解
@DataPermission({
    @DataColumn(key = "deptName", value = "dept_id"),
    @DataColumn(key = "userName", value = "create_by")
})
public PageResult<SysUser> selectPageUserList(SysUserQuery query) {
    // 自动添加数据权限条件
}
```

### 4. 逻辑删除 🔴

```java
// 实体类配置
@TableLogic
@TableField(value = "is_deleted", fill = FieldFill.INSERT)
private String isDeleted;

// 全局配置
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: isDeleted
      logic-delete-value: "1"
      logic-not-delete-value: "0"
```

---

## 性能规范

### 1. 查询优化 🔴

| 场景 | 规范 |
|-----|------|
| 字段选择 | 只查需要的字段,禁止SELECT * |
| 分页查询 | 大数据量使用游标分页 |
| 关联查询 | JOIN不超过4个表 |
| 子查询 | 优先使用JOIN替代 |
| 排序 | 排序字段必须有索引 |

### 2. 连接池配置 🟡

```yaml
spring:
  datasource:
    hikari:
      minimum-idle: 10           # 最小空闲连接
      maximum-pool-size: 50      # 最大连接数
      connection-timeout: 30000  # 连接超时(ms)
      idle-timeout: 600000       # 空闲超时(ms)
      max-lifetime: 1800000      # 最大存活时间(ms)
```

### 3. 慢查询标准 🔴

| 级别 | 耗时 | 处理要求 |
|-----|------|---------|
| 正常 | < 100ms | 无需处理 |
| 警告 | 100ms - 1s | 需要关注 |
| 严重 | > 1s | 必须优化 |

### 4. 大表处理 🟡

- **分区表**: 按时间或业务维度分区
- **冷热分离**: 历史数据迁移到归档表
- **定期归档**: 超过6个月的日志数据归档

---

## 检查清单

### 新建表检查清单 ✅

- [ ] 表名使用正确前缀
- [ ] 表名全小写下划线分隔
- [ ] 包含主键字段
- [ ] 包含租户ID字段(多租户表)
- [ ] 包含逻辑删除字段
- [ ] 包含审计字段(create_by/create_time/update_by/update_time)
- [ ] 所有字段有注释
- [ ] 表有注释
- [ ] 创建租户ID索引
- [ ] 创建必要的业务索引
- [ ] 使用正确的字段类型
- [ ] 设置合理的默认值

### SQL审查清单 ✅

- [ ] 无SELECT *
- [ ] 无字符串拼接SQL
- [ ] 分页查询有优化
- [ ] JOIN不超过4个表
- [ ] WHERE条件字段有索引
- [ ] 无索引失效写法
- [ ] 批量操作分批执行
- [ ] 事务范围合理

### 索引审查清单 ✅

- [ ] 主键索引存在
- [ ] 外键字段有索引
- [ ] 租户ID有索引
- [ ] 高频查询字段有索引
- [ ] 复合索引顺序正确
- [ ] 无冗余索引
- [ ] 单表索引不超过8个

---

## 常见问题

### 1. 主键选择

**问题:** 应该使用自增ID还是雪花ID?

**答案:**
- 分布式系统: 使用雪花ID (`IdType.ASSIGN_ID`)
- 单机系统: 可使用自增ID (`IdType.AUTO`)
- 推荐: 统一使用雪花ID,便于后续扩展

### 2. 逻辑删除与唯一索引冲突

**问题:** 逻辑删除后,唯一索引失效怎么办?

**答案:**
```sql
-- 方案1: 唯一索引包含is_deleted
CREATE UNIQUE INDEX uk_tenant_username_deleted
ON sys_user(tenant_id, user_name, is_deleted);

-- 方案2: 删除时修改唯一字段
UPDATE sys_user
SET user_name = CONCAT(user_name, '_deleted_', UNIX_TIMESTAMP()),
    is_deleted = '1'
WHERE user_id = 1;
```

### 3. VARCHAR长度选择

**问题:** VARCHAR长度应该如何选择?

**答案:**
- 根据实际业务需求选择
- 预留20%-50%扩展空间
- 常用长度参考本规范的字段类型部分
- 不要盲目使用VARCHAR(255)

### 4. NULL vs 空字符串

**问题:** 字段应该用NULL还是空字符串?

**答案:**
- NULL: 表示未知、不确定
- 空字符串'': 表示已知为空
- 建议: 字符串字段默认空字符串,外键/数值字段默认NULL

### 5. 索引过多影响性能

**问题:** 索引是否越多越好?

**答案:**
- 不是,索引会影响INSERT/UPDATE/DELETE性能
- 单表索引控制在5-8个以内
- 定期分析索引使用情况,删除无用索引

---

## 总结

本规范涵盖了数据库设计和使用的核心要点:

1. **命名规范** - 统一的表名、字段名、索引名命名规则
2. **字段类型规范** - 标准化的数据类型选择
3. **表结构规范** - 必须字段和标准模板
4. **索引规范** - 索引创建原则和优化策略
5. **SQL编写规范** - 安全高效的SQL编写方式
6. **事务规范** - 事务使用的最佳实践
7. **多租户规范** - 多租户数据隔离要求
8. **安全规范** - 防注入和数据保护
9. **性能规范** - 性能优化标准

**核心原则:**

- 🔴 必须遵守的规范是底线,不可违反
- 🟡 应该遵守的规范是最佳实践,特殊情况需说明原因
- 🟢 建议遵守的规范是推荐做法,可根据实际调整

通过遵守本规范,可以确保数据库设计的一致性、可维护性和高性能。
