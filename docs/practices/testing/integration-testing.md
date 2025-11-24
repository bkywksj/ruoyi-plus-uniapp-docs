# 集成测试最佳实践

## 概述

集成测试是验证多个组件协同工作的关键测试层级。RuoYi-Plus-UniApp 项目提供了完整的集成测试基础设施,支持真实 HTTP 请求测试、多模块协作测试和端到端流程测试。

**核心价值:**

- **端到端验证** - 验证完整业务流程,确保各模块协作正常
- **真实环境模拟** - 使用真实数据库和网络请求,接近生产环境
- **接口契约验证** - 确保 API 接口符合设计规范
- **回归测试保障** - 自动化验证系统功能完整性

**集成测试技术栈:**

| 框架/工具 | 版本 | 说明 |
|---------|------|------|
| Spring Boot Test | 3.5.6 | 测试启动器,集成多种测试工具 |
| MockMvc | - | Spring MVC 测试框架 |
| Forest HTTP | 1.6.5 | 声明式 HTTP 客户端,用于真实请求 |
| TestRestTemplate | - | REST 请求模板 |
| JUnit 5 Jupiter | 5.10+ | 现代化测试框架 |
| TestLoginHelper | - | 测试登录助手 |

---

## 集成测试架构

### 测试分层模型

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              集成测试架构                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     端到端测试 (E2E Test)                            │   │
│   │   - 完整业务流程测试                                                 │   │
│   │   - 真实HTTP请求(Forest/RestTemplate)                               │   │
│   │   - 真实登录Token                                                   │   │
│   │   - 完整CRUD流程验证                                                │   │
│   │   基类: BaseControllerTest + ApiClient                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                        │
│                                    │                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     控制器测试 (Controller Test)                     │   │
│   │   - MockMvc模拟请求                                                 │   │
│   │   - 验证请求/响应格式                                               │   │
│   │   - 验证参数校验                                                    │   │
│   │   - Mock外部依赖                                                    │   │
│   │   基类: BaseControllerTest                                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    ▲                                        │
│                                    │                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     服务层集成测试 (Service Integration)             │   │
│   │   - 多服务协作测试                                                  │   │
│   │   - 数据库事务测试                                                  │   │
│   │   - 缓存集成测试                                                    │   │
│   │   - 消息队列测试                                                    │   │
│   │   基类: BaseServiceTest                                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 测试目录结构

```
ruoyi-admin/src/test/
├── java/
│   └── plus/ruoyi/
│       ├── business/
│       │   └── integration/           # 业务模块集成测试
│       │       ├── SystemFeatureIntegrationTest.java
│       │       ├── HomeIntegrationTest.java
│       │       ├── AiChatIntegrationTest.java
│       │       ├── StatisticsIntegrationTest.java
│       │       └── TableDictIntegrationTest.java
│       ├── system/
│       │   └── integration/           # 系统模块集成测试
│       │       ├── SysUserIntegrationTest.java
│       │       ├── SysRoleIntegrationTest.java
│       │       ├── SysMenuIntegrationTest.java
│       │       ├── SysDeptIntegrationTest.java
│       │       ├── SysPostIntegrationTest.java
│       │       ├── SysConfigIntegrationTest.java
│       │       ├── SysDictIntegrationTest.java
│       │       ├── SysDictTypeIntegrationTest.java
│       │       ├── SysNoticeIntegrationTest.java
│       │       ├── SysTenantIntegrationTest.java
│       │       ├── SysLoginLogIntegrationTest.java
│       │       ├── SysOperlogIntegrationTest.java
│       │       ├── SysUserOnlineIntegrationTest.java
│       │       └── CacheIntegrationTest.java
│       ├── client/                    # API客户端接口
│       │   ├── SystemApiClient.java   # 系统API客户端
│       │   └── BusinessApiClient.java # 业务API客户端
│       └── helper/                    # 测试辅助工具
│           └── TestLoginHelper.java   # 登录助手
└── resources/
    └── application-test.yml           # 测试配置
```

---

## 测试基类详解

### BaseControllerTest - 控制器测试基类

提供 MockMvc 和 HTTP 请求工具方法:

```java
package plus.ruoyi.common.test.base;

import com.dtflys.forest.config.ForestConfiguration;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

/**
 * Controller测试基类
 *
 * 功能:
 * - MockMvc HTTP请求模拟
 * - Forest HTTP客户端配置
 * - JSON序列化/反序列化
 * - 完整的CRUD请求方法
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public abstract class BaseControllerTest extends BaseTest {

    @LocalServerPort  // 获取随机端口
    private int port;

    @Autowired
    protected ForestConfiguration forestConfiguration;

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @BeforeEach
    public void baseSetUp() {
        setUp();
        // 动态设置 baseURL
        String baseUrl = "http://127.0.0.1:" + port;
        forestConfiguration.setVariable("baseUrl", baseUrl);
    }

    /**
     * 执行GET请求
     */
    protected ResultActions performGet(String url) throws Exception {
        return mockMvc.perform(get(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON));
    }

    /**
     * 执行GET请求(带参数)
     */
    protected ResultActions performGet(String url, Object... params) throws Exception {
        return mockMvc.perform(get(url, params)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON));
    }

    /**
     * 执行POST请求
     */
    protected ResultActions performPost(String url, Object body) throws Exception {
        return mockMvc.perform(post(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)));
    }

    /**
     * 执行POST请求(无请求体)
     */
    protected ResultActions performPost(String url) throws Exception {
        return mockMvc.perform(post(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON));
    }

    /**
     * 执行PUT请求
     */
    protected ResultActions performPut(String url, Object body) throws Exception {
        return mockMvc.perform(put(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(body)));
    }

    /**
     * 执行DELETE请求
     */
    protected ResultActions performDelete(String url) throws Exception {
        return mockMvc.perform(delete(url)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON));
    }

    /**
     * 执行DELETE请求(带路径参数)
     */
    protected ResultActions performDelete(String url, Object... params) throws Exception {
        return mockMvc.perform(delete(url, params)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON));
    }

    /**
     * 将对象转换为JSON字符串
     */
    protected String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    /**
     * 将JSON字符串转换为对象
     */
    protected <T> T fromJson(String json, Class<T> clazz) throws Exception {
        return objectMapper.readValue(json, clazz);
    }
}
```

### TestLoginHelper - 测试登录助手

自动获取测试 Token:

```java
package plus.ruoyi.helper;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.stereotype.Component;

/**
 * 测试登录助手 - 用于测试时提供Token
 *
 * 自动调用开发环境的 /getToken 接口获取token,无需手动配置
 *
 * 使用说明:
 * 1. 确保应用运行在开发环境(dev profile)
 * 2. 直接在测试中调用 loginAsSuperAdmin() 或 loginAsUser(userId)
 * 3. 自动获取并返回 Bearer token
 */
@Slf4j
@Component
public class TestLoginHelper {

    @Autowired(required = false)
    private TestRestTemplate restTemplate;

    /**
     * 使用超级管理员账号登录(userId=1)
     *
     * @return 访问令牌(格式: "Bearer xxx")
     */
    public String loginAsSuperAdmin() {
        return loginAsUser(1L);
    }

    /**
     * 使用指定用户ID登录
     *
     * @param userId 用户ID
     * @return 访问令牌(格式: "Bearer xxx")
     */
    public String loginAsUser(Long userId) {
        log.info("通过/getToken接口获取userId={}的token", userId);

        try {
            String url = "/getToken?userId=" + userId;
            String token = restTemplate.getForObject(url, String.class);

            if (token == null || token.isEmpty()) {
                throw new RuntimeException("获取token失败: 返回值为空");
            }

            log.info("获取token成功: {}...", token.substring(0, Math.min(30, token.length())));
            return token;
        } catch (Exception e) {
            log.error("获取token失败: {}", e.getMessage());
            throw new RuntimeException("获取token失败,请确保应用运行在开发环境(dev profile)", e);
        }
    }
}
```

---

## API 客户端定义

### SystemApiClient - 系统 API 客户端

使用 Forest 框架定义声明式 HTTP 客户端:

```java
package plus.ruoyi.client;

import com.dtflys.forest.annotation.*;
import com.dtflys.forest.http.ForestResponse;
import plus.ruoyi.common.core.domain.R;
import plus.ruoyi.common.mybatis.core.page.PageResult;
import plus.ruoyi.system.core.domain.bo.SysUserBo;
import plus.ruoyi.system.core.domain.vo.SysUserInfoVo;
import plus.ruoyi.system.core.domain.vo.SysUserVo;

/**
 * 系统API客户端 - 用于集成测试
 *
 * 使用Forest框架进行HTTP请求,测试真实的REST API接口
 */
@BaseRequest(
    baseURL = "${baseUrl}",
    headers = {
        "Content-Type: application/json"
    }
)
public interface SystemApiClient {

    // ==================== 认证接口 ====================

    /**
     * 用户登录
     */
    @Post("/auth/userLogin")
    ForestResponse<R<AuthTokenVo>> login(@JSONBody String loginBody);

    /**
     * 用户登出
     */
    @Post("/auth/userLogout")
    ForestResponse<R<Void>> logout(@Header("Authorization") String token);

    // ==================== 用户管理接口 ====================

    /**
     * 查询用户详情
     */
    @Get("/system/user/getUser/{userId}")
    ForestResponse<R<SysUserInfoVo>> getUserById(
        @Header("Authorization") String token,
        @Var("userId") Long userId
    );

    /**
     * 分页查询用户列表
     */
    @Get("/system/user/pageUsers")
    ForestResponse<R<PageResult<SysUserVo>>> pageUsers(
        @Header("Authorization") String token,
        @Query("pageNum") Integer pageNum,
        @Query("pageSize") Integer pageSize,
        @Query("userName") String userName
    );

    /**
     * 新增用户
     */
    @Post("/system/user/addUser")
    ForestResponse<R<Long>> insertUser(
        @Header("Authorization") String token,
        @JSONBody SysUserBo user
    );

    /**
     * 修改用户
     */
    @Put("/system/user/updateUser")
    ForestResponse<R<Void>> updateUser(
        @Header("Authorization") String token,
        @JSONBody SysUserBo user
    );

    /**
     * 删除用户
     */
    @Delete("/system/user/deleteUsers/{userIds}")
    ForestResponse<R<Void>> deleteUser(
        @Header("Authorization") String token,
        @Var("userIds") Long userIds
    );

    /**
     * 获取当前登录用户信息
     */
    @Get("/system/user/getUserInfo")
    ForestResponse<R<Object>> getUserInfo(
        @Header("Authorization") String token
    );

    /**
     * 重置用户密码
     */
    @Put("/system/user/resetUserPwd")
    ForestResponse<R<Void>> resetUserPwd(
        @Header("Authorization") String token,
        @Body SysUserBo user
    );

    /**
     * 修改用户状态
     */
    @Put("/system/user/changeUserStatus")
    ForestResponse<R<Void>> changeUserStatus(
        @Header("Authorization") String token,
        @Body SysUserBo user
    );

    // ==================== 更多接口定义 ====================
    // 角色管理、菜单管理、部门管理、字典管理等...
}
```

---

## 集成测试编写规范

### 基本结构

```java
@Slf4j
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")  // 使用开发环境配置
@DisplayName("用户管理接口集成测试")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)  // 按顺序执行
public class SysUserIntegrationTest extends BaseControllerTest {

    @Autowired
    private SystemApiClient apiClient;

    @Autowired
    private TestLoginHelper testLoginHelper;

    private static String token;        // 登录Token
    private static Long testUserId;     // 测试数据ID

    /**
     * 所有测试开始前执行一次 - 登录获取token
     */
    @BeforeAll
    public static void loginBeforeAll(@Autowired TestLoginHelper testLoginHelper) {
        log.info("========== 开始集成测试,模拟登录获取Token ==========");
        token = testLoginHelper.loginAsSuperAdmin();
        log.info("登录成功,Token: {}...", token.substring(0, 30));
    }

    /**
     * 所有测试结束后执行
     */
    @AfterAll
    public static void afterAll() {
        log.info("========== 集成测试结束 ==========");
    }
}
```

### 测试方法规范

```java
@Test
@Order(1)
@DisplayName("测试查询用户详情 - 查询superadmin用户")
public void testGetUserById() {
    log.info("测试查询用户详情");

    // 执行请求
    ForestResponse<R<SysUserInfoVo>> response = apiClient.getUserById(token, 1L);

    // 验证HTTP响应状态
    assertTrue(response.isSuccess(), "HTTP请求应该成功");
    assertEquals(200, response.getStatusCode(), "HTTP状态码应该是200");

    // 验证业务响应
    R<SysUserInfoVo> result = response.getResult();
    assertNotNull(result, "响应结果不应为null");
    assertEquals(200, result.getCode(), "业务状态码应该是200");

    // 验证业务数据
    SysUserInfoVo userInfo = result.getData();
    assertNotNull(userInfo, "用户信息不应为null");

    SysUserVo user = userInfo.getUser();
    assertEquals(1L, user.getUserId(), "用户ID应该是1");
    assertEquals("superadmin", user.getUserName(), "用户名应该是superadmin");

    log.info("查询成功: userId={}, userName={}", user.getUserId(), user.getUserName());
}
```

---

## 完整 CRUD 测试示例

### 用户管理集成测试

```java
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

    @BeforeAll
    public static void loginBeforeAll(@Autowired TestLoginHelper testLoginHelper) {
        token = testLoginHelper.loginAsSuperAdmin();
    }

    // ==================== 查询测试 ====================

    @Test
    @Order(1)
    @DisplayName("测试查询用户详情")
    public void testGetUserById() {
        ForestResponse<R<SysUserInfoVo>> response = apiClient.getUserById(token, 1L);

        assertTrue(response.isSuccess());
        R<SysUserInfoVo> result = response.getResult();
        assertEquals(200, result.getCode());

        SysUserInfoVo userInfo = result.getData();
        assertNotNull(userInfo);
        assertEquals(1L, userInfo.getUser().getUserId());
    }

    @Test
    @Order(2)
    @DisplayName("测试分页查询用户列表")
    public void testPageUsers() {
        ForestResponse<R<PageResult<SysUserVo>>> response =
            apiClient.pageUsers(token, 1, 10, null);

        assertTrue(response.isSuccess());
        R<PageResult<SysUserVo>> result = response.getResult();
        assertEquals(200, result.getCode());

        PageResult<SysUserVo> pageResult = result.getData();
        assertNotNull(pageResult);
        assertTrue(pageResult.getTotal() > 0);
    }

    // ==================== 新增测试 ====================

    @Test
    @Order(3)
    @DisplayName("测试新增用户")
    public void testInsertUser() {
        // 构造测试数据
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

        // 发起请求
        ForestResponse<R<Long>> response = apiClient.insertUser(token, user);

        // 验证
        assertTrue(response.isSuccess());
        R<Long> result = response.getResult();
        assertEquals(200, result.getCode());

        Long userId = result.getData();
        assertNotNull(userId);
        assertTrue(userId > 0);

        // 保存ID供后续测试使用
        testUserId = userId;
        testUserName = user.getUserName();
    }

    // ==================== 修改测试 ====================

    @Test
    @Order(4)
    @DisplayName("测试修改用户")
    public void testUpdateUser() {
        if (testUserId == null) {
            log.warn("未找到测试用户ID,跳过修改测试");
            return;
        }

        SysUserBo user = new SysUserBo();
        user.setUserId(testUserId);
        user.setUserName(testUserName);
        user.setNickName("测试用户(已修改)");
        user.setEmail("test_updated@example.com");
        user.setRoleIds(new Long[]{2L});
        user.setPostIds(new Long[]{4L});

        ForestResponse<R<Void>> response = apiClient.updateUser(token, user);

        assertTrue(response.isSuccess());
        assertEquals(200, response.getResult().getCode());
    }

    // ==================== 删除测试 ====================

    @Test
    @Order(5)
    @DisplayName("测试删除用户")
    public void testDeleteUser() {
        if (testUserId == null) {
            log.warn("未找到测试用户ID,跳过删除测试");
            return;
        }

        ForestResponse<R<Void>> response = apiClient.deleteUser(token, testUserId);

        assertTrue(response.isSuccess());
        assertEquals(200, response.getResult().getCode());
    }

    // ==================== 异常场景测试 ====================

    @Test
    @Order(6)
    @DisplayName("测试查询不存在的用户")
    public void testGetUserNotFound() {
        ForestResponse<R<SysUserInfoVo>> response = apiClient.getUserById(token, 999999L);

        assertTrue(response.isSuccess());
        R<SysUserInfoVo> result = response.getResult();
        assertNotEquals(200, result.getCode());
    }

    @Test
    @Order(7)
    @DisplayName("测试按用户名搜索")
    public void testSearchByUserName() {
        ForestResponse<R<PageResult<SysUserVo>>> response =
            apiClient.pageUsers(token, 1, 10, "admin");

        assertTrue(response.isSuccess());
        R<PageResult<SysUserVo>> result = response.getResult();
        assertEquals(200, result.getCode());

        PageResult<SysUserVo> pageResult = result.getData();
        assertTrue(pageResult.getTotal() > 0);

        boolean hasAdmin = pageResult.getRecords().stream()
            .anyMatch(u -> u.getUserName().contains("admin"));
        assertTrue(hasAdmin);
    }

    @AfterAll
    public static void afterAll() {
        log.info("========== 集成测试结束 ==========");
    }
}
```

---

## MockMvc 集成测试

### 使用 MockMvc 测试控制器

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class UserControllerMockTest extends BaseControllerTest {

    @Test
    @DisplayName("测试获取用户列表")
    public void testGetUserList() throws Exception {
        performGet("/system/user/pageUsers?pageNum=1&pageSize=10")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").exists())
            .andExpect(jsonPath("$.data.records").isArray());
    }

    @Test
    @DisplayName("测试新增用户-参数校验")
    public void testAddUserValidation() throws Exception {
        // 缺少必填参数
        SysUserBo user = new SysUserBo();
        user.setNickName("测试");
        // 缺少 userName

        performPost("/system/user/addUser", user)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(not(200)));
    }

    @Test
    @DisplayName("测试查询用户详情")
    public void testGetUserDetail() throws Exception {
        performGet("/system/user/getUser/1")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.user.userId").value(1))
            .andExpect(jsonPath("$.data.user.userName").value("superadmin"));
    }
}
```

### 带认证的 MockMvc 测试

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class AuthenticatedControllerTest extends BaseControllerTest {

    @Autowired
    private TestLoginHelper testLoginHelper;

    private String token;

    @BeforeEach
    public void login() {
        token = testLoginHelper.loginAsSuperAdmin();
    }

    @Test
    @DisplayName("测试带Token的请求")
    public void testWithToken() throws Exception {
        mockMvc.perform(get("/system/user/getUserInfo")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("测试无Token的请求-应返回401")
    public void testWithoutToken() throws Exception {
        mockMvc.perform(get("/system/user/getUserInfo")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isUnauthorized());
    }
}
```

---

## 数据库集成测试

### 事务回滚测试

```java
@SpringBootTest
@Transactional
@Rollback
@ActiveProfiles("dev")
public class DatabaseIntegrationTest extends BaseServiceTest {

    @Autowired
    private ISysUserService userService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("测试用户新增-事务回滚")
    public void testInsertUser() {
        // 记录原始数量
        long originalCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_user", Long.class);

        // 新增用户
        SysUserBo user = createTestUser();
        Long userId = userService.insertUser(user);
        assertNotNull(userId);

        // 验证数量增加
        long newCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_user", Long.class);
        assertEquals(originalCount + 1, newCount);

        // 测试结束后自动回滚
    }

    @Test
    @DisplayName("测试批量操作")
    public void testBatchOperation() {
        List<SysUserBo> users = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            users.add(createTestUser());
        }

        // 批量新增
        int count = userService.batchInsert(users);
        assertEquals(10, count);

        // 事务回滚后数据不保留
    }

    private SysUserBo createTestUser() {
        SysUserBo user = new SysUserBo();
        user.setUserName("test_" + System.currentTimeMillis());
        user.setNickName("测试用户");
        user.setPassword("test123");
        user.setEmail(TestDataBuilder.randomEmail());
        user.setPhone(TestDataBuilder.randomPhone());
        user.setDeptId(100L);
        user.setStatus("1");
        return user;
    }
}
```

---

## 缓存集成测试

```java
@SpringBootTest
@ActiveProfiles("dev")
@DisplayName("缓存集成测试")
public class CacheIntegrationTest extends BaseControllerTest {

    @Autowired
    private SystemApiClient apiClient;

    @Autowired
    private TestLoginHelper testLoginHelper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static String token;

    @BeforeAll
    public static void loginBeforeAll(@Autowired TestLoginHelper testLoginHelper) {
        token = testLoginHelper.loginAsSuperAdmin();
    }

    @Test
    @DisplayName("测试获取缓存信息")
    public void testGetCacheInfo() {
        ForestResponse<R<Object>> response = apiClient.getCacheInfo(token);

        assertTrue(response.isSuccess());
        R<Object> result = response.getResult();
        assertEquals(200, result.getCode());
        assertNotNull(result.getData());
    }

    @Test
    @DisplayName("测试字典缓存")
    public void testDictCache() {
        // 第一次查询,应该从数据库加载
        ForestResponse<R<Object>> response1 = apiClient.listDictDatasByDictType(token, "sys_user_sex");
        assertTrue(response1.isSuccess());

        // 第二次查询,应该从缓存读取
        ForestResponse<R<Object>> response2 = apiClient.listDictDatasByDictType(token, "sys_user_sex");
        assertTrue(response2.isSuccess());

        // 验证缓存存在
        String cacheKey = "sys_dict:sys_user_sex";
        assertTrue(redisTemplate.hasKey(cacheKey));
    }
}
```

---

## 测试配置

### application-test.yml

```yaml
spring:
  profiles:
    active: dev

  datasource:
    # 测试数据库配置
    url: jdbc:mysql://localhost:3306/ruoyi_test?useUnicode=true&characterEncoding=utf8
    username: root
    password: root

  redis:
    host: localhost
    port: 6379
    database: 1  # 使用独立的测试数据库

# 日志配置
logging:
  level:
    plus.ruoyi: DEBUG
    org.springframework.test: DEBUG

# 测试配置
ruoyi:
  test:
    # 是否启用自动清理测试数据
    auto-cleanup: true
    # 测试数据前缀
    data-prefix: "test_"
```

### Maven 测试配置

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.5.3</version>
            <configuration>
                <argLine>-Dfile.encoding=UTF-8 -XX:+EnableDynamicAgentLoading</argLine>
                <!-- 执行指定环境的测试 -->
                <groups>${profiles.active}</groups>
                <!-- 排除标签 -->
                <excludedGroups>exclude</excludedGroups>
                <!-- 测试报告 -->
                <reportsDirectory>${project.build.directory}/surefire-reports</reportsDirectory>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## 测试执行命令

```bash
# 执行所有集成测试
mvn test -Dtest=*IntegrationTest

# 执行指定模块的集成测试
mvn test -Dtest=SysUserIntegrationTest

# 执行指定测试方法
mvn test -Dtest=SysUserIntegrationTest#testGetUserById

# 跳过集成测试
mvn test -DexcludedGroups=integration

# 只执行集成测试
mvn test -Dgroups=integration

# 生成测试报告
mvn surefire-report:report
```

---

## 最佳实践

### 1. 测试数据隔离

```java
// 好的实践 - 每个测试方法独立数据
@Test
void testA() {
    SysUserBo user = createTestUser();  // 创建独立测试数据
    Long userId = userService.add(user);
    // 测试逻辑...
    userService.delete(userId);  // 清理
}

// 坏的实践 - 测试之间共享数据
private static Long sharedUserId;  // 避免这样做
```

### 2. 使用有序测试

```java
// 好的实践 - 明确测试顺序
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CrudIntegrationTest {

    @Test
    @Order(1)
    void testCreate() { }

    @Test
    @Order(2)
    void testRead() { }

    @Test
    @Order(3)
    void testUpdate() { }

    @Test
    @Order(4)
    void testDelete() { }
}
```

### 3. 验证完整响应

```java
// 好的实践 - 验证HTTP状态和业务状态
@Test
void testApi() {
    ForestResponse<R<Object>> response = apiClient.getData(token);

    // 验证HTTP层
    assertTrue(response.isSuccess(), "HTTP请求应该成功");
    assertEquals(200, response.getStatusCode(), "HTTP状态码应该是200");

    // 验证业务层
    R<Object> result = response.getResult();
    assertNotNull(result, "响应结果不应为null");
    assertEquals(200, result.getCode(), "业务状态码应该是200");

    // 验证数据层
    Object data = result.getData();
    assertNotNull(data, "数据不应为null");
}
```

### 4. 处理权限问题

```java
// 好的实践 - 优雅处理权限不足
@Test
void testResetPassword() {
    ForestResponse<R<Void>> response = apiClient.resetPwd(token, user);

    assertTrue(response.isSuccess());
    R<Void> result = response.getResult();

    // 处理权限不足的情况
    if (result.getCode() == 403) {
        log.warn("权限不足(403),跳过验证: {}", result.getMsg());
        return;
    }

    assertEquals(200, result.getCode());
}
```

### 5. 日志记录

```java
// 好的实践 - 记录关键信息
@Test
void testUserFlow() {
    log.info("开始测试用户管理流程");

    // 新增
    Long userId = createUser();
    log.info("新增成功: userId={}", userId);

    // 查询
    UserVo user = getUser(userId);
    log.info("查询成功: userName={}", user.getUserName());

    // 删除
    deleteUser(userId);
    log.info("删除成功: userId={}", userId);
}
```

---

## 常见问题

### 1. Token 获取失败

**问题:** `获取token失败,请确保应用运行在开发环境`

**解决方案:**

```java
// 方案1: 确保使用dev profile
@SpringBootTest
@ActiveProfiles("dev")
public class MyIntegrationTest { }

// 方案2: 检查/getToken接口是否启用
// application-dev.yml
ruoyi:
  dev:
    token-endpoint: true  # 启用开发环境Token接口
```

### 2. 端口冲突

**问题:** 多个测试类同时运行时端口冲突

**解决方案:**

```java
// 使用随机端口
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class MyIntegrationTest {

    @LocalServerPort
    private int port;  // 自动获取随机端口
}
```

### 3. 测试顺序问题

**问题:** 测试方法执行顺序不确定

**解决方案:**

```java
// 方案1: 使用@Order注解
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class OrderedTest {

    @Test
    @Order(1)
    void first() { }

    @Test
    @Order(2)
    void second() { }
}

// 方案2: 使用方法名排序
@TestMethodOrder(MethodOrderer.MethodName.class)
public class NameOrderedTest {

    @Test
    void test01_create() { }

    @Test
    void test02_read() { }
}
```

### 4. 数据库数据污染

**问题:** 测试数据残留在数据库

**解决方案:**

```java
// 方案1: 使用事务回滚
@SpringBootTest
@Transactional
@Rollback
public class DbTest { }

// 方案2: 手动清理
@AfterEach
void cleanup() {
    jdbcTemplate.execute("DELETE FROM table WHERE name LIKE 'test_%'");
}

// 方案3: 使用@DirtiesContext
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
public class IsolatedTest { }
```

### 5. 测试执行慢

**问题:** 集成测试启动慢

**解决方案:**

```java
// 方案1: 共享Spring上下文
// 多个测试类继承同一基类,Spring会复用上下文

// 方案2: 使用切片测试
@WebMvcTest(UserController.class)  // 只加载Web层
public class UserControllerSliceTest { }

// 方案3: 懒加载
spring.main.lazy-initialization=true
```

---

## 总结

集成测试是保障系统质量的重要手段。通过本文档介绍的最佳实践:

1. **测试基类** - BaseControllerTest 提供 MockMvc 和 HTTP 请求支持
2. **API 客户端** - Forest 声明式 HTTP 客户端简化真实请求测试
3. **登录助手** - TestLoginHelper 自动获取测试 Token
4. **CRUD 测试** - 完整的增删改查测试流程
5. **数据隔离** - 事务回滚保护测试数据
6. **权限处理** - 优雅处理权限不足场景

建议在实际开发中:
- 新接口开发同步编写集成测试
- CI/CD 流程中必须通过集成测试
- 定期检查测试覆盖率
- 保持测试数据独立性
