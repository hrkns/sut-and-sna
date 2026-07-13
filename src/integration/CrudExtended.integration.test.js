import { screen, waitFor, within } from "@testing-library/react";
import { getItem } from "../shared/db";
import {
  createAppValuesFixture,
  createCouFixture,
} from "./fixtures/couFixtures";
import {
  APP_SECTIONS,
  getBranchesCountInput,
  getSectionNumericInputValueByIndex,
  openAccordionSection,
  renderApp,
  setSectionNumericInputByIndex,
} from "./utils/testHarness";

const findModalByTitle = async (titleMatcher) => {
  const modals = await screen.findAllByRole("dialog");
  const modal = modals.find((candidate) =>
    within(candidate).queryByText(titleMatcher)
  );
  if (!modal) {
    throw new Error(`Could not locate modal with title ${titleMatcher}`);
  }
  return modal;
};

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

const CRUD_SCENARIOS = [
  {
    label: "CuPro by Activity",
    storageKey: "cuProByActivity",
    sectionTitle: APP_SECTIONS.cuPro,
    tableIndex: 0,
    actionIndex: 0,
    saveTitle: /Guardar Cuenta de Producci.*Actividad/i,
    loadTitle: /Cargar Cuenta de Producci.*Actividad/i,
    deleteTitle: /Borrar Cuenta de Producci.*Actividad/i,
  },
  {
    label: "CuPro by Institutional Sectors",
    storageKey: "cuProByInstitutionalSectors",
    sectionTitle: APP_SECTIONS.cuPro,
    tableIndex: 1,
    actionIndex: 1,
    saveTitle: /Guardar Cuenta de Producci.*Sectores/i,
    loadTitle: /Cargar Cuenta de Producci.*Sectores/i,
    deleteTitle: /Borrar Cuenta de Producci.*Sectores/i,
  },
  {
    label: "CuGeI by Activity",
    storageKey: "cuGeIByActivity",
    sectionTitle: APP_SECTIONS.cuGeI,
    tableIndex: 0,
    actionIndex: 0,
    saveTitle: /Guardar Cuenta de Generaci.*Actividad/i,
    loadTitle: /Cargar Cuenta de Generaci.*Actividad/i,
    deleteTitle: /Borrar Cuenta de Generaci.*Actividad/i,
  },
  {
    label: "CuGeI by Institutional Sectors",
    storageKey: "cuGeIByInstitutionalSectors",
    sectionTitle: APP_SECTIONS.cuGeI,
    tableIndex: 1,
    actionIndex: 1,
    saveTitle: /Guardar Cuenta de Generaci.*Sectores/i,
    loadTitle: /Cargar Cuenta de Generaci.*Sectores/i,
    deleteTitle: /Borrar Cuenta de Generaci.*Sectores/i,
  },
  {
    label: "CuADI by Institutional Sectors",
    storageKey: "cuADIByInstitutionalSectors",
    sectionTitle: APP_SECTIONS.cuADI,
    tableIndex: 0,
    actionIndex: 0,
    saveTitle: /Guardar Cuenta de Asignaci.*Sectores/i,
    loadTitle: /Cargar Cuenta de Asignaci.*Sectores/i,
    deleteTitle: /Borrar Cuenta de Asignaci.*Sectores/i,
  },
  {
    label: "CUI by Institutional Sectors",
    storageKey: "cUIByInstitutionalSectors",
    sectionTitle: APP_SECTIONS.cui,
    tableIndex: 0,
    actionIndex: 0,
    saveTitle: /Guardar Cuenta de Utilizaci.*Sectores/i,
    loadTitle: /Cargar Cuenta de Utilizaci.*Sectores/i,
    deleteTitle: /Borrar Cuenta de Utilizaci.*Sectores/i,
  },
  {
    label: "CuCa by Institutional Sectors",
    storageKey: "cuCaByInstitutionalSectors",
    sectionTitle: APP_SECTIONS.cuCa,
    tableIndex: 0,
    actionIndex: 0,
    saveTitle: /Guardar Cuenta Capital/i,
    loadTitle: /Cargar Cuenta Capital/i,
    deleteTitle: /Borrar Cuenta Capital/i,
  },
  {
    label: "CuFi by Institutional Sectors",
    storageKey: "cuFiByInstitutionalSectors",
    sectionTitle: APP_SECTIONS.cuFi,
    tableIndex: 0,
    actionIndex: 0,
    saveTitle: /Guardar Cuenta Financiera/i,
    loadTitle: /Cargar Cuenta Financiera/i,
    deleteTitle: /Borrar Cuenta Financiera/i,
  },
];

describe("Extended CRUD behavior", () => {
  test("all non-COU modules support save-load-delete roundtrip", async () => {
    const { user } = renderApp();

    for (const scenario of CRUD_SCENARIOS) {
      const snapshotName = `${scenario.storageKey}-snapshot`;

      await setSectionNumericInputByIndex(scenario.sectionTitle, 0, "11", {
        tableIndex: scenario.tableIndex,
        user,
      });

      await clickSectionActionButtonByIndex(
        scenario.sectionTitle,
        /Guardar/i,
        scenario.actionIndex,
        user
      );
      const saveDialog = await findModalByTitle(scenario.saveTitle);
      await user.clear(within(saveDialog).getByRole("textbox"));
      await user.type(within(saveDialog).getByRole("textbox"), snapshotName);
      await user.click(
        within(saveDialog).getByRole("button", { name: /Guardar/i })
      );

      await waitFor(() =>
        expect(
          getItem("saved")[scenario.storageKey][snapshotName]
        ).toBeDefined()
      );

      await setSectionNumericInputByIndex(scenario.sectionTitle, 0, "22", {
        tableIndex: scenario.tableIndex,
        user,
      });
      await waitFor(() =>
        expect(
          getSectionNumericInputValueByIndex(
            scenario.sectionTitle,
            0,
            scenario.tableIndex
          )
        ).toBe("22")
      );

      await clickSectionActionButtonByIndex(
        scenario.sectionTitle,
        /Cargar/i,
        scenario.actionIndex,
        user
      );
      const loadDialog = await findModalByTitle(scenario.loadTitle);
      await user.click(within(loadDialog).getByDisplayValue(snapshotName));
      await user.click(
        within(loadDialog).getByRole("button", { name: /Cargar/i })
      );

      await waitFor(() =>
        expect(
          getSectionNumericInputValueByIndex(
            scenario.sectionTitle,
            0,
            scenario.tableIndex
          )
        ).toBe("11")
      );

      await clickSectionActionButtonByIndex(
        scenario.sectionTitle,
        /Cargar/i,
        scenario.actionIndex,
        user
      );
      const loadDialogForDelete = await findModalByTitle(scenario.loadTitle);
      await user.click(within(loadDialogForDelete).getByText(/^X$/));

      window.alert.mockClear();
      const deleteDialog = await findModalByTitle(scenario.deleteTitle);
      await user.click(
        within(deleteDialog).getByRole("button", { name: /Eliminar/i })
      );

      await waitFor(() => {
        const saved = getItem("saved") || {};
        const savedByKey = saved[scenario.storageKey] || {};
        expect(savedByKey[snapshotName]).toBeUndefined();
      });
      expect(window.alert).toHaveBeenCalledWith("No hay elementos guardados");
    }
  });

  test("CRUD load lists are isolated per storage namespace", async () => {
    const savedByKey = CRUD_SCENARIOS.reduce((acc, scenario) => {
      acc[scenario.storageKey] = {
        [`item-for-${scenario.storageKey}`]: {
          marker: scenario.storageKey,
        },
      };
      return acc;
    }, {});

    const { user } = renderApp({
      storage: {
        saved: savedByKey,
      },
    });

    for (const scenario of CRUD_SCENARIOS) {
      const ownItemName = `item-for-${scenario.storageKey}`;

      await clickSectionActionButtonByIndex(
        scenario.sectionTitle,
        /Cargar/i,
        scenario.actionIndex,
        user
      );
      const loadDialog = await findModalByTitle(scenario.loadTitle);

      expect(
        within(loadDialog).getByDisplayValue(ownItemName)
      ).toBeInTheDocument();
      expect(within(loadDialog).getAllByRole("radio")).toHaveLength(1);

      await user.click(
        within(loadDialog).getByRole("button", { name: /Cerrar/i })
      );
    }

    expect(window.alert).not.toHaveBeenCalled();
  });

  test("COU snapshots with different branch widths load safely", async () => {
    const wideSnapshotName = "cou-wide-4";
    const wideSnapshot = createCouFixture({
      branchCount: 4,
      valuesByPath: {
        "branch1.intermediateUse.branch1": "101",
        "branch1.intermediateUse.branch4": "404",
      },
    });

    const { user, unmount } = renderApp({
      storage: {
        appValues: createAppValuesFixture({ branchCount: 1 }),
        saved: {
          cou: {
            [wideSnapshotName]: wideSnapshot,
          },
        },
      },
    });

    await clickSectionActionButtonByIndex(APP_SECTIONS.cou, /Cargar/i, 0, user);
    const narrowLoadDialog = await findModalByTitle(/Cargar COU/i);
    await user.click(
      within(narrowLoadDialog).getByDisplayValue(wideSnapshotName)
    );
    await user.click(
      within(narrowLoadDialog).getByRole("button", { name: /Cargar/i })
    );

    await waitFor(() =>
      expect(getSectionNumericInputValueByIndex(APP_SECTIONS.cou, 0, 0)).toBe(
        "101"
      )
    );
    expect(getBranchesCountInput().value).toBe("1");

    unmount();

    const narrowSnapshotName = "cou-narrow-1";
    const narrowSnapshot = createCouFixture({
      branchCount: 1,
      valuesByPath: {
        "branch1.intermediateUse.branch1": "303",
      },
    });

    const { user: user2 } = renderApp({
      storage: {
        appValues: createAppValuesFixture({ branchCount: 4 }),
        saved: {
          cou: {
            [narrowSnapshotName]: narrowSnapshot,
          },
        },
      },
    });

    await clickSectionActionButtonByIndex(
      APP_SECTIONS.cou,
      /Cargar/i,
      0,
      user2
    );
    const wideLoadDialog = await findModalByTitle(/Cargar COU/i);
    await user2.click(
      within(wideLoadDialog).getByDisplayValue(narrowSnapshotName)
    );
    await user2.click(
      within(wideLoadDialog).getByRole("button", { name: /Cargar/i })
    );

    await waitFor(() =>
      expect(getSectionNumericInputValueByIndex(APP_SECTIONS.cou, 0, 0)).toBe(
        "303"
      )
    );
    await waitFor(() =>
      expect(getSectionNumericInputValueByIndex(APP_SECTIONS.cou, 3, 0)).toBe(
        ""
      )
    );

    expect(getBranchesCountInput().value).toBe("4");
    expect(window.alert).not.toHaveBeenCalled();
  });
});
