# 快速开始

本章将通过一个完整的实例演示如何使用代码生成器快速生成业务代码，让你在5分钟内掌握基本使用方法。

## 环境准备

### 1. 系统要求
- JDK 17+
- Maven 3.6+
- MySQL 8.0+ / PostgreSQL 12+ / Oracle 11g+ / SQL Server 2012+
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

```
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

```
表名称: demo_user
表描述: 演示用户表
实体类名称: DemoUser
作者: 抓蛙师
```

#### 4.2 生成信息配置

```
生成包路径: plus.ruoyi.business.demo
生成模块名: demo
生成业务名: demoUser
生成功能名: 演示用户
```

#### 4.3 其他选项

```
生成代码方式: zip压缩包
上级菜单: 系统工具
```

#### 4.4 字段配置

系统会自动识别字段类型，你可以根据需要调整：

| 字段名 | 字段描述 | 字段类型 | Java类型 | 查询 | 列表 | 新增 | 编辑 | 显示类型 |
|--------|----------|----------|----------|------|------|------|------|----------|
| id | 用户ID | bigint | Long | ✓ | ✓ | - | - | 文本框 |
| username | 用户名 | varchar | String | ✓ | ✓ | ✓ | ✓ | 文本框 |
| nickname | 昵称 | varchar | String | ✓ | ✓ | ✓ | ✓ | 文本框 |
| email | 邮箱 | varchar | String | ✓ | ✓ | ✓ | ✓ | 文本框 |
| phone | 手机号 | varchar | String | ✓ | ✓ | ✓ | ✓ | 文本框 |
| gender | 性别 | char | String | ✓ | ✓ | ✓ | ✓ | 单选框 |
| status | 状态 | char | String | ✓ | ✓ | ✓ | ✓ | 单选框 |
| remark | 备注 | varchar | String | - | - | ✓ | ✓ | 文本域 |

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

```
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

- ✅ **列表展示**：可以看到用户列表
- ✅ **搜索功能**：可以按用户名、昵称等搜索
- ✅ **新增用户**：点击新增按钮可以添加用户
- ✅ **编辑用户**：点击编辑按钮可以修改用户信息
- ✅ **删除用户**：可以删除单个或批量删除用户
- ✅ **导入导出**：支持Excel导入导出功能

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

```
1. 导入多个表
2. 在列表中勾选多个表
3. 点击批量生成代码
4. 下载包含所有表代码的ZIP包
```

### 2. 自定义生成路径

可以设置自定义的代码生成路径：

```
生成代码方式: 自定义路径
生成路径: /your/custom/path/
```

### 3. 模板定制

可以修改Velocity模板来定制生成的代码风格：

```
src/main/resources/vm/java/controller.java.vm
src/main/resources/vm/vue/index.vue.vm
```

通过本快速开始指南，你已经掌握了代码生成器的基本使用方法。接下来可以探索更多高级功能，如树形结构、主子表等复杂场景的代码生成。
