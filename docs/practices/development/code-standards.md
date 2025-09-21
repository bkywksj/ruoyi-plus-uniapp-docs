# 代码规范

RuoYi-Plus 项目的代码编写规范，包含命名规范、注释规范、代码结构等最佳实践。

## 📋 基本原则

### 1. 可读性优先

代码首先是给人阅读的，其次才是给机器执行的。

```java
// ✅ 好的代码 - 清晰易懂
public class UserService {

    public boolean isValidUser(User user) {
        return user != null
            && StringUtils.isNotBlank(user.getUsername())
            && StringUtils.isNotBlank(user.getEmail())
            && "0".equals(user.getStatus());
    }
}

// ❌ 不好的代码 - 难以理解
public class UserService {

    public boolean check(User u) {
        return u != null && !u.getUsername().isEmpty()
            && !u.getEmail().isEmpty() && u.getStatus().equals("0");
    }
}
```

### 2. 一致性原则

在整个项目中保持命名、结构、风格的一致性。

```java
// ✅ 一致的命名风格
public class UserController {
    public R<PageResult<UserVo>> pageUsers(UserQuery query) { }
    public R<UserVo> getUserById(Long id) { }
    public R<Void> createUser(UserBo bo) { }
    public R<Void> updateUser(UserBo bo) { }
    public R<Void> deleteUser(Long id) { }
}

// ❌ 不一致的命名风格
public class UserController {
    public R<PageResult<UserVo>> list(UserQuery query) { }
    public R<UserVo> detail(Long id) { }
    public R<Void> add(UserBo bo) { }
    public R<Void> edit(UserBo bo) { }
    public R<Void> remove(Long id) { }
}
```

### 3. 简单性原则

优先选择简单、直接的解决方案。

```java
// ✅ 简单直接
public String getUserStatusText(String status) {
    return "0".equals(status) ? "正常" : "停用";
}

// ❌ 过度复杂
public String getUserStatusText(String status) {
    Map<String, String> statusMap = new HashMap<>();
    statusMap.put("0", "正常");
    statusMap.put("1", "停用");
    return statusMap.getOrDefault(status, "未知");
}
```

## 🏷️ 命名规范

### Java 命名

```java
// 类名：大驼峰命名
public class UserController { }
public class DataTransferObject { }

// 方法名：小驼峰命名，动词开头
public void createUser() { }
public boolean isValidEmail() { }
public String getUserName() { }

// 变量名：小驼峰命名，名词
private String userName;
private boolean isActive;
private List<User> userList;

// 常量：全大写，下划线分隔
public static final String DEFAULT_PASSWORD = "123456";
public static final int MAX_RETRY_COUNT = 3;

// 包名：全小写，域名反写
com.ruoyi.system.controller
com.ruoyi.common.utils
```

### 数据库命名

```sql
-- 表名：小写，下划线分隔，前缀标识
sys_user          -- 系统用户表
sys_role          -- 系统角色表
b_product         -- 业务产品表
log_operation     -- 操作日志表

-- 字段名：小写，下划线分隔
user_id           -- 用户ID
user_name         -- 用户名
create_time       -- 创建时间
update_time       -- 更新时间

-- 索引名：表名_字段名_idx
idx_sys_user_username
idx_sys_user_email
idx_sys_user_create_time
```

### 前端命名

```typescript
// 组件名：大驼峰命名
const UserList = defineComponent({ })
const DataTable = defineComponent({ })

// 变量/函数名：小驼峰命名
const userName = ref('')
const isLoading = ref(false)
const fetchUserList = () => { }

// 常量：全大写，下划线分隔
const API_BASE_URL = '/api'
const DEFAULT_PAGE_SIZE = 10

// 文件名：短横线分隔
user-list.vue
data-table.vue
user-detail.vue
```

### 移动端命名

```typescript
// 页面目录：短横线分隔
pages/user-list/user-list.vue
pages/product-detail/product-detail.vue

// 组件：大驼峰命名
components/UserCard/UserCard.vue
components/ProductItem/ProductItem.vue

// 样式类：短横线分隔
.user-card { }
.product-item { }
.btn-primary { }

// CSS变量：双短横线开头
--primary-color: #409eff;
--border-radius: 4px;
```

## 📝 注释规范

### Java 注释

```java
/**
 * 用户服务接口
 *
 * @author ruoyi
 * @date 2023-01-01
 */
public interface IUserService {

    /**
     * 根据用户ID查询用户信息
     *
     * @param userId 用户ID
     * @return 用户信息
     * @throws ServiceException 当用户不存在时抛出异常
     */
    UserVo selectUserById(Long userId);

    /**
     * 分页查询用户列表
     *
     * @param bo 查询条件
     * @param pageQuery 分页参数
     * @return 分页结果
     */
    PageResult<UserVo> queryPageList(UserBo bo, PageQuery pageQuery);

    /**
     * 新增用户
     *
     * @param bo 用户信息
     * @return 用户ID
     */
    Long insertUser(UserBo bo);
}

/**
 * 用户服务实现类
 */
@Service
public class UserServiceImpl implements IUserService {

    @Resource
    private SysUserMapper baseMapper;

    @Override
    public UserVo selectUserById(Long userId) {
        // 参数校验
        Assert.notNull(userId, "用户ID不能为空");

        // 查询用户信息
        UserVo user = baseMapper.selectVoById(userId);
        if (ObjectUtil.isNull(user)) {
            throw new ServiceException("用户不存在");
        }

        // 查询用户角色信息
        List<SysRole> roles = roleMapper.selectRolesByUserId(userId);
        user.setRoles(roles);

        return user;
    }

    /**
     * 验证用户名是否唯一
     *
     * @param user 用户信息
     * @return true=唯一 false=不唯一
     */
    private boolean checkUserNameUnique(SysUser user) {
        Long userId = ObjectUtil.isNull(user.getUserId()) ? -1L : user.getUserId();
        SysUser info = baseMapper.checkUserNameUnique(user.getUserName());
        return ObjectUtil.isNull(info) || info.getUserId().equals(userId);
    }
}
```

### 前端注释

```typescript
/**
 * 用户管理页面
 *
 * @description 提供用户的增删改查功能
 * @author ruoyi
 * @date 2023-01-01
 */
export default defineComponent({
  name: 'UserList',

  setup() {
    const { proxy } = getCurrentInstance() as ComponentInternalInstance

    // 查询参数
    const queryParams = reactive<UserQuery>({
      pageNum: 1,
      pageSize: 10,
      userName: '',
      status: ''
    })

    /**
     * 查询用户列表
     */
    const getList = async () => {
      loading.value = true
      try {
        const response = await listUser(queryParams)
        userList.value = response.data.records
        total.value = response.data.total
      } catch (error) {
        console.error('查询用户列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    /**
     * 处理查询
     */
    const handleQuery = () => {
      queryParams.pageNum = 1
      getList()
    }

    /**
     * 重置查询条件
     */
    const resetQuery = () => {
      proxy?.resetForm('queryFormRef')
      handleQuery()
    }

    return {
      queryParams,
      getList,
      handleQuery,
      resetQuery
    }
  }
})
```

### 移动端注释

```vue
<template>
  <!-- 用户列表页面 -->
  <view class="user-list">
    <!-- 搜索栏 -->
    <wd-search
      v-model="searchValue"
      placeholder="搜索用户"
      @search="handleSearch"
    />

    <!-- 用户列表 -->
    <wd-cell-group>
      <wd-cell
        v-for="user in userList"
        :key="user.id"
        :title="user.nickname"
        :label="user.username"
        is-link
        @click="handleUserClick(user)"
      />
    </wd-cell-group>
  </view>
</template>

<script setup lang="ts">
/**
 * 用户列表页面
 *
 * @description 展示用户列表，支持搜索和查看详情
 */

interface UserItem {
  id: number
  username: string
  nickname: string
  avatar?: string
}

// 搜索关键词
const searchValue = ref('')

// 用户列表
const userList = ref<UserItem[]>([])

/**
 * 处理搜索
 * @param value 搜索关键词
 */
const handleSearch = (value: string) => {
  console.log('搜索用户:', value)
  // TODO: 实现搜索逻辑
}

/**
 * 处理用户点击
 * @param user 用户信息
 */
const handleUserClick = (user: UserItem) => {
  uni.navigateTo({
    url: `/pages/user/detail?id=${user.id}`
  })
}

// 页面加载时获取用户列表
onMounted(() => {
  // TODO: 获取用户列表
})
</script>
```

## 🏗️ 代码结构

### 控制器结构

```java
/**
 * 用户管理控制器
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/system/user")
public class SysUserController extends BaseController {

    private final IUserService userService;

    /**
     * 获取用户列表
     */
    @SaCheckPermission("system:user:list")
    @GetMapping("/list")
    public TableDataInfo<UserVo> list(UserBo user, PageQuery pageQuery) {
        return userService.queryPageList(user, pageQuery);
    }

    /**
     * 根据用户编号获取详细信息
     */
    @SaCheckPermission("system:user:query")
    @GetMapping(value = {"/", "/{userId}"})
    public R<UserVo> getInfo(@PathVariable(value = "userId", required = false) Long userId) {
        userService.checkUserDataScope(userId);
        return R.ok(userService.selectUserById(userId));
    }

    /**
     * 新增用户
     */
    @SaCheckPermission("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody UserBo user) {
        if (!userService.checkUserNameUnique(user)) {
            return R.fail("新增用户'" + user.getUserName() + "'失败，登录账号已存在");
        }
        if (StringUtils.isNotEmpty(user.getPhonenumber()) && !userService.checkPhoneUnique(user)) {
            return R.fail("新增用户'" + user.getUserName() + "'失败，手机号码已存在");
        }
        if (StringUtils.isNotEmpty(user.getEmail()) && !userService.checkEmailUnique(user)) {
            return R.fail("新增用户'" + user.getUserName() + "'失败，邮箱账号已存在");
        }
        user.setCreateBy(getUsername());
        user.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
        return toAjax(userService.insertUser(user));
    }

    /**
     * 修改用户
     */
    @SaCheckPermission("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody UserBo user) {
        userService.checkUserAllowed(user.getUserId());
        userService.checkUserDataScope(user.getUserId());
        if (!userService.checkUserNameUnique(user)) {
            return R.fail("修改用户'" + user.getUserName() + "'失败，登录账号已存在");
        }
        if (StringUtils.isNotEmpty(user.getPhonenumber()) && !userService.checkPhoneUnique(user)) {
            return R.fail("修改用户'" + user.getUserName() + "'失败，手机号码已存在");
        }
        if (StringUtils.isNotEmpty(user.getEmail()) && !userService.checkEmailUnique(user)) {
            return R.fail("修改用户'" + user.getUserName() + "'失败，邮箱账号已存在");
        }
        user.setUpdateBy(getUsername());
        return toAjax(userService.updateUser(user));
    }

    /**
     * 删除用户
     */
    @SaCheckPermission("system:user:remove")
    @Log(title = "用户管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@PathVariable Long[] userIds) {
        if (ArrayUtil.contains(userIds, getUserId())) {
            return R.fail("当前用户不能删除");
        }
        return toAjax(userService.deleteUserByIds(userIds));
    }
}
```

### 服务层结构

```java
/**
 * 用户服务实现类
 */
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements IUserService {

    private final SysUserMapper baseMapper;
    private final SysRoleMapper roleMapper;
    private final SysPostMapper postMapper;

    /**
     * 根据条件分页查询用户列表
     */
    @Override
    public TableDataInfo<UserVo> queryPageList(UserBo user, PageQuery pageQuery) {
        LambdaQueryWrapper<SysUser> lqw = buildQueryWrapper(user);
        Page<UserVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 根据用户ID查询用户
     */
    @Override
    public UserVo selectUserById(Long userId) {
        return baseMapper.selectVoById(userId);
    }

    /**
     * 校验用户名称是否唯一
     */
    @Override
    public boolean checkUserNameUnique(UserBo user) {
        boolean exist = baseMapper.exists(new LambdaQueryWrapper<SysUser>()
            .eq(SysUser::getUserName, user.getUserName())
            .ne(ObjectUtil.isNotNull(user.getUserId()), SysUser::getUserId, user.getUserId()));
        return !exist;
    }

    /**
     * 校验手机号码是否唯一
     */
    @Override
    public boolean checkPhoneUnique(UserBo user) {
        boolean exist = baseMapper.exists(new LambdaQueryWrapper<SysUser>()
            .eq(SysUser::getPhonenumber, user.getPhonenumber())
            .ne(ObjectUtil.isNotNull(user.getUserId()), SysUser::getUserId, user.getUserId()));
        return !exist;
    }

    /**
     * 校验email是否唯一
     */
    @Override
    public boolean checkEmailUnique(UserBo user) {
        boolean exist = baseMapper.exists(new LambdaQueryWrapper<SysUser>()
            .eq(SysUser::getEmail, user.getEmail())
            .ne(ObjectUtil.isNotNull(user.getUserId()), SysUser::getUserId, user.getUserId()));
        return !exist;
    }

    /**
     * 校验用户是否允许操作
     */
    @Override
    public void checkUserAllowed(Long userId) {
        if (ObjectUtil.isNotNull(userId) && LoginHelper.isAdmin(userId)) {
            throw new ServiceException("不允许操作管理员用户");
        }
    }

    /**
     * 校验用户是否有数据权限
     */
    @Override
    public void checkUserDataScope(Long userId) {
        if (!LoginHelper.isAdmin()) {
            SysUser user = new SysUser();
            user.setUserId(userId);
            List<SysUser> users = SpringUtils.getAopProxy(this).selectUserList(user);
            if (CollUtil.isEmpty(users)) {
                throw new ServiceException("没有权限访问用户数据！");
            }
        }
    }

    /**
     * 新增保存用户信息
     */
    @Override
    public int insertUser(UserBo user) {
        SysUser sysUser = BeanUtil.toBean(user, SysUser.class);
        return baseMapper.insert(sysUser);
    }

    /**
     * 修改保存用户信息
     */
    @Override
    public int updateUser(UserBo user) {
        SysUser sysUser = BeanUtil.toBean(user, SysUser.class);
        return baseMapper.updateById(sysUser);
    }

    /**
     * 批量删除用户信息
     */
    @Override
    public int deleteUserByIds(Long[] userIds) {
        for (Long userId : userIds) {
            checkUserAllowed(userId);
            checkUserDataScope(userId);
        }
        return baseMapper.deleteBatchIds(Arrays.asList(userIds));
    }

    /**
     * 构建查询条件
     */
    private LambdaQueryWrapper<SysUser> buildQueryWrapper(UserBo user) {
        Map<String, Object> params = user.getParams();
        LambdaQueryWrapper<SysUser> lqw = Wrappers.lambdaQuery();
        lqw.like(StringUtils.isNotBlank(user.getUserName()), SysUser::getUserName, user.getUserName());
        lqw.like(StringUtils.isNotBlank(user.getNickName()), SysUser::getNickName, user.getNickName());
        lqw.eq(StringUtils.isNotBlank(user.getStatus()), SysUser::getStatus, user.getStatus());
        lqw.eq(StringUtils.isNotBlank(user.getPhonenumber()), SysUser::getPhonenumber, user.getPhonenumber());
        lqw.between(params.get("beginTime") != null && params.get("endTime") != null,
            SysUser::getCreateTime, params.get("beginTime"), params.get("endTime"));
        lqw.eq(ObjectUtil.isNotNull(user.getDeptId()), SysUser::getDeptId, user.getDeptId());
        return lqw;
    }
}
```

## ✅ 最佳实践

### 1. 异常处理

```java
// ✅ 好的异常处理
@Service
public class UserServiceImpl {

    public UserVo getUserById(Long userId) {
        // 参数校验
        if (ObjectUtil.isNull(userId)) {
            throw new ServiceException("用户ID不能为空");
        }

        // 业务逻辑
        UserVo user = baseMapper.selectVoById(userId);
        if (ObjectUtil.isNull(user)) {
            throw new ServiceException("用户不存在");
        }

        return user;
    }
}

// ❌ 不好的异常处理
@Service
public class UserServiceImpl {

    public UserVo getUserById(Long userId) {
        try {
            return baseMapper.selectVoById(userId);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
```

### 2. 日志记录

```java
// ✅ 好的日志记录
@Slf4j
@Service
public class UserServiceImpl {

    public boolean resetPassword(Long userId, String newPassword) {
        log.info("开始重置用户密码, userId: {}", userId);

        try {
            // 业务逻辑
            SysUser user = baseMapper.selectById(userId);
            if (ObjectUtil.isNull(user)) {
                log.warn("重置密码失败，用户不存在, userId: {}", userId);
                throw new ServiceException("用户不存在");
            }

            user.setPassword(SecurityUtils.encryptPassword(newPassword));
            int result = baseMapper.updateById(user);

            log.info("用户密码重置成功, userId: {}", userId);
            return result > 0;

        } catch (Exception e) {
            log.error("重置用户密码异常, userId: {}", userId, e);
            throw new ServiceException("重置密码失败");
        }
    }
}

// ❌ 不好的日志记录
@Service
public class UserServiceImpl {

    public boolean resetPassword(Long userId, String newPassword) {
        System.out.println("重置密码: " + userId);

        SysUser user = baseMapper.selectById(userId);
        user.setPassword(SecurityUtils.encryptPassword(newPassword));

        return baseMapper.updateById(user) > 0;
    }
}
```

### 3. 参数校验

```java
// ✅ 好的参数校验
@RestController
public class UserController {

    @PostMapping("/user")
    public R<Void> createUser(@Validated @RequestBody UserBo user) {
        return R.ok(userService.createUser(user));
    }
}

@Data
public class UserBo {

    @NotBlank(message = "用户名不能为空")
    @Length(min = 2, max = 20, message = "用户名长度必须在2-20之间")
    private String userName;

    @NotBlank(message = "密码不能为空")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$",
             message = "密码必须包含大小写字母和数字，长度至少8位")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}

// ❌ 不好的参数校验
@RestController
public class UserController {

    @PostMapping("/user")
    public R<Void> createUser(@RequestBody UserBo user) {
        if (user.getUserName() == null || user.getUserName().isEmpty()) {
            return R.fail("用户名不能为空");
        }
        // ... 更多if判断

        return R.ok(userService.createUser(user));
    }
}
```

### 4. 事务管理

```java
// ✅ 好的事务管理
@Service
@Transactional(readOnly = true)
public class UserServiceImpl {

    @Transactional(rollbackFor = Exception.class)
    public boolean createUserWithRoles(UserBo userBo, List<Long> roleIds) {
        // 创建用户
        SysUser user = BeanUtil.toBean(userBo, SysUser.class);
        int userResult = baseMapper.insert(user);

        // 分配角色
        if (CollUtil.isNotEmpty(roleIds)) {
            List<SysUserRole> userRoles = roleIds.stream()
                .map(roleId -> new SysUserRole(user.getUserId(), roleId))
                .collect(Collectors.toList());
            userRoleMapper.insertBatch(userRoles);
        }

        return userResult > 0;
    }

    // 只读方法不需要事务
    public UserVo getUserById(Long userId) {
        return baseMapper.selectVoById(userId);
    }
}

// ❌ 不好的事务管理
@Service
public class UserServiceImpl {

    // 所有方法都加事务
    @Transactional
    public UserVo getUserById(Long userId) {
        return baseMapper.selectVoById(userId);
    }

    // 没有指定回滚条件
    @Transactional
    public boolean createUser(UserBo userBo) {
        // 可能出现检查异常但不会回滚
    }
}
```

代码规范是保证项目质量的基础，通过统一的规范可以提高代码的可读性、可维护性和团队协作效率。