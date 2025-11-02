# 用户接口

## 介绍

用户接口(userApi)是RuoYi-Plus-UniApp移动端应用的用户管理核心模块,提供完整的用户信息管理、个人资料维护、密码修改、头像上传等功能。该模块涵盖了从获取当前登录用户信息、查询用户列表、用户CRUD操作到个人资料管理的全套API接口,支持多租户环境下的用户管理、部门组织架构关联、角色权限绑定等企业级应用场景。

**核心特性:**

- **用户信息获取** - 获取当前登录用户详细信息、个人资料、权限角色等数据
- **个人资料管理** - 修改个人资料、更新密码、上传头像等自助服务
- **用户列表查询** - 支持分页查询、多条件筛选、部门角色过滤等高级查询
- **用户CRUD操作** - 新增用户、修改用户信息、删除用户等管理功能
- **密码安全管理** - 密码修改、密码重置、RSA加密传输保障安全
- **头像上传管理** - 头像图片上传、裁剪、存储管理
- **角色权限关联** - 查询用户角色、授权角色、权限验证
- **部门组织管理** - 按部门查询用户、部门用户列表
- **用户状态控制** - 启用禁用用户账号、状态变更
- **批量操作支持** - 批量删除用户、批量查询用户选项
- **数据权限隔离** - 多租户数据隔离、部门数据权限
- **TypeScript类型安全** - 完整的类型定义和智能提示

参考: src/api/system/core/user/userApi.ts:1-175

## API列表

### 1. getUserInfo - 获取当前用户信息

获取当前登录用户的详细信息,包括用户基本信息、角色列表、权限列表。该接口通常在登录成功后立即调用,用于初始化用户上下文和权限验证。

**请求方法:** GET

**请求路径:** `/system/user/getUserInfo`

**请求参数:** 无(自动携带Token)

**响应数据:**

```typescript
interface UserInfoVo {
  /** 用户基本信息 */
  user: SysUserVo
  /** 角色标识符列表 */
  roles: string[]
  /** 权限标识符列表 */
  permissions: string[]
}

interface SysUserVo {
  /** 用户ID */
  userId: string | number
  /** 租户ID */
  tenantId: string
  /** 部门ID */
  deptId: string | number
  /** 用户账号 */
  userName: string
  /** 用户昵称 */
  nickName: string
  /** 用户类型 */
  userType: string
  /** 用户邮箱 */
  email: string
  /** 手机号码 */
  phone: string
  /** 用户性别 */
  gender: string
  /** 头像地址 */
  avatar: string
  /** 账号状态 */
  status: string
  /** 最后登录IP */
  loginIp: string
  /** 最后登录时间 */
  loginDate: string
  /** 备注 */
  remark: string
  /** 部门名称 */
  deptName: string
  /** 角色列表 */
  roles: SysRoleVo[]
  /** 是否管理员 */
  admin: boolean
  /** 创建时间 */
  createTime?: string
}
```

**使用示例:**

```vue
<template>
  <view class="user-profile">
    <view class="user-header">
      <image :src="userInfo.user.avatar" class="avatar" />
      <view class="user-basic">
        <text class="nickname">{{ userInfo.user.nickName }}</text>
        <text class="username">@{{ userInfo.user.userName }}</text>
      </view>
    </view>

    <view class="user-stats">
      <view class="stat-item">
        <text class="label">角色</text>
        <view class="roles">
          <wd-tag
            v-for="role in userInfo.roles"
            :key="role"
            type="primary"
            size="small"
          >
            {{ role }}
          </wd-tag>
        </view>
      </view>

      <view class="stat-item">
        <text class="label">权限数量</text>
        <text class="value">{{ userInfo.permissions.length }}</text>
      </view>
    </view>

    <view class="user-details">
      <wd-cell title="手机号" :value="userInfo.user.phone" />
      <wd-cell title="邮箱" :value="userInfo.user.email" />
      <wd-cell title="部门" :value="userInfo.user.deptName" />
      <wd-cell title="最后登录" :value="formatDate(userInfo.user.loginDate)" />
      <wd-cell title="登录IP" :value="userInfo.user.loginIp" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/api/system/core/user/userApi'
import type { UserInfoVo } from '@/api/system/core/user/userTypes'
import { formatDate } from '@/utils/date'
import { to } from '@/utils/to'

const userInfo = ref<UserInfoVo>({
  user: {} as any,
  roles: [],
  permissions: []
})

// 加载用户信息
const loadUserInfo = async () => {
  const [error, data] = await to(getUserInfo())

  if (error) {
    uni.showToast({
      title: '获取用户信息失败',
      icon: 'none'
    })
    return
  }

  userInfo.value = data

  // 检查权限
  console.log('用户权限:', data.permissions)
  console.log('用户角色:', data.roles)
  console.log('是否管理员:', data.user.admin)
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.user-profile {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background-color: white;
  margin-bottom: 20rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 30rpx;
  }

  .user-basic {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;

    .nickname {
      font-size: 36rpx;
      font-weight: bold;
    }

    .username {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.user-stats {
  padding: 30rpx 40rpx;
  background-color: white;
  margin-bottom: 20rpx;

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 28rpx;
      color: #666;
    }

    .roles {
      display: flex;
      gap: 16rpx;
      flex-wrap: wrap;
    }

    .value {
      font-size: 32rpx;
      font-weight: bold;
      color: #4D80F0;
    }
  }
}

.user-details {
  background-color: white;
}
</style>
```

**技术实现:**

- 登录成功后自动调用获取用户完整信息
- 返回的权限列表用于前端权限验证
- 角色列表用于角色判断和显示
- 用户信息存储到Pinia Store供全局使用

参考: src/api/system/core/user/userApi.ts:19-21

### 2. getUserProfile - 获取用户个人资料

获取当前登录用户的个人资料信息,包括用户基本信息、所属角色组、所属岗位组。该接口用于个人中心展示和个人资料编辑。

**请求方法:** GET

**请求路径:** `/system/user/getUserProfile`

**请求参数:** 无

**响应数据:**

```typescript
interface ProfileVo {
  /** 用户信息 */
  user: SysUserVo
  /** 用户所属角色组 */
  roleGroup: string
  /** 用户所属岗位组 */
  postGroup: string
}
```

**使用示例:**

```vue
<template>
  <view class="profile-page">
    <wd-cell-group title="基本信息">
      <wd-cell
        title="头像"
        is-link
        @click="goToAvatarUpload"
      >
        <template #value>
          <image :src="profile.user.avatar" class="avatar-preview" />
        </template>
      </wd-cell>

      <wd-cell
        title="昵称"
        :value="profile.user.nickName"
        is-link
        @click="editNickname"
      />

      <wd-cell
        title="手机号"
        :value="profile.user.phone"
        is-link
        @click="editPhone"
      />

      <wd-cell
        title="邮箱"
        :value="profile.user.email"
        is-link
        @click="editEmail"
      />

      <wd-cell
        title="性别"
        :value="getGenderLabel(profile.user.gender)"
        is-link
        @click="editGender"
      />
    </wd-cell-group>

    <wd-cell-group title="组织信息">
      <wd-cell title="部门" :value="profile.user.deptName" />
      <wd-cell title="角色" :value="profile.roleGroup" />
      <wd-cell title="岗位" :value="profile.postGroup" />
    </wd-cell-group>

    <view class="button-section">
      <wd-button
        type="primary"
        block
        @click="goToEditProfile"
      >
        编辑资料
      </wd-button>

      <wd-button
        block
        custom-style="margin-top: 16rpx"
        @click="goToChangePassword"
      >
        修改密码
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getUserProfile } from '@/api/system/core/user/userApi'
import type { ProfileVo } from '@/api/system/core/user/userTypes'
import { to } from '@/utils/to'

const profile = ref<ProfileVo>({
  user: {} as any,
  roleGroup: '',
  postGroup: ''
})

// 性别映射
const getGenderLabel = (gender: string): string => {
  const map: Record<string, string> = {
    '0': '未知',
    '1': '男',
    '2': '女'
  }
  return map[gender] || '未知'
}

// 加载个人资料
const loadProfile = async () => {
  const [error, data] = await to(getUserProfile())

  if (error) {
    uni.showToast({
      title: '获取个人资料失败',
      icon: 'none'
    })
    return
  }

  profile.value = data
}

// 编辑资料
const goToEditProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/edit'
  })
}

// 修改密码
const goToChangePassword = () => {
  uni.navigateTo({
    url: '/pages/profile/change-password'
  })
}

// 上传头像
const goToAvatarUpload = () => {
  uni.navigateTo({
    url: '/pages/profile/avatar-upload'
  })
}

// 编辑昵称
const editNickname = () => {
  uni.navigateTo({
    url: '/pages/profile/edit-field?field=nickName&value=' + profile.value.user.nickName
  })
}

// 编辑手机号
const editPhone = () => {
  uni.navigateTo({
    url: '/pages/profile/edit-field?field=phone&value=' + profile.value.user.phone
  })
}

// 编辑邮箱
const editEmail = () => {
  uni.navigateTo({
    url: '/pages/profile/edit-field?field=email&value=' + profile.value.user.email
  })
}

// 编辑性别
const editGender = () => {
  uni.navigateTo({
    url: '/pages/profile/edit-field?field=gender&value=' + profile.value.user.gender
  })
}

onMounted(() => {
  loadProfile()
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.avatar-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

**技术实现:**

- 返回角色组和岗位组的逗号分隔字符串
- 用于个人中心展示用户所属组织信息
- 配合updateUserProfile接口实现资料编辑

参考: src/api/system/core/user/userApi.ts:27-29

### 3. pageUsers - 分页查询用户列表

分页查询用户列表,支持按用户名、手机号、状态、部门、角色等条件筛选。

**请求方法:** GET

**请求路径:** `/system/user/pageUsers`

**请求参数:**

```typescript
interface SysUserQuery extends PageQuery {
  /** 用户账号 */
  userName?: string
  /** 手机号码 */
  phone?: string
  /** 账号状态(0-正常,1-停用) */
  status?: string
  /** 部门ID */
  deptId?: string | number
  /** 角色ID */
  roleId?: string | number
  /** 用户ID列表 */
  userIds?: string | number
}
```

**响应数据:**

```typescript
interface PageResult<SysUserVo> {
  /** 数据列表 */
  rows: SysUserVo[]
  /** 总记录数 */
  total: number
}
```

**使用示例:**

```vue
<template>
  <view class="user-list-page">
    <wd-navbar title="用户管理" />

    <!-- 搜索栏 -->
    <view class="search-section">
      <wd-search
        v-model="queryParams.userName"
        placeholder="搜索用户名或手机号"
        @search="handleSearch"
        @clear="handleClear"
      />

      <wd-button
        size="small"
        @click="showFilterPopup = true"
      >
        筛选
      </wd-button>
    </view>

    <!-- 用户列表 -->
    <view class="user-list">
      <wd-cell-group>
        <wd-cell
          v-for="user in userList"
          :key="user.userId"
          :title="user.nickName"
          :label="`@${user.userName} | ${user.phone}`"
          is-link
          @click="handleUserClick(user)"
        >
          <template #icon>
            <image :src="user.avatar" class="user-avatar" />
          </template>

          <template #right-icon>
            <wd-tag
              :type="user.status === '0' ? 'success' : 'danger'"
              size="small"
            >
              {{ user.status === '0' ? '正常' : '停用' }}
            </wd-tag>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <!-- 分页加载 -->
    <wd-loadmore
      :state="loadState"
      @reload="loadUsers"
    />

    <!-- 筛选弹窗 -->
    <wd-popup
      v-model="showFilterPopup"
      position="bottom"
      custom-style="height: 600rpx"
    >
      <view class="filter-popup">
        <text class="title">筛选条件</text>

        <wd-cell-group>
          <wd-picker
            v-model="queryParams.status"
            label="状态"
            :columns="statusOptions"
            placeholder="请选择状态"
          />

          <wd-picker
            v-model="queryParams.deptId"
            label="部门"
            :columns="deptOptions"
            placeholder="请选择部门"
          />

          <wd-picker
            v-model="queryParams.roleId"
            label="角色"
            :columns="roleOptions"
            placeholder="请选择角色"
          />
        </wd-cell-group>

        <view class="filter-buttons">
          <wd-button
            block
            @click="resetFilter"
          >
            重置
          </wd-button>

          <wd-button
            type="primary"
            block
            @click="applyFilter"
          >
            确定
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { pageUsers } from '@/api/system/core/user/userApi'
import type { SysUserQuery, SysUserVo } from '@/api/system/core/user/userTypes'
import { to } from '@/utils/to'

const userList = ref<SysUserVo[]>([])
const loadState = ref<'loading' | 'finished' | 'error'>('loading')
const showFilterPopup = ref(false)

const queryParams = reactive<SysUserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phone: '',
  status: '',
  deptId: '',
  roleId: ''
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const deptOptions = ref([
  { label: '全部', value: '' }
])

const roleOptions = ref([
  { label: '全部', value: '' }
])

// 加载用户列表
const loadUsers = async (refresh = false) => {
  if (refresh) {
    queryParams.pageNum = 1
    userList.value = []
  }

  loadState.value = 'loading'

  const [error, data] = await to(pageUsers(queryParams))

  if (error) {
    loadState.value = 'error'
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    return
  }

  if (refresh) {
    userList.value = data.rows
  } else {
    userList.value.push(...data.rows)
  }

  // 判断是否还有更多数据
  if (userList.value.length >= data.total) {
    loadState.value = 'finished'
  } else {
    loadState.value = 'loading'
    queryParams.pageNum++
  }
}

// 搜索
const handleSearch = () => {
  loadUsers(true)
}

// 清空搜索
const handleClear = () => {
  queryParams.userName = ''
  loadUsers(true)
}

// 用户点击
const handleUserClick = (user: SysUserVo) => {
  uni.navigateTo({
    url: `/pages/user/detail?userId=${user.userId}`
  })
}

// 重置筛选
const resetFilter = () => {
  queryParams.status = ''
  queryParams.deptId = ''
  queryParams.roleId = ''
}

// 应用筛选
const applyFilter = () => {
  showFilterPopup.value = false
  loadUsers(true)
}

onMounted(() => {
  loadUsers(true)
})
</script>

<style lang="scss" scoped>
.user-list-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background-color: white;
  margin-bottom: 20rpx;
}

.user-list {
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.filter-popup {
  padding: 40rpx;

  .title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
    display: block;
  }

  .filter-buttons {
    display: flex;
    gap: 20rpx;
    margin-top: 40rpx;
  }
}
</style>
```

**技术实现:**

- 支持分页加载,下拉刷新和上拉加载更多
- 多条件组合查询,支持用户名、手机号、状态、部门、角色筛选
- 返回用户列表包含头像、状态、部门等完整信息

参考: src/api/system/core/user/userApi.ts:36-38

### 4. getUser - 获取用户详情

根据用户ID获取用户详细信息,包括用户基本信息、角色列表、岗位列表等。

**请求方法:** GET

**请求路径:** `/system/user/getUser/{userId}`

**请求参数:**

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| userId | 用户ID | `string \| number` | 是 |

**响应数据:**

```typescript
interface SysUserInfoVo {
  /** 用户信息 */
  user: SysUserVo
  /** 角色列表 */
  roles: SysRoleVo[]
  /** 角色ID列表 */
  roleIds: string[]
  /** 岗位列表 */
  posts: SysPostVo[]
  /** 岗位ID列表 */
  postIds: string[]
}
```

**使用示例:**

```vue
<template>
  <view class="user-detail-page">
    <wd-navbar :title="userDetail.user.nickName" />

    <view class="user-header">
      <image :src="userDetail.user.avatar" class="avatar" />
      <view class="user-info">
        <text class="nickname">{{ userDetail.user.nickName }}</text>
        <text class="username">@{{ userDetail.user.userName }}</text>
      </view>
    </view>

    <wd-cell-group title="基本信息">
      <wd-cell title="手机号" :value="userDetail.user.phone" />
      <wd-cell title="邮箱" :value="userDetail.user.email" />
      <wd-cell title="性别" :value="getGenderLabel(userDetail.user.gender)" />
      <wd-cell title="部门" :value="userDetail.user.deptName" />
      <wd-cell
        title="状态"
        :value="userDetail.user.status === '0' ? '正常' : '停用'"
      />
    </wd-cell-group>

    <wd-cell-group title="角色信息">
      <view class="roles-list">
        <wd-tag
          v-for="role in userDetail.roles"
          :key="role.roleId"
          type="primary"
        >
          {{ role.roleName }}
        </wd-tag>
      </view>
    </wd-cell-group>

    <wd-cell-group title="岗位信息">
      <view class="posts-list">
        <wd-tag
          v-for="post in userDetail.posts"
          :key="post.postId"
          type="success"
        >
          {{ post.postName }}
        </wd-tag>
      </view>
    </wd-cell-group>

    <view class="button-section" v-if="canManageUser">
      <wd-button
        type="primary"
        block
        @click="handleEdit"
      >
        编辑用户
      </wd-button>

      <wd-button
        type="warning"
        block
        custom-style="margin-top: 16rpx"
        @click="handleResetPassword"
      >
        重置密码
      </wd-button>

      <wd-button
        type="danger"
        block
        custom-style="margin-top: 16rpx"
        @click="handleDelete"
      >
        删除用户
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { getUser, resetUserPwd, deleteUsers } from '@/api/system/core/user/userApi'
import type { SysUserInfoVo } from '@/api/system/core/user/userTypes'
import { useAuth } from '@/composables/useAuth'
import { to } from '@/utils/to'

const { hasPermission } = useAuth()

const userId = ref('')
const userDetail = ref<SysUserInfoVo>({
  user: {} as any,
  roles: [],
  roleIds: [],
  posts: [],
  postIds: []
})

// 是否有用户管理权限
const canManageUser = computed(() => {
  return hasPermission('system:user:edit')
})

// 性别映射
const getGenderLabel = (gender: string): string => {
  const map: Record<string, string> = {
    '0': '未知',
    '1': '男',
    '2': '女'
  }
  return map[gender] || '未知'
}

// 加载用户详情
const loadUserDetail = async () => {
  const [error, data] = await to(getUser(userId.value))

  if (error) {
    uni.showToast({
      title: '获取用户详情失败',
      icon: 'none'
    })
    return
  }

  userDetail.value = data
}

// 编辑用户
const handleEdit = () => {
  uni.navigateTo({
    url: `/pages/user/edit?userId=${userId.value}`
  })
}

// 重置密码
const handleResetPassword = () => {
  uni.showModal({
    title: '重置密码',
    content: '确定要重置该用户的密码为默认密码123456吗?',
    success: async (res) => {
      if (!res.confirm) return

      const [error] = await to(resetUserPwd(userId.value, '123456'))

      if (error) {
        uni.showToast({
          title: '重置失败',
          icon: 'none'
        })
        return
      }

      uni.showToast({
        title: '密码已重置',
        icon: 'success'
      })
    }
  })
}

// 删除用户
const handleDelete = () => {
  uni.showModal({
    title: '删除用户',
    content: `确定要删除用户"${userDetail.value.user.nickName}"吗?`,
    success: async (res) => {
      if (!res.confirm) return

      const [error] = await to(deleteUsers(userId.value))

      if (error) {
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
        return
      }

      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    }
  })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options

  userId.value = options.userId

  if (userId.value) {
    loadUserDetail()
  }
})
</script>

<style lang="scss" scoped>
.user-detail-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background-color: white;
  margin-bottom: 20rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 30rpx;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;

    .nickname {
      font-size: 36rpx;
      font-weight: bold;
    }

    .username {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.roles-list,
.posts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 30rpx;
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

**技术实现:**

- 获取用户完整信息包括角色和岗位
- 配合权限验证控制操作按钮显示
- 用于用户详情展示和管理操作

参考: src/api/system/core/user/userApi.ts:45-47

### 5. updateUserProfile - 修改个人资料

修改当前登录用户的个人资料信息。

**请求方法:** PUT

**请求路径:** `/system/user/updateUserProfile`

**请求参数:**

```typescript
interface SysUserBo {
  /** 用户昵称 */
  nickName?: string
  /** 手机号码 */
  phone?: string
  /** 用户邮箱 */
  email?: string
  /** 用户性别(0-未知,1-男,2-女) */
  gender?: string
  /** 备注 */
  remark?: string
}
```

**响应数据:**

```typescript
interface Result<void> {
  /** 是否成功 */
  success: boolean
  /** 提示信息 */
  msg: string
}
```

**使用示例:**

```vue
<template>
  <view class="edit-profile-page">
    <wd-navbar title="编辑资料" />

    <wd-cell-group>
      <wd-input
        v-model="formData.nickName"
        label="昵称"
        placeholder="请输入昵称"
        required
      />

      <wd-input
        v-model="formData.phone"
        type="number"
        label="手机号"
        placeholder="请输入手机号"
      />

      <wd-input
        v-model="formData.email"
        label="邮箱"
        placeholder="请输入邮箱"
      />

      <wd-picker
        v-model="formData.gender"
        label="性别"
        :columns="genderOptions"
      />

      <wd-textarea
        v-model="formData.remark"
        label="个人简介"
        placeholder="请输入个人简介"
        maxlength="200"
      />
    </wd-cell-group>

    <view class="button-section">
      <wd-button
        type="primary"
        block
        :loading="loading"
        @click="handleSave"
      >
        保存
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserProfile, updateUserProfile } from '@/api/system/core/user/userApi'
import type { SysUserBo } from '@/api/system/core/user/userTypes'
import { useUserStore } from '@/stores/user'
import { isEmail, isChinesePhoneNumber } from '@/utils/validators'
import { to } from '@/utils/to'

const userStore = useUserStore()
const loading = ref(false)

const genderOptions = [
  { label: '未知', value: '0' },
  { label: '男', value: '1' },
  { label: '女', value: '2' }
]

const formData = reactive<SysUserBo>({
  userName: '',
  password: '',
  nickName: '',
  phone: '',
  email: '',
  gender: '0',
  status: '0',
  remark: '',
  postIds: [],
  roleIds: []
})

// 加载个人资料
const loadProfile = async () => {
  const [error, data] = await to(getUserProfile())

  if (error) {
    return
  }

  formData.nickName = data.user.nickName
  formData.phone = data.user.phone
  formData.email = data.user.email
  formData.gender = data.user.gender
  formData.remark = data.user.remark
}

// 保存资料
const handleSave = async () => {
  // 表单验证
  if (!formData.nickName) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  if (formData.phone && !isChinesePhoneNumber(formData.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  if (formData.email && !isEmail(formData.email)) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return
  }

  loading.value = true

  const [error] = await to(updateUserProfile({
    nickName: formData.nickName,
    phone: formData.phone,
    email: formData.email,
    gender: formData.gender,
    remark: formData.remark
  } as SysUserBo))

  loading.value = false

  if (error) {
    uni.showToast({
      title: error.msg || '保存失败',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })

  // 刷新用户信息
  await userStore.getUserInfo()

  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}

onMounted(() => {
  loadProfile()
})
</script>

<style lang="scss" scoped>
.edit-profile-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

**技术实现:**

- 只能修改当前登录用户的个人资料
- 手机号和邮箱需要格式验证
- 保存成功后刷新Store中的用户信息

参考: src/api/system/core/user/userApi.ts:102-104

### 6. updateUserPwd - 修改个人密码

修改当前登录用户的登录密码,需要验证旧密码。

**请求方法:** PUT

**请求路径:** `/system/user/updateUserPwd`

**请求参数:**

```typescript
interface SysUserPasswordBo {
  /** 旧密码 */
  oldPassword: string
  /** 新密码 */
  newPassword: string
  /** 确认新密码 */
  confirmPassword: string
}
```

**响应数据:**

```typescript
interface Result<void> {
  success: boolean
  msg: string
}
```

**使用示例:**

```vue
<template>
  <view class="change-password-page">
    <wd-navbar title="修改密码" />

    <wd-cell-group>
      <wd-input
        v-model="formData.oldPassword"
        type="password"
        label="旧密码"
        placeholder="请输入旧密码"
        required
      />

      <wd-input
        v-model="formData.newPassword"
        type="password"
        label="新密码"
        placeholder="请输入新密码(6-20位)"
        required
      />

      <wd-input
        v-model="formData.confirmPassword"
        type="password"
        label="确认密码"
        placeholder="请再次输入新密码"
        required
      />
    </wd-cell-group>

    <view class="tips">
      <text class="tip-title">密码要求:</text>
      <text class="tip-item">• 长度6-20位</text>
      <text class="tip-item">• 必须包含字母和数字</text>
      <text class="tip-item">• 可包含特殊字符</text>
    </view>

    <view class="button-section">
      <wd-button
        type="primary"
        block
        :loading="loading"
        @click="handleSubmit"
      >
        确定修改
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { updateUserPwd } from '@/api/system/core/user/userApi'
import { userLogout } from '@/api/system/auth/authApi'
import type { SysUserPasswordBo } from '@/api/system/core/user/userTypes'
import { useUserStore } from '@/stores/user'
import { isPassword } from '@/utils/validators'
import { to } from '@/utils/to'

const userStore = useUserStore()
const loading = ref(false)

const formData = reactive<SysUserPasswordBo>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 提交修改
const handleSubmit = async () => {
  // 表单验证
  if (!formData.oldPassword) {
    uni.showToast({ title: '请输入旧密码', icon: 'none' })
    return
  }

  if (!formData.newPassword) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return
  }

  if (!isPassword(formData.newPassword, { minLength: 6, maxLength: 20 })) {
    uni.showToast({
      title: '密码格式不正确',
      icon: 'none'
    })
    return
  }

  if (formData.newPassword !== formData.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  if (formData.oldPassword === formData.newPassword) {
    uni.showToast({ title: '新密码不能与旧密码相同', icon: 'none' })
    return
  }

  loading.value = true

  const [error] = await to(updateUserPwd(formData))

  loading.value = false

  if (error) {
    uni.showToast({
      title: error.msg || '修改失败',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '修改成功',
    content: '密码已修改,请重新登录',
    showCancel: false,
    success: async () => {
      // 退出登录
      await to(userLogout())
      await userStore.logout()

      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.change-password-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.tips {
  padding: 30rpx 40rpx;
  background-color: #fff3cd;
  margin: 20rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .tip-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #856404;
  }

  .tip-item {
    font-size: 24rpx;
    color: #856404;
  }
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

**技术实现:**

- 密码使用RSA加密传输
- 需要验证旧密码正确性
- 修改成功后自动退出登录,要求重新登录

参考: src/api/system/core/user/userApi.ts:111-120

### 7. uploadAvatar - 上传用户头像

上传当前登录用户的头像图片。

**请求方法:** POST

**请求路径:** `/system/user/uploadAvatar`

**请求参数:**

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| data | 头像文件(FormData) | `FormData` | 是 |

**响应数据:**

```typescript
interface Result<void> {
  success: boolean
  msg: string
}
```

**使用示例:**

```vue
<template>
  <view class="avatar-upload-page">
    <wd-navbar title="上传头像" />

    <view class="avatar-preview">
      <image :src="avatarUrl" class="avatar" />
      <text class="tip">点击下方按钮选择图片</text>
    </view>

    <view class="button-section">
      <wd-button
        type="primary"
        block
        @click="chooseImage"
      >
        选择图片
      </wd-button>

      <wd-button
        type="success"
        block
        custom-style="margin-top: 16rpx"
        :loading="uploading"
        :disabled="!avatarUrl"
        @click="handleUpload"
      >
        上传头像
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { uploadAvatar, getUserProfile } from '@/api/system/core/user/userApi'
import { useUserStore } from '@/stores/user'
import { to } from '@/utils/to'

const userStore = useUserStore()
const avatarUrl = ref('')
const uploading = ref(false)
const tempFilePath = ref('')

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      tempFilePath.value = res.tempFilePaths[0]
      avatarUrl.value = tempFilePath.value
    }
  })
}

// 上传头像
const handleUpload = async () => {
  if (!tempFilePath.value) {
    uni.showToast({ title: '请先选择图片', icon: 'none' })
    return
  }

  uploading.value = true

  // 创建FormData
  const formData = new FormData()

  // #ifdef H5
  // H5端需要将文件转换为Blob
  const response = await fetch(tempFilePath.value)
  const blob = await response.blob()
  formData.append('file', blob, 'avatar.jpg')
  // #endif

  // #ifndef H5
  // 小程序和APP使用uni.uploadFile
  uni.uploadFile({
    url: http.baseURL + '/system/user/uploadAvatar',
    filePath: tempFilePath.value,
    name: 'file',
    header: {
      'Authorization': 'Bearer ' + userStore.token
    },
    success: async (uploadRes) => {
      const result = JSON.parse(uploadRes.data)

      if (result.code === 200) {
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })

        // 刷新用户信息
        await userStore.getUserInfo()

        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } else {
        uni.showToast({
          title: result.msg || '上传失败',
          icon: 'none'
        })
      }
    },
    fail: () => {
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      })
    },
    complete: () => {
      uploading.value = false
    }
  })
  return
  // #endif

  // H5端使用axios上传
  const [error] = await to(uploadAvatar(formData))

  uploading.value = false

  if (error) {
    uni.showToast({
      title: '上传失败',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '上传成功',
    icon: 'success'
  })

  // 刷新用户信息
  await userStore.getUserInfo()

  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}

// 加载当前头像
const loadCurrentAvatar = async () => {
  const [error, data] = await to(getUserProfile())

  if (error) return

  avatarUrl.value = data.user.avatar
}

onMounted(() => {
  loadCurrentAvatar()
})
</script>

<style lang="scss" scoped>
.avatar-upload-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.avatar-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  background-color: white;
  margin-bottom: 20rpx;

  .avatar {
    width: 300rpx;
    height: 300rpx;
    border-radius: 50%;
    margin-bottom: 30rpx;
    border: 2rpx solid #eee;
  }

  .tip {
    font-size: 28rpx;
    color: #999;
  }
}

.button-section {
  padding: 40rpx 20rpx;
}
</style>
```

**技术实现:**

- 支持从相册选择或拍照
- H5端和小程序/APP端上传方式不同
- 上传成功后自动刷新用户信息
- 图片会自动压缩以减小上传体积

参考: src/api/system/core/user/userApi.ts:172-174

## 类型定义

### 完整类型定义

```typescript
/**
 * 用户查询参数
 */
export interface SysUserQuery extends PageQuery {
  /** 用户账号 */
  userName?: string
  /** 手机号码 */
  phone?: string
  /** 账号状态(0-正常,1-停用) */
  status?: string
  /** 部门ID */
  deptId?: string | number
  /** 角色ID */
  roleId?: string | number
  /** 用户ID列表 */
  userIds?: string | number
}

/**
 * 用户表单对象
 */
export interface SysUserBo {
  /** 用户ID */
  userId?: string | number
  /** 部门ID */
  deptId?: string | number
  /** 用户账号 */
  userName: string
  /** 用户昵称 */
  nickName?: string
  /** 密码 */
  password: string
  /** 手机号码 */
  phone?: string
  /** 用户邮箱 */
  email?: string
  /** 用户性别(0-未知,1-男,2-女) */
  gender?: string
  /** 账号状态(0-正常,1-停用) */
  status: string
  /** 备注 */
  remark?: string
  /** 岗位ID列表 */
  postIds: string[]
  /** 角色ID列表 */
  roleIds: string[]
}

/**
 * 用户信息视图对象
 */
export interface SysUserVo {
  /** 用户ID */
  userId: string | number
  /** 租户ID */
  tenantId: string
  /** 部门ID */
  deptId: string | number
  /** 用户账号 */
  userName: string
  /** 用户昵称 */
  nickName: string
  /** 用户类型 */
  userType: string
  /** 用户邮箱 */
  email: string
  /** 手机号码 */
  phone: string
  /** 用户性别 */
  gender: string
  /** 头像地址 */
  avatar: string
  /** 账号状态 */
  status: string
  /** 最后登录IP */
  loginIp: string
  /** 最后登录时间 */
  loginDate: string
  /** 备注 */
  remark: string
  /** 部门名称 */
  deptName: string
  /** 角色列表 */
  roles: SysRoleVo[]
  /** 角色ID列表 */
  roleIds: any
  /** 岗位ID列表 */
  postIds: any
  /** 角色ID */
  roleId: any
  /** 是否管理员 */
  admin: boolean
  /** 创建时间 */
  createTime?: string
}

/**
 * 用户详细信息(含权限)
 */
export interface UserInfoVo {
  /** 用户基本信息 */
  user: SysUserVo
  /** 角色标识符列表 */
  roles: string[]
  /** 权限标识符列表 */
  permissions: string[]
}

/**
 * 用户个人资料
 */
export interface ProfileVo {
  /** 用户信息 */
  user: SysUserVo
  /** 用户所属角色组 */
  roleGroup: string
  /** 用户所属岗位组 */
  postGroup: string
}

/**
 * 用户详情信息
 */
export interface SysUserInfoVo {
  /** 用户信息 */
  user: SysUserVo
  /** 角色列表 */
  roles: SysRoleVo[]
  /** 角色ID列表 */
  roleIds: string[]
  /** 岗位列表 */
  posts: SysPostVo[]
  /** 岗位ID列表 */
  postIds: string[]
}

/**
 * 用户密码修改对象
 */
export interface SysUserPasswordBo {
  /** 旧密码 */
  oldPassword: string
  /** 新密码 */
  newPassword: string
  /** 确认新密码 */
  confirmPassword: string
}
```

参考: src/api/system/core/user/userTypes.ts:1-184

## 最佳实践

### 1. 登录后初始化用户信息

登录成功后立即调用getUserInfo获取完整用户信息:

```typescript
// ✅ 推荐: 登录后立即获取用户信息
import { userLogin } from '@/api/system/auth/authApi'
import { getUserInfo } from '@/api/system/core/user/userApi'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const handleLogin = async (credentials) => {
  // 1. 登录获取Token
  const [loginError, tokenData] = await to(userLogin(credentials))
  if (loginError) return

  // 2. 存储Token
  userStore.setToken(tokenData.accessToken)

  // 3. 获取用户详细信息
  const [infoError, userInfo] = await to(getUserInfo())
  if (infoError) return

  // 4. 存储用户信息和权限
  userStore.setUserInfo(userInfo)

  // 5. 跳转到首页
  uni.switchTab({ url: '/pages/index/index' })
}
```

**优势:**
- 完整获取用户权限和角色
- 初始化权限验证上下文
- 确保后续页面可用用户信息

参考: src/api/system/core/user/userApi.ts:19-21

### 2. 个人资料修改后刷新Store

修改个人资料后,务必刷新Store中的用户信息:

```typescript
// ✅ 推荐: 修改后刷新Store
const handleSaveProfile = async (profileData) => {
  const [error] = await to(updateUserProfile(profileData))
  if (error) return

  // 刷新Store中的用户信息
  await userStore.getUserInfo()

  uni.showToast({ title: '保存成功', icon: 'success' })
}

// ❌ 不推荐: 只修改不刷新
const handleSaveProfileBad = async (profileData) => {
  await updateUserProfile(profileData)
  // 未刷新Store,导致页面显示的信息不更新
}
```

参考: src/api/system/core/user/userApi.ts:102-104

### 3. 密码修改强制重新登录

修改密码后,强制用户重新登录以确保安全:

```typescript
// ✅ 推荐: 修改密码后强制重新登录
const handleChangePassword = async (passwordData) => {
  const [error] = await to(updateUserPwd(passwordData))
  if (error) return

  uni.showModal({
    title: '修改成功',
    content: '密码已修改,请重新登录',
    showCancel: false,
    success: async () => {
      // 退出登录
      await userStore.logout()

      // 跳转登录页
      uni.reLaunch({ url: '/pages/login/index' })
    }
  })
}
```

**安全要点:**
- 清除本地Token和用户信息
- 使用reLaunch清空页面栈
- 避免旧Token继续使用

参考: src/api/system/core/user/userApi.ts:111-120

### 4. 头像上传前压缩处理

上传头像前进行图片压缩,减少上传时间和流量:

```typescript
// ✅ 推荐: 上传前压缩
const uploadAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'], // 自动压缩
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      // 上传压缩后的图片
      await uploadAvatarFile(tempFilePath)
    }
  })
}

// ❌ 不推荐: 上传原图
const uploadAvatarBad = () => {
  uni.chooseImage({
    sizeType: ['original'], // 原图,文件过大
    success: async (res) => {
      // 上传可能很慢
      await uploadAvatarFile(res.tempFilePaths[0])
    }
  })
}
```

参考: src/api/system/core/user/userApi.ts:172-174

### 5. 用户列表分页加载优化

实现高效的分页加载和缓存策略:

```typescript
// ✅ 推荐: 带缓存的分页加载
const userList = ref<SysUserVo[]>([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 20
})

const loadUsers = async (refresh = false) => {
  if (refresh) {
    queryParams.pageNum = 1
    userList.value = []
  }

  const [error, data] = await to(pageUsers(queryParams))
  if (error) return

  if (refresh) {
    userList.value = data.rows
  } else {
    userList.value.push(...data.rows)
  }

  if (userList.value.length < data.total) {
    queryParams.pageNum++
  }
}

// 下拉刷新
const onRefresh = () => {
  loadUsers(true)
}

// 上拉加载更多
const onLoadMore = () => {
  loadUsers(false)
}
```

参考: src/api/system/core/user/userApi.ts:36-38

## 注意事项

### 1. 用户状态说明

用户状态字段值:

- `'0'`: 正常(可登录)
- `'1'`: 停用(无法登录)

停用的用户无法登录系统,但数据仍保留。

### 2. 用户性别值

性别字段值:

- `'0'`: 未知
- `'1'`: 男
- `'2'`: 女

### 3. 管理员用户限制

admin字段为true的用户是超级管理员,拥有所有权限,不能被删除或停用。

### 4. 密码安全要求

- 密码长度: 6-20位
- 必须包含字母和数字
- 可包含特殊字符
- 新密码不能与旧密码相同
- 密码传输使用RSA加密

参考: src/utils/validators.ts:653-679

### 5. 头像文件大小限制

- 最大文件大小: 2MB
- 支持格式: JPG, PNG, GIF
- 建议尺寸: 200x200像素
- 自动压缩和裁剪

### 6. 用户删除限制

以下用户不能删除:

- 超级管理员(admin=true)
- 当前登录用户自己
- 有关联业务数据的用户(根据业务规则)

删除用户会同时删除:

- 用户角色关联
- 用户岗位关联
- 用户部门关联

### 7. 多租户数据隔离

多租户模式下,用户数据按租户隔离:

- 每个租户只能查看和管理自己的用户
- tenantId字段标识用户所属租户
- 系统自动过滤其他租户的用户数据

### 8. 部门组织架构

用户必须关联到部门:

- deptId字段标识用户所属部门
- 用户继承部门的数据权限
- 部门删除时需先处理部门下的用户

---

通过合理使用用户接口API,可以实现完善的用户信息管理和个人资料维护功能。
