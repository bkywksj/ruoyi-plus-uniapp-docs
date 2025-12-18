# 代码生成器使用手册

代码生成器是快速开发CRUD功能的核心工具，支持单表、树表、主子表三种模板，可生成完整的前后端代码。

## 功能概述

### 核心功能

| 功能分类 | 功能项 | 说明 |
|---------|-------|------|
| 表管理 | 表导入 | 从数据库导入表结构 |
| | 表编辑 | 配置表的生成选项 |
| | 表同步 | 同步数据库结构变更 |
| | 表删除 | 删除生成配置 |
| 代码生成 | 单表生成 | 生成单个表的CRUD代码 |
| | 批量生成 | 一次生成多个表的代码 |
| | 预览代码 | 生成前预览代码内容 |
| | 下载/路径生成 | ZIP下载或直接生成到项目 |

### 支持的模板类型

**1. 单表CRUD模板**

适用于标准增删改查业务：用户管理、商品管理、订单管理等。

生成内容：列表查询(分页+搜索)、新增/编辑/删除、导入导出Excel。

**2. 树形结构模板**

适用于层级数据管理：部门组织、菜单管理、分类管理等。

生成内容：树形列表展示、节点增删改查、树形递归。

**3. 主子表模板**

适用于一对多关系：订单-订单明细、合同-合同条款等。

生成内容：主子表关联查询、事务保存、级联删除。

### 支持的数据库

| 数据库 | 版本要求 | 驱动类名 |
|--------|---------|----------|
| MySQL | 5.7+ / 8.0+ | `com.mysql.cj.jdbc.Driver` |
| PostgreSQL | 12+ | `org.postgresql.Driver` |
| Oracle | 11g+ / 12c+ | `oracle.jdbc.driver.OracleDriver` |
| SQL Server | 2012+ | `com.microsoft.sqlserver.jdbc.SQLServerDriver` |
| DM (达梦) | 8+ | `dm.jdbc.driver.DmDriver` |

## 操作指南

### 访问代码生成器

- **菜单路径**: 系统工具 → 代码生成
- **前端路由**: `/tool/generator`
- **后端API**: `/tool/gen`

### 表导入

**操作步骤:**

1. 点击工具栏 **导入** 按钮
2. 选择数据源（master/slave/oracle等）
3. 搜索并勾选需要导入的表
4. 点击确定完成导入

**自动配置:**

系统会自动完成以下配置：
- 去除表前缀生成实体类名（`sys_user` → `SysUser`）
- 识别主键字段设为不可编辑
- 排除公共字段（create_time/update_time等）
- 状态字段自动设置为单选框

**导入过滤规则:**

- 已导入的表不会重复显示
- 系统表前缀自动过滤：`sj_`、`flow_`、`gen_`

### 表配置

#### 基本信息配置

| 配置项 | 说明 | 示例 |
|-------|------|------|
| 表名称 | 数据库表名(只读) | `sys_user` |
| 表描述 | 表的业务描述 | 用户信息表 |
| 实体类名称 | 生成的Java实体类名 | `SysUser` |
| 作者 | 代码作者信息 | 抓蛙师 |
| 生成模板 | 单表/树表/主子表 | 单表(增删改查) |

#### 生成信息配置

| 配置项 | 说明 | 示例 |
|-------|------|------|
| 生成包路径 | Java代码包路径 | `plus.ruoyi.business.system` |
| 生成模块名 | 模块名称 | `system` |
| 生成业务名 | 业务名(驼峰命名) | `sysUser` |
| 生成功能名 | 中文功能名 | 用户管理 |
| 上级菜单 | 菜单挂载位置 | 系统管理 |
| 生成方式 | zip压缩包/自定义路径 | zip压缩包 |

#### 字段配置

| 配置项 | 说明 |
|-------|------|
| 字段名 | Java属性名(驼峰命名) |
| 字段类型 | Java数据类型 |
| 字段标签 | 前端表单显示的标签 |
| 查询方式 | EQ/NE/GT/GE/LT/LE/LIKE/BETWEEN |
| 显示类型 | 文本框/下拉框/单选框/日期控件等 |
| 字典类型 | 关联的字典类型 |
| 权限设置 | 插入/编辑/列表/查询 |

**查询方式说明:**

| 方式 | SQL条件 | 适用场景 |
|-----|---------|---------|
| EQ | `= value` | 状态、类型等精确匹配 |
| LIKE | `LIKE '%value%'` | 名称、标题等模糊搜索 |
| BETWEEN | `BETWEEN v1 AND v2` | 日期、金额等范围查询 |

**显示类型说明:**

| 类型 | 组件 | 适用场景 |
|-----|------|---------|
| 文本框 | `<el-input>` | 普通文本输入 |
| 文本域 | `<el-input type="textarea">` | 长文本输入 |
| 下拉框 | `<el-select>` | 选项较少时 |
| 单选框 | `<el-radio-group>` | 状态、性别等 |
| 日期控件 | `<el-date-picker>` | 日期选择 |
| 图片上传 | `<image-upload>` | 头像、图片 |
| 富文本 | `<editor>` | 内容编辑 |

### 树表配置

选择树表模板后，需要配置以下字段：

| 配置项 | 说明 | 示例 |
|-------|------|------|
| 树编码字段 | 树节点唯一标识 | `id` |
| 树父编码字段 | 父节点标识 | `parent_id` |
| 树名称字段 | 节点显示名称 | `dept_name` |

### 主子表配置

选择主子表模板后，需要配置：

| 配置项 | 说明 | 示例 |
|-------|------|------|
| 子表名称 | 关联的子表 | `order_item` |
| 子表外键 | 子表关联主表的字段 | `order_id` |

## 代码生成

### 预览代码

选择表后点击 **预览** 按钮，可查看所有生成的文件内容：

- **Java代码**: Entity、Vo、Bo、Controller、Service、ServiceImpl、Mapper、Mapper.xml
- **前端代码**: Api.ts、Types.ts、页面组件.vue
- **SQL脚本**: 菜单SQL

### 生成方式

**ZIP压缩包方式:**

1. 选择表后点击 **生成代码**
2. 下载生成的 `ruoyi.zip`
3. 解压后将代码复制到项目对应目录

**自定义路径方式:**

1. 配置生成路径（项目根目录）
2. 勾选"自动导入菜单"（可选）
3. 点击生成，代码直接写入项目

### 代码集成

**后端集成:**

```bash
# 复制Java代码
cp -r ruoyi/main/java/* src/main/java/
# 复制Mapper XML
cp -r ruoyi/main/resources/* src/main/resources/
```

**前端集成:**

```bash
# 复制API和页面
cp -r ruoyi/vue/api/* src/api/
cp -r ruoyi/vue/views/* src/views/
```

**执行菜单SQL:**

```sql
SOURCE demoUserMenu.sql;
```

**配置路由并重启项目。**

## 生成代码详解

### 实体类 (Entity)

```java
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("demo_user")
public class DemoUser extends BaseEntity {

    @TableId(value = "id")
    private Long id;

    private String username;
    private String nickname;
    private String status;
}
```

**特点:** 继承BaseEntity、使用Lombok、MyBatis-Plus注解。

### 视图对象 (VO)

```java
@Data
@ExcelIgnoreUnannotated
public class DemoUserVo implements Serializable {

    @ExcelProperty(value = "用户ID")
    private Long id;

    @ExcelProperty(value = "状态", converter = ExcelDictConvert.class)
    @ExcelDictFormat(dictType = "sys_normal_disable")
    private String status;
}
```

**特点:** 用于数据展示和Excel导出，支持字典转换。

### 业务对象 (BO)

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class DemoUserBo extends BaseEntity {

    private Long id;

    @NotBlank(message = "用户名不能为空")
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;
}
```

**特点:** 用于接收参数，包含数据校验注解。

### 控制器 (Controller)

```java
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/demo/demoUser")
public class DemoUserController {

    private final IDemoUserService demoUserService;

    @SaCheckPermission("demo:demoUser:query")
    @GetMapping("/pageDemoUsers")
    public R<PageResult<DemoUserVo>> pageDemoUsers(DemoUserBo bo, PageQuery pageQuery) {
        return R.ok(demoUserService.pageDemoUsers(bo, pageQuery));
    }

    @SaCheckPermission("demo:demoUser:add")
    @Log(title = "演示用户", operType = DictOperType.INSERT)
    @PostMapping("/addDemoUser")
    public R<Void> addDemoUser(@Validated @RequestBody DemoUserBo bo) {
        return R.bool(demoUserService.save(bo));
    }
}
```

**特点:** Sa-Token权限控制、操作日志、参数校验。

### 服务层 (Service)

```java
@Service
@RequiredArgsConstructor
public class DemoUserServiceImpl implements IDemoUserService {

    private final DemoUserMapper baseMapper;

    @Override
    public PageResult<DemoUserVo> pageDemoUsers(DemoUserBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<DemoUser> wrapper = buildQueryWrapper(bo);
        Page<DemoUserVo> page = baseMapper.selectVoPage(pageQuery.build(), wrapper);
        return PageResult.build(page);
    }

    private LambdaQueryWrapper<DemoUser> buildQueryWrapper(DemoUserBo bo) {
        return Wrappers.<DemoUser>lambdaQuery()
            .like(StringUtils.isNotBlank(bo.getUsername()), DemoUser::getUsername, bo.getUsername())
            .eq(StringUtils.isNotBlank(bo.getStatus()), DemoUser::getStatus, bo.getStatus())
            .orderByDesc(DemoUser::getCreateTime);
    }
}
```

### 前端页面

```vue
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="queryParams.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="状态" prop="status">
        <template #default="{ row }">
          <dict-tag :options="sys_normal_disable" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button link @click="handleUpdate(row)">修改</el-button>
          <el-button link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
```

## 实际案例

### 案例1: 生成单表用户管理

**表结构:**

```sql
CREATE TABLE `demo_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `gender` char(1) DEFAULT '0' COMMENT '性别(0男 1女)',
  `status` char(1) DEFAULT '1' COMMENT '状态(0停用 1正常)',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) COMMENT='演示用户表';
```

**生成配置:**

```
生成模板: 单表(增删改查)
生成包路径: plus.ruoyi.business.demo
生成模块名: demo
生成业务名: demoUser
生成功能名: 演示用户
```

**字段配置重点:**

| 字段 | 查询方式 | 显示类型 | 字典类型 |
|-----|---------|---------|---------|
| username | LIKE | 文本框 | - |
| gender | EQ | 单选框 | sys_user_sex |
| status | EQ | 单选框 | sys_normal_disable |
| create_time | BETWEEN | 日期控件 | - |

### 案例2: 生成树表部门管理

**表结构:**

```sql
CREATE TABLE `sys_dept` (
  `id` bigint NOT NULL COMMENT '部门ID',
  `parent_id` bigint DEFAULT 0 COMMENT '父部门ID',
  `dept_name` varchar(50) NOT NULL COMMENT '部门名称',
  `order_num` int DEFAULT 0 COMMENT '显示顺序',
  `leader` varchar(20) DEFAULT NULL COMMENT '负责人',
  `status` char(1) DEFAULT '1' COMMENT '状态(0停用 1正常)',
  PRIMARY KEY (`id`)
) COMMENT='部门表';
```

**生成配置:**

```
生成模板: 树表(左树右表)
树编码字段: id
树父编码字段: parent_id
树名称字段: dept_name
```

### 案例3: 生成主子表订单管理

**主表:**

```sql
CREATE TABLE `order_main` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_name` varchar(50) DEFAULT NULL COMMENT '用户名称',
  `total_amount` decimal(10,2) DEFAULT 0.00 COMMENT '订单总额',
  `status` char(1) DEFAULT '0' COMMENT '订单状态',
  PRIMARY KEY (`id`)
) COMMENT='订单主表';
```

**子表:**

```sql
CREATE TABLE `order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_name` varchar(100) NOT NULL COMMENT '商品名称',
  `quantity` int DEFAULT 1 COMMENT '数量',
  `price` decimal(10,2) DEFAULT 0.00 COMMENT '单价',
  PRIMARY KEY (`id`)
) COMMENT='订单明细表';
```

**生成配置:**

```
主表生成模板: 主子表(一对多)
子表名称: order_item
子表外键: order_id
```

## 同步数据库

当数据库表结构变更后，使用同步功能更新生成配置。

**同步场景:**

- 新增字段
- 修改字段类型或注释
- 删除字段
- 修改表注释

**操作步骤:**

1. 修改数据库表结构
2. 在代码生成器中选择对应表
3. 点击 **同步** 按钮
4. 检查同步结果，调整新字段配置

**保留的配置:**

同步时会保留用户已设置的：生成包路径、模块名、业务名、字段的显示类型、字典类型、查询方式等。

## 故障排除

### 导入表找不到

**可能原因:**
1. 数据源选择错误
2. 表已导入过
3. 表名包含过滤前缀(sj_/flow_/gen_)

**解决方案:**
- 确认数据源正确
- 检查表是否已在列表中
- 确认表名前缀不在过滤列表

### 生成代码编译错误

**可能原因:**
1. 代码复制位置错误
2. 包路径配置错误
3. Maven依赖缺失

**解决方案:**
- 检查代码放置在正确的目录
- 确认包路径与文件路径匹配
- 刷新Maven依赖: `mvn clean install`

### 403权限错误

**可能原因:**
1. 菜单SQL未执行
2. 用户未分配权限

**解决方案:**

```sql
-- 检查菜单是否导入
SELECT * FROM sys_menu WHERE perms LIKE 'demo:demoUser:%';

-- 为角色分配权限
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 2, menu_id FROM sys_menu WHERE perms LIKE 'demo:demoUser:%';
```

### 字典数据不显示

**可能原因:**
1. 字典类型配置错误
2. 字典数据不存在

**解决方案:**

```sql
-- 检查字典是否存在
SELECT * FROM sys_dict_type WHERE dict_type = 'sys_normal_disable';
SELECT * FROM sys_dict_data WHERE dict_type = 'sys_normal_disable';
```

## 最佳实践

### 表设计规范

**命名规范:**

| 类型 | 规范 | 示例 |
|-----|------|------|
| 表名 | 小写下划线，统一前缀 | `sys_user`, `demo_product` |
| 字段名 | 小写下划线 | `user_name`, `create_time` |
| 主键 | 统一使用id | `id bigint` |

**公共字段:**

```sql
create_by bigint COMMENT '创建者',
create_time datetime COMMENT '创建时间',
update_by bigint COMMENT '更新者',
update_time datetime COMMENT '更新时间'
```

**状态字段:**

```sql
status char(1) DEFAULT '1' COMMENT '状态(0停用 1正常)'
```

### 字段注释规范

**标准格式:** `[字段业务名]([可选值说明])`

```sql
status char(1) COMMENT '状态(0停用 1正常)'
gender char(1) COMMENT '性别(0男 1女 2未知)'
type char(1) COMMENT '类型(1个人 2企业)'
```

生成器会自动提取业务名作为标签，识别括号内容用于字典映射。

### 生成后优化

**后端优化:**
- 添加业务校验逻辑
- 完善异常处理
- 添加事务管理
- 优化查询性能

**前端优化:**
- 优化表单布局
- 添加表单验证规则
- 完善错误提示
- 优化用户交互

### 自定义代码保护

生成的代码不建议直接修改，自定义逻辑应放在单独的类中：

```java
// ❌ 不推荐：直接修改生成的Controller
@RestController
public class DemoUserController {
    // 自定义方法会在重新生成后丢失
    @GetMapping("/statistics")
    public R<Map<String, Object>> statistics() { ... }
}

// ✅ 推荐：创建单独的Controller
@RestController
@RequestMapping("/demo/demoUser")
public class DemoUserExtController {
    @GetMapping("/statistics")
    public R<Map<String, Object>> statistics() { ... }
}
```

## 总结

代码生成器是快速开发的利器，合理使用可以大幅提升开发效率。关键要点：

1. **表设计规范化**: 统一命名、完善注释、标准字段
2. **配置精细化**: 合理设置查询方式、显示类型、字典关联
3. **生成后优化**: 添加业务逻辑、完善交互体验
4. **自定义代码分离**: 避免修改生成代码，保持可重复生成
