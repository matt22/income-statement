import { Suspense } from "react";
import { IncomeStatementReport } from "@/components/income-statement-report";
import { buildIncomeStatement } from "@/lib/income-statement";
import { loadLedger } from "@/lib/ledger";
import { getValidDateRange } from "@/lib/date-range";

type HomePageProps = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const range = getValidDateRange(params.start, params.end) ?? { start: "2026-01-01", end: "2026-03-31" };
  const ledger = loadLedger();
  const statement = buildIncomeStatement(ledger, range.start, range.end);

  return (
    <Suspense fallback={<main className="p-8">Loading report…</main>}>
      <IncomeStatementReport key={`${range.start}:${range.end}`} initialStatement={statement} />
    </Suspense>
  );
}
