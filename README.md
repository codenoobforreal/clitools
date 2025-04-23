# @codenoobforreal/clitools

**​[View Chinese Version](README.zh-CN.md)​**​

## Installation & Usage

```bash
# Using pnpm
pnpm dlx @codenoobforreal/clitools

# Using npx
npx @codenoobforreal/clitools
```

### Video Encoding

Batch video encoding to `H.265/HEVC` format with adaptive bitrate filtering,requires `ffmpeg`.

Currently supports: Video Encoding (`H.265`)

[You need `ffmpeg` installed globally for this task.](#ffmpeg-installation-guide)

#### Workflow

##### ​Input Source​

Provide a video file path ​OR​ a folder containing multiple videos.
​

##### Bitrate Filter​

Filter videos below recommended bitrates:

- 4K+: 20 Mbps
- 2K: 15 Mbps
- 1080p: 13 Mbps
- 720p: 5 Mbps
- Others: 2.25 Mbps

Choose No to disable filtering.

##### Confirmation​

Confirm to start encoding,cancel to exit process.

#### Output

Encoded videos are saved in the ​same directory​ as the input source.
Example: `~/Videos/input.mp4 → ~/Videos/input-20250101.mp4`

## FFmpeg Installation Guide <a id="ffmpeg-install-guide"></a>

### Install

#### Windows

1. Visit official builds: https://www.gyan.dev/ffmpeg/builds
2. Download the latest `ffmpeg-git-full.7z` file
3. Extract the zip file to your preferred location (e.g. `C:\ffmpeg`)
4. Add FFmpeg to PATH:
   - Right-click Start Menu > System > Advanced system settings
   - Environment Variables > Path > Edit > New
   - Add FFmpeg bin path (e.g. `C:\ffmpeg\bin`)

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

### Verify Installation

```bash
# Should show FFmpeg version info and configuration details
ffmpeg -version
```
