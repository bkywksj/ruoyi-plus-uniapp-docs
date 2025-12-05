# OpenAPI 开放平台

## 介绍

OpenAPI开放平台是 RuoYi-Plus 框架提供的企业级API开放解决方案,通过 AppKey + AppSecret 签名认证机制,为第三方系统提供安全、可控的API访问能力。该模块与现有的 Sa-Token JWT 认证体系并行运行,互不干扰,专门用于对外开放接口。

**核心特性:**

- **双重认证体系** - AppKey/AppSecret 签名认证与 Sa-Token JWT 认证并行,满足不同场景需求
- **完善的安全机制** - 提供签名验证、时间戳防重放、签名防重复、IP白名单、权限控制等多重安全防护
- **灵活的权限管理** - 支持细粒度的接口级权限控制,基于 `@SaCheckPermission` 权限编码进行授权
- **密钥全生命周期管理** - 提供密钥生成、配置、重置、启用/禁用、删除、调用统计等完整管理功能
- **多种调用方式** - 支持请求头(Header)和URL参数两种认证方式,适应不同客户端需求
- **高性能设计** - 密钥信息缓存1小时,权限验证结果缓存5分钟,异步记录调用统计
- **自动接口扫描** - 通过 `@OpenApi` 注解自动识别开放接口,支持接口列表查询和权限过滤
- **完善的监控统计** - 记录每个密钥的调用次数、最后调用时间等统计信息

## 快速开始

### 1. 启用开放平台

在 `application.yml` 配置文件中启用 OpenAPI 功能:

```yaml
openapi:
  # 是否启用开放平台
  enabled: true
  # 时间戳过期时间(秒) 用于防重放攻击
  timestamp-expire-seconds: 60
  # 每个用户最大密钥数量
  max-keys: 5
  # AppSecret加密密钥（AES-256需要32字节）
  secret-encrypt-key: q3XA19UeJExvCqynPOnyYUcr4zwOVCyi
  # 访问控制配置
  access-control:
    # 访问模式: all(所有用户) | roles(指定角色) | admin(仅管理员) | super_admin(仅超管)
    mode: all
    # 允许访问的角色列表(当mode=roles时生效)
    allowed-roles: admin,pc_user
```

**配置说明:**
- `enabled`: 控制开放平台功能的总开关,设置为 `true` 启用
- `timestamp-expire-seconds`: 时间戳有效期,默认60秒,用于防止重放攻击
- `max-keys`: 每个用户最多可以创建的密钥数量,防止密钥滥用
- `secret-encrypt-key`: AppSecret 加密密钥,必须是32字节,用于 AES-256 加密
- `access-control.mode`: 访问控制模式,控制哪些用户可以创建和管理密钥
- `access-control.allowed-roles`: 当模式为 `roles` 时,指定允许访问的角色列表

**使用环境变量:**

```bash
export OPEN_API_ENABLED=true
export OPEN_API_SECRET_KEY=your_32_bytes_secret_key
export OPEN_API_ACCESS_MODE=all
export OPEN_API_ALLOWED_ROLES=admin,pc_user
```

### 2. 执行数据库脚本

执行 `script/sql/ry_plus_new.sql` 中的 OpenAPI 相关建表SQL:

```sql
-- sys_openapi 表用于存储API密钥信息
CREATE TABLE `sys_openapi` (
  `id` bigint NOT NULL COMMENT '主键',
  `app_name` varchar(100) NOT NULL COMMENT '应用名称',
  `app_key` varchar(32) NOT NULL COMMENT 'AppKey',
  `app_secret` varchar(255) NOT NULL COMMENT 'AppSecret(加密存储)',
  `user_id` bigint DEFAULT NULL COMMENT '关联用户ID',
  `tenant_id` varchar(20) DEFAULT NULL COMMENT '租户ID',
  `permissions` text COMMENT '授权权限(JSON数组)',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态(1:启用 0:禁用)',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `white_ips` varchar(500) DEFAULT NULL COMMENT 'IP白名单',
  `call_count` bigint DEFAULT '0' COMMENT '调用次数',
  `last_call_time` datetime DEFAULT NULL COMMENT '最后调用时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  -- ... 其他字段
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_key` (`app_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='开放API密钥表';
```

**菜单初始化:**

系统会自动创建以下菜单:
- **系统管理 → 开放平台 → API密钥** - 密钥管理界面
- **系统管理 → 开放平台 → 接口列表** - 开放接口查询

### 3. 生成 API 密钥

#### 管理后台操作步骤:

1. 登录系统管理后台
2. 导航至 `系统管理` → `开放平台` → `API密钥`
3. 点击 `生成密钥` 按钮
4. 填写密钥信息:
   - **应用名称**: 必填,标识调用方应用
   - **关联用户**: 可选,选择后密钥会继承该用户的权限和租户信息
   - **授权权限**: 树形选择器,选择该密钥可访问的接口权限
   - **过期时间**: 可选,设置密钥的有效期
   - **IP白名单**: 可选,多个IP用逗号分隔,限制只有白名单内的IP可以调用
   - **备注**: 可选,记录密钥用途等信息
5. 提交后系统会显示 **AppKey** 和 **AppSecret** (仅显示一次,请妥善保管)

#### 密钥生成示例:

```json
{
  "appName": "第三方系统A",
  "userId": 1,
  "permissions": ["base:ad:query", "base:ad:add"],
  "expireTime": "2025-12-31 23:59:59",
  "whiteIps": "192.168.1.100,192.168.1.101",
  "remark": "用于第三方系统A访问广告接口"
}
```

**生成结果:**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "appKey": "d4c0ed4bc5b049c8a144109f60c8abb9",
    "appSecret": "fcfe7ade592c4fcb9e6b8ec9e7c3134d"
  }
}
```

**注意事项:**
- AppSecret 仅在生成时显示一次,请立即保存
- AppSecret 在数据库中使用 BCrypt 加密存储,无法还原
- 如果丢失 AppSecret,需要使用"重置密钥"功能重新生成

## 接口标识

### 使用 @OpenApi 注解

在 Controller 方法或类上添加 `@OpenApi` 注解,将接口标识为开放接口:

#### 方法级注解

```java
@RestController
@RequestMapping("/base/ad")
public class AdController {

    /**
     * 查询广告列表 - 开放接口
     */
    @OpenApi("查询广告配置列表")
    @SaCheckPermission("base:ad:query")
    @GetMapping("/pageAds")
    public R<PageResult<AdVo>> pageAds(AdBo bo, PageQuery pageQuery) {
        return R.ok(adService.page(bo, pageQuery));
    }

    /**
     * 获取广告详情 - 开放接口
     */
    @OpenApi("获取广告配置详细信息")
    @SaCheckPermission("base:ad:query")
    @GetMapping("/getAd/{id}")
    public R<AdVo> getAd(@NotNull @PathVariable Long id) {
        return R.ok(adService.get(id));
    }

    /**
     * 新增广告 - 开放接口
     */
    @OpenApi("添加广告配置")
    @SaCheckPermission("base:ad:add")
    @PostMapping("/addAd")
    public R<Long> addAd(@Validated(AddGroup.class) @RequestBody AdBo bo) {
        return R.ok(adService.add(bo));
    }
}
```

#### 类级注解

将 `@OpenApi` 注解在类上,该类下的所有接口都会被标识为开放接口:

```java
@OpenApi("广告管理接口")
@RestController
@RequestMapping("/base/ad")
public class AdController {

    @SaCheckPermission("base:ad:query")
    @GetMapping("/list")
    public R<List<AdVo>> list(AdBo bo) {
        // 自动识别为开放接口
        return R.ok(adService.list(bo));
    }

    @SaCheckPermission("base:ad:add")
    @PostMapping("/add")
    public R<Long> add(@RequestBody AdBo bo) {
        // 自动识别为开放接口
        return R.ok(adService.add(bo));
    }
}
```

**注解属性:**
- `value`: 接口描述,用于接口文档和列表展示
- 如果不填写 `value`,系统会使用方法名作为接口描述

**权限控制:**

OpenAPI 接口会自动继承 `@SaCheckPermission` 和 `@SaCheckRole` 注解的权限要求:

```java
@OpenApi("用户查询接口")
@SaCheckPermission(value = {"system:user:query", "system:user:list"}, mode = SaMode.OR)
@GetMapping("/list")
public R<List<SysUserVo>> list() {
    // 客户端需要拥有 system:user:query 或 system:user:list 权限
    return R.ok(userService.list());
}

@OpenApi("用户管理接口")
@SaCheckRole(value = {"admin", "user_manager"}, mode = SaMode.AND)
@PostMapping("/add")
public R<Long> add(@RequestBody SysUserBo bo) {
    // 客户端需要同时拥有 admin 和 user_manager 角色
    return R.ok(userService.add(bo));
}
```

## 客户端调用

### 签名计算

OpenAPI 使用 MD5 签名算法,签名规则为:

```
sign = MD5(appKey + timestamp + appSecret)
```

**签名步骤:**

1. 获取当前时间戳(毫秒)
2. 按照 `appKey + timestamp + appSecret` 的顺序拼接字符串
3. 对拼接后的字符串进行 MD5 加密
4. 得到32位小写的签名值

#### Java 示例

```java
import cn.hutool.crypto.digest.DigestUtil;

public class OpenApiClient {

    private final String appKey;
    private final String appSecret;

    /**
     * 生成签名
     */
    private String generateSign(long timestamp) {
        String content = appKey + timestamp + appSecret;
        return DigestUtil.md5Hex(content);
    }

    /**
     * 调用 OpenAPI 接口
     */
    public String callApi(String url, String method, String body) {
        // 1. 生成时间戳
        long timestamp = System.currentTimeMillis();

        // 2. 计算签名
        String sign = generateSign(timestamp);

        // 3. 发送请求
        HttpResponse response = HttpRequest.request(method, url)
            .header("Content-Type", "application/json")
            .header("X-App-Key", appKey)
            .header("X-Timestamp", String.valueOf(timestamp))
            .header("X-Sign", sign)
            .body(body)
            .execute();

        return response.body();
    }
}
```

#### JavaScript 示例

```javascript
import md5 from 'md5'
import axios from 'axios'

class OpenApiClient {
  constructor(appKey, appSecret) {
    this.appKey = appKey
    this.appSecret = appSecret
  }

  /**
   * 生成签名
   */
  generateSign(timestamp) {
    const content = this.appKey + timestamp + this.appSecret
    return md5(content)
  }

  /**
   * 调用 OpenAPI 接口
   */
  async callApi(url, method, data) {
    // 1. 生成时间戳
    const timestamp = Date.now()

    // 2. 计算签名
    const sign = this.generateSign(timestamp)

    // 3. 发送请求
    const response = await axios({
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': this.appKey,
        'X-Timestamp': timestamp,
        'X-Sign': sign
      },
      data
    })

    return response.data
  }
}

// 使用示例
const client = new OpenApiClient(
  'd4c0ed4bc5b049c8a144109f60c8abb9',
  'fcfe7ade592c4fcb9e6b8ec9e7c3134d'
)

// 调用接口
const result = await client.callApi(
  'http://localhost:5500/base/ad/pageAds',
  'GET',
  null
)
```

#### Python 示例

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
        """生成签名"""
        content = f"{self.app_key}{timestamp}{self.app_secret}"
        return hashlib.md5(content.encode()).hexdigest()

    def request(self, method, path, **kwargs):
        """发送请求"""
        # 1. 生成时间戳
        timestamp = str(int(time.time() * 1000))

        # 2. 计算签名
        sign = self._generate_sign(timestamp)

        # 3. 设置请求头
        headers = {
            'Content-Type': 'application/json',
            'X-App-Key': self.app_key,
            'X-Timestamp': timestamp,
            'X-Sign': sign
        }

        # 4. 发送请求
        url = f"{self.base_url}{path}"
        return requests.request(method, url, headers=headers, **kwargs)

# 使用示例
client = OpenApiClient(
    base_url='http://localhost:5500',
    app_key='d4c0ed4bc5b049c8a144109f60c8abb9',
    app_secret='fcfe7ade592c4fcb9e6b8ec9e7c3134d'
)

# 调用接口
response = client.request('GET', '/base/ad/pageAds')
print(response.json())
```

### 认证方式

OpenAPI 支持两种认证方式:请求头(Header)和URL参数。

#### 方式一:请求头认证(推荐)

在 HTTP 请求头中添加以下参数:

```http
GET /base/ad/pageAds HTTP/1.1
Host: localhost:5500
Content-Type: application/json
X-App-Key: d4c0ed4bc5b049c8a144109f60c8abb9
X-Timestamp: 1609459200000
X-Sign: e10adc3949ba59abbe56e057f20f883e
```

**使用 cURL:**

```bash
curl -X GET "http://localhost:5500/base/ad/pageAds" \
  -H "Content-Type: application/json" \
  -H "X-App-Key: d4c0ed4bc5b049c8a144109f60c8abb9" \
  -H "X-Timestamp: 1609459200000" \
  -H "X-Sign: e10adc3949ba59abbe56e057f20f883e"
```

**优点:**
- 更安全,不会在 URL 中暴露认证信息
- 适合 POST、PUT、DELETE 等请求
- 不受 URL 长度限制
- 不会在浏览器历史记录和服务器日志中留下敏感信息

#### 方式二:URL 参数认证

在 URL 查询参数中添加认证信息:

```http
GET /base/ad/pageAds?appKey=d4c0ed4bc5b049c8a144109f60c8abb9&timestamp=1609459200000&sign=e10adc3949ba59abbe56e057f20f883e HTTP/1.1
Host: localhost:5500
Content-Type: application/json
```

**使用 cURL:**

```bash
curl -X GET "http://localhost:5500/base/ad/pageAds?appKey=d4c0ed4bc5b049c8a144109f60c8abb9&timestamp=1609459200000&sign=e10adc3949ba59abbe56e057f20f883e" \
  -H "Content-Type: application/json"
```

**参数说明:**
- `appKey`: AppKey值
- `timestamp`: 时间戳(毫秒)
- `sign`: 签名值

**优点:**
- 使用简单,可以直接在浏览器中测试
- 适合 GET 请求
- 方便调试和分享

**注意事项:**
- URL 参数会出现在浏览器历史记录和服务器日志中
- 可能受到 URL 长度限制(通常2048字符)
- 生产环境推荐使用请求头方式

### 完整调用示例

#### GET 请求示例

查询广告列表:

```java
// Java 示例
String appKey = "d4c0ed4bc5b049c8a144109f60c8abb9";
String appSecret = "fcfe7ade592c4fcb9e6b8ec9e7c3134d";
long timestamp = System.currentTimeMillis();
String sign = DigestUtil.md5Hex(appKey + timestamp + appSecret);

HttpResponse response = HttpRequest.get("http://localhost:5500/base/ad/pageAds")
    .header("X-App-Key", appKey)
    .header("X-Timestamp", String.valueOf(timestamp))
    .header("X-Sign", sign)
    .execute();

System.out.println(response.body());
```

```javascript
// JavaScript 示例
const appKey = 'd4c0ed4bc5b049c8a144109f60c8abb9'
const appSecret = 'fcfe7ade592c4fcb9e6b8ec9e7c3134d'
const timestamp = Date.now()
const sign = md5(appKey + timestamp + appSecret)

const response = await axios.get('http://localhost:5500/base/ad/pageAds', {
  headers: {
    'X-App-Key': appKey,
    'X-Timestamp': timestamp,
    'X-Sign': sign
  }
})

console.log(response.data)
```

#### POST 请求示例

添加广告:

```java
// Java 示例
String appKey = "d4c0ed4bc5b049c8a144109f60c8abb9";
String appSecret = "fcfe7ade592c4fcb9e6b8ec9e7c3134d";
long timestamp = System.currentTimeMillis();
String sign = DigestUtil.md5Hex(appKey + timestamp + appSecret);

String requestBody = """
    {
        "appid": "wx1234567890",
        "adUnitId": "adunit-12345",
        "adName": "测试广告位",
        "adType": "banner",
        "position": "home_top",
        "img": "https://example.com/ad.jpg",
        "status": "1"
    }
    """;

HttpResponse response = HttpRequest.post("http://localhost:5500/base/ad/addAd")
    .header("Content-Type", "application/json")
    .header("X-App-Key", appKey)
    .header("X-Timestamp", String.valueOf(timestamp))
    .header("X-Sign", sign)
    .body(requestBody)
    .execute();

System.out.println(response.body());
```

```javascript
// JavaScript 示例
const appKey = 'd4c0ed4bc5b049c8a144109f60c8abb9'
const appSecret = 'fcfe7ade592c4fcb9e6b8ec9e7c3134d'
const timestamp = Date.now()
const sign = md5(appKey + timestamp + appSecret)

const data = {
  appid: 'wx1234567890',
  adUnitId: 'adunit-12345',
  adName: '测试广告位',
  adType: 'banner',
  position: 'home_top',
  img: 'https://example.com/ad.jpg',
  status: '1'
}

const response = await axios.post('http://localhost:5500/base/ad/addAd', data, {
  headers: {
    'Content-Type': 'application/json',
    'X-App-Key': appKey,
    'X-Timestamp': timestamp,
    'X-Sign': sign
  }
})

console.log(response.data)
```

## 安全机制

### 1. 签名验证

#### 签名算法

OpenAPI 使用 MD5 签名算法确保请求未被篡改:

```
sign = MD5(appKey + timestamp + appSecret)
```

**验证流程:**

1. 服务器从请求中获取 AppKey、Timestamp、Sign
2. 根据 AppKey 查询对应的 AppSecret
3. 使用相同算法计算服务器端签名
4. 对比客户端签名和服务器端签名是否一致

**实现代码:**

```java
public static boolean verifySign(String appKey, String timestamp,
                                  String appSecret, String sign) {
    String correctSign = generateSign(appKey, timestamp, appSecret);
    return correctSign.equals(sign);
}

public static String generateSign(String appKey, String timestamp, String appSecret) {
    String content = appKey + timestamp + appSecret;
    return DigestUtil.md5Hex(content);
}
```

**AppSecret 加密存储:**

AppSecret 在数据库中使用 BCrypt 算法加密存储,即使数据库泄露也无法还原原始密钥:

```java
// 生成密钥时加密
String appSecret = RandomUtil.randomString(32);
String encryptedSecret = BCrypt.hashpw(appSecret, BCrypt.gensalt());

// 验证时比对
boolean matches = BCrypt.checkpw(inputSecret, encryptedSecret);
```

### 2. 时间戳防重放攻击

通过时间戳机制防止请求被重放攻击:

```java
public static boolean verifyTimestamp(Long timestamp, long expireSeconds) {
    if (timestamp == null) {
        return false;
    }
    long now = System.currentTimeMillis();
    long diff = Math.abs(now - timestamp);
    return diff <= expireSeconds * 1000;
}
```

**防护原理:**
- 每个请求携带客户端时间戳
- 服务器验证时间戳是否在有效期内(默认60秒)
- 超过有效期的请求被拒绝

**配置时间戳有效期:**

```yaml
openapi:
  timestamp-expire-seconds: 60  # 默认60秒
```

**客户端时间同步:**

为确保时间戳验证通过,客户端与服务器时间差不能超过配置的有效期:

```bash
# Linux/Mac 使用 NTP 同步时间
sudo ntpdate time.apple.com

# Windows 同步时间
w32tm /resync
```

### 3. 签名防重复

通过 Redis 缓存已验证的签名,防止同一签名被重复使用:

```java
String signCacheKey = "openapi:sign:" + sign;

// 检查签名是否已使用
if (RedisUtils.hasKey(signCacheKey)) {
    throw ServiceException.of("请求重复");
}

// 验证通过后缓存签名
RedisUtils.setCacheObject(signCacheKey, "1",
    Duration.ofSeconds(timestampExpireSeconds));
```

**防护原理:**
- 验证通过的签名会在 Redis 中缓存
- 缓存时间等于时间戳有效期(默认60秒)
- 相同签名的请求在缓存期内会被拒绝

**缓存key格式:**

```
openapi:sign:{signValue}
```

### 4. IP 白名单控制

支持配置 IP 白名单,只允许指定 IP 访问:

```java
// 检查IP白名单
if (StringUtils.isNotBlank(apiInfo.getWhiteIps())) {
    String clientIp = ServletUtils.getClientIP();
    List<String> whiteIpList = Arrays.asList(apiInfo.getWhiteIps().split(","));
    if (!whiteIpList.contains(clientIp)) {
        throw ServiceException.of("IP地址不在白名单中");
    }
}
```

**配置方式:**

在管理后台生成密钥时配置:

```json
{
  "appName": "第三方系统A",
  "whiteIps": "192.168.1.100,192.168.1.101,10.0.0.1"
}
```

**IP 获取:**

系统会自动处理代理情况,优先从以下请求头获取真实 IP:
- `X-Forwarded-For`
- `X-Real-IP`
- `Proxy-Client-IP`
- `WL-Proxy-Client-IP`

### 5. 权限控制

OpenAPI 基于 `@SaCheckPermission` 和 `@SaCheckRole` 注解进行权限控制:

```java
private boolean hasPermission(OpenApiInfoVo api,
                              Set<String> userPermissions,
                              Set<String> userRoles) {
    // 1. 无权限限制的接口直接放行
    if (Boolean.TRUE.equals(api.getNoAuth())) {
        return true;
    }

    // 2. 超级管理员拥有所有权限
    if (userRoles.contains("superadmin")) {
        return true;
    }

    // 3. 通配符权限拥有所有权限
    if (userPermissions.contains("*:*:*")) {
        return true;
    }

    // 4. 检查权限
    if (StringUtils.isNotBlank(api.getPermission())) {
        String[] requiredPermissions = api.getPermission().split(",");
        String mode = api.getPermissionMode();

        if ("AND".equals(mode)) {
            // AND模式: 需要拥有所有权限
            for (String permission : requiredPermissions) {
                if (!userPermissions.contains(permission.trim())) {
                    return false;
                }
            }
            return true;
        } else {
            // OR模式: 拥有任意一个权限即可
            for (String permission : requiredPermissions) {
                if (userPermissions.contains(permission.trim())) {
                    return true;
                }
            }
        }
    }

    // 5. 检查角色
    if (StringUtils.isNotBlank(api.getRoleCode())) {
        // 角色验证逻辑同上
        // ...
    }

    return false;
}
```

**权限模式:**

```java
// OR 模式: 拥有任一权限即可访问
@SaCheckPermission(value = {"system:user:query", "system:user:list"}, mode = SaMode.OR)

// AND 模式: 需要拥有所有权限
@SaCheckPermission(value = {"system:user:query", "system:user:list"}, mode = SaMode.AND)
```

**权限继承:**

密钥会继承关联用户的权限:

```java
// 创建密钥时关联用户
Long userId = 1L;  // 关联的用户ID

// 调用时自动继承用户权限
LoginUser loginUser = openApiService.getLoginUserByUserId(userId);
Set<String> permissions = loginUser.getMenuPermission();
Set<String> roles = loginUser.getRolePermission();
```

### 6. 密钥过期控制

支持设置密钥过期时间,过期后自动失效:

```java
// 检查过期时间
if (apiInfo.getExpireTime() != null &&
    apiInfo.getExpireTime().before(new Date())) {
    throw ServiceException.of("API密钥已过期");
}
```

**配置过期时间:**

```json
{
  "appName": "第三方系统A",
  "expireTime": "2025-12-31 23:59:59"
}
```

**过期检查时机:**
- 每次请求时检查密钥是否过期
- 过期密钥立即失效,无法继续使用
- 管理后台会显示密钥的过期状态

### 7. 状态控制

支持启用/禁用密钥:

```java
// 检查密钥状态
if (!DictEnableStatus.ENABLE.getValue().equals(apiInfo.getStatus())) {
    throw ServiceException.of("API密钥已禁用");
}
```

**状态值:**
- `1`: 启用
- `0`: 禁用

**管理操作:**

```java
// 禁用密钥
openApiService.updateStatus(appKey, "0");

// 启用密钥
openApiService.updateStatus(appKey, "1");
```

## 接口扫描

### OpenApiScanService

OpenApiScanService 提供了自动扫描和管理标注了 `@OpenApi` 注解的接口的能力。

#### 扫描所有开放接口

```java
@Autowired
private OpenApiScanService openApiScanService;

/**
 * 扫描所有开放接口(根据当前用户权限过滤)
 */
public List<OpenApiInfoVo> getUserOpenApis() {
    return openApiScanService.scanUserOpenApis();
}
```

**扫描流程:**

1. 从 Spring MVC 的 `RequestMappingHandlerMapping` 获取所有接口
2. 筛选标注了 `@OpenApi` 注解的接口
3. 提取接口信息:路径、方法、权限要求、参数、响应等
4. 根据当前登录用户的权限进行过滤
5. 按模块和路径排序返回

#### 接口信息结构

```java
@Data
@Builder
public class OpenApiInfoVo {
    /** 接口路径 */
    private String path;

    /** 请求方法 */
    private String method;

    /** 接口描述 */
    private String description;

    /** 所属模块 */
    private String module;

    /** Controller类名 */
    private String className;

    /** 方法名 */
    private String methodName;

    /** 权限要求 */
    private String permission;

    /** 权限模式 (AND/OR) */
    private String permissionMode;

    /** 角色要求 */
    private String roleCode;

    /** 角色模式 (AND/OR) */
    private String roleMode;

    /** 是否无权限限制 */
    private Boolean noAuth;

    /** 参数列表 */
    private List<ParameterInfo> parameters;

    /** 响应类型 */
    private String responseType;

    /** 响应信息 */
    private ResponseInfo responseInfo;
}
```

#### 参数信息提取

系统会自动提取接口的参数信息:

```java
@Data
@Builder
public static class ParameterInfo {
    /** 参数名 */
    private String name;

    /** 参数类型 */
    private String type;

    /** 是否必填 */
    private Boolean required;

    /** 参数说明 */
    private String description;

    /** 参数位置 (PATH/QUERY/BODY) */
    private String location;

    /** 复杂对象的字段列表 */
    private List<FieldInfo> fields;
}
```

**参数位置:**
- `PATH`: 路径参数,如 `/user/{id}` 中的 `id`
- `QUERY`: 查询参数,如 `/user?name=xxx` 中的 `name`
- `BODY`: 请求体参数,通常用于 POST/PUT 请求

**示例:**

```java
@OpenApi("获取用户详情")
@GetMapping("/getUser/{id}")
public R<UserVo> getUser(
    @PathVariable Long id,              // PATH 参数
    @RequestParam String name,          // QUERY 参数
    @RequestBody UserBo user            // BODY 参数
) {
    // ...
}
```

扫描结果:

```json
{
  "path": "/system/user/getUser/{id}",
  "method": "GET",
  "parameters": [
    {
      "name": "id",
      "type": "Long",
      "required": true,
      "location": "PATH",
      "description": "用户ID"
    },
    {
      "name": "name",
      "type": "String",
      "required": true,
      "location": "QUERY",
      "description": "用户名"
    },
    {
      "name": "user",
      "type": "UserBo",
      "required": true,
      "location": "BODY",
      "description": "用户信息",
      "fields": [
        {
          "name": "userName",
          "type": "String",
          "required": true,
          "description": "用户账号"
        },
        {
          "name": "nickName",
          "type": "String",
          "required": false,
          "description": "用户昵称"
        }
      ]
    }
  ]
}
```

#### 响应信息提取

系统会自动提取接口的响应信息,包括泛型和字段详情:

```java
@Data
@Builder
public static class ResponseInfo {
    /** 完整类型 (如: R) */
    private String fullType;

    /** 泛型数据类型 (如: PageResult<UserVo>) */
    private String dataType;

    /** 字段列表 */
    private List<FieldInfo> fields;
}
```

**示例:**

```java
@OpenApi("查询用户列表")
@GetMapping("/list")
public R<PageResult<UserVo>> list(UserBo bo, PageQuery pageQuery) {
    // ...
}
```

扫描结果:

```json
{
  "responseType": "R",
  "responseInfo": {
    "fullType": "R",
    "dataType": "PageResult<UserVo>",
    "fields": [
      {
        "name": "userId",
        "type": "Long",
        "required": true,
        "description": "用户ID",
        "example": "1"
      },
      {
        "name": "userName",
        "type": "String",
        "required": true,
        "description": "用户账号",
        "example": "admin"
      }
    ]
  }
}
```

#### 字段信息

```java
@Data
@Builder
public static class FieldInfo {
    /** 字段名 */
    private String name;

    /** 字段类型 */
    private String type;

    /** 是否必填 */
    private Boolean required;

    /** 字段说明 */
    private String description;

    /** 示例值 */
    private String example;
}
```

**字段信息来源:**

系统从以下注解中提取字段信息:
- `@Schema`: Swagger/OpenAPI 注解,提供 `description` 和 `example`
- `@NotNull/@NotBlank/@NotEmpty`: 校验注解,标识必填字段
- `@JsonFormat`: 日期格式注解,自动生成日期示例值

**示例:**

```java
public class UserVo {
    @Schema(description = "用户ID", example = "1")
    @NotNull
    private Long userId;

    @Schema(description = "用户账号")
    @NotBlank
    private String userName;

    @Schema(description = "用户昵称")
    private String nickName;

    @Schema(description = "创建时间", example = "2024-01-01 12:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}
```

### 性能优化

OpenApiScanService 实现了多层缓存机制,提升扫描性能:

#### 1. 类缓存

```java
private final Map<String, Class<?>> classCache = new ConcurrentHashMap<>();
```

已解析的类会缓存在内存中,避免重复反射:

```java
private Class<?> resolveClass(String className) {
    // 优先从缓存获取
    if (classCache.containsKey(className)) {
        return classCache.get(className);
    }

    // 解析后缓存
    Class<?> clazz = Class.forName(className);
    classCache.put(className, clazz);
    return clazz;
}
```

#### 2. ClassPath 扫描缓存

```java
private volatile Set<BeanDefinition> classPathScanCache;
private volatile boolean classPathScanInitialized = false;
```

首次扫描时会缓存 ClassPath 扫描结果:

```java
private Class<?> scanAndResolveClass(String className) {
    // 首次调用时进行全量扫描并缓存
    if (!classPathScanInitialized) {
        synchronized (this) {
            if (!classPathScanInitialized) {
                log.info("开始扫描 ClassPath 中的 domain 类...");

                ClassPathScanningCandidateComponentProvider provider =
                    new ClassPathScanningCandidateComponentProvider(false);

                // 扫描 plus.ruoyi 包下的 domain 类
                provider.addIncludeFilter(new RegexPatternTypeFilter(
                    Pattern.compile(".*domain\\..*")));

                classPathScanCache = provider.findCandidateComponents("plus/ruoyi");
                classPathScanInitialized = true;

                log.info("ClassPath 扫描完成，找到 {} 个 domain 类",
                    classPathScanCache.size());
            }
        }
    }

    // 从缓存中查找
    for (BeanDefinition candidate : classPathScanCache) {
        String beanClassName = candidate.getBeanClassName();
        if (beanClassName != null && beanClassName.endsWith(className)) {
            return Class.forName(beanClassName);
        }
    }

    return null;
}
```

**性能提升:**
- 首次扫描耗时约 100-200ms
- 后续查询直接从缓存读取,耗时 < 1ms
- 避免每次都扫描整个 ClassPath

## 认证流程

### 完整认证流程

OpenAPI 拦截器 `OpenApiInterceptor` 的认证流程如下:

```
1. 检查是否为 Controller 方法
   ↓
2. 检查 @SaIgnore 注解 (跳过)
   ↓
3. 检查路径是否在排除列表 (跳过)
   ↓
4. 检查 @OpenApi 注解 (非开放接口跳过)
   ↓
5. 检查用户是否已登录 (已登录跳过)
   ↓
6. 检查开放平台是否启用
   ↓
7. 提取认证参数 (AppKey, Timestamp, Sign)
   ↓
8. 验证时间戳 (防重放攻击)
   ↓
9. 检查签名是否重复 (Redis缓存)
   ↓
10. 获取密钥信息 (从数据库/缓存)
    ↓
11. 检查密钥状态 (是否禁用)
    ↓
12. 检查过期时间
    ↓
13. 检查关联用户
    ↓
14. 检查IP白名单
    ↓
15. 验证签名
    ↓
16. 获取或创建 Token
    ↓
17. 注入 Token 到请求
    ↓
18. 设置租户上下文
    ↓
19. 缓存签名 (防重复)
    ↓
20. 异步更新调用统计
    ↓
21. 放行请求
```

### Token 管理

OpenAPI 使用 Token 缓存机制,为每个 AppKey 创建长期有效的 Token:

```java
private String getOrCreateToken(OpenApiVo apiInfo) {
    String tokenCacheKey = TOKEN_CACHE_PREFIX + apiInfo.getAppKey();

    // 1. 尝试从缓存获取已存在的 token
    String cachedToken = RedisUtils.getCacheObject(tokenCacheKey);

    // 2. 验证 token 是否仍然有效
    if (StringUtils.isNotBlank(cachedToken)) {
        if (!StpUtil.stpLogic.isFreeze(cachedToken)) {
            // Token 仍然有效
            return cachedToken;
        } else {
            // Token 已被冻结,删除缓存
            RedisUtils.deleteObject(tokenCacheKey);
            StpUtil.logoutByTokenValue(cachedToken);
        }
    }

    // 3. 创建新的登录会话
    LoginUser loginUser = TenantHelper.dynamic(apiInfo.getTenantId(), () ->
        openApiService.getLoginUserByUserId(apiInfo.getUserId())
    );

    if (ObjectUtil.isNull(loginUser)) {
        throw ServiceException.of("关联用户不存在或已禁用");
    }

    // 4. 执行登录
    UserType openapiUser = UserType.OPENAPI_USER;
    SaLoginParameter loginParameter = new SaLoginParameter();
    loginParameter.setDeviceType(openapiUser.getDeviceType());
    loginParameter.setTimeout(openapiUser.getTimeout());
    loginParameter.setActiveTimeout(openapiUser.getActiveTimeout());

    LoginHelper.login(loginUser, loginParameter);

    String newToken = StpUtil.getTokenValue();

    // 5. 缓存 token
    long activeTimeout = openapiUser.getActiveTimeout();
    long cacheTimeout = (long) (activeTimeout * 1.1);  // 增加 10% 缓冲

    RedisUtils.setCacheObject(tokenCacheKey, newToken,
        Duration.ofSeconds(cacheTimeout));

    return newToken;
}
```

**Token 缓存机制:**

- **缓存Key**: `openapi:token:{appKey}`
- **缓存时间**: `activeTimeout * 1.1` (增加10%缓冲)
- **自动续期**: Sa-Token 框架会在每次请求时自动刷新活跃时间
- **冻结检测**: 每次使用前检查 Token 是否被冻结

**用户类型配置:**

```java
public enum UserType {
    /**
     * OpenAPI 用户
     */
    OPENAPI_USER("openapi", "openapi端",
        2592000L,      // timeout: 30天
        1800L          // activeTimeout: 30分钟
    );
}
```

### 租户上下文

OpenAPI 支持多租户,会自动设置租户上下文:

```java
// 设置租户上下文
LoginUser loginUser = LoginHelper.getLoginUser(token);
if (loginUser != null && StringUtils.isNotBlank(loginUser.getTenantId())) {
    TenantHelper.setDynamic(loginUser.getTenantId());
}
```

**租户继承:**

密钥会继承关联用户的租户信息:

```java
// 创建密钥时
OpenApiVo apiInfo = new OpenApiVo();
apiInfo.setUserId(userId);
apiInfo.setTenantId(user.getTenantId());  // 继承用户租户

// 调用时使用租户上下文
LoginUser loginUser = TenantHelper.dynamic(apiInfo.getTenantId(), () ->
    openApiService.getLoginUserByUserId(apiInfo.getUserId())
);
```

## 密钥管理

### 生成密钥

#### 后台管理界面

1. 导航至 `系统管理` → `开放平台` → `API密钥`
2. 点击 `生成密钥` 按钮
3. 填写表单:
   - **应用名称**: 必填
   - **关联用户**: 可选,用于权限继承
   - **授权权限**: 树形选择器
   - **过期时间**: 可选
   - **IP白名单**: 可选,逗号分隔
   - **备注**: 可选
4. 提交后获取 AppKey 和 AppSecret

#### API 接口

```java
/**
 * 生成API密钥
 */
@SaCheckPermission("system:openapi:add")
@PostMapping("/generate")
public R<OpenApiVo> generate(@RequestBody OpenApiGenerateBo bo) {
    return R.ok(openApiService.generate(bo));
}
```

**请求参数:**

```json
{
  "appName": "第三方系统A",
  "userId": 1,
  "permissions": ["base:ad:query", "base:ad:add", "base:ad:update"],
  "expireTime": "2025-12-31 23:59:59",
  "whiteIps": "192.168.1.100,192.168.1.101",
  "remark": "用于第三方系统A访问广告接口"
}
```

**响应示例:**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "appName": "第三方系统A",
    "appKey": "d4c0ed4bc5b049c8a144109f60c8abb9",
    "appSecret": "fcfe7ade592c4fcb9e6b8ec9e7c3134d",
    "userId": 1,
    "tenantId": "000000",
    "permissions": ["base:ad:query", "base:ad:add", "base:ad:update"],
    "status": "1",
    "expireTime": "2025-12-31 23:59:59",
    "whiteIps": "192.168.1.100,192.168.1.101",
    "remark": "用于第三方系统A访问广告接口"
  }
}
```

**注意事项:**
- AppSecret 仅在生成时返回一次,请立即保存
- AppSecret 在数据库中加密存储,无法还原
- AppKey 在全局范围内唯一

### 更新密钥配置

```java
/**
 * 更新密钥配置
 */
@SaCheckPermission("system:openapi:update")
@PutMapping("/update")
public R<Void> update(@RequestBody OpenApiUpdateBo bo) {
    return R.status(openApiService.update(bo));
}
```

**可更新字段:**
- 应用名称 (`appName`)
- 授权权限 (`permissions`)
- 过期时间 (`expireTime`)
- IP白名单 (`whiteIps`)
- 备注 (`remark`)

**不可更新字段:**
- AppKey (`appKey`)
- AppSecret (`appSecret`)
- 关联用户 (`userId`)

**示例:**

```json
{
  "id": 1,
  "appName": "第三方系统A(更新)",
  "permissions": ["base:ad:query", "base:ad:add"],
  "expireTime": "2026-12-31 23:59:59",
  "whiteIps": "192.168.1.100,192.168.1.101,192.168.1.102",
  "remark": "更新权限和白名单"
}
```

### 重置密钥

当 AppSecret 丢失或泄露时,可以重置密钥:

```java
/**
 * 重置密钥(重新生成 AppSecret)
 */
@SaCheckPermission("system:openapi:update")
@PutMapping("/reset/{id}")
public R<String> reset(@PathVariable Long id) {
    String newAppSecret = openApiService.resetSecret(id);
    return R.ok(newAppSecret);
}
```

**响应示例:**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": "new_app_secret_value_xxxxxxxxxxxxxxxx"
}
```

**注意事项:**
- 重置后旧的 AppSecret 立即失效
- 新的 AppSecret 仅显示一次
- 需要通知客户端更新密钥

### 启用/禁用密钥

```java
/**
 * 修改密钥状态
 */
@SaCheckPermission("system:openapi:update")
@PutMapping("/updateStatus")
public R<Void> updateStatus(@RequestBody OpenApiStatusBo bo) {
    return R.status(openApiService.updateStatus(bo.getId(), bo.getStatus()));
}
```

**状态值:**
- `1`: 启用
- `0`: 禁用

**示例:**

```json
{
  "id": 1,
  "status": "0"  // 禁用密钥
}
```

**禁用效果:**
- 立即生效
- 使用该密钥的请求会被拒绝
- 错误信息: "API密钥已禁用"

### 删除密钥

```java
/**
 * 删除密钥
 */
@SaCheckPermission("system:openapi:delete")
@DeleteMapping("/{ids}")
public R<Void> delete(@PathVariable Long[] ids) {
    return R.status(openApiService.batchDelete(List.of(ids)));
}
```

**注意事项:**
- 删除操作不可恢复
- 删除后立即失效
- 建议先禁用测试,确认无影响后再删除

### 查看调用统计

系统会自动记录每个密钥的调用统计:

```java
/**
 * 查询密钥列表
 */
@SaCheckPermission("system:openapi:query")
@GetMapping("/list")
public R<PageResult<OpenApiVo>> list(OpenApiQuery query, PageQuery pageQuery) {
    return R.ok(openApiService.page(query, pageQuery));
}
```

**统计信息:**

```json
{
  "id": 1,
  "appName": "第三方系统A",
  "appKey": "d4c0ed4bc5b049c8a144109f60c8abb9",
  "callCount": 12345,
  "lastCallTime": "2025-11-10 15:30:00",
  "status": "1",
  "createTime": "2025-01-01 10:00:00"
}
```

**统计字段:**
- `callCount`: 总调用次数
- `lastCallTime`: 最后调用时间

**更新机制:**

```java
// 异步更新调用统计
CompletableFuture.runAsync(() -> openApiService.recordCall(appKey));
```

统计更新采用异步方式,不影响接口响应性能。

## 配置详解

### OpenApiProperties

```java
@ConfigurationProperties(prefix = "openapi")
public class OpenApiProperties {

    /**
     * 是否启用开放平台
     */
    private Boolean enabled = false;

    /**
     * 时间戳过期时间(秒)
     */
    private Integer timestampExpireSeconds = 60;

    /**
     * 每个用户最大密钥数量
     */
    private Integer maxKeys = 5;

    /**
     * AppSecret加密密钥
     */
    private String secretEncryptKey;

    /**
     * 访问控制配置
     */
    private AccessControl accessControl = new AccessControl();

    @Data
    public static class AccessControl {
        /**
         * 访问模式
         */
        private AccessMode mode = AccessMode.ALL;

        /**
         * 允许的角色列表
         */
        private List<String> allowedRoles = new ArrayList<>();
    }

    public enum AccessMode {
        /** 所有用户 */
        ALL,
        /** 指定角色 */
        ROLES,
        /** 仅管理员 */
        ADMIN,
        /** 仅超管 */
        SUPER_ADMIN
    }
}
```

### 配置项说明

#### enabled

- **类型**: `Boolean`
- **默认值**: `false`
- **说明**: 开放平台总开关
- **环境变量**: `OPEN_API_ENABLED`

```yaml
openapi:
  enabled: true
```

#### timestampExpireSeconds

- **类型**: `Integer`
- **默认值**: `60`
- **单位**: 秒
- **说明**: 时间戳有效期,用于防重放攻击
- **建议值**: 30-120秒

```yaml
openapi:
  timestamp-expire-seconds: 60
```

**影响:**
- 值越小,安全性越高,但对时间同步要求越严格
- 值越大,对时间同步要求越宽松,但安全性降低

#### maxKeys

- **类型**: `Integer`
- **默认值**: `5`
- **说明**: 每个用户最多可创建的密钥数量
- **建议值**: 3-10

```yaml
openapi:
  max-keys: 5
```

**作用:**
- 防止密钥滥用
- 限制资源占用

#### secretEncryptKey

- **类型**: `String`
- **必填**: 是
- **长度**: 32字节
- **说明**: AppSecret 加密密钥,用于 AES-256 加密
- **环境变量**: `OPEN_API_SECRET_KEY`

```yaml
openapi:
  secret-encrypt-key: q3XA19UeJExvCqynPOnyYUcr4zwOVCyi
```

**注意事项:**
- 必须是32字节(32个字符)
- 项目运营后不要更改,否则之前的密钥无法解密
- 建议使用随机生成的强密钥
- 生产环境建议使用环境变量配置

#### accessControl.mode

- **类型**: `AccessMode`
- **默认值**: `ALL`
- **可选值**: `ALL | ROLES | ADMIN | SUPER_ADMIN`
- **说明**: 访问控制模式
- **环境变量**: `OPEN_API_ACCESS_MODE`

```yaml
openapi:
  access-control:
    mode: all
```

**模式说明:**
- `ALL`: 所有登录用户都可以创建和管理密钥
- `ROLES`: 仅指定角色的用户可以访问
- `ADMIN`: 仅管理员可以访问
- `SUPER_ADMIN`: 仅超级管理员可以访问

#### accessControl.allowedRoles

- **类型**: `List<String>`
- **默认值**: `[]`
- **说明**: 允许访问的角色列表(当 mode=ROLES 时生效)
- **环境变量**: `OPEN_API_ALLOWED_ROLES` (逗号分隔)

```yaml
openapi:
  access-control:
    mode: roles
    allowed-roles: admin,pc_user,api_manager
```

### 完整配置示例

```yaml
################## 开放平台配置 ##################
openapi:
  # 是否启用开放平台
  enabled: ${OPEN_API_ENABLED:true}

  # 时间戳过期时间(秒) 用于防重放攻击
  timestamp-expire-seconds: 60

  # 每个用户最大密钥数量
  max-keys: 5

  # AppSecret加密密钥（AES-256需要32字节）
  # 项目运营中再更换会导致之前的加密无法解密
  secret-encrypt-key: ${OPEN_API_SECRET_KEY:q3XA19UeJExvCqynPOnyYUcr4zwOVCyi}

  # 访问控制配置
  access-control:
    # 访问模式: all(所有用户) | roles(指定角色) | admin(仅管理员) | super_admin(仅超管)
    mode: ${OPEN_API_ACCESS_MODE:all}
    # 允许访问的角色列表(当mode=roles时生效,多个用逗号分隔)
    allowed-roles: ${OPEN_API_ALLOWED_ROLES:admin,pc_user}
```

## 最佳实践

### 1. 密钥管理规范

**定期轮换密钥**

建议每3-6个月轮换一次密钥:

```java
// 1. 生成新密钥
OpenApiVo newKey = openApiService.generate(generateBo);

// 2. 通知客户端更新
notifyClient(newKey.getAppKey(), newKey.getAppSecret());

// 3. 设置旧密钥过期时间(给客户端预留更新时间)
openApiService.updateExpireTime(oldKeyId,
    DateUtils.addDays(new Date(), 30));

// 4. 30天后删除旧密钥
schedule(() -> openApiService.delete(oldKeyId), 30, DAYS);
```

**权限最小化原则**

只授予必要的权限:

```json
{
  "appName": "统计系统",
  "permissions": [
    "system:user:query",    // 只读权限
    "system:dept:query"
  ]
  // 不授予新增、修改、删除权限
}
```

**使用IP白名单**

为固定IP的客户端配置白名单:

```json
{
  "appName": "服务器A",
  "whiteIps": "192.168.1.100,192.168.1.101"
}
```

**设置合理的过期时间**

根据业务需求设置密钥有效期:

```json
{
  "appName": "临时测试密钥",
  "expireTime": "2025-12-31 23:59:59"  // 测试结束后自动失效
}
```

### 2. 客户端实现规范

**封装认证逻辑**

将认证逻辑封装为独立的客户端类:

```java
public class OpenApiClient {
    private final String baseUrl;
    private final String appKey;
    private final String appSecret;
    private final HttpClient httpClient;

    public OpenApiClient(String baseUrl, String appKey, String appSecret) {
        this.baseUrl = baseUrl;
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * GET 请求
     */
    public <T> T get(String path, Class<T> responseType) {
        return request("GET", path, null, responseType);
    }

    /**
     * POST 请求
     */
    public <T> T post(String path, Object body, Class<T> responseType) {
        return request("POST", path, body, responseType);
    }

    /**
     * 通用请求方法
     */
    private <T> T request(String method, String path,
                          Object body, Class<T> responseType) {
        // 1. 生成签名
        long timestamp = System.currentTimeMillis();
        String sign = generateSign(timestamp);

        // 2. 构建请求
        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("Content-Type", "application/json")
            .header("X-App-Key", appKey)
            .header("X-Timestamp", String.valueOf(timestamp))
            .header("X-Sign", sign);

        if ("POST".equals(method) && body != null) {
            String json = JSON.toJSONString(body);
            builder.method(method, HttpRequest.BodyPublishers.ofString(json));
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }

        // 3. 发送请求
        try {
            HttpResponse<String> response = httpClient.send(
                builder.build(),
                HttpResponse.BodyHandlers.ofString()
            );
            return JSON.parseObject(response.body(), responseType);
        } catch (Exception e) {
            throw new RuntimeException("请求失败", e);
        }
    }

    private String generateSign(long timestamp) {
        String content = appKey + timestamp + appSecret;
        return DigestUtil.md5Hex(content);
    }
}
```

**使用示例:**

```java
OpenApiClient client = new OpenApiClient(
    "http://localhost:5500",
    "d4c0ed4bc5b049c8a144109f60c8abb9",
    "fcfe7ade592c4fcb9e6b8ec9e7c3134d"
);

// 查询广告列表
R<PageResult<AdVo>> result = client.get(
    "/base/ad/pageAds",
    new TypeReference<R<PageResult<AdVo>>>() {}
);

// 添加广告
AdBo ad = new AdBo();
ad.setAdName("测试广告");
R<Long> addResult = client.post(
    "/base/ad/addAd",
    ad,
    new TypeReference<R<Long>>() {}
);
```

**实现重试机制**

```java
public class RetryableOpenApiClient extends OpenApiClient {
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000;

    @Override
    protected <T> T request(String method, String path,
                           Object body, Class<T> responseType) {
        int retries = 0;
        Exception lastException = null;

        while (retries < MAX_RETRIES) {
            try {
                return super.request(method, path, body, responseType);
            } catch (Exception e) {
                lastException = e;
                retries++;

                if (retries < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * retries);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        throw new RuntimeException("请求失败,已重试" + MAX_RETRIES + "次",
            lastException);
    }
}
```

**实现请求日志**

```java
public class LoggingOpenApiClient extends OpenApiClient {
    private static final Logger log = LoggerFactory.getLogger(
        LoggingOpenApiClient.class);

    @Override
    protected <T> T request(String method, String path,
                           Object body, Class<T> responseType) {
        long startTime = System.currentTimeMillis();

        log.info("OpenAPI 请求: {} {}", method, path);
        if (body != null) {
            log.debug("请求体: {}", JSON.toJSONString(body));
        }

        try {
            T response = super.request(method, path, body, responseType);
            long duration = System.currentTimeMillis() - startTime;
            log.info("OpenAPI 响应成功: {} {} (耗时: {}ms)",
                method, path, duration);
            return response;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("OpenAPI 请求失败: {} {} (耗时: {}ms)",
                method, path, duration, e);
            throw e;
        }
    }
}
```

### 3. 安全加固建议

**使用 HTTPS**

生产环境必须使用 HTTPS 传输:

```java
// 客户端配置
SSLContext sslContext = SSLContext.getInstance("TLS");
sslContext.init(null, trustAllCerts, new SecureRandom());

HttpClient client = HttpClient.newBuilder()
    .sslContext(sslContext)
    .build();
```

**敏感信息脱敏**

日志中不要输出完整的 AppSecret 和签名:

```java
log.info("请求签名: {}...{}",
    sign.substring(0, 4),
    sign.substring(sign.length() - 4));
```

**设置请求超时**

```java
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))
    .build();
```

**验证响应签名**

对于关键接口,服务器也可以对响应进行签名:

```java
public R<T> response(T data) {
    long timestamp = System.currentTimeMillis();
    String sign = generateResponseSign(data, timestamp);

    return R.ok(data)
        .put("timestamp", timestamp)
        .put("sign", sign);
}
```

### 4. 性能优化建议

**密钥信息缓存**

```java
@Cacheable(value = "openapi", key = "#appKey", unless = "#result == null")
public OpenApiVo getByAppKey(String appKey) {
    return openApiMapper.selectByAppKey(appKey);
}
```

**Redis 缓存配置:**

```yaml
spring:
  cache:
    redis:
      time-to-live: 3600000  # 1小时
```

**使用连接池**

```java
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .executor(Executors.newFixedThreadPool(10))
    .build();
```

**异步调用统计**

```java
@Async
public void recordCall(String appKey) {
    openApiMapper.incrementCallCount(appKey);
    openApiMapper.updateLastCallTime(appKey, new Date());
}
```

**批量查询优化**

```java
// 一次性获取所有权限信息
List<String> permissions = permissionService.getPermissionsByUserId(userId);

// 批量检查权限
boolean hasPermission = permissions.containsAll(requiredPermissions);
```

### 5. 监控与告警

**调用统计监控**

```java
@Scheduled(cron = "0 0 * * * ?")  // 每小时执行
public void monitorApiCalls() {
    List<OpenApiVo> highFrequencyKeys = openApiMapper
        .selectHighFrequencyKeys(1000);  // 每小时超过1000次

    for (OpenApiVo key : highFrequencyKeys) {
        log.warn("密钥 {} 调用频率异常: {} 次/小时",
            key.getAppKey(), key.getCallCount());

        // 发送告警
        alertService.send("OpenAPI高频调用告警",
            String.format("密钥 %s 调用频率异常", key.getAppName()));
    }
}
```

**异常监控**

```java
@Aspect
@Component
public class OpenApiMonitorAspect {

    @Around("@annotation(plus.ruoyi.common.openapi.annotation.OpenApi)")
    public Object monitor(ProceedingJoinPoint pjp) throws Throwable {
        long startTime = System.currentTimeMillis();
        String appKey = getAppKeyFromRequest();

        try {
            Object result = pjp.proceed();
            long duration = System.currentTimeMillis() - startTime;

            // 记录成功调用
            metricsService.recordSuccess(appKey, duration);

            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;

            // 记录失败调用
            metricsService.recordFailure(appKey, e.getClass().getSimpleName());

            throw e;
        }
    }
}
```

**设置告警规则**

```yaml
openapi:
  alert:
    # 单个密钥每小时最大调用次数
    max-calls-per-hour: 10000
    # 失败率阈值
    failure-rate-threshold: 0.05
    # 平均响应时间阈值(毫秒)
    avg-response-time-threshold: 1000
```

## 常见问题

### 1. 签名验证失败

**问题原因:**
- 签名计算错误
- 时间戳格式错误
- AppSecret 不正确
- 字符编码问题

**解决方案:**

检查签名计算逻辑:

```java
// 正确的签名计算方式
String appKey = "d4c0ed4bc5b049c8a144109f60c8abb9";
String appSecret = "fcfe7ade592c4fcb9e6b8ec9e7c3134d";
long timestamp = 1609459200000L;  // 注意是毫秒

String content = appKey + timestamp + appSecret;
String sign = DigestUtil.md5Hex(content);

System.out.println("签名内容: " + content);
System.out.println("签名结果: " + sign);
```

**调试建议:**

1. 打印签名内容,确认拼接顺序正确
2. 确认时间戳是毫秒,不是秒
3. 确认 MD5 结果是32位小写
4. 确认使用UTF-8编码

### 2. 请求已过期

**问题原因:**
- 客户端与服务器时间不同步
- 时间戳单位错误(秒/毫秒)

**解决方案:**

同步系统时间:

```bash
# Linux/Mac
sudo ntpdate time.apple.com

# Windows
w32tm /resync
```

确认时间戳单位:

```java
// 正确: 毫秒时间戳
long timestamp = System.currentTimeMillis();  // 1609459200000

// 错误: 秒时间戳
long timestamp = System.currentTimeMillis() / 1000;  // 1609459200
```

### 3. 请求重复

**问题原因:**
- 使用了相同的时间戳和签名
- 签名在60秒内被重复使用

**解决方案:**

每次请求都生成新的时间戳:

```java
// 正确: 每次请求都生成新时间戳
public void callApi() {
    long timestamp = System.currentTimeMillis();  // 每次都是新的
    String sign = generateSign(timestamp);
    // ...
}

// 错误: 重复使用相同的时间戳
long timestamp = System.currentTimeMillis();
for (int i = 0; i < 10; i++) {
    String sign = generateSign(timestamp);  // 相同的时间戳
    callApi(sign);  // 第二次开始会报错
}
```

### 4. IP地址不在白名单中

**问题原因:**
- 客户端IP不在白名单内
- 配置的IP格式错误
- 通过代理访问,实际IP与配置不符

**解决方案:**

获取真实客户端IP:

```java
String clientIp = ServletUtils.getClientIP();
log.info("客户端IP: {}", clientIp);
```

检查白名单配置:

```json
{
  "whiteIps": "192.168.1.100,192.168.1.101"  // 逗号分隔,不要有空格
}
```

如果通过代理访问,配置代理服务器的转发IP:

```bash
# Nginx 配置
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

### 5. API密钥已禁用

**问题原因:**
- 密钥被管理员禁用
- 密钥已过期

**解决方案:**

检查密钥状态:

```sql
SELECT status, expire_time
FROM sys_openapi
WHERE app_key = 'd4c0ed4bc5b049c8a144109f60c8abb9';
```

在管理后台重新启用密钥:

```
系统管理 → 开放平台 → API密钥 → 编辑 → 修改状态为"启用"
```

### 6. 无效的AppKey

**问题原因:**
- AppKey 不存在
- AppKey 拼写错误
- AppKey 已被删除

**解决方案:**

检查 AppKey 是否存在:

```sql
SELECT * FROM sys_openapi WHERE app_key = 'd4c0ed4bc5b049c8a144109f60c8abb9';
```

确认 AppKey 拼写正确:

```java
String appKey = "d4c0ed4bc5b049c8a144109f60c8abb9";  // 32位小写字母和数字
```

### 7. 缺少认证参数

**问题原因:**
- 请求头或URL参数缺少 AppKey、Timestamp 或 Sign
- 参数名拼写错误

**解决方案:**

检查请求头:

```bash
curl -v -X GET "http://localhost:5500/base/ad/pageAds" \
  -H "X-App-Key: d4c0ed4bc5b049c8a144109f60c8abb9" \
  -H "X-Timestamp: 1609459200000" \
  -H "X-Sign: e10adc3949ba59abbe56e057f20f883e"
```

**参数名必须完全匹配:**
- 请求头: `X-App-Key`, `X-Timestamp`, `X-Sign`
- URL参数: `appKey`, `timestamp`, `sign`

### 8. 关联用户不存在或已禁用

**问题原因:**
- 密钥关联的用户被删除
- 用户被禁用

**解决方案:**

检查关联用户状态:

```sql
SELECT u.user_id, u.user_name, u.status
FROM sys_openapi o
LEFT JOIN sys_user u ON o.user_id = u.user_id
WHERE o.app_key = 'd4c0ed4bc5b049c8a144109f60c8abb9';
```

重新关联有效用户:

```java
openApiService.updateUserId(apiId, newUserId);
```

### 9. 权限不足

**问题原因:**
- 密钥没有被授予接口权限
- 关联用户没有接口权限

**解决方案:**

检查密钥权限:

```sql
SELECT permissions FROM sys_openapi
WHERE app_key = 'd4c0ed4bc5b049c8a144109f60c8abb9';
```

在管理后台更新权限:

```
系统管理 → 开放平台 → API密钥 → 编辑 → 授权权限
```

检查接口权限要求:

```java
@OpenApi("用户查询接口")
@SaCheckPermission("system:user:query")  // 需要此权限
@GetMapping("/list")
public R<List<SysUserVo>> list() {
    // ...
}
```

### 10. 性能问题

**问题现象:**
- OpenAPI 接口响应慢
- 大量请求时性能下降

**优化方案:**

**1. 启用密钥缓存:**

```java
@Cacheable(value = "openapi", key = "#appKey")
public OpenApiVo getByAppKey(String appKey) {
    return openApiMapper.selectByAppKey(appKey);
}
```

**2. 使用 Redis 缓存:**

```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # 1小时
```

**3. 异步记录统计:**

```java
@Async
public void recordCall(String appKey) {
    openApiMapper.incrementCallCount(appKey);
}
```

**4. 数据库索引优化:**

```sql
-- 在 app_key 字段创建唯一索引
CREATE UNIQUE INDEX uk_app_key ON sys_openapi(app_key);

-- 在 status 和 expire_time 创建联合索引
CREATE INDEX idx_status_expire ON sys_openapi(status, expire_time);
```

**5. 使用连接池:**

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
```
