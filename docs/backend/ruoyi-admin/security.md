# 安全配置

## 概述

ruoyi-admin 提供了多层次的安全防护机制，包括：

- **认证授权** - 基于 Sa-Token 的身份认证和权限控制
- **密码安全** - 密码错误次数限制和账户锁定
- **验证码** - 图形验证码防止暴力破解
- **数据加密** - 敏感数据存储加密
- **接口加密** - API 请求/响应加密传输
- **XSS防护** - 防止跨站脚本攻击
- **请求控制** - 重复提交防护和访问频率限制

## Sa-Token认证配置

### 基础配置

```yaml
sa-token:
  # Token名称（同时也是Cookie名称和请求头名称）
  token-name: Authorization
  # 是否允许同一账号并发登录
  is-concurrent: true
  # 多人登录同一账号时是否共用Token
  is-share: false
  # JWT签名密钥
  jwt-secret-key: ${JWT_SECRET_KEY:uDkkASPQVN5iR4eN}
```

### 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| token-name | Token的名称，客户端通过此名称传递Token | Authorization |
| is-concurrent | 是否允许同一账号多端同时登录 | true |
| is-share | 多人登录同一账号时是否共用一个Token | false |
| jwt-secret-key | JWT签名密钥，用于Token的签名和验证 | - |

### 并发登录策略

**is-concurrent + is-share 组合效果：**

| is-concurrent | is-share | 效果 |
|---------------|----------|------|
| true | true | 允许并发登录，共用同一Token |
| true | false | 允许并发登录，每次登录新建Token |
| false | - | 不允许并发登录，新登录挤掉旧登录 |

### JWT密钥配置

**生产环境必须更换默认密钥：**

```bash
# 通过环境变量配置
export JWT_SECRET_KEY=your_secure_random_key_here
```

**密钥生成建议：**
- 长度不少于16个字符
- 包含大小写字母、数字
- 避免使用常见单词或可预测的字符串

## 安全路径配置

### 排除路径

不需要认证即可访问的路径：

```yaml
security:
  excludes:
    # 静态资源
    - /resources/**
    - /*.html
    - /**/*.html
    - /**/*.css
    - /**/*.js
    - /favicon.ico
    # 错误页面
    - /error
    # API文档
    - /*/api-docs
    - /*/api-docs/**
    # 工作流设计器
    - /warm-flow-ui/config
```

### 路径匹配规则

| 模式 | 说明 | 示例 |
|------|------|------|
| /path | 精确匹配 | /error |
| /path/* | 匹配一级路径 | /api/user |
| /path/** | 匹配多级路径 | /api/user/list |
| *.ext | 匹配扩展名 | *.html |

## 用户密码安全

### 密码错误限制

```yaml
user:
  password:
    # 密码最大错误次数
    maxRetryCount: 5
    # 锁定时间（分钟）
    lockTime: 10
```

### 工作机制

1. 用户输入错误密码，错误计数 +1
2. 错误次数达到 `maxRetryCount` 时，账户锁定
3. 锁定 `lockTime` 分钟后自动解锁
4. 登录成功后错误计数清零

### 相关提示消息

```properties
# i18n/messages.properties
user.password.retry.count=密码输入错误{0}次
user.password.retry.locked=密码输入错误{0}次，帐户锁定{1}分钟
```

### 安全建议

| 场景 | maxRetryCount | lockTime |
|------|---------------|----------|
| 普通应用 | 5 | 10 |
| 高安全要求 | 3 | 30 |
| 内部系统 | 10 | 5 |

## 验证码配置

### 基础配置

```yaml
captcha:
  # 验证码类型：MATH（数学计算）/ CHAR（字符）
  type: MATH
  # 干扰类型：LINE（线段）/ CIRCLE（圆圈）/ SHEAR（扭曲）
  category: CIRCLE
  # 数字验证码位数（type=MATH时有效）
  numberLength: 1
  # 字符验证码长度（type=CHAR时有效）
  charLength: 4
```

### 验证码类型

**MATH - 数学计算验证码：**
- 显示简单数学运算（如：3 + 5 = ?）
- `numberLength` 控制参与运算的数字位数
- 适合大多数场景

**CHAR - 字符验证码：**
- 显示随机字符组合
- `charLength` 控制字符个数
- 适合需要更高安全性的场景

### 干扰类型

| 类型 | 说明 | 安全级别 |
|------|------|---------|
| LINE | 线段干扰 | 低 |
| CIRCLE | 圆圈干扰 | 中 |
| SHEAR | 扭曲干扰 | 高 |

### 验证码开关

验证码的启用/禁用通过**系统参数配置**控制，而非配置文件。在管理后台的"参数设置"中配置。

## 数据加密配置

### MyBatis字段加密

对数据库敏感字段进行加密存储：

```yaml
mybatis-encryptor:
  # 是否开启加密
  enable: false
  # 加密算法：BASE64 / AES / SM4 / SM2 / RSA
  algorithm: BASE64
  # 编码方式：BASE64 / HEX
  encode: BASE64
  # 对称算法密钥（AES、SM4使用）
  password: ${ENCRYPT_PASSWORD:}
  # 非对称算法公钥（SM2、RSA使用）
  publicKey: ${ENCRYPT_PUBLIC_KEY:}
  # 非对称算法私钥（SM2、RSA使用）
  privateKey: ${ENCRYPT_PRIVATE_KEY:}
```

### 支持的加密算法

| 算法 | 类型 | 所需配置 | 说明 |
|------|------|---------|------|
| BASE64 | 编码 | 无 | 仅编码，非真正加密 |
| AES | 对称加密 | password | 高性能，推荐 |
| SM4 | 对称加密（国密） | password | 国密算法 |
| SM2 | 非对称加密（国密） | publicKey + privateKey | 国密算法 |
| RSA | 非对称加密 | publicKey + privateKey | 通用算法 |

### 使用示例

**1. 实体类字段添加注解：**

```java
public class User {
    // 手机号加密存储
    @EncryptField
    private String phone;

    // 身份证号加密存储
    @EncryptField
    private String idCard;
}
```

**2. 配置加密参数：**

```yaml
mybatis-encryptor:
  enable: true
  algorithm: AES
  password: ${ENCRYPT_PASSWORD:your_aes_key_16bytes}
```

### 密钥配置建议

| 算法 | 密钥长度要求 |
|------|-------------|
| AES | 16/24/32字节 |
| SM4 | 16字节 |
| RSA | 1024/2048位 |
| SM2 | 256位 |

## API接口加密

### 配置说明

对API请求和响应进行加密传输：

```yaml
api-decrypt:
  # 是否开启全局接口加密
  enabled: ${API_ENCRYPT_ENABLED:true}
  # AES加密头标识
  headerFlag: encrypt-key
  # 响应加密公钥（RSA）
  publicKey: ${API_RESPONSE_PUBLIC_KEY:MFwwDQYJKoZIhvcNAQEBBQAD...}
  # 请求解密私钥（RSA）
  privateKey: ${API_REQUEST_PRIVATE_KEY:MIIBOgIBAAJBAK9s1Pbnn5W+...}
```

### 加密流程

**请求加密（客户端 → 服务端）：**

1. 客户端使用服务端提供的公钥加密请求数据
2. 将加密后的数据放入请求体
3. 服务端使用私钥解密请求数据

**响应加密（服务端 → 客户端）：**

1. 服务端使用公钥加密响应数据
2. 客户端使用对应的私钥解密响应

### 密钥对说明

配置中涉及两对密钥：

| 密钥 | 用途 | 持有方 |
|------|------|--------|
| API_RESPONSE_PUBLIC_KEY | 响应加密 | 服务端 |
| 响应解密私钥 | 响应解密 | 客户端 |
| 请求加密公钥 | 请求加密 | 客户端 |
| API_REQUEST_PRIVATE_KEY | 请求解密 | 服务端 |

### 生成新密钥对

**使用OpenSSL生成RSA密钥对：**

```bash
# 生成私钥
openssl genrsa -out private.pem 1024

# 从私钥导出公钥
openssl rsa -in private.pem -pubout -out public.pem

# 转换为PKCS8格式（Java使用）
openssl pkcs8 -topk8 -inform PEM -in private.pem -outform PEM -nocrypt -out private_pkcs8.pem
```

### 接口加密注解

**启用加密：**

```java
@ApiEncrypt  // 请求解密 + 响应加密
@PostMapping("/sensitive-data")
public R<User> getSensitiveData(@RequestBody UserQuery query) {
    // ...
}
```

**仅请求解密：**

```java
@ApiEncrypt(response = false)
@PostMapping("/submit")
public R<Void> submit(@RequestBody EncryptedData data) {
    // ...
}
```

## XSS防护

### 配置说明

```yaml
xss:
  # 是否开启XSS过滤
  enabled: true
  # 排除的URL（不进行XSS过滤）
  excludeUrls:
    - /system/notice/*
    - /mall/goods/*
```

### 工作原理

1. 对所有请求参数进行XSS过滤
2. 移除或转义潜在的恶意脚本代码
3. 排除URL中的接口不进行过滤

### 排除场景

以下场景需要添加到排除列表：

| 场景 | 原因 |
|------|------|
| 富文本编辑 | 需要保留HTML标签 |
| 商品描述 | 包含HTML格式内容 |
| 通知公告 | 可能包含富文本 |

### 排除配置示例

```yaml
xss:
  enabled: true
  excludeUrls:
    # 通知公告（富文本）
    - /system/notice/*
    # 商品管理（商品描述富文本）
    - /mall/goods/*
    # CMS内容管理
    - /cms/article/*
    - /cms/page/*
```

## 请求控制

### 重复提交防护

防止用户短时间内重复提交表单：

```java
@RepeatSubmit(interval = 5000, message = "请勿重复提交")
@PostMapping("/submit")
public R<Void> submit(@RequestBody FormData data) {
    // ...
}
```

**参数说明：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| interval | 间隔时间（毫秒） | 5000 |
| message | 提示消息 | 不允许重复提交 |

### 访问频率限制

限制接口的访问频率：

```java
@RateLimiter(count = 10, time = 60)
@GetMapping("/api/data")
public R<List<Data>> getData() {
    // ...
}
```

**参数说明：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| count | 允许的请求次数 | 10 |
| time | 时间窗口（秒） | 60 |
| limitType | 限制类型 | DEFAULT |

**限制类型：**

| 类型 | 说明 |
|------|------|
| DEFAULT | 默认（按IP限制） |
| IP | 按IP地址限制 |
| USER | 按用户限制 |
| GLOBAL | 全局限制 |

### 相关提示消息

```properties
# i18n/messages.properties
request.control.duplicate.submit=不允许重复提交，请稍候再试
request.control.rate.limit.exceeded=访问过于频繁，请稍候再试
```

## 权限控制

### 权限验证注解

```java
// 需要登录
@SaCheckLogin
@GetMapping("/user/info")
public R<UserInfo> getUserInfo() { ... }

// 需要特定权限
@SaCheckPermission("system:user:list")
@GetMapping("/user/list")
public R<List<User>> listUsers() { ... }

// 需要特定角色
@SaCheckRole("admin")
@DeleteMapping("/user/{id}")
public R<Void> deleteUser(@PathVariable Long id) { ... }

// 需要多个权限（AND关系）
@SaCheckPermission({"system:user:add", "system:user:edit"})
@PostMapping("/user")
public R<Void> saveUser(@RequestBody User user) { ... }

// 需要任一权限（OR关系）
@SaCheckPermission(value = {"system:user:add", "system:user:edit"}, mode = SaMode.OR)
@PostMapping("/user")
public R<Void> saveUser(@RequestBody User user) { ... }
```

### 权限提示消息

```properties
# i18n/messages.properties
permission.no.access=没有访问权限，请联系管理员添加权限 {0} [{1}]
permission.no.create=您没有创建数据的权限，请联系管理员添加权限 [{0}]
permission.no.update=您没有修改数据的权限，请联系管理员添加权限 [{0}]
permission.no.delete=您没有删除数据的权限，请联系管理员添加权限 [{0}]
permission.no.export=您没有导出数据的权限，请联系管理员添加权限 [{0}]
permission.no.view=您没有查看数据的权限，请联系管理员添加权限 [{0}]
```

## 第三方登录安全

### JustAuth配置

```yaml
justauth:
  # 前端外网访问地址
  address: ${JUSTAUTH_ADDRESS:http://localhost}
  type:
    # 微信开放平台
    wechat_open:
      client-id: ${WECHAT_OPEN_CLIENT_ID}
      client-secret: ${WECHAT_OPEN_CLIENT_SECRET}
      redirect-uri: ${justauth.address}/socialCallback?source=wechat_open
    # 微信公众号
    wechat_mp:
      client-id: ${WECHAT_MP_CLIENT_ID}
      client-secret: ${WECHAT_MP_CLIENT_SECRET}
      redirect-uri: ${justauth.address}/socialCallback?source=wechat_mp
    # 更多平台...
```

### 支持的登录平台

| 平台 | 配置前缀 |
|------|---------|
| 微信开放平台 | wechat_open |
| 微信公众号 | wechat_mp |
| 企业微信 | wechat_enterprise |
| Gitee | gitee |
| QQ | qq |
| 微博 | weibo |
| 钉钉 | dingtalk |
| MaxKey | maxkey |
| TopIAM | topiam |
| 百度 | baidu |
| CSDN | csdn |
| Coding | coding |
| 开源中国 | oschina |
| 支付宝 | alipay_wallet |
| GitLab | gitlab |

### 安全建议

1. **client-secret 必须保密** - 通过环境变量配置，不要提交到代码仓库
2. **redirect-uri 必须配置正确** - 与第三方平台配置的回调地址一致
3. **生产环境使用HTTPS** - 确保回调地址使用HTTPS协议

## 安全配置检查清单

### 生产环境必须配置

- [ ] 更换 JWT 签名密钥（jwt-secret-key）
- [ ] 配置数据加密密钥（ENCRYPT_PASSWORD 或公私钥）
- [ ] 更换 API 加密密钥对
- [ ] 配置强密码策略（maxRetryCount、lockTime）
- [ ] 开启 XSS 防护
- [ ] 配置第三方登录密钥（通过环境变量）

### 安全加固建议

| 项目 | 建议 |
|------|------|
| JWT密钥 | 长度≥32字符，定期轮换 |
| 密码策略 | maxRetryCount≤5，lockTime≥10 |
| API加密 | 生产环境必须开启 |
| HTTPS | 生产环境必须使用 |
| 敏感配置 | 全部通过环境变量注入 |

### 常见安全问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| Token泄露 | JWT密钥过于简单 | 使用复杂随机密钥 |
| 暴力破解 | 未限制密码错误次数 | 配置maxRetryCount |
| XSS攻击 | 未开启XSS过滤 | 设置xss.enabled=true |
| 敏感数据泄露 | 未加密存储 | 开启mybatis-encryptor |
| 接口被刷 | 未限制访问频率 | 使用@RateLimiter注解 |
