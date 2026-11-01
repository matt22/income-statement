type DateRangeFormProps = {
  start: string;
  end: string;
  loading: boolean;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function DateRangeForm({
  start,
  end,
  loading,
  onStartChange,
  onEndChange,
  onSubmit,
  onReset,
}: DateRangeFormProps) {
  return (
    <form className="flex flex-wrap items-end gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Start date
        <input
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal shadow-sm outline-none ring-blue-500 focus:ring-2"
          type="date"
          value={start}
          onChange={(event) => onStartChange(event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        End date
        <input
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal shadow-sm outline-none ring-blue-500 focus:ring-2"
          type="date"
          value={end}
          onChange={(event) => onEndChange(event.target.value)}
          required
        />
      </label>
      <button
        className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Loading…" : "Run report"}
      </button>
      <button
        className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        type="button"
        onClick={onReset}
        disabled={loading}
      >
        Reset Report
      </button>
    </form>
  );
}
