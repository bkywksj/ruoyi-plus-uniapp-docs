# 媒体处理模块 (ruoyi-common-media)

## 1. 模块概述

ruoyi-common-media 是一个功能强大的媒体处理模块,提供了图片处理、GIF动画生成、二维码生成和海报制作等核心功能。该模块基于 Builder 设计模式,提供流畅的链式调用 API,支持多种输入源和输出格式,适用于各种媒体处理场景。

**核心特性:**

- **图片处理 (ImageBuilder)** - 支持图片缩放、裁剪、旋转、翻转、水印添加、滤镜效果等丰富的图片处理功能
- **GIF动画生成 (GifBuilder)** - 支持从多张图片创建 GIF 动画,可配置帧延迟、循环次数、背景色等参数
- **二维码生成 (QrCodeBuilder)** - 基于 ZXing 库实现二维码生成,支持自定义尺寸、颜色、边距,可嵌入 Logo
- **海报制作 (PosterBuilder)** - 支持动态海报生成,可添加文本、图片、二维码、几何图形等多种元素
- **Builder 模式** - 所有功能都采用 Builder 模式,支持方法链式调用,代码简洁优雅
- **多种输入源** - 支持 File、URL、InputStream、byte[] 等多种输入源
- **多种输出格式** - 支持 BufferedImage、byte[]、InputStream、文件保存、HTTP 响应等多种输出方式
- **高性能处理** - 基于 Thumbnailator 库实现高质量图片处理,性能优异

### 1.1 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| ZXing | 3.5.3 | Google 开源的二维码生成库 |
| Thumbnailator | 0.4.20 | 高性能图片处理库 |
| Java AWT | - | 原生图形绘制支持 |

### 1.2 Maven 依赖

```xml
<dependency>
    <groupId>plus.ruoyi</groupId>
    <artifactId>ruoyi-common-media</artifactId>
</dependency>
```

模块已自动配置,无需额外配置即可使用。

### 1.3 模块结构

```
ruoyi-common-media/
├── builder/                    # Builder 构建器
│   ├── ImageBuilder.java      # 图片处理构建器
│   ├── GifBuilder.java        # GIF 动画构建器
│   ├── QrCodeBuilder.java     # 二维码构建器
│   └── PosterBuilder.java     # 海报构建器
├── enums/                     # 枚举类型
│   ├── OutputFormat.java      # 输出格式枚举
│   ├── PosterItemType.java    # 海报元素类型
│   └── ResizeMode.java        # 缩放模式
├── model/                     # 数据模型
│   └── PosterItem.java        # 海报元素模型
├── options/                   # 配置选项
│   ├── QrCodeOptions.java     # 二维码配置
│   ├── WatermarkOptions.java  # 水印配置
│   ├── FilterOptions.java     # 滤镜配置
│   └── AnimationOptions.java  # 动画配置
├── utils/                     # 工具类
│   ├── ImageUtils.java        # 图片处理工具
│   ├── GifUtils.java          # GIF 工具
│   ├── QrCodeUtils.java       # 二维码工具
│   ├── PosterUtils.java       # 海报工具
│   ├── ColorUtils.java        # 颜色工具
│   └── FontUtils.java         # 字体工具
└── exception/                 # 异常类
    └── MediaException.java    # 媒体处理异常
```

## 2. 图片处理 (ImageBuilder)

ImageBuilder 提供了强大的图片处理能力,支持缩放、裁剪、旋转、水印、滤镜等多种操作。

### 2.1 初始化方式

ImageBuilder 支持多种初始化方式,可以从文件路径、URL、字节数组、输入流或已有的 BufferedImage 创建。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;
import java.awt.image.BufferedImage;

// 方式1: 从文件路径初始化
ImageBuilder builder1 = ImageBuilder.of("/path/to/image.jpg");

// 方式2: 从 URL 初始化
ImageBuilder builder2 = ImageBuilder.of("https://example.com/image.jpg");

// 方式3: 从字节数组初始化
byte[] imageBytes = ...;
ImageBuilder builder3 = ImageBuilder.of(imageBytes);

// 方式4: 从输入流初始化
InputStream inputStream = ...;
ImageBuilder builder4 = ImageBuilder.of(inputStream);

// 方式5: 从 BufferedImage 初始化
BufferedImage bufferedImage = ...;
ImageBuilder builder5 = ImageBuilder.of(bufferedImage);
```

**使用说明:**
- 所有初始化方法都是静态工厂方法,使用 `ImageBuilder.of()` 创建实例
- URL 方式支持 HTTP/HTTPS 协议,会自动下载图片
- 字节数组和输入流方式适合处理已加载到内存的图片数据
- BufferedImage 方式适合处理已经解码的图片对象

### 2.2 图片缩放

支持多种缩放模式,包括固定尺寸、等比缩放、保持宽高比等。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;
import plus.ruoyi.common.media.enums.ResizeMode;

// 示例1: 固定尺寸缩放
BufferedImage resized = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.EXACT)
    .build();

// 示例2: 保持宽高比缩放(按宽度)
BufferedImage scaled = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.FIT_TO_WIDTH)
    .build();

// 示例3: 保持宽高比缩放(按高度)
BufferedImage scaledHeight = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.FIT_TO_HEIGHT)
    .build();

// 示例4: 按比例缩放
BufferedImage percentage = ImageBuilder.of("/path/to/image.jpg")
    .scale(0.5) // 缩放到原尺寸的50%
    .build();

// 示例5: 宽度固定,高度自适应
BufferedImage autoHeight = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 0, ResizeMode.AUTO)
    .build();
```

**ResizeMode 说明:**

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `EXACT` | 精确缩放到指定尺寸 | 需要固定尺寸的场景 |
| `FIT_TO_WIDTH` | 宽度固定,高度等比缩放 | 列表展示、宽度受限场景 |
| `FIT_TO_HEIGHT` | 高度固定,宽度等比缩放 | 高度受限场景 |
| `AUTO` | 自动选择最佳缩放方式 | 保持宽高比的通用场景 |

### 2.3 图片裁剪

支持按坐标裁剪和居中裁剪两种方式。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;

// 示例1: 按坐标裁剪
BufferedImage cropped = ImageBuilder.of("/path/to/image.jpg")
    .crop(100, 100, 400, 300) // x, y, width, height
    .build();

// 示例2: 居中裁剪为正方形
BufferedImage square = ImageBuilder.of("/path/to/image.jpg")
    .cropCenter(500, 500) // 裁剪为 500x500 的正方形
    .build();

// 示例3: 先缩放再裁剪(生成缩略图的常见做法)
BufferedImage thumbnail = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .cropCenter(400, 400)
    .build();

// 示例4: 裁剪头像
BufferedImage avatar = ImageBuilder.of("/path/to/user-photo.jpg")
    .cropCenter(200, 200)
    .build();
```

**使用说明:**
- `crop(x, y, width, height)`: 从坐标 (x, y) 开始裁剪指定宽高的区域
- `cropCenter(width, height)`: 从图片中心裁剪指定宽高的区域
- 裁剪区域不能超出原图边界,否则会抛出异常
- 居中裁剪常用于生成头像、缩略图等场景

### 2.4 图片旋转

支持任意角度旋转图片。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;

// 示例1: 旋转90度(顺时针)
BufferedImage rotated90 = ImageBuilder.of("/path/to/image.jpg")
    .rotate(90)
    .build();

// 示例2: 旋转180度
BufferedImage rotated180 = ImageBuilder.of("/path/to/image.jpg")
    .rotate(180)
    .build();

// 示例3: 旋转270度(相当于逆时针90度)
BufferedImage rotated270 = ImageBuilder.of("/path/to/image.jpg")
    .rotate(270)
    .build();

// 示例4: 旋转任意角度
BufferedImage rotated45 = ImageBuilder.of("/path/to/image.jpg")
    .rotate(45.5)
    .build();

// 示例5: 组合操作 - 先缩放再旋转
BufferedImage processed = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .rotate(90)
    .build();
```

**使用说明:**
- 旋转角度为顺时针方向,支持小数
- 旋转后图片尺寸可能会改变(非90度倍数时)
- 旋转会保持图片质量,不会产生锯齿

### 2.5 图片翻转

支持水平翻转和垂直翻转。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;

// 示例1: 水平翻转(镜像)
BufferedImage flippedH = ImageBuilder.of("/path/to/image.jpg")
    .flipHorizontal()
    .build();

// 示例2: 垂直翻转(上下颠倒)
BufferedImage flippedV = ImageBuilder.of("/path/to/image.jpg")
    .flipVertical()
    .build();

// 示例3: 同时水平和垂直翻转(相当于旋转180度)
BufferedImage flippedBoth = ImageBuilder.of("/path/to/image.jpg")
    .flipHorizontal()
    .flipVertical()
    .build();

// 示例4: 组合操作 - 先旋转再翻转
BufferedImage combined = ImageBuilder.of("/path/to/image.jpg")
    .rotate(90)
    .flipHorizontal()
    .build();
```

**使用说明:**
- 水平翻转创建镜像效果,常用于对称图案处理
- 垂直翻转创建倒影效果
- 翻转操作不会改变图片尺寸
- 可以与其他操作组合使用

### 2.6 文字水印

支持添加文字水印,可自定义字体、颜色、位置、透明度等。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;
import plus.ruoyi.common.media.options.WatermarkOptions;
import java.awt.*;

// 示例1: 简单文字水印
BufferedImage withWatermark = ImageBuilder.of("/path/to/image.jpg")
    .addTextWatermark("版权所有 © 2024",
        new Font("微软雅黑", Font.BOLD, 36),
        Color.WHITE,
        100, 100, // x, y 坐标
        0.7f) // 透明度 (0.0-1.0)
    .build();

// 示例2: 使用 WatermarkOptions 配置
WatermarkOptions options = new WatermarkOptions();
options.setText("RuoYi-Plus");
options.setFontName("Arial");
options.setFontSize(48);
options.setFontStyle(Font.BOLD);
options.setColor(Color.WHITE);
options.setX(50);
options.setY(50);
options.setAlpha(0.8f);

BufferedImage watermarked = ImageBuilder.of("/path/to/image.jpg")
    .addWatermark(options)
    .build();

// 示例3: 右下角水印
BufferedImage bottomRight = ImageBuilder.of("/path/to/image.jpg")
    .addTextWatermark("保密文件",
        new Font("宋体", Font.PLAIN, 24),
        new Color(255, 0, 0, 128), // 半透明红色
        -150, -50, // 负数表示从右下角计算
        1.0f)
    .build();

// 示例4: 多个水印
BufferedImage multiWatermark = ImageBuilder.of("/path/to/image.jpg")
    .addTextWatermark("顶部水印", new Font("微软雅黑", Font.BOLD, 32),
        Color.WHITE, 100, 50, 0.6f)
    .addTextWatermark("底部水印", new Font("微软雅黑", Font.BOLD, 28),
        Color.LIGHT_GRAY, 100, -50, 0.5f)
    .build();
```

**使用说明:**
- 透明度范围: 0.0(完全透明) - 1.0(完全不透明)
- 坐标支持负数,负数表示从右下角开始计算
- Color 可以指定 RGBA 四个通道,实现半透明效果
- 可以添加多个水印,按添加顺序依次绘制

### 2.7 图片水印

支持添加图片水印,可指定位置、尺寸和透明度。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;
import plus.ruoyi.common.media.options.WatermarkOptions;

// 示例1: 简单图片水印
BufferedImage withLogoWatermark = ImageBuilder.of("/path/to/image.jpg")
    .addImageWatermark("/path/to/logo.png",
        50, 50, // x, y 坐标
        150, 150, // width, height
        0.8f) // 透明度
    .build();

// 示例2: 使用 WatermarkOptions 配置
WatermarkOptions options = new WatermarkOptions();
options.setImagePath("https://example.com/logo.png");
options.setX(20);
options.setY(20);
options.setWidth(100);
options.setHeight(100);
options.setAlpha(0.7f);

BufferedImage watermarked = ImageBuilder.of("/path/to/image.jpg")
    .addWatermark(options)
    .build();

// 示例3: 右下角 Logo 水印
BufferedImage cornerLogo = ImageBuilder.of("/path/to/image.jpg")
    .addImageWatermark("/path/to/logo.png",
        -180, -180, // 右下角偏移
        150, 150,
        0.9f)
    .build();

// 示例4: 平铺水印
BufferedImage tiled = ImageBuilder.of("/path/to/image.jpg")
    .tileWatermark("/path/to/watermark.png",
        200, 200, // 每个水印间距
        0.3f) // 透明度
    .build();

// 示例5: 组合水印(文字 + 图片)
BufferedImage combined = ImageBuilder.of("/path/to/image.jpg")
    .addImageWatermark("/path/to/logo.png", 50, 50, 100, 100, 0.8f)
    .addTextWatermark("版权所有", new Font("微软雅黑", Font.BOLD, 24),
        Color.WHITE, 160, 100, 0.8f)
    .build();
```

**使用说明:**
- 图片水印支持 PNG、JPG、GIF 等常见格式
- PNG 格式的水印可以保留透明通道
- 水印图片可以是本地文件或 URL
- 可以同时添加多个水印(文字和图片混合)

### 2.8 滤镜效果

支持灰度、亮度、对比度、模糊等滤镜效果。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;
import plus.ruoyi.common.media.options.FilterOptions;

// 示例1: 灰度滤镜(黑白效果)
BufferedImage grayscale = ImageBuilder.of("/path/to/image.jpg")
    .grayscale()
    .build();

// 示例2: 调整亮度
BufferedImage brighter = ImageBuilder.of("/path/to/image.jpg")
    .brightness(1.5f) // 增加50%亮度
    .build();

BufferedImage darker = ImageBuilder.of("/path/to/image.jpg")
    .brightness(0.7f) // 降低30%亮度
    .build();

// 示例3: 调整对比度
BufferedImage highContrast = ImageBuilder.of("/path/to/image.jpg")
    .contrast(1.8f) // 增加对比度
    .build();

// 示例4: 模糊效果
BufferedImage blurred = ImageBuilder.of("/path/to/image.jpg")
    .blur(5) // 模糊半径
    .build();

// 示例5: 锐化效果
BufferedImage sharpened = ImageBuilder.of("/path/to/image.jpg")
    .sharpen()
    .build();

// 示例6: 复古效果(组合滤镜)
BufferedImage vintage = ImageBuilder.of("/path/to/image.jpg")
    .grayscale()
    .brightness(0.9f)
    .contrast(1.2f)
    .build();

// 示例7: 使用 FilterOptions 配置
FilterOptions filterOptions = new FilterOptions();
filterOptions.setGrayscale(true);
filterOptions.setBrightness(1.2f);
filterOptions.setContrast(1.1f);

BufferedImage filtered = ImageBuilder.of("/path/to/image.jpg")
    .applyFilter(filterOptions)
    .build();
```

**使用说明:**
- 亮度参数: 1.0 为原始亮度,小于 1.0 变暗,大于 1.0 变亮
- 对比度参数: 1.0 为原始对比度,小于 1.0 降低,大于 1.0 增强
- 模糊半径越大,模糊效果越明显
- 多个滤镜可以叠加使用,创建复杂效果

### 2.9 输出方式

ImageBuilder 支持多种输出方式,适应不同的使用场景。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;
import java.awt.image.BufferedImage;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import jakarta.servlet.http.HttpServletResponse;

// 方式1: 输出为 BufferedImage
BufferedImage image = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .build();

// 方式2: 输出为字节数组
byte[] imageBytes = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .toBytes();

// 方式3: 输出为 InputStream
InputStream inputStream = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .toInputStream();

// 方式4: 保存为文件
ImageBuilder.of("/path/to/input.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .save("/path/to/output.jpg");

// 方式5: 写入输出流
ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .writeTo(outputStream);

// 方式6: 直接输出到 HTTP 响应
public void downloadImage(HttpServletResponse response) {
    ImageBuilder.of("/path/to/image.jpg")
        .resize(800, 600, ResizeMode.AUTO)
        .toResponse(response);
}

// 方式7: 指定输出格式
ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .format(OutputFormat.PNG) // 指定输出为 PNG 格式
    .save("/path/to/output.png");
```

**使用说明:**
- `build()`: 返回 BufferedImage,适合后续继续处理
- `toBytes()`: 返回字节数组,适合存储到数据库或内存
- `toInputStream()`: 返回输入流,适合上传到 OSS
- `save(path)`: 保存为文件,自动创建父目录
- `writeTo(stream)`: 写入输出流,内存友好
- `toResponse()`: 直接输出到 HTTP 响应,适合图片下载

### 2.10 完整示例

以下是一个综合性的图片处理示例,演示了多种功能的组合使用。

```java
import plus.ruoyi.common.media.builder.ImageBuilder;
import plus.ruoyi.common.media.enums.OutputFormat;
import plus.ruoyi.common.media.enums.ResizeMode;
import java.awt.*;

/**
 * 图片处理服务示例
 */
public class ImageProcessingService {

    /**
     * 生成商品缩略图
     * - 缩放到指定尺寸
     * - 添加水印
     * - 输出为 JPG 格式
     */
    public byte[] generateProductThumbnail(String imageUrl) {
        return ImageBuilder.of(imageUrl)
            .resize(400, 400, ResizeMode.EXACT)
            .addTextWatermark("商品图",
                new Font("微软雅黑", Font.BOLD, 20),
                new Color(255, 255, 255, 180),
                -80, -30, 0.8f)
            .format(OutputFormat.JPG)
            .toBytes();
    }

    /**
     * 生成用户头像
     * - 居中裁剪为正方形
     * - 缩放到指定尺寸
     * - 输出为 PNG 格式(保留透明通道)
     */
    public void generateAvatar(String inputPath, String outputPath) {
        ImageBuilder.of(inputPath)
            .cropCenter(500, 500)
            .resize(200, 200, ResizeMode.EXACT)
            .format(OutputFormat.PNG)
            .save(outputPath);
    }

    /**
     * 生成证件照
     * - 调整尺寸为标准证件照规格
     * - 转换为白底
     * - 增强对比度
     */
    public byte[] generateIDPhoto(String imageUrl) {
        return ImageBuilder.of(imageUrl)
            .resize(295, 413, ResizeMode.EXACT) // 1寸证件照尺寸
            .brightness(1.1f)
            .contrast(1.2f)
            .format(OutputFormat.JPG)
            .toBytes();
    }

    /**
     * 生成文章封面
     * - 按比例缩放
     * - 添加半透明遮罩
     * - 添加标题文字
     * - 添加 Logo 水印
     */
    public void generateArticleCover(String imageUrl, String title, String outputPath) {
        ImageBuilder.of(imageUrl)
            .resize(1200, 630, ResizeMode.EXACT) // 社交媒体分享规格
            .brightness(0.7f) // 降低亮度作为遮罩效果
            .addTextWatermark(title,
                new Font("微软雅黑", Font.BOLD, 72),
                Color.WHITE,
                100, 350, 1.0f)
            .addImageWatermark("/path/to/logo.png",
                -150, -150, 100, 100, 0.9f)
            .format(OutputFormat.JPG)
            .save(outputPath);
    }

    /**
     * 批量处理图片
     * - 统一尺寸
     * - 添加水印
     * - 批量保存
     */
    public void batchProcess(List<String> imageUrls, String outputDir) {
        for (int i = 0; i < imageUrls.size(); i++) {
            ImageBuilder.of(imageUrls.get(i))
                .resize(800, 600, ResizeMode.AUTO)
                .addTextWatermark("© 版权所有",
                    new Font("Arial", Font.BOLD, 24),
                    Color.WHITE, -120, -40, 0.7f)
                .save(outputDir + "/image_" + i + ".jpg");
        }
    }
}
```

## 3. GIF 动画生成 (GifBuilder)

GifBuilder 提供了创建 GIF 动画的能力,支持从多张图片生成动画,可配置帧延迟、循环次数等参数。

### 3.1 基本用法

```java
import plus.ruoyi.common.media.builder.GifBuilder;

// 示例1: 从图片文件创建 GIF
GifBuilder.of(600, 400) // 指定 GIF 尺寸
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .addFrame("/path/to/frame3.jpg")
    .delay(500) // 每帧延迟 500ms
    .loop(0) // 无限循环
    .save("/path/to/output.gif");

// 示例2: 从 URL 加载图片创建 GIF
GifBuilder.of(800, 600)
    .addFrame("https://example.com/image1.jpg")
    .addFrame("https://example.com/image2.jpg")
    .addFrame("https://example.com/image3.jpg")
    .delay(1000) // 每帧延迟 1s
    .save("/path/to/output.gif");

// 示例3: 从逗号分隔的 URL 批量添加帧
String imageUrls = "https://example.com/1.jpg,https://example.com/2.jpg,https://example.com/3.jpg";
GifBuilder.of(400, 300)
    .addFrame(imageUrls) // 自动分割并添加
    .delay(800)
    .save("/path/to/output.gif");

// 示例4: 从 BufferedImage 添加帧
BufferedImage frame1 = ...;
BufferedImage frame2 = ...;
GifBuilder.of(600, 400)
    .addFrame(frame1)
    .addFrame(frame2)
    .delay(500)
    .save("/path/to/output.gif");
```

**使用说明:**
- GIF 尺寸由 `of(width, height)` 指定,所有帧会自动缩放到此尺寸
- 帧延迟单位为毫秒(ms)
- 循环次数: 0 表示无限循环,其他值表示循环指定次数
- 支持 JPG、PNG、GIF 等常见图片格式作为帧

### 3.2 批量添加帧

```java
import plus.ruoyi.common.media.builder.GifBuilder;
import java.awt.image.BufferedImage;
import java.util.List;

// 示例1: 批量添加文件路径
List<String> framePaths = Arrays.asList(
    "/path/to/frame1.jpg",
    "/path/to/frame2.jpg",
    "/path/to/frame3.jpg"
);
GifBuilder.of(600, 400)
    .addFrames(framePaths)
    .delay(500)
    .save("/path/to/output.gif");

// 示例2: 批量添加 BufferedImage
List<BufferedImage> frames = new ArrayList<>();
frames.add(ImageBuilder.of("/path/to/1.jpg").build());
frames.add(ImageBuilder.of("/path/to/2.jpg").build());
frames.add(ImageBuilder.of("/path/to/3.jpg").build());

GifBuilder.of(400, 300)
    .addFrames(frames)
    .delay(800)
    .save("/path/to/output.gif");

// 示例3: 从目录加载所有图片
File directory = new File("/path/to/frames");
File[] imageFiles = directory.listFiles((dir, name) ->
    name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".png"));

GifBuilder builder = GifBuilder.of(800, 600);
for (File file : imageFiles) {
    builder.addFrame(file.getAbsolutePath());
}
builder.delay(1000).save("/path/to/output.gif");
```

**使用说明:**
- `addFrames()` 方法支持批量添加,提高代码简洁性
- 支持混合使用不同格式的图片
- 建议图片尺寸接近 GIF 目标尺寸,避免过度缩放

### 3.3 高级配置

```java
import plus.ruoyi.common.media.builder.GifBuilder;
import plus.ruoyi.common.media.options.AnimationOptions;
import java.awt.Color;

// 示例1: 设置背景颜色
GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.png") // PNG 可能有透明区域
    .addFrame("/path/to/frame2.png")
    .backgroundColor(Color.WHITE) // 透明区域填充白色
    .delay(500)
    .save("/path/to/output.gif");

// 示例2: 设置图像质量
GifBuilder.of(800, 600)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .quality(0.9f) // 质量 0.0-1.0,越高质量越好但文件越大
    .delay(1000)
    .save("/path/to/output.gif");

// 示例3: 设置循环次数
GifBuilder.of(400, 300)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(800)
    .loop(5) // 循环播放 5 次后停止
    .save("/path/to/output.gif");

// 示例4: 使用 AnimationOptions 配置
AnimationOptions options = new AnimationOptions();
options.setWidth(600);
options.setHeight(400);
options.setDelay(500);
options.setLoop(0);
options.setBackgroundColor(Color.BLACK);
options.setQuality(0.8f);

GifBuilder builder = GifBuilder.of(options.getWidth(), options.getHeight())
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(options.getDelay())
    .loop(options.getLoop())
    .backgroundColor(options.getBackgroundColor())
    .quality(options.getQuality());

builder.save("/path/to/output.gif");
```

**配置说明:**

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `width` / `height` | GIF 尺寸(像素) | 必须指定 |
| `delay` | 帧延迟(毫秒) | 100ms |
| `loop` | 循环次数 | 0(无限循环) |
| `backgroundColor` | 背景颜色 | 透明 |
| `quality` | 图像质量(0.0-1.0) | 0.8 |

### 3.4 帧管理

```java
import plus.ruoyi.common.media.builder.GifBuilder;

// 示例1: 清除所有帧
GifBuilder builder = GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg");

builder.clearFrames(); // 清除所有帧
builder.addFrame("/path/to/new-frame.jpg")
    .save("/path/to/output.gif");

// 示例2: 动态添加帧
GifBuilder builder2 = GifBuilder.of(400, 300);

// 根据条件添加不同的帧
if (condition1) {
    builder2.addFrame("/path/to/frame-a.jpg");
} else {
    builder2.addFrame("/path/to/frame-b.jpg");
}

builder2.addFrame("/path/to/frame-c.jpg")
    .delay(500)
    .save("/path/to/output.gif");

// 示例3: 重复添加同一帧(创建停顿效果)
GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame1.jpg") // 重复添加
    .addFrame("/path/to/frame1.jpg") // 创建停顿效果
    .addFrame("/path/to/frame2.jpg")
    .delay(200)
    .save("/path/to/output.gif");
```

**使用说明:**
- `clearFrames()`: 清除所有已添加的帧,可以重新开始
- 重复添加同一帧可以创建停顿或慢动作效果
- 动态添加帧适合根据业务逻辑生成不同的动画

### 3.5 输出方式

```java
import plus.ruoyi.common.media.builder.GifBuilder;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

// 方式1: 保存为文件
GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(500)
    .save("/path/to/output.gif");

// 方式2: 输出为字节数组
byte[] gifBytes = GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(500)
    .toBytes();

// 方式3: 输出为 InputStream
InputStream inputStream = GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(500)
    .toInputStream();

// 方式4: 写入输出流
ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(500)
    .writeTo(outputStream);

// 方式5: 上传到 OSS
public String uploadGifToOss(List<String> frameUrls) {
    InputStream gifStream = GifBuilder.of(800, 600)
        .addFrames(frameUrls)
        .delay(1000)
        .toInputStream();

    // 上传到 OSS
    return ossService.upload(gifStream, "animation.gif");
}
```

### 3.6 完整示例

```java
import plus.ruoyi.common.media.builder.GifBuilder;
import plus.ruoyi.common.media.builder.ImageBuilder;
import java.awt.Color;

/**
 * GIF 动画生成服务示例
 */
public class GifAnimationService {

    /**
     * 生成产品展示动画
     * - 多角度产品图转换为 GIF
     */
    public byte[] generateProductAnimation(List<String> productImages) {
        return GifBuilder.of(800, 800)
            .addFrames(productImages)
            .delay(800)
            .loop(0)
            .backgroundColor(Color.WHITE)
            .quality(0.9f)
            .toBytes();
    }

    /**
     * 生成加载动画
     * - 使用预定义的加载帧
     */
    public void generateLoadingAnimation(String outputPath) {
        GifBuilder.of(100, 100)
            .addFrame("/assets/loading/frame1.png")
            .addFrame("/assets/loading/frame2.png")
            .addFrame("/assets/loading/frame3.png")
            .addFrame("/assets/loading/frame4.png")
            .delay(150)
            .loop(0)
            .save(outputPath);
    }

    /**
     * 生成图片轮播 GIF
     * - 从 URL 列表创建
     * - 添加渐变效果
     */
    public byte[] generateImageCarousel(String imageUrlsCsv) {
        return GifBuilder.of(1200, 630)
            .addFrame(imageUrlsCsv) // 逗号分隔的 URL
            .delay(2000) // 每张停留 2 秒
            .loop(0)
            .backgroundColor(Color.BLACK)
            .toBytes();
    }

    /**
     * 生成教程步骤动画
     * - 截图转换为步骤演示
     */
    public void generateTutorialAnimation(List<String> stepImages, String outputPath) {
        GifBuilder builder = GifBuilder.of(1000, 750);

        for (String stepImage : stepImages) {
            // 每个步骤重复 3 帧,创建停顿效果
            builder.addFrame(stepImage)
                   .addFrame(stepImage)
                   .addFrame(stepImage);
        }

        builder.delay(300)
               .loop(0)
               .save(outputPath);
    }

    /**
     * 生成进度条动画
     * - 动态生成帧
     */
    public byte[] generateProgressAnimation() {
        GifBuilder builder = GifBuilder.of(400, 50);

        // 生成 10 个进度帧
        for (int i = 0; i <= 10; i++) {
            // 使用 ImageBuilder 动态生成每一帧
            BufferedImage frame = createProgressFrame(i * 10); // 0%, 10%, 20%...100%
            builder.addFrame(frame);
        }

        return builder.delay(200)
                      .loop(1) // 只播放一次
                      .toBytes();
    }

    private BufferedImage createProgressFrame(int percentage) {
        // 创建进度条图片逻辑
        // ...
        return progressImage;
    }
}
```

## 4. 二维码生成 (QrCodeBuilder)

QrCodeBuilder 基于 Google ZXing 库实现二维码生成,支持自定义尺寸、颜色、边距,可嵌入 Logo。

### 4.1 基本用法

```java
import plus.ruoyi.common.media.builder.QrCodeBuilder;
import java.awt.image.BufferedImage;

// 示例1: 生成简单二维码
BufferedImage qrCode = QrCodeBuilder.of("https://ruoyi.plus")
    .build();

// 示例2: 指定尺寸生成
BufferedImage qrCode300 = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300) // 300x300 像素
    .build();

// 示例3: 保存为文件
QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .save("/path/to/qrcode.png");

// 示例4: 输出为字节数组
byte[] qrCodeBytes = QrCodeBuilder.of("https://ruoyi.plus")
    .size(500)
    .toBytes();

// 示例5: 中文内容二维码
BufferedImage chineseQr = QrCodeBuilder.of("联系我们:13800138000")
    .size(300)
    .build();
```

**使用说明:**
- 默认尺寸为 300x300 像素
- 默认颜色为黑色前景、白色背景
- 默认边距(Margin)为 1
- 支持中文内容,自动使用 UTF-8 编码

### 4.2 自定义颜色

```java
import plus.ruoyi.common.media.builder.QrCodeBuilder;
import java.awt.Color;

// 示例1: 红色二维码
BufferedImage redQr = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .foregroundColor(Color.RED)
    .build();

// 示例2: 蓝底白字二维码
BufferedImage blueQr = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .foregroundColor(Color.WHITE)
    .backgroundColor(Color.BLUE)
    .build();

// 示例3: 使用 RGB 颜色
BufferedImage customQr = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .foregroundColor(new Color(51, 102, 153)) // 自定义蓝色
    .backgroundColor(new Color(255, 255, 240)) // 象牙白
    .build();

// 示例4: 渐变色效果(通过后处理实现)
BufferedImage gradientQr = QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .foregroundColor(new Color(138, 43, 226)) // 蓝紫色
    .build();
```

**使用说明:**
- 前景色建议使用深色,背景色使用浅色,保证对比度
- 避免使用过于接近的颜色,影响扫描识别率
- 彩色二维码可能影响某些扫描设备的识别

### 4.3 设置边距

```java
import plus.ruoyi.common.media.builder.QrCodeBuilder;

// 示例1: 无边距二维码
BufferedImage noMargin = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .margin(0)
    .build();

// 示例2: 大边距二维码
BufferedImage largeMargin = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .margin(4) // 边距为 4 个单元格
    .build();

// 示例3: 默认边距(推荐)
BufferedImage defaultMargin = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .margin(1) // 默认值
    .build();
```

**边距说明:**
- 边距单位为二维码的单元格数量
- 推荐边距为 1-2,保证扫描器能识别边界
- 边距为 0 可能影响扫描成功率
- 边距过大会浪费空间

### 4.4 嵌入 Logo

支持在二维码中心嵌入 Logo,提升品牌识别度。

```java
import plus.ruoyi.common.media.builder.QrCodeBuilder;

// 示例1: 嵌入本地 Logo
BufferedImage qrWithLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .logo("/path/to/logo.png")
    .build();

// 示例2: 嵌入远程 Logo
BufferedImage qrWithUrlLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .logo("https://example.com/logo.png")
    .build();

// 示例3: 自定义 Logo 尺寸
BufferedImage qrWithCustomLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(500)
    .logo("/path/to/logo.png")
    .logoSize(100) // Logo 尺寸 100x100
    .build();

// 示例4: Logo 边框
BufferedImage qrWithLogoBorder = QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .logo("/path/to/logo.png")
    .logoSize(80)
    .logoBorderWidth(3) // Logo 白色边框宽度
    .build();

// 示例5: 保存带 Logo 的二维码
QrCodeBuilder.of("https://ruoyi.plus")
    .size(500)
    .logo("/path/to/company-logo.png")
    .logoSize(100)
    .logoBorderWidth(5)
    .save("/path/to/qrcode-with-logo.png");
```

**Logo 使用建议:**
- Logo 尺寸不应超过二维码的 20%,避免影响扫描
- 推荐使用 PNG 格式 Logo,支持透明背景
- Logo 边框可以提高可识别性
- Logo 应该是正方形或接近正方形

### 4.5 容错级别

二维码支持四个容错级别,级别越高,允许的损坏面积越大。

```java
import plus.ruoyi.common.media.builder.QrCodeBuilder;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

// 示例1: L 级别 - 7% 容错率
BufferedImage qrL = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .errorCorrectionLevel(ErrorCorrectionLevel.L)
    .build();

// 示例2: M 级别 - 15% 容错率(默认)
BufferedImage qrM = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .errorCorrectionLevel(ErrorCorrectionLevel.M)
    .build();

// 示例3: Q 级别 - 25% 容错率
BufferedImage qrQ = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .errorCorrectionLevel(ErrorCorrectionLevel.Q)
    .build();

// 示例4: H 级别 - 30% 容错率(推荐用于带 Logo)
BufferedImage qrH = QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .errorCorrectionLevel(ErrorCorrectionLevel.H)
    .logo("/path/to/logo.png")
    .build();
```

**容错级别说明:**

| 级别 | 容错率 | 适用场景 |
|------|--------|----------|
| L | 7% | 环境良好,无遮挡 |
| M | 15% | 一般场景(默认) |
| Q | 25% | 可能有轻微损坏 |
| H | 30% | 嵌入 Logo、打印场景 |

**使用建议:**
- 嵌入 Logo 时建议使用 H 级别
- 打印到纸张时建议使用 Q 或 H 级别
- 纯数字展示可使用 L 或 M 级别

### 4.6 输出方式

```java
import plus.ruoyi.common.media.builder.QrCodeBuilder;
import java.awt.image.BufferedImage;
import java.io.InputStream;

// 方式1: 输出为 BufferedImage
BufferedImage qrImage = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .build();

// 方式2: 输出为字节数组
byte[] qrBytes = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .toBytes();

// 方式3: 输出为 InputStream
InputStream qrStream = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .toInputStream();

// 方式4: 保存为文件
QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .save("/path/to/qrcode.png");

// 方式5: 写入输出流
ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .writeTo(outputStream);

// 方式6: 输出到 HTTP 响应
public void downloadQrCode(HttpServletResponse response) {
    QrCodeBuilder.of("https://ruoyi.plus")
        .size(500)
        .toResponse(response);
}
```

### 4.7 完整示例

```java
import plus.ruoyi.common.media.builder.QrCodeBuilder;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import java.awt.Color;

/**
 * 二维码生成服务示例
 */
public class QrCodeService {

    /**
     * 生成网站二维码
     */
    public byte[] generateWebsiteQrCode(String url) {
        return QrCodeBuilder.of(url)
            .size(300)
            .margin(1)
            .build()
            .toBytes();
    }

    /**
     * 生成带 Logo 的企业二维码
     */
    public void generateCompanyQrCode(String content, String logoPath, String outputPath) {
        QrCodeBuilder.of(content)
            .size(500)
            .errorCorrectionLevel(ErrorCorrectionLevel.H)
            .logo(logoPath)
            .logoSize(100)
            .logoBorderWidth(5)
            .save(outputPath);
    }

    /**
     * 生成彩色二维码
     */
    public byte[] generateColorfulQrCode(String content) {
        return QrCodeBuilder.of(content)
            .size(400)
            .foregroundColor(new Color(51, 102, 153))
            .backgroundColor(Color.WHITE)
            .margin(2)
            .toBytes();
    }

    /**
     * 生成微信二维码(带 Logo)
     */
    public byte[] generateWeChatQrCode(String wechatId) {
        return QrCodeBuilder.of("weixin://contacts/profile/" + wechatId)
            .size(430)
            .errorCorrectionLevel(ErrorCorrectionLevel.H)
            .logo("/assets/wechat-logo.png")
            .logoSize(86)
            .logoBorderWidth(4)
            .foregroundColor(new Color(9, 187, 7)) // 微信绿
            .toBytes();
    }

    /**
     * 生成支付二维码
     */
    public byte[] generatePaymentQrCode(String paymentUrl) {
        return QrCodeBuilder.of(paymentUrl)
            .size(600)
            .errorCorrectionLevel(ErrorCorrectionLevel.H)
            .margin(2)
            .toBytes();
    }

    /**
     * 批量生成二维码
     */
    public void batchGenerateQrCodes(Map<String, String> contentMap, String outputDir) {
        contentMap.forEach((filename, content) -> {
            QrCodeBuilder.of(content)
                .size(300)
                .save(outputDir + "/" + filename + ".png");
        });
    }

    /**
     * 生成 VCard 联系人二维码
     */
    public byte[] generateVCardQrCode(String name, String phone, String email) {
        String vcard = "BEGIN:VCARD\n" +
                      "VERSION:3.0\n" +
                      "FN:" + name + "\n" +
                      "TEL:" + phone + "\n" +
                      "EMAIL:" + email + "\n" +
                      "END:VCARD";

        return QrCodeBuilder.of(vcard)
            .size(400)
            .errorCorrectionLevel(ErrorCorrectionLevel.M)
            .toBytes();
    }

    /**
     * 生成 WiFi 连接二维码
     */
    public byte[] generateWiFiQrCode(String ssid, String password, String encryption) {
        // WIFI:T:WPA;S:MySSID;P:MyPassword;;
        String wifi = String.format("WIFI:T:%s;S:%s;P:%s;;",
            encryption, ssid, password);

        return QrCodeBuilder.of(wifi)
            .size(350)
            .errorCorrectionLevel(ErrorCorrectionLevel.H)
            .toBytes();
    }
}
```

## 5. 海报生成 (PosterBuilder)

PosterBuilder 提供了动态海报生成能力,支持添加文本、图片、二维码、几何图形等多种元素,适用于商品海报、活动海报、分享卡片等场景。

### 5.1 基本用法

```java
import plus.ruoyi.common.media.builder.PosterBuilder;
import java.awt.Color;

// 示例1: 创建纯色背景海报
BufferedImage poster1 = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .build();

// 示例2: 创建图片背景海报
BufferedImage poster2 = PosterBuilder.of("https://example.com/bg.jpg", 800, 1200)
    .build();

// 示例3: 指定背景颜色
BufferedImage poster3 = PosterBuilder.of(Color.LIGHT_GRAY, 800, 1200)
    .build();

// 示例4: 保存海报
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .save("/path/to/poster.png");
```

**使用说明:**
- 尺寸单位为像素
- 默认输出格式为 PNG
- 支持本地文件和 URL 作为背景图
- 背景图会自动缩放到海报尺寸

### 5.2 常用尺寸快捷方法

PosterBuilder 提供了常用尺寸的快捷创建方法。

```java
import plus.ruoyi.common.media.builder.PosterBuilder;

// 示例1: A4 纸张比例(210:297)
BufferedImage a4Poster = PosterBuilder.ofA4(1.0) // 600x848
    .build();

BufferedImage a4Large = PosterBuilder.ofA4(2.0) // 1200x1696
    .build();

// 示例2: 正方形海报
BufferedImage squarePoster = PosterBuilder.ofSquare(800) // 800x800
    .build();

// 示例3: 16:9 宽屏比例
BufferedImage widePoster = PosterBuilder.of16x9(1920) // 1920x1080
    .build();

// 示例4: 4:3 经典比例
BufferedImage classicPoster = PosterBuilder.of4x3(1024) // 1024x768
    .build();

// 示例5: 9:16 竖屏比例(移动端)
BufferedImage mobilePoster = PosterBuilder.ofMobile(750) // 750x1334
    .build();
```

**尺寸建议:**

| 场景 | 推荐尺寸 | 方法 |
|------|----------|------|
| 朋友圈分享 | 800x800 | `ofSquare(800)` |
| 公众号封面 | 1920x1080 | `of16x9(1920)` |
| 小程序海报 | 750x1334 | `ofMobile(750)` |
| A4 打印 | 1200x1696 | `ofA4(2.0)` |
| Instagram | 1080x1080 | `ofSquare(1080)` |

### 5.3 添加文本元素

```java
import plus.ruoyi.common.media.builder.PosterBuilder;
import java.awt.*;

// 示例1: 添加简单文本
BufferedImage textPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addText("欢迎使用 RuoYi-Plus",
        new Font("微软雅黑", Font.BOLD, 48),
        Color.BLACK,
        100, 200) // x, y 坐标
    .build();

// 示例2: 使用简化的文本添加方法
BufferedImage simplePoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addText("促销活动", 48, "#FF0000", 100, 150)
    .build();

// 示例3: 指定字体名称
BufferedImage customFontPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addText("Hello World", "Arial", 60, "#333333", 100, 200)
    .build();

// 示例4: 添加居中文本
BufferedImage centerPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("标题居中显示", 64, "#000000", 200)
    .build();

// 示例5: 添加多行文本(自动换行)
BufferedImage multiLinePoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addMultiLineText(
        "这是一段很长的文本内容,需要自动换行显示在海报上,每行最大宽度为600像素。",
        32, "#333333",
        100, 300, // 起始坐标
        600, // 最大宽度
        50) // 行高
    .build();

// 示例6: 添加多个文本
BufferedImage multiTextPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("年终大促", 72, "#FF0000", 150)
    .addCenterText("全场5折起", 48, "#FF6600", 250)
    .addCenterText("限时三天", 36, "#999999", 330)
    .build();
```

**文本方法说明:**

| 方法 | 说明 | 适用场景 |
|------|------|----------|
| `addText()` | 指定字体对象添加文本 | 精确控制字体样式 |
| `addText(fontSize, color)` | 使用默认字体 | 快速添加文本 |
| `addText(fontName, fontSize)` | 指定字体名称 | 使用特定字体 |
| `addCenterText()` | 添加水平居中文本 | 标题、口号 |
| `addMultiLineText()` | 添加多行文本 | 长文本、说明 |

### 5.4 添加图片元素

```java
import plus.ruoyi.common.media.builder.PosterBuilder;

// 示例1: 添加矩形图片
BufferedImage imagePoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addImage("https://example.com/product.jpg",
        100, 300, // x, y
        600, 600) // width, height
    .build();

// 示例2: 添加圆形图片(头像)
BufferedImage avatarPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCircleImage("https://example.com/avatar.jpg",
        400, 200, // 中心坐标
        150) // 直径
    .build();

// 示例3: 添加居中图片
BufferedImage centerImagePoster = PosterBuilder.of(800, 1200)
    .background("https://example.com/bg.jpg", 800, 1200)
    .addCenterImage("https://example.com/logo.png",
        100, // y 坐标
        400, 200) // width, height
    .build();

// 示例4: 添加多张图片
BufferedImage galleryPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addImage("https://example.com/img1.jpg", 50, 100, 350, 350)
    .addImage("https://example.com/img2.jpg", 400, 100, 350, 350)
    .addImage("https://example.com/img3.jpg", 50, 450, 350, 350)
    .addImage("https://example.com/img4.jpg", 400, 450, 350, 350)
    .build();
```

**图片方法说明:**

| 方法 | 说明 | 适用场景 |
|------|------|----------|
| `addImage()` | 添加矩形图片 | 商品图、内容图 |
| `addCircleImage()` | 添加圆形图片 | 用户头像、Logo |
| `addCenterImage()` | 添加水平居中图片 | 主图展示 |

### 5.5 添加二维码元素

```java
import plus.ruoyi.common.media.builder.PosterBuilder;

// 示例1: 添加二维码
BufferedImage qrPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addQrCode("https://ruoyi.plus",
        300, 900, // x, y
        200) // 尺寸
    .build();

// 示例2: 添加居中二维码
BufferedImage centerQrPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("扫码访问", 48, "#000000", 200)
    .addCenterQrCode("https://ruoyi.plus", 300, 250)
    .build();

// 示例3: 二维码 + 提示文字
BufferedImage qrWithTextPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterQrCode("https://ruoyi.plus", 800, 200)
    .addCenterText("长按识别二维码", 32, "#666666", 1050)
    .build();
```

### 5.6 添加几何图形

```java
import plus.ruoyi.common.media.builder.PosterBuilder;

// 示例1: 添加矩形(背景块)
BufferedImage rectPoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addRectangle(0, 0, 800, 300, "#FF5722") // 顶部色块
    .addCenterText("限时秒杀", 72, "#FFFFFF", 180)
    .build();

// 示例2: 添加圆形
BufferedImage circlePoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCircle(400, 600, 300, "#2196F3") // 装饰圆
    .addCenterText("NEW", 96, "#FFFFFF", 630)
    .build();

// 示例3: 多个几何图形组合
BufferedImage shapePoster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addRectangle(0, 0, 800, 200, "#FF5722") // 顶部条
    .addRectangle(0, 1000, 800, 200, "#FF5722") // 底部条
    .addCircle(100, 100, 80, "#FFFFFF") // 装饰圆
    .addCircle(700, 100, 80, "#FFFFFF")
    .build();
```

**几何图形用途:**
- 色块背景:突出标题区域
- 装饰元素:增加视觉效果
- 分隔线:区分不同内容区域

### 5.7 完整海报示例

以下是几个完整的海报生成示例,展示如何组合使用各种元素。

```java
import plus.ruoyi.common.media.builder.PosterBuilder;
import java.awt.Color;

/**
 * 海报生成服务示例
 */
public class PosterService {

    /**
     * 生成商品分享海报
     * - 商品图片
     * - 商品名称
     * - 价格信息
     * - 二维码
     */
    public byte[] generateProductSharePoster(Product product) {
        return PosterBuilder.of(750, 1334)
            .background(Color.WHITE)
            // 顶部商品图片
            .addCenterImage(product.getImageUrl(), 100, 600, 600)
            // 商品名称
            .addCenterText(product.getName(), 48, "#333333", 780)
            // 价格
            .addCenterText("¥" + product.getPrice(), 64, "#FF0000", 880)
            // 底部二维码
            .addCenterQrCode(product.getShareUrl(), 1000, 200)
            .addCenterText("长按识别查看详情", 28, "#999999", 1250)
            .toBytes();
    }

    /**
     * 生成活动海报
     * - 渐变背景
     * - 活动标题
     * - 活动时间
     * - 主视觉图片
     * - 二维码
     */
    public void generateEventPoster(Event event, String outputPath) {
        PosterBuilder.of("https://example.com/event-bg.jpg", 1080, 1920)
            // 顶部色块
            .addRectangle(0, 0, 1080, 400, "#FF5722")
            // 活动标题
            .addCenterText(event.getTitle(), 72, "#FFFFFF", 200)
            .addCenterText(event.getSubtitle(), 48, "#FFFFFF", 300)
            // 活动时间
            .addCenterText(event.getStartTime() + " - " + event.getEndTime(),
                32, "#FFFFFF", 360)
            // 主视觉图片
            .addCenterImage(event.getImageUrl(), 500, 900, 600)
            // 底部二维码
            .addCenterQrCode(event.getSignUpUrl(), 1600, 250)
            .addCenterText("扫码立即参与", 36, "#333333", 1870)
            .save(outputPath);
    }

    /**
     * 生成用户分享卡片
     * - 用户头像
     * - 用户昵称
     * - 成就信息
     * - 邀请二维码
     */
    public byte[] generateUserShareCard(User user) {
        return PosterBuilder.of(800, 1200)
            .background(new Color(245, 245, 245))
            // 顶部色块
            .addRectangle(0, 0, 800, 350, "#4CAF50")
            // 用户头像(圆形)
            .addCircleImage(user.getAvatarUrl(), 400, 200, 120)
            // 用户昵称
            .addCenterText(user.getNickname(), 48, "#FFFFFF", 300)
            // 成就信息
            .addCenterText("已学习 " + user.getLearnDays() + " 天",
                32, "#FFFFFF", 350)
            // 内容区域
            .addCenterText("邀请你一起学习", 42, "#333333", 500)
            .addCenterText("注册即送新人大礼包", 36, "#FF5722", 580)
            // 二维码
            .addCenterQrCode(user.getInviteUrl(), 700, 300)
            .addCenterText("扫码加入", 32, "#666666", 1050)
            .toBytes();
    }

    /**
     * 生成证书海报
     * - 证书背景
     * - 获奖人姓名
     * - 证书编号
     * - 日期
     */
    public void generateCertificate(String name, String certificateNo, String outputPath) {
        PosterBuilder.of("/assets/certificate-bg.jpg", 1920, 1080)
            // 获奖人姓名
            .addCenterText(name, 96, "#8B4513", 450)
            // 证书说明
            .addCenterText("完成了全部课程学习", 48, "#333333", 570)
            .addCenterText("特发此证,以资鼓励", 48, "#333333", 640)
            // 证书编号
            .addText("证书编号:" + certificateNo, 32, "#666666", 100, 1000)
            // 日期
            .addText("颁发日期:" + LocalDate.now(), 32, "#666666",
                -400, -80) // 右下角
            .save(outputPath);
    }

    /**
     * 生成课程封面
     * - 背景图片
     * - 半透明遮罩
     * - 课程标题
     * - 讲师信息
     * - 课程标签
     */
    public byte[] generateCourseCover(Course course) {
        return PosterBuilder.of(course.getBgImageUrl(), 1200, 630)
            // 半透明遮罩
            .addRectangle(0, 0, 1200, 630, "rgba(0,0,0,0.4)")
            // 课程标题
            .addText(course.getTitle(), "微软雅黑", 64, "#FFFFFF", 80, 280)
            // 讲师信息
            .addCircleImage(course.getTeacherAvatar(), 100, 400, 60)
            .addText(course.getTeacherName(), 32, "#FFFFFF", 180, 420)
            // 课程标签
            .addRectangle(80, 480, 200, 60, "#FF5722")
            .addText(course.getCategory(), 32, "#FFFFFF", 120, 520)
            .toBytes();
    }

    /**
     * 生成日签海报
     * - 日期
     * - 每日一句
     * - 装饰元素
     */
    public byte[] generateDailyPoster(String quote) {
        LocalDate today = LocalDate.now();
        return PosterBuilder.ofSquare(1080)
            .background(new Color(255, 250, 240))
            // 日期
            .addCenterText(today.getMonthValue() + "月", 48, "#999999", 200)
            .addCenterText(String.valueOf(today.getDayOfMonth()),
                180, "#333333", 380)
            // 每日一句
            .addMultiLineText(quote, 42, "#666666",
                100, 500, 880, 70)
            // 装饰圆
            .addCircle(100, 100, 40, "#FFB74D")
            .addCircle(980, 980, 40, "#FFB74D")
            .toBytes();
    }
}
```

### 5.8 输出方式

```java
import plus.ruoyi.common.media.builder.PosterBuilder;
import plus.ruoyi.common.media.enums.OutputFormat;

// 方式1: 输出为 BufferedImage
BufferedImage poster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("Hello", 72, "#000000", 600)
    .build();

// 方式2: 输出为字节数组
byte[] posterBytes = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("Hello", 72, "#000000", 600)
    .toBytes();

// 方式3: 输出为 InputStream
InputStream posterStream = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("Hello", 72, "#000000", 600)
    .toInputStream();

// 方式4: 保存为文件
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("Hello", 72, "#000000", 600)
    .save("/path/to/poster.png");

// 方式5: 写入输出流
ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("Hello", 72, "#000000", 600)
    .writeTo(outputStream);

// 方式6: 输出到 HTTP 响应
public void downloadPoster(HttpServletResponse response) {
    PosterBuilder.of(800, 1200)
        .background(Color.WHITE)
        .addCenterText("Hello", 72, "#000000", 600)
        .toResponse(response);
}

// 方式7: 指定输出格式
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("Hello", 72, "#000000", 600)
    .format(OutputFormat.JPG) // 指定 JPG 格式
    .save("/path/to/poster.jpg");
```

### 5.9 便利方法

```java
import plus.ruoyi.common.media.builder.PosterBuilder;
import java.awt.Dimension;

// 示例1: 清除所有元素
PosterBuilder builder = PosterBuilder.of(800, 1200)
    .addText("文本1", 48, "#000000", 100, 100)
    .addText("文本2", 48, "#000000", 100, 200);

builder.clear(); // 清除所有元素
builder.addText("新文本", 48, "#000000", 100, 100)
    .save("/path/to/poster.png");

// 示例2: 获取海报尺寸
PosterBuilder builder2 = PosterBuilder.of(800, 1200);
Dimension size = builder2.getSize();
System.out.println("宽度:" + size.width + ", 高度:" + size.height);

// 示例3: 获取元素数量
PosterBuilder builder3 = PosterBuilder.of(800, 1200)
    .addText("标题", 64, "#000000", 100, 100)
    .addImage("url", 100, 200, 600, 400)
    .addQrCode("https://ruoyi.plus", 300, 700, 200);

int count = builder3.getElementCount(); // 返回 3

// 示例4: 获取数据大小
PosterBuilder builder4 = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("Hello", 72, "#000000", 600);

long dataSize = builder4.getDataSize(); // 返回字节数
System.out.println("海报大小:" + dataSize + " 字节");
```

## 6. API 参考

### 6.1 ImageBuilder API

#### 初始化方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `of(String)` | 文件路径或URL | `ImageBuilder` | 从路径或URL创建 |
| `of(byte[])` | 字节数组 | `ImageBuilder` | 从字节数组创建 |
| `of(InputStream)` | 输入流 | `ImageBuilder` | 从输入流创建 |
| `of(BufferedImage)` | 图片对象 | `ImageBuilder` | 从图片对象创建 |

#### 图片操作方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `resize(int, int, ResizeMode)` | 宽,高,模式 | `ImageBuilder` | 缩放图片 |
| `scale(double)` | 缩放比例 | `ImageBuilder` | 按比例缩放 |
| `crop(int, int, int, int)` | x,y,宽,高 | `ImageBuilder` | 裁剪图片 |
| `cropCenter(int, int)` | 宽,高 | `ImageBuilder` | 居中裁剪 |
| `rotate(double)` | 角度 | `ImageBuilder` | 旋转图片 |
| `flipHorizontal()` | 无 | `ImageBuilder` | 水平翻转 |
| `flipVertical()` | 无 | `ImageBuilder` | 垂直翻转 |

#### 水印方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addTextWatermark(...)` | 文本,字体,颜色,坐标,透明度 | `ImageBuilder` | 添加文字水印 |
| `addImageWatermark(...)` | 图片路径,坐标,尺寸,透明度 | `ImageBuilder` | 添加图片水印 |
| `addWatermark(WatermarkOptions)` | 水印配置对象 | `ImageBuilder` | 使用配置对象添加水印 |

#### 滤镜方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `grayscale()` | 无 | `ImageBuilder` | 灰度滤镜 |
| `brightness(float)` | 亮度系数 | `ImageBuilder` | 调整亮度 |
| `contrast(float)` | 对比度系数 | `ImageBuilder` | 调整对比度 |
| `blur(int)` | 模糊半径 | `ImageBuilder` | 模糊效果 |
| `sharpen()` | 无 | `ImageBuilder` | 锐化效果 |
| `applyFilter(FilterOptions)` | 滤镜配置对象 | `ImageBuilder` | 应用滤镜配置 |

#### 输出方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `build()` | 无 | `BufferedImage` | 构建并返回图片对象 |
| `toBytes()` | 无 | `byte[]` | 转换为字节数组 |
| `toInputStream()` | 无 | `InputStream` | 转换为输入流 |
| `save(String)` | 文件路径 | `void` | 保存为文件 |
| `writeTo(OutputStream)` | 输出流 | `void` | 写入输出流 |
| `toResponse(HttpServletResponse)` | 响应对象 | `void` | 输出到HTTP响应 |
| `format(OutputFormat)` | 输出格式 | `ImageBuilder` | 设置输出格式 |

### 6.2 GifBuilder API

#### 初始化方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `of(int, int)` | 宽,高 | `GifBuilder` | 创建指定尺寸的GIF构建器 |

#### 帧管理方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addFrame(String)` | 文件路径/URL | `GifBuilder` | 添加单帧 |
| `addFrame(BufferedImage)` | 图片对象 | `GifBuilder` | 添加图片帧 |
| `addFrames(List)` | 帧列表 | `GifBuilder` | 批量添加帧 |
| `clearFrames()` | 无 | `GifBuilder` | 清除所有帧 |

#### 配置方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `delay(int)` | 延迟毫秒数 | `GifBuilder` | 设置帧延迟 |
| `loop(int)` | 循环次数 | `GifBuilder` | 设置循环次数(0=无限) |
| `backgroundColor(Color)` | 背景颜色 | `GifBuilder` | 设置背景颜色 |
| `quality(float)` | 质量(0.0-1.0) | `GifBuilder` | 设置图像质量 |

#### 输出方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `build()` | 无 | `BufferedImage` | 构建GIF |
| `toBytes()` | 无 | `byte[]` | 转换为字节数组 |
| `toInputStream()` | 无 | `InputStream` | 转换为输入流 |
| `save(String)` | 文件路径 | `void` | 保存为文件 |
| `writeTo(OutputStream)` | 输出流 | `void` | 写入输出流 |

### 6.3 QrCodeBuilder API

#### 初始化方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `of(String)` | 二维码内容 | `QrCodeBuilder` | 创建二维码构建器 |

#### 配置方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `size(int)` | 尺寸(像素) | `QrCodeBuilder` | 设置二维码尺寸 |
| `margin(int)` | 边距(单元格数) | `QrCodeBuilder` | 设置边距 |
| `foregroundColor(Color)` | 前景颜色 | `QrCodeBuilder` | 设置前景色 |
| `backgroundColor(Color)` | 背景颜色 | `QrCodeBuilder` | 设置背景色 |
| `errorCorrectionLevel(ErrorCorrectionLevel)` | 容错级别 | `QrCodeBuilder` | 设置容错级别 |

#### Logo 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `logo(String)` | Logo路径/URL | `QrCodeBuilder` | 设置Logo |
| `logoSize(int)` | Logo尺寸 | `QrCodeBuilder` | 设置Logo尺寸 |
| `logoBorderWidth(int)` | 边框宽度 | `QrCodeBuilder` | 设置Logo边框宽度 |

#### 输出方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `build()` | 无 | `BufferedImage` | 构建二维码 |
| `toBytes()` | 无 | `byte[]` | 转换为字节数组 |
| `toInputStream()` | 无 | `InputStream` | 转换为输入流 |
| `save(String)` | 文件路径 | `void` | 保存为文件 |
| `writeTo(OutputStream)` | 输出流 | `void` | 写入输出流 |
| `toResponse(HttpServletResponse)` | 响应对象 | `void` | 输出到HTTP响应 |

### 6.4 PosterBuilder API

#### 初始化方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `of(int, int)` | 宽,高 | `PosterBuilder` | 创建白色背景海报 |
| `of(String, int, int)` | 背景图URL,宽,高 | `PosterBuilder` | 创建图片背景海报 |
| `of(Color, int, int)` | 背景颜色,宽,高 | `PosterBuilder` | 创建纯色背景海报 |
| `ofA4(double)` | 缩放倍数 | `PosterBuilder` | 创建A4比例海报 |
| `ofSquare(int)` | 边长 | `PosterBuilder` | 创建正方形海报 |
| `of16x9(int)` | 宽度 | `PosterBuilder` | 创建16:9海报 |
| `of4x3(int)` | 宽度 | `PosterBuilder` | 创建4:3海报 |
| `ofMobile(int)` | 宽度 | `PosterBuilder` | 创建9:16海报 |

#### 背景方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `background(String)` | 背景图URL | `PosterBuilder` | 设置背景图片 |
| `background(Color)` | 背景颜色 | `PosterBuilder` | 设置背景颜色 |
| `format(OutputFormat)` | 输出格式 | `PosterBuilder` | 设置输出格式 |

#### 文本方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addText(...)` | 文本,字体,颜色,坐标 | `PosterBuilder` | 添加文本 |
| `addCenterText(...)` | 文本,字号,颜色,y坐标 | `PosterBuilder` | 添加居中文本 |
| `addMultiLineText(...)` | 文本,字号,颜色,坐标,宽度,行高 | `PosterBuilder` | 添加多行文本 |

#### 图片方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addImage(...)` | 图片URL,坐标,尺寸 | `PosterBuilder` | 添加矩形图片 |
| `addCircleImage(...)` | 图片URL,中心坐标,直径 | `PosterBuilder` | 添加圆形图片 |
| `addCenterImage(...)` | 图片URL,y坐标,尺寸 | `PosterBuilder` | 添加居中图片 |

#### 二维码方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addQrCode(...)` | 内容,坐标,尺寸 | `PosterBuilder` | 添加二维码 |
| `addCenterQrCode(...)` | 内容,y坐标,尺寸 | `PosterBuilder` | 添加居中二维码 |

#### 几何图形方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addRectangle(...)` | 坐标,尺寸,颜色 | `PosterBuilder` | 添加矩形 |
| `addCircle(...)` | 中心坐标,直径,颜色 | `PosterBuilder` | 添加圆形 |

#### 便利方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `clear()` | 无 | `PosterBuilder` | 清除所有元素 |
| `getSize()` | 无 | `Dimension` | 获取海报尺寸 |
| `getElementCount()` | 无 | `int` | 获取元素数量 |
| `getDataSize()` | 无 | `long` | 获取数据大小(字节) |

#### 输出方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `build()` | 无 | `BufferedImage` | 构建海报 |
| `toBytes()` | 无 | `byte[]` | 转换为字节数组 |
| `toInputStream()` | 无 | `InputStream` | 转换为输入流 |
| `save(String)` | 文件路径 | `void` | 保存为文件 |
| `writeTo(OutputStream)` | 输出流 | `void` | 写入输出流 |
| `toResponse(HttpServletResponse)` | 响应对象 | `void` | 输出到HTTP响应 |

### 6.5 枚举类型

#### OutputFormat (输出格式)

| 枚举值 | 扩展名 | MIME类型 | 说明 |
|--------|--------|----------|------|
| `JPG` | jpg | image/jpeg | JPEG格式 |
| `JPEG` | jpeg | image/jpeg | JPEG格式 |
| `PNG` | png | image/png | PNG格式 |
| `GIF` | gif | image/gif | GIF格式 |
| `WEBP` | webp | image/webp | WebP格式 |
| `BMP` | bmp | image/bmp | BMP格式 |

#### ResizeMode (缩放模式)

| 枚举值 | 说明 |
|--------|------|
| `EXACT` | 精确缩放到指定尺寸 |
| `FIT_TO_WIDTH` | 宽度固定,高度等比缩放 |
| `FIT_TO_HEIGHT` | 高度固定,宽度等比缩放 |
| `AUTO` | 自动选择最佳缩放方式 |

#### PosterItemType (海报元素类型)

| 枚举值 | 类型标识 | 说明 |
|--------|----------|------|
| `TEXT` | text | 文本元素 |
| `IMAGE` | image | 图片元素 |
| `QRCODE` | qrcode | 二维码元素 |
| `RECTANGLE` | rectangle | 矩形元素 |
| `CIRCLE` | circle | 圆形元素 |

**枚举方法:**
- `fromType(String)`: 根据类型标识符获取枚举值
- `isGeometry()`: 判断是否为几何图形类型
- `isMedia()`: 判断是否为媒体类型
- `isText()`: 判断是否为文本类型

## 7. 最佳实践

### 7.1 性能优化

```java
/**
 * 性能优化建议
 */
public class MediaPerformanceTips {

    /**
     * 1. 合理选择图片格式
     * - JPG: 适合照片,文件小
     * - PNG: 适合需要透明通道的图片
     * - WebP: 现代格式,体积更小(需浏览器支持)
     */
    public byte[] optimizeImageFormat(String imageUrl, boolean needTransparency) {
        ImageBuilder builder = ImageBuilder.of(imageUrl)
            .resize(800, 600, ResizeMode.AUTO);

        if (needTransparency) {
            return builder.format(OutputFormat.PNG).toBytes();
        } else {
            return builder.format(OutputFormat.JPG).toBytes();
        }
    }

    /**
     * 2. 避免重复构建
     * - 缓存构建结果
     * - 复用 Builder 对象
     */
    @Cacheable(value = "thumbnails", key = "#imageUrl + '-' + #size")
    public byte[] getCachedThumbnail(String imageUrl, int size) {
        return ImageBuilder.of(imageUrl)
            .resize(size, size, ResizeMode.EXACT)
            .toBytes();
    }

    /**
     * 3. 批处理优化
     * - 并行处理多张图片
     * - 使用流式 API
     */
    public List<byte[]> batchProcessImages(List<String> imageUrls) {
        return imageUrls.parallelStream()
            .map(url -> ImageBuilder.of(url)
                .resize(800, 600, ResizeMode.AUTO)
                .toBytes())
            .collect(Collectors.toList());
    }

    /**
     * 4. 内存管理
     * - 使用 try-with-resources 自动关闭流
     * - 及时释放大对象
     */
    public void processLargeImage(String inputPath, String outputPath) {
        ImageBuilder builder = null;
        try {
            builder = ImageBuilder.of(inputPath)
                .resize(2000, 2000, ResizeMode.AUTO);
            builder.save(outputPath);
        } finally {
            // 大对象处理完毕,建议显式置null帮助GC
            builder = null;
        }
    }

    /**
     * 5. 异步处理
     * - 耗时操作使用异步
     */
    @Async
    public CompletableFuture<String> generatePosterAsync(PosterRequest request) {
        byte[] posterBytes = PosterBuilder.of(800, 1200)
            .background(request.getBgUrl())
            .addCenterText(request.getTitle(), 64, "#000000", 200)
            .toBytes();

        String url = ossService.upload(posterBytes, "poster.png");
        return CompletableFuture.completedFuture(url);
    }
}
```

### 7.2 错误处理

```java
/**
 * 错误处理最佳实践
 */
public class MediaErrorHandling {

    /**
     * 1. 优雅处理异常
     */
    public byte[] safeProcessImage(String imageUrl) {
        try {
            return ImageBuilder.of(imageUrl)
                .resize(800, 600, ResizeMode.AUTO)
                .toBytes();
        } catch (MediaException e) {
            log.error("图片处理失败: {}", imageUrl, e);
            // 返回默认图片
            return getDefaultImage();
        }
    }

    /**
     * 2. 验证输入参数
     */
    public BufferedImage generateQrCode(String content) {
        if (StringUtils.isBlank(content)) {
            throw new IllegalArgumentException("二维码内容不能为空");
        }

        if (content.length() > 1000) {
            throw new IllegalArgumentException("二维码内容过长,最大1000字符");
        }

        return QrCodeBuilder.of(content)
            .size(300)
            .build();
    }

    /**
     * 3. 资源检查
     */
    public void generatePosterWithValidation(String bgUrl, String outputPath) {
        // 检查背景图是否存在
        if (!isUrlAccessible(bgUrl)) {
            throw new MediaException("背景图片不可访问: " + bgUrl);
        }

        // 检查输出路径是否可写
        File outputFile = new File(outputPath);
        if (outputFile.exists() && !outputFile.canWrite()) {
            throw new MediaException("输出路径不可写: " + outputPath);
        }

        PosterBuilder.of(bgUrl, 800, 1200)
            .addCenterText("Hello", 64, "#000000", 600)
            .save(outputPath);
    }

    /**
     * 4. 降级处理
     */
    public byte[] getImageWithFallback(String primaryUrl, String fallbackUrl) {
        try {
            return ImageBuilder.of(primaryUrl)
                .resize(800, 600, ResizeMode.AUTO)
                .toBytes();
        } catch (Exception e) {
            log.warn("主图片加载失败,使用备用图片: {}", primaryUrl);
            try {
                return ImageBuilder.of(fallbackUrl)
                    .resize(800, 600, ResizeMode.AUTO)
                    .toBytes();
            } catch (Exception ex) {
                log.error("备用图片也加载失败", ex);
                return getDefaultImage();
            }
        }
    }
}
```

### 7.3 资源管理

```java
/**
 * 资源管理最佳实践
 */
public class MediaResourceManagement {

    /**
     * 1. 上传到 OSS
     */
    public String uploadToOss(BufferedImage image, String fileName) {
        InputStream inputStream = null;
        try {
            // 转换为输入流
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", os);
            inputStream = new ByteArrayInputStream(os.toByteArray());

            // 上传到 OSS
            return ossService.upload(inputStream, fileName);
        } catch (IOException e) {
            throw new MediaException("上传图片失败", e);
        } finally {
            // 关闭流
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    log.error("关闭输入流失败", e);
                }
            }
        }
    }

    /**
     * 2. 文件路径管理
     */
    public String generateImagePath(String category, String filename) {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String extension = filename.substring(filename.lastIndexOf("."));

        return String.format("/uploads/%s/%s/%s%s", category, date, uuid, extension);
    }

    /**
     * 3. 临时文件清理
     */
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点执行
    public void cleanupTempFiles() {
        File tempDir = new File("/tmp/media");
        if (!tempDir.exists()) {
            return;
        }

        long oneDayAgo = System.currentTimeMillis() - 24 * 60 * 60 * 1000;
        File[] files = tempDir.listFiles();

        if (files != null) {
            for (File file : files) {
                if (file.lastModified() < oneDayAgo) {
                    boolean deleted = file.delete();
                    if (deleted) {
                        log.info("清理临时文件: {}", file.getName());
                    }
                }
            }
        }
    }
}
```

### 7.4 实际应用场景

```java
/**
 * 实际应用场景示例
 */
public class MediaApplicationScenarios {

    /**
     * 场景1: 电商商品图处理
     * - 生成多种规格的商品图
     * - 添加商城水印
     */
    public Map<String, String> processProductImage(String originalUrl) {
        Map<String, String> urls = new HashMap<>();

        // 原图(添加水印)
        byte[] original = ImageBuilder.of(originalUrl)
            .addImageWatermark("/assets/shop-logo.png", -120, -120, 80, 80, 0.7f)
            .toBytes();
        urls.put("original", ossService.upload(original, "original.jpg"));

        // 主图(800x800)
        byte[] main = ImageBuilder.of(originalUrl)
            .resize(800, 800, ResizeMode.EXACT)
            .addImageWatermark("/assets/shop-logo.png", -80, -80, 60, 60, 0.7f)
            .toBytes();
        urls.put("main", ossService.upload(main, "main.jpg"));

        // 缩略图(400x400)
        byte[] thumbnail = ImageBuilder.of(originalUrl)
            .resize(400, 400, ResizeMode.EXACT)
            .toBytes();
        urls.put("thumbnail", ossService.upload(thumbnail, "thumbnail.jpg"));

        // 小图(200x200)
        byte[] small = ImageBuilder.of(originalUrl)
            .resize(200, 200, ResizeMode.EXACT)
            .toBytes();
        urls.put("small", ossService.upload(small, "small.jpg"));

        return urls;
    }

    /**
     * 场景2: 社交分享海报
     * - 用户邀请海报
     * - 包含用户信息和二维码
     */
    public byte[] generateInvitePoster(User user, String inviteUrl) {
        return PosterBuilder.of(750, 1334)
            .background("https://example.com/invite-bg.jpg")
            // 用户头像
            .addCircleImage(user.getAvatarUrl(), 375, 200, 120)
            // 用户昵称
            .addCenterText(user.getNickname(), 48, "#FFFFFF", 350)
            // 邀请文案
            .addCenterText("邀请你加入我们", 42, "#FFFFFF", 450)
            .addCenterText("注册即送新人礼包", 36, "#FFD700", 520)
            // 邀请二维码
            .addCenterQrCode(inviteUrl, 700, 300)
            .addCenterText("扫码注册", 32, "#FFFFFF", 1050)
            // 品牌 Logo
            .addCenterImage("https://example.com/logo.png", 1150, 200, 100)
            .toBytes();
    }

    /**
     * 场景3: 批量生成证书
     * - 课程结业证书
     * - 批量处理学员信息
     */
    public void batchGenerateCertificates(List<Student> students, String courseTitle) {
        students.parallelStream().forEach(student -> {
            String certificateNo = "CERT" + System.currentTimeMillis();

            byte[] certificate = PosterBuilder.of("/assets/certificate-template.jpg", 1920, 1080)
                .addCenterText(student.getName(), 96, "#8B4513", 450)
                .addCenterText("完成了《" + courseTitle + "》的学习", 48, "#333333", 570)
                .addText("证书编号: " + certificateNo, 32, "#666666", 100, 1000)
                .addText("颁发日期: " + LocalDate.now(), 32, "#666666", 100, 1050)
                .toBytes();

            String url = ossService.upload(certificate, "certificate_" + student.getId() + ".png");

            // 发送证书链接给学员
            notificationService.sendCertificate(student.getEmail(), url);
        });
    }

    /**
     * 场景4: 动态二维码
     * - 活动报名二维码
     * - 带活动 Logo
     */
    public byte[] generateEventQrCode(Event event) {
        String qrContent = "https://example.com/event/" + event.getId();

        return QrCodeBuilder.of(qrContent)
            .size(500)
            .errorCorrectionLevel(ErrorCorrectionLevel.H)
            .logo(event.getLogoUrl())
            .logoSize(100)
            .logoBorderWidth(5)
            .foregroundColor(event.getThemeColor())
            .toBytes();
    }

    /**
     * 场景5: 自动生成文章封面
     * - 根据文章标题和分类
     * - 自动选择背景图
     */
    public String generateArticleCover(Article article) {
        String bgUrl = selectBackgroundByCategory(article.getCategory());

        byte[] cover = PosterBuilder.of(bgUrl, 1200, 630)
            .addRectangle(0, 0, 1200, 630, "rgba(0,0,0,0.5)") // 半透明遮罩
            .addMultiLineText(article.getTitle(),
                64, "#FFFFFF",
                100, 250,
                1000, 80)
            .addText(article.getCategory(), 32, "#FFD700", 100, 550)
            .addCircleImage(article.getAuthor().getAvatarUrl(), 1100, 550, 60)
            .toBytes();

        return ossService.upload(cover, "article_cover_" + article.getId() + ".jpg");
    }
}
```

## 8. 常见问题

### 8.1 图片处理相关

**问题1: 图片处理后模糊或失真**

**原因:**
- 缩放比例过大(放大图片)
- 使用了低质量的缩放算法
- 输出格式不合适

**解决方案:**

```java
// 1. 避免放大图片,如果必须放大,使用高质量算法
BufferedImage enlarged = ImageBuilder.of("/path/to/small-image.jpg")
    .resize(2000, 2000, ResizeMode.AUTO)
    .build();

// 2. 选择合适的输出格式
// PNG 适合需要透明通道或高质量的场景
BufferedImage highQuality = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .format(OutputFormat.PNG) // 使用 PNG 保持质量
    .build();

// 3. 照片使用 JPG,图标使用 PNG
BufferedImage photo = ImageBuilder.of("/path/to/photo.jpg")
    .resize(1200, 800, ResizeMode.AUTO)
    .format(OutputFormat.JPG) // 照片用 JPG
    .build();
```

**问题2: 内存溢出 (OutOfMemoryError)**

**原因:**
- 处理的图片尺寸过大
- 批量处理图片时未控制并发数
- 没有及时释放资源

**解决方案:**

```java
// 1. 分批处理大量图片
public void processManyImages(List<String> imageUrls) {
    int batchSize = 10;
    for (int i = 0; i < imageUrls.size(); i += batchSize) {
        int end = Math.min(i + batchSize, imageUrls.size());
        List<String> batch = imageUrls.subList(i, end);

        batch.forEach(url -> {
            ImageBuilder.of(url)
                .resize(800, 600, ResizeMode.AUTO)
                .save("/output/" + UUID.randomUUID() + ".jpg");
        });

        // 批次间暂停,等待 GC
        System.gc();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

// 2. 限制并行处理数量
public List<byte[]> parallelProcess(List<String> urls) {
    ForkJoinPool customPool = new ForkJoinPool(4); // 限制4个并行线程
    try {
        return customPool.submit(() ->
            urls.parallelStream()
                .map(url -> ImageBuilder.of(url)
                    .resize(800, 600, ResizeMode.AUTO)
                    .toBytes())
                .collect(Collectors.toList())
        ).get();
    } catch (Exception e) {
        throw new MediaException("批量处理失败", e);
    } finally {
        customPool.shutdown();
    }
}

// 3. 调整 JVM 内存参数
// -Xms512m -Xmx2048m -XX:MaxMetaspaceSize=256m
```

**问题3: 水印位置不准确**

**原因:**
- 没有考虑图片尺寸差异
- 负数坐标计算错误
- 字体大小导致文字超出边界

**解决方案:**

```java
// 1. 使用相对位置计算
public BufferedImage addAdaptiveWatermark(String imageUrl, String text) {
    BufferedImage original = ImageBuilder.of(imageUrl).build();
    int width = original.getWidth();
    int height = original.getHeight();

    // 水印位于图片宽度90%,高度95%的位置
    int x = (int)(width * 0.9);
    int y = (int)(height * 0.95);

    return ImageBuilder.of(original)
        .addTextWatermark(text,
            new Font("微软雅黑", Font.BOLD, width / 30), // 字体大小随图片缩放
            Color.WHITE,
            x - 100, y - 20, // 向左上偏移
            0.7f)
        .build();
}

// 2. 使用负数坐标从右下角计算
BufferedImage watermarked = ImageBuilder.of("/path/to/image.jpg")
    .addTextWatermark("© 版权所有",
        new Font("微软雅黑", Font.BOLD, 24),
        Color.WHITE,
        -150, -40, // 距离右下角 150px, 40px
        0.8f)
    .build();
```

### 8.2 GIF 动画相关

**问题1: GIF 文件过大**

**原因:**
- 帧数过多
- 每帧尺寸过大
- 质量设置过高

**解决方案:**

```java
// 1. 控制 GIF 尺寸和帧数
byte[] optimizedGif = GifBuilder.of(400, 300) // 降低尺寸
    .addFrame(frame1)
    .addFrame(frame3) // 跳过某些帧,减少帧数
    .addFrame(frame5)
    .delay(1000) // 增加延迟,减少帧数需求
    .quality(0.7f) // 降低质量
    .toBytes();

// 2. 压缩图片后再添加帧
List<BufferedImage> compressedFrames = originalFrames.stream()
    .map(frame -> ImageBuilder.of(frame)
        .resize(600, 400, ResizeMode.EXACT)
        .toBytes())
    .map(bytes -> ImageBuilder.of(bytes).build())
    .collect(Collectors.toList());

GifBuilder.of(600, 400)
    .addFrames(compressedFrames)
    .delay(500)
    .toBytes();
```

**问题2: GIF 播放速度不正确**

**原因:**
- 帧延迟设置不当
- 浏览器或播放器解析差异

**解决方案:**

```java
// 1. 设置合适的延迟时间
// 标准帧率参考:
// - 电影: 24 FPS → 约 42ms 延迟
// - 视频: 30 FPS → 约 33ms 延迟
// - 流畅动画: 60 FPS → 约 16ms 延迟
// - 一般动画: 10 FPS → 100ms 延迟

// 流畅动画(60FPS)
GifBuilder.of(400, 300)
    .addFrames(frames)
    .delay(16) // 60 FPS
    .toBytes();

// 一般动画(10FPS)
GifBuilder.of(400, 300)
    .addFrames(frames)
    .delay(100) // 10 FPS
    .toBytes();

// 2. 慢动作效果
GifBuilder.of(400, 300)
    .addFrames(frames)
    .delay(300) // 每帧停留 0.3 秒
    .toBytes();
```

### 8.3 二维码相关

**问题1: 二维码扫描失败**

**原因:**
- 前景色和背景色对比度不足
- 二维码尺寸过小
- 容错级别太低
- Logo 遮挡过多内容

**解决方案:**

```java
// 1. 确保足够的对比度
BufferedImage qr = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .foregroundColor(Color.BLACK) // 深色前景
    .backgroundColor(Color.WHITE) // 浅色背景
    .build();

// 2. 使用合适的尺寸(最小 200x200)
BufferedImage qr2 = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300) // 推荐 300 以上
    .build();

// 3. 嵌入 Logo 时使用高容错级别
BufferedImage qrWithLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(500)
    .errorCorrectionLevel(ErrorCorrectionLevel.H) // 最高容错
    .logo("/path/to/logo.png")
    .logoSize(80) // Logo 不超过二维码的 20%
    .build();

// 4. 添加边距
BufferedImage qr3 = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .margin(2) // 增加边距,默认为1
    .build();
```

**问题2: 中文内容乱码**

**原因:**
- 编码设置不正确

**解决方案:**

```java
// QrCodeBuilder 已自动使用 UTF-8 编码,直接使用即可
BufferedImage chineseQr = QrCodeBuilder.of("联系我们: 13800138000")
    .size(300)
    .build();

// 如果仍有问题,检查字符串编码
String content = new String("联系我们".getBytes(), StandardCharsets.UTF_8);
BufferedImage qr = QrCodeBuilder.of(content)
    .size(300)
    .build();
```

### 8.4 海报生成相关

**问题1: 文字超出边界或换行不正确**

**原因:**
- 文本过长
- 没有使用多行文本方法
- 坐标计算错误

**解决方案:**

```java
// 1. 使用多行文本自动换行
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addMultiLineText(
        "这是一段很长的文本,需要自动换行显示。系统会根据最大宽度自动分行。",
        32, "#333333",
        100, 300, // 起始坐标
        600, // 最大宽度,超过会换行
        50) // 行高
    .build();

// 2. 预先计算文本宽度
BufferedImage tempImage = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
Graphics2D g2d = tempImage.createGraphics();
Font font = new Font("微软雅黑", Font.BOLD, 48);
g2d.setFont(font);
FontMetrics metrics = g2d.getFontMetrics();
int textWidth = metrics.stringWidth("标题文字");
g2d.dispose();

// 如果文本过长,缩小字号或缩短文本
if (textWidth > 700) {
    font = new Font("微软雅黑", Font.BOLD, 36);
}

// 3. 使用居中文本避免手动计算
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("自动居中的标题", 64, "#000000", 200)
    .build();
```

**问题2: 图片加载失败**

**原因:**
- URL 无法访问
- 网络超时
- 图片格式不支持

**解决方案:**

```java
// 1. 添加重试机制
public BufferedImage loadImageWithRetry(String url, int maxRetries) {
    int retries = 0;
    Exception lastException = null;

    while (retries < maxRetries) {
        try {
            return ImageBuilder.of(url).build();
        } catch (Exception e) {
            lastException = e;
            retries++;
            try {
                Thread.sleep(1000 * retries); // 递增延迟
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }
    }

    throw new MediaException("加载图片失败,已重试" + maxRetries + "次", lastException);
}

// 2. 使用备用图片
public BufferedImage generatePosterSafe(String bgUrl, String fallbackBg) {
    try {
        return PosterBuilder.of(bgUrl, 800, 1200)
            .addCenterText("Hello", 64, "#000000", 600)
            .build();
    } catch (Exception e) {
        log.warn("主背景图加载失败,使用备用背景: {}", bgUrl);
        return PosterBuilder.of(fallbackBg, 800, 1200)
            .addCenterText("Hello", 64, "#000000", 600)
            .build();
    }
}

// 3. 预检查 URL
public boolean isImageUrlValid(String url) {
    try {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("HEAD");
        connection.setConnectTimeout(3000);
        connection.setReadTimeout(3000);
        int responseCode = connection.getResponseCode();
        return responseCode == 200;
    } catch (IOException e) {
        return false;
    }
}
```

**问题3: 海报生成慢**

**原因:**
- 远程图片加载耗时
- 海报元素过多
- 图片尺寸过大

**解决方案:**

```java
// 1. 缓存远程图片
@Cacheable(value = "remote-images", key = "#url")
public BufferedImage loadAndCacheImage(String url) {
    return ImageBuilder.of(url).build();
}

public BufferedImage generateFastPoster(String bgUrl) {
    BufferedImage bg = loadAndCacheImage(bgUrl); // 使用缓存

    return PosterBuilder.of(bg.getWidth(), bg.getHeight())
        .background(bg)
        .addCenterText("Hello", 64, "#000000", 600)
        .build();
}

// 2. 异步预加载图片
@Async
public CompletableFuture<Map<String, BufferedImage>> preloadImages(List<String> urls) {
    Map<String, BufferedImage> images = urls.stream()
        .collect(Collectors.toMap(
            url -> url,
            url -> ImageBuilder.of(url).build()
        ));
    return CompletableFuture.completedFuture(images);
}

// 3. 使用本地图片代替远程图片
// 将常用背景图、Logo等下载到本地,提高生成速度
PosterBuilder.of("/local/bg.jpg", 800, 1200)
    .addCenterImage("/local/logo.png", 100, 200, 100)
    .build();
```

## 9. 总结

ruoyi-common-media 模块提供了完整的媒体处理解决方案:

### 9.1 核心功能回顾

| 功能 | Builder类 | 主要用途 |
|------|-----------|----------|
| 图片处理 | `ImageBuilder` | 缩放、裁剪、旋转、水印、滤镜 |
| GIF动画 | `GifBuilder` | 多帧动画生成、参数配置 |
| 二维码 | `QrCodeBuilder` | 二维码生成、Logo嵌入 |
| 海报制作 | `PosterBuilder` | 动态海报、多元素组合 |

### 9.2 适用场景

**图片处理:**
- 商品图片批量处理
- 用户头像裁剪缩放
- 图片水印添加
- 证件照生成

**GIF动画:**
- 产品展示动画
- 教程步骤演示
- 加载动画制作
- 轮播图生成

**二维码:**
- 网址短链接
- 活动报名
- 支付收款
- 名片联系方式
- WiFi连接

**海报生成:**
- 商品分享海报
- 活动宣传海报
- 用户邀请卡片
- 课程封面
- 证书制作

### 9.3 技术优势

- ✅ **Builder模式** - 流畅的链式调用API
- ✅ **高性能** - 基于Thumbnailator和ZXing优秀库
- ✅ **多输入源** - 支持URL、文件、流、字节数组
- ✅ **多输出格式** - 支持PNG、JPG、GIF、WebP、BMP
- ✅ **功能丰富** - 覆盖常见媒体处理需求
- ✅ **易于使用** - 简洁的API设计,快速上手
- ✅ **高度灵活** - 支持各种组合操作

### 9.4 使用建议

1. **性能优化**: 合理选择图片格式,缓存处理结果,异步处理耗时操作
2. **错误处理**: 优雅处理异常,提供降级方案,验证输入参数
3. **资源管理**: 及时释放资源,使用OSS存储,定期清理临时文件
4. **最佳实践**: 参考本文档的完整示例,根据实际场景调整参数

通过本文档的学习,您应该能够熟练使用 ruoyi-common-media 模块完成各种媒体处理任务。如有更多疑问,请参考源码或联系技术支持。
