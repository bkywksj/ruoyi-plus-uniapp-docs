# Prettier 配置详解

深入解析项目的 Prettier 配置和格式化规则。

## 🎯 配置文件

### 文件位置

```
plus-ui/
├── .prettierrc.js     # Prettier 配置
└── .prettierignore    # 忽略文件配置
```

### 完整配置

```javascript
// .prettierrc.js
export default {
  printWidth: 150,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'preserve',
  jsxSingleQuote: false,
  bracketSameLine: false,
  trailingComma: 'none',
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  arrowParens: 'always',
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  endOfLine: 'auto'
}
```

## 📋 配置项详解

### printWidth: 150

**单行最大宽度**

```typescript
// ✅ 不超过 150 字符，保持单行
const result = apiService.getData().then(data => processData(data)).catch(err => handleError(err))

// ❌ 超过 150 字符会自动换行
const veryLongFunctionName = anotherLongFunctionName()
  .then(data => processData(data))
  .catch(err => handleError(err))
```

**设置原因**：
- 适合宽屏显示器（1920px+）
- 减少不必要的换行
- 提高代码阅读效率

**标准值比较**：
- Prettier 默认：80
- 项目配置：150
- 推荐范围：80-120

### tabWidth: 2

**缩进宽度为 2 个空格**

```typescript
// ✅ 2 个空格缩进
function example() {
··const name = 'John'  // 2 spaces
··if (true) {
····console.log(name)  // 4 spaces
··}
}
```

**优点**：
- 节省水平空间
- Vue/JavaScript 社区标准
- 嵌套层级更清晰

### useTabs: false

**使用空格而非制表符**

```typescript
// ✅ 空格缩进
function demo() {
  return true
}

// ❌ 制表符缩进（会被转换为空格）
function demo() {
→ return true
}
```

**原因**：
- 不同编辑器显示一致
- 避免混合缩进问题
- 团队协作友好

### semi: false

**不使用分号**

```typescript
// ✅ 不使用分号
const name = 'John'
const age = 30
export default { name, age }

// ❌ 使用分号（格式化后会被移除）
const name = 'John';
const age = 30;
```

**现代 JavaScript 趋势**：
- 依赖 ASI（自动分号插入）
- 代码更简洁
- Vue 3、Vite 官方示例风格

**注意事项**：
- 以 `[` `(` `` ` `` `+` `-` 开头的语句需要前置分号
```typescript
;[1, 2, 3].forEach(n => console.log(n))
;(function() { /* ... */ })()
```

### singleQuote: true

**使用单引号**

```typescript
// ✅ 单引号
const message = 'Hello World'
import { ref } from 'vue'

// ❌ 双引号（格式化后会被替换）
const message = "Hello World"
```

**例外情况**：
- 字符串包含单引号时使用双引号
```typescript
const message = "It's a beautiful day"  // 保留双引号
```

### quoteProps: 'preserve'

**保持对象属性引号原样**

```typescript
// ✅ 保持原样
const obj1 = { name: 'John', age: 30 }
const obj2 = { 'user-name': 'John', 'user-age': 30 }

// 不会统一添加或移除引号
```

**可选值**：
- `'as-needed'` - 仅在需要时加引号
- `'consistent'` - 保持一致性
- `'preserve'` - 保持原样（项目配置）

### jsxSingleQuote: false

**JSX 中使用双引号**

```tsx
// ✅ JSX 属性使用双引号
<Button type="primary" />
<Input placeholder="请输入" />

// ✅ JavaScript 使用单引号
const type = 'primary'
```

**原因**：遵循 HTML 属性习惯。

### bracketSameLine: false

**标签的闭合括号另起一行**

```vue
<!-- ✅ 闭合括号另起一行 -->
<Button
  type="primary"
  size="large"
>
  点击
</Button>

<!-- ❌ 闭合括号与属性同行 -->
<Button
  type="primary"
  size="large">
  点击
</Button>
```

### trailingComma: 'none'

**不使用尾随逗号**

```typescript
// ✅ 不使用尾随逗号
const obj = {
  name: 'John',
  age: 30
}

const arr = [
  1,
  2,
  3
]

// ❌ 尾随逗号（格式化后会被移除）
const obj = {
  name: 'John',
  age: 30,
}
```

**可选值**：
- `'none'` - 不使用（项目配置）
- `'es5'` - ES5 允许的地方使用
- `'all'` - 所有地方使用

**`'all'` 的优点**：
- Git diff 更清晰
- 添加新项不影响上一行

### bracketSpacing: true

**对象括号内添加空格**

```typescript
// ✅ 括号内有空格
const obj = { name: 'John', age: 30 }

// ❌ 括号内无空格（格式化后会添加）
const obj = {name: 'John', age: 30}
```

### arrowParens: 'always'

**箭头函数参数总是使用括号**

```typescript
// ✅ 单参数也使用括号
const double = (x) => x * 2
const greet = (name) => `Hello ${name}`

// ❌ 单参数省略括号（格式化后会添加）
const double = x => x * 2
```

**可选值**：
- `'always'` - 总是使用（项目配置）
- `'avoid'` - 尽量避免

### vueIndentScriptAndStyle: false

**不缩进 Vue 文件的 script 和 style 标签**

```vue
<!-- ✅ 标签内代码不缩进 -->
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>

<!-- ❌ 标签内代码缩进 -->
<script setup lang="ts">
  import { ref } from 'vue'
  const count = ref(0)
</script>
```

**原因**：节省缩进层级。

### endOfLine: 'auto'

**自动识别换行符**

```
LF (\n)    - Linux/Mac
CRLF (\r\n) - Windows
CR (\r)    - 旧 Mac
```

**`'auto'` 行为**：
- 保留文件原有的换行符类型
- 避免跨平台协作时的换行符冲突

**可选值**：
- `'auto'` - 自动（项目配置）
- `'lf'` - 强制 LF
- `'crlf'` - 强制 CRLF
- `'cr'` - 强制 CR

## 🚫 忽略配置

### .prettierignore

```
# 构建输出
/dist/*

# 临时文件
.local
.output.js

# 依赖目录
/node_modules/**

# 特殊文件
**/*.svg          # SVG 文件
**/*.sh           # Shell 脚本

# 静态资源
/public/*
```

**忽略原因**：
- 构建产物无需格式化
- 第三方文件不应修改
- 二进制/特殊格式文件

## 🛠️ 使用命令

### 格式化所有文件

```bash
pnpm prettier
# 等同于
npx prettier --write .
```

### 格式化指定文件

```bash
# 单个文件
npx prettier --write src/views/Home.vue

# 指定目录
npx prettier --write "src/**/*.{js,ts,vue}"

# 指定类型
npx prettier --write "**/*.vue"
```

### 检查格式（不修改）

```bash
# 检查所有文件
npx prettier --check .

# 检查指定文件
npx prettier --check "src/**/*.vue"
```

**输出**：
- 无输出：所有文件格式正确
- 列出文件：需要格式化的文件

### 与其他工具配合

```bash
# 格式化后再 ESLint 检查
npx prettier --write . && npx eslint .

# Git 提交前自动格式化（lint-staged）
```

## 🔧 IDE 集成

### VS Code

#### 安装扩展

- **Prettier - Code formatter**: `esbenp.prettier-vscode`

#### 工作区配置

`.vscode/settings.json`：

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,

  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**效果**：
- 保存文件时自动格式化
- 所有支持的文件类型使用 Prettier

#### 快捷键

- **Windows/Linux**: `Shift + Alt + F`
- **Mac**: `Shift + Option + F`

### WebStorm

1. **Settings** → **Languages & Frameworks** → **JavaScript** → **Prettier**
2. 选择 Prettier package: `node_modules/prettier`
3. 勾选 **On save** 和 **On Reformat Code**
4. 设置 **Run for files**: `{**/*,*}.{js,ts,jsx,tsx,vue,css,scss,json}`

## 🎯 最佳实践

### 保存时自动格式化

**推荐**：开启 IDE 保存时自动格式化，保持代码一致。

### Git Hooks 强制格式化

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{css,scss,json,md}": [
      "prettier --write"
    ]
  }
}
```

### 团队协作

1. **统一配置**：所有成员使用相同的 `.prettierrc.js`
2. **IDE 集成**：强制安装 Prettier 扩展
3. **CI 检查**：PR 提交前运行 `prettier --check`

### 忽略特定代码

```typescript
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
]
```

```vue
<!-- prettier-ignore -->
<div   class="custom-spacing"     id="demo">
  特殊格式
</div>
```

**使用场景**：
- 手动对齐的代码
- 特殊格式的数据结构
- 需要保持原样的代码

## 🔄 与 ESLint 协同

### 规则冲突解决

项目使用 `@vue/eslint-config-prettier/skip-formatting` 避免冲突：

```typescript
// eslint.config.ts
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  // ...
  skipFormatting  // 跳过 ESLint 的格式化规则
)
```

### 工作流程

```
编写代码 → ESLint 检查语法 → Prettier 格式化 → 提交代码
```

### 规则分工

| 工具 | 职责 | 示例 |
|------|------|------|
| **ESLint** | 代码质量 | 未使用变量、类型错误 |
| **Prettier** | 代码风格 | 缩进、引号、换行 |

## 📊 配置对比

### 项目配置 vs 默认配置

| 配置项 | 项目值 | 默认值 | 原因 |
|--------|--------|--------|------|
| printWidth | 150 | 80 | 适合宽屏显示器 |
| semi | false | true | 现代 JS 趋势 |
| singleQuote | true | false | Vue 生态习惯 |
| trailingComma | 'none' | 'all' | 简洁风格 |

### 社区流行配置

**Standard 风格**：
- `semi: false`
- `singleQuote: true`
- `printWidth: 80`

**Airbnb 风格**：
- `semi: true`
- `singleQuote: true`
- `trailingComma: 'all'`

**项目风格**：介于两者之间，更宽松灵活。

## 🐛 常见问题

### 格式化破坏代码

**问题**：格式化后代码运行出错

**排查**：
1. 检查是否忽略了关键空格/换行
2. 使用 `// prettier-ignore` 保护特殊代码
3. 调整相关配置项

### 与 ESLint 冲突

**问题**：ESLint 报格式化错误

**解决**：
1. 确保使用了 `skipFormatting`
2. 检查 ESLint 配置是否有格式化规则
3. 运行顺序：Prettier → ESLint

### IDE 不自动格式化

**检查**：
1. 是否安装 Prettier 扩展
2. 是否设置为默认格式化工具
3. 是否启用保存时格式化
4. 是否在 `.prettierignore` 中

### 格式化慢

**优化**：
1. 减少检查文件数量
2. 使用 `.prettierignore`
3. 升级 Prettier 到最新版本
