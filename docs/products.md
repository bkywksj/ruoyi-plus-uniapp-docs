# 更多产品

**抓蛙师出品** — 覆盖 AI 效率、智能编程、桌面应用三大场景，助力开发者高效构建产品

---

<div class="products-grid">

<AProductCard
  icon="🤖"
  name="AI 全能工作站"
  slogan="一句话搞定一切 · 49个专业模块 · 823 AI技能"
  description="覆盖内容创作、办公效率、多媒体处理、商业财务、设计策略、数据分析、运营协作、效率工具八大领域。用自然语言描述需求，两级智能路由自动识别意图，跨工具协作完成复杂任务。"
  theme="blue"
  badge="42集教程"
  :highlights="[
    '八大领域49个模块：封面设计、视频制作、PPT/Excel/Word、图片处理、音频合成等',
    '智能路由系统：自然语言交互，自动匹配最佳工具完成任务',
    '多模型协同：Claude + Codex + Gemini 三引擎协作、交叉审查',
    '技能工厂：内置引擎持续生成新技能，工作站能力不断增长',
    '邀请好友注册，试用天数 +1，持续体验'
  ]"
  :actions="[
    { text: '访问官网', link: 'https://ai-workstation.ruoyi.plus/' },
    { text: '视频教程', link: 'https://www.bilibili.com/video/BV17cXNBkEEV' },
    { text: 'MCP 试用', link: 'https://ai-workstation-mcp.agilefr.com/' }
  ]"
/>

<AProductCard
  icon="⚡"
  name="智码 AiCoder"
  slogan="给 Claude Code、Codex、Gemini CLI 一个统一的家"
  description="内置真实PTY伪终端，CLI原生运行，不拦截、不修改、不转发任何API请求，零额外开销。像浏览器一样管理AI对话，按项目分组、收藏标记、颜色区分。"
  theme="purple"
  badge="30天免费"
  :highlights="[
    '多标签会话管理：按项目分组、收藏标记、颜色区分、模糊搜索',
    '多账号完全隔离：独立登录凭据、API Key、会话记录和数据库',
    'Token费用实时追踪：输入/输出/缓存分别统计，趋势图、180天热力图',
    '代码片段一键复用：常用Prompt存为片段，支持模板变量',
    'MCP Server可视化管理：自动检测AI工具、一键切换'
  ]"
  :actions="[
    { text: '访问官网', link: 'https://aicoder.ruoyi.plus/' }
  ]"
/>

<AProductCard
  icon="🖥️"
  name="灵动桌面框架"
  slogan="React 19 + Rust + TypeScript · AI驱动 · 轻量安全 · 高性能跨平台"
  description="基于Tauri 2.x的企业级桌面应用开发框架，内置33个AI专业技能，Claude + Codex + Gemini三引擎协同。双进程架构，WebView前端与Rust后端通过IPC高效通信。"
  theme="green"
  :highlights="[
    '双进程架构：WebView前端 + Rust后端，IPC高效通信',
    'AI驱动开发：内置33个AI专业技能，三引擎协同',
    '现代技术栈：React 19 + TypeScript 5.8 + Ant Design 6 + TailwindCSS 4',
    '安全权限控制：Capabilities权限声明机制，细粒度API访问控制',
    '多平台打包：Windows (NSIS/MSI)、macOS (DMG)、Linux (DEB/AppImage)'
  ]"
  :actions="[
    { text: '访问官网', link: 'https://tauri.ruoyi.plus/' }
  ]"
/>

</div>

---

<div class="products-footer">
  <p>以上产品均由 <strong>抓蛙师</strong> 独立开发维护，如有合作意向或技术咨询，欢迎联系</p>
  <p>微信/QQ：<strong>770492966</strong> | 官网：<a href="https://ruoyi.plus" target="_blank">ruoyi.plus</a></p>
</div>

<style>
.products-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 32px 0;
}

.products-footer {
  text-align: center;
  padding: 32px 0 16px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.products-footer p {
  margin: 4px 0;
}

.products-footer a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.products-footer a:hover {
  text-decoration: underline;
}
</style>
