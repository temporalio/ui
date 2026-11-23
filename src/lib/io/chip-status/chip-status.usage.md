## Usage

```ts
import { ChipStatus } from '$lib/io/chip-status';
```

Set `status` to choose the built-in label and color. Use `text` to override the
label and `onclick` to apply a filter or another action. Numeric `count` values
are locale-formatted; numeric `extension` values include their sign.

## Selection

Chip Status is an interactive compared to Badge Status which is non-interactive. It shows a workflow status, optionally with a count and a change indicator, and responds to clicks — use it when users can filter by that status, such as narrowing a workflow list to only failed runs.

| Do                                                                                                                                               | Don't                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **USE-1** Use Chip Status for status filters, such as a row of chips above a workflow list that each show how many workflows are in that status. | **USE-2** Don't use Chip Status when the status only communicates information. Use Badge Status instead.                 |
| **USE-3** Set `aria-pressed` on chips that toggle a filter on and off, so the selected state is announced.                                       | **USE-4** Don't override `text` with a different word for the same status. Keep labels consistent with Badge Status.     |
| **USE-5** Use the change indicator for a meaningful comparison, such as the change since the last refresh, and make the comparison clear nearby. | **USE-6** Don't show a change indicator without context. A bare "+3" leaves users guessing what it is compared to.       |
| **USE-7** Keep counts current with the filter they apply, so the number matches the results users see after clicking.                            | **USE-8** Don't use Chip Status for states that aren't workflow statuses. Use Chip with a semantic color scheme instead. |

## Rules

Checked against every PR that uses this component.

### Input

- **IN-1** A status from an untyped source MUST be validated before it reaches ChipStatus. The lookup in [`statusConfiguration`](./chip-status.svelte) has no fallback; an unsupported status fails when its configuration is read.
- **IN-2** To hide a change indicator, callers MUST pass `undefined` rather than `0`. Numeric zero is a displayed change, not an absence.
- **IN-3** Caller `class` MUST NOT override background, border, or text colors to replace the status color mapping.

### Output

- **OUT-1** A handler that applies a status filter MUST be idempotent. Clicking an already-applied status MUST NOT add a duplicate filter.
- **OUT-2** A status filter applied by the chip MUST be removable either through the chip or elsewhere on the page.

## Notes

How the component behaves. Context for reviewers; not checked.

- **BEH-1** The label combines the count, when present, with `text ?? configuration.text`. Numeric counts use `toLocaleString()`; strings render verbatim. The built-in status labels are hardcoded English.
- **BEH-2** An extension renders when `extension !== undefined`. Numeric changes use `toLocaleString(undefined, { signDisplay: 'always' })`; string changes render verbatim.
- **DIS-1** Colors come from [ChipStatus `statusConfiguration`](./chip-status.svelte), a separate mapping from [BadgeStatus `statusConfiguration`](../badge-status/badge-status.svelte). Both currently assign the same color scheme to corresponding statuses.
- **DIS-2** Layout, focus, disabled styling, and extension overlays come from [the Chip recipes](../chip/recipe.ts).
- **BEH-3** Native attributes, including `data-testid`, reach the button. No test ID or pressed state is assigned internally.
