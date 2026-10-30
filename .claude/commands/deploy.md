---
description: 部署向导：上线前检查 → 本地镜像验证 → Reeve 只读探测 → 配部署目标 → dry-run → 用户确认 → deploy_run → 线上核对
argument-hint: "[服务器别名]"
---

# /deploy - 部署向导

作为部署助手，把站点部署到服务器。**部署模型以 `deployment-guide` 技能为准，执行前先激活它**：
经 Reeve 建「部署目标」（`deploy_upsert_target`），先 dry-run 再执行，历史版本可一键重部署与回滚。
全程走受控工具：**服务器操作走 Reeve、代码推送走 Sigil**；凭据由它们在内部注入，本命令不索取、不展示任何密码 / token。

| 方式（详见 `deployment-guide`） | recipe | 适合 |
|------|--------|------|
| **A. Docker 镜像 + nginx**（默认） | `docker-compose`，`buildSource: image` | 本机有 Docker；镜像里的 nginx 配置随代码版本化 |
| **B. 只传 dist** | `static-openresty`，`buildSource: artifact` | 本机没有 Docker，或只放静态站 |
| **C. 托管平台** | —（不用本命令的 Reeve 部分） | Cloudflare Pages / 对象存储 + CDN，按 `deployment-guide` 走 |

🔴 **不可逆 / 改动型步骤**（`deploy_upsert_target`、`deploy_run`、改线上 Web 配置、签证书、推送）执行前都要一句话告知用户并得到确认。

---

## 第一步：上线前检查（任一不过 → 停下，先修）

```bash
git status --short                          # 必须干净：部署的是已提交的版本
grep -nE "url:|icp:" src/site.config.ts     # url 不能是 example.com；国内服务器 icp 必填
grep -nE "image:|container_name:" docker-compose.yml   # 孵化项目不能还是 next-ai-astro（同机多站会撞名）
pnpm verify                                 # build + check:seo + test 全绿
```

- [ ] `site.url` 是真实生产域名（不带结尾斜杠），且与将要绑定的域名一致——否则全站 canonical / sitemap 都指错
- [ ] `pnpm check:seo` 无错误；上线前建议先跑一次 `/seo-check`（至少 `--local`）
- [ ] 示例数据已替换或裁剪（`/strip-modules`），`llms.txt` 里没有示例残留
- [ ] 外部数据已同步并提交（镜像构建不跑 `pnpm sync`，见 `/sync-data`）
- [ ] 统计配置（`site.config.ts` 的 `analytics`）按需填好——它只在生产构建输出
- [ ] 孵化项目的 `docker-compose.yml` 里 `image` / `container_name` 已是项目标识；还是 `next-ai-astro` 时先改（项目配置，随业务提交 `chore(deploy): 容器与镜像改用项目标识`）

## 第二步：本地镜像验证（方式 A；本机没有 Docker → 跳过，告知用户改用方式 B 或在服务器上首次验证）

```bash
docker compose up -d --build                # 必须带 --build，否则会复用本机旧镜像，验证的不是当前代码
curl -sI http://localhost:8080/             # 期望 200，且有 X-Content-Type-Options / Referrer-Policy
curl -s http://localhost:8080/robots.txt | tail -2
ls dist/_astro/ | head -3                   # 挑一个真实文件名，别 curl 目录本身（/_astro/ 目录请求必然 404）
curl -sI http://localhost:8080/_astro/<上一步的某个文件名>   # 期望 200 + Cache-Control: public, max-age=31536000, immutable
docker compose down
```

- 构建失败 → 先修，不进入下一步
- 镜像只跑 `pnpm build:fast`（类型检查属于提交前验证门，第一步已跑过）
- 本机地址按项目约定写 `localhost`（与 `CLAUDE.md`「端口约定」一致）

## 第三步：推送代码（Sigil，有远程仓库时）🔴

部署目标在**本机**构建（`workdir` = 项目目录），不依赖远程仓库；但部署前把已提交的代码推上去，线上版本才能追溯到远端提交：

```
mcp__sigil__git_push(repo_path=<项目根>, remote="origin", branch=<当前分支>, credential_name=<按远端域名选>)
mcp__sigil__git_commits_list(credential_name=…, repo=<owner/repo>, sha=<分支>, per_page=1)   # 核对远端 = 本地 HEAD
```

- 凭据名拿不准先 `mcp__sigil__list_credentials`
- 🔴 **只走 Sigil**，不跑本地 `git push`；Sigil 报错（锁库 / 缺凭据）→ 停下提示用户处理，不回退
- 还没有远程仓库 → 问用户是否要建；要建就 `mcp__sigil__git_repo_create` 建**私有**仓（用户确认后）；不建也可以继续部署

## 第四步：Reeve 只读探测

```
mcp__reeve__list_servers                               # 拿别名与 os 字段；为空时把返回的 note 原样转达用户
mcp__reeve__system_info(server=<别名>)                 # CPU 架构（amd64 / arm64，决定本机构建的镜像能否直接用）
mcp__reeve__disk_usage(server=<别名>)
mcp__reeve__docker_list_containers(server=<别名>)      # 已有同名容器？旧版本在跑？
mcp__reeve__system_listen_ports(server=<别名>)         # 8080 等宿主端口是否被占用
mcp__reeve__web_status(server=<别名>)                  # 是否已装 OpenResty（反代 + HTTPS 靠它）
mcp__reeve__web_list_sites(server=<别名>)              # 域名是否已有站点 / 反向代理
mcp__reeve__list_deploy_history(target=<部署目标名>)   # 目标已存在时：之前部署过哪些版本
```

把现状整理给用户：服务器、架构、可用磁盘、端口占用、是否已有该站点、选定的方式（A / B）、计划使用的端口与域名。**拿到明确「确认 / 继续」再进入下一步。**
- `docker_list_containers` 报 permission denied → AI 账号不在 docker 组，告诉用户加组，不换命令重试
- 服务器 `os` 为 Windows → 本命令的 Docker 流程不适用，按 `deployment-guide` 另选方式

## 第五步：配置部署目标（`deploy_upsert_target`，只写配置、不执行）

目标已存在且配置不用改 → 跳过本步。否则按 `deployment-guide`「第 2 步」的字段表组装：

```
mcp__reeve__deploy_upsert_target(target={
  name: "<项目标识>-prod", recipe: "docker-compose", servers: ["<别名>"],
  workdir: "<项目绝对路径>", buildSource: "image", buildCommands: ["pnpm verify"],
  image: { name: "<项目标识>" },
  compose: { template: "<见 deployment-guide：container_name=<项目标识>，端口 '127.0.0.1:8080:80'>" },
  domain: "<正式域名>", https: true
})
```

- 方式 B 改 `recipe: "static-openresty"`、`buildSource: "artifact"`、`artifact: { localDir: "dist" }`、`release: { strategy: "symlink", keepReleases: 5 }`；并按 `deployment-guide` 把安全头与缓存规则补进 OpenResty 站点配置（`web_read_conf` → 给用户看 diff → `web_write_conf`）
- 🔴 容器端口只绑服务器的 `127.0.0.1`，外部流量必须经 OpenResty（HTTPS）；**不要**用 `ssh_exec` 手写一串 docker 命令代替部署目标（不进台账、无法重跑和回滚）
- 配 `domain` + `https: true` 时，引擎会自动建反代并签证书：先确认域名已解析到该服务器、80 端口公网可达（云服务器放安全组）、国内服务器已备案

## 第六步：部署预演

```
mcp__reeve__deploy_dry_run(target=<部署目标名>)       # 只读：列出会跑的阶段、命令、写入的文件
```

把 dry-run 输出的计划完整展示给用户：会执行哪些命令、影响哪些容器 / 端口 / 站点配置。

## 第七步：用户确认 → 正式部署 🔴

**拿到用户明确的「确认 / 继续」后**才执行：

```
mcp__reeve__deploy_run(target=<部署目标名>, note="发布 <提交短 hash>：<一句话变更>")
```

- 每条远程命令照常过该服务器的 AI 策略（档位 / 审批 / 危险黑名单）
- 进入审批队列（`[approval]`）→ 请用户在 Reeve 里放行，不重试、不追问
- 被策略拒绝（`[denied]` / `[blocked]`）→ 停下说明，不换等价写法绕过
- 🔴 回滚只能由用户在 Reeve 界面操作；失败时给出日志与判断，请用户决定是否回滚（`list_deploy_history` 可查可回到的版本）

没走部署目标、需要单独建站时（少见）：`web_create_proxy(server, domain, upstream="127.0.0.1:<宿主端口>")` → `web_issue_ssl(server, domain, email=<向用户要的证书提醒邮箱>)`。这里的 `127.0.0.1` 是服务器上的回环地址，与容器端口绑定一致，不要改成 localhost。

## 第八步：线上核对

```
mcp__reeve__docker_list_containers(server=<别名>)      # 方式 A：容器运行中、健康检查通过
mcp__reeve__port_check(server=<别名>, port=<宿主端口>)
mcp__reeve__tail_log(server=<别名>, path=<反向代理错误日志的绝对路径>, lines=100)   # 路径以 web_read_conf 里的配置为准
```

再从外部核对（WebFetch、用户浏览器，或经 Reeve 在服务器上 curl，逐项对照 `deployment-guide`「第 5 步」）：
- [ ] `https://<域名>/` 200，页面正常，深色模式与移动端正常
- [ ] `https://<域名>/robots.txt` 的 Sitemap 行是正式域名
- [ ] `https://<域名>/sitemap-index.xml`、`/llms.txt` 可访问，`llms.txt` 的 Content-Type 带 `charset=utf-8`、中文不乱码
- [ ] 任一详情页的 canonical 指向正式域名的本页地址
- [ ] 响应头包含 `X-Content-Type-Options`、`Referrer-Policy`（安全头片段生效）；HTTPS 正常后再按 `deployment-guide` 加 HSTS
- [ ] `http://<域名>/` 301 到 https；`/not-exist/` 返回站点 404 页

## 第九步：输出部署报告

```markdown
## 🚀 部署报告

- 版本：{分支}@{短 hash}（远端已核对 / 无远程仓库）
- 服务器：{别名}；方式：{A 镜像 / B 静态}；部署目标：{名称}
- 容器 / 目录：{名称}；端口：{宿主端口} → 80
- 域名：https://{域名}（证书：{已签发 / 沿用}）
- 核对：首页 ✅ robots ✅ sitemap ✅ llms.txt ✅ canonical ✅ 安全头 ✅

### 上线后待办
- [ ] Bing 站长工具、百度搜索资源平台提交 sitemap（需要你的账号，我只提供步骤）
- [ ] 数据需要定期更新时：`/sync-data` → 提交 → 在 Reeve 部署页重跑目标（或 `deploy_run`）
```

## 注意事项

- 不在对话里展示或推断任何密码、token；Reeve 输出里的 `[REDACTED:xxx]` 是正常脱敏
- 不裸 `ssh` 登录服务器操作；不按名字杀进程
- 部署失败时如实报告错误原文与判断，不粉饰

## 与其他命令的关系

| 命令 / 技能 | 关系 |
|------------|------|
| `deployment-guide` 技能 | 部署模型、部署目标字段、HTTPS / HSTS、上线后验证与回滚的完整说明（本命令以它为准） |
| `/seo-check` | 部署前的 SEO / GEO 验收 |
| `/sync-data` | 数据更新后需要重新部署 |
| `git-workflow` 技能 | Sigil 推送与凭据选择细节 |
