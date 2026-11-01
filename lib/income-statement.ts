import { parseCents } from "@/lib/money";
import type { Account, JournalEntry, Ledger } from "@/lib/ledger";

export const SECTION_IDS = ["revenue", "cogs", "operating_expenses", "other_income"] as const;
export const NO_POSTED_ACTIVITY_MESSAGE = "No posted activity for this period.";
export type SectionId = (typeof SECTION_IDS)[number];

export type StatementLine = {
  accountNumber: string;
  accountName: string;
  amountCents: number;
};

export type StatementSection = {
  id: SectionId;
  label: string;
  lines: StatementLine[];
  totalCents: number;
};

export type IncomeStatement = {
  company: string;
  currency: string;
  start: string;
  end: string;
  sections: StatementSection[];
  grossProfitCents: number;
  operatingIncomeCents: number;
  netIncomeCents: number;
};

const SECTION_LABELS: Record<SectionId, string> = {
  revenue: "Revenue",
  cogs: "Cost of goods sold",
  operating_expenses: "Operating expenses",
  other_income: "Other income",
};

function entryIsInRange(entry: JournalEntry, start: string, end: string): boolean {
  return entry.status === "posted" && entry.date >= start && entry.date <= end;
}

function signedLineAmount(account: Account, debit: string, credit: string): number {
  const debitCents = parseCents(debit);
  const creditCents = parseCents(credit);
  return account.type === "expense" ? debitCents - creditCents : creditCents - debitCents;
}

function sectionFor(account: Account): SectionId | null {
  if (account.subtype === "operating_revenue" || account.subtype === "contra_revenue") {
    return "revenue";
  }

  if (account.subtype === "cogs") return "cogs";
  if (account.subtype === "operating_expense") return "operating_expenses";
  if (account.subtype === "other_income") return "other_income";
  return null;
}

export function buildIncomeStatement(ledger: Ledger, start: string, end: string): IncomeStatement {
  const accounts = new Map(ledger.accounts.map((account) => [account.number, account]));
  const balances = new Map<string, number>();

  for (const entry of ledger.journal_entries) {
    if (!entryIsInRange(entry, start, end)) continue;

    for (const line of entry.lines) {
      const account = accounts.get(line.account);
      if (!account || !sectionFor(account)) continue;
      balances.set(
        account.number,
        (balances.get(account.number) ?? 0) + signedLineAmount(account, line.debit, line.credit),
      );
    }
  }

  const sections = SECTION_IDS.map((id) => {
    const lines = ledger.accounts
      .filter((account) => sectionFor(account) === id)
      .map((account) => ({
        accountNumber: account.number,
        accountName: account.name,
        amountCents: balances.get(account.number) ?? 0,
      }));

    return {
      id,
      label: SECTION_LABELS[id],
      lines,
      totalCents: lines.reduce((total, line) => total + line.amountCents, 0),
    };
  });

  const revenue = sections.find((section) => section.id === "revenue")!.totalCents;
  const cogs = sections.find((section) => section.id === "cogs")!.totalCents;
  const operatingExpenses = sections.find((section) => section.id === "operating_expenses")!.totalCents;
  const otherIncome = sections.find((section) => section.id === "other_income")!.totalCents;
  const grossProfitCents = revenue - cogs;
  const operatingIncomeCents = grossProfitCents - operatingExpenses;

  return {
    company: ledger.company,
    currency: ledger.currency,
    start,
    end,
    sections,
    grossProfitCents,
    operatingIncomeCents,
    netIncomeCents: operatingIncomeCents + otherIncome,
  };
}
