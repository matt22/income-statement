import { describe, expect, it } from "vitest";
import { validateLedger } from "@/lib/ledger";

const validLedger = {
  company: "Example",
  currency: "USD",
  accounts: [
    { number: "1000", name: "Cash", type: "asset", subtype: "balance_sheet", is_active: true },
    { number: "4000", name: "Revenue", type: "revenue", subtype: "operating_revenue", is_active: true },
  ],
  journal_entries: [
    {
      id: "entry-1",
      date: "2026-01-01",
      status: "posted",
      memo: "Sale",
      lines: [
        { account: "1000", debit: "10.00", credit: "0.00" },
        { account: "4000", debit: "0.00", credit: "10.00" },
      ],
    },
  ],
};

describe("validateLedger", () => {
  it("accepts a valid ledger", () => {
    expect(validateLedger(validLedger)).toEqual(validLedger);
  });

  it.each([
    ["an unknown account reference", { journal_entries: [{ ...validLedger.journal_entries[0], lines: [{ account: "9999", debit: "10.00", credit: "0.00" }, { account: "4000", debit: "0.00", credit: "10.00" }] }] }],
    ["an unbalanced journal entry", { journal_entries: [{ ...validLedger.journal_entries[0], lines: [{ account: "1000", debit: "11.00", credit: "0.00" }, { account: "4000", debit: "0.00", credit: "10.00" }] }] }],
    ["an invalid money value", { journal_entries: [{ ...validLedger.journal_entries[0], lines: [{ account: "1000", debit: "ten", credit: "0.00" }, { account: "4000", debit: "0.00", credit: "10.00" }] }] }],
  ])("rejects %s", (_, override) => {
    expect(() => validateLedger({ ...validLedger, ...override })).toThrowError(/Invalid ledger:/);
  });
});
