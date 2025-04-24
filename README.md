# @codenoobforreal/clitools

**​[View Chinese Version](README.zh-CN.md)​**​

## Installation & Usage

```bash
# Using pnpm
pnpm dlx @codenoobforreal/clitools

# Using npx
npx @codenoobforreal/clitools
```

### Video Encoding & Compression

- ​**Efficient H.265/HEVC Conversion**: Batch encode videos to H.265 format using [HandBrake's recommended quality settings](https://handbrake.fr/docs/en/1.9.0/workflow/adjust-quality.html) via FFmpeg.
- ​**Preset Support**: Currently optimized for H.265 video encoding.

**Dependency**:  
This feature requires [FFmpeg](https://ffmpeg.org) to be installed.[Installation Guide](#ffmpeg-installation-guide)

### QuickTime Compatibility Patch

- ​**Zero-Quality-Loss Conversion**: Batch remux H.265 videos to QuickTime-friendly form without re-encoding.

❗ ​**Dependency**:  
This feature requires [FFmpeg](https://ffmpeg.org) to be installed.[Installation Guide](#ffmpeg-installation-guide)

## Output Structure

Processed files will be saved in the ​**source directory**​ with a timestamp suffix:  
`/path/to/input.mp4` → `/path/to/input-20231010120000.mp4`

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
