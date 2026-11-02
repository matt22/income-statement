import { parseCents } from "@/lib/money";
import type { Account, JournalEntry, Ledger } from "@/lib/ledger";

export const SECTION_IDS = ["revenue", "cogs", "operating_expenses", "other_income"] as const;
export const NO_POSTED_ACTIVITY_MESSAGE = "No posted activity for this period.";
export type SectionId = (typeof SECTION_IDS)[number];

export type StatementLine = {
  accountNumber: string;
  accountName: string;
  amountCents: number;
  amountCentsByBucket: Record<string, number>;
};

export type StatementBucket = {
  key: string;
  label: string;
  start: string;
  end: string;
};

export type StatementSection = {
  id: SectionId;
  label: string;
  lines: StatementLine[];
  totalCents: number;
  totalCentsByBucket: Record<string, number>;
};

export type IncomeStatement = {
  company: string;
  currency: string;
  start: string;
  end: string;
  buckets: StatementBucket[];
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

function dateFromIso(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function formatIsoDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatBucketLabel(start: Date, end: Date): string {
  const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const monthStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));

  if (start.getTime() === monthStart.getTime() && end.getTime() === monthEnd.getTime()) {
    return monthYear.format(start);
  }

  return `${monthDay.format(start)}–${end.getUTCDate()}, ${start.getUTCFullYear()}`;
}

function getBucketsForRange(startDate: string, endDate: string): StatementBucket[] {
  const start = dateFromIso(startDate);
  const end = dateFromIso(endDate);
  const firstOfMonth = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

  const buckets: StatementBucket[] = [];
  let current = firstOfMonth(start);
  const lastMonth = firstOfMonth(end);

  while (current <= lastMonth) {
    const key = monthKey(current);
    const monthEndDate = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 0));
    const bucketStart = current.getTime() === firstOfMonth(start).getTime() ? start : current;
    const bucketEnd = key === monthKey(lastMonth) ? end : monthEndDate;

    buckets.push({
      key,
      label: formatBucketLabel(bucketStart, bucketEnd),
      start: formatIsoDate(bucketStart),
      end: formatIsoDate(bucketEnd),
    });

    current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1));
  }

  return buckets;
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
  const buckets = getBucketsForRange(start, end);
  const bucketBalances = new Map<string, Map<string, number>>(
    buckets.map((bucket) => [bucket.key, new Map<string, number>()]),
  );

  for (const entry of ledger.journal_entries) {
    if (!entryIsInRange(entry, start, end)) continue;

    for (const line of entry.lines) {
      const account = accounts.get(line.account);
      if (!account || !sectionFor(account)) continue;
      balances.set(
        account.number,
        (balances.get(account.number) ?? 0) + signedLineAmount(account, line.debit, line.credit),
      );

      const bucket = bucketBalances.get(monthKey(dateFromIso(entry.date)));
      if (bucket) {
        bucket.set(
          account.number,
          (bucket.get(account.number) ?? 0) + signedLineAmount(account, line.debit, line.credit),
        );
      }
    }
  }

  const sections = SECTION_IDS.map((id) => {
    const lines = ledger.accounts
      .filter((account) => sectionFor(account) === id)
      .map((account) => ({
        accountNumber: account.number,
        accountName: account.name,
        amountCents: balances.get(account.number) ?? 0,
        amountCentsByBucket: Object.fromEntries(
          buckets.map((bucket) => [bucket.key, bucketBalances.get(bucket.key)?.get(account.number) ?? 0]),
        ),
      }));

    const totalCentsByBucket = Object.fromEntries(
      buckets.map((bucket) => [
        bucket.key,
        lines.reduce((total, line) => total + line.amountCentsByBucket[bucket.key], 0),
      ]),
    );

    return {
      id,
      label: SECTION_LABELS[id],
      lines,
      totalCents: lines.reduce((total, line) => total + line.amountCents, 0),
      totalCentsByBucket,
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
    buckets,
    sections,
    grossProfitCents,
    operatingIncomeCents,
    netIncomeCents: operatingIncomeCents + otherIncome,
  };
}
