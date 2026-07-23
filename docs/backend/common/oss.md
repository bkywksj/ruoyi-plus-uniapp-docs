# OSS 对象存储模块

## 概述

OSS（Object Storage Service）对象存储模块为若依系统提供了统一的文件存储服务，支持本地存储和多种云存储服务。该模块基于策略模式设计，具有良好的扩展性和可维护性。

### 主要特性

- <Icon icon="lucide:rocket" /> **多存储支持**：支持本地存储、阿里云OSS、腾讯云COS、七牛云、华为云OBS、MinIO等
- <Icon icon="lucide:lock" /> **安全可靠**：支持预签名URL、访问权限控制、文件完整性校验
- <Icon icon="lucide:target" /> **高性能**：基于AWS S3 SDK v2异步客户端与Netty，支持大文件传输
- <Icon icon="lucide:wrench" /> **易于配置**：支持动态配置切换，无需重启应用
- <Icon icon="lucide:chart-column" /> **多租户**：支持租户数据隔离，文件路径自动包含租户ID
- <Icon icon="lucide:palette" /> **灵活路径**：支持自定义文件存储路径规则
- <Icon icon="lucide:refresh-cw" /> **线程安全**：客户端工厂采用双重检查锁定模式，确保并发安全
- <Icon icon="lucide:zap" /> **智能缓存**：配置信息缓存至Redis，客户端实例按租户缓存

### 支持的存储类型

| 存储类型 | 配置键 | 枚举值 | 说明 |
|---------|--------|--------|------|
| 本地存储 | `local` | `LOCAL` | 存储在应用服务器本地文件系统 |
| 阿里云OSS | `aliyun` | `ALIYUN` | 阿里云对象存储服务 |
| 腾讯云COS | `qcloud` | `QCLOUD` | 腾讯云对象存储服务 |
| 七牛云 | `qiniu` | `QINIU` | 七牛云对象存储服务 |
| 华为云OBS | `obs` | `OBS` | 华为云对象存储服务 |
| MinIO | `minio` | `MINIO` | 开源S3兼容对象存储 |

### 存储类型枚举

```java
public enum OssType {
    LOCAL("local"),     // 本地存储
    ALIYUN("aliyun"),   // 阿里云OSS
    QCLOUD("qcloud"),   // 腾讯云COS
    QINIU("qiniu"),     // 七牛云
    OBS("obs"),         // 华为云OBS
    MINIO("minio");     // MinIO

    private final String value;

    OssType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
```

## 模块架构

### 目录结构

```text
ruoyi-common-oss/
├── src/main/java/plus/ruoyi/common/oss/
│   ├── constant/                    # 常量定义
│   │   └── OssConstant.java         # OSS相关常量
│   ├── core/                        # 核心类
│   │   └── OssClient.java           # OSS客户端门面
│   ├── entity/                      # 实体类
│   │   ├── OssClientConfig.java     # 客户端配置实体
│   │   ├── OssFileInfo.java         # 文件信息
│   │   ├── OssFileMetadata.java     # 文件元数据
│   │   └── UploadResult.java        # 上传结果
│   ├── enums/                       # 枚举类
│   │   ├── AccessPolicyType.java    # 访问策略枚举
│   │   └── OssType.java             # OSS类型枚举
│   ├── exception/                   # 异常类
│   │   └── OssException.java        # OSS业务异常
│   ├── factory/                     # 工厂类
│   │   ├── OssFactory.java          # OSS客户端工厂
│   │   └── OssStrategyFactory.java  # 策略工厂
│   ├── properties/                  # 配置属性
│   │   └── OssProperties.java       # OSS配置属性
│   └── service/                     # 服务接口和实现
│       ├── OssStrategy.java         # 策略接口
│       └── impl/
│           ├── LocalOssStrategy.java   # 本地存储策略
│           └── S3OssStrategy.java      # S3兼容存储策略
└── pom.xml
```

### 架构设计

OSS模块采用**策略模式**设计，通过抽象策略接口实现多种存储方式的统一管理：

```text
┌─────────────────────────────────────────────────────────────────┐
│                         OssClient                                │
│                      (门面/Facade)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - configKey: String                                      │   │
│  │  - ossClientConfig: OssClientConfig                       │   │
│  │  - strategy: OssStrategy                                  │   │
│  │  + upload*(...)                                           │   │
│  │  + download*(...)                                         │   │
│  │  + generatePresignedUrl(...)                              │   │
│  │  + getPath(suffix, moduleName)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       OssStrategy                                │
│                      (策略接口)                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  + uploadFile(file, key, md5, contentType)                │   │
│  │  + uploadFile(bytes, key, md5, contentType)               │   │
│  │  + uploadFile(stream, key, length, md5, contentType)      │   │
│  │  + deleteFile(key)                                        │   │
│  │  + copyFile(source, target)                               │   │
│  │  + generatePresignedUrl(key, expiration)                  │   │
│  │  + generatePresignedUploadUrl(key, contentType, exp)      │   │
│  │  + getBaseUrl()                                           │   │
│  │  + close()                                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   LocalOssStrategy      │     │    S3OssStrategy        │
│    (本地存储实现)        │     │   (S3兼容存储实现)       │
│ ┌─────────────────────┐ │     │ ┌─────────────────────┐ │
│ │ - uploadPath        │ │     │ │ - client: S3Async   │ │
│ │ - domain            │ │     │ │ - transferManager   │ │
│ │ + Hutool文件操作     │ │     │ │ - presigner         │ │
│ └─────────────────────┘ │     │ │ + AWS SDK v2操作    │ │
└─────────────────────────┘     │ └─────────────────────┘ │
                                └─────────────────────────┘
```

### 工厂模式

```text
┌─────────────────────────────────────────────────────────────────┐
│                        OssFactory                                │
│                     (客户端工厂)                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - CLIENT_CACHE: ConcurrentHashMap<String, OssClient>     │   │
│  │  - LOCK: ReentrantLock                                    │   │
│  │  + instance(): OssClient           // 获取默认客户端       │   │
│  │  + instance(configKey): OssClient  // 根据配置键获取       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              OssStrategyFactory                            │   │
│  │  + createStrategy(configKey, config): OssStrategy         │   │
│  │    - "local" → LocalOssStrategy                           │   │
│  │    - 其他    → S3OssStrategy                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 核心组件

### OssClient 客户端门面

`OssClient` 是对象存储的核心客户端门面类，封装了所有文件操作接口，并负责文件路径的生成。

#### 核心属性

```java
public class OssClient {
    /** 配置键 */
    private final String configKey;
    /** 配置对象 */
    private final OssClientConfig ossClientConfig;
    /** 存储策略 */
    private final OssStrategy strategy;
}
```

#### 路径生成机制

`OssClient` 内部实现了智能的文件路径生成逻辑，确保文件路径包含租户隔离：

```java
/**
 * 生成文件存储路径
 * 路径格式: [{prefix}/]{tenantId}/[{moduleName}/]{datePath}/{uuid}{suffix}
 */
private String getPath(String suffix, String moduleName) {
    String prefix = ossClientConfig.getPrefix();
    String tenantId = SpringUtils.getBean(TenantService.class).getTenantId();
    String datePath = DateUtils.datePath();  // yyyy/MM/dd
    String uuid = IdUtil.fastSimpleUUID();    // 32位简化UUID

    StringBuilder pathBuilder = new StringBuilder();

    // 1. 添加前缀（可选）
    if (StrUtil.isNotBlank(prefix)) {
        pathBuilder.append(prefix).append("/");
    }

    // 2. 添加租户ID（必须）
    pathBuilder.append(tenantId).append("/");

    // 3. 添加模块名（可选）
    if (StrUtil.isNotBlank(moduleName)) {
        pathBuilder.append(moduleName).append("/");
    }

    // 4. 添加日期路径和文件名
    pathBuilder.append(datePath).append("/").append(uuid).append(suffix);

    return pathBuilder.toString();
}
```

#### 路径示例

| 场景 | 前缀 | 模块名 | 生成路径 |
|------|------|--------|----------|
| 基础上传 | 无 | 无 | `tenant001/2024/01/15/abc123def456.jpg` |
| 带前缀 | `uploads` | 无 | `uploads/tenant001/2024/01/15/abc123def456.jpg` |
| 带模块 | 无 | `avatar` | `tenant001/avatar/2024/01/15/abc123def456.jpg` |
| 完整路径 | `uploads` | `avatar` | `uploads/tenant001/avatar/2024/01/15/abc123def456.jpg` |

#### 配置校验

`OssClient` 提供了配置变更检测方法：

```java
/**
 * 检查OSS客户端配置是否相同
 * 用于工厂判断是否需要重新创建客户端
 */
public boolean checkOssClientConfigSame(OssClientConfig ossClientConfig) {
    return this.ossClientConfig.equals(ossClientConfig);
}
```

### OssFactory 客户端工厂

`OssFactory` 是线程安全的客户端工厂，采用双重检查锁定模式管理客户端实例的缓存和创建。

#### 核心实现

```java
public class OssFactory {
    /** 客户端缓存（按租户+配置键） */
    private static final Map<String, OssClient> CLIENT_CACHE = new ConcurrentHashMap<>();

    /** 可重入锁，保证线程安全 */
    private static final ReentrantLock LOCK = new ReentrantLock();

    /**
     * 获取OSS客户端实例
     * 1. 从Redis读取配置
     * 2. 构建缓存键（租户ID:配置键）
     * 3. 双重检查锁定获取或创建客户端
     */
    public static OssClient instance(String configKey) {
        // 从Redis获取配置JSON
        String json = CacheUtils.get(CacheNames.SYS_OSS_CONFIG, configKey);
        if (StrUtil.isBlank(json)) {
            throw new OssException("系统异常, '" + configKey + "'配置信息不存在!");
        }

        // 解析配置
        OssClientConfig ossClientConfig = JsonUtils.parseObject(json, OssClientConfig.class);

        // 构建缓存键（多租户场景下包含租户ID）
        String cacheKey = configKey;
        if (StringUtils.isNotBlank(ossClientConfig.getTenantId())) {
            cacheKey = ossClientConfig.getTenantId() + ":" + configKey;
        }

        // 尝试从缓存获取
        OssClient client = CLIENT_CACHE.get(cacheKey);

        // 检查是否需要创建或更新客户端
        if (client == null || !client.checkOssClientConfigSame(ossClientConfig)) {
            LOCK.lock();
            try {
                // 双重检查
                client = CLIENT_CACHE.get(cacheKey);
                if (client == null || !client.checkOssClientConfigSame(ossClientConfig)) {
                    // 创建新客户端并缓存
                    CLIENT_CACHE.put(cacheKey, new OssClient(configKey, ossClientConfig));
                    client = CLIENT_CACHE.get(cacheKey);
                }
            } finally {
                LOCK.unlock();
            }
        }
        return client;
    }

    /**
     * 获取默认OSS客户端
     */
    public static OssClient instance() {
        // 从Redis获取默认配置键
        String defaultConfigKey = CacheUtils.get(CacheNames.SYS_OSS_CONFIG, OssConstant.DEFAULT_CONFIG_KEY);
        return instance(defaultConfigKey);
    }
}
```

#### 缓存策略

| 特性 | 说明 |
|------|------|
| 缓存容器 | `ConcurrentHashMap<String, OssClient>` |
| 缓存键格式 | `{tenantId}:{configKey}` 或 `{configKey}` |
| 线程安全 | `ReentrantLock` 双重检查锁定 |
| 配置变更检测 | 对比配置对象自动刷新客户端 |

### OssStrategyFactory 策略工厂

策略工厂负责根据配置键创建对应的存储策略实现：

```java
public class OssStrategyFactory {

    /**
     * 创建OSS存储策略
     * @param configKey 配置键
     * @param ossClientConfig 配置对象
     * @return 对应的存储策略实现
     */
    public static OssStrategy createStrategy(String configKey, OssClientConfig ossClientConfig) {
        // 本地存储使用专门的策略
        if (Constants.LOCAL.equals(configKey)) {
            return new LocalOssStrategy(configKey, ossClientConfig);
        }
        // 其他存储类型统一使用S3兼容策略
        return new S3OssStrategy(configKey, ossClientConfig);
    }
}
```

### OssStrategy 策略接口

策略接口定义了所有存储操作的标准方法：

```java
public interface OssStrategy extends AutoCloseable {

    // ==================== 文件上传 ====================

    /** 上传文件（File对象） */
    UploadResult uploadFile(File file, String key, String md5Digest, String contentType);

    /** 上传文件（字节数组） */
    UploadResult uploadFile(byte[] data, String key, String md5Digest, String contentType);

    /** 上传文件（输入流） */
    UploadResult uploadFile(InputStream inputStream, String key, Long length,
                           String md5Digest, String contentType);

    // ==================== 文件下载 ====================

    /** 下载到临时文件 */
    Path downloadToTempFile(String key);

    /** 下载到输出流 */
    void downloadToStream(String key, OutputStream outputStream,
                         Consumer<Long> fileSizeConsumer);

    /** 获取文件输入流 */
    InputStream getFileAsStream(String key);

    // ==================== 文件管理 ====================

    /** 删除文件 */
    void deleteFile(String key);

    /** 复制文件 */
    void copyFile(String sourceKey, String targetKey);

    /** 获取文件元数据 */
    OssFileMetadata getFileMetadata(String key);

    /** 列出文件 */
    List<OssFileInfo> listFiles(String prefix, int maxKeys);

    // ==================== URL生成 ====================

    /** 生成预签名下载URL */
    String generatePresignedUrl(String key, Duration expiredTime);

    /** 生成预签名上传URL */
    String generatePresignedUploadUrl(String key, String contentType, int expiration);

    /** 获取存储基础URL */
    String getBaseUrl();

    // ==================== 资源管理 ====================

    /** 关闭策略，释放资源 */
    @Override
    void close();
}
```

## 存储策略实现

### S3OssStrategy S3兼容存储

`S3OssStrategy` 基于AWS SDK v2实现，支持所有S3协议兼容的云存储服务。

#### 核心组件

```java
public class S3OssStrategy implements OssStrategy {
    /** 配置键 */
    private final String configKey;
    /** 配置对象 */
    private final OssClientConfig ossClientConfig;
    /** S3异步客户端（基于Netty） */
    private final S3AsyncClient client;
    /** 传输管理器（支持大文件） */
    private final S3TransferManager transferManager;
    /** URL预签名器 */
    private final S3Presigner presigner;
}
```

#### 初始化过程

```java
public S3OssStrategy(String configKey, OssClientConfig ossClientConfig) {
    this.configKey = configKey;
    this.ossClientConfig = ossClientConfig;

    // 1. 创建凭证提供者
    StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(
        AwsBasicCredentials.create(
            ossClientConfig.getAccessKey(),
            ossClientConfig.getSecretKey()
        )
    );

    // 2. 判断是否使用路径样式访问（MinIO等需要）
    boolean isStyle = !isCloudService();

    // 3. 创建S3异步客户端
    this.client = S3AsyncClient.builder()
        .credentialsProvider(credentialsProvider)
        .endpointOverride(URI.create(getEndpoint()))
        .region(of())
        .forcePathStyle(isStyle)
        .httpClient(NettyNioAsyncHttpClient.builder()
            .connectionTimeout(Duration.ofSeconds(60))
            .build())
        .build();

    // 4. 创建传输管理器
    this.transferManager = S3TransferManager.builder()
        .s3Client(this.client)
        .build();

    // 5. 创建预签名器
    this.presigner = S3Presigner.builder()
        .credentialsProvider(credentialsProvider)
        .endpointOverride(URI.create(getEndpoint()))
        .region(of())
        .build();

    // 6. 创建存储桶（如果不存在）
    createBucket();
}
```

#### 云服务检测

系统通过配置键判断是否为云服务，以决定访问样式：

```java
/** 云服务配置键数组 */
private static final String[] CLOUD_SERVICE = {"aliyun", "qcloud", "qiniu", "obs"};

/**
 * 判断是否为云服务
 * 云服务使用虚拟主机样式，非云服务使用路径样式
 */
private boolean isCloudService() {
    return ArrayUtil.containsIgnoreCase(CLOUD_SERVICE, configKey);
}
```

| 存储类型 | 访问样式 | URL格式 |
|---------|---------|---------|
| 阿里云/腾讯云/七牛云/华为云 | 虚拟主机样式 | `https://bucket.endpoint/key` |
| MinIO/本地S3 | 路径样式 | `https://endpoint/bucket/key` |

#### 文件上传实现

```java
@Override
public UploadResult uploadFile(InputStream inputStream, String key, Long length,
                               String md5Digest, String contentType) {
    try {
        // 构建上传请求
        PutObjectRequest.Builder builder = PutObjectRequest.builder()
            .bucket(ossClientConfig.getBucketName())
            .key(key)
            .contentType(contentType)
            .contentLength(length)
            .acl(getAccessPolicy().getAcl());

        // 设置MD5校验（可选）
        if (StrUtil.isNotBlank(md5Digest)) {
            builder.contentMD5(md5Digest);
        }

        // 执行异步上传
        AsyncRequestBody body = AsyncRequestBody.fromInputStream(
            inputStream, length, Runnable::run);
        PutObjectResponse response = client.putObject(builder.build(), body)
            .get(60, TimeUnit.SECONDS);

        // 构建上传结果
        return UploadResult.builder()
            .url(getBaseUrl() + "/" + key)
            .fileName(key)
            .fileSize(length)
            .eTag(response.eTag())
            .build();

    } catch (Exception e) {
        throw new OssException("文件上传失败: " + e.getMessage());
    }
}
```

#### 预签名URL生成

```java
@Override
public String generatePresignedUrl(String key, Duration expiredTime) {
    // 构建预签名请求
    GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(ossClientConfig.getBucketName())
        .key(key)
        .build();

    GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
        .signatureDuration(expiredTime)
        .getObjectRequest(getObjectRequest)
        .build();

    // 生成预签名URL
    PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
    return presignedRequest.url().toString();
}

@Override
public String generatePresignedUploadUrl(String key, String contentType, int expiration) {
    // 构建上传预签名请求
    PutObjectRequest putObjectRequest = PutObjectRequest.builder()
        .bucket(ossClientConfig.getBucketName())
        .key(key)
        .contentType(contentType)
        .build();

    PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
        .signatureDuration(Duration.ofSeconds(expiration))
        .putObjectRequest(putObjectRequest)
        .build();

    // 生成预签名URL
    PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);
    return presignedRequest.url().toString();
}
```

### LocalOssStrategy 本地存储

`LocalOssStrategy` 实现本地文件系统存储，适用于单机部署或开发测试环境。

#### 核心属性

```java
public class LocalOssStrategy implements OssStrategy {
    /** 配置键 */
    private final String configKey;
    /** 配置对象 */
    private final OssClientConfig ossClientConfig;
    /** 本地上传路径 */
    private final String uploadPath;
    /** 资源访问域名 */
    private final String domain;
}
```

#### 初始化过程

```java
public LocalOssStrategy(String configKey, OssClientConfig ossClientConfig) {
    this.configKey = configKey;
    this.ossClientConfig = ossClientConfig;

    // 获取应用配置的上传路径
    AppProperties appProperties = SpringUtils.getBean(AppProperties.class);
    this.uploadPath = appProperties.getUploadPath();

    // 获取访问域名
    this.domain = ossClientConfig.getDomain();

    // 确保上传目录存在
    FileUtil.mkdir(uploadPath);
}
```

#### 文件上传实现

```java
@Override
public UploadResult uploadFile(File file, String key, String md5Digest, String contentType) {
    try {
        // 构建目标路径
        String targetPath = uploadPath + "/" + key;

        // 确保父目录存在
        FileUtil.mkParentDirs(targetPath);

        // 复制文件
        FileUtil.copy(file, new File(targetPath), true);

        // 计算文件哈希
        String eTag = SecureUtil.md5(file);

        // 构建上传结果
        return UploadResult.builder()
            .url(getBaseUrl() + "/" + key)
            .fileName(key)
            .fileSize(file.length())
            .eTag(eTag)
            .build();

    } catch (Exception e) {
        throw new OssException("本地文件上传失败: " + e.getMessage());
    }
}

@Override
public UploadResult uploadFile(InputStream inputStream, String key, Long length,
                               String md5Digest, String contentType) {
    try {
        // 构建目标路径
        String targetPath = uploadPath + "/" + key;

        // 确保父目录存在
        FileUtil.mkParentDirs(targetPath);

        // 写入文件
        File targetFile = FileUtil.writeFromStream(inputStream, targetPath);

        // 计算文件哈希
        String eTag = SecureUtil.md5(targetFile);

        return UploadResult.builder()
            .url(getBaseUrl() + "/" + key)
            .fileName(key)
            .fileSize(targetFile.length())
            .eTag(eTag)
            .build();

    } catch (Exception e) {
        throw new OssException("本地文件上传失败: " + e.getMessage());
    }
}
```

#### 文件下载实现

```java
@Override
public Path downloadToTempFile(String key) {
    try {
        // 构建源文件路径
        String sourcePath = uploadPath + "/" + key;
        File sourceFile = new File(sourcePath);

        if (!sourceFile.exists()) {
            throw new OssException("文件不存在: " + key);
        }

        // 创建临时文件
        String suffix = FileUtil.getSuffix(key);
        Path tempFile = Files.createTempFile("oss_", "." + suffix);

        // 复制到临时文件
        FileUtil.copy(sourceFile, tempFile.toFile(), true);

        return tempFile;

    } catch (Exception e) {
        throw new OssException("文件下载失败: " + e.getMessage());
    }
}

@Override
public InputStream getFileAsStream(String key) {
    try {
        String filePath = uploadPath + "/" + key;
        return new FileInputStream(filePath);
    } catch (FileNotFoundException e) {
        throw new OssException("文件不存在: " + key);
    }
}
```

#### 基础URL生成

```java
@Override
public String getBaseUrl() {
    // 优先使用配置的域名
    if (StrUtil.isNotBlank(domain)) {
        return domain + OssConstant.RESOURCE_PREFIX;
    }
    // 返回默认资源前缀
    return OssConstant.RESOURCE_PREFIX;
}
```

## 配置管理

### 配置实体

```java
@Data
public class OssClientConfig {
    /** 租户ID */
    private String tenantId;
    /** 配置键 */
    private String configKey;
    /** 访问端点 */
    private String endpoint;
    /** 自定义域名 */
    private String domain;
    /** 访问密钥 */
    private String accessKey;
    /** 私有密钥 */
    private String secretKey;
    /** 存储桶名称 */
    private String bucketName;
    /** 文件路径前缀 */
    private String prefix;
    /** 存储区域 */
    private String region;
    /** 是否使用HTTPS */
    private String isHttps;
    /** 访问策略 */
    private String accessPolicy;
}
```

### 配置项说明

| 配置项 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `tenantId` | String | 否 | 租户ID | `tenant001` |
| `configKey` | String | 是 | 配置键，用于区分不同配置 | `aliyun`、`minio` |
| `endpoint` | String | 是 | 访问端点URL | `oss-cn-beijing.aliyuncs.com` |
| `domain` | String | 否 | 自定义访问域名 | `https://cdn.example.com` |
| `accessKey` | String | 是 | 访问密钥ID | `LTAI5txxxxxxxx` |
| `secretKey` | String | 是 | 访问密钥密码 | `xxxxxxxx` |
| `bucketName` | String | 是 | 存储桶名称 | `my-bucket` |
| `prefix` | String | 否 | 文件路径前缀 | `uploads` |
| `region` | String | 是 | 存储区域 | `cn-beijing`、`us-east-1` |
| `isHttps` | String | 是 | 是否HTTPS | `1`（是）、`0`（否） |
| `accessPolicy` | String | 是 | 访问策略 | `0`（私有）、`1`（公共）、`2`（自定义） |

### 访问策略类型

```java
@Getter
@AllArgsConstructor
public enum AccessPolicyType {
    /** 私有访问 - bucket-owner-full-control */
    PRIVATE("0", ObjectCannedACL.BUCKET_OWNER_FULL_CONTROL),

    /** 公共读写 - public-read-write */
    PUBLIC("1", ObjectCannedACL.PUBLIC_READ_WRITE),

    /** 自定义（公共读） - public-read */
    CUSTOM("2", ObjectCannedACL.PUBLIC_READ);

    /** 策略值 */
    private final String value;

    /** S3 ACL枚举 */
    private final ObjectCannedACL acl;

    /**
     * 根据值获取访问策略类型
     */
    public static AccessPolicyType getByValue(String value) {
        for (AccessPolicyType type : values()) {
            if (type.getValue().equals(value)) {
                return type;
            }
        }
        throw new OssException("未知的访问策略类型: " + value);
    }
}
```

### 配置缓存

OSS配置存储在Redis中，使用以下缓存名称：

```java
public class CacheNames {
    /** OSS配置缓存 */
    public static final String SYS_OSS_CONFIG = "sys_oss:config";
}
```

缓存键格式：
- 配置数据：`sys_oss:config:{configKey}`
- 默认配置键：`sys_oss:config:default_config`

### 本地存储配置

本地存储需要在应用配置中指定上传路径：

```yaml
app:
  # 本地文件上传路径
  uploadPath: /data/uploads
  # 资源访问域名（可选）
  domain: https://static.example.com
```

## 核心API

### 获取客户端实例

```java
// 获取默认OSS客户端
OssClient client = OssFactory.instance();

// 根据配置键获取客户端
OssClient client = OssFactory.instance("aliyun");
OssClient client = OssFactory.instance("minio");
OssClient client = OssFactory.instance("local");
```

### 文件上传

#### 上传本地文件

```java
// 上传文件并自动生成文件名
File file = new File("/path/to/file.jpg");
UploadResult result = client.uploadSuffix(file, ".jpg");
System.out.println("文件URL: " + result.getUrl());

// 指定模块名上传
UploadResult result = client.uploadSuffix(file, ".jpg", "avatar");

// 指定对象键上传
String contentType = "image/jpeg";
UploadResult result = client.uploadFile(file, "images/photo.jpg", null, contentType);
```

#### 上传数据流

```java
// 上传字节数组
byte[] data = "Hello World".getBytes();
UploadResult result = client.uploadSuffix(data, ".txt", "text/plain");

// 上传输入流
InputStream inputStream = new FileInputStream(file);
UploadResult result = client.uploadSuffix(inputStream, ".jpg", file.length(), "image/jpeg");

// 指定模块名上传输入流
UploadResult result = client.uploadSuffix(inputStream, ".jpg", file.length(), "image/jpeg", "document");
```

#### 上传结果

```java
@Data
@Builder
public class UploadResult {
    /** 访问URL */
    private String url;
    /** 文件名（对象键） */
    private String fileName;
    /** 文件大小（字节） */
    private Long fileSize;
    /** ETag（文件哈希） */
    private String eTag;
}

// 使用示例
UploadResult result = client.uploadSuffix(file, ".jpg");
System.out.println("文件URL: " + result.getUrl());
System.out.println("文件名: " + result.getFileName());
System.out.println("文件大小: " + result.getFileSize());
System.out.println("ETag: " + result.getETag());
```

### 文件下载

#### 下载到临时文件

```java
String filePath = "tenant001/2024/01/15/abc123def456.jpg";
Path tempFile = client.downloadToTempFile(filePath);
System.out.println("临时文件路径: " + tempFile.toString());

// 处理完后记得删除临时文件
Files.deleteIfExists(tempFile);
```

#### 下载到输出流

```java
String objectKey = "images/photo.jpg";
FileOutputStream outputStream = new FileOutputStream("download.jpg");

client.downloadToStream(objectKey, outputStream, fileSize -> {
    System.out.println("文件大小: " + fileSize + " 字节");
});
```

#### 获取文件流

```java
String filePath = "images/photo.jpg";
try (InputStream inputStream = client.getFileAsStream(filePath)) {
    // 处理文件流
    byte[] data = inputStream.readAllBytes();
}
```

### 文件管理

#### 删除文件

```java
String filePath = "images/photo.jpg";
client.deleteFile(filePath);
```

#### 复制文件

```java
String sourcePath = "images/original.jpg";
String targetPath = "images/backup.jpg";
client.copyFile(sourcePath, targetPath);
```

#### 获取文件元数据

```java
String filePath = "images/photo.jpg";
OssFileMetadata metadata = client.getFileMetadata(filePath);

System.out.println("文件名: " + metadata.getFileName());
System.out.println("文件大小: " + metadata.getFileSize());
System.out.println("内容类型: " + metadata.getContentType());
System.out.println("创建时间: " + metadata.getCreateTime());
System.out.println("ETag: " + metadata.getETag());
```

#### 列出文件

```java
String prefix = "images/";
int maxResults = 100;
List<OssFileInfo> files = client.listFiles(prefix, maxResults);

for (OssFileInfo file : files) {
    System.out.println("文件: " + file.getFileName());
    System.out.println("大小: " + file.getFileSize());
    System.out.println("是否目录: " + file.getIsDirectory());
    System.out.println("访问URL: " + file.getUrl());
}
```

### URL生成

#### 生成预签名URL

```java
String objectKey = "images/photo.jpg";
Duration expiredTime = Duration.ofHours(1); // 1小时过期
String presignedUrl = client.generatePresignedUrl(objectKey, expiredTime);
System.out.println("预签名URL: " + presignedUrl);
```

#### 生成公共访问URL

```java
String objectKey = "images/photo.jpg";
String publicUrl = client.generatePublicUrl(objectKey);
System.out.println("公共URL: " + publicUrl);
```

#### 生成预签名上传URL

```java
String objectKey = "images/upload.jpg";
String contentType = "image/jpeg";
int expiration = 3600; // 1小时过期
String uploadUrl = client.generatePresignedUploadUrl(objectKey, contentType, expiration);
System.out.println("预签名上传URL: " + uploadUrl);
```

## 富文本内容处理

通知公告、文章等富文本字段中常常嵌入私有桶的图片地址。私有桶图片通过预签名 URL 访问，URL 上携带 `X-Amz-*`、`OSSAccessKeyId`、`q-signature` 等签名参数且自带有效期（通常 1 小时）。如果把整串带签名的 URL 直接写入数据库，会带来两个问题：一是数据库内容冗余且签名过期后失效，二是某些不经过 VO 序列化的展示路径会暴露已失效的签名。

`OssContentUtils` 工具类负责在**写入数据库前**清洗富文本中的预签名参数，只持久化干净的基础地址；配合读取时的 `@SerialMap(PRESIGNED_URL)` 动态重新签名，形成「存干净、读重签」的完整闭环。

### 清洗预签名参数

```java
import plus.ruoyi.common.oss.utils.OssContentUtils;

// 入库前清洗富文本中的 OSS 图片预签名参数
String cleanHtml = OssContentUtils.cleanPresignedUrls(bo.getNoticeContent());
entity.setNoticeContent(cleanHtml);
```

`cleanPresignedUrls` 遍历 HTML 中所有 `src` / `data-href` 属性：凡是带签名特征的 URL，去掉查询串只保留基础地址；公开链接、外链、无查询串的地址原样保留，不做任何改动。

### 签名特征识别

工具类通过 URL 中的特征参数识别各云服务商的预签名地址，覆盖主流对象存储：

| 云服务商 | 识别特征参数 |
|---------|-------------|
| AWS S3 / MinIO | `X-Amz-Algorithm`、`X-Amz-Signature`、`X-Amz-Credential` |
| 阿里云 OSS | `OSSAccessKeyId`、`Signature` |
| 腾讯云 COS | `q-sign-algorithm`、`q-signature` |
| 七牛云 | `e=` + `token=` |
| AWS S3 v2 | `AWSAccessKeyId` |
| 华为云 OBS 等 | `Expires` + `Signature` |

::: tip 存干净、读重签
入库前用 `OssContentUtils.cleanPresignedUrls` 清洗签名，读取时由 `@SerialMap(PRESIGNED_URL)` 为私有桶 URL 动态重新签名。这样数据库里始终是干净、不过期的基础地址，前端展示时拿到的则是实时有效的预签名 URL。
:::

## 最佳实践

### 1. 客户端复用

```java
@Service
public class FileService {

    /**
     * 通过工厂获取客户端，内部已实现缓存
     * 无需手动管理客户端生命周期
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // 获取OSS客户端（内部缓存，线程安全）
        OssClient client = OssFactory.instance();

        String suffix = FileUtil.getSuffix(file.getOriginalFilename());
        UploadResult result = client.uploadSuffix(
            file.getInputStream(),
            suffix,
            file.getSize(),
            file.getContentType()
        );
        return result.getUrl();
    }

    /**
     * 多存储场景下，根据业务选择不同存储
     */
    public String uploadToSpecificStorage(MultipartFile file, String storageType) throws IOException {
        OssClient client = OssFactory.instance(storageType);
        // ... 上传逻辑
    }
}
```

### 2. 异常处理

```java
@Service
@Slf4j
public class FileService {

    public String uploadFileWithErrorHandling(MultipartFile file) {
        try {
            OssClient client = OssFactory.instance();
            String suffix = FileUtil.getSuffix(file.getOriginalFilename());
            UploadResult result = client.uploadSuffix(
                file.getInputStream(),
                suffix,
                file.getSize(),
                file.getContentType()
            );
            return result.getUrl();

        } catch (OssException e) {
            // OSS业务异常（配置错误、权限不足等）
            log.error("OSS业务异常: {}", e.getMessage());
            throw new ServiceException("文件上传失败: " + e.getMessage());

        } catch (IOException e) {
            // IO异常（文件读取失败等）
            log.error("文件读取异常: {}", e.getMessage());
            throw new ServiceException("文件读取失败，请重试");

        } catch (Exception e) {
            // 其他异常
            log.error("未知异常: ", e);
            throw new ServiceException("系统异常，请稍后重试");
        }
    }
}
```

### 3. 文件类型验证

```java
@Service
public class FileValidationService {

    /** 允许的图片类型 */
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        ".jpg", ".jpeg", ".png", ".gif", ".webp"
    );

    /** 允许的文档类型 */
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"
    );

    /** 最大文件大小（10MB） */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public void validateImage(MultipartFile file) {
        String suffix = FileUtil.getSuffix(file.getOriginalFilename()).toLowerCase();

        if (!ALLOWED_IMAGE_TYPES.contains(suffix)) {
            throw new ServiceException("不支持的图片格式: " + suffix);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ServiceException("图片大小不能超过10MB");
        }
    }

    public void validateDocument(MultipartFile file) {
        String suffix = FileUtil.getSuffix(file.getOriginalFilename()).toLowerCase();

        if (!ALLOWED_DOCUMENT_TYPES.contains(suffix)) {
            throw new ServiceException("不支持的文档格式: " + suffix);
        }
    }
}
```

### 4. 大文件处理

```java
@Service
@Slf4j
public class LargeFileService {

    /** 大文件阈值（100MB） */
    private static final long LARGE_FILE_THRESHOLD = 100 * 1024 * 1024;

    /**
     * 智能上传：根据文件大小选择上传方式
     */
    public String smartUpload(MultipartFile file) throws IOException {
        if (file.getSize() > LARGE_FILE_THRESHOLD) {
            // 大文件：返回预签名上传URL，让前端直传
            return generatePresignedUploadUrl(file);
        } else {
            // 小文件：服务端直接上传
            return directUpload(file);
        }
    }

    /**
     * 生成预签名上传URL（前端直传模式）
     */
    private String generatePresignedUploadUrl(MultipartFile file) throws IOException {
        OssClient client = OssFactory.instance();
        String suffix = FileUtil.getSuffix(file.getOriginalFilename());
        String objectKey = generateObjectKey(suffix);
        String contentType = file.getContentType();

        // 生成1小时有效的预签名URL
        return client.generatePresignedUploadUrl(objectKey, contentType, 3600);
    }

    /**
     * 服务端直接上传
     */
    private String directUpload(MultipartFile file) throws IOException {
        OssClient client = OssFactory.instance();
        String suffix = FileUtil.getSuffix(file.getOriginalFilename());
        UploadResult result = client.uploadSuffix(
            file.getInputStream(),
            suffix,
            file.getSize(),
            file.getContentType()
        );
        return result.getUrl();
    }

    private String generateObjectKey(String suffix) {
        // 生成唯一对象键
        return DateUtil.format(new Date(), "yyyy/MM/dd") + "/" +
               IdUtil.fastSimpleUUID() + suffix;
    }
}
```

### 5. 多租户文件隔离

```java
@Service
public class TenantFileService {

    /**
     * OSS模块已内置租户隔离，路径会自动包含租户ID
     * 无需手动处理
     */
    public String uploadFile(MultipartFile file) throws IOException {
        OssClient client = OssFactory.instance();

        // 路径自动生成为: {prefix}/{tenantId}/{date}/{uuid}{suffix}
        UploadResult result = client.uploadSuffix(
            file.getInputStream(),
            FileUtil.getSuffix(file.getOriginalFilename()),
            file.getSize(),
            file.getContentType()
        );

        return result.getUrl();
    }

    /**
     * 按模块分类存储
     */
    public String uploadToModule(MultipartFile file, String moduleName) throws IOException {
        OssClient client = OssFactory.instance();

        // 路径自动生成为: {prefix}/{tenantId}/{moduleName}/{date}/{uuid}{suffix}
        UploadResult result = client.uploadSuffix(
            file.getInputStream(),
            FileUtil.getSuffix(file.getOriginalFilename()),
            file.getSize(),
            file.getContentType(),
            moduleName
        );

        return result.getUrl();
    }
}
```

### 6. 配置动态切换

```java
@Service
public class OssConfigService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    /**
     * 切换默认OSS配置
     */
    public void switchDefaultConfig(String newConfigKey) {
        // 更新默认配置键
        CacheUtils.put(CacheNames.SYS_OSS_CONFIG,
            OssConstant.DEFAULT_CONFIG_KEY, newConfigKey);

        // 下次获取客户端时会自动使用新配置
        log.info("已切换默认OSS配置为: {}", newConfigKey);
    }

    /**
     * 更新OSS配置
     * 配置更新后客户端会自动刷新
     */
    public void updateOssConfig(String configKey, OssClientConfig config) {
        // 序列化配置
        String json = JsonUtils.toJsonString(config);

        // 更新缓存
        CacheUtils.put(CacheNames.SYS_OSS_CONFIG, configKey, json);

        // OssFactory会在下次获取客户端时检测配置变化并刷新
        log.info("已更新OSS配置: {}", configKey);
    }
}
```

## 监控与运维

### 健康检查

```java
@Component
public class OssHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        try {
            OssClient client = OssFactory.instance();
            String baseUrl = client.getBaseUrl();

            return Health.up()
                .withDetail("configKey", client.getConfigKey())
                .withDetail("baseUrl", baseUrl)
                .withDetail("bucket", client.getOssClientConfig().getBucketName())
                .build();

        } catch (OssException e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();

        } catch (Exception e) {
            return Health.down()
                .withException(e)
                .build();
        }
    }
}
```

### 性能监控

```java
@Aspect
@Component
@Slf4j
public class OssPerformanceAspect {

    @Around("execution(* plus.ruoyi.common.oss.core.OssClient.upload*(..))")
    public Object monitorUpload(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;

            // 记录上传耗时
            log.info("OSS上传 [{}] 完成, 耗时: {}ms", methodName, duration);

            // 可以将指标发送到监控系统
            // metricsService.recordUploadTime(methodName, duration);

            return result;

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("OSS上传 [{}] 失败, 耗时: {}ms, 错误: {}",
                methodName, duration, e.getMessage());
            throw e;
        }
    }

    @Around("execution(* plus.ruoyi.common.oss.core.OssClient.download*(..))")
    public Object monitorDownload(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            log.info("OSS下载 [{}] 完成, 耗时: {}ms", methodName, duration);
            return result;

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("OSS下载 [{}] 失败, 耗时: {}ms, 错误: {}",
                methodName, duration, e.getMessage());
            throw e;
        }
    }
}
```

### 日志配置

```yaml
logging:
  level:
    # OSS模块日志
    plus.ruoyi.common.oss: DEBUG
    # AWS SDK日志（生产环境建议INFO）
    software.amazon.awssdk: INFO
    # Netty日志
    io.netty: WARN
```

## 故障排查

### 常见问题

#### 1. 配置不存在

**问题**: `OssException: 系统异常, 'xxx'配置信息不存在!`

**原因**:
- Redis中没有对应的配置数据
- 配置键拼写错误
- Redis连接异常

**解决方案**:
```java
// 检查Redis中的配置
String json = CacheUtils.get(CacheNames.SYS_OSS_CONFIG, "aliyun");
if (json == null) {
    // 配置不存在，需要初始化
    ossConfigService.initOssConfig("aliyun", config);
}
```

#### 2. 权限不足

**问题**: 上传失败，提示AccessDenied

**原因**:
- AccessKey/SecretKey错误
- 存储桶权限配置不当
- IP白名单限制

**解决方案**:
```java
// 1. 验证密钥是否正确
// 2. 检查存储桶ACL设置
// 3. 检查云服务商控制台的访问控制配置
```

#### 3. 网络超时

**问题**: 连接超时或读取超时

**原因**:
- 网络不通
- Endpoint配置错误
- 防火墙阻断

**解决方案**:
```java
// 1. 检查endpoint是否可访问
// 2. 检查网络连通性
// 3. 调整超时配置
S3AsyncClient.builder()
    .httpClient(NettyNioAsyncHttpClient.builder()
        .connectionTimeout(Duration.ofSeconds(120))  // 增加超时时间
        .readTimeout(Duration.ofSeconds(120))
        .build())
    .build();
```

#### 4. 本地存储路径问题

**问题**: 本地存储上传失败

**原因**:
- 上传路径不存在
- 没有写入权限
- 磁盘空间不足

**解决方案**:
```yaml
# 1. 确保配置了正确的上传路径
app:
  uploadPath: /data/uploads

# 2. 检查目录权限
# chmod 755 /data/uploads

# 3. 检查磁盘空间
# df -h
```

#### 5. 预签名URL无效

**问题**: 预签名URL访问返回403

**原因**:
- URL已过期
- 签名参数被篡改
- 时钟不同步

**解决方案**:
```java
// 1. 检查服务器时间是否准确
// 2. 确保URL在有效期内使用
// 3. 不要修改预签名URL的任何参数

// 生成较长有效期的URL
String url = client.generatePresignedUrl(key, Duration.ofDays(1));
```

### 诊断工具

```java
@RestController
@RequestMapping("/debug/oss")
public class OssDebugController {

    @GetMapping("/config/{configKey}")
    public R<OssClientConfig> getConfig(@PathVariable String configKey) {
        String json = CacheUtils.get(CacheNames.SYS_OSS_CONFIG, configKey);
        if (json == null) {
            return R.fail("配置不存在");
        }
        return R.ok(JsonUtils.parseObject(json, OssClientConfig.class));
    }

    @GetMapping("/test/{configKey}")
    public R<String> testConnection(@PathVariable String configKey) {
        try {
            OssClient client = OssFactory.instance(configKey);
            String baseUrl = client.getBaseUrl();
            return R.ok("连接成功: " + baseUrl);
        } catch (Exception e) {
            return R.fail("连接失败: " + e.getMessage());
        }
    }

    @PostMapping("/test-upload/{configKey}")
    public R<UploadResult> testUpload(@PathVariable String configKey) {
        try {
            OssClient client = OssFactory.instance(configKey);
            byte[] data = "test".getBytes();
            UploadResult result = client.uploadSuffix(data, ".txt", "text/plain");
            // 清理测试文件
            client.deleteFile(result.getFileName());
            return R.ok(result);
        } catch (Exception e) {
            return R.fail("上传测试失败: " + e.getMessage());
        }
    }
}
```

## 扩展开发

### 添加新的存储策略

1. **实现OssStrategy接口**：

```java
public class CustomOssStrategy implements OssStrategy {

    private final String configKey;
    private final OssClientConfig config;
    // 自定义存储客户端
    private final CustomStorageClient customClient;

    public CustomOssStrategy(String configKey, OssClientConfig config) {
        this.configKey = configKey;
        this.config = config;
        // 初始化自定义客户端
        this.customClient = new CustomStorageClient(config);
    }

    @Override
    public UploadResult uploadFile(File file, String key, String md5Digest, String contentType) {
        // 实现自定义上传逻辑
        customClient.upload(file, key);
        return UploadResult.builder()
            .url(getBaseUrl() + "/" + key)
            .fileName(key)
            .fileSize(file.length())
            .build();
    }

    @Override
    public void deleteFile(String key) {
        customClient.delete(key);
    }

    @Override
    public String getBaseUrl() {
        return config.getDomain();
    }

    @Override
    public void close() {
        customClient.close();
    }

    // ... 实现其他接口方法
}
```

2. **修改OssStrategyFactory**：

```java
public class OssStrategyFactory {

    public static OssStrategy createStrategy(String configKey, OssClientConfig config) {
        switch (configKey) {
            case "local":
                return new LocalOssStrategy(configKey, config);
            case "custom":
                return new CustomOssStrategy(configKey, config);
            default:
                return new S3OssStrategy(configKey, config);
        }
    }
}
```

3. **添加枚举类型**：

```java
public enum OssType {
    LOCAL("local"),
    ALIYUN("aliyun"),
    // ... 其他类型
    CUSTOM("custom");  // 新增

    // ...
}
```

### 自定义路径生成

```java
@Component
public class CustomPathGenerator {

    /**
     * 按业务类型生成路径
     */
    public String generateByBusinessType(String businessType, String suffix) {
        String tenantId = TenantHelper.getTenantId();
        String datePath = DateUtil.format(new Date(), "yyyy/MM/dd");
        String uuid = IdUtil.fastSimpleUUID();

        return String.format("%s/%s/%s/%s%s",
            businessType, tenantId, datePath, uuid, suffix);
    }

    /**
     * 按用户ID生成路径
     */
    public String generateByUserId(Long userId, String suffix) {
        String datePath = DateUtil.format(new Date(), "yyyy/MM/dd");
        String uuid = IdUtil.fastSimpleUUID();

        return String.format("user/%d/%s/%s%s",
            userId, datePath, uuid, suffix);
    }

    /**
     * 生成固定路径（用于配置文件等）
     */
    public String generateFixedPath(String category, String filename) {
        return String.format("config/%s/%s", category, filename);
    }
}
```

### 文件处理扩展

```java
@Component
public class FileProcessingService {

    @Autowired
    private OssFactory ossFactory;

    /**
     * 上传并生成缩略图
     */
    public Map<String, String> uploadWithThumbnail(MultipartFile file) throws IOException {
        OssClient client = OssFactory.instance();
        String suffix = FileUtil.getSuffix(file.getOriginalFilename());

        // 上传原图
        UploadResult original = client.uploadSuffix(
            file.getInputStream(), suffix, file.getSize(), file.getContentType());

        // 生成缩略图
        BufferedImage thumbnail = Thumbnails.of(file.getInputStream())
            .size(200, 200)
            .asBufferedImage();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(thumbnail, suffix.substring(1), baos);
        byte[] thumbnailBytes = baos.toByteArray();

        // 上传缩略图
        UploadResult thumb = client.uploadSuffix(
            thumbnailBytes, "_thumb" + suffix, file.getContentType());

        return Map.of(
            "original", original.getUrl(),
            "thumbnail", thumb.getUrl()
        );
    }

    /**
     * 批量上传文件
     */
    public List<UploadResult> batchUpload(List<MultipartFile> files) {
        OssClient client = OssFactory.instance();

        return files.parallelStream()
            .map(file -> {
                try {
                    String suffix = FileUtil.getSuffix(file.getOriginalFilename());
                    return client.uploadSuffix(
                        file.getInputStream(), suffix, file.getSize(), file.getContentType());
                } catch (IOException e) {
                    throw new OssException("文件上传失败: " + file.getOriginalFilename());
                }
            })
            .collect(Collectors.toList());
    }
}
```

## 数据库配置

### 配置表结构

```sql
CREATE TABLE sys_oss_config (
    oss_config_id   BIGINT(20)    NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    tenant_id       VARCHAR(20)   DEFAULT '000000' COMMENT '租户ID',
    config_key      VARCHAR(20)   NOT NULL COMMENT '配置键',
    access_key      VARCHAR(255)  NOT NULL COMMENT '访问密钥',
    secret_key      VARCHAR(255)  NOT NULL COMMENT '私有密钥',
    bucket_name     VARCHAR(255)  NOT NULL COMMENT '存储桶名称',
    prefix          VARCHAR(255)  DEFAULT '' COMMENT '前缀',
    endpoint        VARCHAR(255)  NOT NULL COMMENT '访问端点',
    domain          VARCHAR(255)  DEFAULT '' COMMENT '自定义域名',
    is_https        CHAR(1)       DEFAULT '1' COMMENT '是否HTTPS',
    region          VARCHAR(255)  DEFAULT '' COMMENT '存储区域',
    access_policy   CHAR(1)       DEFAULT '1' COMMENT '访问策略',
    status          CHAR(1)       DEFAULT '1' COMMENT '状态',
    ext1            VARCHAR(255)  DEFAULT '' COMMENT '扩展字段',
    create_time     DATETIME      DEFAULT NULL COMMENT '创建时间',
    create_by       VARCHAR(64)   DEFAULT '' COMMENT '创建者',
    update_time     DATETIME      DEFAULT NULL COMMENT '更新时间',
    update_by       VARCHAR(64)   DEFAULT '' COMMENT '更新者',
    remark          VARCHAR(500)  DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (oss_config_id)
) ENGINE=InnoDB COMMENT='对象存储配置表';
```

### 配置示例

```sql
-- 阿里云OSS配置
INSERT INTO sys_oss_config (config_key, access_key, secret_key, bucket_name,
    prefix, endpoint, domain, is_https, region, access_policy, status)
VALUES ('aliyun', 'LTAI5txxxxxxxx', 'xxxxxxxx', 'my-bucket',
    'uploads', 'oss-cn-beijing.aliyuncs.com', '', '1', 'cn-beijing', '1', '1');

-- 腾讯云COS配置
INSERT INTO sys_oss_config (config_key, access_key, secret_key, bucket_name,
    prefix, endpoint, domain, is_https, region, access_policy, status)
VALUES ('qcloud', 'AKIDxxxxxxxx', 'xxxxxxxx', 'my-bucket-1234567890',
    'uploads', 'cos.ap-beijing.myqcloud.com', '', '1', 'ap-beijing', '1', '1');

-- MinIO配置
INSERT INTO sys_oss_config (config_key, access_key, secret_key, bucket_name,
    prefix, endpoint, domain, is_https, region, access_policy, status)
VALUES ('minio', 'minioadmin', 'minioadmin', 'test',
    'uploads', 'localhost:9000', '', '0', 'us-east-1', '1', '1');

-- 本地存储配置
INSERT INTO sys_oss_config (config_key, access_key, secret_key, bucket_name,
    prefix, endpoint, domain, is_https, region, access_policy, status)
VALUES ('local', '', '', 'local',
    'uploads', '', 'https://static.example.com', '1', '', '1', '1');
```

## 常量定义

```java
public class OssConstant {

    /** 默认配置键的缓存键名 */
    public static final String DEFAULT_CONFIG_KEY = "default_config";

    /** 云服务配置键数组（用于判断访问样式） */
    public static final String[] CLOUD_SERVICE = {"aliyun", "qcloud", "qiniu", "obs"};

    /** 本地存储资源访问前缀 */
    public static final String RESOURCE_PREFIX = "/resource/oss";
}
```
