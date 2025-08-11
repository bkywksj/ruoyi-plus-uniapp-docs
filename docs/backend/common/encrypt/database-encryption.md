# 数据库字段加密 (Database Field Encryption)

数据库字段加密功能基于MyBatis拦截器实现，通过`@EncryptField`注解标记需要加密的字段，在数据入库前自动加密，查询时自动解密，对业务代码完全透明。

## 配置说明

### 全局配置

在 `application.yml` 中配置默认的加密参数：

```yaml
mybatis-encryptor:
  # 功能开关
  enable: true
  
  # 默认加密算法（当注解中algorithm为DEFAULT时使用）
  algorithm: AES
  
  # 默认编码方式
  encode: BASE64
  
  # 对称加密密钥（AES/SM4使用）
  password: "1234567890123456"
  
  # 非对称加密公私钥（RSA/SM2使用）
  public-key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
  private-key: "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..."
```

### MyBatis-Plus集成配置

确保MyBatis-Plus的实体扫描包配置正确：

```yaml
mybatis-plus:
  # 实体类扫描包（加密器会扫描这些包下的@EncryptField注解）
  type-aliases-package: plus.ruoyi.**.domain.entity
  # Mapper扫描包
  mapper-package: plus.ruoyi.**.mapper
```

## @EncryptField 注解详解

### 基础用法

```java
@Data
@TableName("sys_user")
public class SysUser {
    
    @TableId
    private Long userId;
    
    private String userName;
    
    // 使用默认配置加密
    @EncryptField
    private String phone;
    
    // 指定加密算法
    @EncryptField(algorithm = AlgorithmType.SM4)
    private String email;
    
    // 使用自定义密钥
    @EncryptField(
        algorithm = AlgorithmType.AES,
        password = "customkey123456789",
        encode = EncodeType.HEX
    )
    private String idCard;
}
```

### 注解参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `algorithm` | AlgorithmType | DEFAULT | 加密算法类型 |
| `password` | String | "" | 对称加密密钥 |
| `publicKey` | String | "" | 非对称加密公钥 |
| `privateKey` | String | "" | 非对称加密私钥 |
| `encode` | EncodeType | DEFAULT | 编码方式 |

**参数优先级**：注解参数 > 全局配置

## 各算法使用示例

### 1. BASE64 编码

```java
public class User {
    // BASE64不需要密钥，主要用于数据混淆
    @EncryptField(algorithm = AlgorithmType.BASE64)
    private String remark;
}
```

### 2. AES 对称加密

```java
public class User {
    // 使用全局配置的AES密钥
    @EncryptField(algorithm = AlgorithmType.AES)
    private String phone;
    
    // 使用自定义AES密钥（16位）
    @EncryptField(
        algorithm = AlgorithmType.AES,
        password = "mykey1234567890"
    )
    private String email;
    
    // AES + HEX编码
    @EncryptField(
        algorithm = AlgorithmType.AES,
        password = "mykey1234567890",
        encode = EncodeType.HEX
    )
    private String idCard;
}
```

**AES密钥要求**：
- 密钥长度必须是16位、24位或32位
- 密钥强度：16位 < 24位 < 32位

### 3. RSA 非对称加密

```java
public class User {
    @EncryptField(
        algorithm = AlgorithmType.RSA,
        publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
        privateKey = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..."
    )
    private String bankCard;
}
```

**RSA密钥生成**：
```java
// 使用工具类生成RSA密钥对
Map<String, String> keyMap = EncryptUtils.generateRsaKey();
String publicKey = keyMap.get(EncryptUtils.PUBLIC_KEY);
String privateKey = keyMap.get(EncryptUtils.PRIVATE_KEY);
```

### 4. SM2 国密非对称加密

```java
public class User {
    @EncryptField(
        algorithm = AlgorithmType.SM2,
        publicKey = "你的SM2公钥",
        privateKey = "你的SM2私钥"
    )
    private String socialSecurityNumber;
}
```

**SM2密钥生成**：
```java
// 使用工具类生成SM2密钥对
Map<String, String> keyMap = EncryptUtils.generateSm2Key();
String publicKey = keyMap.get(EncryptUtils.PUBLIC_KEY);
String privateKey = keyMap.get(EncryptUtils.PRIVATE_KEY);
```

### 5. SM4 国密对称加密

```java
public class User {
    // SM4密钥必须是16位
    @EncryptField(
        algorithm = AlgorithmType.SM4,
        password = "sm4key1234567890"
    )
    private String passport;
}
```

## 工作原理

### 1. 启动时扫描

系统启动时，`EncryptorManager` 会扫描配置的实体包，缓存包含 `@EncryptField` 注解的类和字段信息：

```java
// 扫描过程
1. 根据 mybatis-plus.type-aliases-package 配置扫描类文件
2. 检查类中是否有 @EncryptField 注解的 String 类型字段
3. 将包含加密字段的类信息缓存到 fieldCache 中
4. 设置字段为可访问状态（setAccessible(true)）
```

### 2. 加密拦截器

`MybatisEncryptInterceptor` 拦截 `ParameterHandler.setParameters` 方法：

```java
// 拦截时机：SQL参数设置前
1. 获取SQL参数对象
2. 递归遍历参数中的对象（支持Map、List、普通对象）
3. 对标注了@EncryptField的字段进行加密
4. 将加密后的值设置回字段
```

### 3. 解密拦截器

`MybatisDecryptInterceptor` 拦截 `ResultSetHandler.handleResultSets` 方法：

```java
// 拦截时机：结果集处理完成后
1. 获取查询结果对象
2. 递归遍历结果中的对象（支持Map、List、普通对象）
3. 对标注了@EncryptField的字段进行解密
4. 将解密后的值设置回字段
```

## 支持的数据类型

### 1. 普通对象

```java
// 直接查询实体
SysUser user = userMapper.selectById(1L);
// phone字段自动解密
```

### 2. List 集合

```java
// 批量查询
List<SysUser> users = userMapper.selectList(null);
// 每个user对象的phone字段都会自动解密
```

### 3. 分页查询

```java
// MyBatis-Plus分页
Page<SysUser> page = new Page<>(1, 10);
Page<SysUser> result = userMapper.selectPage(page, null);
// 分页结果中的记录会自动解密
```

### 4. Map 结果

```java
// 自定义SQL返回Map
List<Map<String, Object>> maps = userMapper.selectMaps(null);
// Map中的加密字段值会自动解密
```

## 性能优化

### 1. 缓存机制

```java
// 字段缓存：避免重复反射
Map<Class<?>, Set<Field>> fieldCache;

// 加密器缓存：避免重复创建实例
Map<Integer, IEncryptor> encryptorMap;
```

### 2. 智能跳过

```java
// 如果类中没有加密字段，直接跳过处理
Set<Field> fields = encryptorManager.getFieldCache(sourceObject.getClass());
if (ObjectUtil.isNull(fields)) {
    return; // 直接返回，不做任何处理
}
```

### 3. 批量处理优化

```java
// 对于List类型，检查第一个元素是否有加密字段
if (CollUtil.isEmpty(list)) {
    return;
}
Object firstItem = list.get(0);
if (ObjectUtil.isNull(firstItem) || 
    CollUtil.isEmpty(encryptorManager.getFieldCache(firstItem.getClass()))) {
    return; // 如果第一个元素没有加密字段，整个List都跳过
}
```

## 最佳实践

### 1. 字段选择原则

**适合加密的字段**：
- 用户隐私信息（手机号、邮箱、身份证）
- 敏感业务数据（银行卡号、密码）
- 法规要求保护的数据

**不适合加密的字段**：
- 需要进行范围查询的字段（如金额、日期）
- 需要排序的字段
- 外键关联字段
- 频繁查询的索引字段

### 2. 性能考虑

```java
// ❌ 不推荐：对所有字符串字段都加密
@EncryptField private String name;        // 姓名通常不需要加密
@EncryptField private String address;     // 地址可能需要模糊查询
@EncryptField private String department;  // 部门名称不需要加密

// ✅ 推荐：只对真正敏感的字段加密
@EncryptField private String phone;       // 手机号需要保护
@EncryptField private String idCard;      // 身份证号需要保护
@EncryptField private String bankCard;    // 银行卡号需要保护
```

### 3. 算法选择策略

```java
// 根据敏感级别选择算法
public class User {
    // 低敏感：BASE64混淆
    @EncryptField(algorithm = AlgorithmType.BASE64)
    private String nickname;
    
    // 中敏感：AES加密
    @EncryptField(algorithm = AlgorithmType.AES)
    private String phone;
    
    // 高敏感：RSA加密
    @EncryptField(algorithm = AlgorithmType.RSA)
    private String idCard;
    
    // 国产化项目：使用国密算法
    @EncryptField(algorithm = AlgorithmType.SM2)
    private String bankCard;
}
```

### 4. 查询注意事项

```java
// ❌ 加密字段不支持条件查询
LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(SysUser::getPhone, "13800138000"); // 这样查询不到结果

// ✅ 如果需要按加密字段查询，需要手动加密查询条件
String encryptedPhone = encryptorManager.encrypt("13800138000", encryptContext);
wrapper.eq(SysUser::getPhone, encryptedPhone);
```

## 故障排查

### 常见问题

1. **字段值为null**
    - 原因：加密字段被赋值为null
    - 解决：检查业务逻辑，确保字段有值再进行数据库操作

2. **加密配置不生效**
    - 检查 `mybatis-encryptor.enable` 是否为 `true`
    - 检查实体类是否在扫描包路径内
    - 检查字段是否为 `String` 类型

3. **密钥长度错误**
    - AES：确保密钥为16/24/32位
    - SM4：确保密钥为16位
    - RSA/SM2：确保公私钥格式正确

4. **查询结果乱码**
    - 检查数据库字符集设置
    - 检查encode配置是否与加密时一致

### 调试建议

```java
// 开启MyBatis SQL日志
logging:
  level:
    plus.ruoyi.common.encrypt: DEBUG
```

通过日志可以查看加密解密的执行过程和异常信息。
