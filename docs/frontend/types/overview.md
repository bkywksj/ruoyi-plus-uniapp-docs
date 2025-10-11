# 类型系统概览

项目采用 TypeScript 构建完整的类型系统,通过全局类型声明、模块扩展和工具类型,提供端到端的类型安全保障。

## 🎯 类型系统架构

### 核心类型文件

```
src/types/
├── global.d.ts           # 全局类型定义（API、分页、UI等）
├── router.d.ts           # 路由类型扩展
├── http.d.ts             # HTTP请求类型
├── icons.d.ts            # 图标类型（自动生成）
├── components.d.ts       # 组件类型（自动生成）
├── auto-imports.d.ts     # 自动导入类型（自动生成）
├── element.d.ts          # Element Plus扩展
└── env.d.ts              # 环境变量类型
```

## 📊 类型分类

### 1. API 交互类型

用于前后端数据交互的标准化类型定义。

```typescript
// 统一响应格式
type Result<T> = Promise<[Error | null, T | null]>

// 后端响应结构
interface R<T> {
  code: number
  msg: string
  data: T
}

// 分页响应
interface PageResult<T> {
  records: T[]
  total: number
  pages: number
  current: number
  size: number
}

// 分页查询
interface PageQuery {
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: string
}
```

**使用示例**:
```typescript
// API 函数定义
export const pageAds = (query?: AdQuery): Result<PageResult<AdVo>> => {
  return http.get<PageResult<AdVo>>('/base/ad/pageAds', query)
}

// 组件中使用
const [err, data] = await pageAds(query)
if (!err && data) {
  tableData.value = data.records
  total.value = data.total
}
```

### 2. 全局类型

在项目任何位置都可直接使用,无需导入。

```typescript
// 字典项
interface DictItem {
  label: string
  value: string
  status?: string
  elTagType?: ElTagType
  elTagClass?: string
}

// 弹窗状态
interface DialogState {
  title?: string
  visible: boolean
}

// 字段配置
interface FieldConfig {
  prop: string
  label: string
  span?: number
  type?: 'text' | 'date' | 'dict' | ...
  dictOptions?: DictItem[]
}
```

### 3. 路由类型

扩展 Vue Router 的类型定义。

```typescript
// 路由元数据
interface RouteMeta {
  title?: string          // 路由标题
  icon?: IconCode         // 路由图标
  affix?: boolean         // 是否固定标签
  noCache?: boolean       // 是否缓存
  activeMenu?: string     // 激活菜单
  breadcrumb?: boolean    // 显示面包屑
  i18nKey?: string        // 国际化键
}

// 路由记录扩展
interface _RouteRecordBase {
  hidden?: boolean        // 是否隐藏
  permissions?: string[]  // 权限标识
  roles?: string[]        // 角色
  alwaysShow?: boolean    // 总是显示根路由
}
```

### 4. 组件类型

组件属性和事件的类型定义。

```typescript
// Icon 组件
interface IconProps {
  value?: string
  code?: IconCode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string | number
  color?: string
  animate?: 'shake' | 'rotate180' | 'moveUp' | ...
}

// IconSelect 组件
interface IconSelectProps {
  modelValue: string
  width?: string
}
```

### 5. 工具类型

TypeScript 内置工具类型和自定义工具类型。

```typescript
// 内置工具类型
Partial<T>              // 所有属性可选
Required<T>             // 所有属性必选
Readonly<T>             // 所有属性只读
Pick<T, K>              // 选择部分属性
Omit<T, K>              // 排除部分属性
Record<K, T>            // 键值对类型

// 响应式类型
type SpanType = number | ResponsiveSpan | 'auto'

interface ResponsiveSpan {
  xs?: number  // <768px
  sm?: number  // ≥768px
  md?: number  // ≥992px
  lg?: number  // ≥1200px
  xl?: number  // ≥1920px
}
```

### 6. 状态管理类型

Pinia Store 的类型定义。

```typescript
// User Store
interface UserState {
  token: string
  userInfo: UserInfo
  roles: string[]
  permissions: string[]
}

// Settings Store
interface SettingsState {
  theme: 'light' | 'dark'
  sidebarOpened: boolean
  size: 'default' | 'large' | 'small'
}
```

## 🔧 类型声明方式

### 1. 全局类型声明

使用 `declare global` 在全局作用域声明类型。

```typescript
// global.d.ts
declare global {
  interface PageResult<T> {
    records: T[]
    total: number
  }
}

export {}  // 确保文件是模块
```

**特点**:
- ✅ 无需导入,全局可用
- ✅ 适合通用类型
- ⚠️ 避免命名冲突

### 2. 模块扩展

扩展第三方库的类型定义。

```typescript
// router.d.ts
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: IconCode
  }
}
```

**特点**:
- ✅ 扩展现有类型
- ✅ 保持类型兼容
- ✅ IDE 智能提示

### 3. 导出类型

在模块中导出类型供其他模块使用。

```typescript
// http.d.ts
export interface CustomHeaders {
  auth?: boolean
  tenant?: boolean
  repeatSubmit?: boolean
}
```

**使用**:
```typescript
import type { CustomHeaders } from '@/types/http'
```

## 📋 类型使用规范

### 1. 类型导入

```typescript
// ✅ 使用 type 关键字导入类型
import type { IconCode } from '@/types/icons'
import type { PageResult } from '@/types/global'  // 全局类型无需导入

// ✅ 混合导入
import { ref, computed, type Ref } from 'vue'

// ❌ 避免默认导入类型
import IconCode from '@/types/icons'
```

### 2. 组件 Props 类型

```typescript
// ✅ 推荐:使用 interface
interface UserFormProps {
  modelValue: UserBo
  mode: 'add' | 'edit'
}

const props = defineProps<UserFormProps>()

// ✅ 可选:使用 withDefaults
const props = withDefaults(defineProps<UserFormProps>(), {
  mode: 'add'
})
```

### 3. 事件类型

```typescript
// ✅ 定义事件类型
interface UserFormEmits {
  (e: 'update:modelValue', value: UserBo): void
  (e: 'submit', data: UserBo): void
  (e: 'cancel'): void
}

const emit = defineEmits<UserFormEmits>()
```

### 4. Ref 类型

```typescript
// ✅ 自动推导
const count = ref(0)  // Ref<number>
const user = ref<UserVo | null>(null)

// ✅ 显式声明
const list = ref<AdVo[]>([])
const form = ref<UserBo>({} as UserBo)

// ❌ 避免 any
const data = ref<any>({})
```

### 5. 响应式类型

```typescript
// ✅ reactive 自动推导
const state = reactive({
  loading: false,
  data: [] as AdVo[]
})

// ✅ 使用 interface
interface FormState {
  name: string
  age: number
}

const form = reactive<FormState>({
  name: '',
  age: 0
})
```

## 🎨 类型最佳实践

### 1. 复用业务类型

```typescript
// ✅ 定义可复用类型
interface BaseEntity {
  id?: string | number
  createTime?: string
  updateTime?: string
}

interface AdBo extends BaseEntity {
  adName: string
  status: string
}

interface AdVo extends BaseEntity {
  adName: string
  status: string
  statusName: string
}
```

### 2. 类型守卫

```typescript
// 类型判断函数
function isAdVo(obj: any): obj is AdVo {
  return obj && typeof obj.adName === 'string'
}

// 使用
if (isAdVo(data)) {
  console.log(data.adName)  // 类型安全
}
```

### 3. 泛型约束

```typescript
// ✅ 约束泛型类型
function getProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key]
}

// 使用
const user = { name: '张三', age: 20 }
const name = getProperty(user, 'name')  // string
const age = getProperty(user, 'age')    // number
```

### 4. 联合类型

```typescript
// ✅ 定义状态类型
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// ✅ 使用联合类型
interface FormMode {
  type: 'add' | 'edit' | 'view'
}
```

## 🔍 类型检查工具

### 1. VSCode 类型检查

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                 // 启用严格模式
    "noUnusedLocals": true,        // 未使用变量报错
    "noUnusedParameters": true,    // 未使用参数报错
    "noImplicitReturns": true      // 隐式返回报错
  }
}
```

### 2. 类型断言

```typescript
// ✅ 使用 as 断言
const user = {} as UserVo

// ✅ 使用 ! 非空断言
const name = user.name!

// ❌ 避免双重断言
const data = user as any as AdVo
```

### 3. 类型推导

```typescript
// ✅ 利用类型推导
const user = {
  name: '张三',
  age: 20
}  // 自动推导为 { name: string; age: number }

// ✅ 函数返回类型推导
function getUser() {
  return {
    name: '张三',
    age: 20
  }
}  // 返回类型自动推导
```

## 📝 类型文档导航

- [API 类型](./api-types.md) - API 交互类型定义
- [全局类型](./global-types.md) - 全局通用类型
- [组件类型](./component-types.md) - 组件属性和事件类型
- [路由类型](./router-types.md) - 路由系统类型扩展
- [状态类型](./store-types.md) - Pinia 状态管理类型
- [工具类型](./utility-types.md) - TypeScript 工具类型
- [枚举类型](./enums.md) - 枚举和常量定义
- [类型扩展](./type-extensions.md) - 第三方库类型扩展

## ✅ 类型检查清单

开发前检查:
- [ ] 是否定义了 Props 接口
- [ ] 是否定义了 Emits 接口
- [ ] 是否使用了正确的泛型约束
- [ ] 是否避免使用 any 类型

开发中检查:
- [ ] 类型导入使用 type 关键字
- [ ] Ref 类型是否正确声明
- [ ] API 返回类型是否匹配
- [ ] 是否有类型错误提示

发布前检查:
- [ ] 所有类型错误已修复
- [ ] 未使用的类型已清理
- [ ] 类型文档已更新
- [ ] tsconfig.json 配置正确

完整的类型系统确保代码质量,提供良好的开发体验和智能提示。
