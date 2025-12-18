# 注释规范

## 介绍

良好的注释是代码可读性和可维护性的重要保障。

**核心价值:**

- **提高可读性** - 帮助开发者快速理解代码意图
- **便于维护** - 降低代码维护成本
- **知识传承** - 将业务知识传递给团队成员
- **API文档化** - 自动生成API文档

## 注释基本原则

### 何时需要注释

**必须添加注释的情况:**

1. 所有公共API - 类、接口、方法、属性
2. 复杂逻辑 - 不易理解的算法、业务逻辑
3. 重要决策 - 为什么这样做
4. 业务规则 - 特定的业务约束
5. 临时方案 - TODO、FIXME、HACK等标记

### 何时不需要注释

1. 显而易见的代码
2. 变量名已说明用途
3. 简单的getter/setter
4. 重复的信息

```java
// ❌ 不需要
// 设置用户名
public void setUsername(String username) {
    this.username = username;
}

// ✅ 只在必要时注释
/**
 * 获取用户ID
 * 注意：租户管理员返回租户ID，普通用户返回用户ID
 */
public Long getUserId() {
    return isTenantAdmin() ? getTenantId() : this.userId;
}
```

### 注释黄金法则

1. **注释WHY，而非WHAT**
2. **保持同步** - 修改代码时同步更新注释
3. **避免冗余** - 不要重复代码已表达的内容
4. **简洁明了** - 使用简洁清晰的语言
5. **中文优先** - 统一使用中文注释

## Java 注释规范

### 类注释

```java
/**
 * 广告配置业务对象 b_ad
 *
 * @author 抓蛙师
 * @date 2025-07-17
 */
@Data
public class AdBo extends BaseEntity {
    // ...
}
```

**必须包含:** 类的功能描述、@author、@date

### 方法注释

```java
/**
 * 根据ID查询
 *
 * @param id 主键ID
 * @return 视图对象
 */
AdVo get(Long id);

/**
 * 分页查询广告配置列表
 *
 * @param query 查询条件
 * @return 分页结果
 */
PageResult<AdVo> pageAds(AdQuery query);

/**
 * 用户登录
 *
 * @param username 用户名
 * @param password 密码
 * @return 登录令牌
 * @throws ServiceException 用户名或密码错误
 */
LoginResult login(String username, String password);
```

### 字段注释

```java
/**
 * 广告名称
 */
@Schema(description = "广告名称")
private String adName;

/**
 * 是否启用（0否 1是）
 */
@Schema(description = "是否启用（0否 1是）")
private String status;

/**
 * 订单金额（单位：元）
 */
private BigDecimal amount;
```

### 常量注释

```java
/**
 * 超级管理员角色标识
 */
public static final String SUPER_ADMIN = "admin";

/**
 * 用户状态：正常
 */
public static final String STATUS_NORMAL = "0";

/**
 * 验证码有效期（分钟）
 */
public static final int CAPTCHA_EXPIRATION = 2;
```

### 枚举注释

```java
/**
 * 用户状态枚举
 *
 * @author 抓蛙师
 * @date 2025-07-15
 */
public enum UserStatus {
    /** 正常 */
    NORMAL("0", "正常"),

    /** 停用 */
    DISABLE("1", "停用");

    /** 状态码 */
    private final String code;

    /** 状态描述 */
    private final String info;
}
```

### 代码块注释

```java
// 如果是超级管理员，直接返回
if (isSuperAdmin()) {
    return true;
}

// TODO: 待实现的功能
// FIXME: 需要修复的问题
// HACK: 临时解决方案
```

### 废弃标记

```java
/**
 * @deprecated 此方法已废弃，请使用 {@link #newMethod(String)} 替代
 */
@Deprecated
public void oldMethod(String param) {
    // ...
}
```

## TypeScript 注释规范

### 函数注释

```typescript
/**
 * 查询广告配置列表
 * @param query 查询参数
 * @returns {Result<PageResult<AdVo>>} 分页结果
 */
export const pageAds = (query?: AdQuery): Result<PageResult<AdVo>> => {
  return http.get<PageResult<AdVo>>('/base/ad/pageAds', query)
}

/**
 * 检查值是否为真值
 * 支持：'1', 'true', 'yes', 'on', true, 1 等
 *
 * @param {any} value 要检查的值
 * @returns {boolean} 是否为真值
 */
export const isTrue = (value: any): boolean => {
  const trueValues = ['1', 'true', 'TRUE', 'yes', 'YES', 'on', 'ON', true, 1]
  return trueValues.includes(value)
}
```

### 接口和类型注释

```typescript
/** 广告配置查询类型 */
export interface AdQuery extends PageQuery {
  /** 主键id */
  id?: string | number

  /** 广告名称 */
  adName?: string

  /** 是否启用（0否 1是） */
  status?: string
}

/** 广告配置视图对象类型 */
export interface AdVo {
  /** 主键id */
  id: string | number

  /** 广告名称 */
  adName: string

  /** 是否启用（0否 1是） */
  status: string

  /** 创建时间 */
  createTime: Date
}

/** 按钮类型 */
export type ButtonType = 'primary' | 'success' | 'warning' | 'error'
```

### Composable 函数注释

```typescript
/**
 * 认证与授权钩子 (useAuth)
 *
 * 包含以下功能：
 * - 用户状态: isLoggedIn, isSuperAdmin
 * - 权限检查: hasPermission, hasAllPermissions
 * - 角色检查: hasRole, hasAllRoles
 *
 * @returns 返回认证与授权相关的状态和方法
 *
 * @example
 * const { isLoggedIn, hasPermission } = useAuth()
 * if (hasPermission('system:user:add')) {
 *   console.log('有添加用户权限')
 * }
 */
export const useAuth = () => {
  // ...
}
```

## Vue 组件注释规范

### 模板注释

```vue
<!-- 广告配置管理页面 -->
<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <ASearchForm ref="queryFormRef" v-model="queryParams">
      <AFormInput label="广告名称" prop="adName" v-model="queryParams.adName" />
    </ASearchForm>

    <!-- 表格数据 -->
    <el-table v-loading="isLoading" :data="adList">
      <el-table-column label="广告名称" prop="adName" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="handleUpdate(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单弹窗 -->
    <el-dialog :title="title" v-model="open">
      <AForm ref="adFormRef" :model="form" />
    </el-dialog>
  </div>
</template>
```

### 脚本注释

```typescript
<script setup lang="ts" name="Ad">
import { ref } from 'vue'
import { pageAds, getAd, addAd } from '@/api/business/base/ad/adApi'

// =========== 查询相关 ===========

/** 查询参数对象 */
const queryParams = ref<AdQuery>({
  pageNum: 1,
  pageSize: 10,
})

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

// =========== 表格数据相关 ===========

/** 表格加载状态 */
const isLoading = ref(true)

/** 数据列表 */
const adList = ref<AdVo[]>([])

/** 查询列表 */
const getList = async () => {
  isLoading.value = true
  const res = await pageAds(queryParams.value)
  adList.value = res.rows
  isLoading.value = false
}

// =========== 表单相关 ===========

/** 是否显示弹窗 */
const open = ref(false)

/** 新增按钮操作 */
const handleAdd = () => {
  open.value = true
  title.value = '新增广告'
}

// =========== 初始化 ===========

onMounted(() => {
  getList()
})
</script>
```

## 配置文件注释

### YAML 配置

```yaml
# =========== 服务器配置 ===========
server:
  # 服务端口
  port: 8080
  servlet:
    # 应用上下文路径
    context-path: /

# =========== 数据源配置 ===========
spring:
  datasource:
    # 数据库驱动
    driver-class-name: com.mysql.cj.jdbc.Driver
    # 数据库连接地址
    url: jdbc:mysql://localhost:3306/ry-plus
    # 数据库用户名
    username: root
    # 数据库密码
    password: password

# =========== MyBatis-Plus 配置 ===========
mybatis-plus:
  global-config:
    db-config:
      # 主键类型（使用数据库自增）
      id-type: auto
      # 逻辑删除值
      logic-delete-value: 1
      # 逻辑未删除值
      logic-not-delete-value: 0
```

### SQL 脚本注释

```sql
-- =========== 用户表 ===========
-- 存储系统用户基本信息
CREATE TABLE sys_user
(
    user_id     BIGINT      NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username    VARCHAR(30) NOT NULL COMMENT '用户账号',
    nickname    VARCHAR(30) NOT NULL COMMENT '用户昵称',
    status      CHAR(1) DEFAULT '0' COMMENT '帐号状态（0正常 1停用）',
    del_flag    CHAR(1) DEFAULT '0' COMMENT '删除标志（0存在 1删除）',
    create_time DATETIME COMMENT '创建时间'
) ENGINE = InnoDB COMMENT = '用户信息表';

-- =========== 初始化管理员 ===========
-- 用户名: admin, 密码: admin123
INSERT INTO sys_user (user_id, username, nickname, password, status)
VALUES (1, 'admin', '超级管理员', '$2a$10$...', '0');
```

## 最佳实践

### 1. 注释WHY而非WHAT

```java
// ❌ 不好的注释
// 设置用户名为admin
username = "admin";

// ✅ 好的注释
// 使用默认管理员账号进行系统初始化
username = "admin";
```

### 2. 保持注释和代码同步

```java
// ❌ 注释过时
/**
 * 获取用户列表
 */
public PageResult<User> pageUsers(UserQuery query) {
    // 代码已改为分页查询
}

// ✅ 更新注释
/**
 * 分页查询用户列表
 * @param query 查询条件
 */
public PageResult<User> pageUsers(UserQuery query) {
}
```

### 3. 使用TODO标记

```java
// TODO: 待实现的功能
// FIXME: 需要修复的问题
// HACK: 临时解决方案
// OPTIMIZE: 性能优化点
```

### 4. 复杂逻辑添加示例

```typescript
/**
 * 计算订单总价
 *
 * 计算规则：
 * 1. 商品总价 = Σ(单价 × 数量)
 * 2. 优惠金额 = 满减 + 优惠券
 * 3. 订单总价 = 商品总价 - 优惠金额 + 运费
 *
 * @example
 * const total = calculateTotal(items, coupon, address)
 */
export const calculateTotal = (items, coupon, address) => {
  // ...
}
```

### 5. 接口文档化

```java
/**
 * 用户服务接口
 *
 * @author 抓蛙师
 * @date 2025-07-15
 */
public interface IUserService {
    /**
     * 分页查询用户列表
     *
     * 支持查询条件：用户名、手机号、状态、部门
     *
     * @param query 查询条件
     * @return 分页结果
     */
    PageResult<UserVo> pageUsers(UserQuery query);

    /**
     * 新增用户
     *
     * 业务规则：
     * 1. 用户名不能重复
     * 2. 默认密码为123456
     *
     * @param bo 用户业务对象
     * @return 是否成功
     * @throws ServiceException 用户名重复
     */
    Boolean insertUser(UserBo bo);
}
```

## 常见问题

### 1. 注释太多会影响可读性吗？

**解决方案:**
- 只在必要的地方添加注释
- 通过清晰的命名减少注释需求
- 注释说明WHY而非WHAT

### 2. 如何处理过时的注释？

**解决方案:**
- 修改代码时同步更新注释
- 代码审查时检查注释准确性
- 使用@deprecated标记废弃方法

### 3. 中文注释还是英文注释？

**本项目规范:**
- 统一使用中文注释
- 专业术语可保留英文
- 团队内部保持一致

### 4. 注释应该写在代码前还是后？

**规范:**
- 类、方法、字段注释写在代码前
- 行内简短说明可写在代码后
- 代码块注释写在代码块前

### 5. 如何为复杂算法添加注释？

```java
/**
 * 计算用户信用分
 *
 * 算法：
 * 1. 基础分600分
 * 2. 登录天数加分：每天+1分，最高100分
 * 3. 订单完成加分：每单+2分，最高200分
 * 4. 违规扣分：每次-50分
 *
 * @param userId 用户ID
 * @return 信用分（0-1000）
 */
public int calculateCreditScore(Long userId) {
    // 基础分
    int score = 600;

    // 登录天数加分
    int loginDays = userMapper.getLoginDays(userId);
    score += Math.min(loginDays, 100);

    // 订单加分
    int orders = orderMapper.getCompletedCount(userId);
    score += Math.min(orders * 2, 200);

    // 违规扣分
    int violations = userMapper.getViolationCount(userId);
    score -= violations * 50;

    return Math.max(0, Math.min(score, 1000));
}
```

## 总结

注释规范核心要点:

1. **注释WHY而非WHAT** - 说明为什么这样做
2. **保持同步** - 修改代码时更新注释
3. **简洁明了** - 使用简洁清晰的语言
4. **统一格式** - 遵循JavaDoc/JSDoc标准
5. **中文优先** - 本项目统一使用中文注释
