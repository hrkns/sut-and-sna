import { screen } from "@testing-library/react";
import { APP_SECTIONS, getAccordionHeaderButton, renderApp } from "./utils/testHarness";

describe("App integration smoke", () => {
  test("renders branches selector and main modules", () => {
    renderApp();

    expect(screen.getByText(/Cantidad de ramas/i)).toBeInTheDocument();
    Object.values(APP_SECTIONS).forEach((sectionTitle) => {
      expect(getAccordionHeaderButton(sectionTitle)).toBeInTheDocument();
    });
  });
});
