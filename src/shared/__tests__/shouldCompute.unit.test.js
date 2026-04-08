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
});
