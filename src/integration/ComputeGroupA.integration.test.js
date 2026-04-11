import { waitFor, within } from "@testing-library/react";
import { getItem } from "../shared/db";
import {
  createAppValuesFixture,
  createCouFixture,
} from "./fixtures/couFixtures";
import {
  APP_SECTIONS,
  getAccordionItemByTitle,
  openAccordionSection,
  renderApp,
} from "./utils/testHarness";
import solveEquation from "../shared/solveEquation";

jest.mock("../shared/solveEquation", () => {
  const actual = jest.requireActual("../shared/solveEquation");
  return {
    __esModule: true,
    default: jest.fn((...args) => actual.default(...args)),
  };
});

const CALCULATE_BUTTON_LABEL = /Calcular/i;
const RETRIEVE_BUTTON_LABEL = /Obtener valores desde el COU/i;
const actualSolveEquation = jest.requireActual("../shared/solveEquation").default;

const coherentCouValuesByPath = {
  "production.intermediateUse.branch1": "10",
  "production.intermediateUse.branch2": "20",
  "production.intermediateUse.branch3": "30",
  "production.intermediateUse.gov": "40",
  "production.intermediateUse.st": "100",
  "totalUses.intermediateUse.branch1": "4",
  "totalUses.intermediateUse.branch2": "8",
  "totalUses.intermediateUse.branch3": "12",
  "totalUses.intermediateUse.gov": "16",
  "totalUses.intermediateUse.st": "40",
  "vab.intermediateUse.branch1": "6",
  "vab.intermediateUse.branch2": "12",
  "vab.intermediateUse.branch3": "18",
  "vab.intermediateUse.gov": "24",
  "vab.intermediateUse.st": "60",
  "ckf.intermediateUse.branch1": "2",
  "ckf.intermediateUse.branch2": "3",
  "ckf.intermediateUse.branch3": "4",
  "ckf.intermediateUse.gov": "5",
  "ckf.intermediateUse.st": "14",
  "imports.total": "50",
  "totalUses.finalUse.exports": "80",
};

const clickButtonInSectionByIndex = async (
  sectionTitle,
  buttonLabel,
  buttonIndex,
  user
) => {
  await openAccordionSection(sectionTitle, user);
  const section = getAccordionItemByTitle(sectionTitle);
  const actionButtons = within(section).getAllByRole("button", {
    name: buttonLabel,
  });
  await user.click(actionButtons[buttonIndex]);
};

describe("Cross-module compute behavior - Group A", () => {
  beforeEach(() => {
    solveEquation.mockImplementation((...args) => actualSolveEquation(...args));
    solveEquation.mockClear();
  });

  test("CuPro computes VAN by activity from coherent COU-retrieved rows", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath: coherentCouValuesByPath,
    });
    const cou = createCouFixture({
      branchCount: 3,
      valuesByPath: coherentCouValuesByPath,
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      RETRIEVE_BUTTON_LABEL,
      0,
      user
    );
    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuProByActivity").vanPerActivity.usage.branch1).toBe(4)
    );

    const stored = getItem("cuProByActivity");
    expect(stored.vanPerActivity.usage.branch2).toBe(9);
    expect(stored.vanPerActivity.usage.branch3).toBe(14);
    expect(stored.vanPerActivity.usage.gov).toBe(19);
    expect(stored.vanPerActivity.usage.total).toBe(46);
  });

  test("CuPro computes institutional VAN and trade balance after COU retrieval", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath: coherentCouValuesByPath,
    });
    const cou = createCouFixture({
      branchCount: 3,
      valuesByPath: coherentCouValuesByPath,
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      RETRIEVE_BUTTON_LABEL,
      1,
      user
    );
    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      1,
      user
    );

    await waitFor(() =>
      expect(getItem("cuProByInstitutionalSectors").sbsx.usage.rm).toBe(-30)
    );

    const stored = getItem("cuProByInstitutionalSectors");
    expect(stored.sbsx.usage.total).toBe(-30);
    expect(stored.van.usage.society).toBe(27);
    expect(stored.van.usage.gov).toBe(19);
    expect(stored.van.usage.st).toBe(46);
    expect(stored.van.usage.total).toBe(46);
  });

  test("CuGeI computes missing EEB by activity from VAB, RA and TAX", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
    });
    const cuGeIByActivity = {
      vabPerActivity: {
        resource: {
          branch1: "6",
          branch2: "12",
          branch3: "18",
          gov: "24",
          total: "60",
        },
      },
      ra: {
        usage: {
          branch1: "2",
          branch2: "4",
          branch3: "6",
          gov: "9",
          total: "21",
        },
      },
      tax: {
        usage: {
          branch1: "1",
          branch2: "1",
          branch3: "1",
          gov: "",
          total: "3",
        },
      },
      eeb: {
        usage: {
          branch1: "",
          branch2: "",
          branch3: "",
          gov: "",
          total: "",
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByActivity,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuGeIByActivity").eeb.usage.branch1).toBe(3)
    );

    const stored = getItem("cuGeIByActivity");
    expect(stored.eeb.usage.branch2).toBe(7);
    expect(stored.eeb.usage.branch3).toBe(11);
    expect(stored.eeb.usage.gov).toBe(15);
    expect(stored.eeb.usage.total).toBe(36);
  });

  test("CuGeI computes institutional mirrors and missing EEB values", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
    });
    const cuGeIByInstitutionalSectors = {
      sbsxR: {
        resource: {
          rm: -30,
          total: -30,
        },
      },
      vab: {
        resource: {
          society: 36,
          gov: 24,
          st: 60,
          total: 60,
        },
      },
      ra: {
        usage: {
          society: 12,
          gov: 9,
          st: 21,
          total: 21,
        },
      },
      tax: {
        usage: {
          society: 3,
          st: 3,
          total: 3,
        },
      },
      eeb: {
        usage: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      sbsxU: {
        usage: {
          rm: null,
          total: null,
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByInstitutionalSectors,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      1,
      user
    );

    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").sbsxU.usage.rm).toBe(-30)
    );

    const stored = getItem("cuGeIByInstitutionalSectors");
    expect(stored.sbsxU.usage.total).toBe(-30);
    expect(stored.eeb.usage.society).toBe(21);
    expect(stored.eeb.usage.gov).toBe(15);
    expect(stored.eeb.usage.st).toBe(36);
    expect(stored.eeb.usage.total).toBe(36);
  });

  test("CuPro computes intermediate consumption by activity from production and VAB", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
    });
    const cuProByActivity = {
      productionPerActivity: {
        resource: {
          branch1: "10",
          branch2: "20",
          branch3: "30",
          gov: "40",
          total: "100",
        },
      },
      intermediateConsumption: {
        usage: {
          branch1: "",
          branch2: "",
          branch3: "",
          gov: "",
          total: "",
        },
      },
      vabPerActivity: {
        usage: {
          branch1: "6",
          branch2: "12",
          branch3: "18",
          gov: "24",
          total: "60",
        },
      },
      ckf: {
        usage: {
          branch1: "",
          branch2: "",
          branch3: "",
          gov: "",
          total: "",
        },
      },
      vanPerActivity: {
        usage: {
          branch1: "",
          branch2: "",
          branch3: "",
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

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuProByActivity").intermediateConsumption.usage.branch1).toBe(
        4
      )
    );

    const stored = getItem("cuProByActivity");
    expect(stored.intermediateConsumption.usage.branch2).toBe(8);
    expect(stored.intermediateConsumption.usage.branch3).toBe(12);
    expect(stored.intermediateConsumption.usage.gov).toBe(16);
    expect(stored.intermediateConsumption.usage.total).toBe(40);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuPro computes exports from imports and external-balance row", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
    });
    const cuProByInstitutionalSectors = {
      imports: {
        resource: {
          rm: 50,
          total: 50,
        },
      },
      exports: {
        usage: {
          rm: null,
          total: null,
        },
      },
      production: {
        resource: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      ci: {
        usage: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      vab: {
        usage: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      ckf: {
        usage: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      van: {
        usage: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      sbsx: {
        usage: {
          rm: -30,
          total: -30,
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuProByInstitutionalSectors,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      1,
      user
    );

    await waitFor(() =>
      expect(getItem("cuProByInstitutionalSectors").exports.usage.rm).toBe(80)
    );

    const stored = getItem("cuProByInstitutionalSectors");
    expect(stored.exports.usage.total).toBe(80);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuGeI computes missing TAX by activity from VAB, RA and EEB", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
    });
    const cuGeIByActivity = {
      vabPerActivity: {
        resource: {
          branch1: "6",
          branch2: "12",
          branch3: "18",
          gov: "24",
          total: "60",
        },
      },
      ra: {
        usage: {
          branch1: "2",
          branch2: "4",
          branch3: "6",
          gov: "9",
          total: "21",
        },
      },
      tax: {
        usage: {
          branch1: "",
          branch2: "",
          branch3: "",
          gov: "",
          total: "",
        },
      },
      eeb: {
        usage: {
          branch1: "3",
          branch2: "7",
          branch3: "11",
          gov: "15",
          total: "36",
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByActivity,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuGeIByActivity").tax.usage.branch1).toBe(1)
    );

    const stored = getItem("cuGeIByActivity");
    expect(stored.tax.usage.branch2).toBe(1);
    expect(stored.tax.usage.branch3).toBe(1);
    expect(stored.tax.usage.total).toBe(3);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuGeI computes Sbsx resource mirror from Sbsx usage inputs", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
    });
    const cuGeIByInstitutionalSectors = {
      sbsxR: {
        resource: {
          rm: null,
          total: null,
        },
      },
      vab: {
        resource: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      ra: {
        usage: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      tax: {
        usage: {
          society: null,
          st: null,
          total: null,
        },
      },
      eeb: {
        usage: {
          society: null,
          gov: null,
          st: null,
          total: null,
        },
      },
      sbsxU: {
        usage: {
          rm: -45,
          total: -45,
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByInstitutionalSectors,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      1,
      user
    );

    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").sbsxR.resource.rm).toBe(-45)
    );

    const stored = getItem("cuGeIByInstitutionalSectors");
    expect(stored.sbsxR.resource.total).toBe(-45);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuPro compute works with branchCount 1", async () => {
    const couValuesByPath = {
      "production.intermediateUse.branch1": "10",
      "production.intermediateUse.gov": "40",
      "production.intermediateUse.st": "50",
      "totalUses.intermediateUse.branch1": "4",
      "totalUses.intermediateUse.gov": "16",
      "totalUses.intermediateUse.st": "20",
      "vab.intermediateUse.branch1": "6",
      "vab.intermediateUse.gov": "24",
      "vab.intermediateUse.st": "30",
      "ckf.intermediateUse.branch1": "2",
      "ckf.intermediateUse.gov": "5",
      "ckf.intermediateUse.st": "7",
    };
    const appValues = createAppValuesFixture({
      branchCount: 1,
      includeCou: true,
      couValuesByPath,
    });
    const cou = createCouFixture({
      branchCount: 1,
      valuesByPath: couValuesByPath,
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      RETRIEVE_BUTTON_LABEL,
      0,
      user
    );
    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuProByActivity").vanPerActivity.usage.branch1).toBe(4)
    );

    const stored = getItem("cuProByActivity");
    expect(stored.vanPerActivity.usage.gov).toBe(19);
    expect(stored.vanPerActivity.usage.total).toBe(23);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuGeI compute works with branchCount 4", async () => {
    const couValuesByPath = {
      "vab.intermediateUse.branch1": "6",
      "vab.intermediateUse.branch2": "12",
      "vab.intermediateUse.branch3": "18",
      "vab.intermediateUse.branch4": "24",
      "vab.intermediateUse.gov": "30",
      "vab.intermediateUse.st": "90",
      "ra.intermediateUse.branch1": "2",
      "ra.intermediateUse.branch2": "4",
      "ra.intermediateUse.branch3": "6",
      "ra.intermediateUse.branch4": "8",
      "ra.intermediateUse.gov": "10",
      "ra.intermediateUse.st": "30",
      "tax.intermediateUse.branch1": "1",
      "tax.intermediateUse.branch2": "1",
      "tax.intermediateUse.branch3": "1",
      "tax.intermediateUse.branch4": "1",
      "tax.intermediateUse.gov": "0",
      "tax.intermediateUse.st": "4",
      "een.intermediateUse.branch1": "3",
      "een.intermediateUse.branch2": "7",
      "een.intermediateUse.branch3": "11",
      "een.intermediateUse.branch4": "15",
      "een.intermediateUse.gov": "18",
      "een.intermediateUse.st": "54",
      "ckf.intermediateUse.branch1": "0",
      "ckf.intermediateUse.branch2": "0",
      "ckf.intermediateUse.branch3": "0",
      "ckf.intermediateUse.branch4": "0",
      "ckf.intermediateUse.gov": "0",
      "ckf.intermediateUse.st": "0",
    };
    const appValues = createAppValuesFixture({
      branchCount: 4,
      includeCou: true,
      couValuesByPath,
    });
    const cou = createCouFixture({
      branchCount: 4,
      valuesByPath: couValuesByPath,
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      RETRIEVE_BUTTON_LABEL,
      0,
      user
    );
    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuGeIByActivity").eeb.usage.branch4).toBe(15)
    );

    const stored = getItem("cuGeIByActivity");
    expect(stored.eeb.usage.branch1).toBe(3);
    expect(stored.eeb.usage.gov).toBe(18);
    expect(stored.eeb.usage.total).toBe(54);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuGeI compute keeps table unchanged when equations are not solvable", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
    });
    const cuGeIByActivity = {
      vabPerActivity: {
        resource: {
          branch1: "10",
          branch2: "",
          branch3: "",
          gov: "",
          total: "",
        },
      },
      ra: {
        usage: {
          branch1: "",
          branch2: "",
          branch3: "",
          gov: "",
          total: "",
        },
      },
      tax: {
        usage: {
          branch1: "",
          branch2: "",
          branch3: "",
          gov: "",
          total: "",
        },
      },
      eeb: {
        usage: {
          branch1: "",
          branch2: "",
          branch3: "",
          gov: "",
          total: "",
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByActivity,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    expect(getItem("cuGeIByActivity")).toEqual(cuGeIByActivity);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuPro compute is idempotent when executed twice with same inputs", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath: coherentCouValuesByPath,
    });
    const cou = createCouFixture({
      branchCount: 3,
      valuesByPath: coherentCouValuesByPath,
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      RETRIEVE_BUTTON_LABEL,
      1,
      user
    );
    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      1,
      user
    );

    await waitFor(() =>
      expect(getItem("cuProByInstitutionalSectors").van.usage.total).toBe(46)
    );

    const snapshotAfterFirstCompute = JSON.parse(
      JSON.stringify(getItem("cuProByInstitutionalSectors"))
    );

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      1,
      user
    );

    expect(getItem("cuProByInstitutionalSectors")).toEqual(
      snapshotAfterFirstCompute
    );
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuGeI compute handles decimal and negative values", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 1,
    });
    const cuGeIByActivity = {
      vabPerActivity: {
        resource: {
          branch1: "-1.5",
          gov: "",
          total: "-1.5",
        },
      },
      ra: {
        usage: {
          branch1: "2.25",
          gov: "",
          total: "2.25",
        },
      },
      tax: {
        usage: {
          branch1: "",
          gov: "",
          total: "",
        },
      },
      eeb: {
        usage: {
          branch1: "0.75",
          gov: "",
          total: "0.75",
        },
      },
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByActivity,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuGeIByActivity").tax.usage.branch1).toBe(-4.5)
    );

    const stored = getItem("cuGeIByActivity");
    expect(stored.tax.usage.total).toBe(-4.5);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuPro compute tolerates recoverable corrupted storage row shapes", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 1,
    });
    const cuProByActivity = {
      productionPerActivity: {
        resource: {
          branch1: "10",
          gov: "40",
          total: "50",
        },
      },
      intermediateConsumption: 0,
      vabPerActivity: {
        usage: {
          branch1: "6",
          gov: "24",
          total: "30",
        },
      },
      ckf: 0,
      vanPerActivity: 0,
    };
    const { user } = renderApp({
      storage: {
        appValues,
        cuProByActivity,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    await waitFor(() =>
      expect(getItem("cuProByActivity").intermediateConsumption.usage.branch1).toBe(
        4
      )
    );

    const stored = getItem("cuProByActivity");
    expect(stored.intermediateConsumption.usage.gov).toBe(16);
    expect(stored.intermediateConsumption.usage.total).toBe(20);
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("CuPro shows iteration-limit alert when solver never converges", async () => {
    solveEquation.mockImplementation(() => Number.NaN);
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const appValues = createAppValuesFixture({
      branchCount: 1,
    });
    const cuProByActivity = {
      productionPerActivity: {
        resource: {
          branch1: "10",
          gov: "40",
          total: "50",
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
          branch1: "6",
          gov: "24",
          total: "30",
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

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuPro,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    expect(window.alert).toHaveBeenCalled();
    expect(window.alert.mock.calls[0][0]).toMatch(/iteraciones/i);
    expect(window.alert.mock.calls[0][0]).toMatch(/Producci/i);

    consoleErrorSpy.mockRestore();
  });
});
