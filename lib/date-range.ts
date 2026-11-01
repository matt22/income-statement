export type DateRange = {
  start: string;
  end: string;
};

function isIsoDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function getValidDateRange(start: string | undefined, end: string | undefined): DateRange | null {
  if (!isIsoDate(start) || !isIsoDate(end) || start > end) return null;
  return { start, end };
}
