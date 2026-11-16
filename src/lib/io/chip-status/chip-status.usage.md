## Usage

```ts
import { ChipStatus } from '$lib/io/chip-status';
```

Chip Status is an interactive compared to Badge Status which is non-interactive. It shows a workflow status, optionally with a count and a change indicator, and responds to clicks — use it when users can filter by that status, such as narrowing a workflow list to only failed runs.

| Do                                                                                                                                     | Don't                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Use Chip Status for status filters, such as a row of chips above a workflow list that each show how many workflows are in that status. | Don't use Chip Status when the status only communicates information. Use Badge Status instead.                 |
| Set `aria-pressed` on chips that toggle a filter on and off, so the selected state is announced.                                       | Don't override `text` with a different word for the same status. Keep labels consistent with Badge Status.     |
| Use the change indicator for a meaningful comparison, such as the change since the last refresh, and make the comparison clear nearby. | Don't show a change indicator without context. A bare "+3" leaves users guessing what it is compared to.       |
| Keep counts current with the filter they apply, so the number matches the results users see after clicking.                            | Don't use Chip Status for states that aren't workflow statuses. Use Chip with a semantic color scheme instead. |

Set `status` to choose the built-in label and color. Use `text` to override the
label and `onclick` to apply a filter or another action. Numeric `count` values
are locale-formatted; numeric `extension` values include their sign.
