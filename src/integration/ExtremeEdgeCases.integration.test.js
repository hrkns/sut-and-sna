import { waitFor, within } from "@testing-library/react";
import { getItem } from "../shared/db";
import { createAppValuesFixture } from "./fixtures/couFixtures";
import {
  APP_SECTIONS,
  getAccordionItemByTitle,
  openAccordionSection,
  renderApp,
  setBranchesCountInputValue,
  setSectionNumericInputByIndex,
} from "./utils/testHarness";

const CALCULATE_BUTTON_LABEL = /Calcular/i;

const clickCalculateByIndex = async (sectionTitle, buttonIndex, user) => {
  await openAccordionSection(sectionTitle, user);
  const section = getAccordionItemByTitle(sectionTitle);
  const calculateButtons = within(section).getAllByRole("button", {
    name: CALCULATE_BUTTON_LABEL,
  });
  await user.click(calculateButtons[buttonIndex]);
};

describe("Extreme edge-case integration coverage", () => {
  test("recovers from corrupted nested storage shape in CuPro and reconstructs missing subtree on compute", async () => {
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const cuProByActivity = {
      productionPerActivity: {
        resource: {
          branch1: 10,
          branch2: 20,
          branch3: 30,
          gov: 40,
          total: 100,
        },
      },
      intermediateConsumption: 0,
      vabPerActivity: {
        usage: {
          branch1: 6,
          branch2: 12,
          branch3: 18,
          gov: 24,
          total: 60,
        },
      },
      ckf: {
        usage: {
          branch1: 2,
          branch2: 3,
          branch3: 4,
          gov: 5,
          total: 14,
        },
      },
      vanPerActivity: {
        usage: {
          branch1: 4,
          branch2: 9,
          branch3: 14,
          gov: 19,
          total: 46,
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuProByActivity,
      },
    });

    await clickCalculateByIndex(APP_SECTIONS.cuPro, 0, user);

    await waitFor(() =>
      expect(
        getItem("cuProByActivity").intermediateConsumption.usage.total
      ).toBe(40)
    );

    const stored = getItem("cuProByActivity");
    expect(typeof stored.intermediateConsumption).toBe("object");
    expect(stored.intermediateConsumption.usage.branch1).toBe(4);
    expect(stored.intermediateConsumption.usage.branch2).toBe(8);
    expect(stored.intermediateConsumption.usage.branch3).toBe(12);
    expect(stored.intermediateConsumption.usage.gov).toBe(16);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("handles decimal precision and large magnitudes in CuPro compute", async () => {
    const appValues = createAppValuesFixture({ branchCount: 1 });
    const cuProByActivity = {
      productionPerActivity: {
        resource: {
          branch1: "0.3",
          gov: "1000000000.5",
          total: "1000000000.8",
        },
      },
      intermediateConsumption: {
        usage: {
          branch1: "",
          gov: "",
          total: "",
        },
      },
      vabPerActivity: {
        usage: {
          branch1: "0.2",
          gov: "1000000000.4",
          total: "1000000000.6",
        },
      },
      ckf: {
        usage: {
          branch1: "",
          gov: "",
          total: "",
        },
      },
      vanPerActivity: {
        usage: {
          branch1: "",
          gov: "",
          total: "",
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuProByActivity,
      },
    });

    await clickCalculateByIndex(APP_SECTIONS.cuPro, 0, user);

    await waitFor(() =>
      expect(
        getItem("cuProByActivity").intermediateConsumption.usage.total
      ).toBe(0.2)
    );

    const stored = getItem("cuProByActivity");
    expect(stored.intermediateConsumption.usage.branch1).toBeCloseTo(0.1, 10);
    expect(stored.intermediateConsumption.usage.gov).toBeCloseTo(0.1, 10);
    expect(stored.intermediateConsumption.usage.total).toBeCloseTo(0.2, 10);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("converges contradictory fully-specified CuGeI system and stays stable after first compute", async () => {
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const cuGeIByActivity = {
      vabPerActivity: {
        resource: {
          branch1: 10,
          branch2: 20,
          branch3: 30,
          gov: 40,
          total: 100,
        },
      },
      ra: {
        usage: {
          branch1: 1,
          branch2: 1,
          branch3: 1,
          gov: 1,
          total: 4,
        },
      },
      tax: {
        usage: {
          branch1: 1,
          branch2: 1,
          branch3: 1,
          gov: 999,
          total: 3,
        },
      },
      eeb: {
        usage: {
          branch1: 50,
          branch2: 50,
          branch3: 50,
          gov: 50,
          total: 200,
        },
      },
    };

    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByActivity,
      },
    });

    const beforeFirstCompute = JSON.parse(
      JSON.stringify(getItem("cuGeIByActivity"))
    );
    await clickCalculateByIndex(APP_SECTIONS.cuGeI, 0, user);
    const afterFirstCompute = JSON.parse(
      JSON.stringify(getItem("cuGeIByActivity"))
    );
    await clickCalculateByIndex(APP_SECTIONS.cuGeI, 0, user);
    await clickCalculateByIndex(APP_SECTIONS.cuGeI, 0, user);
    const afterRepeatedComputes = getItem("cuGeIByActivity");

    expect(afterFirstCompute).not.toEqual(beforeFirstCompute);
    expect(afterRepeatedComputes).toEqual(afterFirstCompute);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("deterministic random-like action sequence preserves core invariants", async () => {
    const { user } = renderApp();

    let seed = 20260415;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

    const actionCount = 35;
    for (let idx = 0; idx < actionCount; idx++) {
      const actionId = randInt(1, 9);
      if (actionId === 1) {
        setBranchesCountInputValue(randInt(1, 4));
      } else if (actionId === 2) {
        await setSectionNumericInputByIndex(
          APP_SECTIONS.cou,
          0,
          randInt(-50, 50),
          { user }
        );
      } else if (actionId === 3) {
        await clickCalculateByIndex(APP_SECTIONS.cou, 0, user);
      } else if (actionId === 4) {
        await clickCalculateByIndex(APP_SECTIONS.cuPro, 0, user);
      } else if (actionId === 5) {
        await clickCalculateByIndex(APP_SECTIONS.cuGeI, 0, user);
      } else if (actionId === 6) {
        await clickCalculateByIndex(APP_SECTIONS.cuADI, 0, user);
      } else if (actionId === 7) {
        await clickCalculateByIndex(APP_SECTIONS.cui, 0, user);
      } else if (actionId === 8) {
        await clickCalculateByIndex(APP_SECTIONS.cuCa, 0, user);
      } else {
        await clickCalculateByIndex(APP_SECTIONS.cuFi, 0, user);
      }
    }

    const storedAppValues = getItem("appValues");
    expect(storedAppValues).not.toBeNull();
    expect(storedAppValues.branches.length).toBeGreaterThanOrEqual(1);
    expect(storedAppValues.branches.length).toBeLessThanOrEqual(4);

    const objectBackedKeys = [
      "cou",
      "cuProByActivity",
      "cuProByInstitutionalSectors",
      "cuGeIByActivity",
      "cuGeIByInstitutionalSectors",
      "cuADIByInstitutionalSectors",
      "cUIByInstitutionalSectors",
      "cuCaByInstitutionalSectors",
      "cuFiByInstitutionalSectors",
    ];
    const invalidObjectBackedValues = objectBackedKeys
      .map((key) => [key, getItem(key)])
      .filter(
        ([, val]) =>
          val !== null && (typeof val !== "object" || Array.isArray(val))
      );

    expect(invalidObjectBackedValues).toEqual([]);

    expect(window.alert).not.toHaveBeenCalled();
  });
});
