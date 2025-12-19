# ruoyi-common-encrypt 数据加密模块

## 模块概述

`ruoyi-common-encrypt` 是 RuoYi-Plus 框架的企业级数据安全解决方案，提供完整的数据加解密功能。模块支持数据库字段自动加解密和API接口传输加密两大核心场景，采用策略模式实现多算法支持，通过MyBatis拦截器和Servlet过滤器实现对业务代码的零侵入。

**核心特性:**

- **多算法支持** - 内置BASE64、AES、RSA、SM2、SM4等主流加密算法
- **自动化处理** - 通过注解配置，实现数据库和API的透明加解密
- **高性能设计** - 采用缓存机制，避免重复创建加密器实例
- **灵活配置** - 支持全局配置和字段级别的个性化配置
- **无侵入集成** - 基于MyBatis拦截器和Servlet过滤器，业务代码零改动
- **国密支持** - 完整支持SM2、SM4国密算法，满足等保合规要求

**模块信息:**

| 属性 | 值 |
|------|-----|
| GroupId | `plus.ruoyi` |
| ArtifactId | `ruoyi-common-encrypt` |
| 功能定位 | 数据加解密服务 |
| 核心依赖 | Hutool、BouncyCastle |

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              应用层 (Application)                            │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │      数据库字段加密          │    │       API接口加密            │        │
│  │    @EncryptField注解         │    │     @ApiEncrypt注解          │        │
│  └──────────────┬──────────────┘    └──────────────┬──────────────┘        │
└─────────────────┼──────────────────────────────────┼───────────────────────┘
                  │                                  │
┌─────────────────▼──────────────────────────────────▼───────────────────────┐
│                             拦截层 (Interceptor)                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │   MybatisEncryptInterceptor │    │       CryptoFilter          │        │
│  │   MybatisDecryptInterceptor │    │  DecryptRequestBodyWrapper  │        │
│  │      (MyBatis插件)           │    │  EncryptResponseBodyWrapper │        │
│  └──────────────┬──────────────┘    └──────────────┬──────────────┘        │
└─────────────────┼──────────────────────────────────┼───────────────────────┘
                  │                                  │
                  └─────────────────┬────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────────┐
│                            管理层 (Manager)                                 │
│                     ┌─────────────────────────────┐                        │
│                     │      EncryptorManager       │                        │
│                     │   ┌─────────────────────┐   │                        │
│                     │   │  encryptorMap缓存   │   │                        │
│                     │   │  fieldCache缓存     │   │                        │
│                     │   └─────────────────────┘   │                        │
│                     └──────────────┬──────────────┘                        │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────────┐
│                            加密器层 (Encryptor)                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │  Base64   │ │    AES    │ │    RSA    │ │    SM2    │ │    SM4    │   │
│  │ Encryptor │ │ Encryptor │ │ Encryptor │ │ Encryptor │ │ Encryptor │   │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘   │
│        └─────────────┼─────────────┼─────────────┼─────────────┘          │
│                      │             │             │                         │
│               ┌──────▼─────────────▼─────────────▼──────┐                 │
│               │          AbstractEncryptor              │                 │
│               │           (抽象加密器基类)                │                 │
│               └────────────────────┬────────────────────┘                 │
│                                    │                                       │
│               ┌────────────────────▼────────────────────┐                 │
│               │            IEncryptor                   │                 │
│               │           (加密器接口)                   │                 │
│               └─────────────────────────────────────────┘                 │
└────────────────────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 类名 | 职责 |
|------|------|------|
| 加密器接口 | `IEncryptor` | 定义加密器基本行为 |
| 抽象加密器 | `AbstractEncryptor` | 提供加密器通用实现 |
| 加密器管理 | `EncryptorManager` | 管理加密器实例和缓存 |
| 加密上下文 | `EncryptContext` | 传递加密配置参数 |
| 字段注解 | `@EncryptField` | 标记需要加密的字段 |
| API注解 | `@ApiEncrypt` | 标记需要加密的接口 |
| 加密拦截器 | `MybatisEncryptInterceptor` | MyBatis入参加密 |
| 解密拦截器 | `MybatisDecryptInterceptor` | MyBatis结果解密 |
| API过滤器 | `CryptoFilter` | HTTP请求响应加解密 |

## 加密算法详解

### 算法类型枚举

```java
public enum AlgorithmType {
    /**
     * 默认走yml配置
     */
    DEFAULT(null),

    /**
     * Base64编码
     */
    BASE64(Base64Encryptor.class),

    /**
     * AES对称加密
     */
    AES(AesEncryptor.class),

    /**
     * RSA非对称加密
     */
    RSA(RsaEncryptor.class),

    /**
     * SM2国密非对称加密
     */
    SM2(Sm2Encryptor.class),

    /**
     * SM4国密对称加密
     */
    SM4(Sm4Encryptor.class);

    private final Class<? extends AbstractEncryptor> clazz;
}
```

### 算法对比

| 算法 | 类型 | 密钥要求 | 安全性 | 性能 | 适用场景 |
|------|------|----------|--------|------|----------|
| **BASE64** | 编码 | 无 | 低 | 极高 | 数据混淆、传输编码 |
| **AES** | 对称加密 | 16/24/32字节 | 高 | 高 | 大量数据加密、数据库字段 |
| **RSA** | 非对称加密 | 公私钥对 | 极高 | 低 | 密钥传输、小数据加密 |
| **SM2** | 国密非对称 | 公私钥对 | 极高 | 中 | 等保合规、政府金融 |
| **SM4** | 国密对称 | 16字节 | 高 | 高 | 国产化要求、数据库字段 |

### BASE64 编码器

BASE64是一种编码方式而非加密算法，适用于数据混淆和传输编码场景。

```java
@EncryptField(algorithm = AlgorithmType.BASE64)
private String data;
```

**特点:**
- 无需密钥
- 可逆编码
- 不提供安全性保护
- 性能极高

### AES 对称加密器

AES (Advanced Encryption Standard) 是最常用的对称加密算法，支持三种密钥长度。

```java
// AES-128 (16字节密钥)
@EncryptField(algorithm = AlgorithmType.AES, password = "1234567890123456")
private String phone;

// AES-192 (24字节密钥)
@EncryptField(algorithm = AlgorithmType.AES, password = "123456789012345678901234")
private String email;

// AES-256 (32字节密钥)
@EncryptField(algorithm = AlgorithmType.AES, password = "12345678901234567890123456789012")
private String idCard;
```

**特点:**
- 加解密使用相同密钥
- 密钥长度决定安全强度
- 性能优秀，适合大量数据
- 推荐使用AES-256

### RSA 非对称加密器

RSA是经典的非对称加密算法，使用公钥加密、私钥解密。

```java
@EncryptField(
    algorithm = AlgorithmType.RSA,
    publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
    privateKey = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASC..."
)
private String sensitiveData;
```

**特点:**
- 公钥加密、私钥解密
- 安全性极高
- 性能较低，不适合大数据
- 通常用于加密对称密钥

### SM2 国密非对称加密器

SM2是中国国家密码管理局发布的椭圆曲线公钥密码算法。

```java
@EncryptField(
    algorithm = AlgorithmType.SM2,
    publicKey = "04...",
    privateKey = "00..."
)
private String governmentData;
```

**特点:**
- 符合国家密码标准
- 基于椭圆曲线密码学
- 同等安全性下密钥更短
- 等保合规必选

### SM4 国密对称加密器

SM4是中国国家密码管理局发布的分组密码算法。

```java
@EncryptField(algorithm = AlgorithmType.SM4, password = "1234567890123456")
private String financialData;
```

**特点:**
- 符合国家密码标准
- 分组长度和密钥长度均为128位
- 性能接近AES
- 国产化项目首选

## 配置说明

### 数据库字段加密配置

```yaml
# application.yml
mybatis-encryptor:
  # 是否启用数据库字段加密
  enable: true
  # 默认加密算法: BASE64, AES, RSA, SM2, SM4
  algorithm: AES
  # 默认对称加密密钥 (AES: 16/24/32位, SM4: 16位)
  password: "1234567890123456"
  # 默认编码方式: BASE64, HEX
  encode: BASE64
  # 默认RSA/SM2公钥 (非对称加密使用)
  public-key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..."
  # 默认RSA/SM2私钥 (非对称加密使用)
  private-key: "MIIEvgIBADANBgkqhkiG9w0BAQEFAASC..."
```

### API接口加密配置

```yaml
# application.yml
api-decrypt:
  # 是否启用API接口加密
  enabled: true
  # 请求头中携带加密密钥的标识
  header-flag: "encrypt-key"
  # RSA公钥 (用于加密AES密钥)
  public-key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..."
  # RSA私钥 (用于解密AES密钥)
  private-key: "MIIEvgIBADANBgkqhkiG9w0BAQEFAASC..."
```

### 配置属性类

```java
@Data
@ConfigurationProperties(prefix = "mybatis-encryptor")
public class EncryptorProperties {
    /**
     * 加密功能总开关
     */
    private Boolean enable;

    /**
     * 默认加密算法
     */
    private AlgorithmType algorithm;

    /**
     * 默认对称加密密钥
     */
    private String password;

    /**
     * 默认非对称加密公钥
     */
    private String publicKey;

    /**
     * 默认非对称加密私钥
     */
    private String privateKey;

    /**
     * 默认编码方式
     */
    private EncodeType encode;
}
```

## 数据库字段加密

### @EncryptField 注解

```java
@Documented
@Inherited
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface EncryptField {
    /**
     * 加密算法类型
     * 默认使用配置文件中的算法
     */
    AlgorithmType algorithm() default AlgorithmType.DEFAULT;

    /**
     * 对称加密密钥 (AES、SM4使用)
     * 为空时使用配置文件中的密钥
     */
    String password() default "";

    /**
     * 非对称加密公钥 (RSA、SM2使用)
     * 为空时使用配置文件中的公钥
     */
    String publicKey() default "";

    /**
     * 非对称加密私钥 (RSA、SM2使用)
     * 为空时使用配置文件中的私钥
     */
    String privateKey() default "";

    /**
     * 加密结果的编码方式
     * 默认使用配置文件中的编码方式
     */
    EncodeType encode() default EncodeType.DEFAULT;
}
```

### 基本使用示例

```java
@Data
@TableName("sys_user")
public class SysUser {

    @TableId
    private Long userId;

    private String userName;

    /**
     * 手机号 - 使用默认配置加密
     */
    @EncryptField
    private String phone;

    /**
     * 邮箱 - 使用自定义AES密钥加密
     */
    @EncryptField(
        algorithm = AlgorithmType.AES,
        password = "customkey123456"
    )
    private String email;

    /**
     * 身份证号 - 使用RSA非对称加密
     */
    @EncryptField(
        algorithm = AlgorithmType.RSA,
        publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
        privateKey = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASC..."
    )
    private String idCard;

    /**
     * 银行卡号 - 使用国密SM4加密
     */
    @EncryptField(
        algorithm = AlgorithmType.SM4,
        password = "sm4key1234567890"
    )
    private String bankCard;
}
```

### 加密拦截器工作原理

```java
@Intercepts({@Signature(
    type = ParameterHandler.class,
    method = "setParameters",
    args = {PreparedStatement.class})
})
public class MybatisEncryptInterceptor implements Interceptor {

    private final EncryptorManager encryptorManager;
    private final EncryptorProperties defaultProperties;

    @Override
    public Object plugin(Object target) {
        if (target instanceof ParameterHandler parameterHandler) {
            Object parameterObject = parameterHandler.getParameterObject();
            if (ObjectUtil.isNotNull(parameterObject) && !(parameterObject instanceof String)) {
                // 执行加密处理
                this.encryptHandler(parameterObject);
            }
        }
        return target;
    }

    /**
     * 递归处理参数对象中的加密字段
     * 支持Map、List、普通对象等多种参数类型
     */
    private void encryptHandler(Object sourceObject) {
        if (ObjectUtil.isNull(sourceObject)) {
            return;
        }

        // 处理Map类型
        if (sourceObject instanceof Map<?, ?> map) {
            new HashSet<>(map.values()).forEach(this::encryptHandler);
            return;
        }

        // 处理List类型
        if (sourceObject instanceof List<?> list) {
            if (CollUtil.isEmpty(list)) {
                return;
            }
            Object firstItem = list.get(0);
            if (ObjectUtil.isNull(firstItem) ||
                CollUtil.isEmpty(encryptorManager.getFieldCache(firstItem.getClass()))) {
                return;
            }
            list.forEach(this::encryptHandler);
            return;
        }

        // 处理普通对象
        Set<Field> fields = encryptorManager.getFieldCache(sourceObject.getClass());
        if (ObjectUtil.isNull(fields)) {
            return;
        }

        for (Field field : fields) {
            Object fieldValue = field.get(sourceObject);
            String encryptedValue = this.encryptField(Convert.toStr(fieldValue), field);
            field.set(sourceObject, encryptedValue);
        }
    }
}
```

### 解密拦截器工作原理

```java
@Intercepts({@Signature(
    type = ResultSetHandler.class,
    method = "handleResultSets",
    args = {Statement.class})
})
public class MybatisDecryptInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // 执行原始查询
        Object result = invocation.proceed();

        // 对结果进行解密处理
        this.decryptHandler(result);

        return result;
    }

    /**
     * 递归处理查询结果中的解密字段
     */
    private void decryptHandler(Object sourceObject) {
        // 处理逻辑与加密拦截器类似
        // 遍历对象字段，对标注@EncryptField的字段执行解密
    }
}
```

## API接口加密

### @ApiEncrypt 注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiEncrypt {
    /**
     * 是否对响应进行加密
     */
    boolean response() default false;

    /**
     * 是否对请求进行解密
     */
    boolean request() default true;
}
```

### 使用示例

```java
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 登录接口 - 请求解密、响应加密
     */
    @PostMapping("/login")
    @ApiEncrypt(request = true, response = true)
    public R<LoginVo> login(@RequestBody LoginBody loginBody) {
        LoginVo loginVo = userService.login(loginBody);
        return R.ok(loginVo);
    }

    /**
     * 获取用户信息 - 仅响应加密
     */
    @GetMapping("/info")
    @ApiEncrypt(request = false, response = true)
    public R<UserInfo> getUserInfo() {
        UserInfo userInfo = userService.getCurrentUserInfo();
        return R.ok(userInfo);
    }

    /**
     * 修改密码 - 仅请求解密
     */
    @PostMapping("/password")
    @ApiEncrypt(request = true, response = false)
    public R<Void> updatePassword(@RequestBody PasswordBody passwordBody) {
        userService.updatePassword(passwordBody);
        return R.ok();
    }
}
```

### 加密流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           前端 (Client)                                  │
│                                                                          │
│  1. 生成随机AES密钥                                                      │
│  2. 使用AES密钥加密请求数据                                               │
│  3. 使用RSA公钥加密AES密钥                                                │
│  4. 将加密的AES密钥放入请求头 (encrypt-key)                                │
│  5. 发送加密的请求体                                                      │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CryptoFilter (服务端)                               │
│                                                                          │
│  请求处理:                                                                │
│  1. 从请求头获取加密的AES密钥                                              │
│  2. 使用RSA私钥解密AES密钥                                                │
│  3. 使用AES密钥解密请求体                                                  │
│  4. 传递解密后的数据给Controller                                           │
│                                                                          │
│  响应处理:                                                                │
│  1. 生成新的随机AES密钥                                                   │
│  2. 使用AES密钥加密响应数据                                               │
│  3. 使用RSA公钥加密AES密钥                                                │
│  4. 将加密的AES密钥放入响应头                                              │
│  5. 返回加密的响应体                                                      │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           前端 (Client)                                  │
│                                                                          │
│  1. 从响应头获取加密的AES密钥                                              │
│  2. 使用RSA私钥解密AES密钥                                                │
│  3. 使用AES密钥解密响应数据                                               │
│  4. 使用解密后的数据                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

## 加密器管理器

### EncryptorManager

```java
@Slf4j
@NoArgsConstructor
public class EncryptorManager {

    /**
     * 加密器实例缓存
     * Key: EncryptContext的hashCode
     * Value: 对应的加密器实例
     */
    Map<Integer, IEncryptor> encryptorMap = new ConcurrentHashMap<>();

    /**
     * 类的加密字段缓存
     * Key: 实体类的Class对象
     * Value: 该类中标注了@EncryptField注解的字段集合
     */
    Map<Class<?>, Set<Field>> fieldCache = new ConcurrentHashMap<>();

    /**
     * 构造方法，初始化时扫描实体类
     *
     * @param typeAliasesPackage 实体类所在包路径
     */
    public EncryptorManager(String typeAliasesPackage) {
        scanEncryptClasses(typeAliasesPackage);
    }

    /**
     * 注册并获取加密器实例
     * 使用缓存机制，相同配置的加密器会复用实例
     */
    public IEncryptor registAndGetEncryptor(EncryptContext encryptContext) {
        int key = encryptContext.hashCode();
        if (encryptorMap.containsKey(key)) {
            return encryptorMap.get(key);
        }
        // 使用反射创建加密器实例
        IEncryptor encryptor = ReflectUtil.newInstance(
            encryptContext.getAlgorithm().getClazz(),
            encryptContext
        );
        encryptorMap.put(key, encryptor);
        return encryptor;
    }

    /**
     * 统一加密接口
     */
    public String encrypt(String value, EncryptContext encryptContext) {
        if (StringUtils.startsWith(value, Constants.ENCRYPT_HEADER)) {
            return value;
        }
        IEncryptor encryptor = this.registAndGetEncryptor(encryptContext);
        String encrypt = encryptor.encrypt(value, encryptContext.getEncode());
        return Constants.ENCRYPT_HEADER + encrypt;
    }

    /**
     * 统一解密接口
     */
    public String decrypt(String value, EncryptContext encryptContext) {
        if (!StringUtils.startsWith(value, Constants.ENCRYPT_HEADER)) {
            return value;
        }
        IEncryptor encryptor = this.registAndGetEncryptor(encryptContext);
        String str = StringUtils.removeStart(value, Constants.ENCRYPT_HEADER);
        return encryptor.decrypt(str);
    }
}
```

### 缓存策略

| 缓存类型 | 说明 | 优化效果 |
|----------|------|----------|
| `encryptorMap` | 加密器实例缓存 | 避免重复创建加密器实例 |
| `fieldCache` | 类字段缓存 | 避免运行时重复反射 |

### 加密标识头

系统使用 `Constants.ENCRYPT_HEADER` 作为加密数据的标识前缀，用于:

1. 区分已加密数据和明文数据
2. 防止重复加密
3. 解密时识别需要处理的数据

```java
// 加密时添加标识头
return Constants.ENCRYPT_HEADER + encrypt;

// 解密时检查标识头
if (!StringUtils.startsWith(value, Constants.ENCRYPT_HEADER)) {
    return value;  // 非加密数据直接返回
}
```

## 自动配置

### 数据库加密自动配置

```java
@AutoConfiguration
@EnableConfigurationProperties(EncryptorProperties.class)
@ConditionalOnProperty(
    value = "mybatis-encryptor.enable",
    havingValue = "true"
)
public class EncryptorAutoConfiguration {

    @Autowired
    private EncryptorProperties properties;

    @Bean
    public EncryptorManager encryptorManager(
            @Value("${mybatis.typeAliasesPackage}") String typeAliasesPackage) {
        return new EncryptorManager(typeAliasesPackage);
    }

    @Bean
    public MybatisEncryptInterceptor mybatisEncryptInterceptor(
            EncryptorManager encryptorManager) {
        return new MybatisEncryptInterceptor(encryptorManager, properties);
    }

    @Bean
    public MybatisDecryptInterceptor mybatisDecryptInterceptor(
            EncryptorManager encryptorManager) {
        return new MybatisDecryptInterceptor(encryptorManager, properties);
    }
}
```

### API加密自动配置

```java
@AutoConfiguration
@EnableConfigurationProperties(ApiDecryptProperties.class)
@ConditionalOnProperty(
    value = "api-decrypt.enabled",
    havingValue = "true"
)
public class ApiDecryptAutoConfiguration {

    @Bean
    public FilterRegistrationBean<CryptoFilter> cryptoFilterRegistration(
            ApiDecryptProperties properties) {
        FilterRegistrationBean<CryptoFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new CryptoFilter(properties));
        registration.addUrlPatterns("/*");
        registration.setName("cryptoFilter");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
```

## 最佳实践

### 1. 算法选择策略

```java
// 日常业务数据 - 推荐AES
@EncryptField(algorithm = AlgorithmType.AES)
private String phone;

// 高敏感数据 - 推荐RSA或SM2
@EncryptField(algorithm = AlgorithmType.RSA)
private String idCard;

// 国产化项目 - 必须使用国密算法
@EncryptField(algorithm = AlgorithmType.SM4)
private String governmentData;

// 简单混淆 - 可使用BASE64 (不推荐用于安全场景)
@EncryptField(algorithm = AlgorithmType.BASE64)
private String nonSensitiveData;
```

### 2. 密钥管理

```java
// ❌ 错误示例：密钥硬编码在代码中
@EncryptField(algorithm = AlgorithmType.AES, password = "1234567890123456")
private String data;

// ✅ 正确示例：使用配置文件管理密钥
@EncryptField(algorithm = AlgorithmType.AES)  // 密钥从配置文件读取
private String data;
```

```yaml
# application-prod.yml (生产环境配置)
mybatis-encryptor:
  enable: true
  algorithm: AES
  password: ${ENCRYPT_PASSWORD}  # 从环境变量读取
```

### 3. 分层加密

```java
@Data
public class UserSensitiveInfo {
    // 一般敏感信息 - AES加密
    @EncryptField(algorithm = AlgorithmType.AES)
    private String phone;

    @EncryptField(algorithm = AlgorithmType.AES)
    private String email;

    // 高度敏感信息 - RSA加密
    @EncryptField(algorithm = AlgorithmType.RSA)
    private String idCard;

    @EncryptField(algorithm = AlgorithmType.RSA)
    private String bankCard;
}
```

### 4. 性能优化

```java
// 只加密必要的字段，避免过度加密
@Data
public class Order {
    private Long orderId;
    private String orderNo;        // 无需加密
    private BigDecimal amount;     // 无需加密

    @EncryptField                  // 只加密敏感信息
    private String buyerPhone;

    @EncryptField
    private String deliveryAddress;
}
```

### 5. 查询条件处理

```java
@Service
public class UserService {

    @Autowired
    private EncryptorManager encryptorManager;

    /**
     * 根据手机号查询用户
     * 需要先对查询条件加密
     */
    public SysUser findByPhone(String phone) {
        // 构建加密上下文
        EncryptContext context = new EncryptContext();
        context.setAlgorithm(AlgorithmType.AES);
        context.setPassword("1234567890123456");
        context.setEncode(EncodeType.BASE64);

        // 加密查询条件
        String encryptedPhone = encryptorManager.encrypt(phone, context);

        // 使用加密后的值查询
        return userMapper.selectOne(
            new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getPhone, encryptedPhone)
        );
    }
}
```

## 常见问题

### 1. 已有数据加密迁移

**问题描述:** 系统上线后需要对已有明文数据进行加密

**解决方案:**

```java
@Service
public class DataMigrationService {

    @Autowired
    private EncryptorManager encryptorManager;

    /**
     * 批量加密历史数据
     */
    @Transactional
    public void migrateUserData() {
        // 1. 临时禁用加密拦截器
        // 2. 查询所有用户
        List<SysUser> users = userMapper.selectList(null);

        // 3. 对每条数据进行加密
        for (SysUser user : users) {
            if (needsEncrypt(user.getPhone())) {
                user.setPhone(encryptField(user.getPhone()));
            }
            if (needsEncrypt(user.getIdCard())) {
                user.setIdCard(encryptField(user.getIdCard()));
            }
            userMapper.updateById(user);
        }
    }

    private boolean needsEncrypt(String value) {
        // 检查是否已加密(是否有加密标识头)
        return StringUtils.isNotBlank(value) &&
               !value.startsWith(Constants.ENCRYPT_HEADER);
    }
}
```

### 2. 加密字段模糊查询

**问题描述:** 加密后的字段无法进行LIKE查询

**解决方案:**

1. **方案一: 存储前缀索引**

```java
@Data
public class SysUser {
    @EncryptField
    private String phone;

    // 存储手机号前3位明文，用于模糊查询
    private String phonePrefix;
}
```

2. **方案二: 使用确定性加密**

```java
// 确保相同明文加密后密文相同
// 可以支持精确匹配，但不支持模糊查询
```

3. **方案三: 业务层过滤**

```java
public List<SysUser> searchByPhone(String phonePart) {
    // 查询所有用户
    List<SysUser> allUsers = userMapper.selectList(null);
    // 解密后过滤
    return allUsers.stream()
        .filter(u -> u.getPhone().contains(phonePart))
        .collect(Collectors.toList());
}
```

### 3. 密钥轮换

**问题描述:** 需要更换加密密钥

**解决方案:**

```java
@Service
public class KeyRotationService {

    public void rotateKey(String oldPassword, String newPassword) {
        // 1. 使用旧密钥解密所有数据
        // 2. 使用新密钥重新加密
        // 3. 更新配置中的密钥
        // 4. 建议在低峰期执行
    }
}
```

### 4. 加密性能问题

**问题描述:** 大量数据加密导致性能下降

**解决方案:**

1. 使用批量处理

```java
// 批量插入时，数据会在拦截器中统一加密
userMapper.insertBatch(userList);
```

2. 优化加密器缓存

```java
// 确保使用相同配置，复用加密器实例
@EncryptField  // 使用默认配置，而不是每个字段指定不同配置
private String phone;
```

3. 减少加密字段数量

```java
// 只加密真正需要加密的字段
// 避免对所有字段都进行加密
```

### 5. 不同环境密钥不一致

**问题描述:** 开发、测试、生产环境使用不同密钥导致数据不兼容

**解决方案:**

```yaml
# application-dev.yml
mybatis-encryptor:
  password: "dev12345dev12345"

# application-test.yml
mybatis-encryptor:
  password: "test1234test1234"

# application-prod.yml
mybatis-encryptor:
  password: ${ENCRYPT_PASSWORD}  # 从安全的配置中心获取
```

**注意:** 从一个环境迁移数据到另一个环境时，需要先解密再用新密钥加密。

## 安全建议

| 建议 | 说明 |
|------|------|
| 密钥安全存储 | 使用配置中心或KMS管理密钥 |
| 定期轮换密钥 | 建议每3-6个月更换一次密钥 |
| 密钥访问控制 | 只有必要的服务能访问密钥 |
| 审计日志 | 记录加解密操作的审计日志 |
| 环境隔离 | 不同环境使用不同密钥 |
| 传输安全 | 配合HTTPS使用 |
