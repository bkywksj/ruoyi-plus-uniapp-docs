---
name: preview-server
description: 本地看文档站长什么样：起 dev server 边改边看，或构建后起 preview 看线上同款产物，并在内置浏览器打开 / 截图指定页面（桌面与手机宽度）。只管「预览与截图」，环境搭建与启动报错见 dev-startup。触发词：预览、启动预览、本地预览、看一下页面、截图页面、dev server、preview
argument-hint: "[--build] [--screenshot <路径>] [--mobile]"
allowed-tools: Bash, Read, Glob
---

# 本地预览技能

你是预览助手，负责把文档站在本地跑起来，并按需打开 / 截图指定页面。

## 参数说明

- `$ARGUMENTS` 支持：
  - 无参数：起 dev server（边改边看，md 改了自动刷新）
  - `--build`：先 `pnpm build` 再 `pnpm preview`（看与线上一致的产物：站内搜索、llms.txt、sitemap 只有构建后才有）
  - `--screenshot /backend/common/pay.html`：打开后截图指定页面
  - `--mobile`：截图用手机宽度（393）

## 端口约定

| 用途 | 命令 | 地址 |
|---|---|---|
| 开发 | `pnpm dev`（会先生成离线图标与 llms.txt） | `http://localhost:4321/`，被占用时 Astro 自动顺延，看启动输出 |
| 构建产物预览 | `pnpm preview --port 4339` | `http://localhost:4339/` |

🔴 本机 4329（框架约定的预览端口）常被别的派生站占着，本站预览与 e2e 一律用 4339（`E2E_PORT=4339 pnpm test:e2e`）。
🔴 地址写 `localhost` 不写 `127.0.0.1`（Astro 只监听 IPv6 的 `::1`）。

## 执行流程

### 第一步：看端口上是不是已经有本站的服务

```bash
netstat -ano | findstr ":4321 :4339"
```

有就复用；是别的站占着就换端口，**不按名字杀进程**，停自己起的服务用 `npx kill-port <端口>`。

### 第二步：起服务（后台运行）

- dev：`pnpm dev`（`run_in_background`），等输出里出现 `Local  http://localhost:<端口>/`
- 构建产物：`pnpm build` 后 `pnpm preview --port 4339`（`run_in_background`）
  - 改过 `src/lib/markdown/` 下的 remark / rehype 插件或 `src/data/vp-icons.json`，先 `pnpm cache:clear` 再构建，否则正文是旧的渲染结果

### 第三步：打开 / 截图（用智码内置浏览器，不开外部浏览器）

1. `browser_open(url, device="desktop")`；要看手机版传 `device="mobile"`
2. 页面切换有约 0.2 秒的淡入淡出，截图前等 1 秒，否则会截到上一页的残影
3. `browser_screenshot`（长页加 `full_page=true`；整页截图时懒加载的图片可能还是空白，要看图就先滚到那里）
4. 给用户看的标签页留着，由用户自己关

### 第四步：输出

```markdown
## 预览已就绪

- **地址**：http://localhost:<端口>/<路径>
- **模式**：dev / 构建产物
- **停止**：npx kill-port <端口>
```

## 注意事项

1. **dev 下没有站内搜索**：Pagefind 索引在 `pnpm build` 末尾生成，dev 里搜索框提示「先 build 再 preview」属正常
2. **冷构建约 3–4 分钟**（511 页），热构建 1 分钟左右；只看样式时用 dev 更快
3. **构建期间别改 src 下的文件**：内容层边构建边读，改了会让产物不一致
