# 组件测试

## 介绍

本文档介绍 RuoYi-Plus-UniApp 项目中组件测试的方法和最佳实践。良好的测试覆盖可以确保组件的稳定性和可靠性，减少 Bug 和回归问题。

**核心内容:**

- **单元测试** - 测试组件的独立功能
- **组件测试** - 测试组件的渲染和交互
- **快照测试** - 验证组件的输出结构
- **E2E 测试** - 端到端用户流程测试
- **测试工具** - Vitest、Vue Test Utils 等

## 测试环境配置

### 安装依赖

```bash
# 安装测试框架
pnpm add -D vitest @vue/test-utils happy-dom

# 安装测试覆盖率工具
pnpm add -D @vitest/coverage-v8

# 安装 UniApp 测试工具（可选）
pnpm add -D @dcloudio/uni-automator
```

### Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,ts,vue}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**/*.vue'],
      exclude: ['src/components/**/index.ts']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### package.json 脚本

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## 单元测试

### 测试工具函数

```typescript
// utils/format.ts
export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`
}

export const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}
```

```typescript
// utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate } from './format'

describe('formatPrice', () => {
  it('should format integer price', () => {
    expect(formatPrice(100)).toBe('¥100.00')
  })

  it('should format decimal price', () => {
    expect(formatPrice(99.9)).toBe('¥99.90')
  })

  it('should format zero price', () => {
    expect(formatPrice(0)).toBe('¥0.00')
  })

  it('should handle negative price', () => {
    expect(formatPrice(-50)).toBe('¥-50.00')
  })
})

describe('formatDate', () => {
  it('should format date with YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 15) // 2024-01-15
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
  })

  it('should format date with custom format', () => {
    const date = new Date(2024, 11, 25)
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/12/25')
  })
})
```

### 测试组合函数

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const doubleCount = computed(() => count.value * 2)

  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  const reset = () => {
    count.value = initialValue
  }

  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  }
}
```

```typescript
// composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('should initialize with custom value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('should increment count', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })

  it('should decrement count', () => {
    const { count, decrement } = useCounter(5)
    decrement()
    expect(count.value).toBe(4)
  })

  it('should reset count', () => {
    const { count, increment, reset } = useCounter(10)
    increment()
    increment()
    expect(count.value).toBe(12)
    reset()
    expect(count.value).toBe(10)
  })

  it('should compute double count', () => {
    const { count, doubleCount, increment } = useCounter(5)
    expect(doubleCount.value).toBe(10)
    increment()
    expect(doubleCount.value).toBe(12)
  })
})
```

### 测试异步函数

```typescript
// api/user.ts
export const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) {
    throw new Error('User not found')
  }
  return response.json()
}
```

```typescript
// api/user.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchUser } from './user'

describe('fetchUser', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should fetch user successfully', async () => {
    const mockUser = { id: '1', name: 'John' }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser)
    } as Response)

    const user = await fetchUser('1')
    expect(user).toEqual(mockUser)
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
  })

  it('should throw error when user not found', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false
    } as Response)

    await expect(fetchUser('999')).rejects.toThrow('User not found')
  })
})
```

## 组件测试

### 基本组件测试

```vue
<!-- components/Button.vue -->
<template>
  <button
    :class="['btn', `btn--${type}`, { 'btn--disabled': disabled }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
interface Props {
  type?: 'primary' | 'default'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
```

```typescript
// components/Button.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('should render slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: '按钮文字'
      }
    })

    expect(wrapper.text()).toBe('按钮文字')
  })

  it('should apply type class', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'primary'
      }
    })

    expect(wrapper.classes()).toContain('btn--primary')
  })

  it('should apply disabled class when disabled', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.classes()).toContain('btn--disabled')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('should emit click event', async () => {
    const wrapper = mount(Button)

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('should not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
```

### 测试表单组件

```vue
<!-- components/Input.vue -->
<template>
  <input
    :value="modelValue"
    :placeholder="placeholder"
    :maxlength="maxlength"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script lang="ts" setup>
interface Props {
  modelValue?: string
  placeholder?: string
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>
```

```typescript
// components/Input.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from './Input.vue'

describe('Input', () => {
  it('should render with initial value', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'hello'
      }
    })

    expect(wrapper.find('input').element.value).toBe('hello')
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(Input)
    const input = wrapper.find('input')

    await input.setValue('test value')

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['test value'])
  })

  it('should support v-model', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': (value: string) => {
          wrapper.setProps({ modelValue: value })
        }
      }
    })

    await wrapper.find('input').setValue('new value')

    expect(wrapper.props('modelValue')).toBe('new value')
  })

  it('should emit focus event', async () => {
    const wrapper = mount(Input)

    await wrapper.find('input').trigger('focus')

    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('should emit blur event', async () => {
    const wrapper = mount(Input)

    await wrapper.find('input').trigger('blur')

    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('should render placeholder', () => {
    const wrapper = mount(Input, {
      props: {
        placeholder: '请输入'
      }
    })

    expect(wrapper.find('input').attributes('placeholder')).toBe('请输入')
  })
})
```

### 测试插槽

```typescript
// components/Card.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from './Card.vue'

describe('Card slots', () => {
  it('should render default slot', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<p>Card content</p>'
      }
    })

    expect(wrapper.html()).toContain('<p>Card content</p>')
  })

  it('should render header slot', () => {
    const wrapper = mount(Card, {
      slots: {
        header: '<h2>Card Title</h2>'
      }
    })

    expect(wrapper.find('.card__header').html()).toContain('<h2>Card Title</h2>')
  })

  it('should render scoped slot', () => {
    const wrapper = mount(Card, {
      props: {
        items: [{ id: 1, name: 'Item 1' }]
      },
      slots: {
        item: `<template #item="{ item }">
          <span>{{ item.name }}</span>
        </template>`
      }
    })

    expect(wrapper.text()).toContain('Item 1')
  })
})
```

### 测试异步组件

```typescript
// components/UserList.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import UserList from './UserList.vue'
import * as api from '@/api/user'

vi.mock('@/api/user')

describe('UserList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    vi.mocked(api.fetchUsers).mockImplementation(
      () => new Promise(() => {}) // 永不 resolve
    )

    const wrapper = mount(UserList)

    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('should render users after loading', async () => {
    const users = [
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' }
    ]

    vi.mocked(api.fetchUsers).mockResolvedValue(users)

    const wrapper = mount(UserList)

    await flushPromises()

    expect(wrapper.find('.loading').exists()).toBe(false)
    expect(wrapper.findAll('.user-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Jane')
  })

  it('should show error state on failure', async () => {
    vi.mocked(api.fetchUsers).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(UserList)

    await flushPromises()

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.text()).toContain('加载失败')
  })
})
```

## 快照测试

### 基本快照测试

```typescript
// components/UserCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('UserCard snapshots', () => {
  it('should match snapshot', () => {
    const wrapper = mount(UserCard, {
      props: {
        name: '张三',
        avatar: '/avatar.png',
        role: 'admin'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot when loading', () => {
    const wrapper = mount(UserCard, {
      props: {
        name: '张三',
        loading: true
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
```

### 内联快照

```typescript
it('should match inline snapshot', () => {
  const wrapper = mount(Badge, {
    props: {
      count: 5
    }
  })

  expect(wrapper.html()).toMatchInlineSnapshot(`
    "<span class="badge">5</span>"
  `)
})
```

## Mock 技巧

### Mock 模块

```typescript
// Mock 整个模块
vi.mock('@/api/user', () => ({
  fetchUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn()
}))

// Mock 部分导出
vi.mock('@/utils/storage', async () => {
  const actual = await vi.importActual('@/utils/storage')
  return {
    ...actual,
    getItem: vi.fn()
  }
})
```

### Mock uni API

```typescript
// test/setup.ts
vi.stubGlobal('uni', {
  showToast: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  getStorageSync: vi.fn(),
  setStorageSync: vi.fn(),
  navigateTo: vi.fn(),
  navigateBack: vi.fn(),
  request: vi.fn()
})
```

```typescript
// 在测试中使用
it('should show toast on success', async () => {
  const wrapper = mount(SubmitButton)

  await wrapper.trigger('click')
  await flushPromises()

  expect(uni.showToast).toHaveBeenCalledWith({
    title: '提交成功',
    icon: 'success'
  })
})
```

### Mock 定时器

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Timer component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should update after interval', async () => {
    const wrapper = mount(Countdown, {
      props: { seconds: 60 }
    })

    expect(wrapper.text()).toContain('60')

    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('59')
  })

  it('should emit complete after countdown', async () => {
    const wrapper = mount(Countdown, {
      props: { seconds: 2 }
    })

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('complete')).toHaveLength(1)
  })
})
```

## 测试覆盖率

### 运行覆盖率报告

```bash
# 运行测试并生成覆盖率报告
pnpm test:coverage
```

### 覆盖率配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/index.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
```

## 最佳实践

### 1. 测试文件组织

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.vue
│   │   ├── Button.test.ts   # 组件测试
│   │   └── index.ts
│   └── Input/
│       ├── Input.vue
│       ├── Input.test.ts
│       └── index.ts
├── composables/
│   ├── useCounter.ts
│   └── useCounter.test.ts   # 组合函数测试
└── utils/
    ├── format.ts
    └── format.test.ts       # 工具函数测试
```

### 2. 测试命名规范

```typescript
describe('ComponentName', () => {
  // 按功能分组
  describe('rendering', () => {
    it('should render correctly with default props', () => {})
    it('should render slot content', () => {})
  })

  describe('interaction', () => {
    it('should emit click event when clicked', () => {})
    it('should not emit when disabled', () => {})
  })

  describe('props', () => {
    it('should apply type class', () => {})
    it('should apply size class', () => {})
  })
})
```

### 3. 避免测试实现细节

```typescript
// ❌ 测试实现细节
it('should set isLoading to true', () => {
  const wrapper = mount(Button)
  wrapper.vm.isLoading = true
  expect(wrapper.vm.isLoading).toBe(true)
})

// ✅ 测试行为
it('should show loading state', async () => {
  const wrapper = mount(Button, {
    props: { loading: true }
  })
  expect(wrapper.find('.loading-spinner').exists()).toBe(true)
})
```

### 4. 使用 data-testid

```vue
<template>
  <button data-testid="submit-button" @click="submit">
    提交
  </button>
</template>
```

```typescript
it('should find element by testid', () => {
  const wrapper = mount(Form)
  const button = wrapper.find('[data-testid="submit-button"]')
  expect(button.exists()).toBe(true)
})
```

## 常见问题

### 1. 如何测试 Pinia Store？

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should login user', async () => {
    const store = useUserStore()
    await store.login('admin', '123456')
    expect(store.isLoggedIn).toBe(true)
  })
})
```

### 2. 如何测试路由相关组件？

```typescript
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: Home }]
})

it('should navigate on click', async () => {
  const wrapper = mount(NavLink, {
    global: {
      plugins: [router]
    }
  })

  await wrapper.trigger('click')
  expect(router.currentRoute.value.path).toBe('/target')
})
```

### 3. 如何处理异步更新？

```typescript
import { flushPromises } from '@vue/test-utils'

it('should update after async operation', async () => {
  const wrapper = mount(AsyncComponent)

  // 等待所有 Promise 完成
  await flushPromises()

  // 或等待 DOM 更新
  await wrapper.vm.$nextTick()

  expect(wrapper.text()).toContain('loaded')
})
```
