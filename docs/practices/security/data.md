# 数据安全

## 介绍

RuoYi-Plus 提供完整的数据安全解决方案，涵盖数据加密存储、敏感数据脱敏、数据权限控制、SQL注入防护、XSS攻击防护等多层次安全机制。

**核心特性：**

- **多算法数据加密** - 支持 AES、RSA、SM2、SM4 等加密算法
- **字段级加密** - `@EncryptField` 注解实现自动加解密
- **敏感数据脱敏** - 15 种内置脱敏策略，支持动态脱敏
- **数据权限控制** - 6 种数据权限类型，精细化访问控制
- **SQL注入防护** - 关键字过滤和参数校验
- **XSS攻击防护** - 多模式 XSS 检测

---

## 数据加密

### 加密算法

```java
public enum AlgorithmType {
    BASE64,  // 编码转换，非加密
    AES,     // 对称加密，速度快，密钥16/24/32字节
    RSA,     // 非对称加密，安全性高
    SM2,     // 国密非对称，政务金融场景
    SM4      // 国密对称，密钥16字节
}
```

### 加密配置

```yaml
mybatis-encryptor:
  enable: true
  algorithm: AES
  password: "abcdefghijklmnop"  # 16位密钥
  public-key: "MIIBIjANBgkqhkiG9..."
  private-key: "MIIEvQIBADANBg..."
  encode: BASE64
```

### 字段加密

```java
public class SysUser {
    @EncryptField
    private String phonenumber;

    @EncryptField(algorithm = AlgorithmType.AES)
    private String idCard;

    @EncryptField(algorithm = AlgorithmType.SM4)
    private String bankCard;

    @EncryptField(
        algorithm = AlgorithmType.RSA,
        publicKey = "MIIBIjAN...",
        privateKey = "MIIEvQI..."
    )
    private String email;
}
```

### 加密工具类

```java
// AES加密
String encrypted = EncryptUtils.encryptByAes(plainText, password);
String decrypted = EncryptUtils.decryptByAes(encrypted, password);

// RSA加密
Map<String, String> rsaKeys = EncryptUtils.generateRsaKey();
String rsaEncrypted = EncryptUtils.encryptByRsa(plainText, publicKey);
String rsaDecrypted = EncryptUtils.decryptByRsa(rsaEncrypted, privateKey);

// SM2国密
Map<String, String> sm2Keys = EncryptUtils.generateSm2Key();
String sm2Encrypted = EncryptUtils.encryptBySm2(plainText, sm2PublicKey);
String sm2Decrypted = EncryptUtils.decryptBySm2(sm2Encrypted, sm2PrivateKey);

// SM4国密
String sm4Encrypted = EncryptUtils.encryptBySm4(plainText, sm4Password);
String sm4Decrypted = EncryptUtils.decryptBySm4(sm4Encrypted, sm4Password);

// 哈希算法
String md5Hash = EncryptUtils.encryptByMd5(plainText);
String sha256Hash = EncryptUtils.encryptBySha256(plainText);
String sm3Hash = EncryptUtils.encryptBySm3(plainText);
```

### API传输加密

```java
@ApiEncrypt
@PostMapping("/login")
public R<LoginVo> login(@RequestBody LoginBody loginBody) {
    // 请求体自动解密，响应体自动加密
    return R.ok(loginService.login(loginBody));
}

@ApiEncrypt(request = false, response = true)
@GetMapping("/info")
public R<UserInfoVo> getUserInfo() {
    // 仅响应加密
    return R.ok(userService.getCurrentUserInfo());
}
```

---

## 敏感数据脱敏

### 脱敏策略

```java
public enum SensitiveStrategy {
    ID_CARD(s -> DesensitizedUtil.idCardNum(s, 3, 4)),      // 110***********1234
    PHONE(DesensitizedUtil::mobilePhone),                    // 138****5678
    ADDRESS(s -> DesensitizedUtil.address(s, 8)),           // 北京市朝阳区***
    EMAIL(DesensitizedUtil::email),                          // t**t@example.com
    BANK_CARD(DesensitizedUtil::bankCard),                   // 6222***********0123
    CHINESE_NAME(DesensitizedUtil::chineseName),             // 张**
    FIXED_PHONE(DesensitizedUtil::fixedPhone),               // 010-****5678
    USER_ID(s -> String.valueOf(DesensitizedUtil.userId())), // 随机数字
    PASSWORD(DesensitizedUtil::password),                    // ***********
    IPV4(DesensitizedUtil::ipv4),                            // 192.168.*.*
    IPV6(DesensitizedUtil::ipv6),                            // 2001:0db8:85a3:*:*:*:*:*
    CAR_LICENSE(DesensitizedUtil::carLicense),               // 京A1***5
    FIRST_MASK(DesensitizedUtil::firstMask),                 // T*******
    CLEAR(s -> ""),                                          // 空字符串
    CLEAR_TO_NULL(s -> null);                                // null
}
```

### 使用脱敏注解

```java
public class UserInfoVo {
    @Sensitive(strategy = SensitiveStrategy.PHONE)
    private String phonenumber;

    // admin/manager角色可查看原数据
    @Sensitive(
        strategy = SensitiveStrategy.ID_CARD,
        roleKey = {"admin", "manager"}
    )
    private String idCard;

    // 有指定权限可查看原数据
    @Sensitive(
        strategy = SensitiveStrategy.EMAIL,
        perms = {"user:detail", "user:export"}
    )
    private String email;

    // 角色或权限满足其一即可查看
    @Sensitive(
        strategy = SensitiveStrategy.BANK_CARD,
        roleKey = {"finance"},
        perms = {"user:finance"}
    )
    private String bankCard;

    @Sensitive(strategy = SensitiveStrategy.ADDRESS)
    private String address;

    @Sensitive(strategy = SensitiveStrategy.CHINESE_NAME)
    private String realName;
}
```

### 脱敏权限判断

```java
@Service
public class SensitiveServiceImpl implements SensitiveService {
    @Override
    public boolean isSensitive(String[] roleKey, String[] perms) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null) return true;
        if (LoginHelper.isSuperAdmin()) return false;

        // 检查角色（OR关系）
        if (ArrayUtil.isNotEmpty(roleKey)) {
            Set<String> userRoles = loginUser.getRolePermission();
            for (String role : roleKey) {
                if (userRoles.contains(role)) return false;
            }
        }

        // 检查权限（OR关系）
        if (ArrayUtil.isNotEmpty(perms)) {
            Set<String> userPerms = loginUser.getMenuPermission();
            for (String perm : perms) {
                if (userPerms.contains(perm)) return false;
            }
        }
        return true;
    }
}
```

---

## 数据权限控制

### 权限类型

```java
public enum DataScopeType {
    ALL("1", "", ""),                           // 全部数据
    CUSTOM("2",                                  // 自定义部门列表
        " #{#deptName} IN ( #{@sdss.getRoleCustom( #user.roleId )} ) ",
        " 1 = 0 "),
    DEPT("3",                                    // 仅本部门
        " #{#deptName} = #{#user.deptId} ",
        " 1 = 0 "),
    DEPT_AND_CHILD("4",                         // 本部门及以下
        " #{#deptName} IN ( #{@sdss.getDeptAndChild( #user.deptId )} ) ",
        " 1 = 0 "),
    SELF("5",                                    // 仅本人
        " #{#userName} = #{#user.userId} ",
        " 1 = 0 "),
    DEPT_AND_CHILD_OR_SELF("6",                 // 本部门及以下或本人
        " #{#deptName} IN ( #{@sdss.getDeptAndChild( #user.deptId )} ) " +
        " OR #{#userName} = #{#user.userId} ",
        " 1 = 0 ");
}
```

### 使用数据权限

```java
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    @DataPermission({
        @DataColumn(key = "deptName", value = "d.dept_id"),
        @DataColumn(key = "userName", value = "u.user_id")
    })
    List<SysUserVo> selectUserList(@Param("user") SysUserBo user);

    @DataPermission({
        @DataColumn(key = "deptName", value = "dept_id")
    })
    List<SysUser> selectDeptUserList(@Param("deptId") Long deptId);

    // 禁用数据权限
    @DataPermission({})
    SysUser selectUserById(@Param("userId") Long userId);
}
```

### 数据范围服务

```java
@Service("sdss")
public class SysDataScopeServiceImpl implements ISysDataScopeService {

    @Cacheable(cacheNames = CacheNames.SYS_ROLE_CUSTOM, key = "#roleId")
    public String getRoleCustom(Long roleId) {
        List<Long> deptIds = roleDeptService.selectDeptIdsByRoleId(roleId);
        if (CollUtil.isEmpty(deptIds)) return "-1";
        return CollUtil.join(deptIds, ",");
    }

    @Cacheable(cacheNames = CacheNames.SYS_DEPT_AND_CHILD, key = "#deptId")
    public String getDeptAndChild(Long deptId) {
        List<Long> deptIds = deptService.selectDeptIdsByParentId(deptId);
        if (CollUtil.isEmpty(deptIds)) return "-1";
        deptIds.add(0, deptId);
        return CollUtil.join(deptIds, ",");
    }
}
```

---

## SQL注入防护

### SQL过滤工具

```java
public class SqlUtil {
    private static final String SQL_REGEX =
        "and|extractvalue|updatexml|sleep|exec|insert|select|delete|update|" +
        "drop|count|chr|mid|master|truncate|char|declare|or|union|like|\\+|/\\*|user\\(\\)";

    private static final Pattern SQL_PATTERN = Pattern.compile("^[a-zA-Z0-9_\\ \\,\\.]+$");

    // ORDER BY安全校验
    public static String escapeOrderBySql(String value) {
        if (StrUtil.isBlank(value)) return value;
        if (!isValidOrderBySql(value)) {
            throw new IllegalArgumentException("ORDER BY子句包含非法字符");
        }
        return value;
    }

    public static boolean isValidOrderBySql(String value) {
        return SQL_PATTERN.matcher(value).matches();
    }

    // SQL关键字过滤
    public static void filterKeyword(String value) {
        if (StrUtil.isBlank(value)) return;
        String lowerValue = value.toLowerCase();
        String[] keywords = SQL_REGEX.split("\\|");
        for (String keyword : keywords) {
            if (lowerValue.contains(keyword)) {
                throw new IllegalArgumentException("检测到SQL注入风险");
            }
        }
    }
}
```

### 使用参数化查询

```xml
<!-- 安全: 使用#{}占位符 -->
<select id="selectUserByName" resultType="SysUser">
    SELECT * FROM sys_user WHERE user_name = #{userName}
</select>

<!-- 危险: ${}直接拼接，必须做白名单校验 -->
<select id="selectByTable" resultType="Map">
    SELECT * FROM ${tableName} WHERE id = #{id}
</select>
```

---

## XSS攻击防护

### XSS检测模式

```java
public @interface Xss {
    String message() default "参数包含非法字符";
    Mode mode() default Mode.BASIC;

    enum Mode {
        BASIC,    // 基础模式：script标签、事件处理器、伪协议、危险标签
        STRICT,   // 严格模式：增加编码绕过、函数调用、data协议检测
        LENIENT   // 宽松模式：仅检测script、iframe/object/embed
    }
}
```

### 使用XSS注解

```java
public class RegisterBody {
    @Xss(message = "用户名不能包含脚本代码")
    @NotBlank(message = "用户名不能为空")
    private String userName;

    // 严格模式
    @Xss(mode = Xss.Mode.STRICT, message = "内容存在安全风险")
    private String content;

    // 宽松模式（富文本）
    @Xss(mode = Xss.Mode.LENIENT, message = "内容包含危险脚本")
    private String richText;
}
```

---

## 安全检查清单

### 数据存储

- [ ] 敏感数据（身份证、银行卡）加密存储
- [ ] 密码使用 BCrypt 不可逆加密
- [ ] 加密密钥未硬编码
- [ ] 密钥有定期轮换机制

### 数据传输

- [ ] 使用 HTTPS 协议
- [ ] 敏感 API 使用 `@ApiEncrypt`
- [ ] 响应中敏感数据已脱敏

### 数据访问

- [ ] 实现数据权限控制
- [ ] 敏感操作有审计日志
- [ ] 异常信息不暴露敏感数据

### 输入验证

- [ ] 用户输入进行 XSS 检测
- [ ] 动态 SQL 参数进行注入检查
- [ ] 使用参数化查询

---

## 常见问题

### 1. 加密后数据长度变化

**解决方案：**
- AES 加密后约 1.33 倍
- RSA 2048 输出 256 字节
- 数据库字段长度预留 1.5-2 倍

### 2. 加密字段无法模糊查询

**解决方案：**
```java
// 方案1: 存储哈希索引用于精确查询
@EncryptField
private String phonenumber;
private String phonenumberHash;  // MD5哈希

// 方案2: 存储部分明文用于模糊查询
private String phonenumberPrefix;  // 前3位
private String phonenumberSuffix;  // 后4位
```

### 3. 脱敏数据导出问题

**解决方案：**
```java
// 使用独立的导出VO，不带@Sensitive注解
public static class UserExportVo {
    private String userName;
    private String phonenumber;  // 无脱敏注解
}

@PreAuthorize("hasPermission('user:export')")
public void exportUsers(HttpServletResponse response) {
    List<UserExportVo> exportList = userMapper.selectExportList();
    ExcelUtil.exportExcel(exportList, "用户数据", UserExportVo.class, response);
}
```

### 4. 数据权限影响统计查询

**解决方案：**
```java
// 使用空的@DataPermission跳过数据权限
@DataPermission({})
@Select("SELECT COUNT(*) FROM sys_user WHERE del_flag = '0'")
long countAllUsers();
```
