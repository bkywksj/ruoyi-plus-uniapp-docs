# To 工具类文档 - 安全异步执行工具

## 概述

`to.ts` 是一个强大的异步执行工具函数集，专门用于将 Promise 和可能抛出异常的代码转换为 `[error, data]` 格式，避免频繁使用 `try-catch`，让代码更加简洁和可读。

### 核心理念

- **统一错误处理**：所有异步操作都返回 `[Error | null, T | null]` 格式
- **避免 try-catch 地狱**：不再需要到处写 try-catch 代码块
- **类型安全**：完整的 TypeScript 支持
- **功能丰富**：涵盖常见的异步操作场景

---

## 核心函数

### 1. to() - 基础异步处理 ⭐⭐⭐⭐⭐

**最重要的函数，99% 的场景都会用到**

```typescript
const to = async <T>(promise: Promise<T>): Promise<[Error | null, T | null]>
```

#### 功能描述
将任何 Promise 转换为 `[error, data]` 格式，避免使用 try-catch。

#### 使用示例

```typescript
// ❌ 传统写法
try {
  const user = await getUserById('123');
  console.log('用户信息:', user);
} catch (error) {
  console.error('获取用户失败:', error.message);
  return;
}

// ✅ 使用 to() 函数
const [err, user] = await to(getUserById('123'));
if (err) {
  console.error('获取用户失败:', err.message);
  return;
}
console.log('用户信息:', user);
```

```typescript
// API 请求处理
const [err, response] = await to(fetch('/api/data'));
if (err) {
  showErrorMessage('网络请求失败');
  return;
}

const [parseErr, data] = await to(response.json());
if (parseErr) {
  showErrorMessage('数据解析失败');
  return;
}
console.log('请求结果:', data);
```

---

### 2. toValidate() - 表单验证专用 ⭐⭐⭐⭐

**后台管理系统表单验证的利器**

```typescript
const toValidate = async (formRef: Ref<ElFormInstance>): Promise<[Error | null, boolean]>
```

#### 功能描述
专门处理 Element Plus 等 UI 库的表单验证，将回调式 API 转换为 Promise。

#### 使用示例

```typescript
// Vue 组件中的表单验证
const handleSubmit = async () => {
  const [err, isValid] = await toValidate(formRef.value);
  if (err || !isValid) {
    ElMessage.error(err?.message || '表单验证失败');
    return;
  }

  // 验证通过，提交表单
  const [submitErr] = await to(submitForm(formData));
  if (submitErr) {
    ElMessage.error('提交失败: ' + submitErr.message);
    return;
  }

  ElMessage.success('提交成功');
};
```

```typescript
// 多个表单同时验证
const validateAllForms = async () => {
  const results = await toAll([
    toValidate(userFormRef.value),
    toValidate(addressFormRef.value),
    toValidate(paymentFormRef.value)
  ]);

  const hasErrors = results.some(([err, isValid]) => err || !isValid);
  if (hasErrors) {
    ElMessage.error('请检查表单输入');
    return false;
  }

  return true;
};
```

---

### 3. toAll() - 批量处理 Promise ⭐⭐⭐⭐

**并行执行多个异步操作**

```typescript
const toAll = async <T>(
  promises: (Promise<T> | Promise<[Error | null, T | null]>)[]
): Promise<Array<[Error | null, T | null]>>
```

#### 功能描述
并行执行多个 Promise，每个都使用 to 函数包装，不会因为某个失败而中断其他请求。支持混合传入原始 Promise 和已用 to() 包装的 Promise。

#### 使用示例

```typescript
// 并行请求多个接口
const promises = [
  getUserInfo(userId),              // 原始 Promise
  to(getUserOrders(userId)),        // 手动用 to() 包装的 Promise
  getUserPreferences(userId)        // 原始 Promise
];

const results = await toAll(promises);
const [userErr, userInfo] = results[0];
const [ordersErr, orders] = results[1];
const [prefsErr, preferences] = results[2];

// 统一处理，无论原始格式如何
if (userErr) console.error('获取用户信息失败:', userErr.message);
if (ordersErr) console.error('获取订单失败:', ordersErr.message);
if (prefsErr) console.error('获取偏好设置失败:', prefsErr.message);
```

```typescript
// 批量上传文件
const uploadPromises = files.map(file => uploadFile(file));
const results = await toAll(uploadPromises);

const successCount = results.filter(([err]) => !err).length;
const failCount = results.filter(([err]) => err).length;

console.log(`上传完成: 成功 ${successCount} 个，失败 ${failCount} 个`);
```

---

### 4. toWithTimeout() - 超时控制 ⭐⭐⭐

**为 Promise 添加超时机制**

```typescript
const toWithTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<[Error | null, T | null]>
```

#### 功能描述
为 Promise 添加超时控制，避免长时间等待，适用于网络请求、外部服务调用等场景。

#### 使用示例

```typescript
// 为 API 请求设置 5 秒超时
const [err, data] = await toWithTimeout(
  fetch('/api/heavy-computation'),
  5000,
  '计算超时，请稍后重试'
);

if (err) {
  if (err.message.includes('超时')) {
    showTimeoutMessage();
  } else {
    showErrorMessage('请求失败');
  }
  return;
}
console.log('计算结果:', data);
```

---

### 5. toSync() - 同步版本 ⭐⭐⭐

**处理可能抛出异常的同步代码**

```typescript
const toSync = <T>(fn: () => T): [Error | null, T | null]
```

#### 功能描述
用于包装可能抛出异常的同步函数，统一错误处理格式。主要用于 JSON 解析、数据处理等可能出错的同步操作。

#### 使用示例

```typescript
// 处理 JSON 解析
const [err, data] = toSync(() => JSON.parse(jsonString));
if (err) {
  console.error('JSON 解析失败:', err.message);
  return;
}
console.log('解析结果:', data);
```

```typescript
// 处理数组操作
const [err, result] = toSync(() => {
  if (array.length === 0) throw new Error('数组为空');
  return array[0].someProperty.toUpperCase();
});
if (err) {
  console.error('操作失败:', err.message);
  return;
}
console.log('处理结果:', result);
```

---

## 增强功能函数

### 6. toWithRetry() - 自动重试 ⭐⭐⭐

**适用于网络不稳定场景**

```typescript
const toWithRetry = async <T>(
  promiseFactory: (() => Promise<T>) | (() => Promise<[Error | null, T | null]>),
  maxRetries: number = 2,
  retryDelay: number = 1000
): Promise<[Error | null, T | null]>
```

#### 使用示例

```typescript
// 重试网络请求
const [err, data] = await toWithRetry(
  () => fetch('/api/unstable-endpoint'),
  3,    // 重试 3 次
  2000  // 间隔 2 秒
);
if (err) {
  console.error('重试 3 次后仍然失败:', err.message);
  showErrorMessage('网络连接不稳定，请稍后重试');
  return;
}
console.log('请求成功:', data);
```

---

### 7. toWithDefault() - 带默认值 ⭐⭐

**失败时使用备用数据**

```typescript
const toWithDefault = async <T>(
  promise: Promise<T>, 
  defaultValue: T
): Promise<[Error | null, T]>
```

#### 使用示例

```typescript
// 获取用户配置，失败时使用默认配置
const [err, config] = await toWithDefault(
  getUserConfig(userId),
  { theme: 'light', language: 'zh-CN', pageSize: 10 }
);
// config 保证不为 null，要么是获取到的配置，要么是默认配置
applyUserConfig(config);
if (err) {
  console.warn('使用默认配置，原因:', err.message);
}
```

---

### 8. toWithLog() - 带调试日志 ⭐⭐

**开发阶段监控异步操作**

```typescript
const toWithLog = async <T>(
  promise: Promise<T>,
  label: string = 'Promise',
  enableLog: boolean = true
): Promise<[Error | null, T | null]>
```

#### 使用示例

```typescript
// 监控 API 请求
const [err, userData] = await toWithLog(
  fetchUserData(userId),
  '获取用户数据',
  true
);
// 控制台输出:
// [获取用户数据] 开始执行
// [获取用户数据] 执行成功 (1234ms)  或  执行失败: 错误信息
```

---

## 高级功能函数

### 9. toSequence() - 串行执行 ⭐⭐

**按顺序处理有依赖关系的操作**

```typescript
const toSequence = async <T>(
  operations: Array<(() => Promise<T>) | (() => Promise<[Error | null, T | null]>)>
): Promise<[Error | null, T[]]>
```

#### 使用示例

```typescript
// 按顺序执行初始化步骤
const initSteps = [
  () => connectToDatabase(),           // 原始 Promise 函数
  () => to(loadConfiguration()),       // 用 to() 包装的函数
  () => startServices(),               // 原始 Promise 函数
  () => to(scheduleJobs())            // 用 to() 包装的函数
];

const [err, results] = await toSequence(initSteps);
if (err) {
  console.error('初始化失败:', err.message);
  await rollbackInitialization();
  return;
}

console.log('所有初始化步骤完成:', results);
```

---

### 10. toIf() - 条件执行 ⭐

**根据条件决定是否执行异步操作**

```typescript
const toIf = async <T>(
  condition: boolean,
  promise: Promise<T> | Promise<[Error | null, T | null]>
): Promise<[Error | null, T | null]>
```

#### 使用示例

```typescript
// 根据权限决定是否加载敏感数据
const [err, sensitiveData] = await toIf(
  userRole === 'admin',
  fetchSensitiveUserData(userId)
);
if (err) {
  console.error('加载敏感数据失败:', err.message);
} else if (sensitiveData) {
  renderSensitiveDataPanel(sensitiveData);
} else {
  console.log('权限不足，跳过敏感数据加载');
}
```

---

### 11. toResult() - 类型安全透传 ⭐

**用于已返回 Result 格式的函数**

```typescript
const toResult = async <T>(
  resultPromise: Promise<[Error | null, T | null]>
): Promise<[Error | null, T | null]>
```

#### 使用示例

```typescript
// 用于保持 API 一致性
const fetchUserSafely = async (userId: string) => {
  // 这个函数已经返回 Result 格式
  return toResult(apiClient.getUser(userId));
};

// 使用时保持一致的调用方式
const [err, user] = await fetchUserSafely('123');
```

---

## 实用技巧与最佳实践

### 1. 错误处理策略

```typescript
// ✅ 推荐：明确的错误处理
const [err, user] = await to(fetchUser(id));
if (err) {
  // 根据错误类型采取不同处理策略
  if (err.message.includes('网络')) {
    showNetworkError();
  } else if (err.message.includes('权限')) {
    redirectToLogin();
  } else {
    showGenericError();
  }
  return;
}
// 使用 user 数据
```

### 2. 嵌套调用处理

```typescript
// ✅ 推荐：扁平化处理
const [userErr, user] = await to(fetchUser(id));
if (userErr) return handleError(userErr);

const [orderErr, orders] = await to(fetchUserOrders(user.id));
if (orderErr) return handleError(orderErr);

const [prefErr, preferences] = await to(fetchUserPreferences(user.id));
if (prefErr) return handleError(prefErr);

// 所有数据都成功获取
renderUserDashboard(user, orders, preferences);
```

### 3. 表单验证组合

```typescript
// ✅ 推荐：组合多种验证
const validateAndSubmit = async () => {
  // 1. 表单验证
  const [validateErr, isValid] = await toValidate(formRef.value);
  if (validateErr || !isValid) {
    showValidationErrors(validateErr?.message);
    return;
  }

  // 2. 提交数据
  const [submitErr, response] = await to(submitForm(formData));
  if (submitErr) {
    showSubmitError(submitErr.message);
    return;
  }

  // 3. 成功处理
  showSuccessMessage('提交成功');
  router.push('/success');
};
```

### 4. 并行请求优化

```typescript
// ✅ 推荐：合理使用并行请求
const loadDashboardData = async () => {
  const results = await toAll([
    fetchUserInfo(),
    fetchNotifications(),
    fetchRecentActivity(),
    fetchSystemStats()
  ]);

  const [userErr, userInfo] = results[0];
  const [notifyErr, notifications] = results[1];
  const [activityErr, activities] = results[2];
  const [statsErr, stats] = results[3];

  // 部分数据失败不影响整体页面渲染
  if (!userErr) setUserInfo(userInfo);
  if (!notifyErr) setNotifications(notifications);
  if (!activityErr) setActivities(activities);
  if (!statsErr) setStats(stats);
};
```

---

## 常见场景示例

### 场景 1: 用户登录流程

```typescript
const handleLogin = async () => {
  // 1. 表单验证
  const [validateErr, isValid] = await toValidate(loginFormRef.value);
  if (validateErr || !isValid) {
    ElMessage.error('请检查输入信息');
    return;
  }

  // 2. 登录请求（带超时）
  showLoading('正在登录...');
  const [loginErr, loginResult] = await toWithTimeout(
    userLogin(loginForm),
    10000,
    '登录超时，请重试'
  );
  hideLoading();

  if (loginErr) {
    ElMessage.error(`登录失败: ${loginErr.message}`);
    return;
  }

  // 3. 获取用户信息
  const [userErr, userInfo] = await to(fetchUserInfo());
  if (userErr) {
    ElMessage.warning('登录成功，但获取用户信息失败');
  } else {
    setUserInfo(userInfo);
  }

  ElMessage.success('登录成功');
  router.push('/dashboard');
};
```

### 场景 2: 文件上传处理

```typescript
const handleFileUpload = async (files: File[]) => {
  // 并行上传多个文件
  const uploadPromises = files.map(file => 
    toWithRetry(() => uploadFile(file), 3, 1000)
  );
  
  const results = await toAll(uploadPromises);
  
  const successFiles = [];
  const failedFiles = [];
  
  results.forEach(([err, result], index) => {
    if (err) {
      failedFiles.push({ file: files[index], error: err.message });
    } else {
      successFiles.push(result);
    }
  });
  
  if (successFiles.length > 0) {
    ElMessage.success(`成功上传 ${successFiles.length} 个文件`);
  }
  
  if (failedFiles.length > 0) {
    ElMessage.error(`${failedFiles.length} 个文件上传失败`);
    console.error('上传失败的文件:', failedFiles);
  }
};
```

### 场景 3: 数据初始化流程

```typescript
const initializeApp = async () => {
  const initSteps = [
    () => to(checkSystemHealth()),
    () => to(loadApplicationConfig()),
    () => to(initializeDatabase()),
    () => to(setupEventListeners()),
    () => to(loadUserPreferences())
  ];

  const [err, results] = await toSequence(initSteps);
  
  if (err) {
    console.error('应用初始化失败:', err.message);
    showErrorDialog('系统初始化失败，请刷新页面重试');
    return;
  }

  console.log('应用初始化完成，执行了', results.length, '个步骤');
  setAppReady(true);
};
```

---

## TypeScript 类型说明

### Result 类型
```typescript
type Result<T> = [Error | null, T | null];
```

### 常用类型示例
```typescript
// API 响应类型
interface ApiResponse<T> {
  data: T;
  message: string;
  code: number;
}

// 使用示例
const [err, response] = await to<ApiResponse<User>>(fetchUser(id));
if (!err && response) {
  const user: User = response.data;
}
```

---

## 性能优化建议

### 1. 避免不必要的包装
```typescript
// ❌ 不推荐：已经是 to 格式的函数重复包装
const result = await to(alreadyToWrappedFunction()); // 重复包装

// ✅ 推荐：使用 toResult 或直接调用
const result = await toResult(alreadyToWrappedFunction());
// 或者
const result = await alreadyToWrappedFunction();
```

### 2. 合理使用重试机制
```typescript
// ❌ 不推荐：对所有请求都使用重试
const [err, data] = await toWithRetry(() => fetchData(), 5, 1000);

// ✅ 推荐：只对不稳定的请求使用重试
const [err, data] = await toWithRetry(() => fetchUnstableData(), 2, 500);
```

### 3. 批量请求性能
```typescript
// ❌ 不推荐：串行请求
const user = await to(fetchUser());
const orders = await to(fetchOrders());
const preferences = await to(fetchPreferences());

// ✅ 推荐：并行请求
const [userResult, ordersResult, prefsResult] = await toAll([
  fetchUser(),
  fetchOrders(), 
  fetchPreferences()
]);
```

---

## 总结

`to.ts` 工具类提供了完整的异步错误处理解决方案：

- **核心功能**：`to()`、`toValidate()`、`toAll()` 覆盖 90% 的使用场景
- **增强功能**：超时、重试、默认值等高级特性
- **开发友好**：完整的 TypeScript 支持和清晰的 API 设计
- **性能优化**：支持并行、串行、条件执行等多种模式

通过使用这些工具函数，可以显著提高代码的可读性、可维护性和健壮性，是现代前端开发中处理异步操作的最佳实践。
