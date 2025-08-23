# 表导入与配置

本章详细介绍如何导入数据库表到代码生成器中，以及如何对导入的表进行各项配置，包括基础信息、生成选项、关联关系等。

## 表导入流程

### 1. 表导入入口

在代码生成器主页面，有两种方式导入数据库表：

1. **导入按钮**：点击页面上方的"导入"按钮
2. **快捷导入**：在数据库表页签中直接选择表进行导入

### 2. 数据库表扫描

系统会自动扫描指定数据源中的所有数据表，并显示以下信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| 表名 | 数据库中的表名 | `demo_user` |
| 表注释 | 数据库表的注释信息 | `演示用户表` |
| 创建时间 | 表的创建时间 | `2024-01-01 10:00:00` |
| 更新时间 | 表的最后修改时间 | `2024-01-02 15:30:00` |

### 3. 表过滤规则

系统会自动过滤以下类型的表：

#### 3.1 系统表过滤
```java
// 默认忽略的表前缀
private static final String[] TABLE_IGNORE = {
    "sj_",     // 数据采集相关表
    "flow_",   // 工作流相关表  
    "gen_"     // 代码生成相关表
};
```

#### 3.2 已导入表过滤
- 已经导入到代码生成器的表不会重复显示
- 避免重复导入造成配置覆盖

#### 3.3 搜索过滤
支持按表名和表注释进行模糊搜索：
```
搜索条件：user
匹配结果：
- demo_user (演示用户表)
- sys_user (系统用户表)  
- user_info (用户信息表)
```

### 4. 批量导入

可以同时选择多个表进行批量导入：

```
1. 勾选要导入的表（支持全选/反选）
2. 点击"确定"按钮
3. 系统自动分析表结构并生成基础配置
4. 导入完成后跳转到配置列表
```

## 表配置管理

### 1. 配置列表

导入成功的表会显示在代码生成列表中：

| 表名 | 表注释 | 实体类名 | 创建时间 | 更新时间 | 操作 |
|------|--------|----------|----------|----------|------|
| demo_user | 演示用户表 | DemoUser | 2024-01-01 | 2024-01-02 | 预览/编辑/删除/生成代码 |
| sys_menu | 菜单表 | SysMenu | 2024-01-01 | 2024-01-01 | 预览/编辑/删除/生成代码 |

### 2. 表搜索功能

支持多种搜索方式：

```typescript
interface SearchParams {
  tableName: string;      // 按表名搜索
  tableComment: string;   // 按表注释搜索  
  dataName: string;       // 按数据源搜索
  searchValue: string;    // 全局搜索（表名+注释+数据源+表ID）
}
```

**搜索示例：**
```
全局搜索："用户" 
匹配结果：
- demo_user (演示用户表)
- sys_user (系统用户表)
- user_profile (用户档案表)
```

### 3. 批量操作

支持的批量操作包括：

#### 3.1 批量删除
```
1. 勾选要删除的表
2. 点击"删除"按钮
3. 确认删除（会同时删除表和字段配置）
```

#### 3.2 批量生成代码
```
1. 勾选要生成代码的表
2. 点击"生成代码"按钮
3. 下载包含所有表代码的ZIP包
```

#### 3.3 批量导出配置
```
1. 勾选要导出的表
2. 点击"导出"按钮
3. 下载表配置的Excel文件
```

## 表基础配置

### 1. 基本信息配置

点击"编辑"按钮进入表配置页面，首先是基本信息：

```typescript
interface BasicInfo {
  tableName: string;        // 表名（只读）
  tableComment: string;     // 表注释
  className: string;        // 实体类名
  functionAuthor: string;   // 作者
}
```

**配置示例：**
```
表名: demo_user
表描述: 演示用户管理
实体类名称: DemoUser
作者: 抓蛙师
```

**命名规则说明：**
- **表名**：数据库实际表名，不可修改
- **表描述**：用于生成注释和页面标题，建议简洁明了
- **实体类名**：遵循帕斯卡命名法，如 `DemoUser`、`SysMenu`
- **作者**：生成代码的作者信息，用于类注释

### 2. 生成信息配置

```typescript
interface GenerateInfo {
  packageName: string;      // 生成包路径
  moduleName: string;       // 生成模块名
  businessName: string;     // 生成业务名
  functionName: string;     // 生成功能名
  tplCategory: string;      // 模板类型
}
```

**配置示例：**
```
生成包路径: plus.ruoyi.business.demo
生成模块名: demo
生成业务名: demoUser
生成功能名: 演示用户
模板类型: 单表（增删改查）
```

**字段说明：**
- **生成包路径**：Java代码的包路径，影响目录结构
- **生成模块名**：模块名称，用于URL路径和权限标识
- **生成业务名**：业务名称，用于类名和方法名生成
- **生成功能名**：功能描述，用于页面标题和注释
- **模板类型**：选择生成模板（单表/树表/主子表）

### 3. 其他选项配置

```typescript
interface OtherOptions {
  genType: string;          // 生成方式
  genPath: string;          // 生成路径
  parentMenuId: number;     // 上级菜单
  remark: string;           // 备注说明
}
```

**配置选项：**

#### 3.1 生成方式
```
选项1: zip压缩包 - 生成代码打包下载
选项2: 自定义路径 - 生成到指定目录
```

#### 3.2 生成路径
```
当选择"自定义路径"时需要指定：
- 绝对路径: /opt/code/generate/
- 相对路径: ./generate/
- 项目路径: / (生成到项目src目录)
```

#### 3.3 上级菜单选择
```
系统工具 (ID: 3)
├── 代码生成 (ID: 116)
├── 系统接口 (ID: 3)
└── 演示模块 (ID: 自动生成)
    └── 演示用户 (ID: 自动生成)
```

## 表关联配置

### 1. 树表配置

当模板类型选择"树表"时，需要配置树形结构字段：

```typescript
interface TreeConfig {
  treeCode: string;         // 树编码字段
  treeParentCode: string;   // 树父编码字段
  treeName: string;         // 树名称字段
}
```

**配置示例（部门表）：**
```
树编码字段: deptId
树父编码字段: parentId  
树名称字段: deptName
```

**常见树表场景：**
- **组织架构**：`dept_id`, `parent_id`, `dept_name`
- **菜单管理**：`menu_id`, `parent_id`, `menu_name`
- **地区管理**：`area_id`, `parent_id`, `area_name`
- **分类管理**：`category_id`, `parent_id`, `category_name`

### 2. 主子表配置

当模板类型选择"主子表"时，需要配置关联关系：

```typescript
interface SubTableConfig {
  subTableName: string;     // 子表名称
  subTableFkName: string;   // 子表外键字段名
}
```

**配置示例（订单-明细）：**
```
子表名称: order_detail
子表外键字段名: order_id
```

**主子表使用场景：**
- **订单管理**：`order` ← `order_detail`
- **合同管理**：`contract` ← `contract_detail`
- **采购管理**：`purchase` ← `purchase_item`
- **销售管理**：`sale_order` ← `sale_order_item`

**注意事项：**
1. 子表必须先导入到代码生成器
2. 子表外键字段必须存在
3. 外键字段类型要与主表主键匹配

## 表配置验证

### 1. 基础验证规则

系统会自动验证配置的有效性：

```typescript
interface ValidationRules {
  tableName: '表名称不能为空';
  tableComment: '表描述不能为空';
  className: '实体类名称不能为空';
  packageName: '生成包路径不能为空';
  moduleName: '生成模块名不能为空';
  businessName: '生成业务名不能为空';
  functionName: '生成功能名不能为空';
  functionAuthor: '作者不能为空';
}
```

### 2. 树表特殊验证

```typescript
interface TreeValidation {
  treeCode: '树编码字段不能为空';
  treeParentCode: '树父编码字段不能为空';
  treeName: '树名称字段不能为空';
  fieldExists: '指定字段在表中必须存在';
}
```

### 3. 主子表特殊验证

```typescript
interface SubTableValidation {
  subTableName: '关联子表的表名不能为空';
  subTableFkName: '子表关联的外键名不能为空';
  subTableExists: '请先导入子表进行配置';
  foreignKeyExists: '外键字段在子表中必须存在';
}
```

## 表同步功能

### 1. 数据库结构同步

当数据库表结构发生变化时，可以使用同步功能更新配置：

```
操作步骤：
1. 在表列表中点击"同步"按钮
2. 系统对比数据库当前结构与已配置结构
3. 自动新增新字段配置
4. 保留已有字段的自定义配置
5. 删除数据库中不存在的字段配置
```

### 2. 同步策略

#### 2.1 新增字段处理
```java
// 新字段会自动初始化默认配置
GenUtils.initColumnField(column, table);

// 保留的配置包括：
// - 基本字段信息（名称、类型、注释等）
// - 默认的增删改查权限
// - 自动推断的HTML控件类型
// - 智能识别的字典类型
```

#### 2.2 已有字段保留配置
```java
// 保留用户的自定义配置：
column.setIsInsert(prevColumn.getIsInsert());     // 新增权限
column.setIsEdit(prevColumn.getIsEdit());         // 编辑权限  
column.setIsList(prevColumn.getIsList());         // 列表显示
column.setIsQuery(prevColumn.getIsQuery());       // 查询权限
column.setQueryType(prevColumn.getQueryType());   // 查询方式
column.setIsRequired(prevColumn.getIsRequired()); // 必填验证
column.setHtmlType(prevColumn.getHtmlType());     // 显示类型
column.setDictType(prevColumn.getDictType());     // 字典类型
```

#### 2.3 删除字段处理
```java
// 自动删除数据库中不存在的字段配置
List<GenTableColumn> delColumns = StreamUtils.filter(
    tableColumns, 
    column -> !dbTableColumnNames.contains(column.getColumnName())
);
```

### 3. 同步注意事项

1. **备份配置**：同步前建议导出当前配置作为备份
2. **权限保留**：已配置的字段权限不会被重置
3. **字典关联**：已设置的字典类型会被保留
4. **验证规则**：自定义的验证规则会被保留
5. **显示配置**：HTML控件类型等显示配置会被保留

## 表配置导入导出

### 1. 配置导出

可以将表配置导出为Excel文件，便于备份和迁移：

```
导出内容包括：
- 表基本信息
- 字段详细配置
- 权限设置
- 字典配置
- 显示配置
```

### 2. 配置导入

支持从Excel文件导入表配置：

```
导入步骤：
1. 下载配置模板
2. 填写表和字段配置信息
3. 上传Excel文件
4. 系统验证配置有效性
5. 导入成功后可直接生成代码
```

### 3. 配置模板格式

#### 3.1 表信息Sheet
| 表名 | 表注释 | 实体类名 | 作者 | 包路径 | 模块名 | 业务名 | 功能名 | 模板类型 |
|------|--------|----------|------|--------|--------|--------|--------|----------|
| demo_user | 演示用户表 | DemoUser | 抓蛙师 | plus.ruoyi.demo | demo | demoUser | 演示用户 | crud |

#### 3.2 字段信息Sheet
| 字段名 | 字段注释 | 字段类型 | Java类型 | 是否主键 | 是否必填 | 是否插入 | 是否编辑 | 是否列表 | 是否查询 | 查询方式 | 显示类型 | 字典类型 |
|--------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| id | 用户ID | bigint | Long | 1 | 1 | 0 | 0 | 1 | 1 | EQ | input | |
| username | 用户名 | varchar | String | 0 | 1 | 1 | 1 | 1 | 1 | LIKE | input | |

通过本章的学习，你已经掌握了表导入与配置的完整流程，包括导入、配置、验证、同步等各个环节。接下来可以进一步学习字段配置的详细说明。
