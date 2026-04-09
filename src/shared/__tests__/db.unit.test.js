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

  test("setItem supports primitive payloads", () => {
    setItem("number", 7);
    setItem("text", "hello");
    setItem("flag", false);

    expect(getItem("number")).toBe(7);
    expect(getItem("text")).toBe("hello");
    expect(getItem("flag")).toBe(false);
  });

  test("getItem throws when stored value is invalid JSON", () => {
    window.localStorage.setItem("couApp_broken", "{bad-json");

    expect(() => getItem("broken")).toThrow();
  });

  test("setItem with undefined stores unparsable value that later throws", () => {
    setItem("undef", undefined);

    expect(window.localStorage.getItem("couApp_undef")).toBe("undefined");
    expect(() => getItem("undef")).toThrow();
  });
});
