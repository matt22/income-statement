import { buildIncomeStatement } from "@/lib/income-statement";
import { loadLedger } from "@/lib/ledger";
import { getValidDateRange } from "@/lib/date-range";

export function GET(request: Request): Response {
  const params = new URL(request.url).searchParams;
  const range = getValidDateRange(params.get("start") ?? undefined, params.get("end") ?? undefined);

  if (!range) {
    return Response.json(
      { error: "Provide a valid inclusive date range using start=YYYY-MM-DD and end=YYYY-MM-DD." },
      { status: 400 },
    );
  }

  return Response.json(buildIncomeStatement(loadLedger(), range.start, range.end));
}
