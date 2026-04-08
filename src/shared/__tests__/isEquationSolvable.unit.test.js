import isEquationSolvable from "../isEquationSolvable";

describe("isEquationSolvable", () => {
  test("returns true when exactly one value is unknown", () => {
    const equation = ["x", "+", "table.a", "=", "table.b"];
    const values = {
      table: {
        a: 2,
        b: 5,
      },
    };

    expect(isEquationSolvable(equation, values)).toBe(true);
  });

  test("returns false when more than one value is unknown", () => {
    const equation = ["x", "+", "table.a", "=", "table.b"];
    const values = {
      table: {
        b: 5,
      },
    };

    expect(isEquationSolvable(equation, values)).toBe(false);
  });

  test("returns false when equation has no x placeholder", () => {
    const equation = ["table.a", "+", "table.b", "=", "table.c"];
    const values = {
      table: {
        a: 1,
        b: 2,
        c: 3,
      },
    };

    expect(isEquationSolvable(equation, values)).toBe(false);
  });
});
