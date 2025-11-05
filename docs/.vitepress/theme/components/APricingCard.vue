<template>
  <div class="pricing-card" :class="{ 'is-recommended': recommended }">
    <!-- 推荐标签 -->
    <div v-if="recommended" class="recommended-badge">
      <span>⭐ 推荐</span>
    </div>

    <!-- 卡片头部 -->
    <div class="card-header">
      <h3 class="plan-name">{{ plan }}</h3>
      <p v-if="description" class="plan-description">{{ description }}</p>
    </div>

    <!-- 价格区域 -->
    <div class="card-pricing">
      <div class="price-wrapper">
        <span v-if="typeof price === 'number'" class="price-currency">¥</span>
        <span class="price-value">{{ price }}</span>
      </div>
      <div v-if="originalPrice" class="original-price">原价 ¥{{ originalPrice }}</div>
      <div v-if="savingText" class="saving-text">{{ savingText }}</div>
    </div>

    <!-- 功能列表 -->
    <div class="card-features">
      <ul class="feature-list">
        <li v-for="(feature, index) in features" :key="index" class="feature-item">
          <span class="feature-icon">✓</span>
          <span class="feature-text">{{ feature }}</span>
        </li>
      </ul>
    </div>

    <!-- 选择按钮 -->
    <div class="card-action">
      <button
        class="select-button"
        :class="{ 'is-recommended': recommended }"
        @click="handleContact"
      >
        {{ buttonText }}
      </button>
    </div>

    <!-- 额外信息 -->
    <div v-if="footerText" class="card-footer">
      <p class="footer-text">{{ footerText }}</p>
    </div>
  </div>

  <!-- 自定义弹窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-icon">✓</div>
          <div class="modal-title">已复制</div>
          <div class="modal-message">
            微信同QQ：<span class="qq-number">770492966</span>
          </div>
          <div class="modal-tip">请添加好友咨询</div>
          <button class="modal-button" @click="showModal = false">知道了</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  plan: {
    type: String,
    required: true
  },
  price: {
    type: [Number, String],
    required: true
  },
  originalPrice: {
    type: Number,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  features: {
    type: Array,
    required: true
  },
  recommended: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '立即购买'
  },
  savingText: {
    type: String,
    default: ''
  },
  footerText: {
    type: String,
    default: ''
  }
})

const showModal = ref(false)

const handleContact = async () => {
  const qq = '770492966'
  try {
    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(qq)
    } else {
      // 降级方案：使用传统方法
      const textarea = document.createElement('textarea')
      textarea.value = qq
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    // 显示弹窗
    showModal.value = true
  } catch (err) {
    // 复制失败时也显示弹窗
    showModal.value = true
  }
}
</script>

<style scoped>
.pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 2px solid var(--vp-c-divider);
  transition: all 0.3s ease;
  height: 100%;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--vp-c-brand-1);
}

.pricing-card.is-recommended {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.pricing-card.is-recommended:hover {
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
}

.recommended-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.plan-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.plan-description {
  margin: 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.card-pricing {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 8px;
}

.price-currency {
  font-size: 20px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  margin-right: 4px;
}

.price-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  line-height: 1;
}

.original-price {
  font-size: 14px;
  color: var(--vp-c-text-3);
  text-decoration: line-through;
  margin-bottom: 4px;
}

.saving-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-green-1);
}

.card-features {
  flex: 1;
  margin-bottom: 24px;
}

.feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.feature-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  margin-top: 2px;
}

.feature-text {
  flex: 1;
}

.card-action {
  margin-bottom: 16px;
}

.select-button {
  width: 100%;
  padding: 12px 24px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-button:hover {
  background-color: var(--vp-c-brand-1);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.select-button.is-recommended {
  background-color: var(--vp-c-brand-1);
  color: #fff;
}

.select-button.is-recommended:hover {
  background-color: var(--vp-c-brand-2);
}

.card-footer {
  text-align: center;
}

.footer-text {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .pricing-card {
    padding: 24px 20px;
  }

  .plan-name {
    font-size: 20px;
  }

  .price-value {
    font-size: 36px;
  }
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: var(--vp-c-bg);
  border-radius: 16px;
  padding: 40px 48px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease;
}

.modal-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  font-weight: bold;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 16px;
}

.modal-message {
  font-size: 16px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
  line-height: 1.6;
}

.qq-number {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-size: 18px;
}

.modal-tip {
  font-size: 14px;
  color: var(--vp-c-text-3);
  margin-bottom: 24px;
}

.modal-button {
  padding: 12px 32px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-button:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 弹窗响应式 */
@media (max-width: 768px) {
  .modal-content {
    padding: 32px 24px;
    max-width: 90%;
  }

  .modal-icon {
    width: 56px;
    height: 56px;
    font-size: 32px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-message {
    font-size: 15px;
  }

  .qq-number {
    font-size: 16px;
  }
}
</style>
