import { describe, expect, it } from "vitest";
import { draftTitle, emptyContent, hashtagsIn, readContent, relativeTime, validatePost } from "./posts";

describe("posts", () => {
  it("flags a Shorts title over 100 characters in the board's words", () => {
    const c = emptyContent();
    c.youtube.title = "x".repeat(104);
    expect(validatePost("clip_caption", c)["youtube.title"]).toBe("100 characters max for Shorts titles (you have 104)");
    c.youtube.title = "x".repeat(100);
    expect(validatePost("clip_caption", c)).toEqual({});
  });

  it("checks Instagram caption length and hashtag count", () => {
    const c = emptyContent();
    c.instagram.caption = "a".repeat(2201);
    expect(validatePost("caption", c)["instagram.caption"]).toBe("2,200 characters max for Instagram captions (you have 2,201)");
    c.instagram.caption = Array.from({ length: 31 }, (_, i) => `#t${i}`).join(" ");
    expect(validatePost("caption", c)["instagram.caption"]).toBe("30 hashtags max on Instagram (you have 31)");
  });

  it("only checks the script field for scripts", () => {
    const c = emptyContent();
    c.youtube.title = "x".repeat(200);
    expect(validatePost("script", c)).toEqual({});
  });

  it("reads partial stored content and names drafts", () => {
    const c = readContent({ instagram: { caption: "Myth #1: you need to track every naira.\nMore #budgeting" } });
    expect(c.youtube.title).toBe("");
    expect(draftTitle("caption", c)).toBe("Myth : you need to track every naira.");
    expect(draftTitle("clip_caption", c, "5 budgeting myths")).toBe("5 budgeting myths");
    expect(draftTitle("script", emptyContent())).toBe("Untitled script");
    expect(hashtagsIn("a #budgeting b #budgeting #studentlife")).toEqual(["budgeting", "studentlife"]);
  });

  it("says when a draft was updated", () => {
    const now = new Date("2026-11-19T15:00:00Z");
    expect(relativeTime(new Date("2026-11-19T13:00:00Z"), now)).toBe("2h ago");
    expect(relativeTime(new Date("2026-11-18T13:00:00Z"), now)).toBe("Yesterday");
    expect(relativeTime(new Date("2026-11-12T13:00:00Z"), now)).toBe("12 Nov");
  });
});
