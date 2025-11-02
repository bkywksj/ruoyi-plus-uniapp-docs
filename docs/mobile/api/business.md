# 业务接口

## 介绍

本文档详细介绍 RuoYi-Plus-UniApp 移动端应用的核心业务接口,涵盖首页广告配置、商品列表、微信分享、订阅消息等功能模块。这些接口为移动端应用提供了完整的业务数据支持和第三方平台集成能力。

**核心特性:**

- **首页业务** - 支持租户识别、广告配置查询、商品列表分页等功能
- **广告管理** - 灵活的广告位配置,支持多种广告类型和投放位置
- **商品展示** - 完整的商品信息查询,包含价格、库存、销量等数据
- **微信集成** - 提供微信 JS-SDK 签名配置,支持分享到微信好友和朋友圈
- **订阅消息** - 小程序订阅消息模板管理,支持消息推送授权
- **多租户支持** - 基于 appid 的租户识别机制,实现数据隔离

参考: src/api/app/home/homeApi.ts:1-34

## API 列表

### 1. getTenantIdByAppid - 获取租户 ID

根据微信小程序或应用的 appid 获取对应的租户 ID,用于多租户环境下的租户识别和数据隔离。

**请求方式:** GET

**请求路径:** `/app/home/getTenantIdByAppid`

**请求参数:**

```typescript
/**
 * 请求参数
 */
interface TenantIdRequest {
  /** 微信小程序或应用的 appid */
  appid?: string
}
```

参考: src/api/app/home/homeApi.ts:5-15

**响应数据:**

```typescript
/**
 * 响应数据
 * @returns 租户ID字符串
 */
type TenantIdResponse = string
```

**完整使用示例:**

```vue
<template>
  <view class="tenant-init-page">
    <view v-if="isLoading" class="loading-container">
      <wd-loading type="spinner" />
      <text class="loading-text">正在初始化应用...</text>
    </view>

    <view v-else-if="error" class="error-container">
      <wd-icon name="error" size="80" color="#ff0000" />
      <text class="error-text">{{ error }}</text>
      <wd-button type="primary" @click="retryInit">重试</wd-button>
    </view>

    <view v-else class="success-container">
      <wd-icon name="success" size="80" color="#00c800" />
      <text class="success-text">应用初始化成功</text>
      <text class="tenant-info">租户ID: {{ tenantId }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getTenantIdByAppid } from '@/api/app/home/homeApi'
import { to } from '@/utils/to'
import { cache } from '@/utils/cache'

// 响应式数据
const isLoading = ref(true)
const error = ref('')
const tenantId = ref('')

/**
 * 初始化租户信息
 * 从微信环境获取 appid,查询对应的租户ID
 */
const initTenant = async () => {
  isLoading.value = true
  error.value = ''

  // 获取微信小程序 appid
  // #ifdef MP-WEIXIN
  const accountInfo = uni.getAccountInfoSync()
  const appid = accountInfo.miniProgram.appId
  console.log('微信小程序 appid:', appid)
  // #endif

  // #ifdef H5
  // H5 环境可以从配置或 URL 参数获取
  const appid = import.meta.env.VITE_APP_ID || ''
  console.log('H5 appid:', appid)
  // #endif

  // 获取租户ID
  const [err, data] = await to(getTenantIdByAppid(appid))

  isLoading.value = false

  if (err) {
    error.value = err.msg || '获取租户信息失败,请检查网络连接'
    console.error('获取租户ID失败:', err)
    return
  }

  if (!data) {
    error.value = '未找到对应的租户信息,请联系管理员'
    return
  }

  // 保存租户ID到缓存
  tenantId.value = data
  cache.set('tenantId', data, 7 * 24 * 3600) // 缓存7天

  console.log('租户ID获取成功:', data)

  // 1秒后跳转到首页
  setTimeout(() => {
    uni.switchTab({ url: '/pages/index/index' })
  }, 1000)
}

/**
 * 重试初始化
 */
const retryInit = () => {
  initTenant()
}

// 组件挂载时初始化
onMounted(() => {
  initTenant()
})
</script>

<style lang="scss" scoped>
.tenant-init-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.loading-container,
.error-container,
.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  padding: 64rpx;
}

.loading-text,
.error-text,
.success-text {
  font-size: 32rpx;
  color: #333;
}

.tenant-info {
  font-size: 28rpx;
  color: #666;
}
</style>
```

**使用说明:**

- **租户识别**: 基于微信小程序或应用的 appid 自动识别租户,实现 SaaS 多租户数据隔离
- **无需认证**: 该接口无需用户登录,可在应用启动时调用
- **跳过等待**: 使用 `skipWait: true` 参数,避免在应用初始化阶段显示全局 loading
- **缓存策略**: 建议将租户ID缓存到本地,避免重复请求
- **错误处理**: 如果获取失败,应提供友好的错误提示和重试机制
- **平台兼容**: 支持微信小程序、H5、APP 等多平台环境

参考: src/api/app/home/homeApi.ts:9-15

---

### 2. listAds - 查询广告列表

查询应用首页或其他页面的广告配置列表,支持按广告位置、类型等条件筛选。

**请求方式:** GET

**请求路径:** `/app/home/listAds`

**请求参数:**

```typescript
/**
 * 广告配置查询类型
 */
interface AdQuery {
  /** 主键id */
  id?: string | number

  /** appid */
  appid?: string | number

  /** 广告位id */
  adUnitId?: string | number

  /** 广告名称 */
  adName?: string

  /** 广告类型(banner/swiper/grid/popup) */
  adType?: string

  /** 投放位置(home/category/detail/mine) */
  position?: string

  /** 广告图片URL */
  img?: string

  /** 描述 */
  description?: string

  /** 跳转appid(用于跨小程序跳转) */
  jumpAppid?: string | number

  /** 跳转路径 */
  jumpPath?: string

  /** 样式配置(JSON字符串) */
  styleConfig?: string

  /** 排序值 */
  sortOrder?: number

  /** 状态(0-禁用 1-启用) */
  status?: string

  /** 创建时间 */
  createTime?: string
}
```

参考: src/api/app/home/homeTypes.ts:1-45

**响应数据:**

```typescript
/**
 * 广告配置视图类型
 */
interface AdVo {
  /** 主键id */
  id: string | number

  /** appid */
  appid: string | number

  /** 广告位id */
  adUnitId: string | number

  /** 广告名称 */
  adName: string

  /** 广告类型 */
  adType: string

  /** 投放位置 */
  position: string

  /** 广告图片 */
  img: string

  /** 描述 */
  description: string

  /** 跳转appid */
  jumpAppid: string | number

  /** 跳转路径 */
  jumpPath: string

  /** 样式配置 */
  styleConfig: string

  /** 排序值 */
  sortOrder: number

  /** 状态 */
  status: string

  /** 创建时间 */
  createTime: string

  /** 更新时间 */
  updateTime: string

  /** 备注 */
  remark: string
}
```

参考: src/api/app/home/homeTypes.ts:93-143

**完整使用示例:**

```vue
<template>
  <view class="home-page">
    <!-- 轮播广告 -->
    <view v-if="swiperAds.length > 0" class="swiper-container">
      <swiper
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        circular
        class="swiper"
      >
        <swiper-item
          v-for="ad in swiperAds"
          :key="ad.id"
          @click="handleAdClick(ad)"
        >
          <image :src="ad.img" mode="aspectFill" class="swiper-image" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 横幅广告 -->
    <view v-if="bannerAds.length > 0" class="banner-container">
      <view
        v-for="ad in bannerAds"
        :key="ad.id"
        class="banner-item"
        @click="handleAdClick(ad)"
      >
        <image :src="ad.img" mode="widthFix" class="banner-image" />
      </view>
    </view>

    <!-- 宫格广告 -->
    <view v-if="gridAds.length > 0" class="grid-container">
      <view
        v-for="ad in gridAds"
        :key="ad.id"
        class="grid-item"
        @click="handleAdClick(ad)"
      >
        <image :src="ad.img" mode="aspectFit" class="grid-image" />
        <text class="grid-text">{{ ad.adName }}</text>
      </view>
    </view>

    <!-- 弹窗广告 -->
    <wd-popup
      v-model="showPopupAd"
      :closable="true"
      position="center"
      @close="handlePopupClose"
    >
      <view v-if="popupAd" class="popup-ad" @click="handleAdClick(popupAd)">
        <image :src="popupAd.img" mode="widthFix" class="popup-image" />
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { listAds } from '@/api/app/home/homeApi'
import type { AdVo } from '@/api/app/home/homeTypes'
import { to } from '@/utils/to'
import { cache } from '@/utils/cache'

// 响应式数据
const adList = ref<AdVo[]>([])
const showPopupAd = ref(false)

/**
 * 计算属性: 轮播广告
 */
const swiperAds = computed(() => {
  return adList.value.filter(
    (ad) => ad.adType === 'swiper' && ad.position === 'home' && ad.status === '1',
  )
})

/**
 * 计算属性: 横幅广告
 */
const bannerAds = computed(() => {
  return adList.value.filter(
    (ad) => ad.adType === 'banner' && ad.position === 'home' && ad.status === '1',
  )
})

/**
 * 计算属性: 宫格广告
 */
const gridAds = computed(() => {
  return adList.value.filter(
    (ad) => ad.adType === 'grid' && ad.position === 'home' && ad.status === '1',
  )
})

/**
 * 计算属性: 弹窗广告
 */
const popupAd = computed(() => {
  const ads = adList.value.filter(
    (ad) => ad.adType === 'popup' && ad.position === 'home' && ad.status === '1',
  )
  return ads.length > 0 ? ads[0] : null
})

/**
 * 加载广告列表
 */
const loadAds = async () => {
  // 从缓存读取
  const cachedAds = cache.get<AdVo[]>('homeAds')
  if (cachedAds) {
    adList.value = cachedAds
    console.log('从缓存加载广告:', cachedAds.length)
  }

  // 查询广告列表
  const [error, data] = await to(
    listAds({
      position: 'home',
      status: '1',
    }),
  )

  if (error) {
    console.error('加载广告失败:', error)
    if (!cachedAds) {
      uni.showToast({ title: '加载广告失败', icon: 'none' })
    }
    return
  }

  if (data && data.length > 0) {
    // 按排序值升序排列
    adList.value = data.sort((a, b) => a.sortOrder - b.sortOrder)

    // 缓存广告数据(缓存30分钟)
    cache.set('homeAds', adList.value, 30 * 60)

    console.log('广告加载成功:', adList.value.length)

    // 显示弹窗广告
    if (popupAd.value && !hasShownPopupToday()) {
      setTimeout(() => {
        showPopupAd.value = true
        markPopupShown()
      }, 1000)
    }
  }
}

/**
 * 处理广告点击
 */
const handleAdClick = (ad: AdVo) => {
  console.log('点击广告:', ad.adName)

  // 解析样式配置
  let config: any = {}
  try {
    config = ad.styleConfig ? JSON.parse(ad.styleConfig) : {}
  } catch (e) {
    console.error('解析样式配置失败:', e)
  }

  // 如果有跳转appid,跳转到其他小程序
  if (ad.jumpAppid) {
    // #ifdef MP-WEIXIN
    uni.navigateToMiniProgram({
      appId: String(ad.jumpAppid),
      path: ad.jumpPath || '',
      success() {
        console.log('跳转小程序成功')
      },
      fail(err) {
        console.error('跳转小程序失败:', err)
        uni.showToast({ title: '跳转失败', icon: 'none' })
      },
    })
    // #endif

    // #ifndef MP-WEIXIN
    uni.showToast({ title: '该功能仅支持微信小程序', icon: 'none' })
    // #endif
    return
  }

  // 跳转到应用内页面
  if (ad.jumpPath) {
    // 判断是否为外部链接
    if (ad.jumpPath.startsWith('http://') || ad.jumpPath.startsWith('https://')) {
      // #ifdef H5
      window.open(ad.jumpPath, '_blank')
      // #endif

      // #ifdef MP-WEIXIN
      // 小程序中需要配置业务域名
      uni.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(ad.jumpPath)}`,
      })
      // #endif
    } else {
      // 应用内页面跳转
      uni.navigateTo({
        url: ad.jumpPath,
        fail(err) {
          console.error('页面跳转失败:', err)
          uni.showToast({ title: '页面跳转失败', icon: 'none' })
        },
      })
    }
  }

  // 关闭弹窗
  if (ad.adType === 'popup') {
    showPopupAd.value = false
  }
}

/**
 * 处理弹窗关闭
 */
const handlePopupClose = () => {
  showPopupAd.value = false
  markPopupShown()
}

/**
 * 检查今天是否已显示过弹窗
 */
const hasShownPopupToday = (): boolean => {
  const lastShown = cache.get<string>('popupAdShown')
  if (!lastShown) return false

  const today = new Date().toDateString()
  return lastShown === today
}

/**
 * 标记弹窗已显示
 */
const markPopupShown = () => {
  const today = new Date().toDateString()
  cache.set('popupAdShown', today, 24 * 3600) // 缓存24小时
}

// 组件挂载时加载广告
onMounted(() => {
  loadAds()
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.swiper-container {
  width: 100%;
  height: 400rpx;
  margin-bottom: 20rpx;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.banner-container {
  padding: 0 24rpx;
  margin-bottom: 20rpx;
}

.banner-item {
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  display: block;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  padding: 24rpx;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.grid-image {
  width: 120rpx;
  height: 120rpx;
}

.grid-text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
}

.popup-ad {
  width: 600rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-image {
  width: 100%;
  display: block;
}
</style>
```

**使用说明:**

- **广告类型**: 支持轮播(swiper)、横幅(banner)、宫格(grid)、弹窗(popup)等多种广告类型
- **投放位置**: 可按页面位置筛选,如首页(home)、分类页(category)、详情页(detail)、个人中心(mine)
- **跳转功能**: 支持应用内页面跳转、跨小程序跳转、外部链接跳转
- **样式配置**: styleConfig 字段存储 JSON 格式的样式配置,可自定义广告展示效果
- **缓存策略**: 广告数据建议缓存 30 分钟,减少服务器请求
- **弹窗控制**: 弹窗广告建议每天只显示一次,避免打扰用户
- **排序显示**: 按 sortOrder 字段升序排列,数值越小越靠前

参考: src/api/app/home/homeApi.ts:17-24

---

### 3. pageGoods - 查询商品列表

分页查询商品列表,支持按分类、名称、状态等条件筛选,用于商品展示页面。

**请求方式:** GET

**请求路径:** `/app/home/pageGoods`

**请求参数:**

```typescript
/**
 * 商品查询类型
 */
interface GoodsQuery {
  /** 商品ID */
  id?: string | number

  /** 商品分类 */
  category?: string

  /** 商品编码 */
  code?: string

  /** 商品名称(支持模糊查询) */
  name?: string

  /** 商品图片 */
  img?: string

  /** 原价 */
  originalPrice?: string

  /** 折扣 */
  discount?: string

  /** 价格 */
  price?: string

  /** 商品描述 */
  description?: string

  /** 库存 */
  stock?: number

  /** 销量 */
  salesCount?: number

  /** 状态(0-下架 1-上架) */
  status?: string

  /** 排序 */
  sortOrder?: number

  /** 创建时间 */
  createTime?: string

  /** 分页参数: 页码 */
  pageNum?: number

  /** 分页参数: 每页数量 */
  pageSize?: number
}
```

参考: src/api/app/home/homeTypes.ts:145-189

**响应数据:**

```typescript
/**
 * 商品视图类型
 */
interface GoodsVo {
  /** 商品ID */
  id: string | number

  /** 商品分类 */
  category: string

  /** 商品编码 */
  code: string

  /** 商品名称 */
  name: string

  /** 商品图片 */
  img: string

  /** 原价 */
  originalPrice: string

  /** 折扣 */
  discount: string

  /** 价格 */
  price: string

  /** 商品描述 */
  description: string

  /** 库存 */
  stock: number

  /** 销量 */
  salesCount: number

  /** 状态 */
  status: string

  /** 排序 */
  sortOrder: number

  /** 创建时间 */
  createTime: string

  /** 更新时间 */
  updateTime: string

  /** 备注 */
  remark: string
}

/**
 * 分页响应数据
 */
interface PageResult<T> {
  /** 数据列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 当前页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
}
```

参考: src/api/app/home/homeTypes.ts:237-287

**完整使用示例:**

```vue
<template>
  <view class="goods-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-search
        v-model="searchKeyword"
        placeholder="搜索商品"
        @search="handleSearch"
        @clear="handleClear"
      />
    </view>

    <!-- 分类筛选 -->
    <view class="category-bar">
      <scroll-view scroll-x class="category-scroll">
        <view
          v-for="cat in categories"
          :key="cat.value"
          :class="['category-item', { active: selectedCategory === cat.value }]"
          @click="handleCategoryChange(cat.value)"
        >
          {{ cat.label }}
        </view>
      </scroll-view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-list">
      <view v-if="isLoading && goodsList.length === 0" class="loading-container">
        <wd-loading type="spinner" />
      </view>

      <view v-else-if="goodsList.length === 0" class="empty-container">
        <wd-empty description="暂无商品" />
      </view>

      <view v-else class="goods-grid">
        <view
          v-for="goods in goodsList"
          :key="goods.id"
          class="goods-item"
          @click="handleGoodsClick(goods)"
        >
          <!-- 商品图片 -->
          <view class="goods-image-wrapper">
            <image :src="goods.img" mode="aspectFill" class="goods-image" />
            <view v-if="goods.stock <= 0" class="sold-out-badge">已售罄</view>
          </view>

          <!-- 商品信息 -->
          <view class="goods-info">
            <text class="goods-name">{{ goods.name }}</text>
            <text class="goods-desc">{{ goods.description }}</text>

            <!-- 价格区域 -->
            <view class="price-area">
              <view class="price-box">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ goods.price }}</text>
                <text v-if="goods.discount" class="discount-badge">
                  {{ goods.discount }}折
                </text>
              </view>
              <text v-if="goods.originalPrice" class="original-price">
                ¥{{ goods.originalPrice }}
              </text>
            </view>

            <!-- 销量 -->
            <view class="sales-info">
              <text class="sales-text">已售{{ formatSales(goods.salesCount) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore" class="load-more" @click="loadMore">
        <wd-loading v-if="isLoadingMore" type="spinner" size="24" />
        <text v-else>加载更多</text>
      </view>

      <view v-else-if="goodsList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { pageGoods } from '@/api/app/home/homeApi'
import type { GoodsVo, GoodsQuery } from '@/api/app/home/homeTypes'
import { to } from '@/utils/to'

// 响应式数据
const goodsList = ref<GoodsVo[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')

// 分页参数
const pageParams = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 分类列表
const categories = [
  { label: '全部', value: '' },
  { label: '数码', value: 'digital' },
  { label: '服装', value: 'clothing' },
  { label: '食品', value: 'food' },
  { label: '图书', value: 'book' },
  { label: '家居', value: 'home' },
]

/**
 * 计算属性: 是否还有更多数据
 */
const hasMore = computed(() => {
  return goodsList.value.length < pageParams.total
})

/**
 * 加载商品列表
 */
const loadGoodsList = async (isRefresh = false) => {
  if (isRefresh) {
    pageParams.pageNum = 1
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  // 构建查询参数
  const query: GoodsQuery = {
    pageNum: pageParams.pageNum,
    pageSize: pageParams.pageSize,
    status: '1', // 只查询上架商品
  }

  // 添加分类筛选
  if (selectedCategory.value) {
    query.category = selectedCategory.value
  }

  // 添加搜索关键词
  if (searchKeyword.value) {
    query.name = searchKeyword.value
  }

  // 查询商品列表
  const [error, data] = await to(pageGoods(query))

  isLoading.value = false
  isLoadingMore.value = false

  if (error) {
    console.error('加载商品失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
    return
  }

  if (data) {
    // 更新分页信息
    pageParams.total = data.total

    if (isRefresh) {
      // 刷新: 替换列表
      goodsList.value = data.records
    } else {
      // 加载更多: 追加到列表
      goodsList.value.push(...data.records)
    }

    console.log('商品加载成功:', data.records.length, '总数:', data.total)
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  console.log('搜索:', searchKeyword.value)
  loadGoodsList(true)
}

/**
 * 处理清除搜索
 */
const handleClear = () => {
  searchKeyword.value = ''
  loadGoodsList(true)
}

/**
 * 处理分类切换
 */
const handleCategoryChange = (category: string) => {
  console.log('切换分类:', category)
  selectedCategory.value = category
  loadGoodsList(true)
}

/**
 * 加载更多
 */
const loadMore = () => {
  if (!hasMore.value || isLoadingMore.value) return

  pageParams.pageNum++
  loadGoodsList(false)
}

/**
 * 处理商品点击
 */
const handleGoodsClick = (goods: GoodsVo) => {
  console.log('点击商品:', goods.name)

  // 跳转到商品详情页
  uni.navigateTo({
    url: `/pages/goods/detail?id=${goods.id}`,
  })
}

/**
 * 格式化销量
 */
const formatSales = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return String(count)
}

// 组件挂载时加载数据
onMounted(() => {
  loadGoodsList(true)
})

// 下拉刷新
onPullDownRefresh(() => {
  loadGoodsList(true).then(() => {
    uni.stopPullDownRefresh()
  })
})

// 上拉加载更多
onReachBottom(() => {
  if (hasMore.value && !isLoadingMore.value) {
    loadMore()
  }
})
</script>

<style lang="scss" scoped>
.goods-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  padding: 20rpx;
  background-color: #fff;
}

.category-bar {
  padding: 20rpx 0;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.category-scroll {
  white-space: nowrap;
  padding: 0 20rpx;
}

.category-item {
  display: inline-block;
  padding: 12rpx 32rpx;
  margin-right: 20rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f5f5f5;

  &.active {
    color: #fff;
    background-color: #1890ff;
  }
}

.goods-list {
  padding: 20rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-container {
  padding: 100rpx 0;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.goods-item {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.goods-image-wrapper {
  position: relative;
  width: 100%;
  height: 340rpx;
}

.goods-image {
  width: 100%;
  height: 100%;
}

.sold-out-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8rpx 20rpx;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 24rpx;
}

.goods-info {
  padding: 20rpx;
}

.goods-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.goods-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 12rpx;
}

.price-area {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.price-symbol {
  font-size: 24rpx;
  color: #ff0000;
  font-weight: 500;
}

.price-value {
  font-size: 36rpx;
  color: #ff0000;
  font-weight: 600;
}

.discount-badge {
  padding: 2rpx 8rpx;
  background-color: #ff0000;
  color: #fff;
  font-size: 20rpx;
  border-radius: 4rpx;
  margin-left: 8rpx;
}

.original-price {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
}

.sales-info {
  font-size: 24rpx;
  color: #999;
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #666;
}

.no-more {
  padding: 40rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>
```

**使用说明:**

- **分页查询**: 支持分页加载,提供流畅的下拉刷新和上拉加载更多功能
- **多条件筛选**: 支持按分类、名称、状态等多个维度筛选商品
- **搜索功能**: 商品名称支持模糊查询,方便用户快速找到目标商品
- **价格展示**: 支持原价、折扣价展示,自动计算折扣信息
- **库存状态**: 显示商品库存状态,售罄商品自动标记
- **销量格式化**: 销量超过1万时自动转换为"万"单位显示
- **图片优化**: 使用 aspectFill 模式确保图片完整显示

参考: src/api/app/home/homeApi.ts:26-33

---

### 4. getJsApiSignature - 获取微信 JS-SDK 签名

获取微信 JS-SDK 签名配置,用于在 H5 页面中调用微信分享、支付等 JS-SDK 接口。

**请求方式:** GET

**请求路径:** `/app/wxShare/getJsApiSignature`

**请求参数:**

```typescript
/**
 * 请求参数
 */
interface JsApiSignatureRequest {
  /** 当前页面URL(完整URL,包含协议、域名、路径、参数,但不包含hash) */
  url: string
}
```

参考: src/api/app/wxShare/wxShareApi.ts:1-11

**响应数据:**

```typescript
/**
 * 微信JS-SDK签名配置
 */
interface JsApiSignature {
  /** 公众号appId */
  appId: string
  /** 时间戳(秒) */
  timestamp: number
  /** 随机字符串 */
  nonceStr: string
  /** 签名 */
  signature: string
  /** 当前网页的URL(不包含#及其后面部分) */
  url?: string
}
```

参考: src/api/app/wxShare/wxShareTypes.ts:1-16

**完整使用示例:**

```vue
<template>
  <view class="share-page">
    <!-- 商品信息 -->
    <view class="goods-detail">
      <image :src="goodsInfo.img" mode="aspectFill" class="goods-image" />
      <view class="goods-info">
        <text class="goods-name">{{ goodsInfo.name }}</text>
        <text class="goods-price">¥{{ goodsInfo.price }}</text>
      </view>
    </view>

    <!-- 分享按钮 -->
    <!-- #ifdef H5 -->
    <view class="share-buttons">
      <wd-button type="primary" @click="shareToFriend">
        分享给朋友
      </wd-button>
      <wd-button type="success" @click="shareToTimeline">
        分享到朋友圈
      </wd-button>
    </view>
    <!-- #endif -->

    <!-- 小程序使用原生分享按钮 -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="share-tip">
      <wd-icon name="info" />
      <text>点击右上角"..."可以分享给朋友或朋友圈</text>
    </view>
    <!-- #endif -->
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getJsApiSignature } from '@/api/app/wxShare/wxShareApi'
import type { JsApiSignature, WxShareConfig } from '@/api/app/wxShare/wxShareTypes'
import { to } from '@/utils/to'

// 响应式数据
const goodsInfo = ref({
  id: '1',
  name: 'iPhone 15 Pro Max',
  price: '9999.00',
  img: 'https://example.com/goods.jpg',
  description: '最新款 iPhone,性能强劲',
})

const wxConfig = ref<JsApiSignature | null>(null)

/**
 * 初始化微信 JS-SDK
 */
const initWxJsSdk = async () => {
  // #ifdef H5
  // 获取当前页面完整URL(不包含hash)
  const url = location.href.split('#')[0]
  console.log('当前页面URL:', url)

  // 获取签名配置
  const [error, data] = await to(getJsApiSignature(url))

  if (error) {
    console.error('获取微信签名失败:', error)
    uni.showToast({ title: '初始化分享失败', icon: 'none' })
    return
  }

  if (!data) {
    console.error('签名配置为空')
    return
  }

  wxConfig.value = data
  console.log('微信签名配置:', data)

  // 配置微信 JS-SDK
  wx.config({
    debug: false, // 开发环境可设为 true
    appId: data.appId,
    timestamp: data.timestamp,
    nonceStr: data.nonceStr,
    signature: data.signature,
    jsApiList: [
      'updateAppMessageShareData', // 分享给朋友
      'updateTimelineShareData', // 分享到朋友圈
      'onMenuShareAppMessage', // 旧版分享给朋友(兼容)
      'onMenuShareTimeline', // 旧版分享到朋友圈(兼容)
    ],
  })

  // 配置成功回调
  wx.ready(() => {
    console.log('微信 JS-SDK 配置成功')
    setupShareConfig()
  })

  // 配置失败回调
  wx.error((res: any) => {
    console.error('微信 JS-SDK 配置失败:', res)
    uni.showToast({ title: '分享功能初始化失败', icon: 'none' })
  })
  // #endif
}

/**
 * 设置默认分享配置
 */
const setupShareConfig = () => {
  // #ifdef H5
  const shareConfig: WxShareConfig = {
    title: goodsInfo.value.name,
    desc: goodsInfo.value.description,
    link: location.href,
    imgUrl: goodsInfo.value.img,
    success() {
      console.log('分享成功')
      uni.showToast({ title: '分享成功', icon: 'success' })
    },
    cancel() {
      console.log('取消分享')
    },
  }

  // 新版API(微信7.0.12及以上)
  wx.updateAppMessageShareData({
    title: shareConfig.title,
    desc: shareConfig.desc,
    link: shareConfig.link,
    imgUrl: shareConfig.imgUrl,
    success: shareConfig.success,
    cancel: shareConfig.cancel,
  })

  wx.updateTimelineShareData({
    title: shareConfig.title,
    link: shareConfig.link,
    imgUrl: shareConfig.imgUrl,
    success: shareConfig.success,
    cancel: shareConfig.cancel,
  })

  // 旧版API(兼容低版本)
  wx.onMenuShareAppMessage(shareConfig)
  wx.onMenuShareTimeline({
    title: shareConfig.title,
    link: shareConfig.link,
    imgUrl: shareConfig.imgUrl,
    success: shareConfig.success,
    cancel: shareConfig.cancel,
  })
  // #endif
}

/**
 * 分享给朋友
 */
const shareToFriend = () => {
  // #ifdef H5
  if (!wxConfig.value) {
    uni.showToast({ title: '分享功能未初始化', icon: 'none' })
    return
  }

  uni.showToast({
    title: '请点击右上角菜单分享',
    icon: 'none',
    duration: 2000,
  })
  // #endif
}

/**
 * 分享到朋友圈
 */
const shareToTimeline = () => {
  // #ifdef H5
  if (!wxConfig.value) {
    uni.showToast({ title: '分享功能未初始化', icon: 'none' })
    return
  }

  uni.showToast({
    title: '请点击右上角菜单分享',
    icon: 'none',
    duration: 2000,
  })
  // #endif
}

// 小程序分享配置
// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  return {
    title: goodsInfo.value.name,
    path: `/pages/goods/detail?id=${goodsInfo.value.id}`,
    imageUrl: goodsInfo.value.img,
  }
})

onShareTimeline(() => {
  return {
    title: goodsInfo.value.name,
    query: `id=${goodsInfo.value.id}`,
    imageUrl: goodsInfo.value.img,
  }
})
// #endif

// 组件挂载时初始化
onMounted(() => {
  // #ifdef H5
  // H5 环境需要初始化微信 JS-SDK
  initWxJsSdk()
  // #endif
})
</script>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 32rpx;
}

.goods-detail {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.goods-image {
  width: 100%;
  height: 500rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.goods-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.goods-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.goods-price {
  font-size: 40rpx;
  font-weight: 600;
  color: #ff0000;
}

.share-buttons {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.share-tip {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
```

**使用说明:**

- **URL 格式**: 传入的 URL 必须是完整的,包含协议(http/https)、域名、路径和参数,但不包含 hash(#)部分
- **平台限制**: 该接口仅用于 H5 环境,微信小程序使用原生分享 API
- **签名有效期**: 签名配置有效期为2小时,过期后需要重新获取
- **JS-SDK 配置**: 获取签名后需要调用 `wx.config()` 配置 JS-SDK
- **分享接口**: 支持新版 `updateAppMessageShareData`/`updateTimelineShareData` 和旧版 `onMenuShareAppMessage`/`onMenuShareTimeline`
- **调试模式**: 开发时可设置 `debug: true` 查看详细日志
- **域名配置**: 需要在微信公众平台配置 JS 接口安全域名

参考: src/api/app/wxShare/wxShareApi.ts:4-10

---

### 5. getTemplateConfigs - 获取订阅消息模板

获取小程序订阅消息模板配置列表,用于向用户请求订阅消息授权。

**请求方式:** GET

**请求路径:** `/app/subscribe/getTemplateConfigs`

**请求参数:**

```typescript
/**
 * 请求参数
 */
interface TemplateConfigRequest {
  /** 小程序appid */
  appid: string
}
```

参考: src/api/app/subscribe/subscribeApi.ts:1-10

**响应数据:**

```typescript
/**
 * 订阅消息模板配置
 */
interface TemplateConfig {
  /** 模板ID */
  templateId: string
  /** 模板标题 */
  title: string
  /** 模板内容描述 */
  content: string
  /** 字段列表(逗号分隔) */
  fields: string
  /** 是否启用 */
  status: boolean
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
  /** 备注 */
  remark?: string
}
```

参考: src/api/app/subscribe/subscribeTypes.ts:1-21

**完整使用示例:**

```vue
<template>
  <view class="subscribe-page">
    <!-- 订阅消息说明 -->
    <view class="subscribe-intro">
      <wd-icon name="bell" size="64" color="#1890ff" />
      <text class="intro-title">订阅消息通知</text>
      <text class="intro-desc">
        订阅后,您将及时收到订单状态、物流信息等重要通知
      </text>
    </view>

    <!-- 模板列表 -->
    <view class="template-list">
      <view
        v-for="template in templates"
        :key="template.templateId"
        class="template-item"
      >
        <view class="template-info">
          <text class="template-title">{{ template.title }}</text>
          <text class="template-content">{{ template.content }}</text>
          <view class="template-fields">
            <text
              v-for="field in parseFields(template.fields)"
              :key="field"
              class="field-tag"
            >
              {{ field }}
            </text>
          </view>
        </view>
        <view class="template-action">
          <wd-switch
            :model-value="isSubscribed(template.templateId)"
            @change="handleToggle(template)"
          />
        </view>
      </view>
    </view>

    <!-- 一键订阅 -->
    <view class="subscribe-actions">
      <wd-button type="primary" block @click="subscribeAll">
        一键订阅全部
      </wd-button>
    </view>

    <!-- 已订阅列表 -->
    <view v-if="subscribedList.length > 0" class="subscribed-section">
      <text class="section-title">已订阅的消息</text>
      <view class="subscribed-list">
        <view
          v-for="item in subscribedList"
          :key="item.templateId"
          class="subscribed-item"
        >
          <text class="subscribed-title">{{ getTemplateName(item.templateId) }}</text>
          <text class="subscribed-time">
            订阅时间: {{ formatTime(item.subscribedAt) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { getTemplateConfigs } from '@/api/app/subscribe/subscribeApi'
import type {
  TemplateConfig,
  SubscribeResult,
  SubscribeRecord,
} from '@/api/app/subscribe/subscribeTypes'
import { to } from '@/utils/to'
import { cache } from '@/utils/cache'
import { formatDate } from '@/utils/date'

// 响应式数据
const templates = ref<TemplateConfig[]>([])
const subscribedList = ref<SubscribeRecord[]>([])

/**
 * 加载订阅模板列表
 */
const loadTemplates = async () => {
  // #ifdef MP-WEIXIN
  // 获取小程序 appid
  const accountInfo = uni.getAccountInfoSync()
  const appid = accountInfo.miniProgram.appId
  console.log('小程序 appid:', appid)

  // 查询模板配置
  const [error, data] = await to(getTemplateConfigs(appid))

  if (error) {
    console.error('加载订阅模板失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
    return
  }

  if (data && data.length > 0) {
    // 只显示启用的模板
    templates.value = data.filter((t) => t.status)
    console.log('订阅模板加载成功:', templates.value.length)
  }
  // #endif

  // 加载本地订阅记录
  loadSubscribedList()
}

/**
 * 加载已订阅列表
 */
const loadSubscribedList = () => {
  const records = cache.get<SubscribeRecord[]>('subscribeRecords') || []
  subscribedList.value = records
  console.log('已订阅列表:', records.length)
}

/**
 * 判断模板是否已订阅
 */
const isSubscribed = (templateId: string): boolean => {
  return subscribedList.value.some((item) => item.templateId === templateId)
}

/**
 * 解析字段列表
 */
const parseFields = (fields: string): string[] => {
  return fields.split(',').filter((f) => f.trim())
}

/**
 * 处理订阅开关切换
 */
const handleToggle = async (template: TemplateConfig) => {
  const isCurrentlySubscribed = isSubscribed(template.templateId)

  if (isCurrentlySubscribed) {
    // 取消订阅
    cancelSubscribe(template.templateId)
  } else {
    // 请求订阅
    await requestSubscribe([template.templateId])
  }
}

/**
 * 请求订阅消息
 */
const requestSubscribe = async (templateIds: string[]): Promise<SubscribeResult> => {
  // #ifdef MP-WEIXIN
  return new Promise((resolve) => {
    uni.requestSubscribeMessage({
      tmplIds: templateIds,
      success(res: any) {
        console.log('订阅成功:', res)

        const subscribedIds: string[] = []
        const failedIds: string[] = []
        const rejectedIds: string[] = []

        // 解析订阅结果
        templateIds.forEach((id) => {
          const status = res[id]
          if (status === 'accept') {
            subscribedIds.push(id)
          } else if (status === 'reject') {
            rejectedIds.push(id)
          } else {
            failedIds.push(id)
          }
        })

        // 保存订阅记录
        if (subscribedIds.length > 0) {
          saveSubscribeRecords(subscribedIds)
          uni.showToast({ title: `成功订阅 ${subscribedIds.length} 条消息`, icon: 'success' })
        }

        if (rejectedIds.length > 0) {
          uni.showToast({
            title: `${rejectedIds.length} 条消息被拒绝`,
            icon: 'none',
          })
        }

        resolve({
          success: subscribedIds.length > 0,
          subscribedIds,
          failedIds,
          rejectedIds,
        })
      },
      fail(err: any) {
        console.error('订阅失败:', err)
        uni.showToast({ title: '订阅失败', icon: 'none' })
        resolve({
          success: false,
          subscribedIds: [],
          failedIds: templateIds,
          rejectedIds: [],
          errMsg: err.errMsg,
        })
      },
    })
  })
  // #endif

  // #ifndef MP-WEIXIN
  uni.showToast({ title: '该功能仅支持微信小程序', icon: 'none' })
  return {
    success: false,
    subscribedIds: [],
    failedIds: templateIds,
    rejectedIds: [],
    errMsg: '不支持的平台',
  }
  // #endif
}

/**
 * 保存订阅记录
 */
const saveSubscribeRecords = (templateIds: string[]) => {
  const now = Date.now()
  const newRecords: SubscribeRecord[] = templateIds.map((id) => ({
    templateId: id,
    subscribedAt: now,
    sent: false,
  }))

  // 合并到现有记录
  const existingRecords = cache.get<SubscribeRecord[]>('subscribeRecords') || []
  const mergedRecords = [...existingRecords, ...newRecords]

  // 去重(保留最新的)
  const uniqueRecords = mergedRecords.reduce(
    (acc, record) => {
      const existing = acc.find((r) => r.templateId === record.templateId)
      if (!existing || record.subscribedAt > existing.subscribedAt) {
        return [...acc.filter((r) => r.templateId !== record.templateId), record]
      }
      return acc
    },
    [] as SubscribeRecord[],
  )

  // 保存到缓存(30天)
  cache.set('subscribeRecords', uniqueRecords, 30 * 24 * 3600)
  subscribedList.value = uniqueRecords
}

/**
 * 取消订阅
 */
const cancelSubscribe = (templateId: string) => {
  const records = cache.get<SubscribeRecord[]>('subscribeRecords') || []
  const newRecords = records.filter((r) => r.templateId !== templateId)

  cache.set('subscribeRecords', newRecords, 30 * 24 * 3600)
  subscribedList.value = newRecords

  uni.showToast({ title: '已取消订阅', icon: 'success' })
}

/**
 * 一键订阅全部
 */
const subscribeAll = async () => {
  if (templates.value.length === 0) {
    uni.showToast({ title: '暂无可订阅的消息', icon: 'none' })
    return
  }

  const templateIds = templates.value.map((t) => t.templateId)
  await requestSubscribe(templateIds)
}

/**
 * 获取模板名称
 */
const getTemplateName = (templateId: string): string => {
  const template = templates.value.find((t) => t.templateId === templateId)
  return template?.title || '未知模板'
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: number): string => {
  return formatDate(timestamp, 'yyyy-MM-dd HH:mm')
}

// 组件挂载时加载数据
onMounted(() => {
  loadTemplates()
})
</script>

<style lang="scss" scoped>
.subscribe-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 32rpx;
}

.subscribe-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 64rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.intro-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.intro-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.6;
}

.template-list {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}

.template-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.template-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-right: 32rpx;
}

.template-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.template-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.template-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;
}

.field-tag {
  padding: 6rpx 16rpx;
  background-color: #f0f0f0;
  color: #666;
  font-size: 24rpx;
  border-radius: 8rpx;
}

.subscribe-actions {
  margin-bottom: 32rpx;
}

.subscribed-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.subscribed-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.subscribed-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.subscribed-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.subscribed-time {
  font-size: 24rpx;
  color: #999;
}
</style>
```

**使用说明:**

- **平台限制**: 订阅消息功能仅支持微信小程序,H5 和 APP 不支持
- **用户授权**: 必须由用户主动触发订阅,不能自动订阅
- **订阅次数**: 每次订阅最多可请求 3 个模板
- **有效期**: 用户订阅后,只能发送一次消息,发送后订阅状态自动失效
- **模板管理**: 需要在微信公众平台配置订阅消息模板
- **本地记录**: 建议在本地缓存用户的订阅记录,方便管理
- **字段说明**: fields 字段包含消息模板的动态字段,用于后续发送消息时填充数据

参考: src/api/app/subscribe/subscribeApi.ts:4-9

---

## 完整类型定义

### 首页相关类型

```typescript
/**
 * 广告配置查询类型
 */
export interface AdQuery extends PageQuery {
  id?: string | number
  appid?: string | number
  adUnitId?: string | number
  adName?: string
  adType?: string
  position?: string
  img?: string
  description?: string
  jumpAppid?: string | number
  jumpPath?: string
  styleConfig?: string
  sortOrder?: number
  status?: string
  createTime?: string
}

/**
 * 广告配置表单类型
 */
export interface AdBo {
  id?: string | number
  appid?: string | number
  adUnitId?: string | number
  adName?: string
  adType?: string
  position?: string
  img?: string
  description?: string
  jumpAppid?: string | number
  jumpPath?: string
  styleConfig?: string
  sortOrder?: number
  status?: string
  remark?: string
}

/**
 * 广告配置视图类型
 */
export interface AdVo {
  id: string | number
  appid: string | number
  adUnitId: string | number
  adName: string
  adType: string
  position: string
  img: string
  description: string
  jumpAppid: string | number
  jumpPath: string
  styleConfig: string
  sortOrder: number
  status: string
  createTime: string
  updateTime: string
  remark: string
}

/**
 * 商品查询类型
 */
export interface GoodsQuery extends PageQuery {
  id?: string | number
  category?: string
  code?: string
  name?: string
  img?: string
  originalPrice?: string
  discount?: string
  price?: string
  description?: string
  stock?: number
  salesCount?: number
  status?: string
  sortOrder?: number
  createTime?: string
}

/**
 * 商品表单类型
 */
export interface GoodsBo {
  id?: string | number
  category?: string
  code?: string
  name?: string
  img?: string
  originalPrice?: string
  discount?: string
  price?: string
  description?: string
  stock?: number
  salesCount?: number
  status?: string
  sortOrder?: number
  remark?: string
}

/**
 * 商品视图类型
 */
export interface GoodsVo {
  id: string | number
  category: string
  code: string
  name: string
  img: string
  originalPrice: string
  discount: string
  price: string
  description: string
  stock: number
  salesCount: number
  status: string
  sortOrder: number
  createTime: string
  updateTime: string
  remark: string
}
```

参考: src/api/app/home/homeTypes.ts:1-288

### 微信分享类型

```typescript
/**
 * 微信JS-SDK签名配置
 */
export interface JsApiSignature {
  appId: string
  timestamp: number
  nonceStr: string
  signature: string
  url?: string
}

/**
 * 微信分享配置
 */
export interface WxShareConfig {
  title: string
  desc: string
  link?: string
  imgUrl: string
  success?: () => void
  cancel?: () => void
}

/**
 * 微信朋友圈分享配置
 */
export interface WxTimelineShareConfig {
  title: string
  link?: string
  imgUrl: string
  success?: () => void
  cancel?: () => void
}

/**
 * 微信JS-SDK配置选项
 */
export interface WxConfigOptions {
  debug?: boolean
  jsApiList?: string[]
}
```

参考: src/api/app/wxShare/wxShareTypes.ts:1-61

### 订阅消息类型

```typescript
/**
 * 订阅消息模板配置
 */
export interface TemplateConfig {
  templateId: string
  title: string
  content: string
  fields: string
  status: boolean
  createTime?: string
  updateTime?: string
  remark?: string
}

/**
 * 订阅结果
 */
export interface SubscribeResult {
  success: boolean
  subscribedIds: string[]
  failedIds: string[]
  rejectedIds: string[]
  errMsg?: string
}

/**
 * 订阅记录(本地存储)
 */
export interface SubscribeRecord {
  templateId: string
  subscribedAt: number
  sent: boolean
}
```

参考: src/api/app/subscribe/subscribeTypes.ts:1-50

---

## 最佳实践

### 1. 租户识别与缓存

在应用启动时获取租户ID并缓存,避免重复请求:

```typescript
// ✅ 推荐: 启动时获取并缓存
const initApp = async () => {
  const cachedTenantId = cache.get<string>('tenantId')
  if (cachedTenantId) {
    console.log('使用缓存的租户ID:', cachedTenantId)
    return cachedTenantId
  }

  const [error, tenantId] = await to(getTenantIdByAppid(appid))
  if (!error && tenantId) {
    cache.set('tenantId', tenantId, 7 * 24 * 3600) // 缓存7天
    return tenantId
  }

  throw new Error('获取租户ID失败')
}

// ❌ 不推荐: 每次都请求
const getTenantId = async () => {
  const [error, tenantId] = await to(getTenantIdByAppid(appid))
  return tenantId
}
```

参考: src/api/app/home/homeApi.ts:9-15

### 2. 广告数据缓存与定时刷新

广告数据变化不频繁,应合理使用缓存减少服务器压力:

```typescript
// ✅ 推荐: 缓存 + 后台刷新
const loadAds = async () => {
  // 先从缓存读取,立即显示
  const cachedAds = cache.get<AdVo[]>('homeAds')
  if (cachedAds) {
    adList.value = cachedAds
  }

  // 后台刷新数据
  const [error, data] = await to(listAds({ position: 'home', status: '1' }))
  if (!error && data) {
    adList.value = data
    cache.set('homeAds', data, 30 * 60) // 缓存30分钟
  }
}

// ❌ 不推荐: 每次都请求,用户体验差
const loadAds = async () => {
  const [error, data] = await to(listAds({ position: 'home' }))
  if (!error) {
    adList.value = data
  }
}
```

参考: src/api/app/home/homeApi.ts:17-24

### 3. 微信 JS-SDK 签名缓存

微信签名有效期2小时,可以缓存避免频繁请求:

```typescript
// ✅ 推荐: 缓存签名配置
const initWxSdk = async () => {
  const url = location.href.split('#')[0]

  // 检查缓存(1.5小时有效期,留出缓冲时间)
  const cacheKey = `wx_signature_${url}`
  const cached = cache.get<JsApiSignature>(cacheKey)
  if (cached) {
    configWxSdk(cached)
    return
  }

  // 获取新签名
  const [error, data] = await to(getJsApiSignature(url))
  if (!error && data) {
    cache.set(cacheKey, data, 90 * 60) // 缓存1.5小时
    configWxSdk(data)
  }
}

// ❌ 不推荐: 每次都请求签名
const initWxSdk = async () => {
  const url = location.href.split('#')[0]
  const [error, data] = await to(getJsApiSignature(url))
  if (!error && data) {
    configWxSdk(data)
  }
}
```

参考: src/api/app/wxShare/wxShareApi.ts:8-10

### 4. 订阅消息批量请求

一次性请求多个模板的订阅授权,提升用户体验:

```typescript
// ✅ 推荐: 批量请求(最多3个)
const subscribeAll = async () => {
  const templateIds = templates.value
    .filter((t) => t.status)
    .map((t) => t.templateId)
    .slice(0, 3) // 微信限制最多3个

  const result = await requestSubscribe(templateIds)
  if (result.success) {
    uni.showToast({ title: `成功订阅 ${result.subscribedIds.length} 条消息` })
  }
}

// ❌ 不推荐: 逐个请求,体验差
const subscribeOne = async (templateId: string) => {
  await requestSubscribe([templateId])
}
```

参考: src/api/app/subscribe/subscribeApi.ts:7-9

### 5. 商品列表分页优化

使用虚拟列表和懒加载优化大数据量展示:

```typescript
// ✅ 推荐: 分页 + 虚拟滚动
const loadMoreGoods = async () => {
  if (!hasMore.value || isLoading.value) return

  pageParams.pageNum++
  const [error, data] = await to(
    pageGoods({
      ...pageParams,
      status: '1',
    }),
  )

  if (!error && data) {
    // 追加数据
    goodsList.value.push(...data.records)
    pageParams.total = data.total
  }
}

// 滚动到底部时触发
onReachBottom(() => {
  loadMoreGoods()
})

// ❌ 不推荐: 一次加载全部数据
const loadAllGoods = async () => {
  const [error, data] = await to(
    pageGoods({
      pageNum: 1,
      pageSize: 9999, // 不建议
    }),
  )
}
```

参考: src/api/app/home/homeApi.ts:31-33

---

## 注意事项

### 1. 多租户数据隔离

在多租户环境下,务必先获取租户ID再进行业务操作:

```typescript
// ✅ 正确流程
const init = async () => {
  // 1. 先获取租户ID
  const tenantId = await getTenantIdByAppid(appid)
  cache.set('tenantId', tenantId)

  // 2. 再进行业务操作
  await loadHomeData()
}

// ❌ 错误: 未获取租户ID直接调用业务接口
const init = async () => {
  await loadHomeData() // 可能获取到错误租户的数据
}
```

参考: src/api/app/home/homeApi.ts:5-15

### 2. 广告跳转安全性

处理广告跳转时要进行安全校验,防止恶意链接:

```typescript
// ✅ 推荐: 验证跳转链接
const handleAdClick = (ad: AdVo) => {
  // 验证跳转路径
  if (ad.jumpPath) {
    // 外部链接需要白名单验证
    if (ad.jumpPath.startsWith('http')) {
      const allowedDomains = ['example.com', 'trusted-site.com']
      const url = new URL(ad.jumpPath)
      if (!allowedDomains.includes(url.hostname)) {
        uni.showToast({ title: '不安全的链接', icon: 'none' })
        return
      }
    }

    // 应用内路径验证
    const validPaths = ['/pages/', '/pagesA/', '/pagesB/']
    if (!validPaths.some((p) => ad.jumpPath.startsWith(p))) {
      uni.showToast({ title: '无效的页面路径', icon: 'none' })
      return
    }
  }

  // 执行跳转
  uni.navigateTo({ url: ad.jumpPath })
}
```

参考: src/api/app/home/homeTypes.ts:119-123

### 3. 微信 JS-SDK URL 处理

微信签名的 URL 必须去除 hash 部分:

```typescript
// ✅ 正确: 去除 hash
const url = location.href.split('#')[0]
await getJsApiSignature(url)

// ❌ 错误: 包含 hash 会导致签名失败
const url = location.href // 如果 URL 包含 #,签名会失败
await getJsApiSignature(url)
```

参考: src/api/app/wxShare/wxShareApi.ts:8-10

### 4. 订阅消息次数限制

订阅消息一次最多请求 3 个模板:

```typescript
// ✅ 正确: 限制最多3个
const templateIds = allTemplates.slice(0, 3)
await uni.requestSubscribeMessage({ tmplIds: templateIds })

// ❌ 错误: 超过3个会失败
const templateIds = allTemplates.slice(0, 5) // 微信会报错
await uni.requestSubscribeMessage({ tmplIds: templateIds })
```

参考: src/api/app/subscribe/subscribeApi.ts:7-9

### 5. 商品价格精度处理

商品价格统一使用字符串类型,避免浮点数精度问题:

```typescript
// ✅ 推荐: 使用字符串
interface GoodsVo {
  price: string // '99.99'
  originalPrice: string // '199.00'
}

// 显示时直接使用
<text>¥{{ goods.price }}</text>

// 计算时转换
const totalPrice = parseFloat(goods.price) * quantity

// ❌ 不推荐: 使用 number
interface GoodsVo {
  price: number // 99.99
}

// 可能产生精度问题: 0.1 + 0.2 = 0.30000000000000004
```

参考: src/api/app/home/homeTypes.ts:255-262

### 6. 弹窗广告显示频率控制

弹窗广告应控制显示频率,避免打扰用户:

```typescript
// ✅ 推荐: 每天只显示一次
const showPopupAd = () => {
  const lastShown = cache.get<string>('popupAdShown')
  const today = new Date().toDateString()

  if (lastShown === today) {
    console.log('今天已显示过弹窗广告')
    return
  }

  // 显示弹窗
  showPopup.value = true
  cache.set('popupAdShown', today, 24 * 3600)
}

// ❌ 不推荐: 每次都显示,用户体验差
const showPopupAd = () => {
  showPopup.value = true
}
```

参考: src/api/app/home/homeTypes.ts:108

### 7. 跨小程序跳转配置

跨小程序跳转需要在微信公众平台配置业务域名:

```typescript
// ✅ 正确: 先检查平台支持
// #ifdef MP-WEIXIN
if (ad.jumpAppid) {
  uni.navigateToMiniProgram({
    appId: String(ad.jumpAppid),
    path: ad.jumpPath || '',
    success() {
      console.log('跳转成功')
    },
    fail(err) {
      console.error('跳转失败:', err)
      // 可能原因:
      // 1. 未在微信公众平台配置关联小程序
      // 2. 目标小程序不存在
      // 3. 目标路径无效
    },
  })
}
// #endif

// ❌ 错误: 不检查平台,H5 会报错
uni.navigateToMiniProgram({
  appId: ad.jumpAppid,
  path: ad.jumpPath,
})
```

参考: src/api/app/home/homeTypes.ts:119-123

### 8. 订阅消息发送时机

订阅消息应在合适的时机发送,避免被用户投诉:

```typescript
// ✅ 推荐: 在关键节点发送
// 订单状态变化
await sendSubscribeMessage({
  templateId: 'xxx',
  data: {
    thing1: { value: '订单已发货' },
    thing2: { value: '顺丰快递' },
    character_string3: { value: 'SF1234567890' },
  },
})

// 活动开始提醒
await sendSubscribeMessage({
  templateId: 'yyy',
  data: {
    thing1: { value: '限时秒杀即将开始' },
    time2: { value: '2025-01-01 10:00' },
  },
})

// ❌ 不推荐: 频繁发送营销消息
// 每天发送促销信息(容易被投诉)
setInterval(() => {
  sendSubscribeMessage({ ... })
}, 24 * 3600 * 1000)
```

参考: src/api/app/subscribe/subscribeTypes.ts:23-37

---

通过合理使用这些业务接口,可以快速构建功能完善、用户体验良好的移动应用。建议结合实际业务需求,灵活运用广告管理、商品展示、微信集成等功能,打造差异化的产品体验。
