# 基础服务模块 (base)

基础服务模块提供了系统运行所需的核心基础服务，包括多平台配置管理、支付配置管理、广告配置、账号绑定等功能。

## 模块结构

```
base/
├── controller/          # 控制器层
│   ├── AdController.java
│   ├── BindController.java
│   ├── PaymentController.java
│   └── PlatformController.java
├── service/            # 服务层
│   ├── IAdService.java
│   ├── IBindService.java
│   ├── IPaymentService.java
│   └── IPlatformService.java
├── domain/             # 数据模型
│   ├── entity/         # 实体类
│   ├── vo/            # 视图对象
│   └── bo/            # 业务对象
├── mapper/            # 数据访问层
└── authStrategy/      # 认证策略
```

## 核心功能

### 🏗️ 平台配置管理

支持多种平台的统一配置管理：

- **微信小程序** (mp-weixin)
- **微信公众号** (mp-official-account)
- **支付宝小程序** (mp-alipay)
- **QQ小程序** (mp-qq)
- **其他平台** (mp-jd, mp-kuaishou, mp-lark, mp-baidu, mp-toutiao, mp-xhs)

#### 平台配置实体
```java
@Data
@TableName("b_platform")
public class Platform extends TenantEntity {
    private Long id;           // 平台配置ID
    private String type;       // 平台类型
    private String name;       // 平台名称
    private String appid;      // 应用ID
    private String secret;     // 应用密钥
    private String token;      // 接口Token
    private String aeskey;     // 加密密钥
    private String paymentIds; // 关联支付配置
    private String templateConfigs; // 模板配置
    private String status;     // 状态
}
```

#### 核心接口
```java
public interface IPlatformService extends IBaseService<Platform, PlatformBo, PlatformVo> {
    // 继承基础CRUD操作
}

// 全局平台服务
public interface PlatformService {
    List<PlatformDTO> listPlatformsByType(String type, String tenantId);
    PlatformDTO getPlatformByAppidAndType(String appid, String type);
    PlatformDTO getPlatformByAppid(String appid, String tenantId);
}
```

### 💳 支付配置管理

统一的支付配置管理，支持多种支付方式：

#### 支付配置实体
```java
@Data
@TableName("b_payment") 
public class Payment extends TenantEntity {
    private Long id;            // 支付配置ID
    private String type;        // 商户类型
    private String mchName;     // 商户名称
    private String mchId;       // 商户号
    private String mchKey;      // 商户密钥
    private String apiV3Key;    // APIv3密钥
    private String certPath;    // 证书路径
    private String keyPath;     // 密钥路径
    private String certSerialNo; // 证书序列号
    private String status;      // 状态
}
```

#### 核心服务
```java
public interface PaymentService {
    List<PaymentDTO> listPaymentByType(String type, String tenantId);
    PaymentDTO getByMchId(String mchId);
    PaymentDTO getById(Long paymentId);
    boolean existsValidMchId(String mchId);
    long countPayments();
}
```

### 📱 账号绑定管理

管理用户在不同平台的账号绑定关系：

#### 绑定实体
```java
@Data
@TableName("b_bind")
public class Bind extends TenantEntity {
    private Long id;           // 绑定ID
    private Long userId;       // 用户ID
    private String platformType; // 平台类型
    private String appid;      // 应用ID
    private String unionid;    // 统一标识
    private String openid;     // 平台标识
    private String extraData;  // 扩展数据
}
```

#### 绑定服务
```java
public interface IBindService extends IBaseService<Bind, BindBo, BindVo> {
    /**
     * 根据平台用户信息获取或创建绑定信息
     */
    BindVo getOrCreateBind(PlatformUserInfoVo platformUserInfoVo);
    
    /**
     * 更新绑定信息的用户ID
     */
    void updateBindUserId(BindBo bindBo, Long userId);
}
```

### 📢 广告配置管理

提供广告位和广告内容的统一管理：

#### 广告实体
```java
@Data
@TableName("b_ad")
public class Ad extends TenantEntity {
    private Long id;           // 广告ID
    private String appid;      // 应用ID
    private String adUnitId;   // 广告位ID
    private String adName;     // 广告名称
    private String adType;     // 广告类型
    private String position;   // 投放位置
    private String img;        // 广告图片
    private String description; // 描述
    private String jumpAppid;  // 跳转应用ID
    private String jumpPath;   // 跳转路径
    private String styleConfig; // 样式配置
    private Long sortOrder;    // 排序值
    private String status;     // 状态
}
```

## 认证策略

### 多平台认证架构

基于策略模式实现多平台登录认证：

#### 认证策略接口
```java
public interface IAuthStrategy {
    String BASE_NAME = "AuthStrategy";
    AuthTokenVo login(String body);
}
```

#### 小程序认证策略
```java
@Service("miniapp" + IAuthStrategy.BASE_NAME)
public class MiniappAuthStrategy implements IAuthStrategy {
    
    @Override
    public AuthTokenVo login(String body) {
        // 1. 解析请求参数
        PlatformLoginBody loginBody = JsonUtils.parseObject(body, PlatformLoginBody.class);
        
        // 2. 获取平台用户信息
        PlatformUserInfoVo platformUserInfo = getMiniappUserIdentity(loginBody);
        
        // 3. 加载或创建用户
        SysUserVo user = loadOrCreateUser(platformUserInfo);
        
        // 4. 生成登录令牌
        LoginUser loginUser = loginService.createLoginUser(user);
        loginUser.setPlatform(platformUserInfo.getPlatform());
        loginUser.setAppid(platformUserInfo.getAppid());
        loginUser.setOpenid(platformUserInfo.getOpenid());
        loginUser.setUnionid(platformUserInfo.getUnionid());
        
        // 5. 完成登录
        LoginHelper.login(loginUser, loginParameter);
        
        // 6. 返回认证结果
        AuthTokenVo authTokenVo = new AuthTokenVo();
        authTokenVo.setAccessToken(StpUtil.getTokenValue());
        authTokenVo.setExpireIn(StpUtil.getTokenTimeout());
        return authTokenVo;
    }
}
```

#### 公众号认证策略
```java
@Service("mp" + IAuthStrategy.BASE_NAME)
public class MpAuthStrategy implements IAuthStrategy {
    // 公众号OAuth2.0认证流程实现
    // 支持网页授权登录场景
}
```

### 认证流程

1. **前端授权**：用户在前端完成平台授权，获取授权码
2. **策略选择**：后端根据平台类型自动选择对应认证策略
3. **信息获取**：通过授权码换取用户基本信息
4. **账号绑定**：查找或创建用户账号绑定关系
5. **令牌生成**：生成JWT访问令牌
6. **登录完成**：返回令牌和用户信息

## 手机号绑定

### 微信小程序手机号获取
```java
@PostMapping("/bindPhone")
public R<PhoneBindVo> bindPhone(@RequestBody PhoneBindBo bo) {
    LoginUser loginUser = LoginHelper.getLoginUser();
    wxMaService.switchover(loginUser.getAppid());
    
    try {
        WxMaPhoneNumberInfo phoneInfo = wxMaService.getUserService().getPhoneNumber(bo.getCode());
        String phone = phoneInfo.getPhoneNumber();
        
        // 更新用户手机号
        SysUser sysUser = userMapper.selectById(loginUser.getUserId());
        sysUser.setPhone(phone);
        userMapper.updateById(sysUser);
        
        return R.ok("绑定成功", PhoneBindVo.of(phone));
    } catch (WxErrorException e) {
        return R.fail("获取手机号出错");
    }
}
```

## 数据字典服务

### 支付方式字典
```java
@GetMapping("getPaymentDict")
public R<List<DictItemVo>> getPaymentDict() {
    // 查询所有可用的支付方式
    List<PaymentVo> paymentVoList = paymentService.list(
        PlusLambdaQuery.of(Payment.class)
            .eq(Payment::getStatus, DictEnableStatus.ENABLE.getValue()));
    
    // 构建字典项列表
    List<DictItemVo> dictItems = StreamUtils.toList(paymentVoList, payment ->
        DictItemVo.of(payment.getMchName(), payment.getId().toString(), "success")
    );
    return R.ok(dictItems);
}
```

## 配置管理

### 平台配置热更新
```java
private void reloadPlatformConfig() {
    String tenantId = TenantHelper.getTenantId();
    
    // 重新初始化微信小程序配置
    SpringUtils.getBean(WxMaApplicationRunner.class).initByTenant(tenantId);
    
    // 重新初始化微信公众号配置  
    SpringUtils.getBean(WxMpApplicationRunner.class).initByTenant(tenantId);
    
    // 重新初始化支付配置
    SpringUtils.getBean(PayApplicationRunner.class).initByTenant(tenantId);
}
```

### 支付配置热更新
```java
private void reloadPaymentConfig() {
    String tenantId = TenantHelper.getTenantId();
    SpringUtils.getBean(PayApplicationRunner.class).initByTenant(tenantId);
}
```

## 使用示例

### 配置微信小程序
```java
// 1. 创建平台配置
PlatformBo platformBo = new PlatformBo();
platformBo.setType("mp-weixin");
platformBo.setName("我的小程序");
platformBo.setAppid("wx1234567890");
platformBo.setSecret("your-secret");
platformBo.setStatus("1");
platformService.add(platformBo);

// 2. 配置支付信息
PaymentBo paymentBo = new PaymentBo();
paymentBo.setType("wechat");
paymentBo.setMchName("我的商户");
paymentBo.setMchId("1234567890");
paymentBo.setMchKey("your-mch-key");
paymentBo.setStatus("1");
paymentService.add(paymentBo);
```

### 用户登录认证
```java
// 前端调用登录接口
POST /auth/login
{
  "platform": "miniapp",
  "body": {
    "platform": "mp-weixin",
    "appid": "wx1234567890",
    "platformCode": "授权码"
  }
}

// 返回结果
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "accessToken": "eyJ0eXAiOiJKV1Q...",
    "expireIn": 7200
  }
}
```

## AI助手功能

### 🤖 功能概述

基础服务模块集成了强大的AI助手功能，基于 **LangChain4j** 框架实现，支持多种大语言模型(如 DeepSeek、通义千问、OpenAI、Claude等)，为业务系统提供智能化能力。

**核心特性：**
- **多模型支持** - 灵活切换不同的AI模型提供商
- **多场景应用** - 对话、优化、生成、审核、翻译等场景
- **条件启用** - 通过配置开关控制功能启用
- **权限控制** - 完善的权限校验机制
- **上下文传递** - 支持业务上下文信息传递

### AI服务接口

#### AiController 控制器

```java
@RestController
@RequestMapping("/base/ai")
@ConditionalOnProperty(
    prefix = "langchain4j",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true
)
public class AiController {
    private final IAiService aiService;
}
```

**条件启用说明：**
- 需要在配置文件中设置 `langchain4j.enabled=true`
- 如果配置项不存在，默认启用 (`matchIfMissing = true`)

### 1. AI对话功能

通用的AI对话接口，支持自由对话场景。

#### 接口定义

```java
@PostMapping("/aiChat")
@OpenApi(value = "AI对话")
public R<AiChatVo> aiChat(@Valid @RequestBody AiChatBo bo) {
    return R.ok(aiService.aiChat(bo));
}
```

#### 请求示例

```java
// 创建对话请求
AiChatBo chatBo = new AiChatBo();
chatBo.setMessage("请帮我解释一下什么是微服务架构");
chatBo.setProvider("deepseek");
chatBo.setModelName("deepseek-chat");
chatBo.setTemperature(0.7);
chatBo.setMaxTokens(2000);

// 调用接口
R<AiChatVo> result = aiController.aiChat(chatBo);
AiChatVo response = result.getData();
System.out.println("AI回复: " + response.getMessage());
```

#### HTTP 调用示例

```bash
POST /base/ai/aiChat
Content-Type: application/json

{
  "message": "请帮我解释一下什么是微服务架构",
  "provider": "deepseek",
  "modelName": "deepseek-chat",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

### 2. 文本优化功能

对用户输入的文本进行优化，改善表达和文风。

#### 接口定义

```java
@PostMapping("/aiOptimize")
@OpenApi(value = "AI文本优化")
public R<AiChatVo> aiOptimize(@Valid @RequestBody AiChatBo bo) {
    return R.ok(aiService.aiOptimize(bo));
}
```

#### 使用场景

- 文章润色和改写
- 产品描述优化
- 邮件内容优化
- 广告文案优化

#### 请求示例

```java
AiChatBo optimizeBo = new AiChatBo();
optimizeBo.setMessage("我们公司是做软件开发的，主要业务是给客户做系统");
optimizeBo.setAiFeature("optimize");
optimizeBo.setSystemPrompt("请将下列文本优化为更专业的企业简介");

R<AiChatVo> result = aiController.aiOptimize(optimizeBo);
// 优化后: "我们是一家专业的软件开发公司，致力于为企业客户提供定制化系统解决方案..."
```

### 3. 数据生成功能

根据用户需求生成结构化数据或内容。

#### 接口定义

```java
@PostMapping("/aiGenerate")
@OpenApi(value = "AI数据生成")
public R<AiChatVo> aiGenerate(@Valid @RequestBody AiChatBo bo) {
    return R.ok(aiService.aiGenerate(bo));
}
```

#### 使用场景

- 生成测试数据
- 生成产品描述
- 生成代码片段
- 生成用户画像

#### 请求示例

```java
AiChatBo generateBo = new AiChatBo();
generateBo.setMessage("生成5个用户的测试数据，包含姓名、年龄、邮箱");
generateBo.setAiFeature("generate");

// 传递表单字段信息作为上下文
Map<String, Object> context = new HashMap<>();
context.put("fields", Arrays.asList("name", "age", "email"));
context.put("count", 5);
generateBo.setContext(context);

R<AiChatVo> result = aiController.aiGenerate(generateBo);
```

**生成结果示例：**
```json
[
  {"name": "张三", "age": 28, "email": "zhangsan@example.com"},
  {"name": "李四", "age": 32, "email": "lisi@example.com"},
  {"name": "王五", "age": 25, "email": "wangwu@example.com"},
  {"name": "赵六", "age": 30, "email": "zhaoliu@example.com"},
  {"name": "钱七", "age": 27, "email": "qianqi@example.com"}
]
```

### 4. 内容审核功能

对用户提交的内容进行智能审核，检测违规内容。

#### 接口定义

```java
@PostMapping("/aiReview")
@OpenApi(value = "AI内容审核")
public R<AiChatVo> aiReview(@Valid @RequestBody AiChatBo bo) {
    return R.ok(aiService.aiReview(bo));
}
```

#### 使用场景

- 评论内容审核
- 文章内容审核
- 用户昵称审核
- 敏感词检测

#### 请求示例

```java
AiChatBo reviewBo = new AiChatBo();
reviewBo.setMessage("待审核的用户评论内容...");
reviewBo.setAiFeature("review");
reviewBo.setSystemPrompt("请审核以下内容是否包含违规、敏感、广告等不当信息");

R<AiChatVo> result = aiController.aiReview(reviewBo);
AiChatVo response = result.getData();

// 解析审核结果
if (response.getMessage().contains("通过")) {
    // 内容合规，允许发布
} else {
    // 内容违规，拒绝发布
}
```

### 5. 文本翻译功能

提供多语言翻译服务。

#### 接口定义

```java
@PostMapping("/aiTranslate")
@OpenApi(value = "AI文本翻译")
public R<AiChatVo> aiTranslate(@Valid @RequestBody AiChatBo bo) {
    return R.ok(aiService.aiTranslate(bo));
}
```

#### 使用场景

- 多语言网站内容翻译
- 用户评论翻译
- 产品说明翻译
- 客服消息翻译

#### 请求示例

```java
AiChatBo translateBo = new AiChatBo();
translateBo.setMessage("Hello, how are you today?");
translateBo.setAiFeature("translate");
translateBo.setSystemPrompt("请将以下英文翻译成中文");

R<AiChatVo> result = aiController.aiTranslate(translateBo);
// 翻译结果: "你好，你今天怎么样？"
```

### AI配置说明

#### LangChain4j 配置

在 `application.yml` 中配置 LangChain4j：

```yaml
langchain4j:
  enabled: true  # 启用AI功能

  # DeepSeek 配置
  deepseek:
    api-key: ${DEEPSEEK_API_KEY}
    base-url: https://api.deepseek.com/v1
    model-name: deepseek-chat
    temperature: 0.7
    max-tokens: 2000
    timeout: 60s

  # 通义千问配置
  qianwen:
    api-key: ${QIANWEN_API_KEY}
    base-url: https://dashscope.aliyuncs.com/api/v1
    model-name: qwen-plus
    temperature: 0.7
    max-tokens: 2000

  # OpenAI 配置
  openai:
    api-key: ${OPENAI_API_KEY}
    base-url: https://api.openai.com/v1
    model-name: gpt-3.5-turbo
    temperature: 0.7
    max-tokens: 2000
```

#### 环境变量配置

推荐使用环境变量管理敏感的API密钥：

```bash
# .env 文件
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
QIANWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

#### 权限配置

在菜单管理中配置AI功能权限：

```sql
-- AI对话权限
INSERT INTO sys_menu (menu_name, parent_id, perms)
VALUES ('AI对话', 1000, 'base:ai:chat');
```

### AI功能集成示例

#### 示例1：智能客服回复

```java
@Service
public class CustomerServiceImpl implements ICustomerService {

    @Autowired
    private IAiService aiService;

    @Override
    public String handleCustomerQuestion(String question) {
        AiChatBo chatBo = new AiChatBo();
        chatBo.setMessage(question);
        chatBo.setProvider("deepseek");
        chatBo.setSystemPrompt("你是一个友好的客服助手，请专业地回答客户问题");

        AiChatVo response = aiService.aiChat(chatBo);
        return response.getMessage();
    }
}
```

#### 示例2：文章内容审核

```java
@Service
public class ArticleServiceImpl extends ServiceImpl<ArticleMapper, Article> implements IArticleService {

    @Autowired
    private IAiService aiService;

    @Override
    public boolean publishArticle(Article article) {
        // 使用AI审核文章内容
        AiChatBo reviewBo = new AiChatBo();
        reviewBo.setMessage(article.getContent());
        reviewBo.setAiFeature("review");
        reviewBo.setSystemPrompt("请审核文章内容是否合规，检查是否包含违规、敏感信息");

        AiChatVo reviewResult = aiService.aiReview(reviewBo);

        // 判断审核结果
        if (reviewResult.getMessage().contains("违规")) {
            throw new ServiceException("文章内容审核未通过: " + reviewResult.getMessage());
        }

        // 审核通过，发布文章
        article.setStatus("published");
        return this.updateById(article);
    }
}
```

#### 示例3：数据智能生成

```java
@Service
public class DataGeneratorService {

    @Autowired
    private IAiService aiService;

    @Override
    public List<User> generateTestUsers(int count) {
        AiChatBo generateBo = new AiChatBo();
        generateBo.setMessage(
            String.format("生成%d个用户测试数据，包含真实的中文姓名、邮箱、手机号", count)
        );
        generateBo.setAiFeature("generate");

        // 传递数据结构上下文
        Map<String, Object> context = new HashMap<>();
        context.put("format", "json");
        context.put("fields", Arrays.asList("name", "email", "phone", "age", "gender"));
        generateBo.setContext(context);

        AiChatVo response = aiService.aiGenerate(generateBo);

        // 解析生成的JSON数据
        return JsonUtils.parseArray(response.getMessage(), User.class);
    }
}
```

## 数据访问层架构

### DAO模式说明

基础服务模块采用 **DAO（Data Access Object）** 模式，将数据访问逻辑与业务逻辑分离，提供更清晰的架构层次。

#### 架构层次

```
Controller 层
    ↓
Service 层
    ↓
DAO 层 (IBaseDao)
    ↓
Entity 层 (数据库实体)
```

#### IBaseDao 接口

所有 DAO 接口都继承自 `IBaseDao`，提供统一的 CRUD 操作：

```java
public interface IBaseDao<T> {
    // 插入
    boolean insert(T entity);
    boolean insertBatch(Collection<T> entityList);

    // 更新
    boolean updateById(T entity);
    boolean updateBatchById(Collection<T> entityList);

    // 删除
    boolean deleteById(Serializable id);
    boolean deleteBatchIds(Collection<?> idList);

    // 查询
    T selectById(Serializable id);
    List<T> selectBatchIds(Collection<? extends Serializable> idList);
    List<T> selectList(Wrapper<T> queryWrapper);
    T selectOne(Wrapper<T> queryWrapper);
    Long selectCount(Wrapper<T> queryWrapper);

    // 分页查询
    Page<T> selectPage(Page<T> page, Wrapper<T> queryWrapper);
}
```

### 平台配置DAO (IPlatformDao)

```java
public interface IPlatformDao extends IBaseDao<Platform> {

    /**
     * 根据业务对象构建查询条件
     */
    PlusLambdaQuery<Platform> buildQueryWrapper(PlatformBo bo);

    /**
     * 根据appid查询平台配置
     */
    Platform getByAppid(String appid);

    /**
     * 根据appid和平台类型查询平台配置
     */
    Platform getByAppidAndType(String appid, String type, String status);

    /**
     * 根据平台类型和状态查询配置列表
     */
    List<Platform> listByTypeAndStatus(String type, String status);
}
```

### 支付配置DAO (IPaymentDao)

```java
public interface IPaymentDao extends IBaseDao<Payment> {

    /**
     * 根据商户号查询支付配置
     */
    Payment getByMchId(String mchId, String status);

    /**
     * 根据支付类型和状态查询配置列表
     */
    List<Payment> listByTypeAndStatus(String type, String status);

    /**
     * 根据状态统计配置数量
     */
    long countByStatus(String status);

    /**
     * 根据商户号查询是否存在(排除指定ID)
     */
    boolean existsByMchId(String mchId, Long excludeId);

    /**
     * 根据商户号和状态判断是否存在
     */
    boolean existsByMchIdAndStatus(String mchId, String status);

    /**
     * 根据状态查询配置列表
     */
    List<Payment> listByStatus(String status);
}
```

### DAO层使用示例

```java
@Service
public class PlatformServiceImpl implements IPlatformService {

    @Autowired
    private IPlatformDao platformDao;

    @Override
    public PlatformVo getWeixinPlatform(String appid) {
        // 使用DAO查询微信小程序配置
        Platform platform = platformDao.getByAppidAndType(
            appid,
            "mp-weixin",
            DictEnableStatus.ENABLE.getValue()
        );

        if (platform == null) {
            throw new ServiceException("未找到微信小程序配置");
        }

        return BeanUtil.toBean(platform, PlatformVo.class);
    }

    @Override
    public List<PlatformVo> listActivePlatforms(String type) {
        // 使用DAO查询所有启用的平台配置
        List<Platform> platforms = platformDao.listByTypeAndStatus(
            type,
            DictEnableStatus.ENABLE.getValue()
        );

        return BeanUtil.copyToList(platforms, PlatformVo.class);
    }
}
```

## 高级功能

### 多租户支持

基础服务模块所有实体类都继承自 `TenantEntity`，自动支持多租户数据隔离。

#### 租户实体基类

```java
@Data
public class TenantEntity extends BaseEntity {

    /**
     * 租户ID
     */
    @TableField(value = "tenant_id")
    private String tenantId;

    /**
     * 创建部门
     */
    @TableField(value = "create_dept")
    private Long createDept;
}
```

#### 自动租户隔离

```java
// 查询时自动添加租户条件
Platform platform = platformDao.selectById(platformId);
// SQL: SELECT * FROM b_platform WHERE id = ? AND tenant_id = '当前租户ID'

// 新增时自动填充租户ID
Platform newPlatform = new Platform();
newPlatform.setType("mp-weixin");
platformDao.insert(newPlatform);
// SQL: INSERT INTO b_platform (..., tenant_id) VALUES (..., '当前租户ID')
```

### 数据缓存机制

#### Redis缓存配置

平台配置和支付配置支持Redis缓存，提升查询性能：

```java
@Service
public class PlatformCacheService {

    private static final String PLATFORM_CACHE_KEY = "platform:config:";
    private static final Duration CACHE_EXPIRE = Duration.ofHours(1);

    @Autowired
    private RedisTemplate<String, Platform> redisTemplate;

    @Autowired
    private IPlatformDao platformDao;

    public Platform getPlatformWithCache(String appid) {
        String cacheKey = PLATFORM_CACHE_KEY + appid;

        // 尝试从缓存获取
        Platform platform = redisTemplate.opsForValue().get(cacheKey);
        if (platform != null) {
            return platform;
        }

        // 缓存未命中，查询数据库
        platform = platformDao.getByAppid(appid);
        if (platform != null) {
            // 写入缓存
            redisTemplate.opsForValue().set(cacheKey, platform, CACHE_EXPIRE);
        }

        return platform;
    }

    public void clearPlatformCache(String appid) {
        String cacheKey = PLATFORM_CACHE_KEY + appid;
        redisTemplate.delete(cacheKey);
    }
}
```

### 事件监听机制

#### 配置变更事件

```java
@Component
public class PlatformConfigEventListener {

    @Autowired
    private WxMaApplicationRunner wxMaRunner;

    @Autowired
    private WxMpApplicationRunner wxMpRunner;

    /**
     * 监听平台配置变更事件
     */
    @EventListener
    public void handlePlatformConfigChange(PlatformConfigChangeEvent event) {
        String tenantId = event.getTenantId();
        String platformType = event.getPlatformType();

        // 根据平台类型重新初始化配置
        if ("mp-weixin".equals(platformType)) {
            wxMaRunner.initByTenant(tenantId);
        } else if ("mp-official-account".equals(platformType)) {
            wxMpRunner.initByTenant(tenantId);
        }

        log.info("平台配置已更新: tenantId={}, platformType={}", tenantId, platformType);
    }
}
```

#### 自定义事件

```java
@Data
public class PlatformConfigChangeEvent extends ApplicationEvent {

    private String tenantId;
    private String platformType;
    private String action; // create, update, delete

    public PlatformConfigChangeEvent(Object source, String tenantId, String platformType, String action) {
        super(source);
        this.tenantId = tenantId;
        this.platformType = platformType;
        this.action = action;
    }
}

// 发布事件
@Service
public class PlatformServiceImpl implements IPlatformService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public boolean updatePlatform(PlatformBo bo) {
        boolean result = platformDao.updateById(BeanUtil.toBean(bo, Platform.class));

        if (result) {
            // 发布配置变更事件
            eventPublisher.publishEvent(
                new PlatformConfigChangeEvent(this, TenantHelper.getTenantId(), bo.getType(), "update")
            );
        }

        return result;
    }
}
```

## 常见问题

### Q1: 平台配置不生效？

**问题原因:**
- 配置状态未启用
- 租户ID不匹配
- 缓存未更新
- appid配置错误

**解决方案:**

```java
// 1. 检查配置状态
Platform platform = platformDao.getByAppid(appid);
if (!"1".equals(platform.getStatus())) {
    throw new ServiceException("平台配置未启用");
}

// 2. 检查租户ID
String currentTenantId = TenantHelper.getTenantId();
if (!currentTenantId.equals(platform.getTenantId())) {
    throw new ServiceException("平台配置不属于当前租户");
}

// 3. 清除缓存重新加载
wxMaApplicationRunner.initByTenant(currentTenantId);
```

### Q2: 第三方登录失败？

**问题原因:**
- appid或secret配置错误
- 授权码已过期
- 平台配置未找到
- 网络连接问题

**解决方案:**

```java
try {
    // 使用授权码登录
    AuthTokenVo authToken = authStrategy.login(loginBody);
} catch (WxErrorException e) {
    // 微信接口调用失败
    log.error("微信登录失败: errCode={}, errMsg={}", e.getError().getErrorCode(), e.getError().getErrorMsg());

    if (e.getError().getErrorCode() == 40029) {
        throw new ServiceException("授权码无效或已过期，请重新授权");
    } else if (e.getError().getErrorCode() == 40013) {
        throw new ServiceException("appid配置错误");
    } else {
        throw new ServiceException("登录失败: " + e.getError().getErrorMsg());
    }
}
```

### Q3: 支付配置重复？

**问题原因:**
- 同一商户号被多次配置
- 未进行唯一性校验

**解决方案:**

```java
@Service
public class PaymentServiceImpl implements IPaymentService {

    @Override
    public boolean addPayment(PaymentBo bo) {
        // 检查商户号是否已存在
        boolean exists = paymentDao.existsByMchIdAndStatus(
            bo.getMchId(),
            DictEnableStatus.ENABLE.getValue()
        );

        if (exists) {
            throw new ServiceException("该商户号已存在有效配置");
        }

        Payment payment = BeanUtil.toBean(bo, Payment.class);
        return paymentDao.insert(payment);
    }

    @Override
    public boolean updatePayment(PaymentBo bo) {
        // 检查商户号是否与其他记录重复(排除当前记录)
        boolean exists = paymentDao.existsByMchId(bo.getMchId(), bo.getId());

        if (exists) {
            throw new ServiceException("该商户号已被其他配置使用");
        }

        Payment payment = BeanUtil.toBean(bo, Payment.class);
        return paymentDao.updateById(payment);
    }
}
```

### Q4: AI功能无法使用？

**问题原因:**
- LangChain4j未启用
- API密钥配置错误
- 网络连接问题
- 权限未配置

**解决方案:**

```yaml
# 1. 确保配置已启用
langchain4j:
  enabled: true  # 必须为 true

# 2. 检查API密钥
deepseek:
  api-key: ${DEEPSEEK_API_KEY}  # 确保环境变量已设置

# 3. 测试网络连接
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'

# 4. 配置权限
INSERT INTO sys_menu (menu_name, perms) VALUES ('AI对话', 'base:ai:chat');
```

## 故障排查

### 日志配置

#### 启用详细日志

```yaml
logging:
  level:
    plus.ruoyi.business.base: DEBUG
    plus.ruoyi.business.base.controller: DEBUG
    plus.ruoyi.business.base.service: DEBUG
    plus.ruoyi.business.base.dao: DEBUG
    plus.ruoyi.business.base.authStrategy: DEBUG
```

### 常见错误及解决方案

#### 错误1: 平台配置未找到

```
错误信息: ServiceException: 未找到平台配置
```

**排查步骤:**
1. 检查数据库中是否存在配置记录
2. 检查appid是否正确
3. 检查配置状态是否启用
4. 检查租户ID是否匹配

```java
// 调试代码
Platform platform = platformDao.selectOne(
    new LambdaQueryWrapper<Platform>()
        .eq(Platform::getAppid, appid)
);
System.out.println("查询到的平台配置: " + JsonUtils.toJsonString(platform));
```

#### 错误2: 认证策略未找到

```
错误信息: No bean named 'miniappAuthStrategy' available
```

**排查步骤:**
1. 检查认证策略类是否标注 `@Service` 注解
2. 检查策略名称是否正确
3. 检查Spring扫描路径是否包含策略类

```java
// 正确的策略命名
@Service("miniapp" + IAuthStrategy.BASE_NAME)  // miniappAuthStrategy
public class MiniappAuthStrategy implements IAuthStrategy {
    // ...
}
```

#### 错误3: 多租户数据泄露

```
错误信息: 查询到了其他租户的数据
```

**排查步骤:**
1. 检查实体类是否继承 `TenantEntity`
2. 检查租户拦截器是否生效
3. 检查数据表是否包含 `tenant_id` 字段

```java
// 确保实体类正确继承
@TableName("b_platform")
public class Platform extends TenantEntity {
    // 自动支持租户隔离
}
```

## API参考

### Controller接口清单

| 控制器 | 路径 | 功能说明 |
|--------|------|----------|
| PlatformController | `/base/platform/*` | 平台配置管理 |
| PaymentController | `/base/payment/*` | 支付配置管理 |
| BindController | `/base/bind/*` | 账号绑定管理 |
| AdController | `/base/ad/*` | 广告配置管理 |
| AiController | `/base/ai/*` | AI助手功能 |

### 核心接口详情

#### 平台配置接口

```java
GET    /base/platform/list          查询平台配置列表
GET    /base/platform/{id}          查询平台配置详情
POST   /base/platform               新增平台配置
PUT    /base/platform               更新平台配置
DELETE /base/platform/{ids}         删除平台配置
GET    /base/platform/dict          获取平台字典
```

#### 支付配置接口

```java
GET    /base/payment/list           查询支付配置列表
GET    /base/payment/{id}           查询支付配置详情
POST   /base/payment                新增支付配置
PUT    /base/payment                更新支付配置
DELETE /base/payment/{ids}          删除支付配置
GET    /base/payment/dict           获取支付方式字典
```

#### 账号绑定接口

```java
GET    /base/bind/list              查询绑定列表
POST   /base/bind/bindPhone         绑定手机号
POST   /base/bind/unbind            解除绑定
```

#### AI助手接口

```java
POST   /base/ai/aiChat              AI对话
POST   /base/ai/aiOptimize          文本优化
POST   /base/ai/aiGenerate          数据生成
POST   /base/ai/aiReview            内容审核
POST   /base/ai/aiTranslate         文本翻译
```

## 最佳实践

### 📋 配置管理
- 敏感信息（如密钥）使用环境变量或加密存储
- 支持配置热更新，通过事件机制通知相关服务
- 按租户隔离配置，确保数据安全
- 使用Redis缓存常用配置，提升性能

### 🔐 安全考虑
- 登录令牌设置合理的过期时间(建议2小时)
- 敏感API添加 `@SaCheckPermission` 权限校验
- 支付配置访问权限严格控制
- AI接口调用添加频率限制，防止滥用
- API密钥使用环境变量管理，不提交到代码仓库

### 🚀 性能优化
- 平台配置和支付配置使用Redis缓存，有效期1小时
- 异步处理配置更新，使用Spring事件机制
- 合理使用数据库索引(appid、mchId等字段)
- AI接口调用使用连接池，复用HTTP连接
- 批量查询使用 `selectBatchIds` 而不是循环查询

### 🔧 扩展建议
- 新增平台时，实现对应的 `IAuthStrategy` 认证策略
- 支付方式扩展遵循统一的 DAO 接口规范
- 配置项变更通过 `ApplicationEventPublisher` 发布事件
- AI功能扩展可添加新的服务方法，保持接口一致性
- 建议为每个租户配置独立的平台和支付配置
