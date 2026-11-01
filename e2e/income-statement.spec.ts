import { expect, test } from "@playwright/test";
import { INVALID_DATE_RANGE_MESSAGE } from "../lib/date-range";
import { NO_POSTED_ACTIVITY_MESSAGE } from "../lib/income-statement";

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

test("shows an error instead of running an invalid date range", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Start date").fill("2026-04-01");
  await page.getByLabel("End date").fill("2026-03-31");
  await page.getByRole("button", { name: "Run report" }).click();

  await expect(page.locator("p[role='alert']")).toHaveText(INVALID_DATE_RANGE_MESSAGE);
  await expect(page).toHaveURL(/\/$/);
});

test("shows a message when the period has no posted activity", async ({ page }) => {
  await page.goto("/?start=2027-01-01&end=2027-01-31");

  await expect(page.locator("p").filter({ hasText: NO_POSTED_ACTIVITY_MESSAGE })).toHaveText(NO_POSTED_ACTIVITY_MESSAGE);
});

test("resets a custom report period to the default range", async ({ page }) => {
  await page.goto("/?start=2026-01-01&end=2026-01-31");

  await expect(page.getByRole("button", { name: "Reset Report" })).toBeVisible();
  await page.getByRole("button", { name: "Reset Report" }).click();

  await expect(page).toHaveURL(/start=2026-01-01&end=2026-03-31/);
  await expect(page.getByLabel("Start date")).toHaveValue("2026-01-01");
  await expect(page.getByLabel("End date")).toHaveValue("2026-03-31");
  await expect(page.getByRole("row", { name: /Net income/ })).toContainText("-$44,480.14");
});
