"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRangeForm } from "@/components/date-range-form";
import { StatementRow } from "@/components/statement-row";
import { getValidDateRange } from "@/lib/date-range";
import type { IncomeStatement } from "@/lib/income-statement";

type IncomeStatementReportProps = {
  initialStatement: IncomeStatement;
};

export function IncomeStatementReport({ initialStatement }: IncomeStatementReportProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [statement, setStatement] = useState(initialStatement);
  const [start, setStart] = useState(searchParams.get("start") ?? initialStatement.start);
  const [end, setEnd] = useState(searchParams.get("end") ?? initialStatement.end);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatement(initialStatement);
    setStart(searchParams.get("start") ?? initialStatement.start);
    setEnd(searchParams.get("end") ?? initialStatement.end);
  }, [initialStatement, searchParams]);

  function runReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!getValidDateRange(start, end)) {
      setError("Choose a valid date range with the start date on or before the end date.");
      return;
    }

    const params = new URLSearchParams({ start, end });
    startTransition(() => router.replace(`/?${params.toString()}`, { scroll: false }));
  }

  const hasActivity = statement.sections.some((section) => section.lines.some((line) => line.amountCents !== 0));

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <header className="border-b border-slate-300 pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">{statement.company}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Income Statement</h1>
        <p className="mt-2 text-slate-600">{statement.start} through {statement.end}</p>
      </header>

      <section aria-labelledby="date-range-heading" className="py-7">
        <h2 id="date-range-heading" className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Report period
        </h2>
        <DateRangeForm
          start={start}
          end={end}
          loading={isPending}
          onStartChange={setStart}
          onEndChange={setEnd}
          onSubmit={runReport}
        />
        {error ? <p className="mt-4 text-sm text-red-700" role="alert">{error}</p> : null}
      </section>

      {!hasActivity ? <p className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">No posted activity for this period.</p> : null}

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
    </main>
  );
}
