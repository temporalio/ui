## Usage

```ts
import { Chip } from '$lib/io/chip';
```

Use `text` to describe the action and `onclick` to handle it. Choose a semantic
`colorScheme`, and add `extension` for related text or an icon. Native button
attributes, including `disabled` and `aria-pressed`, can be passed through.

Chips default to `type="button"`. For a non-interactive label, use Badge or Tag.
