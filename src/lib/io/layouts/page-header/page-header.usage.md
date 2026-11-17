## Usage

```ts
import { PageHeader } from '$lib/io/layouts/page-header';
```

Provide the required `heading` snippet for the page title. Use `headingActions`
for actions next to the title and `actions` for page-level actions. The optional
`leading`, `tags`, `description`, `filters`, and `metadata` snippets let callers
compose the header using other IO components.

The heading is rendered as an `h1`. The layout wraps as space becomes constrained;
keep action labels concise and use snippets for structured content.
