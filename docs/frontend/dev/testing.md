# 单元测试

前端项目的单元测试配置和编写指南。

## 🎯 测试框架

项目推荐使用 **Vitest** 作为单元测试框架。

| 框架 | 版本 | 特点 |
|------|------|------|
| **Vitest** | 最新 | Vite 原生支持、快速、兼容 Jest API |
| **@vue/test-utils** | 2.x | Vue 3 官方测试工具 |
| **happy-dom** | 最新 | 轻量级 DOM 模拟环境 |

## 📦 安装配置

### 安装依赖

```bash
pnpm add -D vitest @vue/test-utils happy-dom @vitest/ui
```

### Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### package.json 配置

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@vue/test-utils"]
  }
}
```

## 📝 基础测试

### 测试文件组织

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.vue
│   │   └── Button.spec.ts      # 测试文件
│   └── Input/
│       ├── Input.vue
│       └── Input.spec.ts
└── utils/
    ├── string.ts
    └── string.spec.ts
```

**命名规范**：
- 测试文件：`*.spec.ts` 或 `*.test.ts`
- 与源文件同目录
- 或统一放在 `__tests__` 目录

### 简单函数测试

```typescript
// src/utils/string.spec.ts
import { describe, it, expect } from 'vitest'
import { isEmpty, capitalize } from './string'

describe('string utils', () => {
  describe('isEmpty', () => {
    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true)
    })

    it('should return true for whitespace', () => {
      expect(isEmpty('   ')).toBe(true)
    })

    it('should return false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false)
    })

    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })
  })
})
```

## 🧪 组件测试

### 基本组件测试

```typescript
// src/components/Button/Button.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button Component', () => {
  it('renders button with text', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click Me'
      }
    })

    expect(wrapper.text()).toBe('Click Me')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button)

    await wrapper.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('applies type class', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'primary'
      }
    })

    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
```

### Composition API 测试

```typescript
// src/components/Counter/Counter.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

describe('Counter Component', () => {
  it('increments count on button click', async () => {
    const wrapper = mount(Counter)

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.find('.count').text()).toBe('1')
  })

  it('initializes with props value', () => {
    const wrapper = mount(Counter, {
      props: {
        initialCount: 5
      }
    })

    expect(wrapper.find('.count').text()).toBe('5')
  })
})
```

### Props 测试

```typescript
// src/components/UserCard/UserCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('UserCard Component', () => {
  const defaultProps = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  }

  it('renders user information', () => {
    const wrapper = mount(UserCard, {
      props: defaultProps
    })

    expect(wrapper.find('.name').text()).toBe('John Doe')
    expect(wrapper.find('.age').text()).toContain('30')
    expect(wrapper.find('.email').text()).toBe('john@example.com')
  })

  it('validates required props', () => {
    expect(() => {
      mount(UserCard, {
        props: {
          name: 'John'
          // missing required props
        }
      })
    }).toThrow()
  })
})
```

### Emits 测试

```typescript
// src/components/SearchInput/SearchInput.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchInput from './SearchInput.vue'

describe('SearchInput Component', () => {
  it('emits search event on input', async () => {
    const wrapper = mount(SearchInput)
    const input = wrapper.find('input')

    await input.setValue('test query')

    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')?.[0]).toEqual(['test query'])
  })

  it('debounces search event', async () => {
    vi.useFakeTimers()

    const wrapper = mount(SearchInput, {
      props: {
        debounce: 300
      }
    })

    const input = wrapper.find('input')
    await input.setValue('test')

    expect(wrapper.emitted('search')).toBeFalsy()

    vi.advanceTimersByTime(300)

    expect(wrapper.emitted('search')).toBeTruthy()

    vi.useRealTimers()
  })
})
```

## 🔄 异步测试

### API 请求测试

```typescript
// src/api/user.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserList, getUser } from './user'
import http from '@/utils/http'

// Mock http
vi.mock('@/utils/http')

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches user list', async () => {
    const mockData = {
      records: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ],
      total: 2
    }

    vi.mocked(http.get).mockResolvedValue([null, mockData])

    const [err, data] = await getUserList({ pageNum: 1, pageSize: 10 })

    expect(err).toBeNull()
    expect(data?.records).toHaveLength(2)
    expect(http.get).toHaveBeenCalledWith('/system/user/list', {
      pageNum: 1,
      pageSize: 10
    })
  })

  it('handles API error', async () => {
    const mockError = new Error('Network error')

    vi.mocked(http.get).mockResolvedValue([mockError, null])

    const [err, data] = await getUserList()

    expect(err).toBe(mockError)
    expect(data).toBeNull()
  })
})
```

### 组件异步操作测试

```typescript
// src/views/UserList.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import UserList from './UserList.vue'
import * as userApi from '@/api/user'

vi.mock('@/api/user')

describe('UserList Component', () => {
  it('loads and displays users', async () => {
    const mockUsers = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]

    vi.mocked(userApi.getUserList).mockResolvedValue([null, {
      records: mockUsers,
      total: 2
    }])

    const wrapper = mount(UserList)

    // 等待所有 Promise 完成
    await flushPromises()

    const rows = wrapper.findAll('.user-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('John')
  })

  it('shows loading state', () => {
    vi.mocked(userApi.getUserList).mockReturnValue(
      new Promise(() => {}) // Never resolves
    )

    const wrapper = mount(UserList)

    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('handles load error', async () => {
    vi.mocked(userApi.getUserList).mockResolvedValue([
      new Error('Failed to load'),
      null
    ])

    const wrapper = mount(UserList)
    await flushPromises()

    expect(wrapper.find('.error').exists()).toBe(true)
  })
})
```

## 🏪 Store 测试

### Pinia Store 测试

```typescript
// src/stores/user.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useUserStore()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
  })

  it('sets token', () => {
    const store = useUserStore()

    store.setToken('test-token')

    expect(store.token).toBe('test-token')
  })

  it('sets user info', () => {
    const store = useUserStore()
    const userInfo = { id: 1, name: 'John' }

    store.setUserInfo(userInfo)

    expect(store.userInfo).toEqual(userInfo)
  })

  it('clears store on logout', () => {
    const store = useUserStore()

    store.setToken('test-token')
    store.setUserInfo({ id: 1, name: 'John' })

    store.logout()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
  })
})
```

## 🎭 Mock 技巧

### Mock 函数

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('Mock Functions', () => {
  it('mocks a function', () => {
    const mockFn = vi.fn()

    mockFn('hello')
    mockFn('world')

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenCalledWith('hello')
    expect(mockFn).toHaveBeenLastCalledWith('world')
  })

  it('mocks function return value', () => {
    const mockFn = vi.fn().mockReturnValue(42)

    expect(mockFn()).toBe(42)
  })

  it('mocks function implementation', () => {
    const mockFn = vi.fn((x: number) => x * 2)

    expect(mockFn(21)).toBe(42)
  })
})
```

### Mock 模块

```typescript
// src/utils/api.spec.ts
import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import { fetchData } from './api'

// Mock 整个模块
vi.mock('axios')

describe('API Utils', () => {
  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }

    vi.mocked(axios.get).mockResolvedValue({ data: mockData })

    const result = await fetchData('/api/test')

    expect(result).toEqual(mockData)
  })
})
```

### Mock 部分模块

```typescript
// 只 Mock 部分函数
vi.mock('@/utils/string', async () => {
  const actual = await vi.importActual('@/utils/string')
  return {
    ...actual,
    isEmpty: vi.fn().mockReturnValue(false)
  }
})
```

### Mock 路由

```typescript
// src/components/Navigation.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Navigation from './Navigation.vue'

describe('Navigation Component', () => {
  it('navigates on click', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } }
      ]
    })

    const wrapper = mount(Navigation, {
      global: {
        plugins: [router]
      }
    })

    const link = wrapper.find('a[href="/about"]')
    await link.trigger('click')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/about')
  })
})
```

## 🎨 测试覆盖率

### 运行覆盖率测试

```bash
pnpm test:coverage
```

### 覆盖率报告

```
---------------------------|---------|----------|---------|---------|
File                       | % Stmts | % Branch | % Funcs | % Lines |
---------------------------|---------|----------|---------|---------|
All files                  |   85.23 |    78.45 |   82.11 |   85.67 |
 src/utils                 |   92.15 |    88.23 |   90.00 |   92.45 |
  string.ts                |   95.00 |    90.00 |   93.33 |   95.12 |
  date.ts                  |   89.30 |    86.46 |   86.67 |   89.78 |
 src/components            |   78.11 |    68.67 |   74.22 |   78.56 |
  Button.vue               |   88.00 |    80.00 |   85.00 |   88.33 |
  Input.vue                |   68.22 |    57.34 |   63.44 |   68.79 |
---------------------------|---------|----------|---------|---------|
```

**目标**：
- **语句覆盖率**: > 80%
- **分支覆盖率**: > 75%
- **函数覆盖率**: > 80%
- **行覆盖率**: > 80%

## 📋 最佳实践

### 测试命名

```typescript
// ✅ 清晰描述测试内容
describe('UserList Component', () => {
  it('displays user list after loading', () => {})
  it('shows error message when API fails', () => {})
  it('filters users by search keyword', () => {})
})

// ❌ 模糊的测试名称
describe('UserList', () => {
  it('works', () => {})
  it('test1', () => {})
})
```

### AAA 模式

```typescript
it('adds two numbers', () => {
  // Arrange - 准备测试数据
  const a = 1
  const b = 2

  // Act - 执行被测试代码
  const result = add(a, b)

  // Assert - 验证结果
  expect(result).toBe(3)
})
```

### 测试独立性

```typescript
// ✅ 每个测试独立
describe('Counter', () => {
  it('increments count', () => {
    const counter = new Counter()
    counter.increment()
    expect(counter.value).toBe(1)
  })

  it('decrements count', () => {
    const counter = new Counter()
    counter.decrement()
    expect(counter.value).toBe(-1)
  })
})

// ❌ 测试相互依赖
describe('Counter', () => {
  const counter = new Counter()

  it('increments count', () => {
    counter.increment()
    expect(counter.value).toBe(1)
  })

  it('decrements count', () => {
    counter.decrement() // 依赖上一个测试
    expect(counter.value).toBe(0)
  })
})
```

### 避免过度测试

```typescript
// ✅ 测试公共 API
it('formats user name', () => {
  const user = { firstName: 'John', lastName: 'Doe' }
  expect(formatUserName(user)).toBe('John Doe')
})

// ❌ 测试实现细节
it('calls internal helper function', () => {
  const spy = vi.spyOn(utils, '_internalHelper')
  formatUserName(user)
  expect(spy).toHaveBeenCalled()
})
```

## 🚀 运行测试

### 常用命令

```bash
# 运行所有测试
pnpm test

# 监听模式（文件变化自动运行）
pnpm test --watch

# 运行指定文件
pnpm test src/utils/string.spec.ts

# 运行匹配的测试
pnpm test --grep="Button"

# 查看 UI 界面
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage
```

### CI 集成

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## ❓ 常见问题

### 1. 测试运行缓慢或超时问题

**问题描述**

运行测试时速度非常慢，或者某些测试经常超时失败，尤其是包含异步操作的测试。

**问题原因**

- 测试中存在真实的网络请求未被 Mock
- 定时器未使用 fake timers 处理
- 测试文件过大，单个文件包含过多测试用例
- 测试环境配置不当，DOM 模拟库选择不合适

**解决方案**

```typescript
// vitest.config.ts - 优化配置
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 使用线程池并行执行
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true
      }
    },
    // 设置合理的超时时间
    testTimeout: 10000,
    hookTimeout: 10000,
    // 使用更轻量的 DOM 环境
    environment: 'happy-dom',
    // 启用缓存加速
    cache: {
      dir: 'node_modules/.vitest'
    }
  }
})
```

**处理异步超时**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Async Operations', () => {
  beforeEach(() => {
    // 使用 fake timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('handles delayed operation', async () => {
    const callback = vi.fn()

    // 模拟延迟操作
    setTimeout(callback, 5000)

    // 快进时间
    vi.advanceTimersByTime(5000)

    expect(callback).toHaveBeenCalled()
  })

  it('handles interval', async () => {
    const callback = vi.fn()

    setInterval(callback, 1000)

    vi.advanceTimersByTime(3000)

    expect(callback).toHaveBeenCalledTimes(3)
  })
})
```

**Mock 网络请求**

```typescript
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'John' }]))
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('API Tests', () => {
  it('fetches users quickly', async () => {
    const response = await fetch('/api/users')
    const data = await response.json()

    expect(data).toHaveLength(1)
  })
})
```

### 2. Mock 函数不生效或行为异常

**问题描述**

使用 `vi.mock()` 或 `vi.spyOn()` Mock 模块或函数后，实际运行时仍然调用了原始实现，或者 Mock 的返回值不符合预期。

**问题原因**

- Mock 声明位置不正确（应在文件顶部）
- 模块路径与实际导入路径不一致
- ESM 模块的导入顺序问题
- Mock 实现未正确设置

**解决方案**

```typescript
// ❌ 错误：Mock 声明在 import 之后
import { fetchData } from './api'
vi.mock('./api')

// ✅ 正确：Mock 声明提升到顶部（Vitest 自动处理）
import { describe, it, expect, vi } from 'vitest'
import { fetchData } from './api'

// vi.mock 会被提升到文件顶部
vi.mock('./api', () => ({
  fetchData: vi.fn()
}))

describe('API Tests', () => {
  it('calls mocked function', async () => {
    vi.mocked(fetchData).mockResolvedValue({ data: 'test' })

    const result = await fetchData()

    expect(result).toEqual({ data: 'test' })
  })
})
```

**处理 ESM 模块**

```typescript
// 对于默认导出的模块
vi.mock('./utils', () => ({
  default: vi.fn(() => 'mocked')
}))

// 对于命名导出和默认导出混合
vi.mock('./api', async () => {
  const actual = await vi.importActual('./api')
  return {
    ...actual,
    fetchData: vi.fn()
  }
})
```

**正确使用 spyOn**

```typescript
import { describe, it, expect, vi } from 'vitest'
import * as utils from './utils'

describe('spyOn Usage', () => {
  it('spies on module function', () => {
    // 必须使用 * as 导入才能 spy
    const spy = vi.spyOn(utils, 'formatDate')
    spy.mockReturnValue('2024-01-01')

    const result = utils.formatDate(new Date())

    expect(result).toBe('2024-01-01')
    expect(spy).toHaveBeenCalled()

    // 恢复原始实现
    spy.mockRestore()
  })
})
```

### 3. 异步测试失败或不稳定

**问题描述**

异步测试有时通过有时失败，测试结果不稳定，或者 `await` 后的断言不生效。

**问题原因**

- 未正确等待异步操作完成
- Vue 组件更新未刷新
- Promise 链未正确处理
- 竞态条件导致测试不稳定

**解决方案**

```typescript
import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import AsyncComponent from './AsyncComponent.vue'

describe('Async Component Tests', () => {
  it('waits for async data', async () => {
    const wrapper = mount(AsyncComponent)

    // 方案1: 使用 flushPromises 等待所有 Promise
    await flushPromises()

    expect(wrapper.find('.data').exists()).toBe(true)
  })

  it('waits for Vue updates', async () => {
    const wrapper = mount(AsyncComponent)

    // 触发状态变化
    await wrapper.find('button').trigger('click')

    // 方案2: 使用 nextTick 等待 Vue 更新
    await nextTick()

    expect(wrapper.find('.updated').exists()).toBe(true)
  })

  it('combines multiple waits', async () => {
    const wrapper = mount(AsyncComponent)

    await wrapper.find('button').trigger('click')

    // 先等待 Vue 更新，再等待异步操作
    await nextTick()
    await flushPromises()

    expect(wrapper.find('.complete').exists()).toBe(true)
  })
})
```

**处理多个异步操作**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DataLoader from './DataLoader.vue'
import * as api from '@/api'

vi.mock('@/api')

describe('DataLoader', () => {
  it('loads multiple data sources', async () => {
    // 设置不同的响应时间
    vi.mocked(api.fetchUsers).mockResolvedValue([{ id: 1 }])
    vi.mocked(api.fetchRoles).mockResolvedValue([{ id: 1 }])

    const wrapper = mount(DataLoader)

    // 等待所有异步操作完成
    await flushPromises()

    // 确保所有数据都已加载
    expect(wrapper.find('.users').exists()).toBe(true)
    expect(wrapper.find('.roles').exists()).toBe(true)
  })
})
```

**使用 waitFor 处理不确定的异步**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// 自定义 waitFor 函数
async function waitFor(
  callback: () => void,
  options = { timeout: 1000, interval: 50 }
) {
  const startTime = Date.now()

  while (Date.now() - startTime < options.timeout) {
    try {
      callback()
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, options.interval))
    }
  }

  callback() // 最后一次尝试，让错误抛出
}

describe('Polling Component', () => {
  it('eventually shows data', async () => {
    const wrapper = mount(PollingComponent)

    await waitFor(() => {
      expect(wrapper.find('.data').exists()).toBe(true)
    })
  })
})
```

### 4. Vue 组件测试中的 DOM 查找问题

**问题描述**

使用 `wrapper.find()` 或 `wrapper.findAll()` 无法找到预期的 DOM 元素，或者找到的元素不正确。

**问题原因**

- 选择器语法不正确
- 元素在条件渲染中未显示
- 异步渲染导致元素不存在
- 组件使用了 Teleport 或 Portal

**解决方案**

```typescript
import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import UserForm from './UserForm.vue'

describe('DOM Finding', () => {
  it('finds elements with various selectors', () => {
    const wrapper = mount(UserForm)

    // 标签选择器
    expect(wrapper.find('input').exists()).toBe(true)

    // 类选择器
    expect(wrapper.find('.form-input').exists()).toBe(true)

    // ID 选择器
    expect(wrapper.find('#username').exists()).toBe(true)

    // 属性选择器
    expect(wrapper.find('[data-testid="submit-btn"]').exists()).toBe(true)

    // 组合选择器
    expect(wrapper.find('button.primary').exists()).toBe(true)
  })

  it('uses data-testid for stable selectors', () => {
    const wrapper = mount(UserForm)

    // 推荐使用 data-testid 属性
    const submitBtn = wrapper.find('[data-testid="submit-btn"]')
    const cancelBtn = wrapper.find('[data-testid="cancel-btn"]')

    expect(submitBtn.exists()).toBe(true)
    expect(cancelBtn.exists()).toBe(true)
  })

  it('finds conditional elements', async () => {
    const wrapper = mount(UserForm, {
      props: { showAdvanced: false }
    })

    // 初始状态不存在
    expect(wrapper.find('.advanced-options').exists()).toBe(false)

    // 更新 props
    await wrapper.setProps({ showAdvanced: true })

    // 现在存在
    expect(wrapper.find('.advanced-options').exists()).toBe(true)
  })
})
```

**处理 Teleport 组件**

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalComponent from './ModalComponent.vue'

describe('Teleport Component', () => {
  it('finds teleported content', () => {
    // 创建 teleport 目标
    const teleportTarget = document.createElement('div')
    teleportTarget.id = 'modal-root'
    document.body.appendChild(teleportTarget)

    const wrapper = mount(ModalComponent, {
      props: { visible: true },
      attachTo: document.body
    })

    // 在 document 中查找
    const modal = document.querySelector('.modal-content')
    expect(modal).not.toBeNull()

    // 清理
    wrapper.unmount()
    teleportTarget.remove()
  })
})
```

**使用 findComponent 查找子组件**

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ParentComponent from './ParentComponent.vue'
import ChildComponent from './ChildComponent.vue'

describe('Component Finding', () => {
  it('finds child components', () => {
    const wrapper = mount(ParentComponent)

    // 通过组件引用查找
    const child = wrapper.findComponent(ChildComponent)
    expect(child.exists()).toBe(true)

    // 通过名称查找
    const namedChild = wrapper.findComponent({ name: 'ChildComponent' })
    expect(namedChild.exists()).toBe(true)

    // 查找所有子组件
    const allChildren = wrapper.findAllComponents(ChildComponent)
    expect(allChildren).toHaveLength(3)
  })
})
```

### 5. Pinia Store 测试隔离问题

**问题描述**

多个测试用例共享同一个 Store 实例，导致测试之间相互影响，状态未正确重置。

**问题原因**

- 未在每个测试前创建新的 Pinia 实例
- Store 状态在测试间持久化
- 全局注册的 Store 未清理

**解决方案**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia, getActivePinia } from 'pinia'
import { useUserStore } from './user'
import { useCartStore } from './cart'

describe('Store Isolation', () => {
  beforeEach(() => {
    // 每个测试前创建新的 Pinia 实例
    setActivePinia(createPinia())
  })

  afterEach(() => {
    // 可选：清理 Pinia 实例
    const pinia = getActivePinia()
    if (pinia) {
      pinia._s.forEach(store => store.$reset())
    }
  })

  it('test 1 - modifies store', () => {
    const store = useUserStore()
    store.setToken('token-1')

    expect(store.token).toBe('token-1')
  })

  it('test 2 - has clean store', () => {
    const store = useUserStore()

    // 由于新的 Pinia 实例，状态是干净的
    expect(store.token).toBe('')
  })
})
```

**测试 Store 之间的交互**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './user'
import { useCartStore } from './cart'

describe('Store Interactions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('cart depends on user authentication', () => {
    const userStore = useUserStore()
    const cartStore = useCartStore()

    // 未登录时购物车不可用
    expect(cartStore.isEnabled).toBe(false)

    // 登录后购物车可用
    userStore.setToken('valid-token')
    expect(cartStore.isEnabled).toBe(true)
  })
})
```

**在组件测试中使用 Store**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import UserProfile from './UserProfile.vue'
import { useUserStore } from '@/stores/user'

describe('UserProfile with Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays user info from store', () => {
    // 预先设置 Store 状态
    const userStore = useUserStore()
    userStore.setUserInfo({ name: 'John', email: 'john@example.com' })

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [createPinia()]
      }
    })

    expect(wrapper.find('.user-name').text()).toBe('John')
  })
})
```

### 6. 测试覆盖率统计不准确

**问题描述**

测试覆盖率报告显示某些已测试的代码未被覆盖，或者覆盖率数字与实际情况不符。

**问题原因**

- 源码映射配置问题
- Istanbul 或 v8 覆盖率工具配置不当
- 某些代码路径在测试中未执行
- 动态生成的代码未被正确追踪

**解决方案**

```typescript
// vitest.config.ts - 优化覆盖率配置
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      // 使用 v8 provider（更准确）
      provider: 'v8',
      // 或使用 istanbul
      // provider: 'istanbul',

      // 报告格式
      reporter: ['text', 'json', 'html', 'lcov'],

      // 覆盖率阈值
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80
      },

      // 包含的文件
      include: ['src/**/*.{ts,vue}'],

      // 排除的文件
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/types/',
        '**/mockData/',
        'src/main.ts'
      ],

      // 即使没有测试也要报告
      all: true,

      // 清理之前的覆盖率数据
      clean: true
    }
  }
})
```

**确保分支覆盖**

```typescript
import { describe, it, expect } from 'vitest'
import { getStatusText } from './status'

describe('Status Utils - Branch Coverage', () => {
  // 测试所有分支
  it('returns "Active" for status 1', () => {
    expect(getStatusText(1)).toBe('Active')
  })

  it('returns "Inactive" for status 0', () => {
    expect(getStatusText(0)).toBe('Inactive')
  })

  it('returns "Pending" for status 2', () => {
    expect(getStatusText(2)).toBe('Pending')
  })

  it('returns "Unknown" for invalid status', () => {
    expect(getStatusText(999)).toBe('Unknown')
  })

  // 测试边界条件
  it('handles null and undefined', () => {
    expect(getStatusText(null as any)).toBe('Unknown')
    expect(getStatusText(undefined as any)).toBe('Unknown')
  })
})
```

**忽略无需测试的代码**

```typescript
// 使用 istanbul 忽略注释
function complexFunction() {
  /* istanbul ignore if */
  if (process.env.NODE_ENV === 'development') {
    console.log('Debug mode')
  }

  // 正常的业务逻辑
  return doSomething()
}

// 或使用 v8 ignore
function anotherFunction() {
  /* v8 ignore start */
  if (import.meta.env.DEV) {
    // 开发环境专用代码
  }
  /* v8 ignore stop */
}
```

### 7. 快照测试管理困难

**问题描述**

快照文件频繁变化，难以判断变更是否符合预期，快照文件过大难以维护。

**问题原因**

- 组件包含动态内容（时间戳、随机ID）
- 快照包含过多不相关的细节
- 未对快照进行合理的拆分
- 团队对快照更新缺乏规范

**解决方案**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('Snapshot Testing', () => {
  beforeEach(() => {
    // 固定日期，避免快照变化
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('matches snapshot', () => {
    const wrapper = mount(UserCard, {
      props: {
        user: { id: 1, name: 'John', createdAt: new Date() }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('uses inline snapshot for small output', () => {
    const wrapper = mount(UserCard, {
      props: {
        user: { id: 1, name: 'John' }
      }
    })

    expect(wrapper.find('.user-name').text()).toMatchInlineSnapshot('"John"')
  })
})
```

**使用序列化器处理动态内容**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    snapshotSerializers: [
      // 自定义序列化器
      {
        serialize(val, config, indentation, depth, refs, printer) {
          // 移除动态 ID
          if (typeof val === 'string') {
            return val.replace(/id="[^"]+"/g, 'id="[ID]"')
          }
          return printer(val, config, indentation, depth, refs)
        },
        test(val) {
          return typeof val === 'string'
        }
      }
    ]
  }
})
```

**拆分快照文件**

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComplexForm from './ComplexForm.vue'

describe('Complex Form Snapshots', () => {
  it('header matches snapshot', () => {
    const wrapper = mount(ComplexForm)
    expect(wrapper.find('.form-header').html()).toMatchSnapshot('header')
  })

  it('body matches snapshot', () => {
    const wrapper = mount(ComplexForm)
    expect(wrapper.find('.form-body').html()).toMatchSnapshot('body')
  })

  it('footer matches snapshot', () => {
    const wrapper = mount(ComplexForm)
    expect(wrapper.find('.form-footer').html()).toMatchSnapshot('footer')
  })
})
```

### 8. 测试环境与生产环境差异问题

**问题描述**

测试在本地通过但 CI 环境失败，或者测试环境的行为与生产环境不一致。

**问题原因**

- DOM 模拟环境与真实浏览器差异
- 环境变量配置不一致
- 时区、语言设置差异
- 依赖版本差异

**解决方案**

```typescript
// vitest.config.ts - 统一环境配置
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 使用与 CI 一致的环境
    environment: 'happy-dom',

    // 统一时区
    environmentOptions: {
      happyDOM: {
        settings: {
          timezoneOffset: -480 // UTC+8
        }
      }
    },

    // 环境变量
    env: {
      TZ: 'Asia/Shanghai',
      NODE_ENV: 'test'
    },

    // 全局设置
    setupFiles: ['./tests/setup.ts']
  }
})
```

**设置文件统一配置**

```typescript
// tests/setup.ts
import { vi } from 'vitest'

// 统一时间
vi.useFakeTimers()
vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

// Mock 浏览器 API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}
Object.defineProperty(window, 'IntersectionObserver', {
  value: IntersectionObserverMock
})

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}
Object.defineProperty(window, 'ResizeObserver', {
  value: ResizeObserverMock
})
```

**处理浏览器特定 API**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Browser API Dependent Tests', () => {
  beforeEach(() => {
    // 重置 mock
    vi.clearAllMocks()
  })

  it('handles clipboard API', async () => {
    const clipboardMock = {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue('copied text')
    }

    Object.defineProperty(navigator, 'clipboard', {
      value: clipboardMock,
      configurable: true
    })

    await navigator.clipboard.writeText('test')

    expect(clipboardMock.writeText).toHaveBeenCalledWith('test')
  })

  it('handles geolocation API', () => {
    const geolocationMock = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        })
      })
    }

    Object.defineProperty(navigator, 'geolocation', {
      value: geolocationMock,
      configurable: true
    })

    const callback = vi.fn()
    navigator.geolocation.getCurrentPosition(callback)

    expect(callback).toHaveBeenCalled()
  })
})
```

**CI 环境特殊处理**

```typescript
// tests/ci-setup.ts
import { vi } from 'vitest'

// 检测 CI 环境
const isCI = process.env.CI === 'true'

if (isCI) {
  // CI 环境下增加超时时间
  vi.setConfig({ testTimeout: 30000 })

  // CI 环境下禁用某些不稳定的测试
  console.log('Running in CI environment')
}

// 统一随机数生成
const mockMath = Object.create(global.Math)
mockMath.random = () => 0.5
global.Math = mockMath
```

单元测试是保障前端代码质量的重要手段，通过系统化的测试策略和规范的测试实践，可以有效提升代码的可维护性和稳定性。
