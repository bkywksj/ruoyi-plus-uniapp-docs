---
name: version-migrate
description: 框架版本升级时的文档迁移辅助。当用户说"版本升级"、"迁移文档"、"升级指南"、"版本变更"时使用此技能。
argument-hint: "<依赖名> <旧版本> <新版本>"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
---

# 版本迁移技能

你是版本迁移助手，当框架依赖升级时，帮助识别受影响的文档并辅助更新。

## 参数说明

- `$ARGUMENTS` 格式：`<依赖名> <旧版本> <新版本>`
  - 示例：`spring-boot 3.5.6 3.6.0`
  - 示例：`mybatis-plus 3.5.14 3.5.16`
  - 示例：`element-plus 2.9.8 2.10.0`
  - 示例：`sa-token 1.44.0 1.45.0`
  - 无参数：扫描源码 pom.xml/package.json 变更，自动检测升级

## 核心配置

- **文档项目路径**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-docs`
- **源码项目路径**: `D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow`

## 执行流程

### 第一步：确定变更的依赖

如果有参数，直接使用。如果无参数：

```bash
# 检查 pom.xml 中的版本变更
cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow" && git diff HEAD~5..HEAD -- "**/pom.xml" | grep -E "^[+-].*<version>"

# 检查 package.json 中的版本变更
cd "D:/desktop/my/framework/ruoyi-plus-uniapp/ruoyi-plus-uniapp-workflow" && git diff HEAD~5..HEAD -- "**/package.json" | grep -E "^[+-].*\"version\""
```

### 第二步：搜索受影响文档

在文档中搜索与该依赖相关的所有引用：

1. **版本号引用** — 直接提到旧版本号的文档
2. **API 引用** — 使用了该依赖 API 的文档
3. **配置引用** — 提到了该依赖配置项的文档
4. **概述性引用** — 技术栈介绍中提到的文档

### 第三步：查阅升级变更

尝试获取依赖的升级说明：
1. 读取源码中的 CHANGELOG（如有）
2. 标记 Breaking Changes

### 第四步：生成迁移清单

```markdown
## 版本迁移分析

**依赖**: <依赖名>
**版本变更**: <旧版本> → <新版本>
**变更类型**: <主版本|次版本|补丁>

### Breaking Changes

- [ ] 变更 1：描述
- [ ] 变更 2：描述

### 受影响文档 (N个)

#### 必须更新

| 文件 | 影响点 | 操作 |
|------|--------|------|
| `docs/backend/xxx.md` | 版本号引用 (行 42) | 更新版本号 |
| `docs/backend/yyy.md` | API 签名变更 | 更新 API 表 |

#### 建议检查

| 文件 | 原因 |
|------|------|
| `docs/practices/xxx.md` | 提到了相关配置 |

### 迁移步骤

1. [ ] 更新所有版本号引用
2. [ ] 检查 Breaking Changes 对应文档
3. [ ] 更新 API 表格
4. [ ] 更新配置示例
5. [ ] 运行链接检查 (`/check-links`)
```

### 第五步：执行迁移（用户确认后）

按迁移清单逐项更新：
1. 批量替换版本号
2. 逐个检查 API 变更
3. 更新配置示例

## 注意事项

1. **不自动执行更新** — 先输出分析清单，等用户确认后再执行
2. **版本号替换要精准** — 避免误替换其他依赖的相同版本号
3. **Breaking Changes 优先** — 可能导致文档不准确的变更优先处理
4. **更新 changelog** — 迁移完成后建议用 `/changelog` 生成记录
