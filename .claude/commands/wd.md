# /wd - WD UI 组件文档生成

## 参数
- `$ARGUMENTS`：`<分类/组件名>`

## 执行步骤

1. **读取技能文件** `.claude/skills/component-doc/SKILL.md`
2. **按技能指导执行**：定位源码，分析 Props/Events/Slots，按标准模板撰写
3. **输出组件文档文件路径**

## 示例
- `/wd form/rate` — 表单分类下的评分组件
- `/wd feedback/swipe-action` — 反馈分类下的滑动操作
- `/wd basic/badge` — 基础分类下的徽章组件

## 分类
- `basic` — 基础组件
- `layout` — 布局组件
- `navigation` — 导航组件
- `form` — 表单组件
- `display` — 展示组件
- `feedback` — 反馈组件
