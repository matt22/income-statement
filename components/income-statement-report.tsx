"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DateRangeForm } from "@/components/date-range-form";
import { IncomeStatementHeader } from "@/components/income-statement-header";
import { IncomeStatementTable } from "@/components/income-statement-table";
import { getValidDateRange, INVALID_DATE_RANGE_MESSAGE } from "@/lib/date-range";
import { NO_POSTED_ACTIVITY_MESSAGE } from "@/lib/income-statement";
import type { IncomeStatement } from "@/lib/income-statement";

type IncomeStatementReportProps = {
  initialStatement: IncomeStatement;
};

export function IncomeStatementReport({ initialStatement }: IncomeStatementReportProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [start, setStart] = useState(initialStatement.start);
  const [end, setEnd] = useState(initialStatement.end);
  const [error, setError] = useState<string | null>(null);

  function runReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!getValidDateRange(start, end)) {
      setError(INVALID_DATE_RANGE_MESSAGE);
      return;
    }

    const params = new URLSearchParams({ start, end });
    startTransition(() => router.replace(`/?${params.toString()}`, { scroll: false }));
  }

  const hasActivity = initialStatement.sections.some((section) => section.lines.some((line) => line.amountCents !== 0));

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <IncomeStatementHeader statement={initialStatement} />

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

      {!hasActivity ? <p className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">{NO_POSTED_ACTIVITY_MESSAGE}</p> : null}

      <IncomeStatementTable statement={initialStatement} />
    </main>
  );
}
