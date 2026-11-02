import { formatCents } from "@/lib/money";

type StatementRowProps = {
  label: string;
  amountCentsByBucket: Record<string, number>;
  bucketKeys: string[];
  totalCents: number;
  currency: string;
  emphasis?: boolean;
  indent?: boolean;
};

export function StatementRow({ label, amountCentsByBucket, bucketKeys, totalCents, currency, emphasis = false, indent = false }: StatementRowProps) {
  return (
    <tr className={emphasis ? "border-t border-slate-300 font-semibold" : "border-t border-slate-100"}>
      <th className={`px-5 py-3 text-left ${indent ? "pl-10 font-normal text-slate-600" : ""}`} scope="row">
        {label}
      </th>
      {bucketKeys.map((bucketKey) => (
        <td key={bucketKey} className="px-5 py-3 text-right tabular-nums">
          {formatCents(amountCentsByBucket[bucketKey] ?? 0, currency)}
        </td>
      ))}
      <td className="px-5 py-3 text-right tabular-nums">{formatCents(totalCents, currency)}</td>
    </tr>
  );
}
