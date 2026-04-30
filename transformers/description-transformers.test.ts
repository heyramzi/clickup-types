import { describe, expect, it } from "vitest";

import {
  isQuillDeltaJson,
  normalizeTaskDescription,
  quillDeltaToMarkdown,
} from "./description-transformers.js";

describe("isQuillDeltaJson", () => {
  it("returns true for raw Quill Delta JSON", () => {
    expect(isQuillDeltaJson('{"ops":[{"insert":"hello"}]}')).toBe(true);
  });

  it("tolerates leading whitespace", () => {
    expect(isQuillDeltaJson('  \n{"ops":[{"insert":"hi"}]}')).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isQuillDeltaJson("hello world")).toBe(false);
  });

  it("returns false for markdown", () => {
    expect(isQuillDeltaJson("**bold** text\n- item")).toBe(false);
  });

  it("returns false for empty input", () => {
    expect(isQuillDeltaJson("")).toBe(false);
  });

  it("returns false for JSON without an ops field", () => {
    expect(isQuillDeltaJson('{"foo":"bar"}')).toBe(false);
  });

  it("returns false when ops appears far past the prefix window", () => {
    const longPrefix = `{"a":"${"x".repeat(80)}","ops":[]}`;
    expect(isQuillDeltaJson(longPrefix)).toBe(false);
  });
});

describe("quillDeltaToMarkdown", () => {
  it("preserves bold inline formatting", () => {
    const input = JSON.stringify({
      ops: [
        { insert: "hello " },
        { insert: "world", attributes: { bold: true } },
        { insert: "\n" },
      ],
    });
    expect(quillDeltaToMarkdown(input)).toBe("hello **world**");
  });

  it("preserves italic inline formatting", () => {
    const input = JSON.stringify({
      ops: [{ insert: "tilt", attributes: { italic: true } }, { insert: "\n" }],
    });
    expect(quillDeltaToMarkdown(input)).toBe("*tilt*");
  });

  it("renders unordered (bullet) lists", () => {
    const input = JSON.stringify({
      ops: [
        { insert: "first" },
        { insert: "\n", attributes: { list: "bullet" } },
        { insert: "second" },
        { insert: "\n", attributes: { list: "bullet" } },
      ],
    });
    expect(quillDeltaToMarkdown(input)).toBe("- first\n- second");
  });

  it("renders ordered lists with sequential numbering", () => {
    const input = JSON.stringify({
      ops: [
        { insert: "alpha" },
        { insert: "\n", attributes: { list: "ordered" } },
        { insert: "beta" },
        { insert: "\n", attributes: { list: "ordered" } },
        { insert: "gamma" },
        { insert: "\n", attributes: { list: "ordered" } },
      ],
    });
    expect(quillDeltaToMarkdown(input)).toBe("1. alpha\n2. beta\n3. gamma");
  });

  it("resets ordered counter when list type changes", () => {
    const input = JSON.stringify({
      ops: [
        { insert: "one" },
        { insert: "\n", attributes: { list: "ordered" } },
        { insert: "two" },
        { insert: "\n", attributes: { list: "ordered" } },
        { insert: "bullet" },
        { insert: "\n", attributes: { list: "bullet" } },
        { insert: "again" },
        { insert: "\n", attributes: { list: "ordered" } },
      ],
    });
    expect(quillDeltaToMarkdown(input)).toBe("1. one\n2. two\n- bullet\n1. again");
  });

  it("renders checked and unchecked checklist items", () => {
    const input = JSON.stringify({
      ops: [
        { insert: "done" },
        { insert: "\n", attributes: { list: "checked" } },
        { insert: "todo" },
        { insert: "\n", attributes: { list: "unchecked" } },
      ],
    });
    expect(quillDeltaToMarkdown(input)).toBe("- [x] done\n- [ ] todo");
  });

  it("returns empty string for malformed JSON", () => {
    expect(quillDeltaToMarkdown("{not json")).toBe("");
  });

  it("returns empty string when ops field is missing", () => {
    expect(quillDeltaToMarkdown('{"foo":"bar"}')).toBe("");
  });
});

describe("normalizeTaskDescription", () => {
  it("prefers markdown_description when present", () => {
    const result = normalizeTaskDescription({
      markdown_description: "**clean** markdown",
      description: '{"ops":[{"insert":"raw"}]}',
    });
    expect(result).toBe("**clean** markdown");
  });

  it("falls back to Quill conversion when markdown_description is empty", () => {
    const result = normalizeTaskDescription({
      markdown_description: "",
      description: JSON.stringify({
        ops: [{ insert: "bold", attributes: { bold: true } }, { insert: "\n" }],
      }),
    });
    expect(result).toBe("**bold**");
  });

  it("falls back to text_content Quill conversion when description is absent", () => {
    const result = normalizeTaskDescription({
      text_content: JSON.stringify({
        ops: [{ insert: "todo" }, { insert: "\n", attributes: { list: "bullet" } }],
      }),
    });
    expect(result).toBe("- todo");
  });

  it("falls back to description when not Quill JSON", () => {
    const result = normalizeTaskDescription({ description: "plain text" });
    expect(result).toBe("plain text");
  });

  it("returns empty string for empty inputs", () => {
    expect(normalizeTaskDescription({})).toBe("");
    expect(normalizeTaskDescription({ description: "" })).toBe("");
    expect(normalizeTaskDescription({ description: null, markdown_description: null })).toBe("");
  });

  it("returns empty string for null/undefined task", () => {
    expect(normalizeTaskDescription(null)).toBe("");
    expect(normalizeTaskDescription(undefined)).toBe("");
  });

  it("returns description verbatim when malformed Quill-looking JSON", () => {
    // WHY: isQuillDeltaJson is structural — if the string fails parsing inside
    // quillDeltaToMarkdown we return "" rather than leaking raw JSON. This test
    // documents that behavior so callers know malformed Quill input is dropped.
    const result = normalizeTaskDescription({
      description: '{"ops": not json',
    });
    expect(result).toBe("");
  });
});
