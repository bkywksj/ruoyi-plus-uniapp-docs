# 模态框工具 (modal.ts)

Element Plus 消息与弹窗工具函数集，提供统一的用户交互反馈功能，包括消息提示、弹窗提示、通知、确认框、输入框和加载遮罩等。

## 📖 概述

模态框工具库基于 Element Plus 组件库，提供以下功能：
- **消息提示**：各种类型的消息提示
- **弹窗提示**：各种类型的弹窗提示
- **通知提示**：各种类型的通知提示
- **交互弹窗**：确认框和输入框
- **加载遮罩**：控制全局加载遮罩

## 🎯 设计特点

✨ **Result 格式返回**：所有异步方法都返回 `Result<T>` 格式：`[Error | null, T | null]`

✨ **统一 API 风格**：所有函数使用 `show` 前缀，便于智能提示和语义理解

✨ **灵活参数支持**：支持字符串快捷调用和对象详细配置两种方式

✨ **TypeScript 友好**：完整的类型定义和智能提示支持

## 📢 消息提示

### showMsg

显示一般信息消息。

```typescript
showMsg(content: string | MessageParams): void
```

**示例：**
```typescript
// 简单消息
showMsg('操作已完成')

// 自定义配置
showMsg({
  message: '操作已完成',
  duration: 5000,
  showClose: true
})
```

### showMsgError

显示错误消息。

```typescript
showMsgError(content: string | MessageParams): void
```

**示例：**
```typescript
// 简单错误消息
showMsgError('操作失败，请重试')

// 详细错误配置
showMsgError({
  message: '网络请求失败，请检查网络连接',
  duration: 8000,
  showClose: true
})
```

### showMsgSuccess

显示成功消息。

```typescript
showMsgSuccess(content: string | MessageParams): void
```

### showMsgWarning

显示警告消息。

```typescript
showMsgWarning(content: string | MessageParams): void
```

**示例：**
```typescript
// API 响应处理
async function handleApiResponse() {
  const [err, data] = await to(apiCall())
  
  if (err) {
    showMsgError('请求失败: ' + err.message)
    return
  }
  
  if (data.code === 200) {
    showMsgSuccess('操作成功')
  } else {
    showMsgWarning(data.message || '操作完成但有警告')
  }
}
```

## 🔔 弹窗提示

### showAlert

显示一般信息弹窗。

```typescript
showAlert(
  content: string | AlertOptions, 
  title?: string, 
  options?: ElMessageBoxOptions
): Promise<Result<MessageBoxData>>
```

**示例：**
```typescript
// 基础用法
const [err, result] = await showAlert('系统将在5分钟后进行维护')
if (err) {
  console.log('用户取消了操作')
  return
}
console.log('用户确认了操作')

// 带标题的信息弹窗
const [err] = await showAlert('系统将在5分钟后进行维护', '维护通知')
if (!err) {
  proceedWithMaintenance()
}

// 使用配置对象自定义弹窗
const [err] = await showAlert({
  message: '系统将在5分钟后进行维护',
  title: '维护通知',
  closeOnClickModal: false,
  confirmButtonText: '我知道了'
})
```

### showAlertError

显示错误信息弹窗。

```typescript
showAlertError(
  content: string | AlertOptions, 
  title?: string, 
  options?: ElMessageBoxOptions
): Promise<Result<MessageBoxData>>
```

**示例：**
```typescript
// 系统错误处理
const [err] = await showAlertError('系统遇到错误，请联系管理员')
if (!err) {
  contactAdmin()
}

// 自定义错误弹窗
const [err] = await showAlertError({
  message: '文件上传失败，请检查文件格式和大小',
  title: '上传错误',
  confirmButtonText: '重新上传'
})
```

### showAlertSuccess / showAlertWarning

显示成功/警告信息弹窗，用法与 `showAlertError` 类似。

## 📨 通知提示

### showNotify

显示一般信息通知。

```typescript
showNotify(
  content: string | NotificationParams, 
  title?: string, 
  options?: NotificationParams
): void
```

**示例：**
```typescript
// 简单通知
showNotify('新消息已送达')

// 带标题的通知
showNotify('您有一条新消息', '消息通知')

// 详细配置通知
showNotify({
  title: '系统通知',
  message: '您的账户余额不足，请及时充值',
  duration: 5000,
  position: 'top-right',
  showClose: true
})
```

### showNotifyError / showNotifySuccess / showNotifyWarning

显示不同类型的通知，用法与 `showNotify` 类似。

**示例：**
```typescript
// 文件操作反馈
class FileUploader {
  async uploadFile(file: File) {
    showNotify('开始上传文件...', '上传进度')
    
    const [err, result] = await to(this.doUpload(file))
    
    if (err) {
      showNotifyError('文件上传失败: ' + err.message, '上传失败')
      return
    }
    
    showNotifySuccess('文件上传成功', '上传完成', {
      duration: 3000,
      onClick: () => {
        // 点击通知查看文件
        this.viewUploadedFile(result.fileId)
      }
    })
  }
}
```

## ❓ 交互弹窗

### showConfirm

显示确认对话框。

```typescript
showConfirm(
  content: string | ConfirmOptions, 
  title?: string, 
  options?: ElMessageBoxOptions
): Promise<Result<MessageBoxData>>
```

**示例：**
```typescript
// 基本确认
const [err] = await showConfirm('确定要删除这条记录吗?')
if (err) {
  console.log('用户取消了删除操作')
  return
}
// 用户确认了，执行删除
deleteRecord()

// 自定义标题和按钮文本
const [err, result] = await showConfirm('确定要删除这条记录吗?', '删除确认', {
  confirmButtonText: '是的，删除',
  cancelButtonText: '取消操作'
})
if (!err) {
  deleteRecord()
  console.log('删除操作结果:', result)
}

// 使用配置对象自定义确认框
const [err] = await showConfirm({
  message: '确定要执行此操作吗?',
  title: '操作确认',
  confirmButtonText: '确定执行',
  cancelButtonText: '放弃操作',
  type: 'warning',
  closeOnClickModal: false
})
if (!err) {
  executeOperation()
}
```

**实际应用：**
```typescript
// 批量操作确认
async function batchDelete(selectedIds: number[]) {
  const [err] = await showConfirm(
    `确定要删除选中的 ${selectedIds.length} 条记录吗？此操作不可恢复。`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  
  if (err) return
  
  showLoading('正在删除...')
  const [deleteErr] = await to(batchDeleteAPI(selectedIds))
  hideLoading()
  
  if (deleteErr) {
    showMsgError('删除失败: ' + deleteErr.message)
  } else {
    showMsgSuccess(`成功删除 ${selectedIds.length} 条记录`)
    refreshList()
  }
}
```

### showPrompt

显示输入对话框。

```typescript
showPrompt(
  content: string | PromptOptions, 
  title?: string, 
  options?: ElMessageBoxOptions
): Promise<Result<MessageBoxData>>
```

**示例：**
```typescript
// 基本输入
const [err, result] = await showPrompt('请输入备注信息')
if (err) {
  console.log('用户取消了输入')
  return
}
// 用户输入的内容在 result.value 中
saveRemark(result.value)

// 自定义标题和验证
const [err, result] = await showPrompt('请输入备注信息', '添加备注', {
  inputPattern: /^.{1,50}$/,
  inputErrorMessage: '备注长度应在1-50个字符之间'
})
if (!err && result.value) {
  saveRemark(result.value)
}

// 使用配置对象自定义输入框
const [err, result] = await showPrompt({
  message: '请输入新的用户名',
  title: '修改用户名',
  inputPattern: /^[a-zA-Z0-9_]{3,20}$/,
  inputErrorMessage: '用户名只能包含字母、数字和下划线，长度3-20字符',
  confirmButtonText: '保存',
  cancelButtonText: '取消',
  inputPlaceholder: '请输入用户名...'
})
if (!err && result.value) {
  handleUsernameChange(result.value)
}
```

**实际应用：**
```typescript
// 重命名功能
async function renameItem(itemId: number, currentName: string) {
  const [err, result] = await showPrompt({
    message: '请输入新名称',
    title: '重命名',
    inputValue: currentName,
    inputPattern: /^.{1,100}$/,
    inputErrorMessage: '名称不能为空且不超过100个字符',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  
  if (err || !result.value) return
  
  if (result.value === currentName) {
    showMsgWarning('名称未发生变化')
    return
  }
  
  const [renameErr] = await to(renameItemAPI(itemId, result.value))
  if (renameErr) {
    showMsgError('重命名失败: ' + renameErr.message)
  } else {
    showMsgSuccess('重命名成功')
    refreshItemList()
  }
}
```

## 🔄 加载遮罩

### showLoading

显示全局加载遮罩。

```typescript
showLoading(content: string | CustomLoadingOptions): void
```

**示例：**
```typescript
// 基本使用
showLoading('数据加载中...')

// 自定义配置
showLoading({
  text: '正在保存数据，请稍候...',
  background: 'rgba(0, 0, 0, 0.8)',
  spinner: 'el-icon-loading'
})
```

### hideLoading

隐藏全局加载遮罩。

```typescript
hideLoading(): void
```

**示例：**
```typescript
// 在加载完成后隐藏遮罩
showLoading('正在提交数据')

const [err] = await to(submitData())
hideLoading()

if (err) {
  showMsgError('提交失败')
} else {
  showMsgSuccess('提交成功')
}
```

**实际应用：**
```typescript
// 表单提交处理
class FormHandler {
  async submitForm(formData: any) {
    showLoading('正在提交表单...')
    
    try {
      const [err, response] = await to(this.apiSubmit(formData))
      
      if (err) {
        showMsgError('提交失败: ' + err.message)
        return false
      }
      
      if (response.code === 200) {
        showMsgSuccess('提交成功')
        return true
      } else {
        showMsgWarning(response.message || '提交完成但有警告')
        return false
      }
    } finally {
      hideLoading()
    }
  }
}

// 数据加载管理
class DataManager {
  async loadData() {
    showLoading({
      text: '正在加载数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    const [err, data] = await to(this.fetchData())
    hideLoading()
    
    if (err) {
      showAlertError('数据加载失败，请重试', '加载错误')
      return null
    }
    
    return data
  }
}
```

## 💡 实际应用场景

### 1. 用户操作反馈系统

```typescript
class UserFeedbackManager {
  // 操作成功反馈
  static success(message: string, showNotification = false) {
    showMsgSuccess(message)
    
    if (showNotification) {
      showNotifySuccess(message, '操作成功', {
        duration: 3000
      })
    }
  }
  
  // 操作错误反馈
  static error(error: any, showDialog = false) {
    const message = error?.message || '操作失败'
    showMsgError(message)
    
    if (showDialog) {
      showAlertError(message, '错误提示')
    }
  }
  
  // 操作确认
  static async confirm(message: string, title = '确认操作'): Promise<boolean> {
    const [err] = await showConfirm(message, title)
    return !err
  }
  
  // 获取用户输入
  static async input(message: string, title = '请输入', validator?: RegExp): Promise<string | null> {
    const options: any = { message, title }
    
    if (validator) {
      options.inputPattern = validator
      options.inputErrorMessage = '输入格式不正确'
    }
    
    const [err, result] = await showPrompt(options)
    return err ? null : result.value
  }
}

// 使用示例
async function deleteUser(userId: number) {
  const confirmed = await UserFeedbackManager.confirm(
    '确定要删除这个用户吗？此操作不可恢复。'
  )
  
  if (!confirmed) return
  
  showLoading('正在删除用户...')
  const [err] = await to(deleteUserAPI(userId))
  hideLoading()
  
  if (err) {
    UserFeedbackManager.error(err, true)
  } else {
    UserFeedbackManager.success('用户删除成功', true)
  }
}
```

### 2. 表单验证与提交

```typescript
class FormManager {
  constructor(private formRef: Ref<ElFormInstance>) {}
  
  async validateAndSubmit(submitHandler: () => Promise<any>) {
    // 表单验证
    const [validateErr, isValid] = await toValidate(this.formRef)
    if (validateErr || !isValid) {
      showMsgError(validateErr?.message || '表单验证失败')
      return false
    }
    
    // 确认提交
    const [confirmErr] = await showConfirm('确定要提交表单吗？')
    if (confirmErr) return false
    
    // 执行提交
    showLoading('正在提交表单...')
    
    try {
      const [submitErr, result] = await to(submitHandler())
      
      if (submitErr) {
        showAlertError('提交失败: ' + submitErr.message, '提交错误')
        return false
      }
      
      showMsgSuccess('表单提交成功')
      showNotifySuccess('数据已保存', '提交完成')
      return true
      
    } finally {
      hideLoading()
    }
  }
}

// 使用示例
const formManager = new FormManager(formRef)

async function handleSubmit() {
  const success = await formManager.validateAndSubmit(async () => {
    return submitFormAPI(formData.value)
  })
  
  if (success) {
    router.push('/success-page')
  }
}
```

### 3. 文件操作管理

```typescript
class FileOperationManager {
  // 文件上传
  async uploadFile(file: File): Promise<boolean> {
    if (!this.validateFile(file)) {
      return false
    }
    
    showLoading(`正在上传文件: ${file.name}`)
    
    try {
      const [err, result] = await to(this.doUpload(file))
      
      if (err) {
        showNotifyError(`文件上传失败: ${err.message}`, '上传失败')
        return false
      }
      
      showNotifySuccess(`文件 ${file.name} 上传成功`, '上传完成', {
        duration: 5000,
        onClick: () => this.viewFile(result.fileId)
      })
      
      return true
      
    } finally {
      hideLoading()
    }
  }
  
  // 文件删除确认
  async deleteFile(fileName: string, fileId: string): Promise<boolean> {
    const [err] = await showConfirm(
      `确定要删除文件"${fileName}"吗？删除后无法恢复。`,
      '删除文件确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (err) return false
    
    showLoading('正在删除文件...')
    const [deleteErr] = await to(this.doDelete(fileId))
    hideLoading()
    
    if (deleteErr) {
      showMsgError('删除失败: ' + deleteErr.message)
      return false
    }
    
    showMsgSuccess('文件删除成功')
    return true
  }
  
  // 文件重命名
  async renameFile(fileId: string, currentName: string): Promise<string | null> {
    const [err, result] = await showPrompt({
      message: '请输入新的文件名',
      title: '重命名文件',
      inputValue: currentName,
      inputPattern: /^[^<>:"/\\|?*]+$/,
      inputErrorMessage: '文件名不能包含特殊字符',
      confirmButtonText: '重命名',
      cancelButtonText: '取消'
    })
    
    if (err || !result.value || result.value === currentName) {
      return null
    }
    
    showLoading('正在重命名文件...')
    const [renameErr] = await to(this.doRename(fileId, result.value))
    hideLoading()
    
    if (renameErr) {
      showMsgError('重命名失败: ' + renameErr.message)
      return null
    }
    
    showMsgSuccess('文件重命名成功')
    return result.value
  }
  
  private validateFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    
    if (file.size > maxSize) {
      showMsgError('文件大小不能超过10MB')
      return false
    }
    
    if (!allowedTypes.includes(file.type)) {
      showMsgError('只支持JPG、PNG和PDF格式的文件')
      return false
    }
    
    return true
  }
  
  private async doUpload(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    return uploadFileAPI(formData)
  }
  
  private async doDelete(fileId: string): Promise<void> {
    return deleteFileAPI(fileId)
  }
  
  private async doRename(fileId: string, newName: string): Promise<void> {
    return renameFileAPI(fileId, newName)
  }
  
  private viewFile(fileId: string): void {
    window.open(`/files/${fileId}`, '_blank')
  }
}
```

### 4. 数据操作工作流

```typescript
class DataWorkflow {
  // 批量操作工作流
  async batchOperation(
    selectedItems: any[],
    operation: 'delete' | 'export' | 'archive',
    operationHandler: (items: any[]) => Promise<any>
  ) {
    if (selectedItems.length === 0) {
      showMsgWarning('请选择要操作的项目')
      return false
    }
    
    // 操作确认
    const operationNames = {
      delete: '删除',
      export: '导出',
      archive: '归档'
    }
    
    const operationName = operationNames[operation]
    const [confirmErr] = await showConfirm(
      `确定要${operationName}选中的 ${selectedItems.length} 个项目吗？`,
      `批量${operationName}确认`
    )
    
    if (confirmErr) return false
    
    // 执行操作
    showLoading(`正在${operationName}，请稍候...`)
    
    try {
      const [err, result] = await to(operationHandler(selectedItems))
      
      if (err) {
        showAlertError(`批量${operationName}失败: ${err.message}`, `${operationName}错误`)
        return false
      }
      
      showMsgSuccess(`批量${operationName}成功`)
      showNotifySuccess(`已${operationName} ${selectedItems.length} 个项目`, `${operationName}完成`)
      
      return true
      
    } finally {
      hideLoading()
    }
  }
  
  // 数据导入工作流
  async importData(file: File): Promise<boolean> {
    // 文件验证
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      showMsgError('只支持Excel和CSV格式的文件')
      return false
    }
    
    // 预览确认
    showLoading('正在解析文件...')
    const [parseErr, previewData] = await to(this.parseFile(file))
    hideLoading()
    
    if (parseErr) {
      showAlertError('文件解析失败: ' + parseErr.message, '解析错误')
      return false
    }
    
    // 显示预览并确认
    const [confirmErr] = await showConfirm(
      `检测到 ${previewData.length} 条数据，确定要导入吗？`,
      '导入数据确认'
    )
    
    if (confirmErr) return false
    
    // 执行导入
    showLoading('正在导入数据...')
    const [importErr, result] = await to(this.doImport(previewData))
    hideLoading()
    
    if (importErr) {
      showAlertError('数据导入失败: ' + importErr.message, '导入错误')
      return false
    }
    
    showNotifySuccess(
      `成功导入 ${result.successCount} 条数据，失败 ${result.failCount} 条`,
      '导入完成',
      {
        duration: 8000,
        onClick: () => this.showImportReport(result)
      }
    )
    
    return true
  }
  
  private async parseFile(file: File): Promise<any[]> {
    // 模拟文件解析
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 1000)
    })
  }
  
  private async doImport(data: any[]): Promise<any> {
    // 模拟数据导入
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        successCount: data.length - 2,
        failCount: 2
      }), 2000)
    })
  }
  
  private showImportReport(result: any): void {
    // 显示导入报告
    console.log('导入报告:', result)
  }
}
```

## 🎨 与 Element Plus 的集成

### 表单验证结合

```typescript
// 表单验证与模态框结合使用
const handleFormSubmit = async () => {
  // 使用 toValidate 进行表单验证
  const [validateErr, isValid] = await toValidate(formRef.value)
  
  if (validateErr || !isValid) {
    // 显示验证错误
    showAlertError(validateErr?.message || '表单填写有误，请检查', '验证失败')
    return
  }
  
  // 确认提交
  const [confirmErr] = await showConfirm('确定要提交表单吗？')
  if (confirmErr) return
  
  // 执行提交
  showLoading('正在提交...')
  const [submitErr] = await to(submitForm(formData.value))
  hideLoading()
  
  if (submitErr) {
    showAlertError('提交失败: ' + submitErr.message)
  } else {
    showMsgSuccess('提交成功')
  }
}
```

### 表格操作结合

```typescript
// 表格操作与模态框结合
const handleTableRowAction = async (row: any, action: string) => {
  switch (action) {
    case 'edit':
      // 可以结合 showPrompt 进行快速编辑
      const [err, result] = await showPrompt(
        '请输入新名称',
        '编辑名称',
        { inputValue: row.name }
      )
      if (!err && result.value !== row.name) {
        await updateRowName(row.id, result.value)
      }
      break
      
    case 'delete':
      const [confirmErr] = await showConfirm(
        `确定要删除"${row.name}"吗？`,
        '删除确认'
      )
      if (!confirmErr) {
        await deleteRow(row.id)
      }
      break
  }
}
```

## ⚡ 性能优化建议

### 1. 避免频繁弹窗

```typescript
// ❌ 不推荐：连续多个弹窗
async function badExample() {
  await showAlert('第一个提示')
  await showAlert('第二个提示')  
  await showAlert('第三个提示')
}

// ✅ 推荐：合并提示内容
async function goodExample() {
  await showAlert(`
    操作完成，请注意以下事项：
    1. 数据已保存
    2. 邮件通知已发送
    3. 相关人员已收到提醒
  `, '操作完成')
}
```

### 2. 合理使用加载状态

```typescript
// ✅ 推荐：统一加载状态管理
class LoadingManager {
  private loadingCount = 0
  
  show(text: string = '加载中...') {
    if (this.loadingCount === 0) {
      showLoading(text)
    }
    this.loadingCount++
  }
  
  hide() {
    this.loadingCount--
    if (this.loadingCount <= 0) {
      this.loadingCount = 0
      hideLoading()
    }
  }
}

const loadingManager = new LoadingManager()
```

## ⚠️ 注意事项

1. **异步处理**：所有弹窗函数都是异步的，记得使用 await
2. **错误处理**：使用 Result 格式可以优雅地处理用户取消操作
3. **用户体验**：避免过度使用弹窗，影响用户体验
4. **移动端适配**：在移动设备上测试弹窗显示效果
5. **国际化**：考虑多语言环境下的文本显示

## ❓ 常见问题

### 1. 加载遮罩无法关闭

**问题描述：** 调用 `showLoading()` 后，即使调用 `hideLoading()` 遮罩也无法关闭。

**问题原因：**
- 多次调用 `showLoading()` 但只调用了一次 `hideLoading()`
- 异步操作中发生异常，导致 `hideLoading()` 未被执行

**解决方案：**

```typescript
// ✅ 推荐：使用 try-finally 确保遮罩关闭
async function fetchData() {
  showLoading('加载中...')
  try {
    const [err, data] = await to(apiCall())
    if (err) {
      showMsgError('加载失败')
      return
    }
    return data
  } finally {
    hideLoading() // 无论成功失败都会执行
  }
}

// ✅ 推荐：封装加载状态管理器处理多次调用
class LoadingManager {
  private count = 0

  show(text?: string) {
    if (this.count === 0) showLoading(text || '加载中...')
    this.count++
  }

  hide() {
    this.count = Math.max(0, this.count - 1)
    if (this.count === 0) hideLoading()
  }

  forceHide() {
    this.count = 0
    hideLoading()
  }
}
```

### 2. 确认框返回值判断错误

**问题描述：** 使用 `showConfirm` 时，用户点击确认按钮却执行了取消逻辑。

**问题原因：**
- Result 格式 `[err, result]` 中，`err` 为 `null` 表示用户确认，`err` 不为 `null` 表示用户取消
- 错误地使用了 `if (result)` 而非 `if (!err)` 进行判断

**解决方案：**

```typescript
// ❌ 错误：直接判断 result
const [err, result] = await showConfirm('确定删除吗？')
if (result) {  // result 可能为 undefined，导致判断失败
  deleteItem()
}

// ✅ 正确：判断 err 是否为 null
const [err] = await showConfirm('确定删除吗？')
if (!err) {  // err 为 null 表示用户确认
  deleteItem()
}

// ✅ 正确：提前返回模式
const [err] = await showConfirm('确定删除吗？')
if (err) return  // 用户取消，直接返回
deleteItem()  // 用户确认，继续执行
```

### 3. 通知消息堆叠过多

**问题描述：** 短时间内触发多个通知，导致界面右上角堆满通知消息。

**问题原因：**
- 循环或批量操作中为每条数据单独显示通知
- 未设置合理的 `duration` 自动关闭时间

**解决方案：**

```typescript
// ❌ 不推荐：每条数据都显示通知
items.forEach(item => {
  showNotifySuccess(`${item.name} 处理成功`)
})

// ✅ 推荐：批量操作后显示汇总通知
const results = await Promise.all(items.map(processItem))
const successCount = results.filter(r => r.success).length
showNotifySuccess(
  `批量处理完成：成功 ${successCount} 条，失败 ${items.length - successCount} 条`,
  '处理结果',
  { duration: 5000 }
)

// ✅ 推荐：使用防抖合并通知
import { useDebounceFn } from '@vueuse/core'

const showDebouncedNotify = useDebounceFn((messages: string[]) => {
  showNotify({
    title: '批量操作结果',
    message: messages.join('\n'),
    duration: 5000
  })
}, 500)
```
