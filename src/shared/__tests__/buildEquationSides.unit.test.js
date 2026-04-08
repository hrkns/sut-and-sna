import buildEquationSides from "../buildEquationSides";

describe("buildEquationSides", () => {
  test("builds left and right expressions from equation tokens", () => {
    const equation = ["x", "+", "rows.a", "-", "rows.b", "=", "rows.c"];
    const values = {
      rows: {
        a: 2,
        b: -3,
        c: 7,
      },
    };

    expect(buildEquationSides(equation, values)).toEqual({
      leftSide: "x+(2)-(-3)",
      rightSide: "(7)",
    });
  });

  test("skips unresolved value tokens", () => {
    const equation = ["x", "+", "rows.missing", "=", "rows.c"];
    const values = {
      rows: {
        c: 5,
      },
    };

    expect(buildEquationSides(equation, values)).toEqual({
      leftSide: "x+",
      rightSide: "(5)",
    });
  });
});
