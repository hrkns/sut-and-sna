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

jest.setTimeout(240000);

const CALCULATE_BUTTON_LABEL = /Calcular/i;

const CUI_SCX_COLS = ["rm", "total"];
const CUI_IDB_COLS = ["society", "gov", "homes", "st", "total"];
const CUI_GCF_COLS = ["gov", "homes", "st", "total"];

const CUCA_SCX_COLS = ["rm"];
const CUCA_AB_COLS = ["society", "gov", "homes", "st", "total"];
const CUCA_TK_COLS = ["society", "gov", "st", "rm", "total"];
const CUCA_FBK_VE_COLS = ["total", "st", "gov", "society"];
const CUCA_PN_COLS = ["total", "rm", "st", "homes", "gov", "society"];

const CUADI_SBSX_COLS = ["rm", "total"];
const CUADI_EEB_COLS = ["society", "gov", "st", "total"];
const CUADI_RA_COLS = ["homes", "st", "rm", "total"];
const CUADI_TAX_COLS = ["gov", "st", "total"];
const CUADI_RP_RESOURCE_COLS = ["homes", "st", "rm", "total"];
const CUADI_RP_USAGE_COLS = ["society", "gov", "st", "rm", "total"];
const CUADI_CS_RESOURCE_COLS = ["gov", "st", "total"];
const CUADI_CS_USAGE_COLS = ["homes", "st", "total"];
const CUADI_PS_RESOURCE_COLS = ["homes", "st", "total"];
const CUADI_PS_USAGE_COLS = ["gov", "st", "total"];
const CUADI_OTC_RESOURCE_COLS = ["gov", "st", "total"];
const CUADI_OTC_USAGE_COLS = ["society", "st", "rm", "total"];
const CUADI_IDB_COLS = ["society", "gov", "homes", "st", "total"];
const CUADI_SCX_COLS = ["rm", "total"];

const CUFI_TOP_COLS = ["society", "gov", "homes", "st", "rm", "total"];
const CUFI_ENPF_COMPONENT_COLS = ["society", "gov", "st", "rm", "total"];

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

const baseCUIByInstitutionalSectors = () => ({
  scxR: {
    resource: {
      rm: -30,
      total: -30,
    },
  },
  idb: {
    resource: {
      society: 5,
      gov: 17,
      homes: 28,
      st: 50,
      total: 50,
    },
  },
  gcf: {
    usage: {
      gov: 10,
      homes: 20,
      st: 30,
      total: 30,
    },
  },
  ab: {
    usage: {
      society: 5,
      gov: 7,
      homes: 8,
      st: 20,
      total: 20,
    },
  },
  scxU: {
    usage: {
      rm: -30,
      total: -30,
    },
  },
});

const baseCuCaByInstitutionalSectors = () => ({
  scx: {
    resource: {
      rm: -30,
      total: -30,
    },
  },
  ab: {
    resource: {
      society: 5,
      gov: 7,
      homes: 8,
      st: 20,
      total: 20,
    },
  },
  tkr: {
    resource: {
      society: 2,
      gov: 3,
      st: 5,
      rm: 1,
      total: 6,
    },
  },
  tke: {
    resource: {
      society: 1,
      gov: 2,
      st: 3,
      rm: 1,
      total: 4,
    },
  },
  fbkf: {
    usage: {
      total: 9,
      st: 9,
      gov: 4,
      society: 5,
    },
  },
  ve: {
    usage: {
      total: 3,
      st: 3,
      gov: 1,
      society: 2,
    },
  },
  pn: {
    usage: {
      total: -12,
      rm: -28,
      st: 16,
      homes: 8,
      gov: 7,
      society: 1,
    },
  },
});

const baseCuADIByInstitutionalSectors = () => ({
  sbsx: {
    resource: {
      rm: 5,
      total: 5,
    },
  },
  eeb: {
    resource: {
      society: 10,
      gov: 5,
      st: 15,
      total: 15,
    },
  },
  ra: {
    resource: {
      homes: 6,
      st: 6,
      rm: 2,
      total: 8,
    },
  },
  tax: {
    resource: {
      gov: 4,
      st: 4,
      total: 4,
    },
  },
  rp: {
    resource: {
      homes: 3,
      st: 3,
      rm: 1,
      total: 4,
    },
    usage: {
      society: 2,
      gov: 1,
      st: 3,
      rm: 1,
      total: 4,
    },
  },
  cs: {
    resource: {
      gov: 2,
      st: 2,
      total: 2,
    },
    usage: {
      homes: 1,
      st: 1,
      total: 1,
    },
  },
  ps: {
    resource: {
      homes: 1,
      st: 1,
      total: 1,
    },
    usage: {
      gov: 2,
      st: 2,
      total: 2,
    },
  },
  otc: {
    resource: {
      gov: 1,
      st: 1,
      total: 1,
    },
    usage: {
      society: 1,
      st: 1,
      rm: 1,
      total: 2,
    },
  },
  idb: {
    usage: {
      society: 7,
      gov: 9,
      homes: 9,
      st: 25,
      total: 25,
    },
  },
  scx: {
    usage: {
      rm: 6,
      total: 6,
    },
  },
});

const baseCuFiByInstitutionalSectors = () => ({
  pn: {
    resource: {
      society: 4,
      gov: 3,
      homes: 2,
      st: 9,
      rm: 1,
      total: 10,
    },
  },
  anaf: {
    usage: {
      total: 33,
      rm: 6,
      st: 27,
      homes: 10,
      gov: 3,
      society: 14,
    },
  },
  enpf: {
    resource: {
      society: 9,
      gov: 6,
      homes: 5,
      st: 20,
      rm: 10,
      total: 30,
    },
  },
  dldU: {
    usage: {
      total: 8,
      st: 7,
      homes: 1,
      society: 2,
    },
  },
  dldR: {
    resource: {
      society: 6,
      st: 8,
      total: 8,
    },
  },
  vdaU: {
    usage: {
      total: 6,
      rm: 1,
      st: 5,
      homes: 2,
      society: 3,
    },
  },
  vdaR: {
    resource: {
      gov: 4,
      st: 5,
      total: 5,
    },
  },
  pccU: {
    usage: {
      total: 10,
      rm: 2,
      st: 8,
      homes: 3,
      gov: 2,
      society: 4,
    },
  },
  pccR: {
    resource: {
      gov: 2,
      st: 3,
      total: 3,
    },
  },
  aopcU: {
    usage: {
      total: 9,
      rm: 3,
      st: 7,
      homes: 4,
      gov: 1,
      society: 5,
    },
  },
  aopcR: {
    resource: {
      society: 3,
      st: 4,
      rm: 10,
      total: 14,
    },
  },
});

const runSolveMatrix = async ({
  storageKey,
  baseTableFactory,
  targetPathBuilder,
  columns,
  sectionTitle,
  calculateIndex = 0,
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

describe("Compute matrix - CUI", () => {
  test("[CUI][SBSX row] solves scxR.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cUIByInstitutionalSectors",
      baseTableFactory: baseCUIByInstitutionalSectors,
      targetPathBuilder: (col) => `scxR.resource.${col}`,
      columns: CUI_SCX_COLS,
      sectionTitle: APP_SECTIONS.cui,
    });
  });

  test("[CUI][SBSX row] solves scxU.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cUIByInstitutionalSectors",
      baseTableFactory: baseCUIByInstitutionalSectors,
      targetPathBuilder: (col) => `scxU.usage.${col}`,
      columns: CUI_SCX_COLS,
      sectionTitle: APP_SECTIONS.cui,
    });
  });

  test("[CUI][IDB=AB+GCF] solves idb.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cUIByInstitutionalSectors",
      baseTableFactory: baseCUIByInstitutionalSectors,
      targetPathBuilder: (col) => `idb.resource.${col}`,
      columns: CUI_IDB_COLS,
      sectionTitle: APP_SECTIONS.cui,
    });
  });

  test("[CUI][IDB=AB+GCF] solves ab.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cUIByInstitutionalSectors",
      baseTableFactory: baseCUIByInstitutionalSectors,
      targetPathBuilder: (col) => `ab.usage.${col}`,
      columns: CUI_IDB_COLS,
      sectionTitle: APP_SECTIONS.cui,
    });
  });

  test("[CUI][IDB=AB+GCF] solves gcf.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cUIByInstitutionalSectors",
      baseTableFactory: baseCUIByInstitutionalSectors,
      targetPathBuilder: (col) => `gcf.usage.${col}`,
      columns: CUI_GCF_COLS,
      sectionTitle: APP_SECTIONS.cui,
    });
  });
});

describe("Compute matrix - CuCa", () => {
  test("[CuCa][SCX via PN] solves scx.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuCaByInstitutionalSectors",
      baseTableFactory: baseCuCaByInstitutionalSectors,
      targetPathBuilder: (col) => `scx.resource.${col}`,
      columns: CUCA_SCX_COLS,
      sectionTitle: APP_SECTIONS.cuCa,
    });
  });

  test("[CuCa][AB row] solves ab.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuCaByInstitutionalSectors",
      baseTableFactory: baseCuCaByInstitutionalSectors,
      targetPathBuilder: (col) => `ab.resource.${col}`,
      columns: CUCA_AB_COLS,
      sectionTitle: APP_SECTIONS.cuCa,
    });
  });

  test("[CuCa][TKR row] solves tkr.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuCaByInstitutionalSectors",
      baseTableFactory: baseCuCaByInstitutionalSectors,
      targetPathBuilder: (col) => `tkr.resource.${col}`,
      columns: CUCA_TK_COLS,
      sectionTitle: APP_SECTIONS.cuCa,
    });
  });

  test("[CuCa][TKE row] solves tke.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuCaByInstitutionalSectors",
      baseTableFactory: baseCuCaByInstitutionalSectors,
      targetPathBuilder: (col) => `tke.resource.${col}`,
      columns: CUCA_TK_COLS,
      sectionTitle: APP_SECTIONS.cuCa,
    });
  });

  test("[CuCa][FBKF row] solves fbkf.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuCaByInstitutionalSectors",
      baseTableFactory: baseCuCaByInstitutionalSectors,
      targetPathBuilder: (col) => `fbkf.usage.${col}`,
      columns: CUCA_FBK_VE_COLS,
      sectionTitle: APP_SECTIONS.cuCa,
    });
  });

  test("[CuCa][VE row] solves ve.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuCaByInstitutionalSectors",
      baseTableFactory: baseCuCaByInstitutionalSectors,
      targetPathBuilder: (col) => `ve.usage.${col}`,
      columns: CUCA_FBK_VE_COLS,
      sectionTitle: APP_SECTIONS.cuCa,
    });
  });

  test("[CuCa][PN equation] solves pn.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuCaByInstitutionalSectors",
      baseTableFactory: baseCuCaByInstitutionalSectors,
      targetPathBuilder: (col) => `pn.usage.${col}`,
      columns: CUCA_PN_COLS,
      sectionTitle: APP_SECTIONS.cuCa,
    });
  });
});

describe("Compute matrix - CuADI", () => {
  test("[CuADI][SBSX row] solves sbsx.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `sbsx.resource.${col}`,
      columns: CUADI_SBSX_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][EEB row] solves eeb.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `eeb.resource.${col}`,
      columns: CUADI_EEB_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][RA row] solves ra.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `ra.resource.${col}`,
      columns: CUADI_RA_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][TAX row] solves tax.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `tax.resource.${col}`,
      columns: CUADI_TAX_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][RP resource] solves rp.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `rp.resource.${col}`,
      columns: CUADI_RP_RESOURCE_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][RP usage] solves rp.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `rp.usage.${col}`,
      columns: CUADI_RP_USAGE_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][CS resource] solves cs.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `cs.resource.${col}`,
      columns: CUADI_CS_RESOURCE_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][CS usage] solves cs.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `cs.usage.${col}`,
      columns: CUADI_CS_USAGE_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][PS resource] solves ps.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `ps.resource.${col}`,
      columns: CUADI_PS_RESOURCE_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][PS usage] solves ps.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `ps.usage.${col}`,
      columns: CUADI_PS_USAGE_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][OTC resource] solves otc.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `otc.resource.${col}`,
      columns: CUADI_OTC_RESOURCE_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][OTC usage] solves otc.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `otc.usage.${col}`,
      columns: CUADI_OTC_USAGE_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][IDB row] solves idb.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `idb.usage.${col}`,
      columns: CUADI_IDB_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });

  test("[CuADI][SCX row] solves scx.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuADIByInstitutionalSectors",
      baseTableFactory: baseCuADIByInstitutionalSectors,
      targetPathBuilder: (col) => `scx.usage.${col}`,
      columns: CUADI_SCX_COLS,
      sectionTitle: APP_SECTIONS.cuADI,
    });
  });
});

describe("Compute matrix - CuFi", () => {
  test("[CuFi][Top row sum] solves pn.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuFiByInstitutionalSectors",
      baseTableFactory: baseCuFiByInstitutionalSectors,
      targetPathBuilder: (col) => `pn.resource.${col}`,
      columns: CUFI_TOP_COLS,
      sectionTitle: APP_SECTIONS.cuFi,
    });
  });

  test("[CuFi][Top row sum] solves anaf.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuFiByInstitutionalSectors",
      baseTableFactory: baseCuFiByInstitutionalSectors,
      targetPathBuilder: (col) => `anaf.usage.${col}`,
      columns: CUFI_TOP_COLS,
      sectionTitle: APP_SECTIONS.cuFi,
    });
  });

  test("[CuFi][Top row sum] solves enpf.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuFiByInstitutionalSectors",
      baseTableFactory: baseCuFiByInstitutionalSectors,
      targetPathBuilder: (col) => `enpf.resource.${col}`,
      columns: CUFI_TOP_COLS,
      sectionTitle: APP_SECTIONS.cuFi,
    });
  });

  test("[CuFi][ANAF components] solves anaf.usage.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuFiByInstitutionalSectors",
      baseTableFactory: baseCuFiByInstitutionalSectors,
      targetPathBuilder: (col) => `anaf.usage.${col}`,
      columns: CUFI_TOP_COLS,
      sectionTitle: APP_SECTIONS.cuFi,
    });
  });

  test("[CuFi][ENPF components] solves enpf.resource.%s", async () => {
    await runSolveMatrix({
      storageKey: "cuFiByInstitutionalSectors",
      baseTableFactory: baseCuFiByInstitutionalSectors,
      targetPathBuilder: (col) => `enpf.resource.${col}`,
      columns: CUFI_ENPF_COMPONENT_COLS,
      sectionTitle: APP_SECTIONS.cuFi,
    });
  });
});
