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

### 1. to() - 基础异步处理

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

### 2. toValidate() - 表单验证专用

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

### 3. toAll() - 批量处理 Promise

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

### 4. toWithTimeout() - 超时控制

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

### 5. toSync() - 同步版本

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

### 6. toWithRetry() - 自动重试

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

### 7. toWithDefault() - 带默认值

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

### 8. toWithLog() - 带调试日志

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

### 9. toSequence() - 串行执行

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

### 10. toIf() - 条件执行

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

### 11. toResult() - 类型安全透传

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

---

## 常见问题

### 1. to()函数返回值类型判断导致类型收窄失败

**问题描述:**

使用 `to()` 函数后，即使检查了 `err` 为 `null`，TypeScript 仍然认为 `data` 可能是 `null`：

```typescript
// ❌ 类型收窄失败
const [err, user] = await to(fetchUser(id))
if (err) return

// TypeScript 报错: user 可能是 null
console.log(user.name)  // Object is possibly 'null'
```

**问题原因:**

1. **元组类型的独立性** - `[Error | null, T | null]` 中两个元素在类型系统中是独立的
2. **TypeScript 无法推导关联性** - 编译器不知道 `err === null` 时 `data` 一定不为 `null`
3. **to() 的返回类型定义** - 为了覆盖所有情况，返回类型必须包含 `null`

**解决方案:**

```typescript
// ✅ 方案1: 使用非空断言(确信数据存在时)
const [err, user] = await to(fetchUser(id))
if (err) {
  handleError(err)
  return
}
console.log(user!.name)  // 使用 ! 断言

// ✅ 方案2: 再次检查 data
const [err, user] = await to(fetchUser(id))
if (err || !user) {
  handleError(err || new Error('用户数据为空'))
  return
}
// 此时 user 类型自动收窄为非 null
console.log(user.name)
```

```typescript
// ✅ 方案3: 创建类型安全的包装函数
type SafeResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: Error }

async function toSafe<T>(promise: Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await promise
    return { success: true, data, error: null }
  } catch (e) {
    return {
      success: false,
      data: null,
      error: e instanceof Error ? e : new Error(String(e))
    }
  }
}

// 使用时类型完全安全
const result = await toSafe(fetchUser(id))
if (!result.success) {
  handleError(result.error)
  return
}
// result.data 自动推导为 User 类型,非 null
console.log(result.data.name)
```

```typescript
// ✅ 方案4: 使用泛型约束确保返回值
async function toRequired<T>(promise: Promise<T>): Promise<[Error, null] | [null, T]> {
  try {
    const data = await promise
    if (data === null || data === undefined) {
      return [new Error('返回值为空'), null]
    }
    return [null, data]
  } catch (e) {
    return [e instanceof Error ? e : new Error(String(e)), null]
  }
}

// 使用
const [err, user] = await toRequired(fetchUser(id))
if (err) {
  return handleError(err)
}
// user 类型收窄正确
console.log(user.name)
```

```typescript
// ✅ 方案5: 使用类型守卫函数
function hasData<T>(result: [Error | null, T | null]): result is [null, T] {
  return result[0] === null && result[1] !== null
}

function hasError<T>(result: [Error | null, T | null]): result is [Error, null] {
  return result[0] !== null
}

// 使用
const result = await to(fetchUser(id))
if (hasError(result)) {
  const [error] = result
  handleError(error)  // error 类型是 Error
  return
}
if (hasData(result)) {
  const [, user] = result
  console.log(user.name)  // user 类型是 User
}
```

### 2. toValidate()与不同UI框架的表单验证不兼容

**问题描述:**

`toValidate()` 专门针对 Element Plus 设计，与其他 UI 框架（如 Ant Design Vue、Naive UI、Vant）的表单验证 API 不兼容：

```typescript
// ❌ 与 Ant Design Vue 不兼容
const [err, isValid] = await toValidate(antFormRef.value)
// 报错: antFormRef.value.validate 不是预期的格式

// ❌ 与 Naive UI 不兼容
const [err, isValid] = await toValidate(naiveFormRef.value)
// validate 返回 Promise<void> 或抛出错误
```

**问题原因:**

1. **API 设计差异** - 不同 UI 框架的表单验证 API 差异很大
2. **返回值格式不同** - 有的返回布尔值，有的抛出错误，有的返回验证结果对象
3. **回调 vs Promise** - 部分框架使用回调，部分使用 Promise

**解决方案:**

```typescript
// ✅ 方案1: 创建适配不同框架的验证函数

// Element Plus 适配器
async function toValidateElementPlus(
  formRef: Ref<FormInstance | undefined>
): Promise<[Error | null, boolean]> {
  if (!formRef.value) {
    return [new Error('表单引用不存在'), false]
  }
  try {
    const valid = await formRef.value.validate()
    return [null, valid]
  } catch (e) {
    return [e instanceof Error ? e : new Error('验证失败'), false]
  }
}

// Ant Design Vue 适配器
async function toValidateAntd(
  formRef: Ref<FormInstance | undefined>
): Promise<[Error | null, boolean]> {
  if (!formRef.value) {
    return [new Error('表单引用不存在'), false]
  }
  try {
    await formRef.value.validate()
    return [null, true]
  } catch (e) {
    // Ant Design Vue 验证失败会抛出 errorInfo
    const errorInfo = e as { errorFields: Array<{ name: string[]; errors: string[] }> }
    const firstError = errorInfo.errorFields?.[0]?.errors?.[0]
    return [new Error(firstError || '验证失败'), false]
  }
}

// Naive UI 适配器
async function toValidateNaive(
  formRef: Ref<FormInst | undefined>
): Promise<[Error | null, boolean]> {
  if (!formRef.value) {
    return [new Error('表单引用不存在'), false]
  }
  try {
    await formRef.value.validate()
    return [null, true]
  } catch (e) {
    // Naive UI 验证失败会抛出错误数组
    const errors = e as Array<{ message: string }>
    const firstError = errors?.[0]?.message
    return [new Error(firstError || '验证失败'), false]
  }
}

// Vant 适配器
async function toValidateVant(
  formRef: Ref<FormInstance | undefined>
): Promise<[Error | null, boolean]> {
  if (!formRef.value) {
    return [new Error('表单引用不存在'), false]
  }
  try {
    await formRef.value.validate()
    return [null, true]
  } catch (e) {
    // Vant 验证失败返回第一个错误信息
    return [new Error(String(e) || '验证失败'), false]
  }
}
```

```typescript
// ✅ 方案2: 创建统一的表单验证适配器工厂
type FormLibrary = 'element-plus' | 'antd' | 'naive-ui' | 'vant'

interface ValidateAdapter {
  validate: (formRef: any) => Promise<[Error | null, boolean]>
}

function createValidateAdapter(library: FormLibrary): ValidateAdapter {
  const adapters: Record<FormLibrary, ValidateAdapter> = {
    'element-plus': {
      async validate(formRef) {
        if (!formRef?.value) return [new Error('表单引用不存在'), false]
        try {
          const valid = await formRef.value.validate()
          return [null, valid !== false]
        } catch (e) {
          return [e instanceof Error ? e : new Error('验证失败'), false]
        }
      }
    },
    'antd': {
      async validate(formRef) {
        if (!formRef?.value) return [new Error('表单引用不存在'), false]
        try {
          await formRef.value.validate()
          return [null, true]
        } catch (e: any) {
          const msg = e?.errorFields?.[0]?.errors?.[0] || '验证失败'
          return [new Error(msg), false]
        }
      }
    },
    'naive-ui': {
      async validate(formRef) {
        if (!formRef?.value) return [new Error('表单引用不存在'), false]
        try {
          await formRef.value.validate()
          return [null, true]
        } catch (e: any) {
          const msg = e?.[0]?.message || '验证失败'
          return [new Error(msg), false]
        }
      }
    },
    'vant': {
      async validate(formRef) {
        if (!formRef?.value) return [new Error('表单引用不存在'), false]
        try {
          await formRef.value.validate()
          return [null, true]
        } catch (e) {
          return [new Error(String(e) || '验证失败'), false]
        }
      }
    }
  }

  return adapters[library]
}

// 使用
const validateAdapter = createValidateAdapter('antd')
const [err, isValid] = await validateAdapter.validate(formRef)
```

```typescript
// ✅ 方案3: 使用通用的验证包装器
async function toValidateUniversal<T>(
  validateFn: () => Promise<T>,
  successPredicate: (result: T) => boolean = () => true
): Promise<[Error | null, boolean]> {
  try {
    const result = await validateFn()
    return [null, successPredicate(result)]
  } catch (e) {
    // 尝试从不同格式的错误中提取信息
    let message = '验证失败'
    if (e instanceof Error) {
      message = e.message
    } else if (typeof e === 'object' && e !== null) {
      const errorObj = e as any
      message =
        errorObj.message ||
        errorObj.errorFields?.[0]?.errors?.[0] ||
        errorObj[0]?.message ||
        String(e)
    }
    return [new Error(message), false]
  }
}

// 使用 - 适用于任何框架
// Element Plus
const [err1, valid1] = await toValidateUniversal(
  () => elementFormRef.value!.validate()
)

// Ant Design Vue
const [err2, valid2] = await toValidateUniversal(
  () => antFormRef.value!.validate()
)

// Naive UI
const [err3, valid3] = await toValidateUniversal(
  () => naiveFormRef.value!.validate()
)
```

### 3. toWithRetry()重试策略配置不当导致请求堆积

**问题描述:**

不合理的重试配置会导致请求堆积、服务器压力增大、用户体验变差：

```typescript
// ❌ 问题配置
const [err, data] = await toWithRetry(
  () => fetch('/api/data'),
  10,     // 重试10次太多
  100     // 间隔100ms太短
)
// 可能在短时间内发送10多次请求,造成服务器压力
```

**问题原因:**

1. **重试次数过多** - 对于已经不可用的服务，重试只是浪费资源
2. **重试间隔过短** - 服务器可能需要恢复时间
3. **缺少指数退避** - 固定间隔可能不适合所有场景
4. **未区分错误类型** - 有些错误不应该重试（如 401、404）

**解决方案:**

```typescript
// ✅ 方案1: 实现指数退避策略
interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableErrors?: (error: Error) => boolean
  onRetry?: (error: Error, attempt: number) => void
}

async function toWithExponentialBackoff<T>(
  promiseFactory: () => Promise<T>,
  options: RetryOptions = {}
): Promise<[Error | null, T | null]> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryableErrors = () => true,
    onRetry
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await promiseFactory()
      return [null, result]
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))

      // 检查是否应该重试
      if (attempt >= maxRetries || !retryableErrors(lastError)) {
        break
      }

      // 计算延迟时间 (指数退避 + 随机抖动)
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt) + Math.random() * 1000,
        maxDelay
      )

      onRetry?.(lastError, attempt + 1)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return [lastError, null]
}

// 使用示例
const [err, data] = await toWithExponentialBackoff(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableErrors: (error) => {
      // 只重试网络错误和 5xx 错误
      if (error.message.includes('network')) return true
      if (error.message.includes('500')) return true
      if (error.message.includes('502')) return true
      if (error.message.includes('503')) return true
      return false
    },
    onRetry: (error, attempt) => {
      console.log(`重试第 ${attempt} 次，原因: ${error.message}`)
    }
  }
)
```

```typescript
// ✅ 方案2: 根据HTTP状态码决定是否重试
interface HttpError extends Error {
  status?: number
  code?: string
}

function isRetryableHttpError(error: Error): boolean {
  const httpError = error as HttpError
  const status = httpError.status

  // 不重试的情况
  const nonRetryableStatuses = [
    400, // Bad Request - 请求参数错误
    401, // Unauthorized - 认证失败
    403, // Forbidden - 权限不足
    404, // Not Found - 资源不存在
    422, // Unprocessable Entity - 业务逻辑错误
  ]

  if (status && nonRetryableStatuses.includes(status)) {
    return false
  }

  // 可重试的情况
  const retryableStatuses = [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ]

  if (status && retryableStatuses.includes(status)) {
    return true
  }

  // 网络错误可重试
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return true
  }

  return false
}

// 使用
const [err, data] = await toWithExponentialBackoff(
  () => apiRequest('/api/data'),
  {
    maxRetries: 3,
    retryableErrors: isRetryableHttpError
  }
)
```

```typescript
// ✅ 方案3: 带取消功能的重试
class RetryController {
  private aborted = false
  private abortReason: string | null = null

  abort(reason = '用户取消') {
    this.aborted = true
    this.abortReason = reason
  }

  get isAborted() {
    return this.aborted
  }

  get reason() {
    return this.abortReason
  }

  reset() {
    this.aborted = false
    this.abortReason = null
  }
}

async function toWithCancellableRetry<T>(
  promiseFactory: () => Promise<T>,
  controller: RetryController,
  options: RetryOptions = {}
): Promise<[Error | null, T | null]> {
  const { maxRetries = 3, baseDelay = 1000 } = options
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 检查是否已取消
    if (controller.isAborted) {
      return [new Error(controller.reason || '操作已取消'), null]
    }

    try {
      const result = await promiseFactory()
      return [null, result]
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))

      if (attempt < maxRetries && !controller.isAborted) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  return [lastError, null]
}

// 使用示例
const retryController = new RetryController()

// 开始请求
const requestPromise = toWithCancellableRetry(
  () => fetch('/api/slow-data'),
  retryController,
  { maxRetries: 5, baseDelay: 2000 }
)

// 用户点击取消按钮
cancelButton.onclick = () => {
  retryController.abort('用户取消了请求')
}

const [err, data] = await requestPromise
if (err) {
  if (err.message.includes('取消')) {
    console.log('用户取消了操作')
  } else {
    console.error('请求失败:', err.message)
  }
}
```

### 4. toAll()部分失败时无法区分成功和失败的请求

**问题描述:**

使用 `toAll()` 并行请求时，难以追踪哪些请求成功、哪些失败：

```typescript
// ❌ 难以追踪哪个请求失败
const results = await toAll([
  fetchUser(userId),
  fetchOrders(userId),
  fetchPreferences(userId)
])

// results 是 [[err1, data1], [err2, data2], [err3, data3]]
// 需要手动对应每个结果
```

**解决方案:**

```typescript
// ✅ 方案1: 使用带标签的结果包装
interface TaggedResult<T> {
  tag: string
  error: Error | null
  data: T | null
  success: boolean
}

async function toAllTagged<T>(
  requests: Array<{ tag: string; promise: Promise<T> }>
): Promise<TaggedResult<T>[]> {
  const results = await Promise.all(
    requests.map(async ({ tag, promise }) => {
      try {
        const data = await promise
        return { tag, error: null, data, success: true }
      } catch (e) {
        return {
          tag,
          error: e instanceof Error ? e : new Error(String(e)),
          data: null,
          success: false
        }
      }
    })
  )
  return results
}

// 使用
const results = await toAllTagged([
  { tag: 'user', promise: fetchUser(userId) },
  { tag: 'orders', promise: fetchOrders(userId) },
  { tag: 'preferences', promise: fetchPreferences(userId) }
])

// 轻松查找特定请求的结果
const userResult = results.find(r => r.tag === 'user')
if (userResult?.success) {
  console.log('用户信息:', userResult.data)
}

// 统计成功和失败
const successCount = results.filter(r => r.success).length
const failedTags = results.filter(r => !r.success).map(r => r.tag)
console.log(`成功: ${successCount}, 失败: ${failedTags.join(', ')}`)
```

```typescript
// ✅ 方案2: 返回对象形式的结果
type PromiseMap<T> = Record<string, Promise<T>>
type ResultMap<T> = Record<string, { error: Error | null; data: T | null }>

async function toAllNamed<T extends PromiseMap<any>>(
  promiseMap: T
): Promise<{ [K in keyof T]: { error: Error | null; data: Awaited<T[K]> | null } }> {
  const keys = Object.keys(promiseMap)
  const promises = Object.values(promiseMap)

  const results = await Promise.all(
    promises.map(async (promise) => {
      try {
        const data = await promise
        return { error: null, data }
      } catch (e) {
        return {
          error: e instanceof Error ? e : new Error(String(e)),
          data: null
        }
      }
    })
  )

  const resultMap: any = {}
  keys.forEach((key, index) => {
    resultMap[key] = results[index]
  })

  return resultMap
}

// 使用 - 类型安全,按名称访问结果
const results = await toAllNamed({
  user: fetchUser(userId),
  orders: fetchOrders(userId),
  preferences: fetchPreferences(userId)
})

// 直接按名称访问
if (!results.user.error) {
  console.log('用户:', results.user.data)
}
if (!results.orders.error) {
  console.log('订单:', results.orders.data)
}
```

```typescript
// ✅ 方案3: 分离成功和失败的结果
interface PartitionedResults<T> {
  succeeded: Array<{ index: number; data: T }>
  failed: Array<{ index: number; error: Error }>
  all: Array<{ index: number; success: boolean; data: T | null; error: Error | null }>
}

async function toAllPartitioned<T>(
  promises: Promise<T>[]
): Promise<PartitionedResults<T>> {
  const results = await Promise.all(
    promises.map(async (promise, index) => {
      try {
        const data = await promise
        return { index, success: true, data, error: null }
      } catch (e) {
        return {
          index,
          success: false,
          data: null,
          error: e instanceof Error ? e : new Error(String(e))
        }
      }
    })
  )

  return {
    succeeded: results
      .filter(r => r.success)
      .map(r => ({ index: r.index, data: r.data! })),
    failed: results
      .filter(r => !r.success)
      .map(r => ({ index: r.index, error: r.error! })),
    all: results
  }
}

// 使用
const filePromises = files.map(file => uploadFile(file))
const { succeeded, failed, all } = await toAllPartitioned(filePromises)

console.log(`上传完成: ${succeeded.length} 成功, ${failed.length} 失败`)

// 处理成功的文件
succeeded.forEach(({ index, data }) => {
  console.log(`文件 ${files[index].name} 上传成功:`, data.url)
})

// 处理失败的文件
failed.forEach(({ index, error }) => {
  console.error(`文件 ${files[index].name} 上传失败:`, error.message)
})
```

```typescript
// ✅ 方案4: 带重试的批量请求
interface BatchRequestOptions {
  concurrency?: number
  retryFailed?: boolean
  maxRetries?: number
}

async function toAllWithRetry<T>(
  promiseFactories: Array<() => Promise<T>>,
  options: BatchRequestOptions = {}
): Promise<{
  results: Array<{ success: boolean; data: T | null; error: Error | null }>
  retried: number
}> {
  const { concurrency = 5, retryFailed = true, maxRetries = 2 } = options

  const results: Array<{ success: boolean; data: T | null; error: Error | null }> = []
  let retriedCount = 0

  // 分批执行
  for (let i = 0; i < promiseFactories.length; i += concurrency) {
    const batch = promiseFactories.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async (factory) => {
        let lastError: Error | null = null
        let retries = 0

        while (retries <= maxRetries) {
          try {
            const data = await factory()
            return { success: true, data, error: null }
          } catch (e) {
            lastError = e instanceof Error ? e : new Error(String(e))
            if (retryFailed && retries < maxRetries) {
              retriedCount++
              retries++
              await new Promise(r => setTimeout(r, 1000 * retries))
            } else {
              break
            }
          }
        }

        return { success: false, data: null, error: lastError }
      })
    )

    results.push(...batchResults)
  }

  return { results, retried: retriedCount }
}

// 使用
const uploadFactories = files.map(file => () => uploadFile(file))
const { results, retried } = await toAllWithRetry(uploadFactories, {
  concurrency: 3,
  retryFailed: true,
  maxRetries: 2
})

console.log(`共重试 ${retried} 次`)
const successCount = results.filter(r => r.success).length
console.log(`最终结果: ${successCount}/${files.length} 成功`)
```

### 5. 嵌套使用to()导致代码冗余和错误处理重复

**问题描述:**

在复杂业务流程中，连续使用 `to()` 会产生大量重复的错误处理代码：

```typescript
// ❌ 冗余的错误处理
const [userErr, user] = await to(fetchUser(id))
if (userErr) {
  showError(userErr.message)
  return
}

const [ordersErr, orders] = await to(fetchOrders(user.id))
if (ordersErr) {
  showError(ordersErr.message)
  return
}

const [prefsErr, prefs] = await to(fetchPreferences(user.id))
if (prefsErr) {
  showError(prefsErr.message)
  return
}

const [saveErr] = await to(saveUserData(user, orders, prefs))
if (saveErr) {
  showError(saveErr.message)
  return
}
```

**解决方案:**

```typescript
// ✅ 方案1: 创建链式执行器
class AsyncChain<T> {
  private result: T | null = null
  private error: Error | null = null

  static start<U>(promise: Promise<U>): AsyncChain<U> {
    return new AsyncChain<U>(promise)
  }

  private constructor(private promise: Promise<T>) {
    this.init()
  }

  private async init() {
    try {
      this.result = await this.promise
    } catch (e) {
      this.error = e instanceof Error ? e : new Error(String(e))
    }
  }

  async then<U>(fn: (data: T) => Promise<U>): Promise<AsyncChain<U>> {
    await this.init()
    if (this.error || !this.result) {
      return AsyncChain.fromError(this.error || new Error('No data'))
    }
    return AsyncChain.start(fn(this.result))
  }

  async catch(handler: (error: Error) => void): Promise<T | null> {
    await this.init()
    if (this.error) {
      handler(this.error)
    }
    return this.result
  }

  async unwrap(): Promise<[Error | null, T | null]> {
    await this.init()
    return [this.error, this.result]
  }

  static fromError<U>(error: Error): AsyncChain<U> {
    const chain = new AsyncChain<U>(Promise.reject(error))
    chain.error = error
    return chain
  }
}

// 使用 - 链式调用
const result = await AsyncChain
  .start(fetchUser(id))
  .then(user => fetchOrders(user.id))
  .then(orders => processOrders(orders))
  .catch(err => showError(err.message))
```

```typescript
// ✅ 方案2: 使用管道模式
type AsyncStep<I, O> = (input: I) => Promise<O>

async function toPipe<T>(
  initialValue: T,
  ...steps: AsyncStep<any, any>[]
): Promise<[Error | null, any]> {
  let currentValue: any = initialValue

  for (const step of steps) {
    try {
      currentValue = await step(currentValue)
    } catch (e) {
      return [e instanceof Error ? e : new Error(String(e)), null]
    }
  }

  return [null, currentValue]
}

// 使用 - 管道执行
const [err, finalData] = await toPipe(
  userId,
  (id) => fetchUser(id),
  (user) => fetchOrders(user.id),
  (orders) => calculateTotalAmount(orders),
  (total) => generateReport(total)
)

if (err) {
  showError(err.message)
  return
}
console.log('报告生成完成:', finalData)
```

```typescript
// ✅ 方案3: 创建统一的错误处理中间件
type ErrorHandler = (error: Error, context: string) => void

function createToWithContext(
  defaultHandler: ErrorHandler
) {
  return async function<T>(
    promise: Promise<T>,
    context: string,
    customHandler?: ErrorHandler
  ): Promise<T | null> {
    try {
      return await promise
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      const handler = customHandler || defaultHandler
      handler(error, context)
      return null
    }
  }
}

// 创建带默认处理器的 to 函数
const toWithHandler = createToWithContext((error, context) => {
  console.error(`[${context}] 错误:`, error.message)
  ElMessage.error(`${context}失败: ${error.message}`)
})

// 使用 - 自动处理错误
const user = await toWithHandler(fetchUser(id), '获取用户信息')
if (!user) return

const orders = await toWithHandler(fetchOrders(user.id), '获取订单列表')
if (!orders) return

const result = await toWithHandler(processOrders(orders), '处理订单')
if (!result) return

console.log('流程完成:', result)
```

```typescript
// ✅ 方案4: 使用 Result 类实现
class Result<T, E = Error> {
  private constructor(
    private readonly _value: T | null,
    private readonly _error: E | null
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, null)
  }

  static err<E>(error: E): Result<never, E> {
    return new Result<never, E>(null, error)
  }

  static async from<T>(promise: Promise<T>): Promise<Result<T, Error>> {
    try {
      const value = await promise
      return Result.ok(value)
    } catch (e) {
      return Result.err(e instanceof Error ? e : new Error(String(e)))
    }
  }

  isOk(): boolean {
    return this._error === null
  }

  isErr(): boolean {
    return this._error !== null
  }

  unwrap(): T {
    if (this._error) throw this._error
    return this._value!
  }

  unwrapOr(defaultValue: T): T {
    return this._error ? defaultValue : this._value!
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._error) return Result.err(this._error)
    return Result.ok(fn(this._value!))
  }

  async andThen<U>(fn: (value: T) => Promise<Result<U, Error>>): Promise<Result<U, Error | E>> {
    if (this._error) return Result.err(this._error)
    return fn(this._value!)
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this._error ? handlers.err(this._error) : handlers.ok(this._value!)
  }
}

// 使用
const userResult = await Result.from(fetchUser(id))
const finalResult = await userResult
  .andThen(user => Result.from(fetchOrders(user.id)))
  .then(result => result.andThen(orders => Result.from(processOrders(orders))))

finalResult.match({
  ok: (data) => console.log('成功:', data),
  err: (error) => console.error('失败:', error.message)
})
```

### 6. 异步操作组件卸载后继续执行导致内存泄漏

**问题描述:**

组件卸载后，`to()` 包装的异步操作仍在执行，导致内存泄漏和错误：

```typescript
// ❌ 组件卸载后异步操作仍会执行
const loadData = async () => {
  const [err, data] = await to(fetchHeavyData())
  if (err) return

  // 组件已卸载,但这里仍会执行
  state.value = data  // 警告: 更新已卸载组件的状态
  showNotification('数据加载完成')  // 可能报错
}

onMounted(() => {
  loadData()
})
```

**解决方案:**

```typescript
// ✅ 方案1: 使用 AbortController 取消请求
import { onMounted, onUnmounted, ref } from 'vue'

function useAbortableRequest() {
  const abortController = ref<AbortController | null>(null)

  const execute = async <T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<[Error | null, T | null]> => {
    // 取消之前的请求
    abortController.value?.abort()

    // 创建新的控制器
    abortController.value = new AbortController()
    const signal = abortController.value.signal

    try {
      const data = await requestFn(signal)
      return [null, data]
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        return [new Error('请求已取消'), null]
      }
      return [e instanceof Error ? e : new Error(String(e)), null]
    }
  }

  const abort = () => {
    abortController.value?.abort()
    abortController.value = null
  }

  onUnmounted(() => {
    abort()
  })

  return { execute, abort }
}

// 在组件中使用
const { execute, abort } = useAbortableRequest()

const loadData = async () => {
  const [err, data] = await execute((signal) =>
    fetch('/api/heavy-data', { signal }).then(r => r.json())
  )

  if (err) {
    if (err.message === '请求已取消') return  // 组件卸载,静默处理
    showError(err.message)
    return
  }

  state.value = data
}
```

```typescript
// ✅ 方案2: 创建可取消的 to 函数
import { onUnmounted, shallowRef } from 'vue'

interface CancellablePromise<T> {
  promise: Promise<T>
  cancel: () => void
}

function makeCancellable<T>(promise: Promise<T>): CancellablePromise<T> {
  let isCancelled = false

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      value => !isCancelled && resolve(value),
      error => !isCancelled && reject(error)
    )
  })

  return {
    promise: wrappedPromise,
    cancel: () => { isCancelled = true }
  }
}

function useCancellableTo() {
  const pending = shallowRef<Array<() => void>>([])

  const toWithCancel = async <T>(
    promise: Promise<T>
  ): Promise<[Error | null, T | null, boolean]> => {
    const { promise: cancellablePromise, cancel } = makeCancellable(promise)
    pending.value.push(cancel)

    try {
      const data = await cancellablePromise
      return [null, data, false]
    } catch (e) {
      return [e instanceof Error ? e : new Error(String(e)), null, false]
    }
  }

  const cancelAll = () => {
    pending.value.forEach(cancel => cancel())
    pending.value = []
  }

  onUnmounted(() => {
    cancelAll()
  })

  return { to: toWithCancel, cancelAll }
}

// 使用
const { to: safeTo } = useCancellableTo()

const loadData = async () => {
  const [err, data] = await safeTo(fetchHeavyData())
  // 如果组件已卸载,这里不会执行
  if (!err && data) {
    state.value = data
  }
}
```

```typescript
// ✅ 方案3: 使用 VueUse 的 useAsyncState
import { useAsyncState } from '@vueuse/core'

// 在组件中
const { state, isLoading, error, execute } = useAsyncState(
  () => fetchHeavyData(),
  null,  // 初始值
  {
    immediate: true,
    resetOnExecute: true,
    onError: (e) => {
      console.error('加载失败:', e)
    }
  }
)

// useAsyncState 会自动处理组件卸载的情况
```

```typescript
// ✅ 方案4: 封装带生命周期感知的 to 函数
import { getCurrentInstance, onUnmounted } from 'vue'

function useLifecycleAwareTo() {
  const instance = getCurrentInstance()
  let isUnmounted = false

  onUnmounted(() => {
    isUnmounted = true
  })

  return async function<T>(
    promise: Promise<T>
  ): Promise<[Error | null, T | null, boolean]> {
    const [err, data] = await to(promise)

    // 返回第三个参数表示组件是否已卸载
    return [err, data, isUnmounted]
  }
}

// 使用
const toSafe = useLifecycleAwareTo()

const loadData = async () => {
  const [err, data, isUnmounted] = await toSafe(fetchHeavyData())

  // 组件已卸载,停止后续操作
  if (isUnmounted) return

  if (err) {
    showError(err.message)
    return
  }

  state.value = data
}
```

### 7. toWithTimeout()超时后原始Promise仍在执行消耗资源

**问题描述:**

`toWithTimeout()` 超时后只是返回错误，但原始 Promise 仍在后台执行：

```typescript
// ❌ 超时后原始请求仍在执行
const [err, data] = await toWithTimeout(
  fetch('/api/heavy-computation'),  // 这个请求仍在后台执行
  5000
)

if (err) {
  console.log('请求超时')
  // 但实际上请求可能还在执行,浪费带宽和服务器资源
}
```

**解决方案:**

```typescript
// ✅ 方案1: 使用 AbortController 实现真正的超时取消
async function toWithAbortableTimeout<T>(
  requestFn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  timeoutMessage = '请求超时'
): Promise<[Error | null, T | null]> {
  const controller = new AbortController()
  const { signal } = controller

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const result = await requestFn(signal)
    clearTimeout(timeoutId)
    return [null, result]
  } catch (e) {
    clearTimeout(timeoutId)

    if (e instanceof Error && e.name === 'AbortError') {
      return [new Error(timeoutMessage), null]
    }

    return [e instanceof Error ? e : new Error(String(e)), null]
  }
}

// 使用
const [err, data] = await toWithAbortableTimeout(
  (signal) => fetch('/api/heavy-computation', { signal }).then(r => r.json()),
  5000,
  '计算超时，请稍后重试'
)
```

```typescript
// ✅ 方案2: 封装支持取消的请求函数
interface CancellableRequest<T> {
  execute: () => Promise<[Error | null, T | null]>
  cancel: (reason?: string) => void
}

function createCancellableRequest<T>(
  requestFn: (signal: AbortSignal) => Promise<T>,
  options: {
    timeout?: number
    timeoutMessage?: string
  } = {}
): CancellableRequest<T> {
  const controller = new AbortController()
  const { signal } = controller

  let timeoutId: NodeJS.Timeout | null = null

  const execute = async (): Promise<[Error | null, T | null]> => {
    if (options.timeout) {
      timeoutId = setTimeout(() => {
        controller.abort()
      }, options.timeout)
    }

    try {
      const result = await requestFn(signal)
      if (timeoutId) clearTimeout(timeoutId)
      return [null, result]
    } catch (e) {
      if (timeoutId) clearTimeout(timeoutId)

      if (e instanceof Error && e.name === 'AbortError') {
        return [new Error(options.timeoutMessage || '请求被取消'), null]
      }

      return [e instanceof Error ? e : new Error(String(e)), null]
    }
  }

  const cancel = (reason = '用户取消') => {
    if (timeoutId) clearTimeout(timeoutId)
    controller.abort()
  }

  return { execute, cancel }
}

// 使用
const request = createCancellableRequest(
  (signal) => fetch('/api/data', { signal }).then(r => r.json()),
  { timeout: 5000, timeoutMessage: '请求超时' }
)

// 开始请求
const [err, data] = await request.execute()

// 或者在某个时刻取消
// request.cancel('用户点击了取消按钮')
```

```typescript
// ✅ 方案3: 使用 Promise.race 配合资源清理
async function toWithTimeoutAndCleanup<T>(
  promise: Promise<T>,
  timeoutMs: number,
  cleanup?: () => void,
  timeoutMessage = '操作超时'
): Promise<[Error | null, T | null]> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      cleanup?.()  // 执行清理操作
      reject(new Error(timeoutMessage))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return [null, result]
  } catch (e) {
    clearTimeout(timeoutId!)
    return [e instanceof Error ? e : new Error(String(e)), null]
  }
}

// 使用 - WebSocket 连接超时
const ws = new WebSocket('wss://example.com')

const [err, connection] = await toWithTimeoutAndCleanup(
  new Promise<WebSocket>((resolve, reject) => {
    ws.onopen = () => resolve(ws)
    ws.onerror = (e) => reject(e)
  }),
  5000,
  () => ws.close(),  // 超时时关闭连接
  '连接超时'
)
```

```typescript
// ✅ 方案4: 创建超时管理器
class TimeoutManager {
  private activeRequests = new Map<string, AbortController>()

  createRequest<T>(
    id: string,
    requestFn: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number
  ): {
    execute: () => Promise<[Error | null, T | null]>
    cancel: () => void
  } {
    // 取消之前的同ID请求
    this.cancel(id)

    const controller = new AbortController()
    this.activeRequests.set(id, controller)

    const execute = async (): Promise<[Error | null, T | null]> => {
      const timeoutId = setTimeout(() => {
        this.cancel(id)
      }, timeoutMs)

      try {
        const result = await requestFn(controller.signal)
        clearTimeout(timeoutId)
        this.activeRequests.delete(id)
        return [null, result]
      } catch (e) {
        clearTimeout(timeoutId)
        this.activeRequests.delete(id)

        if (e instanceof Error && e.name === 'AbortError') {
          return [new Error('请求超时或被取消'), null]
        }
        return [e instanceof Error ? e : new Error(String(e)), null]
      }
    }

    return {
      execute,
      cancel: () => this.cancel(id)
    }
  }

  cancel(id: string) {
    const controller = this.activeRequests.get(id)
    if (controller) {
      controller.abort()
      this.activeRequests.delete(id)
    }
  }

  cancelAll() {
    this.activeRequests.forEach(controller => controller.abort())
    this.activeRequests.clear()
  }

  get activeCount() {
    return this.activeRequests.size
  }
}

// 全局实例
const timeoutManager = new TimeoutManager()

// 使用
const searchRequest = timeoutManager.createRequest(
  'user-search',
  (signal) => fetch(`/api/users?q=${query}`, { signal }).then(r => r.json()),
  3000
)

const [err, users] = await searchRequest.execute()

// 用户快速输入时,自动取消之前的搜索请求
```

### 8. 复杂业务流程中to()的错误类型丢失和上下文信息缺失

**问题描述:**

在复杂业务流程中，难以追踪错误发生的具体位置和上下文：

```typescript
// ❌ 错误信息丢失上下文
const [err1, user] = await to(fetchUser(id))
if (err1) return handleError(err1)  // 不知道是哪个步骤失败

const [err2, orders] = await to(fetchOrders(user.id))
if (err2) return handleError(err2)  // 错误信息可能很模糊

const [err3, result] = await to(processOrders(orders))
if (err3) return handleError(err3)  // 难以定位问题
```

**解决方案:**

```typescript
// ✅ 方案1: 创建带上下文的错误类型
class ContextualError extends Error {
  constructor(
    message: string,
    public readonly context: string,
    public readonly step: string,
    public readonly originalError?: Error,
    public readonly metadata?: Record<string, any>
  ) {
    super(`[${context}:${step}] ${message}`)
    this.name = 'ContextualError'
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      step: this.step,
      metadata: this.metadata,
      stack: this.stack
    }
  }
}

async function toWithContext<T>(
  promise: Promise<T>,
  context: string,
  step: string,
  metadata?: Record<string, any>
): Promise<[ContextualError | null, T | null]> {
  try {
    const data = await promise
    return [null, data]
  } catch (e) {
    const originalError = e instanceof Error ? e : new Error(String(e))
    const contextualError = new ContextualError(
      originalError.message,
      context,
      step,
      originalError,
      metadata
    )
    return [contextualError, null]
  }
}

// 使用
const [err, user] = await toWithContext(
  fetchUser(id),
  '用户管理',
  '获取用户信息',
  { userId: id }
)

if (err) {
  console.error('错误上下文:', err.context)
  console.error('失败步骤:', err.step)
  console.error('元数据:', err.metadata)
  console.error('原始错误:', err.originalError)
  return
}
```

```typescript
// ✅ 方案2: 创建业务流程追踪器
interface FlowStep<T> {
  name: string
  execute: () => Promise<T>
  onError?: (error: Error) => void
  onSuccess?: (data: T) => void
}

interface FlowResult<T> {
  success: boolean
  data: T | null
  error: Error | null
  failedStep: string | null
  completedSteps: string[]
  duration: number
}

async function executeFlow<T>(
  flowName: string,
  steps: FlowStep<any>[],
  initialData?: any
): Promise<FlowResult<T>> {
  const startTime = Date.now()
  const completedSteps: string[] = []
  let currentData: any = initialData

  for (const step of steps) {
    try {
      console.log(`[${flowName}] 执行步骤: ${step.name}`)
      currentData = await step.execute()
      completedSteps.push(step.name)
      step.onSuccess?.(currentData)
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      step.onError?.(error)

      return {
        success: false,
        data: null,
        error: new Error(`[${flowName}] 步骤 "${step.name}" 失败: ${error.message}`),
        failedStep: step.name,
        completedSteps,
        duration: Date.now() - startTime
      }
    }
  }

  return {
    success: true,
    data: currentData,
    error: null,
    failedStep: null,
    completedSteps,
    duration: Date.now() - startTime
  }
}

// 使用
const result = await executeFlow<ProcessedOrder[]>('订单处理流程', [
  {
    name: '获取用户信息',
    execute: () => fetchUser(userId),
    onError: (e) => console.error('获取用户失败:', e)
  },
  {
    name: '获取订单列表',
    execute: async () => {
      const user = await fetchUser(userId)
      return fetchOrders(user.id)
    },
    onSuccess: (orders) => console.log(`获取到 ${orders.length} 个订单`)
  },
  {
    name: '处理订单数据',
    execute: () => processOrders(orders)
  },
  {
    name: '保存处理结果',
    execute: () => saveResults(processedOrders)
  }
])

if (!result.success) {
  console.error('流程失败:', result.error?.message)
  console.log('已完成步骤:', result.completedSteps.join(' → '))
  console.log('失败步骤:', result.failedStep)
  console.log('耗时:', result.duration, 'ms')

  // 可以根据失败步骤进行回滚
  if (result.failedStep === '保存处理结果') {
    await rollbackProcessing()
  }
}
```

```typescript
// ✅ 方案3: 创建错误边界和恢复机制
interface ErrorBoundary<T> {
  try: <U>(fn: () => Promise<U>, stepName: string) => ErrorBoundary<U>
  catch: (handler: (error: Error, step: string) => T | Promise<T>) => Promise<T>
  finally: (callback: () => void) => ErrorBoundary<T>
}

function createErrorBoundary<T>(): ErrorBoundary<T> {
  let chain: Promise<any> = Promise.resolve()
  let catchHandler: ((error: Error, step: string) => T | Promise<T>) | null = null
  let finallyCallback: (() => void) | null = null
  let failedStep: string | null = null

  const boundary: ErrorBoundary<T> = {
    try<U>(fn: () => Promise<U>, stepName: string): ErrorBoundary<U> {
      chain = chain.then(async () => {
        try {
          return await fn()
        } catch (e) {
          failedStep = stepName
          throw e
        }
      })
      return boundary as unknown as ErrorBoundary<U>
    },

    catch(handler: (error: Error, step: string) => T | Promise<T>): Promise<T> {
      catchHandler = handler
      return chain.catch(async (e) => {
        const error = e instanceof Error ? e : new Error(String(e))
        return catchHandler!(error, failedStep || 'unknown')
      }).finally(() => {
        finallyCallback?.()
      })
    },

    finally(callback: () => void): ErrorBoundary<T> {
      finallyCallback = callback
      return boundary
    }
  }

  return boundary
}

// 使用
const result = await createErrorBoundary<null>()
  .try(() => fetchUser(userId), '获取用户')
  .try((user) => fetchOrders(user.id), '获取订单')
  .try((orders) => processOrders(orders), '处理订单')
  .try((processed) => saveResults(processed), '保存结果')
  .finally(() => {
    console.log('流程结束')
  })
  .catch((error, step) => {
    console.error(`步骤 "${step}" 失败:`, error.message)

    // 根据失败步骤采取不同的恢复策略
    switch (step) {
      case '获取用户':
        showError('用户信息获取失败，请重试')
        break
      case '获取订单':
        showError('订单数据加载失败')
        break
      case '处理订单':
        // 可以返回部分结果
        return partialResults
      case '保存结果':
        // 保存失败，提供重试选项
        showRetryDialog()
        break
    }

    return null
  })
```

```typescript
// ✅ 方案4: 集成日志和监控
interface TrackedOperation<T> {
  id: string
  name: string
  startTime: number
  endTime?: number
  status: 'pending' | 'success' | 'error'
  error?: Error
  result?: T
  parentId?: string
}

class OperationTracker {
  private operations: Map<string, TrackedOperation<any>> = new Map()
  private currentParentId: string | null = null

  startOperation(name: string): string {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    this.operations.set(id, {
      id,
      name,
      startTime: Date.now(),
      status: 'pending',
      parentId: this.currentParentId || undefined
    })
    return id
  }

  completeOperation<T>(id: string, result: T) {
    const op = this.operations.get(id)
    if (op) {
      op.endTime = Date.now()
      op.status = 'success'
      op.result = result
    }
  }

  failOperation(id: string, error: Error) {
    const op = this.operations.get(id)
    if (op) {
      op.endTime = Date.now()
      op.status = 'error'
      op.error = error
    }
  }

  async track<T>(name: string, fn: () => Promise<T>): Promise<[Error | null, T | null]> {
    const id = this.startOperation(name)
    const previousParent = this.currentParentId
    this.currentParentId = id

    try {
      const result = await fn()
      this.completeOperation(id, result)
      return [null, result]
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      this.failOperation(id, error)
      return [error, null]
    } finally {
      this.currentParentId = previousParent
    }
  }

  getReport(): {
    total: number
    success: number
    failed: number
    pending: number
    avgDuration: number
    failedOperations: TrackedOperation<any>[]
  } {
    const ops = Array.from(this.operations.values())
    const completed = ops.filter(o => o.endTime)
    const durations = completed.map(o => o.endTime! - o.startTime)

    return {
      total: ops.length,
      success: ops.filter(o => o.status === 'success').length,
      failed: ops.filter(o => o.status === 'error').length,
      pending: ops.filter(o => o.status === 'pending').length,
      avgDuration: durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0,
      failedOperations: ops.filter(o => o.status === 'error')
    }
  }

  clear() {
    this.operations.clear()
  }
}

// 全局追踪器
const tracker = new OperationTracker()

// 使用
const [err1, user] = await tracker.track('获取用户', () => fetchUser(id))
if (err1) return

const [err2, orders] = await tracker.track('获取订单', () => fetchOrders(user.id))
if (err2) return

const [err3, result] = await tracker.track('处理订单', () => processOrders(orders))
if (err3) {
  // 查看完整报告
  const report = tracker.getReport()
  console.log('操作报告:', report)
  console.log('失败的操作:', report.failedOperations)
  return
}
```
