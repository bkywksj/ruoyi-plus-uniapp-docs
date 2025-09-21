# 字典管理 API

移动端字典数据相关的API接口，用于获取和管理系统字典数据，支持本地缓存和动态更新。

## 📋 API 概览

### 接口列表

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取字典数据 | GET | `/system/dict/data/type/{dictType}` | 根据字典类型获取数据 |
| 批量获取字典 | POST | `/system/dict/data/types` | 批量获取多个字典类型 |
| 获取字典类型 | GET | `/system/dict/type/list` | 获取所有字典类型 |
| 搜索字典数据 | GET | `/system/dict/data/search` | 搜索字典数据 |
| 获取字典树结构 | GET | `/system/dict/data/tree/{dictType}` | 获取树形字典数据 |

## 🎯 基础接口实现

### 获取字典数据

```typescript
// 字典数据类型定义
export interface DictData {
  dictCode: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass?: string
  listClass?: string
  isDefault: 'Y' | 'N'
  status: '0' | '1' // 0正常 1停用
  remark?: string
  createTime: string
}

// 获取单个字典类型的数据
export const getDictData = (dictType: string): Promise<ApiResponse<DictData[]>> => {
  return http.get<DictData[]>(`/system/dict/data/type/${dictType}`)
}

// 使用示例
const loadUserStatus = async () => {
  try {
    const response = await getDictData('sys_user_status')
    userStatusOptions.value = response.data.map(item => ({
      label: item.dictLabel,
      value: item.dictValue,
      disabled: item.status === '1'
    }))
  } catch (error) {
    console.error('获取用户状态字典失败:', error)
  }
}
```

### 批量获取字典

```typescript
// 批量获取字典请求
export interface BatchDictRequest {
  dictTypes: string[]
}

// 批量获取字典响应
export interface BatchDictResponse {
  [dictType: string]: DictData[]
}

export const getBatchDictData = (dictTypes: string[]): Promise<ApiResponse<BatchDictResponse>> => {
  return http.post<BatchDictResponse>('/system/dict/data/types', { dictTypes })
}

// 使用示例
const loadCommonDicts = async () => {
  try {
    const dictTypes = [
      'sys_user_status',
      'sys_user_sex',
      'sys_yes_no',
      'sys_notice_type',
      'sys_common_status'
    ]

    const response = await getBatchDictData(dictTypes)

    // 批量设置字典数据
    Object.entries(response.data).forEach(([dictType, dictData]) => {
      setDictData(dictType, dictData)
    })

    console.log('常用字典加载完成')
  } catch (error) {
    console.error('批量获取字典失败:', error)
  }
}
```

### 搜索字典数据

```typescript
// 字典搜索参数
export interface DictSearchRequest {
  dictType?: string
  dictLabel?: string
  dictValue?: string
  status?: '0' | '1'
  pageNum?: number
  pageSize?: number
}

export const searchDictData = (params: DictSearchRequest): Promise<ApiResponse<PageResult<DictData>>> => {
  return http.get<PageResult<DictData>>('/system/dict/data/search', params)
}

// 使用示例
const searchDict = async (keyword: string) => {
  try {
    const response = await searchDictData({
      dictLabel: keyword,
      status: '0'
    })

    searchResults.value = response.data.records
  } catch (error) {
    console.error('搜索字典失败:', error)
  }
}
```

### 获取树形字典

```typescript
// 树形字典数据
export interface TreeDictData extends DictData {
  children?: TreeDictData[]
  parentCode?: string
  level?: number
}

export const getTreeDictData = (dictType: string): Promise<ApiResponse<TreeDictData[]>> => {
  return http.get<TreeDictData[]>(`/system/dict/data/tree/${dictType}`)
}

// 使用示例
const loadAreaTree = async () => {
  try {
    const response = await getTreeDictData('sys_area')
    areaTreeData.value = response.data
  } catch (error) {
    console.error('获取地区树形数据失败:', error)
  }
}
```

## 💾 字典缓存管理

### 本地缓存实现

```typescript
// 字典缓存管理器
class DictCacheManager {
  private readonly CACHE_KEY = 'dict_cache'
  private readonly VERSION_KEY = 'dict_version'
  private readonly EXPIRE_TIME = 24 * 60 * 60 * 1000 // 24小时

  // 获取缓存的字典数据
  getCachedDict(dictType: string): DictData[] | null {
    try {
      const cache = uni.getStorageSync(this.CACHE_KEY) || {}
      const dictData = cache[dictType]

      if (dictData && this.isValidCache(dictData.timestamp)) {
        return dictData.data
      }

      return null
    } catch (error) {
      console.error('获取字典缓存失败:', error)
      return null
    }
  }

  // 设置字典缓存
  setCachedDict(dictType: string, data: DictData[]): void {
    try {
      const cache = uni.getStorageSync(this.CACHE_KEY) || {}
      cache[dictType] = {
        data,
        timestamp: Date.now()
      }
      uni.setStorageSync(this.CACHE_KEY, cache)
    } catch (error) {
      console.error('设置字典缓存失败:', error)
    }
  }

  // 批量设置字典缓存
  setBatchCachedDict(dictData: BatchDictResponse): void {
    try {
      const cache = uni.getStorageSync(this.CACHE_KEY) || {}
      const timestamp = Date.now()

      Object.entries(dictData).forEach(([dictType, data]) => {
        cache[dictType] = { data, timestamp }
      })

      uni.setStorageSync(this.CACHE_KEY, cache)
    } catch (error) {
      console.error('批量设置字典缓存失败:', error)
    }
  }

  // 清除过期缓存
  clearExpiredCache(): void {
    try {
      const cache = uni.getStorageSync(this.CACHE_KEY) || {}
      const now = Date.now()

      Object.keys(cache).forEach(dictType => {
        if (!this.isValidCache(cache[dictType].timestamp)) {
          delete cache[dictType]
        }
      })

      uni.setStorageSync(this.CACHE_KEY, cache)
    } catch (error) {
      console.error('清除过期缓存失败:', error)
    }
  }

  // 清除所有字典缓存
  clearAllCache(): void {
    try {
      uni.removeStorageSync(this.CACHE_KEY)
      uni.removeStorageSync(this.VERSION_KEY)
    } catch (error) {
      console.error('清除所有缓存失败:', error)
    }
  }

  // 检查缓存是否有效
  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.EXPIRE_TIME
  }

  // 获取缓存版本
  getCacheVersion(): string | null {
    return uni.getStorageSync(this.VERSION_KEY) || null
  }

  // 设置缓存版本
  setCacheVersion(version: string): void {
    uni.setStorageSync(this.VERSION_KEY, version)
  }

  // 检查版本是否需要更新
  needUpdate(serverVersion: string): boolean {
    const localVersion = this.getCacheVersion()
    return !localVersion || localVersion !== serverVersion
  }
}

export const dictCacheManager = new DictCacheManager()
```

### 字典数据管理器

```typescript
// 字典数据管理器
class DictDataManager {
  private dictStore = new Map<string, DictData[]>()
  private loadingPromises = new Map<string, Promise<DictData[]>>()

  // 获取字典数据（优先从缓存获取）
  async getDictData(dictType: string, forceRefresh = false): Promise<DictData[]> {
    // 如果已在内存中且不强制刷新，直接返回
    if (!forceRefresh && this.dictStore.has(dictType)) {
      return this.dictStore.get(dictType)!
    }

    // 如果正在加载中，返回同一个Promise
    if (this.loadingPromises.has(dictType)) {
      return this.loadingPromises.get(dictType)!
    }

    // 创建加载Promise
    const loadPromise = this.loadDictData(dictType, forceRefresh)
    this.loadingPromises.set(dictType, loadPromise)

    try {
      const data = await loadPromise
      this.dictStore.set(dictType, data)
      return data
    } finally {
      this.loadingPromises.delete(dictType)
    }
  }

  // 加载字典数据
  private async loadDictData(dictType: string, forceRefresh: boolean): Promise<DictData[]> {
    // 如果不强制刷新，先尝试从本地缓存获取
    if (!forceRefresh) {
      const cachedData = dictCacheManager.getCachedDict(dictType)
      if (cachedData) {
        return cachedData
      }
    }

    // 从服务器获取
    try {
      const response = await getDictData(dictType)
      const data = response.data

      // 更新缓存
      dictCacheManager.setCachedDict(dictType, data)

      return data
    } catch (error) {
      console.error(`获取字典 ${dictType} 失败:`, error)

      // 如果服务器请求失败，尝试使用缓存数据
      const cachedData = dictCacheManager.getCachedDict(dictType)
      if (cachedData) {
        console.warn(`使用缓存字典数据: ${dictType}`)
        return cachedData
      }

      throw error
    }
  }

  // 批量获取字典数据
  async getBatchDictData(dictTypes: string[], forceRefresh = false): Promise<BatchDictResponse> {
    const result: BatchDictResponse = {}
    const needLoadTypes: string[] = []

    // 检查哪些字典需要加载
    for (const dictType of dictTypes) {
      if (!forceRefresh && this.dictStore.has(dictType)) {
        result[dictType] = this.dictStore.get(dictType)!
      } else {
        needLoadTypes.push(dictType)
      }
    }

    // 如果有需要加载的字典，批量加载
    if (needLoadTypes.length > 0) {
      try {
        const response = await getBatchDictData(needLoadTypes)

        // 更新内存和缓存
        Object.entries(response.data).forEach(([dictType, data]) => {
          this.dictStore.set(dictType, data)
          result[dictType] = data
        })

        // 更新本地缓存
        dictCacheManager.setBatchCachedDict(response.data)
      } catch (error) {
        console.error('批量获取字典失败:', error)

        // 尝试使用缓存数据
        needLoadTypes.forEach(dictType => {
          const cachedData = dictCacheManager.getCachedDict(dictType)
          if (cachedData) {
            result[dictType] = cachedData
            this.dictStore.set(dictType, cachedData)
          }
        })
      }
    }

    return result
  }

  // 刷新字典数据
  async refreshDictData(dictType?: string): Promise<void> {
    if (dictType) {
      await this.getDictData(dictType, true)
    } else {
      // 刷新所有已加载的字典
      const dictTypes = Array.from(this.dictStore.keys())
      await this.getBatchDictData(dictTypes, true)
    }
  }

  // 预加载常用字典
  async preloadCommonDicts(): Promise<void> {
    const commonDictTypes = [
      'sys_user_status',
      'sys_user_sex',
      'sys_yes_no',
      'sys_notice_type',
      'sys_common_status',
      'sys_job_status'
    ]

    try {
      await this.getBatchDictData(commonDictTypes)
      console.log('常用字典预加载完成')
    } catch (error) {
      console.error('预加载常用字典失败:', error)
    }
  }

  // 清除字典数据
  clearDictData(dictType?: string): void {
    if (dictType) {
      this.dictStore.delete(dictType)
    } else {
      this.dictStore.clear()
    }
  }
}

export const dictDataManager = new DictDataManager()
```

## 🎨 字典工具函数

### 字典数据转换

```typescript
// 字典值转标签
export const dictValueToLabel = (dictType: string, value: string): string => {
  const dictData = dictDataManager.dictStore.get(dictType)
  if (!dictData) return value

  const item = dictData.find(d => d.dictValue === value)
  return item?.dictLabel || value
}

// 字典标签转值
export const dictLabelToValue = (dictType: string, label: string): string => {
  const dictData = dictDataManager.dictStore.get(dictType)
  if (!dictData) return label

  const item = dictData.find(d => d.dictLabel === label)
  return item?.dictValue || label
}

// 获取字典选项（用于选择器）
export const getDictOptions = (dictType: string): Array<{ label: string; value: string; disabled?: boolean }> => {
  const dictData = dictDataManager.dictStore.get(dictType)
  if (!dictData) return []

  return dictData
    .filter(item => item.status === '0') // 只返回正常状态的数据
    .sort((a, b) => a.dictSort - b.dictSort) // 按排序号排序
    .map(item => ({
      label: item.dictLabel,
      value: item.dictValue,
      disabled: false
    }))
}

// 获取字典CSS类
export const getDictCssClass = (dictType: string, value: string): string => {
  const dictData = dictDataManager.dictStore.get(dictType)
  if (!dictData) return ''

  const item = dictData.find(d => d.dictValue === value)
  return item?.cssClass || ''
}

// 获取字典List类
export const getDictListClass = (dictType: string, value: string): string => {
  const dictData = dictDataManager.dictStore.get(dictType)
  if (!dictData) return ''

  const item = dictData.find(d => d.dictValue === value)
  return item?.listClass || ''
}
```

### 字典组合函数

```typescript
// 字典数据组合函数
export function useDict(dictType: string | string[]) {
  const dictTypes = Array.isArray(dictType) ? dictType : [dictType]
  const dictData = reactive<Record<string, DictData[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 加载字典数据
  const loadDict = async (forceRefresh = false) => {
    loading.value = true
    error.value = null

    try {
      if (dictTypes.length === 1) {
        const data = await dictDataManager.getDictData(dictTypes[0], forceRefresh)
        dictData[dictTypes[0]] = data
      } else {
        const batchData = await dictDataManager.getBatchDictData(dictTypes, forceRefresh)
        Object.assign(dictData, batchData)
      }
    } catch (err: any) {
      error.value = err.message || '加载字典失败'
      console.error('加载字典失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取字典选项
  const getOptions = (type: string) => {
    return getDictOptions(type)
  }

  // 值转标签
  const valueToLabel = (type: string, value: string) => {
    return dictValueToLabel(type, value)
  }

  // 标签转值
  const labelToValue = (type: string, label: string) => {
    return dictLabelToValue(type, label)
  }

  // 刷新字典
  const refresh = () => {
    loadDict(true)
  }

  // 自动加载
  onMounted(() => {
    loadDict()
  })

  return {
    dictData: readonly(dictData),
    loading: readonly(loading),
    error: readonly(error),
    loadDict,
    getOptions,
    valueToLabel,
    labelToValue,
    refresh
  }
}

// 使用示例
export default defineComponent({
  setup() {
    const { dictData, loading, getOptions, valueToLabel } = useDict([
      'sys_user_status',
      'sys_user_sex'
    ])

    const userStatusOptions = computed(() => getOptions('sys_user_status'))
    const userSexOptions = computed(() => getOptions('sys_user_sex'))

    const formatUserStatus = (status: string) => {
      return valueToLabel('sys_user_status', status)
    }

    return {
      dictData,
      loading,
      userStatusOptions,
      userSexOptions,
      formatUserStatus
    }
  }
})
```

### 字典选择器组件

```vue
<!-- DictSelect.vue -->
<template>
  <wd-picker
    v-model="currentValue"
    :columns="options"
    :loading="loading"
    :placeholder="placeholder"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  dictType: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string, label: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择'
})

const emit = defineEmits<Emits>()

const { dictData, loading, getOptions } = useDict(props.dictType)

const currentValue = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:modelValue', value)
})

const options = computed(() => getOptions(props.dictType))

const handleConfirm = (value: string) => {
  const option = options.value.find(item => item.value === value)
  emit('change', value, option?.label || '')
}
</script>
```

## 📱 移动端优化

### 字典数据预加载

```typescript
// 应用启动时预加载字典
export const initDictData = async () => {
  try {
    // 清理过期缓存
    dictCacheManager.clearExpiredCache()

    // 预加载常用字典
    await dictDataManager.preloadCommonDicts()

    console.log('字典数据初始化完成')
  } catch (error) {
    console.error('字典数据初始化失败:', error)
  }
}

// 在 main.ts 中调用
// initDictData()
```

### 离线支持

```typescript
// 监听网络状态变化
uni.onNetworkStatusChange((res) => {
  if (res.isConnected) {
    // 网络恢复时刷新字典数据
    dictDataManager.refreshDictData()
  }
})

// 获取字典数据时的离线处理
export const getDictDataOffline = async (dictType: string): Promise<DictData[]> => {
  try {
    return await dictDataManager.getDictData(dictType)
  } catch (error) {
    // 网络错误时使用缓存数据
    const cachedData = dictCacheManager.getCachedDict(dictType)
    if (cachedData) {
      uni.showToast({
        title: '使用离线数据',
        icon: 'none'
      })
      return cachedData
    }
    throw error
  }
}
```

字典管理API为移动端提供了完整的字典数据支持，包括缓存管理、离线支持和高性能的数据访问机制。