# Vue 权限控制指令

## 介绍

权限控制指令是 RuoYi-Plus 前端框架中用于细粒度 UI 权限控制的核心功能模块。基于 Vue 3 的自定义指令系统，提供了一套完整的声明式权限控制方案，使开发者能够在模板中直接控制元素的显示、隐藏、禁用等状态。

**核心特性：**

- **声明式语法** - 使用 `v-permi`、`v-role` 等指令直接在模板中控制元素，无需编写额外的条件逻辑
- **多种权限类型** - 支持操作权限、角色权限、租户权限等多维度权限控制
- **灵活的逻辑组合** - 支持 OR 逻辑（满足任一即可）和 AND 逻辑（必须全部满足）
- **丰富的处理动作** - 支持移除、隐藏、禁用、添加样式类等多种处理方式
- **反向权限控制** - 支持"有权限时隐藏"的反向逻辑
- **深度集成** - 与 `useAuth` 组合函数深度集成，共享权限检查逻辑
- **超级管理员豁免** - 超级管理员自动拥有所有权限，无需逐一配置
- **租户隔离** - 完整支持多租户场景下的权限控制

权限指令在应用启动时自动全局注册，无需手动导入即可直接在任意组件中使用。

## 快速开始

### 指令自动注册

权限指令通过 `directives.ts` 在应用初始化时自动注册到 Vue 实例：

```typescript
// src/directives/directives.ts
import { App } from 'vue'
import {
  permi,
  role,
  admin,
  superadmin,
  permiAll,
  roleAll,
  tenant,
  noPermi,
  noRole,
  auth
} from './permission'

export default (app: App) => {
  // 基础权限指令
  app.directive('permi', permi)
  app.directive('role', role)
  app.directive('admin', admin)
  app.directive('superadmin', superadmin)

  // 高级权限指令
  app.directive('permiAll', permiAll)
  app.directive('roleAll', roleAll)
  app.directive('tenant', tenant)

  // 反向权限指令
  app.directive('noPermi', noPermi)
  app.directive('noRole', noRole)

  // 自定义控制指令
  app.directive('auth', auth)
}
```

### 基本使用示例

```vue
<template>
  <!-- 基于权限控制 -->
  <el-button v-permi="'system:user:add'" type="primary">
    添加用户
  </el-button>

  <!-- 基于角色控制 -->
  <el-button v-role="'admin'" type="danger">
    管理员功能
  </el-button>

  <!-- 仅超级管理员可见 -->
  <el-button v-superadmin type="warning">
    系统配置
  </el-button>
</template>
```

## 权限标识规范

### 权限字符串格式

权限标识采用三段式命名规范：`模块:资源:操作`

```typescript
// 权限标识示例
'system:user:add'      // 系统模块 - 用户资源 - 添加操作
'system:user:update'   // 系统模块 - 用户资源 - 修改操作
'system:user:delete'   // 系统模块 - 用户资源 - 删除操作
'system:user:query'    // 系统模块 - 用户资源 - 查询操作
'system:user:export'   // 系统模块 - 用户资源 - 导出操作
'system:user:import'   // 系统模块 - 用户资源 - 导入操作

// 更多模块示例
'mall:goods:add'       // 商城模块 - 商品资源 - 添加操作
'mall:order:update'    // 商城模块 - 订单资源 - 修改操作
'workflow:leave:add'   // 工作流模块 - 请假资源 - 添加操作
'base:platform:delete' // 基础模块 - 平台资源 - 删除操作
```

### 通配符权限

系统支持通配符权限标识 `*:*:*`，表示拥有所有权限：

```typescript
// 在 useAuth.ts 中定义
const ALL_PERMISSION = '*:*:*'

// 拥有此权限的用户可以访问所有功能
if (userPermissions.includes(ALL_PERMISSION)) {
  return true
}
```

### 角色标识规范

角色标识采用简单的字符串格式：

```typescript
// 内置角色
'superadmin'  // 超级管理员 - 系统最高权限
'admin'       // 租户管理员 - 租户内最高权限

// 自定义角色
'editor'      // 编辑员
'auditor'     // 审核员
'operator'    // 运营人员
'finance'     // 财务人员
'manager'     // 经理
```

## 基础权限指令

### v-permi - 操作权限控制

基于操作权限控制元素显示，满足任一权限即可显示元素（OR 逻辑）。

#### 单个权限检查

```vue
<template>
  <div class="button-group">
    <!-- 拥有添加权限才显示 -->
    <el-button v-permi="'system:user:add'" type="primary" icon="Plus">
      新增
    </el-button>

    <!-- 拥有编辑权限才显示 -->
    <el-button v-permi="'system:user:update'" type="success" icon="Edit">
      编辑
    </el-button>

    <!-- 拥有删除权限才显示 -->
    <el-button v-permi="'system:user:delete'" type="danger" icon="Delete">
      删除
    </el-button>
  </div>
</template>
```

#### 多个权限检查（OR 逻辑）

```vue
<template>
  <!-- 拥有任意一个权限即可显示 -->
  <el-button v-permi="['system:user:add', 'system:user:update']" type="primary">
    用户管理
  </el-button>

  <!-- 拥有导入或导出权限都可以操作 -->
  <el-button v-permi="['system:user:import', 'system:user:export']" type="warning">
    数据操作
  </el-button>
</template>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const permi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = useAuth()
    const { value } = binding

    // 权限值校验
    if (!value) {
      throw new Error('权限值不能为空')
    }

    // 无权限则移除元素
    if (!hasPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
```

### v-role - 角色权限控制

基于角色权限控制元素，满足任一角色即可显示元素（OR 逻辑）。

#### 单个角色检查

```vue
<template>
  <!-- 编辑员可见 -->
  <el-button v-role="'editor'" type="primary">
    编辑内容
  </el-button>

  <!-- 审核员可见 -->
  <el-button v-role="'auditor'" type="warning">
    审核内容
  </el-button>

  <!-- 财务人员可见 -->
  <section v-role="'finance'" class="finance-panel">
    <h3>财务报表</h3>
    <!-- 财务相关内容 -->
  </section>
</template>
```

#### 多个角色检查（OR 逻辑）

```vue
<template>
  <!-- 管理员或编辑员可见 -->
  <el-button v-role="['admin', 'editor']" type="primary">
    内容管理
  </el-button>

  <!-- 多个角色任意满足即可 -->
  <div v-role="['manager', 'finance', 'auditor']" class="management-panel">
    <h3>管理面板</h3>
    <!-- 管理相关功能 -->
  </div>
</template>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const role: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasRole } = useAuth()
    const { value } = binding

    // 角色值校验
    if (!value) {
      throw new Error('角色值不能为空')
    }

    // 无角色则移除元素
    if (!hasRole(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
```

### v-admin - 管理员专属

仅管理员可见的元素，包括超级管理员和租户管理员。

```vue
<template>
  <!-- 管理员专属功能 -->
  <el-button v-admin type="danger">
    系统设置
  </el-button>

  <!-- 管理员面板 -->
  <div v-admin class="admin-panel">
    <h3>管理员控制面板</h3>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>用户管理</el-card>
      </el-col>
      <el-col :span="8">
        <el-card>权限管理</el-card>
      </el-col>
      <el-col :span="8">
        <el-card>系统配置</el-card>
      </el-col>
    </el-row>
  </div>

  <!-- 管理员菜单 -->
  <el-menu-item v-admin index="/system">
    <el-icon><Setting /></el-icon>
    <span>系统管理</span>
  </el-menu-item>
</template>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const admin: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { isAnyAdmin } = useAuth()

    // 非管理员则移除元素
    if (!isAnyAdmin) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

// useAuth.ts 中的 isAnyAdmin 实现
const isAnyAdmin = (roleKey?: string): boolean => {
  if (roleKey) {
    return roleKey === SUPER_ADMIN || roleKey === TENANT_ADMIN
  }
  return isSuperAdmin() || isTenantAdmin()
}
```

### v-superadmin - 超级管理员专属

仅超级管理员可见，系统最高权限。

```vue
<template>
  <!-- 超级管理员专属功能 -->
  <el-button v-superadmin type="danger">
    系统配置
  </el-button>

  <!-- 危险操作区域 -->
  <el-card v-superadmin class="danger-zone">
    <template #header>
      <span class="danger-title">危险操作区</span>
    </template>
    <el-button type="danger" plain>重置系统</el-button>
    <el-button type="danger" plain>清除缓存</el-button>
    <el-button type="danger" plain>数据迁移</el-button>
  </el-card>

  <!-- 超级管理员专属菜单 -->
  <el-submenu v-superadmin index="/super">
    <template #title>
      <el-icon><Key /></el-icon>
      <span>超级管理</span>
    </template>
    <el-menu-item index="/super/tenant">租户管理</el-menu-item>
    <el-menu-item index="/super/config">全局配置</el-menu-item>
    <el-menu-item index="/super/monitor">系统监控</el-menu-item>
  </el-submenu>
</template>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const superadmin: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { isSuperAdmin } = useAuth()

    // 非超级管理员则移除元素
    if (!isSuperAdmin) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

// useAuth.ts 中的 isSuperAdmin 实现
const SUPER_ADMIN = 'superadmin'

const isSuperAdmin = (roleToCheck?: string): boolean => {
  const targetRole = roleToCheck || SUPER_ADMIN
  return userStore.roles.includes(targetRole)
}
```

## 高级权限指令

### v-permi-all - 全部权限满足

必须满足所有权限才可显示元素（AND 逻辑）。

```vue
<template>
  <!-- 需要同时拥有添加和分配角色权限 -->
  <el-button v-permi-all="['system:user:add', 'system:role:assign']" type="primary">
    创建用户并分配角色
  </el-button>

  <!-- 备份功能需要多重权限验证 -->
  <div v-permi-all="['system:backup:create', 'system:backup:download']">
    <el-button type="warning">备份并下载</el-button>
  </div>

  <!-- 高级操作需要多个权限 -->
  <el-card v-permi-all="['system:config:update', 'system:config:delete', 'system:log:view']">
    <template #header>高级系统配置</template>
    <el-form>
      <!-- 配置表单 -->
    </el-form>
  </el-card>
</template>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const permiAll: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasAllPermissions } = useAuth()
    const { value } = binding

    // 必须是数组类型
    if (!Array.isArray(value)) {
      throw new Error('权限值必须为数组')
    }

    // 未满足所有权限则移除元素
    if (!hasAllPermissions(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

// useAuth.ts 中的 hasAllPermissions 实现
const hasAllPermissions = (permissions: string[], superAdminRole?: string): boolean => {
  // 超级管理员拥有所有权限
  if (isSuperAdmin(superAdminRole)) {
    return true
  }

  const userPermissions = userStore.permissions

  // 拥有通配符权限
  if (userPermissions.includes(ALL_PERMISSION)) {
    return true
  }

  // 检查是否拥有所有权限
  return permissions.every((perm) => userPermissions.includes(perm))
}
```

### v-role-all - 全部角色满足

必须满足所有角色才可显示元素（AND 逻辑）。

```vue
<template>
  <!-- 需要同时具有管理员和审核员角色 -->
  <el-button v-role-all="['admin', 'auditor']" type="warning">
    审核管理
  </el-button>

  <!-- 财务管理需要多重角色 -->
  <section v-role-all="['manager', 'finance']" class="finance-management">
    <h3>财务管理</h3>
    <el-table :data="financeData">
      <!-- 财务数据表格 -->
    </el-table>
  </section>

  <!-- 高级内容管理 -->
  <div v-role-all="['admin', 'editor', 'auditor']" class="content-management">
    <el-button type="primary">发布内容</el-button>
    <el-button type="success">审核内容</el-button>
    <el-button type="danger">删除内容</el-button>
  </div>
</template>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const roleAll: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasAllRoles } = useAuth()
    const { value } = binding

    // 必须是数组类型
    if (!Array.isArray(value)) {
      throw new Error('角色值必须为数组')
    }

    // 未满足所有角色则移除元素
    if (!hasAllRoles(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

// useAuth.ts 中的 hasAllRoles 实现
const hasAllRoles = (roles: string[], superAdminRole?: string): boolean => {
  // 超级管理员拥有所有角色
  if (isSuperAdmin(superAdminRole)) {
    return true
  }

  const userRoles = userStore.roles

  // 检查是否拥有所有角色
  return roles.every((role) => userRoles.includes(role))
}
```

### v-tenant - 租户权限控制

基于租户操作权限控制元素，支持多租户场景。

#### 基本用法

```vue
<template>
  <!-- 当前租户下的权限检查 -->
  <el-button v-tenant="'tenant:user:manage'" type="primary">
    租户用户管理
  </el-button>

  <!-- 多个租户权限（OR 逻辑） -->
  <div v-tenant="['tenant:report:view', 'tenant:report:export']">
    <el-button type="info">查看报表</el-button>
    <el-button type="warning">导出报表</el-button>
  </div>
</template>
```

#### 指定租户检查

```vue
<template>
  <!-- 指定特定租户下的权限 -->
  <el-button v-tenant="{
    permi: 'tenant:data:export',
    tenantId: '12345'
  }" type="warning">
    导出租户数据
  </el-button>

  <!-- 跨租户操作（仅超级管理员可用） -->
  <el-card v-tenant="{
    permi: ['tenant:manage:all', 'tenant:config:update'],
    tenantId: targetTenantId
  }">
    <template #header>跨租户管理</template>
    <!-- 管理内容 -->
  </el-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const targetTenantId = ref('tenant-001')
</script>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const tenant: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasTenantPermission } = useAuth()
    const { value } = binding

    if (!value) {
      throw new Error('租户权限值不能为空')
    }

    // 处理字符串或数组（使用当前用户的租户ID）
    if (typeof value === 'string' || Array.isArray(value)) {
      if (!hasTenantPermission(value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
      return
    }

    // 处理对象格式 { permi: string | string[], tenantId: string }
    if (typeof value === 'object' && 'permi' in value) {
      const { permi, tenantId } = value
      if (!hasTenantPermission(permi, tenantId)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
}

// useAuth.ts 中的 hasTenantPermission 实现
const hasTenantPermission = (
  permission: string | string[],
  tenantId?: string,
  superAdminRole?: string,
  tenantAdminRole?: string
): boolean => {
  // 获取目标租户ID
  const targetTenantId = tenantId || userStore.userInfo?.tenantId

  // 超级管理员拥有所有租户的所有权限
  if (isSuperAdmin(superAdminRole)) {
    return true
  }

  // 只能操作自己所属租户的数据
  if (targetTenantId !== userStore.userInfo?.tenantId) {
    return false
  }

  // 租户管理员在自己的租户内拥有所有权限
  if (isTenantAdmin(tenantAdminRole)) {
    return true
  }

  // 普通用户按正常权限检查
  return hasPermission(permission, superAdminRole)
}
```

## 反向权限指令

### v-no-permi - 反向权限控制

与 `v-permi` 相反，当用户拥有指定权限时隐藏元素。适用于显示升级提示、新手引导等场景。

```vue
<template>
  <!-- 无管理权限的用户才显示 -->
  <div v-no-permi="'system:admin:access'" class="user-notice">
    <el-alert title="权限提示" type="info">
      <p>您当前是普通用户，部分功能受限</p>
      <el-button type="primary" size="small">申请更多权限</el-button>
    </el-alert>
  </div>

  <!-- 没有高级功能权限时显示升级提示 -->
  <div v-no-permi="'feature:premium:access'" class="upgrade-notice">
    <el-card class="upgrade-card">
      <el-icon class="crown-icon"><Star /></el-icon>
      <h3>升级到高级版</h3>
      <p>解锁更多专业功能</p>
      <el-button type="warning">立即升级</el-button>
    </el-card>
  </div>

  <!-- 没有数据导出权限时显示提示 -->
  <el-tooltip v-no-permi="'system:data:export'" content="需要导出权限">
    <el-button type="info" disabled>导出数据</el-button>
  </el-tooltip>
</template>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const noPermi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission } = useAuth()
    const { value } = binding

    if (!value) {
      throw new Error('权限值不能为空')
    }

    // 与 permi 指令逻辑相反：有权限则移除
    if (hasPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
```

### v-no-role - 反向角色控制

与 `v-role` 相反，当用户拥有指定角色时隐藏元素。

```vue
<template>
  <!-- 非管理员可见的提示 -->
  <div v-no-role="'admin'" class="upgrade-notice">
    <el-alert type="info">
      <p>联系管理员获取更多权限</p>
      <el-button type="text">联系管理员</el-button>
    </el-alert>
  </div>

  <!-- 新手用户引导（高级用户不显示） -->
  <div v-no-role="['expert', 'advanced']" class="beginner-guide">
    <el-steps :active="currentStep" finish-status="success">
      <el-step title="创建项目" />
      <el-step title="添加成员" />
      <el-step title="开始协作" />
    </el-steps>
    <el-button @click="skipGuide">跳过引导</el-button>
  </div>

  <!-- 非VIP用户看到的广告 -->
  <div v-no-role="'vip'" class="advertisement">
    <el-banner>成为VIP会员，享受无广告体验</el-banner>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const currentStep = ref(0)

const skipGuide = () => {
  // 跳过新手引导逻辑
}
</script>
```

#### 实现原理

```typescript
// src/directives/permission.ts
export const noRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasRole } = useAuth()
    const { value } = binding

    if (!value) {
      throw new Error('角色值不能为空')
    }

    // 与 role 指令逻辑相反：有角色则移除
    if (hasRole(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
```

## 自定义控制指令

### v-auth - 灵活权限控制

`v-auth` 是最灵活的权限控制指令，支持指定不同的处理动作。

#### 基本用法

```vue
<template>
  <!-- 权限控制，默认移除元素 -->
  <el-button v-auth="{ permi: 'system:user:add' }" type="primary">
    添加用户
  </el-button>

  <!-- 角色控制，默认移除元素 -->
  <el-button v-auth="{ role: 'editor' }" type="success">
    编辑内容
  </el-button>
</template>
```

#### 禁用元素（disable 动作）

```vue
<template>
  <!-- 无权限时禁用按钮 -->
  <el-button
    v-auth="{
      permi: 'system:user:edit',
      action: 'disable'
    }"
    type="primary"
  >
    编辑用户
  </el-button>

  <!-- 无角色时禁用整个表单 -->
  <el-form v-auth="{ role: 'admin', action: 'disable' }">
    <el-form-item label="用户名">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="form.email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const form = reactive({
  username: '',
  email: ''
})
</script>
```

#### 隐藏元素（hide 动作）

```vue
<template>
  <!-- 无权限时隐藏元素（保留DOM占位） -->
  <div
    v-auth="{
      role: 'admin',
      action: 'hide'
    }"
    class="admin-panel"
  >
    <h3>管理员面板</h3>
    <!-- 面板内容 -->
  </div>

  <!-- 隐藏敏感操作按钮 -->
  <el-button
    v-auth="{
      permi: 'system:config:danger',
      action: 'hide'
    }"
    type="danger"
  >
    危险操作
  </el-button>
</template>
```

#### 添加样式类（class 动作）

```vue
<template>
  <!-- 无权限时添加自定义样式类 -->
  <el-button
    v-auth="{
      permi: 'premium:feature',
      action: 'class',
      className: 'premium-disabled'
    }"
    type="warning"
  >
    高级功能
  </el-button>

  <!-- 无权限时添加默认 no-auth 类 -->
  <el-card v-auth="{ role: 'vip', action: 'class' }">
    <template #header>VIP专属内容</template>
    <p>此内容仅VIP可见</p>
  </el-card>
</template>

<style lang="scss" scoped>
.premium-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  position: relative;

  &::after {
    content: '需要高级版';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #f56c6c;
  }
}

.no-auth {
  opacity: 0.6;
  pointer-events: none;
}
</style>
```

#### 支持的动作类型

| 动作 | 说明 | 效果 |
|------|------|------|
| `remove` | 移除元素（默认） | 从 DOM 中完全移除元素 |
| `hide` | 隐藏元素 | 设置 `display: none`，保留 DOM 节点 |
| `disable` | 禁用元素 | 添加 `disabled` 属性和 `.is-disabled` 类，阻止点击事件 |
| `class` | 添加样式类 | 添加指定类名或默认的 `.no-auth` 类 |

#### 实现原理

```typescript
// src/directives/permission.ts
export const auth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission, hasRole } = useAuth()
    const { value } = binding

    if (!value || typeof value !== 'object') {
      throw new Error('权限值格式不正确')
    }

    let hasAuth = true

    // 检查权限
    if ('permi' in value) {
      hasAuth = hasPermission(value.permi)
    }
    // 检查角色
    else if ('role' in value) {
      hasAuth = hasRole(value.role)
    } else {
      throw new Error('必须指定 permi 或 role')
    }

    // 如果没有权限，根据指定的动作进行处理
    if (!hasAuth) {
      const { action, className } = value
      applyAction(el, action, className)
    }
  }
}

/**
 * 应用权限动作到元素
 */
const applyAction = (el: HTMLElement, action?: string, className?: string): void => {
  switch (action) {
    case 'remove':
      // 移除元素
      el.parentNode && el.parentNode.removeChild(el)
      break

    case 'hide':
      // 隐藏元素
      el.style.display = 'none'
      break

    case 'disable':
      // 禁用元素
      el.setAttribute('disabled', 'disabled')
      el.classList.add('is-disabled')
      // 阻止点击事件
      const stopClick = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
      }
      el.addEventListener('click', stopClick, true)
      break

    case 'class':
      // 添加指定类名
      if (className) {
        el.classList.add(className)
      } else {
        el.classList.add('no-auth')
      }
      break

    default:
      // 默认移除元素
      el.parentNode && el.parentNode.removeChild(el)
  }
}
```

## 实际应用场景

### 表格操作列权限控制

```vue
<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="name" label="用户名" />
    <el-table-column prop="email" label="邮箱" />
    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="280">
      <template #default="{ row }">
        <el-button
          v-permi="['system:user:query']"
          link
          type="primary"
          icon="View"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-permi="['system:user:update']"
          link
          type="success"
          icon="Edit"
          @click="handleUpdate(row)"
        >
          编辑
        </el-button>
        <el-button
          v-permi="['system:user:delete']"
          link
          type="danger"
          icon="Delete"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
        <el-button
          v-permi="['system:user:reset']"
          link
          type="warning"
          icon="Refresh"
          @click="handleResetPwd(row)"
        >
          重置密码
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const tableData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', status: 1 },
  { id: 2, name: '李四', email: 'lisi@example.com', status: 0 }
])

const handleView = (row: any) => {
  console.log('查看用户:', row)
}

const handleUpdate = (row: any) => {
  console.log('编辑用户:', row)
}

const handleDelete = (row: any) => {
  console.log('删除用户:', row)
}

const handleResetPwd = (row: any) => {
  console.log('重置密码:', row)
}
</script>
```

### 工具栏按钮组权限控制

```vue
<template>
  <el-row :gutter="10" class="toolbar">
    <el-col :span="1.5" v-permi="['system:user:add']">
      <el-button type="primary" plain icon="Plus" @click="handleAdd">
        新增
      </el-button>
    </el-col>

    <el-col :span="1.5" v-permi="['system:user:update']">
      <el-button
        type="success"
        plain
        icon="Edit"
        :disabled="!selected.length"
        @click="handleBatchEdit"
      >
        批量编辑
      </el-button>
    </el-col>

    <el-col :span="1.5" v-permi="['system:user:delete']">
      <el-button
        type="danger"
        plain
        icon="Delete"
        :disabled="!selected.length"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </el-col>

    <el-col :span="1.5" v-permi="['system:user:import']">
      <el-button type="info" plain icon="Upload" @click="handleImport">
        导入
      </el-button>
    </el-col>

    <el-col :span="1.5" v-permi="['system:user:export']">
      <el-button type="warning" plain icon="Download" @click="handleExport">
        导出
      </el-button>
    </el-col>

    <right-toolbar
      v-model:showSearch="showSearch"
      @queryTable="getList"
    />
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const selected = ref<any[]>([])
const showSearch = ref(true)

const handleAdd = () => {
  console.log('新增用户')
}

const handleBatchEdit = () => {
  console.log('批量编辑')
}

const handleBatchDelete = () => {
  console.log('批量删除')
}

const handleImport = () => {
  console.log('导入')
}

const handleExport = () => {
  console.log('导出')
}

const getList = () => {
  console.log('刷新列表')
}
</script>
```

### 菜单导航权限控制

```vue
<template>
  <el-menu
    :default-active="activeIndex"
    mode="horizontal"
    @select="handleSelect"
  >
    <!-- 所有用户可见 -->
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>

    <!-- 用户管理菜单 -->
    <el-menu-item v-permi="'system:user:list'" index="/user">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </el-menu-item>

    <!-- 系统管理子菜单（管理员可见） -->
    <el-submenu v-role="'admin'" index="/system">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>系统管理</span>
      </template>
      <el-menu-item v-permi="'system:role:list'" index="/system/role">
        角色管理
      </el-menu-item>
      <el-menu-item v-permi="'system:menu:list'" index="/system/menu">
        菜单管理
      </el-menu-item>
      <el-menu-item v-permi="'system:dict:list'" index="/system/dict">
        字典管理
      </el-menu-item>
    </el-submenu>

    <!-- 超级管理员专属 -->
    <el-submenu v-superadmin index="/super">
      <template #title>
        <el-icon><Key /></el-icon>
        <span>超级管理</span>
      </template>
      <el-menu-item index="/super/tenant">租户管理</el-menu-item>
      <el-menu-item index="/super/config">全局配置</el-menu-item>
    </el-submenu>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeIndex = ref('/')

const handleSelect = (index: string) => {
  console.log('选中菜单:', index)
}
</script>
```

### 仪表板权限分区

```vue
<template>
  <div class="dashboard">
    <!-- 所有用户可见的统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <stat-card title="我的任务" :value="taskCount" icon="List" />
      </el-col>
      <el-col :span="6">
        <stat-card title="待办事项" :value="todoCount" icon="Bell" />
      </el-col>
    </el-row>

    <!-- 管理员仪表板 -->
    <div v-admin class="admin-dashboard">
      <el-divider>管理员统计</el-divider>
      <el-row :gutter="20">
        <el-col :span="6" v-permi="'system:stat:user'">
          <stat-card title="用户总数" :value="userCount" icon="User" />
        </el-col>
        <el-col :span="6" v-permi="'system:stat:order'">
          <stat-card title="订单总数" :value="orderCount" icon="ShoppingCart" />
        </el-col>
        <el-col :span="6" v-permi="'system:stat:revenue'">
          <stat-card title="总收入" :value="revenue" icon="Money" prefix="¥" />
        </el-col>
        <el-col :span="6" v-permi="'system:stat:visit'">
          <stat-card title="访问量" :value="visitCount" icon="View" />
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" v-permi="'system:chart:view'">
        <el-col :span="12">
          <chart-component type="line" :data="lineChartData" />
        </el-col>
        <el-col :span="12">
          <chart-component type="pie" :data="pieChartData" />
        </el-col>
      </el-row>
    </div>

    <!-- 普通用户界面 -->
    <div v-no-admin class="user-dashboard">
      <el-divider>我的工作台</el-divider>
      <user-profile />
      <recent-orders v-permi="'user:order:list'" />
    </div>

    <!-- 租户管理功能 -->
    <tenant-management v-tenant="'tenant:manage:all'" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const taskCount = ref(12)
const todoCount = ref(5)
const userCount = ref(1280)
const orderCount = ref(356)
const revenue = ref(128000)
const visitCount = ref(9800)

const lineChartData = ref({})
const pieChartData = ref({})
</script>
```

### 表单字段权限控制

```vue
<template>
  <el-form :model="form" :rules="rules" label-width="100px">
    <!-- 基础信息（所有用户可编辑） -->
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" />
    </el-form-item>

    <!-- 敏感信息（需要特定权限） -->
    <el-form-item
      v-permi="'system:user:sensitive'"
      label="身份证号"
      prop="idCard"
    >
      <el-input v-model="form.idCard" />
    </el-form-item>

    <!-- 角色分配（仅管理员可操作） -->
    <el-form-item v-role="'admin'" label="角色" prop="roles">
      <el-select v-model="form.roles" multiple placeholder="请选择角色">
        <el-option
          v-for="role in roleOptions"
          :key="role.id"
          :label="role.name"
          :value="role.id"
        />
      </el-select>
    </el-form-item>

    <!-- 部门分配（需要权限） -->
    <el-form-item v-permi="'system:user:dept'" label="部门" prop="deptId">
      <el-tree-select
        v-model="form.deptId"
        :data="deptOptions"
        :props="{ label: 'name', value: 'id' }"
        placeholder="请选择部门"
      />
    </el-form-item>

    <!-- 高级设置（超级管理员专属） -->
    <el-collapse v-superadmin>
      <el-collapse-item title="高级设置" name="advanced">
        <el-form-item label="数据权限">
          <el-select v-model="form.dataScope">
            <el-option label="全部数据" value="1" />
            <el-option label="本部门数据" value="2" />
            <el-option label="仅本人数据" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="特殊标记">
          <el-checkbox-group v-model="form.flags">
            <el-checkbox label="vip">VIP用户</el-checkbox>
            <el-checkbox label="verified">已认证</el-checkbox>
            <el-checkbox label="internal">内部用户</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>

    <!-- 操作按钮 -->
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'

const form = reactive({
  username: '',
  email: '',
  idCard: '',
  roles: [],
  deptId: null,
  dataScope: '3',
  flags: []
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

const roleOptions = ref([
  { id: 1, name: '管理员' },
  { id: 2, name: '编辑员' },
  { id: 3, name: '普通用户' }
])

const deptOptions = ref([])

const handleSubmit = () => {
  console.log('提交表单:', form)
}

const handleReset = () => {
  Object.assign(form, {
    username: '',
    email: '',
    idCard: '',
    roles: [],
    deptId: null,
    dataScope: '3',
    flags: []
  })
}
</script>
```

## API 参考

### 指令值类型定义

```typescript
/**
 * 基础权限指令值类型
 * v-permi, v-no-permi
 */
type PermissionValue = string | string[]

/**
 * 基础角色指令值类型
 * v-role, v-no-role
 */
type RoleValue = string | string[]

/**
 * 租户权限指令值类型
 * v-tenant
 */
type TenantValue =
  | string
  | string[]
  | {
      permi: string | string[]
      tenantId?: string
    }

/**
 * Auth 指令值类型
 * v-auth
 */
interface AuthValue {
  /** 权限检查（与 role 二选一） */
  permi?: string | string[]
  /** 角色检查（与 permi 二选一） */
  role?: string | string[]
  /** 处理动作 */
  action?: 'remove' | 'hide' | 'disable' | 'class'
  /** 自定义类名（仅 action 为 'class' 时有效） */
  className?: string
}

/**
 * 权限检查动作类型
 */
type AuthAction = 'remove' | 'hide' | 'disable' | 'class'
```

### 指令一览表

| 指令 | 用途 | 值类型 | 逻辑 | 默认动作 |
|------|------|--------|------|----------|
| `v-permi` | 操作权限控制 | `string \| string[]` | OR | 移除元素 |
| `v-role` | 角色权限控制 | `string \| string[]` | OR | 移除元素 |
| `v-admin` | 管理员专属 | 无 | - | 移除元素 |
| `v-superadmin` | 超级管理员专属 | 无 | - | 移除元素 |
| `v-permi-all` | 全部权限满足 | `string[]` | AND | 移除元素 |
| `v-role-all` | 全部角色满足 | `string[]` | AND | 移除元素 |
| `v-tenant` | 租户权限控制 | `TenantValue` | OR | 移除元素 |
| `v-no-permi` | 反向权限控制 | `string \| string[]` | OR | 移除元素 |
| `v-no-role` | 反向角色控制 | `string \| string[]` | OR | 移除元素 |
| `v-auth` | 灵活权限控制 | `AuthValue` | 可配置 | 可配置 |

### useAuth 组合函数 API

```typescript
interface UseAuthReturn {
  // 状态
  isLoggedIn: ComputedRef<boolean>

  // 管理员检查
  isSuperAdmin: (roleToCheck?: string) => boolean
  isTenantAdmin: (roleToCheck?: string) => boolean
  isAnyAdmin: (roleKey?: string) => boolean

  // 权限检查
  hasPermission: (permission: string | string[], superAdminRole?: string) => boolean
  hasAllPermissions: (permissions: string[], superAdminRole?: string) => boolean
  hasTenantPermission: (
    permission: string | string[],
    tenantId?: string,
    superAdminRole?: string,
    tenantAdminRole?: string
  ) => boolean

  // 角色检查
  hasRole: (role: string | string[], superAdminRole?: string) => boolean
  hasAllRoles: (roles: string[], superAdminRole?: string) => boolean

  // 路由访问控制
  canAccessRoute: (route: any, superAdminRole?: string) => boolean
  filterAuthorizedRoutes: (routes: any[], superAdminRole?: string) => any[]
}
```

### 错误处理

所有指令都包含完善的错误处理机制：

```typescript
// 权限值为空
throw new Error('权限值不能为空')

// 角色值为空
throw new Error('角色值不能为空')

// 租户权限值为空
throw new Error('租户权限值不能为空')

// 数组类型验证
throw new Error('权限值必须为数组')  // v-permi-all
throw new Error('角色值必须为数组')  // v-role-all

// Auth 指令格式验证
throw new Error('权限值格式不正确')
throw new Error('必须指定 permi 或 role')
```

## 主题定制

### 权限相关样式类

```scss
// 禁用状态样式
.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
  pointer-events: none;
}

// 无权限默认样式
.no-auth {
  opacity: 0.5;
  cursor: not-allowed;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.1);
    z-index: 1;
  }
}

// 权限提示样式
.permission-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-warning);
  font-size: 12px;

  .el-icon {
    font-size: 14px;
  }
}

// 升级提示卡片
.upgrade-card {
  text-align: center;
  padding: 40px 20px;

  .crown-icon {
    font-size: 48px;
    color: var(--el-color-warning);
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0 0 20px;
    color: var(--el-text-color-secondary);
  }
}

// 管理员面板样式
.admin-panel {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid var(--el-border-color-lighter);

  h3 {
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-primary);
  }
}

// 危险操作区域
.danger-zone {
  border-color: var(--el-color-danger-light-5);

  .danger-title {
    color: var(--el-color-danger);
    font-weight: 600;
  }

  .el-button {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
```

### 暗黑模式适配

```scss
// 暗黑模式权限样式
html.dark {
  .no-auth {
    opacity: 0.4;

    &::before {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .admin-panel {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }

  .danger-zone {
    border-color: var(--el-color-danger-dark-2);
  }

  .upgrade-card {
    background: var(--el-bg-color);
  }
}
```

## 最佳实践

### 1. 优先使用基础指令

大多数场景使用 `v-permi` 和 `v-role` 即可满足需求：

```vue
<template>
  <!-- ✅ 推荐：简洁明了 -->
  <el-button v-permi="'system:user:add'">添加用户</el-button>

  <!-- ❌ 不推荐：过度复杂 -->
  <el-button v-auth="{ permi: 'system:user:add', action: 'remove' }">
    添加用户
  </el-button>
</template>
```

### 2. 合理选择处理动作

根据 UX 需求选择合适的处理方式：

```vue
<template>
  <!-- 完全隐藏：敏感功能，不应暴露存在 -->
  <el-button v-permi="'system:config:danger'">
    危险操作
  </el-button>

  <!-- 禁用显示：让用户知道功能存在但无权限 -->
  <el-button
    v-auth="{ permi: 'system:export', action: 'disable' }"
    title="需要导出权限"
  >
    导出数据
  </el-button>

  <!-- 样式提示：显示锁定状态，引导升级 -->
  <el-button
    v-auth="{
      permi: 'premium:feature',
      action: 'class',
      className: 'locked-feature'
    }"
  >
    <el-icon><Lock /></el-icon>
    高级功能
  </el-button>
</template>
```

### 3. 避免在同一元素使用多个权限指令

```vue
<template>
  <!-- ❌ 不推荐：多个指令冲突 -->
  <el-button v-permi="'add'" v-role="'admin'">
    添加
  </el-button>

  <!-- ✅ 推荐：使用计算属性或 v-if -->
  <el-button v-if="canAdd">添加</el-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole } = useAuth()

const canAdd = computed(() => {
  return hasPermission('add') && hasRole('admin')
})
</script>
```

### 4. 大量元素使用父级控制

```vue
<template>
  <!-- ✅ 推荐：父级控制，减少检查次数 -->
  <div v-permi="'system:user:list'">
    <el-button @click="handleAdd">添加</el-button>
    <el-button @click="handleEdit">编辑</el-button>
    <el-button @click="handleDelete">删除</el-button>
  </div>

  <!-- ❌ 不推荐：每个元素都检查 -->
  <div>
    <el-button v-permi="'system:user:list'" @click="handleAdd">添加</el-button>
    <el-button v-permi="'system:user:list'" @click="handleEdit">编辑</el-button>
    <el-button v-permi="'system:user:list'" @click="handleDelete">删除</el-button>
  </div>
</template>
```

### 5. 复杂逻辑使用组合函数

```vue
<template>
  <el-button v-if="canManageUser" @click="handleManage">
    用户管理
  </el-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasPermission, hasRole, isSuperAdmin } = useAuth()

// 复杂的权限逻辑
const canManageUser = computed(() => {
  // 超级管理员直接通过
  if (isSuperAdmin()) return true

  // 需要管理员角色且有用户管理权限
  if (!hasRole('admin')) return false

  // 需要同时拥有查看和编辑权限
  return hasPermission(['system:user:list', 'system:user:update'])
})
</script>
```

## 常见问题

### 1. 指令不生效，元素仍然显示

**问题原因：**
- 用户权限未正确加载
- 权限标识与后端不一致
- 超级管理员自动拥有所有权限

**解决方案：**

```typescript
// 检查用户权限是否已加载
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 调试时打印权限列表
console.log('用户权限:', userStore.permissions)
console.log('用户角色:', userStore.roles)

// 确保权限标识完全匹配（区分大小写）
// 后端: 'system:user:add'
// 前端: v-permi="'system:user:add'"  ✅
// 前端: v-permi="'System:User:Add'"  ❌
```

### 2. 指令在 v-for 循环中失效

**问题原因：**
- Vue 指令在组件首次挂载时执行
- 动态数据变化不会触发指令更新

**解决方案：**

```vue
<template>
  <!-- 使用 v-if 配合计算属性 -->
  <div v-for="item in filteredItems" :key="item.id">
    <el-button @click="handleEdit(item)">编辑</el-button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

const items = ref([...])

// 使用计算属性过滤
const filteredItems = computed(() => {
  if (!hasPermission('system:item:list')) {
    return []
  }
  return items.value
})
</script>
```

### 3. 权限变更后 UI 未更新

**问题原因：**
- 指令只在元素挂载时检查权限
- 权限变更不会触发指令重新执行

**解决方案：**

```vue
<template>
  <!-- 方案1：使用 key 强制重新渲染 -->
  <div :key="permissionKey">
    <el-button v-permi="'system:user:add'">添加</el-button>
  </div>

  <!-- 方案2：使用 v-if 配合响应式权限 -->
  <el-button v-if="hasAddPermission">添加</el-button>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/modules/user'

const { hasPermission } = useAuth()
const userStore = useUserStore()

// 方案1：监听权限变化，更新 key
const permissionKey = ref(0)
watch(
  () => userStore.permissions,
  () => {
    permissionKey.value++
  }
)

// 方案2：使用计算属性
const hasAddPermission = computed(() => hasPermission('system:user:add'))
</script>
```

### 4. v-auth 的 disable 动作对自定义组件无效

**问题原因：**
- `disable` 动作直接操作 DOM 元素
- 自定义组件可能不响应 `disabled` 属性

**解决方案：**

```vue
<template>
  <!-- 方案1：使用组件的 disabled prop -->
  <custom-button :disabled="!hasEditPermission">编辑</custom-button>

  <!-- 方案2：使用 class 动作配合 CSS -->
  <custom-button
    v-auth="{ permi: 'edit', action: 'class', className: 'is-disabled' }"
  >
    编辑
  </custom-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { hasPermission } = useAuth()

const hasEditPermission = computed(() => hasPermission('edit'))
</script>

<style scoped>
.is-disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
```

### 5. 租户权限检查不生效

**问题原因：**
- 用户的 tenantId 未正确设置
- 检查的租户 ID 与用户不匹配

**解决方案：**

```typescript
// 检查用户信息中的租户 ID
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

console.log('当前用户租户ID:', userStore.userInfo?.tenantId)

// 确保租户 ID 匹配
// v-tenant="{ permi: 'tenant:user:manage', tenantId: '正确的租户ID' }"
```

### 6. 权限检查性能问题

**问题原因：**
- 页面中大量元素使用权限指令
- 每次检查都会遍历权限数组

**解决方案：**

```typescript
// 使用 Set 优化权限检查（在 useAuth 中已实现）
const permissionSet = computed(() => new Set(userStore.permissions))

const hasPermission = (permission: string): boolean => {
  return permissionSet.value.has(permission)
}

// 缓存权限检查结果
const permissionCache = new Map<string, boolean>()

const hasPermissionCached = (permission: string): boolean => {
  if (permissionCache.has(permission)) {
    return permissionCache.get(permission)!
  }

  const result = hasPermission(permission)
  permissionCache.set(permission, result)
  return result
}
```

### 7. 指令与 Element Plus 组件样式冲突

**问题原因：**
- `v-auth` 的 `disable` 动作添加的样式可能与组件样式冲突

**解决方案：**

```vue
<template>
  <!-- 使用组件原生的 disabled 属性 -->
  <el-button :disabled="!hasPermission('edit')">编辑</el-button>
</template>

<style scoped>
/* 或者覆盖冲突的样式 */
:deep(.el-button.is-disabled) {
  /* 自定义禁用样式 */
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```
