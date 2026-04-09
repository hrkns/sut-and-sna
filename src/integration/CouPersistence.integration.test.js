import { waitFor } from "@testing-library/react";
import { getItem } from "../shared/db";
import {
  APP_SECTIONS,
  getSectionNumericInputValueByIndex,
  renderApp,
  setSectionNumericInputByIndex,
} from "./utils/testHarness";

describe("COU manual entry and persistence", () => {
  test("manual COU input persists in cou and appValues storage", async () => {
    const { user } = renderApp();

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, "11", { user });

    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch1).toBe("11")
    );
    await waitFor(() =>
      expect(getItem("appValues").cou.branch1.intermediateUse.branch1).toBe(
        "11"
      )
    );
  });

  test("COU values are restored after reload-style re-render", async () => {
    const { user, unmount } = renderApp();

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, "17", { user });

    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch1).toBe("17")
    );

    const storedCou = getItem("cou");
    const storedAppValues = getItem("appValues");

    unmount();
    renderApp({
      storage: {
        cou: storedCou,
        appValues: storedAppValues,
      },
    });

    await waitFor(() =>
      expect(getSectionNumericInputValueByIndex(APP_SECTIONS.cou, 0)).toBe("17")
    );
  });
});
