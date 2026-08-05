<script lang="ts">
  import { onMount } from 'svelte';

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

  const reviewSections = [
    { id: 'authoring', label: '01 · Plan & authoring' },
    { id: 'capabilities', label: '02 · Feature coverage' },
    { id: 'boundary', label: '03 · Runtime & hosting' },
    { id: 'delivery', label: '04 · Delivery' },
    { id: 'proof', label: '05 · Coverage & scope' },
    { id: 'experience', label: '06 · Interactive preview' },
    { id: 'review', label: '07 · Review asks' },
  ] as const;

  type ReviewSectionId = (typeof reviewSections)[number]['id'];

  const catalogEntries: CatalogEntry[] = [
    {
      id: 'order-lifecycle',
      name: 'Order lifecycle',
      local: false,
      kind: 'Workflow',
      capabilities: ['Ordinary workflow launch'],
      evidence: 'Run, status, result, and existing execution details.',
      details:
        'A straightforward workflow example for the normal launch and observation path.',
      nexus: false,
    },
    {
      id: 'priority-lanes',
      name: 'Priority lanes',
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
      local: false,
      kind: 'Workflow',
      capabilities: ['Child workflow relationships'],
      evidence:
        'The existing workflow UI renders parent and child execution relationships.',
      details:
        'A workflow fixture that starts child executions intentionally and provides an inspectable relationship graph.',
      nexus: false,
    },
    {
      id: 'linked-executions',
      name: 'Linked executions',
      local: false,
      kind: 'Workflow',
      capabilities: ['Links'],
      evidence: 'The existing UI renders emitted links and their destinations.',
      details:
        'A workflow fixture that gives the existing links experience concrete data to inspect.',
      nexus: false,
    },
    {
      id: 'cross-namespace-hello',
      name: 'Cross-namespace hello',
      local: false,
      kind: 'Workflow',
      capabilities: ['Nexus', 'Cross-namespace calls', 'Links'],
      evidence:
        'Endpoint readiness, caller execution, handler result, and links.',
      details: 'A workflow example with optional endpoint prerequisites.',
      nexus: true,
    },
    {
      id: 'standalone-nexus-greeting',
      name: 'Standalone Nexus greeting',
      local: false,
      kind: 'Standalone Nexus operation',
      capabilities: ['Nexus', 'Standalone operation'],
      evidence:
        'Operation result, handler execution, and existing Nexus details.',
      details:
        'A direct Nexus operation example for the third supported execution kind without a caller workflow.',
      nexus: true,
    },
  ];

  const launchExamples: LaunchExample[] = [
    {
      id: 'sample-order-01',
      status: 'Completed',
      summary: 'Workflow result available · open execution details',
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
      'Author and generate',
      'Register an example once, then derive the browser descriptor and Node binding.',
    ],
    [
      '02',
      'Keep local work local',
      'Use the one ignored overlay in the UI checkout while an example is still private.',
    ],
    [
      '03',
      'Verify before packaging',
      'Run the seal command to generate outputs, then verify them; existing package and prepack scripts do not change.',
    ],
    [
      '04',
      'Pack and install',
      'Cloud UI installs the same tgz and uses its browser adapter and Node 22 runner.',
    ],
    [
      '05',
      'Run and inspect',
      'Use the catalog to start an example, then follow the existing details UI.',
    ],
    [
      '06',
      'Promote deliberately',
      'Move reviewed source into shared, then run seal, verify, repack, and update Cloud UI.',
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

  const proposedRegistration = `type ExampleExecution =
  | { kind: 'workflow'; workflowType: string; workflow: Workflow;
      activities: ActivityBindings; defaults: WorkflowDefaults }
  | { kind: 'standalone-activity'; activityType: string;
      activity: ActivityFunction; defaults: ActivityDefaults }
  | { kind: 'standalone-nexus-operation'; service: NexusService;
      operation: NexusOperation; handler: NexusHandler;
      defaults: NexusOperationDefaults };

registerExample({
  catalog: {
    id: 'cross-namespace-hello',
    title: 'Cross-namespace hello',
    capabilities: ['Nexus', 'Links'],
    expectedUiEvidence: ['endpoint readiness', 'linked handler result'],
  },
  targetId: 'catalog',
  execution: {
    kind: 'workflow',
    workflowType: 'CrossNamespaceHello',
    workflow: crossNamespaceHello,
    activities: { greet },
    defaults: { arguments: ['Temporal'], startOptions: { workflowId: 'nexus-hello' } },
  } satisfies ExampleExecution,
  prerequisites: [{ kind: 'nexusEndpoint', createIfMissing: true }],
});`;

  let scope = $state<CatalogScope>('all');
  let selectedId = $state<string | null>(null);
  let configureOpen = $state(false);
  let activeSection = $state<ReviewSectionId>('authoring');
  let navigationTarget = $state<ReviewSectionId | null>(null);
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
      [entry.name, entry.kind, ...entry.capabilities]
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

  function navigateToSection(event: MouseEvent, id: ReviewSectionId) {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    activeSection = id;
    navigationTarget = id;
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
    window.history.pushState(null, '', `#${id}`);
  }

  onMount(() => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        if (navigationTarget) {
          if (visible.some((entry) => entry.target.id === navigationTarget)) {
            activeSection = navigationTarget;
            navigationTarget = null;
          }
          return;
        }
        const id = visible[0]?.target.id as ReviewSectionId | undefined;
        if (id) activeSection = id;
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    );

    for (const { id } of reviewSections) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  });

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
    content="A developer-facing preview of a Temporal UI feature example lab."
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
            Developer tooling · implementation plan
          </p>
          <h1 class="max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Add shared feature examples to Temporal UI.
          </h1>
          <p class="mt-6 max-w-3xl text-lg leading-8 text-secondary">
            Move shared workflow examples into
            <code class="body-small-mono surface-subtle rounded-sm px-1.5 py-1"
              >@temporalio/ui</code
            >
            as a source-controlled place to author examples. Browse ordinary workflows,
            standalone activities, relationships, links, and Nexus scenarios. Run
            them against a real cluster, then inspect the existing UI each fixture
            exercises.
          </p>
          <div class="mt-8 flex flex-wrap gap-2" aria-label="Plan status">
            <Badge type="primary">Feature-based catalog</Badge>
            <Badge type="success">Source-controlled authoring</Badge>
            <Badge type="ghost">Existing scripts unchanged</Badge>
            <Badge type="subtle">Expected UI checks</Badge>
          </div>
        </div>

        <Card class="flex flex-col justify-between gap-8 p-6 lg:p-8">
          <div>
            <Icon name="target" width={28} height={28} class="text-brand" />
            <h2 class="mt-5 text-2xl">What this plan adds</h2>
            <p class="mt-3 leading-7 text-secondary">
              One packaged workbench and one selected cluster. A small, explicit
              set of examples makes existing UI features inspectable and
              repeatable.
            </p>
          </div>
          <Alert intent="info" title="This is a plan preview">
            Browse and disclosure controls are real UI. Execution actions and
            launch states are preview-only; this page never contacts Temporal.
          </Alert>
        </Card>
      </div>
    </section>

    <section class="mx-auto max-w-screen-2xl px-5 py-16 sm:px-8 lg:py-24">
      <div class="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside
          class="lg:sticky lg:top-6 lg:h-fit lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto"
          aria-label="Plan contents"
        >
          <p
            class="body-small-medium mb-3 uppercase tracking-wider text-secondary"
          >
            Review path
          </p>
          <nav
            class="flex flex-col border-l border-subtle text-sm"
            aria-label="Review path"
          >
            {#each reviewSections as section (section.id)}
              <a
                class="-ml-px border-l-2 px-4 py-2.5 transition-colors hover:text-brand {activeSection ===
                section.id
                  ? 'surface-subtle border-inverse font-medium text-primary'
                  : 'border-transparent'}"
                href={`#${section.id}`}
                aria-current={activeSection === section.id ? 'location' : null}
                onclick={(event) => navigateToSection(event, section.id)}
                >{section.label}</a
              >
            {/each}
          </nav>
        </aside>

        <div class="flex min-w-0 flex-col gap-24">
          <section
            id="authoring"
            class="order-1 scroll-mt-8 focus:outline-none"
            tabindex="-1"
          >
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                01 · Source-controlled authoring
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Write an example with the evidence it should produce.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                Add the executable code, its registration, and its expected UI
                evidence together. Local work stays in one ignored overlay until
                review moves the source into the shared catalog.
              </p>
            </div>

            <Card class="p-6 sm:p-8">
              <ol
                class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
                aria-label="Example authoring lifecycle"
              >
                {#each [['1', 'Register once', 'Keep metadata and executable values together in source.'], ['2', 'Generate outputs', 'Run the seal command to generate a browser descriptor and Node binding.'], ['3', 'Run locally', 'Use the opt-in runner and catalog without changing normal commands.'], ['4', 'Inspect the existing UI', 'Follow details into the workflow, activity, relationship, or links view that owns them.'], ['5', 'Promote and repack', 'Move reviewed source into shared, then run seal, verify, and create a new package.']] as step (step[0])}
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
                example source. The browser never imports registrations.
              </Alert>
            </Card>

            <Card class="mt-6 p-6 sm:p-8">
              <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div>
                  <div class="flex flex-wrap gap-2">
                    <Badge type="primary">Example API shape</Badge>
                    <Badge type="subtle">Proposed TypeScript shape</Badge>
                  </div>
                  <h3 class="mt-4 text-xl">
                    Register the example beside its code.
                  </h3>
                  <p class="mt-3 text-sm leading-6 text-secondary">
                    One project-owned call keeps catalog metadata, explicit
                    dispatch identity, executable bindings, defaults, and
                    prerequisites together. The workflow function supplies type
                    information; <code>workflowType</code>, never
                    <code>fn.name</code>, is the worker dispatch identity.
                    Kind-specific schemas and adapters validate JSON and build
                    the native request. This does not settle the final
                    TypeScript API.
                  </p>
                  <p class="mt-3 text-sm leading-6 text-secondary">
                    <code>execution.kind</code> is a closed union. Workflow registrations
                    bind type, function, and activities; standalone activity and Nexus
                    registrations keep their native activity or service, operation,
                    and handler definitions.
                  </p>
                </div>
                <CodeBlock
                  content={proposedRegistration}
                  language="typescript"
                  label="Proposed example registration"
                  minHeight={500}
                  maxHeight={620}
                />
              </div>
              <div
                class="mt-6 grid gap-3 border-t border-subtle pt-6 md:grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1fr)] md:items-center"
                aria-label="Registration outputs"
              >
                <div class="surface-subtle rounded-sm p-4">
                  <p
                    class="body-small-medium uppercase tracking-wider text-secondary"
                  >
                    Author once
                  </p>
                  <p class="mt-2 font-mono text-sm">registerExample(...)</p>
                  <p class="body-small mt-2 text-secondary">
                    Source for one example. <code>workflow-catalog:seal</code>
                    generates the outputs and validates them before anything is packaged
                    or a worker starts.
                  </p>
                </div>
                <Icon
                  name="arrow-right"
                  class="mx-auto rotate-90 text-brand md:rotate-0"
                />
                <div class="grid gap-3 sm:grid-cols-2">
                  <div
                    class="surface-information rounded-sm border border-information p-4"
                  >
                    <p class="text-sm font-medium">
                      Serializable browser catalog
                    </p>
                    <p class="body-small mt-2 text-secondary">
                      Generated metadata and locked execution intent only
                    </p>
                  </div>
                  <div
                    class="surface-subtle rounded-sm border border-subtle p-4"
                  >
                    <p class="text-sm font-medium">Node-only worker bindings</p>
                    <p class="body-small mt-2 text-secondary">
                      Packaged functions, activities, and resolved target
                      binding
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card class="mt-6 p-6 sm:p-8">
              <div
                class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              >
                <div>
                  <p
                    class="body-small-medium uppercase tracking-wider text-secondary"
                  >
                    What targetId means
                  </p>
                  <h3 class="mt-2 text-xl">
                    A worker setup reference, not a category.
                  </h3>
                  <p class="mt-3 text-sm leading-6 text-secondary">
                    <code>targetId</code> points to a project-owned logical worker
                    group. That record owns the selected connection association, namespace,
                    task queue, static workflow entry, worker lifecycle, and availability
                    checks. Several examples can use the same target.
                  </p>
                </div>
                <Alert
                  intent="info"
                  title="Resolved before the browser sees it"
                >
                  The seal command resolves <code>targetId</code> into a Node binding.
                  It is not a Cloud or Temporal resource ID, an individual worker,
                  or a namespace and queue pair. The browser gets locked, serializable
                  intent; it does not resolve targets.
                </Alert>
              </div>
            </Card>

            <Card class="mt-6 p-6 sm:p-8">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="max-w-2xl">
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge type="primary">Planned skills</Badge>
                    <Badge type="subtle">Not built in this change</Badge>
                  </div>
                  <h3 class="mt-4 text-2xl">
                    Give Codex and Claude the same local instructions.
                  </h3>
                  <p class="mt-3 leading-7 text-secondary">
                    <code>temporal-ui-examples</code> will cover UI-side
                    discovery, the local overlay, the seal command, running,
                    inspection, and source promotion. It hands Cloud connection
                    and provisioning work to
                    <code>temporal-cloud-ui-examples</code> in Cloud UI.
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
                aria-label="Planned skill workflow"
              >
                {#each [['Find', 'Locate examples by UI feature or surface.'], ['Add locally', 'Use the fixed local overlay in the UI checkout.'], ['Run', 'Start the selected kind with the UI-owned runner.'], ['Inspect', 'Open the existing UI and confirm the expected result.'], ['Hand off Cloud work', 'Use the Cloud skill for login, provisioning, validation, or manual tcld.']] as step (step[0])}
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

          <section
            id="capabilities"
            class="order-2 scroll-mt-8 focus:outline-none"
            tabindex="-1"
          >
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                02 · Feature coverage
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Cross-namespace Nexus requires an endpoint preflight.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                Its endpoint requirement sits beside workflow, activity,
                relationship, and link examples in the same flat catalog.
              </p>
            </div>

            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <Card class="overflow-hidden p-0">
                <div class="border-b border-subtle px-5 py-4">
                  <h3 class="text-lg">Feature coverage matrix</h3>
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
                          {#if entry.nexus}<Badge type="ghost"
                              >Prerequisites</Badge
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
                  Before Cross-namespace hello launches, the host checks its
                  declared endpoint requirement. It is not continuous health
                  monitoring. A host may provide an authorized provisioner; if
                  it cannot, the catalog blocks only this example and gives the
                  developer exact handoff information.
                </p>
                <div class="space-y-3 text-sm">
                  {#each ['Endpoint matches the declared target and policy', 'Handler worker is polling', 'Caller namespace is authorized', 'Ready to run'] as step (step)}
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
                <Alert
                  intent="info"
                  title="Cloud fallback stays outside the browser"
                >
                  The UI never starts a CLI. If Cloud UI cannot provision, the
                  planned Cloud skill can give a developer the exact manual
                  <code>tcld</code> command and validation steps.
                </Alert>
              </Card>
            </div>
          </section>

          <section
            id="boundary"
            class="order-3 scroll-mt-8 focus:outline-none"
            tabindex="-1"
          >
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                03 · Runtime & hosting
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                One package, two generated outputs, and two host-owned
                entrypoints.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                <code>registerExample</code> is the only authored record. The seal
                command generates a browser descriptor and a packaged Node binding.
                Browser code does not import worker code, and Cloud UI does not appear
                in the shared package.
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
                  <h3 class="text-xl">Generated browser descriptor</h3>
                </div>
                <ul class="mt-5 space-y-3 text-sm text-secondary">
                  <li>
                    Serializable example metadata and locked execution intent
                  </li>
                  <li>
                    Feature tags, kind-specific input defaults, expected
                    evidence, and prerequisite declarations
                  </li>
                </ul>
                <div
                  class="surface-subtle mt-6 rounded-sm p-3 font-mono text-sm"
                >
                  No executable values · no target resolution
                </div>
              </Card>

              <div
                class="flex items-center justify-center py-2"
                aria-label="Generated outputs"
              >
                <div class="flex items-center gap-2 lg:flex-col">
                  <Icon name="arrow-right" class="rotate-90 lg:rotate-0" />
                  <Badge type="primary">seal command</Badge>
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
                  <h3 class="text-xl">Packaged Node binding</h3>
                </div>
                <ul class="mt-5 space-y-3 text-sm text-secondary">
                  <li>
                    Explicit workflow types paired with functions for type
                    information; schemas and adapters validate launch JSON
                  </li>
                  <li>
                    Activities unioned per target; conflicting name/function
                    ownership is rejected
                  </li>
                  <li>
                    Target-level <code>workflowsPath</code> or
                    <code>workflowBundle</code> remains the static SDK workflow mechanism
                  </li>
                  <li>
                    Fully resolved <code>targetId</code>, then complete worker
                    options passed to <code>Worker.create</code>
                  </li>
                </ul>
                <div
                  class="surface-subtle mt-6 rounded-sm p-3 font-mono text-sm"
                >
                  node/target-bindings · executable values stay here
                </div>
              </Card>
            </div>

            <div class="mt-4 grid gap-4 lg:grid-cols-2">
              <Card class="surface-subtle p-5">
                <p
                  class="body-small-medium uppercase tracking-wider text-secondary"
                >
                  Supplied by the host at runtime
                </p>
                <p class="mt-2 text-sm leading-6 text-secondary">
                  The route passes the page a closed <code>WorkbenchHost</code> for
                  start, observation, evidence links, and optional prerequisite checks.
                  It is not part of a descriptor.
                </p>
              </Card>
              <Card class="surface-subtle p-5">
                <p
                  class="body-small-medium uppercase tracking-wider text-secondary"
                >
                  Kept in the browser session
                </p>
                <p class="mt-2 text-sm leading-6 text-secondary">
                  Draft JSON, selected example, Configure state, and recent
                  launches exist only for the current identity and cluster. They
                  are not registration output.
                </p>
              </Card>
            </div>

            <Card class="mt-6 p-6 sm:p-8">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p
                    class="body-small-medium uppercase tracking-wider text-secondary"
                  >
                    Worker setup
                  </p>
                  <h3 class="mt-2 text-2xl">
                    The browser and the runner are separate processes.
                  </h3>
                  <p class="mt-3 max-w-xl text-sm leading-6 text-secondary">
                    The browser uses the host's authorized APIs. The Node runner
                    receives a constructed connection and starts enabled
                    targets. Selecting a catalog item changes only the launch
                    UI, never worker registration.
                  </p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Badge type="ghost">OSS/local entrypoint</Badge>
                  <Badge type="ghost">Cloud Node 22 entrypoint</Badge>
                  <Badge type="ghost">one constructed connection</Badge>
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

            <Card class="mt-6 overflow-hidden p-0">
              <div class="border-b border-subtle px-6 py-5 sm:px-8">
                <p
                  class="body-small-medium uppercase tracking-wider text-secondary"
                >
                  Repository ownership
                </p>
                <h3 class="mt-2 text-2xl">
                  Cloud UI uses the package; it does not change the package.
                </h3>
              </div>
              <div
                class="grid divide-y divide-subtle lg:grid-cols-2 lg:divide-x lg:divide-y-0"
              >
                <div class="p-6 sm:p-8">
                  <div class="flex items-center gap-2">
                    <Badge type="primary">@temporalio/ui</Badge>
                    <span class="text-sm font-medium">Shared and OSS work</span>
                  </div>
                  <ul class="mt-4 space-y-2 text-sm leading-6 text-secondary">
                    <li>
                      Catalog schema, page, session states, and closed host API.
                    </li>
                    <li>
                      Shared registrations, seal and verify commands, browser
                      descriptors, Node bindings, and runner kernel.
                    </li>
                    <li>OSS route and local/self-hosted runner entrypoint.</li>
                    <li>Planned <code>temporal-ui-examples</code> skill.</li>
                  </ul>
                </div>
                <div class="p-6 sm:p-8">
                  <div class="flex items-center gap-2">
                    <Badge type="success">cloud-ui</Badge>
                    <span class="text-sm font-medium">Cloud-only work</span>
                  </div>
                  <ul class="mt-4 space-y-2 text-sm leading-6 text-secondary">
                    <li>
                      Cloud auth, permissions, project and namespace context,
                      and existing telemetry.
                    </li>
                    <li>
                      Cloud browser adapter, namespace-ID lookup, policy checks,
                      and endpoint provisioning.
                    </li>
                    <li>
                      Node 22 dev entrypoint using the installed package and API
                      key or mTLS config.
                    </li>
                    <li>
                      Planned <code>temporal-cloud-ui-examples</code> skill and
                      manual <code>tcld</code> fallback.
                    </li>
                  </ul>
                </div>
              </div>
              <div
                class="surface-subtle border-t border-subtle px-6 py-4 text-sm text-secondary sm:px-8"
              >
                Dependency direction is one way: <code
                  >cloud-ui → @temporalio/ui</code
                >. The shared package never imports Cloud types, clients,
                credentials, or routes.
              </div>
            </Card>
          </section>

          <section
            id="delivery"
            class="order-4 scroll-mt-8 focus:outline-none"
            tabindex="-1"
          >
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                04 · Delivery steps
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Seal, verify, pack, then hand the same package to Cloud UI.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                The ignored local overlay works only in the UI checkout. It
                stops at the package boundary: promotion is reviewed source
                movement followed by the shared seal command, verify, and
                repack.
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

            <Card class="mt-6 p-6 sm:p-8">
              <div
                class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              >
                <div>
                  <p
                    class="body-small-medium uppercase tracking-wider text-secondary"
                  >
                    UI repository handoff
                  </p>
                  <ol class="mt-4 space-y-2 text-sm leading-6 text-secondary">
                    <li>
                      <code>pnpm workflow-catalog:seal</code> generates current outputs.
                    </li>
                    <li>
                      <code>pnpm workflow-catalog:verify</code> checks hashes, joins,
                      and boundaries.
                    </li>
                    <li>
                      <code>pnpm package</code> then
                      <code>pnpm pack --pack-destination packs</code> creates the
                      normal tarball.
                    </li>
                    <li>
                      Rename or copy it to <code
                        >packs/temporalio-ui-&lt;git-sha&gt;.tgz</code
                      >.
                    </li>
                  </ol>
                </div>
                <div>
                  <p
                    class="body-small-medium uppercase tracking-wider text-secondary"
                  >
                    Cloud UI handoff
                  </p>
                  <ol class="mt-4 space-y-2 text-sm leading-6 text-secondary">
                    <li>
                      Update the file reference and lock in a separate Cloud UI
                      worktree.
                    </li>
                    <li>
                      Browser imports the catalog page from the installed
                      package.
                    </li>
                    <li>
                      Cloud's <code>pnpm dev:workflow-catalog</code> starts a Node
                      22 runner from compiled package JavaScript.
                    </li>
                    <li>
                      That runner reads ignored <code
                        >.env.workflow-catalog.local</code
                      >; it never reads the UI checkout.
                    </li>
                  </ol>
                </div>
              </div>
            </Card>
          </section>

          <section
            id="proof"
            class="order-5 scroll-mt-8 focus:outline-none"
            tabindex="-1"
          >
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                05 · Coverage and scope
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Verify each feature with the examples we maintain.
              </h2>
            </div>

            <div class="grid gap-6 xl:grid-cols-2">
              <Card class="p-6">
                <h3 class="text-xl">What each example checks</h3>
                <Timeline class="mt-6">
                  <TimelineStep step={1} title="Example details">
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      Declarations identify kind, feature, target, expected
                      evidence, source, and local-authoring limits.
                    </p>
                  </TimelineStep>
                  <TimelineStep step={2} title="Kind-specific paths">
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      Workflow and standalone-activity starts preserve their own
                      input, identity, observation, and execution-details
                      behavior.
                    </p>
                  </TimelineStep>
                  <TimelineStep step={3} title="Existing UI checks">
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      Priority/fairness, child relationships, links, and regular
                      launch states are inspected in the UI that already owns
                      each surface.
                    </p>
                  </TimelineStep>
                  <TimelineStep
                    step={4}
                    title="Cross-namespace Nexus coverage"
                    last
                  >
                    <p class="mt-2 text-sm leading-6 text-secondary">
                      One cross-namespace flow checks readiness, caller
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
                  <h3 class="text-xl">Out of scope</h3>
                </div>
                <p class="mt-3 text-sm leading-6 text-secondary">
                  These items are not part of this plan. Each one has a reopen
                  condition in the implementation plan.
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

          <section
            id="experience"
            class="order-[6] scroll-mt-8 focus:outline-none"
            tabindex="-1"
          >
            <div class="mb-8 max-w-3xl">
              <p class="body-small-medium uppercase tracking-wider text-brand">
                06 · Interactive UI preview
              </p>
              <h2 class="mt-2 text-3xl sm:text-4xl">
                Find an example for the UI feature you need to inspect.
              </h2>
              <p class="mt-4 text-base leading-7 text-secondary">
                The plan above explains what is registered, packaged, and owned
                by each repository. This preview shows the resulting UI: it
                opens on All examples, with no selected example and Configure
                closed.
              </p>
            </div>

            <Card class="overflow-hidden p-0">
              <div
                class="surface-subtle flex items-center gap-2 border-b border-subtle px-4 py-3 sm:px-6"
              >
                <Icon name="workflow" />
                <h3 class="text-base">Example catalog</h3>
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
                      placeholder="Search examples or features"
                      class="w-full"
                    />
                    <ButtonRadioGroup
                      label="Example source filter"
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
                        <dt class="body-small text-secondary">Feature</dt>
                        <dd class="mt-1">
                          {selectedEntry.capabilities.join(' · ')}
                        </dd>
                      </div>
                      <div class="surface-subtle rounded-sm p-3">
                        <dt class="body-small text-secondary">Namespace</dt>
                        <dd class="mt-1 font-mono">catalog-demo</dd>
                      </div>
                      <div class="surface-subtle rounded-sm p-3">
                        <dt class="body-small text-secondary">Routing</dt>
                        <dd class="mt-1">Locked by the registration</dd>
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
                        example.
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
                                ? 'Priority, fairness, timeouts, and retry policy stay visible in the existing activity flow.'
                                : 'Service, operation, and payload stay visible in the existing Nexus flow.'}
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
                            <Badge type="ghost">Preview only</Badge>
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
                            <Badge type="ghost">Preview only</Badge>
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
                            <Badge type="ghost">Preview only</Badge>
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
                        </button>
                      {:else}
                        <p class="text-sm text-secondary">
                          No examples match the current search and source
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
                      <h3 class="text-lg">Session launch status</h3>
                      <p class="body-small mt-1 text-secondary">
                        One session panel shows launch status for every
                        supported execution kind.
                      </p>
                    </div>
                    <Badge type="subtle">one click → one attempt</Badge>
                  </div>
                  <ul
                    class="divide-y divide-subtle"
                    aria-label="Sample launch states"
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

                <Alert intent="warning" title="Uncertain acceptance">
                  Acceptance uncertainty preserves the generated identity and
                  observation retry retrieves the state of that same attempt.
                </Alert>
              </div>
            {/if}
          </section>

          <section
            id="review"
            class="order-[7] scroll-mt-8 pb-16 focus:outline-none"
            tabindex="-1"
          >
            <Card class="surface-inverse border-inverse p-6 sm:p-10">
              <div class="max-w-3xl">
                <p
                  class="body-small-medium uppercase tracking-wider text-inverse"
                >
                  07 · Your review
                </p>
                <h2 class="mt-3 text-3xl text-inverse sm:text-4xl">
                  Does this cover the examples and execution paths we need?
                </h2>
                <p class="mt-4 text-base leading-7 text-inverse">
                  This plan adds a source-controlled developer workbench inside
                  the package we already ship. It keeps UI examples with the
                  code that runs them.
                </p>
              </div>

              <div class="mt-8 grid gap-4 md:grid-cols-2">
                {#each [['Experience', 'Can a developer start on All examples, understand an example, and configure only its start options?'], ['Authoring', 'Does one registration, then the seal command, make the browser and Node outputs clear?'], ['Ownership', 'Is it clear what stays in @temporalio/ui and what belongs only in Cloud UI?'], ['Handoff', 'Is the local-overlay → review → seal → verify → repack boundary clear, including the Cloud skill and manual tcld fallback?']] as question (question[0])}
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
