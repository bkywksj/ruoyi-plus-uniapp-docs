# 媒体处理模块 (ruoyi-common-media)

## 1. 模块概述

ruoyi-common-media 是一个功能强大的媒体处理模块,提供了图片处理、GIF动画生成、二维码生成和海报制作等核心功能。该模块基于 Builder 设计模式,提供流畅的链式调用 API,支持多种输入源和输出格式,适用于各种媒体处理场景。

**核心特性:**

- **图片处理 (ImageBuilder)** - 支持图片缩放、裁剪、旋转、翻转、水印添加、滤镜效果等丰富的图片处理功能
- **GIF动画生成 (GifBuilder)** - 支持从多张图片创建 GIF 动画,可配置帧延迟、循环次数、背景色等参数
- **二维码生成 (QrCodeBuilder)** - 基于 ZXing 库实现二维码生成,支持自定义尺寸、颜色、边距,可嵌入 Logo
- **海报制作 (PosterBuilder)** - 支持动态海报生成,可添加文本、图片、二维码、几何图形等多种元素
- **Builder 模式** - 所有功能都采用 Builder 模式,支持方法链式调用,代码简洁优雅
- **多种输入源** - 支持 File、URL、InputStream、`byte[]` 等多种输入源
- **多种输出格式** - 支持 BufferedImage、`byte[]`、InputStream、文件保存、HTTP 响应等多种输出方式
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

### 1.3 模块结构

```text
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

ImageBuilder 支持多种初始化方式:

```java
import plus.ruoyi.common.media.builder.ImageBuilder;

// 从文件路径初始化
ImageBuilder builder1 = ImageBuilder.of("/path/to/image.jpg");

// 从 URL 初始化
ImageBuilder builder2 = ImageBuilder.of("https://example.com/image.jpg");

// 从字节数组初始化
byte[] imageBytes = ...;
ImageBuilder builder3 = ImageBuilder.of(imageBytes);

// 从输入流初始化
InputStream inputStream = ...;
ImageBuilder builder4 = ImageBuilder.of(inputStream);

// 从 BufferedImage 初始化
BufferedImage bufferedImage = ...;
ImageBuilder builder5 = ImageBuilder.of(bufferedImage);
```

### 2.2 图片缩放

支持多种缩放模式:

```java
import plus.ruoyi.common.media.enums.ResizeMode;

// 固定尺寸缩放
BufferedImage resized = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.EXACT)
    .build();

// 保持宽高比缩放(按宽度)
BufferedImage scaled = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.FIT_TO_WIDTH)
    .build();

// 按比例缩放
BufferedImage percentage = ImageBuilder.of("/path/to/image.jpg")
    .scale(0.5) // 缩放到原尺寸的50%
    .build();

// 宽度固定,高度自适应
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

支持按坐标裁剪和居中裁剪:

```java
// 按坐标裁剪
BufferedImage cropped = ImageBuilder.of("/path/to/image.jpg")
    .crop(100, 100, 400, 300) // x, y, width, height
    .build();

// 居中裁剪为正方形
BufferedImage square = ImageBuilder.of("/path/to/image.jpg")
    .cropCenter(500, 500)
    .build();

// 先缩放再裁剪(生成缩略图)
BufferedImage thumbnail = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .cropCenter(400, 400)
    .build();
```

### 2.4 图片旋转与翻转

```java
// 旋转90度(顺时针)
BufferedImage rotated = ImageBuilder.of("/path/to/image.jpg")
    .rotate(90)
    .build();

// 旋转任意角度
BufferedImage rotated45 = ImageBuilder.of("/path/to/image.jpg")
    .rotate(45.5)
    .build();

// 水平翻转(镜像)
BufferedImage flippedH = ImageBuilder.of("/path/to/image.jpg")
    .flipHorizontal()
    .build();

// 垂直翻转
BufferedImage flippedV = ImageBuilder.of("/path/to/image.jpg")
    .flipVertical()
    .build();

// 组合操作
BufferedImage combined = ImageBuilder.of("/path/to/image.jpg")
    .rotate(90)
    .flipHorizontal()
    .build();
```

### 2.5 文字水印

```java
import java.awt.*;

// 简单文字水印
BufferedImage withWatermark = ImageBuilder.of("/path/to/image.jpg")
    .addTextWatermark("版权所有 © 2024",
        new Font("微软雅黑", Font.BOLD, 36),
        Color.WHITE,
        100, 100, // x, y 坐标
        0.7f) // 透明度 (0.0-1.0)
    .build();

// 右下角水印(负数表示从右下角计算)
BufferedImage bottomRight = ImageBuilder.of("/path/to/image.jpg")
    .addTextWatermark("保密文件",
        new Font("宋体", Font.PLAIN, 24),
        new Color(255, 0, 0, 128), // 半透明红色
        -150, -50,
        1.0f)
    .build();

// 多个水印
BufferedImage multiWatermark = ImageBuilder.of("/path/to/image.jpg")
    .addTextWatermark("顶部水印", new Font("微软雅黑", Font.BOLD, 32),
        Color.WHITE, 100, 50, 0.6f)
    .addTextWatermark("底部水印", new Font("微软雅黑", Font.BOLD, 28),
        Color.LIGHT_GRAY, 100, -50, 0.5f)
    .build();
```

### 2.6 图片水印

```java
// 简单图片水印
BufferedImage withLogoWatermark = ImageBuilder.of("/path/to/image.jpg")
    .addImageWatermark("/path/to/logo.png",
        50, 50, // x, y 坐标
        150, 150, // width, height
        0.8f) // 透明度
    .build();

// 右下角 Logo 水印
BufferedImage cornerLogo = ImageBuilder.of("/path/to/image.jpg")
    .addImageWatermark("/path/to/logo.png",
        -180, -180, // 右下角偏移
        150, 150,
        0.9f)
    .build();

// 平铺水印
BufferedImage tiled = ImageBuilder.of("/path/to/image.jpg")
    .tileWatermark("/path/to/watermark.png",
        200, 200, // 每个水印间距
        0.3f) // 透明度
    .build();

// 组合水印(文字 + 图片)
BufferedImage combined = ImageBuilder.of("/path/to/image.jpg")
    .addImageWatermark("/path/to/logo.png", 50, 50, 100, 100, 0.8f)
    .addTextWatermark("版权所有", new Font("微软雅黑", Font.BOLD, 24),
        Color.WHITE, 160, 100, 0.8f)
    .build();
```

### 2.7 滤镜效果

```java
// 灰度滤镜(黑白效果)
BufferedImage grayscale = ImageBuilder.of("/path/to/image.jpg")
    .grayscale()
    .build();

// 调整亮度
BufferedImage brighter = ImageBuilder.of("/path/to/image.jpg")
    .brightness(1.5f) // 增加50%亮度
    .build();

// 调整对比度
BufferedImage highContrast = ImageBuilder.of("/path/to/image.jpg")
    .contrast(1.8f)
    .build();

// 模糊效果
BufferedImage blurred = ImageBuilder.of("/path/to/image.jpg")
    .blur(5) // 模糊半径
    .build();

// 锐化效果
BufferedImage sharpened = ImageBuilder.of("/path/to/image.jpg")
    .sharpen()
    .build();

// 复古效果(组合滤镜)
BufferedImage vintage = ImageBuilder.of("/path/to/image.jpg")
    .grayscale()
    .brightness(0.9f)
    .contrast(1.2f)
    .build();
```

**滤镜参数说明:**
- 亮度: 1.0 为原始亮度,小于 1.0 变暗,大于 1.0 变亮
- 对比度: 1.0 为原始对比度,小于 1.0 降低,大于 1.0 增强
- 模糊半径越大,模糊效果越明显

### 2.8 输出方式

```java
import plus.ruoyi.common.media.enums.OutputFormat;

// 输出为 BufferedImage
BufferedImage image = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .build();

// 输出为字节数组
byte[] imageBytes = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .toBytes();

// 输出为 InputStream
InputStream inputStream = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .toInputStream();

// 保存为文件
ImageBuilder.of("/path/to/input.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .save("/path/to/output.jpg");

// 写入输出流
ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .writeTo(outputStream);

// 直接输出到 HTTP 响应
public void downloadImage(HttpServletResponse response) {
    ImageBuilder.of("/path/to/image.jpg")
        .resize(800, 600, ResizeMode.AUTO)
        .toResponse(response);
}

// 指定输出格式
ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .format(OutputFormat.PNG)
    .save("/path/to/output.png");
```

### 2.9 完整示例

```java
/**
 * 图片处理服务示例
 */
public class ImageProcessingService {

    /**
     * 生成商品缩略图
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
     */
    public void generateAvatar(String inputPath, String outputPath) {
        ImageBuilder.of(inputPath)
            .cropCenter(500, 500)
            .resize(200, 200, ResizeMode.EXACT)
            .format(OutputFormat.PNG)
            .save(outputPath);
    }

    /**
     * 批量处理图片
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

// 从图片文件创建 GIF
GifBuilder.of(600, 400) // 指定 GIF 尺寸
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .addFrame("/path/to/frame3.jpg")
    .delay(500) // 每帧延迟 500ms
    .loop(0) // 无限循环
    .save("/path/to/output.gif");

// 从 URL 加载图片创建 GIF
GifBuilder.of(800, 600)
    .addFrame("https://example.com/image1.jpg")
    .addFrame("https://example.com/image2.jpg")
    .delay(1000)
    .save("/path/to/output.gif");

// 从逗号分隔的 URL 批量添加帧
String imageUrls = "https://example.com/1.jpg,https://example.com/2.jpg";
GifBuilder.of(400, 300)
    .addFrame(imageUrls) // 自动分割并添加
    .delay(800)
    .save("/path/to/output.gif");
```

### 3.2 批量添加帧

```java
// 批量添加文件路径
List<String> framePaths = Arrays.asList(
    "/path/to/frame1.jpg",
    "/path/to/frame2.jpg",
    "/path/to/frame3.jpg"
);
GifBuilder.of(600, 400)
    .addFrames(framePaths)
    .delay(500)
    .save("/path/to/output.gif");

// 批量添加 BufferedImage
List<BufferedImage> frames = new ArrayList<>();
frames.add(ImageBuilder.of("/path/to/1.jpg").build());
frames.add(ImageBuilder.of("/path/to/2.jpg").build());
GifBuilder.of(400, 300)
    .addFrames(frames)
    .delay(800)
    .save("/path/to/output.gif");

// 从目录加载所有图片
File directory = new File("/path/to/frames");
File[] imageFiles = directory.listFiles((dir, name) ->
    name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".png"));

GifBuilder builder = GifBuilder.of(800, 600);
for (File file : imageFiles) {
    builder.addFrame(file.getAbsolutePath());
}
builder.delay(1000).save("/path/to/output.gif");
```

### 3.3 高级配置

```java
// 设置背景颜色
GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.png")
    .addFrame("/path/to/frame2.png")
    .backgroundColor(Color.WHITE) // 透明区域填充白色
    .delay(500)
    .save("/path/to/output.gif");

// 设置图像质量
GifBuilder.of(800, 600)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .quality(0.9f) // 质量 0.0-1.0
    .delay(1000)
    .save("/path/to/output.gif");

// 设置循环次数
GifBuilder.of(400, 300)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(800)
    .loop(5) // 循环播放 5 次后停止
    .save("/path/to/output.gif");
```

**配置说明:**

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `width` / `height` | GIF 尺寸(像素) | 必须指定 |
| `delay` | 帧延迟(毫秒) | 100ms |
| `loop` | 循环次数 | 0(无限循环) |
| `backgroundColor` | 背景颜色 | 透明 |
| `quality` | 图像质量(0.0-1.0) | 0.8 |

### 3.4 帧管理与输出

```java
// 清除所有帧
GifBuilder builder = GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg");
builder.clearFrames(); // 清除所有帧

// 重复添加同一帧(创建停顿效果)
GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame1.jpg") // 重复添加创建停顿
    .addFrame("/path/to/frame2.jpg")
    .delay(200)
    .save("/path/to/output.gif");

// 输出为字节数组
byte[] gifBytes = GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(500)
    .toBytes();

// 输出为 InputStream
InputStream gifStream = GifBuilder.of(600, 400)
    .addFrame("/path/to/frame1.jpg")
    .addFrame("/path/to/frame2.jpg")
    .delay(500)
    .toInputStream();
```

### 3.5 完整示例

```java
/**
 * GIF 动画服务示例
 */
public class GifAnimationService {

    /**
     * 生成产品展示 GIF
     */
    public byte[] generateProductGif(List<String> productImages) {
        return GifBuilder.of(600, 600)
            .addFrames(productImages)
            .delay(1500) // 每帧停留 1.5 秒
            .loop(0)
            .backgroundColor(Color.WHITE)
            .quality(0.9f)
            .toBytes();
    }

    /**
     * 生成加载动画
     */
    public void generateLoadingGif(String outputPath) {
        List<BufferedImage> frames = new ArrayList<>();

        for (int i = 0; i < 8; i++) {
            BufferedImage frame = new BufferedImage(100, 100, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = frame.createGraphics();

            // 绘制圆弧动画
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.setColor(new Color(66, 133, 244));
            g2d.setStroke(new BasicStroke(6));
            g2d.drawArc(15, 15, 70, 70, i * 45, 90);

            g2d.dispose();
            frames.add(frame);
        }

        GifBuilder.of(100, 100)
            .addFrames(frames)
            .delay(100)
            .loop(0)
            .backgroundColor(Color.WHITE)
            .save(outputPath);
    }
}
```

## 4. 二维码生成 (QrCodeBuilder)

QrCodeBuilder 基于 ZXing 库实现二维码生成,支持自定义尺寸、颜色、边距,可嵌入 Logo。

### 4.1 基本用法

```java
import plus.ruoyi.common.media.builder.QrCodeBuilder;

// 基本二维码
BufferedImage qrCode = QrCodeBuilder.of("https://ruoyi.plus")
    .build();

// 指定尺寸
BufferedImage qrCode2 = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .build();

// 自定义前景色和背景色
BufferedImage qrCode3 = QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .foregroundColor(Color.BLACK)
    .backgroundColor(Color.WHITE)
    .build();

// 自定义颜色(十六进制)
BufferedImage qrCode4 = QrCodeBuilder.of("https://ruoyi.plus")
    .size(350)
    .foregroundColor("#1890FF") // 蓝色前景
    .backgroundColor("#F0F2F5") // 灰色背景
    .build();
```

### 4.2 设置边距

```java
// 设置边距
BufferedImage qrCode = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .margin(2) // 边距,默认为1
    .build();

// 无边距
BufferedImage qrCode2 = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .margin(0)
    .build();
```

### 4.3 嵌入 Logo

```java
// 嵌入本地 Logo
BufferedImage qrWithLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .logo("/path/to/logo.png")
    .build();

// 嵌入 URL Logo
BufferedImage qrWithRemoteLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(400)
    .logo("https://example.com/logo.png")
    .build();

// 指定 Logo 尺寸
BufferedImage qrWithSizedLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(500)
    .logo("/path/to/logo.png")
    .logoSize(100) // Logo 宽高为 100px
    .build();

// 设置 Logo 缩放比例
BufferedImage qrWithScaledLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(500)
    .logo("/path/to/logo.png")
    .logoScale(0.25f) // Logo 占二维码的 25%
    .build();

// Logo 带边框和圆角
BufferedImage qrWithStyledLogo = QrCodeBuilder.of("https://ruoyi.plus")
    .size(500)
    .logo("/path/to/logo.png")
    .logoSize(80)
    .logoBorderWidth(3) // 边框宽度
    .logoBorderColor(Color.WHITE) // 边框颜色
    .logoBorderRadius(10) // 圆角半径
    .build();
```

### 4.4 容错级别

```java
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

// 低容错级别(7% 可恢复)
BufferedImage qrL = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .errorCorrectionLevel(ErrorCorrectionLevel.L)
    .build();

// 中低容错级别(15% 可恢复)
BufferedImage qrM = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .errorCorrectionLevel(ErrorCorrectionLevel.M)
    .build();

// 中高容错级别(25% 可恢复)
BufferedImage qrQ = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .errorCorrectionLevel(ErrorCorrectionLevel.Q)
    .build();

// 最高容错级别(30% 可恢复,嵌入 Logo 时推荐)
BufferedImage qrH = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .errorCorrectionLevel(ErrorCorrectionLevel.H)
    .build();
```

**容错级别说明:**

| 级别 | 可恢复比例 | 适用场景 |
|------|-----------|----------|
| L | 7% | 普通二维码,无 Logo |
| M | 15% | 默认级别,适合大多数场景 |
| Q | 25% | 需要一定容错能力 |
| H | 30% | 嵌入 Logo 时推荐 |

### 4.5 输出方式

```java
// 输出为 BufferedImage
BufferedImage qrImage = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .build();

// 输出为字节数组
byte[] qrBytes = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .toBytes();

// 输出为 InputStream
InputStream qrStream = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .toInputStream();

// 保存为文件
QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .save("/path/to/qrcode.png");

// 直接输出到 HTTP 响应
public void generateQrCode(String content, HttpServletResponse response) {
    QrCodeBuilder.of(content)
        .size(300)
        .toResponse(response);
}

// 指定输出格式
QrCodeBuilder.of("https://ruoyi.plus")
    .size(300)
    .format(OutputFormat.JPG)
    .save("/path/to/qrcode.jpg");
```

### 4.6 完整示例

```java
/**
 * 二维码服务示例
 */
public class QrCodeService {

    /**
     * 生成带 Logo 的品牌二维码
     */
    public byte[] generateBrandQrCode(String url, String logoUrl) {
        return QrCodeBuilder.of(url)
            .size(500)
            .foregroundColor("#1890FF")
            .backgroundColor(Color.WHITE)
            .errorCorrectionLevel(ErrorCorrectionLevel.H)
            .logo(logoUrl)
            .logoSize(80)
            .logoBorderWidth(3)
            .logoBorderColor(Color.WHITE)
            .logoBorderRadius(8)
            .format(OutputFormat.PNG)
            .toBytes();
    }

    /**
     * 生成支付二维码
     */
    public byte[] generatePaymentQrCode(String paymentUrl) {
        return QrCodeBuilder.of(paymentUrl)
            .size(400)
            .foregroundColor(Color.BLACK)
            .backgroundColor(Color.WHITE)
            .errorCorrectionLevel(ErrorCorrectionLevel.H)
            .margin(2)
            .toBytes();
    }

    /**
     * 生成活动二维码(带 Logo)
     */
    public void generateEventQrCode(String eventUrl, String logoPath, String outputPath) {
        QrCodeBuilder.of(eventUrl)
            .size(600)
            .foregroundColor("#FF5722")
            .backgroundColor(Color.WHITE)
            .errorCorrectionLevel(ErrorCorrectionLevel.H)
            .logo(logoPath)
            .logoScale(0.2f)
            .logoBorderWidth(4)
            .logoBorderColor(Color.WHITE)
            .logoBorderRadius(12)
            .save(outputPath);
    }
}
```

## 5. 海报生成 (PosterBuilder)

PosterBuilder 支持动态海报生成,可添加文本、图片、二维码、几何图形等多种元素。

### 5.1 基本用法

```java
import plus.ruoyi.common.media.builder.PosterBuilder;

// 纯色背景海报
BufferedImage poster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .build();

// 图片背景海报(本地文件)
BufferedImage poster2 = PosterBuilder.of("/path/to/bg.jpg", 800, 1200)
    .build();

// 图片背景海报(URL)
BufferedImage poster3 = PosterBuilder.of("https://example.com/bg.jpg", 800, 1200)
    .build();

// 渐变背景海报
BufferedImage poster4 = PosterBuilder.of(800, 1200)
    .gradientBackground(
        new Color(102, 126, 234), // 起始颜色
        new Color(118, 75, 162),  // 结束颜色
        GradientDirection.TOP_TO_BOTTOM) // 渐变方向
    .build();
```

### 5.2 添加文本

```java
// 基本文本
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addText("Hello World", 48, "#333333", 100, 200)
    .build();

// 带字体样式的文本
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addText("标题文字",
        new Font("微软雅黑", Font.BOLD, 64),
        Color.BLACK,
        100, 200)
    .build();

// 居中文本
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("居中显示的标题", 64, "#000000", 300)
    .build();

// 多行文本(自动换行)
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addMultiLineText(
        "这是一段很长的文本内容,系统会自动根据指定的最大宽度进行换行处理。",
        32, "#333333",
        100, 400, // 起始坐标
        600, // 最大宽度
        50) // 行高
    .build();

// 多种文本组合
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addText("主标题", 72, "#000000", 100, 150)
    .addText("副标题", 36, "#666666", 100, 250)
    .addCenterText("居中内容", 48, "#1890FF", 500)
    .addMultiLineText("详细描述文本...", 24, "#999999", 100, 600, 600, 40)
    .build();
```

### 5.3 添加图片

```java
// 添加本地图片
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addImage("/path/to/product.jpg", 100, 300, 300, 300)
    .build();

// 添加网络图片
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addImage("https://example.com/product.jpg", 100, 300, 300, 300)
    .build();

// 居中添加图片
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterImage("/path/to/logo.png", 200, 100, 100)
    .build();

// 添加圆形图片(头像)
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCircleImage("/path/to/avatar.jpg", 400, 300, 80)
    .build();

// 添加圆角图片
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addRoundImage("/path/to/product.jpg", 100, 300, 300, 300, 20)
    .build();

// 添加带边框的圆形图片
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCircleImage("/path/to/avatar.jpg", 400, 300, 80, 4, Color.WHITE)
    .build();
```

### 5.4 添加二维码

```java
// 基本二维码
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addQrCode("https://ruoyi.plus", 300, 900, 200)
    .build();

// 居中二维码
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterQrCode("https://ruoyi.plus", 1000, 200)
    .build();

// 带 Logo 的二维码
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addQrCode("https://ruoyi.plus", 300, 900, 200, "/path/to/logo.png")
    .build();
```

### 5.5 添加几何图形

```java
// 添加矩形
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addRectangle(50, 50, 700, 200, "#1890FF")
    .build();

// 添加圆角矩形
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addRoundRectangle(50, 50, 700, 200, 20, "#1890FF")
    .build();

// 添加圆形
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCircle(400, 600, 100, "#FF5722")
    .build();

// 添加线条
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addLine(100, 500, 700, 500, 2, "#CCCCCC")
    .build();

// 添加半透明遮罩层
PosterBuilder.of("https://example.com/bg.jpg", 800, 1200)
    .addRectangle(0, 0, 800, 1200, "rgba(0,0,0,0.5)")
    .addText("标题", 64, "#FFFFFF", 100, 600)
    .build();
```

### 5.6 输出方式

```java
// 输出为 BufferedImage
BufferedImage poster = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("海报标题", 64, "#000000", 200)
    .build();

// 输出为字节数组
byte[] posterBytes = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("海报标题", 64, "#000000", 200)
    .toBytes();

// 输出为 InputStream
InputStream posterStream = PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("海报标题", 64, "#000000", 200)
    .toInputStream();

// 保存为文件
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addCenterText("海报标题", 64, "#000000", 200)
    .save("/path/to/poster.jpg");

// 直接输出到 HTTP 响应
public void generatePoster(HttpServletResponse response) {
    PosterBuilder.of(800, 1200)
        .background(Color.WHITE)
        .addCenterText("海报标题", 64, "#000000", 200)
        .toResponse(response);
}
```

### 5.7 完整示例

```java
/**
 * 海报生成服务示例
 */
public class PosterService {

    /**
     * 生成商品分享海报
     */
    public byte[] generateProductSharePoster(Product product, User user) {
        return PosterBuilder.of(750, 1334) // 手机屏幕比例
            .background(Color.WHITE)
            // 商品图片
            .addRoundImage(product.getImageUrl(), 50, 50, 650, 650, 12)
            // 商品名称
            .addMultiLineText(product.getName(), 36, "#333333", 50, 740, 650, 50)
            // 价格
            .addText("¥" + product.getPrice(), 48, "#FF5722", 50, 870)
            // 分隔线
            .addLine(50, 950, 700, 950, 1, "#EEEEEE")
            // 用户信息
            .addCircleImage(user.getAvatarUrl(), 100, 1020, 40, 2, Color.WHITE)
            .addText(user.getNickname(), 28, "#333333", 160, 1035)
            .addText("推荐好物给你", 24, "#999999", 160, 1075)
            // 二维码
            .addQrCode(product.getShareUrl(), 530, 980, 160)
            .addText("扫码查看", 20, "#999999", 570, 1160)
            .toBytes();
    }

    /**
     * 生成邀请海报
     */
    public byte[] generateInvitePoster(User inviter, String inviteCode) {
        String qrContent = "https://ruoyi.plus/invite?code=" + inviteCode;

        return PosterBuilder.of("https://example.com/invite-bg.jpg", 750, 1334)
            // 半透明遮罩
            .addRectangle(0, 600, 750, 734, "rgba(255,255,255,0.95)")
            // 邀请人信息
            .addCircleImage(inviter.getAvatarUrl(), 375, 700, 60, 3, Color.WHITE)
            .addCenterText(inviter.getNickname(), 32, "#333333", 800)
            .addCenterText("邀请你加入", 28, "#666666", 850)
            // 二维码
            .addCenterQrCode(qrContent, 1000, 200)
            // 提示文字
            .addCenterText("长按识别二维码", 24, "#999999", 1230)
            .toBytes();
    }

    /**
     * 生成活动海报
     */
    public void generateEventPoster(Event event, String outputPath) {
        PosterBuilder.of(event.getBgImageUrl(), 1200, 630) // 社交分享尺寸
            // 半透明遮罩
            .addRectangle(0, 0, 1200, 630, "rgba(0,0,0,0.5)")
            // 活动标题
            .addMultiLineText(event.getTitle(), 64, "#FFFFFF", 100, 250, 1000, 80)
            // 分类标签
            .addText(event.getCategory(), 32, "#FFD700", 100, 550)
            // 作者头像
            .addCircleImage(event.getAuthor().getAvatarUrl(), 1100, 550, 60)
            .save(outputPath);
    }
}
```

## 6. API 参考

### 6.1 ImageBuilder API

| 方法 | 参数 | 返回类型 | 说明 |
|------|------|----------|------|
| `of(String)` | 文件路径或 URL | `ImageBuilder` | 静态工厂方法,创建实例 |
| `of(byte[])` | 字节数组 | `ImageBuilder` | 从字节数组创建 |
| `of(InputStream)` | 输入流 | `ImageBuilder` | 从输入流创建 |
| `of(BufferedImage)` | 图片对象 | `ImageBuilder` | 从 BufferedImage 创建 |
| `resize(int, int, ResizeMode)` | 宽度, 高度, 模式 | `ImageBuilder` | 缩放图片 |
| `scale(double)` | 缩放比例 | `ImageBuilder` | 按比例缩放 |
| `crop(int, int, int, int)` | x, y, 宽度, 高度 | `ImageBuilder` | 按坐标裁剪 |
| `cropCenter(int, int)` | 宽度, 高度 | `ImageBuilder` | 居中裁剪 |
| `rotate(double)` | 角度 | `ImageBuilder` | 旋转图片 |
| `flipHorizontal()` | - | `ImageBuilder` | 水平翻转 |
| `flipVertical()` | - | `ImageBuilder` | 垂直翻转 |
| `addTextWatermark(...)` | 文字, 字体, 颜色, 坐标, 透明度 | `ImageBuilder` | 添加文字水印 |
| `addImageWatermark(...)` | 图片, 坐标, 尺寸, 透明度 | `ImageBuilder` | 添加图片水印 |
| `tileWatermark(...)` | 图片, 间距, 透明度 | `ImageBuilder` | 平铺水印 |
| `grayscale()` | - | `ImageBuilder` | 灰度滤镜 |
| `brightness(float)` | 亮度值 | `ImageBuilder` | 调整亮度 |
| `contrast(float)` | 对比度值 | `ImageBuilder` | 调整对比度 |
| `blur(int)` | 半径 | `ImageBuilder` | 模糊效果 |
| `sharpen()` | - | `ImageBuilder` | 锐化效果 |
| `format(OutputFormat)` | 输出格式 | `ImageBuilder` | 设置输出格式 |
| `build()` | - | `BufferedImage` | 构建并返回图片 |
| `toBytes()` | - | `byte[]` | 输出为字节数组 |
| `toInputStream()` | - | `InputStream` | 输出为输入流 |
| `save(String)` | 文件路径 | `void` | 保存到文件 |
| `writeTo(OutputStream)` | 输出流 | `void` | 写入输出流 |
| `toResponse(HttpServletResponse)` | HTTP 响应 | `void` | 输出到响应 |

### 6.2 GifBuilder API

| 方法 | 参数 | 返回类型 | 说明 |
|------|------|----------|------|
| `of(int, int)` | 宽度, 高度 | `GifBuilder` | 静态工厂方法 |
| `addFrame(String)` | 文件路径/URL | `GifBuilder` | 添加单帧 |
| `addFrame(BufferedImage)` | 图片对象 | `GifBuilder` | 添加单帧 |
| `addFrames(List)` | 路径列表/图片列表 | `GifBuilder` | 批量添加帧 |
| `delay(int)` | 毫秒 | `GifBuilder` | 设置帧延迟 |
| `loop(int)` | 循环次数 | `GifBuilder` | 设置循环次数 |
| `backgroundColor(Color)` | 颜色 | `GifBuilder` | 设置背景色 |
| `quality(float)` | 0.0-1.0 | `GifBuilder` | 设置质量 |
| `clearFrames()` | - | `GifBuilder` | 清除所有帧 |
| `toBytes()` | - | `byte[]` | 输出为字节数组 |
| `toInputStream()` | - | `InputStream` | 输出为输入流 |
| `save(String)` | 文件路径 | `void` | 保存到文件 |

### 6.3 QrCodeBuilder API

| 方法 | 参数 | 返回类型 | 说明 |
|------|------|----------|------|
| `of(String)` | 二维码内容 | `QrCodeBuilder` | 静态工厂方法 |
| `size(int)` | 像素 | `QrCodeBuilder` | 设置尺寸 |
| `foregroundColor(Color/String)` | 颜色 | `QrCodeBuilder` | 设置前景色 |
| `backgroundColor(Color/String)` | 颜色 | `QrCodeBuilder` | 设置背景色 |
| `margin(int)` | 边距 | `QrCodeBuilder` | 设置边距 |
| `errorCorrectionLevel(ErrorCorrectionLevel)` | 容错级别 | `QrCodeBuilder` | 设置容错级别 |
| `logo(String)` | Logo 路径/URL | `QrCodeBuilder` | 设置 Logo |
| `logoSize(int)` | 像素 | `QrCodeBuilder` | 设置 Logo 尺寸 |
| `logoScale(float)` | 缩放比例 | `QrCodeBuilder` | 设置 Logo 缩放 |
| `logoBorderWidth(int)` | 像素 | `QrCodeBuilder` | Logo 边框宽度 |
| `logoBorderColor(Color)` | 颜色 | `QrCodeBuilder` | Logo 边框颜色 |
| `logoBorderRadius(int)` | 像素 | `QrCodeBuilder` | Logo 圆角半径 |
| `format(OutputFormat)` | 输出格式 | `QrCodeBuilder` | 设置输出格式 |
| `build()` | - | `BufferedImage` | 构建并返回图片 |
| `toBytes()` | - | `byte[]` | 输出为字节数组 |
| `toInputStream()` | - | `InputStream` | 输出为输入流 |
| `save(String)` | 文件路径 | `void` | 保存到文件 |
| `toResponse(HttpServletResponse)` | HTTP 响应 | `void` | 输出到响应 |

### 6.4 PosterBuilder API

| 方法 | 参数 | 返回类型 | 说明 |
|------|------|----------|------|
| `of(int, int)` | 宽度, 高度 | `PosterBuilder` | 纯色背景创建 |
| `of(String, int, int)` | 背景图, 宽度, 高度 | `PosterBuilder` | 图片背景创建 |
| `background(Color)` | 颜色 | `PosterBuilder` | 设置背景色 |
| `gradientBackground(...)` | 起始色, 结束色, 方向 | `PosterBuilder` | 渐变背景 |
| `addText(...)` | 文字, 字号/字体, 颜色, 坐标 | `PosterBuilder` | 添加文本 |
| `addCenterText(...)` | 文字, 字号, 颜色, Y坐标 | `PosterBuilder` | 居中文本 |
| `addMultiLineText(...)` | 文字, 字号, 颜色, 坐标, 最大宽度, 行高 | `PosterBuilder` | 多行文本 |
| `addImage(...)` | 图片, X, Y, 宽, 高 | `PosterBuilder` | 添加图片 |
| `addCenterImage(...)` | 图片, Y, 宽, 高 | `PosterBuilder` | 居中图片 |
| `addCircleImage(...)` | 图片, X, Y, 半径, [边框宽度, 边框色] | `PosterBuilder` | 圆形图片 |
| `addRoundImage(...)` | 图片, X, Y, 宽, 高, 圆角 | `PosterBuilder` | 圆角图片 |
| `addQrCode(...)` | 内容, X, Y, 尺寸, [Logo] | `PosterBuilder` | 添加二维码 |
| `addCenterQrCode(...)` | 内容, Y, 尺寸 | `PosterBuilder` | 居中二维码 |
| `addRectangle(...)` | X, Y, 宽, 高, 颜色 | `PosterBuilder` | 添加矩形 |
| `addRoundRectangle(...)` | X, Y, 宽, 高, 圆角, 颜色 | `PosterBuilder` | 圆角矩形 |
| `addCircle(...)` | X, Y, 半径, 颜色 | `PosterBuilder` | 添加圆形 |
| `addLine(...)` | X1, Y1, X2, Y2, 宽度, 颜色 | `PosterBuilder` | 添加线条 |
| `build()` | - | `BufferedImage` | 构建并返回图片 |
| `toBytes()` | - | `byte[]` | 输出为字节数组 |
| `toInputStream()` | - | `InputStream` | 输出为输入流 |
| `save(String)` | 文件路径 | `void` | 保存到文件 |
| `toResponse(HttpServletResponse)` | HTTP 响应 | `void` | 输出到响应 |

### 6.5 枚举类型

**ResizeMode (缩放模式):**

| 值 | 说明 |
|----|------|
| `EXACT` | 精确缩放到指定尺寸 |
| `FIT_TO_WIDTH` | 宽度固定,高度等比缩放 |
| `FIT_TO_HEIGHT` | 高度固定,宽度等比缩放 |
| `AUTO` | 自动选择最佳缩放方式 |

**OutputFormat (输出格式):**

| 值 | 说明 |
|----|------|
| `PNG` | PNG 格式,支持透明 |
| `JPG` | JPG 格式,压缩率高 |
| `GIF` | GIF 格式,支持动画 |
| `BMP` | BMP 格式,无压缩 |
| `WEBP` | WebP 格式,高压缩率 |

**GradientDirection (渐变方向):**

| 值 | 说明 |
|----|------|
| `TOP_TO_BOTTOM` | 从上到下 |
| `LEFT_TO_RIGHT` | 从左到右 |
| `DIAGONAL` | 对角线 |

## 7. 最佳实践

### 7.1 性能优化

```java
// 1. 批量处理时分批执行,避免内存溢出
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

        System.gc(); // 批次间触发 GC
    }
}

// 2. 限制并行处理数量
public List<byte[]> parallelProcess(List<String> urls) {
    ForkJoinPool customPool = new ForkJoinPool(4);
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

// 3. 缓存远程图片
@Cacheable(value = "remote-images", key = "#url")
public BufferedImage loadAndCacheImage(String url) {
    return ImageBuilder.of(url).build();
}
```

### 7.2 异常处理

```java
// 1. 使用备用图片
public BufferedImage loadImageSafe(String url, String fallbackPath) {
    try {
        return ImageBuilder.of(url).build();
    } catch (Exception e) {
        log.warn("加载图片失败: {}, 使用备用图片", url);
        return ImageBuilder.of(fallbackPath).build();
    }
}

// 2. 重试机制
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
                Thread.sleep(1000 * retries);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }
    }

    throw new MediaException("加载图片失败,已重试" + maxRetries + "次", lastException);
}
```

### 7.3 资源管理

```java
// 1. 使用 OSS 存储生成的图片
@Service
public class MediaStorageService {

    @Resource
    private OssService ossService;

    public String processAndUpload(String imageUrl, String fileName) {
        byte[] processed = ImageBuilder.of(imageUrl)
            .resize(800, 600, ResizeMode.AUTO)
            .addTextWatermark("© 版权所有",
                new Font("Arial", Font.BOLD, 24),
                Color.WHITE, -120, -40, 0.7f)
            .toBytes();

        return ossService.upload(processed, "images/" + fileName);
    }
}

// 2. 定期清理临时文件
@Scheduled(cron = "0 0 3 * * ?")
public void cleanTempFiles() {
    File tempDir = new File("/tmp/media");
    if (tempDir.exists()) {
        long threshold = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(1);
        File[] files = tempDir.listFiles(f -> f.lastModified() < threshold);
        if (files != null) {
            for (File file : files) {
                file.delete();
            }
        }
    }
}
```

## 8. 常见问题

### 8.1 图片处理相关

**问题: 图片处理后模糊或失真**

原因: 缩放比例过大、输出格式不合适

```java
// 解决方案: 选择合适的输出格式和避免放大
BufferedImage highQuality = ImageBuilder.of("/path/to/image.jpg")
    .resize(800, 600, ResizeMode.AUTO)
    .format(OutputFormat.PNG) // PNG 保持质量
    .build();
```

**问题: 内存溢出 (OutOfMemoryError)**

原因: 图片尺寸过大、批量处理未控制并发

```java
// 解决方案: 分批处理,限制并发
public void processManyImages(List<String> urls) {
    int batchSize = 10;
    for (int i = 0; i < urls.size(); i += batchSize) {
        // 分批处理...
        System.gc();
    }
}
```

**问题: 水印位置不准确**

原因: 没有考虑图片尺寸差异

```java
// 解决方案: 使用相对位置计算
BufferedImage original = ImageBuilder.of(imageUrl).build();
int x = (int)(original.getWidth() * 0.9) - 100;
int y = (int)(original.getHeight() * 0.95) - 20;

return ImageBuilder.of(original)
    .addTextWatermark(text, font, Color.WHITE, x, y, 0.7f)
    .build();
```

### 8.2 GIF 相关

**问题: GIF 文件过大**

```java
// 解决方案: 控制尺寸和帧数
byte[] optimizedGif = GifBuilder.of(400, 300) // 降低尺寸
    .addFrame(frame1)
    .addFrame(frame3) // 跳过部分帧
    .delay(1000) // 增加延迟
    .quality(0.7f) // 降低质量
    .toBytes();
```

**问题: GIF 播放速度不正确**

```java
// 标准帧率参考:
// 60 FPS → 16ms 延迟
// 30 FPS → 33ms 延迟
// 10 FPS → 100ms 延迟
GifBuilder.of(400, 300)
    .addFrames(frames)
    .delay(100) // 10 FPS
    .toBytes();
```

### 8.3 二维码相关

**问题: 二维码扫描失败**

```java
// 解决方案: 确保对比度、尺寸和容错级别
BufferedImage qr = QrCodeBuilder.of("https://ruoyi.plus")
    .size(300) // 最小 200x200
    .foregroundColor(Color.BLACK)
    .backgroundColor(Color.WHITE)
    .errorCorrectionLevel(ErrorCorrectionLevel.H) // 高容错
    .margin(2) // 增加边距
    .build();
```

### 8.4 海报相关

**问题: 文字超出边界或换行不正确**

```java
// 解决方案: 使用多行文本自动换行
PosterBuilder.of(800, 1200)
    .background(Color.WHITE)
    .addMultiLineText(
        "这是一段很长的文本...",
        32, "#333333",
        100, 300,
        600, // 最大宽度
        50)  // 行高
    .build();
```

**问题: 图片加载失败**

```java
// 解决方案: 使用备用图片
public BufferedImage generatePosterSafe(String bgUrl, String fallbackBg) {
    try {
        return PosterBuilder.of(bgUrl, 800, 1200)
            .addCenterText("Hello", 64, "#000000", 600)
            .build();
    } catch (Exception e) {
        return PosterBuilder.of(fallbackBg, 800, 1200)
            .addCenterText("Hello", 64, "#000000", 600)
            .build();
    }
}
```

**问题: 海报生成慢**

```java
// 解决方案: 缓存远程图片,使用本地资源
@Cacheable(value = "remote-images", key = "#url")
public BufferedImage loadAndCacheImage(String url) {
    return ImageBuilder.of(url).build();
}

// 使用本地图片代替远程图片
PosterBuilder.of("/local/bg.jpg", 800, 1200)
    .addCenterImage("/local/logo.png", 100, 200, 100)
    .build();
```

## 9. 总结

ruoyi-common-media 模块提供了完整的媒体处理解决方案:

| 功能 | Builder类 | 主要用途 |
|------|-----------|----------|
| 图片处理 | `ImageBuilder` | 缩放、裁剪、旋转、水印、滤镜 |
| GIF动画 | `GifBuilder` | 多帧动画生成、参数配置 |
| 二维码 | `QrCodeBuilder` | 二维码生成、Logo嵌入 |
| 海报制作 | `PosterBuilder` | 动态海报、多元素组合 |

**适用场景:**

- **图片处理**: 商品图片批量处理、用户头像裁剪、图片水印添加
- **GIF动画**: 产品展示动画、教程步骤演示、加载动画制作
- **二维码**: 网址短链接、活动报名、支付收款、名片联系方式
- **海报生成**: 商品分享海报、活动宣传海报、用户邀请卡片

**技术优势:**

- ✅ **Builder模式** - 流畅的链式调用API
- ✅ **高性能** - 基于Thumbnailator和ZXing优秀库
- ✅ **多输入源** - 支持URL、文件、流、字节数组
- ✅ **多输出格式** - 支持PNG、JPG、GIF、WebP、BMP
- ✅ **功能丰富** - 覆盖常见媒体处理需求
- ✅ **易于使用** - 简洁的API设计,快速上手
