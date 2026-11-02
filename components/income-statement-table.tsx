import { Fragment } from "react";
import { StatementRow } from "@/components/statement-row";
import type { IncomeStatement } from "@/lib/income-statement";

type IncomeStatementTableProps = {
  statement: IncomeStatement;
};

export function IncomeStatementTable({ statement }: IncomeStatementTableProps) {
  const bucketKeys = statement.buckets.map((bucket) => bucket.key);
  const grossProfitByBucket = Object.fromEntries(
    bucketKeys.map((bucketKey) => [
      bucketKey,
      statement.sections.find((section) => section.id === "revenue")!.totalCentsByBucket[bucketKey] -
        statement.sections.find((section) => section.id === "cogs")!.totalCentsByBucket[bucketKey],
    ]),
  );
  const operatingIncomeByBucket = Object.fromEntries(
    bucketKeys.map((bucketKey) => [
      bucketKey,
      grossProfitByBucket[bucketKey] - statement.sections.find((section) => section.id === "operating_expenses")!.totalCentsByBucket[bucketKey],
    ]),
  );
  const netIncomeByBucket = Object.fromEntries(
    bucketKeys.map((bucketKey) => [
      bucketKey,
      operatingIncomeByBucket[bucketKey] + statement.sections.find((section) => section.id === "other_income")!.totalCentsByBucket[bucketKey],
    ]),
  );

  return (
    <section aria-label="Income statement report" className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
      <table className="w-full min-w-[34rem] border-collapse">
        <thead className="bg-slate-50 text-sm text-slate-500">
          <tr>
            <th className="px-5 py-3 text-left font-medium" scope="col">Account</th>
            {statement.buckets.map((bucket) => (
              <th key={bucket.key} className="px-5 py-3 text-right font-medium" scope="col">{bucket.label}</th>
            ))}
            <th className="px-5 py-3 text-right font-medium" scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {statement.sections.map((section) => (
            <Fragment key={section.id}>
              <tr className="bg-slate-50/70">
                <th className="px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-700" colSpan={statement.buckets.length + 2} scope="rowgroup">
                  {section.label}
                </th>
              </tr>
              {section.lines.map((line) => (
                <StatementRow
                  key={line.accountNumber}
                  label={`${line.accountNumber} · ${line.accountName}`}
                  amountCentsByBucket={line.amountCentsByBucket}
                  bucketKeys={bucketKeys}
                  totalCents={line.amountCents}
                  currency={statement.currency}
                  indent
                />
              ))}
              <StatementRow label={`${section.label} total`} amountCentsByBucket={section.totalCentsByBucket} bucketKeys={bucketKeys} totalCents={section.totalCents} currency={statement.currency} emphasis />
            </Fragment>
          ))}
          <StatementRow label="Gross profit" amountCentsByBucket={grossProfitByBucket} bucketKeys={bucketKeys} totalCents={statement.grossProfitCents} currency={statement.currency} emphasis />
          <StatementRow label="Operating income" amountCentsByBucket={operatingIncomeByBucket} bucketKeys={bucketKeys} totalCents={statement.operatingIncomeCents} currency={statement.currency} emphasis />
          <StatementRow label="Net income" amountCentsByBucket={netIncomeByBucket} bucketKeys={bucketKeys} totalCents={statement.netIncomeCents} currency={statement.currency} emphasis />
        </tbody>
      </table>
    </section>
  );
}
