import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkFFmpegInstallation } from "../../core/ffmpeg/checker";
import { askForContinue } from "../../libs/prompt";
import { enableHEVCQuickTimeTask } from "../enable-quickTime";
import { encodeImageTask } from "../encode-image";
import { encodeVideoTask } from "../encode-video";
import { runCli } from "./index";
import { getTaskDetail } from "./task-detail";

vi.mock("../../core/ffmpeg/checker", () => ({
  checkFFmpegInstallation: vi.fn(),
}));

vi.mock("../../libs/prompt", () => ({
  askForContinue: vi.fn(),
}));

vi.mock("../encode-video", () => ({
  encodeVideoTask: vi.fn(),
}));

vi.mock("../encode-image", () => ({
  encodeImageTask: vi.fn(),
}));

vi.mock("../enable-quickTime", () => ({
  enableHEVCQuickTimeTask: vi.fn(),
}));

vi.mock("./task-detail.js", () => ({
  getTaskDetail: vi.fn(),
}));

describe("runCli", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should early return void without continue", async () => {
    const mockAnswer = { input: "test.mp4" };
    const mockTaskDetail = {
      task: "video-encode" as const,
      answer: mockAnswer,
    };
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(false);
    await runCli();
    expect(encodeVideoTask).not.toHaveBeenCalled();
    expect(enableHEVCQuickTimeTask).not.toHaveBeenCalled();
    expect(encodeImageTask).not.toHaveBeenCalled();
  });

  it("should execute video encode task with parameters", async () => {
    const mockAnswer = { input: "test.mp4" };
    const mockTaskDetail = {
      task: "video-encode" as const,
      answer: mockAnswer,
    };
    vi.mocked(checkFFmpegInstallation).mockReturnValue();
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(true);
    await runCli();
    expect(checkFFmpegInstallation).toHaveBeenCalled();
    expect(encodeVideoTask).toHaveBeenCalledWith(mockAnswer);
    expect(enableHEVCQuickTimeTask).not.toHaveBeenCalled();
    expect(encodeImageTask).not.toHaveBeenCalled();
  });

  it("should throw error when executing video encode task with ffmpeg check failed", async () => {
    const mockAnswer = { input: "test.mp4" };
    const mockTaskDetail = {
      task: "video-encode" as const,
      answer: mockAnswer,
    };
    vi.mocked(checkFFmpegInstallation).mockImplementation(() => {
      throw new Error("ffmpeg not installed");
    });
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(true);
    await expect(runCli()).rejects.toThrow(Error);
    expect(checkFFmpegInstallation).toHaveBeenCalled();
    expect(encodeVideoTask).not.toHaveBeenCalledWith(mockAnswer);
    expect(enableHEVCQuickTimeTask).not.toHaveBeenCalled();
    expect(encodeImageTask).not.toHaveBeenCalled();
  });

  it("should execute HEVC QuickTime enable task", async () => {
    const mockAnswer = { input: "test.mp4" };
    const mockTaskDetail = {
      task: "hevc-enable-QuickTime" as const,
      answer: mockAnswer,
    };
    vi.mocked(checkFFmpegInstallation).mockReturnValue();
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(true);
    await runCli();
    expect(checkFFmpegInstallation).toHaveBeenCalled();
    expect(enableHEVCQuickTimeTask).toHaveBeenCalled();
    expect(encodeVideoTask).not.toHaveBeenCalled();
    expect(encodeImageTask).not.toHaveBeenCalled();
  });

  it("should throw error when executing HEVC QuickTime enable task with ffmpeg check failed", async () => {
    const mockAnswer = { input: "test.mp4" };
    const mockTaskDetail = {
      task: "hevc-enable-QuickTime" as const,
      answer: mockAnswer,
    };
    vi.mocked(checkFFmpegInstallation).mockImplementation(() => {
      throw new Error("ffmpeg not installed");
    });
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(true);
    await expect(runCli()).rejects.toThrow(Error);
    expect(checkFFmpegInstallation).toHaveBeenCalled();
    expect(encodeVideoTask).not.toHaveBeenCalledWith(mockAnswer);
    expect(enableHEVCQuickTimeTask).not.toHaveBeenCalled();
    expect(encodeImageTask).not.toHaveBeenCalled();
  });

  it("should execute image encode task with parameters", async () => {
    const mockAnswer = { input: "test.jpg" };
    const mockTaskDetail = {
      task: "image-encode" as const,
      answer: mockAnswer,
    };
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(true);
    await runCli();
    expect(encodeImageTask).toHaveBeenCalledWith(mockAnswer);
    expect(encodeVideoTask).not.toHaveBeenCalled();
    expect(enableHEVCQuickTimeTask).not.toHaveBeenCalled();
  });
});
