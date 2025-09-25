# Vue 权限控制指令

提供一系列基于权限和角色的自定义指令，用于控制UI元素的显示、隐藏和交互状态。所有指令都基于 `useAuth` 钩子提供的权限检查功能。

## 快速开始

指令会自动在应用启动时注册，可以直接在模板中使用：

```vue
<template>
  <!-- 基于权限控制 -->
  <button v-permi="'system:user:add'">添加用户</button>
  
  <!-- 基于角色控制 -->
  <button v-role="'admin'">管理员功能</button>
</template>
```

## 基础权限指令

### v-permi
基于操作权限控制元素显示，满足任一权限即可显示（OR逻辑）。

```vue
<template>
  <!-- 单个权限 -->
  <button v-permi="'system:user:add'">添加用户</button>
  
  <!-- 多个权限（满足其一即可） -->
  <button v-permi="['system:user:add', 'system:user:update']">用户管理</button>
  
  <!-- 在列表中使用 -->
  <div v-for="item in list" :key="item.id">
    <button v-permi="'system:user:edit'">编辑</button>
    <button v-permi="'system:user:delete'">删除</button>
  </div>
</template>
```

### v-role
基于角色权限控制元素，满足任一角色即可显示（OR逻辑）。

```vue
<template>
  <!-- 单个角色 -->
  <button v-role="'editor'">编辑内容</button>
  
  <!-- 多个角色（满足其一即可） -->
  <button v-role="['admin', 'editor']">内容管理</button>
  
  <!-- 菜单项控制 -->
  <li v-role="'manager'">
    <a href="/reports">报表管理</a>
  </li>
</template>
```

### v-admin
仅管理员可见，包括超级管理员和租户管理员。

```vue
<template>
  <!-- 管理员专属功能 -->
  <button v-admin>系统设置</button>
  
  <!-- 管理员菜单 -->
  <div v-admin class="admin-panel">
    <h3>管理员面板</h3>
    <button>用户管理</button>
    <button>权限管理</button>
  </div>
</template>
```

### v-superadmin
仅超级管理员可见，系统最高权限。

```vue
<template>
  <!-- 超级管理员专属 -->
  <button v-superadmin>系统配置</button>
  
  <!-- 危险操作 -->
  <button v-superadmin class="danger">重置系统</button>
</template>
```

## 高级权限指令

### v-permi-all
必须满足所有权限才可显示（AND逻辑）。

```vue
<template>
  <!-- 需要多重权限验证 -->
  <button v-permi-all="['system:user:add', 'system:role:assign']">
    创建用户并分配角色
  </button>
  
  <!-- 高级操作 -->
  <div v-permi-all="['system:backup:create', 'system:backup:download']">
    <button>备份并下载</button>
  </div>
</template>
```

### v-role-all
必须满足所有角色才可显示（AND逻辑）。

```vue
<template>
  <!-- 需要多重角色 -->
  <button v-role-all="['admin', 'auditor']">审核管理</button>
  
  <!-- 特殊权限组合 -->
  <section v-role-all="['manager', 'finance']">
    <h3>财务管理</h3>
    <!-- 财务相关内容 -->
  </section>
</template>
```

### v-tenant
基于租户权限控制元素。

```vue
<template>
  <!-- 当前租户下的权限 -->
  <button v-tenant="'tenant:user:manage'">租户用户管理</button>
  
  <!-- 指定租户下的权限 -->
  <button v-tenant="{ 
    permi: 'tenant:data:export', 
    tenantId: '12345' 
  }">
    导出租户数据
  </button>
  
  <!-- 多个权限 -->
  <div v-tenant="['tenant:report:view', 'tenant:report:export']">
    <button>查看报表</button>
    <button>导出报表</button>
  </div>
</template>
```

## 反向权限指令

### v-no-permi
与 `v-permi` 相反，当用户拥有指定权限时隐藏元素。

```vue
<template>
  <!-- 普通用户可见，管理员隐藏 -->
  <div v-no-permi="'system:admin:access'" class="user-notice">
    <p>您当前是普通用户</p>
    <button>申请管理员权限</button>
  </div>
  
  <!-- 试用功能提示 -->
  <div v-no-permi="'feature:premium:access'">
    <p>升级到高级版本解锁更多功能</p>
  </div>
</template>
```

### v-no-role
与 `v-role` 相反，当用户拥有指定角色时隐藏元素。

```vue
<template>
  <!-- 非管理员可见 -->
  <div v-no-role="'admin'" class="upgrade-notice">
    <p>联系管理员获取更多权限</p>
  </div>
  
  <!-- 新手引导 -->
  <div v-no-role="['expert', 'advanced']" class="beginner-guide">
    <h3>新手指南</h3>
    <!-- 引导内容 -->
  </div>
</template>
```

## 自定义控制指令

### v-auth
灵活的权限控制指令，支持多种处理方式。

#### 基本用法

```vue
<template>
  <!-- 权限控制，默认移除元素 -->
  <button v-auth="{ permi: 'system:user:add' }">添加用户</button>
  
  <!-- 角色控制 -->
  <button v-auth="{ role: 'editor' }">编辑内容</button>
</template>
```

#### 指定处理动作

```vue
<template>
  <!-- 禁用元素 -->
  <button v-auth="{ 
    permi: 'system:user:edit', 
    action: 'disable' 
  }">
    编辑用户
  </button>
  
  <!-- 隐藏元素 -->
  <div v-auth="{ 
    role: 'admin', 
    action: 'hide' 
  }">
    管理员面板
  </div>
  
  <!-- 添加样式类 -->
  <button v-auth="{ 
    permi: 'premium:feature', 
    action: 'class',
    className: 'premium-disabled' 
  }">
    高级功能
  </button>
</template>
```

#### 支持的动作类型

| 动作 | 说明 | 效果 |
|------|------|------|
| `remove` | 移除元素（默认） | 从DOM中完全移除元素 |
| `hide` | 隐藏元素 | 设置 `display: none` |
| `disable` | 禁用元素 | 添加 `disabled` 属性和 `.is-disabled` 类，阻止点击事件 |
| `class` | 添加样式类 | 添加指定类名或默认的 `.no-auth` 类 |

## 实际应用场景

### 表格操作列

```vue
<template>
  <el-table :data="tableData">
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button v-permi="'system:user:edit'" size="small" @click="edit(row)">
          编辑
        </el-button>
        <el-button v-permi="'system:user:delete'" type="danger" size="small" @click="remove(row)">
          删除
        </el-button>
        <el-button v-permi="'system:user:reset'" size="small" @click="resetPwd(row)">
          重置密码
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
```

### 菜单导航

```vue
<template>
  <el-menu>
    <el-menu-item v-permi="'system:user:list'">
      <span>用户管理</span>
    </el-menu-item>
    
    <el-submenu v-role="'admin'">
      <template #title>系统管理</template>
      <el-menu-item v-permi="'system:role:list'">角色管理</el-menu-item>
      <el-menu-item v-permi="'system:menu:list'">菜单管理</el-menu-item>
    </el-submenu>
    
    <el-menu-item v-superadmin>
      <span>系统配置</span>
    </el-menu-item>
  </el-menu>
</template>
```

### 表单按钮组

```vue
<template>
  <div class="form-actions">
    <el-button v-permi="'system:user:add'" type="primary" @click="add">
      <i class="plus"></i> 新增
    </el-button>
    
    <el-button 
      v-auth="{ 
        permi: 'system:user:edit', 
        action: 'disable' 
      }" 
      :disabled="!selected.length"
      @click="batchEdit"
    >
      批量编辑
    </el-button>
    
    <el-button v-permi="'system:user:export'" @click="exportData">
      导出
    </el-button>
  </div>
</template>
```

### 条件渲染复杂组件

```vue
<template>
  <div class="dashboard">
    <!-- 管理员仪表板 -->
    <div v-admin class="admin-dashboard">
      <StatCard v-permi="'system:stat:user'" title="用户统计" />
      <StatCard v-permi="'system:stat:order'" title="订单统计" />
      <ChartComponent v-permi="'system:chart:view'" />
    </div>
    
    <!-- 普通用户界面 -->
    <div v-no-admin class="user-dashboard">
      <UserProfile />
      <RecentOrders v-permi="'user:order:list'" />
    </div>
    
    <!-- 租户特定功能 -->
    <TenantManagement v-tenant="'tenant:manage:all'" />
  </div>
</template>
```

## API 参考

### 指令值类型

```typescript
// 基础指令值
type PermissionValue = string | string[]
type RoleValue = string | string[]

// 租户指令值
type TenantValue = string | string[] | {
  permi: string | string[]
  tenantId: string
}

// Auth指令值
type AuthValue = {
  permi?: string | string[]  // 权限检查
  role?: string | string[]   // 角色检查
  action?: 'remove' | 'hide' | 'disable' | 'class'  // 处理动作
  className?: string         // 自定义类名
}
```

### 错误处理

所有指令都包含完善的错误处理：

```javascript
// 权限值不能为空
throw new Error('权限值不能为空')

// 角色值不能为空  
throw new Error('角色值不能为空')

// 数组类型验证
throw new Error('权限值必须为数组')

// Auth指令格式验证
throw new Error('权限值格式不正确')
throw new Error('必须指定 permi 或 role')
```

## 注意事项

1. **性能考虑**：指令会在元素挂载时进行权限检查，对于大量元素建议在父级进行控制

2. **响应式更新**：当前指令不会响应权限变化，如需动态更新请使用计算属性配合 `v-if`

3. **嵌套使用**：避免在同一元素上使用多个权限指令，可能导致意外行为

4. **DOM操作**：`remove` 动作会从DOM中移除元素，无法恢复

5. **事件处理**：`disable` 动作会阻止元素的点击事件，但不影响其他事件

## 最佳实践

1. **优先使用基础指令**：大多数场景使用 `v-permi` 和 `v-role` 即可满足需求

2. **合理选择动作**：根据UI需求选择合适的处理方式（移除/隐藏/禁用）

3. **避免过度使用**：对于复杂的权限逻辑，考虑在组件内部使用 `useAuth` 钩子

4. **保持一致性**：在同一项目中保持权限命名和使用方式的一致性

5. **测试覆盖**：确保不同权限状态下的UI表现符合预期
