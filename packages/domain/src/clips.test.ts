import { describe, expect, it } from "vitest";
import { assColour, buildAss, captionChunks, clampClip, cropFor, describeChanges, formatRange, formatStamp, transcriptLines, type ClipSnapshot, type Word } from "./clips";

const words: Word[] = [
  { w: "Okay,", s: 12000, e: 12300, sp: 0 },
  { w: "stop", s: 12400, e: 12600, sp: 0 },
  { w: "budgeting", s: 12650, e: 13100, sp: 0 },
  { w: "like", s: 13150, e: 13300, sp: 0 },
  { w: "this.", s: 13350, e: 13700, sp: 0 },
  { w: "Nobody", s: 21000, e: 21300, sp: 1 },
  { w: "does", s: 21350, e: 21600, sp: 1 },
  { w: "that.", s: 21650, e: 22000, sp: 1 },
];

describe("clips", () => {
  it("groups words into lines by sentence and speaker", () => {
    const lines = transcriptLines(words);
    expect(lines.map((l) => l.text)).toEqual(["Okay, stop budgeting like this.", "Nobody does that."]);
    expect(lines[1]).toMatchObject({ start: 21000, end: 22000, sp: 1 });
  });

  it("keeps clips between 8 and 90 seconds inside the video", () => {
    expect(clampClip(1000, 3000, 60000)).toEqual({ startMs: 1000, endMs: 9000 });
    expect(clampClip(0, 200000, 300000)).toEqual({ startMs: 0, endMs: 90000 });
    expect(clampClip(55000, 70000, 60000)).toEqual({ startMs: 52000, endMs: 60000 });
    expect(clampClip(-50, 20000, 60000)).toEqual({ startMs: 0, endMs: 20000 });
  });

  it("formats ranges and stamps like the board", () => {
    expect(formatRange(12000, 54000)).toBe("0:12–0:54");
    expect(formatRange(760000, 795000)).toBe("12:40–13:15");
    expect(formatStamp(12000)).toBe("00:12");
  });

  it("chunks captions relative to the clip start, upper-case for Bold pop", () => {
    const c = captionChunks(words, 12000, 22000, "bold_pop");
    expect(c[0]).toEqual({ start: 0, end: 400, text: "OKAY," });
    expect(c[1]!.text).toBe("STOP BUDGETING LIKE");
    expect(c.every((x) => x.end <= 10000)).toBe(true);
    expect(captionChunks(words, 12000, 22000, "clean")[1]!.text).toBe("stop budgeting like this.");
  });

  it("builds a captions file with the hook, captions and end card", () => {
    const ass = buildAss(captionChunks(words, 12000, 22000, "bold_pop"), { format: "9:16", style: "bold_pop", sizePct: 100, font: "Plus Jakarta Sans", hook: "Stop budgeting like this", endCard: "Ada Studio", clipMs: 10000 });
    expect(ass).toContain("PlayResX: 1080");
    expect(ass).toContain("Hook,,0,0,0,,STOP BUDGETING LIKE THIS");
    expect(ass).toContain("Dialogue: 0,0:00:00.00,0:00:00.40,Caption");
    expect(ass).toContain("0:00:08.50,0:00:10.00,End,,0,0,0,,Ada Studio");
    expect(assColour("#FFD43B")).toBe("&H003BD4FF");
  });

  it("crops to fill the format from the centre", () => {
    expect(cropFor(1920, 1080, "9:16")).toEqual({ w: 606, h: 1080, x: 657, y: 0 });
    expect(cropFor(1080, 1920, "9:16")).toEqual({ w: 1080, h: 1920, x: 0, y: 0 });
    expect(cropFor(1080, 1920, "1:1")).toEqual({ w: 1080, h: 1080, x: 0, y: 420 });
  });

  it("describes what changed since the last save", () => {
    const a: ClipSnapshot = { startMs: 0, endMs: 9000, hook: "h", captionStyle: "bold_pop", captionSize: 100, format: "9:16", brandKitId: null };
    expect(describeChanges(a, a)).toBe("");
    expect(describeChanges(a, { ...a, endMs: 9500, captionSize: 120 })).toBe("Trim and caption size changed since your last save.");
    expect(describeChanges(a, { ...a, hook: "x", format: "1:1", brandKitId: "k" })).toBe("Hook, format and brand kit changed since your last save.");
  });
});
