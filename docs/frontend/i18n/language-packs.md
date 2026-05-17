# 语言包管理

## 介绍

语言包是国际化系统的核心组成部分，负责存储和组织多语言翻译文本。RuoYi-Plus 前端框架采用模块化的结构设计语言包，将翻译内容按功能模块分类，便于维护和扩展。

**核心特性:**

- **模块化组织** - 按功能模块分类翻译内容，包括按钮、弹窗、消息、菜单等多个模块
- **树形结构** - 支持多级嵌套的翻译键，如 `menu.system.log.operLog`
- **类型安全** - 导出 TypeScript 类型定义，提供完整的自动补全和类型检查
- **动态参数** - 支持在翻译文本中使用 `{param}` 占位符实现动态内容
- **Element Plus 集成** - 自动合并 Element Plus 组件库的语言包
- **双语言支持** - 内置中文(zh_CN)和英文(en_US)两套完整语言包

## 语言包架构

### 目录结构

语言包相关文件位于 `src/locales/` 目录下:

```text
src/locales/
├── i18n.ts          # i18n 实例配置
├── zh_CN.ts         # 中文语言包
└── en_US.ts         # 英文语言包
```

### 语言代码枚举

系统使用 `LanguageCode` 枚举定义支持的语言:

```typescript
// src/systemConfig.ts
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

### i18n 实例配置

i18n 实例的创建和配置:

```typescript
// src/locales/i18n.ts
import { createI18n } from 'vue-i18n'
import zh_CN from '@/locales/zh_CN'
import en_US from '@/locales/en_US'
import el_en from 'element-plus/es/locale/lang/en'
import el_zhCn from 'element-plus/es/locale/lang/zh-cn'
import { LanguageCode } from '@/systemConfig'

/**
 * 获取当前语言
 * @description 从布局状态中获取用户设置的语言
 */
export const getLanguage = (): LanguageCode => {
  const layout = useLayout()
  if (layout.language.value) {
    return layout.language.value
  }
  return LanguageCode.zh_CN
}

/**
 * 创建 i18n 实例
 */
const i18n = createI18n({
  globalInjection: true, // 全局注入 $t, $d 等方法
  allowComposition: true, // 允许组合式 API
  legacy: false,          // 使用 Vue 3 Composition API 模式
  locale: getLanguage(),  // 设置当前语言
  messages: {
    zh_CN: {
      ...zh_CN,
      ...el_zhCn  // 合并 Element Plus 中文语言包
    },
    en_US: {
      ...en_US,
      ...el_en   // 合并 Element Plus 英文语言包
    }
  }
})

export default i18n

// 导出语言包类型，用于类型检查
export type LanguageType = typeof zh_CN
```

**配置说明:**

| 配置项 | 类型 | 说明 |
|-------|------|------|
| `globalInjection` | `boolean` | 全局注入 `$t`、`$d` 等方法到模板 |
| `allowComposition` | `boolean` | 允许使用 Composition API |
| `legacy` | `boolean` | 设为 false 使用 Vue 3 模式 |
| `locale` | `string` | 当前激活的语言 |
| `messages` | `object` | 语言包消息对象 |

## 中文语言包

### 完整结构

位置: `src/locales/zh_CN.ts`

```typescript
export default {
  // ==================== 顶层通用翻译 ====================
  '操作': '操作',
  '新增': '新增',
  '修改': '修改',
  '删除': '删除',
  '导出': '导出',
  '导入': '导入',
  '确定': '确定',
  '取消': '取消',
  '启用': '启用',
  '停用': '停用',
  '成功': '成功',
  '是否确认': '是否确认',
  '折叠': '折叠',
  '展开': '展开',
  '共': '共',
  '条': '条',
  '搜索': '搜索...',
  '是否确认删除': '是否确认删除下列数据:',
  '请先保存主表': '请先保存主表信息后，子表功能将自动开启',

  // ==================== 按钮权限系统 ====================
  button: {
    // 通用按钮
    query: '查询',
    add: '新增',
    update: '修改',
    delete: '删除',
    export: '导出',
    import: '导入',
    list: '列表',
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    upload: '上传',
    download: '下载',
    preview: '预览',
    view: '查看',
    generate: '生成',
    more: '更多',
    downloadTemplate: '下载模板',
    importData: '导入数据',
    exportData: '导出数据',
    collapse: '收起',
    expand: '展开',
    close: '关闭',
    sync: '同步',

    // 系统管理特殊按钮
    resetPwd: '重置密码',
    unlock: '账户解锁',
    clean: '清空',
    refreshCache: '刷新缓存',
    syncTenantRoles: '同步租户角色',
    syncTenantDicts: '同步租户字典',
    syncTenantConfigs: '同步租户参数配置',
    unbind: '解绑',

    // 监控特殊按钮
    batchLogout: '批量强退',
    forceLogout: '单条强退',

    // 开发工具特殊按钮
    importCode: '导入代码',
    previewCode: '预览代码',
    generateCode: '生成代码'
  },

  // ==================== 弹窗提示 ====================
  dialog: {
    add: '新增',
    edit: '修改',
    delete: '删除',
    query: '查询',
    detail: '详情',
    import: '导入',
    export: '导出',
    config: '配置'
  },

  // ==================== 消息提示 ====================
  message: {
    operation: '操作',

    // 操作确认类消息
    confirmDelete: '是否确认删除下列数据:',
    confirmCancel: '是否确认取消操作?',
    confirmSubmit: '是否确认提交?',
    confirm: '是否确认',
    enable: '启用',
    disable: '禁用',

    // 操作结果类消息
    success: '操作成功',
    error: '操作失败',

    // 具体操作结果消息
    saveSuccess: '保存成功',
    saveError: '保存失败',
    addSuccess: '新增成功',
    addError: '新增失败',
    updateSuccess: '修改成功',
    updateError: '修改失败',
    deleteSuccess: '删除成功',
    deleteError: '删除失败',
    importSuccess: '导入成功',
    importError: '导入失败',
    exportSuccess: '导出成功',
    exportError: '导出失败',
    confirmCleanAll: '确认删除所有数据?',
    confirmUnlock: '确认账户解锁 ',
    unlockSuccess: '账户解锁成功 ',
    unbindSuccess: '解绑成功',

    // 提示类消息
    noData: '暂无数据',
    invalidParams: '参数无效',
    networkError: '网络错误，请稍后重试',
    unauthorized: '您没有操作权限',
    sessionExpired: '会话已过期，请重新登录',

    saveMainFirst: '请先保存主表信息后，子表功能将自动开启',
    total: '共',
    items: '条',
    search: '搜索...',

    confirmForceLogout: '确认强制退出',
    confirmBatchForceLogout: '确认批量强制退出'
  },

  // ==================== 占位符 ====================
  placeholder: {
    input: '请输入',
    select: '请选择'
  },

  // ==================== 工具提示 ====================
  tooltip: {
    showSearch: '显示搜索',
    print: '打印',
    hideSearch: '隐藏搜索',
    resetSearch: '重置搜索',
    refresh: '刷新',
    columns: '显示/隐藏列',
    columnSettings: '列设置'
  },

  // ==================== 列设置 ====================
  columnSettings: {
    title: '列设置',
    reset: '重置',
    dragHint: '拖拽可排序',
    resetSuccess: '列配置已重置'
  },

  // ==================== 路由标题 ====================
  route: {
    dashboard: '首页',
    document: '项目文档'
  },

  // ==================== 尺寸标签 ====================
  label: {
    large: '较大',
    default: '默认',
    small: '较小'
  },

  // ==================== 登录页面 ====================
  login: {
    selectPlaceholder: '请选择/输入公司名称',
    tenantId: '租户id',
    userName: '用户名',
    password: '密码',
    login: '登 录',
    logging: '登 录 中...',
    code: '验证码',
    rememberPassword: '记住我',
    switchRegisterPage: '立即注册',

    // 左侧品牌展示
    leftView: {
      title: '欢迎使用',
      subtitle: '简洁、高效、现代化的管理系统'
    },

    // 表单验证规则
    rule: {
      tenantId: { required: '请输入您的租户id' },
      userName: { required: '请输入您的账号' },
      password: { required: '请输入您的密码' },
      code: { required: '请输入验证码' }
    },

    // 第三方登录方式
    social: {
      wechat_open: '微信开放平台',
      wechat_mp: '微信公众号',
      wechat_enterprise: '企业微信',
      dingtalk: '钉钉',
      maxkey: 'MaxKey',
      topiam: 'TopIAM',
      qq: 'QQ',
      weibo: '微博',
      gitee: 'Gitee',
      github: 'GitHub',
      gitlab: 'GitLab',
      baidu: '百度',
      csdn: 'CSDN',
      coding: 'Coding',
      oschina: '开源中国',
      alipay_wallet: '支付宝',
      taobao: '淘宝',
      douyin: '抖音',
      linkedin: 'LinkedIn',
      microsoft: 'Microsoft',
      renren: '人人网',
      stack_overflow: 'Stack Overflow',
      huawei: '华为',
      aliyun: '阿里云',
      gitea: 'Gitea'
    }
  },

  // ==================== 注册页面 ====================
  register: {
    selectPlaceholder: '请选择/输入公司名称',
    userName: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    register: '注 册',
    registering: '注 册 中...',
    registerSuccess: '恭喜你，您的账号 {userName} 注册成功！',
    code: '验证码',
    hasAccount: '已有账号？',
    switchLoginPage: '立即登录',
    subtitle: '创建您的账户',

    // 表单验证规则（包含动态参数）
    rule: {
      tenantId: { required: '请输入您的租户id' },
      userName: {
        required: '请输入您的账号',
        length: '用户账号长度必须介于 {min} 和 {max} 之间'
      },
      password: {
        required: '请输入您的密码',
        length: '用户密码长度必须介于 {min} 和 {max} 之间',
        pattern: '不能包含非法字符：{strings}'
      },
      code: { required: '请输入验证码' },
      confirmPassword: {
        required: '请再次输入您的密码',
        equalToPassword: '两次输入的密码不一致'
      }
    }
  },

  // ==================== 导航栏 ====================
  navbar: {
    searchMenu: '搜索菜单',
    full: '全屏',
    exitFull: '退出全屏',
    language: '语言',
    dashboard: '首页',
    document: '项目文档',
    message: '消息',
    git: '仓库地址',
    layoutSize: '布局大小',
    sizeChangeSuccess: '布局大小切换成功',
    selectTenant: '选择租户',
    layoutSetting: '布局设置',
    personalCenter: '个人中心',
    logout: '退出登录',
    aiChat: 'AI助手'
  },

  // ==================== 页签操作 ====================
  tagsView: {
    refresh: '刷新页面',
    closeCurrent: '关闭当前',
    closeOthers: '关闭其他',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '全部关闭'
  },

  // ==================== 菜单系统 ====================
  menu: {
    index: '首页',

    // 系统管理模块
    system: {
      _self: '系统管理',
      user: '用户管理',
      role: '角色管理',
      menu: '菜单管理',
      dept: '部门管理',
      post: '岗位管理',
      dict: '字典管理',
      config: '参数设置',
      notice: '通知公告',
      log: {
        _self: '日志管理',
        operLog: '操作日志',
        loginLog: '登录日志'
      },
      oss: '文件管理',
      sysOssDirectory: 'OSS目录'
    },

    // 系统监控模块
    monitor: {
      _self: '系统监控',
      online: '在线用户',
      cache: '缓存监控',
      admin: 'admin监控',
      snailjob: '任务调度'
    },

    // 系统工具模块
    tool: {
      _self: '系统工具',
      gen: '代码生成'
    },

    // 租户管理模块
    tenant: {
      _self: '租户管理',
      tenant: '租户管理',
      tenantPackage: '租户套餐'
    },

    // 应用配置模块
    appConfiguration: {
      _self: 'APP配置',
      appConfig: '多端配置'
    },

    // 工作流模块
    workflow: {
      _self: '工作流',
      category: '流程分类',
      processDefinition: '流程定义',
      monitor: {
        _self: '流程监控',
        processInstance: '流程实例',
        allTaskWaiting: '待办任务'
      }
    },

    // 任务管理模块
    task: {
      _self: '我的任务',
      myDocument: '我发起的',
      taskWaiting: '我的待办',
      allTaskWaiting: '待办任务',
      taskFinish: '我的已办',
      taskCopyList: '我的抄送'
    },

    // 商城管理
    mallManage: {
      _self: '商城管理'
    }
  }
}
```

## 英文语言包

### 完整结构

位置: `src/locales/en_US.ts`

英文语言包与中文语言包保持完全相同的结构，仅翻译内容不同:

```typescript
export default {
  // ==================== 顶层通用翻译 ====================
  '操作': 'Operation',
  '新增': 'Add ',
  '修改': 'Edit ',
  '删除': 'Delete',
  '导出': 'Export',
  '导入': 'Import',
  '确定': 'Confirm',
  '取消': 'Cancel',
  '启用': 'Enable',
  '停用': 'Disable',
  '成功': 'Success',
  '是否确认': 'Confirm ',
  '折叠': 'Collapse',
  '展开': 'Expand',
  '共': 'Total ',
  '条': ' items',
  '搜索': 'Search...',
  '是否确认删除': 'Confirm delete the following:',
  '请先保存主表': 'Please save the main table first',

  // ==================== 按钮权限系统 ====================
  button: {
    query: 'Query',
    add: 'Add',
    update: 'Edit',
    delete: 'Delete',
    export: 'Export',
    import: 'Import',
    list: 'List ',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    upload: 'Upload',
    download: 'Download',
    preview: 'Preview',
    view: 'View',
    generate: 'Generate',
    more: 'More',
    downloadTemplate: 'Download Template',
    importData: 'Import Data',
    exportData: 'Export Data',
    collapse: 'Collapse',
    expand: 'Expand',
    close: 'Close',
    sync: 'Sync',

    resetPwd: 'Reset Password',
    unlock: 'Unlock Account',
    clean: 'Clean',
    refreshCache: 'Refresh Cache',
    syncTenantRoles: 'Sync Tenant Roles',
    syncTenantDicts: 'Sync Tenant Dicts',
    syncTenantConfigs: 'Sync Tenant Configs',
    unbind: 'Unbind',

    batchLogout: 'Batch Logout',
    forceLogout: 'Force Logout',

    importCode: 'Import Code',
    previewCode: 'Preview Code',
    generateCode: 'Generate Code'
  },

  // ==================== 弹窗提示 ====================
  dialog: {
    add: 'Add ',
    edit: 'Edit ',
    delete: 'Delete',
    query: 'Query',
    detail: 'Details',
    import: 'Import',
    export: 'Export',
    config: 'Configure'
  },

  // ==================== 消息提示 ====================
  message: {
    operation: 'Operation',

    confirmDelete: 'Confirm delete the following:',
    confirmCancel: 'Confirm cancel?',
    confirmSubmit: 'Confirm submit?',
    confirm: 'Confirm ',
    enable: 'Enable ',
    disable: 'Disable ',

    success: 'Operation successful',
    error: 'Operation failed',

    saveSuccess: 'Save successful',
    saveError: 'Save failed',
    addSuccess: 'Added successfully',
    addError: 'Add failed',
    updateSuccess: 'Update successful',
    updateError: 'Update failed',
    deleteSuccess: 'Delete successful',
    deleteError: 'Delete failed',
    importSuccess: 'Import successful',
    importError: 'Import failed',
    exportSuccess: 'Export successful',
    exportError: 'Export failed',
    confirmCleanAll: 'Confirm clear all data?',
    confirmUnlock: 'Confirm unlock account ',
    unlockSuccess: 'Account unlocked successfully',
    unbindSuccess: 'Unbind successfully',

    noData: 'No data available',
    invalidParams: 'Invalid parameters',
    networkError: 'Network error, please try again later',
    unauthorized: 'You do not have permission',
    sessionExpired: 'Session expired, please log in again',

    saveMainFirst: 'Please save the main table first',
    total: 'Total',
    items: 'items',
    search: 'Search...',

    confirmForceLogout: 'Confirm force logout ',
    confirmBatchForceLogout: 'Confirm batch force logout'
  },

  // ... 其他模块类似结构
}
```

## 语言包模块详解

### button 模块

按钮文本翻译，与权限系统集成:

```typescript
button: {
  // ===== 通用操作按钮 =====
  query: '查询',      // 列表查询
  add: '新增',        // 新增记录
  update: '修改',     // 修改记录
  delete: '删除',     // 删除记录
  export: '导出',     // 导出数据
  import: '导入',     // 导入数据
  save: '保存',       // 保存表单
  cancel: '取消',     // 取消操作

  // ===== 文件操作按钮 =====
  upload: '上传',
  download: '下载',
  preview: '预览',
  downloadTemplate: '下载模板',
  importData: '导入数据',
  exportData: '导出数据',

  // ===== 系统管理按钮 =====
  resetPwd: '重置密码',
  unlock: '账户解锁',
  clean: '清空',
  refreshCache: '刷新缓存',
  syncTenantRoles: '同步租户角色',
  syncTenantDicts: '同步租户字典',
  syncTenantConfigs: '同步租户参数配置',

  // ===== 监控操作按钮 =====
  batchLogout: '批量强退',
  forceLogout: '单条强退',

  // ===== 开发工具按钮 =====
  importCode: '导入代码',
  previewCode: '预览代码',
  generateCode: '生成代码'
}
```

**使用示例:**

```vue
<template>
  <el-button type="primary" @click="handleAdd">
    {{ t('button.add') }}
  </el-button>
  <el-button type="danger" @click="handleDelete">
    {{ t('button.delete') }}
  </el-button>
</template>

<script lang="ts" setup>
const { t } = useI18n()
</script>
```

### message 模块

消息提示翻译，包括确认、成功、失败等各类消息:

```typescript
message: {
  // ===== 操作确认消息 =====
  confirmDelete: '是否确认删除下列数据:',
  confirmCancel: '是否确认取消操作?',
  confirmSubmit: '是否确认提交?',
  confirm: '是否确认',

  // ===== 操作结果消息 =====
  success: '操作成功',
  error: '操作失败',
  saveSuccess: '保存成功',
  addSuccess: '新增成功',
  updateSuccess: '修改成功',
  deleteSuccess: '删除成功',
  importSuccess: '导入成功',
  exportSuccess: '导出成功',

  // ===== 错误提示消息 =====
  noData: '暂无数据',
  invalidParams: '参数无效',
  networkError: '网络错误，请稍后重试',
  unauthorized: '您没有操作权限',
  sessionExpired: '会话已过期，请重新登录'
}
```

**使用示例:**

```typescript
import { showMsgSuccess, showMsgError, showConfirm } from '@/utils/modal'

// 显示成功消息
showMsgSuccess(t('message.saveSuccess'))

// 显示确认对话框
showConfirm(t('message.confirmDelete') + userName).then(() => {
  // 确认后执行删除
})
```

### menu 模块

菜单系统翻译，采用树形结构支持多级嵌套:

```typescript
menu: {
  index: '首页',

  // 系统管理模块 - 使用 _self 表示父级名称
  system: {
    _self: '系统管理',      // 父菜单名称
    user: '用户管理',       // 子菜单
    role: '角色管理',
    menu: '菜单管理',
    dept: '部门管理',
    post: '岗位管理',
    dict: '字典管理',
    config: '参数设置',
    notice: '通知公告',

    // 支持多级嵌套
    log: {
      _self: '日志管理',    // 二级父菜单
      operLog: '操作日志',  // 三级子菜单
      loginLog: '登录日志'
    },

    oss: '文件管理'
  },

  // 系统监控模块
  monitor: {
    _self: '系统监控',
    online: '在线用户',
    cache: '缓存监控',
    admin: 'admin监控',
    snailjob: '任务调度'
  },

  // 工作流模块
  workflow: {
    _self: '工作流',
    category: '流程分类',
    processDefinition: '流程定义',
    monitor: {
      _self: '流程监控',
      processInstance: '流程实例',
      allTaskWaiting: '待办任务'
    }
  }
}
```

**`_self` 约定说明:**

- `_self` 是一个特殊键名，用于表示父级菜单自身的名称
- 当菜单项是一个包含子菜单的对象时，使用 `_self` 定义该菜单项的显示名称
- 其他键名则表示该菜单下的子菜单

**使用示例:**

```typescript
// 获取系统管理菜单名称
const systemMenuName = t('menu.system._self') // '系统管理'

// 获取用户管理子菜单名称
const userMenuName = t('menu.system.user') // '用户管理'

// 获取三级菜单名称
const operLogName = t('menu.system.log.operLog') // '操作日志'
```

### login/register 模块

登录注册页面翻译，包含表单验证规则和第三方登录:

```typescript
login: {
  userName: '用户名',
  password: '密码',
  login: '登 录',
  logging: '登 录 中...',
  code: '验证码',
  rememberPassword: '记住我',

  // 品牌展示区
  leftView: {
    title: '欢迎使用',
    subtitle: '简洁、高效、现代化的管理系统'
  },

  // 表单验证规则
  rule: {
    tenantId: { required: '请输入您的租户id' },
    userName: { required: '请输入您的账号' },
    password: { required: '请输入您的密码' },
    code: { required: '请输入验证码' }
  },

  // 第三方登录（支持 25+ 种社交登录）
  social: {
    wechat_open: '微信开放平台',
    wechat_mp: '微信公众号',
    wechat_enterprise: '企业微信',
    dingtalk: '钉钉',
    qq: 'QQ',
    github: 'GitHub',
    gitee: 'Gitee',
    alipay_wallet: '支付宝',
    // ... 更多社交登录
  }
}

register: {
  userName: '用户名',
  password: '密码',
  confirmPassword: '确认密码',
  register: '注 册',
  // 支持动态参数的成功消息
  registerSuccess: '恭喜你，您的账号 {userName} 注册成功！',

  // 带动态参数的验证规则
  rule: {
    userName: {
      required: '请输入您的账号',
      length: '用户账号长度必须介于 {min} 和 {max} 之间'
    },
    password: {
      required: '请输入您的密码',
      length: '用户密码长度必须介于 {min} 和 {max} 之间',
      pattern: '不能包含非法字符：{strings}'
    },
    confirmPassword: {
      required: '请再次输入您的密码',
      equalToPassword: '两次输入的密码不一致'
    }
  }
}
```

### tagsView 模块

标签页操作翻译:

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

### navbar 模块

导航栏翻译:

```typescript
navbar: {
  searchMenu: '搜索菜单',
  full: '全屏',
  exitFull: '退出全屏',
  language: '语言',
  dashboard: '首页',
  document: '项目文档',
  message: '消息',
  git: '仓库地址',
  layoutSize: '布局大小',
  sizeChangeSuccess: '布局大小切换成功',
  selectTenant: '选择租户',
  layoutSetting: '布局设置',
  personalCenter: '个人中心',
  logout: '退出登录',
  aiChat: 'AI助手'
}
```

## 动态参数

### 基本语法

语言包支持使用 `{param}` 占位符实现动态参数:

```typescript
// 语言包定义
register: {
  registerSuccess: '恭喜你，您的账号 {userName} 注册成功！',
  rule: {
    userName: {
      length: '用户账号长度必须介于 {min} 和 {max} 之间'
    }
  }
}
```

### 使用方式

```vue
<template>
  <div>
    <!-- 单个参数 -->
    {{ t('register.registerSuccess', { userName: 'admin' }) }}
    <!-- 输出: 恭喜你，您的账号 admin 注册成功！ -->

    <!-- 多个参数 -->
    {{ t('register.rule.userName.length', { min: 2, max: 20 }) }}
    <!-- 输出: 用户账号长度必须介于 2 和 20 之间 -->
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()
</script>
```

### 表单验证中使用

```typescript
const rules = reactive({
  userName: [
    {
      required: true,
      message: t('register.rule.userName.required'),
      trigger: 'blur'
    },
    {
      min: 2,
      max: 20,
      message: t('register.rule.userName.length', { min: 2, max: 20 }),
      trigger: 'blur'
    }
  ]
})
```

## 添加新语言包模块

### 步骤一: 定义中文翻译

在 `zh_CN.ts` 中添加新模块:

```typescript
export default {
  // ... 现有模块

  /** 订单模块 */
  order: {
    // 页面标题
    title: '订单管理',
    detail: '订单详情',

    // 字段翻译
    fields: {
      orderNo: '订单编号',
      userName: '用户名',
      totalAmount: '订单金额',
      status: '订单状态',
      createTime: '下单时间'
    },

    // 状态枚举
    status: {
      pending: '待支付',
      paid: '已支付',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消'
    },

    // 操作按钮
    actions: {
      ship: '发货',
      cancel: '取消订单',
      refund: '退款'
    },

    // 提示消息
    messages: {
      shipSuccess: '发货成功',
      cancelConfirm: '确认取消订单 {orderNo}？',
      refundSuccess: '退款成功，金额 {amount} 元'
    }
  }
}
```

### 步骤二: 添加英文翻译

在 `en_US.ts` 中添加对应翻译:

```typescript
export default {
  // ... 现有模块

  /** Order Module */
  order: {
    title: 'Order Management',
    detail: 'Order Details',

    fields: {
      orderNo: 'Order No.',
      userName: 'User Name',
      totalAmount: 'Total Amount',
      status: 'Status',
      createTime: 'Order Time'
    },

    status: {
      pending: 'Pending',
      paid: 'Paid',
      shipped: 'Shipped',
      completed: 'Completed',
      cancelled: 'Cancelled'
    },

    actions: {
      ship: 'Ship',
      cancel: 'Cancel Order',
      refund: 'Refund'
    },

    messages: {
      shipSuccess: 'Shipped successfully',
      cancelConfirm: 'Confirm cancel order {orderNo}?',
      refundSuccess: 'Refund successful, amount {amount}'
    }
  }
}
```

### 步骤三: 使用新模块

```vue
<template>
  <div class="order-page">
    <h1>{{ t('order.title') }}</h1>

    <el-table :data="orders">
      <el-table-column :label="t('order.fields.orderNo')" prop="orderNo" />
      <el-table-column :label="t('order.fields.userName')" prop="userName" />
      <el-table-column :label="t('order.fields.totalAmount')" prop="totalAmount" />
      <el-table-column :label="t('order.fields.status')" prop="status">
        <template #default="{ row }">
          {{ t(`order.status.${row.status}`) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('button.operation')">
        <template #default="{ row }">
          <el-button @click="handleShip(row)">
            {{ t('order.actions.ship') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

const handleShip = (row: OrderItem) => {
  // 发货逻辑
  showMsgSuccess(t('order.messages.shipSuccess'))
}

const handleCancel = (row: OrderItem) => {
  showConfirm(t('order.messages.cancelConfirm', { orderNo: row.orderNo }))
    .then(() => {
      // 取消订单逻辑
    })
}
</script>
```

## 类型定义

### 语言包类型导出

```typescript
// src/locales/i18n.ts
export type LanguageType = typeof zh_CN
```

### 翻译键类型

框架提供了 `ObjKeysToUnion` 工具类型，将嵌套对象的键转换为联合类型:

```typescript
// src/composables/useI18n.ts
export type ObjKeysToUnion<T, Depth extends number[] = [0, 1, 2, 3]> =
  Depth['length'] extends 4
    ? never
    : T extends object
      ? {
          [K in keyof T]: `${K & string}${T[K] extends object
            ? `.${ObjKeysToUnion<T[K], [...Depth, 0]>}`
            : ''}`
        }[keyof T]
      : never
```

**类型转换示例:**

```typescript
// 输入类型
type Input = {
  a: string
  b: {
    ba: string
    bb: number
  }
}

// 输出联合类型
type Output = 'a' | 'b.ba' | 'b.bb'
```

### 使用类型提示

```typescript
import type { LanguageType } from '@/locales/i18n'
import type { ObjKeysToUnion } from '@/composables/useI18n'

// 获取所有可用的翻译键
type TranslationKeys = ObjKeysToUnion<LanguageType>

// 使用时会有类型提示
const { t } = useI18n()
t('button.add')       // ✅ 正确
t('button.xxx')       // ❌ 类型错误提示
t('menu.system.user') // ✅ 正确
```

## 增强翻译函数

### 多语言字段翻译

useI18n 提供增强的 `t` 函数，支持多种翻译方式:

```typescript
const { t } = useI18n()

// 1. 传统 i18n 键名方式
t('button.add')  // 根据当前语言返回翻译

// 2. 简单双语方式: t(英文, 中文)
t('UserName', '用户名')
// 英文环境返回 'UserName'
// 中文环境返回 '用户名'

// 3. 字段信息对象方式
t('', { field: 'UserName', comment: '用户名' })
// 英文环境优先返回 field
// 中文环境优先返回 comment

// 4. 语言特定翻译
import { LanguageCode } from '@/systemConfig'
t('', {
  [LanguageCode.zh_CN]: '用户名',
  [LanguageCode.en_US]: 'User Name'
})

// 5. 混合使用
t('', {
  field: 'UserName',
  comment: '用户名(默认)',
  [LanguageCode.zh_CN]: '用户名(中文优先)'
})
```

### 在表格列中使用

```vue
<template>
  <el-table :data="tableData">
    <!-- 方式一: 传统 i18n 键 -->
    <el-table-column :label="t('user.userName')" prop="userName" />

    <!-- 方式二: 简单双语 -->
    <el-table-column :label="t('UserName', '用户名')" prop="userName" />

    <!-- 方式三: 字段信息对象 -->
    <el-table-column
      :label="t('', { field: 'NickName', comment: '昵称' })"
      prop="nickName"
    />

    <!-- 方式四: 语言特定 -->
    <el-table-column
      :label="t('', {
        [LanguageCode.zh_CN]: '手机号码',
        [LanguageCode.en_US]: 'Phone Number'
      })"
      prop="phone"
    />
  </el-table>
</template>
```

## 语言切换

### LangSelect 组件

系统提供 `LangSelect` 组件用于语言切换:

```vue
<template>
  <LangSelect />
</template>

<script lang="ts" setup>
import LangSelect from '@/layouts/components/Navbar/tools/LangSelect.vue'
</script>
```

**组件属性:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showTooltip` | `boolean` | `true` | 是否显示提示框 |
| `showAnimate` | `boolean` | `true` | 是否显示动画效果 |
| `showBackground` | `boolean` | `true` | 是否显示背景悬停效果 |

### 编程式切换

```typescript
const { setLanguage, currentLanguage, isChinese, isEnglish } = useI18n()

// 切换到英文
setLanguage(LanguageCode.en_US)

// 切换到中文
setLanguage(LanguageCode.zh_CN)

// 检查当前语言
if (isChinese.value) {
  console.log('当前是中文环境')
}

// 获取当前语言代码
console.log(currentLanguage.value) // 'zh_CN' 或 'en_US'
```

## API 参考

### useI18n 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `t` | `Function` | 增强的翻译函数 |
| `locale` | `Ref<string>` | 当前语言（响应式） |
| `availableLocales` | `string[]` | 可用语言列表 |
| `fallbackLocale` | `string` | 备用语言 |
| `messages` | `object` | 所有语言消息 |
| `d` | `Function` | 日期格式化 |
| `n` | `Function` | 数字格式化 |
| `te` | `Function` | 检查翻译键是否存在 |
| `currentLanguage` | `Ref<LanguageCode>` | 当前语言代码 |
| `currentLanguageName` | `ComputedRef<string>` | 当前语言显示名称 |
| `languages` | `ComputedRef<string[]>` | 可用语言列表 |
| `isChinese` | `ComputedRef<boolean>` | 是否中文环境 |
| `isEnglish` | `ComputedRef<boolean>` | 是否英文环境 |
| `setLanguage` | `Function` | 设置语言 |
| `initLanguage` | `Function` | 初始化语言 |

### translateRouteTitle 函数

```typescript
import { translateRouteTitle } from '@/composables/useI18n'

// 翻译路由标题
const title = translateRouteTitle('dashboard') // '首页' 或 'Dashboard'
```

## 最佳实践

### 1. 保持结构一致

确保 `zh_CN.ts` 和 `en_US.ts` 的对象结构完全一致:

```typescript
// ✅ 正确 - 结构完全一致
// zh_CN.ts
button: { add: '新增', delete: '删除' }
// en_US.ts
button: { add: 'Add', delete: 'Delete' }

// ❌ 错误 - 结构不一致
// zh_CN.ts
button: { add: '新增', delete: '删除' }
// en_US.ts
button: { add: 'Add' }  // 缺少 delete
```

### 2. 使用模块化组织

按功能模块组织翻译内容，避免扁平化结构:

```typescript
// ✅ 推荐 - 模块化组织
export default {
  button: { add: '新增', delete: '删除' },
  message: { success: '成功', error: '失败' },
  user: {
    title: '用户管理',
    fields: { name: '姓名', email: '邮箱' }
  }
}

// ❌ 不推荐 - 扁平化
export default {
  buttonAdd: '新增',
  buttonDelete: '删除',
  messageSuccess: '成功',
  userTitle: '用户管理'
}
```

### 3. 添加注释说明

为每个模块添加清晰的注释:

```typescript
export default {
  /** 按钮权限系统 - 与权限指令配合使用 */
  button: {
    // 通用操作按钮
    query: '查询',
    add: '新增',

    // 系统管理特殊按钮
    resetPwd: '重置密码'
  },

  /** 消息提示 - 用于 showMsgSuccess/showMsgError */
  message: {
    // 操作确认类消息
    confirmDelete: '是否确认删除下列数据:',

    // 操作结果类消息
    success: '操作成功'
  }
}
```

### 4. 使用语义化键名

使用有意义的键名，便于理解和维护:

```typescript
// ✅ 推荐 - 语义化
message: {
  confirmDelete: '是否确认删除?',
  operationSuccess: '操作成功',
  networkError: '网络错误'
}

// ❌ 不推荐 - 无意义
message: {
  msg1: '是否确认删除?',
  msg2: '操作成功',
  msg3: '网络错误'
}
```

### 5. 避免硬编码文本

所有用户可见的文本都应使用国际化:

```vue
<!-- ✅ 推荐 -->
<el-button>{{ t('button.add') }}</el-button>
<el-message>{{ t('message.success') }}</el-message>

<!-- ❌ 不推荐 -->
<el-button>新增</el-button>
<el-message>操作成功</el-message>
```

## 常见问题

### 1. 翻译键不存在时显示键名

**问题描述:** 使用不存在的翻译键时，页面显示原始键名。

**原因分析:** 翻译键在语言包中未定义。

**解决方案:**

```typescript
// 1. 检查键是否存在
const { te, t } = useI18n()
if (te('some.key')) {
  return t('some.key')
} else {
  return '默认值'
}

// 2. 使用增强的 t 函数提供默认值
t('some.key', '默认值')
```

### 2. 语言切换后部分内容未更新

**问题描述:** 切换语言后，某些组件的文本没有更新。

**原因分析:** 文本在组件创建时计算，而非响应式绑定。

**解决方案:**

```typescript
// ❌ 错误 - 非响应式
const title = t('page.title')

// ✅ 正确 - 使用计算属性
const title = computed(() => t('page.title'))

// ✅ 正确 - 在模板中直接使用
// <h1>{{ t('page.title') }}</h1>
```

### 3. Element Plus 组件语言不同步

**问题描述:** 切换语言后，Element Plus 组件（如分页、日期选择器）仍显示旧语言。

**原因分析:** Element Plus 需要单独配置语言。

**解决方案:**

```vue
<template>
  <el-config-provider :locale="elementLocale">
    <App />
  </el-config-provider>
</template>

<script lang="ts" setup>
const { elementPlusLocale } = useLayout()
</script>
```

### 4. 动态参数不生效

**问题描述:** 翻译文本中的 `{param}` 没有被替换。

**原因分析:** 未正确传递参数对象。

**解决方案:**

```typescript
// 语言包定义
register: {
  success: '账号 {userName} 注册成功'
}

// ❌ 错误 - 未传递参数
t('register.success')  // 输出: 账号 {userName} 注册成功

// ✅ 正确 - 传递参数对象
t('register.success', { userName: 'admin' })  // 输出: 账号 admin 注册成功
```

### 5. 类型检查报错

**问题描述:** 使用翻译键时 TypeScript 报类型错误。

**原因分析:** 翻译键类型定义不完整或有误。

**解决方案:**

```typescript
// 方式一: 使用类型断言
t('custom.key' as any)

// 方式二: 确保键在语言包中定义
// 检查 zh_CN.ts 和 en_US.ts 中是否存在该键

// 方式三: 使用字符串模板
const key = `button.${action}` as ObjKeysToUnion<LanguageType>
t(key)
```

### 6. 嵌套键路径过深

**问题描述:** 多级嵌套的键路径难以管理。

**原因分析:** 语言包结构设计过于复杂。

**解决方案:**

```typescript
// ❌ 不推荐 - 嵌套过深
menu: {
  system: {
    log: {
      operLog: {
        detail: {
          title: '操作日志详情'
        }
      }
    }
  }
}

// ✅ 推荐 - 适度扁平化
menu: {
  system: { _self: '系统管理' },
  systemUser: '用户管理',
  systemLog: '日志管理',
  systemLogOper: '操作日志'
}
```

### 7. 第三方组件国际化

**问题描述:** 第三方组件不支持项目的国际化方案。

**解决方案:**

```vue
<template>
  <!-- 使用插槽覆盖默认文本 -->
  <ThirdPartyComponent>
    <template #empty>
      {{ t('message.noData') }}
    </template>
  </ThirdPartyComponent>

  <!-- 或使用 props 传递翻译文本 -->
  <ThirdPartyComponent
    :empty-text="t('message.noData')"
    :loading-text="t('message.loading')"
  />
</template>
```
