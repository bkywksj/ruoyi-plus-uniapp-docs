---
name: sidebar-manager
description: 管理文档站侧边栏（src/data/sidebar.json）与顶部导航（src/site.config.ts 的 nav）：加条目、删条目、调顺序、查侧栏与文件是否一致。触发词：更新侧边栏、添加到侧栏、添加到导航、调整菜单、侧边栏、侧栏、孤立页
argument-hint: "<add|remove|reorder> <模块> [文档标题]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# 侧边栏管理技能

你是侧边栏管理助手，负责维护文档站的侧边栏与顶部导航。

## 参数说明

- `$ARGUMENTS` 格式：`<动作> <模块> [文档标题]`
  - `add backend 数据加密` — 在后端侧边栏添加「数据加密」条目
  - `add mobile/wd/form 评分` — 在移动端 WD 表单分组下添加「评分」
  - `remove frontend/components 旧组件` — 移除条目
  - `reorder backend/common` — 重新排列某分组的顺序
  - 无参数 — 检查侧边栏与实际文件的一致性

## 数据在哪

| 内容 | 文件 | 说明 |
|---|---|---|
| 四个栏目的侧边栏 | `src/data/sidebar.json` | 顶层键 `backend` / `frontend` / `mobile` / `practices`；条目写**页面 id**，不写网址 |
| 顶部导航 | `src/site.config.ts` 的 `nav` | 十项，`match` 让一组页面共用一个高亮 |
| 文档源文件 | `src/content/docs/<id>.md` | id 就是相对路径去掉 `.md`，如 `backend/common/pay` |

条目三种形态（`src/lib/docs.ts` 读取后转成网址，再交给 `lib/sidebar.ts` 算展开与上下篇）：

```json
{ "text": "支付集成 (pay)", "id": "backend/common/pay" }
{ "text": "分组名", "collapsed": true, "items": [ ... ] }
{ "text": "站外链接", "href": "https://example.com" }
```

- `collapsed` 不写 = 固定分组（不可折叠）；`true` = 默认折叠；`false` = 可折叠但默认展开。当前页所在分组总会自动展开
- 分组本身也可以带 `id`（点分组名打开它的概览页，如「核心模块 (core)」）
- 网址由 id 推出：`backend/index` → `/backend/`，其余 → `/backend/common/pay.html`。**不要在 JSON 里写 `.html` 网址**

## 执行流程

### 第一步：读当前结构

读 `src/data/sidebar.json` 里对应栏目，找到目标分组（分组可以多层嵌套）。

### 第二步：按动作执行

#### add — 添加条目

1. 确认文档文件存在：`ls src/content/docs/<id>.md`，且 frontmatter 有 `title` / `description`（缺了构建会失败）
2. 在目标分组的 `items` 里加 `{ "text": "…", "id": "…" }`，默认放分组末尾，用户指定位置就按位置
3. `text` 一般与页面 title 一致；同组里其他条目带「(英文名)」后缀的照同样格式写
4. 分组名带计数的（如「表单组件 (28个)」）同步改数字

#### remove — 移除条目

1. 搜 `"id": "<id>"` 找到条目，删掉整个对象（注意逗号）
2. **不删文档文件本身**：网址照常可访问，只是不在侧栏里（旧站已收录的网址不能 404）。要让它不被收录，登记到 `src/data/outdated.json`
3. 分组计数同步改

#### reorder — 重排序

1. 列出该分组当前顺序，给用户确认新顺序
2. 按确认的顺序重写该分组的 `items`
3. 顺序决定「上一页 / 下一页」，改完提醒用户

#### 无参数 — 一致性检查

写一个临时脚本（放 `$TEMP/`，不进仓库）做两件事：

1. `sidebar.json` 里每个 `id` 都有对应的 `src/content/docs/<id>.md`（否则构建期 `lib/docs.ts` 生成死链，`pnpm check:seo` 会报）
2. 列出 `src/content/docs/` 下**不在侧栏**里的页面（孤立页），按目录分组，附行数与站内入链数，交给用户决定是否补进侧栏

已登记在 `src/data/outdated.json` 的过期页不算孤立页（它们本来就不进侧栏）。

### 第三步：验证

```bash
node -e "JSON.parse(require('fs').readFileSync('src/data/sidebar.json','utf8'))" && echo JSON 合法
pnpm build && pnpm check:seo        # 侧栏死链、canonical 都在这里抓
node scripts/migrate/manifest.mjs dist .migrate/new-manifest.json && node scripts/migrate/compare-baseline.mjs .migrate/baseline-manifest.json .migrate/new-manifest.json
```

侧栏只影响导航，不影响正文，逐页比对应保持全部通过。`llms.txt` 由侧栏生成（`pnpm llms`，构建时自动跑），侧栏改了它会跟着变，一起提交。

### 第四步：输出结果

```markdown
## 侧边栏已更新

- **动作**：add / remove / reorder / check
- **位置**：<栏目 › 分组>
- **变更**：<具体变更>
- **验证**：build / check:seo / 逐页比对 结果
```

## 注意事项

1. **条目写 id 不写网址** —— 网址形态（`.html`、目录首页 `/backend/`）由 `lib/docs.ts` 统一推导
2. **改顶部导航要谨慎** —— `nav` 十项与旧站一致，页头高亮靠 `match`；除非用户明确要求，不动
3. **dev server 会热更新** —— 改 JSON 后页面自动刷新，不需要重启
4. **同一页可以挂两处**（旧站就有 `mobile/styles/theme` 同时挂在「WD UI 组件库」与「样式系统」下），但新增时尽量避免，会让上下篇顺序变得奇怪
