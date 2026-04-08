import hasContent from "../hasContent";

describe("hasContent", () => {
  test("returns false for nullish values and empty string", () => {
    expect(hasContent(null)).toBe(false);
    expect(hasContent(undefined)).toBe(false);
    expect(hasContent("")).toBe(false);
  });

  test("returns true for numeric and non-empty string values", () => {
    expect(hasContent(0)).toBe(true);
    expect(hasContent("0")).toBe(true);
    expect(hasContent("  ")).toBe(true);
    expect(hasContent("value")).toBe(true);
  });
});
