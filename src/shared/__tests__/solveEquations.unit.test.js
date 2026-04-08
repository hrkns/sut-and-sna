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
});
