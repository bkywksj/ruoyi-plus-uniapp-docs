# ruoyi-common-http HTTP客户端模块

## 介绍

ruoyi-common-http 是基于 Forest 框架封装的声明式 HTTP 客户端模块，提供简洁高效的第三方 API 调用能力。

**核心特性:**

- **声明式 API** - 通过注解定义 HTTP 接口，无需手动编写请求代码
- **多后端支持** - 支持 OkHttp3 和 HttpClient 两种底层实现
- **拦截器机制** - 请求前后自定义处理，统一认证、签名、日志
- **智能参数绑定** - Query、Path、Body、Header 多种参数方式
- **自动 JSON 序列化** - 集成 Jackson 实现自动序列化/反序列化
- **内置客户端** - 高德地图 API、火山引擎 TTS 开箱即用

## 快速开始

### 添加依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-http</artifactId>
</dependency>
```

### 配置文件

```yaml
forest:
  backend: okhttp3                 # HTTP 后端(okhttp3/httpclient)
  max-connections: 1000            # 连接池最大连接数
  max-route-connections: 500       # 每个路由最大连接数
  timeout: 3000                    # 默认超时时间(毫秒)
  connect-timeout: 10000           # 连接超时
  read-timeout: 10000              # 读取超时
  max-retry-count: 0               # 重试次数(0不重试)
  log-enabled: true                # 是否开启日志
  log-request: true                # 记录请求日志
  log-response-status: true        # 记录响应状态
  log-response-content: false      # 记录响应内容(生产环境关闭)
```

## 客户端定义

### 基本结构

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

    @Get(url = "/api/users")
    ForestResponse<List<User>> searchUsers(
        @Query("keyword") String keyword,
        @Query("page") int page
    );
}
```

### 注解说明

| 注解 | 作用 | 使用位置 |
|------|------|----------|
| `@BaseRequest` | 接口基础配置(URL、拦截器) | 接口类 |
| `@Get/@Post/@Put/@Delete` | 定义 HTTP 方法 | 方法 |
| `@Query` | URL 查询参数 | 参数 |
| `@Var` | URL 路径变量 | 参数 |
| `@Body` | 请求体 | 参数 |
| `@Headers` | 请求头 | 方法 |

### 响应处理

```java
ForestResponse<User> response = myApiClient.getUserById("123");

// 获取响应信息
int statusCode = response.getStatusCode();
User user = response.getResult();
String content = response.getContent();
boolean isSuccess = response.isSuccess();  // 2xx 状态码
```

## 拦截器

### 拦截器接口

```java
public interface ForestInterceptor {
    // 请求发送前，返回 false 终止请求
    boolean beforeExecute(ForestRequest req);

    // 请求完成后
    void afterExecute(ForestRequest req, ForestResponse res);

    // 请求失败时
    void onError(ForestRuntimeException e, ForestRequest req, ForestResponse res);
}
```

### 认证拦截器示例

```java
@Slf4j
public class MyServiceInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        MyServiceProperties props = SpringUtils.getBean(MyServiceProperties.class);

        // 检查服务是否启用
        if (!props.getEnabled()) {
            log.warn("服务已禁用");
            return false;
        }

        // 添加认证信息
        req.addHeader("Authorization", "Bearer " + props.getAccessToken());
        req.addQuery("apiKey", props.getApiKey());

        return true;
    }

    @Override
    public void onError(ForestRuntimeException e, ForestRequest req, ForestResponse res) {
        log.error("请求失败: {} - {}", req.getUrl(), e.getMessage());
    }
}
```

## 内置客户端

### 高德地图客户端

**配置:**

```yaml
gaode:
  map:
    enabled: true
    api-key: ${GAODE_MAP_API_KEY:your_api_key}
    timeout: 5000
```

**使用示例:**

```java
@Service
@RequiredArgsConstructor
public class LocationService {

    private final GaodeMapClient gaodeMapClient;

    // 根据 IP 获取位置
    public IPLocationResponse getLocationByIp(String ip) {
        ForestResponse<IPLocationResponse> response = gaodeMapClient.getLocationByIp(ip, "4");
        return response.getResult();
    }

    // 地址转坐标
    public GeocodingResponse addressToCoordinate(String address) {
        return gaodeMapClient.geocoding(address).getResult();
    }

    // 获取天气信息
    public WeatherResponse getWeather(String adcode) {
        return gaodeMapClient.getWeatherByAdcode(adcode).getResult();
    }
}
```

**客户端接口:**

```java
@BaseRequest(
    baseURL = "https://restapi.amap.com",
    interceptor = GaodeMapInterceptor.class
)
public interface GaodeMapClient {

    @Get(url = "/v3/ip")
    ForestResponse<IPLocationResponse> getLocationByIp(
        @Query("ip") String ip,
        @Query("type") String type
    );

    @Get(url = "/v3/geocode/geo?output=json")
    ForestResponse<GeocodingResponse> geocoding(@Query("address") String address);

    @Get(url = "/v3/weather/weatherInfo")
    ForestResponse<WeatherResponse> getWeatherByAdcode(@Query("city") String adcode);
}
```

### 火山引擎 TTS 客户端

**配置:**

```yaml
volcengine:
  tts:
    enabled: false                    # 默认禁用，需配置凭证后启用
    app-id: ${VOLCENGINE_TTS_APP_ID:}
    access-token: ${VOLCENGINE_TTS_ACCESS_TOKEN:}
    cluster: volcano_tts
    default-voice: BV001_streaming
    encoding: pcm
    sample-rate: 24000
    speed-ratio: 1.0
    volume-ratio: 1.0
```

**使用示例:**

```java
@Service
@RequiredArgsConstructor
public class TtsService {

    private final VolcengineTtsClient ttsClient;

    public byte[] textToSpeech(String text) {
        ForestResponse<VolcengineTtsResponse> response = ttsClient.synthesize(text);

        if (response.isSuccess()) {
            return Base64.getDecoder().decode(response.getResult().getData());
        }
        throw new BusinessException("语音合成失败");
    }
}
```

## 自定义客户端开发

### 开发步骤

**1. 定义配置属性类:**

```java
@Data
@ConfigurationProperties(prefix = "myservice")
public class MyServiceProperties {
    private String apiKey;
    private String apiSecret;
    private Boolean enabled = true;
    private Integer timeout = 5000;
}
```

**2. 定义客户端接口:**

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

**3. 实现拦截器:**

```java
@Slf4j
public class MyServiceInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        MyServiceProperties props = SpringUtils.getBean(MyServiceProperties.class);

        if (!props.getEnabled()) {
            return false;
        }

        req.addHeader("X-API-Key", props.getApiKey());
        req.addHeader("X-API-Secret", props.getApiSecret());
        return true;
    }
}
```

**4. 配置文件:**

```yaml
myservice:
  enabled: true
  api-key: ${MY_SERVICE_API_KEY:}
  api-secret: ${MY_SERVICE_API_SECRET:}
  timeout: 5000
```

## 最佳实践

### 配置管理

```yaml
# 敏感信息通过环境变量注入
myservice:
  api-key: ${MY_SERVICE_API_KEY}  # 不要硬编码
```

### 异常处理

```java
@Service
public class UserService {

    private final MyServiceClient client;

    public User getUserById(String userId) {
        try {
            ForestResponse<User> response = client.getUserById(userId);

            if (response.isSuccess()) {
                return response.getResult();
            }
            throw new BusinessException("获取用户失败: HTTP " + response.getStatusCode());
        } catch (ForestRuntimeException e) {
            log.error("调用服务失败", e);
            throw new BusinessException("服务不可用");
        }
    }
}
```

### 性能优化

```yaml
# 高并发场景增大连接池
forest:
  max-connections: 2000
  max-route-connections: 1000

# 使用异步调用
@Get(url = "/api/data")
Future<ForestResponse<Data>> getDataAsync();
```

### 日志管理

```java
@Slf4j
public class LoggingInterceptor implements ForestInterceptor {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        log.info(">>> {} {}", req.getType(), req.getUrl());
        return true;
    }

    @Override
    public void afterExecute(ForestRequest req, ForestResponse res) {
        log.info("<<< {} - {} ms", res.getStatusCode(), res.getTime());
    }
}
```

## 常见问题

### 1. 连接超时

**原因:** 超时时间设置过短或网络延迟

**解决:**

```yaml
forest:
  timeout: 10000
  connect-timeout: 5000
  read-timeout: 10000
```

或针对特定接口:

```java
@Get(url = "/api/slow", timeout = 30000)
ForestResponse<Data> slowEndpoint();
```

### 2. JSON 反序列化失败

**原因:** 响应包含未定义字段

**解决:** 模块已配置忽略未知属性，或在实体类添加:

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class MyResponse { }
```

### 3. 拦截器未生效

**原因:** 未在 `@BaseRequest` 中指定拦截器

**解决:**

```java
@BaseRequest(
    baseURL = "https://api.example.com",
    interceptor = MyInterceptor.class  // 必须指定
)
public interface MyApiClient { }
```

### 4. 参数未正确传递

**解决:** 使用正确的注解:

```java
// Query 参数
@Query("page") int page

// Path 变量
@Var("id") String userId

// 请求体
@Body User user
```

### 5. 连接池耗尽

**原因:** 并发请求过多

**解决:**

```yaml
forest:
  max-connections: 2000
  max-route-connections: 1000
```

或使用异步调用避免阻塞。

## API 参考

### @BaseRequest 属性

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `baseURL` | 基础 URL | - |
| `headers` | 公共请求头 | `[]` |
| `interceptor` | 拦截器类 | - |
| `timeout` | 超时时间(ms) | 全局配置 |
| `retryCount` | 重试次数 | 全局配置 |

### ForestResponse 方法

| 方法 | 说明 |
|------|------|
| `getResult()` | 获取响应结果(自动反序列化) |
| `getContent()` | 获取原始响应内容 |
| `getStatusCode()` | 获取 HTTP 状态码 |
| `isSuccess()` | 是否成功(2xx) |
| `getHeaders()` | 获取响应头 |
| `getTime()` | 获取请求耗时(ms) |

### ForestRequest 方法

| 方法 | 说明 |
|------|------|
| `addQuery(name, value)` | 添加查询参数 |
| `addHeader(name, value)` | 添加请求头 |
| `getUrl()` | 获取请求 URL |
| `getType()` | 获取请求方法 |
| `execute()` | 执行请求 |

## 总结

ruoyi-common-http 核心要点:

1. **声明式 API** - 接口 + 注解定义 HTTP 请求
2. **拦截器** - 统一处理认证、签名、日志
3. **内置客户端** - 高德地图、火山引擎 TTS
4. **配置灵活** - 超时、连接池、重试等可配置
5. **敏感信息** - 通过环境变量注入 API Key
