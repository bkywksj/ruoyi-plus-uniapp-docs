---
iframe: true
url: https://uni.ruoyi.plus/demo/pages-sub/feedback/overlay
---

# Overlay 遮罩层

## 介绍

Overlay 是一个遮罩层组件,用于创建半透明的背景遮罩,强调特定的页面元素并阻止用户进行其他操作。该组件基于 Transition 过渡动画组件实现,提供平滑的淡入淡出效果,常用于弹出层、对话框、抽屉等组件的背景遮罩。

**核心特性:**

- **淡入淡出动画** - 基于 Transition 组件实现平滑的显示/隐藏过渡效果
- **滚动锁定** - 支持锁定背景页面滚动,防止用户误操作
- **自定义层级** - 支持设置 z-index 层级,确保遮罩正确覆盖
- **自定义样式** - 支持自定义背景色、透明度等样式
- **插槽内容** - 支持通过插槽在遮罩层上显示自定义内容
- **点击事件** - 支持监听遮罩层点击事件
- **暗黑模式** - 内置暗黑模式样式适配

## 基本用法

### 基础用法

最基础的用法,显示一个遮罩层:

```vue
<template>
  <view class="demo">
    <wd-button @click="showOverlay = true">显示遮罩层</wd-button>

    <wd-overlay :show="showOverlay" @click="showOverlay = false" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showOverlay = ref(false)
</script>

```

**使用说明:**
- `show` 属性控制遮罩层的显示和隐藏
- `click` 事件在点击遮罩层时触发
- 遮罩层默认为半透明黑色背景

### 嵌入内容

通过默认插槽在遮罩层上显示自定义内容:

```vue
<template>
  <view class="demo">
    <wd-button @click="showOverlay = true">显示内容</wd-button>

    <wd-overlay :show="showOverlay" @click="handleClick">
      <view class="wrapper">
        <view class="content" @click.stop>
          <text class="title">提示</text>
          <text class="message">这是遮罩层上的内容</text>
          <wd-button type="primary" size="small" @click="showOverlay = false">
            关闭
          </wd-button>
        </view>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showOverlay = ref(false)

const handleClick = () => {
  showOverlay.value = false
}
</script>

```

**使用说明:**
- 通过默认插槽传入自定义内容
- 使用 `@click.stop` 阻止内容区域的点击事件冒泡
- 内容需要自行设置定位和样式

### 自定义动画时长

通过 `duration` 属性设置动画持续时间:

```vue
<template>
  <view class="demo">
    <wd-button @click="showFast = true">快速动画 (150ms)</wd-button>
    <wd-button @click="showNormal = true">正常动画 (300ms)</wd-button>
    <wd-button @click="showSlow = true">慢速动画 (500ms)</wd-button>

    <wd-overlay :show="showFast" :duration="150" @click="showFast = false" />
    <wd-overlay :show="showNormal" :duration="300" @click="showNormal = false" />
    <wd-overlay :show="showSlow" :duration="500" @click="showSlow = false" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showFast = ref(false)
const showNormal = ref(false)
const showSlow = ref(false)
</script>

```

**使用说明:**
- `duration` 默认为 300 毫秒
- 支持数值类型设置统一的进入和离开动画时长
- 也支持对象格式分别设置进入和离开时长: `{ enter: 300, leave: 200 }`

### 自定义层级

通过 `z-index` 属性设置遮罩层的层级:

```vue
<template>
  <view class="demo">
    <wd-button @click="showFirst = true">第一层遮罩</wd-button>

    <wd-overlay :show="showFirst" :z-index="100" @click="showFirst = false">
      <view class="wrapper">
        <view class="content" @click.stop>
          <text>第一层遮罩 (z-index: 100)</text>
          <wd-button size="small" @click="showSecond = true">打开第二层</wd-button>
        </view>
      </view>
    </wd-overlay>

    <wd-overlay :show="showSecond" :z-index="200" @click="showSecond = false">
      <view class="wrapper">
        <view class="content" @click.stop>
          <text>第二层遮罩 (z-index: 200)</text>
          <wd-button size="small" @click="showSecond = false">关闭</wd-button>
        </view>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showFirst = ref(false)
const showSecond = ref(false)
</script>

```

**使用说明:**
- `z-index` 默认为 100,高于 tabbar 的 99
- 多层遮罩叠加时,后弹出的应设置更高的层级
- 建议按需递增层级值,如 100、200、300

### 自定义样式

通过 `custom-style` 属性自定义遮罩层样式:

```vue
<template>
  <view class="demo">
    <wd-button @click="showLight = true">浅色遮罩</wd-button>
    <wd-button @click="showDark = true">深色遮罩</wd-button>
    <wd-button @click="showBlur = true">模糊遮罩</wd-button>

    <!-- 浅色遮罩 -->
    <wd-overlay
      :show="showLight"
      custom-style="background-color: rgba(0, 0, 0, 0.3);"
      @click="showLight = false"
    />

    <!-- 深色遮罩 -->
    <wd-overlay
      :show="showDark"
      custom-style="background-color: rgba(0, 0, 0, 0.8);"
      @click="showDark = false"
    />

    <!-- 模糊遮罩(H5) -->
    <wd-overlay
      :show="showBlur"
      custom-style="backdrop-filter: blur(10px); background-color: rgba(255, 255, 255, 0.3);"
      @click="showBlur = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showLight = ref(false)
const showDark = ref(false)
const showBlur = ref(false)
</script>

```

**使用说明:**
- `custom-style` 属性可以设置任意 CSS 样式
- 常用于调整背景色和透明度
- `backdrop-filter` 模糊效果在部分平台可能不支持

### 锁定滚动

通过 `lock-scroll` 属性控制是否锁定背景滚动:

```vue
<template>
  <view class="demo">
    <wd-button @click="showLocked = true">锁定滚动</wd-button>
    <wd-button @click="showUnlocked = true">不锁定滚动</wd-button>

    <!-- 锁定滚动 -->
    <wd-overlay
      :show="showLocked"
      :lock-scroll="true"
      @click="showLocked = false"
    >
      <view class="wrapper">
        <view class="content" @click.stop>
          <text>背景滚动已锁定</text>
          <wd-button size="small" @click="showLocked = false">关闭</wd-button>
        </view>
      </view>
    </wd-overlay>

    <!-- 不锁定滚动 -->
    <wd-overlay
      :show="showUnlocked"
      :lock-scroll="false"
      @click="showUnlocked = false"
    >
      <view class="wrapper">
        <view class="content" @click.stop>
          <text>背景可以滚动</text>
          <wd-button size="small" @click="showUnlocked = false">关闭</wd-button>
        </view>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showLocked = ref(false)
const showUnlocked = ref(false)
</script>

```

**使用说明:**
- `lock-scroll` 默认为 `true`,锁定背景页面滚动
- 设置为 `false` 时,遮罩层显示时背景仍可滚动
- H5 平台通过 `useLockScroll` 组合式函数实现滚动锁定

### 加载指示器

配合加载组件实现全屏加载效果:

```vue
<template>
  <view class="demo">
    <wd-button @click="handleLoad">加载数据</wd-button>

    <wd-overlay :show="loading" :lock-scroll="true">
      <view class="loading-wrapper">
        <wd-loading type="circular" color="#fff" />
        <text class="loading-text">加载中...</text>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const loading = ref(false)

const handleLoad = () => {
  loading.value = true
  // 模拟加载
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

```

### 图片预览

实现简单的图片预览功能:

```vue
<template>
  <view class="demo">
    <image
      class="thumb"
      src="https://example.com/image.jpg"
      mode="aspectFill"
      @click="showPreview = true"
    />

    <wd-overlay :show="showPreview" @click="showPreview = false">
      <view class="preview-wrapper">
        <image
          class="preview-image"
          src="https://example.com/image.jpg"
          mode="aspectFit"
          @click.stop
        />
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showPreview = ref(false)
</script>

```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| show | 是否显示遮罩层 | `boolean` | `false` |
| duration | 动画时长,单位毫秒 | `number \| Record<string, number> \| boolean` | `300` |
| lock-scroll | 是否锁定背景滚动 | `boolean` | `true` |
| z-index | 层级 | `number` | `100` |
| custom-class | 自定义根节点样式类 | `string` | `''` |
| custom-style | 自定义根节点样式 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击遮罩层时触发 | - |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 遮罩层上显示的内容 |

### 类型定义

```typescript
/**
 * 遮罩层组件属性接口
 */
interface WdOverlayProps {
  customStyle?: string
  customClass?: string
  show?: boolean
  duration?: Record<string, number> | number | boolean
  lockScroll?: boolean
  zIndex?: number
}

/**
 * 遮罩层组件事件接口
 */
interface WdOverlayEmits {
  click: []
}
```

## 主题定制

### CSS 变量

Overlay 组件提供以下 CSS 变量用于主题定制:

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| --wot-overlay-bg | 遮罩层背景色 | `rgba(0, 0, 0, 0.7)` |
| --wot-overlay-bg-dark | 暗黑模式背景色 | `rgba(0, 0, 0, 0.8)` |

### 自定义主题示例

```vue
<template>
  <view class="demo">
    <wd-overlay :show="show" custom-class="custom-overlay" @click="show = false" />
  </view>
</template>

<style lang="scss">
.custom-overlay {
  --wot-overlay-bg: rgba(0, 0, 0, 0.5);
}
</style>
```

## 最佳实践

### 1. 阻止内容区域点击冒泡

```vue
<!-- ✅ 使用 @click.stop 阻止冒泡 -->
<wd-overlay :show="show" @click="show = false">
  <view class="content" @click.stop>
    <!-- 点击内容不会关闭遮罩 -->
  </view>
</wd-overlay>
```

### 2. 配合 Popup 使用

Overlay 通常作为 Popup 等弹出组件的内部依赖,不需要单独使用:

```vue
<!-- ✅ 直接使用 Popup,内部已包含 Overlay -->
<wd-popup v-model="show" position="bottom">
  <view class="content">弹出内容</view>
</wd-popup>
```

### 3. 全屏加载场景

```vue
<wd-overlay :show="loading" :lock-scroll="true">
  <view class="loading-center">
    <wd-loading color="#fff" />
  </view>
</wd-overlay>
```

## 常见问题

### 1. 点击遮罩层内容也会关闭

**解决方案:**
在内容元素上添加 `@click.stop` 阻止事件冒泡:

```vue
<wd-overlay :show="show" @click="show = false">
  <view class="content" @click.stop>
    <!-- 内容 -->
  </view>
</wd-overlay>
```

### 2. 背景仍可滚动

**问题原因:**
- 小程序平台 `lock-scroll` 可能不生效
- 未正确设置 `lock-scroll` 属性

**解决方案:**
确保 `lock-scroll` 设置为 `true`,并在遮罩层内容上阻止 touchmove 事件。

### 3. 遮罩层被其他元素覆盖

**解决方案:**
增加 `z-index` 值,确保高于其他固定定位元素:

```vue
<wd-overlay :show="show" :z-index="9999" @click="show = false" />
```

### 4. 动画不流畅

**解决方案:**
适当调整 `duration` 值,建议设置在 200-400ms 之间。

### 5. 遮罩层内容点击无响应

**问题原因:**
- 内容区域未正确定位
- 内容区域被其他元素遮挡

**解决方案:**
```vue
<template>
  <wd-overlay :show="show" @click="show = false">
    <view class="wrapper">
      <!-- 使用绝对定位或 flex 布局居中 -->
      <view class="content" @click.stop>
        <text>内容区域</text>
      </view>
    </view>
  </wd-overlay>
</template>

```

### 6. 小程序端滚动穿透问题

**问题原因:**
- 小程序端 `lock-scroll` 实现方式与 H5 不同
- 可能需要额外处理 touchmove 事件

**解决方案:**
```vue
<template>
  <wd-overlay
    :show="show"
    :lock-scroll="true"
    @click="show = false"
  >
    <view class="wrapper" @touchmove.stop.prevent>
      <view class="content" @click.stop>
        <scroll-view scroll-y class="scroll-content">
          <!-- 可滚动的内容 -->
        </scroll-view>
      </view>
    </view>
  </wd-overlay>
</template>
```

## 高级用法

### 引导遮罩

实现新手引导效果,高亮特定区域:

```vue
<template>
  <view class="demo">
    <view class="guide-target" ref="targetRef">
      <wd-button>目标按钮</wd-button>
    </view>

    <wd-button @click="startGuide">开始引导</wd-button>

    <wd-overlay :show="showGuide" @click="nextStep">
      <view class="guide-wrapper">
        <!-- 高亮区域 -->
        <view class="highlight-area" :style="highlightStyle">
          <view class="highlight-border" />
        </view>

        <!-- 引导提示 -->
        <view class="guide-tip" :style="tipStyle">
          <text class="tip-text">{{ currentTip }}</text>
          <view class="tip-arrow" />
        </view>

        <!-- 步骤指示 -->
        <view class="step-indicator">
          <view
            v-for="(_, index) in steps"
            :key="index"
            :class="['step-dot', { active: index === currentStep }]"
          />
        </view>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const showGuide = ref(false)
const currentStep = ref(0)

const steps = ref([
  { tip: '点击这里开始操作', target: '.guide-target' },
  { tip: '这是功能说明', target: '.feature-area' },
  { tip: '完成引导', target: '.finish-btn' }
])

const currentTip = computed(() => steps.value[currentStep.value]?.tip || '')

const highlightStyle = computed(() => {
  // 根据当前步骤计算高亮区域位置
  return {
    top: '100rpx',
    left: '32rpx',
    width: '200rpx',
    height: '80rpx'
  }
})

const tipStyle = computed(() => {
  return {
    top: '200rpx',
    left: '32rpx'
  }
})

const startGuide = () => {
  currentStep.value = 0
  showGuide.value = true
}

const nextStep = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  } else {
    showGuide.value = false
  }
}
</script>

```

### 确认对话框

使用 Overlay 实现自定义确认对话框:

```vue
<template>
  <view class="demo">
    <wd-button @click="showConfirm">删除项目</wd-button>

    <wd-overlay
      :show="showDialog"
      :close-on-click="false"
      @click="handleOverlayClick"
    >
      <view class="dialog-wrapper">
        <view class="dialog-content" @click.stop>
          <view class="dialog-header">
            <wd-icon name="warning-fill" size="64rpx" color="#faad14" />
            <text class="dialog-title">确认删除</text>
          </view>

          <view class="dialog-body">
            <text class="dialog-message">
              删除后数据将无法恢复,确定要删除吗?
            </text>
          </view>

          <view class="dialog-footer">
            <wd-button plain @click="handleCancel">取消</wd-button>
            <wd-button type="danger" @click="handleConfirm">删除</wd-button>
          </view>
        </view>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showDialog = ref(false)

const showConfirm = () => {
  showDialog.value = true
}

const handleOverlayClick = () => {
  // 点击遮罩不关闭,需要明确操作
}

const handleCancel = () => {
  showDialog.value = false
}

const handleConfirm = () => {
  console.log('确认删除')
  showDialog.value = false
  // 执行删除操作
}
</script>

```

### 侧边抽屉

使用 Overlay 配合过渡效果实现侧边抽屉:

```vue
<template>
  <view class="demo">
    <wd-button @click="showDrawer = true">打开抽屉</wd-button>

    <wd-overlay :show="showDrawer" @click="showDrawer = false">
      <view
        :class="['drawer', { 'drawer--visible': showDrawer }]"
        @click.stop
      >
        <view class="drawer-header">
          <text class="drawer-title">设置</text>
          <wd-icon name="close" size="40rpx" @click="showDrawer = false" />
        </view>

        <scroll-view scroll-y class="drawer-body">
          <view class="setting-item">
            <text class="setting-label">通知推送</text>
            <wd-switch v-model="settings.notification" />
          </view>

          <view class="setting-item">
            <text class="setting-label">深色模式</text>
            <wd-switch v-model="settings.darkMode" />
          </view>

          <view class="setting-item">
            <text class="setting-label">自动更新</text>
            <wd-switch v-model="settings.autoUpdate" />
          </view>

          <view class="setting-item">
            <text class="setting-label">语言</text>
            <text class="setting-value">简体中文</text>
          </view>
        </scroll-view>

        <view class="drawer-footer">
          <wd-button type="primary" block @click="saveSettings">
            保存设置
          </wd-button>
        </view>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const showDrawer = ref(false)

const settings = reactive({
  notification: true,
  darkMode: false,
  autoUpdate: true
})

const saveSettings = () => {
  console.log('保存设置:', settings)
  showDrawer.value = false
}
</script>

```

### 全屏加载带进度

显示带进度的全屏加载效果:

```vue
<template>
  <view class="demo">
    <wd-button @click="startUpload">上传文件</wd-button>

    <wd-overlay :show="uploading" :lock-scroll="true">
      <view class="upload-wrapper">
        <view class="upload-content">
          <view class="progress-circle">
            <view
              class="progress-fill"
              :style="{ '--progress': progress + '%' }"
            />
            <text class="progress-text">{{ progress }}%</text>
          </view>

          <text class="upload-status">{{ statusText }}</text>

          <wd-button
            v-if="progress < 100"
            size="small"
            plain
            @click="cancelUpload"
          >
            取消上传
          </wd-button>
        </view>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const uploading = ref(false)
const progress = ref(0)
let uploadTimer: any = null

const statusText = computed(() => {
  if (progress.value < 100) {
    return '正在上传...'
  }
  return '上传完成!'
})

const startUpload = () => {
  uploading.value = true
  progress.value = 0

  // 模拟上传进度
  uploadTimer = setInterval(() => {
    progress.value += Math.floor(Math.random() * 10) + 1

    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(uploadTimer)

      // 延迟关闭
      setTimeout(() => {
        uploading.value = false
      }, 1000)
    }
  }, 200)
}

const cancelUpload = () => {
  clearInterval(uploadTimer)
  uploading.value = false
  progress.value = 0
}
</script>

```

### 图片查看器

实现带手势操作的图片查看器:

```vue
<template>
  <view class="demo">
    <view class="image-grid">
      <image
        v-for="(img, index) in images"
        :key="index"
        :src="img"
        mode="aspectFill"
        class="grid-image"
        @click="previewImage(index)"
      />
    </view>

    <wd-overlay :show="showViewer" @click="closeViewer">
      <view class="viewer-wrapper">
        <swiper
          :current="currentIndex"
          class="viewer-swiper"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(img, index) in images" :key="index">
            <movable-area class="movable-area">
              <movable-view
                class="movable-view"
                direction="all"
                :scale="true"
                :scale-min="1"
                :scale-max="3"
                @click.stop="closeViewer"
              >
                <image :src="img" mode="aspectFit" class="viewer-image" />
              </movable-view>
            </movable-area>
          </swiper-item>
        </swiper>

        <!-- 指示器 -->
        <view class="viewer-indicator">
          {{ currentIndex + 1 }} / {{ images.length }}
        </view>

        <!-- 工具栏 -->
        <view class="viewer-toolbar" @click.stop>
          <view class="toolbar-btn" @click="downloadImage">
            <wd-icon name="download" size="48rpx" color="#fff" />
          </view>
          <view class="toolbar-btn" @click="shareImage">
            <wd-icon name="share" size="48rpx" color="#fff" />
          </view>
          <view class="toolbar-btn" @click="deleteImage">
            <wd-icon name="delete" size="48rpx" color="#fff" />
          </view>
        </view>

        <!-- 关闭按钮 -->
        <view class="viewer-close" @click="closeViewer">
          <wd-icon name="close" size="48rpx" color="#fff" />
        </view>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showViewer = ref(false)
const currentIndex = ref(0)

const images = ref([
  'https://via.placeholder.com/800x600/1890ff/fff?text=Image1',
  'https://via.placeholder.com/800x600/52c41a/fff?text=Image2',
  'https://via.placeholder.com/800x600/faad14/fff?text=Image3',
  'https://via.placeholder.com/800x600/ff4d4f/fff?text=Image4',
  'https://via.placeholder.com/800x600/722ed1/fff?text=Image5'
])

const previewImage = (index: number) => {
  currentIndex.value = index
  showViewer.value = true
}

const closeViewer = () => {
  showViewer.value = false
}

const onSwiperChange = (e: any) => {
  currentIndex.value = e.detail.current
}

const downloadImage = () => {
  const url = images.value[currentIndex.value]
  uni.downloadFile({
    url,
    success: (res) => {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          uni.showToast({ title: '保存成功', icon: 'success' })
        }
      })
    }
  })
}

const shareImage = () => {
  const url = images.value[currentIndex.value]
  // #ifdef MP-WEIXIN
  uni.showShareImageMenu({
    path: url
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请长按图片分享', icon: 'none' })
  // #endif
}

const deleteImage = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗?',
    success: (res) => {
      if (res.confirm) {
        images.value.splice(currentIndex.value, 1)
        if (images.value.length === 0) {
          closeViewer()
        } else if (currentIndex.value >= images.value.length) {
          currentIndex.value = images.value.length - 1
        }
      }
    }
  })
}
</script>

```

## 注意事项

### 1. 性能优化

- 避免在遮罩层上渲染大量 DOM 元素
- 使用 `v-if` 代替 `v-show` 控制复杂内容的渲染
- 图片预览场景使用懒加载
- 长列表使用虚拟滚动

```vue
<!-- ✅ 推荐:使用 v-if 控制渲染 -->
<wd-overlay :show="show">
  <view v-if="show" class="complex-content">
    <!-- 复杂内容 -->
  </view>
</wd-overlay>

<!-- ❌ 避免:始终渲染复杂内容 -->
<wd-overlay :show="show">
  <view class="complex-content">
    <!-- 复杂内容始终存在 -->
  </view>
</wd-overlay>
```

### 2. 无障碍支持

- 为遮罩层内容添加适当的 ARIA 属性
- 确保焦点管理正确
- 支持键盘操作(ESC 关闭)

```vue
<wd-overlay :show="show" @click="show = false">
  <view
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    class="dialog"
    @click.stop
  >
    <text id="dialog-title">对话框标题</text>
    <!-- 内容 -->
  </view>
</wd-overlay>
```

### 3. 多平台兼容

- H5 平台使用 `useLockScroll` 实现滚动锁定
- 小程序平台需要额外处理 touchmove 事件
- iOS 设备注意底部安全区域
- 注意不同平台的层级差异

### 4. 动画性能

- 使用 CSS transform 实现动画
- 避免使用 JavaScript 动画
- 动画时长建议 200-400ms
- 使用 `will-change` 优化动画性能

```css
.animated-content {
  will-change: transform, opacity;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
```

## 组件依赖

Overlay 组件内部依赖以下组件和函数:

- **wd-transition** - 过渡动画组件,提供淡入淡出效果
- **useLockScroll** - 滚动锁定组合式函数(H5 平台)

## 完整示例

### 综合示例

```vue
<template>
  <view class="demo-page">
    <!-- 基础遮罩 -->
    <view class="demo-section">
      <view class="demo-title">基础用法</view>
      <wd-button @click="showBasic = true">显示遮罩</wd-button>
    </view>

    <!-- 自定义内容 -->
    <view class="demo-section">
      <view class="demo-title">嵌入内容</view>
      <wd-button @click="showContent = true">显示内容</wd-button>
    </view>

    <!-- 加载效果 -->
    <view class="demo-section">
      <view class="demo-title">加载效果</view>
      <wd-button @click="handleLoad">加载数据</wd-button>
    </view>

    <!-- 自定义样式 -->
    <view class="demo-section">
      <view class="demo-title">自定义样式</view>
      <view class="demo-buttons">
        <wd-button size="small" @click="showLight = true">浅色</wd-button>
        <wd-button size="small" @click="showDark = true">深色</wd-button>
        <wd-button size="small" @click="showBlur = true">模糊</wd-button>
      </view>
    </view>

    <!-- 基础遮罩 -->
    <wd-overlay :show="showBasic" @click="showBasic = false" />

    <!-- 嵌入内容 -->
    <wd-overlay :show="showContent" @click="showContent = false">
      <view class="content-wrapper">
        <view class="content-box" @click.stop>
          <text class="content-title">提示</text>
          <text class="content-message">这是遮罩层上的自定义内容</text>
          <wd-button type="primary" size="small" @click="showContent = false">
            我知道了
          </wd-button>
        </view>
      </view>
    </wd-overlay>

    <!-- 加载效果 -->
    <wd-overlay :show="loading" :lock-scroll="true">
      <view class="loading-wrapper">
        <wd-loading type="circular" color="#fff" />
        <text class="loading-text">加载中...</text>
      </view>
    </wd-overlay>

    <!-- 浅色遮罩 -->
    <wd-overlay
      :show="showLight"
      custom-style="background-color: rgba(255, 255, 255, 0.8);"
      @click="showLight = false"
    >
      <view class="light-content">
        <text style="color: #333;">浅色遮罩</text>
      </view>
    </wd-overlay>

    <!-- 深色遮罩 -->
    <wd-overlay
      :show="showDark"
      custom-style="background-color: rgba(0, 0, 0, 0.9);"
      @click="showDark = false"
    >
      <view class="dark-content">
        <text style="color: #fff;">深色遮罩</text>
      </view>
    </wd-overlay>

    <!-- 模糊遮罩 -->
    <wd-overlay
      :show="showBlur"
      custom-style="backdrop-filter: blur(10px); background-color: rgba(255, 255, 255, 0.3);"
      @click="showBlur = false"
    >
      <view class="blur-content">
        <text style="color: #333;">模糊遮罩</text>
      </view>
    </wd-overlay>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showBasic = ref(false)
const showContent = ref(false)
const loading = ref(false)
const showLight = ref(false)
const showDark = ref(false)
const showBlur = ref(false)

const handleLoad = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    uni.showToast({ title: '加载完成', icon: 'success' })
  }, 2000)
}
</script>

```
