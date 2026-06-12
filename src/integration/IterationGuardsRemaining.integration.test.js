import { waitFor, within } from "@testing-library/react";
import { createAppValuesFixture } from "./fixtures/couFixtures";
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

const clickCalculateButtonByIndex = async (sectionTitle, calculateIndex, user) => {
  await openAccordionSection(sectionTitle, user);
  const section = getAccordionItemByTitle(sectionTitle);
  const calculateButtons = within(section).getAllByRole("button", {
    name: CALCULATE_BUTTON_LABEL,
  });
  await user.click(calculateButtons[calculateIndex]);
};

const runIterationGuardCase = async ({
  storageKey,
  table,
  sectionTitle,
  calculateIndex = 0,
  expectedLabel,
}) => {
  const appValues = createAppValuesFixture({ branchCount: 1 });
  const { user } = renderApp({
    storage: {
      appValues,
      [storageKey]: table,
    },
  });

  await clickCalculateButtonByIndex(sectionTitle, calculateIndex, user);

  await waitFor(() => expect(window.alert).toHaveBeenCalled());
  expect(window.alert.mock.calls[0][0]).toMatch(/iteraciones/i);
  expect(window.alert.mock.calls[0][0]).toMatch(expectedLabel);
};

describe("Iteration guards for remaining compute modules", () => {
  beforeEach(() => {
    solveEquation.mockReset();
    solveEquation.mockImplementation(() => Number.NaN);
  });

  test("CuGeI by activity shows iteration-limit alert when solver never converges", async () => {
    await runIterationGuardCase({
      storageKey: "cuGeIByActivity",
      table: {
        vabPerActivity: {
          resource: {
            branch1: 10,
            gov: 20,
            total: 30,
          },
        },
        ra: {
          usage: {
            branch1: 3,
            gov: 4,
            total: 7,
          },
        },
        tax: {
          usage: {
            branch1: 2,
            gov: 1,
            total: 3,
          },
        },
        eeb: {
          usage: {
            branch1: "",
            gov: 15,
            total: 15,
          },
        },
      },
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 0,
      expectedLabel: /Generaci/i,
    });
  });

  test("CuGeI by institutional sectors shows iteration-limit alert when solver never converges", async () => {
    await runIterationGuardCase({
      storageKey: "cuGeIByInstitutionalSectors",
      table: {
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
            rm: "",
            total: -30,
          },
        },
      },
      sectionTitle: APP_SECTIONS.cuGeI,
      calculateIndex: 1,
      expectedLabel: /Generaci/i,
    });
  });

  test("CuADI shows iteration-limit alert when solver never converges", async () => {
    await runIterationGuardCase({
      storageKey: "cuADIByInstitutionalSectors",
      table: {
        sbsx: {
          resource: {
            rm: 5,
            total: "",
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
      },
      sectionTitle: APP_SECTIONS.cuADI,
      expectedLabel: /Asignaci/i,
    });
  });

  test("CUI shows iteration-limit alert when solver never converges", async () => {
    await runIterationGuardCase({
      storageKey: "cUIByInstitutionalSectors",
      table: {
        scxR: {
          resource: {
            rm: -30,
            total: "",
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
      },
      sectionTitle: APP_SECTIONS.cui,
      expectedLabel: /Utilizaci/i,
    });
  });

  test("CuCa shows iteration-limit alert when solver never converges", async () => {
    await runIterationGuardCase({
      storageKey: "cuCaByInstitutionalSectors",
      table: {
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
            total: "",
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
      },
      sectionTitle: APP_SECTIONS.cuCa,
      expectedLabel: /Capital/i,
    });
  });

  test("CuFi shows iteration-limit alert when solver never converges", async () => {
    await runIterationGuardCase({
      storageKey: "cuFiByInstitutionalSectors",
      table: {
        pn: {
          resource: {
            society: 4,
            gov: 3,
            homes: 2,
            st: 9,
            rm: 1,
            total: "",
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
      },
      sectionTitle: APP_SECTIONS.cuFi,
      expectedLabel: /Financiera|Capital/i,
    });
  });
});
