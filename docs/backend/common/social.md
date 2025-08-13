# 社交登录 (social) 

## 概述

社会化登录模块（ruoyi-common-social）是基于Ruoyi-Plus-Uniapp框架的第三方平台账号认证与登录功能模块。该模块提供了统一的社交平台登录认证接口，支持多种主流社交平台的OAuth2.0认证流程。

## 模块架构

### 核心组件

- **SocialUtils**: 社交登录认证工具类，提供统一的第三方登录认证接口
- **AuthRedisStateCache**: Redis实现的授权状态缓存，用于存储OAuth认证过程中的状态信息
- **SocialAutoConfiguration**: 社交登录自动配置类，管理相关Bean的创建和配置

### 自定义实现

模块扩展了JustAuth框架，实现了以下自定义社交平台认证：

- **MaxKey**: 企业级身份认证管理系统
- **TopIAM**: 身份管理平台
- **Gitea**: 自建Git服务器

## 技术依赖

### 内部模块依赖

```xml
<!-- JSON模块 - 提供数据序列化支持 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-json</artifactId>
</dependency>

<!-- Redis模块 - 提供缓存与会话存储 -->
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-redis</artifactId>
</dependency>
```

### 第三方依赖

```xml
<!-- JustAuth - 提供第三方登录集成框架 -->
<dependency>
    <groupId>me.zhyd.oauth</groupId>
    <artifactId>JustAuth</artifactId>
</dependency>
```

## 支持的社交平台

### 国内平台

| 平台 | 标识符 | 描述 |
|------|--------|------|
| 钉钉 | dingtalk | 企业办公平台 |
| 百度 | baidu | 百度账号登录 |
| Gitee | gitee | 国内Git代码托管平台 |
| 微博 | weibo | 新浪微博 |
| Coding | coding | 代码托管平台 |
| 开源中国 | oschina | OSChina社区 |
| 支付宝 | alipay_wallet | 支付宝钱包登录 |
| QQ | qq | 腾讯QQ登录 |
| 微信开放平台 | wechat_open | 微信开放平台登录 |
| 淘宝 | taobao | 淘宝账号登录 |
| 抖音 | douyin | 抖音账号登录 |
| 华为 | huawei | 华为账号登录 |
| 企业微信 | wechat_enterprise | 企业微信登录 |
| 微信公众号 | wechat_mp | 微信公众号登录 |
| 阿里云 | aliyun | 阿里云账号登录 |

### 国外平台

| 平台 | 标识符 | 描述 |
|------|--------|------|
| GitHub | github | GitHub代码托管平台 |
| LinkedIn | linkedin | 职业社交网络 |
| Microsoft | microsoft | 微软账号 |
| 人人网 | renren | 人人网（已停服） |
| StackOverflow | stack_overflow | 程序员问答社区 |
| GitLab | gitlab | GitLab代码托管平台 |

### 自建/企业平台

| 平台 | 标识符 | 描述 |
|------|--------|------|
| MaxKey | maxkey | 企业级身份认证管理系统 |
| TopIAM | topiam | 身份管理平台 |
| Gitea | gitea | 自建Git服务器 |

## 配置方式

### application.yml配置示例

```yaml
justauth:
  type:
    # GitHub配置
    github:
      client-id: your_github_client_id
      client-secret: your_github_client_secret
      redirect-uri: http://localhost:8080/auth/callback/github
      scopes:
        - user:email
        - read:user
    
    # 企业微信配置
    wechat_enterprise:
      client-id: your_corp_id
      client-secret: your_corp_secret
      redirect-uri: http://localhost:8080/auth/callback/wechat_enterprise
      agent-id: your_agent_id
    
    # MaxKey配置
    maxkey:
      client-id: your_maxkey_client_id
      client-secret: your_maxkey_client_secret
      redirect-uri: http://localhost:8080/auth/callback/maxkey
      server-url: https://your-maxkey-server.com
    
    # TopIAM配置
    topiam:
      client-id: your_topiam_client_id
      client-secret: your_topiam_client_secret
      redirect-uri: http://localhost:8080/auth/callback/topiam
      server-url: https://your-topiam-server.com
      scopes:
        - openid
        - profile
        - email
    
    # Gitea配置
    gitea:
      client-id: your_gitea_client_id
      client-secret: your_gitea_client_secret
      redirect-uri: http://localhost:8080/auth/callback/gitea
      server-url: https://your-gitea-server.com
```

### 配置参数说明

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| client-id | String | 是 | 应用ID/客户端ID |
| client-secret | String | 是 | 应用密钥/客户端密钥 |
| redirect-uri | String | 是 | 授权回调地址 |
| scopes | List&lt;String&gt; | 否 | OAuth授权范围 |
| agent-id | String | 否 | 企业微信应用ID |
| server-url | String | 否 | 自建服务器地址（MaxKey/TopIAM/Gitea） |
| alipay-public-key | String | 否 | 支付宝公钥 |
| stack-overflow-key | String | 否 | StackOverflow API密钥 |

## 使用方法

### 基础用法

```java
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private SocialProperties socialProperties;
    
    /**
     * 获取授权URL
     */
    @GetMapping("/authorize/{source}")
    public String authorize(@PathVariable String source) {
        AuthRequest authRequest = SocialUtils.getAuthRequest(source, socialProperties);
        return authRequest.authorize(AuthStateUtils.createState());
    }
    
    /**
     * 登录回调处理
     */
    @GetMapping("/callback/{source}")
    public AuthResponse<AuthUser> login(@PathVariable String source,
                                      @RequestParam String code,
                                      @RequestParam String state) {
        return SocialUtils.loginAuth(source, code, state, socialProperties);
    }
}
```

### 高级用法

#### 自定义状态缓存

```java
@Configuration
public class CustomSocialConfig {
    
    @Bean
    @Primary
    public AuthStateCache customAuthStateCache() {
        return new CustomAuthStateCache();
    }
}

public class CustomAuthStateCache implements AuthStateCache {
    // 实现自定义缓存逻辑
}
```

#### 扩展新的社交平台

```java
// 1. 定义认证源
public enum AuthCustomSource implements AuthSource {
    CUSTOM {
        @Override
        public String authorize() {
            return "https://custom-platform.com/oauth/authorize";
        }
        
        @Override
        public String accessToken() {
            return "https://custom-platform.com/oauth/token";
        }
        
        @Override
        public String userInfo() {
            return "https://custom-platform.com/api/user";
        }
        
        @Override
        public Class<? extends AuthDefaultRequest> getTargetClass() {
            return AuthCustomRequest.class;
        }
    }
}

// 2. 实现认证请求
public class AuthCustomRequest extends AuthDefaultRequest {
    
    public AuthCustomRequest(AuthConfig config, AuthStateCache authStateCache) {
        super(config, AuthCustomSource.CUSTOM, authStateCache);
    }
    
    @Override
    public AuthToken getAccessToken(AuthCallback authCallback) {
        // 实现获取访问令牌逻辑
    }
    
    @Override
    public AuthUser getUserInfo(AuthToken authToken) {
        // 实现获取用户信息逻辑
    }
}

// 3. 在SocialUtils中添加对应的case
```

## 状态缓存机制

### Redis状态缓存

模块使用Redis作为OAuth认证过程中的状态缓存存储，防止CSRF攻击：

```java
@Component
public class AuthRedisStateCache implements AuthStateCache {
    
    /**
     * 默认过期时间：3分钟
     */
    private static final Duration DEFAULT_TIMEOUT = Duration.ofMinutes(3);
    
    @Override
    public void cache(String key, String value) {
        RedisUtils.setCacheObject(GlobalConstants.SOCIAL_AUTH_CODE_KEY + key, value, DEFAULT_TIMEOUT);
    }
    
    @Override
    public String get(String key) {
        return RedisUtils.getCacheObject(GlobalConstants.SOCIAL_AUTH_CODE_KEY + key);
    }
    
    @Override
    public boolean containsKey(String key) {
        return RedisUtils.hasKey(GlobalConstants.SOCIAL_AUTH_CODE_KEY + key);
    }
}
```

### 缓存键规则

- **前缀**: `GlobalConstants.SOCIAL_AUTH_CODE_KEY`
- **格式**: `social_auth_code:{state}`
- **过期时间**: 3分钟（可配置）

## 自定义实现详解

### MaxKey集成

MaxKey是企业级身份认证管理系统，支持标准OAuth2.0协议：

```java
public class AuthMaxKeyRequest extends AuthDefaultRequest {
    
    // 服务器地址从配置文件读取
    public static final String SERVER_URL = SpringUtils.getProperty("justauth.type.maxkey.server-url");
    
    @Override
    public AuthToken getAccessToken(AuthCallback authCallback) {
        // 实现标准OAuth2.0授权码模式
    }
    
    @Override
    public AuthUser getUserInfo(AuthToken authToken) {
        // 获取用户详细信息
    }
}
```

### TopIAM集成

TopIAM是身份管理平台，使用Basic认证方式：

```java
public class AuthTopIamRequest extends AuthDefaultRequest {
    
    @Override
    protected String doPostAuthorizationCode(String code) {
        // 使用Basic认证方式发送客户端凭证
        return HttpRequest.post(source.accessToken())
            .header("Authorization", "Basic " + Base64.encode(
                String.format("%s:%s", config.getClientId(), config.getClientSecret())))
            .form("grant_type", "authorization_code")
            .form("code", code)
            .form("redirect_uri", config.getRedirectUri())
            .execute()
            .body();
    }
}
```

### Gitea集成

Gitea是轻量级的自建Git服务器，支持OAuth2.0认证：

```java
public class AuthGiteaRequest extends AuthDefaultRequest {
    
    @Override
    protected String doPostAuthorizationCode(String code) {
        // 发送表单数据获取访问令牌
        return HttpRequest.post(source.accessToken())
            .form("client_id", config.getClientId())
            .form("client_secret", config.getClientSecret())
            .form("grant_type", "authorization_code")
            .form("code", code)
            .form("redirect_uri", config.getRedirectUri())
            .execute()
            .body();
    }
}
```

## 错误处理

### 异常类型

- **AuthException**: JustAuth框架的认证异常
- **配置异常**: 当平台类型不支持或配置缺失时抛出

### 错误响应格式

```json
{
    "error": "invalid_grant",
    "error_description": "授权码无效或已过期"
}
```

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 不支持的第三方登录类型 | 配置文件中未配置对应平台 | 检查application.yml配置 |
| 授权码无效 | code参数错误或已过期 | 重新获取授权码 |
| 回调地址不匹配 | redirect_uri参数与配置不一致 | 检查回调地址配置 |
| 客户端认证失败 | client_id或client_secret错误 | 检查应用凭证配置 |

## 安全考虑

### CSRF防护

- 使用state参数防止CSRF攻击
- state值存储在Redis中，设置合理的过期时间
- 回调时验证state参数的有效性

### 数据传输安全

- 强制使用HTTPS协议进行OAuth认证
- 敏感信息（如client_secret）不在前端暴露
- 访问令牌具有时效性，支持刷新机制

### 权限控制

- 按需申请OAuth授权范围（scopes）
- 定期轮换应用凭证
- 监控异常登录行为

## 性能优化

### 缓存策略

- 使用Redis缓存认证状态，减少数据库查询
- 合理设置缓存过期时间，平衡安全性和性能
- 考虑使用连接池优化Redis连接

### 异步处理

```java
@Async("socialAuthExecutor")
public CompletableFuture<AuthUser> getUserInfoAsync(AuthToken authToken, String source) {
    return CompletableFuture.supplyAsync(() -> {
        AuthRequest authRequest = SocialUtils.getAuthRequest(source, socialProperties);
        return authRequest.getUserInfo(authToken);
    });
}
```

## 监控与日志

### 日志配置

```yaml
logging:
  level:
    plus.ruoyi.common.social: DEBUG
    me.zhyd.oauth: INFO
```

### 关键指标监控

- 认证成功率
- 认证响应时间
- 各平台使用频率
- 异常发生频率

## 部署注意事项

### 环境配置

1. **开发环境**: 可使用localhost回调地址（支付宝除外）
2. **生产环境**: 必须使用正式域名和HTTPS协议
3. **内网部署**: 确保能访问第三方平台的OAuth接口

### 回调地址配置

各平台的回调地址必须在对应的开发者控制台中预先配置：

- GitHub: Settings > Developer settings > OAuth Apps
- 微信: 微信开放平台 > 管理中心 > 网站应用
- 企业微信: 企业微信后台 > 应用管理 > 自建应用

## 故障排查

### 调试步骤

1. **检查配置**: 验证application.yml中的配置是否正确
2. **网络连通性**: 确认能正常访问第三方平台接口
3. **日志分析**: 查看DEBUG级别的日志，定位具体错误
4. **状态验证**: 检查Redis中的state缓存是否正常

### 调试工具

```java
@RestController
@RequestMapping("/debug")
public class SocialDebugController {
    
    @GetMapping("/config/{source}")
    public Object getConfig(@PathVariable String source) {
        return socialProperties.getType().get(source);
    }
    
    @GetMapping("/state/{state}")
    public Object getState(@PathVariable String state) {
        return RedisUtils.getCacheObject(GlobalConstants.SOCIAL_AUTH_CODE_KEY + state);
    }
}
```
