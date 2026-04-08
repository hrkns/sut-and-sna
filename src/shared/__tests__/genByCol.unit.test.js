import genByCol from "../genByCol";

describe("genByCol", () => {
  test("returns x when current column matches the target column", () => {
    expect(genByCol("row1", "usage", "gov", "gov")).toBe("x");
  });

  test("returns a path pointing to the current column when columns differ", () => {
    expect(genByCol("row1", "usage", "total", "gov")).toBe("row1.usage.gov");
  });
});
