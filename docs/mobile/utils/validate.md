# 验证工具 Validators

## 介绍

验证工具(validators)是RuoYi-Plus-UniApp移动端应用的核心工具库之一,提供了全面的数据验证功能。它包含50+个验证函数,覆盖文件、URL、字符串、类型、数值、日期、中国特定格式、表单、网络标识、金融、社交媒体等12大类验证场景,大幅简化了数据校验工作,提高了代码质量和安全性。

在移动应用开发中,数据验证无处不在:用户注册时验证邮箱和手机号、文件上传时验证类型和大小、表单提交时验证必填字段、配置网络时验证IP和端口等。validators 工具提供统一、可靠的验证接口,自动处理边界情况和特殊格式,让开发者专注于业务逻辑,避免重复造轮子和潜在的安全漏洞。

**核心特性**:

- **12大验证类别** - 覆盖文件、URL、字符串、类型、数值、日期、中国特定、表单、网络、金融、社交媒体、其他通用验证
- **50+验证函数** - 从基础类型检查到复杂业务验证,应有尽有
- **类型安全** - 完整的TypeScript类型定义,提供智能提示和类型推断
- **边界处理** - 自动处理null/undefined、空字符串等边界情况
- **正则表达式优化** - 预编译常用正则,性能优秀
- **中国本地化** - 专门支持身份证、手机号、邮政编码等中国特定格式
- **金融安全** - 包含银行卡号、信用卡号(Luhn算法)验证
- **灵活配置** - 支持自定义验证规则和参数
- **表单友好** - 可直接用于表单验证,返回布尔值
- **无依赖** - 纯JavaScript实现,零第三方依赖
- **高性能** - 所有验证函数都经过性能优化
- **易于扩展** - 简洁的函数式设计,方便自定义扩展

## 文件验证

文件验证主要用于文件上传场景,验证文件类型、格式和大小。

### 1. 验证Blob格式

检查接口返回的数据是否为blob格式(非JSON)。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">下载文件</text>

      <button @click="downloadFile" :loading="downloading">
        {{ downloading ? '下载中...' : '下载文档' }}
      </button>

      <view v-if="downloadResult" class="result">
        <text>{{ downloadResult }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { isBlob } from '@/utils/validators'

const downloading = ref(false)
const downloadResult = ref('')

// 模拟下载文件
const downloadFile = async () => {
  downloading.value = true
  downloadResult.value = ''

  try {
    // 模拟API请求
    const response = await fetch('/api/download/document')
    const data = await response.blob()

    // 验证返回的数据是否为blob
    if (isBlob({ type: data.type })) {
      // 处理blob数据,下载文件
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'document.pdf'
      link.click()
      URL.revokeObjectURL(url)

      downloadResult.value = '文件下载成功'
    } else {
      // 可能是JSON错误响应
      const json = await data.text()
      downloadResult.value = `下载失败: ${json}`
    }
  } catch (error) {
    downloadResult.value = `下载失败: ${error}`
  } finally {
    downloading.value = false
  }
}
</script>

```

**使用说明**:
- `isBlob` 检查数据类型是否非 `application/json`
- 常用于区分文件下载和JSON错误响应
- blob数据可用于文件下载、图片预览等场景

### 2. 验证文件类型

检查上传的文件是否属于允许的类型。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">文件上传</text>

      <view class="upload-area">
        <button @click="chooseFile">选择文件</button>

        <view v-if="selectedFile" class="file-info">
          <view class="info-item">
            <text class="label">文件名:</text>
            <text>{{ selectedFile.name }}</text>
          </view>
          <view class="info-item">
            <text class="label">文件类型:</text>
            <text>{{ selectedFile.type }}</text>
          </view>
          <view class="info-item">
            <text class="label">验证结果:</text>
            <text :class="isValid ? 'valid' : 'invalid'">
              {{ isValid ? '✓ 类型允许' : '✗ 类型不允许' }}
            </text>
          </view>
        </view>
      </view>

      <view class="allowed-types">
        <text class="label">允许的类型:</text>
        <text>{{ allowedTypes.join(', ') }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isAllowedFileType } from '@/utils/validators'

const selectedFile = ref<File | null>(null)
const allowedTypes = ref(['jpg', 'png', 'gif', 'pdf', 'docx'])

const isValid = computed(() => {
  if (!selectedFile.value) return false
  return isAllowedFileType(selectedFile.value, allowedTypes.value)
})

const chooseFile = () => {
  uni.chooseFile({
    count: 1,
    type: 'all',
    success: (res) => {
      const tempFilePaths = res.tempFilePaths
      const tempFiles = res.tempFiles

      if (tempFiles && tempFiles.length > 0) {
        const file = tempFiles[0] as unknown as File
        selectedFile.value = file

        if (!isValid.value) {
          uni.showToast({
            title: `只允许上传 ${allowedTypes.value.join(', ')} 格式的文件`,
            icon: 'none',
          })
        }
      }
    },
    fail: (error) => {
      uni.showToast({
        title: '选择文件失败',
        icon: 'none',
      })
    },
  })
}
</script>

```

**使用说明**:
- `isAllowedFileType` 接收文件对象和允许的扩展名数组
- 自动提取文件扩展名并转换为小写进行比较
- 适用于限制用户上传特定类型的文件

### 3. 验证图片文件

专门用于检查文件是否为图片类型。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">图片上传</text>

      <view class="upload-area" @click="chooseImage">
        <image
          v-if="imageUrl"
          :src="imageUrl"
          mode="aspectFit"
          class="preview-image"
        />
        <view v-else class="placeholder">
          <text>点击选择图片</text>
        </view>
      </view>

      <view v-if="uploadStatus" class="status">
        <text :class="uploadStatus.type">{{ uploadStatus.message }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { isImageFile } from '@/utils/validators'

const imageUrl = ref('')
const uploadStatus = ref<{ type: string; message: string } | null>(null)

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePaths = res.tempFilePaths

      // 在小程序中验证文件类型
      #ifdef MP-WEIXIN
      uni.getFileInfo({
        filePath: tempFilePaths[0],
        success: (fileInfo) => {
          // 模拟File对象
          const file = {
            type: getMimeType(tempFilePaths[0]),
            size: fileInfo.size,
          } as File

          if (isImageFile(file)) {
            imageUrl.value = tempFilePaths[0]
            uploadStatus.value = {
              type: 'success',
              message: '✓ 图片选择成功',
            }
          } else {
            uploadStatus.value = {
              type: 'error',
              message: '✗ 请选择图片文件',
            }
          }
        },
      })
      #endif

      #ifndef MP-WEIXIN
      // H5环境直接使用
      imageUrl.value = tempFilePaths[0]
      uploadStatus.value = {
        type: 'success',
        message: '✓ 图片选择成功',
      }
      #endif
    },
    fail: () => {
      uploadStatus.value = {
        type: 'error',
        message: '✗ 选择图片失败',
      }
    },
  })
}

// 根据文件扩展名获取MIME类型
const getMimeType = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}
</script>

```

**使用说明**:
- `isImageFile` 检查文件的MIME类型是否以 `image/` 开头
- 支持所有常见图片格式: jpg, png, gif, webp, svg等
- 在文件上传前验证,避免上传非图片文件

### 4. 验证文件大小

检查文件大小是否在允许范围内。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">文件大小验证</text>

      <view class="controls">
        <view class="control-item">
          <text class="label">最大文件大小(MB):</text>
          <slider
            :value="maxSize"
            :min="1"
            :max="20"
            :step="1"
            @change="onMaxSizeChange"
            activeColor="#409eff"
          />
          <text class="value">{{ maxSize }} MB</text>
        </view>
      </view>

      <button @click="chooseFile">选择文件</button>

      <view v-if="fileInfo" class="file-info">
        <view class="info-item">
          <text class="label">文件名:</text>
          <text>{{ fileInfo.name }}</text>
        </view>
        <view class="info-item">
          <text class="label">文件大小:</text>
          <text>{{ fileInfo.sizeText }}</text>
        </view>
        <view class="info-item">
          <text class="label">验证结果:</text>
          <text :class="fileInfo.isValid ? 'valid' : 'invalid'">
            {{ fileInfo.isValid ? '✓ 大小允许' : '✗ 大小超限' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { isWithinFileSize } from '@/utils/validators'

const maxSize = ref(5) // MB
const fileInfo = ref<{
  name: string
  size: number
  sizeText: string
  isValid: boolean
} | null>(null)

const onMaxSizeChange = (e: any) => {
  maxSize.value = e.detail.value
  // 如果已选择文件,重新验证
  if (fileInfo.value) {
    const mockFile = {
      size: fileInfo.value.size,
    } as File
    fileInfo.value.isValid = isWithinFileSize(mockFile, maxSize.value)
  }
}

const chooseFile = () => {
  uni.chooseFile({
    count: 1,
    type: 'all',
    success: (res) => {
      const file = res.tempFiles[0]

      const mockFile = {
        size: file.size,
        name: file.name,
      } as File

      const isValid = isWithinFileSize(mockFile, maxSize.value)

      fileInfo.value = {
        name: file.name,
        size: file.size,
        sizeText: formatFileSize(file.size),
        isValid,
      }

      if (!isValid) {
        uni.showToast({
          title: `文件大小不能超过 ${maxSize.value} MB`,
          icon: 'none',
        })
      }
    },
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

```

**使用说明**:
- `isWithinFileSize` 接收文件对象和最大尺寸(MB)
- 自动将文件大小转换为MB进行比较
- 常用于限制用户上传过大的文件,避免服务器压力

## URL和路径验证

URL和路径验证用于检查URL格式、协议、域名等是否符合要求。

### 1. 路径模式匹配

检查路径是否匹配特定的模式,支持通配符。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">路径模式匹配</text>

      <view class="form">
        <view class="form-item">
          <text class="label">匹配模式:</text>
          <input
            v-model="pattern"
            placeholder="如: /api/*"
            class="input"
          />
        </view>

        <view class="form-item">
          <text class="label">测试路径:</text>
          <input
            v-model="testPath"
            placeholder="如: /api/users"
            class="input"
          />
        </view>
      </view>

      <view v-if="pattern && testPath" class="result">
        <text :class="matchResult ? 'match' : 'no-match'">
          {{ matchResult ? '✓ 路径匹配' : '✗ 路径不匹配' }}
        </text>
      </view>

      <view class="examples">
        <text class="examples-title">常用模式示例:</text>
        <view
          v-for="example in examples"
          :key="example.pattern"
          class="example-item"
          @click="useExample(example)"
        >
          <text class="pattern">{{ example.pattern }}</text>
          <text class="desc">{{ example.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isPathMatch } from '@/utils/validators'

const pattern = ref('/api/*')
const testPath = ref('/api/users')

const matchResult = computed(() => {
  if (!pattern.value || !testPath.value) return false
  return isPathMatch(pattern.value, testPath.value)
})

const examples = [
  { pattern: '/api/*', path: '/api/users', desc: '匹配 /api 下的一级路径' },
  { pattern: '/api/**', path: '/api/v1/users', desc: '匹配 /api 下的所有路径' },
  { pattern: '/users/*/profile', path: '/users/123/profile', desc: '匹配特定结构的路径' },
  { pattern: '/files/*.pdf', path: '/files/document.pdf', desc: '匹配特定扩展名的文件' },
]

const useExample = (example: typeof examples[0]) => {
  pattern.value = example.pattern
  testPath.value = example.path
}
</script>

```

**使用说明**:
- `isPathMatch` 支持 `*` (单层通配符) 和 `**` (多层通配符)
- `*` 匹配单层路径,不包含 `/`
- `**` 匹配任意层级路径,包含 `/`
- 常用于路由权限控制、API拦截等场景

### 2. URL格式验证

检查URL是否符合标准格式,验证协议、域名等。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">URL格式验证</text>

      <view class="form">
        <view class="form-item">
          <text class="label">输入URL:</text>
          <input
            v-model="url"
            placeholder="https://example.com"
            class="input"
          />
        </view>
      </view>

      <view class="validators">
        <view class="validator-item">
          <text class="validator-label">isHttp:</text>
          <text :class="validators.isHttp ? 'valid' : 'invalid'">
            {{ validators.isHttp ? '✓' : '✗' }} HTTP/HTTPS协议
          </text>
        </view>

        <view class="validator-item">
          <text class="validator-label">isExternal:</text>
          <text :class="validators.isExternal ? 'valid' : 'invalid'">
            {{ validators.isExternal ? '✓' : '✗' }} 外部链接
          </text>
        </view>

        <view class="validator-item">
          <text class="validator-label">isValidURL:</text>
          <text :class="validators.isValidURL ? 'valid' : 'invalid'">
            {{ validators.isValidURL ? '✓' : '✗' }} 标准URL格式
          </text>
        </view>

        <view class="validator-item">
          <text class="validator-label">isDomain:</text>
          <text :class="validators.isDomain ? 'valid' : 'invalid'">
            {{ validators.isDomain ? '✓' : '✗' }} 有效域名
          </text>
        </view>
      </view>

      <view class="examples">
        <text class="examples-title">测试示例:</text>
        <button
          v-for="example in examples"
          :key="example"
          @click="url = example"
          class="example-btn"
        >
          {{ example }}
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isHttp, isExternal, isValidURL, isDomain } from '@/utils/validators'

const url = ref('https://example.com')

const validators = computed(() => ({
  isHttp: isHttp(url.value),
  isExternal: isExternal(url.value),
  isValidURL: isValidURL(url.value),
  isDomain: isDomain(extractDomain(url.value)),
}))

const examples = [
  'https://example.com',
  'http://localhost:8080',
  'mailto:test@example.com',
  'tel:13800138000',
  '/relative/path',
  'example.com',
  'ftp://ftp.example.com',
]

const extractDomain = (urlString: string): string => {
  try {
    if (urlString.includes('://')) {
      const urlObj = new URL(urlString)
      return urlObj.hostname
    }
    return urlString
  } catch {
    return urlString
  }
}
</script>

```

**使用说明**:
- `isHttp` 检查是否包含 `http://` 或 `https://`
- `isExternal` 检查是否为外部链接(http/https/mailto/tel协议)
- `isValidURL` 使用正则验证完整URL格式
- `isDomain` 验证域名格式是否有效

## 字符串验证

字符串验证用于检查字符串格式、内容和特征。

### 1. 邮箱验证

验证邮箱地址格式是否正确。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">邮箱验证</text>

      <view class="form">
        <view class="form-item">
          <text class="label">邮箱地址:</text>
          <input
            v-model="email"
            placeholder="user@example.com"
            type="email"
            class="input"
          />
        </view>
      </view>

      <view v-if="email" class="result">
        <text :class="isEmailValid ? 'valid' : 'invalid'">
          {{ isEmailValid ? '✓ 邮箱格式正确' : '✗ 邮箱格式错误' }}
        </text>
      </view>

      <view class="test-cases">
        <text class="test-title">测试用例:</text>
        <view
          v-for="test in testCases"
          :key="test.email"
          class="test-item"
          @click="email = test.email"
        >
          <text class="test-email">{{ test.email }}</text>
          <text :class="test.valid ? 'valid' : 'invalid'">
            {{ test.valid ? '✓' : '✗' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isEmail } from '@/utils/validators'

const email = ref('')

const isEmailValid = computed(() => isEmail(email.value))

const testCases = [
  { email: 'user@example.com', valid: true },
  { email: 'test.user@company.co.uk', valid: true },
  { email: 'admin+tag@domain.org', valid: true },
  { email: 'invalid@', valid: false },
  { email: '@domain.com', valid: false },
  { email: 'no-at-sign.com', valid: false },
  { email: 'spaces in@email.com', valid: false },
]
</script>

```

**使用说明**:
- `isEmail` 使用正则表达式验证邮箱格式
- 支持常见的邮箱格式,包括子域名、加号标签等
- 常用于用户注册、登录表单验证

### 2. 大小写验证

验证字符串是否为全大写或全小写格式。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">大小写验证</text>

      <view class="form">
        <view class="form-item">
          <text class="label">输入文本:</text>
          <input
            v-model="text"
            placeholder="输入文本进行验证"
            class="input"
          />
        </view>
      </view>

      <view v-if="text" class="results">
        <view class="result-item">
          <text class="label">全小写:</text>
          <text :class="isLower ? 'valid' : 'invalid'">
            {{ isLower ? '✓ 是' : '✗ 否' }}
          </text>
        </view>

        <view class="result-item">
          <text class="label">全大写:</text>
          <text :class="isUpper ? 'valid' : 'invalid'">
            {{ isUpper ? '✓ 是' : '✗ 否' }}
          </text>
        </view>
      </view>

      <view class="test-cases">
        <text class="test-title">测试用例:</text>
        <view
          v-for="test in testCases"
          :key="test.text"
          class="test-item"
          @click="text = test.text"
        >
          <text class="test-text">{{ test.text }}</text>
          <view class="test-results">
            <text v-if="test.lower" class="valid">小写 ✓</text>
            <text v-if="test.upper" class="valid">大写 ✓</text>
            <text v-if="!test.lower && !test.upper" class="invalid">混合</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isLowerCase, isUpperCase } from '@/utils/validators'

const text = ref('')

const isLower = computed(() => isLowerCase(text.value))
const isUpper = computed(() => isUpperCase(text.value))

const testCases = [
  { text: 'hello', lower: true, upper: false },
  { text: 'HELLO', lower: false, upper: true },
  { text: 'Hello', lower: false, upper: false },
  { text: 'hello world', lower: true, upper: false },
  { text: 'HELLO WORLD', lower: false, upper: true },
  { text: 'Hello World', lower: false, upper: false },
  { text: 'abc123', lower: true, upper: false },
  { text: 'ABC123', lower: false, upper: true },
]
</script>

```

**使用说明**:
- `isLowerCase` 检查字符串是否全部为小写字母(数字和空格不影响)
- `isUpperCase` 检查字符串是否全部为大写字母(数字和空格不影响)
- 常用于验证代码规范、命名格式等场景

### 3. 字母验证

验证字符串是否只包含字母(不含数字和特殊字符)。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">字母验证</text>

      <view class="form">
        <view class="form-item">
          <text class="label">输入文本:</text>
          <input
            v-model="text"
            placeholder="输入文本进行验证"
            class="input"
          />
        </view>
      </view>

      <view v-if="text" class="result">
        <text :class="isOnlyAlphabets ? 'valid' : 'invalid'">
          {{ isOnlyAlphabets ? '✓ 只包含字母' : '✗ 包含非字母字符' }}
        </text>
        <text v-if="!isOnlyAlphabets" class="hint">
          (检测到数字、空格或特殊字符)
        </text>
      </view>

      <view class="test-cases">
        <text class="test-title">测试用例:</text>
        <view
          v-for="test in testCases"
          :key="test.text"
          class="test-item"
          @click="text = test.text"
        >
          <text class="test-text">{{ test.text }}</text>
          <text :class="test.valid ? 'valid' : 'invalid'">
            {{ test.valid ? '✓' : '✗' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isAlphabets } from '@/utils/validators'

const text = ref('')

const isOnlyAlphabets = computed(() => isAlphabets(text.value))

const testCases = [
  { text: 'hello', valid: true },
  { text: 'HELLO', valid: true },
  { text: 'HelloWorld', valid: true },
  { text: 'hello123', valid: false },
  { text: 'hello world', valid: false },
  { text: 'hello-world', valid: false },
  { text: 'hello_world', valid: false },
  { text: '你好world', valid: false },
]
</script>

```

**使用说明**:
- `isAlphabets` 验证字符串是否只包含字母(a-z, A-Z)
- 不允许数字、空格、特殊字符或中文
- 常用于验证用户名、变量名等只允许字母的场景

## 类型检查

类型检查函数用于判断值的数据类型,包括基本类型和对象类型的验证。

### 1. 字符串类型检查

检查值是否为字符串类型。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">字符串类型检查</text>

      <view class="form">
        <view class="form-item">
          <text class="label">输入值:</text>
          <input
            v-model="inputValue"
            placeholder="输入任意值"
            class="input"
          />
        </view>
      </view>

      <view class="result">
        <text :class="result.isString ? 'valid' : 'invalid'">
          {{ result.isString ? '✓ 是字符串' : '✗ 不是字符串' }}
        </text>
        <text class="type-info">
          实际类型: {{ result.actualType }}
        </text>
      </view>

      <view class="test-cases">
        <text class="test-title">测试用例:</text>
        <view
          v-for="test in testCases"
          :key="test.label"
          class="test-item"
          @click="testValue(test.value)"
        >
          <text class="test-label">{{ test.label }}</text>
          <view class="test-info">
            <text class="test-value">{{ test.display }}</text>
            <text :class="test.isString ? 'valid' : 'invalid'">
              {{ test.isString ? '✓' : '✗' }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isString } from '@/utils/validators'

const inputValue = ref('')

const result = computed(() => {
  // 尝试解析输入值
  let value: any = inputValue.value

  // 特殊值处理
  if (value === 'null') value = null
  else if (value === 'undefined') value = undefined
  else if (value === 'true') value = true
  else if (value === 'false') value = false
  else if (!isNaN(Number(value)) && value !== '') value = Number(value)

  return {
    isString: isString(value),
    actualType: typeof value
  }
})

const testValue = (value: any) => {
  if (value === null) inputValue.value = 'null'
  else if (value === undefined) inputValue.value = 'undefined'
  else inputValue.value = String(value)
}

const testCases = [
  { label: '字符串', value: 'hello', display: '"hello"', isString: true },
  { label: '空字符串', value: '', display: '""', isString: true },
  { label: '数字', value: 123, display: '123', isString: false },
  { label: '布尔值', value: true, display: 'true', isString: false },
  { label: 'null', value: null, display: 'null', isString: false },
  { label: 'undefined', value: undefined, display: 'undefined', isString: false },
  { label: '对象', value: {}, display: '{}', isString: false },
  { label: '数组', value: [], display: '[]', isString: false },
]
</script>

```

**使用说明**:
- `isString` 使用 `typeof` 检查值是否为字符串类型
- 只有原始字符串类型返回 true,String 对象返回 false
- 常用于参数类型验证、数据处理前的类型检查

### 2. 数组类型检查

检查值是否为数组类型。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">数组类型检查</text>

      <view class="form">
        <view class="form-item">
          <text class="label">输入JSON:</text>
          <textarea
            v-model="inputValue"
            placeholder='输入JSON,如: [1,2,3] 或 {"name":"test"}'
            class="textarea"
          />
        </view>
      </view>

      <view class="result">
        <text :class="result.isArray ? 'valid' : 'invalid'">
          {{ result.isArray ? '✓ 是数组' : '✗ 不是数组' }}
        </text>
        <text v-if="result.error" class="error">{{ result.error }}</text>
        <text v-else class="type-info">
          实际类型: {{ result.actualType }}
        </text>
      </view>

      <view class="test-cases">
        <text class="test-title">测试用例:</text>
        <button
          v-for="test in testCases"
          :key="test.label"
          @click="inputValue = test.value"
          class="test-btn"
        >
          {{ test.label }}: {{ test.value }}
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isArray } from '@/utils/validators'

const inputValue = ref('[1, 2, 3]')

const result = computed(() => {
  try {
    const value = JSON.parse(inputValue.value)
    return {
      isArray: isArray(value),
      actualType: Array.isArray(value) ? 'array' : typeof value,
      error: null
    }
  } catch (e) {
    return {
      isArray: false,
      actualType: 'invalid',
      error: 'JSON 解析失败'
    }
  }
})

const testCases = [
  { label: '数字数组', value: '[1, 2, 3]' },
  { label: '字符串数组', value: '["a", "b", "c"]' },
  { label: '空数组', value: '[]' },
  { label: '对象', value: '{"name": "test"}' },
  { label: '数字', value: '123' },
  { label: '字符串', value: '"hello"' },
  { label: 'null', value: 'null' },
]
</script>

```

**使用说明**:
- `isArray` 使用 `Array.isArray()` 检查值是否为数组类型
- 比 `typeof` 更准确,因为 `typeof []` 返回 `'object'`
- 常用于处理API返回数据、函数参数验证

### 3. 对象类型检查

检查值是否为普通对象类型(非 null,非数组)。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">对象类型检查</text>

      <view class="form">
        <view class="form-item">
          <text class="label">输入JSON:</text>
          <textarea
            v-model="inputValue"
            placeholder='输入JSON,如: {"name":"test"} 或 [1,2,3]'
            class="textarea"
          />
        </view>
      </view>

      <view class="results">
        <view class="result-item">
          <text class="label">isObject:</text>
          <text :class="results.isObject ? 'valid' : 'invalid'">
            {{ results.isObject ? '✓' : '✗' }}
          </text>
        </view>

        <view class="result-item">
          <text class="label">isEmptyObject:</text>
          <text :class="results.isEmptyObject ? 'valid' : 'invalid'">
            {{ results.isEmptyObject ? '✓' : '✗' }}
          </text>
        </view>

        <text v-if="results.error" class="error">{{ results.error }}</text>
      </view>

      <view class="test-cases">
        <text class="test-title">测试用例:</text>
        <button
          v-for="test in testCases"
          :key="test.label"
          @click="inputValue = test.value"
          class="test-btn"
        >
          {{ test.label }}: {{ test.value }}
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isObject, isEmptyObject } from '@/utils/validators'

const inputValue = ref('{"name": "test"}')

const results = computed(() => {
  try {
    const value = JSON.parse(inputValue.value)
    return {
      isObject: isObject(value),
      isEmptyObject: isEmptyObject(value),
      error: null
    }
  } catch (e) {
    return {
      isObject: false,
      isEmptyObject: false,
      error: 'JSON 解析失败'
    }
  }
})

const testCases = [
  { label: '对象', value: '{"name": "test"}' },
  { label: '空对象', value: '{}' },
  { label: '嵌套对象', value: '{"user": {"name": "test"}}' },
  { label: '数组', value: '[1, 2, 3]' },
  { label: '空数组', value: '[]' },
  { label: '字符串', value: '"hello"' },
  { label: 'null', value: 'null' },
  { label: '数字', value: '123' },
]
</script>

```

**使用说明**:
- `isObject` 检查值是否为普通对象(非 null,非数组)
- `isEmptyObject` 检查对象是否为空对象(没有可枚举属性)
- 常用于API响应验证、配置对象检查

## 中国特定格式验证

中国特定格式验证函数用于验证中国大陆常用的格式,如手机号、身份证号等。

### 1. 中国手机号验证

验证中国大陆手机号码格式。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">手机号验证</text>

      <view class="form">
        <view class="form-item">
          <text class="label">手机号码:</text>
          <input
            v-model="phone"
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
            class="input"
          />
        </view>
      </view>

      <view v-if="phone" class="result">
        <text :class="isValid ? 'valid' : 'invalid'">
          {{ isValid ? '✓ 手机号格式正确' : '✗ 手机号格式错误' }}
        </text>
      </view>

      <view class="test-cases">
        <text class="test-title">测试用例:</text>
        <view
          v-for="test in testCases"
          :key="test.phone"
          class="test-item"
          @click="phone = test.phone"
        >
          <text class="test-phone">{{ test.phone }}</text>
          <text :class="test.valid ? 'valid' : 'invalid'">
            {{ test.valid ? '✓' : '✗' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isChinesePhoneNumber } from '@/utils/validators'

const phone = ref('')

const isValid = computed(() => isChinesePhoneNumber(phone.value))

const testCases = [
  { phone: '13800138000', valid: true },
  { phone: '15912345678', valid: true },
  { phone: '18612345678', valid: true },
  { phone: '12345678901', valid: false },
  { phone: '1380013800', valid: false },
  { phone: 'abcdefghijk', valid: false },
]
</script>

```

**使用说明**:
- `isChinesePhoneNumber` 验证中国大陆11位手机号格式
- 支持所有常见运营商号段
- 常用于用户注册、绑定手机号等场景

### 2. 身份证号验证

验证中国大陆身份证号码格式(15位或18位)。

```vue
<template>
  <view class="container">
    <view class="section">
      <text class="title">身份证验证</text>

      <view class="form">
        <view class="form-item">
          <text class="label">身份证号:</text>
          <input
            v-model="idCard"
            placeholder="请输入身份证号"
            maxlength="18"
            class="input"
          />
        </view>
      </view>

      <view v-if="idCard" class="result">
        <text :class="isValid ? 'valid' : 'invalid'">
          {{ isValid ? '✓ 身份证格式正确' : '✗ 身份证格式错误' }}
        </text>
      </view>

      <view class="test-cases">
        <text class="test-title">测试用例:</text>
        <view
          v-for="test in testCases"
          :key="test.id"
          class="test-item"
          @click="idCard = test.id"
        >
          <text class="test-id">{{ test.id }}</text>
          <text :class="test.valid ? 'valid' : 'invalid'">
            {{ test.valid ? '✓' : '✗' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isChineseIdCard } from '@/utils/validators'

const idCard = ref('')

const isValid = computed(() => isChineseIdCard(idCard.value))

const testCases = [
  { id: '11010519491231002X', valid: true },
  { id: '440524188001010014', valid: true },
  { id: '12345678901234567', valid: false },
  { id: '110105194912310021', valid: false },
]
</script>

```

**使用说明**:
- `isChineseIdCard` 验证15位或18位身份证号
- 包含校验码验证,确保身份证号真实性
- 常用于实名认证、用户注册等场景

## 最佳实践

### 1. 组合验证

在实际应用中,常需要多个验证条件同时满足。

<Ok/> **推荐做法**:
```typescript
import { isEmail, isRequired, hasMinLength } from '@/utils/validators'

// 邮箱验证:必填 + 格式正确
const validateEmail = (email: string): boolean => {
  return isRequired(email) && isEmail(email)
}

// 密码验证:必填 + 最小长度
const validatePassword = (password: string): boolean => {
  return isRequired(password) && hasMinLength(password, 6)
}
```

<No/> **不推荐做法**:
```typescript
// 重复编写验证逻辑
const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

### 2. 表单验证集成

将验证函数集成到表单验证规则中。

<Ok/> **推荐做法**:
```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'

const form = ref({
  email: '',
  phone: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { validator: (rule: any, value: string) => isEmail(value), message: '邮箱格式不正确' }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    { validator: (rule: any, value: string) => isChinesePhoneNumber(value), message: '手机号格式不正确' }
  ]
}
</script>
```

### 3. 类型安全

充分利用TypeScript类型定义。

<Ok/> **推荐做法**:
```typescript
import { isArray, isObject } from '@/utils/validators'

interface User {
  name: string
  age: number
}

const processData = (data: unknown) => {
  if (isArray(data)) {
    // TypeScript知道这里data是数组
    console.log('数组长度:', data.length)
  } else if (isObject(data)) {
    // TypeScript知道这里data是对象
    console.log('对象键:', Object.keys(data))
  }
}
```

<No/> **不推荐做法**:
```typescript
const processData = (data: any) => {
  // 使用any类型,失去类型安全
  if (Array.isArray(data)) {
    console.log(data.length)
  }
}
```

### 4. 错误提示

提供清晰的验证错误提示。

<Ok/> **推荐做法**:
```typescript
import { isEmail } from '@/utils/validators'

const validateAndShowError = (email: string) => {
  if (!isEmail(email)) {
    uni.showToast({
      title: '邮箱格式不正确,请检查后重试',
      icon: 'none'
    })
    return false
  }
  return true
}
```

<No/> **不推荐做法**:
```typescript
const validateAndShowError = (email: string) => {
  if (!isEmail(email)) {
    uni.showToast({ title: '错误', icon: 'none' })
    return false
  }
  return true
}
```

### 5. 性能优化

避免重复验证,缓存验证结果。

<Ok/> **推荐做法**:
```vue
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { isEmail } from '@/utils/validators'

const email = ref('')

// 使用computed缓存验证结果
const isEmailValid = computed(() => isEmail(email.value))

// 在多处使用验证结果时,不会重复执行验证
const canSubmit = computed(() => isEmailValid.value && email.value.length > 0)
</script>
```

<No/> **不推荐做法**:
```vue
<script lang="ts" setup>
import { ref } from 'vue'
import { isEmail } from '@/utils/validators'

const email = ref('')

// 每次访问都重新验证
const checkEmail = () => isEmail(email.value)
const canSubmit = () => checkEmail() && email.value.length > 0
</script>
```

## 常见问题

### 1. 如何验证多个条件?

**问题**: 需要同时满足多个验证条件,如何实现?

**解决方案**:
```typescript
import { isRequired, hasMinLength, hasMaxLength } from '@/utils/validators'

const validateUsername = (username: string): boolean => {
  return (
    isRequired(username) &&
    hasMinLength(username, 3) &&
    hasMaxLength(username, 20)
  )
}

// 或使用数组形式
const validators = [
  (v: string) => isRequired(v) || '用户名不能为空',
  (v: string) => hasMinLength(v, 3) || '用户名至少3个字符',
  (v: string) => hasMaxLength(v, 20) || '用户名最多20个字符'
]

const validate = (username: string) => {
  for (const validator of validators) {
    const result = validator(username)
    if (result !== true) return result
  }
  return true
}
```

### 2. 如何自定义验证规则?

**问题**: 内置验证函数不满足需求,如何自定义?

**解决方案**:
```typescript
// 自定义验证函数
export const isStrongPassword = (password: string): boolean => {
  // 至少8位,包含大小写字母、数字和特殊字符
  const hasLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return hasLength && hasUpper && hasLower && hasNumber && hasSpecial
}

// 使用
import { isStrongPassword } from './myValidators'

const password = 'MyPass123!'
console.log(isStrongPassword(password)) // true
```

### 3. 文件验证失败怎么办?

**问题**: 使用 `isAllowedFileType` 验证失败,但文件确实是允许的类型?

**问题原因**:
- 文件扩展名大小写不匹配
- 文件类型列表未包含该扩展名
- 文件对象结构不正确

**解决方案**:
```typescript
import { isAllowedFileType } from '@/utils/validators'

// 确保文件类型列表完整
const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf']

// 验证前检查文件对象
const validateFile = (file: File) => {
  console.log('文件名:', file.name)
  console.log('文件类型:', file.type)

  if (!file.name) {
    console.error('文件对象缺少name属性')
    return false
  }

  return isAllowedFileType(file, allowedTypes)
}
```

### 4. 如何处理异步验证?

**问题**: 需要调用API验证数据唯一性(如用户名是否已存在)?

**解决方案**:
```typescript
import { isRequired } from '@/utils/validators'

// 异步验证函数
const validateUsernameUnique = async (username: string): Promise<boolean> => {
  // 先进行本地验证
  if (!isRequired(username)) {
    return false
  }

  try {
    // 调用API检查唯一性
    const response = await fetch(`/api/check-username?username=${username}`)
    const data = await response.json()
    return data.available
  } catch (error) {
    console.error('验证失败:', error)
    return false
  }
}

// 使用
const checkUsername = async () => {
  const isValid = await validateUsernameUnique('testuser')
  if (!isValid) {
    uni.showToast({
      title: '用户名已存在',
      icon: 'none'
    })
  }
}
```

### 5. 如何优化大量数据的验证性能?

**问题**: 需要验证大量数据(如导入的Excel数据),性能较差?

**解决方案**:
```typescript
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'

// 批量验证
const validateBatchData = (dataList: any[]) => {
  const errors: string[] = []

  // 使用for循环代替forEach,性能更好
  for (let i = 0; i < dataList.length; i++) {
    const item = dataList[i]

    // 提前返回,避免不必要的验证
    if (!item.email) {
      errors.push(`第${i + 1}行: 邮箱不能为空`)
      continue
    }

    if (!isEmail(item.email)) {
      errors.push(`第${i + 1}行: 邮箱格式错误`)
    }

    if (item.phone && !isChinesePhoneNumber(item.phone)) {
      errors.push(`第${i + 1}行: 手机号格式错误`)
    }
  }

  return errors
}

// 分批验证,避免阻塞UI
const validateLargeData = async (dataList: any[]) => {
  const batchSize = 1000
  const errors: string[] = []

  for (let i = 0; i < dataList.length; i += batchSize) {
    const batch = dataList.slice(i, i + batchSize)
    const batchErrors = validateBatchData(batch)
    errors.push(...batchErrors)

    // 让出主线程,避免阻塞
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  return errors
}
```