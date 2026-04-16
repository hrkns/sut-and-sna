import { screen, waitFor, within } from "@testing-library/react";
import { getItem } from "../shared/db";
import { createAppValuesFixture } from "./fixtures/couFixtures";
import {
  APP_SECTIONS,
  getAccordionItemByTitle,
  getBranchesCountInput,
  openAccordionSection,
  renderApp,
  setBranchesCountInputValue,
  setSectionNumericInputByIndex,
} from "./utils/testHarness";

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

describe("App resilience edge behavior", () => {
  test("branch count contraction drops removed branch values from persisted COU", async () => {
    const { user } = renderApp();

    setBranchesCountInputValue(4);
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(4));

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 3, "44", { user });
    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch4).toBe("44")
    );

    setBranchesCountInputValue(1);
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(1));

    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch4).toBeUndefined()
    );
    await waitFor(() =>
      expect(getItem("appValues").cou.branch1.intermediateUse.branch4).toBeUndefined()
    );
  });

  test("branch count expansion preserves existing COU values and initializes new branches empty", async () => {
    const { user } = renderApp();

    setBranchesCountInputValue(1);
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(1));

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, "11", { user });
    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch1).toBe("11")
    );

    setBranchesCountInputValue(4);
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(4));

    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch1).toBe("11")
    );
    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch4).toBe("")
    );
    await waitFor(() =>
      expect(getItem("cou").branch4.intermediateUse.branch1).toBe("")
    );
  });

  test("retrieve-from-COU actions do not crash when COU values are absent", async () => {
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const { user } = renderApp({
      storage: {
        appValues,
      },
    });

    const retrieveCases = [
      { sectionTitle: APP_SECTIONS.cuPro, buttonIndex: 0 },
      { sectionTitle: APP_SECTIONS.cuPro, buttonIndex: 1 },
      { sectionTitle: APP_SECTIONS.cuGeI, buttonIndex: 0 },
      { sectionTitle: APP_SECTIONS.cuGeI, buttonIndex: 1 },
      { sectionTitle: APP_SECTIONS.cuADI, buttonIndex: 0 },
      { sectionTitle: APP_SECTIONS.cui, buttonIndex: 0 },
      { sectionTitle: APP_SECTIONS.cuCa, buttonIndex: 0 },
    ];

    for (const retrieveCase of retrieveCases) {
      await clickSectionActionButtonByIndex(
        retrieveCase.sectionTitle,
        /Obtener valores desde el COU/i,
        retrieveCase.buttonIndex,
        user
      );
    }

    expect(window.alert).toHaveBeenCalledTimes(retrieveCases.length);
    expect(
      window.alert.mock.calls.every(
        ([msg]) => msg === "No hay valores del COU disponibles para recuperar"
      )
    ).toBe(true);
  });

  test("app boot with malformed appValues falls back to a safe default shape", async () => {
    renderApp({
      storage: {
        appValues: "malformed-shape",
      },
    });

    expect(screen.getByText(/Cantidad de ramas/i)).toBeInTheDocument();
    expect(getBranchesCountInput().value).toBe("3");

    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(3));
    expect(getItem("appValues").branches[0].name).toBe("Rama 1");
  });
});
