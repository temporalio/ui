# @forkbombeu/temporal-ui

Host-facing Adapter around [temporalio/ui](https://github.com/temporalio/ui) workflow history. Upstream lives in `upstream/` (submodule); this repo only authors the Adapter.

See [CONTEXT.md](./CONTEXT.md) for vocabulary and [docs/adr/](./docs/adr/) for decisions.

## Install (Host)

Download the Release `.tgz` for version `2.54.1-fb.n` (no registry auth):

```sh
pnpm add ./forkbombeu-temporal-ui-2.54.1-fb.0.tgz
```

## Usage

```svelte
<script>
  import { WorkflowHistory, WorkflowStatus } from '@forkbombeu/temporal-ui';
</script>

<WorkflowStatus status={executionStatus} />

<div class="temporal-ui-host">
  <WorkflowHistory
    {execution}
    {history}
    namespace={orgSlug}
    workers={optionalTaskQueue}
  />
</div>
```

- Pass **raw** Temporal API get-execution body and history events; the Adapter converts.
- CSS is imported by the components (scoped under `.temporal-ui`). Do not copy into `static/`.
- Read-only: Host owns cancel/terminate. Internal Temporal links are disabled via CSS.
- Zero-patch constraint: the Host **page** must still expose SvelteKit params named `namespace`, `workflow`, and `run` (values can match the props). Upstream builds `href`s with `resolve()` during render; missing `namespace` throws even when clicks are disabled.

## Develop

```sh
git submodule update --init --recursive
cd upstream && pnpm install --frozen-lockfile --ignore-scripts && pnpm exec svelte-kit sync && cd ..
node build.mjs   # → package/ + npm pack
```

Requires Node ≥ 22.14 and pnpm ≥ 10.10.
