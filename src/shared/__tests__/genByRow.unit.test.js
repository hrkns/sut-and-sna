import genByRow from "../genByRow";

describe("genByRow", () => {
  test("returns x when current row matches and varSide is omitted", () => {
    expect(genByRow("imports", "resource", "rm", "imports")).toBe("x");
  });

  test("returns x when current row matches and varSide matches side", () => {
    expect(genByRow("imports", "resource", "rm", "imports", "resource")).toBe(
      "x"
    );
  });

  test("returns row path when side does not match varSide", () => {
    expect(genByRow("imports", "resource", "rm", "imports", "usage")).toBe(
      "imports.resource.rm"
    );
  });

  test("returns current row path when rows differ", () => {
    expect(genByRow("imports", "resource", "rm", "exports")).toBe(
      "exports.resource.rm"
    );
  });
});
