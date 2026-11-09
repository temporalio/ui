## Usage

```ts
import { BadgeCount } from '$lib/io/badge-count';
```

Pass `value` as a number or a preformatted string. Set `total` for a fraction-like
count. Zero is displayed for both values. Use `colorScheme="error"` to draw
attention to an error count, and provide nearby text explaining what is counted.
