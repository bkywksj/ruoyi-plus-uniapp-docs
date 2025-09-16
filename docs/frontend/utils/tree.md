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
