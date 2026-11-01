---
name: link-checker
description: 全站死链与失效锚点检测、修复：页面级死链用 pnpm check:seo（查构建产物里每个站内链接的目标页），锚点用 scripts/check-anchors.mjs（目标页上有没有这个 id），侧栏条目指向的页面是否存在。触发词：检查链接、死链、链接检查、锚点失效、broken link
argument-hint: "[目录路径] [--fix]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# 死链检测技能

你是链接检查助手，负责找出文档站里坏掉的站内链接并给出修复。

## 参数说明

- 无参数：全站
- `backend/` 等：只修这个目录里的源文件（检查仍是全站，报告按目录过滤）
- `--fix`：自动修复能确定的死链

## 为什么查构建产物，不查 md

站内链接要经过三道转换才变成最终地址：remark 插件给 `/backend/x` 补 `.html`、相对链接 `./changelog` 补 `.html`、目录链接 `/backend/` 保留斜杠；
锚点 id 由 rehype 插件按 VitePress 规则生成（中文原样、标点去掉、重名加 `-1`）。在 md 里推算这些规则容易和实际对不上，所以**先构建，再查产物**。

## 执行流程

### 第一步：构建

```bash
pnpm build
```

### 第二步：页面级死链

```bash
pnpm check:seo
```

报 `站内死链：/xxx 没有对应页面 ← 出现在哪些页` 的就是死链（侧栏 `sidebar.json` 里写错的 id 也在这里报出来）。

### 第三步：锚点

```bash
node scripts/check-anchors.mjs          # 失效时退出码 1
node scripts/check-anchors.mjs --json   # 结构化输出，便于批量修
```

只看正文里的链接；页头页脚、章节条是模板生成的，不在范围内。

### 第四步：定位到源文件

产物地址 → 源文件：`/backend/common/pay.html` → `src/content/docs/backend/common/pay.md`；`/backend/` → `src/content/docs/backend/index.md`。
在源文件里 `grep -n` 链接原文，得到行号。

### 第五步：输出报告

```markdown
## 链接检查报告

- 页面级死链：N 个
- 失效锚点：N 个

| 源文件 | 行号 | 链接 | 问题 | 建议 |
|---|---|---|---|---|
| `src/content/docs/backend/xxx.md` | 42 | `/backend/old.html` | 页面不存在 | 改为 `/backend/new.html`（同名文件新位置） |
```

### 第六步：修复（--fix）

1. **页面挪了位置**：按文件名在 `src/content/docs/` 下找新位置，替换链接
2. **锚点变了**：读目标页的实际 id（产物里 `<h2 id="…">`），换成最接近的那个
3. **确定不了的**：列给用户，不猜
4. 修完重跑第一到第三步；正文改了要登记到 `scripts/migrate/known-diffs.json` 的 `edited`（迁移比对才会接受这页的变化），提交用 `fix(docs): …`

## 注意事项

1. **旧网址不能变**：死链要改的是「链接」，不是去改目标页的网址
2. **只查站内**：站外链接（http / https 开头）不检查，容易超时、误报
3. **大量死链分批修**，每批跑一次逐页比对
