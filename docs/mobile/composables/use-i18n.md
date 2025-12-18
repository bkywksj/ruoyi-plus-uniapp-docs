# useI18n 国际化

## 介绍

`useI18n` 是增强的国际化组合函数，基于 wot-ui 的翻译系统，扩展了 Vue I18n 的功能特性。适配移动端使用场景，支持多语言字段国际化、路由标题翻译等功能。

**核心特性:**

- **增强翻译函数** - 支持多种翻译方式，包括简单用法和字段信息配置
- **语言管理** - 提供当前语言、语言列表等响应式状态
- **路由标题翻译** - 支持翻译路由标题的便捷方法
- **wot-ui 兼容** - 与 wot-ui 的 useTranslate 保持兼容
- **类型安全** - 完整的 TypeScript 类型支持

## 基本用法

### 简单翻译

使用 `t` 函数进行简单翻译：

```vue
<template>
  <view>
    <!-- 简单用法：t('英文', '中文') -->
    <wd-text :text="t('userName', '用户名')" />
    <wd-text :text="t('password', '密码')" />
    <wd-text :text="t('login', '登录')" />
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
```

### 使用字段信息

通过字段信息对象进行翻译：

```vue
<template>
  <view>
    <!-- 使用字段信息：field 用于英文，comment 用于中文 -->
    <wd-text :text="t('', { field: 'UserName', comment: '用户名' })" />
    <wd-text :text="t('', { field: 'Password', comment: '密码' })" />
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
```

### 使用语言特定翻译

指定不同语言的翻译内容：

```vue
<template>
  <view>
    <!-- 使用语言代码指定翻译 -->
    <wd-text :text="t('', {
      [LanguageCode.zh_CN]: '用户名',
      [LanguageCode.en_US]: 'UserName'
    })" />
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()
</script>
```

### 使用传统 i18n 键

通过语言包键名进行翻译：

```vue
<template>
  <view>
    <!-- 使用 i18n 键翻译 -->
    <wd-text :text="t('user.userName')" />
    <wd-text :text="t('common.submit')" />
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
```

## 语言管理

### 获取当前语言

```typescript
import { useI18n } from '@/composables/useI18n'

const { currentLanguage, currentLanguageName, isChinese, isEnglish } = useI18n()

console.log('当前语言代码:', currentLanguage.value) // 'zh_CN' 或 'en_US'
console.log('当前语言名称:', currentLanguageName.value) // '简体中文' 或 'English'
console.log('是否中文:', isChinese.value)
console.log('是否英文:', isEnglish.value)
```

### 切换语言

```typescript
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { setLanguage } = useI18n()

// 切换到英文
setLanguage(LanguageCode.en_US)

// 切换到中文
setLanguage(LanguageCode.zh_CN)
```

### 获取语言列表

```vue
<template>
  <wd-picker
    :columns="languageColumns"
    v-model="currentLang"
    @confirm="onLanguageChange"
  />
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'
import { computed } from 'vue'

const { languageOptions, currentLanguage, setLanguage } = useI18n()

const currentLang = computed(() => currentLanguage.value)

const languageColumns = computed(() =>
  languageOptions.value.map(item => ({
    value: item.value,
    label: item.label
  }))
)

const onLanguageChange = ({ value }) => {
  setLanguage(value)
}
</script>
```

## 路由标题翻译

### 基本用法

```typescript
import { useI18n } from '@/composables/useI18n'

const { translateRouteTitle } = useI18n()

// 翻译路由标题
const title = translateRouteTitle('dashboard') // 返回对应语言的标题
```

### 在导航栏中使用

```vue
<template>
  <view>
    <wd-navbar :title="pageTitle" />
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'
import { computed } from 'vue'

const { translateRouteTitle } = useI18n()

const pageTitle = computed(() => translateRouteTitle('userCenter'))
</script>
```

## wot-ui 兼容

### translate 方法

```typescript
import { useI18n } from '@/composables/useI18n'

const { translate } = useI18n()

// 与 wot-ui 的 useTranslate 兼容
const text = translate('button.confirm') // 确认
const text2 = translate('button.cancel') // 取消
```

## API

### useI18n 返回值

| 属性/方法 | 说明 | 类型 |
|-----------|------|------|
| t | 增强的翻译函数 | `(key: string, fieldInfoOrValue?: object \| string) => string` |
| currentLanguage | 当前语言代码（响应式） | `ComputedRef<LanguageCode>` |
| currentLanguageName | 当前语言名称（响应式） | `ComputedRef<string>` |
| languageOptions | 可用语言列表（响应式） | `ComputedRef<Array<{value, label, name}>>` |
| isChinese | 是否中文环境（响应式） | `ComputedRef<boolean>` |
| isEnglish | 是否英文环境（响应式） | `ComputedRef<boolean>` |
| setLanguage | 设置应用语言 | `(lang: LanguageCode) => boolean` |
| translateRouteTitle | 翻译路由标题 | `(title: string) => string` |
| translate | wot-ui 兼容的翻译方法 | `(key: string, ...args: unknown[]) => string` |

### 类型定义

```typescript
interface UseI18nReturn {
  t: (
    key: ObjKeysToUnion<LanguageType> | string,
    fieldInfoOrValue?:
      | ({
          field?: string
          comment?: string
        } & Partial<Record<LanguageCode, string>> &
          Record<string, any>)
      | string,
  ) => string

  currentLanguage: ComputedRef<LanguageCode>
  currentLanguageName: ComputedRef<string>
  languageOptions: ComputedRef<Array<{
    value: LanguageCode
    label: string
    name: string
  }>>
  isChinese: ComputedRef<boolean>
  isEnglish: ComputedRef<boolean>

  setLanguage: (lang: LanguageCode) => boolean
  translateRouteTitle: (title: string) => string
  translate: (key: string, ...args: unknown[]) => string
}

/**
 * 对象键名转联合类型
 */
type ObjKeysToUnion<T, Depth extends number[] = [0, 1, 2, 3]> =
  Depth['length'] extends 4
    ? never
    : T extends object
      ? {
          [K in keyof T]: `${K & string}${T[K] extends object
            ? `.${ObjKeysToUnion<T[K], [...Depth, 0]>}`
            : ''}`
        }[keyof T]
      : never
```

## 翻译优先级

`t` 函数的翻译优先级如下：

1. **简单用法** `t('key', '中文值')`:
   - 中文环境：返回第二个参数（中文值）
   - 其他环境：返回第一个参数（key）

2. **字段信息用法**:
   - 优先级1：使用当前语言的映射 `fieldInfo[currentLang]`
   - 优先级2：中文环境使用 `comment`，其他环境使用 `field`
   - 优先级3：降级策略，尝试其他可用翻译
   - 优先级4：使用任何可用的翻译值

3. **i18n 键用法**:
   - 从语言包中查找对应键的翻译
   - 按钮键支持降级处理 `button.user.save` → `button.save`
   - 无翻译时返回键名本身

## 最佳实践

### 1. 表单标签翻译

```vue
<template>
  <wd-form>
    <wd-cell-group>
      <wd-input
        :label="t('userName', '用户名')"
        v-model="form.userName"
        :placeholder="t('pleaseInput', '请输入') + t('userName', '用户名')"
      />
      <wd-input
        :label="t('phone', '手机号')"
        v-model="form.phone"
        :placeholder="t('pleaseInput', '请输入') + t('phone', '手机号')"
      />
    </wd-cell-group>
  </wd-form>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'
import { reactive } from 'vue'

const { t } = useI18n()

const form = reactive({
  userName: '',
  phone: ''
})
</script>
```

### 2. 按钮文字翻译

```vue
<template>
  <view class="button-group">
    <wd-button type="primary" @click="onSubmit">
      {{ t('submit', '提交') }}
    </wd-button>
    <wd-button @click="onCancel">
      {{ t('cancel', '取消') }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
```

### 3. 消息提示翻译

```typescript
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const showSuccess = () => {
  uni.showToast({
    title: t('operationSuccess', '操作成功'),
    icon: 'success'
  })
}

const showError = (message: string) => {
  uni.showToast({
    title: t('operationFailed', '操作失败') + ': ' + message,
    icon: 'none'
  })
}
```

### 4. 语言切换组件

```vue
<template>
  <view class="language-switch">
    <wd-button
      v-for="lang in languageOptions"
      :key="lang.value"
      :type="currentLanguage === lang.value ? 'primary' : 'default'"
      size="small"
      @click="setLanguage(lang.value)"
    >
      {{ lang.label }}
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import { useI18n } from '@/composables/useI18n'

const { languageOptions, currentLanguage, setLanguage } = useI18n()
</script>
```

## 常见问题

### 1. 翻译不生效？

确保语言包中存在对应的键，或使用简单用法 `t('key', '中文')`。

### 2. 如何添加新语言？

在 `@/locales/i18n` 中添加新的语言配置和语言包。

### 3. 组件内翻译实时更新？

`useI18n` 返回的状态都是响应式的，语言切换后会自动更新。

### 4. 如何处理动态翻译？

使用计算属性包装翻译结果：

```typescript
const buttonText = computed(() => t('submit', '提交'))
```
