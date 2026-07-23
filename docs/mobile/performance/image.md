# 图片优化

## 介绍

图片资源通常是应用中占比最大的资源类型,优化不当会导致页面加载缓慢、内存占用过高、用户体验下降等问题。在移动端应用中,图片优化尤为重要,直接影响应用的性能表现和用户留存率。

本文档详细介绍 RuoYi-Plus-UniApp 项目中的图片优化策略,涵盖图片格式选择、图片压缩、懒加载、响应式图片、CDN 加速、缓存策略等核心内容。通过合理应用这些优化技术,可以将图片加载时间缩短 50%-70%,内存占用降低 40%-60%。

**核心优化策略:**

- **格式优化** - 选择合适的图片格式(WebP/AVIF/JPEG/PNG),平衡质量和体积
- **压缩优化** - 使用工具压缩图片,减少体积但保持可接受的质量
- **懒加载** - 使用 IntersectionObserver 实现图片懒加载,减少首屏加载时间
- **响应式图片** - 根据设备屏幕尺寸加载不同尺寸的图片
- **CDN 加速** - 使用 CDN 分发图片资源,提升加载速度
- **缓存策略** - 合理配置图片缓存,减少重复请求
- **Base64 内联** - 小图标使用 Base64 内联,减少 HTTP 请求
- **图片预加载** - 预加载关键图片,提升用户体验

---

## 图片格式选择

### 格式对比

不同的图片格式适用于不同的场景,选择合适的格式是优化的第一步。

**常用图片格式对比:**

| 格式 | 压缩类型 | 透明度 | 动画 | 浏览器支持 | 适用场景 | 压缩率 |
|------|---------|--------|------|-----------|---------|--------|
| **WebP** | 有损/无损 | 是 | 是 | 现代浏览器 | 通用,推荐优先使用 | <Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /> |
| **AVIF** | 有损/无损 | 是 | 是 | 较新浏览器 | 要求极致压缩 | <Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /> |
| **JPEG** | 有损 | 否 | 否 | 所有浏览器 | 照片、复杂图像 | <Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /> |
| **PNG** | 无损 | 是 | 否 | 所有浏览器 | 简单图形、需要透明度 | <Icon icon="lucide:star" /><Icon icon="lucide:star" /> |
| **GIF** | 无损 | 是 | 是 | 所有浏览器 | 简单动画 | <Icon icon="lucide:star" /> |
| **SVG** | 矢量 | 是 | 是 | 所有浏览器 | 图标、logo | <Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /><Icon icon="lucide:star" /> |

### WebP 格式

**WebP 是 Google 开发的现代图片格式,在相同质量下比 JPEG 小 25%-35%,比 PNG 小 45%-50%。**

**WebP 优势:**

1. **压缩率高** - 同等质量下体积更小
2. **支持透明度** - 可替代 PNG
3. **支持动画** - 可替代 GIF
4. **兼容性好** - 现代浏览器和 UniApp 都支持

**使用 WebP:**

```vue
<template>
  <view>
    <!-- 使用 WebP 格式 -->
    <image
      src="/static/images/banner.webp"
      mode="aspectFill"
      class="banner"
    />

    <!-- 提供降级方案 -->
    <image
      :src="imageSrc"
      mode="aspectFill"
      class="banner"
      @error="handleImageError"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 默认使用 WebP,加载失败降级到 JPEG
const imageSrc = ref('/static/images/banner.webp')

const handleImageError = () => {
  // 降级到 JPEG
  imageSrc.value = '/static/images/banner.jpg'
}
</script>
```

**在线转换工具:**

- Squoosh (https://squoosh.app/) - Google 官方工具
- CloudConvert (https://cloudconvert.com/) - 批量转换
- 在线 WebP 转换器 (https://www.aconvert.com/)

### AVIF 格式

**AVIF 是最新的图片格式,压缩率比 WebP 还高 20%-30%,但兼容性较差。**

**使用场景:**

- 要求极致压缩的场景
- 目标用户使用较新设备和浏览器

**降级策略:**

```vue
<template>
  <!-- 多格式降级 -->
  <picture>
    <source srcset="/static/images/banner.avif" type="image/avif" />
    <source srcset="/static/images/banner.webp" type="image/webp" />
    <image src="/static/images/banner.jpg" />
  </picture>
</template>
```

> **注意**: UniApp 中 `<picture>` 标签支持有限,建议使用 JavaScript 检测和降级。

### SVG 矢量图

**SVG 是矢量格式,适合图标、logo 等简单图形,体积小且无损缩放。**

**使用 SVG:**

```vue
<template>
  <view>
    <!-- 直接使用 SVG 文件 -->
    <image src="/static/icons/logo.svg" class="logo" />

    <!-- 内联 SVG -->
    <view class="icon">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor" />
      </svg>
    </view>
  </view>
</template>
```

**SVG 优势:**

- 体积小(通常 < 5KB)
- 无损缩放
- 可用 CSS 修改颜色
- 支持动画

---

## 图片压缩

### 压缩工具

**推荐的图片压缩工具:**

#### 1. TinyPNG / TinyJPG

**在线压缩工具,智能有损压缩,肉眼难以区分质量差异。**

- 网址: https://tinypng.com/
- 支持格式: PNG, JPEG, WebP
- 压缩率: 60%-80%
- 批量处理: 最多 20 张,每张 < 5MB

**使用方法:**

1. 上传图片
2. 等待压缩完成
3. 下载压缩后的图片

#### 2. Squoosh

**Google 开发的在线压缩工具,支持多种格式和高级配置。**

- 网址: https://squoosh.app/
- 支持格式: JPEG, PNG, WebP, AVIF, GIF 等
- 功能: 实时预览、质量对比、尺寸调整

**特点:**

- 支持格式转换
- 实时预览压缩效果
- 可调整压缩质量
- 支持 WebP 和 AVIF

#### 3. ImageOptim (Mac)

**Mac 平台的图片压缩工具,无损压缩。**

- 支持格式: PNG, JPEG, GIF
- 压缩方式: 无损压缩
- 批量处理: 拖拽文件夹即可

#### 4. 命令行工具

**使用命令行工具批量压缩图片。**

**安装:**

```bash
# 安装 imagemin-cli
npm install -g imagemin-cli imagemin-webp imagemin-mozjpeg imagemin-pngquant

# 压缩 JPEG
imagemin input.jpg --plugin=mozjpeg > output.jpg

# 压缩 PNG
imagemin input.png --plugin=pngquant > output.png

# 转换为 WebP
imagemin input.jpg --plugin=webp > output.webp
```

### 压缩配置

**推荐的压缩配置:**

| 图片类型 | 格式 | 质量 | 说明 |
|---------|------|------|------|
| **照片** | JPEG/WebP | 75-85 | 平衡质量和体积 |
| **背景图** | JPEG/WebP | 70-80 | 可接受轻微质量损失 |
| **产品图** | PNG/WebP | 85-95 | 需要高质量 |
| **图标** | SVG/PNG | 无损 | 使用 SVG 或无损 PNG |
| **缩略图** | JPEG/WebP | 60-70 | 体积优先 |

### 构建时压缩

**在项目构建时自动压缩图片。**

**Vite 插件配置:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    // 图片压缩插件
    viteImagemin({
      // JPEG 压缩
      mozjpeg: {
        quality: 80,
      },
      // PNG 压缩
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      // SVG 压缩
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
      // WebP 转换
      webp: {
        quality: 85,
      },
    }),
  ],
})
```

---

## 图片懒加载

### IntersectionObserver 懒加载

**使用 IntersectionObserver API 实现高性能的图片懒加载。**

**懒加载组件实现:**

```vue
<template>
  <image
    :src="currentSrc"
    :mode="mode"
    :class="imageClass"
    :style="imageStyle"
    @load="handleLoad"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface LazyImageProps {
  src: string // 真实图片地址
  placeholder?: string // 占位图
  mode?: string // 图片裁剪模式
  lazy?: boolean // 是否启用懒加载
}

const props = withDefaults(defineProps<LazyImageProps>(), {
  placeholder: '/static/images/placeholder.png',
  mode: 'aspectFill',
  lazy: true,
})

const currentSrc = ref(props.lazy ? props.placeholder : props.src)
const isLoaded = ref(false)
const isError = ref(false)

let observer: UniApp.IntersectionObserver | null = null

/**
 * 创建交叉观察器
 */
const createObserver = () => {
  if (!props.lazy) return

  try {
    observer = uni.createIntersectionObserver()
      .relativeToViewport({ bottom: 200 }) // 提前 200px 开始加载
      .observe('.lazy-image', (res) => {
        if (res.intersectionRatio > 0) {
          // 进入可视区域,加载真实图片
          loadImage()
          // 加载后销毁观察器
          destroyObserver()
        }
      })
  } catch (error) {
    console.error('创建懒加载观察器失败:', error)
    // 降级:直接加载图片
    loadImage()
  }
}

/**
 * 加载真实图片
 */
const loadImage = () => {
  currentSrc.value = props.src
}

/**
 * 图片加载成功
 */
const handleLoad = () => {
  isLoaded.value = true
}

/**
 * 图片加载失败
 */
const handleError = () => {
  isError.value = true
  // 加载失败时显示默认图片
  currentSrc.value = '/static/images/error.png'
}

/**
 * 销毁观察器
 */
const destroyObserver = () => {
  if (observer) {
    try {
      observer.disconnect()
    } catch (error) {
      console.error('销毁懒加载观察器失败:', error)
    }
    observer = null
  }
}

const imageClass = computed(() => ({
  'lazy-image': true,
  'loaded': isLoaded.value,
  'error': isError.value,
}))

onMounted(() => {
  if (props.lazy) {
    createObserver()
  }
})

onUnmounted(() => {
  destroyObserver()
})
</script>

```

**使用懒加载组件:**

```vue
<template>
  <view>
    <!-- 启用懒加载 -->
    <lazy-image
      src="https://cdn.example.com/image1.jpg"
      placeholder="/static/images/placeholder.png"
      mode="aspectFill"
    />

    <!-- 禁用懒加载(首屏图片) -->
    <lazy-image
      src="https://cdn.example.com/banner.jpg"
      :lazy="false"
    />
  </view>
</template>

<script setup lang="ts">
import LazyImage from '@/components/LazyImage.vue'
</script>
```

### 列表懒加载

**在列表中使用懒加载,优化长列表性能。**

```vue
<template>
  <scroll-view
    scroll-y
    class="goods-list"
    @scrolltolower="loadMore"
  >
    <view
      v-for="item in goodsList"
      :key="item.id"
      class="goods-item"
    >
      <!-- 使用懒加载组件 -->
      <lazy-image
        :src="item.image"
        mode="aspectFill"
        class="goods-image"
      />
      <view class="goods-info">
        <text class="goods-name">{{ item.name }}</text>
        <text class="goods-price">¥{{ item.price }}</text>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore" class="loading">加载中...</view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LazyImage from '@/components/LazyImage.vue'

const goodsList = ref([])
const hasMore = ref(true)

const loadMore = async () => {
  if (!hasMore.value) return

  const newData = await fetchGoodsList()
  goodsList.value.push(...newData)

  if (newData.length === 0) {
    hasMore.value = false
  }
}
</script>
```

### 原生 image 组件懒加载

**UniApp 的 `<image>` 组件自带懒加载属性。**

```vue
<template>
  <!-- 启用懒加载 -->
  <image
    src="https://cdn.example.com/image.jpg"
    lazy-load
    mode="aspectFill"
    @load="handleLoad"
    @error="handleError"
  />
</template>

<script setup lang="ts">
const handleLoad = (e: Event) => {
  console.log('图片加载成功')
}

const handleError = (e: Event) => {
  console.error('图片加载失败')
}
</script>
```

**lazy-load 属性说明:**

- 默认值: `false`
- 支持平台: App、H5、微信小程序
- 原理: 图片距离可视区域一定距离时才开始加载

---

## 响应式图片

### 根据屏幕尺寸加载

**根据设备屏幕尺寸加载不同尺寸的图片,节省流量和内存。**

**响应式图片 Composable:**

```typescript
// composables/useResponsiveImage.ts
import { computed } from 'vue'

interface ImageSources {
  small: string // 小屏设备 (< 375px)
  medium: string // 中等屏幕 (375px - 750px)
  large: string // 大屏设备 (> 750px)
  original?: string // 原图
}

export const useResponsiveImage = (sources: ImageSources) => {
  /**
   * 获取屏幕宽度
   */
  const getScreenWidth = (): number => {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.screenWidth
  }

  /**
   * 根据屏幕宽度选择合适的图片
   */
  const imageSrc = computed(() => {
    const screenWidth = getScreenWidth()

    if (screenWidth < 375) {
      return sources.small
    } else if (screenWidth < 750) {
      return sources.medium
    } else {
      return sources.large
    }
  })

  /**
   * 获取原图
   */
  const getOriginal = () => {
    return sources.original || sources.large
  }

  return {
    imageSrc,
    getOriginal,
  }
}
```

**使用响应式图片:**

```vue
<template>
  <view>
    <!-- 自动选择合适尺寸 -->
    <image :src="imageSrc" mode="aspectFill" />

    <!-- 点击查看原图 -->
    <button @tap="previewOriginal">查看原图</button>
  </view>
</template>

<script setup lang="ts">
import { useResponsiveImage } from '@/composables/useResponsiveImage'

const { imageSrc, getOriginal } = useResponsiveImage({
  small: 'https://cdn.example.com/image-375w.jpg',
  medium: 'https://cdn.example.com/image-750w.jpg',
  large: 'https://cdn.example.com/image-1500w.jpg',
  original: 'https://cdn.example.com/image-original.jpg',
})

const previewOriginal = () => {
  uni.previewImage({
    urls: [getOriginal()],
  })
}
</script>
```

### srcset 和 sizes

**使用 srcset 和 sizes 属性实现响应式图片(H5)。**

```vue
<template>
  <!-- #ifdef H5 -->
  <img
    :src="defaultSrc"
    :srcset="srcset"
    :sizes="sizes"
    alt="响应式图片"
  />
  <!-- #endif -->

  <!-- #ifndef H5 -->
  <image :src="imageSrc" mode="aspectFill" />
  <!-- #endif -->
</template>

<script setup lang="ts">
const defaultSrc = 'https://cdn.example.com/image-750w.jpg'

const srcset = `
  https://cdn.example.com/image-375w.jpg 375w,
  https://cdn.example.com/image-750w.jpg 750w,
  https://cdn.example.com/image-1500w.jpg 1500w
`

const sizes = `
  (max-width: 375px) 375px,
  (max-width: 750px) 750px,
  1500px
`

// 移动端使用响应式图片
const imageSrc = computed(() => {
  const screenWidth = uni.getSystemInfoSync().screenWidth
  if (screenWidth < 375) return 'https://cdn.example.com/image-375w.jpg'
  if (screenWidth < 750) return 'https://cdn.example.com/image-750w.jpg'
  return 'https://cdn.example.com/image-1500w.jpg'
})
</script>
```

### 高清屏适配

**根据设备 DPR (Device Pixel Ratio) 加载不同分辨率的图片。**

```typescript
/**
 * 根据 DPR 选择图片
 */
export const getImageByDPR = (baseUrl: string): string => {
  const systemInfo = uni.getSystemInfoSync()
  const dpr = systemInfo.pixelRatio || 1

  if (dpr >= 3) {
    // 3x 屏幕
    return `${baseUrl}@3x.jpg`
  } else if (dpr >= 2) {
    // 2x 屏幕
    return `${baseUrl}@2x.jpg`
  } else {
    // 1x 屏幕
    return `${baseUrl}.jpg`
  }
}
```

**使用示例:**

```vue
<template>
  <image :src="imageSrc" mode="aspectFill" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getImageByDPR } from '@/utils/image'

const imageSrc = computed(() => {
  return getImageByDPR('https://cdn.example.com/image')
  // 返回:
  // - 1x 屏幕: https://cdn.example.com/image.jpg
  // - 2x 屏幕: https://cdn.example.com/image@2x.jpg
  // - 3x 屏幕: https://cdn.example.com/image@3x.jpg
})
</script>
```

---

## CDN 加速

### 使用 CDN 服务

**将图片资源部署到 CDN,利用 CDN 的全球节点加速图片加载。**

**推荐的 CDN 服务商:**

1. **阿里云 OSS + CDN**
   - 稳定可靠
   - 图片处理功能强大
   - 价格合理

2. **七牛云**
   - 免费额度大
   - 图片处理 API 丰富
   - 国内速度快

3. **腾讯云 COS + CDN**
   - 与微信生态集成好
   - 图片处理功能完善

4. **又拍云**
   - 专注于图片和视频
   - 免费额度充足

### 图片处理参数

**使用 CDN 的图片处理参数,按需调整图片尺寸和质量。**

**阿里云 OSS 图片处理:**

```typescript
/**
 * 生成 OSS 图片处理 URL
 */
export const ossImageProcess = (
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'jpg' | 'png' | 'webp' | 'avif'
    mode?: 'lfit' | 'mfit' | 'fill' | 'pad' | 'fixed'
  }
): string => {
  const params = []

  // 调整尺寸
  if (options.width || options.height) {
    const w = options.width || ''
    const h = options.height || ''
    const m = options.mode || 'lfit'
    params.push(`resize,m_${m},w_${w},h_${h}`)
  }

  // 调整质量
  if (options.quality) {
    params.push(`quality,q_${options.quality}`)
  }

  // 格式转换
  if (options.format) {
    params.push(`format,${options.format}`)
  }

  if (params.length === 0) return url

  const processParam = params.join('/')
  return `${url}?x-oss-process=image/${processParam}`
}
```

**使用示例:**

```vue
<template>
  <view>
    <!-- 缩略图:宽度 200px,质量 70% -->
    <image :src="thumbnailSrc" mode="aspectFill" class="thumbnail" />

    <!-- 中图:宽度 750px,质量 85% -->
    <image :src="mediumSrc" mode="aspectFill" class="image" />

    <!-- WebP 格式:宽度 750px,质量 85% -->
    <image :src="webpSrc" mode="aspectFill" class="image" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ossImageProcess } from '@/utils/image'

const baseUrl = 'https://cdn.example.com/image.jpg'

// 缩略图
const thumbnailSrc = computed(() => {
  return ossImageProcess(baseUrl, {
    width: 200,
    quality: 70,
  })
  // 返回: https://cdn.example.com/image.jpg?x-oss-process=image/resize,m_lfit,w_200,h_/quality,q_70
})

// 中图
const mediumSrc = computed(() => {
  return ossImageProcess(baseUrl, {
    width: 750,
    quality: 85,
  })
})

// WebP 格式
const webpSrc = computed(() => {
  return ossImageProcess(baseUrl, {
    width: 750,
    quality: 85,
    format: 'webp',
  })
})
</script>
```

**七牛云图片处理:**

```typescript
/**
 * 生成七牛云图片处理 URL
 */
export const qiniuImageProcess = (
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'jpg' | 'png' | 'webp'
  }
): string => {
  const params = []

  // 调整尺寸
  if (options.width || options.height) {
    const w = options.width || ''
    const h = options.height || ''
    params.push(`imageView2/1/w/${w}/h/${h}`)
  }

  // 调整质量
  if (options.quality) {
    params.push(`quality/${options.quality}`)
  }

  // 格式转换
  if (options.format) {
    params.push(`format/${options.format}`)
  }

  if (params.length === 0) return url

  return `${url}?${params.join('/')}`
}
```

### 域名分离

**使用独立域名存放静态资源,利用浏览器并发请求限制。**

```typescript
// config/cdn.ts
export const CDN_CONFIG = {
  // 主站域名
  main: 'https://www.example.com',

  // 静态资源域名
  static: 'https://static.example.com',

  // 图片 CDN 域名
  image: 'https://img.example.com',

  // 视频 CDN 域名
  video: 'https://video.example.com',
}

/**
 * 获取完整的图片 URL
 */
export const getImageUrl = (path: string): string => {
  if (path.startsWith('http')) return path
  return `${CDN_CONFIG.image}${path}`
}
```

---

## 图片缓存策略

### 浏览器缓存

**配置 HTTP 缓存头,让浏览器缓存图片资源。**

**Nginx 配置示例:**

```nginx
server {
  listen 80;
  server_name img.example.com;

  location ~* \.(jpg|jpeg|png|gif|webp|svg)$ {
    # 缓存 30 天
    expires 30d;
    # 添加缓存控制头
    add_header Cache-Control "public, max-age=2592000, immutable";
    # 添加 ETag
    etag on;
  }

  location ~* \.(ico|css|js)$ {
    # 缓存 7 天
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
  }
}
```

**缓存策略:**

| 资源类型 | 缓存时间 | 说明 |
|---------|---------|------|
| **图片** | 30 天 | 内容不变,长期缓存 |
| **CSS/JS** | 7 天 | 可能更新,中期缓存 |
| **HTML** | 不缓存 | 经常更新,不缓存 |
| **字体** | 1 年 | 内容不变,超长缓存 |

### UniApp 本地缓存

**UniApp 会自动缓存已加载的图片,无需手动处理。**

**缓存位置:**

- **App**: 存储在应用沙盒目录
- **小程序**: 存储在小程序缓存目录
- **H5**: 浏览器缓存

**清除缓存:**

```typescript
/**
 * 清除图片缓存
 */
export const clearImageCache = () => {
  // #ifdef APP-PLUS
  plus.cache.clear((result) => {
    console.log('缓存清除成功')
  })
  // #endif

  // #ifdef H5
  // H5 无法直接清除浏览器缓存,只能清除 localStorage
  localStorage.clear()
  // #endif

  // #ifdef MP
  // 小程序无法手动清除图片缓存
  console.warn('小程序无法手动清除图片缓存')
  // #endif
}
```

### 预加载缓存

**预加载关键图片到缓存,提升用户体验。**

```typescript
/**
 * 预加载图片列表
 */
export const preloadImages = (urls: string[]): Promise<void[]> => {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      // #ifdef H5
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
      // #endif

      // #ifndef H5
      uni.getImageInfo({
        src: url,
        success: () => resolve(),
        fail: reject,
      })
      // #endif
    })
  })

  return Promise.all(promises)
}
```

**使用示例:**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { preloadImages } from '@/utils/image'

onMounted(async () => {
  // 预加载首屏图片
  await preloadImages([
    'https://cdn.example.com/banner1.jpg',
    'https://cdn.example.com/banner2.jpg',
    'https://cdn.example.com/banner3.jpg',
  ])

  console.log('首屏图片预加载完成')
})
</script>
```

---

## Base64 内联优化

### 小图标内联

**将小图标(< 10KB)转换为 Base64 内联,减少 HTTP 请求。**

**Base64 转换工具:**

```bash
# 使用 Node.js 转换
node -e "console.log('data:image/png;base64,' + require('fs').readFileSync('icon.png').toString('base64'))"

# 在线转换
https://www.base64-image.de/
```

**在 CSS 中使用:**

```scss
.icon {
  width: 32rpx;
  height: 32rpx;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...);
  background-size: contain;
}
```

**在模板中使用:**

```vue
<template>
  <image :src="iconBase64" class="icon" />
</template>

<script setup lang="ts">
const iconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
</script>
```

### 自动内联

**使用 Vite 插件自动将小图片转换为 Base64。**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    assetsInlineLimit: 10240, // 小于 10KB 的资源内联为 Base64
  },
})
```

**使用:**

```vue
<template>
  <!-- 小于 10KB 自动内联为 Base64 -->
  <image src="@/static/icons/logo.png" />
</template>
```

### 适用场景

**Base64 内联适用于:**

<Ok/> 小图标(< 10KB)
<Ok/> 首屏必须的图片
<Ok/> 不会变化的图片

**不适用于:**

<No/> 大图片(> 10KB)
<No/> 可能更新的图片
<No/> 需要懒加载的图片

---

## 图片占位符

### 模糊占位符

**使用低质量模糊图片作为占位符,提升加载体验。**

**LQIP (Low Quality Image Placeholder) 技术:**

1. 生成低质量缩略图(宽度 20-40px)
2. 转换为 Base64 内联
3. 显示模糊效果
4. 加载完成后切换到高清图

**实现:**

```vue
<template>
  <view class="image-container">
    <!-- 模糊占位符 -->
    <image
      v-if="!loaded"
      :src="placeholderBase64"
      class="placeholder"
    />

    <!-- 高清图片 -->
    <image
      :src="src"
      class="image"
      :class="{ loaded }"
      @load="handleLoad"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface BlurImageProps {
  src: string
  placeholder: string // Base64 模糊占位符
}

const props = defineProps<BlurImageProps>()

const loaded = ref(false)
const placeholderBase64 = ref(props.placeholder)

const handleLoad = () => {
  loaded.value = true
}
</script>

```

### 颜色占位符

**使用图片主色调作为占位符背景色。**

```vue
<template>
  <view class="image-container" :style="{ backgroundColor: dominantColor }">
    <image
      :src="src"
      class="image"
      :class="{ loaded }"
      @load="handleLoad"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ColorPlaceholderProps {
  src: string
  dominantColor: string // 主色调
}

const props = defineProps<ColorPlaceholderProps>()

const loaded = ref(false)

const handleLoad = () => {
  loaded.value = true
}
</script>

```

### 骨架屏占位符

**使用骨架屏作为图片加载占位符。**

```vue
<template>
  <view class="image-wrapper">
    <!-- 骨架屏 -->
    <view v-if="!loaded" class="skeleton">
      <view class="skeleton-image" />
    </view>

    <!-- 实际图片 -->
    <image
      v-else
      :src="src"
      mode="aspectFill"
      class="image"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SkeletonImageProps {
  src: string
}

const props = defineProps<SkeletonImageProps>()

const loaded = ref(false)

// 预加载图片
uni.getImageInfo({
  src: props.src,
  success: () => {
    loaded.value = true
  },
})
</script>

```

---

## 图片预加载

### 关键图片预加载

**在应用启动或页面加载时预加载关键图片。**

```typescript
// composables/useImagePreload.ts
import { ref } from 'vue'

export const useImagePreload = () => {
  const preloadedImages = ref<Set<string>>(new Set())
  const isPreloading = ref(false)

  /**
   * 预加载单张图片
   */
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 已经预加载过,直接返回
      if (preloadedImages.value.has(url)) {
        resolve()
        return
      }

      // #ifdef H5
      const img = new Image()
      img.onload = () => {
        preloadedImages.value.add(url)
        resolve()
      }
      img.onerror = reject
      img.src = url
      // #endif

      // #ifndef H5
      uni.getImageInfo({
        src: url,
        success: () => {
          preloadedImages.value.add(url)
          resolve()
        },
        fail: reject,
      })
      // #endif
    })
  }

  /**
   * 批量预加载图片
   */
  const preloadImages = async (urls: string[]): Promise<void> => {
    isPreloading.value = true

    try {
      await Promise.all(urls.map(url => preloadImage(url)))
      console.log(`预加载完成: ${urls.length} 张图片`)
    } catch (error) {
      console.error('图片预加载失败:', error)
    } finally {
      isPreloading.value = false
    }
  }

  /**
   * 预加载首屏图片
   */
  const preloadFirstScreen = async (urls: string[]): Promise<void> => {
    // 首屏图片优先级高,并发加载
    await preloadImages(urls)
  }

  /**
   * 预加载下一屏图片
   */
  const preloadNextScreen = (urls: string[]): void => {
    // 下一屏图片优先级低,延迟加载
    setTimeout(() => {
      preloadImages(urls)
    }, 1000)
  }

  return {
    preloadImage,
    preloadImages,
    preloadFirstScreen,
    preloadNextScreen,
    isPreloading,
    preloadedImages,
  }
}
```

**使用示例:**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useImagePreload } from '@/composables/useImagePreload'

const { preloadFirstScreen, preloadNextScreen } = useImagePreload()

onMounted(async () => {
  // 预加载首屏图片
  await preloadFirstScreen([
    'https://cdn.example.com/banner1.jpg',
    'https://cdn.example.com/banner2.jpg',
  ])

  // 预加载下一屏图片
  preloadNextScreen([
    'https://cdn.example.com/product1.jpg',
    'https://cdn.example.com/product2.jpg',
  ])
})
</script>
```

### 智能预加载

**根据用户行为预测并预加载可能访问的图片。**

```typescript
/**
 * 智能预加载
 */
export const useSmartPreload = () => {
  /**
   * 预加载用户可能查看的图片
   */
  const preloadByUserBehavior = (currentIndex: number, totalImages: string[]) => {
    // 预加载当前图片的前后 2 张
    const preloadRange = 2
    const startIndex = Math.max(0, currentIndex - preloadRange)
    const endIndex = Math.min(totalImages.length - 1, currentIndex + preloadRange)

    const imagesToPreload = totalImages.slice(startIndex, endIndex + 1)

    preloadImages(imagesToPreload)
  }

  /**
   * 根据滚动位置预加载
   */
  const preloadByScroll = (scrollTop: number, itemHeight: number, images: string[]) => {
    // 计算当前可见的图片索引
    const visibleIndex = Math.floor(scrollTop / itemHeight)

    // 预加载接下来的 5 张图片
    const nextImages = images.slice(visibleIndex, visibleIndex + 5)

    preloadImages(nextImages)
  }

  return {
    preloadByUserBehavior,
    preloadByScroll,
  }
}
```

---

## 渐进式图片加载

### 渐进式 JPEG

**使用渐进式 JPEG,让图片从模糊到清晰逐步显示。**

**生成渐进式 JPEG:**

```bash
# 使用 ImageMagick 转换
convert input.jpg -interlace Plane output.jpg

# 使用 jpegtran
jpegtran -progressive input.jpg > output.jpg

# 使用在线工具
https://progressive.jpg.io/
```

**优势:**

- 用户更早看到图片内容
- 感知加载速度更快
- 适合大图片

### 多层加载

**分阶段加载不同质量的图片。**

```vue
<template>
  <view class="progressive-image">
    <!-- 第一层:缩略图(Base64) -->
    <image
      v-show="!mediumLoaded"
      :src="thumbnailBase64"
      class="layer thumbnail"
    />

    <!-- 第二层:中等质量 -->
    <image
      v-show="mediumLoaded && !fullLoaded"
      :src="mediumSrc"
      class="layer medium"
      @load="handleMediumLoad"
    />

    <!-- 第三层:高质量原图 -->
    <image
      v-show="fullLoaded"
      :src="fullSrc"
      class="layer full"
      @load="handleFullLoad"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ProgressiveImageProps {
  thumbnailBase64: string // 缩略图 Base64
  mediumSrc: string // 中等质量图片
  fullSrc: string // 高质量原图
}

const props = defineProps<ProgressiveImageProps>()

const mediumLoaded = ref(false)
const fullLoaded = ref(false)

const handleMediumLoad = () => {
  mediumLoaded.value = true
}

const handleFullLoad = () => {
  fullLoaded.value = true
}
</script>

```

---

## 图片错误处理

### 加载失败降级

**图片加载失败时显示默认图片。**

```vue
<template>
  <image
    :src="currentSrc"
    :mode="mode"
    @error="handleError"
    @load="handleLoad"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ImageWithFallbackProps {
  src: string
  fallback?: string // 降级图片
  mode?: string
}

const props = withDefaults(defineProps<ImageWithFallbackProps>(), {
  fallback: '/static/images/default.png',
  mode: 'aspectFill',
})

const currentSrc = ref(props.src)
const retryCount = ref(0)
const MAX_RETRY = 2

const handleError = () => {
  // 重试机制
  if (retryCount.value < MAX_RETRY) {
    retryCount.value++
    // 添加时间戳重试,避免缓存
    currentSrc.value = `${props.src}?retry=${retryCount.value}&t=${Date.now()}`
  } else {
    // 重试失败,使用降级图片
    currentSrc.value = props.fallback
    console.error('图片加载失败:', props.src)
  }
}

const handleLoad = () => {
  // 加载成功,重置重试计数
  retryCount.value = 0
}
</script>
```

### 错误上报

**收集图片加载失败信息,用于问题排查。**

```typescript
/**
 * 图片错误上报
 */
export const reportImageError = (url: string, error: Error) => {
  const errorInfo = {
    url,
    error: error.message,
    timestamp: Date.now(),
    platform: uni.getSystemInfoSync().platform,
    userAgent: navigator?.userAgent,
  }

  // 上报到日志平台
  if (import.meta.env.PROD) {
    uni.request({
      url: 'https://api.example.com/log/image-error',
      method: 'POST',
      data: errorInfo,
    })
  } else {
    console.error('[图片加载失败]', errorInfo)
  }
}
```

---

## 最佳实践

### 1. 选择合适的图片格式

```typescript
// ✅ 推荐:根据场景选择格式
const images = {
  photo: 'image.webp', // 照片用 WebP
  icon: 'icon.svg', // 图标用 SVG
  product: 'product.webp', // 产品图用 WebP
  background: 'bg.jpg', // 背景图用 JPEG
}

// ❌ 不推荐:所有图片都用 PNG
const images = {
  photo: 'image.png', // 体积大
  icon: 'icon.png', // 无法缩放
  product: 'product.png', // 加载慢
}
```

### 2. 压缩所有图片

```bash
# ✅ 推荐:构建前压缩
npm run optimize-images

# ❌ 不推荐:直接使用原图
# 原图可能有几 MB,严重影响加载速度
```

### 3. 使用懒加载

```vue
<!-- ✅ 推荐:启用懒加载 -->
<template>
  <image src="image.jpg" lazy-load />
</template>

<!-- ❌ 不推荐:所有图片立即加载 -->
<template>
  <image src="image1.jpg" />
  <image src="image2.jpg" />
  <image src="image3.jpg" />
  <!-- 首屏加载 100 张图片 -->
</template>
```

### 4. 使用 CDN 和图片处理

```typescript
// ✅ 推荐:使用 CDN + 图片处理
const imageSrc = ossImageProcess('https://cdn.example.com/image.jpg', {
  width: 750,
  quality: 85,
  format: 'webp',
})

// ❌ 不推荐:直接使用原图
const imageSrc = 'https://origin-server.com/image.jpg' // 没有 CDN,没有处理
```

### 5. 合理使用占位符

```vue
<!-- ✅ 推荐:使用占位符 -->
<template>
  <lazy-image
    src="image.jpg"
    placeholder="placeholder.jpg"
  />
</template>

<!-- ❌ 不推荐:没有占位符 -->
<template>
  <image src="image.jpg" />
  <!-- 加载时白屏 -->
</template>
```

### 6. 预加载关键图片

```typescript
// ✅ 推荐:预加载首屏图片
onMounted(async () => {
  await preloadImages([
    'banner1.jpg',
    'banner2.jpg',
  ])
})

// ❌ 不推荐:不预加载
onMounted(() => {
  // 首屏图片加载缓慢
})
```

---

## 常见问题

### 1. 图片加载慢

**问题原因:**

- 图片体积过大
- 未使用 CDN
- 未启用懒加载
- 网络条件差

**解决方案:**

```typescript
// 1. 压缩图片
// 使用 TinyPNG 压缩,减少 60%-80% 体积

// 2. 使用 CDN + 图片处理
const imageSrc = ossImageProcess(url, {
  width: 750,
  quality: 80,
  format: 'webp',
})

// 3. 启用懒加载
<image src="image.jpg" lazy-load />

// 4. 使用响应式图片
const imageSrc = computed(() => {
  const screenWidth = uni.getSystemInfoSync().screenWidth
  return screenWidth < 375 ? 'small.jpg' : 'medium.jpg'
})
```

### 2. 内存占用过高

**问题原因:**

- 加载了过多高清图片
- 未及时释放图片资源
- 图片尺寸过大

**解决方案:**

```vue
<script setup lang="ts">
// 1. 使用虚拟滚动
import { wd-paging } from '@/wd'

// 2. 限制加载数量
const maxImages = 20
const visibleImages = computed(() => {
  return allImages.value.slice(0, maxImages)
})

// 3. 及时清理
onUnmounted(() => {
  // 清理图片引用
  imageList.value = []
})
</script>
```

### 3. 图片显示模糊

**问题原因:**

- 图片分辨率低
- 未适配高清屏
- 图片被过度拉伸

**解决方案:**

```typescript
// 1. 使用高分辨率图片
const imageSrc = getImageByDPR('image')
// 返回:
// - 1x 屏幕: image.jpg
// - 2x 屏幕: image@2x.jpg
// - 3x 屏幕: image@3x.jpg

// 2. 正确设置 mode
<image src="image.jpg" mode="aspectFit" />
// aspectFit: 保持比例,完整显示
// aspectFill: 保持比例,填充容器

// 3. 使用矢量图
<image src="logo.svg" />
```

### 4. 图片加载失败

**问题原因:**

- 图片地址错误
- 网络请求失败
- 跨域问题

**解决方案:**

```vue
<template>
  <image
    :src="currentSrc"
    @error="handleError"
  />
</template>

<script setup lang="ts">
const currentSrc = ref(props.src)

const handleError = () => {
  // 1. 重试加载
  if (retryCount < 2) {
    currentSrc.value = `${props.src}?retry=${++retryCount}`
    return
  }

  // 2. 使用降级图片
  currentSrc.value = '/static/images/default.png'

  // 3. 上报错误
  reportImageError(props.src)
}
</script>
```

### 5. 首屏白屏时间长

**问题原因:**

- 首屏图片过多
- 图片体积过大
- 未使用占位符

**解决方案:**

```vue
<template>
  <!-- 1. 使用骨架屏 -->
  <skeleton-screen v-if="loading" />

  <!-- 2. 使用占位符 -->
  <lazy-image
    v-else
    src="image.jpg"
    placeholder="placeholder.jpg"
  />
</template>

<script setup lang="ts">
// 3. 预加载关键图片
onMounted(async () => {
  await preloadFirstScreen([
    'banner.jpg',
    'logo.png',
  ])
  loading.value = false
})
</script>
```

---

## 性能监控

### 图片加载监控

**监控图片加载性能,发现问题。**

```typescript
/**
 * 图片性能监控
 */
export const useImagePerformance = () => {
  const performanceData = ref<any[]>([])

  /**
   * 记录图片加载时间
   */
  const recordImageLoad = (url: string, loadTime: number) => {
    performanceData.value.push({
      url,
      loadTime,
      timestamp: Date.now(),
    })

    // 上报到分析平台
    if (import.meta.env.PROD) {
      uni.reportAnalytics('image_load', {
        url,
        loadTime,
      })
    }
  }

  /**
   * 获取平均加载时间
   */
  const getAverageLoadTime = () => {
    if (performanceData.value.length === 0) return 0

    const total = performanceData.value.reduce((sum, item) => sum + item.loadTime, 0)
    return total / performanceData.value.length
  }

  return {
    recordImageLoad,
    getAverageLoadTime,
    performanceData,
  }
}
```

**使用示例:**

```vue
<script setup lang="ts">
import { useImagePerformance } from '@/composables/useImagePerformance'

const { recordImageLoad } = useImagePerformance()
const loadStartTime = ref(0)

const handleLoadStart = () => {
  loadStartTime.value = Date.now()
}

const handleLoad = () => {
  const loadTime = Date.now() - loadStartTime.value
  recordImageLoad(props.src, loadTime)
}
</script>
```

---

## 优化检查清单

**图片优化检查清单:**

- [ ] **格式选择**
  - [ ] 优先使用 WebP 格式
  - [ ] 图标使用 SVG
  - [ ] 照片使用 JPEG/WebP

- [ ] **图片压缩**
  - [ ] 所有图片都已压缩
  - [ ] 压缩质量在 70-85 之间
  - [ ] 构建时自动压缩

- [ ] **懒加载**
  - [ ] 非首屏图片启用懒加载
  - [ ] 使用 IntersectionObserver
  - [ ] 提前加载距离设置合理

- [ ] **响应式图片**
  - [ ] 根据屏幕尺寸加载不同尺寸
  - [ ] 适配高清屏 (@2x/@3x)
  - [ ] 使用 CDN 图片处理

- [ ] **CDN 加速**
  - [ ] 使用 CDN 分发图片
  - [ ] 配置图片处理参数
  - [ ] 域名分离

- [ ] **缓存策略**
  - [ ] 配置 HTTP 缓存头
  - [ ] 缓存时间设置合理
  - [ ] 预加载关键图片

- [ ] **占位符**
  - [ ] 使用占位符或骨架屏
  - [ ] 占位符体积小(<10KB)
  - [ ] 加载动画流畅

- [ ] **错误处理**
  - [ ] 加载失败显示默认图片
  - [ ] 实现重试机制
  - [ ] 错误上报

---

## 总结

图片优化是移动端性能优化的重中之重,直接影响用户体验和应用性能。

**关键优化策略:**

1. **格式优化** - 优先使用 WebP,图标使用 SVG
2. **压缩优化** - 使用工具压缩,构建时自动处理
3. **懒加载** - 使用 IntersectionObserver 或 lazy-load 属性
4. **响应式图片** - 根据屏幕尺寸和 DPR 加载合适的图片
5. **CDN 加速** - 使用 CDN 和图片处理服务
6. **缓存策略** - 配置合理的 HTTP 缓存
7. **占位符** - 使用占位符提升加载体验
8. **预加载** - 预加载关键图片

**优化效果:**

- **加载时间** - 缩短 50%-70%
- **包体积** - 减少 40%-60%
- **内存占用** - 降低 40%-60%
- **用户体验** - 显著提升流畅度和满意度

通过系统化的图片优化,可以大幅提升应用性能,为用户提供更好的使用体验。
