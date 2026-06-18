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

const RETRIEVE_BUTTON_LABEL = /Obtener valores desde el COU/i;

const couValuesByPath = {
  "production.intermediateUse.branch1": "10",
  "production.intermediateUse.branch2": "20",
  "production.intermediateUse.branch3": "30",
  "production.intermediateUse.gov": "40",
  "production.intermediateUse.st": "100",
  "totalUses.intermediateUse.branch1": "11",
  "totalUses.intermediateUse.branch2": "21",
  "totalUses.intermediateUse.branch3": "31",
  "totalUses.intermediateUse.gov": "41",
  "totalUses.intermediateUse.st": "104",
  "vab.intermediateUse.branch1": "12",
  "vab.intermediateUse.branch2": "22",
  "vab.intermediateUse.branch3": "32",
  "vab.intermediateUse.gov": "42",
  "vab.intermediateUse.st": "108",
  "ckf.intermediateUse.branch1": "13",
  "ckf.intermediateUse.branch2": "23",
  "ckf.intermediateUse.branch3": "33",
  "ckf.intermediateUse.gov": "43",
  "ckf.intermediateUse.st": "112",
  "ra.intermediateUse.branch1": "2",
  "ra.intermediateUse.branch2": "3",
  "ra.intermediateUse.branch3": "4",
  "ra.intermediateUse.gov": "5",
  "ra.intermediateUse.st": "14",
  "tax.intermediateUse.branch1": "1",
  "tax.intermediateUse.branch2": "1",
  "tax.intermediateUse.branch3": "1",
  "tax.intermediateUse.gov": "0",
  "tax.intermediateUse.st": "3",
  "een.intermediateUse.branch1": "7",
  "een.intermediateUse.branch2": "8",
  "een.intermediateUse.branch3": "9",
  "een.intermediateUse.gov": "10",
  "een.intermediateUse.st": "24",
  "imports.total": "50",
  "totalUses.finalUse.exports": "80",
};

const clickRetrieveFromCouButton = async (sectionTitle, buttonIndex, user) => {
  await openAccordionSection(sectionTitle, user);
  const section = getAccordionItemByTitle(sectionTitle);
  const retrieveButtons = within(section).getAllByRole("button", {
    name: RETRIEVE_BUTTON_LABEL,
  });
  await user.click(retrieveButtons[buttonIndex]);
};

describe("Cross-module retrieval from COU - Group A", () => {
  test("CuPro retrieves COU values for activity and institutional tables", async () => {
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

    await clickRetrieveFromCouButton(APP_SECTIONS.cuPro, 0, user);

    await waitFor(() =>
      expect(
        getItem("cuProByActivity").productionPerActivity.resource.branch1
      ).toBe("10")
    );
    await waitFor(() =>
      expect(
        getItem("cuProByActivity").productionPerActivity.resource.total
      ).toBe("100")
    );
    await waitFor(() =>
      expect(getItem("cuProByActivity").intermediateConsumption.usage.gov).toBe(
        "41"
      )
    );
    await waitFor(() =>
      expect(getItem("cuProByActivity").vabPerActivity.usage.branch3).toBe("32")
    );
    await waitFor(() =>
      expect(getItem("cuProByActivity").ckf.usage.total).toBe("112")
    );

    await clickRetrieveFromCouButton(APP_SECTIONS.cuPro, 1, user);

    await waitFor(() =>
      expect(getItem("cuProByInstitutionalSectors").imports.resource.rm).toBe(
        "50"
      )
    );
    await waitFor(() =>
      expect(getItem("cuProByInstitutionalSectors").exports.usage.total).toBe(
        "80"
      )
    );
    await waitFor(() =>
      expect(
        getItem("cuProByInstitutionalSectors").production.resource.society
      ).toBe(60)
    );
    await waitFor(() =>
      expect(getItem("cuProByInstitutionalSectors").ci.usage.society).toBe(63)
    );
    await waitFor(() =>
      expect(getItem("cuProByInstitutionalSectors").vab.usage.st).toBe("108")
    );
    await waitFor(() =>
      expect(getItem("cuProByInstitutionalSectors").ckf.usage.total).toBe("112")
    );
  });

  test("CuGeI retrieves COU values for activity and institutional tables", async () => {
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

    await clickRetrieveFromCouButton(APP_SECTIONS.cuGeI, 0, user);

    await waitFor(() =>
      expect(getItem("cuGeIByActivity").vabPerActivity.resource.branch2).toBe(
        "22"
      )
    );
    await waitFor(() =>
      expect(getItem("cuGeIByActivity").ra.usage.total).toBe("14")
    );
    await waitFor(() =>
      expect(getItem("cuGeIByActivity").tax.usage.branch1).toBe("1")
    );
    await waitFor(() =>
      expect(getItem("cuGeIByActivity").eeb.usage.branch3).toBe(42)
    );
    await waitFor(() =>
      expect(getItem("cuGeIByActivity").eeb.usage.total).toBe(136)
    );

    await clickRetrieveFromCouButton(APP_SECTIONS.cuGeI, 1, user);

    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").sbsxR.resource.rm).toBe(-30)
    );
    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").sbsxU.usage.total).toBe(-30)
    );
    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").vab.resource.society).toBe(
        66
      )
    );
    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").ra.usage.society).toBe(9)
    );
    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").tax.usage.total).toBe("3")
    );
    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").eeb.usage.gov).toBe(53)
    );
    await waitFor(() =>
      expect(getItem("cuGeIByInstitutionalSectors").eeb.usage.total).toBe(136)
    );
  });
});
