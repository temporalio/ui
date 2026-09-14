---
name: proto-codegen
description: Locally regenerate @temporalio/proto TypeScript types from current temporalio/api protos, to unblock UI development against unreleased proto fields. Use when the published @temporalio/proto package lags the protos you're developing against (missing/renamed fields). The generated output is local-only and never committed.
---

# Local @temporalio/proto codegen

The published `@temporalio/proto` package often lags the protos we develop
against. This tool regenerates a drop-in `@temporalio/proto` from current
`temporalio/api` protos so you can build and preview the UI against unreleased
fields **locally**.

**This is a local dev unblock, not a shipped dependency.** The generated output,
the pnpm override that activates it, and the ui-server `go.mod` bump are all
**local-only** — none of them are committed. A feature must not merge to main
relying on an unreleased proto; wait until the fields ship in a released
`@temporalio/proto` (and `go.temporal.io/api` for the ui-server), then delete the
local setup with `--reset`.

Only the tooling is committed: `scripts/generate-temporal-proto.ts`, this skill,
the `.gitignore` entry, and the `protobufjs-cli` devDep. `vendor/temporalio-proto/`
is gitignored.

## Commands

```bash
pnpm generate:proto --help    # full option list

pnpm generate:proto                        # generate from the latest temporalio/api main
pnpm generate:proto --ref v1.63.3          # generate from a specific tag, branch, or commit SHA
pnpm generate:proto --sync-ui-server       # also bump server/go.mod + rebuild the ui-server to match
pnpm generate:proto --sync-ui-server --ui-server-version v1.63.3   # pin the ui-server go module version
pnpm generate:proto --reset                # undo everything: remove override, delete vendor, revert go.mod, reinstall
```

A normal run generates `vendor/temporalio-proto/`, injects the
`@temporalio/proto` override into `package.json` (a **local, uncommitted**
change), and runs `pnpm install`. Do not commit the override or the vendored
output. When you're done previewing, `pnpm generate:proto --reset` returns the
working tree to the clean, main-matching state.

## The two-part bump

Field names/values only line up if **two** things are on the same proto revision,
because gRPC matches by field **number** — a mismatch silently drops values or
renames fields:

1. **UI TypeScript types** — the generated `@temporalio/proto` (this tool).
2. **The ui-server** (`server/go.mod`) — the grpc-gateway that decodes gRPC into
   the JSON the UI receives; its baked-in descriptors decide the wire field names.

`--sync-ui-server` does both: generate the types, then
`go get go.temporal.io/api@<version>` + `make build` in `server/`. Restart
`pnpm dev:local-temporal` afterward. Both changes are local-only; `--reset`
reverts them.

**Version-axis caveat:** the TS types come from a temporalio/api **git ref**,
while the ui-server pins a `go.temporal.io/api` **release tag** — no exact 1:1
mapping, so `--sync-ui-server` defaults to `@latest` (the practical match for
`main`). If a field still looks wrong, confirm the release tag contains the ref
you generated from.

## Consuming the generated types

Import as usual — the local override makes these resolve to the generated
package:

```ts
import type { temporal, google } from '@temporalio/proto';
```

Only `temporal.*` and `google.*` are generated (not `coresdk.*`, unused here).
For enum fields that arrive over REST/JSON as SCREAMING_SNAKE strings, derive a
string union from the proto enum so it can't drift:

```ts
type ActivityExecutionStatus =
  keyof typeof import('@temporalio/proto').temporal.api.enums.v1.ActivityExecutionStatus;
```

Note: while previewing with the override active, these resolve to the unreleased
shape. Committed code must still compile against the **published** package, so
don't reference fields that only exist in the unreleased protos until they ship.
