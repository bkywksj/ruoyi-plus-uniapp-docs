# Enums 枚举类型

## 介绍

枚举类型是 RuoYi-Plus-UniApp 前端项目中用于定义一组命名常量的重要机制。通过使用 TypeScript 的枚举特性，项目实现了类型安全的常量管理，避免了魔法字符串和数字的使用，提高了代码的可读性和可维护性。

**核心特性:**

- **类型安全** - 编译时检查，避免使用无效值
- **语义明确** - 使用有意义的名称代替魔法值
- **集中管理** - 相关常量统一定义和维护
- **自动补全** - IDE 提供完整的智能提示
- **反向映射** - 支持从值获取键名（数字枚举）
- **可扩展性** - 便于添加新的枚举值

项目中的枚举主要分为以下几类：系统配置枚举、字典类型枚举、菜单相关枚举、WebSocket 消息类型枚举等。这些枚举涵盖了前端开发中的各种业务场景，为整个应用提供了统一的常量定义标准。

## 系统配置枚举

### LanguageCode 语言代码

系统支持的多语言枚举，用于国际化配置和语言切换。

```typescript
/**
 * 系统支持的语言枚举
 */
export enum LanguageCode {
  /**
   * 中文(简体)
   */
  zh_CN = 'zh_CN',

  /**
   * 英文(美国)
   */
  en_US = 'en_US'
}
```

**使用场景:**

- 用户语言偏好设置
- 国际化资源加载
- 系统语言切换
- 多语言内容显示

**基本用法:**

```vue
<template>
  <div class="language-selector">
    <el-select v-model="selectedLanguage" @change="handleLanguageChange">
      <el-option :value="LanguageCode.zh_CN" label="简体中文" />
      <el-option :value="LanguageCode.en_US" label="English" />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LanguageCode } from '@/systemConfig'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const selectedLanguage = ref<LanguageCode>(LanguageCode.zh_CN)

const handleLanguageChange = (lang: LanguageCode) => {
  locale.value = lang
  // 保存到用户配置
  localStorage.setItem('language', lang)
}

// 初始化加载用户语言偏好
onMounted(() => {
  const savedLang = localStorage.getItem('language') as LanguageCode
  if (savedLang) {
    selectedLanguage.value = savedLang
    locale.value = savedLang
  }
})
</script>
```

**类型定义:**

```typescript
// 在 SystemConfig 中使用
interface LayoutSetting {
  /** 语言设置 */
  language: LanguageCode
}
```

**扩展说明:**

如果需要添加新的语言支持，只需在枚举中添加对应的语言代码：

```typescript
export enum LanguageCode {
  zh_CN = 'zh_CN',
  en_US = 'en_US',
  // 添加新语言
  ja_JP = 'ja_JP', // 日语
  ko_KR = 'ko_KR', // 韩语
  fr_FR = 'fr_FR'  // 法语
}
```

### SideTheme 侧边栏主题

侧边栏主题枚举，用于控制侧边栏的颜色主题。

```typescript
/** 侧边栏主题枚举 */
export enum SideTheme {
  /** 深色主题 */
  Dark = 'theme-dark',
  /** 浅色主题 */
  Light = 'theme-light'
}
```

**使用场景:**

- 侧边栏主题切换
- 主题样式应用
- 用户偏好设置
- 主题预览功能

**基本用法:**

```vue
<template>
  <div :class="['sidebar', currentTheme]">
    <div class="theme-switcher">
      <el-switch
        v-model="isDark"
        @change="handleThemeChange"
        active-text="深色"
        inactive-text="浅色"
      />
    </div>
    <!-- 侧边栏内容 -->
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { SideTheme } from '@/systemConfig'

const isDark = ref(true)
const currentTheme = computed(() =>
  isDark.value ? SideTheme.Dark : SideTheme.Light
)

const handleThemeChange = (value: boolean) => {
  const theme = value ? SideTheme.Dark : SideTheme.Light
  // 保存主题设置
  localStorage.setItem('sideTheme', theme)
  // 应用主题
  document.documentElement.setAttribute('data-side-theme', theme)
}
</script>

<style lang="scss" scoped>
.sidebar {
  &.theme-dark {
    background: #1f1f1f;
    color: #ffffff;
  }

  &.theme-light {
    background: #ffffff;
    color: #333333;
  }
}
</style>
```

**与布局配置集成:**

```typescript
import { SideTheme } from '@/systemConfig'

// 布局设置接口
interface LayoutSetting {
  /** 侧边栏主题 */
  sideTheme: SideTheme
}

// 应用主题
const applySideTheme = (theme: SideTheme) => {
  const sidebarElement = document.querySelector('.sidebar')
  if (sidebarElement) {
    sidebarElement.className = `sidebar ${theme}`
  }
}
```

### MenuLayoutMode 菜单布局模式

菜单布局模式枚举，定义了系统支持的菜单布局方式。

```typescript
/** 菜单布局模式枚举 */
export enum MenuLayoutMode {
  /** 垂直布局（左侧边栏） */
  Vertical = 'vertical',
  /** 混合布局（顶部+左侧） */
  Mixed = 'mixed',
  /** 水平布局（纯顶部） */
  Horizontal = 'horizontal'
}
```

**使用场景:**

- 菜单布局切换
- 响应式布局适配
- 用户界面定制
- 主题配置

**基本用法:**

```vue
<template>
  <div :class="['app-layout', `layout-${layoutMode}`]">
    <!-- 垂直布局 -->
    <template v-if="layoutMode === MenuLayoutMode.Vertical">
      <aside class="sidebar">
        <!-- 侧边栏菜单 -->
      </aside>
      <main class="main-content">
        <!-- 主内容区 -->
      </main>
    </template>

    <!-- 混合布局 -->
    <template v-else-if="layoutMode === MenuLayoutMode.Mixed">
      <header class="top-menu">
        <!-- 顶部菜单 -->
      </header>
      <div class="content-wrapper">
        <aside class="sidebar">
          <!-- 侧边栏子菜单 -->
        </aside>
        <main class="main-content">
          <!-- 主内容区 -->
        </main>
      </div>
    </template>

    <!-- 水平布局 -->
    <template v-else>
      <header class="horizontal-menu">
        <!-- 水平菜单 -->
      </header>
      <main class="main-content">
        <!-- 主内容区 -->
      </main>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { MenuLayoutMode } from '@/systemConfig'

const layoutMode = ref<MenuLayoutMode>(MenuLayoutMode.Vertical)

const switchLayout = (mode: MenuLayoutMode) => {
  layoutMode.value = mode
  // 保存布局偏好
  localStorage.setItem('menuLayout', mode)
}
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;

  &.layout-vertical {
    display: flex;

    .sidebar {
      width: 200px;
      background: #1f1f1f;
    }

    .main-content {
      flex: 1;
    }
  }

  &.layout-mixed {
    display: flex;
    flex-direction: column;

    .top-menu {
      height: 60px;
      background: #409eff;
    }

    .content-wrapper {
      display: flex;
      flex: 1;

      .sidebar {
        width: 200px;
      }
    }
  }

  &.layout-horizontal {
    display: flex;
    flex-direction: column;

    .horizontal-menu {
      height: 60px;
      background: #409eff;
    }
  }
}
</style>
```

**布局模式选择器:**

```vue
<template>
  <div class="layout-selector">
    <el-radio-group v-model="layoutMode" @change="handleLayoutChange">
      <el-radio :label="MenuLayoutMode.Vertical">
        <i class="icon-vertical"></i>
        <span>垂直布局</span>
      </el-radio>
      <el-radio :label="MenuLayoutMode.Mixed">
        <i class="icon-mixed"></i>
        <span>混合布局</span>
      </el-radio>
      <el-radio :label="MenuLayoutMode.Horizontal">
        <i class="icon-horizontal"></i>
        <span>水平布局</span>
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { MenuLayoutMode } from '@/systemConfig'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()
const layoutMode = ref<MenuLayoutMode>(MenuLayoutMode.Vertical)

const handleLayoutChange = (mode: MenuLayoutMode) => {
  layoutStore.setMenuLayout(mode)
}
</script>
```

## 字典类型枚举

### DictTypes 字典类型

系统字典类型枚举，定义了所有业务字典的类型标识。

```typescript
/**
 * 字典类型枚举
 */
export enum DictTypes {
  /** 审核状态 */
  sys_audit_status = 'sys_audit_status',
  /** 逻辑标志 */
  sys_boolean_flag = 'sys_boolean_flag',
  /** 显示设置 */
  sys_display_setting = 'sys_display_setting',
  /** 启用状态 */
  sys_enable_status = 'sys_enable_status',
  /** 文件类型 */
  sys_file_type = 'sys_file_type',
  /** 消息类型 */
  sys_message_type = 'sys_message_type',
  /** 通知状态 */
  sys_notice_status = 'sys_notice_status',
  /** 通知类型 */
  sys_notice_type = 'sys_notice_type',
  /** 操作结果 */
  sys_oper_result = 'sys_oper_result',
  /** 业务操作类型 */
  sys_oper_type = 'sys_oper_type',
  /** 支付方式 */
  sys_payment_method = 'sys_payment_method',
  /** 订单状态 */
  sys_order_status = 'sys_order_status',
  /** 平台类型 */
  sys_platform_type = 'sys_platform_type',
  /** 用户性别 */
  sys_user_gender = 'sys_user_gender',
  /** 数据权限类型 */
  sys_data_scope = 'sys_data_scope'
}
```

**使用场景:**

- 下拉选择器选项
- 状态标签显示
- 表单验证
- 数据过滤
- 报表统计

**基本用法 - 下拉选择器:**

```vue
<template>
  <div class="user-form">
    <el-form :model="form" label-width="100px">
      <!-- 性别选择 -->
      <el-form-item label="性别">
        <el-select v-model="form.gender" :loading="dictLoading">
          <el-option
            v-for="dict in sys_user_gender"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <!-- 启用状态 -->
      <el-form-item label="状态">
        <el-select v-model="form.status" :loading="dictLoading">
          <el-option
            v-for="dict in sys_enable_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

// 获取字典数据
const { sys_user_gender, sys_enable_status, dictLoading } = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status
)

const form = reactive({
  gender: '',
  status: ''
})
</script>
```

**基本用法 - 状态标签:**

```vue
<template>
  <div class="order-list">
    <el-table :data="orders">
      <el-table-column label="订单号" prop="orderNo" />

      <!-- 订单状态标签 -->
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 支付方式 -->
      <el-table-column label="支付方式">
        <template #default="{ row }">
          {{ getPaymentLabel(row.paymentMethod) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDict, DictTypes } from '@/composables/useDict'

// 获取字典
const { sys_order_status, sys_payment_method } = useDict(
  DictTypes.sys_order_status,
  DictTypes.sys_payment_method
)

const orders = ref([
  { orderNo: '2024001', status: '1', paymentMethod: 'wechat' },
  { orderNo: '2024002', status: '2', paymentMethod: 'alipay' }
])

const getStatusLabel = (status: string) => {
  return sys_order_status.value.find(d => d.value === status)?.label || status
}

const getStatusTagType = (status: string) => {
  const dict = sys_order_status.value.find(d => d.value === status)
  return dict?.elTagType || 'info'
}

const getPaymentLabel = (method: string) => {
  return sys_payment_method.value.find(d => d.value === method)?.label || method
}
</script>
```

**批量获取字典:**

```typescript
import { useDict, DictTypes } from '@/composables/useDict'

// 批量获取多个字典
const {
  sys_user_gender,
  sys_enable_status,
  sys_notice_type,
  sys_message_type,
  dictLoading
} = useDict(
  DictTypes.sys_user_gender,
  DictTypes.sys_enable_status,
  DictTypes.sys_notice_type,
  DictTypes.sys_message_type
)

// 等待字典加载完成
watch(dictLoading, (loading) => {
  if (!loading) {
    console.log('所有字典加载完成')
    // 执行需要字典数据的操作
  }
})
```

**字典数据格式:**

```typescript
interface DictItem {
  /** 显示标签文本 */
  label: string
  /** 实际存储的值 */
  value: string
  /** 状态标识 */
  status?: string
  /** Element UI Tag 组件的类型 */
  elTagType?: ElTagType
  /** Element UI Tag 组件的自定义类名 */
  elTagClass?: string
}
```

**添加新字典类型:**

```typescript
export enum DictTypes {
  // 现有字典...

  // 添加新的字典类型
  /** 会员等级 */
  sys_member_level = 'sys_member_level',
  /** 优惠券类型 */
  sys_coupon_type = 'sys_coupon_type',
  /** 物流状态 */
  sys_logistics_status = 'sys_logistics_status'
}
```

## 菜单相关枚举

### MenuType 菜单类型

菜单权限类型枚举，用于区分不同类型的菜单项。

```typescript
/** 菜单类型枚举 */
export enum MenuType {
  /** 目录 */
  M = 'M',
  /** 菜单 */
  C = 'C',
  /** 按钮 */
  F = 'F'
}
```

**使用场景:**

- 菜单权限管理
- 路由配置
- 权限控制
- 菜单树渲染

**基本用法:**

```vue
<template>
  <div class="menu-form">
    <el-form :model="menuForm" label-width="100px">
      <el-form-item label="菜单类型" required>
        <el-radio-group v-model="menuForm.menuType">
          <el-radio :label="MenuType.M">
            <i class="icon-folder"></i> 目录
          </el-radio>
          <el-radio :label="MenuType.C">
            <i class="icon-file"></i> 菜单
          </el-radio>
          <el-radio :label="MenuType.F">
            <i class="icon-button"></i> 按钮
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 根据菜单类型显示不同字段 -->
      <el-form-item v-if="menuForm.menuType === MenuType.C" label="组件路径">
        <el-input v-model="menuForm.component" placeholder="如: system/user/index" />
      </el-form-item>

      <el-form-item v-if="menuForm.menuType === MenuType.F" label="权限标识">
        <el-input v-model="menuForm.perms" placeholder="如: system:user:add" />
      </el-form-item>

      <el-form-item v-if="menuForm.menuType !== MenuType.F" label="路由地址">
        <el-input v-model="menuForm.path" placeholder="如: /system/user" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { MenuType } from '@/api/system/core/menu/menuTypes'

const menuForm = reactive({
  menuType: MenuType.M,
  menuName: '',
  path: '',
  component: '',
  perms: ''
})

// 监听菜单类型变化，重置相关字段
watch(() => menuForm.menuType, (newType) => {
  if (newType === MenuType.M) {
    // 目录不需要组件路径和权限标识
    menuForm.component = ''
    menuForm.perms = ''
  } else if (newType === MenuType.F) {
    // 按钮不需要路由地址和组件路径
    menuForm.path = ''
    menuForm.component = ''
  }
})
</script>
```

**菜单树渲染:**

```vue
<template>
  <div class="menu-tree">
    <el-tree
      :data="menuTree"
      :props="treeProps"
      node-key="menuId"
      default-expand-all
    >
      <template #default="{ node, data }">
        <span class="menu-node">
          <!-- 根据菜单类型显示不同图标 -->
          <i v-if="data.menuType === MenuType.M" class="icon-folder"></i>
          <i v-else-if="data.menuType === MenuType.C" class="icon-file"></i>
          <i v-else class="icon-button"></i>

          <span class="menu-name">{{ node.label }}</span>

          <!-- 菜单类型标签 -->
          <el-tag :type="getMenuTypeTag(data.menuType)" size="small">
            {{ getMenuTypeLabel(data.menuType) }}
          </el-tag>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { MenuType } from '@/api/system/core/menu/menuTypes'

const menuTree = ref([
  {
    menuId: 1,
    label: '系统管理',
    menuType: MenuType.M,
    children: [
      { menuId: 2, label: '用户管理', menuType: MenuType.C },
      { menuId: 3, label: '角色管理', menuType: MenuType.C }
    ]
  }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

const getMenuTypeLabel = (type: MenuType) => {
  const labels = {
    [MenuType.M]: '目录',
    [MenuType.C]: '菜单',
    [MenuType.F]: '按钮'
  }
  return labels[type]
}

const getMenuTypeTag = (type: MenuType) => {
  const tags = {
    [MenuType.M]: 'info',
    [MenuType.C]: 'success',
    [MenuType.F]: 'warning'
  }
  return tags[type]
}
</script>
```

**权限验证:**

```typescript
import { MenuType } from '@/api/system/core/menu/menuTypes'

// 检查菜单项是否可访问
const canAccessMenu = (menu: any, userPermissions: string[]) => {
  if (menu.menuType === MenuType.F) {
    // 按钮需要检查权限标识
    return menu.perms && userPermissions.includes(menu.perms)
  } else if (menu.menuType === MenuType.C) {
    // 菜单需要检查路由权限
    return hasRoutePermission(menu.path, userPermissions)
  } else {
    // 目录需要检查子菜单是否有可访问项
    return menu.children?.some((child: any) =>
      canAccessMenu(child, userPermissions)
    )
  }
}

// 过滤菜单树
const filterMenuTree = (menus: any[], userPermissions: string[]) => {
  return menus.filter(menu => {
    if (menu.children) {
      menu.children = filterMenuTree(menu.children, userPermissions)
    }
    return canAccessMenu(menu, userPermissions)
  })
}
```

## WebSocket 消息类型枚举

### WSMessageType WebSocket 消息类型

WebSocket 消息类型枚举，定义了系统中所有可能的 WebSocket 消息类型。

```typescript
/**
 * WebSocket 消息类型枚举
 */
export enum WSMessageType {
  // 系统级消息 - 需要显示通知和存储
  SYSTEM_NOTICE = 'system_notice',

  // AI 聊天消息
  AI_CHAT_START = 'ai_chat_start',
  AI_CHAT_STREAM = 'ai_chat_stream',
  AI_CHAT_COMPLETE = 'ai_chat_complete',
  AI_CHAT_ERROR = 'ai_chat_error',

  // 业务消息 - 静默处理或特定显示
  CHAT_MESSAGE = 'chat_message',

  // 开发工具消息
  DEV_LOG = 'devLog',

  // 技术消息 - 系统内部使用
  HEARTBEAT = 'heartbeat'
}
```

**使用场景:**

- WebSocket 消息路由
- 消息类型识别
- 消息处理分发
- 实时通知
- AI 聊天对话

**基本用法 - 消息处理器:**

```typescript
import { WSMessageType } from '@/composables/useWS'

// WebSocket 消息处理
const handleWebSocketMessage = (message: WSMessage) => {
  switch (message.type) {
    case WSMessageType.SYSTEM_NOTICE:
      // 处理系统通知
      handleSystemNotice(message.data)
      break

    case WSMessageType.AI_CHAT_START:
      // AI 聊天开始
      handleAiChatStart(message.data)
      break

    case WSMessageType.AI_CHAT_STREAM:
      // AI 流式响应
      handleAiChatStream(message.data)
      break

    case WSMessageType.AI_CHAT_COMPLETE:
      // AI 聊天完成
      handleAiChatComplete(message.data)
      break

    case WSMessageType.AI_CHAT_ERROR:
      // AI 聊天错误
      handleAiChatError(message.data)
      break

    case WSMessageType.CHAT_MESSAGE:
      // 聊天消息
      handleChatMessage(message.data)
      break

    case WSMessageType.HEARTBEAT:
      // 心跳消息
      handleHeartbeat()
      break

    default:
      console.warn('未知消息类型:', message.type)
  }
}
```

## 枚举使用最佳实践

### 1. 类型安全使用

**推荐做法:**

```typescript
import { MenuType } from '@/api/system/core/menu/menuTypes'

// ✅ 使用枚举值，类型安全
const menuType: MenuType = MenuType.C

// ✅ 类型检查
if (menuType === MenuType.M) {
  console.log('这是一个目录')
}

// ❌ 避免使用字符串字面量
const wrongType = 'M' // 没有类型检查，容易出错
```

**函数参数类型:**

```typescript
// ✅ 使用枚举类型作为参数
const createMenu = (type: MenuType, name: string) => {
  // 编译时类型检查
  if (type === MenuType.F) {
    // 按钮类型特殊处理
  }
}

// 调用时有智能提示
createMenu(MenuType.C, '用户管理')
```

### 2. Switch 语句完整性检查

**推荐做法:**

```typescript
const handleMenuType = (type: MenuType): string => {
  switch (type) {
    case MenuType.M:
      return '目录'
    case MenuType.C:
      return '菜单'
    case MenuType.F:
      return '按钮'
    default:
      // 确保处理所有枚举值
      const exhaustiveCheck: never = type
      throw new Error(`未处理的菜单类型: ${exhaustiveCheck}`)
  }
}
```

**使用枚举值映射:**

```typescript
const MENU_TYPE_LABELS: Record<MenuType, string> = {
  [MenuType.M]: '目录',
  [MenuType.C]: '菜单',
  [MenuType.F]: '按钮'
}

const getMenuTypeLabel = (type: MenuType) => MENU_TYPE_LABELS[type]
```

### 3. 枚举值遍历

**获取所有枚举值:**

```typescript
// 字符串枚举
const allLanguages = Object.values(LanguageCode)
// ['zh_CN', 'en_US']

// 遍历所有语言
allLanguages.forEach(lang => {
  console.log('支持的语言:', lang)
})
```

**创建选项列表:**

```typescript
import { LanguageCode } from '@/systemConfig'

const languageOptions = Object.entries(LanguageCode).map(([key, value]) => ({
  label: key === 'zh_CN' ? '简体中文' : 'English',
  value: value
}))

// 在组件中使用
const renderLanguageSelect = () => {
  return (
    <el-select v-model={selectedLanguage}>
      {languageOptions.map(opt => (
        <el-option key={opt.value} label={opt.label} value={opt.value} />
      ))}
    </el-select>
  )
}
```

## 常见问题

### 1. 枚举值与字符串比较失败

**问题描述:**

在使用字典枚举时，从 API 获取的值与枚举比较总是返回 false。

**问题原因:**

- 枚举值类型不匹配
- 字符串包含空格或特殊字符
- 大小写不一致

**解决方案:**

```typescript
import { DictTypes } from '@/composables/useDict'

// ❌ 直接比较可能失败
const checkDictType = (apiValue: string) => {
  if (apiValue === DictTypes.sys_user_gender) {
    // 可能失败
  }
}

// ✅ 先清理和标准化
const checkDictType = (apiValue: string) => {
  const normalizedValue = apiValue.trim().toLowerCase()
  const enumValue = DictTypes.sys_user_gender.trim().toLowerCase()

  if (normalizedValue === enumValue) {
    // 可靠的比较
  }
}

// ✅ 使用类型守卫
const isDictType = (value: string): value is DictTypes => {
  return Object.values(DictTypes).includes(value as DictTypes)
}
```

### 2. 枚举在 switch 中未完全覆盖

**问题描述:**

添加新枚举值后，某些 switch 语句没有处理新值，导致运行时错误。

**问题原因:**

- Switch 语句缺少 default 分支
- 没有完整性检查

**解决方案:**

```typescript
import { MenuType } from '@/api/system/core/menu/menuTypes'

// ✅ 使用穷尽性检查
const getMenuIcon = (type: MenuType): string => {
  switch (type) {
    case MenuType.M:
      return 'icon-folder'
    case MenuType.C:
      return 'icon-file'
    case MenuType.F:
      return 'icon-button'
    default:
      // 编译时检查：如果有未处理的枚举值，这里会报错
      const exhaustiveCheck: never = type
      throw new Error(`未处理的菜单类型: ${exhaustiveCheck}`)
  }
}

// ✅ 使用对象映射（更安全）
const MENU_ICONS: Record<MenuType, string> = {
  [MenuType.M]: 'icon-folder',
  [MenuType.C]: 'icon-file',
  [MenuType.F]: 'icon-button'
}

const getMenuIcon = (type: MenuType) => MENU_ICONS[type]
```
