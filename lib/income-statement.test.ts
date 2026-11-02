import { describe, expect, it } from "vitest";
import { loadLedger } from "@/lib/ledger";
import { buildIncomeStatement } from "@/lib/income-statement";

function sectionTotal(statement: ReturnType<typeof buildIncomeStatement>, id: string): number {
  return statement.sections.find((section) => section.id === id)!.totalCents;
}

describe("buildIncomeStatement", () => {
  it("calculates Q1 2026 with exact cents", () => {
    const statement = buildIncomeStatement(loadLedger(), "2026-01-01", "2026-03-31");

    expect(sectionTotal(statement, "revenue")).toBe(3_785_050);
    expect(sectionTotal(statement, "cogs")).toBe(1_427_275);
    expect(sectionTotal(statement, "operating_expenses")).toBe(6_810_007);
    expect(sectionTotal(statement, "other_income")).toBe(4_218);
    expect(statement.grossProfitCents).toBe(2_357_775);
    expect(statement.operatingIncomeCents).toBe(-4_452_232);
    expect(statement.netIncomeCents).toBe(-4_448_014);
  });

  it("groups posted activity into monthly buckets", () => {
    const statement = buildIncomeStatement(loadLedger(), "2026-01-01", "2026-03-31");
    const revenue = statement.sections.find((section) => section.id === "revenue")!;

    expect(statement.buckets.map((bucket) => bucket.key)).toEqual(["2026-01", "2026-02", "2026-03"]);
    expect(statement.buckets.map((bucket) => bucket.label)).toEqual(["Jan 2026", "Feb 2026", "Mar 2026"]);
    expect(revenue.totalCentsByBucket).toEqual({
      "2026-01": 1_345_075,
      "2026-02": 854_975,
      "2026-03": 1_585_000,
    });
  });

  it("labels partial months with their actual report dates", () => {
    const statement = buildIncomeStatement(loadLedger(), "2026-01-15", "2026-03-10");

    expect(statement.buckets.map((bucket) => bucket.label)).toEqual([
      "Jan 15–31, 2026",
      "Feb 2026",
      "Mar 1–10, 2026",
    ]);
  });

  it("includes both date boundaries and excludes draft and void entries", () => {
    const statement = buildIncomeStatement(loadLedger(), "2026-01-05", "2026-01-31");

    expect(sectionTotal(statement, "revenue")).toBe(1_345_075);
    expect(sectionTotal(statement, "cogs")).toBe(498_030);
    expect(sectionTotal(statement, "operating_expenses")).toBe(2_100_010);
  });

  it("keeps inactive accounts when they have posted activity", () => {
    const statement = buildIncomeStatement(loadLedger(), "2026-01-01", "2026-01-31");
    const operatingExpenses = statement.sections.find((section) => section.id === "operating_expenses")!;

    expect(operatingExpenses.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ accountNumber: "6300", accountName: "Marketing (legacy)", amountCents: 250_010 }),
      ]),
    );
  });

  it("returns zero totals for a valid period with no posted activity", () => {
    const statement = buildIncomeStatement(loadLedger(), "2027-01-01", "2027-01-31");

    expect(statement.sections.every((section) => section.totalCents === 0)).toBe(true);
    expect(statement.grossProfitCents).toBe(0);
    expect(statement.operatingIncomeCents).toBe(0);
    expect(statement.netIncomeCents).toBe(0);
  });
});
