## Usage

```ts
import { ChipStatus } from '$lib/io/chip-status';
```

Set `status` to choose the built-in label and color. Use `text` to override the
label and `onclick` to apply a filter or another action. Numeric `count` values
are locale-formatted; numeric `extension` values include their sign.

Use Badge Status for a status that only communicates information. Provide
`aria-pressed` when the chip represents a toggleable filter.
