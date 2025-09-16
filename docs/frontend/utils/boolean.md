# 布尔值工具 (boolean.ts)

布尔值处理工具类，提供多格式真假值检查、类型转换和状态切换功能，支持字符串、数字、布尔值、null/undefined等各种输入格式的统一处理。

## 📖 概述

布尔值工具包含以下功能类别：
- **布尔判断**：多格式真假值检查，支持字符串、数字、布尔值、null/undefined等各种输入
- **类型转换**：统一转换为标准布尔格式，输出 '1'/'0' 字符串或 boolean 类型
- **状态切换**：布尔状态切换，支持多种输入格式，输出标准 '1'/'0' 字符串

## 🎯 支持的格式

### 真值格式
- 字符串：`'1'`, `'true'`, `'TRUE'`, `'True'`, `'yes'`, `'YES'`, `'Yes'`, `'on'`, `'ON'`, `'On'`
- 数值：`true`, `1`

### 假值格式
- 字符串：`'0'`, `'false'`, `'FALSE'`, `'False'`, `'no'`, `'NO'`, `'No'`, `'off'`, `'OFF'`, `'Off'`
- 数值：`false`, `0`
- 空值：`null`, `undefined`, `''`

## 🔍 布尔判断

### isTrue

检查值是否为真值，支持多种真值表示形式。

```typescript
isTrue(value: any): boolean
```

**参数：**
- `value` - 要检查的值

**返回值：**
- `boolean` - 如果是真值则返回true，否则返回false

**支持的真值：**
- 字符串形式：`'1'`, `'true'`, `'TRUE'`, `'True'`, `'yes'`, `'YES'`, `'Yes'`, `'on'`, `'ON'`, `'On'`
- 布尔值和数字：`true`, `1`

**示例：**
```typescript
// 字符串形式
isTrue('1')        // true
isTrue('true')     // true
isTrue('TRUE')     // true
isTrue('yes')      // true
isTrue('YES')      // true
isTrue('on')       // true
isTrue('ON')       // true

// 布尔值和数字
isTrue(true)       // true
isTrue(1)          // true

// 假值
isTrue('0')        // false
isTrue('false')    // false
isTrue(false)      // false
isTrue(null)       // false
isTrue(undefined)  // false
isTrue('')         // false
isTrue(2)          // false (只有1被认为是真值)

// 实际应用场景
const userSettings = {
  darkMode: 'yes',
  notifications: '1',
  autoSave: true
}

Object.keys(userSettings).forEach(key => {
  if (isTrue(userSettings[key])) {
    console.log(`${key} 已启用`)
  }
})
```

### isFalse

检查值是否为假值，支持多种假值表示形式。

```typescript
isFalse(value: any): boolean
```

**参数：**
- `value` - 要检查的值

**返回值：**
- `boolean` - 如果是假值则返回true，否则返回false

**支持的假值：**
- 字符串形式：`'0'`, `'false'`, `'FALSE'`, `'False'`, `'no'`, `'NO'`, `'No'`, `'off'`, `'OFF'`, `'Off'`
- 布尔值和数字：`false`, `0`
- 空值：`null`, `undefined`, `''`

**示例：**
```typescript
// 字符串形式
isFalse('0')        // true
isFalse('false')    // true
isFalse('FALSE')    // true
isFalse('no')       // true
isFalse('NO')       // true
isFalse('off')      // true
isFalse('OFF')      // true

// 布尔值和数字
isFalse(false)      // true
isFalse(0)          // true

// null/undefined/空字符串
isFalse(null)       // true
isFalse(undefined)  // true
isFalse('')         // true

// 真值
isFalse('1')        // false
isFalse(true)       // false

// 实际应用：检查功能是否被禁用
const checkFeatureDisabled = (setting) => {
  if (isFalse(setting)) {
    console.log('功能已禁用')
    return true
  }
  return false
}

checkFeatureDisabled('off')     // true, 输出："功能已禁用"
checkFeatureDisabled(null)      // true, 输出："功能已禁用"
checkFeatureDisabled('on')      // false
```

## 🔄 类型转换

### toBoolString

将各种形式的布尔值转换为标准的 '1' 或 '0' 字符串。

```typescript
toBoolString(value: any): string
```

**参数：**
- `value` - 要转换的值

**返回值：**
- `string` - '1' 表示真值，'0' 表示假值

**示例：**
```typescript
// 各种真值转换
toBoolString(true)      // '1'
toBoolString('true')    // '1'
toBoolString('yes')     // '1'
toBoolString('ON')      // '1'
toBoolString(1)         // '1'

// 各种假值转换
toBoolString(false)     // '0'
toBoolString('false')   // '0'
toBoolString('no')      // '0'
toBoolString('OFF')     // '0'
toBoolString(0)         // '0'
toBoolString(null)      // '0'
toBoolString(undefined) // '0'
toBoolString('')        // '0'

// 实际应用：API参数标准化
const apiParams = {
  enabled: 'yes',
  visible: true,
  active: 'on',
  deleted: false
}

// 转换为标准格式发送给后端
const standardizedParams = {}
Object.keys(apiParams).forEach(key => {
  standardizedParams[key] = toBoolString(apiParams[key])
})

console.log(standardizedParams)
// { enabled: '1', visible: '1', active: '1', deleted: '0' }
```

### toBool

将各种形式的布尔值转换为标准的 boolean 类型。

```typescript
toBool(value: any): boolean
```

**参数：**
- `value` - 要转换的值

**返回值：**
- `boolean` - true 或 false

**示例：**
```typescript
// 字符串转布尔
toBool('1')        // true
toBool('true')     // true
toBool('yes')      // true
toBool('0')        // false
toBool('false')    // false
toBool('no')       // false

// 数字转布尔
toBool(1)          // true
toBool(0)          // false

// null/undefined转布尔
toBool(null)       // false
toBool(undefined)  // false

// 实际应用：配置项处理
const config = {
  debug: 'true',
  cache: '1',
  logging: 'yes',
  compress: 'false'
}

// 转换为原生布尔值
const booleanConfig = {}
Object.keys(config).forEach(key => {
  booleanConfig[key] = toBool(config[key])
})

console.log(booleanConfig)
// { debug: true, cache: true, logging: true, compress: false }

// 在条件判断中使用
if (toBool(config.debug)) {
  console.log('调试模式已启用')
}
```

## 🔀 状态切换

### toggleStatus

切换布尔值状态，支持多种输入格式，输出标准的 '1'/'0' 字符串。

```typescript
toggleStatus(value: any): string
```

**参数：**
- `value` - 当前值

**返回值：**
- `string` - 切换后的状态字符串 ('1' 或 '0')

**示例：**
```typescript
// 字符串切换
toggleStatus('1')      // '0'
toggleStatus('true')   // '0'
toggleStatus('yes')    // '0'
toggleStatus('0')      // '1'
toggleStatus('false')  // '1'
toggleStatus('no')     // '1'

// 布尔值切换
toggleStatus(true)     // '0'
toggleStatus(false)    // '1'

// null/undefined切换
toggleStatus(null)     // '1'
toggleStatus(undefined)// '1'
toggleStatus('')       // '1'

// 实际应用：开关切换
class ToggleSwitch {
  constructor(initialState = false) {
    this.state = toBoolString(initialState)
  }
  
  toggle() {
    this.state = toggleStatus(this.state)
    this.updateUI()
    return this.state
  }
  
  updateUI() {
    const isOn = isTrue(this.state)
    console.log(`开关状态: ${isOn ? '开启' : '关闭'}`)
  }
  
  getState() {
    return this.state
  }
  
  isOn() {
    return isTrue(this.state)
  }
}

const toggle = new ToggleSwitch('off')
console.log(toggle.getState())  // '0'
toggle.toggle()                 // '1', 输出："开关状态: 开启"
toggle.toggle()                 // '0', 输出："开关状态: 关闭"
```

## 💡 使用场景

### 1. 表单开关控件

```typescript
// Vue组件中的开关控件
export default {
  props: {
    value: [String, Boolean, Number],
    trueValue: { default: '1' },
    falseValue: { default: '0' }
  },
  
  computed: {
    isChecked() {
      return isTrue(this.value)
    },
    
    displayValue() {
      return this.isChecked ? this.trueValue : this.falseValue
    }
  },
  
  methods: {
    handleToggle() {
      const newValue = toggleStatus(this.value)
      this.$emit('input', newValue)
    }
  }
}

// 使用
<toggle-switch 
  v-model="settings.darkMode"
  true-value="yes"
  false-value="no"
/>
```

### 2. API数据处理

```typescript
// 后端返回的数据格式不统一
const apiResponse = {
  user: {
    isActive: 'true',
    emailVerified: 1,
    smsEnabled: 'yes',
    twoFactorAuth: 'on',
    newsletter: false,
    marketing: null
  }
}

// 统一转换为标准格式
const normalizeUserStatus = (user) => {
  return {
    isActive: toBool(user.isActive),
    emailVerified: toBool(user.emailVerified),
    smsEnabled: toBool(user.smsEnabled),
    twoFactorAuth: toBool(user.twoFactorAuth),
    newsletter: toBool(user.newsletter),
    marketing: toBool(user.marketing)
  }
}

const normalizedUser = normalizeUserStatus(apiResponse.user)
console.log(normalizedUser)
// {
//   isActive: true,
//   emailVerified: true,
//   smsEnabled: true,
//   twoFactorAuth: true,
//   newsletter: false,
//   marketing: false
// }
```

### 3. 配置文件处理

```typescript
// 环境变量和配置文件的布尔值处理
class ConfigManager {
  constructor() {
    this.config = this.loadConfig()
  }
  
  loadConfig() {
    // 从不同来源加载配置
    const envConfig = {
      DEBUG: process.env.DEBUG,
      CACHE_ENABLED: process.env.CACHE_ENABLED,
      LOG_REQUESTS: process.env.LOG_REQUESTS
    }
    
    const fileConfig = {
      compression: 'true',
      https: '1',
      cors: 'yes'
    }
    
    // 统一处理布尔值
    const processedConfig = {}
    
    Object.keys({...envConfig, ...fileConfig}).forEach(key => {
      const value = envConfig[key] || fileConfig[key]
      processedConfig[key.toLowerCase()] = toBool(value)
    })
    
    return processedConfig
  }
  
  get(key, defaultValue = false) {
    return this.config.hasOwnProperty(key) ? this.config[key] : toBool(defaultValue)
  }
  
  set(key, value) {
    this.config[key] = toBool(value)
  }
  
  toggle(key) {
    const currentValue = toBoolString(this.config[key])
    this.config[key] = toBool(toggleStatus(currentValue))
    return this.config[key]
  }
}

const config = new ConfigManager()
console.log(config.get('debug'))        // true/false
console.log(config.toggle('cache'))     // 切换缓存状态
```

### 4. 权限和功能开关

```typescript
// 功能开关管理
class FeatureToggle {
  constructor(features = {}) {
    this.features = this.normalizeFeatures(features)
  }
  
  normalizeFeatures(features) {
    const normalized = {}
    Object.keys(features).forEach(key => {
      normalized[key] = toBoolString(features[key])
    })
    return normalized
  }
  
  isEnabled(featureName) {
    return isTrue(this.features[featureName])
  }
  
  enable(featureName) {
    this.features[featureName] = '1'
  }
  
  disable(featureName) {
    this.features[featureName] = '0'
  }
  
  toggle(featureName) {
    this.features[featureName] = toggleStatus(this.features[featureName])
    return this.isEnabled(featureName)
  }
  
  getFeatureStatus() {
    const status = {}
    Object.keys(this.features).forEach(key => {
      status[key] = {
        enabled: this.isEnabled(key),
        value: this.features[key]
      }
    })
    return status
  }
}

// 使用示例
const features = new FeatureToggle({
  newDashboard: 'true',
  betaFeatures: 'on',
  experimentalUI: 1,
  advancedSearch: false,
  notifications: null
})

// 检查功能状态
if (features.isEnabled('newDashboard')) {
  console.log('显示新版仪表板')
}

// 切换功能
features.toggle('betaFeatures')
console.log('Beta功能状态:', features.isEnabled('betaFeatures'))

// 获取所有功能状态
console.log(features.getFeatureStatus())
```

### 5. 表单验证和数据转换

```typescript
// 表单数据处理器
class FormDataProcessor {
  constructor() {
    this.booleanFields = new Set()
  }
  
  // 注册布尔字段
  registerBooleanField(fieldName) {
    this.booleanFields.add(fieldName)
    return this
  }
  
  // 处理表单数据
  processFormData(formData) {
    const processed = { ...formData }
    
    // 处理布尔字段
    this.booleanFields.forEach(fieldName => {
      if (processed.hasOwnProperty(fieldName)) {
        processed[fieldName] = toBoolString(processed[fieldName])
      }
    })
    
    return processed
  }
  
  // 验证布尔字段
  validateBooleanField(value) {
    return isTrue(value) || isFalse(value)
  }
  
  // 创建切换函数
  createToggler(object, fieldName) {
    return () => {
      if (this.booleanFields.has(fieldName)) {
        object[fieldName] = toggleStatus(object[fieldName])
        return isTrue(object[fieldName])
      }
      return false
    }
  }
}

// 使用示例
const processor = new FormDataProcessor()
  .registerBooleanField('subscribe')
  .registerBooleanField('agreeTerms')
  .registerBooleanField('receiveEmails')

// 表单提交处理
const handleFormSubmit = (rawFormData) => {
  const processedData = processor.processFormData(rawFormData)
  
  // 验证必要的布尔字段
  if (!isTrue(processedData.agreeTerms)) {
    throw new Error('必须同意服务条款')
  }
  
  return submitToAPI(processedData)
}

// 原始表单数据（来自不同来源，格式不统一）
const rawFormData = {
  name: 'John Doe',
  email: 'john@example.com',
  subscribe: 'yes',      // 字符串
  agreeTerms: true,      // 布尔值
  receiveEmails: 1,      // 数字
  newsletter: 'on'       // 字符串
}

// 处理后的数据（统一为 '1'/'0' 格式）
const processedData = processor.processFormData(rawFormData)
console.log(processedData)
// {
//   name: 'John Doe',
//   email: 'john@example.com',
//   subscribe: '1',
//   agreeTerms: '1',
//   receiveEmails: '1',
//   newsletter: '1'
// }
```

### 6. 状态管理

```typescript
// Vuex/Redux 状态管理中的布尔值处理
const settingsModule = {
  state: {
    darkMode: '0',
    notifications: '1',
    autoSave: '0',
    soundEnabled: '1'
  },
  
  mutations: {
    SET_SETTING(state, { key, value }) {
      state[key] = toBoolString(value)
    },
    
    TOGGLE_SETTING(state, key) {
      if (state.hasOwnProperty(key)) {
        state[key] = toggleStatus(state[key])
      }
    },
    
    RESET_SETTINGS(state) {
      Object.keys(state).forEach(key => {
        state[key] = '0'
      })
    }
  },
  
  actions: {
    updateSetting({ commit }, { key, value }) {
      commit('SET_SETTING', { key, value })
      // 保存到本地存储
      localStorage.setItem(`setting_${key}`, toBoolString(value))
    },
    
    toggleSetting({ commit }, key) {
      commit('TOGGLE_SETTING', key)
      // 保存到本地存储
      const newValue = this.getters.getSetting(key)
      localStorage.setItem(`setting_${key}`, newValue)
    },
    
    loadSettings({ commit }) {
      const settings = ['darkMode', 'notifications', 'autoSave', 'soundEnabled']
      settings.forEach(key => {
        const saved = localStorage.getItem(`setting_${key}`)
        if (saved !== null) {
          commit('SET_SETTING', { key, value: saved })
        }
      })
    }
  },
  
  getters: {
    getSetting: (state) => (key) => state[key],
    isSettingEnabled: (state) => (key) => isTrue(state[key]),
    getEnabledSettings: (state) => {
      return Object.keys(state).filter(key => isTrue(state[key]))
    }
  }
}

// 使用示例
store.dispatch('toggleSetting', 'darkMode')
console.log(store.getters.isSettingEnabled('darkMode'))  // true/false
console.log(store.getters.getEnabledSettings())          // ['notifications', 'soundEnabled']
```

### 7. 数据库查询条件

```typescript
// 数据库查询条件构建
class QueryBuilder {
  constructor() {
    this.conditions = []
    this.booleanMappings = {
      active: 'is_active',
      deleted: 'is_deleted',
      published: 'is_published',
      verified: 'is_verified'
    }
  }
  
  // 添加布尔条件
  whereBool(field, value) {
    const dbField = this.booleanMappings[field] || field
    const boolValue = toBool(value)
    this.conditions.push(`${dbField} = ${boolValue ? 1 : 0}`)
    return this
  }
  
  // 添加多个布尔条件
  whereBools(conditions) {
    Object.keys(conditions).forEach(field => {
      this.whereBool(field, conditions[field])
    })
    return this
  }
  
  // 构建SQL
  toSQL() {
    return this.conditions.length > 0 
      ? 'WHERE ' + this.conditions.join(' AND ')
      : ''
  }
}

// 使用示例
const query = new QueryBuilder()
  .whereBool('active', 'true')      // 活跃用户
  .whereBool('deleted', false)      // 未删除
  .whereBool('verified', 'yes')     // 已验证

console.log(query.toSQL())
// "WHERE is_active = 1 AND is_deleted = 0 AND is_verified = 1"

// 批量条件
const filters = {
  active: '1',
  published: 'yes',
  deleted: false
}

const batchQuery = new QueryBuilder().whereBools(filters)
console.log(batchQuery.toSQL())
```

### 8. URL参数处理

```typescript
// URL查询参数的布尔值处理
class URLParamsManager {
  constructor() {
    this.booleanParams = new Set()
  }
  
  // 注册布尔参数
  registerBooleanParam(paramName) {
    this.booleanParams.add(paramName)
    return this
  }
  
  // 从URL获取参数
  getParams() {
    const params = new URLSearchParams(window.location.search)
    const result = {}
    
    for (const [key, value] of params.entries()) {
      if (this.booleanParams.has(key)) {
        result[key] = toBool(value)
      } else {
        result[key] = value
      }
    }
    
    return result
  }
  
  // 设置参数到URL
  setParams(params) {
    const url = new URL(window.location)
    
    Object.keys(params).forEach(key => {
      const value = params[key]
      if (this.booleanParams.has(key)) {
        // 布尔参数转换为 '1'/'0'
        url.searchParams.set(key, toBoolString(value))
      } else {
        url.searchParams.set(key, value)
      }
    })
    
    window.history.replaceState({}, '', url)
  }
  
  // 切换布尔参数
  toggleParam(paramName) {
    if (this.booleanParams.has(paramName)) {
      const params = this.getParams()
      const currentValue = params[paramName] || false
      params[paramName] = !currentValue
      this.setParams(params)
      return params[paramName]
    }
    return false
  }
}

// 使用示例
const urlManager = new URLParamsManager()
  .registerBooleanParam('debug')
  .registerBooleanParam('preview')
  .registerBooleanParam('mobile')

// 读取URL参数：https://example.com?debug=true&preview=1&mobile=yes
const params = urlManager.getParams()
console.log(params)
// { debug: true, preview: true, mobile: true }

// 设置参数
urlManager.setParams({
  debug: false,
  preview: 'on',
  mobile: true,
  page: '1'
})
// URL变为：https://example.com?debug=0&preview=1&mobile=1&page=1

// 切换参数
urlManager.toggleParam('debug')  // 切换debug状态
```

## 🎯 最佳实践

### 1. 统一数据格式
在项目中建立统一的布尔值处理标准：

```typescript
// 项目配置文件
const BOOLEAN_CONFIG = {
  // API传输格式：使用 '1'/'0' 字符串
  apiFormat: 'string',  // '1'/'0'
  
  // 内部处理格式：使用原生boolean
  internalFormat: 'boolean',  // true/false
  
  // 存储格式：使用 '1'/'0' 字符串
  storageFormat: 'string'  // '1'/'0'
}

// 统一转换器
class BooleanConverter {
  // API发送前转换
  toApiFormat(value) {
    return toBoolString(value)
  }
  
  // API接收后转换
  fromApiFormat(value) {
    return toBool(value)
  }
  
  // 存储前转换
  toStorageFormat(value) {
    return toBoolString(value)
  }
  
  // 存储后转换
  fromStorageFormat(value) {
    return toBool(value)
  }
}
```

### 2. 错误处理和边界情况

```typescript
// 安全的布尔值处理器
class SafeBooleanHandler {
  static process(value, defaultValue = false, strict = false) {
    try {
      // 严格模式：只接受明确的布尔值格式
      if (strict) {
        const validTrueValues = ['1', 'true', 'yes', 'on', true, 1]
        const validFalseValues = ['0', 'false', 'no', 'off', false, 0, null, undefined, '']
        
        if (!validTrueValues.includes(value) && !validFalseValues.includes(value)) {
          console.warn(`Invalid boolean value: ${value}, using default: ${defaultValue}`)
          return toBool(defaultValue)
        }
      }
      
      return toBool(value)
    } catch (error) {
      console.error('Boolean processing error:', error)
      return toBool(defaultValue)
    }
  }
  
  static processArray(values, defaultValue = false) {
    return values.map(value => this.process(value, defaultValue))
  }
  
  static processObject(obj, booleanFields = [], defaultValue = false) {
    const result = { ...obj }
    booleanFields.forEach(field => {
      if (result.hasOwnProperty(field)) {
        result[field] = this.process(result[field], defaultValue)
      }
    })
    return result
  }
}

// 使用示例
const userData = {
  name: 'John',
  isActive: 'maybe',  // 无效值
  isVerified: 'true',
  hasNotifications: undefined
}

const processedUser = SafeBooleanHandler.processObject(
  userData,
  ['isActive', 'isVerified', 'hasNotifications'],
  false  // 默认值
)

console.log(processedUser)
// {
//   name: 'John',
//   isActive: false,     // 使用默认值，并有警告日志
//   isVerified: true,
//   hasNotifications: false
// }
```

## ⚠️ 注意事项

1. **类型一致性**：在项目中保持布尔值格式的一致性，建议统一使用 '1'/'0' 或 true/false
2. **数据验证**：对于重要的布尔值，要进行严格的格式验证
3. **默认值处理**：为undefined或null的布尔值设置合理的默认值
4. **性能考虑**：频繁的类型转换可能影响性能，考虑缓存或批量处理
5. **调试友好**：在开发环境下记录布尔值转换的日志，便于调试
