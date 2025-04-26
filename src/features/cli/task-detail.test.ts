import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  askForHEVCEnableQuickTimeAnswer,
  askForImageEncodeAnswer,
  askForTask,
  askForVideoEncodeAnswer,
} from "../../libs/prompt";
import { getTaskDetail } from "./task-detail";

vi.mock("../../libs/prompt", () => ({
  askForTask: vi.fn(),
  askForVideoEncodeAnswer: vi.fn(),
  askForHEVCEnableQuickTimeAnswer: vi.fn(),
  askForImageEncodeAnswer: vi.fn(),
}));

describe("getTaskDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return video encode task details", async () => {
    vi.mocked(askForTask).mockResolvedValue("video-encode");
    const mockAnswer = { input: "test.mp4" };
    vi.mocked(askForVideoEncodeAnswer).mockResolvedValue(mockAnswer);
    const result = await getTaskDetail();
    expect(result).toEqual({ task: "video-encode", answer: mockAnswer });
    expect(askForVideoEncodeAnswer).toHaveBeenCalled();
  });

  it("should return HEVC QuickTime enable details", async () => {
    vi.mocked(askForTask).mockResolvedValue("hevc-enable-QuickTime");
    const mockAnswer = { input: "test.mp4" };
    vi.mocked(askForHEVCEnableQuickTimeAnswer).mockResolvedValue(mockAnswer);
    const result = await getTaskDetail();
    expect(result).toEqual({
      task: "hevc-enable-QuickTime",
      answer: mockAnswer,
    });
    expect(askForHEVCEnableQuickTimeAnswer).toHaveBeenCalled();
  });

  it("should return image encode task details", async () => {
    vi.mocked(askForTask).mockResolvedValue("image-encode");
    const mockAnswer = { input: "test.jpg" };
    vi.mocked(askForImageEncodeAnswer).mockResolvedValue(mockAnswer);
    const result = await getTaskDetail();
    expect(result).toEqual({ task: "image-encode", answer: mockAnswer });
    expect(askForImageEncodeAnswer).toHaveBeenCalled();
  });
});
