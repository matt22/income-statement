import ledgerData from "@/data/ledger.json";

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type AccountSubtype =
  | "operating_revenue"
  | "contra_revenue"
  | "cogs"
  | "operating_expense"
  | "other_income"
  | "balance_sheet";
export type JournalEntryStatus = "posted" | "draft" | "void";

export type Account = {
  number: string;
  name: string;
  type: AccountType;
  subtype: AccountSubtype;
  is_active: boolean;
};

export type JournalLine = {
  account: string;
  debit: string;
  credit: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  status: JournalEntryStatus;
  memo: string;
  lines: JournalLine[];
};

export type Ledger = {
  company: string;
  currency: string;
  accounts: Account[];
  journal_entries: JournalEntry[];
};

export function loadLedger(): Ledger {
  return ledgerData as Ledger;
}
