## Usage

```ts
import { BadgeStatus } from '$lib/io/badge-status';
```

Set `status` to a workflow status to select its translated label and color.
`text` overrides the label, and numeric `count` values are locale-formatted.

Paused adds an implied pause extension. Set `showImpliedExtensions={false}` to
omit implied extensions. Custom `extensions` follow them. Truncation is enabled
by default; constrain the parent width to see it.
