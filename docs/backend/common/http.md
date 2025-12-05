# ruoyi-common-http HTTP客户端模块

## 1. 模块概述

ruoyi-common-http 是基于 Forest 框架封装的声明式 HTTP 客户端模块,提供了简洁、高效的第三方 API 调用能力。Forest 是一款轻量级的 HTTP 客户端框架,支持以 Java 接口的方式定义 HTTP 请求,让 HTTP 调用像调用本地方法一样简单。

### 1.1 核心特性

**声明式 API 定义**

通过注解的方式定义 HTTP 接口,无需手动编写 HTTP 请求代码,大幅提升开发效率和代码可读性。只需定义接口和注解,框架自动处理请求发送、响应解析、异常处理等逻辑。

**多后端支持**

支持 OkHttp3 和 HttpClient 两种底层 HTTP 客户端实现,可根据项目需求灵活切换。默认使用 OkHttp3,性能优异且功能强大。

**强大的拦截器机制**

提供请求拦截器功能,可在请求发送前后进行自定义处理,如添加认证信息、参数签名、日志记录等,实现统一的请求处理逻辑。

**智能参数绑定**

支持多种参数绑定方式,包括 Query 参数、Path 参数、Body 参数、Header 参数等,支持对象属性自动映射,简化参数传递。

**完善的配置体系**

提供丰富的全局配置和细粒度配置选项,包括超时时间、连接池大小、重试策略、日志控制等,满足不同场景的需求。

**自动 JSON 序列化**

集成 Jackson 实现自动 JSON 序列化和反序列化,支持灵活的反序列化配置,如忽略未知属性、单值转数组、空数组转 null 等。

**内置客户端实现**

模块内置了高德地图 API 客户端和火山引擎 TTS 客户端,提供开箱即用的第三方服务调用能力,可作为自定义客户端的参考示例。

### 1.2 技术架构

```
ruoyi-common-http
├── Forest HTTP 框架
│   ├── forest-spring-boot3-starter
│   ├── OkHttp3 后端(默认)
│   ├── HttpClient 后端(可选)
│   └── Jackson JSON 转换器
├── 自动配置
│   ├── HttpAutoConfiguration
│   ├── ForestJacksonConverter 配置
│   └── Properties 配置类注册
├── 内置客户端
│   ├── 高德地图客户端
│   │   ├── GaodeMapClient 接口
│   │   ├── GaodeMapInterceptor 拦截器
│   │   ├── GaodeMapProperties 配置
│   │   └── 响应实体类
│   └── 火山引擎 TTS 客户端
│       ├── VolcengineTtsClient 接口
│       ├── VolcengineTtsInterceptor 拦截器
│       ├── VolcengineTtsProperties 配置
│       ├── 请求实体类
│       └── 响应实体类
└── 配置文件
    ├── http-client-dev.yml (开发环境)
    └── http-client-prod.yml (生产环境)
```

### 1.3 依赖关系

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-http</artifactId>
</dependency>
```

**依赖模块**:
- `ruoyi-common-core`: 核心工具类与通用功能
- `ruoyi-common-json`: JSON 序列化处理
- `forest-spring-boot3-starter`: Forest HTTP 客户端框架

### 1.4 Forest 框架介绍

Forest 是一款基于 Java 的声明式 HTTP 客户端框架,其设计理念是让 HTTP 调用像调用本地方法一样简单。相比传统的 HTTP 客户端库(如 Apache HttpClient、OkHttp),Forest 通过注解驱动的方式极大地简化了 HTTP 请求的编写和维护。

**Forest 核心优势**:

1. **声明式编程**: 通过接口和注解定义 HTTP 请求,无需编写重复的样板代码
2. **类型安全**: 编译时类型检查,避免运行时错误
3. **易于测试**: 接口可轻松 Mock,便于单元测试
4. **统一处理**: 通过拦截器实现统一的认证、签名、日志等处理
5. **动态代理**: 基于 JDK 动态代理或 CGLIB 生成接口实现
6. **多后端支持**: 支持 OkHttp3、HttpClient 等多种底层实现

**官方文档**: https://forest.kim/

---

## 2. Forest 框架配置

### 2.1 全局配置说明

Forest 框架通过 `forest.*` 前缀配置全局行为,所有配置项均可通过 YAML 文件或环境变量进行设置。

#### 开发环境配置

开发环境配置文件 `http-client-dev.yml`:

```yaml
forest:
  # HTTP 后端选择(okhttp3 或 httpclient)
  backend: okhttp3

  # 连接池配置
  max-connections: 1000              # 连接池最大连接数
  max-route-connections: 500         # 每个路由的最大连接数
  max-request-queue-size: 100        # 最大请求等待队列大小

  # 异步配置
  max-async-thread-size: 300         # 最大异步线程数
  max-async-queue-size: 16           # 最大异步线程池队列大小
  async-mode: platform               # 异步模式(platform/simple)

  # 超时配置(毫秒)
  timeout: 3000                      # 默认请求超时时间
  connect-timeout: 300000            # 连接超时时间(5分钟)
  read-timeout: 300000               # 读取超时时间(5分钟)

  # 重试策略
  max-retry-count: 0                 # 请求失败后重试次数(0表示不重试)

  # TLS/SSL 配置
  ssl-protocol: TLS                  # HTTPS 默认 TLS 协议

  # 日志配置
  log-enabled: true                  # 是否开启日志
  log-request: true                  # 是否记录请求日志
  log-response-status: true          # 是否记录响应状态日志
  log-response-content: true         # 是否记录响应内容日志

  # Spring 配置
  bean-id: forestConfiguration       # Forest 配置类在 Spring 容器中的 Bean ID
```

#### 生产环境配置

生产环境配置文件 `http-client-prod.yml`:

```yaml
forest:
  backend: okhttp3
  max-connections: 1000
  max-route-connections: 500
  max-request-queue-size: 100
  max-async-thread-size: 300
  max-async-queue-size: 16
  timeout: 5000                      # 生产环境超时时间设置更短
  connect-timeout: 10000
  read-timeout: 10000
  max-retry-count: 1                 # 生产环境可以配置重试1次
  ssl-protocol: TLS
  log-enabled: true
  log-request: true
  log-response-status: true
  log-response-content: false        # 生产环境不记录响应内容(减少日志量)
  async-mode: platform
  bean-id: forestConfiguration
```

### 2.2 配置项详解

#### 后端选择 (backend)

Forest 支持两种底层 HTTP 客户端:

- **okhttp3** (推荐): Square 公司开发的高性能 HTTP 客户端,支持 HTTP/2、连接池、GZIP 压缩等特性,性能优异
- **httpclient**: Apache HttpClient 4.x,功能完善,兼容性好

```yaml
forest:
  backend: okhttp3  # 推荐使用 OkHttp3
```

#### 连接池配置

连接池配置影响并发性能和资源使用:

```yaml
forest:
  # 全局最大连接数
  max-connections: 1000

  # 每个路由(域名)的最大连接数
  # 例如: 调用 api.example.com 最多占用 500 个连接
  max-route-connections: 500

  # 请求等待队列大小
  # 当连接池满时,新请求会进入等待队列
  max-request-queue-size: 100
```

**配置建议**:
- 高并发场景: 增大 `max-connections` 和 `max-route-connections`
- 资源受限环境: 降低连接数,避免资源耗尽
- 多域名调用: 适当增大 `max-route-connections`

#### 异步配置

Forest 支持异步请求,可配置异步线程池:

```yaml
forest:
  # 异步线程池大小
  max-async-thread-size: 300

  # 异步线程池队列大小
  max-async-queue-size: 16

  # 异步模式
  # platform: 使用平台线程池(推荐)
  # simple: 使用简单线程池
  async-mode: platform
```

#### 超时配置

超时配置是 HTTP 调用的重要参数,直接影响系统可用性:

```yaml
forest:
  # 默认超时时间(毫秒)
  # 作用于请求的整个生命周期
  timeout: 3000

  # 连接超时时间(毫秒)
  # TCP 连接建立的超时时间
  connect-timeout: 300000  # 5分钟

  # 读取超时时间(毫秒)
  # 从服务器读取响应数据的超时时间
  read-timeout: 300000  # 5分钟
```

**超时时间设置建议**:
- **快速接口** (如查询接口): timeout=3000 (3秒)
- **中等耗时接口** (如复杂计算): timeout=10000 (10秒)
- **长时间接口** (如文件上传下载): timeout=60000+ (1分钟以上)
- **开发环境**: 可以设置较长超时时间,便于调试
- **生产环境**: 超时时间应设置合理值,避免请求堆积

#### 重试策略

```yaml
forest:
  # 请求失败后的重试次数
  # 0: 不重试
  # 1: 失败后重试1次
  # 2: 失败后重试2次(总共执行3次)
  max-retry-count: 0
```

**重试注意事项**:
- **幂等操作** (GET、PUT、DELETE): 可以启用重试
- **非幂等操作** (POST): 谨慎启用重试,避免重复提交
- **第三方 API**: 根据第三方的重试策略决定

#### 日志配置

```yaml
forest:
  # 是否开启 Forest 日志
  log-enabled: true

  # 是否记录请求日志(包含请求 URL、方法、参数等)
  log-request: true

  # 是否记录响应状态日志(包含 HTTP 状态码)
  log-response-status: true

  # 是否记录响应内容日志(包含完整响应 Body)
  # 生产环境建议关闭,避免日志量过大
  log-response-content: true
```

**日志配置建议**:
- **开发环境**: 全部开启,便于调试
- **测试环境**: 开启请求和状态日志,关闭响应内容
- **生产环境**: 开启请求和状态日志,关闭响应内容

### 2.3 JSON 序列化配置

模块提供自定义的 Jackson 配置,优化了 JSON 序列化行为:

```java
@Bean
public ForestJacksonConverter forestJacksonConverter(ObjectMapper objectMapper) {
    // 复制一份,避免影响全局 ObjectMapper
    ObjectMapper forestMapper = objectMapper.copy();

    // 处理字符串 -> 数组("内丘县" -> ["内丘县"])
    forestMapper.enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);

    // 处理空数组 -> null([] -> null)
    forestMapper.enable(DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT);

    // 忽略未知属性(第三方 API 响应字段变化不会导致反序列化失败)
    forestMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

    return new ForestJacksonConverter(forestMapper);
}
```

**配置说明**:

1. **ACCEPT_SINGLE_VALUE_AS_ARRAY**: 允许单个值自动转换为数组
   - 适用场景: 某些 API 在单个元素时返回字符串,多个元素时返回数组
   - 示例: `"北京市"` → `["北京市"]`

2. **ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT**: 允许空数组转换为 null
   - 适用场景: 某些 API 在无数据时返回空数组 `[]`
   - 示例: `[]` → `null`

3. **FAIL_ON_UNKNOWN_PROPERTIES**: 忽略未知属性
   - 适用场景: 第三方 API 新增字段不会导致反序列化失败
   - 示例: 响应中有 `newField`,但实体类没有对应属性,不会抛异常

---

## 3. 客户端定义

### 3.1 客户端接口定义

Forest 使用接口和注解定义 HTTP 客户端,无需实现类,框架会自动生成代理对象。

#### 基本结构

```java
@BaseRequest(
    baseURL = "https://api.example.com",
    interceptor = MyInterceptor.class
)
public interface MyApiClient {

    @Get(url = "/api/users/{id}")
    ForestResponse<User> getUserById(@Var("id") String userId);

    @Post(url = "/api/users")
    @Headers("Content-Type: application/json")
    ForestResponse<User> createUser(@Body User user);
}
```

#### 注解说明

**@BaseRequest**: 定义接口级别的基础配置

```java
@BaseRequest(
    baseURL = "https://api.example.com",  // 基础 URL
    headers = {                           // 公共请求头
        "User-Agent: MyApp/1.0",
        "Accept: application/json"
    },
    interceptor = MyInterceptor.class,    // 拦截器
    timeout = 5000,                       // 超时时间(毫秒)
    retryCount = 1                        // 重试次数
)
public interface MyApiClient {
    // ...
}
```

**@Get / @Post / @Put / @Delete**: 定义 HTTP 方法和 URL

```java
// GET 请求
@Get(url = "/api/users")
ForestResponse<List<User>> getUsers();

// POST 请求
@Post(url = "/api/users")
ForestResponse<User> createUser(@Body User user);

// PUT 请求
@Put(url = "/api/users/{id}")
ForestResponse<User> updateUser(@Var("id") String id, @Body User user);

// DELETE 请求
@Delete(url = "/api/users/{id}")
ForestResponse<Void> deleteUser(@Var("id") String id);
```

**@Query**: 定义 URL 查询参数

```java
@Get(url = "/api/users")
ForestResponse<List<User>> searchUsers(
    @Query("keyword") String keyword,
    @Query("page") int page,
    @Query("size") int size
);
// 生成 URL: /api/users?keyword=xxx&page=1&size=10
```

**@Var**: 定义 URL 路径变量

```java
@Get(url = "/api/users/{id}")
ForestResponse<User> getUserById(@Var("id") String userId);
// 生成 URL: /api/users/123
```

**@Body**: 定义请求体

```java
@Post(url = "/api/users")
ForestResponse<User> createUser(@Body User user);
// 请求体会自动序列化为 JSON
```

**@Headers**: 定义请求头

```java
@Post(url = "/api/users")
@Headers({
    "Content-Type: application/json",
    "Authorization: Bearer ${token}"
})
ForestResponse<User> createUser(@Body User user);
```

### 3.2 高德地图客户端示例

```java
@BaseRequest(
    baseURL = "https://restapi.amap.com",
    interceptor = GaodeMapInterceptor.class
)
public interface GaodeMapClient {

    /**
     * 根据 IP 获取位置信息
     */
    @Get(url = "/v3/ip")
    ForestResponse<IPLocationResponse> getLocationByIp(
        @Query("ip") String ip,
        @Query("type") String type
    );

    /**
     * 地理编码 - 根据地址获取经纬度
     */
    @Get(url = "/v3/geocode/geo?output=json")
    ForestResponse<GeocodingResponse> geocoding(
        @Query("address") String address
    );

    /**
     * 逆地理编码 - 根据经纬度获取位置信息
     */
    @Get(url = "/v3/geocode/regeo?output=json&location=${coord.lng},${coord.lat}")
    ForestResponse<ReverseGeocodingResponse> reverseGeocoding(
        @Var("coord") CoordinateUtil.Coordinate coord
    );

    /**
     * 获取天气信息
     */
    @Get(url = "/v3/weather/weatherInfo")
    ForestResponse<WeatherResponse> getWeatherByAdcode(
        @Query("city") String adcode
    );

    /**
     * 计算两点间距离
     */
    @Get(url = "/v3/distance?type=0&origins=${origins.lng},${origins.lat}&destination=${destination.lng},${destination.lat}")
    ForestResponse<DistanceResponse> calculateDistance(
        @Var("origins") CoordinateUtil.Coordinate start,
        @Query("destination") CoordinateUtil.Coordinate end
    );
}
```

**设计要点**:

1. **统一基础 URL**: 通过 `@BaseRequest` 定义 API 基础地址
2. **统一拦截器**: 通过拦截器自动添加 API Key
3. **清晰的方法命名**: 方法名直接表达业务含义
4. **完整的注释**: 每个方法都有 JavaDoc 说明
5. **类型安全**: 使用泛型定义响应类型

### 3.3 火山引擎 TTS 客户端示例

```java
@BaseRequest(
    baseURL = "https://openspeech.bytedance.com",
    interceptor = VolcengineTtsInterceptor.class
)
public interface VolcengineTtsClient {

    /**
     * 语音合成
     */
    @Post(url = "/api/v1/tts")
    @Headers("Content-Type: application/json")
    ForestResponse<VolcengineTtsResponse> synthesize(
        @Body VolcengineTtsRequest request
    );

    /**
     * 语音合成(简化版 - 使用默认配置)
     */
    default ForestResponse<VolcengineTtsResponse> synthesize(
        String text,
        String voiceType
    ) {
        VolcengineTtsProperties properties = SpringUtils.getBean(VolcengineTtsProperties.class);

        VolcengineTtsRequest request = VolcengineTtsRequest.builder()
            .app(VolcengineTtsRequest.AppConfig.builder()
                .appid(properties.getAppId())
                .cluster(properties.getCluster())
                .build())
            .request(VolcengineTtsRequest.RequestConfig.builder()
                .text(text)
                .build())
            .audio(VolcengineTtsRequest.AudioConfig.builder()
                .voiceType(voiceType)
                .encoding(properties.getEncoding())
                .sampleRate(properties.getSampleRate())
                .speedRatio(properties.getSpeedRatio())
                .volumeRatio(properties.getVolumeRatio())
                .pitchRatio(properties.getPitchRatio())
                .build())
            .build();
        return synthesize(request);
    }

    /**
     * 语音合成(最简版 - 使用默认音色)
     */
    default ForestResponse<VolcengineTtsResponse> synthesize(String text) {
        VolcengineTtsProperties properties = SpringUtils.getBean(VolcengineTtsProperties.class);
        // ... 构建请求
        return synthesize(request);
    }
}
```

**设计要点**:

1. **方法重载**: 提供多种调用方式,满足不同使用场景
2. **default 方法**: 在接口中提供默认实现,简化调用
3. **Builder 模式**: 使用 Builder 构建复杂请求对象
4. **配置注入**: 通过 SpringUtils 获取配置,避免硬编码

### 3.4 响应处理

Forest 支持多种响应处理方式:

#### 使用 ForestResponse

```java
ForestResponse<User> response = myApiClient.getUserById("123");

// 获取响应状态码
int statusCode = response.getStatusCode();

// 获取响应体
User user = response.getResult();

// 获取原始响应内容
String content = response.getContent();

// 获取响应头
String contentType = response.getHeader("Content-Type");

// 判断是否成功
boolean isSuccess = response.isSuccess();  // 2xx 状态码
```

#### 直接返回实体

```java
@Get(url = "/api/users/{id}")
User getUserById(@Var("id") String userId);

// 直接获取用户对象
User user = myApiClient.getUserById("123");
```

#### 返回字符串

```java
@Get(url = "/api/users/{id}")
String getUserJson(@Var("id") String userId);

// 获取原始 JSON 字符串
String json = myApiClient.getUserJson("123");
```

---

## 4. 拦截器使用

### 4.1 拦截器概述

Forest 拦截器是一种强大的机制,允许在 HTTP 请求的生命周期中进行自定义处理。拦截器可以:

- **请求前处理**: 添加认证信息、签名、公共参数等
- **响应后处理**: 统一异常处理、日志记录、响应解密等
- **请求重试**: 自定义重试逻辑
- **请求取消**: 根据条件取消请求

### 4.2 拦截器接口

```java
public interface ForestInterceptor {

    /**
     * 请求发送前的处理
     * @param req Forest 请求对象
     * @return true-继续执行请求, false-终止请求
     */
    boolean beforeExecute(ForestRequest req);

    /**
     * 请求发送后的处理
     * @param req Forest 请求对象
     * @param res Forest 响应对象
     */
    void afterExecute(ForestRequest req, ForestResponse res);

    /**
     * 请求失败时的处理
     * @param e 异常对象
     * @param request Forest 请求对象
     * @param response Forest 响应对象
     */
    void onError(ForestRuntimeException e, ForestRequest request, ForestResponse response);

    /**
     * 请求成功时的处理
     * @param data 响应数据
     * @param req Forest 请求对象
     * @param res Forest 响应对象
     */
    void onSuccess(Object data, ForestRequest req, ForestResponse res);
}
```

### 4.3 高德地图拦截器示例

```java
@Slf4j
public class GaodeMapInterceptor implements ForestInterceptor {

    /**
     * 请求发送前的处理
     */
    @Override
    public boolean beforeExecute(ForestRequest req) {
        // 获取高德地图配置
        GaodeMapProperties gaodeMapProperties = SpringUtils.getBean(GaodeMapProperties.class);

        // 检查服务是否启用
        if (!gaodeMapProperties.getEnabled()) {
            log.warn("高德地图服务已禁用,跳过请求");
            return false;  // 返回 false 终止请求
        }

        // 检查 API Key 是否配置
        String apiKey = gaodeMapProperties.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.error("高德地图 API 密钥未配置,请检查配置文件");
            return false;
        }

        // 添加 API Key 到请求参数
        req.addQuery("key", apiKey);
        log.debug("已添加高德地图 API Key 到请求参数");

        return true;  // 返回 true 继续执行请求
    }
}
```

**设计要点**:

1. **配置验证**: 在发送请求前验证必要配置
2. **服务开关**: 支持通过配置启用/禁用服务
3. **统一认证**: 自动添加 API Key,业务代码无需关心认证
4. **错误提示**: 配置错误时提供清晰的日志提示
5. **请求控制**: 通过返回值控制是否继续执行请求

### 4.4 火山引擎 TTS 拦截器示例

```java
@Slf4j
public class VolcengineTtsInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        // 获取配置
        VolcengineTtsProperties properties = SpringUtils.getBean(VolcengineTtsProperties.class);

        // 检查服务是否启用
        if (!properties.getEnabled()) {
            log.warn("火山引擎 TTS 服务已禁用");
            return false;
        }

        // 验证必要配置
        if (StringUtils.isBlank(properties.getAppId())) {
            log.error("火山引擎 TTS App ID 未配置");
            return false;
        }

        if (StringUtils.isBlank(properties.getAccessToken())) {
            log.error("火山引擎 TTS Access Token 未配置");
            return false;
        }

        // 添加认证信息到请求头
        req.addHeader("Authorization", "Bearer " + properties.getAccessToken());

        log.debug("火山引擎 TTS 请求准备完成");
        return true;
    }

    @Override
    public void afterExecute(ForestRequest req, ForestResponse res) {
        // 记录响应状态
        log.info("火山引擎 TTS 请求完成, 状态码: {}", res.getStatusCode());
    }

    @Override
    public void onError(ForestRuntimeException e, ForestRequest request, ForestResponse response) {
        // 统一异常处理
        log.error("火山引擎 TTS 请求失败: {}", e.getMessage(), e);
    }
}
```

### 4.5 自定义拦截器最佳实践

#### 统一认证拦截器

```java
@Slf4j
public class AuthInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        // 从 Spring Security 或其他认证机制获取 Token
        String token = getAuthToken();

        if (StringUtils.isBlank(token)) {
            log.warn("未找到认证 Token,请求可能失败");
            return true;  // 继续执行,让服务端返回 401
        }

        // 添加认证头
        req.addHeader("Authorization", "Bearer " + token);

        return true;
    }

    private String getAuthToken() {
        // 从 SecurityContextHolder 或缓存中获取 Token
        // ...
        return null;
    }
}
```

#### 签名拦截器

```java
@Slf4j
public class SignatureInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        // 获取请求参数
        Map<String, Object> queryParams = req.getQueries();

        // 添加时间戳
        long timestamp = System.currentTimeMillis();
        req.addQuery("timestamp", String.valueOf(timestamp));

        // 计算签名
        String signature = calculateSignature(queryParams, timestamp);
        req.addQuery("signature", signature);

        log.debug("已添加签名: {}", signature);
        return true;
    }

    private String calculateSignature(Map<String, Object> params, long timestamp) {
        // 实现签名算法(如 MD5、SHA256 等)
        // ...
        return "";
    }
}
```

#### 日志拦截器

```java
@Slf4j
public class LoggingInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        log.info(">>> 发送请求: {} {}", req.getType(), req.getUrl());
        log.debug(">>> 请求参数: {}", req.getQueries());
        log.debug(">>> 请求头: {}", req.getHeaders());
        return true;
    }

    @Override
    public void afterExecute(ForestRequest req, ForestResponse res) {
        log.info("<<< 收到响应: {} - {}", res.getStatusCode(), req.getUrl());
        log.debug("<<< 响应内容: {}", res.getContent());
    }

    @Override
    public void onError(ForestRuntimeException e, ForestRequest request, ForestResponse response) {
        log.error("!!! 请求失败: {} - {}", request.getUrl(), e.getMessage());
    }
}
```

#### 重试拦截器

```java
@Slf4j
public class RetryInterceptor implements ForestInterceptor {

    private static final int MAX_RETRY_COUNT = 3;
    private static final long RETRY_DELAY_MS = 1000;

    @Override
    public void onError(ForestRuntimeException e, ForestRequest request, ForestResponse response) {
        Integer retryCount = request.getData("retryCount");
        if (retryCount == null) {
            retryCount = 0;
        }

        if (retryCount < MAX_RETRY_COUNT) {
            log.warn("请求失败,准备重试第 {} 次: {}", retryCount + 1, request.getUrl());

            try {
                Thread.sleep(RETRY_DELAY_MS);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }

            request.setData("retryCount", retryCount + 1);
            request.execute();  // 重新执行请求
        } else {
            log.error("请求失败,已达最大重试次数: {}", request.getUrl());
        }
    }
}
```

---

## 5. 第三方服务配置

### 5.1 高德地图服务配置

#### 配置项

```yaml
gaode:
  map:
    # 是否启用高德地图服务
    enabled: ${GAODE_MAP_ENABLED:true}

    # 高德地图 API 密钥
    api-key: ${GAODE_MAP_API_KEY:your_api_key_here}

    # API 请求超时时间(毫秒)
    timeout: ${GAODE_MAP_TIMEOUT:5000}
```

#### 配置属性类

```java
@Data
@ConfigurationProperties(prefix = "gaode.map")
public class GaodeMapProperties {

    /**
     * 高德地图 API 密钥
     */
    private String apiKey;

    /**
     * API 请求超时时间(毫秒)
     */
    private Integer timeout = 5000;

    /**
     * 是否启用高德地图服务
     */
    private Boolean enabled = true;
}
```

#### 使用示例

```java
@Service
@RequiredArgsConstructor
public class LocationService {

    private final GaodeMapClient gaodeMapClient;

    /**
     * 根据 IP 获取位置
     */
    public IPLocationResponse getLocationByIp(String ip) {
        ForestResponse<IPLocationResponse> response = gaodeMapClient.getLocationByIp(ip, "4");

        if (response.isSuccess()) {
            return response.getResult();
        } else {
            throw new BusinessException("获取位置信息失败: " + response.getStatusCode());
        }
    }

    /**
     * 地址转坐标
     */
    public GeocodingResponse addressToCoordinate(String address) {
        ForestResponse<GeocodingResponse> response = gaodeMapClient.geocoding(address);
        return response.getResult();
    }

    /**
     * 坐标转地址
     */
    public ReverseGeocodingResponse coordinateToAddress(double lng, double lat) {
        CoordinateUtil.Coordinate coord = new CoordinateUtil.Coordinate(lng, lat);
        ForestResponse<ReverseGeocodingResponse> response = gaodeMapClient.reverseGeocoding(coord);
        return response.getResult();
    }
}
```

### 5.2 火山引擎 TTS 服务配置

#### 配置项

```yaml
volcengine:
  tts:
    # 是否启用火山 TTS 服务(默认禁用,需要配置密钥后启用)
    enabled: ${VOLCENGINE_TTS_ENABLED:false}

    # 应用 ID
    app-id: ${VOLCENGINE_TTS_APP_ID:}

    # 访问令牌
    access-token: ${VOLCENGINE_TTS_ACCESS_TOKEN:}

    # 业务集群(volcano_tts: 内置音色, volcano_mega: 复制音色)
    cluster: volcano_tts

    # 默认音色类型
    default-voice: BV001_streaming

    # 音频编码格式(mp3, wav, pcm)
    encoding: pcm

    # 音频采样率(Hz)
    sample-rate: ${VOLCENGINE_TTS_SAMPLE_RATE:24000}

    # 语速比例(0.5-2.0)
    speed-ratio: 1.0

    # 音量比例(0.5-2.0)
    volume-ratio: 1.0

    # 音调比例(0.5-2.0)
    pitch-ratio: 1.0
```

#### 配置属性类

```java
@Data
@ConfigurationProperties(prefix = "volcengine.tts")
public class VolcengineTtsProperties {

    /**
     * 是否启用服务
     */
    private Boolean enabled = false;

    /**
     * 应用 ID
     */
    private String appId;

    /**
     * 访问令牌
     */
    private String accessToken;

    /**
     * 业务集群
     */
    private String cluster = "volcano_tts";

    /**
     * 默认音色
     */
    private String defaultVoice = "BV001_streaming";

    /**
     * 音频编码格式
     */
    private String encoding = "pcm";

    /**
     * 采样率
     */
    private Integer sampleRate = 24000;

    /**
     * 语速比例
     */
    private Double speedRatio = 1.0;

    /**
     * 音量比例
     */
    private Double volumeRatio = 1.0;

    /**
     * 音调比例
     */
    private Double pitchRatio = 1.0;
}
```

#### 使用示例

```java
@Service
@RequiredArgsConstructor
public class TtsService {

    private final VolcengineTtsClient volcengineTtsClient;

    /**
     * 文字转语音(简单调用)
     */
    public byte[] textToSpeech(String text) {
        ForestResponse<VolcengineTtsResponse> response = volcengineTtsClient.synthesize(text);

        if (response.isSuccess()) {
            VolcengineTtsResponse result = response.getResult();
            return Base64.getDecoder().decode(result.getData());
        } else {
            throw new BusinessException("语音合成失败: " + response.getStatusCode());
        }
    }

    /**
     * 文字转语音(指定音色)
     */
    public byte[] textToSpeech(String text, String voiceType) {
        ForestResponse<VolcengineTtsResponse> response = volcengineTtsClient.synthesize(text, voiceType);

        if (response.isSuccess()) {
            return Base64.getDecoder().decode(response.getResult().getData());
        } else {
            throw new BusinessException("语音合成失败");
        }
    }
}
```

---

## 6. 自定义客户端开发

### 6.1 开发步骤

#### 步骤1: 定义客户端接口

```java
@BaseRequest(
    baseURL = "https://api.myservice.com",
    interceptor = MyServiceInterceptor.class
)
public interface MyServiceClient {

    @Get(url = "/api/v1/users/{id}")
    ForestResponse<User> getUserById(@Var("id") String userId);

    @Post(url = "/api/v1/users")
    @Headers("Content-Type: application/json")
    ForestResponse<User> createUser(@Body User user);
}
```

#### 步骤2: 创建配置属性类

```java
@Data
@ConfigurationProperties(prefix = "myservice")
public class MyServiceProperties {

    /**
     * 服务 API Key
     */
    private String apiKey;

    /**
     * 服务 API Secret
     */
    private String apiSecret;

    /**
     * 是否启用
     */
    private Boolean enabled = true;

    /**
     * 请求超时时间
     */
    private Integer timeout = 5000;
}
```

#### 步骤3: 实现拦截器

```java
@Slf4j
public class MyServiceInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        MyServiceProperties properties = SpringUtils.getBean(MyServiceProperties.class);

        if (!properties.getEnabled()) {
            log.warn("MyService 已禁用");
            return false;
        }

        // 添加认证信息
        req.addHeader("X-API-Key", properties.getApiKey());
        req.addHeader("X-API-Secret", properties.getApiSecret());

        return true;
    }

    @Override
    public void onError(ForestRuntimeException e, ForestRequest request, ForestResponse response) {
        log.error("MyService 请求失败: {}", e.getMessage());
    }
}
```

#### 步骤4: 注册配置类

```java
@AutoConfiguration
@EnableConfigurationProperties({
    MyServiceProperties.class
})
public class MyServiceAutoConfiguration {

    // 如需自定义配置,可在此添加 Bean
}
```

#### 步骤5: 配置文件

```yaml
myservice:
  enabled: true
  api-key: ${MY_SERVICE_API_KEY:}
  api-secret: ${MY_SERVICE_API_SECRET:}
  timeout: 5000
```

### 6.2 响应实体定义

#### 通用响应封装

```java
@Data
public class ApiResponse<T> {

    /**
     * 状态码
     */
    private Integer code;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 是否成功
     */
    public boolean isSuccess() {
        return code != null && code == 200;
    }
}
```

#### 具体业务实体

```java
@Data
public class User {

    /**
     * 用户 ID
     */
    private String id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;
}
```

### 6.3 异常处理

#### 自定义异常

```java
public class HttpClientException extends RuntimeException {

    private Integer statusCode;
    private String responseBody;

    public HttpClientException(String message) {
        super(message);
    }

    public HttpClientException(String message, Integer statusCode, String responseBody) {
        super(message);
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}
```

#### 统一异常处理

```java
@Slf4j
public class GlobalHttpInterceptor implements ForestInterceptor {

    @Override
    public void onError(ForestRuntimeException e, ForestRequest request, ForestResponse response) {
        log.error("HTTP 请求失败: {} {}", request.getType(), request.getUrl());
        log.error("错误信息: {}", e.getMessage());

        if (response != null) {
            log.error("状态码: {}", response.getStatusCode());
            log.error("响应内容: {}", response.getContent());

            throw new HttpClientException(
                "HTTP 请求失败",
                response.getStatusCode(),
                response.getContent()
            );
        } else {
            throw new HttpClientException("HTTP 请求失败: " + e.getMessage());
        }
    }
}
```

---

## 7. 最佳实践

### 7.1 配置管理

**使用环境变量**

将敏感配置(API Key、Secret)通过环境变量注入:

```yaml
myservice:
  api-key: ${MY_SERVICE_API_KEY}  # 从环境变量读取
  api-secret: ${MY_SERVICE_API_SECRET}
```

```bash
# 启动时设置环境变量
export MY_SERVICE_API_KEY=your_key_here
export MY_SERVICE_API_SECRET=your_secret_here
java -jar app.jar
```

**分环境配置**

```yaml
# http-client-dev.yml (开发环境)
forest:
  timeout: 30000  # 开发环境超时时间长,便于调试
  log-response-content: true

# http-client-prod.yml (生产环境)
forest:
  timeout: 5000   # 生产环境超时时间短
  log-response-content: false  # 不记录响应内容
```

### 7.2 接口设计

**方法命名规范**

```java
// ✅ 推荐: 清晰的业务语义
ForestResponse<User> getUserById(String id);
ForestResponse<List<User>> searchUsers(String keyword);
ForestResponse<User> createUser(User user);
ForestResponse<User> updateUser(String id, User user);
ForestResponse<Void> deleteUser(String id);

// ❌ 不推荐: 含糊不清
ForestResponse<User> get(String id);
ForestResponse<List<User>> query(String q);
ForestResponse<User> save(User user);
```

**参数命名规范**

```java
// ✅ 推荐: 参数名与 API 文档一致
@Get(url = "/api/users")
ForestResponse<List<User>> searchUsers(
    @Query("keyword") String keyword,      // 与 API 参数名一致
    @Query("page") int pageNumber,
    @Query("size") int pageSize
);

// ❌ 不推荐: 参数名不清晰
@Get(url = "/api/users")
ForestResponse<List<User>> searchUsers(
    @Query("keyword") String k,
    @Query("page") int p,
    @Query("size") int s
);
```

### 7.3 异常处理

**业务层统一处理**

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final MyServiceClient myServiceClient;

    public User getUserById(String userId) {
        try {
            ForestResponse<User> response = myServiceClient.getUserById(userId);

            if (response.isSuccess()) {
                return response.getResult();
            } else {
                throw new BusinessException("获取用户失败: HTTP " + response.getStatusCode());
            }
        } catch (ForestRuntimeException e) {
            log.error("调用用户服务失败", e);
            throw new BusinessException("用户服务不可用");
        }
    }
}
```

**拦截器统一处理**

```java
@Slf4j
public class ErrorHandlingInterceptor implements ForestInterceptor {

    @Override
    public void onError(ForestRuntimeException e, ForestRequest request, ForestResponse response) {
        // 根据状态码进行不同处理
        if (response != null) {
            int statusCode = response.getStatusCode();

            switch (statusCode) {
                case 401:
                    log.error("认证失败,请检查 Token");
                    break;
                case 403:
                    log.error("权限不足");
                    break;
                case 404:
                    log.error("资源不存在: {}", request.getUrl());
                    break;
                case 429:
                    log.error("请求过于频繁,触发限流");
                    break;
                case 500:
                    log.error("服务器内部错误");
                    break;
                default:
                    log.error("请求失败: {}", statusCode);
            }
        }
    }
}
```

### 7.4 性能优化

**使用连接池**

```yaml
forest:
  backend: okhttp3
  max-connections: 1000           # 增大连接池
  max-route-connections: 500
  # 连接池会复用 TCP 连接,减少握手开销
```

**异步调用**

```java
@Get(url = "/api/users/{id}")
Future<ForestResponse<User>> getUserByIdAsync(@Var("id") String userId);

// 使用异步调用
Future<ForestResponse<User>> future = myServiceClient.getUserByIdAsync("123");
// 执行其他操作
// ...
// 获取结果
ForestResponse<User> response = future.get();
```

**批量请求**

```java
// ✅ 推荐: 使用批量接口
@Post(url = "/api/users/batch")
ForestResponse<List<User>> getUsersByIds(@Body List<String> userIds);

// ❌ 不推荐: 循环调用单个接口
for (String userId : userIds) {
    myServiceClient.getUserById(userId);  // 多次网络请求
}
```

### 7.5 日志管理

**生产环境日志配置**

```yaml
forest:
  log-enabled: true
  log-request: true                # 记录请求 URL 和方法
  log-response-status: true        # 记录响应状态码
  log-response-content: false      # 不记录响应内容(减少日志量)
```

**自定义日志拦截器**

```java
@Slf4j
public class DetailedLoggingInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        // 记录请求详情
        log.info(">>> API 请求开始");
        log.info("    URL: {} {}", req.getType(), req.getUrl());
        log.info("    参数: {}", req.getQueries());

        // 脱敏处理
        Map<String, String> headers = new HashMap<>(req.getHeaders());
        if (headers.containsKey("Authorization")) {
            headers.put("Authorization", "Bearer ******");  // 脱敏
        }
        log.info("    请求头: {}", headers);

        return true;
    }

    @Override
    public void afterExecute(ForestRequest req, ForestResponse res) {
        // 记录响应摘要
        log.info("<<< API 请求完成");
        log.info("    状态: {}", res.getStatusCode());
        log.info("    耗时: {} ms", res.getTime());

        // 只记录前100个字符
        String content = res.getContent();
        if (content != null && content.length() > 100) {
            content = content.substring(0, 100) + "...";
        }
        log.debug("    响应: {}", content);
    }
}
```

### 7.6 测试实践

**单元测试**

```java
@SpringBootTest
class MyServiceClientTest {

    @Autowired
    private MyServiceClient myServiceClient;

    @Test
    void testGetUserById() {
        // 测试正常情况
        ForestResponse<User> response = myServiceClient.getUserById("123");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getResult()).isNotNull();
        assertThat(response.getResult().getId()).isEqualTo("123");
    }

    @Test
    void testGetUserById_NotFound() {
        // 测试异常情况
        assertThrows(ForestRuntimeException.class, () -> {
            myServiceClient.getUserById("non_existent_id");
        });
    }
}
```

**Mock 测试**

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private MyServiceClient myServiceClient;

    @InjectMocks
    private UserService userService;

    @Test
    void testGetUserById() {
        // Mock 响应
        User mockUser = new User();
        mockUser.setId("123");
        mockUser.setUsername("test");

        ForestResponse<User> mockResponse = mock(ForestResponse.class);
        when(mockResponse.isSuccess()).thenReturn(true);
        when(mockResponse.getResult()).thenReturn(mockUser);

        when(myServiceClient.getUserById("123")).thenReturn(mockResponse);

        // 执行测试
        User user = userService.getUserById("123");

        // 验证结果
        assertThat(user.getId()).isEqualTo("123");
        assertThat(user.getUsername()).isEqualTo("test");
    }
}
```

---

## 8. 常见问题

### 8.1 连接超时问题

**问题描述**

请求经常出现连接超时:

```
ForestRuntimeException: Connect timeout after 3000 ms
```

**问题原因**

1. 目标服务响应慢
2. 网络延迟高
3. 超时时间设置过短
4. 目标服务不可达

**解决方案**

**方案1: 调整超时时间**

```yaml
forest:
  timeout: 10000          # 增加到 10 秒
  connect-timeout: 5000
  read-timeout: 10000
```

**方案2: 针对特定接口调整**

```java
@Get(
    url = "/api/slow-endpoint",
    timeout = 30000  // 单个接口设置 30 秒超时
)
ForestResponse<Data> slowEndpoint();
```

**方案3: 异步调用**

```java
// 使用异步调用避免阻塞
@Get(url = "/api/slow-endpoint")
Future<ForestResponse<Data>> slowEndpointAsync();
```

### 8.2 请求失败无日志

**问题描述**

HTTP 请求失败,但看不到详细的错误日志。

**问题原因**

日志配置关闭了响应内容记录。

**解决方案**

**开发环境开启详细日志**:

```yaml
forest:
  log-enabled: true
  log-request: true
  log-response-status: true
  log-response-content: true  # 开启响应内容日志
```

**添加自定义日志拦截器**:

```java
@Slf4j
public class VerboseLoggingInterceptor implements ForestInterceptor {

    @Override
    public void onError(ForestRuntimeException e, ForestRequest request, ForestResponse response) {
        log.error("====== HTTP 请求失败 ======");
        log.error("URL: {} {}", request.getType(), request.getUrl());
        log.error("参数: {}", request.getQueries());

        if (response != null) {
            log.error("状态码: {}", response.getStatusCode());
            log.error("响应头: {}", response.getHeaders());
            log.error("响应内容: {}", response.getContent());
        }

        log.error("异常信息: ", e);
    }
}
```

### 8.3 JSON 反序列化失败

**问题描述**

```
ForestRuntimeException: JSON parse error: Unrecognized field "newField"
```

**问题原因**

第三方 API 响应中包含未定义的字段,Jackson 默认会抛出异常。

**解决方案**

模块已配置忽略未知属性:

```java
// 在 HttpAutoConfiguration 中已配置
forestMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
```

如果仍有问题,检查是否使用了自定义 ObjectMapper 或在实体类上添加注解:

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class MyResponse {
    // ...
}
```

### 8.4 拦截器未生效

**问题描述**

定义了拦截器,但 `beforeExecute` 方法没有被调用。

**问题原因**

1. 拦截器未注册到客户端接口
2. 拦截器类没有无参构造函数

**解决方案**

**确保在 @BaseRequest 中指定拦截器**:

```java
@BaseRequest(
    baseURL = "https://api.example.com",
    interceptor = MyInterceptor.class  // 必须指定
)
public interface MyApiClient {
    // ...
}
```

**确保拦截器有无参构造函数**:

```java
public class MyInterceptor implements ForestInterceptor {

    // 必须有无参构造函数(如果没有其他构造函数,Java 会自动生成)
    public MyInterceptor() {
    }

    @Override
    public boolean beforeExecute(ForestRequest req) {
        // ...
        return true;
    }
}
```

### 8.5 参数未正确传递

**问题描述**

请求参数没有正确传递到 URL 或请求体。

**问题原因**

1. 注解使用错误
2. 参数名不匹配
3. 参数为 null

**解决方案**

**Query 参数使用 @Query**:

```java
@Get(url = "/api/users")
ForestResponse<List<User>> getUsers(
    @Query("page") int page,      // 正确
    @Query("size") int size
);
```

**Path 变量使用 @Var**:

```java
@Get(url = "/api/users/{id}")
ForestResponse<User> getUserById(
    @Var("id") String userId      // 正确
);
```

**请求体使用 @Body**:

```java
@Post(url = "/api/users")
ForestResponse<User> createUser(
    @Body User user               // 正确
);
```

**处理 null 参数**:

```java
@Get(url = "/api/users")
ForestResponse<List<User>> searchUsers(
    @Query(value = "keyword", defaultValue = "") String keyword,  // 设置默认值
    @Query("page") int page
);
```

### 8.6 高德地图 API 调用失败

**问题描述**

```
高德地图 API 密钥未配置,请检查配置文件
```

**问题原因**

未配置高德地图 API Key 或配置错误。

**解决方案**

**配置 API Key**:

```yaml
gaode:
  map:
    enabled: true
    api-key: your_gaode_api_key_here  # 替换为实际的 API Key
    timeout: 5000
```

**通过环境变量配置**:

```yaml
gaode:
  map:
    api-key: ${GAODE_MAP_API_KEY}
```

```bash
export GAODE_MAP_API_KEY=your_actual_key
```

**申请 API Key**:

1. 访问高德开放平台: https://lbs.amap.com/
2. 注册并登录账号
3. 进入控制台创建应用
4. 获取 Web 服务 API Key

### 8.7 火山引擎 TTS 服务不可用

**问题描述**

```
火山引擎 TTS 服务已禁用
火山引擎 TTS App ID 未配置
```

**问题原因**

未配置火山引擎 TTS 凭证。

**解决方案**

**配置服务凭证**:

```yaml
volcengine:
  tts:
    enabled: true                          # 启用服务
    app-id: your_app_id                    # 应用 ID
    access-token: your_access_token        # 访问令牌
    cluster: volcano_tts
    default-voice: BV001_streaming
    encoding: pcm
    sample-rate: 24000
```

**获取凭证步骤**:

1. 访问火山引擎控制台: https://console.volcengine.com/speech/app
2. 创建应用
3. 开通 TTS 服务: https://console.volcengine.com/speech/service/8
4. 在服务页面找到 `App ID` 和 `Access Token`
5. 复制到配置文件

### 8.8 连接池耗尽

**问题描述**

```
ForestRuntimeException: Timeout waiting for connection from pool
```

**问题原因**

并发请求过多,连接池被耗尽。

**解决方案**

**增大连接池大小**:

```yaml
forest:
  max-connections: 2000           # 增大全局连接数
  max-route-connections: 1000     # 增大每个路由连接数
  max-request-queue-size: 200
```

**使用异步调用**:

```java
// 避免同步调用阻塞线程
@Get(url = "/api/data")
Future<ForestResponse<Data>> getDataAsync();

// 批量异步调用
List<Future<ForestResponse<Data>>> futures = new ArrayList<>();
for (String id : ids) {
    futures.add(myClient.getDataAsync(id));
}

// 等待所有结果
for (Future<ForestResponse<Data>> future : futures) {
    Data data = future.get().getResult();
    // 处理数据
}
```

**及时释放连接**:

```java
// 确保响应被完全消费
ForestResponse<Data> response = myClient.getData();
Data data = response.getResult();  // 获取结果
// Forest 会自动释放连接
```

---

## 9. API 参考

### 9.1 核心注解

| 注解 | 作用 | 使用位置 | 示例 |
|------|------|----------|------|
| `@BaseRequest` | 定义接口基础配置 | 接口类 | `@BaseRequest(baseURL = "https://api.example.com")` |
| `@Get` | 定义 GET 请求 | 方法 | `@Get(url = "/api/users/{id}")` |
| `@Post` | 定义 POST 请求 | 方法 | `@Post(url = "/api/users")` |
| `@Put` | 定义 PUT 请求 | 方法 | `@Put(url = "/api/users/{id}")` |
| `@Delete` | 定义 DELETE 请求 | 方法 | `@Delete(url = "/api/users/{id}")` |
| `@Query` | 定义 URL 查询参数 | 方法参数 | `@Query("page") int page` |
| `@Var` | 定义 URL 路径变量 | 方法参数 | `@Var("id") String userId` |
| `@Body` | 定义请求体 | 方法参数 | `@Body User user` |
| `@Headers` | 定义请求头 | 方法 | `@Headers("Content-Type: application/json")` |

### 9.2 @BaseRequest 属性

| 属性 | 类型 | 说明 | 默认值 | 示例 |
|------|------|------|--------|------|
| `baseURL` | `String` | 基础 URL | - | `"https://api.example.com"` |
| `headers` | `String[]` | 公共请求头 | `[]` | `{"Authorization: Bearer token"}` |
| `interceptor` | `Class<?>` | 拦截器类 | - | `MyInterceptor.class` |
| `timeout` | `int` | 超时时间(毫秒) | 全局配置 | `5000` |
| `retryCount` | `int` | 重试次数 | 全局配置 | `1` |
| `sslProtocol` | `String` | SSL 协议 | `"TLS"` | `"TLSv1.2"` |

### 9.3 ForestResponse 方法

| 方法 | 返回类型 | 说明 |
|------|---------|------|
| `getResult()` | `T` | 获取响应结果(自动反序列化) |
| `getContent()` | `String` | 获取原始响应内容 |
| `getStatusCode()` | `int` | 获取 HTTP 状态码 |
| `isSuccess()` | `boolean` | 是否成功(2xx 状态码) |
| `getHeaders()` | `Map<String, String>` | 获取响应头 |
| `getHeader(String name)` | `String` | 获取指定响应头 |
| `getTime()` | `long` | 获取请求耗时(毫秒) |

### 9.4 ForestRequest 方法

| 方法 | 说明 |
|------|------|
| `addQuery(String name, Object value)` | 添加查询参数 |
| `addHeader(String name, String value)` | 添加请求头 |
| `getUrl()` | 获取请求 URL |
| `getType()` | 获取请求方法(GET/POST 等) |
| `getQueries()` | 获取所有查询参数 |
| `getHeaders()` | 获取所有请求头 |
| `execute()` | 执行请求 |

### 9.5 ForestInterceptor 方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `beforeExecute(ForestRequest req)` | 请求发送前调用 | `true` 继续执行, `false` 终止请求 |
| `afterExecute(ForestRequest req, ForestResponse res)` | 请求完成后调用 | - |
| `onSuccess(Object data, ForestRequest req, ForestResponse res)` | 请求成功时调用 | - |
| `onError(ForestRuntimeException e, ForestRequest req, ForestResponse res)` | 请求失败时调用 | - |

---

## 10. 总结

### 10.1 模块特点

**简洁高效**

基于 Forest 框架的声明式 API 定义,无需编写繁琐的 HTTP 请求代码,大幅提升开发效率。一个接口即可完成 HTTP 客户端的定义,代码量减少 70% 以上。

**功能强大**

支持多种 HTTP 后端(OkHttp3、HttpClient),提供强大的拦截器机制、灵活的参数绑定、完善的配置体系,满足各种复杂场景需求。

**开箱即用**

内置高德地图和火山引擎 TTS 客户端实现,提供完整的配置、拦截器、实体类示例,可直接使用或作为自定义客户端的参考。

**易于扩展**

清晰的模块结构和标准化的开发流程,方便快速开发新的 HTTP 客户端。拦截器机制支持统一的认证、签名、日志等处理。

### 10.2 适用场景

**第三方 API 集成**

集成高德地图、火山引擎等第三方服务,或对接其他外部 API,如支付网关、短信服务、天气服务等。

**微服务间通信**

在微服务架构中,使用 Forest 客户端进行服务间 HTTP 调用,相比 Feign 更轻量、更灵活。

**爬虫与数据采集**

构建 Web 爬虫或数据采集系统,Forest 的声明式 API 使爬虫代码更加简洁优雅。

**API 测试**

编写 API 自动化测试,Forest 客户端可轻松 Mock,便于单元测试和集成测试。

### 10.3 注意事项

**敏感信息保护**

API Key、Secret 等敏感信息应通过环境变量或配置中心管理,不要硬编码在代码中或提交到版本控制系统。

**超时时间设置**

根据实际接口响应时间合理设置超时时间,避免过长导致请求堆积,或过短导致正常请求失败。

**连接池管理**

高并发场景下注意连接池大小配置,避免连接池耗尽。合理使用异步调用,提高系统吞吐量。

**日志敏感信息**

生产环境关闭响应内容日志(`log-response-content: false`),避免记录敏感数据。在日志拦截器中对 Token、密码等敏感信息进行脱敏处理。

**异常处理**

做好异常处理和降级策略,避免第三方服务不可用时影响主业务。可使用断路器(Circuit Breaker)模式保护系统。

**接口版本管理**

第三方 API 可能会升级或废弃接口,注意关注 API 版本变更,及时更新客户端实现。

---

**相关模块**:
- `ruoyi-common-core`: 核心工具类
- `ruoyi-common-json`: JSON 序列化
- `ruoyi-common-satoken`: 认证框架

**官方资源**:
- Forest 官方文档: https://forest.kim/
- Forest GitHub: https://github.com/dromara/forest
- 高德地图开放平台: https://lbs.amap.com/
- 火山引擎语音合成: https://www.volcengine.com/docs/6561/79824
