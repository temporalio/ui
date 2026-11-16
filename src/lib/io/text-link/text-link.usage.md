## Usage

```ts
import { TextLink } from '$lib/io/text-link';
```

Provide `href` and descriptive child text. Links inherit surrounding typography;
icons scale with the text. Use `LeadingIcon` or `TrailingIcon` to clarify the
link's purpose.

`disabled` removes the destination, prevents click handling, and takes the link
out of the tab order. Native anchor attributes such as `target` and `rel` pass
through. Use ButtonLink when navigation needs button styling.
