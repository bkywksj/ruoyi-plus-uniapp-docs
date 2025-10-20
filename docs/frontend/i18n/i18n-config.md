# 国际化配置

## 概述

框架使用 [Vue I18n](https://vue-i18n.intlify.dev/) 实现国际化功能，支持中文（zh_CN）和英文（en_US）两种语言，并集成了 Element Plus 的国际化支持。

## 配置文件

### i18n 实例配置

位置：`src/locales/i18n.ts`

```typescript
import { createI18n } from 'vue-i18n'
import zh_CN from '@/locales/zh_CN'
import en_US from '@/locales/en_US'
import el_en from 'element-plus/es/locale/lang/en'
import el_zhCn from 'element-plus/es/locale/lang/zh-cn'

const i18n = createI18n({
  globalInjection: true,      // 全局注入 $t, $d 等方法到模板中
  allowComposition: true,     // 允许组合式 API
  legacy: false,              // 使用 Vue 3 Composition API 模式
  locale: getLanguage(),      // 设置当前语言
  messages: {
    zh_CN: {
      ...zh_CN,
      ...el_zhCn              // Element Plus 中文语言包
    },
    en_US: {
      ...en_US,
      ...el_en                // Element Plus 英文语言包
    }
  }
})
```

### 配置说明

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `globalInjection` | boolean | 将 `$t`, `$d` 等方法全局注入到模板中 |
| `allowComposition` | boolean | 允许使用组合式 API 的 `useI18n()` |
| `legacy` | boolean | `false` 使用 Vue 3 Composition API 模式 |
| `locale` | string | 当前激活的语言代码 |
| `messages` | object | 所有语言的翻译消息 |

## 语言代码枚举

位置：`src/systemConfig.ts`

```typescript
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US'
}
```

## 获取当前语言

框架提供 `getLanguage()` 函数从本地存储获取用户设置的语言：

```typescript
export const getLanguage = (): LanguageCode => {
  const layout = useLayout()

  if (layout.language.value) {
    return layout.language.value
  }
  return LanguageCode.zh_CN  // 默认中文
}
```

## 在应用中注册

位置：`src/main.ts`

```typescript
import i18n from '@/locales/i18n'

const app = createApp(App)
app.use(i18n)  // 注册国际化插件
```

## 支持的语言

当前框架支持以下语言：

| 语言代码 | 语言名称 | 显示名称 |
|----------|---------|---------|
| `zh_CN` | 简体中文 | 简体中文 |
| `en_US` | 英语（美国） | English |

## 相关文件

- `src/locales/i18n.ts` - i18n 实例配置
- `src/locales/zh_CN.ts` - 中文语言包
- `src/locales/en_US.ts` - 英文语言包
- `src/composables/useI18n.ts` - 增强的 i18n Composable
- `src/systemConfig.ts` - 语言代码枚举定义

## 下一步

- [语言包管理](./language-packs.md) - 了解如何管理和组织语言包
- [组件国际化](./component-i18n.md) - 在组件中使用国际化
- [国际化最佳实践](./i18n-practices.md) - 国际化开发最佳实践
