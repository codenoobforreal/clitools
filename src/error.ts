class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SpawnProcessError extends MyError {
  public override cause: Error;
  public stderr: string;
  constructor(message: string, stderr: string, cause: Error) {
    super(message);
    this.cause = cause;
    this.stderr = stderr;
  }
}

export class FFmpegProcessError extends MyError {
  public override cause: Error;
  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
  }
}

export class FFprobeProcessError extends FFmpegProcessError {}

export class KVError extends MyError {
  public pair: string;
  constructor(message: string, pair: string) {
    super(message);
    this.pair = pair;
  }
}

export class StringToNumberConvertError extends MyError {
  public value: string;
  constructor(message: string, value: string) {
    super(message);
    this.value = value;
  }
}

export class FFprobeResultConvertError extends MyError {
  public override cause: Error;
  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
  }
}

export class EncodeImageError extends MyError {
  public override cause: Error;
  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
  }
}

export class ExtractVideoMetadataError extends MyError {
  constructor(message: string) {
    super(message);
  }
}

export class RequiredFieldError extends MyError {
  public fields: string[];
  constructor(message: string, fields: string[]) {
    super(message);
    this.fields = fields;
  }
}

export class MissingBinariesError extends MyError {
  constructor(message: string) {
    super(message);
  }
}

export class NotSupportedError extends MyError {
  constructor(message: string) {
    super(message);
  }
}

export class NothingToProcessError extends MyError {
  constructor(message: string) {
    super(message);
  }
}

export class UnknownTaskError extends MyError {
  public task: string;
  constructor(message: string, task: string) {
    super(message);
    this.task = task;
  }
}
