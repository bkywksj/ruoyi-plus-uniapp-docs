---
name: deployment-guide
description: 把静态站部署上线：经 Reeve 部署 Docker 镜像或只传 dist，HTTPS / HSTS 在前置 OpenResty 终结；备选 Cloudflare Pages、国内对象存储 + CDN；含上线核对与重新发布。触发词：部署、上线、发布、Docker、nginx、CDN、Cloudflare Pages、Reeve、域名、HTTPS、备案、静态托管
---

# 部署上线

## 何时使用

- 第一次把站点部署上线、绑定域名、配 HTTPS / HSTS
- 用 Docker / nginx 托管静态站，或经 Reeve 部署到自己的服务器
- 部署到 Cloudflare Pages 或国内 CDN、处理 ICP 备案
- 数据同步后重新发布、回滚到上一版

## 部署形态：纯静态，三种托管方式

`pnpm build` 的产物 `dist/` 就是完整站点（HTML + 带 hash 的静态资源），不需要 Node 运行时。

| 方式 | 适合 | 优点 | 代价 |
|------|------|------|------|
| **A. Docker 镜像 + nginx**（默认） | 自有服务器；与其他 Docker 服务同机 | 镜像里的 nginx 配置（安全头、缓存、gzip）随代码版本化，环境可复现 | 需要构建镜像；前面还要一层 OpenResty 做 HTTPS |
| **B. static-openresty**（只传 dist） | 自有服务器、只放静态站 | 最轻：本机构建、只上传 dist，符号链接切版本 | 安全头、缓存、gzip、404 规则要写进 OpenResty 站点配置 |
| **C. 托管平台** | 不想维护服务器 | Cloudflare Pages 免运维；国内对象存储 + CDN 访问快 | 国内 CDN 需 ICP 备案；CF Pages 国内访问速度一般 |

框架自带：
- `Dockerfile`：Node 22 构建（只跑 `pnpm build:fast`，类型检查属于提交前验证门）→ `nginx:1.27-alpine` 托管
- `deploy/nginx/default.conf`、`deploy/nginx/security-headers.conf`：location 分级缓存、每个 location 都 include 安全头、gzip、`error_page 404`
- `docker-compose.yml`：宿主端口只绑 `127.0.0.1:8080`，`mem_limit: 128m`。孵化出的项目要把 `image` / `container_name` 改成项目标识，否则同机多站撞名

> 🔴 所有服务器操作经 **Reeve** MCP，不在本地 shell 里裸 `ssh`。流程铁律：**先只读探测 → 把计划讲给用户 → 用户确认 → 才执行**。
> 🔴 代码推送只走 Sigil（见 `git-workflow`）；服务器上不做 git 拉取 / 推送。

---

## 第 0 步：上线前检查（任一不过不部署）

| 检查 | 怎么查 |
|------|-------|
| 验证门全绿 | `pnpm verify`（build + check:seo + test） |
| 正式域名已配置 | `src/site.config.ts` 的 `url` 不再是 `https://example.com`（check-seo 会对占位域名给警告） |
| 备案号 | 国内服务器 / 国内 CDN：`site.config.ts` 的 `icp` 已填，页脚会显示 |
| 数据已同步并提交 | `pnpm sync` 后 `src/data/*.json` 已提交（`chore(data): …`）；**镜像构建不跑数据同步**（保证同一提交构建出同一站点） |
| 示例内容已清理 | 示例作品、示例文章、框架品牌 favicon / og 图已替换（见 `module-strip` 的 examples 预设） |
| 统计已配置（可选） | `site.config.ts` 的 `analytics`，只在生产构建输出 |
| 工作区干净 | `git status` 无未提交改动，部署版本可追溯到提交 |

本机有 Docker 时，先在本机验证镜像能构建、能访问：

```bash
docker compose up -d --build                # 一定带 --build，否则会复用旧的同名镜像
curl -sI http://localhost:8080/             # 200，响应头有安全头
docker compose down
```

## 第 1 步：只读探测服务器（Reeve）

```
list_servers                     → 选服务器别名，看 os 字段（Linux / Windows 语法不同；为空时把返回的 note 原样转达）
system_info(server)              → CPU 架构（amd64 / arm64，决定镜像能否直接用）、内存、系统版本
system_listen_ports(server)      → 80 / 443 / 8080 是否已被占用
docker_list_containers(server)   → 是否已有同名容器、Docker 是否可用（permission denied = AI 账号不在 docker 组，告诉用户加组）
web_status(server)               → 是否已装 OpenResty（反代 + HTTPS 靠它）
web_list_sites(server)           → 域名是否已有站点
disk_usage(server)               → 镜像与多版本 release 的空间
```

把探测结果 + 选定方式 + 将要执行的步骤整理给用户，**拿到明确「确认 / 继续」再进入下一步**。

## 第 2 步：配置部署目标（`deploy_upsert_target`，只写配置不执行）

部署目标落在 Reeve「部署」页，可一键重部署、有部署历史、可回滚。**不要用 `ssh_exec` 手写一串 docker 命令代替**（产物不进台账，无法重跑和回滚）。

- 目标可以由用户在 Reeve 界面创建；也可以在用户确认了第 1 步的计划之后，由 AI 调 `deploy_upsert_target` 写入（它只写配置，不执行任何部署）
- 目标已存在时先读现状（`list_deploy_history(target)`），改目标前把改动点讲给用户
- `deploy_run` 只能触发已存在的目标，不能在调用时改配方 / 服务器

### 方式 A：Docker（recipe `docker-compose`）

| 字段 | 取值 | 说明 |
|------|------|------|
| `name` | `<项目标识>-prod` | 目标唯一名 |
| `recipe` | `docker-compose` | |
| `servers` | `[服务器别名]` | 只用别名，不写 IP |
| `workdir` | 项目绝对路径 | 本机构建目录 |
| `buildSource` | `image` | 本机 `docker build` 后传镜像；**本机没有 Docker 时改用方式 B** |
| `buildCommands` | `["pnpm verify"]` | 先过验证门再打镜像 |
| `image` | `{ name: '<项目标识>', versionStrategy: … }` | 每次发布一个版本号，便于回滚 |
| `compose.template` | 见下 | |
| `domain` + `https: true` | 正式域名 | 引擎自动建反代 + 签证书 |

compose 模板要点（端口绑定与仓库里的 `docker-compose.yml` 一致，区别是镜像名 / 容器名换成项目标识、镜像带版本号）：

```yaml
services:
  web:
    image: <项目标识>:<版本>
    container_name: <项目标识>            # 应用唯一标识，不加 -app 后缀
    ports:
      - '127.0.0.1:8080:80'               # 🔴 只绑本机回环：外部流量必须经 OpenResty（HTTPS），不能绕过直连
    restart: unless-stopped
    mem_limit: 128m
```

> 纯静态站没有数据库 / Redis / 密钥，`compose.db`、`compose.redis`、`compose.secrets` 都不用配。
> 8080 被占用时换一个宿主端口，并同步到反代 upstream。

### 方式 B：静态站（recipe `static-openresty`）

| 字段 | 取值 |
|------|------|
| `recipe` | `static-openresty` |
| `buildSource` | `artifact` |
| `buildCommands` | `["pnpm verify"]` |
| `artifact.localDir` | `dist` |
| `release.strategy` | `symlink`（每个版本一个目录，`current` 软链切换，回滚只改链接） |
| `release.keepReleases` | 保留最近几个版本，如 5 |
| `domain` + `https: true` | 正式域名 |

方式 B 没有镜像里的 nginx 配置，**必须把 `deploy/nginx/default.conf` 的规则补进 OpenResty 站点配置**：
`web_read_conf` 读出站点配置原文 → 按下面的要点改写 → 把 diff 给用户看、确认后 `web_write_conf` 写回（整份覆盖，`nginx -t` 失败会自动回滚）。

| 要点 | 写法 | 为什么 |
|------|------|-------|
| 字符集 | server 层 `charset utf-8;` | 让 `text/plain`（含 `llms.txt`）和 HTML 带上 `charset=utf-8`。`default_type` 只在扩展名查不到类型时生效，`.txt` 早被 mime.types 映射成 `text/plain`，写 `default_type` 没用 |
| 缓存分级 | `location /_astro/` 加 `Cache-Control "public, max-age=31536000, immutable"`；其余 `no-cache`；`llms.txt` 一小时 | 带 hash 的产物强缓存，HTML 发版立即生效 |
| 安全头 | 把 `security-headers.conf` 的四条 `add_header … always` 写进**每一个**自己带 `add_header` 的 location | location 里只要写了 `add_header`，就不再继承 server 层的 `add_header` |
| 目录首页 | `try_files $uri $uri/ =404;` | `/works/` 对应 `works/index.html` |
| 404 | `error_page 404 /404.html;` | 返回站点自己的 404 页 |
| gzip | `gzip on; gzip_vary on;`，`gzip_types` 含 `text/xml`（sitemap）、`text/css`、`application/javascript`、`application/json`、`image/svg+xml` | nginx 默认 mime.types 里 sitemap 是 `text/xml`；`gzip_vary` 防止 CDN 把压缩版发给不支持的客户端 |

## 第 3 步：预览 → 确认 → 执行

```
deploy_dry_run(target)            → 只读：会跑哪些阶段、哪些命令、写哪些文件
（把计划讲给用户，等确认）
deploy_run(target, note="发布 <提交短 hash>：<一句话变更>")      # 镜像版本化目标可再传 version
```

- 每条远程命令仍受该服务器的 AI 策略档位约束；进入审批（`[approval]`）→ 请用户在 Reeve 里放行，不重试；被拦截（`[denied]` / `[blocked]`）→ 停下说明，**不要换等价写法绕过**
- 首次发布且 `domain + https` 已配：引擎会建反代并签 Let's Encrypt 证书，要求域名已解析到服务器、80 端口公网可达（云厂商安全组放行）

## 第 4 步：HTTPS 与 HSTS

容器内 nginx 只监听 HTTP，**HTTPS 在前置 OpenResty 终结**，所以 HSTS 也只能加在 OpenResty：

```nginx
# OpenResty 站点配置的 server { listen 443 ssl; … } 内
add_header Strict-Transport-Security "max-age=31536000" always;
```

- 先确认全站（含所有子域）HTTPS 都正常，再加；`includeSubDomains`、`preload` 会影响整个域名族，不确定就不加
- 证书由 Reeve 接管续期（`web_issue_ssl` 签发的证书在「证书」页）；不要再手动 certbot
- 没走部署目标、单独建站时：`web_create_proxy(server, domain, upstream="127.0.0.1:8080")` → `web_issue_ssl(server, domain, email)`（证书提醒邮箱向用户要，不要自己填）

## 第 5 步：上线后验证

```bash
# 本机 curl 或 WebFetch（只读）
curl -sI https://<域名>/                    # 200；有 X-Content-Type-Options / Referrer-Policy / X-Frame-Options / Permissions-Policy / HSTS
curl -sI https://<域名>/_astro/<某文件>.js  # Cache-Control: public, max-age=31536000, immutable（文件名以 dist/_astro 为准）
curl -sI https://<域名>/works/              # Cache-Control: no-cache
curl -s  https://<域名>/robots.txt | tail -2 # Sitemap 行是正式域名
curl -sI https://<域名>/llms.txt            # Content-Type 含 charset=utf-8
curl -sI https://<域名>/not-exist/          # 404，返回的是站点 404 页
curl -sI http://<域名>/                     # 301 → https
```

再用智码内置浏览器打开首页、列表页、详情页各截一张图确认渲染正常（见 `e2e-test`）；
首次上线后到搜索引擎站长平台提交 `sitemap-index.xml`（见 `seo-meta`、`geo-optimization`）。

## 回滚

- 方式 A / B 的部署目标都保留历史版本；**回滚由用户在 Reeve 界面操作**（AI 不触发回滚）
- 需要回滚时：说明哪个版本有问题、建议回到哪个版本（`list_deploy_history` 可查），请用户在界面点回滚
- 修复后正常走一次新的发布，不要在服务器上直接改文件

## 数据更新后的重新发布

内容来自外部接口（B 站、GitHub 等）时，更新流程是：

```
本机运行 pnpm sync（见 data-sync，注意海外 IP 易触发风控）
  → 检查 git diff src/data/ 是否合理
  → 提交（chore(data): 同步 <数据源> 数据）
  → 需要推送时经 Sigil git_push
  → deploy_run 发布
```

- 定时更新：在**本机**用 `/schedule` 或系统计划任务跑「同步 → 检查 → 提交 → 发布」这条链路；同步失败时 `scripts/sync/run.mjs` 会保留上一版数据并返回非零退出码，**失败就不要继续发布**
- 🔴 不要在服务器 cron 里跑 `git commit` / `git push`：服务器上没有 Sigil，只能把明文凭据落在服务器上。方式 A / B 都是本机构建，服务器根本不需要 git
- 数据没变化时 `pnpm sync` 不改文件，不需要重新发布

## 方式 C：托管平台

### Cloudflare Pages

- 在 Cloudflare 控制台连接 Git 仓库（由用户操作授权，不在对话里传 token）
- 构建命令 `pnpm build`，输出目录 `dist`，环境变量 `NODE_VERSION=22`；构建日志里 pnpm 版本与 `packageManager`（pnpm 10）不符时，再按 Cloudflare 文档设置 pnpm 版本
- 接了 Pagefind 站内搜索的，索引必须在 `pnpm build` 里生成（见 site-search 技能接入步骤 1）；托管平台不会跑别的脚本，上线后请求一次 `/pagefind/pagefind-entry.json` 确认是 200
- 平台上**不跑数据同步**：数据必须已提交在仓库里
- 静态资源缓存与安全头：在 `public/_headers` 里写（Pages 约定文件，新建），规则同 `deploy/nginx/`

### 腾讯云 EdgeOne Pages（文档站在用）

两种方式，按站点规模选：

| 方式 | 适用 | 做法 |
|---|---|---|
| 连 Git，推送即构建 | 几十页以内（知识库、officia、tauri-docs、aibid-docs） | 控制台连仓库，构建预设 Astro、输出 `dist`；推送（Sigil）后约 1.5–2 分钟生效。从 VitePress 切过来的站，构建预设要用户在后台改成 Astro |
| 本机构建 + CLI 上传 | 几百页（ruoyi.plus 511 页） | 云端构建机 4 核 6 GB，构建被杀（exit 137，限堆、降并发三次实测都不行：rolldown 原生内存约 2 GB 不受堆限制）→ 本机 `pnpm verify` 后 `pnpm run deploy`（= `edgeone pages deploy -n <项目> dist`；🔴 不能写 `pnpm deploy`，那是 pnpm 内置命令）；控制台的 Git 自动部署关掉，否则每次推送收一封失败通知 |

- 上传的就是验证过的那份 `dist/`：验证之后别再单独 `astro build`（不跑 pagefind，站内搜索会坏）
- 确认生效：`curl -sI https://<域名>/ | grep -i last-modified`，时间在推送 / 上传之后；改动面大时旧站清单 + sitemap 全部网址逐条请求，非 200 应为 0
- 上线后通知搜索引擎：docs 模块的 `pnpm indexnow --since <上次上线的提交>`（docs-site 技能）

### 国内对象存储 + CDN

- 对象存储开启静态网站托管：默认首页 `index.html`、错误页 `404.html`，并开启「子目录首页」（`/works/` → `/works/index.html`）
- 上传 `dist/` 全部内容；CDN 缓存规则按上文「缓存分级」配置
- **绑定自定义域名的国内 CDN 必须完成 ICP 备案**
- 上传凭据走 Sigil 管理的能力，不把 AccessKey 写进仓库或对话

## 常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| `/works/` 正常、`/works` 404 | 托管平台没开「目录自动补 index.html / 补斜杠」 | nginx 用 `try_files $uri $uri/`；对象存储开启子目录首页；canonical 统一指向带斜杠地址 |
| 跳转后地址变成 `http://域名:8080/…` | nginx 用绝对地址补斜杠 | `absolute_redirect off;`（框架 default.conf 已配） |
| 安全头时有时无 | location 里写了 `add_header` 导致不继承 server 层 | 每个 location `include` 安全头片段（见 `security-guard`） |
| `llms.txt` 中文乱码 | 没有 `charset utf-8` | server 层加 `charset utf-8;`（见方式 B 要点） |
| 发版后用户看到旧页面 | HTML 被 CDN 长缓存 | HTML 设 `no-cache`；必要时在 CDN 刷新目录 |
| 签证书失败 | 域名未解析到本机 / 80 端口不通 | 核对 DNS 与安全组，再 `web_issue_ssl` |
| 镜像在服务器上起不来 | 本机构建架构与服务器不一致（arm64 / amd64） | `system_info` 看架构，构建时指定平台，或改用方式 B |
| 外网访问 `服务器:8080` 连不上 | 容器端口只绑 127.0.0.1（有意为之） | 经 OpenResty 反代访问域名 |

## 检查清单

- [ ] 第 0 步全部通过（verify、正式域名、备案号、数据已提交）
- [ ] 只读探测结果与部署计划已给用户，用户已确认
- [ ] 用部署目标（`deploy_upsert_target` / Reeve 界面）而不是手写 ssh 命令
- [ ] 容器端口只绑 `127.0.0.1`，外部流量经 OpenResty HTTPS；compose 的镜像名 / 容器名是项目标识
- [ ] HSTS 加在 HTTPS 终结处，全站 HTTPS 正常后再加
- [ ] 上线后逐项 curl 验证状态码、安全头、缓存头、robots、llms.txt、404
- [ ] 部署备注写了提交 hash，便于回滚定位

## 与相邻技能的边界

| 技能 | 分工 |
|------|------|
| `security-guard` | 安全头、CSP 的具体内容 |
| `performance-doctor` | 缓存分级与压缩对性能的影响 |
| `data-sync` | 数据怎么拉、失败怎么处理 |
| `env-config` | 构建期环境变量 |
| `git-workflow` | Sigil 推送 |
| `delivery-sync` | 交付给客户的源码副本（不是部署） |
