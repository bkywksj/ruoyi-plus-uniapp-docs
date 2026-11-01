// 方案 C 全站原型公共壳：页头（按 <body data-nav> 高亮当前栏目）、手机抽屉菜单、页脚、Ctrl K 搜索弹层。
// 原型阶段用脚本注入，省得 9 个页面各抄一份；落地时这些分别对应 Astro 的 Header / Footer / SearchDialog 组件。
(function () {
  const P = '../../../public/';
  const NAV = [
    ['后端', 'dir.html', 'backend'], ['前端', 'dir.html', 'frontend'], ['移动端', 'dir.html', 'mobile'], ['最佳实践', 'dir.html', 'practices'],
    ['特性', 'changelog.html', 'changelog'], ['框架对比', 'comparison.html', 'comparison'], ['视频', 'video.html', 'video'],
    ['演示', 'demo.html', 'demo'], ['产品矩阵', 'products.html', 'products'], ['技术服务', 'services.html', 'services'],
  ];
  const cur = document.body.dataset.nav || '';
  const link = ([t, h, k]) => `<a href="${h}" class="rounded-lg px-2.5 py-1.5 transition ${k === cur ? 'bg-white/[.09] text-white' : 'text-white/60 hover:text-white hover:bg-white/[.06]'}">${t}</a>`;

  const header = `
<header class="sticky top-0 z-50 border-b border-white/[.07] bg-[#07080D]/95 backdrop-blur text-white">
  <div class="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-5 lg:px-8">
    <button id="nav-open" class="xl:hidden -ml-1 grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/[.06]" aria-label="打开菜单"><i data-lucide="menu" class="size-5"></i></button>
    <a href="home.html" class="flex items-center gap-2.5 font-semibold text-[15px]"><img src="${P}logo.png" alt="" class="size-7 object-contain" />RuoYi-Plus</a>
    <nav class="hidden xl:flex items-center gap-0.5 text-[13.5px]">${NAV.map(link).join('')}</nav>
    <div class="ml-auto flex items-center gap-2">
      <button data-search class="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-3 py-1.5 text-[13px] text-white/50 hover:text-white/80 hover:border-white/20 transition"><i data-lucide="search" class="size-3.5"></i><span class="hidden sm:inline">搜索文档</span><kbd class="mono hidden sm:inline rounded border border-white/10 px-1.5 text-[10px] text-white/40">Ctrl K</kbd></button>
      <a href="https://github.com/bkywksj/ruoyi-plus-uniapp-docs" class="hidden md:grid size-9 place-items-center rounded-lg text-white/60 hover:text-white hover:bg-white/[.06]" aria-label="GitHub"><svg viewBox="0 0 16 16" class="size-4" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a>
      <a href="doc.html" class="hidden sm:inline-flex rounded-lg bg-white px-4 py-1.5 text-[13px] font-semibold text-[#07080D] hover:bg-white/90">开始使用</a>
    </div>
  </div>
</header>
<div id="drawer" class="fixed inset-0 z-[60] hidden">
  <div data-close class="absolute inset-0 bg-black/60"></div>
  <aside class="absolute inset-y-0 left-0 w-[290px] ink p-5 overflow-y-auto">
    <div class="flex items-center justify-between"><span class="flex items-center gap-2 font-semibold"><img src="${P}logo.png" class="size-7" alt="" />RuoYi-Plus</span><button data-close class="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/[.06]" aria-label="关闭"><i data-lucide="x" class="size-5"></i></button></div>
    <p class="kicker mt-7">文档</p>
    <div class="mt-2 grid gap-1 text-[15px]">${NAV.slice(0, 4).map(([t, h, k]) => `<a href="${h}" class="rounded-lg px-3 py-2 ${k === cur ? 'bg-white/10 text-white' : 'text-white/70'}">${t}</a>`).join('')}</div>
    <p class="kicker mt-6">了解</p>
    <div class="mt-2 grid gap-1 text-[15px]">${NAV.slice(4).map(([t, h, k]) => `<a href="${h}" class="rounded-lg px-3 py-2 ${k === cur ? 'bg-white/10 text-white' : 'text-white/70'}">${t}</a>`).join('')}</div>
  </aside>
</div>`;

  const footer = `
<footer class="ink border-t border-white/[.06]">
  <div class="mx-auto max-w-[1240px] px-6 py-14 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
    <div><p class="flex items-center gap-2.5 font-semibold text-white"><img src="${P}logo.png" alt="" class="size-8 object-contain" />RuoYi-Plus-UniApp</p>
      <p class="mt-3 max-w-sm text-sm leading-6 text-white/45">框架即文档 提供最优雅的开发体验。Spring Boot + Vue3 + UniApp 全栈框架，200万+ 行代码 · 3800+ 次提交。</p></div>
    <nav><p class="text-sm font-semibold text-white">文档</p><ul class="mt-3 space-y-2 text-sm text-white/45">${NAV.slice(0, 4).map(([t, h]) => `<li><a href="${h}" class="hover:text-white transition">${t}</a></li>`).join('')}</ul></nav>
    <nav><p class="text-sm font-semibold text-white">了解</p><ul class="mt-3 space-y-2 text-sm text-white/45">${NAV.slice(4, 8).map(([t, h]) => `<li><a href="${h}" class="hover:text-white transition">${t}</a></li>`).join('')}</ul></nav>
    <nav><p class="text-sm font-semibold text-white">更多</p><ul class="mt-3 space-y-2 text-sm text-white/45"><li><a href="demo.html#price" class="hover:text-white transition">授权定价</a></li><li><a href="products.html" class="hover:text-white transition">产品矩阵</a></li><li><a href="services.html" class="hover:text-white transition">技术服务</a></li></ul></nav>
  </div>
  <div class="mx-auto max-w-[1240px] px-6 py-6 border-t border-white/[.06] flex flex-col gap-2 sm:flex-row sm:justify-between text-xs text-white/45">
    <p>湛江智脑科技有限公司 · 若依科技工作室 · 项目咨询 198 6657 9313 / 微信 QQ 770492966</p>
    <p>© 2026 抓蛙师 · <a href="https://beian.miit.gov.cn/" class="hover:text-white transition">粤ICP备2021091549号-5</a></p>
  </div>
</footer>`;

  // 搜索弹层：结果按栏目分组、命中词高亮，底部给键盘提示（落地时数据来自 Pagefind）
  const hits = [
    ['移动端', '移动端快速启动', '环境要求 › 必需环境', '确保你的开发环境满足 <mark>Node.js</mark> >= 18.0.0，推荐使用 LTS 版本', 'doc.html'],
    ['移动端', '移动端项目简介', '环境要求', '<mark>Node.js</mark> ≥ 20.0.0 · pnpm ≥ 7.30.0', 'dir.html'],
    ['后端', '快速启动', '环境准备', 'JDK 21、MySQL 8、Redis 5+，前端需 <mark>Node.js</mark> 18+', 'doc.html'],
    ['前端', '前端快速开始', '安装依赖', '使用 pnpm 安装依赖，<mark>Node.js</mark> 版本需与 .nvmrc 一致', 'doc.html'],
    ['最佳实践', '本地开发环境', 'Node 版本管理', '推荐 nvm-windows 管理多个 <mark>Node.js</mark> 版本', 'doc.html'],
  ];
  const groups = [...new Set(hits.map((h) => h[0]))];
  const modal = `
<div id="search" class="fixed inset-0 z-[70] hidden">
  <div data-close class="absolute inset-0 bg-[#07080D]/70 backdrop-blur-sm"></div>
  <div class="relative mx-auto mt-[10vh] w-[min(680px,calc(100%-24px))] overflow-hidden rounded-2xl bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,.6)]">
    <div class="flex items-center gap-3 border-b border-black/[.07] px-5 h-14"><i data-lucide="search" class="size-4 text-[#5B7CFF]"></i><input value="Node.js" class="flex-1 bg-transparent text-[15px] outline-none" aria-label="搜索文档" /><span class="mono text-[11px] text-black/35">511 页 · 已索引</span><kbd data-close class="mono cursor-pointer rounded border border-black/10 px-1.5 text-[10px] text-black/45">Esc</kbd></div>
    <div class="flex gap-1.5 px-5 pt-3 text-[12px]"><span class="rounded-full bg-[#0B0D14] px-2.5 py-0.5 text-white">全部 ${hits.length}</span>${groups.map((g) => `<span class="rounded-full border border-black/[.08] px-2.5 py-0.5 text-black/55">${g} ${hits.filter((h) => h[0] === g).length}</span>`).join('')}</div>
    <div class="max-h-[56vh] overflow-y-auto scroll-thin px-3 py-3">
      ${groups.map((g) => `<p class="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-black/40">${g}</p>` + hits.filter((h) => h[0] === g).map((h, i) => `
      <a href="${h[4]}" class="group flex gap-3 rounded-xl px-3 py-2.5 ${g === groups[0] && i === 0 ? 'bg-[#F1F4FF]' : 'hover:bg-black/[.03]'}">
        <i data-lucide="file-text" class="mt-0.5 size-4 shrink-0 text-black/35"></i>
        <span class="min-w-0 flex-1"><span class="block text-[14px] font-semibold text-[#0B0D14]">${h[1]} <span class="font-normal text-black/40">› ${h[2]}</span></span>
        <span class="mt-0.5 block truncate text-[13px] text-black/55 [&_mark]:bg-[#5B7CFF]/15 [&_mark]:text-[#2B3FAF] [&_mark]:rounded [&_mark]:px-0.5">${h[3]}</span></span>
        <i data-lucide="corner-down-left" class="mt-1 size-3.5 text-black/30 ${g === groups[0] && i === 0 ? '' : 'opacity-0 group-hover:opacity-100'}"></i>
      </a>`).join('')).join('')}
    </div>
    <div class="flex items-center gap-4 border-t border-black/[.07] bg-[#F8F9FC] px-5 h-11 text-[12px] text-black/45"><span><kbd class="mono rounded border border-black/10 bg-white px-1">↑</kbd> <kbd class="mono rounded border border-black/10 bg-white px-1">↓</kbd> 选择</span><span><kbd class="mono rounded border border-black/10 bg-white px-1">Enter</kbd> 打开</span><span class="ml-auto">问 AI：在 Claude Code 里输入 <span class="mono text-[#3D5BEA]">/docs Node.js</span></span></div>
  </div>
</div>`;

  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer + modal);
  const S = document.getElementById('search');
  const D = document.getElementById('drawer');
  const open = (el) => el.classList.remove('hidden');
  const shut = () => { S.classList.add('hidden'); D.classList.add('hidden'); };
  document.querySelectorAll('[data-search]').forEach((b) => b.addEventListener('click', () => open(S)));
  document.getElementById('nav-open').addEventListener('click', () => open(D));
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', shut));
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(S); }
    if (e.key === 'Escape') shut();
  });
  if (location.hash === '#search') open(S);
  window.lucide && lucide.createIcons();
})();
