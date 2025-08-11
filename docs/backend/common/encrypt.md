# 数据加密模块概览与快速入门

## 模块介绍

数据加密模块是一个企业级的数据安全解决方案，提供了完整的数据加解密功能，支持数据库字段自动加解密和API接口传输加密两大核心场景。

### 核心特性

- **多算法支持**：内置BASE64、AES、RSA、SM2、SM4等主流加密算法
- **自动化处理**：通过注解配置，实现数据库和API的透明加解密
- **高性能设计**：采用缓存机制，避免重复创建加密器实例
- **灵活配置**：支持全局配置和字段级别的个性化配置
- **无侵入集成**：基于MyBatis拦截器和Servlet过滤器，业务代码零改动

### 整体架构

```
┌─────────────────┐    ┌─────────────────┐
│   API接口加密   │    │  数据库字段加密  │
│                 │    │                 │
│ CryptoFilter    │    │ MyBatis拦截器   │
│ @ApiEncrypt     │    │ @EncryptField   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────┬─────┬─────────┘
                 │     │
        ┌────────▼─────▼────────┐
        │   EncryptorManager   │
        │   (加密器管理器)      │
        └────────┬─────────────┘
                 │
    ┌────────────▼────────────┐
    │      加密器实现         │
    │  AES | RSA | SM2 | ... │
    └─────────────────────────┘
```

## 快速开始

### 1. 基础配置

在 `application.yml` 中添加基础配置：

```yaml
# 数据库字段加密配置
mybatis-encryptor:
  enable: true                    # 启用数据库字段加密
  algorithm: AES                  # 默认加密算法
  password: "1234567890123456"    # AES密钥(16位)
  encode: BASE64                  # 编码方式

# API接口加密配置
api-decrypt:
  enabled: true                   # 启用API接口加密
  header-flag: "encrypt-key"      # 请求头标识
  public-key: "你的RSA公钥"
  private-key: "你的RSA私钥"
```

### 2. 数据库字段加密示例

```java
@Data
@TableName("sys_user")
public class SysUser {
    
    @TableId
    private Long userId;
    
    private String userName;
    
    // 使用默认配置加密手机号
    @EncryptField
    private String phone;
    
    // 使用自定义密钥加密邮箱
    @EncryptField(algorithm = AlgorithmType.AES, password = "customkey123456")
    private String email;
    
    // 使用RSA加密身份证号
    @EncryptField(
        algorithm = AlgorithmType.RSA,
        publicKey = "你的公钥",
        privateKey = "你的私钥"
    )
    private String idCard;
}
```

### 3. API接口加密示例

```java
@RestController
@RequestMapping("/user")
public class UserController {
    
    // 对响应结果进行加密
    @PostMapping("/login")
    @ApiEncrypt(response = true)
    public Result<UserInfo> login(@RequestBody LoginRequest request) {
        // 请求自动解密，响应自动加密
        UserInfo userInfo = userService.login(request);
        return Result.success(userInfo);
    }
}
```

## 支持的加密算法

| 算法 | 类型 | 密钥要求 | 特点 | 适用场景 |
|------|------|----------|------|----------|
| **BASE64** | 编码 | 无 | 速度快，但非加密 | 数据混淆、传输编码 |
| **AES** | 对称加密 | 16/24/32位 | 速度快，安全性高 | 大量数据加密 |
| **RSA** | 非对称加密 | 公私钥对 | 安全性极高 | 密钥传输、敏感数据 |
| **SM2** | 国密非对称 | 公私钥对 | 符合国标，高安全 | 政府、金融行业 |
| **SM4** | 国密对称 | 16位 | 符合国标，高性能 | 国产化要求场景 |

### 算法选择建议

- **日常业务**：推荐使用AES，性能和安全性平衡
- **高敏感数据**：推荐使用RSA或SM2，安全性最高
- **国产化项目**：必须使用SM2/SM4，符合相关规范
- **简单混淆**：可使用BASE64，但不能用于安全要求高的场景

## 应用场景对比

### 数据库字段加密

**适用于**：
- 用户隐私信息（手机号、身份证、邮箱等）
- 敏感业务数据（银行卡号、密码等）
- 合规性要求的数据存储

**特点**：
- 数据存储时自动加密
- 查询时自动解密
- 对业务代码透明
- 支持复杂查询和分页

### API接口加密

**适用于**：
- 前后端数据传输安全
- 移动端与服务端通信
- 第三方接口集成
- 防止数据传输被窃取

**特点**：
- 请求响应全链路加密
- RSA+AES混合加密方案
- 支持跨域和CORS
- 密钥动态生成

## 性能优化特性

### 1. 加密器缓存机制
- 相同配置的加密器实例会被复用
- 避免重复创建加密器带来的性能开销
- 支持动态移除和更新缓存

### 2. 字段扫描缓存
- 启动时扫描并缓存包含加密字段的类信息
- 运行时无需重复反射操作
- 只处理标注了@EncryptField的字段

### 3. 智能批量处理
- List和Map类型数据的批量加解密
- 避免逐个处理带来的性能损失
- 支持复杂嵌套对象的递归处理

## 安全注意事项

### 密钥管理
- **生产环境**：密钥应存储在安全的配置中心
- **定期轮换**：建议定期更换加密密钥
- **权限控制**：密钥访问应有严格的权限控制

### 兼容性考虑
- **数据迁移**：现有数据加密需要考虑历史数据处理
- **版本升级**：算法升级时需要保证向下兼容
- **环境一致**：开发、测试、生产环境的加密配置应保持一致

## 下一步

- 查看 [数据库字段加密](./database-encryption.md) 了解详细的字段加密配置
- 查看 [API接口加密](./api-encryption.md) 了解接口传输加密的实现
