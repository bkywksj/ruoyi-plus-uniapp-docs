# 快速开始

本章将通过一个完整的实例演示如何使用代码生成器快速生成业务代码，让你在5分钟内掌握基本使用方法。

## 环境准备

### 1. 系统要求
- JDK 17+
- Maven 3.6+
- MySQL 5.7+ / PostgreSQL 12+ / Oracle 11g+ / SQL Server 2012+
- Node.js 18+（前端开发）

### 2. 项目依赖

确保项目中包含代码生成器模块：

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-generator</artifactId>
    <version>${revision}</version>
</dependency>
```

### 3. 配置文件

在 `application.yml` 中配置数据源：

```yaml
spring:
  datasource:
    # 主数据源
    dynamic:
      primary: master
      datasource:
        master:
          url: jdbc:mysql://localhost:3306/ry-vue?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
          username: root
          password: password
          driver-class-name: com.mysql.cj.jdbc.Driver
```

在 `generator.yml` 中配置生成器：

```yaml
# 代码生成
gen:
  # 作者
  author: 抓蛙师
  # 默认生成包路径
  packageName: plus.ruoyi.business.demo
  # 自动去除表前缀
  autoRemovePre: true
  # 表前缀
  tablePrefix: sys_,a_,b_,c_,d_,e_,f_,g_,h_,i_,j_,k_,l_,m_,n_,o_,p_,q_,r_,s_,t_,u_,v_,w_,x_,y_,z_,
```

## 快速上手

### 第一步：准备测试数据表

创建一个简单的用户信息表作为演示：

```sql
-- 创建测试表
CREATE TABLE `demo_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `gender` char(1) DEFAULT '0' COMMENT '性别（0男 1女 2未知）',
  `status` char(1) DEFAULT '1' COMMENT '状态（0停用 1正常）',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `is_deleted` char(1) DEFAULT '0' COMMENT '删除标识',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='演示用户表';

-- 插入测试数据
INSERT INTO `demo_user` (`username`, `nickname`, `email`, `phone`, `gender`, `status`, `remark`, `create_time`) VALUES
('admin', '管理员', 'admin@example.com', '13800138000', '1', '1', '系统管理员', NOW()),
('user01', '张三', 'zhangsan@example.com', '13800138001', '0', '1', '普通用户', NOW()),
('user02', '李四', 'lisi@example.com', '13800138002', '1', '1', '普通用户', NOW());
```

### 第二步：访问代码生成器

1. 启动项目
2. 登录系统管理员账号
3. 访问菜单：**系统工具** → **代码生成**

### 第三步：导入数据表

1. **点击导入按钮**

2. **选择数据源**

在弹出的对话框中选择数据源（默认为master）：

```text
数据源: [master ▼]
```

3. **搜索并选择表**

在表列表中找到 `demo_user` 表：

| 表名 | 表注释 | 创建时间 |
|------|--------|----------|
| demo_user | 演示用户表 | 2024-01-01 10:00:00 |

4. **确认导入**

勾选 `demo_user` 表，点击 **确定** 按钮完成导入。

### 第四步：配置生成选项

导入成功后，在代码生成列表中找到 `demo_user` 表，点击 **编辑** 按钮：

#### 4.1 基本信息配置

```text
表名称: demo_user
表描述: 演示用户表
实体类名称: DemoUser
作者: 抓蛙师
```

#### 4.2 生成信息配置

```text
生成包路径: plus.ruoyi.business.demo
生成模块名: demo
生成业务名: demoUser
生成功能名: 演示用户
```

#### 4.3 其他选项

```text
生成代码方式: zip压缩包
上级菜单: 系统工具
```

#### 4.4 字段配置

系统会自动识别字段类型，你可以根据需要调整：

| 字段名 | 字段描述 | 字段类型 | Java类型 | 查询 | 列表 | 新增 | 编辑 | 显示类型 |
|--------|----------|----------|----------|------|------|------|------|----------|
| id | 用户ID | bigint | Long | 是 | 是 | - | - | 文本框 |
| username | 用户名 | varchar | String | 是 | 是 | 是 | 是 | 文本框 |
| nickname | 昵称 | varchar | String | 是 | 是 | 是 | 是 | 文本框 |
| email | 邮箱 | varchar | String | 是 | 是 | 是 | 是 | 文本框 |
| phone | 手机号 | varchar | String | 是 | 是 | 是 | 是 | 文本框 |
| gender | 性别 | char | String | 是 | 是 | 是 | 是 | 单选框 |
| status | 状态 | char | String | 是 | 是 | 是 | 是 | 单选框 |
| remark | 备注 | varchar | String | - | - | 是 | 是 | 文本域 |

**字段配置说明：**
- **查询**：是否作为查询条件
- **列表**：是否在列表中显示
- **新增**：是否在新增表单中显示
- **编辑**：是否在编辑表单中显示

### 第五步：预览代码

配置完成后，点击 **预览** 按钮查看即将生成的代码：

#### 预览内容包括：

1. **Java代码**
    - `DemoUser.java` - 实体类
    - `DemoUserVo.java` - 视图对象
    - `DemoUserBo.java` - 业务对象
    - `DemoUserController.java` - 控制器
    - `DemoUserService.java` - 服务接口
    - `DemoUserServiceImpl.java` - 服务实现
    - `DemoUserMapper.java` - 数据访问接口

2. **前端代码**
    - `demoUserApi.ts` - API接口
    - `demoUserTypes.ts` - TypeScript类型
    - `demoUser.vue` - 页面组件

3. **SQL脚本**
    - `demoUserMenu.sql` - 菜单配置脚本

### 第六步：生成并下载代码

1. **生成代码**

点击 **生成代码** 按钮，系统会自动生成并打包所有文件。

2. **下载ZIP包**

浏览器会自动下载名为 `ruoyi.zip` 的压缩包。

3. **解压文件**

解压后的目录结构如下：

```text
ruoyi/
├── main/java/plus/ruoyi/business/demo/
│   ├── controller/
│   │   └── DemoUserController.java
│   ├── domain/
│   │   ├── entity/
│   │   │   └── DemoUser.java
│   │   ├── vo/
│   │   │   └── DemoUserVo.java
│   │   └── bo/
│   │       └── DemoUserBo.java
│   ├── mapper/
│   │   └── DemoUserMapper.java
│   └── service/
│       ├── IDemoUserService.java
│       └── impl/
│           └── DemoUserServiceImpl.java
├── main/resources/mapper/demo/
│   └── DemoUserMapper.xml
├── vue/api/business/demo/demoUser/
│   ├── demoUserApi.ts
│   └── demoUserTypes.ts
├── vue/views/business/demo/demoUser/
│   └── demoUser.vue
└── demoUserMenu.sql
```

## 代码集成

### 第一步：复制后端代码

将生成的Java代码复制到项目对应目录：

```bash
# 复制到项目源码目录
cp -r ruoyi/main/java/* your-project/src/main/java/
cp -r ruoyi/main/resources/* your-project/src/main/resources/
```

### 第二步：复制前端代码

将生成的前端代码复制到前端项目：

```bash
# 复制到前端项目
cp -r ruoyi/vue/api/* your-frontend/src/api/
cp -r ruoyi/vue/views/* your-frontend/src/views/
```

### 第三步：执行SQL脚本

在数据库中执行生成的菜单脚本：

```sql
-- 执行 demoUserMenu.sql
source demoUserMenu.sql;
```

### 第四步：添加前端路由

在前端路由配置中添加新页面：

```typescript
// src/router/modules/demo.ts
export default {
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
      component: () => import('@/views/business/demo/demoUser/demoUser.vue'),
      name: 'DemoUser',
      meta: { title: '演示用户', icon: 'user' }
    }
  ]
}
```

## 验证结果

### 1. 重启服务

重启后端服务和前端服务：

### 2. 访问页面

登录系统后，在菜单中找到 **演示模块** → **演示用户**，验证功能：

- <Ok/> **列表展示**：可以看到用户列表
- <Ok/> **搜索功能**：可以按用户名、昵称等搜索
- <Ok/> **新增用户**：点击新增按钮可以添加用户
- <Ok/> **编辑用户**：点击编辑按钮可以修改用户信息
- <Ok/> **删除用户**：可以删除单个或批量删除用户
- <Ok/> **导入导出**：支持Excel导入导出功能

### 3. 测试API

可以使用Postman或其他工具测试生成的API接口：

```bash
# 获取用户列表
GET /demo/demoUser/pageDemoUsers?pageNum=1&pageSize=10

# 获取用户详情
GET /demo/demoUser/getDemoUser/1

# 新增用户
POST /demo/demoUser/addDemoUser
Content-Type: application/json

{
  "username": "test01",
  "nickname": "测试用户",
  "email": "test01@example.com",
  "gender": "0",
  "status": "1"
}

# 更新用户
PUT /demo/demoUser/updateDemoUser
Content-Type: application/json

{
  "id": 1,
  "username": "test01",
  "nickname": "测试用户修改",
  "email": "test01@example.com",
  "gender": "0",
  "status": "1"
}

# 删除用户
DELETE /demo/demoUser/deleteDemoUsers/1
```

## 常见问题

### Q1: 导入表时找不到数据表？

**解决方案：**
1. 确认数据源配置正确
2. 检查数据库连接是否正常
3. 确认表名没有特殊前缀被过滤
4. 检查表是否已经被导入过

### Q2: 生成的代码编译错误？

**解决方案：**
1. 检查包路径是否正确
2. 确认项目依赖是否完整
3. 检查生成的代码是否有语法错误
4. 确认数据库字段类型映射是否正确

### Q3: 前端页面访问404？

**解决方案：**
1. 检查路由配置是否正确
2. 确认文件路径是否匹配
3. 检查菜单权限是否配置
4. 确认组件导入路径是否正确

### Q4: 权限控制不生效？

**解决方案：**
1. 执行生成的SQL菜单脚本
2. 为用户分配对应的菜单权限
3. 检查权限注解是否正确
4. 确认权限标识符格式正确

## 进阶使用

### 1. 批量生成

可以同时选择多个表进行批量生成：

```text
1. 导入多个表
2. 在列表中勾选多个表
3. 点击批量生成代码
4. 下载包含所有表代码的ZIP包
```

### 2. 自定义生成路径

可以设置自定义的代码生成路径：

```text
生成代码方式: 自定义路径
生成路径: /your/custom/path/
```

### 3. 模板定制

可以修改Velocity模板来定制生成的代码风格：

```text
src/main/resources/vm/java/controller.java.vm
src/main/resources/vm/vue/index.vue.vm
```

通过本快速开始指南，你已经掌握了代码生成器的基本使用方法。接下来可以探索更多高级功能，如树形结构、主子表等复杂场景的代码生成。

## 生成方式对比

代码生成器提供了两种代码生成方式，根据不同场景选择使用。

### 方式一：ZIP压缩包下载

**特点:**
- 生成ZIP压缩包，通过浏览器下载
- 适合本地开发环境
- 需要手动复制代码到项目
- 灵活性高，可以修改后再集成

**使用场景:**
- 开发环境代码生成
- 需要代码审查后再集成
- 跨项目代码复用

**操作步骤:**
1. 在代码生成列表中选择表
2. 点击 **生成代码** 按钮
3. 浏览器自动下载 `ruoyi.zip` 文件
4. 解压后复制到项目对应目录

### 方式二：自定义路径生成

**特点:**
- 直接生成到指定的项目路径
- 自动导入菜单SQL到数据库
- 适合服务器部署环境
- 一键完成，无需手动操作

**使用场景:**
- 生产环境快速生成
- 批量生成多个表
- 自动化CI/CD流程

**操作步骤:**
1. 配置自定义生成路径
2. 点击 **生成代码(自定义路径)** 按钮
3. 系统自动生成文件并导入菜单
4. 返回生成结果和菜单导入状态

**配置示例:**

```yaml
# generator.yml
gen:
  # 自定义生成路径
  genPath: D:/your-project/
  # 后端代码路径
  backendPath: ${gen.genPath}/src/main/java/
  # 前端代码路径
  frontendPath: ${gen.genPath}/../your-frontend/src/
```

## 批量生成功能

### 功能说明

批量生成功能允许一次选择多个表进行代码生成，大幅提升工作效率。

### 操作步骤

#### 1. 导入多个表

在导入表的对话框中，勾选多个需要生成代码的表：

| 选择 | 表名 | 表注释 | 创建时间 |
|------|------|--------|----------|
| 是 | demo_user | 演示用户表 | 2024-01-01 10:00:00 |
| 是 | demo_product | 演示商品表 | 2024-01-01 10:00:00 |
| 是 | demo_order | 演示订单表 | 2024-01-01 10:00:00 |
| 是 | demo_category | 演示分类表 | 2024-01-01 10:00:00 |

#### 2. 配置生成选项

为每个表分别配置生成参数：

```text
demo_user:
  - 生成包路径: plus.ruoyi.business.demo
  - 生成模块名: demo
  - 生成业务名: demoUser
  - 生成功能名: 演示用户

demo_product:
  - 生成包路径: plus.ruoyi.business.demo
  - 生成模块名: demo
  - 生成业务名: demoProduct
  - 生成功能名: 演示商品
```

#### 3. 批量生成

在代码生成列表中，勾选多个表，点击 **批量生成代码** 按钮：

```java
// API调用
GET /tool/gen/batchGenerateCodes?tableIdStr=1,2,3,4
```

#### 4. 下载结果

浏览器会下载一个包含所有表代码的ZIP压缩包：

```text
ruoyi.zip
├── demo_user/
│   ├── java/
│   ├── resources/
│   ├── vue/
│   └── demoUserMenu.sql
├── demo_product/
│   ├── java/
│   ├── resources/
│   ├── vue/
│   └── demoProductMenu.sql
├── demo_order/
│   └── ...
└── demo_category/
    └── ...
```

### 批量生成最佳实践

#### 1. 按模块分组

将相关的表放在一起批量生成：

```text
用户模块:
  - sys_user
  - sys_user_role
  - sys_user_post

商品模块:
  - prod_product
  - prod_category
  - prod_brand
```

#### 2. 统一命名规范

确保所有表遵循统一的命名规范：

```text
表前缀: demo_
字段前缀: 无

统一字段:
  - id (主键)
  - create_time (创建时间)
  - update_time (更新时间)
  - create_by (创建人)
  - update_by (更新人)
  - is_deleted (删除标识)
```

#### 3. 检查配置一致性

批量生成前，检查配置是否一致：

```text
✓ 包路径统一: plus.ruoyi.business.demo
✓ 模块名统一: demo
✓ 作者统一: 抓蛙师
✓ 生成方式统一: zip压缩包 / 自定义路径
```

## 同步数据库功能

### 功能说明

当数据库表结构发生变化后，可以使用同步功能更新生成配置，无需重新导入表。

### 使用场景

1. **新增字段** - 表中添加了新的字段
2. **修改字段** - 字段类型、长度、注释等发生变化
3. **删除字段** - 表中删除了某些字段
4. **修改表注释** - 表注释发生变化

### 操作步骤

#### 1. 修改数据库表结构

```sql
-- 示例：为 demo_user 表新增字段
ALTER TABLE `demo_user`
ADD COLUMN `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL' AFTER `phone`,
ADD COLUMN `birthday` date DEFAULT NULL COMMENT '生日' AFTER `avatar`;

-- 修改字段类型
ALTER TABLE `demo_user`
MODIFY COLUMN `remark` varchar(1000) DEFAULT NULL COMMENT '备注';

-- 修改表注释
ALTER TABLE `demo_user` COMMENT='演示用户信息表';
```

#### 2. 同步数据库

在代码生成列表中，找到对应的表，点击 **同步** 按钮：

```java
// API调用
GET /tool/gen/syncGenDb/{tableId}
```

#### 3. 验证同步结果

点击 **编辑** 按钮，检查字段列表：

| 字段名 | 字段描述 | 字段类型 | Java类型 | 查询 | 列表 | 新增 | 编辑 |
|--------|----------|----------|----------|------|------|------|------|
| avatar | 头像URL | varchar | String | - | 是 | 是 | 是 |
| birthday | 生日 | date | Date | 是 | 是 | 是 | 是 |
| remark | 备注 | varchar(1000) | String | - | - | 是 | 是 |

#### 4. 重新生成代码

同步完成后，重新生成代码：

```bash
1. 点击 **预览** 查看新代码
2. 点击 **生成代码** 下载新版本
3. 替换项目中的旧文件
```

### 同步注意事项

#### 重要提示

1. **备份旧代码** - 同步前备份已有的代码修改
2. **检查自定义修改** - 同步会覆盖某些配置，自定义修改可能丢失
3. **字段配置保留** - 已配置的字段属性(查询、列表等)会保留
4. **新增字段默认配置** - 新增字段会使用默认配置，需要手动调整

#### 不会同步的内容

以下配置不会被同步覆盖：

- 生成包路径
- 生成模块名
- 生成业务名
- 生成功能名
- 作者信息
- 上级菜单
- 自定义模板选择
- 已配置的字段显示类型和字典类型

## 高级技巧

### 技巧1：快速配置多个字段

使用批量配置功能快速设置多个字段属性。

#### 批量设置查询条件

```javascript
// 1. 在字段配置页面，勾选多个字段
☑️ username
☑️ nickname
☑️ email
☑️ phone

// 2. 点击 "批量设置" 按钮
批量设置查询条件: LIKE (模糊查询)

// 3. 应用配置
所有选中字段的查询方式都设置为 LIKE
```

#### 批量设置显示类型

```javascript
// 字段批量配置
☑️ status
☑️ gender
☑️ type

批量设置显示类型: 单选框
批量设置字典类型: sys_user_sex (性别字典)
```

### 技巧2：使用模板变量

在生成信息配置中，可以使用模板变量：

```java
// 生成包路径支持变量
${packageName}.${moduleName}

// 示例
生成包路径: plus.ruoyi.business  (基础包名)
生成模块名: demo                 (模块名)
实际生成: plus.ruoyi.business.demo

// 生成业务名支持驼峰转换
表名: demo_user_info
业务名: demoUserInfo (自动转换)
```

### 技巧3：自定义代码模板

#### 修改Velocity模板

生成器使用Velocity模板引擎，可以自定义模板：

```text
ruoyi-modules/ruoyi-generator/src/main/resources/vm/
├── java/
│   ├── controller.java.vm      # 控制器模板
│   ├── service.java.vm         # 服务接口模板
│   ├── serviceImpl.java.vm     # 服务实现模板
│   ├── mapper.java.vm          # Mapper接口模板
│   ├── domain.java.vm          # 实体类模板
│   ├── vo.java.vm              # VO对象模板
│   └── bo.java.vm              # BO对象模板
├── xml/
│   └── mapper.xml.vm           # MyBatis XML模板
├── vue/
│   ├── index.vue.vm            # 前端页面模板
│   ├── api.ts.vm               # API接口模板
│   └── types.ts.vm             # TypeScript类型模板
└── sql/
    └── menu.sql.vm             # 菜单SQL模板
```

#### 模板变量说明

常用的模板变量：

```java
${packageName}       ## 包名: plus.ruoyi.business.demo
${moduleName}        ## 模块名: demo
${businessName}      ## 业务名: demoUser
${functionName}      ## 功能名: 演示用户
${ClassName}         ## 类名: DemoUser
${className}         ## 类名(首字母小写): demoUser
${tableName}         ## 表名: demo_user
${tableComment}      ## 表注释: 演示用户表
${author}            ## 作者: 抓蛙师
${datetime}          ## 日期时间: 2024-01-01 10:00:00
${columns}           ## 字段列表
${pkColumn}          ## 主键字段
```

#### 自定义Controller模板示例

```java
package ${packageName}.${moduleName}.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import plus.ruoyi.common.core.domain.R;

/**
 * ${functionName}控制器
 *
 * @author ${author}
 * @date ${datetime}
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/${moduleName}/${businessName}")
public class ${ClassName}Controller {

    private final I${ClassName}Service ${className}Service;

    // 自定义方法...
}
```

### 技巧4：字典配置技巧

#### 关联字典类型

为状态、类型等字段关联字典：

```java
// 1. 在字段配置中设置字典类型
字段名: status
显示类型: 单选框
字典类型: sys_normal_disable

// 2. 生成的前端代码会自动加载字典
<el-select v-model="form.status">
  <el-option
    v-for="dict in sys_normal_disable"
    :key="dict.value"
    :label="dict.label"
    :value="dict.value"
  />
</el-select>
```

#### 自定义字典

```sql
-- 1. 创建字典类型
INSERT INTO sys_dict_type (dict_name, dict_type, status, remark, create_time)
VALUES ('用户等级', 'user_level', '1', '用户等级类型', NOW());

-- 2. 创建字典数据
INSERT INTO sys_dict_data (dict_type, dict_label, dict_value, dict_sort, status, create_time)
VALUES
('user_level', '普通用户', '1', 1, '1', NOW()),
('user_level', '白银用户', '2', 2, '1', NOW()),
('user_level', '黄金用户', '3', 3, '1', NOW()),
('user_level', '钻石用户', '4', 4, '1', NOW());

-- 3. 在代码生成时使用
字段: user_level
显示类型: 下拉框
字典类型: user_level
```

### 技巧5：主子表生成

代码生成器支持主子表结构的代码生成。

#### 场景说明

适用于一对多关系的表结构：

```text
订单表 (demo_order)          1:N        订单明细表 (demo_order_item)
├── id                       ←──────── ├── id
├── order_no                           ├── order_id (外键)
├── user_id                            ├── product_id
├── total_amount                       ├── quantity
└── status                             ├── price
                                       └── amount
```

#### 配置步骤

1. **导入主表和子表**

```sql
-- 主表
CREATE TABLE `demo_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `total_amount` decimal(10,2) DEFAULT 0.00 COMMENT '订单总额',
  `status` char(1) DEFAULT '0' COMMENT '订单状态',
  PRIMARY KEY (`id`)
) COMMENT='演示订单表';

-- 子表
CREATE TABLE `demo_order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `quantity` int DEFAULT 1 COMMENT '数量',
  `price` decimal(10,2) DEFAULT 0.00 COMMENT '单价',
  `amount` decimal(10,2) DEFAULT 0.00 COMMENT '小计',
  PRIMARY KEY (`id`)
) COMMENT='演示订单明细表';
```

2. **配置主子表关系**

在主表(demo_order)的编辑页面：

```text
生成模板: 主子表
子表名称: demo_order_item
子表外键: order_id
```

3. **配置子表字段**

在子表(demo_order_item)的编辑页面：

```text
关联主表: demo_order
外键字段: order_id
关联主键: id
```

4. **生成代码**

点击生成代码后，会额外生成：

```java
// DemoOrderVo.java
public class DemoOrderVo {
    private Long id;
    private String orderNo;
    private BigDecimal totalAmount;

    // 子表列表
    private List<DemoOrderItemVo> itemList;
}

// DemoOrderServiceImpl.java
@Override
@Transactional
public boolean addDemoOrder(DemoOrderBo bo) {
    // 1. 保存主表
    DemoOrder order = BeanUtil.toBean(bo, DemoOrder.class);
    boolean result = baseMapper.insert(order) > 0;

    if (result && CollUtil.isNotEmpty(bo.getItemList())) {
        // 2. 批量保存子表
        List<DemoOrderItem> items = BeanUtil.copyToList(bo.getItemList(), DemoOrderItem.class);
        items.forEach(item -> item.setOrderId(order.getId()));
        orderItemMapper.insertBatch(items);
    }

    return result;
}
```

### 技巧6：树形结构生成

代码生成器支持树形结构的代码生成。

#### 场景说明

适用于层级结构的表：

```text
分类表 (demo_category)
├── id              主键
├── parent_id       父级ID
├── category_name   分类名称
├── order_num       排序
├── status          状态
└── level           层级
```

#### 配置步骤

1. **创建树形表**

```sql
CREATE TABLE `demo_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` bigint DEFAULT 0 COMMENT '父级ID',
  `category_name` varchar(100) NOT NULL COMMENT '分类名称',
  `order_num` int DEFAULT 0 COMMENT '排序',
  `status` char(1) DEFAULT '1' COMMENT '状态',
  `level` int DEFAULT 0 COMMENT '层级',
  PRIMARY KEY (`id`)
) COMMENT='演示分类表';

-- 插入测试数据
INSERT INTO `demo_category` VALUES
(1, 0, '电子产品', 1, '1', 0),
(2, 1, '手机', 1, '1', 1),
(3, 1, '电脑', 2, '1', 1),
(4, 2, '苹果手机', 1, '1', 2),
(5, 2, '华为手机', 2, '1', 2);
```

2. **配置树形结构**

在编辑页面配置：

```text
生成模板: 树表
树编码字段: id
树父编码字段: parent_id
树名称字段: category_name
```

3. **生成代码**

生成的代码会包含树形结构处理：

```java
// DemoCategory.java
@TableName("demo_category")
public class DemoCategory extends TreeEntity<DemoCategory> {
    private Long id;
    private Long parentId;
    private String categoryName;
    private Integer orderNum;

    // 树形结构字段
    @TableField(exist = false)
    private List<DemoCategory> children;
}

// DemoCategoryServiceImpl.java
@Override
public List<DemoCategory> buildCategoryTree(List<DemoCategory> categories) {
    List<DemoCategory> returnList = new ArrayList<>();

    // 找出所有根节点(父ID为0)
    for (DemoCategory category : categories) {
        if (category.getParentId() == 0) {
            recursionFn(categories, category);
            returnList.add(category);
        }
    }

    return returnList;
}

private void recursionFn(List<DemoCategory> list, DemoCategory t) {
    // 得到子节点列表
    List<DemoCategory> childList = getChildList(list, t);
    t.setChildren(childList);
    for (DemoCategory tChild : childList) {
        // 判断是否有子节点
        if (hasChild(list, tChild)) {
            recursionFn(list, tChild);
        }
    }
}
```

## 故障排查进阶

### 错误1: 生成代码编译错误 - 包名冲突

```text
错误信息: java: 程序包plus.ruoyi.business.demo不存在
```

**原因分析:**
- 包路径配置错误
- 模块依赖缺失
- 代码放置位置错误

**解决方案:**

```java
// 1. 检查 pom.xml 模块依赖
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-business</artifactId>
    <version>${revision}</version>
</dependency>

// 2. 检查代码放置位置
正确: ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/demo/
错误: ruoyi-admin/src/main/java/plus/ruoyi/business/demo/

// 3. 刷新Maven项目
mvn clean install
```

### 错误2: 前端页面空白 - 路由配置错误

```text
错误信息: 页面显示空白，控制台无错误
```

**原因分析:**
- 路由配置缺失
- 路由路径错误
- 组件导入路径错误

**解决方案:**

```typescript
// 1. 检查路由配置 src/router/modules/demo.ts
import { RouteRecordRaw } from 'vue-router'

const demoRoutes: RouteRecordRaw = {
  path: '/demo',
  component: Layout,
  redirect: '/demo/demoUser',
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
        icon: 'user'
      }
    }
  ]
}

export default demoRoutes

// 2. 确保路由已注册 src/router/index.ts
import demoRoutes from './modules/demo'

const routes = [
  // ...其他路由
  demoRoutes
]

// 3. 检查组件文件是否存在
文件位置: src/views/business/demo/demoUser/demoUser.vue
```

### 错误3: 权限控制失效 - 菜单SQL未执行

```text
错误信息: 403 Forbidden - 您没有访问权限
```

**原因分析:**
- 菜单SQL脚本未执行
- 用户未分配权限
- 权限标识符错误

**解决方案:**

```sql
-- 1. 执行菜单SQL脚本
source demoUserMenu.sql;

-- 2. 检查菜单是否插入成功
SELECT * FROM sys_menu WHERE menu_name = '演示用户';

-- 3. 为角色分配权限
-- 方法一: 通过系统菜单"角色管理"分配
-- 方法二: 直接插入权限关联
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 2, menu_id FROM sys_menu WHERE perms LIKE 'demo:demoUser:%';

-- 4. 检查权限标识符是否正确
SELECT menu_name, perms FROM sys_menu WHERE menu_name LIKE '%演示用户%';
```

### 错误4: MyBatis XML映射错误

```text
错误信息: Invalid bound statement (not found): plus.ruoyi.business.demo.mapper.DemoUserMapper.selectDemoUserList
```

**原因分析:**
- XML文件位置错误
- Mapper接口方法与XML不匹配
- Maven未编译XML文件

**解决方案:**

```xml
<!-- 1. 检查 pom.xml 资源配置 -->
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <includes>
                <include>**/*.xml</include>
            </includes>
        </resource>
    </resources>
</build>

<!-- 2. 检查 XML 文件位置 -->
正确: src/main/resources/mapper/demo/DemoUserMapper.xml
错误: src/main/resources/mapper/DemoUserMapper.xml

<!-- 3. 检查 namespace 配置 -->
<mapper namespace="plus.ruoyi.business.demo.mapper.DemoUserMapper">
    <select id="selectDemoUserList" resultMap="DemoUserResult">
        ...
    </select>
</mapper>

<!-- 4. 重新编译项目 -->
mvn clean compile
```

### 错误5: 字典数据未加载

```text
错误信息: 下拉框显示空白，无选项
```

**原因分析:**
- 字典类型配置错误
- 字典数据未创建
- 前端未正确加载字典

**解决方案:**

```typescript
// 1. 检查字典配置
字段名: status
显示类型: 下拉框
字典类型: sys_normal_disable  // 确保拼写正确

// 2. 确认字典数据存在
SELECT * FROM sys_dict_type WHERE dict_type = 'sys_normal_disable';
SELECT * FROM sys_dict_data WHERE dict_type = 'sys_normal_disable';

// 3. 检查前端代码
<el-select v-model="queryParams.status" clearable>
  <el-option
    v-for="dict in sys_normal_disable"
    :key="dict.value"
    :label="dict.label"
    :value="dict.value"
  />
</el-select>

// 4. 确保字典已加载
import { getDictOptions } from '@/api/system/dict/data'

// 在组件中加载字典
const sys_normal_disable = ref<DictItem[]>([])

onMounted(() => {
  getDictOptions('sys_normal_disable').then(res => {
    sys_normal_disable.value = res.data
  })
})
```

## 性能优化建议

### 1. 数据库索引优化

生成代码后，根据查询条件添加索引：

```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_username ON demo_user(username);
CREATE INDEX idx_email ON demo_user(email);
CREATE INDEX idx_phone ON demo_user(phone);

-- 为状态字段添加索引
CREATE INDEX idx_status ON demo_user(status);

-- 为时间范围查询添加索引
CREATE INDEX idx_create_time ON demo_user(create_time);

-- 为组合查询添加复合索引
CREATE INDEX idx_status_create_time ON demo_user(status, create_time);
```

### 2. 分页查询优化

```java
@Service
public class DemoUserServiceImpl implements IDemoUserService {

    @Override
    public PageResult<DemoUserVo> pageDemoUsers(DemoUserBo bo, PageQuery pageQuery) {
        // 优化: 使用覆盖索引查询
        LambdaQueryWrapper<DemoUser> wrapper = new LambdaQueryWrapper<>();

        // 只查询必要字段,减少数据传输
        wrapper.select(DemoUser::getId, DemoUser::getUsername,
                      DemoUser::getNickname, DemoUser::getStatus);

        // 添加查询条件
        wrapper.like(StringUtils.isNotBlank(bo.getUsername()),
                    DemoUser::getUsername, bo.getUsername())
               .eq(StringUtils.isNotBlank(bo.getStatus()),
                   DemoUser::getStatus, bo.getStatus());

        // 使用分页插件
        Page<DemoUser> page = baseMapper.selectPage(
            PageQuery.of(pageQuery.getPageNum(), pageQuery.getPageSize()),
            wrapper
        );

        return PageResult.build(page, DemoUserVo.class);
    }
}
```

### 3. 批量操作优化

```java
@Service
public class DemoUserServiceImpl implements IDemoUserService {

    @Override
    @Transactional
    public boolean batchAddDemoUsers(List<DemoUserBo> boList) {
        // 优化: 使用批量插入
        List<DemoUser> users = BeanUtil.copyToList(boList, DemoUser.class);

        // 方法一: MyBatis Plus批量插入
        return this.saveBatch(users);

        // 方法二: 自定义批量插入(更高效)
        // return baseMapper.insertBatch(users);
    }

    @Override
    @Transactional
    public boolean batchUpdateDemoUsers(List<DemoUserBo> boList) {
        // 优化: 使用批量更新
        List<DemoUser> users = BeanUtil.copyToList(boList, DemoUser.class);
        return this.updateBatchById(users);
    }
}
```

### 4. 缓存优化

```java
@Service
public class DemoUserServiceImpl implements IDemoUserService {

    @Autowired
    private RedisTemplate<String, DemoUserVo> redisTemplate;

    private static final String CACHE_KEY_PREFIX = "demoUser:";
    private static final Duration CACHE_EXPIRE = Duration.ofHours(1);

    @Override
    public DemoUserVo getDemoUserById(Long id) {
        // 1. 尝试从缓存获取
        String cacheKey = CACHE_KEY_PREFIX + id;
        DemoUserVo cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // 2. 从数据库查询
        DemoUser user = baseMapper.selectById(id);
        if (user == null) {
            return null;
        }

        DemoUserVo vo = BeanUtil.toBean(user, DemoUserVo.class);

        // 3. 写入缓存
        redisTemplate.opsForValue().set(cacheKey, vo, CACHE_EXPIRE);

        return vo;
    }

    @Override
    @Transactional
    public boolean updateDemoUser(DemoUserBo bo) {
        boolean result = baseMapper.updateById(BeanUtil.toBean(bo, DemoUser.class)) > 0;

        if (result) {
            // 更新成功后清除缓存
            String cacheKey = CACHE_KEY_PREFIX + bo.getId();
            redisTemplate.delete(cacheKey);
        }

        return result;
    }
}
```

## 扩展功能

### 1. 自定义模板

创建自己的代码模板，满足特定需求。

#### 步骤1: 创建模板文件

```java
## src/main/resources/vm/custom/controller.java.vm
package ${packageName}.${moduleName}.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * ${functionName}控制器
 *
 * @author ${author}
 * @date ${datetime}
 */
@Tag(name = "${functionName}管理")
@RestController
@RequestMapping("/${moduleName}/${businessName}")
public class ${ClassName}Controller extends BaseController {

    @Autowired
    private I${ClassName}Service ${className}Service;

    @Operation(summary = "查询${functionName}列表")
    @GetMapping("/list")
    public R<List<${ClassName}Vo>> list${ClassName}(${ClassName}Bo bo) {
        return R.ok(${className}Service.list${ClassName}(bo));
    }
}
```

#### 步骤2: 配置模板

```java
// GenConfig.java
@Configuration
public class GenConfig {

    /** 自定义模板路径 */
    public static String getCustomTemplatePath() {
        return "vm/custom/";
    }
}
```

### 2. 代码生成后处理

在代码生成后自动执行一些操作。

```java
@Component
public class CodeGenPostProcessor {

    @EventListener
    public void handleCodeGenEvent(CodeGenEvent event) {
        // 1. 自动格式化代码
        formatGeneratedCode(event.getFilePaths());

        // 2. 自动提交到Git
        if (event.isAutoCommit()) {
            commitToGit(event.getFilePaths());
        }

        // 3. 自动执行菜单SQL
        if (event.isAutoImportMenu()) {
            executeMen uSql(event.getMenuSqlPath());
        }

        // 4. 发送通知
        sendNotification("代码生成完成: " + event.getTableName());
    }
}
```

### 3. 多数据源支持

代码生成器支持多数据源。

```yaml
# application.yml
spring:
  datasource:
    dynamic:
      primary: master
      datasource:
        # 主数据源
        master:
          url: jdbc:mysql://localhost:3306/ruoyi?...
          username: root
          password: password
        # 从数据源
        slave:
          url: jdbc:mysql://localhost:3306/ruoyi_slave?...
          username: root
          password: password
        # Oracle数据源
        oracle:
          url: jdbc:oracle:thin:@localhost:1521:orcl
          username: system
          password: password
```

在导入表时选择数据源：

```java
// 前端选择数据源
数据源: [master ▼]
        slave
        oracle

// 后端API
POST /tool/gen/importGens?tables=demo_user&dataName=slave
```

## 总结

通过本快速开始指南，你已经全面掌握了代码生成器的使用方法：

### 基本功能
- 导入数据表
- 配置生成选项
- 预览和生成代码
- 代码集成和验证

### 高级功能
- 批量生成多表代码
- 同步数据库结构
- 主子表结构生成
- 树形结构生成

### 优化技巧
- 数据库索引优化
- 分页查询优化
- 批量操作优化
- 缓存机制优化

### 扩展能力
- 自定义代码模板
- 代码生成后处理
- 多数据源支持

### 相关文档

继续学习代码生成器的更多功能，请参考：
- **表管理** - 表导入、编辑、删除等操作
- **字段配置** - 字段类型、显示方式、校验规则等
- **高级配置** - 主子表、树表、分页等高级功能
- **模板类型** - CRUD单表、树表、主子表等模板说明
