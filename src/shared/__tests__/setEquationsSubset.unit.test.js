import setEquationsSubset from "../setEquationsSubset";

describe("setEquationsSubset", () => {
  test("creates equations for branches, gov and total", () => {
    const equations = {};
    const equationBuilder = jest.fn((row, col, side) => [row, col, side]);

    setEquationsSubset([1, 2], equations, "imports", "resource", equationBuilder);

    expect(equations).toEqual({
      "imports.resource.branch1": [["imports", "branch1", "resource"]],
      "imports.resource.branch2": [["imports", "branch2", "resource"]],
      "imports.resource.gov": [["imports", "gov", "resource"]],
      "imports.resource.total": [["imports", "total", "resource"]],
    });
    expect(equationBuilder).toHaveBeenCalledTimes(4);
  });

  test("keeps gov and total keys empty when builder returns null", () => {
    const equations = {};
    const equationBuilder = jest.fn((row, col, side) => {
      if (col === "gov" || col === "total") return null;
      return [row, col, side];
    });

    setEquationsSubset([1], equations, "tax", "usage", equationBuilder);

    expect(equations["tax.usage.branch1"]).toEqual([["tax", "branch1", "usage"]]);
    expect(equations["tax.usage.gov"]).toEqual([]);
    expect(equations["tax.usage.total"]).toEqual([]);
  });

  test("appends to existing equations without overwriting previous values", () => {
    const equations = {
      "vab.usage.branch1": [["existing-branch"]],
      "vab.usage.gov": [["existing-gov"]],
      "vab.usage.total": [["existing-total"]],
    };
    const equationBuilder = jest.fn((row, col, side) => [row, col, side]);

    setEquationsSubset([1], equations, "vab", "usage", equationBuilder);

    expect(equations["vab.usage.branch1"]).toEqual([
      ["existing-branch"],
      ["vab", "branch1", "usage"],
    ]);
    expect(equations["vab.usage.gov"]).toEqual([
      ["existing-gov"],
      ["vab", "gov", "usage"],
    ]);
    expect(equations["vab.usage.total"]).toEqual([
      ["existing-total"],
      ["vab", "total", "usage"],
    ]);
  });

  test("still creates gov and total keys when there are no branches", () => {
    const equations = {};
    const equationBuilder = jest.fn((row, col, side) => [row, col, side]);

    setEquationsSubset([], equations, "imports", "resource", equationBuilder);

    expect(equations).toEqual({
      "imports.resource.gov": [["imports", "gov", "resource"]],
      "imports.resource.total": [["imports", "total", "resource"]],
    });
    expect(equationBuilder).toHaveBeenCalledTimes(2);
  });

  test("pushes branch equations even when builder returns undefined", () => {
    const equations = {};
    const equationBuilder = jest.fn((row, col, side) => {
      if (col === "branch1") return undefined;
      return [row, col, side];
    });

    setEquationsSubset([1], equations, "row", "usage", equationBuilder);

    expect(equations["row.usage.branch1"]).toEqual([undefined]);
    expect(equations["row.usage.gov"]).toEqual([["row", "gov", "usage"]]);
    expect(equations["row.usage.total"]).toEqual([["row", "total", "usage"]]);
  });
});
