<!--
图片预览组件 - VitePress 版本

单张图片
<ImagePreview src="https://example.com/image.jpg" />

多张图片预览（只显示第一张，点击预览所有）
<ImagePreview src="https://example.com/1.jpg,https://example.com/2.jpg,https://example.com/3.jpg" />

多张图片全部显示
<ImagePreview src="https://example.com/1.jpg,https://example.com/2.jpg,https://example.com/3.jpg" :show-all="true" />

自定义布局
<ImagePreview src="https://example.com/1.jpg,https://example.com/2.jpg,https://example.com/3.jpg" :show-all="true" layout="grid" :columns="3" />

限制显示数量
<ImagePreview src="https://example.com/1.jpg,https://example.com/2.jpg,https://example.com/3.jpg,https://example.com/4.jpg" :show-all="true" :max-show="3" />
-->
<template>
  <div class="image-preview-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container" :style="imageStyle">
      <svg class="loading-icon" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      <span class="loading-text">加载中...</span>
    </div>

    <!-- 单张图片或多张图片只显示第一张 -->
    <div v-else-if="!showAll || imageUrls.length <= 1" class="single-image">
      <div v-if="errorImages.has(0)" class="image-error" :style="imageStyle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
      <img
          v-else
          :src="imageUrls[0]"
          :style="imageStyle"
          :loading="lazy ? 'lazy' : 'eager'"
          @click="openPreview(0)"
          @error="handleImageError(0)"
      />
      <!-- 显示图片数量提示 -->
      <div v-if="imageUrls.length > 1" class="image-count">+{{ imageUrls.length - 1 }}</div>
    </div>

    <!-- 多张图片全部显示 -->
    <div v-else class="multiple-images" :class="layoutClass">
      <div v-for="(src, index) in displayImages" :key="index" class="image-item">
        <div v-if="errorImages.has(index)" class="image-error" :style="imageStyle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <img
            v-else
            :src="src"
            :style="imageStyle"
            :loading="lazy ? 'lazy' : 'eager'"
            @click="openPreview(index)"
            @error="handleImageError(index)"
        />
      </div>
      <!-- 显示更多图片的提示 -->
      <div v-if="hasMoreImages" class="more-images" :style="imageStyle" @click="openPreview(maxShow)">
        <div class="more-text">+{{ imageUrls.length - maxShow }}</div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <Teleport to="body">
      <div v-if="previewVisible" class="image-preview-modal" @click="closePreview">
        <!-- 关闭按钮 -->
        <button class="close-btn" @click="closePreview">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- 上一张按钮 -->
        <button v-if="imageUrls.length > 1" class="prev-btn" @click.stop="prevImage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <!-- 下一张按钮 -->
        <button v-if="imageUrls.length > 1" class="next-btn" @click.stop="nextImage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <!-- 预览图片 -->
        <img
            :src="imageUrls[previewIndex]"
            class="preview-image"
            @click.stop
        />

        <!-- 图片计数 -->
        <div class="image-counter">{{ previewIndex + 1 }} / {{ imageUrls.length }}</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * 图片预览组件的属性接口
 */
const props = defineProps({
  /**
   * 图片源地址
   * 支持单个图片地址或多个图片地址（逗号分隔）
   */
  src: {
    type: String,
    default: ''
  },
  /**
   * 图片宽度
   */
  width: {
    type: [Number, String],
    default: 60
  },
  /**
   * 图片高度
   */
  height: {
    type: [Number, String],
    default: 60
  },
  /**
   * 是否启用懒加载
   */
  lazy: {
    type: Boolean,
    default: true
  },
  /**
   * 是否显示悬停效果
   */
  hoverEffect: {
    type: Boolean,
    default: true
  },
  /**
   * 是否显示所有图片
   */
  showAll: {
    type: Boolean,
    default: true
  },
  /**
   * 布局方式
   */
  layout: {
    type: String,
    default: 'flex',
    validator: (value) => ['flex', 'grid'].includes(value)
  },
  /**
   * 网格布局列数（仅在layout为grid时生效）
   */
  columns: {
    type: Number,
    default: 3
  },
  /**
   * 最大显示图片数量
   */
  maxShow: {
    type: Number,
    default: 9999
  },
  /**
   * 图片间距
   */
  gap: {
    type: Number,
    default: 4
  }
})

// 定义 emits
const emit = defineEmits(['error'])

// 响应式状态
const imageUrls = ref([])
const isLoading = ref(false)
const errorImages = ref(new Set())
const previewVisible = ref(false)
const previewIndex = ref(0)

/**
 * 处理单位转换的通用函数
 */
const formatSize = (size) => {
  if (size === '' || size === 0) return ''
  return typeof size === 'string' ? size : `${size}px`
}

/**
 * 解析图片地址列表
 */
const parseImageList = (src) => {
  return src
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
}

/**
 * 处理图片源
 */
const processImageSource = () => {
  if (!props.src) {
    imageUrls.value = []
    isLoading.value = false
    return
  }

  isLoading.value = true
  imageUrls.value = parseImageList(props.src)
  isLoading.value = false
}

/**
 * 计算要显示的图片列表
 */
const displayImages = computed(() => {
  if (!props.showAll) return imageUrls.value.slice(0, 1)
  return imageUrls.value.slice(0, props.maxShow)
})

/**
 * 是否有更多图片
 */
const hasMoreImages = computed(() => {
  return props.showAll && imageUrls.value.length > props.maxShow
})

/**
 * 计算图片样式
 */
const imageStyle = computed(() => {
  const width = formatSize(props.width)
  const height = formatSize(props.height)

  return {
    width,
    height,
    objectFit: 'cover',
    borderRadius: '5px',
    backgroundColor: '#ebeef5',
    boxShadow: '0 0 5px 1px #ccc',
    cursor: 'pointer',
    transition: props.hoverEffect ? 'transform 0.3s ease' : 'none'
  }
})

/**
 * 计算布局类名
 */
const layoutClass = computed(() => {
  return `layout-${props.layout}`
})

/**
 * 处理图片加载错误
 */
const handleImageError = (index) => {
  errorImages.value = new Set([...errorImages.value, index])
  emit('error', index)
}

/**
 * 打开预览
 */
const openPreview = (index) => {
  previewIndex.value = index
  previewVisible.value = true
}

/**
 * 关闭预览
 */
const closePreview = () => {
  previewVisible.value = false
}

/**
 * 上一张图片
 */
const prevImage = () => {
  previewIndex.value = previewIndex.value > 0
      ? previewIndex.value - 1
      : imageUrls.value.length - 1
}

/**
 * 下一张图片
 */
const nextImage = () => {
  previewIndex.value = previewIndex.value < imageUrls.value.length - 1
      ? previewIndex.value + 1
      : 0
}

/**
 * 键盘事件处理
 */
const handleKeydown = (e) => {
  if (!previewVisible.value) return

  if (e.key === 'Escape') {
    closePreview()
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  }
}

// 监听props变化，重新处理图片源
watch(() => props.src, processImageSource, { immediate: true })

// 挂载和卸载键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.image-preview-container {
  display: inline-block;
}

.single-image {
  position: relative;
  display: inline-block;
}

.single-image img:hover {
  transform: v-bind('props.hoverEffect ? "scale(1.05)" : "none"');
}

.image-count {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1;
}

.multiple-images {
  display: flex;
  gap: v-bind('props.gap + "px"');
}

.multiple-images.layout-flex {
  flex-wrap: wrap;
}

.multiple-images.layout-grid {
  display: grid;
  grid-template-columns: repeat(v-bind('props.columns'), 1fr);
}

.image-item img:hover {
  transform: v-bind('props.hoverEffect ? "scale(1.01)" : "none"');
}

.more-images {
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.more-images:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.more-text {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.image-error svg {
  width: 30px;
  height: 30px;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 5px;
  border: 1px dashed #d9d9d9;
}

.loading-icon {
  width: 20px;
  height: 20px;
  color: #409eff;
  animation: rotate 1s linear infinite;
  margin-bottom: 5px;
}

.loading-text {
  font-size: 12px;
  color: #909399;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 预览模态框样式 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.close-btn,
.prev-btn,
.next-btn {
  position: absolute;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover,
.prev-btn:hover,
.next-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn {
  top: 20px;
  right: 20px;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.prev-btn svg,
.next-btn svg {
  width: 24px;
  height: 24px;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  color: white;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 12px;
  border-radius: 12px;
}
</style>
