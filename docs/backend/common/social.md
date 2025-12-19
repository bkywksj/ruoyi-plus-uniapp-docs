# 社交登录 (social)

## 模块概述

社会化登录模块（ruoyi-common-social）是基于 RuoYi-Plus 框架的第三方平台账号认证与登录功能模块。该模块基于 JustAuth 框架构建，提供统一的社交平台登录认证接口，支持 30+ 种主流社交平台的 OAuth2.0 认证流程，并扩展实现了 MaxKey、TopIAM、Gitea 等企业级身份认证平台的集成。

**核心特性：**

- **统一认证接口** - 通过 SocialUtils 工具类提供统一的第三方登录 API
- **多平台支持** - 支持国内外 30+ 种社交平台和企业认证系统
- **状态缓存** - 基于 Redis 的 OAuth 状态缓存，有效防止 CSRF 攻击
- **自动配置** - Spring Boot 自动配置，开箱即用
- **可扩展性** - 支持自定义扩展新的认证平台

## 模块架构

### 目录结构

```
ruoyi-common-social/
├── src/main/java/
│   ├── me/zhyd/oauth/request/           # JustAuth 扩展请求
│   │   ├── AbstractAuthWeChatEnterpriseRequest.java  # 企业微信基类
│   │   └── AuthDingTalkV2Request.java   # 钉钉V2认证
│   └── plus/ruoyi/common/social/
│       ├── config/
│       │   ├── SocialAutoConfiguration.java      # 自动配置类
│       │   └── properties/
│       │       ├── SocialProperties.java         # 主配置属性
│       │       └── SocialLoginConfigProperties.java  # 登录配置属性
│       ├── gitea/                        # Gitea 平台实现
│       │   ├── AuthGiteaRequest.java     # Gitea 认证请求
│       │   └── AuthGiteaSource.java      # Gitea 接口配置
│       ├── maxkey/                       # MaxKey 平台实现
│       │   ├── AuthMaxKeyRequest.java    # MaxKey 认证请求
│       │   └── AuthMaxKeySource.java     # MaxKey 接口配置
│       ├── topiam/                       # TopIAM 平台实现
│       │   ├── AuthTopIamRequest.java    # TopIAM 认证请求
│       │   └── AuthTopIamSource.java     # TopIAM 接口配置
│       └── utils/
│           ├── SocialUtils.java          # 社交登录工具类
│           └── AuthRedisStateCache.java  # Redis 状态缓存
└── pom.xml
```

### 核心组件

| 组件 | 说明 |
|------|------|
| `SocialAutoConfiguration` | 自动配置类，注册 AuthStateCache Bean |
| `SocialUtils` | 核心工具类，提供统一的认证入口 |
| `AuthRedisStateCache` | Redis 状态缓存实现，防止 CSRF 攻击 |
| `SocialProperties` | 配置属性映射，读取 justauth 前缀配置 |
| `SocialLoginConfigProperties` | 单个平台的配置属性类 |

### 技术依赖

```xml
<dependencies>
    <!-- 内部模块依赖 -->
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-json</artifactId>
    </dependency>
    <dependency>
        <groupId>plus.ruoyi</groupId>
        <artifactId>ruoyi-common-redis</artifactId>
    </dependency>

    <!-- JustAuth - 第三方登录集成框架 -->
    <dependency>
        <groupId>me.zhyd.oauth</groupId>
        <artifactId>JustAuth</artifactId>
    </dependency>
</dependencies>
```

## 自动配置机制

### SocialAutoConfiguration

自动配置类负责注册社交登录相关的 Bean：

```java
@AutoConfiguration
@EnableConfigurationProperties(SocialProperties.class)
public class SocialAutoConfiguration {

    /**
     * 配置认证状态缓存
     * 使用 Redis 作为 OAuth 认证过程中的状态缓存存储
     */
    @Bean
    public AuthStateCache authStateCache() {
        return new AuthRedisStateCache();
    }
}
```

**配置要点：**

- `@AutoConfiguration` - Spring Boot 3.x 自动配置注解
- `@EnableConfigurationProperties` - 启用配置属性绑定
- 自动注册 `AuthRedisStateCache` 作为状态缓存实现

## 核心工具类

### SocialUtils

SocialUtils 是社交登录的核心工具类，提供统一的认证入口：

```java
public class SocialUtils {

    private static final AuthRedisStateCache STATE_CACHE =
        SpringUtils.getBean(AuthRedisStateCache.class);

    /**
     * 执行第三方登录认证
     *
     * @param source           登录平台类型
     * @param code             授权码
     * @param state            状态参数
     * @param socialProperties 社交登录配置
     * @return 认证响应结果
     */
    public static AuthResponse<AuthUser> loginAuth(
            String source, String code, String state,
            SocialProperties socialProperties) throws AuthException {
        AuthRequest authRequest = getAuthRequest(source, socialProperties);
        AuthCallback callback = new AuthCallback();
        callback.setCode(code);
        callback.setState(state);
        return authRequest.login(callback);
    }

    /**
     * 根据平台类型获取对应的认证请求对象
     */
    public static AuthRequest getAuthRequest(
            String source, SocialProperties socialProperties) throws AuthException {
        SocialLoginConfigProperties obj = socialProperties.getType().get(source);
        if (ObjectUtil.isNull(obj)) {
            throw new AuthException("不支持的第三方登录类型");
        }

        // 构建认证配置
        AuthConfig.AuthConfigBuilder builder = AuthConfig.builder()
            .clientId(obj.getClientId())
            .clientSecret(obj.getClientSecret())
            .redirectUri(obj.getRedirectUri())
            .scopes(obj.getScopes());

        // 根据平台类型创建对应的认证请求对象
        return switch (source.toLowerCase()) {
            case "dingtalk" -> new AuthDingTalkV2Request(builder.build(), STATE_CACHE);
            case "baidu" -> new AuthBaiduRequest(builder.build(), STATE_CACHE);
            case "github" -> new AuthGithubRequest(builder.build(), STATE_CACHE);
            case "gitee" -> new AuthGiteeRequest(builder.build(), STATE_CACHE);
            case "weibo" -> new AuthWeiboRequest(builder.build(), STATE_CACHE);
            case "coding" -> new AuthCodingRequest(builder.build(), STATE_CACHE);
            case "oschina" -> new AuthOschinaRequest(builder.build(), STATE_CACHE);
            case "alipay_wallet" -> new AuthAlipayRequest(
                builder.build(),
                socialProperties.getType().get("alipay_wallet").getAlipayPublicKey(),
                STATE_CACHE);
            case "qq" -> new AuthQqRequest(builder.build(), STATE_CACHE);
            case "wechat_open" -> new AuthWeChatOpenRequest(builder.build(), STATE_CACHE);
            case "taobao" -> new AuthTaobaoRequest(builder.build(), STATE_CACHE);
            case "douyin" -> new AuthDouyinRequest(builder.build(), STATE_CACHE);
            case "linkedin" -> new AuthLinkedinRequest(builder.build(), STATE_CACHE);
            case "microsoft" -> new AuthMicrosoftRequest(builder.build(), STATE_CACHE);
            case "renren" -> new AuthRenrenRequest(builder.build(), STATE_CACHE);
            case "stack_overflow" -> new AuthStackOverflowRequest(
                builder.stackOverflowKey(obj.getStackOverflowKey()).build(),
                STATE_CACHE);
            case "huawei" -> new AuthHuaweiV3Request(builder.build(), STATE_CACHE);
            case "wechat_enterprise" -> new AuthWeChatEnterpriseQrcodeV2Request(
                builder.agentId(obj.getAgentId()).build(),
                STATE_CACHE);
            case "gitlab" -> new AuthGitlabRequest(builder.build(), STATE_CACHE);
            case "wechat_mp" -> new AuthWeChatMpRequest(builder.build(), STATE_CACHE);
            case "aliyun" -> new AuthAliyunRequest(builder.build(), STATE_CACHE);
            case "maxkey" -> new AuthMaxKeyRequest(builder.build(), STATE_CACHE);
            case "topiam" -> new AuthTopIamRequest(builder.build(), STATE_CACHE);
            case "gitea" -> new AuthGiteaRequest(builder.build(), STATE_CACHE);
            default -> throw new AuthException("未获取到有效的Auth配置");
        };
    }
}
```

### 平台类型映射

| 平台标识 | 认证请求类 | 说明 |
|---------|-----------|------|
| `dingtalk` | `AuthDingTalkV2Request` | 钉钉V2版本 |
| `github` | `AuthGithubRequest` | GitHub |
| `gitee` | `AuthGiteeRequest` | Gitee |
| `wechat_open` | `AuthWeChatOpenRequest` | 微信开放平台 |
| `wechat_mp` | `AuthWeChatMpRequest` | 微信公众号 |
| `wechat_enterprise` | `AuthWeChatEnterpriseQrcodeV2Request` | 企业微信 |
| `qq` | `AuthQqRequest` | QQ |
| `weibo` | `AuthWeiboRequest` | 微博 |
| `alipay_wallet` | `AuthAlipayRequest` | 支付宝 |
| `maxkey` | `AuthMaxKeyRequest` | MaxKey |
| `topiam` | `AuthTopIamRequest` | TopIAM |
| `gitea` | `AuthGiteaRequest` | Gitea |

## 状态缓存机制

### AuthRedisStateCache

基于 Redis 实现的 OAuth 状态缓存，用于存储和验证 state 参数：

```java
@AllArgsConstructor
public class AuthRedisStateCache implements AuthStateCache {

    /**
     * 存储缓存（使用默认过期时间 3 分钟）
     */
    @Override
    public void cache(String key, String value) {
        RedisUtils.setCacheObject(
            GlobalConstants.SOCIAL_AUTH_CODE_KEY + key,
            value,
            Duration.ofMinutes(3)
        );
    }

    /**
     * 存储缓存（指定过期时间）
     */
    @Override
    public void cache(String key, String value, long timeout) {
        RedisUtils.setCacheObject(
            GlobalConstants.SOCIAL_AUTH_CODE_KEY + key,
            value,
            Duration.ofMillis(timeout)
        );
    }

    /**
     * 获取缓存内容
     */
    @Override
    public String get(String key) {
        return RedisUtils.getCacheObject(GlobalConstants.SOCIAL_AUTH_CODE_KEY + key);
    }

    /**
     * 检查缓存键是否存在且未过期
     */
    @Override
    public boolean containsKey(String key) {
        return RedisUtils.hasKey(GlobalConstants.SOCIAL_AUTH_CODE_KEY + key);
    }
}
```

**缓存规则：**

| 配置项 | 值 | 说明 |
|-------|-----|------|
| 缓存前缀 | `GlobalConstants.SOCIAL_AUTH_CODE_KEY` | 统一前缀标识 |
| 缓存格式 | `social_auth_code:{state}` | Redis Key 格式 |
| 默认过期时间 | 3 分钟 | 可通过重载方法自定义 |

## 配置属性

### SocialProperties

主配置类，映射 `justauth` 前缀的配置：

```java
@Data
@Component
@ConfigurationProperties(prefix = "justauth")
public class SocialProperties {

    /**
     * 社交登录类型配置映射
     * key: 登录类型（如：wechat_enterprise、github等）
     * value: 对应的登录配置
     */
    private Map<String, SocialLoginConfigProperties> type;
}
```

### SocialLoginConfigProperties

单个平台的配置属性：

```java
@Data
public class SocialLoginConfigProperties {

    /** 应用ID（客户端ID） */
    private String clientId;

    /** 应用密钥（客户端密钥） */
    private String clientSecret;

    /** 授权回调地址 */
    private String redirectUri;

    /** 是否获取微信UnionID */
    private boolean unionId;

    /** Coding平台企业名称 */
    private String codingGroupName;

    /** 支付宝公钥 */
    private String alipayPublicKey;

    /** 企业微信应用ID */
    private String agentId;

    /** StackOverflow平台API密钥 */
    private String stackOverflowKey;

    /** 设备唯一标识 */
    private String deviceId;

    /** 客户端操作系统类型 */
    private String clientOsType;

    /** MaxKey/TopIAM/Gitea 服务器地址 */
    private String serverUrl;

    /** OAuth授权范围列表 */
    private List<String> scopes;
}
```

## 支持的社交平台

### 国内平台

| 平台 | 标识符 | 描述 |
|------|--------|------|
| 钉钉 | `dingtalk` | 企业办公平台（V2版本） |
| 百度 | `baidu` | 百度账号登录 |
| Gitee | `gitee` | 国内 Git 代码托管平台 |
| 微博 | `weibo` | 新浪微博 |
| Coding | `coding` | 代码托管平台 |
| 开源中国 | `oschina` | OSChina 社区 |
| 支付宝 | `alipay_wallet` | 支付宝钱包登录 |
| QQ | `qq` | 腾讯 QQ 登录 |
| 微信开放平台 | `wechat_open` | 微信开放平台登录 |
| 淘宝 | `taobao` | 淘宝账号登录 |
| 抖音 | `douyin` | 抖音账号登录 |
| 华为 | `huawei` | 华为账号登录（V3版本） |
| 企业微信 | `wechat_enterprise` | 企业微信扫码登录 |
| 微信公众号 | `wechat_mp` | 微信公众号登录 |
| 阿里云 | `aliyun` | 阿里云账号登录 |

### 国外平台

| 平台 | 标识符 | 描述 |
|------|--------|------|
| GitHub | `github` | GitHub 代码托管平台 |
| LinkedIn | `linkedin` | 职业社交网络 |
| Microsoft | `microsoft` | 微软账号 |
| StackOverflow | `stack_overflow` | 程序员问答社区 |
| GitLab | `gitlab` | GitLab 代码托管平台 |

### 自建/企业平台

| 平台 | 标识符 | 描述 |
|------|--------|------|
| MaxKey | `maxkey` | 企业级身份认证管理系统 |
| TopIAM | `topiam` | 身份管理平台 |
| Gitea | `gitea` | 自建 Git 服务器 |

## 自定义平台实现

### MaxKey 集成

MaxKey 是企业级身份认证管理系统，支持标准 OAuth2.0 协议：

**接口配置（AuthMaxKeySource）：**

```java
public enum AuthMaxKeySource implements AuthSource {

    MAXKEY {
        @Override
        public String authorize() {
            return AuthMaxKeyRequest.SERVER_URL + "/sign/authz/oauth/v20/authorize";
        }

        @Override
        public String accessToken() {
            return AuthMaxKeyRequest.SERVER_URL + "/sign/authz/oauth/v20/token";
        }

        @Override
        public String userInfo() {
            return AuthMaxKeyRequest.SERVER_URL + "/sign/api/oauth/v20/me";
        }

        @Override
        public Class<? extends AuthDefaultRequest> getTargetClass() {
            return AuthMaxKeyRequest.class;
        }
    }
}
```

**认证请求（AuthMaxKeyRequest）：**

```java
public class AuthMaxKeyRequest extends AuthDefaultRequest {

    public static final String SERVER_URL =
        SpringUtils.getProperty("justauth.type.maxkey.server-url");

    public AuthMaxKeyRequest(AuthConfig config, AuthStateCache authStateCache) {
        super(config, AuthMaxKeySource.MAXKEY, authStateCache);
    }

    @Override
    public AuthToken getAccessToken(AuthCallback authCallback) {
        String body = doPostAuthorizationCode(authCallback.getCode());
        Dict object = JsonUtils.parseMap(body);

        // 错误检查
        if (object.containsKey("error")) {
            throw new AuthException(object.getStr("error_description"));
        }
        if (object.containsKey("message")) {
            throw new AuthException(object.getStr("message"));
        }

        return AuthToken.builder()
            .accessToken(object.getStr("access_token"))
            .refreshToken(object.getStr("refresh_token"))
            .idToken(object.getStr("id_token"))
            .tokenType(object.getStr("token_type"))
            .scope(object.getStr("scope"))
            .build();
    }

    @Override
    public AuthUser getUserInfo(AuthToken authToken) {
        String body = doGetUserInfo(authToken);
        Dict object = JsonUtils.parseMap(body);

        // 错误检查
        if (object.containsKey("error")) {
            throw new AuthException(object.getStr("error_description"));
        }

        return AuthUser.builder()
            .uuid(object.getStr("userId"))
            .username(object.getStr("username"))
            .nickname(object.getStr("displayName"))
            .avatar(object.getStr("avatar_url"))
            .blog(object.getStr("web_url"))
            .company(object.getStr("organization"))
            .location(object.getStr("location"))
            .email(object.getStr("email"))
            .remark(object.getStr("bio"))
            .token(authToken)
            .source(source.toString())
            .build();
    }
}
```

### TopIAM 集成

TopIAM 是身份管理平台，使用 Basic 认证方式：

**接口配置（AuthTopIamSource）：**

```java
public enum AuthTopIamSource implements AuthSource {

    TOPIAM {
        @Override
        public String authorize() {
            return AuthTopIamRequest.SERVER_URL + "/oauth2/auth";
        }

        @Override
        public String accessToken() {
            return AuthTopIamRequest.SERVER_URL + "/oauth2/token";
        }

        @Override
        public String userInfo() {
            return AuthTopIamRequest.SERVER_URL + "/oauth2/userinfo";
        }

        @Override
        public Class<? extends AuthDefaultRequest> getTargetClass() {
            return AuthTopIamRequest.class;
        }
    }
}
```

**认证请求（AuthTopIamRequest）：**

```java
@Slf4j
public class AuthTopIamRequest extends AuthDefaultRequest {

    public static final String SERVER_URL =
        SpringUtils.getProperty("justauth.type.topiam.server-url");

    public AuthTopIamRequest(AuthConfig config, AuthStateCache authStateCache) {
        super(config, TOPIAM, authStateCache);
    }

    /**
     * 使用 Basic 认证方式发送客户端凭证
     */
    @Override
    protected String doPostAuthorizationCode(String code) {
        HttpRequest request = HttpRequest.post(source.accessToken())
            .header("Authorization", "Basic " + Base64.encode(
                "%s:%s".formatted(config.getClientId(), config.getClientSecret())))
            .form("grant_type", "authorization_code")
            .form("code", code)
            .form("redirect_uri", config.getRedirectUri());
        HttpResponse response = request.execute();
        return response.body();
    }

    /**
     * 使用 Bearer token 方式认证
     */
    @Override
    protected String doGetUserInfo(AuthToken authToken) {
        return new HttpUtils(config.getHttpConfig())
            .get(source.userInfo(), null, new HttpHeader()
                .add("Content-Type", "application/json")
                .add("Authorization", "Bearer " + authToken.getAccessToken()), false)
            .getBody();
    }

    /**
     * 构建授权 URL，添加 scope 参数
     */
    @Override
    public String authorize(String state) {
        return UrlBuilder.fromBaseUrl(super.authorize(state))
            .queryParam("scope", StrUtil.join("%20", config.getScopes()))
            .build();
    }
}
```

### Gitea 集成

Gitea 是轻量级的自建 Git 服务器，支持 OAuth2.0 认证：

**接口配置（AuthGiteaSource）：**

```java
public enum AuthGiteaSource implements AuthSource {

    GITEA {
        @Override
        public String authorize() {
            return AuthGiteaRequest.SERVER_URL + "/login/oauth/authorize";
        }

        @Override
        public String accessToken() {
            return AuthGiteaRequest.SERVER_URL + "/login/oauth/access_token";
        }

        @Override
        public String userInfo() {
            return AuthGiteaRequest.SERVER_URL + "/login/oauth/userinfo";
        }

        @Override
        public Class<? extends AuthDefaultRequest> getTargetClass() {
            return AuthGiteaRequest.class;
        }
    }
}
```

**认证请求（AuthGiteaRequest）：**

```java
@Slf4j
public class AuthGiteaRequest extends AuthDefaultRequest {

    public static final String SERVER_URL =
        SpringUtils.getProperty("justauth.type.gitea.server-url");

    public AuthGiteaRequest(AuthConfig config, AuthStateCache authStateCache) {
        super(config, AuthGiteaSource.GITEA, authStateCache);
    }

    @Override
    protected String doPostAuthorizationCode(String code) {
        HttpRequest request = HttpRequest.post(source.accessToken())
            .form("client_id", config.getClientId())
            .form("client_secret", config.getClientSecret())
            .form("grant_type", "authorization_code")
            .form("code", code)
            .form("redirect_uri", config.getRedirectUri());
        HttpResponse response = request.execute();
        return response.body();
    }

    @Override
    public AuthUser getUserInfo(AuthToken authToken) {
        String body = doGetUserInfo(authToken);
        Dict object = JsonUtils.parseMap(body);

        // 错误检查
        if (object.containsKey("error")) {
            throw new AuthException(object.getStr("error_description"));
        }

        return AuthUser.builder()
            .uuid(object.getStr("sub"))
            .username(object.getStr("name"))
            .nickname(object.getStr("preferred_username"))
            .avatar(object.getStr("picture"))
            .email(object.getStr("email"))
            .token(authToken)
            .source(source.toString())
            .build();
    }
}
```

### 钉钉 V2 版本

钉钉 V2 版本使用新的认证接口：

```java
public class AuthDingTalkV2Request extends AuthDefaultRequest {

    public AuthDingTalkV2Request(AuthConfig config, AuthStateCache authStateCache) {
        super(config, AuthDefaultSource.DINGTALK_V2, authStateCache);
    }

    @Override
    public String authorize(String state) {
        return UrlBuilder.fromBaseUrl(source.authorize())
            .queryParam("response_type", "code")
            .queryParam("client_id", config.getClientId())
            .queryParam("scope", this.getScopes(",", true,
                AuthScopeUtils.getDefaultScopes(AuthDingTalkScope.values())))
            .queryParam("redirect_uri", GlobalAuthUtils.urlEncode(config.getRedirectUri()))
            .queryParam("prompt", "consent")
            .queryParam("org_type", config.getDingTalkOrgType())
            .queryParam("corpId", config.getDingTalkCorpId())
            .queryParam("exclusiveLogin", config.isDingTalkExclusiveLogin())
            .queryParam("exclusiveCorpId", config.getDingTalkExclusiveCorpId())
            .queryParam("state", getRealState(state))
            .build();
    }

    @Override
    public AuthToken getAccessToken(AuthCallback authCallback) {
        Map<String, String> params = new HashMap<>();
        params.put("grantType", "authorization_code");
        params.put("clientId", config.getClientId());
        params.put("clientSecret", config.getClientSecret());
        params.put("code", authCallback.getCode());

        String response = new HttpUtils(config.getHttpConfig())
            .post(this.source.accessToken(), JSONObject.toJSONString(params))
            .getBody();
        JSONObject accessTokenObject = JSONObject.parseObject(response);

        if (!accessTokenObject.containsKey("accessToken")) {
            throw new AuthException(JSONObject.toJSONString(response), source);
        }

        return AuthToken.builder()
            .accessToken(accessTokenObject.getString("accessToken"))
            .refreshToken(accessTokenObject.getString("refreshToken"))
            .expireIn(accessTokenObject.getIntValue("expireIn"))
            .corpId(accessTokenObject.getString("corpId"))
            .build();
    }

    @Override
    public AuthUser getUserInfo(AuthToken authToken) {
        HttpHeader header = new HttpHeader();
        header.add("x-acs-dingtalk-access-token", authToken.getAccessToken());

        String response = new HttpUtils(config.getHttpConfig())
            .get(this.source.userInfo(), null, header, false)
            .getBody();
        JSONObject object = JSONObject.parseObject(response);

        authToken.setOpenId(object.getString("openId"));
        authToken.setUnionId(object.getString("unionId"));

        return AuthUser.builder()
            .rawUserInfo(object)
            .uuid(object.getString("unionId"))
            .username(object.getString("nick"))
            .nickname(object.getString("nick"))
            .avatar(object.getString("avatarUrl"))
            .snapshotUser(object.getBooleanValue("visitor"))
            .token(authToken)
            .source(source.toString())
            .build();
    }
}
```

### 企业微信基类

企业微信认证的抽象基类：

```java
public abstract class AbstractAuthWeChatEnterpriseRequest extends AuthDefaultRequest {

    @Override
    public AuthToken getAccessToken(AuthCallback authCallback) {
        String response = doGetAuthorizationCode(accessTokenUrl(null));
        JSONObject object = this.checkResponse(response);

        return AuthToken.builder()
            .accessToken(object.getString("access_token"))
            .expireIn(object.getIntValue("expires_in"))
            .code(authCallback.getCode())
            .build();
    }

    @Override
    public AuthUser getUserInfo(AuthToken authToken) {
        String response = doGetUserInfo(authToken);
        JSONObject object = this.checkResponse(response);

        // 非当前企业用户检查
        if (!object.containsKey("userid")) {
            throw new AuthException(AuthResponseStatus.UNIDENTIFIED_PLATFORM, source);
        }

        String userId = object.getString("userid");
        String userTicket = object.getString("user_ticket");
        JSONObject userDetail = getUserDetail(
            authToken.getAccessToken(), userId, userTicket);

        return AuthUser.builder()
            .rawUserInfo(userDetail)
            .username(userDetail.getString("name"))
            .nickname(userDetail.getString("alias"))
            .avatar(userDetail.getString("avatar"))
            .location(userDetail.getString("address"))
            .email(userDetail.getString("email"))
            .uuid(userId)
            .gender(AuthUserGender.getWechatRealGender(userDetail.getString("gender")))
            .token(authToken)
            .source(source.toString())
            .build();
    }

    @Override
    protected String accessTokenUrl(String code) {
        return UrlBuilder.fromBaseUrl(source.accessToken())
            .queryParam("corpid", config.getClientId())
            .queryParam("corpsecret", config.getClientSecret())
            .build();
    }

    /**
     * 获取用户详细信息（包含敏感信息）
     */
    private JSONObject getUserDetail(String accessToken, String userId, String userTicket) {
        // 获取用户基础信息
        String userInfoUrl = UrlBuilder.fromBaseUrl(
            "https://qyapi.weixin.qq.com/cgi-bin/user/get")
            .queryParam("access_token", accessToken)
            .queryParam("userid", userId)
            .build();
        String userInfoResponse = new HttpUtils(config.getHttpConfig())
            .get(userInfoUrl).getBody();
        JSONObject userInfo = checkResponse(userInfoResponse);

        // 获取用户敏感信息（如果有票据）
        if (StringUtils.isNotEmpty(userTicket)) {
            String userDetailUrl = UrlBuilder.fromBaseUrl(
                "https://qyapi.weixin.qq.com/cgi-bin/auth/getuserdetail")
                .queryParam("access_token", accessToken)
                .build();
            JSONObject param = new JSONObject();
            param.put("user_ticket", userTicket);
            String userDetailResponse = new HttpUtils(config.getHttpConfig())
                .post(userDetailUrl, param.toJSONString()).getBody();
            JSONObject userDetail = checkResponse(userDetailResponse);

            userInfo.putAll(userDetail);
        }
        return userInfo;
    }
}
```

## 配置指南

### application.yml 配置示例

```yaml
justauth:
  type:
    # GitHub 配置
    github:
      client-id: your_github_client_id
      client-secret: your_github_client_secret
      redirect-uri: http://localhost:8080/auth/callback/github
      scopes:
        - user:email
        - read:user

    # Gitee 配置
    gitee:
      client-id: your_gitee_client_id
      client-secret: your_gitee_client_secret
      redirect-uri: http://localhost:8080/auth/callback/gitee

    # 企业微信配置
    wechat_enterprise:
      client-id: your_corp_id
      client-secret: your_corp_secret
      redirect-uri: http://localhost:8080/auth/callback/wechat_enterprise
      agent-id: your_agent_id

    # 钉钉配置
    dingtalk:
      client-id: your_dingtalk_client_id
      client-secret: your_dingtalk_client_secret
      redirect-uri: http://localhost:8080/auth/callback/dingtalk

    # 支付宝配置
    alipay_wallet:
      client-id: your_alipay_app_id
      client-secret: your_alipay_private_key
      redirect-uri: http://your-domain.com/auth/callback/alipay_wallet
      alipay-public-key: your_alipay_public_key

    # MaxKey 配置
    maxkey:
      client-id: your_maxkey_client_id
      client-secret: your_maxkey_client_secret
      redirect-uri: http://localhost:8080/auth/callback/maxkey
      server-url: https://your-maxkey-server.com

    # TopIAM 配置
    topiam:
      client-id: your_topiam_client_id
      client-secret: your_topiam_client_secret
      redirect-uri: http://localhost:8080/auth/callback/topiam
      server-url: https://your-topiam-server.com
      scopes:
        - openid
        - profile
        - email

    # Gitea 配置
    gitea:
      client-id: your_gitea_client_id
      client-secret: your_gitea_client_secret
      redirect-uri: http://localhost:8080/auth/callback/gitea
      server-url: https://your-gitea-server.com
```

### 配置参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `client-id` | String | 是 | 应用ID/客户端ID |
| `client-secret` | String | 是 | 应用密钥/客户端密钥 |
| `redirect-uri` | String | 是 | 授权回调地址 |
| `scopes` | `List<String>` | 否 | OAuth 授权范围 |
| `agent-id` | String | 否 | 企业微信应用ID |
| `server-url` | String | 否 | 自建服务器地址（MaxKey/TopIAM/Gitea） |
| `alipay-public-key` | String | 否 | 支付宝公钥 |
| `stack-overflow-key` | String | 否 | StackOverflow API 密钥 |

## 使用示例

### 基础用法

```java
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private SocialProperties socialProperties;

    /**
     * 获取授权 URL
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
    public AuthResponse<AuthUser> login(
            @PathVariable String source,
            @RequestParam String code,
            @RequestParam String state) {
        return SocialUtils.loginAuth(source, code, state, socialProperties);
    }
}
```

### 完整登录流程

```java
@RestController
@RequestMapping("/social")
@RequiredArgsConstructor
public class SocialLoginController {

    private final SocialProperties socialProperties;
    private final ISysUserService userService;

    /**
     * 生成授权 URL
     */
    @GetMapping("/render/{source}")
    public R<String> renderAuth(@PathVariable String source) {
        try {
            AuthRequest authRequest = SocialUtils.getAuthRequest(source, socialProperties);
            String authorizeUrl = authRequest.authorize(AuthStateUtils.createState());
            return R.ok(authorizeUrl);
        } catch (AuthException e) {
            return R.fail(e.getMessage());
        }
    }

    /**
     * 处理回调
     */
    @GetMapping("/callback/{source}")
    public R<LoginVo> callback(
            @PathVariable String source,
            @RequestParam String code,
            @RequestParam String state) {
        try {
            AuthResponse<AuthUser> response = SocialUtils.loginAuth(
                source, code, state, socialProperties);

            if (!response.ok()) {
                return R.fail("认证失败：" + response.getMsg());
            }

            AuthUser authUser = response.getData();

            // 查询或创建用户
            SysUser user = userService.selectUserBySocialId(
                source, authUser.getUuid());

            if (user == null) {
                // 创建新用户或返回绑定页面
                return R.fail("用户未绑定，请先绑定账号");
            }

            // 执行登录
            String token = loginService.socialLogin(user);
            return R.ok(new LoginVo(token));

        } catch (AuthException e) {
            return R.fail(e.getMessage());
        }
    }
}
```

## 最佳实践

### 1. 安全配置

```yaml
# 生产环境必须使用 HTTPS
justauth:
  type:
    github:
      redirect-uri: https://your-domain.com/auth/callback/github
```

### 2. 异常处理

```java
@RestControllerAdvice
public class SocialExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public R<Void> handleAuthException(AuthException e) {
        log.error("社交登录异常: {}", e.getMessage());
        return R.fail("登录失败：" + e.getMessage());
    }
}
```

### 3. 用户绑定策略

```java
public class SocialBindService {

    /**
     * 绑定社交账号到现有用户
     */
    public void bindSocialAccount(Long userId, String source, AuthUser authUser) {
        SysSocialUser socialUser = new SysSocialUser();
        socialUser.setUserId(userId);
        socialUser.setSource(source);
        socialUser.setOpenId(authUser.getUuid());
        socialUser.setUserName(authUser.getUsername());
        socialUser.setNickName(authUser.getNickname());
        socialUser.setAvatar(authUser.getAvatar());
        socialUser.setEmail(authUser.getEmail());
        socialUserMapper.insert(socialUser);
    }
}
```

## 常见问题

### 1. 回调地址不匹配

**问题原因：** redirect_uri 参数与平台配置不一致

**解决方案：**
- 检查 application.yml 中的 redirect-uri 配置
- 确保与第三方平台开发者后台配置完全一致
- 注意 HTTP/HTTPS 协议、端口号、路径的完整匹配

### 2. state 参数验证失败

**问题原因：** state 缓存过期或 Redis 连接异常

**解决方案：**
- 检查 Redis 连接是否正常
- 确认授权操作在 3 分钟内完成
- 检查是否有多实例部署导致的缓存不一致

### 3. 支付宝回调地址限制

**问题原因：** 支付宝不允许使用 localhost 或 127.0.0.1 作为回调地址

**解决方案：**
- 开发环境使用局域网 IP 或 ngrok 等内网穿透工具
- 生产环境使用正式域名

### 4. 企业微信用户不属于当前企业

**问题原因：** 扫码用户不是配置的企业成员

**解决方案：**
- 确认 corpId 和 agentId 配置正确
- 确保扫码用户属于该企业
- 检查应用的可见范围设置

### 5. 自建平台连接超时

**问题原因：** MaxKey/TopIAM/Gitea 服务器网络不通

**解决方案：**
- 检查 server-url 配置是否正确
- 确认服务器网络可达
- 检查防火墙和安全组配置
