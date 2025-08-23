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
