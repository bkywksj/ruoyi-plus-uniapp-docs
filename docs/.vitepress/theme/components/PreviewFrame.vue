<template>
  <div v-if="showPreview" class="demo-model">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">移动端预览</div>
      <div class="toolbar-actions">
        <button @click="generateQRCode" class="toolbar-btn" title="二维码">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor"
                  d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 13h2v2h-2v-2zM13 13h2v2h-2v-2zM15 15h2v2h-2v-2zM13 17h2v2h-2v-2zM15 19h2v2h-2v-2zM17 17h2v2h-2v-2zM17 13h2v2h-2v-2zM19 15h2v2h-2v-2z"/>
          </svg>
        </button>
        <button @click="openInNewTab" class="toolbar-btn" title="新窗口打开">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor"
                  d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
          </svg>
        </button>
        <button @click="closePreview" class="toolbar-btn close-btn" title="收起">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor"
                  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- iframe 容器 -->
    <div class="iframe-container">
      <iframe
          :src="previewUrl"
          class="preview-iframe"
          frameborder="0"
          loading="lazy"
      />
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQRCode" class="qrcode-modal" @click="closeQRCode">
      <div class="qrcode-content" @click.stop>
        <div class="qrcode-header">
          <h3>扫码预览</h3>
          <button @click="closeQRCode" class="close-qr">✕</button>
        </div>
        <div class="qrcode-body">
          <div ref="qrcodeRef" class="qrcode-canvas"></div>
          <p class="qrcode-url">{{ previewUrl }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

const showPreview = ref(false)
const showQRCode = ref(false)
const qrcodeRef = ref<HTMLElement>()

const previewUrl = computed(() => page.value.frontmatter?.url || '')

const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

const closePreview = () => {
  showPreview.value = false
}

const generateQRCode = async () => {
  showQRCode.value = true
  await nextTick()

  if (qrcodeRef.value && previewUrl.value) {
    // 清空之前的二维码
    qrcodeRef.value.innerHTML = ''

    // 使用简单的二维码生成 API
    const qrImg = document.createElement('img')
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(previewUrl.value)}`
    qrImg.alt = 'QR Code'
    qrImg.style.width = '200px'
    qrImg.style.height = '200px'
    qrcodeRef.value.appendChild(qrImg)
  }
}

const closeQRCode = () => {
  showQRCode.value = false
}

// 监听页面变化
watch(() => page.value.frontmatter, (frontmatter) => {
  showPreview.value = !!(frontmatter?.iframe && frontmatter?.url)
  console.log('📱 预览状态:', showPreview.value, 'URL:', frontmatter?.url)
}, { immediate: true })
</script>

<style scoped>
.demo-model {
  position: fixed;
  top: 80px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 响应式尺寸 */
@media screen and (min-width: 1440px) {
  .demo-model {
    width: 360px;
    height: calc(360px * 143.6 / 70.9 + 56px);
    right: 64px;
  }
}

@media screen and (min-width: 1280px) and (max-width: 1439px) {
  .demo-model {
    width: 310px;
    height: calc(310px * 143.6 / 70.9 + 56px);
    right: 48px;
  }
}

@media screen and (max-width: 1279px) {
  .demo-model {
    width: 280px;
    height: calc(280px * 143.6 / 70.9 + 56px);
    right: 24px;
  }
}

@media screen and (max-width: 768px) {
  .demo-model {
    display: none;
  }
}

/* 顶部工具栏 */
.toolbar {
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: #f8fafc;
  color: #1e293b;
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* iframe 容器 */
.iframe-container {
  flex: 1;
  background: #f8fafc;
  padding: 8px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 二维码弹窗 */
.qrcode-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.qrcode-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.qrcode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.qrcode-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.close-qr {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #64748b;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-qr:hover {
  background: #f8fafc;
  color: #1e293b;
}

.qrcode-body {
  text-align: center;
}

.qrcode-canvas {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.qrcode-url {
  font-size: 12px;
  color: #64748b;
  word-break: break-all;
  margin: 0;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .demo-model {
    background: #1e293b;
    border-color: #334155;
  }

  .toolbar {
    background: #1e293b;
    border-color: #334155;
  }

  .toolbar-title {
    color: #e2e8f0;
  }

  .toolbar-btn {
    color: #94a3b8;
  }

  .toolbar-btn:hover {
    background: #334155;
    color: #e2e8f0;
  }

  .iframe-container {
    background: #334155;
  }

  .preview-iframe {
    background: #ffffff;
  }

  .qrcode-content {
    background: #1e293b;
  }

  .qrcode-header h3 {
    color: #e2e8f0;
  }

  .close-qr {
    color: #94a3b8;
  }

  .close-qr:hover {
    background: #334155;
    color: #e2e8f0;
  }

  .qrcode-url {
    color: #94a3b8;
    background: #334155;
  }
}
</style>
