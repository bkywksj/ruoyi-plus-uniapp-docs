# 🎣 组合式函数概览

组合式函数(Composables)是 Vue 3 Composition API 的核心概念,它们是利用 Vue 的响应式 API 来封装和复用有状态逻辑的函数。RuoYi-Plus-UniApp 管理端前端项目包含了 17 个精心设计的组合式函数,涵盖认证授权、网络通信、界面控制、数据处理、国际化等各种业务场景。

## 📦 完整清单

本项目共包含 **17 个组合式函数**,按功能分为以下 6 大类:

| 分类 | 数量 | 函数列表 |
|------|------|----------|
| 🎨 动画相关 | 1 | useAnimation |
| 🔐 认证授权 | 2 | useAuth, useToken |
| 🎛️ 界面控制 | 5 | useDialog, useLayout, useResponsiveSpan, useTableHeight, useTheme |
| 📊 数据处理 | 3 | useDict, useSelection, useDownload |
| 🌐 网络通信 | 3 | useHttp, useSSE, useWS |
| 🌍 国际化 | 1 | useI18n |
| 🛠️ 其他工具 | 2 | usePrint, useAiChat |

## 📋 详细分类

### 🎨 动画相关

#### useAnimation - 动画工具

基于 Animate.css 的动画工具集,提供丰富的动画效果和管理功能。

**核心功能:**
- 提供 20+ 种预定义动画效果(弹跳、渐入、翻转、缩放等)
- 支持进入/离开动画配置
- 提供随机动画模式
- 支持 DOM 元素动画应用
- 动画状态跟踪和控制

**主要 API:**
- `animationEffects` - 动画效果常量集合
- `currentAnimation` - 当前启用的动画(响应式)
- `isRandomAnimation` - 是否启用随机动画(响应式)
- `setAnimation(animation)` - 设置当前动画
- `toggleRandomAnimation(value?)` - 切换随机动画模式
- `applyAnimation(element, animation, callback?)` - 为 DOM 元素应用动画
- `createAnimationConfig(enter, leave)` - 创建动画配置

**使用场景:**
- 页面/组件进入/离开动画
- 按钮点击反馈动画
- 列表项渐入动画
- 搜索框展开/收起动画
- Logo 或菜单动画效果

**使用示例:**

```typescript
import { useAnimation } from '@/composables/useAnimation'

const {
  animationEffects,
  currentAnimation,
  setAnimation,
  applyAnimation
} = useAnimation()

// 设置渐入动画
setAnimation(animationEffects.FADE_IN)

// 为元素应用动画
const element = document.querySelector('.my-element')
applyAnimation(element, animationEffects.BOUNCE_IN, () => {
  console.log('动画结束')
})
```

---

### 🔐 认证授权

#### useAuth - 认证与授权

提供完整的用户认证和权限校验功能,支持基于角色和权限的访问控制。

**核心功能:**
- 用户登录状态检查
- 超级管理员和租户管理员角色判断
- 单个或多个权限检查(OR 逻辑)
- 批量权限检查(AND 逻辑)
- 单个或多个角色检查
- 路由访问权限验证
- 路由列表过滤

**主要 API:**
- `isLoggedIn` - 是否已登录(computed)
- `isSuperAdmin(roleToCheck?)` - 是否为超级管理员
- `isTenantAdmin(roleToCheck?)` - 是否为租户管理员
- `hasPermission(permission, superAdminRole?)` - 检查权限(OR 逻辑)
- `hasAllPermissions(permissions)` - 检查所有权限(AND 逻辑)
- `hasRole(role)` - 检查角色(OR 逻辑)
- `hasAllRoles(roles)` - 检查所有角色(AND 逻辑)
- `canAccessRoute(route)` - 检查路由访问权限
- `filterAuthorizedRoutes(routes)` - 过滤有权限的路由

**权限系统说明:**
- 超级管理员(`superadmin`)拥有所有权限
- 全局权限标识(`*:*:*`)拥有所有权限
- 权限格式:`模块:功能:操作`(如 `system:user:add`)
- 支持单个权限字符串或权限数组

**使用示例:**

```typescript
import { useAuth } from '@/composables/useAuth'

const {
  isLoggedIn,
  isSuperAdmin,
  hasPermission,
  hasAllPermissions,
  hasRole,
  canAccessRoute
} = useAuth()

// 检查登录状态
if (isLoggedIn.value) {
  console.log('用户已登录')
}

// 检查是否为超级管理员
if (isSuperAdmin()) {
  console.log('超级管理员,拥有所有权限')
}

// 检查单个权限(OR 逻辑)
if (hasPermission(['system:user:add', 'system:user:edit'])) {
  console.log('拥有添加或编辑用户的权限')
}

// 检查多个权限(AND 逻辑)
if (hasAllPermissions(['system:user:add', 'system:user:edit'])) {
  console.log('同时拥有添加和编辑用户的权限')
}

// 检查角色
if (hasRole('admin')) {
  console.log('拥有管理员角色')
}

// 检查路由访问权限
if (canAccessRoute(route)) {
  console.log('可以访问该路由')
}
```

**模板中使用权限指令:**

```vue
<template>
  <!-- 使用 v-hasPermi 指令控制按钮显示 -->
  <el-button v-hasPermi="['system:user:add']">新增</el-button>

  <!-- 检查多个权限(OR 逻辑) -->
  <el-button v-hasPermi="['system:user:edit', 'system:user:update']">
    编辑
  </el-button>

  <!-- 使用 v-hasRole 指令控制元素显示 -->
  <div v-hasRole="['admin']">管理员专属内容</div>
</template>
```

#### useToken - Token 管理

提供用户认证令牌的持久化管理,基于本地存储实现 Token 的获取、设置和清除。

**核心功能:**
- Token 持久化存储(基于 localStorage)
- Token 过期时间管理
- 认证头部生成(支持 Record 和查询字符串格式)
- Token 清除

**主要 API:**
- `getToken()` - 获取当前 Token
- `setToken(accessToken, expireSeconds?)` - 设置 Token
- `removeToken()` - 移除 Token
- `getAuthHeaders()` - 获取认证头部对象
- `getAuthQuery()` - 获取认证头部查询字符串

**使用示例:**

```typescript
import { useToken } from '@/composables/useToken'

const { getToken, setToken, removeToken, getAuthHeaders } = useToken()

// 设置 Token(永不过期)
setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

// 设置 Token(7天后过期)
setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 7 * 24 * 60 * 60)

// 获取 Token
const token = getToken()
console.log(token) // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// 获取认证头部
const headers = getAuthHeaders()
console.log(headers) // { Authorization: 'Bearer eyJhbGci...' }

// 移除 Token
removeToken()
```

---

### 🎛️ 界面控制

#### useLayout - 统一布局状态管理

提供完整的应用布局状态管理,包括侧边栏、主题、标签视图、语言、设备类型等。

**核心功能:**
- 设备类型管理(PC/移动端/平板)
- 侧边栏状态控制(打开/关闭/隐藏)
- 主题系统(亮色/暗色模式、主题色、侧边栏主题)
- 标签视图管理(添加/删除/清空/左右删除)
- 多语言支持(中文/英文)
- 组件尺寸设置
- 页面标题管理
- 配置持久化存储
- 响应式窗口监听

**主要 API:**

**设备和状态:**
- `device` - 当前设备类型(computed)
- `sidebar` - 侧边栏状态(computed)
- `title` - 当前页面标题(computed)
- `showSettings` - 是否显示设置面板(computed)

**用户偏好:**
- `language` - 界面语言(ref)
- `locale` - Element Plus 本地化配置(computed)
- `size` - 组件尺寸(ref)

**主题外观:**
- `theme` - 主题色(ref)
- `sideTheme` - 侧边栏主题(ref)
- `dark` - 暗黑模式(ref)

**布局配置:**
- `topNav` - 顶部导航显示(ref)
- `menuLayout` - 菜单布局模式(ref)
- `tagsView` - 标签视图显示(ref)
- `fixedHeader` - 固定头部(ref)
- `sidebarLogo` - 侧边栏 Logo(ref)
- `dynamicTitle` - 动态标题(ref)

**侧边栏操作:**
- `toggleSideBar(withoutAnimation?)` - 切换侧边栏
- `openSideBar(withoutAnimation?)` - 打开侧边栏
- `closeSideBar(withoutAnimation?)` - 关闭侧边栏
- `toggleSideBarHide(status)` - 设置侧边栏隐藏状态

**设备和偏好:**
- `toggleDevice(device)` - 切换设备类型
- `setSize(newSize)` - 设置组件尺寸
- `changeLanguage(lang)` - 切换界面语言
- `toggleDark(value)` - 切换暗黑模式
- `setTitle(value)` - 设置页面标题
- `resetTitle()` - 重置页面标题
- `saveSettings(newConfig?)` - 保存布局设置
- `resetConfig()` - 重置所有配置

**标签视图操作:**
- `addView(view)` - 添加视图到已访问和缓存列表
- `delView(view)` - 删除指定视图
- `delOthersViews(view)` - 删除其他视图
- `delAllViews()` - 删除所有视图
- `delRightTags(view)` - 删除右侧标签
- `delLeftTags(view)` - 删除左侧标签
- `updateVisitedView(view)` - 更新已访问视图信息

**使用示例:**

```typescript
import { useLayout } from '@/composables/useLayout'

const layout = useLayout()

// 侧边栏操作
layout.toggleSideBar() // 切换侧边栏
layout.openSideBar(true) // 打开侧边栏(无动画)
layout.closeSideBar() // 关闭侧边栏

// 主题操作
layout.toggleDark(true) // 启用暗黑模式
layout.theme.value = '#ff6b6b' // 设置主题色
layout.changeLanguage('en_US') // 切换英文

// 标签视图操作
layout.addView(route) // 添加标签
layout.delView(route) // 删除标签
layout.delOthersViews(route) // 删除其他标签

// 页面标题管理
layout.setTitle('用户管理') // 设置页面标题
layout.resetTitle() // 重置为默认标题

// 响应式状态访问
console.log(layout.device.value) // 当前设备类型
console.log(layout.sidebar.value) // 侧边栏状态
```

#### useDialog - 对话框管理

提供简洁的对话框状态管理功能。

**核心功能:**
- 对话框显示/隐藏状态管理
- 对话框标题管理

**主要 API:**
- `visible` - 对话框可见性(ref)
- `title` - 对话框标题(ref)
- `show(titleText?)` - 显示对话框
- `hide()` - 隐藏对话框
- `setTitle(titleText)` - 设置对话框标题

**使用示例:**

```vue
<template>
  <div>
    <el-button @click="dialog.show('新增用户')">打开对话框</el-button>

    <el-dialog v-model="dialog.visible.value" :title="dialog.title.value">
      <p>对话框内容</p>
      <template #footer>
        <el-button @click="dialog.hide()">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '@/composables/useDialog'

const dialog = useDialog()

const handleSubmit = () => {
  // 提交逻辑
  dialog.hide()
}
</script>
```

#### useTableHeight - 表格高度自适应

动态计算表格的最佳高度,确保内容完整显示,避免页面滚动。

**核心功能:**
- 响应式高度计算(考虑导航栏、页签、表单、分页等元素)
- 窗口大小变化监听
- 侧边栏状态变化监听
- 页签配置变化监听
- 搜索表单展示状态监听
- 表单尺寸变化监听(ResizeObserver)
- 防抖处理避免频繁计算
- 自定义高度调整值

**主要 API:**
- `tableHeight` - 表格高度(ref)
- `queryFormRef` - 查询表单引用(ref)
- `showSearch` - 搜索表单显示状态(ref)
- `calculateTableHeight()` - 手动触发高度计算

**使用示例:**

```vue
<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form
      ref="queryFormRef"
      v-show="showSearch"
      :model="queryParams"
      inline
    >
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row class="mb8">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table
      :data="userList"
      :height="tableHeight"
    >
      <el-table-column label="用户名称" prop="userName" />
      <el-table-column label="手机号码" prop="phonenumber" />
    </el-table>

    <!-- 分页 -->
    <pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { useTableHeight } from '@/composables/useTableHeight'

// 使用表格高度自适应(可选传入高度调整值)
const { tableHeight, queryFormRef, showSearch } = useTableHeight(0)

// 其他业务逻辑...
</script>
```

**高度计算逻辑:**

表格可用高度 = 视口高度 - 导航栏(50px) - 页签(34px,可选) - 页面容器内边距(16px) - 查询表单高度(动态) - 卡片头部(62px) - 表格内边距(40px) - 分页组件(56px) - 其他边距(18px) - 自定义调整值

最小高度为 200px,避免表格过小。

#### useTheme - 主题管理

提供主题色设置、切换和颜色变体生成功能。

**核心功能:**
- 主题色设置和应用
- 主题色亮度变体生成(9 个亮度级别)
- 主题色暗度变体生成(9 个暗度级别)
- CSS 变量管理
- 颜色透明度添加
- 主题重置

**主要 API:**
- `currentTheme` - 当前主题色(ref)
- `setTheme(color)` - 设置主题色
- `resetTheme()` - 重置为默认主题色
- `getLightColor(color, level)` - 获取亮度变体
- `getDarkColor(color, level)` - 获取暗度变体
- `generateThemeColors(color)` - 生成主题色变体集合
- `addAlphaToHex(hex, alpha)` - 为十六进制颜色添加透明度

**使用示例:**

```typescript
import { useTheme } from '@/composables/useTheme'

const {
  currentTheme,
  setTheme,
  resetTheme,
  getLightColor,
  getDarkColor,
  generateThemeColors,
  addAlphaToHex
} = useTheme()

// 设置主题色
setTheme('#ff6b6b')

// 获取亮度变体
const light3 = getLightColor('#409EFF', 0.3) // 30% 亮度

// 获取暗度变体
const dark5 = getDarkColor('#409EFF', 0.5) // 50% 暗度

// 生成完整主题色变体
const colors = generateThemeColors('#409EFF')
console.log(colors.primary) // '#409EFF'
console.log(colors.lightColors) // ['#53a8ff', '#66b1ff', ...] 9个亮度变体
console.log(colors.darkColors) // ['#337ecc', '#2d6ba8', ...] 9个暗度变体

// 添加透明度
const semi = addAlphaToHex('#409EFF', 0.5) // '#409EFF80'

// 重置主题色
resetTheme()
```

**颜色变体说明:**

亮度变体通过与白色混合实现,暗度变体通过与黑色混合实现。每个级别对应 10% 的混合比例:
- `light-1`: 10% 亮度
- `light-5`: 50% 亮度
- `light-9`: 90% 亮度
- `dark-1`: 10% 暗度
- `dark-5`: 50% 暗度
- `dark-9`: 90% 暗度

#### useResponsiveSpan - 响应式栅格

提供基于屏幕或容器的响应式布局计算,支持多种响应式模式。

**核心功能:**
- 屏幕响应式模式(基于媒体查询)
- 容器响应式模式(基于 ResizeObserver)
- 弹窗尺寸响应式模式(基于 Modal size)
- 智能模式选择(自动检测弹窗环境)
- 预设响应式配置
- 小弹窗优化配置

**响应式断点:**
- `xs`: 0-767px (手机)
- `sm`: 768-991px (小屏)
- `md`: 992-1199px (中屏)
- `lg`: 1200-1919px (大屏)
- `xl`: ≥1920px (超大屏)

**容器断点:**
- `xs`: <480px
- `sm`: 480-599px
- `md`: 600-799px
- `lg`: 800-999px
- `xl`: ≥1000px

**主要 API:**

**屏幕响应式:**
- `useScreenResponsiveSpan(spanProp)` - 基于屏幕尺寸

**容器响应式:**
- `useContainerResponsiveSpan(spanProp, containerSelector?)` - 基于容器宽度

**弹窗尺寸响应式:**
- `useModalSizeResponsiveSpan(spanProp, modalSize?)` - 基于 Modal size

**智能响应式:**
- `useResponsiveSpan(spanProp, options?)` - 统一入口,智能选择模式

**返回值:**
- `computedSpan` - 计算后的 span 值(computed)
- `shouldUseCol` - 是否应该使用 el-col 包装(computed)
- `containerWidth` - 容器宽度(readonly, 仅容器模式)
- `currentBreakpoint` - 当前断点(readonly, 仅容器模式)

**Span 类型定义:**

```typescript
type SpanType =
  | undefined // 不使用 el-col 包装
  | number // 固定值
  | 'auto' // 使用预设响应式配置
  | ResponsiveSpan // 自定义响应式配置

interface ResponsiveSpan {
  xs?: number // 手机/超小容器
  sm?: number // 小屏/小容器
  md?: number // 中屏/中等容器
  lg?: number // 大屏/大容器
  xl?: number // 超大屏/超大容器
}
```

**预设配置:**

默认响应式配置:
```typescript
{
  xs: 24, // 手机: 全宽
  sm: 24, // 小屏: 全宽
  md: 12, // 中屏: 一行两个
  lg: 12, // 大屏: 一行两个
  xl: 8   // 超大屏: 一行三个
}
```

小弹窗优化配置:
```typescript
{
  xs: 24, // 手机: 全宽
  sm: 24, // 小屏/小弹窗: 全宽
  md: 24, // 中屏: 全宽
  lg: 12, // 大屏: 一行两个
  xl: 8   // 超大屏: 一行三个
}
```

**使用示例:**

```vue
<template>
  <el-row :gutter="20">
    <!-- 使用固定值 -->
    <el-col :span="12">
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
    </el-col>

    <!-- 使用预设响应式配置 -->
    <el-col v-if="shouldUseCol" :span="computedSpan">
      <el-form-item label="手机号">
        <el-input v-model="form.phone" />
      </el-form-item>
    </el-col>
    <el-form-item v-else label="手机号">
      <el-input v-model="form.phone" />
    </el-form-item>

    <!-- 使用自定义响应式配置 -->
    <el-col v-if="shouldUseCol2" :span="computedSpan2">
      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { useResponsiveSpan } from '@/composables/useResponsiveSpan'

// 方式1: 使用预设配置('auto')
const { computedSpan, shouldUseCol } = useResponsiveSpan('auto')

// 方式2: 使用自定义配置
const { computedSpan: computedSpan2, shouldUseCol: shouldUseCol2 } =
  useResponsiveSpan({
    xs: 24, // 手机全宽
    sm: 12, // 小屏一行两个
    md: 8,  // 中屏一行三个
    lg: 6,  // 大屏一行四个
    xl: 4   // 超大屏一行六个
  })

// 方式3: 指定响应式模式
const { computedSpan: computedSpan3 } = useResponsiveSpan('auto', {
  mode: 'screen' // 强制使用屏幕响应式模式
})

// 方式4: 容器响应式(指定容器选择器)
const { computedSpan: computedSpan4, containerWidth, currentBreakpoint } =
  useResponsiveSpan('auto', {
    mode: 'container',
    containerSelector: '.my-container'
  })
</script>
```

**在 AModal 中使用:**

AModal 组件会自动提供 `modalSize`,无需手动传入:

```vue
<template>
  <a-modal size="small" title="新增用户">
    <a-form-item label="用户名" span="auto">
      <!-- span="auto" 会自动使用小弹窗优化配置 -->
      <el-input v-model="form.username" />
    </a-form-item>
  </a-modal>
</template>
```

---

### 📊 数据处理

#### useDict - 字典数据管理

提供字典数据的获取、缓存和管理功能,支持多字典并行加载。

**核心功能:**
- 多字典并行加载
- 字典数据缓存(避免重复请求)
- 加载状态跟踪
- 错误处理
- 响应式字典数据
- 自动转换为 Element Plus 兼容格式

**字典数据格式:**

```typescript
interface DictItem {
  label: string       // 字典标签
  value: string       // 字典值
  status: number      // 状态(0正常 1停用)
  elTagType?: string  // Element Plus Tag 类型
  elTagClass?: string // CSS 类名
}
```

**主要 API:**
- 参数: 可变参数,传入字典类型代码
- 返回值: 包含字典数据和加载状态的响应式对象

```typescript
const result = useDict('sys_user_sex', 'sys_normal_disable')
// result 包含:
// - sys_user_sex: Ref<DictItem[]>
// - sys_normal_disable: Ref<DictItem[]>
// - dictLoading: Ref<boolean>
```

**使用示例:**

```vue
<template>
  <div v-loading="dictLoading">
    <!-- 单个字典 -->
    <el-select v-model="form.sex" placeholder="请选择性别">
      <el-option
        v-for="item in sys_user_sex"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <!-- 多个字典 -->
    <el-select v-model="form.status" placeholder="请选择状态">
      <el-option
        v-for="item in sys_normal_disable"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <!-- 字典标签显示 -->
    <el-tag
      v-for="item in sys_user_sex"
      :key="item.value"
      :type="item.elTagType"
      :class="item.elTagClass"
    >
      {{ item.label }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { useDict } from '@/composables/useDict'

// 加载多个字典
const { sys_user_sex, sys_normal_disable, dictLoading } = useDict(
  'sys_user_sex',
  'sys_normal_disable'
)

const form = reactive({
  sex: '',
  status: ''
})
</script>
```

**字典值转换示例:**

```typescript
// 根据字典值获取标签
const getLabel = (dictData: DictItem[], value: string) => {
  const dict = dictData.find(item => item.value === value)
  return dict?.label || value
}

// 使用
const sexLabel = getLabel(sys_user_sex.value, '0') // 返回 '男'
```

#### useSelection - 表格选择管理

统一处理表格的单选和多选功能,支持跨页选择和智能同步。

**核心功能:**
- 单选/多选模式切换
- 跨页选择(保留其他页面的选中项)
- 选中状态同步
- 选中项移除
- 选中项清空
- 选中项初始化
- 智能防抖(避免重复触发)

**泛型支持:**

```typescript
useSelection<T extends Record<string, any>>(
  keyField: keyof T,           // 主键字段名
  tableRef: Ref<any>,          // 表格引用
  dataListRef: Ref<T[]>,       // 当前页数据
  multiple?: Ref<boolean>      // 是否多选(默认 true)
)
```

**主要 API:**
- `selectionItems` - 选中项列表(ref)
- `selectionIsRestoring` - 是否正在恢复选中状态(ref)
- `selectionChange(selection)` - 选中项变化回调
- `selectionSync()` - 同步选中状态到表格
- `selectionRemove(removeIds)` - 移除指定项
- `selectionClear()` - 清空选中项
- `selectionInit(initItems?)` - 初始化选中项

**使用示例:**

```vue
<template>
  <div class="app-container">
    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="dataList"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="用户名" prop="userName" />
      <el-table-column label="手机号" prop="phonenumber" />
    </el-table>

    <!-- 分页 -->
    <pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="handlePageChange"
    />

    <!-- 批量操作 -->
    <el-button
      type="danger"
      :disabled="!selectionItems.length"
      @click="handleBatchDelete"
    >
      批量删除({{ selectionItems.length }})
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSelection } from '@/composables/useSelection'

interface User {
  userId: number
  userName: string
  phonenumber: string
}

const tableRef = ref()
const dataList = ref<User[]>([])
const multiple = ref(true)

// 使用 useSelection
const {
  selectionItems,
  selectionChange,
  selectionSync,
  selectionRemove,
  selectionClear
} = useSelection<User>(
  'userId',   // 主键字段
  tableRef,   // 表格引用
  dataList,   // 数据列表
  multiple    // 是否多选
)

// 分页变化时同步选中状态
const handlePageChange = async () => {
  await getList()
  await selectionSync() // 同步选中状态到表格
}

// 批量删除
const handleBatchDelete = async () => {
  const ids = selectionItems.value.map(item => item.userId)
  await deleteUsers(ids)

  // 删除成功后,从选中列表中移除
  selectionRemove(ids)

  // 或者清空所有选中项
  // selectionClear()
}

// 获取数据
const getList = async () => {
  const [err, data] = await getUserList(queryParams)
  if (!err) {
    dataList.value = data.rows
    total.value = data.total
  }
}
</script>
```

**单选模式示例:**

```typescript
// 设置为单选模式
const multiple = ref(false)

const {
  selectionItems,
  selectionChange
} = useSelection<User>('userId', tableRef, dataList, multiple)

// 单选模式下,selectionItems 始终只包含一项(或为空)
watch(selectionItems, (items) => {
  if (items.length > 0) {
    console.log('选中的用户:', items[0])
  }
})
```

#### useDownload - 文件下载

提供文件下载功能,支持 Excel 导出、OSS 下载、ZIP 下载等多种场景。

**核心功能:**
- Excel 文件导出(支持本页/全部)
- OSS 文件下载(基于 OSS ID)
- ZIP 压缩包下载(批量文件)
- 下载进度跟踪
- Blob 数据处理
- 错误处理和提示
- 文件名自动添加时间戳

**主要 API:**
- `downloading` - 是否正在下载(ref)
- `download(title, url, params?)` - 通用下载方法
- `exportExcel(title, url, params)` - Excel 导出(带确认框)
- `downloadOss(ossId)` - OSS 文件下载
- `downloadZip(title, url, data)` - ZIP 压缩包下载

**使用示例:**

**Excel 导出:**

```vue
<template>
  <el-button
    type="warning"
    :loading="downloading"
    @click="handleExport"
  >
    导出
  </el-button>
</template>

<script setup lang="ts">
import { useDownload } from '@/composables/useDownload'

const { downloading, exportExcel } = useDownload()

// 导出 Excel(带确认框:导出本页/导出全部)
const handleExport = async () => {
  const [err] = await exportExcel(
    '用户数据',
    '/system/user/export',
    queryParams
  )

  if (!err) {
    console.log('导出成功')
  }
}
</script>
```

**OSS 文件下载:**

```typescript
import { useDownload } from '@/composables/useDownload'

const { downloadOss } = useDownload()

// 下载 OSS 文件
const handleDownloadOss = async (ossId: string) => {
  const [err] = await downloadOss(ossId)
  if (!err) {
    console.log('下载成功')
  }
}
```

**ZIP 压缩包下载:**

```typescript
import { useDownload } from '@/composables/useDownload'

const { downloadZip } = useDownload()

// 下载 ZIP 压缩包
const handleDownloadZip = async () => {
  const fileIds = ['1', '2', '3']
  const [err] = await downloadZip(
    '批量文件',
    '/system/file/downloadZip',
    fileIds
  )
  if (!err) {
    console.log('下载成功')
  }
}
```

**自定义下载:**

```typescript
import { useDownload } from '@/composables/useDownload'

const { download } = useDownload()

// 自定义下载
const handleCustomDownload = async () => {
  const [err] = await download(
    '自定义文件名.pdf',
    '/api/custom/download',
    { id: 123 }
  )
  if (!err) {
    console.log('下载成功')
  }
}
```

**Excel 导出说明:**

`exportExcel` 方法会弹出确认框,让用户选择:
- **导出全部**: 导出所有数据(设置 pageSize 为最大值)
- **导出本页**: 仅导出当前页数据

文件名格式: `{title}-第{pageNum}页_{时间戳}.xlsx` 或 `{title}-全部_{时间戳}.xlsx`

---

### 🌐 网络通信

#### useHttp - HTTP 请求服务

基于 Axios 的 HTTP 请求封装,提供完整的请求拦截、响应处理和错误处理机制。

**核心功能:**
- 请求方法封装(GET、POST、PUT、DELETE、自定义)
- 请求/响应拦截器
- 自动添加认证 Token
- 自动添加租户 ID
- 请求数据加密(AES + RSA)
- 响应数据解密
- 防重复提交
- 国际化支持(Content-Language 头)
- 统一错误处理
- 链式配置(noAuth、encrypt、noTenant 等)
- TypeScript 泛型支持
- Result 返回格式(`[error, data]`)

**主要 API:**

**请求方法:**
- `get<T>(url, params?, config?)` - GET 请求
- `post<T>(url, data?, config?)` - POST 请求
- `put<T>(url, data?, config?)` - PUT 请求
- `del<T>(url, params?, config?)` - DELETE 请求
- `request<T>(config)` - 自定义请求

**链式配置:**
- `config(cfg)` - 通用配置
- `noAuth()` - 禁用认证
- `encrypt()` - 启用加密
- `noRepeatSubmit()` - 禁用防重复提交
- `noTenant()` - 禁用租户信息
- `noMsgError()` - 禁用错误提示
- `timeout(ms)` - 设置超时时间

**返回值类型:**

所有请求方法返回 `Result<T>` 类型:
```typescript
type Result<T> = Promise<[Error | null, T | null]>
```

成功时: `[null, data]`
失败时: `[error, null]`

**使用示例:**

**基础请求:**

```typescript
import { http } from '@/composables/useHttp'

// GET 请求
const [err, users] = await http.get<User[]>('/api/users', { status: '0' })
if (!err) {
  console.log(users)
}

// POST 请求
const [err, user] = await http.post<User>('/api/users', {
  userName: 'zhangsan',
  phonenumber: '13800138000'
})
if (!err) {
  console.log('创建成功', user)
}

// PUT 请求
const [err, user] = await http.put<User>('/api/users/123', {
  userName: 'lisi'
})

// DELETE 请求
const [err] = await http.del<void>('/api/users/123')
if (!err) {
  console.log('删除成功')
}
```

**链式配置:**

```typescript
// 禁用认证
const [err, data] = await http.noAuth().get('/api/public/config')

// 启用加密
const [err, data] = await http.encrypt().post('/api/sensitive', sensitiveData)

// 禁用防重复提交
const [err, data] = await http.noRepeatSubmit().post('/api/submit', formData)

// 禁用租户信息
const [err, data] = await http.noTenant().get('/api/global/data')

// 禁用错误提示(业务层自定义错误处理)
const [err, data] = await http.noMsgError().post('/api/custom', params)

// 设置超时时间
const [err, data] = await http.timeout(30000).get('/api/long-request')

// 组合多个配置
const [err, data] = await http
  .noAuth()
  .noTenant()
  .timeout(10000)
  .get('/api/public/long-request')
```

**自定义配置:**

```typescript
// 创建自定义 HTTP 实例
const customHttp = useHttp({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  headers: {
    'X-Custom-Header': 'value'
  }
})

// 使用自定义实例
const [err, data] = await customHttp.get('/endpoint')
```

**错误处理:**

```typescript
const [err, users] = await http.get<User[]>('/api/users')

if (err) {
  // 错误处理
  console.error('请求失败:', err.message)
  // 或显示提示
  ElMessage.error(err.message)
  return
}

// 成功处理
console.log('用户列表:', users)
```

**TypeScript 类型支持:**

```typescript
interface User {
  userId: number
  userName: string
  phonenumber: string
}

interface PageResult<T> {
  rows: T[]
  total: number
}

// GET 请求返回用户列表
const [err, result] = await http.get<PageResult<User>>('/api/users')
if (!err) {
  console.log(result.rows) // User[]
  console.log(result.total) // number
}

// POST 请求返回单个用户
const [err, user] = await http.post<User>('/api/users', userData)
if (!err) {
  console.log(user.userId) // number
  console.log(user.userName) // string
}
```

**拦截器功能:**

请求拦截器自动处理:
- 添加 `Content-Language` 头(国际化)
- 添加 `X-Request-Id` 头(请求链路追踪)
- 添加 `Authorization` 头(Token 认证)
- 添加 `X-Tenant-Id` 头(多租户)
- GET 请求参数转查询字符串
- 防重复提交检查(5 秒内相同数据)
- AES 加密(可选)

响应拦截器自动处理:
- AES 解密(可选)
- Blob 数据包装
- 状态码处理(200/401/500/601)
- 错误提示
- Token 过期重新登录

#### useSSE - 服务器推送事件

提供 Server-Sent Events (SSE) 实时消息推送功能,支持自动重连和动态退避策略。

**核心功能:**
- SSE 连接建立和管理
- 实时消息接收
- 自动重连(动态退避策略)
- 连接状态跟踪
- 错误处理
- 手动关闭连接
- 支持自定义事件类型

**主要 API:**
- `connect(url, eventType?, onMessage, onError?)` - 建立 SSE 连接
- `close()` - 关闭 SSE 连接
- `isConnected` - 是否已连接(ref)
- `reconnectAttempts` - 重连次数(ref)

**使用示例:**

```vue
<template>
  <div class="sse-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>实时消息推送</span>
          <el-tag :type="isConnected ? 'success' : 'danger'">
            {{ isConnected ? '已连接' : '未连接' }}
          </el-tag>
        </div>
      </template>

      <div v-for="(msg, index) in messages" :key="index" class="message">
        <el-text>{{ msg }}</el-text>
      </div>

      <template #footer>
        <el-button v-if="!isConnected" type="primary" @click="handleConnect">
          连接
        </el-button>
        <el-button v-else type="danger" @click="handleClose">
          断开
        </el-button>
        <el-text type="info">重连次数: {{ reconnectAttempts }}</el-text>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSSE } from '@/composables/useSSE'

const messages = ref<string[]>([])

const {
  connect,
  close,
  isConnected,
  reconnectAttempts
} = useSSE()

// 连接 SSE
const handleConnect = () => {
  connect(
    '/api/sse/messages',
    'message', // 事件类型(可选,默认 'message')
    (data) => {
      // 接收到消息
      messages.value.unshift(data)
      // 保留最近 50 条
      if (messages.value.length > 50) {
        messages.value.pop()
      }
    },
    (error) => {
      // 错误处理(可选)
      console.error('SSE 错误:', error)
    }
  )
}

// 关闭连接
const handleClose = () => {
  close()
}

// 组件卸载时关闭连接
onBeforeUnmount(() => {
  close()
})
</script>
```

**自动重连说明:**

连接断开时会自动尝试重连,重连间隔采用动态退避策略:
- 第 1 次: 1 秒后重连
- 第 2 次: 2 秒后重连
- 第 3 次: 4 秒后重连
- 第 4 次: 8 秒后重连
- 第 5 次及以后: 16 秒后重连(最大间隔)

#### useWS - WebSocket 通信

提供 WebSocket 双向通信功能,支持自动重连、心跳检测和消息管理。

**核心功能:**
- WebSocket 连接建立和管理
- 自动重连(指数退避策略)
- 心跳检测(保持连接活跃)
- 消息发送和接收
- 连接状态跟踪
- 错误处理
- 手动关闭连接
- 消息队列管理

**主要 API:**
- `connect(url, onMessage, onError?)` - 建立 WebSocket 连接
- `send(data)` - 发送消息
- `close()` - 关闭 WebSocket 连接
- `isConnected` - 是否已连接(ref)
- `reconnectAttempts` - 重连次数(ref)

**使用示例:**

```vue
<template>
  <div class="ws-demo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>WebSocket 通信</span>
          <el-tag :type="isConnected ? 'success' : 'danger'">
            {{ isConnected ? '已连接' : '未连接' }}
          </el-tag>
        </div>
      </template>

      <div class="messages">
        <div v-for="(msg, index) in messages" :key="index" class="message">
          <el-tag :type="msg.type === 'send' ? 'primary' : 'success'">
            {{ msg.type === 'send' ? '发送' : '接收' }}
          </el-tag>
          <el-text>{{ msg.content }}</el-text>
        </div>
      </div>

      <template #footer>
        <el-input
          v-model="inputMessage"
          placeholder="输入消息"
          @keyup.enter="handleSend"
        >
          <template #append>
            <el-button type="primary" @click="handleSend">发送</el-button>
          </template>
        </el-input>

        <div class="actions">
          <el-button v-if="!isConnected" type="primary" @click="handleConnect">
            连接
          </el-button>
          <el-button v-else type="danger" @click="handleClose">
            断开
          </el-button>
          <el-text type="info">重连次数: {{ reconnectAttempts }}</el-text>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWS } from '@/composables/useWS'

interface Message {
  type: 'send' | 'receive'
  content: string
}

const messages = ref<Message[]>([])
const inputMessage = ref('')

const {
  connect,
  send,
  close,
  isConnected,
  reconnectAttempts
} = useWS()

// 连接 WebSocket
const handleConnect = () => {
  connect(
    'ws://localhost:8080/ws/chat',
    (data) => {
      // 接收到消息
      messages.value.push({
        type: 'receive',
        content: data
      })
    },
    (error) => {
      // 错误处理(可选)
      console.error('WebSocket 错误:', error)
    }
  )
}

// 发送消息
const handleSend = () => {
  if (!inputMessage.value.trim()) return

  send(inputMessage.value)

  messages.value.push({
    type: 'send',
    content: inputMessage.value
  })

  inputMessage.value = ''
}

// 关闭连接
const handleClose = () => {
  close()
}

// 组件卸载时关闭连接
onBeforeUnmount(() => {
  close()
})
</script>
```

**心跳检测说明:**

建立连接后会自动启动心跳检测,每 30 秒发送一次 `ping` 消息,保持连接活跃。服务端应响应 `pong` 消息。

**自动重连说明:**

连接断开时会自动尝试重连,重连间隔采用指数退避策略:
- 第 1 次: 1 秒后重连
- 第 2 次: 2 秒后重连
- 第 3 次: 4 秒后重连
- 第 4 次: 8 秒后重连
- 第 5 次及以后: 16 秒后重连(最大间隔)

---

### 🌍 国际化

#### useI18n - 增强的国际化

扩展 Vue I18n 的原生 `useI18n` 钩子,提供更多实用功能,与应用状态管理集成。

**核心功能:**
- 增强的翻译函数(支持多语言字段国际化)
- 路由标题翻译
- 语言切换和管理
- 当前语言状态
- 语言环境检查(中文/英文)
- 初始化语言设置
- Vue I18n 原生功能继承

**主要 API:**

**翻译功能:**
- `t(key, fieldInfoOrValue?)` - 增强的翻译函数
- `translateRouteTitle(title)` - 翻译路由标题

**语言管理:**
- `currentLanguage` - 当前语言(响应式)
- `currentLanguageName` - 当前语言显示名称(computed)
- `languages` - 可用语言列表(computed)
- `setLanguage(lang)` - 设置应用语言
- `initLanguage()` - 初始化语言设置

**语言状态:**
- `isChinese` - 是否为中文环境(computed)
- `isEnglish` - 是否为英文环境(computed)

**Vue I18n 原生:**
- `locale` - 当前语言(响应式)
- `availableLocales` - 可用语言列表
- `fallbackLocale` - 备用语言
- `messages` - 所有语言消息
- `d` - 日期格式化
- `n` - 数字格式化
- `rt` - 运行时翻译
- `te` - 检查翻译键是否存在
- `tm` - 翻译消息函数

**增强的翻译函数用法:**

```typescript
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const { t } = useI18n()

// 1. 传统的 i18n 键翻译
t('user.userName') // 根据 i18n 配置翻译

// 2. 简单用法(键 + 中文翻译)
t('userId', '用户ID')
// 中文环境: '用户ID'
// 英文环境: 'userId'

// 3. 只使用字段名(field)
t('', { field: 'UserName' })
// 中文环境: 'UserName'
// 英文环境: 'UserName'

// 4. 只使用备注(comment)
t('', { comment: '用户名' })
// 中文环境: '用户名'
// 英文环境: '用户名'

// 5. 同时使用字段名和备注
t('', { field: 'UserName', comment: '用户名' })
// 中文环境: '用户名'
// 英文环境: 'UserName'

// 6. 使用语言映射(最精确)
t('', {
  [LanguageCode.zh_CN]: '用户名',
  [LanguageCode.en_US]: 'User Name'
})
// 中文环境: '用户名'
// 英文环境: 'User Name'

// 7. 混合使用(提供降级策略)
t('', {
  field: 'UserName',
  comment: '用户名(默认)',
  [LanguageCode.zh_CN]: '用户名(中文)',
  [LanguageCode.en_US]: 'User Name (English)'
})
// 优先使用语言映射,其次 field/comment
```

**使用示例:**

```vue
<template>
  <div>
    <!-- 语言切换器 -->
    <el-dropdown @command="handleLanguageChange">
      <span class="el-dropdown-link">
        {{ currentLanguageName }}
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh_CN">简体中文</el-dropdown-item>
          <el-dropdown-item command="en_US">English</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 表单 -->
    <el-form>
      <!-- 使用增强的翻译函数 -->
      <el-form-item :label="t('', { field: 'UserName', comment: '用户名' })">
        <el-input v-model="form.userName" />
      </el-form-item>

      <el-form-item :label="t('user.phone', '手机号')">
        <el-input v-model="form.phone" />
      </el-form-item>

      <!-- 使用传统 i18n 键 -->
      <el-form-item :label="t('user.email')">
        <el-input v-model="form.email" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { LanguageCode } from '@/systemConfig'

const {
  t,
  currentLanguage,
  currentLanguageName,
  isChinese,
  isEnglish,
  setLanguage
} = useI18n()

const form = reactive({
  userName: '',
  phone: '',
  email: ''
})

// 切换语言
const handleLanguageChange = (lang: LanguageCode) => {
  setLanguage(lang)
}

// 根据语言环境执行不同逻辑
if (isChinese.value) {
  console.log('当前是中文环境')
} else if (isEnglish.value) {
  console.log('当前是英文环境')
}
</script>
```

**路由标题翻译:**

```typescript
import { translateRouteTitle } from '@/composables/useI18n'

// 翻译路由标题
const title = translateRouteTitle('dashboard')
// 如果 i18n 中配置了 'route.dashboard',则返回翻译值
// 否则返回原始值 'dashboard'
```

---

## 🚀 使用特点

### 响应式设计

所有组合式函数都采用 Vue 3 的响应式 API,提供实时的状态更新和自动的依赖追踪。使用 `ref`、`reactive`、`computed` 等 API 确保数据变化能够自动触发 UI 更新。

### 类型安全

完整的 TypeScript 支持,所有函数都提供类型定义和泛型支持,在开发时提供类型提示和编译时错误检查,确保代码质量。

### 统一接口

遵循一致的 API 设计模式:
- 所有函数以 `use` 开头
- 使用对象解构提供 API
- 统一的错误处理格式(`[error, data]`)
- 统一的配置选项模式

### 错误处理

内置完善的错误处理机制:
- 网络请求统一使用 `[error, data]` 返回格式
- 提供友好的错误提示(基于 Element Plus Message)
- 实现优雅降级策略
- 错误日志记录

### 性能优化

采用多种性能优化技术:
- **防抖**: `useTableHeight` 的高度计算
- **缓存**: `useDict` 的字典数据缓存
- **懒加载**: 路由和组件的懒加载
- **并行请求**: `useDict` 的并行加载
- **智能重连**: `useSSE` 和 `useWS` 的动态退避策略

### 自动导入

项目配置了 `unplugin-auto-import`,所有组合式函数无需手动导入,可直接使用:

```typescript
// 无需导入
const { download, downloading } = useDownload()
const { isLoggedIn, hasPermission } = useAuth()
const layout = useLayout()
```

---

## 💡 最佳实践

### 命名规范

- 所有组合式函数以 `use` 开头
- 使用清晰、描述性的函数名
- 返回对象使用解构的形式提供 API
- 响应式变量命名清晰明了

```typescript
// ✅ 推荐
const { downloading, download, exportExcel } = useDownload()
const { isLoggedIn, hasPermission } = useAuth()

// ❌ 不推荐
const dl = useDownload()
const auth = useAuth()
```

### 状态管理

- 使用 `ref` 创建基本类型的响应式状态
- 使用 `reactive` 创建对象类型的响应式状态
- 合理使用 `computed` 进行派生状态计算
- 及时清理副作用,避免内存泄漏

```typescript
export const useExample = () => {
  // 基本类型使用 ref
  const count = ref(0)
  const isLoading = ref(false)

  // 对象类型使用 reactive
  const state = reactive({
    data: [],
    error: null
  })

  // 派生状态使用 computed
  const hasData = computed(() => state.data.length > 0)

  // 清理副作用
  onBeforeUnmount(() => {
    // 清理定时器、事件监听器等
  })

  return {
    count,
    isLoading,
    state: readonly(state), // 返回只读状态
    hasData
  }
}
```

### 错误处理

- 统一使用 `[error, data]` 的返回格式
- 提供有意义的错误消息
- 实现优雅降级策略
- 合理使用 try-catch

```typescript
// ✅ 推荐
const [err, users] = await http.get<User[]>('/api/users')
if (err) {
  console.error('获取用户列表失败:', err.message)
  ElMessage.error('获取用户列表失败,请稍后重试')
  return
}
console.log('用户列表:', users)

// ❌ 不推荐
try {
  const users = await getUserList()
  console.log(users)
} catch (error) {
  console.error(error)
}
```

### 组合使用

多个组合式函数可以组合使用,实现复杂功能:

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useDownload } from '@/composables/useDownload'
import { useTableHeight } from '@/composables/useTableHeight'
import { useDict } from '@/composables/useDict'

// 权限检查
const { hasPermission } = useAuth()

// 文件下载
const { downloading, exportExcel } = useDownload()

// 表格高度
const { tableHeight, queryFormRef, showSearch } = useTableHeight()

// 字典数据
const { sys_user_sex, sys_normal_disable } = useDict(
  'sys_user_sex',
  'sys_normal_disable'
)

// 组合使用
const handleExport = async () => {
  // 检查权限
  if (!hasPermission('system:user:export')) {
    ElMessage.warning('您没有导出权限')
    return
  }

  // 执行导出
  const [err] = await exportExcel('用户数据', '/system/user/export', queryParams)
  if (!err) {
    ElMessage.success('导出成功')
  }
}
</script>
```

---

## 📖 快速开始

在组件中使用组合式函数:

```vue
<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form
      ref="queryFormRef"
      v-show="showSearch"
      :model="queryParams"
      inline
    >
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态">
          <el-option
            v-for="item in sys_normal_disable"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row class="mb8">
      <el-button
        v-hasPermi="['system:user:add']"
        type="primary"
        @click="handleAdd"
      >
        新增
      </el-button>
      <el-button
        v-hasPermi="['system:user:export']"
        type="warning"
        :loading="downloading"
        @click="handleExport"
      >
        导出
      </el-button>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="userList"
      :height="tableHeight"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="用户名称" prop="userName" />
      <el-table-column label="手机号码" prop="phonenumber" />
      <el-table-column label="状态" prop="status">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ getLabel(sys_normal_disable, row.status) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useDownload } from '@/composables/useDownload'
import { useTableHeight } from '@/composables/useTableHeight'
import { useDict } from '@/composables/useDict'
import { useSelection } from '@/composables/useSelection'
import { http } from '@/composables/useHttp'

interface User {
  userId: number
  userName: string
  phonenumber: string
  status: string
}

// 权限检查
const { hasPermission } = useAuth()

// 文件下载
const { downloading, exportExcel } = useDownload()

// 表格高度
const { tableHeight, queryFormRef, showSearch } = useTableHeight()

// 字典数据
const { sys_normal_disable, dictLoading } = useDict('sys_normal_disable')

// 表格选择
const tableRef = ref()
const userList = ref<User[]>([])
const { selectionItems, selectionChange, selectionSync } = useSelection<User>(
  'userId',
  tableRef,
  userList
)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  status: ''
})

const total = ref(0)

// 获取用户列表
const getList = async () => {
  const [err, data] = await http.get<{ rows: User[]; total: number }>(
    '/system/user/list',
    queryParams
  )
  if (!err) {
    userList.value = data.rows
    total.value = data.total
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.userName = ''
  queryParams.status = ''
  handleQuery()
}

// 分页变化
const handlePageChange = async () => {
  await getList()
  await selectionSync() // 同步选中状态
}

// 新增
const handleAdd = () => {
  // 新增逻辑
}

// 导出
const handleExport = async () => {
  if (!hasPermission('system:user:export')) {
    ElMessage.warning('您没有导出权限')
    return
  }

  const [err] = await exportExcel('用户数据', '/system/user/export', queryParams)
  if (!err) {
    ElMessage.success('导出成功')
  }
}

// 获取字典标签
const getLabel = (dictData: any[], value: string) => {
  const dict = dictData.find(item => item.value === value)
  return dict?.label || value
}

// 初始化
onMounted(() => {
  getList()
})
</script>
```

这个示例展示了多个组合式函数的综合应用,包括权限检查、文件下载、表格高度自适应、字典数据管理、表格选择管理和 HTTP 请求等。

每个组合式函数都有详细的独立文档,请查看相应的章节了解具体用法和 API 详情。
