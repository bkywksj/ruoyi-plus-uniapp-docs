# 树形工具 (tree.ts)

树结构工具函数库，提供全面的树形数据结构处理工具，用于前端各种树形数据的操作和转换。

## 📖 概述

树形工具库提供以下核心功能：
- **构建树**：将平铺列表转换为嵌套树结构
- **查找节点**：在树中查找符合条件的节点
- **查找路径**：获取从根节点到目标节点的路径
- **过滤树**：根据条件过滤树节点
- **扁平化**：将树结构转换为一维数组
- **遍历树**：遍历并对每个节点执行操作
- **插入节点**：在树中指定位置插入节点
- **删除节点**：移除符合条件的节点
- **更新节点**：更新符合条件的节点
- **获取叶子**：获取所有叶子节点
- **计算深度**：获取树的最大深度

## 🏗️ 类型定义

### TreeNode 接口

```typescript
interface TreeNode {
  [key: string]: any
  children?: TreeNode[]
}
```

### TreeOptions 配置选项

```typescript
interface TreeOptions {
  /** ID字段名称，默认为 'id' */
  id?: string
  /** 父ID字段名称，默认为 'parentId' */
  parentId?: string
  /** 子节点字段名称，默认为 'children' */
  children?: string
  /** 深拷贝数据，默认为true */
  deepCopy?: boolean
}
```

## 🌳 构建树结构

### buildTree

将平铺列表转换为嵌套树结构。

```typescript
buildTree<T = TreeNode>(data: any[], options?: TreeOptions): T[]
```

**参数：**
- `data` - 源数据数组
- `options` - 配置选项

**返回值：**
- `T[]` - 树结构数据

**示例：**
```typescript
// 基本使用
const list = [
  { id: 1, name: '部门1', parentId: 0 },
  { id: 2, name: '部门2', parentId: 1 },
  { id: 3, name: '部门3', parentId: 1 },
  { id: 4, name: '部门4', parentId: 2 }
]

const tree = buildTree(list)
// 结果:
// [
//   {
//     id: 1, name: '部门1', parentId: 0,
//     children: [
//       { 
//         id: 2, name: '部门2', parentId: 1,
//         children: [
//           { id: 4, name: '部门4', parentId: 2, children: [] }
//         ]
//       },
//       { id: 3, name: '部门3', parentId: 1, children: [] }
//     ]
//   }
// ]

// 自定义字段名
const customList = [
  { itemId: 1, name: '部门1', pid: 0 },
  { itemId: 2, name: '部门2', pid: 1 }
]

const customTree = buildTree(customList, { 
  id: 'itemId', 
  parentId: 'pid' 
})
```

**使用场景：**
- 组织架构展示
- 菜单树构建
- 分类层级展示
- 评论回复树

## 🔍 查找节点

### findTreeNode

在树中查找符合条件的节点。

```typescript
findTreeNode<T = TreeNode>(
  tree: T[], 
  predicate: (node: T) => boolean, 
  options?: TreeOptions
): T | null
```

**参数：**
- `tree` - 树结构数据
- `predicate` - 判断函数
- `options` - 配置选项

**返回值：**
- `T | null` - 找到的节点或null

**示例：**
```typescript
const tree = buildTree(departmentList)

// 按ID查找
const node = findTreeNode(tree, node => node.id === 3)
console.log(node) // { id: 3, name: '部门3', ... }

// 按名称查找
const node2 = findTreeNode(tree, node => node.name === '研发部')

// 按条件查找
const activeNode = findTreeNode(tree, node => node.status === 'active')
```

### findTreeNodePath

获取从根节点到目标节点的路径。

```typescript
findTreeNodePath<T = TreeNode>(
  tree: T[], 
  predicate: (node: T) => boolean, 
  options?: TreeOptions
): T[]
```

**示例：**
```typescript
const tree = buildTree(departmentList)

// 查找ID为4的节点路径
const path = findTreeNodePath(tree, node => node.id === 4)
console.log(path)
// [
//   { id: 1, name: '部门1', ... },
//   { id: 2, name: '部门2', ... },
//   { id: 4, name: '部门4' }
// ]

// 面包屑导航生成
const breadcrumbs = path.map(node => node.name).join(' > ')
console.log(breadcrumbs) // "部门1 > 部门2 > 部门4"
```

## 🔧 树操作

### filterTree

根据条件过滤树结构。

```typescript
filterTree<T = TreeNode>(
  tree: T[], 
  predicate: (node: T) => boolean, 
  options?: TreeOptions
): T[]
```

**示例：**
```typescript
const tree = buildTree(departmentList)

// 过滤包含"销售"的部门
const filtered = filterTree(tree, node => {
  return node.name.includes('销售') || 
         node.children?.some(child => child.name.includes('销售'))
})

// 过滤激活状态的节点
const activeTree = filterTree(tree, node => node.status === 'active')
```

### flattenTree

将树结构转换为一维数组。

```typescript
flattenTree<T = TreeNode>(tree: T[], options?: TreeOptions): T[]
```

**示例：**
```typescript
const tree = buildTree(departmentList)
const flatArray = flattenTree(tree)

// 获取所有部门ID
const allIds = flatArray.map(item => item.id)

// 去除children字段的扁平化
const cleanArray = flatArray.map(({ children, ...rest }) => rest)
```

### traverseTree

遍历树结构并对每个节点执行操作。

```typescript
traverseTree<T = TreeNode>(
  tree: T[],
  callback: (node: T, parent: T | null, level: number) => void,
  options?: TreeOptions
): void
```

**示例：**
```typescript
const tree = buildTree(departmentList)

// 输出所有节点及其层级
traverseTree(tree, (node, parent, level) => {
  const indent = '  '.repeat(level)
  console.log(`${indent}${node.name} (Level ${level})`)
})

// 添加层级属性
traverseTree(tree, (node, parent, level) => {
  node.level = level
  node.path = parent ? `${parent.path}/${node.name}` : node.name
})
```

## ➕ 节点操作

### insertNode

向树中插入节点。

```typescript
insertNode<T = TreeNode>(
  tree: T[], 
  node: T, 
  parentId?: any, 
  options?: TreeOptions
): boolean
```

**示例：**
```typescript
let tree = buildTree(departmentList)

// 插入到指定父节点
const newNode = { id: 5, name: '新部门', parentId: 1 }
const success = insertNode(tree, newNode, 1)

// 插入为根节点
const rootNode = { id: 6, name: '总公司' }
insertNode(tree, rootNode, null)
```

### removeNode

从树中删除节点。

```typescript
removeNode<T = TreeNode>(
  tree: T[], 
  predicate: (node: T) => boolean, 
  options?: TreeOptions
): boolean
```

**示例：**
```typescript
let tree = buildTree(departmentList)

// 删除ID为3的节点
removeNode(tree, node => node.id === 3)

// 批量删除
removeNode(tree, node => [2, 3, 4].includes(node.id))

// 删除无效节点
removeNode(tree, node => !node.name || node.status === 'deleted')
```

### updateNode

更新树节点。

```typescript
updateNode<T = TreeNode>(
  tree: T[], 
  predicate: (node: T) => boolean, 
  updater: (node: T) => T, 
  options?: TreeOptions
): boolean
```

**示例：**
```typescript
let tree = buildTree(departmentList)

// 更新ID为3的节点
updateNode(
  tree,
  node => node.id === 3,
  node => ({ ...node, name: '销售部', status: 'active' })
)

// 批量更新节点状态
updateNode(
  tree,
  node => node.status === 'pending',
  node => ({ ...node, status: 'active', updatedAt: new Date() })
)
```

## 📊 树分析

### getLeafNodes

获取树中所有叶子节点。

```typescript
getLeafNodes<T = TreeNode>(tree: T[], options?: TreeOptions): T[]
```

**示例：**
```typescript
const tree = buildTree(departmentList)
const leaves = getLeafNodes(tree)

// 获取所有末级部门
console.log('末级部门:', leaves.map(leaf => leaf.name))

// 统计叶子节点数量
console.log('叶子节点数量:', leaves.length)
```

### getTreeDepth

计算树的最大深度。

```typescript
getTreeDepth<T = TreeNode>(tree: T[], options?: TreeOptions): number
```

**示例：**
```typescript
const tree = buildTree(departmentList)
const depth = getTreeDepth(tree)

console.log(`组织架构层级深度: ${depth}`)

// 根据深度调整UI显示
if (depth > 5) {
  console.warn('层级过深，考虑优化组织结构')
}
```

## 💡 实际应用场景

### 1. 组织架构管理

```typescript
class OrganizationManager {
  private orgTree: TreeNode[]
  
  constructor(departments: any[]) {
    this.orgTree = buildTree(departments)
  }
  
  // 获取部门路径
  getDepartmentPath(deptId: number): string {
    const path = findTreeNodePath(this.orgTree, node => node.id === deptId)
    return path.map(node => node.name).join(' > ')
  }
  
  // 获取下级部门
  getSubDepartments(deptId: number): TreeNode[] {
    const dept = findTreeNode(this.orgTree, node => node.id === deptId)
    return dept?.children || []
  }
  
  // 获取所有员工数量
  getTotalEmployeeCount(): number {
    let total = 0
    traverseTree(this.orgTree, (node) => {
      total += node.employeeCount || 0
    })
    return total
  }
  
  // 重组部门
  restructureDepartment(oldDeptId: number, newParentId: number) {
    const dept = findTreeNode(this.orgTree, node => node.id === oldDeptId)
    if (dept) {
      // 从原位置删除
      removeNode(this.orgTree, node => node.id === oldDeptId)
      // 插入到新位置
      insertNode(this.orgTree, dept, newParentId)
    }
  }
}
```

### 2. 菜单树管理

```typescript
class MenuTreeManager {
  private menuTree: TreeNode[]
  
  constructor(menuData: any[]) {
    this.menuTree = buildTree(menuData, {
      id: 'menuId',
      parentId: 'parentMenuId'
    })
  }
  
  // 根据权限过滤菜单
  filterMenuByPermission(permissions: string[]): TreeNode[] {
    return filterTree(this.menuTree, node => {
      return !node.permission || permissions.includes(node.permission)
    })
  }
  
  // 生成面包屑导航
  generateBreadcrumb(menuId: string): string[] {
    const path = findTreeNodePath(this.menuTree, node => node.menuId === menuId)
    return path.map(node => node.title)
  }
  
  // 获取当前菜单的兄弟菜单
  getSiblingMenus(menuId: string): TreeNode[] {
    const path = findTreeNodePath(this.menuTree, node => node.menuId === menuId)
    if (path.length < 2) return []
    
    const parent = path[path.length - 2]
    return parent.children?.filter(child => child.menuId !== menuId) || []
  }
  
  // 菜单排序
  sortMenus() {
    traverseTree(this.menuTree, (node) => {
      if (node.children) {
        node.children.sort((a, b) => (a.sort || 0) - (b.sort || 0))
      }
    })
  }
}
```

### 3. 文件树浏览器

```typescript
class FileTreeBrowser {
  private fileTree: TreeNode[]
  
  constructor(files: any[]) {
    this.fileTree = this.buildFileTree(files)
  }
  
  private buildFileTree(files: any[]): TreeNode[] {
    // 构建文件路径树
    const pathMap = new Map()
    
    files.forEach(file => {
      const pathParts = file.path.split('/')
      let currentPath = ''
      let currentLevel = pathMap
      
      pathParts.forEach((part, index) => {
        currentPath += (index > 0 ? '/' : '') + part
        
        if (!currentLevel.has(part)) {
          currentLevel.set(part, {
            name: part,
            path: currentPath,
            isFile: index === pathParts.length - 1,
            children: new Map()
          })
        }
        
        currentLevel = currentLevel.get(part).children
      })
    })
    
    return this.convertMapToTree(pathMap)
  }
  
  private convertMapToTree(map: Map<string, any>): TreeNode[] {
    const result: TreeNode[] = []
    
    for (const [key, value] of map) {
      const node: TreeNode = {
        name: value.name,
        path: value.path,
        isFile: value.isFile,
        children: this.convertMapToTree(value.children)
      }
      result.push(node)
    }
    
    return result
  }
  
  // 搜索文件
  searchFiles(keyword: string): TreeNode[] {
    return filterTree(this.fileTree, node => {
      return node.name.toLowerCase().includes(keyword.toLowerCase())
    })
  }
  
  // 获取文件夹大小
  getFolderSize(folderPath: string): number {
    const folder = findTreeNode(this.fileTree, node => node.path === folderPath)
    if (!folder || folder.isFile) return 0
    
    let totalSize = 0
    traverseTree([folder], (node) => {
      if (node.isFile) {
        totalSize += node.size || 0
      }
    })
    
    return totalSize
  }
}
```

### 4. 评论树系统

```typescript
class CommentTreeSystem {
  private commentTree: TreeNode[]
  
  constructor(comments: any[]) {
    this.commentTree = buildTree(comments, {
      id: 'commentId',
      parentId: 'replyTo'
    })
  }
  
  // 添加回复
  addReply(parentCommentId: number, reply: any) {
    reply.replyTo = parentCommentId
    reply.commentId = Date.now() // 临时ID生成
    reply.children = []
    
    insertNode(this.commentTree, reply, parentCommentId)
  }
  
  // 获取评论层级
  getCommentLevel(commentId: number): number {
    const path = findTreeNodePath(this.commentTree, node => node.commentId === commentId)
    return path.length - 1
  }
  
  // 获取热门评论（按点赞数排序）
  getHotComments(): TreeNode[] {
    const allComments = flattenTree(this.commentTree)
    return allComments
      .filter(comment => (comment.likes || 0) > 10)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
  }
  
  // 折叠长评论串
  collapseDeepComments(maxDepth: number = 5) {
    traverseTree(this.commentTree, (node, parent, level) => {
      if (level >= maxDepth) {
        node.collapsed = true
      }
    })
  }
  
  // 统计回复数量
  getReplyCount(commentId: number): number {
    const comment = findTreeNode(this.commentTree, node => node.commentId === commentId)
    if (!comment) return 0
    
    let count = 0
    traverseTree([comment], (node) => {
      if (node.commentId !== commentId) {
        count++
      }
    })
    
    return count
  }
}
```

## 🎨 Vue 组件集成

```vue
<template>
  <div class="tree-component">
    <div 
      v-for="node in treeData" 
      :key="node.id"
      class="tree-node"
    >
      <TreeNode 
        :node="node"
        :level="0"
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { buildTree, findTreeNode, updateNode } from '@/utils/tree'

// 递归树节点组件
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: Object,
    level: Number
  },
  emits: ['node-click', 'node-expand'],
  setup(props, { emit }) {
    const isExpanded = ref(true)
    
    const hasChildren = computed(() => {
      return props.node.children && props.node.children.length > 0
    })
    
    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value
      emit('node-expand', props.node, isExpanded.value)
    }
    
    const handleClick = () => {
      emit('node-click', props.node)
    }
    
    return {
      isExpanded,
      hasChildren,
      toggleExpand,
      handleClick
    }
  }
})

// 主组件逻辑
interface Props {
  data: any[]
  options?: TreeOptions
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({})
})

const treeData = computed(() => {
  return buildTree(props.data, props.options)
})

const handleNodeClick = (node: any) => {
  console.log('点击节点:', node)
}

const handleNodeExpand = (node: any, expanded: boolean) => {
  console.log('节点展开状态:', node.name, expanded)
}
</script>

<style scoped>
.tree-node {
  margin-left: v-bind('level * 20 + "px"');
}
</style>
```

## ⚡ 性能优化建议

### 1. 大数据量优化

```typescript
// 虚拟滚动树
class VirtualTreeRenderer {
  private visibleNodes: TreeNode[]
  private allNodes: TreeNode[]
  
  constructor(tree: TreeNode[]) {
    this.allNodes = flattenTree(tree)
    this.updateVisibleNodes()
  }
  
  updateVisibleNodes(scrollTop: number = 0, containerHeight: number = 500) {
    const itemHeight = 30
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 5,
      this.allNodes.length
    )
    
    this.visibleNodes = this.allNodes.slice(startIndex, endIndex)
  }
  
  getVisibleNodes(): TreeNode[] {
    return this.visibleNodes
  }
}
```

### 2. 懒加载

```typescript
class LazyTreeLoader {
  private loadedNodes = new Set<string>()
  
  async loadChildren(nodeId: string): Promise<TreeNode[]> {
    if (this.loadedNodes.has(nodeId)) {
      return []
    }
    
    const children = await this.fetchChildrenFromAPI(nodeId)
    this.loadedNodes.add(nodeId)
    
    return children
  }
  
  private async fetchChildrenFromAPI(nodeId: string): Promise<TreeNode[]> {
    const response = await fetch(`/api/tree-nodes/${nodeId}/children`)
    return response.json()
  }
}
```

## ⚠️ 注意事项

1. **循环引用**：确保数据中没有循环引用，可能导致无限递归
2. **性能考虑**：大量节点时考虑虚拟滚动或分页加载
3. **内存占用**：深拷贝会增加内存使用，根据需要选择
4. **数据一致性**：修改树结构时注意保持父子关系的一致性

## ❓ 常见问题

### 1. 树结构构建时出现节点丢失或重复

**问题描述：**

使用 `buildTree` 构建树结构时，发现部分节点丢失或出现重复节点。

```typescript
// 问题代码
const list = [
  { id: 1, name: '部门A', parentId: null },
  { id: 2, name: '部门B', parentId: 1 },
  { id: 3, name: '部门C', parentId: 1 },
  { id: 2, name: '部门D', parentId: 3 },  // ID重复
  { id: 5, name: '部门E', parentId: 999 } // 父节点不存在
]

const tree = buildTree(list)
// 结果：部门D覆盖了部门B，部门E丢失
```

**问题原因：**

- 数据中存在重复的 ID，后者会覆盖前者
- 父节点 ID 指向不存在的节点，导致该节点无法挂载
- 数据源存在脏数据或数据同步问题
- 没有对根节点的判断条件进行正确设置

**解决方案：**

```typescript
// ❌ 错误：直接构建可能丢失节点
const tree = buildTree(rawData)

// ✅ 正确：构建前进行数据校验和清洗
class SafeTreeBuilder<T extends { id: any; parentId: any }> {
  private idSet = new Set<any>()
  private parentIdSet = new Set<any>()
  private errors: TreeBuildError[] = []

  /**
   * 安全构建树结构
   */
  build(data: T[], options?: TreeOptions): {
    tree: T[]
    errors: TreeBuildError[]
    orphans: T[]
  } {
    // 第一遍扫描：收集所有 ID
    this.idSet.clear()
    this.parentIdSet.clear()
    this.errors = []

    const idField = options?.id || 'id'
    const parentIdField = options?.parentId || 'parentId'

    // 检测重复 ID
    const uniqueData: T[] = []
    const duplicates: T[] = []

    for (const item of data) {
      const id = item[idField]

      if (this.idSet.has(id)) {
        duplicates.push(item)
        this.errors.push({
          type: 'DUPLICATE_ID',
          message: `重复的ID: ${id}`,
          node: item
        })
      } else {
        this.idSet.add(id)
        uniqueData.push(item)
      }

      // 收集所有父节点 ID
      const parentId = item[parentIdField]
      if (parentId !== null && parentId !== undefined && parentId !== 0) {
        this.parentIdSet.add(parentId)
      }
    }

    // 检测孤儿节点（父节点不存在）
    const orphans: T[] = []
    const validData: T[] = []

    for (const item of uniqueData) {
      const parentId = item[parentIdField]

      // 根节点条件：parentId 为 null、undefined、0 或空字符串
      const isRootNode = parentId === null ||
                         parentId === undefined ||
                         parentId === 0 ||
                         parentId === ''

      if (!isRootNode && !this.idSet.has(parentId)) {
        orphans.push(item)
        this.errors.push({
          type: 'ORPHAN_NODE',
          message: `父节点不存在: parentId=${parentId}`,
          node: item
        })
      } else {
        validData.push(item)
      }
    }

    // 使用清洗后的数据构建树
    const tree = buildTree(validData, options)

    return {
      tree,
      errors: this.errors,
      orphans
    }
  }

  /**
   * 修复孤儿节点
   */
  repairOrphans(
    orphans: T[],
    strategy: 'attach_to_root' | 'discard' | 'create_parent'
  ): T[] {
    switch (strategy) {
      case 'attach_to_root':
        // 将孤儿节点挂载到根节点
        return orphans.map(item => ({
          ...item,
          parentId: null
        }))

      case 'create_parent':
        // 创建缺失的父节点
        const missingParents = new Set<any>()
        orphans.forEach(item => {
          if (!this.idSet.has(item.parentId)) {
            missingParents.add(item.parentId)
          }
        })

        const createdParents = Array.from(missingParents).map(parentId => ({
          id: parentId,
          name: `[自动创建] 节点 ${parentId}`,
          parentId: null,
          isAutoCreated: true
        }))

        return [...createdParents, ...orphans] as T[]

      case 'discard':
      default:
        return []
    }
  }
}

interface TreeBuildError {
  type: 'DUPLICATE_ID' | 'ORPHAN_NODE' | 'CIRCULAR_REF'
  message: string
  node: any
}

// 使用示例
const builder = new SafeTreeBuilder()
const { tree, errors, orphans } = builder.build(rawData)

if (errors.length > 0) {
  console.warn('树构建警告:', errors)
}

if (orphans.length > 0) {
  // 选择修复策略
  const repairedOrphans = builder.repairOrphans(orphans, 'attach_to_root')
  // 重新构建包含修复节点的树
  const { tree: fullTree } = builder.build([...rawData, ...repairedOrphans])
}
```

---

### 2. 深层嵌套树导致递归栈溢出

**问题描述：**

当树的层级非常深（如超过 1000 层）时，递归遍历可能导致栈溢出错误。

```typescript
// 问题代码
function deepTraverse(node: TreeNode): void {
  console.log(node.name)
  node.children?.forEach(child => deepTraverse(child))
}

// 当树深度超过浏览器调用栈限制时会报错
// Uncaught RangeError: Maximum call stack size exceeded
```

**问题原因：**

- JavaScript 引擎的调用栈大小有限（通常 10000-50000 帧）
- 递归算法每次调用都会占用一个栈帧
- 深度优先遍历在极端情况下会耗尽调用栈
- 尾调用优化在大多数浏览器中未完全实现

**解决方案：**

```typescript
// ❌ 错误：使用递归遍历深层树
function recursiveTraverse(tree: TreeNode[]): void {
  for (const node of tree) {
    processNode(node)
    if (node.children) {
      recursiveTraverse(node.children)
    }
  }
}

// ✅ 正确：使用迭代方式遍历（栈模拟）
class IterativeTreeTraverser<T extends TreeNode> {
  /**
   * 深度优先遍历（迭代实现）
   */
  traverseDFS(
    tree: T[],
    callback: (node: T, depth: number, path: T[]) => void | 'skip' | 'stop',
    options?: { maxDepth?: number }
  ): void {
    const { maxDepth = Infinity } = options || {}

    // 使用栈模拟递归
    const stack: Array<{
      node: T
      depth: number
      path: T[]
      childIndex: number
    }> = []

    // 初始化：将所有根节点入栈
    for (let i = tree.length - 1; i >= 0; i--) {
      stack.push({
        node: tree[i],
        depth: 0,
        path: [],
        childIndex: 0
      })
    }

    while (stack.length > 0) {
      const current = stack.pop()!
      const { node, depth, path } = current

      // 深度限制检查
      if (depth > maxDepth) {
        continue
      }

      // 执行回调
      const result = callback(node, depth, [...path, node])

      if (result === 'stop') {
        return // 完全停止遍历
      }

      if (result === 'skip') {
        continue // 跳过子节点
      }

      // 将子节点入栈（逆序以保持遍历顺序）
      const children = node.children || []
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push({
          node: children[i] as T,
          depth: depth + 1,
          path: [...path, node],
          childIndex: i
        })
      }
    }
  }

  /**
   * 广度优先遍历（层序遍历）
   */
  traverseBFS(
    tree: T[],
    callback: (node: T, depth: number) => void | 'stop',
    options?: { maxDepth?: number }
  ): void {
    const { maxDepth = Infinity } = options || {}

    // 使用队列实现 BFS
    const queue: Array<{ node: T; depth: number }> = []

    // 初始化：将所有根节点入队
    for (const node of tree) {
      queue.push({ node, depth: 0 })
    }

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!

      if (depth > maxDepth) {
        continue
      }

      const result = callback(node, depth)

      if (result === 'stop') {
        return
      }

      // 将子节点入队
      const children = node.children || []
      for (const child of children) {
        queue.push({
          node: child as T,
          depth: depth + 1
        })
      }
    }
  }

  /**
   * 分批遍历（适用于超大树）
   */
  async traverseInBatches(
    tree: T[],
    callback: (node: T) => void | Promise<void>,
    options?: {
      batchSize?: number
      delayBetweenBatches?: number
    }
  ): Promise<void> {
    const { batchSize = 100, delayBetweenBatches = 0 } = options || {}

    const allNodes = flattenTree(tree)

    for (let i = 0; i < allNodes.length; i += batchSize) {
      const batch = allNodes.slice(i, i + batchSize)

      for (const node of batch) {
        await callback(node as T)
      }

      // 批次间延迟，避免阻塞主线程
      if (delayBetweenBatches > 0 && i + batchSize < allNodes.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }

      // 让出主线程
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
  }
}

// 使用示例
const traverser = new IterativeTreeTraverser()

// 深度优先遍历
traverser.traverseDFS(tree, (node, depth, path) => {
  console.log(`${'  '.repeat(depth)}${node.name}`)

  // 限制遍历深度
  if (depth >= 10) {
    return 'skip' // 跳过更深的节点
  }
})

// 广度优先遍历（按层级处理）
traverser.traverseBFS(tree, (node, depth) => {
  console.log(`Level ${depth}: ${node.name}`)
}, { maxDepth: 5 })

// 分批异步遍历
await traverser.traverseInBatches(tree, async (node) => {
  await processNodeAsync(node)
}, { batchSize: 50, delayBetweenBatches: 10 })
```

---

### 3. 大数据量树操作导致性能问题

**问题描述：**

当树节点数量达到数万甚至数十万时，构建、搜索、过滤等操作变得非常缓慢。

```typescript
// 问题代码：10万节点的树操作耗时严重
const hugeList = generateHugeList(100000)

console.time('buildTree')
const tree = buildTree(hugeList) // 耗时: 5000ms+
console.timeEnd('buildTree')

console.time('findNode')
const node = findTreeNode(tree, n => n.id === 99999) // 耗时: 500ms+
console.timeEnd('findNode')
```

**问题原因：**

- 每次操作都需要遍历大量节点
- 没有利用索引加速查找
- 深拷贝操作消耗大量内存和时间
- 没有使用增量更新策略

**解决方案：**

```typescript
// ❌ 错误：每次操作都全量遍历
const node = findTreeNode(tree, n => n.id === targetId) // O(n)

// ✅ 正确：使用索引优化的树管理器
class IndexedTreeManager<T extends TreeNode & { id: any }> {
  private tree: T[] = []
  private nodeIndex: Map<any, T> = new Map()
  private parentIndex: Map<any, T> = new Map()
  private pathCache: Map<any, T[]> = new Map()

  /**
   * 构建带索引的树
   */
  build(data: any[], options?: TreeOptions): T[] {
    const idField = options?.id || 'id'
    const parentIdField = options?.parentId || 'parentId'

    // 清空索引
    this.nodeIndex.clear()
    this.parentIndex.clear()
    this.pathCache.clear()

    // 第一遍：构建节点索引
    const nodeMap = new Map<any, T>()
    for (const item of data) {
      const node = { ...item, children: [] } as T
      nodeMap.set(item[idField], node)
      this.nodeIndex.set(item[idField], node)
    }

    // 第二遍：构建树结构和父节点索引
    const roots: T[] = []

    for (const item of data) {
      const node = nodeMap.get(item[idField])!
      const parentId = item[parentIdField]

      if (parentId === null || parentId === undefined || parentId === 0) {
        roots.push(node)
      } else {
        const parent = nodeMap.get(parentId)
        if (parent) {
          parent.children!.push(node)
          this.parentIndex.set(item[idField], parent)
        } else {
          roots.push(node)
        }
      }
    }

    this.tree = roots
    return roots
  }

  /**
   * O(1) 节点查找
   */
  findById(id: any): T | undefined {
    return this.nodeIndex.get(id)
  }

  /**
   * O(1) 获取父节点
   */
  getParent(id: any): T | undefined {
    return this.parentIndex.get(id)
  }

  /**
   * 带缓存的路径查找
   */
  getPath(id: any): T[] {
    // 检查缓存
    if (this.pathCache.has(id)) {
      return this.pathCache.get(id)!
    }

    const path: T[] = []
    let currentId = id

    while (currentId !== undefined) {
      const node = this.nodeIndex.get(currentId)
      if (!node) break

      path.unshift(node)

      const parent = this.parentIndex.get(currentId)
      currentId = parent?.id
    }

    // 缓存结果
    this.pathCache.set(id, path)
    return path
  }

  /**
   * 增量更新节点
   */
  updateNode(id: any, updates: Partial<T>): boolean {
    const node = this.nodeIndex.get(id)
    if (!node) return false

    // 直接更新节点（引用更新）
    Object.assign(node, updates)

    // 清除相关路径缓存
    this.invalidatePathCache(id)

    return true
  }

  /**
   * 增量删除节点
   */
  removeNode(id: any): boolean {
    const node = this.nodeIndex.get(id)
    if (!node) return false

    // 从父节点中移除
    const parent = this.parentIndex.get(id)
    if (parent) {
      const index = parent.children!.findIndex(child => child.id === id)
      if (index !== -1) {
        parent.children!.splice(index, 1)
      }
    } else {
      // 从根节点移除
      const index = this.tree.findIndex(n => n.id === id)
      if (index !== -1) {
        this.tree.splice(index, 1)
      }
    }

    // 递归删除子节点索引
    this.removeFromIndex(node)

    return true
  }

  private removeFromIndex(node: T): void {
    this.nodeIndex.delete(node.id)
    this.parentIndex.delete(node.id)
    this.pathCache.delete(node.id)

    for (const child of (node.children || [])) {
      this.removeFromIndex(child as T)
    }
  }

  private invalidatePathCache(id: any): void {
    // 清除该节点及所有子节点的路径缓存
    this.pathCache.delete(id)

    const node = this.nodeIndex.get(id)
    if (node?.children) {
      for (const child of node.children) {
        this.invalidatePathCache(child.id)
      }
    }
  }

  /**
   * 高效搜索（支持模糊匹配）
   */
  search(
    keyword: string,
    options?: {
      fields?: string[]
      limit?: number
      caseSensitive?: boolean
    }
  ): T[] {
    const {
      fields = ['name', 'title', 'label'],
      limit = 100,
      caseSensitive = false
    } = options || {}

    const results: T[] = []
    const searchKey = caseSensitive ? keyword : keyword.toLowerCase()

    for (const node of this.nodeIndex.values()) {
      if (results.length >= limit) break

      for (const field of fields) {
        const value = node[field]
        if (typeof value === 'string') {
          const compareValue = caseSensitive ? value : value.toLowerCase()
          if (compareValue.includes(searchKey)) {
            results.push(node)
            break
          }
        }
      }
    }

    return results
  }

  /**
   * 获取统计信息
   */
  getStats(): TreeStats {
    let totalNodes = 0
    let maxDepth = 0
    let leafCount = 0

    const calculateStats = (nodes: T[], depth: number) => {
      for (const node of nodes) {
        totalNodes++
        maxDepth = Math.max(maxDepth, depth)

        if (!node.children || node.children.length === 0) {
          leafCount++
        } else {
          calculateStats(node.children as T[], depth + 1)
        }
      }
    }

    calculateStats(this.tree, 0)

    return {
      totalNodes,
      maxDepth,
      leafCount,
      rootCount: this.tree.length
    }
  }
}

interface TreeStats {
  totalNodes: number
  maxDepth: number
  leafCount: number
  rootCount: number
}

// 使用示例
const manager = new IndexedTreeManager()

console.time('indexedBuild')
manager.build(hugeList) // 优化后：~200ms
console.timeEnd('indexedBuild')

console.time('indexedFind')
const node = manager.findById(99999) // O(1): <1ms
console.timeEnd('indexedFind')

// 增量更新
manager.updateNode(99999, { name: '新名称' })

// 高效搜索
const results = manager.search('销售', { limit: 20 })
```

---

### 4. 树节点更新后视图不刷新

**问题描述：**

在 Vue 组件中修改树节点数据后，视图没有正确更新。

```typescript
// 问题代码
const treeData = ref(buildTree(data))

const updateNodeName = (nodeId: number, newName: string) => {
  const node = findTreeNode(treeData.value, n => n.id === nodeId)
  if (node) {
    node.name = newName // 视图不更新
  }
}
```

**问题原因：**

- Vue 3 的响应式系统对深层嵌套对象的追踪有限制
- 直接修改嵌套对象的属性可能不会触发更新
- 使用 `shallowRef` 时内部变化不会被检测
- 没有正确触发响应式更新

**解决方案：**

```typescript
// ❌ 错误：直接修改嵌套属性
const updateNode = (id: number, updates: any) => {
  const node = findTreeNode(treeData.value, n => n.id === id)
  if (node) {
    Object.assign(node, updates) // 可能不触发更新
  }
}

// ✅ 正确：使用响应式树管理
import { ref, reactive, triggerRef, shallowRef } from 'vue'

/**
 * 响应式树管理 Composable
 */
function useReactiveTree<T extends TreeNode>(
  initialData: any[],
  options?: TreeOptions
) {
  // 使用 shallowRef 提高大树的性能
  const treeData = shallowRef<T[]>([])

  // 节点索引（非响应式，用于快速查找）
  const nodeIndex = new Map<any, T>()

  /**
   * 初始化树
   */
  const initialize = (data: any[]) => {
    nodeIndex.clear()

    const tree = buildTree<T>(data, options)

    // 构建索引
    traverseTree(tree, (node) => {
      nodeIndex.set(node.id, node)
    }, options)

    treeData.value = tree
  }

  /**
   * 更新节点（触发视图更新）
   */
  const updateNode = (
    id: any,
    updates: Partial<T> | ((node: T) => Partial<T>)
  ) => {
    const node = nodeIndex.get(id)
    if (!node) return false

    const actualUpdates = typeof updates === 'function'
      ? updates(node)
      : updates

    Object.assign(node, actualUpdates)

    // 手动触发更新
    triggerRef(treeData)

    return true
  }

  /**
   * 批量更新节点
   */
  const updateNodes = (
    predicate: (node: T) => boolean,
    updates: Partial<T> | ((node: T) => Partial<T>)
  ) => {
    let updated = false

    for (const node of nodeIndex.values()) {
      if (predicate(node)) {
        const actualUpdates = typeof updates === 'function'
          ? updates(node)
          : updates

        Object.assign(node, actualUpdates)
        updated = true
      }
    }

    if (updated) {
      triggerRef(treeData)
    }

    return updated
  }

  /**
   * 添加节点
   */
  const addNode = (node: T, parentId?: any) => {
    if (parentId !== undefined && parentId !== null) {
      const parent = nodeIndex.get(parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(node)
      }
    } else {
      treeData.value.push(node)
    }

    // 更新索引
    nodeIndex.set(node.id, node)

    triggerRef(treeData)
  }

  /**
   * 删除节点
   */
  const removeNode = (id: any) => {
    const node = nodeIndex.get(id)
    if (!node) return false

    // 递归删除索引
    const removeFromIndex = (n: T) => {
      nodeIndex.delete(n.id)
      n.children?.forEach(child => removeFromIndex(child as T))
    }
    removeFromIndex(node)

    // 从树中移除
    const result = removeNodeFromTree(treeData.value as T[], n => n.id === id, options)

    if (result) {
      triggerRef(treeData)
    }

    return result
  }

  /**
   * 移动节点
   */
  const moveNode = (nodeId: any, newParentId: any) => {
    const node = nodeIndex.get(nodeId)
    if (!node) return false

    // 先删除
    removeNodeFromTree(treeData.value as T[], n => n.id === nodeId, options)

    // 再插入
    if (newParentId !== undefined && newParentId !== null) {
      const newParent = nodeIndex.get(newParentId)
      if (newParent) {
        if (!newParent.children) {
          newParent.children = []
        }
        newParent.children.push(node)
      }
    } else {
      treeData.value.push(node)
    }

    triggerRef(treeData)
    return true
  }

  /**
   * 重置树
   */
  const reset = (data: any[]) => {
    initialize(data)
  }

  // 初始化
  initialize(initialData)

  return {
    treeData,
    updateNode,
    updateNodes,
    addNode,
    removeNode,
    moveNode,
    reset,
    findNode: (id: any) => nodeIndex.get(id)
  }
}

// 辅助函数
function removeNodeFromTree<T extends TreeNode>(
  tree: T[],
  predicate: (node: T) => boolean,
  options?: TreeOptions
): boolean {
  const childrenField = options?.children || 'children'

  for (let i = 0; i < tree.length; i++) {
    if (predicate(tree[i])) {
      tree.splice(i, 1)
      return true
    }

    const children = tree[i][childrenField] as T[]
    if (children && removeNodeFromTree(children, predicate, options)) {
      return true
    }
  }

  return false
}

// Vue 组件中使用
const {
  treeData,
  updateNode,
  addNode,
  removeNode
} = useReactiveTree(rawData)

// 更新节点 - 视图会自动刷新
const handleEdit = (nodeId: number, newName: string) => {
  updateNode(nodeId, { name: newName })
}

// 批量更新
const handleBatchUpdate = () => {
  updateNodes(
    node => node.status === 'pending',
    { status: 'active' }
  )
}
```

---

### 5. 循环引用导致无限递归

**问题描述：**

数据中存在循环引用（节点的祖先节点被设置为其子节点），导致遍历时无限循环。

```typescript
// 问题数据：节点3的父节点指向了其子节点4
const data = [
  { id: 1, name: '节点1', parentId: null },
  { id: 2, name: '节点2', parentId: 1 },
  { id: 3, name: '节点3', parentId: 4 },  // 循环引用！
  { id: 4, name: '节点4', parentId: 2 }
]

// 构建树会导致无限循环或数据丢失
const tree = buildTree(data) // 问题！
```

**问题原因：**

- 数据导入时产生了错误的父子关系
- 用户操作（如拖拽）时没有校验循环引用
- 后端数据同步时产生了不一致
- 批量更新时意外创建了循环

**解决方案：**

```typescript
// ❌ 错误：不检测循环引用
const tree = buildTree(data)

// ✅ 正确：检测并处理循环引用
class CircularReferenceDetector<T extends { id: any; parentId: any }> {
  private visited = new Set<any>()
  private recursionStack = new Set<any>()
  private cycles: CycleInfo[] = []

  /**
   * 检测数据中的循环引用
   */
  detect(data: T[]): CycleInfo[] {
    this.visited.clear()
    this.recursionStack.clear()
    this.cycles = []

    // 构建父子关系图
    const childrenMap = new Map<any, T[]>()
    const nodeMap = new Map<any, T>()

    for (const item of data) {
      nodeMap.set(item.id, item)

      const parentId = item.parentId
      if (parentId !== null && parentId !== undefined) {
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, [])
        }
        childrenMap.get(parentId)!.push(item)
      }
    }

    // DFS 检测循环
    for (const item of data) {
      if (!this.visited.has(item.id)) {
        this.dfs(item.id, childrenMap, nodeMap, [])
      }
    }

    return this.cycles
  }

  private dfs(
    nodeId: any,
    childrenMap: Map<any, T[]>,
    nodeMap: Map<any, T>,
    path: any[]
  ): void {
    this.visited.add(nodeId)
    this.recursionStack.add(nodeId)
    path.push(nodeId)

    const children = childrenMap.get(nodeId) || []

    for (const child of children) {
      if (!this.visited.has(child.id)) {
        this.dfs(child.id, childrenMap, nodeMap, [...path])
      } else if (this.recursionStack.has(child.id)) {
        // 发现循环
        const cycleStart = path.indexOf(child.id)
        const cyclePath = path.slice(cycleStart)
        cyclePath.push(child.id) // 完成循环

        this.cycles.push({
          cycle: cyclePath,
          nodes: cyclePath.map(id => nodeMap.get(id)!)
        })
      }
    }

    this.recursionStack.delete(nodeId)
  }

  /**
   * 检测单个移动操作是否会产生循环
   */
  wouldCreateCycle(
    nodeId: any,
    newParentId: any,
    data: T[]
  ): boolean {
    if (nodeId === newParentId) {
      return true // 自己不能作为自己的父节点
    }

    // 检查新父节点是否是当前节点的后代
    const descendants = this.getDescendants(nodeId, data)
    return descendants.has(newParentId)
  }

  private getDescendants(nodeId: any, data: T[]): Set<any> {
    const descendants = new Set<any>()
    const queue = [nodeId]

    // 构建子节点映射
    const childrenMap = new Map<any, any[]>()
    for (const item of data) {
      if (item.parentId !== null && item.parentId !== undefined) {
        if (!childrenMap.has(item.parentId)) {
          childrenMap.set(item.parentId, [])
        }
        childrenMap.get(item.parentId)!.push(item.id)
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!
      const children = childrenMap.get(current) || []

      for (const childId of children) {
        if (!descendants.has(childId)) {
          descendants.add(childId)
          queue.push(childId)
        }
      }
    }

    return descendants
  }

  /**
   * 修复循环引用
   */
  fix(
    data: T[],
    strategy: 'break_child' | 'break_parent' | 'remove'
  ): T[] {
    const cycles = this.detect(data)

    if (cycles.length === 0) {
      return data
    }

    const nodesToModify = new Set<any>()

    for (const cycle of cycles) {
      switch (strategy) {
        case 'break_child':
          // 将循环中最后一个节点的父节点设为 null
          nodesToModify.add(cycle.cycle[cycle.cycle.length - 2])
          break

        case 'break_parent':
          // 将循环中第一个节点的父节点设为 null
          nodesToModify.add(cycle.cycle[0])
          break

        case 'remove':
          // 移除参与循环的所有节点
          cycle.cycle.forEach(id => nodesToModify.add(id))
          break
      }
    }

    if (strategy === 'remove') {
      return data.filter(item => !nodesToModify.has(item.id))
    }

    return data.map(item => {
      if (nodesToModify.has(item.id)) {
        return { ...item, parentId: null }
      }
      return item
    })
  }
}

interface CycleInfo {
  cycle: any[]
  nodes: any[]
}

// 使用示例
const detector = new CircularReferenceDetector()

// 检测循环引用
const cycles = detector.detect(data)
if (cycles.length > 0) {
  console.error('发现循环引用:', cycles)

  // 自动修复
  const fixedData = detector.fix(data, 'break_child')
  const tree = buildTree(fixedData)
}

// 拖拽移动前检查
const canMove = !detector.wouldCreateCycle(nodeId, newParentId, data)
if (!canMove) {
  console.warn('此移动会产生循环引用')
}
```

---

### 6. 异步加载子节点时状态管理混乱

**问题描述：**

实现懒加载树时，多个异步请求并发导致状态混乱，或者加载状态管理不正确。

```typescript
// 问题代码
const loadChildren = async (nodeId: number) => {
  node.loading = true
  const children = await fetchChildren(nodeId)
  node.children = children
  node.loading = false // 如果组件已卸载，这里会报错
}

// 快速点击展开/折叠时，多个请求并发，结果混乱
```

**问题原因：**

- 没有取消之前的请求
- 没有处理竞态条件
- 组件卸载后仍然更新状态
- 加载状态管理分散

**解决方案：**

```typescript
// ❌ 错误：简单的异步加载
const loadChildren = async (node) => {
  const children = await api.getChildren(node.id)
  node.children = children
}

// ✅ 正确：完善的异步树加载管理
class AsyncTreeLoader<T extends TreeNode & { id: any }> {
  private loadingNodes = new Map<any, AbortController>()
  private loadedNodes = new Set<any>()
  private errorNodes = new Map<any, Error>()
  private retryCount = new Map<any, number>()
  private maxRetries = 3

  constructor(
    private fetchChildren: (nodeId: any, signal: AbortSignal) => Promise<T[]>,
    private options?: {
      maxRetries?: number
      retryDelay?: number
      cacheTimeout?: number
    }
  ) {
    this.maxRetries = options?.maxRetries ?? 3
  }

  /**
   * 加载子节点
   */
  async load(node: T): Promise<LoadResult<T>> {
    const nodeId = node.id

    // 已加载，直接返回
    if (this.loadedNodes.has(nodeId) && node.children?.length) {
      return {
        status: 'cached',
        children: node.children as T[]
      }
    }

    // 正在加载，取消之前的请求
    if (this.loadingNodes.has(nodeId)) {
      const prevController = this.loadingNodes.get(nodeId)!
      prevController.abort()
    }

    // 创建新的 AbortController
    const controller = new AbortController()
    this.loadingNodes.set(nodeId, controller)

    // 设置加载状态
    node.loading = true
    node.loadError = undefined

    try {
      const children = await this.fetchChildren(nodeId, controller.signal)

      // 检查是否被取消
      if (controller.signal.aborted) {
        return { status: 'cancelled', children: [] }
      }

      // 更新节点
      node.children = children
      node.loaded = true
      node.loading = false

      // 更新状态
      this.loadedNodes.add(nodeId)
      this.loadingNodes.delete(nodeId)
      this.errorNodes.delete(nodeId)
      this.retryCount.delete(nodeId)

      return {
        status: 'success',
        children
      }

    } catch (error) {
      // 忽略取消错误
      if (error instanceof Error && error.name === 'AbortError') {
        return { status: 'cancelled', children: [] }
      }

      node.loading = false
      node.loadError = error as Error

      this.loadingNodes.delete(nodeId)
      this.errorNodes.set(nodeId, error as Error)

      // 自动重试
      const currentRetry = (this.retryCount.get(nodeId) ?? 0) + 1
      this.retryCount.set(nodeId, currentRetry)

      if (currentRetry <= this.maxRetries) {
        const delay = (this.options?.retryDelay ?? 1000) * currentRetry
        await new Promise(resolve => setTimeout(resolve, delay))

        return this.load(node)
      }

      return {
        status: 'error',
        error: error as Error,
        children: []
      }
    }
  }

  /**
   * 批量预加载
   */
  async preload(nodes: T[]): Promise<Map<any, LoadResult<T>>> {
    const results = new Map<any, LoadResult<T>>()

    await Promise.all(
      nodes.map(async (node) => {
        const result = await this.load(node)
        results.set(node.id, result)
      })
    )

    return results
  }

  /**
   * 取消所有加载
   */
  cancelAll(): void {
    for (const controller of this.loadingNodes.values()) {
      controller.abort()
    }
    this.loadingNodes.clear()
  }

  /**
   * 取消指定节点的加载
   */
  cancel(nodeId: any): boolean {
    const controller = this.loadingNodes.get(nodeId)
    if (controller) {
      controller.abort()
      this.loadingNodes.delete(nodeId)
      return true
    }
    return false
  }

  /**
   * 重置节点（允许重新加载）
   */
  reset(nodeId: any): void {
    this.loadedNodes.delete(nodeId)
    this.errorNodes.delete(nodeId)
    this.retryCount.delete(nodeId)
    this.cancel(nodeId)
  }

  /**
   * 获取加载状态
   */
  getStatus(nodeId: any): LoadStatus {
    if (this.loadingNodes.has(nodeId)) {
      return 'loading'
    }
    if (this.errorNodes.has(nodeId)) {
      return 'error'
    }
    if (this.loadedNodes.has(nodeId)) {
      return 'loaded'
    }
    return 'idle'
  }

  /**
   * 判断是否正在加载
   */
  isLoading(nodeId: any): boolean {
    return this.loadingNodes.has(nodeId)
  }
}

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface LoadResult<T> {
  status: 'success' | 'cached' | 'cancelled' | 'error'
  children: T[]
  error?: Error
}

// Vue Composable 封装
function useLazyTree<T extends TreeNode & { id: any }>(
  fetchChildren: (nodeId: any, signal: AbortSignal) => Promise<T[]>
) {
  const loader = new AsyncTreeLoader(fetchChildren)
  const treeData = shallowRef<T[]>([])

  // 组件卸载时取消所有请求
  onUnmounted(() => {
    loader.cancelAll()
  })

  const expandNode = async (node: T) => {
    if (node.expanded && node.loaded) {
      // 已展开且已加载，折叠
      node.expanded = false
      triggerRef(treeData)
      return
    }

    node.expanded = true

    if (!node.loaded) {
      const result = await loader.load(node)

      if (result.status === 'success') {
        triggerRef(treeData)
      } else if (result.status === 'error') {
        // 显示错误提示
        console.error('加载失败:', result.error)
      }
    }

    triggerRef(treeData)
  }

  const retryLoad = async (node: T) => {
    loader.reset(node.id)
    await loader.load(node)
    triggerRef(treeData)
  }

  return {
    treeData,
    expandNode,
    retryLoad,
    isLoading: (nodeId: any) => loader.isLoading(nodeId),
    getStatus: (nodeId: any) => loader.getStatus(nodeId)
  }
}

// 使用示例
const { treeData, expandNode, isLoading } = useLazyTree(async (nodeId, signal) => {
  const response = await fetch(`/api/nodes/${nodeId}/children`, { signal })
  return response.json()
})
```

---

### 7. 树节点拖拽排序后数据不一致

**问题描述：**

实现树节点拖拽排序后，视图显示正确但数据结构与视图不一致，或排序信息丢失。

```typescript
// 问题代码
const handleDrop = (dragNode, dropNode, position) => {
  // 只更新了视图，没有正确更新数据结构
  // 保存到后端时，排序信息丢失
}
```

**问题原因：**

- 只更新了视图，没有同步更新数据
- 没有维护节点的排序字段
- 父子关系没有正确更新
- 拖拽到同一位置时重复处理

**解决方案：**

```typescript
// ❌ 错误：只处理视图层面的拖拽
const handleDrop = (info) => {
  // ... 只更新 DOM
}

// ✅ 正确：完整的拖拽排序管理
interface DragDropInfo<T> {
  dragNode: T
  dropNode: T
  dropPosition: 'before' | 'after' | 'inside'
}

class TreeDragDropManager<T extends TreeNode & {
  id: any
  parentId: any
  sort?: number
}> {
  private treeData: T[]
  private nodeIndex: Map<any, T>
  private parentIndex: Map<any, T | null>

  constructor(
    treeData: T[],
    private options?: {
      onUpdate?: (changes: TreeChange[]) => void
      sortField?: string
    }
  ) {
    this.treeData = treeData
    this.nodeIndex = new Map()
    this.parentIndex = new Map()
    this.buildIndexes()
  }

  private buildIndexes(): void {
    this.nodeIndex.clear()
    this.parentIndex.clear()

    const traverse = (nodes: T[], parent: T | null) => {
      for (const node of nodes) {
        this.nodeIndex.set(node.id, node)
        this.parentIndex.set(node.id, parent)

        if (node.children?.length) {
          traverse(node.children as T[], node)
        }
      }
    }

    traverse(this.treeData, null)
  }

  /**
   * 处理拖拽放置
   */
  handleDrop(info: DragDropInfo<T>): TreeDropResult {
    const { dragNode, dropNode, dropPosition } = info

    // 1. 验证拖拽操作
    const validation = this.validateDrop(info)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        changes: []
      }
    }

    // 2. 记录原始状态
    const originalParentId = dragNode.parentId
    const originalSort = dragNode.sort ?? 0

    // 3. 从原位置移除
    this.removeFromParent(dragNode)

    // 4. 插入到新位置
    let newParentId: any
    let newSort: number

    switch (dropPosition) {
      case 'inside':
        // 作为 dropNode 的子节点
        newParentId = dropNode.id
        newSort = this.getMaxSort(dropNode.children as T[]) + 1
        this.insertAsChild(dragNode, dropNode)
        break

      case 'before':
        // 插入到 dropNode 之前
        newParentId = dropNode.parentId
        newSort = (dropNode.sort ?? 0) - 0.5
        this.insertBefore(dragNode, dropNode)
        break

      case 'after':
        // 插入到 dropNode 之后
        newParentId = dropNode.parentId
        newSort = (dropNode.sort ?? 0) + 0.5
        this.insertAfter(dragNode, dropNode)
        break
    }

    // 5. 更新节点属性
    dragNode.parentId = newParentId
    dragNode.sort = newSort

    // 6. 重新计算排序值
    const changes = this.recalculateSortValues()

    // 7. 重建索引
    this.buildIndexes()

    // 8. 触发更新回调
    if (this.options?.onUpdate) {
      this.options.onUpdate(changes)
    }

    return {
      success: true,
      changes
    }
  }

  /**
   * 验证拖拽操作
   */
  private validateDrop(info: DragDropInfo<T>): { valid: boolean; error?: string } {
    const { dragNode, dropNode, dropPosition } = info

    // 不能拖拽到自己
    if (dragNode.id === dropNode.id) {
      return { valid: false, error: '不能拖拽到自身' }
    }

    // 不能拖拽到自己的后代节点内部
    if (dropPosition === 'inside') {
      if (this.isDescendant(dropNode.id, dragNode.id)) {
        return { valid: false, error: '不能将节点拖拽到其后代节点中' }
      }
    }

    return { valid: true }
  }

  /**
   * 检查 childId 是否是 parentId 的后代
   */
  private isDescendant(childId: any, parentId: any): boolean {
    const parent = this.nodeIndex.get(parentId)
    if (!parent?.children) return false

    for (const child of parent.children as T[]) {
      if (child.id === childId) return true
      if (this.isDescendant(childId, child.id)) return true
    }

    return false
  }

  /**
   * 从父节点中移除
   */
  private removeFromParent(node: T): void {
    const parent = this.parentIndex.get(node.id)

    if (parent) {
      const index = parent.children!.findIndex(child => child.id === node.id)
      if (index !== -1) {
        parent.children!.splice(index, 1)
      }
    } else {
      const index = this.treeData.findIndex(n => n.id === node.id)
      if (index !== -1) {
        this.treeData.splice(index, 1)
      }
    }
  }

  /**
   * 作为子节点插入
   */
  private insertAsChild(node: T, parent: T): void {
    if (!parent.children) {
      parent.children = []
    }
    parent.children.push(node)
  }

  /**
   * 插入到目标节点之前
   */
  private insertBefore(node: T, target: T): void {
    const parent = this.parentIndex.get(target.id)
    const siblings = parent ? parent.children! : this.treeData

    const index = siblings.findIndex(n => n.id === target.id)
    siblings.splice(index, 0, node)
  }

  /**
   * 插入到目标节点之后
   */
  private insertAfter(node: T, target: T): void {
    const parent = this.parentIndex.get(target.id)
    const siblings = parent ? parent.children! : this.treeData

    const index = siblings.findIndex(n => n.id === target.id)
    siblings.splice(index + 1, 0, node)
  }

  /**
   * 获取最大排序值
   */
  private getMaxSort(nodes?: T[]): number {
    if (!nodes?.length) return 0
    return Math.max(...nodes.map(n => n.sort ?? 0))
  }

  /**
   * 重新计算排序值
   */
  private recalculateSortValues(): TreeChange[] {
    const changes: TreeChange[] = []
    const sortField = this.options?.sortField ?? 'sort'

    const recalculate = (nodes: T[]) => {
      nodes.forEach((node, index) => {
        const newSort = (index + 1) * 10 // 使用10的倍数，便于后续插入

        if (node[sortField] !== newSort) {
          changes.push({
            nodeId: node.id,
            field: sortField,
            oldValue: node[sortField],
            newValue: newSort
          })
          ;(node as any)[sortField] = newSort
        }

        if (node.children?.length) {
          recalculate(node.children as T[])
        }
      })
    }

    recalculate(this.treeData)
    return changes
  }

  /**
   * 获取需要保存的变更
   */
  getChangesForSave(): NodeUpdate[] {
    const updates: NodeUpdate[] = []

    const collect = (nodes: T[]) => {
      for (const node of nodes) {
        updates.push({
          id: node.id,
          parentId: node.parentId,
          sort: node.sort ?? 0
        })

        if (node.children?.length) {
          collect(node.children as T[])
        }
      }
    }

    collect(this.treeData)
    return updates
  }
}

interface TreeChange {
  nodeId: any
  field: string
  oldValue: any
  newValue: any
}

interface TreeDropResult {
  success: boolean
  error?: string
  changes: TreeChange[]
}

interface NodeUpdate {
  id: any
  parentId: any
  sort: number
}

// Vue 组件中使用
const dragDropManager = new TreeDragDropManager(treeData.value, {
  onUpdate: (changes) => {
    console.log('变更:', changes)
    triggerRef(treeData)
  }
})

const handleDrop = async (info: DragDropInfo) => {
  const result = dragDropManager.handleDrop(info)

  if (result.success) {
    // 保存到后端
    const updates = dragDropManager.getChangesForSave()
    await api.updateTreeOrder(updates)
  } else {
    message.error(result.error)
  }
}
```

---

### 8. 多选树节点时父子联动逻辑错误

**问题描述：**

实现树形多选时，父子节点的联动关系不正确，如选中父节点后子节点没有全选，或子节点全选后父节点没有选中。

```typescript
// 问题代码
const handleCheck = (nodeId: number, checked: boolean) => {
  const node = findNode(nodeId)
  node.checked = checked
  // 没有处理父子联动
}
```

**问题原因：**

- 没有实现向下传递（选中父节点时选中所有子节点）
- 没有实现向上传递（子节点全选时选中父节点）
- 半选状态没有正确处理
- 性能问题：每次选择都遍历整棵树

**解决方案：**

```typescript
// ❌ 错误：只更新当前节点
const toggleCheck = (node) => {
  node.checked = !node.checked
}

// ✅ 正确：完整的父子联动多选逻辑
interface CheckableNode extends TreeNode {
  id: any
  checked?: boolean
  indeterminate?: boolean  // 半选状态
  disabled?: boolean
  children?: CheckableNode[]
}

class TreeCheckManager<T extends CheckableNode> {
  private treeData: T[]
  private nodeIndex: Map<any, T> = new Map()
  private parentIndex: Map<any, T | null> = new Map()
  private checkedKeys: Set<any> = new Set()

  constructor(
    treeData: T[],
    private options?: {
      checkStrictly?: boolean  // 是否严格模式（不联动）
      onCheck?: (checkedKeys: any[], node: T, checked: boolean) => void
    }
  ) {
    this.treeData = treeData
    this.buildIndexes()
    this.initCheckedState()
  }

  private buildIndexes(): void {
    this.nodeIndex.clear()
    this.parentIndex.clear()

    const traverse = (nodes: T[], parent: T | null) => {
      for (const node of nodes) {
        this.nodeIndex.set(node.id, node)
        this.parentIndex.set(node.id, parent)

        if (node.children?.length) {
          traverse(node.children as T[], node)
        }
      }
    }

    traverse(this.treeData, null)
  }

  private initCheckedState(): void {
    // 收集初始选中状态
    for (const node of this.nodeIndex.values()) {
      if (node.checked && !node.disabled) {
        this.checkedKeys.add(node.id)
      }
    }

    // 更新所有节点的状态
    this.updateAllNodeStates()
  }

  /**
   * 切换节点选中状态
   */
  toggle(nodeId: any): void {
    const node = this.nodeIndex.get(nodeId)
    if (!node || node.disabled) return

    const newChecked = !node.checked
    this.setChecked(nodeId, newChecked)
  }

  /**
   * 设置节点选中状态
   */
  setChecked(nodeId: any, checked: boolean): void {
    const node = this.nodeIndex.get(nodeId)
    if (!node || node.disabled) return

    if (this.options?.checkStrictly) {
      // 严格模式：不联动
      this.updateSingleNode(node, checked)
    } else {
      // 联动模式
      this.updateWithCascade(node, checked)
    }

    // 触发回调
    if (this.options?.onCheck) {
      this.options.onCheck(this.getCheckedKeys(), node, checked)
    }
  }

  /**
   * 严格模式：只更新单个节点
   */
  private updateSingleNode(node: T, checked: boolean): void {
    node.checked = checked
    node.indeterminate = false

    if (checked) {
      this.checkedKeys.add(node.id)
    } else {
      this.checkedKeys.delete(node.id)
    }
  }

  /**
   * 联动模式：更新节点及其父子节点
   */
  private updateWithCascade(node: T, checked: boolean): void {
    // 1. 向下传递：更新所有子节点
    this.cascadeDown(node, checked)

    // 2. 向上传递：更新所有父节点
    this.cascadeUp(node)
  }

  /**
   * 向下传递选中状态
   */
  private cascadeDown(node: T, checked: boolean): void {
    // 更新当前节点
    if (!node.disabled) {
      node.checked = checked
      node.indeterminate = false

      if (checked) {
        this.checkedKeys.add(node.id)
      } else {
        this.checkedKeys.delete(node.id)
      }
    }

    // 递归更新子节点
    if (node.children?.length) {
      for (const child of node.children as T[]) {
        this.cascadeDown(child, checked)
      }
    }
  }

  /**
   * 向上传递选中状态
   */
  private cascadeUp(node: T): void {
    let parent = this.parentIndex.get(node.id)

    while (parent) {
      if (!parent.disabled) {
        const { allChecked, someChecked } = this.getChildrenCheckState(parent)

        parent.checked = allChecked
        parent.indeterminate = someChecked && !allChecked

        if (allChecked) {
          this.checkedKeys.add(parent.id)
        } else {
          this.checkedKeys.delete(parent.id)
        }
      }

      parent = this.parentIndex.get(parent.id)
    }
  }

  /**
   * 获取子节点的选中状态
   */
  private getChildrenCheckState(node: T): {
    allChecked: boolean
    someChecked: boolean
  } {
    const children = node.children as T[] | undefined

    if (!children?.length) {
      return { allChecked: node.checked ?? false, someChecked: false }
    }

    let checkedCount = 0
    let totalCount = 0
    let hasIndeterminate = false

    for (const child of children) {
      if (child.disabled) continue

      totalCount++

      if (child.checked) {
        checkedCount++
      } else if (child.indeterminate) {
        hasIndeterminate = true
      }
    }

    const allChecked = totalCount > 0 && checkedCount === totalCount
    const someChecked = checkedCount > 0 || hasIndeterminate

    return { allChecked, someChecked }
  }

  /**
   * 更新所有节点状态（初始化时使用）
   */
  private updateAllNodeStates(): void {
    // 后序遍历：先更新子节点，再更新父节点
    const postOrder = (nodes: T[]) => {
      for (const node of nodes) {
        if (node.children?.length) {
          postOrder(node.children as T[])
        }

        if (!node.disabled && node.children?.length) {
          const { allChecked, someChecked } = this.getChildrenCheckState(node)
          node.checked = allChecked
          node.indeterminate = someChecked && !allChecked

          if (allChecked) {
            this.checkedKeys.add(node.id)
          }
        }
      }
    }

    postOrder(this.treeData)
  }

  /**
   * 获取所有选中的节点 ID
   */
  getCheckedKeys(): any[] {
    return Array.from(this.checkedKeys)
  }

  /**
   * 获取所有选中的叶子节点 ID
   */
  getCheckedLeafKeys(): any[] {
    const leafKeys: any[] = []

    for (const nodeId of this.checkedKeys) {
      const node = this.nodeIndex.get(nodeId)
      if (node && (!node.children || node.children.length === 0)) {
        leafKeys.push(nodeId)
      }
    }

    return leafKeys
  }

  /**
   * 获取半选节点 ID
   */
  getIndeterminateKeys(): any[] {
    const keys: any[] = []

    for (const node of this.nodeIndex.values()) {
      if (node.indeterminate) {
        keys.push(node.id)
      }
    }

    return keys
  }

  /**
   * 全选
   */
  checkAll(): void {
    for (const node of this.nodeIndex.values()) {
      if (!node.disabled) {
        node.checked = true
        node.indeterminate = false
        this.checkedKeys.add(node.id)
      }
    }

    if (this.options?.onCheck) {
      this.options.onCheck(this.getCheckedKeys(), this.treeData[0], true)
    }
  }

  /**
   * 全不选
   */
  uncheckAll(): void {
    for (const node of this.nodeIndex.values()) {
      if (!node.disabled) {
        node.checked = false
        node.indeterminate = false
      }
    }
    this.checkedKeys.clear()

    if (this.options?.onCheck) {
      this.options.onCheck([], this.treeData[0], false)
    }
  }

  /**
   * 反选
   */
  toggleAll(): void {
    for (const node of this.nodeIndex.values()) {
      if (!node.disabled && (!node.children || node.children.length === 0)) {
        this.toggle(node.id)
      }
    }
  }

  /**
   * 设置选中的节点
   */
  setCheckedKeys(keys: any[]): void {
    // 清空当前选中
    for (const node of this.nodeIndex.values()) {
      node.checked = false
      node.indeterminate = false
    }
    this.checkedKeys.clear()

    // 设置新的选中
    for (const key of keys) {
      const node = this.nodeIndex.get(key)
      if (node && !node.disabled) {
        this.cascadeDown(node, true)
      }
    }

    // 更新父节点状态
    for (const key of keys) {
      const node = this.nodeIndex.get(key)
      if (node) {
        this.cascadeUp(node)
      }
    }
  }
}

// Vue Composable 封装
function useCheckableTree<T extends CheckableNode>(
  treeData: Ref<T[]>,
  options?: {
    checkStrictly?: boolean
    defaultCheckedKeys?: any[]
  }
) {
  const manager = shallowRef<TreeCheckManager<T>>()

  const checkedKeys = ref<any[]>(options?.defaultCheckedKeys ?? [])
  const indeterminateKeys = ref<any[]>([])

  const init = () => {
    manager.value = new TreeCheckManager(treeData.value, {
      checkStrictly: options?.checkStrictly,
      onCheck: (keys, node, checked) => {
        checkedKeys.value = keys
        indeterminateKeys.value = manager.value!.getIndeterminateKeys()
        triggerRef(treeData)
      }
    })

    if (options?.defaultCheckedKeys?.length) {
      manager.value.setCheckedKeys(options.defaultCheckedKeys)
    }

    checkedKeys.value = manager.value.getCheckedKeys()
    indeterminateKeys.value = manager.value.getIndeterminateKeys()
  }

  watch(treeData, init, { immediate: true })

  return {
    checkedKeys: readonly(checkedKeys),
    indeterminateKeys: readonly(indeterminateKeys),
    toggle: (nodeId: any) => manager.value?.toggle(nodeId),
    setChecked: (nodeId: any, checked: boolean) =>
      manager.value?.setChecked(nodeId, checked),
    checkAll: () => manager.value?.checkAll(),
    uncheckAll: () => manager.value?.uncheckAll(),
    setCheckedKeys: (keys: any[]) => manager.value?.setCheckedKeys(keys),
    getCheckedLeafKeys: () => manager.value?.getCheckedLeafKeys() ?? []
  }
}

// 使用示例
const {
  checkedKeys,
  toggle,
  checkAll,
  uncheckAll
} = useCheckableTree(treeData, {
  checkStrictly: false,
  defaultCheckedKeys: [1, 3, 5]
})
```
