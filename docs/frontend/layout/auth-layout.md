# 认证页 (AuthLayout)

## 简介

`AuthLayout` 是登录、注册、找回密码三个页面共用的外壳组件，负责背景层、粒子层、品牌区、工具栏与页脚，表单卡片由各页面通过默认插槽传入。

这套外壳把三页里原本逐字重复的模板与样式收敛到一处——此前每加一项外观配置（比如主题色跟随）都要在三个文件里各改一遍，漏一个就出现「登录页变了、注册页没变」。

**核心特性：**

- **统一外壳** - 三页共用同一套背景、粒子、工具栏与页脚
- **主题联动** - 背景渐变由主题色实时推导，切主题色即变；明暗各配各的背景图
- **六种粒子效果** - 颜色跟随主题色，留白区跟随表单卡片实测位置
- **表单对齐可配** - 居左/居中/居右，窄屏自动回落居中
- **首屏加载页同步** - 构建期注入配置，改完配置第一次刷新即生效
- **登录方式按接口下发** - 短信/邮箱页签显隐以后端能力为准，不由前端写死

## 组件结构

```
views/system/auth/
├── login.vue                  # 登录（账密 / 短信 / 邮箱三种方式）
├── register.vue               # 注册
├── forgotPassword.vue         # 找回密码
├── socialCallback.vue         # 三方登录回调
└── components/
    ├── AuthLayout.vue         # 共用外壳
    └── ASocialLogin.vue       # 三方登录按钮组（登录页与注册页共用）

components/ATheme/
└── AParticleCanvas.vue        # 粒子画布

vite/plugins/
└── loader-config.ts           # 首屏加载页配置注入插件
```

### 外壳的六个层

```vue
<template>
  <div class="auth-layout" :class="[`is-${effectiveAlign}`]">
    <!-- 背景层 -->
    <div class="auth-bg" :class="{ 'has-gradient': useThemeGradient }" :style="bgStyle" />

    <!-- 粒子层：叠在背景图之上、内容之下 -->
    <AParticleCanvas
      ref="particleRef"
      :effect="particle"
      :tone="tone"
      :avoid-selectors="AVOID_SELECTORS"
      :focus-selector="FOCUS_SELECTOR"
    />

    <!-- 左上角品牌区 -->
    <a class="auth-brand" href="https://ruoyi.plus" target="_blank" rel="noopener noreferrer">
      <img src="@/assets/logo/logo.png" class="brand-logo" alt="logo" />
      <span class="brand-name">ruoyi-plus-uniapp</span>
    </a>

    <!-- 右上角工具栏：主题色 / 语言 / 明暗 -->
    <div class="auth-tools">...</div>

    <!-- 内容区：表单卡片由各页面通过默认插槽传入 -->
    <div class="auth-body">
      <div class="auth-card">
        <slot />
      </div>
    </div>

    <!-- 页脚 -->
    <div class="auth-footer">...</div>
  </div>
</template>
```

粒子层的 `tone` **必须跟着底图走**，否则粒子在反色底上看不清——浅色底配浅色粒子等于没有。

---

## 外观配置

全部集中在 `SystemConfig.login`，三页共用一份。

```typescript
login: {
  background: '',               // 浅色模式背景图
  backgroundDark: '',           // 暗黑模式背景图
  gradient: true,               // 浅色模式是否叠加主题色渐变
  particle: LoginParticle.Cube, // 背景粒子效果
  align: LoginAlign.Center,     // 表单水平位置
  smsTab: true,                 // 手机验证码页签兜底开关
  emailTab: true                // 邮箱验证码页签兜底开关
}
```

### 背景图为什么放 public 而不是 src/assets

两张示例图放在 `plus-ui/public/` 下，原因很实际：

- **public 下的文件原样输出到产物根目录**，换背景直接覆盖 `public/login-bg.png` 就行，不用改代码
- **`src/assets` 里没被 import 的图根本不会被打包**，替换了也不生效

路径以 `/` 开头时会自动补上部署子路径（vite 的 `base` 取 `VITE_APP_CONTEXT_PATH`），所以部署在子目录下也不会失效。

### 明暗为什么要两个字段

`background` 与 `backgroundDark` 分开，是因为**只有一个字段时，填了浅色图会把暗黑模式一起盖掉**。

暗黑模式留空时用内置深色底图 `/login-bg-dark.png`——不给底图的话，深色表单卡片会浮在近白背景上，割裂感很强。

### 渐变色为什么不可配

渐变色**由当前主题色实时推导**（`--el-color-primary` 的浅色化），切换主题色时渐变跟着变。单独配色反而会在换主题后撞色，所以只给一个开关，不给颜色。

关掉就是纯白背景。暗黑模式走内置底图，这个开关不影响它。

### 粒子效果

```typescript
export enum LoginParticle {
  /** 不启用（canvas 不挂载，零运行时开销） */
  None = 'none',
  /** 粒子星链：近距连线成网，鼠标附近产生引力 */
  Link = 'link',
  /** 立方浮游：等距立方体线框缓慢上浮，图形取自项目 logo */
  Cube = 'cube',
  /** 数据流：竖向流动的数据列 */
  Flow = 'flow',
  /** 代码矩阵：浮动的代码符号缓慢升起 */
  Code = 'code',
  /** 星野：星点闪烁 + 近邻星座连线，最安静的一种 */
  Star = 'star'
}
```

`None` 时 canvas 直接不挂载，不是挂载后不绘制——对低配设备和无障碍场景是真正的零开销。

粒子的留白区跟随**表单卡片的实测位置**（`AVOID_SELECTORS` / `FOCUS_SELECTOR`），而不是写死坐标。表单对齐方式改变、窄屏回落居中时，留白区会跟着移动，不会出现粒子糊在表单上的情况。

### 表单对齐

```typescript
export enum LoginAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right'
}
```

**仅在宽屏生效**：窄屏（不超过 1180px）没有偏置空间，一律强制居中。组件内用 `effectiveAlign` 计算实际生效值，而不是直接用配置值。

---

## 首屏加载页

`index.html` 里的首屏加载页在 **Vue 挂载之前**显示，此时读不到 `SystemConfig`。

### 早先的做法与它的问题

早先是 `main.ts` 把配置写进 `localStorage`、加载页下次再读。能用，但**改完配置的第一次刷新加载页仍是旧值**（写入发生在加载页渲染之后），会出现「加载页 code、登录页 flow」的错位。

### 现在：构建期注入

`vite/plugins/loader-config.ts` 在构建期直接把值替换进 HTML 占位符：

```typescript
/** 与 index.html 中的占位符保持一致 */
const PLACEHOLDER = '%LOGIN_PARTICLE%'
const PLACEHOLDER_GRADIENT = '%LOGIN_GRADIENT%'

/** 读不到配置时的兜底值（与 SystemConfig 默认值一致） */
const FALLBACK = 'code'

/** LoginParticle 枚举的合法取值，用于校验抠出来的值 */
const VALID = ['none', 'link', 'cube', 'flow', 'code', 'star']
```

浏览器拿到的就是最终值：

- **零运行时开销** —— 纯字符串替换，不加脚本、不加请求、不改变解析流程
- **改配置后第一次刷新即同步**

### 为什么用正则抠值而不是 import

插件从 `systemConfig.ts` 里**正则抠值**，没有直接 import 它。因为该文件依赖 `import.meta.env` 与 `ElSize` 等类型，在 vite 配置阶段（Node 环境）无法直接执行。抠值是这里唯一不引入构建期副作用的做法。

抠出来的值会用 `VALID` 白名单校验，解析失败回退到 `FALLBACK`，不会把非法值写进 HTML。

---

## 登录方式

登录页支持账密、短信验证码、邮箱验证码三种方式，以页签切换。

### 页签显隐以接口为准

配置里的 `smsTab` / `emailTab` 是**兜底**开关，正常情况下不起作用：

> 页签显隐以接口 `CaptchaVo.smsEnabled` 为准，只有对接未升级、不返回该字段的旧后端时才回落到配置。

这个设计很关键：**能不能用取决于后端配置，前端写死会出现「页签显示了但一发码就报错」**。

后端通过 `CaptchaVo` 的 `smsEnabled` / `emailEnabled` 字段下发能力，前端据此决定渲染哪些页签。

对应的后端开关分两层：

| 层次 | 短信 | 邮箱 |
|------|------|------|
| 能力配置 | `sms.blends.config1`（服务商凭据：accessKey / secret / 签名） | `mail.enabled` |
| 登录入口 | `sms.captcha.enabled` | `mail.captcha.enabled` |

**能发短信不等于要开放短信登录**——很多项目需要短信通知，但并不希望多一个登录入口。

---

## 图形验证码

发码接口加了图形验证码前置后，认证页有三处相应调整。

### 字段顺序对齐操作顺序

调整前，短信/邮箱页签的排列是：

```
手机号 → 验证码 [获取验证码] → 图形验证码
```

用户会先点「获取验证码」被前端校验拦下，才发现要往下填图形码，多一次无谓试错。

现在把「身份字段」与「发码字段」拆开，图形验证码夹在两者之间，规则统一为**图形验证码紧跟身份字段之后**：

| 登录方式 | 字段顺序 |
|---------|---------|
| 账密 | 用户名 / 密码 / 图形验证码 |
| 短信 | 手机号 / 图形验证码 / 验证码[获取] |
| 邮箱 | 邮箱 / 图形验证码 / 验证码[获取] |

账密态的位置没变——图形验证码本就是它的最后一个字段。

### 两个「验证码」标签的区分

短信/邮箱页签下同屏会出现两行标签：短信(邮箱)验证码与图形验证码。中文侧 `login.code`、`login.smsCode`、`login.emailCode` 三个 key 的值**都是「验证码」**，用户只能靠右侧是图片还是「获取验证码」按钮来分辨。

英文侧本就是 `Captcha` 与 `Code`，区分是原有设计意图，中文是漏了，所以只补中文：

- `login.code`「验证码」改为「图形验证码」
- `register.code` 不动——注册页只有图形码一种，不存在歧义
- 中文档 `labelWidth` 由 80px 放宽到 92px：账密态该字段带必填星号，80px 会挤

### 开关未获取到时先不渲染

```typescript
const captchaEnabled = ref(false)   // 初值由 true 改为 false
```

语义从「默认按启用渲染」改为「**还没问到后端，先不渲染**」。

原先在 `imgCode` 返回前会先画出验证码框：后端若未启用，会连同一张取不到的图闪一下再消失；即便启用，那一瞬的图也是空的。

接口返回后的 `data.captchaEnabled ?? true` 兜底保持不变——那是「接口回了但没带该字段」的场景，与「接口还没回来」语义不同，两者不能混用同一个默认值。

---

## 粒子画布

`AParticleCanvas.vue` 负责绘制背景粒子层。

### 与背景图的分工

> 背景图**只负责底色渐变**，点/线/几何图形一律由粒子层绘制。

这是刻意的分层。两边都画会叠成一团——静止的假图形混进会动的真粒子，看起来像渲染出错。

### 组件属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `effect` | `LoginParticle` | 粒子效果，`none` 时不占用 `requestAnimationFrame` |
| `tone` | `'dark' \| 'light'` | 明暗档，决定粒子颜色的深浅与透明度 |
| `avoidSelectors` | `string[]` | UI 避让区选择器，命中元素周围的粒子会淡出 |
| `focusSelector` | `string` | 焦点区选择器，粒子围着它留白 |

### tone 为什么必须跟着底图

浅色背景需要**压深颜色并降低透明度**，否则粒子发飘看不清。反过来在深色底上用深色粒子同样等于没画。

所以 `tone` 由外壳根据当前背景实际情况传入，而不是简单跟随明暗模式——自定义了浅色背景图但图本身很深时，两者是不一致的。

### 避让区与焦点区

- **避让区**（`avoidSelectors`）：命中的元素周围粒子淡出，避免盖住 logo、工具栏。只有体积大的效果（立方浮游）才明显需要，小圆点粒子影响甚微
- **焦点区**（`focusSelector`）：粒子围着它留白，让「光打在表单周围而不是表单上」

两者都按**元素实测位置**计算，所以表单对齐方式改变、窄屏回落居中时留白区会跟着走。

### 无障碍与性能

| 场景 | 行为 |
|------|------|
| 系统开启「减少动态效果」 | 自动冻结运动（仍绘制，只是不动） |
| 窄屏 | 不挂载 canvas |
| `effect` 为 `none` | 不占用 `requestAnimationFrame` |

注意「冻结运动」与「不绘制」的区别：冻结后画面仍在，只是静止，不会让背景突然空掉。

---

## 三个页面

三页都以 `AuthLayout` 包裹，各自只负责表单卡片内部的内容。

| 页面 | 路由 | 卡片内容 |
|------|------|---------|
| `login.vue` | `/login` | 三种登录方式的页签 + 表单 + 三方登录入口 |
| `register.vue` | `/register` | 注册表单 + 三方登录入口 |
| `forgotPassword.vue` | `/forgotPassword` | 找回密码表单 |
| `socialCallback.vue` | 三方回调地址 | 无表单，处理授权回调后跳转 |

登录页与注册页的副标题会在多租户启用时显示租户名：

```vue
<p class="sub">
  {{ captcha.tenantEnabled && captcha.tenantTitle ? captcha.tenantTitle : t('register.subtitle') }}
</p>
```

### 登录页的三种方式共用一份表单数据

```typescript
const activeTab = ref<LoginTab>('password')

/** 表单数据：三种登录方式共用，提交时按 activeTab 组装 */
const loginFormData = reactive({
  tenantId: '',
  username: '',
  password: '',
  phone: '',
  smsCode: '',
  email: '',
  emailCode: '',
  code: '',
  uuid: '',
  rememberMe: false
})
```

切页签不清空数据——用户在短信页签填了手机号又切回账密，切回来时手机号还在。

### validate-on-rule-change 必须关掉

这是登录页一个容易踩的坑：

```vue
<el-form
  ref="loginFormRef"
  :model="loginFormData"
  :rules="loginFormRules"
  :validate-on-rule-change="false"
>
```

Element Plus 该属性默认是 `true`，而本页的 `rules` 是 **computed**，依赖两个会变的东西：`activeTab`（切页签）与 `captcha.captchaEnabled`（`imgCode` 接口异步返回）。

默认行为下 rules 一变就整表校验，会出现两个现象：

- **进页面即红** —— `imgCode` 回来时，开发环境的自动填充（500ms 延时）还没执行，校验跑在空表单上
- **切页签即红** —— 新页签的字段本来就是空的

校验只应由用户交互（`blur` / `change`）或点击登录触发。

### 租户字段按需渲染

```vue
<el-form-item v-if="captcha.tenantEnabled" prop="tenantId" :label="t('login.tenantId')">
```

单租户部署时后端不下发 `tenantEnabled`，租户选择框整个不渲染，不会给用户一个填了也没用的输入框。

---

## 三方登录回调

`socialCallback.vue` 处理授权服务器的回调，页面本身没有表单，只做参数解析与跳转。

```typescript
const REDIRECT_DELAY = 2000        // 重定向延迟（毫秒）
const DEFAULT_TENANT_ID = '000000' // 默认租户ID
```

流程是：解析 `code` / `state` / `source` 三个 query 参数 → `state` 是 base64 编码的状态对象，解出其中的租户信息 → 换取登录态 → 延迟跳转。

留 2 秒延迟是为了让用户看清结果提示（成功或失败），直接跳转会让人不知道刚才发生了什么。

---

## 三方登录

`ASocialLogin.vue` 由登录页与注册页共用，消除了两处逐字重复的模板与样式。

### 按平台数量自适应两种形态

| 平台数量 | 形态 |
|---------|------|
| 1~2 个 | 主按钮带文字 + 次按钮方块 |
| 3 个及以上 | 全部收成等宽纯图标 + tooltip |

grid 用 `auto-fit` 而非 `auto-fill`——后者在元素数少于列数时会让按钮挤在左侧不铺满。

### 图标长期不显示的根因

这是个值得记录的坑：**25 个平台里有 18 个图标位置是空白的**。

原因是 `socialConfig` 的图标走 Icon 组件的 `i-${code}` **运行时拼接**路径，而 unocss 是**静态扫描**提取类名的，拼接出来的类名扫不到，不进 safelist 就不生成对应 CSS。

修法是由 `uno.config` 从 `socialConfig` **自动生成 safelist**，保持单一事实源——手工维护一份 safelist 清单的话，加平台时必然会忘。

同时把钉钉、QQ、百度等占位字母图标换成了真品牌 logo。

### 暗色下的品牌色提亮

品牌色是固定的，但深色底下有些会糊掉：GitHub 的 `#181717` 与深灰底对比度不足 1:1，几乎看不见。

因此暗色模式下按**感知亮度**提亮过暗的品牌色，而不是统一加一个固定亮度值——后者会让本就够亮的品牌色过曝。

---

## 响应式适配

| 断点 | 行为 |
|------|------|
| 宽屏 | 表单按 `align` 配置居左/居中/居右 |
| 不超过 1180px | 无偏置空间，强制居中 |
| 手机端 | 标签与输入框同行、页脚参与文档流 |

手机端页脚**参与文档流**而非固定定位，是因为移动浏览器的地址栏收放会让 `position: fixed` 的页脚跳动，且小屏上固定页脚会挤占本就紧张的表单空间。

---

## 最佳实践

### 1. 换背景图直接覆盖 public 下的文件

```bash
# 浅色
cp your-bg.png plus-ui/public/login-bg.png
# 暗黑
cp your-bg-dark.png plus-ui/public/login-bg-dark.png
```

然后把 `SystemConfig.login.background` 设为 `/login-bg.png` 即可。不需要改任何代码，也不需要动构建配置。

### 2. 低配设备或内网环境关掉粒子

```typescript
login: {
  particle: LoginParticle.None
}
```

`None` 时 canvas 不挂载，没有任何运行时开销。

### 3. 不要在前端写死登录方式

页签显隐交给后端 `CaptchaVo` 下发。前端写死会出现「页签在、一点就报错」，而这个错误只有真正去点的用户才会遇到，测试阶段很容易漏。

### 4. 加新的三方登录平台时不要手动维护 safelist

往 `socialConfig` 里加条目即可，`uno.config` 会自动生成对应的 safelist 条目。手工维护两份清单迟早会漏。

---

## 常见问题

### 改了粒子配置，加载页和登录页不一致

确认是否重新构建过。首屏加载页的粒子值是**构建期**注入 HTML 的，开发模式下改配置需要重启开发服务器才会重新走插件。

### 背景图换了不生效

检查图片是否放在 `plus-ui/public/` 下。放在 `src/assets` 里但没有被 import 的图片不会被打包，替换了也没用。

另外确认 `SystemConfig.login.background` 是否填了路径——留空是纯白底加渐变，不读任何图片。

### 暗黑模式下背景还是浅色图

`background` 与 `backgroundDark` 是两个独立字段。只填了 `background` 的话，暗黑模式会走内置深色底图而不是你填的那张；要自定义暗黑背景需单独填 `backgroundDark`。

### 三方登录图标空白

检查该平台是否在 `socialConfig` 中登记。图标 safelist 由 `uno.config` 从 `socialConfig` 自动生成，不在配置里的平台不会生成 CSS。

### 登录页有短信页签但发码报错

后端的短信能力（`sms.blends`）与登录入口（`sms.captcha.enabled`）是两层配置，只开了入口没配服务商凭据就会这样。正常情况下页签显隐由接口 `CaptchaVo.smsEnabled` 控制，出现这种不一致说明后端未升级或该字段未正确下发。

### 验证码框闪一下就消失

这是旧版本的行为，`captchaEnabled` 初值为 `true` 导致接口返回前就先渲染。现版本初值为 `false`，不会再出现。

### 表单对齐设了居左但仍居中

窄屏（不超过 1180px）会强制居中，`align` 配置只在宽屏生效。
