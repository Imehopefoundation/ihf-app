import { describe, it, expect } from "vitest";
import { parseVideoUrl, embedUrl } from "./video";

describe("parseVideoUrl", () => {
  it("accepts YouTube watch / short / embed / nocookie links", () => {
    expect(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      ref: "dQw4w9WgXcQ",
    });
    expect(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ?si=abc")).toEqual({
      provider: "youtube",
      ref: "dQw4w9WgXcQ",
    });
    expect(parseVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      ref: "dQw4w9WgXcQ",
    });
    expect(parseVideoUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10s")?.provider).toBe(
      "youtube",
    );
  });

  it("accepts Vimeo links", () => {
    expect(parseVideoUrl("https://vimeo.com/123456789")).toEqual({
      provider: "vimeo",
      ref: "123456789",
    });
    expect(parseVideoUrl("https://player.vimeo.com/video/123456789")).toEqual({
      provider: "vimeo",
      ref: "123456789",
    });
  });

  it("rejects anything that is not YouTube/Vimeo or not https", () => {
    expect(parseVideoUrl("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseVideoUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull(); // not https
    expect(parseVideoUrl("javascript:alert(1)")).toBeNull();
    expect(parseVideoUrl("https://www.youtube.com/watch?v=tooShort")).toBeNull();
    expect(parseVideoUrl("not a url")).toBeNull();
    expect(parseVideoUrl("https://vimeo.com/notanumber")).toBeNull();
    // look-alike host must not pass
    expect(parseVideoUrl("https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("builds allow-listed embed URLs", () => {
    expect(embedUrl("youtube", "dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(embedUrl("vimeo", "123456789")).toBe("https://player.vimeo.com/video/123456789");
  });
});
