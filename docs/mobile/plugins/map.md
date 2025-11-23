# 地图插件

## 介绍

地图插件为 RuoYi-Plus-UniApp 提供完整的地图功能支持,包括地图展示、定位、标记点、路线规划、地址搜索和选点等功能。通过统一封装 uni-app 地图 API 和各平台地图 SDK,实现了跨平台的地图交互体验,支持 App、H5、微信小程序等多个平台。

插件支持高德地图、腾讯地图、百度地图等主流地图服务商,开发者可以根据业务需求选择合适的地图服务。同时提供了丰富的地图组件和工具函数,包括地图展示、标记点管理、气泡窗口、覆盖物绑定、路线绘制等功能。

**核心特性:**

- **跨平台兼容** - 统一封装各平台地图 API,自动适配平台差异
- **多服务商支持** - 支持高德、腾讯、百度等主流地图服务
- **丰富组件** - 提供地图、标记点、折线、多边形等完整组件
- **定位服务** - 支持 GPS 定位、持续定位、后台定位等多种定位方式
- **地址服务** - 提供地理编码、逆地理编码、地址搜索等服务
- **路线规划** - 支持驾车、公交、步行、骑行等多种路线规划

## 平台支持

| 功能 | App | H5 | 微信小程序 | 支付宝小程序 | 说明 |
|------|-----|-----|-----------|-------------|------|
| 地图展示 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| GPS 定位 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| 标记点 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| 路线绘制 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| 地址选择 | ✅ | ✅ | ✅ | ✅ | 全平台支持 |
| 导航 | ✅ | ⚠️ | ✅ | ✅ | H5 需跳转第三方 |
| 后台定位 | ✅ | ❌ | ✅ | ❌ | 需额外权限 |

## 地图配置

### 配置地图 Key

在使用地图功能前,需要在 `manifest.json` 中配置地图服务商的 Key:

```json
{
  "app-plus": {
    "distribute": {
      "sdkConfigs": {
        "maps": {
          "amap": {
            "appkey_ios": "你的高德 iOS Key",
            "appkey_android": "你的高德 Android Key"
          }
        }
      }
    }
  },
  "mp-weixin": {
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序位置接口的效果展示"
      }
    }
  },
  "h5": {
    "sdkConfigs": {
      "maps": {
        "qqmap": {
          "key": "你的腾讯地图 Key"
        }
      }
    }
  }
}
```

### 申请地图 Key

- **高德地图**: https://lbs.amap.com/
- **腾讯地图**: https://lbs.qq.com/
- **百度地图**: https://lbsyun.baidu.com/

## 基本用法

### 显示地图

使用 `map` 组件展示地图:

```vue
<template>
  <view class="map-demo">
    <map
      id="myMap"
      :longitude="longitude"
      :latitude="latitude"
      :scale="scale"
      :markers="markers"
      :show-location="true"
      class="map"
      @markertap="onMarkerTap"
      @callouttap="onCalloutTap"
      @regionchange="onRegionChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 地图中心点
const longitude = ref(116.397428)
const latitude = ref(39.90923)
const scale = ref(15)

// 标记点
const markers = ref([
  {
    id: 1,
    longitude: 116.397428,
    latitude: 39.90923,
    title: '天安门',
    iconPath: '/static/images/marker.png',
    width: 30,
    height: 30,
    callout: {
      content: '北京天安门',
      display: 'ALWAYS',
      padding: 10,
      borderRadius: 5
    }
  }
])

// 点击标记点
const onMarkerTap = (e: any) => {
  console.log('点击标记点:', e.markerId)
}

// 点击气泡
const onCalloutTap = (e: any) => {
  console.log('点击气泡:', e.markerId)
}

// 视野变化
const onRegionChange = (e: any) => {
  if (e.type === 'end') {
    console.log('视野变化完成')
  }
}
</script>

<style lang="scss" scoped>
.map-demo {
  width: 100%;
  height: 100vh;
}

.map {
  width: 100%;
  height: 100%;
}
</style>
```

### 获取当前位置

获取用户当前位置并显示在地图上:

```vue
<template>
  <view class="location-demo">
    <map
      :longitude="location.longitude"
      :latitude="location.latitude"
      :scale="16"
      :show-location="true"
      class="map"
    />
    <view class="info">
      <text>经度: {{ location.longitude }}</text>
      <text>纬度: {{ location.latitude }}</text>
      <text>地址: {{ address }}</text>
    </view>
    <wd-button @click="getCurrentLocation">获取当前位置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface Location {
  longitude: number
  latitude: number
}

const location = ref<Location>({
  longitude: 116.397428,
  latitude: 39.90923
})

const address = ref('')

// 获取当前位置
const getCurrentLocation = async () => {
  try {
    const res = await uni.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      geocode: true
    })

    location.value = {
      longitude: res.longitude,
      latitude: res.latitude
    }

    // 获取地址信息
    if (res.address) {
      address.value = res.address.city + res.address.district + res.address.street
    }

    uni.showToast({ title: '定位成功', icon: 'success' })
  } catch (error) {
    console.error('定位失败:', error)
    uni.showToast({ title: '定位失败', icon: 'error' })
  }
}

onMounted(() => {
  getCurrentLocation()
})
</script>

<style lang="scss" scoped>
.location-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map {
  flex: 1;
}

.info {
  padding: 24rpx;
  background: #fff;

  text {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 8rpx;
  }
}
</style>
```

### 地址选择

使用地址选择器让用户选择位置:

```vue
<template>
  <view class="choose-location-demo">
    <view class="selected-location" v-if="selectedLocation">
      <text class="name">{{ selectedLocation.name }}</text>
      <text class="address">{{ selectedLocation.address }}</text>
    </view>
    <wd-button @click="chooseLocation">选择位置</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface SelectedLocation {
  name: string
  address: string
  longitude: number
  latitude: number
}

const selectedLocation = ref<SelectedLocation | null>(null)

// 选择位置
const chooseLocation = async () => {
  try {
    const res = await uni.chooseLocation({})

    selectedLocation.value = {
      name: res.name,
      address: res.address,
      longitude: res.longitude,
      latitude: res.latitude
    }

    console.log('选择的位置:', res)
  } catch (error: any) {
    if (error.errMsg?.includes('cancel')) {
      // 用户取消
      return
    }
    console.error('选择位置失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.choose-location-demo {
  padding: 32rpx;
}

.selected-location {
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;

  .name {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }

  .address {
    display: block;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

## 标记点管理

### 添加多个标记点

在地图上添加多个标记点:

```vue
<template>
  <view class="markers-demo">
    <map
      :longitude="center.longitude"
      :latitude="center.latitude"
      :scale="12"
      :markers="markers"
      :include-points="includePoints"
      class="map"
      @markertap="onMarkerTap"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// 地图中心
const center = ref({
  longitude: 116.397428,
  latitude: 39.90923
})

// 标记点数据
const markers = ref([
  {
    id: 1,
    longitude: 116.397428,
    latitude: 39.90923,
    title: '天安门',
    iconPath: '/static/images/marker-red.png',
    width: 30,
    height: 30,
    callout: {
      content: '天安门广场',
      display: 'BYCLICK',
      padding: 10,
      borderRadius: 5,
      bgColor: '#fff'
    }
  },
  {
    id: 2,
    longitude: 116.403963,
    latitude: 39.915119,
    title: '故宫',
    iconPath: '/static/images/marker-blue.png',
    width: 30,
    height: 30,
    callout: {
      content: '故宫博物院',
      display: 'BYCLICK',
      padding: 10,
      borderRadius: 5,
      bgColor: '#fff'
    }
  },
  {
    id: 3,
    longitude: 116.391445,
    latitude: 39.907992,
    title: '人民大会堂',
    iconPath: '/static/images/marker-green.png',
    width: 30,
    height: 30,
    callout: {
      content: '人民大会堂',
      display: 'BYCLICK',
      padding: 10,
      borderRadius: 5,
      bgColor: '#fff'
    }
  }
])

// 包含所有标记点
const includePoints = computed(() =>
  markers.value.map(m => ({
    longitude: m.longitude,
    latitude: m.latitude
  }))
)

// 点击标记点
const onMarkerTap = (e: any) => {
  const marker = markers.value.find(m => m.id === e.markerId)
  if (marker) {
    uni.showToast({
      title: marker.title,
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.markers-demo {
  height: 100vh;
}

.map {
  width: 100%;
  height: 100%;
}
</style>
```

### 自定义标记点图标

使用自定义图标和标签:

```vue
<template>
  <map
    :longitude="116.397428"
    :latitude="39.90923"
    :scale="15"
    :markers="customMarkers"
    class="map"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const customMarkers = ref([
  {
    id: 1,
    longitude: 116.397428,
    latitude: 39.90923,
    iconPath: '/static/images/location.png',
    width: 40,
    height: 40,
    anchor: { x: 0.5, y: 1 },  // 锚点在底部中心
    label: {
      content: '当前位置',
      color: '#333',
      fontSize: 12,
      anchorX: -20,
      anchorY: -50,
      bgColor: '#fff',
      borderRadius: 5,
      padding: 5
    }
  }
])
</script>
```

### 动态更新标记点

根据数据动态更新标记点:

```vue
<template>
  <view class="dynamic-markers-demo">
    <map
      :longitude="116.397428"
      :latitude="39.90923"
      :scale="14"
      :markers="markers"
      class="map"
    />
    <view class="controls">
      <wd-button size="small" @click="addMarker">添加标记</wd-button>
      <wd-button size="small" @click="removeMarker">删除标记</wd-button>
      <wd-button size="small" @click="clearMarkers">清空标记</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const markers = ref<any[]>([])
let markerId = 0

// 添加标记点
const addMarker = () => {
  markerId++
  const newMarker = {
    id: markerId,
    longitude: 116.397428 + (Math.random() - 0.5) * 0.02,
    latitude: 39.90923 + (Math.random() - 0.5) * 0.02,
    iconPath: '/static/images/marker.png',
    width: 30,
    height: 30,
    callout: {
      content: `标记 ${markerId}`,
      display: 'ALWAYS'
    }
  }
  markers.value = [...markers.value, newMarker]
}

// 删除最后一个标记点
const removeMarker = () => {
  if (markers.value.length > 0) {
    markers.value = markers.value.slice(0, -1)
  }
}

// 清空所有标记点
const clearMarkers = () => {
  markers.value = []
}
</script>

<style lang="scss" scoped>
.dynamic-markers-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map {
  flex: 1;
}

.controls {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  background: #fff;
}
</style>
```

## 路线绘制

### 绘制折线

在地图上绘制折线路径:

```vue
<template>
  <map
    :longitude="116.397428"
    :latitude="39.90923"
    :scale="14"
    :polyline="polyline"
    :markers="markers"
    class="map"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

// 路线点
const polyline = ref([
  {
    points: [
      { longitude: 116.390634, latitude: 39.911451 },
      { longitude: 116.395332, latitude: 39.913195 },
      { longitude: 116.400627, latitude: 39.910633 },
      { longitude: 116.404816, latitude: 39.906508 }
    ],
    color: '#1890FF',
    width: 5,
    dottedLine: false,
    arrowLine: true
  }
])

// 起终点标记
const markers = ref([
  {
    id: 1,
    longitude: 116.390634,
    latitude: 39.911451,
    iconPath: '/static/images/start.png',
    width: 30,
    height: 30
  },
  {
    id: 2,
    longitude: 116.404816,
    latitude: 39.906508,
    iconPath: '/static/images/end.png',
    width: 30,
    height: 30
  }
])
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 100vh;
}
</style>
```

### 绘制多边形区域

绘制围栏或区域:

```vue
<template>
  <map
    :longitude="116.397428"
    :latitude="39.90923"
    :scale="15"
    :polygons="polygons"
    class="map"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const polygons = ref([
  {
    points: [
      { longitude: 116.394633, latitude: 39.912181 },
      { longitude: 116.400287, latitude: 39.912181 },
      { longitude: 116.400287, latitude: 39.907893 },
      { longitude: 116.394633, latitude: 39.907893 }
    ],
    strokeWidth: 2,
    strokeColor: '#1890FF',
    fillColor: '#1890FF33'
  }
])
</script>
```

### 绘制圆形区域

```vue
<template>
  <map
    :longitude="116.397428"
    :latitude="39.90923"
    :scale="15"
    :circles="circles"
    class="map"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const circles = ref([
  {
    longitude: 116.397428,
    latitude: 39.90923,
    radius: 500,  // 半径,单位米
    strokeWidth: 2,
    strokeColor: '#FF4D4F',
    fillColor: '#FF4D4F33'
  }
])
</script>
```

## 地图控制

### 地图上下文

使用 MapContext 控制地图:

```vue
<template>
  <view class="map-context-demo">
    <map
      id="myMap"
      :longitude="116.397428"
      :latitude="39.90923"
      :scale="scale"
      :show-location="true"
      class="map"
    />
    <view class="controls">
      <wd-button size="small" @click="zoomIn">放大</wd-button>
      <wd-button size="small" @click="zoomOut">缩小</wd-button>
      <wd-button size="small" @click="moveToLocation">回到当前位置</wd-button>
      <wd-button size="small" @click="getCenterLocation">获取中心点</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const scale = ref(15)
let mapContext: any = null

onMounted(() => {
  // 创建地图上下文
  mapContext = uni.createMapContext('myMap')
})

// 放大
const zoomIn = () => {
  if (scale.value < 20) {
    scale.value++
  }
}

// 缩小
const zoomOut = () => {
  if (scale.value > 3) {
    scale.value--
  }
}

// 移动到当前位置
const moveToLocation = () => {
  mapContext?.moveToLocation({
    success: () => {
      uni.showToast({ title: '已定位', icon: 'success' })
    }
  })
}

// 获取中心点坐标
const getCenterLocation = () => {
  mapContext?.getCenterLocation({
    success: (res: any) => {
      uni.showModal({
        title: '地图中心点',
        content: `经度: ${res.longitude}\n纬度: ${res.latitude}`,
        showCancel: false
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.map-context-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map {
  flex: 1;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 24rpx;
  background: #fff;
  gap: 16rpx;
}
</style>
```

### 视野调整

自动调整视野包含所有标记点:

```vue
<template>
  <view class="include-points-demo">
    <map
      id="myMap"
      :longitude="116.397428"
      :latitude="39.90923"
      :scale="14"
      :markers="markers"
      class="map"
    />
    <wd-button @click="includeAllPoints">包含所有标记点</wd-button>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

let mapContext: any = null

const markers = ref([
  {
    id: 1,
    longitude: 116.390634,
    latitude: 39.911451,
    iconPath: '/static/images/marker.png',
    width: 30,
    height: 30
  },
  {
    id: 2,
    longitude: 116.404816,
    latitude: 39.906508,
    iconPath: '/static/images/marker.png',
    width: 30,
    height: 30
  },
  {
    id: 3,
    longitude: 116.397428,
    latitude: 39.920000,
    iconPath: '/static/images/marker.png',
    width: 30,
    height: 30
  }
])

onMounted(() => {
  mapContext = uni.createMapContext('myMap')
})

// 调整视野包含所有点
const includeAllPoints = () => {
  const points = markers.value.map(m => ({
    longitude: m.longitude,
    latitude: m.latitude
  }))

  mapContext?.includePoints({
    points,
    padding: [50, 50, 50, 50],
    success: () => {
      console.log('视野调整成功')
    }
  })
}
</script>

<style lang="scss" scoped>
.include-points-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map {
  flex: 1;
}
</style>
```

## 导航功能

### 打开地图导航

调用系统地图进行导航:

```vue
<template>
  <view class="navigation-demo">
    <view class="destination">
      <text class="name">目的地: 北京天安门</text>
      <text class="address">北京市东城区长安街</text>
    </view>
    <wd-button type="primary" @click="openNavigation">开始导航</wd-button>
  </view>
</template>

<script lang="ts" setup>
const destination = {
  name: '北京天安门',
  longitude: 116.397428,
  latitude: 39.90923
}

// 打开导航
const openNavigation = () => {
  uni.openLocation({
    longitude: destination.longitude,
    latitude: destination.latitude,
    name: destination.name,
    address: '北京市东城区长安街',
    scale: 18,
    success: () => {
      console.log('打开位置成功')
    },
    fail: (error) => {
      console.error('打开位置失败:', error)
    }
  })
}
</script>

<style lang="scss" scoped>
.navigation-demo {
  padding: 32rpx;
}

.destination {
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;

  .name {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }

  .address {
    display: block;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
```

### 多导航方式选择

提供多种导航方式选择:

```vue
<template>
  <view class="multi-nav-demo">
    <wd-button @click="showNavOptions">选择导航方式</wd-button>
  </view>
</template>

<script lang="ts" setup>
const destination = {
  name: '北京天安门',
  longitude: 116.397428,
  latitude: 39.90923
}

const showNavOptions = () => {
  uni.showActionSheet({
    itemList: ['系统地图', '高德地图', '百度地图', '腾讯地图'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          openSystemMap()
          break
        case 1:
          openAmap()
          break
        case 2:
          openBaiduMap()
          break
        case 3:
          openQQMap()
          break
      }
    }
  })
}

// 系统地图
const openSystemMap = () => {
  uni.openLocation({
    longitude: destination.longitude,
    latitude: destination.latitude,
    name: destination.name
  })
}

// 高德地图
const openAmap = () => {
  // #ifdef APP-PLUS
  const url = `amapuri://route/plan/?dlat=${destination.latitude}&dlon=${destination.longitude}&dname=${destination.name}&dev=0&t=0`
  plus.runtime.openURL(url)
  // #endif

  // #ifdef H5
  window.open(`https://uri.amap.com/navigation?to=${destination.longitude},${destination.latitude},${destination.name}`)
  // #endif
}

// 百度地图
const openBaiduMap = () => {
  // #ifdef APP-PLUS
  const url = `baidumap://map/direction?destination=latlng:${destination.latitude},${destination.longitude}|name:${destination.name}&mode=driving`
  plus.runtime.openURL(url)
  // #endif

  // #ifdef H5
  window.open(`https://api.map.baidu.com/direction?destination=latlng:${destination.latitude},${destination.longitude}|name:${destination.name}&mode=driving&output=html`)
  // #endif
}

// 腾讯地图
const openQQMap = () => {
  // #ifdef APP-PLUS
  const url = `qqmap://map/routeplan?type=drive&to=${destination.name}&tocoord=${destination.latitude},${destination.longitude}`
  plus.runtime.openURL(url)
  // #endif

  // #ifdef H5
  window.open(`https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${destination.name}&tocoord=${destination.latitude},${destination.longitude}`)
  // #endif
}
</script>

<style lang="scss" scoped>
.multi-nav-demo {
  padding: 32rpx;
}
</style>
```

## 高级用法

### 封装地图 Composable

创建统一的地图管理工具:

```typescript
// composables/useMap.ts
import { ref, onMounted, onUnmounted } from 'vue'

export interface MapLocation {
  longitude: number
  latitude: number
  address?: string
}

export interface MapMarker {
  id: number
  longitude: number
  latitude: number
  title?: string
  iconPath?: string
  width?: number
  height?: number
  callout?: {
    content: string
    display?: 'BYCLICK' | 'ALWAYS'
    padding?: number
    borderRadius?: number
    bgColor?: string
  }
}

export const useMap = (mapId: string = 'map') => {
  const location = ref<MapLocation | null>(null)
  const markers = ref<MapMarker[]>([])
  const scale = ref(15)

  let mapContext: any = null

  onMounted(() => {
    mapContext = uni.createMapContext(mapId)
  })

  /**
   * 获取当前位置
   */
  const getCurrentLocation = async (): Promise<MapLocation> => {
    const res = await uni.getLocation({
      type: 'gcj02',
      isHighAccuracy: true
    })

    location.value = {
      longitude: res.longitude,
      latitude: res.latitude
    }

    return location.value
  }

  /**
   * 移动到当前位置
   */
  const moveToLocation = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      mapContext?.moveToLocation({
        success: () => resolve(),
        fail: reject
      })
    })
  }

  /**
   * 获取地图中心点
   */
  const getCenterLocation = (): Promise<MapLocation> => {
    return new Promise((resolve, reject) => {
      mapContext?.getCenterLocation({
        success: (res: any) => {
          resolve({
            longitude: res.longitude,
            latitude: res.latitude
          })
        },
        fail: reject
      })
    })
  }

  /**
   * 添加标记点
   */
  const addMarker = (marker: Omit<MapMarker, 'id'>): number => {
    const id = Date.now()
    markers.value.push({ ...marker, id })
    return id
  }

  /**
   * 删除标记点
   */
  const removeMarker = (id: number) => {
    markers.value = markers.value.filter(m => m.id !== id)
  }

  /**
   * 清空标记点
   */
  const clearMarkers = () => {
    markers.value = []
  }

  /**
   * 调整视野包含所有标记点
   */
  const includeAllMarkers = (padding: number[] = [50, 50, 50, 50]): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (markers.value.length === 0) {
        resolve()
        return
      }

      const points = markers.value.map(m => ({
        longitude: m.longitude,
        latitude: m.latitude
      }))

      mapContext?.includePoints({
        points,
        padding,
        success: () => resolve(),
        fail: reject
      })
    })
  }

  /**
   * 设置缩放级别
   */
  const setScale = (newScale: number) => {
    scale.value = Math.max(3, Math.min(20, newScale))
  }

  /**
   * 放大
   */
  const zoomIn = () => {
    setScale(scale.value + 1)
  }

  /**
   * 缩小
   */
  const zoomOut = () => {
    setScale(scale.value - 1)
  }

  return {
    location,
    markers,
    scale,
    getCurrentLocation,
    moveToLocation,
    getCenterLocation,
    addMarker,
    removeMarker,
    clearMarkers,
    includeAllMarkers,
    setScale,
    zoomIn,
    zoomOut
  }
}
```

### 使用地图 Composable

```vue
<template>
  <view class="use-map-demo">
    <map
      id="myMap"
      :longitude="location?.longitude || 116.397428"
      :latitude="location?.latitude || 39.90923"
      :scale="scale"
      :markers="markers"
      :show-location="true"
      class="map"
    />
    <view class="controls">
      <wd-button size="small" @click="handleGetLocation">定位</wd-button>
      <wd-button size="small" @click="handleAddMarker">添加标记</wd-button>
      <wd-button size="small" @click="handleIncludeAll">包含全部</wd-button>
      <wd-button size="small" @click="zoomIn">+</wd-button>
      <wd-button size="small" @click="zoomOut">-</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useMap } from '@/composables/useMap'

const {
  location,
  markers,
  scale,
  getCurrentLocation,
  addMarker,
  includeAllMarkers,
  zoomIn,
  zoomOut
} = useMap('myMap')

const handleGetLocation = async () => {
  try {
    await getCurrentLocation()
    uni.showToast({ title: '定位成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '定位失败', icon: 'error' })
  }
}

const handleAddMarker = () => {
  if (location.value) {
    addMarker({
      longitude: location.value.longitude + (Math.random() - 0.5) * 0.01,
      latitude: location.value.latitude + (Math.random() - 0.5) * 0.01,
      iconPath: '/static/images/marker.png',
      width: 30,
      height: 30,
      callout: {
        content: `标记 ${markers.value.length + 1}`,
        display: 'ALWAYS'
      }
    })
  }
}

const handleIncludeAll = async () => {
  try {
    await includeAllMarkers()
  } catch (error) {
    console.error('调整视野失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.use-map-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.map {
  flex: 1;
}

.controls {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  background: #fff;
}
</style>
```

## API 参考

### map 组件属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| longitude | 中心经度 | `number` | - |
| latitude | 中心纬度 | `number` | - |
| scale | 缩放级别 | `number` | `16` |
| markers | 标记点 | `Array` | `[]` |
| polyline | 折线 | `Array` | `[]` |
| circles | 圆形 | `Array` | `[]` |
| polygons | 多边形 | `Array` | `[]` |
| include-points | 包含的坐标点 | `Array` | `[]` |
| show-location | 显示当前位置 | `boolean` | `false` |
| enable-scroll | 允许拖动 | `boolean` | `true` |
| enable-zoom | 允许缩放 | `boolean` | `true` |

### map 组件事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| markertap | 点击标记点 | `{ markerId }` |
| callouttap | 点击气泡 | `{ markerId }` |
| controltap | 点击控件 | `{ controlId }` |
| regionchange | 视野变化 | `{ type, causedBy }` |
| tap | 点击地图 | `{ longitude, latitude }` |

### MapContext 方法

| 方法 | 说明 | 参数 |
|------|------|------|
| getCenterLocation | 获取中心点 | `{ success, fail }` |
| moveToLocation | 移动到当前位置 | `{ longitude?, latitude? }` |
| includePoints | 调整视野 | `{ points, padding }` |
| getRegion | 获取视野范围 | `{ success, fail }` |
| getScale | 获取缩放级别 | `{ success, fail }` |

## 最佳实践

### 1. 合理使用定位精度

```typescript
// 高精度定位(耗电)
const getHighAccuracyLocation = () => uni.getLocation({
  type: 'gcj02',
  isHighAccuracy: true,
  highAccuracyExpireTime: 3000
})

// 普通精度定位(省电)
const getNormalLocation = () => uni.getLocation({
  type: 'gcj02',
  isHighAccuracy: false
})
```

### 2. 优化标记点性能

```typescript
// 大量标记点时使用聚合
const optimizeMarkers = (markers: MapMarker[]) => {
  if (markers.length > 100) {
    // 使用标记点聚合或只显示可视区域内的标记
    return markers.slice(0, 100)
  }
  return markers
}
```

### 3. 缓存地图数据

```typescript
// 缓存位置信息
const cacheLocation = (location: MapLocation) => {
  uni.setStorageSync('lastLocation', location)
}

const getCachedLocation = (): MapLocation | null => {
  return uni.getStorageSync('lastLocation') || null
}
```

## 常见问题

### 1. 地图不显示

**原因分析:**
- Key 配置错误
- 网络问题
- 权限未授权

**解决方案:**

检查 manifest.json 配置,确保 Key 正确且域名已添加白名单。

### 2. 定位失败

**原因分析:**
- 定位权限未授权
- GPS 未开启
- 网络定位不可用

**解决方案:**

```typescript
const getLocationWithFallback = async () => {
  try {
    return await uni.getLocation({
      type: 'gcj02',
      isHighAccuracy: true
    })
  } catch (error) {
    // 降级为网络定位
    return await uni.getLocation({
      type: 'gcj02',
      isHighAccuracy: false
    })
  }
}
```

### 3. 标记点图标不显示

**原因分析:**
- 图标路径错误
- 图标尺寸过大

**解决方案:**

使用正确的本地路径,并确保图标尺寸合适(建议 30x30)。
