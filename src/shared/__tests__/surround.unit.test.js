import surround from "../surround";

describe("surround", () => {
  test("wraps value with parentheses", () => {
    expect(surround("123")).toBe("(123)");
    expect(surround("-9")).toBe("(-9)");
  });
});
