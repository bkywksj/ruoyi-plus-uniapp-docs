# 产品矩阵

**抓蛙师出品** — 覆盖智能编程、凭据安全、服务器运维、知识管理、桌面框架、全栈开发等场景，助力开发者高效构建产品

---

<div class="products-grid">

<AProductCard
  icon="lucide:bot"
  logo="/products/ai-workstation.svg"
  name="AI 全能工作站"
  slogan="一句话搞定一切 · 63个专业模块 · 1310 AI技能"
  description="覆盖内容创作、办公效率、多媒体处理、商业财务、设计策略、数据分析、运营协作、效率工具八大领域。用自然语言描述需求，两级智能路由自动识别意图，跨工具协作完成复杂任务。"
  theme="blue"
  badge="42集教程"
  :highlights="[
    '九大领域63个模块：封面设计、视频制作、PPT/Excel/Word、图片处理、音频合成等',
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
  icon="lucide:zap"
  logo="/products/aicoder.png"
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
  icon="lucide:monitor"
  logo="/products/tauri-desktop.svg"
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

<AProductCard
  icon="lucide:lock-keyhole"
  logo="/products/sigil.svg"
  name="Sigil"
  slogan="AI 凭据金库 · MCP 协议代理 —— AI 用得到、看不到明文"
  description="基于 Tauri 2 的开发者凭据保险库。系统密钥环 + AES-256-GCM + SQLCipher 整库加密，AI 通过 MCP 协议调用能力，凭据只在本地使用、结果脱敏返回，永不进入 AI 上下文。"
  theme="green"
  :highlights="[
    '加密金库：系统密钥环 + AES-256-GCM + SQLCipher 整库加密，密钥永不离手',
    'MCP 标准协议：Claude Code / Cursor / Cline / Zed 等客户端原生接入',
    '内置能力 + 可扩展：Git push、Gitee/GitHub/GitCode 仓库操作、HTTP API 代理、数据库查询，UI 配置无需编程',
    '审计日志 + 范围控制：每次凭据访问留痕可追溯，每个凭据限定可用能力',
    '本地优先：所有数据全在本机 SQLite，AI 拿不到任何明文凭据'
  ]"
  :actions="[
    { text: '访问官网', link: 'https://sigil.ruoyi.plus' }
  ]"
/>

<AProductCard
  icon="lucide:shield"
  logo="/products/reeve.png"
  name="Reeve"
  slogan="服务器庄园总管 · SSH 管理 + 受控 AI 接入（MCP）"
  description="基于 Tauri 2 的 SSH 服务器管理 + 受控 AI 接入桌面工具。你持钥、AI 借道：AI 通过 MCP 操作服务器，只看到服务器别名，拿不到账号密码私钥；四重关卡 + 全量审计，MCP 仅监听 127.0.0.1。"
  theme="blue"
  :highlights="[
    '一流 SSH 客户端：多标签终端 · 服务器清单 · SFTP · 命令片段，可替代 Xshell / Termius / FinalShell',
    'AI 安全跳板：Claude Code / Codex / claude.ai 通过 MCP 操作服务器，只见别名不见凭据',
    '四重安全关卡：全局开关 → 每服务器分级策略 → 危险命令黑名单 → 全量审计',
    '凭据零泄露：AES-256-GCM + 系统钥匙串，MCP 仅监听 127.0.0.1 绝不公网',
    '越用越懂你：以项目目录沉淀经验库 / Runbook / 可配置技能'
  ]"
  :actions="[
    { text: '访问官网', link: 'https://reeve.ruoyi.plus' }
  ]"
/>

<AProductCard
  icon="lucide:camera"
  logo="/products/agileshot.png"
  name="AgileShot"
  slogan="AI 时代的桌面截图与标注工具"
  description="基于 Qt 6 + C++20 自研 Agile-Qt 框架的桌面截图标注工具。整合截图捕获、11 种标注、AI 智能（OCR/翻译）、钉图贴图、录屏 GIF、MCP Server 扩展，一体化。"
  theme="orange"
  badge="11 种标注"
  :highlights="[
    '11 种标注工具开箱即用：矩形/椭圆/箭头/文字/马赛克/模糊/计数/高亮/图章，撤销重做完整',
    'AI 智能标注：一键 OCR、翻译、代码解释，截图即问 AI',
    'MCP Server：让 Claude Desktop / Cursor 直接在屏幕上工作（9 个 MCP 工具）',
    '钉图 / 贴图：鼠标穿透、多张同存、独立缩放',
    '录屏 + GIF + 取色器 + 历史全文搜索（SQLite 本地存储）'
  ]"
  :actions="[
    { text: '访问官网', link: 'https://agileshot.ruoyi.plus' },
    { text: '视频介绍', link: 'https://www.bilibili.com/video/BV1uQ7k6nEvq' }
  ]"
/>

<AProductCard
  icon="lucide:library"
  logo="/products/knowledge-base.png"
  name="本地知识库"
  slogan="全文搜索 · 双向链接 · 知识图谱 · 内置 MCP Server"
  description="基于 Tauri 2 的本地优先知识库。Markdown 笔记 + 双向链接 + 知识图谱，PDF/Word/图片/视频全格式，内置 MCP Server 让 AI 直接读写知识库，所有数据全在本机 SQLite。"
  theme="purple"
  :highlights="[
    '全文搜索 · 双向链接 · 知识图谱：知识自由编织、可视化追溯',
    '全格式支持：PDF 标注、Word 导入、图片/视频/音频附件',
    '内置 MCP Server（12 工具）：一键接入 Claude Desktop / Cursor / Cherry Studio',
    'AI 对话：笔记内一键召唤 AI 结合上下文回答',
    '多端同步 · 数据自主：WebDAV / 坚果云 / NAS，全在本机 SQLite'
  ]"
  :actions="[
    { text: '访问官网', link: 'https://kb.ruoyi.plus/' },
    { text: '视频讲解', link: 'https://www.bilibili.com/video/BV1xvosBREbr' }
  ]"
/>

<AProductCard
  icon="lucide:file-text"
  logo="/products/officia.svg"
  name="Officia"
  slogan="纯自研零依赖 Java 文档处理套件 —— Aspose 的国产平替"
  description="Word/Excel/PPT 转 PDF、模板填充与邮件合并、PDF 读写加密、图像处理、条码二维码、邮件归档。从 OOXML 解析到 PDF 渲染全链路自研，运行时只依赖 JDK 标准库，无第三方传递依赖、无授权风险，可商用可闭源分发。"
  theme="orange"
  badge="已上 Maven Central"
  :highlights="[
    '运行时零第三方依赖：只用 JDK 标准库，mvn dependency:tree 机器可证，不与宿主项目产生版本冲突',
    '七大能力一次引入：Words / Cells / Slides / Pdf / Email / Imaging / BarCode，一个 officia-all 坐标全都有',
    '中文不踩坑：TrueType 度量 + keep-GID 子集 + CID/Identity-H 嵌入，PDF 里中文正确显示且可复制可搜索',
    '洁净室自研：只依据 PDF 32000 / ECMA-376 / MS-DOC 等官方规范实现，不参考任何第三方库源码',
    '离线席位授权：不联网、不锁机器，授权文件放进 classpath 即自动加载，无需改一行代码'
  ]"
  :actions="[
    { text: '访问官网', link: 'https://officia.ruoyi.plus' },
    { text: '在线试用', link: 'https://demo.officia.ruoyi.plus' }
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
