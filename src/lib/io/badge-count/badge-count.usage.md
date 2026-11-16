## Usage

```ts
import { BadgeCount } from '$lib/io/badge-count';
```

Displays a numeric value, typically representing number of items or sometimes notifications.

| Do                                                                                                                       | Don't                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Place the count next to a label that says what is being counted, such as "Workers 12". A number on its own is ambiguous. | Don't use a count for non-numeric information. Use Badge or Badge Status for words and states.                                     |
| Use `total` when progress against a limit matters, such as "3 / 10" completed or used.                                   | Don't make counts interactive. If clicking the count should filter or navigate, put the action on the surrounding control instead. |
| Show zero when zero is meaningful. An empty queue or no failures is useful information.                                  | Don't use the error color scheme for routine counts. Reserve it for counts that need attention, such as failures.                  |
| Keep values short. Abbreviate large numbers (e.g., 1.2k) when the exact value isn't needed.                              | Don't stack multiple counts on the same item. If an item has several counts, label each one or move them into a summary.           |

Pass `value` as a number or a preformatted string. Set `total` for a fraction-like
count. Zero is displayed for both values.
