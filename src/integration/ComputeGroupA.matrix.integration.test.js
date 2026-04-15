import _ from "lodash";
import { waitFor, within } from "@testing-library/react";
import { getItem } from "../shared/db";
import { createAppValuesFixture } from "./fixtures/couFixtures";
import {
  APP_SECTIONS,
  getAccordionItemByTitle,
  openAccordionSection,
  renderApp,
} from "./utils/testHarness";

jest.setTimeout(120000);

const CALCULATE_BUTTON_LABEL = /Calcular/i;

const ACTIVITY_COLS = ["branch1", "branch2", "branch3", "gov", "total"];
const ACTIVITY_COLS_NO_GOV = ["branch1", "branch2", "branch3", "total"];
const INST_COLS_RM_TOTAL = ["rm", "total"];
const INST_COLS_STD = ["society", "gov", "st", "total"];
const INST_COLS_TAX = ["society", "st", "total"];

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

const baseCuProByActivity = () => ({
  productionPerActivity: {
    resource: {
      branch1: 10,
      branch2: 20,
      branch3: 30,
      gov: 40,
      total: 100,
    },
  },
  intermediateConsumption: {
    usage: {
      branch1: 4,
      branch2: 8,
      branch3: 12,
      gov: 16,
      total: 40,
    },
  },
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
});

const baseCuProByInstitutionalSectors = () => ({
  imports: {
    resource: {
      rm: 50,
      total: 50,
    },
  },
  exports: {
    usage: {
      rm: 80,
      total: 80,
    },
  },
  production: {
    resource: {
      society: 60,
      gov: 40,
      st: 100,
      total: 100,
    },
  },
  ci: {
    usage: {
      society: 24,
      gov: 16,
      st: 40,
      total: 40,
    },
  },
  vab: {
    usage: {
      society: 36,
      gov: 24,
      st: 60,
      total: 60,
    },
  },
  ckf: {
    usage: {
      society: 9,
      gov: 5,
      st: 14,
      total: 14,
    },
  },
  van: {
    usage: {
      society: 27,
      gov: 19,
      st: 46,
      total: 46,
    },
  },
  sbsx: {
    usage: {
      rm: -30,
      total: -30,
    },
  },
});

const baseCuGeIByActivity = () => ({
  vabPerActivity: {
    resource: {
      branch1: 6,
      branch2: 12,
      branch3: 18,
      gov: 24,
      total: 60,
    },
  },
  ra: {
    usage: {
      branch1: 2,
      branch2: 4,
      branch3: 6,
      gov: 9,
      total: 21,
    },
  },
  tax: {
    usage: {
      branch1: 1,
      branch2: 1,
      branch3: 1,
      gov: 0,
      total: 3,
    },
  },
  eeb: {
    usage: {
      branch1: 3,
      branch2: 7,
      branch3: 11,
      gov: 15,
      total: 36,
    },
  },
});

const baseCuGeIByInstitutionalSectors = () => ({
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
      society: 21,
      gov: 15,
      st: 36,
      total: 36,
    },
  },
  sbsxU: {
    usage: {
      rm: -30,
      total: -30,
    },
  },
});

const runSolveMatrix = async ({
  storageKey,
  baseTableFactory,
  targetPathBuilder,
  columns,
  sectionTitle,
  calculateIndex,
}) => {
  for (const col of columns) {
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const table = baseTableFactory();
    const targetPath = targetPathBuilder(col);
    const expected = _.get(table, targetPath);

    _.set(table, targetPath, "");

    const { user, unmount } = renderApp({
      storage: {
        appValues,
        [storageKey]: table,
      },
    });

    await clickButtonInSectionByIndex(
      sectionTitle,
      CALCULATE_BUTTON_LABEL,
      calculateIndex,
      user
    );

    await waitFor(() =>
      expect(_.get(getItem(storageKey), targetPath)).toBe(expected)
    );

    unmount();
  }
};

describe("Compute matrix - CuPro by Activity", () => {
  test("[CuPro][ByActivity][Prod=CI+VAB] solves productionPerActivity.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `productionPerActivity.resource.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][Prod=CI+VAB] solves intermediateConsumption.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `intermediateConsumption.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][Prod=CI+VAB] solves vabPerActivity.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `vabPerActivity.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][VAB-CKF=VAN] solves vabPerActivity.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `vabPerActivity.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][VAB-CKF=VAN] solves ckf.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `ckf.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][VAB-CKF=VAN] solves vanPerActivity.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `vanPerActivity.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][Prod-CI-CKF=VAN] solves intermediateConsumption.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `intermediateConsumption.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][Prod-CI-CKF=VAN] solves ckf.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `ckf.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][Prod-CI-CKF=VAN] solves vanPerActivity.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `vanPerActivity.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][RowSum] solves intermediateConsumption.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `intermediateConsumption.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][RowSum] solves vabPerActivity.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `vabPerActivity.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][RowSum] solves ckf.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `ckf.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });

  test("[CuPro][ByActivity][RowSum] solves vanPerActivity.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByActivity",
      baseTableFactory: baseCuProByActivity,
      targetPathBuilder: (col) => `vanPerActivity.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 0,
    });
  });
});

describe("Compute matrix - CuPro by Institutional Sectors", () => {
  test("[CuPro][ByInst][Imports-Exports=SBSX] solves imports.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `imports.resource.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][Imports-Exports=SBSX] solves exports.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `exports.usage.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][Imports-Exports=SBSX] solves sbsx.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `sbsx.usage.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][RM=Total] solves imports.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `imports.resource.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][RM=Total] solves exports.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `exports.usage.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][RM=Total] solves sbsx.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `sbsx.usage.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][Prod-CI=VAB] solves production.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `production.resource.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][Prod-CI=VAB] solves ci.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `ci.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][Prod-CI=VAB] solves vab.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `vab.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][VAB-CKF=VAN] solves vab.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `vab.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][VAB-CKF=VAN] solves ckf.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `ckf.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });

  test("[CuPro][ByInst][VAB-CKF=VAN] solves van.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuProByInstitutionalSectors",
      baseTableFactory: baseCuProByInstitutionalSectors,
      targetPathBuilder: (col) => `van.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuPro,
      calculateIndex: 1,
    });
  });
});

describe("Compute matrix - CuGeI by Activity", () => {
  test("[CuGeI][ByActivity][VAB=RA+TAX+EEB] solves vabPerActivity.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByActivity",
      baseTableFactory: baseCuGeIByActivity,
      targetPathBuilder: (col) => `vabPerActivity.resource.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 0,
    });
  });

  test("[CuGeI][ByActivity][VAB=RA+TAX+EEB] solves ra.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByActivity",
      baseTableFactory: baseCuGeIByActivity,
      targetPathBuilder: (col) => `ra.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 0,
    });
  });

  test("[CuGeI][ByActivity][VAB=RA+TAX+EEB] solves tax.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByActivity",
      baseTableFactory: baseCuGeIByActivity,
      targetPathBuilder: (col) => `tax.usage.${col}`,
      columns: ACTIVITY_COLS_NO_GOV,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 0,
    });
  });

  test("[CuGeI][ByActivity][VAB=RA+TAX+EEB] solves eeb.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByActivity",
      baseTableFactory: baseCuGeIByActivity,
      targetPathBuilder: (col) => `eeb.usage.${col}`,
      columns: ACTIVITY_COLS,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 0,
    });
  });

  test("[CuGeI][ByActivity][GovRule] keeps tax.usage.gov unchanged", async () => {
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const table = baseCuGeIByActivity();
    table.tax.usage.gov = "sentinel";

    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByActivity: table,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      0,
      user
    );

    expect(getItem("cuGeIByActivity").tax.usage.gov).toBe("sentinel");
  });
});

describe("Compute matrix - CuGeI by Institutional Sectors", () => {
  test("[CuGeI][ByInst][SBSX mirror] solves sbsxR.resource.%s from sbsxU.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `sbsxR.resource.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][SBSX mirror] solves sbsxU.usage.%s from sbsxR.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `sbsxU.usage.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][SBSX row] solves sbsxR.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `sbsxR.resource.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][SBSX row] solves sbsxU.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `sbsxU.usage.${col}`,
      columns: INST_COLS_RM_TOTAL,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][VAB=RA+TAX+EEB] solves vab.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `vab.resource.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][VAB=RA+TAX+EEB] solves ra.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `ra.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][VAB=RA+TAX+EEB] solves tax.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `tax.usage.${col}`,
      columns: INST_COLS_TAX,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][VAB=RA+TAX+EEB] solves eeb.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `eeb.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][Row subtotal/total] solves vab.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `vab.resource.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][Row subtotal/total] solves ra.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `ra.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][Row subtotal/total] solves tax.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `tax.usage.${col}`,
      columns: INST_COLS_TAX,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][Row subtotal/total] solves eeb.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuGeIByInstitutionalSectors",
      baseTableFactory: baseCuGeIByInstitutionalSectors,
      targetPathBuilder: (col) => `eeb.usage.${col}`,
      columns: INST_COLS_STD,
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
    });
  });

  test("[CuGeI][ByInst][GovRule] keeps tax.usage.gov unchanged", async () => {
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const table = baseCuGeIByInstitutionalSectors();
    table.tax.usage.gov = "sentinel";

    const { user } = renderApp({
      storage: {
        appValues,
        cuGeIByInstitutionalSectors: table,
      },
    });

    await clickButtonInSectionByIndex(
      APP_SECTIONS.cuGeI,
      CALCULATE_BUTTON_LABEL,
      1,
      user
    );

    expect(getItem("cuGeIByInstitutionalSectors").tax.usage.gov).toBe(
      "sentinel"
    );
  });
});
