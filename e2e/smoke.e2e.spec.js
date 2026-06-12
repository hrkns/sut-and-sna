const { test, expect } = require("@playwright/test");

test("home page renders main controls", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.locator("label.form-label", { hasText: /Cantidad de ramas/i })
  ).toBeVisible();
  await expect(
    page.locator("button.accordion-button", { hasText: /Cuadro de Oferta/i })
  ).toBeVisible();
});
