import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";
import { setItem } from "../../shared/db";

/**
 * Canonical section locators used across integration tests.
 *
 * @type {Record<string, RegExp>}
 */
const APP_SECTIONS = {
  cou: /Cuadro de Oferta/i,
  cuPro: /Cuenta de Producci/i,
  cuGeI: /Cuenta de Generaci/i,
  cuADI: /Cuenta de Asignaci/i,
  cui: /Cuenta de Utilizaci/i,
  cuCa: /Cuenta Capital/i,
  cuFi: /Cuenta Financiera/i,
};

/**
 * Renders the app with optional localStorage seed values.
 *
 * @param {{ storage?: Record<string, any> }} [options]
 * @returns {{ user: typeof userEvent } & ReturnType<typeof render>}
 */
const renderApp = ({ storage = {} } = {}) => {
  window.localStorage.clear();
  Object.entries(storage).forEach(([key, value]) => {
    setItem(key, value);
  });

  const user = userEvent;
  const rendered = render(<App />);

  return {
    user,
    ...rendered,
  };
};

/**
 * Gets the accordion header button for a section title.
 *
 * @param {string | RegExp} sectionTitle
 * @returns {HTMLElement}
 */
const getAccordionHeaderButton = (sectionTitle) => {
  return screen.getByRole("button", { name: sectionTitle });
};

/**
 * Gets the enclosing accordion item element for a section title.
 *
 * @param {string | RegExp} sectionTitle
 * @returns {HTMLElement}
 * @throws {Error}
 */
const getAccordionItemByTitle = (sectionTitle) => {
  const button = getAccordionHeaderButton(sectionTitle);
  const item = button.closest(".accordion-item");
  if (!item) {
    throw new Error(`Could not locate accordion item for section: ${sectionTitle}`);
  }
  return item;
};

/**
 * Opens an accordion section if not already expanded.
 *
 * @param {string | RegExp} sectionTitle
 * @param {typeof userEvent} [user]
 * @returns {Promise<HTMLElement>}
 */
const openAccordionSection = async (sectionTitle, user) => {
  const activeUser = user || userEvent;
  const button = getAccordionHeaderButton(sectionTitle);
  if (button.getAttribute("aria-expanded") !== "true") {
    await activeUser.click(button);
  }
  return getAccordionItemByTitle(sectionTitle);
};

/**
 * Gets an action button inside a section by accessible name.
 *
 * @param {string | RegExp} sectionTitle
 * @param {string | RegExp} actionLabel
 * @returns {HTMLElement}
 */
const getSectionActionButton = (sectionTitle, actionLabel) => {
  const section = getAccordionItemByTitle(sectionTitle);
  return within(section).getByRole("button", { name: actionLabel });
};

/**
 * Opens a section and clicks one of its action buttons.
 *
 * @param {string | RegExp} sectionTitle
 * @param {string | RegExp} actionLabel
 * @param {typeof userEvent} [user]
 * @returns {Promise<HTMLElement>}
 */
const clickSectionActionButton = async (sectionTitle, actionLabel, user) => {
  const activeUser = user || userEvent;
  await openAccordionSection(sectionTitle, activeUser);
  const button = getSectionActionButton(sectionTitle, actionLabel);
  await activeUser.click(button);
  return button;
};

/**
 * Returns one table element from a section by index.
 *
 * @param {string | RegExp} sectionTitle
 * @param {number} [tableIndex=0]
 * @returns {HTMLElement}
 * @throws {Error}
 */
const getSectionTable = (sectionTitle, tableIndex = 0) => {
  const section = getAccordionItemByTitle(sectionTitle);
  const tables = within(section).getAllByRole("table");
  if (tableIndex < 0 || tableIndex >= tables.length) {
    throw new Error(
      `Table index ${tableIndex} is out of bounds for section ${sectionTitle}`
    );
  }
  return tables[tableIndex];
};

/**
 * Returns numeric inputs (`spinbutton`) from a section table.
 *
 * @param {string | RegExp} sectionTitle
 * @param {number} [tableIndex=0]
 * @returns {HTMLElement[]}
 */
const getSectionNumericInputs = (sectionTitle, tableIndex = 0) => {
  const table = getSectionTable(sectionTitle, tableIndex);
  return within(table).getAllByRole("spinbutton");
};

/**
 * Sets a numeric input value by its positional index in a section table.
 *
 * @param {string | RegExp} sectionTitle
 * @param {number} inputIndex
 * @param {string | number} value
 * @param {{ tableIndex?: number, user?: typeof userEvent }} [options]
 * @returns {Promise<HTMLElement>}
 * @throws {Error}
 */
const setSectionNumericInputByIndex = async (
  sectionTitle,
  inputIndex,
  value,
  {
    tableIndex = 0,
    user,
  } = {}
) => {
  const activeUser = user || userEvent;
  await openAccordionSection(sectionTitle, activeUser);
  const inputs = getSectionNumericInputs(sectionTitle, tableIndex);
  if (inputIndex < 0 || inputIndex >= inputs.length) {
    throw new Error(
      `Input index ${inputIndex} is out of bounds for section ${sectionTitle}`
    );
  }
  const input = inputs[inputIndex];
  fireEvent.change(input, { target: { value: `${value}` } });
  return input;
};

/**
 * Reads a numeric input value by index from a section table.
 *
 * @param {string | RegExp} sectionTitle
 * @param {number} inputIndex
 * @param {number} [tableIndex=0]
 * @returns {string}
 * @throws {Error}
 */
const getSectionNumericInputValueByIndex = (
  sectionTitle,
  inputIndex,
  tableIndex = 0
) => {
  const inputs = getSectionNumericInputs(sectionTitle, tableIndex);
  if (inputIndex < 0 || inputIndex >= inputs.length) {
    throw new Error(
      `Input index ${inputIndex} is out of bounds for section ${sectionTitle}`
    );
  }
  return inputs[inputIndex].value;
};

export {
  APP_SECTIONS,
  clickSectionActionButton,
  getAccordionHeaderButton,
  getAccordionItemByTitle,
  getSectionActionButton,
  getSectionNumericInputValueByIndex,
  getSectionNumericInputs,
  getSectionTable,
  openAccordionSection,
  renderApp,
  setSectionNumericInputByIndex,
};
