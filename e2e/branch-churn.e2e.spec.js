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

test("branch-count churn keeps COU values normalized after reload", async ({ page }) => {
  await page.goto("/");

  const couSection = await ensureSectionOpen(page, /Cuadro de Oferta/i, 0);
  const couInputs = couSection
    .locator("table")
    .first()
    .locator("input[type='number']");

  await couInputs.nth(0).fill("7");
  await expect(couInputs.nth(0)).toHaveValue("7");

  const branchesInput = page.locator("input[type='number']").first();
  for (const branchCount of ["4", "1", "4", "2"]) {
    await branchesInput.fill(branchCount);
    await expect(branchesInput).toHaveValue(branchCount);
  }

  await page.reload();
  await expect(branchesInput).toHaveValue("2");

  const couSectionAfterReload = await ensureSectionOpen(page, /Cuadro de Oferta/i, 0);
  const couInputsAfterReload = couSectionAfterReload
    .locator("table")
    .first()
    .locator("input[type='number']");

  await expect(couInputsAfterReload.nth(0)).toHaveValue("7");
  await expect(
    couSectionAfterReload.locator("thead th", { hasText: /^Rama 3$/ })
  ).toHaveCount(0);

  await couInputsAfterReload.nth(1).fill("8");
  await expect(couInputsAfterReload.nth(1)).toHaveValue("8");
});
