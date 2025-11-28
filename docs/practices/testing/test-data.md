# 测试数据管理

## 介绍

测试数据管理是自动化测试的核心组成部分,直接影响测试的可靠性、可维护性和执行效率。RuoYi-Plus 框架提供了完整的测试数据管理体系,从测试数据生成、隔离、清理到数据一致性保障,为开发者提供了专业的测试数据解决方案。

本文档将详细介绍 RuoYi-Plus 项目中的测试数据管理最佳实践,涵盖测试数据的生成策略、隔离机制、清理方法以及常见问题的解决方案。

**核心特性:**

- **自动化数据生成** - 基于 JavaFaker 的测试数据生成器,支持中文姓名、手机号、邮箱等各类数据
- **事务自动回滚** - 服务层测试使用 `@Transactional` 注解,测试结束自动回滚,零污染数据库
- **数据隔离保障** - 使用时间戳、唯一标识等策略,确保测试数据之间互不干扰
- **SQL 清理脚本** - 提供专门的 SQL 脚本,用于清理集成测试产生的持久化数据
- **Builder 模式支持** - 提供测试数据构建器,快速构造复杂的测试对象
- **真实数据依赖** - 支持依赖系统预置数据(如 superadmin 用户),减少测试数据准备工作

## 测试数据生成

### JavaFaker 数据生成器

RuoYi-Plus 框架提供了 `TestDataBuilder` 工具类,基于 JavaFaker 库实现自动化测试数据生成,支持中文本地化数据。

**核心功能:**

```java
/**
 * 测试数据构建器
 *
 * 基于 JavaFaker 1.0.2 实现
 * 支持生成各类真实感的随机测试数据
 */
public class TestDataBuilder {
    private static final Faker FAKER = new Faker(Locale.CHINA);
    private static final Random RANDOM = new Random();

    // 生成中文姓名
    public static String randomChineseName() {
        return FAKER.name().fullName();
    }

    // 生成用户名
    public static String randomUserName() {
        return FAKER.name().username();
    }

    // 生成手机号
    public static String randomPhone() {
        return "1" + (3 + RANDOM.nextInt(7))
            + String.format("%09d", RANDOM.nextInt(1_000_000_000));
    }

    // 生成邮箱
    public static String randomEmail() {
        return FAKER.internet().emailAddress();
    }

    // 生成日期时间
    public static LocalDateTime randomDateTime() {
        return LocalDateTime.now().minus(
            RANDOM.nextInt(365), ChronoUnit.DAYS
        );
    }

    // 生成唯一ID
    public static Long randomId() {
        return Math.abs(RANDOM.nextLong());
    }

    // 生成列表数据
    public static <T> List<T> randomList(int size,
                                          Supplier<T> generator) {
        List<T> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            list.add(generator.get());
        }
        return list;
    }
}
```

**使用示例:**

```java
@SpringBootTest
@Transactional
@DisplayName("用户服务测试")
public class SysUserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试新增用户")
    public void testInsertUser() {
        // 使用 TestDataBuilder 生成测试数据
        SysUserBo user = new SysUserBo();
        user.setUserName("test_" + System.currentTimeMillis());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setPassword("admin123");
        user.setEmail(TestDataBuilder.randomEmail());
        user.setPhone(TestDataBuilder.randomPhone());
        user.setDeptId(103L);
        user.setGender("0");

        // 执行插入
        Long userId = userService.insertUser(user);

        // 验证
        assertNotNull(userId);
        assertTrue(userId > 0);

        // 验证可以查询到
        SysUserVo userVo = userService.getUserById(userId);
        assertNotNull(userVo);
        assertEquals(user.getUserName(), userVo.getUserName());

        // 测试结束自动回滚,无需手动清理
    }
}
```

**生成数据类型:**

| 方法 | 生成内容 | 示例输出 |
|------|---------|---------|
| `randomChineseName()` | 中文姓名 | 张三、李四、王小明 |
| `randomUserName()` | 英文用户名 | john.smith、mary123 |
| `randomPhone()` | 手机号码 | 13812345678、15987654321 |
| `randomEmail()` | 电子邮箱 | test@example.com |
| `randomDateTime()` | 日期时间 | 2025-01-15 10:30:00 |
| `randomId()` | 唯一ID | 1234567890 |
| `randomList(size, generator)` | 列表数据 | List.of(user1, user2, ...) |

### 时间戳唯一性策略

为了确保测试数据的唯一性,避免数据冲突,推荐使用时间戳作为唯一标识:

```java
@Test
@DisplayName("测试新增用户 - 使用时间戳保证唯一性")
public void testInsertUser() {
    // 使用时间戳避免用户名冲突
    long timestamp = System.currentTimeMillis();

    SysUserBo user = new SysUserBo();
    user.setUserName("test_" + timestamp);
    user.setNickName("测试用户_" + timestamp);
    user.setEmail("test" + timestamp + "@example.com");
    user.setPhone(TestDataBuilder.randomPhone());

    // 执行测试...
}
```

**时间戳策略的优势:**

- **全局唯一性** - 毫秒级时间戳保证在并发测试中也不会重复
- **可读性强** - 测试数据包含时间信息,便于追踪和调试
- **自动清理** - 清理脚本可根据时间戳模式批量清理测试数据

### 短时间戳优化

对于有字段长度限制的场景,可以使用短时间戳(取后6位):

```java
private SysRoleBo createTestRole(String namePrefix) {
    SysRoleBo role = new SysRoleBo();
    // role_name 字段限制30字符,使用短时间戳(后6位)
    String suffix = String.valueOf(System.currentTimeMillis() % 1000000);
    role.setRoleName(namePrefix + "_" + suffix);
    role.setRoleKey("test_role_" + suffix);
    role.setRoleSort(99);
    role.setStatus("0");
    role.setRemark("测试角色");
    return role;
}
```

**使用说明:**

- 短时间戳取值范围: 0-999999(6位数字)
- 适用场景: 字段长度受限、需要简短标识的情况
- 冲突概率: 在单线程测试中极低,并发测试需要额外的隔离措施

### 批量测试数据生成

使用 `randomList()` 方法批量生成测试数据:

```java
@Test
@DisplayName("测试批量新增用户")
public void testBatchInsertUsers() {
    // 生成10个测试用户
    List<SysUserBo> users = TestDataBuilder.randomList(10, () -> {
        SysUserBo user = new SysUserBo();
        user.setUserName("test_" + System.currentTimeMillis());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setEmail(TestDataBuilder.randomEmail());
        user.setPhone(TestDataBuilder.randomPhone());
        user.setDeptId(103L);
        user.setGender(RANDOM.nextBoolean() ? "0" : "1");
        return user;
    });

    // 批量插入
    for (SysUserBo user : users) {
        Long userId = userService.insertUser(user);
        assertNotNull(userId);
    }

    // 验证数据量
    PageQuery pageQuery = new PageQuery(20, 1);
    PageResult<SysUserVo> result = userService.pageUsers(
        new SysUserBo(), pageQuery
    );
    assertTrue(result.getTotal() >= 10);

    // 测试结束自动回滚
}
```

## 数据隔离与事务管理

### 服务层测试 - 自动回滚

服务层测试继承 `BaseServiceTest`,使用 `@Transactional` 注解实现自动回滚:

```java
/**
 * 服务测试基类
 *
 * 关键特性: @Transactional 自动回滚
 */
@SpringBootTest
@Transactional // 测试结束自动回滚,不污染数据库
public abstract class BaseServiceTest extends BaseTest {
    // 继承基类的性能监控和生命周期管理
}
```

**使用示例:**

```java
@SpringBootTest
@Transactional // 关键!测试结束自动回滚
@DisplayName("广告配置服务测试")
public class AdServiceTest extends BaseServiceTest {

    @Autowired
    private IAdService adService;

    @Test
    @DisplayName("测试新增广告")
    public void testAdd() {
        // 准备测试数据
        AdBo ad = new AdBo();
        ad.setAdName("测试广告_" + System.currentTimeMillis());
        ad.setAdType("1");
        ad.setImg("https://test.com/ad.jpg");
        ad.setPosition("home_top");
        ad.setSortOrder(1L);
        ad.setStatus("0");

        // 执行新增
        Long adId = adService.add(ad);
        assertNotNull(adId);

        // 验证数据
        AdVo adVo = adService.get(adId);
        assertNotNull(adVo);
        assertEquals(ad.getAdName(), adVo.getAdName());

        // ⚠️ 测试结束后,@Transactional 会自动回滚
        // 这条广告数据不会真正保存到数据库
    }
}
```

**事务回滚机制:**

```
[测试开始]
    ↓
[开启事务]
    ↓
[执行测试代码]
    ↓ - 插入测试数据
    ↓ - 查询验证
    ↓ - 更新数据
    ↓
[测试结束]
    ↓
[自动回滚事务] ← @Transactional 自动触发
    ↓
[数据库恢复到测试前状态]
    ↓
[测试完成] ✅ 零污染
```

### 集成测试 - 真实数据持久化

集成测试使用真实的 HTTP 请求,数据会真实写入数据库,需要手动清理:

```java
/**
 * 用户管理接口集成测试
 *
 * 特点:
 * - 启动真实的 Spring Boot 应用
 * - 真实登录获取 Token
 * - 访问真实数据库(数据会持久化)
 * - 需要手动清理测试数据
 */
@Slf4j
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
@DisplayName("用户管理接口集成测试")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SysUserIntegrationTest extends BaseControllerTest {

    @Autowired
    private SystemApiClient apiClient;

    @Autowired
    private TestLoginHelper testLoginHelper;

    private static String token;
    private static Long testUserId;
    private static String testUserName;

    /**
     * 所有测试开始前执行一次 - 模拟登录获取token
     */
    @BeforeAll
    public static void loginBeforeAll(@Autowired TestLoginHelper testLoginHelper) {
        log.info("========== 开始集成测试,模拟登录获取Token ==========");
        token = testLoginHelper.loginAsSuperAdmin();
        log.info("登录成功,Token: {}", token.substring(0, 30) + "...");
    }

    @Test
    @Order(1)
    @DisplayName("测试新增用户")
    public void testInsertUser() {
        log.info("测试新增用户");

        // 构造测试用户数据
        SysUserBo user = new SysUserBo();
        long timestamp = System.currentTimeMillis();
        user.setUserName("test_" + timestamp);
        user.setNickName("测试用户");
        user.setPassword("test123");
        user.setEmail("test" + timestamp + "@example.com");
        user.setPhone(TestDataBuilder.randomPhone());
        user.setDeptId(100L);
        user.setGender("0");
        user.setStatus("1");
        user.setRoleIds(new Long[]{2L});
        user.setPostIds(new Long[]{4L});

        // 发起新增请求
        ForestResponse<R<Long>> response = apiClient.insertUser(token, user);

        // 验证响应
        assertTrue(response.isSuccess());
        R<Long> result = response.getResult();
        assertNotNull(result);
        assertEquals(200, result.getCode());

        // 保存用户ID供后续测试使用
        testUserId = result.getData();
        testUserName = user.getUserName();

        log.info("新增成功: userId={}, userName={}", testUserId, user.getUserName());

        // ⚠️ 注意: 数据会真实写入数据库,需要手动清理
    }

    @Test
    @Order(2)
    @DisplayName("测试删除用户")
    public void testDeleteUser() {
        log.info("测试删除用户");

        if (testUserId == null) {
            log.warn("未找到测试用户ID,跳过删除测试");
            return;
        }

        // 发起删除请求
        ForestResponse<R<Void>> response = apiClient.deleteUser(token, testUserId);

        // 验证响应
        assertTrue(response.isSuccess());
        R<Void> result = response.getResult();
        assertNotNull(result);
        assertEquals(200, result.getCode());

        log.info("删除成功: userId={}", testUserId);
    }

    @AfterAll
    public static void afterAll() {
        log.info("========== 集成测试结束 ==========");
        // 如果测试失败,可能有残留数据,需要运行清理脚本
    }
}
```

**集成测试数据管理策略:**

1. **测试顺序控制** - 使用 `@Order` 注解控制测试执行顺序
2. **静态变量共享** - 使用 static 字段在测试方法间共享数据(如 testUserId)
3. **测试数据清理** - 在测试结束时删除创建的数据
4. **SQL 清理脚本** - 如果测试失败,使用 cleanup_test_data.sql 清理残留数据

### Controller 测试 - MockMvc 隔离

Controller 测试使用 MockMvc 进行模拟请求,结合 `@MockitoBean` 隔离依赖:

```java
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("用户Controller测试")
public class UserControllerTest extends BaseControllerTest {

    @MockitoBean  // Spring Boot 3.4.0+ 使用 @MockitoBean 替代 @MockBean
    private ISysUserService userService;

    @Test
    @DisplayName("测试获取用户详情")
    public void testGetUser() throws Exception {
        // Mock数据
        SysUserVo mockUser = new SysUserVo();
        mockUser.setUserId(1L);
        mockUser.setUserName("testuser");
        mockUser.setNickName("测试用户");

        when(userService.getUserById(1L)).thenReturn(mockUser);

        // 执行GET请求
        performGet("/system/user/1")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.userId").value(1))
            .andExpect(jsonPath("$.data.userName").value("testuser"));
    }
}
```

**MockMvc 测试的优势:**

- **无需真实数据库** - 通过 Mock 对象模拟服务层返回
- **测试速度快** - 不涉及数据库操作,执行效率高
- **完全隔离** - 测试之间互不影响,无需清理数据
- **专注业务逻辑** - 重点测试 Controller 层的参数处理和响应格式

## 测试数据清理

### SQL 清理脚本

项目提供了专门的 SQL 脚本用于清理集成测试产生的测试数据:

**cleanup_test_data.sql:**

```sql
-- ============================================
-- 集成测试数据清理脚本
-- 使用方法: mysql -u root -p ry_plus_new < cleanup_test_data.sql
-- 或在 MySQL Workbench / Navicat 中直接执行
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- ============================================
-- 1. 清理关联表数据
-- ============================================

-- 清理测试角色的菜单关联
DELETE FROM sys_role_menu
WHERE role_id IN (
    SELECT role_id FROM sys_role
    WHERE role_name LIKE '测试角色_%'
       OR role_name LIKE '待删除角色_%'
       OR role_key LIKE 'test_role_%'
       OR role_key LIKE 'delete_test_%'
);

-- 清理测试角色的部门关联
DELETE FROM sys_role_dept
WHERE role_id IN (
    SELECT role_id FROM sys_role
    WHERE role_name LIKE '测试角色_%'
       OR role_name LIKE '待删除角色_%'
       OR role_key LIKE 'test_role_%'
       OR role_key LIKE 'delete_test_%'
);

-- 清理测试用户的角色关联
DELETE FROM sys_user_role
WHERE user_id IN (
    SELECT user_id FROM sys_user
    WHERE user_name LIKE 'test_%'
);

-- 清理测试用户的岗位关联
DELETE FROM sys_user_post
WHERE user_id IN (
    SELECT user_id FROM sys_user
    WHERE user_name LIKE 'test_%'
);

-- ============================================
-- 2. 清理主表数据
-- ============================================

-- 清理测试角色
DELETE FROM sys_role
WHERE role_name LIKE '测试角色_%'
   OR role_name LIKE '待删除角色_%'
   OR role_key LIKE 'test_role_%'
   OR role_key LIKE 'delete_test_%';

-- 清理测试部门
DELETE FROM sys_dept
WHERE dept_name LIKE '测试部门_%';

-- 清理测试菜单
DELETE FROM sys_menu
WHERE menu_name LIKE '测试菜单_%';

-- 清理测试用户
DELETE FROM sys_user
WHERE user_name LIKE 'test_%';

-- ============================================
-- 3. 提交事务
-- ============================================

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 4. 查看清理结果
-- ============================================

SELECT '=== 清理完成 ===' AS status;

SELECT
    (SELECT COUNT(*) FROM sys_role
     WHERE role_name LIKE '测试角色_%'
        OR role_name LIKE '待删除角色_%'
        OR role_key LIKE 'test_role_%'
        OR role_key LIKE 'delete_test_%') AS test_roles,
    (SELECT COUNT(*) FROM sys_dept WHERE dept_name LIKE '测试部门_%') AS test_depts,
    (SELECT COUNT(*) FROM sys_menu WHERE menu_name LIKE '测试菜单_%') AS test_menus,
    (SELECT COUNT(*) FROM sys_user WHERE user_name LIKE 'test_%') AS test_users;

SELECT '如果上述数字都是0，说明清理成功' AS result;
```

**使用方法:**

```bash
# 方法1: 命令行执行
mysql -u root -p ry_plus_new < cleanup_test_data.sql

# 方法2: MySQL Workbench / Navicat 中直接执行
# 打开 cleanup_test_data.sql 文件,点击"执行"按钮
```

**清理策略说明:**

1. **关联表优先清理** - 先删除外键关联表数据,避免外键约束错误
2. **模式匹配清理** - 使用 LIKE 模式匹配,批量清理所有测试数据
3. **事务保证一致性** - 使用事务包裹,确保清理操作的原子性
4. **清理结果验证** - 执行后自动查询残留数据量,验证清理效果

### 测试数据命名规范

为了便于批量清理,测试数据必须遵循统一的命名规范:

| 数据类型 | 命名规则 | 示例 |
|---------|---------|------|
| 测试用户 | `test_` 前缀 | test_1234567890 |
| 测试角色 | `测试角色_` 或 `test_role_` | 测试角色_123456、test_role_123456 |
| 待删除角色 | `待删除角色_` 或 `delete_test_` | 待删除角色_123456、delete_test_123456 |
| 测试部门 | `测试部门_` | 测试部门_123456 |
| 测试菜单 | `测试菜单_` | 测试菜单_123456 |

**命名规范的重要性:**

- **批量清理** - SQL 脚本可以通过 LIKE 模式批量清理
- **避免误删** - 清晰的前缀可以避免误删生产数据
- **代码审查** - 命名规范使测试代码更易理解和审查

### 自动清理策略

对于临时文件和测试目录,框架提供了自动清理机制:

```java
/**
 * 测试配置类
 *
 * 管理测试临时目录和文件
 */
public class TestConfig {

    /** 测试临时目录 */
    private static final String TEST_TEMP_DIR =
        System.getProperty("java.io.tmpdir") + File.separator + "ruoyi-test";

    /** 测试输出目录 */
    private static final String TEST_OUTPUT_DIR =
        TEST_TEMP_DIR + File.separator + "output";

    /** 测试上传目录 */
    private static final String TEST_UPLOAD_DIR =
        TEST_TEMP_DIR + File.separator + "upload";

    /**
     * 初始化测试目录
     */
    public static void initTestDirs() {
        createDirIfNotExists(TEST_TEMP_DIR);
        createDirIfNotExists(TEST_OUTPUT_DIR);
        createDirIfNotExists(TEST_UPLOAD_DIR);
    }

    /**
     * 清理测试目录
     */
    public static void cleanTestDirs() {
        deleteDir(new File(TEST_OUTPUT_DIR));
        deleteDir(new File(TEST_UPLOAD_DIR));
    }

    private static void deleteDir(File dir) {
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteDir(file);
                    } else {
                        file.delete();
                    }
                }
            }
            dir.delete();
        }
    }
}
```

**自动清理触发时机:**

```java
@AfterEach
public final void baseAfterEach(TestInfo testInfo) {
    tearDown();

    // 清理测试临时文件
    TestConfig.cleanTestDirs();

    // 性能监控...
}
```

**使用示例:**

```java
@Test
@DisplayName("测试文件上传")
public void testFileUpload() throws Exception {
    // 创建测试文件
    String testFilePath = TestConfig.getTempFilePath("test.jpg");
    File testFile = new File(testFilePath);
    // 写入测试数据...

    // 执行上传测试...

    // ⚠️ 测试结束后,TestConfig.cleanTestDirs() 会自动删除临时文件
}
```

## Builder 模式构建测试数据

### 测试数据构建器

使用 Builder 模式构建复杂的测试对象,提高代码可读性和可维护性:

```java
/**
 * 用户测试数据构建器
 */
public class UserTestDataBuilder {

    private final SysUserBo user;

    private UserTestDataBuilder() {
        user = new SysUserBo();
        // 设置默认值
        user.setPassword("admin123");
        user.setDeptId(103L);
        user.setGender("0");
        user.setStatus("1");
    }

    public static UserTestDataBuilder aUser() {
        return new UserTestDataBuilder();
    }

    public UserTestDataBuilder withUserName(String userName) {
        user.setUserName(userName);
        return this;
    }

    public UserTestDataBuilder withNickName(String nickName) {
        user.setNickName(nickName);
        return this;
    }

    public UserTestDataBuilder withEmail(String email) {
        user.setEmail(email);
        return this;
    }

    public UserTestDataBuilder withPhone(String phone) {
        user.setPhone(phone);
        return this;
    }

    public UserTestDataBuilder withRandomData() {
        user.setUserName("test_" + System.currentTimeMillis());
        user.setNickName(TestDataBuilder.randomChineseName());
        user.setEmail(TestDataBuilder.randomEmail());
        user.setPhone(TestDataBuilder.randomPhone());
        return this;
    }

    public SysUserBo build() {
        return user;
    }
}
```

**使用示例:**

```java
@Test
@DisplayName("测试新增用户 - 使用Builder模式")
public void testInsertUserWithBuilder() {
    // 方式1: 自定义数据
    SysUserBo user1 = UserTestDataBuilder.aUser()
        .withUserName("test_custom")
        .withNickName("自定义昵称")
        .withEmail("custom@example.com")
        .withPhone("13800138000")
        .build();

    Long userId1 = userService.insertUser(user1);
    assertNotNull(userId1);

    // 方式2: 随机数据
    SysUserBo user2 = UserTestDataBuilder.aUser()
        .withRandomData()
        .build();

    Long userId2 = userService.insertUser(user2);
    assertNotNull(userId2);

    // 测试结束自动回滚
}
```

**Builder 模式的优势:**

- **链式调用** - 流畅的 API,代码可读性强
- **默认值支持** - 只需设置必要字段,其他字段使用默认值
- **可复用性** - Builder 可以在多个测试方法中复用
- **易于扩展** - 新增字段时只需添加对应的 with 方法

### 通用测试数据构建器

创建通用的测试数据构建器,支持多种实体类型:

```java
/**
 * 角色测试数据构建器
 */
public class RoleTestDataBuilder {

    private final SysRoleBo role;

    private RoleTestDataBuilder() {
        role = new SysRoleBo();
        // 默认值
        role.setRoleSort(99);
        role.setStatus("0");
        role.setRemark("测试角色");
    }

    public static RoleTestDataBuilder aRole() {
        return new RoleTestDataBuilder();
    }

    public RoleTestDataBuilder withName(String namePrefix) {
        String suffix = String.valueOf(System.currentTimeMillis() % 1000000);
        role.setRoleName(namePrefix + "_" + suffix);
        role.setRoleKey("test_role_" + suffix);
        return this;
    }

    public RoleTestDataBuilder withSort(Integer sort) {
        role.setRoleSort(sort);
        return this;
    }

    public RoleTestDataBuilder withStatus(String status) {
        role.setStatus(status);
        return this;
    }

    public SysRoleBo build() {
        return role;
    }
}

/**
 * 广告测试数据构建器
 */
public class AdTestDataBuilder {

    private final AdBo ad;

    private AdTestDataBuilder() {
        ad = new AdBo();
        // 默认值
        ad.setAdType("1");
        ad.setPosition("home_top");
        ad.setSortOrder(1L);
        ad.setStatus("0");
    }

    public static AdTestDataBuilder anAd() {
        return new AdTestDataBuilder();
    }

    public AdTestDataBuilder withName(String prefix) {
        ad.setAdName(prefix + "_" + System.currentTimeMillis());
        return this;
    }

    public AdTestDataBuilder withImage(String img) {
        ad.setImg(img);
        return this;
    }

    public AdTestDataBuilder withDescription(String description) {
        ad.setDescription(description);
        return this;
    }

    public AdBo build() {
        return ad;
    }
}
```

**综合使用示例:**

```java
@Test
@DisplayName("测试批量新增 - 使用Builder模式")
public void testBatchInsert() {
    // 创建多个用户
    SysUserBo user1 = UserTestDataBuilder.aUser()
        .withUserName("test_user1_" + System.currentTimeMillis())
        .withNickName("用户1")
        .withRandomData()
        .build();

    SysUserBo user2 = UserTestDataBuilder.aUser()
        .withUserName("test_user2_" + System.currentTimeMillis())
        .withNickName("用户2")
        .withRandomData()
        .build();

    // 创建角色
    SysRoleBo role = RoleTestDataBuilder.aRole()
        .withName("测试角色")
        .withSort(100)
        .build();

    // 创建广告
    AdBo ad = AdTestDataBuilder.anAd()
        .withName("测试广告")
        .withImage("https://test.com/ad.jpg")
        .withDescription("广告描述")
        .build();

    // 执行测试...
}
```

## 依赖真实数据

### 使用系统预置数据

在测试中可以依赖系统预置的数据,减少测试数据准备工作:

```java
@Test
@DisplayName("测试查询存在的用户 - 使用系统预置数据")
public void testGetUserById() {
    // 使用系统已有的 superadmin 用户(ID通常是1)
    SysUserVo user = userService.getUserById(1L);

    assertNotNull(user, "应该能查到superadmin用户");
    assertEquals("superadmin", user.getUserName());
}

@Test
@DisplayName("测试查询角色列表 - 使用系统预置数据")
public void testListRolesByUserId() {
    // 使用 admin 用户(ID=1)
    List<SysRoleVo> roles = roleService.listRolesByUserId(1L);

    assertNotNull(roles);
    assertTrue(roles.size() > 0, "admin用户应该至少有一个角色");
}
```

**系统预置数据列表:**

| 数据类型 | ID | 标识 | 说明 |
|---------|----|----|------|
| 用户 | 1 | superadmin | 超级管理员 |
| 用户 | 2 | admin | 普通管理员 |
| 部门 | 100 | 若依工作室 | 顶级部门 |
| 部门 | 103 | 研发部门 | 二级部门 |
| 角色 | 1 | admin | 超级管理员角色 |
| 角色 | 2 | common | PC端普通用户角色 |
| 岗位 | 4 | - | 普通员工岗位 |

**使用系统预置数据的优势:**

- **减少准备工作** - 无需创建用户、角色、部门等基础数据
- **测试稳定性** - 系统预置数据不会被删除,测试结果更稳定
- **真实场景模拟** - 使用真实的管理员用户进行测试,更贴近实际使用场景

### 测试数据依赖管理

对于有依赖关系的测试数据,推荐使用测试顺序控制和静态变量共享:

```java
@SpringBootTest
@DisplayName("用户角色关联测试")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class UserRoleIntegrationTest extends BaseControllerTest {

    @Autowired
    private ISysUserService userService;

    @Autowired
    private ISysRoleService roleService;

    private static Long testUserId;
    private static Long testRoleId;

    @Test
    @Order(1)
    @DisplayName("第1步: 创建测试角色")
    public void step1_CreateRole() {
        SysRoleBo role = RoleTestDataBuilder.aRole()
            .withName("测试角色")
            .build();

        boolean result = roleService.batchSave(List.of(role));
        assertTrue(result);

        // 查询角色ID
        SysRoleBo queryBo = new SysRoleBo();
        queryBo.setRoleKey(role.getRoleKey());
        List<SysRoleVo> list = roleService.list(queryBo);
        assertFalse(list.isEmpty());

        testRoleId = list.get(0).getRoleId();
        assertNotNull(testRoleId);
    }

    @Test
    @Order(2)
    @DisplayName("第2步: 创建测试用户并分配角色")
    public void step2_CreateUser() {
        SysUserBo user = UserTestDataBuilder.aUser()
            .withRandomData()
            .build();

        // 分配角色
        user.setRoleIds(new Long[]{testRoleId});

        testUserId = userService.insertUser(user);
        assertNotNull(testUserId);
    }

    @Test
    @Order(3)
    @DisplayName("第3步: 验证用户角色关联")
    public void step3_VerifyUserRole() {
        // 查询用户的角色列表
        List<SysRoleVo> roles = roleService.listRolesByUserId(testUserId);

        assertNotNull(roles);
        assertTrue(roles.size() > 0);

        // 验证包含测试角色
        boolean hasTestRole = roles.stream()
            .anyMatch(r -> r.getRoleId().equals(testRoleId));
        assertTrue(hasTestRole);
    }

    @Test
    @Order(4)
    @DisplayName("第4步: 清理测试数据")
    public void step4_Cleanup() {
        // 删除用户(会自动删除用户角色关联)
        if (testUserId != null) {
            boolean deleteUser = userService.deleteUserById(testUserId);
            assertTrue(deleteUser);
        }

        // 删除角色
        if (testRoleId != null) {
            boolean deleteRole = roleService.batchDelete(List.of(testRoleId));
            assertTrue(deleteRole);
        }
    }
}
```

**测试数据依赖管理策略:**

1. **使用 @TestMethodOrder** - 控制测试方法的执行顺序
2. **使用 @Order 注解** - 为每个测试方法指定执行顺序
3. **使用静态变量** - 在测试方法间共享数据(如 testUserId、testRoleId)
4. **明确的清理步骤** - 在最后的测试方法中清理所有创建的数据

## 最佳实践

### 1. 服务层测试使用事务回滚

**推荐做法** ✅:

```java
@SpringBootTest
@Transactional // 关键!测试结束自动回滚
@DisplayName("用户服务测试")
public class SysUserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试新增用户")
    public void testInsertUser() {
        SysUserBo user = UserTestDataBuilder.aUser()
            .withRandomData()
            .build();

        Long userId = userService.insertUser(user);
        assertNotNull(userId);

        // ✅ 测试结束自动回滚,无需手动清理
    }
}
```

**不推荐做法** ❌:

```java
@SpringBootTest
// ❌ 缺少 @Transactional 注解
@DisplayName("用户服务测试")
public class SysUserServiceTest extends BaseServiceTest {

    @Test
    @DisplayName("测试新增用户")
    public void testInsertUser() {
        SysUserBo user = UserTestDataBuilder.aUser()
            .withRandomData()
            .build();

        Long userId = userService.insertUser(user);
        assertNotNull(userId);

        // ❌ 数据会真实写入数据库
        // ❌ 需要手动删除,否则产生脏数据
        userService.deleteUserById(userId); // 手动清理
    }
}
```

**重要提示:**

- `@Transactional` 是服务层测试的标准配置
- 继承 `BaseServiceTest` 自动获得 `@Transactional` 支持
- 事务回滚确保测试之间互不影响,数据库保持干净

### 2. 使用 TestDataBuilder 生成测试数据

**推荐做法** ✅:

```java
@Test
@DisplayName("测试新增用户 - 使用TestDataBuilder")
public void testInsertUser() {
    SysUserBo user = new SysUserBo();
    user.setUserName("test_" + System.currentTimeMillis());
    user.setNickName(TestDataBuilder.randomChineseName());
    user.setEmail(TestDataBuilder.randomEmail());
    user.setPhone(TestDataBuilder.randomPhone()); // ✅ 使用工具生成
    user.setDeptId(103L);
    user.setGender("0");

    Long userId = userService.insertUser(user);
    assertNotNull(userId);
}
```

**不推荐做法** ❌:

```java
@Test
@DisplayName("测试新增用户 - 硬编码测试数据")
public void testInsertUser() {
    SysUserBo user = new SysUserBo();
    user.setUserName("test_" + System.currentTimeMillis());
    user.setNickName("测试用户");
    user.setEmail("test@example.com"); // ❌ 硬编码邮箱,可能重复
    user.setPhone("13800138000"); // ❌ 硬编码手机号,可能重复
    user.setDeptId(103L);
    user.setGender("0");

    Long userId = userService.insertUser(user);
    assertNotNull(userId);

    // ⚠️ 如果多个测试使用相同的邮箱或手机号,可能导致唯一性约束冲突
}
```

**TestDataBuilder 的优势:**

- 生成真实感的随机数据,避免数据冲突
- 支持中文姓名、手机号等本地化数据
- 提高测试数据的多样性,发现潜在问题

### 3. 测试数据命名遵循规范

**推荐做法** ✅:

```java
@Test
@DisplayName("测试新增角色 - 遵循命名规范")
public void testInsertRole() {
    SysRoleBo role = new SysRoleBo();
    // ✅ 使用 "测试角色_" 前缀
    role.setRoleName("测试角色_" + System.currentTimeMillis() % 1000000);
    // ✅ 使用 "test_role_" 前缀
    role.setRoleKey("test_role_" + System.currentTimeMillis() % 1000000);
    role.setRoleSort(99);
    role.setStatus("0");

    boolean result = roleService.batchSave(List.of(role));
    assertTrue(result);

    // ✅ 测试数据可以通过 cleanup_test_data.sql 批量清理
}
```

**不推荐做法** ❌:

```java
@Test
@DisplayName("测试新增角色 - 不规范命名")
public void testInsertRole() {
    SysRoleBo role = new SysRoleBo();
    // ❌ 没有使用标准前缀
    role.setRoleName("临时角色_" + System.currentTimeMillis() % 1000000);
    role.setRoleKey("tmp_role_" + System.currentTimeMillis() % 1000000);
    role.setRoleSort(99);
    role.setStatus("0");

    boolean result = roleService.batchSave(List.of(role));
    assertTrue(result);

    // ❌ 测试数据无法通过 cleanup_test_data.sql 清理,可能成为脏数据
}
```

**命名规范的重要性:**

- 测试数据使用统一前缀(`test_`、`测试角色_` 等)
- 便于 SQL 清理脚本批量清理
- 避免误删生产数据

### 4. 集成测试使用测试顺序和数据共享

**推荐做法** ✅:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("用户管理接口集成测试")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class) // ✅ 启用测试顺序
public class SysUserIntegrationTest extends BaseControllerTest {

    @Autowired
    private SystemApiClient apiClient;

    private static String token;
    private static Long testUserId; // ✅ 使用静态变量共享数据
    private static String testUserName;

    @BeforeAll
    public static void loginBeforeAll(@Autowired TestLoginHelper testLoginHelper) {
        token = testLoginHelper.loginAsSuperAdmin();
    }

    @Test
    @Order(1) // ✅ 明确指定执行顺序
    @DisplayName("第1步: 测试新增用户")
    public void step1_testInsertUser() {
        SysUserBo user = UserTestDataBuilder.aUser()
            .withRandomData()
            .build();

        ForestResponse<R<Long>> response = apiClient.insertUser(token, user);
        testUserId = response.getResult().getData();
        testUserName = user.getUserName();
    }

    @Test
    @Order(2)
    @DisplayName("第2步: 测试修改用户")
    public void step2_testUpdateUser() {
        if (testUserId == null) return;

        SysUserBo user = new SysUserBo();
        user.setUserId(testUserId); // ✅ 使用共享的 testUserId
        user.setNickName("修改后的昵称");

        ForestResponse<R<Void>> response = apiClient.updateUser(token, user);
        assertTrue(response.isSuccess());
    }

    @Test
    @Order(3)
    @DisplayName("第3步: 测试删除用户")
    public void step3_testDeleteUser() {
        if (testUserId == null) return;

        ForestResponse<R<Void>> response = apiClient.deleteUser(token, testUserId);
        assertTrue(response.isSuccess());
    }
}
```

**不推荐做法** ❌:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("用户管理接口集成测试")
// ❌ 没有指定测试顺序,执行顺序不确定
public class SysUserIntegrationTest extends BaseControllerTest {

    @Test
    @DisplayName("测试删除用户")
    public void testDeleteUser() {
        // ❌ 可能在新增之前执行,导致找不到用户
        Long userId = 12345L; // ❌ 硬编码ID,数据不一定存在
        apiClient.deleteUser(token, userId);
    }

    @Test
    @DisplayName("测试新增用户")
    public void testInsertUser() {
        SysUserBo user = UserTestDataBuilder.aUser()
            .withRandomData()
            .build();

        ForestResponse<R<Long>> response = apiClient.insertUser(token, user);
        Long userId = response.getResult().getData();
        // ❌ 局部变量,其他测试方法无法访问
    }
}
```

**测试顺序管理的重要性:**

- 使用 `@TestMethodOrder(MethodOrderer.OrderAnnotation.class)` 启用顺序控制
- 使用 `@Order` 注解明确指定执行顺序
- 使用 `static` 变量在测试方法间共享数据
- 先创建数据,再修改,最后删除,形成完整的测试链

### 5. 避免依赖测试执行顺序(单元测试)

**推荐做法** ✅:

```java
@SpringBootTest
@Transactional
@DisplayName("用户服务单元测试")
public class SysUserServiceTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Test
    @DisplayName("测试1: 新增用户")
    public void test1_InsertUser() {
        // ✅ 每个测试独立准备数据
        SysUserBo user = UserTestDataBuilder.aUser()
            .withUserName("test_insert_" + System.currentTimeMillis())
            .withRandomData()
            .build();

        Long userId = userService.insertUser(user);
        assertNotNull(userId);

        // ✅ 测试结束自动回滚,不影响其他测试
    }

    @Test
    @DisplayName("测试2: 修改用户")
    public void test2_UpdateUser() {
        // ✅ 独立准备数据,不依赖 test1_InsertUser
        SysUserBo user = UserTestDataBuilder.aUser()
            .withUserName("test_update_" + System.currentTimeMillis())
            .withRandomData()
            .build();

        Long userId = userService.insertUser(user);

        // 修改用户
        user.setUserId(userId);
        user.setNickName("修改后的昵称");

        boolean result = userService.updateUser(user);
        assertTrue(result);

        // ✅ 测试结束自动回滚
    }
}
```

**不推荐做法** ❌:

```java
@SpringBootTest
@Transactional
@DisplayName("用户服务单元测试")
public class SysUserServiceTest extends BaseServiceTest {

    private Long sharedUserId; // ❌ 实例变量,测试间无法共享(@Transactional回滚)

    @Test
    @DisplayName("测试1: 新增用户")
    public void test1_InsertUser() {
        SysUserBo user = UserTestDataBuilder.aUser()
            .withRandomData()
            .build();

        sharedUserId = userService.insertUser(user);
        assertNotNull(sharedUserId);
    }

    @Test
    @DisplayName("测试2: 修改用户")
    public void test2_UpdateUser() {
        // ❌ 依赖 test1_InsertUser 的结果
        // ⚠️ 如果 test1 未执行或失败,此测试也会失败
        if (sharedUserId == null) {
            fail("需要先执行 test1_InsertUser");
        }

        SysUserBo user = new SysUserBo();
        user.setUserId(sharedUserId);
        user.setNickName("修改后的昵称");

        boolean result = userService.updateUser(user);
        assertTrue(result);
    }
}
```

**单元测试独立性的重要性:**

- 每个测试方法应该独立,不依赖其他测试的执行结果
- 每个测试方法自己准备所需的测试数据
- 使用 `@Transactional` 自动回滚,确保测试间互不影响
- 集成测试可以使用测试顺序,单元测试应保持独立

## 常见问题

### 1. 测试数据没有回滚,产生脏数据

**问题原因:**

- 服务层测试缺少 `@Transactional` 注解
- 测试类没有继承 `BaseServiceTest`
- 使用了集成测试方式(真实HTTP请求)但没有清理数据

**解决方案:**

方案1: 服务层测试添加 `@Transactional`:

```java
// ✅ 正确做法
@SpringBootTest
@Transactional // 关键!
@DisplayName("用户服务测试")
public class SysUserServiceTest extends BaseServiceTest {
    // ...测试方法
}
```

方案2: 继承 `BaseServiceTest`:

```java
// ✅ BaseServiceTest 自动包含 @Transactional
@SpringBootTest
@DisplayName("用户服务测试")
public class SysUserServiceTest extends BaseServiceTest {
    // 自动获得 @Transactional 支持
}
```

方案3: 集成测试手动清理数据:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("用户管理接口集成测试")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SysUserIntegrationTest extends BaseControllerTest {

    private static Long testUserId;

    @Test
    @Order(1)
    @DisplayName("测试新增用户")
    public void testInsertUser() {
        // ...新增用户
        testUserId = response.getResult().getData();
    }

    @Test
    @Order(999) // 最后执行
    @DisplayName("清理测试数据")
    public void cleanup() {
        if (testUserId != null) {
            apiClient.deleteUser(token, testUserId);
        }
    }
}
```

方案4: 使用 SQL 清理脚本:

```bash
# 执行清理脚本
mysql -u root -p ry_plus_new < cleanup_test_data.sql
```

### 2. 测试数据唯一性冲突

**问题原因:**

- 多个测试使用相同的用户名、邮箱或手机号
- 测试数据使用硬编码值,并发测试时产生冲突
- 测试失败后数据未清理,再次运行测试时冲突

**解决方案:**

方案1: 使用时间戳保证唯一性:

```java
@Test
@DisplayName("测试新增用户 - 使用时间戳")
public void testInsertUser() {
    long timestamp = System.currentTimeMillis();

    SysUserBo user = new SysUserBo();
    user.setUserName("test_" + timestamp); // ✅ 时间戳保证唯一
    user.setEmail("test" + timestamp + "@example.com"); // ✅ 邮箱唯一
    user.setPhone(TestDataBuilder.randomPhone()); // ✅ 随机手机号

    Long userId = userService.insertUser(user);
    assertNotNull(userId);
}
```

方案2: 使用 TestDataBuilder 生成随机数据:

```java
@Test
@DisplayName("测试新增用户 - 使用TestDataBuilder")
public void testInsertUser() {
    SysUserBo user = new SysUserBo();
    user.setUserName("test_" + System.currentTimeMillis());
    user.setNickName(TestDataBuilder.randomChineseName());
    user.setEmail(TestDataBuilder.randomEmail()); // ✅ 随机邮箱
    user.setPhone(TestDataBuilder.randomPhone()); // ✅ 随机手机号

    Long userId = userService.insertUser(user);
    assertNotNull(userId);
}
```

方案3: 捕获唯一性冲突异常:

```java
@Test
@DisplayName("测试用户名唯一性验证")
public void testUserNameUniqueness() {
    String existingUserName = "superadmin"; // 已存在的用户名

    // 验证唯一性检查
    boolean isUnique = userService.isUserNameUnique(existingUserName, null);
    assertFalse(isUnique, "已存在的用户名应该返回false");

    // 尝试插入重复用户名,应该抛出异常或返回错误
    SysUserBo user = new SysUserBo();
    user.setUserName(existingUserName);
    // ...

    // 验证业务逻辑正确处理了重复用户名
}
```

### 3. 集成测试 Token 失效或权限不足

**问题原因:**

- Token 过期或无效
- 测试用户缺少必要的权限
- 使用了错误的用户登录(如普通用户测试管理员功能)

**解决方案:**

方案1: 使用 superadmin 用户登录:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("用户管理接口集成测试")
public class SysUserIntegrationTest extends BaseControllerTest {

    @Autowired
    private TestLoginHelper testLoginHelper;

    private static String token;

    @BeforeAll
    public static void loginBeforeAll(@Autowired TestLoginHelper testLoginHelper) {
        // ✅ 使用 superadmin 用户,拥有所有权限
        token = testLoginHelper.loginAsSuperAdmin();
        log.info("登录成功,Token: {}", token.substring(0, 30) + "...");
    }

    @Test
    @DisplayName("测试新增用户")
    public void testInsertUser() {
        SysUserBo user = UserTestDataBuilder.aUser()
            .withRandomData()
            .build();

        // 使用 token 发起请求
        ForestResponse<R<Long>> response = apiClient.insertUser(token, user);
        assertTrue(response.isSuccess());
    }
}
```

方案2: 处理权限不足的情况:

```java
@Test
@DisplayName("测试重置用户密码")
public void testResetUserPwd() {
    if (testUserId == null) return;

    SysUserBo user = new SysUserBo();
    user.setUserId(testUserId);
    user.setPassword("newPassword123");

    ForestResponse<R<Void>> response = apiClient.resetUserPwd(token, user);

    // ✅ 处理权限不足的情况
    R<Void> result = response.getResult();
    if (result.getCode() == 403) {
        log.warn("密码重置权限不足(403),跳过验证: {}", result.getMsg());
        return;
    }

    assertEquals(200, result.getCode(), "密码重置应该成功");
}
```

方案3: 刷新 Token:

```java
private String refreshTokenIfNeeded(String oldToken) {
    try {
        // 尝试使用旧 token 发起请求
        ForestResponse<R<Object>> response = apiClient.getUserInfo(oldToken);

        if (response.getResult().getCode() == 401) {
            // Token 过期,重新登录
            log.warn("Token已过期,重新登录");
            return testLoginHelper.loginAsSuperAdmin();
        }

        return oldToken;
    } catch (Exception e) {
        log.error("Token验证失败,重新登录", e);
        return testLoginHelper.loginAsSuperAdmin();
    }
}
```

### 4. 外键约束导致测试数据无法删除

**问题原因:**

- 删除主表数据时,关联表中还有依赖数据
- 数据库外键约束阻止了删除操作
- 删除顺序不正确

**解决方案:**

方案1: 先删除关联表数据:

```java
@Test
@DisplayName("测试删除用户 - 正确处理外键关联")
public void testDeleteUser() {
    // 1. 创建测试用户
    SysUserBo user = UserTestDataBuilder.aUser()
        .withRandomData()
        .build();
    user.setRoleIds(new Long[]{2L}); // 分配角色
    user.setPostIds(new Long[]{4L}); // 分配岗位

    Long userId = userService.insertUser(user);
    assertNotNull(userId);

    // 2. 删除用户(系统会自动删除 sys_user_role 和 sys_user_post 中的关联数据)
    boolean deleteResult = userService.deleteUserById(userId);
    assertTrue(deleteResult);

    // 3. 验证已删除
    SysUserVo deletedUser = userService.getUserById(userId);
    assertNull(deletedUser);

    // ✅ 服务层已正确处理外键关联的删除
}
```

方案2: SQL 清理脚本中先清理关联表:

```sql
-- ✅ 正确的清理顺序

-- 1. 先清理关联表
DELETE FROM sys_user_role
WHERE user_id IN (
    SELECT user_id FROM sys_user
    WHERE user_name LIKE 'test_%'
);

DELETE FROM sys_user_post
WHERE user_id IN (
    SELECT user_id FROM sys_user
    WHERE user_name LIKE 'test_%'
);

-- 2. 再清理主表
DELETE FROM sys_user
WHERE user_name LIKE 'test_%';
```

方案3: 暂时禁用外键约束(仅清理脚本使用):

```sql
-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 清理数据
DELETE FROM sys_user WHERE user_name LIKE 'test_%';
DELETE FROM sys_role WHERE role_key LIKE 'test_role_%';

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;
```

### 5. 测试文件和临时目录未清理

**问题原因:**

- 测试中创建了文件或目录,但测试结束后未清理
- 临时文件路径冲突
- 磁盘空间被测试文件占用

**解决方案:**

方案1: 使用 TestConfig 自动清理:

```java
@Test
@DisplayName("测试文件上传 - 自动清理")
public void testFileUpload() throws Exception {
    // ✅ 使用 TestConfig 提供的临时目录
    String testFilePath = TestConfig.getTempFilePath("test_upload.jpg");
    File testFile = new File(testFilePath);

    // 写入测试数据
    Files.write(testFile.toPath(), "test content".getBytes());
    assertTrue(testFile.exists());

    // 执行文件上传测试...

    // ✅ 测试结束后,baseAfterEach() 会自动调用 TestConfig.cleanTestDirs()
    // 临时文件会被自动删除
}
```

方案2: 手动清理临时文件:

```java
@Test
@DisplayName("测试文件处理 - 手动清理")
public void testFileProcessing() throws Exception {
    File tempFile = null;
    try {
        // 创建临时文件
        tempFile = File.createTempFile("test_", ".tmp");

        // 执行文件处理测试...

    } finally {
        // ✅ 确保在 finally 块中删除临时文件
        if (tempFile != null && tempFile.exists()) {
            tempFile.delete();
        }
    }
}
```

方案3: 使用 @TempDir 注解(JUnit 5):

```java
@Test
@DisplayName("测试文件处理 - 使用@TempDir")
public void testFileProcessing(@TempDir Path tempDir) throws Exception {
    // ✅ JUnit 5 自动创建并清理临时目录
    File testFile = tempDir.resolve("test.txt").toFile();
    Files.write(testFile.toPath(), "test content".getBytes());

    // 执行文件处理测试...

    // ✅ 测试结束后,JUnit 5 会自动删除 tempDir 及其内容
}
```

---

## 总结

RuoYi-Plus 框架提供了完善的测试数据管理体系,从数据生成、隔离到清理,都有成熟的解决方案:

**核心策略:**

1. **服务层测试** - 使用 `@Transactional` 自动回滚,零污染数据库
2. **集成测试** - 使用测试顺序和数据共享,最后清理或使用 SQL 脚本清理
3. **数据生成** - 使用 `TestDataBuilder` 生成真实感的随机数据
4. **数据隔离** - 使用时间戳和唯一标识保证数据唯一性
5. **数据清理** - 遵循命名规范,使用 SQL 脚本批量清理

**最佳实践:**

- 服务层测试必须使用 `@Transactional`
- 测试数据使用统一的命名前缀(`test_`、`测试角色_` 等)
- 使用 `TestDataBuilder` 生成随机数据,避免硬编码
- 集成测试使用 `@Order` 控制执行顺序,使用 static 变量共享数据
- 单元测试保持独立,每个测试自己准备数据
- 测试失败后及时运行 `cleanup_test_data.sql` 清理脏数据

遵循以上最佳实践,可以确保测试数据的可靠性和可维护性,提高测试质量和开发效率。
