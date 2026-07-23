# 系统架构设计

> **文档状态**: <Ok/> 已完成
>
> **作者**: 抓蛙师
>
> **最后更新**: 2025-12-16

系统架构是软件系统的顶层设计,定义了系统的组织结构、技术选型、模块划分和交互方式。良好的架构设计是系统稳定性、可扩展性和可维护性的基础保障。本文档详细介绍RuoYi-Plus-UniApp全栈系统的整体架构设计原则和实践。

## 目录

- [系统架构概览](#系统架构概览)
- [技术选型](#技术选型)
- [分层架构设计](#分层架构设计)
- [模块划分](#模块划分)
- [数据流转](#数据流转)
- [部署架构](#部署架构)
- [架构演进](#架构演进)
- [设计原则](#设计原则)
- [最佳实践](#最佳实践)

---

## 系统架构概览

### 总体架构

RuoYi-Plus-UniApp采用**前后端分离**的全栈架构,支持**多端统一**开发:

```text
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                   │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│   PC管理端    │   H5移动端    │  微信小程序   │  其他小程序/APP   │
│              │              │              │                   │
│  Vue 3 +     │  UniApp +    │  UniApp +    │  UniApp +        │
│  Element+    │  Vue 3       │  Vue 3       │  Vue 3           │
└──────────────┴──────────────┴──────────────┴───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         网关层                                     │
├─────────────────────────────────────────────────────────────────┤
│  Nginx/对外API网关                                                │
│  - 负载均衡                                                        │
│  - 静态资源                                                        │
│  - SSL终止                                                        │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      业务应用层 (后端)                              │
├─────────────────────────────────────────────────────────────────┤
│  Spring Boot 3.5.12 + Java 17+                                    │
│                                                                   │
│  ┌────────────┬────────────┬────────────┬────────────┐          │
│  │  系统模块   │  业务模块   │  代码生成   │  扩展模块   │          │
│  │  System    │  Business  │  Generator │  Extend    │          │
│  └────────────┴────────────┴────────────┴────────────┘          │
│                                                                   │
│  ┌─────────────────────────────────────────────────┐            │
│  │              通用功能层 (Common)                   │            │
│  │  安全 | 权限 | 缓存 | 日志 | 文件 | 消息 | ...    │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      中间件层                                      │
├─────────────────────────────────────────────────────────────────┤
│  MySQL/PostgreSQL │  Redis    │  MinIO/S3  │  RabbitMQ(可选)   │
│  关系数据库        │  缓存     │  对象存储   │  消息队列         │
└─────────────────────────────────────────────────────────────────┘
```

### 架构特点

**1. 前后端分离**
- 前后端独立开发、部署
- RESTful API通信
- 职责清晰,便于维护

**2. 多端统一**
- UniApp一套代码编译多端
- 统一的组件库和API
- 降低开发和维护成本

**3. 模块化设计**
- 业务模块独立
- 通用功能抽取
- 便于扩展和复用

**4. 微内核架构**
- 核心功能精简
- 功能模块化
- 按需加载和组合

**5. 分层清晰**
- 表现层、业务层、数据层分离
- 依赖倒置,面向接口编程
- 易于测试和维护

---

## 技术选型

### 后端技术栈

| 技术 | 版本 | 说明 | 选型理由 |
|------|------|------|---------|
| **Java** | 17 | 编程语言 | - LTS长期支持版本<br>- 虚拟线程等新特性<br>- 性能提升显著 |
| **Spring Boot** | 3.5.12 | 应用框架 | - 约定优于配置<br>- 生态完善<br>- 快速开发 |
| **MyBatis-Plus** | 3.5.16 | ORM框架 | - 增强MyBatis<br>- 代码生成<br>- 高效便捷 |
| **Sa-Token** | 1.44.0 | 权限认证 | - 轻量灵活<br>- 功能强大<br>- 文档完善 |
| **Redis** | 7.x | 缓存中间件 | - 高性能<br>- 数据结构丰富<br>- 主流选择 |
| **Redisson** | 3.52.0 | Redis客户端 | - 分布式锁<br>- 集合操作<br>- 生产级 |
| **MySQL** | 5.7+ | 关系数据库 | - 开源免费<br>- 性能优秀<br>- 成熟稳定 |
| **Hutool** | 5.8.40 | 工具类库 | - 功能全面<br>- 易于使用<br>- 国产优秀 |
| **SpringDoc** | 2.8.13 | API文档 | - OpenAPI 3.0<br>- Swagger UI<br>- 自动生成 |
| **MinIO/AWS S3** | - | 对象存储 | - S3兼容<br>- 可私有化<br>- 高可用 |

参考: ruoyi-plus-uniapp/pom.xml:15-72

### 前端技术栈 (PC管理端)

| 技术 | 版本 | 说明 | 选型理由 |
|------|------|------|---------|
| **Vue 3** | 3.5.13 | 前端框架 | - Composition API<br>- 性能优化<br>- TypeScript支持 |
| **Element Plus** | 2.9.8 | UI组件库 | - 组件丰富<br>- 主题定制<br>- 中后台首选 |
| **Vite** | 6.3.2 | 构建工具 | - 极速启动<br>- 热更新快<br>- 开发体验好 |
| **Pinia** | 3.0.2 | 状态管理 | - 官方推荐<br>- 类型安全<br>- 模块化 |
| **Vue Router** | 4.5.0 | 路由管理 | - Vue官方<br>- 动态路由<br>- 路由守卫 |
| **TypeScript** | 5.8.3 | 类型系统 | - 类型安全<br>- 代码提示<br>- 易于维护 |
| **UnoCSS** | 66.5.2 | 原子化CSS | - 按需生成<br>- 体积小<br>- 自定义灵活 |
| **Axios** | 1.8.4 | HTTP客户端 | - 拦截器<br>- 请求取消<br>- 主流选择 |

参考: plus-ui/package.json:22-51

### 移动端技术栈

| 技术 | 版本 | 说明 | 选型理由 |
|------|------|------|---------|
| **UniApp** | 3.0.0 | 跨平台框架 | - 一套代码多端<br>- 生态完善<br>- DCloud官方 |
| **Vue 3** | 3.4.21 | 前端框架 | - 响应式系统<br>- Composition API<br>- 性能优秀 |
| **Pinia** | 2.0.36 | 状态管理 | - 轻量级<br>- 类型安全<br>- 模块化 |
| **Vite** | 6.3.5 | 构建工具 | - HMR快速<br>- 插件丰富<br>- 生产优化 |
| **TypeScript** | 5.7.2 | 类型系统 | - 类型检查<br>- 智能提示<br>- 重构方便 |
| **UnoCSS** | 65.4.2 | 原子化CSS | - 性能优秀<br>- 体积小<br>- 自定义 |
| **WD UI** | 自维护 | UI组件库 | - UniApp适配<br>- 功能完善<br>- 自定义扩展 |

参考: plus-uniapp/package.json:63-83

### 中间件选型

| 中间件 | 版本 | 用途 | 说明 |
|--------|------|------|------|
| **MySQL** | 5.7+ | 主数据库 | 存储业务数据 |
| **Redis** | 7.x | 缓存 | 缓存热点数据、分布式锁、会话 |
| **MinIO** | Latest | 对象存储 | 存储图片、文件等非结构化数据 |
| **Nginx** | 1.24+ | 反向代理 | 负载均衡、静态资源服务 |
| **SnailJob** | 1.8.0 | 任务调度 | 分布式任务调度和重试 |
| **RabbitMQ** | 3.x (可选) | 消息队列 | 异步解耦、削峰填谷 |

### 开发工具

| 工具 | 说明 |
|------|------|
| **IntelliJ IDEA** | Java后端开发IDE |
| **VS Code** | 前端和移动端开发编辑器 |
| **HBuilderX** | UniApp官方IDE (可选) |
| **Postman/Apifox** | API测试工具 |
| **Git** | 版本控制 |
| **Docker** | 容器化部署 |
| **Maven** | Java项目构建 |
| **pnpm** | Node.js包管理器 |

---

## 分层架构设计

### 后端分层架构

RuoYi-Plus-UniApp后端采用**四层架构**,自上而下分为:

```text
┌──────────────────────────────────────────┐
│           Controller层 (控制器层)          │
│  - 接收HTTP请求                           │
│  - 参数校验                                │
│  - 调用Service层                          │
│  - 返回响应                                │
│  示例: SysUserController                  │
└──────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────┐
│           Service层 (业务逻辑层)           │
│  - 业务逻辑编排                            │
│  - 事务管理                                │
│  - 调用Manager层                          │
│  - 数据转换(Bo <-> Vo)                    │
│  示例: UserServiceImpl                    │
└──────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────┐
│           Manager层 (通用业务层)           │
│  - 通用业务处理                            │
│  - 第三方服务封装                          │
│  - 缓存方案管理                            │
│  - 可被多个Service复用                     │
│  示例: UserManager                        │
└──────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────┐
│           Mapper层 (数据访问层)            │
│  - 数据库操作                              │
│  - SQL语句执行                             │
│  - 数据映射(Entity <-> DB)                │
│  示例: SysUserMapper                      │
└──────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────┐
│              数据库 (MySQL)                │
│  - 持久化数据                              │
│  - 表结构定义                              │
│  - 索引优化                                │
└──────────────────────────────────────────┘
```

**四层架构优势:**
- **职责更清晰**: Service专注业务编排,Manager处理通用逻辑
- **复用性更强**: Manager层可被多个Service复用,避免代码重复
- **解耦更彻底**: 第三方服务、缓存操作等下沉到Manager层
- **测试更方便**: 各层职责单一,便于单元测试

#### 1. Controller层

**职责:**
- 接收和响应HTTP请求
- 参数校验(@Validated)
- 权限校验(@SaCheckPermission)
- 调用Service层业务逻辑
- 统一响应封装(`R<T>`)

**规范:**
```java
/**
 * 用户管理控制器
 *
 * @author 抓蛙师
 * @date 2025-11-02
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/system/user")
public class SysUserController extends BaseController {

    private final IUserService userService;

    /**
     * 查询用户列表
     */
    @SaCheckPermission("system:user:list")
    @GetMapping("/list")
    public TableDataInfo<UserVo> list(UserBo user, PageQuery pageQuery) {
        return userService.queryPageList(user, pageQuery);
    }

    /**
     * 新增用户
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody UserBo user) {
        if (!userService.checkUserNameUnique(user)) {
            return R.fail("新增用户失败,登录账号已存在");
        }
        user.setCreateBy(getUsername());
        user.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
        return toAjax(userService.insertUser(user));
    }
}
```

**最佳实践:**
- <Ok/> Controller只做路由和参数校验,不包含业务逻辑
- <Ok/> 使用构造函数注入依赖(@RequiredArgsConstructor)
- <Ok/> 使用@Validated进行参数校验
- <Ok/> 使用@SaCheckPermission进行权限校验
- <Ok/> 统一使用`R<T>`返回响应
- <No/> 不要在Controller中处理业务逻辑
- <No/> 不要直接调用Mapper层

#### 2. Service层

**职责:**
- 业务逻辑编排和组合
- 事务管理(@Transactional)
- 数据转换(Bo <-> Vo)
- 调用Manager层处理通用逻辑
- 业务规则校验

**规范:**
```java
/**
 * 用户服务实现类
 *
 * @author 抓蛙师
 * @date 2025-11-02
 */
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements IUserService {

    private final UserManager userManager;
    private final RoleManager roleManager;

    /**
     * 根据条件分页查询用户列表
     */
    @Override
    public TableDataInfo<UserVo> queryPageList(UserBo user, PageQuery pageQuery) {
        return userManager.queryPageList(user, pageQuery);
    }

    /**
     * 新增用户
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertUser(UserBo user) {
        // 1. 业务规则校验
        userManager.checkUserAllowed(user);

        // 2. 创建用户
        int rows = userManager.createUser(user);

        // 3. 新增用户角色关联
        if (CollUtil.isNotEmpty(user.getRoleIds())) {
            roleManager.insertUserRoles(user.getUserId(), user.getRoleIds());
        }

        return rows;
    }
}
```

**最佳实践:**
- <Ok/> Service层负责业务编排和事务管理
- <Ok/> 使用@Transactional管理事务边界
- <Ok/> 调用Manager层处理具体逻辑
- <Ok/> 不同Service之间通过Manager层共享逻辑
- <No/> 不要在Service中处理HTTP相关逻辑
- <No/> 避免Service之间循环依赖
- <No/> 避免在Service中直接调用Mapper

#### 3. Manager层

**职责:**
- 通用业务处理(可被多个Service复用)
- 第三方服务封装(短信、支付、OSS等)
- 缓存方案管理(Redis操作封装)
- 数据访问封装(调用Mapper层)
- 与DAO层交互,屏蔽底层细节

**规范:**
```java
/**
 * 用户通用业务处理层
 *
 * @author 抓蛙师
 * @date 2025-11-02
 */
@RequiredArgsConstructor
@Component
public class UserManager {

    private final SysUserMapper userMapper;
    private final RedisCache redisCache;

    /**
     * 根据条件分页查询用户列表
     */
    public TableDataInfo<UserVo> queryPageList(UserBo user, PageQuery pageQuery) {
        LambdaQueryWrapper<SysUser> lqw = buildQueryWrapper(user);
        Page<UserVo> result = userMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 创建用户
     */
    public int createUser(UserBo user) {
        SysUser sysUser = BeanUtil.toBean(user, SysUser.class);
        sysUser.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
        int rows = userMapper.insert(sysUser);

        // 清除用户缓存
        clearUserCache(sysUser.getUserId());

        return rows;
    }

    /**
     * 根据ID查询用户(带缓存)
     */
    public SysUser getUserById(Long userId) {
        String cacheKey = CacheConstants.USER_KEY + userId;
        return redisCache.getCacheObject(cacheKey, () -> {
            return userMapper.selectById(userId);
        }, CacheConstants.USER_EXPIRE);
    }

    /**
     * 校验用户是否允许操作
     */
    public void checkUserAllowed(UserBo user) {
        if (ObjectUtil.isNotNull(user.getUserId()) && user.isAdmin()) {
            throw new ServiceException("不允许操作超级管理员用户");
        }
    }

    /**
     * 清除用户缓存
     */
    public void clearUserCache(Long userId) {
        String cacheKey = CacheConstants.USER_KEY + userId;
        redisCache.deleteObject(cacheKey);
    }

    /**
     * 构建查询条件
     */
    private LambdaQueryWrapper<SysUser> buildQueryWrapper(UserBo user) {
        LambdaQueryWrapper<SysUser> lqw = Wrappers.lambdaQuery();
        lqw.like(StringUtils.isNotBlank(user.getUserName()),
                 SysUser::getUserName, user.getUserName());
        lqw.eq(StringUtils.isNotBlank(user.getStatus()),
               SysUser::getStatus, user.getStatus());
        return lqw;
    }
}
```

**Manager层适用场景:**
1. **缓存管理**: 统一处理缓存的读写和失效
2. **第三方服务**: 封装短信、邮件、支付等外部调用
3. **通用逻辑复用**: 多个Service需要调用的相同逻辑
4. **数据组装**: 复杂的数据查询和组装逻辑
5. **跨表操作**: 不涉及事务的跨表数据操作

**最佳实践:**
- <Ok/> Manager层可被多个Service复用
- <Ok/> 封装缓存操作,Service层无需关心缓存细节
- <Ok/> 封装第三方服务调用
- <Ok/> 使用@Component注解标注
- <No/> 不要在Manager层管理事务(事务在Service层)
- <No/> 不要处理Controller相关逻辑

#### 4. Mapper层

**职责:**
- 定义数据库操作接口
- SQL语句映射
- 继承MyBatis-Plus BaseMapper
- 自定义复杂SQL

**规范:**
```java
/**
 * 用户数据访问层
 *
 * @author 抓蛙师
 * @date 2025-11-02
 */
public interface SysUserMapper extends BaseMapper<SysUser> {

    /**
     * 根据条件分页查询用户列表
     */
    Page<UserVo> selectUserList(Page<UserVo> page, @Param("ew") Wrapper<SysUser> wrapper);

    /**
     * 查询用户及角色信息
     */
    UserVo selectUserWithRoles(@Param("userId") Long userId);
}
```

**Mapper XML:**
```xml
<!-- SysUserMapper.xml -->
<mapper namespace="plus.ruoyi.system.mapper.SysUserMapper">

    <resultMap id="UserVoResult" type="plus.ruoyi.system.domain.vo.UserVo">
        <id property="userId" column="user_id"/>
        <result property="userName" column="user_name"/>
        <collection property="roles" ofType="plus.ruoyi.system.domain.SysRole">
            <id property="roleId" column="role_id"/>
            <result property="roleName" column="role_name"/>
        </collection>
    </resultMap>

    <select id="selectUserWithRoles" resultMap="UserVoResult">
        SELECT u.*, r.role_id, r.role_name
        FROM sys_user u
        LEFT JOIN sys_user_role ur ON u.user_id = ur.user_id
        LEFT JOIN sys_role r ON ur.role_id = r.role_id
        WHERE u.user_id = #{userId}
    </select>

</mapper>
```

**最佳实践:**
- <Ok/> Mapper继承BaseMapper获得基础CRUD
- <Ok/> 简单查询使用Wrapper
- <Ok/> 复杂查询写XML
- <Ok/> 使用resultMap映射复杂对象
- <No/> 不要在Mapper中处理业务逻辑
- <No/> 避免N+1查询问题

### 前端分层架构

前端采用**MVVM架构**,分为:

```text
┌──────────────────────────────────────────┐
│             View层 (视图层)                │
│  - Vue组件                                │
│  - 模板渲染                                │
│  - 用户交互                                │
│  示例: UserList                           │
└──────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────┐
│          ViewModel层 (视图模型层)          │
│  - Composition API                        │
│  - 状态管理(Pinia)                        │
│  - 业务逻辑                                │
│  - 调用API                                │
└──────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────┐
│             Model层 (数据层)               │
│  - API接口定义                             │
│  - 类型定义(TypeScript)                   │
│  - HTTP请求                                │
│  - 示例: userApi.ts                       │
└──────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────┐
│              后端API                       │
│  - RESTful接口                            │
│  - JSON数据                                │
└──────────────────────────────────────────┘
```

**示例:**

```vue
<!-- View层 - UserList.vue -->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" inline>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="userList">
      <el-table-column prop="userName" label="用户名称" />
      <el-table-column prop="nickName" label="昵称" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
// ViewModel层
import { ref, reactive } from 'vue'
import { listUsers } from '@/api/system/user'
import type { UserQuery, UserVo } from '@/api/system/user/types'

const loading = ref(false)
const userList = ref<UserVo[]>([])

const queryParams = reactive<UserQuery>({
  userName: '',
  pageNum: 1,
  pageSize: 10
})

/**
 * 查询用户列表
 */
const getList = async () => {
  loading.value = true
  try {
    const response = await listUsers(queryParams)
    userList.value = response.data.records
  } catch (error) {
    console.error('查询用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 查询按钮操作
 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/**
 * 重置按钮操作
 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

// 初始化
getList()
</script>
```

```typescript
// Model层 - userApi.ts
import http from '@/utils/http'
import type { PageResult, Result } from '@/types/global'
import type { UserQuery, UserVo } from './types'

/**
 * 查询用户列表
 */
export const listUsers = (query: UserQuery): Result<PageResult<UserVo>> => {
  return http.get<PageResult<UserVo>>('/system/user/list', query)
}

/**
 * 新增用户
 */
export const addUser = (data: UserVo): Result<void> => {
  return http.post<void>('/system/user', data)
}
```

---

## 模块划分

### 后端模块结构

```text
ruoyi-plus-uniapp/
├── ruoyi-admin/                # 启动模块
│   ├── src/main/java/
│   │   └── plus/ruoyi/         # 启动类
│   └── src/main/resources/     # 配置文件
│
├── ruoyi-common/               # 通用模块(35个子模块)
│   ├── ruoyi-common-core/      # 核心模块
│   ├── ruoyi-common-web/       # Web模块
│   ├── ruoyi-common-security/  # 安全模块
│   ├── ruoyi-common-satoken/   # Sa-Token模块
│   ├── ruoyi-common-mybatis/   # MyBatis-Plus模块
│   ├── ruoyi-common-redis/     # Redis模块
│   ├── ruoyi-common-oss/       # 对象存储模块
│   ├── ruoyi-common-sms/       # 短信模块
│   ├── ruoyi-common-mail/      # 邮件模块
│   ├── ruoyi-common-log/       # 日志模块
│   ├── ruoyi-common-excel/     # Excel模块
│   ├── ruoyi-common-doc/       # 文档模块
│   ├── ruoyi-common-json/      # JSON模块
│   ├── ruoyi-common-encrypt/   # 加密模块
│   ├── ruoyi-common-sensitive/ # 脱敏模块
│   ├── ruoyi-common-tenant/    # 多租户模块
│   ├── ruoyi-common-idempotent/# 幂等模块
│   ├── ruoyi-common-ratelimiter/# 限流模块
│   ├── ruoyi-common-websocket/ # WebSocket模块
│   ├── ruoyi-common-sse/       # SSE模块
│   ├── ruoyi-common-social/    # 第三方登录模块
│   ├── ruoyi-common-miniapp/   # 小程序模块
│   ├── ruoyi-common-pay/       # 支付模块
│   ├── ruoyi-common-job/       # 任务调度模块
│   ├── ruoyi-common-http/      # HTTP客户端模块
│   ├── ruoyi-common-media/     # 媒体处理模块
│   ├── ruoyi-common-langchain4j/# AI模块
│   └── ...                     # 其他通用模块
│
├── ruoyi-modules/              # 业务模块
│   ├── ruoyi-system/           # 系统模块
│   │   ├── domain/             # 实体类
│   │   ├── mapper/             # 数据访问层
│   │   ├── service/            # 业务逻辑层
│   │   └── controller/         # 控制器层
│   ├── ruoyi-generator/        # 代码生成模块
│   └── ruoyi-business/         # 业务模块(自定义)
│
└── ruoyi-extend/               # 扩展模块
    ├── ruoyi-monitor-admin/    # 监控模块
    └── ruoyi-snailjob-server/  # 任务调度服务器
```

参考: ruoyi-plus-uniapp/pom.xml:403-408

### 核心模块说明

#### 1. ruoyi-admin (启动模块)

**功能:**
- Spring Boot启动类
- 配置文件(application.yml)
- 静态资源
- 应用入口

**目录结构:**
```text
ruoyi-admin/
├── src/main/java/plus/ruoyi/
│   └── RuoYiApplication.java        # 启动类
├── src/main/resources/
│   ├── application.yml              # 主配置
│   ├── application-dev.yml          # 开发环境
│   ├── application-prod.yml         # 生产环境
│   ├── logback-spring.xml           # 日志配置
│   └── banner.txt                   # 启动横幅
└── pom.xml                          # Maven配置
```

#### 2. ruoyi-common (通用模块)

**ruoyi-common-core (核心模块)**

提供最基础的功能:
- 统一响应(`R<T>`)
- 异常定义
- 工具类
- 常量定义
- 基础配置

**ruoyi-common-web (Web模块)**

提供Web相关功能:
- 全局异常处理
- 统一返回处理
- 跨域配置
- 过滤器/拦截器
- XSS防护

**ruoyi-common-security (安全模块)**

提供安全相关功能:
- 密码加密
- 数据权限
- 请求解密
- 响应加密

**ruoyi-common-mybatis (MyBatis-Plus模块)**

提供数据库相关功能:
- MyBatis-Plus配置
- 分页插件
- 自动填充
- 数据权限拦截

**ruoyi-common-redis (Redis模块)**

提供缓存相关功能:
- Redis配置
- 缓存工具类
- 分布式锁
- 限流实现

#### 3. ruoyi-modules (业务模块)

**ruoyi-system (系统模块)**

提供系统管理功能:
- 用户管理
- 角色管理
- 菜单管理
- 部门管理
- 岗位管理
- 字典管理
- 参数管理
- 通知公告
- 日志管理
- OSS管理

**ruoyi-business (业务模块)**

提供自定义业务功能,按需开发:
- 业务表管理
- 自定义功能
- 项目特定业务

**ruoyi-generator (代码生成模块)**

提供代码生成功能:
- 数据库表导入
- 代码模板配置
- 一键生成CRUD代码

### 前端模块结构

```text
plus-ui/                        # PC管理端
├── src/
│   ├── api/                    # API接口
│   │   ├── system/             # 系统模块API
│   │   └── business/           # 业务模块API
│   ├── assets/                 # 静态资源
│   ├── components/             # 通用组件
│   ├── composables/            # 组合式函数
│   ├── layout/                 # 布局组件
│   ├── plugins/                # 插件配置
│   ├── router/                 # 路由配置
│   ├── stores/                 # Pinia状态管理
│   ├── styles/                 # 全局样式
│   ├── types/                  # TypeScript类型
│   ├── utils/                  # 工具函数
│   ├── views/                  # 页面组件
│   │   ├── system/             # 系统管理页面
│   │   ├── business/           # 业务页面
│   │   └── ...
│   ├── App                     # 根组件
│   └── main.ts                 # 入口文件
├── public/                     # 公共资源
├── index.html                  # HTML模板
├── vite.config.ts              # Vite配置
├── tsconfig.json               # TypeScript配置
└── package.json                # 依赖配置
```

参考: plus-ui/package.json

### 移动端模块结构

```text
plus-uniapp/                    # UniApp移动端
├── src/
│   ├── api/                    # API接口
│   │   ├── auth/               # 认证相关
│   │   ├── user/               # 用户相关
│   │   └── ...
│   ├── components/             # 通用组件
│   ├── composables/            # 组合式函数
│   │   ├── useAuth.ts          # 认证
│   │   ├── useRequest.ts       # 请求
│   │   └── ...
│   ├── pages/                  # 页面
│   │   ├── index/              # 首页
│   │   ├── user/               # 用户中心
│   │   └── ...
│   ├── static/                 # 静态资源
│   ├── stores/                 # Pinia状态
│   │   ├── user.ts             # 用户状态
│   │   ├── app.ts              # 应用状态
│   │   └── ...
│   ├── styles/                 # 全局样式
│   ├── types/                  # TypeScript类型
│   ├── utils/                  # 工具函数
│   │   ├── http.ts             # HTTP封装
│   │   ├── auth.ts             # 认证工具
│   │   └── ...
│   ├── wd/                     # WD UI组件库
│   │   ├── components/         # 组件
│   │   │   ├── wd-button/
│   │   │   ├── wd-icon/
│   │   │   └── ...
│   │   └── index.ts            # 导出
│   ├── App                     # 根组件
│   └── main.ts                 # 入口文件
├── manifest.json               # 应用配置
├── pages.json                  # 页面路由配置
├── uni.scss                    # 全局样式变量
├── vite.config.ts              # Vite配置
├── tsconfig.json               # TypeScript配置
└── package.json                # 依赖配置
```

参考: plus-uniapp/package.json

---

## 数据流转

### 请求处理流程

#### 1. 用户请求流程

```text
┌─────────┐        ┌─────────┐        ┌──────────┐
│ 用户操作  │───────>│ 前端应用  │───────>│ Nginx    │
└─────────┘        └─────────┘        └──────────┘
                                            │
                                            ▼
                   ┌────────────────────────────────┐
                   │       后端Spring Boot          │
                   │  ┌──────────────────────────┐  │
                   │  │  1. Filter过滤器          │  │
                   │  │  - XSS过滤               │  │
                   │  │  - CORS跨域              │  │
                   │  └──────────────────────────┘  │
                   │               ▼                 │
                   │  ┌──────────────────────────┐  │
                   │  │  2. Interceptor拦截器     │  │
                   │  │  - 认证校验(Sa-Token)    │  │
                   │  │  - 权限校验              │  │
                   │  │  - 日志记录              │  │
                   │  └──────────────────────────┘  │
                   │               ▼                 │
                   │  ┌──────────────────────────┐  │
                   │  │  3. Controller           │  │
                   │  │  - 参数校验(@Validated)  │  │
                   │  │  - 调用Service          │  │
                   │  └──────────────────────────┘  │
                   │               ▼                 │
                   │  ┌──────────────────────────┐  │
                   │  │  4. Service              │  │
                   │  │  - 业务逻辑处理          │  │
                   │  │  - 事务管理              │  │
                   │  └──────────────────────────┘  │
                   │               ▼                 │
                   │  ┌──────────────────────────┐  │
                   │  │  5. Mapper               │  │
                   │  │  - 数据库操作            │  │
                   │  └──────────────────────────┘  │
                   └────────────────────────────────┘
                                  │
                                  ▼
                   ┌────────────────────────────────┐
                   │       MySQL数据库               │
                   └────────────────────────────────┘
```

#### 2. 登录认证流程

```text
┌─────────┐
│  用户    │
└────┬────┘
     │ 1. 输入账号密码
     ▼
┌─────────────┐
│  前端应用    │
└──────┬──────┘
       │ 2. POST /login
       ▼
┌────────────────────┐
│  后端SysLoginService │
└──────┬─────────────┘
       │ 3. 校验用户名密码
       ▼
┌────────────────────┐
│  Sa-Token          │
│  生成Token         │
└──────┬─────────────┘
       │ 4. 返回Token
       ▼
┌────────────────────┐
│  前端存储Token      │
│  (LocalStorage)    │
└──────┬─────────────┘
       │ 5. 后续请求携带Token
       ▼
┌────────────────────┐
│  后端验证Token      │
│  (Sa-Token拦截器)  │
└────────────────────┘
```

#### 3. 数据权限流程

```text
┌─────────┐
│ 用户请求  │
└────┬────┘
     │
     ▼
┌────────────────────┐
│  Controller        │
│  @SaCheckPermission│
└────────┬───────────┘
         │ 权限校验通过
         ▼
┌────────────────────┐
│  Service           │
│  业务逻辑处理       │
└────────┬───────────┘
         │
         ▼
┌────────────────────────────┐
│  Mapper                    │
│  MyBatis-Plus拦截器        │
│  自动添加数据权限SQL        │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  原SQL:                     │
│  SELECT * FROM sys_user     │
│                            │
│  添加数据权限后:            │
│  SELECT * FROM sys_user    │
│  WHERE dept_id IN (1,2,3)  │
└────────────────────────────┘
         │
         ▼
┌────────────────────┐
│  MySQL数据库        │
└────────────────────┘
```

### 缓存使用流程

```text
┌─────────┐
│ 请求数据  │
└────┬────┘
     │
     ▼
┌────────────────────┐
│  查询Redis缓存      │
└────────┬───────────┘
         │
    命中? ├─是─> 返回缓存数据
         │
        否│
         ▼
┌────────────────────┐
│  查询MySQL数据库    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  写入Redis缓存      │
│  (设置过期时间)     │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  返回数据          │
└────────────────────┘
```

**缓存策略:**

1. **旁路缓存 (Cache Aside)**
   ```java
   // 查询
   public User getUser(Long userId) {
       // 1. 查询缓存
       String cacheKey = "user:" + userId;
       User user = redisCache.getCacheObject(cacheKey);

       // 2. 缓存命中
       if (user != null) {
           return user;
       }

       // 3. 缓存未命中,查询数据库
       user = userMapper.selectById(userId);

       // 4. 写入缓存
       if (user != null) {
           redisCache.setCacheObject(cacheKey, user, 30, TimeUnit.MINUTES);
       }

       return user;
   }

   // 更新
   public void updateUser(User user) {
       // 1. 更新数据库
       userMapper.updateById(user);

       // 2. 删除缓存
       String cacheKey = "user:" + user.getUserId();
       redisCache.deleteObject(cacheKey);
   }
   ```

2. **Spring Cache注解**
   ```java
   @Cacheable(cacheNames = "user", key = "#userId")
   public User getUser(Long userId) {
       return userMapper.selectById(userId);
   }

   @CacheEvict(cacheNames = "user", key = "#user.userId")
   public void updateUser(User user) {
       userMapper.updateById(user);
   }
   ```

---

## 部署架构

### 单机部署架构

适用于小型项目或开发环境:

```text
┌─────────────────────────────────────┐
│           服务器                      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Nginx (80/443)              │  │
│  │  - 反向代理                   │  │
│  │  - 静态资源服务               │  │
│  └────────┬─────────────────────┘  │
│           │                         │
│  ┌────────▼─────────────────────┐  │
│  │  Spring Boot (8080)          │  │
│  │  - Java应用                   │  │
│  └────────┬─────────────────────┘  │
│           │                         │
│  ┌────────▼──────┬──────────────┐  │
│  │  MySQL        │  Redis       │  │
│  │  (3306)       │  (6379)      │  │
│  └───────────────┴──────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**配置示例:**

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源
    location / {
        root /www/plus-ui/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 集群部署架构

适用于生产环境:

```text
┌──────────────────── 用户 ─────────────────────┐
                        │
                        ▼
┌────────────────────────────────────────────────┐
│              负载均衡 (Nginx/SLB)               │
│              - 负载分发                         │
│              - SSL终止                         │
└────────────────┬───────────────────────────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
    ┌──────┐ ┌──────┐ ┌──────┐
    │App-1 │ │App-2 │ │App-3 │  应用服务器集群
    └───┬──┘ └───┬──┘ └───┬──┘
        │        │        │
        └────────┼────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
    ┌──────┐ ┌──────┐ ┌──────┐
    │Redis │ │Redis │ │Redis │  Redis集群
    │Master│ │Slave │ │Slave │  (主从/哨兵)
    └──────┘ └──────┘ └──────┘
                 │
                 ▼
        ┌───────────────┐
        │  MySQL主从     │  数据库集群
        │  Master/Slave  │  (读写分离)
        └───────────────┘
                 │
                 ▼
        ┌───────────────┐
        │  MinIO集群     │  对象存储集群
        │  (分布式)      │  (高可用)
        └───────────────┘
```

### Docker容器化部署

推荐使用Docker Compose进行容器化部署:

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  # MySQL数据库
  mysql:
    image: mysql:8.0
    container_name: ruoyi-mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: ryplus_uni
      TZ: Asia/Shanghai
    volumes:
      - ./mysql/data:/var/lib/mysql
      - ./mysql/conf:/etc/mysql/conf.d
      - ./mysql/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    networks:
      - ruoyi-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: ruoyi-redis
    command: redis-server --requirepass password
    volumes:
      - ./redis/data:/data
    ports:
      - "6379:6379"
    networks:
      - ruoyi-network

  # Spring Boot应用
  ruoyi-app:
    build: ./ruoyi-admin
    container_name: ruoyi-app
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ryplus_uni?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: password
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PASSWORD: password
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - redis
    networks:
      - ruoyi-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: ruoyi-nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/html:/usr/share/nginx/html
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - ruoyi-app
    networks:
      - ruoyi-network

networks:
  ruoyi-network:
    driver: bridge
```

**启动命令:**

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f ruoyi-app

# 停止服务
docker-compose down
```

### Kubernetes部署

适用于大规模生产环境:

**deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ruoyi-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ruoyi-app
  template:
    metadata:
      labels:
        app: ruoyi-app
    spec:
      containers:
      - name: ruoyi-app
        image: ruoyi/ruoyi-app:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            configMapKeyRef:
              name: ruoyi-config
              key: database.url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ruoyi-service
  namespace: production
spec:
  selector:
    app: ruoyi-app
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 8080
  type: LoadBalancer
```

---

## 架构演进

### 版本演进历史

#### v1.0 - 单体架构
- 所有功能在一个应用中
- 适合快速启动
- 便于开发和调试

#### v2.0 - 模块化单体
- 功能模块化拆分
- 通用功能抽取
- 保持部署简单

#### v3.0 - 前后端分离
- **当前版本**
- 前后端独立开发部署
- RESTful API通信
- 多端统一

#### v4.0 - 微服务架构 (规划中)
- 服务拆分
- 服务治理
- 分布式事务

### 未来架构规划

```text
┌─────────────── 微服务架构 ────────────────┐
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         API网关 (Gateway)           │ │
│  │  - 路由转发                         │ │
│  │  - 认证鉴权                         │ │
│  │  - 限流熔断                         │ │
│  └────────────────────────────────────┘ │
│                   │                      │
│      ┌────────────┼────────────┐        │
│      ▼            ▼            ▼        │
│  ┌──────┐    ┌──────┐    ┌──────┐      │
│  │用户服务│    │订单服务│    │商品服务│      │
│  └──────┘    └──────┘    └──────┘      │
│      │            │            │        │
│      └────────────┼────────────┘        │
│                   │                      │
│      ┌────────────┼────────────┐        │
│      ▼            ▼            ▼        │
│  ┌──────────────────────────────────┐  │
│  │      服务治理 (Nacos/Consul)      │  │
│  │  - 服务注册发现                    │  │
│  │  - 配置中心                        │  │
│  └──────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

---

## 设计原则

### SOLID原则

#### 1. 单一职责原则 (Single Responsibility)

每个类只负责一项职责。

**示例:**

```java
// ❌ 不好: 职责混乱
public class UserService {
    // 业务逻辑
    public void createUser(User user) { }

    // 数据库操作
    public User findUserById(Long id) { }

    // 邮件发送
    public void sendWelcomeEmail(User user) { }

    // 日志记录
    public void logUserAction(String action) { }
}

// ✅ 好: 职责清晰
public class UserService {
    // 只负责业务逻辑
    public void createUser(User user) {
        userMapper.insert(user);
        emailService.sendWelcomeEmail(user);
        logService.log("创建用户: " + user.getUserName());
    }
}

public class EmailService {
    // 只负责邮件发送
    public void sendWelcomeEmail(User user) { }
}

public class LogService {
    // 只负责日志记录
    public void log(String message) { }
}
```

#### 2. 开闭原则 (Open-Closed)

对扩展开放,对修改关闭。

**示例:**

```java
// ❌ 不好: 每次新增类型都要修改
public class PaymentService {
    public void pay(String type, BigDecimal amount) {
        if ("alipay".equals(type)) {
            // 支付宝支付
        } else if ("wechat".equals(type)) {
            // 微信支付
        } else if ("union".equals(type)) {
            // 银联支付
        }
        // 新增支付方式需要修改这个方法
    }
}

// ✅ 好: 使用策略模式,新增类型无需修改
public interface PaymentStrategy {
    void pay(BigDecimal amount);
}

public class AlipayStrategy implements PaymentStrategy {
    @Override
    public void pay(BigDecimal amount) {
        // 支付宝支付
    }
}

public class WechatStrategy implements PaymentStrategy {
    @Override
    public void pay(BigDecimal amount) {
        // 微信支付
    }
}

public class PaymentService {
    private Map<String, PaymentStrategy> strategies;

    public void pay(String type, BigDecimal amount) {
        PaymentStrategy strategy = strategies.get(type);
        strategy.pay(amount);
    }
}
```

#### 3. 里氏替换原则 (Liskov Substitution)

子类可以替换父类。

#### 4. 接口隔离原则 (Interface Segregation)

使用多个专门的接口,而不是单一的总接口。

#### 5. 依赖倒置原则 (Dependency Inversion)

依赖抽象而不是具体实现。

```java
// ❌ 不好: 依赖具体实现
public class UserController {
    private UserServiceImpl userService; // 依赖具体类
}

// ✅ 好: 依赖抽象接口
public class UserController {
    private final IUserService userService; // 依赖接口
}
```

### 其他设计原则

**1. DRY原则 (Don't Repeat Yourself)**

避免代码重复,抽取公共逻辑。

**2. KISS原则 (Keep It Simple, Stupid)**

保持简单,避免过度设计。

**3. YAGNI原则 (You Aren't Gonna Need It)**

不要过度设计,只实现当前需要的功能。

**4. 迪米特法则 (Law of Demeter)**

最少知识原则,降低耦合度。

---

## 最佳实践

### 1. 分层规范

**规范:**
- Controller层不处理业务逻辑
- Service层不处理HTTP相关内容
- Mapper层只做数据访问

**示例:**

```java
// ✅ 正确的分层
@RestController
public class UserController {
    private final IUserService userService;

    @PostMapping("/user")
    public R<Void> add(@Validated @RequestBody UserBo user) {
        // 只做参数校验和调用Service
        userService.createUser(user);
        return R.ok();
    }
}

@Service
public class UserServiceImpl implements IUserService {
    private final SysUserMapper userMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createUser(UserBo user) {
        // 处理业务逻辑
        SysUser entity = BeanUtil.toBean(user, SysUser.class);
        entity.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
        userMapper.insert(entity);
    }
}
```

### 2. 依赖注入

**规范:**
- 使用构造函数注入
- 避免@Autowired字段注入
- 使用final确保不可变

**示例:**

```java
// ❌ 不推荐: 字段注入
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
}

// ✅ 推荐: 构造函数注入
@RequiredArgsConstructor
@Service
public class UserService {
    private final UserMapper userMapper;
}
```

### 3. 异常处理

**规范:**
- 使用全局异常处理
- 自定义业务异常
- 统一错误响应

**示例:**

```java
// 全局异常处理器
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e) {
        return R.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常:", e);
        return R.fail("系统错误,请联系管理员");
    }
}

// 业务异常
public class ServiceException extends RuntimeException {
    private Integer code;

    public ServiceException(String message) {
        super(message);
        this.code = 500;
    }

    public ServiceException(Integer code, String message) {
        super(message);
        this.code = code;
    }
}
```

### 4. 缓存使用

**规范:**
- 合理设置过期时间
- 防止缓存穿透/击穿/雪崩
- 更新时删除缓存

**示例:**

```java
@Service
public class UserService {

    // 使用Spring Cache注解
    @Cacheable(cacheNames = "user", key = "#userId", unless = "#result == null")
    public User getUser(Long userId) {
        return userMapper.selectById(userId);
    }

    @CacheEvict(cacheNames = "user", key = "#user.userId")
    public void updateUser(User user) {
        userMapper.updateById(user);
    }

    // 防止缓存穿透
    public User getUserSafe(Long userId) {
        String cacheKey = "user:" + userId;

        // 1. 查询缓存
        User user = redisCache.getCacheObject(cacheKey);
        if (user != null) {
            return user;
        }

        // 2. 使用分布式锁防止缓存击穿
        String lockKey = "lock:user:" + userId;
        try {
            if (redisCache.lock(lockKey, 10, TimeUnit.SECONDS)) {
                // 再次查询缓存(双重检查)
                user = redisCache.getCacheObject(cacheKey);
                if (user != null) {
                    return user;
                }

                // 3. 查询数据库
                user = userMapper.selectById(userId);

                // 4. 写入缓存(即使为null也缓存,防止穿透)
                if (user != null) {
                    redisCache.setCacheObject(cacheKey, user, 30, TimeUnit.MINUTES);
                } else {
                    redisCache.setCacheObject(cacheKey, new User(), 5, TimeUnit.MINUTES);
                }

                return user;
            }
        } finally {
            redisCache.unlock(lockKey);
        }

        return null;
    }
}
```

### 5. 事务管理

**规范:**
- 使用`@Transactional`注解,指定`rollbackFor = Exception.class`
- 避免大事务,将耗时的非事务操作移出事务边界
- 同类内部调用带`@Transactional`的方法时,必须通过`SpringUtils.getAopProxy(this)`获取代理对象调用,否则事务不生效

**事务失效的常见原因:**

Spring的`@Transactional`是基于AOP代理实现的。当在同一个类中直接调用带`@Transactional`注解的方法时,调用不经过Spring代理,事务注解不会被拦截处理,导致事务不生效。框架提供了`SpringUtils.getAopProxy()`工具方法来解决这个问题。

**示例:**

```java
@Service
public class OrderService {

    // ✅ 正确的事务管理
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(OrderBo orderBo) {
        // 1. 创建订单
        Order order = BeanUtil.toBean(orderBo, Order.class);
        orderMapper.insert(order);

        // 2. 扣减库存
        for (OrderItem item : orderBo.getItems()) {
            productMapper.decreaseStock(item.getProductId(), item.getQuantity());
        }

        // 3. 记录日志
        orderLogMapper.insert(new OrderLog(order.getOrderId(), "订单创建"));
    }

    // ❌ 避免大事务
    @Transactional(rollbackFor = Exception.class)
    public void processOrder(Long orderId) {
        // 复杂的业务逻辑
        // 外部API调用(耗时)
        // 大量数据处理
        // 会长时间占用数据库连接
    }

    // ✅ 拆分事务 - 将耗时操作移出事务边界
    public void processOrder(Long orderId) {
        // 1. 非事务操作
        OrderVo order = orderMapper.selectById(orderId);

        // 2. 调用外部API(非事务)
        PaymentResult result = paymentService.pay(order);

        // 3. 事务操作 - 必须通过代理对象调用,否则@Transactional不生效
        SpringUtils.getAopProxy(this).updateOrderStatus(orderId, result);
    }

    // ❌ 错误: 同类内部直接调用,事务不生效
    public void processOrderWrong(Long orderId) {
        OrderVo order = orderMapper.selectById(orderId);
        PaymentResult result = paymentService.pay(order);
        // 直接调用 this.updateOrderStatus() 不经过Spring代理,@Transactional无效
        updateOrderStatus(orderId, result);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(Long orderId, PaymentResult result) {
        orderMapper.updateStatus(orderId, result.getStatus());
        orderLogMapper.insert(new OrderLog(orderId, "状态变更: " + result.getStatus()));
    }
}
```

### 6. 日志记录

**规范:**
- 使用日志框架(Logback/Log4j2)
- 合理使用日志级别
- 记录关键信息

**示例:**

```java
@Slf4j
@Service
public class UserService {

    public void createUser(UserBo user) {
        log.info("开始创建用户, userName: {}", user.getUserName());

        try {
            // 业务逻辑
            userMapper.insert(user);

            log.info("用户创建成功, userId: {}", user.getUserId());
        } catch (Exception e) {
            log.error("创建用户失败, userName: {}", user.getUserName(), e);
            throw new ServiceException("创建用户失败");
        }
    }

    // ✅ 使用占位符,而不是字符串拼接
    log.info("用户登录成功, userId: {}, userName: {}", userId, userName);

    // ❌ 避免字符串拼接
    log.info("用户登录成功, userId: " + userId + ", userName: " + userName);

    // ✅ 敏感信息脱敏
    log.info("用户注册, mobile: {}", desensitize(mobile));

    // ❌ 不要记录密码等敏感信息
    log.info("用户登录, password: {}", password);
}
```

### 7. 接口设计

**规范:**
- 遵循RESTful规范
- 统一响应格式
- 版本管理

**示例:**

```java
// ✅ RESTful设计
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    // GET /api/v1/users - 查询列表
    @GetMapping
    public R<PageResult<UserVo>> list(UserQuery query) { }

    // GET /api/v1/users/{id} - 查询详情
    @GetMapping("/{id}")
    public R<UserVo> get(@PathVariable Long id) { }

    // POST /api/v1/users - 新增
    @PostMapping
    public R<Void> create(@RequestBody UserBo user) { }

    // PUT /api/v1/users/{id} - 更新
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody UserBo user) { }

    // DELETE /api/v1/users/{id} - 删除
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) { }
}

// 统一响应格式
public class R<T> {
    private Integer code;
    private String msg;
    private T data;
}
```


---

## 总结

RuoYi-Plus-UniApp系统架构具有以下特点:

**1. 技术栈现代化**
- Java 17+ + Spring Boot 3.5.12
- Vue 3 + TypeScript + Vite
- UniApp跨平台框架

**2. 架构设计合理**
- 前后端分离
- 四层架构(Controller → Service → Manager → Mapper)
- 模块化设计

**3. 功能完善**
- 通用功能抽取(35+个通用模块)
- 业务模块独立
- 扩展性强

**4. 部署灵活**
- 支持单机部署
- 支持集群部署
- 支持容器化部署

**5. 演进路径清晰**
- 从单体到模块化
- 从前后端不分到前后端分离
- 未来可演进到微服务

通过遵循本文档的架构设计原则和最佳实践,可以构建稳定、高效、易维护的全栈应用系统。

---

**文档维护:**
- 如有问题或建议,请联系: 抓蛙师 (微信/QQ: 770492966)
- 文档会持续更新,反映最新的架构实践
