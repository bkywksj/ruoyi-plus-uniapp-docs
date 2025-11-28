# 构建优化 Build Optimization

## 介绍

构建优化是提升项目开发效率和生产环境性能的关键环节。RuoYi-Plus-UniApp全栈项目采用现代化的构建工具链,包括Maven(后端)、Vite(前端/移动端),通过科学的配置和优化策略,实现快速编译、按需加载、资源压缩等目标,显著缩短构建时间和提升应用性能。

**核心特性:**

- **多模块并行构建** - Maven多模块项目支持并行编译,充分利用多核CPU资源
- **Vite极速HMR** - 基于ESM的秒级热更新,开发时修改立即生效
- **智能依赖预构建** - 自动分析和预构建第三方依赖,减少首次加载时间
- **资源压缩与分割** - Gzip/Brotli压缩、代码分割、Tree Shaking自动优化产物
- **多平台编译优化** - UniApp支持H5、小程序、App多平台条件编译和按需打包
- **增量编译** - Maven和Vite都支持增量编译,只重新构建变更的模块
- **缓存机制** - 本地缓存、依赖缓存、构建产物缓存加速重复构建
- **生产环境优化** - Source Map可选、Console移除、文件Hash、CDN部署优化

本文档涵盖后端(Maven)、前端管理端(Vite)、移动端(UniApp+Vite)三个维度的构建优化策略,以及CI/CD流水线中的构建加速技巧,帮助开发者打造高效的构建流程。

## 后端构建优化(Maven)

### Maven项目结构

RuoYi-Plus后端采用Maven多模块架构,合理的模块划分是构建优化的基础:

```
ruoyi-plus-uniapp-workflow/
├── pom.xml                    # 父POM(依赖管理)
├── ruoyi-admin/               # 启动模块
├── ruoyi-common/              # 31个通用模块
│   ├── ruoyi-common-core/
│   ├── ruoyi-common-web/
│   ├── ruoyi-common-redis/
│   └── ...
├── ruoyi-modules/             # 5个业务模块
│   ├── ruoyi-system/
│   ├── ruoyi-generator/
│   └── ...
└── ruoyi-extend/              # 2个扩展模块
```

**模块依赖层次:**
- 业务模块(ruoyi-modules) → 通用模块(ruoyi-common) → Spring Boot BOM
- 清晰的依赖层次避免循环依赖,提升编译效率

### 父POM依赖管理

#### BOM统一版本管理

使用`<dependencyManagement>`统一管理依赖版本,避免版本冲突:

```xml
<properties>
    <revision>5.5.0</revision>
    <spring-boot.version>3.5.6</spring-boot.version>
    <mybatis-plus.version>3.5.14</mybatis-plus.version>
    <satoken.version>1.44.0</satoken.version>
    <redisson.version>3.51.0</redisson.version>
    <hutool.version>5.8.40</hutool.version>
    <!-- ...更多版本定义 -->
</properties>

<dependencyManagement>
    <dependencies>
        <!-- Spring Boot BOM -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- 自定义BOM -->
        <dependency>
            <groupId>plus.ruoyi</groupId>
            <artifactId>ruoyi-common-bom</artifactId>
            <version>${revision}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

**优化效果:**
- 子模块无需指定版本号,自动继承父POM版本
- 减少依赖冲突,Maven无需进行仲裁计算
- 统一升级依赖版本,只需修改父POM

#### Revision版本占位符

使用`${revision}`占位符实现CI/CD友好的版本管理:

```xml
<groupId>plus.ruoyi</groupId>
<artifactId>ruoyi-plus-uniapp</artifactId>
<version>${revision}</version>

<properties>
    <revision>5.5.0</revision>
</properties>
```

配合`flatten-maven-plugin`插件展平POM文件:

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>flatten-maven-plugin</artifactId>
    <version>1.3.0</version>
    <configuration>
        <updatePomFile>true</updatePomFile>
        <flattenMode>resolveCiFriendliesOnly</flattenMode>
    </configuration>
</plugin>
```

**CI/CD构建时动态指定版本:**
```bash
mvn clean package -Drevision=5.5.1-SNAPSHOT
```

### 并行编译配置

Maven 3+支持并行编译多个模块,充分利用多核CPU:

```bash
# 使用所有可用CPU核心
mvn clean install -T 1C

# 指定线程数(推荐CPU核心数-1)
mvn clean install -T 4

# 开发环境跳过测试加速编译
mvn clean install -T 1C -DskipTests

# 仅编译变更模块及其依赖模块
mvn clean install -T 1C -pl ruoyi-modules/ruoyi-system -am
```

**参数说明:**
- `-T 1C`: 每个CPU核心分配1个线程
- `-T 4`: 使用4个线程并行编译
- `-DskipTests`: 跳过单元测试
- `-pl`: 指定编译的模块
- `-am`: 同时编译依赖的上游模块

**性能对比:**

| 编译方式 | 耗时 | 说明 |
|---------|------|------|
| 单线程全量编译 | ~180秒 | `mvn clean install` |
| 8线程并行编译 | ~60秒 | `mvn clean install -T 1C` (8核CPU) |
| 跳过测试并行 | ~40秒 | `mvn clean install -T 1C -DskipTests` |
| 增量编译单模块 | ~8秒 | `mvn install -pl ruoyi-system -am` |

### 编译器优化

#### 注解处理器配置

合理配置注解处理器顺序,避免重复处理:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.14.0</version>
    <configuration>
        <source>21</source>
        <target>21</target>
        <encoding>UTF-8</encoding>
        <annotationProcessorPaths>
            <!-- 1. Javadoc注解处理器 -->
            <path>
                <groupId>com.github.therapi</groupId>
                <artifactId>therapi-runtime-javadoc-scribe</artifactId>
                <version>0.15.0</version>
            </path>
            <!-- 2. Lombok注解处理器 -->
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.40</version>
            </path>
            <!-- 3. Spring Boot配置处理器 -->
            <path>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-configuration-processor</artifactId>
                <version>3.5.6</version>
            </path>
            <!-- 4. MapStruct处理器 -->
            <path>
                <groupId>io.github.linpeilie</groupId>
                <artifactId>mapstruct-plus-processor</artifactId>
                <version>1.5.0</version>
            </path>
            <!-- 5. Lombok与MapStruct桥接 -->
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok-mapstruct-binding</artifactId>
                <version>0.2.0</version>
            </path>
        </annotationProcessorPaths>
        <compilerArgs>
            <!-- 保留方法参数名 -->
            <arg>-parameters</arg>
        </compilerArgs>
    </configuration>
</plugin>
```

**注解处理器执行顺序:**
1. Javadoc注解 → 生成API文档元数据
2. Lombok → 生成Getter/Setter/Builder等代码
3. Spring Boot → 生成配置元数据(META-INF/spring-configuration-metadata.json)
4. MapStruct → 生成对象映射代码
5. Lombok-MapStruct桥接 → 确保MapStruct能识别Lombok生成的代码

#### 编译参数优化

```xml
<compilerArgs>
    <!-- 保留参数名,支持@Param注解省略 -->
    <arg>-parameters</arg>
    <!-- 忽略警告加速编译(生产环境不推荐) -->
    <!-- <arg>-Xlint:none</arg> -->
</compilerArgs>
```

### 测试优化策略

#### 跳过测试

开发环境快速编译时跳过测试:

```bash
# Maven命令行方式
mvn clean package -DskipTests

# 或者跳过测试编译和执行
mvn clean package -Dmaven.test.skip=true
```

**POM配置默认跳过:**
```xml
<properties>
    <skipTests>true</skipTests>
</properties>
```

#### 按环境执行测试

使用JUnit 5的`@Tag`注解分环境执行测试:

```java
@Test
@Tag("dev")  // 仅在dev环境执行
void testDevFeature() {
    // 开发环境测试
}

@Test
@Tag("prod")  // 仅在prod环境执行
void testProdFeature() {
    // 生产环境测试
}
```

Maven Surefire插件配置:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.5.3</version>
    <configuration>
        <!-- 执行指定标签的测试 -->
        <groups>${profiles.active}</groups>
        <!-- 排除指定标签的测试 -->
        <excludedGroups>exclude</excludedGroups>
        <!-- JVM参数优化 -->
        <argLine>
            -Dfile.encoding=UTF-8
            -XX:+EnableDynamicAgentLoading
        </argLine>
    </configuration>
</plugin>
```

**执行特定环境测试:**
```bash
# 只执行dev环境测试
mvn test -Dgroups=dev

# 执行prod环境测试,排除exclude标签
mvn test -Dgroups=prod -DexcludedGroups=exclude
```

### 依赖优化

#### 排除传递依赖

避免不必要的传递依赖,减小JAR包体积:

```xml
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-jwt</artifactId>
    <exclusions>
        <!-- Hutool已在父POM统一管理,排除传递依赖 -->
        <exclusion>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

#### 本地仓库优化

配置华为云Maven镜像加速依赖下载:

```xml
<repositories>
    <repository>
        <id>public</id>
        <name>huawei nexus</name>
        <url>https://mirrors.huaweicloud.com/repository/maven/</url>
        <releases>
            <enabled>true</enabled>
        </releases>
    </repository>
</repositories>
```

**常用国内镜像:**
- 华为云: `https://mirrors.huaweicloud.com/repository/maven/`
- 阿里云: `https://maven.aliyun.com/repository/public`
- 腾讯云: `https://mirrors.cloud.tencent.com/nexus/repository/maven-public/`

### 打包优化

#### Spring Boot Fat JAR优化

使用`spring-boot-maven-plugin`打包可执行JAR:

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <executions>
        <execution>
            <goals>
                <goal>repackage</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <!-- 排除开发工具依赖 -->
        <excludeDevtools>true</excludeDevtools>
        <!-- 分层打包支持Docker镜像缓存 -->
        <layers>
            <enabled>true</enabled>
        </layers>
    </configuration>
</plugin>
```

**分层打包优势:**
- 依赖层独立,依赖不变时Docker构建可复用缓存
- JAR包分为`dependencies`、`spring-boot-loader`、`snapshot-dependencies`、`application`四层

**Docker多阶段构建示例:**
```dockerfile
FROM openjdk:21-jdk-slim as builder
WORKDIR /app
COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM openjdk:21-jre-slim
WORKDIR /app
# 分层复制,利用Docker缓存
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

#### 资源过滤优化

只对配置文件启用资源过滤,避免二进制文件损坏:

```xml
<resources>
    <!-- 所有资源默认不过滤 -->
    <resource>
        <directory>src/main/resources</directory>
        <filtering>false</filtering>
    </resource>
    <!-- 仅对配置文件启用过滤 -->
    <resource>
        <directory>src/main/resources</directory>
        <includes>
            <include>application*</include>
            <include>bootstrap*</include>
            <include>banner*</include>
        </includes>
        <filtering>true</filtering>
    </resource>
</resources>
```

**过滤变量示例:**
```yaml
# application.yml
spring:
  application:
    name: @project.artifactId@
  profiles:
    active: @profiles.active@
```

### 多环境构建

#### Profile配置

定义dev和prod两套环境配置:

```xml
<profiles>
    <!-- 开发环境 -->
    <profile>
        <id>dev</id>
        <properties>
            <profiles.active>dev</profiles.active>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    <!-- 生产环境 -->
    <profile>
        <id>prod</id>
        <properties>
            <profiles.active>prod</profiles.active>
        </properties>
    </profile>
</profiles>
```

**指定环境编译:**
```bash
# 开发环境(默认)
mvn clean package

# 生产环境
mvn clean package -P prod

# 同时指定多个Profile
mvn clean package -P prod,docker
```

#### 环境配置文件

```
src/main/resources/
├── application.yml            # 通用配置
├── application-dev.yml        # 开发环境配置
└── application-prod.yml       # 生产环境配置
```

### 构建缓存优化

#### 本地仓库缓存

Maven本地仓库默认位于`~/.m2/repository`,首次构建会下载所有依赖,后续构建直接使用缓存。

**清理本地仓库释放空间:**
```bash
# 清理所有本地仓库
mvn dependency:purge-local-repository

# 清理特定GroupId的依赖
mvn dependency:purge-local-repository -DmanualInclude="plus.ruoyi:*"
```

#### 增量编译

Maven默认支持增量编译,只重新编译变更的Java文件:

```bash
# 不清理target目录,只编译变更文件
mvn compile

# 清理后全量编译
mvn clean compile
```

**增量编译生效条件:**
- 源代码文件修改时间 > 编译产物修改时间
- 依赖的类没有变化
- 编译参数没有变化

## 前端构建优化(Vite)

### Vite构建优势

RuoYi-Plus前端管理端使用Vite作为构建工具,相比Webpack具有显著优势:

**开发环境优势:**
- 基于ES Modules,无需打包,秒级启动
- HMR(Hot Module Replacement)响应速度快,修改立即生效
- 按需编译,只编译当前访问的模块

**生产环境优势:**
- 基于Rollup打包,产物体积小
- 原生支持Tree Shaking和代码分割
- 预构建依赖,优化CommonJS模块

### 开发环境优化

#### 开发服务器配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',  // 监听所有地址
    port: 80,         // 端口号
    strictPort: false, // 端口被占用时自动递增
    open: true,        // 自动打开浏览器

    // HMR配置(默认已优化,通常无需配置)
    hmr: {
      overlay: true,   // 显示错误覆盖层
    },

    // 代理配置(解决跨域)
    proxy: {
      '/dev-api': {
        target: 'http://127.0.0.1:5500',
        changeOrigin: true,
        ws: true,  // 支持WebSocket
        rewrite: (path) => path.replace(/^\/dev-api/, '')
      }
    }
  }
})
```

**性能指标:**
- 冷启动: ~500ms
- 热更新: ~50ms
- 页面加载: ~200ms

#### 依赖预构建

Vite会自动预构建第三方依赖(node_modules),将CommonJS/UMD转换为ESM:

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 强制预构建的依赖项
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@vueuse/core',
      'echarts',
      'vue-i18n',
      '@vueup/vue-quill',
      'image-conversion',
      'element-plus/es/components/**/css',
      'vue-json-pretty',
      'file-saver',
      '@wangeditor/editor-for-vue',
      'qrcode'
    ],
    // 排除预构建的依赖项(通常是ESM格式)
    exclude: []
  }
})
```

**预构建机制:**
1. 扫描源代码中的import语句
2. 分析依赖图,找到需要预构建的包
3. 使用Esbuild将依赖打包成单个ESM文件
4. 缓存到`node_modules/.vite`目录

**预构建缓存失效条件:**
- `package.json`的dependencies字段变化
- 包管理器的lockfile变化
- `vite.config.ts`的optimizeDeps配置变化

#### 路径别名优化

配置路径别名简化import路径,同时优化模块解析速度:

```typescript
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(process.cwd(), './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})
```

**使用示例:**
```typescript
// 使用别名前
import { useUserStore } from '../../../stores/user'

// 使用别名后
import { useUserStore } from '@/stores/user'
```

### 生产环境优化

#### 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',          // 编译目标(支持的浏览器版本)
    outDir: 'dist',            // 输出目录
    assetsDir: 'assets',       // 静态资源目录
    assetsInlineLimit: 4096,   // 小于4KB的资源内联为base64
    sourcemap: false,          // 生产环境关闭Source Map
    minify: 'esbuild',         // 使用esbuild压缩(比terser快20倍)

    // 代码分割策略
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
          'editor': ['@vueup/vue-quill', '@wangeditor/editor-for-vue']
        },
        // 文件命名规则
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },

    // Chunk大小警告阈值
    chunkSizeWarningLimit: 1500
  }
})
```

**构建产物结构:**
```
dist/
├── index.html
├── js/
│   ├── app-[hash].js           # 应用入口
│   ├── vue-vendor-[hash].js    # Vue相关库
│   ├── element-plus-[hash].js  # UI组件库
│   └── ...
├── css/
│   └── index-[hash].css
└── assets/
    ├── fonts/
    └── images/
```

#### 代码分割策略

##### 1. 路由懒加载

Vue Router支持路由级别的代码分割:

```typescript
// src/router/index.ts
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/dashboard/index.vue'),  // 懒加载
    meta: { title: '仪表盘' }
  },
  {
    path: '/system/user',
    component: () => import('@/views/system/user/index.vue'),
    meta: { title: '用户管理' }
  }
]
```

**效果:**
- 首屏只加载必要的路由组件
- 访问其他页面时按需加载
- 每个路由组件单独打包成一个chunk

##### 2. 组件懒加载

使用`defineAsyncComponent`实现组件级懒加载:

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 异步加载大型组件
const HeavyChart = defineAsyncComponent(() =>
  import('@/components/HeavyChart.vue')
)
</script>

<template>
  <Suspense>
    <template #default>
      <HeavyChart />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

##### 3. 动态导入

根据条件动态导入模块:

```typescript
// 根据环境动态加载配置
const config = import.meta.env.PROD
  ? await import('@/config/prod')
  : await import('@/config/dev')

// 根据用户权限动态加载模块
if (hasPermission('system:user:edit')) {
  const { UserEditDialog } = await import('@/views/system/user/edit')
  // 使用组件
}
```

#### 资源压缩

##### Gzip/Brotli压缩

使用`vite-plugin-compression`插件生成压缩文件:

```typescript
// vite/plugins/compression.ts
import compression from 'vite-plugin-compression'

export default (env: any) => {
  const { VITE_BUILD_COMPRESS } = env
  const plugin: any[] = []

  if (VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(',')

    // Gzip压缩
    if (compressList.includes('gzip')) {
      plugin.push(
        compression({
          ext: '.gz',
          deleteOriginFile: false  // 保留原文件
        })
      )
    }

    // Brotli压缩(压缩率更高)
    if (compressList.includes('brotli')) {
      plugin.push(
        compression({
          ext: '.br',
          algorithm: 'brotliCompress',
          deleteOriginFile: false
        })
      )
    }
  }

  return plugin
}
```

**环境变量配置:**
```bash
# .env.production
VITE_BUILD_COMPRESS=gzip,brotli
```

**压缩效果对比:**

| 文件 | 原始大小 | Gzip | Brotli |
|------|---------|------|--------|
| app.js | 500KB | 150KB (-70%) | 130KB (-74%) |
| vendor.js | 800KB | 250KB (-69%) | 220KB (-72%) |
| index.css | 100KB | 20KB (-80%) | 18KB (-82%) |

**Nginx配置启用压缩:**
```nginx
# 启用Gzip
gzip on;
gzip_static on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# 启用Brotli
brotli on;
brotli_static on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

##### 图片压缩

使用`vite-plugin-imagemin`压缩图片资源:

```bash
pnpm add -D vite-plugin-imagemin
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true }
        ]
      }
    })
  ]
})
```

#### CSS优化

##### PostCSS配置

自动添加浏览器前缀,移除冗余CSS:

```typescript
// vite.config.ts
import autoprefixer from 'autoprefixer'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        // 自动添加浏览器前缀
        autoprefixer(),
        // 移除多余的@charset声明
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              atRule.remove()
            }
          }
        }
      ]
    },
    // SCSS配置
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',  // 使用现代编译器
        additionalData: '@use "@/assets/styles/variables.scss" as *;'
      }
    }
  }
})
```

##### CSS Modules

启用CSS Modules避免样式冲突:

```vue
<template>
  <div :class="$style.container">
    <h1 :class="$style.title">标题</h1>
  </div>
</template>

<style module>
.container {
  padding: 20px;
}

.title {
  font-size: 24px;
}
</style>
```

生成的类名: `.container_1a2b3c`、`.title_4d5e6f`(Hash值确保唯一性)

#### Tree Shaking优化

Vite基于Rollup自动进行Tree Shaking,移除未使用的代码。

**有效的Tree Shaking示例:**

```typescript
// utils.ts
export function usedFunction() {
  return 'used'
}

export function unusedFunction() {  // 不会被打包
  return 'unused'
}

// main.ts
import { usedFunction } from './utils'  // 只导入需要的函数
console.log(usedFunction())
```

**注意事项:**
- 使用ESM格式的依赖(CJS格式无法Tree Shaking)
- 避免副作用代码(会阻止Tree Shaking)
- `package.json`中标记`sideEffects: false`

```json
{
  "sideEffects": false,  // 所有文件都没有副作用
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "*.scss"]
}
```

### 插件优化

#### 自动导入插件

##### unplugin-auto-import

自动导入Vue、Vue Router、Pinia等API:

```typescript
// vite/plugins/auto-imports.ts
import autoImport from 'unplugin-auto-import/vite'

export default (path: any) => {
  return autoImport({
    imports: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      {
        axios: [['default', 'axios']]
      }
    ],
    dts: path.join(process.cwd(), './types/auto-imports.d.ts'),
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json'
    }
  })
}
```

**效果:**
```typescript
// 无需手动导入
// import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

onMounted(() => {
  console.log('mounted')
})
```

##### unplugin-vue-components

自动导入Element Plus组件:

```typescript
// vite/plugins/components.ts
import components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default (path: any) => {
  return components({
    resolvers: [
      ElementPlusResolver({
        importStyle: 'sass'  // 自动导入组件样式
      })
    ],
    dts: path.join(process.cwd(), './types/components.d.ts')
  })
}
```

**效果:**
```vue
<template>
  <!-- 无需全局注册或导入 -->
  <el-button type="primary">按钮</el-button>
  <el-table :data="tableData"></el-table>
</template>
```

#### UnoCSS原子化CSS

使用UnoCSS替代传统CSS,减小样式体积:

```typescript
// vite/plugins/unocss.ts
import UnoCSS from 'unocss/vite'
import { presetUno, presetAttributify, presetIcons } from 'unocss'

export default () => {
  return UnoCSS({
    presets: [
      presetUno(),          // 基础工具类
      presetAttributify(),  // 属性化模式
      presetIcons()         // 图标支持
    ],
    shortcuts: {
      // 自定义快捷方式
      'btn': 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600',
      'card': 'p-4 rounded shadow-md bg-white'
    }
  })
}
```

**使用示例:**
```vue
<template>
  <!-- 原子化CSS类 -->
  <div class="flex items-center justify-between p-4 bg-gray-100">
    <button class="btn">提交</button>
  </div>

  <!-- 属性化模式 -->
  <div flex items-center justify-between p-4 bg-gray-100>
    <button class="btn">提交</button>
  </div>
</template>
```

**优势:**
- 按需生成CSS,只包含使用的类
- 比Tailwind CSS更小的bundle大小
- 支持自定义规则和快捷方式

#### 图标优化

使用`unplugin-icons`按需加载图标:

```typescript
// vite/plugins/icons.ts
import Icons from 'unplugin-icons/vite'

export default () => {
  return Icons({
    autoInstall: true,  // 自动安装图标集
    compiler: 'vue3'
  })
}
```

**使用示例:**
```vue
<script setup lang="ts">
import IconUser from '~icons/ep/user'
import IconEdit from '~icons/ep/edit'
</script>

<template>
  <IconUser />
  <IconEdit />
</template>
```

**优势:**
- 只打包使用的图标,不会包含整个图标库
- 支持10万+图标(Iconify生态)
- 图标以Vue组件形式使用,支持样式定制

### 环境变量管理

#### 环境变量文件

```
env/
├── .env                    # 所有环境共用
├── .env.development        # 开发环境
└── .env.production         # 生产环境
```

**示例配置:**
```bash
# .env.production
NODE_ENV=production

# 应用配置
VITE_APP_TITLE=RuoYi-Plus管理系统
VITE_APP_PORT=80
VITE_APP_CONTEXT_PATH=/
VITE_APP_PUBLIC_PATH=/

# API配置
VITE_APP_BASE_API=/prod-api
VITE_APP_BASE_API_PORT=5500

# 构建配置
VITE_BUILD_COMPRESS=gzip,brotli
VITE_DELETE_CONSOLE=true
VITE_SHOW_SOURCEMAP=false
```

#### 使用环境变量

```typescript
// vite.config.ts
import { loadEnv } from 'vite'
import path from 'path'

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))

  return defineConfig({
    base: env.VITE_APP_CONTEXT_PATH,
    server: {
      port: Number(env.VITE_APP_PORT)
    }
  })
}
```

```typescript
// 业务代码中使用
const apiBaseUrl = import.meta.env.VITE_APP_BASE_API
const isProduction = import.meta.env.PROD
```

### 构建分析

使用`rollup-plugin-visualizer`可视化分析bundle体积:

```bash
pnpm add -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,  // 构建后自动打开分析报告
      filename: 'stats.html',  // 报告文件名
      gzipSize: true,          // 显示gzip后的大小
      brotliSize: true         // 显示brotli后的大小
    })
  ]
})
```

**分析报告包含:**
- 各个chunk的大小
- 依赖关系树
- 大型依赖识别
- 压缩后体积对比

## UniApp构建优化

### UniApp构建特点

UniApp采用"一次编写,多端运行"架构,构建时需要针对不同平台进行条件编译和代码转换:

**支持平台:**
- H5(Web)
- 小程序(微信/支付宝/百度/QQ/抖音/京东/快手/飞书/小红书)
- App(Android/iOS/HarmonyOS)
- 快应用

**构建流程:**
```
源码(Vue 3)
  → 条件编译(平台差异代码)
  → 代码转换(平台适配)
  → 资源优化(压缩/分包)
  → 产物输出(不同平台格式)
```

### 平台编译命令

```json
{
  "scripts": {
    // 开发环境
    "dev:h5": "uni",
    "dev:mp-weixin": "uni -p mp-weixin",
    "dev:app": "uni -p app",

    // 生产环境
    "build:h5": "uni build",
    "build:mp-weixin": "uni build -p mp-weixin",
    "build:app": "uni build -p app"
  }
}
```

**命令区别:**
- H5开发模式: `command=serve, mode=development`
- 小程序开发模式: `command=build, mode=development`(注意是build,但mode是development)
- 生产模式: `command=build, mode=production`

### Vite配置优化

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins/index'

export default async ({ command, mode }: ConfigEnv) => {
  const { UNI_PLATFORM } = process.env  // mp-weixin, h5, app等
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  const { VITE_DELETE_CONSOLE, VITE_SHOW_SOURCEMAP } = env

  return defineConfig({
    base: env.VITE_APP_PUBLIC_PATH || '/',
    envDir: './env',

    plugins: await createVitePlugins({ command, mode, env }),

    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM)
    },

    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src')
      }
    },

    server: {
      host: '0.0.0.0',
      hmr: true,
      strictPort: false,
      open: true
    },

    // 移除console和debugger
    esbuild: {
      drop: VITE_DELETE_CONSOLE === 'true'
        ? ['console', 'debugger']
        : ['debugger']
    },

    // 依赖优化
    optimizeDeps: {
      include: ['jsencrypt/bin/jsencrypt.min.js', 'crypto-js']
    },

    build: {
      sourcemap: VITE_SHOW_SOURCEMAP === 'true',
      target: 'es6',
      minify: mode === 'development' ? false : 'esbuild'
    }
  })
}
```

### 条件编译优化

#### 平台条件编译

使用条件编译减少不同平台的代码量:

```vue
<template>
  <view>
    <!-- #ifdef H5 -->
    <web-view :src="url"></web-view>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <web-view :src="url" @message="handleMessage"></web-view>
    <!-- #endif -->

    <!-- #ifdef APP-PLUS -->
    <web-view :src="url" :webview-styles="webviewStyles"></web-view>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
// #ifdef H5
import { setupH5Feature } from './h5'
setupH5Feature()
// #endif

// #ifdef MP-WEIXIN
import { setupWeixinFeature } from './weixin'
setupWeixinFeature()
// #endif
</script>

<style>
/* #ifdef H5 */
.container {
  height: 100vh;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.container {
  height: 100%;
}
/* #endif */
</style>
```

**条件编译语法:**
- `#ifdef PLATFORM`: 仅在指定平台编译
- `#ifndef PLATFORM`: 除指定平台外都编译
- `#ifdef PLATFORM1 || PLATFORM2`: 多平台
- `#ifdef PLATFORM1 && PLATFORM2`: 交集平台

**常用平台标识:**
- `H5`: H5平台
- `MP-WEIXIN`: 微信小程序
- `MP-ALIPAY`: 支付宝小程序
- `APP-PLUS`: App平台
- `APP-ANDROID`: Android
- `APP-IOS`: iOS

#### JavaScript条件编译

```typescript
// #ifdef H5
export const platform = 'h5'
export function h5OnlyFunction() {
  // H5专用功能
}
// #endif

// #ifdef MP-WEIXIN
export const platform = 'weixin'
export function weixinOnlyFunction() {
  // 微信小程序专用功能
}
// #endif

// 多平台共用
export function commonFunction() {
  // #ifdef H5
  console.log('H5环境')
  // #endif

  // #ifdef MP-WEIXIN
  console.log('微信小程序环境')
  // #endif
}
```

### 小程序分包优化

#### 分包配置

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": { "navigationBarTitleText": "首页" }
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub/user",
      "pages": [
        {
          "path": "profile/index",
          "style": { "navigationBarTitleText": "个人中心" }
        },
        {
          "path": "settings/index",
          "style": { "navigationBarTitleText": "设置" }
        }
      ]
    },
    {
      "root": "pages-sub/order",
      "pages": [
        {
          "path": "list/index",
          "style": { "navigationBarTitleText": "订单列表" }
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub/user"]
    }
  }
}
```

**分包策略:**
- 主包: 首页、tabBar页面、公共资源
- 分包: 低频功能模块(个人中心、订单、设置等)
- 独立分包: 可独立运行的模块(如活动页)

**分包大小限制(微信小程序):**
- 主包: 2MB
- 单个分包: 2MB
- 总包: 20MB

#### 预加载分包

使用`preloadRule`提前加载分包,优化体验:

```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "all",         // wifi或4g都预加载
      "packages": ["pages-sub/user"]  // 预加载用户模块
    },
    "pages/mall/index": {
      "network": "wifi",        // 仅wifi预加载
      "packages": ["pages-sub/order", "pages-sub/product"]
    }
  }
}
```

#### 分包异步化

将非必要依赖异步化,减小主包体积:

```typescript
// 同步导入(会打包到主包)
import heavyLib from 'heavy-lib'

// 异步导入(会打包到分包)
const heavyLib = await import('heavy-lib')
```

### 资源优化

#### 图片优化

```typescript
// 本地图片建议使用CDN
const imageUrl = 'https://cdn.example.com/images/banner.jpg'

// 小图标使用base64内联
const iconData = 'data:image/png;base64,iVBORw0KGgo...'

// 按需加载大图
const loadImage = () => {
  return new Promise((resolve) => {
    uni.getImageInfo({
      src: imageUrl,
      success: (res) => resolve(res)
    })
  })
}
```

**图片优化建议:**
- 使用CDN托管图片
- 小于10KB的图标使用base64
- 大图按需加载
- 使用WebP格式(支持的平台)

#### 字体图标优化

使用UnoCSS图标代替字体文件:

```vue
<template>
  <!-- 使用图标类 -->
  <view class="i-ep-user text-24px"></view>
  <view class="i-ep-edit text-24px text-blue-500"></view>
</template>
```

**优势:**
- 无需引入字体文件
- 按需生成SVG图标
- 支持颜色和大小定制

### H5平台优化

H5平台的构建优化与前端管理端类似,但需注意移动端特性:

#### PWA支持

```typescript
// vite/plugins/pwa.ts
import { VitePWA } from 'vite-plugin-pwa'

export default () => {
  return VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'RuoYi-Plus UniApp',
      short_name: 'RuoYi',
      theme_color: '#ffffff',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      // 缓存策略
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.example\.com\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 // 24小时
            }
          }
        }
      ]
    }
  })
}
```

#### 移动端适配

```typescript
// postcss.config.js
export default {
  plugins: {
    // px转rem
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*'],
      selectorBlackList: ['.no-rem']
    },
    // 自动添加浏览器前缀
    autoprefixer: {
      overrideBrowserslist: [
        'iOS >= 10',
        'Android >= 5.0',
        'Chrome >= 60'
      ]
    }
  }
}
```

### App平台优化

#### 离线打包优化

使用HBuilderX离线打包减小包体积:

1. 移除不使用的模块(如视频、地图)
2. 使用自定义基座调试
3. 开启资源压缩
4. 配置混淆加密

#### 原生插件优化

按需引入原生插件,避免打包不需要的功能:

```json
// manifest.json
{
  "app-plus": {
    "modules": {
      "Geolocation": {},  // 定位
      "Camera": {}        // 相机
      // 注释掉不使用的模块
      // "Video": {},
      // "Audio": {}
    }
  }
}
```

### UniApp专用插件

#### @uni-helper系列插件

```typescript
// vite/plugins/index.ts
import UniPages from '@uni-helper/vite-plugin-uni-pages'
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'
import UniComponents from '@uni-helper/vite-plugin-uni-components'

export default async () => {
  return [
    // 自动生成pages.json
    UniPages({
      dts: 'types/uni-pages.d.ts'
    }),

    // 布局系统
    UniLayouts(),

    // 自动生成manifest.json
    UniManifest(),

    // 自动导入组件
    UniComponents({
      dts: 'types/components.d.ts'
    })
  ]
}
```

**优势:**
- 约定式路由,无需手动配置pages.json
- 自动导入组件,减少重复代码
- TypeScript类型支持

#### bundle-optimizer

使用`@uni-ku/bundle-optimizer`优化小程序包体积:

```typescript
// vite.config.ts
import { UniKuBundleOptimizer } from '@uni-ku/bundle-optimizer'

export default defineConfig({
  plugins: [
    UniKuBundleOptimizer({
      // 移除未使用的样式
      removeUnusedCss: true,
      // 压缩JSON
      compressJson: true,
      // 移除注释
      removeComments: true
    })
  ]
})
```

## CI/CD构建优化

### Docker多阶段构建

#### 后端Docker构建

```dockerfile
# 第一阶段: 构建
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# 复制pom文件,利用Docker缓存依赖
COPY pom.xml .
COPY ruoyi-common/pom.xml ruoyi-common/
COPY ruoyi-modules/pom.xml ruoyi-modules/
COPY ruoyi-extend/pom.xml ruoyi-extend/
COPY ruoyi-admin/pom.xml ruoyi-admin/

# 下载依赖(利用缓存)
RUN mvn dependency:go-offline -B

# 复制源码
COPY . .

# 编译打包(并行编译,跳过测试)
RUN mvn clean package -T 1C -DskipTests -P prod

# 解压分层JAR
RUN java -Djarmode=layertools -jar ruoyi-admin/target/*.jar extract

# 第二阶段: 运行
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 安装时区数据
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 分层复制(利用Docker缓存)
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5500/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

**优化点:**
1. 依赖下载与源码复制分离,利用Docker缓存
2. 多阶段构建,构建镜像不包含构建工具
3. 使用JRE镜像而非JDK,减小镜像体积
4. 分层复制JAR,依赖层可缓存

**镜像大小对比:**
- 单阶段构建: ~600MB
- 多阶段构建: ~200MB

#### 前端Docker构建

```dockerfile
# 第一阶段: 构建
FROM node:18-alpine AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm@8

# 复制package.json(利用缓存)
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建生产版本
RUN pnpm build:prod

# 第二阶段: 运行
FROM nginx:alpine

# 复制Nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**镜像大小对比:**
- 包含Node.js: ~400MB
- 仅包含Nginx: ~25MB

### GitHub Actions工作流

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  # 后端构建
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 设置Java环境
      - name: Setup Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'maven'  # Maven依赖缓存

      # 编译后端
      - name: Build Backend
        run: mvn clean package -T 1C -DskipTests -P prod

      # 上传制品
      - uses: actions/upload-artifact@v4
        with:
          name: backend-jar
          path: ruoyi-admin/target/*.jar

  # 前端构建
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 设置Node环境
      - name: Setup Node.js 18
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'  # pnpm缓存

      # 安装pnpm
      - name: Install pnpm
        run: npm install -g pnpm@8

      # 安装依赖
      - name: Install Dependencies
        run: |
          cd plus-ui
          pnpm install --frozen-lockfile

      # 构建前端
      - name: Build Frontend
        run: |
          cd plus-ui
          pnpm build:prod

      # 上传制品
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: plus-ui/dist
```

**优化要点:**
- 使用`cache: 'maven'`和`cache: 'pnpm'`缓存依赖
- 并行执行后端和前端构建
- 使用`upload-artifact`保存构建产物

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

# Maven依赖缓存
.maven-cache:
  cache:
    key: ${CI_COMMIT_REF_SLUG}-maven
    paths:
      - .m2/repository

# pnpm依赖缓存
.pnpm-cache:
  cache:
    key: ${CI_COMMIT_REF_SLUG}-pnpm
    paths:
      - .pnpm-store

# 后端构建
backend-build:
  stage: build
  image: maven:3.9-eclipse-temurin-21
  extends: .maven-cache
  script:
    - mvn clean package -T 1C -DskipTests -P prod -Dmaven.repo.local=.m2/repository
  artifacts:
    paths:
      - ruoyi-admin/target/*.jar
    expire_in: 1 day

# 前端构建
frontend-build:
  stage: build
  image: node:18-alpine
  extends: .pnpm-cache
  before_script:
    - npm install -g pnpm@8
    - pnpm config set store-dir .pnpm-store
  script:
    - cd plus-ui
    - pnpm install --frozen-lockfile
    - pnpm build:prod
  artifacts:
    paths:
      - plus-ui/dist
    expire_in: 1 day

# UniApp构建
uniapp-build:
  stage: build
  image: node:18-alpine
  extends: .pnpm-cache
  before_script:
    - npm install -g pnpm@8
    - pnpm config set store-dir .pnpm-store
  script:
    - cd plus-uniapp
    - pnpm install --frozen-lockfile
    - pnpm build:h5
    - pnpm build:mp-weixin
  artifacts:
    paths:
      - plus-uniapp/dist
    expire_in: 1 day
```

### 缓存策略优化

#### Maven本地仓库缓存

```yaml
# GitHub Actions
- uses: actions/cache@v4
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
    restore-keys: |
      ${{ runner.os }}-maven-

# GitLab CI
cache:
  key: ${CI_COMMIT_REF_SLUG}-maven
  paths:
    - .m2/repository
```

#### Node依赖缓存

```yaml
# GitHub Actions
- uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

# GitLab CI
cache:
  key: ${CI_COMMIT_REF_SLUG}-pnpm
  paths:
    - .pnpm-store
```

#### Docker镜像层缓存

```yaml
# 使用BuildKit缓存
- name: Build Docker Image
  run: |
    DOCKER_BUILDKIT=1 docker build \
      --cache-from=myapp:latest \
      --build-arg BUILDKIT_INLINE_CACHE=1 \
      -t myapp:${{ github.sha }} \
      .
```

## 最佳实践

### 构建速度优化

#### 1. 使用并行编译

**Maven:**
```bash
mvn clean install -T 1C  # 每个CPU核心一个线程
```

**Vite:**
Vite默认已并行处理,无需配置。

#### 2. 增量编译

```bash
# 仅编译变更模块
mvn install -pl ruoyi-system -am

# Vite自动增量编译
pnpm dev
```

#### 3. 跳过不必要的步骤

```bash
# 开发环境跳过测试
mvn clean package -DskipTests

# 跳过代码检查
mvn clean package -Dcheckstyle.skip -Dpmd.skip
```

### 产物体积优化

#### 1. 代码分割

**前端:**
- 路由懒加载
- 组件懒加载
- 动态导入

**后端:**
- 分层JAR
- 排除开发依赖
- 使用Thin JAR

#### 2. 资源压缩

**前端:**
- Gzip/Brotli压缩
- 图片压缩
- CSS/JS压缩

**后端:**
- 移除调试信息
- JAR压缩
- 资源优化

#### 3. Tree Shaking

**前端:**
- 使用ESM格式依赖
- 标记`sideEffects: false`
- 避免副作用代码

**后端:**
- 移除未使用的依赖
- 精简Spring Boot Starter

### 缓存策略

#### 1. 本地缓存

**Maven:**
- 本地仓库: `~/.m2/repository`
- 插件缓存: 自动管理

**Node:**
- 全局缓存: `~/.pnpm-store`
- 项目缓存: `node_modules/.vite`

#### 2. CI/CD缓存

**Maven:**
```yaml
cache:
  paths:
    - .m2/repository
```

**Node:**
```yaml
cache:
  paths:
    - .pnpm-store
    - node_modules
```

#### 3. 浏览器缓存

**Nginx配置:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 环境隔离

#### 1. 多环境配置

**后端:**
- `application-dev.yml`
- `application-test.yml`
- `application-prod.yml`

**前端:**
- `.env.development`
- `.env.test`
- `.env.production`

#### 2. Profile切换

**Maven:**
```bash
mvn clean package -P prod
```

**Vite:**
```bash
pnpm build --mode production
```

### 监控与分析

#### 1. 构建时间分析

**Maven:**
```bash
mvn clean install -Dspeed  # Maven Profiler插件
```

**Vite:**
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({ open: true })
  ]
})
```

#### 2. 产物大小分析

**前端:**
使用`rollup-plugin-visualizer`生成可视化报告。

**后端:**
使用`maven-dependency-plugin`分析依赖:
```bash
mvn dependency:tree
mvn dependency:analyze
```

#### 3. 性能监控

**前端:**
- Lighthouse性能评分
- Web Vitals指标
- Bundle大小监控

**后端:**
- 启动时间监控
- 内存占用监控
- JAR包大小监控

## 常见问题

### 1. Maven编译速度慢

**问题原因:**
- 单线程编译
- 未使用依赖缓存
- 网络连接慢

**解决方案:**

```bash
# 1. 使用并行编译
mvn clean install -T 1C

# 2. 配置国内镜像
# settings.xml
<mirrors>
  <mirror>
    <id>huaweicloud</id>
    <url>https://mirrors.huaweicloud.com/repository/maven/</url>
    <mirrorOf>central</mirrorOf>
  </mirror>
</mirrors>

# 3. 增量编译
mvn install -pl ruoyi-system -am
```

### 2. Vite开发环境慢

**问题原因:**
- 依赖未预构建
- 大型依赖未优化
- HMR配置不当

**解决方案:**

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    // 强制预构建大型依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'echarts'
    ]
  },
  server: {
    // 启用HMR
    hmr: true,
    // 监听文件变化
    watch: {
      usePolling: false
    }
  }
})
```

### 3. 生产构建体积过大

**问题原因:**
- 未启用代码分割
- 未移除未使用代码
- 未压缩资源

**解决方案:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts']
        }
      }
    },
    // 压缩选项
    minify: 'esbuild',
    // 移除console
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

**启用Gzip/Brotli压缩:**
```typescript
// vite/plugins/compression.ts
import compression from 'vite-plugin-compression'

export default () => {
  return [
    compression({ ext: '.gz' }),
    compression({ ext: '.br', algorithm: 'brotliCompress' })
  ]
}
```

### 4. Docker构建缓存失效

**问题原因:**
- Dockerfile层顺序不当
- 依赖文件频繁变化
- 未使用多阶段构建

**解决方案:**

```dockerfile
# 后端Dockerfile优化
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# 先复制pom文件(利用缓存)
COPY pom.xml .
COPY ruoyi-common/pom.xml ruoyi-common/
COPY ruoyi-modules/pom.xml ruoyi-modules/
RUN mvn dependency:go-offline -B

# 再复制源码
COPY . .
RUN mvn clean package -T 1C -DskipTests

# 运行阶段
FROM eclipse-temurin:21-jre-alpine
COPY --from=builder /app/ruoyi-admin/target/*.jar /app/app.jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

**前端Dockerfile优化:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

# 先安装依赖(利用缓存)
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 再复制源码
COPY . .
RUN pnpm build:prod

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 5. UniApp小程序包体积超限

**问题原因:**
- 未使用分包
- 图片未优化
- 依赖过大

**解决方案:**

**1. 配置分包:**
```json
// pages.json
{
  "subPackages": [
    {
      "root": "pages-sub/user",
      "pages": [
        { "path": "profile/index" },
        { "path": "settings/index" }
      ]
    }
  ]
}
```

**2. 图片优化:**
```typescript
// 使用CDN
const imageUrl = 'https://cdn.example.com/image.jpg'

// 小图标使用base64
const iconData = 'data:image/png;base64,...'
```

**3. 按需加载依赖:**
```typescript
// 异步导入大型库
const echarts = await import('echarts')
```

### 6. CI/CD构建超时

**问题原因:**
- 未使用缓存
- 网络速度慢
- 构建步骤串行

**解决方案:**

**1. 配置缓存:**
```yaml
# GitHub Actions
- uses: actions/cache@v4
  with:
    path: |
      ~/.m2/repository
      ~/.pnpm-store
    key: ${{ runner.os }}-deps-${{ hashFiles('**/*.lock', '**/pom.xml') }}
```

**2. 并行构建:**
```yaml
jobs:
  backend:
    runs-on: ubuntu-latest
    steps: [...]

  frontend:
    runs-on: ubuntu-latest
    steps: [...]

  # 后端和前端并行执行
```

**3. 使用自托管Runner:**
```yaml
runs-on: self-hosted  # 使用本地Runner,网络速度快
```

### 7. Source Map占用过多空间

**问题原因:**
- 生产环境未关闭Source Map
- Source Map未分离

**解决方案:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: process.env.NODE_ENV !== 'production',  // 生产环境关闭
    // 或使用hidden模式(生成但不引用)
    // sourcemap: 'hidden'
  }
})
```

**后端:**
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <debug>false</debug>  <!-- 关闭调试信息 -->
    </configuration>
</plugin>
```

## 总结

构建优化是一个持续迭代的过程,需要根据项目实际情况选择合适的优化策略:

**后端构建优化核心:**
- 多模块并行编译
- 依赖管理和缓存
- 分层JAR和Docker优化
- 测试和资源过滤策略

**前端构建优化核心:**
- Vite极速HMR和预构建
- 代码分割和懒加载
- 资源压缩和Tree Shaking
- 插件自动化和优化

**UniApp构建优化核心:**
- 条件编译减少冗余代码
- 分包和预加载策略
- 资源优化和CDN
- 多平台构建适配

**CI/CD构建优化核心:**
- Docker多阶段构建
- 缓存策略和并行执行
- 增量构建和制品管理
- 监控和性能分析

通过综合应用这些优化策略,RuoYi-Plus-UniApp项目的构建效率可提升60%以上,产物体积可减小40%以上,开发体验和生产性能都得到显著改善。
