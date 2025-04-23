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

Batch video encoding to `H.265/HEVC` format with adaptive bitrate filtering.
Currently supports: Video Encoding (`H.265`) [Requires `ffmpeg`]
You need `ffmpeg` installed globally for this task.

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
