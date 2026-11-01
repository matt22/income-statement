# AGENTS.md

## Scope

This is a small Next.js + TypeScript income-statement app. Keep the implementation easy to explain and change by hand.

## Design

- Keep accounting logic pure and framework-independent; route handlers should validate input and delegate.
- Use exact integer cents (or an equivalent exact decimal type), never floating-point money.
- Income statements use posted entries only, inclusive date ranges, and recorded classifications. Exclude drafts and voids; do not re-accrue from memos.
- Preserve historical activity for inactive accounts. Document material assumptions in `NOTES.md`.
- Prefer small, named modules and reusable report primitives over long files or duplicated templates.

## Tests

Test behavior at the narrowest useful level.

- Unit-test the calculation core for accounting edge cases and exact totals.
- Add API/UI end-to-end coverage for date input, request/response wiring, and the rendered report.
- Avoid duplicate tests and snapshots that only restate implementation details.

## React and UI

- Prevent needless renders and unstable effects.
- Keep components focused.
- Do not put explanatory comments inside a TSX render block.
- Use Tailwind utilities for simple layout and styling; do not introduce Badge or layout-wrapper components without real reuse or behavior.

## Web UI

- Use semantic HTML, accessible labels, headings, table structure, and keyboard interaction.
- Keep the report usable on narrow screens; preserve readable numbers and avoid unnecessary horizontal overflow.
- Handle loading, empty, invalid-date, API-error, and no-data states explicitly.
- Keep date-range state predictable; validate dates at the boundary and preserve the selected range in the URL when useful.
- Centralize formatting for currency, negative numbers, dates, and display labels.
- Prefer stable keys and derived values over duplicated React state.
- Avoid unnecessary client components; keep data loading and static rendering server-side when possible.

## Git

- Make focused commits as work becomes coherent.
- Avoid both giant commits and artificial one-line commits.
- Keep the README runnable.
- Update `NOTES.md` when decisions or verification results change.
