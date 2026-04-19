# OSS存储 (oss)

## 1. 模块概述

OSS（Object Storage Service）对象存储模块是一个企业级的文件管理系统，支持多种存储提供商（如阿里云OSS、腾讯云COS、AWS S3等），提供文件上传、下载、管理、目录分类等功能。

### 1.1 主要特性

- **多云存储支持**：支持多种云存储提供商
- **目录分类管理**：支持层级目录结构，便于文件分类
- **预签名上传**：支持客户端直传，提升上传效率
- **文件替换**：支持保持路径不变的文件替换功能
- **远程图片保存**：支持通过URL下载远程图片到本地存储
- **权限控制**：细粒度的权限管理
- **缓存优化**：Redis缓存提升访问性能
- **多租户支持**：支持多租户隔离

### 1.2 技术架构

```
├── Controller 层（接口控制）
├── Service 层（业务逻辑）
├── Mapper 层（数据访问）
├── Entity 层（实体对象）
├── BO 层（业务对象）
├── VO 层（视图对象）
└── Runner 层（启动初始化）
```

## 2. 核心组件

### 2.1 实体类（Entity）

#### 2.1.1 SysOss - OSS文件实体
```java
/**
 * OSS对象存储对象
 * 存储文件的基本信息和元数据
 */
@TableName("sys_oss")
public class SysOss extends TenantEntity {
    private Long ossId;           // 对象存储主键
    private Long directoryId;     // 目录ID
    private String fileName;      // 文件名
    private String originalName;  // 原名
    private String fileSuffix;    // 文件后缀名
    private Long fileSize;        // 文件大小(字节)
    private String url;           // URL地址
    private String service;       // 服务商
    // ... 其他字段
}
```

#### 2.1.2 SysOssConfig - OSS配置实体
```java
/**
 * OSS配置实体
 * 存储各个存储提供商的配置信息
 */
@TableName("sys_oss_config")
public class SysOssConfig extends BaseEntity {
    private Long ossConfigId;     // 主键
    private String configKey;     // 配置key
    private String accessKey;     // accessKey
    private String secretKey;     // 秘钥
    private String bucketName;    // 桶名称
    private String endpoint;      // 访问站点
    private String accessPolicy;  // 桶权限类型
    // ... 其他配置字段
}
```

#### 2.1.3 SysOssDirectory - OSS目录实体
```java
/**
 * OSS目录实体
 * 支持层级目录结构管理
 */
@TableName("sys_oss_directory")
public class SysOssDirectory extends TenantEntity {
    private Long directoryId;     // 目录ID
    private Long parentId;        // 父目录ID
    private String ancestors;     // 祖级列表
    private String directoryName; // 目录名称
    private String directoryPath; // 目录路径
    private Long orderNum;        // 显示顺序
    private String status;        // 目录状态
    // ... 其他字段
}
```

### 2.2 服务接口（Service Interface）

#### 2.2.1 ISysOssService - 文件服务接口
```java
public interface ISysOssService {

    // 基础CRUD操作
    SysOssVo get(Long ossId);
    List<SysOssVo> list(SysOssBo bo);
    PageResult<SysOssVo> page(SysOssBo bo, PageQuery pageQuery);
    Long add(SysOssBo bo);
    int update(SysOssBo bo);
    int batchDelete(Collection<Long> ids);
    int batchSave(List<SysOssBo> boList);

    // 文件上传(支持模块名称和目录路径)
    SysOssVo upload(String moduleName, Long directoryId, String directoryPath, MultipartFile file);
    SysOssVo upload(String moduleName, Long directoryId, String directoryPath, File file);

    // 文件下载
    void download(Long ossId, HttpServletResponse response) throws IOException;

    // 文件替换
    SysOssVo replace(Long ossId, MultipartFile file);

    // 远程图片保存(支持模块名称和目录路径)
    SysOssVo saveRemoteImageToOss(String moduleName, Long directoryId, String directoryPath, String url);

    // 预签名URL(支持模块名称和目录路径)
    PresignedUrlVo generatePresignedUrl(String fileName, String fileType, String moduleName, Long directoryId, String directoryPath);
    SysOssVo confirmDirectUpload(String fileName, String fileKey, String fileUrl, String moduleName, Long directoryId, String directoryPath, Long fileSize);

    // 文件查询
    SysOssVo getOssById(Long ossId);
    List<SysOssVo> listOssByIds(Collection<Long> ossIds);
    OssDTO getOssByUrl(String url);

    // 其他功能
    SysOssVo matchingUrl(SysOssVo oss);
    boolean deleteByUrls(String urls);
}
```

#### 2.2.2 ISysOssDirectoryService - 目录服务接口
```java
public interface ISysOssDirectoryService extends IBaseService<SysOssDirectory, SysOssDirectoryBo, SysOssDirectoryVo> {
    
    // 目录树结构
    List<Tree<Long>> getOssDirectoryTreeOptions(SysOssDirectoryBo bo);
    
    // 文件移动
    boolean moveOss(Long directoryId, List<Long> ossIds);
}
```

## 3. 核心功能详解

### 3.1 文件上传功能

#### 3.1.1 普通上传
```java
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public R<SysOssUploadVo> upload(@RequestPart("file") MultipartFile file,
                               @RequestParam(value = "moduleName", required = false) String moduleName,
                               @RequestParam(value = "directoryId", required = false) Long directoryId,
                               @RequestParam(value = "directoryPath", required = false) String directoryPath)
```

**功能说明：**
- 支持指定模块名称和目录上传
- 支持通过目录ID或目录路径指定存储位置
- 自动生成唯一文件名
- 支持多种文件类型
- 自动处理文件后缀名

**参数说明：**
- `file`: 要上传的文件(必需)
- `moduleName`: 模块名称,用于文件分类管理(可选)
- `directoryId`: 目录ID,指定文件存储的目录(可选)
- `directoryPath`: 目录路径,如"/文档/办公",可替代directoryId使用(可选)

**实现流程：**
1. 验证上传文件不为空
2. 获取原始文件名并处理特殊格式
3. 提取文件后缀名
4. 根据模块名称和目录信息确定存储路径
5. 获取OSS客户端实例
6. 执行文件上传到对象存储
7. 构建并保存文件记录到数据库
8. 返回文件信息(包含URL和originalUrl)

#### 3.1.2 预签名上传（直传）
```java
@PostMapping("/getPresignedUrl")
public R<PresignedUrlVo> getPresignedUrl(@Validated @RequestBody PresignedUrlBo presignedUrlBo)
```

**功能说明：**
- 生成预签名URL，支持客户端直传
- 减少服务器带宽压力
- 提升上传效率
- 支持大文件上传

**请求参数(PresignedUrlBo)：**
- `fileName`: 文件名(必需)
- `fileType`: 文件类型(必需)
- `moduleName`: 模块名称,用于文件分类管理(可选)
- `directoryId`: 目录ID,指定文件存储的目录(可选)
- `directoryPath`: 目录路径,如"/文档/办公",可替代directoryId使用(可选)

**实现流程：**
1. 接收预签名请求参数
2. 根据模块名称和目录信息确定存储路径
3. 生成唯一文件键
4. 调用存储客户端生成预签名URL
5. 返回预签名信息(包含presignedUrl、fileKey、fileUrl等)
6. 客户端使用预签名URL直接上传到存储服务
7. 上传完成后调用confirmDirectUpload接口确认并保存记录

### 3.2 文件替换功能

```java
public SysOssVo replace(Long ossId, MultipartFile file)
```

**功能特点：**
- 保持原始URL路径不变
- 类型校验：新文件必须与原文件类型一致
- 原子性操作：先删除后上传
- 保留原始记录信息

**实现步骤：**
1. 获取原始文件信息
2. 校验文件类型一致性
3. 删除OSS中的原文件
4. 使用相同路径上传新文件
5. 更新数据库记录

### 3.3 远程图片保存

```java
@PostMapping("/saveRemoteImageToOss")
public R<SysOssUploadVo> convertImageUrl(String imageUrl,
                                         @RequestParam(value = "moduleName", required = false) String moduleName,
                                         @RequestParam(value = "directoryId", required = false) Long directoryId,
                                         @RequestParam(value = "directoryPath", required = false) String directoryPath)
```

**功能说明：**
- 下载远程图片到本地存储
- 支持多种图片格式
- 自动处理微信图片等特殊场景
- 防重复下载机制(检查URL是否已存在)

**请求参数：**
- `imageUrl`: 远程图片URL(必需)
- `moduleName`: 模块名称,用于文件分类管理(可选)
- `directoryId`: 目录ID,指定文件存储的目录(可选)
- `directoryPath`: 目录路径,如"/文档/办公",可替代directoryId使用(可选)

**实现逻辑：**
1. 验证图片URL不为空
2. 检查是否已存在相同URL的记录,如果存在则直接返回
3. 配置HTTP请求头模拟浏览器
4. 处理特殊网站的防盗链
5. 下载图片到临时文件
6. 根据模块名称和目录信息上传到OSS存储
7. 清理临时文件
8. 返回文件信息

### 3.4 目录管理功能

#### 3.4.1 层级目录结构
- **ancestors字段**：存储祖先路径，支持快速查询
- **directoryPath字段**：完整目录路径
- **树形结构**：支持无限级目录嵌套

#### 3.4.2 目录树查询
```java
public List<Tree<Long>> getOssDirectoryTreeOptions(SysOssDirectoryBo bo)
```

**特殊节点：**
- **全部**：查看所有文件
- **未分类**：查看未分配目录的文件

#### 3.4.3 文件移动
```java
public boolean moveOss(Long directoryId, List<Long> ossIds)
```

**功能：**
- 批量移动文件到指定目录
- 支持移动到"未分类"
- 事务性操作保证数据一致性

## 4. API接口文档

### 4.1 文件管理接口

#### 上传文件
- **URL**: `POST /resource/oss/upload`
- **权限**: `system:oss:upload`
- **参数**:
    - `file`: MultipartFile（必需）
    - `moduleName`: String（可选，模块名称）
    - `directoryId`: Long（可选，目录ID）
    - `directoryPath`: String（可选，目录路径，如"/文档/办公"）
- **响应**: SysOssUploadVo

#### 获取预签名URL
- **URL**: `POST /resource/oss/getPresignedUrl`
- **权限**: `system:oss:upload`
- **请求体**: PresignedUrlBo
  - `fileName`: String（必需，文件名）
  - `fileType`: String（必需，文件类型）
  - `moduleName`: String（可选，模块名称）
  - `directoryId`: Long（可选，目录ID）
  - `directoryPath`: String（可选，目录路径）
- **响应**: PresignedUrlVo

#### 确认直传上传
- **URL**: `POST /resource/oss/confirmDirectUpload`
- **权限**: `system:oss:upload`
- **请求体**: ConfirmDirectUploadBo
  - `fileName`: String（必需，文件名）
  - `fileKey`: String（必需，文件键）
  - `fileUrl`: String（必需，文件URL）
  - `moduleName`: String（可选，模块名称）
  - `directoryId`: Long（可选，目录ID）
  - `directoryPath`: String（可选，目录路径）
  - `fileSize`: Long（可选，文件大小）
- **响应**: SysOssUploadVo

#### 文件下载
- **URL**: `GET /resource/oss/download/{ossId}`
- **权限**: `system:oss:download`
- **参数**: `ossId`: Long
- **响应**: 文件流

#### 文件替换
- **URL**: `POST /resource/oss/replace/{ossId}`
- **权限**: `system:oss:upload`
- **参数**:
    - `ossId`: Long
    - `file`: MultipartFile
- **响应**: SysOssUploadVo

#### 保存远程图片
- **URL**: `POST /resource/oss/saveRemoteImageToOss`
- **参数**:
    - `imageUrl`: String（必需，远程图片URL）
    - `moduleName`: String（可选，模块名称）
    - `directoryId`: Long（可选，目录ID）
    - `directoryPath`: String（可选，目录路径，如"/文档/办公"）
- **响应**: SysOssUploadVo

#### 删除文件
- **URL**: `DELETE /resource/oss/deleteOss/{ossIds}`
- **权限**: `system:oss:delete`
- **参数**: `ossIds`: Long[]
- **响应**: 操作结果

#### 查询文件列表
- **URL**: `GET /resource/oss/pageOss`
- **权限**: `system:oss:query`
- **参数**: SysOssBo + PageQuery
- **响应**: `PageResult<SysOssVo>`

#### 根据ID查询文件
- **URL**: `GET /resource/oss/listOssByIds/{ossIds}`
- **权限**: `system:oss:query`
- **参数**: `ossIds`: Long[]
- **响应**: `List<SysOssVo>`

#### 根据URL查询文件ID
- **URL**: `GET /resource/oss/getOssByUrl`
- **参数**: `url`: String
- **响应**: ossId

#### 导出文件列表
- **URL**: `POST /resource/oss/exportOss`
- **权限**: `system:oss:export`
- **参数**: SysOssBo + PageQuery
- **响应**: Excel文件流

### 4.2 目录管理接口

#### 查询目录列表
- **URL**: `GET /resource/oss-directory/pageOssDirectorys`
- **权限**: `system:ossDirectory:query`
- **参数**: SysOssDirectoryBo + PageQuery
- **响应**: `PageResult<SysOssDirectoryVo>`

#### 获取目录详情
- **URL**: `GET /resource/oss-directory/getOssDirectory/{directoryId}`
- **权限**: `system:ossDirectory:query`
- **参数**: `directoryId`: Long
- **响应**: SysOssDirectoryVo

#### 新增目录
- **URL**: `POST /resource/oss-directory/addOssDirectory`
- **权限**: `system:ossDirectory:add`
- **请求体**: SysOssDirectoryBo
- **响应**: 目录ID

#### 修改目录
- **URL**: `PUT /resource/oss-directory/updateOssDirectory`
- **权限**: `system:ossDirectory:update`
- **请求体**: SysOssDirectoryBo
- **响应**: 操作结果

#### 删除目录
- **URL**: `DELETE /resource/oss-directory/deleteOssDirectorys/{directoryIds}`
- **权限**: `system:ossDirectory:delete`
- **参数**: `directoryIds`: Long[]
- **响应**: 操作结果

#### 移动文件到目录
- **URL**: `PUT /resource/oss-directory/moveOssDirectory/{ossIds}`
- **权限**: `system:ossDirectory:update`
- **参数**:
    - `ossIds`: Long[]
    - `directoryId`: Long
- **响应**: 操作结果

#### 获取目录树
- **URL**: `GET /resource/oss-directory/getOssDirectoryTreeOptions`
- **权限**: `system:ossDirectory:query` 或 `system:oss:query`
- **参数**: SysOssDirectoryBo
- **响应**: `List<Tree<Long>>`

### 4.3 配置管理接口

#### 查询配置列表
- **URL**: `GET /resource/oss-config/pageOssConfigs`
- **权限**: `system:ossConfig:query`
- **参数**: SysOssConfigBo + PageQuery
- **响应**: `PageResult<SysOssConfigVo>`

#### 获取配置详情
- **URL**: `GET /resource/oss-config/getOssConfig/{ossConfigId}`
- **权限**: `system:ossConfig:query`
- **参数**: `ossConfigId`: Long
- **响应**: SysOssConfigVo

#### 新增配置
- **URL**: `POST /resource/oss-config/addOssConfig`
- **权限**: `system:ossConfig:add`
- **请求体**: SysOssConfigBo
- **响应**: 操作结果

#### 修改配置
- **URL**: `PUT /resource/oss-config/updateOssConfig`
- **权限**: `system:ossConfig:update`
- **请求体**: SysOssConfigBo
- **响应**: 操作结果

#### 删除配置
- **URL**: `DELETE /resource/oss-config/deleteOssConfigs/{ossConfigIds}`
- **权限**: `system:ossConfig:delete`
- **参数**: `ossConfigIds`: Long[]
- **响应**: 操作结果

#### 更改配置状态
- **URL**: `PUT /resource/oss-config/changeOssConfigStatus`
- **权限**: `system:ossConfig:update`
- **请求体**: SysOssConfigBo
- **响应**: 操作结果

## 5. 数据模型

### 5.1 数据表结构

#### sys_oss 表
```sql
CREATE TABLE sys_oss (
    oss_id         BIGINT       PRIMARY KEY,      -- 对象存储主键
    tenant_id      VARCHAR(20)  DEFAULT '000000', -- 租户编号
    directory_id   BIGINT       NULL,             -- 目录ID
    file_name      VARCHAR(255) NOT NULL,         -- 文件名
    original_name  VARCHAR(255) NOT NULL,         -- 原名
    file_suffix    VARCHAR(10)  NULL,             -- 文件后缀名
    file_size      BIGINT       NULL,             -- 文件大小(字节)
    url            VARCHAR(500) NOT NULL,         -- URL地址
    ext1           VARCHAR(255) NULL,             -- 扩展字段
    service        VARCHAR(20)  NOT NULL,         -- 服务商
    create_dept    BIGINT       NULL,             -- 创建部门
    create_by      BIGINT       NULL,             -- 创建者
    create_time    DATETIME     NULL,             -- 创建时间
    update_by      BIGINT       NULL,             -- 更新者
    update_time    DATETIME     NULL              -- 更新时间
);
```

#### sys_oss_config 表
```sql
CREATE TABLE sys_oss_config (
    oss_config_id  BIGINT       PRIMARY KEY,      -- 主键
    config_key     VARCHAR(20)  NOT NULL,         -- 配置key
    access_key     VARCHAR(255) NULL,             -- accessKey
    secret_key     VARCHAR(255) NULL,             -- 秘钥
    bucket_name    VARCHAR(100) NULL,             -- 桶名称
    prefix         VARCHAR(100) NULL,             -- 前缀
    endpoint       VARCHAR(255) NULL,             -- 访问站点
    domain         VARCHAR(255) NULL,             -- 自定义域名
    is_https       CHAR(1)      NULL,             -- 是否https
    region         VARCHAR(100) NULL,             -- 域
    status         CHAR(1)      DEFAULT '1',      -- 启用状态
    ext1           VARCHAR(255) NULL,             -- 扩展字段
    create_dept    BIGINT       NULL,             -- 创建部门
    create_by      BIGINT       NULL,             -- 创建者
    create_time    DATETIME     NULL,             -- 创建时间
    update_by      BIGINT       NULL,             -- 更新者
    update_time    DATETIME     NULL,             -- 更新时间
    remark         VARCHAR(500) NULL,             -- 备注
    access_policy  CHAR(1)      DEFAULT '1'       -- 桶权限类型
);
```

#### sys_oss_directory 表
```sql
CREATE TABLE sys_oss_directory (
    directory_id   BIGINT       PRIMARY KEY,      -- 目录ID
    tenant_id      VARCHAR(20)  DEFAULT '000000', -- 租户编号
    parent_id      BIGINT       DEFAULT 0,        -- 父目录ID
    ancestors      VARCHAR(500) DEFAULT '',       -- 祖级列表
    directory_name VARCHAR(100) NOT NULL,         -- 目录名称
    directory_path VARCHAR(500) NULL,             -- 目录路径
    order_num      BIGINT       DEFAULT 0,        -- 显示顺序
    status         CHAR(1)      DEFAULT '0',      -- 目录状态
    is_default     CHAR(1)      DEFAULT 'N',      -- 是否默认目录
    create_dept    BIGINT       NULL,             -- 创建部门
    create_by      BIGINT       NULL,             -- 创建者
    create_time    DATETIME     NULL,             -- 创建时间
    update_by      BIGINT       NULL,             -- 更新者
    update_time    DATETIME     NULL,             -- 更新时间
    remark         VARCHAR(500) NULL              -- 备注
);
```

### 5.2 索引设计

```sql
-- sys_oss 表索引
CREATE INDEX idx_sys_oss_tenant_id ON sys_oss(tenant_id);
CREATE INDEX idx_sys_oss_directory_id ON sys_oss(directory_id);
CREATE INDEX idx_sys_oss_file_suffix ON sys_oss(file_suffix);
CREATE INDEX idx_sys_oss_create_time ON sys_oss(create_time);
CREATE INDEX idx_sys_oss_url ON sys_oss(url);

-- sys_oss_directory 表索引
CREATE INDEX idx_sys_oss_directory_tenant_id ON sys_oss_directory(tenant_id);
CREATE INDEX idx_sys_oss_directory_parent_id ON sys_oss_directory(parent_id);
CREATE INDEX idx_sys_oss_directory_ancestors ON sys_oss_directory(ancestors);

-- sys_oss_config 表索引
CREATE UNIQUE INDEX uk_sys_oss_config_key ON sys_oss_config(config_key);
CREATE INDEX idx_sys_oss_config_status ON sys_oss_config(status);
```

## 6. 业务对象说明

### 6.1 BO（Business Object）- 业务对象

#### SysOssBo
```java
/**
 * OSS对象存储分页查询对象
 * 用于接收前端查询参数
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysOssBo extends BaseEntity {
    private Long ossId;           // ossId
    private Long directoryId;     // 目录id
    private String fileName;      // 文件名
    private String originalName;  // 原名
    private String fileSuffix;    // 文件后缀名
    private String url;           // URL地址
    private String service;       // 服务商
}
```

#### PresignedUrlBo
```java
/**
 * 获取预签名URL业务对象
 * 用于客户端直传功能
 */
@Data
public class PresignedUrlBo {
    @NotBlank(message = "文件名不能为空")
    private String fileName;      // 文件名

    @NotBlank(message = "文件类型不能为空")
    private String fileType;      // 文件类型

    private String moduleName;    // 模块名称（可选）
    private Long directoryId;     // 目录ID（可选）
    private String directoryPath; // 目录路径（可选）
}
```

#### ConfirmDirectUploadBo
```java
/**
 * 确认直传上传业务对象
 * 用于确认客户端直传完成
 */
@Data
public class ConfirmDirectUploadBo {
    @NotBlank(message = "文件名不能为空")
    private String fileName;      // 文件名

    @NotBlank(message = "文件键不能为空")
    private String fileKey;       // 文件键

    @NotBlank(message = "文件URL不能为空")
    private String fileUrl;       // 文件URL

    private String moduleName;    // 模块名称（可选）
    private Long directoryId;     // 目录ID（可选）
    private String directoryPath; // 目录路径（可选）
    private Long fileSize;        // 文件大小（可选）
}
```

### 6.2 VO（View Object）- 视图对象

#### SysOssVo
```java
/**
 * OSS对象存储视图对象
 * 用于向前端返回数据
 */
@Data
public class SysOssVo implements Serializable {
    private Long ossId;                    // 对象存储主键
    private Long directoryId;              // 目录id
    
    @SerialMap(converter = SerialMapConstant.DIRECTORY_ID_DIRECTORY_NAME, source = "directoryId")
    private String directoryName;          // 目录名称（自动转换）
    
    private String fileName;               // 文件名
    private String originalName;           // 原名
    private String fileSuffix;             // 文件后缀名
    private Long fileSize;                 // 文件大小
    private String url;                    // URL地址
    private Date createTime;               // 创建时间
    private Date updateTime;               // 更新时间
    
    @SerialMap(converter = SerialMapConstant.USER_ID_TO_NAME, source = "createBy")
    private String createByName;           // 上传人名称（自动转换）
    
    private String service;                // 服务商
}
```

#### PresignedUrlVo
```java
/**
 * 预签名URL响应Vo
 * 返回预签名上传相关信息
 */
@Data
@Builder
public class PresignedUrlVo {
    private String presignedUrl;    // 预签名上传URL
    private String fileKey;         // 文件键
    private String fileUrl;         // 文件访问URL
    private Integer expiration;     // 过期时间（秒）
    private String uploadTip;       // 上传提示信息
}
```

#### SysOssUploadVo
```java
/**
 * 上传对象信息
 * 统一的上传响应格式
 */
@Data
public class SysOssUploadVo {
    /**
     * URL地址（预览用，私有库会自动生成预签名URL）
     */
    @SerialMap(converter = SerialMapConstant.PRESIGNED_URL)
    private String url;

    /**
     * 原始URL地址（存储用，不含预签名参数）
     * 前端上传组件应使用此字段作为存储值
     */
    private String originalUrl;

    private String fileName;    // 文件名
    private String ossId;       // 对象存储主键
    private Date updateTime;    // 更新时间
}
```

## 7. 核心特性详解

### 7.1 多租户支持

OSS模块完整支持多租户架构：

- **数据隔离**：通过`tenant_id`字段实现租户数据隔离
- **路径隔离**：文件存储路径包含租户ID，物理隔离存储
- **配置隔离**：不同租户可以使用不同的存储配置

### 7.2 缓存机制

#### 7.2.1 文件信息缓存
```java
@Cacheable(cacheNames = CacheNames.SYS_OSS, key = "#ossId")
public SysOssVo getOssById(Long ossId)
```

#### 7.2.1.1 URL 查询结果缓存（防止 @SerialMap 重复查库）

```java
/**
 * 根据 URL 查询 OSS 文件信息
 * 使用缓存避免 @SerialMap(PRESIGNED_URL) 序列化时每次查询数据库
 */
@Cacheable(cacheNames = CacheNames.SYS_OSS, key = "'url:' + #url")
@Override
public OssDTO getOssByUrl(String url) {
    SysOss entity = ossDao.getByUrl(url);
    return ...;
}
```

**场景说明：** VO 中的 `url` 字段通过 `@SerialMap(PRESIGNED_URL)` 自动换成预签名访问 URL。在列表查询大量返回时，每条数据的 `@SerialMap` 都会回查 `getOssByUrl` 取密钥信息，导致数据库被重复访问。通过将 `getOssByUrl` 的结果按 `url:<实际URL>` 做 key 缓存，同一 URL 只查一次数据库。

**注意事项：**

- `cacheNames` 与 `getOssById` 共用 `CacheNames.SYS_OSS`，TTL 一致
- key 前缀 `'url:'` 避免与 `#ossId` 的整型 key 发生冲突
- 当调用 `deleteByUrls(...)` 删除文件时，需要同时驱逐这两类 key（参考 7.2.4 缓存失效策略）

#### 7.2.2 目录信息缓存
```java
@Cacheable(cacheNames = CacheNames.SYS_OSS_DIRECTORY, key = "#directoryId")
public String getDirectoryNameById(Long directoryId)
```

#### 7.2.3 配置信息缓存
```java
CacheUtils.put(CacheNames.SYS_OSS_CONFIG, configKey, JsonUtils.toJsonString(config));
```

### 7.3 安全机制

#### 7.3.1 权限控制
- `system:oss:query` - 查询文件权限
- `system:oss:upload` - 上传文件权限
- `system:oss:download` - 下载文件权限
- `system:oss:delete` - 删除文件权限
- `system:ossDirectory:*` - 目录管理权限
- `system:ossConfig:*` - 配置管理权限

#### 7.3.2 文件类型校验
- 上传时自动识别文件类型
- 替换时强制类型一致性校验
- 支持自定义文件类型限制

#### 7.3.3 防重复提交
```java
@RepeatSubmit()
```

### 7.4 错误处理机制

#### 7.4.1 业务异常处理
```java
// 文件不存在
if (ObjectUtil.isNull(sysOss)) {
    throw ServiceException.of("文件数据不存在!");
}

// 类型不匹配
if (!oldSuffix.equalsIgnoreCase(newSuffix)) {
    throw ServiceException.of("替换文件类型必须与原文件类型一致");
}
```

#### 7.4.2 系统异常处理
- 网络异常自动重试
- 存储服务异常降级处理
- 临时文件自动清理

## 8. 扩展性设计

### 8.1 存储提供商扩展

模块基于OssFactory工厂模式，支持轻松扩展新的存储提供商：

```java
// 获取存储客户端实例
OssClient storage = OssFactory.instance();
OssClient storage = OssFactory.instance(configKey);
```

### 8.2 文件处理扩展

支持在上传、下载过程中添加自定义处理逻辑：

```java
@Override
protected void beforeSave(SysOss entity) {
    // 自定义保存前处理逻辑
}

@Override
protected void beforeDelete(Collection<Long> ids) {
    // 自定义删除前处理逻辑
    // 同时删除OSS中的文件
}
```

### 8.3 事件监听扩展

可以通过Spring事件机制监听文件操作：

```java
// 文件上传事件
@EventListener
public void handleFileUpload(FileUploadEvent event) {
    // 处理文件上传后的业务逻辑
}
```

## 9. 性能优化

### 9.1 上传优化

- **预签名直传**：减少服务器中转，提升上传速度
- **分块上传**：支持大文件分块上传
- **并发上传**：支持多文件并发上传

### 9.2 查询优化

- **索引优化**：关键字段建立索引
- **缓存机制**：常用数据Redis缓存
- **分页查询**：避免大量数据一次性加载

### 9.3 存储优化

- **CDN加速**：静态资源CDN分发
- **压缩存储**：图片自动压缩
- **冷热分离**：冷数据自动迁移

## 10. 监控和运维

### 10.1 日志记录

系统提供完整的操作日志记录：

```java
@Log(title = "OSS对象存储", operType = DictOperType.INSERT)  // 上传日志
@Log(title = "OSS对象存储", operType = DictOperType.UPDATE)  // 替换日志
@Log(title = "OSS对象存储", operType = DictOperType.DELETE)  // 删除日志
@Log(title = "OSS对象存储", operType = DictOperType.EXPORT)  // 导出日志
```

### 10.2 健康检查

#### 10.2.1 启动时初始化检查
```java
@Component
public class OssApplicationRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        ossConfigService.initOssConfig();
        log.info("初始化OSS配置成功");
    }
}
```

#### 10.2.2 存储服务可用性检查
- 定期检查各存储服务连接状态
- 自动切换不可用的存储配置
- 存储异常告警通知

### 10.3 性能指标监控

#### 10.3.1 关键指标
- **上传成功率**：监控文件上传成功比例
- **下载响应时间**：监控文件下载耗时
- **存储空间使用率**：监控各租户存储使用情况
- **API调用频率**：监控接口调用统计

#### 10.3.2 异常监控
- 上传失败异常统计
- 存储服务连接异常
- 文件访问404异常
- 权限验证失败异常

## 11. 部署配置

### 11.1 数据库配置

```sql
-- 创建必要的表和索引

-- 初始化默认配置数据
INSERT INTO sys_oss_config VALUES 
(1, 'minio', 'minioadmin', 'minioadmin', 'ruoyi', '', 'http://127.0.0.1:9000', '', 'N', '', '0', '', '2021-08-13 14:17:28', 1, '2024-04-09 16:04:10', 1, 'Minio对象存储', '1');

-- 创建默认目录
INSERT INTO sys_oss_directory VALUES 
(1, '000000', 0, '0', '默认目录', '/默认目录', 0, '0', 'Y', 103, 1, '2025-04-14 10:00:00', 1, '2025-04-14 10:00:00', '系统默认目录');
```

### 11.2 应用配置

```yml
# application.yml
spring:
  servlet:
    multipart:
      max-file-size: 100MB      # 单个文件最大大小
      max-request-size: 1000MB  # 总请求最大大小
```

## 12. 最佳实践

### 12.1 文件命名规范

```java
/**
 * 文件路径生成策略
 * 格式: prefix/tenantId/datePath/uuid.suffix
 * 示例: upload/000000/2025/01/15/a1b2c3d4e5f6.jpg
 */
private String generateFileKey(String suffix, OssClient storage) {
    String prefix = storage.getProperties().getPrefix();
    String tenantId = SpringUtils.getBean(TenantService.class).getTenantId();
    String datePath = DateUtils.datePath();
    String uuid = IdUtil.fastSimpleUUID();
    
    return prefix + "/" + tenantId + "/" + datePath + "/" + uuid + suffix;
}
```

### 12.2 存储策略建议

#### 12.2.1 文件分类存储
- **图片文件**：使用CDN加速，设置较长缓存时间
- **文档文件**：普通存储，按需访问
- **临时文件**：设置自动过期删除
- **敏感文件**：使用私有桶，控制访问权限

#### 12.2.2 存储桶权限设置
```java
// 公开读桶 - 适用于静态资源
AccessPolicyType.PUBLIC

// 私有桶 - 适用于敏感文件
AccessPolicyType.PRIVATE

// 自定义权限 - 按需配置
AccessPolicyType.CUSTOM
```

### 12.3 安全建议

#### 12.3.1 文件上传安全
```java
// 文件类型白名单
private static final Set<String> ALLOWED_TYPES = Set.of(
    ".jpg", ".jpeg", ".png", ".gif", ".bmp",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx"
);

// 文件大小限制
private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

#### 12.3.2 访问控制
- 敏感文件使用预签名URL，设置合理过期时间
- 定期清理临时文件和过期链接
- 监控异常访问行为

### 12.4 性能优化建议

#### 12.4.1 上传优化
```java
// 大文件使用预签名直传
if (fileSize > 10 * 1024 * 1024) {  // 大于10MB
    return generatePresignedUrl(fileName, fileType, directoryId);
}

// 小文件直接上传
return upload(directoryId, file);
```

#### 12.4.2 缓存策略
```java
// 热点文件信息缓存
@Cacheable(cacheNames = CacheNames.SYS_OSS, key = "#ossId", unless = "#result == null")

// 缓存失效策略
@CacheEvict(cacheNames = CacheNames.SYS_OSS, key = "#ossId")
```

## 13. 故障排除

### 13.1 常见问题

#### 13.1.1 文件上传失败
**问题表现：** 上传接口返回500错误

**可能原因：**
1. 存储服务连接失败
2. 文件大小超过限制
3. 存储空间不足
4. 网络超时

**解决方案：**
```java
// 检查存储服务状态
try {
    OssClient client = OssFactory.instance();
    boolean isConnected = client.checkConnection();
} catch (Exception e) {
    log.error("存储服务连接失败", e);
}

// 检查文件大小
if (file.getSize() > MAX_FILE_SIZE) {
    throw ServiceException.of("文件大小超过限制");
}
```

#### 13.1.2 文件访问404
**问题表现：** 文件URL访问返回404

**可能原因：**
1. 文件已被删除
2. 存储桶配置错误
3. 文件路径错误
4. 权限不足

**解决方案：**
```java
// 验证文件是否存在
SysOss ossFile = ossService.getOssByUrl(fileUrl);
if (ossFile == null) {
    log.warn("文件记录不存在: {}", fileUrl);
}

// 检查存储服务中的文件
OssClient client = OssFactory.instance(ossFile.getService());
boolean exists = client.doesObjectExist(ossFile.getFileName());
```

#### 13.1.3 预签名URL失效
**问题表现：** 直传上传失败，提示URL过期

**解决方案：**
```java
// 检查URL生成时间和过期时间
if (System.currentTimeMillis() > expireTime) {
    // 重新生成预签名URL
    return generatePresignedUrl(fileName, fileType, directoryId);
}
```


> 本文档详细介绍了OSS对象存储模块的架构设计、功能特性、API接口、部署配置等内容。如有疑问或建议，欢迎提出Issue或参与讨论。
