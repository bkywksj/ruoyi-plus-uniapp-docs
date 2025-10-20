# 语言包管理

## 概述

语言包是组织和管理多语言翻译的核心。框架采用模块化的结构组织语言包，便于维护和扩展。

## 语言包结构

### 中文语言包

位置：`src/locales/zh_CN.ts`

```typescript
export default {
  // 顶层通用翻译
  '操作': '操作',
  '新增': '新增',
  '修改': '修改',
  '删除': '删除',
  // ...

  /** 按钮权限系统 */
  button: {
    query: '查询',
    add: '新增',
    update: '修改',
    delete: '删除',
    export: '导出',
    // ...
  },

  /** 弹窗提示 */
  dialog: {
    add: '新增',
    edit: '修改',
    delete: '删除',
    // ...
  },

  /** 消息提示 */
  message: {
    confirmDelete: '是否确认删除下列数据:',
    success: '操作成功',
    error: '操作失败',
    // ...
  },

  /** 占位符 */
  placeholder: {
    input: '请输入',
    select: '请选择'
  },

  /** 工具提示 */
  tooltip: {
    showSearch: '显示搜索',
    print: '打印',
    refresh: '刷新',
    // ...
  },

  /** 路由国际化配置 */
  route: {
    dashboard: '首页',
    document: '项目文档'
  },

  /** 登录页面 */
  login: {
    userName: '用户名',
    password: '密码',
    login: '登 录',
    // 验证规则
    rule: {
      userName: { required: '请输入您的账号' },
      password: { required: '请输入您的密码' }
    },
    // 第三方登录
    social: {
      wechat_open: '微信开放平台',
      github: 'GitHub',
      // ...
    }
  },

  /** 注册页面 */
  register: {
    userName: '用户名',
    password: '密码',
    register: '注 册',
    // ...
  },

  /** 导航栏 */
  navbar: {
    searchMenu: '搜索菜单',
    full: '全屏',
    language: '语言',
    logout: '退出登录',
    // ...
  },

  /** 页签 */
  tagsView: {
    refresh: '刷新页面',
    closeCurrent: '关闭当前',
    closeOthers: '关闭其他',
    // ...
  },

  /** 菜单系统 */
  menu: {
    index: '首页',
    // 系统管理模块
    system: {
      _self: '系统管理',
      user: '用户管理',
      role: '角色管理',
      menu: '菜单管理',
      // 日志管理子模块
      log: {
        _self: '日志管理',
        operLog: '操作日志',
        loginLog: '登录日志'
      }
    },
    // 系统监控模块
    monitor: {
      _self: '系统监控',
      online: '在线用户',
      cache: '缓存监控'
    }
  }
}
```

### 英文语言包

位置：`src/locales/en_US.ts`

```typescript
export default {
  // 顶层通用翻译
  '操作': 'Operation',
  '新增': 'Add',
  '修改': 'Edit',
  '删除': 'Delete',
  // ...

  button: {
    query: 'Query',
    add: 'Add',
    update: 'Edit',
    delete: 'Delete',
    export: 'Export',
    // ...
  },

  dialog: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    // ...
  },

  // ... 其他模块对应英文翻译
}
```

## 语言包模块说明

### 通用翻译

顶层直接定义的翻译，用于快速访问常用词汇：

```typescript
'操作': '操作',
'新增': '新增',
'确定': '确定',
'取消': '取消'
```

### button 模块

按钮文本翻译，支持按钮权限系统：

```typescript
button: {
  // 通用按钮
  query: '查询',
  add: '新增',
  update: '修改',

  // 系统管理特殊按钮
  resetPwd: '重置密码',
  unlock: '账户解锁',

  // 监控特殊按钮
  batchLogout: '批量强退',

  // 开发工具特殊按钮
  generateCode: '生成代码'
}
```

### dialog 模块

对话框标题翻译：

```typescript
dialog: {
  add: '新增',
  edit: '修改',
  delete: '删除',
  detail: '详情',
  config: '配置'
}
```

### message 模块

消息提示翻译，包括确认、成功、失败等：

```typescript
message: {
  // 操作确认
  confirmDelete: '是否确认删除下列数据:',
  confirmSubmit: '是否确认提交?',

  // 操作结果
  success: '操作成功',
  addSuccess: '新增成功',
  updateSuccess: '修改成功',

  // 错误提示
  networkError: '网络错误，请稍后重试',
  unauthorized: '您没有操作权限'
}
```

### placeholder 模块

表单占位符翻译：

```typescript
placeholder: {
  input: '请输入',
  select: '请选择'
}
```

### tooltip 模块

工具提示翻译：

```typescript
tooltip: {
  showSearch: '显示搜索',
  hideSearch: '隐藏搜索',
  refresh: '刷新',
  print: '打印'
}
```

### route 模块

路由标题翻译：

```typescript
route: {
  dashboard: '首页',
  document: '项目文档'
}
```

### login / register 模块

登录注册页面翻译：

```typescript
login: {
  userName: '用户名',
  password: '密码',
  login: '登 录',

  // 嵌套的验证规则
  rule: {
    userName: { required: '请输入您的账号' },
    password: { required: '请输入您的密码' }
  },

  // 第三方登录
  social: {
    wechat_open: '微信开放平台',
    github: 'GitHub'
  }
}
```

### navbar 模块

导航栏翻译：

```typescript
navbar: {
  searchMenu: '搜索菜单',
  full: '全屏',
  exitFull: '退出全屏',
  language: '语言',
  logout: '退出登录'
}
```

### tagsView 模块

标签页操作翻译：

```typescript
tagsView: {
  refresh: '刷新页面',
  closeCurrent: '关闭当前',
  closeOthers: '关闭其他',
  closeLeft: '关闭左侧',
  closeRight: '关闭右侧',
  closeAll: '全部关闭'
}
```

### menu 模块

菜单系统翻译（树形结构）：

```typescript
menu: {
  index: '首页',

  // 使用 _self 表示父级菜单名称
  system: {
    _self: '系统管理',  // 父菜单
    user: '用户管理',   // 子菜单
    role: '角色管理',

    // 支持多级嵌套
    log: {
      _self: '日志管理',
      operLog: '操作日志',
      loginLog: '登录日志'
    }
  }
}
```

## 添加新的语言包模块

1. 在 `zh_CN.ts` 中添加新模块：

```typescript
export default {
  // ... 现有模块

  /** 新模块描述 */
  newModule: {
    field1: '字段1',
    field2: '字段2',
    nested: {
      field3: '嵌套字段3'
    }
  }
}
```

2. 在 `en_US.ts` 中添加对应的英文翻译：

```typescript
export default {
  // ... 现有模块

  newModule: {
    field1: 'Field 1',
    field2: 'Field 2',
    nested: {
      field3: 'Nested Field 3'
    }
  }
}
```

## 语言包类型导出

框架自动导出语言包类型，用于类型检查：

```typescript
// src/locales/i18n.ts
export type LanguageType = typeof zh_CN
```

## 注意事项

1. **保持结构一致**：确保 `zh_CN.ts` 和 `en_US.ts` 的对象结构完全一致
2. **使用注释**：为每个模块添加清晰的注释说明
3. **命名规范**：
   - 使用小驼峰命名法（camelCase）
   - 父级菜单使用 `_self` 表示自身名称
4. **动态参数**：支持在翻译文本中使用 `{param}` 占位符

## 相关文档

- [国际化配置](./i18n-config.md) - i18n 基础配置
- [组件国际化](./component-i18n.md) - 在组件中使用语言包
- [菜单国际化](./menu-i18n.md) - 菜单系统的国际化
