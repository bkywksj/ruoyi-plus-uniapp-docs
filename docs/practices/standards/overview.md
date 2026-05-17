# 开发规范概览

RuoYi-Plus-UniApp 项目的开发规范体系，涵盖代码、命名、注释、API、数据库、Git等多个维度，确保项目代码质量和团队协作效率。

## 规范体系架构

```text
开发规范体系
├── 代码规范          # 基础编码原则和风格
├── 命名规范          # 统一的命名约定
├── 注释规范          # 代码文档化标准
├── API设计规范       # 接口设计原则
├── 数据库规范        # 数据库设计标准
├── Git规范          # 版本控制流程
├── 前端开发规范      # 前端特定规范
└── 移动端开发规范    # 移动端特定规范
```

## 核心原则

### 1. 一致性原则

在整个项目中保持一致的编码风格、命名方式和结构组织。

```java
// ✅ 一致的 Controller 命名
@RestController
@RequestMapping("/system/user")
public class SysUserController { }

@RestController
@RequestMapping("/system/role")
public class SysRoleController { }

@RestController
@RequestMapping("/system/menu")
public class SysMenuController { }
```

### 2. 可读性优先

代码首先是给人阅读的，清晰易懂比简洁更重要。

```java
// ✅ 可读性好
public boolean isUserActive(SysUser user) {
    if (user == null) {
        return false;
    }
    return UserStatus.NORMAL.getCode().equals(user.getStatus());
}

// ❌ 过于简洁，可读性差
public boolean check(SysUser u) {
    return u != null && "0".equals(u.getStatus());
}
```

### 3. 简单性原则

优先选择简单直接的解决方案，避免过度设计。

```java
// ✅ 简单直接
public String getStatusText(String status) {
    return "0".equals(status) ? "正常" : "停用";
}

// ❌ 过度设计
public String getStatusText(String status) {
    return StatusEnum.fromCode(status)
        .map(StatusEnum::getText)
        .orElse("未知");
}
```

## 规范分类详解

### 代码规范

代码规范是最基础的规范，定义了代码编写的基本原则和风格要求。

**核心要点**:
- 遵循 Java 编码规范
- 使用 Lombok 简化代码
- 合理使用设计模式
- 避免魔法值和硬编码

```java
// 标准的 Service 实现
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final IUserDao userDao;

    @Override
    public UserVo get(Long id) {
        return userDao.get(id);
    }

    @Override
    public PageResult<UserVo> page(UserBo bo, PageQuery pageQuery) {
        return userDao.page(bo, pageQuery);
    }
}
```

### 命名规范

统一的命名规范确保代码的可读性和一致性。

**Java 命名约定**:

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | 大驼峰 | `UserController`, `OrderService` |
| 方法名 | 小驼峰，动词开头 | `createUser()`, `isValid()` |
| 变量名 | 小驼峰 | `userName`, `orderList` |
| 常量 | 全大写下划线 | `MAX_RETRY_COUNT` |
| 包名 | 全小写 | `com.ruoyi.system` |

**前端命名约定**:

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件名 | 大驼峰 | `UserTable`, `SearchForm` |
| 文件名 | 小写连字符 | `user-table.vue`, `index.ts` |
| 变量名 | 小驼峰 | `userName`, `isLoading` |
| 常量 | 全大写下划线 | `API_BASE_URL` |
| CSS类 | 小写连字符 | `user-card`, `btn-primary` |

### 注释规范

良好的注释是代码文档化的重要组成部分。

**类注释**:

```java
/**
 * 用户服务实现类
 * <p>
 * 提供用户相关的业务逻辑处理，包括：
 * - 用户信息的增删改查
 * - 用户状态管理
 * - 用户权限校验
 *
 * @author 抓蛙师
 * @since 1.0.0
 */
@Service
public class UserServiceImpl implements IUserService {
    // ...
}
```

**方法注释**:

```java
/**
 * 根据用户ID查询用户信息
 *
 * @param id 用户ID，不能为空
 * @return 用户视图对象，如果不存在返回 null
 * @throws ServiceException 当用户ID无效时抛出
 */
@Override
public UserVo get(Long id) {
    // ...
}
```

### API 设计规范

RESTful API 设计遵循统一的规范。

**URL 设计**:

```text
GET    /api/users          # 获取用户列表
GET    /api/users/{id}     # 获取单个用户
POST   /api/users          # 创建用户
PUT    /api/users/{id}     # 更新用户
DELETE /api/users/{id}     # 删除用户
```

**响应格式**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "userName": "admin",
    "nickName": "管理员"
  }
}
```

**错误响应**:

```json
{
  "code": 500,
  "msg": "用户名已存在",
  "data": null
}
```

### 数据库规范

数据库设计遵循统一的命名和结构规范。

**表命名**:

| 类型 | 前缀 | 示例 |
|------|------|------|
| 系统表 | `sys_` | `sys_user`, `sys_role` |
| 业务表 | `biz_` | `biz_order`, `biz_product` |
| 日志表 | `log_` | `log_operation`, `log_login` |
| 配置表 | `cfg_` | `cfg_system`, `cfg_dict` |

**字段规范**:

```sql
CREATE TABLE sys_user (
    id            BIGINT       NOT NULL COMMENT '用户ID',
    user_name     VARCHAR(64)  NOT NULL COMMENT '用户名',
    nick_name     VARCHAR(64)  DEFAULT NULL COMMENT '昵称',
    status        CHAR(1)      DEFAULT '0' COMMENT '状态(0正常 1停用)',
    create_by     VARCHAR(64)  DEFAULT NULL COMMENT '创建者',
    create_time   DATETIME     DEFAULT NULL COMMENT '创建时间',
    update_by     VARCHAR(64)  DEFAULT NULL COMMENT '更新者',
    update_time   DATETIME     DEFAULT NULL COMMENT '更新时间',
    del_flag      CHAR(1)      DEFAULT '0' COMMENT '删除标志(0存在 1删除)',
    PRIMARY KEY (id)
) COMMENT '用户表';
```

### Git 规范

Git 提交和分支管理规范。

**提交信息格式**:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

**类型说明**:

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档变更 |
| `style` | 代码格式 |
| `refactor` | 重构代码 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具 |

**示例**:

```bash
feat(user): 添加用户批量导入功能

- 支持 Excel 文件导入
- 添加数据校验逻辑
- 支持导入结果反馈

Closes #123
```

## 项目分层规范

### 后端分层

```text
Controller 层    # 接口定义，参数校验，权限控制
    ↓
Service 层      # 业务逻辑，事务管理
    ↓
DAO 层          # 数据访问，SQL 封装
    ↓
Mapper 层       # MyBatis 映射
```

### 前端分层

```text
views/          # 页面组件
    ↓
components/     # 业务组件
    ↓
composables/    # 组合式函数
    ↓
stores/         # 状态管理
    ↓
api/            # 接口请求
```

## 代码审查要点

### 必查项

- [ ] 命名是否符合规范
- [ ] 注释是否完整清晰
- [ ] 是否存在硬编码
- [ ] 异常处理是否完善
- [ ] 日志记录是否合理
- [ ] 事务边界是否正确

### 建议项

- [ ] 代码是否可以简化
- [ ] 是否存在重复代码
- [ ] 性能是否有优化空间
- [ ] 测试覆盖是否充分

## 工具支持

### 代码检查工具

| 工具 | 用途 | 配置文件 |
|------|------|---------|
| Checkstyle | Java 代码风格 | `checkstyle.xml` |
| SpotBugs | Bug 检测 | `spotbugs.xml` |
| ESLint | JS/TS 代码检查 | `.eslintrc.js` |
| Prettier | 代码格式化 | `.prettierrc` |

### IDE 配置

**IDEA 推荐插件**:
- Lombok
- MyBatisX
- CheckStyle-IDEA
- SonarLint

**VS Code 推荐插件**:
- ESLint
- Prettier
- Volar
- TypeScript Vue Plugin

## 规范执行

### 1. 代码提交前

```bash
# 运行代码检查
npm run lint

# 运行单元测试
npm run test

# 格式化代码
npm run format
```

### 2. 代码审查时

- 使用 Pull Request 进行代码审查
- 至少需要一位审查者批准
- 自动化检查必须通过

### 3. 持续集成

```yaml
# CI 流程示例
stages:
  - lint
  - test
  - build

lint:
  script:
    - npm run lint
    - ./gradlew checkstyleMain

test:
  script:
    - npm run test
    - ./gradlew test
```

## 常见问题

### Q1: 命名规范和现有代码冲突怎么办？

新代码严格遵循规范，旧代码在重构时逐步修改，避免一次性大规模改动。

### Q2: 注释应该写多详细？

公共 API 必须有完整注释，内部实现根据复杂度决定，简单代码可以不写注释。

### Q3: 如何处理紧急修复和规范的冲突？

紧急修复优先保证功能，但需要在后续迭代中补齐规范要求。

## 最佳实践

1. **先理解后编码**: 编写代码前先理解需求和设计
2. **小步提交**: 每次提交只包含一个逻辑变更
3. **及时重构**: 发现问题及时修复，不要积累技术债务
4. **持续学习**: 关注行业最佳实践，持续改进

## 总结

开发规范是团队协作的基础，通过统一的规范：

- **提高代码质量**: 减少 Bug，提高可维护性
- **提升开发效率**: 减少沟通成本，加快开发速度
- **降低维护成本**: 代码更易理解，维护更简单
- **促进知识传承**: 新成员更快上手
