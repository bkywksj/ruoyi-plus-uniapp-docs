<template>
  <div class="product-card" :class="[`theme-${theme}`]">
    <!-- 左侧：图标 + 名称 + 标语 + 按钮 -->
    <div class="product-left">
      <div class="product-left-top">
        <div class="product-icon-wrapper">
          <img v-if="logo" :src="logo" :alt="name" class="product-logo-img" />
          <Icon v-else-if="icon" :icon="icon" class="product-icon" />
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h3 class="product-name">{{ name }}</h3>
            <span v-if="badge" class="product-badge">{{ badge }}</span>
          </div>
          <p class="product-slogan">{{ slogan }}</p>
        </div>
      </div>
      <p class="product-description">{{ description }}</p>
      <div class="product-actions">
        <a
          v-for="(action, index) in actions"
          :key="index"
          :href="action.link"
          target="_blank"
          rel="noopener noreferrer"
          class="product-action-btn"
          :class="{ 'is-primary': index === 0 }"
        >
          {{ action.text }}
        </a>
      </div>
    </div>

    <!-- 右侧：亮点列表 -->
    <div class="product-right">
      <div v-for="(item, index) in highlights" :key="index" class="highlight-item">
        <span class="highlight-dot"></span>
        <span class="highlight-text">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '' },
  logo: { type: String, default: '' },
  name: { type: String, required: true },
  slogan: { type: String, default: '' },
  description: { type: String, default: '' },
  highlights: { type: Array, default: () => [] },
  actions: { type: Array, default: () => [] },
  badge: { type: String, default: '' },
  theme: { type: String, default: 'blue' }
})
</script>

<style scoped>
.product-card {
  position: relative;
  display: flex;
  gap: 40px;
  padding: 32px;
  background: var(--vp-c-bg);
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  border-radius: 16px 0 0 16px;
  transition: width 0.3s ease;
}

.product-card.theme-blue::before {
  background: linear-gradient(180deg, #0B6EF0, #04AEF6);
}

.product-card.theme-purple::before {
  background: linear-gradient(180deg, #8B5CF6, #A78BFA);
}

.product-card.theme-green::before {
  background: linear-gradient(180deg, #10B981, #34D399);
}

.product-card.theme-orange::before {
  background: linear-gradient(180deg, #F59E0B, #F97316);
}

.product-card:hover {
  transform: translateX(4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

.product-card:hover::before {
  width: 6px;
}

/* 左侧 */
.product-left {
  flex: 1;
  min-width: 0;
}

.product-left-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

/* 标签 */
.product-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  border-radius: 20px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  white-space: nowrap;
}

/* 图标 */
.product-icon-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.product-card:hover .product-icon-wrapper {
  transform: scale(1.1);
}

.product-card.theme-blue .product-icon-wrapper {
  background: linear-gradient(135deg, rgba(11, 110, 240, 0.1), rgba(4, 174, 246, 0.1));
}

.product-card.theme-purple .product-icon-wrapper {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.1));
}

.product-card.theme-green .product-icon-wrapper {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1));
}

.product-card.theme-orange .product-icon-wrapper {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(249, 115, 22, 0.1));
}

.product-icon {
  font-size: 28px;
  line-height: 1;
}

/* 真实产品 logo（替代 emoji 图标） */
.product-logo-img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

/* 名称 */
.product-name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

/* 标语 */
.product-slogan {
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.product-card.theme-blue .product-slogan {
  color: #0B6EF0;
}

.product-card.theme-purple .product-slogan {
  color: #8B5CF6;
}

.product-card.theme-green .product-slogan {
  color: #10B981;
}

.product-card.theme-orange .product-slogan {
  color: #F59E0B;
}

/* 描述 */
.product-description {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

/* 操作按钮 */
.product-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.product-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.product-action-btn.is-primary {
  color: #fff;
  border: none;
}

.product-card.theme-blue .product-action-btn.is-primary {
  background: linear-gradient(135deg, #0B6EF0, #04AEF6);
}

.product-card.theme-purple .product-action-btn.is-primary {
  background: linear-gradient(135deg, #8B5CF6, #A78BFA);
}

.product-card.theme-green .product-action-btn.is-primary {
  background: linear-gradient(135deg, #10B981, #34D399);
}

.product-card.theme-orange .product-action-btn.is-primary {
  background: linear-gradient(135deg, #F59E0B, #F97316);
}

.product-action-btn.is-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.product-action-btn:not(.is-primary) {
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.product-action-btn:not(.is-primary):hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* 右侧亮点 */
.product-right {
  flex: 0 0 340px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 5px 0;
}

.highlight-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 7px;
}

.product-card.theme-blue .highlight-dot {
  background: #0B6EF0;
}

.product-card.theme-purple .highlight-dot {
  background: #8B5CF6;
}

.product-card.theme-green .highlight-dot {
  background: #10B981;
}

.product-card.theme-orange .highlight-dot {
  background: #F59E0B;
}

.highlight-text {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* 暗黑模式 */
.dark .product-card {
  background: var(--vp-c-bg-soft);
}

.dark .product-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
    gap: 20px;
    padding: 24px 20px;
  }

  .product-right {
    flex: none;
  }

  .product-name {
    font-size: 18px;
  }

  .product-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .product-icon {
    font-size: 24px;
  }
}
</style>
