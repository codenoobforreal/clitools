export class FFmpegCommandBuilder {
  protected globalOptions: string[] = ["-hide_banner", "-loglevel", "error"];
  protected inputs: string[] = [];
  protected outputOptions: string[] = [];
  protected outputFile: string = "";

  addProgressReporting(progressOutput: string = "pipe:2"): this {
    this.globalOptions.push("-progress", progressOutput);
    return this;
  }

  addInput(inputPath: string): this {
    this.inputs.push("-i", inputPath);
    return this;
  }

  setVideoEncoder(encoder: string): this {
    this.outputOptions.push("-c:v", encoder);
    return this;
  }

  setVideoTag(tag: string): this {
    this.outputOptions.push("-tag:v", tag);
    return this;
  }

  copyVideo(): this {
    this.outputOptions.push("-c:v", "copy");
    return this;
  }

  setCrf(crf: number): this {
    this.outputOptions.push("-crf", crf.toString());
    return this;
  }

  setPreset(preset: string = "medium"): this {
    this.outputOptions.push("-preset", preset);
    return this;
  }

  setPixFmt(fmt: string = "yuv420p"): this {
    this.outputOptions.push("-pix_fmt", fmt);
    return this;
  }

  setOutputFormat(format: string): this {
    this.outputOptions.push("-f", format);
    return this;
  }

  copyAudio(): this {
    this.outputOptions.push("-c:a", "copy");
    return this;
  }

  setOutput(outputPath: string): this {
    this.outputFile = outputPath;
    return this;
  }

  build(): string[] {
    return [
      ...this.globalOptions,
      ...this.inputs,
      ...this.outputOptions,
      this.outputFile,
    ];
  }
}

export class FFmpegH265CommandBuilder extends FFmpegCommandBuilder {
  private x265Params: string[] = [];
  /** TODO：yuv422p and yuv444p mapping might be wrong */
  protected pixFmtToProfileMap: Record<string, string> = {
    yuv420p: "main",
    yuv420p10le: "main10",
    yuv420p12le: "main12",
    yuv422p: "main",
    yuv422p10le: "main422-10",
    yuv422p12le: "main422-12",
    yuv444p: "main",
    yuv444p10le: "main444-10",
    yuv444p12le: "main444-12",
  };

  constructor() {
    super();
    super.setVideoEncoder("libx265");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setVideoEncoder(_encode: string): this {
    return this;
  }

  setLogLevel(level: string = "error"): this {
    this.x265Params.push(`log-level=${level}`);
    return this;
  }

  setProfileByPixFmt(pix_fmt: string = "yuv420p"): this {
    const profile = this.pixFmtToProfileMap[pix_fmt];

    if (profile) {
      this.x265Params.push(`profile=${profile}`);
      return this;
    }

    // let encode decided
    return this;
  }

  setInputDepth(depth: number = 8): this {
    this.x265Params.push(`input-depth=${depth}`);
    return this;
  }

  /**
   * will derive the output bit depth from the profile name if --output-depth is not specified.
   */
  setOutputDepth(depth: number): this {
    this.x265Params.push(`output-depth=${depth}`);
    return this;
  }

  applyX265Params(): this {
    if (this.x265Params.length > 0) {
      this.outputOptions.push("-x265-params", this.x265Params.join(":"));
    }
    return this;
  }
}

export class FFprobeCommandBuilder {
  private globalOptions: string[] = [];
  private outputFormat: string[] = [];
  private inputPath: string = "";

  setLogLevel(level: string = "error"): this {
    this.globalOptions.push("-v", level);
    return this;
  }

  selectStream(streamType: string = "v:0"): this {
    this.globalOptions.push("-select_streams", streamType);
    return this;
  }

  showEntries(entry: string = "stream:format"): this {
    this.globalOptions.push("-show_entries", entry);
    return this;
  }

  setOutputFormat(formatOptions: string): this {
    this.outputFormat.push("-of", formatOptions);
    return this;
  }

  setInput(inputPath: string): this {
    this.inputPath = inputPath;
    return this;
  }

  build(): string[] {
    return [...this.globalOptions, ...this.outputFormat, this.inputPath];
  }
}
