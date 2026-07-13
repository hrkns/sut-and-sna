import { waitFor, within } from "@testing-library/react";
import { getItem } from "../shared/db";
import {
  createAppValuesFixture,
  createCouFixture,
} from "./fixtures/couFixtures";
import {
  APP_SECTIONS,
  getBranchesCountInput,
  openAccordionSection,
  renderApp,
  setSectionNumericInputByIndex,
} from "./utils/testHarness";

const clickSectionActionButtonByIndex = async (
  sectionTitle,
  actionLabel,
  actionIndex,
  user
) => {
  const section = await openAccordionSection(sectionTitle, user);
  const actionButtons = within(section).getAllByRole("button", {
    name: actionLabel,
  });
  await user.click(actionButtons[actionIndex]);
};

describe("Advanced integration behavior", () => {
  test("retrieve from COU keeps manual branch values when source row is partial", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath: {
        "vab.intermediateUse.branch1": "10",
        "vab.intermediateUse.branch2": "20",
        "vab.intermediateUse.gov": "30",
        "vab.intermediateUse.st": "40",
      },
    });
    const manualCuGeIByActivity = {
      vabPerActivity: {
        resource: {
          branch1: "m1",
          branch2: "m2",
          branch3: "m3",
          gov: "mGov",
          total: "mTotal",
        },
      },
      ra: {
        usage: {
          branch1: "r1",
          branch2: "r2",
          branch3: "r3",
          gov: "rGov",
          total: "rTotal",
        },
      },
      tax: {
        usage: {
          branch1: "t1",
          branch2: "t2",
          branch3: "t3",
          gov: "tGov",
          total: "tTotal",
        },
      },
      eeb: {
        usage: {
          branch1: "e1",
          branch2: "e2",
          branch3: "e3",
          gov: "eGov",
          total: "eTotal",
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByActivity: manualCuGeIByActivity,
      },
    });

    await clickSectionActionButtonByIndex(
      APP_SECTIONS.cuGeI,
      /Obtener valores desde el COU/i,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuGeIByActivity").vabPerActivity.resource.total).toBe(
        "40"
      )
    );

    const stored = getItem("cuGeIByActivity");
    expect(stored.vabPerActivity.resource.branch1).toBe("m1");
    expect(stored.vabPerActivity.resource.branch2).toBe("m2");
    expect(stored.vabPerActivity.resource.branch3).toBe("m3");
    expect(stored.vabPerActivity.resource.gov).toBe("30");
    expect(stored.vabPerActivity.resource.total).toBe("40");
  });

  test("retrieve from COU is idempotent for CuADI", async () => {
    const couValuesByPath = {
      "imports.total": "50",
      "totalUses.finalUse.exports": "80",
      "een.intermediateUse.branch1": "7",
      "een.intermediateUse.branch2": "8",
      "een.intermediateUse.branch3": "9",
      "een.intermediateUse.gov": "10",
      "een.intermediateUse.st": "24",
      "ckf.intermediateUse.branch1": "13",
      "ckf.intermediateUse.branch2": "23",
      "ckf.intermediateUse.branch3": "33",
      "ckf.intermediateUse.gov": "43",
      "ckf.intermediateUse.st": "112",
      "ra.intermediateUse.st": "14",
      "tax.intermediateUse.st": "3",
    };
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath,
    });
    const cou = createCouFixture({
      branchCount: 3,
      valuesByPath: couValuesByPath,
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickSectionActionButtonByIndex(
      APP_SECTIONS.cuADI,
      /Obtener valores desde el COU/i,
      0,
      user
    );
    await waitFor(() =>
      expect(getItem("cuADIByInstitutionalSectors").sbsx.resource.total).toBe(
        -30
      )
    );
    const snapshotAfterFirstRetrieve = JSON.parse(
      JSON.stringify(getItem("cuADIByInstitutionalSectors"))
    );

    await clickSectionActionButtonByIndex(
      APP_SECTIONS.cuADI,
      /Obtener valores desde el COU/i,
      0,
      user
    );
    const snapshotAfterSecondRetrieve = getItem("cuADIByInstitutionalSectors");

    expect(snapshotAfterSecondRetrieve).toEqual(snapshotAfterFirstRetrieve);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("app boot sanitizes oversized stored branches to max supported amount", async () => {
    const { user } = renderApp({
      storage: {
        appValues: {
          branches: [
            { name: "B1" },
            { name: "B2" },
            { name: "B3" },
            { name: "B4" },
            { name: "B5" },
            { name: "B6" },
          ],
        },
      },
    });

    expect(getBranchesCountInput().value).toBe("4");
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(4));
    expect(getItem("appValues").branches[0].name).toBe("B1");
    expect(getItem("appValues").branches[3].name).toBe("B4");

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 3, "99", { user });
    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch4).toBe("99")
    );
  });

  test("app boot sanitizes malformed embedded COU while keeping app interactive", async () => {
    const { user } = renderApp({
      storage: {
        appValues: {
          branches: [{ name: "Rama A" }, { name: "Rama B" }],
          cou: "corrupted",
        },
      },
    });

    expect(getBranchesCountInput().value).toBe("2");

    await waitFor(() => expect(typeof getItem("appValues").cou).toBe("object"));
    await waitFor(() =>
      expect(getItem("appValues").cou.branch1.intermediateUse.branch1).toBe("")
    );

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, "9", { user });
    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch1).toBe("9")
    );
  });

  test("COU compute with zero-filled matrix remains stable and alert-free", async () => {
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const cou = createCouFixture({
      branchCount: 3,
      fillValue: "0",
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickSectionActionButtonByIndex(
      APP_SECTIONS.cou,
      /Calcular/i,
      0,
      user
    );

    await waitFor(() =>
      expect(Number(getItem("cou").branch1.intermediateUse.st)).toBe(0)
    );
    await waitFor(() => expect(Number(getItem("cou").totalUses.total)).toBe(0));

    const storedCou = getItem("cou");
    expect(Number(storedCou.branch2.total)).toBe(0);
    expect(Number(storedCou.production.intermediateUse.st)).toBe(0);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("retrieve and compute keep disabled CuGeI institutional tax.gov unmapped", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath: {
        "imports.total": "50",
        "totalUses.finalUse.exports": "80",
        "vab.intermediateUse.branch1": "12",
        "vab.intermediateUse.branch2": "22",
        "vab.intermediateUse.branch3": "32",
        "vab.intermediateUse.gov": "42",
        "vab.intermediateUse.st": "108",
        "ra.intermediateUse.branch1": "2",
        "ra.intermediateUse.branch2": "3",
        "ra.intermediateUse.branch3": "4",
        "ra.intermediateUse.gov": "5",
        "ra.intermediateUse.st": "14",
        "tax.intermediateUse.branch1": "1",
        "tax.intermediateUse.branch2": "1",
        "tax.intermediateUse.branch3": "1",
        "tax.intermediateUse.st": "3",
        "een.intermediateUse.branch1": "7",
        "een.intermediateUse.branch2": "8",
        "een.intermediateUse.branch3": "9",
        "een.intermediateUse.gov": "10",
        "een.intermediateUse.st": "24",
        "ckf.intermediateUse.branch1": "13",
        "ckf.intermediateUse.branch2": "23",
        "ckf.intermediateUse.branch3": "33",
        "ckf.intermediateUse.gov": "43",
        "ckf.intermediateUse.st": "112",
      },
    });
    const { user } = renderApp({
      storage: {
        appValues,
      },
    });

    await clickSectionActionButtonByIndex(
      APP_SECTIONS.cuGeI,
      /Obtener valores desde el COU/i,
      1,
      user
    );
    await clickSectionActionButtonByIndex(
      APP_SECTIONS.cuGeI,
      /Calcular/i,
      1,
      user
    );

    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").tax.usage.total).toBe("3")
    );

    const taxUsage = getItem("cuGeIByInstitutionalSectors").tax.usage;
    expect(taxUsage.gov).toBeUndefined();
    expect(Object.keys(taxUsage).sort()).toEqual(["society", "st", "total"]);
  });
});
