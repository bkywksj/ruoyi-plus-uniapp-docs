# OSS 对象存储模块

## 概述

OSS（Object Storage Service）对象存储模块为若依系统提供了统一的文件存储服务，支持本地存储和多种云存储服务。该模块基于策略模式设计，具有良好的扩展性和可维护性。

### 主要特性

- 🚀 **多存储支持**：支持本地存储、阿里云OSS、腾讯云COS、七牛云、华为云OBS、MinIO等
- 🔒 **安全可靠**：支持预签名URL、访问权限控制、文件完整性校验
- 🎯 **高性能**：基于AWS S3 SDK异步客户端，支持大文件传输
- 🔧 **易于配置**：支持动态配置切换，无需重启应用
- 📊 **多租户**：支持租户数据隔离
- 🎨 **灵活路径**：支持自定义文件存储路径规则

### 支持的存储类型

| 存储类型 | 配置键 | 说明 |
|---------|--------|------|
| 本地存储 | `local` | 存储在应用服务器本地文件系统 |
| 阿里云OSS | `aliyun` | 阿里云对象存储服务 |
| 腾讯云COS | `qcloud` | 腾讯云对象存储服务 |
| 七牛云 | `qiniu` | 七牛云对象存储服务 |
| 华为云OBS | `obs` | 华为云对象存储服务 |
| MinIO | `minio` | 开源S3兼容对象存储 |

## 模块结构

```text
ruoyi-common-oss/
├── src/main/java/plus/ruoyi/common/oss/
│   ├── constant/           # 常量定义
│   │   └── OssConstant.java
│   ├── core/               # 核心类
│   │   └── OssClient.java
│   ├── entity/             # 实体类
│   │   ├── OssFileInfo.java
│   │   ├── OssFileMetadata.java
│   │   └── UploadResult.java
│   ├── enums/              # 枚举类
│   │   └── AccessPolicyType.java
│   ├── exception/          # 异常类
│   │   └── OssException.java
│   ├── factory/            # 工厂类
│   │   ├── OssFactory.java
│   │   └── OssStrategyFactory.java
│   ├── properties/         # 配置属性
│   │   └── OssProperties.java
│   └── service/            # 服务接口和实现
│       ├── OssStrategy.java
│       └── impl/
│           ├── LocalOssStrategy.java
│           └── S3OssStrategy.java
└── pom.xml
```

## 配置说明

### 基础配置

OSS模块的配置存储在数据库中，通过 `OssProperties` 类定义，支持以下配置项：

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| `tenantId` | 租户ID | `tenant123` |
| `endpoint` | 访问端点 | `oss-cn-beijing.aliyuncs.com` |
| `domain` | 自定义域名 | `https://cdn.yourdomain.com` |
| `prefix` | 文件路径前缀 | `uploads` |
| `accessKey` | 访问密钥 | `your-access-key` |
| `secretKey` | 私有密钥 | `your-secret-key` |
| `bucketName` | 存储桶名称 | `my-bucket` |
| `region` | 存储区域 | `cn-beijing` |
| `isHttps` | 是否使用HTTPS | `1`（1=是, 0=否） |
| `accessPolicy` | 访问策略 | `1`（0=私有, 1=公共读写, 2=公共读） |

### 访问策略类型

```java
public enum AccessPolicyType {
    PRIVATE("0"),      // 私有访问
    PUBLIC("1"),       // 公共读写
    CUSTOM("2")        // 自定义（公共读）
}
```

### 本地存储配置

本地存储需要在 `AppProperties` 中配置上传路径：

```yaml
app:
  uploadPath: "/data/uploads"  # 本地文件上传路径
```

## 核心API

### OssClient 客户端

`OssClient` 是对象存储的核心客户端，提供统一的文件操作接口。

#### 获取客户端实例

```java
// 获取默认OSS客户端
OssClient client = OssFactory.instance();

// 根据配置键获取客户端
OssClient client = OssFactory.instance("aliyun");

// 根据类型枚举获取客户端
OssClient client = OssFactory.instance(OssFactory.OssType.ALIYUN);
```

### 文件上传

#### 上传本地文件

```java
// 上传文件并自动生成文件名
File file = new File("/path/to/file.jpg");
UploadResult result = client.uploadSuffix(file, ".jpg");
System.out.println("文件URL: " + result.getUrl());

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
```

#### 上传结果

```java
UploadResult result = client.uploadSuffix(file, ".jpg");
System.out.println("文件URL: " + result.getUrl());
System.out.println("文件名: " + result.getFileName());
System.out.println("文件大小: " + result.getFileSize());
System.out.println("ETag: " + result.getETag());
```

### 文件下载

#### 下载到临时文件

```java
String filePath = "tenant123/2024/01/15/abc123def456.jpg";
Path tempFile = client.downloadToTempFile(filePath);
System.out.println("临时文件路径: " + tempFile.toString());
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

## 文件路径规则

### 自动生成路径

OSS模块会根据以下规则自动生成文件存储路径：

```
[prefix/]tenantId/yyyy/MM/dd/uuid.suffix
```

- `prefix`: 业务前缀（可选），如 `avatar`、`document`
- `tenantId`: 租户ID，用于多租户数据隔离
- `yyyy/MM/dd`: 按日期分层的目录结构
- `uuid`: 32位简化UUID，确保文件名唯一性
- `suffix`: 文件扩展名

### 路径示例

```java
// 配置了前缀的路径
avatar/tenant123/2024/01/15/abc123def456789.jpg

// 无前缀的路径
tenant123/2024/01/15/abc123def456789.jpg
```

## 最佳实践

### 1. 客户端复用

```java
@Component
public class FileService {
    
    @Autowired
    private OssClient ossClient; // 通过依赖注入复用客户端
    
    public String uploadFile(MultipartFile file) throws IOException {
        String suffix = FileUtil.getSuffix(file.getOriginalFilename());
        UploadResult result = ossClient.uploadSuffix(
            file.getInputStream(), 
            suffix, 
            file.getSize(), 
            file.getContentType()
        );
        return result.getUrl();
    }
}
```

### 2. 异常处理

```java
public String uploadFileWithErrorHandling(File file) {
    try {
        UploadResult result = ossClient.uploadSuffix(file, ".jpg");
        return result.getUrl();
    } catch (OssException e) {
        log.error("文件上传失败: {}", e.getMessage());
        throw new ServiceException("文件上传失败，请稍后重试");
    }
}
```

### 3. 文件类型验证

```java
public void validateFileType(String fileName) {
    String suffix = FileUtil.getSuffix(fileName);
    if (!Arrays.asList(".jpg", ".png", ".gif").contains(suffix.toLowerCase())) {
        throw new ServiceException("不支持的文件类型: " + suffix);
    }
}
```

### 4. 大文件处理

```java
public String uploadLargeFile(File file) {
    // 对于大文件，建议使用分片上传或预签名上传
    if (file.length() > 100 * 1024 * 1024) { // 100MB
        // 生成预签名上传URL，让前端直传
        String objectKey = generateObjectKey(file.getName());
        return ossClient.generatePresignedUploadUrl(objectKey, 
            Files.probeContentType(file.toPath()), 3600);
    } else {
        // 小文件直接上传
        return ossClient.uploadSuffix(file, FileUtil.getSuffix(file.getName())).getUrl();
    }
}
```

## 配置管理

### 动态配置切换

OSS模块支持运行时动态切换存储配置，通过数据库配置更新后会自动生效：

```java
// 配置会从数据库加载并缓存到Redis
@Autowired
private OssConfigService ossConfigService;

public void switchToAliyunOss() {
    // 更新数据库配置后，系统会自动刷新缓存
    ossConfigService.updateOssConfig("aliyun", newOssProperties);
    
    // 下次获取客户端时会自动使用新配置
    OssClient client = OssFactory.instance("aliyun");
}
```

### 数据库配置管理

OSS配置存储在数据库的系统配置表中，可以通过管理后台进行配置：

1. **配置存储位置**：系统配置表 `sys_oss_config`
2. **缓存机制**：配置信息会缓存到Redis中，键名格式为 `sys_oss:配置键`
3. **默认配置**：通过 `sys_oss:default_config` 键指定默认使用的OSS配置

#### 配置示例

```sql
-- 阿里云OSS配置示例
INSERT INTO sys_oss_config (config_key, access_key, secret_key, bucket_name, prefix, endpoint, domain, is_https, region, access_policy, status) 
VALUES ('aliyun', 'your-access-key', 'your-secret-key', 'your-bucket', 'uploads', 'oss-cn-beijing.aliyuncs.com', '', '1', 'cn-beijing', '1', '1');

-- MinIO配置示例
INSERT INTO sys_oss_config (config_key, access_key, secret_key, bucket_name, prefix, endpoint, domain, is_https, region, access_policy, status) 
VALUES ('minio', 'minioadmin', 'minioadmin', 'test', 'uploads', 'localhost:9000', '', '0', 'us-east-1', '1', '1');
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
            // 执行简单的健康检查操作
            client.getBaseUrl();
            return Health.up()
                .withDetail("type", client.getConfigKey())
                .withDetail("endpoint", client.getProperties().getEndpoint())
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

### 性能监控

```java
@Aspect
@Component
public class OssPerformanceAspect {
    
    @Around("execution(* plus.ruoyi.common.oss.core.OssClient.upload*(..))")
    public Object monitorUpload(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            log.info("文件上传耗时: {}ms", duration);
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("文件上传失败，耗时: {}ms, 错误: {}", duration, e.getMessage());
            throw e;
        }
    }
}
```

## 故障排查

### 常见问题

#### 1. 配置错误

**问题**: `OssException: 系统异常, 'xxx'配置信息不存在!`

**解决方案**:
- 检查OSS配置是否正确设置在数据库或配置中心
- 确认 `OssConfigService.initOssConfig()` 方法是否正常执行
- 验证Redis连接是否正常

#### 2. 权限问题

**问题**: 上传失败，提示权限不足

**解决方案**:
- 检查云存储的AccessKey和SecretKey是否正确
- 确认存储桶的权限配置
- 验证IP白名单设置

#### 3. 网络连接问题

**问题**: 连接超时或网络异常

**解决方案**:
- 检查endpoint配置是否正确
- 确认网络连通性
- 调整超时时间配置

### 日志配置

```yaml
logging:
  level:
    plus.ruoyi.common.oss: DEBUG
    software.amazon.awssdk: INFO
```

## 扩展开发

### 添加新的存储策略

1. 实现 `OssStrategy` 接口：

```java
public class MyCustomOssStrategy implements OssStrategy {
    // 实现所有接口方法
    
    @Override
    public UploadResult uploadFile(File file, String key, String md5Digest, String contentType) {
        // 自定义上传逻辑
        return null;
    }
    
    // ... 其他方法实现
}
```

2. 修改 `OssStrategyFactory`：

```java
public static OssStrategy createStrategy(String configKey, OssProperties ossProperties) {
    switch (configKey) {
        case "custom":
            return new MyCustomOssStrategy(configKey, ossProperties);
        // ... 其他case
    }
}
```

3. 添加对应的枚举类型：

```java
public enum OssType {
    CUSTOM("custom"),
    // ... 其他类型
}
```

### 自定义文件路径生成

可以通过扩展 `OssClient` 或实现自定义的路径生成策略：

```java
public class CustomPathGenerator {
    
    public String generatePath(String businessType, String fileName) {
        // 自定义路径生成逻辑
        return businessType + "/" + DateUtils.datePath() + "/" + fileName;
    }
}
```
