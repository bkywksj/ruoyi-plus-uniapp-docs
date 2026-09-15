# 等保二级合规

## 概述

框架内置了一套面向**网络安全等级保护2.0第二级**的合规能力，覆盖身份鉴别、安全审计、数据备份恢复三个测评重点。这些能力不是文档层面的建议，而是落在代码与脚本里的强制约束：密码策略由服务端拦截器兜底，审计日志靠类型系统防删除，备份恢复提供可现场演示的脚本。

上游RuoYi-Vue-Plus未包含这部分实现，`PasswordPolicy`、`LogArchive`、`backup.sh`等关键标识在上游仓库的命中数均为0。

### 覆盖的等保条款

| 能力 | 对应条款 | 条款要求 |
|------|---------|---------|
| 密码策略 | 8.1.4.1 a | 身份鉴别信息具有复杂度要求并定期更换 |
| 审计日志归档 | 8.1.4.3 b / c | 审计记录可查阅；定期备份，避免未预期的删除、修改或覆盖 |
| 备份与恢复 | 8.1.4.7 a | 提供重要数据的本地数据备份与恢复功能 |

### 三块能力的关系

三者互相独立，可单独启用，但在测评现场往往被连起来问：

```
身份鉴别 ──► 谁进来了、口令够不够强、多久换一次
                    │
安全审计 ──► 他做了什么、记录能不能被抹掉、留存够不够6个月
                    │
备份恢复 ──► 数据没了能不能找回、恢复流程演练过没有
```

一个常见的失分点是只做了前两项：审计日志留存做得再好，如果整库丢失且没有可用备份，8.1.4.3的留存要求同样落空。

### 适用场景

- 需要通过等保二级测评的政企、教育、医疗类项目
- 面向国企/事业单位交付，招标文件要求提供等保合规说明
- 虽不做测评，但希望具备基本的口令治理与审计留痕能力

C端互联网项目通常不需要强制改密，框架对此做了分档处理：移动端口令有效期默认为0（永不过期），不会误伤海量注册用户。

---

## 密码策略

对应等保二级 8.1.4.1 a。全部判定逻辑集中在`ISysPasswordPolicyService`，策略参数存在`sys_config`表，可在「系统管理 → 参数设置」中在线调整，改完即时生效，无需改代码或重启。

### 策略参数一览

七个参数，全部以`system.password.`为前缀：

| 参数键 | 含义 | 默认值 |
|--------|------|--------|
| `system.password.min-length` | 密码最小长度 | `8` |
| `system.password.complexity` | 需包含的字符种类数（大写/小写/数字/特殊字符） | `3` |
| `system.password.expire-days.pc` | 管理端口令有效期（天） | `180` |
| `system.password.expire-days.app` | 移动端口令有效期（天） | `0` |
| `system.password.expire-notify-days` | 到期前多少天开始提醒 | `15` |
| `system.password.history-count` | 禁止重复使用的历史密码条数 | `3` |
| `system.password.force-change-init` | 是否开启首次登录强制改密 | `1` |

实现类为每个参数都准备了同值的兜底常量。这个兜底不是可有可无的防御性代码：多租户场景下新建租户不会自动拥有这批参数，`getConfigByKey`取不到会返回空串，没有兜底就会在登录链路上抛`NumberFormatException`，导致新租户完全无法登录。

### 复杂度校验

`validateComplexity`按三步依次校验，任一不满足即抛`ServiceException`，异常消息直接可作为前端提示：

```java
// 1. 长度
if (password.length() < minLength) {
    throw ServiceException.of("密码长度不能少于 " + minLength + " 位");
}

// 2. 字符种类数
if (requiredKinds > 0) {
    int actualKinds = countCharKinds(password);
    if (actualKinds < requiredKinds) {
        throw ServiceException.of(
            "密码需至少包含 大写字母、小写字母、数字、特殊字符 中的 " + requiredKinds
            + " 类，当前仅 " + actualKinds + " 类");
    }
}

// 3. 不得包含账号连续片段
if (StringUtils.isNotBlank(userName) && containsUserNameFragment(password, userName)) {
    throw ServiceException.of("密码不能包含用户账号的连续片段");
}
```

几个实现细节值得注意：

- **特殊字符集合是显式枚举的**，为`~!@#$%^&*()-_=+[]{}|;:'",.<>/?\`。中文、空格等字符不计入任何种类，也不直接判失败，交给长度与种类数决定。
- **复杂度参数配成0或负数时视为不校验字符种类**，但长度与账号包含检查仍然保留，不会一刀切关掉全部校验。
- **账号片段阈值为3个字符**。这一项针对的是`admin`→`admin@2026`这类口令，它满足长度和复杂度，却大幅降低了爆破成本，测评时会被重点关注。

### 历史密码防重用

`validateNotReused`校验新密码是否与最近N次用过的密码重复：

```java
// BCrypt 每次加盐结果都不同，无法用等值比较命中，只能逐条 checkpw
for (String history : splitHistory(userDao.selectPwdHistory(userId))) {
    if (BCrypt.checkpw(newPassword, history)) {
        throw ServiceException.of("新密码不能与最近 " + historyCount + " 次使用过的密码相同");
    }
}
```

历史密文存在`sys_user.pwd_history`，逗号分隔、最新在前。选逗号作分隔符是安全的：BCrypt密文的字符集为`[./A-Za-z0-9$]`，不含逗号。

保留条数有一个硬上限`MAX_HISTORY_COUNT = 15`。`pwd_history`字段是`varchar(1000)`，一条BCrypt密文固定60字符加1个分隔符，15条约915字符仍在容量内；参数配得更大时会被夹到这个上限——MySQL非严格模式下超长会静默截断，那会直接把密文写坏且不报错。

写入时整串一次性覆盖，没有「先插入再删除」的中间态，因此不需要事务：

```java
histories.add(0, encryptedPassword);
if (histories.size() > historyCount) {
    histories = histories.subList(0, historyCount);
}
userDao.updatePwdHistory(userId, String.join(HISTORY_SEPARATOR, histories));
```

`history-count`配成0时既不校验也不记录历史——既然不校验重用，就没必要留存，避免无意义的数据增长。

### 密码有效期与分档

`resolveStatus`计算当前用户的口令状态，返回`PasswordStatusVo`：

| 字段 | 含义 |
|------|------|
| `mustChangePwd` | 是否必须改密（从未改过 或 已过期） |
| `pwdExpired` | 是否因过期导致，单独给出便于前端区分文案 |
| `expireInDays` | 距到期剩余天数，仅在「已进提醒窗口但未过期」时有值 |
| `expireDays` | 有效期天数，回传仅用于提示文案 |

判定顺序有两处容易被改错的地方：

```java
// 从未改过密码 → 看是否开启首次强制改密
if (pwdUpdateDate == null) {
    status.setMustChangePwd(isForceChangeOnInit());
    return status;
}

// 必须写 <= 0 而不是 == 0
if (expireDays <= 0) {
    return status;
}
```

有效期判空写`<= 0`而非`== 0`：有人把参数填成`-1`表达「不过期」时同样要能兜住。若写`== 0`，`-1`会被当成「有效期-1天」，导致所有人立刻过期、天天被要求改密。

有效期按用户类型分档：

```java
private int getExpireDaysByUserType(String userType) {
    if (StringUtils.isNotBlank(userType)
        && StringUtils.contains(userType, UserType.APP_USER.getUserType())) {
        return getIntConfig(KEY_EXPIRE_DAYS_APP, DEFAULT_EXPIRE_DAYS_APP);
    }
    return getIntConfig(KEY_EXPIRE_DAYS_PC, DEFAULT_EXPIRE_DAYS_PC);
}
```

分档的现实意义：管理端账号数量可控、权限高，适合严格执行定期更换；C端海量注册用户强制改密不现实，默认给0。

### 强制改密为什么必须在服务端拦

`PasswordStatusVo`的设计约定是**不阻断登录**——阻断会让用户连改密页面都进不去。前端拿到`mustChangePwd`后由路由守卫引导到改密页。

但只做前端守卫是不够的：

> 强制改密原本只做在PC前端的路由守卫里，那只是UI层的引导。拿着token直接调接口（curl / Postman / 脚本）可以完全绕过，移动端也未实现该守卫。测评时只要动手验证一次就会暴露。

因此判定下沉到了服务端的`PasswordPolicyInterceptor`，前端守卫退化为「体验优化」。

拦截器有两个性能与稳定性上的设计：

- **不查库**。判定依据`pwdUpdateDate`随`LoginUser`存在Sa-Token的token session里，每个请求只做一次内存读。
- **懒取Service而非构造注入**。`WebMvcConfigurer`在Spring启动很早期就初始化，那时把业务Service拽进来会让它连同整条依赖链提前实例化，容易触发循环依赖，因此用`SpringUtils.getBean`在`preHandle`里取。

注册配置单独成类，没有并入`ruoyi-common-security`的自动配置：那个模块只依赖`ruoyi-common-satoken`，而密码策略服务在`ruoyi-system`，塞进去会让通用模块反向依赖业务模块，破坏分层。

拦截器`order`设为10，排在Sa-Token登录拦截器（默认0）之后——必须先确认「已登录」再判断「口令是否过期」，顺序颠倒会让未登录请求走进本拦截器并因取不到会话而被放行。

### 拦截器的放行名单

放行名单的取舍原则是**改密页自身能完整加载所需的一切**：

```java
private static final List<String> EXCLUDE_PATTERNS = List.of(
    "/auth/**",                              // 登录、登出、验证码
    "/system/user/updateUserPwd",            // 改密接口本身
    "/system/user/getUserInfo",
    "/system/user/getUserProfile",
    "/system/menu/getRouters",               // 拿不到路由就跳不到改密页
    "/system/dictData/**",
    "/common/**",
    "/system/user/profile/**",
    "/system/social/getSocialBindingList",
    "/monitor/online/listCurrentUserOnlines",
    "/system/notice/getNoticeUnreadCount"
);
```

少放一个，用户就会卡在一个功能残缺、还不停弹错误提示的页面上，反而看不到「去改密码」这个唯一出口。这里放行的都是「读自己的数据」或「公共字典」，不涉及任何业务写操作，因此不会削弱拦截器的约束力。

此外还有两处兜底放行：未登录的请求交给Sa-Token的登录拦截器处理；取不到会话用户（OpenAPI等场景）时放行，避免误伤正常调用。

### 为什么用602而不是401或403

被拦截时返回业务码`602`（`HttpStatus.PASSWORD_CHANGE_REQUIRED`），HTTP层仍是200：

```java
response.setStatus(HttpServletResponse.SC_OK);
response.setContentType(MediaType.APPLICATION_JSON_VALUE);
writer.write(JsonUtils.toJsonString(R.fail(HttpStatus.PASSWORD_CHANGE_REQUIRED, message)));
```

选602的原因：

- **401会让前端判定登录失效并跳登录页**，而重新登录拿到的仍是同一状态，形成「登录 → 被拦 → 登录」的死循环。
- **403的语义是「无此权限」**，前端无法据此把用户引到改密页。

另外，拦截时是直接写响应而非抛`ServiceException`。全局异常处理器对`ServiceException`会调`recordErrorLogAsync`落一条错误日志，被拦住的用户在改密前每次请求都会触发，几分钟就能把`sys_error_log`刷满——这是可预期的策略拦截，不是系统异常。

### 三端对602的处理

`plus-ui`、`plus-app`、`plus-uniapp`三个前端项目的`useHttp`都识别602，但处理方式按端的实际情况分化。

管理端跳改密页，并避免自跳转：

```typescript
if (code === HttpCode.PASSWORD_CHANGE_REQUIRED) {
  const pwdMsg = msg || '请先修改密码'
  if (!noMsgError) {
    showMsgError({ message: pwdMsg, type: 'warning' })
  }
  // 已在个人中心就不再跳，避免改密页自身的请求触发反复跳转
  if (!router.currentRoute.value.path.startsWith('/user/profile')) {
    router.push('/user/profile')
  }
  return Promise.reject(new Error(pwdMsg))
}
```

移动端没有改密页，改为给出明确指引：

```typescript
if (code === HttpCode.PASSWORD_CHANGE_REQUIRED) {
  const pwdMsg = msg || '密码需要修改后才能继续使用，请前往电脑端修改密码'
  if (!noMsgError) {
    toast.error(pwdMsg)
  }
  throw new Error(pwdMsg)
}
```

移动端不做改密页是权衡后的结果：C端账号的有效期参数默认为0，本就不会走到这里；会撞上的只有「PC端账号从移动端登录且刚被管理员重置密码」这种少见组合。但这里不能沉默失败——那样用户只会看到功能莫名全挂，比看到说明更糟。

### 数据库字段

`sys_user`表为此新增两列：

```sql
pwd_update_date datetime      default null comment '密码最后修改时间',
pwd_history     varchar(1000) default null comment '历史密码(BCrypt密文,逗号分隔,最新在前)',
```

`pwd_update_date`在初始化数据中一律为`null`。这是刻意的：配合`force-change-init=1`，所有初始账号首次登录都会被要求改密，不会留下弱口令。开发环境嫌繁琐可把该参数设为`0`关掉。

---

## 审计日志归档

对应等保二级 8.1.4.3 b（审计记录可查阅）与 c（定期备份，避免未预期的删除、修改或覆盖）。

### 归档是搬移而不是复制

核心语义：主表数据搬到归档表后**即从主表删除**，主键沿用原值便于追溯。

```
sys_oper_log   ──搬移──►  sys_oper_log_archive
sys_login_log  ──搬移──►  sys_login_log_archive
（主表只留热数据）        （历史数据可查、不可删）
```

归档表字段镜像主表，额外加一个`archive_time`。这样做的好处是主表体积可控，日常查询走的都是近期数据；历史数据沉到归档表，需要追溯时仍能查到。

### 用类型系统挡住删除

`ISysLoginLogArchiveDao`是全框架少见的**刻意不继承`IBaseDao`**的DAO接口：

```java
public interface ISysLoginLogArchiveDao {

    /** 批量写入归档记录 */
    int batchInsert(Collection<SysLoginLogArchive> entities);

    /** 分页查询归档记录（只读） */
    PageResult<SysLoginLogArchive> pageArchives(SysLoginLogBo bo, PageQuery pageQuery);
}
```

原因很直接：继承`IBaseDao`会一并带来`deleteById`、`delete`、`deleteByIds`等能力，归档表一旦具备删除能力，「防未预期删除」就只剩注释约束了。这里用类型系统把删除挡在外面——拿到本接口的调用方，**编译期就没有删除归档记录的可能**。

归档记录确需清理时，只能由DBA直连数据库操作，该动作会留在数据库自身的审计里。

这个设计比在Service里写`// 不要删除归档`的注释要可靠得多：注释拦不住后来的维护者，编译器可以。

### 不可删不等于不可查

归档表没有删除接口，但**必须能查阅**，否则管理员清空主表后就再也追溯不到历史审计数据，反而违背 8.1.4.3 b。

因此`ISysLogArchiveService`提供了只读的分页查询：

```java
PageResult<SysOperLogVo> pageOperLogArchives(SysOperLogBo bo, PageQuery pageQuery);
PageResult<SysLoginLogVo> pageLoginLogArchives(SysLoginLogBo bo, PageQuery pageQuery);
```

查询条件复用主表的BO，字段完全一致——用户从主表切到归档查询不用重新学。Controller侧对应两个只读接口：

```java
@GetMapping("/pageLoginLogArchives")
public R<PageResult<SysLoginLogVo>> pageLoginLogArchives(SysLoginLogBo loginLog, PageQuery pageQuery) {
    return R.ok(logArchiveService.pageLoginLogArchives(loginLog, pageQuery));
}
```

### 清空日志的语义变化

这是接入归档后最容易被忽略的行为改变：

```java
/**
 * 把指定的操作日志搬入归档表后再从主表删除
 * 供「清空/删除操作日志」接口调用 —— 管理员的清空动作不再是物理销毁，
 * 而是转为归档，审计痕迹得以保留。
 */
int archiveAndRemoveOperLog(Collection<Long> operIds);
```

也就是说，**管理端点「清空」不再是物理删除**，而是把数据搬进归档表。界面上日志列表被清空了，但审计痕迹完整保留。传入空集合表示归档主表全部数据。

这正是 8.1.4.3 c 要防的场景：出了事的人把操作日志一键清空。现在清空只是搬家，归档表里查得到，且谁都删不掉。

### 定时任务与保留期

`LogArchiveScheduledJob`每天凌晨3点把超过保留期的日志搬走：

```java
@Scheduled(cron = "0 0 3 * * ?")
public void archive() {
    log.info("[审计日志归档] 定时任务触发");
    try {
        int count = logArchiveService.archiveAll();
        log.info("[审计日志归档] 定时任务完成，共归档 {} 条", count);
    } catch (Exception e) {
        log.error("[审计日志归档] 定时任务执行失败", e);
    }
}
```

保留天数由`system.log.retain-days`控制，默认180天——等保要求审计记录留存不少于6个月，180天是贴着要求给的下限。

选3点执行是因为此时业务低峰，且避开了多数系统在0-2点的备份窗口，不与数据库全量备份抢IO。单次执行开销很小：查询走`oper_time`/`login_time`索引，分批搬移（每批1000条）且限制最大轮数，不会长时间占用数据库连接。

定时任务里必须吞掉异常：Spring的`@Scheduled`遇到未捕获异常虽不会停掉后续调度，但异常栈会直接打到控制台且无上下文。

### 为什么用@Scheduled而不是SnailJob

框架自带SnailJob做分布式调度，归档任务却用了Spring原生的`@Scheduled`：

- 归档任务是**幂等**的（本次没搬完下次继续）
- **单机执行即可**（多节点重复跑没有意义）
- **失败后下次自动补齐**

用不上SnailJob的可视化调度、失败重试、分布式分片。为它引入SnailJob依赖会让框架核心功能挂上一个可选组件，且SnailJob客户端需常驻长连接与心跳，成本高于收益。

### 一个必须注意的启用陷阱

`LogArchiveScheduledJob`类上自带了`@EnableScheduling`，这个注解**不能删**：

```java
@Slf4j
@Component
@RequiredArgsConstructor
@EnableScheduling   // ← 不能删
public class LogArchiveScheduledJob {
```

框架的`JobAutoConfiguration`虽然标了`@EnableScheduling`，但它整体挂在下面这个条件上：

```java
@ConditionalOnProperty(prefix = "snail-job", name = "enabled", havingValue = "true")
```

也就是说，**`snail-job.enabled=false`（默认值）时，Spring定时任务根本没被启用**，此时任何`@Scheduled`方法都会静默不执行——不报错、不打日志，极难排查。

如果你发现归档任务没跑，先确认这个注解还在。

### 管理端归档查询入口

`LogArchiveDialog.vue`是操作日志与登录日志共用的归档查询抽屉，挂在两个日志页面上。弹窗顶部有一条固定说明，目的是让使用者一眼明白这些数据是怎么来的、为什么删不掉：

> 清空日志时数据会自动搬到归档表保留，不会被物理删除。归档记录仅可查阅与导出，系统未提供任何删除接口——如需清理只能由DBA直连数据库操作。

搜索条件与主表保持一致，支持模糊搜索与时间范围。

---

## 备份与恢复

对应等保二级 8.1.4.7 a「提供重要数据的本地数据备份与恢复功能」。实现为`script/backup/`下的两个Shell脚本加一份配置样例。

### 为什么是独立脚本而不是做进应用

> 应用挂掉恰恰是最需要备份的时候，把备份绑在应用生命周期上等于在最关键时刻失效。

这是脚本头部写明的第一条取舍。数据库备份不应依赖应用进程存活，也不应受应用的JVM内存、线程池状态影响。

目录结构：

```
script/backup/
├── README.md                # 设计说明与接入指引
├── backup.env.example       # 配置样例（复制为 backup.env 使用）
├── backup.sh                # 备份
├── restore.sh               # 恢复
└── drill-log.example.md     # 恢复演练记录模板
```

`backup.env`含明文口令，已在`.gitignore`中排除，权限务必设成600，否则同机器上的其他用户可以直接读到数据库密码。

### 备份脚本的完整性校验

这是整个脚本里最值得注意的一段：

```bash
# mysqldump 正常结束时会在文件末尾写 "Dump completed on ..."。
# 磁盘写满、网络中断等情况下它可能已经吐出大半个文件才失败，
# 此时文件存在且体积可观，但恢复时会在中途报语法错误
if ! tail -5 "$out" | grep -q "Dump completed"; then
    log "[失败] 备份文件不完整（缺少 Dump completed 标记），删除：$out"
    rm -f "$out"
    return 1
fi
```

没有这一步校验，最坏的情况是：备份目录里躺着一堆看起来正常、体积也对的`.sql.gz`，直到真需要恢复时才发现全都用不了。脚本宁可删掉不完整的文件并报错，也不留一个假的安全感。

`mysqldump`的参数同样有讲究：

```bash
mysqldump --defaults-file="$CNF_FILE" \
    --single-transaction \
    --default-character-set=utf8mb4 \
    --routines --triggers --events \
    --set-gtid-purged=OFF \
    --databases "$db"
```

| 参数 | 作用 |
|------|------|
| `--single-transaction` | InnoDB下开一致性快照，不锁表也不会读到跨表不一致的数据 |
| `--default-character-set=utf8mb4` | 不指定的话中文会变成乱码，而且备份时不报任何错 |
| `--routines --triggers --events` | 存储过程、触发器、事件一起带走，否则恢复出来的库是残缺的 |

### 口令不走命令行

```bash
# 口令通过临时 defaults 文件传给 mysqldump，不用 -p 命令行参数 ——
# 命令行上的密码会出现在 ps 输出里，同机器上任何用户都看得到
CNF_FILE="$(mktemp)"
chmod 600 "$CNF_FILE"
cleanup() { rm -f "$CNF_FILE"; }
trap cleanup EXIT
```

用`trap`保证异常退出时临时文件也会被清理。这一条在等保测评中属于「口令保密性」的加分项。

### SnailJob独立库

SnailJob用的是独立数据库，配置里单独列了一项：

```bash
# SnailJob 的独立库。没启用定时任务就留空；
# 启用了却留空，备份会漏掉全部任务定义与执行记录
JOB_DB_NAME=
```

开了定时任务却只备份主库，恢复后会发现所有任务定义都没了。

### 过期清理

```bash
if [[ "$RETAIN_DAYS" -gt 0 ]]; then
    DELETED="$(find "$BACKUP_DIR" -maxdepth 1 -name "*.sql.gz" -type f -mtime "+$RETAIN_DAYS" -print -delete | wc -l)"
fi
```

`RETAIN_DAYS`默认30天，填0表示不自动清理——但不建议，磁盘写满后备份会静默失败，那时才是真的没有备份。

等保二级对备份保留期没有硬性天数要求，30天是常见取值；若审计日志也依赖备份追溯，建议不少于180天以对齐 8.1.4.3 的留存要求。

### 恢复的覆盖性与二次确认

> 恢复是覆盖性操作：目标库的现有数据会被备份文件里的内容整个替换。所以这里刻意做成「必须显式指定文件名 + 二次确认」，不提供「恢复最新一份」这种便捷入口——手滑跑一次就是生产事故。

不带参数时只列清单，不做任何有副作用的事：

```bash
./restore.sh                                      # 列出可用备份
./restore.sh ryplus_uni_20260904_030000.sql.gz    # 恢复指定备份
./restore.sh xxx.sql.gz --yes                     # 跳过确认（仅供演练脚本调用）
```

二次确认要求输入目标库名，而不是简单的y/n：

```bash
if [[ "$ASSUME_YES" != "--yes" ]]; then
    read -r -p "确认恢复？请输入目标库名以继续：" CONFIRM
    if [[ "$CONFIRM" != "$TARGET_DB" ]]; then
        echo "输入不匹配，已取消"
        exit 1
    fi
fi
```

确认前会打印备份文件、大小、备份时间、目标库与一行醒目警告，让操作者有机会发现自己选错了文件。

### 恢复后的应用侧动作

恢复完成后脚本会统计表数量并打印两条必做事项：

```
🔴 应用侧务必确认：
   1. 重启后端 —— 恢复后数据变了，但应用与 Redis 里还留着旧数据的缓存
   2. 清理 Redis —— 登录态、字典、参数等缓存与恢复后的库可能对不上
```

漏掉这两步的典型症状是：数据库里明明已经是恢复后的数据，页面上显示的却还是旧的字典和参数，或者用一个已经不存在的账号还能正常操作。

### 接入定时执行

cron方式（JAR部署/裸机）：

```bash
# 每天凌晨 2 点备份。选 2 点是为了避开 3 点的审计日志归档任务，
# 两者都吃磁盘 IO，撞一起会互相拖慢
0 2 * * * /opt/ryplus/script/backup/backup.sh >> /data/backup/ryplus/cron.log 2>&1
```

备份与归档的时间安排是配套设计的：2点备份、3点归档，互不干扰。

容器部署可通过Docker compose挂载脚本目录后由宿主机cron触发。

### 恢复演练记录

光有`backup.sh`是过不了测评的：8.1.4.7 明确要求「备份**与恢复**功能」，测评时大概率会让你现场演示恢复一次。

`drill-log.example.md`提供了演练记录模板，建议每季度演练一次。记录内容包括演练人、备份文件、恢复目标库、耗时，以及一张源库与恢复库的比对表：

| 项 | 源库 | 恢复库 | 结论 |
|---|---|---|---|
| 表数量 | 58 | 58 | 一致 |
| `sys_user` | 38 | 38 | 一致 |
| `sys_oper_log_archive` | 1588 | 1588 | 一致 |
| 中文字段 | 抓蛙师 | 抓蛙师 | 无乱码 |
| 等保新增列 | `pwd_update_date` / `pwd_history` | 同 | 结构完整 |

演练务必恢复到**独立演练库**，不要碰生产或开发库。

实际演练记录另存为`drill-log.md`（已在`.gitignore`中排除，因为里面会写到具体的库名、数据量等环境信息）。

测评时被问「备份能不能恢复」，拿得出演练记录比拿一堆没人验证过的备份文件有说服力得多。

---

## 配置速查

### sys_config 参数

全部可在「系统管理 → 参数设置」在线调整，改完即时生效。

| 参数键 | 默认值 | 说明 |
|--------|--------|------|
| `system.password.min-length` | `8` | 密码最小长度 |
| `system.password.complexity` | `3` | 字符种类数要求，0或负数表示不校验种类 |
| `system.password.expire-days.pc` | `180` | 管理端有效期，`<= 0`表示永不过期 |
| `system.password.expire-days.app` | `0` | 移动端有效期，默认不过期 |
| `system.password.expire-notify-days` | `15` | 到期前提醒天数，0表示不提醒 |
| `system.password.history-count` | `3` | 历史密码禁用条数，0表示不校验也不记录，上限15 |
| `system.password.force-change-init` | `1` | 首次登录强制改密，`1`开启`0`关闭 |
| `system.log.retain-days` | `180` | 审计日志主表保留天数，超期搬入归档表 |

### backup.env 参数

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DB_HOST` | `127.0.0.1` | 数据库地址 |
| `DB_PORT` | `3306` | 数据库端口 |
| `DB_USERNAME` | `root` | 数据库账号 |
| `DB_PASSWORD` | 无 | 必填，缺失时脚本直接报错退出 |
| `DB_NAME` | `ryplus_uni` | 主库名，改过项目标识符要跟着改 |
| `JOB_DB_NAME` | 空 | SnailJob独立库，启用定时任务时必填 |
| `BACKUP_DIR` | `/data/backup/ryplus` | 备份存放目录 |
| `RETAIN_DAYS` | `30` | 备份保留天数，0表示不清理 |

### 涉及的数据库对象

| 对象 | 类型 | 用途 |
|------|------|------|
| `sys_user.pwd_update_date` | 列 | 密码最后修改时间，`null`表示从未改过 |
| `sys_user.pwd_history` | 列 | 历史BCrypt密文，逗号分隔，最新在前 |
| `sys_oper_log_archive` | 表 | 操作日志归档，字段镜像主表加`archive_time` |
| `sys_login_log_archive` | 表 | 登录日志归档，同上 |

---

## 落地清单

测评前可按此自检。

**身份鉴别（8.1.4.1 a）**

- [ ] `sys_config`中7个`system.password.*`参数均存在且取值合理
- [ ] 多租户环境下，新建租户同样拥有这批参数（或确认兜底默认值可接受）
- [ ] 用curl带token直接调业务接口，确认被602拦住——这是测评最可能实测的一项
- [ ] 初始账号的`pwd_update_date`为`null`，首次登录确实被要求改密
- [ ] 尝试把密码改回上一次用过的，确认被拒绝
- [ ] 尝试用含账号片段的口令，确认被拒绝

**安全审计（8.1.4.3 b / c）**

- [ ] 确认`LogArchiveScheduledJob`上的`@EnableScheduling`还在
- [ ] 观察凌晨3点后的日志，确认归档任务实际执行（搜索`[审计日志归档]`）
- [ ] 在管理端点「清空操作日志」，随后在归档抽屉中确认数据仍可查到
- [ ] 确认`system.log.retain-days`不小于180
- [ ] 确认代码中不存在针对归档表的删除入口

**数据备份恢复（8.1.4.7 a）**

- [ ] `backup.env`已创建且权限为600
- [ ] 启用了定时任务的话，`JOB_DB_NAME`已填写
- [ ] cron已配置且实际产出了备份文件
- [ ] 随机抽一个备份文件，确认末尾有`Dump completed`标记
- [ ] 已完成至少一次恢复演练并留有`drill-log.md`记录
- [ ] 演练使用的是独立演练库，未触碰生产库

---

## 常见问题

### 归档定时任务不执行，日志里什么都没有

最常见的原因是`snail-job.enabled`为默认的`false`，导致框架的`JobAutoConfiguration`整体未生效，Spring定时任务从未被启用。此时所有`@Scheduled`方法都会静默不执行，不报错也不打日志。

先确认`LogArchiveScheduledJob`类上的`@EnableScheduling`注解还在。这个注解是为这个场景专门加的，历史上有人以为它和自动配置重复而删掉。

### 新建租户的用户无法登录，报数字格式异常

早期版本的表现。多租户下新建租户不会自动继承`sys_config`里的密码策略参数，`getConfigByKey`返回空串导致`Integer.parseInt`失败，且失败点在登录链路上。

现版本每个参数都有兜底常量，不会再出现。若自定义了新的策略参数，记得同样加兜底。

### 用户被强制改密后，页面上到处报错

检查拦截器的放行名单是否覆盖了改密页所需的全部接口。如果做了UI定制、改密页引入了新的数据接口，需要把对应路径加进`EXCLUDE_PATTERNS`。

判断标准是：该接口是否属于「读自己的数据」或「公共字典」。是则可以放行，不会削弱约束力；涉及业务写操作的接口不应放行。

### 移动端用户被602拦住但没有改密入口

这是设计上已知的取舍。移动端未实现改密页，会撞上这种情况的只有「PC端账号从移动端登录且刚被管理员重置密码」。此时移动端会提示前往电脑端修改。

如果你的项目确实需要移动端改密，需要自行实现改密页并在`useHttp`的602分支里改为跳转。

### 清空日志后磁盘空间没有释放

因为清空是搬移不是删除，数据从主表进了归档表，总量不变。这是 8.1.4.3 c 的要求所在。

若归档表体积确实需要治理，只能由DBA直连数据库按时间范围清理，该动作会留在数据库自身的审计里。框架不提供任何代码层面的归档删除入口。

### 备份文件存在但恢复时报语法错误

正常情况下不会发生——`backup.sh`会校验`Dump completed`标记，不完整的文件会被直接删除。

如果确实遇到，说明这个文件不是由本脚本产出的，或者脚本被改动过。检查备份目录里是否混入了手工执行`mysqldump`生成的文件。

### 恢复后页面数据显示不正确

恢复只换了数据库，应用与Redis里仍是旧数据的缓存。必须重启后端并清理Redis。

典型症状是字典、参数显示为旧值，或者一个已不存在的账号仍能正常操作（登录态还在Redis里）。

### 密码复杂度想要求必须包含特殊字符

现有实现是「四类中任选N类」，无法指定必须包含某一类。把`complexity`配成`4`可以达到「四类全要」的效果，间接实现必须含特殊字符。

如需更精细的规则（如必须含特殊字符但大小写二选一），需要扩展`validateComplexity`。
