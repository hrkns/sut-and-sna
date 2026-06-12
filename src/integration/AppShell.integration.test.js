import { waitFor } from "@testing-library/react";
import { getItem } from "../shared/db";
import {
  APP_SECTIONS,
  getAccordionHeaderButton,
  getBranchesCountInput,
  renderApp,
  setBranchesCountInputValue,
} from "./utils/testHarness";

describe("App shell contract", () => {
  test("renders all main section headers", () => {
    renderApp();

    Object.values(APP_SECTIONS).forEach((sectionTitle) => {
      expect(getAccordionHeaderButton(sectionTitle)).toBeInTheDocument();
    });
  });

  test("accordion toggles expansion state between sections", async () => {
    const { user } = renderApp();

    const couButton = getAccordionHeaderButton(APP_SECTIONS.cou);
    const cuProButton = getAccordionHeaderButton(APP_SECTIONS.cuPro);

    expect(couButton).toHaveAttribute("aria-expanded", "false");
    expect(cuProButton).toHaveAttribute("aria-expanded", "false");

    await user.click(couButton);
    expect(couButton).toHaveAttribute("aria-expanded", "true");

    await user.click(cuProButton);
    expect(cuProButton).toHaveAttribute("aria-expanded", "true");
    expect(couButton).toHaveAttribute("aria-expanded", "false");
  });

  test("branch count input enforces configured boundaries and persists valid values", async () => {
    renderApp();

    const branchesInput = getBranchesCountInput();
    expect(branchesInput).toHaveAttribute("min", "1");
    expect(branchesInput).toHaveAttribute("max", "4");
    expect(branchesInput.value).toBe("3");

    setBranchesCountInputValue(1);
    await waitFor(() => expect(getBranchesCountInput().value).toBe("1"));
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(1));

    setBranchesCountInputValue(0);
    await waitFor(() => expect(getBranchesCountInput().value).toBe("1"));
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(1));

    setBranchesCountInputValue(4);
    await waitFor(() => expect(getBranchesCountInput().value).toBe("4"));
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(4));
    await waitFor(() =>
      expect(getItem("appValues").branches[3].name).toBe("Rama 4")
    );

    setBranchesCountInputValue(5);
    await waitFor(() => expect(getBranchesCountInput().value).toBe("4"));
    await waitFor(() => expect(getItem("appValues").branches).toHaveLength(4));
  });
});
