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
    - theme: brand
      text: AI 开发体验
      link: /practices/ai/claude-code
    - theme: alt
      text: 介绍视频
      link: https://www.bilibili.com/video/BV1YrtMzvEaT/
    - theme: alt
      text: 演示
      link: /demo

features:
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2m16 0h2m-7-1v2m-6-2v2"/></g></svg>'
    title: Claude Code 深度集成 (NEW)
    details: 首个 AI 原生全栈框架！54+ 专业技能、15+ 智能命令、3 个自动化钩子，让 AI 真正理解你的代码架构。自动遵循项目规范，智能生成符合标准的代码，开发效率提升 10 倍
    link: /practices/ai/claude-code
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></g></svg>'
    title: 后端重大重构
    details: 四层架构（Controller-Service-DAO-Mapper）设计，DAO层统一查询构建，MyBatis Plus增强查询，多租户系统，权限控制，智能代码生成，主子表，支付集成，小程序/公众号集成
    link: /backend/
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2zm2.054 10.987H3.946"/></svg>'
    title: 前端全面升级
    details: Vue3 + Vite6 + TypeScript + Pinia + Element Plus + UnoCSS，组合式函数重构，丰富组件，前端直传，工具库完善，国际化增强
    link: /frontend/
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></g></svg>'
    title: 移动端最佳实践
    details: UniApp + Wd UI重构组件库，跨平台适配，组件示例完善齐全，优雅开发体验，支持微信小程序、H5、App全端覆盖
    link: /mobile/
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2m16 0h2m-7-1v2m-6-2v2"/></g></svg>'
    title: AI 能力集成 (NEW)
    details: LangChain4j 企业级集成，支持 OpenAI、Claude、DeepSeek、通义千问，流式聊天，RAG 检索增强，WebSocket 实时对话
    link: /backend/common/langchain4j
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9m2.9 2.8a6.14 6.14 0 0 0-.8 7.5"/><circle cx="12" cy="9" r="2"/><path d="M16.2 4.8c2 2 2.26 5.11.8 7.47M19.1 1.9a9.96 9.96 0 0 1 0 14.1m-9.6 2h5M8 22l4-11l4 11"/></g></svg>'
    title: 物联网通信 (NEW)
    details: MQTT 客户端集成 (mica-mqtt)，RocketMQ 消息队列，支持设备管理、实时数据采集、异步解耦、削峰填谷
    link: /backend/common/mqtt
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 22a1 1 0 0 1 0-20a10 9 0 0 1 10 9a5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></g></svg>'
    title: 多媒体处理 (NEW)
    details: 海报生成引擎，GIF 动图合成，火山引擎 TTS 语音合成，多音色支持，流式音频生成
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></g></svg>'
    title: 页面设计器 (NEW)
    details: 可视化拖拽设计，30+组件库，AI智能生成，实时预览，一键生成Vue代码，支持页面/弹窗/抽屉三种模式
    link: /frontend/tools/page-designer
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>'
    title: 最佳实践
    details: 开发规范指南，容器化集群部署，性能优化策略，监控告警体系，代码风格统一，架构扩展预留
    link: /practices/
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m15 12l-9.373 9.373a1 1 0 0 1-3.001-3L12 9m6 6l4-4"/><path d="m21.5 11.5l-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></g></svg>'
    title: 框架特性
    details: 全面重构亮点，Spring Boot 4 五分支矩阵，全站国际化，AI 深度思考，多租户 Pool↔Silo 迁移，2026 年最新特性
    link: /changelog
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg>'
    title: 视频教程
    details: 快速入门指南，开发实战教程，部署运维讲解，最佳实践分享，核心技术原理
    link: /video

highlights:
  - title: 重构亮点
    details: |
      **四层架构** - Controller-Service-DAO-Mapper清晰分层，职责明确
      **DAO层设计** - 统一在DAO层构建查询条件，Service层专注业务逻辑
      **代码即文档** - 看代码即是看文档，完善的注释和命名规范
      **统一命名** - 接口路径、方法名、变量名语义化，快速定位
      **增强查询** - PlusLambdaQuery、PlusQuery简化MyBatis Plus查询
      **权限完善** - 模块:表:操作三级权限标识符，精确控制

  - title: 开发体验
    details: |
      **智能生成** - 代码生成器自动生成四层架构CRUD代码，包含DAO层查询构建
      **工具丰富** - 全部文件重构，命名优化，注释完善，工具类、组合函数完善
      **类型安全** - 前后端类型声明统一，TypeScript全覆盖
      **国际化** - 后端返回国际化消息，前端智能翻译
      **组件化** - 表单组件、业务组件、移动端组件库重构

  - title: 企业级能力
    details: |
      **多租户** - 完整的租户数据隔离，支持SaaS模式
      **模块化架构** - 分层设计，支持灵活扩展
      **监控体系** - Spring Boot Admin + SnailJob任务调度
      **安全防护** - 权限认证、数据脱敏、防重提交、限流
      **支付集成** - wxjava + 支付宝SDK，支持微信v2/v3智能切换、公钥模式等
      **小程序、公众号集成** - 已接入多平台小程序，公众号等，开箱即用

  - title: 2025年最新集成
    details: |
      **AI能力** - LangChain4j 集成 OpenAI/Claude/DeepSeek/通义千问，流式聊天、RAG检索增强
      **物联网通信** - MQTT 客户端 (mica-mqtt)，支持设备管理、实时数据采集
      **消息队列** - RocketMQ 集成，异步解耦、削峰填谷、最终一致性
      **多媒体处理** - 海报生成引擎、GIF合成、火山引擎TTS语音合成
      **页面设计器** - 可视化拖拽设计、30+组件、AI智能生成、一键代码导出

  - title: Claude Code 原生支持
    details: |
      **54+ 专业技能** - 覆盖后端CRUD、前端组件、移动端开发、数据库设计等全栈场景
      **15+ 智能命令** - /dev开发、/crud生成、/check检查、/exp经验沉淀、/progress进度追踪
      **3 个自动化钩子** - 技能强制评估、工具调用拦截、会话结束处理
      **完整上下文工程** - CLAUDE.md + AGENTS.md 双配置，AI深度理解项目架构
      **规范自动遵循** - 四层架构、命名规范、代码风格100%自动化执行
---

## 为什么选择 ruoyi-plus-uniapp？

### 重构成果

- **减少代码量 70%** - 通过四层架构（Controller-Service-DAO-Mapper）和增强查询大幅减少样板代码
- **提升开发效率 80%** - 智能代码生成 + DAO层统一查询构建 + 完善工具库
- **统一开发规范** - 前后端移动端命名规范、类型声明统一、职责分层清晰
- **完善的文档** - 框架即文档理念，代码自说明

### 项目规模

<div style="text-align: center; margin: 30px 0;">
  <ImagePreview src="/images/commit.jpg" :width="800" :height="300" object-fit="contain" alt="RuoYi-Plus-UniApp 项目提交记录" />
</div>

**站在巨人的肩膀上，打造更优秀的全栈框架**

- **200万+ 行代码** - 基于成熟开源项目深度重构，继承社区多年积累
- **3800+ 次提交** - 持续迭代优化，每一次提交都是品质的提升
- **1年+ 深度重构** - 地毯式重构优化，统一规范，提升开发体验
- **开源社区协作** - 继承开源精神，吸收社区智慧，持续改进

本框架基于 RuoYi-Vue-Plus 开源项目进行全面重构，在继承其成熟稳定特性的基础上，进行了大量的优化和创新。通过统一命名规范、优化架构设计、完善文档体系，打造出更加简洁高效、开发友好的全栈解决方案。

### 演进历程

通过**地毯式重构**构建简洁高效、开发友好的全栈框架：

- **<Icon icon="lucide:target" /> 地毯式重构** - 基于ruoyi-vue-plus全面重构，统一命名规范，注重代码质量
- **<Icon icon="lucide:zap" /> 功能完善** - 多租户、支付集成、微信小程序、监控告警等企业级功能
- **<Icon icon="lucide:building" /> 架构优化** - 模块化设计、性能优化、开发体验提升

### 适用场景

- <Ok/> **企业管理系统** - 完整的权限体系和多租户支持
- <Ok/> **SaaS平台** - 租户隔离、支付集成、监控告警
- <Ok/> **移动应用** - 小程序、H5、App全端覆盖
- <Ok/> **快速原型** - 代码生成器快速搭建业务模块

## 立即开始

选择你感兴趣的技术栈开始学习：

<div class="tip custom-block" style="padding-top: 8px">

[<Icon icon="lucide:rocket" /> 后端开发](./backend/) - Spring Boot 3 + MyBatis Plus 增强

[<Icon icon="lucide:laptop" /> 前端开发](./frontend/) - Vue 3 + TypeScript + Element Plus

[<Icon icon="lucide:smartphone" /> 移动开发](./mobile/) - UniApp + 跨平台组件库

[<Icon icon="lucide:zap" /> 最佳实践](./practices/) - 开发规范 + 容器化部署

[<Icon icon="lucide:hammer" /> 框架特性](./changelog) - 重构亮点 + 版本更新

[<Icon icon="lucide:wrench" /> 视频教程](./video) - 入门指南 + 实战教程

</div>

## 授权定价

选择适合您的版本，开启高效开发之旅（三个版本代码完全一样，仅授权主体和开发人员数量差异，企业版须有营业执照方可购买）

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 40px 0; max-width: 1200px;">

<APricingCard
  plan="个人版"
  :price="2588"
  :original-price="3088"
  saving-text="节省 ¥500"
  description="适合个人开发者"
  :features="[
 '完整源码交付',
 '持续更新服务',
 '自主开发权限',
 '商业使用授权',
 '客户源码交付权',
 '技术支持服务',
 '专属答疑群邀请'
  ]"
  button-text="立即购买"
  footer-text="适合个人开发者和小型项目"
/>

<APricingCard
  plan="企业标准版"
  :price="3288"
  :original-price="4088"
  saving-text="节省 ¥800"
  description="开发团队 < 10人"
  :features="[
 '完整源码交付',
 '持续更新服务',
 '自主开发权限',
 '商业使用授权',
 '客户源码交付权',
 '技术支持服务',
 '专属答疑群邀请(可邀1人)'
  ]"
  recommended
  button-text="立即购买"
  footer-text="中小企业的理想选择"
/>

<APricingCard
  plan="企业高级版"
  :price="5888"
  :original-price="7088"
  saving-text="节省 ¥1200"
  description="开发团队 10~30人"
  :features="[
 '完整源码交付',
 '持续更新服务',
 '自主开发权限',
 '商业使用授权',
 '客户源码交付权',
 '技术支持服务',
 '专属答疑群邀请(可邀2人)'
  ]"
  button-text="立即购买"
  footer-text="大型企业的最佳选择"
/>

</div>

::: tip 购买说明
- <Icon icon="lucide:briefcase" /> **企业授权**：支持商业项目使用，可交付客户源码
- <Icon icon="lucide:refresh-cw" /> **持续更新**：享受框架功能迭代和Bug修复
- <Icon icon="lucide:shield" /> **技术支持**：提供专业的技术支持服务
- <Icon icon="lucide:users" /> **额外邀人**：额外邀人进答疑群 488/人
- <Warn/> **使用限制**：仅禁止框架二次销售和扩散传播
:::

## 产品矩阵

抓蛙师出品，覆盖全栈开发、AI 效率工具、桌面应用三大场景

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin: 30px 0;">

<a href="https://ai-workstation.ruoyi.plus/" target="_blank" rel="noopener noreferrer" class="product-preview-card">
  <img src="/products/ai-workstation.svg" alt="AI 全能工作站" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px;" />
  <h4 style="margin: 0 0 8px; font-size: 18px; color: var(--vp-c-text-1);">AI 全能工作站</h4>
  <p style="margin: 0 0 8px; font-size: 13px; color: #0B6EF0; font-weight: 500;">一句话搞定一切 · 61个模块 · 1246 AI技能</p>
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6;">八大领域全覆盖 | 智能路由 | 42集视频教程</p>
</a>

<a href="https://aicoder.ruoyi.plus/" target="_blank" rel="noopener noreferrer" class="product-preview-card">
  <img src="/products/aicoder.png" alt="智码 AiCoder" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px;" />
  <h4 style="margin: 0 0 8px; font-size: 18px; color: var(--vp-c-text-1);">智码 AiCoder</h4>
  <p style="margin: 0 0 8px; font-size: 13px; color: #8B5CF6; font-weight: 500;">给 Claude Code、Codex、Gemini CLI 一个统一的家</p>
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6;">多标签会话 | Token费用追踪 | 零额外开销</p>
</a>

<a href="https://tauri.ruoyi.plus/" target="_blank" rel="noopener noreferrer" class="product-preview-card">
  <img src="/products/tauri-desktop.svg" alt="灵动桌面框架" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px;" />
  <h4 style="margin: 0 0 8px; font-size: 18px; color: var(--vp-c-text-1);">灵动桌面框架</h4>
  <p style="margin: 0 0 8px; font-size: 13px; color: #10B981; font-weight: 500;">React 19 + Rust + TypeScript · AI驱动跨平台</p>
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6;">Tauri 2.x | 33个AI技能 | 三引擎协同</p>
</a>

<a href="https://sigil.ruoyi.plus" target="_blank" rel="noopener noreferrer" class="product-preview-card">
  <img src="/products/sigil.svg" alt="Sigil" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px;" />
  <h4 style="margin: 0 0 8px; font-size: 18px; color: var(--vp-c-text-1);">Sigil</h4>
  <p style="margin: 0 0 8px; font-size: 13px; color: #10B981; font-weight: 500;">AI 凭据金库 · 让 AI 拿不到你的密钥</p>
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6;">AES-256 加密 | MCP 代理 | 审计 + 范围控制</p>
</a>

<a href="https://reeve.ruoyi.plus" target="_blank" rel="noopener noreferrer" class="product-preview-card">
  <img src="/products/reeve.png" alt="Reeve" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px;" />
  <h4 style="margin: 0 0 8px; font-size: 18px; color: var(--vp-c-text-1);">Reeve</h4>
  <p style="margin: 0 0 8px; font-size: 13px; color: #0EA5E9; font-weight: 500;">服务器庄园总管 · 你持钥 AI 借道</p>
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6;">SSH 管理 | MCP 受控接入 | 四重关卡 + 审计</p>
</a>

<a href="https://agileshot.ruoyi.plus" target="_blank" rel="noopener noreferrer" class="product-preview-card">
  <img src="/products/agileshot.png" alt="AgileShot" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px;" />
  <h4 style="margin: 0 0 8px; font-size: 18px; color: var(--vp-c-text-1);">AgileShot</h4>
  <p style="margin: 0 0 8px; font-size: 13px; color: #F59E0B; font-weight: 500;">AI 时代的桌面截图与标注工具</p>
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6;">11 种标注 | AI OCR/翻译 | MCP 扩展</p>
</a>

<a href="https://kb.ruoyi.plus/" target="_blank" rel="noopener noreferrer" class="product-preview-card">
  <img src="/products/knowledge-base.png" alt="本地知识库" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px;" />
  <h4 style="margin: 0 0 8px; font-size: 18px; color: var(--vp-c-text-1);">本地知识库</h4>
  <p style="margin: 0 0 8px; font-size: 13px; color: #8B5CF6; font-weight: 500;">全文搜索 · 双链 · 知识图谱 · MCP</p>
  <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2); line-height: 1.6;">12 工具 MCP | 双链图谱 | 多端同步</p>
</a>

</div>

## 企业信赖

以下企业已选择 ruoyi-plus-uniapp 作为技术底座，覆盖医疗、教育、金融、农业、物联网、电商等多个行业

<div class="trusted-companies">
  <div class="company-grid">
    <span class="company-tag">广东移动</span>
    <span class="company-tag">湛江移动公司</span>
    <span class="company-tag">中运交投（深圳）投资集团有限公司</span>
    <span class="company-tag">淮沪煤电有限公司田集发电厂</span>
    <span class="company-tag">山重建机有限公司</span>
    <span class="company-tag">江门市得实计算机外部设备有限公司</span>
    <span class="company-tag">北京国泰大华科技有限公司</span>
    <span class="company-tag">华创旗晟（华东）科技有限公司</span>
    <span class="company-tag">山东仰泰新能源有限公司</span>
    <span class="company-tag">美幻（上海）电子商务有限公司</span>
    <span class="company-tag">北京渐健医疗科技有限公司</span>
    <span class="company-tag">幸智健康科技服务（深圳）有限公司</span>
    <span class="company-tag">黑龙江医创智联科技有限公司</span>
    <span class="company-tag">南京畅百则物联网科技有限公司</span>
    <span class="company-tag">苏州德孚信息科技有限公司</span>
    <span class="company-tag">青岛海川信息技术有限公司</span>
    <span class="company-tag">深圳市宏丰软件技术有限公司</span>
    <span class="company-tag">武汉浙科友通软件有限公司</span>
    <span class="company-tag">武汉智深源科技有限公司</span>
    <span class="company-tag">武汉邦拓信息科技有限公司</span>
    <span class="company-tag">武汉盛锦汇科技有限公司</span>
    <span class="company-tag">武汉市十庆智能科技有限公司</span>
    <span class="company-tag">贵州中科易联科技有限公司</span>
    <span class="company-tag">北京惟舍之旅科技有限公司</span>
    <span class="company-tag">北京启天和科技有限公司</span>
    <span class="company-tag">河北优狐教育科技有限公司</span>
    <span class="company-tag">山东容微数字科技有限公司</span>
    <span class="company-tag">山东军创科技服务有限公司</span>
    <span class="company-tag">山东简单派科技有限公司</span>
    <span class="company-tag">山东亚新塑料包装有限公司</span>
    <span class="company-tag">合肥昊微信息科技有限公司</span>
    <span class="company-tag">合肥识渊智能科技有限公司</span>
    <span class="company-tag">合肥伊福徕信息技术有限公司</span>
    <span class="company-tag">重庆禹霖韬略网络科技有限责任公司</span>
    <span class="company-tag">杭州锲意达科技有限公司</span>
    <span class="company-tag">嘉兴想天信息科技有限公司</span>
    <span class="company-tag">金华市智维工艺品有限公司</span>
    <span class="company-tag">厦门识相科技有限公司</span>
    <span class="company-tag">广州课官科技有限公司</span>
    <span class="company-tag">广西南宁木鱼电子科技有限公司</span>
    <span class="company-tag">南宁星铁科技有限公司</span>
    <span class="company-tag">深圳市铠硕达科技有限公司</span>
    <span class="company-tag">深圳市尚古堂食品发展有限公司</span>
    <span class="company-tag">深圳市简易网络科技</span>
    <span class="company-tag">九紫离火（福州）科技有限公司</span>
    <span class="company-tag">盐城零一软件科技有限公司</span>
    <span class="company-tag">天津粮道农业科技有限公司</span>
    <span class="company-tag">郑州市五阳软件开发有限公司</span>
    <span class="company-tag">河南新好信息科技有限公司</span>
    <span class="company-tag">河南校园终端有限公司</span>
    <span class="company-tag">安阳泽康网络科技有限公司</span>
    <span class="company-tag">临汾市名典新语文化科技有限公司</span>
    <span class="company-tag">兰州宏知汇点信息技术有限公司</span>
    <span class="company-tag">内蒙古敖然科技有限责任公司</span>
    <span class="company-tag">云南有块田农业科技有限公司</span>
    <span class="company-tag">云南原信科技有限公司</span>
    <span class="company-tag">四川森唯科技有限公司</span>
    <span class="company-tag">燚朗科技有限公司</span>
    <span class="company-tag">兰山区星河手机电脑店</span>
    <span class="company-tag">北京女娲补天科技信息技术有限公司</span>
    <span class="company-tag">东莞市码载网络科技有限公司</span>
    <span class="company-tag">奇妙科技有限公司</span>
    <span class="company-tag">绵阳能创科技有限责任公司</span>
    <span class="company-tag">湖北锦恒网络科技有限公司</span>
    <span class="company-tag">上海约格信息技术有限公司</span>
    <span class="company-tag">重庆金芯科技有限公司</span>
    <span class="company-tag">武汉顺为起点软件技术咨询有限公司</span>
    <span class="company-tag">易必佩（温州）技术有限公司</span>
    <span class="company-tag">广州享元数字科技有限公司</span>
    <span class="company-tag">陕西嘉澜电子科技有限公司</span>
    <span class="company-tag">安升重工有限公司</span>
    <span class="company-tag">陕西智信物联信息科技有限公司</span>
    <span class="company-tag">浙江甬讯通信息科技有限公司</span>
    <span class="company-tag">贵州先知科技有限公司</span>
    <span class="company-tag">广西致浩信息技术有限公司</span>
    <span class="company-tag">重庆康脉信息科技有限公司</span>
    <span class="company-tag">宁波国际物流发展股份有限公司</span>
    <span class="company-tag">物产中大（浙江）数字贸易科技有限公司</span>
    <span class="company-tag">山东图钉软件有限公司</span>
    <span class="company-tag">皓酌工程咨询服务（上海）有限公司</span>
    <span class="company-tag">娄底华菱云创数智科技有限公司</span>
    <span class="company-tag">深圳市够威体育科技有限公司</span>
    <span class="company-tag">武汉珞珈新图科技有限公司</span>
    <span class="company-tag">南京云巍互联网络科技有限公司</span>
    <span class="company-tag">杭州循元智能科技有限公司</span>
    <span class="company-tag">道明光学股份有限公司</span>
    <span class="company-tag">山东东八区信息科技有限公司</span>
    <span class="company-tag">步阳集团有限公司</span>
    <span class="company-tag">宜昌市西陵区星露软件开发工作室</span>
  </div>
</div>

<div style="text-align: center; margin-top: 16px; color: #999; font-size: 14px;">
  持续更新中... 共 <strong>100+</strong> 家企业选择信赖
</div>

## 技术服务 · 承接定制开发

**若依科技工作室**(广东省湛江市麻章区湖光镇)由 **抓蛙师** 创办,既是 `ruoyi-plus-uniapp` 全栈框架的作者团队,也对外承接定制化项目开发,**提供完整源码交付,可签订源码交付合同**。

- <Icon icon="lucide:globe" /> **后台管理系统 / 全栈开发** — 企业管理后台、SaaS 平台、商城、物联网平台
- <Icon icon="lucide:monitor" /> **桌面软件开发** — 跨平台桌面应用(Tauri),覆盖 Windows / macOS / Linux
- <Icon icon="lucide:smartphone" /> **小程序 / 公众号** — 微信小程序、公众号、H5、App 全端覆盖
- <Icon icon="lucide:bot" /> **大模型与 Agent 工程** — RAG 检索增强、工具调用、多智能体编排、知识库工程化
- <Icon icon="lucide:brain" /> **项目 AI 技能体系定制** — 为你的项目打造 Claude Code 技能 / 命令 / 钩子,让 AI 懂你的代码、守你的规范
- <Icon icon="lucide:factory" /> **行业方案** — 教育、政务、医疗、金融、农业、电商等

> <Icon icon="lucide:phone" /> 项目咨询:**198 6657 9313**(电话) · **770492966**(微信 / QQ) · B 站 [@抓蛙师](https://space.bilibili.com/520725002)

## 技术支持

- <Icon icon="lucide:mail" /> **联系方式**: 770492966 (微信/QQ)
- <Icon icon="lucide:globe" /> **官网文档**: https://ruoyi.plus

### 扫码关注

<div style="display: flex; gap: 30px; margin: 20px 0; flex-wrap: wrap; align-items: flex-start;">
  <div style="text-align: center;">
    <ImagePreview src="/gzh.png" :width="240" :height="320" object-fit="contain" alt="RuoYi-Plus 微信公众号二维码" />
    <p style="margin-top: 10px;"><strong>微信公众号</strong></p>
    <p style="margin-top: 5px; color: #666;">获取最新技术资讯</p>
  </div>
  <div style="text-align: center;">
    <ImagePreview src="/wx.jpg" :width="240" :height="320" object-fit="contain" alt="RuoYi-Plus 微信联系方式" />
    <p style="margin-top: 10px;"><strong>微信联系</strong></p>
    <p style="margin-top: 5px; color: #666;">一对一技术咨询</p>
  </div>
  <div style="text-align: center;">
    <ImagePreview src="/wxq.jpg" :width="240" :height="320" object-fit="contain" alt="RuoYi-Plus 技术交流群二维码" />
    <p style="margin-top: 10px;"><strong>技术交流群</strong></p>
    <p style="margin-top: 5px; color: #666;">与开发者交流讨论</p>
  </div>
  <div style="text-align: center;">
    <ImagePreview src="/软著.png" :width="240" :height="320" object-fit="contain" alt="RuoYi-Plus-UniApp 软件著作权证书" />
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
