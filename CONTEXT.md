# temporal-ui (Forkbomb adapter)

A host-facing package that surfaces a curated slice of Temporal Web UI inside other apps, without forking Temporal’s product behavior.

## Language

**Upstream**:
The unmodified `temporalio/ui` project, pinned by release tag as a git submodule. Never edited in this repo.
_Avoid_: temporal, temporal-ui (ambiguous), original, vanilla

**Adapter**:
Forkbomb-owned code that turns Upstream into a stable host API (components, CSS, packaging). The only code this repo authors.
_Avoid_: wrapper, shim, overlay, fork edits

**Host**:
An application that depends on the published package (today: credimi / DIDimo webapp). Owns routing, data fetching, and mutations.
_Avoid_: consumer (ok informally), app, parent

**Workflow History View**:
The read-only run/history UI the package exposes as its main surface (`WorkflowHistory` and related).
_Avoid_: Temporal UI (whole product), iframe page, workflow run layout

**Pollers**:
Live task-queue poller snapshot Upstream stores as `workflowRun.workers` (DescribeTaskQueue). Host prop name: `workers`. Not `$lib/stores/workers` (refresh counter only).
_Avoid_: workers store, workerCount

**Host Contract**:
The props the Host passes into the Adapter. The Host never writes Upstream stores directly. Raw Temporal API payloads in; Adapter converts.
_Avoid_: store sync, postMessage payload (credimi transport detail)

**Package**:
The published artifact `@forkbombeu/temporal-ui`, consumed from a GitHub Release `.tgz` (no registry auth).
_Avoid_: github dependency, npm Packages, registry auth

**Lean Surface**:
Public exports are only the Host-facing components (and their CSS). Adapter absorbs Upstream wiring, i18n, and model conversion.
_Avoid_: barrel of Upstream modules, deep `dist/` imports, public `toWorkflowExecution`

**Scoped Styles**:
Adapter-compiled Upstream Tailwind (v3 + Temporal theme), rooted under a wrapper (e.g. `.temporal-ui`), imported by the components so the Host does not copy CSS into `static/` or compile Temporal classes with Host Tailwind.
_Avoid_: hand-copied `temporal.css`, unscoped preflight on `html`/`body`, Shadow DOM, compiling through Host TW4/shadcn
