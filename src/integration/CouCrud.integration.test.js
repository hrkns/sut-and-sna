import { screen, waitFor, within } from "@testing-library/react";
import { getItem, setItem } from "../shared/db";
import {
  APP_SECTIONS,
  clickSectionActionButton,
  getSectionNumericInputValueByIndex,
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

const saveCouSnapshot = async ({ user, fileName, inputValue = "21" }) => {
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

describe("COU CRUD modal flow", () => {
  test("saves, loads and deletes a COU snapshot", async () => {
    const { user } = renderApp();
    const snapshotName = "cou-snapshot-1";

    await saveCouSnapshot({ user, fileName: snapshotName, inputValue: "21" });

    await waitFor(() =>
      expect(
        getItem("saved").cou[snapshotName].branch1.intermediateUse.branch1
      ).toBe("21")
    );

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, "99", { user });
    await waitFor(() =>
      expect(getSectionNumericInputValueByIndex(APP_SECTIONS.cou, 0)).toBe("99")
    );

    await clickSectionActionButton(APP_SECTIONS.cou, /Cargar/i, user);
    const loadDialog = await findModalByTitle(/Cargar COU/i);
    await user.click(within(loadDialog).getByDisplayValue(snapshotName));
    await user.click(
      within(loadDialog).getByRole("button", { name: /Cargar/i })
    );

    await waitFor(() =>
      expect(getSectionNumericInputValueByIndex(APP_SECTIONS.cou, 0)).toBe("21")
    );

    await clickSectionActionButton(APP_SECTIONS.cou, /Cargar/i, user);
    const loadDialogForDelete = await findModalByTitle(/Cargar COU/i);
    await user.click(within(loadDialogForDelete).getByText(/^X$/));

    const deleteDialog = await findModalByTitle(/Borrar COU/i);
    await user.click(
      within(deleteDialog).getByRole("button", { name: /Eliminar/i })
    );

    await waitFor(() => {
      const saved = getItem("saved") || {};
      const couSaves = saved.cou || {};
      expect(couSaves[snapshotName]).toBeUndefined();
    });
  });

  test("shows empty-state alert when trying to load with no saved entries", async () => {
    const { user } = renderApp();

    await clickSectionActionButton(APP_SECTIONS.cou, /Cargar/i, user);

    expect(window.alert).toHaveBeenCalledWith("No hay elementos guardados");
  });

  test("shows missing-entry alert when selected entry no longer exists", async () => {
    const { user } = renderApp();
    const snapshotName = "cou-snapshot-missing";

    await saveCouSnapshot({ user, fileName: snapshotName, inputValue: "15" });
    await clickSectionActionButton(APP_SECTIONS.cou, /Cargar/i, user);

    const loadDialog = await findModalByTitle(/Cargar COU/i);
    await user.click(within(loadDialog).getByDisplayValue(snapshotName));

    const saved = getItem("saved");
    delete saved.cou[snapshotName];
    setItem("saved", saved);

    await user.click(
      within(loadDialog).getByRole("button", { name: /Cargar/i })
    );

    expect(window.alert).toHaveBeenCalledWith("No existe el elemento guardado");
  });
});
