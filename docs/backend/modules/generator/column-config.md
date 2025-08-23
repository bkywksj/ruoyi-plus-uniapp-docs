# 字段配置详解

本章详细介绍代码生成器中字段配置的各个方面，包括字段基础属性、权限控制、显示配置、查询配置、验证规则等，帮助你精确控制生成代码的行为。

## 字段配置概览

### 1. 字段配置界面

在表配置页面的"字段配置"选项卡中，可以看到当前表的所有字段：

| 序号 | 字段名称 | 字段描述 | 字段类型 | Java类型 | 主键 | 自增 | 必填 | 插入 | 编辑 | 列表 | 查询 | 查询方式 | 显示类型 | 字典类型 | 操作 |
|------|----------|----------|----------|----------|------|------|------|------|------|------|------|----------|----------|----------|------|
| 1 | id | 用户ID | bigint | Long | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | = | 文本框 | | 编辑 |
| 2 | username | 用户名 | varchar(50) | String | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | LIKE | 文本框 | | 编辑 |
| 3 | status | 状态 | char(1) | String | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | = | 单选框 | sys_normal_disable | 编辑 |

### 2. 字段自动识别机制

系统在导入表时会自动分析字段特征并设置合适的配置：

```java
// 字段初始化流程
public static void initColumnField(GenTableColumn column, GenTable table) {
    // 1. 基础属性设置
    initBasicColumnProperties(column, table, columnName);
    
    // 2. 根据数据类型设置Java类型和HTML控件
    setColumnPropertiesByDataType(column, dataType);
    
    // 3. 设置默认权限
    setDefaultPermissions(column, columnName);
    
    // 4. 根据字段名设置特殊属性
    setSpecialPropertiesByColumnName(column, columnName);
    
    // 5. 处理默认值
    processColumnDefault(column);
}
```

## 字段基础属性

### 1. 字段基本信息

#### 1.1 字段标识信息
```typescript
interface ColumnBasicInfo {
  columnName: string;       // 数据库字段名
  columnComment: string;    // 字段注释
  columnType: string;       // 数据库字段类型
  javaField: string;        // Java属性名
  javaType: string;         // Java数据类型
  sort: number;             // 字段排序
}
```

**示例配置：**
```
字段名称: user_name
字段描述: 用户姓名  
字段类型: varchar(50)
Java属性: userName
Java类型: String
排序: 2
```

#### 1.2 字段约束信息
```typescript
interface ColumnConstraints {
  isPk: string;             // 是否主键 (1是 0否)
  isIncrement: string;      // 是否自增 (1是 0否)  
  isRequired: string;       // 是否必填 (1是 0否)
}
```

### 2. 数据类型映射

系统自动将数据库字段类型映射为Java类型：

#### 2.1 字符串类型映射
```java
// 字符串类型
Set<String> COLUMNTYPE_STR = Set.of(
    "char", "varchar", "enum", "set",
    "nchar", "nvarchar", "varchar2", "nvarchar2"
);
// 映射结果: String
```

#### 2.2 数值类型映射
```java
// 数值类型
Set<String> COLUMNTYPE_NUMBER = Set.of(
    "tinyint", "smallint", "mediumint", "int", "integer", "bigint",
    "float", "double", "decimal", "numeric", "real", "money"
);

// 映射规则:
// 1. 有小数位 -> BigDecimal
// 2. 长度 <= 10 -> Integer  
// 3. 长度 > 10 -> Long
```

#### 2.3 时间类型映射
```java
// 时间类型
Set<String> COLUMNTYPE_TIME = Set.of(
    "datetime", "time", "date", "timestamp", "year"
);
// 映射结果: Date
```

#### 2.4 文本类型映射
```java
// 大文本类型
Set<String> COLUMNTYPE_TEXT = Set.of(
    "tinytext", "text", "mediumtext", "longtext", "blob"
);
// 映射结果: String (HTML控件为文本域)
```

### 3. 默认值处理

系统会智能处理字段的默认值：

```java
// 默认值处理逻辑
private static void processColumnDefault(GenTableColumn column) {
    String defaultValue = column.getColumnDefault();
    String javaType = column.getJavaType();
    
    switch (javaType) {
        case "String":
            // 字符串加引号: 'default_value'
            processedValue = "'" + defaultValue.replace("'", "\\'") + "'";
            break;
            
        case "Integer":
        case "Long":
        case "BigDecimal":
            // 数值类型直接使用: 100
            processedValue = isValidNumber(defaultValue) ? defaultValue : "undefined";
            break;
            
        case "Boolean":
            // 布尔类型转换: true/false
            processedValue = convertToBoolean(defaultValue);
            break;
            
        case "Date":
            // 日期类型特殊处理
            processedValue = isSqlFunction(defaultValue) ? "undefined" : "'" + defaultValue + "'";
            break;
    }
}
```

## 字段权限控制

### 1. CRUD权限配置

每个字段都可以单独控制其在增删改查操作中的行为：

```typescript
interface ColumnPermissions {
  isInsert: string;         // 是否用于插入 (1是 0否)
  isEdit: string;           // 是否用于编辑 (1是 0否)
  isList: string;           // 是否在列表显示 (1是 0否)
  isQuery: string;          // 是否用于查询 (1是 0否)
}
```

### 2. 默认权限规则

系统会根据字段名自动设置默认权限：

#### 2.1 不允许新增的字段
```java
Set<String> COLUMNNAME_NOT_ADD = Set.of(
    "create_dept",    // 创建部门
    "create_by",      // 创建者
    "create_time",    // 创建时间
    "is_deleted",     // 删除标识
    "update_by",      // 更新者
    "update_time",    // 更新时间
    "version",        // 版本号
    "tenant_id"       // 租户ID
);
```

#### 2.2 不允许编辑的字段
```java
Set<String> COLUMNNAME_NOT_EDIT = Set.of(
    "create_dept", "create_by", "create_time", "is_deleted",
    "update_by", "update_time", "version", "tenant_id"
);
```

#### 2.3 不在列表显示的字段
```java
Set<String> COLUMNNAME_NOT_LIST = Set.of(
    "create_dept", "create_by", "is_deleted",
    "update_by", "version", "tenant_id"
);
```

#### 2.4 不用于查询的字段
```java
Set<String> COLUMNNAME_NOT_QUERY = Set.of(
    "create_dept", "create_by", "is_deleted", "update_by",
    "update_time", "remark", "version", "tenant_id"
);
```

### 3. 权限配置示例

**主键字段配置：**
```
字段: id
插入: ✗ (主键通常自动生成)
编辑: ✗ (主键不允许修改)
列表: ✓ (显示在列表中)
查询: ✓ (支持按ID查询)
```

**业务字段配置：**
```
字段: username
插入: ✓ (新增时必须填写)
编辑: ✓ (支持修改)
列表: ✓ (显示在列表中)
查询: ✓ (支持按用户名查询)
```

**系统字段配置：**
```
字段: create_time
插入: ✗ (系统自动设置)
编辑: ✗ (不允许修改)
列表: ✓ (显示创建时间)
查询: ✓ (支持时间范围查询)
```

## 查询配置

### 1. 查询方式类型

系统支持多种查询方式：

```typescript
type QueryType = 
  | 'EQ'        // 等于查询 (=)
  | 'NE'        // 不等于查询 (!=)  
  | 'GT'        // 大于查询 (>)
  | 'GTE'       // 大于等于查询 (>=)
  | 'LT'        // 小于查询 (<)
  | 'LTE'       // 小于等于查询 (<=)
  | 'LIKE'      // 模糊查询 (LIKE)
  | 'BETWEEN';  // 范围查询 (BETWEEN)
```

### 2. 查询方式应用场景

#### 2.1 精确查询 (EQ)
**适用字段：**
- 状态字段：`status`
- 类型字段：`type`
- 枚举字段：`gender`
- ID字段：`user_id`

**生成代码：**
```java
lqw.eq(DemoUser::getStatus, bo.getStatus());
```

#### 2.2 模糊查询 (LIKE)
**适用字段：**
- 名称字段：`name`, `title`, `username`
- 描述字段：`description`, `content`
- 地址字段：`address`

**生成代码：**
```java
lqw.like(DemoUser::getUsername, bo.getUsername());
```

#### 2.3 范围查询 (BETWEEN)
**适用字段：**
- 时间字段：`create_time`, `update_time`
- 数值字段：`price`, `amount`, `age`
- 日期字段：`birth_date`

**生成代码：**
```java
lqw.between(DemoUser::getCreateTime, 
    params.get("beginCreateTime"), 
    params.get("endCreateTime"));
```

#### 2.4 比较查询 (GT/LT/GTE/LTE)
**适用字段：**
- 数值字段：`age`, `score`, `salary`
- 时间字段：`deadline`, `expire_time`
- 排序字段：`sort_order`

**生成代码：**
```java
lqw.gt(DemoUser::getAge, bo.getAge());
lqw.le(DemoUser::getCreateTime, bo.getCreateTime());
```

### 3. 智能查询推断

系统会根据字段名自动推断最适合的查询方式：

#### 3.1 按字段名后缀推断
```java
// 名称字段 -> 模糊查询
Set<String> NAME_FIELD_SUFFIXES = Set.of("name");

// 时间字段 -> 范围查询  
Set<String> COLUMNTYPE_TIME = Set.of("datetime", "time", "date", "timestamp");

// 状态字段 -> 精确查询
Set<String> STATUS_FIELD_SUFFIXES = Set.of("status");
```

#### 3.2 推断规则示例
```java
// 字段名包含"name" -> LIKE查询
if (isNameField(columnName)) {
    column.setQueryType(GenConstants.QUERY_LIKE);
}

// 时间类型字段 -> BETWEEN查询
if (isTimeType(dataType)) {
    column.setQueryType(GenConstants.BETWEEN);
}

// 其他字段 -> EQ查询（默认）
```

## HTML控件配置

### 1. 控件类型说明

```typescript
type HtmlType =
  | 'input'         // 文本框
  | 'textarea'      // 文本域
  | 'select'        // 下拉框
  | 'radio'         // 单选框
  | 'checkbox'      // 复选框
  | 'datetime'      // 日期时间选择器
  | 'imageUpload'   // 图片上传
  | 'fileUpload'    // 文件上传
  | 'editor';       // 富文本编辑器
```

### 2. 控件选择规则

#### 2.1 文本框 (input)
**适用场景：**
- 短文本字段 (长度 < 500)
- 数值字段
- 一般业务字段

**字段示例：**
```
username (用户名)
email (邮箱)
phone (手机号)
age (年龄)
```

#### 2.2 文本域 (textarea)
**适用场景：**
- 长文本字段 (长度 >= 500)
- 大文本类型 (TEXT, LONGTEXT)
- 备注描述字段

**字段示例：**
```
remark (备注)
description (描述)
content (内容)
address (详细地址)
```

#### 2.3 下拉框 (select)
**适用场景：**
- 配置了字典的字段
- 类型选择字段
- 性别字段

**字段示例：**
```
type (类型) - 字典配置
gender (性别) - 字典配置  
dept_id (部门) - 下拉选择
```

#### 2.4 单选框 (radio)
**适用场景：**
- 状态字段
- 布尔类型字段
- 选项较少的枚举

**字段示例：**
```
status (状态) - 启用/停用
gender (性别) - 男/女/未知
is_default (是否默认) - 是/否
```

#### 2.5 复选框 (checkbox)
**适用场景：**
- 多选字段
- 权限选择
- 标签选择

**字段示例：**
```
hobbies (爱好) - 多选
permissions (权限) - 多选
tags (标签) - 多选
```

#### 2.6 日期时间选择器 (datetime)
**适用场景：**
- 时间类型字段
- 日期字段

**字段示例：**
```
create_time (创建时间)
birth_date (出生日期)
deadline (截止时间)
```

#### 2.7 图片上传 (imageUpload)
**适用场景：**
- 图片字段

**字段识别规则：**
```java
// 以这些后缀结尾的字段自动识别为图片上传
Set<String> IMAGE_FIELD_SUFFIXES = Set.of("image", "img", "avatar");

// 示例字段
user_avatar (用户头像)
product_image (商品图片)
banner_img (轮播图)
```

#### 2.8 文件上传 (fileUpload)
**适用场景：**
- 文件字段

**字段识别规则：**
```java
// 以file结尾的字段自动识别为文件上传
Set<String> FILE_FIELD_SUFFIXES = Set.of("file");

// 示例字段
attachment_file (附件文件)
document_file (文档文件)
```

#### 2.9 富文本编辑器 (editor)
**适用场景：**
- 需要富文本编辑的内容字段

**字段识别规则：**
```java
// 以这些后缀结尾的字段自动识别为富文本编辑器
Set<String> CONTENT_FIELD_SUFFIXES = Set.of("content", "detail");

// 示例字段
article_content (文章内容)
product_detail (商品详情)
```

### 3. 智能控件推断

系统会根据多个维度自动推断最合适的HTML控件：

```java
public static void setSpecialPropertiesByColumnName(GenTableColumn column, String columnName) {
    // 1. 备注字段 -> 文本域
    if ("remark".equals(columnName)) {
        column.setHtmlType("textarea");
        return;
    }
    
    // 2. 状态字段 -> 单选框 + 字典
    if ("status".equals(columnName)) {
        column.setHtmlType("radio");
        column.setDictType("sys_normal_disable");
        return;
    }
    
    // 3. 布尔字段 -> 下拉框 + 布尔字典
    if (isBooleanField(column, columnName)) {
        setBooleanFieldProperties(column);
    }
    
    // 4. 图片字段 -> 图片上传
    else if (isImageField(columnName)) {
        column.setHtmlType("imageUpload");
    }
    
    // 5. 文件字段 -> 文件上传
    else if (isFileField(columnName)) {
        column.setHtmlType("fileUpload");
    }
    
    // 6. 内容字段 -> 富文本编辑器
    else if (isContentField(columnName)) {
        column.setHtmlType("editor");
    }
}
```

## 字典配置

### 1. 字典类型

字典用于为下拉框、单选框、复选框等控件提供选项数据：

```typescript
interface DictConfig {
  dictType: string;         // 字典类型标识
  dictLabel: string;        // 字典标签
  dictValue: string;        // 字典值
  cssClass: string;         // 样式类名
  listClass: string;        // 列表样式
}
```

### 2. 系统内置字典

#### 2.1 通用状态字典
```typescript
// sys_normal_disable - 通用状态
const normalDisableDict = [
  { label: '正常', value: '0', cssClass: 'primary' },
  { label: '停用', value: '1', cssClass: 'danger' }
];

// sys_show_hide - 显示隐藏
const showHideDict = [
  { label: '显示', value: '0' },
  { label: '隐藏', value: '1' }
];
```

#### 2.2 性别字典
```typescript
// sys_user_sex - 用户性别
const userSexDict = [
  { label: '男', value: '0' },
  { label: '女', value: '1' },
  { label: '未知', value: '2' }
];
```

#### 2.3 布尔字典
```typescript
// sys_yes_no - 是否
const yesNoDict = [
  { label: '是', value: 'Y' },
  { label: '否', value: 'N' }
];
```

### 3. 字典自动配置

系统会根据字段特征自动配置字典：

#### 3.1 状态字段自动配置
```java
// status字段自动配置启用停用字典
if ("status".equals(columnName)) {
    column.setHtmlType("radio");
    column.setDictType("sys_normal_disable");
}
```

#### 3.2 布尔字段自动配置
```java
// 布尔字段自动配置是否字典
if (isBooleanField(column, columnName)) {
    column.setHtmlType("select");
    if ("审核状态".equals(column.getColumnComment())) {
        column.setDictType("sys_audit_status");
    } else {
        column.setDictType("sys_yes_no");
    }
}
```

#### 3.3 性别字段自动配置
```java
// gender字段自动配置性别字典
if (isGenderField(columnName)) {
    column.setHtmlType("select");
    column.setDictType("sys_user_sex");
}
```

### 4. 自定义字典配置

#### 4.1 创建自定义字典
```sql
-- 创建字典类型
INSERT INTO sys_dict_type (dict_id, dict_name, dict_type, status, remark) 
VALUES (100, '用户等级', 'user_level', '0', '用户等级字典');

-- 创建字典数据
INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, remark) VALUES
(1, 1, 'VIP', '1', 'user_level', 'warning', 'warning', 'N', '0', 'VIP用户'),
(2, 2, '普通', '0', 'user_level', 'info', 'info', 'Y', '0', '普通用户'),
(3, 3, '黑名单', '-1', 'user_level', 'danger', 'danger', 'N', '0', '黑名单用户');
```

#### 4.2 在字段中配置自定义字典
```
字段名: user_level
字段描述: 用户等级
显示类型: 下拉框
字典类型: user_level
```

## 验证规则配置

### 1. 必填验证

```typescript
interface RequiredValidation {
  isRequired: string;       // 是否必填 (1是 0否)
  message: string;          // 验证失败消息
  trigger: string;          // 触发时机 (blur/change)
}
```

**生成的验证规则：**
```typescript
// 字符串字段
username: [
  { required: true, message: '用户名不能为空', trigger: 'blur' }
],

// 下拉框字段  
status: [
  { required: true, message: '状态不能为空', trigger: 'change' }
]
```

### 2. 长度验证

系统会根据数据库字段长度自动生成长度验证：

```java
// varchar(50) -> 最大长度50
if (columnLength > 0) {
    rules.add("{ max: " + columnLength + ", message: '长度不能超过" + columnLength + "个字符', trigger: 'blur' }");
}
```

### 3. 类型验证

根据字段类型自动生成对应的验证规则：

```typescript
// 数值验证
age: [
  { type: 'number', message: '年龄必须为数字', trigger: 'blur' }
],

// 邮箱验证
email: [
  { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
],

// 手机号验证  
phone: [
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
]
```

### 4. 自定义验证

可以在生成代码后添加自定义验证规则：

```typescript
// 自定义密码强度验证
const validatePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'));
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    callback(new Error('密码必须包含大小写字母和数字'));
  } else {
    callback();
  }
};

// 应用自定义验证
password: [
  { required: true, validator: validatePassword, trigger: 'blur' }
]
```

## 字段配置最佳实践

### 1. 命名规范

#### 1.1 数据库字段命名
```sql
-- 推荐使用下划线命名法
user_name        -- 用户名
create_time      -- 创建时间
is_enabled       -- 是否启用
dept_id          -- 部门ID
```

#### 1.2 Java属性命名
```java
// 自动转换为驼峰命名法
private String userName;      // user_name
private Date createTime;      // create_time  
private Boolean isEnabled;    // is_enabled
private Long deptId;         // dept_id
```

### 2. 字段注释规范

```sql
-- 详细的字段注释有助于生成更好的代码
user_name varchar(50) COMMENT '用户姓名',
user_status char(1) COMMENT '用户状态（0正常 1停用）',
gender char(1) COMMENT '性别（0男 1女 2未知）',
is_admin char(1) COMMENT '是否管理员（Y是 N否）'
```

### 3. 权限配置策略

#### 3.1 主键字段
```
插入: ✗ (通常自动生成)
编辑: ✗ (主键不可修改)
列表: ✓ (用于标识记录)
查询: ✓ (按ID精确查询)
```

#### 3.2 业务字段
```
插入: ✓ (业务数据需要输入)
编辑: ✓ (允许修改)
列表: ✓ (在列表中显示)
查询: ✓ (支持搜索)
```

#### 3.3 系统字段
```
插入: ✗ (系统自动维护)
编辑: ✗ (不允许手动修改)
列表: 根据需要 (创建时间显示，更新者不显示)
查询: 根据需要 (时间支持范围查询)
```

### 4. 显示类型选择

#### 4.1 文本类字段
```
短文本 (< 50字符) -> 文本框
中文本 (50-500字符) -> 文本框  
长文本 (> 500字符) -> 文本域
富文本内容 -> 富文本编辑器
```

#### 4.2 选择类字段
```
选项较少 (< 5个) -> 单选框
选项较多 (>= 5个) -> 下拉框
多选场景 -> 复选框
```

#### 4.3 特殊类字段
```
图片字段 -> 图片上传
文件字段 -> 文件上传  
时间字段 -> 日期时间选择器
金额字段 -> 数字输入框
```

### 5. 查询配置建议

#### 5.1 常用查询方式
```
名称类字段 -> LIKE模糊查询
状态类字段 -> EQ精确查询
时间类字段 -> BETWEEN范围查询
数值类字段 -> EQ/GT/LT按需选择
```

#### 5.2 性能考虑
```
- 避免在大字段上设置模糊查询
- 索引字段优先使用精确查询  
- 合理设置查询字段数量
- 考虑查询频率和性能平衡
```

通过本章的学习，你已经全面掌握了字段配置的各个方面，可以根据具体业务需求精确控制生成代码的行为，提升开发效率和代码质量。
