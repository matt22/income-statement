import { expect, test } from "@playwright/test";

test("runs a report for a selected date range", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Income Statement" })).toBeVisible();
  await expect(page.getByText("-$44,480.14")).toBeVisible();

  await page.getByLabel("Start date").fill("2026-01-01");
  await page.getByLabel("End date").fill("2026-01-31");
  await expect(page.getByLabel("Start date")).toHaveValue("2026-01-01");
  await expect(page.getByLabel("End date")).toHaveValue("2026-01-31");
  await page.getByRole("button", { name: "Run report" }).click();

  await expect(page).toHaveURL(/start=2026-01-01&end=2026-01-31/);
  await expect(page.getByRole("heading", { name: "Income Statement" })).toBeVisible();
  await expect(page.getByRole("row", { name: /Net income/ })).toContainText("-$21,529.65");
});
