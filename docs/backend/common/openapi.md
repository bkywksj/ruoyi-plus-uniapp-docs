# OpenAPI 开放平台

## 介绍

OpenAPI开放平台提供企业级API开放解决方案，通过 AppKey + AppSecret 签名认证机制，为第三方系统提供安全、可控的API访问能力。

**核心特性:**

- **双重认证体系** - AppKey/AppSecret 签名认证与 Sa-Token JWT 认证并行
- **完善的安全机制** - 签名验证、时间戳防重放、签名防重复、IP白名单
- **灵活的权限管理** - 基于 `@SaCheckPermission` 的细粒度权限控制
- **密钥全生命周期管理** - 生成、配置、重置、启用/禁用、删除、调用统计
- **自动接口扫描** - 通过 `@OpenApi` 注解自动识别开放接口

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

### 2. 生成 API 密钥

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

> ⚠️ AppSecret 仅在生成时显示一次，请立即保存。丢失需使用"重置密钥"功能。

## 接口标识

### 使用 @OpenApi 注解

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

类级注解使该类所有接口自动识别为开放接口：

```java
@OpenApi("广告管理")
@RestController
@RequestMapping("/base/ad")
public class AdController {
    // 所有方法自动识别为开放接口
}
```

## 客户端调用

### 签名计算

```
sign = MD5(appKey + timestamp + appSecret)
```

**签名步骤:**
1. 获取当前时间戳（毫秒）
2. 拼接：`appKey + timestamp + appSecret`
3. MD5加密，得到32位小写签名

### Java 示例

```java
public class OpenApiClient {
    private final String appKey;
    private final String appSecret;

    private String generateSign(long timestamp) {
        return DigestUtil.md5Hex(appKey + timestamp + appSecret);
    }

    public String callApi(String url, String method, String body) {
        long timestamp = System.currentTimeMillis();
        String sign = generateSign(timestamp);

        return HttpRequest.request(method, url)
            .header("Content-Type", "application/json")
            .header("X-App-Key", appKey)
            .header("X-Timestamp", String.valueOf(timestamp))
            .header("X-Sign", sign)
            .body(body)
            .execute()
            .body();
    }
}
```

### JavaScript 示例

```javascript
import md5 from 'md5'
import axios from 'axios'

class OpenApiClient {
  constructor(appKey, appSecret) {
    this.appKey = appKey
    this.appSecret = appSecret
  }

  generateSign(timestamp) {
    return md5(this.appKey + timestamp + this.appSecret)
  }

  async callApi(url, method, data) {
    const timestamp = Date.now()
    const sign = this.generateSign(timestamp)

    return axios({
      url, method, data,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': this.appKey,
        'X-Timestamp': timestamp,
        'X-Sign': sign
      }
    })
  }
}
```

### Python 示例

```python
import requests
import hashlib
import time

class OpenApiClient:
    def __init__(self, base_url, app_key, app_secret):
        self.base_url = base_url
        self.app_key = app_key
        self.app_secret = app_secret

    def _generate_sign(self, timestamp):
        content = f"{self.app_key}{timestamp}{self.app_secret}"
        return hashlib.md5(content.encode()).hexdigest()

    def request(self, method, path, **kwargs):
        timestamp = str(int(time.time() * 1000))
        sign = self._generate_sign(timestamp)

        headers = {
            'Content-Type': 'application/json',
            'X-App-Key': self.app_key,
            'X-Timestamp': timestamp,
            'X-Sign': sign
        }

        return requests.request(method, f"{self.base_url}{path}", headers=headers, **kwargs)
```

### 认证方式

**方式一：请求头认证（推荐）**

```bash
curl -X GET "http://localhost:5500/base/ad/pageAds" \
  -H "X-App-Key: d4c0ed4bc5b049c8a144109f60c8abb9" \
  -H "X-Timestamp: 1609459200000" \
  -H "X-Sign: e10adc3949ba59abbe56e057f20f883e"
```

**方式二：URL参数认证**

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

AppSecret 使用 BCrypt 加密存储，即使数据库泄露也无法还原。

### 2. 时间戳防重放

```java
public static boolean verifyTimestamp(Long timestamp, long expireSeconds) {
    long diff = Math.abs(System.currentTimeMillis() - timestamp);
    return diff <= expireSeconds * 1000;
}
```

超过有效期（默认60秒）的请求被拒绝。

### 3. 签名防重复

```java
String signCacheKey = "openapi:sign:" + sign;
if (RedisUtils.hasKey(signCacheKey)) {
    throw ServiceException.of("请求重复");
}
RedisUtils.setCacheObject(signCacheKey, "1", Duration.ofSeconds(timestampExpireSeconds));
```

### 4. IP白名单

```java
if (StringUtils.isNotBlank(apiInfo.getWhiteIps())) {
    String clientIp = ServletUtils.getClientIP();
    List<String> whiteIpList = Arrays.asList(apiInfo.getWhiteIps().split(","));
    if (!whiteIpList.contains(clientIp)) {
        throw ServiceException.of("IP地址不在白名单中");
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

## 接口扫描

### OpenApiScanService

```java
@Autowired
private OpenApiScanService openApiScanService;

// 扫描所有开放接口（根据当前用户权限过滤）
List<OpenApiInfoVo> apis = openApiScanService.scanUserOpenApis();
```

### 接口信息结构

```java
@Data
public class OpenApiInfoVo {
    private String path;           // 接口路径
    private String method;         // 请求方法
    private String description;    // 接口描述
    private String module;         // 所属模块
    private String permission;     // 权限要求
    private String permissionMode; // 权限模式 (AND/OR)
    private Boolean noAuth;        // 是否无权限限制
    private List<ParameterInfo> parameters;  // 参数列表
    private ResponseInfo responseInfo;       // 响应信息
}
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

统计更新采用异步方式，不影响接口响应性能。

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

### 2. 客户端封装

```java
public class OpenApiClient {
    private final String baseUrl;
    private final String appKey;
    private final String appSecret;

    public <T> T get(String path, Class<T> responseType) {
        return request("GET", path, null, responseType);
    }

    public <T> T post(String path, Object body, Class<T> responseType) {
        return request("POST", path, body, responseType);
    }

    private <T> T request(String method, String path, Object body, Class<T> responseType) {
        long timestamp = System.currentTimeMillis();
        String sign = DigestUtil.md5Hex(appKey + timestamp + appSecret);

        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("X-App-Key", appKey)
            .header("X-Timestamp", String.valueOf(timestamp))
            .header("X-Sign", sign);

        // 发送请求并解析响应...
    }
}
```

### 3. 安全加固

- 生产环境必须使用 HTTPS
- 日志中脱敏 AppSecret 和签名
- 设置请求超时
- 实现重试机制

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
System.out.println("签名结果: " + DigestUtil.md5Hex(content));
```

### 2. 请求已过期

**原因:** 客户端与服务器时间不同步

```bash
# 同步时间
sudo ntpdate time.apple.com  # Linux/Mac
w32tm /resync                # Windows
```

### 3. 请求重复

**原因:** 使用了相同的时间戳和签名

```java
// 每次请求都生成新时间戳
public void callApi() {
    long timestamp = System.currentTimeMillis();  // 每次都是新的
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

### 6. 性能优化

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
```

## 总结

OpenAPI开放平台核心要点：

1. **认证流程**: AppKey + Timestamp + AppSecret → MD5签名
2. **安全机制**: 签名验证、时间戳防重放、签名防重复、IP白名单
3. **权限控制**: 基于 `@SaCheckPermission` 注解的细粒度权限
4. **接口标识**: 使用 `@OpenApi` 注解标识开放接口
5. **密钥管理**: 生成、重置、启用/禁用、过期控制
