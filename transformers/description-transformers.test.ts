import { describe, expect, it } from "vitest";

import { normalizeTaskDescription } from "./description-transformers.js";

describe("normalizeTaskDescription", () => {
  it("returns plain description when present", () => {
    expect(normalizeTaskDescription({ description: "plain text" })).toBe("plain text");
  });

  it("ignores markdown_description when description is present", () => {
    expect(
      normalizeTaskDescription({
        description: "plain text",
        markdown_description: "**formatted** text",
      }),
    ).toBe("plain text");
  });

  it("returns empty string when description is missing", () => {
    expect(normalizeTaskDescription({})).toBe("");
    expect(normalizeTaskDescription({ markdown_description: "**formatted** text" })).toBe("");
    expect(normalizeTaskDescription({ description: null, markdown_description: null })).toBe("");
    expect(normalizeTaskDescription(null)).toBe("");
    expect(normalizeTaskDescription(undefined)).toBe("");
  });
});
