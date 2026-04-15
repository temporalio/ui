<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';

  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { toEventHistory } from '$lib/models/event-history';
  import { getGroupLLMMetadata } from '$lib/models/event-history/get-event-llm-metadata';
  import { fetchRawEvents } from '$lib/services/events-service';
  import { fetchAllWorkflows } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import {
    computeSessionSummary,
    type SessionSummary,
  } from '$lib/utilities/session-runs';

  let {
    namespace,
    workflowId,
  }: {
    namespace: string;
    workflowId: string;
  } = $props();

  const TRUNCATE_LIMIT = 400;

  type TreeNode = {
    key: string;
    activityName: string;
    kind: 'activity' | 'child-workflow' | 'timer' | 'signal' | 'other';
    durationMs: number;
    input: string;
    llmBlock: Record<string, unknown> | null;
    otherFields: Record<string, unknown> | null;
    isLLM: boolean;
    // Child workflow info for lazy loading
    childWorkflowId?: string;
    childRunId?: string;
    childNamespace?: string;
  };

  type SessionRunData = {
    runId: string;
    status: string;
    startTime: string;
    endTime: string;
    nodes: TreeNode[];
  };

  let loading = $state(true);
  let error = $state('');
  let runs: SessionRunData[] = $state([]);
  let summary: SessionSummary | null = $state(null);
  let expanded: Record<string, boolean> = $state({});
  let expandedText: Record<string, boolean> = $state({});
  // Lazy-loaded child workflow nodes
  let childNodes: Record<string, TreeNode[]> = $state({});
  let childLoading: Record<string, boolean> = $state({});

  // --- Payload helpers ---

  const decodeAllPayloads = (payloads: unknown): string => {
    if (
      payloads &&
      typeof payloads === 'object' &&
      'payloads' in payloads &&
      Array.isArray((payloads as Record<string, unknown>).payloads)
    ) {
      const arr = (payloads as Record<string, unknown>).payloads as unknown[];
      if (arr.length === 0) return '';
      if (arr.length === 1) {
        const decoded = decodePayload(arr[0]);
        if (typeof decoded === 'string') return decoded;
        if (decoded && typeof decoded === 'object')
          return JSON.stringify(decoded, null, 2);
        return String(decoded ?? '');
      }
      // Multiple arguments - decode all and show as array
      const decoded = arr.map((p) => {
        const d = decodePayload(p);
        return d;
      });
      return JSON.stringify(decoded, null, 2);
    }
    if (typeof payloads === 'string') return payloads;
    if (payloads && typeof payloads === 'object')
      return JSON.stringify(payloads, null, 2);
    return String(payloads ?? '');
  };

  type DecodedResult = {
    llmBlock: Record<string, unknown> | null;
    otherFields: Record<string, unknown> | null;
  };

  const decodeResultPayload = (result: unknown): DecodedResult => {
    let decoded: unknown = result;
    if (
      result &&
      typeof result === 'object' &&
      'payloads' in result &&
      Array.isArray((result as Record<string, unknown>).payloads)
    ) {
      decoded = decodePayload((result as Record<string, unknown>).payloads[0]);
    }

    if (decoded && typeof decoded === 'object') {
      const obj = decoded as Record<string, unknown>;
      if (obj._details && typeof obj._details === 'object') {
        const llmData = obj._details as Record<string, unknown>;
        const llmBlock: Record<string, unknown> = {};
        if ('result' in obj) llmBlock.result = obj.result;
        Object.assign(llmBlock, llmData);
        const other: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (k !== '_details' && k !== 'result') other[k] = v;
        }
        return {
          llmBlock,
          otherFields: Object.keys(other).length > 0 ? other : null,
        };
      }
      return { llmBlock: null, otherFields: obj };
    }
    if (decoded)
      return { llmBlock: null, otherFields: { result: String(decoded) } };
    return { llmBlock: null, otherFields: null };
  };

  // --- Build tree node from event group ---

  const buildNode = (group: EventGroup, key: string): TreeNode => {
    const llmMetadata = getGroupLLMMetadata(group);
    const activityName = group.displayName || group.name || group.label;
    const category = group.category;

    // Determine kind
    let kind: TreeNode['kind'] = 'other';
    if (category === 'activity' || category === 'local-activity')
      kind = 'activity';
    else if (category === 'child-workflow') kind = 'child-workflow';
    else if (category === 'timer') kind = 'timer';
    else if (category === 'signal') kind = 'signal';

    // Timestamps
    const firstEvent = group.initialEvent;
    const lastEvent = group.lastEvent;
    const startTime = firstEvent?.eventTime || firstEvent?.timestamp || '';
    const endTime = lastEvent?.eventTime || lastEvent?.timestamp || '';
    const durationMs =
      startTime && endTime
        ? new Date(endTime).getTime() - new Date(startTime).getTime()
        : 0;

    // Input
    const scheduledEvent = group.eventList.find(
      (e) =>
        e.eventType === 'ActivityTaskScheduled' ||
        e.eventType === 'StartChildWorkflowExecutionInitiated',
    );
    const input = scheduledEvent?.attributes?.input
      ? decodeAllPayloads(scheduledEvent.attributes.input)
      : '';

    // Output
    const completedEvent = group.eventList.find(
      (e) =>
        e.eventType === 'ActivityTaskCompleted' ||
        e.eventType === 'ChildWorkflowExecutionCompleted',
    );
    const { llmBlock, otherFields } = completedEvent?.attributes?.result
      ? decodeResultPayload(completedEvent.attributes.result)
      : { llmBlock: null, otherFields: null };

    // Child workflow info
    let childWorkflowId: string | undefined;
    let childRunId: string | undefined;
    if (kind === 'child-workflow') {
      const startedEvent = group.eventList.find(
        (e) => e.eventType === 'ChildWorkflowExecutionStarted',
      );
      const attrs = startedEvent?.attributes as
        | Record<string, unknown>
        | undefined;
      const exec = attrs?.workflowExecution as
        | Record<string, string>
        | undefined;
      childWorkflowId = exec?.workflowId;
      childRunId = exec?.runId;
    }

    return {
      key,
      activityName,
      kind,
      durationMs,
      input,
      llmBlock,
      otherFields,
      isLLM: !!llmMetadata,
      childWorkflowId,
      childRunId,
    };
  };

  // --- Load child workflow ---

  const loadChildWorkflow = async (node: TreeNode) => {
    if (!node.childWorkflowId || !node.childRunId) return;
    childLoading[node.key] = true;
    try {
      const rawEvents = await fetchRawEvents({
        namespace,
        workflowId: node.childWorkflowId,
        runId: node.childRunId,
        sort: 'ascending',
      });
      const events = toEventHistory(rawEvents);
      const groups = groupEvents(events).filter(
        (g) =>
          g.category === 'activity' ||
          g.category === 'local-activity' ||
          g.category === 'child-workflow',
      );
      childNodes[node.key] = groups.map((g, i) =>
        buildNode(g, `${node.key}-${i}`),
      );
    } catch {
      childNodes[node.key] = [];
    } finally {
      childLoading[node.key] = false;
    }
  };

  // --- Load session ---

  const loadSession = async () => {
    loading = true;
    error = '';
    try {
      const response = await fetchAllWorkflows(namespace, {
        query: `WorkflowId="${workflowId}"`,
      });
      const executions: WorkflowExecution[] = response.workflows ?? [];
      executions.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

      const sessionRuns: SessionRunData[] = [];
      for (const exec of executions) {
        const rawEvents = await fetchRawEvents({
          namespace,
          workflowId: exec.id,
          runId: exec.runId,
          sort: 'ascending',
        });
        const events = toEventHistory(rawEvents);
        const groups = groupEvents(events).filter(
          (g) =>
            g.category === 'activity' ||
            g.category === 'local-activity' ||
            g.category === 'child-workflow',
        );
        const runKey = `run-${exec.runId}`;
        sessionRuns.push({
          runId: exec.runId,
          status: exec.status,
          startTime: exec.startTime,
          endTime: exec.endTime,
          nodes: groups.map((g, i) => buildNode(g, `${runKey}-${i}`)),
        });
      }

      runs = sessionRuns;

      // Expand all runs by default
      for (const r of sessionRuns) {
        expanded[r.runId] = true;
      }

      // Summary
      const summaryRuns = sessionRuns.map((r) => {
        const steps = r.nodes
          .filter((n) => n.kind === 'activity')
          .map((n) => ({
            activityName: n.activityName,
            totalTokens: n.llmBlock
              ? (n.llmBlock.totalTokens as number)
              : undefined,
            durationMs: n.durationMs,
            output: '',
            llmMetadata: n.isLLM ? { cost: n.llmBlock?.cost as number } : null,
          }));
        return {
          runId: r.runId,
          status: r.status,
          startTime: r.startTime,
          endTime: r.endTime,
          steps,
        };
      });
      summary = computeSessionSummary(workflowId, summaryRuns);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load session data';
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    if (workflowId) loadSession();
  });

  const formatMs = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60_000).toFixed(1)}m`;
  };

  const formatTime = (iso: string): string =>
    new Date(iso).toLocaleTimeString();

  const goBack = () => goto(`/namespaces/${namespace}/workflows`);

  const toggleExpand = (key: string, node?: TreeNode) => {
    expanded[key] = !expanded[key];
    // Lazy load child workflow on first expand
    if (
      expanded[key] &&
      node?.kind === 'child-workflow' &&
      !childNodes[key] &&
      !childLoading[key]
    ) {
      loadChildWorkflow(node);
    }
  };

  const toggleText = (key: string) => {
    expandedText[key] = !expandedText[key];
  };

  let viewMode: 'tree' | 'chat' = $state('tree');
  const hasLLM = $derived(runs.some((r) => r.nodes.some((n) => n.isLLM)));
</script>

<div class="flex flex-col gap-4 p-4">
  <div class="flex items-center gap-4">
    <Button variant="ghost" on:click={goBack}>Back to Workflows</Button>
    <h1 class="text-xl font-semibold">Session View</h1>
  </div>

  <div class="rounded border border-subtle p-3">
    <p class="text-xs font-medium text-secondary/60">Workflow ID (Session)</p>
    <p class="font-mono text-sm font-medium">{workflowId}</p>
  </div>

  {#if error}
    <div
      class="rounded border border-red-500 bg-red-500/10 p-3 text-sm text-red-500"
    >
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <p class="text-sm text-secondary">Loading session...</p>
    </div>
  {:else}
    {#if summary}
      <div
        class="flex flex-wrap items-center gap-6 rounded border border-subtle bg-interactive-table-hover p-4 text-sm"
        data-testid="session-summary"
      >
        <div>
          <span class="text-secondary/80">Runs:</span>
          <span class="font-medium">{summary.totalRuns}</span>
        </div>
        <div>
          <span class="text-secondary/80">Total Tokens:</span>
          <span class="font-medium">{summary.totalTokens.toLocaleString()}</span
          >
        </div>
        {#if summary.totalCost > 0}
          <div>
            <span class="text-secondary/80">Total Cost:</span>
            <span class="font-medium">${summary.totalCost.toFixed(3)}</span>
          </div>
        {/if}
        <div>
          <span class="text-secondary/80">Models:</span>
          {#each summary.modelsUsed as model}<Badge type="subtle" class="ml-1"
              >{model}</Badge
            >{/each}
        </div>
      </div>
    {/if}

    <!-- View toggle -->
    {#if hasLLM}
      <div class="flex w-fit gap-1 rounded border border-subtle p-0.5">
        <button
          class="rounded px-3 py-1 text-xs font-medium transition-colors {viewMode ===
          'tree'
            ? 'bg-interactive-secondary-active text-primary'
            : 'text-secondary/60 hover:text-secondary'}"
          onclick={() => (viewMode = 'tree')}
        >
          Tree
        </button>
        <button
          class="rounded px-3 py-1 text-xs font-medium transition-colors {viewMode ===
          'chat'
            ? 'bg-interactive-secondary-active text-primary'
            : 'text-secondary/60 hover:text-secondary'}"
          onclick={() => (viewMode = 'chat')}
        >
          Chat
        </button>
      </div>
    {/if}

    {#if viewMode === 'chat' && hasLLM}
      <!-- Chat view -->
      <div class="flex w-full flex-col gap-3" data-testid="session-chat">
        {#each runs as run, runIdx}
          <!-- Run divider -->
          <div class="flex items-center gap-3 py-2">
            <div class="h-px flex-1 bg-subtle"></div>
            <span class="text-xs font-medium text-secondary/60"
              >Run {runIdx + 1} of {runs.length}</span
            >
            <Badge
              type={run.status === 'Completed' ? 'subtle' : 'warning'}
              class="w-fit">{run.status}</Badge
            >
            <span class="text-xs text-secondary/40"
              >{formatTime(run.startTime)}</span
            >
            <div class="h-px flex-1 bg-subtle"></div>
          </div>

          {#each run.nodes as node}
            {#if node.isLLM}
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2 px-1">
                  <span class="text-xs font-medium text-secondary/60"
                    >{node.activityName}</span
                  >
                </div>

                <!-- Activity input - left aligned, shown as raw payload -->
                {#if node.input}
                  <div class="flex justify-start">
                    <div
                      class="bg-surface-primary max-w-[80%] rounded-2xl rounded-bl-sm border border-subtle px-4 py-2.5"
                    >
                      <p class="text-xs font-medium text-secondary/40">
                        Activity Input
                      </p>
                      <pre
                        class="mt-1 whitespace-pre-wrap break-words text-xs text-secondary/70">{node
                          .input.length > TRUNCATE_LIMIT
                          ? node.input.slice(0, TRUNCATE_LIMIT) + '...'
                          : node.input}</pre>
                    </div>
                  </div>
                {/if}

                <!-- _details output - right aligned -->
                {#if node.llmBlock}
                  {@const resultText = node.llmBlock.result
                    ? String(node.llmBlock.result)
                    : ''}
                  {@const meta = Object.fromEntries(
                    Object.entries(node.llmBlock).filter(
                      ([k]) => k !== 'result',
                    ),
                  )}
                  {@const hasMeta = Object.keys(meta).length > 0}
                  <div class="flex justify-end">
                    <div
                      class="max-w-[80%] rounded-2xl rounded-br-sm bg-interactive-secondary-active px-4 py-2.5"
                    >
                      <p class="text-xs font-medium text-secondary/40">
                        _details
                      </p>
                      {#if resultText}
                        <pre
                          class="mt-1 whitespace-pre-wrap break-words text-sm">{resultText.length >
                          TRUNCATE_LIMIT
                            ? resultText.slice(0, TRUNCATE_LIMIT) + '...'
                            : resultText}</pre>
                      {/if}
                      {#if hasMeta}
                        <div
                          class="mt-2 flex flex-wrap items-center gap-3 border-t border-white/10 pt-2"
                        >
                          {#each Object.entries(meta) as [k, v]}
                            <span class="text-[10px]"
                              ><span class="text-secondary/40">{k}</span>
                              <span class="font-medium text-secondary/70"
                                >{v}</span
                              ></span
                            >
                          {/each}
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <!-- Non-LLM: centered system message -->
              <div class="flex justify-center">
                <div
                  class="flex items-center gap-2 rounded-full bg-interactive-table-hover px-3 py-1"
                >
                  <span class="text-xs text-secondary/60"
                    >{node.activityName}</span
                  >
                  {#if node.otherFields}
                    <span class="max-w-xs truncate text-xs text-secondary/40"
                      >{JSON.stringify(node.otherFields).slice(0, 80)}</span
                    >
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
        {/each}
      </div>
    {:else}
      <!-- File tree -->
      <div class="font-mono text-sm" data-testid="session-tree">
        {#each runs as run, runIdx}
          <!-- Run root -->
          <div
            class="flex cursor-pointer select-none items-center gap-1 rounded px-2 py-1.5 hover:bg-interactive-table-hover"
            onclick={() => toggleExpand(run.runId)}
          >
            <span class="w-4 text-center text-secondary/40"
              >{expanded[run.runId] === false ? '>' : 'v'}</span
            >
            <svg
              class="h-4 w-4 text-secondary/50"
              viewBox="0 0 16 16"
              fill="currentColor"
              ><path
                d="M1 3.5A1.5 1.5 0 012.5 2h3.879a1.5 1.5 0 011.06.44l1.122 1.12A1.5 1.5 0 009.62 4H13.5A1.5 1.5 0 0115 5.5v7a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.5v-9z"
              /></svg
            >
            <span class="font-medium">Run {runIdx + 1}</span>
            <Badge
              type={run.status === 'Completed' ? 'subtle' : 'warning'}
              class="ml-1 text-[10px]">{run.status}</Badge
            >
            <span class="ml-auto text-xs text-secondary/40"
              >{formatTime(run.startTime)}</span
            >
          </div>

          {#if expanded[run.runId] !== false}
            {#each run.nodes as node, nodeIdx}
              {@const isLast = nodeIdx === run.nodes.length - 1}
              {@const treeChar = isLast ? '└' : '├'}
              {@const isOpen = expanded[node.key]}

              <!-- Tree row -->
              <div class="flex flex-col">
                <div
                  class="flex cursor-pointer select-none items-center gap-1 rounded py-1 pl-6 pr-2 hover:bg-interactive-table-hover"
                  onclick={() => toggleExpand(node.key, node)}
                >
                  <!-- Tree connector -->
                  <span class="w-5 text-center text-secondary/20"
                    >{treeChar}─</span
                  >

                  <!-- Icon -->
                  {#if node.kind === 'child-workflow'}
                    <svg
                      class="h-3.5 w-3.5 text-information"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      ><path
                        d="M2 3.5A1.5 1.5 0 013.5 2h2.379a1.5 1.5 0 011.06.44l.622.62a1.5 1.5 0 001.06.44H12.5A1.5 1.5 0 0114 5v7.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9z"
                      />{#if isOpen}<path
                          d="M5 8h6"
                          stroke-linecap="round"
                        />{:else}<path
                          d="M8 5.5v5M5.5 8h5"
                          stroke-linecap="round"
                        />{/if}</svg
                    >
                  {:else if node.isLLM}
                    <svg
                      class="h-3.5 w-3.5 text-green-500"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      ><circle cx="8" cy="8" r="3" /><path
                        d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12"
                        stroke-linecap="round"
                      /></svg
                    >
                  {:else}
                    <svg
                      class="h-3.5 w-3.5 text-secondary/40"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      ><circle cx="8" cy="8" r="2.5" /><path
                        d="M8 2v2.5M8 11.5V14"
                        stroke-linecap="round"
                      /></svg
                    >
                  {/if}

                  <!-- Name -->
                  <span class="font-medium">{node.activityName}</span>

                  <!-- Badges -->
                  {#if node.isLLM}
                    <Badge type="subtle" class="ml-1 text-[10px]"
                      >_details</Badge
                    >
                  {/if}
                  {#if node.kind === 'child-workflow'}
                    <Badge type="primary" class="ml-1 text-[10px]"
                      >child workflow</Badge
                    >
                  {/if}

                  <!-- Duration -->
                  {#if node.durationMs > 0}
                    <span class="ml-auto text-xs text-secondary/30"
                      >{formatMs(node.durationMs)}</span
                    >
                  {/if}
                </div>

                <!-- Expanded content -->
                {#if isOpen}
                  <div
                    class="mb-2 ml-[52px] flex flex-col gap-2 border-l border-secondary/10 pl-4"
                  >
                    <!-- Input -->
                    {#if node.input}
                      <div>
                        <p
                          class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                        >
                          Input
                        </p>
                        <div
                          class="bg-surface-primary mt-1 rounded border border-subtle px-3 py-2"
                        >
                          {#if node.input.length > TRUNCATE_LIMIT && !expandedText[`${node.key}-in`]}
                            <pre
                              class="whitespace-pre-wrap break-words text-xs">{node.input.slice(
                                0,
                                TRUNCATE_LIMIT,
                              )}...</pre>
                            <button
                              class="mt-1 text-xs text-information hover:underline"
                              onclick={() => toggleText(`${node.key}-in`)}
                              >Show more</button
                            >
                          {:else}
                            <pre
                              class="whitespace-pre-wrap break-words text-xs">{node.input}</pre>
                            {#if node.input.length > TRUNCATE_LIMIT}
                              <button
                                class="mt-1 text-xs text-information hover:underline"
                                onclick={() => toggleText(`${node.key}-in`)}
                                >Show less</button
                              >
                            {/if}
                          {/if}
                        </div>
                      </div>
                    {/if}

                    <!-- _details output -->
                    {#if node.llmBlock}
                      {@const resultText = node.llmBlock.result
                        ? String(node.llmBlock.result)
                        : ''}
                      {@const meta = Object.fromEntries(
                        Object.entries(node.llmBlock).filter(
                          ([k]) => k !== 'result',
                        ),
                      )}
                      {@const hasMeta = Object.keys(meta).length > 0}
                      <div>
                        <p
                          class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                        >
                          _details
                        </p>
                        <div
                          class="mt-1 rounded bg-interactive-secondary-active px-3 py-2"
                        >
                          {#if resultText}
                            {#if resultText.length > TRUNCATE_LIMIT && !expandedText[`${node.key}-llm`]}
                              <pre
                                class="whitespace-pre-wrap break-words text-xs">{resultText.slice(
                                  0,
                                  TRUNCATE_LIMIT,
                                )}...</pre>
                              <button
                                class="mt-1 text-xs text-information hover:underline"
                                onclick={() => toggleText(`${node.key}-llm`)}
                                >Show more</button
                              >
                            {:else}
                              <pre
                                class="whitespace-pre-wrap break-words text-xs">{resultText}</pre>
                              {#if resultText.length > TRUNCATE_LIMIT}
                                <button
                                  class="mt-1 text-xs text-information hover:underline"
                                  onclick={() => toggleText(`${node.key}-llm`)}
                                  >Show less</button
                                >
                              {/if}
                            {/if}
                          {/if}
                          {#if hasMeta}
                            <div
                              class="mt-2 flex flex-wrap gap-3 border-t border-white/10 pt-2"
                            >
                              {#each Object.entries(meta) as [k, v]}
                                <span class="text-[10px]"
                                  ><span class="text-secondary/40">{k}</span>
                                  <span class="font-medium text-secondary/70"
                                    >{v}</span
                                  ></span
                                >
                              {/each}
                            </div>
                          {/if}
                        </div>
                      </div>
                    {/if}

                    <!-- Non-LLM output -->
                    {#if node.otherFields}
                      <div>
                        <p
                          class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                        >
                          Output
                        </p>
                        <div
                          class="mt-1 rounded border border-subtle bg-code-block px-3 py-2"
                        >
                          <pre
                            class="whitespace-pre-wrap break-words text-xs text-secondary/70">{JSON.stringify(
                              node.otherFields,
                              null,
                              2,
                            )}</pre>
                        </div>
                      </div>
                    {/if}

                    <!-- Child workflow: lazy loaded sub-tree -->
                    {#if node.kind === 'child-workflow'}
                      {#if childLoading[node.key]}
                        <p class="text-xs text-secondary/40">
                          Loading child workflow...
                        </p>
                      {:else if childNodes[node.key]}
                        {#each childNodes[node.key] as child, childIdx}
                          {@const childIsLast =
                            childIdx === childNodes[node.key].length - 1}
                          {@const childTreeChar = childIsLast ? '└' : '├'}
                          <div
                            class="flex cursor-pointer select-none items-center gap-1 rounded py-1 hover:bg-interactive-table-hover"
                            onclick={() => toggleExpand(child.key, child)}
                          >
                            <span class="w-5 text-center text-secondary/20"
                              >{childTreeChar}\u2500</span
                            >
                            {#if child.kind === 'child-workflow'}
                              <svg
                                class="h-3.5 w-3.5 text-information"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                ><path
                                  d="M2 3.5A1.5 1.5 0 013.5 2h2.379a1.5 1.5 0 011.06.44l.622.62a1.5 1.5 0 001.06.44H12.5A1.5 1.5 0 0114 5v7.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9z"
                                /></svg
                              >
                            {:else if child.isLLM}
                              <svg
                                class="h-3.5 w-3.5 text-green-500"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                ><circle cx="8" cy="8" r="3" /><path
                                  d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12"
                                  stroke-linecap="round"
                                /></svg
                              >
                            {:else}
                              <svg
                                class="h-3.5 w-3.5 text-secondary/40"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                ><circle cx="8" cy="8" r="2.5" /><path
                                  d="M8 2v2.5M8 11.5V14"
                                  stroke-linecap="round"
                                /></svg
                              >
                            {/if}
                            <span class="font-medium">{child.activityName}</span
                            >
                            {#if child.isLLM}<Badge
                                type="subtle"
                                class="ml-1 text-[10px]">_details</Badge
                              >{/if}
                            {#if child.kind === 'child-workflow'}<Badge
                                type="primary"
                                class="ml-1 text-[10px]">child workflow</Badge
                              >{/if}
                            {#if child.durationMs > 0}<span
                                class="ml-auto text-xs text-secondary/30"
                                >{formatMs(child.durationMs)}</span
                              >{/if}
                          </div>
                          {#if expanded[child.key]}
                            <div
                              class="mb-2 ml-6 flex flex-col gap-2 border-l border-secondary/10 pl-4"
                            >
                              {#if child.input}
                                <div>
                                  <p
                                    class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                                  >
                                    Input
                                  </p>
                                  <div
                                    class="bg-surface-primary mt-1 rounded border border-subtle px-3 py-2"
                                  >
                                    <pre
                                      class="whitespace-pre-wrap break-words text-xs">{child.input}</pre>
                                  </div>
                                </div>
                              {/if}
                              {#if child.llmBlock}
                                {@const cResultText = child.llmBlock.result
                                  ? String(child.llmBlock.result)
                                  : ''}
                                {@const cMeta = Object.fromEntries(
                                  Object.entries(child.llmBlock).filter(
                                    ([k]) => k !== 'result',
                                  ),
                                )}
                                <div>
                                  <p
                                    class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                                  >
                                    _details
                                  </p>
                                  <div
                                    class="mt-1 rounded bg-interactive-secondary-active px-3 py-2"
                                  >
                                    {#if cResultText}<pre
                                        class="whitespace-pre-wrap break-words text-xs">{cResultText}</pre>{/if}
                                    {#if Object.keys(cMeta).length > 0}
                                      <div
                                        class="mt-2 flex flex-wrap gap-3 border-t border-white/10 pt-2"
                                      >
                                        {#each Object.entries(cMeta) as [k, v]}
                                          <span class="text-[10px]"
                                            ><span class="text-secondary/40"
                                              >{k}</span
                                            >
                                            <span
                                              class="font-medium text-secondary/70"
                                              >{v}</span
                                            ></span
                                          >
                                        {/each}
                                      </div>
                                    {/if}
                                  </div>
                                </div>
                              {/if}
                              {#if child.otherFields}
                                <div>
                                  <p
                                    class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                                  >
                                    Output
                                  </p>
                                  <div
                                    class="mt-1 rounded border border-subtle bg-code-block px-3 py-2"
                                  >
                                    <pre
                                      class="whitespace-pre-wrap break-words text-xs text-secondary/70">{JSON.stringify(
                                        child.otherFields,
                                        null,
                                        2,
                                      )}</pre>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          {/if}
                        {/each}
                      {:else if node.childWorkflowId}
                        <p class="text-xs text-secondary/40">
                          Click to load child workflow
                        </p>
                      {/if}
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}

            <!-- Continuation line for non-last runs -->
            {#if runIdx < runs.length - 1}
              <div
                class="ml-2 h-4 border-l border-dashed border-secondary/15"
              ></div>
            {/if}
          {/if}
        {/each}
      </div>
    {/if}

    {#if runs.length === 0}
      <p class="py-8 text-center text-sm text-secondary">
        No executions found for workflow ID "{workflowId}".
      </p>
    {/if}
  {/if}
</div>
