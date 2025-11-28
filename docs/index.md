---
layout: home

hero:
  name: "ruoyi-plus-uniapp"
  text: "全栈开发文档"
  tagline: 框架即文档 提供最优雅的开发体验
  image:
    src: /logo.png
    alt: Plus UniApp Logo
  actions:
    - theme: brand
      text: 开始使用
      link: /backend/getting-started
    - theme: alt
      text: 介绍视频
      link: https://www.bilibili.com/video/BV1YrtMzvEaT/
    - theme: alt
      text: 演示
      link: /demo

features:
  - icon: 🚀
    title: 后端重大重构
    details: 四层架构（Controller-Service-DAO-Mapper）设计，DAO层统一查询构建，MyBatis Plus增强查询，多租户系统，权限控制，智能代码生成，主子表，支付集成，小程序/公众号集成
    link: /backend/
  - icon: 💻
    title: 前端全面升级
    details: Vue3 + Vite6 + TypeScript + Pinia + Element Plus + UnoCSS，组合式函数重构，丰富组件，前端直传，工具库完善，国际化增强
    link: /frontend/
  - icon: 📱
    title: 移动端最佳实践
    details: UniApp + Wd UI重构组件库，跨平台适配，组件示例完善齐全，优雅开发体验，支持微信小程序、H5、App全端覆盖
    link: /mobile/
  - icon: 🤖
    title: AI 能力集成 (NEW)
    details: LangChain4j 企业级集成，支持 OpenAI、Claude、DeepSeek、通义千问，流式聊天，RAG 检索增强，WebSocket 实时对话
    link: /backend/common/langchain4j
  - icon: 📡
    title: 物联网通信 (NEW)
    details: MQTT 客户端集成 (mica-mqtt)，RocketMQ 消息队列，支持设备管理、实时数据采集、异步解耦、削峰填谷
    link: /backend/common/mqtt
  - icon: 🎨
    title: 多媒体处理 (NEW)
    details: 海报生成引擎，GIF 动图合成，火山引擎 TTS 语音合成，多音色支持，流式音频生成
  - icon: 🖼️
    title: 页面设计器 (NEW)
    details: 可视化拖拽设计，30+组件库，AI智能生成，实时预览，一键生成Vue代码，支持页面/弹窗/抽屉三种模式
    link: /frontend/tools/page-designer
  - icon: ⚡
    title: 最佳实践
    details: 开发规范指南，容器化集群部署，性能优化策略，监控告警体系，代码风格统一，架构扩展预留
    link: /practices/
  - icon: 🛠️
    title: 框架特性
    details: 全面重构亮点，最新技术栈选择，模块化企业级设计，版本更新记录，技术架构演进，2025年最新集成
    link: /changelog
  - icon: 🔧
    title: 视频教程
    details: 快速入门指南，开发实战教程，部署运维讲解，最佳实践分享，核心技术原理
    link: /video

highlights:
  - title: 🎯 重构亮点
    details: |
      **四层架构** - Controller-Service-DAO-Mapper清晰分层，职责明确
      **DAO层设计** - 统一在DAO层构建查询条件，Service层专注业务逻辑
      **代码即文档** - 看代码即是看文档，完善的注释和命名规范
      **统一命名** - 接口路径、方法名、变量名语义化，快速定位
      **增强查询** - PlusLambdaQuery、PlusQuery简化MyBatis Plus查询
      **权限完善** - 模块:表:操作三级权限标识符，精确控制

  - title: 🚀 开发体验
    details: |
      **智能生成** - 代码生成器自动生成四层架构CRUD代码，包含DAO层查询构建
      **工具丰富** - 全部文件重构，命名优化，注释完善，工具类、组合函数完善
      **类型安全** - 前后端类型声明统一，TypeScript全覆盖
      **国际化** - 后端返回国际化消息，前端智能翻译
      **组件化** - 表单组件、业务组件、移动端组件库重构

  - title: 🏗️ 企业级能力
    details: |
      **多租户** - 完整的租户数据隔离，支持SaaS模式
      **模块化架构** - 分层设计，支持灵活扩展
      **监控体系** - Spring Boot Admin + SnailJob任务调度
      **安全防护** - 权限认证、数据脱敏、防重提交、限流
      **支付集成** - wxjava + 支付宝SDK，支持微信v2/v3智能切换、公钥模式等
      **小程序、公众号集成** - 已接入多平台小程序，公众号等，开箱即用

  - title: 🚀 2025年最新集成
    details: |
      **AI能力** - LangChain4j 集成 OpenAI/Claude/DeepSeek/通义千问，流式聊天、RAG检索增强
      **物联网通信** - MQTT 客户端 (mica-mqtt)，支持设备管理、实时数据采集
      **消息队列** - RocketMQ 集成，异步解耦、削峰填谷、最终一致性
      **多媒体处理** - 海报生成引擎、GIF合成、火山引擎TTS语音合成
      **页面设计器** - 可视化拖拽设计、30+组件、AI智能生成、一键代码导出
      **智能开发** - Claude Code上下文工程，AI辅助开发体验升级
---

## 🌟 为什么选择 ruoyi-plus-uniapp？

### 📊 重构成果

- **减少代码量 70%** - 通过四层架构（Controller-Service-DAO-Mapper）和增强查询大幅减少样板代码
- **提升开发效率 80%** - 智能代码生成 + DAO层统一查询构建 + 完善工具库
- **统一开发规范** - 前后端移动端命名规范、类型声明统一、职责分层清晰
- **完善的文档** - 框架即文档理念，代码自说明

### 🔄 演进历程

通过**地毯式重构**构建简洁高效、开发友好的全栈框架：

- **🎯 地毯式重构** - 基于ruoyi-vue-plus全面重构，统一命名规范，注重代码质量
- **⚡ 功能完善** - 多租户、支付集成、微信小程序、监控告警等企业级功能
- **🏗️ 架构优化** - 模块化设计、性能优化、开发体验提升

### 💡 适用场景

- ✅ **企业管理系统** - 完整的权限体系和多租户支持
- ✅ **SaaS平台** - 租户隔离、支付集成、监控告警
- ✅ **移动应用** - 小程序、H5、App全端覆盖
- ✅ **快速原型** - 代码生成器快速搭建业务模块

## 🚀 立即开始

选择你感兴趣的技术栈开始学习：

<div class="tip custom-block" style="padding-top: 8px">

[🚀 后端开发](./backend/) - Spring Boot 3 + MyBatis Plus 增强

[💻 前端开发](./frontend/) - Vue 3 + TypeScript + Element Plus

[📱 移动开发](./mobile/) - UniApp + 跨平台组件库

[⚡ 最佳实践](./practices/) - 开发规范 + 容器化部署

[🛠️ 框架特性](./changelog) - 重构亮点 + 版本更新

[🔧 视频教程](./video) - 入门指南 + 实战教程

</div>

## 💰 授权定价

选择适合您的版本，开启高效开发之旅

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 40px 0; max-width: 1200px;">

<APricingCard
  plan="个人版"
  :price="2180"
  description="适合个人开发者"
  :features="[
    '📦 完整源码交付',
    '🔄 持续更新服务',
    '🛠️ 自主开发权限',
    '💼 商业使用授权',
    '🤝 客户源码交付权',
    '🛡️ 技术支持服务',
    '💬 专属答疑群邀请'
  ]"
  button-text="立即购买"
  footer-text="适合个人开发者和小型项目"
/>

<APricingCard
  plan="企业标准版"
  :price="2880"
  :original-price="3280"
  saving-text="节省 ¥400"
  description="开发团队 < 10人"
  :features="[
    '📦 完整源码交付',
    '🔄 持续更新服务',
    '🛠️ 自主开发权限',
    '💼 商业使用授权',
    '🤝 客户源码交付权',
    '🛡️ 技术支持服务',
    '💬 专属答疑群邀请'
  ]"
  recommended
  button-text="立即购买"
  footer-text="中小企业的理想选择"
/>

<APricingCard
  plan="企业高级版"
  :price="3880"
  :original-price="4580"
  saving-text="节省 ¥700"
  description="开发团队 ≥ 10人"
  :features="[
    '📦 完整源码交付',
    '🔄 持续更新服务',
    '🛠️ 自主开发权限',
    '💼 商业使用授权',
    '🤝 客户源码交付权',
    '🛡️ 技术支持服务',
    '💬 专属答疑群邀请(可邀2人)'
  ]"
  button-text="立即购买"
  footer-text="大型企业的最佳选择"
/>

</div>

::: tip 购买说明
- 💼 **企业授权**：支持商业项目使用，可交付客户源码
- 🔄 **持续更新**：享受框架功能迭代和Bug修复
- 🛡️ **技术支持**：提供专业的技术支持服务
- ⚠️ **使用限制**：仅禁止框架二次销售和扩散传播
:::

## 💬 技术支持

- 📧 **联系方式**: 770492966 (微信/QQ)
- 🌐 **官网文档**: https://ruoyi.plus

### 📱 扫码关注

<div style="display: flex; gap: 30px; margin: 20px 0; flex-wrap: wrap; align-items: flex-start;">
  <div style="text-align: center;">
    <ImagePreview src="/gzh.png" :width="240" :height="320" object-fit="contain" />
    <p style="margin-top: 10px;"><strong>微信公众号</strong></p>
    <p style="margin-top: 5px; color: #666;">获取最新技术资讯</p>
  </div>
  <div style="text-align: center;">
    <ImagePreview src="/wxq.jpg" :width="240" :height="320" object-fit="contain" />
    <p style="margin-top: 10px;"><strong>技术交流群</strong></p>
    <p style="margin-top: 5px; color: #666;">与开发者交流讨论</p>
  </div>
  <div style="text-align: center;">
    <ImagePreview src="/软著.png" :width="240" :height="320" object-fit="contain" />
    <p style="margin-top: 10px;"><strong>软件著作权</strong></p>
    <p style="margin-top: 5px; color: #666;">国家版权局认证</p>
  </div>
</div>

---

*扫描上方二维码，加入我们的技术社区*

---

::: warning 软件著作权声明
本框架受《中华人民共和国著作权法》保护，已获得国家版权局软件著作权登记证书。未经授权不得使用，授权后可用于商业项目开发，但严禁对框架本身进行二次销售或扩散传播。
:::

<small>© 2025 抓蛙师 | 框架商用授权，详情咨询</small>
