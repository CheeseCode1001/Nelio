import { describe, expect, it } from "vitest";
import { checkUpload, formatBytes, formatDuration, processingEstimate, processingSplit, renderEstimate, videoTypeFor } from "./media";

describe("upload checks", () => {
  it("accepts MP4 and MOV, by type or by extension", () => {
    expect(videoTypeFor("a.mp4", "video/mp4")).toBe("video/mp4");
    expect(videoTypeFor("a.MOV", "")).toBe("video/quicktime");
    expect(videoTypeFor("party_photos.zip", "application/zip")).toBeNull();
  });
  it("uses the board's wording for a wrong file", () => {
    expect(checkUpload({ name: "party_photos.zip", type: "application/zip", size: 10 })?.text).toBe("party_photos.zip isn’t a video. Upload MP4 or MOV up to 2 GB.");
  });
  it("rejects files over 2 GB and over 2 hours", () => {
    expect(checkUpload({ name: "a.mp4", type: "video/mp4", size: 2 * 1024 ** 3 + 1 })?.code).toBe("size");
    expect(checkUpload({ name: "a.mp4", type: "video/mp4", size: 100, durationSec: 7201 })?.code).toBe("duration");
    expect(checkUpload({ name: "a.mp4", type: "video/mp4", size: 100, durationSec: 3000 })).toBeNull();
  });
});

describe("credit estimates", () => {
  it("matches the Upload board: 52 minutes ≈ 22 at Balanced, ≈ 9 at Fast", () => {
    expect(processingEstimate(52 * 60, "balanced")).toBe(22);
    expect(processingEstimate(52 * 60, "fast")).toBe(9);
  });
  it("splits a run estimate across its steps without losing credits", () => {
    const s = processingSplit(22);
    expect(Object.values(s).reduce((a, b) => a + b, 0)).toBe(22);
    expect(s.check_file).toBe(0);
  });
  it("matches the Studio board: a 42-second clip renders for ≈ 18", () => {
    expect(renderEstimate(42)).toBe(19);
    expect(renderEstimate(41)).toBe(18);
  });
});

describe("formatting", () => {
  it("formats durations and sizes like the boards", () => {
    expect(formatDuration(48 * 60)).toBe("48 min");
    expect(formatDuration(42, "clock")).toBe("0:42");
    expect(formatDuration(72 * 60)).toBe("1 h 12 min");
    expect(formatBytes(2.3 * 1024 ** 3)).toBe("2.3 GB");
  });
});
