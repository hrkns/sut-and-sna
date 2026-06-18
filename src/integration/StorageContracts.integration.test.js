import { waitFor, within } from "@testing-library/react";
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
  setBranchesCountInputValue,
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

describe("Storage contracts and state synchronization", () => {
  test("retrieve without COU does not write any module storage tables", async () => {
    const appValues = createAppValuesFixture({ branchCount: 3 });
    const { user } = renderApp({
      storage: {
        appValues,
      },
    });

    const retrieveCases = [
      {
        sectionTitle: APP_SECTIONS.cuPro,
        buttonIndex: 0,
        storageKey: "cuProByActivity",
      },
      {
        sectionTitle: APP_SECTIONS.cuPro,
        buttonIndex: 1,
        storageKey: "cuProByInstitutionalSectors",
      },
      {
        sectionTitle: APP_SECTIONS.cuGeI,
        buttonIndex: 0,
        storageKey: "cuGeIByActivity",
      },
      {
        sectionTitle: APP_SECTIONS.cuGeI,
        buttonIndex: 1,
        storageKey: "cuGeIByInstitutionalSectors",
      },
      {
        sectionTitle: APP_SECTIONS.cuADI,
        buttonIndex: 0,
        storageKey: "cuADIByInstitutionalSectors",
      },
      {
        sectionTitle: APP_SECTIONS.cui,
        buttonIndex: 0,
        storageKey: "cUIByInstitutionalSectors",
      },
      {
        sectionTitle: APP_SECTIONS.cuCa,
        buttonIndex: 0,
        storageKey: "cuCaByInstitutionalSectors",
      },
    ];

    retrieveCases.forEach(({ storageKey }) => {
      expect(getItem(storageKey)).toBeNull();
    });

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

    retrieveCases.forEach(({ storageKey }) => {
      expect(getItem(storageKey)).toBeNull();
    });
  });

  test("COU input prioritizes persisted cou key over stale appValues.cou and re-syncs both stores", async () => {
    const appValues = createAppValuesFixture({
      branchCount: 3,
      includeCou: true,
      couValuesByPath: {
        "branch1.intermediateUse.branch1": "111",
      },
    });
    const cou = createCouFixture({
      branchCount: 3,
      valuesByPath: {
        "branch1.intermediateUse.branch1": "222",
      },
    });
    const { user } = renderApp({
      storage: {
        appValues,
        cou,
      },
    });

    expect(getItem("appValues").cou.branch1.intermediateUse.branch1).toBe(
      "111"
    );
    expect(getSectionNumericInputValueByIndex(APP_SECTIONS.cou, 0)).toBe("222");

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, "333", { user });

    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch1).toBe("333")
    );
    await waitFor(() =>
      expect(getItem("appValues").cou.branch1.intermediateUse.branch1).toBe(
        "333"
      )
    );
  });

  test("rapid branch-count churn keeps COU storage normalized and interactive", async () => {
    const { user } = renderApp();

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 0, "7", { user });
    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch1).toBe("7")
    );

    const branchSequence = [4, 1, 4, 2];
    for (const branchCount of branchSequence) {
      setBranchesCountInputValue(branchCount);
      await waitFor(() =>
        expect(getItem("appValues").branches).toHaveLength(branchCount)
      );
    }

    expect(getBranchesCountInput().value).toBe("2");
    expect(getItem("cou").branch1.intermediateUse.branch1).toBe("7");
    expect(getItem("cou").branch1.intermediateUse.branch3).toBeUndefined();
    expect(getItem("cou").branch1.intermediateUse.branch4).toBeUndefined();
    expect(
      getItem("appValues").cou.branch1.intermediateUse.branch3
    ).toBeUndefined();
    expect(
      getItem("appValues").cou.branch1.intermediateUse.branch4
    ).toBeUndefined();

    await setSectionNumericInputByIndex(APP_SECTIONS.cou, 1, "8", { user });
    await waitFor(() =>
      expect(getItem("cou").branch1.intermediateUse.branch2).toBe("8")
    );
  });
});
