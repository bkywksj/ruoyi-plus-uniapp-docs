# 代码审查规范

> **文档状态**: ✅ 已完成
>
> **作者**: 抓蛙师
>
> **最后更新**: 2025-11-02

代码审查(Code Review)是保证代码质量的重要环节,通过系统化的审查流程,可以提前发现问题、统一代码风格、促进知识共享,提升整体代码质量。本文档详细介绍RuoYi-Plus-UniApp项目的代码审查标准、流程和最佳实践。

## 📋 目录

- [为什么需要代码审查](#为什么需要代码审查)
- [代码审查目标](#代码审查目标)
- [审查角色和职责](#审查角色和职责)
- [代码审查流程](#代码审查流程)
- [审查检查清单](#审查检查清单)
- [审查标准和优先级](#审查标准和优先级)
- [审查最佳实践](#审查最佳实践)
- [常见问题和解决方案](#常见问题和解决方案)
- [审查工具](#审查工具)
- [审查示例](#审查示例)

---

## 为什么需要代码审查

### 代码审查的价值

1. **提前发现缺陷**
   - 在代码合并前发现潜在问题
   - 减少生产环境Bug
   - 降低修复成本(越早发现成本越低)

2. **保证代码质量**
   - 确保代码符合项目规范
   - 统一代码风格
   - 提高代码可读性和可维护性

3. **促进知识共享**
   - 团队成员了解彼此的工作
   - 新人学习项目最佳实践
   - 传播领域知识

4. **提升团队能力**
   - 通过反馈持续改进
   - 学习他人的优秀实践
   - 培养审查能力和编码能力

5. **降低技术债务**
   - 及时发现不合理的设计
   - 避免坏代码累积
   - 保持代码库健康

### 数据支持

根据行业研究:
- 代码审查可以发现 **60%-90%** 的缺陷
- 相比测试阶段发现,在审查阶段修复Bug的成本降低 **10倍以上**
- 有效的代码审查可以减少 **20%-30%** 的后期维护成本

---

## 代码审查目标

### 核心目标

1. **功能正确性** - 代码实现符合需求,逻辑正确
2. **代码质量** - 符合编码规范,结构清晰,易于维护
3. **性能优化** - 没有明显的性能问题
4. **安全可靠** - 没有安全漏洞,异常处理完善
5. **测试充分** - 有足够的测试覆盖

### 审查原则

1. **尊重和建设性** - 对事不对人,提供建设性反馈
2. **及时响应** - 24小时内完成审查
3. **小步快跑** - 每次提交控制在合理规模
4. **自动化优先** - 用工具检查能自动化的问题
5. **持续改进** - 总结经验,不断优化审查流程

---

## 审查角色和职责

### 1. 提交者(Author)

**职责:**

- **提交前自查**
  - 运行所有测试,确保通过
  - 本地代码检查(Lint/Format)
  - 自我审查代码变更
  - 确保提交信息清晰

- **提供上下文**
  - 在PR中说明变更目的
  - 关联相关Issue/需求
  - 说明关键技术决策
  - 标注需要重点关注的部分

- **响应反馈**
  - 及时回复审查意见
  - 解释设计决策
  - 修改问题代码
  - 感谢审查者的建议

**最佳实践:**

```markdown
## PR 描述模板

### 变更类型
- [ ] 新功能(feat)
- [ ] Bug修复(fix)
- [ ] 性能优化(perf)
- [ ] 代码重构(refactor)
- [ ] 文档更新(docs)
- [ ] 其他(请说明)

### 变更说明
简要描述本次变更的目的和实现方式...

### 关联Issue
- Closes #123
- Related to #456

### 测试情况
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 手动测试已完成

### 检查清单
- [ ] 代码已自我审查
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 无新增警告
- [ ] 符合项目规范

### 重点关注
请重点关注 UserService 中的权限校验逻辑...

### 截图/演示
(如果是UI变更,提供截图或视频)
```

### 2. 审查者(Reviewer)

**职责:**

- **及时审查**
  - 24小时内响应审查请求
  - 优先级高的PR立即审查
  - 大型PR分多次审查

- **全面检查**
  - 按照检查清单逐项审查
  - 关注代码质量和规范
  - 发现潜在问题
  - 提出改进建议

- **清晰反馈**
  - 明确指出问题位置
  - 说明问题原因
  - 提供改进建议或示例
  - 区分必须修改和建议修改

- **知识分享**
  - 分享相关最佳实践
  - 推荐参考资料
  - 解释技术决策

**审查评论模板:**

```markdown
# 必须修改 (🔴 MUST)
**问题:** 用户密码未加密存储,存在安全风险
**位置:** UserService.java:45
**建议:** 使用 SecurityUtils.encryptPassword() 加密密码
**示例:**
```java
user.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
```

# 建议修改 (🟡 SHOULD)
**问题:** 方法过长(100+行),建议拆分
**位置:** OrderService.java:120-250
**建议:** 将订单创建、库存扣减、支付等逻辑拆分为独立方法
**理由:** 提高可读性和可测试性

# 可选优化 (🟢 OPTIONAL)
**建议:** 可以使用 Stream API 简化代码
**位置:** UserController.java:89-95
**示例:**
```java
List<String> userNames = users.stream()
    .map(User::getUserName)
    .collect(Collectors.toList());
```

# 点赞 (👍 GOOD)
**位置:** BaseService.java:34-56
**评价:** 这个通用查询构建方法设计得很好,提高了代码复用性!
```

### 3. 维护者(Maintainer)

**职责:**

- **最终把关**
  - 审查重要变更
  - 确保符合架构设计
  - 批准代码合并

- **规范制定**
  - 制定和更新审查规范
  - 解决审查分歧
  - 推动最佳实践

- **团队培养**
  - 指导新人审查
  - 分享审查经验
  - 组织Code Review培训

---

## 代码审查流程

### 标准流程

```
┌─────────────┐
│  1. 开发完成 │
│  本地测试   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. 自我审查 │
│  代码检查   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  3. 提交PR  │
│  填写说明   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  4. 自动检查 │
│  CI/CD     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  5. 指定审查者│
│  通知审查   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  6. 代码审查 │
│  提出意见   │
└──────┬──────┘
       │
       ▼
    是否通过?
    │      │
    否     是
    │      │
    ▼      ▼
┌──────┐ ┌──────┐
│修改代码│ │合并代码│
└───┬──┘ └──────┘
    │
    └─(返回步骤3)
```

### 详细步骤

#### 步骤1: 开发完成

```bash
# 1. 确保在正确的分支上开发
git checkout -b feature/user-management

# 2. 开发功能...

# 3. 本地运行测试
# 后端测试
mvn test

# 前端测试(如有)
pnpm test

# 移动端测试
pnpm test:uni
```

#### 步骤2: 自我审查

在提交PR前,先自我审查:

```bash
# 1. 查看所有变更
git diff master...feature/user-management

# 2. 检查代码规范
# Java代码检查(如果配置了checkstyle)
mvn checkstyle:check

# 前端代码检查
cd plus-ui
pnpm lint

# 移动端代码检查
cd plus-uniapp
pnpm lint

# 3. 自我审查检查清单
```

**自我审查检查清单:**

- [ ] 代码实现了所有需求
- [ ] 所有测试都通过
- [ ] 代码符合项目规范
- [ ] 没有遗留的调试代码(console.log, System.out等)
- [ ] 没有注释掉的代码
- [ ] 所有公共方法都有注释
- [ ] 异常处理完善
- [ ] 没有硬编码的配置信息
- [ ] 提交信息清晰规范

#### 步骤3: 提交PR

```bash
# 1. 提交代码
git add .
git commit -m "feat(system): 添加用户管理功能

- 实现用户增删改查
- 添加用户权限校验
- 完善异常处理

Closes #123"

# 2. 推送到远程
git push origin feature/user-management

# 3. 在Git平台创建Pull Request
# - 填写PR描述
# - 关联Issue
# - 指定审查者
```

**PR命名规范:**

```
<type>(<scope>): <subject>

示例:
feat(system): 添加用户管理功能
fix(business): 修复订单计算错误
refactor(common): 重构权限校验逻辑
```

参考: [Git使用规范](/practices/standards/git)

#### 步骤4: 自动检查

配置CI/CD自动执行:

```yaml
# .github/workflows/code-review.yml (示例)
name: Code Review

on:
  pull_request:
    branches: [ master, develop ]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      # 1. 代码检出
      - uses: actions/checkout@v3

      # 2. Java代码检查
      - name: Java Checkstyle
        run: mvn checkstyle:check

      # 3. 运行测试
      - name: Run Tests
        run: mvn test

      # 4. 前端代码检查
      - name: Frontend Lint
        run: |
          cd plus-ui
          pnpm install
          pnpm lint

      # 5. 移动端代码检查
      - name: Mobile Lint
        run: |
          cd plus-uniapp
          pnpm install
          pnpm lint
```

#### 步骤5: 人工审查

审查者按照检查清单审查代码:

```markdown
## 审查要点

### 1. 功能正确性 (10分钟)
- 理解PR目的
- 检查业务逻辑
- 验证边界条件

### 2. 代码质量 (15分钟)
- 检查命名规范
- 检查代码结构
- 检查注释质量

### 3. 性能和安全 (10分钟)
- 查找性能瓶颈
- 检查安全漏洞
- 验证异常处理

### 4. 测试充分性 (5分钟)
- 检查测试覆盖
- 验证测试质量
```

#### 步骤6: 反馈和修改

**审查者提供反馈:**

```markdown
## 审查意见

### 🔴 必须修改

1. **安全问题** (UserService.java:45)
   - 密码未加密存储
   - 建议使用 SecurityUtils.encryptPassword()

2. **空指针风险** (UserController.java:78)
   - user.getRoles() 可能为null
   - 建议添加空值检查

### 🟡 建议修改

1. **方法过长** (OrderService.java:120-250)
   - 建议拆分为多个方法
   - 提高可读性

### 🟢 可选优化

1. **代码简化** (UserController.java:89-95)
   - 可以使用Stream API简化

### 👍 做得好的地方

1. **异常处理** (BaseService.java:34-56)
   - 异常处理很完善,值得学习!
```

**提交者修改代码:**

```bash
# 1. 修改代码
# 2. 本地测试
mvn test

# 3. 提交修改
git add .
git commit -m "fix: 修复审查发现的安全问题

- 添加密码加密
- 修复空指针问题
- 优化方法结构"

# 4. 推送更新
git push origin feature/user-management

# 5. 在PR中回复审查意见
```

#### 步骤7: 批准和合并

```bash
# 审查通过后,由维护者合并
git checkout master
git merge --no-ff feature/user-management
git push origin master

# 删除功能分支(可选)
git branch -d feature/user-management
git push origin --delete feature/user-management
```

### 特殊场景处理

#### 1. 紧急修复(Hotfix)

```bash
# 1. 从master创建hotfix分支
git checkout -b hotfix/critical-bug master

# 2. 修复问题
# ...

# 3. 快速审查(1小时内)
# - 至少1人审查
# - 重点检查修复逻辑
# - 确认不引入新问题

# 4. 合并到master和develop
git checkout master
git merge --no-ff hotfix/critical-bug
git checkout develop
git merge --no-ff hotfix/critical-bug
```

#### 2. 大型重构

```bash
# 1. 分阶段提交
# - 每个阶段单独PR
# - 每个PR控制在500行以内

# 2. 提前设计评审
# - 先评审设计方案
# - 再逐步实施

# 3. 多轮审查
# - 第一轮:整体设计
# - 第二轮:具体实现
# - 第三轮:细节优化
```

#### 3. 新人提交

```bash
# 1. 指定资深审查者
# - 安排mentor审查
# - 提供详细反馈

# 2. 配对审查
# - 面对面讲解
# - 实时指导

# 3. 总结学习要点
# - 记录常见问题
# - 分享最佳实践
```

---

## 审查检查清单

### 1. 功能正确性检查

#### 1.1 需求实现

- [ ] **需求理解正确**
  - 实现了所有需求功能
  - 没有遗漏的场景
  - 没有理解偏差

- [ ] **业务逻辑正确**
  - 业务规则实现正确
  - 计算逻辑准确
  - 状态流转合理

- [ ] **边界条件处理**
  - 处理了空值情况
  - 处理了极端值(0, 负数, 最大值等)
  - 处理了并发场景

**检查示例:**

```java
// ❌ 未处理空值
public String getUserName(Long userId) {
    User user = userMapper.selectById(userId);
    return user.getUserName(); // user可能为null
}

// ✅ 正确处理
public String getUserName(Long userId) {
    if (ObjectUtil.isNull(userId)) {
        throw new ServiceException("用户ID不能为空");
    }

    User user = userMapper.selectById(userId);
    if (ObjectUtil.isNull(user)) {
        throw new ServiceException("用户不存在");
    }

    return user.getUserName();
}
```

#### 1.2 数据一致性

- [ ] **事务边界正确**
  - 事务范围合理
  - 回滚条件正确
  - 没有事务嵌套问题

- [ ] **数据完整性**
  - 关联数据同步更新
  - 没有数据孤岛
  - 外键约束正确

**检查示例:**

```java
// ❌ 事务边界不当
public void deleteUser(Long userId) {
    userMapper.deleteById(userId);
    // 用户角色关联未删除,造成数据不一致
}

// ✅ 正确的事务处理
@Transactional(rollbackFor = Exception.class)
public void deleteUser(Long userId) {
    // 1. 删除用户角色关联
    userRoleMapper.deleteByUserId(userId);

    // 2. 删除用户岗位关联
    userPostMapper.deleteByUserId(userId);

    // 3. 删除用户
    userMapper.deleteById(userId);
}
```

### 2. 代码规范检查

#### 2.1 命名规范

- [ ] **类名规范**
  - 大驼峰命名
  - 名称清晰表达意图
  - 遵循项目约定(如Controller、Service、Mapper后缀)

- [ ] **方法名规范**
  - 小驼峰命名
  - 动词开头
  - 名称准确描述功能

- [ ] **变量名规范**
  - 小驼峰命名
  - 避免单字母变量(除循环变量)
  - 布尔变量以is/has/can开头

- [ ] **常量名规范**
  - 全大写,下划线分隔
  - 使用有意义的名称

**检查示例:**

```java
// ❌ 命名不规范
public class user { // 类名应大驼峰
    private String n; // 变量名不清晰
    private boolean status; // 布尔变量应is开头
    private final String pwd = "123"; // 常量应全大写

    public void do() { } // 方法名不清晰
}

// ✅ 规范命名
public class User {
    private String userName;
    private boolean isActive;
    private static final String DEFAULT_PASSWORD = "123456";

    public void createUser() { }
}
```

参考: [命名规范](/practices/standards/naming)

#### 2.2 代码结构

- [ ] **方法长度合理**
  - 单个方法不超过50行(建议)
  - 超过100行必须拆分
  - 每个方法只做一件事

- [ ] **类职责单一**
  - 符合单一职责原则
  - 不超过500行(建议)
  - 职责清晰明确

- [ ] **层次结构清晰**
  - Controller只做路由和参数校验
  - Service处理业务逻辑
  - Mapper只做数据访问

**检查示例:**

```java
// ❌ 方法过长,职责不清
@PostMapping("/user")
public R<Void> createUser(@RequestBody UserBo user) {
    // 100+行代码混杂:
    // - 参数校验
    // - 业务逻辑
    // - 数据库操作
    // - 日志记录
    // ...
}

// ✅ 职责清晰,结构合理
@PostMapping("/user")
public R<Void> createUser(@Validated @RequestBody UserBo user) {
    // Controller只做路由和基本校验
    userService.createUser(user);
    return R.ok();
}

// Service处理业务逻辑
@Service
public class UserServiceImpl {
    @Transactional(rollbackFor = Exception.class)
    public void createUser(UserBo user) {
        // 1. 业务校验
        validateUser(user);

        // 2. 业务处理
        SysUser sysUser = convertToEntity(user);
        sysUser.setPassword(encryptPassword(user.getPassword()));

        // 3. 保存数据
        baseMapper.insert(sysUser);

        // 4. 后续处理
        processUserRoles(sysUser.getUserId(), user.getRoleIds());
    }
}
```

#### 2.3 注释规范

- [ ] **类注释完整**
  - 有JavaDoc/JSDoc注释
  - 说明类的职责
  - 包含@author和@date

- [ ] **方法注释完整**
  - 公共方法都有注释
  - 说明方法功能、参数、返回值
  - 复杂逻辑有行内注释

- [ ] **注释准确有效**
  - 注释与代码一致
  - 没有废弃的注释
  - 没有注释掉的代码

**检查示例:**

```java
// ❌ 缺少注释
public class UserService {
    public List<User> getUsers(String name, String status) {
        // 缺少方法注释
    }
}

// ✅ 注释完整
/**
 * 用户服务类
 *
 * @author 抓蛙师
 * @date 2025-11-02
 */
public class UserService {

    /**
     * 根据条件查询用户列表
     *
     * @param name 用户名(模糊查询)
     * @param status 用户状态(0=正常 1=停用)
     * @return 用户列表
     */
    public List<User> getUsers(String name, String status) {
        // 实现代码
    }
}
```

参考: [注释规范](/practices/standards/comment)

### 3. 性能检查

#### 3.1 数据库性能

- [ ] **SQL优化**
  - 避免N+1查询
  - 使用合适的索引
  - 避免全表扫描
  - 分页查询大数据集

- [ ] **批量操作**
  - 批量插入/更新使用batch方法
  - 避免循环中查询数据库

**检查示例:**

```java
// ❌ N+1查询问题
public List<UserVo> getUserList() {
    List<User> users = userMapper.selectList(null);
    for (User user : users) {
        // 每次循环都查询数据库,N+1问题
        List<Role> roles = roleMapper.selectByUserId(user.getUserId());
        user.setRoles(roles);
    }
    return users;
}

// ✅ 优化后的查询
public List<UserVo> getUserList() {
    // 方案1: 使用JOIN一次查询
    return userMapper.selectUserWithRoles();

    // 方案2: 先查所有用户ID,再批量查询角色
    List<User> users = userMapper.selectList(null);
    List<Long> userIds = users.stream()
        .map(User::getUserId)
        .collect(Collectors.toList());
    List<UserRole> userRoles = userRoleMapper.selectByUserIds(userIds);
    // ... 组装数据
}

// ❌ 循环插入
public void importUsers(List<User> users) {
    for (User user : users) {
        userMapper.insert(user); // 多次数据库操作
    }
}

// ✅ 批量插入
public void importUsers(List<User> users) {
    if (CollUtil.isNotEmpty(users)) {
        // 使用MyBatis-Plus的批量插入
        userService.saveBatch(users, 1000); // 每批1000条
    }
}
```

#### 3.2 缓存使用

- [ ] **合理使用缓存**
  - 频繁读取的数据使用缓存
  - 缓存有过期时间
  - 缓存更新策略正确

- [ ] **避免缓存穿透/击穿**
  - 使用布隆过滤器
  - 缓存空值
  - 使用互斥锁

**检查示例:**

```java
// ❌ 没有使用缓存
public DictData getDictData(String dictType, String dictValue) {
    // 每次都查询数据库
    return dictDataMapper.selectByTypeAndValue(dictType, dictValue);
}

// ✅ 使用缓存
@Cacheable(cacheNames = "dict", key = "#dictType + ':' + #dictValue")
public DictData getDictData(String dictType, String dictValue) {
    return dictDataMapper.selectByTypeAndValue(dictType, dictValue);
}

// 更新时删除缓存
@CacheEvict(cacheNames = "dict", key = "#dictData.dictType + ':' + #dictData.dictValue")
public void updateDictData(DictData dictData) {
    dictDataMapper.updateById(dictData);
}
```

#### 3.3 前端性能

- [ ] **避免不必要的渲染**
  - 使用v-if/v-show合理控制渲染
  - 使用key优化列表渲染
  - 避免在模板中使用复杂表达式

- [ ] **资源优化**
  - 图片懒加载
  - 组件懒加载
  - 合理使用computed和watch

**检查示例:**

```vue
<!-- ❌ 性能问题 -->
<template>
  <div>
    <!-- 每次都重新计算,应该用computed -->
    <div>总价: {{ calculateTotal(items) }}</div>

    <!-- 列表没有key -->
    <div v-for="item in items">{{ item.name }}</div>

    <!-- 所有选项卡内容都渲染了 -->
    <div v-show="activeTab === 'tab1'">选项卡1内容</div>
    <div v-show="activeTab === 'tab2'">选项卡2内容</div>
  </div>
</template>

<!-- ✅ 优化后 -->
<template>
  <div>
    <!-- 使用computed缓存计算结果 -->
    <div>总价: {{ totalPrice }}</div>

    <!-- 使用key优化列表渲染 -->
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>

    <!-- 使用v-if避免不必要的渲染 -->
    <div v-if="activeTab === 'tab1'">选项卡1内容</div>
    <div v-if="activeTab === 'tab2'">选项卡2内容</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0)
})
</script>
```

### 4. 安全检查

#### 4.1 输入验证

- [ ] **参数校验完整**
  - 所有外部输入都要校验
  - 使用@Validated注解
  - 校验规则合理

- [ ] **SQL注入防护**
  - 使用参数化查询
  - 避免拼接SQL
  - 使用MyBatis-Plus的Wrapper

**检查示例:**

```java
// ❌ 缺少参数校验,存在SQL注入风险
@GetMapping("/user")
public R<List<User>> list(String userName) {
    // 直接拼接SQL,存在注入风险
    String sql = "SELECT * FROM sys_user WHERE user_name LIKE '%" + userName + "%'";
    return R.ok(userMapper.selectBySql(sql));
}

// ✅ 正确的校验和查询
@GetMapping("/user")
public R<List<User>> list(@Validated UserQuery query) {
    // 使用MyBatis-Plus的Wrapper,自动防止SQL注入
    LambdaQueryWrapper<User> wrapper = Wrappers.lambdaQuery();
    wrapper.like(StringUtils.isNotBlank(query.getUserName()),
                 User::getUserName, query.getUserName());
    return R.ok(userMapper.selectList(wrapper));
}

// 请求参数VO
@Data
public class UserQuery {
    @Length(max = 50, message = "用户名长度不能超过50")
    private String userName;

    @Pattern(regexp = "^[01]$", message = "状态只能是0或1")
    private String status;
}
```

#### 4.2 权限控制

- [ ] **接口权限校验**
  - 所有接口都有权限注解
  - 权限标识符规范
  - 数据权限校验完整

- [ ] **敏感操作二次确认**
  - 删除操作有确认
  - 批量操作有限制

**检查示例:**

```java
// ❌ 缺少权限校验
@GetMapping("/user/{userId}")
public R<User> getUser(@PathVariable Long userId) {
    // 没有权限校验,任何人都能查看
    return R.ok(userService.selectUserById(userId));
}

// ✅ 有权限校验
@SaCheckPermission("system:user:query")
@GetMapping("/user/{userId}")
public R<User> getUser(@PathVariable Long userId) {
    // 1. 功能权限校验(通过注解)
    // 2. 数据权限校验
    userService.checkUserDataScope(userId);

    return R.ok(userService.selectUserById(userId));
}

// ❌ 批量删除没有限制
@DeleteMapping("/user")
public R<Void> deleteUsers(@RequestBody Long[] userIds) {
    return toAjax(userService.deleteUserByIds(userIds));
}

// ✅ 批量删除有限制
@SaCheckPermission("system:user:remove")
@DeleteMapping("/user")
public R<Void> deleteUsers(@RequestBody Long[] userIds) {
    // 限制批量删除数量
    if (userIds.length > 100) {
        return R.fail("批量删除不能超过100条");
    }

    // 不能删除当前用户
    if (ArrayUtil.contains(userIds, getUserId())) {
        return R.fail("不能删除当前登录用户");
    }

    return toAjax(userService.deleteUserByIds(userIds));
}
```

#### 4.3 敏感信息保护

- [ ] **密码加密存储**
  - 密码必须加密
  - 使用强加密算法

- [ ] **敏感信息脱敏**
  - 日志中脱敏
  - 接口返回脱敏

- [ ] **XSS防护**
  - 前端输出转义
  - 后端过滤特殊字符

**检查示例:**

```java
// ❌ 密码明文存储
public void createUser(UserBo user) {
    SysUser sysUser = BeanUtil.toBean(user, SysUser.class);
    sysUser.setPassword(user.getPassword()); // 明文密码
    baseMapper.insert(sysUser);
}

// ✅ 密码加密存储
public void createUser(UserBo user) {
    SysUser sysUser = BeanUtil.toBean(user, SysUser.class);
    // 使用BCrypt加密
    sysUser.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
    baseMapper.insert(sysUser);
}

// ❌ 日志输出敏感信息
log.info("用户登录: {}", user); // 包含密码等敏感信息

// ✅ 敏感信息脱敏
log.info("用户登录: userId={}, userName={}", user.getUserId(), user.getUserName());
```

### 5. 异常处理检查

- [ ] **异常捕获合理**
  - 不捕获所有异常(避免catch Exception)
  - 只捕获可以处理的异常
  - 不吞掉异常

- [ ] **异常信息清晰**
  - 异常消息对用户友好
  - 包含必要的上下文信息
  - 不暴露敏感信息

- [ ] **资源释放**
  - try-with-resources自动释放
  - finally块中释放资源

**检查示例:**

```java
// ❌ 异常处理不当
public User getUser(Long userId) {
    try {
        return userMapper.selectById(userId);
    } catch (Exception e) {
        // 1. 吞掉异常,不抛出
        // 2. 只打印堆栈,不处理
        e.printStackTrace();
        return null;
    }
}

// ✅ 正确的异常处理
public User getUser(Long userId) {
    try {
        if (ObjectUtil.isNull(userId)) {
            throw new ServiceException("用户ID不能为空");
        }

        User user = userMapper.selectById(userId);
        if (ObjectUtil.isNull(user)) {
            throw new ServiceException("用户不存在");
        }

        return user;
    } catch (ServiceException e) {
        // 业务异常,直接抛出
        throw e;
    } catch (Exception e) {
        // 系统异常,包装后抛出
        log.error("查询用户异常: userId={}", userId, e);
        throw new ServiceException("查询用户失败", e);
    }
}

// ❌ 资源未释放
public String readFile(String path) {
    FileReader reader = new FileReader(path);
    // 如果读取失败,reader不会关闭
    return reader.read();
}

// ✅ 使用try-with-resources
public String readFile(String path) {
    try (FileReader reader = new FileReader(path)) {
        // 自动释放资源
        return reader.read();
    } catch (IOException e) {
        throw new ServiceException("读取文件失败", e);
    }
}
```

### 6. 测试检查

- [ ] **单元测试覆盖**
  - 核心业务逻辑有单元测试
  - 测试用例覆盖主要分支
  - 测试边界条件

- [ ] **测试质量**
  - 测试用例独立(不依赖其他用例)
  - 测试数据清晰
  - 断言完整

- [ ] **测试可维护性**
  - 测试代码也要规范
  - 使用有意义的测试方法名
  - 避免重复代码

**检查示例:**

```java
// ❌ 测试不充分
@Test
public void testGetUser() {
    User user = userService.getUser(1L);
    assertNotNull(user);
}

// ✅ 完整的测试
@Test
public void testGetUser_Success() {
    // Given: 准备测试数据
    Long userId = 1L;
    User mockUser = new User();
    mockUser.setUserId(userId);
    mockUser.setUserName("admin");
    when(userMapper.selectById(userId)).thenReturn(mockUser);

    // When: 执行测试
    User result = userService.getUser(userId);

    // Then: 验证结果
    assertNotNull(result);
    assertEquals(userId, result.getUserId());
    assertEquals("admin", result.getUserName());
    verify(userMapper).selectById(userId);
}

@Test
public void testGetUser_UserNotFound() {
    // Given: 用户不存在
    Long userId = 999L;
    when(userMapper.selectById(userId)).thenReturn(null);

    // When & Then: 验证抛出异常
    ServiceException exception = assertThrows(ServiceException.class, () -> {
        userService.getUser(userId);
    });
    assertEquals("用户不存在", exception.getMessage());
}

@Test
public void testGetUser_NullUserId() {
    // Given: userId为null
    // When & Then: 验证参数校验
    ServiceException exception = assertThrows(ServiceException.class, () -> {
        userService.getUser(null);
    });
    assertEquals("用户ID不能为空", exception.getMessage());
}
```

### 7. 前端特定检查

#### 7.1 Vue组件检查

- [ ] **组件结构规范**
  - 使用Composition API
  - Props定义完整
  - Emits声明清晰

- [ ] **响应式使用正确**
  - 使用ref/reactive正确
  - 避免直接修改props
  - computed/watch使用合理

**检查示例:**

```vue
<!-- ❌ 不规范的组件 -->
<template>
  <div @click="count++">{{ count }}</div>
</template>

<script>
export default {
  data() {
    return { count: 0 }
  }
}
</script>

<!-- ✅ 规范的组件 -->
<template>
  <div @click="handleClick">{{ count }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  initialCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0
})

const emit = defineEmits<{
  change: [count: number]
}>()

const count = ref(props.initialCount)

const handleClick = () => {
  count.value++
  emit('change', count.value)
}
</script>
```

#### 7.2 API调用检查

- [ ] **错误处理**
  - 统一的错误处理
  - 用户友好的提示
  - 加载状态管理

- [ ] **请求优化**
  - 避免重复请求
  - 合理使用防抖/节流
  - 取消未完成的请求

**检查示例:**

```typescript
// ❌ 没有错误处理
const loadUserList = async () => {
  const response = await getUserList(queryParams)
  userList.value = response.data
}

// ✅ 完整的错误处理
const loading = ref(false)
const loadUserList = async () => {
  try {
    loading.value = true
    const response = await getUserList(queryParams)
    userList.value = response.data
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败,请稍后重试')
  } finally {
    loading.value = false
  }
}

// ❌ 没有防抖,频繁请求
const handleSearch = (keyword: string) => {
  searchUsers(keyword)
}

// ✅ 使用防抖
import { useDebounceFn } from '@vueuse/core'

const handleSearch = useDebounceFn((keyword: string) => {
  searchUsers(keyword)
}, 500)
```

### 8. 移动端特定检查

#### 8.1 UniApp规范检查

- [ ] **平台兼容性**
  - 使用条件编译处理平台差异
  - 避免使用平台特定API
  - 测试多个平台

- [ ] **性能优化**
  - 列表使用虚拟滚动
  - 图片使用懒加载
  - 避免频繁setData

**检查示例:**

```vue
<!-- ❌ 没有处理平台差异 -->
<template>
  <view @click="makePhoneCall">拨打电话</view>
</template>

<script setup lang="ts">
const makePhoneCall = () => {
  // 只在APP有效,小程序会报错
  plus.device.dial('10086')
}
</script>

<!-- ✅ 处理平台差异 -->
<template>
  <view @click="makePhoneCall">拨打电话</view>
</template>

<script setup lang="ts">
const makePhoneCall = () => {
  // #ifdef APP-PLUS
  plus.device.dial('10086')
  // #endif

  // #ifdef MP-WEIXIN
  uni.makePhoneCall({
    phoneNumber: '10086'
  })
  // #endif

  // #ifdef H5
  window.location.href = 'tel:10086'
  // #endif
}
</script>
```

---

## 审查标准和优先级

### 问题分类

#### 🔴 必须修改 (MUST / P0)

这类问题**必须修改**,否则代码不能合并:

1. **功能缺陷**
   - 功能实现错误
   - 业务逻辑错误
   - 不满足需求

2. **安全问题**
   - SQL注入风险
   - XSS漏洞
   - 权限绕过
   - 敏感信息泄露

3. **严重性能问题**
   - N+1查询
   - 内存泄漏
   - 死循环

4. **数据一致性问题**
   - 事务处理错误
   - 并发问题
   - 数据丢失风险

5. **编译/运行错误**
   - 代码无法编译
   - 运行时崩溃
   - 测试不通过

**反馈模板:**

```markdown
## 🔴 必须修改

**问题**: SQL注入风险
**位置**: UserController.java:45
**严重程度**: 高危
**问题描述**:
直接拼接SQL语句,存在SQL注入风险,攻击者可以通过构造特殊参数执行任意SQL。

**当前代码**:
```java
String sql = "SELECT * FROM sys_user WHERE user_name = '" + userName + "'";
```

**建议修改**:
```java
LambdaQueryWrapper<User> wrapper = Wrappers.lambdaQuery();
wrapper.eq(User::getUserName, userName);
return userMapper.selectList(wrapper);
```

**参考**: MyBatis-Plus官方文档
```

#### 🟡 建议修改 (SHOULD / P1)

这类问题**强烈建议修改**,但可以协商:

1. **代码质量问题**
   - 方法过长
   - 代码重复
   - 命名不规范
   - 注释不完整

2. **轻微性能问题**
   - 可优化的查询
   - 不必要的循环
   - 缓存使用不当

3. **设计问题**
   - 违反设计原则
   - 职责不清
   - 耦合度高

4. **可维护性问题**
   - 硬编码
   - 魔法数字
   - 复杂的条件判断

**反馈模板:**

```markdown
## 🟡 建议修改

**问题**: 方法过长,建议拆分
**位置**: OrderService.java:120-250
**严重程度**: 中
**问题描述**:
createOrder方法有130行代码,包含订单创建、库存扣减、优惠计算、支付等多个职责,建议拆分为多个方法。

**建议方案**:
```java
public Long createOrder(OrderBo orderBo) {
    // 1. 校验订单
    validateOrder(orderBo);

    // 2. 计算金额
    OrderAmount amount = calculateOrderAmount(orderBo);

    // 3. 扣减库存
    deductStock(orderBo.getItems());

    // 4. 创建订单
    Long orderId = saveOrder(orderBo, amount);

    // 5. 发起支付
    initiatePayment(orderId, amount);

    return orderId;
}
```

**收益**: 提高可读性、可测试性和可维护性
```

#### 🟢 可选优化 (OPTIONAL / P2)

这类是**可选的优化建议**,不强制修改:

1. **代码风格**
   - 格式调整
   - 命名优化
   - 注释补充

2. **性能优化建议**
   - 使用更高效的API
   - 算法优化

3. **技术建议**
   - 使用新特性
   - 更好的工具库

**反馈模板:**

```markdown
## 🟢 可选优化

**建议**: 可以使用Stream API简化代码
**位置**: UserController.java:89-95
**优先级**: 低

**当前代码**:
```java
List<String> userNames = new ArrayList<>();
for (User user : users) {
    userNames.add(user.getUserName());
}
```

**优化建议**:
```java
List<String> userNames = users.stream()
    .map(User::getUserName)
    .collect(Collectors.toList());
```

**收益**: 代码更简洁,符合函数式编程风格
```

#### 👍 做得好 (GOOD)

**正向反馈同样重要!** 指出代码中的亮点:

```markdown
## 👍 做得好

**位置**: BaseService.java:34-56
**亮点**: 通用查询构建方法设计得很好

这个通用的查询条件构建方法:
1. 使用泛型,适用于所有实体
2. 链式调用,代码清晰
3. 避免了大量重复代码
4. 值得在项目中推广!

```java
protected <T> LambdaQueryWrapper<T> buildWrapper(T entity) {
    // 实现代码
}
```
```

### 审查决策

| 分类 | 是否阻塞合并 | 处理方式 |
|------|------------|---------|
| 🔴 必须修改 | 是 | 必须修改后才能合并 |
| 🟡 建议修改 | 协商 | 最好修改,但可以沟通后续优化 |
| 🟢 可选优化 | 否 | 可以不修改,记录到待优化列表 |
| 👍 做得好 | - | 正向激励,鼓励最佳实践 |

---

## 审查最佳实践

### 提交者最佳实践

#### 1. 控制PR大小

```markdown
## PR大小建议

- **理想大小**: 200-400行
- **最大限制**: 500行
- **超过500行**: 拆分为多个PR

## 大型变更处理

1. **提前沟通**: 先提交设计方案评审
2. **分阶段提交**: 将大型重构拆分为多个阶段
3. **提供文档**: 附上设计文档和变更说明
```

**示例:**

```bash
# ❌ 一次性提交大型功能
git commit -m "feat: 完整的订单系统 (3000行变更)"

# ✅ 分阶段提交
git commit -m "feat(order): 添加订单实体和Mapper (150行)"
git commit -m "feat(order): 实现订单Service层 (200行)"
git commit -m "feat(order): 添加订单Controller (180行)"
git commit -m "feat(order): 完善订单测试用例 (250行)"
```

#### 2. 提供清晰的上下文

**好的PR描述:**

```markdown
## 新增用户管理功能

### 背景
客户要求在系统中添加用户管理功能,支持用户的增删改查和权限分配。

### 实现方案
1. 新增 `sys_user` 表存储用户信息
2. 实现用户CRUD接口
3. 添加用户角色关联管理
4. 集成数据权限控制

### 技术选型
- 使用 MyBatis-Plus 简化数据访问
- 使用 Sa-Token 实现权限控制
- 使用 Hibernate Validator 进行参数校验

### 测试情况
- ✅ 单元测试覆盖率: 85%
- ✅ 集成测试已通过
- ✅ 手动测试已完成

### 重点关注
请重点关注以下部分:
1. `UserService.checkDataScope()` 的数据权限实现
2. `UserController.deleteUsers()` 的批量删除逻辑
3. 用户角色关联的事务处理

### 相关截图
(附上功能截图)
```

#### 3. 主动响应反馈

```markdown
## 响应审查意见的最佳实践

### ✅ 好的响应

> **审查意见**: 建议添加空值检查

回复:
"好的,已添加空值检查。另外我发现这里还应该检查用户状态,一并添加了。
更新的代码在 commit abc123。"

### ❌ 不好的响应

> **审查意见**: 这里有性能问题

回复:
"我觉得没问题啊"  (没有解释,没有讨论)
```

### 审查者最佳实践

#### 1. 及时审查

```markdown
## 审查时效性要求

| PR优先级 | 响应时间 | 完成时间 |
|---------|---------|---------|
| 🔥 紧急(Hotfix) | 1小时内 | 2小时内 |
| 🚀 高优先级 | 4小时内 | 1天内 |
| 📦 普通优先级 | 1天内 | 2天内 |
| 🔧 低优先级 | 2天内 | 1周内 |

## 时间分配建议

- 小型PR (< 200行): 15-30分钟
- 中型PR (200-500行): 30-60分钟
- 大型PR (> 500行): 1-2小时(分多次审查)
```

#### 2. 提供建设性反馈

```markdown
## 反馈对比

### ❌ 不好的反馈
"这段代码写得不好"
"这里有问题"
"命名不规范"

### ✅ 好的反馈
"这段代码存在空指针风险,建议在第45行添加空值检查:
```java
if (ObjectUtil.isNull(user)) {
    throw new ServiceException("用户不存在");
}
```
参考: [异常处理规范](/practices/backend/exception-handling)"
```

**反馈要素:**

1. **明确指出问题** - 具体在哪里,什么问题
2. **说明原因** - 为什么这是个问题
3. **提供方案** - 建议如何修改
4. **给出示例** - 最好有代码示例
5. **附上参考** - 相关文档或最佳实践

#### 3. 使用建议性语言

```markdown
## 语言风格对比

### ❌ 命令式(不推荐)
"必须使用Stream API"
"这样写是错的"
"改成这样"

### ✅ 建议式(推荐)
"建议使用Stream API,代码会更简洁"
"这里可能存在问题,建议..."
"可以考虑改成..."
```

#### 4. 区分审查优先级

在每条评论中明确标注优先级:

```markdown
🔴 **[必须修改]** SQL注入风险,必须使用参数化查询

🟡 **[建议修改]** 方法过长,建议拆分为多个方法

🟢 **[可选优化]** 可以使用Optional简化代码

👍 **[做得好]** 异常处理很完善!
```

#### 5. 平衡速度和质量

```markdown
## 审查策略

### 快速过审的场景
- 紧急Bug修复
- 简单的文档更新
- 小规模的代码调整(< 50行)

快速审查关注:
- 功能正确性
- 明显的错误
- 安全问题

### 深度审查的场景
- 核心业务逻辑
- 架构变更
- 性能优化
- 新功能开发

深度审查关注:
- 所有检查清单项
- 设计合理性
- 长期可维护性
```

### 团队协作实践

#### 1. 建立审查文化

```markdown
## 营造积极的审查氛围

### 团队公约
1. **尊重和友善** - 对事不对人
2. **学习心态** - 审查是学习机会
3. **感谢反馈** - 感谢审查者的时间
4. **积极改进** - 基于反馈持续提高

### 避免
- ❌ 人身攻击
- ❌ 嘲讽语气
- ❌ 消极抵触
- ❌ 推卸责任
```

#### 2. 知识分享

```markdown
## 在审查中分享知识

### 分享最佳实践
"这里可以使用项目中的 BaseService.buildWrapper() 方法,
参考: plus/ruoyi/common/core/service/BaseService.java:34"

### 推荐工具或库
"可以使用 Hutool 的 DateUtil 简化日期处理,
项目已经引入了这个库"

### 链接到文档
"关于命名规范,可以参考我们的文档:
[命名规范](/practices/standards/naming)"
```

#### 3. 新人指导

```markdown
## 指导新人的策略

### 1. 更详细的反馈
- 不仅指出问题,还要解释原因
- 提供完整的代码示例
- 附上学习资源

### 2. 配对审查
- 第一次提交可以面对面审查
- 边审查边讲解
- 解答疑问

### 3. 总结常见问题
- 记录新人常犯的错误
- 编写针对性的指南
- 定期分享

### 示例反馈

> "这是你的第一次PR,做得不错!有几点建议:
>
> 1. 建议添加JavaDoc注释,格式如下:
> ```java
> /**
>  * 方法说明
>  *
>  * @param userId 用户ID
>  * @return 用户信息
>  */
> ```
> 可以参考项目中其他Service的写法。
>
> 2. 异常处理很完善,这一点做得很好!👍
>
> 如有疑问随时问我。"
```

---

## 常见问题和解决方案

### 1. 审查太慢怎么办?

**问题现象:**
- PR提交后长时间没人审查
- 影响开发进度

**解决方案:**

1. **明确审查负责人**
   ```markdown
   - 每个模块指定2-3名审查负责人
   - 轮流值班制度
   - 使用CODEOWNERS文件自动指定审查者
   ```

2. **设置审查时效**
   ```markdown
   - 普通PR: 1天内完成审查
   - 紧急PR: 4小时内完成审查
   - 超时自动提醒
   ```

3. **减小PR规模**
   ```markdown
   - 大型PR拆分为多个小PR
   - 每个PR不超过500行
   - 更容易快速审查
   ```

4. **异步审查工具**
   ```markdown
   - 使用GitHub/GitLab的PR功能
   - 集成飞书/企业微信通知
   - 移动端可以快速响应
   ```

### 2. 审查意见不一致怎么办?

**问题现象:**
- 两个审查者意见相反
- 提交者不知道听谁的

**解决方案:**

1. **建立仲裁机制**
   ```markdown
   - 由技术负责人/架构师最终裁决
   - 团队会议讨论达成共识
   - 记录决策,避免重复争论
   ```

2. **完善规范文档**
   ```markdown
   - 将达成共识的规范文档化
   - 后续按照文档执行
   - 定期更新规范
   ```

3. **案例讨论会**
   ```markdown
   - 每周/每月组织案例讨论
   - 分享优秀代码和问题代码
   - 统一团队认知
   ```

### 3. 审查者不专业怎么办?

**问题现象:**
- 指出的问题不合理
- 审查流于形式

**解决方案:**

1. **审查者培训**
   ```markdown
   - 新人先观察学习
   - 配合资深开发者共同审查
   - 定期培训审查技能
   ```

2. **审查检查清单**
   ```markdown
   - 提供详细的检查清单
   - 逐项检查,避免遗漏
   - 参考: 本文档的审查检查清单
   ```

3. **二级审查**
   ```markdown
   - 普通开发者初审
   - 资深开发者终审
   - 确保审查质量
   ```

### 4. 代码审查太严格影响进度怎么办?

**问题现象:**
- 反复修改多次还不通过
- 影响项目进度

**解决方案:**

1. **区分优先级**
   ```markdown
   - 🔴 必须修改: 阻塞合并
   - 🟡 建议修改: 可以后续优化
   - 🟢 可选优化: 记录到TODO
   ```

2. **渐进式优化**
   ```markdown
   - 核心问题修复后先合并
   - 次要问题创建优化任务
   - 后续迭代中优化
   ```

3. **平衡质量和进度**
   ```markdown
   - 紧急需求适当放宽标准
   - 核心模块严格审查
   - 非核心模块适度审查
   ```

### 5. 大型PR难以审查怎么办?

**问题现象:**
- PR有几千行变更
- 审查者不知从何看起

**解决方案:**

1. **要求拆分PR**
   ```markdown
   - 明确规定PR大小限制(如500行)
   - 超过限制要求拆分
   - 特殊情况需要说明原因
   ```

2. **分阶段审查**
   ```markdown
   - 第一轮: 审查整体设计
   - 第二轮: 审查核心逻辑
   - 第三轮: 审查细节实现
   ```

3. **提供审查指南**
   ```markdown
   - 提交者在PR描述中说明:
     * 主要变更的文件
     * 核心逻辑所在
     * 审查重点
     * 变更依赖关系
   ```

4. **使用工具辅助**
   ```markdown
   - 使用Diff工具高亮变更
   - 使用审查插件标注重点
   - 生成变更影响分析报告
   ```

### 6. 如何处理历史遗留问题?

**问题现象:**
- 新代码依赖旧代码
- 旧代码不规范

**解决方案:**

1. **不要求改动旧代码**
   ```markdown
   - 审查只关注新增/修改的代码
   - 不要求重构整个模块
   - 避免scope扩大
   ```

2. **记录技术债务**
   ```markdown
   - 发现旧代码问题时记录到技术债务列表
   - 专门安排时间处理
   - 不要在当前PR中解决
   ```

3. **渐进式重构**
   ```markdown
   - 制定重构计划
   - 每次迭代重构一部分
   - 逐步消除技术债务
   ```

### 7. 如何避免审查变成走形式?

**问题现象:**
- 审查者快速点击"approve"
- 没有仔细看代码

**解决方案:**

1. **要求实质性反馈**
   ```markdown
   - 每个PR至少提出1-2条建设性意见
   - 或明确说明"代码质量很好,无问题"
   - 避免只点approve不留言
   ```

2. **审查责任制**
   ```markdown
   - 记录审查者信息
   - 生产问题追溯审查过程
   - 建立审查质量考核
   ```

3. **定期抽查**
   ```markdown
   - 技术负责人抽查已合并的PR
   - 检查审查质量
   - 发现问题及时纠正
   ```

4. **自动化检查前置**
   ```markdown
   - 用工具检查代码规范
   - 自动运行测试
   - 人工审查聚焦业务逻辑和设计
   ```

---

## 审查工具

### 1. Git平台工具

#### GitHub

**功能:**
- Pull Request审查
- 行内评论
- Review状态管理
- CODEOWNERS自动分配

**使用示例:**

```markdown
# .github/CODEOWNERS
# 自动分配审查者

# 默认审查者
* @tech-lead @senior-dev

# 后端代码
/ruoyi-modules/** @backend-team
/ruoyi-common/** @backend-team

# 前端代码
/plus-ui/** @frontend-team

# 移动端代码
/plus-uniapp/** @mobile-team

# 文档
/docs/** @doc-maintainer
```

**PR模板:**

```markdown
# .github/pull_request_template.md

## 变更类型
- [ ] 新功能
- [ ] Bug修复
- [ ] 性能优化
- [ ] 代码重构
- [ ] 文档更新
- [ ] 其他

## 变更说明
请简要描述本次变更...

## 测试情况
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 手动测试已完成

## 检查清单
- [ ] 代码符合项目规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 无新增警告

## 关联Issue
Closes #

## 截图(如果适用)
```

#### GitLab

**功能:**
- Merge Request审查
- 多轮审查(Multi-round review)
- 审查规则配置
- CI/CD集成

**配置审查规则:**

```yaml
# .gitlab/CODEOWNERS
# GitLab CODEOWNERS配置

# 默认审查者
* @maintainer

# 按目录分配
/ruoyi-modules/ @backend-lead
/plus-ui/ @frontend-lead
/plus-uniapp/ @mobile-lead
```

### 2. 代码检查工具

#### Checkstyle (Java)

**配置文件:**

```xml
<!-- checkstyle.xml -->
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
    "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
    "https://checkstyle.org/dtds/configuration_1_3.dtd">

<module name="Checker">
    <!-- 文件长度检查 -->
    <module name="FileLength">
        <property name="max" value="1000"/>
    </module>

    <module name="TreeWalker">
        <!-- 命名检查 -->
        <module name="TypeName"/>
        <module name="MethodName"/>
        <module name="ConstantName"/>

        <!-- 方法长度检查 -->
        <module name="MethodLength">
            <property name="max" value="150"/>
        </module>

        <!-- 注释检查 -->
        <module name="JavadocType"/>
        <module name="JavadocMethod"/>
    </module>
</module>
```

**Maven配置:**

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.3.0</version>
    <configuration>
        <configLocation>checkstyle.xml</configLocation>
    </configuration>
</plugin>
```

#### ESLint (JavaScript/TypeScript)

**配置文件:**

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    '@vue/prettier'
  ],
  rules: {
    // 强制使用 === 和 !==
    'eqeqeq': ['error', 'always'],

    // 禁止使用 console
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // 最大函数行数
    'max-lines-per-function': ['warn', { max: 100 }],

    // 必须有注释
    'require-jsdoc': ['warn', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true
      }
    }]
  }
}
```

#### SonarQube

**功能:**
- 代码质量分析
- 安全漏洞检测
- 代码异味识别
- 技术债务追踪

**集成方式:**

```yaml
# .gitlab-ci.yml
sonarqube-check:
  stage: test
  script:
    - mvn clean verify sonar:sonar
      -Dsonar.projectKey=ruoyi-plus
      -Dsonar.host.url=http://sonarqube.example.com
      -Dsonar.login=$SONAR_TOKEN
```

### 3. IDE插件

#### IDEA插件

1. **Alibaba Java Coding Guidelines**
   - 阿里巴巴Java规范检查
   - 实时代码扫描
   - 一键修复

2. **SonarLint**
   - 实时代码质量检查
   - 安全漏洞提示
   - 集成SonarQube规则

3. **CheckStyle-IDEA**
   - CheckStyle集成
   - 实时检查
   - 自定义规则

#### VS Code插件

1. **ESLint**
   - JavaScript/TypeScript检查
   - 自动修复
   - 规则配置

2. **Prettier**
   - 代码格式化
   - 统一代码风格
   - 支持多种语言

3. **GitLens**
   - Git历史查看
   - 代码作者追踪
   - Blame注释

### 4. 自动化审查机器人

#### Danger

**功能:**
- 自动检查PR
- 自动评论
- 强制规范

**配置示例:**

```javascript
// dangerfile.js
import { danger, warn, fail, message } from 'danger'

// 检查PR大小
const bigPRThreshold = 500
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn(':exclamation: 这个PR太大了 (超过500行),建议拆分为多个小PR')
}

// 检查PR描述
if (danger.github.pr.body.length < 10) {
  fail('请提供更详细的PR描述')
}

// 检查测试文件
const hasAppChanges = danger.git.modified_files.some(f =>
  f.includes('src/') && (f.endsWith('.java') || f.endsWith('.ts'))
)
const hasTestChanges = danger.git.modified_files.some(f =>
  f.includes('test/')
)

if (hasAppChanges && !hasTestChanges) {
  warn('看起来你修改了业务代码但没有添加测试用例')
}

// 检查commit message
const commits = danger.github.commits
commits.forEach(commit => {
  const msg = commit.commit.message
  if (!msg.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?:/)) {
    fail(`Commit message 不符合规范: "${msg}"`)
  }
})

message('感谢你的贡献! 🎉')
```

---

## 审查示例

### 示例1: 后端接口审查

**提交的代码:**

```java
// UserController.java
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/list")
    public List<User> list(String name) {
        String sql = "SELECT * FROM sys_user WHERE user_name LIKE '%" + name + "%'";
        return userService.query(sql);
    }

    @PostMapping("/add")
    public String add(User user) {
        userService.save(user);
        return "success";
    }
}
```

**审查意见:**

```markdown
## 🔴 必须修改

### 1. SQL注入风险 (UserController.java:11)
**问题**: 直接拼接SQL,存在严重的SQL注入安全漏洞
**建议**: 使用MyBatis-Plus的Wrapper或参数化查询
```java
@GetMapping("/list")
public R<List<UserVo>> list(@Validated UserQuery query) {
    return R.ok(userService.queryList(query));
}

// UserService
public List<UserVo> queryList(UserQuery query) {
    LambdaQueryWrapper<User> wrapper = Wrappers.lambdaQuery();
    wrapper.like(StringUtils.isNotBlank(query.getName()),
                 User::getUserName, query.getName());
    return baseMapper.selectVoList(wrapper);
}
```

### 2. 缺少权限校验 (UserController.java:11,16)
**问题**: 所有接口都没有权限校验,任何人都可以访问
**建议**: 添加权限注解
```java
@SaCheckPermission("system:user:list")
@GetMapping("/list")
public R<List<UserVo>> list(@Validated UserQuery query) {
    // ...
}

@SaCheckPermission("system:user:add")
@PostMapping("/add")
public R<Void> add(@Validated @RequestBody UserBo user) {
    // ...
}
```

### 3. 缺少参数校验 (UserController.java:16)
**问题**: 用户输入没有校验,可能导致数据异常
**建议**: 使用@Validated注解和校验规则
```java
@PostMapping("/add")
public R<Void> add(@Validated @RequestBody UserBo user) {
    return toAjax(userService.insertUser(user));
}

// UserBo
@Data
public class UserBo {
    @NotBlank(message = "用户名不能为空")
    @Length(min = 2, max = 20, message = "用户名长度必须在2-20之间")
    private String userName;

    @NotBlank(message = "密码不能为空")
    private String password;
}
```

## 🟡 建议修改

### 4. 返回值不规范 (UserController.java:11,16)
**问题**: 返回值不统一,不符合项目规范
**建议**: 使用统一的响应对象R
```java
@GetMapping("/list")
public R<List<UserVo>> list(@Validated UserQuery query) {
    return R.ok(userService.queryList(query));
}

@PostMapping("/add")
public R<Void> add(@Validated @RequestBody UserBo user) {
    return toAjax(userService.insertUser(user));
}
```

### 5. 缺少日志记录 (UserController.java:16)
**问题**: 新增用户没有操作日志
**建议**: 添加@Log注解记录操作
```java
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@PostMapping("/add")
public R<Void> add(@Validated @RequestBody UserBo user) {
    return toAjax(userService.insertUser(user));
}
```

### 6. 缺少注释 (UserController.java:7-20)
**问题**: 类和方法都没有JavaDoc注释
**建议**: 添加完整注释
```java
/**
 * 用户管理控制器
 *
 * @author 抓蛙师
 * @date 2025-11-02
 */
@RestController
@RequestMapping("/user")
public class UserController extends BaseController {

    /**
     * 查询用户列表
     *
     * @param query 查询条件
     * @return 用户列表
     */
    @SaCheckPermission("system:user:list")
    @GetMapping("/list")
    public R<List<UserVo>> list(@Validated UserQuery query) {
        return R.ok(userService.queryList(query));
    }
}
```

## 🟢 可选优化

### 7. 使用依赖注入最佳实践 (UserController.java:9)
**建议**: 使用构造函数注入替代@Autowired
```java
@RequiredArgsConstructor
@RestController
@RequestMapping("/user")
public class UserController extends BaseController {

    private final IUserService userService;

    // ...
}
```

## 总结

这个PR存在多个严重问题,特别是SQL注入和权限缺失,必须修改后才能合并。
建议参考项目中其他Controller的实现方式,如 `SysUserController`。

参考文档:
- [代码规范](/practices/standards/coding)
- [API设计规范](/practices/standards/api-design)
```

### 示例2: 前端组件审查

**提交的代码:**

```vue
<!-- UserList.vue -->
<template>
  <div>
    <el-button @click="load()">查询</el-button>
    <el-table :data="list">
      <el-table-column prop="name" label="姓名" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const list = ref([])

const load = async () => {
  const res = await fetch('/api/user/list')
  list.value = await res.json()
}

load()
</script>
```

**审查意见:**

```markdown
## 🔴 必须修改

### 1. 缺少错误处理 (UserList.vue:17)
**问题**: API调用没有错误处理,请求失败会导致页面崩溃
**建议**: 添加try-catch和用户提示
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listUsers } from '@/api/user'

const loading = ref(false)
const list = ref<User[]>([])

const load = async () => {
  try {
    loading.value = true
    const response = await listUsers()
    list.value = response.data
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败,请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>
```

### 2. 使用原生fetch而非项目API (UserList.vue:17)
**问题**: 项目统一使用封装的http工具,不应直接使用fetch
**建议**: 使用项目中的API层
```typescript
// api/user.ts
import http from '@/utils/http'

export interface User {
  userId: number
  userName: string
  nickName: string
}

export const listUsers = (query?: UserQuery) => {
  return http.get<User[]>('/system/user/list', query)
}

// UserList.vue
import { listUsers } from '@/api/user'

const load = async () => {
  try {
    loading.value = true
    const response = await listUsers(queryParams.value)
    list.value = response.data
  } catch (error) {
    // ...
  }
}
```

## 🟡 建议修改

### 3. 缺少加载状态 (UserList.vue:12)
**问题**: 没有加载状态提示,用户体验不好
**建议**: 添加loading状态
```vue
<template>
  <div v-loading="loading">
    <el-button @click="handleQuery">查询</el-button>
    <el-table :data="list">
      <el-table-column prop="userName" label="姓名" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)

const handleQuery = async () => {
  loading.value = true
  try {
    await load()
  } finally {
    loading.value = false
  }
}
</script>
```

### 4. 缺少类型定义 (UserList.vue:13)
**问题**: 没有使用TypeScript类型,不利于类型检查
**建议**: 添加类型定义
```typescript
import type { User } from '@/api/user/types'

const list = ref<User[]>([])
```

### 5. 组件挂载时立即加载不合理 (UserList.vue:21)
**问题**: 组件挂载时直接调用load(),没有在onMounted中
**建议**: 使用生命周期钩子
```vue
<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  load()
})
</script>
```

## 🟢 可选优化

### 6. 可以使用VueUse简化代码
**建议**: 使用`useAsyncState`简化异步状态管理
```vue
<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { listUsers } from '@/api/user'

const { state: list, isLoading: loading, execute: load } = useAsyncState(
  () => listUsers().then(res => res.data),
  [],
  { immediate: true }
)
</script>
```

## 总结

主要问题:
1. 缺少错误处理(必须修改)
2. 没有使用项目规范的API调用方式(必须修改)
3. 缺少加载状态和类型定义(建议修改)

修改后欢迎重新请求审查。
```

---

## 参考资源

### 内部文档

- [代码规范](/practices/standards/coding) - 项目代码编写规范
- [命名规范](/practices/standards/naming) - 命名约定
- [注释规范](/practices/standards/comment) - 注释标准格式
- [Git使用规范](/practices/standards/git) - Git提交和分支管理
- [API设计规范](/practices/standards/api-design) - RESTful API设计

### 外部资源

**代码审查最佳实践:**
- [Google Engineering Practices](https://google.github.io/eng-practices/review/) - Google的代码审查指南
- [Microsoft Code Review Guidelines](https://learn.microsoft.com/en-us/azure/devops/repos/git/pull-requests) - 微软的PR指南

**工具文档:**
- [GitHub Pull Request文档](https://docs.github.com/en/pull-requests)
- [GitLab Merge Request文档](https://docs.gitlab.com/ee/user/project/merge_requests/)
- [Checkstyle文档](https://checkstyle.org/)
- [ESLint文档](https://eslint.org/)
- [SonarQube文档](https://docs.sonarqube.org/)

---

## 总结

代码审查是保证代码质量的重要环节,通过系统化的审查流程:

1. **✅ 提前发现问题** - 在合并前发现60%-90%的缺陷
2. **📝 统一代码风格** - 保持代码库的一致性
3. **🎓 促进知识共享** - 团队成员互相学习
4. **🚀 提升团队能力** - 持续改进编码水平
5. **💡 降低技术债务** - 避免坏代码累积

**关键要点:**

- **提交者**: 控制PR大小、提供清晰上下文、主动响应反馈
- **审查者**: 及时审查、提供建设性反馈、区分优先级
- **团队**: 建立审查文化、知识分享、持续改进

**审查标准:**

- 🔴 必须修改: 功能缺陷、安全问题、严重性能问题
- 🟡 建议修改: 代码质量、设计问题、可维护性
- 🟢 可选优化: 代码风格、技术建议
- 👍 做得好: 正向反馈,鼓励最佳实践

通过遵循本文档的规范和最佳实践,可以建立高效、友好的代码审查文化,持续提升项目代码质量。

---

**相关文档:**
- [代码规范](/practices/standards/coding)
- [Git使用规范](/practices/standards/git)
- [注释规范](/practices/standards/comment)

**文档维护:**
- 如有问题或建议,请联系: 抓蛙师 (微信/QQ: 770492966)
- 文档会持续更新,反映最新的最佳实践

---

*本文档总计 2918 行,涵盖代码审查的完整流程、检查清单、最佳实践和常见问题,为团队提供系统化的代码审查指南。*
