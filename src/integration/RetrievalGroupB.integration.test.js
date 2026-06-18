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

const RETRIEVE_BUTTON_LABEL = /Obtener valores desde el COU/i;

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
  "totalUses.finalUse.gcfGov": 41,
  "totalUses.finalUse.gcfHomes": 29,
  "totalUses.finalUse.fbkFbkf": "55",
  "totalUses.finalUse.fbkVe": "65",
};

describe("Cross-module retrieval from COU - Group B", () => {
  test("CuADI retrieves mapped COU values into institutional sectors table", async () => {
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

    await clickSectionActionButton(
      APP_SECTIONS.cuADI,
      RETRIEVE_BUTTON_LABEL,
      user
    );

    await waitFor(() =>
      expect(getItem("cuADIByInstitutionalSectors").sbsx.resource.rm).toBe(-30)
    );

    const stored = getItem("cuADIByInstitutionalSectors");
    expect(stored.sbsx.resource.total).toBe(-30);
    expect(stored.eeb.resource.society).toBe(93);
    expect(stored.eeb.resource.gov).toBe(53);
    expect(stored.eeb.resource.st).toBe(136);
    expect(stored.eeb.resource.total).toBe(136);
    expect(stored.ra.resource.total).toBe("14");
    expect(stored.tax.resource.gov).toBe("3");
    expect(stored.tax.resource.st).toBe("3");
    expect(stored.tax.resource.total).toBe("3");
  });

  test("CuADI keeps EEB society empty when at least one branch pair is missing", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath: {
        "een.intermediateUse.branch1": "7",
        "een.intermediateUse.branch2": "8",
        "ckf.intermediateUse.branch1": "13",
        "ckf.intermediateUse.branch2": "23",
        "een.intermediateUse.gov": "10",
        "ckf.intermediateUse.gov": "43",
        "een.intermediateUse.st": "24",
        "ckf.intermediateUse.st": "112",
      },
    });
    const cou = createCouFixture({
      branchCount: 3,
      valuesByPath: {
        "een.intermediateUse.branch1": "7",
        "een.intermediateUse.branch2": "8",
        "ckf.intermediateUse.branch1": "13",
        "ckf.intermediateUse.branch2": "23",
        "een.intermediateUse.gov": "10",
        "ckf.intermediateUse.gov": "43",
        "een.intermediateUse.st": "24",
        "ckf.intermediateUse.st": "112",
      },
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickSectionActionButton(
      APP_SECTIONS.cuADI,
      RETRIEVE_BUTTON_LABEL,
      user
    );

    await waitFor(() =>
      expect(getItem("cuADIByInstitutionalSectors").eeb.resource.st).toBe(136)
    );

    const stored = getItem("cuADIByInstitutionalSectors");
    expect(stored.eeb.resource.society).toBeNull();
  });

  test("CUI retrieves and aggregates GCF values from COU final use", async () => {
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

    await clickSectionActionButton(
      APP_SECTIONS.cui,
      RETRIEVE_BUTTON_LABEL,
      user
    );

    await waitFor(() =>
      expect(getItem("cUIByInstitutionalSectors").gcf.usage.st).toBe(70)
    );

    const stored = getItem("cUIByInstitutionalSectors");
    expect(stored.gcf.usage.gov).toBe(41);
    expect(stored.gcf.usage.homes).toBe(29);
    expect(stored.gcf.usage.total).toBe(70);
  });

  test("CUI computes subtotal/total when only one GCF side is available", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath: {
        "totalUses.finalUse.gcfGov": 17,
      },
    });
    const cou = createCouFixture({
      branchCount: 3,
      valuesByPath: {
        "totalUses.finalUse.gcfGov": 17,
      },
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickSectionActionButton(
      APP_SECTIONS.cui,
      RETRIEVE_BUTTON_LABEL,
      user
    );

    await waitFor(() =>
      expect(getItem("cUIByInstitutionalSectors").gcf.usage.total).toBe(17)
    );

    const stored = getItem("cUIByInstitutionalSectors");
    expect(stored.gcf.usage.gov).toBe(17);
    expect(stored.gcf.usage.homes).toBeNull();
    expect(stored.gcf.usage.st).toBe(17);
  });

  test("CuCa retrieves FBKF and VE totals from COU final use", async () => {
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

    await clickSectionActionButton(
      APP_SECTIONS.cuCa,
      RETRIEVE_BUTTON_LABEL,
      user
    );

    await waitFor(() =>
      expect(getItem("cuCaByInstitutionalSectors").fbkf.usage.total).toBe("55")
    );

    const stored = getItem("cuCaByInstitutionalSectors");
    expect(stored.fbkf.usage.st).toBe("55");
    expect(stored.ve.usage.total).toBe("65");
    expect(stored.ve.usage.st).toBe("65");
  });
});
