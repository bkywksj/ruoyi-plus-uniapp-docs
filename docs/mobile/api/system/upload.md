# 文件上传 API

移动端文件上传相关的API接口，支持图片、视频、文档等多种文件类型的上传，包含进度监控、断点续传等功能。

## 📋 API 概览

### 接口列表

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 单文件上传 | POST | `/system/upload` | 上传单个文件 |
| 多文件上传 | POST | `/system/upload/batch` | 批量上传多个文件 |
| 分片上传 | POST | `/system/upload/chunk` | 大文件分片上传 |
| 合并分片 | POST | `/system/upload/merge` | 合并分片文件 |
| 获取上传进度 | GET | `/system/upload/progress/{taskId}` | 获取上传进度 |
| 删除文件 | DELETE | `/system/upload/{fileId}` | 删除已上传文件 |
| 获取文件信息 | GET | `/system/upload/info/{fileId}` | 获取文件详细信息 |
| 获取上传配置 | GET | `/system/upload/config` | 获取上传相关配置 |

## 🎯 基础上传接口

### 单文件上传

```typescript
// 文件上传响应
export interface UploadResponse {
  fileId: string
  fileName: string
  originalName: string
  fileSize: number
  filePath: string
  fileUrl: string
  fileType: string
  md5: string
  uploadTime: string
}

// 单文件上传
export const uploadFile = (filePath: string, options?: UploadOptions): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const uploadTask = uni.uploadFile({
      url: `${import.meta.env.VITE_APP_BASE_API}/system/upload`,
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${useUserStore().token}`,
        ...options?.headers
      },
      formData: {
        ...options?.formData
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data.data)
          } else {
            reject(new Error(data.msg || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应数据解析失败'))
        }
      },
      fail: reject
    })

    // 监听上传进度
    if (options?.onProgress) {
      uploadTask.onProgressUpdate((progress) => {
        options.onProgress!(progress.progress)
      })
    }

    // 保存上传任务引用，用于取消
    if (options?.onTaskCreated) {
      options.onTaskCreated(uploadTask)
    }
  })
}

// 上传配置选项
export interface UploadOptions {
  headers?: Record<string, string>
  formData?: Record<string, any>
  onProgress?: (progress: number) => void
  onTaskCreated?: (task: UniApp.UploadTask) => void
}

// 使用示例
const handleUpload = async () => {
  try {
    uni.showLoading({ title: '上传中...' })

    const chooseResult = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const filePath = chooseResult.tempFilePaths[0]
    let uploadTask: UniApp.UploadTask

    const result = await uploadFile(filePath, {
      formData: {
        module: 'avatar',
        category: 'user'
      },
      onProgress: (progress) => {
        console.log('上传进度:', progress)
      },
      onTaskCreated: (task) => {
        uploadTask = task
      }
    })

    uni.hideLoading()
    uni.showToast({
      title: '上传成功',
      icon: 'success'
    })

    console.log('上传结果:', result)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '上传失败',
      icon: 'error'
    })
  }
}
```

### 多文件上传

```typescript
// 批量上传结果
export interface BatchUploadResult {
  success: UploadResponse[]
  failed: Array<{
    index: number
    filePath: string
    error: string
  }>
  total: number
  successCount: number
  failedCount: number
}

// 批量上传配置
export interface BatchUploadOptions extends UploadOptions {
  maxConcurrent?: number // 最大并发数
  onFileProgress?: (index: number, progress: number) => void
  onFileComplete?: (index: number, result: UploadResponse | Error) => void
  onBatchProgress?: (completed: number, total: number) => void
}

export const uploadBatchFiles = async (
  filePaths: string[],
  options: BatchUploadOptions = {}
): Promise<BatchUploadResult> => {
  const { maxConcurrent = 3 } = options
  const result: BatchUploadResult = {
    success: [],
    failed: [],
    total: filePaths.length,
    successCount: 0,
    failedCount: 0
  }

  const uploadPromises: Promise<void>[] = []
  let completedCount = 0

  // 创建信号量控制并发数
  const semaphore = new Semaphore(maxConcurrent)

  for (let i = 0; i < filePaths.length; i++) {
    const promise = semaphore.acquire().then(async () => {
      try {
        const uploadResult = await uploadFile(filePaths[i], {
          ...options,
          onProgress: (progress) => {
            options.onFileProgress?.(i, progress)
          }
        })

        result.success.push(uploadResult)
        result.successCount++
        options.onFileComplete?.(i, uploadResult)
      } catch (error) {
        const errorInfo = {
          index: i,
          filePath: filePaths[i],
          error: error.message || '上传失败'
        }
        result.failed.push(errorInfo)
        result.failedCount++
        options.onFileComplete?.(i, error)
      } finally {
        completedCount++
        options.onBatchProgress?.(completedCount, result.total)
        semaphore.release()
      }
    })

    uploadPromises.push(promise)
  }

  await Promise.all(uploadPromises)
  return result
}

// 信号量实现
class Semaphore {
  private permits: number
  private waitQueue: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--
        resolve()
      } else {
        this.waitQueue.push(resolve)
      }
    })
  }

  release(): void {
    this.permits++
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!
      this.permits--
      resolve()
    }
  }
}

// 使用示例
const handleBatchUpload = async () => {
  try {
    const chooseResult = await uni.chooseImage({
      count: 9,
      sizeType: ['compressed']
    })

    const filePaths = chooseResult.tempFilePaths

    uni.showLoading({ title: '批量上传中...' })

    const result = await uploadBatchFiles(filePaths, {
      maxConcurrent: 2,
      onFileProgress: (index, progress) => {
        console.log(`文件${index + 1}上传进度:`, progress)
      },
      onBatchProgress: (completed, total) => {
        uni.showLoading({
          title: `上传中 ${completed}/${total}`
        })
      }
    })

    uni.hideLoading()

    if (result.failedCount > 0) {
      uni.showModal({
        title: '上传完成',
        content: `成功: ${result.successCount}, 失败: ${result.failedCount}`,
        showCancel: false
      })
    } else {
      uni.showToast({
        title: '全部上传成功',
        icon: 'success'
      })
    }

    console.log('批量上传结果:', result)
  } catch (error) {
    uni.hideLoading()
    console.error('批量上传失败:', error)
  }
}
```

## 🔄 大文件分片上传

### 分片上传实现

```typescript
// 分片上传配置
export interface ChunkUploadOptions {
  chunkSize?: number // 分片大小，默认2MB
  maxRetries?: number // 最大重试次数
  onProgress?: (progress: number) => void
  onChunkProgress?: (chunkIndex: number, progress: number) => void
}

// 分片信息
export interface ChunkInfo {
  chunkIndex: number
  chunkSize: number
  totalChunks: number
  fileMd5: string
  fileName: string
  taskId: string
}

// 分片上传请求
export interface ChunkUploadRequest extends ChunkInfo {
  file: Blob
}

// 合并分片请求
export interface MergeChunksRequest {
  taskId: string
  fileMd5: string
  fileName: string
  totalChunks: number
  fileSize: number
}

export class ChunkUploader {
  private static readonly DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024 // 2MB
  private static readonly MAX_RETRIES = 3

  // 分片上传
  static async uploadFileByChunks(
    filePath: string,
    options: ChunkUploadOptions = {}
  ): Promise<UploadResponse> {
    const {
      chunkSize = this.DEFAULT_CHUNK_SIZE,
      maxRetries = this.MAX_RETRIES,
      onProgress,
      onChunkProgress
    } = options

    try {
      // 获取文件信息
      const fileInfo = await uni.getFileInfo({ filePath })
      const fileSize = fileInfo.size
      const totalChunks = Math.ceil(fileSize / chunkSize)

      // 计算文件MD5
      const fileMd5 = await this.calculateFileMd5(filePath)
      const taskId = this.generateTaskId()
      const fileName = this.getFileNameFromPath(filePath)

      console.log(`开始分片上传: ${fileName}, 总片数: ${totalChunks}`)

      // 上传所有分片
      const uploadPromises: Promise<void>[] = []
      let completedChunks = 0

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const promise = this.uploadChunk({
          filePath,
          chunkIndex,
          chunkSize,
          totalChunks,
          fileMd5,
          fileName,
          taskId,
          maxRetries,
          onChunkProgress: (progress) => {
            onChunkProgress?.(chunkIndex, progress)
          }
        }).then(() => {
          completedChunks++
          const overallProgress = (completedChunks / totalChunks) * 100
          onProgress?.(overallProgress)
        })

        uploadPromises.push(promise)
      }

      await Promise.all(uploadPromises)

      // 合并分片
      const mergeResult = await this.mergeChunks({
        taskId,
        fileMd5,
        fileName,
        totalChunks,
        fileSize
      })

      console.log('分片上传完成:', mergeResult)
      return mergeResult
    } catch (error) {
      console.error('分片上传失败:', error)
      throw error
    }
  }

  // 上传单个分片
  private static async uploadChunk(params: {
    filePath: string
    chunkIndex: number
    chunkSize: number
    totalChunks: number
    fileMd5: string
    fileName: string
    taskId: string
    maxRetries: number
    onChunkProgress?: (progress: number) => void
  }): Promise<void> {
    const {
      filePath,
      chunkIndex,
      chunkSize,
      totalChunks,
      fileMd5,
      fileName,
      taskId,
      maxRetries,
      onChunkProgress
    } = params

    let retryCount = 0

    while (retryCount < maxRetries) {
      try {
        // 读取分片数据
        const start = chunkIndex * chunkSize
        const end = Math.min(start + chunkSize, await this.getFileSize(filePath))
        const chunkData = await this.readFileChunk(filePath, start, end - start)

        // 上传分片
        await new Promise<void>((resolve, reject) => {
          const uploadTask = uni.uploadFile({
            url: `${import.meta.env.VITE_APP_BASE_API}/system/upload/chunk`,
            filePath: chunkData.tempFilePath,
            name: 'chunk',
            header: {
              'Authorization': `Bearer ${useUserStore().token}`
            },
            formData: {
              chunkIndex: chunkIndex.toString(),
              totalChunks: totalChunks.toString(),
              fileMd5,
              fileName,
              taskId
            },
            success: (res) => {
              try {
                const data = JSON.parse(res.data)
                if (data.code === 200) {
                  resolve()
                } else {
                  reject(new Error(data.msg || '分片上传失败'))
                }
              } catch (error) {
                reject(new Error('响应数据解析失败'))
              }
            },
            fail: reject
          })

          // 监听分片上传进度
          uploadTask.onProgressUpdate((progress) => {
            onChunkProgress?.(progress.progress)
          })
        })

        // 上传成功，退出重试循环
        break
      } catch (error) {
        retryCount++
        if (retryCount >= maxRetries) {
          throw new Error(`分片 ${chunkIndex} 上传失败: ${error.message}`)
        }
        console.warn(`分片 ${chunkIndex} 上传失败，正在重试 (${retryCount}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }
  }

  // 合并分片
  private static async mergeChunks(request: MergeChunksRequest): Promise<UploadResponse> {
    const response = await http.post<UploadResponse>('/system/upload/merge', request)
    return response.data
  }

  // 计算文件MD5
  private static async calculateFileMd5(filePath: string): Promise<string> {
    // 这里需要根据平台实现MD5计算
    // 可以使用第三方库如crypto-js
    const fileData = await this.readFile(filePath)
    return this.md5(fileData)
  }

  // 读取文件分片
  private static async readFileChunk(
    filePath: string,
    start: number,
    size: number
  ): Promise<{ tempFilePath: string }> {
    // 使用uni-app的文件系统API读取分片
    const fs = uni.getFileSystemManager()

    return new Promise((resolve, reject) => {
      const tempFilePath = `${uni.env.USER_DATA_PATH}/chunk_${Date.now()}.tmp`

      fs.readFile({
        filePath,
        position: start,
        length: size,
        success: (res) => {
          fs.writeFile({
            filePath: tempFilePath,
            data: res.data,
            success: () => resolve({ tempFilePath }),
            fail: reject
          })
        },
        fail: reject
      })
    })
  }

  // 工具方法
  private static async getFileSize(filePath: string): Promise<number> {
    const fileInfo = await uni.getFileInfo({ filePath })
    return fileInfo.size
  }

  private static async readFile(filePath: string): Promise<ArrayBuffer> {
    const fs = uni.getFileSystemManager()
    return new Promise((resolve, reject) => {
      fs.readFile({
        filePath,
        success: (res) => resolve(res.data as ArrayBuffer),
        fail: reject
      })
    })
  }

  private static md5(data: ArrayBuffer): string {
    // 实现MD5计算，可以使用crypto-js库
    // 这里简化处理，实际项目中需要引入相应的MD5库
    return 'md5_hash_placeholder'
  }

  private static generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static getFileNameFromPath(filePath: string): string {
    return filePath.split('/').pop() || 'unknown'
  }
}

// 使用示例
const handleLargeFileUpload = async () => {
  try {
    const chooseResult = await uni.chooseVideo({
      sourceType: ['album'],
      maxDuration: 60
    })

    uni.showLoading({ title: '上传中 0%' })

    const result = await ChunkUploader.uploadFileByChunks(
      chooseResult.tempFilePath,
      {
        chunkSize: 1024 * 1024, // 1MB分片
        onProgress: (progress) => {
          uni.showLoading({
            title: `上传中 ${Math.round(progress)}%`
          })
        },
        onChunkProgress: (chunkIndex, progress) => {
          console.log(`分片 ${chunkIndex} 进度: ${progress}%`)
        }
      }
    )

    uni.hideLoading()
    uni.showToast({
      title: '上传完成',
      icon: 'success'
    })

    console.log('大文件上传结果:', result)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '上传失败',
      icon: 'error'
    })
  }
}
```

## 📊 上传管理器

### 上传任务管理

```typescript
// 上传任务状态
export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PAUSED = 'paused',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// 上传任务
export interface UploadTask {
  id: string
  filePath: string
  fileName: string
  fileSize: number
  progress: number
  status: UploadStatus
  uploadedSize: number
  speed: number // 上传速度 (bytes/s)
  error?: string
  result?: UploadResponse
  uploadTask?: UniApp.UploadTask
  startTime: number
  endTime?: number
}

// 上传管理器
export class UploadManager {
  private tasks = new Map<string, UploadTask>()
  private maxConcurrent = 3
  private currentUploads = 0

  // 添加上传任务
  addTask(filePath: string, options?: UploadOptions): string {
    const taskId = this.generateTaskId()
    const fileName = this.getFileNameFromPath(filePath)

    const task: UploadTask = {
      id: taskId,
      filePath,
      fileName,
      fileSize: 0,
      progress: 0,
      status: UploadStatus.PENDING,
      uploadedSize: 0,
      speed: 0,
      startTime: Date.now()
    }

    this.tasks.set(taskId, task)
    this.processQueue()

    return taskId
  }

  // 开始上传
  private async startUpload(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task || task.status !== UploadStatus.PENDING) {
      return
    }

    this.currentUploads++
    task.status = UploadStatus.UPLOADING
    task.startTime = Date.now()

    try {
      // 获取文件大小
      const fileInfo = await uni.getFileInfo({ filePath: task.filePath })
      task.fileSize = fileInfo.size

      let lastUploadedSize = 0
      let lastTime = Date.now()

      const result = await uploadFile(task.filePath, {
        onProgress: (progress) => {
          task.progress = progress
          task.uploadedSize = Math.round((progress / 100) * task.fileSize)

          // 计算上传速度
          const currentTime = Date.now()
          const timeDiff = currentTime - lastTime
          if (timeDiff >= 1000) { // 每秒更新一次速度
            const sizeDiff = task.uploadedSize - lastUploadedSize
            task.speed = (sizeDiff / timeDiff) * 1000
            lastUploadedSize = task.uploadedSize
            lastTime = currentTime
          }

          this.notifyTaskUpdate(taskId)
        },
        onTaskCreated: (uploadTask) => {
          task.uploadTask = uploadTask
        }
      })

      task.status = UploadStatus.SUCCESS
      task.progress = 100
      task.result = result
      task.endTime = Date.now()
      this.notifyTaskUpdate(taskId)
    } catch (error) {
      task.status = UploadStatus.FAILED
      task.error = error.message
      task.endTime = Date.now()
      this.notifyTaskUpdate(taskId)
    } finally {
      this.currentUploads--
      this.processQueue()
    }
  }

  // 处理上传队列
  private processQueue(): void {
    if (this.currentUploads >= this.maxConcurrent) {
      return
    }

    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === UploadStatus.PENDING)
      .sort((a, b) => a.startTime - b.startTime)

    for (const task of pendingTasks) {
      if (this.currentUploads >= this.maxConcurrent) {
        break
      }
      this.startUpload(task.id)
    }
  }

  // 暂停上传
  pauseTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task && task.status === UploadStatus.UPLOADING) {
      task.uploadTask?.abort()
      task.status = UploadStatus.PAUSED
      this.currentUploads--
      this.notifyTaskUpdate(taskId)
      this.processQueue()
    }
  }

  // 恢复上传
  resumeTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task && task.status === UploadStatus.PAUSED) {
      task.status = UploadStatus.PENDING
      this.processQueue()
    }
  }

  // 取消上传
  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      if (task.status === UploadStatus.UPLOADING) {
        task.uploadTask?.abort()
        this.currentUploads--
      }
      task.status = UploadStatus.CANCELLED
      this.notifyTaskUpdate(taskId)
      this.processQueue()
    }
  }

  // 重试上传
  retryTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task && task.status === UploadStatus.FAILED) {
      task.status = UploadStatus.PENDING
      task.progress = 0
      task.uploadedSize = 0
      task.error = undefined
      this.processQueue()
    }
  }

  // 获取任务信息
  getTask(taskId: string): UploadTask | undefined {
    return this.tasks.get(taskId)
  }

  // 获取所有任务
  getAllTasks(): UploadTask[] {
    return Array.from(this.tasks.values())
  }

  // 清除已完成的任务
  clearCompletedTasks(): void {
    for (const [taskId, task] of this.tasks) {
      if (task.status === UploadStatus.SUCCESS || task.status === UploadStatus.CANCELLED) {
        this.tasks.delete(taskId)
      }
    }
  }

  // 任务更新通知
  private notifyTaskUpdate(taskId: string): void {
    // 这里可以使用事件总线或状态管理器通知UI更新
    uni.$emit('upload-task-update', { taskId, task: this.tasks.get(taskId) })
  }

  // 工具方法
  private generateTaskId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getFileNameFromPath(filePath: string): string {
    return filePath.split('/').pop() || 'unknown'
  }

  // 格式化文件大小
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 格式化上传速度
  static formatUploadSpeed(bytesPerSecond: number): string {
    return this.formatFileSize(bytesPerSecond) + '/s'
  }
}

// 全局上传管理器实例
export const uploadManager = new UploadManager()
```

## 📝 上传组件

### 文件上传组件

```vue
<!-- FileUpload.vue -->
<template>
  <view class="file-upload">
    <!-- 上传按钮 -->
    <wd-button
      type="primary"
      :loading="uploading"
      @click="handleChooseFile"
    >
      <wd-icon name="upload" />
      {{ uploading ? '上传中...' : '选择文件' }}
    </wd-button>

    <!-- 上传进度 -->
    <view v-if="uploadTasks.length > 0" class="upload-progress">
      <view
        v-for="task in uploadTasks"
        :key="task.id"
        class="upload-item"
      >
        <view class="file-info">
          <text class="file-name">{{ task.fileName }}</text>
          <text class="file-size">{{ formatFileSize(task.fileSize) }}</text>
        </view>

        <view class="progress-bar">
          <wd-progress
            :percentage="task.progress"
            :status="getProgressStatus(task.status)"
            :show-text="false"
          />
          <text class="progress-text">
            {{ Math.round(task.progress) }}%
          </text>
        </view>

        <view class="upload-actions">
          <wd-button
            v-if="task.status === 'uploading'"
            size="mini"
            @click="pauseUpload(task.id)"
          >
            暂停
          </wd-button>
          <wd-button
            v-else-if="task.status === 'paused'"
            size="mini"
            type="primary"
            @click="resumeUpload(task.id)"
          >
            继续
          </wd-button>
          <wd-button
            v-else-if="task.status === 'failed'"
            size="mini"
            type="warning"
            @click="retryUpload(task.id)"
          >
            重试
          </wd-button>
          <wd-button
            size="mini"
            type="danger"
            @click="cancelUpload(task.id)"
          >
            取消
          </wd-button>
        </view>
      </view>
    </view>

    <!-- 上传结果 -->
    <view v-if="uploadResults.length > 0" class="upload-results">
      <view
        v-for="result in uploadResults"
        :key="result.fileId"
        class="result-item"
      >
        <wd-img
          v-if="isImage(result.fileType)"
          :src="result.fileUrl"
          width="60rpx"
          height="60rpx"
          round
        />
        <view class="result-info">
          <text class="result-name">{{ result.fileName }}</text>
          <text class="result-url">{{ result.fileUrl }}</text>
        </view>
        <wd-button
          size="mini"
          type="danger"
          @click="deleteFile(result.fileId)"
        >
          删除
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  maxCount?: number
  accept?: string[]
  maxSize?: number
  multiple?: boolean
}

interface Emits {
  (e: 'success', files: UploadResponse[]): void
  (e: 'error', error: any): void
  (e: 'progress', progress: number): void
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 9,
  maxSize: 10 * 1024 * 1024, // 10MB
  multiple: true
})

const emit = defineEmits<Emits>()

const uploading = ref(false)
const uploadTasks = ref<UploadTask[]>([])
const uploadResults = ref<UploadResponse[]>([])

// 选择文件
const handleChooseFile = async () => {
  try {
    let chooseResult: any

    if (props.accept?.includes('image')) {
      chooseResult = await uni.chooseImage({
        count: props.multiple ? props.maxCount : 1,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera']
      })
    } else if (props.accept?.includes('video')) {
      chooseResult = await uni.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60
      })
      chooseResult.tempFilePaths = [chooseResult.tempFilePath]
    } else {
      // 通用文件选择
      chooseResult = await uni.chooseMessageFile({
        count: props.multiple ? props.maxCount : 1,
        type: 'all'
      })
      chooseResult.tempFilePaths = chooseResult.tempFiles.map((file: any) => file.path)
    }

    const filePaths = chooseResult.tempFilePaths

    // 验证文件大小
    for (const filePath of filePaths) {
      const fileInfo = await uni.getFileInfo({ filePath })
      if (fileInfo.size > props.maxSize) {
        throw new Error(`文件大小超过限制: ${formatFileSize(props.maxSize)}`)
      }
    }

    await startUpload(filePaths)
  } catch (error) {
    console.error('选择文件失败:', error)
    emit('error', error)
  }
}

// 开始上传
const startUpload = async (filePaths: string[]) => {
  uploading.value = true

  try {
    const taskIds: string[] = []

    for (const filePath of filePaths) {
      const taskId = uploadManager.addTask(filePath, {
        maxSize: props.maxSize
      })
      taskIds.push(taskId)
    }

    // 监听任务更新
    const handleTaskUpdate = (event: any) => {
      updateTaskList()
    }

    uni.$on('upload-task-update', handleTaskUpdate)

    // 等待所有任务完成
    await waitForTasksComplete(taskIds)

    uni.$off('upload-task-update', handleTaskUpdate)

    // 获取成功的结果
    const successfulResults = taskIds
      .map(id => uploadManager.getTask(id))
      .filter(task => task?.status === UploadStatus.SUCCESS && task.result)
      .map(task => task!.result!)

    uploadResults.value.push(...successfulResults)
    emit('success', successfulResults)

    // 清理已完成的任务
    uploadManager.clearCompletedTasks()
    updateTaskList()
  } catch (error) {
    emit('error', error)
  } finally {
    uploading.value = false
  }
}

// 等待任务完成
const waitForTasksComplete = (taskIds: string[]): Promise<void> => {
  return new Promise((resolve) => {
    const checkTasks = () => {
      const tasks = taskIds.map(id => uploadManager.getTask(id)).filter(Boolean)
      const pendingTasks = tasks.filter(task =>
        task!.status === UploadStatus.PENDING ||
        task!.status === UploadStatus.UPLOADING
      )

      if (pendingTasks.length === 0) {
        resolve()
      } else {
        setTimeout(checkTasks, 500)
      }
    }
    checkTasks()
  })
}

// 更新任务列表
const updateTaskList = () => {
  uploadTasks.value = uploadManager.getAllTasks().filter(task =>
    task.status !== UploadStatus.SUCCESS && task.status !== UploadStatus.CANCELLED
  )
}

// 暂停上传
const pauseUpload = (taskId: string) => {
  uploadManager.pauseTask(taskId)
}

// 恢复上传
const resumeUpload = (taskId: string) => {
  uploadManager.resumeTask(taskId)
}

// 重试上传
const retryUpload = (taskId: string) => {
  uploadManager.retryTask(taskId)
}

// 取消上传
const cancelUpload = (taskId: string) => {
  uploadManager.cancelTask(taskId)
  updateTaskList()
}

// 删除文件
const deleteFile = async (fileId: string) => {
  try {
    await http.delete(`/system/upload/${fileId}`)
    uploadResults.value = uploadResults.value.filter(result => result.fileId !== fileId)
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '删除失败',
      icon: 'error'
    })
  }
}

// 工具方法
const formatFileSize = (bytes: number) => UploadManager.formatFileSize(bytes)

const isImage = (fileType: string) => fileType.startsWith('image/')

const getProgressStatus = (status: UploadStatus) => {
  switch (status) {
    case UploadStatus.SUCCESS:
      return 'success'
    case UploadStatus.FAILED:
      return 'exception'
    default:
      return 'normal'
  }
}
</script>

<style lang="scss" scoped>
.file-upload {
  padding: 20rpx;
}

.upload-progress {
  margin-top: 20rpx;
}

.upload-item {
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  margin-bottom: 16rpx;

  .file-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12rpx;

    .file-name {
      font-size: 28rpx;
      color: #333;
    }

    .file-size {
      font-size: 24rpx;
      color: #999;
    }
  }

  .progress-bar {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;

    .progress-text {
      margin-left: 12rpx;
      font-size: 24rpx;
      color: #666;
    }
  }

  .upload-actions {
    display: flex;
    gap: 12rpx;
  }
}

.upload-results {
  margin-top: 20rpx;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  margin-bottom: 12rpx;

  .result-info {
    flex: 1;
    margin-left: 12rpx;

    .result-name {
      display: block;
      font-size: 28rpx;
      color: #333;
    }

    .result-url {
      display: block;
      font-size: 24rpx;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
```

文件上传API为移动端提供了完整的文件上传解决方案，支持单文件、批量、分片上传等多种场景，包含完善的进度监控和错误处理机制。