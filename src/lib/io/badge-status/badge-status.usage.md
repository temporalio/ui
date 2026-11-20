## Usage

```ts
import { BadgeStatus } from '$lib/io/badge-status';
```

Communicates the current state/status of an object (e.g., Running, Paused, Complete, Continued as new, Failed, Timed out, Terminated, Cancelled)

| Do                                                                                                              | Don't                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Use the built-in `status` values so every status keeps the same label and color across the product.             | Don't override `text` with a different word for the same status. "Failed" should never appear as "Errored" or "Broken". |
| Add `count` when summarizing many records with the same status, such as "12 Failed" in a workflow list.         | Don't use Badge Status for states that aren't workflow statuses. Use Badge with a semantic color scheme instead.        |
| Show one status per item. An object is in exactly one state at a time.                                          | Don't make status badges clickable. Use Chip Status when users need to filter by status.                                |
| Let long labels truncate in tight layouts, and make sure the full status is still available nearby or on hover. | Don't hide the implied pause extension on Paused unless the surrounding UI already shows the item is paused.            |

Set `status` to a workflow status to select its translated label and color.
`text` overrides the label, and numeric `count` values are locale-formatted.

Paused adds an implied pause extension. Set `showImpliedExtensions={false}` to
omit implied extensions. Custom `extensions` follow them. Truncation is enabled
by default; constrain the parent width to see it.
