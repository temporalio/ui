<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import SimpleSelect from '$lib/holocene/select/simple-select.svelte';

  import {
    getMockPageTokens,
    getMockWorkflows,
    LOAD_CAP,
    PAGE_DELAY_MS,
    PAGE_SIZE,
    type SandboxWorkflow,
    TOTAL_MATCHING,
    WORKFLOW_TYPES,
  } from './mock-workflows';
  import { describeQuery, filterByQuery, parseQuery } from './query-filter';
  import {
    comparatorFor,
    describeSort,
    MAX_SORT_TERMS,
    nextSort,
    type SortKey,
    type SortTerm,
  } from './sorting';

  import SnapshotGrid from './snapshot-grid.svelte';

  interface Props {
    open: boolean;
    query?: string;
  }

  let { open = $bindable(), query = '' }: Props = $props();

  type Stage = 'prepare' | 'loading' | 'snapshot';
  type LoadedPage = { page: number; token: string; lastRow: string };

  const FACET_STATUSES = ['Running', 'Completed', 'Failed', 'TimedOut'];
  const STALE_AFTER_SECONDS = 120;

  let stage = $state<Stage>('prepare');
  let confirmOpen = $state(false);

  let loadedPages = $state<LoadedPage[]>([]);
  let pagesFetched = $state(0);
  let elapsedMs = $state(0);

  let loadedRows = $state<SandboxWorkflow[]>([]);
  let capturedAt = $state(0);
  let nowTick = $state(Date.now());

  let textFilter = $state('');
  let typeFilter = $state('');
  const activeStatuses = new SvelteSet<string>();
  let sortTerms = $state<SortTerm[]>([{ key: 'startTime', direction: 'desc' }]);

  let pageTimer: ReturnType<typeof setInterval> | undefined;
  let elapsedTimer: ReturnType<typeof setInterval> | undefined;
  let ageTimer: ReturnType<typeof setInterval> | undefined;

  // The sandbox loads the query the user is already looking at. Filtering
  // first is the cheapest way to make the snapshot smaller, so the prepare
  // stage is built to make that obvious.
  const scopedRows = $derived(filterByQuery(getMockWorkflows(), query));
  const matchingCount = $derived(
    query.trim() ? scopedRows.length : TOTAL_MATCHING,
  );
  const willLoad = $derived(Math.min(LOAD_CAP, matchingCount));
  const capped = $derived(matchingCount > LOAD_CAP);
  const notLoaded = $derived(Math.max(0, matchingCount - LOAD_CAP));
  const pageCount = $derived(Math.max(1, Math.ceil(willLoad / PAGE_SIZE)));
  const estimatedSeconds = $derived(
    Math.max(1, Math.round((pageCount * PAGE_DELAY_MS) / 1000)),
  );
  const unsupportedTerms = $derived(parseQuery(query).unsupportedTerms);
  const queryLabel = $derived(query.trim() || 'No filters applied');

  // What the snapshot actually holds, captured at load time. The live list can
  // be re-filtered behind the drawer, and when it is, the snapshot is stale
  // against it — that has to be visible, not inferred.
  let capturedQuery = $state('');
  const queryDrifted = $derived(
    stage === 'snapshot' && capturedQuery !== query,
  );

  const pad = (value: number) => String(value).padStart(2, '0');

  const formatTime = (value: number | null) => {
    if (value === null) return '—';
    const date = new Date(value);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const view = $derived.by(() => {
    const needle = textFilter.trim().toLowerCase();
    const rows = loadedRows.filter((workflow) => {
      if (activeStatuses.size && !activeStatuses.has(workflow.status)) {
        return false;
      }
      if (typeFilter && workflow.type !== typeFilter) return false;
      if (!needle) return true;
      return (
        workflow.workflowId.includes(needle) ||
        workflow.runId.includes(needle) ||
        workflow.type.toLowerCase().includes(needle) ||
        workflow.taskQueue.includes(needle)
      );
    });

    const started = performance.now();
    rows.sort(comparatorFor(sortTerms));
    return { rows, durationMs: performance.now() - started };
  });

  const ageSeconds = $derived(
    capturedAt ? Math.max(0, Math.round((nowTick - capturedAt) / 1000)) : 0,
  );

  const ageLabel = $derived(
    ageSeconds < 60
      ? `${ageSeconds}s ago`
      : `${Math.floor(ageSeconds / 60)}m ${ageSeconds % 60}s ago`,
  );

  const clearTimers = () => {
    clearInterval(pageTimer);
    clearInterval(elapsedTimer);
    clearInterval(ageTimer);
    pageTimer = elapsedTimer = ageTimer = undefined;
  };

  const resetToPrepare = () => {
    clearTimers();
    stage = 'prepare';
    loadedPages = [];
    pagesFetched = 0;
    elapsedMs = 0;
  };

  const startLoading = () => {
    const workflows = scopedRows;
    const tokens = getMockPageTokens();
    capturedQuery = query;

    stage = 'loading';
    loadedPages = [];
    pagesFetched = 0;
    elapsedMs = 0;

    const startedAt = performance.now();
    elapsedTimer = setInterval(() => {
      elapsedMs = performance.now() - startedAt;
    }, 100);

    pageTimer = setInterval(() => {
      pagesFetched += 1;
      const lastRow =
        workflows[Math.min(pagesFetched * PAGE_SIZE, workflows.length) - 1];
      loadedPages = [
        {
          page: pagesFetched,
          token: tokens[pagesFetched - 1],
          lastRow: `${lastRow.workflowId} · ${formatTime(lastRow.startTime)}`,
        },
        ...loadedPages,
      ].slice(0, 14);

      if (pagesFetched >= pageCount) capture(workflows);
    }, PAGE_DELAY_MS);
  };

  const capture = (workflows: SandboxWorkflow[]) => {
    clearTimers();
    loadedRows = workflows.slice(0, LOAD_CAP);
    capturedAt = Date.now();
    nowTick = capturedAt;
    textFilter = '';
    typeFilter = '';
    activeStatuses.clear();
    sortTerms = [{ key: 'startTime', direction: 'desc' }];
    stage = 'snapshot';
    ageTimer = setInterval(() => (nowTick = Date.now()), 1000);
  };

  const handleSort = (key: SortKey, additive: boolean) => {
    sortTerms = nextSort(sortTerms, key, additive);
  };

  const toggleStatus = (status: string) => {
    if (activeStatuses.has(status)) activeStatuses.delete(status);
    else activeStatuses.add(status);
  };

  const closeDrawer = () => {
    clearTimers();
    confirmOpen = false;
    stage = 'prepare';
    loadedRows = [];
    loadedPages = [];
    open = false;
  };

  const requestClose = () => {
    if (stage === 'snapshot') {
      confirmOpen = true;
      return;
    }
    closeDrawer();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !open) return;
    // the confirmation owns Escape while it is up; the <dialog> closes itself
    if (confirmOpen) return;
    event.preventDefault();
    requestClose();
  };

  const exportCsv = () => {
    const header = 'Status,WorkflowId,RunId,Type,Start,End,TaskQueue';
    const body = view.rows
      .map((workflow) =>
        [
          workflow.status,
          workflow.workflowId,
          workflow.runId,
          workflow.type,
          formatTime(workflow.startTime),
          workflow.endTime === null ? '' : formatTime(workflow.endTime),
          workflow.taskQueue,
        ].join(','),
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow-snapshot.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  $effect(() => clearTimers);
</script>

<!-- capture phase: Holocene's Input stops keydown propagation, so a bubbling
listener never sees Escape pressed inside the snapshot's filter field -->
<svelte:window onkeydowncapture={handleKeydown} />

<Drawer
  {open}
  position="right"
  dark={false}
  closePadding={false}
  id="workflows-sort-sandbox-drawer"
  closeButtonLabel="Close sort sandbox"
  class="surface-secondary w-screen overflow-y-hidden sm:max-w-[1120px]"
  onClick={requestClose}
>
  <div class="flex h-full flex-col">
    <!-- structural signal that this is a different room, not the same list
    filtered: a hatched edge and a cooler surface than the page behind it -->
    <div class="hatch h-2 shrink-0 border-b border-subtle text-secondary"></div>

    <div class="shrink-0 border-b border-subtle px-6 py-4 pr-14">
      <h2 class="text-lg font-medium">Sort sandbox</h2>
      <p class="mt-1 max-w-prose text-xs text-secondary">
        {#if stage === 'snapshot'}
          You are sorting a snapshot held in this browser tab. The list behind
          this drawer has not changed and no new query has run.
        {:else}
          A separate workspace. Nothing in here changes the list behind it or
          re-runs your query.
        {/if}
      </p>
    </div>

    {#if stage === 'prepare'}
      <div class="min-h-0 flex-1 overflow-y-auto p-6">
        <div class="surface-primary max-w-3xl border border-subtle p-6">
          <p class="text-sm">
            The server can only order by <strong>Start</strong> and
            <strong>End</strong>. To sort by anything else — or by more than one
            column at once — the rows have to be in your browser first. This
            loads <strong>the filter you already have applied</strong>, so
            narrowing the list first is the cheapest way to make the snapshot
            smaller.
          </p>

          <dl
            class="mt-6 grid grid-cols-[minmax(0,180px)_1fr] gap-x-4 gap-y-3 text-sm"
          >
            <dt class="text-secondary">Loading your filter</dt>
            <dd>
              <div class="break-words font-mono text-xs">{queryLabel}</div>
              <div class="mt-1 text-xs text-secondary">
                Matching {describeQuery(query)}.
              </div>
            </dd>

            <dt class="text-secondary">Matching workflows</dt>
            <dd>{matchingCount.toLocaleString()}</dd>

            <dt class="text-secondary">Will load</dt>
            <dd>
              {willLoad.toLocaleString()}
              {#if capped}
                <span class="text-warning"
                  >— capped, {notLoaded.toLocaleString()} left behind</span
                >
              {:else}
                <span class="text-secondary">— all of them</span>
              {/if}
            </dd>

            <dt class="text-secondary">Request shape</dt>
            <dd class="font-mono text-xs">
              {pageCount}
              {pageCount === 1 ? 'page' : 'pages'} × {PAGE_SIZE} rows
            </dd>

            <dt class="text-secondary">Estimated time</dt>
            <dd>about {estimatedSeconds}s</dd>
          </dl>

          {#if !query.trim()}
            <Alert intent="info" title="No filters applied" class="mt-6">
              This will load the {LOAD_CAP.toLocaleString()} most recent workflows
              out of {TOTAL_MATCHING.toLocaleString()}, and the rest stay
              behind. Close this, filter the list down to what you actually care
              about, and reopen — the snapshot will be smaller, faster, and
              complete.
            </Alert>
          {:else if capped}
            <Alert
              intent="warning"
              title="Your filter is still too broad"
              class="mt-6"
            >
              {matchingCount.toLocaleString()} workflows match, and only {LOAD_CAP.toLocaleString()}
              can be loaded. Sorting will be accurate for what you load, but
              {notLoaded.toLocaleString()} matching workflows will not be in it. Narrow
              the filter to get a complete snapshot.
            </Alert>
          {:else}
            <Alert intent="success" title="Your filter fits" class="mt-6">
              All {matchingCount.toLocaleString()} matching workflows will be loaded,
              so the sort covers every row that matches — not just the first page.
            </Alert>
          {/if}

          {#if unsupportedTerms.length}
            <Alert
              intent="warning"
              title="Part of your query was ignored"
              class="mt-4"
            >
              This POC can't evaluate {unsupportedTerms.join(', ')} locally, so the
              snapshot may be broader than the list behind it.
            </Alert>
          {/if}

          <Alert
            intent="warning"
            title="It is discarded when you close"
            class="mt-4"
          >
            The snapshot is frozen when loading finishes and lives only in this
            browser tab. <strong>Closing the sandbox throws it away</strong> —
            coming back means loading all {willLoad.toLocaleString()} rows again,
            another
            {estimatedSeconds}s. Nothing is cached.
          </Alert>

          <div class="mt-6 flex flex-wrap gap-3">
            <Button onclick={startLoading}>
              Load {willLoad.toLocaleString()} workflows
            </Button>
            <Button variant="ghost" onclick={closeDrawer}>Cancel</Button>
          </div>
        </div>
      </div>
    {/if}

    {#if stage === 'loading'}
      <div class="min-h-0 flex-1 overflow-y-auto p-6">
        <div class="max-w-3xl">
          <div
            class="surface-subtle h-2 w-full overflow-hidden border border-subtle"
          >
            <div
              class="surface-interactive h-full transition-all duration-150"
              style="width: {(pagesFetched / pageCount) * 100}%"
            ></div>
          </div>

          <div class="mt-3 flex flex-wrap gap-6 text-sm">
            <span>
              <span class="text-secondary">Progress</span>
              <strong>
                Page {pagesFetched} of {pageCount} · {Math.min(
                  pagesFetched * PAGE_SIZE,
                  willLoad,
                ).toLocaleString()} rows
              </strong>
            </span>
            <span>
              <span class="text-secondary">Elapsed</span>
              <strong class="tabular-nums"
                >{(elapsedMs / 1000).toFixed(1)}s</strong
              >
            </span>
          </div>

          <div
            class="stream surface-primary mt-4 h-64 overflow-hidden border border-subtle"
          >
            {#each loadedPages as loadedPage (loadedPage.page)}
              <div
                class="flex items-baseline gap-3 border-b border-subtle px-3 py-2 text-xs"
              >
                <span class="w-16 shrink-0 font-medium"
                  >Page {loadedPage.page}</span
                >
                <span class="shrink-0 font-mono text-information">
                  {loadedPage.token}
                </span>
                <span class="truncate font-mono text-secondary">
                  last: {loadedPage.lastRow}
                </span>
              </div>
            {/each}
          </div>

          <p class="mt-3 max-w-prose text-xs text-secondary">
            Pages are fetched one after another because each response carries
            the token for the next one. They cannot be requested in parallel.
          </p>

          <div class="mt-6">
            <Button variant="secondary" onclick={resetToPrepare}>
              Stop loading
            </Button>
          </div>
        </div>
      </div>
    {/if}

    {#if stage === 'snapshot'}
      <div
        class="surface-primary flex shrink-0 flex-wrap items-center gap-3 border-b border-subtle px-6 py-3"
      >
        <span
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-subtle"
        >
          <Icon name="pause" />
        </span>
        <span class="font-medium">
          {loadedRows.length.toLocaleString()} of {matchingCount.toLocaleString()}
          matching
        </span>
        <span
          class="text-xs {ageSeconds > STALE_AFTER_SECONDS
            ? 'font-medium text-warning'
            : 'text-secondary'}"
        >
          captured {new Date(capturedAt).toLocaleTimeString()} · {ageLabel}
        </span>
        {#if capped}
          <span
            class="rounded-sm border border-warning bg-warning px-2 py-0.5 text-xs font-medium text-warning"
          >
            Capped — {notLoaded.toLocaleString()} not loaded
          </span>
        {/if}
        <span class="grow"></span>
        <Button size="xs" variant="secondary" onclick={resetToPrepare}>
          Reload
        </Button>
      </div>

      <div
        class="flex shrink-0 flex-wrap items-center gap-2 border-b border-subtle px-6 py-2 text-xs"
      >
        <span class="text-secondary">Snapshot of</span>
        <span class="font-mono">{capturedQuery.trim() || 'all workflows'}</span>
        {#if queryDrifted}
          <span
            class="rounded-sm border border-warning bg-warning px-2 py-0.5 font-medium text-warning"
          >
            The list behind this drawer has been re-filtered — this snapshot
            still holds the old filter
          </span>
          <Button size="xs" variant="secondary" onclick={resetToPrepare}>
            Load the new filter
          </Button>
        {/if}
      </div>

      <div
        class="flex shrink-0 flex-wrap items-center gap-2 border-b border-subtle px-6 py-3"
      >
        <Input
          id="sort-sandbox-filter"
          bind:value={textFilter}
          label="Filter loaded rows"
          labelHidden
          placeholder="Filter loaded rows…"
          icon="search"
          clearable
          clearButtonLabel="Clear filter"
          onClear={() => (textFilter = '')}
          class="w-56"
        />
        {#each FACET_STATUSES as status (status)}
          <Button
            size="xs"
            variant={activeStatuses.has(status) ? 'primary' : 'secondary'}
            aria-pressed={activeStatuses.has(status)}
            onclick={() => toggleStatus(status)}
          >
            {status}
          </Button>
        {/each}
        <SimpleSelect
          id="sort-sandbox-type"
          bind:value={typeFilter}
          label="Workflow type"
          class="h-8 w-52 text-sm"
        >
          <option value="">All types</option>
          {#each WORKFLOW_TYPES as workflowType (workflowType)}
            <option value={workflowType}>{workflowType}</option>
          {/each}
        </SimpleSelect>
        <Button
          size="xs"
          variant="secondary"
          leadingIcon="download"
          onclick={exportCsv}
        >
          Export CSV
        </Button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col px-6 pt-4">
        <SnapshotGrid
          rows={view.rows}
          {sortTerms}
          onSort={handleSort}
          {formatTime}
        />
      </div>

      <div
        class="flex shrink-0 flex-wrap items-center gap-4 px-6 py-3 text-xs text-secondary"
      >
        <span>
          Showing {view.rows.length.toLocaleString()} of {loadedRows.length.toLocaleString()}
          loaded · sorted in {view.durationMs < 1
            ? '<1'
            : Math.round(view.durationMs)}ms
        </span>
        <span>{describeSort(sortTerms)}</span>
        <span class="ml-auto">
          Shift-click a header to add a tiebreaker (up to {MAX_SORT_TERMS})
        </span>
      </div>
    {/if}
  </div>

  <Modal
    id="sort-sandbox-discard-modal"
    bind:open={confirmOpen}
    confirmText="Discard and close"
    confirmType="destructive"
    cancelText="Keep sorting"
    onConfirmModal={closeDrawer}
  >
    {#snippet titleSnippet()}
      Discard this snapshot?
    {/snippet}
    {#snippet content()}
      <p class="text-sm">
        These {loadedRows.length.toLocaleString()} rows exist only in this browser
        tab. Nothing is cached, so closing throws them away and coming back means
        loading all {willLoad.toLocaleString()} again — about {estimatedSeconds}s.
      </p>
      <p class="mt-3 text-sm text-secondary">
        Your sort and filters inside the sandbox are discarded too. The list
        behind this drawer is unaffected either way.
      </p>
    {/snippet}
  </Modal>
</Drawer>

<style lang="postcss">
  .hatch {
    background-image: repeating-linear-gradient(
      -45deg,
      currentcolor 0 4px,
      transparent 4px 9px
    );
    opacity: 0.45;
  }

  .stream {
    mask-image: linear-gradient(
      to bottom,
      black 0%,
      black 62%,
      transparent 100%
    );
  }
</style>
