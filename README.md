# Income statement

Small Next.js + TypeScript app that renders an income statement for a selected
inclusive date range from the supplied ledger data.

## Requirements

- Node.js 20+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The default report covers `2026-01-01` through `2026-03-31`. A different range
can be loaded from the URL, for example:

```text
http://localhost:3000/?start=2026-01-01&end=2026-01-31
```

The backend endpoint is:

```text
GET /income-statement?start=YYYY-MM-DD&end=YYYY-MM-DD
```

For example:

```bash
curl 'http://localhost:3000/income-statement?start=2026-01-01&end=2026-03-31'
```

## Verify

```bash
npm run test:unit
npm run typecheck
npm run lint
npm run build
```

The calculation core uses integer cents, includes posted entries whose dates
fall within both boundaries, and excludes draft and void entries.
