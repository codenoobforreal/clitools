# @codenoobforreal/clitools

## 安装与使用

```bash
# 使用 pnpm
pnpm dlx @codenoobforreal/clitools

# 使用 npx
npx @codenoobforreal/clitools
```

### 视频编码

支持批量视频转码为 `H.265/HEVC` 格式，并带有自适应码率过滤功能，需要 `FFmpeg`。

当前支持视频编码（ `H.265` ）

[此任务需要全局安装 `ffmpeg`。](#ffmpeg-install-guide)

#### 工作流程

##### ​输入源

提供视频文件路径或包含多个视频的文件夹路径。

##### 码率过滤​

过滤低于推荐码率的视频：

- 4K+: 20 Mbps
- 2K: 15 Mbps
- 1080p: 13 Mbps
- 720p: 5 Mbps
- 其他分辨率: 2.25 Mbps

选择否可禁用过滤。
​

##### 确认操作​

检查配置并确认开始编码，选择否退出任务。

#### 输出路径

编码后的视频保存在​输入源相同目录​。
示例：`~/Videos/input.mp4 → ~/Videos/input-20250101.mp4`

## FFmpeg 安装指南 <a id="ffmpeg-install-guide"></a>

### 安装

#### Windows

1. 访问官方构建版本：https://www.gyan.dev/ffmpeg/builds
2. 下载最新的 `ffmpeg-git-full.7z` 文件
3. 解压到指定目录（例如 `C:\ffmpeg`）
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
# 成功安装会显示版本信息和编译配置
ffmpeg -version
```
