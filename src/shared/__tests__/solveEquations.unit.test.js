import solveEquations from "../solveEquations";

describe("solveEquations", () => {
  test("computes a solvable cell and saves updated table", () => {
    const equations = {
      a: [["x", "+", "b", "=", "c"]],
    };
    const table = {
      a: null,
      b: 2,
      c: 5,
    };
    const saver = jest.fn();

    solveEquations(equations, table, saver, "Test table");

    expect(table.a).toBe(3);
    expect(saver).toHaveBeenCalledTimes(1);
    expect(saver).toHaveBeenCalledWith(table);
  });

  test("does not modify table when equations are not solvable", () => {
    const equations = {
      a: [["x", "+", "b", "=", "c"]],
    };
    const table = {
      a: null,
      b: null,
      c: 5,
    };
    const saver = jest.fn();

    solveEquations(equations, table, saver, "Unsolvable table");

    expect(table.a).toBeNull();
    expect(saver).toHaveBeenCalledTimes(1);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("alerts when reaching max iterations", () => {
    const equations = {
      a: [["x", "+", "b", "=", "c"]],
      b: [["x", "+", "a", "=", "d"]],
    };
    const table = {
      a: 0,
      b: 0,
      c: 1,
      d: 2,
    };
    const saver = jest.fn();

    solveEquations(equations, table, saver, "Inconsistent system");

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Inconsistent system")
    );
    expect(saver).toHaveBeenCalledTimes(1);
  });

  test("handles empty equation sets and still saves table", () => {
    const table = { keep: 1 };
    const saver = jest.fn();

    solveEquations({}, table, saver, "Empty table");

    expect(table).toEqual({ keep: 1 });
    expect(window.alert).not.toHaveBeenCalled();
    expect(saver).toHaveBeenCalledTimes(1);
    expect(saver).toHaveBeenCalledWith(table);
  });

  test("uses additional iterations to solve dependent cells", () => {
    const equations = {
      a: [["x", "+", "b", "=", "c"]],
      d: [["x", "=", "a", "+", "e"]],
    };
    const table = {
      a: null,
      b: 2,
      c: 5,
      d: null,
      e: 1,
    };
    const saver = jest.fn();

    solveEquations(equations, table, saver, "Dependent system");

    expect(table.a).toBe(3);
    expect(table.d).toBe(4);
    expect(window.alert).not.toHaveBeenCalled();
    expect(saver).toHaveBeenCalledTimes(1);
  });

  test("tries later equations for a cell when earlier ones are not solvable", () => {
    const equations = {
      a: [
        ["x", "+", "b", "=", "c"],
        ["x", "+", "q", "=", "r"],
      ],
    };
    const table = {
      a: null,
      b: null,
      c: 10,
      q: 1,
      r: 4,
    };
    const saver = jest.fn();

    solveEquations(equations, table, saver, "Fallback equations");

    expect(table.a).toBe(3);
    expect(window.alert).not.toHaveBeenCalled();
    expect(saver).toHaveBeenCalledTimes(1);
  });

  test("does not iterate forever when computed value is equal to current value", () => {
    const equations = {
      a: [["x", "+", "b", "=", "c"]],
    };
    const table = {
      a: 3,
      b: 2,
      c: 5,
    };
    const saver = jest.fn();

    solveEquations(equations, table, saver, "Stable values");

    expect(table.a).toBe(3);
    expect(window.alert).not.toHaveBeenCalled();
    expect(saver).toHaveBeenCalledTimes(1);
  });
});
