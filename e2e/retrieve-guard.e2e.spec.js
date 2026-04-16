const { test, expect } = require("@playwright/test");

const ensureSectionOpen = async (page, headerRegex, sectionIndex) => {
  const headerButton = page.locator("button.accordion-button", {
    hasText: headerRegex,
  });
  if ((await headerButton.getAttribute("aria-expanded")) !== "true") {
    await headerButton.click();
  }
  return page.locator(".accordion-item").nth(sectionIndex);
};

test("retrieve guard dialog appears without breaking subsequent interactions", async ({
  page,
}) => {
  const shownDialogs = [];
  page.on("dialog", async (dialog) => {
    shownDialogs.push(dialog.message());
    await dialog.accept();
  });

  await page.goto("/");

  const cuProSection = await ensureSectionOpen(
    page,
    /Cuenta de Producci/i,
    1
  );
  await cuProSection
    .locator("button", { hasText: /Obtener valores desde el COU/i })
    .first()
    .click();

  await expect.poll(() => shownDialogs.length).toBe(1);
  expect(shownDialogs[0]).toMatch(/No hay valores del COU disponibles para recuperar/i);

  const branchesInput = page.locator("input[type='number']").first();
  await branchesInput.fill("4");
  await expect(branchesInput).toHaveValue("4");

  const couSection = await ensureSectionOpen(page, /Cuadro de Oferta/i, 0);
  const couInputs = couSection.locator("table").first().locator("input[type='number']");
  await couInputs.nth(0).fill("9");
  await expect(couInputs.nth(0)).toHaveValue("9");
});
