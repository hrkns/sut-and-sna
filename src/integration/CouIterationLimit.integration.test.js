import shouldCompute from "../shared/shouldCompute";
import {
  APP_SECTIONS,
  clickSectionActionButton,
  renderApp,
} from "./utils/testHarness";

jest.mock("../shared/shouldCompute", () => {
  const actual = jest.requireActual("../shared/shouldCompute");
  return {
    __esModule: true,
    default: jest.fn((...args) => actual.default(...args)),
  };
});

const actualShouldCompute = jest.requireActual(
  "../shared/shouldCompute"
).default;

describe("COU iteration guard behavior", () => {
  beforeEach(() => {
    shouldCompute.mockImplementation((...args) => actualShouldCompute(...args));
    shouldCompute.mockClear();
  });

  test("shows COU-specific iteration-limit alert when computation never converges", async () => {
    shouldCompute.mockImplementation(() => true);
    const { user } = renderApp();

    await clickSectionActionButton(APP_SECTIONS.cou, /Calcular/i, user);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/No se pudo calcular el COU/i)
    );
    expect(shouldCompute).toHaveBeenCalled();
  });
});
