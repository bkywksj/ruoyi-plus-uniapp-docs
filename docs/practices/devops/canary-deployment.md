# 灰度发布最佳实践

> **文档状态**: ✅ 已完成
> **适用版本**: RuoYi-Plus-UniApp 5.4.1+
> **技术栈**: Docker Compose + Nginx + Spring Boot Admin + Redis
> **更新时间**: 2025-11-24

## 介绍

灰度发布(Canary Deployment)是一种渐进式的发布策略,通过将新版本逐步发布到生产环境的一小部分用户,观察系统的稳定性和性能指标,确认无问题后再全量发布。这种策略可以有效降低新版本发布的风险,及时发现和修复问题。

本文档详细介绍在 RuoYi-Plus-UniApp 项目中实施灰度发布的最佳实践,基于项目现有的多实例部署架构和 Nginx 负载均衡,提供多种灰度发布方案。

**灰度发布的核心优势:**

- **降低风险** - 新版本先在小范围用户中验证,避免影响全部用户
- **快速回滚** - 发现问题可以立即切回稳定版本,影响面可控
- **数据驱动** - 通过监控指标对比新旧版本的性能和稳定性
- **用户体验** - 重要用户可以优先体验新功能,获得更好的服务
- **平滑过渡** - 逐步增加灰度流量比例,实现平滑的版本切换

## 项目架构分析

### 当前部署架构

RuoYi-Plus-UniApp 项目采用 Docker Compose 多实例部署 + Nginx 负载均衡的架构:

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户请求                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │   Nginx 负载均衡器     │
          │  (IP Hash 策略)       │
          └───────────┬───────────┘
                      │
         ┌────────────┼────────────┐
         │                         │
         ▼                         ▼
┌────────────────┐      ┌────────────────┐
│  实例1 (5500)  │      │  实例2 (5501)  │
│  稳定版本      │      │  灰度版本      │
└────────┬───────┘      └────────┬───────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼────────────┐
         │  共享资源 (Redis/MySQL) │
         └────────────────────────┘
```

**架构特点:**

1. **多实例部署** - Docker Compose 支持运行多个应用实例,每个实例使用不同端口
2. **负载均衡** - Nginx 使用 `ip_hash` 算法进行流量分配,确保会话一致性
3. **共享中间件** - 所有实例共享 Redis、MySQL、MinIO 等中间件
4. **独立日志** - 每个实例有独立的日志目录,便于问题排查
5. **统一监控** - Spring Boot Admin 监控所有实例的健康状态

### 多实例配置

项目的 Docker Compose 配置支持多实例部署:

**文件位置**: `script/docker/compose/Complete-compose.yml`

```yaml
services:
  # 实例1: 稳定版本
  ryplus_uni_workflow:
    image: ryplus_uni_workflow:5.4.1
    container_name: ryplus_uni_workflow
    build:
      context: ../../../ruoyi-admin
      dockerfile: Dockerfile
    environment:
      SERVER_PORT: 5500          # 实例1端口
      SNAIL_PORT: 25500
      DEBUG_PORT: 5005
      JAVA_OPTS: "-Xms512m -Xmx1024m"
      TZ: Asia/Shanghai
    ports:
      - "5500:5500"             # 应用端口
      - "25500:25500"           # SnailJob端口
      - "5005:5005"             # 调试端口
    volumes:
      - /home/ubuntu/apps/ryplus_uni_workflow/logs/:/ruoyi/server/logs/
      - /home/ubuntu/apps/ryplus_uni_workflow/upload/:/ruoyi/server/upload/
    networks:
      - ruoyi-net
    depends_on:
      - ryplus-mysql
      - ryplus-redis
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5500/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # 实例2: 灰度版本
  ryplus_uni_workflow2:
    image: ryplus_uni_workflow:5.4.2  # 新版本镜像
    container_name: ryplus_uni_workflow2
    build:
      context: ../../../ruoyi-admin
      dockerfile: Dockerfile
    environment:
      SERVER_PORT: 5501          # 实例2端口
      SNAIL_PORT: 25501
      DEBUG_PORT: 5006
      JAVA_OPTS: "-Xms512m -Xmx1024m"
      TZ: Asia/Shanghai
      VERSION: canary            # 标识灰度版本
    ports:
      - "5501:5501"
      - "25501:25501"
      - "5006:5006"
    volumes:
      - /home/ubuntu/apps/ryplus_uni_workflow2/logs/:/ruoyi/server/logs/
      - /home/ubuntu/apps/ryplus_uni_workflow2/upload/:/ruoyi/server/upload/
    networks:
      - ruoyi-net
    depends_on:
      - ryplus-mysql
      - ryplus-redis
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5501/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  ruoyi-net:
    driver: bridge
```

**配置要点:**

- **不同端口** - 每个实例使用不同的端口号,避免端口冲突
- **版本标识** - 通过环境变量 `VERSION` 标识灰度版本
- **独立日志** - 每个实例有独立的日志目录
- **健康检查** - 配置 healthcheck 确保实例正常运行
- **共享存储** - upload 目录需要共享或使用 OSS

### Nginx 负载均衡配置

**文件位置**: `script/docker/nginx/conf/nginx.conf`

```nginx
# 定义后端服务器组
upstream server {
    ip_hash;                    # 使用 IP hash 保持会话一致性
    server 127.0.0.1:5500 weight=9;      # 稳定版本 90% 流量
    server 127.0.0.1:5501 weight=1;      # 灰度版本 10% 流量
}

# 监控中心路由
upstream monitor {
    server 127.0.0.1:9090;
}

# 定时任务路由
upstream snailjob {
    server 127.0.0.1:8800;
}

server {
    listen 80;
    server_name _;

    # 主应用路由
    location /ryplus_uni_workflow/ {
        # 请求头设置
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header REMOTE-HOST $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 86400s;

        # SSE 与 WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
        proxy_cache off;

        # 反向代理
        proxy_pass http://server/;
    }

    # 监控中心路由
    location /admin/ {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://monitor/admin/;
    }

    # 定时任务路由
    location /snail-job/ {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://snailjob/snail-job/;
    }

    # 限制外网访问内网 actuator 相关路径
    location ~ ^(/[^/]*)?/actuator.*(/.*)?$ {
        return 403;
    }
}
```

**负载均衡策略说明:**

1. **ip_hash** - 根据客户端 IP 进行 hash,确保同一用户的请求路由到同一后端实例
2. **weight** - 权重配置,用于控制流量分配比例
3. **长连接支持** - 配置 WebSocket 和 SSE 所需的代理设置
4. **安全限制** - 禁止外网访问 actuator 监控端点

## 灰度发布方案

### 方案一: 基于 Nginx 权重的流量分配

**适用场景**: 简单的流量百分比控制,不需要精确的用户分组

#### 实现步骤

**1. 修改 Nginx 配置**

```nginx
# 初始阶段: 10% 灰度流量
upstream server {
    ip_hash;
    server 127.0.0.1:5500 weight=9;   # 稳定版本 90%
    server 127.0.0.1:5501 weight=1;   # 灰度版本 10%
}

# 灰度验证通过后: 50% 灰度流量
upstream server {
    ip_hash;
    server 127.0.0.1:5500 weight=1;   # 稳定版本 50%
    server 127.0.0.1:5501 weight=1;   # 灰度版本 50%
}

# 全量发布: 100% 新版本
upstream server {
    server 127.0.0.1:5501;            # 只路由到新版本
    # server 127.0.0.1:5500;         # 旧版本下线
}
```

**2. 重载 Nginx 配置**

```bash
# 检查配置语法
nginx -t

# 平滑重载配置(不中断现有连接)
nginx -s reload
```

**3. 监控灰度版本指标**

访问 Spring Boot Admin 监控页面,对比两个实例的指标:

```
http://localhost:9090/admin
```

重点关注指标:
- **响应时间** - P50、P95、P99 响应时间
- **错误率** - HTTP 5xx 错误率
- **CPU/内存** - 资源使用率
- **线程数** - 活跃线程数和阻塞线程数
- **GC 频率** - Full GC 次数和耗时

**4. 灰度发布流程**

```bash
# 阶段1: 10% 流量灰度 (持续 2 小时)
weight=9:1 → 观察监控指标 → 无异常继续

# 阶段2: 30% 流量灰度 (持续 4 小时)
weight=7:3 → 观察监控指标 → 无异常继续

# 阶段3: 50% 流量灰度 (持续 12 小时)
weight=1:1 → 观察监控指标 → 无异常继续

# 阶段4: 100% 全量发布
只保留新版本 → 下线旧版本 → 发布完成
```

**优势:**
- 实现简单,只需修改 Nginx 配置
- 无需修改应用代码
- 支持动态调整流量比例

**劣势:**
- 无法精确控制灰度用户
- 依赖 IP hash,同一 IP 用户始终访问同一版本

### 方案二: 基于请求头的精确灰度

**适用场景**: 需要精确控制灰度用户,如内部测试、VIP 用户、特定地域用户

#### 实现步骤

**1. 修改 Nginx 配置**

```nginx
upstream server_stable {
    server 127.0.0.1:5500;  # 稳定版本
}

upstream server_canary {
    server 127.0.0.1:5501;  # 灰度版本
}

# 定义灰度用户映射表
map $http_x_user_id $backend {
    default "stable";
    ~^(100|101|102|103|104)$ "canary";  # 用户ID 100-104 走灰度
}

# 定义灰度地域映射表
map $remote_addr $region_canary {
    default 0;
    ~^192\.168\.1\.       1;  # 内网 IP 走灰度
    ~^10\.0\.             1;  # 内网 IP 走灰度
}

server {
    listen 80;
    server_name _;

    location /ryplus_uni_workflow/ {
        # 设置默认后端
        set $target "stable";

        # 优先级1: 基于 Cookie 的灰度
        if ($cookie_version = "canary") {
            set $target "canary";
        }

        # 优先级2: 基于 Header 的灰度
        if ($http_x_canary_version = "true") {
            set $target "canary";
        }

        # 优先级3: 基于用户ID的灰度
        if ($backend = "canary") {
            set $target "canary";
        }

        # 优先级4: 基于地域的灰度
        if ($region_canary = 1) {
            set $target "canary";
        }

        # 优先级5: 基于随机数的灰度 (10%)
        if ($random ~ "^[0]$") {
            set $target "canary";
        }

        # 路由到目标后端
        proxy_pass http://server_$target/;

        # 添加版本标识响应头(便于调试)
        add_header X-Backend-Version $target;

        # 其他代理配置
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
    }
}
```

**2. 客户端发送灰度标识**

前端/移动端可以通过以下方式标识灰度用户:

**Cookie 方式:**

```javascript
// 前端设置灰度 Cookie
document.cookie = "version=canary; path=/; max-age=86400";

// 移动端 UniApp 设置 Cookie
uni.request({
  url: 'https://api.example.com/login',
  header: {
    'Cookie': 'version=canary'
  }
})
```

**Header 方式:**

```javascript
// 前端请求时携带灰度 Header
axios.defaults.headers.common['X-Canary-Version'] = 'true';

// 移动端 UniApp 请求
uni.request({
  url: 'https://api.example.com/api/user',
  header: {
    'X-Canary-Version': 'true'
  }
})
```

**URL 参数方式:**

```javascript
// 在 URL 中携带灰度参数
https://api.example.com/api/user?canary=true
```

**3. 灰度用户管理**

创建灰度用户白名单文件:

```nginx
# /etc/nginx/canary_users.map
map $http_x_user_id $is_canary_user {
    default 0;
    include /etc/nginx/conf.d/canary_whitelist.conf;
}

# /etc/nginx/conf.d/canary_whitelist.conf
100 1;
101 1;
102 1;
103 1;
104 1;
# ... 更多用户ID
```

更新白名单后重载配置:

```bash
nginx -s reload
```

**4. 动态灰度比例控制**

使用 Lua 脚本实现动态灰度比例:

```nginx
location /ryplus_uni_workflow/ {
    set $canary_ratio 10;  # 灰度比例 10%

    access_by_lua_block {
        local canary_ratio = tonumber(ngx.var.canary_ratio)
        local random_num = math.random(100)

        if random_num <= canary_ratio then
            ngx.var.target = "canary"
        else
            ngx.var.target = "stable"
        end
    }

    proxy_pass http://server_$target/;
}
```

**优势:**
- 精确控制灰度用户
- 支持多种灰度策略组合
- 可以实现分地域、分用户组灰度

**劣势:**
- 配置复杂,需要 Nginx 高级特性
- 需要前端/客户端配合
- 需要维护用户白名单

### 方案三: 基于应用层的灰度控制

**适用场景**: 需要与业务逻辑深度集成的灰度控制,如基于用户等级、订单状态等

#### 实现步骤

**1. 创建灰度路由拦截器**

```java
package plus.ruoyi.common.web.interceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 灰度发布拦截器
 *
 * 功能:
 * 1. 判断用户是否为灰度用户
 * 2. 设置灰度版本标识
 * 3. 记录灰度流量日志
 */
@Slf4j
@Component
public class CanaryReleaseInterceptor implements HandlerInterceptor {

    private static final String CANARY_HEADER = "X-Canary-Version";
    private static final String CANARY_COOKIE = "version";
    private static final String VERSION_ATTRIBUTE = "canary.version";

    @Override
    public boolean preHandle(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler) {
        String version = determineVersion(request);
        request.setAttribute(VERSION_ATTRIBUTE, version);

        // 添加响应头,便于客户端识别
        response.setHeader("X-Backend-Version", version);

        // 记录灰度流量日志
        if ("canary".equals(version)) {
            log.info("灰度流量: userId={}, ip={}, uri={}",
                getCurrentUserId(request),
                getClientIp(request),
                request.getRequestURI()
            );
        }

        return true;
    }

    /**
     * 判断目标版本
     */
    private String determineVersion(HttpServletRequest request) {
        // 1. 检查 Header
        String headerVersion = request.getHeader(CANARY_HEADER);
        if ("true".equals(headerVersion)) {
            return "canary";
        }

        // 2. 检查 Cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (CANARY_COOKIE.equals(cookie.getName())
                    && "canary".equals(cookie.getValue())) {
                    return "canary";
                }
            }
        }

        // 3. 检查 URL 参数
        String urlVersion = request.getParameter("version");
        if ("canary".equals(urlVersion)) {
            return "canary";
        }

        // 4. 基于用户ID的灰度
        Long userId = getCurrentUserId(request);
        if (userId != null && isCanaryUser(userId)) {
            return "canary";
        }

        // 5. 基于用户等级的灰度
        if (isVipUser(request)) {
            return "canary";
        }

        // 6. 基于地域的灰度
        String clientIp = getClientIp(request);
        if (isInternalIp(clientIp)) {
            return "canary";
        }

        // 7. 基于随机数的灰度 (10%)
        if (Math.random() < 0.1) {
            return "canary";
        }

        return "stable";
    }

    /**
     * 判断是否为灰度用户
     */
    private boolean isCanaryUser(Long userId) {
        // 从 Redis 或数据库读取灰度用户名单
        // 示例: 用户ID尾号为0的用户走灰度
        return userId % 10 == 0;
    }

    /**
     * 判断是否为 VIP 用户
     */
    private boolean isVipUser(HttpServletRequest request) {
        // 从 Session 或 Token 中获取用户信息
        // 判断用户等级
        return false;  // 示例返回
    }

    /**
     * 判断是否为内网 IP
     */
    private boolean isInternalIp(String ip) {
        return ip.startsWith("192.168.")
            || ip.startsWith("10.")
            || ip.equals("127.0.0.1");
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        // 从 Token 或 Session 中获取用户ID
        // 示例实现
        Object userId = request.getAttribute("userId");
        return userId != null ? (Long) userId : null;
    }

    /**
     * 获取客户端真实IP
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Forwarded-For");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
```

**2. 注册拦截器**

```java
package plus.ruoyi.common.web.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import plus.ruoyi.common.web.interceptor.CanaryReleaseInterceptor;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final CanaryReleaseInterceptor canaryReleaseInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(canaryReleaseInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                    "/actuator/**",
                    "/static/**",
                    "/error"
                );
    }
}
```

**3. 创建灰度用户管理服务**

```java
package plus.ruoyi.system.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import plus.ruoyi.common.redis.utils.RedisUtils;

import java.util.Set;

/**
 * 灰度用户管理服务
 */
@Service
@RequiredArgsConstructor
public class CanaryUserService {

    private static final String CANARY_USER_KEY = "canary:users";
    private static final String CANARY_RATIO_KEY = "canary:ratio";

    /**
     * 添加灰度用户
     */
    public void addCanaryUser(Long userId) {
        RedisUtils.setCacheSet(CANARY_USER_KEY, userId);
    }

    /**
     * 移除灰度用户
     */
    public void removeCanaryUser(Long userId) {
        RedisUtils.deleteCacheSetMember(CANARY_USER_KEY, userId);
    }

    /**
     * 判断是否为灰度用户
     */
    public boolean isCanaryUser(Long userId) {
        Set<Long> canaryUsers = RedisUtils.getCacheSet(CANARY_USER_KEY);
        return canaryUsers.contains(userId);
    }

    /**
     * 获取所有灰度用户
     */
    public Set<Long> getAllCanaryUsers() {
        return RedisUtils.getCacheSet(CANARY_USER_KEY);
    }

    /**
     * 设置灰度流量比例
     */
    public void setCanaryRatio(int ratio) {
        if (ratio < 0 || ratio > 100) {
            throw new IllegalArgumentException("灰度比例必须在0-100之间");
        }
        RedisUtils.setCacheObject(CANARY_RATIO_KEY, ratio);
    }

    /**
     * 获取灰度流量比例
     */
    public int getCanaryRatio() {
        Integer ratio = RedisUtils.getCacheObject(CANARY_RATIO_KEY);
        return ratio != null ? ratio : 0;
    }

    /**
     * 批量导入灰度用户
     */
    public void batchAddCanaryUsers(Set<Long> userIds) {
        userIds.forEach(this::addCanaryUser);
    }

    /**
     * 清空所有灰度用户
     */
    public void clearCanaryUsers() {
        RedisUtils.deleteObject(CANARY_USER_KEY);
    }
}
```

**4. 创建灰度管理接口**

```java
package plus.ruoyi.system.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import plus.ruoyi.common.core.domain.R;
import plus.ruoyi.system.service.CanaryUserService;

import java.util.Set;

/**
 * 灰度发布管理接口
 */
@RestController
@RequestMapping("/system/canary")
@RequiredArgsConstructor
public class CanaryController {

    private final CanaryUserService canaryUserService;

    /**
     * 添加灰度用户
     */
    @PostMapping("/user/{userId}")
    public R<Void> addCanaryUser(@PathVariable Long userId) {
        canaryUserService.addCanaryUser(userId);
        return R.ok();
    }

    /**
     * 移除灰度用户
     */
    @DeleteMapping("/user/{userId}")
    public R<Void> removeCanaryUser(@PathVariable Long userId) {
        canaryUserService.removeCanaryUser(userId);
        return R.ok();
    }

    /**
     * 获取所有灰度用户
     */
    @GetMapping("/users")
    public R<Set<Long>> getAllCanaryUsers() {
        return R.ok(canaryUserService.getAllCanaryUsers());
    }

    /**
     * 批量添加灰度用户
     */
    @PostMapping("/users/batch")
    public R<Void> batchAddCanaryUsers(@RequestBody Set<Long> userIds) {
        canaryUserService.batchAddCanaryUsers(userIds);
        return R.ok();
    }

    /**
     * 设置灰度流量比例
     */
    @PutMapping("/ratio")
    public R<Void> setCanaryRatio(@RequestParam int ratio) {
        canaryUserService.setCanaryRatio(ratio);
        return R.ok();
    }

    /**
     * 获取灰度流量比例
     */
    @GetMapping("/ratio")
    public R<Integer> getCanaryRatio() {
        return R.ok(canaryUserService.getCanaryRatio());
    }

    /**
     * 清空所有灰度用户
     */
    @DeleteMapping("/users")
    public R<Void> clearCanaryUsers() {
        canaryUserService.clearCanaryUsers();
        return R.ok();
    }
}
```

**5. 使用示例**

```bash
# 添加灰度用户
curl -X POST http://localhost:5500/system/canary/user/100

# 批量添加灰度用户
curl -X POST http://localhost:5500/system/canary/users/batch \
  -H "Content-Type: application/json" \
  -d '[100, 101, 102, 103, 104]'

# 设置灰度流量比例为 20%
curl -X PUT http://localhost:5500/system/canary/ratio?ratio=20

# 获取所有灰度用户
curl http://localhost:5500/system/canary/users

# 移除灰度用户
curl -X DELETE http://localhost:5500/system/canary/user/100

# 清空所有灰度用户
curl -X DELETE http://localhost:5500/system/canary/users
```

**优势:**
- 与业务逻辑深度集成
- 支持复杂的灰度策略
- 实时动态调整灰度用户
- 支持灰度流量监控和日志

**劣势:**
- 需要修改应用代码
- 增加应用复杂度
- 需要维护灰度用户数据

### 方案四: 基于特性开关的灰度

**适用场景**: 新功能需要分阶段开放,或需要快速开关某些功能

#### 实现步骤

**1. 创建特性开关服务**

```java
package plus.ruoyi.common.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import plus.ruoyi.common.redis.utils.RedisUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * 特性开关(Feature Toggle)服务
 *
 * 功能:
 * 1. 动态开启/关闭功能特性
 * 2. 支持按用户/用户组/百分比启用特性
 * 3. 支持特性依赖关系管理
 */
@Service
@RequiredArgsConstructor
public class FeatureToggleService {

    private static final String FEATURE_PREFIX = "feature:";
    private static final String FEATURE_USER_PREFIX = "feature:user:";

    /**
     * 判断特性是否启用(全局)
     */
    public boolean isFeatureEnabled(String featureName) {
        Boolean enabled = RedisUtils.getCacheObject(FEATURE_PREFIX + featureName);
        return enabled != null && enabled;
    }

    /**
     * 判断特性是否对用户启用
     */
    public boolean isFeatureEnabledForUser(String featureName, Long userId) {
        // 1. 检查全局开关
        if (!isFeatureEnabled(featureName)) {
            return false;
        }

        // 2. 检查用户白名单
        String userKey = FEATURE_USER_PREFIX + featureName;
        Set<Long> enabledUsers = RedisUtils.getCacheSet(userKey);
        if (enabledUsers != null && enabledUsers.contains(userId)) {
            return true;
        }

        // 3. 检查灰度比例
        Integer ratio = getFeatureRatio(featureName);
        if (ratio != null && ratio > 0) {
            // 基于用户ID的稳定hash
            return (userId % 100) < ratio;
        }

        return false;
    }

    /**
     * 启用特性
     */
    public void enableFeature(String featureName) {
        RedisUtils.setCacheObject(FEATURE_PREFIX + featureName, true);
    }

    /**
     * 禁用特性
     */
    public void disableFeature(String featureName) {
        RedisUtils.setCacheObject(FEATURE_PREFIX + featureName, false);
    }

    /**
     * 为用户启用特性
     */
    public void enableFeatureForUser(String featureName, Long userId) {
        String userKey = FEATURE_USER_PREFIX + featureName;
        RedisUtils.setCacheSet(userKey, userId);
    }

    /**
     * 为用户禁用特性
     */
    public void disableFeatureForUser(String featureName, Long userId) {
        String userKey = FEATURE_USER_PREFIX + featureName;
        RedisUtils.deleteCacheSetMember(userKey, userId);
    }

    /**
     * 设置特性灰度比例
     */
    public void setFeatureRatio(String featureName, int ratio) {
        if (ratio < 0 || ratio > 100) {
            throw new IllegalArgumentException("灰度比例必须在0-100之间");
        }
        String ratioKey = FEATURE_PREFIX + featureName + ":ratio";
        RedisUtils.setCacheObject(ratioKey, ratio);
    }

    /**
     * 获取特性灰度比例
     */
    public Integer getFeatureRatio(String featureName) {
        String ratioKey = FEATURE_PREFIX + featureName + ":ratio";
        return RedisUtils.getCacheObject(ratioKey);
    }

    /**
     * 获取所有启用的特性
     */
    public Map<String, Boolean> getAllFeatures() {
        // 实现获取所有特性的逻辑
        Map<String, Boolean> features = new HashMap<>();
        // ...
        return features;
    }
}
```

**2. 创建特性开关注解**

```java
package plus.ruoyi.common.core.annotation;

import java.lang.annotation.*;

/**
 * 特性开关注解
 *
 * 使用示例:
 * @FeatureToggle("new-payment-system")
 * public void processPayment() { ... }
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FeatureToggle {

    /**
     * 特性名称
     */
    String value();

    /**
     * 特性未启用时的提示消息
     */
    String message() default "该功能暂未开放";

    /**
     * 是否检查用户级别启用
     */
    boolean checkUser() default false;
}
```

**3. 创建特性开关切面**

```java
package plus.ruoyi.common.core.aspectj;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import plus.ruoyi.common.core.annotation.FeatureToggle;
import plus.ruoyi.common.core.exception.ServiceException;
import plus.ruoyi.common.core.service.FeatureToggleService;
import plus.ruoyi.common.satoken.utils.LoginHelper;

/**
 * 特性开关切面处理
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class FeatureToggleAspect {

    private final FeatureToggleService featureToggleService;

    @Around("@annotation(featureToggle)")
    public Object around(ProceedingJoinPoint point, FeatureToggle featureToggle)
            throws Throwable {
        String featureName = featureToggle.value();

        // 检查特性是否启用
        boolean enabled;
        if (featureToggle.checkUser()) {
            // 检查用户级别启用
            Long userId = LoginHelper.getUserId();
            enabled = featureToggleService.isFeatureEnabledForUser(featureName, userId);
        } else {
            // 检查全局启用
            enabled = featureToggleService.isFeatureEnabled(featureName);
        }

        if (!enabled) {
            log.warn("特性未启用: feature={}, user={}",
                featureName, LoginHelper.getUserId());
            throw new ServiceException(featureToggle.message());
        }

        // 特性已启用,执行方法
        return point.proceed();
    }
}
```

**4. 使用示例**

```java
@Service
public class PaymentService {

    /**
     * 新支付系统(灰度中)
     */
    @FeatureToggle(value = "new-payment-system", checkUser = true)
    public void processPaymentV2(PaymentRequest request) {
        // 新版支付逻辑
        log.info("使用新支付系统处理: {}", request);
    }

    /**
     * 旧支付系统(稳定版)
     */
    public void processPaymentV1(PaymentRequest request) {
        // 旧版支付逻辑
        log.info("使用旧支付系统处理: {}", request);
    }

    /**
     * 支付入口(自动选择版本)
     */
    public void processPayment(PaymentRequest request) {
        Long userId = LoginHelper.getUserId();

        // 根据特性开关选择支付系统版本
        if (featureToggleService.isFeatureEnabledForUser("new-payment-system", userId)) {
            processPaymentV2(request);
        } else {
            processPaymentV1(request);
        }
    }
}
```

**5. 管理接口**

```java
@RestController
@RequestMapping("/system/feature")
@RequiredArgsConstructor
public class FeatureToggleController {

    private final FeatureToggleService featureToggleService;

    /**
     * 启用特性
     */
    @PostMapping("/{featureName}/enable")
    public R<Void> enableFeature(@PathVariable String featureName) {
        featureToggleService.enableFeature(featureName);
        return R.ok();
    }

    /**
     * 禁用特性
     */
    @PostMapping("/{featureName}/disable")
    public R<Void> disableFeature(@PathVariable String featureName) {
        featureToggleService.disableFeature(featureName);
        return R.ok();
    }

    /**
     * 为用户启用特性
     */
    @PostMapping("/{featureName}/user/{userId}")
    public R<Void> enableFeatureForUser(@PathVariable String featureName,
                                        @PathVariable Long userId) {
        featureToggleService.enableFeatureForUser(featureName, userId);
        return R.ok();
    }

    /**
     * 设置特性灰度比例
     */
    @PutMapping("/{featureName}/ratio")
    public R<Void> setFeatureRatio(@PathVariable String featureName,
                                   @RequestParam int ratio) {
        featureToggleService.setFeatureRatio(featureName, ratio);
        return R.ok();
    }

    /**
     * 获取所有特性状态
     */
    @GetMapping("/all")
    public R<Map<String, Boolean>> getAllFeatures() {
        return R.ok(featureToggleService.getAllFeatures());
    }
}
```

**6. 灰度发布流程**

```bash
# 第1步: 启用新特性(仅白名单用户)
curl -X POST http://localhost:5500/system/feature/new-payment-system/enable
curl -X POST http://localhost:5500/system/feature/new-payment-system/user/100
curl -X POST http://localhost:5500/system/feature/new-payment-system/user/101

# 第2步: 扩大到 10% 用户
curl -X PUT http://localhost:5500/system/feature/new-payment-system/ratio?ratio=10

# 第3步: 扩大到 50% 用户
curl -X PUT http://localhost:5500/system/feature/new-payment-system/ratio?ratio=50

# 第4步: 全量发布
curl -X PUT http://localhost:5500/system/feature/new-payment-system/ratio?ratio=100

# 回滚: 禁用新特性
curl -X POST http://localhost:5500/system/feature/new-payment-system/disable
```

**优势:**
- 细粒度的功能控制
- 支持实时开关功能
- 无需重启应用
- 可以快速回滚

**劣势:**
- 需要在代码中埋点
- 增加代码分支复杂度
- 需要及时清理废弃特性开关

## 监控和告警

### Spring Boot Admin 监控

项目集成了 Spring Boot Admin 进行应用监控。

**文件位置**: `ruoyi-extend/ruoyi-monitor-admin/src/main/resources/application.yml`

**监控中心配置:**

```yaml
# Spring Boot Admin 服务端
spring:
  application:
    name: ruoyi-monitor-admin
  boot:
    admin:
      ui:
        title: Spring Boot Admin服务监控中心
      context-path: /admin

server:
  port: 9090

management:
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: ALWAYS
    logfile:
      external-file: ./logs/sys-console.log
```

**应用端配置:**

```yaml
# Spring Boot Admin 客户端
spring.boot.admin.client:
  enabled: ${MONITOR_ENABLED:true}
  url: ${MONITOR_URL:http://127.0.0.1:9090/admin}
  instance:
    service-host-type: IP
    name: ${app.title}
```

### 关键监控指标

**1. 应用健康状态**

访问监控页面查看实例状态:

```
http://localhost:9090/admin
```

监控指标:
- **UP** - 应用正常运行
- **DOWN** - 应用宕机
- **OFFLINE** - 应用离线
- **UNKNOWN** - 状态未知

**2. 性能指标对比**

在灰度发布过程中,需要对比新旧版本的性能指标:

| 指标类别 | 监控指标 | 正常范围 | 告警阈值 |
|---------|---------|---------|---------|
| 响应时间 | P50 响应时间 | < 100ms | > 200ms |
| 响应时间 | P95 响应时间 | < 500ms | > 1000ms |
| 响应时间 | P99 响应时间 | < 1000ms | > 2000ms |
| 错误率 | HTTP 5xx 错误率 | < 0.1% | > 1% |
| 吞吐量 | QPS | 稳定 | 下降 > 20% |
| 资源使用 | CPU 使用率 | < 70% | > 85% |
| 资源使用 | 内存使用率 | < 80% | > 90% |
| 资源使用 | 堆内存使用率 | < 75% | > 85% |
| GC | Full GC 频率 | < 1次/小时 | > 5次/小时 |
| GC | Full GC 耗时 | < 1s | > 5s |
| 线程 | 活跃线程数 | < 200 | > 500 |
| 线程 | 阻塞线程数 | 0 | > 10 |
| 数据库 | 慢查询数量 | < 10/分钟 | > 50/分钟 |
| 数据库 | 连接池使用率 | < 80% | > 90% |
| Redis | 连接数 | < 50 | > 80 |
| Redis | 命令执行时间 | < 10ms | > 100ms |

**3. 业务指标对比**

除了技术指标,还需要关注业务指标:

| 业务指标 | 说明 | 监控方式 |
|---------|------|---------|
| 订单成功率 | 订单支付成功比例 | 业务日志统计 |
| 用户活跃度 | DAU/MAU | 业务日志统计 |
| API 调用量 | 核心 API 调用次数 | 日志统计 |
| 转化率 | 注册/下单转化率 | 业务埋点 |
| 用户投诉 | 用户反馈数量 | 客服系统 |

### 告警配置

**1. 邮件告警**

```yaml
notify:
  mail:
    enabled: ${NOTIFY_MAIL_ENABLED:true}
    to: ${NOTIFY_MAIL_TO:admin@example.com,ops@example.com}
    cc: ${NOTIFY_MAIL_CC:}
    from: ${NOTIFY_MAIL_FROM:monitor@example.com}
    subject: "【告警】Spring Boot Admin 监控通知"
```

**2. 钉钉/企业微信告警**

```yaml
notify:
  web-hook:
    enabled: ${NOTIFY_WEBHOOK_ENABLED:true}
    type: 1  # 1=钉钉, 2=企业微信
    url: ${DINGTALK_WEBHOOK_URL:https://oapi.dingtalk.com/robot/send?access_token=xxx}
    at-mobiles: ${DINGTALK_AT_MOBILES:13800138000}
    at-all: false
```

**3. 告警规则配置**

创建告警规则配置文件:

```yaml
# alert-rules.yml
alerts:
  # 应用下线告警
  - name: application-down
    enabled: true
    condition: status == 'DOWN'
    message: "应用实例下线: {{instance}}"
    severity: critical

  # CPU 使用率告警
  - name: high-cpu-usage
    enabled: true
    condition: cpu.usage > 0.85
    duration: 5m
    message: "CPU 使用率过高: {{instance}} - {{cpu.usage}}%"
    severity: warning

  # 内存使用率告警
  - name: high-memory-usage
    enabled: true
    condition: memory.used / memory.max > 0.90
    duration: 5m
    message: "内存使用率过高: {{instance}} - {{memory.usage}}%"
    severity: warning

  # 错误率告警
  - name: high-error-rate
    enabled: true
    condition: http.server.requests.error_rate > 0.01
    duration: 2m
    message: "HTTP 错误率过高: {{instance}} - {{error_rate}}%"
    severity: critical

  # 响应时间告警
  - name: slow-response
    enabled: true
    condition: http.server.requests.p99 > 2000
    duration: 5m
    message: "响应时间过慢: {{instance}} - P99={{p99}}ms"
    severity: warning
```

### 自动回滚机制

**1. 基于监控指标的自动回滚**

创建自动回滚脚本:

```bash
#!/bin/bash
# auto-rollback.sh - 灰度发布自动回滚脚本

# 配置
CANARY_INSTANCE="http://127.0.0.1:5501"
STABLE_INSTANCE="http://127.0.0.1:5500"
HEALTH_ENDPOINT="/actuator/health"
METRICS_ENDPOINT="/actuator/metrics"

# 告警阈值
MAX_ERROR_RATE=0.01      # 最大错误率 1%
MAX_P99_LATENCY=2000     # 最大P99延迟 2000ms
MAX_CPU_USAGE=0.85       # 最大CPU使用率 85%
MAX_MEMORY_USAGE=0.90    # 最大内存使用率 90%

# 检查间隔(秒)
CHECK_INTERVAL=60
# 连续异常次数阈值
FAILURE_THRESHOLD=3

# 全局变量
failure_count=0

# 获取指标
get_metric() {
    local instance=$1
    local metric_name=$2
    curl -s "${instance}${METRICS_ENDPOINT}/${metric_name}" | jq -r '.measurements[0].value'
}

# 检查健康状态
check_health() {
    local instance=$1
    local status=$(curl -s "${instance}${HEALTH_ENDPOINT}" | jq -r '.status')

    if [ "$status" != "UP" ]; then
        echo "[WARN] 实例健康检查失败: ${instance} - status=${status}"
        return 1
    fi
    return 0
}

# 检查错误率
check_error_rate() {
    local instance=$1
    local error_rate=$(get_metric "$instance" "http.server.requests.error_rate")

    if (( $(echo "$error_rate > $MAX_ERROR_RATE" | bc -l) )); then
        echo "[WARN] 错误率过高: ${instance} - error_rate=${error_rate}"
        return 1
    fi
    return 0
}

# 检查响应时间
check_latency() {
    local instance=$1
    local p99=$(get_metric "$instance" "http.server.requests.p99")

    if (( $(echo "$p99 > $MAX_P99_LATENCY" | bc -l) )); then
        echo "[WARN] 响应时间过慢: ${instance} - p99=${p99}ms"
        return 1
    fi
    return 0
}

# 检查CPU使用率
check_cpu() {
    local instance=$1
    local cpu_usage=$(get_metric "$instance" "system.cpu.usage")

    if (( $(echo "$cpu_usage > $MAX_CPU_USAGE" | bc -l) )); then
        echo "[WARN] CPU使用率过高: ${instance} - cpu=${cpu_usage}"
        return 1
    fi
    return 0
}

# 检查内存使用率
check_memory() {
    local instance=$1
    local mem_used=$(get_metric "$instance" "jvm.memory.used")
    local mem_max=$(get_metric "$instance" "jvm.memory.max")
    local mem_usage=$(echo "scale=2; $mem_used / $mem_max" | bc)

    if (( $(echo "$mem_usage > $MAX_MEMORY_USAGE" | bc -l) )); then
        echo "[WARN] 内存使用率过高: ${instance} - memory=${mem_usage}"
        return 1
    fi
    return 0
}

# 执行回滚
execute_rollback() {
    echo "[CRITICAL] 触发自动回滚!"

    # 1. 修改 Nginx 配置,将所有流量切回稳定版本
    sed -i 's/server 127.0.0.1:5501/#server 127.0.0.1:5501/' /etc/nginx/conf.d/default.conf

    # 2. 重载 Nginx
    nginx -s reload

    # 3. 停止灰度实例
    docker stop ryplus_uni_workflow2

    # 4. 发送告警通知
    send_alert "灰度发布自动回滚" "检测到灰度实例异常,已自动回滚到稳定版本"

    echo "[INFO] 回滚完成"
}

# 发送告警
send_alert() {
    local title=$1
    local content=$2

    # 钉钉通知
    curl -X POST "$DINGTALK_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"msgtype\": \"text\",
            \"text\": {
                \"content\": \"【${title}】\n${content}\"
            },
            \"at\": {
                \"atMobiles\": [\"13800138000\"],
                \"isAtAll\": false
            }
        }"

    # 邮件通知
    echo "$content" | mail -s "[$title]" admin@example.com
}

# 主循环
main() {
    echo "[INFO] 开始监控灰度实例: ${CANARY_INSTANCE}"

    while true; do
        echo "[INFO] 执行健康检查..."

        # 执行所有检查
        if ! check_health "$CANARY_INSTANCE" || \
           ! check_error_rate "$CANARY_INSTANCE" || \
           ! check_latency "$CANARY_INSTANCE" || \
           ! check_cpu "$CANARY_INSTANCE" || \
           ! check_memory "$CANARY_INSTANCE"; then

            failure_count=$((failure_count + 1))
            echo "[WARN] 检查失败 ($failure_count/$FAILURE_THRESHOLD)"

            # 连续失败达到阈值,执行回滚
            if [ $failure_count -ge $FAILURE_THRESHOLD ]; then
                execute_rollback
                exit 0
            fi
        else
            # 检查通过,重置失败计数
            failure_count=0
            echo "[INFO] 所有检查通过"
        fi

        sleep $CHECK_INTERVAL
    done
}

# 启动监控
main
```

**2. 使用方式**

```bash
# 后台运行自动回滚监控
nohup ./auto-rollback.sh > /var/log/auto-rollback.log 2>&1 &

# 查看监控日志
tail -f /var/log/auto-rollback.log

# 停止监控
pkill -f auto-rollback.sh
```

## 灰度发布流程

### 完整发布流程

**阶段1: 准备阶段 (1-2小时)**

```bash
# 1. 构建新版本镜像
cd ruoyi-admin
docker build -t ryplus_uni_workflow:5.4.2 .

# 2. 验证镜像
docker run --rm ryplus_uni_workflow:5.4.2 java -version

# 3. 启动灰度实例
docker-compose -f Complete-compose.yml up -d ryplus_uni_workflow2

# 4. 健康检查
curl http://localhost:5501/actuator/health

# 5. 验证功能
# 手动测试核心功能是否正常
```

**阶段2: 小流量灰度 (2-4小时)**

```bash
# 1. 修改 Nginx 配置: 10% 流量灰度
vim /etc/nginx/conf.d/default.conf
# upstream server {
#     server 127.0.0.1:5500 weight=9;
#     server 127.0.0.1:5501 weight=1;
# }

# 2. 重载 Nginx
nginx -s reload

# 3. 启动自动回滚监控
nohup ./auto-rollback.sh > /var/log/auto-rollback.log 2>&1 &

# 4. 观察监控指标
# - 访问 http://localhost:9090/admin
# - 对比新旧版本的性能指标
# - 关注错误日志

# 5. 检查业务指标
# - 订单成功率
# - 用户投诉量
# - API 调用量
```

**阶段3: 中流量灰度 (4-8小时)**

```bash
# 1. 提升灰度流量到 30%
vim /etc/nginx/conf.d/default.conf
# upstream server {
#     server 127.0.0.1:5500 weight=7;
#     server 127.0.0.1:5501 weight=3;
# }

# 2. 重载 Nginx
nginx -s reload

# 3. 持续监控
# - 继续观察监控指标
# - 关注告警通知
# - 分析日志异常
```

**阶段4: 大流量灰度 (8-24小时)**

```bash
# 1. 提升灰度流量到 50%
vim /etc/nginx/conf.d/default.conf
# upstream server {
#     server 127.0.0.1:5500 weight=1;
#     server 127.0.0.1:5501 weight=1;
# }

# 2. 重载 Nginx
nginx -s reload

# 3. 持续监控
# - 重点关注高峰时段表现
# - 对比新旧版本性能差异
# - 收集用户反馈
```

**阶段5: 全量发布 (1-2小时)**

```bash
# 1. 切换所有流量到新版本
vim /etc/nginx/conf.d/default.conf
# upstream server {
#     server 127.0.0.1:5501;
# }

# 2. 重载 Nginx
nginx -s reload

# 3. 观察一段时间(1-2小时)
# - 确认没有异常
# - 业务指标正常

# 4. 停止旧版本实例
docker stop ryplus_uni_workflow

# 5. 更新稳定版本
docker tag ryplus_uni_workflow:5.4.2 ryplus_uni_workflow:5.4.1
docker-compose -f Complete-compose.yml up -d ryplus_uni_workflow

# 6. 停止自动回滚监控
pkill -f auto-rollback.sh

# 7. 清理旧镜像
docker image prune -f
```

### 回滚流程

**紧急回滚 (5分钟内)**

```bash
# 1. 立即切换到稳定版本
vim /etc/nginx/conf.d/default.conf
# upstream server {
#     server 127.0.0.1:5500;
# }

# 2. 重载 Nginx
nginx -s reload

# 3. 停止灰度实例
docker stop ryplus_uni_workflow2

# 4. 发送回滚通知
echo "灰度发布已回滚" | mail -s "[紧急] 灰度回滚" admin@example.com
```

**问题分析和修复**

```bash
# 1. 导出灰度实例日志
docker logs ryplus_uni_workflow2 > /tmp/canary-logs.txt

# 2. 分析错误原因
grep ERROR /tmp/canary-logs.txt
grep Exception /tmp/canary-logs.txt

# 3. 修复问题并重新构建

# 4. 重新开始灰度发布流程
```

## 最佳实践

### 1. 灰度发布前的准备

**代码层面:**

```java
// ✅ 好的做法: 新旧版本兼容
@Service
public class UserService {

    // 新增字段使用默认值,不影响旧版本
    public void updateUser(User user) {
        if (user.getNewField() == null) {
            user.setNewField("default");
        }
        userMapper.update(user);
    }
}

// ❌ 坏的做法: 强制要求新字段
@Service
public class UserService {

    // 缺少新字段会导致空指针异常
    public void updateUser(User user) {
        String value = user.getNewField().toUpperCase();
        user.setNewField(value);
        userMapper.update(user);
    }
}
```

**数据库层面:**

```sql
-- ✅ 好的做法: 新增字段设置默认值
ALTER TABLE sys_user
ADD COLUMN new_field VARCHAR(50) DEFAULT 'default' COMMENT '新字段';

-- ❌ 坏的做法: 新增字段没有默认值
ALTER TABLE sys_user
ADD COLUMN new_field VARCHAR(50) NOT NULL COMMENT '新字段';
```

**配置层面:**

```yaml
# ✅ 好的做法: 使用特性开关
feature:
  new-payment-system:
    enabled: false  # 默认关闭,灰度时打开

# ❌ 坏的做法: 硬编码功能开关
# 代码中直接写死 if (version == 2)
```

### 2. 选择合适的灰度策略

**流量百分比灰度** - 适用场景:

```
✅ 无状态服务
✅ 不涉及数据写入
✅ 不需要精确控制用户
✅ 快速验证性能和稳定性
```

**用户白名单灰度** - 适用场景:

```
✅ 核心功能变更
✅ 需要内部先验证
✅ VIP 用户优先体验
✅ 便于收集反馈
```

**特性开关灰度** - 适用场景:

```
✅ 新功能逐步开放
✅ AB 测试
✅ 需要快速开关功能
✅ 多个功能独立灰度
```

### 3. 设置合理的灰度比例

**保守策略** (推荐用于核心功能):

```
阶段1: 内部测试 (白名单 10-20人) - 持续 2-4 小时
阶段2: 小流量灰度 (5%) - 持续 4-8 小时
阶段3: 中流量灰度 (20%) - 持续 8-12 小时
阶段4: 大流量灰度 (50%) - 持续 12-24 小时
阶段5: 全量发布 (100%)
```

**激进策略** (推荐用于非核心功能):

```
阶段1: 小流量灰度 (10%) - 持续 1-2 小时
阶段2: 大流量灰度 (50%) - 持续 2-4 小时
阶段3: 全量发布 (100%)
```

**紧急修复策略**:

```
阶段1: 内部验证 (白名单) - 持续 30 分钟
阶段2: 小流量灰度 (10%) - 持续 1 小时
阶段3: 全量发布 (100%)
```

### 4. 完善的监控和告警

**必须监控的指标:**

```yaml
# 应用层指标
- 健康状态 (UP/DOWN)
- 响应时间 (P50/P95/P99)
- 错误率 (HTTP 5xx)
- QPS/TPS
- 活跃线程数

# 资源层指标
- CPU 使用率
- 内存使用率
- 堆内存使用率
- Full GC 频率和耗时
- 连接池使用率

# 业务层指标
- 核心 API 调用成功率
- 订单支付成功率
- 用户活跃度
- 关键业务流程耗时
```

**告警规则配置:**

```yaml
# 立即告警 (Critical)
- 应用宕机
- 错误率 > 1%
- P99 响应时间 > 5s
- 内存使用率 > 95%

# 警告告警 (Warning)
- 错误率 > 0.5%
- P99 响应时间 > 2s
- CPU 使用率 > 85%
- 内存使用率 > 90%
- Full GC 频率 > 5次/小时
```

### 5. 快速回滚机制

**自动回滚触发条件:**

```yaml
# 连续3次检查异常,触发自动回滚
auto_rollback:
  enabled: true
  check_interval: 60s
  failure_threshold: 3

  triggers:
    - condition: status == 'DOWN'
      action: rollback
    - condition: error_rate > 0.02
      duration: 5m
      action: rollback
    - condition: p99_latency > 3000
      duration: 10m
      action: rollback
    - condition: cpu_usage > 0.90
      duration: 5m
      action: rollback
```

**手动回滚SOP:**

```bash
# 1. 快速切换 Nginx 配置
nginx -s reload

# 2. 停止灰度实例
docker stop ryplus_uni_workflow2

# 3. 验证流量已切回
curl http://localhost/actuator/health

# 4. 发送回滚通知
send_alert "灰度发布回滚" "已切回稳定版本"

# 5. 保留灰度实例日志
docker logs ryplus_uni_workflow2 > /tmp/rollback-$(date +%Y%m%d-%H%M%S).log
```

### 6. 灰度发布检查清单

**发布前检查:**

- [ ] 新版本已通过所有测试(单元测试、集成测试、E2E测试)
- [ ] 数据库变更已执行且向后兼容
- [ ] 配置文件已更新
- [ ] 灰度策略已制定(流量比例、时间计划)
- [ ] 监控和告警已配置
- [ ] 回滚方案已准备
- [ ] 相关人员已通知(开发、测试、运维、客服)

**发布中检查:**

- [ ] 灰度实例健康检查通过
- [ ] 监控指标无异常
- [ ] 错误日志无增长
- [ ] 业务指标正常
- [ ] 用户无投诉

**发布后检查:**

- [ ] 全量发布成功
- [ ] 旧版本已下线
- [ ] 监控指标稳定
- [ ] 业务指标正常
- [ ] 发布文档已归档

### 7. 避免常见错误

**错误1: 灰度流量过大**

```
❌ 直接 50% 流量灰度,风险太大
✅ 从 5% 开始,逐步增加到 10%、20%、50%
```

**错误2: 监控不足**

```
❌ 只看应用是否宕机
✅ 全面监控性能、错误率、业务指标
```

**错误3: 缺少回滚方案**

```
❌ 出现问题再想办法回滚
✅ 提前准备回滚脚本和流程
```

**错误4: 灰度时间过短**

```
❌ 灰度10分钟就全量发布
✅ 至少持续2-4小时观察
```

**错误5: 新旧版本不兼容**

```
❌ 新版本强依赖新字段,导致旧版本异常
✅ 确保新旧版本数据兼容
```

## 常见问题

### 1. 灰度发布期间如何保证数据一致性?

**问题原因:**
- 新旧版本同时运行,可能对同一数据进行不同处理
- 分布式事务难以保证
- 缓存可能不一致

**解决方案:**

**方案1: 幂等性设计**

```java
@Service
public class OrderService {

    /**
     * 幂等的订单创建
     */
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(OrderRequest request) {
        // 使用业务唯一键防止重复创建
        String businessKey = request.getUserId() + ":" + request.getProductId();

        // 检查是否已创建
        Order existingOrder = orderMapper.selectByBusinessKey(businessKey);
        if (existingOrder != null) {
            log.info("订单已存在,跳过创建: {}", businessKey);
            return;
        }

        // 创建订单
        Order order = new Order();
        order.setBusinessKey(businessKey);
        order.setUserId(request.getUserId());
        order.setProductId(request.getProductId());
        orderMapper.insert(order);
    }
}
```

**方案2: 版本号控制**

```java
@Service
public class UserService {

    /**
     * 使用版本号防止并发更新冲突
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(User user) {
        // 乐观锁: 更新时检查版本号
        int rows = userMapper.updateByVersion(user);

        if (rows == 0) {
            throw new ServiceException("用户信息已被修改,请刷新后重试");
        }
    }
}

// Mapper
@Update("UPDATE sys_user SET name = #{name}, version = version + 1 " +
        "WHERE id = #{id} AND version = #{version}")
int updateByVersion(User user);
```

**方案3: 分布式锁**

```java
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RedissonClient redissonClient;

    /**
     * 使用分布式锁防止重复支付
     */
    public void processPayment(PaymentRequest request) {
        String lockKey = "payment:lock:" + request.getOrderId();
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁,最多等待10秒,锁30秒后自动释放
            boolean acquired = lock.tryLock(10, 30, TimeUnit.SECONDS);
            if (!acquired) {
                throw new ServiceException("支付处理中,请稍后重试");
            }

            // 执行支付逻辑
            doProcessPayment(request);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServiceException("获取锁被中断");
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

### 2. 如何处理新旧版本的缓存不一致?

**问题原因:**
- 新版本修改了缓存结构
- 新旧版本对同一缓存键的处理不同

**解决方案:**

**方案1: 缓存版本号**

```java
@Service
public class UserCacheService {

    private static final String CACHE_VERSION = "v2";

    /**
     * 带版本号的缓存键
     */
    private String getCacheKey(Long userId) {
        return "user:" + CACHE_VERSION + ":" + userId;
    }

    /**
     * 获取用户缓存
     */
    public User getUserFromCache(Long userId) {
        String key = getCacheKey(userId);
        return RedisUtils.getCacheObject(key);
    }

    /**
     * 设置用户缓存
     */
    public void setUserCache(User user) {
        String key = getCacheKey(user.getId());
        RedisUtils.setCacheObject(key, user, Duration.ofHours(1));
    }

    /**
     * 清理旧版本缓存
     */
    public void cleanOldVersionCache() {
        String pattern = "user:v1:*";
        Set<String> keys = RedisUtils.keys(pattern);
        RedisUtils.deleteObject(keys);
    }
}
```

**方案2: 双写缓存**

```java
@Service
public class DualWriteCacheService {

    /**
     * 新旧版本同时写入缓存
     */
    public void setUserCache(User user) {
        // 旧版本缓存格式
        String oldKey = "user:" + user.getId();
        UserV1 oldUser = convertToV1(user);
        RedisUtils.setCacheObject(oldKey, oldUser);

        // 新版本缓存格式
        String newKey = "user:v2:" + user.getId();
        RedisUtils.setCacheObject(newKey, user);
    }

    /**
     * 从新版本缓存读取,兼容旧版本
     */
    public User getUserFromCache(Long userId) {
        // 优先读取新版本
        String newKey = "user:v2:" + userId;
        User user = RedisUtils.getCacheObject(newKey);
        if (user != null) {
            return user;
        }

        // 回退到旧版本
        String oldKey = "user:" + userId;
        UserV1 oldUser = RedisUtils.getCacheObject(oldKey);
        if (oldUser != null) {
            return convertToV2(oldUser);
        }

        return null;
    }
}
```

### 3. 灰度发布时如何处理定时任务?

**问题原因:**
- 多个实例同时运行定时任务会导致重复执行
- 新旧版本的定时任务逻辑可能不同

**解决方案:**

**方案1: 分布式锁控制**

```java
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final RedissonClient redissonClient;

    /**
     * 使用分布式锁确保只有一个实例执行
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void dailyTask() {
        String lockKey = "scheduled:daily-task";
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁,不等待
            boolean acquired = lock.tryLock(0, 30, TimeUnit.MINUTES);
            if (!acquired) {
                log.info("定时任务已被其他实例执行,跳过");
                return;
            }

            // 执行任务
            executeDailyTask();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

**方案2: 使用 SnailJob 分布式任务调度**

项目已集成 SnailJob,推荐使用其分布式调度功能:

```yaml
# 只在其中一个实例启用定时任务
snail-job:
  enabled: ${SNAIL_ENABLED:false}  # 默认关闭
  server:
    host: 127.0.0.1
    port: 8800
```

```bash
# 只在稳定版本实例启用
docker run -e SNAIL_ENABLED=true ryplus_uni_workflow:5.4.1

# 灰度实例不启用
docker run -e SNAIL_ENABLED=false ryplus_uni_workflow:5.4.2
```

### 4. 如何验证灰度发布是否成功?

**验证清单:**

**技术指标验证:**

```bash
# 1. 健康检查
curl http://localhost:5501/actuator/health

# 2. 响应时间对比
# 访问 Spring Boot Admin
http://localhost:9090/admin

# 3. 错误率统计
grep ERROR /var/log/canary/application.log | wc -l

# 4. CPU/内存对比
docker stats ryplus_uni_workflow ryplus_uni_workflow2

# 5. QPS 对比
# 通过 Prometheus 或日志统计
```

**业务指标验证:**

```sql
-- 1. 订单成功率对比
SELECT
    DATE(create_time) as date,
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success_orders,
    ROUND(SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM t_order
WHERE create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(create_time);

-- 2. API 调用量对比
SELECT
    api_path,
    COUNT(*) as call_count,
    AVG(response_time) as avg_response_time,
    MAX(response_time) as max_response_time
FROM t_api_log
WHERE create_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY api_path
ORDER BY call_count DESC
LIMIT 10;
```

**用户反馈验证:**

```
✓ 客服投诉量无明显增长
✓ 用户反馈无功能异常
✓ 应用商店评分无下降
✓ 社交媒体无负面反馈
```

### 5. 灰度发布失败如何快速定位问题?

**问题定位步骤:**

**1. 查看应用日志**

```bash
# 查看灰度实例错误日志
docker logs ryplus_uni_workflow2 | grep ERROR

# 导出完整日志
docker logs ryplus_uni_workflow2 > /tmp/canary-full.log

# 统计错误类型
grep Exception /tmp/canary-full.log | awk '{print $NF}' | sort | uniq -c | sort -rn
```

**2. 对比监控指标**

```bash
# 访问监控页面
http://localhost:9090/admin

# 对比指标:
# - 响应时间: 稳定版 vs 灰度版
# - 错误率: 稳定版 vs 灰度版
# - CPU/内存: 稳定版 vs 灰度版
# - GC 频率: 稳定版 vs 灰度版
```

**3. 分析慢查询**

```sql
-- 查看慢查询日志
SELECT
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log
WHERE start_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY query_time DESC
LIMIT 10;
```

**4. 检查 Redis 连接**

```bash
# 查看 Redis 连接数
redis-cli CLIENT LIST | wc -l

# 查看慢查询
redis-cli SLOWLOG GET 10

# 检查内存使用
redis-cli INFO memory
```

**5. 检查数据库连接池**

```bash
# 通过 Actuator 查看连接池状态
curl http://localhost:5501/actuator/metrics/hikaricp.connections.active
curl http://localhost:5501/actuator/metrics/hikaricp.connections.idle
```

**6. 分析线程堆栈**

```bash
# 生成线程转储
curl http://localhost:5501/actuator/threaddump > /tmp/threaddump.json

# 分析阻塞线程
jq '.threads[] | select(.threadState == "BLOCKED")' /tmp/threaddump.json
```

---

## 总结

灰度发布是降低发布风险的重要手段。RuoYi-Plus-UniApp 项目虽然未内置灰度发布机制,但基于现有的 Docker Compose + Nginx 架构,可以灵活实现多种灰度发布方案:

1. **基于 Nginx 权重的流量分配** - 最简单,适合快速灰度
2. **基于请求头的精确灰度** - 精确控制,适合内部测试
3. **基于应用层的灰度控制** - 与业务集成,适合复杂场景
4. **基于特性开关的灰度** - 细粒度控制,适合新功能开放

**关键要点:**

- ✅ 灰度前充分准备,确保新旧版本兼容
- ✅ 从小流量开始,逐步增加灰度比例
- ✅ 全面监控技术和业务指标
- ✅ 准备快速回滚方案
- ✅ 设置自动回滚机制
- ✅ 灰度周期不少于 4-8 小时

**推荐方案:**

- **非核心功能**: 方案一(Nginx 权重) + 监控告警
- **核心功能**: 方案二(请求头灰度) + 方案四(特性开关) + 自动回滚
- **新功能开放**: 方案四(特性开关) + 用户白名单

遵循本文档的最佳实践,可以安全、平滑地完成灰度发布,最大限度降低发布风险,提升系统稳定性。
