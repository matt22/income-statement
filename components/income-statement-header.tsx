import type { IncomeStatement } from "@/lib/income-statement";

type IncomeStatementHeaderProps = {
  statement: IncomeStatement;
};

export function IncomeStatementHeader({ statement }: IncomeStatementHeaderProps) {
  return (
    <header className="border-b border-slate-300 pb-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">{statement.company}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Income Statement</h1>
      <p className="mt-2 text-slate-600">{statement.start} through {statement.end}</p>
    </header>
  );
}
