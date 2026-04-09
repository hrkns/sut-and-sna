import { waitFor } from "@testing-library/react";
import { getItem } from "../shared/db";
import {
  createAppValuesFixture,
  createCouFixture,
} from "./fixtures/couFixtures";
import {
  APP_SECTIONS,
  clickSectionActionButton,
  renderApp,
} from "./utils/testHarness";

describe("COU compute golden path", () => {
  test("computes expected subtotal and column total values from a coherent matrix", async () => {
    const cou = createCouFixture({
      branchCount: 3,
      valuesByPath: {
        "branch1.intermediateUse.branch1": "1",
        "branch1.intermediateUse.branch2": "2",
        "branch1.intermediateUse.branch3": "3",
        "branch1.intermediateUse.gov": "4",
        "branch2.intermediateUse.branch1": "5",
        "branch3.intermediateUse.branch1": "6",
        "imports.intermediateUse.branch1": "7",
      },
    });
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickSectionActionButton(APP_SECTIONS.cou, /Calcular/i, user);

    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.st).toBe("10")
    );
    await waitFor(() =>
      expect(getItem("cou").totalUses.intermediateUse.branch1).toBe("19")
    );
    await waitFor(() =>
      expect(getItem("appValues").cou.branch1.intermediateUse.st).toBe("10")
    );

    expect(window.alert).not.toHaveBeenCalled();
  });
});
