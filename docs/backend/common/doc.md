# SpringDoc + Apifox 接口文档配置说明

## 概述

本模块基于SpringDoc实现了自动化的API接口文档生成功能，支持OpenAPI
3.0规范。通过自定义配置和增强处理，提供了更加灵活和强大的文档生成能力，并配合Apifox进行接口管理、测试和协作。

## 核心组件

### 1. SpringDocProperties (配置属性类)

**文件位置**: `plus.ruoyi.common.doc.config.properties.SpringDocProperties`

**功能描述**: 用于绑定application.yml中以`springdoc`为前缀的配置项，提供类型安全的配置管理。

#### 模块配置结构

```yaml
springdoc:
  api-docs:
    # 是否开启接口文档
    enabled: true
  info:
    # 标题
    title: '${app.title}_接口文档'
    # 描述
    description: '接口文档包括business(主业务)、system(系统)、generator(代码生成)等模块'
    # 版本
    version: '版本号: ${app.version}'
    # 作者信息
    contact:
      name: 抓蛙师
      email: 770492966@qq.com
      url: https://space.bilibili.com/520725002
  components:
    # 鉴权方式配置
    security-schemes:
      apiKey:
        type: APIKEY
        in: HEADER
        name: ${sa-token.token-name}
  # 分组配置，定义多个模块
  group-configs:
    - group: business
      packages-to-scan: plus.ruoyi.business
    - group: system
      packages-to-scan: plus.ruoyi.system
    - group: generator
      packages-to-scan: plus.ruoyi.generator
```

#### 主要属性说明

| 属性                            | 类型                  | 说明                 |
|-------------------------------|---------------------|--------------------|
| `api-docs.enabled`            | `boolean`           | 是否启用API文档生成        |
| `info`                        | `InfoProperties`    | 文档基本信息配置           |
| `components.security-schemes` | `SecuritySchemes`   | 安全认证方案配置（ApiKey方式） |
| `group-configs`               | `List<GroupConfig>` | 模块分组配置，支持多模块项目     |

### 2. SpringDocConfig (自动配置类)

**文件位置**: `plus.ruoyi.common.doc.config.SpringDocConfig`

**功能描述**: SpringDoc接口文档的自动配置类，负责配置OpenAPI文档生成相关的Bean。

#### 核心功能

1. **OpenAPI配置创建**: 整合自定义配置属性，生成完整的API文档配置
2. **安全认证配置**: 自动配置全局ApiKey认证要求
3. **上下文路径处理**: 为所有API路径添加应用上下文路径前缀
4. **自定义处理器注册**: 使用增强的OpenApiHandler替换默认实现

### 3. OpenApiHandler (增强处理器)

**文件位置**: `plus.ruoyi.common.doc.handler.OpenApiHandler`

**功能描述**: 继承并增强SpringDoc的OpenAPIService功能，主要改进标签生成逻辑。

#### 核心增强

1. **智能标签生成**: 使用Java注释的首行作为Tag名称
2. **Javadoc集成**: 自动提取类和方法的Javadoc注释作为文档描述
3. **标签去重**: 避免重复添加相同名称的标签
4. **属性占位符解析**: 支持标签名称和描述中的属性占位符

## API文档访问方式

### OpenAPI JSON格式访问

基于当前配置，API文档的访问地址如下：

1. **主接口文档**: `http://localhost:5500/v3/api-docs`
2. **分模块接口文档**:
    - 业务模块: `http://localhost:5500/v3/api-docs/business`
    - 系统模块: `http://localhost:5500/v3/api-docs/system`
    - 代码生成模块: `http://localhost:5500/v3/api-docs/generator`

**注意**:

- 端口号为配置的5500
- 上下文路径为根路径 "/"
- 不提供Swagger UI界面，专门配合Apifox使用

## Apifox集成使用指南

### 1. 什么是Apifox

Apifox是一款集API文档、API管理、API测试于一身的超级多功能API工具，支持导入OpenAPI/Swagger格式数据，提供Mock功能、接口测试、团队协作等全方位的API开发支持。

### 2. 导入SpringDoc生成的API文档到Apifox

#### 方法一：URL方式导入（推荐）

1. 打开Apifox，进入目标项目
2. 依次选择【项目设置 → 导入数据 → OpenAPI/Swagger】
3. 选择"URL方式"导入
4. 输入相应的API文档地址：
   ```
   # 导入所有模块
   http://localhost:5500/v3/api-docs
   
   # 或者分模块导入
   http://localhost:5500/v3/api-docs/business
   http://localhost:5500/v3/api-docs/system
   http://localhost:5500/v3/api-docs/generator
   ```

#### 方法二：文件导入

1. 访问API文档地址，将JSON内容保存为文件
2. 在Apifox中选择"文件导入"
3. 上传保存的JSON文件

### 3. 设置定时同步（推荐）

为了保持API文档与代码同步，建议设置定时同步功能：

1. 在Apifox中进入【项目设置 → 导入数据 → 定时导入】
2. 添加新任务，输入数据源URL
3. 设置同步频率（建议每隔2-4小时）
4. 选择"智能合并"模式，保留在Apifox中的自定义内容

### 4. 智能合并功能

当使用"智能合并"功能时，Apifox会保留以下内容：

- 中文名称
- Mock规则
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
@RequestMapping("/user")
public class UserController {

    /**
     * 获取用户列表
     */
    @Operation(summary = "获取用户列表", description = "分页获取系统中的用户信息")
    @GetMapping("/list")
    public Result<PageResult<User>> getUserList(@ParameterObject PageQuery pageQuery) {
        // 实现逻辑
    }
}
```

**注释规范说明**：

- **第一行**：作为API标签名称显示在Apifox中
- **详细描述**：作为标签的详细说明
- 支持多行描述和Markdown格式

### 2. 接口安全认证

配置了ApiKey认证方式，在需要认证的接口上添加：

```java

@Operation(summary = "获取用户信息")
@SecurityRequirement(name = "apiKey")
@GetMapping("/profile")
public Result<User> getUserProfile() {
    // 实现逻辑
}
```

### 3. 分组模块开发

项目采用分组配置，不同模块的控制器应放在对应的包下：

```
plus.ruoyi.business   -> business模块
plus.ruoyi.system     -> system模块  
plus.ruoyi.generator  -> generator模块
```

### 4. 参数文档优化

使用SpringDoc注解提供更详细的参数说明：

```java

@Operation(summary = "创建用户", description = "创建一个新的用户账户")
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "参数错误")
})
@PostMapping("/create")
public Result<User> createUser(
        @Parameter(description = "用户创建请求", required = true)
        @RequestBody @Valid CreateUserRequest request) {
    // 实现逻辑
}
```

## 团队协作工作流

### 1. 开发阶段

1. **后端开发**: 编写Controller，添加合适的注释和注解
2. **文档生成**: 启动应用，SpringDoc自动生成OpenAPI文档
3. **导入Apifox**: 将生成的文档导入到Apifox项目中

### 2. 文档完善阶段

1. **添加中文描述**: 在Apifox中为接口和参数添加中文名称
2. **配置Mock规则**: 设置合理的Mock数据规则
3. **添加示例**: 提供请求和响应的示例数据

### 3. 测试阶段

1. **接口测试**: 使用Apifox进行接口调试和测试
2. **自动化测试**: 创建测试用例和测试套件
3. **环境管理**: 配置开发、测试、生产等多环境

### 4. 文档维护

1. **定时同步**: 利用Apifox的定时导入功能保持文档同步
2. **智能合并**: 确保自定义内容不被覆盖
3. **版本管理**: 跟踪API变更历史

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

### 2. 自定义过滤配置

```yaml
springdoc:
  paths-to-match:
    - /api/**
    - /admin/**
  paths-to-exclude:
    - /api/internal/**
  packages-to-exclude:
    - plus.ruoyi.common.web
```

### 3. OpenAPI信息定制

```yaml
springdoc:
  info:
    title: '${app.name}_API文档'
    description: |
      ## 项目说明
      本项目提供了完整的企业级后台管理系统API

      ## 模块说明
      - **business**: 核心业务模块
      - **system**: 系统管理模块
      - **generator**: 代码生成模块
    version: 'v${app.version}'
    terms-of-service: https://your-domain.com/terms
    license:
      name: MIT License
      url: https://opensource.org/licenses/MIT
```

## 常见问题解决

### 1. 文档无法访问

**问题**: 访问API文档地址返回404

**解决方案**:

1. 检查 `springdoc.api-docs.enabled` 是否为true
2. 确认应用已正常启动
3. 检查端口号和上下文路径配置

### 2. Apifox导入失败

**问题**: Apifox提示解析错误

**解决方案**:

1. 访问API文档地址，检查JSON格式是否正确
2. 将JSON内容上传到 https://editor.swagger.io/ 验证OpenAPI规范
3. 检查SpringDoc配置是否有语法错误

### 3. 分组模块显示异常

**问题**: 某些模块的接口没有出现在对应分组中

**解决方案**:

1. 检查Controller类的包路径是否匹配group-configs配置
2. 确认Controller类上有 `@RestController` 或 `@Controller` 注解
3. 检查方法上是否有正确的HTTP映射注解

### 4. 认证配置不生效

**问题**: 接口认证信息没有正确显示

**解决方案**:

1. 确认 `sa-token.token-name` 配置正确
2. 检查Controller方法上是否添加了 `@SecurityRequirement` 注解
3. 验证security-schemes配置格式

## 性能和安全考虑

### 1. 生产环境配置

```yaml
# 生产环境建议配置
springdoc:
  api-docs:
    enabled: false  # 关闭文档生成
  swagger-ui:
    enabled: false  # 确保Swagger UI关闭
```

### 2. 网络安全

如果需要在生产环境提供文档：

1. 配置访问白名单
2. 添加基础认证
3. 使用HTTPS协议
4. 定期更新访问凭据

### 3. 性能优化

1. 合理设置分组，避免单个文档过大
2. 生产环境关闭文档生成
3. 使用缓存减少文档生成开销

## 总结

SpringDoc + Apifox方案提供了企业级的API文档解决方案，具有以下优势：

### 技术优势

- **自动化程度高**: 基于注释和注解自动生成文档
- **模块化支持**: 支持多模块项目的分组管理
- **智能标签**: 利用Javadoc注释生成有意义的标签名称
- **标准兼容**: 完全符合OpenAPI 3.0规范

### 协作优势

- **团队协作**: Apifox提供了完整的团队协作功能
- **智能合并**: 保护团队在Apifox中的自定义内容
- **自动同步**: 定时同步机制确保文档实时更新
- **多功能集成**: 文档、测试、Mock一体化

### 维护优势

- **维护成本低**: 文档与代码同步更新
- **版本控制**: 支持API版本变更追踪
- **质量保证**: 自动化测试保证接口质量

通过合理配置和规范使用，这套方案可以极大提升API文档的质量和开发效率，为团队协作提供强有力的支持。
