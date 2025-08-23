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

## 最佳实践

### 📋 配置管理
- 敏感信息（如密钥）加密存储
- 支持配置热更新，无需重启服务
- 按租户隔离配置，避免数据混淆

### 🔐 安全考虑
- 登录令牌设置合理的过期时间
- 敏感API添加权限校验
- 支付配置访问权限严格控制

### 🚀 性能优化
- 平台配置缓存，减少数据库查询
- 异步处理配置更新，提升响应速度
- 合理使用数据库索引

### 🔧 扩展建议
- 新增平台时，实现对应的认证策略
- 支付方式扩展遵循统一接口规范
- 配置项变更通过事件机制通知相关服务
