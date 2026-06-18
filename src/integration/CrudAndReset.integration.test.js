import _ from "lodash";
import { screen, waitFor, within } from "@testing-library/react";
import { getItem } from "../shared/db";
import {
  APP_SECTIONS,
  clickSectionActionButton,
  getAccordionItemByTitle,
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
  await openAccordionSection(sectionTitle, user);
  const section = getAccordionItemByTitle(sectionTitle);
  const actionButtons = within(section).getAllByRole("button", {
    name: actionLabel,
  });
  await user.click(actionButtons[actionIndex]);
};

const saveCouSnapshot = async ({ user, fileName, inputValue }) => {
  await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, inputValue, {
    user,
  });
  await clickSectionActionButton(APP_SECTIONS.cou, /Guardar/i, user);
  const saveDialog = await findModalByTitle(/Guardar COU/i);
  await user.clear(within(saveDialog).getByRole("textbox"));
  await user.type(within(saveDialog).getByRole("textbox"), fileName);
  await user.click(
    within(saveDialog).getByRole("button", { name: /Guardar/i })
  );
};

describe("CRUD and reset edge behavior", () => {
  test("CuFi CRUD persists under cuFiByInstitutionalSectors key", async () => {
    const snapshotName = "cu-fi-storage-key";
    const { user } = renderApp();

    await setSectionNumericInputByIndex(APP_SECTIONS.cuFi, 0, "9", { user });
    await clickSectionActionButtonByIndex(
      APP_SECTIONS.cuFi,
      /Guardar/i,
      0,
      user
    );

    const saveDialog = await findModalByTitle(/Guardar Cuenta Financiera/i);
    await user.clear(within(saveDialog).getByRole("textbox"));
    await user.type(within(saveDialog).getByRole("textbox"), snapshotName);
    await user.click(
      within(saveDialog).getByRole("button", { name: /Guardar/i })
    );

    await waitFor(() =>
      expect(
        getItem("saved").cuFiByInstitutionalSectors[snapshotName]
      ).toBeDefined()
    );

    const saved = getItem("saved");
    expect(saved.cuCaByInstitutionalSectors?.[snapshotName]).toBeUndefined();
  });

  test("CRUD save ignores blank or whitespace-only names", async () => {
    const { user } = renderApp();

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, "17", { user });
    await clickSectionActionButton(APP_SECTIONS.cou, /Guardar/i, user);

    const saveDialog = await findModalByTitle(/Guardar COU/i);
    await user.clear(within(saveDialog).getByRole("textbox"));
    await user.type(within(saveDialog).getByRole("textbox"), "   ");
    await user.click(
      within(saveDialog).getByRole("button", { name: /Guardar/i })
    );

    const saved = getItem("saved") || {};
    expect(saved.cou).toBeUndefined();
  });

  test("CRUD save overwrites an existing snapshot deterministically", async () => {
    const snapshotName = "cou-overwrite";
    const { user } = renderApp();

    await saveCouSnapshot({ user, fileName: snapshotName, inputValue: "11" });
    await saveCouSnapshot({ user, fileName: snapshotName, inputValue: "22" });

    await waitFor(() =>
      expect(
        getItem("saved").cou[snapshotName].branch1.intermediateUse.branch1
      ).toBe("22")
    );
  });

  test("CRUD delete cancel keeps the snapshot intact", async () => {
    const snapshotName = "cou-cancel-delete";
    const { user } = renderApp();

    await saveCouSnapshot({ user, fileName: snapshotName, inputValue: "15" });
    await clickSectionActionButton(APP_SECTIONS.cou, /Cargar/i, user);

    const loadDialog = await findModalByTitle(/Cargar COU/i);
    await user.click(within(loadDialog).getByText(/^X$/));

    const deleteDialog = await findModalByTitle(/Borrar COU/i);
    await user.click(
      within(deleteDialog).getByRole("button", { name: /Cerrar/i })
    );

    await waitFor(() =>
      expect(
        getItem("saved").cou[snapshotName].branch1.intermediateUse.branch1
      ).toBe("15")
    );
  });

  test("Vaciar resets all sections to empty persisted state", async () => {
    const { user } = renderApp();

    const resetCases = [
      {
        sectionTitle: APP_SECTIONS.cou,
        tableIndex: 0,
        vaciarIndex: 0,
        storageKey: "cou",
        valuePath: "branch1.intermediateUse.branch1",
        expectedEmpty: null,
      },
      {
        sectionTitle: APP_SECTIONS.cuPro,
        tableIndex: 0,
        vaciarIndex: 0,
        storageKey: "cuProByActivity",
        valuePath: "productionPerActivity.resource.branch1",
        expectedEmpty: "",
      },
      {
        sectionTitle: APP_SECTIONS.cuPro,
        tableIndex: 1,
        vaciarIndex: 1,
        storageKey: "cuProByInstitutionalSectors",
        valuePath: "imports.resource.rm",
        expectedEmpty: null,
      },
      {
        sectionTitle: APP_SECTIONS.cuGeI,
        tableIndex: 0,
        vaciarIndex: 0,
        storageKey: "cuGeIByActivity",
        valuePath: "vabPerActivity.resource.branch1",
        expectedEmpty: "",
      },
      {
        sectionTitle: APP_SECTIONS.cuGeI,
        tableIndex: 1,
        vaciarIndex: 1,
        storageKey: "cuGeIByInstitutionalSectors",
        valuePath: "sbsxR.resource.rm",
        expectedEmpty: null,
      },
      {
        sectionTitle: APP_SECTIONS.cuADI,
        tableIndex: 0,
        vaciarIndex: 0,
        storageKey: "cuADIByInstitutionalSectors",
        valuePath: "sbsx.resource.rm",
        expectedEmpty: null,
      },
      {
        sectionTitle: APP_SECTIONS.cui,
        tableIndex: 0,
        vaciarIndex: 0,
        storageKey: "cUIByInstitutionalSectors",
        valuePath: "scxR.resource.rm",
        expectedEmpty: null,
      },
      {
        sectionTitle: APP_SECTIONS.cuCa,
        tableIndex: 0,
        vaciarIndex: 0,
        storageKey: "cuCaByInstitutionalSectors",
        valuePath: "scx.resource.rm",
        expectedEmpty: null,
      },
      {
        sectionTitle: APP_SECTIONS.cuFi,
        tableIndex: 0,
        vaciarIndex: 0,
        storageKey: "cuFiByInstitutionalSectors",
        valuePath: "pn.resource.society",
        expectedEmpty: null,
      },
    ];

    for (const resetCase of resetCases) {
      await setSectionNumericInputByIndex(resetCase.sectionTitle, 0, "31", {
        user,
        tableIndex: resetCase.tableIndex,
      });

      await clickSectionActionButtonByIndex(
        resetCase.sectionTitle,
        /Vaciar/i,
        resetCase.vaciarIndex,
        user
      );

      await waitFor(() =>
        expect(
          getSectionNumericInputValueByIndex(
            resetCase.sectionTitle,
            0,
            resetCase.tableIndex
          )
        ).toBe("")
      );

      await waitFor(() =>
        expect(_.get(getItem(resetCase.storageKey), resetCase.valuePath)).toBe(
          resetCase.expectedEmpty
        )
      );
    }
  });
});
