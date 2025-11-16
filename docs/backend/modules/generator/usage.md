# 代码生成器使用手册

本文档是代码生成器的完整使用手册,涵盖日常开发中的各种使用场景和操作技巧,帮助开发者快速掌握代码生成器的强大功能。

## 功能概述

### 核心功能

代码生成器提供以下核心功能:

**表管理功能:**
- **表导入** - 从数据库导入表结构
- **表编辑** - 配置表的生成选项
- **表删除** - 删除不需要的生成配置
- **表同步** - 同步数据库结构变更

**代码生成功能:**
- **单表生成** - 生成单个表的CRUD代码
- **批量生成** - 一次生成多个表的代码
- **预览代码** - 生成前预览代码内容
- **下载生成** - 生成ZIP压缩包下载
- **路径生成** - 直接生成到项目路径

**配置管理功能:**
- **字段配置** - 设置字段的显示和权限
- **模板选择** - 选择单表/树表/主子表模板
- **菜单配置** - 配置生成的菜单结构
- **路径配置** - 设置代码生成路径

### 支持的模板类型

#### 1. 单表CRUD模板

适用于标准的增删改查业务场景:

```
适用场景:
- 用户管理
- 商品管理
- 订单管理
- 系统配置

生成内容:
- 列表查询(分页+搜索)
- 新增记录
- 编辑记录
- 删除记录(单个/批量)
- 导入导出Excel
```

#### 2. 树形结构模板

适用于层级数据的管理:

```
适用场景:
- 部门组织架构
- 菜单管理
- 分类管理
- 区域管理

生成内容:
- 树形列表展示
- 节点增删改查
- 树形结构递归
- 节点展开折叠
```

#### 3. 主子表模板

适用于一对多关系的业务:

```
适用场景:
- 订单-订单明细
- 合同-合同条款
- 项目-任务列表
- 单据-单据行

生成内容:
- 主子表关联查询
- 主子表事务保存
- 主子表级联删除
- 主子表联动编辑
```

### 支持的数据库

代码生成器支持以下主流数据库:

| 数据库 | 版本要求 | 驱动类名 |
|--------|---------|----------|
| MySQL | 5.7+ / 8.0+ | com.mysql.cj.jdbc.Driver |
| PostgreSQL | 12+ | org.postgresql.Driver |
| Oracle | 11g+ / 12c+ | oracle.jdbc.driver.OracleDriver |
| SQL Server | 2012+ | com.microsoft.sqlserver.jdbc.SQLServerDriver |
| DM (达梦) | 8+ | dm.jdbc.driver.DmDriver |

## 界面操作指南

### 访问代码生成器

#### 方式一: 通过系统菜单

```
1. 登录系统
2. 点击左侧菜单 "系统工具"
3. 点击子菜单 "代码生成"
4. 进入代码生成器主界面
```

#### 方式二: 直接访问URL

```
前端路由: /tool/generator
后端API: /tool/gen
```

### 主界面说明

代码生成器主界面包含以下区域:

```
┌─────────────────────────────────────────────────────────┐
│ 代码生成器                                              │
├─────────────────────────────────────────────────────────┤
│ [导入] [生成] [编辑] [删除] [同步] [预览]               │  工具栏
├─────────────────────────────────────────────────────────┤
│ 表名: [______] 表描述: [______] 创建时间: [______] [查询]│  查询区
├─────────────────────────────────────────────────────────┤
│ [ ] │ 表名      │ 表描述   │ 实体      │ 创建时间      │  │
│ [√] │ sys_user  │ 用户表   │ SysUser   │ 2024-01-01    │  │
│ [ ] │ sys_role  │ 角色表   │ SysRole   │ 2024-01-01    │  │  列表区
│ [ ] │ sys_menu  │ 菜单表   │ SysMenu   │ 2024-01-01    │  │
├─────────────────────────────────────────────────────────┤
│ 共 3 条记录   第 1 / 1 页                 [< 1 >]        │  分页区
└─────────────────────────────────────────────────────────┘
```

**功能按钮说明:**

- **导入** - 从数据库导入新表
- **生成** - 生成选中表的代码
- **编辑** - 编辑表的生成配置
- **删除** - 删除生成配置
- **同步** - 同步数据库结构
- **预览** - 预览生成的代码

## 表导入操作

### 导入单个表

#### 操作步骤

**第一步: 打开导入对话框**

点击工具栏的 **导入** 按钮,弹出导入表对话框。

**第二步: 选择数据源**

在数据源下拉框中选择目标数据源:

```
数据源: [master ▼]
        slave
        oracle
```

**第三步: 搜索表**

在搜索框中输入表名或表注释进行搜索:

```
表名: [user______]  表注释: [用户______]  [搜索]

搜索结果:
[ ] sys_user       用户表          2024-01-01 10:00:00
[ ] sys_user_role  用户角色关联表   2024-01-01 10:00:00
[ ] sys_user_post  用户岗位关联表   2024-01-01 10:00:00
```

**第四步: 选择表并导入**

```
1. 勾选需要导入的表: [√] sys_user
2. 点击 [确定] 按钮
3. 系统提示: "导入成功"
```

#### 导入后的自动配置

系统会自动完成以下配置:

**基础信息:**
```
表名称: sys_user
表描述: 用户表
实体类名称: SysUser  (自动生成,去除表前缀并转驼峰)
作者: 抓蛙师  (来自配置文件)
```

**生成信息:**
```
生成包路径: plus.ruoyi.business.base  (来自配置文件)
生成模块名: base
生成业务名: sysUser  (根据表名自动生成)
生成功能名: 用户  (从表注释提取)
```

**字段配置:**
```
系统自动识别所有字段:
- 主键字段: 自动识别为不可编辑
- 创建时间/更新时间: 自动排除在表单之外
- 创建人/更新人: 自动排除在表单之外
- 删除标识: 自动排除在表单之外
- 状态字段: 自动设置为单选框
- 备注字段: 自动设置为文本域
```

### 导入多个表

#### 批量导入流程

**第一步: 勾选多个表**

在导入对话框中勾选多个需要导入的表:

```
[√] demo_user       演示用户表
[√] demo_product    演示商品表
[√] demo_order      演示订单表
[√] demo_category   演示分类表
```

**第二步: 确认导入**

点击确定按钮,系统批量导入所有选中的表。

**第三步: 验证导入结果**

```
导入完成后,在主界面查看导入的表:

序号 │ 表名           │ 表描述      │ 实体类名      │ 创建时间
 1   │ demo_user      │ 演示用户表  │ DemoUser      │ 2024-01-01
 2   │ demo_product   │ 演示商品表  │ DemoProduct   │ 2024-01-01
 3   │ demo_order     │ 演示订单表  │ DemoOrder     │ 2024-01-01
 4   │ demo_category  │ 演示分类表  │ DemoCategory  │ 2024-01-01
```

### 导入注意事项

#### 1. 表前缀处理

系统会自动去除配置的表前缀:

```yaml
# generator.yml配置
gen:
  tablePrefix: sys_,demo_,t_,tb_

# 自动去除前缀示例
sys_user → User
demo_product → Product
t_order → Order
tb_category → Category
```

#### 2. 已导入表的过滤

系统会自动过滤已导入的表:

```
数据库中的表:
- sys_user (已导入) - 不显示
- sys_role (已导入) - 不显示
- demo_user (未导入) - 显示 ✓
- demo_product (未导入) - 显示 ✓
```

#### 3. 系统表的过滤

系统会自动过滤以下前缀的表:

```
过滤的表前缀:
- sj_ (SmartJob调度表)
- flow_ (工作流引擎表)
- gen_ (代码生成器表)
```

### 从不同数据源导入

#### 配置多数据源

在 `application.yml` 中配置:

```yaml
spring:
  datasource:
    dynamic:
      primary: master
      datasource:
        master:
          url: jdbc:mysql://localhost:3306/ruoyi_main
          username: root
          password: password
        business:
          url: jdbc:mysql://localhost:3306/ruoyi_business
          username: root
          password: password
        oracle:
          url: jdbc:oracle:thin:@localhost:1521:orcl
          username: system
          password: oracle
```

#### 选择数据源导入

```
1. 打开导入对话框
2. 选择数据源: [business ▼]
3. 搜索并选择表
4. 确认导入

导入后的表会标记数据源:
表名: demo_user
数据源: business
```

## 表配置操作

### 基本信息配置

#### 编辑表配置

选择表,点击 **编辑** 按钮,进入配置页面。

#### 基本信息选项卡

```
┌─── 基本信息 ────────────────────────────────┐
│                                              │
│ 表名称: [sys_user__________________]         │
│ 表描述: [用户信息表_________________]         │
│ 实体类名称: [SysUser__________________]      │
│ 作者: [抓蛙师_______________________]        │
│                                              │
│ ┌ 生成模板 ┐                                 │
│ │ ○ 单表(增删改查)                           │
│ │ ○ 树表(左树右表)                           │
│ │ ○ 主子表(一对多)                           │
│ └─────────┘                                  │
│                                              │
│ 备注: [____________________________________] │
│      [____________________________________] │
│                                              │
└──────────────────────────────────────────────┘
```

**字段说明:**

- **表名称** - 数据库表名(只读,不可修改)
- **表描述** - 表的业务描述(可修改)
- **实体类名称** - 生成的Java实体类名(可修改)
- **作者** - 代码作者信息(用于注释)
- **生成模板** - 选择代码生成模板
- **备注** - 自定义备注说明

### 生成信息配置

#### 生成信息选项卡

```
┌─── 生成信息 ────────────────────────────────┐
│                                              │
│ 生成包路径: [plus.ruoyi.business.system_____]│
│ 生成模块名: [system_____________________]    │
│ 生成业务名: [user_______________________]    │
│ 生成功能名: [用户_______________________]    │
│                                              │
│ 上级菜单: [系统管理 ▼]                       │
│ 菜单图标: [user]  [选择图标]                 │
│ 菜单排序: [1____]                            │
│                                              │
│ 生成代码方式:                                │
│ ○ zip压缩包                                  │
│ ○ 自定义路径: [D:\project\ruoyi_____]        │
│                                              │
│ 自动导入菜单:                                │
│ □ 生成后自动导入菜单SQL到数据库              │
│                                              │
└──────────────────────────────────────────────┘
```

**字段说明:**

**生成包路径**
- 格式: `com.company.module.submodule`
- 示例: `plus.ruoyi.business.system`
- 说明: 生成的Java代码的包路径

**生成模块名**
- 格式: 小写单词
- 示例: `system`, `business`, `common`
- 说明: 用于区分不同功能模块

**生成业务名**
- 格式: 小驼峰命名
- 示例: `user`, `demoUser`, `orderInfo`
- 说明: 用于生成类名、方法名、URL等

**生成功能名**
- 格式: 中文名称
- 示例: `用户`, `演示用户`, `订单信息`
- 说明: 用于页面标题、注释等

**上级菜单**
- 说明: 生成的菜单将挂载到哪个父菜单下
- 可选: 系统管理、系统监控、系统工具等

**菜单图标**
- 说明: 菜单显示的图标名称
- 格式: Element Plus图标名
- 示例: `user`, `shopping-cart`, `document`

**菜单排序**
- 说明: 菜单显示的排序号
- 格式: 整数,数值越小越靠前
- 示例: `1`, `10`, `100`

**生成代码方式**
- **zip压缩包**: 生成ZIP文件下载(适合本地开发)
- **自定义路径**: 直接生成到指定路径(适合服务器环境)

**自动导入菜单**
- **勾选**: 生成代码后自动执行菜单SQL
- **取消**: 需要手动执行SQL脚本

### 字段配置

#### 字段配置选项卡

```
┌─── 字段信息 ──────────────────────────────────────────────┐
│ [新增字段] [批量设置]                                      │
├───────────────────────────────────────────────────────────┤
│ [ ] │字段列  │字段描述│字段类型 │Java类型│查询│列表│新增│编辑│
│     │        │        │         │        │方式│    │    │    │
├───────────────────────────────────────────────────────────┤
│ [ ] │id      │用户ID  │bigint   │Long    │=   │√   │-   │-   │
│ [ ] │username│用户名  │varchar  │String  │LIKE│√   │√   │√   │
│ [ ] │nickname│昵称    │varchar  │String  │LIKE│√   │√   │√   │
│ [ ] │email   │邮箱    │varchar  │String  │LIKE│√   │√   │√   │
│ [ ] │phone   │手机号  │varchar  │String  │LIKE│√   │√   │√   │
│ [ ] │gender  │性别    │char(1)  │String  │=   │√   │√   │√   │
│ [ ] │status  │状态    │char(1)  │String  │=   │√   │√   │√   │
│ [ ] │remark  │备注    │varchar  │String  │-   │-   │√   │√   │
│ [√] │create  │创建人  │bigint   │Long    │-   │√   │-   │-   │
│     │_by     │        │         │        │    │    │    │    │
│ [√] │create  │创建时间│datetime │Date    │RANGE│√  │-   │-   │
│     │_time   │        │         │        │    │    │    │    │
└───────────────────────────────────────────────────────────┘
```

#### 字段配置详解

点击字段行的 **编辑** 按钮,进入字段详细配置:

```
┌─── 编辑字段 ────────────────────────────────┐
│                                              │
│ 列名: [username___________] (只读)           │
│ 注释: [用户名_____________]                  │
│ 类型: [varchar(50)_______] (只读)           │
│                                              │
│ Java属性:                                    │
│   字段名: [username___________]              │
│   类型: [String ▼]                           │
│   标签: [用户名___________]                  │
│                                              │
│ 查询方式: [LIKE ▼]                           │
│   EQ(=), NE(!=), GT(>), GE(>=), LT(<),     │
│   LE(<=), LIKE, BETWEEN                     │
│                                              │
│ 显示类型: [文本框 ▼]                         │
│   文本框, 文本域, 下拉框, 单选框, 复选框,    │
│   日期控件, 图片上传, 文件上传, 富文本编辑器 │
│                                              │
│ 字典类型: [____________] (可选)              │
│                                              │
│ 权限设置:                                    │
│   □ 插入  □ 编辑  □ 列表  □ 查询             │
│                                              │
│ 验证规则:                                    │
│   □ 必填                                     │
│                                              │
│ [保存] [取消]                                │
└──────────────────────────────────────────────┘
```

**字段属性说明:**

**列名** - 数据库字段名(只读)
**注释** - 字段业务描述(可修改)
**类型** - 数据库字段类型(只读)

**Java属性:**
- **字段名**: Java属性名(驼峰命名)
- **类型**: Java数据类型(String/Long/Integer/Date等)
- **标签**: 前端表单显示的标签文字

**查询方式:**
- **EQ**: 等于查询 `WHERE column = value`
- **NE**: 不等于查询 `WHERE column != value`
- **GT**: 大于查询 `WHERE column > value`
- **GE**: 大于等于 `WHERE column >= value`
- **LT**: 小于查询 `WHERE column < value`
- **LE**: 小于等于 `WHERE column <= value`
- **LIKE**: 模糊查询 `WHERE column LIKE '%value%'`
- **BETWEEN**: 范围查询 `WHERE column BETWEEN value1 AND value2`

**显示类型:**
- **文本框**: 单行文本输入 `<el-input>`
- **文本域**: 多行文本输入 `<el-input type="textarea">`
- **下拉框**: 下拉选择 `<el-select>`
- **单选框**: 单选按钮 `<el-radio-group>`
- **复选框**: 复选按钮 `<el-checkbox-group>`
- **日期控件**: 日期选择 `<el-date-picker>`
- **图片上传**: 图片上传 `<image-upload>`
- **文件上传**: 文件上传 `<file-upload>`
- **富文本编辑器**: 富文本编辑 `<editor>`

**字典类型:**

当字段使用下拉框/单选框/复选框时,需要指定字典类型:

```
常用字典类型:
- sys_user_sex (用户性别)
- sys_normal_disable (状态)
- sys_yes_no (是否)
- sys_notice_type (通知类型)
- sys_notice_status (通知状态)
```

**权限设置:**
- **插入**: 在新增表单中显示
- **编辑**: 在编辑表单中显示
- **列表**: 在数据列表中显示
- **查询**: 作为查询条件显示

**验证规则:**
- **必填**: 字段为必填项,生成验证规则

#### 批量设置字段

选中多个字段,点击 **批量设置** 按钮:

```
┌─── 批量设置字段 ────────────────────────────┐
│                                              │
│ 已选择 3 个字段:                             │
│ - username                                   │
│ - nickname                                   │
│ - email                                      │
│                                              │
│ 查询方式: [LIKE ▼]                           │
│ 显示类型: [文本框 ▼]                         │
│                                              │
│ 权限设置:                                    │
│   □ 插入  □ 编辑  □ 列表  □ 查询             │
│                                              │
│ [应用] [取消]                                │
└──────────────────────────────────────────────┘
```

### 树表配置

#### 选择树表模板

在基本信息中选择 **树表(左树右表)** 模板。

#### 配置树形字段

在生成信息中配置树形结构字段:

```
┌─── 树表配置 ────────────────────────────────┐
│                                              │
│ 树编码字段: [id ▼]                           │
│   - 树节点的唯一标识字段                     │
│                                              │
│ 树父编码字段: [parent_id ▼]                  │
│   - 树节点的父节点标识字段                   │
│                                              │
│ 树名称字段: [dept_name ▼]                    │
│   - 树节点的显示名称字段                     │
│                                              │
└──────────────────────────────────────────────┘
```

#### 树表示例

适用于部门管理:

```sql
CREATE TABLE `sys_dept` (
  `id` bigint NOT NULL COMMENT '部门ID',
  `parent_id` bigint DEFAULT 0 COMMENT '父部门ID',
  `dept_name` varchar(50) NOT NULL COMMENT '部门名称',
  `order_num` int DEFAULT 0 COMMENT '显示顺序',
  `leader` varchar(20) DEFAULT NULL COMMENT '负责人',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `email` varchar(50) DEFAULT NULL COMMENT '邮箱',
  `status` char(1) DEFAULT '1' COMMENT '状态(1正常 0停用)',
  PRIMARY KEY (`id`)
) COMMENT='部门表';
```

配置:
```
生成模板: 树表(左树右表)
树编码字段: id
树父编码字段: parent_id
树名称字段: dept_name
```

### 主子表配置

#### 选择主子表模板

在主表的基本信息中选择 **主子表(一对多)** 模板。

#### 配置子表关联

```
┌─── 主子表配置 ──────────────────────────────┐
│                                              │
│ 子表名称: [demo_order_item ▼]                │
│   - 选择关联的子表                           │
│                                              │
│ 子表外键: [order_id ▼]                       │
│   - 子表中关联主表的外键字段                 │
│                                              │
└──────────────────────────────────────────────┘
```

#### 主子表示例

订单和订单明细:

```sql
-- 主表: 订单
CREATE TABLE `demo_order` (
  `id` bigint NOT NULL COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `total_amount` decimal(10,2) DEFAULT 0.00 COMMENT '订单总额',
  `status` char(1) DEFAULT '0' COMMENT '订单状态',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) COMMENT='演示订单表';

-- 子表: 订单明细
CREATE TABLE `demo_order_item` (
  `id` bigint NOT NULL COMMENT '明细ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) NOT NULL COMMENT '商品名称',
  `quantity` int DEFAULT 1 COMMENT '数量',
  `price` decimal(10,2) DEFAULT 0.00 COMMENT '单价',
  `amount` decimal(10,2) DEFAULT 0.00 COMMENT '小计',
  PRIMARY KEY (`id`)
) COMMENT='演示订单明细表';
```

配置:
```
主表配置:
  表名: demo_order
  生成模板: 主子表(一对多)
  子表名称: demo_order_item
  子表外键: order_id

子表配置:
  表名: demo_order_item
  (系统自动识别为子表,无需特殊配置)
```

## 代码生成操作

### 预览代码

#### 预览单个表

```
操作步骤:
1. 在表列表中选择要预览的表
2. 点击 [预览] 按钮
3. 在弹出的对话框中查看代码
```

#### 预览界面

```
┌─── 代码预览 ───────────────────────────────────────┐
│                                                     │
│ 文件列表 ▼                                          │
│ ├─ Java代码                                         │
│ │  ├─ DemoUser.java (实体类)                        │
│ │  ├─ DemoUserVo.java (视图对象)                    │
│ │  ├─ DemoUserBo.java (业务对象)                    │
│ │  ├─ DemoUserController.java (控制器)              │
│ │  ├─ DemoUserService.java (服务接口)               │
│ │  ├─ DemoUserServiceImpl.java (服务实现)           │
│ │  ├─ DemoUserMapper.java (数据访问接口)            │
│ │  └─ DemoUserMapper.xml (MyBatis映射)             │
│ ├─ 前端代码                                         │
│ │  ├─ demoUserApi.ts (API接口)                      │
│ │  ├─ demoUserTypes.ts (类型定义)                   │
│ │  └─ demoUser.vue (页面组件)                       │
│ └─ SQL脚本                                          │
│    └─ demoUserMenu.sql (菜单脚本)                   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ package plus.ruoyi.business.demo.domain;    │   │
│ │                                             │   │
│ │ import lombok.Data;                         │   │
│ │ import plus.ruoyi.common.mybatis.core...    │   │
│ │                                             │   │
│ │ /**                                         │   │
│ │  * 演示用户对象 demo_user                   │   │
│ │  *                                          │   │
│ │  * @author 抓蛙师                           │   │
│ │  * @date 2024-01-01                         │   │
│ │  */                                         │   │
│ │ @Data                                       │   │
│ │ @TableName("demo_user")                     │   │
│ │ public class DemoUser extends BaseEntity {  │   │
│ │     // ...                                  │   │
│ │ }                                           │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [复制代码] [下载] [关闭]                            │
└─────────────────────────────────────────────────────┘
```

#### 预览功能

- **文件树**: 左侧显示所有生成的文件
- **代码预览**: 右侧显示选中文件的代码内容
- **复制代码**: 复制当前文件的代码到剪贴板
- **下载**: 下载所有代码为ZIP文件

### 生成代码(ZIP方式)

#### 生成操作

```
操作步骤:
1. 选择要生成的表(可多选)
2. 点击 [生成代码] 按钮
3. 浏览器自动下载 ruoyi.zip 文件
4. 解压ZIP文件查看生成的代码
```

#### ZIP文件结构

```
ruoyi.zip
├── main/
│   ├── java/
│   │   └── plus/ruoyi/business/demo/
│   │       ├── controller/
│   │       │   └── DemoUserController.java
│   │       ├── domain/
│   │       │   ├── entity/
│   │       │   │   └── DemoUser.java
│   │       │   ├── vo/
│   │       │   │   └── DemoUserVo.java
│   │       │   └── bo/
│   │       │       └── DemoUserBo.java
│   │       ├── mapper/
│   │       │   └── DemoUserMapper.java
│   │       └── service/
│   │           ├── IDemoUserService.java
│   │           └── impl/
│   │               └── DemoUserServiceImpl.java
│   └── resources/
│       └── mapper/
│           └── demo/
│               └── DemoUserMapper.xml
├── vue/
│   ├── api/
│   │   └── business/
│   │       └── demo/
│   │           └── demoUser/
│   │               ├── demoUserApi.ts
│   │               └── demoUserTypes.ts
│   └── views/
│       └── business/
│           └── demo/
│               └── demoUser/
│                   └── demoUser.vue
└── demoUserMenu.sql
```

#### 代码集成

**第一步: 复制后端代码**

```bash
# Windows
xcopy /s /y ruoyi\main\java\* D:\your-project\src\main\java\
xcopy /s /y ruoyi\main\resources\* D:\your-project\src\main\resources\

# Linux/Mac
cp -r ruoyi/main/java/* /your-project/src/main/java/
cp -r ruoyi/main/resources/* /your-project/src/main/resources/
```

**第二步: 复制前端代码**

```bash
# Windows
xcopy /s /y ruoyi\vue\api\* D:\your-frontend\src\api\
xcopy /s /y ruoyi\vue\views\* D:\your-frontend\src\views\

# Linux/Mac
cp -r ruoyi/vue/api/* /your-frontend/src/api/
cp -r ruoyi/vue/views/* /your-frontend/src/views/
```

**第三步: 执行SQL脚本**

```sql
-- 在数据库中执行菜单SQL
SOURCE demoUserMenu.sql;

-- 或者直接复制SQL内容执行
```

**第四步: 配置前端路由**

```typescript
// src/router/modules/demo.ts
import { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const demoRoutes: RouteRecordRaw = {
  path: '/demo',
  component: Layout,
  redirect: '/demo/demoUser',
  name: 'Demo',
  meta: {
    title: '演示模块',
    icon: 'example'
  },
  children: [
    {
      path: 'demoUser',
      name: 'DemoUser',
      component: () => import('@/views/business/demo/demoUser/demoUser.vue'),
      meta: {
        title: '演示用户',
        icon: 'user',
        noCache: true
      }
    }
  ]
}

export default demoRoutes
```

**第五步: 注册路由**

```typescript
// src/router/index.ts
import demoRoutes from './modules/demo'

const routes: RouteRecordRaw[] = [
  // ...其他路由
  demoRoutes
]
```

**第六步: 重启项目**

```bash
# 后端
mvn clean compile
mvn spring-boot:run

# 前端
npm run dev
```

### 生成代码(自定义路径)

#### 配置生成路径

在表配置的生成信息中:

```
生成代码方式:
○ zip压缩包
● 自定义路径: [D:\ruoyi-plus-uniapp-workflow\____]

自动导入菜单:
☑ 生成后自动导入菜单SQL到数据库
```

#### 路径说明

**后端代码路径:**
```
项目根目录: D:\ruoyi-plus-uniapp-workflow

后端代码将生成到:
D:\ruoyi-plus-uniapp-workflow\ruoyi-modules\ruoyi-business\src\main\java\...
D:\ruoyi-plus-uniapp-workflow\ruoyi-modules\ruoyi-business\src\main\resources\...
```

**前端代码路径:**
```
前端代码将生成到:
D:\ruoyi-plus-uniapp-workflow\plus-ui\src\api\...
D:\ruoyi-plus-uniapp-workflow\plus-ui\src\views\...
```

**SQL脚本路径:**
```
SQL脚本将生成到:
D:\ruoyi-plus-uniapp-workflow\script\sql\menu\...
```

#### 生成操作

```
操作步骤:
1. 配置自定义生成路径
2. 勾选"自动导入菜单"(可选)
3. 点击 [生成代码(自定义路径)] 按钮
4. 系统自动生成代码到指定路径
5. 如果勾选了自动导入菜单,系统自动执行SQL
```

#### 生成结果

```
┌─── 代码生成结果 ────────────────────────────┐
│                                              │
│ ✅ 代码生成成功!                             │
│                                              │
│ 生成统计:                                    │
│ - 生成文件数: 12 个                          │
│ - 覆盖文件数: 0 个                           │
│ - 菜单导入: 成功                             │
│                                              │
│ 生成文件列表:                                │
│ ├─ DemoUser.java                             │
│ ├─ DemoUserVo.java                           │
│ ├─ DemoUserBo.java                           │
│ ├─ DemoUserController.java                   │
│ ├─ DemoUserService.java                      │
│ ├─ DemoUserServiceImpl.java                  │
│ ├─ DemoUserMapper.java                       │
│ ├─ DemoUserMapper.xml                        │
│ ├─ demoUserApi.ts                            │
│ ├─ demoUserTypes.ts                          │
│ ├─ demoUser.vue                              │
│ └─ demoUserMenu.sql (已自动导入)             │
│                                              │
│ [确定]                                       │
└──────────────────────────────────────────────┘
```

#### 文件覆盖提示

如果目标路径已存在同名文件,系统会提示:

```
⚠️ 警告: 以下文件将被覆盖

├─ DemoUserController.java (已存在)
├─ DemoUserService.java (已存在)
└─ demoUser.vue (已存在)

请确认是否继续:
[取消] [覆盖] [跳过已存在的文件]
```

### 批量生成代码

#### 选择多个表

在表列表中勾选多个表:

```
[√] demo_user       演示用户表
[√] demo_product    演示商品表
[√] demo_order      演示订单表
[√] demo_category   演示分类表
```

#### 批量生成操作

```
操作步骤:
1. 勾选多个表(按住Ctrl或Shift可多选)
2. 点击 [批量生成代码] 按钮
3. 系统生成包含所有表代码的ZIP文件
4. 下载并解压ZIP文件
```

#### 批量生成的ZIP结构

```
ruoyi.zip
├── demo_user/
│   ├── java/...
│   ├── resources/...
│   ├── vue/...
│   └── demoUserMenu.sql
├── demo_product/
│   ├── java/...
│   ├── resources/...
│   ├── vue/...
│   └── demoProductMenu.sql
├── demo_order/
│   ├── java/...
│   ├── resources/...
│   ├── vue/...
│   └── demoOrderMenu.sql
└── demo_category/
    ├── java/...
    ├── resources/...
    ├── vue/...
    └── demoCategoryMenu.sql
```

## 同步数据库

### 同步功能说明

当数据库表结构发生变化时,使用同步功能更新生成配置。

### 同步场景

**场景1: 新增字段**

```sql
-- 为demo_user表新增字段
ALTER TABLE `demo_user`
ADD COLUMN `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
ADD COLUMN `birthday` date DEFAULT NULL COMMENT '生日';
```

**场景2: 修改字段**

```sql
-- 修改字段类型
ALTER TABLE `demo_user`
MODIFY COLUMN `remark` varchar(1000) DEFAULT NULL COMMENT '备注';

-- 修改字段注释
ALTER TABLE `demo_user`
MODIFY COLUMN `nickname` varchar(100) COMMENT '用户昵称';
```

**场景3: 删除字段**

```sql
-- 删除字段
ALTER TABLE `demo_user`
DROP COLUMN `old_field`;
```

**场景4: 修改表注释**

```sql
-- 修改表注释
ALTER TABLE `demo_user` COMMENT='演示用户信息管理表';
```

### 同步操作

```
操作步骤:
1. 修改数据库表结构
2. 在代码生成器中找到对应的表
3. 点击 [同步] 按钮
4. 系统自动同步表结构
5. 点击 [编辑] 查看同步结果
```

### 同步结果

```
同步完成后的变化:

新增字段:
  - avatar (头像URL)
    - Java类型: String
    - 显示类型: 图片上传
    - 权限: 列表√ 新增√ 编辑√

  - birthday (生日)
    - Java类型: Date
    - 显示类型: 日期控件
    - 权限: 列表√ 新增√ 编辑√ 查询√(BETWEEN)

修改字段:
  - remark
    - 类型变更: varchar(500) → varchar(1000)

  - nickname
    - 注释变更: 昵称 → 用户昵称

删除字段:
  - old_field (已从配置中移除)

表注释:
  - 变更: 演示用户表 → 演示用户信息管理表
```

### 同步保留的配置

以下用户自定义配置在同步时会保留:

```
保留配置:
- 生成包路径
- 生成模块名
- 生成业务名
- 生成功能名
- 作者信息
- 上级菜单
- 已配置的字段显示类型
- 已配置的字典类型
- 已配置的查询方式
- 已配置的权限设置
```

### 同步注意事项

#### 1. 备份代码

同步前备份已生成的代码:

```bash
# 创建备份
cp -r src/main/java/plus/ruoyi/business/demo src/main/java/plus/ruoyi/business/demo_backup
cp -r src/main/resources/mapper/demo src/main/resources/mapper/demo_backup
cp -r src/views/business/demo src/views/business/demo_backup
```

#### 2. 检查自定义修改

同步后重新生成代码会覆盖原有文件,自定义修改可能丢失:

```java
// 如果在生成的代码中添加了自定义方法
@RestController
public class DemoUserController {

    // 生成的方法
    @GetMapping("/list")
    public R<List<DemoUser>> list() { ... }

    // ⚠️ 自定义添加的方法,重新生成后会丢失
    @GetMapping("/statistics")
    public R<Map<String, Object>> statistics() { ... }
}
```

**建议**: 自定义方法应写在单独的类中,避免修改生成的代码。

#### 3. 新字段配置

同步后新增的字段会使用默认配置,需要手动调整:

```
新增字段默认配置:
- 查询方式: EQ(=)
- 显示类型: 文本框
- 权限: 全部勾选

可能需要调整:
- 日期字段 → 查询方式改为BETWEEN
- 状态字段 → 显示类型改为单选框,配置字典
- 长文本字段 → 显示类型改为文本域
```

## 删除表配置

### 删除单个表

```
操作步骤:
1. 在表列表中选择要删除的表
2. 点击 [删除] 按钮
3. 确认删除操作
```

### 批量删除表

```
操作步骤:
1. 勾选多个要删除的表
2. 点击 [批量删除] 按钮
3. 确认删除操作
```

### 删除确认

```
┌─── 删除确认 ────────────────────────────────┐
│                                              │
│ ⚠️ 警告                                      │
│                                              │
│ 确定要删除以下表的生成配置吗?                │
│                                              │
│ - demo_user (演示用户表)                     │
│ - demo_product (演示商品表)                  │
│                                              │
│ 删除后:                                      │
│ • 生成配置将被永久删除                       │
│ • 已生成的代码不会被删除                     │
│ • 可以重新导入表                             │
│                                              │
│ [取消] [确定删除]                            │
└──────────────────────────────────────────────┘
```

### 删除说明

- **删除配置**: 只删除代码生成器中的表配置
- **保留代码**: 已经生成的代码文件不会被删除
- **可重新导入**: 删除后可以重新从数据库导入该表
- **无法恢复**: 删除的配置无法恢复,需要重新配置

## 生成代码详解

### Java后端代码

#### 1. 实体类 (Domain Entity)

**文件路径:**
```
src/main/java/plus/ruoyi/business/demo/domain/entity/DemoUser.java
```

**代码示例:**
```java
package plus.ruoyi.business.demo.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import plus.ruoyi.common.mybatis.core.domain.BaseEntity;

import java.io.Serial;

/**
 * 演示用户对象 demo_user
 *
 * @author 抓蛙师
 * @date 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("demo_user")
public class DemoUser extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户ID
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 性别(0男 1女 2未知)
     */
    private String gender;

    /**
     * 状态(0停用 1正常)
     */
    private String status;

    /**
     * 备注
     */
    private String remark;
}
```

**特点:**
- 继承 `BaseEntity` 基类(包含创建时间、更新时间等公共字段)
- 使用 Lombok 注解简化代码
- 使用 MyBatis-Plus 注解标注表名和主键
- 所有字段添加详细注释

#### 2. 视图对象 (VO)

**文件路径:**
```
src/main/java/plus/ruoyi/business/demo/domain/vo/DemoUserVo.java
```

**代码示例:**
```java
package plus.ruoyi.business.demo.domain.vo;

import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import plus.ruoyi.common.excel.annotation.ExcelDictFormat;
import plus.ruoyi.common.excel.convert.ExcelDictConvert;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 演示用户视图对象 demo_user
 *
 * @author 抓蛙师
 * @date 2024-01-01
 */
@Data
@ExcelIgnoreUnannotated
public class DemoUserVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户ID
     */
    @ExcelProperty(value = "用户ID")
    private Long id;

    /**
     * 用户名
     */
    @ExcelProperty(value = "用户名")
    private String username;

    /**
     * 昵称
     */
    @ExcelProperty(value = "昵称")
    private String nickname;

    /**
     * 邮箱
     */
    @ExcelProperty(value = "邮箱")
    private String email;

    /**
     * 手机号
     */
    @ExcelProperty(value = "手机号")
    private String phone;

    /**
     * 性别
     */
    @ExcelProperty(value = "性别", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "sys_user_sex")
    private String gender;

    /**
     * 状态
     */
    @ExcelProperty(value = "状态", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "sys_normal_disable")
    private String status;

    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private Date createTime;
}
```

**特点:**
- 用于数据展示和Excel导出
- 包含Excel导出注解配置
- 支持字典数据转换
- 只包含需要展示的字段

#### 3. 业务对象 (BO)

**文件路径:**
```
src/main/java/plus/ruoyi/business/demo/domain/bo/DemoUserBo.java
```

**代码示例:**
```java
package plus.ruoyi.business.demo.domain.bo;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import plus.ruoyi.common.mybatis.core.domain.BaseEntity;

/**
 * 演示用户业务对象 demo_user
 *
 * @author 抓蛙师
 * @date 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DemoUserBo extends BaseEntity {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    @NotBlank(message = "用户名不能为空")
    private String username;

    /**
     * 昵称
     */
    @NotBlank(message = "昵称不能为空")
    private String nickname;

    /**
     * 邮箱
     */
    @Email(message = "邮箱格式不正确")
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 性别
     */
    private String gender;

    /**
     * 状态
     */
    private String status;

    /**
     * 备注
     */
    private String remark;
}
```

**特点:**
- 用于接收前端参数
- 包含数据校验注解
- 用于新增和修改操作
- 可扩展自定义校验规则

#### 4. 控制器 (Controller)

**文件路径:**
```
src/main/java/plus/ruoyi/business/demo/controller/DemoUserController.java
```

**代码示例:**
```java
package plus.ruoyi.business.demo.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import plus.ruoyi.common.core.constant.I18nKeys;
import plus.ruoyi.common.core.domain.R;
import plus.ruoyi.common.mybatis.core.page.PageQuery;
import plus.ruoyi.common.mybatis.core.page.PageResult;
import plus.ruoyi.common.log.annotation.Log;
import plus.ruoyi.common.core.dict.DictOperType;
import plus.ruoyi.business.demo.domain.vo.DemoUserVo;
import plus.ruoyi.business.demo.domain.bo.DemoUserBo;
import plus.ruoyi.business.demo.service.IDemoUserService;

import java.util.List;

/**
 * 演示用户控制器
 *
 * @author 抓蛙师
 * @date 2024-01-01
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/demo/demoUser")
public class DemoUserController {

    private final IDemoUserService demoUserService;

    /**
     * 查询演示用户列表
     */
    @SaCheckPermission("demo:demoUser:query")
    @GetMapping("/pageDemoUsers")
    public R<PageResult<DemoUserVo>> pageDemoUsers(DemoUserBo bo, PageQuery pageQuery) {
        return R.ok(demoUserService.pageDemoUsers(bo, pageQuery));
    }

    /**
     * 获取演示用户详细信息
     *
     * @param id 主键
     */
    @SaCheckPermission("demo:demoUser:query")
    @GetMapping("/getDemoUser/{id}")
    public R<DemoUserVo> getDemoUser(@NotNull(message = I18nKeys.Common.ID_REQUIRED) @PathVariable Long id) {
        return R.ok(demoUserService.getById(id));
    }

    /**
     * 新增演示用户
     */
    @SaCheckPermission("demo:demoUser:add")
    @Log(title = "演示用户", operType = DictOperType.INSERT)
    @PostMapping("/addDemoUser")
    public R<Void> addDemoUser(@Validated @RequestBody DemoUserBo bo) {
        return R.bool(demoUserService.save(bo));
    }

    /**
     * 修改演示用户
     */
    @SaCheckPermission("demo:demoUser:update")
    @Log(title = "演示用户", operType = DictOperType.UPDATE)
    @PutMapping("/updateDemoUser")
    public R<Void> updateDemoUser(@Validated @RequestBody DemoUserBo bo) {
        return R.bool(demoUserService.updateById(bo));
    }

    /**
     * 删除演示用户
     *
     * @param ids 主键串
     */
    @SaCheckPermission("demo:demoUser:delete")
    @Log(title = "演示用户", operType = DictOperType.DELETE)
    @DeleteMapping("/deleteDemoUsers/{ids}")
    public R<Void> deleteDemoUsers(@NotEmpty(message = I18nKeys.Common.ID_REQUIRED) @PathVariable Long[] ids) {
        return R.bool(demoUserService.removeByIds(List.of(ids)));
    }
}
```

**特点:**
- RESTful API设计
- 权限控制注解
- 操作日志记录
- 参数校验
- 统一返回结果

#### 5. 服务接口 (Service)

**文件路径:**
```
src/main/java/plus/ruoyi/business/demo/service/IDemoUserService.java
```

**代码示例:**
```java
package plus.ruoyi.business.demo.service;

import plus.ruoyi.common.mybatis.core.page.PageQuery;
import plus.ruoyi.common.mybatis.core.page.PageResult;
import plus.ruoyi.common.mybatis.core.service.IBaseService;
import plus.ruoyi.business.demo.domain.entity.DemoUser;
import plus.ruoyi.business.demo.domain.vo.DemoUserVo;
import plus.ruoyi.business.demo.domain.bo.DemoUserBo;

/**
 * 演示用户Service接口
 *
 * @author 抓蛙师
 * @date 2024-01-01
 */
public interface IDemoUserService extends IBaseService<DemoUser, DemoUserBo, DemoUserVo> {

    /**
     * 查询演示用户分页列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 分页结果
     */
    PageResult<DemoUserVo> pageDemoUsers(DemoUserBo bo, PageQuery pageQuery);
}
```

**特点:**
- 继承基础服务接口
- 定义业务方法
- 泛型指定实体、BO、VO类型

#### 6. 服务实现 (ServiceImpl)

**文件路径:**
```
src/main/java/plus/ruoyi/business/demo/service/impl/DemoUserServiceImpl.java
```

**代码示例:**
```java
package plus.ruoyi.business.demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import plus.ruoyi.common.mybatis.core.page.PageQuery;
import plus.ruoyi.common.mybatis.core.page.PageResult;
import plus.ruoyi.common.mybatis.core.service.impl.BaseServiceImpl;
import plus.ruoyi.common.mybatis.core.query.PlusLambdaQuery;
import plus.ruoyi.business.demo.domain.entity.DemoUser;
import plus.ruoyi.business.demo.domain.vo.DemoUserVo;
import plus.ruoyi.business.demo.domain.bo.DemoUserBo;
import plus.ruoyi.business.demo.mapper.DemoUserMapper;
import plus.ruoyi.business.demo.service.IDemoUserService;

/**
 * 演示用户Service业务层处理
 *
 * @author 抓蛙师
 * @date 2024-01-01
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class DemoUserServiceImpl extends BaseServiceImpl<DemoUserMapper, DemoUser, DemoUserBo, DemoUserVo>
    implements IDemoUserService {

    /**
     * 查询演示用户分页列表
     */
    @Override
    public PageResult<DemoUserVo> pageDemoUsers(DemoUserBo bo, PageQuery pageQuery) {
        PlusLambdaQuery<DemoUser> query = boToQuery(bo);
        return page(query, pageQuery);
    }

    /**
     * 构建查询条件
     */
    @Override
    protected PlusLambdaQuery<DemoUser> boToQuery(DemoUserBo bo) {
        PlusLambdaQuery<DemoUser> lqw = of();
        lqw.like(bo.getUsername() != null, DemoUser::getUsername, bo.getUsername());
        lqw.like(bo.getNickname() != null, DemoUser::getNickname, bo.getNickname());
        lqw.like(bo.getEmail() != null, DemoUser::getEmail, bo.getEmail());
        lqw.like(bo.getPhone() != null, DemoUser::getPhone, bo.getPhone());
        lqw.eq(bo.getGender() != null, DemoUser::getGender, bo.getGender());
        lqw.eq(bo.getStatus() != null, DemoUser::getStatus, bo.getStatus());
        return lqw;
    }
}
```

**特点:**
- 继承基础服务实现类
- 实现业务逻辑
- 构建查询条件
- Lambda表达式查询

#### 7. 数据访问接口 (Mapper)

**文件路径:**
```
src/main/java/plus/ruoyi/business/demo/mapper/DemoUserMapper.java
```

**代码示例:**
```java
package plus.ruoyi.business.demo.mapper;

import plus.ruoyi.common.mybatis.core.mapper.BaseMapperPlus;
import plus.ruoyi.business.demo.domain.entity.DemoUser;
import plus.ruoyi.business.demo.domain.vo.DemoUserVo;

/**
 * 演示用户Mapper接口
 *
 * @author 抓蛙师
 * @date 2024-01-01
 */
public interface DemoUserMapper extends BaseMapperPlus<DemoUser, DemoUserVo> {

}
```

**特点:**
- 继承基础Mapper接口
- 自动继承CRUD方法
- 可扩展自定义SQL方法

#### 8. MyBatis映射文件 (Mapper.xml)

**文件路径:**
```
src/main/resources/mapper/demo/DemoUserMapper.xml
```

**代码示例:**
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="plus.ruoyi.business.demo.mapper.DemoUserMapper">

    <resultMap type="plus.ruoyi.business.demo.domain.entity.DemoUser" id="DemoUserResult">
        <result property="id"         column="id"          />
        <result property="username"   column="username"    />
        <result property="nickname"   column="nickname"    />
        <result property="email"      column="email"       />
        <result property="phone"      column="phone"       />
        <result property="gender"     column="gender"      />
        <result property="status"     column="status"      />
        <result property="remark"     column="remark"      />
        <result property="createBy"   column="create_by"   />
        <result property="createTime" column="create_time" />
        <result property="updateBy"   column="update_by"   />
        <result property="updateTime" column="update_time" />
    </resultMap>

</mapper>
```

**特点:**
- 定义结果映射
- 可扩展自定义SQL
- 支持复杂查询

### 前端代码

#### 1. API接口 (API)

**文件路径:**
```
src/api/business/demo/demoUser/demoUserApi.ts
```

**代码示例:**
```typescript
import { request } from '@/utils/request'
import type { DemoUserQuery, DemoUserForm, DemoUserVO } from './demoUserTypes'
import type { PageResult, ApiResponse } from '@/api/types'

/**
 * 查询演示用户分页列表
 */
export function pageDemoUsers(query: DemoUserQuery) {
  return request<PageResult<DemoUserVO>>({
    url: '/demo/demoUser/pageDemoUsers',
    method: 'get',
    params: query
  })
}

/**
 * 查询演示用户详细
 */
export function getDemoUser(id: number | string) {
  return request<DemoUserVO>({
    url: '/demo/demoUser/getDemoUser/' + id,
    method: 'get'
  })
}

/**
 * 新增演示用户
 */
export function addDemoUser(data: DemoUserForm) {
  return request<ApiResponse<void>>({
    url: '/demo/demoUser/addDemoUser',
    method: 'post',
    data: data
  })
}

/**
 * 修改演示用户
 */
export function updateDemoUser(data: DemoUserForm) {
  return request<ApiResponse<void>>({
    url: '/demo/demoUser/updateDemoUser',
    method: 'put',
    data: data
  })
}

/**
 * 删除演示用户
 */
export function deleteDemoUsers(ids: number[] | string[]) {
  return request<ApiResponse<void>>({
    url: '/demo/demoUser/deleteDemoUsers/' + ids,
    method: 'delete'
  })
}
```

**特点:**
- TypeScript类型定义
- RESTful API调用
- 统一请求封装

#### 2. 类型定义 (Types)

**文件路径:**
```
src/api/business/demo/demoUser/demoUserTypes.ts
```

**代码示例:**
```typescript
/**
 * 演示用户查询对象
 */
export interface DemoUserQuery extends PageQuery {
  /** 用户名 */
  username?: string
  /** 昵称 */
  nickname?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 性别 */
  gender?: string
  /** 状态 */
  status?: string
  /** 创建时间 */
  params?: {
    beginCreateTime?: string
    endCreateTime?: string
  }
}

/**
 * 演示用户视图对象
 */
export interface DemoUserVO {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone: string
  /** 性别 */
  gender: string
  /** 状态 */
  status: string
  /** 备注 */
  remark: string
  /** 创建时间 */
  createTime: string
}

/**
 * 演示用户表单对象
 */
export interface DemoUserForm {
  /** 用户ID */
  id?: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 性别 */
  gender?: string
  /** 状态 */
  status?: string
  /** 备注 */
  remark?: string
}
```

**特点:**
- 完整的TypeScript类型定义
- 区分查询、展示、表单对象
- 类型安全

#### 3. 页面组件 (Vue)

**文件路径:**
```
src/views/business/demo/demoUser/demoUser.vue
```

**代码示例(简化版):**
```vue
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['demo:demoUser:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['demo:demoUser:delete']"
        >删除</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="demoUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户ID" align="center" prop="id" />
      <el-table-column label="用户名" align="center" prop="username" />
      <el-table-column label="昵称" align="center" prop="nickname" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['demo:demoUser:update']"
          >修改</el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['demo:demoUser:delete']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="demoUserFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option
              v-for="dict in sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :value="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="DemoUser">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DemoUserQuery, DemoUserForm, DemoUserVO } from '@/api/business/demo/demoUser/demoUserTypes'
import { pageDemoUsers, getDemoUser, addDemoUser, updateDemoUser, deleteDemoUsers } from '@/api/business/demo/demoUser/demoUserApi'
import { useDictStore } from '@/store/modules/dict'

// 字典数据
const { sys_normal_disable, sys_user_sex } = useDictStore().getDict(
  'sys_normal_disable',
  'sys_user_sex'
)

// 查询参数
const queryParams = ref<DemoUserQuery>({
  pageNum: 1,
  pageSize: 10,
  username: undefined,
  status: undefined
})

// 表格数据
const demoUserList = ref<DemoUserVO[]>([])
const loading = ref(true)
const total = ref(0)

// 表单数据
const form = ref<DemoUserForm>({
  username: '',
  nickname: ''
})

// 对话框
const open = ref(false)
const title = ref('')

// 查询列表
function getList() {
  loading.value = true
  pageDemoUsers(queryParams.value).then(response => {
    demoUserList.value = response.records
    total.value = response.total
    loading.value = false
  })
}

// 搜索按钮操作
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置按钮操作
function resetQuery() {
  queryFormRef.value.resetFields()
  handleQuery()
}

// 新增按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加演示用户'
}

// 修改按钮操作
function handleUpdate(row: DemoUserVO) {
  reset()
  const id = row.id
  getDemoUser(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改演示用户'
  })
}

// 提交按钮
function submitForm() {
  demoUserFormRef.value.validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateDemoUser(form.value).then(response => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addDemoUser(form.value).then(response => {
          ElMessage.success('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

// 删除按钮操作
function handleDelete(row: DemoUserVO) {
  const ids = row.id ? [row.id] : selections.value.map(item => item.id)
  ElMessageBox.confirm('是否确认删除演示用户编号为"' + ids + '"的数据项？').then(() => {
    return deleteDemoUsers(ids)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  })
}

// 初始化
getList()
</script>
```

**特点:**
- Vue 3 Composition API
- TypeScript支持
- Element Plus组件库
- 完整的CRUD功能
- 权限控制
- 字典数据支持

### SQL脚本

**文件路径:**
```
demoUserMenu.sql
```

**代码示例:**
```sql
-- 菜单 SQL
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES (2001, '演示用户', 2000, 1, 'demoUser', 'business/demo/demoUser/index', 0, 0, 'C', '1', '1', 'demo:demoUser:view', 'user', 1, NOW(), NULL, NULL, '演示用户菜单');

-- 按钮父菜单ID
SET @parentId = 2001;

-- 按钮 SQL
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES
(2002, '演示用户查询', @parentId, 1, '#', '', 0, 0, 'F', '1', '1', 'demo:demoUser:query', '#', 1, NOW(), NULL, NULL, ''),
(2003, '演示用户新增', @parentId, 2, '#', '', 0, 0, 'F', '1', '1', 'demo:demoUser:add', '#', 1, NOW(), NULL, NULL, ''),
(2004, '演示用户修改', @parentId, 3, '#', '', 0, 0, 'F', '1', '1', 'demo:demoUser:update', '#', 1, NOW(), NULL, NULL, ''),
(2005, '演示用户删除', @parentId, 4, '#', '', 0, 0, 'F', '1', '1', 'demo:demoUser:delete', '#', 1, NOW(), NULL, NULL, ''),
(2006, '演示用户导出', @parentId, 5, '#', '', 0, 0, 'F', '1', '1', 'demo:demoUser:export', '#', 1, NOW(), NULL, NULL, '');
```

**特点:**
- 自动生成菜单和按钮
- 包含权限标识符
- 支持菜单层级
- 可直接执行

## 常见使用场景

### 场景1: 生成用户管理模块

#### 需求描述

为系统生成用户管理模块,包含用户列表、新增用户、编辑用户、删除用户、用户状态管理等功能。

#### 数据库表设计

```sql
CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `gender` char(1) DEFAULT '0' COMMENT '性别(0男 1女 2未知)',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `status` char(1) DEFAULT '1' COMMENT '状态(0停用 1正常)',
  `dept_id` bigint DEFAULT NULL COMMENT '部门ID',
  `login_ip` varchar(128) DEFAULT NULL COMMENT '最后登录IP',
  `login_date` datetime DEFAULT NULL COMMENT '最后登录时间',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB COMMENT='用户信息表';
```

#### 生成配置

**基本信息:**
```
表名称: sys_user
表描述: 用户信息表
实体类名称: SysUser
作者: 抓蛙师
生成模板: 单表(增删改查)
```

**生成信息:**
```
生成包路径: plus.ruoyi.business.system
生成模块名: system
生成业务名: user
生成功能名: 用户管理
上级菜单: 系统管理
菜单图标: user
菜单排序: 1
```

**字段配置重点:**

```
password (密码):
- 显示类型: 密码框
- 权限: 新增√ 编辑× 列表× 查询×
- 必填: √

gender (性别):
- 显示类型: 单选框
- 字典类型: sys_user_sex
- 权限: 新增√ 编辑√ 列表√ 查询√

status (状态):
- 显示类型: 单选框
- 字典类型: sys_normal_disable
- 权限: 新增√ 编辑√ 列表√ 查询√

avatar (头像):
- 显示类型: 图片上传
- 权限: 新增√ 编辑√ 列表× 查询×

dept_id (部门ID):
- 显示类型: 下拉框
- 字典类型: (需要自定义部门选择组件)
- 权限: 新增√ 编辑√ 列表√ 查询√
```

#### 生成后调整

**后端调整:**

```java
// 1. 密码加密处理
@Service
public class SysUserServiceImpl extends BaseServiceImpl<SysUserMapper, SysUser, SysUserBo, SysUserVo> {

    @Override
    protected void beforeSave(SysUser entity) {
        // 密码加密
        if (StringUtils.isNotBlank(entity.getPassword())) {
            entity.setPassword(BCrypt.hashpw(entity.getPassword()));
        }
    }
}

// 2. 查询时排除密码字段
@Override
public SysUserVo getById(Long id) {
    SysUserVo vo = super.getById(id);
    // 清除敏感信息
    vo.setPassword(null);
    return vo;
}
```

**前端调整:**

```vue
<!-- 1. 部门选择改为树形选择器 -->
<el-form-item label="所属部门" prop="deptId">
  <el-tree-select
    v-model="form.deptId"
    :data="deptOptions"
    placeholder="请选择所属部门"
  />
</el-form-item>

<!-- 2. 头像上传组件 -->
<el-form-item label="用户头像" prop="avatar">
  <image-upload v-model="form.avatar" />
</el-form-item>

<!-- 3. 密码编辑时可选修改 -->
<el-form-item label="用户密码" prop="password" v-if="!form.id">
  <el-input v-model="form.password" type="password" placeholder="请输入密码" />
</el-form-item>
<el-form-item label="重置密码" v-else>
  <el-button @click="handleResetPassword">重置密码</el-button>
</el-form-item>
```

### 场景2: 生成树形部门管理

#### 需求描述

生成树形结构的部门管理模块,支持部门层级展示和管理。

#### 数据库表设计

```sql
CREATE TABLE `sys_dept` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `parent_id` bigint DEFAULT 0 COMMENT '父部门ID',
  `ancestors` varchar(500) DEFAULT '' COMMENT '祖级列表',
  `dept_name` varchar(50) NOT NULL COMMENT '部门名称',
  `order_num` int DEFAULT 0 COMMENT '显示顺序',
  `leader` varchar(20) DEFAULT NULL COMMENT '负责人',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `email` varchar(50) DEFAULT NULL COMMENT '邮箱',
  `status` char(1) DEFAULT '1' COMMENT '部门状态(0停用 1正常)',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='部门表';
```

#### 生成配置

**基本信息:**
```
表名称: sys_dept
表描述: 部门表
实体类名称: SysDept
作者: 抓蛙师
生成模板: 树表(左树右表) ← 重点
```

**树表配置:**
```
树编码字段: id
树父编码字段: parent_id
树名称字段: dept_name
```

**生成信息:**
```
生成包路径: plus.ruoyi.business.system
生成模块名: system
生成业务名: dept
生成功能名: 部门管理
```

#### 生成效果

**前端页面布局:**
```
┌───────────────────────────────────────────────────┐
│ 部门管理                                          │
├──────────────┬────────────────────────────────────┤
│ 部门树       │ 部门列表                           │
│              │                                     │
│ ▼ 若依科技   │ [新增] [修改] [删除]                │
│   ▼ 研发部  │                                     │
│     - 后端组 │ 部门ID │ 部门名称 │ 负责人 │ 状态   │
│     - 前端组 │ 100    │ 研发部   │ 张三   │ 正常   │
│   ▼ 市场部  │ 101    │ 后端组   │ 李四   │ 正常   │
│     - 销售组 │ 102    │ 前端组   │ 王五   │ 正常   │
│              │                                     │
└──────────────┴────────────────────────────────────┘
```

### 场景3: 生成主子表订单管理

#### 需求描述

生成订单和订单明细的主子表管理模块。

#### 数据库表设计

```sql
-- 主表: 订单
CREATE TABLE `order_main` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) DEFAULT NULL COMMENT '用户名称',
  `total_amount` decimal(10,2) DEFAULT 0.00 COMMENT '订单总额',
  `status` char(1) DEFAULT '0' COMMENT '订单状态',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='订单主表';

-- 子表: 订单明细
CREATE TABLE `order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) NOT NULL COMMENT '商品名称',
  `quantity` int DEFAULT 1 COMMENT '数量',
  `price` decimal(10,2) DEFAULT 0.00 COMMENT '单价',
  `amount` decimal(10,2) DEFAULT 0.00 COMMENT '小计',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB COMMENT='订单明细表';
```

#### 生成配置

**主表配置:**
```
表名称: order_main
表描述: 订单主表
实体类名称: OrderMain
生成模板: 主子表(一对多) ← 重点
子表名称: order_item
子表外键: order_id
```

**子表配置:**
```
表名称: order_item
表描述: 订单明细表
实体类名称: OrderItem
(自动识别为子表)
```

#### 生成的主子表功能

**后端代码:**
```java
@Service
public class OrderMainServiceImpl {

    @Override
    @Transactional
    public boolean save(OrderMainBo bo) {
        // 1. 保存主表
        OrderMain main = BeanUtil.toBean(bo, OrderMain.class);
        boolean result = baseMapper.insert(main) > 0;

        if (result && CollUtil.isNotEmpty(bo.getItemList())) {
            // 2. 保存子表(批量)
            List<OrderItem> items = BeanUtil.copyToList(bo.getItemList(), OrderItem.class);
            items.forEach(item -> item.setOrderId(main.getId()));
            orderItemMapper.insertBatch(items);
        }

        return result;
    }

    @Override
    @Transactional
    public boolean updateById(OrderMainBo bo) {
        // 1. 更新主表
        OrderMain main = BeanUtil.toBean(bo, OrderMain.class);
        boolean result = baseMapper.updateById(main) > 0;

        if (result) {
            // 2. 删除原有子表数据
            orderItemMapper.deleteByOrderId(main.getId());

            // 3. 重新插入子表数据
            if (CollUtil.isNotEmpty(bo.getItemList())) {
                List<OrderItem> items = BeanUtil.copyToList(bo.getItemList(), OrderItem.class);
                items.forEach(item -> item.setOrderId(main.getId()));
                orderItemMapper.insertBatch(items);
            }
        }

        return result;
    }
}
```

**前端页面:**
```vue
<template>
  <div>
    <!-- 主表单 -->
    <el-form :model="form" label-width="100px">
      <el-form-item label="订单号">
        <el-input v-model="form.orderNo" />
      </el-form-item>
      <el-form-item label="用户名称">
        <el-input v-model="form.userName" />
      </el-form-item>

      <!-- 子表列表 -->
      <el-form-item label="订单明细">
        <el-button @click="handleAddItem">添加明细</el-button>
        <el-table :data="form.itemList" border>
          <el-table-column label="商品名称" prop="productName" />
          <el-table-column label="数量" prop="quantity" />
          <el-table-column label="单价" prop="price" />
          <el-table-column label="小计" prop="amount" />
          <el-table-column label="操作">
            <template #default="{ $index }">
              <el-button @click="handleDeleteItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="订单总额">
        <el-input v-model="totalAmount" readonly />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 计算订单总额
const totalAmount = computed(() => {
  return form.value.itemList.reduce((sum, item) => sum + item.amount, 0)
})

// 添加明细
function handleAddItem() {
  form.value.itemList.push({
    productName: '',
    quantity: 1,
    price: 0,
    amount: 0
  })
}

// 删除明细
function handleDeleteItem(index: number) {
  form.value.itemList.splice(index, 1)
}
</script>
```

## 使用技巧

### 技巧1: 快速配置字典字段

#### 批量设置字典

对于多个状态/类型字段,使用批量设置功能:

```
1. 勾选多个状态字段:
   ☑ status (状态)
   ☑ gender (性别)
   ☑ type (类型)

2. 点击 [批量设置]

3. 设置:
   - 显示类型: 单选框
   - 查询方式: EQ(=)
   - 权限: 全部勾选

4. 单独配置字典类型:
   - status → sys_normal_disable
   - gender → sys_user_sex
   - type → 自定义字典类型
```

### 技巧2: 自定义业务名规则

#### 标准命名规则

```
表名转业务名规则:
- 去除表前缀
- 转为驼峰命名
- 首字母小写

示例:
sys_user → user
sys_user_role → userRole
demo_product_category → productCategory
t_order_info → orderInfo
```

#### 特殊情况处理

```
缩写词处理:
- API → api (保持小写)
- ID → id (保持小写)
- URL → url (保持小写)

示例:
sys_api_log → apiLog (不是 aPILog)
sys_user_id_card → userIdCard (不是 userIDCard)
```

### 技巧3: 利用表注释生成功能名

#### 优化表注释

```
❌ 不好的注释:
CREATE TABLE `demo_user` COMMENT='user';
→ 功能名: user (不友好)

✅ 好的注释:
CREATE TABLE `demo_user` COMMENT='演示用户信息表';
→ 功能名: 演示用户信息 (友好)
→ 可手动调整为: 演示用户

推荐格式:
COMMENT='[中文业务名]表'
COMMENT='[中文业务名]信息表'
COMMENT='[中文业务名]管理表'
```

### 技巧4: 字段注释规范

#### 标准字段注释格式

```
格式: [字段业务名]([可选值说明])

示例:
status char(1) COMMENT '状态(0停用 1正常)'
gender char(1) COMMENT '性别(0男 1女 2未知)'
type char(1) COMMENT '类型(1个人 2企业)'

生成器会自动:
1. 提取"状态"作为字段标签
2. 识别括号内容作为字典映射
```

### 技巧5: 合理使用默认值

#### 设置字段默认值

```sql
-- 状态字段默认为正常
status char(1) DEFAULT '1' COMMENT '状态(0停用 1正常)'

-- 删除标识默认为未删除
is_deleted char(1) DEFAULT '0' COMMENT '删除标识(0未删除 1已删除)'

-- 排序号默认为0
order_num int DEFAULT 0 COMMENT '显示顺序'

-- 数量默认为1
quantity int DEFAULT 1 COMMENT '数量'

-- 金额默认为0
amount decimal(10,2) DEFAULT 0.00 COMMENT '金额'
```

**好处:**
- 新增时无需手动填写
- 生成的代码会使用默认值
- 减少空指针异常

### 技巧6: 主键字段设计

#### 推荐的主键设计

```sql
-- ✅ 推荐: 使用 id 作为主键名
id bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID'

-- ❌ 不推荐: 使用表名_id
user_id bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID'
product_id bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID'
```

**原因:**
- 统一的主键名便于代码生成
- 避免业务代码中的主键字段不一致
- 符合RESTful API规范

### 技巧7: 时间字段配置

#### 创建时间和更新时间

```sql
-- 创建时间: 自动设置为当前时间
create_time datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'

-- 更新时间: 自动更新为当前时间
update_time datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
```

**配置字段权限:**
```
create_time:
- 查询: ☑ (BETWEEN范围查询)
- 列表: ☑
- 新增: ☐ (自动生成)
- 编辑: ☐ (自动生成)

update_time:
- 查询: ☐
- 列表: ☐
- 新增: ☐ (自动生成)
- 编辑: ☐ (自动生成)
```

### 技巧8: 外键字段处理

#### 外键字段命名

```sql
-- 统一使用 _id 后缀
user_id bigint COMMENT '用户ID'
dept_id bigint COMMENT '部门ID'
role_id bigint COMMENT '角色ID'
product_id bigint COMMENT '商品ID'
```

#### 外键字段配置

```
显示类型:
- 下拉框 (适合选项较少的情况)
- 对话框选择 (适合选项较多的情况)

前端调整:
- 列表中显示关联对象的名称,而不是ID
- 表单中使用下拉选择或弹窗选择
```

## 故障排除

### 问题1: 导入表时找不到数据表

**症状:**
```
在导入对话框中搜索表名,但找不到对应的表。
```

**可能原因:**
1. 数据源配置错误
2. 表已经被导入过
3. 表名包含被过滤的前缀

**解决方案:**

```
步骤1: 检查数据源
- 确认选择了正确的数据源
- 测试数据库连接是否正常

步骤2: 检查表是否已导入
- 在代码生成器主界面搜索表名
- 如果已导入,需要先删除再重新导入

步骤3: 检查表前缀
- 确认表名不是 sj_、flow_、gen_ 开头
- 这些前缀的表会被自动过滤

步骤4: 检查表是否存在
-- 在数据库中执行
SHOW TABLES LIKE '%user%';
```

### 问题2: 生成的代码编译错误

**症状:**
```
java: 程序包xxx不存在
java: 找不到符号
```

**可能原因:**
1. 代码复制位置错误
2. 包路径配置错误
3. Maven依赖缺失

**解决方案:**

```
步骤1: 检查代码位置
正确位置:
- Java代码: src/main/java/plus/ruoyi/...
- 资源文件: src/main/resources/mapper/...

错误示例:
- 复制到了根目录
- 复制到了target目录

步骤2: 检查包路径
在IDE中检查类的包名是否与文件路径匹配:
文件: src/main/java/plus/ruoyi/business/demo/controller/DemoUserController.java
包名: package plus.ruoyi.business.demo.controller;

步骤3: 检查Maven依赖
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-mybatis</artifactId>
</dependency>

步骤4: 刷新Maven项目
mvn clean install
```

### 问题3: 前端页面显示空白

**症状:**
```
访问生成的页面,显示空白,控制台无明显错误。
```

**可能原因:**
1. 路由配置缺失
2. 组件路径错误
3. 菜单权限未配置

**解决方案:**

```
步骤1: 检查路由配置
// src/router/modules/demo.ts
import { RouteRecordRaw } from 'vue-router'

const demoRoutes: RouteRecordRaw = {
  path: '/demo',
  component: Layout,
  children: [...]
}

export default demoRoutes

步骤2: 注册路由
// src/router/index.ts
import demoRoutes from './modules/demo'

const routes = [
  // ...
  demoRoutes
]

步骤3: 执行菜单SQL
source demoUserMenu.sql;

步骤4: 分配菜单权限
1. 登录系统
2. 进入 系统管理 → 角色管理
3. 编辑角色,分配菜单权限
4. 重新登录
```

### 问题4: 403权限错误

**症状:**
```
访问页面或调用API时提示: 403 Forbidden
```

**可能原因:**
1. 菜单SQL未执行
2. 用户未分配权限
3. 权限标识符不匹配

**解决方案:**

```
步骤1: 确认菜单已导入
SELECT * FROM sys_menu WHERE perms LIKE 'demo:demoUser:%';

步骤2: 检查用户权限
SELECT m.menu_name, m.perms
FROM sys_menu m
JOIN sys_role_menu rm ON m.menu_id = rm.menu_id
JOIN sys_user_role ur ON rm.role_id = ur.role_id
WHERE ur.user_id = 1;  -- 你的用户ID

步骤3: 手动分配权限
-- 为角色分配权限(角色ID=2, 菜单ID从sys_menu查询)
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 2, menu_id FROM sys_menu WHERE perms LIKE 'demo:demoUser:%';

步骤4: 检查权限标识符
Controller中的注解:
@SaCheckPermission("demo:demoUser:query")

菜单中的权限:
SELECT perms FROM sys_menu WHERE menu_name = '演示用户查询';
-- 应返回: demo:demoUser:query
```

### 问题5: 字典数据不显示

**症状:**
```
下拉框、单选框中没有选项,显示空白。
```

**可能原因:**
1. 字典类型配置错误
2. 字典数据不存在
3. 前端未正确加载字典

**解决方案:**

```
步骤1: 检查字典类型配置
-- 字段配置中的字典类型
字段: status
字典类型: sys_normal_disable

步骤2: 确认字典数据存在
-- 检查字典类型
SELECT * FROM sys_dict_type WHERE dict_type = 'sys_normal_disable';

-- 检查字典数据
SELECT * FROM sys_dict_data WHERE dict_type = 'sys_normal_disable';

步骤3: 检查前端代码
// 确保加载字典
const { sys_normal_disable } = useDictStore().getDict('sys_normal_disable')

// 确保使用字典
<el-select v-model="form.status">
  <el-option
    v-for="dict in sys_normal_disable"
    :key="dict.value"
    :label="dict.label"
    :value="dict.value"
  />
</el-select>

步骤4: 清除缓存
- 清除浏览器缓存
- 清除Redis缓存
- 重启前端开发服务器
```

## 最佳实践

### 实践1: 表设计规范

#### 命名规范

```
表名:
- 全部小写
- 单词间用下划线分隔
- 使用统一的表前缀
- 示例: sys_user, demo_product

字段名:
- 全部小写
- 单词间用下划线分隔
- 避免使用保留字
- 示例: user_name, create_time

注释:
- 所有表和字段必须有注释
- 注释使用中文
- 格式规范便于代码生成
```

#### 字段设计

```
主键:
- 统一使用 id
- 类型: bigint
- 自增主键

公共字段:
- create_by: 创建人
- create_time: 创建时间
- update_by: 更新人
- update_time: 更新时间
- create_dept: 创建部门
- remark: 备注

状态字段:
- 使用 char(1)
- 0/1 标识
- 添加注释说明取值

删除标识:
- is_deleted char(1)
- 0未删除 1已删除
- 默认值 0
```

### 实践2: 生成前的准备

#### 检查清单

```
数据库设计:
□ 表结构已确定
□ 字段类型已优化
□ 索引已添加
□ 注释已完善

配置准备:
□ 确定包路径
□ 确定模块名
□ 确定业务名
□ 确定上级菜单

字典准备:
□ 状态字段字典已创建
□ 类型字段字典已创建
□ 其他枚举值字典已创建
```

### 实践3: 生成后的优化

#### 代码优化

```
后端优化:
1. 添加业务校验逻辑
2. 完善异常处理
3. 添加事务管理
4. 优化查询性能
5. 添加业务日志

前端优化:
1. 优化表单布局
2. 添加表单验证规则
3. 完善错误提示
4. 优化用户交互
5. 添加操作确认
```

#### 性能优化

```
数据库:
1. 为常用查询字段添加索引
2. 优化SQL查询语句
3. 使用分页查询
4. 避免N+1查询

缓存:
1. 缓存字典数据
2. 缓存常用配置
3. 使用合理的缓存过期时间

代码:
1. 使用批量操作
2. 避免循环查询数据库
3. 使用异步处理耗时操作
```

### 实践4: 代码版本管理

#### Git工作流

```
生成代码后的Git操作:

1. 创建功能分支
git checkout -b feature/demo-user

2. 添加生成的代码
git add src/main/java/plus/ruoyi/business/demo/
git add src/main/resources/mapper/demo/
git add src/api/business/demo/
git add src/views/business/demo/

3. 提交代码
git commit -m "feat: 新增演示用户管理模块"

4. 推送到远程
git push origin feature/demo-user

5. 创建Pull Request
在GitLab/GitHub上创建PR,等待代码审查
```

#### 提交信息规范

```
格式: <type>(<scope>): <subject>

type类型:
- feat: 新功能
- fix: 修复bug
- refactor: 重构
- docs: 文档
- style: 格式
- test: 测试

示例:
feat(user): 新增用户管理模块
feat(order): 新增订单管理功能
fix(dept): 修复部门树形展示问题
```

### 实践5: 代码审查要点

#### 审查检查清单

```
功能完整性:
□ 所有功能都已实现
□ CRUD操作正常
□ 权限控制正确
□ 数据校验完善

代码质量:
□ 无编译错误
□ 无明显的代码缺陷
□ 遵循编码规范
□ 注释清晰完整

性能安全:
□ SQL注入防护
□ XSS攻击防护
□ 权限验证
□ 数据加密(如密码)

测试验证:
□ 单元测试通过
□ 集成测试通过
□ 功能测试通过
□ 性能测试通过
```

## 总结

本使用手册涵盖了代码生成器的完整使用流程:

**基础操作:**
- 表导入和配置
- 字段配置
- 代码生成
- 同步更新

**高级功能:**
- 树形结构生成
- 主子表生成
- 批量操作
- 自定义路径生成

**实用技巧:**
- 配置优化
- 命名规范
- 性能优化
- 故障排除

通过掌握这些内容,你可以高效地使用代码生成器,快速构建标准化的业务功能,大幅提升开发效率。
