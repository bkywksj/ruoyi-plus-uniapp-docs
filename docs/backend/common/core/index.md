# 核心模块 (common-core) 概览

## 模块简介

`ruoyi-common-core` 是ruoyi-plus-uniapp框架的核心基础模块，为整个系统提供通用的基础功能和工具支持。该模块采用无业务逻辑的设计理念，专注于提供可复用的技术组件和工具类，是所有其他模块的基础依赖。

## 核心特性

### 🎯 统一响应体系
- 提供标准化的 API 响应格式 (`R<T>`)
- 支持国际化消息处理
- 统一的状态码管理

### 🛡️ 安全防护机制
- XSS 攻击防护 (`@Xss` 注解)
- SQL 注入防护工具
- 参数校验与数据验证

### 🔧 丰富的工具类库
- 字符串处理增强 (`StringUtils`)
- 日期时间工具 (`DateUtils`)
- 反射操作工具 (`ReflectUtils`)
- 网络地址工具 (`NetUtils`)
- 文件操作工具 (`FileUtils`)

### 📊 数据模型支持
- 登录认证模型系列
- 数据传输对象 (DTO) 规范
- 树形结构构建工具

### 🌐 国际化支持
- 多语言消息管理
- 自定义消息插值器
- 校验错误信息国际化

### ⚡ 高性能配置
- 虚拟线程支持
- 异步任务配置
- 线程池优化管理

## 模块架构

```text
ruoyi-common-core/
├── config/                 # 配置管理
│   ├── AsyncConfig         # 异步任务配置
│   ├── ThreadPoolConfig    # 线程池配置
│   ├── ValidatorConfig     # 校验器配置
│   └── properties/         # 配置属性类
├── constant/               # 系统常量
│   ├── CacheConstants     # 缓存常量
│   ├── Constants          # 通用常量
│   ├── HttpStatus         # HTTP状态码
│   └── I18nKeys           # 国际化键常量
├── domain/                 # 数据模型
│   ├── dto/               # 数据传输对象
│   ├── model/             # 业务模型
│   └── vo/                # 视图对象
├── enums/                  # 枚举定义
│   ├── AuthType           # 认证类型
│   ├── UserType           # 用户类型
│   └── DateTimeFormat     # 日期格式
├── exception/              # 异常体系
│   ├── base/              # 基础异常类
│   ├── user/              # 用户异常
│   └── file/              # 文件异常
├── service/                # 通用服务接口
│   ├── UserService        # 用户服务
│   ├── DictService        # 字典服务
│   └── ConfigService      # 配置服务
├── utils/                  # 工具类库
│   ├── StringUtils        # 字符串工具
│   ├── DateUtils          # 日期工具
│   ├── ReflectUtils       # 反射工具
│   └── ip/                # IP地址工具
├── validate/               # 校验框架
│   ├── AddGroup           # 新增校验组
│   ├── EditGroup          # 编辑校验组
│   └── dicts/             # 字典校验
└── xss/                    # XSS防护
    ├── Xss                # XSS注解
    └── XssValidator       # XSS校验器
```

## 核心组件

### 1. 响应体系 (Response System)

#### 统一响应类 `R<T>`

```java
// 成功响应
R<User> result = R.ok(user);

// 失败响应
R<Void> result = R.fail("操作失败");

// 支持国际化
R<Void> result = R.fail("user.not.found", userId);
```

特性：
- 泛型支持，类型安全
- 自动国际化消息处理
- 链式操作支持
- 统一状态码管理

### 2. 安全防护 (Security Protection)

#### XSS 攻击防护

```java
public class UserBo {
    @Xss(mode = Xss.Mode.STRICT, message = "用户名包含危险字符")
    private String userName;
    
    @Xss(mode = Xss.Mode.LENIENT)
    private String content;
}
```

支持三种检测模式：
- **BASIC**: 检测常见HTML标签和脚本
- **STRICT**: 检测更多攻击向量
- **LENIENT**: 仅检测明显脚本标签

### 3. 校验框架 (Validation Framework)

#### 字典值校验

```java
public class UserBo {
    @DictPattern(dictType = "sys_user_sex", message = "性别值无效")
    private String gender;
    
    @DictPattern(dictType = "sys_user_status", separator = ";")
    private String statusList;
}
```

#### 枚举值校验

```java
public class OrderBo {
    @EnumPattern(type = OrderStatusEnum.class, fieldName = "code")
    private String status;
}
```

#### 校验分组

```java
// 新增时校验
@Validated(AddGroup.class)
public R<Long> add(@RequestBody UserBo bo) {
    return R.ok(userService.add(bo));
}

// 编辑时校验
@Validated(EditGroup.class) 
public R<Void> update(@RequestBody UserBo bo) {
    return R.status(userService.update(bo));
}
```

### 4. 字典枚举系统 (Dictionary & Enum System)

#### 字典枚举设计模式

```java
@Getter
@AllArgsConstructor
public enum DictUserGender {
    FEMALE("0", "女"),
    MALE("1", "男"),
    UNKNOWN("2", "未知");
    
    public static final String DICT_TYPE = "sys_user_gender";
    
    private final String value;
    private final String label;
    
    public static DictUserGender getByValue(String value) {
        // 实现逻辑
    }
}
```

内置字典枚举：
- **用户相关**：性别、状态、类型
- **系统相关**：启用状态、显示设置、操作结果
- **业务相关**：支付方式、订单状态、审核状态
- **平台相关**：消息类型、通知类型、文件类型

### 5. 工具类库 (Utility Library)

#### 增强的字符串工具

```java
// 多级属性转换
String result = StringUtils.convertWithMapping("1,2", statusMap);

// 分割转换
List<Integer> ids = StringUtils.splitToList("1,2,3", Integer::valueOf);

// 路径匹配
boolean match = StringUtils.isMatch("/api/*", "/api/user");
```

#### 日期时间工具

```java
// 格式化
String date = DateUtils.formatDate(new Date());

// 时间差计算
long days = DateUtils.difference(start, end, TimeUnit.DAYS);

// 类型转换
Date date = DateUtils.toDate(LocalDateTime.now());
```

#### 反射工具增强

```java
// 多级属性访问
String name = ReflectUtils.invokeGetter(user, "profile.name");
ReflectUtils.invokeSetter(user, "profile.name", "张三");

// 安全访问
String name = ReflectUtils.getPropertySafely(user, "profile.name");
```

### 6. 异步与线程 (Async & Threading)

#### 自动线程模式切换

```java
@Configuration
public class AsyncConfig implements AsyncConfigurer {
    @Override
    public Executor getAsyncExecutor() {
        // 自动检测虚拟线程支持
        if (SpringUtils.isVirtual()) {
            return new VirtualThreadTaskExecutor("async-");
        }
        return SpringUtils.getBean("scheduledExecutorService");
    }
}
```

#### 优雅关闭支持

```java
// 安全关闭线程池
ThreadUtils.shutdownGracefully(executorService);

// 异常日志记录
ThreadUtils.logException(runnable, throwable);
```

### 7. 网络与IP处理 (Network & IP)

#### IP地址识别与定位

```java
// IPv4/IPv6识别
boolean isV4 = NetUtils.isIpv4("192.168.1.1");
boolean isV6 = NetUtils.isIpv6("2001:db8::1");

// 内网判断
boolean isInner = NetUtils.isInnerIP("192.168.1.1");
boolean isInnerV6 = NetUtils.isInnerIpv6("fe80::1");

// 地址解析
String location = AddressUtils.getRealAddressByIp("8.8.8.8");
```

## 依赖管理

### 主要依赖
- **Spring Framework**: 核心容器和Web支持
- **Spring Boot**: 自动配置和起步依赖
- **Apache Commons Lang3**: 通用工具类
- **HuTool**: 国产工具类库
- **ip2region**: IP地址定位
- **MapStruct Plus**: 对象映射

### 可选依赖
- **Lombok**: 代码简化 (编译时)
- **Jakarta Servlet**: Web容器支持
- **Spring Validation**: 参数校验

## 设计原则

### 1. 零业务耦合
- 不包含任何业务逻辑
- 纯技术组件设计
- 高度可复用

### 2. 面向接口编程
- 定义通用服务接口
- 支持多种实现方式
- 便于扩展和测试

### 3. 国际化优先
- 所有消息支持国际化
- 自动消息插值处理
- 多语言环境适配

### 4. 安全第一
- 内置安全防护机制
- XSS/SQL注入防护
- 输入参数严格校验

### 5. 性能优化
- 支持虚拟线程
- 缓存机制优化
- 资源优雅释放

## 使用示例

### 快速开始

#### 1. 添加依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-core</artifactId>
    <version>${ruoyi.version}</version>
</dependency>
```

#### 2. 创建响应接口

```java
@RestController
public class UserController {
    
    @PostMapping("/users")
    public R<Long> createUser(@Validated(AddGroup.class) @RequestBody UserBo bo) {
        Long userId = userService.createUser(bo);
        return R.ok(userId);
    }
    
    @GetMapping("/users/{id}")
    public R<UserVo> getUser(@PathVariable Long id) {
        UserVo user = userService.getUser(id);
        return R.ok(user);
    }
}
```

#### 3. 使用工具类

```java
@Service
public class UserService {
    
    public void processUsers(List<User> users) {
        // 使用Stream工具
        Map<Long, User> userMap = StreamUtils.toIdentityMap(users, User::getId);
        
        // 使用字符串工具
        String userNames = StreamUtils.join(users, User::getName, ",");
        
        // 使用日期工具
        String createTime = DateUtils.formatDateTime(new Date());
    }
}
```

## 最佳实践

### 1. 异常处理

```java
// 使用统一异常
throw ServiceException.of("用户不存在");

// 支持国际化
throw UserException.of("user.not.found", userId);
```

### 2. 参数校验

```java
// 组合使用多种校验
public class UserBo {
    @NotBlank(groups = {AddGroup.class, EditGroup.class})
    @Xss(message = "用户名包含危险字符")
    private String userName;
    
    @DictPattern(dictType = "sys_user_sex")
    private String gender;
}
```

### 3. 响应规范

```java
// 成功响应
return R.ok(data);

// 失败响应  
return R.fail("操作失败");

// 条件响应
return R.status(result > 0);
```

### 4. 国际化消息

```java
// 直接使用国际化键
return R.fail("user.password.invalid");

// 带参数的国际化
return R.fail("user.login.locked", lockTime);
```

## 注意事项

- **线程安全**: 所有工具类都是线程安全的
- **性能考虑**: 大量数据处理时注意内存使用
- **异常处理**: 优先使用框架提供的异常类型
- **编码规范**: 遵循阿里巴巴Java开发手册
- **版本兼容**: 保持向后兼容性
