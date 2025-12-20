# 工具类库 (Utils)

## 概述

ruoyi-common-core 的工具类库提供了丰富的工具方法，覆盖字符串处理、日期时间、反射操作、网络地址、文件处理、数据流处理等多个方面。这些工具类采用静态方法设计，线程安全，高度可复用。

## 目录结构

```text
utils/
├── StringUtils.java           # 字符串增强工具
├── DateUtils.java            # 日期时间工具
├── ObjectUtils.java          # 对象操作工具
├── StreamUtils.java          # Stream流处理工具
├── TreeBuildUtils.java       # 树形结构构建工具
├── ValidatorUtils.java       # 参数校验工具
├── SpringUtils.java          # Spring上下文工具
├── ServletUtils.java         # Servlet请求响应工具
├── ThreadUtils.java          # 线程处理工具
├── MapstructUtils.java       # 对象映射工具
├── MessageUtils.java         # 国际化消息工具
├── file/
│   ├── FileUtils.java        # 文件处理工具
│   └── FileTypeUtils.java    # 文件类型工具
├── ip/
│   ├── AddressUtils.java     # IP地址解析工具
│   └── RegionUtils.java      # IP区域定位工具
├── reflect/
│   └── ReflectUtils.java     # 反射操作工具
├── regex/
│   ├── RegexPatterns.java    # 正则表达式模式
│   ├── RegexPatternPool.java # 正则模式池
│   ├── RegexValidator.java   # 正则校验器
│   └── RegexUtils.java       # 正则工具
└── sql/
    └── SqlUtil.java          # SQL安全工具
```

## 核心工具类

### 1. 字符串工具 (StringUtils)

扩展了 Apache Commons Lang3 的 StringUtils，提供更多实用方法。

#### 基础操作

```java
// 空值处理
String result = StringUtils.blankToDefault("", "默认值");
boolean isEmpty = StringUtils.isEmpty("");
boolean isNotEmpty = StringUtils.isNotEmpty("hello");

// 字符串截取
String sub = StringUtils.substring("hello world", 6); // "world"
String sub2 = StringUtils.substring("hello world", 0, 5); // "hello"

// 格式化 - 支持 {} 占位符
String msg = StringUtils.format("Hello {}, age {}", "Tom", 25);
// 结果: "Hello Tom, age 25"
```

#### 分割与转换

```java
// 字符串转集合
Set<String> set = StringUtils.stringToSet("a,b,c", ",");
List<String> list = StringUtils.stringToList("a, b, c", ",", true, true);

// 分割并转换类型
List<Integer> ids = StringUtils.splitToList("1,2,3", Integer::valueOf);
List<Long> userIds = StringUtils.splitToList("100;200;300", ";", Long::valueOf);
```

#### 命名转换

```java
// 驼峰与下划线转换
String underscore = StringUtils.camelToUnderscore("userName"); // "user_name"
String camel = StringUtils.underscoreToCamelCase("user_name"); // "userName"
String pascal = StringUtils.underscoreToPascalCase("user_name"); // "UserName"
```

#### 模式匹配

```java
// URL匹配
boolean match = StringUtils.isMatch("/api/*", "/api/user"); // true
boolean matchAny = StringUtils.matchesAny("/api/user", 
    Arrays.asList("/api/*", "/admin/*")); // true

// 检查是否包含任意字符串
boolean contains = StringUtils.containsAnyIgnoreCase("Hello", "hello", "world"); // true
```

#### 字符串映射转换

```java
// 单值映射
Map<String, String> statusMap = Map.of("1", "启用", "0", "禁用");
String result = StringUtils.convertWithMapping("1", statusMap); // "启用"

// 多值映射
String result2 = StringUtils.convertWithMapping("1,0", ",", statusMap); // "启用,禁用"

// 反向映射
String key = StringUtils.convertWithReverseMapping("启用", ",", statusMap); // "1"
```

#### 实用功能

```java
// 左补零
String padded = StringUtils.leftPadWithZero(123, 5); // "00123"

// URL编码/解码
String encoded = StringUtils.urlEncode("中文参数");
String decoded = StringUtils.urlDecode("%E4%B8%AD%E6%96%87");

// 向逗号分隔字符串添加元素（自动去重）
String result = StringUtils.addToCommaString("a,b", "c"); // "a,b,c"
```

### 2. 日期时间工具 (DateUtils)

提供全面的日期时间处理功能，支持多种格式和转换。

#### 获取当前时间

```java
// 获取当前时间
Date now = DateUtils.getNowDate();
String date = DateUtils.getDate(); // yyyy-MM-dd
String time = DateUtils.getTime(); // yyyy-MM-dd HH:mm:ss
String compact = DateUtils.dateTimeNow(); // yyyyMMddHHmmss

// 路径格式日期
String path = DateUtils.datePath(); // yyyy/MM/dd
```

#### 格式化与解析

```java
// 格式化
String formatted = DateUtils.formatDate(new Date()); // yyyy-MM-dd
String dateTime = DateUtils.formatDateTime(new Date()); // yyyy-MM-dd HH:mm:ss

// 使用枚举格式
String custom = DateUtils.parseDateToStr(DateTimeFormat.DATE_COMPACT, new Date());

// 解析多种格式
Date parsed = DateUtils.parseDate("2023-07-22");
Date parsed2 = DateUtils.parseDate("2023/07/22 15:30:45");
```

#### 时间差计算

```java
Date start = DateUtils.parseDate("2023-07-01");
Date end = DateUtils.parseDate("2023-07-22");

// 计算时间差
long days = DateUtils.difference(start, end, TimeUnit.DAYS); // 21
long hours = DateUtils.difference(start, end, TimeUnit.HOURS);

// 格式化时间差
String diff = DateUtils.getDatePoor(end, start); // "21天 0小时 0分钟"
String detail = DateUtils.getTimeDifference(end, start); // "21天"
```

#### 类型转换

```java
// LocalDateTime 转 Date
Date date = DateUtils.toDate(LocalDateTime.now());

// LocalDate 转 Date  
Date date2 = DateUtils.toDate(LocalDate.now());
```

#### 日期范围校验

```java
// 校验日期范围不超过30天
try {
    DateUtils.validateDateRange(startDate, endDate, 30, TimeUnit.DAYS);
} catch (ServiceException e) {
    // 处理范围超限
}
```

### 3. Stream流处理工具 (StreamUtils)

简化集合的流式处理操作。

#### 过滤与查找

```java
List<User> users = getUserList();

// 过滤
List<User> activeUsers = StreamUtils.filter(users, user -> "1".equals(user.getStatus()));

// 查找第一个
User firstAdmin = StreamUtils.findFirst(users, user -> "admin".equals(user.getRole()));

// 查找任意一个
Optional<User> anyActive = StreamUtils.findAny(users, user -> "1".equals(user.getStatus()));
```

#### 转换操作

```java
// 转换为List
List<String> names = StreamUtils.toList(users, User::getName);
List<Long> ids = StreamUtils.toList(users, User::getId);

// 转换为Set
Set<String> roleSet = StreamUtils.toSet(users, User::getRole);

// 拼接
String nameStr = StreamUtils.join(users, User::getName); // 逗号分隔
String customJoin = StreamUtils.join(users, User::getName, " | "); // 自定义分隔符
```

#### 映射操作

```java
// 转为Map (key-value相同类型)
Map<Long, User> userMap = StreamUtils.toIdentityMap(users, User::getId);

// 转为Map (key-value不同类型)
Map<Long, String> idNameMap = StreamUtils.toMap(users, User::getId, User::getName);
```

#### 分组操作

```java
// 按单一条件分组
Map<String, List<User>> roleGroups = StreamUtils.groupByKey(users, User::getRole);

// 按两个条件分组
Map<String, Map<String, List<User>>> deptRoleGroups = 
    StreamUtils.groupBy2Key(users, User::getDeptCode, User::getRole);

// 分组为Map
Map<String, Map<Long, User>> groups = 
    StreamUtils.group2Map(users, User::getDeptCode, User::getId);
```

#### 排序

```java
// 排序
List<User> sorted = StreamUtils.sorted(users, 
    Comparator.comparing(User::getCreateTime).reversed());
```

#### Map合并

```java
Map<String, Integer> map1 = Map.of("a", 1, "b", 2);
Map<String, Integer> map2 = Map.of("b", 3, "c", 4);

// 合并Map
Map<String, Integer> merged = StreamUtils.merge(map1, map2, 
    (v1, v2) -> (v1 == null ? 0 : v1) + (v2 == null ? 0 : v2));
// 结果: {a=1, b=5, c=4}
```

### 4. 树形结构构建工具 (TreeBuildUtils)

构建和操作树形数据结构。

#### 构建树形结构

```java
List<Menu> menuList = getMenuList();

// 自动识别根节点构建
List<Tree<Long>> tree = TreeBuildUtils.build(menuList, (menu, treeNode) -> {
    treeNode.setId(menu.getId());
    treeNode.setParentId(menu.getParentId());
    treeNode.setName(menu.getName());
    treeNode.putExtra("url", menu.getUrl());
});

// 指定根节点构建
List<Tree<Long>> tree2 = TreeBuildUtils.build(menuList, 0L, (menu, treeNode) -> {
    // 节点解析逻辑
});
```

#### 树形操作

```java
// 获取所有叶子节点
List<Tree<Long>> leafNodes = TreeBuildUtils.getLeafNodes(tree);

// 获取所有子节点（包括自身）
List<Tree<Long>> allNodes = TreeBuildUtils.getAllNodes(rootNode);

// 查找指定节点
Tree<Long> node = TreeBuildUtils.findNodeById(tree, 123L);

// 获取树的最大深度
int depth = TreeBuildUtils.getMaxDepth(tree);
```

### 5. 反射工具 (ReflectUtils)

扩展 HuTool 的反射工具，支持多级属性访问。

#### 多级属性访问

```java
User user = getUser();

// 获取多级属性
String profileName = ReflectUtils.invokeGetter(user, "profile.name");
String companyName = ReflectUtils.invokeGetter(user, "profile.company.name");

// 设置多级属性
ReflectUtils.invokeSetter(user, "profile.name", "张三");
ReflectUtils.invokeSetter(user, "profile.company.name", "ABC公司");
```

#### 安全访问

```java
// 安全获取属性（遇到null不抛异常）
String name = ReflectUtils.getPropertySafely(user, "profile.name");

// 检查是否具有属性路径
boolean hasProperty = ReflectUtils.hasProperty(user, "profile.name");
```

### 6. 对象工具 (ObjectUtils)

扩展 HuTool 的对象工具，提供安全的对象访问。

#### 安全属性访问

```java
User user = getUser(); // 可能为null

// 安全获取属性
String name = ObjectUtils.getIfNotNull(user, User::getName);

// 带默认值的安全获取
String name2 = ObjectUtils.getIfNotNull(user, User::getName, "未知用户");
```

### 7. Spring上下文工具 (SpringUtils)

访问Spring容器和Bean管理。

#### Bean操作

```java
// 获取Bean
UserService userService = SpringUtils.getBean(UserService.class);
UserService userService2 = SpringUtils.getBean("userService");

// 检查Bean是否存在
boolean exists = SpringUtils.containsBean("userService");

// 检查是否单例
boolean singleton = SpringUtils.isSingleton("userService");

// 获取Bean类型
Class<?> type = SpringUtils.getType("userService");

// 获取别名
String[] aliases = SpringUtils.getAliases("userService");
```

#### AOP代理

```java
// 获取AOP代理对象
UserService proxy = SpringUtils.getAopProxy(userServiceImpl);
```

#### 环境信息

```java
// 获取应用上下文
ApplicationContext context = SpringUtils.context();

// 判断是否虚拟线程环境
boolean isVirtual = SpringUtils.isVirtual();
```

### 8. Servlet工具 (ServletUtils)

处理HTTP请求响应的实用工具。

#### 参数获取

```java
// 获取请求参数
String userName = ServletUtils.getParameter("userName");
String userName2 = ServletUtils.getParameter("userName", "默认值");

// 类型转换
Integer pageNum = ServletUtils.getParameterToInt("pageNum");
Integer pageSize = ServletUtils.getParameterToInt("pageSize", 10);
Boolean active = ServletUtils.getParameterToBool("active");

// 获取所有参数
Map<String, String[]> allParams = ServletUtils.getParams(request);
Map<String, String> paramMap = ServletUtils.getParamMap(request);
```

#### 请求响应对象

```java
// 获取当前请求响应对象
HttpServletRequest request = ServletUtils.getRequest();
HttpServletResponse response = ServletUtils.getResponse();
HttpSession session = ServletUtils.getSession();
```

#### 请求头处理

```java
// 获取请求头
String userAgent = ServletUtils.getHeader(request, "User-Agent");
Map<String, String> headers = ServletUtils.getHeaders(request);
```

#### 响应处理

```java
// 渲染JSON响应
ServletUtils.renderString(response, "{\"success\": true}");

// 判断Ajax请求
boolean isAjax = ServletUtils.isAjaxRequest(request);
```

#### 客户端信息

```java
// 获取客户端IP
String clientIP = ServletUtils.getClientIP();

// URL编码解码
String encoded = ServletUtils.urlEncode("中文");
String decoded = ServletUtils.urlDecode("%E4%B8%AD%E6%96%87");
```

### 9. 线程工具 (ThreadUtils)

线程池管理和异常处理。

#### 线程池优雅关闭

```java
ExecutorService executor = Executors.newFixedThreadPool(10);

// 优雅关闭（默认120秒超时）
ThreadUtils.shutdownGracefully(executor);

// 自定义超时时间
ThreadUtils.shutdownGracefully(executor, 60);
```

#### 异常处理

```java
// 在ThreadPoolExecutor的afterExecute中使用
@Override
protected void afterExecute(Runnable r, Throwable t) {
    super.afterExecute(r, t);
    ThreadUtils.logException(r, t);
}
```

#### 线程休眠

```java
// 安全休眠（自动处理中断异常）
ThreadUtils.sleep(1000); // 1秒
ThreadUtils.sleepSeconds(5); // 5秒

// 获取线程信息
String threadInfo = ThreadUtils.getCurrentThreadInfo();
```

### 10. 文件工具 (FileUtils & FileTypeUtils)

文件处理和类型判断。

#### 文件下载响应头

```java
@GetMapping("/download")
public void download(HttpServletResponse response) {
    String fileName = "用户数据.xlsx";
    
    // 设置下载响应头（自动处理文件名编码）
    FileUtils.setAttachmentResponseHeader(response, fileName);
    
    // 文件内容写入响应流
    // ...
}
```

#### 文件类型判断

```java
// 按扩展名判断
boolean isImage = FileTypeUtils.isImage("jpg");
boolean isDocument = FileTypeUtils.isDocument("pdf");
boolean isVideo = FileTypeUtils.isVideo("mp4");

// 按File对象判断
File file = new File("demo.png");
boolean isImage2 = FileTypeUtils.isImage(file);
String fileType = FileTypeUtils.getFileType(file); // "图片"

// 检查是否允许的类型
boolean allowed = FileTypeUtils.isAllowed("exe"); // false
```

#### URL编码工具

```java
// 百分号编码
String encoded = FileUtils.percentEncode("文件名.txt");
```

### 11. IP地址工具 (AddressUtils & RegionUtils)

IP地址解析和地理位置定位。

#### IP地址解析

```java
// 获取IP地理位置
String location = AddressUtils.getRealAddressByIp("8.8.8.8");
// 可能返回: "美国|北美|美国|美国|谷歌"

String location2 = AddressUtils.getRealAddressByIp("192.168.1.1");
// 返回: "内网IP"

String location3 = AddressUtils.getRealAddressByIp("invalid-ip");
// 返回: "XX XX"
```

#### 离线IP定位

```java
// 使用ip2region库进行离线定位
String cityInfo = RegionUtils.getCityInfo("202.108.22.5");
// 返回格式: "中国|华北|北京市|北京市|联通"
```

#### 网络工具

```java
// IP类型判断
boolean isIPv4 = NetUtils.isIpv4("192.168.1.1"); // true
boolean isIPv6 = NetUtils.isIpv6("2001:db8::1"); // true

// 内网判断
boolean isInner = NetUtils.isInnerIP("192.168.1.1"); // true
boolean isInnerV6 = NetUtils.isInnerIpv6("fe80::1"); // true
```

### 12. 正则工具 (Regex Utils)

正则表达式相关工具。

#### 预定义模式

```java
// 使用预编译模式池
Pattern i18nPattern = RegexPatternPool.I18N_KEY;
Pattern accountPattern = RegexPatternPool.ACCOUNT;
Pattern statusPattern = RegexPatternPool.BINARY_STATUS;
```

#### 校验器

```java
// 国际化键格式校验
boolean valid = RegexValidator.isValidI18nKey("user.profile.name"); // true

// 账号格式校验
boolean validAccount = RegexValidator.isValidAccount("admin123"); // true

// 状态值校验
boolean validStatus = RegexValidator.isValidStatus("1"); // true

// 字典类型校验
boolean validDict = RegexValidator.isValidDictType("sys_user_sex"); // true
```

#### 提取工具

```java
// 从字符串中提取匹配部分
String result = RegexUtils.extractFromString(
    "用户ID: 12345", "(\\d+)", "未找到");
// 返回: "12345"
```

### 13. SQL安全工具 (SqlUtil)

防止SQL注入的安全工具。

#### ORDER BY安全校验

```java
// 校验排序参数
String orderBy = "name asc, create_time desc";
String safeOrderBy = SqlUtil.escapeOrderBySql(orderBy);

// 检查是否安全
boolean isSafe = SqlUtil.isValidOrderBySql("name asc"); // true
boolean isUnsafe = SqlUtil.isValidOrderBySql("name; drop table"); // false
```

#### SQL关键字过滤

```java
try {
    SqlUtil.filterKeyword("select * from user");
    // 抛出异常: 参数存在SQL注入风险
} catch (IllegalArgumentException e) {
    // 处理SQL注入风险
}
```

### 14. 参数校验工具 (ValidatorUtils)

手动触发Bean Validation校验。

#### 基本校验

```java
User user = new User();
user.setName(""); // 违反@NotBlank约束

try {
    // 校验对象（抛出异常）
    ValidatorUtils.validate(user);
} catch (ConstraintViolationException e) {
    // 处理校验失败
    System.out.println(e.getMessage());
}

// 校验并返回结果（不抛异常）
Set<ConstraintViolation<User>> violations = ValidatorUtils.validateAndReturn(user);
```

#### 分组校验

```java
// 使用校验分组
ValidatorUtils.validate(user, AddGroup.class);
ValidatorUtils.validate(user, EditGroup.class);
```

#### 属性校验

```java
// 校验单个属性
ValidatorUtils.validateProperty(user, "email");

// 校验属性值
ValidatorUtils.validateValue(User.class, "email", "invalid-email");
```

#### 便捷方法

```java
// 检查是否通过校验
boolean isValid = ValidatorUtils.isValid(user);

// 获取错误信息
String errors = ValidatorUtils.getValidationErrors(user);
// 返回: "name: 不能为空; email: 邮箱格式错误"
```

### 15. 对象映射工具 (MapstructUtils)

基于 MapStruct Plus 的对象映射工具。

#### 基本映射

```java
// 对象转换
UserVo userVo = MapstructUtils.convert(user, UserVo.class);

// 列表转换
List<UserVo> userVos = MapstructUtils.convert(userList, UserVo.class);

// 属性赋值
UserVo vo = new UserVo();
MapstructUtils.convert(user, vo); // 将user属性赋值给vo
```

#### Map映射

```java
// Map转对象
Map<String, Object> map = Map.of("name", "张三", "age", 25);
User user = MapstructUtils.convert(map, User.class);
```

### 16. 国际化消息工具 (MessageUtils)

国际化消息处理。

#### 消息获取

```java
// 获取国际化消息
String message = MessageUtils.message("user.not.found");

// 带参数的消息
String message2 = MessageUtils.message("user.login.success", "张三");

// 消息不存在时返回键本身
String message3 = MessageUtils.message("nonexistent.key"); // 返回: "nonexistent.key"
```

## 使用最佳实践

### 1. 性能优化

#### 大数据量处理

```java
// 使用Stream工具处理大量数据时，注意内存使用
List<UserVo> vos = StreamUtils.toList(users, user -> {
    // 避免在转换函数中进行复杂操作
    return MapstructUtils.convert(user, UserVo.class);
});

// 分批处理大数据量
List<List<User>> batches = Lists.partition(users, 1000);
for (List<User> batch : batches) {
    // 分批处理
}
```

#### 缓存利用

```java
// 正则模式使用预编译版本
Pattern pattern = RegexPatternPool.I18N_KEY; // 而不是 Pattern.compile()

// 反射操作缓存Method对象
// ReflectUtils内部已实现缓存
```

### 2. 异常处理

#### 安全的工具方法使用

```java
// 使用安全版本的方法
String name = ObjectUtils.getIfNotNull(user, User::getName, "未知");
String profileName = ReflectUtils.getPropertySafely(user, "profile.name");

// 或者使用try-catch
try {
    String name = ReflectUtils.invokeGetter(user, "profile.name");
} catch (Exception e) {
    log.warn("获取用户档案名称失败", e);
    // 设置默认值或其他处理
}
```

### 3. 字符串处理优化

#### 大量字符串拼接

```java
// 使用Stream工具进行拼接
String result = StreamUtils.join(users, User::getName, ",");

// 而不是循环拼接
StringBuilder sb = new StringBuilder();
for (User user : users) {
    if (sb.length() > 0) sb.append(",");
    sb.append(user.getName());
}
```

#### 字符串映射批量转换

```java
// 批量转换
List<String> statusLabels = StreamUtils.toList(statusCodes, 
    code -> StringUtils.convertWithMapping(code, statusMap));
```

### 4. 日期时间处理

#### 时区注意事项

```java
// 使用系统默认时区的转换
Date date = DateUtils.toDate(LocalDateTime.now());

// 如果需要特定时区，使用原生API
ZonedDateTime zdt = LocalDateTime.now().atZone(ZoneId.of("Asia/Shanghai"));
Date date2 = Date.from(zdt.toInstant());
```

### 5. 线程安全

#### 工具类都是线程安全的

```java
// 所有工具类方法都是静态的，线程安全
// 可以在多线程环境中安全使用
CompletableFuture.supplyAsync(() -> {
    return StringUtils.format("用户{}, 时间{}", userName, DateUtils.getTime());
});
```

## 扩展指南

### 1. 自定义工具类

```java
// 遵循相同的设计模式
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class CustomUtils {
    
    // 静态方法
    public static String customMethod(String input) {
        // 实现逻辑
        return result;
    }
    
    // 重载方法提供便利
    public static String customMethod(String input, String defaultValue) {
        return StringUtils.isNotBlank(input) ? customMethod(input) : defaultValue;
    }
}
```

### 2. 扩展现有工具

```java
// 通过继承扩展（如果需要）
public class EnhancedStringUtils extends StringUtils {
    
    public static String customFormat(String template, Object... args) {
        // 自定义格式化逻辑
        return format(template, args);
    }
}
```

## 工具类组合使用

### 复杂业务场景示例

#### 用户导出场景

```java
/**
 * 用户导出服务
 */
@Service
@RequiredArgsConstructor
public class UserExportService {

    private final UserMapper userMapper;

    /**
     * 导出用户数据
     */
    public void exportUsers(HttpServletResponse response, UserQueryBo query) {
        // 1. 参数校验
        ValidatorUtils.validate(query);

        // 2. 查询数据
        List<User> users = userMapper.selectList(query);

        // 3. 数据转换 - 使用StreamUtils和MapstructUtils
        List<UserExportVo> exportData = StreamUtils.toList(users, user -> {
            UserExportVo vo = MapstructUtils.convert(user, UserExportVo.class);

            // 状态值转标签
            Map<String, String> statusMap = Map.of("1", "启用", "0", "禁用");
            vo.setStatusLabel(StringUtils.convertWithMapping(user.getStatus(), statusMap));

            // 日期格式化
            vo.setCreateTimeStr(DateUtils.formatDateTime(user.getCreateTime()));

            // IP地址解析
            vo.setLoginLocation(AddressUtils.getRealAddressByIp(user.getLoginIp()));

            return vo;
        });

        // 4. 按部门分组统计
        Map<String, List<UserExportVo>> deptGroups = StreamUtils.groupByKey(exportData, UserExportVo::getDeptName);

        // 5. 设置下载响应头
        String fileName = StringUtils.format("用户数据_{}.xlsx", DateUtils.dateTimeNow());
        FileUtils.setAttachmentResponseHeader(response, fileName);

        // 6. 导出Excel
        // ExcelUtils.exportExcel(exportData, UserExportVo.class, response);
    }
}
```

#### 数据同步场景

```java
/**
 * 数据同步服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataSyncService {

    private final SyncMapper syncMapper;

    /**
     * 同步外部数据
     */
    @Transactional
    public SyncResult syncExternalData(List<ExternalData> externalList) {
        SyncResult result = new SyncResult();

        // 1. 数据校验和过滤
        List<ExternalData> validData = StreamUtils.filter(externalList, data -> {
            // 校验必填字段
            if (StringUtils.isEmpty(data.getCode())) {
                return false;
            }
            // 校验格式
            if (!RegexValidator.isValidAccount(data.getCode())) {
                return false;
            }
            return true;
        });

        // 2. 查询已存在的数据
        Set<String> existingCodes = StreamUtils.toSet(
            syncMapper.selectExistingCodes(),
            String::valueOf
        );

        // 3. 分类处理 - 新增和更新
        List<ExternalData> toInsert = StreamUtils.filter(validData,
            data -> !existingCodes.contains(data.getCode()));
        List<ExternalData> toUpdate = StreamUtils.filter(validData,
            data -> existingCodes.contains(data.getCode()));

        // 4. 转换为实体
        List<SyncEntity> insertEntities = StreamUtils.toList(toInsert, data -> {
            SyncEntity entity = MapstructUtils.convert(data, SyncEntity.class);
            entity.setCreateTime(DateUtils.getNowDate());
            return entity;
        });

        List<SyncEntity> updateEntities = StreamUtils.toList(toUpdate, data -> {
            SyncEntity entity = MapstructUtils.convert(data, SyncEntity.class);
            entity.setUpdateTime(DateUtils.getNowDate());
            return entity;
        });

        // 5. 批量操作
        if (CollUtil.isNotEmpty(insertEntities)) {
            syncMapper.insertBatch(insertEntities);
            result.setInsertCount(insertEntities.size());
        }

        if (CollUtil.isNotEmpty(updateEntities)) {
            syncMapper.updateBatch(updateEntities);
            result.setUpdateCount(updateEntities.size());
        }

        // 6. 记录日志
        log.info("数据同步完成: 新增={}, 更新={}, 跳过={}",
            result.getInsertCount(),
            result.getUpdateCount(),
            externalList.size() - validData.size());

        return result;
    }
}
```

#### 树形菜单构建场景

```java
/**
 * 菜单服务
 */
@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuMapper menuMapper;

    /**
     * 构建用户菜单树
     */
    public List<RouterVo> buildUserMenuTree(Long userId) {
        // 1. 查询用户菜单
        List<Menu> menus = menuMapper.selectMenusByUserId(userId);

        // 2. 过滤并排序
        List<Menu> visibleMenus = StreamUtils.filter(menus,
            menu -> "0".equals(menu.getVisible()));
        List<Menu> sortedMenus = StreamUtils.sorted(visibleMenus,
            Comparator.comparingInt(Menu::getOrderNum));

        // 3. 构建树形结构
        List<Tree<Long>> menuTree = TreeBuildUtils.build(sortedMenus, (menu, node) -> {
            node.setId(menu.getId());
            node.setParentId(menu.getParentId());
            node.setName(menu.getName());
            node.putExtra("path", menu.getPath());
            node.putExtra("component", menu.getComponent());
            node.putExtra("icon", menu.getIcon());
            node.putExtra("menuType", menu.getMenuType());
            node.putExtra("perms", menu.getPerms());
        });

        // 4. 转换为路由格式
        return convertToRouters(menuTree);
    }

    /**
     * 转换为路由对象
     */
    private List<RouterVo> convertToRouters(List<Tree<Long>> trees) {
        return StreamUtils.toList(trees, tree -> {
            RouterVo router = new RouterVo();
            router.setName(tree.getName().toString());
            router.setPath(ObjectUtils.getIfNotNull(tree.get("path"), Object::toString, ""));
            router.setComponent(ObjectUtils.getIfNotNull(tree.get("component"), Object::toString, "Layout"));

            // 递归处理子菜单
            if (CollUtil.isNotEmpty(tree.getChildren())) {
                router.setChildren(convertToRouters(tree.getChildren()));
            }

            return router;
        });
    }
}
```

### 工具链式调用

```java
/**
 * 工具链式使用示例
 */
public class ToolChainExample {

    /**
     * 处理用户输入并格式化输出
     */
    public String processUserInput(String input) {
        // 链式处理
        return Optional.ofNullable(input)
            .filter(StringUtils::isNotBlank)
            .map(String::trim)
            .map(str -> StringUtils.urlDecode(str))
            .map(str -> SqlUtil.escapeOrderBySql(str))
            .orElse("");
    }

    /**
     * 批量处理并收集结果
     */
    public Map<String, Object> batchProcess(List<String> inputs) {
        // 过滤有效输入
        List<String> validInputs = StreamUtils.filter(inputs, StringUtils::isNotBlank);

        // 转换并去重
        Set<String> uniqueValues = StreamUtils.toSet(validInputs, String::toLowerCase);

        // 分组统计
        Map<Integer, List<String>> lengthGroups = StreamUtils.groupByKey(validInputs,
            String::length);

        // 拼接结果
        String joined = StreamUtils.join(validInputs, ",");

        return Map.of(
            "count", validInputs.size(),
            "unique", uniqueValues.size(),
            "groups", lengthGroups,
            "joined", joined
        );
    }
}
```

## 异步处理工具

### CompletableFuture 组合使用

```java
/**
 * 异步数据聚合服务
 */
@Service
@RequiredArgsConstructor
public class AsyncAggregationService {

    private final UserService userService;
    private final OrderService orderService;
    private final MessageService messageService;

    @Async
    public CompletableFuture<UserDashboardVo> getUserDashboard(Long userId) {
        // 并行获取多个数据源
        CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() ->
            userService.getById(userId));

        CompletableFuture<List<Order>> ordersFuture = CompletableFuture.supplyAsync(() ->
            orderService.getRecentOrders(userId, 10));

        CompletableFuture<Integer> unreadCountFuture = CompletableFuture.supplyAsync(() ->
            messageService.getUnreadCount(userId));

        // 等待所有完成并组装结果
        return CompletableFuture.allOf(userFuture, ordersFuture, unreadCountFuture)
            .thenApply(v -> {
                UserDashboardVo dashboard = new UserDashboardVo();

                // 使用工具类安全获取数据
                User user = userFuture.join();
                dashboard.setUserName(ObjectUtils.getIfNotNull(user, User::getName, "未知用户"));
                dashboard.setLastLoginTime(DateUtils.formatDateTime(user.getLastLoginTime()));
                dashboard.setLoginLocation(AddressUtils.getRealAddressByIp(user.getLoginIp()));

                // 订单统计
                List<Order> orders = ordersFuture.join();
                dashboard.setRecentOrders(StreamUtils.toList(orders,
                    order -> MapstructUtils.convert(order, OrderVo.class)));

                // 消息数量
                dashboard.setUnreadMessageCount(unreadCountFuture.join());

                return dashboard;
            });
    }
}
```

### 批量异步处理

```java
/**
 * 批量异步处理工具
 */
public class BatchAsyncUtils {

    private static final ExecutorService EXECUTOR = Executors.newFixedThreadPool(
        Runtime.getRuntime().availableProcessors() * 2);

    /**
     * 批量异步处理
     */
    public static <T, R> List<R> batchProcess(
            List<T> items,
            Function<T, R> processor,
            int batchSize) {

        // 分批
        List<List<T>> batches = Lists.partition(items, batchSize);

        // 异步处理每批
        List<CompletableFuture<List<R>>> futures = StreamUtils.toList(batches, batch ->
            CompletableFuture.supplyAsync(() ->
                StreamUtils.toList(batch, processor), EXECUTOR));

        // 等待所有完成并合并结果
        return futures.stream()
            .map(CompletableFuture::join)
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }

    /**
     * 优雅关闭
     */
    public static void shutdown() {
        ThreadUtils.shutdownGracefully((ExecutorService) EXECUTOR, 60);
    }
}
```

## JSON处理工具

### JsonUtils 使用示例

```java
/**
 * JSON工具使用示例
 */
public class JsonUtilsExample {

    /**
     * 对象序列化
     */
    public void serializationExample() {
        User user = new User();
        user.setId(1L);
        user.setName("张三");
        user.setCreateTime(LocalDateTime.now());

        // 对象转JSON字符串
        String json = JsonUtils.toJsonString(user);

        // 对象转字节数组
        byte[] bytes = JsonUtils.toJsonBytes(user);

        // 格式化输出
        String prettyJson = JsonUtils.toPrettyJsonString(user);
    }

    /**
     * 反序列化
     */
    public void deserializationExample() {
        String json = "{\"id\":1,\"name\":\"张三\"}";

        // JSON转对象
        User user = JsonUtils.parseObject(json, User.class);

        // JSON转List
        String listJson = "[{\"id\":1},{\"id\":2}]";
        List<User> users = JsonUtils.parseArray(listJson, User.class);

        // JSON转Map
        Map<String, Object> map = JsonUtils.parseMap(json);

        // JSON转指定类型Map
        Map<String, User> userMap = JsonUtils.parseMap(json, String.class, User.class);
    }

    /**
     * 复杂类型处理
     */
    public void complexTypeExample() {
        String json = "{\"data\":{\"users\":[{\"id\":1}]}}";

        // 使用TypeReference处理复杂类型
        Map<String, Map<String, List<User>>> result = JsonUtils.parseObject(json,
            new TypeReference<Map<String, Map<String, List<User>>>>() {});

        // 获取嵌套数据
        List<User> users = result.get("data").get("users");
    }

    /**
     * 空值处理
     */
    public void nullHandlingExample() {
        // 安全解析（返回null而不是抛异常）
        User user = JsonUtils.parseObjectQuietly("{invalid json}", User.class);

        // 带默认值解析
        User defaultUser = new User();
        User result = Optional.ofNullable(JsonUtils.parseObjectQuietly("{}", User.class))
            .orElse(defaultUser);
    }
}
```

## 加密工具

### 常用加密操作

```java
/**
 * 加密工具使用示例
 */
public class EncryptUtilsExample {

    /**
     * MD5加密
     */
    public String md5Example(String input) {
        // 基础MD5
        String md5 = SecureUtil.md5(input);

        // 带盐MD5
        String saltedMd5 = SecureUtil.md5(input + "salt");

        return md5;
    }

    /**
     * AES加密解密
     */
    public void aesExample() {
        String key = "1234567890123456"; // 16位密钥
        String content = "敏感数据";

        // 加密
        AES aes = SecureUtil.aes(key.getBytes());
        String encrypted = aes.encryptBase64(content);

        // 解密
        String decrypted = aes.decryptStr(encrypted);
    }

    /**
     * RSA加密解密
     */
    public void rsaExample() {
        // 生成密钥对
        KeyPair keyPair = SecureUtil.generateKeyPair("RSA");
        String publicKey = Base64.encode(keyPair.getPublic().getEncoded());
        String privateKey = Base64.encode(keyPair.getPrivate().getEncoded());

        // 公钥加密
        RSA rsa = SecureUtil.rsa(privateKey, publicKey);
        String encrypted = rsa.encryptBase64("敏感数据", KeyType.PublicKey);

        // 私钥解密
        String decrypted = rsa.decryptStr(encrypted, KeyType.PrivateKey);
    }

    /**
     * 签名验证
     */
    public void signExample() {
        String privateKey = "...";
        String publicKey = "...";
        String data = "需要签名的数据";

        // 签名
        Sign sign = SecureUtil.sign(SignAlgorithm.SHA256withRSA, privateKey, publicKey);
        String signature = sign.signHex(data);

        // 验签
        boolean verified = sign.verify(data.getBytes(), HexUtil.decodeHex(signature));
    }
}
```

## 性能优化指南

### 工具类性能对比

```java
/**
 * 性能测试示例
 */
public class PerformanceTest {

    /**
     * 字符串格式化性能对比
     */
    @Test
    public void stringFormatPerformance() {
        int iterations = 100000;
        String name = "张三";
        int age = 25;

        // String.format - 较慢
        long start1 = System.currentTimeMillis();
        for (int i = 0; i < iterations; i++) {
            String result = String.format("姓名: %s, 年龄: %d", name, age);
        }
        long time1 = System.currentTimeMillis() - start1;

        // StringUtils.format - 较快
        long start2 = System.currentTimeMillis();
        for (int i = 0; i < iterations; i++) {
            String result = StringUtils.format("姓名: {}, 年龄: {}", name, age);
        }
        long time2 = System.currentTimeMillis() - start2;

        // StringBuilder - 最快
        long start3 = System.currentTimeMillis();
        for (int i = 0; i < iterations; i++) {
            String result = new StringBuilder()
                .append("姓名: ").append(name)
                .append(", 年龄: ").append(age)
                .toString();
        }
        long time3 = System.currentTimeMillis() - start3;

        System.out.println("String.format: " + time1 + "ms");
        System.out.println("StringUtils.format: " + time2 + "ms");
        System.out.println("StringBuilder: " + time3 + "ms");
    }

    /**
     * 集合转换性能对比
     */
    @Test
    public void collectionConvertPerformance() {
        List<User> users = generateUsers(10000);

        // for循环
        long start1 = System.currentTimeMillis();
        List<String> names1 = new ArrayList<>();
        for (User user : users) {
            names1.add(user.getName());
        }
        long time1 = System.currentTimeMillis() - start1;

        // StreamUtils
        long start2 = System.currentTimeMillis();
        List<String> names2 = StreamUtils.toList(users, User::getName);
        long time2 = System.currentTimeMillis() - start2;

        // 并行流
        long start3 = System.currentTimeMillis();
        List<String> names3 = users.parallelStream()
            .map(User::getName)
            .collect(Collectors.toList());
        long time3 = System.currentTimeMillis() - start3;

        System.out.println("for循环: " + time1 + "ms");
        System.out.println("StreamUtils: " + time2 + "ms");
        System.out.println("并行流: " + time3 + "ms");
    }
}
```

### 内存优化建议

```java
/**
 * 内存优化示例
 */
public class MemoryOptimization {

    /**
     * 避免创建不必要的中间集合
     */
    public long countActiveUsers(List<User> users) {
        // 不推荐 - 创建了中间List
        List<User> activeUsers = StreamUtils.filter(users,
            user -> "1".equals(user.getStatus()));
        return activeUsers.size();

        // 推荐 - 直接计数
        return users.stream()
            .filter(user -> "1".equals(user.getStatus()))
            .count();
    }

    /**
     * 大数据量分批处理
     */
    public void processBigData(List<String> bigList) {
        int batchSize = 1000;
        List<List<String>> batches = Lists.partition(bigList, batchSize);

        for (List<String> batch : batches) {
            // 处理每批数据
            processBatch(batch);

            // 及时释放引用，帮助GC
            batch = null;
        }
    }

    /**
     * 使用原生类型避免装箱
     */
    public int sumAges(List<User> users) {
        // 不推荐 - 装箱开销
        return users.stream()
            .map(User::getAge)
            .reduce(0, Integer::sum);

        // 推荐 - 使用mapToInt避免装箱
        return users.stream()
            .mapToInt(User::getAge)
            .sum();
    }
}
```

## 单元测试示例

### 工具类测试

```java
/**
 * StringUtils测试
 */
class StringUtilsTest {

    @Test
    void testFormat() {
        String result = StringUtils.format("Hello {}, age {}", "Tom", 25);
        assertEquals("Hello Tom, age 25", result);
    }

    @Test
    void testFormat_WithNull() {
        String result = StringUtils.format("Value: {}", (Object) null);
        assertEquals("Value: null", result);
    }

    @Test
    void testBlankToDefault() {
        assertEquals("default", StringUtils.blankToDefault("", "default"));
        assertEquals("default", StringUtils.blankToDefault(null, "default"));
        assertEquals("value", StringUtils.blankToDefault("value", "default"));
    }

    @Test
    void testCamelToUnderscore() {
        assertEquals("user_name", StringUtils.camelToUnderscore("userName"));
        assertEquals("user_id", StringUtils.camelToUnderscore("userId"));
        assertEquals("create_time", StringUtils.camelToUnderscore("createTime"));
    }

    @Test
    void testStringToSet() {
        Set<String> set = StringUtils.stringToSet("a,b,c", ",");
        assertEquals(3, set.size());
        assertTrue(set.contains("a"));
        assertTrue(set.contains("b"));
        assertTrue(set.contains("c"));
    }
}

/**
 * DateUtils测试
 */
class DateUtilsTest {

    @Test
    void testFormatDate() {
        Date date = DateUtils.parseDate("2023-07-22");
        String formatted = DateUtils.formatDate(date);
        assertEquals("2023-07-22", formatted);
    }

    @Test
    void testDifference() {
        Date start = DateUtils.parseDate("2023-07-01");
        Date end = DateUtils.parseDate("2023-07-22");

        long days = DateUtils.difference(start, end, TimeUnit.DAYS);
        assertEquals(21, days);
    }

    @Test
    void testValidateDateRange() {
        Date start = DateUtils.parseDate("2023-07-01");
        Date end = DateUtils.parseDate("2023-08-15");

        // 超过30天应抛出异常
        assertThrows(ServiceException.class, () ->
            DateUtils.validateDateRange(start, end, 30, TimeUnit.DAYS));
    }
}

/**
 * StreamUtils测试
 */
class StreamUtilsTest {

    private List<User> users;

    @BeforeEach
    void setUp() {
        users = List.of(
            new User(1L, "张三", "admin"),
            new User(2L, "李四", "user"),
            new User(3L, "王五", "admin")
        );
    }

    @Test
    void testFilter() {
        List<User> admins = StreamUtils.filter(users,
            user -> "admin".equals(user.getRole()));
        assertEquals(2, admins.size());
    }

    @Test
    void testToList() {
        List<String> names = StreamUtils.toList(users, User::getName);
        assertEquals(List.of("张三", "李四", "王五"), names);
    }

    @Test
    void testGroupByKey() {
        Map<String, List<User>> groups = StreamUtils.groupByKey(users, User::getRole);
        assertEquals(2, groups.size());
        assertEquals(2, groups.get("admin").size());
        assertEquals(1, groups.get("user").size());
    }

    @Test
    void testJoin() {
        String result = StreamUtils.join(users, User::getName, ",");
        assertEquals("张三,李四,王五", result);
    }
}
```

## 注意事项

### 1. 空值处理

```java
// 始终检查输入参数
public void processData(String input) {
    // 推荐：使用工具类的空值安全方法
    String value = StringUtils.blankToDefault(input, "");

    // 或者显式检查
    if (StringUtils.isBlank(input)) {
        return;
    }
}
```

### 2. 线程安全

```java
// 所有工具类都是线程安全的
// 可以在多线程环境中安全使用
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> {
    String result = StringUtils.format("Thread: {}", Thread.currentThread().getName());
    log.info(result);
});
```

### 3. 异常处理

```java
// 使用安全版本的方法避免异常
String value = ReflectUtils.getPropertySafely(obj, "nested.property");

// 或者使用try-catch
try {
    Object value = ReflectUtils.invokeGetter(obj, "property");
} catch (Exception e) {
    log.warn("属性获取失败", e);
}
```

### 4. 资源释放

```java
// 使用完毕后释放资源
try {
    // 使用工具类处理
} finally {
    ThreadUtils.shutdownGracefully(executor);
}
```

### 5. 日志记录

```java
// 在关键操作处记录日志
log.debug("开始处理数据，数量: {}", data.size());
List<Result> results = StreamUtils.toList(data, this::process);
log.info("处理完成，成功: {}", results.size());
```

## 常见问题

**Q: 为什么某些工具方法返回不可变集合？**

A: 为了防止意外修改，某些场景下返回不可变集合。如需修改，请创建新的可变集合。

**Q: 如何处理大数据量的Stream操作？**

A: 考虑使用并行流、分批处理或者调整JVM堆内存设置。

**Q: 正则表达式性能如何优化？**

A: 使用 RegexPatternPool 中的预编译模式，避免重复编译。

**Q: 反射操作的性能影响？**

A: ReflectUtils 内部有缓存机制，但仍建议在性能敏感场景中谨慎使用。

**Q: 如何添加新的文件类型支持？**

A: 修改 FileTypeUtils 中的扩展名集合常量，或者使用继承的方式扩展。

**Q: StringUtils.format 和 String.format 有什么区别？**

A: StringUtils.format 使用 `{}` 作为占位符，性能更好；String.format 使用 `%s` 等格式符，功能更丰富但性能较低。

**Q: StreamUtils 和原生 Stream API 应该如何选择？**

A: 对于简单操作推荐使用 StreamUtils，它提供了更简洁的API；对于复杂的链式操作，可以直接使用原生 Stream API。

**Q: 工具类是否支持扩展？**

A: 是的，可以通过继承或组合的方式扩展现有工具类，但建议保持一致的设计风格。
