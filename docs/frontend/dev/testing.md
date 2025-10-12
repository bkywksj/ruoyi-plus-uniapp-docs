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
