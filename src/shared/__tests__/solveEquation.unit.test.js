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

  test("supports numeric inputs that are coerced to strings", () => {
    expect(solveEquation("x+2", 8)).toBe(6);
  });

  test("solves equations containing division", () => {
    expect(solveEquation("x/2", 3)).toBe(6);
  });

  test("throws for invalid equations", () => {
    expect(() => solveEquation("x+", "(5)")).toThrow();
  });
});
