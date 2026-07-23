# OpenAPI 开放平台

## 介绍

OpenAPI开放平台提供企业级API开放解决方案，通过 AppKey + AppSecret 签名认证机制，为第三方系统提供安全、可控的API访问能力。该模块基于Spring MVC拦截器实现，与Sa-Token深度集成，提供完整的认证、授权、限流、统计功能。

**核心特性:**

- **双重认证体系** - AppKey/AppSecret 签名认证与 Sa-Token JWT 认证并行
- **完善的安全机制** - 签名验证、时间戳防重放、签名防重复、IP白名单
- **灵活的权限管理** - 基于 `@SaCheckPermission` 的细粒度权限控制
- **密钥全生命周期管理** - 生成、配置、重置、启用/禁用、删除、调用统计
- **自动接口扫描** - 通过 `@OpenApi` 注解自动识别开放接口
- **多级访问控制** - 支持全员/角色/管理员/超级管理员四种访问模式
- **异步统计记录** - 调用次数统计不影响接口响应性能

## 模块架构

### 依赖关系

```text
ruoyi-common-openapi
├── ruoyi-common-core          # 核心工具类
├── ruoyi-common-redis         # Redis缓存支持
├── ruoyi-common-json          # JSON序列化
├── ruoyi-common-satoken       # Sa-Token认证
├── ruoyi-common-web           # Web支持
└── ruoyi-common-tenant        # 多租户支持(可选)
```

### 核心组件

| 组件 | 说明 |
|------|------|
| `OpenApiAutoConfiguration` | 自动配置类，注册拦截器和扫描服务 |
| `OpenApiInterceptor` | 核心认证拦截器，实现10步验证流程 |
| `OpenApiSignUtils` | 签名工具类，提供签名生成和验证 |
| `OpenApiScanService` | 接口扫描服务，自动发现@OpenApi标注的接口 |
| `OpenApiProperties` | 配置属性类，定义开放平台参数 |
| `@OpenApi` | 开放接口注解，标识可对外开放的接口 |

### 认证流程

```text
客户端请求
    │
    ▼
┌─────────────────────────────────────────┐
│           OpenApiInterceptor            │
├─────────────────────────────────────────┤
│  1. 检查@OpenApi注解                     │
│  2. 提取认证参数(Header/URL)             │
│  3. 时间戳有效性验证(防重放)              │
│  4. 签名唯一性验证(防重复)                │
│  5. 根据AppKey获取API信息                │
│  6. 检查状态和过期时间                    │
│  7. IP白名单校验                         │
│  8. 签名正确性验证                        │
│  9. 获取或创建Token                       │
│ 10. 设置租户上下文+记录统计               │
└─────────────────────────────────────────┘
    │
    ▼
  业务处理
```

## 快速开始

### 1. 启用开放平台

```yaml
openapi:
  enabled: true
  timestamp-expire-seconds: 60    # 时间戳有效期（防重放）
  max-keys: 5                     # 每用户最大密钥数
  secret-encrypt-key: q3XA19UeJExvCqynPOnyYUcr4zwOVCyi  # AES-256密钥（32字节）
  access-control:
    mode: all        # all | roles | admin | super_admin
    allowed-roles: admin,pc_user  # mode=roles时生效
```

**配置说明:**

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| enabled | 开放平台总开关 | false |
| timestamp-expire-seconds | 时间戳有效期（秒） | 60 |
| max-keys | 每用户最大密钥数 | 5 |
| secret-encrypt-key | AppSecret加密密钥（必须32字节） | - |
| access-control.mode | 访问控制模式 | all |

### 2. 访问控制模式

系统提供四种访问控制模式，通过 `AccessMode` 枚举定义:

```java
public enum AccessMode {
    /** 所有用户都可以访问 */
    ALL,
    /** 只有指定角色可以访问 */
    ROLES,
    /** 只有管理员可以访问 */
    ADMIN,
    /** 只有超级管理员可以访问 */
    SUPER_ADMIN
}
```

**模式说明:**

| 模式 | 描述 | 适用场景 |
|------|------|---------|
| ALL | 所有登录用户都可创建和管理API密钥 | 开放平台面向所有用户 |
| ROLES | 只有指定角色的用户可以访问 | 限制特定角色使用开放平台 |
| ADMIN | 只有管理员角色可以访问 | 仅管理员可管理开放接口 |
| SUPER_ADMIN | 只有超级管理员可以访问 | 最严格的访问控制 |

### 3. 生成 API 密钥

1. 导航至 `系统管理` → `开放平台` → `API密钥`
2. 点击 `生成密钥`，填写信息：
   - **应用名称**: 必填
   - **关联用户**: 可选，密钥继承该用户权限
   - **授权权限**: 树形选择器
   - **过期时间**: 可选
   - **IP白名单**: 可选，逗号分隔

**生成结果:**

```json
{
  "appKey": "d4c0ed4bc5b049c8a144109f60c8abb9",
  "appSecret": "fcfe7ade592c4fcb9e6b8ec9e7c3134d"
}
```

> <Warn/> AppSecret 仅在生成时显示一次，请立即保存。丢失需使用"重置密钥"功能。

## 接口标识

### @OpenApi 注解

`@OpenApi` 注解用于标识可对外开放的接口，支持方法级和类级两种使用方式:

```java
/**
 * 开放接口注解
 * 用于标识可对外开放的接口，支持方法级和类级两种使用方式
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OpenApi {
    /**
     * 接口描述
     */
    String value() default "";
}
```

### 方法级注解

```java
@RestController
@RequestMapping("/base/ad")
public class AdController {

    @OpenApi("查询广告列表")
    @SaCheckPermission("base:ad:query")
    @GetMapping("/pageAds")
    public R<PageResult<AdVo>> pageAds(AdBo bo, PageQuery pageQuery) {
        return R.ok(adService.page(bo, pageQuery));
    }

    @OpenApi("添加广告")
    @SaCheckPermission("base:ad:add")
    @PostMapping("/addAd")
    public R<Long> addAd(@Validated @RequestBody AdBo bo) {
        return R.ok(adService.add(bo));
    }
}
```

### 类级注解

类级注解使该类所有接口自动识别为开放接口：

```java
@OpenApi("广告管理")
@RestController
@RequestMapping("/base/ad")
public class AdController {
    // 所有方法自动识别为开放接口

    @SaCheckPermission("base:ad:query")
    @GetMapping("/pageAds")
    public R<PageResult<AdVo>> pageAds(AdBo bo, PageQuery pageQuery) {
        return R.ok(adService.page(bo, pageQuery));
    }
}
```

### 注解优先级

当方法和类同时使用 `@OpenApi` 注解时，方法级注解优先:

```java
@OpenApi("模块描述")  // 类级注解
@RestController
@RequestMapping("/api")
public class ApiController {

    @OpenApi("具体接口描述")  // 方法级注解优先
    @GetMapping("/data")
    public R<Data> getData() {
        // 接口描述为"具体接口描述"
    }

    @GetMapping("/list")
    public R<List<Data>> getList() {
        // 接口描述为"模块描述"(继承类级注解)
    }
}
```

## 认证拦截器

### OpenApiInterceptor 工作流程

认证拦截器是开放平台的核心组件，实现了完整的10步验证流程:

```java
@Override
public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    // 步骤1: 检查@OpenApi注解
    if (!hasOpenApiAnnotation(handler)) {
        return true;  // 非开放接口，直接放行
    }

    // 步骤2-10: 执行认证流程
    // ...
}
```

### 步骤详解

#### 步骤1: 检查@OpenApi注解

```java
private boolean hasOpenApiAnnotation(Object handler) {
    if (!(handler instanceof HandlerMethod handlerMethod)) {
        return false;
    }
    // 优先检查方法级注解
    OpenApi methodAnnotation = handlerMethod.getMethodAnnotation(OpenApi.class);
    if (methodAnnotation != null) {
        return true;
    }
    // 再检查类级注解
    OpenApi classAnnotation = handlerMethod.getBeanType().getAnnotation(OpenApi.class);
    return classAnnotation != null;
}
```

#### 步骤2: 提取认证参数

支持两种方式传递认证参数:

**方式一: 请求头（推荐）**

```java
private static final String HEADER_APP_KEY = "X-App-Key";
private static final String HEADER_TIMESTAMP = "X-Timestamp";
private static final String HEADER_SIGN = "X-Sign";

// 从请求头获取
String appKey = request.getHeader(HEADER_APP_KEY);
String timestamp = request.getHeader(HEADER_TIMESTAMP);
String sign = request.getHeader(HEADER_SIGN);
```

**方式二: URL参数**

```java
// 从URL参数获取
if (StringUtils.isBlank(appKey)) {
    appKey = request.getParameter("appKey");
}
if (StringUtils.isBlank(timestamp)) {
    timestamp = request.getParameter("timestamp");
}
if (StringUtils.isBlank(sign)) {
    sign = request.getParameter("sign");
}
```

#### 步骤3: 时间戳验证（防重放）

```java
public static boolean verifyTimestamp(Long timestamp, long expireSeconds) {
    if (timestamp == null) {
        return false;
    }
    long diff = Math.abs(System.currentTimeMillis() - timestamp);
    return diff <= expireSeconds * 1000;
}
```

超过有效期（默认60秒）的请求被拒绝，有效防止请求重放攻击。

#### 步骤4: 签名唯一性验证（防重复）

```java
private static final String SIGN_CACHE_PREFIX = GlobalConstants.GLOBAL_REDIS_KEY + "openapi:sign:";

// 检查签名是否已使用
String signCacheKey = SIGN_CACHE_PREFIX + sign;
if (RedisUtils.hasKey(signCacheKey)) {
    throw new ServiceException("请求重复，签名已使用");
}
// 缓存签名，过期时间与时间戳有效期一致
RedisUtils.setCacheObject(signCacheKey, "1", Duration.ofSeconds(timestampExpireSeconds));
```

#### 步骤5: 获取API信息

```java
// 根据AppKey查询API配置信息
OpenApiVo apiInfo = openApiService.getByAppKey(appKey);
if (apiInfo == null) {
    throw new ServiceException("无效的AppKey");
}
```

#### 步骤6: 状态和过期检查

```java
// 检查启用状态
if (!"1".equals(apiInfo.getStatus())) {
    throw new ServiceException("API密钥已禁用");
}

// 检查过期时间
if (apiInfo.getExpireTime() != null && apiInfo.getExpireTime().before(new Date())) {
    throw new ServiceException("API密钥已过期");
}
```

#### 步骤7: IP白名单校验

```java
if (StringUtils.isNotBlank(apiInfo.getWhiteIps())) {
    String clientIp = ServletUtils.getClientIP();
    List<String> whiteIpList = Arrays.asList(apiInfo.getWhiteIps().split(","));
    if (!whiteIpList.contains(clientIp)) {
        throw new ServiceException("IP地址不在白名单中: " + clientIp);
    }
}
```

#### 步骤8: 签名验证

```java
// 从数据库获取解密后的AppSecret
String appSecret = openApiService.getDecryptedSecret(apiInfo.getId());

// 验证签名
if (!OpenApiSignUtils.verifySign(appKey, timestamp, appSecret, sign)) {
    throw new ServiceException("签名验证失败");
}
```

#### 步骤9: Token管理

```java
private static final String TOKEN_CACHE_PREFIX = GlobalConstants.GLOBAL_REDIS_KEY + "openapi:token:";

// 尝试获取缓存的Token
String tokenCacheKey = TOKEN_CACHE_PREFIX + appKey;
String token = RedisUtils.getCacheObject(tokenCacheKey);

if (StringUtils.isBlank(token)) {
    // 创建新Token并缓存
    token = createToken(apiInfo);
    RedisUtils.setCacheObject(tokenCacheKey, token, Duration.ofHours(2));
}

// 设置Token到请求头，供后续Sa-Token使用
request.setAttribute(StpUtil.getTokenName(), token);
```

#### 步骤10: 设置上下文和记录统计

```java
// 设置租户上下文（如果启用多租户）
if (TenantHelper.isEnable() && StringUtils.isNotBlank(apiInfo.getTenantId())) {
    TenantHelper.setDynamic(apiInfo.getTenantId());
}

// 异步记录调用统计
CompletableFuture.runAsync(() -> {
    openApiService.recordCall(appKey);
});
```

## 签名机制

### 签名算法

```java
public class OpenApiSignUtils {

    /**
     * 生成签名
     * 算法: MD5(appKey + timestamp + appSecret)
     */
    public static String generateSign(String appKey, String timestamp, String appSecret) {
        String content = appKey + timestamp + appSecret;
        return DigestUtil.md5Hex(content);
    }

    /**
     * 验证签名
     */
    public static boolean verifySign(String appKey, String timestamp, String appSecret, String sign) {
        String correctSign = generateSign(appKey, timestamp, appSecret);
        return correctSign.equals(sign);
    }

    /**
     * 验证时间戳有效性
     */
    public static boolean verifyTimestamp(Long timestamp, long expireSeconds) {
        if (timestamp == null) {
            return false;
        }
        long diff = Math.abs(System.currentTimeMillis() - timestamp);
        return diff <= expireSeconds * 1000;
    }
}
```

### 签名步骤

1. 获取当前时间戳（毫秒）
2. 拼接字符串：`appKey + timestamp + appSecret`
3. 对拼接字符串进行MD5加密
4. 得到32位小写十六进制签名

### 签名示例

```text
AppKey: d4c0ed4bc5b049c8a144109f60c8abb9
Timestamp: 1609459200000
AppSecret: fcfe7ade592c4fcb9e6b8ec9e7c3134d

拼接内容: d4c0ed4bc5b049c8a144109f60c8abb9 + 1609459200000 + fcfe7ade592c4fcb9e6b8ec9e7c3134d
签名结果: e10adc3949ba59abbe56e057f20f883e
```

## 接口扫描服务

### OpenApiScanService

接口扫描服务用于自动发现所有标注 `@OpenApi` 注解的接口:

```java
@Service
public class OpenApiScanService {

    // 类路径扫描缓存
    private Set<Class<?>> cachedClasses;

    /**
     * 扫描所有开放接口（根据当前用户权限过滤）
     */
    public List<OpenApiInfoVo> scanUserOpenApis() {
        // 获取当前用户权限列表
        List<String> userPermissions = StpUtil.getPermissionList();

        // 扫描所有开放接口
        List<OpenApiInfoVo> allApis = scanAllOpenApis();

        // 根据用户权限过滤
        return allApis.stream()
            .filter(api -> hasPermission(api, userPermissions))
            .collect(Collectors.toList());
    }

    /**
     * 扫描所有开放接口
     */
    public List<OpenApiInfoVo> scanAllOpenApis() {
        if (cachedClasses == null) {
            cachedClasses = scanClassPath();
        }

        List<OpenApiInfoVo> apis = new ArrayList<>();
        for (Class<?> clazz : cachedClasses) {
            apis.addAll(extractApis(clazz));
        }
        return apis;
    }

    /**
     * 扫描类路径
     */
    private Set<Class<?>> scanClassPath() {
        // 扫描 plus.ruoyi 包下所有类
        ClassPathScanningCandidateComponentProvider scanner =
            new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(RestController.class));

        Set<Class<?>> classes = new HashSet<>();
        for (BeanDefinition bd : scanner.findCandidateComponents("plus.ruoyi")) {
            try {
                Class<?> clazz = Class.forName(bd.getBeanClassName());
                if (hasOpenApiAnnotation(clazz)) {
                    classes.add(clazz);
                }
            } catch (ClassNotFoundException e) {
                // 忽略
            }
        }
        return classes;
    }
}
```

### 接口信息结构

```java
@Data
public class OpenApiInfoVo {
    /** 接口路径 */
    private String path;
    /** 请求方法 */
    private String method;
    /** 接口描述 */
    private String description;
    /** 所属模块 */
    private String module;
    /** 权限要求 */
    private String permission;
    /** 权限模式 (AND/OR) */
    private String permissionMode;
    /** 是否无权限限制 */
    private Boolean noAuth;
    /** 参数列表 */
    private List<ParameterInfo> parameters;
    /** 响应信息 */
    private ResponseInfo responseInfo;
}

@Data
public class ParameterInfo {
    /** 参数名 */
    private String name;
    /** 参数类型 */
    private String type;
    /** 是否必填 */
    private Boolean required;
    /** 参数描述 */
    private String description;
    /** 参数位置(query/path/body) */
    private String in;
}

@Data
public class ResponseInfo {
    /** 响应类型 */
    private String type;
    /** 响应描述 */
    private String description;
}
```

### 使用扫描服务

```java
@RestController
@RequestMapping("/openapi")
public class OpenApiController {

    @Autowired
    private OpenApiScanService openApiScanService;

    /**
     * 获取当前用户可用的开放接口列表
     */
    @GetMapping("/available")
    public R<List<OpenApiInfoVo>> getAvailableApis() {
        return R.ok(openApiScanService.scanUserOpenApis());
    }

    /**
     * 获取所有开放接口列表（管理员）
     */
    @SaCheckPermission("system:openapi:list")
    @GetMapping("/all")
    public R<List<OpenApiInfoVo>> getAllApis() {
        return R.ok(openApiScanService.scanAllOpenApis());
    }
}
```

## 客户端调用

### Java 示例

```java
public class OpenApiClient {
    private final String baseUrl;
    private final String appKey;
    private final String appSecret;

    public OpenApiClient(String baseUrl, String appKey, String appSecret) {
        this.baseUrl = baseUrl;
        this.appKey = appKey;
        this.appSecret = appSecret;
    }

    private String generateSign(long timestamp) {
        return DigestUtil.md5Hex(appKey + timestamp + appSecret);
    }

    public String callApi(String path, String method, String body) {
        long timestamp = System.currentTimeMillis();
        String sign = generateSign(timestamp);

        return HttpRequest.of(baseUrl + path)
            .method(Method.valueOf(method))
            .header("Content-Type", "application/json")
            .header("X-App-Key", appKey)
            .header("X-Timestamp", String.valueOf(timestamp))
            .header("X-Sign", sign)
            .body(body)
            .execute()
            .body();
    }

    public <T> T get(String path, Class<T> responseType) {
        String response = callApi(path, "GET", null);
        return JsonUtils.parseObject(response, responseType);
    }

    public <T> T post(String path, Object body, Class<T> responseType) {
        String response = callApi(path, "POST", JsonUtils.toJsonString(body));
        return JsonUtils.parseObject(response, responseType);
    }
}

// 使用示例
OpenApiClient client = new OpenApiClient(
    "http://localhost:5500",
    "d4c0ed4bc5b049c8a144109f60c8abb9",
    "fcfe7ade592c4fcb9e6b8ec9e7c3134d"
);

// GET请求
R<PageResult<AdVo>> result = client.get("/base/ad/pageAds?pageNum=1&pageSize=10",
    new TypeReference<R<PageResult<AdVo>>>(){}.getType());

// POST请求
AdBo adBo = new AdBo();
adBo.setTitle("广告标题");
R<Long> addResult = client.post("/base/ad/addAd", adBo,
    new TypeReference<R<Long>>(){}.getType());
```

### JavaScript 示例

```javascript
import md5 from 'md5'
import axios from 'axios'

class OpenApiClient {
  constructor(baseUrl, appKey, appSecret) {
    this.baseUrl = baseUrl
    this.appKey = appKey
    this.appSecret = appSecret
  }

  generateSign(timestamp) {
    return md5(this.appKey + timestamp + this.appSecret)
  }

  async request(path, method = 'GET', data = null) {
    const timestamp = Date.now()
    const sign = this.generateSign(timestamp)

    const config = {
      url: this.baseUrl + path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': this.appKey,
        'X-Timestamp': timestamp,
        'X-Sign': sign
      }
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data
    }

    const response = await axios(config)
    return response.data
  }

  async get(path) {
    return this.request(path, 'GET')
  }

  async post(path, data) {
    return this.request(path, 'POST', data)
  }

  async put(path, data) {
    return this.request(path, 'PUT', data)
  }

  async delete(path) {
    return this.request(path, 'DELETE')
  }
}

// 使用示例
const client = new OpenApiClient(
  'http://localhost:5500',
  'd4c0ed4bc5b049c8a144109f60c8abb9',
  'fcfe7ade592c4fcb9e6b8ec9e7c3134d'
)

// GET请求
const ads = await client.get('/base/ad/pageAds?pageNum=1&pageSize=10')
console.log(ads)

// POST请求
const newAd = await client.post('/base/ad/addAd', {
  title: '广告标题',
  content: '广告内容'
})
console.log(newAd)
```

### Python 示例

```python
import requests
import hashlib
import time
import json

class OpenApiClient:
    def __init__(self, base_url, app_key, app_secret):
        self.base_url = base_url
        self.app_key = app_key
        self.app_secret = app_secret

    def _generate_sign(self, timestamp):
        content = f"{self.app_key}{timestamp}{self.app_secret}"
        return hashlib.md5(content.encode()).hexdigest()

    def request(self, path, method='GET', data=None, params=None):
        timestamp = str(int(time.time() * 1000))
        sign = self._generate_sign(timestamp)

        headers = {
            'Content-Type': 'application/json',
            'X-App-Key': self.app_key,
            'X-Timestamp': timestamp,
            'X-Sign': sign
        }

        url = f"{self.base_url}{path}"

        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            params=params,
            json=data
        )

        return response.json()

    def get(self, path, params=None):
        return self.request(path, 'GET', params=params)

    def post(self, path, data):
        return self.request(path, 'POST', data=data)

    def put(self, path, data):
        return self.request(path, 'PUT', data=data)

    def delete(self, path):
        return self.request(path, 'DELETE')


# 使用示例
client = OpenApiClient(
    'http://localhost:5500',
    'd4c0ed4bc5b049c8a144109f60c8abb9',
    'fcfe7ade592c4fcb9e6b8ec9e7c3134d'
)

# GET请求
ads = client.get('/base/ad/pageAds', params={'pageNum': 1, 'pageSize': 10})
print(ads)

# POST请求
new_ad = client.post('/base/ad/addAd', {
    'title': '广告标题',
    'content': '广告内容'
})
print(new_ad)
```

### cURL 示例

**请求头认证（推荐）**

```bash
# 生成签名（示例）
APP_KEY="d4c0ed4bc5b049c8a144109f60c8abb9"
TIMESTAMP=$(date +%s000)
APP_SECRET="fcfe7ade592c4fcb9e6b8ec9e7c3134d"
SIGN=$(echo -n "${APP_KEY}${TIMESTAMP}${APP_SECRET}" | md5sum | cut -d' ' -f1)

# 发送请求
curl -X GET "http://localhost:5500/base/ad/pageAds" \
  -H "X-App-Key: ${APP_KEY}" \
  -H "X-Timestamp: ${TIMESTAMP}" \
  -H "X-Sign: ${SIGN}"
```

**URL参数认证**

```bash
curl -X GET "http://localhost:5500/base/ad/pageAds?appKey=xxx&timestamp=xxx&sign=xxx"
```

## 安全机制

### 1. 签名验证

```java
public static boolean verifySign(String appKey, String timestamp, String appSecret, String sign) {
    String correctSign = DigestUtil.md5Hex(appKey + timestamp + appSecret);
    return correctSign.equals(sign);
}
```

AppSecret 使用 AES-256 加密存储，即使数据库泄露也无法直接获取原文。

### 2. 时间戳防重放

```java
public static boolean verifyTimestamp(Long timestamp, long expireSeconds) {
    long diff = Math.abs(System.currentTimeMillis() - timestamp);
    return diff <= expireSeconds * 1000;
}
```

超过有效期（默认60秒）的请求被拒绝，有效防止请求被截获后重放。

### 3. 签名防重复

```java
String signCacheKey = SIGN_CACHE_PREFIX + sign;
if (RedisUtils.hasKey(signCacheKey)) {
    throw new ServiceException("请求重复");
}
RedisUtils.setCacheObject(signCacheKey, "1", Duration.ofSeconds(timestampExpireSeconds));
```

同一签名只能使用一次，缓存时间与时间戳有效期一致。

### 4. IP白名单

```java
if (StringUtils.isNotBlank(apiInfo.getWhiteIps())) {
    String clientIp = ServletUtils.getClientIP();
    List<String> whiteIpList = Arrays.asList(apiInfo.getWhiteIps().split(","));
    if (!whiteIpList.contains(clientIp)) {
        throw new ServiceException("IP地址不在白名单中");
    }
}
```

### 5. 权限控制

```java
// OR 模式: 拥有任一权限即可
@SaCheckPermission(value = {"system:user:query", "system:user:list"}, mode = SaMode.OR)

// AND 模式: 需要拥有所有权限
@SaCheckPermission(value = {"system:user:query", "system:user:list"}, mode = SaMode.AND)
```

## 密钥管理

### API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /generate | POST | 生成密钥 |
| /update | PUT | 更新配置 |
| /reset/{id} | PUT | 重置密钥（重新生成AppSecret） |
| /updateStatus | PUT | 启用/禁用 |
| /{ids} | DELETE | 删除密钥 |
| /list | GET | 查询列表（含调用统计） |

### 生成密钥

```json
// 请求
{
  "appName": "第三方系统A",
  "userId": 1,
  "permissions": ["base:ad:query", "base:ad:add"],
  "expireTime": "2025-12-31 23:59:59",
  "whiteIps": "192.168.1.100,192.168.1.101"
}

// 响应
{
  "appKey": "d4c0ed4bc5b049c8a144109f60c8abb9",
  "appSecret": "fcfe7ade592c4fcb9e6b8ec9e7c3134d"
}
```

### 调用统计

```json
{
  "appName": "第三方系统A",
  "appKey": "d4c0ed4bc5b049c8a144109f60c8abb9",
  "callCount": 12345,
  "lastCallTime": "2025-11-10 15:30:00"
}
```

统计更新采用异步方式，不影响接口响应性能:

```java
@Async
public void recordCall(String appKey) {
    openApiMapper.incrementCallCount(appKey);
    openApiMapper.updateLastCallTime(appKey, new Date());
}
```

## 自动配置

### OpenApiAutoConfiguration

```java
@AutoConfiguration
@EnableConfigurationProperties(OpenApiProperties.class)
@ConditionalOnProperty(prefix = "openapi", name = "enabled", havingValue = "true")
public class OpenApiAutoConfiguration implements WebMvcConfigurer {

    @Autowired
    private OpenApiProperties properties;

    @Autowired
    private OpenApiInterceptor openApiInterceptor;

    /**
     * 注册拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(openApiInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(
                "/error",
                "/favicon.ico",
                "/swagger-ui/**",
                "/v3/api-docs/**"
            );
    }

    /**
     * 接口扫描服务
     */
    @Bean
    @ConditionalOnMissingBean
    public OpenApiScanService openApiScanService() {
        return new OpenApiScanService();
    }
}
```

### 配置属性类

```java
@Data
@ConfigurationProperties(prefix = "openapi")
public class OpenApiProperties {

    /**
     * 是否启用开放平台
     */
    private boolean enabled = false;

    /**
     * 时间戳有效期（秒）
     */
    private long timestampExpireSeconds = 60;

    /**
     * 每用户最大密钥数
     */
    private int maxKeys = 5;

    /**
     * AppSecret加密密钥（必须32字节）
     */
    private String secretEncryptKey;

    /**
     * 访问控制配置
     */
    private AccessControl accessControl = new AccessControl();

    @Data
    public static class AccessControl {
        /**
         * 访问控制模式
         */
        private AccessMode mode = AccessMode.ALL;

        /**
         * 允许的角色列表（mode=ROLES时生效）
         */
        private List<String> allowedRoles = new ArrayList<>();
    }

    /**
     * 访问控制模式
     */
    public enum AccessMode {
        /** 所有用户 */
        ALL,
        /** 指定角色 */
        ROLES,
        /** 管理员 */
        ADMIN,
        /** 超级管理员 */
        SUPER_ADMIN
    }
}
```

## 最佳实践

### 1. 密钥管理规范

```java
// 定期轮换密钥（建议3-6个月）
OpenApiVo newKey = openApiService.generate(generateBo);
notifyClient(newKey.getAppKey(), newKey.getAppSecret());
openApiService.updateExpireTime(oldKeyId, DateUtils.addDays(new Date(), 30));

// 权限最小化
{
  "permissions": ["system:user:query"]  // 只授予必要的只读权限
}

// 使用IP白名单
{
  "whiteIps": "192.168.1.100,192.168.1.101"
}
```

### 2. 客户端最佳实践

```java
public class OpenApiClient {
    private final String baseUrl;
    private final String appKey;
    private final String appSecret;
    private final int timeout;
    private final int maxRetries;

    public <T> T requestWithRetry(String method, String path, Object body, Class<T> responseType) {
        int retries = 0;
        Exception lastException = null;

        while (retries < maxRetries) {
            try {
                return request(method, path, body, responseType);
            } catch (Exception e) {
                lastException = e;
                retries++;
                // 指数退避
                Thread.sleep((long) Math.pow(2, retries) * 100);
            }
        }
        throw new RuntimeException("请求失败，重试次数已用尽", lastException);
    }

    private <T> T request(String method, String path, Object body, Class<T> responseType) {
        long timestamp = System.currentTimeMillis();
        String sign = DigestUtil.md5Hex(appKey + timestamp + appSecret);

        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("X-App-Key", appKey)
            .header("X-Timestamp", String.valueOf(timestamp))
            .header("X-Sign", sign)
            .timeout(Duration.ofMillis(timeout));

        // 发送请求并解析响应...
    }
}
```

### 3. 安全加固

- **生产环境必须使用 HTTPS**
- **日志中脱敏 AppSecret 和签名**
- **设置合理的请求超时**
- **实现重试机制和断路器**
- **定期审计密钥使用情况**

```java
// 日志脱敏示例
log.info("API调用: appKey={}, path={}",
    StringUtils.mask(appKey, 4, 4),  // 显示前4后4，中间脱敏
    path);
```

### 4. 性能优化

```java
// 密钥信息缓存1小时
@Cacheable(value = "openapi", key = "#appKey")
public OpenApiVo getByAppKey(String appKey) {
    return openApiMapper.selectByAppKey(appKey);
}

// 异步记录调用统计
@Async
public void recordCall(String appKey) {
    openApiMapper.incrementCallCount(appKey);
}

// 批量统计更新（减少数据库压力）
@Scheduled(fixedRate = 60000)
public void flushCallStats() {
    Map<String, Long> stats = callStatsBuffer.getAndClear();
    if (!stats.isEmpty()) {
        openApiMapper.batchUpdateCallCount(stats);
    }
}
```

### 5. 监控告警

```java
// 调用次数异常告警
@Scheduled(fixedRate = 300000)
public void checkAbnormalCalls() {
    List<OpenApiVo> abnormalApis = openApiService.findAbnormalCalls(threshold);
    for (OpenApiVo api : abnormalApis) {
        alertService.send("OpenAPI调用异常",
            String.format("AppKey: %s, 5分钟内调用次数: %d",
                api.getAppKey(), api.getRecentCallCount()));
    }
}

// 密钥即将过期提醒
@Scheduled(cron = "0 0 9 * * ?")
public void checkExpiringSoon() {
    List<OpenApiVo> expiringSoon = openApiService.findExpiringSoon(7);
    for (OpenApiVo api : expiringSoon) {
        notifyService.send(api.getUserId(),
            String.format("您的API密钥 %s 将于 %s 过期",
                api.getAppName(), api.getExpireTime()));
    }
}
```

## 常见问题

### 1. 签名验证失败

**检查项:**
- 签名顺序：`appKey + timestamp + appSecret`
- 时间戳单位：毫秒（不是秒）
- MD5结果：32位小写
- 字符编码：UTF-8

```java
// 调试签名
String content = appKey + timestamp + appSecret;
System.out.println("签名内容: " + content);
System.out.println("签名内容长度: " + content.length());
System.out.println("签名结果: " + DigestUtil.md5Hex(content));
```

**常见错误:**

```java
// 错误1: 时间戳使用秒而非毫秒
long timestamp = System.currentTimeMillis() / 1000;  // ❌

// 正确: 使用毫秒
long timestamp = System.currentTimeMillis();  // ✅

// 错误2: MD5结果大写
String sign = DigestUtil.md5Hex(content).toUpperCase();  // ❌

// 正确: 使用小写
String sign = DigestUtil.md5Hex(content);  // ✅
```

### 2. 请求已过期

**原因:** 客户端与服务器时间不同步

```bash
# 同步时间
sudo ntpdate time.apple.com  # Linux/Mac
w32tm /resync                # Windows
```

**客户端处理:**

```java
// 获取服务器时间
public long getServerTime() {
    String response = HttpUtil.get(baseUrl + "/common/time");
    return JsonUtils.parseObject(response).getLong("timestamp");
}

// 计算时间差
long timeDiff = getServerTime() - System.currentTimeMillis();

// 生成签名时使用校正后的时间戳
long timestamp = System.currentTimeMillis() + timeDiff;
```

### 3. 请求重复

**原因:** 使用了相同的时间戳和签名

```java
// 错误: 复用时间戳
long timestamp = cachedTimestamp;  // ❌

// 正确: 每次请求都生成新时间戳
public void callApi() {
    long timestamp = System.currentTimeMillis();  // ✅ 每次都是新的
    String sign = generateSign(timestamp);
}
```

### 4. IP不在白名单

```java
// 获取真实客户端IP
String clientIp = ServletUtils.getClientIP();
log.info("客户端IP: {}", clientIp);
```

如果通过代理，配置转发头：

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

### 5. 权限不足

```sql
-- 检查密钥权限
SELECT permissions FROM sys_openapi WHERE app_key = 'xxx';
```

在管理后台更新权限：`系统管理 → 开放平台 → API密钥 → 编辑 → 授权权限`

### 6. Token过期

**现象:** 调用一段时间后突然返回未认证

**原因:** Token缓存过期（默认2小时）

**解决方案:**

```java
// 方案1: 客户端捕获401错误自动重试
public <T> T requestWithTokenRefresh(String path, Class<T> responseType) {
    try {
        return request(path, responseType);
    } catch (UnauthorizedException e) {
        // Token过期，重新请求会自动生成新Token
        return request(path, responseType);
    }
}

// 方案2: 服务端延长Token有效期
String token = RedisUtils.getCacheObject(tokenCacheKey);
if (StringUtils.isNotBlank(token)) {
    // 续期Token
    RedisUtils.expire(tokenCacheKey, Duration.ofHours(2));
}
```

### 7. 性能问题

```yaml
# Redis缓存
spring:
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # 1小时

# 数据库索引
CREATE UNIQUE INDEX uk_app_key ON sys_openapi(app_key);
CREATE INDEX idx_status_expire ON sys_openapi(status, expire_time);
CREATE INDEX idx_user_id ON sys_openapi(user_id);
```

### 8. 多租户场景

**问题:** API调用后数据访问了错误的租户

**原因:** 租户上下文未正确设置

**检查:**

```java
// 确认API配置了正确的租户ID
log.info("API租户ID: {}", apiInfo.getTenantId());
log.info("当前租户ID: {}", TenantHelper.getTenantId());
```

**解决方案:**

```java
// 确保API密钥关联了正确的租户
{
  "appName": "租户A系统",
  "tenantId": "tenant_001",
  "permissions": ["base:ad:query"]
}
```

## 总结

OpenAPI开放平台核心要点：

1. **认证流程**: AppKey + Timestamp + AppSecret → MD5签名
2. **安全机制**: 签名验证、时间戳防重放、签名防重复、IP白名单
3. **权限控制**: 基于 `@SaCheckPermission` 注解的细粒度权限
4. **接口标识**: 使用 `@OpenApi` 注解标识开放接口
5. **密钥管理**: 生成、重置、启用/禁用、过期控制
6. **访问控制**: ALL/ROLES/ADMIN/SUPER_ADMIN 四种模式
7. **接口扫描**: 自动发现 `@OpenApi` 标注的接口
8. **性能优化**: 缓存、异步统计、批量更新
