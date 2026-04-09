import shouldCompute from "../shouldCompute";

describe("shouldCompute", () => {
  test("updates table and returns true when value changed", () => {
    const table = { row: { col: 1 } };

    const computed = shouldCompute(table, 2, "row.col");

    expect(computed).toBe(true);
    expect(table.row.col).toBe(2);
  });

  test("returns false and keeps table value when value did not change", () => {
    const table = { row: { col: 3 } };

    const computed = shouldCompute(table, 3, "row.col");

    expect(computed).toBe(false);
    expect(table.row.col).toBe(3);
  });

  test("returns false and keeps table value when new value has no content", () => {
    const table = { row: { col: 3 } };

    expect(shouldCompute(table, "", "row.col")).toBe(false);
    expect(table.row.col).toBe(3);

    expect(shouldCompute(table, null, "row.col")).toBe(false);
    expect(table.row.col).toBe(3);
  });

  test("creates missing nested path when computed value has content", () => {
    const table = {};

    const computed = shouldCompute(table, 10, "a.b.c");

    expect(computed).toBe(true);
    expect(table).toEqual({
      a: {
        b: {
          c: 10,
        },
      },
    });
  });

  test("treats zero as a computable value", () => {
    const table = { row: { col: null } };

    const computed = shouldCompute(table, 0, "row.col");

    expect(computed).toBe(true);
    expect(table.row.col).toBe(0);
  });

  test("always treats NaN as changed when compared against NaN", () => {
    const table = { row: { col: Number.NaN } };

    const computed = shouldCompute(table, Number.NaN, "row.col");

    expect(computed).toBe(true);
    expect(Number.isNaN(table.row.col)).toBe(true);
  });
});
