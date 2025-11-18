# 存储工具 Storage

## 介绍

存储工具(cache)是RuoYi-Plus-UniApp移动端应用的核心基础设施,提供了基于UniApp原生存储API的优化缓存封装。它充分利用UniApp的多类型存储和自动序列化特性,实现了高性能、类型安全、易用的本地数据持久化方案。

移动端应用需要频繁地存储各类数据,包括用户配置、登录凭证、业务数据缓存、临时状态等。cache工具通过统一的API接口、自动过期管理、应用前缀隔离、类型安全等特性,为开发者提供了简单而强大的缓存解决方案,大幅提升了应用的用户体验和开发效率。

**核心特性**:

- **同步操作** - 基于UniApp的同步存储API,性能更好,避免异步回调嵌套
- **多类型支持** - 原生支持字符串、数字、布尔值、对象、数组等各种数据类型
- **自动序列化** - UniApp自动处理序列化和反序列化,保持数据类型不变
- **过期时间** - 支持为每个缓存项设置过期时间(秒为单位),过期后自动失效
- **应用前缀** - 自动添加应用前缀,防止多应用数据冲突
- **自动清理** - 应用启动和定期清理过期数据,保持存储空间整洁
- **TypeScript泛型** - 完整的TypeScript泛型支持,提供类型安全和智能提示
- **统计信息** - 提供存储使用统计,帮助监控和优化存储空间
- **错误处理** - 完善的异常捕获和错误处理机制
- **调试支持** - 提供调试工具方法,方便开发调试

## 基本用法

### 1. 存储字符串数据

最基础的用法是存储字符串类型的数据。cache工具自动为键名添加应用前缀,避免多应用数据冲突。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">主题设置</text>
      <button @click="saveTheme('light')">保存亮色主题</button>
      <button @click="saveTheme('dark')">保存暗色主题</button>
      <button @click="loadTheme">读取主题</button>
      <text v-if="currentTheme">当前主题: {{ currentTheme }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { cache } from '@/utils/cache'

const currentTheme = ref<string>('')

// 保存主题配置
const saveTheme = (theme: string) => {
  const success = cache.set('theme', theme)
  if (success) {
    uni.showToast({
      title: `主题 ${theme} 已保存`,
      icon: 'success',
    })
    currentTheme.value = theme
  } else {
    uni.showToast({
      title: '保存失败',
      icon: 'error',
    })
  }
}

// 读取主题配置
const loadTheme = () => {
  const theme = cache.get<string>('theme')
  if (theme) {
    currentTheme.value = theme
    uni.showToast({
      title: `读取到主题: ${theme}`,
      icon: 'none',
    })
  } else {
    uni.showToast({
      title: '未找到主题配置',
      icon: 'none',
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

button {
  margin-bottom: 20rpx;
}
</style>
```

**使用说明**:
- 使用 `cache.set(key, value)` 存储字符串数据
- 使用 `cache.get<string>(key)` 读取字符串数据,指定泛型类型获得类型提示
- set方法返回布尔值表示是否成功,失败时应给予用户提示
- get方法返回数据或null,需要判断null情况

### 2. 存储数字和布尔值

cache工具原生支持数字和布尔值类型,无需手动转换,自动保持类型不变。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">计数器</text>
      <text>当前计数: {{ count }}</text>
      <button @click="incrementAndSave">增加</button>
      <button @click="loadCount">读取计数</button>
    </view>

    <view class="section">
      <text class="title">功能开关</text>
      <text>通知已{{ notificationEnabled ? '开启' : '关闭' }}</text>
      <button @click="toggleNotification">切换通知</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { cache } from '@/utils/cache'

const count = ref<number>(0)
const notificationEnabled = ref<boolean>(true)

// 增加计数并保存
const incrementAndSave = () => {
  count.value++
  cache.set('count', count.value)
  uni.showToast({
    title: `计数已增加到 ${count.value}`,
    icon: 'success',
  })
}

// 读取计数
const loadCount = () => {
  const savedCount = cache.get<number>('count')
  if (savedCount !== null) {
    count.value = savedCount
    uni.showToast({
      title: `读取到计数: ${savedCount}`,
      icon: 'none',
    })
  } else {
    uni.showToast({
      title: '未找到计数数据',
      icon: 'none',
    })
  }
}

// 切换通知开关
const toggleNotification = () => {
  notificationEnabled.value = !notificationEnabled.value
  cache.set('notificationEnabled', notificationEnabled.value)
  uni.showToast({
    title: notificationEnabled.value ? '通知已开启' : '通知已关闭',
    icon: 'success',
  })
}

// 页面加载时恢复状态
onMounted(() => {
  const savedCount = cache.get<number>('count')
  if (savedCount !== null) {
    count.value = savedCount
  }

  const savedNotification = cache.get<boolean>('notificationEnabled')
  if (savedNotification !== null) {
    notificationEnabled.value = savedNotification
  }
})
</script>
```

**技术实现**:
- 数字类型直接存储为number,读取时保持number类型
- 布尔值直接存储为boolean,读取时保持boolean类型
- 无需手动调用 `toString()` 或 `parseInt()`
- UniApp的底层自动处理类型序列化和反序列化

### 3. 存储对象和数组

cache工具最强大的特性之一是可以直接存储复杂的对象和数组,自动序列化和反序列化。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">用户信息</text>
      <button @click="saveUserInfo">保存用户信息</button>
      <button @click="loadUserInfo">读取用户信息</button>
      <view v-if="userInfo" class="info">
        <text>姓名: {{ userInfo.name }}</text>
        <text>年龄: {{ userInfo.age }}</text>
        <text>邮箱: {{ userInfo.email }}</text>
      </view>
    </view>

    <view class="section">
      <text class="title">标签列表</text>
      <button @click="saveTags">保存标签</button>
      <button @click="loadTags">读取标签</button>
      <view v-if="tags.length > 0" class="tags">
        <text v-for="tag in tags" :key="tag" class="tag">{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { cache } from '@/utils/cache'

// 定义用户信息接口
interface UserInfo {
  id: number
  name: string
  age: number
  email: string
  roles: string[]
}

const userInfo = ref<UserInfo | null>(null)
const tags = ref<string[]>([])

// 保存用户信息
const saveUserInfo = () => {
  const user: UserInfo = {
    id: 1,
    name: '张三',
    age: 28,
    email: 'zhangsan@example.com',
    roles: ['admin', 'user'],
  }

  const success = cache.set('userInfo', user)
  if (success) {
    userInfo.value = user
    uni.showToast({
      title: '用户信息已保存',
      icon: 'success',
    })
  }
}

// 读取用户信息
const loadUserInfo = () => {
  const user = cache.get<UserInfo>('userInfo')
  if (user) {
    userInfo.value = user
    // 验证类型保持不变
    console.log('用户ID类型:', typeof user.id) // 'number'
    console.log('用户角色:', user.roles) // ['admin', 'user']
    uni.showToast({
      title: '用户信息已加载',
      icon: 'success',
    })
  } else {
    uni.showToast({
      title: '未找到用户信息',
      icon: 'none',
    })
  }
}

// 保存标签列表
const saveTags = () => {
  const tagList = ['前端', '移动端', 'UniApp', 'Vue3', 'TypeScript']
  const success = cache.set('tags', tagList)
  if (success) {
    tags.value = tagList
    uni.showToast({
      title: `已保存 ${tagList.length} 个标签`,
      icon: 'success',
    })
  }
}

// 读取标签列表
const loadTags = () => {
  const tagList = cache.get<string[]>('tags')
  if (tagList && Array.isArray(tagList)) {
    tags.value = tagList
    uni.showToast({
      title: `已加载 ${tagList.length} 个标签`,
      icon: 'success',
    })
  } else {
    uni.showToast({
      title: '未找到标签数据',
      icon: 'none',
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.info {
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;

  text {
    display: block;
    margin-bottom: 10rpx;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  padding: 10rpx 20rpx;
  background-color: #409eff;
  color: white;
  border-radius: 4rpx;
  font-size: 24rpx;
}

button {
  margin-bottom: 20rpx;
}
</style>
```

**技术实现**:
- 对象存储时自动调用 `JSON.stringify()` 序列化
- 读取时自动调用 `JSON.parse()` 反序列化
- 嵌套对象和数组都能正确处理
- 使用TypeScript泛型 `cache.get<UserInfo>()` 获得完整类型提示

### 4. 设置过期时间

cache工具支持为每个缓存项设置过期时间,过期后数据自动失效并返回null。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">验证码缓存</text>
      <button @click="sendCode">发送验证码(60秒)</button>
      <button @click="checkCode">检查验证码</button>
      <text v-if="code">验证码: {{ code }}</text>
      <text v-if="remainingTime > 0">剩余时间: {{ remainingTime }}秒</text>
    </view>

    <view class="section">
      <text class="title">临时Token</text>
      <button @click="saveToken">保存临时Token(5分钟)</button>
      <button @click="checkToken">检查Token</button>
      <text v-if="token">Token: {{ token }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { cache } from '@/utils/cache'

const code = ref<string>('')
const token = ref<string>('')
const remainingTime = ref<number>(0)

// 发送验证码(60秒过期)
const sendCode = () => {
  const verifyCode = Math.random().toString().slice(-6)

  // 设置60秒过期
  const success = cache.set('verifyCode', verifyCode, 60)

  if (success) {
    code.value = verifyCode
    remainingTime.value = 60

    // 倒计时
    const timer = setInterval(() => {
      remainingTime.value--
      if (remainingTime.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    uni.showToast({
      title: '验证码已发送',
      icon: 'success',
    })
  }
}

// 检查验证码
const checkCode = () => {
  const savedCode = cache.get<string>('verifyCode')
  if (savedCode) {
    code.value = savedCode
    uni.showToast({
      title: '验证码仍有效',
      icon: 'success',
    })
  } else {
    code.value = ''
    remainingTime.value = 0
    uni.showToast({
      title: '验证码已过期',
      icon: 'none',
    })
  }
}

// 保存临时Token(5分钟过期)
const saveToken = () => {
  const tempToken = 'temp_' + Date.now()

  // 设置5分钟(300秒)过期
  const success = cache.set('tempToken', tempToken, 300)

  if (success) {
    token.value = tempToken
    uni.showToast({
      title: 'Token已保存(5分钟)',
      icon: 'success',
    })
  }
}

// 检查Token
const checkToken = () => {
  const savedToken = cache.get<string>('tempToken')
  if (savedToken) {
    token.value = savedToken
    uni.showToast({
      title: 'Token仍有效',
      icon: 'success',
    })
  } else {
    token.value = ''
    uni.showToast({
      title: 'Token已过期',
      icon: 'none',
    })
  }
}
</script>
```

**技术实现**:
- `cache.set(key, value, expireSeconds)` 第三个参数为过期时间(秒)
- 过期时间内部转换为时间戳存储: `Date.now() + expireSeconds * 1000`
- 读取时自动检查时间戳,过期则删除并返回null
- 不传过期时间则数据永不过期

### 5. 检查缓存存在性

使用has方法可以快速检查缓存项是否存在且未过期,无需实际读取数据。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">登录状态检查</text>
      <button @click="checkLoginStatus">检查登录状态</button>
      <view v-if="isLoggedIn !== null" class="status">
        <text :class="isLoggedIn ? 'success' : 'error'">
          {{ isLoggedIn ? '已登录' : '未登录' }}
        </text>
      </view>
    </view>

    <view class="section">
      <text class="title">配置检查</text>
      <button @click="checkConfig">检查配置</button>
      <view v-if="configStatus.length > 0" class="config-list">
        <view v-for="item in configStatus" :key="item.key" class="config-item">
          <text>{{ item.label }}</text>
          <text :class="item.exists ? 'exists' : 'missing'">
            {{ item.exists ? '✓' : '✗' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { cache } from '@/utils/cache'

const isLoggedIn = ref<boolean | null>(null)
const configStatus = ref<Array<{ key: string; label: string; exists: boolean }>>([])

// 检查登录状态
const checkLoginStatus = () => {
  const hasToken = cache.has('userToken')
  const hasUserInfo = cache.has('userInfo')

  isLoggedIn.value = hasToken && hasUserInfo

  uni.showToast({
    title: isLoggedIn.value ? '用户已登录' : '用户未登录',
    icon: isLoggedIn.value ? 'success' : 'none',
  })
}

// 检查配置项
const checkConfig = () => {
  const configs = [
    { key: 'theme', label: '主题配置' },
    { key: 'language', label: '语言配置' },
    { key: 'fontSize', label: '字体大小' },
    { key: 'notificationEnabled', label: '通知开关' },
    { key: 'autoUpdate', label: '自动更新' },
  ]

  configStatus.value = configs.map((config) => ({
    ...config,
    exists: cache.has(config.key),
  }))

  const existsCount = configStatus.value.filter((item) => item.exists).length
  uni.showToast({
    title: `${existsCount}/${configs.length} 项配置已设置`,
    icon: 'none',
  })
}
</script>
```

**使用说明**:
- `cache.has(key)` 内部调用 `cache.get(key)` 并判断是否为null
- 如果缓存项存在且未过期返回true,否则返回false
- 适用于只需要判断存在性,不需要读取数据的场景

### 6. 删除缓存项

使用remove方法可以手动删除指定的缓存项。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">缓存管理</text>
      <button @click="saveData">保存测试数据</button>
      <button @click="removeData">删除测试数据</button>
      <button @click="checkData">检查数据</button>
      <text v-if="dataExists !== null">
        数据状态: {{ dataExists ? '存在' : '不存在' }}
      </text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { cache } from '@/utils/cache'

const dataExists = ref<boolean | null>(null)

// 保存测试数据
const saveData = () => {
  cache.set('testData', { value: 'test', timestamp: Date.now() })
  dataExists.value = true
  uni.showToast({
    title: '数据已保存',
    icon: 'success',
  })
}

// 删除测试数据
const removeData = () => {
  cache.remove('testData')
  dataExists.value = false
  uni.showToast({
    title: '数据已删除',
    icon: 'success',
  })
}

// 检查数据
const checkData = () => {
  dataExists.value = cache.has('testData')
  uni.showToast({
    title: dataExists.value ? '数据存在' : '数据不存在',
    icon: 'none',
  })
}
</script>
```

**技术实现**:
- `cache.remove(key)` 内部调用 `uni.removeStorageSync(prefixedKey)`
- 自动处理key前缀,开发者无需关心
- 删除不存在的key不会报错,可以安全调用

### 7. 清除所有缓存

clearAll方法可以一次性清除当前应用的所有缓存数据。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">缓存统计</text>
      <view v-if="stats" class="stats">
        <view class="stat-item">
          <text class="label">应用缓存项:</text>
          <text class="value">{{ stats.appKeys }}</text>
        </view>
        <view class="stat-item">
          <text class="label">使用空间:</text>
          <text class="value">{{ formatSize(stats.currentSize) }}</text>
        </view>
      </view>
      <button @click="refreshStats">刷新统计</button>
    </view>

    <view class="section">
      <text class="title">清除缓存</text>
      <button type="warn" @click="confirmClear">清除所有缓存</button>
      <text class="warning">⚠️ 此操作将清除所有应用数据,包括登录状态</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { cache } from '@/utils/cache'

interface Stats {
  totalKeys: number
  appKeys: number
  currentSize: number
  limitSize: number
  usagePercent: number
}

const stats = ref<Stats | null>(null)

// 刷新统计信息
const refreshStats = () => {
  stats.value = cache.getStats()
}

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

// 确认清除
const confirmClear = () => {
  uni.showModal({
    title: '确认清除',
    content: '此操作将清除所有应用缓存数据,是否继续?',
    confirmColor: '#f56c6c',
    success: (res) => {
      if (res.confirm) {
        clearAllCache()
      }
    },
  })
}

// 清除所有缓存
const clearAllCache = () => {
  cache.clearAll()
  stats.value = cache.getStats()
  uni.showToast({
    title: '缓存已清除',
    icon: 'success',
  })
}

onMounted(() => {
  refreshStats()
})
</script>
```

**使用说明**:
- `cache.clearAll()` 只清除带应用前缀的缓存项
- 不会影响其他应用或系统的存储数据
- 清除操作不可恢复,建议添加二次确认

## 高级用法

### 1. 用户配置持久化

将用户的应用配置自动保存到缓存,实现配置持久化。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">应用配置</text>

      <view class="config-item">
        <text>主题模式</text>
        <picker :value="themeIndex" :range="themes" @change="onThemeChange">
          <view class="picker">{{ themes[themeIndex] }}</view>
        </picker>
      </view>

      <view class="config-item">
        <text>字体大小</text>
        <slider
          :value="fontSize"
          :min="12"
          :max="24"
          :step="2"
          show-value
          @change="onFontSizeChange"
        />
      </view>

      <view class="config-item">
        <text>消息通知</text>
        <switch :checked="enableNotification" @change="onNotificationChange" />
      </view>

      <button @click="resetConfig">恢复默认配置</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { cache } from '@/utils/cache'

interface AppConfig {
  theme: string
  fontSize: number
  enableNotification: boolean
}

const themes = ['light', 'dark', 'auto']
const themeIndex = ref<number>(0)
const fontSize = ref<number>(16)
const enableNotification = ref<boolean>(true)

// 默认配置
const defaultConfig: AppConfig = {
  theme: 'light',
  fontSize: 16,
  enableNotification: true,
}

// 加载配置
const loadConfig = () => {
  const config = cache.get<AppConfig>('appConfig')
  if (config) {
    themeIndex.value = themes.indexOf(config.theme)
    fontSize.value = config.fontSize
    enableNotification.value = config.enableNotification
  }
}

// 保存配置
const saveConfig = () => {
  const config: AppConfig = {
    theme: themes[themeIndex.value],
    fontSize: fontSize.value,
    enableNotification: enableNotification.value,
  }
  cache.set('appConfig', config)
}

// 主题变更
const onThemeChange = (e: any) => {
  themeIndex.value = e.detail.value
  saveConfig()
}

// 字体大小变更
const onFontSizeChange = (e: any) => {
  fontSize.value = e.detail.value
  saveConfig()
}

// 通知开关变更
const onNotificationChange = (e: any) => {
  enableNotification.value = e.detail.value
  saveConfig()
}

// 恢复默认配置
const resetConfig = () => {
  uni.showModal({
    title: '确认重置',
    content: '确定要恢复默认配置吗?',
    success: (res) => {
      if (res.confirm) {
        cache.set('appConfig', defaultConfig)
        loadConfig()
        uni.showToast({
          title: '已恢复默认配置',
          icon: 'success',
        })
      }
    },
  })
}

onMounted(() => {
  loadConfig()
})
</script>
```

**实现要点**:
- 使用对象存储所有配置项
- 配置变更时立即保存
- 应用启动时自动加载配置
- 提供恢复默认配置功能

### 2. 表单草稿自动保存

在用户填写表单时自动保存草稿,防止数据丢失。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">填写反馈</text>

      <view class="form-item">
        <text>标题</text>
        <input v-model="formData.title" placeholder="请输入标题" />
      </view>

      <view class="form-item">
        <text>内容</text>
        <textarea v-model="formData.content" placeholder="请输入反馈内容" />
      </view>

      <view class="form-item">
        <text>联系方式</text>
        <input v-model="formData.contact" placeholder="请输入联系方式" />
      </view>

      <view class="draft-info">
        <text v-if="draftSavedTime">
          草稿已保存: {{ formatTime(draftSavedTime) }}
        </text>
      </view>

      <button @click="submitForm">提交</button>
      <button @click="clearDraft">清除草稿</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { cache } from '@/utils/cache'

interface FormData {
  title: string
  content: string
  contact: string
}

const DRAFT_KEY = 'feedbackDraft'
const DRAFT_EXPIRE = 7 * 24 * 3600 // 7天过期

const formData = ref<FormData>({
  title: '',
  content: '',
  contact: '',
})

const draftSavedTime = ref<number>(0)

// 保存草稿
const saveDraft = () => {
  const draft = {
    ...formData.value,
    savedAt: Date.now(),
  }
  cache.set(DRAFT_KEY, draft, DRAFT_EXPIRE)
  draftSavedTime.value = Date.now()
}

// 加载草稿
const loadDraft = () => {
  const draft = cache.get<FormData & { savedAt: number }>(DRAFT_KEY)
  if (draft) {
    formData.value = {
      title: draft.title,
      content: draft.content,
      contact: draft.contact,
    }
    draftSavedTime.value = draft.savedAt

    uni.showToast({
      title: '已恢复草稿',
      icon: 'none',
    })
  }
}

// 清除草稿
const clearDraft = () => {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除草稿吗?',
    success: (res) => {
      if (res.confirm) {
        cache.remove(DRAFT_KEY)
        formData.value = { title: '', content: '', contact: '' }
        draftSavedTime.value = 0
        uni.showToast({
          title: '草稿已清除',
          icon: 'success',
        })
      }
    },
  })
}

// 提交表单
const submitForm = () => {
  if (!formData.value.title || !formData.value.content) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none',
    })
    return
  }

  // 提交成功后清除草稿
  cache.remove(DRAFT_KEY)
  uni.showToast({
    title: '提交成功',
    icon: 'success',
  })
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return `${date.getHours()}:${date.getMinutes()}`
}

// 监听表单变化自动保存草稿
watch(
  formData,
  () => {
    if (formData.value.title || formData.value.content || formData.value.contact) {
      saveDraft()
    }
  },
  { deep: true }
)

onMounted(() => {
  loadDraft()
})
</script>
```

**实现要点**:
- 使用watch监听表单数据变化
- 数据变更时自动保存草稿
- 设置7天过期时间避免占用空间
- 提交成功后清除草稿

### 3. 离线数据缓存

缓存API响应数据,实现离线访问功能。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">文章列表</text>
      <button @click="fetchArticles">刷新数据</button>
      <view v-if="isOffline" class="offline-tip">
        <text>📡 当前显示缓存数据</text>
      </view>

      <view v-if="articles.length > 0" class="article-list">
        <view v-for="article in articles" :key="article.id" class="article-item">
          <text class="title">{{ article.title }}</text>
          <text class="date">{{ article.date }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { cache } from '@/utils/cache'

interface Article {
  id: number
  title: string
  date: string
}

const CACHE_KEY = 'articles'
const CACHE_EXPIRE = 3600 // 1小时过期

const articles = ref<Article[]>([])
const isOffline = ref<boolean>(false)

// 获取文章列表
const fetchArticles = async () => {
  uni.showLoading({ title: '加载中...' })

  try {
    // 模拟API请求
    const response = await mockApiRequest()
    articles.value = response.data

    // 缓存响应数据
    cache.set(CACHE_KEY, response.data, CACHE_EXPIRE)
    isOffline.value = false

    uni.hideLoading()
    uni.showToast({
      title: '数据已更新',
      icon: 'success',
    })
  } catch (error) {
    // 网络错误时读取缓存
    loadCachedArticles()
  }
}

// 加载缓存数据
const loadCachedArticles = () => {
  const cached = cache.get<Article[]>(CACHE_KEY)
  if (cached) {
    articles.value = cached
    isOffline.value = true
    uni.hideLoading()
    uni.showToast({
      title: '显示缓存数据',
      icon: 'none',
    })
  } else {
    uni.hideLoading()
    uni.showToast({
      title: '暂无数据',
      icon: 'none',
    })
  }
}

// 模拟API请求
const mockApiRequest = (): Promise<{ data: Article[] }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟50%概率网络错误
      if (Math.random() > 0.5) {
        resolve({
          data: [
            { id: 1, title: '文章标题1', date: '2024-01-01' },
            { id: 2, title: '文章标题2', date: '2024-01-02' },
          ],
        })
      } else {
        reject(new Error('Network error'))
      }
    }, 1000)
  })
}

onMounted(() => {
  // 先尝试加载缓存,再请求新数据
  loadCachedArticles()
  fetchArticles()
})
</script>
```

**实现要点**:
- 成功请求后缓存响应数据
- 网络错误时读取缓存数据
- 设置合理的过期时间
- 显示离线状态提示

### 4. 搜索历史记录

记录用户的搜索历史,方便快速搜索。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">搜索</text>
      <view class="search-box">
        <input v-model="searchText" placeholder="请输入搜索内容" @confirm="onSearch" />
        <button @click="onSearch">搜索</button>
      </view>

      <view v-if="history.length > 0" class="history-section">
        <view class="history-header">
          <text>搜索历史</text>
          <text class="clear-btn" @click="clearHistory">清空</text>
        </view>
        <view class="history-list">
          <view
            v-for="(item, index) in history"
            :key="index"
            class="history-item"
            @click="onHistoryClick(item)"
          >
            <text>{{ item }}</text>
            <text class="delete-btn" @click.stop="deleteHistory(index)">×</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { cache } from '@/utils/cache'

const HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10

const searchText = ref<string>('')
const history = ref<string[]>([])

// 加载历史记录
const loadHistory = () => {
  const saved = cache.get<string[]>(HISTORY_KEY)
  if (saved && Array.isArray(saved)) {
    history.value = saved
  }
}

// 保存历史记录
const saveHistory = () => {
  cache.set(HISTORY_KEY, history.value)
}

// 执行搜索
const onSearch = () => {
  const text = searchText.value.trim()
  if (!text) {
    return
  }

  // 添加到历史记录
  addToHistory(text)

  // 执行搜索逻辑
  console.log('搜索:', text)
  uni.showToast({
    title: `搜索: ${text}`,
    icon: 'none',
  })
}

// 添加到历史记录
const addToHistory = (text: string) => {
  // 移除重复项
  const index = history.value.indexOf(text)
  if (index > -1) {
    history.value.splice(index, 1)
  }

  // 添加到开头
  history.value.unshift(text)

  // 限制数量
  if (history.value.length > MAX_HISTORY) {
    history.value = history.value.slice(0, MAX_HISTORY)
  }

  saveHistory()
}

// 点击历史记录
const onHistoryClick = (text: string) => {
  searchText.value = text
  onSearch()
}

// 删除单条历史
const deleteHistory = (index: number) => {
  history.value.splice(index, 1)
  saveHistory()
}

// 清空历史记录
const clearHistory = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有搜索历史吗?',
    success: (res) => {
      if (res.confirm) {
        history.value = []
        cache.remove(HISTORY_KEY)
        uni.showToast({
          title: '已清空',
          icon: 'success',
        })
      }
    },
  })
}

onMounted(() => {
  loadHistory()
})
</script>
```

**实现要点**:
- 搜索时自动添加到历史记录
- 去重复,最新的排在前面
- 限制历史记录数量
- 支持删除单条和清空全部

## API

### cache.set

设置缓存数据。

**类型签名**:
```typescript
set<T>(key: string, value: T, expireSeconds?: number): boolean
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | `string` | 是 | 缓存键名 |
| value | `T` | 是 | 缓存值,支持任意类型 |
| expireSeconds | `number` | 否 | 过期时间(秒),不传则永不过期 |

**返回值**: `boolean` - 是否设置成功

**示例**:
```typescript
// 存储字符串
cache.set('theme', 'dark')

// 存储对象
cache.set('userInfo', { id: 1, name: 'admin' })

// 设置过期时间
cache.set('token', 'abc123', 3600) // 1小时后过期
```

### cache.get

获取缓存数据。

**类型签名**:
```typescript
get<T = any>(key: string): T | null
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | `string` | 是 | 缓存键名 |

**返回值**: `T | null` - 缓存值或null(不存在或已过期)

**示例**:
```typescript
// 获取字符串
const theme = cache.get<string>('theme')

// 获取对象
const userInfo = cache.get<UserInfo>('userInfo')

// 判断是否存在
if (cache.get('token') === null) {
  console.log('Token不存在或已过期')
}
```

### cache.remove

删除指定的缓存项。

**类型签名**:
```typescript
remove(key: string): void
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | `string` | 是 | 缓存键名 |

**示例**:
```typescript
cache.remove('userToken')
cache.remove('tempData')
```

### cache.has

检查缓存项是否存在且未过期。

**类型签名**:
```typescript
has(key: string): boolean
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | `string` | 是 | 缓存键名 |

**返回值**: `boolean` - 是否存在

**示例**:
```typescript
if (cache.has('userToken')) {
  console.log('用户已登录')
}
```

### cache.clearAll

清除所有应用缓存。

**类型签名**:
```typescript
clearAll(): void
```

**示例**:
```typescript
cache.clearAll()
console.log('所有缓存已清除')
```

### cache.cleanup

手动清理过期缓存。

**类型签名**:
```typescript
cleanup(): void
```

**示例**:
```typescript
cache.cleanup()
console.log('过期缓存已清理')
```

### cache.getStats

获取缓存统计信息。

**类型签名**:
```typescript
getStats(): {
  totalKeys: number
  appKeys: number
  currentSize: number
  limitSize: number
  usagePercent: number
} | null
```

**返回值**:

| 字段 | 类型 | 说明 |
|------|------|------|
| totalKeys | `number` | 所有应用的缓存项总数 |
| appKeys | `number` | 当前应用的缓存项数量 |
| currentSize | `number` | 当前使用的字节数 |
| limitSize | `number` | 平台限制的最大字节数 |
| usagePercent | `number` | 使用百分比 |

**示例**:
```typescript
const stats = cache.getStats()
if (stats) {
  console.log(`使用了 ${stats.appKeys} 项缓存`)
  console.log(`空间使用率: ${stats.usagePercent}%`)
}
```

### cache.getOriginalKey

获取缓存键的原始名称(移除前缀)。

**类型签名**:
```typescript
getOriginalKey(prefixedKey: string): string
```

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prefixedKey | `string` | 是 | 带前缀的缓存键 |

**返回值**: `string` - 原始缓存键名称

**示例**:
```typescript
const original = cache.getOriginalKey('myapp:theme')
console.log(original) // 'theme'
```

## 类型定义

### CacheWrapper

数据包装器接口,用于添加过期时间。

```typescript
interface CacheWrapper<T = any> {
  /** 实际数据 */
  data: T
  /** 过期时间戳(毫秒),undefined表示永不过期 */
  _expire?: number
}
```

### 缓存统计信息

```typescript
interface CacheStats {
  /** 所有应用的缓存项总数 */
  totalKeys: number
  /** 当前应用的缓存项数量 */
  appKeys: number
  /** 当前使用的字节数 */
  currentSize: number
  /** 平台限制的最大字节数 */
  limitSize: number
  /** 使用百分比 */
  usagePercent: number
}
```

### 泛型类型

cache工具完整支持TypeScript泛型,提供类型安全:

```typescript
// 基础类型
const theme = cache.get<string>('theme') // theme: string | null
const count = cache.get<number>('count') // count: number | null
const enabled = cache.get<boolean>('enabled') // enabled: boolean | null

// 对象类型
interface UserInfo {
  id: number
  name: string
}
const user = cache.get<UserInfo>('userInfo') // user: UserInfo | null

// 数组类型
const tags = cache.get<string[]>('tags') // tags: string[] | null

// 联合类型
type Theme = 'light' | 'dark' | 'auto'
const theme = cache.get<Theme>('theme') // theme: Theme | null
```

## 最佳实践

### 1. 使用类型安全

✅ **推荐**: 始终使用TypeScript泛型指定数据类型

```typescript
// 推荐
const userInfo = cache.get<UserInfo>('userInfo')
if (userInfo) {
  console.log(userInfo.name) // 类型安全,有智能提示
}

// 不推荐
const userInfo = cache.get('userInfo') // any类型,无类型检查
console.log(userInfo.name) // 可能运行时错误
```

### 2. 合理设置过期时间

✅ **推荐**: 根据数据特性设置合理的过期时间

```typescript
// 推荐
cache.set('verifyCode', code, 60) // 验证码60秒过期
cache.set('userToken', token, 7 * 24 * 3600) // Token 7天过期
cache.set('userProfile', profile, 24 * 3600) // 用户资料1天过期
cache.set('appConfig', config) // 配置永不过期

// 不推荐
cache.set('verifyCode', code) // 验证码不设置过期时间
cache.set('tempData', data, 365 * 24 * 3600) // 临时数据过期时间过长
```

### 3. 判空处理

✅ **推荐**: 始终检查get返回值是否为null

```typescript
// 推荐
const token = cache.get<string>('userToken')
if (token) {
  // 使用token
  api.request({ headers: { Authorization: token } })
} else {
  // 跳转登录
  navigateToLogin()
}

// 不推荐
const token = cache.get<string>('userToken')
api.request({ headers: { Authorization: token } }) // token可能为null
```

### 4. 错误处理

✅ **推荐**: 检查set返回值,处理存储失败情况

```typescript
// 推荐
const success = cache.set('largeData', hugeObject)
if (!success) {
  uni.showToast({
    title: '存储失败,数据可能过大',
    icon: 'none',
  })
}

// 不推荐
cache.set('largeData', hugeObject) // 忽略返回值
```

### 5. 键名规范

✅ **推荐**: 使用有意义的键名,避免冲突

```typescript
// 推荐
const USER_TOKEN_KEY = 'userToken'
const USER_INFO_KEY = 'userInfo'
const APP_CONFIG_KEY = 'appConfig'

cache.set(USER_TOKEN_KEY, token)

// 不推荐
cache.set('t', token) // 键名过短,不明确
cache.set('data', info) // 键名过于通用,易冲突
```

### 6. 大对象存储

✅ **推荐**: 避免存储过大的对象,必要时分拆存储

```typescript
// 推荐
cache.set('userBasicInfo', { id, name, avatar }) // 只存储必要信息
cache.set('userDetailInfo', detailInfo) // 详细信息单独存储

// 不推荐
cache.set('allUserData', {
  basic: {},
  detail: {},
  settings: {},
  history: [], // 包含大量数据
  // ... 更多数据
}) // 对象过大,可能存储失败
```

### 7. 定期清理

✅ **推荐**: 在适当时机清理不需要的缓存

```typescript
// 推荐
// 用户退出登录时清理用户相关缓存
const logout = () => {
  cache.remove('userToken')
  cache.remove('userInfo')
  cache.remove('userSettings')
  // 不清理应用配置
}

// 应用更新时清理旧版本缓存
if (newVersion !== oldVersion) {
  cache.clearAll() // 清理所有缓存
  initDefaultConfig() // 初始化新版本配置
}
```

### 8. 缓存键常量化

✅ **推荐**: 将缓存键定义为常量,集中管理

```typescript
// 推荐 - 创建 constants/cacheKeys.ts
export const CacheKeys = {
  USER_TOKEN: 'userToken',
  USER_INFO: 'userInfo',
  APP_CONFIG: 'appConfig',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

// 使用
import { CacheKeys } from '@/constants/cacheKeys'
cache.set(CacheKeys.USER_TOKEN, token)

// 不推荐 - 到处使用字符串字面量
cache.set('userToken', token) // 容易拼写错误
```

## 常见问题

### 1. 为什么get返回null?

**问题原因**:
- 缓存项不存在
- 缓存项已过期
- 数据读取失败(数据损坏)

**解决方案**:

```typescript
const token = cache.get<string>('userToken')

if (token === null) {
  // 检查是否设置了过期时间
  console.log('Token不存在或已过期')

  // 尝试重新获取
  await refreshToken()

  // 或跳转登录
  navigateToLogin()
}
```

### 2. 如何存储复杂的嵌套对象?

**问题**: 复杂对象包含多层嵌套,是否能正确存储?

**解决方案**:

```typescript
// 可以直接存储复杂嵌套对象
interface ComplexData {
  user: {
    profile: {
      name: string
      age: number
    }
    settings: {
      theme: string
      notifications: string[]
    }
  }
  metadata: {
    version: string
    timestamp: number
  }
}

const data: ComplexData = {
  user: {
    profile: { name: '张三', age: 28 },
    settings: { theme: 'dark', notifications: ['email', 'sms'] },
  },
  metadata: { version: '1.0.0', timestamp: Date.now() },
}

// 直接存储
cache.set('complexData', data)

// 读取时完整保留结构
const loaded = cache.get<ComplexData>('complexData')
console.log(loaded?.user.profile.name) // '张三'
```

**注意事项**:
- 对象不能包含函数、Symbol等不可序列化的值
- 循环引用会导致序列化失败
- 过大的对象可能超出存储限制

### 3. 存储空间不足怎么办?

**问题原因**:
- 缓存项过多
- 单个缓存项过大
- 平台存储限制(通常10MB)

**解决方案**:

```typescript
// 1. 检查存储使用情况
const stats = cache.getStats()
if (stats && stats.usagePercent > 90) {
  console.warn('存储空间不足')

  // 2. 清理过期数据
  cache.cleanup()

  // 3. 删除不必要的缓存
  cache.remove('tempData')
  cache.remove('oldCache')

  // 4. 如果还是不够,考虑清空所有缓存
  if (cache.getStats()!.usagePercent > 90) {
    cache.clearAll()
  }
}
```

### 4. 如何实现缓存版本控制?

**问题**: 应用更新后缓存数据结构不兼容

**解决方案**:

```typescript
const CACHE_VERSION = '2.0.0'
const VERSION_KEY = 'cacheVersion'

// 检查版本
const checkVersion = () => {
  const savedVersion = cache.get<string>(VERSION_KEY)

  if (!savedVersion) {
    // 首次使用,设置版本
    cache.set(VERSION_KEY, CACHE_VERSION)
    return
  }

  if (savedVersion !== CACHE_VERSION) {
    console.log(`版本升级: ${savedVersion} -> ${CACHE_VERSION}`)

    // 清除所有缓存
    cache.clearAll()

    // 设置新版本
    cache.set(VERSION_KEY, CACHE_VERSION)

    // 初始化默认配置
    initDefaultConfig()
  }
}

// 应用启动时检查
checkVersion()
```

### 5. 多个页面同时操作同一缓存会冲突吗?

**问题**: 担心并发操作导致数据不一致

**解答**:

UniApp的存储API是同步的,不存在并发冲突问题:

```typescript
// 页面A
cache.set('count', 1)

// 页面B (同时执行)
cache.set('count', 2)

// 最终结果: count为2 (后执行的覆盖)
```

如果需要避免覆盖,可以使用读-改-写模式:

```typescript
// 页面A
const count = cache.get<number>('count') || 0
cache.set('count', count + 1)

// 页面B
const count = cache.get<number>('count') || 0
cache.set('count', count + 10)
```

### 6. 如何调试缓存问题?

**解决方案**:

```typescript
// 1. 查看所有缓存键
const stats = cache.getStats()
console.log('缓存统计:', stats)

// 2. 导出所有缓存数据
const exportCache = () => {
  const storageInfo = uni.getStorageInfoSync()
  const allData: Record<string, any> = {}

  storageInfo.keys.forEach((key) => {
    try {
      allData[key] = uni.getStorageSync(key)
    } catch (e) {
      console.error(`读取 ${key} 失败:`, e)
    }
  })

  console.log('所有缓存数据:', allData)
  return allData
}

// 3. 检查特定键的值
const debugKey = (key: string) => {
  console.log(`缓存键: ${key}`)
  console.log(`存在: ${cache.has(key)}`)
  console.log(`值:`, cache.get(key))
}

// 使用示例
exportCache()
debugKey('userToken')
```

### 7. 能否在缓存中存储Date对象?

**问题**: Date对象序列化后会变成字符串

**解决方案**:

```typescript
// ❌ 不推荐: Date对象会丢失类型
const date = new Date()
cache.set('date', date)
const loaded = cache.get('date') // 实际是字符串,不是Date对象

// ✅ 推荐: 存储时间戳
cache.set('timestamp', Date.now())
const timestamp = cache.get<number>('timestamp')
const date = new Date(timestamp!) // 重新创建Date对象

// ✅ 推荐: 存储ISO字符串
cache.set('dateString', new Date().toISOString())
const dateString = cache.get<string>('dateString')
const date = new Date(dateString!) // 从ISO字符串创建
```

### 8. 如何实现跨应用共享缓存?

**问题**: 需要在多个UniApp应用间共享数据

**解答**:

cache工具使用应用前缀隔离数据,默认不支持跨应用共享。如需共享:

```typescript
// 方案1: 直接使用uni存储API(不通过cache工具)
uni.setStorageSync('sharedData', data) // 不带应用前缀

// 方案2: 使用服务端存储
// 将数据上传到服务器,其他应用从服务器获取

// 方案3: 使用UniApp的plus.storage
// #ifdef APP-PLUS
plus.storage.setItem('sharedKey', JSON.stringify(data))
// #endif
```

**注意**: 跨应用共享需谨慎,避免数据冲突。
