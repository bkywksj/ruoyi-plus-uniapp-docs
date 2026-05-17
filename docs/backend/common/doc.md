# SpringDoc 接口文档模块

## 模块概述

`ruoyi-common-doc` 是基于 SpringDoc 实现的自动化 API 接口文档生成模块，支持 OpenAPI 3.0 规范。通过自定义配置和增强处理，提供了更加灵活和强大的文档生成能力，并配合 Apifox 进行接口管理、测试和协作。

**核心特性：**

- **自动化文档生成** - 基于注解和 Javadoc 注释自动生成 API 文档
- **智能标签提取** - 使用控制器 Javadoc 首行作为 API 标签名称
- **多模块分组** - 支持按业务模块进行 API 分组管理
- **安全认证集成** - 与 Sa-Token 认证框架深度集成
- **上下文路径处理** - 自动处理应用上下文路径前缀
- **OpenAPI 3.0 规范** - 完全符合 OpenAPI 3.0 标准规范

## 模块架构

```text
ruoyi-common-doc
├── config/
│   └── DocAutoConfiguration.java      # 自动配置类
├── handler/
│   └── OpenApiHandler.java            # 增强处理器
└── properties/
    └── SpringDocProperties.java       # 配置属性类
```

### 架构设计图

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SpringDoc 接口文档模块架构                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         应用层 (Application)                         │   │
│  │                                                                      │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│  │   │  业务控制器  │  │  系统控制器  │  │  代码生成器  │                │   │
│  │   │ (business)  │  │  (system)   │  │ (generator) │                │   │
│  │   │             │  │             │  │             │                │   │
│  │   │ @RestController               │  │             │                │   │
│  │   │ @Operation                    │  │             │                │   │
│  │   │ Javadoc注释                   │  │             │                │   │
│  │   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │   │
│  └──────────┼────────────────┼────────────────┼────────────────────────┘   │
│             │                │                │                             │
│             ▼                ▼                ▼                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       文档生成层 (Generation)                        │   │
│  │                                                                      │   │
│  │   ┌────────────────────────────────────────────────────────────┐   │   │
│  │   │                   OpenApiHandler (增强处理器)                │   │   │
│  │   │                                                             │   │   │
│  │   │  • 解析 Javadoc 注释                                        │   │   │
│  │   │  • 提取首行作为 Tag 名称                                    │   │   │
│  │   │  • 处理属性占位符                                           │   │   │
│  │   │  • 标签去重机制                                             │   │   │
│  │   │  • 继承 OpenAPIService                                      │   │   │
│  │   └────────────────────────────────────────────────────────────┘   │   │
│  │                               │                                     │   │
│  │                               ▼                                     │   │
│  │   ┌────────────────────────────────────────────────────────────┐   │   │
│  │   │               OpenApiCustomizer (路径定制器)                 │   │   │
│  │   │                                                             │   │   │
│  │   │  • 添加上下文路径前缀                                       │   │   │
│  │   │  • 使用 PlusPaths 避免重复处理                              │   │   │
│  │   │  • 处理全局安全要求                                         │   │   │
│  │   └────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        配置层 (Configuration)                        │   │
│  │                                                                      │   │
│  │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │   │
│  │   │DocAutoConfiguration│ │SpringDocProperties│ │   OpenAPI Bean   │    │   │
│  │   │                 │  │                 │  │                 │    │   │
│  │   │ @AutoConfiguration │ │ @ConfigurationProperties│ │• Info        │    │   │
│  │   │ @ConditionalOnProperty││ prefix="springdoc"│ │• Components│    │   │
│  │   │                 │  │                 │  │• Security     │    │   │
│  │   └─────────────────┘  └─────────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         输出层 (Output)                              │   │
│  │                                                                      │   │
│  │   ┌───────────────────────┐    ┌───────────────────────┐           │   │
│  │   │  /v3/api-docs          │    │  分组接口文档           │           │   │
│  │   │  (完整文档)            │    │                        │           │   │
│  │   │                        │    │  /v3/api-docs/business │           │   │
│  │   │  OpenAPI 3.0 JSON      │    │  /v3/api-docs/system   │           │   │
│  │   │                        │    │  /v3/api-docs/generator│           │   │
│  │   └───────────────────────┘    └───────────────────────┘           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 自动配置机制

### DocAutoConfiguration 自动配置类

`DocAutoConfiguration` 是 SpringDoc 接口文档的自动配置类，在 Spring Boot 启动时自动装配相关组件。

**配置条件：**

```java
@RequiredArgsConstructor
@AutoConfiguration(before = SpringDocConfiguration.class)
@EnableConfigurationProperties(SpringDocProperties.class)
@ConditionalOnProperty(name = "springdoc.api-docs.enabled", havingValue = "true", matchIfMissing = true)
public class DocAutoConfiguration {
    // ...
}
```

**关键特性：**

| 特性 | 说明 |
|------|------|
| 配置优先级 | 在 `SpringDocConfiguration` 之前加载，确保自定义配置生效 |
| 启用条件 | `springdoc.api-docs.enabled=true`，开发/测试环境默认开启；**生产环境默认关闭** |
| 属性绑定 | 通过 `SpringDocProperties` 绑定 YAML 配置 |

**生产环境默认关闭（`application-prod.yml`）：**

```yaml
################## API 文档配置 ##################
--- # SpringDoc API 文档（生产环境默认关闭）
springdoc:
  api-docs:
    enabled: ${SPRINGDOC_ENABLED:false}
```

- 默认值 `false`：生产环境部署时，`api-docs` 与 Swagger UI 均不对外暴露，减少接口被扫描与字段泄露风险
- 紧急排障需临时开启：注入环境变量 `SPRINGDOC_ENABLED=true` 重启即可恢复
- 开发/测试 `application-dev.yml` / `application-test.yml` 未设置该属性，`@ConditionalOnProperty(..., matchIfMissing = true)` 会自动启用

### OpenAPI Bean 配置

自动配置类创建 `OpenAPI` Bean，整合文档信息、安全方案等配置：

```java
@Bean
@ConditionalOnMissingBean(OpenAPI.class)
public OpenAPI openApi(SpringDocProperties properties) {
    OpenAPI openAPI = new OpenAPI();

    // 设置文档基本信息
    openAPI.info(properties.getInfo());

    // 设置外部文档
    openAPI.externalDocs(properties.getExternalDocs());

    // 设置标签
    openAPI.tags(properties.getTags());

    // 设置组件（安全方案等）
    openAPI.components(properties.getComponents());

    // 设置全局安全要求
    Set<String> keySet = properties.getComponents()
        .getSecuritySchemes().keySet();
    List<SecurityRequirement> list = keySet.stream()
        .map(key -> new SecurityRequirement().addList(key))
        .toList();
    openAPI.security(list);

    return openAPI;
}
```

### OpenAPIService 自定义处理器

使用 `OpenApiHandler` 替换默认的 `OpenAPIService`，实现智能标签生成：

```java
@Bean
@Primary
public OpenAPIService openApiBuilder(
    Optional<OpenAPI> openAPI,
    SecurityService securityParser,
    SpringDocConfigProperties springDocConfigProperties,
    PropertyResolverUtils propertyResolverUtils,
    Optional<List<OpenApiBuilderCustomizer>> openApiBuilderCustomizers,
    Optional<List<ServerBaseUrlCustomizer>> serverBaseUrlCustomizers,
    Optional<JavadocProvider> javadocProvider) {

    return new OpenApiHandler(
        openAPI,
        securityParser,
        springDocConfigProperties,
        propertyResolverUtils,
        openApiBuilderCustomizers,
        serverBaseUrlCustomizers,
        javadocProvider
    );
}
```

### OpenApiCustomizer 路径定制器

处理上下文路径前缀，确保 API 路径正确：

```java
@Bean
public OpenApiCustomizer openApiCustomizer(
    @Value("${server.servlet.context-path:}") String contextPath) {

    return openApi -> {
        // 如果没有上下文路径，直接返回
        if (StrUtil.isBlank(contextPath)) {
            return;
        }

        Paths oldPaths = openApi.getPaths();
        // 使用 PlusPaths 标记已处理
        if (oldPaths instanceof PlusPaths) {
            return;
        }

        // 为所有路径添加上下文前缀
        PlusPaths newPaths = new PlusPaths();
        oldPaths.forEach((path, pathItem) -> {
            newPaths.addPathItem(contextPath + path, pathItem);
        });

        openApi.setPaths(newPaths);
    };
}
```

### PlusPaths 防重复处理

`PlusPaths` 继承 `Paths`，用于标记路径已处理，避免重复添加上下文前缀：

```java
/**
 * 自定义 Paths 类
 * 用于标记 OpenAPI 路径已被处理，防止重复添加上下文路径前缀
 */
public static class PlusPaths extends Paths {
    // 继承 Paths，作为标记类使用
}
```

**处理流程：**

```text
原始路径: /user/list
    │
    ▼
检查是否为 PlusPaths
    │
    ├─ 是 ─→ 跳过处理（已添加前缀）
    │
    └─ 否 ─→ 添加上下文前缀
               │
               ▼
         /api/user/list
               │
               ▼
         转换为 PlusPaths（标记已处理）
```

## OpenApiHandler 增强处理器

### 智能标签生成原理

`OpenApiHandler` 继承 `OpenAPIService`，核心增强功能是使用 Javadoc 注释的首行作为 API 标签名称：

```java
@Slf4j
public class OpenApiHandler extends OpenAPIService {

    @Override
    public Operation buildTags(
        HandlerMethod handlerMethod,
        Operation operation,
        OpenAPI openAPI,
        Locale locale) {

        // 获取控制器类的 Javadoc 描述
        String description = javadocProvider.getClassJavadoc(
            handlerMethod.getBeanType()
        );

        // 如果没有 Javadoc，使用默认处理
        if (StrUtil.isBlank(description)) {
            return super.buildTags(handlerMethod, operation, openAPI, locale);
        }

        // 解析 Javadoc，提取首行作为标签名称
        List<String> lines = IoUtil.readLines(
            new StringReader(description),
            new ArrayList<>()
        );

        // 创建标签
        Tag tag = new Tag();
        tag.setName(lines.get(0));           // 首行作为名称
        tag.setDescription(description);      // 完整描述

        // 处理属性占位符
        tag = resolveProperties(tag);

        // 标签去重
        if (!isDuplicateTag(openAPI, tag)) {
            openAPI.addTagsItem(tag);
        }

        // 关联操作到标签
        operation.addTagsItem(tag.getName());

        return operation;
    }
}
```

### Javadoc 注释规范

为了充分利用智能标签生成功能，控制器类的 Javadoc 需遵循以下规范：

```java
/**
 * 用户管理
 *
 * 提供用户的增删改查等基础功能，包括用户注册、登录、
 * 个人信息管理等相关接口。
 *
 * @author 开发者姓名
 */
@RestController
@RequestMapping("/user")
public class UserController {
    // ...
}
```

**解析结果：**

| 元素 | 值 |
|------|------|
| 标签名称 | 用户管理 |
| 标签描述 | 用户管理\n\n提供用户的增删改查等基础功能... |

### 标签去重机制

避免重复添加相同名称的标签：

```java
private boolean isDuplicateTag(OpenAPI openAPI, Tag newTag) {
    if (openAPI.getTags() == null) {
        return false;
    }

    return openAPI.getTags().stream()
        .anyMatch(tag -> tag.getName().equals(newTag.getName()));
}
```

### 属性占位符解析

支持在标签名称和描述中使用 Spring 属性占位符：

```java
/**
 * ${app.name} 用户管理
 *
 * ${app.description}
 */
@RestController
public class UserController {
    // ...
}
```

**配置文件：**

```yaml
app:
  name: RuoYi-Plus
  description: 企业级后台管理系统
```

**解析结果：**

- 标签名称：RuoYi-Plus 用户管理
- 标签描述：企业级后台管理系统

## 配置属性详解

### SpringDocProperties 配置类

`SpringDocProperties` 用于绑定 `application.yml` 中以 `springdoc` 为前缀的配置项：

```java
@Data
@ConfigurationProperties(prefix = "springdoc")
public class SpringDocProperties {

    /**
     * 文档基本信息
     */
    private InfoProperties info = new InfoProperties();

    /**
     * 外部文档链接
     */
    private ExternalDocumentation externalDocs;

    /**
     * 预定义标签列表
     */
    private List<Tag> tags = null;

    /**
     * 预定义路径
     */
    private Paths paths = null;

    /**
     * 组件配置（安全方案等）
     */
    private Components components = null;
}
```

### InfoProperties 文档信息

```java
@Data
public class InfoProperties {

    /**
     * 文档标题
     */
    private String title = null;

    /**
     * 文档描述（支持 Markdown）
     */
    private String description = null;

    /**
     * 服务条款 URL
     */
    private String termsOfService = null;

    /**
     * 联系人信息
     */
    private Contact contact = null;

    /**
     * 许可证信息
     */
    private License license = null;

    /**
     * API 版本号
     */
    private String version = null;
}
```

### 完整配置示例

```yaml
springdoc:
  # API 文档开关
  api-docs:
    enabled: true
    path: /v3/api-docs

  # 文档基本信息
  info:
    title: '${app.title}_接口文档'
    description: |
      ## RuoYi-Plus 接口文档

      本项目提供了完整的企业级后台管理系统 API，包含以下模块：

      - **business**: 核心业务模块
      - **system**: 系统管理模块
      - **generator**: 代码生成模块

      ### 认证方式

      所有接口需要在 Header 中携带 `Authorization` Token
    version: '版本号: ${app.version}'
    terms-of-service: https://ruoyi.plus/terms
    contact:
      name: 抓蛙师
      email: 770492966@qq.com
      url: https://space.bilibili.com/520725002
    license:
      name: MIT License
      url: https://opensource.org/licenses/MIT

  # 外部文档
  external-docs:
    description: 项目官方文档
    url: https://ruoyi.plus/docs

  # 组件配置
  components:
    # 安全认证方案
    security-schemes:
      apiKey:
        type: APIKEY
        in: HEADER
        name: ${sa-token.token-name}
      bearerAuth:
        type: HTTP
        scheme: bearer
        bearerFormat: JWT

  # 分组配置
  group-configs:
    - group: business
      display-name: 业务模块
      packages-to-scan: plus.ruoyi.business
    - group: system
      display-name: 系统管理
      packages-to-scan: plus.ruoyi.system
    - group: generator
      display-name: 代码生成
      packages-to-scan: plus.ruoyi.generator

  # 路径过滤
  paths-to-match:
    - /api/**
    - /admin/**
  paths-to-exclude:
    - /api/internal/**
    - /actuator/**

  # 包过滤
  packages-to-exclude:
    - plus.ruoyi.common.web
```

### 配置属性速查表

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `api-docs.enabled` | `boolean` | `true` | 是否启用 API 文档 |
| `api-docs.path` | `String` | `/v3/api-docs` | 文档访问路径 |
| `info.title` | `String` | - | 文档标题 |
| `info.description` | `String` | - | 文档描述（支持 Markdown） |
| `info.version` | `String` | - | API 版本号 |
| `info.contact.name` | `String` | - | 联系人姓名 |
| `info.contact.email` | `String` | - | 联系人邮箱 |
| `info.contact.url` | `String` | - | 联系人网站 |
| `info.license.name` | `String` | - | 许可证名称 |
| `info.license.url` | `String` | - | 许可证 URL |
| `group-configs[].group` | `String` | - | 分组标识 |
| `group-configs[].display-name` | `String` | - | 分组显示名称 |
| `group-configs[].packages-to-scan` | `String` | - | 扫描包路径 |
| `paths-to-match` | `List<String>` | - | 匹配的路径模式 |
| `paths-to-exclude` | `List<String>` | - | 排除的路径模式 |
| `packages-to-exclude` | `List<String>` | - | 排除的包路径 |

## API 文档访问

### 访问地址

| 类型 | 地址 | 说明 |
|------|------|------|
| 完整文档 | `http://localhost:5500/v3/api-docs` | 包含所有模块的 API |
| 业务模块 | `http://localhost:5500/v3/api-docs/business` | 业务相关接口 |
| 系统模块 | `http://localhost:5500/v3/api-docs/system` | 系统管理接口 |
| 代码生成 | `http://localhost:5500/v3/api-docs/generator` | 代码生成接口 |

### 响应格式

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "RuoYi-Plus_接口文档",
    "description": "接口文档包括business、system、generator等模块",
    "contact": {
      "name": "抓蛙师",
      "url": "https://space.bilibili.com/520725002",
      "email": "770492966@qq.com"
    },
    "version": "版本号: 1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:5500",
      "description": "Generated server url"
    }
  ],
  "security": [
    {
      "apiKey": []
    }
  ],
  "tags": [
    {
      "name": "用户管理",
      "description": "用户管理\n\n提供用户的增删改查等基础功能"
    }
  ],
  "paths": {
    "/api/user/list": {
      "get": {
        "tags": ["用户管理"],
        "summary": "获取用户列表",
        "operationId": "getUserList",
        "parameters": [...],
        "responses": {...}
      }
    }
  },
  "components": {
    "securitySchemes": {
      "apiKey": {
        "type": "apiKey",
        "name": "Authorization",
        "in": "header"
      }
    }
  }
}
```

## 与 Apifox 集成

### 什么是 Apifox

Apifox 是一款集 API 文档、API 管理、API 测试于一身的多功能工具，支持导入 OpenAPI/Swagger 格式数据，提供 Mock 功能、接口测试、团队协作等全方位的 API 开发支持。

### 导入方式

#### 方法一：URL 方式导入（推荐）

1. 打开 Apifox，进入目标项目
2. 依次选择【项目设置 → 导入数据 → OpenAPI/Swagger】
3. 选择"URL 方式"导入
4. 输入相应的 API 文档地址：

```bash
# 导入所有模块
http://localhost:5500/v3/api-docs

# 或者分模块导入
http://localhost:5500/v3/api-docs/business
http://localhost:5500/v3/api-docs/system
http://localhost:5500/v3/api-docs/generator
```

#### 方法二：文件导入

1. 访问 API 文档地址，将 JSON 内容保存为文件
2. 在 Apifox 中选择"文件导入"
3. 上传保存的 JSON 文件

### 定时同步配置

为了保持 API 文档与代码同步，建议设置定时同步功能：

1. 在 Apifox 中进入【项目设置 → 导入数据 → 定时导入】
2. 添加新任务，输入数据源 URL
3. 设置同步频率（建议每隔 2-4 小时）
4. 选择"智能合并"模式

### 智能合并功能

当使用"智能合并"功能时，Apifox 会保留以下内容：

- 中文名称
- Mock 规则
- 参数说明
- 接口返回示例
- 自定义的接口描述

## 开发最佳实践

### 1. 控制器注释规范

为了充分利用增强的标签生成功能，建议按以下规范编写控制器类：

```java
/**
 * 用户管理
 *
 * 提供用户的增删改查等基础功能，包括用户注册、登录、
 * 个人信息管理等相关接口。
 *
 * @author 开发者姓名
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    /**
     * 获取用户列表
     */
    @Operation(
        summary = "获取用户列表",
        description = "分页获取系统中的用户信息，支持多条件筛选"
    )
    @GetMapping("/list")
    public R<TableDataInfo<UserVo>> list(
        @ParameterObject UserQuery query,
        @ParameterObject PageQuery pageQuery) {
        // 实现逻辑
    }

    /**
     * 获取用户详情
     */
    @Operation(summary = "获取用户详情")
    @Parameter(name = "userId", description = "用户ID", required = true)
    @GetMapping("/{userId}")
    public R<UserVo> getInfo(@PathVariable Long userId) {
        // 实现逻辑
    }
}
```

### 2. 接口安全认证

配置了 ApiKey 认证方式，在需要认证的接口上添加：

```java
@Operation(summary = "获取用户信息")
@SecurityRequirement(name = "apiKey")
@GetMapping("/profile")
public R<UserVo> getUserProfile() {
    // 实现逻辑
}
```

如果整个控制器都需要认证，可以在类级别添加：

```java
@RestController
@RequestMapping("/api/user")
@SecurityRequirement(name = "apiKey")
public class UserController {
    // 所有方法都需要认证
}
```

### 3. 分组模块开发

项目采用分组配置，不同模块的控制器应放在对应的包下：

| 分组 | 包路径 | 说明 |
|------|--------|------|
| business | `plus.ruoyi.business` | 业务模块 |
| system | `plus.ruoyi.system` | 系统管理 |
| generator | `plus.ruoyi.generator` | 代码生成 |

### 4. 参数文档优化

使用 SpringDoc 注解提供更详细的参数说明：

```java
@Operation(
    summary = "创建用户",
    description = "创建一个新的用户账户，支持设置角色和部门"
)
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "创建成功"),
    @ApiResponse(responseCode = "400", description = "参数错误"),
    @ApiResponse(responseCode = "409", description = "用户名已存在")
})
@PostMapping
public R<Void> add(
    @Parameter(description = "用户创建请求", required = true)
    @RequestBody @Valid UserAddBo bo) {
    // 实现逻辑
}
```

### 5. 枚举类型文档化

为枚举类型添加说明：

```java
@Schema(description = "用户状态")
public enum UserStatus {

    @Schema(description = "正常")
    NORMAL("0"),

    @Schema(description = "停用")
    DISABLED("1");

    private final String code;
}
```

### 6. 复杂对象文档化

为请求/响应对象添加详细说明：

```java
@Data
@Schema(description = "用户创建请求")
public class UserAddBo {

    @Schema(description = "用户名", example = "admin", requiredMode = REQUIRED)
    @NotBlank(message = "用户名不能为空")
    private String username;

    @Schema(description = "密码", example = "123456", requiredMode = REQUIRED)
    @NotBlank(message = "密码不能为空")
    private String password;

    @Schema(description = "手机号", example = "13800138000")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @Schema(description = "邮箱", example = "admin@example.com")
    @Email(message = "邮箱格式不正确")
    private String email;

    @Schema(description = "角色ID列表")
    private List<Long> roleIds;
}
```

## 高级配置

### 1. 环境相关配置

```yaml
# 开发环境
spring:
  profiles:
    active: dev

springdoc:
  api-docs:
    enabled: true  # 开发环境启用

---
# 生产环境
spring:
  profiles: prod

springdoc:
  api-docs:
    enabled: false  # 生产环境关闭
```

### 2. 自定义路径匹配

```yaml
springdoc:
  # 包含的路径
  paths-to-match:
    - /api/**
    - /admin/**
    - /open/**

  # 排除的路径
  paths-to-exclude:
    - /api/internal/**
    - /actuator/**
    - /error/**

  # 排除的包
  packages-to-exclude:
    - plus.ruoyi.common.web
    - plus.ruoyi.framework.config
```

### 3. 多服务器配置

```yaml
springdoc:
  # 服务器列表
  servers:
    - url: http://localhost:5500
      description: 开发环境
    - url: https://api.example.com
      description: 生产环境
    - url: https://test-api.example.com
      description: 测试环境
```

### 4. 自定义安全方案

```yaml
springdoc:
  components:
    security-schemes:
      # ApiKey 方式
      apiKey:
        type: APIKEY
        in: HEADER
        name: Authorization

      # Bearer Token 方式
      bearerAuth:
        type: HTTP
        scheme: bearer
        bearerFormat: JWT

      # OAuth2 方式
      oauth2:
        type: OAUTH2
        flows:
          authorizationCode:
            authorizationUrl: https://example.com/oauth/authorize
            tokenUrl: https://example.com/oauth/token
            scopes:
              read: 读取权限
              write: 写入权限
```

## 常见问题解决

### 1. 文档无法访问

**问题：** 访问 API 文档地址返回 404

**解决方案：**

1. 检查 `springdoc.api-docs.enabled` 是否为 `true`
2. 确认应用已正常启动
3. 检查端口号和上下文路径配置
4. 查看日志确认 SpringDoc 是否正常加载

```bash
# 检查配置
curl http://localhost:5500/v3/api-docs
```

### 2. Apifox 导入失败

**问题：** Apifox 提示解析错误

**解决方案：**

1. 访问 API 文档地址，检查 JSON 格式是否正确
2. 将 JSON 内容上传到 https://editor.swagger.io/ 验证 OpenAPI 规范
3. 检查 SpringDoc 配置是否有语法错误
4. 确保控制器类上的注解正确

### 3. 分组模块显示异常

**问题：** 某些模块的接口没有出现在对应分组中

**解决方案：**

1. 检查 Controller 类的包路径是否匹配 `group-configs` 配置
2. 确认 Controller 类上有 `@RestController` 或 `@Controller` 注解
3. 检查方法上是否有正确的 HTTP 映射注解

```java
// 确保包路径正确
package plus.ruoyi.business.controller;

@RestController  // 必须有此注解
@RequestMapping("/api/demo")
public class DemoController {

    @GetMapping("/test")  // 必须有 HTTP 映射注解
    public R<String> test() {
        return R.ok("test");
    }
}
```

### 4. 标签名称显示为类名

**问题：** API 标签显示为类名而非 Javadoc 首行

**解决方案：**

1. 确保控制器类有 Javadoc 注释
2. 检查 Javadoc 格式是否正确
3. 确认 `OpenApiHandler` 被正确加载

```java
/**
 * 用户管理    <-- 这一行将作为标签名称
 *
 * 详细描述...
 */
@RestController
public class UserController {
    // ...
}
```

### 5. 安全认证不生效

**问题：** 接口认证信息没有正确显示

**解决方案：**

1. 确认 `sa-token.token-name` 配置正确
2. 检查 Controller 方法上是否添加了 `@SecurityRequirement` 注解
3. 验证 `security-schemes` 配置格式

```yaml
sa-token:
  token-name: Authorization  # 确保配置正确

springdoc:
  components:
    security-schemes:
      apiKey:
        type: APIKEY
        in: HEADER
        name: ${sa-token.token-name}  # 引用 token-name
```

### 6. 上下文路径重复

**问题：** API 路径出现重复的上下文前缀

**解决方案：**

这通常是由于 OpenApiCustomizer 多次执行导致的。框架已通过 `PlusPaths` 类解决此问题：

```java
// 检查是否已处理
if (oldPaths instanceof PlusPaths) {
    return;  // 已处理，直接返回
}
```

如果仍然出现问题，检查是否有其他自定义的 OpenApiCustomizer 也在处理路径。

## 性能和安全考虑

### 1. 生产环境配置

```yaml
# 生产环境建议配置
springdoc:
  api-docs:
    enabled: false  # 关闭文档生成
```

### 2. 条件性开启

如果需要在生产环境提供文档，建议：

1. 配置访问白名单
2. 添加基础认证
3. 使用 HTTPS 协议
4. 定期更新访问凭据

```java
@Configuration
@ConditionalOnProperty(name = "springdoc.api-docs.enabled", havingValue = "true")
public class DocSecurityConfig {

    @Bean
    public SecurityFilterChain docSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/v3/api-docs/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/v3/api-docs/**").hasRole("ADMIN")
            )
            .httpBasic(Customizer.withDefaults())
            .build();
    }
}
```

### 3. 性能优化

1. 合理设置分组，避免单个文档过大
2. 生产环境关闭文档生成
3. 使用缓存减少文档生成开销

```yaml
springdoc:
  cache:
    disabled: false  # 启用缓存
```

## 总结

SpringDoc 接口文档模块提供了企业级的 API 文档解决方案：

**技术优势：**

- **自动化程度高** - 基于注释和注解自动生成文档
- **模块化支持** - 支持多模块项目的分组管理
- **智能标签** - 利用 Javadoc 注释生成有意义的标签名称
- **标准兼容** - 完全符合 OpenAPI 3.0 规范

**协作优势：**

- **团队协作** - Apifox 提供了完整的团队协作功能
- **智能合并** - 保护团队在 Apifox 中的自定义内容
- **自动同步** - 定时同步机制确保文档实时更新
- **多功能集成** - 文档、测试、Mock 一体化

**维护优势：**

- **维护成本低** - 文档与代码同步更新
- **版本控制** - 支持 API 版本变更追踪
- **质量保证** - 自动化测试保证接口质量

通过合理配置和规范使用，这套方案可以极大提升 API 文档的质量和开发效率，为团队协作提供强有力的支持。
