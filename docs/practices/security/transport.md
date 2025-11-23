# 传输安全

## 概述

传输安全是确保数据在客户端与服务器之间传输过程中不被窃取、篡改或伪造的关键技术领域。RuoYi-Plus-UniApp 项目实现了完整的传输层安全机制,包括 HTTPS/TLS 协议配置、混合加密传输、请求签名验证、防重复提交等多层安全防护。

**核心安全目标:**

- **机密性(Confidentiality)** - 确保传输数据只有合法接收方能够解读,防止窃听攻击
- **完整性(Integrity)** - 确保数据在传输过程中未被篡改,防止中间人攻击
- **真实性(Authenticity)** - 确保通信双方身份的真实性,防止伪造请求
- **不可抵赖性(Non-repudiation)** - 确保发送方无法否认已发送的消息

**安全架构层次:**

```
┌─────────────────────────────────────────────────────────────┐
│                     应用层安全                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ AES+RSA混合 │  │ 请求签名   │  │ 防重复提交          │  │
│  │ 加密传输    │  │ 验证       │  │ (Redis分布式锁)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     传输层安全                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  HTTPS/TLS 1.2+ 加密通道                                ││
│  │  - 服务器证书验证                                        ││
│  │  - 数据库连接SSL                                         ││
│  │  - Redis连接SSL                                          ││
│  │  - 邮件SMTP SSL/STARTTLS                                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## HTTPS/TLS 配置

### SSL/TLS 协议配置

项目支持在多个层面配置 SSL/TLS 安全传输。

#### HTTP 客户端 TLS 配置

基于 Forest HTTP 客户端的 TLS 协议配置,支持安全的 HTTPS 请求:

```yaml
# http-client-prod.yml - HTTP客户端生产环境配置
forest:
  # HTTP后端选择 (okhttp3/httpclient)
  backend: okhttp3

  # 连接池配置
  max-connections: 1000
  max-route-connections: 500
  max-request-queue-size: 100

  # 超时配置
  timeout: 3000
  connect-timeout: 300000
  read-timeout: 300000

  # TLS协议版本 - 单向验证HTTPS的默认协议
  ssl-protocol: TLS

  # 失败重试策略
  max-retry-count: 0

  # 生产环境关闭日志
  log-enabled: false
  log-request: false
  log-response-status: false
  log-response-content: false
```

**配置说明:**

| 配置项 | 说明 | 推荐值 |
|--------|------|--------|
| `ssl-protocol` | SSL/TLS协议版本 | `TLS` (自动协商最高版本) |
| `connect-timeout` | 连接超时时间 | 生产环境300秒 |
| `read-timeout` | 读取超时时间 | 生产环境300秒 |
| `max-connections` | 最大连接数 | 生产环境1000 |

#### 数据库连接 SSL 配置

MySQL 数据库连接支持 SSL 加密传输:

```yaml
# application-prod.yml - 数据库SSL配置
spring:
  datasource:
    dynamic:
      datasource:
        master:
          # JDBC URL 包含 useSSL=true 启用SSL连接
          url: jdbc:mysql://${DB_HOST}:${DB_PORT:3306}/${DB_NAME}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&autoReconnect=true&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}
```

**JDBC SSL 参数说明:**

| 参数 | 说明 | 安全建议 |
|------|------|----------|
| `useSSL=true` | 启用SSL加密连接 | 生产环境必须启用 |
| `requireSSL=true` | 强制要求SSL | 高安全环境启用 |
| `verifyServerCertificate=true` | 验证服务器证书 | 防止中间人攻击 |
| `allowPublicKeyRetrieval=true` | 允许获取公钥 | RSA认证需要 |

#### Redis 连接 SSL 配置

Redis 缓存服务支持 SSL 加密连接:

```yaml
# application-prod.yml - Redis SSL配置
spring:
  data:
    redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT:6379}
      database: ${REDIS_DATABASE:0}
      password: ${REDIS_PASSWORD}
      timeout: 10s
      # SSL加密开关 - 通过环境变量控制
      ssl.enabled: ${REDIS_SSL_ENABLED:false}
```

**启用 Redis SSL 的条件:**

1. Redis 服务器已配置 TLS 证书
2. 设置环境变量 `REDIS_SSL_ENABLED=true`
3. 确保证书链完整且有效

#### 邮件服务 SSL/STARTTLS 配置

邮件发送服务支持 SSL 和 STARTTLS 两种安全传输方式:

```yaml
# application-prod.yml - 邮件SSL配置
mail:
  enabled: ${MAIL_ENABLED:false}
  host: ${MAIL_HOST}
  port: ${MAIL_PORT:465}
  auth: true
  from: ${MAIL_FROM}
  user: ${MAIL_USERNAME}
  pass: ${MAIL_PASSWORD}

  # STARTTLS - 对纯文本协议的扩展升级
  starttlsEnable: true

  # SSL安全连接 - 直接使用加密端口
  sslEnable: true

  # 超时配置
  timeout: 0
  connectionTimeout: 0
```

**SSL vs STARTTLS 对比:**

| 特性 | SSL | STARTTLS |
|------|-----|----------|
| 端口 | 465 (SMTPS) | 587 (提交端口) |
| 加密时机 | 连接建立即加密 | 明文连接后升级 |
| 协议 | 独立加密端口 | 协议扩展命令 |
| 推荐度 | 高 | 中(需确保强制升级) |

---

## 混合加密传输

### 加密架构设计

项目采用 AES + RSA 混合加密方案,结合对称加密的高效性和非对称加密的安全性:

```
┌─────────────────────────────────────────────────────────────────┐
│                       混合加密传输流程                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [客户端]                              [服务端]                 │
│     │                                      │                    │
│     │  1. 生成32位随机AES密钥              │                    │
│     │     aesKey = randomString(32)        │                    │
│     │                                      │                    │
│     │  2. Base64编码AES密钥                │                    │
│     │     base64Key = base64(aesKey)       │                    │
│     │                                      │                    │
│     │  3. RSA公钥加密Base64密钥            │                    │
│     │     encKey = rsaEncrypt(base64Key)   │                    │
│     │                                      │                    │
│     │  4. AES加密请求体                    │                    │
│     │     encData = aesEncrypt(data)       │                    │
│     │                                      │                    │
│     │  5. 发送加密请求                     │                    │
│     │ ─────────────────────────────────────>│                   │
│     │   Header: encrypt-key: {encKey}      │                    │
│     │   Body: {encData}                    │                    │
│     │                                      │                    │
│     │                    6. RSA私钥解密获取AES密钥              │
│     │                       aesKey = rsaDecrypt(encKey)         │
│     │                                      │                    │
│     │                    7. AES解密请求体  │                    │
│     │                       data = aesDecrypt(encData)          │
│     │                                      │                    │
│     │  <─────────────────────────────────── │                   │
│     │        (响应同样流程加密)             │                    │
│     │                                      │                    │
└─────────────────────────────────────────────────────────────────┘
```

### 后端加密实现

#### @ApiEncrypt 注解

通过注解控制接口的加密行为:

```java
package plus.ruoyi.common.encrypt.annotation;

/**
 * API接口加密注解
 *
 * 标注在Controller方法上，控制该接口的加密行为
 *
 * 使用示例：
 * <pre>
 * @PostMapping("/login")
 * @ApiEncrypt(response = true)  // 对响应进行加密
 * public Result<User> login(@RequestBody LoginRequest request) {
 *     // 请求自动解密，响应自动加密
 *     return Result.success(userService.login(request));
 * }
 * </pre>
 */
@Documented
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiEncrypt {
    /**
     * 是否对响应进行加密
     *
     * true: 对响应结果进行AES+RSA混合加密
     * false: 不加密响应（默认）
     *
     * 加密流程：
     * 1. 生成32位随机AES密钥
     * 2. 使用AES密钥加密响应数据
     * 3. 使用RSA公钥加密AES密钥
     * 4. 将加密后的AES密钥放入响应头
     */
    boolean response() default false;
}
```

**注解使用场景:**

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // 登录接口 - 请求自动解密,响应加密
    @PostMapping("/login")
    @ApiEncrypt(response = true)
    public R<LoginVo> login(@RequestBody LoginBody loginBody) {
        return R.ok(authService.login(loginBody));
    }

    // 敏感数据接口 - 请求解密,响应加密
    @PostMapping("/sensitive")
    @ApiEncrypt(response = true)
    public R<SensitiveData> getSensitiveData(@RequestBody QueryBody query) {
        return R.ok(dataService.querySensitive(query));
    }
}
```

#### CryptoFilter 加密过滤器

核心加密过滤器实现请求解密和响应加密:

```java
package plus.ruoyi.common.encrypt.filter;

/**
 * Crypto 过滤器
 *
 * 功能：
 * - 拦截POST/PUT请求，检查加密标头
 * - 存在加密标头时解密请求体
 * - 根据@ApiEncrypt注解决定是否加密响应
 */
public class CryptoFilter implements Filter {
    private final ApiDecryptProperties properties;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest servletRequest = (HttpServletRequest) request;
        HttpServletResponse servletResponse = (HttpServletResponse) response;

        // 获取加密注解
        ApiEncrypt apiEncrypt = this.getApiEncryptAnnotation(servletRequest);
        boolean responseFlag = apiEncrypt != null && apiEncrypt.response();

        ServletRequest requestWrapper = null;
        EncryptResponseBodyWrapper responseBodyWrapper = null;

        // 处理 PUT/POST 请求的加密
        if (HttpMethod.PUT.matches(servletRequest.getMethod()) ||
            HttpMethod.POST.matches(servletRequest.getMethod())) {

            // 检查加密标头
            String headerValue = servletRequest.getHeader(properties.getHeaderFlag());

            if (StringUtils.isNotBlank(headerValue)) {
                // 存在加密标头 - 解密请求
                requestWrapper = new DecryptRequestBodyWrapper(
                    servletRequest,
                    properties.getPrivateKey(),
                    properties.getHeaderFlag()
                );
            } else {
                // 无加密标头但有注解 - 拒绝访问
                if (ObjectUtil.isNotNull(apiEncrypt)) {
                    throw ServiceException.of(
                        "没有访问权限，请联系管理员授权",
                        HttpStatus.FORBIDDEN
                    );
                }
            }
        }

        // 响应加密包装
        if (responseFlag) {
            responseBodyWrapper = new EncryptResponseBodyWrapper(servletResponse);
        }

        // 执行请求
        chain.doFilter(
            ObjectUtil.defaultIfNull(requestWrapper, request),
            ObjectUtil.defaultIfNull(responseBodyWrapper, response)
        );

        // 加密响应
        if (responseFlag && responseBodyWrapper != null) {
            servletResponse.reset();
            String encryptContent = responseBodyWrapper.getEncryptContent(
                servletResponse,
                properties.getPublicKey(),
                properties.getHeaderFlag()
            );
            servletResponse.getWriter().write(encryptContent);
        }
    }
}
```

#### DecryptRequestBodyWrapper 请求解密

请求体解密包装器实现:

```java
package plus.ruoyi.common.encrypt.filter;

/**
 * 解密请求体包装器
 *
 * 解密流程：
 * 1. 从请求头获取RSA加密的AES密钥
 * 2. 用RSA私钥解密获得AES密钥
 * 3. 对AES密钥进行Base64解码
 * 4. 用AES密钥解密请求体内容
 */
public class DecryptRequestBodyWrapper extends HttpServletRequestWrapper {

    /** 解密后的请求体内容 */
    private final byte[] body;

    public DecryptRequestBodyWrapper(HttpServletRequest request,
                                     String privateKey,
                                     String headerFlag) throws IOException {
        super(request);

        // 1. 从请求头获取RSA加密的AES密钥
        String headerRsa = request.getHeader(headerFlag);

        // 2. 用RSA私钥解密获得Base64编码的AES密钥
        String decryptAes = EncryptUtils.decryptByRsa(headerRsa, privateKey);

        // 3. 对AES密钥进行Base64解码
        String aesPassword = EncryptUtils.decryptByBase64(decryptAes);

        // 4. 读取原始请求体
        request.setCharacterEncoding(Constants.UTF8);
        byte[] readBytes = IoUtil.readBytes(request.getInputStream(), false);
        String requestBody = new String(readBytes, StandardCharsets.UTF_8);

        // 5. 用AES密钥解密请求体
        String decryptBody = EncryptUtils.decryptByAes(requestBody, aesPassword);
        body = decryptBody.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public ServletInputStream getInputStream() {
        final ByteArrayInputStream bais = new ByteArrayInputStream(body);
        return new ServletInputStream() {
            @Override
            public int read() { return bais.read(); }
            @Override
            public int available() { return body.length; }
            @Override
            public boolean isFinished() { return false; }
            @Override
            public boolean isReady() { return false; }
            @Override
            public void setReadListener(ReadListener readListener) {}
        };
    }
}
```

#### EncryptResponseBodyWrapper 响应加密

响应体加密包装器实现:

```java
package plus.ruoyi.common.encrypt.filter;

/**
 * 加密响应体包装器
 *
 * 加密流程：
 * 1. 生成32位随机AES密钥
 * 2. 对AES密钥进行Base64编码
 * 3. 用RSA公钥加密Base64编码后的AES密钥
 * 4. 将加密后的AES密钥放入响应头
 * 5. 用AES密钥加密响应体内容
 */
public class EncryptResponseBodyWrapper extends HttpServletResponseWrapper {

    private final ByteArrayOutputStream byteArrayOutputStream;

    public String getEncryptContent(HttpServletResponse servletResponse,
                                    String publicKey,
                                    String headerFlag) throws IOException {

        // 1. 生成32位随机AES密钥
        String aesPassword = RandomUtil.randomString(32);

        // 2. 对AES密钥进行Base64编码
        String encryptAes = EncryptUtils.encryptByBase64(aesPassword);

        // 3. 用RSA公钥加密Base64编码后的AES密钥
        String encryptPassword = EncryptUtils.encryptByRsa(encryptAes, publicKey);

        // 4. 设置响应头
        servletResponse.addHeader("Access-Control-Expose-Headers", headerFlag);
        servletResponse.setHeader("Access-Control-Allow-Origin", "*");
        servletResponse.setHeader("Access-Control-Allow-Methods", "*");
        servletResponse.setHeader(headerFlag, encryptPassword);
        servletResponse.setCharacterEncoding(StandardCharsets.UTF_8.toString());

        // 5. 获取原始响应内容并加密
        String originalBody = this.getContent();
        return EncryptUtils.encryptByAes(originalBody, aesPassword);
    }
}
```

### 后端加密工具类

EncryptUtils 提供完整的加密解密能力:

```java
package plus.ruoyi.common.encrypt.utils;

/**
 * 安全相关工具类
 *
 * 支持的加密算法：
 * - Base64 编解码
 * - AES 对称加密 (16/24/32位密钥)
 * - SM4 国密对称加密 (16位密钥)
 * - RSA 非对称加密
 * - SM2 国密非对称加密
 * - MD5/SHA256/SM3 哈希算法
 */
public class EncryptUtils {

    public static final String PUBLIC_KEY = "publicKey";
    public static final String PRIVATE_KEY = "privateKey";

    // ==================== Base64 ====================

    /** Base64加密 */
    public static String encryptByBase64(String data) {
        return Base64.encode(data, StandardCharsets.UTF_8);
    }

    /** Base64解密 */
    public static String decryptByBase64(String data) {
        return Base64.decodeStr(data, StandardCharsets.UTF_8);
    }

    // ==================== AES 对称加密 ====================

    /**
     * AES加密
     * @param data 待加密数据
     * @param password 秘钥字符串 (16/24/32位)
     * @return 加密后字符串, 采用Base64编码
     */
    public static String encryptByAes(String data, String password) {
        if (StrUtil.isBlank(password)) {
            throw new IllegalArgumentException("AES需要传入秘钥信息");
        }
        int[] array = {16, 24, 32};
        if (!ArrayUtil.contains(array, password.length())) {
            throw new IllegalArgumentException("AES秘钥长度要求为16位、24位、32位");
        }
        return SecureUtil.aes(password.getBytes(StandardCharsets.UTF_8))
            .encryptBase64(data, StandardCharsets.UTF_8);
    }

    /** AES解密 */
    public static String decryptByAes(String data, String password) {
        if (StrUtil.isBlank(password)) {
            throw new IllegalArgumentException("AES需要传入秘钥信息");
        }
        int[] array = {16, 24, 32};
        if (!ArrayUtil.contains(array, password.length())) {
            throw new IllegalArgumentException("AES秘钥长度要求为16位、24位、32位");
        }
        return SecureUtil.aes(password.getBytes(StandardCharsets.UTF_8))
            .decryptStr(data, StandardCharsets.UTF_8);
    }

    // ==================== RSA 非对称加密 ====================

    /** 产生RSA密钥对 */
    public static Map<String, String> generateRsaKey() {
        Map<String, String> keyMap = new HashMap<>(2);
        RSA rsa = SecureUtil.rsa();
        keyMap.put(PRIVATE_KEY, rsa.getPrivateKeyBase64());
        keyMap.put(PUBLIC_KEY, rsa.getPublicKeyBase64());
        return keyMap;
    }

    /** RSA公钥加密 */
    public static String encryptByRsa(String data, String publicKey) {
        if (StrUtil.isBlank(publicKey)) {
            throw new IllegalArgumentException("RSA需要传入公钥进行加密");
        }
        RSA rsa = SecureUtil.rsa(null, publicKey);
        return rsa.encryptBase64(data, StandardCharsets.UTF_8, KeyType.PublicKey);
    }

    /** RSA私钥解密 */
    public static String decryptByRsa(String data, String privateKey) {
        if (StrUtil.isBlank(privateKey)) {
            throw new IllegalArgumentException("RSA需要传入私钥进行解密");
        }
        RSA rsa = SecureUtil.rsa(privateKey, null);
        return rsa.decryptStr(data, KeyType.PrivateKey, StandardCharsets.UTF_8);
    }

    // ==================== 国密算法 ====================

    /** SM4加密 (国密对称加密) */
    public static String encryptBySm4(String data, String password) {
        if (StrUtil.isBlank(password)) {
            throw new IllegalArgumentException("SM4需要传入秘钥信息");
        }
        if (16 != password.length()) {
            throw new IllegalArgumentException("SM4秘钥长度要求为16位");
        }
        return SmUtil.sm4(password.getBytes(StandardCharsets.UTF_8))
            .encryptBase64(data, StandardCharsets.UTF_8);
    }

    /** SM2公钥加密 (国密非对称加密) */
    public static String encryptBySm2(String data, String publicKey) {
        if (StrUtil.isBlank(publicKey)) {
            throw new IllegalArgumentException("SM2需要传入公钥进行加密");
        }
        SM2 sm2 = SmUtil.sm2(null, publicKey);
        return sm2.encryptBase64(data, StandardCharsets.UTF_8, KeyType.PublicKey);
    }

    // ==================== 哈希算法 ====================

    /** MD5哈希 */
    public static String encryptByMd5(String data) {
        return SecureUtil.md5(data);
    }

    /** SHA256哈希 */
    public static String encryptBySha256(String data) {
        return SecureUtil.sha256(data);
    }

    /** SM3哈希 (国密哈希) */
    public static String encryptBySm3(String data) {
        return SmUtil.sm3(data);
    }
}
```

### 前端加密实现

#### 加密工具模块

前端使用 CryptoJS 实现 AES 加密:

```typescript
// src/utils/crypto.ts

import CryptoJS from 'crypto-js'

/**
 * 随机生成32位的字符串
 */
export const generateRandomString = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

/**
 * 随机生成AES密钥
 */
export const generateAesKey = (): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf8.parse(generateRandomString())
}

/**
 * Base64编码
 */
export const encodeBase64 = (data: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Base64.stringify(data)
}

/**
 * Base64解码
 */
export const decodeBase64 = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Base64.parse(str)
}

/**
 * 使用AES密钥加密数据
 * @param message 要加密的消息
 * @param aesKey AES密钥
 */
export const encryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray): string => {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

/**
 * 使用AES密钥解密数据
 * @param message 加密的消息
 * @param aesKey AES密钥
 */
export const decryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray): string => {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * 一步完成加密 - 生成密钥、加密数据
 */
export const encryptWithAutoKey = (data: string | object): {
  encryptedData: string
  key: CryptoJS.lib.WordArray
} => {
  const key = generateAesKey()
  const message = typeof data === 'object' ? JSON.stringify(data) : data
  const encryptedData = encryptWithAes(message, key)
  return { encryptedData, key }
}

/**
 * 计算SHA-256哈希值
 */
export const computeSha256Hash = (data: string): string => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex)
}

/**
 * 计算MD5哈希值
 */
export const computeMd5Hash = (data: string): string => {
  return CryptoJS.MD5(data).toString(CryptoJS.enc.Hex)
}
```

#### HTTP 请求加密拦截

useHttp 封装了自动加密的请求拦截器:

```typescript
// src/composables/useHttp.ts

import { encodeBase64, decodeBase64, encryptWithAes, generateAesKey, decryptWithAes } from '@/utils/crypto'
import { rsaEncrypt, rsaDecrypt } from '@/utils/rsa'
import { SystemConfig } from '@/systemConfig'

/** 加密请求头名称 */
const encryptHeader = 'encrypt-key'

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ... 其他拦截逻辑

    // 参数加密处理
    if (SystemConfig.security.apiEncrypt) {
      // 当开启参数加密且请求标记需要加密
      if (config.headers?.isEncrypt === 'true' &&
          (config.method === 'post' || config.method === 'put')) {

        // 1. 生成随机AES密钥
        const aesKey = generateAesKey()

        // 2. RSA加密Base64编码的AES密钥,放入请求头
        config.headers[encryptHeader] = rsaEncrypt(encodeBase64(aesKey))

        // 3. AES加密请求体
        config.data = typeof config.data === 'object'
          ? encryptWithAes(JSON.stringify(config.data), aesKey)
          : encryptWithAes(config.data, aesKey)
      }
    }

    return config
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (res: AxiosResponse) => {
    // 加密数据解密
    if (SystemConfig.security.apiEncrypt) {
      // 获取加密的AES密钥
      const keyStr = res.headers[encryptHeader]

      if (keyStr != null && keyStr != '') {
        try {
          const data = res.data

          // 1. RSA解密获取Base64编码的AES密钥
          const base64Str = rsaDecrypt(keyStr)

          // 2. Base64解码获取AES密钥
          const aesKey = decodeBase64(base64Str.toString())

          // 3. AES解密响应数据
          const decryptData = decryptWithAes(data as any, aesKey)

          // 4. 解析JSON
          res.data = JSON.parse(decryptData)
        } catch (err) {
          console.error(`[响应解密]解密失败:${err}`)
          return Promise.reject(new Error(`响应数据解密失败:${err}`))
        }
      }
    }

    // ... 其他响应处理
  }
)
```

#### 链式调用加密请求

useHttp 支持链式调用启用加密:

```typescript
// 链式调用API
const httpInstance = {
  // 启用加密
  encrypt: () => {
    chainConfig.headers = { ...chainConfig.headers, isEncrypt: true }
    return httpInstance
  },

  // 其他链式方法...
}

// 使用示例
const [err, data] = await http.encrypt().post('/api/auth/login', loginData)
```

---

## 防重复提交

### 后端实现

基于 Redis 分布式锁的防重复提交机制:

#### @RepeatSubmit 注解

```java
package plus.ruoyi.common.idempotent.annotation;

/**
 * 防重复提交注解
 *
 * 用于防止用户在短时间内重复提交表单或请求
 * 基于 Redis 实现分布式锁机制
 */
@Inherited
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RepeatSubmit {

    /**
     * 重复提交检测间隔时间
     * 在此时间内的重复请求将被拦截，默认5秒
     */
    int interval() default 5000;

    /**
     * 时间单位，默认毫秒
     */
    TimeUnit timeUnit() default TimeUnit.MILLISECONDS;

    /**
     * 重复提交时的提示消息
     * 支持国际化配置
     */
    String message() default I18nKeys.Request.DUPLICATE_SUBMIT;
}
```

#### RepeatSubmitAspect 切面处理器

```java
package plus.ruoyi.common.idempotent.aspectj;

/**
 * 防重复提交切面处理器
 *
 * 工作原理：
 * - 请求前：生成唯一标识存入 Redis，设置过期时间
 * - 请求成功：保留 Redis 数据，防止重复提交
 * - 请求失败：删除 Redis 数据，允许重新提交
 */
@Aspect
public class RepeatSubmitAspect {

    /** 线程本地变量，存储当前请求的缓存key */
    private static final ThreadLocal<String> KEY_CACHE = new ThreadLocal<>();

    @Before("@annotation(repeatSubmit)")
    public void doBefore(JoinPoint point, RepeatSubmit repeatSubmit) throws Throwable {
        // 计算间隔时间（毫秒）
        long interval = repeatSubmit.timeUnit().toMillis(repeatSubmit.interval());

        if (interval < 1000) {
            throw ServiceException.of("重复提交间隔时间不能小于'1'秒");
        }

        HttpServletRequest request = ServletUtils.getRequest();
        String nowParams = argsArrayToString(point.getArgs());
        String url = request.getRequestURI();

        // 获取用户Token作为唯一标识
        String submitKey = StringUtils.trimToEmpty(
            request.getHeader(SaManager.getConfig().getTokenName())
        );

        // 生成MD5唯一标识: token + 参数
        submitKey = SecureUtil.md5(submitKey + ":" + nowParams);

        // 构建完整缓存key
        String cacheRepeatKey = GlobalConstants.REPEAT_SUBMIT_KEY + url + submitKey;

        // 尝试设置Redis锁
        if (RedisUtils.setObjectIfAbsent(cacheRepeatKey, "", Duration.ofMillis(interval))) {
            KEY_CACHE.set(cacheRepeatKey);
        } else {
            // 锁已存在，拒绝重复提交
            throw ServiceException.of(repeatSubmit.message());
        }
    }

    @AfterReturning(pointcut = "@annotation(repeatSubmit)", returning = "jsonResult")
    public void doAfterReturning(JoinPoint joinPoint, RepeatSubmit repeatSubmit, Object jsonResult) {
        if (jsonResult instanceof R<?> r) {
            try {
                // 成功则保留锁，防止有效期内重复提交
                if (r.getCode() == R.SUCCESS) {
                    return;
                }
                // 失败则删除锁，允许重新提交
                RedisUtils.deleteObject(KEY_CACHE.get());
            } finally {
                KEY_CACHE.remove();
            }
        }
    }

    @AfterThrowing(value = "@annotation(repeatSubmit)", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, RepeatSubmit repeatSubmit, Exception e) {
        // 异常时删除锁，允许重新提交
        RedisUtils.deleteObject(KEY_CACHE.get());
        KEY_CACHE.remove();
    }
}
```

**唯一标识生成规则:**

```
cacheKey = REPEAT_SUBMIT_KEY + URL + MD5(token + ":" + 请求参数JSON)
```

### 前端实现

基于 Session Storage 的客户端防重复提交:

```typescript
// src/composables/useHttp.ts

// 请求拦截器中的防重复提交
if (config.headers?.repeatSubmit !== false &&
    (config.method === 'post' || config.method === 'put')) {

  const requestObj = {
    url: config.url,
    data: typeof config.data === 'object'
      ? JSON.stringify(config.data)
      : config.data,
    time: new Date().getTime()
  }

  const repeatSubmitCache = sessionCache.getJSON('repeatSubmitCache')

  if (!repeatSubmitCache) {
    // 首次请求，存储信息
    sessionCache.setJSON('repeatSubmitCache', requestObj)
  } else {
    const s_url = repeatSubmitCache.url
    const s_data = repeatSubmitCache.data
    const s_time = repeatSubmitCache.time
    const interval = 5000 // 5秒间隔

    // 检测重复提交: 相同URL + 相同数据 + 时间间隔内
    if (s_data === requestObj.data &&
        requestObj.time - s_time < interval &&
        s_url === requestObj.url) {
      console.warn(`[${s_url}]: 数据正在处理，请勿重复提交`)
      return Promise.reject(new Error('数据正在处理，请勿重复提交'))
    } else {
      sessionCache.setJSON('repeatSubmitCache', requestObj)
    }
  }
}
```

**禁用防重复提交:**

```typescript
// 对于需要快速重复请求的场景
const [err, data] = await http.noRepeatSubmit().post('/api/check', checkData)
```

---

## 请求签名与验证

### 请求追踪标识

每个请求自动添加唯一追踪ID:

```typescript
// src/composables/useHttp.ts

// 请求拦截器
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // 添加请求ID用于日志链路追踪
  // 格式：yyyyMMddHHmmssSSS (年月日时分秒毫秒)
  config.headers['X-Request-Id'] = formatDate(new Date(), 'yyyyMMddHHmmssSSS')

  // ... 其他处理
  return config
})
```

**请求头示例:**

```http
POST /api/auth/login HTTP/1.1
Host: api.example.com
Content-Type: application/json;charset=utf-8
Content-Language: zh_CN
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
X-Request-Id: 20251123143052789
X-Tenant-Id: 000000
encrypt-key: RSA加密的AES密钥...
```

### 参数过滤规则

防重复提交时,需要过滤不参与唯一标识计算的参数类型:

```java
/**
 * 判断对象是否需要过滤
 *
 * 过滤类型：
 * - 文件上传对象 (MultipartFile)
 * - HTTP请求/响应对象
 * - 数据绑定结果对象
 */
public boolean isFilterObject(final Object o) {
    Class<?> clazz = o.getClass();

    if (clazz.isArray()) {
        return MultipartFile.class.isAssignableFrom(clazz.getComponentType());
    } else if (Collection.class.isAssignableFrom(clazz)) {
        for (Object value : (Collection) o) {
            return value instanceof MultipartFile;
        }
    } else if (Map.class.isAssignableFrom(clazz)) {
        for (Object value : ((Map) o).values()) {
            return value instanceof MultipartFile;
        }
    }

    return o instanceof MultipartFile ||
           o instanceof HttpServletRequest ||
           o instanceof HttpServletResponse ||
           o instanceof BindingResult;
}
```

---

## 安全配置管理

### 系统配置类

集中管理加密相关配置:

```typescript
// src/systemConfig.ts

export const SystemConfig: SystemConfigType = {
  /**
   * 安全配置
   */
  security: {
    /** 接口加密功能开关 */
    apiEncrypt: import.meta.env.VITE_APP_API_ENCRYPT === 'true',
    /** RSA公钥 - 用于加密传输 */
    rsaPublicKey: import.meta.env.VITE_APP_RSA_PUBLIC_KEY || '',
    /** RSA私钥 - 用于解密响应 */
    rsaPrivateKey: import.meta.env.VITE_APP_RSA_PRIVATE_KEY || ''
  },

  // ... 其他配置
}

/**
 * 安全配置接口
 */
export interface SecurityConfig {
  /** 接口加密功能开关 */
  apiEncrypt: boolean
  /** RSA公钥 */
  rsaPublicKey: string
  /** RSA私钥 */
  rsaPrivateKey: string
}
```

### 环境变量配置

生产环境配置示例:

```bash
# .env.production

# 启用API加密
VITE_APP_API_ENCRYPT=true

# RSA公钥 (Base64编码)
VITE_APP_RSA_PUBLIC_KEY=MIGfMA0GCSqGSIb3DQEBAQUAA4...

# RSA私钥 (Base64编码,仅调试用,生产环境不应包含)
VITE_APP_RSA_PRIVATE_KEY=
```

---

## 安全通信最佳实践

### 1. 传输层安全

```yaml
# 生产环境强制HTTPS
server:
  ssl:
    enabled: true
    key-store: classpath:ssl/keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12

# 启用HSTS
security:
  headers:
    hsts:
      enabled: true
      max-age: 31536000
      include-subdomains: true
```

### 2. 敏感数据加密

```java
// 敏感接口必须启用加密
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @PostMapping("/create")
    @ApiEncrypt(response = true)  // 启用双向加密
    @RepeatSubmit(interval = 10000)  // 10秒防重复
    public R<PaymentResult> createPayment(@RequestBody PaymentRequest request) {
        return R.ok(paymentService.create(request));
    }
}
```

### 3. 密钥管理

```java
// 密钥轮换策略
public class KeyRotationService {

    /** 密钥有效期 (天) */
    private static final int KEY_VALIDITY_DAYS = 90;

    /** 检查密钥是否需要轮换 */
    public boolean needsRotation(KeyInfo keyInfo) {
        return ChronoUnit.DAYS.between(
            keyInfo.getCreatedAt(),
            LocalDateTime.now()
        ) > KEY_VALIDITY_DAYS;
    }

    /** 执行密钥轮换 */
    @Transactional
    public KeyPair rotateKeys() {
        // 1. 生成新密钥对
        Map<String, String> newKeys = EncryptUtils.generateRsaKey();

        // 2. 保留旧密钥用于解密过渡期数据
        archiveOldKeys();

        // 3. 更新系统配置
        updateSystemConfig(newKeys);

        // 4. 通知客户端更新
        notifyClients();

        return new KeyPair(
            newKeys.get(PUBLIC_KEY),
            newKeys.get(PRIVATE_KEY)
        );
    }
}
```

### 4. 错误处理安全

```typescript
// 加密失败时的安全处理
try {
  const decryptedData = decryptWithAes(data, aesKey)
  return JSON.parse(decryptedData)
} catch (err) {
  // 不暴露详细错误信息
  console.error('[响应解密]解密失败:', err)

  // 返回通用错误,不泄露实现细节
  return Promise.reject(new Error('数据处理失败,请稍后重试'))
}
```

---

## 安全检查清单

### 传输层安全检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| HTTPS 强制启用 | 必须 | 生产环境必须使用HTTPS |
| TLS 版本 | 必须 | 最低 TLS 1.2,推荐 TLS 1.3 |
| 证书有效性 | 必须 | 使用受信任CA签发的证书 |
| HSTS 启用 | 推荐 | 强制浏览器使用HTTPS |
| 证书固定 | 可选 | 移动端防止中间人攻击 |

### 应用层加密检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 敏感接口加密 | 必须 | 登录、支付等接口启用加密 |
| 密钥长度 | 必须 | RSA ≥ 2048位, AES ≥ 256位 |
| 密钥存储 | 必须 | 私钥不硬编码,使用环境变量 |
| 密钥轮换 | 推荐 | 定期更换加密密钥 |
| 随机数生成 | 必须 | 使用安全随机数生成器 |

### 防护机制检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 防重复提交 | 必须 | 关键操作启用防重复 |
| 请求追踪 | 推荐 | 添加请求ID便于问题排查 |
| 超时控制 | 必须 | 设置合理的请求超时时间 |
| 错误处理 | 必须 | 不暴露内部错误细节 |
| 日志脱敏 | 必须 | 敏感数据不记录日志 |

---

## 常见问题

### 1. 加密请求被拒绝403错误

**问题现象:** POST/PUT 请求返回 403 Forbidden

**可能原因:**
- 接口标记了 `@ApiEncrypt` 但请求未携带加密标头
- RSA 公钥配置错误导致加密失败

**解决方案:**
```typescript
// 确保启用加密
const [err, data] = await http.encrypt().post('/api/sensitive', data)

// 检查配置
console.log('加密开关:', SystemConfig.security.apiEncrypt)
console.log('公钥配置:', SystemConfig.security.rsaPublicKey ? '已配置' : '未配置')
```

### 2. 响应解密失败

**问题现象:** 控制台报错 "响应数据解密失败"

**可能原因:**
- RSA 私钥配置错误
- 响应数据格式异常
- 密钥不匹配

**解决方案:**
```typescript
// 检查私钥配置
if (!SystemConfig.security.rsaPrivateKey) {
  console.error('RSA私钥未配置')
}

// 临时禁用加密调试
// .env.development
VITE_APP_API_ENCRYPT=false
```

### 3. 防重复提交误拦截

**问题现象:** 正常请求被误判为重复提交

**可能原因:**
- 间隔时间设置过长
- 请求参数序列化不一致

**解决方案:**
```typescript
// 方案1: 禁用防重复提交
const [err, data] = await http.noRepeatSubmit().post('/api/check', data)

// 方案2: 后端调整间隔时间
@RepeatSubmit(interval = 1000)  // 缩短为1秒
```

### 4. 跨域加密头丢失

**问题现象:** 前端无法读取 `encrypt-key` 响应头

**可能原因:** CORS 配置未暴露自定义头

**解决方案:**
```java
// 后端已配置,确保生效
servletResponse.addHeader("Access-Control-Expose-Headers", headerFlag);
servletResponse.setHeader("Access-Control-Allow-Origin", "*");
servletResponse.setHeader("Access-Control-Allow-Methods", "*");
```

### 5. 数据库SSL连接失败

**问题现象:** 数据库连接报SSL握手错误

**可能原因:**
- MySQL 服务器未启用SSL
- 证书不受信任

**解决方案:**
```yaml
# 开发环境可临时禁用SSL验证
url: jdbc:mysql://host:3306/db?useSSL=false

# 生产环境使用完整SSL配置
url: jdbc:mysql://host:3306/db?useSSL=true&verifyServerCertificate=true&requireSSL=true
```

---

## 总结

传输安全是保护系统数据安全的重要防线。通过本文档介绍的安全机制:

1. **HTTPS/TLS** - 提供基础传输层加密
2. **AES+RSA混合加密** - 实现应用层数据保护
3. **防重复提交** - 防止恶意重放攻击
4. **请求追踪** - 支持安全审计和问题排查

建议在实际项目中:
- 生产环境必须启用HTTPS
- 敏感接口启用双向加密
- 关键操作启用防重复提交
- 定期进行安全审计和密钥轮换
