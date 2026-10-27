# IO components with Ark UI

Temporal components built with Ark UI and styled with Temporal theme tokens.

Import components from their public entry points:

```svelte
<script lang="ts">
  import { Button, ButtonLink } from '$lib/io-poc/button';
</script>

<Button>Create workflow</Button>
<ButtonLink href="/">Go to overview</ButtonLink>
```

Package consumers use `@temporalio/ui/io-poc/button`.
Run `pnpm docs:dev` for interactive examples and the API reference. See the
[documentation README](../../../docs/README.md) for build commands and
[CONTRIBUTING.md](CONTRIBUTING.md) for implementation conventions. Teams using
the components in an app, and their agents, should read [AGENTS.md](AGENTS.md).
