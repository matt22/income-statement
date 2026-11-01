# Notes

## Result

For `2026-01-01` through `2026-03-31`, the statement reports net income of
**-$44,480.14**.

## Decisions and assumptions

- Only `posted` journal entries are included. `draft` and `void` entries are
  excluded.
- The date range is inclusive, and journal-entry dates have no time zone.
- Amounts are parsed from decimal strings into integer cents. The calculation
  does not use floating-point money arithmetic.
- Revenue and other income use their normal credit balance. Expense and COGS
  accounts use their normal debit balance. Contra-revenue is represented by its
  recorded signed activity and therefore reduces revenue when it has a debit
  balance.
- Accounts are shown based on their recorded classification, including inactive
  accounts that have historical posted activity.
- Balance-sheet accounts are present in the ledger but are not included in the
  income statement.

## Verification

The Q1 result was checked with unit tests covering exact section totals,
inclusive boundaries, draft/void exclusion, and historical activity for an
inactive account. The API route also has tests for valid requests and invalid
date ranges. TypeScript compilation and a production build pass.

## AI and next steps

AI assisted with drafting and reviewing the implementation, but the accounting
rules, expected totals, and test cases were checked against the supplied ledger
and the accounting primer. The most important thing to verify rather than trust
from generated code was the sign convention for revenue, contra-revenue, and
expenses.

## Particular Decisions/Notes along the way

Decision to go with an app router setup with Next.js and not the outdated pages format.

Confirmed (outside research) that camel_case testing the numbers is not unusual in TypeScript.
Still would like to discuss if it's not.
<img width="676" height="127" alt="image" src="https://github.com/user-attachments/assets/c6b2e70d-cd37-444f-91b2-83ac5da682b7" />

AI originally wanted routing taken care of with window.history without building proper
URL params.
<img width="772" height="310" alt="image" src="https://github.com/user-attachments/assets/43a08d6b-c780-431f-a968-bbd1da6affbf" />
