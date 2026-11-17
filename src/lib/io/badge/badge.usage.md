## Usage

```ts
import { Badge } from '$lib/io/badge';
```

Use `text` for the primary label and `colorScheme` for its semantic meaning.
`extension` adds one segment; `extensions` adds multiple segments. False, null,
and undefined extensions are omitted. Each extension can override its color and truncation.

Use `truncate` inside a constrained container to shorten the primary label.
Badges describe information; use Chip when the label performs an action.
