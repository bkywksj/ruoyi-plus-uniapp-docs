# 支付模块 (pay)

## 概述

RuoYi-Plus 支付模块 (`ruoyi-common-pay`) 是一个统一的支付服务解决方案，提供了完整的支付、退款、回调处理功能。模块采用策略模式设计，支持多种支付方式的无缝集成。

### 核心特性

- 🚀 **统一接口**: 提供统一的支付、退款、查询接口
- 💳 **多支付方式**: 支持微信支付、支付宝、余额支付等
- 🏢 **多租户支持**: 完整的多租户配置管理
- 🔒 **安全可靠**: 完整的签名验证和回调处理
- 📊 **配置管理**: 智能化的配置初始化和管理
- 🎯 **事件驱动**: 支付成功事件发布机制

### 支持的支付方式

| 支付方式 | 支持类型 | Handler类 |
|---------|---------|-----------|
| 微信支付 | JSAPI、NATIVE、APP、H5 | `WxPayHandler` |
| 支付宝 | WAP、PAGE、APP | `AliPayHandler` |
| 余额支付 | 账户余额 | `BalancePayHandler` |

## 快速开始

### 1. 添加依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-pay</artifactId>
</dependency>
```

### 2. 基础使用

```java
@Autowired
private PayService payService;

// 发起支付
PayRequest request = PayRequest.createWxJsapiRequest(
    appId, mchId, "商品描述", outTradeNo, 
    new BigDecimal("0.01"), openId, clientIp
);
PayResponse response = payService.pay(DictPaymentMethod.WECHAT, request);

// 申请退款
RefundRequest refundRequest = RefundRequest.createWxRefundRequest(
    appId, mchId, outTradeNo, outRefundNo, 
    totalFee, refundFee, "退款原因"
);
RefundResponse refundResponse = payService.refund(DictPaymentMethod.WECHAT, refundRequest);
```

## 架构设计

### 整体架构

```mermaid
graph TB
    A[Controller层] --> B[PayService统一服务]
    B --> C{支付方式路由}
    C --> D[WxPayHandler]
    C --> E[AliPayHandler] 
    C --> F[BalancePayHandler]
    D --> G[微信支付API]
    E --> H[支付宝API]
    F --> I[余额业务逻辑]
    
    J[PayConfigManager] --> K[配置初始化]
    K --> L[WxPayInitializer]
    K --> M[AliPayInitializer]
    
    N[回调处理] --> B
    B --> O[PaySuccessEvent]
```

### 核心组件

#### PayService - 统一服务入口
负责路由不同支付方式到对应的处理器，提供统一的调用接口。

```java
@Service
public class PayService {
    // 根据支付方式自动路由到对应处理器
    public PayResponse pay(DictPaymentMethod paymentMethod, PayRequest request);
    public RefundResponse refund(DictPaymentMethod paymentMethod, RefundRequest request);
    public NotifyResponse handleNotify(DictPaymentMethod paymentMethod, NotifyRequest request);
}
```

#### PayHandler - 支付处理器接口
定义了支付处理器的标准接口，所有支付方式都需要实现此接口。

```java
public interface PayHandler {
    DictPaymentMethod getPaymentMethod();
    PayResponse pay(PayRequest request);
    RefundResponse refund(RefundRequest request);
    PayResponse queryPayment(String outTradeNo, String appid);
    RefundResponse queryRefund(String outRefundNo, String appid);
    NotifyResponse handleNotify(NotifyRequest request);
}
```

#### PayConfigManager - 配置管理器
管理所有支付配置，支持多租户场景下的配置隔离。

```java
@Service
public class PayConfigManager {
    // 配置格式: {tenantId}:{paymentMethod}:{appid}
    public PayConfig getConfig(String tenantId, String paymentMethod, String appid);
    public void registerConfig(PayConfig config);
    public List<PayConfig> getConfigsByTenant(String tenantId);
}
```

## 支付方式详解

### 微信支付

#### 支持类型
- **JSAPI**: 微信小程序/公众号支付
- **NATIVE**: 扫码支付
- **APP**: APP支付
- **H5**: 手机网页支付

#### API版本自动识别

系统会根据配置自动选择使用微信支付 **v2** 或 **v3** API：

- **v2 API**: 仅配置 `mchKey`（商户密钥）时自动使用 v2
- **v3 API**: 配置了 `apiV3Key`、`certSerialNo` 和证书时自动使用 v3

#### 配置要求

**v2 API 配置（传统模式）**
```java
// 必需配置
String appId = "wx1234567890123456";
String mchId = "1234567890";
String mchKey = "your_wx_api_key";  // v2 商户密钥

// 可选配置 - 退款需要
String certPath = "cert/apiclient_cert.p12";
```

**v3 API 配置（平台证书模式）⭐ 推荐**
```java
// 必需配置
String appId = "wx1234567890123456";
String mchId = "1234567890";
String apiV3Key = "your_api_v3_key";          // v3 密钥
String certSerialNo = "your_cert_serial_no";  // 证书序列号

// 证书配置（支持多种方式）
String certPath = "cert/apiclient_cert.pem";  // 商户证书
String keyPath = "cert/apiclient_key.pem";    // 商户私钥

// 平台证书路径（用于验证回调签名）
String platformCertPath = "cert/wechatpay_platform.pem";
```

**v3 API 配置（公钥模式）⭐ 新功能**
```java
// 必需配置
String appId = "wx1234567890123456";
String mchId = "1234567890";
String apiV3Key = "your_api_v3_key";
String certSerialNo = "your_cert_serial_no";

// 公钥ID（V3 公钥模式专用，格式 PUB_KEY_ID_xxx）
String publicKeyId = "PUB_KEY_ID_0123456789...";

// 证书配置
String certPath = "cert/apiclient_cert.pem";
String keyPath = "cert/apiclient_key.pem";

// 使用公钥文件（系统会自动识别）
String platformCertPath = "cert/wechatpay_public_key.pem";
// 或直接配置公钥内容
String platformCertPath = "-----BEGIN PUBLIC KEY-----\nMIIBIj...\n-----END PUBLIC KEY-----";
```

::: tip publicKeyId 公钥ID 字段（V3 公钥模式专用）
微信支付 V3「公钥模式」验签需要一个**独立的公钥ID**（格式 `PUB_KEY_ID_xxx`），它与「证书序列号」`certSerialNo` 是两个不同的标识。早期实现误用证书序列号冒充公钥ID，会导致公钥模式下回调验签失败，因此新增了独立的 `publicKeyId` 字段贯通全链路（`b_payment` 表新增 `public_key_id` 列，`Payment` / `PaymentBo` / `PaymentVo` / `PaymentDTO` / `PayConfig` 均补充该字段）。

- **获取路径**：微信商户平台 → 账户中心 → API 安全 → 微信支付公钥
- **回退兼容**：`WxPayConfigBuilder` 构建配置时优先使用真实 `publicKeyId`；若该字段为空，则回退使用 `certSerialNo` 并打印告警，保证旧配置向后兼容
- **适用范围**：仅「微信支付公钥模式」需要填写，「平台证书模式」可留空
:::

#### 证书配置灵活性 🔧

系统支持多种证书配置方式：

**1. 文件路径模式**
```java
// Classpath 资源路径
String certPath = "classpath:cert/apiclient_cert.pem";

// 文件系统绝对路径
String certPath = "/data/cert/apiclient_cert.pem";
```

**2. PEM 内容直接配置** ⭐ 推荐
```java
// 直接配置 PEM 格式证书内容（无需文件）
String certPath = """
-----BEGIN CERTIFICATE-----
MIIFazCCBFOgAwIBAgISBKSq...
-----END CERTIFICATE-----
""";
```

**3. 开发/生产环境分离**
```java
// 开发环境证书
String devCertPath = "cert/dev/apiclient_cert.pem";
String devKeyPath = "cert/dev/apiclient_key.pem";
String devPlatformCertPath = "cert/dev/wechatpay_platform.pem";

// 生产环境证书
String certPath = "cert/prod/apiclient_cert.pem";
String keyPath = "cert/prod/apiclient_key.pem";
String platformCertPath = "cert/prod/wechatpay_platform.pem";

// 系统会根据 spring.profiles.active 自动选择
```

#### 公钥模式智能识别

系统会自动识别是使用**平台证书**还是**公钥模式**：

**识别依据：**
1. **文件名检测**：包含 `public`、`pubkey`、`pub_key`、`publickey` 关键词
2. **内容检测**：文件内容以 `-----BEGIN PUBLIC KEY-----` 开头

**使用场景：**
- ✅ 轻量级部署：公钥文件体积更小
- ✅ 证书更新简化：公钥相对稳定，无需频繁更新
- ✅ 安全性要求：满足基本的签名验证需求

::: warning 注意
公钥模式仅用于回调验证，不影响支付、退款等业务功能。如有条件，建议使用完整的平台证书模式。
:::

#### 使用示例

**JSAPI支付 (小程序/公众号)**
```java
PayRequest request = PayRequest.createWxJsapiRequest(
    appId, mchId, "商品描述", outTradeNo, 
    new BigDecimal("0.01"), openId, clientIp
);
PayResponse response = payService.pay(DictPaymentMethod.WECHAT, request);

// 返回的payInfo可直接用于前端调起支付
Map<String, String> payInfo = response.getPayInfo();
```

**NATIVE支付 (扫码)**
```java
PayRequest request = PayRequest.createWxNativeRequest(
    appId, mchId, "商品描述", outTradeNo, 
    new BigDecimal("0.01"), clientIp
);
PayResponse response = payService.pay(DictPaymentMethod.WECHAT, request);

// 获取二维码
String qrCodeBase64 = response.getQrCodeBase64();
String codeUrl = response.getCodeUrl();
```

**H5支付 (手机网页)**
```java
PayRequest request = PayRequest.createWxH5Request(
    appId, mchId, "商品描述", outTradeNo, 
    new BigDecimal("0.01"), clientIp, sceneInfo
);
PayResponse response = payService.pay(DictPaymentMethod.WECHAT, request);

// 跳转到支付页面
String payUrl = response.getPayUrl();
```

### 支付宝

#### 支持类型
- **WAP**: 手机网站支付
- **PAGE**: 电脑网站支付
- **APP**: APP支付

#### 配置要求
```java
// 必需配置
String appId = "2021000000000000";
String privateKey = "your_private_key";
String alipayPublicKey = "alipay_public_key";

// 证书模式 (推荐)
String certPath = "cert/appCertPublicKey.crt";
String keyPath = "cert/alipayCertPublicKey_RSA2.crt";
```

#### 使用示例

**WAP支付 (手机网站)**
```java
PayRequest request = PayRequest.createAlipayWapRequest(
    appId, "商品描述", outTradeNo, 
    new BigDecimal("0.01"), returnUrl
);
PayResponse response = payService.pay(DictPaymentMethod.ALIPAY, request);

// 返回支付表单，直接输出到页面即可
String payForm = response.getPayForm();
```

**PAGE支付 (电脑网站)**
```java
PayRequest request = PayRequest.createAlipayPageRequest(
    appId, "商品描述", outTradeNo, 
    new BigDecimal("0.01"), returnUrl
);
PayResponse response = payService.pay(DictPaymentMethod.ALIPAY, request);

String payForm = response.getPayForm();
```

**APP支付**
```java
PayRequest request = PayRequest.createAlipayAppRequest(
    appId, "商品描述", outTradeNo, new BigDecimal("0.01")
);
PayResponse response = payService.pay(DictPaymentMethod.ALIPAY, request);

// 返回APP调起参数
String payInfo = response.getPayUrl();
```

### 余额支付

余额支付是系统内置的支付方式，无需第三方接口，适合积分、储值卡等场景。

```java
PayRequest request = PayRequest.createBalanceRequest(
    outTradeNo, new BigDecimal("10.00"), "余额支付", clientIp
);
PayResponse response = payService.pay(DictPaymentMethod.BALANCE, request);
```

## 退款处理

### 微信退款
```java
RefundRequest request = RefundRequest.createWxRefundRequest(
    appId, mchId, outTradeNo, outRefundNo, 
    totalFee, refundFee, "用户申请退款"
);
RefundResponse response = payService.refund(DictPaymentMethod.WECHAT, request);
```

### 支付宝退款
```java
RefundRequest request = RefundRequest.createAlipayRefundRequest(
    appId, outTradeNo, outRefundNo, refundFee, "退款原因"
);
RefundResponse response = payService.refund(DictPaymentMethod.ALIPAY, request);
```

### 余额退款
```java
RefundRequest request = RefundRequest.createBalanceRefundRequest(
    outTradeNo, outRefundNo, refundFee, "余额退款"
);
RefundResponse response = payService.refund(DictPaymentMethod.BALANCE, request);
```

## 回调处理

### 回调地址规则

系统自动生成回调地址，格式为：
```text
{baseApi}/payment/notify/{paymentMethod}/{merchantId}
```

例如：
- 微信支付: `https://api.example.com/payment/notify/wechat/1234567890`
- 支付宝: `https://api.example.com/payment/notify/alipay/2021000000000000`

### 回调验证流程

1. **数据完整性检查**: 验证必需参数
2. **签名验证**: 使用对应平台的公钥/密钥验证签名
3. **业务状态检查**: 确认支付状态为成功
4. **事件发布**: 发布 `PaySuccessEvent` 事件
5. **响应返回**: 返回平台要求的格式

### 监听支付成功事件

```java
@Component
@Slf4j
public class PaymentEventListener {
    
    @EventListener
    public void handlePaymentSuccess(PaySuccessEvent event) {
        String outTradeNo = event.getOutTradeNo();
        String totalFee = event.getTotalFee();
        String paymentMethod = event.getPaymentMethod();
        
        // 处理业务逻辑
        // 1. 更新订单状态
        // 2. 发货处理
        // 3. 积分发放
        // 4. 发送通知
        
        log.info("支付成功: 订单={}, 金额={}, 方式={}", 
            outTradeNo, event.getTotalAmountYuan(), paymentMethod);
    }
}
```

## 配置管理

### 配置初始化

系统启动时会自动初始化所有租户的支付配置：

1. **扫描租户**: 从平台配置和支付配置中获取所有租户ID
2. **构建配置**: 为每个租户构建 `PayConfig` 对象
3. **分组初始化**: 按支付方式分组，调用对应的初始化器
4. **注册配置**: 将配置注册到 `PayConfigManager`

### 配置结构

```java
@Data
public class PayConfig {
    private String configId;           // 格式: {tenantId}:{paymentMethod}:{appid}
    private String tenantId;           // 租户ID
    private DictPaymentMethod paymentMethod; // 支付方式
    private String appid;              // 应用ID
    private String mchId;              // 商户号
    private String mchKey;             // 商户密钥
    private String certPath;           // 证书路径
    // ... 其他配置项
}
```

### 多租户配置隔离

每个租户的配置完全隔离，通过配置ID进行区分：

```java
// 获取指定租户的支付配置
PayConfig config = configManager.getConfig(tenantId, "wechat", appId);

// 获取租户的所有配置
List<PayConfig> configs = configManager.getConfigsByTenant(tenantId);
```

## 状态查询

### 支付状态查询

```java
// 查询微信支付状态
PayResponse response = payService.queryPayment(
    DictPaymentMethod.WECHAT, outTradeNo, appId
);

if (response.isSuccess()) {
    String tradeState = response.getTradeState();
    Date payTime = response.getPayTime();
    // 处理查询结果
}
```

### 退款状态查询

```java
// 查询退款状态
RefundResponse response = payService.queryRefund(
    DictPaymentMethod.WECHAT, outRefundNo, appId
);

if (response.isSuccess()) {
    String refundStatus = response.getRefundStatus();
    // 处理查询结果
}
```

## 工具类

### PayUtils - 支付工具类

```java
// 生成订单号
String outTradeNo = PayUtils.generateOutTradeNo();
String outTradeNo = PayUtils.generateOutTradeNo("ORDER");

// 生成退款单号
String outRefundNo = PayUtils.generateOutRefundNo();

// 金额转换
String fenStr = PayUtils.yuanToFen("10.50");  // 1050
String yuanStr = PayUtils.fenToYuan("1050");  // 10.50

// 敏感信息掩码
String maskedMchId = PayUtils.maskMchId("1234567890");  // 123****890
String maskedAppId = PayUtils.maskAppId("wx1234567890123456");  // wx12****3456
```

### PayNotifyUrlBuilder - 回调地址构建

```java
// 构建回调地址
String notifyUrl = PayNotifyUrlBuilder.buildNotifyUrl(
    DictPaymentMethod.WECHAT, mchId
);

// 解析回调地址
String[] parsed = PayNotifyUrlBuilder.parseNotifyUrl(notifyUrl);
String paymentType = parsed[0];
String merchantId = parsed[1];
```

## 最佳实践

### 1. 订单号生成

```java
// 推荐使用系统提供的订单号生成方法
String outTradeNo = PayUtils.generateOutTradeNo("PAY");  // PAY20241212143025123456
String outRefundNo = PayUtils.generateOutRefundNo("REF"); // REF20241212143025123456
```

### 2. 异常处理

```java
try {
    PayResponse response = payService.pay(DictPaymentMethod.WECHAT, request);
    if (!response.isSuccess()) {
        log.error("支付失败: {}", response.getMessage());
        // 处理支付失败
    }
} catch (ServiceException e) {
    log.error("支付异常: {}", e.getMessage(), e);
    // 处理异常情况
}
```

### 3. 回调幂等性

支付回调可能会重复推送，业务处理时需要保证幂等性：

```java
@EventListener
@Transactional
public void handlePaymentSuccess(PaySuccessEvent event) {
    String outTradeNo = event.getOutTradeNo();
    
    // 检查订单是否已处理（幂等性保证）
    if (orderService.isPaid(outTradeNo)) {
        log.info("订单已处理，跳过: {}", outTradeNo);
        return;
    }
    
    // 更新订单状态
    orderService.updateOrderStatus(outTradeNo, "PAID");
    
    // 其他业务处理...
}
```

### 4. 金额处理

```java
// 统一使用 BigDecimal 处理金额，避免精度丢失
BigDecimal amount = new BigDecimal("10.50");

// 避免使用 double 类型
// ❌ double amount = 10.50;
// ✅ BigDecimal amount = new BigDecimal("10.50");
```

### 5. 配置安全

生产环境中，敏感配置信息应该加密存储：

```java
// 敏感信息脱敏日志输出
log.info("初始化微信支付: appId={}, mchId={}", 
    PayUtils.maskAppId(appId), 
    PayUtils.maskMchId(mchId)
);
```

## 常见问题

### Q: 支付回调收不到？

A: 检查以下几点：
1. 确保回调地址可以从外网访问
2. 检查 `app.base-api` 配置是否正确
3. 确认防火墙没有拦截回调请求
4. 查看回调日志，确认签名验证是否通过

### Q: 微信支付提示签名错误？

A: 检查以下配置：
1. `mchKey` (API密钥) 是否正确
2. 参数是否按照微信要求进行签名
3. 字符编码是否为 UTF-8

### Q: 支付宝支付失败？

A: 检查以下配置：
1. `appId` 格式是否正确（16位数字）
2. 应用私钥是否正确
3. 支付宝公钥是否配置
4. 是否开通了对应的支付产品

### Q: 多租户环境下配置混乱？

A: 确保：
1. 每个租户的配置ID唯一
2. 配置初始化时按租户隔离
3. 使用时传入正确的 `appId` 参数

### Q: 如何扩展新的支付方式？

A: 按照以下步骤：
1. 实现 `PayHandler` 接口
2. 创建对应的 `PayInitializer`
3. 在 `DictPaymentMethod` 中添加新的支付方式枚举
4. 添加相关配置支持

## 订单状态管理

### 支付状态机

支付订单遵循标准的状态流转模型，确保订单状态的正确性和一致性。

```java
/**
 * 支付订单状态枚举
 */
public enum PayOrderStatus {
    /** 待支付 */
    PENDING("pending", "待支付"),
    /** 支付中 */
    PAYING("paying", "支付中"),
    /** 支付成功 */
    SUCCESS("success", "支付成功"),
    /** 支付失败 */
    FAILED("failed", "支付失败"),
    /** 已关闭 */
    CLOSED("closed", "已关闭"),
    /** 已退款 */
    REFUNDED("refunded", "已退款"),
    /** 部分退款 */
    PARTIAL_REFUNDED("partial_refunded", "部分退款");

    private final String code;
    private final String desc;

    PayOrderStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    /**
     * 判断是否可以发起支付
     */
    public boolean canPay() {
        return this == PENDING || this == FAILED;
    }

    /**
     * 判断是否可以发起退款
     */
    public boolean canRefund() {
        return this == SUCCESS || this == PARTIAL_REFUNDED;
    }

    /**
     * 判断是否为终态
     */
    public boolean isFinal() {
        return this == SUCCESS || this == CLOSED || this == REFUNDED;
    }
}
```

### 状态流转图

```mermaid
stateDiagram-v2
    [*] --> PENDING: 创建订单
    PENDING --> PAYING: 发起支付
    PENDING --> CLOSED: 超时关闭
    PAYING --> SUCCESS: 支付成功
    PAYING --> FAILED: 支付失败
    PAYING --> PENDING: 支付超时
    FAILED --> PAYING: 重新支付
    SUCCESS --> PARTIAL_REFUNDED: 部分退款
    SUCCESS --> REFUNDED: 全额退款
    PARTIAL_REFUNDED --> REFUNDED: 剩余退款
    CLOSED --> [*]
    REFUNDED --> [*]
```

### 状态转换服务

```java
/**
 * 支付状态转换服务
 */
@Service
@Slf4j
public class PayOrderStatusService {

    @Autowired
    private PayOrderMapper payOrderMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * 状态转换 - 支付成功
     */
    @Transactional(rollbackFor = Exception.class)
    public void transitionToSuccess(String outTradeNo, String transactionId,
                                     Date payTime, BigDecimal actualAmount) {
        PayOrder order = getOrderByOutTradeNo(outTradeNo);

        // 校验当前状态是否允许转换
        if (!canTransitionToSuccess(order.getStatus())) {
            log.warn("订单状态不允许转换为成功: outTradeNo={}, currentStatus={}",
                outTradeNo, order.getStatus());
            return;
        }

        // 更新订单状态
        PayOrder updateOrder = new PayOrder();
        updateOrder.setId(order.getId());
        updateOrder.setStatus(PayOrderStatus.SUCCESS.getCode());
        updateOrder.setTransactionId(transactionId);
        updateOrder.setPayTime(payTime);
        updateOrder.setActualAmount(actualAmount);
        updateOrder.setUpdateTime(new Date());

        int rows = payOrderMapper.updateById(updateOrder);
        if (rows > 0) {
            // 发布状态变更事件
            eventPublisher.publishEvent(new PayOrderStatusChangeEvent(
                this, order, PayOrderStatus.SUCCESS
            ));
            log.info("订单支付成功: outTradeNo={}, transactionId={}",
                outTradeNo, transactionId);
        }
    }

    /**
     * 状态转换 - 支付失败
     */
    @Transactional(rollbackFor = Exception.class)
    public void transitionToFailed(String outTradeNo, String errorCode,
                                    String errorMsg) {
        PayOrder order = getOrderByOutTradeNo(outTradeNo);

        if (!canTransitionToFailed(order.getStatus())) {
            log.warn("订单状态不允许转换为失败: outTradeNo={}, currentStatus={}",
                outTradeNo, order.getStatus());
            return;
        }

        PayOrder updateOrder = new PayOrder();
        updateOrder.setId(order.getId());
        updateOrder.setStatus(PayOrderStatus.FAILED.getCode());
        updateOrder.setErrorCode(errorCode);
        updateOrder.setErrorMsg(errorMsg);
        updateOrder.setUpdateTime(new Date());

        payOrderMapper.updateById(updateOrder);

        eventPublisher.publishEvent(new PayOrderStatusChangeEvent(
            this, order, PayOrderStatus.FAILED
        ));
    }

    /**
     * 状态转换 - 订单关闭
     */
    @Transactional(rollbackFor = Exception.class)
    public void transitionToClosed(String outTradeNo, String closeReason) {
        PayOrder order = getOrderByOutTradeNo(outTradeNo);

        if (!canTransitionToClosed(order.getStatus())) {
            throw new ServiceException("当前状态不允许关闭订单");
        }

        PayOrder updateOrder = new PayOrder();
        updateOrder.setId(order.getId());
        updateOrder.setStatus(PayOrderStatus.CLOSED.getCode());
        updateOrder.setCloseReason(closeReason);
        updateOrder.setCloseTime(new Date());
        updateOrder.setUpdateTime(new Date());

        payOrderMapper.updateById(updateOrder);

        // 调用支付渠道关闭订单
        closeChannelOrder(order);

        eventPublisher.publishEvent(new PayOrderStatusChangeEvent(
            this, order, PayOrderStatus.CLOSED
        ));
    }

    private boolean canTransitionToSuccess(String status) {
        return PayOrderStatus.PAYING.getCode().equals(status)
            || PayOrderStatus.PENDING.getCode().equals(status);
    }

    private boolean canTransitionToFailed(String status) {
        return PayOrderStatus.PAYING.getCode().equals(status);
    }

    private boolean canTransitionToClosed(String status) {
        return PayOrderStatus.PENDING.getCode().equals(status)
            || PayOrderStatus.FAILED.getCode().equals(status);
    }
}
```

### 订单超时处理

```java
/**
 * 支付订单超时处理任务
 */
@Component
@Slf4j
public class PayOrderTimeoutTask {

    @Autowired
    private PayOrderMapper payOrderMapper;

    @Autowired
    private PayOrderStatusService statusService;

    /** 订单超时时间（分钟） */
    private static final int ORDER_TIMEOUT_MINUTES = 30;

    /**
     * 定时检查超时订单
     * 每分钟执行一次
     */
    @Scheduled(cron = "0 * * * * ?")
    public void checkTimeoutOrders() {
        Date timeoutThreshold = DateUtils.addMinutes(new Date(), -ORDER_TIMEOUT_MINUTES);

        // 查询超时的待支付订单
        List<PayOrder> timeoutOrders = payOrderMapper.selectList(
            new LambdaQueryWrapper<PayOrder>()
                .eq(PayOrder::getStatus, PayOrderStatus.PENDING.getCode())
                .lt(PayOrder::getCreateTime, timeoutThreshold)
                .last("LIMIT 100")
        );

        for (PayOrder order : timeoutOrders) {
            try {
                statusService.transitionToClosed(order.getOutTradeNo(), "订单超时自动关闭");
                log.info("订单超时关闭: outTradeNo={}", order.getOutTradeNo());
            } catch (Exception e) {
                log.error("关闭超时订单失败: outTradeNo={}", order.getOutTradeNo(), e);
            }
        }
    }

    /**
     * 检查支付中订单状态
     * 每5分钟执行一次，主动查询支付结果
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void checkPayingOrders() {
        Date checkThreshold = DateUtils.addMinutes(new Date(), -5);

        List<PayOrder> payingOrders = payOrderMapper.selectList(
            new LambdaQueryWrapper<PayOrder>()
                .eq(PayOrder::getStatus, PayOrderStatus.PAYING.getCode())
                .lt(PayOrder::getCreateTime, checkThreshold)
                .last("LIMIT 50")
        );

        for (PayOrder order : payingOrders) {
            try {
                // 主动查询支付结果
                queryAndUpdatePaymentStatus(order);
            } catch (Exception e) {
                log.error("查询支付状态失败: outTradeNo={}", order.getOutTradeNo(), e);
            }
        }
    }
}
```

## 异步处理

### 异步支付任务

对于高并发场景，支持将支付回调处理异步化，提升系统吞吐量。

```java
/**
 * 异步支付处理配置
 */
@Configuration
@EnableAsync
public class AsyncPayConfig {

    @Bean("payAsyncExecutor")
    public ThreadPoolTaskExecutor payAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("pay-async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}

/**
 * 异步支付事件处理器
 */
@Component
@Slf4j
public class AsyncPayEventHandler {

    @Autowired
    private OrderService orderService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PointService pointService;

    /**
     * 异步处理支付成功事件
     */
    @Async("payAsyncExecutor")
    @EventListener
    public void handlePaySuccess(PaySuccessEvent event) {
        String outTradeNo = event.getOutTradeNo();

        try {
            // 1. 更新订单状态
            orderService.markAsPaid(outTradeNo, event.getTransactionId(), event.getPayTime());

            // 2. 发送支付成功通知
            notificationService.sendPaySuccessNotification(outTradeNo);

            // 3. 发放积分奖励
            pointService.grantPaymentPoints(outTradeNo, event.getTotalAmountYuan());

            // 4. 触发后续业务流程（如发货、开票等）
            triggerPostPaymentProcess(outTradeNo);

            log.info("异步处理支付成功完成: outTradeNo={}", outTradeNo);
        } catch (Exception e) {
            log.error("异步处理支付成功失败: outTradeNo={}", outTradeNo, e);
            // 记录失败，后续可重试
            recordFailedEvent(event, e);
        }
    }

    /**
     * 异步处理退款成功事件
     */
    @Async("payAsyncExecutor")
    @EventListener
    public void handleRefundSuccess(RefundSuccessEvent event) {
        String outRefundNo = event.getOutRefundNo();

        try {
            // 1. 更新退款单状态
            orderService.markAsRefunded(outRefundNo);

            // 2. 回退库存
            inventoryService.rollbackStock(outRefundNo);

            // 3. 扣减积分
            pointService.deductRefundPoints(outRefundNo);

            // 4. 发送退款通知
            notificationService.sendRefundSuccessNotification(outRefundNo);

            log.info("异步处理退款成功完成: outRefundNo={}", outRefundNo);
        } catch (Exception e) {
            log.error("异步处理退款成功失败: outRefundNo={}", outRefundNo, e);
        }
    }
}
```

### 消息队列集成

对于分布式系统，推荐使用消息队列处理支付事件。

```java
/**
 * 支付消息生产者
 */
@Component
@Slf4j
public class PayMessageProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    private static final String PAY_SUCCESS_TOPIC = "pay-success-topic";
    private static final String REFUND_SUCCESS_TOPIC = "refund-success-topic";

    /**
     * 发送支付成功消息
     */
    public void sendPaySuccessMessage(PaySuccessEvent event) {
        PaySuccessMessage message = new PaySuccessMessage();
        message.setOutTradeNo(event.getOutTradeNo());
        message.setTransactionId(event.getTransactionId());
        message.setTotalAmount(event.getTotalAmountYuan());
        message.setPaymentMethod(event.getPaymentMethod());
        message.setPayTime(event.getPayTime());
        message.setTimestamp(System.currentTimeMillis());

        rocketMQTemplate.asyncSend(PAY_SUCCESS_TOPIC, message, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                log.info("支付成功消息发送成功: outTradeNo={}, msgId={}",
                    event.getOutTradeNo(), sendResult.getMsgId());
            }

            @Override
            public void onException(Throwable e) {
                log.error("支付成功消息发送失败: outTradeNo={}", event.getOutTradeNo(), e);
            }
        });
    }

    /**
     * 发送退款成功消息
     */
    public void sendRefundSuccessMessage(RefundSuccessEvent event) {
        RefundSuccessMessage message = new RefundSuccessMessage();
        message.setOutTradeNo(event.getOutTradeNo());
        message.setOutRefundNo(event.getOutRefundNo());
        message.setRefundAmount(event.getRefundAmount());
        message.setRefundTime(event.getRefundTime());
        message.setTimestamp(System.currentTimeMillis());

        rocketMQTemplate.syncSend(REFUND_SUCCESS_TOPIC, message);
    }
}

/**
 * 支付消息消费者
 */
@Component
@Slf4j
@RocketMQMessageListener(
    topic = "pay-success-topic",
    consumerGroup = "pay-success-consumer-group"
)
public class PaySuccessMessageConsumer implements RocketMQListener<PaySuccessMessage> {

    @Autowired
    private OrderService orderService;

    @Override
    public void onMessage(PaySuccessMessage message) {
        String outTradeNo = message.getOutTradeNo();

        try {
            // 幂等性检查
            if (orderService.isPaid(outTradeNo)) {
                log.info("订单已处理，跳过: outTradeNo={}", outTradeNo);
                return;
            }

            // 处理业务逻辑
            orderService.processPaySuccess(message);

            log.info("支付成功消息处理完成: outTradeNo={}", outTradeNo);
        } catch (Exception e) {
            log.error("支付成功消息处理失败: outTradeNo={}", outTradeNo, e);
            throw new RuntimeException(e); // 触发重试
        }
    }
}
```

### 延迟消息处理

```java
/**
 * 延迟消息服务 - 用于订单超时关闭等场景
 */
@Component
@Slf4j
public class DelayPayMessageService {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    private static final String ORDER_TIMEOUT_TOPIC = "order-timeout-topic";

    /**
     * 发送订单超时关闭延迟消息
     *
     * @param outTradeNo 订单号
     * @param delayMinutes 延迟分钟数
     */
    public void sendOrderTimeoutMessage(String outTradeNo, int delayMinutes) {
        OrderTimeoutMessage message = new OrderTimeoutMessage();
        message.setOutTradeNo(outTradeNo);
        message.setCreateTime(System.currentTimeMillis());

        // RocketMQ 延迟级别对应的时间
        // 1=1s, 2=5s, 3=10s, 4=30s, 5=1m, 6=2m, 7=3m, 8=4m, 9=5m,
        // 10=6m, 11=7m, 12=8m, 13=9m, 14=10m, 15=20m, 16=30m, 17=1h, 18=2h
        int delayLevel = calculateDelayLevel(delayMinutes);

        Message<OrderTimeoutMessage> msg = MessageBuilder
            .withPayload(message)
            .build();

        rocketMQTemplate.syncSend(ORDER_TIMEOUT_TOPIC, msg, 3000, delayLevel);

        log.info("发送订单超时消息: outTradeNo={}, delayMinutes={}", outTradeNo, delayMinutes);
    }

    private int calculateDelayLevel(int minutes) {
        if (minutes <= 1) return 5;      // 1分钟
        if (minutes <= 5) return 9;      // 5分钟
        if (minutes <= 10) return 14;    // 10分钟
        if (minutes <= 30) return 16;    // 30分钟
        return 17;                       // 1小时
    }
}

/**
 * 订单超时消费者
 */
@Component
@Slf4j
@RocketMQMessageListener(
    topic = "order-timeout-topic",
    consumerGroup = "order-timeout-consumer-group"
)
public class OrderTimeoutConsumer implements RocketMQListener<OrderTimeoutMessage> {

    @Autowired
    private PayOrderStatusService statusService;

    @Autowired
    private PayOrderMapper payOrderMapper;

    @Override
    public void onMessage(OrderTimeoutMessage message) {
        String outTradeNo = message.getOutTradeNo();

        try {
            // 检查订单是否仍然是待支付状态
            PayOrder order = payOrderMapper.selectOne(
                new LambdaQueryWrapper<PayOrder>()
                    .eq(PayOrder::getOutTradeNo, outTradeNo)
            );

            if (order == null) {
                log.warn("订单不存在: outTradeNo={}", outTradeNo);
                return;
            }

            if (!PayOrderStatus.PENDING.getCode().equals(order.getStatus())) {
                log.info("订单状态已变更，无需关闭: outTradeNo={}, status={}",
                    outTradeNo, order.getStatus());
                return;
            }

            // 关闭订单
            statusService.transitionToClosed(outTradeNo, "订单超时自动关闭");

        } catch (Exception e) {
            log.error("处理订单超时消息失败: outTradeNo={}", outTradeNo, e);
        }
    }
}
```

## 安全实践

### 签名验证

```java
/**
 * 支付签名工具类
 */
public class PaySignatureUtils {

    /**
     * 微信支付 v3 签名验证
     */
    public static boolean verifyWxPayV3Signature(String serialNo, String timestamp,
            String nonce, String body, String signature, String platformCert) {
        try {
            // 构造验签数据
            String message = timestamp + "\n" + nonce + "\n" + body + "\n";

            // 加载平台证书公钥
            PublicKey publicKey = loadPublicKey(platformCert);

            // 验证签名
            Signature sign = Signature.getInstance("SHA256withRSA");
            sign.initVerify(publicKey);
            sign.update(message.getBytes(StandardCharsets.UTF_8));

            return sign.verify(Base64.getDecoder().decode(signature));
        } catch (Exception e) {
            log.error("微信支付签名验证失败", e);
            return false;
        }
    }

    /**
     * 支付宝签名验证
     */
    public static boolean verifyAliPaySignature(Map<String, String> params,
            String alipayPublicKey) {
        try {
            String sign = params.get("sign");
            String signType = params.get("sign_type");

            // 移除签名相关参数
            Map<String, String> contentParams = new HashMap<>(params);
            contentParams.remove("sign");
            contentParams.remove("sign_type");

            // 构造待签名字符串
            String content = buildSignContent(contentParams);

            // 验证签名
            return AlipaySignature.rsaCheckV1(
                contentParams, alipayPublicKey, "UTF-8", signType
            );
        } catch (Exception e) {
            log.error("支付宝签名验证失败", e);
            return false;
        }
    }

    /**
     * 生成微信支付 v3 请求签名
     */
    public static String generateWxPayV3Signature(String method, String url,
            long timestamp, String nonce, String body, PrivateKey privateKey) {
        try {
            String message = method + "\n"
                + url + "\n"
                + timestamp + "\n"
                + nonce + "\n"
                + body + "\n";

            Signature sign = Signature.getInstance("SHA256withRSA");
            sign.initSign(privateKey);
            sign.update(message.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(sign.sign());
        } catch (Exception e) {
            throw new RuntimeException("生成签名失败", e);
        }
    }
}
```

### 敏感信息加密

```java
/**
 * 支付敏感信息加密服务
 */
@Service
public class PaySensitiveDataService {

    @Autowired
    private StringEncryptor stringEncryptor;

    /**
     * 加密配置信息
     */
    public PayConfig encryptConfig(PayConfig config) {
        PayConfig encrypted = BeanUtil.copyProperties(config, PayConfig.class);

        // 加密敏感字段
        if (StringUtils.isNotBlank(config.getMchKey())) {
            encrypted.setMchKey(stringEncryptor.encrypt(config.getMchKey()));
        }
        if (StringUtils.isNotBlank(config.getApiV3Key())) {
            encrypted.setApiV3Key(stringEncryptor.encrypt(config.getApiV3Key()));
        }
        if (StringUtils.isNotBlank(config.getPrivateKey())) {
            encrypted.setPrivateKey(stringEncryptor.encrypt(config.getPrivateKey()));
        }

        return encrypted;
    }

    /**
     * 解密配置信息
     */
    public PayConfig decryptConfig(PayConfig config) {
        PayConfig decrypted = BeanUtil.copyProperties(config, PayConfig.class);

        if (StringUtils.isNotBlank(config.getMchKey())) {
            decrypted.setMchKey(stringEncryptor.decrypt(config.getMchKey()));
        }
        if (StringUtils.isNotBlank(config.getApiV3Key())) {
            decrypted.setApiV3Key(stringEncryptor.decrypt(config.getApiV3Key()));
        }
        if (StringUtils.isNotBlank(config.getPrivateKey())) {
            decrypted.setPrivateKey(stringEncryptor.decrypt(config.getPrivateKey()));
        }

        return decrypted;
    }

    /**
     * 脱敏日志输出
     */
    public String maskSensitiveLog(String log) {
        // 脱敏商户密钥
        log = log.replaceAll("(mchKey=)[^,\\s]+", "$1****");
        // 脱敏 API 密钥
        log = log.replaceAll("(apiV3Key=)[^,\\s]+", "$1****");
        // 脱敏私钥
        log = log.replaceAll("(privateKey=)[^,\\s]+", "$1****");
        // 脱敏证书序列号
        log = log.replaceAll("(certSerialNo=)[^,\\s]+", "$1****");

        return log;
    }
}
```

### 防重放攻击

```java
/**
 * 支付请求防重放服务
 */
@Service
@Slf4j
public class PayReplayProtectionService {

    @Autowired
    private RedissonClient redissonClient;

    /** 请求时间戳有效期（秒） */
    private static final long TIMESTAMP_VALID_SECONDS = 300;

    /** Nonce 缓存过期时间（秒） */
    private static final long NONCE_EXPIRE_SECONDS = 600;

    /**
     * 验证请求是否有效（防重放）
     */
    public boolean validateRequest(String timestamp, String nonce, String signature) {
        // 1. 验证时间戳
        if (!validateTimestamp(timestamp)) {
            log.warn("请求时间戳无效: timestamp={}", timestamp);
            return false;
        }

        // 2. 验证 nonce 是否已使用
        if (isNonceUsed(nonce)) {
            log.warn("Nonce 已使用，可能是重放攻击: nonce={}", nonce);
            return false;
        }

        // 3. 记录 nonce
        recordNonce(nonce);

        return true;
    }

    /**
     * 验证时间戳是否在有效范围内
     */
    private boolean validateTimestamp(String timestamp) {
        try {
            long requestTime = Long.parseLong(timestamp);
            long currentTime = System.currentTimeMillis() / 1000;
            long diff = Math.abs(currentTime - requestTime);

            return diff <= TIMESTAMP_VALID_SECONDS;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * 检查 nonce 是否已使用
     */
    private boolean isNonceUsed(String nonce) {
        String key = "pay:nonce:" + nonce;
        RBucket<String> bucket = redissonClient.getBucket(key);
        return bucket.isExists();
    }

    /**
     * 记录 nonce
     */
    private void recordNonce(String nonce) {
        String key = "pay:nonce:" + nonce;
        RBucket<String> bucket = redissonClient.getBucket(key);
        bucket.set("1", NONCE_EXPIRE_SECONDS, TimeUnit.SECONDS);
    }
}
```

### IP 白名单验证

```java
/**
 * 支付回调 IP 白名单验证
 */
@Component
@Slf4j
public class PayCallbackIpValidator {

    /** 微信支付回调 IP 白名单 */
    private static final Set<String> WX_PAY_IP_WHITELIST = Set.of(
        "101.226.103.*",
        "140.207.54.*",
        "121.51.58.*",
        "183.3.234.*",
        "183.3.235.*",
        "58.251.80.*"
    );

    /** 支付宝回调 IP 白名单 */
    private static final Set<String> ALIPAY_IP_WHITELIST = Set.of(
        "110.75.130.*",
        "110.75.131.*",
        "110.75.132.*",
        "203.209.230.*",
        "203.209.231.*",
        "203.209.232.*"
    );

    /**
     * 验证微信支付回调 IP
     */
    public boolean validateWxPayCallbackIp(String clientIp) {
        return validateIp(clientIp, WX_PAY_IP_WHITELIST);
    }

    /**
     * 验证支付宝回调 IP
     */
    public boolean validateAlipayCallbackIp(String clientIp) {
        return validateIp(clientIp, ALIPAY_IP_WHITELIST);
    }

    private boolean validateIp(String clientIp, Set<String> whitelist) {
        if (StringUtils.isBlank(clientIp)) {
            return false;
        }

        for (String pattern : whitelist) {
            if (matchIpPattern(clientIp, pattern)) {
                return true;
            }
        }

        log.warn("回调 IP 不在白名单中: clientIp={}", clientIp);
        return false;
    }

    private boolean matchIpPattern(String ip, String pattern) {
        if (pattern.endsWith(".*")) {
            String prefix = pattern.substring(0, pattern.length() - 1);
            return ip.startsWith(prefix);
        }
        return ip.equals(pattern);
    }
}
```

## 对账功能

### 对账服务

```java
/**
 * 支付对账服务
 */
@Service
@Slf4j
public class PayReconciliationService {

    @Autowired
    private PayOrderMapper payOrderMapper;

    @Autowired
    private WxPayHandler wxPayHandler;

    @Autowired
    private AliPayHandler aliPayHandler;

    /**
     * 下载微信支付对账单
     */
    public List<WxPayBillRecord> downloadWxPayBill(String appId, String mchId,
            Date billDate) {
        try {
            String dateStr = DateUtils.format(billDate, "yyyyMMdd");

            // 下载对账单
            byte[] billData = wxPayHandler.downloadBill(appId, mchId, dateStr);

            // 解析对账单
            return parseWxPayBill(billData);
        } catch (Exception e) {
            log.error("下载微信对账单失败: billDate={}", billDate, e);
            throw new ServiceException("下载对账单失败");
        }
    }

    /**
     * 下载支付宝对账单
     */
    public List<AlipayBillRecord> downloadAlipayBill(String appId, Date billDate) {
        try {
            String dateStr = DateUtils.format(billDate, "yyyy-MM-dd");

            // 下载对账单
            String billUrl = aliPayHandler.downloadBillUrl(appId, dateStr);
            byte[] billData = downloadFromUrl(billUrl);

            // 解析对账单
            return parseAlipayBill(billData);
        } catch (Exception e) {
            log.error("下载支付宝对账单失败: billDate={}", billDate, e);
            throw new ServiceException("下载对账单失败");
        }
    }

    /**
     * 执行对账
     */
    @Transactional(rollbackFor = Exception.class)
    public ReconciliationResult reconcile(Date billDate, DictPaymentMethod paymentMethod) {
        ReconciliationResult result = new ReconciliationResult();
        result.setBillDate(billDate);
        result.setPaymentMethod(paymentMethod);
        result.setStartTime(new Date());

        try {
            // 1. 获取平台对账单
            List<? extends BillRecord> platformRecords = downloadPlatformBill(
                billDate, paymentMethod
            );

            // 2. 获取本地订单
            List<PayOrder> localOrders = getLocalOrders(billDate, paymentMethod);

            // 3. 进行对账比对
            compareAndReconcile(platformRecords, localOrders, result);

            // 4. 保存对账结果
            saveReconciliationResult(result);

            result.setEndTime(new Date());
            result.setSuccess(true);

            log.info("对账完成: date={}, method={}, total={}, success={}, diff={}",
                billDate, paymentMethod, result.getTotalCount(),
                result.getSuccessCount(), result.getDiffCount());

        } catch (Exception e) {
            log.error("对账失败: billDate={}, method={}", billDate, paymentMethod, e);
            result.setSuccess(false);
            result.setErrorMsg(e.getMessage());
        }

        return result;
    }

    /**
     * 比对对账
     */
    private void compareAndReconcile(List<? extends BillRecord> platformRecords,
            List<PayOrder> localOrders, ReconciliationResult result) {

        // 构建本地订单映射
        Map<String, PayOrder> localOrderMap = localOrders.stream()
            .collect(Collectors.toMap(PayOrder::getOutTradeNo, o -> o));

        // 构建平台记录映射
        Map<String, BillRecord> platformRecordMap = platformRecords.stream()
            .collect(Collectors.toMap(BillRecord::getOutTradeNo, r -> r));

        int totalCount = 0;
        int successCount = 0;
        int diffCount = 0;
        List<ReconciliationDiff> diffs = new ArrayList<>();

        // 1. 检查平台有而本地没有的订单（漏单）
        for (BillRecord platformRecord : platformRecords) {
            totalCount++;
            String outTradeNo = platformRecord.getOutTradeNo();
            PayOrder localOrder = localOrderMap.get(outTradeNo);

            if (localOrder == null) {
                // 漏单
                ReconciliationDiff diff = new ReconciliationDiff();
                diff.setOutTradeNo(outTradeNo);
                diff.setDiffType(DiffType.MISSING_LOCAL);
                diff.setPlatformAmount(platformRecord.getAmount());
                diffs.add(diff);
                diffCount++;
            } else {
                // 比对金额
                if (!localOrder.getTotalAmount().equals(platformRecord.getAmount())) {
                    ReconciliationDiff diff = new ReconciliationDiff();
                    diff.setOutTradeNo(outTradeNo);
                    diff.setDiffType(DiffType.AMOUNT_MISMATCH);
                    diff.setLocalAmount(localOrder.getTotalAmount());
                    diff.setPlatformAmount(platformRecord.getAmount());
                    diffs.add(diff);
                    diffCount++;
                } else {
                    successCount++;
                }
            }
        }

        // 2. 检查本地有而平台没有的订单（多单）
        for (PayOrder localOrder : localOrders) {
            String outTradeNo = localOrder.getOutTradeNo();
            if (!platformRecordMap.containsKey(outTradeNo)) {
                totalCount++;
                ReconciliationDiff diff = new ReconciliationDiff();
                diff.setOutTradeNo(outTradeNo);
                diff.setDiffType(DiffType.MISSING_PLATFORM);
                diff.setLocalAmount(localOrder.getTotalAmount());
                diffs.add(diff);
                diffCount++;
            }
        }

        result.setTotalCount(totalCount);
        result.setSuccessCount(successCount);
        result.setDiffCount(diffCount);
        result.setDiffs(diffs);
    }
}
```

### 定时对账任务

```java
/**
 * 定时对账任务
 */
@Component
@Slf4j
public class ReconciliationTask {

    @Autowired
    private PayReconciliationService reconciliationService;

    @Autowired
    private NotificationService notificationService;

    /**
     * 每日凌晨 3 点执行前一天的对账
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void dailyReconciliation() {
        Date yesterday = DateUtils.addDays(new Date(), -1);

        log.info("开始执行每日对账任务: date={}", yesterday);

        // 微信支付对账
        ReconciliationResult wxResult = reconciliationService.reconcile(
            yesterday, DictPaymentMethod.WECHAT
        );

        // 支付宝对账
        ReconciliationResult aliResult = reconciliationService.reconcile(
            yesterday, DictPaymentMethod.ALIPAY
        );

        // 发送对账报告
        sendReconciliationReport(yesterday, wxResult, aliResult);

        // 如果有差异，发送告警
        if (wxResult.getDiffCount() > 0 || aliResult.getDiffCount() > 0) {
            sendReconciliationAlert(yesterday, wxResult, aliResult);
        }
    }

    /**
     * 发送对账报告
     */
    private void sendReconciliationReport(Date date, ReconciliationResult... results) {
        StringBuilder report = new StringBuilder();
        report.append("【支付对账报告】\n");
        report.append("对账日期: ").append(DateUtils.format(date, "yyyy-MM-dd")).append("\n\n");

        for (ReconciliationResult result : results) {
            report.append("【").append(result.getPaymentMethod().getDesc()).append("】\n");
            report.append("- 总笔数: ").append(result.getTotalCount()).append("\n");
            report.append("- 成功笔数: ").append(result.getSuccessCount()).append("\n");
            report.append("- 差异笔数: ").append(result.getDiffCount()).append("\n");
            if (result.getDiffCount() > 0) {
                report.append("- 差异详情:\n");
                for (ReconciliationDiff diff : result.getDiffs()) {
                    report.append("  * ").append(diff.getOutTradeNo())
                        .append(" - ").append(diff.getDiffType().getDesc()).append("\n");
                }
            }
            report.append("\n");
        }

        notificationService.sendDingTalkMessage(report.toString());
    }
}
```

## 日志审计

### 支付日志服务

```java
/**
 * 支付日志服务
 */
@Service
@Slf4j
public class PayAuditLogService {

    @Autowired
    private PayAuditLogMapper auditLogMapper;

    /**
     * 记录支付请求日志
     */
    public void logPayRequest(PayRequest request, String traceId) {
        PayAuditLog auditLog = new PayAuditLog();
        auditLog.setTraceId(traceId);
        auditLog.setLogType(PayLogType.PAY_REQUEST);
        auditLog.setOutTradeNo(request.getOutTradeNo());
        auditLog.setPaymentMethod(request.getPaymentMethod());
        auditLog.setAmount(request.getTotalAmount());
        auditLog.setRequestData(maskSensitiveData(JsonUtils.toJson(request)));
        auditLog.setClientIp(request.getClientIp());
        auditLog.setCreateTime(new Date());

        auditLogMapper.insert(auditLog);
    }

    /**
     * 记录支付响应日志
     */
    public void logPayResponse(String traceId, PayResponse response, long costTime) {
        PayAuditLog auditLog = new PayAuditLog();
        auditLog.setTraceId(traceId);
        auditLog.setLogType(PayLogType.PAY_RESPONSE);
        auditLog.setOutTradeNo(response.getOutTradeNo());
        auditLog.setSuccess(response.isSuccess());
        auditLog.setResponseData(maskSensitiveData(JsonUtils.toJson(response)));
        auditLog.setErrorCode(response.getErrorCode());
        auditLog.setErrorMsg(response.getErrorMsg());
        auditLog.setCostTime(costTime);
        auditLog.setCreateTime(new Date());

        auditLogMapper.insert(auditLog);
    }

    /**
     * 记录回调日志
     */
    public void logCallback(NotifyRequest request, NotifyResponse response,
            long costTime) {
        PayAuditLog auditLog = new PayAuditLog();
        auditLog.setTraceId(IdUtils.fastUUID());
        auditLog.setLogType(PayLogType.CALLBACK);
        auditLog.setOutTradeNo(request.getOutTradeNo());
        auditLog.setPaymentMethod(request.getPaymentMethod());
        auditLog.setRequestData(maskSensitiveData(JsonUtils.toJson(request)));
        auditLog.setResponseData(JsonUtils.toJson(response));
        auditLog.setSuccess(response.isSuccess());
        auditLog.setCostTime(costTime);
        auditLog.setCreateTime(new Date());

        auditLogMapper.insert(auditLog);
    }

    /**
     * 记录退款日志
     */
    public void logRefund(RefundRequest request, RefundResponse response,
            String traceId, long costTime) {
        PayAuditLog auditLog = new PayAuditLog();
        auditLog.setTraceId(traceId);
        auditLog.setLogType(PayLogType.REFUND);
        auditLog.setOutTradeNo(request.getOutTradeNo());
        auditLog.setOutRefundNo(request.getOutRefundNo());
        auditLog.setPaymentMethod(request.getPaymentMethod());
        auditLog.setAmount(request.getRefundAmount());
        auditLog.setRequestData(maskSensitiveData(JsonUtils.toJson(request)));
        auditLog.setResponseData(maskSensitiveData(JsonUtils.toJson(response)));
        auditLog.setSuccess(response.isSuccess());
        auditLog.setErrorCode(response.getErrorCode());
        auditLog.setErrorMsg(response.getErrorMsg());
        auditLog.setCostTime(costTime);
        auditLog.setCreateTime(new Date());

        auditLogMapper.insert(auditLog);
    }

    /**
     * 脱敏敏感数据
     */
    private String maskSensitiveData(String data) {
        if (StringUtils.isBlank(data)) {
            return data;
        }

        // 脱敏商户密钥
        data = data.replaceAll("\"mchKey\"\\s*:\\s*\"[^\"]+\"", "\"mchKey\":\"****\"");
        // 脱敏私钥
        data = data.replaceAll("\"privateKey\"\\s*:\\s*\"[^\"]+\"", "\"privateKey\":\"****\"");
        // 脱敏 openId
        data = data.replaceAll("\"openId\"\\s*:\\s*\"([^\"]{4})[^\"]+([^\"]{4})\"",
            "\"openId\":\"$1****$2\"");

        return data;
    }
}
```

### 日志查询接口

```java
/**
 * 支付日志查询控制器
 */
@RestController
@RequestMapping("/pay/audit")
@RequiredArgsConstructor
public class PayAuditController {

    private final PayAuditLogService auditLogService;

    /**
     * 分页查询支付日志
     */
    @GetMapping("/list")
    @SaCheckPermission("pay:audit:list")
    public TableDataInfo<PayAuditLogVo> list(PayAuditLogQuery query) {
        return auditLogService.queryPageList(query);
    }

    /**
     * 查询订单的完整支付链路
     */
    @GetMapping("/trace/{outTradeNo}")
    @SaCheckPermission("pay:audit:query")
    public R<List<PayAuditLogVo>> getPaymentTrace(@PathVariable String outTradeNo) {
        List<PayAuditLogVo> logs = auditLogService.getPaymentTrace(outTradeNo);
        return R.ok(logs);
    }

    /**
     * 导出支付日志
     */
    @PostMapping("/export")
    @SaCheckPermission("pay:audit:export")
    public void export(PayAuditLogQuery query, HttpServletResponse response) {
        List<PayAuditLogVo> list = auditLogService.queryList(query);
        ExcelUtil.exportExcel(list, "支付审计日志", PayAuditLogVo.class, response);
    }
}
```

## 性能优化

### 连接池配置

```java
/**
 * 支付 HTTP 连接池配置
 */
@Configuration
public class PayHttpClientConfig {

    @Bean
    public CloseableHttpClient payHttpClient() {
        // 连接池配置
        PoolingHttpClientConnectionManager connectionManager =
            new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(200);           // 最大连接数
        connectionManager.setDefaultMaxPerRoute(50);  // 每个路由最大连接数

        // 请求配置
        RequestConfig requestConfig = RequestConfig.custom()
            .setConnectTimeout(5000)      // 连接超时 5 秒
            .setSocketTimeout(30000)      // 读取超时 30 秒
            .setConnectionRequestTimeout(3000)  // 获取连接超时 3 秒
            .build();

        // 重试策略
        HttpRequestRetryHandler retryHandler = (exception, executionCount, context) -> {
            if (executionCount > 3) {
                return false;
            }
            if (exception instanceof NoHttpResponseException) {
                return true;
            }
            if (exception instanceof ConnectTimeoutException) {
                return true;
            }
            return false;
        };

        return HttpClients.custom()
            .setConnectionManager(connectionManager)
            .setDefaultRequestConfig(requestConfig)
            .setRetryHandler(retryHandler)
            .setKeepAliveStrategy((response, context) -> 30000)  // 保持连接 30 秒
            .build();
    }
}
```

### 缓存优化

```java
/**
 * 支付配置缓存服务
 */
@Service
@Slf4j
public class PayConfigCacheService {

    @Autowired
    private RedissonClient redissonClient;

    @Autowired
    private PayConfigMapper configMapper;

    private static final String CONFIG_CACHE_KEY = "pay:config:";
    private static final long CACHE_EXPIRE_HOURS = 24;

    /**
     * 获取支付配置（带缓存）
     */
    public PayConfig getConfig(String tenantId, String paymentMethod, String appId) {
        String cacheKey = CONFIG_CACHE_KEY + tenantId + ":" + paymentMethod + ":" + appId;

        RBucket<PayConfig> bucket = redissonClient.getBucket(cacheKey);
        PayConfig config = bucket.get();

        if (config == null) {
            // 从数据库加载
            config = configMapper.selectOne(new LambdaQueryWrapper<PayConfig>()
                .eq(PayConfig::getTenantId, tenantId)
                .eq(PayConfig::getPaymentMethod, paymentMethod)
                .eq(PayConfig::getAppId, appId)
            );

            if (config != null) {
                bucket.set(config, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
            }
        }

        return config;
    }

    /**
     * 刷新配置缓存
     */
    public void refreshConfig(String tenantId, String paymentMethod, String appId) {
        String cacheKey = CONFIG_CACHE_KEY + tenantId + ":" + paymentMethod + ":" + appId;
        RBucket<PayConfig> bucket = redissonClient.getBucket(cacheKey);
        bucket.delete();

        log.info("刷新支付配置缓存: tenant={}, method={}, appId={}",
            tenantId, paymentMethod, appId);
    }

    /**
     * 批量预热配置缓存
     */
    public void warmUpCache() {
        List<PayConfig> configs = configMapper.selectList(
            new LambdaQueryWrapper<PayConfig>()
                .eq(PayConfig::getStatus, 1)
        );

        for (PayConfig config : configs) {
            String cacheKey = CONFIG_CACHE_KEY + config.getTenantId() + ":"
                + config.getPaymentMethod() + ":" + config.getAppId();
            RBucket<PayConfig> bucket = redissonClient.getBucket(cacheKey);
            bucket.set(config, CACHE_EXPIRE_HOURS, TimeUnit.HOURS);
        }

        log.info("支付配置缓存预热完成: count={}", configs.size());
    }
}
```

### 并发控制

```java
/**
 * 支付并发控制服务
 */
@Service
@Slf4j
public class PayConcurrencyService {

    @Autowired
    private RedissonClient redissonClient;

    /**
     * 获取支付锁（防止重复支付）
     */
    public RLock getPayLock(String outTradeNo) {
        String lockKey = "pay:lock:" + outTradeNo;
        return redissonClient.getLock(lockKey);
    }

    /**
     * 带锁执行支付
     */
    public <T> T executeWithPayLock(String outTradeNo, Supplier<T> action) {
        RLock lock = getPayLock(outTradeNo);

        try {
            // 尝试获取锁，最多等待 5 秒，锁持有时间 30 秒
            boolean locked = lock.tryLock(5, 30, TimeUnit.SECONDS);
            if (!locked) {
                throw new ServiceException("支付处理中，请勿重复提交");
            }

            return action.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServiceException("支付操作被中断");
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    /**
     * 获取退款锁（防止重复退款）
     */
    public RLock getRefundLock(String outRefundNo) {
        String lockKey = "refund:lock:" + outRefundNo;
        return redissonClient.getLock(lockKey);
    }

    /**
     * 限流控制
     */
    public boolean tryAcquire(String tenantId, int permits) {
        String rateLimitKey = "pay:ratelimit:" + tenantId;
        RRateLimiter rateLimiter = redissonClient.getRateLimiter(rateLimitKey);

        // 初始化限流器（每秒 100 次）
        rateLimiter.trySetRate(RateType.OVERALL, 100, 1, RateIntervalUnit.SECONDS);

        return rateLimiter.tryAcquire(permits);
    }
}
```

## 扩展开发

### 自定义支付处理器

```java
/**
 * 自定义支付处理器示例 - 银联支付
 */
@Component
@Slf4j
public class UnionPayHandler implements PayHandler {

    @Override
    public DictPaymentMethod getPaymentMethod() {
        return DictPaymentMethod.UNION_PAY;
    }

    @Override
    public PayResponse pay(PayRequest request) {
        log.info("银联支付请求: outTradeNo={}", request.getOutTradeNo());

        try {
            // 1. 构造请求参数
            Map<String, String> params = buildPayParams(request);

            // 2. 生成签名
            String sign = signRequest(params);
            params.put("signature", sign);

            // 3. 发送请求
            String result = sendRequest(UNION_PAY_URL, params);

            // 4. 解析响应
            return parsePayResponse(result);
        } catch (Exception e) {
            log.error("银联支付失败: outTradeNo={}", request.getOutTradeNo(), e);
            return PayResponse.fail(request.getOutTradeNo(), e.getMessage());
        }
    }

    @Override
    public RefundResponse refund(RefundRequest request) {
        log.info("银联退款请求: outRefundNo={}", request.getOutRefundNo());

        try {
            Map<String, String> params = buildRefundParams(request);
            String sign = signRequest(params);
            params.put("signature", sign);

            String result = sendRequest(UNION_REFUND_URL, params);
            return parseRefundResponse(result);
        } catch (Exception e) {
            log.error("银联退款失败: outRefundNo={}", request.getOutRefundNo(), e);
            return RefundResponse.fail(request.getOutRefundNo(), e.getMessage());
        }
    }

    @Override
    public PayResponse queryPayment(String outTradeNo, String appid) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("orderId", outTradeNo);
            params.put("merId", appid);
            params.put("txnType", "00");

            String result = sendRequest(UNION_QUERY_URL, params);
            return parseQueryResponse(result);
        } catch (Exception e) {
            log.error("银联查询失败: outTradeNo={}", outTradeNo, e);
            return PayResponse.fail(outTradeNo, e.getMessage());
        }
    }

    @Override
    public RefundResponse queryRefund(String outRefundNo, String appid) {
        // 实现退款查询逻辑
        return null;
    }

    @Override
    public NotifyResponse handleNotify(NotifyRequest request) {
        log.info("银联回调: outTradeNo={}", request.getOutTradeNo());

        try {
            // 1. 验证签名
            if (!verifySignature(request)) {
                return NotifyResponse.fail("签名验证失败");
            }

            // 2. 检查交易状态
            if (!"00".equals(request.getParam("respCode"))) {
                return NotifyResponse.fail("交易失败");
            }

            // 3. 返回成功
            return NotifyResponse.success(request.getOutTradeNo());
        } catch (Exception e) {
            log.error("处理银联回调失败", e);
            return NotifyResponse.fail(e.getMessage());
        }
    }

    private Map<String, String> buildPayParams(PayRequest request) {
        Map<String, String> params = new HashMap<>();
        params.put("version", "5.1.0");
        params.put("encoding", "UTF-8");
        params.put("txnType", "01");
        params.put("txnSubType", "01");
        params.put("bizType", "000201");
        params.put("channelType", "08");
        params.put("merId", request.getMchId());
        params.put("orderId", request.getOutTradeNo());
        params.put("txnTime", DateUtils.format(new Date(), "yyyyMMddHHmmss"));
        params.put("txnAmt", PayUtils.yuanToFen(request.getTotalAmount().toString()));
        params.put("currencyCode", "156");
        params.put("frontUrl", request.getReturnUrl());
        params.put("backUrl", request.getNotifyUrl());
        return params;
    }
}
```

### 注册自定义处理器

```java
/**
 * 自定义支付处理器注册
 */
@Configuration
public class CustomPayHandlerConfig {

    @Bean
    public PayHandlerRegistry payHandlerRegistry(List<PayHandler> handlers) {
        PayHandlerRegistry registry = new PayHandlerRegistry();

        for (PayHandler handler : handlers) {
            registry.register(handler.getPaymentMethod(), handler);
            log.info("注册支付处理器: {}", handler.getPaymentMethod());
        }

        return registry;
    }
}

/**
 * 支付处理器注册表
 */
public class PayHandlerRegistry {

    private final Map<DictPaymentMethod, PayHandler> handlers = new ConcurrentHashMap<>();

    public void register(DictPaymentMethod method, PayHandler handler) {
        handlers.put(method, handler);
    }

    public PayHandler getHandler(DictPaymentMethod method) {
        PayHandler handler = handlers.get(method);
        if (handler == null) {
            throw new ServiceException("不支持的支付方式: " + method);
        }
        return handler;
    }

    public boolean isSupported(DictPaymentMethod method) {
        return handlers.containsKey(method);
    }
}
```

## 监控告警

### 支付监控指标

```java
/**
 * 支付监控指标收集器
 */
@Component
@Slf4j
public class PayMetricsCollector {

    private final MeterRegistry meterRegistry;

    // 支付请求计数器
    private final Counter payRequestCounter;
    private final Counter paySuccessCounter;
    private final Counter payFailCounter;

    // 支付耗时直方图
    private final Timer payTimer;

    // 退款计数器
    private final Counter refundRequestCounter;
    private final Counter refundSuccessCounter;

    public PayMetricsCollector(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        this.payRequestCounter = Counter.builder("pay.request.total")
            .description("支付请求总数")
            .register(meterRegistry);

        this.paySuccessCounter = Counter.builder("pay.success.total")
            .description("支付成功总数")
            .register(meterRegistry);

        this.payFailCounter = Counter.builder("pay.fail.total")
            .description("支付失败总数")
            .register(meterRegistry);

        this.payTimer = Timer.builder("pay.duration")
            .description("支付耗时")
            .register(meterRegistry);

        this.refundRequestCounter = Counter.builder("refund.request.total")
            .description("退款请求总数")
            .register(meterRegistry);

        this.refundSuccessCounter = Counter.builder("refund.success.total")
            .description("退款成功总数")
            .register(meterRegistry);
    }

    /**
     * 记录支付请求
     */
    public void recordPayRequest(DictPaymentMethod method) {
        payRequestCounter.increment();
        Counter.builder("pay.request")
            .tag("method", method.getCode())
            .register(meterRegistry)
            .increment();
    }

    /**
     * 记录支付结果
     */
    public void recordPayResult(DictPaymentMethod method, boolean success, long costTime) {
        if (success) {
            paySuccessCounter.increment();
        } else {
            payFailCounter.increment();
        }

        payTimer.record(costTime, TimeUnit.MILLISECONDS);

        Timer.builder("pay.duration.by.method")
            .tag("method", method.getCode())
            .tag("success", String.valueOf(success))
            .register(meterRegistry)
            .record(costTime, TimeUnit.MILLISECONDS);
    }

    /**
     * 记录退款请求
     */
    public void recordRefundRequest(DictPaymentMethod method) {
        refundRequestCounter.increment();
    }

    /**
     * 记录退款结果
     */
    public void recordRefundResult(DictPaymentMethod method, boolean success) {
        if (success) {
            refundSuccessCounter.increment();
        }
    }
}
```

### 告警规则配置

```java
/**
 * 支付告警服务
 */
@Service
@Slf4j
public class PayAlertService {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RedissonClient redissonClient;

    /** 支付失败率告警阈值 */
    private static final double FAIL_RATE_THRESHOLD = 0.1;

    /** 支付超时告警阈值（毫秒） */
    private static final long TIMEOUT_THRESHOLD = 10000;

    /** 告警冷却时间（分钟） */
    private static final int ALERT_COOLDOWN_MINUTES = 10;

    /**
     * 检查支付失败率
     */
    @Scheduled(fixedRate = 60000)  // 每分钟检查
    public void checkPayFailRate() {
        // 获取最近 5 分钟的统计
        long successCount = getMetricCount("pay.success.total", 5);
        long failCount = getMetricCount("pay.fail.total", 5);
        long total = successCount + failCount;

        if (total > 100) {  // 样本量足够
            double failRate = (double) failCount / total;

            if (failRate > FAIL_RATE_THRESHOLD) {
                sendAlert("支付失败率告警",
                    String.format("最近5分钟支付失败率 %.2f%% 超过阈值 %.2f%%",
                        failRate * 100, FAIL_RATE_THRESHOLD * 100));
            }
        }
    }

    /**
     * 检查支付超时
     */
    public void checkPayTimeout(String outTradeNo, long costTime) {
        if (costTime > TIMEOUT_THRESHOLD) {
            sendAlert("支付超时告警",
                String.format("订单 %s 支付耗时 %d ms 超过阈值 %d ms",
                    outTradeNo, costTime, TIMEOUT_THRESHOLD));
        }
    }

    /**
     * 发送告警（带冷却控制）
     */
    private void sendAlert(String title, String content) {
        String alertKey = "pay:alert:" + title.hashCode();
        RBucket<Long> bucket = redissonClient.getBucket(alertKey);

        Long lastAlertTime = bucket.get();
        long now = System.currentTimeMillis();

        // 冷却期内不重复告警
        if (lastAlertTime != null &&
            now - lastAlertTime < ALERT_COOLDOWN_MINUTES * 60 * 1000) {
            return;
        }

        // 发送告警
        notificationService.sendDingTalkAlert(title, content);

        // 记录告警时间
        bucket.set(now, ALERT_COOLDOWN_MINUTES * 2, TimeUnit.MINUTES);

        log.warn("发送支付告警: {} - {}", title, content);
    }
}
```

## 注意事项

### 1. 金额处理

```java
// ✅ 正确：使用 BigDecimal 处理金额
BigDecimal amount = new BigDecimal("10.50");
BigDecimal total = amount.multiply(new BigDecimal("2"));

// ❌ 错误：使用 double 会丢失精度
double amount = 10.50;
double total = amount * 2;  // 可能得到 20.999999...

// ✅ 正确：金额比较使用 compareTo
if (amount.compareTo(BigDecimal.ZERO) > 0) {
    // 金额大于 0
}

// ❌ 错误：使用 equals 比较（会比较精度）
if (amount.equals(new BigDecimal("10.5"))) {
    // 可能返回 false，因为精度不同
}
```

### 2. 幂等性保证

```java
// ✅ 正确：使用数据库唯一索引保证幂等
@Transactional
public void handlePaySuccess(String outTradeNo) {
    // 使用 UPDATE ... WHERE status = 'pending' 保证幂等
    int rows = orderMapper.updateStatus(outTradeNo, "pending", "paid");
    if (rows == 0) {
        log.info("订单已处理，跳过: {}", outTradeNo);
        return;
    }
    // 后续业务处理...
}

// ❌ 错误：先查询再更新（并发不安全）
public void handlePaySuccess(String outTradeNo) {
    Order order = orderMapper.selectByOutTradeNo(outTradeNo);
    if ("paid".equals(order.getStatus())) {
        return;  // 并发情况下可能多次进入
    }
    order.setStatus("paid");
    orderMapper.updateById(order);
}
```

### 3. 异常处理

```java
// ✅ 正确：区分可重试和不可重试异常
try {
    PayResponse response = payService.pay(method, request);
} catch (PayNetworkException e) {
    // 网络异常，可重试
    log.warn("支付网络异常，稍后重试: {}", e.getMessage());
    throw new RetryableException(e);
} catch (PayBusinessException e) {
    // 业务异常，不可重试
    log.error("支付业务异常: {}", e.getMessage());
    throw new ServiceException(e.getMessage());
}
```

### 4. 日志规范

```java
// ✅ 正确：关键操作记录详细日志
log.info("发起支付: outTradeNo={}, amount={}, method={}",
    outTradeNo, amount, method);
log.info("支付成功: outTradeNo={}, transactionId={}",
    outTradeNo, transactionId);
log.error("支付失败: outTradeNo={}, errorCode={}, errorMsg={}",
    outTradeNo, errorCode, errorMsg);

// ✅ 正确：敏感信息脱敏
log.info("初始化支付配置: appId={}, mchId={}",
    PayUtils.maskAppId(appId), PayUtils.maskMchId(mchId));

// ❌ 错误：记录敏感信息
log.info("支付配置: mchKey={}", mchKey);  // 禁止记录密钥
```

### 5. 回调处理

```java
// ✅ 正确：先返回成功响应，再异步处理业务
@PostMapping("/notify/wechat/{mchId}")
public String handleWxPayNotify(@PathVariable String mchId,
        @RequestBody String body, HttpServletRequest request) {
    try {
        // 1. 验证签名
        if (!verifySignature(request, body)) {
            return "<xml><return_code>FAIL</return_code></xml>";
        }

        // 2. 解析通知内容
        NotifyRequest notifyRequest = parseNotify(body);

        // 3. 异步处理业务（使用消息队列或异步线程）
        asyncProcessPaySuccess(notifyRequest);

        // 4. 立即返回成功响应
        return "<xml><return_code>SUCCESS</return_code></xml>";

    } catch (Exception e) {
        log.error("处理微信回调异常", e);
        return "<xml><return_code>FAIL</return_code></xml>";
    }
}

// ❌ 错误：同步处理所有业务后再返回
@PostMapping("/notify/wechat/{mchId}")
public String handleWxPayNotify(...) {
    // 同步处理所有业务，可能超时
    updateOrder();          // 更新订单
    sendNotification();     // 发送通知
    grantPoints();          // 发放积分
    // ... 如果处理时间过长，微信会重复推送
    return "SUCCESS";
}
```

### 6. 证书管理

```java
// ✅ 正确：证书存储在安全位置
String certPath = "/secure/certs/apiclient_cert.pem";  // 安全目录
String keyPath = "/secure/certs/apiclient_key.pem";

// ✅ 正确：使用环境变量或配置中心
String certContent = System.getenv("WX_PAY_CERT");
String keyContent = configService.getSecureConfig("wx.pay.key");

// ❌ 错误：证书放在代码仓库
String certPath = "src/main/resources/cert/apiclient_cert.pem";

// ❌ 错误：硬编码证书内容
String certContent = "-----BEGIN CERTIFICATE-----\nMIIF...";
```

### 7. 多租户隔离

```java
// ✅ 正确：每个操作都携带租户信息
public PayResponse pay(String tenantId, PayRequest request) {
    // 获取租户配置
    PayConfig config = configManager.getConfig(tenantId, request.getPaymentMethod());

    // 使用租户配置执行支付
    return payHandler.pay(request, config);
}

// ❌ 错误：使用全局配置
public PayResponse pay(PayRequest request) {
    PayConfig config = globalConfig;  // 可能导致配置混乱
    return payHandler.pay(request, config);
}
```

### 8. 并发安全

```java
// ✅ 正确：使用分布式锁防止并发问题
public PayResponse pay(PayRequest request) {
    String lockKey = "pay:lock:" + request.getOutTradeNo();
    RLock lock = redissonClient.getLock(lockKey);

    try {
        if (!lock.tryLock(5, 30, TimeUnit.SECONDS)) {
            throw new ServiceException("订单正在处理中");
        }

        // 检查订单状态
        if (orderService.isPaid(request.getOutTradeNo())) {
            throw new ServiceException("订单已支付");
        }

        // 执行支付
        return doPayment(request);

    } finally {
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
```

## 银联支付

### 银联支付概述

银联支付模块 (`ruoyi-common-pay-unionpay`) 提供了完整的银联在线支付集成方案，支持银联二维码支付、网页支付等多种支付场景。

### 支持的交易类型

| 交易类型 | 说明 | 适用场景 |
|---------|------|---------|
| WAP | 手机网站支付 | 手机浏览器内支付 |
| WEB | 网页支付 | PC端网页支付 |
| QR_CODE | 二维码支付 | 扫码支付 |
| APP | APP支付 | 原生APP支付 |

### 银联支付配置

```java
/**
 * 银联支付配置示例
 */
@Data
public class UnionpayConfig {
    /** 商户号 */
    private String merId;

    /** 签名证书路径 */
    private String signCertPath;

    /** 签名证书密码 */
    private String signCertPwd;

    /** 验签证书路径 */
    private String verifyCertPath;

    /** 加密证书路径 */
    private String encryptCertPath;

    /** 中级证书路径（可选） */
    private String middleCertPath;

    /** 根证书路径（可选） */
    private String rootCertPath;

    /** 接入类型: 0-商户直连, 1-收单机构 */
    private String accessType = "0";

    /** 渠道类型: 07-互联网, 08-移动 */
    private String channelType = "08";
}
```

### 银联支付使用示例

```java
@Service
@Slf4j
public class UnionpayPaymentService {

    @Autowired
    private PayService payService;

    /**
     * 发起银联二维码支付
     */
    public PayResponse createQrCodePayment(String orderNo, BigDecimal amount, String body) {
        PayRequest request = PayRequest.builder()
            .outTradeNo(orderNo)
            .totalFee(amount)
            .body(body)
            .tradeType("QR_CODE")
            .clientIp(ServletUtils.getClientIP())
            .build();

        PayResponse response = payService.pay(DictPaymentMethod.UNIONPAY, request);

        if (response.isSuccess()) {
            log.info("银联二维码支付创建成功: orderNo={}, qrCode={}",
                orderNo, response.getCodeUrl());
        }

        return response;
    }

    /**
     * 发起银联网页支付
     */
    public PayResponse createWebPayment(String orderNo, BigDecimal amount,
            String body, String returnUrl) {
        PayRequest request = PayRequest.builder()
            .outTradeNo(orderNo)
            .totalFee(amount)
            .body(body)
            .tradeType("WEB")
            .returnUrl(returnUrl)
            .clientIp(ServletUtils.getClientIP())
            .build();

        return payService.pay(DictPaymentMethod.UNIONPAY, request);
    }

    /**
     * 银联退款
     */
    public RefundResponse refundPayment(String orderNo, String refundNo,
            BigDecimal refundAmount, String reason) {
        RefundRequest request = RefundRequest.builder()
            .outTradeNo(orderNo)
            .outRefundNo(refundNo)
            .refundFee(refundAmount)
            .reason(reason)
            .build();

        return payService.refund(DictPaymentMethod.UNIONPAY, request);
    }
}
```

### 银联签名工具

```java
/**
 * 银联签名工具类
 */
public class UnionpaySignUtil {

    /**
     * RSA签名
     *
     * @param data       待签名数据
     * @param privateKey 私钥
     * @return 签名结果(Base64)
     */
    public static String signBySHA256WithRSA(String data, PrivateKey privateKey) {
        try {
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(privateKey);
            signature.update(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(signature.sign());
        } catch (Exception e) {
            throw new PayException("银联签名失败", e);
        }
    }

    /**
     * RSA验签
     *
     * @param data      原始数据
     * @param sign      签名
     * @param publicKey 公钥
     * @return 验签结果
     */
    public static boolean verifyBySHA256WithRSA(String data, String sign,
            PublicKey publicKey) {
        try {
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update(data.getBytes(StandardCharsets.UTF_8));
            return signature.verify(Base64.getDecoder().decode(sign));
        } catch (Exception e) {
            log.error("银联验签失败", e);
            return false;
        }
    }

    /**
     * 构建签名字符串
     *
     * @param params 参数Map
     * @return 待签名字符串
     */
    public static String buildSignString(Map<String, String> params) {
        return params.entrySet().stream()
            .filter(e -> StringUtils.isNotBlank(e.getValue()))
            .sorted(Map.Entry.comparingByKey())
            .map(e -> e.getKey() + "=" + e.getValue())
            .collect(Collectors.joining("&"));
    }
}
```

### 银联支付策略详解

`UnionpayStrategy` 实现了完整的银联开放平台支付接口，支持多种交易类型。

#### 支持的交易类型完整列表

| 交易类型 | 枚举值 | 说明 | 适用场景 |
|---------|--------|------|---------|
| 二维码支付 | `QRCODE` | PC端展示二维码，用户扫码支付 | 电商PC端、收银台 |
| WAP支付 | `WAP` | 手机网页支付（H5） | 手机浏览器、移动网页 |
| APP支付 | `APP` | 移动端APP唤起云闪付支付 | 原生APP |
| 网关支付 | `WEB` | PC网关支付，跳转银联页面 | 企业网银 |
| 小程序支付 | `JSAPI` | 微信/支付宝小程序内支付 | 小程序场景 |

#### 二维码支付流程

```java
/**
 * 银联二维码支付示例
 */
@Service
@Slf4j
public class UnionpayQrcodeExample {

    @Autowired
    private PayService payService;

    /**
     * 发起二维码支付
     */
    public PayResponse createQrcodePay(String orderNo, BigDecimal amount, String description) {
        PayRequest request = PayRequest.builder()
            .outTradeNo(orderNo)
            .totalFee(amount)
            .body(description)
            .detail("商品详情")
            .tradeType("qrcode")  // 二维码支付
            .clientIp(ServletUtils.getClientIP())
            .build();

        PayResponse response = payService.pay(DictPaymentMethod.UNIONPAY, request);

        if (response.isSuccess()) {
            log.info("银联二维码生成成功: orderNo={}", orderNo);
            log.info("二维码URL: {}", response.getCodeUrl());
            log.info("二维码Base64: {}", response.getQrCodeBase64());
        }

        return response;
    }
}
```

#### WAP/H5支付流程

```java
/**
 * 银联WAP支付（手机网页）
 */
public PayResponse createWapPay(String orderNo, BigDecimal amount,
        String description, String returnUrl) {
    PayRequest request = PayRequest.builder()
        .outTradeNo(orderNo)
        .totalFee(amount)
        .body(description)
        .tradeType("wap")  // WAP支付
        .returnUrl(returnUrl)  // 前端跳转地址
        .clientIp(ServletUtils.getClientIP())
        .build();

    PayResponse response = payService.pay(DictPaymentMethod.UNIONPAY, request);

    if (response.isSuccess()) {
        // response.getBody() 包含跳转URL
        log.info("WAP支付下单成功，跳转URL: {}", response.getBody());
    }

    return response;
}
```

#### 小程序支付流程（JSAPI）

```java
/**
 * 银联小程序支付（JSAPI）
 */
public PayResponse createJsapiPay(String orderNo, BigDecimal amount,
        String description, String openId) {
    PayRequest request = PayRequest.builder()
        .outTradeNo(orderNo)
        .totalFee(amount)
        .body(description)
        .tradeType("jsapi")  // 小程序支付
        .openId(openId)  // 用户openId
        .clientIp(ServletUtils.getClientIP())
        .build();

    PayResponse response = payService.pay(DictPaymentMethod.UNIONPAY, request);

    if (response.isSuccess()) {
        // response.getBody() 包含小程序调起参数
        log.info("小程序支付下单成功，调起参数: {}", response.getBody());
    }

    return response;
}
```

#### APP支付流程

```java
/**
 * 银联APP支付
 */
public PayResponse createAppPay(String orderNo, BigDecimal amount, String description) {
    PayRequest request = PayRequest.builder()
        .outTradeNo(orderNo)
        .totalFee(amount)
        .body(description)
        .tradeType("app")  // APP支付
        .clientIp(ServletUtils.getClientIP())
        .build();

    PayResponse response = payService.pay(DictPaymentMethod.UNIONPAY, request);

    if (response.isSuccess()) {
        // response.getBody() 包含APP调起参数
        log.info("APP支付下单成功，调起参数: {}", response.getBody());
    }

    return response;
}
```

### 银联支付回调处理

#### 回调URL格式

银联支付回调URL遵循统一格式：

```text
{baseApi}/payment/notify/unionpay/{appid}/{type}
```

| 参数 | 说明 | 示例 |
|------|------|------|
| `baseApi` | 系统配置的API基础地址 | `https://api.example.com` |
| `appid` | 银联应用ID | `UP12345678` |
| `type` | 回调类型 | `pay`（支付）、`refund`（退款） |

#### 回调处理流程

```java
/**
 * 银联支付回调控制器示例
 */
@RestController
@RequestMapping("/payment/notify/unionpay")
@Slf4j
public class UnionpayNotifyController {

    @Autowired
    private PayService payService;

    /**
     * 支付回调
     */
    @PostMapping("/{appid}/pay")
    public String handlePayNotify(@PathVariable String appid,
                                   HttpServletRequest request) {
        log.info("收到银联支付回调: appid={}", appid);

        // 构建回调请求
        NotifyRequest notifyRequest = NotifyRequest.builder()
            .mchId(appid)  // mchId字段用于传递appid
            .formData(getFormData(request))
            .build();

        // 处理回调
        NotifyResponse response = payService.handleNotify(
            DictPaymentMethod.UNIONPAY, notifyRequest);

        // 返回银联要求的响应格式
        return response.isSuccess() ? "success" : "fail";
    }

    /**
     * 退款回调
     */
    @PostMapping("/{appid}/refund")
    public String handleRefundNotify(@PathVariable String appid,
                                      HttpServletRequest request) {
        log.info("收到银联退款回调: appid={}", appid);

        NotifyRequest notifyRequest = NotifyRequest.builder()
            .mchId(appid)
            .formData(getFormData(request))
            .build();

        NotifyResponse response = payService.handleNotify(
            DictPaymentMethod.UNIONPAY, notifyRequest);

        return response.isSuccess() ? "success" : "fail";
    }

    private Map<String, String> getFormData(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values != null && values.length > 0) {
                params.put(key, values[0]);
            }
        });
        return params;
    }
}
```

#### 支付成功事件监听

```java
/**
 * 银联支付成功事件监听器
 */
@Component
@Slf4j
public class UnionpaySuccessListener {

    @EventListener
    public void onPaySuccess(PaySuccessEvent event) {
        // 仅处理银联支付
        if (!DictPaymentMethod.UNIONPAY.getValue().equals(event.getPaymentMethod())) {
            return;
        }

        log.info("银联支付成功: outTradeNo={}, transactionId={}, amount={}",
            event.getOutTradeNo(),
            event.getTransactionId(),
            event.getTotalFee());

        // 业务处理：更新订单状态、发送通知等
        processPaymentSuccess(event);
    }

    private void processPaymentSuccess(PaySuccessEvent event) {
        // 1. 更新订单状态
        // 2. 记录支付日志
        // 3. 发送支付成功通知
    }
}
```

### 银联签名工具详解

银联支付模块提供完整的签名验签工具，支持 RSA 和 SM2（国密）两种算法。

#### RSA签名方式

```java
/**
 * RSA签名示例
 */
public class RsaSignExample {

    /**
     * 生成请求签名
     */
    public String signRequest(Map<String, Object> params, String privateKey) {
        // 使用SHA256withRSA算法签名
        return UnionpaySignUtil.signWithRsa(params, privateKey);
    }

    /**
     * 验证响应签名
     */
    public boolean verifyResponse(Map<String, Object> params,
            String sign, String publicKey) {
        return UnionpaySignUtil.verifyWithRsa(params, sign, publicKey);
    }
}
```

#### SM2国密签名方式

银联支付支持SM2国密算法，适用于对安全性有特殊要求的场景。

```java
/**
 * SM2国密签名示例
 */
public class Sm2SignExample {

    /**
     * 使用SM2生成签名
     */
    public String signWithSm2(Map<String, Object> params, String privateKey) {
        // 使用SM3withSM2算法签名
        return UnionpaySignUtil.signWithSm2(params, privateKey);
    }

    /**
     * 使用SM2验证签名
     */
    public boolean verifyWithSm2(Map<String, Object> params,
            String sign, String publicKey) {
        return UnionpaySignUtil.verifyWithSm2(params, sign, publicKey);
    }
}
```

#### 签名字符串构建规则

银联签名遵循以下规则：

1. **参数排序**: 按参数名 ASCII 码从小到大排序
2. **空值过滤**: 排除空值参数和签名字段本身
3. **拼接格式**: `key1=value1&key2=value2&...`

```java
/**
 * 签名字符串构建示例
 */
public void buildSignDataExample() {
    Map<String, Object> params = new LinkedHashMap<>();
    params.put("appId", "UP12345678");
    params.put("outTradeNo", "ORDER20231215001");
    params.put("totalAmount", 10000);
    params.put("timestamp", "1702627200000");
    params.put("nonceStr", "abc123def456");
    params.put("emptyField", "");  // 空值会被过滤
    params.put("nullField", null);  // null值会被过滤

    // 最终签名字符串（按key排序）:
    // appId=UP12345678&nonceStr=abc123def456&outTradeNo=ORDER20231215001&timestamp=1702627200000&totalAmount=10000
}
```

### 银联测试环境配置

银联提供独立的测试环境用于开发调试。

#### 测试环境网关地址

| 环境 | 网关地址 |
|------|---------|
| 生产环境 | `https://open.unionpay.com/gateway/api/` |
| 测试环境 | `https://open.test.unionpay.com/gateway/api/` |

#### 测试环境配置示例

```yaml
# application-dev.yml
ruoyi:
  pay:
    unionpay:
      # 测试环境配置
      test-mode: true
      gateway-url: https://open.test.unionpay.com/gateway/api/

      # 测试商户信息（银联提供）
      app-id: ${UNIONPAY_TEST_APP_ID}
      mch-id: ${UNIONPAY_TEST_MCH_ID}

      # 证书配置
      cert-path: classpath:cert/test/unionpay_cert.pem
      key-path: classpath:cert/test/unionpay_key.pem
      platform-cert-path: classpath:cert/test/unionpay_platform.pem
```

### 银联支付自动配置

银联支付模块通过 Spring Boot 自动配置机制自动注册相关组件。

#### 自动注册的Bean

| Bean | 类名 | 说明 |
|------|------|------|
| 客户端注册表 | `UnionpayClientRegistry` | 管理银联客户端实例 |
| 支付策略 | `UnionpayStrategy` | 执行具体支付逻辑 |
| 支付处理器 | `UnionpayHandler` | 实现 PayHandler 接口 |
| 初始化器 | `UnionpayInitializer` | 初始化银联配置 |

#### 条件配置

```yaml
# 启用/禁用银联支付模块
module:
  pay-enabled: true  # 默认启用
```

### 银联支付常见问题

#### 1. 签名失败

**问题原因**:
- 私钥格式不正确
- 参数排序错误
- 包含不可见字符

**解决方案**:
```java
// 确保私钥为标准PEM格式
String privateKey = """
    -----BEGIN PRIVATE KEY-----
    MIIEvgIBADANBgkqhkiG9w0B...
    -----END PRIVATE KEY-----
    """;

// 或从文件读取
String privateKey = Files.readString(Path.of("cert/private_key.pem"));
```

#### 2. 验签失败

**问题原因**:
- 平台公钥配置错误
- 响应参数被修改
- 签名字段未正确排除

**解决方案**:
```java
// 确保使用银联平台提供的公钥
String platformPublicKey = config.getPlatformCertPath();

// 验签前移除sign字段
Map<String, Object> verifyParams = new HashMap<>(responseParams);
verifyParams.remove("sign");

boolean verified = UnionpaySignUtil.verifyWithRsa(
    verifyParams,
    responseParams.get("sign").toString(),
    platformPublicKey
);
```

#### 3. 回调接收不到

**问题原因**:
- 回调URL不可访问
- 防火墙拦截
- URL格式错误

**解决方案**:
```java
// 确保回调URL外网可访问
// 格式: {baseApi}/payment/notify/unionpay/{appid}/pay

// 检查配置
@Value("${ruoyi.app.base-api}")
private String baseApi;

// 确保baseApi为外网地址
// 正确: https://api.example.com
// 错误: http://localhost:8080
```

#### 4. 金额精度问题

**问题原因**:
- 金额单位不一致
- 浮点数精度丢失

**解决方案**:
```java
// 系统使用元为单位，API使用分为单位
BigDecimal amountYuan = new BigDecimal("0.01");  // 1分钱

// 转换为分（内部自动处理）
int amountFen = amountYuan
    .multiply(new BigDecimal("100"))
    .intValue();  // 1分
```

## 配置管理详解

### PayConfig 配置类

`PayConfig` 是支付模块的核心配置类，支持多租户隔离和多种证书配置方式。

```java
/**
 * PayConfig 配置选项详解
 */
@Data
public class PayConfig {
    // ==================== 基础配置 ====================

    /** 配置唯一标识: {tenantId}:{paymentMethod}:{appid} */
    private String configId;

    /** 租户ID */
    private String tenantId;

    /** 支付方式 */
    private DictPaymentMethod paymentMethod;

    /** 应用ID (微信appid/支付宝appid等) */
    private String appid;

    /** 商户号 */
    private String mchId;

    /** 商户名称 */
    private String mchName;

    // ==================== 微信支付配置 ====================

    /** 商户密钥 (v2 API) */
    private String mchKey;

    /** API v3 密钥 */
    private String apiV3Key;

    /** 证书序列号 */
    private String certSerialNo;

    /** 商户证书路径 */
    private String certPath;

    /** 商户私钥路径 */
    private String keyPath;

    /** 平台证书/公钥路径 */
    private String platformCertPath;

    /** p12证书路径 (v2退款专用) */
    private String p12CertPath;

    // ==================== 支付宝配置 ====================

    /** 支付宝公钥 */
    private String alipayPublicKey;

    // ==================== 状态配置 ====================

    /** 是否为默认配置 */
    private boolean defaultConfig;

    /** 是否启用 */
    private boolean enabled;
}
```

### 证书配置智能识别

系统支持多种证书配置方式，自动识别证书类型：

```java
/**
 * 证书配置方式示例
 */
public class CertConfigExample {

    /**
     * 方式1: 文件路径
     */
    public void configByFilePath() {
        PayConfig config = new PayConfig();

        // classpath 路径
        config.setCertPath("classpath:cert/apiclient_cert.pem");
        config.setKeyPath("classpath:cert/apiclient_key.pem");

        // 文件系统路径
        config.setCertPath("/data/cert/apiclient_cert.pem");
        config.setKeyPath("/data/cert/apiclient_key.pem");
    }

    /**
     * 方式2: PEM内容直接配置
     * 系统自动识别 -----BEGIN 开头的内容为PEM格式
     */
    public void configByPemContent() {
        PayConfig config = new PayConfig();

        config.setCertPath("""
            -----BEGIN CERTIFICATE-----
            MIIFazCCBFOgAwIBAgISBKSq...
            -----END CERTIFICATE-----
            """);

        config.setKeyPath("""
            -----BEGIN PRIVATE KEY-----
            MIIEvgIBADANBgkqhkiG9w0B...
            -----END PRIVATE KEY-----
            """);
    }

    /**
     * 方式3: 公钥模式 (微信支付v3)
     * 系统通过文件名或内容自动识别
     */
    public void configByPublicKey() {
        PayConfig config = new PayConfig();

        // 文件名包含 public/pubkey 会自动识别为公钥模式
        config.setPlatformCertPath("cert/wechatpay_public_key.pem");

        // 或直接配置公钥内容
        config.setPlatformCertPath("""
            -----BEGIN PUBLIC KEY-----
            MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...
            -----END PUBLIC KEY-----
            """);
    }
}
```

### PKCS#1 到 PKCS#8 自动转换

支付宝 SDK 要求使用 PKCS#8 格式私钥，系统自动进行格式转换：

```java
/**
 * 私钥格式自动转换
 *
 * 如果配置的私钥是 PKCS#1 格式 (-----BEGIN RSA PRIVATE KEY-----)
 * 系统会自动转换为 PKCS#8 格式 (-----BEGIN PRIVATE KEY-----)
 */
public class PrivateKeyConversion {

    // 输入: PKCS#1 格式
    String pkcs1Key = """
        -----BEGIN RSA PRIVATE KEY-----
        MIIEowIBAAKCAQEA0m59l2u9iDnMbrXH...
        -----END RSA PRIVATE KEY-----
        """;

    // 系统自动转换为: PKCS#8 格式
    String pkcs8Key = """
        -----BEGIN PRIVATE KEY-----
        MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKg...
        -----END PRIVATE KEY-----
        """;

    // 转换过程对业务透明，无需手动处理
}
```

### 配置验证

```java
/**
 * 配置验证示例
 */
public class ConfigValidation {

    public boolean validateConfig(PayConfig config) {
        // 1. 基础验证
        if (!config.isValid()) {
            log.error("支付配置无效: configId={}", config.getConfigId());
            return false;
        }

        // 2. 微信支付配置验证
        if (config.getPaymentMethod() == DictPaymentMethod.WECHAT) {
            // 检查是否有v3配置
            if (config.hasApiV3Config()) {
                log.info("使用微信支付v3 API");

                // 检查是否有完整的v3配置
                if (config.hasCompleteV3Config()) {
                    log.info("v3配置完整（含平台证书）");
                }

                // 检查是否使用公钥模式
                if (config.isWxPublicKeyMode()) {
                    log.info("使用公钥模式验签");
                }
            } else {
                log.info("使用微信支付v2 API");
            }
        }

        // 3. 支付宝配置验证
        if (config.getPaymentMethod() == DictPaymentMethod.ALIPAY) {
            if (config.isCertMode()) {
                log.info("使用支付宝证书模式");
            } else {
                log.info("使用支付宝公钥模式");
            }
        }

        return true;
    }
}
```

## 异常处理体系

### PayException 异常类

```java
/**
 * 支付异常基类
 */
public class PayException extends RuntimeException {

    /** 错误码 */
    private String errorCode;

    public PayException(String message) {
        super(message);
    }

    public PayException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public PayException(String message, Throwable cause) {
        super(message, cause);
    }

    public PayException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    // 静态工厂方法
    public static PayException of(String message) {
        return new PayException(message);
    }

    public static PayException of(String message, Throwable cause) {
        return new PayException(message, cause);
    }

    public static PayException of(String errorCode, String message) {
        return new PayException(errorCode, message);
    }
}
```

### 常见异常类型

```java
/**
 * 配置未找到异常
 */
public class ConfigNotFoundException extends PayException {
    public ConfigNotFoundException(String message) {
        super("CONFIG_NOT_FOUND", message);
    }
}

/**
 * 微信支付异常
 */
public class WxPayException extends PayException {
    public WxPayException(String errorCode, String message) {
        super(errorCode, message);
    }
}

/**
 * 签名验证异常
 */
public class SignatureException extends PayException {
    public SignatureException(String message) {
        super("SIGNATURE_ERROR", message);
    }
}
```

### 异常处理最佳实践

```java
/**
 * 支付异常处理服务
 */
@Service
@Slf4j
public class PayExceptionHandler {

    /**
     * 处理支付异常
     */
    public PayResponse handlePayException(String outTradeNo, Exception e) {
        // 1. 配置未找到
        if (e instanceof ConfigNotFoundException) {
            log.error("支付配置未找到: outTradeNo={}, error={}",
                outTradeNo, e.getMessage());
            return PayResponse.fail("支付配置错误，请联系客服");
        }

        // 2. 微信支付异常
        if (e instanceof WxPayException wxe) {
            log.error("微信支付异常: outTradeNo={}, errorCode={}, errorMsg={}",
                outTradeNo, wxe.getErrorCode(), wxe.getMessage());

            // 根据错误码返回友好提示
            return PayResponse.fail(getWxPayErrorMessage(wxe.getErrorCode()));
        }

        // 3. 网络异常
        if (e instanceof ConnectException || e instanceof SocketTimeoutException) {
            log.error("支付网络异常: outTradeNo={}", outTradeNo, e);
            return PayResponse.fail("网络异常，请稍后重试");
        }

        // 4. 其他异常
        log.error("支付未知异常: outTradeNo={}", outTradeNo, e);
        return PayResponse.fail("支付失败，请稍后重试");
    }

    /**
     * 获取微信支付错误码对应的友好提示
     */
    private String getWxPayErrorMessage(String errorCode) {
        return switch (errorCode) {
            case "ORDERPAID" -> "订单已支付，请勿重复支付";
            case "ORDERNOTEXIST" -> "订单不存在";
            case "ORDERCLOSED" -> "订单已关闭";
            case "SYSTEMERROR" -> "系统繁忙，请稍后重试";
            case "BANKERROR" -> "银行系统异常，请稍后重试";
            case "USERPAYING" -> "用户支付中，请等待";
            case "NOTENOUGH" -> "余额不足";
            default -> "支付失败，请稍后重试";
        };
    }
}
```

## 测试策略

### 单元测试

```java
/**
 * PayUtils 单元测试
 */
@ExtendWith(MockitoExtension.class)
class PayUtilsTest {

    @Test
    void testGenerateOutTradeNo() {
        String outTradeNo1 = PayUtils.generateOutTradeNo();
        String outTradeNo2 = PayUtils.generateOutTradeNo();

        // 验证格式
        assertThat(outTradeNo1).startsWith("PAY");
        assertThat(outTradeNo1).hasSize(23); // PAY + 14位时间 + 6位随机数

        // 验证唯一性
        assertThat(outTradeNo1).isNotEqualTo(outTradeNo2);
    }

    @Test
    void testGenerateOutTradeNoWithPrefix() {
        String outTradeNo = PayUtils.generateOutTradeNo("ORDER");
        assertThat(outTradeNo).startsWith("ORDER");
    }

    @Test
    void testYuanToFen() {
        assertThat(PayUtils.yuanToFen(new BigDecimal("10.50"))).isEqualTo(1050);
        assertThat(PayUtils.yuanToFen(new BigDecimal("0.01"))).isEqualTo(1);
        assertThat(PayUtils.yuanToFen(new BigDecimal("100"))).isEqualTo(10000);
        assertThat(PayUtils.yuanToFen(null)).isEqualTo(0);
    }

    @Test
    void testFenToYuan() {
        assertThat(PayUtils.fenToYuan(1050)).isEqualTo(new BigDecimal("10.50"));
        assertThat(PayUtils.fenToYuan(1)).isEqualTo(new BigDecimal("0.01"));
        assertThat(PayUtils.fenToYuan(10000)).isEqualTo(new BigDecimal("100.00"));
    }

    @Test
    void testYuanToFenRounding() {
        // 测试四舍五入
        assertThat(PayUtils.yuanToFen(new BigDecimal("10.555")))
            .isEqualTo(1056); // 四舍五入
        assertThat(PayUtils.yuanToFen(new BigDecimal("10.554")))
            .isEqualTo(1055);
    }

    @Test
    void testGenerateNonceStr() {
        String nonce1 = PayUtils.generateNonceStr();
        String nonce2 = PayUtils.generateNonceStr();

        assertThat(nonce1).hasSize(32);
        assertThat(nonce1).isNotEqualTo(nonce2);
    }

    @Test
    void testGenerateTimestamp() {
        long timestamp = PayUtils.generateTimestamp();
        long currentSeconds = System.currentTimeMillis() / 1000;

        // 时间戳应该在合理范围内
        assertThat(timestamp).isBetween(currentSeconds - 1, currentSeconds + 1);
    }

    @Test
    void testStringToDecimal() {
        assertThat(PayUtils.stringToDecimal("10.50"))
            .isEqualTo(new BigDecimal("10.50"));
        assertThat(PayUtils.stringToDecimal("  100  "))
            .isEqualTo(new BigDecimal("100.00"));
        assertThat(PayUtils.stringToDecimal(null))
            .isEqualTo(BigDecimal.ZERO);
        assertThat(PayUtils.stringToDecimal(""))
            .isEqualTo(BigDecimal.ZERO);
    }

    @Test
    void testStringToDecimalInvalid() {
        assertThrows(IllegalArgumentException.class,
            () -> PayUtils.stringToDecimal("invalid"));
    }
}
```

### 支付处理器测试

```java
/**
 * WxPayHandler 测试
 */
@ExtendWith(MockitoExtension.class)
class WxPayHandlerTest {

    @Mock
    private PayConfigManager configManager;

    @Mock
    private PayVersionSelector versionSelector;

    @Mock
    private WxPayV2Strategy v2Strategy;

    @Mock
    private WxPayV3Strategy v3Strategy;

    @InjectMocks
    private WxPayHandler wxPayHandler;

    @Test
    void testPayWithV3() {
        // 准备测试数据
        PayRequest request = PayRequest.builder()
            .appid("wx1234567890")
            .outTradeNo("ORDER202412120001")
            .totalFee(new BigDecimal("10.00"))
            .body("测试商品")
            .tradeType("JSAPI")
            .openId("oXXXX")
            .build();

        PayConfig config = new PayConfig();
        config.setAppid("wx1234567890");
        config.setMchId("1234567890");
        config.setApiV3Key("apiV3Key");
        config.setCertSerialNo("certSerialNo");

        PayResponse expectedResponse = PayResponse.builder()
            .success(true)
            .outTradeNo("ORDER202412120001")
            .build();

        // Mock 行为
        when(configManager.getConfigByAppid("wx1234567890")).thenReturn(config);
        when(versionSelector.selectWxPayVersion(config)).thenReturn(WxPayVersion.V3);
        when(v3Strategy.executePay(any(), any())).thenReturn(expectedResponse);

        // 执行测试
        PayResponse response = wxPayHandler.pay(request);

        // 验证结果
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getOutTradeNo()).isEqualTo("ORDER202412120001");

        // 验证调用
        verify(v3Strategy).executePay(any(), any());
        verify(v2Strategy, never()).executePay(any(), any());
    }

    @Test
    void testPayWithV2() {
        PayRequest request = PayRequest.builder()
            .appid("wx1234567890")
            .outTradeNo("ORDER202412120002")
            .totalFee(new BigDecimal("10.00"))
            .body("测试商品")
            .tradeType("JSAPI")
            .openId("oXXXX")
            .build();

        PayConfig config = new PayConfig();
        config.setAppid("wx1234567890");
        config.setMchId("1234567890");
        config.setMchKey("mchKey"); // 只有v2密钥

        PayResponse expectedResponse = PayResponse.builder()
            .success(true)
            .outTradeNo("ORDER202412120002")
            .build();

        when(configManager.getConfigByAppid("wx1234567890")).thenReturn(config);
        when(versionSelector.selectWxPayVersion(config)).thenReturn(WxPayVersion.V2);
        when(v2Strategy.executePay(any(), any())).thenReturn(expectedResponse);

        PayResponse response = wxPayHandler.pay(request);

        assertThat(response.isSuccess()).isTrue();
        verify(v2Strategy).executePay(any(), any());
        verify(v3Strategy, never()).executePay(any(), any());
    }

    @Test
    void testPayConfigNotFound() {
        PayRequest request = PayRequest.builder()
            .appid("wx_not_exist")
            .outTradeNo("ORDER202412120003")
            .totalFee(new BigDecimal("10.00"))
            .build();

        when(configManager.getConfigByAppid("wx_not_exist"))
            .thenThrow(new ConfigNotFoundException("配置不存在"));

        PayResponse response = wxPayHandler.pay(request);

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("配置不存在");
    }
}
```

### 集成测试

```java
/**
 * 支付服务集成测试
 */
@SpringBootTest
@ActiveProfiles("test")
class PayServiceIntegrationTest {

    @Autowired
    private PayService payService;

    @Autowired
    private PayOrderMapper payOrderMapper;

    @MockBean
    private WxPayHandler wxPayHandler;

    @BeforeEach
    void setUp() {
        // 清理测试数据
        payOrderMapper.delete(new LambdaQueryWrapper<PayOrder>()
            .like(PayOrder::getOutTradeNo, "TEST_"));
    }

    @Test
    void testPaymentFlow() {
        // 1. 创建支付请求
        PayRequest request = PayRequest.createWxJsapiRequest(
            "wx1234567890",
            "1234567890",
            "测试商品",
            "TEST_ORDER_001",
            new BigDecimal("0.01"),
            "oXXXX",
            "127.0.0.1"
        );

        // 2. Mock 微信支付响应
        PayResponse mockResponse = PayResponse.builder()
            .success(true)
            .outTradeNo("TEST_ORDER_001")
            .prepayId("wx_prepay_id")
            .build();
        when(wxPayHandler.pay(any())).thenReturn(mockResponse);

        // 3. 执行支付
        PayResponse response = payService.pay(DictPaymentMethod.WECHAT, request);

        // 4. 验证结果
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getOutTradeNo()).isEqualTo("TEST_ORDER_001");

        // 5. 验证订单记录
        PayOrder order = payOrderMapper.selectOne(new LambdaQueryWrapper<PayOrder>()
            .eq(PayOrder::getOutTradeNo, "TEST_ORDER_001"));
        assertThat(order).isNotNull();
        assertThat(order.getStatus()).isEqualTo("PAYING");
    }

    @Test
    void testPaymentCallback() {
        // 1. 准备测试订单
        PayOrder order = new PayOrder();
        order.setOutTradeNo("TEST_CALLBACK_001");
        order.setTotalAmount(new BigDecimal("0.01"));
        order.setStatus("PAYING");
        payOrderMapper.insert(order);

        // 2. 模拟回调请求
        NotifyRequest notifyRequest = new NotifyRequest();
        notifyRequest.setOutTradeNo("TEST_CALLBACK_001");
        notifyRequest.setTransactionId("wx_transaction_id");
        notifyRequest.setTotalFee("1");

        NotifyResponse mockNotifyResponse = NotifyResponse.success("TEST_CALLBACK_001");
        when(wxPayHandler.handleNotify(any())).thenReturn(mockNotifyResponse);

        // 3. 处理回调
        NotifyResponse response = payService.handleNotify(
            DictPaymentMethod.WECHAT, notifyRequest);

        // 4. 验证结果
        assertThat(response.isSuccess()).isTrue();

        // 5. 验证订单状态更新
        PayOrder updatedOrder = payOrderMapper.selectOne(new LambdaQueryWrapper<PayOrder>()
            .eq(PayOrder::getOutTradeNo, "TEST_CALLBACK_001"));
        assertThat(updatedOrder.getStatus()).isEqualTo("SUCCESS");
    }
}
```

### Mock 支付服务器

```java
/**
 * 支付Mock服务器（用于本地开发和测试）
 */
@RestController
@RequestMapping("/mock/pay")
@Profile({"dev", "test"})
@Slf4j
public class MockPayController {

    /**
     * Mock 微信支付统一下单
     */
    @PostMapping("/wx/unified-order")
    public Map<String, Object> mockWxUnifiedOrder(@RequestBody Map<String, Object> request) {
        log.info("Mock微信统一下单: {}", request);

        String outTradeNo = (String) request.get("out_trade_no");

        Map<String, Object> response = new HashMap<>();
        response.put("return_code", "SUCCESS");
        response.put("result_code", "SUCCESS");
        response.put("prepay_id", "wx_mock_" + System.currentTimeMillis());
        response.put("trade_type", request.get("trade_type"));
        response.put("out_trade_no", outTradeNo);

        // NATIVE支付返回二维码链接
        if ("NATIVE".equals(request.get("trade_type"))) {
            response.put("code_url", "weixin://wxpay/bizpayurl?pr=MOCK" + outTradeNo);
        }

        return response;
    }

    /**
     * Mock 微信支付查询
     */
    @PostMapping("/wx/query")
    public Map<String, Object> mockWxQuery(@RequestBody Map<String, Object> request) {
        log.info("Mock微信查询: {}", request);

        Map<String, Object> response = new HashMap<>();
        response.put("return_code", "SUCCESS");
        response.put("result_code", "SUCCESS");
        response.put("trade_state", "SUCCESS");
        response.put("out_trade_no", request.get("out_trade_no"));
        response.put("transaction_id", "mock_" + System.currentTimeMillis());

        return response;
    }

    /**
     * Mock 支付宝支付
     */
    @PostMapping("/alipay/pay")
    public Map<String, Object> mockAlipayPay(@RequestBody Map<String, Object> request) {
        log.info("Mock支付宝支付: {}", request);

        Map<String, Object> response = new HashMap<>();
        response.put("code", "10000");
        response.put("msg", "Success");
        response.put("out_trade_no", request.get("out_trade_no"));
        response.put("trade_no", "alipay_mock_" + System.currentTimeMillis());

        return response;
    }

    /**
     * 模拟支付回调（用于测试）
     */
    @PostMapping("/simulate-callback")
    public String simulateCallback(@RequestBody SimulateCallbackRequest request) {
        log.info("模拟支付回调: {}", request);

        // 这里可以调用实际的回调处理逻辑进行测试
        // payService.handleNotify(...)

        return "OK";
    }

    @Data
    static class SimulateCallbackRequest {
        private String outTradeNo;
        private String paymentMethod;
        private String tradeState;
        private BigDecimal amount;
    }
}
```

## 版本迁移指南

### 从 v2 迁移到 v3 (微信支付)

```java
/**
 * 微信支付 v2 到 v3 迁移指南
 */
public class WxPayMigrationGuide {

    /**
     * 步骤1: 更新配置
     *
     * v2 配置:
     * - mchKey: 商户密钥
     * - certPath: p12证书路径（仅退款需要）
     *
     * v3 配置:
     * - apiV3Key: API v3密钥
     * - certSerialNo: 证书序列号
     * - certPath: 商户证书 (apiclient_cert.pem)
     * - keyPath: 商户私钥 (apiclient_key.pem)
     * - platformCertPath: 平台证书或公钥
     */

    /**
     * 步骤2: 证书准备
     *
     * 1. 登录微信支付商户平台
     * 2. 账户中心 -> API安全 -> 申请API证书
     * 3. 下载证书包，包含:
     *    - apiclient_cert.pem (商户证书)
     *    - apiclient_key.pem (商户私钥)
     *    - apiclient_cert.p12 (p12格式证书)
     * 4. 设置API v3密钥
     * 5. 下载平台证书或使用公钥模式
     */

    /**
     * 步骤3: 配置示例
     */
    public PayConfig createV3Config() {
        PayConfig config = new PayConfig();
        config.setAppid("wx1234567890123456");
        config.setMchId("1234567890");

        // v3 必需配置
        config.setApiV3Key("your-api-v3-key-32-chars");
        config.setCertSerialNo("your-cert-serial-number");
        config.setCertPath("classpath:cert/apiclient_cert.pem");
        config.setKeyPath("classpath:cert/apiclient_key.pem");

        // 平台证书或公钥（二选一）
        // 方式1: 平台证书
        config.setPlatformCertPath("classpath:cert/wechatpay_platform.pem");
        // 方式2: 公钥模式
        // config.setPlatformCertPath("classpath:cert/wechatpay_public_key.pem");

        return config;
    }

    /**
     * 步骤4: 兼容处理
     *
     * 系统会自动选择 v2 或 v3:
     * - 如果配置了 apiV3Key + certSerialNo -> 使用 v3
     * - 如果只配置了 mchKey -> 使用 v2
     *
     * 可以同时配置 v2 和 v3 参数，实现平滑过渡
     */
    public PayConfig createCompatibleConfig() {
        PayConfig config = new PayConfig();

        // 同时配置 v2 和 v3
        config.setMchKey("v2-mch-key");  // v2 兜底
        config.setApiV3Key("v3-api-key"); // 优先使用 v3
        config.setCertSerialNo("cert-serial");
        config.setCertPath("classpath:cert/apiclient_cert.pem");
        config.setKeyPath("classpath:cert/apiclient_key.pem");

        return config;
    }
}
```

### 多租户配置迁移

```java
/**
 * 从单租户迁移到多租户
 */
public class MultiTenantMigrationGuide {

    /**
     * 步骤1: 配置ID格式变更
     *
     * 单租户格式: {paymentMethod}:{appid}
     * 多租户格式: {tenantId}:{paymentMethod}:{appid}
     */

    /**
     * 步骤2: 数据迁移脚本
     */
    public void migrateConfigs() {
        // 查询所有旧配置
        List<PayConfig> oldConfigs = configMapper.selectList(
            new LambdaQueryWrapper<PayConfig>()
                .isNull(PayConfig::getTenantId)
        );

        for (PayConfig config : oldConfigs) {
            // 设置默认租户ID
            config.setTenantId("000000");

            // 更新配置ID
            config.updateConfigId();

            // 保存
            configMapper.updateById(config);
        }
    }

    /**
     * 步骤3: 代码调整
     *
     * 旧代码:
     * PayConfig config = configManager.getConfig(paymentMethod, appid);
     *
     * 新代码:
     * String tenantId = LoginHelper.getTenantId();
     * PayConfig config = configManager.getConfig(tenantId, paymentMethod, appid);
     */
}
```

## 调试技巧

### 支付调试日志

```java
/**
 * 启用详细支付日志
 */
@Configuration
public class PayDebugConfig {

    @Bean
    @Profile("dev")
    public PayDebugInterceptor payDebugInterceptor() {
        return new PayDebugInterceptor();
    }
}

/**
 * 支付调试拦截器
 */
@Slf4j
public class PayDebugInterceptor implements PayInterceptor {

    @Override
    public void beforePay(PayRequest request) {
        log.debug("========== 支付请求开始 ==========");
        log.debug("订单号: {}", request.getOutTradeNo());
        log.debug("金额: {} 元", request.getTotalFee());
        log.debug("支付方式: {}", request.getTradeType());
        log.debug("AppID: {}", request.getAppid());
        log.debug("OpenID: {}", maskOpenId(request.getOpenId()));
        log.debug("========================================");
    }

    @Override
    public void afterPay(PayRequest request, PayResponse response, long costTime) {
        log.debug("========== 支付响应结束 ==========");
        log.debug("订单号: {}", request.getOutTradeNo());
        log.debug("结果: {}", response.isSuccess() ? "成功" : "失败");
        log.debug("耗时: {} ms", costTime);
        if (!response.isSuccess()) {
            log.debug("错误码: {}", response.getErrorCode());
            log.debug("错误信息: {}", response.getMessage());
        }
        log.debug("========================================");
    }

    private String maskOpenId(String openId) {
        if (StringUtils.isBlank(openId) || openId.length() < 8) {
            return "****";
        }
        return openId.substring(0, 4) + "****" + openId.substring(openId.length() - 4);
    }
}
```

### 常用调试命令

```bash
# 查看支付日志
tail -f logs/pay.log | grep -E "(支付请求|支付响应|回调)"

# 查看支付异常
grep -i "error\|exception" logs/pay.log | tail -100

# 统计支付成功率
grep "支付响应" logs/pay.log | grep "成功" | wc -l
grep "支付响应" logs/pay.log | grep "失败" | wc -l

# 查看特定订单的支付链路
grep "ORDER_12345" logs/pay.log

# Redis 查看支付锁状态
redis-cli keys "pay:lock:*"
redis-cli ttl "pay:lock:ORDER_12345"

# 查看配置缓存
redis-cli keys "pay:config:*"
redis-cli get "pay:config:000000:wechat:wx1234567890"
```
