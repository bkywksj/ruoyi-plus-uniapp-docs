# ruoyi-common-http HTTP客户端模块

## 介绍

ruoyi-common-http 是基于 Forest 框架封装的声明式 HTTP 客户端模块，提供简洁高效的第三方 API 调用能力。通过注解驱动的方式定义 HTTP 接口，无需手动编写繁琐的请求代码，让开发者专注于业务逻辑。

**核心特性:**

- **声明式 API** - 通过注解定义 HTTP 接口，无需手动编写请求代码，代码简洁易维护
- **多后端支持** - 支持 OkHttp3 和 HttpClient 两种底层实现，可按需切换
- **拦截器机制** - 请求前后自定义处理，统一认证、签名、日志等横切关注点
- **智能参数绑定** - Query、Path、Body、Header 多种参数方式，自动映射
- **自动 JSON 序列化** - 集成 Jackson 实现自动序列化/反序列化，支持复杂嵌套对象
- **内置客户端** - 高德地图 API、火山引擎 TTS 开箱即用
- **环境隔离** - 支持多环境配置文件，开发/测试/生产环境独立配置

## 模块架构

```
ruoyi-common-http
├── src/main/java/plus/ruoyi/common/http
│   ├── config/                              # 自动配置
│   │   └── HttpAutoConfiguration.java       # HTTP模块自动配置类
│   └── client/                              # HTTP客户端
│       ├── gaode/                           # 高德地图客户端
│       │   └── map/
│       │       ├── GaodeMapClient.java          # 高德地图API接口
│       │       ├── GaodeMapInterceptor.java     # 请求拦截器
│       │       ├── GaodeMapProperties.java      # 配置属性
│       │       └── response/                    # 响应模型
│       │           ├── IPLocationResponse.java
│       │           ├── GeocodingResponse.java
│       │           ├── ReverseGeocodingResponse.java
│       │           ├── WeatherResponse.java
│       │           └── DistanceResponse.java
│       └── volcengine/                      # 火山引擎客户端
│           └── tts/
│               ├── VolcengineTtsClient.java     # TTS API接口
│               ├── VolcengineTtsInterceptor.java # Bearer认证拦截器
│               ├── VolcengineTtsProperties.java  # 配置属性
│               ├── VolcengineTtsRequest.java     # 请求模型
│               └── VolcengineTtsResponse.java    # 响应模型
└── src/main/resources/
    ├── http-client-dev.yml                  # 开发环境配置
    ├── http-client-test.yml                 # 测试环境配置
    └── http-client-prod.yml                 # 生产环境配置
```

## 快速开始

### 添加依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-http</artifactId>
</dependency>
```

模块依赖的核心包:

```xml
<!-- Forest HTTP 客户端框架 -->
<dependency>
    <groupId>com.dtflys.forest</groupId>
    <artifactId>forest-spring-boot3-starter</artifactId>
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

## 自动配置

### HttpAutoConfiguration

模块的核心自动配置类，负责注册 Forest Jackson 转换器和加载环境配置文件。

```java
@AutoConfiguration
@EnableConfigurationProperties({
    GaodeMapProperties.class,
    VolcengineTtsProperties.class
})
@PropertySource(
    value = "classpath:http-client-${spring.profiles.active}.yml",
    factory = YmlPropertySourceFactory.class
)
public class HttpAutoConfiguration {

    /**
     * 配置 Forest Jackson 转换器
     * 复制全局 ObjectMapper 并添加特殊配置
     */
    @Bean
    public ForestJacksonConverter forestJacksonConverter(ObjectMapper objectMapper) {
        ObjectMapper forestMapper = objectMapper.copy();
        // 单值可作为数组处理
        forestMapper.enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);
        // 空数组可作为null对象处理
        forestMapper.enable(DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT);
        // 忽略未知属性，避免反序列化失败
        forestMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        return new ForestJacksonConverter(forestMapper);
    }
}
```

**配置特性说明:**

| 特性 | 说明 | 应用场景 |
|------|------|----------|
| `ACCEPT_SINGLE_VALUE_AS_ARRAY` | 单个值自动包装为数组 | API返回单个对象但定义为数组类型 |
| `ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT` | 空数组转为null | 避免空数组导致的NPE |
| `FAIL_ON_UNKNOWN_PROPERTIES` | 禁用忽略未知属性 | 第三方API可能返回额外字段 |

### 多环境配置

模块支持按环境加载不同配置文件:

```yaml
# http-client-dev.yml - 开发环境
gaode:
  map:
    enabled: true
    api-key: ${GAODE_MAP_API_KEY:dev_key}
    timeout: 10000  # 开发环境超时时间长

# http-client-prod.yml - 生产环境
gaode:
  map:
    enabled: true
    api-key: ${GAODE_MAP_API_KEY}
    timeout: 5000   # 生产环境超时时间短
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

Forest 拦截器提供请求生命周期的钩子方法:

```java
public interface ForestInterceptor<T> {

    /**
     * 请求发送前调用
     * @return false 终止请求，true 继续执行
     */
    default boolean beforeExecute(ForestRequest request) {
        return true;
    }

    /**
     * 请求成功完成后调用
     */
    default void onSuccess(T data, ForestRequest request, ForestResponse response) {
    }

    /**
     * 请求失败时调用
     */
    default void onError(ForestRuntimeException ex, ForestRequest request, ForestResponse response) {
    }

    /**
     * 请求完成后调用（无论成功失败）
     */
    default void afterExecute(ForestRequest request, ForestResponse response) {
    }
}
```

### 认证拦截器示例

```java
@Slf4j
public class MyServiceInterceptor implements ForestInterceptor<Object> {

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

高德地图客户端提供完整的地理位置服务，包括IP定位、地理编码、逆地理编码、天气查询和距离计算。

#### 配置属性

```yaml
gaode:
  map:
    enabled: true                              # 是否启用
    api-key: ${GAODE_MAP_API_KEY:your_api_key} # API密钥
    timeout: 5000                              # 请求超时(毫秒)
```

**配置属性类:**

```java
@Data
@ConfigurationProperties(prefix = "gaode.map")
public class GaodeMapProperties {
    /** 是否启用高德地图服务 */
    private Boolean enabled = false;
    /** 高德地图 API Key */
    private String apiKey;
    /** 请求超时时间(毫秒) */
    private Integer timeout = 5000;
}
```

#### 客户端接口

```java
@BaseRequest(
    baseURL = "https://restapi.amap.com",
    interceptor = GaodeMapInterceptor.class
)
public interface GaodeMapClient {

    /**
     * IP定位 - 根据IP地址获取位置信息
     * @param ip IP地址
     * @param type IP类型(4-IPv4, 6-IPv6)
     */
    @Get(url = "/v3/ip")
    ForestResponse<IPLocationResponse> getLocationByIp(
        @Query("ip") String ip,
        @Query("type") String type
    );

    /**
     * 地理编码 - 地址转坐标
     * @param address 结构化地址
     */
    @Get(url = "/v3/geocode/geo?output=json")
    ForestResponse<GeocodingResponse> geocoding(
        @Query("address") String address
    );

    /**
     * 逆地理编码 - 坐标转地址
     * @param coord 坐标对象(经纬度)
     */
    @Get(url = "/v3/geocode/regeo?output=json&location=${coord.lng},${coord.lat}")
    ForestResponse<ReverseGeocodingResponse> reverseGeocoding(
        @Var("coord") CoordinateUtil.Coordinate coord
    );

    /**
     * 天气查询 - 获取城市天气信息
     * @param adcode 城市行政区划代码
     */
    @Get(url = "/v3/weather/weatherInfo")
    ForestResponse<WeatherResponse> getWeatherByAdcode(
        @Query("city") String adcode
    );

    /**
     * 距离计算 - 计算两点之间的驾车距离
     * @param start 起点坐标
     * @param end 终点坐标
     */
    @Get(url = "/v3/distance?type=0&origins=${origins.lng},${origins.lat}&destination=${destination.lng},${destination.lat}")
    ForestResponse<DistanceResponse> calculateDistance(
        @Var("origins") CoordinateUtil.Coordinate start,
        @Var("destination") CoordinateUtil.Coordinate end
    );
}
```

#### 拦截器实现

```java
@Slf4j
public class GaodeMapInterceptor implements ForestInterceptor<Object> {

    @Override
    public boolean beforeExecute(ForestRequest request) {
        GaodeMapProperties properties = SpringUtils.getBean(GaodeMapProperties.class);

        // 检查服务是否启用
        if (!properties.getEnabled()) {
            log.warn("高德地图服务未启用");
            return false;
        }

        // 添加API Key到请求参数
        request.addQuery("key", properties.getApiKey());
        return true;
    }
}
```

#### 响应模型

**IP定位响应:**

```java
@Data
public class IPLocationResponse {
    /** 状态码(1成功,0失败) */
    private String status;
    /** 状态信息 */
    private String info;
    /** 省份 */
    private String province;
    /** 城市 */
    private String city;
    /** 城市行政区划代码 */
    private String adcode;
    /** 矩形区域 */
    private String rectangle;
}
```

#### 使用示例

```java
@Service
@RequiredArgsConstructor
public class LocationService {

    private final GaodeMapClient gaodeMapClient;

    /**
     * 根据IP获取位置信息
     */
    public IPLocationResponse getLocationByIp(String ip) {
        ForestResponse<IPLocationResponse> response =
            gaodeMapClient.getLocationByIp(ip, "4");

        if (response.isSuccess() && "1".equals(response.getResult().getStatus())) {
            return response.getResult();
        }
        throw new BusinessException("IP定位失败");
    }

    /**
     * 地址转坐标
     */
    public GeocodingResponse geocoding(String address) {
        ForestResponse<GeocodingResponse> response =
            gaodeMapClient.geocoding(address);
        return response.getResult();
    }

    /**
     * 坐标转地址
     */
    public ReverseGeocodingResponse reverseGeocoding(double lng, double lat) {
        CoordinateUtil.Coordinate coord = new CoordinateUtil.Coordinate(lng, lat);
        ForestResponse<ReverseGeocodingResponse> response =
            gaodeMapClient.reverseGeocoding(coord);
        return response.getResult();
    }

    /**
     * 获取天气信息
     */
    public WeatherResponse getWeather(String adcode) {
        return gaodeMapClient.getWeatherByAdcode(adcode).getResult();
    }

    /**
     * 计算两点距离
     */
    public DistanceResponse calculateDistance(
            double startLng, double startLat,
            double endLng, double endLat) {

        CoordinateUtil.Coordinate start = new CoordinateUtil.Coordinate(startLng, startLat);
        CoordinateUtil.Coordinate end = new CoordinateUtil.Coordinate(endLng, endLat);

        return gaodeMapClient.calculateDistance(start, end).getResult();
    }
}
```

### 火山引擎 TTS 客户端

火山引擎语音合成(TTS)客户端提供高质量的文本转语音服务，支持多种音色和参数配置。

#### 配置属性

```yaml
volcengine:
  tts:
    enabled: false                              # 默认禁用，需配置凭证后启用
    app-id: ${VOLCENGINE_TTS_APP_ID:}           # 应用ID
    access-token: ${VOLCENGINE_TTS_ACCESS_TOKEN:} # 访问令牌
    cluster: volcano_tts                        # 集群名称
    default-voice: BV001_streaming              # 默认音色
    encoding: pcm                               # 音频编码格式
    sample-rate: 24000                          # 采样率
    speed-ratio: 1.0                            # 语速(0.5-2.0)
    volume-ratio: 1.0                           # 音量(0.5-2.0)
    pitch-ratio: 1.0                            # 音调(0.5-2.0)
```

**配置属性类:**

```java
@Data
@ConfigurationProperties(prefix = "volcengine.tts")
public class VolcengineTtsProperties {
    /** 是否启用TTS服务 */
    private Boolean enabled = false;
    /** 应用ID */
    private String appId;
    /** 访问令牌 */
    private String accessToken;
    /** 集群名称 */
    private String cluster = "volcano_tts";
    /** 默认音色 */
    private String defaultVoice = "BV001_streaming";
    /** 音频编码格式 */
    private String encoding = "pcm";
    /** 采样率 */
    private Integer sampleRate = 24000;
    /** 语速比例(0.5-2.0) */
    private Double speedRatio = 1.0;
    /** 音量比例(0.5-2.0) */
    private Double volumeRatio = 1.0;
    /** 音调比例(0.5-2.0) */
    private Double pitchRatio = 1.0;
}
```

#### 客户端接口

```java
@BaseRequest(
    baseURL = "https://openspeech.bytedance.com",
    interceptor = VolcengineTtsInterceptor.class
)
public interface VolcengineTtsClient {

    /**
     * 语音合成 - 完整请求
     * @param request TTS请求对象
     */
    @Post(url = "/api/v1/tts")
    @Headers("Content-Type: application/json")
    ForestResponse<VolcengineTtsResponse> synthesize(@Body VolcengineTtsRequest request);

    /**
     * 语音合成 - 简化方法(指定音色)
     * @param text 要合成的文本
     * @param voiceType 音色类型
     */
    default ForestResponse<VolcengineTtsResponse> synthesize(String text, String voiceType) {
        VolcengineTtsProperties props = SpringUtils.getBean(VolcengineTtsProperties.class);
        VolcengineTtsRequest request = VolcengineTtsRequest.builder()
            .app(VolcengineTtsRequest.AppConfig.builder()
                .appid(props.getAppId())
                .cluster(props.getCluster())
                .build())
            .user(VolcengineTtsRequest.UserConfig.builder()
                .uid(IdUtil.fastSimpleUUID())
                .build())
            .audio(VolcengineTtsRequest.AudioConfig.builder()
                .voiceType(voiceType)
                .encoding(props.getEncoding())
                .rate(props.getSampleRate())
                .speedRatio(props.getSpeedRatio())
                .volumeRatio(props.getVolumeRatio())
                .pitchRatio(props.getPitchRatio())
                .build())
            .request(VolcengineTtsRequest.RequestConfig.builder()
                .reqid(IdUtil.fastSimpleUUID())
                .text(text)
                .textType("plain")
                .operation("query")
                .build())
            .build();
        return synthesize(request);
    }

    /**
     * 语音合成 - 简化方法(使用默认音色)
     * @param text 要合成的文本
     */
    default ForestResponse<VolcengineTtsResponse> synthesize(String text) {
        VolcengineTtsProperties props = SpringUtils.getBean(VolcengineTtsProperties.class);
        return synthesize(text, props.getDefaultVoice());
    }
}
```

#### 请求/响应模型

**请求模型:**

```java
@Data
@Builder
public class VolcengineTtsRequest {
    /** 应用配置 */
    private AppConfig app;
    /** 用户配置 */
    private UserConfig user;
    /** 音频配置 */
    private AudioConfig audio;
    /** 请求配置 */
    private RequestConfig request;

    @Data
    @Builder
    public static class AppConfig {
        private String appid;    // 应用ID
        private String token;    // Token(可选)
        private String cluster;  // 集群名称
    }

    @Data
    @Builder
    public static class UserConfig {
        private String uid;      // 用户标识
    }

    @Data
    @Builder
    public static class AudioConfig {
        private String voiceType;    // 音色类型
        private String encoding;     // 编码格式
        private Integer rate;        // 采样率
        private Double speedRatio;   // 语速
        private Double volumeRatio;  // 音量
        private Double pitchRatio;   // 音调
    }

    @Data
    @Builder
    public static class RequestConfig {
        private String reqid;     // 请求ID
        private String text;      // 合成文本
        private String textType;  // 文本类型(plain/ssml)
        private String operation; // 操作类型
    }
}
```

**响应模型:**

```java
@Data
public class VolcengineTtsResponse {
    /** 状态码(3000表示成功) */
    private Integer code;
    /** 状态消息 */
    private String message;
    /** 请求ID */
    private String reqid;
    /** 操作类型 */
    private String operation;
    /** 序列号 */
    private Integer sequence;
    /** 音频数据(Base64编码) */
    private String data;
    /** 音频时长(毫秒) */
    private Integer duration;

    /**
     * 判断请求是否成功
     */
    public boolean isSuccess() {
        return code != null && code == 3000;
    }
}
```

#### 拦截器实现

```java
@Slf4j
public class VolcengineTtsInterceptor implements ForestInterceptor<Object> {

    @Override
    public boolean beforeExecute(ForestRequest request) {
        VolcengineTtsProperties properties = SpringUtils.getBean(VolcengineTtsProperties.class);

        // 检查服务是否启用
        if (!properties.getEnabled()) {
            log.warn("火山引擎TTS服务未启用");
            return false;
        }

        // 添加Bearer Token认证
        request.addHeader("Authorization", "Bearer;" + properties.getAccessToken());
        return true;
    }

    @Override
    public void onError(ForestRuntimeException ex, ForestRequest request, ForestResponse response) {
        log.error("TTS请求失败: {}", ex.getMessage());
    }
}
```

#### 使用示例

```java
@Service
@RequiredArgsConstructor
public class TtsService {

    private final VolcengineTtsClient ttsClient;

    /**
     * 文本转语音 - 使用默认音色
     */
    public byte[] textToSpeech(String text) {
        ForestResponse<VolcengineTtsResponse> response = ttsClient.synthesize(text);

        if (response.isSuccess() && response.getResult().isSuccess()) {
            // Base64解码获取音频数据
            return Base64.getDecoder().decode(response.getResult().getData());
        }
        throw new BusinessException("语音合成失败: " + response.getResult().getMessage());
    }

    /**
     * 文本转语音 - 指定音色
     */
    public byte[] textToSpeech(String text, String voiceType) {
        ForestResponse<VolcengineTtsResponse> response =
            ttsClient.synthesize(text, voiceType);

        if (response.isSuccess() && response.getResult().isSuccess()) {
            return Base64.getDecoder().decode(response.getResult().getData());
        }
        throw new BusinessException("语音合成失败");
    }

    /**
     * 文本转语音 - 保存到文件
     */
    public void textToSpeechFile(String text, String outputPath) throws IOException {
        byte[] audioData = textToSpeech(text);
        Files.write(Path.of(outputPath), audioData);
    }
}
```

## 自定义客户端开发

### 完整开发流程

开发自定义HTTP客户端需要以下步骤:

**1. 定义配置属性类:**

```java
@Data
@ConfigurationProperties(prefix = "myservice")
public class MyServiceProperties {
    /** 是否启用 */
    private Boolean enabled = true;
    /** API Key */
    private String apiKey;
    /** API Secret */
    private String apiSecret;
    /** 基础URL */
    private String baseUrl = "https://api.myservice.com";
    /** 请求超时(毫秒) */
    private Integer timeout = 5000;
}
```

**2. 定义客户端接口:**

```java
@BaseRequest(
    baseURL = "${myservice.base-url}",  // 支持配置占位符
    interceptor = MyServiceInterceptor.class
)
public interface MyServiceClient {

    @Get(url = "/api/v1/users/{id}")
    ForestResponse<User> getUserById(@Var("id") String userId);

    @Post(url = "/api/v1/users")
    @Headers("Content-Type: application/json")
    ForestResponse<User> createUser(@Body User user);

    @Put(url = "/api/v1/users/{id}")
    @Headers("Content-Type: application/json")
    ForestResponse<User> updateUser(@Var("id") String userId, @Body User user);

    @Delete(url = "/api/v1/users/{id}")
    ForestResponse<Void> deleteUser(@Var("id") String userId);

    @Get(url = "/api/v1/users")
    ForestResponse<PageResult<User>> listUsers(
        @Query("page") int page,
        @Query("size") int size,
        @Query("keyword") String keyword
    );
}
```

**3. 实现拦截器:**

```java
@Slf4j
public class MyServiceInterceptor implements ForestInterceptor<Object> {

    @Override
    public boolean beforeExecute(ForestRequest request) {
        MyServiceProperties props = SpringUtils.getBean(MyServiceProperties.class);

        // 检查服务状态
        if (!props.getEnabled()) {
            log.warn("MyService服务未启用");
            return false;
        }

        // 添加认证头
        request.addHeader("X-API-Key", props.getApiKey());
        request.addHeader("X-API-Secret", props.getApiSecret());

        // 添加请求追踪ID
        request.addHeader("X-Request-Id", IdUtil.fastSimpleUUID());

        // 添加时间戳(用于签名验证)
        request.addHeader("X-Timestamp", String.valueOf(System.currentTimeMillis()));

        return true;
    }

    @Override
    public void onSuccess(Object data, ForestRequest request, ForestResponse response) {
        log.debug("请求成功: {} {} - {}ms",
            request.getType(), request.getUrl(), response.getTime());
    }

    @Override
    public void onError(ForestRuntimeException ex, ForestRequest request, ForestResponse response) {
        log.error("请求失败: {} {} - {}",
            request.getType(), request.getUrl(), ex.getMessage());
    }
}
```

**4. 注册配置属性:**

在自动配置类中添加配置属性注册:

```java
@AutoConfiguration
@EnableConfigurationProperties({
    GaodeMapProperties.class,
    VolcengineTtsProperties.class,
    MyServiceProperties.class  // 添加自定义配置
})
public class HttpAutoConfiguration {
    // ...
}
```

**5. 配置文件:**

```yaml
myservice:
  enabled: true
  api-key: ${MY_SERVICE_API_KEY:}
  api-secret: ${MY_SERVICE_API_SECRET:}
  base-url: https://api.myservice.com
  timeout: 5000
```

### 高级特性

#### 异步调用

```java
@BaseRequest(baseURL = "https://api.example.com")
public interface AsyncApiClient {

    // 返回 Future 实现异步调用
    @Get(url = "/api/data")
    Future<ForestResponse<Data>> getDataAsync();

    // 使用回调方式
    @Get(url = "/api/data")
    void getDataCallback(OnSuccess<Data> onSuccess, OnError onError);
}
```

#### 文件上传

```java
@BaseRequest(baseURL = "https://api.example.com")
public interface FileUploadClient {

    @Post(url = "/api/upload")
    @Headers("Content-Type: multipart/form-data")
    ForestResponse<UploadResult> uploadFile(
        @DataFile("file") File file,
        @Body("name") String fileName
    );
}
```

#### 文件下载

```java
@BaseRequest(baseURL = "https://api.example.com")
public interface FileDownloadClient {

    @Get(url = "/api/download/{fileId}")
    ForestResponse<byte[]> downloadFile(@Var("fileId") String fileId);

    @Get(url = "/api/download/{fileId}")
    void downloadToFile(@Var("fileId") String fileId, @DataFile File targetFile);
}
```

## 最佳实践

### 1. 配置管理

```yaml
# 敏感信息通过环境变量注入
myservice:
  api-key: ${MY_SERVICE_API_KEY}        # 不要硬编码
  api-secret: ${MY_SERVICE_API_SECRET}
```

### 2. 异常处理

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final MyServiceClient client;

    public User getUserById(String userId) {
        try {
            ForestResponse<User> response = client.getUserById(userId);

            if (response.isSuccess()) {
                return response.getResult();
            }

            // 根据状态码处理不同错误
            int statusCode = response.getStatusCode();
            if (statusCode == 404) {
                throw new BusinessException("用户不存在");
            } else if (statusCode == 401) {
                throw new BusinessException("认证失败");
            }
            throw new BusinessException("获取用户失败: HTTP " + statusCode);

        } catch (ForestNetworkException e) {
            log.error("网络连接失败", e);
            throw new BusinessException("网络连接失败，请稍后重试");
        } catch (ForestRuntimeException e) {
            log.error("调用服务失败", e);
            throw new BusinessException("服务不可用");
        }
    }
}
```

### 3. 重试机制

```java
@BaseRequest(
    baseURL = "https://api.example.com",
    retryCount = 3,           // 重试3次
    maxRetryInterval = 1000   // 最大重试间隔1秒
)
public interface RetryableClient {

    @Get(url = "/api/data", retryCount = 5)  // 方法级别覆盖
    ForestResponse<Data> getData();
}
```

### 4. 性能优化

```yaml
# 高并发场景增大连接池
forest:
  max-connections: 2000
  max-route-connections: 1000
  # 启用连接复用
  keep-alive: true
```

### 5. 日志管理

```java
@Slf4j
public class LoggingInterceptor implements ForestInterceptor<Object> {

    @Override
    public boolean beforeExecute(ForestRequest req) {
        log.info(">>> {} {}", req.getType(), req.getUrl());
        if (log.isDebugEnabled()) {
            log.debug("请求头: {}", req.getHeaders());
            log.debug("请求体: {}", req.getBody());
        }
        return true;
    }

    @Override
    public void afterExecute(ForestRequest req, ForestResponse res) {
        log.info("<<< {} - {} - {}ms",
            res.getStatusCode(),
            res.isSuccess() ? "SUCCESS" : "FAILED",
            res.getTime());
    }
}
```

## 常见问题

### 1. 连接超时

**问题原因:**
- 超时时间设置过短
- 目标服务响应慢
- 网络延迟高

**解决方案:**

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

**问题原因:**
- 响应包含未定义字段
- 类型不匹配

**解决方案:**

模块已配置忽略未知属性(`FAIL_ON_UNKNOWN_PROPERTIES=false`)。如仍有问题，在实体类添加:

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class MyResponse { }
```

### 3. 拦截器未生效

**问题原因:**
- 未在 `@BaseRequest` 中指定拦截器
- 拦截器类未正确实现

**解决方案:**

```java
@BaseRequest(
    baseURL = "https://api.example.com",
    interceptor = MyInterceptor.class  // 必须指定
)
public interface MyApiClient { }
```

### 4. 参数未正确传递

**问题原因:**
- 使用了错误的注解
- 参数名不匹配

**解决方案:**

```java
// Query 参数 - 拼接到URL
@Query("page") int page

// Path 变量 - 替换URL中的{xxx}
@Var("id") String userId

// 请求体 - 序列化为JSON
@Body User user
```

### 5. 连接池耗尽

**问题原因:**
- 并发请求过多
- 连接未正确释放

**解决方案:**

```yaml
forest:
  max-connections: 2000
  max-route-connections: 1000
```

或使用异步调用避免阻塞:

```java
@Get(url = "/api/data")
Future<ForestResponse<Data>> getDataAsync();
```

## API 参考

### @BaseRequest 属性

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `baseURL` | 基础 URL | - |
| `headers` | 公共请求头 | `[]` |
| `interceptor` | 拦截器类 | - |
| `timeout` | 超时时间(ms) | 全局配置 |
| `retryCount` | 重试次数 | 全局配置 |
| `connectTimeout` | 连接超时(ms) | 全局配置 |
| `readTimeout` | 读取超时(ms) | 全局配置 |

### HTTP方法注解

| 注解 | 说明 | 属性 |
|------|------|------|
| `@Get` | GET请求 | url, timeout, retryCount |
| `@Post` | POST请求 | url, timeout, retryCount |
| `@Put` | PUT请求 | url, timeout, retryCount |
| `@Delete` | DELETE请求 | url, timeout, retryCount |
| `@Patch` | PATCH请求 | url, timeout, retryCount |
| `@Head` | HEAD请求 | url, timeout, retryCount |
| `@Options` | OPTIONS请求 | url, timeout, retryCount |

### 参数注解

| 注解 | 说明 | 示例 |
|------|------|------|
| `@Query` | URL查询参数 | `@Query("page") int page` |
| `@Var` | URL路径变量 | `@Var("id") String id` |
| `@Body` | 请求体 | `@Body User user` |
| `@Header` | 单个请求头 | `@Header("Token") String token` |
| `@DataFile` | 文件参数 | `@DataFile("file") File file` |

### ForestResponse 方法

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `getResult()` | 获取响应结果(自动反序列化) | `T` |
| `getContent()` | 获取原始响应内容 | `String` |
| `getStatusCode()` | 获取 HTTP 状态码 | `int` |
| `isSuccess()` | 是否成功(2xx) | `boolean` |
| `getHeaders()` | 获取响应头 | `ForestHeaderMap` |
| `getTime()` | 获取请求耗时(ms) | `long` |
| `getException()` | 获取异常对象 | `Throwable` |

### ForestRequest 方法

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `addQuery(name, value)` | 添加查询参数 | `ForestRequest` |
| `addHeader(name, value)` | 添加请求头 | `ForestRequest` |
| `getUrl()` | 获取请求 URL | `String` |
| `getType()` | 获取请求方法 | `ForestRequestType` |
| `getBody()` | 获取请求体 | `ForestBody` |
| `execute()` | 执行请求 | `ForestResponse` |

## 总结

ruoyi-common-http 核心要点:

1. **声明式 API** - 接口 + 注解定义 HTTP 请求，代码简洁易维护
2. **拦截器机制** - 统一处理认证、签名、日志等横切关注点
3. **内置客户端** - 高德地图(5个API)、火山引擎 TTS 开箱即用
4. **智能序列化** - ForestJacksonConverter 自动处理JSON转换，容错性强
5. **多环境支持** - 通过配置文件实现开发/测试/生产环境隔离
6. **敏感信息** - 通过环境变量注入 API Key，确保安全
7. **性能优化** - 连接池、异步调用、重试机制等完善支持
