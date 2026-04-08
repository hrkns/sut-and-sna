import solveEquation from "../solveEquation";

describe("solveEquation", () => {
  test("solves simple addition equation", () => {
    expect(solveEquation("x+(2)", "(5)")).toBe(3);
  });

  test("solves equation with a negative number", () => {
    expect(solveEquation("x-(-2)", "(5)")).toBe(3);
  });

  test("solves equation with decimal result", () => {
    expect(solveEquation("x+(1)", "(2.5)")).toBeCloseTo(1.5);
  });
});
