# 代码生成器最佳实践

## 概述

代码生成器是 RuoYi-Plus-UniApp 项目的核心开发工具，能够根据数据库表结构自动生成完整的 CRUD 功能代码，包括后端 Java 代码、前端 Vue 页面、TypeScript 类型定义和 MyBatis XML 映射文件。通过代码生成器，可以快速构建业务模块，大幅提升开发效率。

**核心价值:**

- **快速开发** - 几分钟内生成完整的 CRUD 功能代码
- **规范统一** - 确保代码风格和架构一致性
- **减少错误** - 避免手工编码的低级错误
- **提升效率** - 开发效率提升 70% 以上

**生成范围:**

| 层次 | 生成内容 | 文件数量 |
|------|---------|----------|
| 后端 | Entity、Bo、Vo、Controller、Service、Mapper、DAO | 8-10个 |
| 前端 | Vue页面、TypeScript API、类型定义 | 3-4个 |
| 配置 | MyBatis XML、SQL脚本 | 2个 |

---

## 架构设计

### 核心模块结构

```
ruoyi-generator/
├── domain/                          # 实体类
│   ├── GenTable.java               # 代码生成业务表（354行）
│   └── GenTableColumn.java         # 代码生成业务字段（260行）
├── controller/                      # 控制器
│   └── GenController.java          # 代码生成API（250行）
├── service/                         # 服务层
│   ├── IGenTableService.java       # 业务接口
│   └── GenTableServiceImpl.java    # 业务实现
├── dao/                            # 数据访问层
│   ├── IGenTableDao.java
│   └── IGenTableColumnDao.java
├── mapper/                         # MyBatis映射
│   ├── GenTableMapper.java
│   └── GenTableColumnMapper.java
├── util/                           # 工具类
│   └── GenUtils.java               # 代码生成工具（801行）
├── constant/                       # 常量定义
│   └── GenConstants.java           # 代码生成常量（407行）
├── config/                         # 配置类
│   └── GenConfig.java              # 生成器配置（158行）
└── resources/
    ├── vm/                         # Velocity模板
    │   ├── java/                   # Java代码模板
    │   │   ├── domain.java.vm
    │   │   ├── bo.java.vm
    │   │   ├── vo.java.vm
    │   │   ├── controller.java.vm
    │   │   ├── service.java.vm
    │   │   ├── serviceImpl.java.vm
    │   │   ├── mapper.java.vm
    │   │   ├── dao.java.vm
    │   │   └── daoImpl.java.vm
    │   ├── vue/                    # Vue页面模板
    │   │   ├── index.vue.vm        # 列表页（604行）
    │   │   ├── child.vue.vm        # 子表组件
    │   │   └── index-tree.vue.vm   # 树表页
    │   ├── ts/                     # TypeScript模板
    │   │   ├── api.ts.vm
    │   │   └── types.ts.vm
    │   ├── xml/                    # MyBatis模板
    │   │   └── mapper.xml.vm
    │   └── sql/                    # SQL脚本模板
    │       ├── mysql/sql.vm
    │       ├── oracle/sql.vm
    │       ├── postgres/sql.vm
    │       └── sqlserver/sql.vm
    └── generator.yml               # 生成器配置
```

### 数据库表设计

```sql
-- 代码生成业务表
CREATE TABLE sys_gen_table (
    table_id           BIGINT PRIMARY KEY,
    data_name          VARCHAR(100),     -- 数据源名称
    table_name         VARCHAR(100),     -- 表名称
    table_comment      VARCHAR(500),     -- 表描述
    class_name         VARCHAR(100),     -- 实体类名
    tpl_category       VARCHAR(20),      -- 模板类型(crud/tree/sub)
    package_name       VARCHAR(100),     -- 生成包路径
    module_name        VARCHAR(30),      -- 生成模块名
    business_name      VARCHAR(30),      -- 业务名称
    function_name      VARCHAR(50),      -- 功能名称
    function_author    VARCHAR(50),      -- 代码作者
    gen_type           CHAR(1),          -- 生成方式(0-zip/1-自定义)
    gen_path           VARCHAR(200),     -- 生成路径
    menu_ids           VARCHAR(1000),    -- 关联菜单ID
    parent_menu_id     BIGINT,           -- 上级菜单
    menu_icon          VARCHAR(100),     -- 菜单图标
    menu_order         INT,              -- 菜单顺序
    auto_import_menu   CHAR(1)           -- 自动导入菜单
);

-- 代码生成业务字段
CREATE TABLE sys_gen_table_column (
    column_id          BIGINT PRIMARY KEY,
    table_id           BIGINT,           -- 表ID
    column_name        VARCHAR(100),     -- 字段名
    column_comment     VARCHAR(500),     -- 字段描述
    column_label       VARCHAR(100),     -- 字段显示标签
    column_type        VARCHAR(100),     -- 字段类型
    java_type          VARCHAR(50),      -- Java类型
    java_field         VARCHAR(100),     -- Java属性名
    is_pk              CHAR(1),          -- 是否主键
    is_increment       CHAR(1),          -- 是否自增
    is_required        CHAR(1),          -- 是否必填
    is_insert          CHAR(1),          -- 是否新增字段
    is_edit            CHAR(1),          -- 是否编辑字段
    is_list            CHAR(1),          -- 是否列表字段
    is_query           CHAR(1),          -- 是否查询字段
    query_type         VARCHAR(20),      -- 查询方式(LIKE/EQ/BETWEEN)
    html_type          VARCHAR(20),      -- 显示类型(input/select/radio...)
    dict_type          VARCHAR(200),     -- 字典类型
    column_default     VARCHAR(200),     -- 默认值
    sort               INT               -- 排序
);
```

---

## 使用指南

### 1. 访问代码生成器

访问路径: **系统工具 > 代码生成**

或直接访问: `http://localhost/tool/gen`

### 2. 导入数据库表

**步骤:**

1. 点击"导入"按钮
2. 选择数据源(默认master)
3. 在表列表中勾选需要导入的表
4. 点击"导入"确认

**自动识别:**
- 表注释 → 功能名称
- 表名 → 实体类名(自动驼峰转换)
- 字段类型 → Java类型映射
- 字段后缀 → HTML控件类型

### 3. 编辑表配置

点击表名进入配置页面，包含三个Tab:

#### (1) 基本信息

```yaml
数据源: master              # 数据库连接名
表名称: sys_user            # 数据库表名
表描述: 用户信息表          # 功能描述
实体类名: SysUser           # Java类名(自动生成)
代码作者: 抓蛙师            # 从配置读取
```

#### (2) 生成信息

```yaml
生成模板: 单表(增删改查)     # crud/tree/sub
生成包路径: plus.ruoyi.business.base
生成模块名: base             # 影响URL路径
业务名称: user               # 影响文件名
功能名称: 用户              # 显示在页面标题
后端生成路径: /             # 默认自动
前端生成路径: /             # 默认自动
生成方式: zip压缩包         # 或自定义路径
```

**生成模板类型:**

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| 单表(crud) | 标准增删改查 | 大部分业务表 |
| 树表(tree) | 树形结构 | 部门、菜单、区域等 |
| 主子表(sub) | 一对多关联 | 订单-明细、文章-附件 |

#### (3) 字段信息

对每个字段配置:

| 配置项 | 说明 |
|--------|------|
| 字段描述 | 表单标签和列表表头 |
| Java类型 | String/Integer/Long/Date/BigDecimal |
| Java属性 | 自动驼峰转换 |
| 插入 | 是否在新增表单显示 |
| 编辑 | 是否在编辑表单显示 |
| 列表 | 是否在列表表格显示 |
| 查询 | 是否作为查询条件 |
| 查询方式 | LIKE(模糊)/EQ(等值)/BETWEEN(范围) |
| 必填 | 是否必填校验 |
| 显示类型 | input/textarea/select/radio/checkbox/datetime/upload |
| 字典类型 | 选择已有字典编码 |

### 4. 预览代码

点击"预览"按钮查看生成的代码:

- domain.java - 实体类
- bo.java - 业务对象
- vo.java - 视图对象
- controller.java - 控制器
- service.java - 业务接口
- serviceImpl.java - 业务实现
- mapper.java - Mapper接口
- dao.java - DAO接口
- mapper.xml - MyBatis XML
- index.vue - 前端列表页
- api.ts - API接口
- types.ts - TypeScript类型

### 5. 生成代码

**方式一: 下载zip压缩包**

点击"生成代码"按钮，下载zip文件，手动解压到项目目录

**方式二: 生成到自定义路径**

1. 编辑表配置，设置"生成方式"为"自定义路径"
2. 设置"后端生成路径"和"前端生成路径"
3. 点击"生成代码"，直接写入项目文件

### 6. 批量生成

勾选多个表，点击"生成代码"批量生成

---

## 生成器配置

### generator.yml 配置文件

```yaml
# 代码生成器配置
gen:
  # 代码作者(注释中显示)
  author: 抓蛙师

  # 默认生成方式(0-zip压缩包, 1-自定义路径)
  defaultGenType: 0

  # 后端模块名称
  backendModuleName: ruoyi-business

  # 默认生成包路径
  packageName: plus.ruoyi.business.base

  # 前端项目根目录
  frontendRootDir: plus-ui

  # 菜单图标默认值
  menuIcon: info

  # 菜单排序默认值
  menuOrder: 0

  # 是否自动导入菜单(0-否, 1-是)
  autoImportMenu: 1

  # 是否自动去除表前缀
  autoRemovePre: true

  # 表前缀列表(逗号分隔)
  tablePrefix: sys_,a_,b_,t_,gen_
```

### 配置说明

**表前缀处理:**

```
原表名: sys_user  → 去除前缀 → user → 类名: SysUser
原表名: a_order   → 去除前缀 → order → 类名: AOrder
```

**生成路径规则:**

```
# 后端路径
{projectRoot}/{backendModuleName}/src/main/java/{packageName替换为路径}/

# 前端路径
{projectRoot}/{frontendRootDir}/src/views/{moduleName}/
{projectRoot}/{frontendRootDir}/src/api/{moduleName}/
```

---

## 模板定制

### Velocity 模板语法

```java
## 变量替换
${tableName}                ## 表名
${className}                ## 类名
${classname}                ## 类名首字母小写
${functionName}             ## 功能名称
${businessName}             ## 业务名称
${moduleName}               ## 模块名称
${packageName}              ## 包名
${author}                   ## 作者
${datetime}                 ## 当前时间

## 条件判断
#if($table.crud)
    // CRUD模板
#elseif($table.tree)
    // 树表模板
#else
    // 其他模板
#end

## 循环
#foreach($column in $columns)
    private ${column.javaType} ${column.javaField};
#end

## 宏定义
#macro(getMethodName $field)
    get${field.substring(0,1).toUpperCase()}${field.substring(1)}
#end
```

### 自定义模板

#### 1. 创建模板文件

在 `src/main/resources/vm/java/` 下创建新模板:

```java
// custom.java.vm
package ${packageName};

import lombok.Data;

/**
 * ${functionName}自定义对象 ${className}Custom
 *
 * @author ${author}
 * @date ${datetime}
 */
@Data
public class ${className}Custom {

#foreach($column in $columns)
#if(!$column.isSuperColumn())
    /** $column.columnComment */
    private $column.javaType $column.javaField;

#end
#end
}
```

#### 2. 修改生成逻辑

在 `GenTableServiceImpl` 中添加模板处理:

```java
// 添加自定义模板
VelocityContext context = getVelocityContext(table);
Template tpl = Velocity.getTemplate("vm/java/custom.java.vm", "UTF-8");
StringWriter sw = new StringWriter();
tpl.merge(context, sw);
codes.put("custom.java", sw.toString());
```

---

## 字段类型映射

### 数据库类型 → Java类型

| 数据库类型 | Java类型 | 说明 |
|-----------|---------|------|
| varchar, char, text | String | 字符串 |
| int, tinyint, smallint | Integer | 整数 |
| bigint | Long | 长整数 |
| float, double, decimal | BigDecimal | 浮点数 |
| date, datetime, timestamp | Date | 日期时间 |
| bit, boolean | Boolean | 布尔值 |

### HTML控件类型识别

**根据字段后缀自动识别:**

| 字段后缀 | 控件类型 | 示例 |
|---------|---------|------|
| image, img, avatar | imageUpload | user_avatar |
| file, path | fileUpload | file_path |
| content, detail | editor | article_content |
| status | radio | user_status |
| type, gender | select | user_type |
| name, title | input | user_name |

**根据字段类型识别:**

| 字段类型 | 控件类型 |
|---------|---------|
| text, longtext | textarea |
| datetime, timestamp | datetime |
| tinyint(1) | radio |

---

## 高级功能

### 1. 树表生成

**数据库表结构要求:**

```sql
CREATE TABLE sys_dept (
    dept_id     BIGINT PRIMARY KEY,
    parent_id   BIGINT,           -- 父级ID
    ancestors   VARCHAR(500),     -- 祖级列表
    dept_name   VARCHAR(30),      -- 部门名称
    order_num   INT,              -- 显示顺序
    leader      VARCHAR(20),
    phone       VARCHAR(11),
    ...
);
```

**配置步骤:**

1. 选择模板类型为"树表(tree)"
2. 设置"树编码字段": dept_id
3. 设置"树父编码字段": parent_id
4. 设置"树名称字段": dept_name

**生成特性:**
- 自动生成树形列表展示
- 支持展开/折叠
- 支持拖拽排序
- 父子级联操作

### 2. 主子表生成

**数据库表结构要求:**

```sql
-- 主表
CREATE TABLE t_order (
    order_id    BIGINT PRIMARY KEY,
    order_no    VARCHAR(50),
    ...
);

-- 子表
CREATE TABLE t_order_detail (
    detail_id   BIGINT PRIMARY KEY,
    order_id    BIGINT,           -- 外键关联主表
    goods_id    BIGINT,
    quantity    INT,
    ...
);
```

**配置步骤:**

1. 先导入主表和子表
2. 编辑主表配置，选择模板类型为"主子表(sub)"
3. 设置"关联子表的表名": t_order_detail
4. 设置"子表关联的外键名": order_id

**生成特性:**
- 主表增删改查
- 子表内嵌表格
- 一键保存主子数据
- 级联删除

### 3. 字典数据关联

**配置步骤:**

1. 在字段配置中选择"显示类型"为 select/radio/checkbox
2. 设置"字典类型"，输入字典编码(如: sys_user_sex)

**生成效果:**

```vue
<!-- 自动生成字典下拉框 -->
<el-select v-model="form.status" placeholder="请选择状态">
  <el-option
    v-for="dict in sys_normal_disable"
    :key="dict.value"
    :label="dict.label"
    :value="dict.value"
  />
</el-select>
```

### 4. 自动导入菜单

**配置步骤:**

1. 设置"自动导入菜单"为"是"
2. 选择"上级菜单"
3. 设置"菜单图标"和"菜单顺序"

**生成菜单结构:**

```
上级菜单
└── 用户管理                 # 自动创建
    ├── 用户查询             # 按钮权限
    ├── 用户新增
    ├── 用户修改
    ├── 用户删除
    └── 用户导出
```

---

## 最佳实践

### 1. 表设计规范

```sql
-- 好的实践
CREATE TABLE sys_user (
    user_id         BIGINT PRIMARY KEY COMMENT '用户ID',
    user_name       VARCHAR(50) NOT NULL COMMENT '用户账号',
    nick_name       VARCHAR(50) COMMENT '用户昵称',
    email           VARCHAR(100) COMMENT '邮箱',
    phone_number    VARCHAR(11) COMMENT '手机号',
    sex             CHAR(1) COMMENT '性别(0-男 1-女)',
    avatar          VARCHAR(200) COMMENT '头像地址',
    status          CHAR(1) DEFAULT '0' COMMENT '状态(0-正常 1-停用)',
    del_flag        CHAR(1) DEFAULT '0' COMMENT '删除标志(0-存在 2-删除)',
    create_by       VARCHAR(64) COMMENT '创建者',
    create_time     DATETIME COMMENT '创建时间',
    update_by       VARCHAR(64) COMMENT '更新者',
    update_time     DATETIME COMMENT '更新时间',
    remark          VARCHAR(500) COMMENT '备注'
) COMMENT = '用户信息表';

-- 不好的实践
CREATE TABLE user (
    id INT,                 -- 缺少注释
    name VARCHAR(20),       -- 字段名过于简单
    value TEXT              -- 含义不明确
);
```

**建议:**
- 表名和字段必须有注释
- 使用下划线命名(user_name)
- 主键统一命名为 `表名_id`
- 必须包含基础字段(create_time等)
- 状态字段使用字典编码

### 2. 字段配置优化

```java
// 不在列表显示的字段
content, detail, remark  → is_list = 0

// 不在查询条件的字段
create_time, update_time  → is_query = 0

// 必填字段
user_name, email  → is_required = 1

// 只读字段
create_time, create_by  → is_edit = 0
```

### 3. 模板选择

| 场景 | 模板类型 | 示例 |
|------|---------|------|
| 普通业务表 | crud | 用户、角色、商品 |
| 有上下级关系 | tree | 部门、菜单、区域 |
| 一对多关系 | sub | 订单-明细、合同-附件 |

### 4. 代码生成后处理

```java
// 1. 检查导入语句
import java.util.*;
import plus.ruoyi.common.core.domain.R;

// 2. 补充业务逻辑
@Override
public R<Void> insertUser(UserBo bo) {
    // 生成代码只有基础验证，需要补充业务逻辑
    if (checkUserNameUnique(bo.getUserName())) {
        return R.fail("用户名已存在");
    }
    // ... 业务逻辑
}

// 3. 优化查询条件
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.like(StringUtils.isNotBlank(bo.getUserName()),
            User::getUserName, bo.getUserName());
// 添加自定义查询条件

// 4. 前端页面调整
// - 调整列宽
// - 添加自定义按钮
// - 修改表单布局
```

### 5. 代码审查清单

- [ ] 实体类字段类型正确
- [ ] 业务逻辑完整
- [ ] 权限注解配置
- [ ] 查询条件合理
- [ ] 表单验证完善
- [ ] 列表排序正确
- [ ] 字典数据关联
- [ ] 导入导出功能
- [ ] 删除时级联处理
- [ ] 日志记录

---

## 常见问题

### 1. 导入表后字段类型不正确

**问题:** Java类型映射错误

**解决方案:**

```java
// 检查字段类型映射
GenConstants.TYPE_STRING    // varchar, char, text
GenConstants.TYPE_INTEGER   // int, tinyint, smallint
GenConstants.TYPE_LONG      // bigint
GenConstants.TYPE_DATE      // datetime, timestamp
GenConstants.TYPE_BIGDECIMAL // decimal, numeric

// 手动修改
在字段配置中调整"Java类型"
```

### 2. 生成的代码编译错误

**问题:** 导入语句缺失或路径错误

**解决方案:**

```java
// 检查包路径配置
packageName: plus.ruoyi.business.base  // 必须与实际项目一致

// 检查模块名配置
backendModuleName: ruoyi-business      // 必须存在

// 手动补充导入
import plus.ruoyi.common.core.domain.R;
import plus.ruoyi.common.mybatis.core.page.TableDataInfo;
```

### 3. 前端页面路由404

**问题:** 菜单路由配置错误

**解决方案:**

```javascript
// 检查路由配置
{
  path: '/base/user',
  component: () => import('@/views/base/user/index.vue')
}

// 检查文件路径
src/views/base/user/index.vue  // 必须存在

// 重新导入菜单
代码生成 → 编辑 → 自动导入菜单 → 重新生成
```

### 4. 字典数据不显示

**问题:** 字典类型配置错误

**解决方案:**

```vue
// 检查字典类型是否存在
系统管理 → 字典管理 → 查找字典类型

// 检查前端代码
const { sys_user_sex } = proxy.useDict('sys_user_sex');

// 确保字典数据已加载
数据字典中必须有对应的字典数据
```

### 5. 生成到自定义路径失败

**问题:** 路径配置错误或权限不足

**解决方案:**

```yaml
# 检查配置
生成方式: 自定义路径
后端生成路径: /d/projects/ruoyi-plus-uniapp-workflow/
前端生成路径: /d/projects/ruoyi-plus-uniapp-workflow/plus-ui/

# 路径必须存在且有写权限
# Windows路径使用 / 或 \\
# Linux路径使用 /
```

---

## 技术实现

### 核心处理流程

代码生成器的核心流程分为以下几个阶段:

#### 1. 表导入阶段

**流程说明:**

```java
// GenTableServiceImpl.importGenTables()
1. 从数据库读取表结构元数据
2. 调用 GenUtils.initTable() 初始化表信息
   - 设置类名(驼峰转换)
   - 设置业务名(去除表前缀)
   - 设置功能名(清理注释)
3. 查询列信息并调用 GenUtils.initColumnField() 初始化
   - 推断Java类型
   - 推断HTML控件类型
   - 设置增删改查权限
4. 保存到 sys_gen_table 和 sys_gen_table_column
```

**智能推断规则:**

| 推断类型 | 规则 | 示例 |
|---------|------|------|
| **Java类型** | varchar → String | VARCHAR(50) → String |
| | bigint → Long | BIGINT → Long |
| | int → Integer | INT → Integer |
| | decimal(m,n) → BigDecimal | DECIMAL(10,2) → BigDecimal |
| | datetime → Date | DATETIME → Date |
| **HTML控件** | 字段后缀 _status → radio | user_status → 单选框 |
| | 字段后缀 _type → select | user_type → 下拉框 |
| | 字段后缀 _name → input + LIKE | user_name → 输入框(模糊查询) |
| | 字段后缀 _image → imageUpload | user_image → 图片上传 |
| | 字段后缀 _file → fileUpload | file_path → 文件上传 |
| | 字段后缀 _content → editor | article_content → 富文本 |
| | 字段长度 > 500 → textarea | VARCHAR(1000) → 文本域 |
| | 字段前缀 is_ → select + 布尔字典 | is_enabled → 下拉框 |
| **查询方式** | name字段 → LIKE | 模糊查询 |
| | time字段 → BETWEEN | 范围查询 |
| | 其他字段 → EQ | 等值查询 |

#### 2. 代码生成阶段

**流程说明:**

```java
// GenTableServiceImpl.generatorCode()
1. 查询表配置和列配置
2. 设置扩展信息(树表/主子表)
3. 初始化 Velocity 模板引擎
4. 准备模板上下文(VelocityContext)
   - 设置基础变量(类名、包名、作者等)
   - 设置列信息
   - 设置导入包列表
   - 设置字典数据
5. 获取模板列表(根据模板类型)
6. 逐个渲染模板并生成文件
7. 自动导入菜单SQL(可选)
```

**模板上下文变量:**

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| tableName | 表名 | sys_user |
| ClassName | 类名(首字母大写) | SysUser |
| className | 类名(首字母小写) | sysUser |
| BusinessName | 业务名(首字母大写) | User |
| businessName | 业务名(首字母小写) | user |
| moduleName | 模块名 | system |
| packageName | 包名 | plus.ruoyi.system |
| author | 作者 | 抓蛙师 |
| datetime | 当前日期 | 2025-11-25 |
| functionName | 功能名 | 用户管理 |
| columns | 列集合 | `List<GenTableColumn>` |
| pkColumn | 主键列 | GenTableColumn |
| importList | 导入包列表 | `Set<String>` |
| dicts | 字典类型列表 | 'sys_user_sex', 'sys_normal_disable' |
| permissionPrefix | 权限前缀 | system:user |

#### 3. 模板渲染阶段

**Velocity 模板引擎:**

```java
// VelocityUtils.prepareContext()
VelocityContext context = new VelocityContext();
context.put("tableName", "sys_user");
context.put("ClassName", "SysUser");
context.put("columns", columns);

// 渲染模板
Template tpl = Velocity.getTemplate("vm/java/domain.java.vm");
StringWriter sw = new StringWriter();
tpl.merge(context, sw);
String code = sw.toString();
```

**模板示例 (domain.java.vm):**

```java
package ${packageName}.domain;

#foreach ($import in $importList)
import ${import};
#end
import lombok.Data;

/**
 * ${functionName}对象 ${tableName}
 *
 * @author ${author}
 * @date ${datetime}
 */
@Data
public class ${ClassName} {

#foreach ($column in $columns)
#if(!$column.isSuperColumn())
    /** $column.columnComment */
    private $column.javaType $column.javaField;

#end
#end
}
```

### 字段处理策略

#### 字段类型映射表

| 数据库类型 | Java类型 | TypeScript类型 | HTML控件 | 说明 |
|-----------|---------|---------------|----------|------|
| varchar(n) | String | string | input | 字符串 |
| text | String | string | textarea | 长文本 |
| int | Integer | number | input/numberInput | 整数 |
| bigint | Long | number | input/numberInput | 长整数 |
| decimal(m,n) | BigDecimal | number | numberInput | 精确小数 |
| datetime | Date | string | datetime | 日期时间 |
| tinyint(1) | Boolean | boolean | radio/select | 布尔值 |

#### 字段权限矩阵

| 字段类型 | 插入 | 编辑 | 列表 | 查询 | 必填 | 说明 |
|---------|------|------|------|------|------|------|
| 主键字段 | ❌ | ❌ | ✅ | ❌ | ✅ | 自动生成,不允许手动输入 |
| 普通字段 | ✅ | ✅ | ✅ | ✅ | ❌ | 常规业务字段 |
| create_time | ❌ | ❌ | ✅ | ❌ | ❌ | 系统自动填充 |
| update_time | ❌ | ❌ | ❌ | ❌ | ❌ | 系统自动更新 |
| create_by | ❌ | ❌ | ❌ | ❌ | ❌ | 系统自动填充 |
| update_by | ❌ | ❌ | ❌ | ❌ | ❌ | 系统自动填充 |
| is_deleted | ❌ | ❌ | ❌ | ❌ | ❌ | 逻辑删除标记 |
| tenant_id | ❌ | ❌ | ❌ | ❌ | ❌ | 租户ID,自动填充 |
| version | ❌ | ❌ | ❌ | ❌ | ❌ | 乐观锁版本号 |
| remark | ✅ | ✅ | ❌ | ❌ | ❌ | 备注字段,不在列表显示 |

### 文件生成路径规则

#### 后端文件路径

```bash
# 基础路径
{projectRoot}/ruoyi-modules/{backendModuleName}/src/

# 各层路径
main/java/{packageName}/domain/{ClassName}.java              # 实体类
main/java/{packageName}/domain/bo/{ClassName}Bo.java        # 业务对象
main/java/{packageName}/domain/vo/{ClassName}Vo.java        # 视图对象
main/java/{packageName}/controller/{ClassName}Controller.java
main/java/{packageName}/service/I{ClassName}Service.java
main/java/{packageName}/service/impl/{ClassName}ServiceImpl.java
main/java/{packageName}/dao/I{ClassName}Dao.java
main/java/{packageName}/dao/impl/{ClassName}DaoImpl.java
main/java/{packageName}/mapper/{ClassName}Mapper.java
main/resources/mapper/{moduleName}/{ClassName}Mapper.xml
```

**示例:**

```bash
# 配置: packageName=plus.ruoyi.business.base, className=Ad
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/Ad.java
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/bo/AdBo.java
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/vo/AdVo.java
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/controller/AdController.java
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/IAdService.java
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/impl/AdServiceImpl.java
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/dao/IAdDao.java
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/dao/impl/AdDaoImpl.java
ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/mapper/AdMapper.java
ruoyi-modules/ruoyi-business/src/main/resources/mapper/base/AdMapper.xml
```

#### 前端文件路径

```bash
# 基础路径
{projectRoot}/{frontendRootDir}/src/

# 各层路径
api/{frontendPath}/{businessName}/{businessName}Api.ts      # API接口
api/{frontendPath}/{businessName}/{businessName}Types.ts    # 类型定义
views/{frontendPath}/{businessName}/{businessName}.vue      # 列表页面

# 特殊页面
views/{frontendPath}/{businessName}/{businessName}Tree.vue  # 树表页面
views/{frontendPath}/{businessName}/{SubClassName}Child.vue # 子表组件
```

**路径生成规则:**

```bash
# 包名: plus.ruoyi.business.base
# 跳过前两级域名(plus.ruoyi),提取剩余部分
# 结果: business/base

# 示例: businessName=ad
plus-ui/src/api/business/base/ad/adApi.ts
plus-ui/src/api/business/base/ad/adTypes.ts
plus-ui/src/views/business/base/ad/ad.vue
```

#### SQL文件路径

```bash
# 菜单SQL
{projectRoot}/script/sql/menu/{moduleName}_{subModule}_{businessName}_menu.sql

# 示例
# packageName: plus.ruoyi.business.base
# businessName: ad
# 结果: business_base_ad_menu.sql

script/sql/menu/business_base_ad_menu.sql
```

### 自动导入菜单

**菜单SQL生成示例:**

```sql
-- 菜单: 广告管理
INSERT INTO sys_menu VALUES(
  1860604959000000001,           -- 菜单ID
  '广告管理',                     -- 菜单名称
  3,                             -- 父菜单ID
  1,                             -- 显示顺序
  'base/ad',                     -- 路由地址
  '',                            -- 组件路径(空表示自动匹配)
  1,                             -- 菜单类型(1=目录 2=菜单 3=按钮)
  'info',                        -- 菜单图标
  0,                             -- 是否外链
  0,                             -- 缓存
  0,                             -- 隐藏
  'base:ad:view',                -- 权限标识
  NOW(),                         -- 创建时间
  NULL,                          -- 备注
  0                              -- 删除标志
);

-- 按钮: 广告查询
INSERT INTO sys_menu VALUES(1860604959000000002, '广告查询', 1860604959000000001, 1, '', '', 3, '', 0, 0, 0, 'base:ad:query', NOW(), NULL, 0);

-- 按钮: 广告新增
INSERT INTO sys_menu VALUES(1860604959000000003, '广告新增', 1860604959000000001, 2, '', '', 3, '', 0, 0, 0, 'base:ad:add', NOW(), NULL, 0);

-- 按钮: 广告修改
INSERT INTO sys_menu VALUES(1860604959000000004, '广告修改', 1860604959000000001, 3, '', '', 3, '', 0, 0, 0, 'base:ad:edit', NOW(), NULL, 0);

-- 按钮: 广告删除
INSERT INTO sys_menu VALUES(1860604959000000005, '广告删除', 1860604959000000001, 4, '', '', 3, '', 0, 0, 0, 'base:ad:remove', NOW(), NULL, 0);

-- 按钮: 广告导出
INSERT INTO sys_menu VALUES(1860604959000000006, '广告导出', 1860604959000000001, 5, '', '', 3, '', 0, 0, 0, 'base:ad:export', NOW(), NULL, 0);
```

**自动导入逻辑:**

```java
// GenTableServiceImpl.autoImportMenuSql()
// 判断条件:
1. 配置开启自动导入(autoImportMenu = 1)
2. 生成方式为自定义路径(genType = 1)
3. 生成路径为当前项目
4. 菜单不存在(防止重复导入)

// 执行流程:
1. 渲染菜单SQL模板
2. 提取INSERT语句
3. 通过JdbcTemplate执行SQL
4. 事务管理(失败自动回滚)
```

**防重复导入机制:**

```java
// 检查主菜单权限是否存在
String mainPerms = moduleName + ":" + businessName + ":view";
if (menuService.existsByPerms(mainPerms)) {
    log.info("菜单已存在，跳过: {}", mainPerms);
    return "菜单已存在，跳过导入";
}
```

---

## 总结

代码生成器是提升开发效率的利器，通过本文档介绍的最佳实践:

1. **规范表设计** - 遵循命名规范和字段标准
2. **合理配置** - 选择正确的模板和字段属性
3. **代码审查** - 生成后检查和优化
4. **模板定制** - 根据需求自定义模板
5. **持续优化** - 积累经验改进模板

建议在实际使用中:
- 建立项目代码生成规范文档
- 定期更新和优化模板
- 培训团队成员使用技巧
- 收集问题持续改进
