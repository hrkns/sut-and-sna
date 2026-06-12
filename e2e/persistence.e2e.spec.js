const { test, expect } = require("@playwright/test");

const ensureCouSectionOpen = async (page) => {
  const couHeaderButton = page.locator("button.accordion-button", {
    hasText: /Cuadro de Oferta/i,
  });
  if ((await couHeaderButton.getAttribute("aria-expanded")) !== "true") {
    await couHeaderButton.click();
  }
  return page.locator(".accordion-item").first();
};

test("COU computed values persist after page reload", async ({ page }) => {
  await page.goto("/");

  const couSection = await ensureCouSectionOpen(page);
  const couInputs = couSection
    .locator("table")
    .first()
    .locator("input[type='number']");

  await couInputs.nth(0).fill("1");
  await couInputs.nth(1).fill("2");
  await couInputs.nth(2).fill("3");
  await couInputs.nth(3).fill("4");

  await couSection
    .locator("button", { hasText: /^Calcular$/i })
    .first()
    .click();
  await expect(couInputs.nth(4)).toHaveValue("10");

  await page.reload();

  const couSectionAfterReload = await ensureCouSectionOpen(page);
  const couInputsAfterReload = couSectionAfterReload
    .locator("table")
    .first()
    .locator("input[type='number']");

  await expect(couInputsAfterReload.nth(4)).toHaveValue("10");
});
