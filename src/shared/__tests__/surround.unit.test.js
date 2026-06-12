import surround from "../surround";

describe("surround", () => {
  test("wraps value with parentheses", () => {
    expect(surround("123")).toBe("(123)");
    expect(surround("-9")).toBe("(-9)");
  });

  test("coerces non-string values via concatenation semantics", () => {
    expect(surround(0)).toBe("(0)");
    expect(surround(null)).toBe("(null)");
  });

  test("supports empty strings", () => {
    expect(surround("")).toBe("()");
  });
});
