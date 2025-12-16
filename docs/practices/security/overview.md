# 安全防护概览

## 介绍

RuoYi-Plus 框架提供了完整的企业级安全防护体系，涵盖认证授权、数据加密、敏感数据脱敏、接口安全、防攻击等多个层面。

**核心特性：**

- **统一认证授权** - 基于 Sa-Token 1.44.0 实现登录认证、权限验证、角色控制
- **多层加密体系** - 支持 AES、RSA、SM2、SM4 等多种加密算法
- **敏感数据脱敏** - 内置 14 种脱敏策略，自动处理敏感信息
- **接口安全防护** - 提供幂等性控制、限流保护、XSS 过滤等机制
- **多租户隔离** - 基于 MyBatis-Plus 拦截器自动过滤租户数据
- **审计日志** - 完整的操作日志和登录日志记录

---

## 安全架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      应用安全层                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 认证授权 │  │ 数据加密 │  │ 数据脱敏 │  │ 审计日志 │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      接口安全层                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 限流控制 │  │ 幂等控制 │  │ API加密  │  │ XSS防护  │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│                      数据安全层                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 数据权限 │  │ 租户隔离 │  │ 字段加密 │  │ SQL防注入│         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 模块组成

| 模块 | 说明 |
|------|------|
| `ruoyi-common-security` | Sa-Token 拦截器配置、URL 白名单管理 |
| `ruoyi-common-satoken` | JWT 认证、权限校验、多用户体系 |
| `ruoyi-common-encrypt` | 字段加密、接口加密、多算法支持 |
| `ruoyi-common-sensitive` | 敏感数据脱敏、条件脱敏 |
| `ruoyi-common-ratelimiter` | 接口限流、令牌桶算法 |
| `ruoyi-common-idempotent` | 防重复提交、分布式锁 |
| `ruoyi-common-log` | 操作日志、登录日志 |

---

## 认证授权

### Sa-Token 配置

```yaml
sa-token:
  token-name: Authorization
  token-prefix: Bearer
  timeout: 2592000
  is-concurrent: true
  is-share: false
  token-style: uuid
  jwt-secret-key: ${JWT_SECRET_KEY}
```

### 权限注解

```java
// 权限验证
@SaCheckPermission("system:user:list")
@GetMapping("/list")
public TableDataInfo<SysUserVo> list(SysUserBo bo) {
    return userService.selectPageUserList(bo);
}

// 角色验证
@SaCheckRole("admin")
@PostMapping("/resetPwd")
public R<Void> resetPwd(@RequestBody SysUserBo bo) {
    return toAjax(userService.resetPwd(bo));
}

// 忽略验证
@SaIgnore
@GetMapping("/captcha")
public R<CaptchaVo> getCaptcha() {
    return R.ok(captchaService.createCaptcha());
}
```

### 路径白名单

```yaml
security:
  excludes:
    - /login
    - /register
    - /captcha
    - /static/**
    - /v3/api-docs/**
    - /actuator/health
```

---

## 数据加密

### 支持的算法

| 算法 | 说明 | 适用场景 |
|------|------|----------|
| `AES` | 对称加密 | 高性能加密 |
| `RSA` | 非对称加密 | 密钥交换 |
| `SM2` | 国密非对称 | 国产化要求 |
| `SM4` | 国密对称 | 国产化要求 |

### 字段加密

```java
@TableName("sys_user")
public class SysUser {
    @EncryptField(algorithm = AlgorithmType.AES)
    private String phonenumber;

    @EncryptField(algorithm = AlgorithmType.SM4)
    private String idCard;
}
```

### 接口加密

```java
@ApiEncrypt(response = true)
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBody body) {
    return R.ok(loginService.login(body));
}
```

---

## 敏感数据脱敏

### 脱敏策略

| 策略 | 示例 |
|------|------|
| `PHONE` | `138****5678` |
| `ID_CARD` | `110***********1234` |
| `EMAIL` | `t***@example.com` |
| `BANK_CARD` | `6222***********0123` |
| `ADDRESS` | `北京市朝阳区****` |

### 使用方式

```java
public class SysUserVo {
    @Sensitive(strategy = SensitiveStrategy.PHONE)
    private String phonenumber;

    @Sensitive(strategy = SensitiveStrategy.ID_CARD)
    private String idCard;
}
```

---

## 接口安全

### 限流保护

```java
// IP限流
@RateLimiter(time = 60, count = 5, limitType = LimitType.IP)
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBody body) {
    return R.ok(loginService.login(body));
}
```

### 防重复提交

```java
@RepeatSubmit(interval = 5000)
@PostMapping("/order")
public R<Order> createOrder(@RequestBody OrderBo bo) {
    return R.ok(orderService.createOrder(bo));
}
```

### XSS 防护

```yaml
xss:
  enabled: true
  excludes:
    - /system/notice/*
  urlPatterns:
    - /system/*
```

---

## 数据权限

### 权限类型

| 类型 | 说明 |
|------|------|
| 全部数据 | 可查看所有数据 |
| 本部门 | 仅查看本部门数据 |
| 本部门及以下 | 查看本部门及下级数据 |
| 仅本人 | 仅查看自己的数据 |

### 使用方式

```java
@DataScope(deptAlias = "d", userAlias = "u")
public List<SysUser> selectUserList(SysUserBo bo) {
    return userMapper.selectUserList(bo);
}
```

---

## 多租户隔离

### 配置

```yaml
tenant:
  enabled: true
  ignore-tables:
    - sys_dict_type
    - sys_dict_data
    - sys_config
```

### 自动过滤

所有查询自动添加租户条件：

```sql
SELECT * FROM sys_user WHERE tenant_id = '000000' AND ...
```

---

## 审计日志

### 操作日志

```java
@Log(title = "用户管理", businessType = BusinessType.DELETE)
@DeleteMapping("/{userIds}")
public R<Void> remove(@PathVariable Long[] userIds) {
    return toAjax(userService.deleteUserByIds(userIds));
}
```

### 日志类型

| 类型 | 说明 |
|------|------|
| `INSERT` | 新增 |
| `UPDATE` | 修改 |
| `DELETE` | 删除 |
| `EXPORT` | 导出 |
| `IMPORT` | 导入 |

---

## 安全检查清单

### 部署前检查

- [ ] 修改所有默认密码
- [ ] 配置 HTTPS
- [ ] 启用 XSS 防护
- [ ] 配置接口限流
- [ ] 启用字段加密
- [ ] 配置数据权限
- [ ] 启用操作日志

### 定期审计

- [ ] 检查异常登录记录
- [ ] 审计敏感操作日志
- [ ] 检查权限配置
- [ ] 更新安全依赖

---

## 总结

RuoYi-Plus 安全体系核心要点：

1. **认证授权** - Sa-Token + JWT，支持多端多用户
2. **数据加密** - AES/RSA/SM2/SM4，字段级和接口级加密
3. **数据脱敏** - 14 种策略，自动脱敏敏感信息
4. **接口安全** - 限流、幂等、XSS 防护
5. **审计日志** - 完整记录操作和登录行为
