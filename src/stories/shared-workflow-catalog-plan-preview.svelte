<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import ButtonRadioGroup from '$lib/holocene/button-radio-group.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { Timeline, TimelineStep } from '$lib/holocene/timeline';

  type CatalogScope = 'all' | 'shared' | 'local';
  type CatalogEntry = {
    id: string;
    name: string;
    worker: string;
    local: boolean;
    kind: 'Workflow' | 'Standalone activity' | 'Standalone Nexus operation';
    capabilities: string[];
    evidence: string;
    details: string;
    nexus: boolean;
  };

  type LaunchExample = {
    id: string;
    status: string;
    summary: string;
    tone: 'primary' | 'success' | 'warning' | 'danger' | 'subtle';
    icon: IconName;
  };

  const catalogEntries: CatalogEntry[] = [
    {
      id: 'order-lifecycle',
      name: 'Order lifecycle',
      worker: 'catalog',
      local: false,
      kind: 'Workflow',
      capabilities: ['Ordinary workflow launch'],
      evidence: 'Run, status, result, and canonical execution details.',
      details:
        'A straightforward workflow example that proves the normal launch and observation path.',
      nexus: false,
    },
    {
      id: 'priority-lanes',
      name: 'Priority lanes',
      worker: 'catalog',
      local: true,
      kind: 'Standalone activity',
      capabilities: ['Priority', 'Fairness'],
      evidence:
        'Activity details show priority key, fairness key, and fairness weight.',
      details:
        'A local activity fixture that exercises the existing standalone-activity experience.',
      nexus: false,
    },
    {
      id: 'parent-child',
      name: 'Parent and child',
      worker: 'catalog',
      local: false,
      kind: 'Workflow',
      capabilities: ['Child workflow relationships'],
      evidence:
        'Canonical workflow UI renders parent and child execution relationships.',
      details:
        'A workflow fixture with deliberate child executions and an inspectable relationship graph.',
      nexus: false,
    },
    {
      id: 'linked-executions',
      name: 'Linked executions',
      worker: 'catalog',
      local: false,
      kind: 'Workflow',
      capabilities: ['Links'],
      evidence:
        'Canonical UI renders emitted links and their destinations safely.',
      details:
        'A workflow fixture that gives the existing links experience concrete data to inspect.',
      nexus: false,
    },
    {
      id: 'cross-namespace-hello',
      name: 'Cross-namespace hello',
      worker: 'catalog',
      local: false,
      kind: 'Workflow',
      capabilities: ['Nexus', 'Cross-namespace calls', 'Links'],
      evidence:
        'Endpoint readiness, caller execution, handler result, and links.',
      details:
        'An advanced workflow example with optional endpoint prerequisites.',
      nexus: true,
    },
    {
      id: 'standalone-nexus-greeting',
      name: 'Standalone Nexus greeting',
      worker: 'catalog',
      local: false,
      kind: 'Standalone Nexus operation',
      capabilities: ['Nexus', 'Standalone operation'],
      evidence:
        'Operation result, handler execution, and canonical Nexus details.',
      details:
        'A direct Nexus operation example that proves the third supported execution kind without a caller workflow.',
      nexus: true,
    },
  ];

  const launchExamples: LaunchExample[] = [
    {
      id: 'sample-order-01',
      status: 'Completed',
      summary: 'Workflow result available · open canonical details',
      tone: 'success',
      icon: 'circle-check-filled',
    },
    {
      id: 'sample-order-02',
      status: 'Running',
      summary: 'Standalone activity is running in its declared priority lane',
      tone: 'primary',
      icon: 'spinner',
    },
    {
      id: 'sample-order-03',
      status: 'Acceptance unconfirmed',
      summary: 'Identity preserved · never automatically resubmitted',
      tone: 'warning',
      icon: 'warning',
    },
  ];

  const workUnits = [
    [
      '01',
      'Choose feature evidence',
      'Map every example to a capability, execution kind, and expected evidence.',
    ],
    [
      '02',
      'Keep authoring in source',
      'Add a fixture, declaration, and expected evidence in the local overlay.',
    ],
    [
      '03',
      'Run examples locally',
      'Use the opt-in runner and the selected cluster without changing default commands.',
    ],
    [
      '04',
      'Inspect canonical UI',
      'Observe details, priority/fairness, relationships, links, and advanced readiness.',
    ],
    [
      '05',
      'Promote deliberately',
      'Move a local fixture and declaration into the shared example catalog.',
    ],
    [
      '06',
      'Share the workbench',
      'Package the developer-facing surface behind host-controlled visibility.',
    ],
  ] as const;

  const cuts = [
    'Automatic discovery or promotion',
    'A generic execution framework',
    'A separate catalog package or HTTP server',
    'SSE, sidecar, or runner API',
    'Multi-cluster connection management',
    'Background retries or auto-resubmit',
    'Duplicate activity, relationship, or link detail views',
    'Automatic CI execution',
  ];

  const proposedRegistration = `registerExample({
  id: 'cross-namespace-hello',
  title: 'Cross-namespace hello',
  capabilities: ['Nexus', 'Links'],
  expectedUiEvidence: ['endpoint readiness', 'linked handler result'],
  target: { binding: 'catalog', optional: ['nexus-caller', 'nexus-handler'] },
  execution: {
    kind: 'workflow',
    defaults: { arguments: ['Temporal'], startOptions: { workflowId: 'nexus-hello' } },
  },
  prerequisites: [{ kind: 'nexusEndpoint', createIfMissing: true }],
});`;

  let scope = $state<CatalogScope>('all');
  let selectedId = $state<string | null>(null);
  let configureOpen = $state(false);
  let searchTerm = $state('');
  let argumentJson = $state('[\n  "customer-123",\n  { "attempts": 3 }\n]');
  let startOptionsJson = $state(`{
  "workflowId": "order-lifecycle-01",
  "workflowExecutionTimeout": "5m",
  "retry": { "maximumAttempts": 3 },
  "memo": { "source": "example-catalog" },
  "searchAttributes": { "ExampleType": ["order"] }
}`);
  let activityInputJson = $state(`[
  "customer-123",
  { "lane": "premium" }
]`);
  let activityStartOptionsJson = $state(`{
  "activityId": "priority-lanes-01",
  "scheduleToCloseTimeout": "2m",
  "retry": { "maximumAttempts": 3 },
  "priority": { "priorityKey": 10, "fairnessKey": "premium", "fairnessWeight": 2 }
}`);
  let nexusInputJson = $state(`{
  "name": "Temporal"
}`);
  let nexusStartOptionsJson = $state(`{
  "requestId": "nexus-greeting-01",
  "scheduleToCloseTimeout": "30s",
  "headers": { "example-source": "catalog" }
}`);

  function matchesCatalogFilters(entry: CatalogEntry, nextScope = scope) {
    if (nextScope === 'local' && !entry.local) return false;
    if (nextScope === 'shared' && entry.local) return false;

    const query = searchTerm.trim().toLowerCase();
    return (
      !query ||
      [entry.name, entry.kind, ...entry.capabilities, entry.worker]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  function selectScope(nextScope: CatalogScope) {
    const nextEntries = catalogEntries.filter((entry) =>
      matchesCatalogFilters(entry, nextScope),
    );

    scope = nextScope;
    if (selectedId && !nextEntries.some((entry) => entry.id === selectedId)) {
      selectedId = null;
      configureOpen = false;
    }
  }

  function showAllExamples() {
    selectedId = null;
    configureOpen = false;
  }

  function selectExample(id: string) {
    selectedId = id;
    configureOpen = false;
  }

  const visibleEntries = $derived(
    catalogEntries.filter((entry) => matchesCatalogFilters(entry)),
  );

  const selectedEntry = $derived(
    selectedId
      ? catalogEntries.find((entry) => entry.id === selectedId)
      : undefined,
  );
</script>

<svelte:head>
  <title>Shared Workflow Catalog · Example lab preview</title>
  <meta
    name="description"
    content="An immersive, developer-facing preview of a Temporal UI feature example lab."
  />
</svelte:head>

<a
  href="#plan-content"
  class="surface-primary sr-only z-50 rounded-sm border border-interactive px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
>
  Skip to plan
</a>

<div class="surface-background min-h-screen overflow-x-hidden">
  <header class="surface-primary border-b border-subtle">
    <div
      class="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8"
    >
      <div class="flex items-center gap-3">
        <div
          class="surface-inverse flex h-9 w-9 items-center justify-center rounded-sm"
          aria-hidden="true"
        >
          <Icon name="workflow" />
        </div>
        <div>
          <p class="body-small-medium uppercase tracking-wider text-secondary">
            Developer tools
          </p>
          <p class="font-medium">Temporal UI example lab</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Badge type="success">Plan ready</Badge>
        <Badge type="ghost">Temporary review page</Badge>
      </div>
    </div>
  </header>

  <main id="plan-content">
    <section class="border-b border-subtle">
      <div
        class="mx-auto grid max-w-screen-2xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:py-24"
      >
        <div class="max-w-4xl">
          <p
            class="body-small-medium mb-4 uppercase tracking-[0.18em] text-brand"
          >
            Developer tooling · implementation pitch
          </p>
          <h1 class="max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Make Temporal UI features easy to prove.
          </h1>
          <p class="mt-6 max-w-3xl text-lg leading-8 text-secondary">
            Bring the useful shared-workflow corpus into
            <code class="body-small-mono surface-subtle rounded-sm px-1.5 py-1"
              >@temporalio/ui</code
            >
            as a source-controlled workbench for authored examples. Browse ordinary
            workflows, standalone activities, relationships, links, and advanced scenarios;
            run them against a real cluster; then inspect the canonical UI that each
            fixture is meant to prove.
          </p>
          <div class="mt-8 flex flex-wrap gap-2" aria-label="Plan status">
            <Badge type="primary">Capability-oriented catalog</Badge>
            <Badge type="success">Source-controlled authoring</Badge>
            <Badge type="ghost">Existing scripts unchanged</Badge>
            <Badge type="subtle">Curated verification</Badge>
          </div>
        </div>

        <Card class="flex flex-col justify-between gap-8 p-6 lg:p-8">
          <div>
            <Icon name="target" width={28} height={28} class="text-brand" />
            <h2 class="mt-5 text-2xl">The decision in one breath</h2>
            <p class="mt-3 leading-7 text-secondary">
              One packaged workbench. One selected cluster. A small, explicit
              set of examples that makes existing UI capabilities inspectable
              and repeatable.
            </p>
          </div>
          <Alert intent="info" title="This is a plan preview">
            Browse and disclosure controls are real UI. Execution actions and
            launch states are deliberately illustrative; this page never
            contacts Temporal.
          </Alert>
        </Card>
      </div>
    </section>

    <section class="mx-auto max-w-screen-2xl px-5 py-16 sm:px-8 lg:py-24">
      <div class="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside class="lg:sticky lg:top-6 lg:h-fit" aria-label="Plan contents">
          <p
            class="body-small-medium mb-3 uppercase tracking-wider text-secondary"
          >
            Review path
          </p>
          <nav class="flex flex-col border-l border-subtle text-sm">
            <a class="px-4 py-2.5 hover:text-brand" href="#authoring"
              >01 · Plan & authoring</a
            >
            <a class="px-4 py-2.5 hover:text-brand" href="#capabilities"
              >02 · Capability proof</a
            >
            <a class="px-4 py-2.5 hover:text-brand" href="#boundary"
              >03 · Runtime & hosting</a
            >
            <a class="px-4 py-2.5 hover:text-brand" href="#delivery"
              >04 · Delivery</a
            >
            <a class="px-4 py-2.5 hover:text-brand" href="#proof"
              >05 · Proof & cuts</a
            >
            <a class="px-4 py-2.5 hover:text-brand" href="#experience"
              >06 · Interactive preview</a
            >
            <a class="px-4 py-2.5 hover:text-brand" href="#review"
              >07 · Review asks</a
            >
          </nav>
        </aside>

        <div class="flex min-w-0 flex-col gap-24">
          <section id="authoring" class="order-1 scroll-mt-8">
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                01 · Source-controlled authoring
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Write an example with the evidence it should produce.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                A developer authors the fixture, its declaration, and the UI
                evidence it should produce. Local work stays in the ignored
                overlay until it is understandable, runnable, and worth sharing.
              </p>
            </div>

            <Card class="p-6 sm:p-8">
              <ol
                class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
                aria-label="Example authoring lifecycle"
              >
                {#each [['1', 'Write locally', 'Fixture code stays beside an ignored local declaration.'], ['2', 'Declare intent', 'Name the capability, kind, target, and expected UI evidence.'], ['3', 'Run locally', 'Use the opt-in runner and catalog without changing normal commands.'], ['4', 'Inspect canonical UI', 'Follow details into the existing workflow, activity, relationship, or links view.'], ['5', 'Promote deliberately', 'Move the reviewed fixture and declaration into the shared catalog.']] as step (step[0])}
                  <li
                    class="surface-subtle rounded-sm border border-subtle p-4"
                  >
                    <span class="body-small-medium text-brand">{step[0]}</span>
                    <h3 class="mt-2 text-base">{step[1]}</h3>
                    <p class="body-small mt-2 leading-5 text-secondary">
                      {step[2]}
                    </p>
                  </li>
                {/each}
              </ol>
              <Alert
                intent="info"
                title="Source-controlled registry"
                class="mt-6"
              >
                Source control is where developers author, review, and promote
                example fixtures and declarations.
              </Alert>
            </Card>

            <Card class="mt-6 p-6 sm:p-8">
              <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div>
                  <div class="flex flex-wrap gap-2">
                    <Badge type="primary">Illustrative, nonnormative</Badge>
                    <Badge type="subtle">Proposed TypeScript shape</Badge>
                  </div>
                  <h3 class="mt-4 text-xl">Register intent beside code.</h3>
                  <p class="mt-3 text-sm leading-6 text-secondary">
                    This UI-lab declaration names the catalog concepts Temporal
                    does not: discovery metadata, expected UI evidence, target
                    binding, registered execution defaults, and optional
                    prerequisites. It does not settle the final TypeScript API.
                  </p>
                </div>
                <CodeBlock
                  content={proposedRegistration}
                  language="typescript"
                  label="Proposed example registration"
                  minHeight={300}
                  maxHeight={420}
                />
              </div>
            </Card>

            <Card class="mt-6 p-6 sm:p-8">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="max-w-2xl">
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge type="primary">Planned repository Agent Skill</Badge>
                    <Badge type="subtle">Codex + Claude</Badge>
                  </div>
                  <h3 class="mt-4 text-2xl">
                    Discover and prepare examples from the tools developers use.
                  </h3>
                  <p class="mt-3 leading-7 text-secondary">
                    The planned repository Agent Skill will guide an agent to
                    the right example, its execution kind, target, expected UI
                    evidence, and local authoring path.
                  </p>
                </div>
                <Icon
                  name="terminal"
                  width={28}
                  height={28}
                  class="text-brand"
                />
              </div>
              <ol
                class="mt-6 grid gap-3 md:grid-cols-5"
                aria-label="Planned repository Agent Skill workflow"
              >
                {#each [['Find', 'Locate examples by capability or UI surface.'], ['Add locally', 'Create the fixture, declaration, and expected evidence.'], ['Run', 'Start the local example through its native execution flow.'], ['Inspect', 'Open the canonical UI and confirm the expected evidence.'], ['Prepare promotion', 'Package the reviewed change for the shared catalog.']] as step (step[0])}
                  <li
                    class="surface-subtle rounded-sm border border-subtle p-3"
                  >
                    <p class="text-sm font-medium">{step[0]}</p>
                    <p class="body-small mt-2 leading-5 text-secondary">
                      {step[1]}
                    </p>
                  </li>
                {/each}
              </ol>
            </Card>
          </section>

          <section id="capabilities" class="order-2 scroll-mt-8">
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                02 · Capability proof
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Cross-namespace Nexus is an advanced example.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                Its declared endpoint prerequisite sits alongside workflow,
                activity, relationship, and link examples in the same capability
                catalog.
              </p>
            </div>

            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <Card class="overflow-hidden p-0">
                <div class="border-b border-subtle px-5 py-4">
                  <h3 class="text-lg">Capability proof matrix</h3>
                  <p class="body-small mt-1 text-secondary">
                    Each example names the UI feature a developer should inspect
                    after running it.
                  </p>
                </div>
                <div class="divide-y divide-subtle">
                  {#each catalogEntries as entry (entry.id)}
                    <div
                      class="grid gap-3 p-4 sm:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1fr)_auto] sm:items-center sm:px-5"
                    >
                      <div>
                        <p class="font-medium">{entry.name}</p>
                        <div class="mt-1 flex flex-wrap gap-2">
                          <Badge
                            type={entry.kind === 'Workflow'
                              ? 'primary'
                              : 'success'}>{entry.kind}</Badge
                          >
                          {#if entry.local}<Badge type="secondary">Local</Badge
                            >{/if}
                          {#if entry.nexus}<Badge type="ghost">Advanced</Badge
                            >{/if}
                        </div>
                      </div>
                      <p class="text-sm text-secondary">{entry.evidence}</p>
                      <p class="body-small text-secondary">
                        {entry.capabilities.join(' · ')}
                      </p>
                    </div>
                  {/each}
                </div>
              </Card>

              <Card class="flex flex-col gap-5 p-6">
                <div class="flex items-center gap-3">
                  <div
                    class="surface-information flex h-10 w-10 items-center justify-center rounded-sm"
                  >
                    <Icon name="nexus" />
                  </div>
                  <div>
                    <p
                      class="body-small-medium uppercase tracking-wider text-secondary"
                    >
                      Launch-time preflight
                    </p>
                    <h3 class="text-lg">Endpoint readiness</h3>
                  </div>
                </div>
                <p class="text-sm leading-6 text-secondary">
                  Before Cross-namespace hello launches, this one-time preflight
                  verifies its declared dependencies. It is not continuous
                  health monitoring. If the endpoint is absent, the preflight
                  creates it and then evaluates readiness.
                </p>
                <div class="space-y-3 text-sm">
                  {#each ['Endpoint exists and matches its declared target', 'Handler worker is polling', 'Caller namespace is authorized', 'Ready to run'] as step (step)}
                    <div
                      class="surface-subtle flex items-center gap-3 rounded-sm p-3"
                    >
                      <Icon name="circle-check" class="text-success" />
                      <span>{step}</span>
                    </div>
                  {/each}
                </div>
                <Alert intent="warning" title="Configuration conflict">
                  A conflicting endpoint configuration leaves the existing
                  endpoint unchanged and blocks only this example.
                </Alert>
              </Card>
            </div>
          </section>

          <section id="boundary" class="order-3 scroll-mt-8">
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                03 · Runtime & hosting boundary
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Two planes keep examples safe and portable.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                Stable IDs join browser-safe example declarations to executable
                bindings. Fixture code and credentials never enter the browser
                bundle; targets own namespace and task queue exactly once.
              </p>
            </div>

            <div
              class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch"
            >
              <Card class="p-6">
                <div class="flex items-center gap-3">
                  <Icon
                    name="system-window"
                    width={24}
                    height={24}
                    class="text-brand"
                  />
                  <h3 class="text-xl">Browser plane</h3>
                </div>
                <ul class="mt-5 space-y-3 text-sm text-secondary">
                  <li>Serializable descriptors and target records</li>
                  <li>
                    Capability tags, kind-specific input, and expected evidence
                  </li>
                  <li>
                    Authorized start, observation, and endpoint preparation
                  </li>
                  <li>Session-only drafts and recent launches</li>
                </ul>
                <div
                  class="surface-subtle mt-6 rounded-sm p-3 font-mono text-sm"
                >
                  targetId: catalog
                </div>
              </Card>

              <div
                class="flex items-center justify-center py-2"
                aria-label="Stable ID join"
              >
                <div class="flex items-center gap-2 lg:flex-col">
                  <Icon name="arrow-right" class="rotate-90 lg:rotate-0" />
                  <Badge type="primary">validated ID join</Badge>
                  <Icon name="arrow-left" class="rotate-90 lg:rotate-0" />
                </div>
              </div>

              <Card class="p-6">
                <div class="flex items-center gap-3">
                  <Icon
                    name="terminal"
                    width={24}
                    height={24}
                    class="text-brand"
                  />
                  <h3 class="text-xl">Worker plane</h3>
                </div>
                <ul class="mt-5 space-y-3 text-sm text-secondary">
                  <li>
                    Workflow functions, activities, and declared Nexus services
                  </li>
                  <li>Executable bindings and one base catalog entry module</li>
                  <li>
                    Optional caller and handler modules for the cross-namespace
                    Nexus example only
                  </li>
                  <li>Temporal connection credentials and process lifecycle</li>
                  <li>Join validation and secret-safe diagnostics</li>
                </ul>
                <div
                  class="surface-subtle mt-6 rounded-sm p-3 font-mono text-sm"
                >
                  binding.targetId: catalog
                </div>
              </Card>
            </div>

            <Card class="mt-6 p-6 sm:p-8">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p
                    class="body-small-medium uppercase tracking-wider text-secondary"
                  >
                    Runtime topology
                  </p>
                  <h3 class="mt-2 text-2xl">
                    One small runner, sized for the examples we own.
                  </h3>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Badge type="ghost">Unauthenticated</Badge>
                  <Badge type="ghost">API key / Cloud</Badge>
                  <Badge type="ghost">mTLS</Badge>
                </div>
              </div>

              <div
                class="mt-8 grid gap-4 lg:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1fr)] lg:items-center"
              >
                <div
                  class="surface-information rounded-sm border border-information p-5 text-center"
                >
                  <Icon
                    name="workflow"
                    width={28}
                    height={28}
                    class="mx-auto"
                  />
                  <p class="mt-3 font-medium">Catalog UI</p>
                  <p class="body-small mt-1 text-secondary">
                    existing authorized REST
                  </p>
                </div>
                <div>
                  <div class="mb-3 flex items-center gap-3">
                    <div class="h-px flex-1 bg-interactive/30"></div>
                    <Badge type="subtle">selected Temporal cluster</Badge>
                    <div class="h-px flex-1 bg-interactive/30"></div>
                  </div>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div
                      class="surface-subtle rounded-sm border border-subtle p-4 text-center"
                    >
                      <Icon name="workflow" class="mx-auto text-brand" />
                      <p class="mt-3 font-mono text-sm">catalog</p>
                      <p class="body-small mt-1 text-secondary">
                        Base target for every example kind
                      </p>
                    </div>
                    <div
                      class="rounded-sm border border-dashed border-information p-4 text-center"
                    >
                      <Icon name="nexus" class="mx-auto text-brand" />
                      <p class="mt-3 font-mono text-sm">
                        nexus-caller + nexus-handler
                      </p>
                      <p class="body-small mt-1 text-secondary">
                        Optional expansion for Cross-namespace hello only
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section id="delivery" class="order-4 scroll-mt-8">
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                04 · Delivery posture
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                A deliberate path from local fixture to shared proof.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                The pitch stays high level: implementation keeps the package
                boundary small and makes every new example accountable to a UI
                capability.
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              {#each workUnits as workUnit (workUnit[0])}
                <Card class="group flex gap-4 p-5">
                  <div
                    class="surface-inverse flex h-10 w-10 shrink-0 items-center justify-center rounded-sm font-mono text-sm"
                  >
                    {workUnit[0]}
                  </div>
                  <div>
                    <h3 class="text-base">{workUnit[1]}</h3>
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      {workUnit[2]}
                    </p>
                  </div>
                </Card>
              {/each}
            </div>
          </section>

          <section id="proof" class="order-5 scroll-mt-8">
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                05 · Proof strategy
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Demonstrate each capability through curated verification.
              </h2>
            </div>

            <div class="grid gap-6 xl:grid-cols-2">
              <Card class="p-6">
                <h3 class="text-xl">Capability-first proof strategy</h3>
                <Timeline class="mt-6">
                  <TimelineStep step={1} title="Example contracts">
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      Declarations identify kind, capability, target, expected
                      evidence, provenance, and safe authoring boundaries.
                    </p>
                  </TimelineStep>
                  <TimelineStep step={2} title="Kind-specific paths">
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      Workflow and standalone-activity starts preserve their own
                      input, identity, observation, and canonical-details
                      behavior.
                    </p>
                  </TimelineStep>
                  <TimelineStep step={3} title="Canonical UI evidence">
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      Priority/fairness, child relationships, links, and regular
                      launch states are inspected in the UI that already owns
                      each surface.
                    </p>
                  </TimelineStep>
                  <TimelineStep
                    step={4}
                    title="Cross-namespace Nexus proof"
                    last
                  >
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      One cross-namespace flow proves readiness, caller
                      execution, handler result, valid reuse, and conflict
                      rejection.
                    </p>
                  </TimelineStep>
                </Timeline>
              </Card>

              <Card class="p-6">
                <div class="flex items-center gap-3">
                  <Icon
                    name="hyphen"
                    width={24}
                    height={24}
                    class="text-brand"
                  />
                  <h3 class="text-xl">Deliberate cuts</h3>
                </div>
                <p class="mt-3 text-sm leading-6 text-secondary">
                  These scope decisions keep the workbench focused. Every cut
                  has a reopen condition in the implementation plan.
                </p>
                <p
                  class="surface-subtle mt-4 rounded-sm border border-subtle p-4 text-sm leading-6 text-secondary"
                >
                  The workbench ships inside <code>@temporalio/ui</code> and is served
                  by the existing OSS Temporal UI server or Cloud UI host. The opt-in
                  Node runner runs example workers only; it does not serve UI or expose
                  a catalog API.
                </p>
                <ul class="mt-6 grid gap-3 sm:grid-cols-2">
                  {#each cuts as cut (cut)}
                    <li
                      class="surface-subtle flex items-start gap-2 rounded-sm p-3 text-sm"
                    >
                      <Icon
                        name="minus"
                        class="mt-0.5 shrink-0 text-secondary"
                      />
                      <span>{cut}</span>
                    </li>
                  {/each}
                </ul>
              </Card>
            </div>
          </section>

          <section id="experience" class="order-[6] scroll-mt-8">
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                06 · Interactive UI preview
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Find the example that makes a UI feature real.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                The workbench curates examples we explicitly own. It starts with
                the capability a developer needs to see, then reveals the right
                execution surface and canonical evidence.
              </p>
            </div>

            <Card class="overflow-hidden p-0">
              <div
                class="surface-subtle flex items-center gap-2 border-b border-subtle px-4 py-3 sm:px-6"
              >
                <Icon name="workflow" />
                <h3 class="text-base">Capability example catalog</h3>
                <Badge type="subtle">plan preview</Badge>
              </div>

              <div
                class="grid min-h-[38rem] lg:grid-cols-[18rem_minmax(0,1fr)]"
              >
                <div
                  class="border-b border-subtle p-4 lg:border-b-0 lg:border-r"
                >
                  <div
                    role="search"
                    aria-label="Filter example catalog"
                    class="mb-5 space-y-3 border-b border-subtle pb-5"
                  >
                    <Input
                      id="example-search"
                      bind:value={searchTerm}
                      icon="search"
                      label="Search examples"
                      labelHidden
                      type="search"
                      placeholder="Search examples or capabilities"
                      class="w-full"
                    />
                    <ButtonRadioGroup
                      label="Example provenance filter"
                      value={scope}
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'shared', label: 'Shared' },
                        { value: 'local', label: 'Local' },
                      ] as const}
                      onChange={selectScope}
                      class="surface-primary grid w-full grid-cols-3 gap-0 overflow-hidden rounded-sm border border-subtle"
                    >
                      {#snippet item({
                        option,
                        checked,
                        attrs,
                        onSelect,
                        onKeydown,
                      })}
                        <Button
                          size="xs"
                          variant="secondary"
                          active={checked}
                          class="w-full rounded-none border-0 border-r border-subtle px-2 last:border-r-0"
                          onclick={onSelect}
                          onkeydown={onKeydown}
                          {...attrs}>{option.label}</Button
                        >
                      {/snippet}
                    </ButtonRadioGroup>
                  </div>
                  <p
                    class="body-small-medium mb-3 uppercase tracking-wider text-secondary"
                  >
                    Examples
                  </p>
                  {#if visibleEntries.length}
                    <nav aria-label="Examples" class="flex flex-col gap-1">
                      {#each visibleEntries as entry (entry.id)}
                        <Button
                          variant="ghost"
                          size="sm"
                          active={selectedId === entry.id}
                          aria-pressed={selectedId === entry.id}
                          class="w-full justify-between gap-2 px-2 text-left"
                          onclick={() => selectExample(entry.id)}
                        >
                          <span class="min-w-0 truncate">{entry.name}</span>
                          {#if entry.local}<Badge
                              type="secondary"
                              class="shrink-0">Local</Badge
                            >{/if}
                        </Button>
                      {/each}
                    </nav>
                  {:else}
                    <p class="text-sm text-secondary">
                      No entries match this filter.
                    </p>
                  {/if}
                </div>

                <div class="min-w-0 p-4 sm:p-6">
                  {#if selectedEntry}
                    <div
                      class="flex flex-wrap items-start justify-between gap-4"
                    >
                      <div>
                        <div class="flex flex-wrap items-center gap-2">
                          <Button
                            variant="ghost"
                            size="xs"
                            leadingIcon="arrow-left"
                            onclick={showAllExamples}>All examples</Button
                          >
                          <h3 class="text-2xl">{selectedEntry.name}</h3>
                          {#if selectedEntry.local}<Badge type="secondary"
                              >Local</Badge
                            >{/if}
                          <Badge
                            type={selectedEntry.kind === 'Workflow'
                              ? 'primary'
                              : 'success'}>{selectedEntry.kind}</Badge
                          >
                          {#if selectedEntry.nexus}<Badge type="ghost"
                              >Advanced</Badge
                            >{/if}
                        </div>
                        <p
                          class="mt-2 max-w-2xl text-sm leading-6 text-secondary"
                        >
                          {selectedEntry.details}
                        </p>
                      </div>
                      <Badge type="success">Target available</Badge>
                    </div>

                    <dl
                      class="mt-6 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3"
                    >
                      <div class="surface-subtle rounded-sm p-3">
                        <dt class="body-small text-secondary">Capability</dt>
                        <dd class="mt-1">
                          {selectedEntry.capabilities.join(' · ')}
                        </dd>
                      </div>
                      <div class="surface-subtle rounded-sm p-3">
                        <dt class="body-small text-secondary">Namespace</dt>
                        <dd class="mt-1 font-mono">catalog-demo</dd>
                      </div>
                      <div class="surface-subtle rounded-sm p-3">
                        <dt class="body-small text-secondary">
                          Declared target
                        </dt>
                        <dd class="mt-1 font-mono">{selectedEntry.worker}</dd>
                      </div>
                    </dl>

                    {#if selectedEntry.id === 'cross-namespace-hello'}
                      <Alert
                        intent="info"
                        title="Optional Nexus target expansion"
                        class="mt-4"
                      >
                        This example alone adds a caller and handler target to
                        the base <code>catalog</code> target for its cross-namespace
                        proof.
                      </Alert>
                    {/if}

                    <div
                      class="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_17rem]"
                    >
                      <div class="min-w-0">
                        {#if selectedEntry.kind === 'Workflow'}
                          <div
                            class="mb-2 flex flex-wrap items-end justify-between gap-2"
                          >
                            <div>
                              <h4 class="text-base">
                                Workflow launch defaults
                              </h4>
                              <p class="body-small mt-1 text-secondary">
                                Run uses the current Arguments JSON with
                                registered start-option defaults. Configure
                                edits options only.
                              </p>
                            </div>
                            <Badge type="ghost">Locked routing</Badge>
                          </div>
                          <dl class="mb-4 grid gap-3 sm:grid-cols-3">
                            {#each [['Registered workflow type', 'orderLifecycleWorkflow'], ['Namespace', 'catalog-demo'], ['Task queue', 'catalog']] as field (field[0])}
                              <div class="surface-subtle rounded-sm p-3">
                                <dt class="body-small text-secondary">
                                  {field[0]}
                                </dt>
                                <dd class="mt-1 font-mono text-sm">
                                  {field[1]}
                                </dd>
                              </div>
                            {/each}
                          </dl>
                          <div
                            class="mb-2 flex items-center justify-between gap-2"
                          >
                            <h5 class="text-sm font-medium">Arguments JSON</h5>
                            <Badge type="subtle">Positional payload array</Badge
                            >
                          </div>
                          <CodeBlock
                            content={argumentJson}
                            editable
                            label="Edit arguments JSON"
                            minHeight={148}
                            maxHeight={240}
                            onchange={(content) => (argumentJson = content)}
                          />
                        {:else if selectedEntry.kind === 'Standalone activity'}
                          <div
                            class="flex flex-wrap items-end justify-between gap-2"
                          >
                            <div>
                              <h4 class="text-base">
                                Standalone activity start
                              </h4>
                              <p class="body-small mt-1 text-secondary">
                                Run uses the current Input JSON with registered
                                activity-option defaults. Configure edits
                                options only.
                              </p>
                            </div>
                            <Badge type="ghost">Locked routing</Badge>
                          </div>
                          <dl class="mt-3 grid gap-3 sm:grid-cols-2">
                            {#each [['Registered activity type', 'priorityLaneActivity'], ['Namespace', 'catalog-demo'], ['Task queue', 'catalog'], ['Activity ID', 'priority-lanes-01']] as field (field[0])}
                              <div class="surface-subtle rounded-sm p-3">
                                <dt class="body-small text-secondary">
                                  {field[0]}
                                </dt>
                                <dd class="mt-1 font-mono text-sm">
                                  {field[1]}
                                </dd>
                              </div>
                            {/each}
                          </dl>
                          <h5 class="mb-2 mt-4 text-sm font-medium">
                            Input JSON
                          </h5>
                          <CodeBlock
                            content={activityInputJson}
                            editable
                            label="Edit activity input JSON"
                            minHeight={148}
                            maxHeight={240}
                            onchange={(content) =>
                              (activityInputJson = content)}
                          />
                        {:else}
                          <div
                            class="flex flex-wrap items-end justify-between gap-2"
                          >
                            <div>
                              <h4 class="text-base">
                                Standalone Nexus operation start
                              </h4>
                              <p class="body-small mt-1 text-secondary">
                                Run uses the current Input JSON with registered
                                operation-option defaults. Configure edits
                                options only.
                              </p>
                            </div>
                            <Badge type="ghost">Locked routing</Badge>
                          </div>
                          <dl class="mt-3 grid gap-3 sm:grid-cols-2">
                            {#each [['Registered endpoint', 'catalog-greeting'], ['Registered service', 'GreetingService'], ['Registered operation', 'greet'], ['Namespace', 'catalog-demo']] as field (field[0])}
                              <div class="surface-subtle rounded-sm p-3">
                                <dt class="body-small text-secondary">
                                  {field[0]}
                                </dt>
                                <dd class="mt-1 font-mono text-sm">
                                  {field[1]}
                                </dd>
                              </div>
                            {/each}
                          </dl>
                          <h5 class="mb-2 mt-4 text-sm font-medium">
                            Input JSON
                          </h5>
                          <CodeBlock
                            content={nexusInputJson}
                            editable
                            label="Edit operation input JSON"
                            minHeight={148}
                            maxHeight={240}
                            onchange={(content) => (nexusInputJson = content)}
                          />
                        {/if}
                        <div
                          class="mt-3 flex items-start gap-2 text-sm text-secondary"
                        >
                          <Icon
                            name="circle-check"
                            class="mt-0.5 text-success"
                          />
                          <p>
                            {selectedEntry.kind === 'Workflow'
                              ? 'Position 1 is a customer ID. Position 2 uses the suggested retry object.'
                              : selectedEntry.kind === 'Standalone activity'
                                ? 'Priority, fairness, timeouts, and retry policy stay visible in the canonical activity flow.'
                                : 'Service, operation, and payload stay visible in the canonical Nexus flow.'}
                          </p>
                        </div>
                      </div>

                      <Card class="surface-subtle flex flex-col gap-4">
                        <div>
                          <p
                            class="body-small-medium uppercase tracking-wider text-secondary"
                          >
                            Expected evidence
                          </p>
                          <p class="mt-1 text-sm">{selectedEntry.evidence}</p>
                          <p class="body-small mt-2 text-secondary">
                            The catalog links to the existing UI rather than
                            recreating activity details, relationships, links,
                            or signal controls.
                          </p>
                        </div>
                        <div class="border-t border-subtle pt-4">
                          <p
                            class="body-small-medium uppercase tracking-wider text-secondary"
                          >
                            Kind-specific start
                          </p>
                          <p class="body-small mt-2 text-secondary">
                            {selectedEntry.kind === 'Workflow'
                              ? 'Workflow input and allowlisted start options stay scoped to the declared target.'
                              : selectedEntry.kind === 'Standalone activity'
                                ? 'The standalone-activity surface owns activity IDs, timing, priority, and fairness inputs.'
                                : 'The Nexus surface owns service, operation, and request inputs.'}
                          </p>
                        </div>
                      </Card>
                    </div>

                    {#if configureOpen}
                      <Card class="surface-subtle mt-6">
                        {#if selectedEntry.kind === 'Workflow'}
                          <div
                            class="flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <h4 class="text-base">
                                Configure workflow launch
                              </h4>
                              <p class="body-small mt-1 text-secondary">
                                A configured run pairs the current top-level
                                Arguments JSON with these validated workflow
                                start options; routing stays locked.
                              </p>
                            </div>
                            <Badge type="ghost">Illustrative</Badge>
                          </div>
                          <div class="mt-4 max-w-3xl">
                            <h5 class="mb-2 text-sm font-medium">
                              Start options JSON
                            </h5>
                            <CodeBlock
                              content={startOptionsJson}
                              editable
                              label="Edit start options JSON"
                              minHeight={220}
                              maxHeight={320}
                              onchange={(content) =>
                                (startOptionsJson = content)}
                            />
                          </div>
                        {:else if selectedEntry.kind === 'Standalone activity'}
                          <div
                            class="flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <h4 class="text-base">
                                Configure standalone activity
                              </h4>
                              <p class="body-small mt-1 text-secondary">
                                A configured run pairs the current top-level
                                Input JSON with these validated activity start
                                options; routing stays locked.
                              </p>
                            </div>
                            <Badge type="ghost">Illustrative</Badge>
                          </div>
                          <div class="mt-4 max-w-3xl">
                            <h5 class="mb-2 text-sm font-medium">
                              Activity start options JSON
                            </h5>
                            <CodeBlock
                              content={activityStartOptionsJson}
                              editable
                              label="Edit activity start options JSON"
                              minHeight={220}
                              maxHeight={320}
                              onchange={(content) =>
                                (activityStartOptionsJson = content)}
                            />
                          </div>
                        {:else}
                          <div
                            class="flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <h4 class="text-base">
                                Configure standalone Nexus operation
                              </h4>
                              <p class="body-small mt-1 text-secondary">
                                A configured run pairs the current top-level
                                Input JSON with these validated operation start
                                options; routing stays locked.
                              </p>
                            </div>
                            <Badge type="ghost">Illustrative</Badge>
                          </div>
                          <div class="mt-4 max-w-3xl">
                            <h5 class="mb-2 text-sm font-medium">
                              Operation start options JSON
                            </h5>
                            <CodeBlock
                              content={nexusStartOptionsJson}
                              editable
                              label="Edit operation start options JSON"
                              minHeight={220}
                              maxHeight={320}
                              onchange={(content) =>
                                (nexusStartOptionsJson = content)}
                            />
                          </div>
                        {/if}
                      </Card>
                    {/if}

                    <div
                      class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-5"
                    >
                      <Button
                        variant="ghost"
                        trailingIcon={configureOpen
                          ? 'chevron-up'
                          : 'chevron-down'}
                        aria-expanded={configureOpen}
                        onclick={() => (configureOpen = !configureOpen)}
                        >Configure example</Button
                      >
                      <div class="flex items-center gap-3">
                        <span class="body-small text-secondary"
                          >Preview only</span
                        >
                        <Button leadingIcon="play" disabled>Run example</Button>
                      </div>
                    </div>
                  {:else}
                    <div class="max-w-3xl">
                      <p
                        class="body-small-medium uppercase tracking-wider text-brand"
                      >
                        Temporal UI example workbench
                      </p>
                      <h3 class="mt-3 text-3xl">
                        Choose an example to run and inspect.
                      </h3>
                      <p class="mt-4 text-base leading-7 text-secondary">
                        Examples provide ready-to-run data for the UI surfaces
                        developers want to explore: workflow execution,
                        standalone activity priority and fairness,
                        relationships, links, and cross-namespace Nexus.
                      </p>
                    </div>

                    <div
                      class="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                      role="region"
                      aria-label="Available examples"
                    >
                      {#each visibleEntries as entry (entry.id)}
                        <button
                          type="button"
                          class="surface-primary flex min-h-40 flex-col rounded-sm border border-subtle p-4 text-left transition-colors hover:border-interactive hover:bg-interactive/5 focus:outline-none focus:ring-2 focus:ring-primary/70"
                          onclick={() => selectExample(entry.id)}
                        >
                          <div class="flex items-start justify-between gap-3">
                            <h4 class="text-base">{entry.name}</h4>
                            {#if entry.local}<Badge type="secondary"
                                >Local</Badge
                              >{/if}
                          </div>
                          <p class="mt-3 text-sm leading-6 text-secondary">
                            {entry.details}
                          </p>
                          <p class="body-small mt-3 text-secondary">
                            {entry.kind} · {entry.capabilities.join(' · ')}
                          </p>
                          <p
                            class="body-small mt-auto pt-4 font-mono text-secondary"
                          >
                            {entry.worker}
                          </p>
                        </button>
                      {:else}
                        <p class="text-sm text-secondary">
                          No examples match the current search and provenance
                          filters.
                        </p>
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            </Card>

            {#if selectedEntry}
              <div class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <Card class="p-0">
                  <div
                    class="flex flex-wrap items-center justify-between gap-3 border-b border-subtle p-4 sm:px-5"
                  >
                    <div>
                      <h3 class="text-lg">Common session feedback</h3>
                      <p class="body-small mt-1 text-secondary">
                        One shared session panel gives every supported kind
                        truthful, session-scoped launch feedback.
                      </p>
                    </div>
                    <Badge type="subtle">one click → one attempt</Badge>
                  </div>
                  <ul
                    class="divide-y divide-subtle"
                    aria-label="Illustrative launch states"
                  >
                    {#each launchExamples as launch (launch.id)}
                      <li
                        class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                      >
                        <div class="flex min-w-0 items-start gap-3">
                          <Icon
                            name={launch.icon}
                            class="mt-0.5 {launch.status === 'Running'
                              ? 'animate-spin'
                              : ''}"
                          />
                          <div class="min-w-0">
                            <p class="truncate font-mono text-sm">
                              {launch.id}
                            </p>
                            <p class="body-small mt-1 text-secondary">
                              {launch.summary}
                            </p>
                          </div>
                        </div>
                        <div
                          class="flex shrink-0 items-center gap-3 pl-7 sm:pl-0"
                        >
                          <Badge type={launch.tone}>{launch.status}</Badge>
                          <Button
                            variant="ghost"
                            size="xs"
                            trailingIcon="external-link"
                            disabled>Details</Button
                          >
                        </div>
                      </li>
                    {/each}
                  </ul>
                </Card>

                <Alert intent="warning" title="Truthful execution feedback">
                  Acceptance uncertainty preserves the generated identity and
                  observation retry retrieves the state of that same attempt.
                </Alert>
              </div>
            {/if}
          </section>

          <section id="review" class="order-[7] scroll-mt-8 pb-16">
            <Card class="surface-inverse border-inverse p-6 sm:p-10">
              <div class="max-w-3xl">
                <p
                  class="body-small-medium uppercase tracking-wider text-inverse"
                >
                  07 · Your review
                </p>
                <h2 class="mt-3 text-3xl text-inverse sm:text-4xl">
                  Does this make the right UI features easy to prove?
                </h2>
                <p class="mt-4 text-base leading-7 text-inverse">
                  The pitch is a source-controlled developer workbench inside
                  the package we already ship: a confident home for UI
                  capability examples and their native execution flows.
                </p>
              </div>

              <div class="mt-8 grid gap-4 md:grid-cols-2">
                {#each [['Experience', 'Can a developer find an example by the UI capability they need to inspect, then understand its execution kind?'], ['Authoring', 'Does the local fixture → declaration → expected evidence → promotion flow stay clear and source controlled?'], ['Architecture', 'Do kind-specific adapters and one small runner give each native execution flow what it needs?'], ['Scope', 'Does the catalog present workflow, standalone activity, relationship, link, and Nexus examples with the right level of detail?']] as question (question[0])}
                  <div class="rounded-sm border border-inverse p-5">
                    <p class="font-medium text-inverse">{question[0]}</p>
                    <p class="mt-2 text-sm leading-6 text-inverse">
                      {question[1]}
                    </p>
                  </div>
                {/each}
              </div>

              <div
                class="mt-10 flex flex-wrap items-center gap-4 border-t border-inverse pt-6"
              >
                <Link href="#experience" light leadingIcon="arrow-up"
                  >Review the experience again</Link
                >
                <span class="text-inverse">·</span>
                <p class="body-small text-inverse">
                  No commits, issues, navigation, or package scripts are changed
                  by this preview.
                </p>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </section>
  </main>
</div>
