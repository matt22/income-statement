import { Fragment } from "react";
import { StatementRow } from "@/components/statement-row";
import type { IncomeStatement } from "@/lib/income-statement";

type IncomeStatementTableProps = {
  statement: IncomeStatement;
};

export function IncomeStatementTable({ statement }: IncomeStatementTableProps) {
  return (
    <section aria-label="Income statement report" className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
      <table className="w-full min-w-[34rem] border-collapse">
        <thead className="bg-slate-50 text-sm text-slate-500">
          <tr>
            <th className="px-5 py-3 text-left font-medium" scope="col">Account</th>
            <th className="px-5 py-3 text-right font-medium" scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {statement.sections.map((section) => (
            <Fragment key={section.id}>
              <tr className="bg-slate-50/70">
                <th className="px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-700" colSpan={2} scope="rowgroup">
                  {section.label}
                </th>
              </tr>
              {section.lines.map((line) => (
                <StatementRow
                  key={line.accountNumber}
                  label={`${line.accountNumber} · ${line.accountName}`}
                  amountCents={line.amountCents}
                  currency={statement.currency}
                  indent
                />
              ))}
              <StatementRow label={`${section.label} total`} amountCents={section.totalCents} currency={statement.currency} emphasis />
            </Fragment>
          ))}
          <StatementRow label="Gross profit" amountCents={statement.grossProfitCents} currency={statement.currency} emphasis />
          <StatementRow label="Operating income" amountCents={statement.operatingIncomeCents} currency={statement.currency} emphasis />
          <StatementRow label="Net income" amountCents={statement.netIncomeCents} currency={statement.currency} emphasis />
        </tbody>
      </table>
    </section>
  );
}
