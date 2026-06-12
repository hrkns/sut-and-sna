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

  test("keeps zero values and drops empty string values", () => {
    const equation = ["rows.a", "+", "rows.b", "=", "rows.c"];
    const values = {
      rows: {
        a: 0,
        b: "",
        c: 10,
      },
    };

    expect(buildEquationSides(equation, values)).toEqual({
      leftSide: "(0)+",
      rightSide: "(10)",
    });
  });

  test("supports multiple equals by continuing on right side", () => {
    const equation = ["x", "=", "rows.a", "=", "rows.b"];
    const values = {
      rows: {
        a: 2,
        b: 3,
      },
    };

    expect(buildEquationSides(equation, values)).toEqual({
      leftSide: "x",
      rightSide: "(2)(3)",
    });
  });

  test("handles empty equations", () => {
    expect(buildEquationSides([], {})).toEqual({
      leftSide: "",
      rightSide: "",
    });
  });
});
