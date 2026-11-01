import ledgerData from "@/data/ledger.json";
import { parseCents } from "@/lib/money";

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

const ACCOUNT_TYPES: AccountType[] = ["asset", "liability", "equity", "revenue", "expense"];
const ACCOUNT_SUBTYPES: AccountSubtype[] = [
  "operating_revenue",
  "contra_revenue",
  "cogs",
  "operating_expense",
  "other_income",
  "balance_sheet",
];
const JOURNAL_ENTRY_STATUSES: JournalEntryStatus[] = ["posted", "draft", "void"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid ledger: ${field} must be a non-empty string.`);
  }
  return value;
}

function isoDate(value: unknown, field: string): string {
  const date = requiredString(value, field);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || !parsed.toISOString().startsWith(date)) {
    throw new Error(`Invalid ledger: ${field} must be an ISO date.`);
  }
  return date;
}

function enumValue<T extends string>(value: unknown, values: readonly T[], field: string): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    throw new Error(`Invalid ledger: ${field} is not recognized.`);
  }
  return value as T;
}

function validateJournalLine(value: unknown, field: string): JournalLine {
  if (!isRecord(value)) throw new Error(`Invalid ledger: ${field} must be an object.`);

  const line = {
    account: requiredString(value.account, `${field}.account`),
    debit: requiredString(value.debit, `${field}.debit`),
    credit: requiredString(value.credit, `${field}.credit`),
  };

  try {
    parseCents(line.debit);
    parseCents(line.credit);
  } catch {
    throw new Error(`Invalid ledger: ${field} debit and credit must be non-negative decimal amounts.`);
  }

  return line;
}

function validateLedger(input: unknown): Ledger {
  if (!isRecord(input)) throw new Error("Invalid ledger: expected an object.");
  if (!Array.isArray(input.accounts)) throw new Error("Invalid ledger: accounts must be an array.");
  if (!Array.isArray(input.journal_entries)) throw new Error("Invalid ledger: journal_entries must be an array.");

  const accounts = input.accounts.map((value, index): Account => {
    const field = `accounts[${index}]`;
    if (!isRecord(value)) throw new Error(`Invalid ledger: ${field} must be an object.`);
    return {
      number: requiredString(value.number, `${field}.number`),
      name: requiredString(value.name, `${field}.name`),
      type: enumValue(value.type, ACCOUNT_TYPES, `${field}.type`),
      subtype: enumValue(value.subtype, ACCOUNT_SUBTYPES, `${field}.subtype`),
      is_active: value.is_active === true || value.is_active === false
        ? value.is_active
        : (() => { throw new Error(`Invalid ledger: ${field}.is_active must be a boolean.`); })(),
    };
  });

  const accountNumbers = new Set<string>();
  for (const account of accounts) {
    if (accountNumbers.has(account.number)) throw new Error(`Invalid ledger: duplicate account ${account.number}.`);
    accountNumbers.add(account.number);
  }

  const journal_entries = input.journal_entries.map((value, index): JournalEntry => {
    const field = `journal_entries[${index}]`;
    if (!isRecord(value)) throw new Error(`Invalid ledger: ${field} must be an object.`);
    if (!Array.isArray(value.lines) || value.lines.length === 0) {
      throw new Error(`Invalid ledger: ${field}.lines must be a non-empty array.`);
    }

    const lines = value.lines.map((line, lineIndex) => validateJournalLine(line, `${field}.lines[${lineIndex}]`));
    const debitCents = lines.reduce((total, line) => total + parseCents(line.debit), 0);
    const creditCents = lines.reduce((total, line) => total + parseCents(line.credit), 0);
    if (debitCents !== creditCents) throw new Error(`Invalid ledger: ${field} is not balanced.`);

    for (const line of lines) {
      if (!accountNumbers.has(line.account)) throw new Error(`Invalid ledger: ${field} references unknown account ${line.account}.`);
    }

    return {
      id: requiredString(value.id, `${field}.id`),
      date: isoDate(value.date, `${field}.date`),
      status: enumValue(value.status, JOURNAL_ENTRY_STATUSES, `${field}.status`),
      memo: requiredString(value.memo, `${field}.memo`),
      lines,
    };
  });

  return {
    company: requiredString(input.company, "company"),
    currency: requiredString(input.currency, "currency"),
    accounts,
    journal_entries,
  };
}

export function loadLedger(): Ledger {
  return validateLedger(ledgerData);
}

export { validateLedger };
