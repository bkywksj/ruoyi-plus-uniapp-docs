# 命名规范

> 统一的命名规范是代码可读性和可维护性的基础。本文档详细介绍 RuoYi-Plus-UniApp 全栈框架的命名约定。

## 简介

本文档基于 RuoYi-Plus-UniApp 实际源码提取,涵盖后端 Java、前端 Vue/TypeScript、移动端 UniApp 和数据库的完整命名规范。所有规范都提供了源码位置引用,确保与实际代码保持一致。

**核心原则:**
- **一致性** - 同类型的代码使用相同的命名风格
- **语义化** - 名称要清晰表达其含义和用途
- **简洁性** - 避免过长或过度缩写
- **规范性** - 遵循行业通用标准

---

## 命名风格对照表

| 风格名称 | 说明 | 示例 | 适用场景 |
|---------|------|------|----------|
| **PascalCase(大驼峰)** | 每个单词首字母大写 | `UserService` | Java类名、接口、TypeScript类型 |
| **camelCase(小驼峰)** | 首单词小写,其余首字母大写 | `getUserInfo` | 方法名、变量名、函数名 |
| **snake_case(下划线)** | 全小写,下划线分隔 | `user_name` | 数据库表名、字段名 |
| **SCREAMING_SNAKE_CASE** | 全大写,下划线分隔 | `MAX_SIZE` | 常量 |
| **kebab-case(连字符)** | 全小写,连字符分隔 | `wd-button.vue` | 组件文件名 |

---

## 后端 Java 命名规范

### 包名命名

**规范:** 全小写,使用反向域名格式,多个单词用点分隔

```java
// ✅ 正确
plus.ruoyi.business.base.service
plus.ruoyi.business.base.mapper
plus.ruoyi.business.base.domain
plus.ruoyi.common.core.constant

// ❌ 错误
Plus.Ruoyi.Business.Base.Service  // 不应使用大写
plus.ruoyi.Business.base.service  // 不应混用大小写
plus_ruoyi_business_base_service  // 不应使用下划线
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/IAdService.java:1`

---

### 类名命名

#### Controller 类

**规范:** 大驼峰命名,以 `Controller` 结尾

```java
// ✅ 正确
public class HomeController { }
public class PhoneController { }
public class WxShareController { }
public class UserController { }

// ❌ 错误
public class homeController { }      // 首字母应大写
public class Home { }                 // 缺少 Controller 后缀
public class home_controller { }      // 不应使用下划线
public class HomeCtrl { }             // 应完整拼写 Controller
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/api/app/HomeController.java:35`

---

#### Service 接口

**规范:** 大驼峰命名,以 `I` 开头,以 `Service` 结尾

```java
// ✅ 正确
public interface IAdService { }
public interface IAiService { }
public interface IBindService { }
public interface IGoodsService { }
public interface IUserService { }

// ❌ 错误
public interface AdService { }        // 缺少 I 前缀
public interface IAdServiceImpl { }   // 接口不应有 Impl 后缀
public interface Iad_service { }      // 不应使用下划线
public interface IAdSvc { }           // 应完整拼写 Service
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/IAdService.java:16`

---

#### Service 实现类

**规范:** 大驼峰命名,以 `Impl` 结尾

```java
// ✅ 正确
@Service
public class AdServiceImpl implements IAdService { }
public class AiServiceImpl implements IAiService { }
public class UserServiceImpl implements IUserService { }

// ❌ 错误
public class AdServiceImp { }         // 应为 Impl 不是 Imp
public class AdServiceImplementation { } // 过长,应使用 Impl
public class AdService { }            // 缺少 Impl 后缀
public class AdSvcImpl { }            // Service 不应缩写
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/impl/AdServiceImpl.java:30`

---

#### Mapper 接口

**规范:** 大驼峰命名,以 `Mapper` 结尾

```java
// ✅ 正确
public interface AdMapper extends BaseMapper<Ad> { }
public interface BindMapper extends BaseMapper<Bind> { }
public interface GoodsMapper extends BaseMapper<Goods> { }
public interface UserMapper extends BaseMapper<User> { }

// ❌ 错误
public interface AdDao { }            // 应使用 Mapper 不是 Dao
public interface Admapper { }         // Mapper 首字母应大写
public interface ad_mapper { }        // 不应使用下划线
public interface AdMap { }            // 应完整拼写 Mapper
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/mapper/AdMapper.java:16`

---

#### DAO 接口

**规范:** 大驼峰命名,以 `I` 开头,以 `Dao` 结尾

```java
// ✅ 正确
public interface IAdDao extends IBaseDao<Ad> { }
public interface IBindDao extends IBaseDao<Bind> { }
public interface IUserDao extends IBaseDao<User> { }

// ❌ 错误
public interface AdDao { }            // 缺少 I 前缀
public interface IAdDAO { }           // Dao 应为 Dao 不是 DAO
public interface IAdMapper { }        // Dao 层应用 Dao 不是 Mapper
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/dao/IAdDao.java:13`

---

#### 实体类 (Entity/Domain)

**规范:** 大驼峰命名,直接使用业务名称,无特定后缀

```java
// ✅ 正确
@TableName("b_ad")
public class Ad extends TenantEntity { }

@TableName("b_bind")
public class Bind extends TenantEntity { }

@TableName("b_platform")
public class Platform extends TenantEntity { }

@TableName("sys_user")
public class SysUser extends BaseEntity { }

// ❌ 错误
public class AdEntity { }             // 不需要 Entity 后缀
public class AdDomain { }             // 不需要 Domain 后缀
public class ad { }                   // 首字母应大写
public class AD { }                   // 不应全大写
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/Ad.java:19`

---

#### 业务对象 (Bo)

**规范:** 大驼峰命名,以 `Bo` 结尾

```java
// ✅ 正确
public class AdBo extends BaseEntity { }
public class AiChatBo { }
public class PaymentBo { }
public class GoodsBo { }
public class UserBo { }

// ❌ 错误
public class AdBO { }                 // Bo 应为 Bo 不是 BO
public class AdBusinessObject { }     // 过长,应使用 Bo
public class Ad_Bo { }                // 不应使用下划线
public class AdBo_ { }                // 不应有尾部下划线
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/bo/AdBo.java:27`

---

#### 视图对象 (Vo)

**规范:** 大驼峰命名,以 `Vo` 结尾

```java
// ✅ 正确
public class AdVo { }
public class AiChatVo { }
public class SystemFeatureVo { }
public class UserVo { }

// ❌ 错误
public class AdVO { }                 // Vo 应为 Vo 不是 VO
public class AdViewObject { }         // 过长,应使用 Vo
public class AdView { }               // 应使用 Vo 后缀
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/domain/vo/AdVo.java`

---

#### DTO 对象

**规范:** 大驼峰命名,以 `DTO` 结尾(全大写)

```java
// ✅ 正确
public class PlatformDTO { }
public class UserDTO { }
public class OrderDTO { }

// ❌ 错误
public class PlatformDto { }          // 应为 DTO 不是 Dto
public class PlatformDTo { }          // 应为 DTO 不是 DTo
public class PlatformDataTransferObject { } // 过长,应使用 DTO
```

参考: `ruoyi-common/ruoyi-common-core/src/main/java/plus/ruoyi/common/core/domain/dto/PlatformDTO.java:18`

---

#### 工具类

**规范:** 大驼峰命名,以 `Utils` 结尾

```java
// ✅ 正确
public class DateUtils { }
public class FileUtils { }
public class AddressUtils { }
public class MapstructUtils { }
public class StringUtils { }

// ❌ 错误
public class DateUtil { }             // 应为 Utils 不是 Util
public class FileUtility { }          // 应为 Utils 不是 Utility
public class fileUtils { }            // 首字母应大写
public class DateHelper { }           // 应使用 Utils 不是 Helper
```

参考: `ruoyi-common/ruoyi-common-core/src/main/java/plus/ruoyi/common/core/utils/DateUtils.java`

---

#### 常量类

**规范:** 大驼峰命名,以 `Constants` 结尾

```java
// ✅ 正确
public interface Constants { }
public interface CacheConstants { }
public interface GlobalConstants { }
public interface HttpConstants { }

// ❌ 错误
public interface Constant { }         // 应为 Constants 不是 Constant
public interface CONSTANTS { }        // 不应全大写
public interface ConstDef { }         // 应使用完整 Constants
```

参考: `ruoyi-common/ruoyi-common-core/src/main/java/plus/ruoyi/common/core/constant/Constants.java:8`

---

### 方法命名

#### Controller 方法

**规范:** 小驼峰命名,使用动词前缀

```java
// ✅ 正确 - 查询方法
public R<String> getTenantIdByAppid(String appid) { }
public R<UserVo> getUser(Long id) { }
public R<List<AdVo>> listAds(AdBo bo) { }
public R<PageResult<GoodsVo>> pageGoods(GoodsBo bo, PageQuery pageQuery) { }

// ✅ 正确 - 操作方法
public R<Long> addUser(UserBo bo) { }
public R<Void> updateUser(UserBo bo) { }
public R<Void> deleteUser(Long id) { }
public R<Void> batchDelete(Long[] ids) { }
public R<Void> exportUsers(UserBo bo) { }
public R<Void> importUsers(MultipartFile file) { }

// ❌ 错误
public R<UserVo> GetUser(Long id) { }        // 首字母不应大写
public R<UserVo> user(Long id) { }           // 缺少动词前缀
public R<Void> delUser(Long id) { }          // 应使用完整 delete
public R<Void> remove_user(Long id) { }      // 不应使用下划线
```

**常用动词前缀:**
- `get` - 获取单个对象
- `list` - 获取列表(不分页)
- `page` - 获取分页列表
- `add` - 新增
- `update` - 修改
- `delete` - 删除
- `batch` - 批量操作
- `export` - 导出
- `import` - 导入

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/api/app/HomeController.java:50-80`

---

#### Service 方法

**规范:** 小驼峰命名,与 Controller 保持一致

```java
// ✅ 正确 - 查询方法
AdVo get(Long id);
List<AdVo> list(AdBo bo);
PageResult<AdVo> page(AdBo bo, PageQuery pageQuery);

// ✅ 正确 - 操作方法
Long add(AdBo bo);
boolean update(AdBo bo);
boolean delete(Long id);
boolean batchDelete(Collection<Long> ids);
boolean batchSave(List<AdBo> boList);

// ✅ 正确 - 业务方法
boolean checkExists(String name);
boolean validatePermission(Long userId);
void sendNotification(String message);

// ❌ 错误
void Add(AdBo bo);                    // 首字母不应大写
void insert(AdBo bo);                 // 应使用 add 不是 insert
void remove(Long id);                 // 应使用 delete 不是 remove
void del(Long id);                    // 不应缩写
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/base/service/IAdService.java:18-73`

---

### 变量命名

#### 成员变量

**规范:** 小驼峰命名,使用 `private final` 修饰符(依赖注入)

```java
// ✅ 正确
/** 平台配置服务 */
private final PlatformService platformService;

/** 广告管理服务 */
private final IAdService adService;

/** 商品管理服务 */
private final IGoodsService goodsService;

private final IAdDao adDao;
private final RedisUtils redisUtils;

// ❌ 错误
private final PlatformService PlatformService;  // 首字母不应大写
private final IAdService ad_service;            // 不应使用下划线
private final IGoodsService m_goodsService;     // 不应使用匈牙利命名法
private final RedisUtils REDIS_UTILS;           // 不应全大写
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/api/app/HomeController.java:37-42`

---

#### 局部变量

**规范:** 小驼峰命名,语义清晰

```java
// ✅ 正确
PlatformDTO platformDTO = platformService.getPlatformByAppid(appid, null);
Ad entity = adDao.getById(id);
List<Ad> entities = adDao.list(wrapper);
PageResult<Ad> entityPage = adDao.page(wrapper, pageQuery);
String userName = user.getUserName();
boolean isValid = validateInput(input);

// ❌ 错误
PlatformDTO DTO = platformService.get(appid);   // 变量名过于简单
Ad a = adDao.getById(id);                       // 变量名过于简单
List<Ad> list = adDao.list(wrapper);            // 使用保留关键字
String name = user.getUserName();               // 语义不够明确
boolean b = validateInput(input);               // 变量名过于简单
```

参考: `ruoyi-modules/ruoyi-business/src/main/java/plus/ruoyi/business/api/app/HomeController.java:52`

---

### 常量命名

**规范:** 全大写,多个单词用下划线分隔(SCREAMING_SNAKE_CASE)

```java
// ✅ 正确 - 字符串常量
String ALL = "0";
String DEV = "dev";
String PROD = "prod";
String UTF8 = "UTF-8";
String HTTP = "http://";
String HTTPS = "https://";

// ✅ 正确 - 数字常量
Integer CAPTCHA_EXPIRATION = 2;
Long TOP_PARENT_ID = 0L;
int MAX_SIZE = 100;
int DEFAULT_PAGE_SIZE = 10;

// ✅ 正确 - 复合单词常量
String ENCRYPT_HEADER = "ENC_";
String CACHE_KEY_PREFIX = "cache:";
String LOGIN_USER_KEY = "login_user_key";

// ❌ 错误
String all = "0";                     // 应全大写
String Utf8 = "UTF-8";                // 应全大写
Integer captchaExpiration = 2;        // 应全大写加下划线
String encryptHeader = "ENC_";        // 应全大写加下划线
int maxSize = 100;                    // 应全大写加下划线
```

参考: `ruoyi-common/ruoyi-common-core/src/main/java/plus/ruoyi/common/core/constant/Constants.java:13-70`

---

## 前端 Vue/TypeScript 命名规范

### 文件命名

#### Vue 组件文件

**规范:** 大驼峰命名,业务组件使用 `A` 前缀

```
✅ 正确
AAiAssistant.vue                      // 业务组件
AAiContentReviewer.vue                // 业务组件
AActivityCard.vue                     // 业务组件
ASearchForm.vue                       // 业务组件
DictTag.vue                           // 基础组件
Icon.vue                              // 基础组件
Pagination.vue                        // 基础组件

❌ 错误
ai-assistant.vue                      // 应使用大驼峰
aAiAssistant.vue                      // 首字母应大写
AiAssistant.Vue                       // 扩展名应小写
a-ai-assistant.vue                    // 不应使用连字符
```

参考: `plus-ui/src/components/AAi/AAiAssistant.vue`

---

#### TypeScript 文件

**规范:** 小驼峰命名,按功能添加后缀

```
✅ 正确
adApi.ts                              // API接口文件
adTypes.ts                            // 类型定义文件
adTypes.generated.ts                  // 自动生成的类型文件
userApi.ts
userTypes.ts
homeApi.ts

❌ 错误
AdApi.ts                              // 首字母不应大写
ad-api.ts                             // 不应使用连字符
ad_api.ts                             // 不应使用下划线
ad.api.ts                             // 不应使用多个点
```

**文件后缀约定:**
- `*Api.ts` - API 接口文件
- `*Types.ts` - 类型定义文件
- `*.generated.ts` - 自动生成的文件

参考: `plus-ui/src/api/business/base/ad/adApi.ts`

---

#### 工具函数文件

**规范:** 小驼峰命名,单一功能用单数,多功能用复数

```
✅ 正确
cache.ts                              // 缓存工具
colors.ts                             // 颜色工具
crypto.ts                             // 加密工具
boolean.ts                            // 布尔工具
class.ts                              // 类名工具
validators.ts                         // 验证器集合

❌ 错误
Cache.ts                              // 首字母不应大写
cache-util.ts                         // 不需要 util 后缀
cacheUtils.ts                         // 不需要 Utils 后缀
```

参考: `plus-ui/src/utils/cache.ts`

---

#### Composables 文件

**规范:** 小驼峰命名,以 `use` 开头

```
✅ 正确
useAiChat.ts
useAnimation.ts
useAuth.ts
useDialog.ts
useDict.ts

❌ 错误
AiChat.ts                             // 缺少 use 前缀
aiChat.ts                             // 缺少 use 前缀
Use_Dict.ts                           // 不应使用下划线
usedict.ts                            // Dict 首字母应大写
```

参考: `plus-ui/src/composables/useAiChat.ts`

---

### 变量命名

#### 响应式变量

**规范:** 小驼峰命名,使用 `ref` 或 `reactive`

```typescript
// ✅ 正确
const isLoading = ref(false)
const buttonType = ref('primary')
const userInfo = ref<UserInfo | null>(null)
const formData = reactive({ name: '', age: 0 })
const dialogVisible = ref(false)

// ❌ 错误
const IsLoading = ref(false)          // 首字母不应大写
const button_type = ref('primary')    // 不应使用下划线
const USERINFO = ref(null)            // 不应全大写
const user_info = ref(null)           // 不应使用下划线
```

参考: `plus-ui/src/stores/modules/dict.ts:35`

---

#### 常量

**规范:** 全大写,多个单词用下划线分隔

```typescript
// ✅ 正确
const MAX_SIZE = 100
const DEFAULT_COLOR = '#1890ff'
const API_BASE_URL = '/api'
const DICT_MODULE = 'dict'
const KEY_PREFIX = `${SystemConfig.app.id}:`

// ❌ 错误
const maxSize = 100                   // 应全大写
const DefaultColor = '#1890ff'        // 应全大写
const apiBaseUrl = '/api'             // 应全大写
const dict_module = 'dict'            // 应全大写
```

参考: `plus-ui/src/stores/modules/dict.ts:17`

---

### 函数命名

#### 普通函数

**规范:** 小驼峰命名,使用动词前缀

```typescript
// ✅ 正确
const handleClick = () => { }
const getIconClass = () => { }
const validateForm = () => { }
const fetchData = async () => { }
const calculateTotal = () => { }
const formatDate = (date: Date) => { }

// ❌ 错误
const HandleClick = () => { }         // 首字母不应大写
const handle_click = () => { }        // 不应使用下划线
const click = () => { }               // 应添加动词前缀
const iconClass = () => { }           // 应添加动词前缀 get
```

**常用动词前缀:**
- `get` - 获取数据
- `set` - 设置数据
- `fetch` - 异步获取数据
- `handle` - 处理事件
- `on` - 事件回调
- `validate` - 验证
- `calculate` - 计算
- `format` - 格式化

参考: `plus-ui/src/stores/modules/dict.ts:43-98`

---

#### Composables 函数

**规范:** 小驼峰命名,以 `use` 开头

```typescript
// ✅ 正确
export const useDict = (...args: string[]): DataResult => { }
export const useAuth = () => { }
export const useDialog = () => { }
export const useTheme = () => { }

// ❌ 错误
export const dict = (...args: string[]) => { }        // 缺少 use 前缀
export const Dict = (...args: string[]) => { }        // 缺少 use 前缀
export const Use_Dict = (...args: string[]) => { }    // 不应使用下划线
```

参考: `plus-ui/src/composables/useDict.ts:80`

---

### 类型命名

#### 接口 (Interface)

**规范:** 大驼峰命名,不使用 `I` 前缀

```typescript
// ✅ 正确
interface AdQuery { }
interface AdBo { }
interface AdVo { }
interface DataResult { }
interface CacheWrapper<T = any> { }
interface UserInfo { }

// ❌ 错误
interface IAdQuery { }               // 项目不使用 I 前缀
interface adQuery { }                // 首字母应大写
interface Ad_Query { }               // 不应使用下划线
interface ad_query { }               // 应使用大驼峰
```

参考: `plus-ui/src/api/business/base/ad/adTypes.ts`

---

#### 类型别名 (Type)

**规范:** 大驼峰命名

```typescript
// ✅ 正确
export type ButtonType = 'primary' | 'success' | 'info'
export type IconName = FontIconName | UnoIconName | string
export type AuthType = 'password' | 'miniapp' | 'mp'
export type ThemeMode = 'light' | 'dark' | 'auto'

// ❌ 错误
export type buttonType = 'primary' | 'success'        // 首字母应大写
export type Button_Type = 'primary' | 'success'       // 不应使用下划线
export type BUTTON_TYPE = 'primary' | 'success'       // 不应全大写
```

参考: `plus-ui/src/composables/useDict.ts:6-37`

---

#### 枚举 (Enum)

**规范:** 大驼峰命名,枚举值使用小写下划线

```typescript
// ✅ 正确
export enum DictTypes {
  sys_audit_status = 'sys_audit_status',
  sys_boolean_flag = 'sys_boolean_flag',
  sys_enable_status = 'sys_enable_status',
  sys_user_gender = 'sys_user_gender'
}

// ❌ 错误
export enum DictTypes {
  SYS_AUDIT_STATUS = 'sys_audit_status',  // 枚举键应小写下划线
  sysAuditStatus = 'sys_audit_status',     // 枚举键应小写下划线
  sys_Audit_Status = 'sys_audit_status',   // 不应混用命名风格
}
```

参考: `plus-ui/src/composables/useDict.ts:6-37`

---

### API 接口命名

**规范:** 小驼峰命名,使用动词前缀

```typescript
// ✅ 正确 - 查询类
export const pageAds = (query?: AdQuery): Result<PageResult<AdVo>> => { }
export const getAd = (id: string | number): Result<AdVo> => { }
export const listAds = (query?: AdQuery): Result<AdVo[]> => { }

// ✅ 正确 - 操作类
export const addAd = (data: AdBo): Result<string | number> => { }
export const updateAd = (data: AdBo): Result<void> => { }
export const deleteAds = (ids: string | number | Array<string | number>): Result<void> => { }

// ❌ 错误
export const PageAds = (query?: AdQuery) => { }          // 首字母不应大写
export const ads_page = (query?: AdQuery) => { }         // 不应使用下划线
export const queryAds = (query?: AdQuery) => { }         // 应使用 page/list/get
```

**常用动词前缀:**
- `page` - 分页查询
- `list` - 列表查询
- `get` - 获取单个
- `add` - 新增
- `update` - 修改
- `delete` - 删除
- `batch` - 批量操作
- `export` - 导出
- `import` - 导入

参考: `plus-ui/src/api/business/base/ad/adApi.ts:8-46`

---

### Store 命名

**规范:** 使用 `use` 前缀 + 名称 + `Store` 后缀

```typescript
// ✅ 正确
export const useDictStore = defineStore('dict', () => { })
export const useUserStore = defineStore('user', () => { })
export const useFeatureStore = defineStore('feature', () => { })

// ❌ 错误
export const dictStore = defineStore('dict', () => { })     // 缺少 use 前缀
export const useDictStorage = defineStore('dict', () => { }) // 应为 Store 不是 Storage
export const useDict = defineStore('dict', () => { })        // 缺少 Store 后缀
```

参考: `plus-ui/src/stores/modules/dict.ts:19`

---

## 移动端 UniApp 命名规范

### 文件命名

#### 页面文件

**规范:** 小驼峰命名

```
✅ 正确
login.vue
phoneLogin.vue
register.vue
smsVerify.vue
auth.vue

❌ 错误
Login.vue                             // 首字母不应大写
phone-login.vue                       // 不应使用连字符
phone_login.vue                       // 不应使用下划线
PhoneLogin.vue                        // 首字母不应大写
```

参考: `plus-uniapp/src/pages/auth/login.vue`

---

#### 组件文件

**规范:** 小驼峰命名,WD UI 组件以 `wd-` 前缀

```
✅ 正确
wd-button.vue
wd-icon.vue
wd-navbar.vue
wd-form.vue
wd-input.vue

❌ 错误
WdButton.vue                          // 首字母不应大写
wd-Button.vue                         // 组件名不应大写
button.vue                            // WD组件应有 wd- 前缀
Wd-Button.vue                         // 前缀和名称都不应大写
```

参考: `plus-uniapp/src/wd/components/wd-button/wd-button.vue`

---

#### API 文件

**规范:** 与前端保持一致,小驼峰命名

```
✅ 正确
homeApi.ts
homeTypes.ts
homeApi.generated.ts
phoneApi.ts
goodsApi.ts

❌ 错误
HomeApi.ts                            // 首字母不应大写
home-api.ts                           // 不应使用连字符
home_api.ts                           // 不应使用下划线
```

参考: `plus-uniapp/src/api/app/home/homeApi.ts`

---

### 组件命名

#### 组件 name 属性

**规范:** 大驼峰命名,以 `Wd` 前缀

```typescript
// ✅ 正确
defineOptions({
  name: 'WdButton',
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared',
  }
})

defineOptions({
  name: 'WdIcon'
})

// ❌ 错误
defineOptions({
  name: 'wd-button'                   // 应使用大驼峰
})
defineOptions({
  name: 'Button'                      // WD组件应有 Wd 前缀
})
defineOptions({
  name: 'wdButton'                    // Wd 应大写
})
```

参考: CLAUDE.md 文档:316-323行

---

### 接口命名

#### Props 接口

**规范:** 以 `Wd{ComponentName}Props` 格式命名

```typescript
// ✅ 正确
interface WdButtonProps {
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
}

interface WdIconProps {
  name?: IconName
  size?: string | number
  color?: string
}

// ❌ 错误
interface ButtonProps { }             // 缺少 Wd 前缀
interface WdButtonProperties { }      // 应为 Props 不是 Properties
interface IWdButtonProps { }          // 不需要 I 前缀
```

参考: CLAUDE.md 文档:325-333行

---

#### Emits 接口

**规范:** 以 `Wd{ComponentName}Emits` 格式命名

```typescript
// ✅ 正确
interface WdButtonEmits {
  click: [event: Event]
}

interface WdIconEmits {
  click: [event: Event]
}

interface WdFormEmits {
  submit: [data: FormData]
  validate: [valid: boolean]
}

// ❌ 错误
interface ButtonEmits { }             // 缺少 Wd 前缀
interface WdButtonEvents { }          // 应为 Emits 不是 Events
interface IWdButtonEmits { }          // 不需要 I 前缀
```

参考: CLAUDE.md 文档:335-342行

---

### 变量和函数命名

**规范:** 与前端 Vue 保持一致

```typescript
// ✅ 正确 - 响应式变量
const isLoading = ref(false)
const loginForm = ref<PasswordLoginBody>({ })
const captcha = ref<CaptchaVo>({ })

// ✅ 正确 - 计算属性
const supportedMethods = computed(() => userStore.getSupportedLoginMethods())

// ✅ 正确 - 方法
const handlePasswordLogin = async () => { }
const handleQuickLogin = async () => { }
const refreshCaptcha = async () => { }

// ❌ 错误
const IsLoading = ref(false)          // 首字母不应大写
const login_form = ref({})            // 不应使用下划线
const HandleLogin = async () => { }   // 首字母不应大写
```

参考: `plus-uniapp/src/pages/auth/login.vue:161-417`

---

## 数据库命名规范

### 表名命名

**规范:** 全小写,多个单词用下划线分隔,使用前缀区分业务模块

```sql
-- ✅ 正确 - 业务基础表(b_前缀)
b_ad                                  -- 广告配置表
b_bind                                -- 账号绑定表
b_payment                             -- 支付配置表
b_platform                            -- 平台配置表

-- ✅ 正确 - 商城表(m_前缀)
m_goods                               -- 商品表
m_goods_sku                           -- 商品SKU表
m_order                               -- 订单表

-- ✅ 正确 - 系统表(sys_前缀)
sys_user                              -- 用户表
sys_menu                              -- 菜单表
sys_role                              -- 角色表

-- ❌ 错误
Ad                                    -- 应全小写
B_AD                                  -- 应全小写
bAd                                   -- 应全小写
b-ad                                  -- 应使用下划线
```

**表名前缀约定:**
- `b_` - Business,业务基础表
- `m_` - Mall,商城相关表
- `sys_` - System,系统表
- `gen_` - Generator,代码生成表
- `qrtz_` - Quartz,定时任务表

参考: `script/sql/ry_plus_app.sql:7-207`

---

### 字段命名

**规范:** 全小写,多个单词用下划线分隔(snake_case)

```sql
-- ✅ 正确 - 主键
id                                    -- 主键ID

-- ✅ 正确 - 基础字段
tenant_id                             -- 租户ID
create_time                           -- 创建时间
create_by                             -- 创建人
update_time                           -- 更新时间
update_by                             -- 更新人
is_deleted                            -- 是否删除
remark                                -- 备注

-- ✅ 正确 - 业务字段
ad_name                               -- 广告名称
ad_type                               -- 广告类型
ad_unit_id                            -- 广告位ID
jump_appid                            -- 跳转APPID
jump_path                             -- 跳转路径
sort_order                            -- 排序值

-- ❌ 错误
adName                                -- 应使用下划线
AdName                                -- 应全小写
ad-name                               -- 应使用下划线
AD_NAME                               -- 不应全大写
```

**字段命名约定:**
- 主键统一命名为 `id`
- 布尔字段使用 `is_` 前缀
- 时间字段使用 `_time` 后缀
- 排序字段使用 `sort_order`
- 状态字段使用 `status`

参考: `script/sql/ry_plus_app.sql:9-31`

---

### 索引命名

**规范:** 使用前缀表示索引类型 + 字段名

```sql
-- ✅ 正确 - 主键索引
primary key (id)

-- ✅ 正确 - 唯一索引(uk_前缀)
unique key uk_order_no (order_no)
unique key uk_sku_code (sku_code)
unique key uk_username (username)

-- ✅ 正确 - 普通索引(idx_前缀)
key idx_category (category)
key idx_user_id (user_id)
key idx_goods_id (goods_id)
key idx_order_status (order_status)
key idx_create_time (create_time)

-- ✅ 正确 - 复合索引
key idx_status_deleted (status, is_deleted)
key idx_user_status (user_id, status)
key idx_type_sort (type, sort_order)

-- ❌ 错误
key order_no (order_no)               -- 缺少前缀
key UK_ORDER_NO (order_no)            -- 不应全大写
key idx-order-no (order_no)           // 应使用下划线
```

**索引前缀约定:**
- `pk_` - Primary Key(通常省略,直接用 primary key)
- `uk_` - Unique Key,唯一索引
- `idx_` - Index,普通索引
- `fk_` - Foreign Key,外键(项目中未使用外键)

参考: `script/sql/ry_plus_app.sql:133-166`

---

### 字段类型规范

**规范:** 根据数据特征选择合适的类型

```sql
-- ✅ 正确 - 整数类型
bigint(20)                            -- ID、用户ID等大数值
int(11)                               -- 库存、数量等
int(4)                                -- 排序值
char(1)                               -- 状态、标志位

-- ✅ 正确 - 字符串类型
varchar(20)                           -- 租户ID、类型等短字符串
varchar(50)                           -- APPID、密钥等中等字符串
varchar(255)                          -- 路径、描述等长字符串
varchar(500)                          -- JSON、扩展数据
text                                  -- 富文本、详细描述

-- ✅ 正确 - 数值类型
decimal(10, 2)                        -- 金额、价格

-- ✅ 正确 - 日期时间类型
datetime                              -- 创建时间、更新时间

-- ❌ 错误
varchar                               -- 应指定长度
int                                   -- 应指定长度
decimal                               -- 应指定精度
```

**字段类型约定:**
- ID 使用 `bigint(20)`
- 状态、标志位使用 `char(1)`
- 排序值使用 `int(4)`
- 数量使用 `int(11)`
- 金额使用 `decimal(10, 2)`
- 时间使用 `datetime`

参考: `script/sql/ry_plus_app.sql:9-200`

---

### 注释规范

**规范:** 所有表和字段都必须有中文注释

```sql
-- ✅ 正确
create table b_ad
(
    id           bigint(20)   not null auto_increment comment '主键id',
    tenant_id    varchar(20)  default '000000' comment '租户id',
    ad_name      varchar(100) not null comment '广告名称',
    create_time  datetime     default current_timestamp comment '创建时间',
    is_deleted   char(1)      default '0' comment '是否删除',
    primary key (id)
) engine = innodb comment = '广告配置表';

-- ❌ 错误
create table b_ad
(
    id           bigint(20)   not null auto_increment,  -- 缺少注释
    tenant_id    varchar(20)  default '000000',         -- 缺少注释
    ad_name      varchar(100) not null comment 'Ad Name', -- 应使用中文
    primary key (id)
) engine = innodb;                                       -- 表缺少注释
```

**注释约定:**
- 所有字段必须有 `comment`
- 表必须有 `comment`
- 注释使用中文
- 注释简洁明了

参考: `script/sql/ry_plus_app.sql:7-31`

---

## 快速参考表

### 后端 Java 命名速查

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Controller | `{Name}Controller` | `HomeController` |
| Service接口 | `I{Name}Service` | `IAdService` |
| Service实现 | `{Name}ServiceImpl` | `AdServiceImpl` |
| Mapper | `{Name}Mapper` | `AdMapper` |
| DAO接口 | `I{Name}Dao` | `IAdDao` |
| Entity | `{Name}` | `Ad` |
| Bo | `{Name}Bo` | `AdBo` |
| Vo | `{Name}Vo` | `AdVo` |
| DTO | `{Name}DTO` | `PlatformDTO` |
| Utils | `{Name}Utils` | `DateUtils` |
| Constants | `{Name}Constants` | `CacheConstants` |

---

### 前端 TypeScript 命名速查

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 组件文件 | `{Name}.vue` | `AAiAssistant.vue` |
| API文件 | `{name}Api.ts` | `adApi.ts` |
| 类型文件 | `{name}Types.ts` | `adTypes.ts` |
| 工具文件 | `{name}.ts` | `cache.ts` |
| Composables | `use{Name}.ts` | `useDict.ts` |
| Store | `use{Name}Store` | `useDictStore` |
| 接口 | `{Name}` | `AdQuery` |
| 类型别名 | `{Name}` | `ButtonType` |
| 枚举 | `{Name}` | `DictTypes` |
| API函数 | `{action}{Name}` | `pageAds, getAd` |

---

### 移动端 UniApp 命名速查

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 页面文件 | `{name}.vue` | `login.vue` |
| 组件文件 | `wd-{name}.vue` | `wd-button.vue` |
| 组件name | `Wd{Name}` | `WdButton` |
| Props接口 | `Wd{Name}Props` | `WdButtonProps` |
| Emits接口 | `Wd{Name}Emits` | `WdButtonEmits` |
| API文件 | `{name}Api.ts` | `homeApi.ts` |
| Store | `use{Name}Store` | `useUserStore` |

---

### 数据库命名速查

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 表名 | `{prefix}_{name}` | `b_ad, m_goods` |
| 字段名 | `{name}_{suffix}` | `create_time` |
| 主键 | `id` | `id` |
| 唯一索引 | `uk_{field}` | `uk_order_no` |
| 普通索引 | `idx_{field}` | `idx_user_id` |
| 复合索引 | `idx_{field1}_{field2}` | `idx_status_deleted` |

---

## 特殊说明

### 跨模块一致性

**原则:** 前后端、移动端对应的实体名称保持一致

**示例:**
```
后端 Entity:  Ad
后端 Bo:      AdBo
后端 Vo:      AdVo
前端 Query:   AdQuery
前端 Bo:      AdBo
前端 Vo:      AdVo
移动端 Vo:    AdVo
数据库表:     b_ad
```

---

### 缩写使用规范

**常用缩写:**
- `id` - Identifier
- `appid` - Application ID
- `img` - Image
- `desc` - Description
- `config` - Configuration
- `info` - Information
- `param` - Parameter
- `temp` - Temporary
- `max` - Maximum
- `min` - Minimum

**注意事项:**
- 优先使用完整单词
- 使用业界通用的缩写
- 团队内部保持缩写一致

---

### 布尔类型命名

**前端/移动端:**
```typescript
const isLoading = ref(false)          // ✅
const hasPermission = ref(true)       // ✅
const canEdit = computed(() => {})    // ✅
const shouldRender = ref(false)       // ✅
```

**后端:**
```java
private boolean isDeleted;            // ✅
private boolean hasAuth;              // ✅
private boolean canOperate;           // ✅
```

**数据库:**
```sql
is_deleted  char(1)                   -- ✅
is_enabled  char(1)                   -- ✅
```

---

## 最佳实践

### 1. 保持一致性

在整个项目中保持命名风格的一致性,不要混用不同的命名方式。

### 2. 见名知义

命名应该清晰表达其含义和用途,避免使用单字母或无意义的名称。

### 3. 避免过度缩写

除非是业界通用的缩写,否则应使用完整单词。

### 4. 遵循约定

优先使用框架和团队约定的命名规范,而不是自创命名方式。

### 5. 跨模块统一

前后端、移动端对应的实体名称应保持一致,便于理解和维护。

---

## 常见问题

### Q1: Service接口一定要用 I 前缀吗?

**A:** 是的,项目后端统一使用 `I` 前缀区分接口和实现类。这是项目的编码规范,必须遵守。

---

### Q2: 前端组件文件名用大驼峰还是小驼峰?

**A:** 前端 Vue 组件使用大驼峰命名(如 `AAiAssistant.vue`),移动端页面使用小驼峰命名(如 `login.vue`),移动端组件使用 kebab-case(如 `wd-button.vue`)。

---

### Q3: API函数应该用什么动词?

**A:**
- 查询操作: `page`(分页)、`list`(列表)、`get`(单个)
- 修改操作: `add`(新增)、`update`(修改)、`delete`(删除)
- 避免使用: `query`、`select`、`insert`、`remove` 等

---

### Q4: 数据库表名前缀如何选择?

**A:**
- `b_` - 业务基础表
- `m_` - 商城相关表
- `sys_` - 系统表
- 根据业务模块选择合适的前缀

---

### Q5: 常量命名一定要全大写吗?

**A:** 是的,Java、TypeScript 中的常量都应使用全大写加下划线的命名方式(SCREAMING_SNAKE_CASE)。

---

## 参考资源

- [代码规范](/practices/standards/coding) - 详细的代码编写规范
- [API设计规范](/practices/standards/api-design) - RESTful API设计规范
- CLAUDE.md - 项目 AI 协作规范文档

---

*本文档基于 RuoYi-Plus-UniApp 实际源码提取,最后更新: 2025-11-01*
