# 商城模块 (mall)

商城模块实现了完整的电商业务功能，包括商品管理、订单处理、支付流程等核心电商能力，支持多种支付方式和多平台集成。

## 模块结构

```text
mall/
├── controller/          # 控制器层
│   ├── GoodsController.java    # 商品管理
│   └── OrderController.java    # 订单管理
├── service/            # 服务层
│   ├── IGoodsService.java      # 商品服务接口
│   ├── IOrderService.java      # 订单服务接口
│   └── impl/                   # 服务实现
├── domain/             # 数据模型
│   ├── entity/         # 实体类
│   │   ├── Goods.java         # 商品实体
│   │   └── Order.java         # 订单实体
│   ├── vo/            # 视图对象
│   ├── bo/            # 业务对象
│   └── groups/        # 验证分组
├── mapper/            # 数据访问层
└── listener/          # 事件监听器
```

## 核心功能

### 🛍️ 商品管理

#### 商品实体设计
```java
@Data
@TableName("m_goods")
public class Goods extends TenantEntity {
    private Long id;            // 商品ID
    private String category;    // 商品分类
    private String code;        // 商品编码
    private String name;        // 商品名称
    private String img;         // 商品图片
    private BigDecimal price;   // 价格
    private String description; // 商品描述
    private Long stock;         // 库存
    private Long salesCount;    // 销量
    private String status;      // 状态
    private Long sortOrder;     // 排序
    private String remark;      // 备注

    @TableLogic
    private String isDeleted;   // 逻辑删除
}
```

#### 商品服务功能
- **CRUD操作**：商品的增删改查
- **状态管理**：上架、下架状态控制
- **库存管理**：库存数量实时更新
- **分类管理**：商品分类组织
- **搜索功能**：支持多字段模糊搜索

```java
public interface IGoodsService extends IBaseService<Goods, GoodsBo, GoodsVo> {
    // 继承基础CRUD操作
    // 支持分页查询、条件查询、批量操作等
}
```

### 📋 订单管理

#### 订单实体设计
```java
@Data
@TableName("m_order")
public class Order extends TenantEntity {
    private Long id;              // 订单ID
    private String orderNo;       // 订单编号
    private Long userId;          // 用户ID
    private Long goodsId;         // 商品ID
    private String goodsName;     // 商品名称
    private String goodsImg;      // 商品图片
    private BigDecimal price;     // 商品价格
    private Long quantity;        // 购买数量
    private BigDecimal totalAmount; // 订单总金额
    private String orderStatus;   // 订单状态
    private String paymentMethod; // 支付方式
    private Date paymentTime;     // 支付时间
    private String transactionId; // 交易流水号
    private String buyerRemark;   // 买家备注
    private String remark;        // 备注
}
```

#### 订单服务接口
```java
public interface IOrderService extends IBaseService<Order, OrderBo, OrderVo> {

    /**
     * 创建订单
     */
    CreateOrderVo createOrder(CreateOrderBo bo);

    /**
     * 根据商户订单号更新订单状态
     */
    boolean updateOrderByOutTradeNo(String outTradeNo, String orderStatus, String transactionId);

    /**
     * 根据商户订单号查询订单
     */
    OrderVo getByOutTradeNo(String outTradeNo);
}
```

#### 订单状态管理
```java
public enum DictOrderStatus {
    PENDING("pending", "待支付"),
    PAID("paid", "已支付"),
    SHIPPED("shipped", "已发货"),
    COMPLETED("completed", "已完成"),
    CANCELLED("cancelled", "已取消"),
    REFUNDED("refunded", "已退款");

    public static boolean isPaid(String status) {
        return PAID.getValue().equals(status) ||
                SHIPPED.getValue().equals(status) ||
                COMPLETED.getValue().equals(status);
    }
}
```

## 支付集成

### 💳 统一支付接口

商城模块集成了统一支付服务，支持多种支付方式：

#### 支付控制器
```java
@RestController
@RequestMapping("/api/order")
public class OrderPayController {

    /**
     * 获取支持的支付方式列表
     */
    @GetMapping("/supportedPaymentMethods")
    public R<List<DictPaymentMethod>> getSupportedPaymentMethods() {
        List<DictPaymentMethod> methods = payService.getSupportedPaymentMethods();
        return R.ok(methods);
    }

    /**
     * 创建订单
     */
    @PostMapping("/createOrder")
    public R<CreateOrderVo> createOrder(@RequestBody CreateOrderBo bo) {
        // 生成订单号
        String orderNo = PayUtils.generateOutTradeNo("ORDER");

        // 设置系统字段
        bo.setOrderNo(orderNo);
        bo.setUserId(LoginHelper.getUserId());
        bo.setTotalAmount(NumberUtil.mul(bo.getPrice(), bo.getQuantity()));
        bo.setOrderStatus(DictOrderStatus.PENDING.getValue());

        // 保存订单
        CreateOrderVo vo = orderService.createOrder(bo);
        return R.ok("订单创建成功", vo);
    }

    /**
     * 统一支付接口
     */
    @PostMapping("/createPayment")
    public R<PayResponse> createPayment(@RequestBody PayRequest request) {
        try {
            // 1. 验证并获取订单信息
            OrderVo order = validateOrder(request.getOrderNo());

            // 2. 验证用户权限
            validateUserPermission(order);

            // 3. 验证订单状态
            validateOrderStatus(order);

            // 4. 验证支付方式
            DictPaymentMethod paymentMethod = validatePaymentMethod(request.getPaymentMethod());

            // 5. 设置订单相关信息到请求中
            enrichPaymentRequest(request, order);

            // 6. 调用支付服务处理
            PayResponse response = payService.pay(paymentMethod, request);

            return R.ok("支付请求成功", response);

        } catch (Exception e) {
            log.error("支付失败: orderNo={}, error={}", request.getOrderNo(), e.getMessage(), e);
            return R.fail("支付失败: " + e.getMessage());
        }
    }
}
```

#### 支付方式支持
- **微信支付** (WECHAT)：小程序支付、H5支付、扫码支付
- **支付宝支付** (ALIPAY)：小程序支付、H5支付、扫码支付
- **银联支付** (UNIONPAY)：网关支付、快捷支付
- **余额支付** (BALANCE)：账户余额扣款
- **积分支付** (POINTS)：积分抵扣

### 🔄 支付回调处理

#### 统一回调控制器
```java
@RestController
@RequestMapping("/payment/notify")
public class PayNotifyController {
    
    /**
     * 统一支付回调入口
     */
    @PostMapping("/{paymentType}/{merchantId}")
    public String unifiedNotify(@PathVariable String paymentType,
                               @PathVariable String merchantId,
                               HttpServletRequest request) {
        try {
            // 1. 解析支付方式枚举
            DictPaymentMethod paymentMethod = DictPaymentMethod.getByValue(paymentType);
            
            // 2. 构建回调请求对象
            NotifyRequest notifyRequest = buildNotifyRequest(paymentMethod, merchantId, request);
            
            // 3. 处理支付回调
            NotifyResponse response = payService.handleNotify(paymentMethod, notifyRequest);
            
            // 4. 返回平台要求的响应格式
            return formatResponseByPaymentType(paymentType, response);
            
        } catch (Exception e) {
            log.error("处理{}支付回调异常", paymentType, e);
            NotifyResponse failResponse = NotifyResponse.fail("系统异常");
            return formatResponseByPaymentType(paymentType, failResponse);
        }
    }
}
```

#### 支付成功事件处理
```java
@Component
@RequiredArgsConstructor
public class OrderPaymentEventListener {
    
    @EventListener
    @Transactional(rollbackFor = Exception.class)
    public void handlePaymentSuccess(PaySuccessEvent event) {
        try {
            log.info("处理订单支付成功事件: 订单号={}, 支付方式={}",
                event.getOutTradeNo(), event.getPaymentMethod());

            // 更新订单状态为已支付
            orderService.updateOrderByOutTradeNo(
                event.getOutTradeNo(),
                DictOrderStatus.PAID.getValue(),
                event.getTransactionId()
            );

            // 根据不同支付方式执行不同的后续逻辑
            handlePostPaymentLogic(event);

        } catch (Exception e) {
            log.error("处理订单支付事件失败: {}", event.getOutTradeNo(), e);
            throw e;
        }
    }
    
    private void handlePostPaymentLogic(PaySuccessEvent event) {
        DictPaymentMethod paymentMethod = DictPaymentMethod.getByValue(event.getPaymentMethod());
        
        switch (paymentMethod) {
            case WECHAT:
            case ALIPAY:
            case UNIONPAY:
                // 在线支付后续逻辑：减库存、发送通知、记录积分、触发发货
                handleOnlinePaymentSuccess(event);
                break;
            case BALANCE:
                // 余额支付后续逻辑：记录余额变动、发送通知
                handleBalancePaymentSuccess(event);
                break;
            case POINTS:
                // 积分支付后续逻辑：记录积分变动、发送通知
                handlePointsPaymentSuccess(event);
                break;
        }
    }
}
```

## 业务流程

### 📦 订单创建流程

1. **商品选择**：用户选择商品和数量
2. **订单生成**：系统生成唯一订单号
3. **数据校验**：验证商品信息、库存等
4. **订单保存**：保存订单到数据库
5. **返回结果**：返回订单信息供支付使用

```java
@Override
@Transactional(rollbackFor = Exception.class)
public CreateOrderVo createOrder(CreateOrderBo bo) {
    try {
        log.info("开始创建订单: goodsId={}, userId={}", bo.getGoodsId(), bo.getUserId());

        // 1. 数据校验
        validateOrderData(bo);

        // 2. 创建订单实体
        Order order = new Order();
        order.setOrderNo(bo.getOrderNo());
        order.setUserId(bo.getUserId());
        order.setGoodsId(bo.getGoodsId());
        order.setGoodsName(bo.getGoodsName());
        order.setPrice(bo.getPrice());
        order.setQuantity(bo.getQuantity());
        order.setTotalAmount(bo.getTotalAmount());
        order.setOrderStatus(bo.getOrderStatus());

        // 3. 保存订单
        baseMapper.insert(order);

        // 4. 构建返回对象
        CreateOrderVo vo = new CreateOrderVo();
        vo.setId(order.getId());
        vo.setOrderNo(bo.getOrderNo());
        vo.setTotalAmount(bo.getTotalAmount());
        vo.setOrderStatus(bo.getOrderStatus());
        vo.setCreateTime(new Date());

        return vo;
    } catch (Exception e) {
        log.error("创建订单失败: {}", e.getMessage(), e);
        throw new ServiceException("创建订单失败: " + e.getMessage());
    }
}
```

### 💰 支付处理流程

1. **支付发起**：用户选择支付方式发起支付
2. **订单校验**：验证订单状态、用户权限等
3. **支付调用**：调用第三方支付接口
4. **结果返回**：返回支付结果给前端
5. **异步通知**：接收支付平台异步通知
6. **状态更新**：更新订单状态并触发后续业务

### 🔄 退款处理流程

```java
@PostMapping("/refundOrder")
public R<RefundResponse> refundOrder(@RequestBody RefundBo request) {
    try {
        // 1. 验证订单信息
        OrderVo order = validateOrder(request.getOrderNo());
        
        // 2. 验证用户权限  
        validateUserPermission(order);
        
        // 3. 验证退款状态
        validateRefundOrderStatus(order);
        
        // 4. 验证退款金额
        BigDecimal refundAmount = validateRefundAmount(request.getRefundAmount(), order.getTotalAmount());
        
        // 5. 构建退款请求
        RefundRequest refundRequest = RefundRequest.builder()
            .outTradeNo(order.getOrderNo())
            .outRefundNo(PayUtils.generateOutRefundNo())
            .totalFee(order.getTotalAmount())
            .refundFee(refundAmount)
            .reason(request.getReason())
            .build();
            
        // 6. 发起退款
        DictPaymentMethod paymentMethod = DictPaymentMethod.getByValue(order.getPaymentMethod());
        RefundResponse response = payService.refund(paymentMethod, refundRequest);
        
        return R.ok(response);
    } catch (Exception e) {
        return R.fail("订单退款失败: " + e.getMessage());
    }
}
```

## 验证分组

### 📋 分组验证设计

```java
public interface MallGroups {
    // 通用操作分组
    interface Common {
        interface Add { }
        interface Update { }
        interface Delete { }
        interface Query { }
    }
    
    // 商品模块验证分组
    interface Goods {
        interface Add { }
        interface Update { }
        interface OnShelf { }    // 上架商品
        interface OffShelf { }   // 下架商品
    }
    
    // 订单模块验证分组
    interface Order {
        interface Add { }
        interface Update { }
        interface Pay { }        // 支付订单
        interface Cancel { }     // 取消订单
    }
}
```

### 使用示例
```java
// 创建商品时的验证
@PostMapping("/addGoods")
public R<Long> addGoods(@Validated(MallGroups.Goods.Add.class) @RequestBody GoodsBo bo) {
    return R.ok(goodsService.add(bo));
}

// 商品业务对象中的验证注解
@Data
public class GoodsBo extends BaseEntity {
    @NotBlank(message = "商品名称不能为空", groups = { MallGroups.Goods.Add.class })
    private String name;
    
    @NotNull(message = "价格不能为空", groups = { MallGroups.Goods.Add.class })
    @DecimalMin(value = "0.01", message = "价格不能小于0.01元")
    private BigDecimal price;
}
```

## API接口设计

### 🌐 前端API接口

#### 商品相关接口
```java
// 分页查询商品列表
GET /api/pageGoods?pageNum=1&pageSize=10&status=1

// 获取商品详情
GET /api/goods/{id}

// 商品搜索
GET /api/pageGoods?searchValue=手机&category=电子产品
```

#### 订单相关接口
```java
// 创建订单
POST /api/order/createOrder
{
  "goodsId": 1,
  "goodsName": "iPhone 15",
  "price": 5999.00,
  "quantity": 1,
  "buyerRemark": "请尽快发货"
}

// 查询订单状态
GET /api/order/queryOrderStatus?orderNo=ORDER_20240101_001

// 获取订单详情
GET /api/order/getOrderByOrderNo?orderNo=ORDER_20240101_001

// 查询用户订单列表
GET /api/order/pageOrders?pageNum=1&pageSize=10

// 发起支付
POST /api/order/createPayment
{
  "orderNo": "ORDER_20240101_001",
  "paymentMethod": "wechat",
  "body": "订单支付-ORDER_20240101_001",
  "totalFee": 5999.00
}

// 订单退款
POST /api/order/refundOrder  
{
  "orderNo": "ORDER_20240101_001",
  "refundAmount": 5999.00,
  "reason": "用户申请退款"
}
```

### 🛠️ 管理后台接口

#### 商品管理
```java
// 分页查询商品
GET /mall/goods/pageGoods

// 获取商品详情
GET /mall/goods/getGoods/{id}

// 新增商品
POST /mall/goods/addGoods

// 修改商品
PUT /mall/goods/updateGoods

// 删除商品
DELETE /mall/goods/deleteGoods/{ids}

// 导出商品
POST /mall/goods/exportGoods

// 导入商品
POST /mall/goods/importGoods
```

#### 订单管理
```java
// 分页查询订单
GET /mall/order/pageOrders

// 获取订单详情  
GET /mall/order/getOrder/{id}

// 修改订单
PUT /mall/order/updateOrder

// 删除订单
DELETE /mall/order/deleteOrders/{ids}

// 导出订单
POST /mall/order/exportOrders

// 导入订单
POST /mall/order/importOrders
```

## 数据库设计

### 📊 商品表 (m_goods)
```sql
CREATE TABLE m_goods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    tenant_id VARCHAR(20) NOT NULL COMMENT '租户ID',
    category VARCHAR(100) COMMENT '商品分类',
    code VARCHAR(50) COMMENT '商品编码',
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    img VARCHAR(500) COMMENT '商品图片',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    description TEXT COMMENT '商品描述',
    stock BIGINT DEFAULT 0 COMMENT '库存',
    sales_count BIGINT DEFAULT 0 COMMENT '销量',
    status CHAR(1) DEFAULT '1' COMMENT '状态',
    sort_order BIGINT COMMENT '排序',
    create_by VARCHAR(50) COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by VARCHAR(50) COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注',
    is_deleted CHAR(1) DEFAULT '0' COMMENT '删除标志',
    INDEX idx_tenant_category (tenant_id, category),
    INDEX idx_tenant_status (tenant_id, status),
    INDEX idx_tenant_sort (tenant_id, sort_order)
) COMMENT='商品表';
```

### 📋 订单表 (m_order)
```sql
CREATE TABLE m_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    tenant_id VARCHAR(20) NOT NULL COMMENT '租户ID',
    order_no VARCHAR(50) NOT NULL COMMENT '订单编号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    goods_id BIGINT NOT NULL COMMENT '商品ID',
    goods_name VARCHAR(200) NOT NULL COMMENT '商品名称',
    goods_img VARCHAR(500) COMMENT '商品图片',
    price DECIMAL(10,2) NOT NULL COMMENT '商品价格',
    quantity BIGINT NOT NULL COMMENT '购买数量',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    order_status VARCHAR(20) NOT NULL COMMENT '订单状态',
    payment_method VARCHAR(20) COMMENT '支付方式',
    payment_time DATETIME COMMENT '支付时间',
    transaction_id VARCHAR(100) COMMENT '交易流水号',
    buyer_remark VARCHAR(500) COMMENT '买家备注',
    create_by VARCHAR(50) COMMENT '创建者',
    create_time DATETIME COMMENT '创建时间',
    update_by VARCHAR(50) COMMENT '更新者', 
    update_time DATETIME COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注',
    is_deleted CHAR(1) DEFAULT '0' COMMENT '删除标志',
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_tenant_user (tenant_id, user_id),
    INDEX idx_tenant_status (tenant_id, order_status),
    INDEX idx_payment_time (payment_time)
) COMMENT='订单表';
```

## 使用示例

### 📱 小程序商城集成

#### 商品列表页面
```javascript
// 获取商品列表
const getGoodsList = async () => {
  const response = await wx.request({
    url: '/api/pageGoods',
    method: 'GET',
    data: {
      pageNum: 1,
      pageSize: 10,
      status: '1'
    }
  });
  
  if (response.data.code === 200) {
    this.setData({
      goodsList: response.data.data.records
    });
  }
};
```

#### 订单创建
```javascript
// 创建订单
const createOrder = async (goods) => {
  const orderData = {
    goodsId: goods.id,
    goodsName: goods.name,
    goodsImg: goods.img,
    price: goods.price,
    quantity: 1,
    buyerRemark: ''
  };
  
  const response = await wx.request({
    url: '/api/order/createOrder',
    method: 'POST',
    data: orderData
  });
  
  if (response.data.code === 200) {
    const order = response.data.data;
    // 跳转到支付页面
    wx.navigateTo({
      url: `/pages/pay/pay?orderNo=${order.orderNo}`
    });
  }
};
```

#### 微信支付
```javascript
// 发起微信支付
const wxPay = async (orderNo) => {
  // 1. 调用后端创建支付
  const payResponse = await wx.request({
    url: '/api/order/createPayment',
    method: 'POST',
    data: {
      orderNo: orderNo,
      paymentMethod: 'wechat'
    }
  });
  
  if (payResponse.data.code === 200) {
    const payData = payResponse.data.data;
    
    // 2. 调用微信支付
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.packageValue,
      signType: payData.signType,
      paySign: payData.paySign,
      success: () => {
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        });
        // 跳转到订单详情页
      },
      fail: () => {
        wx.showToast({
          title: '支付失败',
          icon: 'error'
        });
      }
    });
  }
};
```

## 最佳实践

### 📋 业务设计
- **订单号生成**：使用时间戳+随机数确保唯一性
- **状态管理**：设计合理的订单状态流转
- **并发控制**：库存扣减使用乐观锁或分布式锁
- **数据一致性**：关键操作使用事务保证

### 🔐 安全考虑
- **支付安全**：支付金额服务端计算，不信任前端
- **权限校验**：订单操作验证用户权限
- **数据校验**：严格校验订单数据完整性
- **防重提交**：使用防重注解避免重复下单

### 🚀 性能优化
- **缓存策略**：商品信息适当缓存
- **分页查询**：大数据量使用分页避免内存溢出
- **异步处理**：支付回调等耗时操作异步处理
- **索引优化**：合理创建数据库索引

### 🔧 扩展建议
- **多商品订单**：支持购物车批量下单
- **优惠券**：集成优惠券抵扣功能
- **会员体系**：支持会员价格和积分
- **物流跟踪**：集成物流查询接口
