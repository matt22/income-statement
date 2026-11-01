import { formatCents } from "@/lib/money";

type StatementRowProps = {
  label: string;
  amountCents: number;
  currency: string;
  emphasis?: boolean;
  indent?: boolean;
};

export function StatementRow({ label, amountCents, currency, emphasis = false, indent = false }: StatementRowProps) {
  return (
    <tr className={emphasis ? "border-t border-slate-300 font-semibold" : "border-t border-slate-100"}>
      <th className={`px-5 py-3 text-left ${indent ? "pl-10 font-normal text-slate-600" : ""}`} scope="row">
        {label}
      </th>
      <td className="px-5 py-3 text-right tabular-nums">{formatCents(amountCents, currency)}</td>
    </tr>
  );
}
