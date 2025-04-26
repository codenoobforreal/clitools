# @codenoobforreal/clitools

## 安装与使用

```bash
# 使用 pnpm
pnpm dlx @codenoobforreal/clitools

# 使用 npx
npx @codenoobforreal/clitools
```

## 功能特性

### 视频编码与压缩

- ​**高效H.265/HEVC转换**​：通过FFmpeg使用[HandBrake推荐质量设置](https://handbrake.fr/docs/en/1.9.0/workflow/adjust-quality.html)批量编码视频至H.265格式
- 预设支持：当前支持H.265视频编码

- **环境依赖**​：  
  本功能需要安装 [FFmpeg](https://ffmpeg.org)  
  [安装指南](#ffmpeg-installation-guide)

### QuickTime兼容性修复

- ​**无损转换**​：批量将H.265视频重新封装为QuickTime兼容形式，无需重新编码

- ​**环境依赖**​：  
  本功能需要安装 [FFmpeg](https://ffmpeg.org)  
  [安装指南](#ffmpeg-installation-guide)

### 批量无损图片压缩

- ​**​批量无损图片压缩**​：保持原有格式进行批量处理

- ​**特别提示**​：当源文件较小时，输出文件可能大于原文件

## 输出结构

处理后的文件将保存在**原始目录**中，并添加时间戳后缀：  
`/path/to/input.mp4` → `/path/to/input-20231010120000.mp4`

## FFmpeg 安装指南 <a id="ffmpeg-install-guide"></a>

### 安装

#### Windows

1. 访问官方构建版本：https://www.gyan.dev/ffmpeg/builds
2. 下载最新的 `ffmpeg-git-full.7z` 文件
3. 解压到您选择的目录（例如 `C:\ffmpeg`）
4. 添加环境变量：
   - 右键开始菜单 > 系统 > 高级系统设置
   - 环境变量 > `Path` > 编辑 > 新建
   - 添加 `FFmpeg` 的 `bin` 目录（例如 `C:\ffmpeg\bin`）

#### macOS

```bash
brew install ffmpeg
```

#### Linux

```bash
# Debian/Ubuntu
sudo apt update && sudo apt install ffmpeg

# Fedora
sudo dnf install ffmpeg

# Arch Linux
sudo pacman -S ffmpeg
```

### 验证安装

```bash
# 运行该命令会显示版本信息和编译配置
ffmpeg -version
```
