import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App integration smoke", () => {
  test("renders branches selector and main modules", () => {
    render(<App />);

    expect(screen.getByText(/Cantidad de ramas/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cuadro de Oferta/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cuenta de Producci/i })
    ).toBeInTheDocument();
  });
});
