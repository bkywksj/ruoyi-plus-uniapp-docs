# 业务模块概览 (business)

业务模块是系统的核心业务逻辑实现层，包含了多个业务子模块，每个模块负责特定的业务领域功能。

## 模块结构

```
business/
├── base/           # 基础服务模块
├── mall/           # 商城业务模块  
├── job/            # 任务调度模块
└── api/            # API接口模块
```

## 核心特性

### 🏗️ 模块化设计
- **基础服务 (base)**: 提供平台配置、支付配置、广告管理等基础服务
- **商城模块 (mall)**: 实现商品管理、订单处理、支付流程等电商功能
- **任务调度 (job)**: 提供定时任务和异步作业处理能力
- **API接口 (api)**: 统一的外部接口服务层

### 🔧 技术架构
- **多租户支持**: 基于 `TenantEntity` 实现多租户数据隔离
- **统一认证**: 支持小程序、公众号等多平台登录认证
- **支付集成**: 统一支付网关，支持微信、支付宝等多种支付方式
- **事件驱动**: 基于 Spring Event 实现业务解耦

### 📱 多平台支持
- 微信小程序 (MP_WEIXIN)
- 微信公众号 (MP_OFFICIAL_ACCOUNT)
- 支付宝小程序 (MP_ALIPAY)
- QQ小程序 (MP_QQ)
- 其他主流平台

### 💳 支付能力
- 微信支付 (WECHAT)
- 支付宝支付 (ALIPAY)
- 银联支付 (UNIONPAY)
- 余额支付 (BALANCE)
- 积分支付 (POINTS)

## 业务流程

### 用户认证流程
1. 前端通过平台授权获取 code
2. 后端根据平台类型选择对应认证策略
3. 通过 code 换取用户信息 (openid、unionid)
4. 查找或创建用户账号绑定
5. 生成 JWT 令牌完成登录

### 订单支付流程
1. 创建订单并生成订单号
2. 选择支付方式发起支付
3. 调用对应支付平台API
4. 接收支付回调通知
5. 更新订单状态并触发后续业务

### 多租户隔离
- 数据层面：通过 `tenant_id` 字段实现数据隔离
- 配置层面：支付配置、平台配置按租户独立管理
- 服务层面：通过 `TenantHelper` 实现动态租户切换

## 设计原则

### 📋 单一职责
每个模块专注于特定的业务领域，职责边界清晰

### 🔌 开闭原则
通过策略模式和工厂模式，支持新平台和支付方式的扩展

### 🎯 依赖注入
大量使用 Spring 依赖注入，降低模块间耦合

### 🔄 事件驱动
关键业务节点通过事件机制实现解耦和扩展

## 关键组件

### 认证策略
- `MiniappAuthStrategy`: 小程序认证实现
- `MpAuthStrategy`: 公众号认证实现
- `IAuthStrategy`: 认证策略接口

### 支付服务
- `PayService`: 统一支付服务接口
- `OrderPayController`: 支付控制器
- `PayNotifyController`: 支付回调处理

### 基础服务
- `PlatformService`: 平台配置服务
- `PaymentService`: 支付配置服务
- `IBindService`: 账号绑定服务

## 快速开始

### 配置平台信息
```java
// 添加微信小程序配置
PlatformBo platform = new PlatformBo();
platform.setType("mp-weixin");
platform.setAppid("your-appid");
platform.setSecret("your-secret");
platformService.add(platform);
```

### 配置支付信息
```java
// 添加微信支付配置  
PaymentBo payment = new PaymentBo();
payment.setType("wechat");
payment.setMchId("your-mch-id");
payment.setMchKey("your-mch-key");
paymentService.add(payment);
```

### 创建订单
```java
// 创建订单
CreateOrderBo orderBo = new CreateOrderBo();
orderBo.setGoodsId(1L);
orderBo.setQuantity(1L);
orderBo.setPrice(new BigDecimal("100.00"));
CreateOrderVo order = orderService.createOrder(orderBo);
```

### 发起支付
```java
// 发起微信支付
PayOrderBo payBo = new PayOrderBo();
payBo.setOrderNo(order.getOrderNo());
payBo.setPayType("wechat");
payBo.setOpenid("user-openid");
PayResultVo result = payService.pay(payBo);
```

## 模块详解

### Base 基础服务模块

基础服务模块提供平台级的配置和管理功能,是整个业务系统的基础支撑。

#### 主要功能

**1. 平台配置管理**

管理多平台(微信小程序、公众号、支付宝等)的接入配置。

```java
@Service
public class PlatformServiceImpl implements PlatformService {

    /**
     * 添加平台配置
     */
    @Override
    public Long add(PlatformBo bo) {
        Platform platform = MapstructUtils.convert(bo, Platform.class);
        validEntityBeforeSave(platform);
        baseMapper.insert(platform);
        return platform.getId();
    }

    /**
     * 根据平台类型获取配置
     */
    @Override
    public PlatformVo getByType(String type) {
        Platform platform = baseMapper.selectOne(
            new LambdaQueryWrapper<Platform>()
                .eq(Platform::getType, type)
                .eq(Platform::getStatus, "0")
        );
        return MapstructUtils.convert(platform, PlatformVo.class);
    }
}
```

**支持的平台类型:**
- `mp-weixin`: 微信小程序
- `mp-official-account`: 微信公众号
- `mp-alipay`: 支付宝小程序
- `mp-qq`: QQ小程序
- `mp-toutiao`: 抖音小程序
- `app-android`: Android应用
- `app-ios`: iOS应用

**配置项说明:**
- `appid`: 平台应用ID
- `secret`: 平台应用密钥
- `mchId`: 商户号(支付相关)
- `privateKey`: 私钥(支付相关)
- `publicKey`: 公钥(支付相关)

**2. 支付配置管理**

统一管理各种支付方式的配置信息。

```java
@Service
public class PaymentServiceImpl implements PaymentService {

    /**
     * 添加支付配置
     */
    @Override
    public Long add(PaymentBo bo) {
        Payment payment = MapstructUtils.convert(bo, Payment.class);
        validEntityBeforeSave(payment);
        baseMapper.insert(payment);
        return payment.getId();
    }

    /**
     * 根据支付类型获取配置
     */
    @Override
    public PaymentVo getByType(String type) {
        Payment payment = baseMapper.selectOne(
            new LambdaQueryWrapper<Payment>()
                .eq(Payment::getType, type)
                .eq(Payment::getStatus, "0")
        );
        return MapstructUtils.convert(payment, PaymentVo.class);
    }
}
```

**支持的支付方式:**
- `wechat`: 微信支付
- `alipay`: 支付宝支付
- `unionpay`: 银联支付
- `balance`: 余额支付
- `points`: 积分支付

**3. 广告管理**

提供广告位配置和广告内容管理功能。

```java
@Service
public class AdServiceImpl extends BaseServiceImpl<AdMapper, Ad> implements AdService {

    /**
     * 查询广告列表
     */
    @Override
    public Page<AdVo> queryPageList(AdBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<Ad> wrapper = buildQueryWrapper(bo);
        Page<Ad> page = baseMapper.selectPage(pageQuery.build(), wrapper);
        return page.convert(ad -> MapstructUtils.convert(ad, AdVo.class));
    }

    /**
     * 根据位置获取广告
     */
    @Override
    public List<AdVo> getByPosition(String position) {
        List<Ad> ads = baseMapper.selectList(
            new LambdaQueryWrapper<Ad>()
                .eq(Ad::getPosition, position)
                .eq(Ad::getStatus, "0")
                .orderByAsc(Ad::getSort)
        );
        return MapstructUtils.convertList(ads, AdVo.class);
    }
}
```

**广告位类型:**
- `home_banner`: 首页轮播图
- `home_notice`: 首页公告
- `category_banner`: 分类页广告
- `detail_recommend`: 详情页推荐
- `popup`: 弹窗广告

**4. 账号绑定服务**

处理用户账号与平台账号的绑定关系。

```java
@Service
public class BindServiceImpl implements IBindService {

    /**
     * 绑定账号
     */
    @Override
    public void bind(BindBo bo) {
        // 检查是否已绑定
        Bind exist = baseMapper.selectOne(
            new LambdaQueryWrapper<Bind>()
                .eq(Bind::getUserId, bo.getUserId())
                .eq(Bind::getPlatform, bo.getPlatform())
        );

        if (exist != null) {
            // 更新绑定信息
            exist.setOpenid(bo.getOpenid());
            exist.setUnionid(bo.getUnionid());
            baseMapper.updateById(exist);
        } else {
            // 新增绑定
            Bind bind = MapstructUtils.convert(bo, Bind.class);
            baseMapper.insert(bind);
        }
    }

    /**
     * 根据openid查找用户
     */
    @Override
    public Long getUserIdByOpenid(String platform, String openid) {
        Bind bind = baseMapper.selectOne(
            new LambdaQueryWrapper<Bind>()
                .eq(Bind::getPlatform, platform)
                .eq(Bind::getOpenid, openid)
        );
        return bind != null ? bind.getUserId() : null;
    }
}
```

### Mall 商城业务模块

商城模块实现完整的电商业务流程,包括商品管理、订单处理、支付流程等。

#### 主要功能

**1. 商品管理**

提供商品的增删改查、上下架、库存管理等功能。

```java
@Service
public class GoodsServiceImpl extends BaseServiceImpl<GoodsMapper, Goods> implements GoodsService {

    /**
     * 新增商品
     */
    @Override
    public Long add(GoodsBo bo) {
        Goods goods = MapstructUtils.convert(bo, Goods.class);
        validEntityBeforeSave(goods);

        // 设置默认值
        goods.setSales(0L);
        goods.setStock(bo.getStock());
        goods.setStatus("0"); // 待审核

        baseMapper.insert(goods);
        return goods.getId();
    }

    /**
     * 商品上架
     */
    @Override
    public void online(Long id) {
        Goods goods = baseMapper.selectById(id);
        if (goods == null) {
            throw new ServiceException("商品不存在");
        }

        goods.setStatus("1"); // 已上架
        goods.setOnlineTime(new Date());
        baseMapper.updateById(goods);
    }

    /**
     * 扣减库存
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deductStock(Long goodsId, Long quantity) {
        int rows = baseMapper.deductStock(goodsId, quantity);
        if (rows == 0) {
            throw new ServiceException("库存不足");
        }
    }
}
```

**商品状态:**
- `0`: 待审核
- `1`: 已上架(正常销售)
- `2`: 已下架
- `3`: 审核不通过
- `4`: 已删除

**2. 订单管理**

处理订单的创建、支付、发货、收货、退款等完整流程。

```java
@Service
public class OrderServiceImpl extends BaseServiceImpl<OrderMapper, Order> implements OrderService {

    @Autowired
    private GoodsService goodsService;

    @Autowired
    private PayService payService;

    /**
     * 创建订单
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public CreateOrderVo createOrder(CreateOrderBo bo) {
        // 1. 检查商品信息
        GoodsVo goods = goodsService.getById(bo.getGoodsId());
        if (goods == null || !"1".equals(goods.getStatus())) {
            throw new ServiceException("商品不存在或已下架");
        }

        // 2. 检查库存
        if (goods.getStock() < bo.getQuantity()) {
            throw new ServiceException("库存不足");
        }

        // 3. 计算订单金额
        BigDecimal totalAmount = goods.getPrice().multiply(new BigDecimal(bo.getQuantity()));

        // 4. 创建订单
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(SecurityUtils.getUserId());
        order.setGoodsId(bo.getGoodsId());
        order.setGoodsName(goods.getName());
        order.setGoodsPrice(goods.getPrice());
        order.setQuantity(bo.getQuantity());
        order.setTotalAmount(totalAmount());
        order.setStatus("0"); // 待支付
        order.setCreateTime(new Date());

        baseMapper.insert(order);

        // 5. 扣减库存
        goodsService.deductStock(bo.getGoodsId(), bo.getQuantity());

        // 6. 返回订单信息
        CreateOrderVo vo = new CreateOrderVo();
        vo.setOrderNo(order.getOrderNo());
        vo.setTotalAmount(totalAmount);
        vo.setCreateTime(order.getCreateTime());
        return vo;
    }

    /**
     * 订单支付成功回调
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void paySuccess(String orderNo, String payNo) {
        Order order = baseMapper.selectOne(
            new LambdaQueryWrapper<Order>()
                .eq(Order::getOrderNo, orderNo)
        );

        if (order == null) {
            throw new ServiceException("订单不存在");
        }

        if (!"0".equals(order.getStatus())) {
            return; // 订单状态已变更,防止重复回调
        }

        // 更新订单状态
        order.setStatus("1"); // 已支付
        order.setPayNo(payNo);
        order.setPayTime(new Date());
        baseMapper.updateById(order);

        // 发布订单支付成功事件
        SpringUtils.context().publishEvent(new OrderPaySuccessEvent(order));
    }

    /**
     * 订单发货
     */
    @Override
    public void deliver(DeliverBo bo) {
        Order order = baseMapper.selectById(bo.getOrderId());
        if (order == null) {
            throw new ServiceException("订单不存在");
        }

        if (!"1".equals(order.getStatus())) {
            throw new ServiceException("订单状态不正确");
        }

        // 更新订单状态
        order.setStatus("2"); // 已发货
        order.setExpressCompany(bo.getExpressCompany());
        order.setExpressNo(bo.getExpressNo());
        order.setDeliverTime(new Date());
        baseMapper.updateById(order);
    }

    /**
     * 确认收货
     */
    @Override
    public void receive(Long orderId) {
        Order order = baseMapper.selectById(orderId);
        if (order == null) {
            throw new ServiceException("订单不存在");
        }

        if (!"2".equals(order.getStatus())) {
            throw new ServiceException("订单状态不正确");
        }

        // 更新订单状态
        order.setStatus("3"); // 已完成
        order.setReceiveTime(new Date());
        baseMapper.updateById(order);

        // 自动增加销量
        goodsService.increaseSales(order.getGoodsId(), order.getQuantity());
    }

    /**
     * 生成订单号
     */
    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + RandomUtil.randomNumbers(6);
    }
}
```

**订单状态:**
- `0`: 待支付
- `1`: 已支付(待发货)
- `2`: 已发货(待收货)
- `3`: 已完成
- `4`: 已取消
- `5`: 退款中
- `6`: 已退款

**3. 支付服务**

统一的支付服务接口,支持多种支付方式。

```java
@Service
public class PayServiceImpl implements PayService {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    /**
     * 发起支付
     */
    @Override
    public PayResultVo pay(PayOrderBo bo) {
        // 1. 查询订单
        OrderVo order = orderService.getByOrderNo(bo.getOrderNo());
        if (order == null) {
            throw new ServiceException("订单不存在");
        }

        if (!"0".equals(order.getStatus())) {
            throw new ServiceException("订单状态不正确");
        }

        // 2. 获取支付配置
        PaymentVo payment = paymentService.getByType(bo.getPayType());
        if (payment == null) {
            throw new ServiceException("支付方式未配置");
        }

        // 3. 调用支付接口
        PayResultVo result = new PayResultVo();

        switch (bo.getPayType()) {
            case "wechat":
                result = wechatPay(order, payment, bo.getOpenid());
                break;
            case "alipay":
                result = alipayPay(order, payment);
                break;
            case "balance":
                result = balancePay(order);
                break;
            default:
                throw new ServiceException("不支持的支付方式");
        }

        return result;
    }

    /**
     * 微信支付
     */
    private PayResultVo wechatPay(OrderVo order, PaymentVo payment, String openid) {
        // 构建支付参数
        WxPayUnifiedOrderRequest request = new WxPayUnifiedOrderRequest();
        request.setAppid(payment.getAppid());
        request.setMchId(payment.getMchId());
        request.setOutTradeNo(order.getOrderNo());
        request.setBody(order.getGoodsName());
        request.setTotalFee(order.getTotalAmount().multiply(new BigDecimal("100")).intValue());
        request.setOpenid(openid);
        request.setTradeType("JSAPI");
        request.setNotifyUrl(payment.getNotifyUrl());

        // 调用微信支付
        WxPayUnifiedOrderResult wxResult = wxPayService.unifiedOrder(request);

        // 返回支付参数
        PayResultVo result = new PayResultVo();
        result.setPayType("wechat");
        result.setOrderNo(order.getOrderNo());
        result.setPrepayId(wxResult.getPrepayId());
        result.setPayParams(buildWxPayParams(wxResult));

        return result;
    }

    /**
     * 支付回调处理
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void handleNotify(String payType, String notifyData) {
        switch (payType) {
            case "wechat":
                handleWechatNotify(notifyData);
                break;
            case "alipay":
                handleAlipayNotify(notifyData);
                break;
            default:
                throw new ServiceException("不支持的支付方式");
        }
    }

    /**
     * 处理微信支付回调
     */
    private void handleWechatNotify(String notifyData) {
        // 1. 验证签名
        WxPayOrderNotifyResult result = wxPayService.parseOrderNotifyResult(notifyData);

        // 2. 检查支付结果
        if (!"SUCCESS".equals(result.getResultCode())) {
            return;
        }

        // 3. 更新订单状态
        String orderNo = result.getOutTradeNo();
        String payNo = result.getTransactionId();
        orderService.paySuccess(orderNo, payNo);
    }
}
```

**4. 购物车管理**

提供购物车的增删改查功能。

```java
@Service
public class CartServiceImpl extends BaseServiceImpl<CartMapper, Cart> implements CartService {

    /**
     * 添加到购物车
     */
    @Override
    public void add(CartBo bo) {
        Long userId = SecurityUtils.getUserId();

        // 检查是否已存在
        Cart exist = baseMapper.selectOne(
            new LambdaQueryWrapper<Cart>()
                .eq(Cart::getUserId, userId)
                .eq(Cart::getGoodsId, bo.getGoodsId())
        );

        if (exist != null) {
            // 增加数量
            exist.setQuantity(exist.getQuantity() + bo.getQuantity());
            baseMapper.updateById(exist);
        } else {
            // 新增购物车项
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setGoodsId(bo.getGoodsId());
            cart.setQuantity(bo.getQuantity());
            baseMapper.insert(cart);
        }
    }

    /**
     * 查询购物车列表
     */
    @Override
    public List<CartVo> list() {
        Long userId = SecurityUtils.getUserId();
        List<Cart> carts = baseMapper.selectList(
            new LambdaQueryWrapper<Cart>()
                .eq(Cart::getUserId, userId)
                .orderByDesc(Cart::getCreateTime)
        );

        return carts.stream().map(cart -> {
            CartVo vo = MapstructUtils.convert(cart, CartVo.class);
            // 查询商品信息
            GoodsVo goods = goodsService.getById(cart.getGoodsId());
            vo.setGoods(goods);
            return vo;
        }).collect(Collectors.toList());
    }
}
```

### Job 任务调度模块

任务调度模块提供定时任务和异步作业处理能力。

#### 主要功能

**1. 定时任务管理**

```java
@Component
public class OrderTimeoutJob {

    @Autowired
    private OrderService orderService;

    /**
     * 订单超时自动取消
     * 每5分钟执行一次
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void cancelTimeoutOrders() {
        // 查询超时未支付订单
        List<Order> orders = orderService.getTimeoutOrders();

        for (Order order : orders) {
            try {
                // 取消订单
                orderService.cancel(order.getId(), "超时未支付自动取消");

                // 恢复库存
                orderService.restoreStock(order.getGoodsId(), order.getQuantity());

                log.info("订单{}已自动取消", order.getOrderNo());
            } catch (Exception e) {
                log.error("订单{}取消失败", order.getOrderNo(), e);
            }
        }
    }
}
```

**2. 异步任务处理**

```java
@Service
public class AsyncTaskService {

    /**
     * 异步发送短信
     */
    @Async
    public void sendSms(String phone, String content) {
        try {
            smsService.send(phone, content);
            log.info("短信发送成功: {}", phone);
        } catch (Exception e) {
            log.error("短信发送失败: {}", phone, e);
        }
    }

    /**
     * 异步发送邮件
     */
    @Async
    public void sendEmail(String email, String subject, String content) {
        try {
            emailService.send(email, subject, content);
            log.info("邮件发送成功: {}", email);
        } catch (Exception e) {
            log.error("邮件发送失败: {}", email, e);
        }
    }
}
```

## 认证授权

### 认证策略

系统支持多平台认证,通过策略模式实现不同平台的认证逻辑。

```java
/**
 * 认证策略接口
 */
public interface IAuthStrategy {

    /**
     * 认证
     */
    AuthVo auth(AuthBo bo);

    /**
     * 支持的平台类型
     */
    String supportPlatform();
}
```

**微信小程序认证:**

```java
@Service
public class MiniappAuthStrategy implements IAuthStrategy {

    @Autowired
    private PlatformService platformService;

    @Autowired
    private IBindService bindService;

    @Autowired
    private ISysUserService userService;

    @Override
    public AuthVo auth(AuthBo bo) {
        // 1. 获取平台配置
        PlatformVo platform = platformService.getByType(bo.getPlatform());
        if (platform == null) {
            throw new ServiceException("平台未配置");
        }

        // 2. 通过code换取session_key和openid
        WxMaJscode2SessionResult session = wxMaService.getUserService()
            .getSessionInfo(bo.getCode());

        String openid = session.getOpenid();
        String unionid = session.getUnionid();

        // 3. 查找绑定的用户
        Long userId = bindService.getUserIdByOpenid(bo.getPlatform(), openid);

        if (userId == null) {
            // 4. 自动注册用户
            RegisterBo registerBo = new RegisterBo();
            registerBo.setNickname(bo.getNickname());
            registerBo.setAvatar(bo.getAvatar());
            userId = userService.register(registerBo);

            // 5. 绑定openid
            BindBo bindBo = new BindBo();
            bindBo.setUserId(userId);
            bindBo.setPlatform(bo.getPlatform());
            bindBo.setOpenid(openid);
            bindBo.setUnionid(unionid);
            bindService.bind(bindBo);
        }

        // 6. 生成token
        LoginUser loginUser = buildLoginUser(userId);
        String token = StpUtil.createTokenValue(loginUser.getLoginId());

        // 7. 返回认证结果
        AuthVo vo = new AuthVo();
        vo.setToken(token);
        vo.setUserId(userId);
        vo.setOpenid(openid);
        return vo;
    }

    @Override
    public String supportPlatform() {
        return "mp-weixin";
    }
}
```

## 事件驱动

### 订单事件

系统使用Spring事件机制实现业务解耦。

**订单支付成功事件:**

```java
/**
 * 订单支付成功事件
 */
public class OrderPaySuccessEvent extends ApplicationEvent {

    private final Order order;

    public OrderPaySuccessEvent(Order order) {
        super(order);
        this.order = order;
    }

    public Order getOrder() {
        return order;
    }
}
```

**事件监听器:**

```java
@Component
public class OrderEventListener {

    @Autowired
    private AsyncTaskService asyncTaskService;

    /**
     * 监听订单支付成功事件
     */
    @EventListener
    @Async
    public void onOrderPaySuccess(OrderPaySuccessEvent event) {
        Order order = event.getOrder();

        // 发送支付成功通知
        asyncTaskService.sendSms(
            order.getUserPhone(),
            "您的订单" + order.getOrderNo() + "已支付成功"
        );

        // 记录日志
        log.info("订单{}支付成功", order.getOrderNo());
    }
}
```

## 数据模型

### 核心实体

**平台配置 (Platform)**

```java
@Data
@TableName("bus_platform")
public class Platform extends TenantEntity {

    /** 平台ID */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 平台类型 */
    private String type;

    /** 平台名称 */
    private String name;

    /** AppID */
    private String appid;

    /** Secret */
    private String secret;

    /** 状态 */
    private String status;
}
```

**支付配置 (Payment)**

```java
@Data
@TableName("bus_payment")
public class Payment extends TenantEntity {

    /** 支付ID */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 支付类型 */
    private String type;

    /** 支付名称 */
    private String name;

    /** 商户号 */
    private String mchId;

    /** 商户密钥 */
    private String mchKey;

    /** 回调地址 */
    private String notifyUrl;

    /** 状态 */
    private String status;
}
```

**商品 (Goods)**

```java
@Data
@TableName("bus_goods")
public class Goods extends TenantEntity {

    /** 商品ID */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 商品名称 */
    private String name;

    /** 商品分类 */
    private Long categoryId;

    /** 商品价格 */
    private BigDecimal price;

    /** 库存 */
    private Long stock;

    /** 销量 */
    private Long sales;

    /** 商品图片 */
    private String images;

    /** 商品详情 */
    private String detail;

    /** 状态 */
    private String status;

    /** 上架时间 */
    private Date onlineTime;
}
```

**订单 (Order)**

```java
@Data
@TableName("bus_order")
public class Order extends TenantEntity {

    /** 订单ID */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 订单号 */
    private String orderNo;

    /** 用户ID */
    private Long userId;

    /** 商品ID */
    private Long goodsId;

    /** 商品名称 */
    private String goodsName;

    /** 商品价格 */
    private BigDecimal goodsPrice;

    /** 数量 */
    private Long quantity;

    /** 订单总额 */
    private BigDecimal totalAmount;

    /** 实付金额 */
    private BigDecimal payAmount;

    /** 支付方式 */
    private String payType;

    /** 支付流水号 */
    private String payNo;

    /** 订单状态 */
    private String status;

    /** 支付时间 */
    private Date payTime;

    /** 发货时间 */
    private Date deliverTime;

    /** 收货时间 */
    private Date receiveTime;

    /** 快递公司 */
    private String expressCompany;

    /** 快递单号 */
    private String expressNo;
}
```

## API接口

### 认证接口

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private List<IAuthStrategy> authStrategies;

    /**
     * 平台登录认证
     */
    @PostMapping("/login")
    public R<AuthVo> login(@RequestBody @Validated AuthBo bo) {
        // 根据平台类型选择认证策略
        IAuthStrategy strategy = authStrategies.stream()
            .filter(s -> s.supportPlatform().equals(bo.getPlatform()))
            .findFirst()
            .orElseThrow(() -> new ServiceException("不支持的平台类型"));

        // 执行认证
        AuthVo vo = strategy.auth(bo);
        return R.ok(vo);
    }
}
```

### 商品接口

```java
@RestController
@RequestMapping("/api/goods")
public class GoodsController {

    @Autowired
    private GoodsService goodsService;

    /**
     * 查询商品列表
     */
    @GetMapping("/list")
    public R<Page<GoodsVo>> list(GoodsBo bo, PageQuery pageQuery) {
        Page<GoodsVo> page = goodsService.queryPageList(bo, pageQuery);
        return R.ok(page);
    }

    /**
     * 获取商品详情
     */
    @GetMapping("/{id}")
    public R<GoodsVo> getById(@PathVariable Long id) {
        GoodsVo vo = goodsService.getById(id);
        return R.ok(vo);
    }
}
```

### 订单接口

```java
@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * 创建订单
     */
    @PostMapping("/create")
    public R<CreateOrderVo> create(@RequestBody @Validated CreateOrderBo bo) {
        CreateOrderVo vo = orderService.createOrder(bo);
        return R.ok(vo);
    }

    /**
     * 查询订单列表
     */
    @GetMapping("/list")
    public R<Page<OrderVo>> list(OrderBo bo, PageQuery pageQuery) {
        Page<OrderVo> page = orderService.queryPageList(bo, pageQuery);
        return R.ok(page);
    }

    /**
     * 确认收货
     */
    @PutMapping("/receive/{id}")
    public R<Void> receive(@PathVariable Long id) {
        orderService.receive(id);
        return R.ok();
    }
}
```

### 支付接口

```java
@RestController
@RequestMapping("/api/pay")
public class PayController {

    @Autowired
    private PayService payService;

    /**
     * 发起支付
     */
    @PostMapping("/pay")
    public R<PayResultVo> pay(@RequestBody @Validated PayOrderBo bo) {
        PayResultVo vo = payService.pay(bo);
        return R.ok(vo);
    }

    /**
     * 支付回调
     */
    @PostMapping("/notify/{payType}")
    public String notify(@PathVariable String payType, @RequestBody String notifyData) {
        try {
            payService.handleNotify(payType, notifyData);
            return "success";
        } catch (Exception e) {
            log.error("支付回调处理失败", e);
            return "fail";
        }
    }
}
```

## 最佳实践

### 1. 多租户数据隔离

所有业务实体都应继承 `TenantEntity`,自动实现多租户数据隔离。

```java
@Data
@TableName("bus_goods")
public class Goods extends TenantEntity {
    // 自动包含 tenantId 字段
    // 查询时自动过滤租户数据
}
```

### 2. 统一异常处理

使用 `ServiceException` 抛出业务异常,框架会自动处理并返回友好的错误信息。

```java
if (goods.getStock() < quantity) {
    throw new ServiceException("库存不足");
}
```

### 3. 事务管理

涉及多表操作或需要保证数据一致性的方法,必须添加 `@Transactional` 注解。

```java
@Override
@Transactional(rollbackFor = Exception.class)
public void createOrder(CreateOrderBo bo) {
    // 创建订单
    // 扣减库存
    // 事务回滚确保数据一致性
}
```

### 4. 异步处理

非核心业务逻辑使用异步处理,提升系统响应速度。

```java
@Async
public void sendNotification(Order order) {
    // 发送通知(短信、邮件等)
    // 不影响主流程
}
```

### 5. 缓存使用

对于频繁查询且变化不大的数据,使用缓存提升性能。

```java
@Cacheable(value = "goods", key = "#id")
public GoodsVo getById(Long id) {
    // 查询商品信息
    // 结果自动缓存
}
```

## 总结

业务模块是系统的核心,提供了完整的业务功能实现:

**核心优势:**
- **模块化设计**: 各模块职责清晰,便于维护和扩展
- **多平台支持**: 统一的认证和支付接口,支持多种平台
- **多租户架构**: 完善的租户隔离机制,支持SaaS部署
- **事件驱动**: 通过事件机制实现业务解耦,提升系统灵活性
- **高性能**: 异步处理、缓存机制保证系统性能

**扩展建议:**
1. 根据业务需求扩展新的业务模块
2. 实现更多的支付方式和平台认证
3. 完善事件监听器,丰富业务流程
4. 优化数据库设计,提升查询性能
5. 增加单元测试和集成测试覆盖率
