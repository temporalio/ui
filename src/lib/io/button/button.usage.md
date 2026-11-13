## Usage

```ts
import { Button, ButtonLink } from '$lib/io/button';
```

Use `Button` for actions and `ButtonLink` for navigation. Both are exported from
the same barrel. Loading feedback is available on Button. Choose `colorScheme` for the action hierarchy and `size` for
the surrounding layout.

Provide an accessible label such as `aria-label` for icon-only buttons. Set
`isLoading` while work is in progress; set `disabled` when the action must be
unavailable. Use `type="submit"` explicitly for form submission.

The `tracking` prop accepts overrides for name, intent, and text, or `false` to
opt out of the default tracking attributes.
