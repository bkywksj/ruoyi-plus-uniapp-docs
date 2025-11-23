# 文件处理最佳实践

本文档详细介绍 RuoYi-Plus 框架中文件处理的最佳实践，包括 OSS 存储、文件上传下载、类型验证、安全处理等核心功能的使用指南。

## 概述

RuoYi-Plus 框架提供了完整的文件处理解决方案，基于对象存储服务（OSS）实现统一的文件管理。系统采用策略模式设计，支持多种存储后端的无缝切换。

### 核心特性

- **多存储后端支持** - 本地存储、阿里云 OSS、腾讯云 COS、七牛云、MinIO、华为云 OBS
- **多租户隔离** - 文件按租户隔离存储，确保数据安全
- **统一 API** - 无论使用何种存储后端，API 接口保持一致
- **预签名 URL** - 支持私有文件的安全访问
- **客户端直传** - 支持绕过服务器直接上传到 OSS
- **文件类型校验** - 完善的文件类型和大小限制机制

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                       客户端请求                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SysOssController                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /resource/oss/upload        - 文件上传              │   │
│  │  /resource/oss/download/{id} - 文件下载              │   │
│  │  /resource/oss/replace/{id}  - 文件替换              │   │
│  │  /resource/oss/getPresignedUrl - 预签名URL           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SysOssServiceImpl                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  - 文件上传处理                                       │   │
│  │  - 文件下载处理                                       │   │
│  │  - 远程图片保存                                       │   │
│  │  - 预签名URL生成                                      │   │
│  │  - 文件元数据管理                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      OssFactory                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  - 客户端实例管理                                     │   │
│  │  - 配置加载和缓存                                     │   │
│  │  - 线程安全控制                                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      OssClient                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  - 文件上传/下载                                      │   │
│  │  - 文件删除/复制                                      │   │
│  │  - 元数据获取                                         │   │
│  │  - URL生成                                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  LocalOssStrategy │ │  S3OssStrategy    │ │  其他存储策略      │
│  本地文件存储      │ │  S3兼容存储       │ │                   │
│  - 阿里云/腾讯云   │ │  - MinIO          │ │  - 七牛云等       │
│  - 华为云         │ │  - 自建S3         │ │                   │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

---

## 存储配置

### 支持的存储类型

RuoYi-Plus 支持以下存储类型：

| 存储类型 | 枚举值 | 说明 |
|---------|-------|------|
| 本地存储 | `LOCAL` | 存储在服务器本地文件系统 |
| 阿里云 OSS | `ALIYUN` | 阿里云对象存储服务 |
| 腾讯云 COS | `QCLOUD` | 腾讯云对象存储 |
| 七牛云 | `QINIU` | 七牛云对象存储 |
| MinIO | `MINIO` | 开源对象存储 |
| 华为云 OBS | `OBS` | 华为云对象存储 |

### 基础配置

#### Spring 文件上传配置

```yaml
spring:
  servlet:
    multipart:
      # 单个文件大小限制
      max-file-size: 10MB
      # 总上传文件大小限制
      max-request-size: 20MB
      # 文件上传临时目录
      location: ${app.upload-path}

server:
  undertow:
    # HTTP POST内容的最大大小 (-1表示无限制)
    max-http-post-size: -1
```

#### OSS 配置实体

OSS 配置通过 `OssClientConfig` 实体管理：

```java
public class OssClientConfig {
    /** 租户ID */
    private String tenantId;

    /** 访问站点 */
    private String endpoint;

    /** 自定义域名 */
    private String domain;

    /** 路径前缀 */
    private String prefix;

    /** 访问密钥 */
    private String accessKey;

    /** 密钥 */
    private String secretKey;

    /** 存储桶名 */
    private String bucketName;

    /** 存储区域 */
    private String region;

    /** 是否HTTPS */
    private Boolean isHttps;

    /**
     * 桶权限类型
     * 0=private (私有), 1=public (公开), 2=custom (自定义)
     */
    private AccessPolicyType accessPolicy;
}
```

### 本地存储配置

本地存储适合开发环境或小型应用：

```yaml
# 本地存储配置
oss:
  local:
    # 存储根目录
    base-path: /data/upload
    # 访问域名
    domain: http://localhost:8080
    # 路径前缀
    prefix: files
```

本地存储文件访问路径结构：
```
{domain}/resources/{prefix}/{tenantId}/{moduleName}/{yyyy/MM/dd}/{uuid}.{ext}
示例: http://localhost:8080/resources/files/tenant123/avatar/2024/05/27/abc123.jpg
```

### 云存储配置

#### 阿里云 OSS 配置

```yaml
oss:
  aliyun:
    endpoint: oss-cn-hangzhou.aliyuncs.com
    access-key: your-access-key
    secret-key: your-secret-key
    bucket-name: your-bucket
    region: cn-hangzhou
    is-https: true
    access-policy: public  # public/private/custom
```

#### 腾讯云 COS 配置

```yaml
oss:
  qcloud:
    endpoint: cos.ap-guangzhou.myqcloud.com
    access-key: your-secret-id
    secret-key: your-secret-key
    bucket-name: your-bucket-1234567890
    region: ap-guangzhou
    is-https: true
```

#### MinIO 配置

```yaml
oss:
  minio:
    endpoint: http://minio.example.com:9000
    access-key: minioadmin
    secret-key: minioadmin
    bucket-name: ruoyi-plus
    region: us-east-1
    is-https: false
```

### 访问策略配置

系统支持三种访问策略：

```java
public enum AccessPolicyType {
    /** 私有 - 需要预签名URL访问 */
    PRIVATE,

    /** 公开 - 可直接访问 */
    PUBLIC,

    /** 自定义 - 根据业务需求配置 */
    CUSTOM
}
```

**私有桶访问流程：**

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   客户端      │───▶│   服务端      │───▶│   OSS        │
│              │    │              │    │              │
│  1.请求文件   │    │  2.生成预签名 │    │  3.验证签名   │
│              │◀───│    URL       │◀───│    返回文件   │
│  4.使用URL   │    │              │    │              │
│    访问文件  │────────────────────────▶│              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 文件上传

### 基础上传

#### Controller 层实现

```java
@RestController
@RequestMapping("/resource/oss")
public class SysOssController {

    @Resource
    private ISysOssService sysOssService;

    /**
     * 上传文件
     *
     * @param file       文件对象
     * @param moduleName 模块名称 (用于分类存储)
     * @param directoryId 目录ID (可选)
     * @return 文件信息
     */
    @PostMapping("/upload")
    public R<SysOssVo> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String moduleName,
            @RequestParam(required = false) Long directoryId,
            @RequestParam(required = false) String directoryPath) {

        // 验证文件
        if (file.isEmpty()) {
            return R.fail("上传文件不能为空");
        }

        // 执行上传
        SysOssVo ossVo = sysOssService.upload(
            moduleName, directoryId, directoryPath, file);

        return R.ok(ossVo);
    }
}
```

#### Service 层实现

```java
@Service
public class SysOssServiceImpl implements ISysOssService {

    @Override
    public SysOssVo upload(String moduleName, Long directoryId,
                          String directoryPath, MultipartFile file) {
        // 获取文件信息
        String originalFilename = file.getOriginalFilename();
        String suffix = FileTypeUtils.getExtension(originalFilename);

        // 获取OSS客户端
        OssClient storage = OssFactory.instance();

        // 上传文件
        UploadResult uploadResult = storage.uploadSuffix(
            file.getBytes(), suffix, moduleName);

        // 构建实体并保存
        return buildResultEntity(
            originalFilename,
            suffix,
            storage.getConfigKey(),
            uploadResult.getUrl(),
            uploadResult.getFileName(),
            directoryId,
            file.getSize()
        );
    }

    /**
     * 构建OSS实体并保存到数据库
     */
    private SysOssVo buildResultEntity(String originalName, String suffix,
            String configKey, String url, String fileName,
            Long directoryId, Long fileSize) {

        SysOss oss = new SysOss();
        oss.setOriginalName(originalName);
        oss.setFileSuffix(suffix);
        oss.setUrl(url);
        oss.setFileName(fileName);
        oss.setService(configKey);
        oss.setDirectoryId(directoryId);
        oss.setFileSize(fileSize);

        // 保存到数据库
        save(oss);

        return BeanUtil.copyProperties(oss, SysOssVo.class);
    }
}
```

### 文件存储路径规则

文件存储采用统一的路径规则：

```
{prefix}/{tenantId}/{moduleName}/{yyyy/MM/dd}/{uuid}{suffix}
```

| 组成部分 | 说明 | 示例 |
|---------|------|------|
| `prefix` | 配置的路径前缀 | `files` |
| `tenantId` | 租户ID | `tenant123` |
| `moduleName` | 模块名称 | `avatar`, `document`, `image` |
| `yyyy/MM/dd` | 日期分层 | `2024/05/27` |
| `uuid` | 唯一标识符 | `abc123def456` |
| `suffix` | 文件后缀 | `.jpg`, `.pdf` |

**完整示例：**
```
files/tenant123/avatar/2024/05/27/abc123def456.jpg
```

### 客户端直传

对于大文件上传，推荐使用客户端直传方式，减轻服务器压力：

#### 获取预签名上传 URL

```java
@PostMapping("/getPresignedUrl")
public R<OssPresignedUrlVo> getPresignedUrl(
        @RequestParam String fileName,
        @RequestParam String fileType,
        @RequestParam(required = false) String moduleName,
        @RequestParam(required = false) Long directoryId,
        @RequestParam(required = false) String directoryPath) {

    OssPresignedUrlVo presignedUrl = sysOssService.generatePresignedUrl(
        fileName, fileType, moduleName, directoryId, directoryPath);

    return R.ok(presignedUrl);
}
```

#### 确认直传完成

```java
@PostMapping("/confirmDirectUpload")
public R<SysOssVo> confirmDirectUpload(
        @RequestParam String fileName,
        @RequestParam String fileKey,
        @RequestParam String fileUrl,
        @RequestParam(required = false) String moduleName,
        @RequestParam(required = false) Long directoryId,
        @RequestParam(required = false) String directoryPath,
        @RequestParam Long fileSize) {

    SysOssVo ossVo = sysOssService.confirmDirectUpload(
        fileName, fileKey, fileUrl, moduleName,
        directoryId, directoryPath, fileSize);

    return R.ok(ossVo);
}
```

#### 前端直传示例

```typescript
// 1. 获取预签名URL
const getPresignedUrl = async (file: File) => {
  const response = await request.post('/resource/oss/getPresignedUrl', {
    fileName: file.name,
    fileType: file.type,
    moduleName: 'document'
  })
  return response.data
}

// 2. 直接上传到OSS
const uploadToOss = async (presignedUrl: string, file: File) => {
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })
}

// 3. 确认上传完成
const confirmUpload = async (fileInfo: FileInfo) => {
  const response = await request.post('/resource/oss/confirmDirectUpload', {
    fileName: fileInfo.fileName,
    fileKey: fileInfo.fileKey,
    fileUrl: fileInfo.fileUrl,
    moduleName: 'document',
    fileSize: fileInfo.fileSize
  })
  return response.data
}

// 完整上传流程
const handleDirectUpload = async (file: File) => {
  try {
    // 获取预签名URL
    const presigned = await getPresignedUrl(file)

    // 直接上传到OSS
    await uploadToOss(presigned.uploadUrl, file)

    // 确认上传完成
    const result = await confirmUpload({
      fileName: file.name,
      fileKey: presigned.fileKey,
      fileUrl: presigned.accessUrl,
      fileSize: file.size
    })

    console.log('上传成功:', result)
  } catch (error) {
    console.error('上传失败:', error)
  }
}
```

### 文件替换

文件替换保持原始存储路径，仅更新文件内容：

```java
@PostMapping("/replace/{ossId}")
public R<SysOssVo> replace(
        @PathVariable Long ossId,
        @RequestPart("file") MultipartFile file) {

    SysOssVo ossVo = sysOssService.replace(ossId, file);
    return R.ok(ossVo);
}
```

**Service 实现：**

```java
@Override
public SysOssVo replace(Long ossId, MultipartFile file) {
    // 查询原文件
    SysOss oss = getById(ossId);
    if (oss == null) {
        throw new ServiceException("文件不存在");
    }

    // 获取新文件后缀
    String newSuffix = FileTypeUtils.getExtension(file.getOriginalFilename());

    // 验证文件类型一致性
    if (!oss.getFileSuffix().equalsIgnoreCase(newSuffix)) {
        throw new ServiceException("替换文件类型必须与原文件一致");
    }

    // 获取OSS客户端
    OssClient storage = OssFactory.instance(oss.getService());

    // 删除原文件
    storage.deleteFile(oss.getFileName());

    // 上传新文件到相同路径
    UploadResult uploadResult = storage.uploadFile(
        file.getBytes(), oss.getFileName(), file.getContentType());

    // 更新数据库
    oss.setOriginalName(file.getOriginalFilename());
    oss.setFileSize(file.getSize());
    updateById(oss);

    return BeanUtil.copyProperties(oss, SysOssVo.class);
}
```

### 远程图片保存

支持将远程图片下载并保存到 OSS：

```java
@PostMapping("/saveRemoteImageToOss")
public R<SysOssVo> saveRemoteImageToOss(
        @RequestParam String url,
        @RequestParam(required = false) String moduleName,
        @RequestParam(required = false) Long directoryId,
        @RequestParam(required = false) String directoryPath) {

    SysOssVo ossVo = sysOssService.saveRemoteImageToOss(
        moduleName, directoryId, directoryPath, url);

    return R.ok(ossVo);
}
```

**Service 实现：**

```java
@Override
public SysOssVo saveRemoteImageToOss(String moduleName, Long directoryId,
                                     String directoryPath, String url) {
    // 检查URL是否已存在
    SysOss existingOss = getOssByUrl(url);
    if (existingOss != null) {
        return BeanUtil.copyProperties(existingOss, SysOssVo.class);
    }

    File tempFile = null;
    try {
        // 创建HTTP请求
        HttpRequest request = HttpUtil.createGet(url);

        // 设置请求头，处理防盗链
        request.header("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        // 处理微信图片等特殊域名
        if (url.contains("qpic.cn") || url.contains("weixin.qq.com")) {
            request.header("Referer", "https://mp.weixin.qq.com/");
        }

        // 执行请求
        HttpResponse response = request.execute();

        // 验证响应类型
        String contentType = response.header("Content-Type");
        if (!contentType.startsWith("image/")) {
            throw new ServiceException("URL不是有效的图片地址");
        }

        // 保存到临时文件
        tempFile = FileUtil.createTempFile(".tmp", true);
        FileUtil.writeBytes(response.bodyBytes(), tempFile);

        // 获取文件后缀
        String suffix = getImageSuffix(contentType);

        // 上传到OSS
        OssClient storage = OssFactory.instance();
        UploadResult uploadResult = storage.uploadSuffix(tempFile, suffix, moduleName);

        // 保存记录
        return buildResultEntity(
            FileUtil.getName(url),
            suffix,
            storage.getConfigKey(),
            uploadResult.getUrl(),
            uploadResult.getFileName(),
            directoryId,
            tempFile.length()
        );
    } finally {
        // 清理临时文件
        if (tempFile != null) {
            FileUtil.del(tempFile);
        }
    }
}

private String getImageSuffix(String contentType) {
    return switch (contentType) {
        case "image/jpeg" -> ".jpg";
        case "image/png" -> ".png";
        case "image/gif" -> ".gif";
        case "image/webp" -> ".webp";
        case "image/svg+xml" -> ".svg";
        default -> ".jpg";
    };
}
```

---

## 文件下载

### 基础下载

```java
@GetMapping("/download/{ossId}")
public void download(@PathVariable Long ossId, HttpServletResponse response) {
    sysOssService.download(ossId, response);
}
```

**Service 实现：**

```java
@Override
public void download(Long ossId, HttpServletResponse response) {
    // 查询文件信息
    SysOss oss = getById(ossId);
    if (oss == null) {
        throw new ServiceException("文件不存在");
    }

    // 获取OSS客户端
    OssClient storage = OssFactory.instance(oss.getService());

    try {
        // 设置响应头
        FileUtils.setAttachmentResponseHeader(response, oss.getOriginalName());
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);

        // 写入响应流
        storage.downloadToStream(oss.getFileName(), response.getOutputStream(), null);
    } catch (IOException e) {
        throw new ServiceException("文件下载失败: " + e.getMessage());
    }
}
```

### 预签名 URL 访问

对于私有桶文件，需要生成预签名 URL：

```java
@Override
public String getPresignedUrl(Long ossId) {
    SysOss oss = getById(ossId);
    if (oss == null) {
        throw new ServiceException("文件不存在");
    }

    OssClient storage = OssFactory.instance(oss.getService());

    // 检查访问策略
    if (storage.getAccessPolicy() == AccessPolicyType.PRIVATE) {
        // 生成60分钟有效期的预签名URL
        return storage.generatePresignedUrl(
            oss.getFileName(),
            Duration.ofMinutes(60)
        );
    }

    // 公开桶直接返回URL
    return oss.getUrl();
}
```

### 批量文件处理

```java
@GetMapping("/listOssByIds/{ossIds}")
public R<List<SysOssVo>> listOssByIds(@PathVariable String ossIds) {
    List<Long> ids = StringUtils.splitTo(ossIds, Convert::toLong);
    List<SysOssVo> list = sysOssService.listByIds(ids);

    // 匹配私有桶URL
    list.forEach(this::matchingUrl);

    return R.ok(list);
}

/**
 * 匹配私有桶URL，生成临时访问地址
 */
private void matchingUrl(SysOssVo oss) {
    OssClient storage = OssFactory.instance(oss.getService());

    if (storage.getAccessPolicy() == AccessPolicyType.PRIVATE) {
        String presignedUrl = storage.generatePresignedUrl(
            oss.getFileName(), Duration.ofMinutes(60));
        oss.setUrl(presignedUrl);
    }
}
```

---

## 文件类型校验

### 支持的文件类型

系统预定义了常见文件类型分类：

```java
public class FileTypeUtils {

    /** 图片类型 */
    public static final String[] IMAGE_EXTENSION = {
        "bmp", "gif", "jpg", "jpeg", "png"
    };

    /** 视频类型 */
    public static final String[] VIDEO_EXTENSION = {
        "mp4", "avi", "rmvb"
    };

    /** 媒体类型 */
    public static final String[] MEDIA_EXTENSION = {
        "swf", "flv", "mp3", "wav", "wma", "wmv",
        "mid", "avi", "mpg", "asf", "rm", "rmvb"
    };

    /** 文档类型 */
    public static final String[] DOCUMENT_EXTENSION = {
        "doc", "docx", "xls", "xlsx", "ppt", "pptx",
        "html", "htm", "txt", "pdf"
    };

    /** 压缩文件类型 */
    public static final String[] ARCHIVE_EXTENSION = {
        "rar", "zip", "gz", "bz2"
    };

    /** 默认允许的文件类型 */
    public static final String[] DEFAULT_ALLOWED_EXTENSION;

    static {
        // 合并所有允许的类型
        DEFAULT_ALLOWED_EXTENSION = ArrayUtil.addAll(
            IMAGE_EXTENSION,
            VIDEO_EXTENSION,
            DOCUMENT_EXTENSION,
            ARCHIVE_EXTENSION
        );
    }
}
```

### 类型判断方法

```java
public class FileTypeUtils {

    /**
     * 获取文件扩展名
     */
    public static String getExtension(String fileName) {
        if (StrUtil.isBlank(fileName)) {
            return "";
        }
        int index = fileName.lastIndexOf(".");
        if (index == -1) {
            return "";
        }
        return fileName.substring(index + 1).toLowerCase();
    }

    /**
     * 判断是否为图片类型
     */
    public static boolean isImage(String extension) {
        return ArrayUtil.contains(IMAGE_EXTENSION, extension.toLowerCase());
    }

    /**
     * 判断是否为视频类型
     */
    public static boolean isVideo(String extension) {
        return ArrayUtil.contains(VIDEO_EXTENSION, extension.toLowerCase());
    }

    /**
     * 判断是否为文档类型
     */
    public static boolean isDocument(String extension) {
        return ArrayUtil.contains(DOCUMENT_EXTENSION, extension.toLowerCase());
    }

    /**
     * 判断是否为压缩文件
     */
    public static boolean isArchive(String extension) {
        return ArrayUtil.contains(ARCHIVE_EXTENSION, extension.toLowerCase());
    }

    /**
     * 判断是否为允许的文件类型
     */
    public static boolean isAllowed(String extension) {
        return ArrayUtil.contains(DEFAULT_ALLOWED_EXTENSION, extension.toLowerCase());
    }

    /**
     * 获取文件类型描述
     */
    public static String getFileType(String fileName) {
        String extension = getExtension(fileName);
        if (isImage(extension)) {
            return "image";
        } else if (isVideo(extension)) {
            return "video";
        } else if (isDocument(extension)) {
            return "document";
        } else if (isArchive(extension)) {
            return "archive";
        }
        return "other";
    }
}
```

### 上传时的类型校验

```java
/**
 * 文件上传校验器
 */
@Component
public class FileUploadValidator {

    @Value("${file.upload.allowed-extensions:}")
    private String[] allowedExtensions;

    @Value("${file.upload.max-size:10485760}")
    private long maxFileSize;

    /**
     * 校验上传文件
     */
    public void validate(MultipartFile file) {
        // 校验文件是否为空
        if (file == null || file.isEmpty()) {
            throw new ServiceException("上传文件不能为空");
        }

        // 校验文件大小
        if (file.getSize() > maxFileSize) {
            throw new ServiceException(
                "文件大小超出限制，最大允许: " + (maxFileSize / 1024 / 1024) + "MB"
            );
        }

        // 校验文件类型
        String extension = FileTypeUtils.getExtension(file.getOriginalFilename());
        if (!isAllowedExtension(extension)) {
            throw new ServiceException(
                "不支持的文件类型: " + extension
            );
        }

        // 校验文件内容类型
        validateContentType(file, extension);
    }

    private boolean isAllowedExtension(String extension) {
        if (allowedExtensions == null || allowedExtensions.length == 0) {
            return FileTypeUtils.isAllowed(extension);
        }
        return ArrayUtil.contains(allowedExtensions, extension.toLowerCase());
    }

    /**
     * 校验文件内容类型与扩展名是否匹配
     */
    private void validateContentType(MultipartFile file, String extension) {
        String contentType = file.getContentType();

        // 图片类型校验
        if (FileTypeUtils.isImage(extension)) {
            if (!contentType.startsWith("image/")) {
                throw new ServiceException("文件内容与扩展名不匹配");
            }
        }

        // 视频类型校验
        if (FileTypeUtils.isVideo(extension)) {
            if (!contentType.startsWith("video/")) {
                throw new ServiceException("文件内容与扩展名不匹配");
            }
        }
    }
}
```

---

## OssClient 核心 API

### 获取客户端实例

```java
// 获取默认OSS客户端
OssClient client = OssFactory.instance();

// 根据配置键获取客户端
OssClient client = OssFactory.instance("aliyun");

// 根据类型获取客户端
OssClient client = OssFactory.instance(OssType.MINIO);
```

### 文件上传 API

```java
/**
 * 上传文件
 *
 * @param file 文件对象
 * @param key 存储路径
 * @param contentType MIME类型
 * @return 上传结果
 */
UploadResult uploadFile(File file, String key, String contentType);

/**
 * 按后缀上传
 *
 * @param file 文件对象
 * @param suffix 文件后缀
 * @param moduleName 模块名称
 * @return 上传结果
 */
UploadResult uploadSuffix(File file, String suffix, String moduleName);

/**
 * 上传流
 *
 * @param inputStream 输入流
 * @param key 存储路径
 * @param length 文件长度
 * @param contentType MIME类型
 * @return 上传结果
 */
UploadResult uploadStream(InputStream inputStream, String key,
                         Long length, String contentType);
```

### 文件下载 API

```java
/**
 * 下载到临时文件
 *
 * @param path 文件路径
 * @return 临时文件
 */
File downloadToTempFile(String path);

/**
 * 下载到输出流
 *
 * @param key 存储路径
 * @param out 输出流
 * @param consumer 进度回调
 */
void downloadToStream(String key, OutputStream out, Consumer<Long> consumer);

/**
 * 获取文件流
 *
 * @param path 文件路径
 * @return 输入流
 */
InputStream getFileAsStream(String path);
```

### 文件操作 API

```java
/**
 * 删除文件
 *
 * @param path 文件路径
 */
void deleteFile(String path);

/**
 * 复制文件
 *
 * @param sourcePath 源路径
 * @param targetPath 目标路径
 */
void copyFile(String sourcePath, String targetPath);

/**
 * 获取文件元数据
 *
 * @param path 文件路径
 * @return 元数据信息
 */
OssFileMetadata getFileMetadata(String path);

/**
 * 列出文件
 *
 * @param prefix 路径前缀
 * @param maxResults 最大结果数
 * @return 文件列表
 */
List<OssFileInfo> listFiles(String prefix, int maxResults);
```

### URL 生成 API

```java
/**
 * 生成预签名URL (用于私有文件访问)
 *
 * @param objectKey 对象键
 * @param expiredTime 过期时间
 * @return 预签名URL
 */
String generatePresignedUrl(String objectKey, Duration expiredTime);

/**
 * 生成预签名上传URL (用于客户端直传)
 *
 * @param objectKey 对象键
 * @param contentType MIME类型
 * @param expiration 过期时间(秒)
 * @return 预签名上传URL
 */
String generatePresignedUploadUrl(String objectKey, String contentType, int expiration);

/**
 * 生成公共URL
 *
 * @param objectKey 对象键
 * @return 公共访问URL
 */
String generatePublicUrl(String objectKey);
```

---

## 前端文件上传组件

### Element Plus 上传组件封装

```vue
<template>
  <el-upload
    ref="uploadRef"
    v-model:file-list="fileList"
    :action="uploadUrl"
    :headers="headers"
    :data="uploadData"
    :accept="accept"
    :limit="limit"
    :multiple="multiple"
    :before-upload="handleBeforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-exceed="handleExceed"
    :on-remove="handleRemove"
    :on-preview="handlePreview"
  >
    <template #trigger>
      <el-button type="primary">
        <el-icon><Upload /></el-icon>
        选择文件
      </el-button>
    </template>
    <template #tip>
      <div class="el-upload__tip">
        {{ tipText }}
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'

interface Props {
  modelValue?: string[]
  moduleName?: string
  accept?: string
  limit?: number
  multiple?: boolean
  maxSize?: number // 单位: MB
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  moduleName: 'default',
  accept: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx',
  limit: 5,
  multiple: true,
  maxSize: 10
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'success': [response: any, file: any]
  'error': [error: any, file: any]
}>()

const uploadRef = ref()
const fileList = ref([])

const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL}/resource/oss/upload`
})

const headers = computed(() => ({
  Authorization: 'Bearer ' + getToken()
}))

const uploadData = computed(() => ({
  moduleName: props.moduleName
}))

const tipText = computed(() => {
  return `只能上传 ${props.accept} 文件，且不超过 ${props.maxSize}MB`
})

// 上传前校验
const handleBeforeUpload = (file: File) => {
  // 校验文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`上传文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  // 校验文件类型
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = props.accept.split(',').map(ext => ext.replace('.', ''))
  if (extension && !allowedExtensions.includes(extension)) {
    ElMessage.error(`不支持的文件类型: ${extension}`)
    return false
  }

  return true
}

// 上传成功
const handleSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    const urls = [...props.modelValue, response.data.url]
    emit('update:modelValue', urls)
    emit('success', response, file)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
    // 从列表中移除失败的文件
    const index = fileList.value.findIndex((f: any) => f.uid === file.uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }
}

// 上传失败
const handleError = (error: any, file: any) => {
  ElMessage.error('上传失败')
  emit('error', error, file)
}

// 超出限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

// 移除文件
const handleRemove = (file: any) => {
  const urls = props.modelValue.filter(url => url !== file.url)
  emit('update:modelValue', urls)
}

// 预览文件
const handlePreview = (file: any) => {
  window.open(file.url)
}

// 清空文件列表
const clearFiles = () => {
  uploadRef.value?.clearFiles()
  emit('update:modelValue', [])
}

defineExpose({
  clearFiles
})
</script>
```

### 使用示例

```vue
<template>
  <div>
    <h3>图片上传</h3>
    <oss-upload
      v-model="imageUrls"
      module-name="avatar"
      accept=".jpg,.jpeg,.png,.gif"
      :limit="3"
      :max-size="5"
      @success="onUploadSuccess"
    />

    <h3>文档上传</h3>
    <oss-upload
      v-model="documentUrls"
      module-name="document"
      accept=".pdf,.doc,.docx,.xls,.xlsx"
      :limit="10"
      :max-size="20"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OssUpload from '@/components/OssUpload/index.vue'

const imageUrls = ref<string[]>([])
const documentUrls = ref<string[]>([])

const onUploadSuccess = (response: any) => {
  console.log('上传成功:', response)
}
</script>
```

---

## UniApp 文件上传

### 基础上传封装

```typescript
// utils/upload.ts
import { getToken } from '@/utils/auth'

interface UploadOptions {
  file: string // 临时文件路径
  moduleName?: string
  directoryId?: number
  onProgress?: (progress: number) => void
}

interface UploadResult {
  ossId: number
  url: string
  originalName: string
  fileName: string
  fileSize: number
}

/**
 * 上传文件到OSS
 */
export const uploadFile = (options: UploadOptions): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const { file, moduleName = 'default', directoryId, onProgress } = options

    const uploadTask = uni.uploadFile({
      url: `${import.meta.env.VITE_API_BASE_URL}/resource/oss/upload`,
      filePath: file,
      name: 'file',
      formData: {
        moduleName,
        ...(directoryId && { directoryId })
      },
      header: {
        Authorization: `Bearer ${getToken()}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data.data)
          } else {
            reject(new Error(data.msg || '上传失败'))
          }
        } else {
          reject(new Error(`上传失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })

    // 监听上传进度
    if (onProgress) {
      uploadTask.onProgressUpdate((res) => {
        onProgress(res.progress)
      })
    }
  })
}

/**
 * 选择并上传图片
 */
export const chooseAndUploadImage = async (options?: {
  count?: number
  sizeType?: ('original' | 'compressed')[]
  sourceType?: ('album' | 'camera')[]
  moduleName?: string
}): Promise<UploadResult[]> => {
  const {
    count = 1,
    sizeType = ['compressed'],
    sourceType = ['album', 'camera'],
    moduleName = 'image'
  } = options || {}

  // 选择图片
  const chooseResult = await uni.chooseImage({
    count,
    sizeType,
    sourceType
  })

  // 上传所有图片
  const uploadPromises = chooseResult.tempFilePaths.map(filePath =>
    uploadFile({ file: filePath, moduleName })
  )

  return Promise.all(uploadPromises)
}

/**
 * 选择并上传文件
 */
export const chooseAndUploadFile = async (options?: {
  count?: number
  type?: 'all' | 'video' | 'image' | 'file'
  moduleName?: string
}): Promise<UploadResult[]> => {
  const {
    count = 1,
    type = 'file',
    moduleName = 'document'
  } = options || {}

  // #ifdef MP-WEIXIN
  const chooseResult = await uni.chooseMessageFile({
    count,
    type
  })

  const uploadPromises = chooseResult.tempFiles.map(file =>
    uploadFile({ file: file.path, moduleName })
  )

  return Promise.all(uploadPromises)
  // #endif

  // #ifndef MP-WEIXIN
  throw new Error('当前平台不支持选择文件')
  // #endif
}
```

### 图片上传组件

```vue
<!-- components/image-upload/index.vue -->
<template>
  <view class="image-upload">
    <view class="image-list">
      <view
        v-for="(item, index) in modelValue"
        :key="index"
        class="image-item"
      >
        <image
          :src="item"
          mode="aspectFill"
          @tap="handlePreview(index)"
        />
        <view class="delete-btn" @tap.stop="handleDelete(index)">
          <wd-icon name="close" size="24rpx" color="#fff" />
        </view>
      </view>

      <view
        v-if="modelValue.length < limit"
        class="add-btn"
        @tap="handleAdd"
      >
        <wd-icon name="add" size="48rpx" color="#999" />
        <text class="add-text">{{ addText }}</text>
      </view>
    </view>

    <view v-if="uploading" class="upload-progress">
      <wd-progress :percentage="progress" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadFile } from '@/utils/upload'

interface Props {
  modelValue: string[]
  limit?: number
  addText?: string
  moduleName?: string
  maxSize?: number // 单位: MB
}

const props = withDefaults(defineProps<Props>(), {
  limit: 9,
  addText: '添加图片',
  moduleName: 'image',
  maxSize: 10
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const uploading = ref(false)
const progress = ref(0)

const handleAdd = async () => {
  try {
    const result = await uni.chooseImage({
      count: props.limit - props.modelValue.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    uploading.value = true
    progress.value = 0

    const urls: string[] = [...props.modelValue]

    for (let i = 0; i < result.tempFilePaths.length; i++) {
      const filePath = result.tempFilePaths[i]

      // 校验文件大小
      const fileInfo = await uni.getFileInfo({ filePath })
      if (fileInfo.size > props.maxSize * 1024 * 1024) {
        uni.showToast({
          title: `图片大小不能超过${props.maxSize}MB`,
          icon: 'none'
        })
        continue
      }

      const uploadResult = await uploadFile({
        file: filePath,
        moduleName: props.moduleName,
        onProgress: (p) => {
          progress.value = Math.floor((i / result.tempFilePaths.length) * 100 + p / result.tempFilePaths.length)
        }
      })

      urls.push(uploadResult.url)
    }

    emit('update:modelValue', urls)
  } catch (error: any) {
    if (error.errMsg !== 'chooseImage:fail cancel') {
      uni.showToast({
        title: error.message || '上传失败',
        icon: 'none'
      })
    }
  } finally {
    uploading.value = false
    progress.value = 0
  }
}

const handleDelete = (index: number) => {
  const urls = [...props.modelValue]
  urls.splice(index, 1)
  emit('update:modelValue', urls)
}

const handlePreview = (index: number) => {
  uni.previewImage({
    urls: props.modelValue,
    current: index
  })
}
</script>

<style lang="scss" scoped>
.image-upload {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .image-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }

    .delete-btn {
      position: absolute;
      top: 0;
      right: 0;
      width: 40rpx;
      height: 40rpx;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0 8rpx 0 8rpx;
    }
  }

  .add-btn {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #dcdfe6;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .add-text {
      margin-top: 8rpx;
      font-size: 24rpx;
      color: #999;
    }
  }

  .upload-progress {
    margin-top: 16rpx;
  }
}
</style>
```

---

## 最佳实践

### 1. 合理选择存储策略

根据业务场景选择合适的存储策略：

| 场景 | 推荐策略 | 原因 |
|------|---------|------|
| 开发环境 | LOCAL | 无需配置云服务，快速开发 |
| 小型应用 | LOCAL | 成本低，维护简单 |
| 中大型应用 | 云存储 | 高可用，CDN 加速 |
| 敏感数据 | PRIVATE 桶 | 需要预签名 URL 访问 |
| 公开资源 | PUBLIC 桶 | 直接访问，性能好 |

### 2. 文件大小限制配置

根据业务需求合理配置文件大小限制：

```yaml
# application.yml
spring:
  servlet:
    multipart:
      # 图片上传限制
      max-file-size: 5MB
      # 文档上传限制
      max-request-size: 50MB

# 自定义配置
file:
  upload:
    # 图片最大大小 (字节)
    image-max-size: 5242880
    # 视频最大大小 (字节)
    video-max-size: 104857600
    # 文档最大大小 (字节)
    document-max-size: 52428800
```

### 3. 文件类型白名单

严格限制允许上传的文件类型：

```java
@Configuration
public class FileUploadConfig {

    @Bean
    public FileUploadValidator fileUploadValidator() {
        FileUploadValidator validator = new FileUploadValidator();

        // 只允许安全的文件类型
        validator.setAllowedExtensions(new String[]{
            // 图片
            "jpg", "jpeg", "png", "gif", "webp",
            // 文档
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            // 视频
            "mp4", "avi", "mov",
            // 压缩包
            "zip", "rar"
        });

        // 禁止可执行文件
        validator.setDeniedExtensions(new String[]{
            "exe", "bat", "cmd", "sh", "ps1", "vbs", "js", "php"
        });

        return validator;
    }
}
```

### 4. 大文件上传优化

对于大文件上传，使用客户端直传：

```typescript
// 判断是否使用直传
const shouldUseDirectUpload = (file: File): boolean => {
  // 大于 10MB 使用直传
  return file.size > 10 * 1024 * 1024
}

const uploadFile = async (file: File) => {
  if (shouldUseDirectUpload(file)) {
    // 使用直传
    await directUploadToOss(file)
  } else {
    // 普通上传
    await normalUpload(file)
  }
}
```

### 5. 图片压缩处理

上传前进行图片压缩：

```typescript
// 压缩图片
const compressImage = async (file: File, options?: {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}): Promise<Blob> => {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options || {}

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // 计算缩放比例
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('压缩失败'))
          }
        },
        file.type,
        quality
      )
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = URL.createObjectURL(file)
  })
}
```

### 6. 文件命名规范

使用规范的文件命名策略：

```java
/**
 * 生成文件存储路径
 * 格式: {prefix}/{tenantId}/{moduleName}/{yyyy/MM/dd}/{uuid}.{ext}
 */
public String generateFilePath(String suffix, String moduleName) {
    // 获取租户ID
    String tenantId = TenantHelper.getTenantId();

    // 生成日期路径
    String datePath = DateUtil.format(new Date(), "yyyy/MM/dd");

    // 生成唯一文件名
    String fileName = IdUtil.fastSimpleUUID() + suffix;

    // 组装完整路径
    return String.format("%s/%s/%s/%s/%s",
        getPrefix(),
        tenantId,
        moduleName,
        datePath,
        fileName
    );
}
```

### 7. 错误处理

完善的错误处理机制：

```java
@ExceptionHandler(MaxUploadSizeExceededException.class)
public R<Void> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
    log.warn("文件上传大小超限: {}", e.getMessage());
    return R.fail("上传文件大小超出限制");
}

@ExceptionHandler(OssException.class)
public R<Void> handleOssException(OssException e) {
    log.error("OSS操作异常: {}", e.getMessage());
    return R.fail("文件操作失败: " + e.getMessage());
}

@ExceptionHandler(MultipartException.class)
public R<Void> handleMultipartException(MultipartException e) {
    log.warn("文件上传异常: {}", e.getMessage());
    return R.fail("文件上传失败，请检查文件格式和大小");
}
```

---

## 常见问题

### 1. 文件上传失败，提示文件过大

**问题原因：**
- Spring Boot 默认限制文件大小为 1MB
- Nginx 反向代理默认限制为 1MB
- 云服务商可能有额外限制

**解决方案：**

1. 修改 Spring Boot 配置：
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 100MB
```

2. 修改 Nginx 配置：
```nginx
client_max_body_size 100m;
```

3. 对于大文件，使用客户端直传方式

### 2. 私有桶文件无法访问

**问题原因：**
- 私有桶需要使用预签名 URL 访问
- 预签名 URL 可能已过期
- 桶权限配置错误

**解决方案：**

```java
// 检查并生成有效的预签名URL
public String getAccessUrl(SysOss oss) {
    OssClient client = OssFactory.instance(oss.getService());

    // 检查访问策略
    if (client.getAccessPolicy() == AccessPolicyType.PRIVATE) {
        // 生成新的预签名URL，有效期60分钟
        return client.generatePresignedUrl(
            oss.getFileName(),
            Duration.ofMinutes(60)
        );
    }

    return oss.getUrl();
}
```

### 3. 跨域问题

**问题原因：**
- 云存储服务未配置 CORS
- 前端直传时遇到跨域限制

**解决方案：**

1. 配置云存储 CORS 规则：
```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}
```

2. 使用服务端代理上传

### 4. 文件名乱码

**问题原因：**
- 文件名包含中文或特殊字符
- HTTP Header 编码问题

**解决方案：**

```java
/**
 * 设置文件下载响应头，处理文件名编码
 */
public static void setAttachmentResponseHeader(HttpServletResponse response,
                                               String fileName) throws IOException {
    String encodedFileName = percentEncode(fileName);

    // RFC 5987 标准
    response.setHeader("Content-Disposition",
        "attachment; filename=\"" + encodedFileName + "\"; " +
        "filename*=utf-8''" + encodedFileName);

    // 兼容某些浏览器
    response.setHeader("download-filename", encodedFileName);
}

private static String percentEncode(String s) throws UnsupportedEncodingException {
    return URLEncoder.encode(s, StandardCharsets.UTF_8)
        .replaceAll("\\+", "%20")
        .replaceAll("%21", "!")
        .replaceAll("%27", "'")
        .replaceAll("%28", "(")
        .replaceAll("%29", ")")
        .replaceAll("%7E", "~");
}
```

### 5. 图片无法预览

**问题原因：**
- Content-Type 设置错误
- 跨域问题
- 私有桶未使用预签名 URL

**解决方案：**

```java
// 确保正确的 Content-Type
private String getContentType(String suffix) {
    return switch (suffix.toLowerCase()) {
        case ".jpg", ".jpeg" -> "image/jpeg";
        case ".png" -> "image/png";
        case ".gif" -> "image/gif";
        case ".webp" -> "image/webp";
        case ".svg" -> "image/svg+xml";
        case ".pdf" -> "application/pdf";
        default -> "application/octet-stream";
    };
}
```

### 6. 上传进度不显示

**问题原因：**
- 使用了不支持进度监听的上传方式
- 前端未正确监听进度事件

**解决方案：**

```typescript
// UniApp 监听上传进度
const uploadTask = uni.uploadFile({
  url: uploadUrl,
  filePath: file,
  name: 'file',
  success: (res) => { /* ... */ },
  fail: (err) => { /* ... */ }
})

// 监听进度
uploadTask.onProgressUpdate((res) => {
  console.log('上传进度:', res.progress)
  console.log('已上传数据长度:', res.totalBytesSent)
  console.log('预期上传数据总长度:', res.totalBytesExpectedToSend)
})

// 取消上传
// uploadTask.abort()
```

---

## 性能优化

### 1. CDN 加速

配置 CDN 加速静态资源访问：

```yaml
oss:
  # 使用CDN域名
  domain: https://cdn.example.com
```

### 2. 图片懒加载

前端使用懒加载减少初始加载时间：

```vue
<template>
  <image
    :src="imageLoaded ? imageUrl : placeholder"
    mode="aspectFill"
    lazy-load
    @load="imageLoaded = true"
  />
</template>
```

### 3. 缩略图生成

使用 OSS 图片处理功能生成缩略图：

```typescript
// 阿里云OSS图片处理参数
const getThumbnailUrl = (url: string, width: number, height: number) => {
  return `${url}?x-oss-process=image/resize,m_fill,w_${width},h_${height}`
}

// 腾讯云COS图片处理参数
const getThumbnailUrlCos = (url: string, width: number, height: number) => {
  return `${url}?imageMogr2/thumbnail/${width}x${height}`
}
```

### 4. 分片上传

对于超大文件，使用分片上传：

```typescript
// 分片上传示例
const chunkUpload = async (file: File, chunkSize = 5 * 1024 * 1024) => {
  const chunks = Math.ceil(file.size / chunkSize)
  const uploadId = await initMultipartUpload(file.name)

  const parts: Part[] = []

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    const part = await uploadPart(uploadId, i + 1, chunk)
    parts.push(part)
  }

  await completeMultipartUpload(uploadId, parts)
}
```

---

## 安全建议

### 1. 文件类型校验

始终在服务端进行文件类型校验：

```java
// 不要仅依赖扩展名，检查文件魔数
public boolean validateFileType(MultipartFile file) {
    try {
        String contentType = file.getContentType();
        byte[] bytes = file.getBytes();

        // 检查文件魔数
        String magicType = FileTypeUtil.getType(bytes);

        // 验证扩展名、Content-Type、魔数是否一致
        String extension = FileTypeUtils.getExtension(file.getOriginalFilename());

        return isTypeConsistent(extension, contentType, magicType);
    } catch (IOException e) {
        return false;
    }
}
```

### 2. 路径遍历防护

防止路径遍历攻击：

```java
public String sanitizeFileName(String fileName) {
    // 移除路径分隔符
    String sanitized = fileName.replaceAll("[/\\\\]", "");

    // 移除特殊字符
    sanitized = sanitized.replaceAll("[^a-zA-Z0-9._-]", "_");

    // 防止目录遍历
    if (sanitized.contains("..")) {
        throw new ServiceException("非法文件名");
    }

    return sanitized;
}
```

### 3. 访问权限控制

确保文件访问权限：

```java
@GetMapping("/download/{ossId}")
@PreAuthorize("@ss.hasPermission('resource:oss:download')")
public void download(@PathVariable Long ossId, HttpServletResponse response) {
    // 检查文件所属租户
    SysOss oss = sysOssService.getById(ossId);
    if (!TenantHelper.getTenantId().equals(oss.getTenantId())) {
        throw new ServiceException("无权访问该文件");
    }

    sysOssService.download(ossId, response);
}
```

### 4. 防盗链配置

配置 OSS 防盗链：

```java
// 阿里云OSS防盗链配置
BucketReferer referer = new BucketReferer();
referer.setAllowEmptyReferer(false);
referer.setRefererList(Arrays.asList(
    "https://www.example.com",
    "https://*.example.com"
));
ossClient.setBucketReferer(bucketName, referer);
```

---

## 总结

RuoYi-Plus 文件处理系统提供了完整的文件管理解决方案：

1. **多存储支持** - 统一 API 对接多种存储后端
2. **安全可靠** - 完善的权限控制和安全校验
3. **高性能** - 支持客户端直传、CDN 加速
4. **易扩展** - 策略模式设计，便于扩展新存储类型
5. **多租户** - 内置租户隔离，数据安全有保障

合理使用这些特性，可以构建高效、安全、可扩展的文件处理系统。
