import { beforeEach, describe, expect, test, vi } from "vitest";
import { askForContinue } from "../../libs/prompt";
import { enableHEVCQuickTimeTask } from "../enable-quickTime";
import { imageEncodeTask } from "../encode-image";
import { videoEncodeTask } from "../encode-video";
import { runCli } from "./index";
import { getTaskDetail } from "./task-detail";

vi.mock("../../libs/prompt", () => ({
  askForContinue: vi.fn(),
}));

vi.mock("../encode-video", () => ({
  videoEncodeTask: vi.fn(),
}));

vi.mock("../encode-image", () => ({
  imageEncodeTask: vi.fn(),
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

  test("should early return void without continue", async () => {
    const mockAnswer = { input: "test.mp4" };
    const mockTaskDetail = {
      task: "video-encode" as const,
      answer: mockAnswer,
    };
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(false);
    await runCli();
    expect(videoEncodeTask).not.toHaveBeenCalled();
    expect(enableHEVCQuickTimeTask).not.toHaveBeenCalled();
    expect(imageEncodeTask).not.toHaveBeenCalled();
  });

  test("should execute video encode task with parameters", async () => {
    const mockAnswer = { input: "test.mp4" };
    const mockTaskDetail = {
      task: "video-encode" as const,
      answer: mockAnswer,
    };
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(true);
    await runCli();
    expect(videoEncodeTask).toHaveBeenCalledWith(mockAnswer);
    expect(enableHEVCQuickTimeTask).not.toHaveBeenCalled();
    expect(imageEncodeTask).not.toHaveBeenCalled();
  });

  test("should execute HEVC QuickTime enable task", async () => {
    const mockAnswer = { input: "test.mp4" };
    const mockTaskDetail = {
      task: "hevc-enable-QuickTime" as const,
      answer: mockAnswer,
    };
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(true);
    await runCli();
    expect(enableHEVCQuickTimeTask).toHaveBeenCalled();
    expect(videoEncodeTask).not.toHaveBeenCalled();
    expect(imageEncodeTask).not.toHaveBeenCalled();
  });

  test("should execute image encode task with parameters", async () => {
    const mockAnswer = { input: "test.jpg" };
    const mockTaskDetail = {
      task: "image-encode" as const,
      answer: mockAnswer,
    };
    vi.mocked(getTaskDetail).mockResolvedValue(mockTaskDetail);
    vi.mocked(askForContinue).mockResolvedValue(true);
    await runCli();
    expect(imageEncodeTask).toHaveBeenCalledWith(mockAnswer);
    expect(videoEncodeTask).not.toHaveBeenCalled();
    expect(enableHEVCQuickTimeTask).not.toHaveBeenCalled();
  });
});
