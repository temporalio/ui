## Usage

```ts
import { Chip } from '$lib/io/chip';
```

Chips are compact, interactive labels used to filter content, show a selection, or trigger a small action. Unlike Badges and Tags, they respond to clicks — use them when users need to act on the label, such as removing an applied filter.

| Do                                                                                                                      | Don't                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Make the result of clicking obvious. A close icon in the extension, for example, tells users the chip removes a filter. | Don't use a chip for a label that does nothing when clicked. Use Badge or Tag for non-interactive labels. |
| Set `aria-pressed` on chips that toggle a filter on and off, so assistive technology announces the selected state.      | Don't use chips for primary or form actions. Use Button when the action is a main step in the flow.       |
| Keep labels short and specific, such as the filter value rather than a sentence.                                        | Don't rely on color alone to show a chip is selected. Pair it with `aria-pressed` and a visible change.   |
| Group related chips together, such as all applied filters in one row.                                                   | Don't mix chips and badges in the same row in a way that makes it unclear which items are clickable.      |

Use `text` to describe the action and `onclick` to handle it. Choose a semantic
`colorScheme`, and add `extension` for related text or an icon. Native button
attributes, including `disabled` and `aria-pressed`, can be passed through.

Chips default to `type="button"`.
