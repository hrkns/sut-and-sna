import { getItem, setItem } from "../db";

describe("db", () => {
  test("setItem stores values under the expected namespaced key", () => {
    const payload = { answer: 42, list: [1, 2, 3] };

    setItem("sample", payload);

    expect(window.localStorage.getItem("couApp_sample")).toBe(
      JSON.stringify(payload)
    );
  });

  test("getItem retrieves and parses stored values", () => {
    const payload = { nested: { ok: true } };
    window.localStorage.setItem("couApp_saved", JSON.stringify(payload));

    expect(getItem("saved")).toEqual(payload);
  });

  test("getItem returns null for missing values", () => {
    expect(getItem("missing")).toBeNull();
  });
});
