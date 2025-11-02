# 数据库设计规范

> **文档状态**: ✅ 已完成
>
> 本文档详细介绍RuoYi-Plus-UniApp项目的数据库设计规范和最佳实践,包括表结构设计、字段规范、索引策略、性能优化等内容。

## 📋 目录

- [数据库设计原则](#数据库设计原则)
- [表设计规范](#表设计规范)
- [字段设计规范](#字段设计规范)
- [索引设计策略](#索引设计策略)
- [约束和外键设计](#约束和外键设计)
- [实体类设计规范](#实体类设计规范)
- [数据库优化策略](#数据库优化策略)
- [多租户数据隔离](#多租户数据隔离)
- [数据迁移和版本管理](#数据迁移和版本管理)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 数据库设计原则

### 1. 基本原则

遵循以下数据库设计的核心原则:

#### 1.1 三范式原则

**第一范式(1NF) - 原子性**
- ✅ 每个字段都是不可再分的原子值
- ✅ 每个字段只包含一个值,不能包含多个值或列表

**第二范式(2NF) - 消除部分依赖**
- ✅ 满足1NF
- ✅ 所有非主键字段完全依赖于主键

**第三范式(3NF) - 消除传递依赖**
- ✅ 满足2NF
- ✅ 非主键字段之间不存在传递依赖

#### 1.2 实际应用中的权衡

在实际开发中,我们允许适度的**反范式化设计**来提升性能:

```sql
-- ❌ 严格三范式(需要关联查询)
CREATE TABLE sys_user (
    user_id BIGINT PRIMARY KEY,
    dept_id BIGINT,
    user_name VARCHAR(30)
);

CREATE TABLE sys_dept (
    dept_id BIGINT PRIMARY KEY,
    dept_name VARCHAR(30)
);

-- ✅ 适度反范式化(冗余dept_name提升查询性能)
CREATE TABLE sys_oper_log (
    oper_id BIGINT PRIMARY KEY,
    oper_name VARCHAR(50) COMMENT '操作人员',
    dept_name VARCHAR(50) COMMENT '部门名称', -- 冗余字段,避免关联查询
    oper_time DATETIME COMMENT '操作时间'
);
```

**适用场景:**
- 高频查询的日志表、统计表
- 需要展示关联数据但不要求实时性的场景
- 读多写少的业务场景

参考: script/sql/ry_plus_sys.sql:670-695

#### 1.3 设计原则总结

1. **数据完整性** - 通过主键、外键、唯一约束、非空约束保证数据质量
2. **性能优先** - 适当冗余、合理索引、分区分表
3. **可扩展性** - 预留扩展字段、支持多租户
4. **可维护性** - 统一命名规范、详细注释
5. **安全性** - 敏感数据加密、权限隔离

---

## 表设计规范

### 1. 表命名规范

#### 1.1 命名规则

- **前缀约定**: 所有业务表使用统一前缀
  - `sys_` - 系统核心表 (用户、角色、菜单、部门等)
  - `app_` - 应用业务表 (移动端专属表)
  - `gen_` - 代码生成器表
  - `job_` - 定时任务表

- **命名风格**: 小写字母 + 下划线分隔 (snake_case)
- **语义清晰**: 表名能够准确表达业务含义
- **避免保留字**: 不使用SQL关键字作为表名

```sql
-- ✅ 正确的表命名
sys_user          -- 用户表
sys_user_role     -- 用户角色关联表
sys_oper_log      -- 操作日志表
sys_tenant        -- 租户表

-- ❌ 错误的表命名
User              -- 大写不规范
user_info         -- 缺少前缀
sys_user_role_rel -- 后缀冗余
user              -- 可能与SQL关键字冲突
```

参考: script/sql/ry_plus_sys.sql:1-1300

#### 1.2 关联表命名

关联表(中间表)使用**两个表名组合**的方式:

```sql
-- ✅ 正确的关联表命名
sys_user_role     -- 用户和角色关联表
sys_role_menu     -- 角色和菜单关联表
sys_role_dept     -- 角色和部门关联表
sys_user_post     -- 用户和岗位关联表

-- 关联表使用复合主键
CREATE TABLE sys_user_role (
    user_id BIGINT(20) NOT NULL COMMENT '用户ID',
    role_id BIGINT(20) NOT NULL COMMENT '角色ID',
    PRIMARY KEY (user_id, role_id)
) ENGINE=InnoDB COMMENT='用户和角色关联表';
```

参考: script/sql/ry_plus_sys.sql:623-644

### 2. 表结构设计

#### 2.1 标准表结构模板

所有业务表都应包含以下通用字段:

```sql
CREATE TABLE sys_xxx (
    -- 主键(必须)
    xxx_id BIGINT(20) NOT NULL COMMENT '主键ID',

    -- 租户字段(多租户表必须)
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id',

    -- 业务字段
    xxx_name VARCHAR(50) NOT NULL COMMENT '名称',
    xxx_code VARCHAR(100) COMMENT '编码',
    status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)',

    -- 逻辑删除(必须)
    is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除',

    -- 审计字段(必须)
    create_dept BIGINT(20) DEFAULT NULL COMMENT '创建部门',
    create_by BIGINT(20) DEFAULT NULL COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT(20) DEFAULT NULL COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',

    -- 备注(可选)
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',

    PRIMARY KEY (xxx_id)
) ENGINE=InnoDB COMMENT='业务表';
```

参考: script/sql/ry_plus_sys.sql:152-176

#### 2.2 实际示例 - 用户表

```sql
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL COMMENT '用户ID',
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id',
    dept_id BIGINT(20) DEFAULT NULL COMMENT '部门ID',
    user_name VARCHAR(30) DEFAULT NULL COMMENT '用户账号',
    nick_name VARCHAR(30) DEFAULT NULL COMMENT '用户昵称',
    user_type VARCHAR(20) DEFAULT 'pc_user' COMMENT '用户类型',
    email VARCHAR(50) DEFAULT '' COMMENT '用户邮箱',
    phone VARCHAR(11) DEFAULT '' COMMENT '手机号码',
    gender CHAR(1) DEFAULT NULL COMMENT '用户性别',
    avatar VARCHAR(255) DEFAULT '' COMMENT '头像地址',
    password VARCHAR(100) DEFAULT '' COMMENT '密码',
    status CHAR(1) DEFAULT '1' COMMENT '帐号状态',
    is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除',
    login_ip VARCHAR(128) DEFAULT '' COMMENT '最后登录IP',
    login_date DATETIME COMMENT '最后登录时间',
    create_dept BIGINT(20) DEFAULT NULL COMMENT '创建部门',
    create_by BIGINT(20) DEFAULT NULL COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT(20) DEFAULT NULL COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (user_id)
) ENGINE=InnoDB COMMENT='用户信息表';
```

参考: script/sql/ry_plus_sys.sql:152-176

#### 2.3 树形结构表设计

树形数据使用**左右值编码(ancestors)**或**递归查询**:

```sql
-- ✅ 部门表 - 使用祖级列表字段
CREATE TABLE sys_dept (
    dept_id BIGINT(20) NOT NULL COMMENT '部门id',
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id',
    parent_id BIGINT(20) DEFAULT 0 COMMENT '父部门id',
    ancestors VARCHAR(500) DEFAULT '' COMMENT '祖级列表', -- 0,100,101 格式
    dept_name VARCHAR(30) DEFAULT '' COMMENT '部门名称',
    dept_category VARCHAR(100) DEFAULT NULL COMMENT '部门类别编码',
    order_num INT(4) DEFAULT 0 COMMENT '显示顺序',
    leader BIGINT(20) DEFAULT NULL COMMENT '负责人',
    phone VARCHAR(11) DEFAULT NULL COMMENT '联系电话',
    email VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
    status CHAR(1) DEFAULT '0' COMMENT '部门状态',
    is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除',
    create_dept BIGINT(20) DEFAULT NULL COMMENT '创建部门',
    create_by BIGINT(20) DEFAULT NULL COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by BIGINT(20) DEFAULT NULL COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',
    PRIMARY KEY (dept_id)
) ENGINE=InnoDB COMMENT='部门表';
```

**ancestors字段的优势:**
- ✅ 快速查询所有祖先节点
- ✅ 快速查询所有子孙节点
- ✅ 避免递归查询的性能问题

```sql
-- 查询某部门的所有子部门
SELECT * FROM sys_dept WHERE FIND_IN_SET(?, ancestors);

-- 查询某部门的所有祖先部门
SELECT * FROM sys_dept WHERE dept_id IN (0,100,101);
```

参考: script/sql/ry_plus_sys.sql:93-114

#### 2.4 日志表设计

日志表设计要点:

1. **不需要update相关字段** - 日志只插入不修改
2. **适当冗余字段** - 避免关联查询
3. **添加性能索引** - 支持高效查询
4. **分区或归档** - 控制表大小

```sql
CREATE TABLE sys_oper_log (
    oper_id BIGINT(20) NOT NULL COMMENT '日志主键',
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id',
    title VARCHAR(50) DEFAULT '' COMMENT '模块标题',
    oper_type CHAR(3) DEFAULT '' COMMENT '操作类型',
    method VARCHAR(100) DEFAULT '' COMMENT '方法名称',
    request_method VARCHAR(10) DEFAULT '' COMMENT '请求方式',
    operator_type VARCHAR(20) DEFAULT '' COMMENT '操作用户类别',
    oper_name VARCHAR(50) DEFAULT '' COMMENT '操作人员',
    dept_name VARCHAR(50) DEFAULT '' COMMENT '部门名称', -- 冗余字段
    oper_url VARCHAR(255) DEFAULT '' COMMENT '请求URL',
    oper_ip VARCHAR(128) DEFAULT '' COMMENT '主机地址',
    oper_location VARCHAR(255) DEFAULT '' COMMENT '操作地点',
    oper_param TEXT DEFAULT NULL COMMENT '请求参数',
    json_result TEXT DEFAULT NULL COMMENT '返回参数',
    status CHAR(1) DEFAULT '1' COMMENT '操作结果',
    error_msg TEXT DEFAULT NULL COMMENT '错误消息',
    oper_time DATETIME COMMENT '操作时间',
    cost_time BIGINT(20) DEFAULT 0 COMMENT '消耗时间',
    PRIMARY KEY (oper_id),
    KEY idx_sys_oper_log_bt (oper_type),
    KEY idx_sys_oper_log_s (status),
    KEY idx_sys_oper_log_ot (oper_time)
) ENGINE=InnoDB COMMENT='操作日志';
```

**设计特点:**
- ✅ 无update_by、update_time字段(日志不修改)
- ✅ dept_name冗余(避免JOIN sys_dept)
- ✅ 三个索引支持常见查询条件

参考: script/sql/ry_plus_sys.sql:670-695

### 3. 存储引擎选择

#### 3.1 InnoDB vs MyISAM

**InnoDB(推荐,项目默认)**
- ✅ 支持事务(ACID)
- ✅ 支持行级锁,并发性能好
- ✅ 支持外键约束
- ✅ 自动崩溃恢复
- ✅ 支持热备份

```sql
-- ✅ 推荐使用InnoDB
CREATE TABLE sys_user (
    ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';
```

**MyISAM(不推荐)**
- ❌ 不支持事务
- ❌ 表级锁,并发性能差
- ❌ 崩溃后恢复困难

**适用场景对比:**

| 特性 | InnoDB | MyISAM |
|------|--------|--------|
| 事务支持 | ✅ | ❌ |
| 行级锁 | ✅ | ❌(仅表锁) |
| 外键约束 | ✅ | ❌ |
| 崩溃恢复 | ✅ | ❌ |
| 全文索引 | ✅(5.6+) | ✅ |
| 适用场景 | 事务性应用(推荐) | 只读、查询场景 |

参考: script/sql/ry_plus_sys.sql:36

---

## 字段设计规范

### 1. 字段命名规范

#### 1.1 命名规则

- **小写字母 + 下划线** - 统一使用snake_case风格
- **语义清晰** - 字段名准确表达含义
- **避免保留字** - 不使用SQL关键字
- **统一后缀** - 相同含义的字段使用相同后缀

```sql
-- ✅ 正确的字段命名
user_id           -- ID主键
user_name         -- 用户名
create_time       -- 创建时间
is_deleted        -- 是否删除
status            -- 状态
order_num         -- 排序号

-- ❌ 错误的字段命名
UserId            -- 驼峰不规范
userName          -- 驼峰不规范
createDate        -- 应该用create_time
del_flag          -- 应该用is_deleted
sort              -- 应该用order_num
```

#### 1.2 常用字段后缀约定

| 后缀 | 含义 | 类型 | 示例 |
|------|------|------|------|
| `_id` | 主键或外键ID | `BIGINT(20)` | `user_id`, `dept_id` |
| `_name` | 名称 | `VARCHAR` | `user_name`, `dept_name` |
| `_code` | 编码 | `VARCHAR` | `post_code`, `role_key` |
| `_type` | 类型 | `CHAR/VARCHAR` | `user_type`, `menu_type` |
| `_time` | 时间 | `DATETIME` | `create_time`, `login_date` |
| `_by` | 操作人 | `BIGINT(20)` | `create_by`, `update_by` |
| `_url` | URL地址 | `VARCHAR` | `oper_url`, `avatar` |
| `_ip` | IP地址 | `VARCHAR(128)` | `login_ip`, `oper_ip` |
| `_flag` | 标志位 | `CHAR(1)` | `is_deleted`, `status` |
| `_num` | 数量/序号 | `INT` | `order_num`, `post_sort` |

参考: script/sql/ry_plus_sys.sql:1-1300

### 2. 字段类型选择

#### 2.1 整数类型

**主键ID - BIGINT(20)**

```sql
-- ✅ 推荐: 使用BIGINT(20)作为主键
user_id BIGINT(20) NOT NULL COMMENT '用户ID'

-- ❌ 不推荐: INT容量不足,长期使用可能溢出
user_id INT NOT NULL
```

**计数器、序号 - INT**

```sql
-- ✅ 排序号、显示顺序
order_num INT(4) DEFAULT 0 COMMENT '显示顺序'
post_sort INT(4) NOT NULL COMMENT '显示顺序'

-- ✅ 账号数量
account_count INT DEFAULT -1 COMMENT '用户数量(-1不限制)'
```

**布尔值 - TINYINT(1) 或 CHAR(1)**

```sql
-- ✅ 方式1: TINYINT(1)
menu_check_strictly TINYINT(1) DEFAULT 1 COMMENT '菜单树选择项是否关联显示'

-- ✅ 方式2: CHAR(1) (项目推荐)
status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'
is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除'
```

**项目统一使用CHAR(1)表示状态和标志位:**
- ✅ 可读性更好('1'/'0' vs 1/0)
- ✅ 便于扩展('1'正常/'0'停用/'2'锁定)
- ✅ 避免NULL值判断

参考: script/sql/ry_plus_sys.sql:152-243

#### 2.2 字符串类型

**固定长度 - CHAR**

```sql
-- ✅ 状态标志(固定长度)
status CHAR(1) DEFAULT '1' COMMENT '状态'
gender CHAR(1) DEFAULT NULL COMMENT '用户性别'
is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除'

-- ✅ 区划代码
area_code CHAR(6) DEFAULT NULL COMMENT '区划代码'
```

**变长字符串 - VARCHAR**

根据实际需求选择合适的长度:

```sql
-- 用户账号、部门名称等(短文本)
user_name VARCHAR(30) DEFAULT NULL COMMENT '用户账号'
dept_name VARCHAR(30) DEFAULT '' COMMENT '部门名称'
nick_name VARCHAR(30) DEFAULT NULL COMMENT '用户昵称'

-- 邮箱、手机号(标准格式)
email VARCHAR(50) DEFAULT '' COMMENT '用户邮箱'
phone VARCHAR(11) DEFAULT '' COMMENT '手机号码'

-- 编码、权限标识(中等长度)
post_code VARCHAR(64) NOT NULL COMMENT '岗位编码'
role_key VARCHAR(100) NOT NULL COMMENT '角色权限字符串'
perms VARCHAR(100) DEFAULT NULL COMMENT '权限标识'

-- 密码、令牌(加密后较长)
password VARCHAR(100) DEFAULT '' COMMENT '密码'
access_token VARCHAR(255) NOT NULL COMMENT '用户的授权令牌'

-- URL、路径(长文本)
avatar VARCHAR(255) DEFAULT '' COMMENT '头像地址'
oper_url VARCHAR(255) DEFAULT '' COMMENT '请求URL'

-- 备注、描述(超长文本)
remark VARCHAR(500) DEFAULT NULL COMMENT '备注'
ancestors VARCHAR(500) DEFAULT '' COMMENT '祖级列表'
menu_ids VARCHAR(3000) COMMENT '关联菜单id'
```

**VARCHAR长度选择原则:**
- `VARCHAR(11)` - 手机号
- `VARCHAR(30)` - 姓名、账号
- `VARCHAR(50)` - 邮箱、标题
- `VARCHAR(100)` - 编码、权限标识、密码
- `VARCHAR(200)` - 地址、域名
- `VARCHAR(255)` - URL、文件路径
- `VARCHAR(500)` - 备注、祖级列表
- `VARCHAR(3000)` - 长文本、ID列表

参考: script/sql/ry_plus_sys.sql:152-176

**大文本 - TEXT**

```sql
-- ✅ 请求参数、返回结果(长度不可预估)
oper_param TEXT DEFAULT NULL COMMENT '请求参数'
json_result TEXT DEFAULT NULL COMMENT '返回参数'
error_msg TEXT DEFAULT NULL COMMENT '错误消息'

-- ✅ id_token(超长令牌)
id_token VARCHAR(2000) DEFAULT NULL COMMENT 'id token,部分平台可能没有'
```

**TEXT vs VARCHAR:**
- `TEXT` - 不定长、超长文本(>3000字符)
- `VARCHAR` - 可预估长度的文本

参考: script/sql/ry_plus_sys.sql:685-688

#### 2.3 时间类型

**DATETIME vs TIMESTAMP**

项目统一使用**DATETIME**:

```sql
-- ✅ 推荐: DATETIME (范围大,不受时区影响)
create_time DATETIME COMMENT '创建时间'
update_time DATETIME COMMENT '更新时间'
login_date DATETIME COMMENT '最后登录时间'
expire_time DATETIME COMMENT '过期时间'

-- ❌ 不推荐: TIMESTAMP (2038年问题)
create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**DATETIME优势:**
- ✅ 范围: 1000-01-01 ~ 9999-12-31
- ✅ 不受服务器时区影响
- ✅ 精度到秒(或毫秒)

**TIMESTAMP劣势:**
- ❌ 范围: 1970-01-01 ~ 2038-01-19 (Y2038问题)
- ❌ 受服务器时区影响

参考: script/sql/ry_plus_sys.sql:110-112

#### 2.4 数值类型对比表

| Java类型 | MySQL类型 | 范围 | 占用空间 | 应用场景 |
|----------|-----------|------|----------|----------|
| `Long` | `BIGINT(20)` | -2^63 ~ 2^63-1 | 8字节 | 主键ID、用户ID |
| `Integer` | `INT` | -2^31 ~ 2^31-1 | 4字节 | 数量、排序号 |
| `Boolean` | `CHAR(1)` | '0'/'1' | 1字节 | 状态标志 |
| `String` | `VARCHAR(n)` | 0~65535字节 | 变长 | 名称、编码 |
| `String` | `TEXT` | 0~65535字符 | 变长 | 长文本 |
| `Date` | `DATETIME` | 1000~9999 | 8字节 | 时间字段 |

### 3. 字段约束

#### 3.1 NOT NULL vs NULL

**推荐使用NULL + DEFAULT的组合:**

```sql
-- ✅ 推荐: 允许NULL但设置默认值
dept_id BIGINT(20) DEFAULT NULL COMMENT '部门ID'
user_name VARCHAR(30) DEFAULT NULL COMMENT '用户账号'
email VARCHAR(50) DEFAULT '' COMMENT '用户邮箱'
status CHAR(1) DEFAULT '1' COMMENT '帐号状态'

-- ✅ 主键必须NOT NULL
user_id BIGINT(20) NOT NULL COMMENT '用户ID'

-- ✅ 重要业务字段使用NOT NULL
role_name VARCHAR(30) NOT NULL COMMENT '角色名称'
post_code VARCHAR(64) NOT NULL COMMENT '岗位编码'
```

**NULL vs 空字符串:**
- `NULL` - 未知、不确定
- `''` - 已知为空

```sql
-- ✅ 邮箱未填写用空字符串
email VARCHAR(50) DEFAULT '' COMMENT '用户邮箱'

-- ✅ 部门ID未设置用NULL
dept_id BIGINT(20) DEFAULT NULL COMMENT '部门ID'
```

参考: script/sql/ry_plus_sys.sql:152-176

#### 3.2 DEFAULT 默认值

所有字段都应该设置合理的默认值:

```sql
-- ✅ 字符串默认值
user_name VARCHAR(30) DEFAULT NULL
nick_name VARCHAR(30) DEFAULT NULL
email VARCHAR(50) DEFAULT ''
avatar VARCHAR(255) DEFAULT ''

-- ✅ 数值默认值
parent_id BIGINT(20) DEFAULT 0 COMMENT '父部门id'
order_num INT(4) DEFAULT 0 COMMENT '显示顺序'
account_count INT DEFAULT -1 COMMENT '用户数量(-1不限制)'

-- ✅ 状态标志默认值
status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'
is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除'

-- ✅ 租户ID默认值
tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id'
```

**默认值原则:**
- 状态字段默认正常状态('1')
- 逻辑删除默认未删除('0')
- 数量默认0或-1(不限制)
- 父ID默认0(顶级节点)
- 租户ID默认'000000'(主租户)

参考: script/sql/ry_plus_sys.sql:152-176

#### 3.3 COMMENT 注释

**所有字段必须添加注释:**

```sql
-- ✅ 详细的字段注释
user_id BIGINT(20) NOT NULL COMMENT '用户ID'
status CHAR(1) DEFAULT '1' COMMENT '帐号状态(1正常 0停用)'
data_scope CHAR(1) DEFAULT '1' COMMENT '数据范围(1全部 2自定义 3本部门 4本部门及以下 5仅本人 6部门及以下或本人)'
is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除'

-- ❌ 缺少注释
status CHAR(1) DEFAULT '1'
```

**注释规范:**
- 简洁明了,说明字段含义
- 枚举值需要列出所有选项
- 标注特殊含义(-1表示不限制等)
- 标注是否必填、取值范围

参考: script/sql/ry_plus_sys.sql:152-243

### 4. 通用字段规范

#### 4.1 必须包含的字段

所有业务表都必须包含以下字段:

```sql
-- 主键
xxx_id BIGINT(20) NOT NULL COMMENT '主键ID'

-- 租户字段(多租户表)
tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id'

-- 逻辑删除
is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除'

-- 审计字段
create_dept BIGINT(20) DEFAULT NULL COMMENT '创建部门'
create_by BIGINT(20) DEFAULT NULL COMMENT '创建者'
create_time DATETIME COMMENT '创建时间'
update_by BIGINT(20) DEFAULT NULL COMMENT '更新者'
update_time DATETIME COMMENT '更新时间'
```

参考: script/sql/ry_plus_sys.sql:152-176

#### 4.2 可选的通用字段

```sql
-- 状态
status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'

-- 排序
order_num INT(4) DEFAULT 0 COMMENT '显示顺序'

-- 备注
remark VARCHAR(500) DEFAULT NULL COMMENT '备注'
```

#### 4.3 特殊业务字段

**多租户字段:**

```sql
tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id'
```

**树形结构字段:**

```sql
parent_id BIGINT(20) DEFAULT 0 COMMENT '父节点ID'
ancestors VARCHAR(500) DEFAULT '' COMMENT '祖级列表'
```

**分类字段:**

```sql
dept_category VARCHAR(100) DEFAULT NULL COMMENT '部门类别编码'
post_category VARCHAR(100) DEFAULT NULL COMMENT '岗位类别编码'
```

参考: script/sql/ry_plus_sys.sql:93-114

---

## 索引设计策略

### 1. 索引设计原则

#### 1.1 何时创建索引

**必须创建索引的场景:**
- ✅ 主键字段(自动创建)
- ✅ 外键字段
- ✅ WHERE条件中频繁使用的字段
- ✅ ORDER BY、GROUP BY使用的字段
- ✅ JOIN ON条件的字段
- ✅ 区分度高的字段

**不应创建索引的场景:**
- ❌ 频繁更新的字段
- ❌ 区分度低的字段(如性别)
- ❌ TEXT、BLOB等大字段
- ❌ 查询很少使用的字段

#### 1.2 索引设计原则

1. **最左前缀原则** - 复合索引遵循最左前缀匹配
2. **选择性原则** - 索引列的区分度越高越好
3. **长度原则** - 字符串索引考虑使用前缀索引
4. **数量原则** - 单表索引数量不超过5个
5. **覆盖索引** - 尽量让索引覆盖查询字段

### 2. 索引类型和应用

#### 2.1 主键索引(PRIMARY KEY)

每个表必须有主键,自动创建聚簇索引:

```sql
-- ✅ 所有业务表都有主键
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL COMMENT '用户ID',
    ...
    PRIMARY KEY (user_id)
);

-- ✅ 关联表使用复合主键
CREATE TABLE sys_user_role (
    user_id BIGINT(20) NOT NULL COMMENT '用户ID',
    role_id BIGINT(20) NOT NULL COMMENT '角色ID',
    PRIMARY KEY (user_id, role_id)
);
```

**主键选择:**
- ✅ 使用自增ID或雪花ID
- ✅ BIGINT(20)类型
- ❌ 不使用业务字段作为主键
- ❌ 不使用UUID(无序,性能差)

参考: script/sql/ry_plus_sys.sql:175

#### 2.2 唯一索引(UNIQUE KEY)

保证字段值唯一性:

```sql
-- ✅ 租户+用户名唯一
CREATE UNIQUE INDEX uk_tenant_username ON sys_user(tenant_id, user_name);

-- ✅ 租户+角色标识唯一
CREATE UNIQUE INDEX uk_tenant_role_key ON sys_role(tenant_id, role_key);
```

**注意事项:**
- 多租户场景需要加上tenant_id
- NULL值不受唯一约束限制

#### 2.3 普通索引(INDEX/KEY)

最常用的索引类型:

```sql
-- ✅ 单列索引
CREATE INDEX idx_tenant_id ON sys_user (tenant_id);
CREATE INDEX idx_user_name ON sys_user (user_name);
CREATE INDEX idx_parent_id ON sys_dept (parent_id);

-- ✅ 复合索引(覆盖查询)
CREATE INDEX idx_tenant_user ON sys_social (tenant_id, user_id);

-- ✅ 时间范围查询索引
CREATE INDEX idx_sys_oper_log_ot ON sys_oper_log (oper_time);

-- ✅ 状态查询索引
CREATE INDEX idx_sys_oper_log_s ON sys_oper_log (status);
```

参考: script/sql/ry_plus_sys.sql:1288-1355

#### 2.4 项目中的索引设计

**租户隔离索引:**

```sql
-- 所有多租户表都需要tenant_id索引
CREATE INDEX idx_tenant_id ON sys_user (tenant_id);
CREATE INDEX idx_tenant_id ON sys_dept (tenant_id);
CREATE INDEX idx_tenant_id ON sys_role (tenant_id);
CREATE INDEX idx_tenant_id ON sys_post (tenant_id);
```

**外键关联索引:**

```sql
-- 用户表
CREATE INDEX idx_tenant_id ON sys_user (tenant_id);

-- 部门表
CREATE INDEX idx_parent_id ON sys_dept (parent_id);

-- 岗位表
CREATE INDEX idx_dept_id ON sys_post (dept_id);

-- 菜单表
CREATE INDEX idx_parent_id ON sys_menu (parent_id);
CREATE INDEX idx_menu_type ON sys_menu (menu_type);
```

**关联表索引:**

```sql
-- 用户角色关联
CREATE INDEX idx_role_id ON sys_user_role (role_id);

-- 角色菜单关联
CREATE INDEX idx_menu_id ON sys_role_menu (menu_id);

-- 角色部门关联
CREATE INDEX idx_dept_id ON sys_role_dept (dept_id);

-- 用户岗位关联
CREATE INDEX idx_post_id ON sys_user_post (post_id);
```

**业务查询索引:**

```sql
-- 字典类型查询
CREATE INDEX idx_dict_type ON sys_dict_type (dict_type);

-- 字典数据查询
CREATE INDEX idx_dict_type ON sys_dict_data (dict_type);

-- 配置查询
CREATE INDEX idx_config_key ON sys_config (config_key);

-- 角色权限查询
CREATE INDEX idx_role_key ON sys_role (role_key);
```

**日志查询索引:**

```sql
-- 操作日志
CREATE INDEX idx_tenant_id ON sys_oper_log (tenant_id);

-- 登录日志
CREATE INDEX idx_tenant_id ON sys_login_log (tenant_id);
CREATE INDEX idx_user_id ON sys_login_log (user_id);

-- OSS文件
CREATE INDEX idx_tenant_id ON sys_oss (tenant_id);
CREATE INDEX idx_directory_id ON sys_oss (directory_id);
```

**复合索引示例:**

```sql
-- 社交登录: 租户+用户查询
CREATE INDEX idx_tenant_user ON sys_social (tenant_id, user_id);

-- 社交登录: 认证ID查询
CREATE INDEX idx_auth_id ON sys_social (auth_id);

-- 社交登录: 来源查询
CREATE INDEX idx_source ON sys_social (source);
```

参考: script/sql/ry_plus_sys.sql:1288-1355

### 3. 索引优化实践

#### 3.1 复合索引最左前缀原则

```sql
-- 创建复合索引
CREATE INDEX idx_tenant_user_time ON sys_oper_log (tenant_id, user_id, oper_time);

-- ✅ 能用到索引
WHERE tenant_id = '000000'
WHERE tenant_id = '000000' AND user_id = 1
WHERE tenant_id = '000000' AND user_id = 1 AND oper_time > '2025-01-01'

-- ❌ 不能用到索引(跳过了最左列)
WHERE user_id = 1
WHERE oper_time > '2025-01-01'
WHERE user_id = 1 AND oper_time > '2025-01-01'
```

#### 3.2 覆盖索引优化

索引包含查询所需的所有字段,避免回表:

```sql
-- 创建覆盖索引
CREATE INDEX idx_tenant_username_status ON sys_user (tenant_id, user_name, status);

-- ✅ 覆盖索引(不需要回表)
SELECT user_name, status
FROM sys_user
WHERE tenant_id = '000000' AND user_name = 'admin';

-- ❌ 需要回表(查询了索引外的字段)
SELECT user_name, status, nick_name, email
FROM sys_user
WHERE tenant_id = '000000' AND user_name = 'admin';
```

#### 3.3 前缀索引

对于长字符串字段,使用前缀索引:

```sql
-- ✅ 前缀索引(取前50个字符)
CREATE INDEX idx_oper_url ON sys_oper_log (oper_url(50));

-- 查询前缀索引的区分度
SELECT
    COUNT(DISTINCT LEFT(oper_url, 10)) / COUNT(*) AS selectivity_10,
    COUNT(DISTINCT LEFT(oper_url, 20)) / COUNT(*) AS selectivity_20,
    COUNT(DISTINCT LEFT(oper_url, 50)) / COUNT(*) AS selectivity_50
FROM sys_oper_log;
```

**前缀长度选择:**
- 区分度达到90%以上即可
- 一般10-50个字符

#### 3.4 索引失效场景

避免以下导致索引失效的写法:

```sql
-- ❌ 函数计算导致索引失效
SELECT * FROM sys_user WHERE YEAR(create_time) = 2025;
-- ✅ 改为范围查询
SELECT * FROM sys_user WHERE create_time >= '2025-01-01' AND create_time < '2026-01-01';

-- ❌ 隐式类型转换
SELECT * FROM sys_user WHERE user_id = '1'; -- user_id是BIGINT
-- ✅ 使用正确类型
SELECT * FROM sys_user WHERE user_id = 1;

-- ❌ LIKE以通配符开头
SELECT * FROM sys_user WHERE user_name LIKE '%admin';
-- ✅ 通配符在后面
SELECT * FROM sys_user WHERE user_name LIKE 'admin%';

-- ❌ OR条件部分无索引
SELECT * FROM sys_user WHERE user_id = 1 OR nick_name = 'admin'; -- nick_name无索引
-- ✅ 改用UNION
SELECT * FROM sys_user WHERE user_id = 1
UNION
SELECT * FROM sys_user WHERE nick_name = 'admin';

-- ❌ NOT、!=、<>
SELECT * FROM sys_user WHERE status != '0';
-- ✅ 改用IN
SELECT * FROM sys_user WHERE status IN ('1', '2');
```

### 4. 索引监控和维护

#### 4.1 查看索引使用情况

```sql
-- 查看表的索引
SHOW INDEX FROM sys_user;

-- 查看索引统计信息
SELECT * FROM information_schema.STATISTICS
WHERE table_schema = 'your_database' AND table_name = 'sys_user';

-- 查看未使用的索引
SELECT * FROM sys.schema_unused_indexes
WHERE object_schema = 'your_database';
```

#### 4.2 索引维护

```sql
-- 重建索引(优化索引性能)
ALTER TABLE sys_user DROP INDEX idx_user_name, ADD INDEX idx_user_name (user_name);

-- 或使用OPTIMIZE TABLE
OPTIMIZE TABLE sys_user;

-- 分析表统计信息
ANALYZE TABLE sys_user;
```

---

## 约束和外键设计

### 1. 约束类型

#### 1.1 主键约束(PRIMARY KEY)

```sql
-- ✅ 单字段主键
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL,
    PRIMARY KEY (user_id)
);

-- ✅ 复合主键
CREATE TABLE sys_user_role (
    user_id BIGINT(20) NOT NULL,
    role_id BIGINT(20) NOT NULL,
    PRIMARY KEY (user_id, role_id)
);
```

参考: script/sql/ry_plus_sys.sql:175, 627

#### 1.2 唯一约束(UNIQUE)

```sql
-- ✅ 租户内用户名唯一
ALTER TABLE sys_user ADD CONSTRAINT uk_tenant_username
UNIQUE (tenant_id, user_name);

-- ✅ 租户内角色标识唯一
ALTER TABLE sys_role ADD CONSTRAINT uk_tenant_role_key
UNIQUE (tenant_id, role_key);
```

#### 1.3 非空约束(NOT NULL)

```sql
-- ✅ 重要字段不允许NULL
role_name VARCHAR(30) NOT NULL COMMENT '角色名称'
post_code VARCHAR(64) NOT NULL COMMENT '岗位编码'
```

#### 1.4 检查约束(CHECK) - MySQL 8.0+

```sql
-- ✅ 状态值检查
ALTER TABLE sys_user ADD CONSTRAINT chk_status
CHECK (status IN ('0', '1'));

-- ✅ 年龄范围检查
ALTER TABLE sys_user ADD CONSTRAINT chk_age
CHECK (age >= 0 AND age <= 150);

-- ✅ 邮箱格式检查
ALTER TABLE sys_user ADD CONSTRAINT chk_email
CHECK (email REGEXP '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$');
```

### 2. 外键设计

#### 2.1 项目中不使用外键约束

RuoYi-Plus项目**不使用数据库外键约束**,原因:

**不使用外键的原因:**
- ❌ 外键约束影响性能(INSERT/UPDATE/DELETE需要检查)
- ❌ 不利于分库分表
- ❌ 级联操作风险高
- ❌ 增加数据库复杂度

**替代方案:**
- ✅ 在应用层维护引用完整性
- ✅ 使用索引提升关联查询性能
- ✅ 使用事务保证数据一致性

```sql
-- ✅ 推荐: 不使用外键,但创建索引
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL,
    dept_id BIGINT(20) DEFAULT NULL COMMENT '部门ID',
    PRIMARY KEY (user_id),
    -- 不创建外键
    -- FOREIGN KEY (dept_id) REFERENCES sys_dept(dept_id)
);

-- 创建索引提升关联查询性能
CREATE INDEX idx_dept_id ON sys_user (dept_id);
```

#### 2.2 应用层维护引用完整性

```java
// ✅ 在Service层检查引用完整性
@Override
@Transactional(rollbackFor = Exception.class)
public int deleteUser(Long userId) {
    // 检查用户是否存在
    SysUser user = baseMapper.selectById(userId);
    if (ObjectUtil.isNull(user)) {
        throw new ServiceException("用户不存在");
    }

    // 检查是否有关联数据
    Long count = userRoleMapper.selectCount(
        new LambdaQueryWrapper<SysUserRole>()
            .eq(SysUserRole::getUserId, userId)
    );
    if (count > 0) {
        throw new ServiceException("用户已分配角色,不能删除");
    }

    // 删除用户
    return baseMapper.deleteById(userId);
}
```

参考: ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/core/service/impl/SysUserServiceImpl.java

---

## 实体类设计规范

### 1. 实体类设计模式

#### 1.1 BaseEntity基类

所有实体类都继承`BaseEntity`,包含通用审计字段:

```java
package plus.ruoyi.common.mybatis.core.domain;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import java.io.Serializable;
import java.util.Date;

/**
 * Entity基类
 */
@Data
public class BaseEntity implements Serializable {

    /**
     * 创建部门
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createDept;

    /**
     * 创建者
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 更新者
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}
```

**FieldFill自动填充:**
- `INSERT` - 插入时自动填充
- `INSERT_UPDATE` - 插入和更新时都自动填充

参考: ruoyi-common/ruoyi-common-mybatis/src/main/java/plus/ruoyi/common/mybatis/core/domain/BaseEntity.java:1-70

#### 1.2 TenantEntity租户基类

多租户表继承`TenantEntity`:

```java
package plus.ruoyi.common.tenant.core;

import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import plus.ruoyi.common.mybatis.core.domain.BaseEntity;

/**
 * 租户Entity基类
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TenantEntity extends BaseEntity {

    /**
     * 租户ID
     */
    @TableField(tenantIdField = true)
    private String tenantId;
}
```

**租户字段特性:**
- 自动注入租户ID
- 查询时自动添加租户条件
- 数据自动隔离

#### 1.3 实体类示例 - SysUser

```java
package plus.ruoyi.system.core.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import plus.ruoyi.common.tenant.core.TenantEntity;
import java.util.Date;

/**
 * 用户对象 sys_user
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends TenantEntity {

    /**
     * 用户ID
     */
    @TableId(value = "user_id")
    private Long userId;

    /**
     * 部门ID
     */
    private Long deptId;

    /**
     * 用户账号
     */
    private String userName;

    /**
     * 用户昵称
     */
    private String nickName;

    /**
     * 密码
     */
    @TableField(
        insertStrategy = FieldStrategy.NOT_EMPTY,
        updateStrategy = FieldStrategy.NOT_EMPTY,
        whereStrategy = FieldStrategy.NOT_EMPTY
    )
    private String password;

    /**
     * 帐号状态
     */
    private String status;

    /**
     * 是否删除
     */
    @TableLogic
    private String isDeleted;

    /**
     * 最后登录IP
     */
    private String loginIp;

    /**
     * 最后登录时间
     */
    private Date loginDate;

    /**
     * 备注
     */
    private String remark;
}
```

参考: ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/core/domain/SysUser.java:1-115

### 2. MyBatis-Plus注解

#### 2.1 @TableName

指定表名:

```java
@TableName("sys_user")
public class SysUser extends TenantEntity {
    // ...
}
```

#### 2.2 @TableId

指定主键字段:

```java
/**
 * 用户ID
 */
@TableId(value = "user_id")
private Long userId;

// 自增主键
@TableId(value = "user_id", type = IdType.AUTO)
private Long userId;

// 雪花ID
@TableId(value = "user_id", type = IdType.ASSIGN_ID)
private Long userId;
```

**IdType类型:**
- `AUTO` - 数据库自增ID
- `ASSIGN_ID` - 雪花算法ID(默认)
- `INPUT` - 用户输入ID

#### 2.3 @TableField

字段注解:

```java
// 自动填充
@TableField(fill = FieldFill.INSERT)
private Long createBy;

@TableField(fill = FieldFill.INSERT_UPDATE)
private Long updateBy;

// 字段策略(密码字段)
@TableField(
    insertStrategy = FieldStrategy.NOT_EMPTY,
    updateStrategy = FieldStrategy.NOT_EMPTY,
    whereStrategy = FieldStrategy.NOT_EMPTY
)
private String password;

// 不是数据库字段
@TableField(exist = false)
private String searchValue;

// 租户字段
@TableField(tenantIdField = true)
private String tenantId;
```

**FieldStrategy策略:**
- `NOT_NULL` - 非NULL判断
- `NOT_EMPTY` - 非空判断(推荐)
- `IGNORED` - 忽略判断
- `NEVER` - 不处理

参考: ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/core/domain/SysUser.java:73-78

#### 2.4 @TableLogic

逻辑删除:

```java
/**
 * 是否删除
 */
@TableLogic
private String isDeleted;
```

**逻辑删除配置:**

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: isDeleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

**逻辑删除效果:**
- DELETE操作变为UPDATE is_deleted = '1'
- SELECT自动拼接WHERE is_deleted = '0'

参考: ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/core/domain/SysUser.java:88-89

### 3. 实体类设计最佳实践

#### 3.1 继承体系

```
BaseEntity (通用审计字段)
    ├── TenantEntity (租户字段)
    │     ├── SysUser (用户实体)
    │     ├── SysRole (角色实体)
    │     └── SysDept (部门实体)
    └── 普通业务实体
```

#### 3.2 字段映射

```java
// ✅ Java驼峰 -> 数据库下划线(自动转换)
private String userName;  // -> user_name
private Date createTime;  // -> create_time

// ✅ 指定字段名
@TableField("dept_id")
private Long deptId;
```

#### 3.3 Lombok注解

```java
@Data                                   // getter/setter/toString等
@NoArgsConstructor                      // 无参构造
@AllArgsConstructor                     // 全参构造
@EqualsAndHashCode(callSuper = true)    // equals/hashCode(包含父类)
@Builder                                // 建造者模式
@TableName("sys_user")
public class SysUser extends TenantEntity {
    // ...
}
```

---

## 数据库优化策略

### 1. 查询优化

#### 1.1 避免SELECT *

```sql
-- ❌ 不推荐
SELECT * FROM sys_user WHERE user_id = 1;

-- ✅ 推荐: 只查询需要的字段
SELECT user_id, user_name, nick_name, status
FROM sys_user
WHERE user_id = 1;
```

**原因:**
- 减少网络传输
- 提高查询效率
- 便于使用覆盖索引

#### 1.2 分页查询优化

```sql
-- ❌ 深分页性能差
SELECT * FROM sys_oper_log
ORDER BY oper_time DESC
LIMIT 100000, 10;

-- ✅ 使用子查询优化
SELECT * FROM sys_oper_log
WHERE oper_id >= (
    SELECT oper_id FROM sys_oper_log
    ORDER BY oper_time DESC
    LIMIT 100000, 1
)
ORDER BY oper_time DESC
LIMIT 10;

-- ✅ 使用游标分页
SELECT * FROM sys_oper_log
WHERE oper_id < 100000
ORDER BY oper_id DESC
LIMIT 10;
```

#### 1.3 JOIN优化

```sql
-- ❌ 不推荐: 关联过多表
SELECT u.*, d.*, r.*, p.*
FROM sys_user u
LEFT JOIN sys_dept d ON u.dept_id = d.dept_id
LEFT JOIN sys_user_role ur ON u.user_id = ur.user_id
LEFT JOIN sys_role r ON ur.role_id = r.role_id
LEFT JOIN sys_user_post up ON u.user_id = up.user_id
LEFT JOIN sys_post p ON up.post_id = p.post_id;

-- ✅ 推荐: 拆分查询
SELECT user_id, user_name, dept_id FROM sys_user;
SELECT dept_id, dept_name FROM sys_dept WHERE dept_id IN (...);
SELECT role_id FROM sys_user_role WHERE user_id IN (...);
```

#### 1.4 COUNT优化

```sql
-- ❌ 慢查询
SELECT COUNT(*) FROM sys_oper_log WHERE status = '1';

-- ✅ 使用索引列
SELECT COUNT(oper_id) FROM sys_oper_log WHERE status = '1';

-- ✅ 使用近似值(大表统计)
SELECT TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'your_database' AND TABLE_NAME = 'sys_oper_log';
```

### 2. 写入优化

#### 2.1 批量插入

```java
// ❌ 不推荐: 循环单条插入
for (SysUser user : userList) {
    baseMapper.insert(user);
}

// ✅ 推荐: 批量插入
baseMapper.insertBatch(userList);

// 对应SQL
INSERT INTO sys_user (user_name, nick_name, ...) VALUES
    ('user1', 'name1', ...),
    ('user2', 'name2', ...),
    ('user3', 'name3', ...);
```

#### 2.2 事务优化

```java
// ✅ 合理使用事务
@Transactional(rollbackFor = Exception.class)
public void batchUpdate(List<SysUser> users) {
    for (SysUser user : users) {
        baseMapper.updateById(user);
    }
}
```

**事务原则:**
- 事务尽可能短
- 避免长事务
- 只读操作不加事务

### 3. 表设计优化

#### 3.1 垂直分表

将大字段拆分到扩展表:

```sql
-- ✅ 主表(常用字段)
CREATE TABLE sys_user (
    user_id BIGINT(20) PRIMARY KEY,
    user_name VARCHAR(30),
    nick_name VARCHAR(30),
    status CHAR(1)
);

-- ✅ 扩展表(不常用字段)
CREATE TABLE sys_user_profile (
    user_id BIGINT(20) PRIMARY KEY,
    avatar TEXT,
    intro TEXT,
    preferences TEXT
);
```

#### 3.2 水平分表

按时间或业务维度分表:

```sql
-- 按月份分表
sys_oper_log_202501
sys_oper_log_202502
sys_oper_log_202503

-- 按租户分表
sys_user_tenant_000001
sys_user_tenant_000002
```

#### 3.3 冷热数据分离

```sql
-- 热数据表(最近3个月)
CREATE TABLE sys_oper_log_hot (
    ...
);

-- 冷数据表(3个月前)
CREATE TABLE sys_oper_log_cold (
    ...
);

-- 定期归档
INSERT INTO sys_oper_log_cold
SELECT * FROM sys_oper_log_hot
WHERE oper_time < DATE_SUB(NOW(), INTERVAL 3 MONTH);

DELETE FROM sys_oper_log_hot
WHERE oper_time < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

### 4. 连接池优化

```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    hikari:
      # 最小空闲连接数
      minimum-idle: 10
      # 最大连接池大小
      maximum-pool-size: 50
      # 连接超时时间(毫秒)
      connection-timeout: 30000
      # 空闲连接最大存活时间(毫秒)
      idle-timeout: 600000
      # 连接最大存活时间(毫秒)
      max-lifetime: 1800000
      # 连接测试查询
      connection-test-query: SELECT 1
```

---

## 多租户数据隔离

### 1. 多租户设计方案

#### 1.1 独立数据库

每个租户使用独立数据库:

**优点:**
- ✅ 数据完全隔离
- ✅ 易于备份恢复
- ✅ 租户间不影响

**缺点:**
- ❌ 数据库数量多
- ❌ 维护成本高
- ❌ 不利于跨租户分析

#### 1.2 共享数据库独立Schema

租户共享数据库,但使用独立Schema:

**优点:**
- ✅ 数据隔离性好
- ✅ 资源利用率高

**缺点:**
- ❌ Schema数量限制
- ❌ 维护复杂度高

#### 1.3 共享数据库共享表(项目方案)

所有租户共享数据库和表,通过tenant_id字段隔离:

```sql
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL,
    tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id',
    user_name VARCHAR(30),
    ...
    PRIMARY KEY (user_id)
);

CREATE INDEX idx_tenant_id ON sys_user (tenant_id);
```

**优点:**
- ✅ 成本最低
- ✅ 维护简单
- ✅ 便于跨租户分析

**缺点:**
- ❌ 需要保证查询都带租户条件
- ❌ 数据隔离性相对较弱

参考: script/sql/ry_plus_sys.sql:152-176

### 2. MyBatis-Plus多租户插件

#### 2.1 租户拦截器配置

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

    // 多租户插件
    TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor();
    tenantInterceptor.setTenantLineHandler(new TenantLineHandler() {
        @Override
        public Expression getTenantId() {
            // 获取当前租户ID
            String tenantId = TenantHelper.getTenantId();
            return new StringValue(tenantId);
        }

        @Override
        public String getTenantIdColumn() {
            return "tenant_id";
        }

        @Override
        public boolean ignoreTable(String tableName) {
            // 忽略不需要租户隔离的表
            return !Arrays.asList("sys_user", "sys_role", "sys_dept").contains(tableName);
        }
    });

    interceptor.addInnerInterceptor(tenantInterceptor);
    return interceptor;
}
```

#### 2.2 自动注入租户ID

```java
// 查询自动添加租户条件
SELECT * FROM sys_user WHERE user_name = 'admin'
// 自动转换为
SELECT * FROM sys_user WHERE user_name = 'admin' AND tenant_id = '000000'

// 插入自动填充租户ID
INSERT INTO sys_user (user_name, nick_name) VALUES ('admin', '管理员')
// 自动转换为
INSERT INTO sys_user (user_name, nick_name, tenant_id) VALUES ('admin', '管理员', '000000')
```

### 3. 租户数据隔离最佳实践

#### 3.1 所有业务表必须包含tenant_id

```sql
-- ✅ 正确: 包含租户字段
CREATE TABLE sys_user (
    user_id BIGINT(20) NOT NULL,
    tenant_id VARCHAR(20) DEFAULT '000000',
    ...
);

CREATE TABLE sys_role (
    role_id BIGINT(20) NOT NULL,
    tenant_id VARCHAR(20) DEFAULT '000000',
    ...
);
```

#### 3.2 创建租户索引

```sql
-- 所有多租户表都需要tenant_id索引
CREATE INDEX idx_tenant_id ON sys_user (tenant_id);
CREATE INDEX idx_tenant_id ON sys_role (tenant_id);
CREATE INDEX idx_tenant_id ON sys_dept (tenant_id);
```

参考: script/sql/ry_plus_sys.sql:1293-1355

#### 3.3 租户ID规范

```sql
-- 默认主租户
tenant_id VARCHAR(20) DEFAULT '000000'

-- 租户ID格式
'000000' - 主租户(超级管理员)
'000001' - 租户1
'000002' - 租户2
...
```

参考: script/sql/ry_plus_sys.sql:40-70

---

## 数据迁移和版本管理

### 1. SQL脚本管理

#### 1.1 脚本目录结构

```
script/sql/
├── ry_plus_sys.sql           # 主数据库(MySQL)
├── ry_plus_app.sql           # 应用数据库
├── ry_plus_job.sql           # 定时任务数据库
├── ry_plus_new.sql           # 增量更新SQL
├── oracle/                   # Oracle数据库脚本
│   ├── oracle_ry_plus_sys.sql
│   ├── oracle_ry_plus_app.sql
│   └── oracle_ry_plus_job.sql
├── postgres/                 # PostgreSQL数据库脚本
│   ├── postgres_ry_plus_sys.sql
│   ├── postgres_ry_plus_app.sql
│   └── postgres_ry_plus_job.sql
└── sqlserver/                # SQL Server数据库脚本
    ├── sqlserver_ry_plus_sys.sql
    ├── sqlserver_ry_plus_app.sql
    └── sqlserver_ry_plus_job.sql
```

参考: script/sql/

#### 1.2 版本控制规范

```sql
-- 版本信息注释
-- 版本: 5.5.0
-- 日期: 2025-10-26
-- 说明: 新增XXX功能

-- 新增表
CREATE TABLE sys_xxx (...);

-- 修改表
ALTER TABLE sys_user ADD COLUMN xxx VARCHAR(50) COMMENT 'xxx';

-- 数据初始化
INSERT INTO sys_menu VALUES (...);
```

### 2. 数据库迁移工具

#### 2.1 Flyway

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    baseline-version: 1
    encoding: UTF-8
```

**迁移脚本命名:**

```
src/main/resources/db/migration/
├── V1__Init_Database.sql
├── V2__Add_User_Table.sql
├── V3__Add_Role_Table.sql
├── V4__Add_User_Role_Relation.sql
└── V5__Add_User_Status_Field.sql
```

#### 2.2 Liquibase

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  liquibase:
    enabled: true
    change-log: classpath:db/changelog/db.changelog-master.xml
```

### 3. 数据迁移最佳实践

#### 3.1 向后兼容

```sql
-- ✅ 推荐: 新增字段设置默认值
ALTER TABLE sys_user
ADD COLUMN gender CHAR(1) DEFAULT NULL COMMENT '用户性别';

-- ✅ 推荐: 删除字段前先废弃
ALTER TABLE sys_user
MODIFY COLUMN old_field VARCHAR(50) DEFAULT NULL COMMENT '废弃字段(将在v6.0删除)';

-- 下一个大版本再删除
-- ALTER TABLE sys_user DROP COLUMN old_field;
```

#### 3.2 大表修改

```sql
-- ❌ 不推荐: 直接ALTER大表
ALTER TABLE sys_oper_log ADD COLUMN xxx VARCHAR(50);

-- ✅ 推荐: 先建新表,再迁移数据,最后切换
CREATE TABLE sys_oper_log_new LIKE sys_oper_log;
ALTER TABLE sys_oper_log_new ADD COLUMN xxx VARCHAR(50);
INSERT INTO sys_oper_log_new SELECT *, NULL FROM sys_oper_log;
RENAME TABLE sys_oper_log TO sys_oper_log_old,
             sys_oper_log_new TO sys_oper_log;
```

#### 3.3 数据备份

```bash
# 备份数据库
mysqldump -u root -p your_database > backup_20250110.sql

# 备份单表
mysqldump -u root -p your_database sys_user > sys_user_backup.sql

# 恢复数据
mysql -u root -p your_database < backup_20250110.sql
```

---

## 最佳实践

### 1. 表设计最佳实践

#### ✅ 推荐做法

1. **所有表必须包含审计字段**
   ```sql
   create_dept, create_by, create_time, update_by, update_time
   ```

2. **所有表必须包含逻辑删除字段**
   ```sql
   is_deleted CHAR(1) DEFAULT '0' COMMENT '是否删除'
   ```

3. **多租户表必须包含租户字段**
   ```sql
   tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id'
   ```

4. **所有字段必须添加注释**
   ```sql
   user_name VARCHAR(30) COMMENT '用户账号'
   ```

5. **字段设置合理的默认值**
   ```sql
   status CHAR(1) DEFAULT '1'
   order_num INT DEFAULT 0
   ```

6. **使用BIGINT作为主键类型**
   ```sql
   user_id BIGINT(20) NOT NULL
   ```

7. **字符串统一使用VARCHAR**
   ```sql
   user_name VARCHAR(30)
   nick_name VARCHAR(30)
   ```

8. **时间字段使用DATETIME**
   ```sql
   create_time DATETIME
   login_date DATETIME
   ```

9. **状态使用CHAR(1)而非数字**
   ```sql
   status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'
   ```

10. **树形结构使用ancestors字段**
    ```sql
    parent_id BIGINT(20) DEFAULT 0
    ancestors VARCHAR(500) DEFAULT ''
    ```

参考: script/sql/ry_plus_sys.sql:1-1300

#### ❌ 避免做法

1. **不要使用SELECT ***
   ```sql
   -- ❌
   SELECT * FROM sys_user;
   -- ✅
   SELECT user_id, user_name, status FROM sys_user;
   ```

2. **不要在大表上直接ALTER**
   ```sql
   -- ❌ 千万级数据直接ALTER会锁表
   ALTER TABLE sys_oper_log ADD COLUMN xxx VARCHAR(50);
   ```

3. **不要使用外键约束**
   ```sql
   -- ❌
   FOREIGN KEY (dept_id) REFERENCES sys_dept(dept_id)
   ```

4. **不要使用TIMESTAMP**
   ```sql
   -- ❌
   create_time TIMESTAMP
   -- ✅
   create_time DATETIME
   ```

5. **不要省略字段注释**
   ```sql
   -- ❌
   status CHAR(1)
   -- ✅
   status CHAR(1) COMMENT '状态(1正常 0停用)'
   ```

### 2. 索引设计最佳实践

#### ✅ 推荐做法

1. **租户字段必须创建索引**
   ```sql
   CREATE INDEX idx_tenant_id ON sys_user (tenant_id);
   ```

2. **外键字段必须创建索引**
   ```sql
   CREATE INDEX idx_dept_id ON sys_user (dept_id);
   CREATE INDEX idx_parent_id ON sys_dept (parent_id);
   ```

3. **WHERE条件字段创建索引**
   ```sql
   CREATE INDEX idx_user_name ON sys_user (user_name);
   CREATE INDEX idx_status ON sys_user (status);
   ```

4. **复合索引遵循最左前缀**
   ```sql
   CREATE INDEX idx_tenant_user ON sys_social (tenant_id, user_id);
   ```

5. **日志表添加时间索引**
   ```sql
   CREATE INDEX idx_oper_time ON sys_oper_log (oper_time);
   ```

参考: script/sql/ry_plus_sys.sql:1288-1355

#### ❌ 避免做法

1. **不要在低区分度字段建索引**
   ```sql
   -- ❌ 性别字段只有2-3个值
   CREATE INDEX idx_gender ON sys_user (gender);
   ```

2. **不要建过多索引**
   ```sql
   -- ❌ 单表索引超过5个影响写入性能
   ```

3. **不要在TEXT/BLOB字段建索引**
   ```sql
   -- ❌
   CREATE INDEX idx_content ON sys_article (content); -- TEXT类型
   ```

### 3. SQL编写最佳实践

#### ✅ 推荐做法

1. **使用预编译**
   ```java
   // ✅
   SELECT * FROM sys_user WHERE user_name = ?
   ```

2. **批量操作**
   ```java
   // ✅
   INSERT INTO sys_user (user_name, nick_name) VALUES
       ('user1', 'name1'),
       ('user2', 'name2');
   ```

3. **分页查询**
   ```java
   // ✅
   SELECT * FROM sys_user LIMIT 0, 10;
   ```

4. **使用JOIN替代子查询**
   ```sql
   -- ✅
   SELECT u.*, d.dept_name
   FROM sys_user u
   LEFT JOIN sys_dept d ON u.dept_id = d.dept_id;
   ```

#### ❌ 避免做法

1. **不要拼接SQL**
   ```java
   // ❌ SQL注入风险
   String sql = "SELECT * FROM sys_user WHERE user_name = '" + userName + "'";
   ```

2. **不要使用SELECT *****
   ```sql
   -- ❌
   SELECT * FROM sys_user;
   ```

3. **不要在WHERE中使用函数**
   ```sql
   -- ❌
   SELECT * FROM sys_user WHERE YEAR(create_time) = 2025;
   -- ✅
   SELECT * FROM sys_user
   WHERE create_time >= '2025-01-01' AND create_time < '2026-01-01';
   ```

---

## 常见问题

### 1. 主键设计问题

#### 问题1: 应该使用自增ID还是雪花ID?

**推荐方案: 雪花ID(Snowflake)**

**雪花ID优势:**
- ✅ 全局唯一,分布式环境友好
- ✅ 按时间趋势递增,有序插入性能好
- ✅ 不依赖数据库,减轻数据库压力
- ✅ 可携带机器ID、时间戳等信息

**自增ID劣势:**
- ❌ 分库分表时ID冲突
- ❌ 数据迁移困难
- ❌ ID可被预测,安全性低

```java
// ✅ 使用雪花ID
@TableId(value = "user_id", type = IdType.ASSIGN_ID)
private Long userId;
```

参考: ruoyi-modules/ruoyi-system/src/main/java/plus/ruoyi/system/core/domain/SysUser.java:27-28

#### 问题2: 可以使用UUID作为主键吗?

**不推荐使用UUID:**

❌ **UUID缺点:**
- 无序,插入性能差(页分裂)
- 36字符,占用空间大
- 不便于阅读和调试

✅ **替代方案:**
- 使用雪花ID(BIGINT)
- 使用自增ID + 业务前缀

### 2. 字段类型问题

#### 问题3: 状态字段应该用数字还是字符?

**项目推荐: CHAR(1)**

```sql
-- ✅ 推荐
status CHAR(1) DEFAULT '1' COMMENT '状态(1正常 0停用)'

-- ❌ 不推荐
status TINYINT DEFAULT 1 COMMENT '状态(1正常 0停用)'
```

**CHAR(1)优势:**
- ✅ 可读性好('1'/'0' vs 1/0)
- ✅ 易于扩展('1'正常/'0'停用/'2'锁定)
- ✅ 避免NULL值判断
- ✅ 前端展示友好

参考: script/sql/ry_plus_sys.sql:165-166

#### 问题4: 时间字段用DATETIME还是TIMESTAMP?

**项目推荐: DATETIME**

```sql
-- ✅ 推荐
create_time DATETIME COMMENT '创建时间'

-- ❌ 不推荐
create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**DATETIME优势:**
- ✅ 范围大(1000~9999年)
- ✅ 不受时区影响
- ✅ 没有2038年问题

**TIMESTAMP劣势:**
- ❌ 范围小(1970~2038年)
- ❌ 受服务器时区影响

参考: script/sql/ry_plus_sys.sql:110-112

#### 问题5: 金额字段用什么类型?

**推荐: DECIMAL(10, 2)**

```sql
-- ✅ 推荐: DECIMAL精确计算
price DECIMAL(10, 2) COMMENT '价格(元)'
amount DECIMAL(10, 2) COMMENT '金额(元)'

-- ❌ 不推荐: FLOAT/DOUBLE有精度问题
price FLOAT COMMENT '价格'
```

**DECIMAL参数:**
- `DECIMAL(10, 2)` - 总长度10位,小数2位
- 最大值: 99999999.99
- 适用于金额、价格等需要精确计算的场景

### 3. 索引问题

#### 问题6: 索引是不是越多越好?

**不是,过多索引影响性能:**

❌ **索引过多的问题:**
- 占用磁盘空间
- 影响INSERT/UPDATE/DELETE性能
- 增加优化器选择成本

✅ **索引数量建议:**
- 单表索引数量不超过5个
- 优先创建高频查询字段索引
- 定期检查索引使用情况,删除无用索引

#### 问题7: 为什么索引失效了?

**常见索引失效原因:**

```sql
-- ❌ 函数计算
WHERE YEAR(create_time) = 2025

-- ❌ 类型转换
WHERE user_id = '1'  -- user_id是BIGINT

-- ❌ LIKE通配符开头
WHERE user_name LIKE '%admin'

-- ❌ OR条件部分无索引
WHERE user_id = 1 OR nick_name = 'admin'

-- ❌ NOT、!=、<>
WHERE status != '0'
```

✅ **解决方案:**

```sql
-- ✅ 避免函数计算
WHERE create_time >= '2025-01-01' AND create_time < '2026-01-01'

-- ✅ 使用正确类型
WHERE user_id = 1

-- ✅ LIKE通配符在后
WHERE user_name LIKE 'admin%'

-- ✅ 改用UNION
WHERE user_id = 1 UNION WHERE nick_name = 'admin'

-- ✅ 改用IN
WHERE status IN ('1', '2')
```

### 4. 多租户问题

#### 问题8: 多租户如何保证数据隔离?

**项目方案: tenant_id + MyBatis-Plus插件**

```sql
-- 1. 所有表包含租户字段
tenant_id VARCHAR(20) DEFAULT '000000' COMMENT '租户id'

-- 2. 创建租户索引
CREATE INDEX idx_tenant_id ON sys_user (tenant_id);

-- 3. 实体类标注租户字段
@TableField(tenantIdField = true)
private String tenantId;
```

**自动注入租户条件:**
```java
// 原始SQL
SELECT * FROM sys_user WHERE user_name = 'admin'

// 自动转换为
SELECT * FROM sys_user
WHERE user_name = 'admin' AND tenant_id = '000000'
```

参考: script/sql/ry_plus_sys.sql:155

#### 问题9: 如何实现跨租户查询?

**方案: 使用租户忽略注解**

```java
// 临时忽略租户隔离
TenantHelper.ignore(() -> {
    // 这里的查询不会自动添加tenant_id条件
    return baseMapper.selectList(null);
});

// 或指定租户ID查询
TenantHelper.dynamic("000001", () -> {
    // 以租户000001的身份查询
    return baseMapper.selectList(null);
});
```

### 5. 性能优化问题

#### 问题10: 大表如何优化查询性能?

**优化方案:**

1. **分区表**
   ```sql
   -- 按月分区
   CREATE TABLE sys_oper_log (
       ...
       oper_time DATETIME
   ) PARTITION BY RANGE (YEAR(oper_time) * 100 + MONTH(oper_time)) (
       PARTITION p202501 VALUES LESS THAN (202502),
       PARTITION p202502 VALUES LESS THAN (202503),
       ...
   );
   ```

2. **冷热数据分离**
   ```sql
   -- 热数据(最近3个月)
   sys_oper_log_hot

   -- 冷数据(3个月前)
   sys_oper_log_cold
   ```

3. **添加合适索引**
   ```sql
   CREATE INDEX idx_oper_time ON sys_oper_log (oper_time);
   CREATE INDEX idx_status ON sys_oper_log (status);
   ```

4. **定期归档**
   ```sql
   -- 归档6个月前的日志
   INSERT INTO sys_oper_log_archive
   SELECT * FROM sys_oper_log
   WHERE oper_time < DATE_SUB(NOW(), INTERVAL 6 MONTH);

   DELETE FROM sys_oper_log
   WHERE oper_time < DATE_SUB(NOW(), INTERVAL 6 MONTH);
   ```

参考: script/sql/ry_plus_sys.sql:670-695

#### 问题11: COUNT查询很慢怎么办?

**优化方案:**

```sql
-- ❌ 慢查询
SELECT COUNT(*) FROM sys_oper_log;

-- ✅ 方案1: 使用近似值
SELECT TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'your_database' AND TABLE_NAME = 'sys_oper_log';

-- ✅ 方案2: 使用Redis缓存计数
-- 每次INSERT时计数+1, DELETE时计数-1

-- ✅ 方案3: 定期统计到统计表
CREATE TABLE sys_statistics (
    table_name VARCHAR(50),
    record_count BIGINT,
    update_time DATETIME
);
```

---

## 总结

数据库设计是系统架构的基石,良好的数据库设计能够:

✅ **提升性能** - 合理的索引、分区、优化查询
✅ **保证安全** - 数据隔离、权限控制、备份恢复
✅ **便于维护** - 统一规范、清晰注释、版本管理
✅ **支持扩展** - 预留字段、支持多租户、分库分表

**核心原则:**
1. 统一命名规范,所有字段添加注释
2. 合理选择字段类型,设置默认值
3. 主键使用BIGINT雪花ID,避免使用UUID
4. 时间使用DATETIME,状态使用CHAR(1)
5. 多租户表必须包含tenant_id并创建索引
6. 不使用外键约束,在应用层维护引用完整性
7. 合理创建索引,避免索引失效
8. 日志表适当冗余,定期归档
9. 使用MyBatis-Plus简化开发,自动填充审计字段
10. 定期监控性能,优化慢查询

---

**参考文档:**
- [系统架构设计](/practices/architecture/system)
- [缓存策略](/practices/architecture/cache)
- [代码规范](/practices/standards/coding)
- [API设计规范](/practices/standards/api-design)

*最后更新: 2025-11-02*
