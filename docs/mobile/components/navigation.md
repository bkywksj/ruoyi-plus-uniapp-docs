# 导航组件

导航组件用于页面导航和内容切换，提供标签栏、导航栏、分页等功能。

## 组件列表

| 组件 | 说明 |
|------|------|
| Navbar | 顶部导航栏 |
| NavbarCapsule | 胶囊导航栏（小程序） |
| Tabbar | 底部标签栏 |
| Tabs | 选项卡切换 |
| Sidebar | 侧边栏导航 |
| Pagination | 分页器 |
| Paging | 滚动分页 |
| IndexBar | 索引栏 |
| Segmented | 分段控制器 |
| Steps | 步骤条 |
| Backtop | 返回顶部 |
| FloatingPanel | 浮动面板 |

## 快速使用

### Navbar 导航栏

```vue
<template>
  <wd-navbar title="页面标题" left-arrow @click-left="goBack">
    <template #right>
      <wd-icon name="more" />
    </template>
  </wd-navbar>
</template>
```

### Tabbar 标签栏

```vue
<template>
  <wd-tabbar v-model="active">
    <wd-tabbar-item icon="home" text="首页" />
    <wd-tabbar-item icon="category" text="分类" />
    <wd-tabbar-item icon="cart" text="购物车" badge="3" />
    <wd-tabbar-item icon="user" text="我的" />
  </wd-tabbar>
</template>
```

### Tabs 选项卡

```vue
<template>
  <wd-tabs v-model="activeTab">
    <wd-tab title="标签1" name="1">内容1</wd-tab>
    <wd-tab title="标签2" name="2">内容2</wd-tab>
    <wd-tab title="标签3" name="3">内容3</wd-tab>
  </wd-tabs>
</template>
```

### Sidebar 侧边栏

```vue
<template>
  <view class="page">
    <wd-sidebar v-model="activeKey">
      <wd-sidebar-item v-for="item in categories" :key="item.id" :title="item.name" />
    </wd-sidebar>
    <view class="content">
      {{ currentCategory }}
    </view>
  </view>
</template>
```

### Steps 步骤条

```vue
<template>
  <wd-steps :active="currentStep">
    <wd-step title="待付款" />
    <wd-step title="待发货" />
    <wd-step title="运输中" />
    <wd-step title="已完成" />
  </wd-steps>
</template>
```

### IndexBar 索引栏

```vue
<template>
  <wd-index-bar>
    <wd-index-anchor v-for="letter in letters" :key="letter" :index="letter">
      <wd-cell v-for="item in getItems(letter)" :key="item.id" :title="item.name" />
    </wd-index-anchor>
  </wd-index-bar>
</template>
```

### Paging 滚动分页

```vue
<template>
  <wd-paging
    v-model="list"
    @load="loadData"
    @refresh="refreshData"
  >
    <wd-cell v-for="item in list" :key="item.id" :title="item.title" />
  </wd-paging>
</template>
```

## 小程序胶囊导航

针对小程序的胶囊按钮适配：

```vue
<template>
  <wd-navbar-capsule title="页面标题" @click-left="goBack" />
</template>
```
