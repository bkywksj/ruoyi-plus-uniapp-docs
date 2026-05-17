# Prettier 配置详解

深入解析项目的 Prettier 配置和格式化规则。

## 🎯 配置文件

### 文件位置

```text
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

```text
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

```text
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

```text
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

## 常见问题

### 1. 格式化后代码功能异常或语法错误

**问题描述**

执行 Prettier 格式化后，代码出现语法错误或运行时异常，常见于特定语法结构被错误转换，或自动分号插入（ASI）机制导致的意外行为。

**问题原因**

- 无分号配置下，特定语法前缀未添加保护分号
- 正则表达式或模板字符串被错误解析
- 多行表达式的换行位置不当
- Parser 选择错误导致语法误解析
- 插件版本不兼容导致解析异常

**解决方案**

```typescript
// ❌ 错误示例：无分号模式下的常见陷阱
const a = 1
[1, 2, 3].forEach(n => console.log(n))  // 错误：被解析为 a[1, 2, 3]

const b = 2
(function() { console.log('IIFE') })()  // 错误：被解析为 2(function...)

const c = 3
`template string`  // 错误：被解析为 3`template...`

// ✅ 正确示例：添加保护分号
const a = 1
;[1, 2, 3].forEach(n => console.log(n))  // 正确

const b = 2
;(function() { console.log('IIFE') })()  // 正确

const c = 3
;`template string`  // 正确

// 或者使用 void 运算符避免问题
const d = 4
void [1, 2, 3].forEach(n => console.log(n))
```

**正则表达式保护**

```typescript
// ❌ 可能被错误格式化的正则
const regex = /\s+/g
/test/.test('hello')  // 可能被误解析

// ✅ 使用变量保存正则
const testRegex = /test/
const hasTest = testRegex.test('hello')

// ✅ 或使用括号保护
;(/test/).test('hello')
```

**Parser 配置修复**

```javascript
// .prettierrc.js
export default {
  // 确保 Vue 文件使用正确的 parser
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue'
      }
    },
    {
      files: '*.ts',
      options: {
        parser: 'typescript'
      }
    },
    {
      files: '*.tsx',
      options: {
        parser: 'typescript'
      }
    },
    {
      files: '*.json',
      options: {
        parser: 'json'
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'preserve'
      }
    }
  ]
}
```

**ASI 问题自动检测工具**

```typescript
// 创建自定义 ESLint 规则配合 Prettier
// eslint.config.ts
export default defineConfigWithVueTs(
  {
    rules: {
      // 检测需要保护分号的情况
      'no-unexpected-multiline': 'error'
    }
  }
)

// 或使用 TypeScript 编译器检查
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strict": true
    // 编译时会发现大部分 ASI 问题
  }
}
```

---

### 2. Prettier 与 ESLint 规则冲突导致无限循环

**问题描述**

保存文件时，Prettier 和 ESLint 轮流修改代码，导致文件不断变化，或者两个工具报告相互矛盾的错误，无法通过任一工具的检查。

**问题原因**

- ESLint 中存在与 Prettier 冲突的格式化规则
- 未正确配置 `eslint-config-prettier` 或 `skipFormatting`
- 运行顺序错误（应该 Prettier 先于 ESLint）
- 多个格式化工具同时启用
- IDE 配置了多个格式化器

**解决方案**

```typescript
// eslint.config.ts - 正确的 ESLint 配置
import eslint from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/node_modules/**']
  },
  eslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  // 关键：skipFormatting 必须放在最后，覆盖之前的格式化规则
  skipFormatting
)
```

**手动禁用冲突规则**

```typescript
// 如果不使用 skipFormatting，手动禁用冲突规则
export default defineConfigWithVueTs(
  // ... 其他配置
  {
    rules: {
      // 禁用与 Prettier 冲突的 ESLint 规则
      'indent': 'off',
      'semi': 'off',
      'quotes': 'off',
      'comma-dangle': 'off',
      'max-len': 'off',
      'arrow-parens': 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'space-before-function-paren': 'off',
      'keyword-spacing': 'off',
      'space-infix-ops': 'off',
      'no-multi-spaces': 'off',
      'no-trailing-spaces': 'off',
      'eol-last': 'off',
      'no-multiple-empty-lines': 'off',

      // Vue 相关格式化规则也需要禁用
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off'
    }
  }
)
```

**VS Code 配置修复**

```json
// .vscode/settings.json
{
  // 只使用 Prettier 作为格式化工具
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,

  // 禁用 ESLint 的格式化功能
  "eslint.format.enable": false,

  // 确保 ESLint 只做代码检查
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // 不同文件类型的格式化器设置
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // 禁用其他可能冲突的格式化扩展
  "vetur.format.enable": false,
  "typescript.format.enable": false,
  "javascript.format.enable": false
}
```

**lint-staged 正确配置**

```json
// package.json
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

```javascript
// lint-staged.config.js - 更精细的控制
export default {
  '*.{js,ts,vue}': (filenames) => [
    // 先格式化
    `prettier --write ${filenames.join(' ')}`,
    // 再 lint（不包含格式化规则）
    `eslint --fix ${filenames.join(' ')}`
  ],
  '*.{css,scss}': ['prettier --write'],
  '*.json': ['prettier --write'],
  '*.md': ['prettier --write --prose-wrap preserve']
}
```

---

### 3. 格式化不生效或配置不被识别

**问题描述**

执行 Prettier 命令后文件没有变化，或者配置文件中的设置没有生效，代码仍然按照默认配置格式化。

**问题原因**

- 配置文件名称或格式错误
- 配置文件位置不在项目根目录
- 配置语法错误导致加载失败
- 文件被 `.prettierignore` 忽略
- 缓存问题导致配置未更新
- 编辑器使用了自己的配置而非项目配置

**解决方案**

```bash
# 检查 Prettier 是否识别到配置文件
npx prettier --find-config-path src/main.ts
# 应该输出配置文件路径，如：.prettierrc.js

# 查看当前使用的配置
npx prettier --config .prettierrc.js --file-info src/main.ts

# 强制使用指定配置文件
npx prettier --config .prettierrc.js --write src/**/*.ts

# 清除缓存后重新格式化
npx prettier --write --cache false .
```

**配置文件格式验证**

```javascript
// .prettierrc.js - ESM 格式（推荐）
export default {
  printWidth: 150,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true
  // 注意：不要有尾随逗号如果 JSON 不支持
}

// .prettierrc.cjs - CommonJS 格式
module.exports = {
  printWidth: 150,
  tabWidth: 2
}

// .prettierrc.json - JSON 格式
{
  "printWidth": 150,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true
}

// .prettierrc.yaml - YAML 格式
printWidth: 150
tabWidth: 2
useTabs: false
semi: false
singleQuote: true
```

**配置加载调试**

```javascript
// 创建调试脚本 scripts/prettier-debug.js
import prettier from 'prettier'
import { resolveConfig, resolveConfigFile } from 'prettier'

async function debug() {
  const testFile = 'src/main.ts'

  // 查找配置文件
  const configFile = await resolveConfigFile(testFile)
  console.log('配置文件路径:', configFile)

  // 读取配置
  const config = await resolveConfig(testFile)
  console.log('解析后的配置:', JSON.stringify(config, null, 2))

  // 获取文件信息
  const fileInfo = await prettier.getFileInfo(testFile, {
    ignorePath: '.prettierignore'
  })
  console.log('文件信息:', fileInfo)

  if (fileInfo.ignored) {
    console.log('警告: 文件被 .prettierignore 忽略')
  }
}

debug().catch(console.error)
```

**VS Code 配置验证**

```json
// .vscode/settings.json
{
  // 强制使用项目配置，不使用用户全局配置
  "prettier.configPath": ".prettierrc.js",

  // 或者设置为 true 自动查找
  "prettier.useEditorConfig": true,
  "prettier.requireConfig": true,

  // 调试时显示 Prettier 输出
  "prettier.enableDebugLogs": true
}
```

**检查 .prettierignore 规则**

```bash
# .prettierignore
# 检查是否意外忽略了目标文件

# 正确的忽略规则
/dist/*
/node_modules/**
*.min.js

# ❌ 错误示例：过于宽泛的规则
# *.ts        # 这会忽略所有 TypeScript 文件！
# src/**      # 这会忽略整个 src 目录！

# ✅ 使用否定规则排除
*.log
!important.log

# 查看文件是否被忽略
# npx prettier --check src/main.ts
# 如果输出 "ignored"，检查 .prettierignore
```

---

### 4. Vue SFC 文件格式化不完整或样式丢失

**问题描述**

格式化 Vue 单文件组件时，`<template>`、`<script>` 或 `<style>` 部分格式化不正确，或者某些部分的格式化被跳过，样式代码丢失或被破坏。

**问题原因**

- 缺少必要的 Prettier 插件
- Vue parser 配置错误
- 嵌入语言（如 SCSS）的 parser 未正确配置
- SFC 语法不规范导致解析失败
- style 标签的 lang 属性识别问题

**解决方案**

```bash
# 确保安装必要的依赖
pnpm add -D prettier @prettier/plugin-xml prettier-plugin-css-order

# 检查安装的插件版本
pnpm list prettier
```

```javascript
// .prettierrc.js - 完整的 Vue 项目配置
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
  arrowParens: 'always',
  vueIndentScriptAndStyle: false,
  endOfLine: 'auto',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',

  // 插件配置
  plugins: [
    // 如果需要排序 CSS 属性
    // 'prettier-plugin-css-order'
  ],

  // 不同文件类型的覆盖配置
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue',
        // Vue 模板中的 HTML 换行敏感度
        htmlWhitespaceSensitivity: 'ignore'
      }
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        singleQuote: true
      }
    },
    {
      files: '*.css',
      options: {
        parser: 'css',
        singleQuote: true
      }
    }
  ]
}
```

**修复 style 标签格式化问题**

```vue
<!-- ❌ 问题代码：lang 属性未被正确识别 -->
<style lang=scss scoped>
.container {
  // SCSS 代码
}
</style>

<!-- ✅ 正确写法：lang 属性使用引号 -->
<style lang="scss" scoped>
.container {
  padding: 20px;

  .title {
    font-size: 18px;
  }
}
</style>

<!-- ❌ 问题代码：特殊 CSS 语法被破坏 -->
<style scoped>
/* 深度选择器可能被错误格式化 */
:deep(.el-input) {
  width: 100%;
}
</style>

<!-- ✅ 使用 prettier-ignore 保护特殊语法 -->
<style scoped>
/* prettier-ignore */
:deep(.el-input) {
  width: 100%;
}

.normal-style {
  color: red;
}
</style>
```

**template 格式化控制**

```vue
<template>
  <!-- ✅ 正常格式化 -->
  <div class="container">
    <span>普通内容</span>
  </div>

  <!-- prettier-ignore -->
  <!-- ✅ 跳过特定元素的格式化 -->
  <pre>
    保持原样的
        缩进内容
  </pre>

  <!-- prettier-ignore-attribute -->
  <!-- ✅ 只跳过属性格式化 -->
  <div
    class="a   b    c"
    style="margin: 0"
  >
    内容
  </div>
</template>
```

**script setup 格式化**

```vue
<script setup lang="ts">
// ✅ 确保类型导入正确格式化
import type { PropType } from 'vue'
import type { SysUserVo } from '@/api/system/user/userTypes'

// ✅ 定义 props 和 emits
interface Props {
  modelValue: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// ✅ 复杂对象保持格式
// prettier-ignore
const options = [
  { label: '选项一',   value: 1 },
  { label: '选项二',   value: 2 },
  { label: '选项三',   value: 3 }
]
</script>
```

---

### 5. 多人协作时格式化结果不一致

**问题描述**

团队成员使用相同的配置文件，但格式化后的代码仍然不一致，导致 Git 出现不必要的 diff，或者 CI 检查失败。

**问题原因**

- Prettier 版本不一致
- 操作系统换行符差异
- IDE 配置覆盖了项目配置
- 部分成员未安装必要的插件
- 编辑器使用了用户级别的 Prettier 配置
- Git 的换行符自动转换配置不同

**解决方案**

```json
// package.json - 锁定 Prettier 版本
{
  "devDependencies": {
    "prettier": "3.4.2"  // 使用精确版本，不使用 ^
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**Git 换行符配置**

```bash
# .gitattributes - 统一换行符处理
* text=auto eol=lf

# 特定文件类型强制 LF
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.vue text eol=lf
*.json text eol=lf
*.css text eol=lf
*.scss text eol=lf
*.md text eol=lf
*.yaml text eol=lf
*.yml text eol=lf

# Windows 批处理文件保持 CRLF
*.bat text eol=crlf
*.cmd text eol=crlf

# 二进制文件
*.png binary
*.jpg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
```

```bash
# 团队成员执行一次性修复
git config core.autocrlf false
git add --renormalize .
git commit -m "chore: 统一换行符为 LF"
```

**EditorConfig 配置**

```ini
# .editorconfig - 编辑器基础配置
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

**VS Code 团队配置**

```json
// .vscode/settings.json - 项目级配置
{
  // 强制使用项目的 Prettier 配置
  "prettier.configPath": ".prettierrc.js",
  "prettier.requireConfig": true,

  // 禁用用户级别的配置覆盖
  "prettier.ignorePath": ".prettierignore",

  // 统一换行符
  "files.eol": "\n",

  // 统一编码
  "files.encoding": "utf8",

  // 统一缩进
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,

  // 保存时格式化
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

```json
// .vscode/extensions.json - 推荐扩展
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "EditorConfig.EditorConfig"
  ],
  "unwantedRecommendations": [
    "octref.vetur"  // 与 Volar 冲突
  ]
}
```

**CI/CD 格式检查**

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Check formatting
        run: pnpm prettier --check .

      - name: ESLint check
        run: pnpm lint
```

**格式化差异检测脚本**

```javascript
// scripts/format-check.js
import { execSync } from 'child_process'
import { existsSync } from 'fs'

function checkFormatting() {
  try {
    // 检查是否有未格式化的文件
    execSync('npx prettier --check .', { stdio: 'pipe' })
    console.log('✅ 所有文件格式正确')
    process.exit(0)
  } catch (error) {
    console.error('❌ 发现格式问题的文件:')

    // 获取需要格式化的文件列表
    const output = execSync('npx prettier --list-different .', { encoding: 'utf-8' })
    console.log(output)

    console.log('\n运行 "pnpm prettier" 修复格式问题')
    process.exit(1)
  }
}

checkFormatting()
```

---

### 6. 格式化性能慢或内存溢出

**问题描述**

执行 Prettier 格式化时速度很慢，或者在处理大型项目时出现内存溢出错误，导致格式化失败。

**问题原因**

- 项目文件数量过多
- 未配置 `.prettierignore` 忽略不需要的文件
- 单个文件过大
- 使用了性能较差的插件
- 全量格式化而非增量格式化
- Node.js 内存限制过小

**解决方案**

```bash
# .prettierignore - 优化忽略配置
# 构建输出
/dist/*
/build/*
/.output/*

# 依赖
/node_modules/**

# 缓存
/.cache/*
/.parcel-cache/*
/.vite/*

# 大文件
*.min.js
*.min.css
*.bundle.js
*.chunk.js

# 第三方库
/public/lib/**
/src/vendor/**

# 生成的文件
*.generated.ts
*.generated.js
/src/api/**/*.d.ts

# 图片等二进制文件
*.svg
*.png
*.jpg
*.gif
*.ico
*.woff
*.woff2

# 日志和临时文件
*.log
*.tmp
.DS_Store

# 测试覆盖率
/coverage/**

# 文档构建
/docs/.vitepress/dist/**
/docs/.vitepress/cache/**
```

**增量格式化配置**

```json
// package.json
{
  "scripts": {
    // 只格式化 Git 暂存区的文件
    "format:staged": "npx lint-staged",

    // 只格式化改动的文件
    "format:changed": "npx prettier --write $(git diff --name-only --diff-filter=d)",

    // 使用缓存加速
    "format:cache": "npx prettier --write --cache ."
  },
  "lint-staged": {
    "*.{js,ts,vue}": ["prettier --write"],
    "*.{css,scss}": ["prettier --write"],
    "*.json": ["prettier --write"]
  }
}
```

**Node.js 内存配置**

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npx prettier --write .

# 或在 package.json 中配置
{
  "scripts": {
    "prettier": "node --max-old-space-size=4096 ./node_modules/.bin/prettier --write ."
  }
}
```

**并行处理大型项目**

```javascript
// scripts/parallel-format.js
import { execSync } from 'child_process'
import { glob } from 'glob'
import os from 'os'

const BATCH_SIZE = 50  // 每批处理的文件数
const cpuCount = os.cpus().length

async function formatInBatches() {
  // 获取所有需要格式化的文件
  const files = await glob('src/**/*.{ts,vue,js}', {
    ignore: ['**/node_modules/**', '**/dist/**']
  })

  console.log(`找到 ${files.length} 个文件需要格式化`)

  // 分批处理
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    const fileList = batch.join(' ')

    console.log(`处理第 ${Math.floor(i / BATCH_SIZE) + 1} 批...`)

    try {
      execSync(`npx prettier --write ${fileList}`, {
        stdio: 'inherit',
        maxBuffer: 1024 * 1024 * 10  // 10MB buffer
      })
    } catch (error) {
      console.error(`批次 ${Math.floor(i / BATCH_SIZE) + 1} 处理失败`)
    }
  }

  console.log('格式化完成')
}

formatInBatches().catch(console.error)
```

**监控格式化性能**

```javascript
// scripts/format-benchmark.js
import { performance } from 'perf_hooks'
import { execSync } from 'child_process'
import { glob } from 'glob'

async function benchmark() {
  const patterns = [
    'src/**/*.ts',
    'src/**/*.vue',
    'src/**/*.js'
  ]

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**']
    })

    const start = performance.now()

    execSync(`npx prettier --check "${pattern}"`, {
      stdio: 'pipe'
    })

    const end = performance.now()
    const timePerFile = (end - start) / files.length

    console.log(`${pattern}: ${files.length} 文件, ${(end - start).toFixed(2)}ms 总计, ${timePerFile.toFixed(2)}ms/文件`)
  }
}

benchmark().catch(console.error)
```

---

### 7. 特定文件或代码块需要跳过格式化

**问题描述**

某些文件或代码块有特殊的格式要求，不希望被 Prettier 自动格式化，需要保持原有格式。

**问题原因**

- 手动对齐的数据结构需要保持格式
- 第三方复制的代码不应修改
- ASCII art 或特殊排版内容
- 生成的代码需要保持原样
- 测试用例中的特定格式

**解决方案**

```typescript
// 单行忽略 - prettier-ignore
// prettier-ignore
const matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]

// prettier-ignore
const permissions = {
  READ:    0b0001,
  WRITE:   0b0010,
  EXECUTE: 0b0100,
  ALL:     0b0111
}

// 多行忽略 - prettier-ignore-start/end
// prettier-ignore-start
const ASCII_ART = `
  _____ _   _ _____
 |  _  | | | |_   _|
 | |_| | | | | | |
 |  _  | |_| | | |
 |_| |_|\\___/  |_|
`
// prettier-ignore-end

// 对齐的导入语句
// prettier-ignore
import {
  UserService,
  RoleService,
  DeptService,
  MenuService
} from '@/api/system'
```

**Vue 模板中的忽略**

```vue
<template>
  <!-- prettier-ignore -->
  <div class="grid">
    <div>1</div><div>2</div><div>3</div>
    <div>4</div><div>5</div><div>6</div>
    <div>7</div><div>8</div><div>9</div>
  </div>

  <!-- prettier-ignore-attribute (单属性) -->
  <div
    class="a    b     c"
    :style="customStyle"
  >
    内容
  </div>

  <!-- 正常格式化的内容 -->
  <div class="normal">
    <span>这部分会被格式化</span>
  </div>
</template>
```

**CSS/SCSS 中的忽略**

```scss
/* prettier-ignore */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows:    1fr 1fr 1fr;
}

// prettier-ignore-start
$theme-colors: (
  'primary':   #409eff,
  'success':   #67c23a,
  'warning':   #e6a23c,
  'danger':    #f56c6c,
  'info':      #909399
);
// prettier-ignore-end
```

**Markdown 中的忽略**

```markdown
<!-- prettier-ignore -->
| 列1   | 列2   | 列3   |
|-------|-------|-------|
| 值1   | 值2   | 值3   |
| 值1   | 值2   | 值3   |

<!-- prettier-ignore-start -->
```
特殊格式的代码块
  保持原有缩进
    不被格式化
```text
<!-- prettier-ignore-end -->
```

**文件级别忽略**

```javascript
// 文件开头添加，整个文件不格式化
// prettier-ignore-file

// 或在 .prettierignore 中添加
// src/utils/legacy-code.js
// src/vendor/**
```

**使用 overrides 针对特定文件**

```javascript
// .prettierrc.js
export default {
  // 默认配置
  printWidth: 150,
  semi: false,

  overrides: [
    {
      // 特定目录使用不同配置
      files: 'src/generated/**',
      options: {
        printWidth: 80,
        semi: true
      }
    },
    {
      // 测试文件更宽松
      files: '**/*.test.ts',
      options: {
        printWidth: 200
      }
    },
    {
      // 配置文件保持紧凑
      files: ['*.config.js', '*.config.ts'],
      options: {
        printWidth: 100
      }
    }
  ]
}
```

---

### 8. 换行符问题导致 Git diff 异常

**问题描述**

Git 显示文件有大量改动，但实际只是换行符变化（LF vs CRLF），或者每次格式化后文件换行符都会改变，导致不必要的代码变更。

**问题原因**

- Windows 和 Unix 系统换行符不同
- Git 自动换行符转换配置不一致
- Prettier 的 `endOfLine` 配置问题
- 编辑器保存时自动转换换行符
- 从其他项目复制代码带入了不同的换行符

**解决方案**

```javascript
// .prettierrc.js - 推荐配置
export default {
  // 方案1: 自动模式（推荐）
  endOfLine: 'auto',  // 保持文件原有换行符

  // 方案2: 强制 LF（跨平台项目）
  // endOfLine: 'lf'
}
```

**Git 配置统一换行符**

```bash
# 全局配置（推荐所有团队成员执行）
git config --global core.autocrlf false
git config --global core.eol lf

# 仅当前项目配置
git config core.autocrlf false
git config core.eol lf

# 查看当前配置
git config --list | grep -E "(autocrlf|eol)"
```

```bash
# .gitattributes - 项目级换行符规则
* text=auto eol=lf

# 确保特定类型文件使用 LF
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.vue text eol=lf
*.json text eol=lf
*.css text eol=lf
*.scss text eol=lf
*.less text eol=lf
*.html text eol=lf
*.md text eol=lf
*.yaml text eol=lf
*.yml text eol=lf

# Windows 脚本保持 CRLF
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# 二进制文件不处理
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
```

**修复已存在的换行符问题**

```bash
# 1. 确保所有文件使用 LF
# 安装 dos2unix 工具
# Windows: scoop install dos2unix
# Mac: brew install dos2unix
# Linux: apt install dos2unix

# 批量转换
find . -type f -name "*.ts" -exec dos2unix {} \;
find . -type f -name "*.vue" -exec dos2unix {} \;
find . -type f -name "*.js" -exec dos2unix {} \;

# 或使用 Node.js 脚本
node -e "
const fs = require('fs');
const path = require('path');
const glob = require('glob');

glob.sync('src/**/*.{ts,vue,js}').forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const fixed = content.replace(/\r\n/g, '\n');
  if (content !== fixed) {
    fs.writeFileSync(file, fixed);
    console.log('Fixed:', file);
  }
});
"
```

```bash
# 2. Git 重新规范化所有文件
git add --renormalize .
git status  # 查看改动的文件
git commit -m "chore: 统一换行符为 LF"
```

**VS Code 配置**

```json
// .vscode/settings.json
{
  // 新文件使用 LF
  "files.eol": "\n",

  // 显示换行符
  "editor.renderControlCharacters": true,

  // 保存时不自动转换
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

**换行符检测脚本**

```javascript
// scripts/check-line-endings.js
import { readFileSync } from 'fs'
import { glob } from 'glob'

async function checkLineEndings() {
  const files = await glob('src/**/*.{ts,vue,js}', {
    ignore: ['**/node_modules/**']
  })

  const issues = []

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')

    if (content.includes('\r\n')) {
      const crlfCount = (content.match(/\r\n/g) || []).length
      const lfCount = (content.match(/(?<!\r)\n/g) || []).length

      issues.push({
        file,
        crlf: crlfCount,
        lf: lfCount,
        type: crlfCount > lfCount ? 'CRLF' : 'Mixed'
      })
    }
  }

  if (issues.length > 0) {
    console.log('❌ 发现换行符问题:')
    console.table(issues)
    console.log('\n运行以下命令修复:')
    console.log('git add --renormalize .')
    process.exit(1)
  } else {
    console.log('✅ 所有文件换行符正确 (LF)')
  }
}

checkLineEndings().catch(console.error)
```

**CI 检查换行符**

```yaml
# .github/workflows/lint.yml
- name: Check line endings
  run: |
    # 检查是否有 CRLF 换行符
    if git ls-files | xargs file | grep CRLF; then
      echo "❌ 发现 CRLF 换行符，请统一使用 LF"
      exit 1
    else
      echo "✅ 换行符检查通过"
    fi
```
